"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
function getConfiguration() {
    var currentDirectory = process.cwd();
    return require(path.join(currentDirectory, "configuration.json"));
}
exports.getConfiguration = getConfiguration;
