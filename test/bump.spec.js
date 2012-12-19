var bumpVersion = require("../tasks/bump/index.js");

exports['bump_version'] = function(test) {
  test.expect(3);
  test.equal(bumpVersion('0.0.1', 'patch'), '0.0.2');
  test.equal(bumpVersion('1.0.1', 'minor'), '1.1.0');
  test.equal(bumpVersion('1.5.1', 'major'), '2.0.0');
  test.done();
};
