# Fabx CLI

Fabx CLI is a wrapper-based MVP that brings a Fablo-style local developer experience to Hyperledger Fabric-X.

The project goal is simple:

- reduce setup friction for Fabric-X
- make local experimentation repeatable
- provide a small configuration-driven workflow
- document a practical path toward a future Fablo integration

## What This Repository Delivers

- a design proposal:
  - [DESIGN_PROPOSAL.md](./DESIGN_PROPOSAL.md)
- an MVP implementation for a local Fabric-X network
- an example configuration and workflow:
  - [examples/basic/README.md](./examples/basic/README.md)
- a validation script for the MVP scenario
- contributor and user documentation:
  - [guide.MD](./guide.MD)
  - [IMPLEMENTATION.MD](./IMPLEMENTATION.MD)

## Recommended Integration Path

The recommended path is a wrapper-based approach rather than direct Fablo core modification.

Why:

- Fabric-X introduces a different architecture from classic Fabric
- the local workflow can be validated quickly without deep coupling
- the wrapper keeps the MVP practical while leaving room for future plugin or engine work

See [DESIGN_PROPOSAL.md](./DESIGN_PROPOSAL.md) for the full rationale.

## MVP Scope

The current MVP supports a simple local Fabric-X network with:

- `committer`
- `issuer`
- `endorser`
- `owner`

Lifecycle commands:

- `generate`
- `up`
- `check`
- `status`
- `down`

## Quick Start

Install dependencies:

```bash
npm install
npm run build
```

Generate the local runtime artifact:

```bash
node ./bin/run.js generate
```

Start the local Fabric-X network:

```bash
node ./bin/run.js up
```

Verify health:

```bash
node ./bin/run.js check
```

Inspect current status:

```bash
node ./bin/run.js status
```

Stop the network:

```bash
node ./bin/run.js down
```

## Validation

Run the supported MVP scenario end to end:

```bash
npm run validate:mvp
```

This validates that the repo can:

- generate the local runtime config
- bootstrap the expected Fabric-X services
- verify the running network
- cleanly tear the network down

## Architecture

The working architecture and implementation flow are explained in:

- [IMPLEMENTATION.MD](./IMPLEMENTATION.MD)

## Example Workflow

The example config and workflow are documented in:

- [examples/basic/README.md](./examples/basic/README.md)

## Notes

- This project targets local development, demos, onboarding, and MVP validation.
- It does not replace the upstream Fabric-X Ansible collection for distributed deployment.
- The wrapper-based MVP is intended as the proving ground for a future Fablo integration path.
