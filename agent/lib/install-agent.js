const fs = require('fs');
const cp = require('child_process');
const core = require('@actions/core');
const tc = require('@actions/tool-cache');

async function installAgent(configStr = "") {
    try {
        // Get the version (e.g., "v1.0.5"). Provide a default or ensure it's passed in via action input.
        const version = core.getInput('version') || 'v1.0.5';
        core.info(`Installing secure runner agent version ${version}`);

        // Construct the base URL for the release assets.
        // The public URLs:
        //   - Binary: https://storage.googleapis.com/fianu-release-v1/agent-github-ci/v1.0.5/dist/secure-runner-agent_linux_amd64_v1/secure-runner-agent
        //   - Service: https://storage.googleapis.com/fianu-release-v1/agent-github-ci/v1.0.5/dist/secure-runner-agent_linux_amd64_v1/agent.service
        const baseURL = `https://storage.googleapis.com/fianu-release-v1/agent-github-ci/${version}/dist/secure-runner-agent_linux_amd64_v1`;
        const agentUrl = `${baseURL}/secure-runner-agent`;
        const serviceUrl = `${baseURL}/agent.service`;

        // Download the agent binary and service file from the release.
        core.info(`Downloading agent binary from ${agentUrl}`);
        const agentBinaryPath = await tc.downloadTool(agentUrl, 'secure-runner-agent');

        core.info(`Downloading agent service from ${serviceUrl}`);
        const serviceFilePath = await tc.downloadTool(serviceUrl, 'agent.service');

        // Define the target installation paths.
        const agentTargetPath = '/home/agent/agent';
        const serviceTargetPath = '/etc/systemd/system/agent.service';

        // Make sure the /home/agent directory exists.
        if (!fs.existsSync('/home/agent')) {
            fs.mkdirSync('/home/agent', { recursive: true });
        }

        // Install the agent binary.
        // Copy the downloaded agent binary to the target path.
        fs.copyFileSync(agentBinaryPath, agentTargetPath);
        // Make the binary executable.
        cp.execSync(`chmod +x ${agentTargetPath}`);
        core.info(`Agent binary copied to ${agentTargetPath} and permissions set`);

        // Write the provided configuration into agent.json.
        const configPath = '/home/agent/agent.json';
        fs.writeFileSync(configPath, configStr);
        core.info(`Configuration written to ${configPath}`);

        // Install the systemd service:
        // Use sudo to copy the service file to /etc/systemd/system/
        cp.execFileSync('sudo', ['cp', serviceFilePath, serviceTargetPath]);
        core.info(`Agent service file installed to ${serviceTargetPath}`);

        // Reload the systemd daemon and start the agent service.
        cp.execSync('sudo systemctl daemon-reload');
        cp.execSync('sudo service agent start', { timeout: 15000 });
        core.info(`Agent service started successfully`);

        return true;
    } catch (error) {
        core.error(`Error installing agent: ${error.message}`);
        throw error;
    }
}

module.exports = { installAgent };