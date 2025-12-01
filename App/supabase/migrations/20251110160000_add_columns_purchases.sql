-- Add columns used by kirvano-webhook parity
alter table public.purchases
  add column if not exists email text,
  add column if not exists product_names text,
  add column if not exists payment_method text;

create index if not exists purchases_email_idx on public.purchases (email);
