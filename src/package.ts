import * as  path from 'path';
import { exec } from 'child_process';
import * as  fs from 'fs-extra';
import { series } from "async";
import { getSemanticVersion } from './extension-version';
import * as  tasks from './tasks';

export interface IConfiguration {
    "environments": {
        "Name": string;
        "VssExtensionIdSuffix": string;
        "VssExtensionGalleryFlags": ("Preview" | "Public")[];
        "DisplayNamesSuffix": string;
        "TaskIds": {
            [key: string]: string;
        };
    }[];
};

var currentDirectory = process.cwd();
var buildOutputDirectory = path.join(currentDirectory, '.BuildOutput');
var extensionDirectory = path.join(currentDirectory, 'Extension');
var tasksDirectory = path.join(currentDirectory, 'Tasks');

fs.ensureDirSync(buildOutputDirectory);

var version = getSemanticVersion();

var configuration = require(path.join(currentDirectory, 'configuration.json')) as IConfiguration;
var createExtensionTasks = configuration.environments.map((env) => {

    var environmentDirectory = path.join(buildOutputDirectory, env.Name);
    var environmentTasksDirectory = path.join(environmentDirectory, 'Tasks');
    fs.ensureDirSync(environmentDirectory);

    fs.copySync(extensionDirectory, environmentDirectory, { overwrite: true, dereference: true });
    fs.copySync(tasksDirectory, environmentTasksDirectory, { overwrite: true, dereference: true });

    var extensionFilePath = path.join(environmentDirectory, 'vss-extension.json');
    var extension = fs.readJsonSync(extensionFilePath);

    extension.id += env.VssExtensionIdSuffix;
    extension.name += env.DisplayNamesSuffix;
    extension.version = version.getVersionString();
    extension.galleryFlags = env.VssExtensionGalleryFlags;
    if (extension.contributions === undefined) {
        extension.contributions = [];
    }

    var patchTasks = tasks.getTasks(environmentTasksDirectory).map((taskDirectory) => {
        var taskFilePath = path.join(taskDirectory.directory, 'task.json');
        var task = fs.readJsonSync(taskFilePath);

        task.id = env.TaskIds[taskDirectory.name];
        if (task.id) {
            task.friendlyName += env.DisplayNamesSuffix;

            task.version.Major = version.major;
            task.version.Minor = version.minor;
            task.version.Patch = version.patch;
            if (task.helpMarkDown) {
                task.helpMarkDown = task.helpMarkDown.replace('#{Version}#', version.getVersionString());
            }

            fs.writeJsonSync(taskFilePath, task);

            var taskLocFilePath = path.join(taskDirectory.directory, 'task.loc.json');
            if (fs.existsSync(taskLocFilePath)) {
                var taskLoc = fs.readJsonSync(taskLocFilePath);
                taskLoc.id = env.TaskIds[taskDirectory.name];
                taskLoc.friendlyName += env.DisplayNamesSuffix;

                taskLoc.version.Major = version.major;
                taskLoc.version.Minor = version.minor;
                taskLoc.version.Patch = version.patch;
                if (taskLoc.helpMarkDown) {
                    taskLoc.helpMarkDown = taskLoc.helpMarkDown.replace('#{Version}#', version.getVersionString());
                }

                fs.writeJsonSync(taskLocFilePath, taskLoc);
                var locfilesDirectory = path.join(taskDirectory.directory, 'Strings/resources.resjson');
                if (fs.existsSync(locfilesDirectory)) {
                    var langs = fs.readdirSync(locfilesDirectory);
                    for (var index = 0; index < langs.length; index++) {
                        var element = langs[index];
                        var resourceFile = path.join(locfilesDirectory, element, "resources.resjson");
                        if (fs.existsSync(resourceFile)) {
                            var resource = fs.readJsonSync(resourceFile);
                            resource["loc.helpMarkDown"] = resource["loc.helpMarkDown"].replace('#{Version}#', version.getVersionString());
                            fs.writeJsonSync(resourceFile, resource);
                        }
                    }
                }
            }

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
        }
        else {
            fs.removeSync(taskDirectory.directory);
        }
    });

    fs.writeJsonSync(extensionFilePath, extension);

    var cmdline = 'tfx extension create --root "' + environmentDirectory
        + '" --manifest-globs "' + extensionFilePath
        + '" --output-path "' + environmentDirectory + '"';

    return (done: (err?: Error) => any) => {
        var child = exec(cmdline, {}, (error, stdout, stderr) => {

            if (error) {
                console.error(`exec error: ${error}`);
                done(error);
                return;
            }

            console.log(`tfx extension create done for ${env.Name}`);

            if (stdout) {
                console.log(stdout);
            }

            if (stderr) {
                console.error(stderr);
            }

            done();
        });
    };
});

series(createExtensionTasks, (err) => {
    if (err) {
        console.error("Failed to create extensions.");
        throw err;
    }
});