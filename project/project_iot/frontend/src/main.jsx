import React, { useState } from "react"
import { createRoot } from "react-dom/client"
import { useEnvironment, deviceId } from "./useEnvironment.js"
import { metrics, environmentStatus } from "./presentation.js"
import {
  Icon,
  ConnectionStatus,
  EnvironmentSummary,
  MetricCard,
  RoomStatus,
  Alerts,
  RecentEvents,
  Scenarios,
} from "./components.jsx"
import RealtimeChart from "./RealtimeChart.jsx"
import ThemeToggle from "./ThemeToggle.jsx"
import "./style.css"

function App() {
  const environment = useEnvironment()
  const {
    telemetry,
    alerts,
    history,
    online,
    error,
    connection,
    deviceState,
    now,
  } = environment
  const [metricKey, setMetricKey] = useState("co2")
  const status = environmentStatus({ telemetry, alerts, online })
  const metric = metrics.find((item) => item.key === metricKey)
  return (
    <div className="app-shell">
      <a className="skip-link" href="#overview">
        Pular para o monitoramento
      </a>
      <header className="site-header">
        <a
          className="brand"
          href="#overview"
          aria-label="Smart Environment, início"
        >
          <span className="brand-symbol">
            <Icon name="activity" />
          </span>
          <span>
            Smart<span className="brand-light"> Environment</span>
            <small>MONITORAMENTO AMBIENTAL</small>
          </span>
        </a>
        <div className="header-actions">
          <ConnectionStatus connection={connection} error={error} />
          <ThemeToggle />
        </div>
      </header>
      <main className="content" id="overview">
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              Visão geral <span>/</span> {deviceId}
            </p>
            <h1>Uma sala. Cada sinal.</h1>
            <p>As condições do seu ambiente, em tempo real.</p>
          </div>
          <span className="project-label">
            Projeto IoT <span>TP546</span>
          </span>
        </div>
        {error && (
          <div className="notice notice-error" role="alert">
            <Icon name="alert" />
            <span>{error}</span>
          </div>
        )}
        <EnvironmentSummary
          status={status}
          online={online}
          telemetry={telemetry}
          now={now}
        />
        <section className="metrics-grid" aria-label="Leituras dos sensores">
          {metrics.map((item) => (
            <MetricCard
              key={item.key}
              metric={item}
              telemetry={telemetry}
              history={history}
              status={status}
              online={online}
            />
          ))}
        </section>
        <div className="analysis-grid">
          <RealtimeChart
            history={history}
            metric={metric}
            onMetricChange={setMetricKey}
            online={online}
          />
          <RoomStatus
            telemetry={telemetry}
            deviceState={deviceState}
            online={online}
            now={now}
            deviceId={deviceId}
          />
        </div>
        <div className="details-grid">
          <Alerts status={status} telemetry={telemetry} />
          <RecentEvents history={history} />
        </div>
        <Scenarios {...environment} />
        <footer>
          <span>
            <Icon name="activity" />
            Smart Environment <span className="footer-divider">/</span> TP546
          </span>
          <span>
            Desenvolvido por{" "}
            <a
              href="https://github.com/AlvaroLucioRibeiro"
              target="_blank"
              rel="noopener noreferrer"
            >
              Álvaro L. A. Ribeiro
            </a>{" "}
            e{" "}
            <a
              href="https://github.com/matheusAFONSECA"
              target="_blank"
              rel="noopener noreferrer"
            >
              Matheus H. F. Afonso
            </a>
          </span>
        </footer>
      </main>
    </div>
  )
}

createRoot(document.getElementById("root")).render(<App />)
