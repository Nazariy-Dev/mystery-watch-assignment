# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This is a take-home assignment, a React Native + TypeScript "Mystery Watch" app. The brief is in [ASSIGNMENT.md](ASSIGNMENT.md), and the supplied assets are in `assets/`. The stack is Expo with Bun as the package manager and Jest for tests. Commands are listed under Development Commands below.

## Requirements (from ASSIGNMENT.md)

- Standalone mobile app: browse mystery boxes at different prices, see each box's possible contents, buy with a virtual balance, open boxes, and manage a collection of won watches.
- The **scrollable catalogue must render boxes as real-time 3D models**. Static images or prerecorded video are not allowed. Several live 3D views in one scrolling list is the main performance risk.
- The opening flow is the centerpiece: the user inspects a real-time 3D box, then opens it through an animated reveal that fits the visual style of the rest of the app.
- All data is mocked behind an **asynchronous API simulation** (latency, and failures if useful) that the app controls.
- The same box model can be recolored per catalogue tier by changing materials. Box names, prices and contents are up to us.
- The deliverable is source code.

## Box model facts (from assets/box/MODEL.md)

The file is `assets/box/designer-box-2-v1-icy.glb`: glTF 2.0, self-contained, with no animations, lights or environment map. The renderer must supply lighting. The materials use the `KHR_materials_clearcoat` extension.

- Nodes: `Shell_Base`, `Shell_Fitted_Cushion` and `Shell_Seam` stay still. `Shell_Lid` and `Shell_Wordmark` move together. A loader may expose a node as a group of several meshes.
- Coordinates are Y-up and right-handed, and the base sits at Y=0.
- **The lid and wordmark node origins are not the hinge.** Their vertices are in model space and their transforms are identity. To open the box, rotate both around the pivot `[0, 0.914876, 0.359181]` about the +X axis, from 0° (closed) to +115° (fully open). Alternatively, reparent them under a hinge group placed at the pivot and offset the children by `-pivot`, so the closed pose stays the same.
- Bounds for framing the camera: closed X ±0.56, Y 0…1.1166, Z ±0.3799. Open X ±0.56, Y 0…1.8654, Z −0.6345…0.8543.
- Material names: `ShellRole_Body_Matte` (body and lid, the likely target for per-tier recoloring), `ShellRole_Cavity_Bed`, `ShellRole_Cavity_Inner`, `ShellRole_SeamAccent_Accent`, `ShellRole_Cavity_Lining`, `ShellRole_Body_Wordmark` (textured with alpha).
- The watch images in `assets/watches/` (casio, gmt, perpetual, sky-dweller) are 2D transparent PNGs, 1019×1544. They are not 3D, so the reveal has to present them as 2D images (for example on a plane or as an overlay).

## Submission requirement

A short `AI_USAGE.md` must be at the repo root. It should quote a brief excerpt from the first prompt given to the AI agent, plus one follow-up where the user made a decision, corrected the output, or asked for verification.

## Rules for Agent
### Rule 1 — Think Before Coding
State assumptions explicitly. Ask rather than guess.
Push back when a simpler approach exists. Stop when confused.

### Rule 2 — Simplicity First
Minimum code that solves the problem. Nothing speculative.
No abstractions for single-use code.

### Rule 3 — Surgical Changes
Touch only what you must. Don't improve adjacent code.
Match existing style. Don't refactor what isn't broken.

### Rule 4 — Goal-Driven Execution
Define success criteria. Loop until verified.
Strong success criteria let Claude loop independently.

### Rule 5 — Surface conflicts, don't average them
If two patterns contradict, pick one (more recent / more tested).
Explain why. Flag the other for cleanup.
Don't blend conflicting patterns.

### Rule 6 — Read before you write
Before adding code, read exports, immediate callers, shared utilities.
If unsure why existing code is structured a certain way, ask.

### Rule 7 — Tests verify intent, not just behavior
Tests must encode WHY behavior matters, not just WHAT it does.
A test that can't fail when business logic changes is wrong.

### Rule 8 — Checkpoint after every significant step
Summarize what was done, what's verified, what's left.
Don't continue from a state you can't describe back.
If you lose track, stop and restate.

### Rule 9 — Match the codebase's conventions, even if you disagree
Conformance > taste inside the codebase.
If you think a convention is harmful, surface it. Don't fork it silently.

### Rule 10 — Fail loud
"Completed" is wrong if anything was skipped silently.
"Tests pass" is wrong if any were skipped.
Default to surfacing uncertainty, not hiding it.

