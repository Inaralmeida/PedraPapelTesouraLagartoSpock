-- Run in Supabase SQL Editor after 20261016_multiplayer_reveal_time.sql.
-- Rematch: both players must ask for it; then scores and rounds reset.
-- Leave: the remaining player keeps the room (waiting for someone new);
-- when the last player leaves, the room is deleted.
alter table public.game_rooms add column if not exists host_rematch boolean not null default false;
alter table public.game_rooms add column if not exists guest_rematch boolean not null default false;
alter table public.game_rooms add column if not exists left_name text;

create or replace function public.game_snapshot(p_code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r public.game_rooms%rowtype; last_round public.game_rounds%rowtype; is_host boolean;
begin
 select * into r from public.game_rooms where code=p_code and expires_at>now();
 if not found or auth.uid() is null or auth.uid() not in (r.host_id,r.guest_id) then
   raise exception 'Sala indisponível' using errcode='P0001';
 end if;
 is_host:=auth.uid()=r.host_id;
 select * into last_round from public.game_rounds where room_id=r.id and resolved_at is not null order by round_number desc limit 1;
 return jsonb_build_object('code',r.code,'mode',r.mode,'status',r.status,
  'host_name',r.host_name,'guest_name',r.guest_name,'host_score',r.host_score,
  'guest_score',r.guest_score,'round_number',r.round_number,'deadline',r.deadline,
  'server_now',now(),
  'left_name',r.left_name,
  'my_rematch',case when is_host then r.host_rematch else r.guest_rematch end,
  'opponent_rematch',case when is_host then r.guest_rematch else r.host_rematch end,
  'my_role',case when is_host then 'host' else 'guest' end,
  'my_submitted',exists(select 1 from public.game_rounds q where q.room_id=r.id and q.round_number=r.round_number
    and (case when is_host then q.host_choice else q.guest_choice end) is not null),
  'last_result',case when last_round.resolved_at is not null then
    jsonb_build_object('round',last_round.round_number,'host_choice',last_round.host_choice,
    'guest_choice',last_round.guest_choice,'winner',last_round.winner,
    'resolved_at',last_round.resolved_at) else null end);
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
     deadline=now()+interval '5 seconds',left_name=null,host_rematch=false,guest_rematch=false
   where id=r.id;
 elsif r.guest_id<>auth.uid() then raise exception 'Partida indisponível'; end if;
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
   update public.game_rooms set status='playing',host_score=0,guest_score=0,round_number=1,
     deadline=now()+interval '5 seconds',host_rematch=false,guest_rematch=false
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
   round_number=1,deadline=null,host_rematch=false,guest_rematch=false,left_name=leaving_name
 where id=r.id;
end $$;

revoke all on function public.game_rematch(text),public.game_leave(text) from public,anon;
grant execute on function public.game_rematch(text),public.game_leave(text) to authenticated;
