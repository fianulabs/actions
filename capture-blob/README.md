# Fianu Capture Blob Evidence GitHub Action

This GitHub Action captures evidence using the Fianu CLI. It authenticates using Google Cloud credentials and utilizes
the Cosign CLI to sign and capture evidence in the form of blobs.

## Inputs

| Name                    | Description                                                                                              | Required | Default                |
|-------------------------|----------------------------------------------------------------------------------------------------------|----------|------------------------|
| `fianu-host`            | Fianu Host URL                                                                                           | true     | `https://app.fianu.io` |
| `fianu-cli-version`     | Fianu CLI Version to Use                                                                                 | true     | `1.9.11`               |
| `fianu-app-code`        | Fianu App Code                                                                                           | true     |                        |
| `fianu-client-id`       | Fianu Client ID                                                                                          | true     |                        |
| `fianu-client-secret`   | Fianu Client Secret                                                                                      | true     |                        |
| `fianu-username`        | Fianu Username (Optional)                                                                                | false    |                        |
| `fianu-service-account` | The Fianu service account provided to your organization to perform keyless signing.                      | true     |                        |
| `audience`              | Specifies the identity token audience to use when creating an identity token to authenticate with Fianu. | false    | `sigstore`             |
| `evidence`              | The path to the (blob) evidence to sign and capture.                                                     | true     |                        |
| `evidence-uri`          | The URI of the resource to associate with the evidence.                                                  | false    | `''`                   |
| `evidence-source`       | The source of the evidence.                                                                              | true     |                        |
| `evidence-type`         | The type of evidence to capture.                                                                         | true     |                        |

## Usage

```yaml
name: Example Workflow
on: [ push ]

jobs:
  capture-evidence:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v2

      - name: Capture Blob Evidence
        uses: fianulabs/actions/capture-blob@main
        with:
          fianu-host: "https://app.fianu.io"
          fianu-cli-version: "1.9.11"
          fianu-app-code: ${{ secrets.FIANU_APP_CODE }}
          fianu-client-id: ${{ secrets.FIANU_CLIENT_ID }}
          fianu-client-secret: ${{ secrets.FIANU_CLIENT_SECRET }}
          fianu-service-account: ${{ secrets.FIANU_SERVICE_ACCOUNT }}
          evidence: "path/to/your/evidence"
          evidence-source: "source_of_evidence"
          evidence-type: "type_of_evidence"
```

## Steps Details

1. **Google Cloud Authentication Setup**
    - Authenticates with Google Cloud using the service account provided.

2. **Google Cloud CLI Installation**
    - Installs the Google Cloud CLI for further use in the workflow.

3. **Install Cosign CLI**
    - Installs the Cosign CLI for signing the evidence blob.

4. **Sign and Capture SBOM Evidence**
    - Initializes Cosign with Fianu Mirror and Root.
    - Signs the evidence blob with Cosign and generates a Rekor Bundle.
    - Captures the generated bundle with Fianu CLI.

## Environment Variables

- `FIANU_HOST`: The host URL for Fianu services.
- `FIANU_CLIENT_ID`: The client ID for Fianu authentication.
- `FIANU_CLIENT_SECRET`: The client secret for Fianu authentication.
- `FIANU_APP_CODE`: The application code for Fianu.
- `FIANU_USERNAME`: The optional username for Fianu.
- `FIANU_VERSION`: The version of Fianu CLI to use.

This action ensures secure and verifiable capture of evidence using the Fianu and Cosign CLI tools, leveraging Google
Cloud authentication for security.