# Fianu Gate Action

This GitHub action by Fianu Labs integrates Fianu's gate check into your workflow, enabling automated enforcement of
compliance, security, and quality gates. It's designed to ensure your codebase meets necessary standards before
advancing through your CI/CD pipeline. The action supports configurable retries with exponential backoff for robust
execution.

For detailed information on configuring and using gates, please visit
the [Fianu Documentation on Gating](https://docs.fianu.io/gating/enforcement).

## Branding

- **Icon**: shield
- **Color**: yellow

## Inputs

| Name                  | Description                                                           | Required | Default       |
|-----------------------|-----------------------------------------------------------------------|----------|---------------|
| `fianu_client_id`     | Fianu client ID, usually stored in secrets.                           | Yes      |               |
| `fianu_username`      | Fianu account username, usually stored in secrets.                    | No       | `''`          |
| `fianu_client_secret` | Fianu client secret, usually stored in secrets.                       | Yes      |               |
| `fianu_host`          | The Fianu host URL.                                                   | Yes      |               |
| `fianu_gate_name`     | The name of the gate to be checked.                                   | Yes      |               |
| `fianu_gate_enforce`  | Whether to enforce the gate.                                          | No       | `false`       |
| `fianu_opts`          | Additional options for the fianu gate check command.                  | No       | `''`          |
| `fianu_version`       | The version of the Fianu CLI to use.                                  | No       | `latest`      |
| `fianu_artifact`      | The artifact name and version to be used in the gate check.           | No       |               |
| `fianu_asset_uuid`    | The UUID of the asset to be used in the gate check (for commit only). | No       | ``            |
| `fianu_commit`        | The commit hash to be used in the gate check.                         | No       | `$GITHUB_SHA` |
| `max_attempts`        | Maximum number of retry attempts for the gate check command.          | No       | `5`           |
| `initial_retry_wait`  | Initial wait time in seconds before retrying the command.             | No       | `10`          |
| `backoff_factor`      | The factor by which the retry wait time will increase.                | No       | `2`           |

## Outputs

| Name                | Description                                               |
|---------------------|-----------------------------------------------------------|
| `gate_result`       | The result of the gate check or enforcement.              |
| `gate_name`         | The name of the gate checked or enforced.                 |
| `gate_action`       | The action performed on the gate (check or enforce).      |
| `gate_target`       | The target of the gate check or enforcement.              |
| `gate_target_type`  | The type of the target (artifact or commit).              |
| `gate_transactions` | The transaction IDs associated with the gate enforcement. |

## Example Usage

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4

  - name: Setup Fianu
    uses: fianulabs/actions@main
    with:
      version: ${{ inputs.fianu_version }}

  - name: Fianu Gate
    uses: fianulabs/actions@fianu-gate-action
    with:
      fianu_gate_name: ci.codereview.gate
      fianu_gate_enforce: false  # gate will be checked but not enforced
      fianu_client_id: ${{ secrets.FIANU_CLIENT_ID }}
      fianu_client_secret: ${{ secrets.FIANU_CLIENT_SECRET }}
      fianu_host: https://app.fianu.io
      fianu_version: ${{ secrets.FIANU_VERSION }}
      fianu_commit: ${{ github.sha }}
      max_attempts: 3
      initial_retry_wait: 5
```

## Contact

- [Fianu Labs GitHub Project](https://github.com/fianulabs)
- [Fianu Labs Support](mailto:support@fianu.io)
