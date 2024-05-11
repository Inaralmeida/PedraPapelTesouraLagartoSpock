import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { GlobalContext } from '../../Core/Context/GlobalContext'
import { modeGameData } from '../../data/patterns'

const Home = () => {
  const { modeGame, handleSetModeGame } = useContext(GlobalContext)
  const navigate = useNavigate()

  const currentMode = modeGameData[modeGame ? modeGame : 'starter']
  return (
    <StyleHome>
      <header>
        {currentMode.name.map((name: string) => (
          <h1 key={name}>{name}</h1>
        ))}
      </header>

      <section>
        <h2>selecione o modo de jogo</h2>
        <div>
          <button
            className={
              modeGame === 'starter' ? 'active btn-mode-game' : 'btn-mode-game'
            }
            onClick={() => handleSetModeGame!('starter')}
          >
            Iniciante
          </button>
          <button
            className={
              modeGame === 'advanced' ? 'active btn-mode-game' : 'btn-mode-game'
            }
            onClick={() => handleSetModeGame!('advanced')}
          >
            Avançado
          </button>
        </div>
        {modeGame!.length > 1 && (
          <button className='start' onClick={() => navigate(`/playing`)}>
            Começar o Jogo
          </button>
        )}
      </section>
    </StyleHome>
  )
}

export default Home

const StyleHome = styled.main`
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  flex-direction: column;
  width: 100%;
  max-width: 900px;

  > header {
    width: 50%;
    margin: 0 auto;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    border: 1px solid ${(props) => props.theme.headerOutline};
    padding: 12px;
    border-radius: 12px;
    > h1 {
      font-size: 6.5rem;
      line-height: 90%;
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
    height: 90vh;
    max-width: 100%;
    width: 100%;
    > header {
      width: fit-content;
    }
    > section {
      gap: 20px;
    }
  }
`
