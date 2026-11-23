# Owner decisions

A dated record of the decisions made for this repository, so the rules do not depend on anyone's memory of a conversation. Changing any entry needs the owner. An agent that finds a decision blocking a ticket stops and says so.

The owner made decisions 1 to 10 and 12 on 2026-11-22 for all repositories that get the SDLC kit, and asked on 2026-11-23 to apply the kit here (jortega0033/sdlc-kit v1.1.0). Each row says who decided.

| # | Decision | Source | Date | Implemented in |
|---|---|---|---|---|
| 1 | The instructions, tooling and playbook live on the default branch (`main`). | decided by the owner | 2026-11-22 | `CLAUDE.md`, `.claude/`, `.github/` |
| 2 | Persona agents run automatically during ticket work and carry instructions tailored to this project. | decided by the owner | 2026-11-22 | `.claude/agents/`, `.claude/agency-agents/README.md`, `CLAUDE.md` "Agent roles" |
| 3 | Every open ticket is about app implementation; tooling is installed, not ticketed. | decided by the owner | 2026-11-22 | `.claude/`, `.github/`, `docs/` |
| 4 | Agents may take a ticket up to a ready pull request. Only the owner merges and releases. | decided by the owner | 2026-11-22 | `CLAUDE.md`, `.claude/skills/next-ticket/SKILL.md`, `docs/RELEASING.md`, `.claude/settings.json` |
| 5 | No scheduler. Ticket work starts only on the owner's go signal (`/next-ticket`), because the repository is used to train AI models. | decided by the owner | 2026-11-22 | `.claude/skills/next-ticket/SKILL.md`, `LOOP.md` |
| 6 | A review gate hook blocks opening or readying a pull request until the gate roles have run after the last code edit. | decided by the owner | 2026-11-22 | `.claude/hooks/role-gate.mjs`, `.claude/settings.json` |
| 7 | Loop Engineering stays at L1, report-only and unscheduled. | decided by the owner | 2026-11-22 | `LOOP.md`, `loop-constraints.md`, `loop-budget.md` |
| 8 | Continuous integration runs on Linux and Windows; the default branch requires a pull request and green checks. The product targets a Linux desktop; the Node checks also run on Windows. | decided by the owner | 2026-11-22 | `.github/workflows/ci.yml`; branch protection is a repository setting |
| 9 | Permission rules: documented commands are allowed; force pushes, pushes to the default branch, merges, releases and reads of secrets are denied; edits to CI, agent configuration and Loop files ask first. | decided by the owner | 2026-11-22 | `.claude/settings.json` |
| 10 | Open decisions on tickets are settled with the ticket's stated default; where a ticket states none, the conservative option is taken and flagged in the issue. | decided by the owner | 2026-11-22 | The list below; the issues themselves |
| 11 | Nothing is installed on the owner's PC for this project: Node is already there. No npm dependency is used, in the application or in tests. | recommended by the orchestrator, following the plan ("dependency-free modern JavaScript modules") | 2026-11-23 | `CLAUDE.md` "Commands", `.github/workflows/ci.yml` |
| 12 | The ten UI rules in `docs/ui-quality.md` are binding, and the `ui-ux-pro-max` and `unslop` skills are installed in the repository and used for UI work and for copy. | decided by the owner | 2026-11-22 | `docs/ui-quality.md`, `.claude/skills/` |
| 13 | Visual system: the Pipenzo Flow look tokens. | decided by the owner | 2026-11-23 | `app/tokens.css`, `docs/design-tokens.md` |
| 14 | Token rules 14-D1 to 14-D4. | 14-D1 use of yellow decided by the owner; how it is drawn, and 14-D2 to 14-D4, recommended by the orchestrator and adopted under the owner's delegation of 2026-11-23 | 2026-11-23 | `docs/design-tokens.md`; applied in UI tickets |

## Open ticket decisions settled by default (entry 10)

The plan leaves these open. Each is a recommendation by the orchestrator, adopted under entry 10 on 2026-11-23, and holds unless the owner changes it in the issue. None blocks a ticket.

| Issue | Decision | Default |
|---|---|---|
| all | Node version | 22, in CI and as `engines` in `package.json`. |
| #2 | Address | `http://127.0.0.1:8791`, changed with `--port`. Nothing is stored per origin. |
| #2 | Module files | `.mjs` files served as `text/javascript`; the worker is a module worker. |
| #2 | Chrome preflight | `node cli/flow.mjs preflight` reports the Node version and the Chrome version when a Chrome executable is found; a missing Chrome is reported, not an error. |
| #3 | Pressure solver | Preconditioned conjugate gradients with a fixed iteration order. Relative residual 1e-10, at most 4 times the cell count iterations, both logged; the implementing session records a change with its reason. |
| #5 | Channel steady criterion | Largest change of `u` over one nondimensional time interval below 1e-3 of peak speed, at most 60 time units. |
| #6 | Numerical noise floor | Ten times the largest absolute vorticity of the obstacle-free control minus its own profile at the same probes, written in the report. |
| #7 | Browser and command line tolerance | Exact equality of settings, coordinates and step counts; 1e-12 relative for diagnostics, with any wider value justified in the ticket. |
| later | Published benchmarks | Ghia and Featflow comparisons are a later milestone and no ticket here adds reference data. |
| none | Licence | MIT, added by the owner on 2026-11-23 (`LICENSE`). No ticket changes it. |
