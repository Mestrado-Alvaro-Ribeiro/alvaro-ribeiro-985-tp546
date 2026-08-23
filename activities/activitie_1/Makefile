PDF = main.pdf

.PHONY: all clean

all: $(PDF)

$(PDF): main.tex referencias.bib
	pdflatex main.tex
	bibtex main
	pdflatex main.tex
	pdflatex main.tex

clean:
	rm -f main.aux main.bbl main.blg main.log main.out
