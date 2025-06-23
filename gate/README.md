# Fianu Gate Action

GitHub Action to **check** or **enforce** Fianu Gates in your GitHub workflow.

## Overview

This GitHub Action integrates Fianu Gates into your workflow to enforce or check security, compliance, and quality standards.
Gates ensure your code and artifacts meet the configured policy requirements in Fianu before progressing through your CI/CD pipeline.

For configuration and usage details, see the [Fianu Gating Documentation](https://docs.fianu.io/gating/gating).

## Usage

### Check a Fianu Gate

Check a Fianu Gate without enforcing it. This is useful for validating the gate status **without blocking** the workflow.

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4

  - name: Fianu Gate
    uses: fianulabs/actions/gate@main
    with:
      fianu_gate_name: ci.codereview.gate
      fianu_gate_enforce: false  # gate will be checked, not enforced
      fianu_client_id: ${{ secrets.FIANU_CLIENT_ID }}
      fianu_client_secret: ${{ secrets.FIANU_CLIENT_SECRET }}
      fianu_host: https://app.fianu.io
      fianu_version: '1.9.41'
      fianu_commit: ${{ github.sha }}
```

### Enforce a Fianu Gate

Enforce a Fianu Gate and **fail the workflow** if the gate fails. This ensures only compliant code or artifacts proceed through the pipeline.

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4

  - name: Fianu Gate
    uses: fianulabs/actions/gate@main
    with:
      fianu_gate_name: ci.codereview.gate
      fianu_gate_enforce: true  # gate will be enforced (workflow will fail if the gate is not passed)
      fianu_client_id: ${{ secrets.FIANU_CLIENT_ID }}
      fianu_client_secret: ${{ secrets.FIANU_CLIENT_SECRET }}
      fianu_host: https://app.fianu.io
      fianu_version: '1.9.41'
      fianu_commit: ${{ github.sha }}
```

## Inputs

| Name                  | Description                                                           | Required | Default       |
|-----------------------|-----------------------------------------------------------------------|----------|---------------|
| `fianu_client_id`     | Fianu client ID, usually stored in secrets.                           | Yes      |               |
| `fianu_username`      | Fianu account username, usually stored in secrets.                    | No       |               |
| `fianu_client_secret` | Fianu client secret, usually stored in secrets.                       | Yes      |               |
| `fianu_host`          | The Fianu host URL.                                                   | Yes      |               |
| `fianu_gate_name`     | The name of the gate to be checked.                                   | Yes      |               |
| `fianu_gate_enforce`  | Whether to enforce the gate.                                          | No       | `false`       |
| `fianu_opts`          | Additional options for the fianu gate check command.                  | No       | `''`          |
| `fianu_version`       | The version of the Fianu CLI to use.                                  | No       | `latest`      |
| `fianu_artifact`      | The artifact name and version to be used in the gate check.           | No       |               |
| `fianu_asset_uuid`    | The UUID of the asset to be used in the gate check (for commit only). | No       |               |
| `fianu_commit`        | The commit hash to be used in the gate check.                         | No       | `$GITHUB_SHA` |
| `max_attempts`        | Maximum number of retry attempts for the gate check command.          | No       | `5`           |
| `initial_retry_wait`  | Initial wait time in seconds before retrying the command.             | No       | `5`           |
| `backoff_factor`      | The factor by which the retry wait time will increase.                | No       | `2`           |

## Outputs

| Name                | Description                                               |
|---------------------|-----------------------------------------------------------|
| `gate_action`       | The action performed on the gate (check or enforce).      |
| `gate_name`         | The name of the gate checked or enforced.                 |
| `gate_result`       | The result of the gate check or enforcement.              |
| `gate_target`       | The target of the gate check or enforcement.              |
| `gate_target_type`  | The type of the target (artifact or commit).              |
| `gate_transactions` | The transaction IDs associated with the gate enforcement. |

## Contact

- [Fianu Labs Support](mailto:support@fianu.io)
