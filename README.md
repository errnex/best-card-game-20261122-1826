# Ember Court — a 24-card duel of four houses

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/errnex/best-card-game-20261122-1826/rank.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/errnex/best-card-game-20261122-1826/reward.svg)](https://make.fun/c/best-card-game-20261122-1826)

**Ember Court** is an original, complete card game that plays offline in a desktop browser from static files. You sit across the table from the **Warden of Cinders** and duel to 0 HP with a 24-card court deck.

## The game

- **24 unique cards in 4 houses** — Flame ▲ (red), Tide ● (blue), Thorn ◆ (green), Stone ■ (amber). Every house is told apart by colour *and* shape, never by text alone.
- **Ember economy** — each turn you gain +1 max ember (up to 10) and draw a card. Every card costs ember to play.
- **Resonance combos** — play two cards of the same house in one turn and the second hits **+2 harder**. Guard cards raise block; draw cards replace themselves.
- **A readable AI rival** — the Warden telegraphs its plan before it acts ("The Warden plans: Pyre Hound — strikes for 5"), guards when hurt, and holds ember for a finisher. You can read it and counter it.
- **Complete loop** — title screen, a table with your hand and the Warden's face-down hand, readable card values and costs, visible HP and ember, a win screen and a loss screen, each with the game's own numbers (turns, cards played, damage dealt, resonances).
- **Feel** — cards slide, snap and lift on hover; damage lands with a shake; the win arrives with a flourish; synthesized WebAudio blips (no audio files, no network).

## Controls

Mouse: click a card to play it, click END TURN. Keyboard: `1–7` play a card, `E` end turn, `R` restart.

## Play it

```sh
node serve.ts   # then open http://localhost:8080
```

## Layout

- `game/` — the playable game as static files (`index.html`, `styles.css`, `src/*.js`)
- `screenshots/` — 4 real renders of the game's own code (title, table, win, loss)
- `main.ts` — the entrypoint: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's library, unchanged
- `shots.json` — the four screenshot scenes (`?shot=title|play|win|loss&seed=7`)

## License

MIT — see [LICENSE](LICENSE).
