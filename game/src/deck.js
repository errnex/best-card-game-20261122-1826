// Deck building, shuffling and drawing for one side of the table.
import { buildDeckIds } from './config.js';
import { shuffle } from './random.js';

/** A fresh shuffled deck of card ids for a new game. */
export function newDeck(rng) {
  return shuffle(rng, buildDeckIds());
}

/** Draw `count` cards from `side.deck` into `side.hand` (reshuffle discard when empty). */
export function drawCards(side, count, rng) {
  let drawn = 0;
  for (let i = 0; i < count; i += 1) {
    if (side.deck.length === 0) {
      if (side.discard.length === 0) break;
      side.deck = shuffle(rng, side.discard.splice(0));
    }
    side.hand.push(side.deck.pop());
    drawn += 1;
  }
  return drawn;
}
