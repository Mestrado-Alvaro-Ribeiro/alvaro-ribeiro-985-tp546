# Smart Environment
<!-- impeccable:product-schema 1 -->

## Platform
web

## Users and purpose
Dashboard de monitoramento ambiental para demonstração acadêmica de IoT na
disciplina TP546. A pessoa deve reconhecer o estado da sala, identificar o sensor
com alerta, acompanhar sua evolução e verificar a conexão.

## Capabilities and constraints
- React 19, Vite e MQTT.js, com Mosquitto por WebSocket em `/mqtt`.
- Temperatura, umidade, CO₂, luminosidade e presença. Seis cenários simulados.
- Alertas com limites configuráveis e histerese calculados pelo simulador.
- Histórico de até 60 leituras na memória da aba. Não há armazenamento histórico.
- Fontes aceitas pelo contrato: simulator, esp32 e raspberry.
- Preservar contratos, tópicos, confirmação de comandos e integração Docker.
- Manter textos em português, conforme a interface existente (decisão de implementação).

## Brand commitments
O briefing solicita identidade própria, escura, profissional, com CO₂ prioritário,
hierarquia clara, efeitos discretos e princípios de clareza inspirados na Apple.
Não utilizar aparência gamer ou neon excessivo.

## Evidence
`../README.md`, `src/state.js`, `../src/simulator/services/alerts.py` e o briefing
de reformulação fornecido pelo usuário. Leituras são simuladas, não experimentais.

## Accessibility
Estados com texto, foco visível, teclado, contraste legível, redução de movimento
e adaptação a desktop, tablet e celular.
