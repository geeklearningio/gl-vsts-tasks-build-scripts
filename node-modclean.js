var minimist = require('minimist');
var tasks = require('./tasks.js');
var series = require("async/series");
var path = require("path");
var fs = require("fs");
const modclean = require('modclean');

var runModclean = (project) => {
    return (done) => {
        if (fs.existsSync(path.join(project.directory, "node_modules"))) {

            var modcleanOptions = {
                cwd: project.directory
            };

            var options = minimist(process.argv.slice(2), {});

            if (options.patterns) {
                modcleanOptions.patterns = options.patterns.split(',');
            }

            if (options.additionalpatterns) {
                modcleanOptions.additionalPatterns = options.additionalpatterns.split(',');
            }

            if (options.ignorepatterns) {
                modcleanOptions.ignorePatterns = options.ignorepatterns.split(',');
            }

            modclean(modcleanOptions, function (err, results) {
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