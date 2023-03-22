// Node.js core
const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const exec = require('@actions/exec');

// External
const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const io = require('@actions/io');

// arch in [arm, x32, x64...] (https://nodejs.org/api/os.html#os_os_arch)
// return value in [amd64, 386, arm]
function mapArch (arch) {
    const mappings = {
        x32: '386',
        x64: 'amd64'
    };
    return mappings[arch] || arch;
}

// os in [darwin, linux, win32...] (https://nodejs.org/api/os.html#os_os_platform)
// return value in [darwin, linux, windows]
function mapOS (os) {
    const mappings = {
        win32: 'windows'
    };
    return mappings[os] || os;
}

async function downloadCLI (url) {
    core.debug(`Downloading Fianu CLI from ${url}`);
    const pathToCLIZip = await tc.downloadTool(url);

    let pathToCLI = '';

    core.debug('Extracting Fianu CLI zip file');
    if (os.platform().startsWith('win')) {
        core.debug(`Fianu CLI Download Path is ${pathToCLIZip}`);
        const fixedPathToCLIZip = `${pathToCLIZip}.zip`;
        io.mv(pathToCLIZip, fixedPathToCLIZip);
        core.debug(`Moved download to ${fixedPathToCLIZip}`);
        pathToCLI = await tc.extractZip(fixedPathToCLIZip);
    } else {
        pathToCLI = await tc.extractZip(pathToCLIZip);
    }

    core.debug(`Fianu CLI path is ${pathToCLI}.`);

    if (!pathToCLIZip || !pathToCLI) {
        throw new Error(`Unable to download Fianu from ${url}`);
    }

    // add binary prefix
    return pathToCLI + '/cli';
}

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

async function run () {
    try {
        // Gather GitHub Actions inputs
        const version = core.getInput('version');

        // Gather OS details
        const osPlatform = os.platform();
        const osArch = os.arch();

        const platform = mapOS(osPlatform);
        const arch = mapArch(osArch);

        const getArchPath = (k) => {
            if (k === 'darwin') return 'arm64'
            if (arch === 'arm') return 'arm64'
            if (arch === 'amd64') return 'amd64_v1'
            return arch
        }

        let url = `https://storage.googleapis.com/fianu-release/${version}/dist`

        switch (platform) {
            case 'linux':
                url = url + '/cli_linux_' + getArchPath(platform)
                break
            case 'darwin':
                url = url + '/cli_darwin_' + getArchPath(platform)
                break
            case 'windows':
                url = url + '/cli_windows_' + getArchPath(platform)
                break;
        }

        url = url + '/cli' // add binary path

        // Download requested version
        // const pathToCLI = await downloadCLI(url);
        const pathToCLI = await tc.downloadTool(url, '');

        // Add to path
        await makeAvailableInPath(pathToCLI, version)
    } catch (error) {
        core.error(error);
        throw error;
    }
}

module.exports = run;