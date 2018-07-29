import * as minimist from 'minimist';
import * as tasks from './tasks';
import { series } from "async";
import * as path from "path";
import * as fs from "fs";
const modclean = require('modclean');

var runModclean = (project: tasks.ITask) => {
    return (done: (err?: Error) => any) => {
        if (fs.existsSync(path.join(project.directory, "node_modules"))) {

            var modcleanOptions: any = {
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

            modclean(modcleanOptions, (err: Error, results: string[]) => {
                // called once cleaning is complete.
                if (err) {
                    console.error(`exec error: ${err}`);
                    done(err);
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