# User Guide

This guide explains how to use Fabx CLI for the supported MVP scenario: a simple local Fabric-X network managed through a Fablo-style workflow.

## Supported Workflow

Fabx CLI supports a small, repeatable lifecycle:

1. define config
2. generate runtime artifacts
3. start the network
4. verify health
5. inspect status
6. stop the network

## Prerequisites

- Node.js
- npm
- Docker
- the `fabric-x` submodule present in this repository

If the submodule is missing, initialize it:

```bash
git submodule update --init --recursive
```

## Build the CLI

```bash
npm install
npm run build
```

## Use the Example Config

An example config is available at:

- [examples/basic/fablo-config.json](./examples/basic/fablo-config.json)

You can use that as the starting point for the root `fablo-config.json`.

## Commands

Generate the Docker Compose file:

```bash
node ./bin/run.js generate
```

Start the network:

```bash
node ./bin/run.js up
```

Check health:

```bash
node ./bin/run.js check
```

Show status:

```bash
node ./bin/run.js status
```

Stop the network:

```bash
node ./bin/run.js down
```

## Validation Command

To run the supported MVP scenario automatically:

```bash
npm run validate:mvp
```

## What Success Looks Like

The workflow is successful when these services are running:

- `fabricx_committer`
- `fabricx_issuer`
- `fabricx_endorser`
- `fabricx_owner`

## Troubleshooting

If startup fails:

1. check Docker is running
2. run `node ./bin/run.js check`
3. inspect containers with `docker ps -a`
4. inspect service logs with `docker logs <container-name>`

## Further Reading

- high-level project framing:
  - [README.md](./README.md)
- design decision:
  - [DESIGN_PROPOSAL.md](./DESIGN_PROPOSAL.md)
- architecture and implementation:
  - [IMPLEMENTATION.MD](./IMPLEMENTATION.MD)
