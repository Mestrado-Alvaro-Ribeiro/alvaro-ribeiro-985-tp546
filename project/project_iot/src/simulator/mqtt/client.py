"""Paho MQTT v2 transport with reconnection, status and bounded commands."""

import json
import logging
import queue
import threading

import paho.mqtt.client as mqtt
from pydantic import ValidationError

from common.config import Settings
from common.models import Scenario, ScenarioCommand

logger = logging.getLogger(__name__)


class MQTTClient:
    """Publish current snapshots and receive transient scenario commands."""

    def __init__(self, settings: Settings):
        """Configure a client without connecting to the broker.

        Args:
            settings: Broker, credentials, topic and device configuration.
        """
        self.settings = settings
        self.connected = threading.Event()
        self._commands: queue.Queue[Scenario] = queue.Queue(maxsize=1)
        self._started = False
        self._client = mqtt.Client(
            mqtt.CallbackAPIVersion.VERSION2,
            client_id=f"simulator-{settings.device_id}",
            protocol=mqtt.MQTTv311,
            clean_session=True,
        )
        self._client.max_queued_messages_set(10)
        self._client.reconnect_delay_set(min_delay=1, max_delay=15)
        self._client.will_set(settings.topic("status"), self._status("offline"), qos=1, retain=True)
        if settings.mqtt_username:
            password = settings.mqtt_password.get_secret_value() if settings.mqtt_password else None
            self._client.username_pw_set(settings.mqtt_username, password)
        if settings.mqtt_tls:
            self._client.tls_set(ca_certs=settings.mqtt_ca_file)
        self._client.on_connect = self._on_connect
        self._client.on_disconnect = self._on_disconnect
        self._client.on_connect_fail = self._on_connect_fail
        self._client.on_message = self._on_message

    def _status(self, state: str) -> str:
        return json.dumps(
            {
                "schema_version": "1.0",
                "device_id": self.settings.device_id,
                "source": "simulator",
                "state": state,
            }
        )

    def _on_connect(self, client, userdata, flags, reason_code, properties):
        if reason_code.is_failure:
            logger.error("mqtt_connection_rejected", extra={"reason": str(reason_code)})
            return
        # Clean sessions require resubscribing after every successful connection.
        client.subscribe(self.settings.topic("commands"), qos=1)
        client.publish(self.settings.topic("status"), self._status("online"), qos=1, retain=True)
        self.connected.set()
        logger.info("mqtt_connected", extra={"device_id": self.settings.device_id})

    def _on_disconnect(self, client, userdata, flags, reason_code, properties):
        self.connected.clear()
        logger.warning("mqtt_disconnected", extra={"reason": str(reason_code)})

    def _on_connect_fail(self, client, userdata):
        logger.warning("mqtt_connect_failed_retrying")

    def _on_message(self, client, userdata, message):
        self.handle_message(message)

    def handle_message(self, message: mqtt.MQTTMessage) -> None:
        """Validate a command and keep only the most recent valid request.

        Args:
            message: Incoming MQTT message. Retained deliveries are ignored.
        """
        if message.topic != self.settings.topic("commands") or message.retain:
            return
        if len(message.payload) > 1024:
            logger.warning("mqtt_command_too_large")
            return
        try:
            command = ScenarioCommand.model_validate_json(message.payload)
        except (ValidationError, ValueError):
            logger.warning("mqtt_command_invalid")
            return
        try:
            self._commands.get_nowait()
        except queue.Empty:
            pass
        self._commands.put_nowait(command.scenario)

    def take_scenario(self) -> Scenario | None:
        """Consume the latest pending scenario command.

        Returns:
            A scenario, or None when no command is pending.
        """
        try:
            return self._commands.get_nowait()
        except queue.Empty:
            return None

    def start(self) -> None:
        """Start networking with automatic retry, including initial connection failure."""
        if self._started:
            return
        self._client.connect_async(
            self.settings.mqtt_host, self.settings.mqtt_port, keepalive=self.settings.mqtt_keepalive
        )
        self._client.loop_start()
        self._started = True

    def publish(self, kind: str, payload: str) -> bool:
        """Publish a retained QoS 1 snapshot, waiting briefly for acknowledgement.

        Args:
            kind: Topic suffix for the snapshot.
            payload: Serialized JSON message.

        Returns:
            True if the broker acknowledged the message, otherwise False.
        """
        if not self.connected.is_set():
            return False
        try:
            info = self._client.publish(self.settings.topic(kind), payload, qos=1, retain=True)
            if info.rc != mqtt.MQTT_ERR_SUCCESS:
                return False
            info.wait_for_publish(timeout=2)
            return info.is_published()
        except (RuntimeError, ValueError, OSError):
            logger.warning("mqtt_publish_failed")
            return False

    def stop(self) -> None:
        """Publish offline status and stop the network thread when running."""
        if not self._started:
            return
        self.publish("status", self._status("offline"))
        self._client.disconnect()
        self._client.loop_stop()
        self.connected.clear()
        self._started = False
