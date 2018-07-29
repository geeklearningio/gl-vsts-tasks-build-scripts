import * as path from "path";
import * as fs from "fs-extra";

export interface IEndpoint {
    path: string;
    name: string;
    manifest: any;
}

export function getEndpoints(endpointsRoot?: string): IEndpoint[] {

    if (!endpointsRoot) {
        var currentDirectory = process.cwd();
        endpointsRoot = path.join(currentDirectory, 'Endpoints');
    }

    if (!fs.existsSync(endpointsRoot)){
        return [];
    }

    return fs.readdirSync(endpointsRoot as string).map(file => {
        const endpointPath = path.join(endpointsRoot as string, file);
        const manifest = JSON.parse(fs.readFileSync(endpointPath, { encoding: 'utf8' }))

        return {
            path: endpointPath,
            name: manifest.properties.name,
            manifest: manifest,
        };
    });

}