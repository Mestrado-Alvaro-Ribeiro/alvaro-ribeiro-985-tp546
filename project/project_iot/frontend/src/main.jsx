import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import mqtt from "mqtt";
import { initialState, receiveMessage, isFresh, scenarios } from "./state.js";
import "./style.css";

const deviceId = import.meta.env.VITE_DEVICE_ID;
const topic = `${import.meta.env.VITE_TOPIC_PREFIX}/${deviceId}`;
const maxAge = Math.max(
  15000,
  Number(import.meta.env.VITE_PUBLISH_INTERVAL) * 3000,
);
const format = (value, digits = 0) =>
  value == null
    ? "—"
    : value.toLocaleString("pt-BR", {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      });
const time = (timestamp) =>
  new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
const metrics = [
  {
    key: "temperature",
    label: "Temperatura",
    unit: "°C",
    icon: "♨",
    color: "orange",
    digits: 1,
  },
  {
    key: "humidity",
    label: "Umidade",
    unit: "%",
    icon: "◈",
    color: "blue",
    digits: 1,
  },
  {
    key: "co2",
    label: "Concentração de CO₂",
    unit: "ppm",
    icon: "≋",
    color: "green",
    digits: 0,
  },
  {
    key: "light",
    label: "Luminosidade",
    unit: "lux",
    icon: "☀",
    color: "yellow",
    digits: 0,
  },
];
const metricAlerts = {
  temperature: ["temperature_high"],
  humidity: ["humidity_low", "humidity_high"],
  co2: ["co2_high"],
  light: ["light_low"],
};

function Chart({ history, metric }) {
  if (history.length < 2)
    return (
      <div className="chart-empty">
        <span>⌁</span>
        <strong>Aguardando novas leituras</strong>
        <p>O gráfico aparece a partir da segunda leitura recebida.</p>
      </div>
    );
  const values = history.map((item) => item[metric.key]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max((max - min) * 0.2, metric.digits ? 0.5 : 10);
  const low = Math.max(0, min - padding);
  const high = max + padding;
  const bottom = metric.key === "temperature" ? min - padding : low;
  const points = values
    .map(
      (value, i) =>
        `${60 + (i / (values.length - 1)) * 790},${210 - ((value - bottom) / (high - bottom)) * 175}`,
    )
    .join(" ");
  return (
    <div className="chart-wrap">
      <svg
        className="chart"
        viewBox="0 0 890 255"
        role="img"
        aria-label={`Últimas ${history.length} leituras de ${metric.label}: mínimo ${format(min, metric.digits)}, máximo ${format(max, metric.digits)} ${metric.unit}`}
      >
        <defs>
          <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--sensor-color)"
              stopOpacity=".3"
            />
            <stop
              offset="100%"
              stopColor="var(--sensor-color)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <line
              x1="60"
              y1={35 + (i * 175) / 3}
              x2="850"
              y2={35 + (i * 175) / 3}
              stroke="#e9ede8"
              strokeDasharray="4 5"
            />
            <text x="45" y={40 + (i * 175) / 3} textAnchor="end">
              {format(high - (i * (high - bottom)) / 3, metric.digits)}
            </text>
          </g>
        ))}
        <polygon points={`60,210 ${points} 850,210`} fill="url(#chart-fill)" />
        <polyline
          points={points}
          fill="none"
          stroke="var(--sensor-color)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <text x="60" y="244">
          {time(history[0].timestamp)}
        </text>
        <text x="850" y="244" textAnchor="end">
          {time(history.at(-1).timestamp)}
        </text>
      </svg>
      <div className="chart-summary">
        <span>
          Mínimo{" "}
          <b>
            {format(min, metric.digits)} {metric.unit}
          </b>
        </span>
        <span>
          Máximo{" "}
          <b>
            {format(max, metric.digits)} {metric.unit}
          </b>
        </span>
        <span>
          Última{" "}
          <b>
            {format(values.at(-1), metric.digits)} {metric.unit}
          </b>
        </span>
      </div>
    </div>
  );
}

