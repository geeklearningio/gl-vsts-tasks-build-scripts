import * as  path from 'path';

export interface IConfiguration {
    "environments": {
        "Name": string;
        "VssExtensionIdSuffix": string;
        "VssExtensionGalleryFlags": ("Preview" | "Public")[];
        "DisplayNamesSuffix": string;
        "TaskIds": {
            [key: string]: string;
        };
    }[];
};

export function getConfiguration(): IConfiguration {
    var currentDirectory = process.cwd();
    return require(path.join(currentDirectory, 'configuration.json')) as IConfiguration;
}