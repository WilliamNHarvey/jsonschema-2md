const fs = require('fs');
const validator = require('is-my-json-valid');
const parser = require('../');

function testFiles(file) {
	const json = require(`./schemas/${file}.json`);	// eslint-disable-line
	const markdown = fs.readFileSync(`./test/markdown/${file}.md`, 'utf8');
	const parsed = parser(json);
	validator(json); // assert that all our testable JSON schema files are valid
	expect(parsed).toEqual(markdown);
}

test( 'Simple Object (1 Depth)', () => {
	testFiles('simple');
});

test( 'Deep Object', () => {
	testFiles('deep');
});

test( 'Example Object', () => {
	testFiles('example');
});

test( 'Enums', () => {
    testFiles('enums');
});

test( 'Array', () => {
    testFiles('array');
});

test( 'Array or null type as array', () => {
    testFiles('arrayOrNull');
});
