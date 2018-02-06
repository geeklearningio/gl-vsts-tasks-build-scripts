var minimist = require('minimist');
var semver = require('semver');

exports.getSemanticVersion = () => {
    var options = minimist(process.argv.slice(2), {});
    var version = options.version;
    if (!version) {
        version = "0.0.0";
        console.log('No version argument provided, fallback to default version: ' + version);
    }
    else {
        console.log('Found version: ' + version);
    }

    if (!semver.valid(version)) {
        throw new Error('Package: invalid semver version: ' + version);
    }

    var patch = semver.patch(version);

    if (!options.noversiontransform){
        patch *= 1000;
        var prerelease = semver.prerelease(version);
        if (prerelease) {;
            patch += prerelease[1];
        }
        else {
            patch += 999;
        }
    }

    var result = {
        major: semver.major(version),
        minor: semver.minor(version),
        patch: patch,
        getVersionString: function() {
            return this.major.toString() + '.' + this.minor.toString() + '.' + this.patch.toString();
        }
    };

    console.log('Extension Version: ' + result.getVersionString());

    return result;
};