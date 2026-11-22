# Atividade 4 — Redes veiculares

[Abrir o artigo em PDF](main.pdf)

**Comunicação V2X para alertas de colisão em cruzamentos sem visada direta:
estudo de caso e análise dos requisitos de rede.**

A subseção sobre perdas consecutivas inclui uma comparação determinística entre perdas dispersas e em rajada. Com a mesma entrega de 80% dos pacotes, os padrões produzem picos de idade da informação de 200 e 500 ms. A tabela também apresenta a idade média e a fração do tempo acima de um limiar ilustrativo, com hipóteses e cálculo explicitados no artigo.

O texto analisa um caso publicado, relaciona a oportunidade do alerta à rede
veicular e apresenta cálculos ilustrativos próprios. Não relata experimentos
realizados pelos autores da atividade. Os cálculos não são recomendações de
condução nem resultados de campo.

## Organização

- `main.tex`: fonte editável do artigo;
- `main.pdf`: artigo compilado;
- `referencias.bib`: referências científicas, técnicas e fontes das imagens;
- `articles/`: cópia de uma fonte aberta e links para as demais;
- `images/`: duas imagens externas e duas figuras conceituais próprias em PNG e PDF, com procedência documentada em `images/README.md`.

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
