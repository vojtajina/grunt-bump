var bumpVersion = require("../tasks/bump/index.js");

exports['bump_version'] = function(test) {
	test.expect(16);
	test.equal(bumpVersion('1.2.3', 'major'), '2.0.0');
	test.equal(bumpVersion('1.2.3', 'minor'), '1.3.0');
	test.equal(bumpVersion('1.2.3', 'patch'), '1.2.4');
	test.equal(bumpVersion('0', 'major'), '1.0.0');
	test.equal(bumpVersion('0', 'minor'), '0.1.0');
	test.equal(bumpVersion('0', 'patch'), '0.0.1');
	test.equal(bumpVersion('0', 'pre'), '0.0.0-1');
	test.equal(bumpVersion('0', 'build'), '0.0.0+build.1');
	test.equal(bumpVersion('1.2.3-rc4.5+build.6.7', 'release'), '1.2.3');
	test.equal(bumpVersion('1.2.3-rc4.5+build.6.7', 'major'), '2.0.0');
	test.equal(bumpVersion('1.2.3-rc4.5+build.6.7', 'minor'), '1.3.0');
	test.equal(bumpVersion('1.2.3-rc4.5+build.6.7', 'patch'), '1.2.4');
	test.equal(bumpVersion('1.2.3-rc4.5+build.6.7', 'pre'), '1.2.3-rc4.6');
	test.equal(bumpVersion('1.2.3-rc4.5+build.6.7', 'build'), '1.2.3-rc4.5+build.6.8');
	test.equal(bumpVersion('1.2.3-alpha+build.abcd', 'pre'), '1.2.3-alpha.1');
	test.equal(bumpVersion('1.2.3-alpha+build.abcd', 'build'), '1.2.3-alpha+build.abcd.1');
	test.done();
};
