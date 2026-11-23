// Ember Court — bootstrap. Runs the live game, or stages a screenshot scene
// when the page opens with ?shot=title|play|win|loss&seed=N.
import { playWardenTurn, wardenIntent } from './ai.js';
import { bindInput, humanMayAct } from './input.js';
import { hideOverlay, render, showLoss, showTitle, showWin } from './render.js';
import { stageShot } from './shots.js';
import { soundHit, soundLoss, soundPlay, soundTurn, soundWin } from './sound.js';
import { PHASE_LOSS, PHASE_PLAY, PHASE_TITLE, PHASE_WIN, createGame, endTurn, playCard, startGame } from './state.js';

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') ?? '7');

let game = shotName ? stageShot(shotName, seed) : createGame(seed);
let wardenBusy = false;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function refresh() {
  render(game);
  if (game.phase === PHASE_WIN) {
    showWin(game);
    soundWin();
  } else if (game.phase === PHASE_LOSS) {
    showLoss(game);
    soundLoss();
  }
  if (game.phase === PHASE_PLAY && game.actor === 'foe') {
    document.getElementById('foeIntent').textContent = `— ${wardenIntent(game)}`;
  }
}

async function runWardenTurn() {
  if (wardenBusy || game.phase !== PHASE_PLAY || game.actor !== 'foe') return;
  wardenBusy = true;
  await playWardenTurn(
    game,
    (index) => {
      playCard(game, game.foe, game.you, index, 'The Warden');
      soundHit();
    },
    () => refresh(),
    wait,
  );
  wardenBusy = false;
  if (game.phase === PHASE_PLAY && game.actor === 'foe') {
    endTurn(game);
    soundTurn();
    refresh();
  }
}

const actions = {
  playCard(index) {
    if (!humanMayAct(game) || wardenBusy) return;
    if (playCard(game, game.you, game.foe, index, 'You')) {
      soundPlay();
      refresh();
    }
  },
  endTurn() {
    if (!humanMayAct(game) || wardenBusy) return;
    endTurn(game);
    soundTurn();
    refresh();
    runWardenTurn();
  },
  restart() {
    game = createGame((seed + game.turn) % 100000);
    startGame(game);
    hideOverlay();
    refresh();
  },
};

window.__emberStart = () => {
  hideOverlay();
  startGame(game);
  refresh();
};
window.__emberRestart = () => actions.restart();

bindInput(actions);
if (shotName) {
  render(game);
  if (game.phase === PHASE_TITLE) showTitle(game);
  else if (game.phase === PHASE_WIN) showWin(game);
  else if (game.phase === PHASE_LOSS) showLoss(game);
  window.__shotReady = true;
} else {
  showTitle(game);
  render(game);
  window.__shotReady = true;
}
