"""Generate the academic presentation from the implemented project scope."""

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.util import Inches, Pt

BACKGROUND = RGBColor(13, 27, 42)
FOREGROUND = RGBColor(235, 243, 248)
MUTED = RGBColor(161, 181, 196)
ACCENT = RGBColor(53, 214, 166)

SLIDES = [
    (
        "Smart Environment",
        "Monitoramento ambiental com Internet das Coisas",
        [
            "TP546 • Simulação Python + MQTT",
            "Temperatura • Umidade • CO₂ • Luz • Presença",
            "Uma sala simulada, um contrato comum para hardware futuro",
        ],
        "0:00–0:40 | Identificar os integrantes oralmente e apresentar o objetivo.",
        "",
    ),
    (
        "O problema",
        "Como acompanhar as condições de uma sala fechada?",
        [
            "Leituras isoladas dificultam acompanhar mudanças do ambiente.",
            "Ocupação e ventilação alteram a evolução do CO₂.",
            "A proposta reúne dados e regras para apoiar decisões.",
        ],
        "0:40–1:00 | Não afirmar ganhos de saúde ou produtividade medidos pelo projeto.",
        "Referência: HSE • hse.gov.uk/ventilation/using-co2-monitors.htm",
    ),
    (
        "O produto proposto",
        "Dados ambientais que chegam ao usuário",
        [
            "Cinco variáveis publicadas em um broker local.",
            "Alertas configuráveis e visualização no MQTTX.",
            "Cenários controláveis para uma demonstração reproduzível.",
        ],
        "1:00–1:20 | Distinguir produto proposto e protótipo de software entregue.",
        "",
    ),
    (
        "Arquitetura IoT",
        "Do sensoriamento à informação",
        [
            "Percepção: sensores simulados ou hardware futuro.",
            "Rede: Paho, MQTT e Mosquitto. ESP32 acrescentará Wi-Fi.",
            "Aplicação: MQTTX e alertas. Uso: avaliar o ambiente.",
        ],
        "1:20–2:00 | Explicar o fluxo mostrado abaixo.",
        "",
    ),
    (
        "Hardware previsto",
        "Implementação física separada da simulação",
        [
            "ESP32 para aquisição, Wi-Fi e MQTT.",
            "BME280, SCD41, BH1750 e PIR.",
            "Pinagem documentada. Montagem e firmware ainda não validados.",
        ],
        "2:00–2:20 | SCD41 é preferível ao SCD40 para o cenário até 2400 ppm.",
        "Referência: Sensirion • SCD4x datasheet v1.3, setembro de 2022",
    ),
    (
        "O que cada sensor representa",
        "Unidades e limites de interpretação",
        [
            "Temperatura em °C, umidade relativa em % e CO₂ em ppm.",
            "Luminosidade em lux. Presença como booleano.",
            "PIR indica movimento. Não identifica nem conta pessoas.",
        ],
        "2:20–2:40 | CO₂ é medido por sensor próprio, não estimado a partir de VOC.",
        "",
    ),
    (
        "Comunicação MQTT",
        "Publicadores e assinantes desacoplados",
        [
            "O simulador publica. O Mosquitto distribui. O MQTTX assina.",
            "QoS 1 admite duplicatas. Retenção guarda o último snapshot.",
            "Reconexão automática e Last Will informam disponibilidade.",
        ],
        "2:40–3:00 | Retenção não representa um banco de dados histórico.",
        "",
    ),
    (
        "Contrato de dados",
        "Um formato para simulação e hardware",
        [
            "telemetry • alerts • status • commands",
            "JSON 1.0: device_id, timestamp UTC e source.",
            "Origem atual: simulator. Futuro: esp32, com scenario=null.",
        ],
        "3:00–3:20 | O prefixo padrão é iot/environment/room01.",
        "",
    ),
    (
        "Visualização no MQTTX",
        "Mostrar dados e controlar o cenário",
        [
            "Conectar em localhost:1883, MQTT 3.1.1.",
            "Assinar iot/environment/room01/# com QoS 1.",
            "Mostrar as cinco variáveis, timestamp e origem simulada.",
        ],
        "3:20–3:50 | Iniciar captura do MQTTX e enviar poor_ventilation sem Retain.",
        "",
    ),
    (
        "A simulação",
        "Variação suave e cenários explicáveis",
        [
            "Cada sensor mantém estado, limites e ruído pequeno.",
            "normal • crowded • empty • poor_ventilation",
            "high_temperature • night. Sem modelo físico calibrado.",
        ],
        "3:50–4:20 | Mostrar CO₂ subindo enquanto explica os cenários.",
        "",
    ),
    (
        "Alertas e recuperação",
        "Evitar oscilações perto do limiar",
        [
            "CO₂: alerta acima de 1500 ppm, recuperação até 1400 ppm.",
            "Snapshot active=[] limpa as condições anteriores.",
            "O gatilho por amostra é didático. HSE discute níveis persistentes.",
        ],
        "4:20–5:30 | Mostrar co2_high e enviar empty. Não tratar como limite clínico.",
        "Referência: HSE • hse.gov.uk/ventilation/using-co2-monitors.htm",
    ),
    (
        "Demonstração da solução",
        "Subida, alerta, recuperação e reconexão",
        [
            "poor_ventilation → CO₂ sobe → alerta.",
            "empty → CO₂ cai → alerta é resolvido.",
            "Parar e iniciar o broker → observar nova publicação.",
        ],
        "5:30–6:50 | Mostrar timestamps novos depois da queda. Sem editar os resultados.",
        "",
    ),
    (
        "Implementação e testes",
        "Ambiente reproduzível com uv e Docker",
        [
            "pyproject.toml: metadados e dependências. uv.lock: versões.",
            "Sensores, contratos, regras e MQTT em módulos separados.",
            "Testes unitários e integração com Mosquitto real.",
        ],
        "6:50–7:20 | Explicar que uv gerencia o ambiente e Git versiona o código.",
        "",
    ),
    (
        "Produtos existentes",
        "Comparar sem presumir superioridade",
        [
            "View Plus: sete sensores, Wi-Fi, aplicativo e tela.",
            "Wave Plus: seis sensores, Bluetooth e hub para acesso remoto.",
            "O protótipo enfatiza código modificável e MQTT local.",
        ],
        "7:20–7:45 | O projeto não mede radônio, VOC ou partículas.",
        "Fontes: airthings.com/compare-products • airthings.com/manuals/wave-plus",
    ),
    (
        "Viabilidade comercial",
        "Orçamento parcial, custos ainda abertos",
        [
            "Quatro módulos de referência: aproximadamente US$ 84,35.",
            "Com reserva hipotética de US$ 30–60: US$ 114,35–144,35.",
            "Sem frete, impostos ou calibração. Não é cotação brasileira.",
        ],
        "7:45–8:10 | Reserva inclui acessórios e montagem. Atualizar custo ao escolher SCD41.",
        "Fontes e premissas: docs/market.md • Adafruit e DigiKey",
    ),
    (
        "Benefícios e integrações",
        "O que um piloto poderia avaliar",
        [
            "Acompanhamento de salas e clareza dos alertas.",
            "Home Assistant, histórico e APIs como evolução.",
            "HVAC e iluminação exigem regras próprias de atuação.",
        ],
        "8:10–8:30 | Economia de energia e conforto são hipóteses, não resultados medidos.",
        "",
    ),
    (
        "Segurança e privacidade",
        "Da demonstração local ao uso em campo",
        [
            "Broker local anônimo exposto somente em loopback por padrão.",
            "Em campo: autenticação, ACL por dispositivo e TLS.",
            "Sem câmera. Presença também exige controle de acesso e retenção.",
        ],
        "8:30–8:50 | Dois dispositivos devem ter IDs exclusivos.",
        "",
    ),
    (
        "Conclusão",
        "O fluxo IoT pode ser demonstrado por software",
        [
            "Sensoriamento → MQTT → visualização → alertas.",
            "Mesmo contrato preparado para evolução física.",
            "Próximos passos: hardware, vídeo e publicação da entrega.",
        ],
        "8:50–9:30 | Encerrar em até dez minutos e informar onde estarão os arquivos.",
        "",
    ),
]


