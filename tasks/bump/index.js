module.exports = function(version, versionType) {
	//from http://semver.org/

	var buildSplit = version.split("+"); //A build version MAY be denoted by appending a plus sign and a series of dot separated identifiers immediately following the patch version or pre-release version
	var build = buildSplit[1];
	var preSplit = buildSplit[0].split("-"); //A pre-release version MAY be denoted by appending a dash and a series of dot separated identifiers immediately following the patch version
	var pre = preSplit[1];
	var elements = preSplit[0].split("."); //A normal version number MUST take the form X.Y.Z where X, Y, and Z are non-negative integers. X is the major version, Y is the minor version, and Z is the patch version

	var major = elements[0] ? parseInt(elements[0]) : 0;
	if(versionType == "major") return [++major, 0, 0].join("."); //When a major version number is incremented, the minor version and patch version MUST be reset to zero

	var minor = elements[1] ? parseInt(elements[1]) : 0;
	if(versionType == "minor") return [major, ++minor, 0].join("."); //When a minor version number is incremented, the patch version MUST be reset to zero

	var patch = elements[2] ? parseInt(elements[2]) : 0;
	if(versionType == "patch") return [major, minor, ++patch].join(".");

	if(versionType == "release") return [major, minor, patch].join("."); //going to release so drop pre-release versioning

	var releaseVersion = [major, minor, patch].join("."); //start with "normal version number" before appending pre-release and/or build version

	//There is some weirdness in that 2.0.0 is obviously after the alpha for 2.0.0, but 2.0.0-1 feels bigger than 2.0.0.
	//It's not a real problem.  You most likely set the "2.0.0-alpha" part by hand and then have grunt update either the
	//build number or pre-release version with each change.  I believe the code below satisfies the actual use-case.
	//It satisfies mine anyway :)

	if(versionType == "pre") return releaseVersion + "-" + incrementLastId(pre || "0"); //if there is no pre-release version, start with 0 (see "weirdness" comment)
	if(pre) releaseVersion += "-" + pre;

	if(versionType == "build") return releaseVersion + "+" + incrementLastId(build || "build"); //if there is no build version yet, start with the word "build"

	return [major, minor, ++patch].join("."); //default behavior is patch
};

function incrementLastId(dotSeparatedIds) {
	var ids = dotSeparatedIds.split("."); //...and a series of dot separated identifiers
	var lastId = parseInt(ids[ids.length - 1]); //we'll increment the last identifier if possible
	if(isNaN(lastId)) {
		ids.push(1); //if the last identifier isn't a number, append a 1 ("1.0.0-alpha" -> "1.0.0-alpha.1")
	} else {
		ids[ids.length - 1] = lastId + 1;
	}
	return ids.join(".");
}