const path = require('path');
const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const { execSync } = require('child_process');

async function makeAvailableInPath(download, version) {
  let name = 'fianu'
  console.log('attempting to cache file ' + download);
  core.info(`Cache file ${download} and rename to generic name`);
  const cachedPath = await tc.cacheFile(download, name, name, version);
  const filePath = path.join(cachedPath, name)

  core.info(`Making <tool> binary executable`);
  await exec.exec("chmod", ["+x", filePath]);

  core.info(`Make ${cachedPath} available in path`);
  core.addPath(cachedPath);
}

async function setup() {
  try {
    // Get version of tool to be installed
    const version = core.getInput('version');
    const installDir = core.getInput('install-dir')

    const url = `https://storage.googleapis.com/fianu-release/${version}/fianu`

    console.log('fetching from url: ', url);

    const envPath = execSync(`echo ${installDir}`)
    execSync(`mkdir -p ${envPath.toString()}`)

    execSync(``)


    const pathToCLI = await tc.downloadTool(url, undefined);

    await makeAvailableInPath(pathToCLI)
  } catch (e) {
    core.setFailed(e);
  }
}

module.exports = setup;

if (require.main === module) {
  setup().then(r => console.log('result: ', r));
}
