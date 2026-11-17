# Atividade 4 — Redes veiculares

[Abrir o artigo em PDF](main.pdf)

**Comunicação V2X para alertas de colisão em cruzamentos sem visada direta:
estudo de caso e análise dos requisitos de rede.**

Artigo em português com os mesmos autores e a mesma instituição das atividades
anteriores. Utiliza a classe `IEEEtran` em modo `conference`, papel A4 e duas
colunas, sem capa separada. O PDF tem **7 páginas**, incluindo referências.

O texto analisa um caso publicado, relaciona a oportunidade do alerta à rede
veicular e apresenta cálculos ilustrativos próprios. Não relata experimentos
realizados pelos autores da atividade. Os cálculos não são recomendações de
condução nem resultados de campo.

## Organização

- `main.tex`: fonte editável do artigo;
- `main.pdf`: artigo compilado;
- `referencias.bib`: referências científicas, técnicas e fontes das imagens;
- `articles/`: cópia de uma fonte aberta e links para as demais;
- `images/`: imagens fornecidas, das quais duas são utilizadas no artigo, com fontes documentadas em `images/README.md`;
- `materials/enunciado.md`: requisitos fornecidos;
- `materials/evidencias.md`: localização das evidências e conferência dos cálculos;
- `materials/planejamento.md`: recorte e critérios de preparação.

## Compilação

Com TeX Live ou distribuição equivalente, incluindo `IEEEtran`, `acro`, TikZ,
BibTeX e os pacotes utilizados em `main.tex`:

```bash
make -C activities/activitie_4
```

O Makefile executa pdfLaTeX, BibTeX e duas passagens adicionais do pdfLaTeX.
O diagrama é vetorial e está incorporado no arquivo LaTeX. As duas imagens
externas têm legendas com citações e chamadas no texto. As fontes de reprodução
e os limites de atribuição estão documentados em [`images/README.md`](images/README.md).

## Formato

O enunciado aponta o [portal de templates IEEE](https://www.ieee.org/conferences/publishing/templates.html).
A classe usada é a [IEEEtran](https://ctan.org/pkg/ieeetran), já instalada no
ambiente. Os trabalhos anteriores usavam `article` com capa e margens próprias,
por isso sua diagramação não foi reproduzida nesta atividade. Não foram alterados
os tamanhos de fonte, as margens ou o espaçamento da classe para ajustar páginas.
