# Claude Experiments

This repository is used for experiments. Each experiment lives in its own subfolder at the top level.

## Working scope

- When the user says "project", they mean the current subfolder (the experiment).
- Stay within the current subfolder. Only touch files inside it, plus any files the user explicitly provides.
- Do not modify, read for context, or reference files in other subfolders unless the user explicitly tells you to.
- Files at the repository root (like this `CLAUDE.md`) are shared and should only be changed when the user asks for it.

## Git workflow

- Do not open pull requests. Commit and push directly to the working branch.
- Keep commits small and descriptive.

## Deployment

- This repository is deployed to GitHub Pages. Anything pushed to the deploy branch is publicly served, so avoid committing secrets or local-only paths.
