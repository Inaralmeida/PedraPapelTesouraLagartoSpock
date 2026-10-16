import React from 'react'

export type modeGame = 'starter' | 'advanced'

export type GlobalContextProps = {
  modeGame?: modeGame
  handleSetModeGame?: (mode: modeGame) => void
  score?: number
  handleGetScore?: () => number
  handleSetScore?: (score: number) => void
}

export const GlobalContext = React.createContext<GlobalContextProps>({})
