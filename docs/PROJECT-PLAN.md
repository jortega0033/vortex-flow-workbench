# Vortex Flow Workbench

## Product requirements

Vortex Flow Workbench is a local browser lab for exploring two-dimensional incompressible flow. A learner selects a case, runs it one step at a time or in short batches, and compares the velocity field and vorticity with a reference. It targets a CPU-only Linux desktop with Chrome and an installed Node.js runtime. All presets and fixtures are generated from the documented equations and run offline.

| User need | First release behavior | Evidence |
| --- | --- | --- |
| Understand how walls move fluid | Run a lid-driven cavity, sample its horizontal and vertical centerlines, and inspect circulation. | A no-motion case stays at rest. A moving lid produces repeatable, nonzero circulation and centerline samples. |
| Check the solver against a known answer | Drive periodic plane channel flow with a uniform acceleration, then overlay the analytical velocity profile. | A run from rest is compared with the closed-form profile at face coordinates. The plot shows an error value and the selected grid. |
| Explore flow behind a solid body | Switch to a cylinder in an open channel. See the obstacle, the downstream wake, the elapsed physical time, and inlet and outlet fluxes. | The cylinder blocks through-flow, stable steps produce a nontrivial signed vorticity field, and two near-wake probes differ from an obstacle-free control. |
| Inspect a reproducible run | Pause, single-step, reset, scrub a bounded sequence of captured frames, and save diagnostic CSV. | A clean reload with the same case settings and step count recreates the same diagnostic values. The user can inspect static frames without fast animation. |
| Know when the result is usable | Show pressure convergence, maximum divergence, the time-step limit and any rejected step. | A failed projection leaves the previous state and physical time intact, with an actionable error in the browser. |

The first working slice opens a real locally served page, selects a small cavity, and advances from step zero to step ten using the same solver as the command-line verifier. The full first release adds the analytical channel and cylinder. It aims to show the formation and location of the cylinder wake. A sustained shedding solution and quantitative agreement with published drag and Strouhal results require a later validation milestone.

Out of scope for the first release are compressible flow, turbulence closures, three-dimensional geometry, imported meshes, free-surface motion, GPU acceleration, and engineering certification. The application explains why each fixture is useful and displays the current discretization beside its results.

## Technical design

### Runtime and boundaries

Use dependency-free modern JavaScript modules, a small Node standard-library server bound to `127.0.0.1`, a Chrome Web Worker and Canvas 2D. Import the same solver modules from the browser worker and the deterministic CLI. Use doubles in the solver and compact single-precision render buffers. Preflight the installed Node and browser before development. Run future unit and integration checks through `node --test` and invoke the documented CLI examples in a clean checkout. No CDN, external API, GPU or package install belongs in the baseline.

Keep case definitions, face-grid operators, pressure projection, time stepping and diagnostics distinct from transport and rendering. A case is a validated object containing a preset ID, rectangular domain dimensions, cell counts, viscosity or a derived Reynolds number, velocity reference, boundary parameters, requested step duration and a step cap. Presets fix initial conditions, geometry, probes and wall handling. Keep their first version small and immutable. Accept only known control names and finite numeric values in documented ranges. The interactive cap is 24,000 cells and 10,000 steps per run. The CLI may opt into a greater step cap and should emit periodic progress.

The worker owns numerical arrays. Start, advance, pause, reset and capture messages carry a run generation and sequence number. Permit one outstanding advance, process a bounded batch, and yield between batches. Pause takes effect after the in-flight work completes. Ignore older-generation responses after reset. A frame includes the grid, step, physical time, case and scenario version, vorticity, sampled centerlines, pressure iteration count, normalized divergence and balance. Transfer only display buffers. Keep at most 40 captures. Document the sampling cadence and let the user capture another frame when paused.

### Numerical method

