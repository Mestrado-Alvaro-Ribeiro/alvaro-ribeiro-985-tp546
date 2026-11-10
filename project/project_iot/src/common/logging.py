"""JSON logging for console and Docker logs."""

import json
import logging
from datetime import UTC, datetime


class JSONFormatter(logging.Formatter):
    """Serialize log records without leaking configuration or credentials."""

    def format(self, record: logging.LogRecord) -> str:
        """Format a log record as one JSON line.

        Args:
            record: Record supplied by Python logging.

        Returns:
            A JSON object containing time, level, event and selected context.
        """
        data = {
            "timestamp": datetime.fromtimestamp(record.created, UTC).isoformat(),
            "level": record.levelname,
            "event": record.getMessage(),
        }
        for key in ("device_id", "scenario", "co2", "active_alerts", "reason"):
            if hasattr(record, key):
                data[key] = getattr(record, key)
        return json.dumps(data, ensure_ascii=False)


def configure_logging() -> None:
    """Install a JSON console handler at INFO level."""
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    logging.basicConfig(level=logging.INFO, handlers=[handler], force=True)
