import styled, { useTheme } from 'styled-components'

type ButtonOptionProps = {
  name: string
  image: string
  handleClick?: () => void
  win?: boolean
  className?: string
  isLarge?: boolean
  isSmall?: boolean
}

type ColorsByOption = { [key: string]: { start: string; end: string } }
const ButtonOption = ({
  name = 'pedra',
  image,
  handleClick,
  win,
  className,
  isLarge = false,
  isSmall = false
}: ButtonOptionProps) => {
  const {
    rockPrimary,
    paperPrimary,
    scissorsPrimary,
    lizardPrimary,
    spockPrimary,
    rockSecondary,
    paperSecondary,
    scissorsSecondary,
    lizardSecondary,
    spockSecondary
  } = useTheme()
  const colorsByOption: ColorsByOption = {
    pedra: {
      start: rockPrimary,
      end: rockSecondary
    },
    papel: {
      start: paperPrimary,
      end: paperSecondary
    },
    tesoura: {
      start: scissorsPrimary,
      end: scissorsSecondary
    },
    lagarto: {
      start: lizardPrimary,
      end: lizardSecondary
    },
    spock: {
      start: spockPrimary,
      end: spockSecondary
    }
  }
  return (
    <StylePing>
      <div
        className={`${win ? 'win' : ''} ${isLarge ? 'large' : isSmall ? 'small' : ''}`}
      ></div>
      <StyleButtonOption
        className={`${className} ${isLarge ? 'large' : isSmall ? 'small' : ''}`}
        onClick={handleClick}
        startColor={colorsByOption[name].start}
        endColor={colorsByOption[name].end}
      >
        <div className='content'>
          <img src={image} alt={name} />
        </div>
      </StyleButtonOption>
    </StylePing>
  )
}

export default ButtonOption

type StyleButtonOptionProps = {
  startColor: string
  endColor: string
}

const StylePing = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  > .win {
    position: absolute;
    width: 250px;
    height: 250px;
    border-radius: 50%;
    background-color: #fff;
    -webkit-animation: ping 0.6s steps(20, end) infinite forwards;
    animation: ping 0.6s steps(20, end) infinite forwards;
    z-index: 1;

    &.large {
      width: 280px;
      height: 260px;

      @media screen and (max-width: 600px) {
        width: 200px;
        height: 200px;
      }
    }
  }
`

const StyleButtonOption = styled.button<StyleButtonOptionProps>`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  background-image: linear-gradient(
    1deg,
    ${(props) => props.startColor} 50%,
    ${(props) => props.endColor} 100%
  );

  &:hover {
    border: none;
    transform: scale(1);
    > .content > img {
      width: 60%;
    }
  }
  > .content {
    padding: 0;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    box-shadow: inset 1px 3px 4px #00000080;

    > img {
      width: 50%;
      transition: all 0.5s;
      filter: drop-shadow(2px 2px 2px #00000080);
    }
  }

  &.large {
    width: 200px;
    height: 200px;
    > .content {
      width: 160px;
      height: 160px;
    }

    @media screen and (max-width: 600px) {
      width: 150px;
      height: 150px;
      > .content {
        width: 110px;
        height: 110px;
      }
    }
  }

  &.small {
    width: 50px;
    height: 50px;
    > .content {
      width: 40px;
      height: 40px;
    }
  }

  -webkit-animation: scale-in-center 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)
    both;
  animation: scale-in-center 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
`
