# Plano de testes

Os testes automatizados ficam em `tests/`. A suíte unitária cobre os seis cenários,
faixas, variação suave, semente reprodutível, CO₂ crescente e recuperação,
estabilidade da presença, validação do contrato, configuração e alertas.

A integração utiliza um Mosquitto real. Verifica publicação e recepção QoS 1,
comando de cenário, status online/offline e rejeição de comando retido entregue
após nova assinatura. A queda TCP confirma Last Will, reconexão da mesma instância,
nova publicação e reassinatura de comandos. Sem `RUN_MQTT_TESTS=1`, esses testes são explicitamente
ignorados, não considerados aprovados.

## Execução

```bash
uv sync --locked
docker compose up -d mosquitto
RUN_MQTT_TESTS=1 uv run --locked pytest
make lint
```

O teste de aceite do aplicativo exige o Compose completo com ID `room01`, prefixo
`iot/environment` e limiares padrão. Ele muda o cenário, observa CO₂, correlaciona
telemetria e alertas pelo timestamp, verifica resolução e retorna a `normal`.
Pode levar aproximadamente dois minutos:

```bash
docker compose up --build -d
RUN_MQTT_TESTS=1 RUN_STACK_TESTS=1 uv run --locked pytest
```

## Aceite manual

| Verificação | Ação | Resultado esperado |
|---|---|---|
| Temperatura | Comando `high_temperature` | Subida gradual até o limiar configurado |
| CO₂ | `poor_ventilation`, depois `empty` | Subida, alerta, queda e resolução |
| Presença | `crowded`, depois `night` | Verdadeiro e depois falso |
| Visualização | Assinar `iot/environment/room01/#` | JSON legível com cinco grandezas |
| Broker ausente | Executar Python antes do broker | Tentativas e conexão quando disponível |
| Queda do broker | Parar e iniciar Mosquitto | Simulador permanece ativo e reconecta |
| Encerramento | Parar simulador | Status retido `offline` |
| Falha abrupta | Encerrar processo sem desconexão | Last Will `offline` após detecção |

Para verificar reconexão durante a demonstração, mantenha o MQTTX aberto:

```bash
docker compose stop mosquitto
docker compose start mosquitto
docker compose logs --tail=30 sensor-simulator
```

Ao retomar, procure `mqtt_connected` e novos `sample_published`. O MQTTX também
precisa se reconectar. Um snapshot antigo pode aparecer por retenção. Compare o
timestamp, não apenas a existência de uma mensagem.

`docker compose config --quiet` valida o Compose. O build usa `uv sync --locked`
e falha se o lockfile não corresponder aos metadados. Registre somente testes
realmente executados no relatório de entrega.

## Validação realizada em 9 de novembro de 2026

A suíte completa executou **33 testes com aprovação**, sendo 27 unitários,
cinco de integração MQTT e um de aceite do aplicativo implantado. A execução
levou 78,18 segundos. Esse tempo é o da suíte, não um benchmark de latência IoT.
O teste de aceite observou a geração e resolução do alerta de CO₂ no Compose.

O build Docker e a configuração Compose foram validados. A apresentação de 18
slides foi renderizada com LibreOffice. Todos os títulos e itens de conteúdo
estavam presentes no PDF temporário, com inspeção visual do slide de arquitetura.
Os links locais dos documentos foram verificados.

O MQTTX Desktop não foi operado nesta sessão. A compatibilidade MQTT foi validada
por assinantes Paho e ferramentas do Mosquitto, e o procedimento de uso do MQTTX
está documentado. Hardware físico, vídeo e publicação GitHub não foram executados.
