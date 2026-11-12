# Contrato MQTT 1.0

Prefixo padrão: `iot/environment/{device_id}`. IDs aceitam letras ASCII, números,
underscore e hífen, com 1 a 64 caracteres. A configuração rejeita curingas.

## Telemetria

Exemplo ilustrativo, sem representar uma medição real:

```json
{
  "schema_version": "1.0",
  "device_id": "room01",
  "timestamp": "2026-11-09T18:00:00Z",
  "source": "simulator",
  "scenario": "normal",
  "temperature": 24.5,
  "humidity": 57.2,
  "co2": 720.0,
  "light": 430.0,
  "presence": true
}
```

| Campo | Unidade ou domínio |
|---|---|
| `temperature` | °C |
| `humidity` | Umidade relativa em % |
| `co2` | ppm, concentração de CO₂ |
| `light` | lux |
| `presence` | Booleano JSON, nunca texto |
| `timestamp` | ISO 8601 com fuso horário. Publicador usa UTC |
| `source` | `simulator`, `esp32` ou `raspberry` |
| `scenario` | Um dos seis cenários, ou `null` para hardware |

O contrato validado fica em `src/common/models.py`. Números não finitos, campos
extras e timestamps sem fuso são rejeitados. O schema permite faixas de sensores
físicos mais amplas que os limites escolhidos para a simulação.

Uma mensagem conjunta preserva a associação temporal entre variáveis e reduz
assinaturas. A desvantagem é transmitir o conjunto mesmo quando apenas uma leitura
muda. Novas versões incompatíveis devem mudar `schema_version` e a validação.

## Alertas

`alerts` é um snapshot completo, publicado no mesmo ciclo que a telemetria:

```json
{
  "schema_version": "1.0",
  "device_id": "room01",
  "timestamp": "2026-11-09T18:00:00Z",
  "source": "simulator",
  "active": [{
    "code": "co2_high",
    "message": "CO₂ elevado. Considere melhorar a ventilação.",
    "value": 1600.0,
    "threshold": 1500.0,
    "unit": "ppm"
  }]
}
```

`active=[]` representa resolução. Códigos: `co2_high`, `temperature_high`,
`humidity_low`, `humidity_high` e `light_low`. Telemetria e alertas são publicações
separadas, sem transação atômica. Correlacione `device_id` e `timestamp`.

## Status e comandos

Status: `{"schema_version":"1.0","device_id":"room01","source":"simulator","state":"online"}`.
O mesmo formato com `offline` é usado no encerramento e no Last Will. O broker
detecta falhas abruptas conforme o keepalive, cujo padrão é 30 segundos.

Comando: `{"scenario":"empty"}`. Somente o cenário é aceito. Payloads acima de
1024 bytes, JSON inválido, cenários desconhecidos e mensagens entregues com o bit
Retain são ignorados. A fila guarda apenas o último comando válido. Em MQTT 3.1.1,
um comando publicado com retenção pode chegar sem esse bit a assinantes já
conectados. Por isso, o publicador do comando deve sempre desabilitar Retain.

## Entrega e persistência

QoS 1 fornece entrega pelo menos uma vez, admitindo duplicatas. O cliente usa
sessão limpa e refaz a assinatura ao reconectar. O broker persiste os snapshots
retidos em volume Docker. Retenção não constitui série histórica. Não há banco
de dados ou fila durável de leituras no simulador.

Referências técnicas: [Paho Python](https://eclipse.dev/paho/files/paho.mqtt.python/html/),
[Mosquitto](https://mosquitto.org/man/mosquitto-conf-5.html) e
[MQTT 3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html).
