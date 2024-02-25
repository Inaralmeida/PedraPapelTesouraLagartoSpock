import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { GlobalContext } from '../../Core/Context/GlobalContext'
import OptionsGaming from '../../components/OptionsGaming'
import { modeGameData } from '../../data/patterns'

const Home = () => {
  const { modeGame, handleSetModeGame } = useContext(GlobalContext)
  const navigate = useNavigate()

  const currentMode = modeGameData[modeGame ? modeGame : 'starter']
  console.log(currentMode)
  return (
    <StyleHome>
      <header>
        <h1>{currentMode.name}</h1>
      </header>

      <OptionsGaming listOption={currentMode.options} startPage />

      <section>
        <h2>selecione o modo de jogo</h2>
        <div>
          <button
            onClick={() => handleSetModeGame!('starter')}
            className={modeGame === 'starter' ? 'active' : ''}
          >
            Iniciante
          </button>
          <button
            onClick={() => handleSetModeGame!('advanced')}
            className={modeGame === 'advanced' ? 'active' : ''}
          >
            Avancado
          </button>
        </div>
        <button onClick={() => navigate(`/playing`)}>Comecar o Jogo</button>
      </section>
    </StyleHome>
  )
}

export default Home

const StyleHome = styled.main`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  flex-direction: column;
  width: 100%;
  max-width: 900px;

  > header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${(props) => props.theme.headerOutline};
    padding: 12px;
    border-radius: 12px;
    > h1 {
      font-size: 2rem;
      text-align: center;
    }
  }

  > section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    > h2 {
      font-size: 2rem;
      text-transform: uppercase;
      letter-spacing: 4px;
    }

    > div {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }
  }

  @media screen and (max-width: 600px) {
    max-width: 100%;
    width: 100%;
    > section {
      gap: 20px;
      > div {
        flex-direction: column;
      }
    }
  }
`
