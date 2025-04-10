const core = require('@actions/core');
const artifact = require('@actions/artifact')

async function run () {
    try {
        core.info("[fianu-secure-agent] post-step");

        const uploadResponse = await artifact.uploadArtifact(
            `fianu.agent.pipeline.version_v1_${process.env['GITHUB_RUN_ID']}.log`,
            ["/home/agent/agent.log"],
            "/home/agent",
            {
                retentionDays: 90,
                continueOnError: true // no breaking pipelines!
            }
        )

        core.info(`[fianu-secure-agent] uploaded fianu pipeline log, Final size is ${uploadResponse.size} bytes. Artifact  ID is '${uploadResponse.id}`);
        core.info("[fianu-secure-agent] post-step completed");
    } catch (error) {
        core.error(error);
        throw error;
    }
}

module.exports = run;