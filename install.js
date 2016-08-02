var series = require("async/series");
var tasks = require('./tasks.js');

var installTasks = tasks.getTasks().map((task) =>{
    return (done)=>{
        var exec = require('child_process').exec;

        var child = exec('npm install', {
            cwd: task.directory
        }, (error, stdout, stderr) => {
            console.log(stdout);
            console.error(stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
            done(error);
        });
    };
});


series(installTasks, (err) => {
    if (err){
        console.error("Failed to install child dependencies");
    }
});