- Store pressure correction at fluid cell centers, horizontal velocity at vertical faces and vertical velocity at horizontal faces. Fix axis direction and strides in tests. Define divergence as signed face flux per cell volume. Use matching discrete gradient and divergence operators for the pressure equation and correction, including at boundaries and masked cells. A unit face flow between two cells contributes equal and opposite net volume fluxes.
- Advance momentum with explicit viscosity and conservative upwind transport. Begin with first-order face fluxes for the reference cases. For the cylinder, use a bounded slope-limited reconstruction on complete interior stencils and fall back to first order adjacent to walls. Document the limiter and boundary fallback. Keep initial conditions and iteration ordering fixed for reproducible fixture runs.
- Choose the trial step using the requested cap and a conservative combined convective and diffusive bound. Use `dt × (max|u|/dx + max|v|/dy + 2ν(1/dx² + 1/dy²)) ≤ 0.45` as the initial policy. Clamp the last step to the requested physical stop time. If a candidate violates its diagnostic or finite-value guards, discard it and surface the error. The previous published step and render frame remain available.
- Form provisional face velocities `u*` with tangential wall ghosts and prescribed normal fluxes. Solve `D G φ = D u* / dt` and correct with `u = u* − dt G φ`. Use minimum memory scratch buffers and a deterministic symmetric positive definite solve of `−D G`, with a diagonal preconditioner and bounded iteration count. For a pure Neumann case, preserve the compatible right-hand-side subspace and remove the mean from the correction. Validate the compatibility error from the configured boundary fluxes before removing roundoff. Account for the half-cell distance between the last pressure center and the open outflow face. Evaluate divergence on the accepted corrected field after all prescribed boundary normals have been applied. Solve tolerance, accepted divergence target and maximum iterations are logged.
- Compute vorticity `∂v/∂x − ∂u/∂y` using a documented staggered stencil. Label the color scale and use a fixed range when comparing snapshots. The renderer may interpolate samples for a plot, but the exported sample data retains coordinates and case settings. Include a text diagnostic and a keyboard-accessible single-step control.

### Cases and boundaries

| Case | Domain and boundary | Profile or fixture |
| --- | --- | --- |
| Lid-driven cavity | Unit square. No through-flow at every wall. Moving top wall at `u=1` on its open edge span, with a documented corner convention. Use reflected tangential ghosts to impose wall speed. Pressure correction has homogeneous normal derivative. | Resting lid fixture uses exactly zero velocity. Moving lid at `Re=100` uses `ν=0.01` and compares both centerline components against a finer simulation. |
| Driven plane channel | `4 × 1`, periodic in x, no-slip walls at `y=0,1`. No pressure jump across the periodic seam. Drive fluid with a constant x acceleration. | With `ν=0.05` and `g=0.4`, the analytical profile is `u(y)=4y(1−y)` and `v=0`. Peak is `1` and cross-section mean is `2/3`. Analytical values at `y=0.25,0.50,0.75` are `0.75,1,0.75`. Evaluate numerical accuracy at actual face coordinates. |
| Cylinder in a channel | `6 × 1` channel, circle diameter `0.25` and center `(1.25,0.48)`. Choose fluid cells from a fixed cell-center mask. At the left, prescribe symmetric parabolic normal inflow with mean speed one and use the discrete inlet flux as its reference. No-slip upper/lower walls and zero normal flow at every cylinder face. Use no-slip reflected tangential ghosts on the resolved obstacle surface and a documented first-order corner fallback. | Re=100 based on mean inflow and diameter. At the right, use an extrapolated velocity predictor and zero pressure correction at the outlet plane. Retain the corrected normal outlet velocities. Start with a reproducible ramp. Log inlet, outlet and obstacle flux, near-wake vorticity and reverse flow flags. |

For the cylinder, do not represent mask edges as a curved resolved surface in diagnostics. On every face between fluid and solid, set the prescribed normal flow to zero and omit pressure connections through solid cells. Check the configured mask preserves one physically connected fluid region and leaves adequate inlet and outlet width. Measure the obstacle penetration sum and the inlet/outlet imbalance directly, so cancellation in signed divergence cannot hide nonphysical through-flow.

### Verification fixtures

