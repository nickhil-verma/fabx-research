
# 🚀 Fabx CLI

## 📸 Architecture & Network Preview

### 🏗️ Design Concept
The following diagram illustrates the transition from infrastructure-heavy manual scripts to a streamlined developer experience.

<img width="1830" height="1042" alt="image" src="https://github.com/user-attachments/assets/bd60788e-1a06-490c-b009-43b9b12eeb51" />

---

### 🟢 Network in Action (Operational Snapshots)
These screenshots demonstrate the **Fabx CLI** successfully managing a live Fabric-X network.

**1. Network Initialization & Service Bootstrapping**
<img width="2836" height="1344" alt="image" src="https://github.com/user-attachments/assets/159056c3-b4c0-43b2-8e82-794265c99286" />

**2. Component Health & Peer Status**
<img width="2835" height="711" alt="image" src="https://github.com/user-attachments/assets/a4b73efe-122a-4373-a963-89983c269e29" />

**3. Docker Container Orchestration**
<img width="2846" height="1321" alt="image" src="https://github.com/user-attachments/assets/22cb181b-103b-4063-b13c-ec3cbf80cc3f" />

**4. Transaction Verification & Logs**
<img width="1805" height="267" alt="image" src="https://github.com/user-attachments/assets/3e8b8af1-3fd7-49ac-af9c-40de5bce2039" />

**5. Successful Network Teardown**
<img width="2871" height="479" alt="image" src="https://github.com/user-attachments/assets/8654c5ea-6dcd-4d49-9308-497035a6072c" />

---

## 📖 Overview

**Fabx CLI** is a wrapper-based MVP that brings a Fablo-style developer experience to **Hyperledger Fabric-X**. 

It simplifies the process of running a local Fabric-X network by replacing complex manual setups (like Ansible scripts) with a configuration-driven, **Docker-based workflow**.

---

## 🎯 Project Goals

* **Reduce setup friction** for Fabric-X.
* **Enable fast local experimentation** and rapid prototyping.
* **Provide a repeatable developer workflow** across different environments.
* **Abstract Fabric-X complexity** behind a unified CLI.
* **Serve as a foundation** for future Fablo integration.

---

## 🧩 Repository Structure

| File/Folder | Purpose |
| :--- | :--- |
| `DESIGN_PROPOSAL.md` | Detailed architectural design and vision. |
| `examples/basic/` | Example configuration and getting started workflow. |
| `bin/` | Core CLI implementation scripts. |
| `guide.MD` | Comprehensive user documentation. |
| `IMPLEMENTATION.MD` | Technical deep-dive into the MVP logic. |

---

## 🏗️ Architecture Comparison

### 🔴 Traditional Fabric-X (Ansible-Based)
* Manual setup using complex Ansible playbooks.
* Multi-step configuration and heavy dependency management.
* Tight coupling with specific infrastructure providers.
* Difficult debugging and slow iteration cycles.

### 🟢 Fabx CLI (Wrapper + Docker-Based)
* **Single-command** network setup.
* **Docker Compose-based** orchestration for isolation.
* **Configuration-driven** via a single `fablo-config.json`.
* Fast iteration, easy log access, and a developer-first experience.

---

## 📊 Feature Comparison Matrix

| Feature | Traditional Fabric-X | Fabx CLI |
| :--- | :--- | :--- |
| **Setup Complexity** | High | Low |
| **Commands Required** | Multiple scripts | Single CLI command |
| **Deployment Style** | Infrastructure-heavy | Local Docker-based |
| **Configuration** | Distributed | Centralized |
| **Iteration Speed** | Slow | Fast |
| **Reproducibility** | Low | High |
| **Use Case** | Production Infrastructure | Dev / Testing / MVP |

---

## 🧠 Key Insight

> **Traditional Fabric-X** = Infrastructure-first approach  
> **Fabx CLI** = Developer-first approach

---

## ⚙️ MVP Scope

The current MVP supports a local Fabric-X network consisting of the following key components:
* **Committer**: Validates and commits transactions.
* **Issuer**: Manages credential issuance.
* **Endorser**: Handles transaction endorsement logic.
* **Owner**: Represents the identity-holding entity.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
npm run build
```

### 2. Lifecycle Commands
Manage your network using the following sequence:

```bash
node ./bin/run.js generate  # Generate runtime configuration
node ./bin/up.js           # Start the Fabric-X network
node ./bin/run.js check     # Verify network health
node ./bin/run.js status    # Inspect running services
node ./bin/run.js down      # Stop and clean up the network
```

---

## 🧪 Validation

To run the full MVP validation suite, execute:
```bash
npm run validate:mvp
```
**This script ensures:**
1. Configuration files are generated correctly.
2. The network boots successfully.
3. All services reach a "Healthy" status.
4. Cleanup procedures work as intended.

---

## 🏛️ Architecture Flow

1.  **Input:** `fablo-config.json`
2.  **Process:** `node ./bin/run.js generate`
3.  **Artifact:** `docker-compose.yaml`
4.  **Action:** `node ./bin/up.js`
5.  **Result:** Docker containers start (issuer, endorser, committer, owner)
6.  **Outcome:** **Fabric-X Network Ready**

---

## 🔮 Recommended Integration Path

This project follows a **wrapper-based approach** rather than modifying the Fablo core directly. 

**Why?**
* **Architecture:** Fabric-X differs significantly from "Classic" Fabric.
* **Agility:** Faster validation without deep coupling to upstream code.
* **Modularity:** Keeps the system extensible for future plugin-based integration.

---

## 💡 Future Improvements
* **Transaction CLI:** `fabx tx` for interacting with the ledger.
* **Observability:** Built-in benchmarking and performance visualization.
* **ZK Setup:** Simplified Zero-Knowledge proof setup (`pp.json` generation).
* **UI Dashboard:** A web-based interface to monitor network health.
 
