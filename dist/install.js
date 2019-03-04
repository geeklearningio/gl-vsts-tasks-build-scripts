"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async_1 = require("async");
var child_process_1 = require("child_process");
var path = require("path");
var tasks_1 = require("./tasks");
var npmInstall = function (project) {
    return function (done) {
        var isYarn = path.basename(process.env.npm_execpath || "npm").startsWith("yarn");
        var installer = isYarn ? "yarn" : "npm";
        child_process_1.exec(isYarn ? "yarn" : "npm install", {
            cwd: project.directory,
        }, function (error, stdout, stderr) {
            if (error) {
                console.error("execution error:", error);
                done(error);
                return;
            }
            console.log(installer + " install done for " + project.name);
            if (stdout) {
                console.log(stdout);
            }
            if (stderr) {
                console.error(stderr);
            }
            var powerShellModules = require("glob")
                .sync(path.join(project.directory, "node_modules", "**", "*.psm1"));
            if (powerShellModules.length > 0) {
                var fs = require("fs-extra");
                var taskFilePath = path.join(project.directory, "task.json");
                var task = fs.existsSync(taskFilePath) ? fs.readJsonSync(taskFilePath) : {};
                if (task.execution.PowerShell3) {
                    var psModulesPath = path.join(project.directory, "ps_modules");
                    fs.ensureDirSync(psModulesPath);
                    for (var _i = 0, powerShellModules_1 = powerShellModules; _i < powerShellModules_1.length; _i++) {
                        var modulePath = powerShellModules_1[_i];
                        var powerShellModuleDirName = path.dirname(modulePath);
                        var powerShellModuleFolderName = path.basename(powerShellModuleDirName);
                        fs.copySync(powerShellModuleDirName, path.join(psModulesPath, powerShellModuleFolderName), { clobber: true, dereference: true });
                        console.log(powerShellModuleFolderName + " copied in ps_modules for " + project.name);
                    }
                }
            }
            done();
        });
    };
};
var installTasks = tasks_1.getTasks().map(npmInstall);
async_1.series(installTasks, function (err) {
    if (err) {
        console.error("Failed to install child dependencies");
        throw err;
    }
});
