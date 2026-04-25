# Implementation and Working Architecture

This document explains the working architecture of the MVP and how the local Fabric-X workflow is implemented in this repository.

## Architecture Goal

The architecture is designed to give Fabric-X a Fablo-like local workflow:

- small config input
- generated runtime artifact
- simple lifecycle commands
- repeatable local startup and teardown

## High-Level Flow

The MVP follows this pipeline:

```text
fablo-config.json
        |
        v
Fabx CLI commands
        |
        v
runtime generation
        |
        v
output/docker-compose.yaml
        |
        v
docker compose up
        |
        v
local Fabric-X services
```

## Main Components

### 1. Config layer

File:

- `fablo-config.json`

Code:

- `src/lib/config.ts`

Responsibility:

- read the project config
- apply defaults
- validate the supported MVP fields

### 2. Generation layer

Files:

- `src/lib/generator.ts`
- `templates/docker-compose.ejs`

Responsibility:

- transform the config into a runnable Docker Compose file
- write the result to `output/docker-compose.yaml`

### 3. Runtime control layer

Files:

- `src/lib/docker.ts`

Responsibility:

- check Docker availability
- start the local stack
- stop the local stack
- inspect container status
- verify the expected Fabric-X services are running

### 4. Command layer

Files:

- `src/commands/generate.ts`
- `src/commands/up.ts`
- `src/commands/check.ts`
- `src/commands/status.ts`
- `src/commands/down.ts`

Responsibility:

- expose the developer workflow through a small CLI surface

## Working Network Topology

The supported MVP network brings up these local services:

- `fabricx_committer`
- `fabricx_issuer`
- `fabricx_endorser`
- `fabricx_owner`

This is intentionally a small local topology that is practical for demos and contributor workflows.

## Why This Architecture Was Chosen

Fabric-X already has an Ansible-centered deployment story, but that is heavier than needed for local onboarding and quick experimentation.

The wrapper-based local architecture was chosen because it:

- keeps the MVP small
- avoids direct modification of Fablo internals
- gives a practical local developer experience now
- creates a foundation for future plugin or engine work

## Runtime Lifecycle

### `generate`

- reads `fablo-config.json`
- renders the Compose template
- writes `output/docker-compose.yaml`

### `up`

- regenerates the runtime file
- checks required config files
- starts the Docker Compose stack
- verifies that all expected Fabric-X services are up

### `check`

- inspects the expected services
- reports missing or unhealthy containers

### `status`

- prints the current service state

### `down`

- stops the local Fabric-X network

## Validation Strategy

The supported MVP scenario is validated by:

- `scripts/validate-mvp.js`

That script runs the end-to-end flow:

1. generate
2. up
3. check
4. status
5. down

This provides a repeatable validation path for the main deliverable scenario.

## Current Boundary of the MVP

What the MVP covers:

- simple local Fabric-X lifecycle
- one practical network topology
- generated local runtime artifacts
- validation of the expected services

What it does not try to solve yet:

- full distributed deployment
- deep classic-Fablo integration
- large topology support
- complete Fabric-X production orchestration

## Summary

The working architecture is a wrapper-based local engine for Fabric-X.

It proves that Fabric-X can be started through a simpler, Fablo-style experience using:

- config input
- generated runtime artifacts
- a small CLI lifecycle
- a repeatable validation flow
