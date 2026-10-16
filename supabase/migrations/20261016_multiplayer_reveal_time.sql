-- Run in Supabase SQL Editor after 20261016_multiplayer.sql.
-- Next round deadline = 3s countdown + 5s showing the result + 5s to choose.
-- The snapshot exposes server_now and resolved_at so clients follow the server clock.
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
  'server_now',now(),
  'my_role',case when auth.uid()=r.host_id then 'host' else 'guest' end,
  'my_submitted',exists(select 1 from public.game_rounds q where q.room_id=r.id and q.round_number=r.round_number
    and (case when auth.uid()=r.host_id then q.host_choice else q.guest_choice end) is not null),
  'last_result',case when last_round.resolved_at is not null then
    jsonb_build_object('round',last_round.round_number,'host_choice',last_round.host_choice,
    'guest_choice',last_round.guest_choice,'winner',last_round.winner,
    'resolved_at',last_round.resolved_at) else null end);
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
  deadline=now()+interval '13 seconds'
 where id=r.id;
 update public.game_rooms set status='finished',deadline=null where id=r.id and (host_score>=3 or guest_score>=3);
 return public.game_snapshot(p_code);
end $$;
