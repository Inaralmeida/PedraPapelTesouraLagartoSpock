import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlobalContext } from '../../Core/Context/GlobalContext'
import { optionGame } from '../../Core/types/patterns'
import ButtonOption from '../../components/ButtonOption'
import OptionsGaming from '../../components/OptionsGaming'
import { modeGameData } from '../../data/patterns'
import { StylePlaying, StylesGame } from './game.styles'
const Game = () => {
  const navigate = useNavigate()
  const { modeGame, score, handleSetScore } = useContext(GlobalContext)
  const currentMode = modeGameData[modeGame ? modeGame : 'starter']
  const [optionSelected, setoptionSelected] = useState<optionGame>()
  const [botOptionSelected, setBotOptionSelected] = useState<optionGame>()
  const [regressiveCount, setRegressiveCount] = useState(3)
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(``)

  const handleBotSelectOption = (option: optionGame) => {
    setLoading(true)
    const botOption =
      currentMode.options[
        Math.floor(Math.random() * currentMode.options.length)
      ]
    const point = handleVerifyResult(botOption, option)
    const intervalID = setInterval(() => {
      setRegressiveCount((prevCount) => --prevCount)
    }, 1000)

    setTimeout(() => {
      clearInterval(intervalID)
      setBotOptionSelected(botOption)
      setRegressiveCount(3)
      setLoading(false)
      handleSetScore!(point)
    }, 3000)
  }
  const handleVerifyResult = (
    botOptionSelected: optionGame,
    optionSelected: optionGame
  ) => {
    const userOption = optionSelected.name
    const botOption = botOptionSelected.name
    const textResult = currentMode.rules[userOption][botOption]
    setResult(textResult)
    return textResult === 'Vitoria' ? 1 : 0
  }
  const handleNewGame = () => {
    setoptionSelected(undefined)
    setBotOptionSelected(undefined)
    setResult('')
    setRegressiveCount(3)
  }
  return (
    <StylesGame>
      <header>
        <div>
          {currentMode.name.map((name: string) => (
            <h1 key={name}>{name}</h1>
          ))}
        </div>
        <div className='panel-score'>
          <p>SCORE</p>
          <h3>{score}</h3>
        </div>
      </header>

      <main>
        {!optionSelected ? (
          <OptionsGaming
            listOption={currentMode.options}
            setoptionSelected={setoptionSelected}
            handleBotSelectOption={handleBotSelectOption}
          />
        ) : (
          <StylePlaying>
            <ButtonOption
              isLarge
              className='player-selected'
              win={result === 'Vitoria' && !loading}
              image={optionSelected ? optionSelected!.icon : ''}
              name={optionSelected ? optionSelected!.name : ''}
              key={optionSelected ? optionSelected!.value : ''}
            />
            {!loading && result ? (
              <div className='result'>
                <h1>{result}</h1>
                <button onClick={handleNewGame}>JOGAR NOVAMENTE</button>
              </div>
            ) : (
              <div className='result'>
                <span className='versus'>x</span>
              </div>
            )}

            {loading && regressiveCount !== 0 ? (
              <span className='loadingBot'>
                <h2>{regressiveCount}</h2>
              </span>
            ) : (
              <ButtonOption
                isLarge
                className='bot-selected'
                win={result === 'Derrota'}
                image={botOptionSelected ? botOptionSelected!.icon : ''}
                name={botOptionSelected!.name}
                key={botOptionSelected!.value}
              />
            )}
          </StylePlaying>
        )}
      </main>
      <footer>
        <button onClick={() => navigate(`/`)}>inicio</button>
        <button>Regras</button>
      </footer>
    </StylesGame>
  )
}

export default Game
