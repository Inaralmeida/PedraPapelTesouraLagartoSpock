import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlobalContext } from '../../Core/Context/GlobalContext'
import { getPlayer } from '../../Core/playerIdentity'

export default function MultiplayerLobby() {
  const navigate = useNavigate()
  const { modeGame } = useContext(GlobalContext)
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)
  const player = getPlayer()
  return <main style={{ display: 'grid', gap: 20, padding: 24, maxWidth: 540, margin: 'auto' }}>
    <h1>Multiplayer</h1>
    <p>Olá, {player.name}! Modo {modeGame === 'advanced' ? 'avançado' : 'iniciante'}.</p>
    <p>As salas online ainda não estão habilitadas. Estamos preparando a sincronização segura das partidas.</p>
    <label htmlFor="room-code">Código da sala</label>
    <input id="room-code" inputMode="numeric" maxLength={6} value={code}
      onChange={e => setCode(e.target.value.replace(/\D/g, ''))} placeholder="6 dígitos" />
    <button disabled>Entrar na sala</button>
    <button disabled>Criar sala</button>
    {copied && <p>Link copiado!</p>}
    <button onClick={() => { setCopied(false); navigate('/') }}>Voltar</button>
  </main>
}
