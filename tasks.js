var fs = require("fs");
var path = require("path");

exports.getTasks = (tasksRoot) => {

    if (!tasksRoot) {
        var currentDirectory = process.cwd();
        var tasksRoot = path.join(currentDirectory, 'Tasks');
    }

    var tasks = fs.readdirSync(tasksRoot);
    return tasks
        .map((task) => {
            var taskDir = path.join(tasksRoot, task);
            return {
                directory : taskDir,
                name : task
            };
        })
        .filter((task) =>fs.statSync(task.directory).isDirectory());
}