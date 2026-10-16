import { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GlobalContext } from '../../Core/Context/context'
import { getPlayer } from '../../Core/playerIdentity'
import { modeGameData } from '../../data/patterns'
import { ensureAnonymousSession } from '../../services/supabase'

type Snapshot = {
 code: string; mode: 'starter' | 'advanced'; status: 'waiting' | 'playing' | 'finished';
 host_name: string; guest_name: string | null; host_score: number; guest_score: number;
 round_number: number; deadline: string | null; my_role: 'host' | 'guest';
 my_submitted: boolean;
 last_result: null | { round: number; host_choice: string | null; guest_choice: string | null; winner: string }
}
export default function MultiplayerGame() {
 const { code = '' } = useParams()
 const navigate = useNavigate()
 const { handleSetModeGame } = useContext(GlobalContext)
 const [room, setRoom] = useState<Snapshot | null>(null)
 const [error, setError] = useState('')
 const [busy, setBusy] = useState(false)
 const [clock, setClock] = useState(5)
 const call = useCallback(async (method: string, params: Record<string,string>) => {
   const client = await ensureAnonymousSession()
   const { data, error } = await client.rpc(method, params)
   if (error) throw error
   return data as Snapshot
 }, [])
 const refresh = useCallback(async () => {
   try {
     const snapshot = await call('game_resolve', { p_code: code })
     setRoom(snapshot)
   } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao atualizar sala') }
 }, [call,code])
 useEffect(() => {
   let active = true
   const join = async () => {
     try {
       const snapshot = await call('game_join',{p_code:code,p_name:getPlayer().name})
       if (active) { setRoom(snapshot); handleSetModeGame?.(snapshot.mode) }
     } catch(e) { if(active) setError(e instanceof Error ? e.message : 'Erro ao entrar') }
   }
   void join()
   return () => { active=false }
 },[call,code,handleSetModeGame])
 useEffect(() => {
   if (!room || room.status === 'finished') return
   const timer = window.setInterval(() => void refresh(), 500)
   return () => window.clearInterval(timer)
 },[room?.status,refresh])
 useEffect(() => {
   const update = () => setClock(room?.deadline ? Math.max(0,Math.ceil((new Date(room.deadline).getTime()-Date.now())/1000)) : 5)
   update()
   const timer = window.setInterval(update,100)
   return () => window.clearInterval(timer)
 },[room?.deadline])
 const choose = async (choice: string) => {
   setBusy(true)
   try { setRoom(await call('game_choose',{p_code:code,p_choice:choice})) }
   catch(e) { setError(e instanceof Error ? e.message : 'Não foi possível jogar') }
   finally { setBusy(false) }
 }
 const copyLink = async () => {
   try { await navigator.clipboard.writeText(window.location.href) }
   catch { setError('Não foi possível copiar o link') }
 }
 const options = modeGameData[room?.mode || 'starter'].options
 return <main style={{padding:24,maxWidth:760,margin:'auto',display:'grid',gap:20,textAlign:'center'}}>
   <h1>Multiplayer</h1>
   {error && <p role="alert">{error}</p>}
   {!room ? <p>Entrando na sala...</p> : <>
     <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
       <div><strong>{room.host_name}</strong><h2>{room.host_score}</h2></div>
       <div><p>Melhor de 5</p><p>Primeiro a 3 vitórias</p></div>
       <div><strong>{room.guest_name || 'Aguardando...'}</strong><h2>{room.guest_score}</h2></div>
     </header>
     <p>Sala: <strong>{room.code}</strong> <button onClick={copyLink}>Copiar link</button>
       <button onClick={() => navigator.clipboard.writeText(room.code)}>Copiar código</button></p>
     {room.status === 'waiting' ? <p>Aguardando seu adversário entrar...</p> : <>
       {room.status === 'finished' ? <h2>{(room.my_role === 'host' ? room.host_score > room.guest_score : room.guest_score > room.host_score) ? 'Você venceu!' : 'Você perdeu!'}</h2> :
         <><h2>Rodada {room.round_number} · {clock}s</h2>
           <p>{room.my_submitted ? 'Escolha registrada! Aguardando o adversário.' : 'Escolha uma opção antes do tempo acabar!'}</p>
           <div style={{display:'flex',justifyContent:'center',flexWrap:'wrap',gap:12}}>
             {options.map(option => <button key={option.name} disabled={busy || room.my_submitted || clock === 0}
               onClick={() => void choose(option.name)}>
               <img src={option.icon} alt="" width="65" height="65" /><span style={{display:'block'}}>{option.name}</span>
             </button>)}
           </div></>}
       {room.last_result && <p>Rodada {room.last_result.round}: {room.last_result.winner === 'draw' ? 'Empate' :
         (room.last_result.winner === room.my_role ? 'Você venceu a rodada!' : 'Adversário venceu a rodada!')}
         {' '}({room.last_result.host_choice || 'sem escolha'} × {room.last_result.guest_choice || 'sem escolha'})</p>}
     </>}
   </>}
   <button onClick={() => navigate('/')}>Voltar ao início</button>
 </main>
}
