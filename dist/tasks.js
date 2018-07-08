"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
function getTasks(tasksRoot) {
    if (!tasksRoot) {
        var currentDirectory = process.cwd();
        tasksRoot = path.join(currentDirectory, 'Tasks');
    }
    var tasks = fs.readdirSync(tasksRoot);
    return tasks
        .map(function (task) {
        var taskDir = path.join(tasksRoot, task);
        return {
            directory: taskDir,
            name: task
        };
    })
        .filter(function (task) { return fs.statSync(task.directory).isDirectory(); });
}
exports.getTasks = getTasks;
