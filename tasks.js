var fs = require("fs");
var path = require("path");
var tasksRoot = "./Tasks";

exports.getTasks = ()=> {
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