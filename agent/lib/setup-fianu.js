// Node.js core
const agent = require("./install-agent");

// External
const core = require('@actions/core');
const uuid = require('uuid');
const cp = require('child_process');
const fs = require ('fs');

function chownForFolder(newOwner, target) {
    let cmd = "sudo";
    let args = ["chown", "-R", newOwner, target];
    cp.execFileSync(cmd, args);
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const getRuntimeToken = () => {
    const token = process.env['ACTIONS_RUNTIME_TOKEN']
    if (!token) {
        throw new Error('Unable to get the ACTIONS_RUNTIME_TOKEN env variable')
    }
    return token
}

const getResultsServiceUrl = () => {
    const resultsUrl = process.env['ACTIONS_RESULTS_URL']
    if (!resultsUrl) {
        throw new Error('Unable to get the ACTIONS_RESULTS_URL env variable')
    }

    return new URL(resultsUrl).origin
}


async function run () {
    try {
        core.info("[fianu-secure-agent] pre-step");

        const correlation_id = uuid.v4();

        // Gather GitHub Actions configuration
        let confg = {
            repositoryFullPath: process.env["GITHUB_REPOSITORY"],
            run_id: process.env["GITHUB_RUN_ID"],
            correlation_id: correlation_id,
            batch_id: "fianu-correlation-id",
            working_directory: process.env["GITHUB_WORKSPACE"],
            api_url: process.env["F_API_URL"],
            disable_telemetry: false,
            runtime_server_url: getResultsServiceUrl(),
            runtime_token: getRuntimeToken(),
        };

        const confgStr = JSON.stringify(confg);
        cp.execSync("sudo mkdir -p /home/agent");
        chownForFolder(process.env.USER, "/home/agent");

        const installedAgentSuccessfully = await agent.installAgent(confgStr)

        if (installedAgentSuccessfully) {
            // Check that the file exists locally
            let statusFile = "/home/agent/agent.status";
            let logFile = "/home/agent/agent.log";
            let counter = 0;
            while (true) {
                if (!fs.existsSync(statusFile)) {
                    counter++;
                    if (counter > 30) {
                        console.log("timed out");
                        if (fs.existsSync(logFile)) {
                            let content = fs.readFileSync(logFile, "utf-8");
                            console.log(content);
                        }
                        break;
                    }
                    await sleep(300);
                } // The file *does* exist
                else {
                    // Read the file
                    let content = fs.readFileSync(statusFile, "utf-8");
                    console.log(content);
                    break;
                }
            }
        }

    } catch (error) {
        core.error(error);
        throw error;
    }
}

module.exports = run;