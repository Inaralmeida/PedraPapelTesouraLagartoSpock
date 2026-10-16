export type PlayerIdentity = { id: string; name: string }
const KEY = 'pptls.player'
export function getPlayer(): PlayerIdentity {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}')
    const id = typeof saved.id === 'string' && saved.id ? saved.id : crypto.randomUUID()
    const name = typeof saved.name === 'string' ? saved.name : ''
    const player = { id, name }
    localStorage.setItem(KEY, JSON.stringify(player))
    return player
  } catch {
    const player = { id: crypto.randomUUID(), name: '' }
    localStorage.setItem(KEY, JSON.stringify(player))
    return player
  }
}
export function savePlayerName(name: string): PlayerIdentity {
  const player = { ...getPlayer(), name: name.trim().slice(0, 24) }
  localStorage.setItem(KEY, JSON.stringify(player))
  return player
}
