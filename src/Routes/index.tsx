import { BrowserRouter, Route, Routes as Switch } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { ProviderGlobalContext } from '../Core/Context/GlobalContext'
import Game from '../Page/Game'
import Home from '../Page/Home'
import MultiplayerLobby from '../Page/MultiplayerLobby'
import MultiplayerGame from '../Page/MultiplayerGame'
import { GlobalStyle } from '../styles/GlobalStyles'
import { theme } from '../styles/theme'

const Routes = () => {
  return (
    <BrowserRouter>
      <ProviderGlobalContext>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <Switch>
            <Route path='/' element={<Home />} />
            <Route path='/playing' element={<Game />} />
            <Route path='/multiplayer' element={<MultiplayerLobby />} />
            <Route path='/sala/:code' element={<MultiplayerGame />} />
          </Switch>
        </ThemeProvider>
      </ProviderGlobalContext>
    </BrowserRouter>
  )
}

export default Routes
