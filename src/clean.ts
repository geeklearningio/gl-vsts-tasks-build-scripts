import fs = require("fs-extra");
import { forEach } from "lodash";
import minimist = require("minimist");
import path = require("path");
import tasks = require("./tasks");

const options = minimist(process.argv.slice(2), {});
fs.emptyDirSync(".BuildOutput");

forEach(tasks.getTasks(options.taskroot as string | undefined), (task) => {
    const targetNodeCommonDir = path.join(task.directory, "common");
    const taskNodeModules = path.join(task.directory, "node_modules");
    const targetPowershellCommonDir = path.join(task.directory, "ps_modules");

    fs.removeSync(targetNodeCommonDir);
    fs.removeSync(targetPowershellCommonDir);
    if (options.modules === "true") {
        fs.removeSync(taskNodeModules);
    }
});
