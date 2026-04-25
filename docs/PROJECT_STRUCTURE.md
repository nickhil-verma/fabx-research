# Project Structure and Trigger Flow

This document explains the important files and directories in this repository and shows how the local Fabric-X network is triggered with `fabx up`.

## Top-Level Directories

### `bin/`

- contains the executable entrypoint for the CLI
- `bin/run.js` is what runs when you use `fabx`

### `config/`

- contains the local runtime configuration mounted into the Fabric-X containers
- `config/issuer/` holds issuer runtime files
- `config/endorser/` holds endorser runtime files
- `config/owner/` holds owner runtime files
- `config/namespace/` holds public parameter files used by the token namespace

Important files inside `config/`:

- `core.yaml`
  - main runtime config for a Fabric-X node
- `routing-config.yaml`
  - routing and endpoint information between nodes
- `keys/`
  - node identity material and known peer certificates
- `data/`
  - local sqlite runtime data used by the services

### `docs/`

- contains project-specific documentation
- this file lives here so the root directory stays clean

### `examples/`

- contains sample usage material
- `examples/basic/` shows the supported MVP scenario and sample config

### `fabric-x/`

- the Fabric-X source tree or submodule used by this project
- the local Docker build uses `fabric-x/samples/tokens`
- this is where the runtime service Dockerfile and sample app code come from

### `lib/`

- compiled JavaScript output generated from `src/`
- this is created by TypeScript build output

### `node_modules/`

- npm dependencies used by the CLI

### `output/`

- generated runtime artifacts
- most importantly `output/docker-compose.yaml`
- this file is produced by `fabx generate` and reused by `fabx up`

### `scripts/`

- helper scripts for validation
- `scripts/validate-mvp.js` runs the supported MVP lifecycle end to end
- `scripts/transaction-exporter.js` polls the owner API and exposes Prometheus metrics for Grafana

### `src/`

- the main TypeScript source code for the CLI

### `templates/`

- contains template files used to generate runtime artifacts
- `templates/docker-compose.ejs` is the main local network template
- monitoring templates are also stored here for Prometheus, Blackbox Exporter, and Grafana provisioning

## Top-Level Files

### `.gitignore`

- controls what should not be committed
- keeps generated output, secrets, and local runtime data out of version control

### `.gitmodules`

- tracks the Fabric-X submodule configuration when submodules are used

### `fablo-config.json`

- the main input config for the local Fablo-style workflow
- read by the CLI before generation

### `DESIGN_PROPOSAL.md`

- explains the architectural choice for the project

### `guide.MD`

- user-focused guide for using the CLI

### `IMPLEMENTATION.MD`

- explains the working architecture and implementation flow

### `README.md`

- main project overview and quick-start document

### `package.json`

- npm package metadata
- defines scripts like `build` and `validate:mvp`
- defines the `fabx` binary entrypoint

### `tsconfig.json`

- TypeScript compiler configuration

## Source Code Layout

### `src/index.ts`

- bootstraps the oclif command system

### `src/commands/`

- contains the CLI commands

Files:

- `generate.ts`
  - reads config and generates runtime output
- `up.ts`
  - starts the local Fabric-X network
- `check.ts`
  - verifies that all expected containers are healthy
- `status.ts`
  - shows current container status
- `down.ts`
  - stops the local network
- `ansible.ts`
  - wrapper around the Fabric-X Ansible collection workflow

### `src/lib/`

- reusable helper logic used by the commands

Files:

- `config.ts`
  - reads and validates `fablo-config.json`
- `generator.ts`
  - renders `templates/docker-compose.ejs`
  - writes `output/docker-compose.yaml`
  - writes monitoring files when `enableMonitoring` is set to `true`
- `docker.ts`
  - starts and stops Docker Compose
  - checks Docker availability
  - verifies the expected Fabric-X containers
- `ansible.ts`
  - resolves and runs upstream Ansible collection targets

### `src/utils/`

- small utility helpers shared by commands

Files:

- `banner.ts`
  - prints the startup banner shown by `fabx up`

## How the Fabric-X Network Is Triggered Up

The network startup flow is:

```text
fablo-config.json
        |
        v
fabx up
        |
        v
src/commands/up.ts
        |
        +--> readConfig() from src/lib/config.ts
        |
        +--> generate() from src/lib/generator.ts
        |     |
        |     +--> templates/docker-compose.ejs
        |     +--> writes output/docker-compose.yaml
        |     +--> if monitoring is enabled, writes Prometheus and Grafana files
        |
        +--> checks required files in config/
        |
        +--> docker.up() from src/lib/docker.ts
              |
              +--> docker compose -f output/docker-compose.yaml down --remove-orphans
              +--> docker compose -f output/docker-compose.yaml up --build -d
              +--> verifyFabricXNetwork()
```

## What `fabx up` Does Step by Step

When you run:

```bash
fabx up
```

the CLI does this:

1. starts from `bin/run.js`
2. loads the command system from `src/index.ts`
3. routes to `src/commands/up.ts`
4. reads `fablo-config.json`
5. regenerates `output/docker-compose.yaml`
6. checks that required config files and node keys exist in `config/`
7. runs Docker Compose to build and start the services
8. verifies that these containers are up:
   - `fabricx_committer`
   - `fabricx_issuer`
   - `fabricx_endorser`
   - `fabricx_owner`
9. prints success or logs and diagnostics if something failed

## Which Files Directly Participate in `fabx up`

The main files involved in local startup are:

- `bin/run.js`
- `src/index.ts`
- `src/commands/up.ts`
- `src/lib/config.ts`
- `src/lib/generator.ts`
- `src/lib/docker.ts`
- `src/utils/banner.ts`
- `templates/docker-compose.ejs`
- `fablo-config.json`
- `config/issuer/core.yaml`
- `config/endorser/core.yaml`
- `config/owner/core.yaml`
- `config/namespace/zkatdlognoghv1_pp.json`
- `output/docker-compose.yaml`

## How to Check It Locally

Useful commands:

```bash
fabx generate
fabx up
fabx check
fabx status
fabx down
```

For full validation:

```bash
npm run validate:mvp
```

## How to Enable Grafana

Set this in `fablo-config.json`:

```json
{
  "enableMonitoring": true
}
```

Then run:

```bash
fabx generate
fabx up
```

Open:

- Grafana: `http://localhost:3000`
- Prometheus: `http://localhost:9090`

Default Grafana login:

- username: `admin`
- password: `admin`
