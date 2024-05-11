import { MouseEventHandler } from 'react'
import styled from 'styled-components'
import { modeGameData } from '../../data/patterns'
import { rulesArray } from '../../data/rules'
import ButtonOption from '../ButtonOption'

interface IconMap {
  [key: string]: string
}

type ModalRulesProps = {
  open: boolean
  onClose: () => void
}
const ModalRules = ({ open, onClose }: ModalRulesProps) => {
  const createIconMap = (): IconMap => {
    const iconMap: IconMap = {}

    modeGameData.advanced.options.forEach((option) => {
      iconMap[option.name] = option.icon
    })

    return iconMap
  }
  const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement
    if (target.id === 'overlay') {
      onClose()
    }
  }

  const images = createIconMap()
  return (
    <>
      {open && (
        <StyleModal
          className='modal-container'
          id='overlay'
          onClick={handleClick}
        >
          <div className='modal_content'>
            <header>
              <h1>regras</h1>
              <span
                className='btn_close'
                aria-label='fechar'
                aria-roledescription='button'
                onClick={onClose}
              >
                X
              </span>
            </header>

            <main>
              {rulesArray.map(({ win, loser, message }) => (
                <div key={win}>
                  <ButtonOption image={images[win]} isSmall name={win} />
                  <p>{message}</p>
                  <ButtonOption image={images[loser]} isSmall name={loser} />
                </div>
              ))}
            </main>
          </div>
        </StyleModal>
      )}
    </>
  )
}

export default ModalRules

const StyleModal = styled.div`
  width: 100%;
  height: 100vh;
  position: absolute;
  background-color: #10101080;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;

  > .modal_content {
    width: 300px;
    height: fit-content;
    background-color: #f2f2f2;
    border-radius: 12px;
    padding: 12px;

    h1,
    p {
      color: ${(props) => props.theme.scoreText};
    }

    > header {
      width: 100%;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      > h1 {
        font-size: 3rem;
      }

      > span {
        font-size: 2.4rem;
        cursor: pointer;
        color: ${(props) => props.theme.headerOutline};
        transition: all 0.3s;

        &:hover {
          color: ${(props) => props.theme.backroundSecondary};
        }
      }
    }

    > main {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      max-height: 85vh;
      overflow-y: auto;
      padding-top: 24px;

      > div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 80%;
        gap: 12px;
        font-size: 2rem;
        color: ${(props) => props.theme.text};
        text-transform: uppercase;
      }
    }
  }
`
