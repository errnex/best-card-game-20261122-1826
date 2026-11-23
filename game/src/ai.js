// The Warden of Cinders — a readable opponent. It telegraphs its plan before it acts
// (the intent line above its portrait) and plays by rules a human can learn:
// guard when hurt, save ember for a big card when it cannot kill, otherwise hit hard.
import { CARD_BY_ID } from './config.js';

/** The Warden's next move, in plain words, shown before it plays. */
export function wardenIntent(game) {
  const pick = chooseNextCard(game);
  if (pick === -1) return 'The Warden holds its ember…';
  const card = CARD_BY_ID[game.foe.hand[pick]];
  const verb = card.kind === 'guard' ? 'raises a guard' : card.kind === 'draw' ? 'draws deeper' : 'strikes';
  return `The Warden plans: ${card.name} — ${verb} for ${card.power}.`;
}

/** Index of the next card the Warden should play, or -1 to hold. */
export function chooseNextCard(game) {
  const foe = game.foe;
  let best = -1;
  let bestScore = -Infinity;
  for (let i = 0; i < foe.hand.length; i += 1) {
    const card = CARD_BY_ID[foe.hand[i]];
    if (card.cost > foe.ember) continue;
    let score = card.power / card.cost;
    if (card.kind === 'guard' && foe.hp <= 12) score += 3;
    if (card.kind === 'draw') score += 0.6;
    if (foe.lastHouse === card.house) score += 1.2;
    if (card.power >= game.you.hp && card.cost <= foe.ember) score += 10;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  // Hold ember when nothing good is affordable and a big card is one turn away.
  if (best === -1) return -1;
  const card = CARD_BY_ID[foe.hand[best]];
  if (foe.ember - card.cost >= 2 && foe.hand.some((id) => CARD_BY_ID[id].cost === foe.ember - card.cost + 2)) {
    // Keep it simple: play anyway unless the hand holds a 5-cost finisher next turn.
    if (foe.hand.some((id) => CARD_BY_ID[id].cost >= 5 && CARD_BY_ID[id].cost > foe.ember)) return -1;
  }
  return best;
}

/** Play the Warden's whole turn, one card at a time, calling `onPlay` after each. */
export async function playWardenTurn(game, playOne, onPlay, wait) {
  for (;;) {
    const index = chooseNextCard(game);
    if (index === -1) break;
    await wait(420);
    if (game.phase !== 'play') break;
    playOne(index);
    onPlay();
    await wait(420);
  }
}
