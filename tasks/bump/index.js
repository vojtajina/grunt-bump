module.exports = function(version, versionType) {
  var type = {
    patch: 2,
    minor: 1,
    major: 0
  };

  var parts = version.split('.');
  var idx = type[versionType || 'patch'];

  parts[idx] = parseInt(parts[idx], 10) + 1;
  while(++idx < parts.length) {
    parts[idx] = 0;
  }
  return parts.join('.');
};
