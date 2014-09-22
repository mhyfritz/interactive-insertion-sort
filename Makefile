all: style.css
.PHONY: all

style.css: style.styl
	stylus $<
