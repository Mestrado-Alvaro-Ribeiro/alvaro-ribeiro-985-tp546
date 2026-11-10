export const scenarios = {
  normal: {
    label: "Normal",
    description: "Ocupação alternada e ambiente equilibrado.",
    icon: "◉",
  },
  crowded: {
    label: "Sala cheia",
    description: "Presença contínua e concentração crescente de CO₂.",
    icon: "♙",
  },
  empty: {
    label: "Sala vazia",
    description: "Sem presença; o CO₂ diminui gradualmente.",
    icon: "□",
  },
  poor_ventilation: {
    label: "Pouca ventilação",
    description: "O CO₂ aumenta com a sala ocupada.",
    icon: "≋",
  },
  high_temperature: {
    label: "Temperatura alta",
    description: "A temperatura converge para 31,5 °C.",
    icon: "☀",
  },
  night: {
    label: "Noturno",
    description: "Ambiente desocupado e baixa luminosidade.",
    icon: "☾",
  },
};

export const initialState = {
  telemetry: null,
  alerts: null,
  deviceState: "unknown",
  history: [],
};
const sources = ["simulator", "esp32", "raspberry"];
const finite = (value) => typeof value === "number" && Number.isFinite(value);
const validTime = (value) =>
  typeof value === "string" &&
  /(Z|[+-]\d{2}:\d{2})$/.test(value) &&
  Number.isFinite(Date.parse(value));
const inRange = (value, min, max) =>
  finite(value) && value >= min && value <= max;

export function receiveMessage(state, kind, payload, deviceId) {
  const data = JSON.parse(payload);
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error("Mensagem MQTT inválida.");
  if (data.device_id !== deviceId) return state;
  if (data.schema_version !== "1.0" || !sources.includes(data.source))
    throw new Error("Contrato MQTT incompatível.");
  if (kind === "status") {
    if (!["online", "offline"].includes(data.state))
      throw new Error("Status inválido.");
    return { ...state, deviceState: data.state };
  }
  if (!validTime(data.timestamp))
    throw new Error("Horário da mensagem inválido.");
  if (kind === "telemetry") {
    if (
      !inRange(data.temperature, -40, 85) ||
      !inRange(data.humidity, 0, 100) ||
      !inRange(data.co2, 0, 40000) ||
      !inRange(data.light, 0, 100000) ||
      typeof data.presence !== "boolean" ||
      (data.scenario !== null && !Object.hasOwn(scenarios, data.scenario))
    ) {
      throw new Error("Leitura de sensor inválida.");
    }
    if (
      state.telemetry &&
      Date.parse(data.timestamp) <= Date.parse(state.telemetry.timestamp)
    )
      return state;
    return {
      ...state,
      telemetry: data,
      history: [...state.history, data].slice(-60),
    };
  }
  if (kind === "alerts") {
    if (
      !Array.isArray(data.active) ||
      !data.active.every(
        (alert) =>
          alert &&
          ["code", "message", "unit"].every(
            (key) => typeof alert[key] === "string",
          ) &&
          finite(alert.value) &&
          finite(alert.threshold),
      )
    )
      throw new Error("Snapshot de alertas inválido.");
    if (
      state.alerts &&
      Date.parse(data.timestamp) < Date.parse(state.alerts.timestamp)
    )
      return state;
    return { ...state, alerts: data };
  }
  return state;
}

export function isFresh(telemetry, now, maxAge) {
  if (!telemetry) return false;
  const age = now - Date.parse(telemetry.timestamp);
  return age >= -5000 && age <= maxAge;
}
