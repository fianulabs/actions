const core = require('@actions/core');
const artifact = require('@actions/artifact')

const crypto = require('crypto');

function generateUniqueArtifactName() {
    // Get the current Unix timestamp in milliseconds
    const timestamp = Date.now().toString();

    // Generate some random bytes (for extra uniqueness)
    const randomBytes = crypto.randomBytes(4).toString('hex');  // 8 hex characters

    // Combine them into one string
    const uniqueData = `${timestamp}-${randomBytes}`;

    // Generate a SHA-256 hash from the unique data
    const hash = crypto.createHash('sha256').update(uniqueData).digest('hex');

    // Construct your artifact name using the hash
    return `fianu.agent.pipeline.version_v1_${hash}.log`;
}

async function run () {
    try {
        core.info("[fianu-secure-agent] post-step");

        const client = new artifact.DefaultArtifactClient()

        const uploadResponse = await client.uploadArtifact(
            generateUniqueArtifactName(),
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