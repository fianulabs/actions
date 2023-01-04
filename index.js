const path = require('path');
const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const { execSync } = require('child_process');

async function setup() {
  try {
    // Get version of tool to be installed
    const version = core.getInput('version');
    const installDir = core.getInput('install-dir')

    const url = `https://storage.googleapis.com/fianu-release/${version}/fianu`

    console.log('fetching from url: ', url);

    const envPath = execSync(`echo ${installDir}`)
    execSync(`mkdir -p ${envPath.toString()}`)


    const pathToCLI = await tc.downloadTool(url, `home/runner/.fianu/fianu`);

    const tests = execSync(`ls ${envPath.toString()}`)
    console.log(tests.toString())

    // Execute the 'ls' command and save the output to a variable
    // execSync(`chmod +x ${envPath.toString()}/fianu`)

    // let test = execSync(`${pathToCLI}`);
    // console.log(test.toString());



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
