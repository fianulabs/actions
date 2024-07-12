# Fianu Capture Blob Evidence GitHub Action

This GitHub Action captures evidence using the Fianu CLI. It authenticates using either Google Cloud credentials or an
identity token and utilizes the Cosign CLI to sign and capture evidence in the form of blobs.

## Inputs

| Name                    | Description                                                                               | Required | Default                |
|-------------------------|-------------------------------------------------------------------------------------------|----------|------------------------|
| `fianu-host`            | Fianu Host URL                                                                            | true     | `https://app.fianu.io` |
| `fianu-app-code`        | Fianu App Code                                                                            | true     |                        |
| `fianu-client-id`       | Fianu Client ID                                                                           | true     |                        |
| `fianu-client-secret`   | Fianu Client Secret                                                                       | true     |                        |
| `fianu-username`        | Fianu Username (Optional)                                                                 | false    |                        |
| `fianu-asset-token`     | Fianu Asset Token associated with the Fianu Asset to which evidence should be associated. | false    |                        |
| `fianu-service-account` | Fianu service account provided to your organization to perform keyless signing.           | false    |                        |
| `fianu-debug`           | Enable verbose Fianu CLI output.                                                          | false    | `false`                |
| `identity-token`        | Identity token for keyless signing. Required if "fianu-service-account" is not specified. | false    | `''`                   |
| `audience`              | Identity token audience for generating an identity token to authenticate with Fianu.      | false    | `sigstore`             |
| `evidence`              | The path to the (blob) evidence to sign and capture.                                      | true     |                        |
| `evidence-uri`          | The URI of the resource to associate with the evidence.                                   | false    | `''`                   |
| `evidence-source`       | The source of the evidence.                                                               | true     |                        |
| `evidence-format`       | The format of the blob evidence to capture.                                               | false    | `''`                   |

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
          fianu-app-code: ${{ secrets.FIANU_APP_CODE }}
          fianu-client-id: ${{ secrets.FIANU_CLIENT_ID }}
          fianu-client-secret: ${{ secrets.FIANU_CLIENT_SECRET }}
          fianu-service-account: ${{ secrets.FIANU_SERVICE_ACCOUNT }}
          fianu-asset-token: ${{ secrets.FIANU_ASSET_TOKEN }}
          identity-token: ${{ secrets.IDENTITY_TOKEN }}
          evidence: "path/to/your/evidence"
          evidence-source: "source_of_evidence"
          evidence-format: "json"
```

## Steps Details

1. **Check for Required Authentication**
    - Ensures that either `fianu-service-account` or `identity-token` is provided. Exits with an error if neither is
      present.

2. **Google Cloud Authentication Setup**
    - Authenticates with Google Cloud using the provided service account if `fianu-service-account` is specified.

3. **Google Cloud CLI Installation**
    - Installs the Google Cloud CLI for further use in the workflow.

4. **Install Cosign CLI**
    - Installs the Cosign CLI for signing the evidence blob.

5. **Sign and Capture SBOM Evidence**
    - Initializes Cosign with the Fianu Mirror and Root.
    - Signs the evidence blob with Cosign, generates a Rekor Bundle, and outputs the Digest.
    - Captures the generated bundle with the Fianu CLI, with optional debugging and format specifications.

## Environment Variables

- `FIANU_HOST`: The host URL for Fianu services.
- `FIANU_CLIENT_ID`: The client ID for Fianu authentication.
- `FIANU_CLIENT_SECRET`: The client secret for Fianu authentication.
- `FIANU_APP_CODE`: The application code for Fianu.
- `FIANU_USERNAME`: The optional username for Fianu.

This action ensures secure and verifiable capture of evidence using the Fianu and Cosign CLI tools, leveraging Google
Cloud or direct identity token authentication for security.