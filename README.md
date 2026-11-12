# TP546

Repositório dedicado às atividades e aos projetos da disciplina TP546 do curso de mestrado do Instituto Nacional de Telecomunicações (Inatel).

## Atividades

1. [Estacionamentos inteligentes com RSSF](activities/activitie_1/README.md) — [abrir o relatório em PDF](activities/activitie_1/main.pdf)
2. [Estudo de caso de IoT na agricultura](activities/activitie_2/README.md) — [abrir o relatório em PDF](activities/activitie_2/main.pdf)
3. [Estudo de IoT no âmbito de segurança](activities/activitie_3/README.md) — [abrir o relatório em PDF](activities/activitie_3/main.pdf)

## Projetos

### [Smart Environment: monitoramento ambiental com IoT](project/project_iot/README.md)

O projeto em `project/project_iot` simula uma sala com sensores de temperatura,
umidade, CO₂, luminosidade e presença. O Python publica os dados com Paho MQTT
em um broker Mosquitto, e o MQTTX permite acompanhar as leituras, os alertas e
alterar os cenários de simulação.

| Caminho no projeto IoT | Conteúdo |
|---|---|
| `src/simulator/` | Sensores simulados, cenários, regras de alerta e cliente MQTT |
| `src/common/` | Configuração, contratos das mensagens e logs |
| `src/physical/esp32/` | Documentação para a futura implementação física |
| `mqtt/` e `docker-compose.yml` | Broker Mosquitto e execução dos serviços com Docker |
| `dashboard/` | Guia de conexão, visualização e comandos no MQTTX |
| `tests/` | Testes unitários, integração MQTT e aceite do ambiente completo |
| `docs/` | Arquitetura, hardware, mercado, viabilidade e roteiro de demonstração |
| `presentation/` | Apresentação PowerPoint |

O ambiente Python usa **uv**. A versão compatível do Python, restrita à série
**3.12**, os metadados e as dependências estão no
[`pyproject.toml`](project/project_iot/pyproject.toml). O
[`uv.lock`](project/project_iot/uv.lock) registra as versões resolvidas.
As configurações locais ficam em `.env`, ignorado pelo Git. O
[`.env.example`](project/project_iot/.env.example) fornece os valores iniciais.

Para iniciar a demonstração com Docker Compose, a partir da raiz do repositório:

```bash
cd project/project_iot
cp -n .env.example .env
docker compose up --build -d
```

O comando de cópia preserva um `.env` existente. No MQTTX, conecte-se a
`localhost:1883` e assine `iot/environment/room01/#`.

- [Guia completo de execução, configuração e testes](project/project_iot/README.md).
- [Apresentação PowerPoint](project/project_iot/presentation/smart-environment.pptx).

As leituras são simuladas. A montagem física com ESP32 é uma evolução documentada.
