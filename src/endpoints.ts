import * as fs from "fs-extra";
import * as path from "path";

export interface IEndpoint {
    path: string;
    name: string;
    // eslint-disable-next-line
    manifest: any;
}

export function getEndpoints(endpointsRoot?: string): IEndpoint[] {
    if (!endpointsRoot) {
        const currentDirectory = process.cwd();
        endpointsRoot = path.join(currentDirectory, "Endpoints");
    }

    if (!fs.existsSync(endpointsRoot)) {
        return [];
    }

    return fs.readdirSync(endpointsRoot as string).map(file => {
        const endpointPath = path.join(endpointsRoot as string, file);
        const manifest = JSON.parse(fs.readFileSync(endpointPath, { encoding: "utf8" }));

        return {
            manifest,
            name: manifest.properties.name,
            path: endpointPath,
        };
    });
}
