```markdown
# 🚀 Fabx CLI — Implementation Guide

> *My personal notes while exploring Fabric-X for the LFX Mentorship program*

```ascii
███████╗ █████╗ ██████╗ ██╗  ██╗
██╔════╝██╔══██╗██╔══██╗╚██╗██╔╝
█████╗  ███████║██████╔╝ ╚███╔╝ 
██╔══╝  ██╔══██║██╔══██╗ ██╔██╗ 
██║     ██║  ██║██████╔╝██╔╝ ██╗
╚═╝     ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝
```

---

## 📌 What This Document Is

This is my personal implementation log — written as I explored and figured out how to get
**Fabric-X running locally** during my **LFX Mentorship** work.

I'm documenting this partly for myself (so I don't forget what I figured out), and partly
because I think it could be useful for anyone else who tries to do the same thing and runs
into the same walls I did.

The goal was simple on paper:

> *Get a Fabric-X network running locally without going through the full Ansible-based setup.*

What I ended up building to make that happen is what I'm calling **Fabx CLI**.

---

## 🧭 Where I Started

When I first picked up this mentorship task, I spent a good amount of time just reading through
the Fabric-X repository trying to understand what was actually there.

A few things became clear pretty quickly:

- Fabric-X is **not** classic Fabric with some changes — it's a fundamentally different
  architecture. Orderer, Committer, Endorser are all separate microservices now.
- The existing way to run it involves Ansible playbooks and a lot of manual setup steps.
  That's clearly built for production-grade deployments, not local exploration.
- There's a `samples/tokens` directory inside the repo that has actual Dockerfiles and
  sample configuration — this turned out to be the most useful thing I found.

So my starting point became: **can I use those sample Dockerfiles and configs to spin up
something locally without touching Ansible at all?**

The answer is yes — but it took some figuring out.

---

## ✅ What You Need Before Starting

| Requirement | Version | Why |
|---|---|---|
| 🐳 Docker Desktop | Latest | Everything runs in containers |
| 🟢 Node.js + npm | v16+ | To build and run the CLI |
| 🔧 Git | Any | Submodule needs to be present |

> **Note:** Make sure the `fabric-x` submodule is actually initialized.
> I got tripped up by this early on — the submodule directory was there but empty.
> Run `git submodule update --init --recursive` if that happens.

---

## ⚡ How to Actually Run This

### Step 1 — Build the CLI

```bash
npm install
npm run build
```

---

### Step 2 — Generate the Compose File

> This reads the config and writes `output/docker-compose.yaml`

```bash
# From project root
node ./bin/run.js generate

# Or if fabx is linked locally
fabx generate
```

---

### Step 3 — Bring the Network Up

> This builds the Docker images and starts the containers

```bash
node ./bin/run.js up

# Or
fabx up
```

---

### Step 4 — Check What's Running

```bash
docker ps
```

---

### Step 5 — Tear It Down

```bash
node ./bin/run.js down

# Or
fabx down
```

---

## 📁 What I Built and Where Things Live

As I figured out each piece, here's how the project ended up structured:

```text
fabx-cli/
│
├── 📄 templates/
│   └── docker-compose.ejs       ← I write the compose structure here as a template
│                                   CLI renders it into output/ at generate time
│
├── 📄 src/
│   ├── lib/
│   │   └── docker.ts            ← Helpers I wrote: up(), down(), listFabricXContainers()
│   └── commands/
│       └── up.ts                ← The actual `fabx up` command flow
│
├── 📄 output/
│   └── docker-compose.yaml      ← Generated at runtime — gitignored, recreated each time
│
└── 📄 fabric-x/                 ← The actual Fabric-X submodule
    ├── Dockerfile               ← Builds CLI tools (configtxgen, cryptogen, etc.)
    └── samples/tokens/
        ├── Dockerfile           ← This is what builds the actual service binaries
        └── conf/
            ├── issuer/          ← Sample configs I mount into containers
            ├── endorser/
            └── owner/
