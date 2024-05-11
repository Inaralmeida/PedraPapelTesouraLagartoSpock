interface Option {
  name: string
  value: string
  icon: string
}

interface Rule {
  [key: string]: string
}

interface GameData {
  level: string
  name: string[]
  description: string
  options: Option[]
  rules: {
    [key: string]: Rule
  }
}

export const modeGameData: {
  starter: GameData
  advanced: GameData
} = {
  starter: {
    level: 'Iniciante',
    name: ['pedra', 'papel', 'tesoura'],
    description: 'O Pedra, papel e tesouro que voce ja conhece.',
    options: [
      {
        name: 'pedra',
        value: '1',
        icon: '/icons/icon-rock.svg'
      },
      {
        name: 'papel',
        value: '2',
        icon: '/icons/icon-paper.svg'
      },
      {
        name: 'tesoura',
        value: '3',
        icon: '/icons/icon-tesoura.svg'
      }
    ],
    rules: {
      pedra: {
        pedra: 'Empate',
        papel: 'Derrota',
        tesoura: 'Vitoria'
      },
      papel: {
        pedra: 'Vitoria',
        papel: 'Empate',
        tesoura: 'Derrota'
      },
      tesoura: {
        pedra: 'Derrota',
        papel: 'Vitoria',
        tesoura: 'Empate'
      }
    }
  },
  advanced: {
    level: 'Avançado',
    name: ['pedra', 'papel', 'tesoura', 'lagarto', 'spock'],
    description: 'A brilhante versão do Sheldon',
    options: [
      {
        name: 'pedra',
        value: '1',
        icon: '/icons/icon-rock.svg'
      },
      {
        name: 'papel',
        value: '2',
        icon: '/icons/icon-paper.svg'
      },
      {
        name: 'tesoura',
        value: '3',
        icon: '/icons/icon-tesoura.svg'
      },
      {
        name: 'lagarto',
        value: '4',
        icon: '/icons/icon-lagarto.svg'
      },
      {
        name: 'spock',
        value: '5',
        icon: '/icons/icon-spock.svg'
      }
    ],
    rules: {
      pedra: {
        pedra: 'Empate',
        papel: 'Derrota',
        spock: 'Derrota',
        tesoura: 'Vitoria',
        lagarto: 'Vitoria'
      },
      papel: {
        pedra: 'Vitoria',
        spock: 'Vitoria',
        papel: 'Empate',
        tesoura: 'Derrota',
        lagarto: 'Derrota'
      },
      tesoura: {
        pedra: 'Derrota',
        spock: 'Derrota',
        papel: 'Vitoria',
        lagarto: 'Vitoria',
        tesoura: 'Empate'
      },
      lagarto: {
        pedra: 'Vitoria',
        spock: 'Vitoria',
        papel: 'Derrota',
        tesoura: 'Derrota',
        lagarto: 'Empate'
      },
      spock: {
        pedra: 'Derrota',
        lagarto: 'Derrota',
        spock: 'Empate',
        papel: 'Vitoria',
        tesoura: 'Vitoria'
      }
    }
  }
}
