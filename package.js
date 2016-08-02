var path = require('path');
var exec = require('child_process').exec;

var fs = require('fs-extra');

var currentDirectory = process.cwd();
var buildOutputDirectory = path.join(currentDirectory, '.BuildOutput');
var extensionDirectory = path.join(currentDirectory, 'Extension');
var tasksDirectory = path.join(currentDirectory, 'Tasks');

var getSemanticVersion = function() {
    var options = minimist(process.argv.slice(2), {});
    var version = options.version;
    if (!version) {
        throw new Error('Package: supply version with --version');
    }

    if (!semver.valid(version)) {
        throw new Error('Package: invalid semver version: ' + version);
    }   

    var patch = semver.patch(version) * 1000;
    var prerelease = semver.prerelease(version);
    if (prerelease) {
        patch += prerelease[1];
    }

    return {
        major: semver.major(version),
        minor: semver.minor(version),
        patch: patch,
        getVersionString: function() {
            return this.major.toString() + '.' + this.minor.toString() + '.' + this.patch.toString();
        }
    };
};


// function (taskJson, encoding, done) {
// 			if (!fs.existsSync(taskJson)) {
// 				new gutil.PluginError('PrepareEnvForTask', 'Task json cannot be found: ' + taskJson.path);
// 			}

// 			if (taskJson.isNull() || taskJson.isDirectory()) {
// 				this.push(taskJson);
// 				return callback();
// 			}

// 			var dirName = path.dirname(taskJson.path);
// 			var folderName = path.basename(dirName);
// 			var jsonContents = taskJson.contents.toString();
// 			var task = {};

// 			try {
// 				task = JSON.parse(jsonContents);
// 			}
// 			catch (err) {
// 				done(createError(folderName + ' parse error: ' + err.message));
// 				return;
// 			}			

// 			task.id = currentEnv.TaskIds[folderName];
// 			task.friendlyName += currentEnv.DisplayNamesSuffix;
						
// 			task.version.Major = version.major;
// 			task.version.Minor = version.minor;
// 			task.version.Patch = version.patch;
// 			if (task.helpMarkDown) {
// 				task.helpMarkDown = task.helpMarkDown.replace('#{Version}#', version.getVersionString());
// 			}

// 			var contents = JSON.stringify(task, null, 4);

// 			fs.writeFile(taskJson.path, contents, function (err) {
// 				if (err) {
// 					done(createError('Could not create: ' + taskJson.path + ' - ' + err.message));
// 					return;
// 				}

// 				done();
// 			});
// 		}

// function (extensionJson, encoding, done) {
// 			if (!fs.existsSync(extensionJson)) {
// 				new gutil.PluginError('PrepareEnvForExtension', 'VSS-extension json cannot be found: ' + extensionJson.path);
// 			}

// 			if (extensionJson.isNull() || extensionJson.isDirectory()) {
// 				this.push(extensionJson);
// 				return callback();
// 			}

// 			var dirName = path.dirname(extensionJson.path);
// 			var folderName = path.basename(dirName);
// 			var jsonContents = extensionJson.contents.toString();
// 			var extension = {};

// 			try {
// 				extension = JSON.parse(jsonContents);
// 			}
// 			catch (err) {
// 				done(createError(folderName + ' parse error: ' + err.message));
// 				return;
// 			}			

// 			extension.id += currentEnv.VssExtensionIdSuffix;
// 			extension.name += currentEnv.DisplayNamesSuffix;						
// 			extension.version = version.getVersionString();
// 			extension.galleryFlags = currentEnv.VssExtensionGalleryFlags;
			
// 			var contents = JSON.stringify(extension, null, 4);

// 			fs.writeFile(extensionJson.path, contents, function (err) {
// 				if (err) {
// 					done(createError('Could not create: ' + extensionJson.path + ' - ' + err.message));
// 					return;
// 				}

// 				done();
// 			});
// 		}

// function (extensionJson, encoding, done) {
// 			if (!fs.existsSync(extensionJson)) {
// 				new gutil.PluginError('PackageExtension', 'VSS-extension json cannot be found: ' + extensionJson.path);
// 			}

// 			if (extensionJson.isNull() || extensionJson.isDirectory()) {
// 				this.push(extensionJson);
// 				return callback();
// 			}
        
// 			var cmdline = 'tfx extension create --root "' + workingRootPath + '" --manifest-globs "' + extensionJson.path + '" --output-path "' + packageRootPath + '/' + currentEnv.Name + '.vsix"';
// 			QExec(cmdline)
// 				.then(function () {
// 				})
// 				.then(function () {
// 					done();
// 				})
// 				.fail(function (err) {
// 					done(new gutil.PluginError('PackageExtension', err.message));
// 				})
// 		}

fs.ensureDirSync(buildOutputDirectory);

var configuration = require(path.join(currentDirectory, 'configuration.json'));
configuration.environments.map(function (env) {

    var environmentDirectory = path.join(buildOutputDirectory, env.Name);
    fs.ensureDirSync(environmentDirectory);

    fs.copySync(extensionDirectory, environmentDirectory, { clobber: true, dereference: true });
    fs.copySync(tasksDirectory, path.join(environmentDirectory, 'Tasks'), { clobber: true, dereference: true });


});