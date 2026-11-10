# Mercado e viabilidade

Consulta realizada em 9 de novembro de 2026. A comparação abaixo utiliza páginas
do fabricante. São características anunciadas, não resultados de um ensaio
comparativo realizado neste projeto.

## Soluções existentes

| Solução | Sensores anunciados | Conectividade e visualização | Público e diferença relevante |
|---|---|---|---|
| Airthings View Plus | CO₂, radônio, PM2.5, VOC, temperatura, umidade e pressão | Wi-Fi, aplicativo e tela | Monitoramento residencial. Mede poluentes que este protótipo não contempla |
| Airthings Wave Plus | CO₂, radônio, VOC, temperatura, umidade e pressão | Bluetooth, aplicativo e SmartLink com hub compatível | Uso residencial. Acesso remoto depende da conexão apropriada com hub |
| Smart Environment | Temperatura, umidade, CO₂, luz e presença simulados | MQTT local e MQTTX | Ensino e prototipação. Hardware e desempenho ambiental ainda não validados |

Fontes: [View Plus](https://www.airthings.com/products/indoor-air-quality/view-plus),
[manual Wave Plus](https://www.airthings.com/manuals/wave-plus) e
[especificações Wave Plus](https://help.airthings.com/en/articles/6320631-wave-plus-sensor-accuracy).

O catálogo comparativo indexado do fabricante indicava US$ 329,99 para View Plus
e US$ 249,99 para Wave Plus. Esses valores são referências internacionais. A
extração da página dinâmica não confirmou o preço final de compra, frete ou
tributação. Não equivalem a cotação no Brasil. Consulte o
[catálogo do fabricante](https://www.airthings.com/compare-products) antes de comprar.

## O que o projeto oferece

O valor da proposta acadêmica é permitir estudar e modificar todo o fluxo:
sensores simulados, contrato JSON, broker local, cenários, regras e consumidores.
Luz e presença ajudam a discutir uso do ambiente. O contrato MQTT permite conectar
novos consumidores e migrar a aquisição para hardware.

Essas propriedades são opções de projeto, não comprovação de exclusividade no
mercado. Também não há evidência de que o protótipo seja superior a monitores
comerciais em precisão, custo total, manutenção ou facilidade de uso. Sensores
comerciais adicionais, gabinete, calibração e suporte afetam a comparação.

## Estimativa de protótipo

Como referência internacional, o orçamento abaixo utiliza módulos de varejo
identificáveis. Valores unitários aproximados observados em resultados indexados
de catálogos, sem garantia de disponibilidade. A escolha final de fornecedores
locais e placa permanece aberta.

| Item de referência | Valor em US$ | Fonte |
|---|---:|---|
| ESP32 Feather V2, alternativa de placa ESP32 | 19,95 | [Adafruit, item 5400](https://www.adafruit.com/product/5400) |
| Breakout SCD40 | 44,95 | [DigiKey, item Adafruit 5187](https://www.digikey.com/en/products/detail/adafruit-industries-llc/5187/15194668) |
| Breakout BME280 | 14,95 | [Adafruit](https://learn.adafruit.com/adafruit-bme280-humidity-barometric-pressure-temperature-sensor-breakout/overview) |
| Breakout BH1750 | 4,50 | [DigiKey, item Adafruit 4681](https://www.digikey.com/en/products/detail/adafruit-industries-llc/4681/12760934) |
| Subtotal dos quatro módulos | **84,35** | Soma dos itens acima |

O subtotal não inclui PIR, gabinete, alimentação, cabos, protoboard, montagem,
frete, impostos, calibração ou suporte. Como hipótese de planejamento, reservar
US$ 30 a US$ 60 para os acessórios e montagem produz um intervalo inicial de
**US$ 114,35 a US$ 144,35**, ainda sem frete, impostos ou calibração. Essa reserva
é uma premissa, não uma cotação. Um orçamento de produto exige precificar esses
itens separadamente e não pode ser inferido do subtotal de módulos.

A Feather é uma referência de custo, enquanto a pinagem documentada usa
ESP32-DevKitC. Deve-se adaptar a pinagem ao comprar a placa. Para a faixa de CO₂
até 2400 ppm, prefira SCD41 no projeto físico e atualize a estimativa. O SCD40
tem exatidão especificada até 2000 ppm na folha de dados consultada.

## Modelo comercial e condições de viabilidade

Uma possibilidade é vender o dispositivo com instalação e suporte. Outra é
oferecer monitoramento de múltiplas salas com manutenção e serviço de histórico.
A assinatura só se justificaria com serviço contínuo, confiabilidade e valor
mensurável para o cliente. Não há previsão de receita ou margem validada.

Para escolas e escritórios, um piloto poderia avaliar alertas compreensíveis,
continuidade das leituras, manutenção e adoção por responsáveis pelo ambiente.
Economia de energia e melhoria de conforto precisariam de métricas e comparação
antes/depois com controle das condições. Integração HVAC ou iluminação acrescenta
responsabilidades de controle e não está implementada.

Antes de comercializar, seriam necessários montagem e ensaio físico, calibração,
orçamento nacional, análise de requisitos regulatórios, segurança MQTT, política
de dados e suporte. A simulação atual demonstra a arquitetura de software, sem
validar viabilidade econômica de um produto final.
