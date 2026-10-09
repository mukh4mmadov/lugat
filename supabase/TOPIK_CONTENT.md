# TOPIK content

The first paper, 35th TOPIK I B, is seeded by `migrations/202610090001_topik.sql`.
The migration creates the three variants (`35thmock`, `35thlistening`, and
`35threading`), inserts all 70 questions and answer keys, and enables the
variants after checking that the question set is complete.

The original paper and listening recording are served from
`public/topik/35th/paper.pdf` and `public/topik/35th/listening.mp3`. Every
question stores its original paper page in `content.document_page`, so the
exam viewer can show the correct page while the student selects an answer.
Listening uses the full original recording, displayed throughout questions
1–30.

## Applying it

Apply the migration to the Supabase project connected to the site. For example,
with the Supabase CLI linked to that project:

```sh
supabase db push
```

The app still needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured
in its local or deployment environment. Users sign in so their saved answers
and results are associated with their account.

## Adding future papers

Add each new exam's variants, questions, answer keys, and media paths in a new
migration. Keep stable variant IDs such as `36thmock`, `36thlistening`, and
`36threading`. Question rows are shared by the mock and section variants; use
the original question numbers. Store answer keys only in
`topik_answer_keys`, never in the question JSON. Mark variants ready only after
the expected question and answer-key counts are present.

The 35th reading key's printed question weights sum to 101. Its individual
weights are preserved for answer review, while the reading section result is
normalized to 100 so the mock total and level thresholds use a 200-point scale.