function App() {
  const [state, setState] = useState(initialState);
  const [connection, setConnection] = useState("connecting");
  const [error, setError] = useState("");
  const [commandMessage, setCommandMessage] = useState("");
  const [pending, setPending] = useState(null);
  const [metricKey, setMetricKey] = useState("co2");
  const [now, setNow] = useState(Date.now());
  const clientRef = useRef(null);
  const { telemetry, alerts, history, deviceState } = state;
  const fresh = isFresh(telemetry, now, maxAge);
  const online =
    connection === "connected" && deviceState === "online" && fresh;
  const matchingAlerts =
    telemetry &&
    alerts &&
    Date.parse(alerts.timestamp) === Date.parse(telemetry.timestamp);
  const activeAlerts = matchingAlerts ? alerts.active : [];
  const metric = metrics.find((item) => item.key === metricKey);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    const client = mqtt.connect(
      `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/mqtt`,
      {
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 2000,
        connectTimeout: 10000,
        clientId: `dashboard-${crypto.randomUUID()}`,
        queueQoSZero: false,
      },
    );
    clientRef.current = client;
    client.on("connect", () => {
      client.subscribe(
        ["telemetry", "alerts", "status"].map((kind) => `${topic}/${kind}`),
        { qos: 1 },
        (err, granted) => {
          if (err || granted?.some((grant) => grant.qos === 128)) {
            setError("Não foi possível assinar os dados do dispositivo.");
            setConnection("error");
          } else {
            setConnection("connected");
            setError("");
          }
        },
      );
    });
    client.on("reconnect", () => setConnection("connecting"));
    client.on("close", () => setConnection("disconnected"));
    client.on("error", () =>
      setError("Falha na conexão MQTT. Tentando reconectar…"),
    );
    client.on("message", (receivedTopic, payload) => {
      const kind = receivedTopic.slice(topic.length + 1);
      if (
        receivedTopic !== `${topic}/${kind}` ||
        !["telemetry", "alerts", "status"].includes(kind)
      )
        return;
      try {
        // Validate before React schedules its state updater so invalid payloads stay recoverable.
        receiveMessage(initialState, kind, payload.toString(), deviceId);
        setState((previous) =>
          receiveMessage(previous, kind, payload.toString(), deviceId),
        );
        setError("");
      } catch (err) {
        setError(`Mensagem ignorada: ${err.message}`);
      }
    });
    return () => {
      clearInterval(timer);
      clientRef.current = null;
      client.end(true);
    };
  }, []);

  useEffect(() => {
    if (!pending) return;
    if (
      telemetry?.scenario === pending.scenario &&
      Date.parse(telemetry.timestamp) > pending.after
    ) {
      setCommandMessage(
        `Cenário confirmado: ${scenarios[pending.scenario].label}.`,
      );
      setPending(null);
    } else if (now - pending.sentAt > maxAge + 5000) {
      setCommandMessage(
        "O dispositivo não confirmou a mudança. Verifique a conexão e tente novamente.",
      );
      setPending(null);
    }
  }, [telemetry, pending, now]);

  function changeScenario(scenario) {
    if (!online || pending || !clientRef.current?.connected) return;
    const sentAt = Date.now();
    setPending({ scenario, sentAt, after: Date.parse(telemetry.timestamp) });
    setCommandMessage(`Aguardando confirmação: ${scenarios[scenario].label}…`);
    clientRef.current.publish(
      `${topic}/commands`,
      JSON.stringify({ scenario }),
      { qos: 1, retain: false },
      (err) => {
        if (err) {
          setPending(null);
          setCommandMessage(
            "Não foi possível enviar o comando. Tente novamente.",
          );
        }
      },
    );
  }

  const statusText = online
    ? "Dispositivo online"
    : connection !== "connected"
      ? "Conectando ao broker"
      : deviceState === "offline"
        ? "Dispositivo offline"
        : !telemetry
          ? "Aguardando primeira leitura"
          : "Sem dados recentes";
  return (
    <div className="app-shell">
      <main id="overview">
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">SMART ENVIRONMENT / {deviceId}</div>
              <h1>
                Seu ambiente, em tempo real<span>.</span>
              </h1>
              <p>
                Acompanhe as condições da sala e explore os cenários da
                simulação.
              </p>
            </div>
            <div
              className={`connection-pill ${online ? "live" : "waiting"}`}
              role="status"
            >
              <span className="status-dot" />
              {statusText}
            </div>
          </div>
          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}
          <section className="room-banner" aria-label="Estado do ambiente">
            <div className="room-illustration" aria-hidden="true">
              ⌂
            </div>
            <div className="room-name">
              <span>SALA MONITORADA</span>
              <h2>{deviceId}</h2>
              <p>
                <span className={`status-dot ${online ? "green-dot" : ""}`} />
                {telemetry?.source === "simulator"
                  ? "Sensores simulados"
                  : telemetry
                    ? `Fonte: ${telemetry.source}`
                    : "Aguardando sensores"}
              </p>
            </div>
            <div className="room-detail">
              <span>Cenário atual</span>
              <strong>
                {telemetry
                  ? (scenarios[telemetry.scenario]?.label ??
                    "Dispositivo físico")
                  : "—"}
              </strong>
            </div>
            <div className="room-detail">
              <span>Última atualização</span>
              <strong>{telemetry ? time(telemetry.timestamp) : "—"}</strong>
            </div>
            <div className="presence">
              <span className="presence-icon">♙</span>
              <div>
                <span>Presença</span>
                <strong>
                  {telemetry
                    ? telemetry.presence
                      ? "Sala ocupada"
                      : "Sala desocupada"
                    : "Aguardando"}
                </strong>
              </div>
            </div>
          </section>
          {telemetry && !online && (
            <div className="notice" role="status">
              As últimas leituras estão preservadas abaixo.{" "}
              {connection !== "connected"
                ? "Reconectando ao broker automaticamente."
                : deviceState === "offline"
                  ? "O dispositivo está offline."
                  : "Aguardando uma leitura recente; confira o simulador e o horário do computador."}
            </div>
          )}
          <div className="section-heading">
            <h2>Condições do ambiente</h2>
            <span>
              {online ? "Atualização automática" : "Aguardando conexão e dados"}
            </span>
          </div>
          <section className="metrics-grid" aria-label="Leituras dos sensores">
            {metrics.map((item) => {
              const hasAlert = activeAlerts.some((alert) =>
                metricAlerts[item.key].includes(alert.code),
              );
              return (
                <article
                  className={`metric-card ${hasAlert && online ? "has-alert" : ""} ${!online ? "muted-reading" : ""}`}
                  data-sensor={item.key}
                  key={item.key}
                >
                  <div className="metric-top">
                    <span className={`sensor-icon ${item.color}`}>
                      {item.icon}
                    </span>
                    <span
                      className={`metric-status ${hasAlert ? "alert-text" : ""}`}
                    >
                      {!online
                        ? "Sem leitura atual"
                        : !matchingAlerts
                          ? "Verificando"
                          : hasAlert
                            ? "Atenção"
                            : "Sem alerta"}
                    </span>
                  </div>
                  <h3>{item.label}</h3>
                  <div className="metric-value">
                    {format(telemetry?.[item.key], item.digits)}
                    <span>{item.unit}</span>
                  </div>
                  <div className="metric-foot">
                    <span className={`small-line ${item.color}`} />
                    {hasAlert ? "Condição requer atenção" : "Leitura do sensor"}
                  </div>
                </article>
              );
            })}
          </section>
          <div className="analysis-grid">
            <section
              className="panel history-panel"
              id="history"
              data-sensor={metricKey}
            >
              <div className="panel-heading">
                <div>
                  <h2>O ritmo do ambiente</h2>
                  <p>
                    Últimas {history.length} leituras · histórico desta sessão
                  </p>
                </div>
                <span className="panel-symbol">↗</span>
              </div>
              <div
                className="chart-tabs"
                role="group"
                aria-label="Sensor do gráfico"
              >
                {metrics.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    aria-pressed={metricKey === item.key}
                    className={metricKey === item.key ? "active" : ""}
                    data-sensor={item.key}
                    onClick={() => setMetricKey(item.key)}
                  >
                    {item.key === "co2" ? "CO₂" : item.label}
                  </button>
                ))}
              </div>
              <Chart history={history} metric={metric} />
            </section>
            <section
              className="panel alerts-panel"
              data-state={
                !online || !matchingAlerts
                  ? "waiting"
                  : activeAlerts.length
                    ? "alert"
                    : "healthy"
              }
            >
              <div className="panel-heading">
                <div>
                  <h2>Alertas do ambiente</h2>
                  <p>Condições identificadas pelo simulador</p>
                </div>
                <span className="alert-count">
                  {online && matchingAlerts ? activeAlerts.length : "—"}
                </span>
              </div>
              <div aria-live="polite">
                {!online || !matchingAlerts ? (
                  <div className="alert-empty">
                    <span className="alert-emblem waiting-emblem">⌁</span>
                    <h3>
                      {!online
                        ? "Aguardando dados atuais"
                        : "Verificando alertas"}
                    </h3>
                    <p>
                      O estado dos alertas será exibido ao receber dados atuais
                      do dispositivo.
                    </p>
                  </div>
                ) : activeAlerts.length === 0 ? (
                  <div className="alert-empty">
                    <span className="alert-emblem">✓</span>
                    <h3>Tudo tranquilo por aqui</h3>
                    <p>Nenhum alerta ativo na última leitura do ambiente.</p>
                    <span className="healthy-label">AMBIENTE MONITORADO</span>
                  </div>
                ) : (
                  <ul className="alert-list">
                    {activeAlerts.map((alert, index) => (
                      <li key={`${alert.code}-${index}`}>
                        <span>!</span>
                        <div>
                          <strong>{alert.message}</strong>
                          <p>
                            {format(alert.value, 1)} {alert.unit} · limite{" "}
                            {format(alert.threshold, 1)} {alert.unit}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
          <section className="panel scenarios-panel" id="scenarios">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">EXPLORE A SIMULAÇÃO</div>
                <h2>Uma sala, diferentes cenários</h2>
                <p>
                  Escolha uma condição e observe como os sensores respondem ao
                  longo do tempo.
                </p>
              </div>
              <span className="simulation-badge">◌ Simulação</span>
            </div>
            <div className="scenario-grid">
              {Object.entries(scenarios).map(([key, scenario]) => (
                <button
                  type="button"
                  key={key}
                  className={`scenario-card ${telemetry?.scenario === key ? "current" : ""}`}
                  data-scenario={key}
                  aria-pressed={telemetry?.scenario === key}
                  disabled={
                    !online ||
                    !!pending ||
                    telemetry?.source !== "simulator" ||
                    telemetry?.scenario === key
                  }
                  onClick={() => changeScenario(key)}
                >
                  <span className="scenario-top">
                    <span>{scenario.icon}</span>
                    {telemetry?.scenario === key ? (
                      <small>ATUAL</small>
                    ) : pending?.scenario === key ? (
                      <small>ENVIANDO</small>
                    ) : (
                      <span className="scenario-arrow">↗</span>
                    )}
                  </span>
                  <strong>{scenario.label}</strong>
                  <p>{scenario.description}</p>
                </button>
              ))}
            </div>
            <div className="scenario-footer" role="status">
              {commandMessage ||
                (online
                  ? "As mudanças são graduais. A confirmação aparece na próxima leitura do simulador."
                  : "Os controles ficam disponíveis quando o simulador está online e os dados estão atualizados.")}
            </div>
          </section>
          <footer>
            <span>
              <span className="footer-logo">▥</span> Smart Environment{" "}
              <span className="footer-divider">/</span> TP546
            </span>
            <span className="footer-credits" lang="en">
              Developed by{" "}
              <a
                href="https://github.com/AlvaroLucioRibeiro"
                target="_blank"
                rel="noopener noreferrer"
              >
                Álvaro L. A. Ribeiro
              </a>{" "}
              and{" "}
              <a
                href="https://github.com/matheusAFONSECA"
                target="_blank"
                rel="noopener noreferrer"
              >
                Matheus H. F. Afonso
              </a>
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
