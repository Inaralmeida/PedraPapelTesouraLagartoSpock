# Multiplayer setup (work in progress)

1. Enable Authentication > Providers > Anonymous Sign-ins.
2. Run `supabase/migrations/20261016_multiplayer.sql` in the Supabase SQL Editor.
3. Copy `.env.example` to `.env.local` and set the project URL and publishable key.
4. Run `npm install` (refreshes package-lock.json) then `npm run build` and `npm run dev`.
5. Test with two different browser profiles, one creating a room and the other joining by code/link.

## Notes
- The client polls RPC every 500ms; this MVP does not yet use Supabase Realtime subscriptions.
- The SQL uses security-definer RPC functions; tables are not directly readable by clients to prevent revealing hidden choices.
- The first round starts when the second player joins; later rounds start after the prior round resolves.
- If both players time out, the round advances without points.
- The game ends when one player reaches three victories; ties can require more than five rounds.
- Do not merge until migration, build, and two-browser testing pass.
- There is no rematch or disconnect grace-period implementation yet.
