# Basic Example Workflow

This example demonstrates the supported MVP scenario in this repository.

## Scenario

The example starts a local Fabric-X network with:

- one `committer`
- one `issuer`
- one `endorser`
- one `owner`

## Config

Use:

- `examples/basic/fablo-config.json`

as the starting point for the root project config.

## Run the Example

Generate the runtime file:

```bash
node ./bin/run.js generate
```

Start the network:

```bash
node ./bin/run.js up
```

Verify health:

```bash
node ./bin/run.js check
```

Inspect status:

```bash
node ./bin/run.js status
```

Stop the network:

```bash
node ./bin/run.js down
```

## Expected Result

The example is successful when these services are running:

- `fabricx_committer`
- `fabricx_issuer`
- `fabricx_endorser`
- `fabricx_owner`
