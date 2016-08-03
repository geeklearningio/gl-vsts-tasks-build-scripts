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
    extension.contributions = [];

    var patchTasks = tasks.getTasks(environmentTasksDirectory).map((taskDirectory) => {
        var taskFilePath = path.join(taskDirectory.directory, 'task.json');
        var task = fs.readJsonSync(taskFilePath);

        task.id = env.TaskIds[taskDirectory.name];
        task.friendlyName += env.DisplayNamesSuffix;
                    
        task.version.Major = version.major;
        task.version.Minor = version.minor;
        task.version.Patch = version.patch;
        if (task.helpMarkDown) {
            task.helpMarkDown = task.helpMarkDown.replace('#{Version}#', version.getVersionString());
        }

        fs.writeJsonSync(taskFilePath, task);

        var taskId = taskDirectory.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^[-]+/, "");
        extension.contributions.push({
            id: taskId + "-task",
            type: "ms.vss-distributed-task.task",
            description: task.description,
            targets: [
                "ms.vss-distributed-task.tasks"
            ],
            properties: {
                "name": "Tasks/" + taskDirectory.name
            }
        });
    });

    fs.writeJsonSync(extensionFilePath, extension);

    var cmdline = 'tfx extension create --root "' + environmentDirectory
        + '" --manifest-globs "' + extensionFilePath
        + '" --output-path "' + environmentDirectory + '"';

    return (done) => {
        var child = exec(cmdline, { }, (error, stdout, stderr) => {

            if (error) {
                console.error(`exec error: ${error}`);
                done(error);
                return;
            }

            console.log(`tfx extension create done for ${env.Name}`);
            console.log(stdout);
            console.log(stderr);

            done();
        });
    };
});

series(createExtensionTasks, (err) => {
    if (err) {
        console.error("Failed to create extensions.");
    }
});