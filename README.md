# erza.studio

Static website of Erza Studio, served with GitHub Pages at <https://erza.studio>.

No build step: edit the HTML, `studio.css` and `studio.js`, then commit. The pages share one stylesheet and one script:

- `/` — studio home: mobile games and apps first, open-source tools second.
- `/sippo/` — Sippo, the water habit with a living aquarium (in development).
- `/sortpuzzle/` — Sort Puzzle and its privacy policy.
- `/framehub/`, `/pco/` — open-source Windows tools.
- `/404.html` — not-found page.

Every page carries both English and Polish copy in the same HTML; the language switch only changes `data-lang` on `<html>` and the visible `data-l` spans. Screenshots follow the same rule with two `<img>` elements. No external fonts, scripts or requests.
