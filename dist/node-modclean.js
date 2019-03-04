"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async_1 = require("async");
var fs = require("fs");
var minimist = require("minimist");
var path = require("path");
var tasks = require("./tasks");
// tslint:disable-next-line: no-var-requires
var modclean = require("modclean");
var runModclean = function (project) {
    return function (done) {
        if (fs.existsSync(path.join(project.directory, "node_modules"))) {
            var modcleanOptions = {
                cwd: project.directory,
            };
            var options = minimist(process.argv.slice(2), {});
            if (options.patterns) {
                modcleanOptions.patterns = options.patterns.split(",");
            }
            if (options.additionalpatterns) {
                modcleanOptions.additionalPatterns = options.additionalpatterns.split(",");
            }
            if (options.ignorepatterns) {
                modcleanOptions.ignorePatterns = options.ignorepatterns.split(",");
            }
            modclean(modcleanOptions, function (err, results) {
                // called once cleaning is complete.
                if (err) {
                    console.error("exec error: " + err);
                    done(err);
                    return;
                }
                console.log(results.length + " files removed!");
                done();
            });
        }
        else {
            console.log("modclean skipped for " + project.name);
            done();
        }
    };
};
var cleanTasks = tasks.getTasks().map(runModclean);
async_1.series(cleanTasks, function (err) {
    if (err) {
        console.error("Failed to run  modclean");
        throw err;
    }
});
