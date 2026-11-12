import React, { useEffect, useId, useMemo, useRef, useState } from "react"
import { chartGeometry, format, time, metrics } from "./presentation.js"
import { Icon, StatusBadge } from "./components.jsx"

function RealtimeChart({ history, metric, onMetricChange, online }) {
  const panelRef = useRef(null)
  const [width, setWidth] = useState(900)
  const geometry = useMemo(
    () => chartGeometry(history, metric.key, width),
    [history, metric.key, width],
  )
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(240, entry.contentRect.width)),
    )
    observer.observe(panelRef.current)
    return () => observer.disconnect()
  }, [])
  const [selectedTime, setSelectedTime] = useState(null)
  const [interacting, setInteracting] = useState(false)
  const chartId = useId()
  const selectedIndex = Math.max(
    0,
    history.findIndex((sample) => sample.timestamp === selectedTime),
  )
  const selected =
    geometry?.points[
      selectedTime && interacting ? selectedIndex : history.length - 1
    ]
  const coordinates = geometry?.points
    .map((point) => `${point.x},${point.y}`)
    .join(" ")

  function inspectPointer(event) {
    const box = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - box.left) / box.width) * width
    const nearest = geometry.points.reduce((best, point) =>
      Math.abs(point.x - x) < Math.abs(best.x - x) ? point : best,
    )
    setSelectedTime(nearest.sample.timestamp)
    setInteracting(true)
  }

  function inspectKeyboard(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
    event.preventDefault()
    const current = selectedTime ? selectedIndex : history.length - 1
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? history.length - 1
          : Math.max(
              0,
              Math.min(
                history.length - 1,
                current + (event.key === "ArrowRight" ? 1 : -1),
              ),
            )
    setSelectedTime(history[next].timestamp)
    setInteracting(true)
  }

  return (
    <section
      ref={panelRef}
      className="panel trends-panel"
      aria-labelledby={`${chartId}-title`}
      data-sensor={metric.key}
    >
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Evolução das leituras</p>
          <h2 id={`${chartId}-title`}>O ritmo do ambiente</h2>
          <p>{history.length} de até 60 leituras · histórico desta aba</p>
        </div>
        <StatusBadge tone={online ? "success" : "neutral"}>
          {online ? "LIVE" : "Sem atualização"}
        </StatusBadge>
      </div>
      <div className="chart-tabs" role="group" aria-label="Métrica do gráfico">
        {metrics.map((item) => (
          <button
            type="button"
            key={item.key}
            aria-pressed={metric.key === item.key}
            onClick={() => {
              onMetricChange(item.key)
              setSelectedTime(null)
            }}
          >
            <Icon name={item.icon} />
            {item.label}
          </button>
        ))}
      </div>
      {!geometry ? (
        <div className="chart-empty">
          <div className="skeleton chart-skeleton" aria-hidden="true" />
          <Icon name="activity" />
          <h3>
            {history.length
              ? "Mais uma leitura para começar"
              : "Aguardando leituras"}
          </h3>
          <p>O gráfico aparece a partir da segunda leitura recebida.</p>
        </div>
      ) : (
        <>
          <div className="chart-caption">
            <span className="chart-legend">
              <i aria-hidden="true" />
              {metric.label} <span>({metric.unit})</span>
            </span>
            <span>
              {time(history[0].timestamp)} a {time(history.at(-1).timestamp)}
            </span>
          </div>
          <div className="chart-wrap">
            <svg
              className="chart"
              viewBox={`0 0 ${width} 290`}
              role="group"
              tabIndex="0"
              aria-label={`Gráfico de ${metric.label} em ${metric.unit}`}
              aria-describedby={`${chartId}-help ${chartId}-reading`}
              onPointerDown={inspectPointer}
              onPointerMove={inspectPointer}
              onPointerLeave={(event) => {
                if (event.pointerType !== "touch") setInteracting(false)
              }}
              onKeyDown={inspectKeyboard}
              onFocus={() => setInteracting(true)}
              onBlur={() => setInteracting(false)}
            >
              <title>
                {metric.label} ao longo do tempo, em {metric.unit}
              </title>
              {[0, 1, 2, 3].map((index) => (
                <g key={index}>
                  <line
                    className="chart-grid"
                    x1="64"
                    x2={width - 36}
                    y1={40 + (index * 200) / 3}
                    y2={40 + (index * 200) / 3}
                  />
                  <text x="52" y={45 + (index * 200) / 3} textAnchor="end">
                    {format(
                      geometry.high -
                        (index * (geometry.high - geometry.low)) / 3,
                      metric.digits,
                    )}
                  </text>
                </g>
              ))}
              <path className="chart-axis" d={`M64 32V240H${width - 36}`} />
              <polyline points={coordinates} className="chart-line" />
              <line
                className="chart-cursor"
                x1={selected.x}
                x2={selected.x}
                y1="32"
                y2="240"
              />
              <circle
                className="chart-point"
                cx={selected.x}
                cy={selected.y}
                r="5"
              />
              <text x="64" y="268">
                {time(history[0].timestamp)}
              </text>
              <text x={width - 36} y="268" textAnchor="end">
                {time(history.at(-1).timestamp)}
              </text>
            </svg>
            <output
              className="chart-reading"
              id={`${chartId}-reading`}
              aria-live={interacting ? "polite" : "off"}
            >
              <span>{time(selected.sample.timestamp)}</span>
              <strong>
                {format(selected.sample[metric.key], metric.digits)}{" "}
                <small>{metric.unit}</small>
              </strong>
            </output>
          </div>
          <p className="chart-help" id={`${chartId}-help`}>
            Toque ou passe o cursor para inspecionar. Com foco no gráfico, use ←
            e →.
          </p>
          <dl className="chart-stats">
            <div>
              <dt>Mínimo</dt>
              <dd>
                {format(geometry.min, metric.digits)} <span>{metric.unit}</span>
              </dd>
            </div>
            <div>
              <dt>Máximo</dt>
              <dd>
                {format(geometry.max, metric.digits)} <span>{metric.unit}</span>
              </dd>
            </div>
            <div>
              <dt>Última leitura</dt>
              <dd>
                {format(history.at(-1)[metric.key], metric.digits)}{" "}
                <span>{metric.unit}</span>
              </dd>
            </div>
          </dl>
          <details className="chart-data">
            <summary>Ver leituras em tabela</summary>
            <div
              className="table-scroll"
              tabIndex="0"
              role="region"
              aria-label="Leituras da métrica selecionada"
            >
              <table>
                <caption>
                  {metric.label} · últimas {history.length} leituras
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Horário local</th>
                    <th scope="col">
                      {metric.label} ({metric.unit})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((sample) => (
                    <tr key={sample.timestamp}>
                      <td>
                        <time dateTime={sample.timestamp}>
                          {time(sample.timestamp)}
                        </time>
                      </td>
                      <td>{format(sample[metric.key], metric.digits)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  )
}

export default React.memo(RealtimeChart)
