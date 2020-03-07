import * as path from "path";

export interface IConfiguration {
    environments: Array<{
        Name: string;
        VssExtensionIdSuffix: string;
        VssExtensionGalleryFlags: Array<"Preview" | "Public">;
        DisplayNamesSuffix: string;
        TaskIds: {
            [key: string]: string;
        };
    }>;
}

export function getConfiguration(): IConfiguration {
    const currentDirectory = process.cwd();
    return require(path.join(currentDirectory, "configuration.json")) as IConfiguration;
}
