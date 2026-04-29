# LTU HTR

[![Build and Test](https://github.com/Keys-481/sp26-06-loracles/actions/workflows/node.js.yaml/badge.svg)](https://github.com/Keys-481/sp26-06-loracles/actions/workflows/node.js.yaml)
[![Linting](https://github.com/Keys-481/sp26-06-loracles/actions/workflows/lint.yaml/badge.svg)](https://github.com/Keys-481/sp26-06-loracles/actions/workflows/lint.yaml)

## Instructions
### Running the Application

Clone the repo from https://github.com/Keys-481/sp26-06-loracles

Download model wrappers from https://drive.google.com/drive/folders/
1EL8MafnuoAKZwWYA-GQE8o-8HQ1v22yV?usp=drive_link 
Extract the wrappers to:
-  %APPDATA%/sp26-06-loracles/models/ for Windows
-  ~/Library/Application Support/sp26-06-loracles/models/ for macOS
-  ~/.config/sp26-06-loracles/models/ for Linux
When installed, the folder hierarchy should look similar to this:

From the project root, run `npm install`.
Running `npm run start` will launch the application.

*Note: If building and running from the experimental-ui branch, model wrappers can be imported during runtime via the settings cog in the top right of the UI.


Packaging and Installing the Application
Run `npm run make`.
This will produce a setup/install file that can be distributed for the given system architecture.
Running this file will install the app to your system.
Model wrappers will need to be imported to local app data as in step 3 of “Running the Application”.

*Note: Packaging is not properly configured for Linux systems.

