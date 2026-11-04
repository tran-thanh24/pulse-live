# PULSE//LIVE — Agent Rules

## 1. Targeted Context Strategy
- **Never read the entire repository by default.**
- For every task:
  1. First consult `docs/PROJECT_INDEX.md` to identify the relevant subsystem.
  2. Read **only** the target files designated for that subsystem.
  3. Read only direct imports or immediate dependencies strictly needed for correctness.
- Maintain a reading budget of approximately **5–10 source files per task**. (Not a hard limit when technical correctness requires more files, but avoid reopening unrelated subsystems).
- Do not perform full repository scans unless the user explicitly commands:
  - `FULL AUDIT`
  - `ARCHITECTURE AUDIT`
  - `SECURITY AUDIT`

## 2. Search & Inspection Rules
- When looking for code, prefer:
  - Targeted symbol search
  - Filename search
  - `git status` / `git diff` for recent changes
  - Scoped `grep`
- Do **not** recursively inspect `src/` unless:
  - `docs/PROJECT_INDEX.md` is stale or missing the symbol,
  - A compilation/build error specifically requires chasing missing exports,
  - A dependency cannot otherwise be located.
- **Never inspect or read:**
  - `node_modules/`
  - `dist/` (unless diagnosing production build bundle output)
  - `.git/`
  - Binary media (`.mp3`, `.m4a`, `.wav`, `.mp4`, `.webm`, `.glb`, `.gltf` binary chunks, `.png`, `.jpg`, `.ktx2`)
  - Full `package-lock.json` (read only `package.json` unless lock resolution is required)

## 3. Implementation & Validation Flow
```
USER TASK
   ↓
docs/PROJECT_INDEX.md
   ↓
SELECT SUBSYSTEM
   ↓
READ TARGET FILES (5–10 files budget)
   ↓
READ DIRECT DEPENDENCIES ONLY
   ↓
IMPLEMENT CHANGES
   ↓
TARGETED TEST / CHECK
   ↓
BUILD IF NEEDED (npm run build)
   ↓
UPDATE docs/CURRENT_STATE.md (brief summary)
```

## 4. Documentation Maintenance
- If a task creates a new module, renames a core file, or moves subsystem boundaries, update `docs/PROJECT_INDEX.md`.
- After completing a task with notable architectural or feature changes, append a brief status update to `docs/CURRENT_STATE.md`.
- Do not insert large source code blocks or exhaustive step logs into documentation.
- Preserve existing architectural decisions recorded in `docs/DECISIONS.md`.

## 5. Navigation Pointers
- Index: `docs/PROJECT_INDEX.md`
- Status: `docs/CURRENT_STATE.md`
- Decisions: `docs/DECISIONS.md`
*(Note: Keep references as text pointers; never use markdown links that trigger full-file context inlining).*

