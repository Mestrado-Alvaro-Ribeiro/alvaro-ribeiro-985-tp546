.PHONY: up down logs restart test integration lint mqtt-logs simulator-logs sync run presentation

up:
	docker compose up --build -d
down:
	docker compose down
logs:
	docker compose logs -f
restart:
	docker compose restart
mqtt-logs:
	docker compose logs -f mosquitto
simulator-logs:
	docker compose logs -f sensor-simulator
sync:
	uv sync --locked
run:
	uv run --locked --env-file .env iot-simulator
test:
	uv run --locked pytest -m 'not integration and not deployment'
integration:
	RUN_MQTT_TESTS=1 uv run --locked pytest -m integration
lint:
	uv run --locked ruff check src tests
	uv run --locked ruff format --check src tests
presentation:
	uv run --locked --group presentation python presentation/build_slides.py