```

The `samples/tokens` directory inside the submodule was the key discovery.
That's where the actual runnable Dockerfiles and configs live.

---

## 🏗️ How I Thought About the Architecture

Once I understood what was in the Fabric-X repo, I needed a way to wire it all together
without writing everything by hand every time. This is the flow I landed on:

```text
┌─────────────────────────────────────────────────────────┐
│                      Me (Developer)                     │
│              fabx generate  →  fabx up                  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Fabx CLI                             │
│              (TypeScript + oclif)                       │
│                                                         │
│   ┌─────────────┐    ┌──────────────┐    ┌──────────┐  │
│   │ config.ts   │───▶│ generator.ts │───▶│ docker.ts│  │
│   │ (parser)    │    │ (EJS render) │    │ (compose)│  │
│   └─────────────┘    └──────────────┘    └──────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              output/docker-compose.yaml                 │
│          (generated fresh each time)                    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Docker Compose                         │
│              docker compose --build -d                  │
│                                                         │
│   ┌───────────┐   ┌───────────┐   ┌───────────┐        │
│   │  Issuer   │   │ Endorser  │   │   Owner   │        │
│   │ Container │   │ Container │   │ Container │        │
│   └───────────┘   └───────────┘   └───────────┘        │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 What Actually Happens at Runtime

Here's exactly what runs when you execute the commands — I traced through this carefully
because the first few times things failed silently and I needed to know what was happening where:

```text
  ┌─────────────────────────────────────────────────────────────┐
  │                                                             │
  │   1.  fabx generate                                        │
  │        └─▶ Reads fablo-config.json                         │
  │            └─▶ Renders docker-compose.ejs template         │
  │                └─▶ Writes output/docker-compose.yaml ✅    │
  │                                                             │
  │   2.  fabx up                                              │
  │        └─▶ docker compose --build -f output/... up -d      │
  │            ├─▶ Builds images from fabric-x/samples/tokens  │
  │            ├─▶ Mounts conf/ dirs into each container       │
  │            └─▶ Starts: issuer | endorser | owner    ✅     │
  │                                                             │
  │   3.  CLI Validation                                        │
  │        └─▶ listFabricXContainers()                         │
  │            └─▶ Runs docker ps, filters Fabric-X names      │
  │                └─▶ Prints status or diagnostics     ✅     │
  │                                                             │
  │   4.  fabx down                                            │
  │        └─▶ docker compose -f output/... down        ✅     │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
```

---

## 🔗 How the Fabric-X Bridge Actually Works

This is the part I spent the most time on — understanding how to connect the CLI output
to the actual Fabric-X source. Here's what I discovered:

### 🔹 Build Contexts — Pointing Docker at the Right Place

The key insight was setting the compose `build.context` to point inside the submodule:

```text
compose template
      │
      └─▶  build.context: ../fabric-x/samples/tokens
                │
                └─▶ Docker finds the Dockerfile + source
                    inside the submodule at build time
```

This means Docker is building real Fabric-X binaries from source — not pulling some
pre-built image from a registry.

---

### 🔹 NODE_TYPE Build Args — One Dockerfile, Multiple Services

One thing I found interesting: there's a single Dockerfile in `samples/tokens` that builds
all three services. The `NODE_TYPE` build arg is what differentiates them:

```text
  ┌─────────────┬──────────────────────────┐
  │  Service    │  Build Arg               │
  ├─────────────┼──────────────────────────┤
  │  Issuer     │  NODE_TYPE=issuer        │
  │  Endorser   │  NODE_TYPE=endorser      │
  │  Owner      │  NODE_TYPE=owner         │
  └─────────────┴──────────────────────────┘
```

So each container gets its own image built from the same Dockerfile, just with a
different arg passed in. The compose template handles this per-service.

---

### 🔹 Configuration Volumes — Sample Configs as a Starting Point

The `conf/` directories inside `samples/tokens` are what I'm mounting into containers
so each service has something to read at startup:

