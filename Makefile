BIN = ./node_modules/.bin

.PHONY: test test-watch lint build release bootstrap

SRC = $(shell find ./lib ./index.js ./test -type f -name '*.js*')

test: lint
	@$(BIN)/karma start --single-run

test-watch: lint
	@$(BIN)/karma start

lint: bootstrap
	@$(BIN)/jscs --esprima=esprima-fb $(SRC);
	@$(BIN)/jsxhint $(SRC);

build: lint
	@mkdir -p dist
	@$(BIN)/browserify --require ./index.js --standalone ReactTestTree > dist/react-test-tree.js
	@cat dist/react-test-tree.js | $(BIN)/uglifyjs > dist/react-test-tree.min.js

release: test
	@inc=$(inc) sh build/release.sh

bootstrap: package.json
	@npm install;