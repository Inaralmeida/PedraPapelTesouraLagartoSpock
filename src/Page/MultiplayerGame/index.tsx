import { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { GlobalContext } from '../../Core/Context/context'
import { getPlayer } from '../../Core/playerIdentity'
import { optionGame } from '../../Core/types/patterns'
import ButtonOption from '../../components/ButtonOption'
import ModalRules from '../../components/ModalRules'
import OptionsGaming from '../../components/OptionsGaming'
import { modeGameData } from '../../data/patterns'
import { ensureAnonymousSession } from '../../services/supabase'
import { StylePlaying, StylesGame } from '../Game/game.styles'

// Must match the extra time the server adds to the next round deadline
const COUNTDOWN_MS = 3000
const RESULT_MS = 5000

type Snapshot = {
  code: string
  mode: 'starter' | 'advanced'
  status: 'waiting' | 'playing' | 'finished'
  host_name: string
  guest_name: string | null
  host_score: number
  guest_score: number
  round_number: number
  deadline: string | null
  // Missing when the reveal_time migration was not applied
  server_now?: string
  // Missing when the rematch_leave migration was not applied
  left_name?: string | null
  my_rematch?: boolean
  opponent_rematch?: boolean
  my_role: 'host' | 'guest'
  my_submitted: boolean
  last_result: null | {
    round: number
    host_choice: string | null
    guest_choice: string | null
    winner: string
    resolved_at?: string
  }
}
export default function MultiplayerGame() {
  const { code = '' } = useParams()
  const navigate = useNavigate()
  const { handleSetModeGame } = useContext(GlobalContext)
  const [room, setRoom] = useState<Snapshot | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [rules, setRules] = useState(false)
  const [myChoice, setMyChoice] = useState<optionGame>()
  const [copied, setCopied] = useState(false)
  // Difference between the server clock and this device clock
  const [serverOffset, setServerOffset] = useState(0)
  const call = useCallback(
    async (method: string, params: Record<string, string>) => {
      const client = await ensureAnonymousSession()
      const { data, error } = await client.rpc(method, params)
      if (error) throw error
      const snapshot = data as Snapshot
      if (snapshot.server_now)
        setServerOffset(new Date(snapshot.server_now).getTime() - Date.now())
      return snapshot
    },
    []
  )
  const refresh = useCallback(async () => {
    try {
      const snapshot = await call('game_resolve', { p_code: code })
      setRoom(snapshot)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar sala')
    }
  }, [call, code])
  useEffect(() => {
    let active = true
    const join = async () => {
      try {
        const snapshot = await call('game_join', {
          p_code: code,
          p_name: getPlayer().name
        })
        if (active) {
          setRoom(snapshot)
          handleSetModeGame?.(snapshot.mode)
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Erro ao entrar')
      }
    }
    void join()
    return () => {
      active = false
    }
  }, [call, code, handleSetModeGame])
  // Keeps polling after the match ends to see rematch requests and departures
  const hasRoom = !!room
  useEffect(() => {
    if (!hasRoom) return
    const timer = window.setInterval(() => void refresh(), 500)
    return () => window.clearInterval(timer)
  }, [hasRoom, refresh])
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    if (!room?.my_submitted) setMyChoice(undefined)
  }, [room?.my_submitted, room?.round_number])

  const serverNow = now + serverOffset
  const outdatedServer =
    !!room && (!room.server_now || room.my_rematch === undefined)
  const resolvedAt = room?.last_result?.resolved_at
  const revealElapsed = resolvedAt
    ? serverNow - new Date(resolvedAt).getTime()
    : Infinity
  const revealing = revealElapsed < COUNTDOWN_MS + RESULT_MS
  const countdown = Math.ceil((COUNTDOWN_MS - revealElapsed) / 1000)
  const clock = room?.deadline
    ? Math.max(
        0,
        Math.ceil((new Date(room.deadline).getTime() - serverNow) / 1000)
      )
    : 0

  const choose = async (option: optionGame) => {
    if (busy || !room || room.my_submitted || revealing || clock === 0) return
    setBusy(true)
    setMyChoice(option)
    try {
      setRoom(await call('game_choose', { p_code: code, p_choice: option.name }))
    } catch (e) {
      setMyChoice(undefined)
      setError(e instanceof Error ? e.message : 'Não foi possível jogar')
    } finally {
      setBusy(false)
    }
  }
  const rematch = async () => {
    setBusy(true)
    try {
      setRoom(await call('game_rematch', { p_code: code }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível pedir revanche')
    } finally {
      setBusy(false)
    }
  }
  const leave = async () => {
    setBusy(true)
    try {
      const client = await ensureAnonymousSession()
      await client.rpc('game_leave', { p_code: code })
    } finally {
      navigate('/')
    }
  }
  const copyRoomCode = async () => {
    if (!room) return
    try {
      await navigator.clipboard.writeText(room.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Não foi possível copiar')
    }
  }

  const currentMode = modeGameData[room?.mode || 'starter']
  const findOption = (name: string | null) =>
    currentMode.options.find((option) => option.name === name)

  const lastResult = room?.last_result
  const isHost = room?.my_role === 'host'
  const myLastChoice = findOption(
    (isHost ? lastResult?.host_choice : lastResult?.guest_choice) ?? null
  )
  const opponentLastChoice = findOption(
    (isHost ? lastResult?.guest_choice : lastResult?.host_choice) ?? null
  )
  const lastResultText = !lastResult
    ? ''
    : lastResult.winner === 'draw'
      ? 'Empate'
      : lastResult.winner === room?.my_role
        ? 'Vitória'
        : 'Derrota'
  const opponentName = (isHost ? room?.guest_name : room?.host_name) || ''
  // The round that ends a match is always won by the match winner
  const iWon = lastResult?.winner === room?.my_role
  // The server scores the round right away; hide it until the result shows
  const pendingPoint = revealing && countdown > 0 ? lastResult?.winner : null
  const hostScore =
    (room?.host_score ?? 0) - (pendingPoint === 'host' ? 1 : 0)
  const guestScore =
    (room?.guest_score ?? 0) - (pendingPoint === 'guest' ? 1 : 0)

  const renderOption = (
    option: optionGame | undefined,
    win: boolean,
    className: string
  ) =>
    option ? (
      <ButtonOption
        isLarge
        className={className}
        win={win}
        image={option.icon}
        name={option.name}
        key={`${className}-${option.value}`}
      />
    ) : (
      <span className='loadingBot'>
        <h2>?</h2>
      </span>
    )

  const renderBoard = () => {
    if (!room) return <p className='message'>Entrando na sala...</p>

    if (room.status === 'waiting')
      return (
        <>
          {room.left_name && (
            <p className='message'>{room.left_name} deixou a sala</p>
          )}
          <p className='message'>
            {room.left_name
              ? 'Convide outra pessoa com o número da sala'
              : 'Aguardando seu adversário entrar...'}
          </p>
          <h2 className='code'>
            Sala: <strong>{room.code}</strong>
          </h2>
          <div className='actions'>
            <button onClick={() => void copyRoomCode()}>
              {copied ? 'Copiado!' : 'Copiar número da sala'}
            </button>
          </div>
        </>
      )

    if (revealing && lastResult) {
      const showResult = countdown <= 0
      return (
        <>
          <p className='message'>Rodada {lastResult.round}</p>
          <StylePlaying>
            {renderOption(
              myLastChoice,
              showResult && lastResultText === 'Vitória',
              'player-selected'
            )}
            <div className='result'>
              {showResult ? (
                <h1>{lastResultText}</h1>
              ) : (
                <span className='versus'>x</span>
              )}
            </div>
            {showResult ? (
              renderOption(
                opponentLastChoice,
                lastResultText === 'Derrota',
                'bot-selected'
              )
            ) : (
              <span className='loadingBot'>
                <h2 key={countdown}>{countdown}</h2>
              </span>
            )}
          </StylePlaying>
        </>
      )
    }

    if (room.status === 'finished')
      return (
        <StylePlaying>
          {renderOption(myLastChoice, iWon, 'player-selected')}
          <div className='result'>
            <h1>{iWon ? 'Você venceu!' : 'Você perdeu!'}</h1>
            {room.opponent_rematch && !room.my_rematch && (
              <p>{opponentName} quer jogar novamente!</p>
            )}
            <button
              className='start'
              disabled={busy || room.my_rematch}
              onClick={() => void rematch()}
            >
              {room.my_rematch
                ? `Aguardando ${opponentName}...`
                : `Jogar novamente contra ${opponentName}`}
            </button>
            <button disabled={busy} onClick={() => void leave()}>
              Sair da sala
            </button>
          </div>
          {renderOption(opponentLastChoice, !iWon, 'bot-selected')}
        </StylePlaying>
      )

    if (room.my_submitted)
      return (
        <>
          <p className='message'>
            Rodada {room.round_number} · Aguardando adversário · {clock}s
          </p>
          <StylePlaying>
            {renderOption(myChoice, false, 'player-selected')}
            <div className='result'>
              <span className='versus'>x</span>
            </div>
            {renderOption(undefined, false, 'bot-selected')}
          </StylePlaying>
        </>
      )

    return (
      <>
        <p className='message'>
          Rodada {room.round_number} · Escolha antes do tempo acabar · {clock}s
        </p>
        <OptionsGaming
          listOption={currentMode.options}
          setoptionSelected={() => undefined}
          handleBotSelectOption={(option) => void choose(option)}
        />
      </>
    )
  }

  return (
    <StylesGame>
      <StyleHeader>
        <div className='panel-score'>
          <p>{room?.host_name || '...'}</p>
          <h3>{hostScore}</h3>
        </div>
        <div className='room-info'>
          <p>3 pontos vence</p>
        </div>
        <div className='panel-score'>
          <p>{room?.guest_name || 'Aguardando...'}</p>
          <h3>{guestScore}</h3>
        </div>
      </StyleHeader>

      <main>
        <StyleBoard>
          {error && <p role='alert'>{error}</p>}
          {outdatedServer && (
            <p role='alert'>
              Banco desatualizado: rode no Supabase as migrations
              20261016_multiplayer_reveal_time.sql e
              20261016_multiplayer_rematch_leave.sql.
            </p>
          )}
          {renderBoard()}
        </StyleBoard>
      </main>
      <footer>
        <button disabled={busy} onClick={() => void leave()}>
          Sair da sala
        </button>
        <button onClick={() => setRules(true)}>Regras</button>
      </footer>
      <ModalRules open={rules} onClose={() => setRules(false)} />
    </StylesGame>
  )
}

const StyleHeader = styled.header`
  gap: 12px;

  > .panel-score > p {
    font-size: 1.4rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > .room-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-transform: uppercase;

    > p {
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: 3px;
    }
  }
`

const StyleBoard = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  > .message {
    font-size: 2rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-align: center;
  }

  > .code {
    font-size: 2.4rem;
    text-transform: uppercase;
  }

  > .actions {
    display: flex;
    gap: 12px;
  }
`
