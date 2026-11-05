-- When the tutor put the question to the learner: it asks once, then only
-- listens for an answer, which may come many messages later.
alter table public.ai_user_requests add column if not exists asked_at timestamptz;
