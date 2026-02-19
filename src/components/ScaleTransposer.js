import React from 'react';
import { CHROMATIC, ALL_MODES } from '../constants';
import { findMatchingModes } from '../utils';

function ScaleTransposer({ 
  rootNote, 
  setRootNote, 
  currentModeName, 
  setCurrentModeName, 
  setIntervals, 
  currentScaleNotes, 
  chordNotes 
}) {
  const applyPreset = (arr, modeName) => {
    setIntervals(arr);
    setCurrentModeName(modeName);
  };

  return (
    <div className="container">
      <h1>Scale Transposer</h1>
      <p className="source-attribution">Source: <a href="https://en.wikipedia.org/wiki/Mode_(music)#Modern_diatonic_modes" target="_blank" rel="noreferrer">Mode (music), Wikipedia</a></p>
      <div className="row">
        <select value={rootNote} onChange={(e) => setRootNote(parseInt(e.target.value))}>
          {CHROMATIC.map((note, i) => <option key={i} value={i}>{note}</option>)}
        </select>
        {Object.keys(ALL_MODES).map(mode => (
          <button key={mode} className="preset-btn" onClick={() => applyPreset(ALL_MODES[mode], mode)}>{mode}</button>
        ))}
      </div>
      <div id="scaleDisplay" style={{ background: '#121212', padding: '15px', borderRadius: '8px', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '2px' }}>
        <div style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{CHROMATIC[rootNote]} {currentModeName}: {currentScaleNotes.join(" — ")}</div>
        <div style={{ color: '#777', fontSize: '0.85rem', marginTop: '8px', fontStyle: 'italic', fontWeight: 'normal', letterSpacing: '1px' }}>
          Relative Modes: {findMatchingModes(currentScaleNotes)}
        </div>
        {chordNotes && (
          <>
            <div style={{ margin: '15px 0 8px 0', color: '#555', fontSize: '0.9rem' }}>↓ Translates to ↓</div>
            <div style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{chordNotes.scale2Name}: {chordNotes.notes2.join(" — ")}</div>
            <div style={{ color: '#777', fontSize: '0.85rem', marginTop: '8px', fontStyle: 'italic', fontWeight: 'normal', letterSpacing: '1px' }}>
              Relative Modes: {chordNotes.matches2}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ScaleTransposer;
