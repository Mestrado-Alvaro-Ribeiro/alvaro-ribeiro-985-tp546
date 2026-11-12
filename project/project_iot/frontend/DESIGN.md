# Smart Environment: direção visual

## Intenção
Instrumento de acompanhamento de uma sala, com leitura rápida de condições e
conectividade. Direção escura e contida definida pelo briefing do usuário.
CO₂ é o ponto de destaque, enquanto as outras métricas têm o mesmo vocabulário.

## Tokens
Definidos em `src/style.css`. Fundo `#0d1418`, superfície `#151f25`, superfície
elevada `#1b2931`, texto `#edf3f3`, texto secundário `#a8bac3`, destaque/sucesso
`#9bddce`, atenção `#f3c58a` e erro `#ffa7a7`. Cor acompanha texto de estado.
Escala de espaçamento: 4, 8, 12, 16, 24, 32 e 48 px. Painéis com raio de 16 px.

DM Sans para interface e Manrope para títulos e números, hospedadas localmente
com suas licenças OFL. Texto de apoio a partir de 12 px, corpo de 15 px, títulos
de seção de 18–22 px e valores de 32–48 px. Pequenos rótulos de categoria usam
10–11 px e não carregam informação essencial sozinhos.

## Composição
Desktop: cabeçalho, resumo ambiental, quatro métricas, gráfico ao lado da sala,
alertas/eventos e seis cenários. Tablet: métricas em duas colunas. Celular:
métricas em uma coluna, começando por CO₂, e painéis empilhados.

O cabeçalho tem a única transparência com blur. Os painéis de conteúdo são
opacos. SVGs próprios usam um único traço e são ocultos da árvore acessível
quando o texto adjacente já comunica seu significado.

## Estados e interação
LIVE depende de conexão, estado online e leitura recente. O resumo ambiental
espera alertas correspondentes ao timestamp da telemetria. Dados retidos antigos
continuam visíveis, identificados como antigos. Não existem faixas de conforto
ou gravidade inventadas no frontend.

Skeletons não representam valores de sensores. Mudanças de valor têm uma
transição curta de cor. Preferências de movimento e transparência reduzidos são
respeitadas. O gráfico tem cursor por mouse/toque, navegação por setas e tabela
alternativa. O eixo horizontal representa tempo decorrido, inclusive intervalos
irregulares. A linha liga as leituras recebidas, sem interpolar novos dados.

## Referências aplicadas
- Impeccable: hierarquia, contexto operacional, tokens, consistência de ícones,
  revisão de estados e detector de interface.
- Apple Design: `accessibility.md`, clareza de controles e redução de efeitos.
- Scientific Plot Maker: unidades, eixos e legibilidade. O tema escuro segue o
  briefing em lugar do tema branco de figuras científicas.

O briefing explícito prevalece sobre sorteio de direção estética da Impeccable.

## Alternância de tema
O cabeçalho oferece tema claro e escuro, com escuro como padrão, independentemente
da preferência do sistema. A escolha é salva no navegador e restaurada antes da
renderização do dashboard. Se o armazenamento estiver indisponível, o botão
continua funcionando durante a visita.

O tema claro remapeia os mesmos tokens: fundo `#f3f6f7`, superfície branca, texto
`#182b33`, texto secundário `#4c626e` e destaque `#176759`. Gráficos, alertas,
seleções, foco e estados de erro usam cores específicas para cada tema. A troca
não recarrega a página nem reinicia a conexão MQTT ou o histórico.
