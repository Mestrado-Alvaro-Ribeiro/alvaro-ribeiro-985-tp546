import test from "node:test"
import assert from "node:assert/strict"
import {
  environmentStatus,
  chartGeometry,
  relativeTime,
  eventsFromHistory,
} from "../src/presentation.js"

const telemetry = { timestamp: "2026-11-10T12:00:00Z" }
const alerts = { timestamp: telemetry.timestamp, active: [] }
const connected = { telemetry, alerts, online: true }

test("environment is healthy only with fresh telemetry and matching alert snapshot", () => {
  assert.equal(environmentStatus(connected).tone, "success")
  assert.equal(
    environmentStatus({ ...connected, online: false }).tone,
    "neutral",
  )
  assert.equal(
    environmentStatus({ ...connected, alerts: null }).tone,
    "neutral",
  )
  assert.equal(
    environmentStatus({
      ...connected,
      alerts: { ...alerts, timestamp: "2026-11-10T11:59:55Z" },
    }).tone,
    "neutral",
  )
  assert.equal(
    environmentStatus({ telemetry: null, alerts: null, online: false }).title,
    "Aguardando sensores",
  )
})

test("environment uses the published alerts, including hysteresis, without guessing thresholds", () => {
  const active = [
    {
      code: "co2_high",
      value: 1450,
      threshold: 1500,
      unit: "ppm",
      message: "CO₂ elevado",
    },
  ]
  const result = environmentStatus({
    ...connected,
    alerts: { ...alerts, active },
  })
  assert.equal(result.tone, "warning")
  assert.equal(result.title, "Ventilação recomendada")
  assert.equal(result.affected, 1)
  assert.equal(result.active[0].threshold, 1500)
  assert.equal(
    environmentStatus({
      ...connected,
      online: false,
      alerts: { ...alerts, active },
    }).active.length,
    0,
  )
})

test("chart positions samples by elapsed time rather than index and handles constant negative readings", () => {
  const history = [0, 5, 30].map((seconds) => ({
    timestamp: new Date(
      Date.parse(telemetry.timestamp) + seconds * 1000,
    ).toISOString(),
    temperature: -10,
  }))
  const result = chartGeometry(history, "temperature")
  assert.equal(result.points[0].x, 64)
  assert.equal(result.points[2].x, 864)
  assert.ok(Math.abs(result.points[1].x - (64 + 800 / 6)) < 0.001)
  assert.ok(result.points.every((p) => Number.isFinite(p.y)))
  assert.ok(result.low < -10 && result.high > -10)
  assert.equal(chartGeometry([], "temperature"), null)
  assert.equal(chartGeometry(history.slice(0, 1), "temperature"), null)
})

test("relative age does not display negative durations for permitted clock skew", () => {
  const now = Date.parse(telemetry.timestamp)
  assert.equal(relativeTime(null, now), "Sem leitura")
  assert.equal(relativeTime(telemetry.timestamp, now - 3000), "agora")
  assert.equal(relativeTime(telemetry.timestamp, now + 5000), "há 5 s")
  assert.equal(relativeTime(telemetry.timestamp, now + 120000), "há 2 min")
})

test("timeline reports observed presence and scenario transitions without inventing startup events", () => {
  const samples = [
    { timestamp: "2026-11-10T12:00:00Z", presence: false, scenario: "normal" },
    { timestamp: "2026-11-10T12:00:05Z", presence: true, scenario: "crowded" },
    { timestamp: "2026-11-10T12:00:10Z", presence: true, scenario: "crowded" },
  ]
  assert.deepEqual(eventsFromHistory([]), [])
  assert.deepEqual(eventsFromHistory(samples.slice(0, 1)), [])
  const events = eventsFromHistory(samples)
  assert.equal(events.length, 2)
  assert.ok(events.every((event) => event.timestamp === samples[1].timestamp))
  assert.ok(events.some((event) => event.label === "Presença detectada"))
  assert.equal(
    events.find((event) => event.label === "Cenário alterado").scenario,
    "crowded",
  )
})
