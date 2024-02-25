// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const modeGameData: any = {
  starter: {
    level: 'Iniciante',
    name: 'Pedra papel tesoura',
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
    name: 'Pedra papel tesoura lagarto spock',
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

export const descriptionRules: {
  [key: string]: {
    description: string
    op1: string
    op2: string
    win: string
  }
} = {
  papelpedra: {
    description: 'Papel cobre pedra',
    op1: 'Papel',
    op2: 'Pedra',
    win: 'Papel'
  },
  tesourapapel: {
    description: 'Tesoura corta papel',
    op1: 'Tesoura',
    op2: 'Papel',
    win: 'Tesoura'
  },
  pedralagarto: {
    description: 'Pedra esmaga lagarto',
    op1: 'Pedra',
    op2: 'Lagarto',
    win: 'Pedra'
  },
  lagartospock: {
    description: 'Lagarto envenena Spock',
    op1: 'Lagarto',
    op2: 'Spock',
    win: 'Lagarto'
  },
  spocktesoura: {
    description: 'Spock derrete tesoura',
    op1: 'Spock',
    op2: 'Tesoura',
    win: 'Spock'
  },
  tesouralagarto: {
    description: 'Tesoura decapita lagarto',
    op1: 'Tesoura',
    op2: 'Lagarto',
    win: 'Tesoura'
  },
  lagartopapel: {
    description: 'Lagarto come papel',
    op1: 'Lagarto',
    op2: 'Papel',
    win: 'Lagarto'
  },
  papelspock: {
    description: 'Papel refuta Spock',
    op1: 'Papel',
    op2: 'Spock',
    win: 'Papel'
  },
  spockpedra: {
    description: 'Spock vaporiza pedra',
    op1: 'Spock',
    op2: 'Pedra',
    win: 'Spock'
  },
  pedratesoura: {
    description: 'Pedra quebra tesoura',
    op1: 'Pedra',
    op2: 'Tesoura',
    win: 'Pedra'
  }
}
