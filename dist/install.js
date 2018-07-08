"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async_1 = require("async");
var path = require("path");
var child_process_1 = require("child_process");
var tasks_1 = require("./tasks");
var npmInstall = function (project) {
    return function (done) {
        var child = child_process_1.exec('npm install', {
            cwd: project.directory
        }, function (error, stdout, stderr) {
            if (error) {
                console.error('execution error:', error);
                done(error);
                return;
            }
            console.log("npm install done for " + project.name);
            if (stdout) {
                console.log(stdout);
            }
            if (stderr) {
                console.error(stderr);
            }
            var nodeModulesPath = path.join(project.directory, 'node_modules');
            var powerShellModules = require("glob").sync(path.join(project.directory, "node_modules", "**", "*.psm1"));
            if (powerShellModules.length > 0) {
                var fs = require("fs-extra");
                var taskFilePath = path.join(project.directory, 'task.json');
                var task = fs.existsSync(taskFilePath) ? fs.readJsonSync(taskFilePath) : {};
                if (task.execution.PowerShell3) {
                    var psModulesPath = path.join(project.directory, 'ps_modules');
                    fs.ensureDirSync(psModulesPath);
                    for (var i = 0; i < powerShellModules.length; i++) {
                        var powerShellModulePath = powerShellModules[i];
                        var powerShellModuleDirName = path.dirname(powerShellModulePath);
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
installTasks.unshift(npmInstall({
    directory: __dirname,
    name: "BuildScripts"
}));
async_1.series(installTasks, function (err) {
    if (err) {
        console.error("Failed to install child dependencies");
        throw err;
    }
});
