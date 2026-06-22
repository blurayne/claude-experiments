# World in Numbers

A live, single-page dashboard of how life on Earth is being **born** and **lost**, right now.

Categories — **humans, trees, insects, birds**, three kinds of **fish** (wild / farmed / pet) and three kinds
of **animals** (livestock / wild mammals / pets) — each show:

- a rough **total** today,
- a **progress bar** that fills as time runs from 2026 toward a year you choose,
- the **projected total** for that year (which can go up *or* down), and
- two live **born / killed** flows (rate per minute + a counter for what has happened since you opened the page).

Buttons at the top let you select **one or more regions** (World, Germany, Europe, USA, China, India, Russia,
plus every continent) — each selected region is **stacked as its own row inside every box**, scaled to a shared
axis so they're comparable (the page starts with **World + Germany**). You also pick a **time unit** for the
rates (second → year) and a **refresh interval** (1/2/5/10/20 s). A **slider (2030–2100)** sets the projection
horizon. Each category follows a study-based trajectory: humans grow and peak around 2084
before declining; livestock, farmed fish and pets rise; while trees, insects, wild birds, wild fish and wild
mammals keep shrinking.

## Files

- [`index.html`](index.html) — the whole app (self-contained HTML/CSS/JS, no build step).

## Sources & assumptions

All figures are rough, publicly published estimates extrapolated linearly (or, for humans, along the UN
projection curve). Treat the huge wild-population numbers as orders of magnitude, not precise facts.

- **Humans** — ~8.30 billion; ~252 births / ~121 deaths per minute; UN projection peaks at ~10.3 billion in 2084.
  ([Worldometer](https://www.worldometers.info/world-population/),
  [UN WPP 2024](https://population.un.org/wpp/))
- **Trees** — ~3.04 trillion; net loss ~10 billion/year. ([Crowther et al., Nature 2015](https://www.nature.com/articles/nature14967))
- **Insects** — ~10 quintillion individuals; rough turnover + ~1%/yr decline. ([Smithsonian](https://www.si.edu/spotlight/buginfo/bugnos))
- **Birds** — ~50 billion wild birds; rough turnover + ~0.6%/yr decline. ([Callaghan et al., PNAS 2021](https://www.pnas.org/doi/10.1073/pnas.2023170118))
- **Wild fish** — ~3.5 trillion ocean fish; ~1.6 trillion caught/year; ~0.8%/yr decline under overfishing.
  ([fishcount.org.uk](https://fishcount.org.uk/published/std/fishcountstudy.pdf))
- **Farmed fish** (aquaculture) — ~130 billion finfish slaughtered/year; rising fast.
  ([Mood et al. 2024](https://www.cambridge.org/core/journals/animal-welfare/article/estimating-global-numbers-of-farmed-fishes-killed-for-food-annually-from-1990-to-2019/765A7CCA23ADA0249EF37CFC5014D351))
- **Pet fish** (aquarium) — >1 billion ornamental fish traded/year; ~1.4 billion kept (rough est).
  ([Animal Welfare Institute](https://awionline.org/awi-quarterly/2015-fall/ethical-and-ecological-implications-keeping-fish-captivity))
- **Livestock** (Nutztiere) — ~33 billion alive; ~92 billion slaughtered/year; rising with meat demand.
  ([Our World in Data](https://ourworldindata.org/how-many-animals-get-slaughtered-every-day))
- **Wild mammals** (Wildtiere) — ~130 billion individuals (bats ~56 bn, rodents ~25 bn); declining.
  ([Greenspoon et al., PNAS 2023](https://www.pnas.org/doi/10.1073/pnas.2204892120))
- **Pets** (Haustiere) — ~1 billion dogs & cats plus other companion animals; rising.
  ([HealthforAnimals](https://healthforanimals.org/reports/pet-care-report/global-trends-in-the-pet-population/))

This is an illustrative experiment, not a scientific instrument.
