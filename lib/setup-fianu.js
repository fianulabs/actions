// Node.js core
const os = require('os');
const path = require('path');
const exec = require('@actions/exec');

// External
const core = require('@actions/core');
const tc = require('@actions/tool-cache');

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

const isVersionLessThan = (version1, version2) => {
    // Extract numeric parts only, ignoring pre-release identifiers
    const extractNumeric = (v) => v.split('.').map(part => {
        const num = parseInt(part.split('-')[0], 10);
        return isNaN(num) ? 0 : num;
    });

    const v1 = extractNumeric(version1);
    const v2 = extractNumeric(version2);

    const maxLength = Math.max(v1.length, v2.length);

    for (let i = 0; i < maxLength; i++) {
        const num1 = v1[i] || 0;
        const num2 = v2[i] || 0;

        if (num1 < num2) {
            return true;
        } else if (num1 > num2) {
            return false;
        }
    }

    // If all numbers are equal, the versions are not less than each other
    return false;
}

const R2_BASE = 'https://releases.fianu.io/fianucli';
const R2_MIN_VERSION = '1.9.76';

const stripV = (version) => String(version).trim().replace(/^v/i, '');

// Pure URL builder: platform in [linux, darwin, windows], arch in [amd64, arm64, arm, 386...]
function cliUrl (version, platform, arch) {
    version = stripV(version);

    if (isVersionLessThan(version, '1.3.0')) {
        return `https://storage.googleapis.com/fianu-release/${version}/fianu`;
    }

    let base;
    if (isVersionLessThan(version, '1.9.55')) {
        base = `https://storage.googleapis.com/fianu-release/${version}/dist`;
    } else if (isVersionLessThan(version, R2_MIN_VERSION)) {
        base = `https://storage.googleapis.com/fianu-release-v1/fianucli/${version}/dist`;
    } else {
        base = `${R2_BASE}/${version}/dist`;
    }

    let archPath = arch;
    if (platform === 'darwin') archPath = 'amd64_v1';
    else if (arch === 'arm') archPath = 'arm64';
    else if (arch === 'amd64') archPath = 'amd64_v1';

    switch (platform) {
        case 'linux':
            return `${base}/cli_linux_${archPath}/cli`;
        case 'darwin':
            return `${base}/cli_darwin_${archPath}/cli`;
        case 'windows':
            return `${base}/cli_windows_${archPath}/cli.exe`;
        default:
            return base;
    }
}

// Returns the concrete version; 'latest' is resolved through the R2 pointer file.
async function resolveVersion (input) {
    if (String(input).trim().toLowerCase() !== 'latest') {
        return stripV(input);
    }

    const pointer = `${R2_BASE}/channels/latest`;
    let res;
    try {
        res = await fetch(pointer);
    } catch (error) {
        throw new Error(`Failed to resolve version "latest" from ${pointer}: ${error.message}`);
    }
    if (!res.ok) {
        throw new Error(`Failed to resolve version "latest" from ${pointer}: HTTP ${res.status}`);
    }
    const version = stripV(await res.text());
    if (!/^\d+\.\d+\.\d+[\w.-]*$/.test(version)) {
        throw new Error(`Failed to resolve version "latest" from ${pointer}: unexpected response "${version.slice(0, 40)}"`);
    }
    return version;
}

async function run () {
    try {
        // Gather GitHub Actions inputs
        const input = core.getInput('version');
        const version = await resolveVersion(input);
        if (input.trim().toLowerCase() === 'latest') {
            core.info(`Resolved latest -> ${version}`);
        }

        // Gather OS details
        const osPlatform = os.platform();
        const osArch = os.arch();

        const platform = mapOS(osPlatform);
        const arch = mapArch(osArch);

        const url = cliUrl(version, platform, arch);
        core.info(`Downloading Fianu CLI ${version} from ${url}`);
        core.setOutput('version', version);
        core.setOutput('download-url', url);

        // for backwards compatibility on older versions
        if (isVersionLessThan(version, '1.3.0')) {
            const pathToCLI = await tc.downloadTool(url, '');
            // Add to path
            await makeAvailableInPath(pathToCLI, version)
            return
        }

        let pathToCLI;

        // Download requested version
        switch (platform) {
            case 'linux':
            case 'darwin':
                pathToCLI = await tc.downloadTool(url, 'fianu');
                break;
            case 'windows':
                pathToCLI = await tc.downloadTool(url, 'fianu.exe');
                break;
        }

        // Add to path
        await makeAvailableInPath(pathToCLI, version)
    } catch (error) {
        core.error(error);
        throw error;
    }
}

module.exports = run;
module.exports.cliUrl = cliUrl;
module.exports.resolveVersion = resolveVersion;
module.exports.R2_BASE = R2_BASE;
module.exports.R2_MIN_VERSION = R2_MIN_VERSION;
