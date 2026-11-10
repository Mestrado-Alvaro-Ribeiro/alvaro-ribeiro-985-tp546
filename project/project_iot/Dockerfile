FROM ghcr.io/astral-sh/uv:0.9.26 AS uv
FROM python:3.12-slim-bookworm
COPY --from=uv /uv /uvx /bin/
ENV UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=never PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY pyproject.toml uv.lock README.md ./
RUN uv sync --locked --no-dev --no-install-project
COPY src/ ./src/
RUN uv sync --locked --no-dev && useradd --uid 10001 --no-create-home appuser
USER 10001
CMD ["/app/.venv/bin/iot-simulator"]
