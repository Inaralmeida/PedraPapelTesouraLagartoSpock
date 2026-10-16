import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { GlobalContext } from '../../Core/Context/context'
import { getPlayer } from '../../Core/playerIdentity'
import { ensureAnonymousSession } from '../../services/supabase'
export default function MultiplayerLobby() {
  const navigate = useNavigate()
  const { modeGame, handleSetModeGame } = useContext(GlobalContext)
  const [step, setStep] = useState<'choose' | 'create' | 'join'>('choose')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const create = async () => {
    setBusy(true)
    setError('')
    try {
      const client = await ensureAnonymousSession()
      const { data, error } = await client.rpc('game_create', {
        p_name: getPlayer().name,
        p_mode: modeGame || 'starter'
      })
      if (error) throw error
      navigate('/sala/' + data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar sala')
    } finally {
      setBusy(false)
    }
  }
  return (
    <StyleLobby>
      <h1>Multiplayer</h1>

      {step === 'choose' && (
        <div>
          <button className='btn-mode-game' onClick={() => setStep('create')}>
            Criar sala
          </button>
          <button className='btn-mode-game' onClick={() => setStep('join')}>
            Entrar em sala
          </button>
        </div>
      )}

      {step === 'create' && (
        <>
          <h2>Selecione a dificuldade</h2>
          <div>
            <button
              className={
                modeGame === 'starter' ? 'active btn-mode-game' : 'btn-mode-game'
              }
              onClick={() => handleSetModeGame?.('starter')}
            >
              Iniciante
            </button>
            <button
              className={
                modeGame === 'advanced'
                  ? 'active btn-mode-game'
                  : 'btn-mode-game'
              }
              onClick={() => handleSetModeGame?.('advanced')}
            >
              Avançado
            </button>
          </div>
          <button
            className='start'
            disabled={busy}
            onClick={() => void create()}
          >
            Criar sala
          </button>
        </>
      )}

      {step === 'join' && (
        <>
          <h2>Código da sala</h2>
          <input
            id='room-code'
            aria-label='Código da sala'
            inputMode='numeric'
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder='Código de 6 dígitos'
          />
          <button
            className='start'
            disabled={code.length !== 6}
            onClick={() => navigate('/sala/' + code)}
          >
            Entrar na sala
          </button>
        </>
      )}

      {error && <p role='alert'>{error}</p>}
      <button
        onClick={() => (step === 'choose' ? navigate('/') : setStep('choose'))}
      >
        Voltar
      </button>
    </StyleLobby>
  )
}

const StyleLobby = styled.main`
  min-height: 65vh;
  width: 100%;
  max-width: 520px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;

  > h1 {
    font-size: clamp(2.5rem, 7vw, 4.5rem);
    text-transform: uppercase;
  }

  > h2 {
    font-size: 3rem;
    text-transform: uppercase;
    text-align: center;
  }

  > div {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  > input {
    color: #101010;
    border: none;
    border-radius: 8px;
    padding: 8px;
    font-size: 2rem;
    height: 40px;
    text-align: center;
  }
`
