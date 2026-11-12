# Hardware previsto

A montagem física é uma evolução. Nenhum sensor real foi medido nesta entrega.
O desenho abaixo toma como referência um ESP32-DevKitC com SDA no GPIO21 e SCL no
GPIO22. Outras placas ESP32, inclusive Feather, exigem conferir seu pinout.

| Componente | Função | Interface e conexão proposta | Alimentação |
|---|---|---|---|
| ESP32-DevKitC | Aquisição e MQTT por Wi-Fi | USB, GPIO21 SDA e GPIO22 SCL | USB conforme a placa, lógica 3,3 V |
| BME280 | Temperatura e umidade | I²C, SDA21/SCL22, endereço 0x76 ou 0x77 | Breakout compatível com 3,3 V |
| SCD40 ou SCD41 | CO₂ por princípio fotoacústico NDIR | I²C, SDA21/SCL22, endereço 0x62 | Sensor: 2,4 a 5,5 V, conferir breakout |
| BH1750 | Iluminância | I²C, SDA21/SCL22, endereço 0x23 ou 0x5C | Breakout compatível com 3,3 V |
| PIR HC-SR501 | Movimento como indício de presença | Saída digital para GPIO27 | Conferir módulo, normalmente alimentação 5 V |
| LED e resistor | Possível indicação de alerta | GPIO25, resistor em série | Lógica 3,3 V |
| Fonte USB, protoboard e jumpers | Alimentação e montagem | Terra comum, conexões curtas | Compatível com a placa escolhida |

Nunca assumir que um breakout aceita a mesma tensão do chip nu. Pull-ups de I²C
devem preservar lógica de 3,3 V no ESP32. Verifique a tensão da saída do PIR antes
de conectá-la. Use somente LED ou carga DC de baixa tensão em futura demonstração
de atuação.

O BME280 usa elementos de sensoriamento de umidade e temperatura e comunica-se
por I²C ou SPI. O BH1750 converte luz em uma medida digital de iluminância.
O PIR detecta variações infravermelhas associadas a movimento, não identidade ou
contagem de pessoas. Pessoas imóveis podem não ser detectadas.

O SCD4x mede CO₂ por tecnologia fotoacústica NDIR, sem tratar VOC como CO₂. A
folha de dados v1.3 especifica a faixa de exatidão de 400 a 2000 ppm para SCD40 e
de 400 a 5000 ppm para SCD41. Para reproduzir fisicamente o cenário até 2400 ppm,
prefira SCD41. A faixa de saída digital não deve ser confundida com a faixa de
exatidão especificada. O MH-Z19B por UART é uma alternativa a avaliar conforme a
folha de dados do módulo adquirido. O DHT22 pode substituir o BME280 em um
protótipo simplificado, mudando driver e interface.

O período de cinco segundos serve à demonstração e é compatível com o modo
periódico padrão SCD4x. Em produto, considere consumo, latência, ocupação da rede
e dinâmica do ambiente. Calibração, aquecimento e compensação devem seguir as
instruções do fabricante. Posicione o sensor de CO₂ longe da expiração direta,
janelas e saídas de ar para uma leitura representativa.

## Fontes

- [ESP32-DevKitC e pinout, Espressif](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/hw-reference/esp32/get-started-devkitc.html).
- [BME280, Adafruit](https://learn.adafruit.com/adafruit-bme280-humidity-barometric-pressure-temperature-sensor-breakout/overview).
- [SCD40/SCD41, folha de dados Sensirion v1.3, setembro de 2022](https://sensirion.com/media/documents/E0F04247/631EF271/CD_DS_SCD40_SCD41_Datasheet_D1.pdf).
- [BH1750, Adafruit](https://learn.adafruit.com/adafruit-bh1750-ambient-light-sensor/overview).
- [Posicionamento de CO₂, HSE](https://www.hse.gov.uk/ventilation/using-co2-monitors.htm).

Consulte também o [plano de firmware](../src/physical/esp32/integration.md).
