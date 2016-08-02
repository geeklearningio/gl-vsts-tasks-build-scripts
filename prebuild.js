var fs = require("fs-extra");
var path = require("path");
var tasks = require('./tasks.js');
var collection = require('lodash/collection');

var currentDirectory = process.cwd();
var nodeCommonFilesRoot = path.join(currentDirectory, 'Common', 'Node');
var powershellCommonFilesRoot = path.join(currentDirectory, 'Common', 'PowerShell3');
var tasksRoot = path.join(currentDirectory, 'Tasks');

var nodeFiles = fs.existsSync(nodeCommonFilesRoot) ? fs.readdirSync(nodeCommonFilesRoot) : [];
var powershellFiles = fs.existsSync(powershellCommonFilesRoot) ? fs.readdirSync(powershellCommonFilesRoot) : [];

collection.forEach(tasks.getTasks(), (task) => {
    var targetNodeCommonDir = path.join(task.directory, "common");
    var taskNodeModules = path.join(task.directory, "node_modules");
    var targetPowershellCommonDir = path.join(task.directory, "ps_modules");

    fs.ensureDirSync(targetNodeCommonDir);
    fs.ensureDirSync(taskNodeModules);
    fs.ensureDirSync(targetPowershellCommonDir);

    collection.forEach(nodeFiles, (commonFile) => {
        var targetFile = path.join(targetNodeCommonDir, commonFile);
        console.log(targetFile);
        fs.copySync(path.join(nodeCommonFilesRoot, commonFile), targetFile, { clobber: true });
    });

    collection.forEach(powershellFiles, (commonFile) => {
        var targetFile = path.join(targetPowershellCommonDir, commonFile);
        console.log(targetFile);
        fs.copySync(path.join(powershellCommonFilesRoot, commonFile), targetFile, { clobber: true });
    });
});