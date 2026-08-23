# Changelog — microbes-overview

All notable changes to the atlas. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
loosely and the versions are [semantic](https://semver.org/), read as:

| part | means | who bumps it |
|---|---|---|
| **MAJOR** | a statement about the atlas as a whole | a human, deliberately |
| **MINOR** | **new microbes went live** | a human, by tagging |
| **PATCH** | everything else — fixes, copy, tooling, layout | **automatic, one per commit** |

**1.0.0** is the commit where every catalogued subject was finally rendered and
live: *"Chlamydia felis completes the set — 112 of 112, 18 sets"*.

The version is **not stored in a file**. `microbe_version.py` derives it from git —
MAJOR.MINOR from the newest `microbes-overview/vX.Y.Z` tag reachable from HEAD, and
PATCH from the number of commits touching `microbes-overview/` since that tag. So the
patch level advances on every commit with no bookkeeping, and the number can never
drift from what was actually shipped. The viewer prints it under the hero blurb
together with the commit sha and the build time.

> **Everything below `1.1.0` was reconstructed after the fact**, on 2026-08-23, by
> walking the 94 commits that touched this folder and counting the live subjects
> (`*.render.meta.json`) at each one. A minor release marks a commit where that
> count rose. The tags were created retroactively to match, so
> `git show microbes-overview/v0.17.0` really is "the ribosome — 100 subjects live".
> From here on this file is maintained by hand, as changes land.

---

## [1.1.0] — 2026-08-21

**113 subjects live** · 116 catalogued · [`b26c6dde`](https://github.com/blurayne/claude-experiments/commit/b26c6dde2d16a36f4d04e4a765e11f6980e6b519)

- **+** `1.1.0` — Update ([`b26c6dde`](https://github.com/blurayne/claude-experiments/commit/b26c6dde2d16a36f4d04e4a765e11f6980e6b519))

## [1.0.0] — 2026-08-21

**112 subjects live** · 112 catalogued · [`df565d97`](https://github.com/blurayne/claude-experiments/commit/df565d9777c1b2ab8122fa5c9d7ec156833929c0)

- **+** `1.0.0` — Chlamydia felis completes the set — 112 of 112, 18 sets ([`df565d97`](https://github.com/blurayne/claude-experiments/commit/df565d9777c1b2ab8122fa5c9d7ec156833929c0))
-   · `1.0.1` — Top bar, thickness floor, and label overlap from TODO.md ([`018c1b09`](https://github.com/blurayne/claude-experiments/commit/018c1b099edc65b409064dbe037e0d423775146d))
-   · `1.0.2` — Giardia had the wrong number of flagella, and its verdict said otherwise ([`302c99de`](https://github.com/blurayne/claude-experiments/commit/302c99def4d518a1568f56e459408bf333019424))

## [0.26.0] — 2026-08-21

**111 subjects live** · 112 catalogued · [`ac8094fa`](https://github.com/blurayne/claude-experiments/commit/ac8094faf487b0f5fded87ec33705ed89ae805cb)

- **+** `0.26.0` — FeLV lands, 111 live — one left ([`ac8094fa`](https://github.com/blurayne/claude-experiments/commit/ac8094faf487b0f5fded87ec33705ed89ae805cb))

## [0.25.0] — 2026-08-21

**110 subjects live** · 112 catalogued · [`6d3b64c0`](https://github.com/blurayne/claude-experiments/commit/6d3b64c0327bea833df47d67c4d38636af71cd8b)

- **+** `0.25.0` — FIV and rabies land, 110 live ([`6d3b64c0`](https://github.com/blurayne/claude-experiments/commit/6d3b64c0327bea833df47d67c4d38636af71cd8b))
-   · `0.25.1` — Microscope art in the hero, full-width subtitle ([`9249fbb2`](https://github.com/blurayne/claude-experiments/commit/9249fbb2b3a6112ba36ed19545ce0fdb943d0b92))

## [0.24.0] — 2026-08-21

**108 subjects live** · 112 catalogued · [`750d2134`](https://github.com/blurayne/claude-experiments/commit/750d2134608f12c6075a5f740cb43c74c6d6e031)

- **+** `0.24.0` — The heartworm opens the pet-pathogen set, 108 live ([`750d2134`](https://github.com/blurayne/claude-experiments/commit/750d2134608f12c6075a5f740cb43c74c6d6e031))
-   · `0.24.1` — Record the heartworm's compromises in PLAN.md ([`9bd92032`](https://github.com/blurayne/claude-experiments/commit/9bd92032d8fc1b9b5aad35043717d759cea5ffe1))
-   · `0.24.2` — Varicella-zoster gets its reference at native resolution ([`1fa26d9a`](https://github.com/blurayne/claude-experiments/commit/1fa26d9a3fa6ee391e254de0cc5975cbd600789d))

## [0.23.0] — 2026-08-21

**107 subjects live** · 107 catalogued · [`d303355f`](https://github.com/blurayne/claude-experiments/commit/d303355f58569632bea1dcbb7e512a16e28608cf)

- **+** `0.23.0` — The chromosome — 107 of 107, the atlas is complete ([`d303355f`](https://github.com/blurayne/claude-experiments/commit/d303355f58569632bea1dcbb7e512a16e28608cf))
-   · `0.23.1` — Refresh index.md, write the render lessons into the skill ([`a7f52452`](https://github.com/blurayne/claude-experiments/commit/a7f5245235e893072cd033ff9797eeb41980b1c6))
-   · `0.23.2` — Microbe-render: write the whole run's findings into the skill ([`19095258`](https://github.com/blurayne/claude-experiments/commit/190952582e486fc57e755513485b158751f67307))
-   · `0.23.3` — Audience-aware names, an app icon, and zoom in the lightbox ([`d86cd041`](https://github.com/blurayne/claude-experiments/commit/d86cd04192788c43de7b15e2f31d0f3c8e4c7c46))
-   · `0.23.4` — Free the last NC image, fix the reticulocyte source, add PLAN.md ([`1c220808`](https://github.com/blurayne/claude-experiments/commit/1c2208089d851c3189340e685cb3900f3f2622bc))
-   · `0.23.5` — A cat-and-dog pathogen set, and clickable cross-references ([`17308a85`](https://github.com/blurayne/claude-experiments/commit/17308a85abb0a8539622284762ca683ae407a971))
-   · `0.23.6` — Pet-pathogen groundwork, blocked on the Gemini spend cap ([`e4724b03`](https://github.com/blurayne/claude-experiments/commit/e4724b03d40d330f469797e1c07cb9645be131ba))

## [0.22.0] — 2026-08-20

**106 subjects live** · 107 catalogued · [`533c85d4`](https://github.com/blurayne/claude-experiments/commit/533c85d44b63669f5aa4d03793eae19ca611d5e5)

- **+** `0.22.0` — DNA and RNA open the genetics set, 106 live ([`533c85d4`](https://github.com/blurayne/claude-experiments/commit/533c85d44b63669f5aa4d03793eae19ca611d5e5))

## [0.21.0] — 2026-08-20

**104 subjects live** · 107 catalogued · [`deb53e9c`](https://github.com/blurayne/claude-experiments/commit/deb53e9ce0c03441cd3a492851ba1e540bae8dc3)

- **+** `0.21.0` — The cytoskeleton completes the organelle set ([`deb53e9c`](https://github.com/blurayne/claude-experiments/commit/deb53e9ce0c03441cd3a492851ba1e540bae8dc3))

## [0.20.0] — 2026-08-20

**103 subjects live** · 107 catalogued · [`6fb826a9`](https://github.com/blurayne/claude-experiments/commit/6fb826a9551d009bb4cd6e2e26203a0f7f0e2736)

- **+** `0.20.0` — The plasma membrane, 103 live ([`6fb826a9`](https://github.com/blurayne/claude-experiments/commit/6fb826a9551d009bb4cd6e2e26203a0f7f0e2736))

## [0.19.0] — 2026-08-20

**102 subjects live** · 107 catalogued · [`07492e85`](https://github.com/blurayne/claude-experiments/commit/07492e85b31e8028f092b30663761efb3678ab7d)

- **+** `0.19.0` — The lysosome, 102 live ([`07492e85`](https://github.com/blurayne/claude-experiments/commit/07492e85b31e8028f092b30663761efb3678ab7d))

## [0.18.0] — 2026-08-20

**101 subjects live** · 107 catalogued · [`d7000b8f`](https://github.com/blurayne/claude-experiments/commit/d7000b8fc0c809812fe45d20b6eae8f4c5ade64d)

- **+** `0.18.0` — The endoplasmic reticulum, 101 live ([`d7000b8f`](https://github.com/blurayne/claude-experiments/commit/d7000b8fc0c809812fe45d20b6eae8f4c5ade64d))

## [0.17.0] — 2026-08-20

**100 subjects live** · 107 catalogued · [`4afde630`](https://github.com/blurayne/claude-experiments/commit/4afde63027d2ff9f501205c9f18993dd0da114b8)

- **+** `0.17.0` — The ribosome — 100 subjects live ([`4afde630`](https://github.com/blurayne/claude-experiments/commit/4afde63027d2ff9f501205c9f18993dd0da114b8))

## [0.16.0] — 2026-08-20

**99 subjects live** · 107 catalogued · [`dd88d85b`](https://github.com/blurayne/claude-experiments/commit/dd88d85b870fc055a991c6bbaa9c21a7896e2cb5)

- **+** `0.16.0` — The mitochondrion, second of the organelle block ([`dd88d85b`](https://github.com/blurayne/claude-experiments/commit/dd88d85b870fc055a991c6bbaa9c21a7896e2cb5))

## [0.15.0] — 2026-08-20

**98 subjects live** · 107 catalogued · [`f326607a`](https://github.com/blurayne/claude-experiments/commit/f326607add5182d2e1f4b5ddda8ed258db467b14)

- **+** `0.15.0` — The nucleus, first of the organelle block ([`f326607a`](https://github.com/blurayne/claude-experiments/commit/f326607add5182d2e1f4b5ddda8ed258db467b14))

## [0.14.0] — 2026-08-20

**97 subjects live** · 107 catalogued · [`b2200025`](https://github.com/blurayne/claude-experiments/commit/b22000254715c317ee2646fc7364bd732e8a28d6)

- **+** `0.14.0` — The tick lands — every original subject now rendered ([`b2200025`](https://github.com/blurayne/claude-experiments/commit/b22000254715c317ee2646fc7364bd732e8a28d6))

## [0.13.0] — 2026-08-20

**96 subjects live** · 97 catalogued · [`0086f852`](https://github.com/blurayne/claude-experiments/commit/0086f85280fb4df98632f4e92840b84d2385520d)

- **+** `0.13.0` — Cancer cell and leukocyte land, 96 of 97 ([`0086f852`](https://github.com/blurayne/claude-experiments/commit/0086f85280fb4df98632f4e92840b84d2385520d))
-   · `0.13.1` — Catalogue the organelles and the genetic material ([`75541c02`](https://github.com/blurayne/claude-experiments/commit/75541c02fe9ad35a44210960f7b6baea6890121d))

## [0.12.0] — 2026-08-20

**94 subjects live** · 94 catalogued · [`2a95790a`](https://github.com/blurayne/claude-experiments/commit/2a95790aa607f439b8c205d6e7478ef8b2a7e09b)

- **+** `0.12.0` — Zika lands — all 94 catalogued microbes now rendered ([`2a95790a`](https://github.com/blurayne/claude-experiments/commit/2a95790aa607f439b8c205d6e7478ef8b2a7e09b))
-   · `0.12.1` — Ignore .env at the repo root; add cancer cells, leukocyte and tick ([`cf7b5277`](https://github.com/blurayne/claude-experiments/commit/cf7b5277ff71de2513715a0b4884ce66bae384f8))

## [0.11.0] — 2026-08-20

**93 subjects live** · 94 catalogued · [`43cb221a`](https://github.com/blurayne/claude-experiments/commit/43cb221a462b718fdabeebd6c22e0f114dbfdd67)

- **+** `0.11.0` — Giardia and varicella-zoster land, 93 of 94 ([`43cb221a`](https://github.com/blurayne/claude-experiments/commit/43cb221a462b718fdabeebd6c22e0f114dbfdd67))

## [0.10.0] — 2026-08-20

**91 subjects live** · 94 catalogued · [`e73ace58`](https://github.com/blurayne/claude-experiments/commit/e73ace58a6b5d2d5e7529bd79cac1ff23dcc01b5)

- **+** `0.10.0` — Repeat taps on prev/next stop being swallowed ([`e73ace58`](https://github.com/blurayne/claude-experiments/commit/e73ace58a6b5d2d5e7529bd79cac1ff23dcc01b5))
-   · `0.10.1` — Theme the picture chooser's open list ([`b9541f2a`](https://github.com/blurayne/claude-experiments/commit/b9541f2a66139f407090098f806c845ea243dbd6))

## [0.9.0] — 2026-08-20

**90 subjects live** · 94 catalogued · [`56d9a879`](https://github.com/blurayne/claude-experiments/commit/56d9a879d68a099def7efe0bf81dc1a531387a36)

- **+** `0.9.0` — Unclip the search dropdowns, +Listeria, +3 plush links ([`56d9a879`](https://github.com/blurayne/claude-experiments/commit/56d9a879d68a099def7efe0bf81dc1a531387a36))
-   · `0.9.1` — Link the Listeria plush ([`0af7f22f`](https://github.com/blurayne/claude-experiments/commit/0af7f22fd625766c483e2b6f28980813423cf539))

## [0.8.0] — 2026-08-20

**89 subjects live** · 93 catalogued · [`0ac466ad`](https://github.com/blurayne/claude-experiments/commit/0ac466ad3091153dcd3c8b3d06680860ccfdcdb2)

- **+** `0.8.0` — Golgi, hepatocyte, C. diff and rotavirus land ([`0ac466ad`](https://github.com/blurayne/claude-experiments/commit/0ac466ad3091153dcd3c8b3d06680860ccfdcdb2))

## [0.7.0] — 2026-08-20

**85 subjects live** · 93 catalogued · [`017c82b8`](https://github.com/blurayne/claude-experiments/commit/017c82b8cb3127d204a382a202376a9d030075f1)

- **+** `0.7.0` — Fix every render log's reference image link ([`017c82b8`](https://github.com/blurayne/claude-experiments/commit/017c82b8cb3127d204a382a202376a9d030075f1))
-   · `0.7.1` — Coloring pages follow the page language again ([`33726e2e`](https://github.com/blurayne/claude-experiments/commit/33726e2e613fde276f2c723b23521e8a2c0ed5be))
-   · `0.7.2` — Stop search hits from pushing the prose apart ([`45118a98`](https://github.com/blurayne/claude-experiments/commit/45118a98697ece2e0d972e930050b3463c7054f9))
-   · `0.7.3` — Borrelia burgdorferi, the atlas's first spirochete ([`afbf08ba`](https://github.com/blurayne/claude-experiments/commit/afbf08baf2586c661a461354c6d90e9bf9605295))
-   · `0.7.4` — Six plush links that were sitting there unmatched ([`7e1147c4`](https://github.com/blurayne/claude-experiments/commit/7e1147c400ccf947b6a6f104906efa7c9ecaa353))
-   · `0.7.5` — Stop the inventory saying "1 plush links" ([`466717f8`](https://github.com/blurayne/claude-experiments/commit/466717f8320b66f02991f72546c154f5806fe109))
-   · `0.7.6` — Borrelia's coloring page, all 85 now have one ([`efdce42b`](https://github.com/blurayne/claude-experiments/commit/efdce42bf7f86f25fa6d8d345a8955ed2323b40c))

## [0.6.0] — 2026-08-20

**84 subjects live** · 93 catalogued · [`b3025c8a`](https://github.com/blurayne/claude-experiments/commit/b3025c8a653f7d3b0ac0cd091e1b022c3ed80c40)

- **+** `0.6.0` — Narration filter, and Amoeba proteus joins the atlas ([`b3025c8a`](https://github.com/blurayne/claude-experiments/commit/b3025c8a653f7d3b0ac0cd091e1b022c3ed80c40))

## [0.5.0] — 2026-08-20

**83 subjects live** · 93 catalogued · [`7b1c7b9f`](https://github.com/blurayne/claude-experiments/commit/7b1c7b9ff30eeea17c622d296099868d64f0bc75)

- **+** `0.5.0` — One generated inventory, search defaults, real empty state ([`7b1c7b9f`](https://github.com/blurayne/claude-experiments/commit/7b1c7b9ff30eeea17c622d296099868d64f0bc75))

## [0.4.0] — 2026-08-20

**81 subjects live** · 90 catalogued · [`5866a5e1`](https://github.com/blurayne/claude-experiments/commit/5866a5e127722795e9ad215e8114688fde6e0771)

- **+** `0.4.0` — Heart-cells set complete ([`5866a5e1`](https://github.com/blurayne/claude-experiments/commit/5866a5e127722795e9ad215e8114688fde6e0771))
-   · `0.4.1` — Text-size setting, stepper buttons, no double-tap zoom ([`73894c67`](https://github.com/blurayne/claude-experiments/commit/73894c678e279afc3df750b6fce9804a45d58f99))
-   · `0.4.2` — Narrate the last nine microbes, fix the mobile top bar ([`46dc3c23`](https://github.com/blurayne/claude-experiments/commit/46dc3c231a39dfe0002339fc47225ddd99d9592f))
-   · `0.4.3` — Close two German-language gaps in the catalogue ([`56e3162b`](https://github.com/blurayne/claude-experiments/commit/56e3162bc0406b8f8a91af030a88011e86533d18))
-   · `0.4.4` — Search scope, asset filters and a live match list ([`c1e6cf10`](https://github.com/blurayne/claude-experiments/commit/c1e6cf10343244c0f30f510e2da1932643f71707))
-   · `0.4.5` — Link the Heart Cell plush to the cardiomyocyte ([`6fc19aea`](https://github.com/blurayne/claude-experiments/commit/6fc19aea1edb59a89e3b0244aa6b6bf96755478e))
-   · `0.4.6` — Catalogue the Golgi apparatus and the hepatocyte ([`f33c41da`](https://github.com/blurayne/claude-experiments/commit/f33c41dad7e44a5628b679d160e13e58256a34cc))

## [0.3.0] — 2026-08-20

**79 subjects live** · 90 catalogued · [`ae067edc`](https://github.com/blurayne/claude-experiments/commit/ae067edc73f13aac3c2d4f2ff2b484511858c8c5)

- **+** `0.3.0` — Make the local file:// view match the deployed one ([`ae067edc`](https://github.com/blurayne/claude-experiments/commit/ae067edc73f13aac3c2d4f2ff2b484511858c8c5))

## [0.2.0] — 2026-08-20

**76 subjects live** · 90 catalogued · [`bb97f3b7`](https://github.com/blurayne/claude-experiments/commit/bb97f3b7f54491dbed35df14fa217c0ff8eae871)

- **+** `0.2.0` — First four new microbes land in the atlas ([`bb97f3b7`](https://github.com/blurayne/claude-experiments/commit/bb97f3b7f54491dbed35df14fa217c0ff8eae871))
-   · `0.2.1` — Restore the executable bit on coloring.py ([`b37bff2e`](https://github.com/blurayne/claude-experiments/commit/b37bff2efcbbd19f3827896bbcca5b37619fd3c8))
-   · `0.2.2` — Restore soft plush photos, tidy the nav tree, survive file:// ([`97d5efd0`](https://github.com/blurayne/claude-experiments/commit/97d5efd0d613fde0023169742c612273ead70d85))
-   · `0.2.3` — Correct the plush-quality claim, refresh set counts ([`9a3ee065`](https://github.com/blurayne/claude-experiments/commit/9a3ee0654a99e9de1bba8b818d66f5b0ec01de14))
-   · `0.2.4` — Give coloring pages an intrinsic size ([`e511f35d`](https://github.com/blurayne/claude-experiments/commit/e511f35d43d67e1824bb4e532f82997665bc7614))

## [0.1.0] — 2026-08-18

**72 subjects live** · 71 catalogued · [`61c80b00`](https://github.com/blurayne/claude-experiments/commit/61c80b0078021f934ee6687280065acefe9b52a1)

- **+** `0.1.0` — Interactive atlas viewer + body-cell & antibody renders ([`61c80b00`](https://github.com/blurayne/claude-experiments/commit/61c80b0078021f934ee6687280065acefe9b52a1))
-   · `0.1.1` — Viewer: richer lightbox, 6-box layout, kid themes, German fallback, source credits ([`a086f3f2`](https://github.com/blurayne/claude-experiments/commit/a086f3f2c917add845aea89f653b9db6d5fd0638))
-   · `0.1.2` — Viewer: microbe-jump buttons, mobile controls dropdown, full source links + original preview ([`e0b857d7`](https://github.com/blurayne/claude-experiments/commit/e0b857d7039160e009e12d07e15a61f519f816de))
-   · `0.1.3` — Viewer: source link opens original in preview (or new tab); A4 print button ([`3fc2d1d8`](https://github.com/blurayne/claude-experiments/commit/3fc2d1d8e1788c5db956acb9a9265229bf728613))
-   · `0.1.4` — Viewer: add kids' coloring-book style (B&W vector SVG) + coloring pipeline ([`249322c6`](https://github.com/blurayne/claude-experiments/commit/249322c6916277290bb7cc59de7e6d901bda7f9b))
-   · `0.1.5` — Swarm UI fixes (topbar, lightbox, coloring, search, i18n) + kids narration audio ([`9b924018`](https://github.com/blurayne/claude-experiments/commit/9b924018a5557de7d451f685d6c4f05c8351ccb9))
-   · `0.1.6` — AI-style tags, hero note, lightbox button consolidation, persistence + kids narration playback UI ([`99282d9a`](https://github.com/blurayne/claude-experiments/commit/99282d9a9db3278e0bc45bdbd0a1adc30d01f99b))
-   · `0.1.7` — Fix mobile menu tap-through and lightbox border/image mismatch ([`d3732b0c`](https://github.com/blurayne/claude-experiments/commit/d3732b0c8fee8980ef0f924dc45962685bd1a631))
-   · `0.1.8` — Source-photo toggle, repositioned narration controls, set-intro narration, eager page structure ([`23df73eb`](https://github.com/blurayne/claude-experiments/commit/23df73ebd29a7d630465de09544df9f1a4b9cd8a))
-   · `0.1.9` — Size/weight scale meter, lightbox bottom-space fix, fill missing finals ([`fafdd90f`](https://github.com/blurayne/claude-experiments/commit/fafdd90f76159743b481740597a0df1d4328e4fb))
-   · `0.1.10` — Two new themes, render <sup> tags, set-titles in jump nav ([`40aa08ef`](https://github.com/blurayne/claude-experiments/commit/40aa08ef5ff0e1c02426afef181abdd9c1abb67e))
-   · `0.1.11` — Fix jump-up navigation getting stuck ([`fe3c6846`](https://github.com/blurayne/claude-experiments/commit/fe3c68468a0ce221760922291e03c551e20ca36d))
-   · `0.1.12` — Add GIANTmicrobes plush toy quick-preview ([`c7bdef0f`](https://github.com/blurayne/claude-experiments/commit/c7bdef0fd63ddc667e39e6236ab11e7352784b8a))
-   · `0.1.13` — Fix low-res stem-cell plush photos, prefer DE store link, add plush as a picture style ([`fc6c2bf1`](https://github.com/blurayne/claude-experiments/commit/fc6c2bf1c9e43445212b8b980a9f45aba7392f8d))
-   · `0.1.14` — Fix coloring-page speech bubble seam/text-fit, avoid title/artwork overlap ([`79c00bc7`](https://github.com/blurayne/claude-experiments/commit/79c00bc730e0401ed9e9af8b3d6c05c68eeed907))
-   · `0.1.15` — Add coloring pages for 35 more microbes ([`dd0838dc`](https://github.com/blurayne/claude-experiments/commit/dd0838dca243c4eb7ad3268634b41082b1b7d39d))
-   · `0.1.16` — Add coloring pages for the remaining 25 microbes ([`b70e7021`](https://github.com/blurayne/claude-experiments/commit/b70e7021826986b0e4cc3d7cc269cf35095e9a28))
-   · `0.1.17` — Strict plush matching, A4 coloring pages, preview language switch ([`a5329f78`](https://github.com/blurayne/claude-experiments/commit/a5329f781ddc5445df1a737f2065b294cb8f898a))
-   · `0.1.18` — Add GIANTmicrobes coverage report ([`cbb091fb`](https://github.com/blurayne/claude-experiments/commit/cbb091fba6b637245035beec6ccc49f66f5ddc47))
-   · `0.1.19` — Drop the print-poster pipeline ([`037d55ef`](https://github.com/blurayne/claude-experiments/commit/037d55ef3d387f403ad18d750d2f88bffa503758))
-   · `0.1.20` — Lean speech-bubble tails toward the character ([`63957816`](https://github.com/blurayne/claude-experiments/commit/639578163b384df1edd3f3e7f67b243da8b4b689))
-   · `0.1.21` — Settings dialog for line weight, comic font in every SVG ([`00b2a552`](https://github.com/blurayne/claude-experiments/commit/00b2a552f8029be3154b8ebe478abe526959a033))
-   · `0.1.22` — Speaking-head narration icon, microscope empty state, panel dismissal ([`6a9b9718`](https://github.com/blurayne/claude-experiments/commit/6a9b9718666ff0dbcbfa9de90dccb820b53f75ff))
-   · `0.1.23` — Proper speech icon, scale meter as SVG ([`ddd9495f`](https://github.com/blurayne/claude-experiments/commit/ddd9495fa4e6200e9507186d4d86a4a9482abcff))
-   · `0.1.24` — Add heart-cells set, scale data for the pending microbes ([`0d00e401`](https://github.com/blurayne/claude-experiments/commit/0d00e401d04c44450e8f4b83b8149878042e703f))
