const core = require("@actions/core");
const artifact = require("@actions/artifact")

async function run () {
    try {
        core.info("[fianu-secure-agent] post-step");

        const artifactClient = new artifact.create();

        const uploadResponse = await artifactClient.uploadArtifact(
            `test.log`,
            ["/home/agent/agent.log"],
            "/home/agent",
            {
                retentionDays: 90,
                continueOnError: true // no breaking pipelines!
            }
        )

        core.info("[fianu-secure-agent] uploaded fianu pipeline log, name='" + uploadResponse.artifactName + "'");
        core.info("[fianu-secure-agent] post-step completed");
    } catch (error) {
        core.error(error);
        throw error;
    }
}

module.exports = run;