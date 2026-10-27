# TOPIK content

TOPIK papers are bundled with the app in `src/data/topik/exams.js`; the tests
need no database, login or backend. Each paper lists its 70 questions as
`[number, section, points, original paper page, correct option]`, plus the
paths of its PDF and listening recording under `public/topik/<id>/`.

Attempts (answers, flags, audio position, results) are stored in the
browser's `localStorage` by `src/lib/topikAttempts.js`, so a learner can close
the page and resume on the same device.

`/api/ai-chat` imports the same data module to give hints in the untimed
listening and reading practice. AI help is disabled in the full mock.

## Adding a paper

1. Put `paper.pdf` and `listening.mp3` in `public/topik/<id>/`, e.g. `36th`.
2. Add an entry to `TOPIK_EXAMS` with the question rows from the official
   answer key. Use the original question numbers and the PDF page each
   question is printed on.
3. The mock, listening and reading variants (`36thmock`, `36thlistening`,
   `36threading`) are generated automatically.

Each section is scored out of 100. When a key's printed weights don't add to
100 (the 35th reading key adds to 101), the section is normalized to 100 so the
mock total and the level thresholds stay on a 200-point scale.

The older Supabase tables in `migrations/202610090001_topik.sql` are no longer
read by the app.
