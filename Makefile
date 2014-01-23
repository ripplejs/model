
build: components index.js
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components

test: build
	open test/index.html

standalone: components
	@component build --standalone Observer --name build.standalone
	minify build/build.standalone.js build/build.standalone.min.js
	gzip -c build/build.standalone.min.js > build/build.standalone.min.js.gz

.PHONY: clean test
