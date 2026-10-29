# K-TALIM

Korean vocabulary and TOPIK I practice for Uzbek, English and Russian
speakers: 28 lessons from the K-TALIM 1A book, study sessions, flashcards with
spaced repetition, listening/quiz/writing practice, an AI tutor and a
computer-style TOPIK I mock exam.

## Running locally

```sh
npm install
npm run dev
```

Without a `.env` file the site runs, but sign-in, progress sync and feedback
are disabled.

## Environment variables

| Variable | Where | Used for |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | browser | Sign-in, progress sync, feedback |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Vercel functions | Verifying sessions in `/api/ai-chat` |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel functions | Admin dashboard (`/api/admin`), leaderboard (`/api/leaderboard`) and account deletion |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Vercel functions | AI tutor |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Vercel functions | AI rate limits (optional; falls back to memory) |

## Admin dashboard

`/admin` is open to users listed in `public.feedback_admins`. To add the first
admin, run in the Supabase SQL editor:

```sql
insert into public.feedback_admins (user_id)
select id from auth.users where email = 'you@example.com';
```

Further admins can be added from the dashboard's Users tab. Run the SQL files in
`supabase/migrations` in order; `202610290001_feedback_conversations.sql` turns
feedback into conversations (replies, internal notes, saved replies, ratings,
unread badges) and must be applied before deploying the new feedback pages.
`202610300001_word_overrides.sql` lets admins correct words from the
dashboard's Words tab; until it is applied, corrections can't be saved. Premium access is
stored as `premium_until` in each user's `app_metadata`, which only the server
can change.

## TOPIK papers

See [supabase/TOPIK_CONTENT.md](supabase/TOPIK_CONTENT.md).

## Vocabulary data

Each word in `data/lessonN.json` has Uzbek, English and Russian meanings and
an example sentence. Edit the sources in `scripts/word-translations/*.tsv` and
`scripts/word-examples/*.tsv`, then run:

```sh
python3 scripts/apply-word-translations.py
```

Small fixes can also be made live from the admin dashboard (Words tab).
