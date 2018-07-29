"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var path = require("path");
var tasks = require("./tasks");
var lodash_1 = require("lodash");
var configuration_1 = require("./configuration");
var currentDirectory = process.cwd();
var nodeCommonFilesRoot = path.join(currentDirectory, 'Common', 'Node');
var powershellCommonFilesRoot = path.join(currentDirectory, 'Common', 'PowerShell3');
var tasksRoot = path.join(currentDirectory, 'Tasks');
var configuration = configuration_1.getConfiguration();
var endpointsRoot = path.join(currentDirectory, 'Endpoints');
var nodeFiles = fs.existsSync(nodeCommonFilesRoot) ? fs.readdirSync(nodeCommonFilesRoot) : [];
var powershellFiles = fs.existsSync(powershellCommonFilesRoot) ? fs.readdirSync(powershellCommonFilesRoot) : [];
lodash_1.forEach(tasks.getTasks(), function (task) {
    var targetNodeCommonDir = path.join(task.directory, "common");
    var taskNodeModules = path.join(task.directory, "node_modules");
    var targetPowershellCommonDir = path.join(task.directory, "ps_modules");
    var taskFilePath = path.join(task.directory, 'task.json');
    var taskFile = fs.existsSync(taskFilePath) ? fs.readJsonSync(taskFilePath) : {};
    if (taskFile.execution.Node) {
        fs.ensureDirSync(targetNodeCommonDir);
        fs.ensureDirSync(taskNodeModules);
        lodash_1.forEach(nodeFiles, function (commonFile) {
            var targetFile = path.join(targetNodeCommonDir, commonFile);
            console.log(targetFile);
            fs.copySync(path.join(nodeCommonFilesRoot, commonFile), targetFile, { overwrite: true });
        });
    }
    if (taskFile.execution.PowerShell3) {
        fs.ensureDirSync(targetPowershellCommonDir);
        lodash_1.forEach(powershellFiles, function (commonFile) {
            var targetFile = path.join(targetPowershellCommonDir, commonFile);
            console.log(targetFile);
            fs.copySync(path.join(powershellCommonFilesRoot, commonFile), targetFile, { overwrite: true });
        });
    }
});
