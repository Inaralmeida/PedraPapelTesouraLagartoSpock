-- Run in Supabase SQL Editor after 20261016_multiplayer_rematch_leave.sql.
-- Scores accumulate across rematches in the same room; a match ends when a
-- player scores 3 points since the match started (host_base/guest_base).
-- Scores reset only when a new opponent joins.
alter table public.game_rooms drop constraint if exists game_rooms_host_score_check;
alter table public.game_rooms drop constraint if exists game_rooms_guest_score_check;
alter table public.game_rooms add constraint game_rooms_host_score_check check (host_score >= 0);
alter table public.game_rooms add constraint game_rooms_guest_score_check check (guest_score >= 0);
alter table public.game_rooms add column if not exists host_base integer not null default 0;
alter table public.game_rooms add column if not exists guest_base integer not null default 0;

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
  deadline=now()+interval '13 seconds'
 where id=r.id;
 update public.game_rooms set status='finished',deadline=null
 where id=r.id and (host_score-host_base>=3 or guest_score-guest_base>=3);
 return public.game_snapshot(p_code);
end $$;

create or replace function public.game_rematch(p_code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r public.game_rooms%rowtype;
begin
 select * into r from public.game_rooms where code=p_code for update;
 if not found or auth.uid() is null or auth.uid() not in (r.host_id,r.guest_id) then raise exception 'Sala indisponível'; end if;
 if r.status<>'finished' then return public.game_snapshot(p_code); end if;
 if auth.uid()=r.host_id then r.host_rematch:=true; else r.guest_rematch:=true; end if;
 if r.host_rematch and r.guest_rematch then
   delete from public.game_rounds where room_id=r.id;
   update public.game_rooms set status='playing',host_base=host_score,guest_base=guest_score,
     round_number=1,deadline=now()+interval '5 seconds',host_rematch=false,guest_rematch=false
   where id=r.id;
 else
   update public.game_rooms set host_rematch=r.host_rematch,guest_rematch=r.guest_rematch where id=r.id;
 end if;
 return public.game_snapshot(p_code);
end $$;

create or replace function public.game_leave(p_code text)
returns void language plpgsql security definer set search_path = '' as $$
declare r public.game_rooms%rowtype; leaving_name text;
begin
 select * into r from public.game_rooms where code=p_code for update;
 if not found or auth.uid() is null or auth.uid() not in (r.host_id,r.guest_id) then return; end if;
 if r.guest_id is null then
   delete from public.game_rooms where id=r.id;
   return;
 end if;
 leaving_name:=case when auth.uid()=r.host_id then r.host_name else r.guest_name end;
 delete from public.game_rounds where room_id=r.id;
 -- The player who stays becomes the host and waits for a new opponent
 update public.game_rooms set
   host_id=case when auth.uid()=r.host_id then r.guest_id else r.host_id end,
   host_name=case when auth.uid()=r.host_id then r.guest_name else r.host_name end,
   guest_id=null,guest_name=null,status='waiting',host_score=0,guest_score=0,
   host_base=0,guest_base=0,round_number=1,deadline=null,
   host_rematch=false,guest_rematch=false,left_name=leaving_name
 where id=r.id;
end $$;
