"""Console entry point for the Smart Environment room simulator."""

import logging
import signal
import threading
import time

from pydantic import ValidationError

from common.config import Settings
from common.logging import configure_logging
from simulator.mqtt.client import MQTTClient
from simulator.services.alerts import AlertService
from simulator.services.environment import EnvironmentSimulator

logger = logging.getLogger(__name__)


def main() -> None:
    """Run the configured simulation until SIGINT or SIGTERM.

    Raises:
        SystemExit: With status 2 if configuration is invalid.
    """
    configure_logging()
    try:
        settings = Settings.from_env()
    except ValidationError as error:
        # Exclude input values because credentials may be among invalid fields.
        fields = [".".join(str(part) for part in item["loc"]) for item in error.errors()]
        logger.error("invalid_configuration", extra={"reason": ", ".join(fields)})
        raise SystemExit(2) from None
    stop = threading.Event()
    for sig in (signal.SIGINT, signal.SIGTERM):
        signal.signal(sig, lambda *_: stop.set())
    environment = EnvironmentSimulator(settings.device_id, settings.scenario, settings.random_seed)
    alerts = AlertService(settings)
    client = MQTTClient(settings)
    previous = time.monotonic() - settings.publish_interval
    client.start()
    try:
        while not stop.is_set():
            started = time.monotonic()
            scenario = client.take_scenario()
            if scenario is not None:
                environment.set_scenario(scenario)
                logger.info("scenario_changed", extra={"scenario": scenario.value})
            sample = environment.read(max(0.001, started - previous))
            previous = started
            snapshot = alerts.evaluate(sample)
            telemetry_sent = client.publish("telemetry", sample.model_dump_json())
            alerts_sent = client.publish("alerts", snapshot.model_dump_json())
            logger.info(
                "sample_published" if telemetry_sent and alerts_sent else "sample_not_acknowledged",
                extra={
                    "device_id": sample.device_id,
                    "scenario": sample.scenario.value,
                    "co2": sample.co2,
                    "active_alerts": [a.code for a in snapshot.active],
                },
            )
            stop.wait(max(0, settings.publish_interval - (time.monotonic() - started)))
    finally:
        client.stop()


if __name__ == "__main__":
    main()
