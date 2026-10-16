import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { GlobalContext } from '../../Core/Context/GlobalContext'
import { getPlayer, savePlayerName } from '../../Core/playerIdentity'
import { modeGameData } from '../../data/patterns'

const Home = () => {
  const { modeGame, handleSetModeGame } = useContext(GlobalContext)
  const navigate = useNavigate()
  const [name, setName] = useState(() => getPlayer().name)
  const [step, setStep] = useState<'name' | 'mode' | 'difficulty'>(() => getPlayer().name ? 'mode' : 'name')
  const [playMode, setPlayMode] = useState<'solo' | 'multiplayer'>('solo')
  const currentMode = modeGameData[modeGame || 'starter']
  return <StyleHome>
    <header>{currentMode.name.map(name => <h1 key={name}>{name}</h1>)}</header>
    <section>
      {step === 'name' && <>
        <h2>Qual é seu nome?</h2>
        <input aria-label="Seu nome" maxLength={24} value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />
        <button className="start" disabled={!name.trim()} onClick={() => { savePlayerName(name); setStep('mode') }}>Continuar</button>
      </>}
      {step === 'mode' && <>
        <h2>Olá, {name}!</h2>
        <p>Como deseja jogar?</p>
        <div>
          <button className={playMode === 'solo' ? 'active btn-mode-game' : 'btn-mode-game'} onClick={() => setPlayMode('solo')}>Solo</button>
          <button className={playMode === 'multiplayer' ? 'active btn-mode-game' : 'btn-mode-game'} onClick={() => setPlayMode('multiplayer')}>Multiplayer</button>
        </div>
        <button className="start" onClick={() => setStep('difficulty')}>Continuar</button>
        <button onClick={() => setStep('name')}>Alterar nome</button>
      </>}
      {step === 'difficulty' && <>
        <h2>Selecione a dificuldade</h2>
        <div>
          <button className={modeGame === 'starter' ? 'active btn-mode-game' : 'btn-mode-game'} onClick={() => handleSetModeGame?.('starter')}>Iniciante</button>
          <button className={modeGame === 'advanced' ? 'active btn-mode-game' : 'btn-mode-game'} onClick={() => handleSetModeGame?.('advanced')}>Avançado</button>
        </div>
        <button className="start" onClick={() => navigate(playMode === 'solo' ? '/playing' : '/multiplayer')}>{playMode === 'solo' ? 'Começar o jogo' : 'Continuar para salas'}</button>
        <button onClick={() => setStep('mode')}>Voltar</button>
      </>}
    </section>
  </StyleHome>
}
export default Home
const StyleHome = styled.main`
  min-height: 65vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  flex-direction: column;
  width: 100%;
  max-width: 900px;
  gap: 24px;
  > header {
    display: flex;
    align-items: center;
    flex-direction: column;
    border: 1px solid ${props => props.theme.headerOutline};
    padding: 12px;
    border-radius: 12px;
    > h1 { font-size: clamp(2.5rem, 7vw, 6.5rem); line-height: 100%; text-align: center; }
  }
  > section {
    width: 100%; display: flex; flex-direction: column; align-items: center; gap: 16px;
    > h2 { font-size: clamp(1.3rem, 4vw, 2rem); text-transform: uppercase; text-align: center; }
    > div { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    > input { padding: 12px; font-size: 1.2rem; max-width: 100%; }
  }
`
