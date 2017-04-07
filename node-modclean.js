var tasks = require('./tasks.js');
var series = require("async/series");
var path = require("path");
var fs = require("fs");
const modclean = require('modclean');

var runModclean = (project) => {
    return (done) => {

        if (fs.existsSync(path.join(project.directory, "node_modules"))) {

            modclean({
                cwd: project.directory
            }, function (err, results) {
                // called once cleaning is complete.
                if (err) {
                    console.error(`exec error: ${error}`);
                    done(error);
                    return;
                }

                console.log(`${results.length} files removed!`);
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