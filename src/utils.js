import { CHROMATIC, ALL_MODES, INTERVAL_MAP } from './constants';

export function findMatchingModes(targetNotes) {
  const targetSet = new Set(targetNotes);
  let matches = [];

  for (let rootIdx = 0; rootIdx < 12; rootIdx++) {
    const rootName = CHROMATIC[rootIdx];
    for (const [modeName, modeIntervals] of Object.entries(ALL_MODES)) {
      const generatedNotes = modeIntervals.map(s => CHROMATIC[(rootIdx + s) % 12]);
      const generatedSet = new Set(generatedNotes);

      if (targetSet.size === generatedSet.size && [...targetSet].every(n => generatedSet.has(n))) {
        matches.push(`${rootName} ${modeName}`);
      }
    }
  }
  return matches.join("  |  ");
}

export function buildChord(rIdx, quality) {
  const thirdOffset = (quality === 'M') ? 4 : 3;
  const fifthOffset = 7;
  const rootNote = CHROMATIC[rIdx];
  const thirdNote = CHROMATIC[(rIdx + thirdOffset) % 12];
  const fifthNote = CHROMATIC[(rIdx + fifthOffset) % 12];
  return {
    name: `${rootNote} ${quality === 'M' ? 'Major' : 'minor'}`,
    spelling: `${rootNote} - ${thirdNote} - ${fifthNote}`
  };
}

export function checkGate(tick, on, total, offset) {
  if (!total || total <= 0) return true;
  const pos = (tick + (offset || 0)) % total;
  return pos < on;
}