1. **Projection by hand.** Take two connected unit cells, closed exterior faces, one internal face velocity `+1` in the positive x direction, and `dt=0.1`. Provisional divergence is `(+1,−1)`. The zero-mean pressure correction is `(−5,+5)` and the corrected shared face velocity is zero. Verify the residual against an independently assembled two-by-two matrix. A disconnected mask fixture should be rejected with a geometry error.
2. **Fully developed channel.** Start from rest on `32 × 8` and `128 × 32` grids, always representing the same physical domain. Advance until the profile change over one nondimensional time interval is below `10⁻³` in units of peak speed. Compare volume and y-profile velocity with the formula above. On the finer grid, the peak-normalized maximum profile error must be below 2%, the mean flow error below 2%, and the transverse velocity below `10⁻⁶`. Pin a maximum physical run time and publish the recorded stop reason.
3. **Cavity and wake.** Step the zero-lid cavity for 50 steps and assert the field stays at zero. Move a Re=100 lid on a small and a refined grid, promoting the finer grid as a reference comparison and recording the centerline inputs. The cylinder preset must make it through its documented warm-up without a rejected stable step. Compare exact obstacle face flux and the inlet/outlet balance at every accepted step. After warm-up, require two opposite signs anywhere between one and three diameters downstream and above a documented numerical noise floor, with a separate baseline subtraction against the same channel without an obstacle. Report the values and coordinates from both control and cylinder. Report a shedding frequency only if a signed probe provides repeated clean zero crossings and a repeatable period across two post-transient windows.

The documented default acceptance for each accepted step is maximum nondimensional divergence at or below `10⁻⁶`, normalized by `Uref/H`, and global inlet/outlet imbalance at or below `10⁻⁵` of reference inlet flux for the open-channel case. Match the threshold normalization in CLI and browser reports. In closed cases use a finite nonzero fixture reference for resting fluid. Test cap exhaustion and a perturbed face sign with negative fixtures. Inspect a real Chrome frame and a CSV opened on the offline desktop. Record browser and Node versions, CPU, expected and observed timings, and fixtures and accepted-step counts for comparison. A stable display frame alone is not proof of numerical accuracy.

### Later benchmark milestone

