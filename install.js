var series = require("async/series");
var path = require("path");

var tasks = require('./tasks.js');

var npmInstall = (project) => {
      return (done) => {
        var exec = require('child_process').exec;

        var child = exec('npm install', {
            cwd: project.directory
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
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

            done();
        });
    };
}

var installTasks = tasks.getTasks().map(npmInstall);

installTasks.unshift(npmInstall({
    directory: __dirname,
    name: "BuildScripts"
}));

series(installTasks, (err) => {
    if (err) {
        console.error("Failed to install child dependencies");
    }
});