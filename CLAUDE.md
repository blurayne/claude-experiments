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

- This repository is deployed to GitHub Pages by the workflow at `.github/workflows/pages.yml`, which renders Markdown to HTML and publishes `_site/`. Anything pushed to the deploy branch is publicly served, so avoid committing secrets or local-only paths.
- The Pages source must be set to "GitHub Actions" in the repository settings (not "Deploy from a branch").

## Repository layout

- The top-level `README.md` gives an overview of what each subfolder (experiment) contains and links to that subfolder. It is also rendered as the site root (`/index.html`).
- Every subfolder must contain an `index.md` describing the experiment and linking to its files. **Always keep `index.md` up to date** when you add, rename, or remove files in the subfolder.
- The build workflow renders each `index.md` to `index.html` and copies the rest of the subfolder's files alongside it, so relative links to other files keep working.

## Reporting deployment status

- After pushing changes that trigger the Pages workflow, if you have GitHub API access (e.g. a token or the GitHub MCP), report back to the user:
  - the status of the most recent `pages.yml` workflow run on the pushed branch, and
  - the deployed site URL (the `page_url` output of `actions/deploy-pages`, or the repository's Pages URL once the run succeeds).
- If no GitHub access is available, say so briefly instead of guessing a URL.
