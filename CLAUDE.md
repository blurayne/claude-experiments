# Claude Experiments

This repository is used for experiments. Each experiment lives in its own subfolder at the top level.

## Working scope

- When the user says "project", they mean the current subfolder (the experiment).
- Stay within the current subfolder. Only touch files inside it, plus any files the user explicitly provides.
- Do not modify, read for context, or reference files in other subfolders unless the user explicitly tells you to.
- Files at the repository root (like this `CLAUDE.md`) are shared and should only be changed when the user asks for it.

## Git workflow

- The default branch is `main` and always will be. Commit and push directly to `main`.
- Do not open pull requests.
- Keep commits small and descriptive.

## Naming experiments

- If the user starts a new experiment without giving a subfolder name, ask what to call it.
- If no name is given, fall back to a short `lower_snake_case` name that describes the experiment.

## Deployment

- This repository is deployed to GitHub Pages. Anything pushed to the deploy branch is publicly served, so avoid committing secrets or local-only paths.
