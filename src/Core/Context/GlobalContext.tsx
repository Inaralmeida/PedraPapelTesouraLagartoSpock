import { ReactNode, useState } from 'react'
import { GlobalContext, GlobalContextProps, modeGame } from './context'

const useProviderGlobalContext = (): GlobalContextProps => {
  const [modeGame, setModeGame] = useState<modeGame>('starter')
  const [score, setScore] = useState(0)

  const handleSetModeGame = (mode: modeGame) => {
    setModeGame(mode)
  }

  const handleGetScore = () => {
    const currentScore = localStorage.getItem('score')
    if (currentScore) {
      setScore(Number(currentScore))
      return Number(currentScore)
    } else {
      localStorage.setItem('score', '0')
      setScore(0)
      return 0
    }
  }
  const handleSetScore = (score: number) => {
    const currentScore = handleGetScore()
    localStorage.setItem('score', String(currentScore + score))
    setScore(currentScore + score)
  }

  return {
    modeGame,
    handleSetModeGame,
    handleGetScore,
    handleSetScore,
    score
  }
}

export const ProviderGlobalContext = ({
  children
}: {
  children: ReactNode
}) => {
  const values = useProviderGlobalContext()
  return (
    <GlobalContext.Provider value={values}>{children}</GlobalContext.Provider>
  )
}