def _textbox(slide, x, y, width, height, text, size, color, bold=False):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(width), Inches(height))
    frame = box.text_frame
    frame.word_wrap = True
    frame.margin_left = 0
    frame.margin_top = 0
    paragraph = frame.paragraphs[0]
    paragraph.text = text
    paragraph.font.name = "DejaVu Sans"
    paragraph.font.size = Pt(size)
    paragraph.font.color.rgb = color
    paragraph.font.bold = bold
    return box


def _flow(slide):
    for index, label in enumerate(("Sensores", "Python / ESP32", "Mosquitto", "MQTTX")):
        x = 0.8 + index * 3.15
        shape = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(5.7), Inches(2.6), Inches(0.65)
        )
        shape.fill.solid()
        shape.fill.fore_color.rgb = RGBColor(29, 58, 73)
        shape.line.color.rgb = ACCENT
        _textbox(slide, x + 0.12, 5.86, 2.4, 0.4, label, 17, FOREGROUND)
        if index < 3:
            _textbox(slide, x + 2.75, 5.84, 0.4, 0.4, "→", 22, ACCENT)


def main() -> None:
    """Create the 18-slide PowerPoint beside this source file."""
    presentation = Presentation()
    presentation.slide_width = Inches(13.333)
    presentation.slide_height = Inches(7.5)
    presentation.core_properties.title = "Smart Environment | TP546"
    presentation.core_properties.subject = "Simulação IoT com Python, uv e MQTT"
    for number, (title, subtitle, bullets, notes, source) in enumerate(SLIDES, 1):
        slide = presentation.slides.add_slide(presentation.slide_layouts[6])
        slide.background.fill.solid()
        slide.background.fill.fore_color.rgb = BACKGROUND
        _textbox(slide, 0.7, 0.35, 10, 0.3, "SMART ENVIRONMENT   /   TP546", 11, ACCENT, True)
        _textbox(slide, 0.7, 1.0, 12, 0.8, title, 34, FOREGROUND, True)
        _textbox(slide, 0.7, 1.95, 12, 0.7, subtitle, 21, MUTED)
        for index, bullet in enumerate(bullets):
            _textbox(slide, 0.75, 3.05 + index * 0.77, 0.3, 0.4, "•", 23, ACCENT)
            _textbox(slide, 1.2, 3.05 + index * 0.77, 11.3, 0.7, bullet, 23, FOREGROUND)
        if number == 4:
            _flow(slide)
        if source:
            _textbox(slide, 0.7, 6.6, 11.8, 0.4, source, 11, MUTED)
        _textbox(
            slide,
            0.7,
            7.05,
            11.5,
            0.25,
            "Protótipo acadêmico • Dados simulados • Novembro de 2026",
            10,
            MUTED,
        )
        _textbox(slide, 12, 7.0, 0.6, 0.3, f"{number:02d}", 12, ACCENT)
        slide.notes_slide.notes_text_frame.text = notes
    presentation.save(Path(__file__).with_name("smart-environment.pptx"))


if __name__ == "__main__":
    main()
