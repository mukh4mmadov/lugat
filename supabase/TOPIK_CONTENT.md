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

The exam shows one question per screen, as on the computer-based test: the
block instruction, the shared passage, the question's printed material, and the
four choices to click. Choice text is read from the PDF; passages, notices and
pictures are cropped from the PDF at runtime. That per-question content lives
in a generated module such as `src/data/topik/paper35Content.js`.

## Adding a paper

1. Put `paper.pdf` and `listening.mp3` in `public/topik/<id>/`, e.g. `36th`.
2. Generate the question content from the PDF:

   ```sh
   node scripts/topik-extract-paper.mjs public/topik/36th/paper.pdf src/data/topik/paper36Content.js PAPER_36_CONTENT
   ```

   The script stops and lists the questions it could not read if any of the
   70 questions lacks exactly four choices.
3. Find where each listening question sits in the recording (needs ffmpeg):

   ```sh
   FFMPEG=/path/to/ffmpeg node scripts/topik-audio-timeline.mjs public/topik/36th/listening.mp3 src/data/topik/paper36Audio.js PAPER_36_AUDIO
   ```

   Every question ends with a long answering silence; the script stops unless
   it finds exactly 30. The mock uses the timeline to follow the recording
   question by question (대기 · 듣기 · 풀이), and practice replays one question.
4. Add an entry to `TOPIK_EXAMS` with the question rows from the official
   answer key (original question numbers and the PDF page of each question),
   `content: PAPER_36_CONTENT` and `audioTimeline: PAPER_36_AUDIO`. If a block
   instruction is new, add its translation to `src/data/topik/instructions.js`.
5. The mock, listening and reading variants (`36thmock`, `36thlistening`,
   `36threading`) are generated automatically.

Each section is scored out of 100. When a key's printed weights don't add to
100 (the 35th reading key adds to 101), the section is normalized to 100 so the
mock total and the level thresholds stay on a 200-point scale.

The older Supabase tables in `migrations/202610090001_topik.sql` are no longer
read by the app.
