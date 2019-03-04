import * as minimist from "minimist";
import * as semver from "semver";

export function getSemanticVersion() {
    const options = minimist(process.argv.slice(2), {});
    let version = options.version;
    if (!version) {
        version = "0.0.0";
        console.log("No version argument provided, fallback to default version: " + version);
    } else {
        console.log("Found version: " + version);
    }

    if (!semver.valid(version)) {
        throw new Error("Package: invalid semver version: " + version);
    }

    let patch = semver.patch(version);

    if (!options.noversiontransform) {
        patch *= 1000;
        const prerelease = semver.prerelease(version);
        if (prerelease) {
            patch += parseInt(prerelease[1], 10);
        } else {
            patch += 999;
        }
    }

    const result = {
        major: semver.major(version),
        minor: semver.minor(version),
        patch,
        getVersionString() {
            return this.major.toString() + "." + this.minor.toString() + "." + this.patch.toString();
        },
    };

    console.log("Extension Version: " + result.getVersionString());

    return result;
}
