import { series } from "async";
import { exec, ExecException } from "child_process";
import * as path from "path";
import { getTasks, ITask } from "./tasks";

const npmInstall = (project: ITask) => {
    return (done: (error?: ExecException) => void) => {
        const isYarn = path.basename(process.env.npm_execpath || "npm").startsWith("yarn");

        const installer = isYarn ? "yarn" : "npm";

        exec(isYarn ? "yarn" : "npm install", {
            cwd: project.directory,
        }, (error, stdout, stderr) => {
            if (error) {
                console.error("execution error:", error);
                done(error);
                return;
            }

            console.log(`${installer} install done for ${project.name}`);

            if (stdout) {
                console.log(stdout);
            }

            if (stderr) {
                console.error(stderr);
            }

            const powerShellModules = require("glob")
                .sync(path.join(project.directory, "node_modules", "**", "*.psm1"));

            if (powerShellModules.length > 0) {
                const fs = require("fs-extra");
                const taskFilePath = path.join(project.directory, "task.json");
                const task = fs.existsSync(taskFilePath) ? fs.readJsonSync(taskFilePath) : {};

                if (task.execution.PowerShell3) {
                    const psModulesPath = path.join(project.directory, "ps_modules");
                    fs.ensureDirSync(psModulesPath);

                    for (const modulePath of powerShellModules) {
                        const powerShellModuleDirName = path.dirname(modulePath);
                        const powerShellModuleFolderName = path.basename(powerShellModuleDirName);
                        fs.copySync(
                            powerShellModuleDirName,
                            path.join(psModulesPath, powerShellModuleFolderName), { clobber: true, dereference: true });
                        console.log(`${powerShellModuleFolderName} copied in ps_modules for ${project.name}`);
                    }
                }
            }

            done();
        });
    };
};

const installTasks = getTasks().map(npmInstall);

series(installTasks, (err) => {
    if (err) {
        console.error("Failed to install child dependencies");
        throw err;
    }
});
