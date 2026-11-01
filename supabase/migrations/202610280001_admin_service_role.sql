-- The admin dashboard (/api/admin) reads and manages admins and feedback with
-- the service role. Tables created by SQL migrations don't grant it access
-- automatically, so grant it explicitly.
grant select, insert, update, delete on public.feedback_admins to service_role;
grant select, insert, update, delete on public.feedback_tickets to service_role;
grant select, insert, update, delete on public.feedback_ticket_admin to service_role;
grant select, insert, update, delete on public.feedback_ticket_events to service_role;
