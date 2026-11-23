// Tiny synthesized sounds — WebAudio oscillators, no audio files, no network.
let ctx = null;

function audio() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return ctx;
}

function blip(freq, seconds, type, gainValue) {
  const ac = audio();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainValue, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + seconds);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + seconds);
  } catch { /* sound is decoration; a failure never breaks the game */ }
}

/** A card snaps onto the table. */
export function soundPlay() { blip(660, 0.09, 'triangle', 0.12); }
/** A hit lands. */
export function soundHit() { blip(180, 0.16, 'sawtooth', 0.1); }
/** Ember refills at turn start. */
export function soundTurn() { blip(520, 0.12, 'sine', 0.08); }
/** The win flourish: a rising arpeggio. */
export function soundWin() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.22, 'triangle', 0.12), i * 130));
}
/** The loss: a low falling note. */
export function soundLoss() { blip(220, 0.5, 'sine', 0.12); setTimeout(() => blip(165, 0.6, 'sine', 0.1), 180); }
