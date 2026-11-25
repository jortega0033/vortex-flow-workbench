# Vortex Flow Workbench

A local browser workbench for running and validating 2D incompressible flow simulations.

Only a runnable scaffold exists; no product behaviour is implemented yet. The scope, architecture and acceptance criteria are in [the project plan](docs/PROJECT-PLAN.md). The plan includes a reproducible verification strategy for the future build.

- [Product requirements](docs/PROJECT-PLAN.md#product-requirements)
- [Technical design](docs/PROJECT-PLAN.md#technical-design)
- [Implementation backlog and epic](https://github.com/jortega0033/vortex-flow-workbench/issues)

The first plan of phase 1 said 24–38 engineering hours. Its open tickets, with tests and review, add up to 63 to 96 hours; the whole program is larger and is described below. All figures are estimates.

## Program goal

Build a computational fluid dynamics laboratory in the browser: accurate solvers for laminar, turbulent, compressible and free-surface flow in 2D and 3D, on GPU, with adaptive meshes, shape optimisation and published-benchmark agreement.

The program is planned ([#35](https://github.com/jortega0033/vortex-flow-workbench/issues/35)). Phase 1 is the current epic [#1](https://github.com/jortega0033/vortex-flow-workbench/issues/1) and the only phase with tickets.

**Score.** Number of published benchmark cases matched within their stated uncertainty, with the observed order of convergence for each solver.

| Phase | Content | Hours (rough) | Issue |
|---|---|---|---|
| 1 | The current epic and its tickets | 63 to 96 | [#1](https://github.com/jortega0033/vortex-flow-workbench/issues/1) |
| 2 | Verified 2D | 130 to 220 | [#36](https://github.com/jortega0033/vortex-flow-workbench/issues/36) |
| 3 | 3D and GPU | 160 to 280 | [#37](https://github.com/jortega0033/vortex-flow-workbench/issues/37) |
| 4 | Turbulence | 150 to 260 | [#38](https://github.com/jortega0033/vortex-flow-workbench/issues/38) |
| 5 | More physics | 180 to 320 | [#39](https://github.com/jortega0033/vortex-flow-workbench/issues/39) |
| 6 | Design | 140 to 250 | [#40](https://github.com/jortega0033/vortex-flow-workbench/issues/40) |

About 820 to 1430 engineer hours in total: rough estimates, not measurements. The numbers in the score and the finish lines are targets until a run shows them. Only phase 1 has tickets to work; the sub-issues of a later phase are written when it starts. No single session is expected to reach the end.

## License

[MIT](LICENSE) © 2026 Jake Ortega.
