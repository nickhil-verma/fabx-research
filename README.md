
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

## � Transaction Execution Flow

The Fabx CLI provides comprehensive transaction management capabilities through the **`tx`** command.

### Quick Start: Execute a Transaction

```bash
# Default transaction: Issue 1000 TOK to alice on owner1
node ./bin/run.js tx

# Issue 5000 TOK to bob
node ./bin/run.js tx --amount 5000 --account bob

# Issue custom token with message
node ./bin/run.js tx --code USD --amount 500 --account charlie --message "Custom transaction"

# Skip namespace initialization if already initialized
node ./bin/run.js tx --skip-init
```

### Transaction Command (`tx`) - Full Reference

**Purpose**: Create and execute Fabric-X token transactions with automatic verification.

**Basic Syntax**:
```bash
node ./bin/run.js tx [OPTIONS]
```

### Available Flags

| Flag | Short | Type | Default | Description |
|------|-------|------|---------|-------------|
| `--amount` | `-a` | integer | `1000` | Token quantity to issue |
| `--code` | `-c` | string | `TOK` | Token code/symbol to issue |
| `--account` | — | string | `alice` | Owner account receiving tokens |
| `--node` | — | string | `owner1` | Owner node receiving tokens |
| `--message` | `-m` | string | `Fabx CLI transaction` | Message attached to transaction |
| `--issuer` | — | URL | `http://localhost:9100` | Issuer API endpoint |
| `--endorser` | — | URL | `http://localhost:9300` | Endorser API endpoint |
| `--owner` | — | URL | `http://localhost:9500` | Owner API endpoint |
| `--skip-init` | — | boolean | `false` | Skip namespace initialization |

### Transaction Examples

#### 1. Basic Transaction (Using All Defaults)
```bash
node ./bin/run.js tx
# Issues 1000 TOK to alice on owner1 with default message
# Expected Result: Transaction confirmed, balance verified
```

#### 2. Issue Multiple Tokens
```bash
node ./bin/run.js tx --amount 5000 --code EUR --account david --node owner2
# Issues 5000 EUR to david on owner2
```

#### 3. Transaction with Custom Message
```bash
node ./bin/run.js tx -a 2500 -c USD -m "Supply Chain Payment"
# Issues 2500 USD with custom message
```

#### 4. Skip Initialization (Faster Execution)
```bash
# First transaction (initializes namespace)
node ./bin/run.js tx

# Subsequent transactions (skip init for speed)
node ./bin/run.js tx --skip-init --amount 3000 --account eve
```

#### 5. Use Custom Endpoints
```bash
node ./bin/run.js tx \
  --issuer http://custom-issuer:9100 \
  --endorser http://custom-endorser:9300 \
  --owner http://custom-owner:9500 \
  --amount 1000 --account frank
```

### Transaction Workflow

The `tx` command executes the following steps automatically:

```
1. Verify network health (all services running)
   ↓
2. Initialize Fabric-X token namespace (if --skip-init not set)
   ↓
3. Issue tokens to specified account/node
   ↓
4. Query account balance
   ↓
5. Retrieve transaction history
   ↓
6. Return complete transaction details & verification
```

### Example Output

```
Initializing Fabric-X token namespace...
Issuing 1000 TOK to owner1/alice...
Transaction submitted successfully.
Issue response: {
  status: 200,
  txId: "117064678fe8978cea0371df1b1e9fec7351d36f79dfa6185f683a5d3ab09f09",
  message: "Token issued successfully"
}
Account balance: {
  account: "alice",
  code: "TOK",
  value: 1000,
  status: "Confirmed"
}
Account transactions: [
  {
    txId: "117064678fe8978cea0371df1b1e9fec7351d36f79dfa6185f683a5d3ab09f09",
    type: "issue",
    amount: 1000,
    timestamp: "2026-05-03T10:30:45Z"
  }
]
```

### Prerequisites Before Running Transactions

1. **Start the network**:
   ```bash
   node ./bin/run.js generate
   node ./bin/run.js up
   node ./bin/run.js check  # Verify all services are healthy
   ```

2. **Verify network status**:
   ```bash
   node ./bin/run.js status
   # Should show: fabricx_issuer, fabricx_endorser, fabricx_owner, fabricx_committer all healthy
   ```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Fabric-X network is not fully running" | Run `node ./bin/run.js up` first |
| "Failed to create transaction" | Check endpoint URLs with `--issuer`, `--endorser`, `--owner` flags |
| "Namespace initialization timeout" | Increase timeout or use `--skip-init` on retry |
| "Connection refused" | Verify Docker services are running: `docker ps \| grep fabricx` |

### Key Transaction Features
* **Ledger Interaction**: Direct interaction with Fabric-X ledger through CLI commands.
* **Automatic Verification**: Verify transaction and balance immediately after execution.
* **State Management**: Track asset state across participants (Committer, Issuer, Endorser, Owner).
* **Transaction History**: Retrieve complete audit trail of all executed transactions.
* **Custom Messaging**: Attach messages to transactions for operational context.

---

## 💡 Future Improvements
* **Advanced Transaction Analytics**: Detailed transaction metrics and insights.
* **Observability:** Built-in benchmarking and performance visualization.
* **ZK Setup:** Simplified Zero-Knowledge proof setup (`pp.json` generation).
* **UI Dashboard:** A web-based interface to monitor network health and transactions.
 
