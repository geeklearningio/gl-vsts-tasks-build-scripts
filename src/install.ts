import { series } from "async";
import * as path from "path";
import { exec } from 'child_process';

import { ITask, getTasks } from './tasks';

var npmInstall = (project: ITask) => {
    return (done: Function) => {

        var child = exec('npm install', {
            cwd: project.directory
        }, (error, stdout, stderr) => {
            if (error) {
                console.error('execution error:', error);
                done(error);
                return;
            }

            console.log(`npm install done for ${project.name}`);

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
                        console.log(`${powerShellModuleFolderName} copied in ps_modules for ${project.name}`);
                    }
                }
            }

            done();
        });
    };
}

var installTasks = getTasks().map(npmInstall);

installTasks.unshift(npmInstall({
    directory: __dirname,
    name: "BuildScripts"
}));

series(installTasks, (err) => {
    if (err) {
        console.error("Failed to install child dependencies");
        throw err;
    }
});