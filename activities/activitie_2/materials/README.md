# Materiais complementares

- [Enunciado](enunciado.md): transcrição da imagem fornecida.
- [Questões e respostas](questoes.md): roteiro elaborado a partir dos objetivos do enunciado.
- O diagrama funcional foi desenhado em TikZ dentro de `../main.tex`.

## Roteiro de conferência das evidências

As páginas abaixo são as páginas impressas no [artigo de Zhang et al.](../articles/zhang2022.pdf), que coincidem com as páginas do PDF.

| Informação usada | Localização na fonte |
| --- | --- |
| Local, cultivar, safra de 2020 e quatro tratamentos | Seção 2.1, p. 2 |
| Delineamento com quatro blocos e 16 parcelas | Seção 2.1 e Figura 2, pp. 2–3 |
| Sensores, registradores e alimentação solar | Seções 2.3–2.3.3, pp. 3–4 |
| Gateway, servidor de rede e AllThingsTalk | Seção 2.4, pp. 4–6; Figura 8, p. 5 |
| Operação manual remota apesar do teste de automação | Seção 2.4, p. 6; discussão, pp. 8–9 |
| Perda média de dados de 5,51% e interrupções superiores a dez minutos | Seção 3.1, p. 6 |
| Interface indicando abertura sem resposta hidráulica | Seção 3.2, p. 6 |
| Falha de sensor e instalação pouco representativa | Seção 3.3, p. 7; discussão, p. 8 |
| Volume, produtividade, iWUE e grupos estatísticos | Tabela 2, p. 8 |

## Cálculos e cuidados de interpretação

Percentuais calculados com a Tabela 2, tendo ET como referência:

- Redução de água: `100 × (água_ET − água_tratamento) / água_ET`.
- Variação de produtividade: `100 × (produção_tratamento − produção_ET) / produção_ET`.
- GesCoN: redução de água de **4,14%**; aumento de produtividade de **22,10%**.
- MP60: redução de água de **3,40%**; aumento numérico de produtividade de **15,16%**.
- MP40: redução de água de **30,53%**; queda numérica de produtividade de **12,67%**.

O resumo do artigo informa queda de 12,5% para MP40; os valores da Tabela 2 resultam em aproximadamente 12,7%. Essa divergência é explicitada no relatório. Os grupos estatísticos da tabela são mantidos: MP60 e ET não diferem significativamente em produtividade ou iWUE, e MP40 e ET não diferem significativamente em produtividade. O volume de irrigação não recebe teste de significância na tabela.

A eficiência iWUE é uma razão entre produção comercial e água de irrigação; não é a porcentagem de água economizada. O experimento compara manejos sob a infraestrutura IoT, sem isolar o efeito causal do LoRaWAN.
