import { series } from "async";
import { exec } from "child_process";
import * as  fs from "fs-extra";
import * as  path from "path";
import { getConfiguration } from "./configuration";
import { getEndpoints } from "./endpoints";
import { getSemanticVersion } from "./extension-version";
import { AzureDevOpsTasksSchema } from "./task";
import { getTasks } from "./tasks";

const currentDirectory = process.cwd();
const buildOutputDirectory = path.join(currentDirectory, ".BuildOutput");
const extensionDirectory = path.join(currentDirectory, "Extension");
const tasksDirectory = path.join(currentDirectory, "Tasks");

fs.ensureDirSync(buildOutputDirectory);

const version = getSemanticVersion();

const configuration = getConfiguration();
const createExtensionTasks = configuration.environments.map((env) => {

    const environmentDirectory = path.join(buildOutputDirectory, env.Name);
    const environmentTasksDirectory = path.join(environmentDirectory, "Tasks");
    fs.ensureDirSync(environmentDirectory);

    fs.copySync(extensionDirectory, environmentDirectory, { overwrite: true, dereference: true });
    fs.copySync(tasksDirectory, environmentTasksDirectory, { overwrite: true, dereference: true });

    const extensionFilePath = path.join(environmentDirectory, "vss-extension.json");
    const extension = fs.readJsonSync(extensionFilePath);

    extension.id += env.VssExtensionIdSuffix;
    extension.name += env.DisplayNamesSuffix;
    extension.version = version.getVersionString();
    extension.galleryFlags = env.VssExtensionGalleryFlags;
    if (extension.contributions === undefined) {
        extension.contributions = [];
    }

    const endpointMap: { [source: string]: string } = {};

    getEndpoints().forEach((endpoint) => {
        endpointMap[`connectedService:${endpoint.name}`]
            = `connectedService:${endpoint.name}${env.VssExtensionIdSuffix}`;
        const config = endpoint.manifest;
        config.id = config.id + env.VssExtensionIdSuffix;
        config.properties.name = endpoint.name + env.VssExtensionIdSuffix;
        config.properties.displayName = config.properties.displayName + env.DisplayNamesSuffix;
        extension.contributions.push(config);
    });

    getTasks(environmentTasksDirectory).map((taskDirectory) => {
        const taskFilePath = path.join(taskDirectory.directory, "task.json");
        const task = fs.readJsonSync(taskFilePath) as AzureDevOpsTasksSchema;

        task.id = env.TaskIds[taskDirectory.name];
        if (task.id) {
            task.name += env.VssExtensionIdSuffix;
            task.friendlyName += env.DisplayNamesSuffix;

            task.version = {
                Major: version.major,
                Minor: version.minor,
                Patch: version.patch,
            };

            if (task.helpMarkDown) {
                task.helpMarkDown = task.helpMarkDown.replace("#{Version}#", version.getVersionString());
            }

            if (task.inputs) {
                task.inputs.forEach((input) => {
                    const mappedType = endpointMap[input.type];
                    if (mappedType) {
                        input.type = mappedType;
                    }
                });
            }

            fs.writeJsonSync(taskFilePath, task);

            const taskLocFilePath = path.join(taskDirectory.directory, "task.loc.json");
            if (fs.existsSync(taskLocFilePath)) {
                const taskLoc = fs.readJsonSync(taskLocFilePath);
                taskLoc.id = env.TaskIds[taskDirectory.name];
                taskLoc.friendlyName += env.DisplayNamesSuffix;

                taskLoc.version.Major = version.major;
                taskLoc.version.Minor = version.minor;
                taskLoc.version.Patch = version.patch;
                if (taskLoc.helpMarkDown) {
                    taskLoc.helpMarkDown = taskLoc.helpMarkDown.replace("#{Version}#", version.getVersionString());
                }

                fs.writeJsonSync(taskLocFilePath, taskLoc);
                const locfilesDirectory = path.join(taskDirectory.directory, "Strings/resources.resjson");
                if (fs.existsSync(locfilesDirectory)) {
                    const langs = fs.readdirSync(locfilesDirectory);
                    for (const element of langs) {
                        const resourceFile = path.join(locfilesDirectory, element, "resources.resjson");
                        if (fs.existsSync(resourceFile)) {
                            const resource = fs.readJsonSync(resourceFile);
                            resource["loc.helpMarkDown"] = resource["loc.helpMarkDown"]
                                .replace("#{Version}#", version.getVersionString());
                            fs.writeJsonSync(resourceFile, resource);
                        }
                    }
                }
            }

            const taskId = taskDirectory.name.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^[-]+/, "");
            extension.contributions.push({
                description: task.description,
                id: taskId + "-task",
                properties: {
                    name: "Tasks/" + taskDirectory.name,
                },
                targets: [
                    "ms.vss-distributed-task.tasks",
                ],
                type: "ms.vss-distributed-task.task",
            });
        } else {
            fs.removeSync(taskDirectory.directory);
        }
    });

    fs.writeJsonSync(extensionFilePath, extension);

    const cmdline = 'tfx extension create --root "' + environmentDirectory
        + '" --manifest-globs "' + extensionFilePath
        + '" --output-path "' + environmentDirectory + '"';

    return (done: (err?: Error) => any) => {
        exec(cmdline, {}, (error, stdout, stderr) => {

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
