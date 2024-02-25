import styled from 'styled-components'

export const StylesGame = styled.main`
  min-height: 100vh;
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  padding: 20px;
  width: 100%;
  max-width: 900px;

  > header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid ${(props) => props.theme.headerOutline};
    padding: 12px;
    border-radius: 20px;
    > h1 {
      width: 10%;
      font-size: 2rem;
    }
    > .panel-score {
      width: fit-content;
      height: 100%;
      border: 3px solid ${(props) => props.theme.text};
      background-color: #fff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 2px;
      padding: 12px;

      > p {
        color: ${(props) => props.theme.scoreText};
        font-size: 2rem;
        letter-spacing: 5px;
        font-weight: 700;
      }
      > h3 {
        color: ${(props) => props.theme.text};
        font-size: 4rem;
        font-weight: 700;
        text-align: center;
      }
    }
  }
  > main,
  > footer {
    height: fit-content;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  > footer {
    justify-content: space-around;
  }
  @media screen and (max-width: 475px) {
    max-width: 100%;
  }
`

export const StylePlaying = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;

  > .result {
    width: fit-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    > h1 {
      -webkit-animation: scale-in-center 0.5s
        cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      animation: scale-in-center 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
    }

    > .versus {
      font-size: 8rem;
    }
  }

  > .loadingBot {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    padding: 0;
    border: 3px solid ${(props) => props.theme.text};
    display: flex;
    align-items: center;
    justify-content: center;

    > h2 {
      font-size: 8rem;
      -webkit-animation: ping 1s ease-in-out infinite both;
      animation: ping 1s ease-in-out infinite both;
    }
  }

  @media screen and (max-width: 600px) {
    max-width: 350px;
    height: fit-content;
    justify-content: center;
    flex-direction: column;

    > .loadingBot {
      width: 150px;
      height: 150px;
    }
  }
`
