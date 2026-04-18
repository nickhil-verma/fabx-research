 
# Fabx CLI — Research Notes & Approach Documentation

*Personal notes on architecture decisions, integration strategy, and implementation rationale*

---

## Why I Started This

When I first looked at Hyperledger Fabric-X, the thing that immediately stood out was how
**fundamentally different** it is from classic Fabric. The architecture is decomposed — Orderer,
Committer, Endorser are all separate microservices now. That's a good design decision for
production scale, but it creates a real problem for anyone trying to just **run the thing
locally and understand it**.

The existing setup path involves Ansible playbooks, multi-step scripts, and a lot of manual
wiring. That's fine for production deployments, but for a developer trying to onboard,
experiment, or prototype — it's friction that shouldn't exist.

That's what pushed me toward building Fabx CLI.

---

## The Core Problem I Was Solving

The question I kept coming back to was:

> *How do I make Fabric-X as easy to spin up locally as a simple `docker-compose up`?*

And more specifically — how do I do that **without** going into Fabric-X source and modifying
things, and **without** doing a deep integration into Fablo that could break things or create
tight coupling?

That second constraint is actually what shaped the entire architecture.

---

## Why I Didn't Go With Direct Fablo Integration (And Why That Matters)

My first instinct was to extend Fablo directly. It already does something very similar for
classic Fabric — takes a config file, generates Docker Compose files, spins up a network.
The logic is there.

But when I dug deeper, I realized a few things that made direct integration feel risky.

**Fablo is built around classic Fabric assumptions.** The way it generates configs, handles
organizations, manages channel artifacts — all of that is tightly coupled to how classic Fabric
works. Fabric-X has a completely different component model. Trying to map Fabric-X's decomposed
services onto Fablo's existing generation logic would mean touching core files — the generator,
the templates, possibly the config schema itself.

**Touching core Fablo files is a problem because:**

- It makes the project dependent on Fablo's internal structure
- Any upstream change in Fablo breaks the integration
- It becomes harder to maintain separately
- It muddies the boundary between what Fablo does and what Fabric-X needs

So I made a deliberate decision early on — **do not modify Fablo internals**. Instead, build a
standalone CLI that follows the same *philosophy* as Fablo (config-driven, Docker-based, simple
commands) but implements it independently for Fabric-X.

The idea being: once this wrapper is stable and the pattern is proven, the same logic *can* be
contributed back to Fablo as a plugin or extension — but in a clean, non-invasive way. Right
now, the wrapper lets me iterate fast without worrying about breaking anything upstream.

---

## The Architecture I Proposed

The mental model I settled on is what I call a **Configuration-to-Runtime bridge**:

```text
fablo-config.json
        ↓
Fabx CLI (TypeScript + oclif)
        ↓
Docker Compose + Config Files
        ↓
Running Fabric-X Network
```

It's deliberately simple. The user writes one config file. The CLI reads it, generates
everything needed, and hands it off to Docker Compose. The developer doesn't touch Ansible,
doesn't manually write service configs, doesn't think about inter-service wiring.

---

### How I'm Actually Implementing This

**CLI Layer**
Built with oclif (TypeScript). Three core commands to start: `generate`, `up`, `down`.
Oclif gives me a clean command structure and makes it easy to extend later.

**Config Parser**
Takes the user-provided `fablo-config.json` and normalizes it into an internal representation
that the generator can work with.

**Generator**
This is the core piece. It takes the parsed config and uses EJS templates to produce the actual
Docker Compose file and any other runtime configs needed (like Prometheus config for monitoring).
I chose EJS because it's simple, readable, and easy to modify — templates are just files,
anyone can open them and understand what's being generated.

**Templates**
Separate from code. The Docker Compose template describes how Fabric-X services (Orderer,
Committer, Endorser) wire together. Keeping templates separate from generation logic means I
can update the network topology without touching TypeScript.

**Docker Helpers**
Thin wrappers around `docker compose` commands so the CLI commands stay clean and don't have
shell logic scattered everywhere.

---

### Why This Is Better Than Direct Fablo Integration Right Now

| | Direct Fablo Integration | Fabx Wrapper Approach |
|---|---|---|
| Modifies Fablo core files | Yes | No |
| Breaks on Fablo upstream changes | High risk | No dependency |
| Can iterate independently | No | Yes |
| Future Fablo contribution possible | Messy | Clean plugin path |
| Maintenance overhead | High | Low |

The wrapper approach gives me a **clean boundary**. Fabx owns its own logic entirely.
If Fablo updates tomorrow, nothing in Fabx breaks. If Fabric-X updates their Docker images,
I update my templates — not a whole integration layer.

---

## Why Docker Compose Over Ansible

This was an easy decision honestly. Ansible is powerful but it's infrastructure tooling —
it's meant for provisioning real machines, managing state across servers, handling idempotency
at scale. For local development, that's overkill and it introduces a non-trivial learning curve
just to run a test network.

Docker Compose is something most developers already have. The mental model is familiar.
The debugging story is simple — `docker ps`, `docker logs`, done. And it's stateless enough
that tearing down and rebuilding a network is just `down` followed by `up`.

For a developer experience tool, Compose is the right level of abstraction.

---

## Template-Based Config Generation

One thing I want to be clear about in my own notes — the EJS template approach is not just
a convenience, it's actually central to the design philosophy.

By keeping the Docker Compose definition in a template rather than hardcoded in TypeScript,
I'm separating **what the network looks like** from **how it gets generated**. That means:

- Adding a new Fabric-X component means adding to the template, not rewriting generator logic
- Templates are readable by someone who doesn't know TypeScript
- Different network topologies can eventually be different template variants

This is the extensibility path I'm thinking about for future iterations.

---

## Project Structure

```text
fabx-cli/
│
├── src/
│   ├── commands/              # CLI commands (oclif)
│   │   ├── generate.ts
│   │   ├── up.ts
│   │   ├── down.ts
│   │   └── status.ts
│   │
│   ├── lib/
│   │   ├── generator.ts       # Config → Docker generation
│   │   ├── docker.ts          # Docker helpers
│   │   └── config.ts          # Config parser
│   │
│   └── templates/
│       ├── docker-compose.ejs
│       └── prometheus.yml
│
├── output/                    # Generated artifacts (gitignored)
├── fablo-config.json          # User configuration
└── README.md
```

---

## What I Validated So Far

The basic flow works — config in, Docker Compose out, network up. The three core commands
function. Monitoring integration (Prometheus + Grafana) is optional and gets included based
on the config flag.

**Things I want to validate next:**

- Multi-org support (the config schema needs extending)
- Proper crypto material generation for Fabric-X
- Whether the generated configs actually satisfy Fabric-X's runtime expectations end to end

---

## Where This Goes

The immediate goal was a working MVP that proves the pattern. That's done.

**Longer term thinking:**

- Extend the config schema to support more complex topologies
- Once the generation logic is stable, look at contributing this back toward Fablo as an
  extension — not a fork, not a core modification, but a clean plugin that adds Fabric-X
  support alongside classic Fabric support
- Add proper testing so the generation layer has coverage

The wrapper approach was always meant to be a stepping stone. It lets me prove the concept
and iron out the Fabric-X specifics without the constraint of working within Fablo's existing
structure. Once it's solid, the integration path is there — and it's a much cleaner integration
than if I'd tried to do it from day one.

---

*— Nikhil Verma | GitHub: [@nickhil-verma](https://github.com/nickhil-verma)*
