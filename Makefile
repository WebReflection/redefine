.PHONY: build var node amd size hint clean test web preview pages dependencies

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


# build underscore version
underscore:
	mkdir -p build
	cat template/var.before $(VAR) template/var.after >build/no-copy.$(REPO).max.js
	node node_modules/uglify-js/bin/uglifyjs --verbose build/no-copy.$(REPO).max.js >build/no-copy.$(REPO).js
	cat template/license.before LICENSE.txt template/license.after build/no-copy.$(REPO).max.js >build/$(REPO).max.js
	cat template/copyright build/no-copy.$(REPO).js >build/$(REPO).js
	rm build/no-copy.$(REPO).max.js
	rm build/no-copy.$(REPO).js


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

# launch polpetta (ctrl+click to open the page)
web:
	node node_modules/polpetta/build/polpetta ./

# markdown the readme and view it
preview:
	node_modules/markdown/bin/md2html.js README.md >README.md.htm
	cat template/md.before README.md.htm template/md.after >README.md.html
	open README.md.html
	sleep 3
	rm README.md.htm README.md.html

pages:
	git pull --rebase
	make var
	mkdir -p ~/tmp
	mkdir -p ~/tmp/$(REPO)
	cp -rf src ~/tmp/$(REPO)
	cp -rf build ~/tmp/$(REPO)
	cp -rf test ~/tmp/$(REPO)
	cp index.html ~/tmp/$(REPO)
	git checkout gh-pages
	mkdir -p test
	rm -rf test
	cp -rf ~/tmp/$(REPO) test
	git add test
	git add test/.
	git commit -m 'automatic test generator'
	git push
	git checkout master
	rm -r ~/tmp/$(REPO)


# modules used in this repo
dependencies:
	rm -rf node_modules
	mkdir node_modules
	npm install wru
	npm install polpetta
	npm install uglify-js@1
	npm install jshint
	npm install markdown

