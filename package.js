var path = require('path');
var exec = require('child_process').exec;

var fs = require('fs-extra');
var series = require("async/series");

var extensionVersion = require('./extension-version.js');
var tasks = require('./tasks.js');

var currentDirectory = process.cwd();
var buildOutputDirectory = path.join(currentDirectory, '.BuildOutput');
var extensionDirectory = path.join(currentDirectory, 'Extension');
var tasksDirectory = path.join(currentDirectory, 'Tasks');

fs.ensureDirSync(buildOutputDirectory);

var version = extensionVersion.getSemanticVersion();

var configuration = require(path.join(currentDirectory, 'configuration.json'));
var createExtensionTasks = configuration.environments.map((env) => {

    var environmentDirectory = path.join(buildOutputDirectory, env.Name);
    var environmentTasksDirectory = path.join(environmentDirectory, 'Tasks');
    fs.ensureDirSync(environmentDirectory);

    fs.copySync(extensionDirectory, environmentDirectory, { clobber: true, dereference: true });
    fs.copySync(tasksDirectory, environmentTasksDirectory, { clobber: true, dereference: true });

    var extensionFilePath = path.join(environmentDirectory, 'vss-extension.json');
    var extension = fs.readJsonSync(extensionFilePath);

    extension.id += env.VssExtensionIdSuffix;
    extension.name += env.DisplayNamesSuffix;						
    extension.version = version.getVersionString();
    extension.galleryFlags = env.VssExtensionGalleryFlags;
   
    fs.writeJsonSync(extensionFilePath, extension);

    var patchTasks = tasks.getTasks(environmentTasksDirectory).map((taskDirectory) => {
        var folderName = path.basename(taskDirectory.directory);
        var taskFilePath = path.join(taskDirectory.directory, 'task.json');
        var task = fs.readJsonSync(taskFilePath);

        task.id = env.TaskIds[folderName];
        task.friendlyName += env.DisplayNamesSuffix;
                    
        task.version.Major = version.major;
        task.version.Minor = version.minor;
        task.version.Patch = version.patch;
        if (task.helpMarkDown) {
            task.helpMarkDown = task.helpMarkDown.replace('#{Version}#', version.getVersionString());
        }

        fs.writeJsonSync(taskFilePath, task);
    });

    var cmdline = 'tfx extension create --root "' + environmentDirectory
        + '" --manifest-globs "' + extensionFilePath
        + '" --output-path "' + environmentDirectory + '"';

    return (done) => {
        var child = exec(cmdline, { }, (error, stdout, stderr) => {
            console.log(stdout);
            console.error(stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }

            done(error);
        });
    };
});

series(createExtensionTasks, (err) => {
    if (err) {
        console.error("Failed to create extensions.");
    }
});