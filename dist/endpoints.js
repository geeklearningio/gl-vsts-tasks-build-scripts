"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs-extra");
function getEndpoints(endpointsRoot) {
    if (!endpointsRoot) {
        var currentDirectory = process.cwd();
        endpointsRoot = path.join(currentDirectory, 'Endpoints');
    }
    if (!fs.existsSync(endpointsRoot)) {
        return [];
    }
    return fs.readdirSync(endpointsRoot).map(function (file) {
        var endpointPath = path.join(endpointsRoot, file);
        var manifest = JSON.parse(fs.readFileSync(endpointPath, { encoding: 'utf8' }));
        return {
            path: endpointPath,
            name: manifest.properties.name,
            manifest: manifest,
        };
    });
}
exports.getEndpoints = getEndpoints;
