/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require("assert");
const commonManifestVersion = require('../metadata.json').version;
const mainVersion = require('../package.json').version;

assert(
    mainVersion === commonManifestVersion,
    'Main version and common manifest version must be the same'
);
