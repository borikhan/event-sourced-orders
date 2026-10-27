# Architecture and operations

An aggregate is reconstructed by folding its ordered event stream. `decide` checks a command against current state and produces new events; `evolve` applies those facts. The store appends only if the caller's expected version matches the stream, converting lost updates into explicit conflicts.

## Production topology

Persist streams in PostgreSQL with `(stream_id, version)` uniqueness. Append events and an outbox record in one transaction. Projection workers consume the outbox idempotently and checkpoint progress. APIs can provide read-your-writes by returning the freshly evolved aggregate while eventually consistent read models catch up.

Events are durable contracts. Prefer additive fields, record schema versions, keep upcasters deterministic, and never edit historical facts. Snapshot only measured hot aggregates; snapshots are caches, not truth.

## Twelve-factor mapping

| Factor | Implementation |
|---|---|
| Codebase | One independently deployable order service |
| Dependencies | Exact npm lockfile and strict compiler settings |
| Config | Store, queue, port, and telemetry settings come from environment |
| Backing services | Event database and broker are attached resources |
| Build, release, run | Compile/test, package, then inject runtime config |
| Processes | APIs and projectors keep durable state outside the process |
| Port binding | Node HTTP server exposes the service directly |
| Concurrency | Scale APIs and projection consumers independently |
| Disposability | Optimistic concurrency and checkpoints make restarts safe |
| Dev/prod parity | Same event contracts and release artifact everywhere |
| Logs | Structured domain/operational events stream outward |
| Admin processes | Rebuilds and upcasters run from the same versioned release |
