# Plano de implementação

Data: 9 de novembro de 2026.

## Escopo e decisões

Os dois textos fornecidos definem a arquitetura. A especificação de implementação
prioriza simulação, Mosquitto e MQTTX, com o hardware documentado separadamente.
O caminho explícito `project/project_iot` prevalece sobre a pasta vazia `projects`.
O trabalho ocorre na branch existente, sem criar branches ou commits.

Python 3.12, uv, pyproject.toml e uv.lock sustentam o ambiente local e o contêiner.
MQTTX atende à visualização exigida. Blynk e um painel web adicional ficam como
evolução, pois não são necessários ao fluxo de aceite. O contrato JSON é comum à
simulação e ao hardware futuro. Diagramas são descritos em Mermaid.

## Etapas e verificação

- [x] Configuração, contrato Pydantic e sensores. Testar limites, progressão,
  reprodutibilidade, cenários, valores não finitos e configuração inválida.
- [x] Alertas com histerese e snapshots. Testar ativação, resolução e presença.
- [x] Paho e execução. Testar publicação real, comandos, retenção, status e
  reconexão com Mosquitto. Mensagens antigas não devem controlar o simulador.
- [x] Compose com healthcheck e Makefile. Validar configuração, construir e
  executar os serviços usando o lockfile.
- [x] README, contrato MQTT, hardware, mercado, viabilidade, apresentação PPTX
  e roteiro de até dez minutos. Verificar fontes, caminhos e arquivo PowerPoint.

## Limites de evidência

Os dados são sintéticos e não validam desempenho de sensores físicos. Limiares
de conforto são parâmetros demonstrativos. O limiar de CO₂ será contextualizado
por referência de ventilação, sem interpretação clínica. Não inventar medições,
preços locais, gravação de vídeo ou publicação no GitHub.

## Registro

Repositório inspecionado: não havia implementação ou testes IoT. Docker disponível
após autorização de acesso ao socket. Os testes permanentes foram solicitados nos
anexos. Arquivos de diagnóstico temporários serão removidos após a validação.

Revisão independente do código concluída. Mantidos IDs determinísticos por
dispositivo e exigência de unicidade, para não ocultar dois publicadores disputando
o mesmo tópico. Broker anônimo limitado a loopback como escolha de demonstração.
Variáveis desconhecidas do ambiente do sistema não são rejeitadas. Campos
reconhecidos recebem validação. Acrescentado teste de falha TCP para verificar
Last Will, reconexão e nova assinatura com a mesma instância.
