# Design Proposal

## Project Objective

Hyperledger Fabric-X has a strong architecture for digital asset workloads, but its current developer workflow is still centered on dedicated deployment scripts and Ansible-based setup. That makes local experimentation harder than it should be.

This project explores how to provide a simpler, Fablo-like developer experience for Fabric-X:

- one small configuration file
- one local bootstrap flow
- repeatable lifecycle commands
- a workflow suitable for demos, contributor onboarding, and CI validation

## Design Question

What is the best path to support Fabric-X through a Fablo-style experience?

The options considered were:

1. direct integration into Fablo core
2. a completely separate Fabric-X repo and engine
3. a wrapper or extension-style approach that mirrors the Fablo experience while remaining independent

## Option Evaluation

### 1. Direct integration into Fablo core

Pros:
- a single tool for classic Fabric and Fabric-X
- direct reuse of the familiar Fablo workflow

Cons:
- Fablo internals are shaped around classic Fabric assumptions
- Fabric-X has a different runtime model with decomposed services
- higher risk of tight coupling and maintenance drag
- slower MVP iteration because core integration requires more design work up front

Conclusion:
- not the best choice for the MVP

### 2. Fully separate standalone repo

Pros:
- complete freedom in implementation
- no coupling to Fablo internals

Cons:
- weak connection to the stated goal of a Fablo-like experience
- duplicates ideas that Fablo already proves valuable
- harder future path if upstream integration is ever desired

Conclusion:
- viable, but not ideal

### 3. Wrapper-based or extension-style approach

Pros:
- fastest way to prove the local workflow
- avoids risky changes to Fablo internals
- keeps Fabric-X-specific logic isolated
- creates a clean path toward future plugin or engine work

Cons:
- not yet a true Fablo plugin
- some Fabric-X-specific runtime setup still lives in this repo

Conclusion:
- recommended

## Recommended Integration Path

The recommended path is a wrapper-based Fabric-X engine that mirrors the Fablo user experience without modifying Fablo core.

That means:

- configuration-driven startup
- generated local runtime artifacts
- simple lifecycle commands
- a clean local developer workflow

This gives us a practical MVP now, while preserving the option to evolve toward a more formal plugin or engine model later.

## MVP Scope

The MVP focuses on a single local scenario that is practical and demonstrable:

- one local Fabric-X network
- one `committer`
- one `issuer`
- one `endorser`
- one `owner`
- generated Docker Compose runtime
- repeatable lifecycle management

Supported lifecycle operations:

- `generate`
- `up`
- `check`
- `status`
- `down`

## Why Docker Compose for the MVP

The Fabric-X Ansible collection remains valuable for distributed deployments and richer infrastructure workflows.

For the MVP, Docker Compose is the better match because it:

- reduces setup friction
- supports local iteration
- is easy to debug
- maps naturally to the Fablo-style local development experience

## Deliverables Implemented in This Repo

This repository now contains:

- a design proposal for the integration path
- an MVP implementation for local Fabric-X bootstrap and lifecycle
- an example config and sample workflow
- a validation script for the supported scenario
- contributor and user documentation

## Recommendation Summary

For this project brief, the wrapper-based approach is the best path.

It is:

- low risk
- fast to iterate
- aligned with the Fablo user experience
- realistic for an MVP
- compatible with future evolution into a deeper Fablo integration if the workflow proves useful
