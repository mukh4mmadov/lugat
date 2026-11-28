drop policy if exists "Anyone can read content edits" on public.content_overrides;
drop policy if exists "Visitors read content edits" on public.content_overrides;
drop policy if exists "Learners read content edits" on public.content_overrides;
create policy "Visitors read content edits"
  on public.content_overrides for select to anon
  using (kind <> 'topik');
create policy "Learners read content edits"
  on public.content_overrides for select to authenticated
  using (kind <> 'topik' or public.is_feedback_admin());
