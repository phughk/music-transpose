import React, { useState } from 'react';
import { CHROMATIC, EXTENDED_CHORDS } from '../constants';

function ChordDictionaryVisualizer({ audioCtxRef }) {
  const [dictRoot, setDictRoot] = useState(0);
  const [dictQuality, setDictQuality] = useState("Major");

  const playCurrentChord = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

    const chordData = EXTENDED_CHORDS[dictQuality];
    const time = audioCtxRef.current.currentTime;
    const duration = 2.0;

    chordData.intervals.forEach(interval => {
      const midiNote = 60 + dictRoot + interval;
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.15, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start(time);
      osc.stop(time + duration);
    });
  };

  return (
    <div className="container">
      <h1>Chord Dictionary Visualizer</h1>
      <p style={{ fontSize: '0.9rem', color: '#aaa' }}>Explore all standard chord qualities, their interval structures, and how they feel.</p>

      <div className="row" style={{ background: '#1f1f1f', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #03dac6', alignItems: 'flex-end' }}>
        <div className="input-group">
          <label>Root Note</label>
          <select value={dictRoot} onChange={(e) => setDictRoot(parseInt(e.target.value))}>
            {CHROMATIC.map((note, i) => <option key={i} value={i}>{note}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label>Chord Quality</label>
          <select value={dictQuality} onChange={(e) => setDictQuality(e.target.value)}>
            {Object.keys(EXTENDED_CHORDS).map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>
        <button onClick={playCurrentChord} style={{ background: 'var(--secondary)', color: 'black', padding: '8px 15px', marginBottom: '2px' }}>🔊 Play Chord</button>
      </div>

      <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#bbb', marginTop: '15px', fontSize: '1rem' }}>"{EXTENDED_CHORDS[dictQuality].desc}"</p>

      <div className="chord-visualizer">
        {Array.from({ length: 12 }).map((_, i) => {
          const isActive = EXTENDED_CHORDS[dictQuality].intervals.includes(i);
          const noteName = isActive ? CHROMATIC[(dictRoot + i) % 12] : '';
          return (
            <div key={i} className="chord-col">
              <div className="chord-idx">{i}</div>
              <div className={`chord-dot ${isActive ? 'active' : ''}`}></div>
              <div className="chord-note-label">{noteName}</div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '20px', fontSize: '1.3rem', textAlign: 'center', color: 'var(--accent)', fontWeight: 'bold', letterSpacing: '1px' }}>
        {CHROMATIC[dictRoot]} {dictQuality}: {EXTENDED_CHORDS[dictQuality].intervals.map(i => CHROMATIC[(dictRoot + i) % 12]).join(' - ')}
      </div>
    </div>
  );
}

export default ChordDictionaryVisualizer;
