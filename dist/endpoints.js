"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var path = require("path");
function getEndpoints(endpointsRoot) {
    if (!endpointsRoot) {
        var currentDirectory = process.cwd();
        endpointsRoot = path.join(currentDirectory, "Endpoints");
    }
    if (!fs.existsSync(endpointsRoot)) {
        return [];
    }
    return fs.readdirSync(endpointsRoot).map(function (file) {
        var endpointPath = path.join(endpointsRoot, file);
        var manifest = JSON.parse(fs.readFileSync(endpointPath, { encoding: "utf8" }));
        return {
            manifest: manifest,
            name: manifest.properties.name,
            path: endpointPath,
        };
    });
}
exports.getEndpoints = getEndpoints;
