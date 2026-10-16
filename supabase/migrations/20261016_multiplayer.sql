-- Run in Supabase SQL Editor. Server-authoritative private room game.
create extension if not exists pgcrypto;
create table if not exists public.game_rooms (
 id uuid primary key default gen_random_uuid(),
 code text not null unique check (code ~ '^[0-9]{6}$'),
 mode text not null check (mode in ('starter','advanced')),
 host_id uuid not null references auth.users(id),
 guest_id uuid references auth.users(id),
 host_name text not null check (length(host_name) between 1 and 24),
 guest_name text check (guest_name is null or length(guest_name) between 1 and 24),
 status text not null default 'waiting' check (status in ('waiting','playing','finished')),
 host_score integer not null default 0 check (host_score between 0 and 3),
 guest_score integer not null default 0 check (guest_score between 0 and 3),
 round_number integer not null default 1,
 deadline timestamptz,
 expires_at timestamptz not null default (now() + interval '2 hours'),
 created_at timestamptz not null default now(),
 constraint distinct_players check (guest_id is null or guest_id <> host_id)
);
create table if not exists public.game_rounds (
 room_id uuid not null references public.game_rooms(id) on delete cascade,
 round_number integer not null,
 host_choice text check (host_choice in ('pedra','papel','tesoura','lagarto','spock')),
 guest_choice text check (guest_choice in ('pedra','papel','tesoura','lagarto','spock')),
 winner text check (winner in ('host','guest','draw')),
 resolved_at timestamptz,
 primary key(room_id,round_number)
);
create index if not exists game_rooms_expiration_idx on public.game_rooms(expires_at);
alter table public.game_rooms enable row level security;
alter table public.game_rounds enable row level security;
revoke all on public.game_rooms, public.game_rounds from anon, authenticated;
-- All access uses security-definer RPC; never expose hidden moves through SELECT.
create or replace function public.game_snapshot(p_code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r public.game_rooms%rowtype; last_round public.game_rounds%rowtype;
begin
 select * into r from public.game_rooms where code=p_code and expires_at>now();
 if not found or auth.uid() is null or auth.uid() not in (r.host_id,r.guest_id) then
   raise exception 'Sala indisponível' using errcode='P0001';
 end if;
 select * into last_round from public.game_rounds where room_id=r.id and resolved_at is not null order by round_number desc limit 1;
 return jsonb_build_object('code',r.code,'mode',r.mode,'status',r.status,
  'host_name',r.host_name,'guest_name',r.guest_name,'host_score',r.host_score,
  'guest_score',r.guest_score,'round_number',r.round_number,'deadline',r.deadline,
  'my_role',case when auth.uid()=r.host_id then 'host' else 'guest' end,
  'my_submitted',exists(select 1 from public.game_rounds q where q.room_id=r.id and q.round_number=r.round_number
    and (case when auth.uid()=r.host_id then q.host_choice else q.guest_choice end) is not null),
  'last_result',case when last_round.resolved_at is not null then
    jsonb_build_object('round',last_round.round_number,'host_choice',last_round.host_choice,
    'guest_choice',last_round.guest_choice,'winner',last_round.winner) else null end);
end $$;
create or replace function public.game_create(p_name text,p_mode text)
returns text language plpgsql security definer set search_path = '' as $$
declare c text; i integer;
begin
 if auth.uid() is null then raise exception 'Login necessário'; end if;
 if length(trim(p_name)) not between 1 and 24 or p_mode not in ('starter','advanced') then raise exception 'Dados inválidos'; end if;
 for i in 1..20 loop
   c:=lpad((floor(random()*1000000))::integer::text,6,'0');
   begin
     insert into public.game_rooms(code,mode,host_id,host_name) values(c,p_mode,auth.uid(),trim(p_name));
     return c;
   exception when unique_violation then null;
   end;
 end loop;
 raise exception 'Não foi possível gerar o código';
end $$;
create or replace function public.game_join(p_code text,p_name text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r public.game_rooms%rowtype;
begin
 if auth.uid() is null or length(trim(p_name)) not between 1 and 24 then raise exception 'Dados inválidos'; end if;
 select * into r from public.game_rooms where code=p_code for update;
 if not found or r.expires_at<=now() then raise exception 'Sala não encontrada ou expirada'; end if;
 if r.host_id=auth.uid() then return public.game_snapshot(p_code); end if;
 if r.guest_id is not null and r.guest_id<>auth.uid() then raise exception 'Sala cheia'; end if;
 if r.guest_id is null and r.status='waiting' then
   update public.game_rooms set guest_id=auth.uid(),guest_name=trim(p_name),status='playing',
     deadline=now()+interval '5 seconds' where id=r.id;
 elsif r.guest_id<>auth.uid() then raise exception 'Partida indisponível'; end if;
 return public.game_snapshot(p_code);
end $$;
create or replace function public.game_resolve(p_code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r public.game_rooms%rowtype; q public.game_rounds%rowtype; w text; host_wins boolean;
begin
 select * into r from public.game_rooms where code=p_code for update;
 if not found or auth.uid() is null or auth.uid() not in (r.host_id,r.guest_id) then raise exception 'Sala indisponível'; end if;
 if r.status<>'playing' or r.deadline is null then return public.game_snapshot(p_code); end if;
 insert into public.game_rounds(room_id,round_number) values(r.id,r.round_number) on conflict do nothing;
 select * into q from public.game_rounds where room_id=r.id and round_number=r.round_number for update;
 if now()<r.deadline and (q.host_choice is null or q.guest_choice is null) then return public.game_snapshot(p_code); end if;
 if q.resolved_at is not null then return public.game_snapshot(p_code); end if;
 if q.host_choice is null and q.guest_choice is null then w:='draw';
 elsif q.host_choice is null then w:='guest';
 elsif q.guest_choice is null then w:='host';
 elsif q.host_choice=q.guest_choice then w:='draw';
 else
   host_wins:=case q.host_choice
     when 'pedra' then q.guest_choice in ('tesoura','lagarto')
     when 'papel' then q.guest_choice in ('pedra','spock')
     when 'tesoura' then q.guest_choice in ('papel','lagarto')
     when 'lagarto' then q.guest_choice in ('papel','spock')
     when 'spock' then q.guest_choice in ('pedra','tesoura') end;
   w:=case when host_wins then 'host' else 'guest' end;
 end if;
 update public.game_rounds set winner=w,resolved_at=now() where room_id=r.id and round_number=r.round_number;
 update public.game_rooms set host_score=host_score+case when w='host' then 1 else 0 end,
  guest_score=guest_score+case when w='guest' then 1 else 0 end,
  round_number=round_number+1,
  deadline=now()+interval '5 seconds'
 where id=r.id;
 update public.game_rooms set status='finished',deadline=null where id=r.id and (host_score>=3 or guest_score>=3);
 return public.game_snapshot(p_code);
end $$;
create or replace function public.game_choose(p_code text,p_choice text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r public.game_rooms%rowtype;
begin
 select * into r from public.game_rooms where code=p_code for update;
 if not found or auth.uid() is null or auth.uid() not in (r.host_id,r.guest_id) then raise exception 'Sala indisponível'; end if;
 if r.status<>'playing' then raise exception 'Partida não iniciada'; end if;
 if now()>=r.deadline then return public.game_resolve(p_code); end if;
 if p_choice not in ('pedra','papel','tesoura','lagarto','spock') or
   (r.mode='starter' and p_choice not in ('pedra','papel','tesoura')) then raise exception 'Escolha inválida'; end if;
 insert into public.game_rounds(room_id,round_number) values(r.id,r.round_number) on conflict do nothing;
 if auth.uid()=r.host_id then
   update public.game_rounds set host_choice=p_choice where room_id=r.id and round_number=r.round_number and host_choice is null;
 else
   update public.game_rounds set guest_choice=p_choice where room_id=r.id and round_number=r.round_number and guest_choice is null;
 end if;
 return public.game_resolve(p_code);
end $$;
revoke all on function public.game_snapshot(text),public.game_create(text,text),public.game_join(text,text),public.game_resolve(text),public.game_choose(text,text) from public,anon;
grant execute on function public.game_snapshot(text),public.game_create(text,text),public.game_join(text,text),public.game_resolve(text),public.game_choose(text,text) to authenticated;
-- RPC polling is sufficient for the first iteration; no table publication is needed.
