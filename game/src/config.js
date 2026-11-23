// Ember Court — the four houses and the 24-card court deck.
// Every house is told apart by colour AND shape, never by text alone:
// Flame ▲ red, Tide ● blue, Thorn ◆ green, Stone ■ amber.
export const START_HP = 30;
export const MAX_EMBER = 10;
export const HAND_LIMIT = 7;
export const START_HAND = 4;
export const RESONANCE_BONUS = 2;

export const HOUSES = {
  flame: { name: 'Flame', glyph: '▲', color: '#c0392b' },
  tide: { name: 'Tide', glyph: '●', color: '#2471c8' },
  thorn: { name: 'Thorn', glyph: '◆', color: '#1e8449' },
  stone: { name: 'Stone', glyph: '■', color: '#b7791f' },
};

// kind: strike = damage only; guard = damage + block equal to power; draw = damage + draw a card.
export const CARDS = [
  { id: 'cinder-imp', name: 'Cinder Imp', house: 'flame', cost: 1, power: 2, kind: 'strike', text: 'A spark with teeth.' },
  { id: 'ember-lash', name: 'Ember Lash', house: 'flame', cost: 2, power: 4, kind: 'strike', text: 'A whip of live coal.' },
  { id: 'pyre-hound', name: 'Pyre Hound', house: 'flame', cost: 3, power: 5, kind: 'strike', text: 'It hunts in the smoke.' },
  { id: 'ash-phoenix', name: 'Ash Phoenix', house: 'flame', cost: 4, power: 6, kind: 'draw', text: 'Burns, falls, rises. Draw 1.' },
  { id: 'coal-serpent', name: 'Coal Serpent', house: 'flame', cost: 3, power: 4, kind: 'guard', text: 'Coils of hot iron. Block 4.' },
  { id: 'bonfire-oath', name: 'Bonfire Oath', house: 'flame', cost: 5, power: 8, kind: 'strike', text: 'Sworn on the tallest flame.' },
  { id: 'mist-eel', name: 'Mist Eel', house: 'tide', cost: 1, power: 2, kind: 'draw', text: 'Slips through the fog. Draw 1.' },
  { id: 'riptide', name: 'Riptide', house: 'tide', cost: 2, power: 3, kind: 'guard', text: 'Pulls you under. Block 3.' },
  { id: 'deep-current', name: 'Deep Current', house: 'tide', cost: 3, power: 5, kind: 'draw', text: 'Cold and patient. Draw 1.' },
  { id: 'foam-knight', name: 'Foam Knight', house: 'tide', cost: 2, power: 4, kind: 'guard', text: 'Armour of salt spray. Block 4.' },
  { id: 'tidecaller', name: 'Tidecaller', house: 'tide', cost: 4, power: 6, kind: 'strike', text: 'The moon answers her.' },
  { id: 'stillwater', name: 'Stillwater', house: 'tide', cost: 5, power: 7, kind: 'guard', text: 'Calm on top, deep below. Block 7.' },
  { id: 'briar-wolf', name: 'Briar Wolf', house: 'thorn', cost: 1, power: 3, kind: 'strike', text: 'Thorns for fur, hunger for eyes.' },
  { id: 'vine-snare', name: 'Vine Snare', house: 'thorn', cost: 2, power: 3, kind: 'guard', text: 'The garden fights back. Block 3.' },
  { id: 'thornbloom', name: 'Thornbloom', house: 'thorn', cost: 3, power: 5, kind: 'strike', text: 'Beautiful until it opens.' },
  { id: 'root-golem', name: 'Root Golem', house: 'thorn', cost: 4, power: 5, kind: 'guard', text: 'Older than the court. Block 5.' },
  { id: 'spore-witch', name: 'Spore Witch', house: 'thorn', cost: 3, power: 4, kind: 'draw', text: 'Her laugh grows mushrooms. Draw 1.' },
  { id: 'wildseed', name: 'Wildseed', house: 'thorn', cost: 5, power: 8, kind: 'draw', text: 'Plant it and run. Draw 1.' },
  { id: 'pebble-guard', name: 'Pebble Guard', house: 'stone', cost: 1, power: 1, kind: 'guard', text: 'Small. Unmoved. Block 1.' },
  { id: 'granite-fist', name: 'Granite Fist', house: 'stone', cost: 2, power: 4, kind: 'strike', text: 'A handshake you feel for days.' },
  { id: 'quarry-ox', name: 'Quarry Ox', house: 'stone', cost: 3, power: 4, kind: 'guard', text: 'It carries the mountain. Block 4.' },
  { id: 'obsidian-blade', name: 'Obsidian Blade', house: 'stone', cost: 4, power: 7, kind: 'strike', text: 'Glass-sharp, night-dark.' },
  { id: 'mountain-oath', name: 'Mountain Oath', house: 'stone', cost: 5, power: 6, kind: 'guard', text: 'The mountain keeps its word. Block 6.' },
  { id: 'dust-titan', name: 'Dust Titan', house: 'stone', cost: 5, power: 9, kind: 'strike', text: 'It remembers when this was sea.' },
];

export const CARD_BY_ID = Object.fromEntries(CARDS.map((c) => [c.id, c]));

/** A 30-card deck: the 24 court cards plus a second copy of the six cheapest. */
export function buildDeckIds() {
  const ids = CARDS.map((c) => c.id);
  for (const c of CARDS) if (c.cost <= 2) ids.push(c.id);
  return ids;
}
