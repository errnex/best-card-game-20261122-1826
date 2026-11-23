// Ember Court — the rules. Pure state, no DOM: a turn is ember, cards, damage, block.
// Resonance: the second card of the same house in one turn hits +2 harder.
// Block soaks damage first and fades when its owner's next turn begins.
import { CARD_BY_ID, HAND_LIMIT, MAX_EMBER, RESONANCE_BONUS, START_HAND, START_HP } from './config.js';
import { drawCards, newDeck } from './deck.js';
import { createRng } from './random.js';

export const PHASE_TITLE = 'title';
export const PHASE_PLAY = 'play';
export const PHASE_WIN = 'win';
export const PHASE_LOSS = 'loss';

function newSide(rng) {
  return {
    hp: START_HP, maxHp: START_HP, block: 0,
    ember: 0, maxEmber: 0,
    deck: newDeck(rng), hand: [], discard: [],
    lastHouse: null, playedThisTurn: [],
    damageDealt: 0, cardsPlayed: 0,
  };
}

/** A fresh game, both sides dealt, waiting on the title screen. */
export function createGame(seed) {
  const rng = createRng(seed);
  const game = {
    seed, rng, turn: 1, phase: PHASE_TITLE, actor: 'you',
    you: newSide(rng), foe: newSide(rng),
    log: ['Welcome to the Ember Court. Press PLAY to take your seat.'],
    wins: 0, losses: 0, comboCount: 0,
  };
  drawCards(game.you, START_HAND, rng);
  drawCards(game.foe, START_HAND, rng);
  return game;
}

/** Deal the opening hands and start turn 1 for the player. */
export function startGame(game) {
  game.phase = PHASE_PLAY;
  game.actor = 'you';
  beginTurn(game, game.you, 'You');
  pushLog(game, 'Turn 1 — you hold the first ember. Play a card, or end your turn.');
}

function beginTurn(game, side, who) {
  side.maxEmber = Math.min(MAX_EMBER, side.maxEmber + 1);
  side.ember = side.maxEmber;
  side.block = 0;
  side.lastHouse = null;
  side.playedThisTurn = [];
  const drawn = drawCards(side, 1, game.rng);
  if (drawn > 0) pushLog(game, `${who} draw${who === 'You' ? '' : 's'} a card.`);
}

/** Deal damage to a side: block soaks first, the rest hits life. Returns life lost. */
export function dealDamage(game, target, amount, sourceName) {
  const soaked = Math.min(target.block, amount);
  target.block -= soaked;
  const life = amount - soaked;
  target.hp = Math.max(0, target.hp - life);
  if (soaked > 0) pushLog(game, `${sourceName} hits for ${amount} — block soaks ${soaked}, ${life} gets through.`);
  return life;
}

/**
 * Play the card at `handIndex` from `side` against `enemy`.
 * Returns false when the card cannot be played (not your turn, not enough ember).
 */
export function playCard(game, side, enemy, handIndex, who) {
  if (game.phase !== PHASE_PLAY) return false;
  const id = side.hand[handIndex];
  if (id === undefined) return false;
  const card = CARD_BY_ID[id];
  if (side.ember < card.cost) return false;

  const resonance = side.lastHouse === card.house;
  const power = card.power + (resonance ? RESONANCE_BONUS : 0);
  side.ember -= card.cost;
  side.hand.splice(handIndex, 1);
  side.discard.push(id);
  side.cardsPlayed += 1;
  side.playedThisTurn.push({ ...card, power, resonance });
  side.lastHouse = card.house;

  if (resonance) {
    game.comboCount += 1;
    pushLog(game, `RESONANCE! A second ${card.house} card strikes +${RESONANCE_BONUS} harder.`);
  }
  const life = dealDamage(game, enemy, power, `${who} play${who === 'You' ? '' : 's'} ${card.name}`);
  side.damageDealt += life;
  pushLog(game, `${who} play${who === 'You' ? '' : 's'} ${card.name} (${power} damage).`);
  if (card.kind === 'guard') {
    side.block += card.power;
    pushLog(game, `${who} raise${who === 'You' ? '' : 's'} ${card.power} block.`);
  }
  if (card.kind === 'draw') {
    const drawn = drawCards(side, 1, game.rng);
    if (drawn > 0 && side.hand.length <= HAND_LIMIT) pushLog(game, `${who} draw${who === 'You' ? '' : 's'} a card.`);
  }
  checkEnd(game);
  return true;
}

/** End the current side's turn and hand the table to the other side. */
export function endTurn(game) {
  if (game.phase !== PHASE_PLAY) return;
  if (game.actor === 'you') {
    game.actor = 'foe';
    beginTurn(game, game.foe, 'The Warden');
  } else {
    game.actor = 'you';
    game.turn += 1;
    beginTurn(game, game.you, 'You');
  }
}

function checkEnd(game) {
  if (game.foe.hp <= 0 && game.phase === PHASE_PLAY) {
    game.phase = PHASE_WIN;
    game.wins += 1;
    pushLog(game, 'The Warden falls. The Ember Court is yours!');
  } else if (game.you.hp <= 0 && game.phase === PHASE_PLAY) {
    game.phase = PHASE_LOSS;
    game.losses += 1;
    pushLog(game, 'Your ember gutters out. The Warden keeps the court.');
  }
}

export function pushLog(game, text) {
  game.log.push(text);
  if (game.log.length > 40) game.log.splice(0, game.log.length - 40);
}

/** One-line summary for the win / loss screen — countable proof of a finished game. */
export function gameSummary(game) {
  return `Turns ${game.turn} · ${game.you.cardsPlayed} cards played · ${game.you.damageDealt} damage dealt · ${game.comboCount} resonances`;
}
