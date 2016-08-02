var fs = require("fs-extra");
var path = require("path");
var collection = require('lodash/collection');

var currentDirectory = process.cwd();
var nodeCommonFilesRoot = path.join(currentDirectory, 'Common', 'Node');
var powershellCommonFilesRoot = path.join(currentDirectory, 'Common', 'PowerShell3');
var tasksRoot = path.join(currentDirectory, 'Tasks');

var tasks = fs.readdirSync(tasksRoot);
var nodeFiles = fs.existsSync(nodeCommonFilesRoot) ? fs.readdirSync(nodeCommonFilesRoot) : [];
var powershellFiles = fs.existsSync(powershellCommonFilesRoot) ? fs.readdirSync(powershellCommonFilesRoot) : [];

collection.forEach(tasks, (task) => {
    var taskDir = path.join(tasksRoot, task);
    var targetNodeCommonDir = path.join(taskDir, "common");
    var taskNodeModules = path.join(taskDir, "node_modules");
    var targetPowershellCommonDir = path.join(taskDir, "ps_modules");

    if (fs.statSync(path.join(tasksRoot, task)).isDirectory()) {
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
    }
});