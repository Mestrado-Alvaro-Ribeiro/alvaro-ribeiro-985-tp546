import { useEffect, useRef, useState } from "react"
import mqtt from "mqtt"
import { initialState, receiveMessage, isFresh, scenarios } from "./state.js"

export const deviceId = import.meta.env.VITE_DEVICE_ID
const topic = `${import.meta.env.VITE_TOPIC_PREFIX}/${deviceId}`
const maxAge = Math.max(
  15000,
  Number(import.meta.env.VITE_PUBLISH_INTERVAL) * 3000,
)

export function useEnvironment() {
  const [state, setState] = useState(initialState)
  const [connection, setConnection] = useState("connecting")
  const [error, setError] = useState("")
  const [subscriptionError, setSubscriptionError] = useState("")
  const [commandMessage, setCommandMessage] = useState("")
  const [pending, setPending] = useState(null)
  const [now, setNow] = useState(Date.now())
  const clientRef = useRef(null)
  const { telemetry, deviceState } = state
  const fresh = isFresh(telemetry, now, maxAge)
  const online = connection === "connected" && deviceState === "online" && fresh

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
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
    )
    clientRef.current = client
    client.on("connect", () => {
      client.subscribe(
        ["telemetry", "alerts", "status"].map((kind) => `${topic}/${kind}`),
        { qos: 1 },
        (err, granted) => {
          if (err || granted?.some((grant) => grant.qos === 128)) {
            setSubscriptionError(
              "Não foi possível assinar os dados do dispositivo.",
            )
            setConnection("error")
          } else {
            setConnection("connected")
            setSubscriptionError("")
            setError("")
          }
        },
      )
    })
    client.on("reconnect", () => setConnection("connecting"))
    client.on("close", () => setConnection("disconnected"))
    client.on("error", () =>
      setError("Falha na conexão MQTT. Tentando reconectar…"),
    )
    client.on("message", (receivedTopic, payload) => {
      const kind = receivedTopic.slice(topic.length + 1)
      if (
        receivedTopic !== `${topic}/${kind}` ||
        !["telemetry", "alerts", "status"].includes(kind)
      )
        return
      try {
        // Validate before React schedules its state updater so invalid payloads stay recoverable.
        receiveMessage(initialState, kind, payload.toString(), deviceId)
        setState((previous) =>
          receiveMessage(previous, kind, payload.toString(), deviceId),
        )
        setError("")
      } catch (err) {
        setError(`Mensagem ignorada: ${err.message}`)
      }
    })
    return () => {
      clearInterval(timer)
      clientRef.current = null
      client.end(true)
    }
  }, [])

  useEffect(() => {
    if (!pending) return
    if (
      telemetry?.scenario === pending.scenario &&
      Date.parse(telemetry.timestamp) > pending.after
    ) {
      setCommandMessage(
        `Cenário confirmado: ${scenarios[pending.scenario].label}.`,
      )
      setPending(null)
    } else if (now - pending.sentAt > maxAge + 5000) {
      setCommandMessage(
        "O dispositivo não confirmou a mudança. Verifique a conexão e tente novamente.",
      )
      setPending(null)
    }
  }, [telemetry, pending, now])

  function changeScenario(scenario) {
    if (!online || pending || !clientRef.current?.connected) return
    const sentAt = Date.now()
    setPending({ scenario, sentAt, after: Date.parse(telemetry.timestamp) })
    setCommandMessage(`Aguardando confirmação: ${scenarios[scenario].label}…`)
    clientRef.current.publish(
      `${topic}/commands`,
      JSON.stringify({ scenario }),
      { qos: 1, retain: false },
      (err) => {
        if (err) {
          setPending(null)
          setCommandMessage(
            "Não foi possível enviar o comando. Tente novamente.",
          )
        }
      },
    )
  }

  return {
    ...state,
    connection,
    error: subscriptionError || error,
    pending,
    commandMessage,
    now,
    online,
    changeScenario,
  }
}
