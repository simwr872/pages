# dev: make
# demo: make APP="--demo --minify"
# build: make APP=--minify
BIN := $(shell yarn bin)
APP := --demo

.SECONDARY:
.PHONY: directories all clean

all: \
directories \
public/32.png \
public/256.png \
public/index.html \
public/bundle.js \
public/style.css \
public/icons.woff2 \
public/manifest.webmanifest \
public/worker.js

clean:
	rm -rf build public

directories:
	mkdir -p build public

build/worker.js: src/worker/worker.ts
	$(BIN)/tsc --lib webworker --outFile $(@) $(^)

public/worker.js: build/worker.js
	$(BIN)/terser $(^) --output $(@) --toplevel --compress --mangle --comments false

public/manifest.webmanifest: src/static/manifest.webmanifest
	node scripts/minifyManifest.js \
	--file $(^) \
	--output public \
	--name manifest

public/32%png public/256%png: src/static/icon.svg
	node scripts/favicon.js \
	--icon $(^) \
	--sizes 32 256 \
	--output public

public/index.html: src/static/index.html
	$(BIN)/html-minifier \
	--output $(@) \
	--collapse-boolean-attributes \
	--collapse-inline-tag-whitespace \
	--collapse-whitespace \
	--remove-comments \
	--remove-empty-attributes \
	--remove-redundant-attributes \
	--remove-script-type-attributes \
	--remove-style-link-type-attributes \
	--sort-attributes \
	--sort-class-name \
	--use-short-doctype \
	$(^)

public/style.css: build/global.css build/bundle.css
	node scripts/minifyStyle.js --output public --name style --styles $(^)

public/icons%woff2 public/bundle%js: \
build/bundle.js \
$(wildcard src/app/icons/*.svg)
	node scripts/iconFont.js \
	--replace build/bundle.js \
	--output public \
	--name icons \
	--icons $(wildcard src/app/icons/*.svg)

build/global.css: $(wildcard src/app/styles/*)
	$(BIN)/sass --no-source-map src/app/styles/global.scss $(@)

build/bundle%js build/bundle%css: \
src/app/main.ts \
$(wildcard src/app/components/*) \
$(wildcard src/app/scripts/*)
	node scripts/app.js \
	--name bundle \
	--output build \
	--file src/app/main.ts \
	$(APP)
