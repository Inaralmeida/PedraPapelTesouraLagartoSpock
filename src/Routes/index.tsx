import { BrowserRouter, Route, Routes as Switch } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { ProviderGlobalContext } from '../Core/Context/GlobalContext'
import Game from '../Page/Game'
import Home from '../Page/Home'
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
          </Switch>
        </ThemeProvider>
      </ProviderGlobalContext>
    </BrowserRouter>
  )
}

export default Routes
