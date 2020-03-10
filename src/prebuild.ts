import * as fs from "fs-extra";
import { forEach } from "lodash";
import * as path from "path";
import * as tasks from "./tasks";

const currentDirectory = process.cwd();
const nodeCommonFilesRoot = path.join(currentDirectory, "Common", "Node");
const powershellCommonFilesRoot = path.join(currentDirectory, "Common", "PowerShell3");

const nodeFiles = fs.existsSync(nodeCommonFilesRoot) ? fs.readdirSync(nodeCommonFilesRoot) : [];
const powershellFiles = fs.existsSync(powershellCommonFilesRoot) ? fs.readdirSync(powershellCommonFilesRoot) : [];

forEach(tasks.getTasks(), task => {
    const targetNodeCommonDir = path.join(task.directory, "common");
    const taskNodeModules = path.join(task.directory, "node_modules");
    const targetPowershellCommonDir = path.join(task.directory, "ps_modules");

    const taskFilePath = path.join(task.directory, "task.json");
    const taskFile = fs.existsSync(taskFilePath) ? fs.readJsonSync(taskFilePath) : {};

    if (taskFile.execution.Node || taskFile.execution.Node10) {
        fs.ensureDirSync(targetNodeCommonDir);
        fs.ensureDirSync(taskNodeModules);
        forEach(nodeFiles, commonFile => {
            const targetFile = path.join(targetNodeCommonDir, commonFile);
            console.log(targetFile);
            fs.copySync(path.join(nodeCommonFilesRoot, commonFile), targetFile, {
                overwrite: true,
                errorOnExist: false,
            });
        });
    }

    if (taskFile.execution.PowerShell3) {
        fs.ensureDirSync(targetPowershellCommonDir);
        forEach(powershellFiles, commonFile => {
            const targetFile = path.join(targetPowershellCommonDir, commonFile);
            console.log(targetFile);
            fs.copySync(path.join(powershellCommonFilesRoot, commonFile), targetFile, {
                overwrite: true,
                errorOnExist: false,
            });
        });
    }
});
