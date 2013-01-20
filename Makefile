.PHONY: test

# default build task
build:
	make test
	mkdir -p ../tmp
	mkdir -p ../tmp/src
	mkdir -p ../tmp/test
	cp src/* ../tmp/src
	cp test/* ../tmp/test
	cp test.html ../tmp
	git checkout gh-pages
	cp -r ../tmp/* ./
	git add .
	git commit -m 'Auto-update tests'
	git push
	git checkout master
	rm -rf ../tmp

# clean/remove build folder
clean:
	rm -rf build

# clean/remove build folder
test:
	wru test/redefine.js

# easy