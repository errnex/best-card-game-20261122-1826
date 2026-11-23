// Ember Court — draws the whole table from state: hands, HP, ember, log, screens.
import { CARD_BY_ID, HOUSES } from './config.js';
import { PHASE_LOSS, PHASE_PLAY, PHASE_TITLE, PHASE_WIN, gameSummary } from './state.js';

const $ = (id) => document.getElementById(id);

/** One card face, as HTML. `playable` dims it when its cost is out of reach. */
export function cardHtml(card, power, opts = {}) {
  const house = HOUSES[card.house];
  const kindLine = card.kind === 'guard' ? `Strike ${power} · Block ${card.power}`
    : card.kind === 'draw' ? `Strike ${power} · Draw 1`
    : `Strike ${power}`;
  return `<div class="card ${opts.extraClass ?? ''}" style="--house:${house.color}" ${opts.attrs ?? ''}>
    <div class="cost">${card.cost}</div>
    <div class="house-tag">${house.glyph} ${house.name}</div>
    <div class="glyph">${house.glyph}</div>
    <div class="name">${card.name}</div>
    <div class="power">${power}<small>${kindLine}</small></div>
    <div class="flavour">${card.text}</div>
  </div>`;
}

function hpFill(el, textEl, side) {
  const pct = Math.max(0, (side.hp / side.maxHp) * 100);
  el.style.width = `${pct}%`;
  textEl.textContent = `${side.hp} / ${side.maxHp} HP`;
}

function emberPips(game) {
  let html = '🔥'.repeat(0);
  for (let i = 0; i < game.you.maxEmber; i += 1) {
    html += `<span class="ember-pip ${i < game.you.ember ? 'lit' : ''}"></span>`;
  }
  return `${html} <span>${game.you.ember}/${game.you.maxEmber} ember</span>`;
}

/** Rebuild the table from the current game state. */
export function render(game) {
  $('turnBadge').textContent = `Turn ${game.turn}`;
  $('emberBox').innerHTML = emberPips(game);
  $('scoreBox').textContent = `Wins ${game.wins} · Losses ${game.losses}`;
  hpFill($('foeHpFill'), $('foeHpText'), game.foe);
  hpFill($('youHpFill'), $('youHpText'), game.you);
  $('foeBlock').textContent = game.foe.block > 0 ? `🛡 ${game.foe.block} block` : '';
  $('youBlock').textContent = game.you.block > 0 ? `🛡 ${game.you.block} block` : '';
  $('foeIntent').textContent = game.phase === PHASE_PLAY && game.actor === 'foe'
    ? '— thinking…' : '';

  $('foeHand').innerHTML = game.foe.hand.map(() => '<div class="mini-card">?</div>').join('');

  $('playedFoe').innerHTML = game.foe.playedThisTurn
    .map((c) => cardHtml(c, c.power, { extraClass: 'foe-played' })).join('');
  $('playedYou').innerHTML = game.you.playedThisTurn
    .map((c) => cardHtml(c, c.power, { extraClass: 'just-played' })).join('');

  $('youHand').innerHTML = game.you.hand.map((id, i) => {
    const card = CARD_BY_ID[id];
    const affordable = card.cost <= game.you.ember && game.phase === PHASE_PLAY && game.actor === 'you';
    return cardHtml(card, card.power + (game.you.lastHouse === card.house ? 2 : 0), {
      extraClass: affordable ? '' : 'unaffordable',
      attrs: `data-hand-index="${i}" title="${affordable ? 'Click to play (or press ' + (i + 1) + ')' : 'Needs ' + card.cost + ' ember'}"`,
    });
  }).join('');

  $('logBox').innerHTML = game.log.slice(-9).map((l) => `<div>${l}</div>`).join('');
  $('comboBanner').textContent = game.comboCount > 0 && game.phase === PHASE_PLAY
    ? `🔥 ${game.comboCount} resonance${game.comboCount > 1 ? 's' : ''} this game — same house twice, +2 damage`
    : '';

  const endBtn = $('endTurnBtn');
  endBtn.disabled = !(game.phase === PHASE_PLAY && game.actor === 'you');
  endBtn.textContent = game.actor === 'foe' ? 'WARDEN IS PLAYING…' : 'END TURN  [E]';
}

/** Title screen overlay. */
export function showTitle(game) {
  const overlay = $('overlay');
  const card = $('overlayCard');
  overlay.classList.remove('hidden');
  card.innerHTML = `
    <h1>EMBER COURT</h1>
    <p class="big">A 24-card duel of four houses. Outlast the Warden of Cinders.</p>
    <div class="houses">
      <span style="color:#e57373;border-color:#e57373">▲ Flame</span>
      <span style="color:#64b5f6;border-color:#64b5f6">● Tide</span>
      <span style="color:#81c784;border-color:#81c784">◆ Thorn</span>
      <span style="color:#ffca66;border-color:#ffca66">■ Stone</span>
    </div>
    <p>Each turn you gain ember and draw a card. Play cards to strike the Warden — play two of the same house in one turn and the second hits <b>+2 harder (Resonance)</b>. Guard cards raise block; some cards draw extra. First to 0 HP loses.</p>
    <p>The Warden telegraphs its plan — read it, and answer with the right house.</p>
    <button id="playBtn">▶&nbsp; TAKE YOUR SEAT</button>
    <div class="keys">Mouse: click a card to play · Keys: 1–7 play a card, E end turn, R restart</div>`;
  $('playBtn').addEventListener('click', () => window.__emberStart());
}

/** Win screen overlay, with the game's own numbers. */
export function showWin(game) {
  const card = $('overlayCard');
  $('overlay').classList.remove('hidden');
  card.classList.add('win-flourish');
  card.innerHTML = `
    <h2>🏆 THE COURT IS YOURS!</h2>
    <p class="big">The Warden of Cinders bows. Your ember burns brightest.</p>
    <p class="stats">${gameSummary(game)}</p>
    <p class="stats">Final score — You ${game.you.hp} HP · Warden 0 HP</p>
    <button id="againBtn">↻&nbsp; PLAY AGAIN</button>
    <div class="keys">Press R to play again</div>`;
  $('againBtn').addEventListener('click', () => window.__emberRestart());
}

/** Loss screen overlay, with the game's own numbers. */
export function showLoss(game) {
  const card = $('overlayCard');
  $('overlay').classList.remove('hidden');
  card.innerHTML = `
    <h2>💀 THE WARDEN KEEPS THE COURT</h2>
    <p class="big">Your ember gutters out — but the court remembers a good duel.</p>
    <p class="stats">${gameSummary(game)}</p>
    <p class="stats">Final score — You 0 HP · Warden ${game.foe.hp} HP</p>
    <button id="againBtn">↻&nbsp; CHALLENGE AGAIN</button>
    <div class="keys">Press R to challenge again</div>`;
  $('againBtn').addEventListener('click', () => window.__emberRestart());
}

/** Hide any overlay (used when a game starts or restarts). */
export function hideOverlay() {
  $('overlay').classList.add('hidden');
  $('overlayCard').classList.remove('win-flourish');
}
