import React from "react"
import {
  metricAlerts,
  format,
  time,
  relativeTime,
  sourceLabel,
  eventsFromHistory,
} from "./presentation.js"
import { scenarios } from "./state.js"

const paths = {
  air: (
    <path d="M3 8h12a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h5a3 3 0 1 1-3 3" />
  ),
  temperature: (
    <>
      <path d="M9 14.5V5a3 3 0 0 1 6 0v9.5a5 5 0 1 1-6 0Z" />
      <path d="M12 9v9m5-12h3m-3 4h2" />
    </>
  ),
  humidity: (
    <path d="M12 3c-2 4-7 8-7 12a7 7 0 0 0 14 0c0-4-5-8-7-12ZM8 15a4 4 0 0 0 4 4" />
  ),
  light: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </>
  ),
  presence: (
    <>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6m2 11v-3a6 6 0 0 0-2-4" />
    </>
  ),
  room: (
    <>
      <path d="m3 10 9-7 9 7v11H3V10Z" />
      <path d="M9 21v-8h6v8" />
    </>
  ),
  connection: (
    <>
      <path d="M2 8a17 17 0 0 1 20 0M5 12a12 12 0 0 1 14 0m-11 4a6 6 0 0 1 8 0" />
      <circle cx="12" cy="20" r="1" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  alert: (
    <>
      <path d="m12 3 10 18H2L12 3Z" />
      <path d="M12 9v5m0 3v1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  scenario: (
    <>
      <path d="M5 3v18m14-18v18M3 8h4m10 8h4" />
      <circle cx="12" cy="6" r="2" />
      <path d="M12 8v13" />
    </>
  ),
  moon: <path d="M20 14A9 9 0 0 1 10 4a9 9 0 1 0 10 10Z" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  activity: <path d="M2 12h4l3-8 6 16 3-8h4" />,
}

