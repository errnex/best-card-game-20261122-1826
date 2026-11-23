// Screenshot scenes for ?shot=title|play|win|loss.
// Each one plays the REAL rules forward from a fresh seeded game, steered by a
// simple autopilot (play the best affordable card, end the turn), so the frame
// is what a short game really looks like — and the same seed always gives the
// same frame. Win/loss scenes start the loser at 4 HP so the autopilot
// finishes the duel through real card play.
import { CARD_BY_ID } from './config.js';
import { chooseNextCard } from './ai.js';
import { createGame, endTurn, playCard, startGame } from './state.js';

const PLAY_TURNS = 5;

/** Play one side's turn with the autopilot until it holds, then pass. */
function autopilotTurn(game, side, enemy, who) {
  for (let guard = 0; guard < 12; guard += 1) {
    let best = -1;
    let bestScore = -Infinity;
    for (let i = 0; i < side.hand.length; i += 1) {
      const card = CARD_BY_ID[side.hand[i]];
      if (card.cost > side.ember) continue;
      const score = card.power / card.cost + (side.lastHouse === card.house ? 1.2 : 0);
      if (score > bestScore) { bestScore = score; best = i; }
    }
    if (best === -1) break;
    playCard(game, side, enemy, best, who);
    if (game.phase !== 'play') return;
  }
  endTurn(game);
}

/**
 * Stage the named scene on a fresh game and return the game.
 * title: fresh table on the title screen. play: five turns in, mid-duel.
 * win: the autopilot beats the Warden. loss: the Warden beats the autopilot.
 */
export function stageShot(name, seed) {
  const game = createGame(seed);
  if (name !== 'play' && name !== 'win' && name !== 'loss') return game;
  if (name === 'win') game.foe.hp = 8;
  if (name === 'loss') game.you.hp = 8;
  startGame(game);
  for (let turn = 0; turn < 40 && game.phase === 'play'; turn += 1) {
    if (name === 'play' && turn >= PLAY_TURNS) break;
    autopilotTurn(game, game.you, game.foe, 'You');
    if (game.phase !== 'play') break;
    // The Warden plays through its own chooser, one card at a time.
    for (let guard = 0; guard < 12 && game.phase === 'play'; guard += 1) {
      const index = chooseNextCard(game);
      if (index === -1) break;
      playCard(game, game.foe, game.you, index, 'The Warden');
    }
    if (game.phase !== 'play') break;
    endTurn(game);
  }
  return game;
}
