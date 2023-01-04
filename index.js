const path = require('path');
const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const { getDownloadObject } = require('./lib/utils');
const { execSync } = require('child_process');

async function setup() {
  try {
    // Get version of tool to be installed
    const version = core.getInput('version');

    // Download the specific version of the tool, e.g. as a tarball/zipball
    const download = getDownloadObject(version);

    const pathToCLI = await tc.downloadTool(`https://storage.googleapis.com/fianu-release/${version}/fianu`, "fianu");

    // Execute the 'ls' command and save the output to a variable
    let output = execSync('ls');
    console.log(output.toString());
    output = execSync('ls fianu');
    console.log(output.toString());

    console.log('adding: ', pathToCLI, ' to ', download.binPath);

    // Expose the tool by adding it to the PATH
    core.addPath(path.join(pathToCLI, download.binPath));
  } catch (e) {
    core.setFailed(e);
  }
}

module.exports = setup;

if (require.main === module) {
  setup().then(r => console.log('result: ', r));
}