```text
fabric-x/samples/tokens/conf/
        │
        ├── issuer/    ──▶  mounted to /conf  inside issuer container
        ├── endorser/  ──▶  mounted to /conf  inside endorser container
        └── owner/     ──▶  mounted to /conf  inside owner container
```

These are the sample configs that come with Fabric-X. They're not production configs —
they're just enough to get the services to start and be explorable locally.

---

### 🔹 Two Dockerfiles — Which One Does What

I got confused by this at first so I'm noting it clearly:

```text
  fabric-x/
  │
  ├── Dockerfile               ← Builds the CLI/tools image
  │   └── configtxgen, cryptogen, etc.
  │   └── (I don't use this for runtime services)
  │
  └── samples/tokens/
      └── Dockerfile           ← Builds actual runtime services ✅
          └── issuer, endorser, owner binaries
          └── (this is what fabx up builds from)
```

---

### 🔹 How I Verify Things Started

I wrote `listFabricXContainers()` in `docker.ts` to check this automatically:

```text
listFabricXContainers()
      │
      └─▶ runs: docker ps
          └─▶ filters output for Fabric-X container names/images
              └─▶ prints what's running or flags what's missing
```

---

## 🐛 Things That Went Wrong (And How to Debug Them)

These are the issues I actually hit — logging them here so I don't repeat them:

### ❌ `fabx up` fails with no clear error

Run compose directly without the `-d` flag so you see the full output:

```bash
docker compose -f output/docker-compose.yaml up --build
```

---

### ❌ Container starts then immediately exits

Check the logs — this is almost always a config issue:

```bash
docker logs <container_name>
```

---

### ❌ Compose file looks wrong or missing

Check what was actually generated:

```bash
cat output/docker-compose.yaml
```

Make sure the `build.context` paths in there actually point to where the submodule is.

---

### ❌ `conf/` directory missing or empty

This was a submodule issue for me. Verify:

```bash
ls fabric-x/samples/tokens/conf/
```

You should see `issuer/`, `endorser/`, `owner/` — each with config files inside.
If not, re-init the submodule:

```bash
git submodule update --init --recursive
```

---

## ⚠️ Honest Notes on What This MVP Does and Doesn't Do

```text
  ┌─────────────────────────────────────────────────────────────┐
  │  What works right now                                       │
  │  ✅ Generates compose file from template                    │
  │  ✅ Builds Fabric-X service images from submodule source    │
  │  ✅ Starts issuer, endorser, owner containers               │
  │  ✅ Mounts sample conf/ directories                         │
  │  ✅ Validates running containers via docker ps              │
  │  ✅ Optional Prometheus + Grafana monitoring                │
  ├─────────────────────────────────────────────────────────────┤
  │  What I haven't tackled yet                                 │
  │  ❌ Multi-org network topology                              │
  │  ❌ Full committer microservice decomposition               │
  │  ❌ External database wiring                                │
  │  ❌ Automated crypto material generation                    │
  └─────────────────────────────────────────────────────────────┘
```

This is genuinely an MVP — it gets the services running locally so they can be explored
and understood. The more complete orchestration can come in later iterations once the
pattern is proven.

---

## 🗺️ Where I Think This Goes Next

```text
  Now (MVP)                  Next                      Later
  ──────────────────         ──────────────────────    ──────────────────────
  ✅ generate                🔲 multi-org support      🔲 Fablo plugin path
  ✅ up / down               🔲 crypto generation      🔲 CI pipeline support
  ✅ 3 core services         🔲 extended config schema 🔲 automated testing
  ✅ monitoring (opt)        🔲 committer services     🔲 full config validation
```

The longer term idea is that once this wrapper is stable, the same approach could be
contributed back toward Fablo as a clean extension — adding Fabric-X support without
touching Fablo's core files. But that's a later problem. Right now the goal is just
getting the local workflow solid.

---

*Personal notes — Nikhil Verma | LFX Mentorship 2025*
*GitHub: [@nickhil-verma](https://github.com/nickhil-verma)*
```