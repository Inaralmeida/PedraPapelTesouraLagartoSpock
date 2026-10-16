import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlobalContext } from '../../Core/Context/GlobalContext'
import { getPlayer } from '../../Core/playerIdentity'
import { ensureAnonymousSession } from '../../services/supabase'
export default function MultiplayerLobby() {
 const navigate = useNavigate()
 const { modeGame } = useContext(GlobalContext)
 const [code,setCode] = useState('')
 const [busy,setBusy] = useState(false)
 const [error,setError] = useState('')
 const create = async () => {
   setBusy(true); setError('')
   try {
     const client = await ensureAnonymousSession()
     const {data,error} = await client.rpc('game_create',{p_name:getPlayer().name,p_mode:modeGame || 'starter'})
     if(error) throw error
     navigate('/sala/'+data)
   } catch(e) {setError(e instanceof Error ? e.message : 'Erro ao criar sala')}
   finally {setBusy(false)}
 }
 return <main style={{display:'grid',gap:18,padding:24,maxWidth:520,margin:'auto'}}>
   <h1>Multiplayer</h1>
   <p>Olá, {getPlayer().name}! Escolha criar ou entrar em uma sala.</p>
   <button disabled={busy} onClick={() => void create()}>Criar sala</button>
   <label htmlFor="room-code">Código da sala</label>
   <input id="room-code" inputMode="numeric" maxLength={6} value={code}
     onChange={e=>setCode(e.target.value.replace(/\D/g,''))} placeholder="Código de 6 dígitos" />
   <button disabled={busy || code.length !== 6} onClick={()=>navigate('/sala/'+code)}>Entrar na sala</button>
   {error && <p role="alert">{error}</p>}
   <button onClick={()=>navigate('/')}>Voltar</button>
 </main>
}
