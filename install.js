var series = require("async/series");
var tasks = require('./tasks.js');

var npmInstall = (project) => {
      return (done) => {
        var exec = require('child_process').exec;

        var child = exec('npm install', {
            cwd: project.directory
        }, (error, stdout, stderr) => {
            console.log(stdout);
            console.error(stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
            done(error);
        });
    };
}

var installTasks = tasks.getTasks().map(npmInstall);

installTasks.push(npmInstall({
    directory: __dirname,
    name: "BuildScripts"
}));

series(installTasks, (err) => {
    if (err) {
        console.error("Failed to install child dependencies");
    }
});