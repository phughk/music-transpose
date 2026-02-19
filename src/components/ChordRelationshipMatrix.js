import React from 'react';
import { CHROMATIC, CHORD_RELATIONSHIP_DATA } from '../constants';

function ChordRelationshipMatrix({ 
  spectrum, 
  emotion, 
  chordRel, 
  syncChordData, 
  chordNotes, 
  rootNote, 
  currentModeName 
}) {
  return (
    <div className="container">
      <h1>Chord Relationship Matrix</h1>
      <p style={{ fontSize: '0.9rem', color: '#aaa' }}>Select a chord, emotion, or spectrum. The Scale Transposer will automatically update to show the transition.</p>
      <p className="source-attribution">Source: <a href="https://www.tabletopcomposer.com/post/chord-relationships-and-emotion" target="_blank" rel="noreferrer">Stephen Berkemeier, Tabletop Composer</a></p>

      <div className="chord-matrix-container">
        <div className="chord-selectors">
          <div className="input-group">
            <label style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Spectrum</label>
            <select value={spectrum} onChange={(e) => syncChordData('spectrum', e.target.value)}>
              {[...new Set(CHORD_RELATIONSHIP_DATA.map(item => item.spectrum))].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>Emotion</label>
            <select value={emotion} onChange={(e) => syncChordData('emotion', e.target.value)}>
              {[...new Set(CHORD_RELATIONSHIP_DATA.map(item => item.emotion))].map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label style={{ color: 'white', fontWeight: 'bold' }}>Chord Relationship</label>
            <select value={chordRel} onChange={(e) => syncChordData('chord', e.target.value)}>
              {[...new Set(CHORD_RELATIONSHIP_DATA.map(item => item.chord))].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="chord-notes-display">
          {chordNotes && (
            <>
              <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px dashed #444' }}>
                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Logical Base ({CHROMATIC[rootNote]} {currentModeName.split(' ')[0]})
                </div>
                <span className="chord-name">{chordNotes.chord1.name}</span> <span className="chord-spelling">({chordNotes.chord1.spelling})</span>
                <span style={{ margin: '0 15px', color: 'white' }}>➔</span>
                <span className="chord-name">{chordNotes.chord2.name}</span> <span className="chord-spelling">({chordNotes.chord2.spelling})</span>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Derived Relative ({CHROMATIC[chordNotes.relRootIndex]} {chordNotes.isMinor ? 'Minor' : 'Major'})
                </div>
                <span className="chord-name">{chordNotes.relChord1.name}</span> <span className="chord-spelling">({chordNotes.relChord1.spelling})</span>
                <span style={{ margin: '0 15px', color: 'white' }}>➔</span>
                <span className="chord-name">{chordNotes.relChord2.name}</span> <span className="chord-spelling">({chordNotes.relChord2.spelling})</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChordRelationshipMatrix;
