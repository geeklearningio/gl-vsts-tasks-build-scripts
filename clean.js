var fs = require("fs-extra");
var path = require("path");
var tasks = require('./tasks.js');
var collection = require('lodash/collection');
var minimist = require('minimist');
var options = minimist(process.argv.slice(2), {});

var currentDirectory = process.cwd();
var nodeCommonFilesRoot = path.join(currentDirectory, 'Common', 'Node');
var powershellCommonFilesRoot = path.join(currentDirectory, 'Common', 'PowerShell3');
var tasksRoot = path.join(currentDirectory, 'Tasks');

var nodeFiles = fs.existsSync(nodeCommonFilesRoot) ? fs.readdirSync(nodeCommonFilesRoot) : [];
var powershellFiles = fs.existsSync(powershellCommonFilesRoot) ? fs.readdirSync(powershellCommonFilesRoot) : [];

fs.emptyDirSync('.BuildOutput');
console.log(JSON.stringify(options));
collection.forEach(tasks.getTasks(), (task) => {
    var targetNodeCommonDir = path.join(task.directory, "common");
    var taskNodeModules = path.join(task.directory, "node_modules");
    var targetPowershellCommonDir = path.join(task.directory, "ps_modules");

    fs.emptyDirSync(targetNodeCommonDir);
    fs.emptyDirSync(targetPowershellCommonDir);
    if (options.modules == "true"){
        fs.emptyDirSync(taskNodeModules);
    };
});