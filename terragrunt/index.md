# Terragrunt vs Terraform — Lightning Talk

A 10-minute slide deck on **Terragrunt**: which concepts it adds on top of
Terraform/OpenTofu to fix Terraform's scaling problems (units vs modules,
DRY backend/provider config, the `dependency` DAG, `run --all`
orchestration, stacks), what **Terragrunt 1.0** (2026 — finally "done" after
~10 years and 900+ `v0.x` releases) brought, and a quick comparison with
**Atmos**.

Target audience: DevOps professionals, SREs, cloud architects, IaC / pipeline
experts — no "what is IaC" intro.

> The published page at `/terragrunt/` is this document. Open the slides below.

## Slides

- [`slides.html`](slides.html) — reveal.js deck, runs in any modern browser.
  - <kbd>space</kbd> / <kbd>→</kbd> next slide
  - <kbd>s</kbd> speaker notes
  - <kbd>f</kbd> fullscreen
  - <kbd>?</kbd> all shortcuts

## What's in the talk (≈ 10 min, 16 slides)

1. Title.
2. **Where vanilla Terraform hurts** — the Terralith, the non-parameterizable
   `backend` block, duplicated provider config, no orchestrator across
   states, copy-paste promotion between environments.
3. **"But Terraform has workspaces…"** — what workspaces wanted to solve
   (cheap parallel states for *one* config: feature branches, ephemeral
   envs) and why they don't isolate environments (same backend, same
   credentials, same code version, invisible CLI state); where
   `-var-file` + `-backend-config` *was* the right call (envs differ only
   in values, one account, small estate) — and that a unit is that pattern
   made first-class.
4. **Wrappers all the way down** — Terraform is itself an orchestrator of
   single-binary provider plugins (go-plugin/gRPC); Terragrunt applies the
   same trick one level up and wraps the `tofu`/`terraform` binary.
5. **Under the hood** — what one `terragrunt apply` actually does: parse &
   merge the `include` tree, resolve `dependency` blocks via
   `tofu output -json` (or mocks), fetch the module source with go-getter
   into `.terragrunt-cache/`, generate `backend.tf`/`provider.tf`, turn
   `inputs` into `TF_VAR_*` env vars, auto-`init`, run hooks and exec the
   real binary as a subprocess (with retries). `run --all` = the same per
   unit, scheduled over the DAG. No daemon, no own state, no lock-in.
6. **Units vs modules** — module = reusable blueprint; unit = a deployed
   instance of a module with its own state and small blast radius.
7. A unit in ~15 lines of `terragrunt.hcl` — module ref pinned per
   environment, promotion = bump one `ref`.
8. **DRY backend & provider** — `remote_state` + `generate` in a single
   `root.hcl`; the directory path becomes the state key.
9. **`dependency` blocks** — outputs of one state wired into another,
   `mock_outputs` for planning not-yet-existing environments, all edges
   forming a DAG.
10. **`run --all`** — the missing orchestrator: DAG-ordered plans/applies,
    reverse-order destroys, `--filter` (paths / git-changed).
11. The problem Terragrunt created: hundreds of near-identical
    `terragrunt.hcl` files (`_envcommon/` hacks).
12. **Stacks** — `terragrunt.stack.hcl` with `unit`/`stack` blocks +
    `terragrunt stack generate`; one versioned file per environment.
13. **Terragrunt 1.0** (2026-03-30) — stacks GA, backwards-compatibility
    guarantee (real semver), CLI redesign (`run-all` → `run --all`, new
    `exec`/`find`/`list`/`backend` commands, 7 targeting flags → one
    `--filter`), OpenTofu preferred.
14. **Secrets & backend init, compared** — Terraform: `TF_VAR_*`,
    Vault/SSM data sources, `sensitive` (masks logs, doesn't encrypt),
    ephemeral values; Terragrunt: `sops_decrypt_file()` (encrypted secrets
    in git next to the unit), per-unit `iam_role`; both leak into state in
    plaintext. Backend: static `backend` block + pre-existing bucket
    (chicken & egg) vs generated `remote_state` + auto-init +
    `terragrunt backend bootstrap`/`migrate`.
15. **Terragrunt vs Atmos** — HCL + filesystem hierarchy vs YAML stack
    manifests + deep-merge imports; thin wrapper vs full framework; rule of
    thumb for choosing.
16. tl;dr.

## Sources

- [Terragrunt docs](https://terragrunt.gruntwork.io/) — units, stacks, CLI reference.
- [Gruntwork: Terragrunt 1.0 released!](https://www.gruntwork.io/blog/terragrunt-1-0-released)
- [Gruntwork: The road to Terragrunt 1.0](https://www.gruntwork.io/blog/the-road-to-terragrunt-1-0) (stacks, CLI redesign, release schedule)
- [Atmos docs](https://atmos.tools/) — components, stacks, [Terragrunt migration notes](https://atmos.tools/migration/terragrunt).
- [Gruntwork: A comprehensive guide to managing secrets in your Terraform code](https://www.gruntwork.io/blog/a-comprehensive-guide-to-managing-secrets-in-your-terraform-code)
- [Terragrunt: State backend & `backend bootstrap`](https://terragrunt.gruntwork.io/docs/features/state-backend)
- [Terraform docs: Workspaces](https://developer.hashicorp.com/terraform/language/state/workspaces) — including the caveat that they're not meant for strong environment isolation.
