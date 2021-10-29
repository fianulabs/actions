const { getDownloadObject } = require('./lib/utils');
const tc = require('@actions/tool-cache');

const version = '0.0.1';

const  download = getDownloadObject(version);

console.log(download);

const auth = "Bearer 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";

const pathToTarball = tc.downloadTool(download.url, "", auth);

console.log(pathToTarball);

