# Implementer map

Status: **only the scaffold exists; no product behaviour is implemented.** Module files hold a responsibility comment and no logic. This page maps the boundaries that [PROJECT-PLAN.md](PROJECT-PLAN.md) requires onto a module layout so that parallel tickets do not collide. It adds no requirement; the plan wins where they differ. The names are the orchestrator's proposal, fixed by the scaffold; a ticket that changes one corrects this page in the same pull request.

## Planned module map

| Boundary | Module | Owns | Parent ticket |
|---|---|---|---|
| Cases | `solver/cases.mjs` | Case record, presets, validation, caps | #2, #5, #6 |
| Face grid | `solver/grid.mjs` | Indexing, strides, divergence, gradient, signed flux | #2 |
| Projection | `solver/projection.mjs` | Pressure solve, compatibility check, correction | #3, #6 (outlet) |
| Time stepping | `solver/step.mjs` | Provisional momentum, transport, step bound, atomic acceptance | #3, #6 (limited transport) |
| Boundaries | `solver/boundaries.mjs` | Walls, periodic seam, inlet, outlet, mask faces | #3, #5, #6 |
| Diagnostics | `solver/diagnostics.mjs` | Divergence, balances, vorticity, centerlines, probes, CSV rows | #3, #5, #6 |
| Worker | `app/worker.mjs` | Owns the arrays; message contract, batches, frames | #4 (fixture worker), #7 (real solver) |
| Page | `app/` | Controls, canvas field, legend, plots, captures, CSV export | #2 (recorded frame), #4, #5, #6 |
| Static server | `server/serve.mjs` | Loopback server with a file allowlist | #2 |
| Command line | `cli/flow.mjs` | Preflight, deterministic runs, progress, CSV | #2 (entry), #7 (real solver) |
| Tests | `test/` | `node --test`; fixtures and independent arithmetic | every ticket |

Dependency direction: `app/worker.mjs` and `cli/flow.mjs` depend on `solver/`; `step` on `projection`, `boundaries`, `grid`; `diagnostics` on `grid`. `solver/` imports nothing outside itself.

## Freeze points

Parallel tickets rely on these shapes. A ticket that changes a frozen shape updates this page and every dependent ticket in the same pull request.

- **Face-grid indexing and sign convention**, with the two-cell fixture: ticket #2.
- **Case record version 1** (preset ID, domain, cells, viscosity or Reynolds number, velocity reference, boundary parameters, step duration, step cap): #2.
- **Frame and worker message contract** (generation, sequence, grid, step, time, versions, vorticity, centerlines, iterations, divergence, balance): #2; #4 builds against a fixture worker, #7 connects the solver.
- **Diagnostic CSV columns**: #4, filled by #5 and #6.

## What is verified where

Solver, command line and server run under `node --test` locally and in CI on Linux and Windows. The supported target is a Linux desktop with Chrome; browser checks are manual in Chrome unless a ticket states a headless run, and the pull request says which, with the Chrome version.
