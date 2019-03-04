# gl-vsts-tasks-build

[![Build status](https://geeklearning.visualstudio.com/gl-github/_apis/build/status/gl-vsts-tasks-build-scripts)](https://geeklearning.visualstudio.com/gl-github/_build/latest?definitionId=97)
[![NPM@dev](https://img.shields.io/npm/v/gl-vsts-tasks-build-scripts/dev.svg)](https://www.npmjs.com/package/gl-vsts-tasks-build-scripts/v/dev)
[![NPM@latest](https://img.shields.io/npm/v/gl-vsts-tasks-build-scripts/latest.svg?color=green)](https://www.npmjs.com/package/gl-vsts-tasks-build-scripts/v/latest)

This package provides NPM utility commands to ease **Azure Pipelines Tasks** extensions developement.
This currently powers the development process behind [Geek Learning's extensions](https://marketplace.visualstudio.com/publishers/geeklearningio).

## Features

* **Multiple packages generation** : This allows you to generate testing versions of the extension using unique ids, so you can easily
test your extension and setup staged deployment to the store. At Geek Learning our CI builds 3 versions of the extension 
(Dev, Preview, Production) and stores them as build artifacts. We then use Release Pipelines to publish them to the marketplace.
Dev package is always published automatically upon successfull build. Preview and Production are manually pushed if it passes our
final review. Ids and packages settings, are defined in the `Configuration.json` file
* **Manifest automation** : We automatically populate the contributions in the vss-extension in order to reduced manual maintainance
of this file.
* **Common shared code** : We provide an easy way to share powershell or node scripts accros your tasks without the need to make a 
package of them. Place them in the right subfolder of `Common` and they will be automatically copied where appropriate on build.
* **Node : Automic dependency installation** : Azure Pipelines Agent node execution engine requires npm dependencies to be bundled with your task
We automatically install two dependencies as a postbuild step after a successfull `npm install` at root.
* **Automatic versionning** : Visual Studio Marketplace does not support semver, but we always rely on it when it comes to versionnning.
As a result we needed a way to encode our semver to a Major.Minor.Patch format. This feature can be switched of if you rely on another source of versionning.

## Project structure

At the moment, if you wish to use this tooling, your project will need to comply with the architecture we designed.
```
Root
|-- package.json
|-- Configuration.json
|-- tsconfig.json                       // Optional if not using typescript
|-- Common                              // Optional
|   |-- Node                            // Node common scripts
|   |   |-- *.ts                        
|   |
|   |-- Powershell3                     // Powershell3 common scripts
|   |   |-- *.ps1
|
|-- Extension
|   |-- vss-extension.json              // Extension Manifest
|   |-- ...
|
|-- Tasks                               // Task Directory
|   |-- NodeTask1
|   |   |-- task.json                   // Task manifest
|   |   |-- icon.png                    // Task icon
|   |   |-- package.json                // Package.json, this is where this task dependencies must be listed 
|   |   |-- *.ts                        // Task source files
|   |   |-- ...
|   |
|   |-- PowershellTask1
|   |   |-- task.json
|   |   |-- icon.png
|   |   |-- *.ps1                       // Task powershell scripts
|   |   |-- ...
|   |
|   | -- ...
```

## Root `Package.json`

First you should install this package

```bash
npm install gl-vsts-tasks-build-scripts --save-dev
```

Then to get the best of this tooling we recommand that you tweak your `package.json` file a little by adding a few `scripts` :
```json
{
    "scripts": {
        "clean": "vsts-build-tools-clean",
        "postinstall": "vsts-build-tools-install",
        "prebuild": "vsts-build-tools-prebuild",
        "build": "tsc",
        "package": "vsts-build-tools-package"
    }
}
```

You can now restore or update dependencies and task bundled dependencies by running a single `npm install` at the root.

You can clean common files using `npm run clean`

You can build node tasks using `npm run build`

You can package your extension by running `npm run package`. Output will be placed in the `.BuildOutput` subdirectory at root.

## Versioning
You can set version by packaging with `npm run package -- --version <version>`.

You can disable the default behavior which would encode the semver metadata into the patch component with the additional flag `--noversiontransform`.