### Rule 11 — Verify after every change
Before claiming work is done, run both:
```bash
bunx tsc --noEmit
bunx expo lint
```
Any tsc error blocks the claim — fix it.
If lint reports issues, run `bunx expo lint --fix` to auto-fix. Whatever
remains on lines you touched (including warnings) must be fixed manually
before claiming done. Pre-existing warnings on lines you did not change
are out of scope per Rule 3 — note them, don't fix them.

### Rule 12 — Conventional commits
Commit subjects follow Conventional Commits: `<type>(optional scope): <summary>`,
e.g. `feat(catalogue): render boxes as 3D models`, `fix: correct lid hinge pivot`.
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
Summary is lowercase, imperative, no trailing period.

## Code Style Rules

Comments are sparse, one-liner by default, and explain *why* — never *what*.
Well-named identifiers carry the *what*. Reach for prose only when the
reason is non-obvious from the code itself.

### Rules

1. **JSDoc on functions, classes, and non-obvious type members.** One-line
   summary covering what goes in and what comes out. Also use JSDoc on
   exported interface fields, optional options, and callbacks where the
   *when* / *contract* isn't obvious from the type — document when a
   callback fires, what invariant a flag protects, or what a default
   covers. Skip JSDoc on trivial getters, one-line wrappers, and fields
   whose name already says it. Add `@param` / `@returns` only when the
   type alone is ambiguous. Multi-paragraph JSDoc is reserved for genuine
   semantic subtlety (intentional trade-off, race condition, divergence
   from a sibling).

2. **Inline comments are one-liners, placed at non-obvious points.**
   Default to a single line. Use 2–6 lines only when there is a real
   trade-off, an invariant the reader could violate, a TODO with context,
   or a subtle external-API quirk. If a comment merely paraphrases the
   next line, delete it.

3. **No history references.** Do not write "previously", "pre-refactor",
   "PR N", "absorbed verbatim", "legacy design". Comments describe the
   code as it is. Refactor history belongs in `git log`.

4. **No `Step 1 / Step 2 / …` walkthroughs.** If the code is so opaque
   it needs numbered steps, the code is the problem — restructure or
   rename rather than narrate.

5. **Section dividers (`// ── Name ──`) are fine** as visual chunking
   inside long files. They are anchors, not narration — keep them
   short.

6. **File-top headers are optional and short.** A one-line module
   summary if the filename doesn't already say it. Skip the
   "what imports it / what it imports" prose — the imports section says
   that.


## Component Structure Rules

1. **One component per file.** A sub-component in a page's file gets its own file in the
   slice's `ui/` segment (e.g. `pages/box-details/ui/Odds.tsx`). Each file keeps its own
   `StyleSheet.create` with only the styles it uses. Copy a tiny shared style instead of
   creating a shared one.

2. **The page file only composes.** It keeps data queries, the loading, error and empty
   states, and the layout that wires the pieces together.

3. **Big or complex logic goes into a hook.** State machines, mutations with their
   error handling, sound or haptic sequencing, and per-frame animation logic go into a
   `useX` hook instead of the component body. Put it in the slice's `model/` (state and
   flow, e.g. `model/opening-flow.ts` → `useOpeningFlow`) or `lib/` (helpers, e.g.
   `lib/inspect-drag.ts` → `useInspectDrag`). The file is named after the domain, in
   kebab-case. The component keeps only rendering and derived display values.

4. **Constants shared across files go in `config/`.** For example, `entities/box/config/stage.ts`.
   Constants used by one file stay at the top of that file.

5. **Don't split what is already small.** A single component with no inner
   sub-components and no complex logic stays in one file. Don't extract one-use
   pieces just to make files smaller.

6. **Splitting is a move, not a rewrite.** Keep behaviour, names and comments unchanged.
   Verify on device that the screen renders and behaves as before.

## Development Commands

### Package Management
```bash
bun install                 # Install dependencies
```

### Development Server
```bash
bun start                   # Start Expo development server
bunx expo start            # Alternative start command
bun run ios                # Run on iOS simulator
bun run android            # Run on Android emulator  
bun run web                # Run on web
```

### Code Quality
```bash
bunx expo lint             # Lint via ESLint (the canonical post-edit check — see Rule 11)
bunx expo lint --fix       # Auto-fix lint issues
bun run test               # Run Jest tests
bun run test:watch         # Run tests in watch mode
bun run test:coverage      # Run tests with coverage
```

### TypeScript
```bash
bunx tsc --noEmit          # Type check (the canonical post-edit check — see Rule 11)
