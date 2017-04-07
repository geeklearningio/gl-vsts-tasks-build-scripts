var tasks = require('./tasks.js');
var series = require("async/series");
var path = require("path");
var fs = require("fs");

var runModclean = (project) => {
    return (done) => {

        if (fs.existsSync(path.join(project.directory, "node_modules"))) {
            var exec = require('child_process').exec;
            var child = exec('npm run modclean -r', {
                cwd: project.directory
            }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    done(error);
                    return;
                }

                console.log(`modclean done for ${project.name}`);

                if (stdout) {
                    console.log(stdout);
                }

                if (stderr) {
                    console.error(stderr);
                }

                done();
            });
        } else {
            console.log(`modclean skipped for ${project.name}`);
            done();
        }
    };
}

var cleanTasks = tasks.getTasks().map(runModclean);

series(cleanTasks, (err) => {
    if (err) {
        console.error("Failed to run  modclean");
        throw err;
    }
});