# Integração física futura com ESP32

Este diretório separa a futura implementação embarcada da simulação. Não contém
firmware apresentado como funcional ou validado. A montagem sugerida está em
[hardware](../../../docs/hardware.md).

## Fluxo de firmware

1. Carregar credenciais de Wi-Fi e MQTT fora dos arquivos versionados.
2. Inicializar I²C e GPIO, testar os sensores e registrar falhas.
3. Conectar ao Wi-Fi, sincronizar relógio por NTP e conectar ao broker.
4. Configurar Last Will `offline` e publicar status `online`.
5. A cada cinco segundos, ler os sensores, validar dados e montar JSON.
6. Publicar em `iot/environment/room01/telemetry` com `source=esp32` e
   `scenario=null`, mantendo o [contrato 1.0](../../../docs/mqtt-contract.md).
7. Reavaliar Wi-Fi e MQTT com tentativas espaçadas, sem bloquear a aquisição.

O cliente embarcado escolhido deve suportar o QoS de publicação definido no
contrato. A biblioteca ESP-MQTT do ESP-IDF é uma opção a avaliar. Não assumir que
todos os clientes Arduino suportam publicação QoS 1.

Falhas de sensor não devem virar zeros plausíveis. Nesta versão do contrato,
todos os sensores são obrigatórios. Se algum falhar, omitir a amostra completa e
registrar o erro. Uma evolução poderá definir campos de qualidade e valores
ausentes em uma nova versão do schema.

`commands` controla cenários de simulação e não deve acionar hardware. Para
atuadores futuros, definir um contrato próprio com autorização, limites e
confirmação. Para alertas físicos, portar as regras e histerese ou criar um
subscriber central. A camada de visualização continuará usando o mesmo JSON.

## Validação antes de demonstrar hardware

- Confirmar pinagem e tensões para a placa e os breakouts realmente adquiridos.
- Verificar endereços I²C e dados plausíveis de cada sensor.
- Comparar medidas com instrumento de referência e documentar limitações.
- Confirmar UTC, reconexão, Last Will e recepção no MQTTX.
- Configurar autenticação, ACL e TLS antes de ampliar o acesso de rede.
