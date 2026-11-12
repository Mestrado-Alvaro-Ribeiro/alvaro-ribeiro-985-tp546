import test from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  receiveMessage,
  isFresh,
  scenarios,
} from "../src/state.js";

const device = "room01";
const sample = (overrides = {}) => ({
  schema_version: "1.0",
  device_id: device,
  timestamp: "2026-11-10T12:00:00Z",
  source: "simulator",
  scenario: "normal",
  temperature: 24.5,
  humidity: 57.2,
  co2: 720,
  light: 430,
  presence: true,
  ...overrides,
});
const receive = (state, kind, body) =>
  receiveMessage(state, kind, JSON.stringify(body), device);

test("accepts telemetry and ignores duplicate or older readings", () => {
  const state = receive(initialState, "telemetry", sample());
  assert.equal(state.telemetry.co2, 720);
  assert.equal(state.history.length, 1);
  assert.deepEqual(receive(state, "telemetry", sample()), state);
  assert.deepEqual(
    receive(state, "telemetry", sample({ timestamp: "2026-11-10T11:59:00Z" })),
    state,
  );
});

test("keeps only the latest 60 readings", () => {
  let state = initialState;
  for (let i = 0; i < 65; i++) {
    state = receive(
      state,
      "telemetry",
      sample({
        timestamp: new Date(Date.UTC(2026, 10, 10, 12, i)).toISOString(),
      }),
    );
  }
  assert.equal(state.history.length, 60);
  assert.equal(state.history.at(-1), state.telemetry);
});

test("rejects malformed JSON, invalid sensor types, bounds and foreign devices", () => {
  assert.throws(() => receiveMessage(initialState, "telemetry", "{", device));
  for (const overrides of [
    { presence: "true" },
    { co2: null },
    { co2: -1 },
    { humidity: 101 },
    { temperature: "24" },
    { light: 100001 },
    { timestamp: "yesterday" },
    { timestamp: "2026-11-10T12:00:00" },
    { schema_version: "2.0" },
    { source: "unknown" },
    { scenario: "unknown" },
  ])
    assert.throws(() => receive(initialState, "telemetry", sample(overrides)));
  assert.deepEqual(
    receive(initialState, "telemetry", sample({ device_id: "other" })),
    initialState,
  );
  assert.equal(
    receive(
      initialState,
      "telemetry",
      sample({ scenario: null, source: "esp32" }),
    ).telemetry.source,
    "esp32",
  );
});

test("handles alert resolution and rejects malformed status or alert data", () => {
  const body = {
    schema_version: "1.0",
    device_id: device,
    source: "simulator",
    timestamp: sample().timestamp,
    active: [
      {
        code: "co2_high",
        message: "CO₂ elevado",
        value: 1600,
        threshold: 1500,
        unit: "ppm",
      },
    ],
  };
  const active = receive(initialState, "alerts", body);
  assert.equal(active.alerts.active.length, 1);
  const cleared = receive(active, "alerts", {
    ...body,
    active: [],
    timestamp: "2026-11-10T12:00:05Z",
  });
  assert.equal(cleared.alerts.active.length, 0);
  assert.equal(receive(cleared, "alerts", body), cleared);
  assert.throws(() =>
    receive(initialState, "alerts", { ...body, active: [{}] }),
  );
  assert.throws(() =>
    receive(initialState, "status", { ...body, state: "bad" }),
  );
  assert.equal(
    receive(initialState, "status", { ...body, state: "offline" }).deviceState,
    "offline",
  );
});

test("freshness requires a recent reading and rejects future timestamps", () => {
  const now = Date.parse(sample().timestamp);
  assert.equal(isFresh(null, now, 15000), false);
  assert.equal(isFresh(sample(), now + 10000, 15000), true);
  assert.equal(isFresh(sample(), now + 15001, 15000), false);
  assert.equal(isFresh(sample(), now - 6000, 15000), false);
  assert.equal(Object.keys(scenarios).length, 6);
});
