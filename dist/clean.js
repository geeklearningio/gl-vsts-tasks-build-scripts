"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var path = require("path");
var tasks = require("./tasks");
var lodash_1 = require("lodash");
var minimist = require("minimist");
var options = minimist(process.argv.slice(2), {});
fs.emptyDirSync('.BuildOutput');
lodash_1.forEach(tasks.getTasks(options.taskroot), function (task) {
    var targetNodeCommonDir = path.join(task.directory, "common");
    var taskNodeModules = path.join(task.directory, "node_modules");
    var targetPowershellCommonDir = path.join(task.directory, "ps_modules");
    fs.removeSync(targetNodeCommonDir);
    fs.removeSync(targetPowershellCommonDir);
    if (options.modules == "true") {
        fs.removeSync(taskNodeModules);
    }
    ;
});
