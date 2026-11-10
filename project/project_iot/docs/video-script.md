# Roteiro de vídeo: até dez minutos

Meta: 9 minutos e 30 segundos, com 30 segundos de margem. Grave a demonstração
real do MQTTX e dos serviços. Não apresente leituras simuladas como medições físicas.

## Preparação

Inicie `docker compose up --build -d` antes da gravação. Conecte o MQTTX,
assine `iot/environment/room01/#` e mantenha os tópicos de telemetria e alertas
visíveis. Deixe os comandos `poor_ventilation`, `empty` e `night` preparados,
com Retain desligado. Confira a duração e a legibilidade antes do envio.

| Tempo | Conteúdo e fala orientadora |
|---|---|
| 0:00–0:40 | Apresentação: Smart Environment, problema de acompanhar condições de salas fechadas |
| 0:40–1:20 | Proposta: cinco variáveis, MQTT e informação útil para decidir sobre ventilação |
| 1:20–2:00 | Arquitetura: percepção, rede, aplicação e uso dos alertas. Mostrar diagrama |
| 2:00–2:40 | Hardware futuro: ESP32, BME280, SCD41, BH1750 e PIR. Explicar que a entrega usa Python |
| 2:40–3:20 | MQTT: broker, publish/subscribe, JSON, tópicos, QoS e retenção |
| 3:20–3:50 | Mostrar serviços e telemetria normal no MQTTX. Enviar `poor_ventilation` |
| 3:50–4:50 | Enquanto CO₂ sobe, mostrar `source`, timestamp e cenário. Explicar limites e histerese |
| 4:50–5:30 | Mostrar alerta `co2_high` e enviar `empty`. Mostrar presença falsa |
| 5:30–6:10 | Mostrar CO₂ em queda e lista de alertas limpa após recuperação |
| 6:10–6:50 | Parar e iniciar broker. Mostrar reconexão e nova telemetria com timestamp atualizado |
| 6:50–7:20 | Código e testes: sensores separados, contrato, uv.lock, integração com broker real |
| 7:20–8:10 | Mercado e orçamento: View Plus, Wave Plus e limites da estimativa do protótipo |
| 8:10–8:50 | Integrações futuras, segurança e privacidade. Diferenciar movimento e ocupação |
| 8:50–9:30 | Concluir com fluxo demonstrado, limitações e links da entrega |

Se a rede atrasar, reduza o comentário sobre código para manter o limite. Não
altere números no vídeo para simular um resultado. É permitido preparar o ambiente
antes de gravar, deixando claro qual cenário está ativo.

O vídeo deve ser publicado posteriormente em YouTube não listado ou OneDrive com
permissão de visualização. Teste o link em uma janela sem autenticação antes de
enviar. Nenhum link foi inventado ou incluído como se o vídeo já existisse.
