BIN := $(shell npm bin)
$(shell mkdir -p build public)

.SECONDARY:
.PHONY: all clean dev demo prod app

# demo data
dev: app build/bundle.demo.font.js
	cp build/bundle.demo.font.js public/script.js

# demo data, minification
demo: app build/bundle.demo.min.font.js
	cp build/bundle.demo.min.font.js public/script.js

# minification
prod: app build/bundle.prod.min.font.js
	cp build/bundle.prod.min.font.js public/script.js

app: \
public/32.png \
public/256.png \
public/index.html \
public/style.css \
public/icons.woff2 \
public/manifest.webmanifest \
public/worker.js

build/%.min.js: build/%.js
	node scripts/minifyScript.js --input $(^) --output $(@)

build/%.demo.js: build/%.js
	sed "s/__DEMO__/true/" $(^) > $(@)

build/%.prod.js: build/%.js
	sed "s/__DEMO__/false/" $(^) > $(@)

build/%.font.js: build/%.js build/font.json
	node scripts/insertFont.js \
	--info build/font.json \
	--input build/${*}.js \
	--output $(@)

public/icons%woff2 build/font%json: $(wildcard src/icons/*.svg)
	node scripts/iconFont.js \
	--input $(wildcard src/icons/*.svg) \
	--output public/icons.woff2 \
	--info build/font.json

build/bundle.j% build/bundle.cs%: \
src/main.ts \
$(wildcard src/components/*) \
$(wildcard src/scripts/*)
	node scripts/app.js \
	--output build \
	--input src/main.ts

clean:
	rm -rf build public

build/worker.js: src/worker/worker.ts
	$(BIN)/tsc --project src/worker/tsconfig.json --outFile $(@)

public/worker.js: build/worker.min.js
	cp build/worker.min.js public/worker.js

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

build/global.css: $(wildcard src/styles/*)
	$(BIN)/sass --no-source-map src/styles/global.scss $(@)
