.PHONY: build var node amd size hint clean test web preview pages dependencies test-online

# repository name
REPO = redefine

# make var files
VAR = src/$(REPO).js

# default build task
build:
	make clean
	make var
#	make node
#	make amd
	make test
#	make hint
	make size

# build generic version
var:
	mkdir -p build
	cat template/var.before $(VAR) template/var.after >build/no-copy.$(REPO).max.js
	node node_modules/uglify-js/bin/uglifyjs --verbose build/no-copy.$(REPO).max.js >build/no-copy.$(REPO).js
	cat template/license.before LICENSE.txt template/license.after build/no-copy.$(REPO).max.js >build/$(REPO).max.js
	cat template/copyright build/no-copy.$(REPO).js >build/$(REPO).js
	rm build/no-copy.$(REPO).max.js
	rm build/no-copy.$(REPO).js

# clean/remove build folder
clean:
	rm -rf build

# hint built file
hint:
	node node_modules/jshint/bin/jshint src/$(REPO).js

# clean/remove build folder
test:
	npm test

size:
	wc -c build/$(REPO).max.js
	gzip -c build/$(REPO).js | wc -c

# clean/remove build folder
test-online:
	make test
	mkdir -p ../tmp
	mkdir -p ../tmp/src
	mkdir -p ../tmp/test
	cp src/* ../tmp/src
	cp test/* ../tmp/test
	cp test.html ../tmp
	git checkout gh-pages
	git pull --rebase
	cp -r ../tmp/* ./
	git add .
	git commit -m 'Auto-update tests'
	git push
	git checkout master
	rm -rf ../tmp


# modules used in this repo
dependencies:
	rm -rf node_modules
	mkdir node_modules
	npm install wru
	npm install polpetta
	npm install uglify-js@1
	npm install jshint
	npm install markdown

