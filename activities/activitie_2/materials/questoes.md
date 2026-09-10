# Questões orientadoras e respostas — Atividade 2

Estas questões foram elaboradas para organizar os objetivos do [enunciado](enunciado.md). Não são uma transcrição de perguntas do professor, pois a imagem não apresenta questões numeradas. O desenvolvimento completo está no [relatório](../main.pdf).

## 1. Qual aplicação real foi selecionada e onde ela foi testada?

O sistema de irrigação de precisão de tomates descrito por Zhang et al. (2022), implementado em campo na Penn State, em Furnace, Pensilvânia, durante a safra de 2020. O artigo apresenta instalação, delineamento experimental e resultados de colheita, atendendo ao requisito de implementação real. **Relatório: seções 2 e 3.**

## 2. Qual problema a aplicação busca resolver?

Apoiar decisões sobre quando irrigar e quanto fornecer de água, conectando medições do solo à supervisão e ao controle remoto. O objetivo é avaliar o manejo em conjunto com a produção comercial e o uso da água. **Relatório: seções 1 e 3.**

## 3. Quais tecnologias foram utilizadas?

Sensores de potencial matricial Watermark 200SS-5, sensores de pressão, medidores de volume, registradores Vinduino com rádio LoRaWAN, baterias com recarga solar, gateway Sentrius RG191, The Things Network/The Things Stack, AllThingsTalk e válvulas solenoides. **Relatório: seção 4 e Figura 1.**

## 4. Como os dados resultavam em irrigação? O sistema era autônomo?

As leituras chegavam à plataforma pela rede. Nos tratamentos baseados em limiares, notificações orientavam o operador, que enviava comandos de abertura e fechamento e verificava a pressão. A automação integral foi testada, mas a rotina utilizou controle manual remoto devido a limitações de comunicação e atuação. **Relatório: seção 4.3.**

## 5. Como a solução foi avaliada?

O experimento comparou ET, MP60, MP40 e GesCoN em blocos casualizados, com quatro repetições e 16 parcelas. Foram avaliados produtividade comercial, volume de irrigação, eficiência do uso da água e funcionamento da infraestrutura. **Relatório: seções 3, 5 e 6.**

## 6. Quais resultados e benefícios foram observados?

A Tabela 1 do relatório reúne os valores e as diferenças estatísticas. GesCoN apresentou 22,1% mais produtividade e 4,1% menos volume de irrigação que ET. MP60 teve aumento numérico de produtividade, sem diferença estatisticamente significativa frente a ET. A aplicação também permitiu histórico de medições e atuação remota. **Relatório: seções 6 e 7.1.**

## 7. Quais limitações foram identificadas?

Perda média de dados de 5,51%, interrupções superiores a dez minutos, falhas de acionamento de válvulas e problemas de sensores. A análise também é limitada a uma safra e local, sem avaliação econômica completa ou isolamento do efeito da tecnologia de rádio sobre a produção. **Relatório: seções 6.2 e 7.2.**

## 8. Quais lições podem orientar outra implantação?

Validar medições em posições representativas, ajustar o manejo às condições locais e confirmar a execução física dos comandos. A autonomia exige avaliar contingência local, tempo máximo de irrigação e resposta às falhas. São recomendações desta análise, não resultados já testados pelos autores do caso. **Relatório: seções 8 e 9.**

## Fontes

- [Zhang et al. (2022), estudo de campo](https://doi.org/10.1016/j.atech.2022.100053).
- [Elia e Conversa (2015), método do GesCoN](https://doi.org/10.3389/fpls.2015.00319).
- [SARE LNE19-378, relatório institucional](https://projects.sare.org/project-reports/lne19-378/).

Consulte o [roteiro de evidências](README.md) para localizar cada resultado no artigo principal.
