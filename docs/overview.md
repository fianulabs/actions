# Fianu Core Newcomer Overview

Fianu's compliance automation platform spans several repositories that deliver
GitHub-native workflows, a CLI, backend services, and data processing workers.
This guide lives in the `core` repository because the API surface defined here
is the heart of the system: every other component depends on it for policy
execution and data access. The document explains how `core` interacts with the
other codebases—`actions`, `pkg`, `fianu-plugins`, `db`, and `controllers`—so a
new contributor can confidently navigate the ecosystem.

## High-Level Architecture

```
┌─────────────┐      ┌─────────────┐      ┌────────────┐      ┌──────────────┐
│ GitHub CI   │ ---> │ Actions CLI │ ---> │ Core API   │ ---> │ Database +   │
│ & Plugins   │      │ + Plugins   │      │ (services) │      │ background   │
│             │      │             │      │            │      │ controllers) │
└─────────────┘      └─────────────┘      └────────────┘      └──────────────┘
```

1. The [`actions`](https://github.com/fianulabs/actions) repository packages the
   GitHub Actions that install the CLI, capture evidence, and enforce gates.
2. Those Actions install the CLI artifact produced from the
   [`pkg`](https://github.com/fianulabs/pkg) repository and optionally load
   additional checks implemented in
   [`fianu-plugins`](https://github.com/fianulabs/fianu-plugins).
3. The CLI communicates with the backend APIs that live in
   [`core`](https://github.com/fianulabs/core), which provides REST/GraphQL
   endpoints, gate evaluation services, and orchestration logic.
4. `core` persists and queries state through the database schema defined in
   [`db`](https://github.com/fianulabs/db).
5. Long-running or asynchronous work—such as evidence processing, queue
   consumption, and external integrations—runs in the workers housed in
   [`controllers`](https://github.com/fianulabs/controllers).

Understanding how a change in one repository affects the others keeps features
coherent and avoids breaking downstream workflows.

## Repository Cheat Sheet

| Repository | Primary Technologies | Responsibilities | Key Integration Points |
| ---------- | -------------------- | ---------------- | ---------------------- |
| `actions` | Node.js, composite GitHub Actions | Installs the Fianu CLI and codifies CI workflows for evidence capture, SBOM import, and gating. | Publishes compiled actions that download CLI releases from `pkg` and contact the `core` API. |
| `pkg` | TypeScript, packaging scripts, release automation | Builds the Fianu CLI and supporting JavaScript/TypeScript SDKs. Ships artifacts to cloud buckets consumed by `actions` and other clients. | Exports the binaries and shared libraries that Actions download; shares configuration schemas with `core` and `controllers`. |
| `fianu-plugins` | TypeScript/JavaScript plugin SDK | Hosts optional plugins that extend the CLI with additional evidence collectors or gate checks. | Plugins are dynamically loaded by the CLI from `pkg`; Actions expose inputs that toggle plugin behaviour. |
| `core` | Backend service stack (API framework, domain services) | Authoritative source for assets, gates, audit trails, and workflow orchestration. Handles authentication and policy enforcement. | Provides REST/GraphQL APIs consumed by the CLI; emits events and tasks processed by `controllers`; stores metadata in `db`. |
| `db` | SQL migrations, schema definitions, seed data | Defines the Postgres schema backing the platform. Maintains migrations, views, and stored procedures used by `core` and `controllers`. | Versioned migrations must be kept in sync with `core` models and `controllers` queries. |
| `controllers` | Worker services, queue processors | Executes asynchronous jobs such as evidence normalization, external scanner ingestion, and gate evaluation pipelines. | Listens to events emitted by `core`, persists derived data via `db`, and may invoke plugins distributed through `pkg`. |

## How `core` Fits Into the Platform

- **Contract owner:** `core` defines the public API consumed by the CLI. Any
  change to request/response shapes must be coordinated with releases from the
  `pkg` repository and with GitHub Actions that parse those responses.
- **Source of truth:** Domain entities such as assets, gates, controls,
  evidence, and audit logs are mastered in `core`. Controllers project that data
  into task-specific stores, but the API is the authoritative layer.
- **Schema migrations:** When `db` introduces migrations, `core` owns the
  application-layer code that adopts those structures. Review PRs across both
  repositories to guarantee forward- and backward-compatibility.
- **Event choreography:** Many API operations emit events (e.g., "evidence
  captured" or "gate evaluated") that kick off controller jobs. Keep those
  contracts stable and versioned; breakages surface as stalled background work
  rather than failing HTTP responses.

## Getting Started in the `core` Repository

1. **Set up the stack**
   - Install dependencies as described in the local README (e.g., `npm install`
     or language-specific tooling).
   - Use `docker compose` (or the equivalent script) to boot Postgres and any
     message brokers required by the services.
   - Run the development server (`npm run dev`, `go run`, etc.) and hit the
     health endpoint to verify connectivity.
2. **Explore key modules**
   - Start with authentication/authorization, since the CLI authenticates before
     every request.
   - Trace gate evaluation flows: identify where policies are loaded, evaluated,
     and persisted.
   - Review integration points that emit events to `controllers`.
3. **Exercise the API**
   - Use the CLI from `pkg` or an HTTP client to call endpoints such as
     `/auth`, `/evidence`, `/gates`, and `/workflows`.
   - Record request/response examples in the API docs to help downstream teams.
4. **Coordinate with other repos**
   - Subscribe to releases from `pkg` to know when new CLI versions expect API
     changes.
   - Keep an eye on `db` migrations and `controllers` worker updates that may
     require corresponding feature toggles or version guards in `core`.

## Suggested Learning Path Across Repositories

1. **Trace an end-to-end workflow:** Trigger a sample GitHub workflow that uses
   the Actions, follow the CLI calls into the `core` API, and observe the
   resulting entries in the database and controller logs.
2. **Map shared configuration:** Compare the configuration structures defined in
   `pkg`, exposed in Actions inputs, and enforced in `core` to understand where
   validation occurs.
3. **Add a small enhancement:** For example, introduce a new evidence flag in a
   plugin, expose it in the CLI, and add a corresponding controller job—updating
   `core` endpoints along the way.
4. **Dive into observability:** Familiarise yourself with the dashboards and
   alerting covering controllers and the core API so you can trace incidents
   that originate from CI automation.
5. **Document as you learn:** Update README files, architectural decision
   records, or runbooks in each repo to capture tribal knowledge for the next
   contributor.

With this overview, a newcomer to the `core` repository can understand how their
changes ripple through the broader Fianu platform and where to explore next.
