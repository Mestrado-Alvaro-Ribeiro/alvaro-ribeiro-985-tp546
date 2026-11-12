export const metrics = [
  {
    key: "co2",
    label: "CO₂",
    description: "Qualidade do ar",
    unit: "ppm",
    digits: 0,
    icon: "air",
  },
  {
    key: "temperature",
    label: "Temperatura",
    description: "Condição térmica",
    unit: "°C",
    digits: 1,
    icon: "temperature",
  },
  {
    key: "humidity",
    label: "Umidade",
    description: "Umidade relativa",
    unit: "%",
    digits: 1,
    icon: "humidity",
  },
  {
    key: "light",
    label: "Luminosidade",
    description: "Iluminação da sala",
    unit: "lux",
    digits: 0,
    icon: "light",
  },
]

export const metricAlerts = {
  co2: ["co2_high"],
  temperature: ["temperature_high"],
  humidity: ["humidity_low", "humidity_high"],
  light: ["light_low"],
}

export const format = (value, digits = 0) =>
  value == null
    ? "—"
    : value.toLocaleString("pt-BR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
export const time = (timestamp) =>
  new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
export const sourceLabel = (source) =>
  ({ simulator: "Simulação", esp32: "ESP32", raspberry: "Raspberry Pi" })[
    source
  ] ?? "Aguardando fonte"

export function relativeTime(timestamp, now) {
  if (!timestamp) return "Sem leitura"
  const seconds = Math.max(0, Math.floor((now - Date.parse(timestamp)) / 1000))
  if (seconds < 1) return "agora"
  if (seconds < 60) return `há ${seconds} s`
  if (seconds < 3600) return `há ${Math.floor(seconds / 60)} min`
  return `há ${Math.floor(seconds / 3600)} h`
}

export function environmentStatus({ telemetry, alerts, online }) {
  const unknown = { tone: "neutral", active: [], affected: 0, confirmed: false }
  if (!telemetry)
    return {
      ...unknown,
      title: "Aguardando sensores",
      description:
        "As condições do ambiente aparecem assim que a primeira leitura chegar.",
    }
  if (!online)
    return {
      ...unknown,
      title: "Sem leitura atual",
      description:
        "Os últimos valores estão preservados. Aguarde a conexão e uma nova leitura para avaliar a sala.",
    }
  if (
    !alerts ||
    Date.parse(alerts.timestamp) !== Date.parse(telemetry.timestamp)
  )
    return {
      ...unknown,
      title: "Verificando condições",
      description:
        "Leitura recebida. Aguardando os alertas correspondentes do dispositivo.",
    }
  const active = alerts.active
  const affected = metrics.filter((metric) =>
    active.some((alert) => metricAlerts[metric.key].includes(alert.code)),
  ).length
  if (!active.length)
    return {
      tone: "success",
      title: "Ambiente sem alertas",
      description:
        "As quatro métricas estão sem alertas ativos segundo as regras do dispositivo.",
      active,
      affected,
      confirmed: true,
    }
  return {
    tone: "warning",
    title: active.some((alert) => alert.code === "co2_high")
      ? "Ventilação recomendada"
      : "O ambiente pede atenção",
    description: active[0].message,
    active,
    affected,
    confirmed: true,
  }
}

export function chartGeometry(history, key, width = 900) {
  if (history.length < 2) return null
  const values = history.map((item) => item[key])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = Math.max(
    (max - min) * 0.2,
    key === "temperature" || key === "humidity" ? 0.5 : 10,
  )
  const low = key === "temperature" ? min - padding : Math.max(0, min - padding)
  const high = max + padding
  const start = Date.parse(history[0].timestamp)
  const duration = Math.max(1, Date.parse(history.at(-1).timestamp) - start)
  const points = history.map((item) => ({
    x: 64 + ((Date.parse(item.timestamp) - start) / duration) * (width - 100),
    y: 240 - ((item[key] - low) / (high - low)) * 200,
    sample: item,
  }))
  return { min, max, low, high, points }
}

export function eventsFromHistory(history) {
  return history
    .flatMap((sample, index) => {
      const previous = history[index - 1]
      if (!previous) return []
      const events = []
      if (previous.presence !== sample.presence)
        events.push({
          timestamp: sample.timestamp,
          icon: "presence",
          label: sample.presence ? "Presença detectada" : "Sala desocupada",
        })
      if (previous.scenario !== sample.scenario)
        events.push({
          timestamp: sample.timestamp,
          icon: "scenario",
          label: "Cenário alterado",
          scenario: sample.scenario,
        })
      return events
    })
    .reverse()
    .slice(0, 6)
}
