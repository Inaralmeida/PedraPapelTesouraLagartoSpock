import React, { ReactNode, useState } from 'react'
type GlobalContextProps = {
  modeGame?: modeGame
  handleSetModeGame?: (mode: modeGame) => void
  score?: number
  handleGetScore?: () => number
  handleSetScore?: (score: number) => void
}

type modeGame = 'starter' | 'advanced' | ''

export const GlobalContext = React.createContext<GlobalContextProps>({})

const useProviderGlobalContext = (): GlobalContextProps => {
  const [modeGame, setModeGame] = useState<modeGame>('')
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
