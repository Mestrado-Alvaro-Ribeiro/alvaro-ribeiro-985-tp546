PDF = main.pdf

.PHONY: all clean

all: $(PDF)

$(PDF): main.tex referencias.bib images/imagem.jpg images/imagem2.png images/cruzamento_obstruido.pdf images/fluxograma_alerta.pdf
	pdflatex -interaction=nonstopmode -halt-on-error main.tex
	bibtex main
	pdflatex -interaction=nonstopmode -halt-on-error main.tex
	pdflatex -interaction=nonstopmode -halt-on-error main.tex

clean:
	rm -f main.aux main.bbl main.blg main.log main.out