export function Icon({ name, className = "" }) {
  return (
    <svg
      className={`icon ${className}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.activity}
    </svg>
  )
}

export function StatusBadge({ tone = "neutral", children }) {
  return (
    <span className={`status-badge tone-${tone}`}>
      <span className="status-dot" aria-hidden="true" />
      {children}
    </span>
  )
}

export function ConnectionStatus({ connection, error }) {
  const connected = connection === "connected"
  const label = connected
    ? "MQTT conectado"
    : connection === "connecting"
      ? "MQTT conectando"
      : connection === "error"
        ? "Erro na assinatura MQTT"
        : "MQTT desconectado"
  return (
    <div className="connection-status" role="status">
      <Icon name="connection" />
      <StatusBadge tone={connected ? "success" : error ? "danger" : "neutral"}>
        {label}
      </StatusBadge>
    </div>
  )
}

export function EnvironmentSummary({ status, online, telemetry, now }) {
  return (
    <section
      className={`environment-summary tone-${status.tone}`}
      aria-labelledby="environment-title"
    >
      <div className="summary-mark">
        <Icon
          name={
            status.tone === "warning"
              ? "alert"
              : status.tone === "success"
                ? "check"
                : "activity"
          }
        />
      </div>
      <div className="summary-copy">
        <p className="eyebrow">Estado do ambiente</p>
        <h2 id="environment-title" aria-live="polite">
          {status.title}
        </h2>
        <p>{status.description}</p>
      </div>
      <div className="summary-meta">
        <StatusBadge tone={online ? "success" : "neutral"}>
          {online ? "LIVE · ao vivo" : "Sem dados ao vivo"}
        </StatusBadge>
        <span>
          <Icon name="clock" />
          {telemetry
            ? `Atualizado ${relativeTime(telemetry.timestamp, now)}`
            : "Aguardando primeira leitura"}
        </span>
      </div>
    </section>
  )
}

export function MetricCard({ metric, telemetry, history, status, online }) {
  const alert = status.active.find((item) =>
    metricAlerts[metric.key].includes(item.code),
  )
  const tone = !status.confirmed ? "neutral" : alert ? "warning" : "success"
  const previous = history.at(-2)
  const delta =
    previous && telemetry ? telemetry[metric.key] - previous[metric.key] : null
  return (
    <article
      className={`metric-card ${metric.key === "co2" ? "metric-priority" : ""}`}
      data-sensor={metric.key}
      data-stale={!!telemetry && !online}
    >
      <div className="metric-heading">
        <span className="metric-icon">
          <Icon name={metric.icon} />
        </span>
        <h3>{metric.label}</h3>
        <span className="metric-category">
          {metric.key === "co2" ? "AR INTERIOR" : metric.unit}
        </span>
      </div>
      {telemetry ? (
        <div className="metric-value" key={telemetry.timestamp}>
          {format(telemetry[metric.key], metric.digits)}
          <span>{metric.unit}</span>
        </div>
      ) : (
        <div
          className="skeleton metric-skeleton"
          role="status"
          aria-label={`Aguardando leitura de ${metric.label}`}
        />
      )}
      <StatusBadge tone={tone}>
        {!telemetry
          ? "Aguardando"
          : !online
            ? "Leitura antiga"
            : !status.confirmed
              ? "Verificando"
              : alert
                ? "Atenção"
                : "Sem alerta"}
      </StatusBadge>
      <p className="metric-context">
        {alert
          ? `Limite configurado: ${format(alert.threshold, metric.digits)} ${metric.unit}`
          : !telemetry
            ? metric.description
            : delta == null
              ? "Primeira leitura da sessão"
              : `${delta > 0 ? "+" : ""}${format(delta, metric.digits)} ${metric.unit} desde ${time(previous.timestamp)}`}
      </p>
    </article>
  )
}

export function RoomStatus({ telemetry, deviceState, online, now, deviceId }) {
  return (
    <section className="panel room-panel" aria-labelledby="room-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Sala monitorada</p>
          <h2 id="room-title">{deviceId}</h2>
        </div>
        <Icon name="room" />
      </div>
      <div className="occupancy">
        <Icon name="presence" />
        <div>
          <span>Presença</span>
          <strong>
            {!telemetry
              ? "Aguardando sensores"
              : !online
                ? "Sem presença atual"
                : telemetry.presence
                  ? "Sala ocupada"
                  : "Sala desocupada"}
          </strong>
          <small>
            {telemetry && !online
              ? `Último registro: ${telemetry.presence ? "ocupada" : "desocupada"}`
              : "Detecção pelo sensor de presença"}
          </small>
        </div>
      </div>
      <dl className="room-facts">
        <div>
          <dt>Dispositivo</dt>
          <dd>
            <StatusBadge tone={online ? "success" : "neutral"}>
              {online
                ? "Online"
                : deviceState === "offline"
                  ? "Offline"
                  : deviceState === "unknown"
                    ? "Desconhecido"
                    : "Sem dados atuais"}
            </StatusBadge>
          </dd>
        </div>
        <div>
          <dt>Origem dos dados</dt>
          <dd>{sourceLabel(telemetry?.source)}</dd>
        </div>
        <div>
          <dt>Cenário{!online && telemetry ? " registrado" : " atual"}</dt>
          <dd>
            {telemetry
              ? (scenarios[telemetry.scenario]?.label ?? "Hardware")
              : "Aguardando"}
          </dd>
        </div>
        <div>
          <dt>Última leitura</dt>
          <dd title={telemetry?.timestamp}>
            {telemetry ? time(telemetry.timestamp) : "Sem leitura"}
            <small>{relativeTime(telemetry?.timestamp, now)}</small>
          </dd>
        </div>
      </dl>
    </section>
  )
}

export function Alerts({ status, telemetry }) {
  return (
    <section className="panel alerts-panel" aria-labelledby="alerts-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Regras do dispositivo</p>
          <h2 id="alerts-title">Alertas ativos</h2>
        </div>
        <StatusBadge tone={status.tone}>
          {status.confirmed ? `${status.active.length} ativos` : "Aguardando"}
        </StatusBadge>
      </div>
      <div aria-live="polite">
        {!status.confirmed ? (
          <div className="empty-state">
            <Icon name="activity" />
            <h3>Aguardando avaliação atual</h3>
            <p>
              Os alertas aparecem quando há uma leitura recente e sua avaliação
              correspondente.
            </p>
          </div>
        ) : !status.active.length ? (
          <div className="empty-state healthy">
            <Icon name="check" />
            <h3>Nenhum alerta ativo</h3>
            <p>
              As condições estão sendo acompanhadas pelas regras configuradas no
              dispositivo.
            </p>
          </div>
        ) : (
          <ul className="alert-list">
            {status.active.map((alert, index) => (
              <li key={`${alert.code}-${index}`}>
                <Icon name="alert" />
                <div>
                  <h3>{alert.message}</h3>
                  <p>
                    {format(alert.value, 1)} {alert.unit}
                    <span>
                      Limite: {format(alert.threshold, 1)} {alert.unit}
                    </span>
                  </p>
                  <time dateTime={telemetry.timestamp}>
                    {time(telemetry.timestamp)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export function RecentEvents({ history }) {
  const events = eventsFromHistory(history)
  return (
    <section className="panel events-panel" aria-labelledby="events-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Histórico desta aba</p>
          <h2 id="events-title">Eventos recentes</h2>
        </div>
        <Icon name="clock" />
      </div>
      {events.length ? (
        <ol className="event-list">
          {events.map((event, index) => (
            <li key={`${event.timestamp}-${index}`}>
              <span className="event-icon">
                <Icon name={event.icon} />
              </span>
              <div>
                <strong>{event.label}</strong>
                <span>
                  {event.scenario
                    ? scenarios[event.scenario]?.label
                    : "Sensor de presença"}
                </span>
              </div>
              <time dateTime={event.timestamp}>{time(event.timestamp)}</time>
            </li>
          ))}
        </ol>
      ) : (
        <div className="empty-state">
          <Icon name="clock" />
          <h3>
            {history.length
              ? "Nenhuma mudança registrada"
              : "Aguardando eventos"}
          </h3>
          <p>
            Mudanças de presença e cenário aparecem aqui, dentro das últimas 60
            leituras.
          </p>
        </div>
      )}
    </section>
  )
}

const scenarioIcons = {
  normal: "check",
  crowded: "presence",
  empty: "room",
  poor_ventilation: "air",
  high_temperature: "temperature",
  night: "moon",
}

export function Scenarios({
  telemetry,
  online,
  pending,
  commandMessage,
  changeScenario,
}) {
  const hardware = telemetry && telemetry.source !== "simulator"
  return (
    <section
      className="panel scenarios-panel"
      aria-labelledby="scenarios-title"
    >
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Laboratório IoT</p>
          <h2 id="scenarios-title">Explore os cenários</h2>
          <p>Observe como a sala responde a diferentes condições.</p>
        </div>
        <StatusBadge>{sourceLabel(telemetry?.source)}</StatusBadge>
      </div>
      <div className="scenario-grid">
        {Object.entries(scenarios).map(([key, scenario]) => (
          <button
            type="button"
            className={`scenario-card ${telemetry?.scenario === key ? "current" : ""}`}
            key={key}
            disabled={!online || !!pending || hardware}
            onClick={() => changeScenario(key)}
            aria-pressed={telemetry?.scenario === key}
          >
            <span className="scenario-top">
              <Icon name={scenarioIcons[key]} />
              <span>
                {pending?.scenario === key ? (
                  "Enviando…"
                ) : telemetry?.scenario === key ? (
                  "Atual"
                ) : (
                  <Icon name="arrow" />
                )}
              </span>
            </span>
            <strong>{scenario.label}</strong>
            <span className="scenario-description">{scenario.description}</span>
          </button>
        ))}
      </div>
      <p className="scenario-footer" role="status">
        {commandMessage ||
          (hardware
            ? "Os cenários são exclusivos do simulador. As leituras de hardware continuam disponíveis."
            : online
              ? "A mudança é confirmada pela próxima leitura do simulador."
              : "Os controles ficam disponíveis quando o simulador está online e as leituras estão atuais.")}
      </p>
    </section>
  )
}
