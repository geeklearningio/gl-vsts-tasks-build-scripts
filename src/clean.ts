import fs = require("fs-extra");
import path = require("path");
import tasks = require('./tasks');
import { forEach } from 'lodash';
import minimist = require('minimist');
var options = minimist(process.argv.slice(2), {});

fs.emptyDirSync('.BuildOutput');

forEach(tasks.getTasks(options.taskroot as string | undefined), (task) => {
    var targetNodeCommonDir = path.join(task.directory, "common");
    var taskNodeModules = path.join(task.directory, "node_modules");
    var targetPowershellCommonDir = path.join(task.directory, "ps_modules");

    fs.removeSync(targetNodeCommonDir);
    fs.removeSync(targetPowershellCommonDir);
    if (options.modules == "true") {
        fs.removeSync(taskNodeModules);
    };
});