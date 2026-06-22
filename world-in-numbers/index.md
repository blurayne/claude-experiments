# World in Numbers

A live, single-page dashboard of how life on Earth is being **born** and **lost**, right now.

Six categories — **humans, trees, insects, birds, fish, animals** — each show:

- a rough **total** today,
- a **progress bar** that fills as time runs from 2026 toward a year you choose,
- the **projected total** for that year (which can go up *or* down), and
- two live **born / killed** flows (rate per minute + a counter for what has happened since you opened the page).

A **slider (2030–2100)** sets the projection horizon. Each category follows a study-based trajectory:
humans grow and peak around 2084 before declining, livestock rises with meat demand, while trees, insects,
wild birds and ocean fish keep shrinking. The page refreshes every **5 seconds**.

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
- **Fish** — ~3.5 trillion ocean fish; ~1.6 trillion caught/year; ~0.8%/yr decline under overfishing.
  ([fishcount.org.uk](https://fishcount.org.uk/published/std/fishcountstudy.pdf),
  [Our World in Data](https://ourworldindata.org/fish-and-overfishing))
- **Animals** (land animals for food) — ~33 billion alive; ~92 billion slaughtered/year; rising with meat demand.
  ([Our World in Data](https://ourworldindata.org/how-many-animals-get-slaughtered-every-day),
  [Humane World](https://www.humaneworld.org/en/blog/more-animals-ever-922-billion-are-used))

This is an illustrative experiment, not a scientific instrument.
