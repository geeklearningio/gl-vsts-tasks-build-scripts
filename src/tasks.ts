import fs = require("fs");
import path = require("path");

export interface ITask {
    directory: string;
    name: string;
}

export function getTasks(tasksRoot?: string): ITask[] {

    if (!tasksRoot) {
        var currentDirectory = process.cwd();
        tasksRoot = path.join(currentDirectory, 'Tasks');
    }

    var tasks = fs.readdirSync(tasksRoot);
    return tasks
        .map((task) => {
            var taskDir = path.join(tasksRoot as string, task);
            return {
                directory: taskDir,
                name: task
            };
        })
        .filter((task) => fs.statSync(task.directory).isDirectory());
}