Use Ghia, Ghia and Shin for steady cavity centerline profiles. In a later milestone, track centerline error at `Re = 100, 400, 1000` with controlled grid and time refinement, target a maximum absolute profile difference of 0.02 in lid-speed units, and include near-zero velocities without dividing by the reference at a zero crossing. Record the exact source points, interpolation method and steady criterion. Use independently obtained, appropriately shareable reference values and cite the paper. [Ghia, Ghia and Shin, original paper](https://doi.org/10.1016/0021-9991(82)90058-4)

Reproduce the distinct Featflow DFG 2D-2 geometry, boundary conditions and units in a later benchmark preset. Determine force and Strouhal using its definitions and a time window after transients, rerun on a finer grid and smaller time step, and compare measured ranges with the benchmark. A staircase mask, a short unsteady clip or an altered inflow may be useful for learning and does not reproduce that benchmark. [Featflow DFG 2D-2 benchmark](https://wwwold.mathematik.tu-dortmund.de/~featflow/en/benchmarks/cfdbenchmarking/flow/dfg_benchmark2_re100.html)

## Epic · Demonstrate cavity, channel and cylinder flows offline

Release a CPU-only lab that runs a real solver, exposes its diagnostics, and presents an analytical comparison and independently checked projection. A reviewer can reproduce the cases in Chrome, observe a signed wake, and inspect failures and captured data. Estimated implementation and verification effort is **24–38 engineering hours**. Land VF-01 first. VF-02 and VF-03 can then run in parallel using the same command and frame contracts. VF-04 builds on VF-02. VF-05 extends that solver and the established channel boundary tests. VF-06 integrates and verifies the complete workflow.

### VF-01 · Freeze the local run and grid contracts

**Estimate.** 4–6 engineering hours. **Dependencies.** None.

Document the CLI entry point, cases, uniform staggered grid indexing, shared diagnostics and browser frame contract. Build the minimal static server and offline fixture harness that subsequent tickets can use independently.

- Preflight Node.js and Chrome, serve loopback only, and open a page without any external requests.
- Verify exactly one internal face connects the two unit cells in the hand-checkable fixture. Candidate boundary normals and signed divergence must read `(+1,−1)`; prescribed exterior flux remains zero.
- Reject oversize grids and malformed presets before allocating state. A tiny recorded frame can render in the browser independent of solver readiness.

### VF-02 · Project accepted flow steps and report failures

**Estimate.** 4–6 engineering hours. **Dependencies.** VF-01.

Implement provisional momentum, bounded time-step selection, pressure correction and atomic acceptance. Start with prescribed normal velocities and pure Neumann pressure correction. Keep operator code reusable when a later case introduces an outlet.

- For the two-cell fixture, recover the expected pressure pair and corrected face velocity within `10⁻¹⁰`, then compare residual and divergence to the independent matrix calculation.
- Preserve exactly zero velocity in the closed zero-lid fixture. In a variant with incompatible prescribed boundary flux, explain the compatibility error.
- Simulate iteration cap exhaustion and a nonfinite predictor. The published field, elapsed physical time and accepted step index stay unchanged.

### VF-03 · Add offline browser controls and inspectable frames

**Estimate.** 4–7 engineering hours. **Dependencies.** VF-01. May run beside VF-02.

Build the accessible case controls, worker transport, Canvas field, vorticity legend, static frame capture and diagnostic export. Use a deterministic fixture worker until the shared solver is available.

- Complete case selection, start, pause, single step, frame capture and reset with only a keyboard. Keep numerical diagnostics readable while a run is active.
- Send a reset with a previous advance in flight, then deliver its stale result. The display stays on the new run. Inspect a 40-frame cap test.
- Export one CSV including case parameters, step, time, accepted divergence, flux and solver status. Compare one static frame probe to its source buffer and coordinate.

### VF-04 · Verify the periodic channel and moving cavity

**Estimate.** 4–6 engineering hours. **Dependencies.** VF-02.

Add driven periodic channel and cavity boundary handling, analytical overlay coordinates, signed vorticity and centerline diagnostics.

- Run the closed rest and moving-lid fixtures. Persist distinct fixed-coordinate horizontal and vertical centerline measurements and refinement inputs.
- Start channel flow at rest. Verify continuity across its periodic seam and thresholds on the finer grid. Show the analytic and numerical profile at matching face coordinates and report the actual finish reason.
- Keep test arithmetic independent of solver routines, including evaluating the exact channel formula for arbitrary sample coordinates.

### VF-05 · Demonstrate wake formation around a masked cylinder

**Estimate.** 5–8 engineering hours. **Dependencies.** VF-02 and VF-04.

Add the fixed solid mask, outlet pressure correction, bounded interior transport, two wake probes and obstacle-specific diagnostics. Use the specified domain, scale and ramp. Create an obstacle-free control with the same inlet and outlet.

- Verify that mask-adjacent normal flux is zero on each face and an invalid disconnected case is rejected. Show that the pressure projection maintains the documented divergence and flux-balance limits through the cylinder warm-up.
- Compare signed wake probes with the obstacle-free control and save actual snapshots and parameters for a repeat run. Make the measured wake signals and their location interpretable without animation.
- Exercise an outlet reverse-flow flag and a failed projection in a disposable test. Surface the failure without publishing a divergent frame. Mark shedding frequency unavailable unless it passes the defined measurement criterion.

### VF-06 · Prove repeatable cases from a clean checkout

**Estimate.** 3–5 engineering hours. **Dependencies.** VF-03, VF-04 and VF-05.

Wire the real solver into the browser and the CLI, document offline launch and verification, and package original CSV and fixture definitions with expected outcomes.

- Use a fresh Chrome profile with network access disabled except loopback. Open all three presets, compare the channel curves, capture a signed cylinder frame, pause, scrub and save CSV.
- Repeat from the same settings and accepted step counts in the CLI. Compare exact settings, coordinates and solver diagnostics with the browser within declared floating-point tolerance.
- Record actual environment, run parameters, wall times, convergence, failure coverage and observed comparison results. Document the coarse cylinder mask and the separate later published-benchmark milestone.
