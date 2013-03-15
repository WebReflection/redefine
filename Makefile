.PHONY: clean types test test-online

# default build task
build:
	make test
	mkdir -p build
	java -jar jar/yuicompressor-2.4.6.jar --type=js src/redefine.js -o build/redefine.js

# clean/remove build folder
clean:
	rm -rf build

# clean/remove build folder
test:
	node node_modules/wru/node/program.js test/redefine.js

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


