import { useContext } from 'react'
import styled from 'styled-components'
import { GlobalContext } from '../../Core/Context/GlobalContext'
import { optionGame } from '../../Core/types/patterns'
import bgAdvanced from '../../assets/bg/bg-pentagon.svg'
import bgStarter from '../../assets/bg/bg-triangle.svg'
import ButtonOption from '../ButtonOption'
type TOptionsGamingProps = {
  listOption: optionGame[]
  setoptionSelected?: (option: optionGame) => void
  handleBotSelectOption?: (option: optionGame) => void
  startPage?: boolean
}

const OptionsGaming = ({
  listOption,
  setoptionSelected,
  handleBotSelectOption,
  startPage = false
}: TOptionsGamingProps) => {
  const { modeGame } = useContext(GlobalContext)

  const bg = modeGame === 'advanced' ? bgAdvanced : bgStarter

  return (
    <StyleOptionsGaming bg={bg}>
      <ul className={modeGame}>
        {listOption.map((option: optionGame) => (
          <li key={option.value} className={option.name}>
            <ButtonOption
              handleClick={() => {
                if (!startPage) {
                  setoptionSelected!(option)
                  handleBotSelectOption!(option)
                }
              }}
              image={option.icon}
              name={option.name}
            />
          </li>
        ))}
      </ul>
    </StyleOptionsGaming>
  )
}

export default OptionsGaming

type TStyleOptionsGamingProps = {
  bg: string
}

const StyleOptionsGaming = styled.div<TStyleOptionsGamingProps>`
  width: 300px;
  height: 300px;
  background-image: url(${(props) => props.bg});
  background-position: center;
  background-size: 80%;
  background-repeat: no-repeat;

  > ul {
    position: relative;
    width: 100%;
    height: 100%;

    > li {
      position: absolute;
      padding: 0;
      text-decoration: none;
      list-style: none;
      width: fit-content;
      height: fit-content;
    }

    &.advanced {
      > .pedra {
        top: 70px;
        left: 0px;
      }
      > .papel {
        top: 0px;
        left: calc(50% - 50px);
      }
      > .tesoura {
        top: 70px;
        left: calc(100% - 100px);
      }
      > .lagarto {
        top: calc(100% - 100px);
        left: calc(75% - 50px);
      }
      > .spock {
        top: calc(100% - 100px);
        left: calc(25% - 50px);
      }
    }

    &.starter {
      > .pedra {
        top: 0px;
        left: 0px;
      }
      > .papel {
        top: 0px;
        left: calc(100% - 100px);
      }
      > .tesoura {
        top: calc(100% - 100px);
        left: calc(50% - 50px);
      }
    }
  }

  @media screen and (max-width: 600px) {
    width: 300px;
    height: 300px;
  }
`
