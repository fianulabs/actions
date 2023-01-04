const path = require('path');
const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const exec = require('@actions/exec');

async function makeAvailableInPath(download, version) {
  let name = 'fianu'
  core.info(`Cache file ${download} and rename to ${name}`);
  const cachedPath = await tc.cacheFile(download, name, name, version);
  const filePath = path.join(cachedPath, name)

  core.info(`Making ${name} binary executable`);
  await exec.exec("chmod", ["+x", filePath]);

  core.info(`Make ${cachedPath} available in path`);
  core.addPath(cachedPath);
}

async function setup() {
  try {
    // Get version of tool to be installed
    const version = core.getInput('version');

    const url = `https://storage.googleapis.com/fianu-release/${version}/fianu`

    const pathToCLI = await tc.downloadTool(url, '');

    await makeAvailableInPath(pathToCLI, version)
  } catch (e) {
    core.setFailed(e);
  }
}

module.exports = setup;

if (require.main === module) {
  setup().then(r => console.log('result: ', r));
}
