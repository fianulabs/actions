const path = require('path');
const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const { getDownloadObject } = require('./lib/utils');
const { execSync } = require('child_process');

async function setup() {
  try {
    // Get version of tool to be installed
    const version = core.getInput('version');

    const url = `https://storage.googleapis.com/fianu-release/${version}/fianu`

    console.log('fetching from url: ', url);

    const pathToCLI = await tc.downloadTool(url, "");

    // Execute the 'ls' command and save the output to a variable
    execSync(`chmod +x ${pathToCLI}`)

    let test = execSync(`${pathToCLI}`);
    console.log(test.toString());

    console.log('adding: ', pathToCLI, ' to ', `cli-${version}`);

    // Expose the tool by adding it to the PATH
    core.addPath(path.join(pathToCLI, `cli-${version}`));
  } catch (e) {
    core.setFailed(e);
  }
}

module.exports = setup;

if (require.main === module) {
  setup().then(r => console.log('result: ', r));
}
