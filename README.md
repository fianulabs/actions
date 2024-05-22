# :gear: `setup-fianu`

## About

The `setup-fianu` action facilitates the installation and exposure of a specified version of the `fianu` CLI on GitHub
Actions runners. It is compatible with `ubuntu-latest`, `windows-latest`, and `macos-latest` runners.

## Usage

To set up the `fianu` CLI, include the following step in your workflow:

```yaml
steps:
  - uses: fianulabs/actions@main
```

You can also specify a particular version of the fianu CLI to install:

```yaml
steps:
  - uses: fianulabs/actions@main
    with:
      version: ${{ secrets.FIANU_VERSION }}
```

## Inputs

| Name      | Description                        | Default  |
|-----------|------------------------------------|----------|
| `version` | The version of `fianu` to install. | `latest` |
