import fs = require("fs");
import path = require("path");

export interface ITask {
    directory: string;
    name: string;
}

export function getTasks(tasksRoot?: string): ITask[] {
    if (!tasksRoot) {
        const currentDirectory = process.cwd();
        tasksRoot = path.join(currentDirectory, "Tasks");
    }

    const tasks = fs.readdirSync(tasksRoot);
    return tasks
        .map(task => {
            const taskDir = path.join(tasksRoot as string, task);
            return {
                directory: taskDir,
                name: task,
            };
        })
        .filter(task => fs.statSync(task.directory).isDirectory());
}
