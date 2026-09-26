# Atividade 3 — Segurança em redes IoT

[Abrir o relatório em PDF](main.pdf)

Pesquisa bibliográfica sobre credenciais padrão, fracas ou previsíveis em dispositivos IoT. O relatório utiliza a botnet Mirai como estudo de caso para explicar o comprometimento automatizado e o uso dos dispositivos em ataques distribuídos de negação de serviço (DDoS). Também propõe uma demonstração segura em laboratório isolado e organiza medidas de prevenção, detecção, contenção e resposta.

## Organização

- `main.tex`: relatório acadêmico em português;
- `main.pdf`: relatório compilado;
- `referencias.bib`: referências científicas e institucionais utilizadas;
- `articles/`: cópias das principais fontes de consulta;
- `materials/`: enunciado e notas sobre a demonstração segura.

O documento preserva a capa institucional, os autores, o professor, a diagramação em duas colunas e as referências IEEE das atividades anteriores. A demonstração descrita pressupõe ativos próprios ou autorizados e uma rede sem acesso à Internet; ela não inclui malware nem tráfego capaz de indisponibilizar serviços.

## Compilação

```bash
make -C activities/activitie_3
```
