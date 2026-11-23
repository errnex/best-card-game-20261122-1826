// Mouse and keyboard input for Ember Court.
import { PHASE_PLAY } from './state.js';

/**
 * Wire clicks and keys. `actions` carries the game's verbs:
 * playCard(index), endTurn(), restart().
 */
export function bindInput(actions) {
  document.getElementById('youHand').addEventListener('click', (event) => {
    const cardEl = event.target.closest('[data-hand-index]');
    if (!cardEl) return;
    actions.playCard(Number(cardEl.dataset.handIndex));
  });

  document.getElementById('endTurnBtn').addEventListener('click', () => actions.endTurn());

  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key >= '1' && key <= '7') {
      actions.playCard(Number(key) - 1);
    } else if (key === 'e') {
      actions.endTurn();
    } else if (key === 'r') {
      actions.restart();
    }
  });
}

/** True while the human may act: playing phase and the player's turn. */
export function humanMayAct(game) {
  return game.phase === PHASE_PLAY && game.actor === 'you';
}
