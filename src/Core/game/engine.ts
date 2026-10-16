export type Choice = 'pedra' | 'papel' | 'tesoura' | 'lagarto' | 'spock'
export type Result = 'Vitoria' | 'Derrota' | 'Empate'
const wins: Record<Choice, Choice[]> = {
  pedra: ['tesoura', 'lagarto'],
  papel: ['pedra', 'spock'],
  tesoura: ['papel', 'lagarto'],
  lagarto: ['papel', 'spock'],
  spock: ['pedra', 'tesoura']
}
export function calculateResult(player: Choice, opponent: Choice): Result {
  if (player === opponent) return 'Empate'
  return wins[player].includes(opponent) ? 'Vitoria' : 'Derrota'
}
export function roundWinner(
  player: Choice | null,
  opponent: Choice | null
): 'player' | 'opponent' | 'draw' {
  if (!player && !opponent) return 'draw'
  if (!player) return 'opponent'
  if (!opponent) return 'player'
  const result = calculateResult(player, opponent)
  return result === 'Vitoria' ? 'player' : result === 'Derrota' ? 'opponent' : 'draw'
}
