import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  *{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Barlow Semi Condensed', sans-serif;
    color: #fff;
  }

h1{
  font-size: 5rem;
  text-transform: uppercase;
}
  body, html, #root{
    width: 100%;
    min-height: 100vh;
    max-height: 100vh;
    background-image: radial-gradient(circle,  ${(props) =>
      props.theme.backroundPrimary} 50%, ${(props) =>
      props.theme.backroundSecondary} 100%); 
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 65.5%;
    overflow-y: none;

  }

  button{
    cursor: pointer;
    border: 3px solid ${(props) => props.theme.headerOutline};
    padding: 15px 35px;
    text-transform: uppercase;
    border-radius: 12px;
    letter-spacing: 5px;
    background-color: transparent;
    outline: transparent;
    transition: all .5s;

   

    &:hover, &.active, &.start{
      background-color: ${(props) => props.theme.backroundPrimary};
      color: #fff;
      border: 3px solid #fff;
      transform: scale(1.05);
      font-weight: bold;
     
    }
    &.start{
      background-color: ${(props) => props.theme.primary};
    }
    
    &.btn-mode-game{
      padding: 15px 20px;
    }
  }

 

  @media screen and (max-width: 475px) {
    h1{
  font-size: 2rem;
}
  }

  @-webkit-keyframes scale-in-center {
    0% {
      -webkit-transform: scale(0);
      transform: scale(0);
      opacity: 1;
    }
    100% {
      -webkit-transform: scale(1);
      transform: scale(1);
      opacity: 1;
    }
  }
  @keyframes scale-in-center {
    0% {
      -webkit-transform: scale(0);
      transform: scale(0);
      opacity: 1;
    }
    100% {
      -webkit-transform: scale(1);
      transform: scale(1);
      opacity: 1;
    }
  }

  @-webkit-keyframes ping {
  0% {
    -webkit-transform: scale(0.2);
            transform: scale(0.2);
    opacity: 0.8;
  }
  80% {
    -webkit-transform: scale(1.2);
            transform: scale(1.2);
    opacity: 0;
  }
  100% {
    -webkit-transform: scale(2.2);
            transform: scale(2.2);
    opacity: 0;
  }
}
@keyframes ping {
  0% {
    -webkit-transform: scale(0.2);
            transform: scale(0.2);
    opacity: 0.8;
  }
  80% {
    -webkit-transform: scale(1.2);
            transform: scale(1.2);
    opacity: 0;
  }
  100% {
    -webkit-transform: scale(2.2);
            transform: scale(2.2);
    opacity: 0;
  }
}

@-webkit-keyframes ping {
  0% {
    -webkit-transform: scale(0.2);
            transform: scale(0.2);
    opacity: 0.8;
  }
  80% {
    -webkit-transform: scale(1.2);
            transform: scale(1.2);
    opacity: 0;
  }
  100% {
    -webkit-transform: scale(2.2);
            transform: scale(2.2);
    opacity: 0;
  }
}
@keyframes ping {
  0% {
    -webkit-transform: scale(0.2);
            transform: scale(0.2);
    opacity: 0.8;
  }
  80% {
    -webkit-transform: scale(1.2);
            transform: scale(1.2);
    opacity: 0;
  }
  100% {
    -webkit-transform: scale(2.2);
            transform: scale(2.2);
    opacity: 0;
  }
}


`
