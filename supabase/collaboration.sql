-- Fall Focus collaborative workspaces
-- Run once in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  invite_code text not null unique default upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 10)),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

alter table public.tasks
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

create index if not exists tasks_workspace_id_idx on public.tasks(workspace_id);
create index if not exists workspace_members_user_id_idx on public.workspace_members(user_id);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.tasks enable row level security;

-- Security-definer helper avoids recursive membership-policy evaluation.
create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
  );
$$;

revoke all on function public.is_workspace_member(uuid) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;

drop policy if exists "Members can view workspaces" on public.workspaces;
create policy "Members can view workspaces"
on public.workspaces for select to authenticated
using (public.is_workspace_member(id));

drop policy if exists "Owners can update workspaces" on public.workspaces;
create policy "Owners can update workspaces"
on public.workspaces for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists "Members can view memberships" on public.workspace_members;
create policy "Members can view memberships"
on public.workspace_members for select to authenticated
using (public.is_workspace_member(workspace_id));

-- Replace the original personal-task policies with policies that also allow
-- members of a shared workspace to work with that workspace's tasks.
drop policy if exists "Users can view their tasks" on public.tasks;
drop policy if exists "Users can create their tasks" on public.tasks;
drop policy if exists "Users can update their tasks" on public.tasks;
drop policy if exists "Users can delete their tasks" on public.tasks;
drop policy if exists "Users can view accessible tasks" on public.tasks;
drop policy if exists "Users can create accessible tasks" on public.tasks;
drop policy if exists "Users can update accessible tasks" on public.tasks;
drop policy if exists "Users can delete accessible tasks" on public.tasks;

create policy "Users can view accessible tasks"
on public.tasks for select to authenticated
using (
  user_id = (select auth.uid())
  or public.is_workspace_member(workspace_id)
);

create policy "Users can create accessible tasks"
on public.tasks for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (
    workspace_id is null
    or public.is_workspace_member(workspace_id)
  )
);

create policy "Users can update accessible tasks"
on public.tasks for update to authenticated
using (
  user_id = (select auth.uid())
  or public.is_workspace_member(workspace_id)
)
with check (
  user_id = (select auth.uid())
  or public.is_workspace_member(workspace_id)
);

create policy "Users can delete accessible tasks"
on public.tasks for delete to authenticated
using (
  user_id = (select auth.uid())
  or public.is_workspace_member(workspace_id)
);

-- These functions make workspace creation and joining atomic. They use the
-- authenticated user's ID and never accept a user ID from the browser.
create or replace function public.create_workspace(workspace_name text)
returns public.workspaces
language plpgsql
security definer
set search_path = public
as $$
declare
  created public.workspaces;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.workspaces (name, owner_id)
  values (trim(workspace_name), auth.uid())
  returning * into created;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (created.id, auth.uid(), 'owner');

  return created;
end;
$$;

create or replace function public.join_workspace(workspace_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select id into target_id
  from public.workspaces
  where invite_code = upper(trim(workspace_code));

  if target_id is null then
    raise exception 'Invalid workspace code';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (target_id, auth.uid(), 'member')
  on conflict (workspace_id, user_id) do nothing;

  return target_id;
end;
$$;

revoke all on function public.create_workspace(text) from public;
revoke all on function public.join_workspace(text) from public;
grant execute on function public.create_workspace(text) to authenticated;
grant execute on function public.join_workspace(text) to authenticated;

grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, update, delete on public.workspace_members to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
