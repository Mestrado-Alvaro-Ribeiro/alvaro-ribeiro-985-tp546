# Atividade 2 — Estudo de caso de uma aplicação real de IoT na agricultura

[Abrir o relatório em PDF](main.pdf)

Estudo bibliográfico do sistema de irrigação de precisão com LoRaWAN desenvolvido por Zhang et al. (2022) e testado em um cultivo de tomates na Penn State, nos Estados Unidos, em 2020. O relatório mantém a capa, os autores, o professor, a diagramação em duas colunas e o estilo de referências IEEE da atividade 1.

## Enunciado e questões

- [Enunciado transcrito da imagem](materials/enunciado.md).
- [Questões orientadoras e respostas](materials/questoes.md), elaboradas a partir dos objetivos visíveis; não são questões adicionais atribuídas ao professor.
- Prazo exibido: **24 de setembro de 2026, às 23:59**.

## Organização

- `main.tex`: artigo acadêmico em português, com resumo, estudo de caso, arquitetura, resultados, benefícios, limitações e conclusão;
- `main.pdf`: relatório compilado;
- `referencias.bib`: referências utilizadas;
- `articles/`: artigos científicos e identificação das fontes;
- `materials/`: enunciado, questões e roteiro de conferência das evidências.

Os resultados pertencem ao experimento publicado. Este trabalho analisa a literatura e não relata um experimento realizado pelos autores da atividade. A operação rotineira do caso estudado utilizou comandos manuais pela plataforma IoT; a automação integral não foi adotada rotineiramente devido a falhas de comunicação e atuação.

## Compilação

Com LaTeX, BibTeX e Make instalados, execute na raiz do repositório:

```bash
make -C activities/activitie_2
```

Ou execute `make` dentro desta pasta. O diagrama está incorporado em `main.tex`.
