alter table public.admin_notifications drop constraint if exists admin_notifications_kind_check;
alter table public.admin_notifications add constraint admin_notifications_kind_check
  check (kind in ('deletion', 'ticket', 'ticketReply', 'report', 'signup', 'aiAnswer', 'health', 'digest'));
