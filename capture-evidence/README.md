# Fianu Capture Evidence GitHub Action

This GitHub Action captures evidence using the Fianu CLI.

## Inputs

| Name                    | Description                                                                                              | Required | Default                |
|-------------------------|----------------------------------------------------------------------------------------------------------|----------|------------------------|
| `fianu-host`            | Fianu Host URL                                                                                           | Yes      | `https://app.fianu.io` |
| `fianu-cli-version`     | Fianu CLI Version to Use                                                                                 | Yes      | `1.9.11`               |
| `fianu-app-code`        | Fianu App Code                                                                                           | Yes      |                        |
| `fianu-client-id`       | Fianu Client ID                                                                                          | Yes      |                        |
| `fianu-client-secret`   | Fianu Client Secret                                                                                      | Yes      |                        |
| `fianu-username`        | Fianu Username (Optional)                                                                                | No       |                        |
| `fianu-service-account` | The Fianu service account provided to your organization to perform keyless signing.                      | Yes      |                        |
| `audience`              | Specifies the identity token audience to use when creating an identity token to authenticate with Fianu. | No       | `sigstore`             |
| `evidence`              | The path to the evidence to capture.                                                                     | Yes      |                        |
| `evidence-uri`          | The URI of the resource to associate with the evidence.                                                  | No       | ` `                    |
| `evidence-source`       | The source of the evidence.                                                                              | Yes      |                        |
| `evidence-type`         | The type of evidence to capture.                                                                         | Yes      |                        |

## Usage

```yaml
name: 'Capture Evidence with Fianu'
on: [ push ]
jobs:
  capture-evidence:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2

      - name: Capture Evidence
        uses: fianulabs/actions/capture-evidence@main
        with:
          fianu-host: 'https://app.fianu.io'
          fianu-cli-version: '1.9.11'
          fianu-app-code: ${{ secrets.FIANU_APP_CODE }}
          fianu-client-id: ${{ secrets.FIANU_CLIENT_ID }}
          fianu-client-secret: ${{ secrets.FIANU_CLIENT_SECRET }}
          fianu-service-account: ${{ secrets.FIANU_SERVICE_ACCOUNT }}
          audience: 'sigstore'
          evidence: 'path/to/evidence'
          evidence-source: 'source-of-evidence'
          evidence-type: 'type-of-evidence'
```

Ensure you replace the placeholders with your actual values and store sensitive information in GitHub Secrets.