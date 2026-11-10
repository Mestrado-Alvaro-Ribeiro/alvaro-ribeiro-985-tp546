# Visualização e controle com MQTTX

O MQTTX é a interface da entrega atual, conforme a alternativa permitida pelo
enunciado. Não há servidor web, conta Blynk ou token externo necessário.

## Conectar

1. Inicie o projeto com `docker compose up --build -d`.
2. Instale e abra o [MQTTX Desktop](https://mqttx.app/).
3. Crie uma conexão chamada `Smart Environment`, com protocolo MQTT 3.1.1,
   host `localhost`, porta `1883` e client ID `mqttx-demo`.
4. Deixe usuário, senha e TLS desabilitados para o broker local padrão.
5. Assine `iot/environment/room01/#`, QoS 1, e selecione a exibição JSON.

Se `MQTT_PORT`, `TOPIC_PREFIX` ou `DEVICE_ID` tiverem sido alterados, ajuste a
conexão e os tópicos. MQTTX é executado no computador, fora da rede Docker.

## Demonstrar

Em `telemetry`, observe as cinco variáveis e o timestamp em UTC. `source=simulator`
identifica explicitamente as leituras sintéticas. `status` informa se o publicador
está conectado. `alerts` contém a lista completa de condições ativas.

Publique em `iot/environment/room01/commands`, QoS 1, Retain **desmarcado**:

```json
{"scenario":"poor_ventilation"}
```

Observe a subida gradual de `co2`. Partindo do cenário normal, o limiar de 1500 ppm
é alcançado aproximadamente no primeiro a segundo minuto, dependendo da leitura
inicial. O alerta `co2_high` aparecerá em `alerts`.

Em seguida, envie:

```json
{"scenario":"empty"}
```

Mostre a queda de CO₂ e a resolução abaixo da margem de histerese. Troque para
`night` e mostre presença falsa e luminosidade decrescente. A leitura numérica e
o JSON atendem à demonstração pelo MQTTX. Gráficos não foram implementados.

## Retenção e dados antigos

O broker entrega imediatamente a última leitura retida para novos assinantes.
Isso não significa que o sensor está online. Verifique `status` e o timestamp.
Se um comando foi publicado com Retain ligado por engano, limpe esse tópico com
um payload de zero bytes e Retain ligado. Depois envie o comando correto sem
retenção. Entregas retidas recebidas ao assinar o tópico são ignoradas pelo cliente.

## Se não chegar mensagem

Verifique `docker compose ps` e `docker compose logs --tail=30`. Use `localhost`
no MQTTX e `mosquitto` somente entre contêineres. Confirme que a porta 1883 está
livre e que não existe outro cliente usando `simulator-room01`. Dois simuladores
precisam de identificadores diferentes.
