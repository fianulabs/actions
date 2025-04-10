const core = require("@actions/core");
const artifact = require("@actions/artifact")

async function run () {
    try {
        core.info("[fianu-secure-agent] post-step");

        const artifactClient = new artifact.DefaultArtifactClient();

        const uploadResponse = await artifactClient.uploadArtifact(
            "fianu.agent.pipeline.version_v1.log",
            ["/home/agent/agent.log"],
            "/home/agent",
            {
                retentionDays: 90,
                compressionLevel: 1
            }
        )

        core.info("[fianu-secure-agent] uploaded fianu pipeline log, id='" + uploadResponse.id + "'");
        core.info("[fianu-secure-agent] post-step completed");
    } catch (error) {
        core.error(error);
        throw error;
    }
}

module.exports = run;