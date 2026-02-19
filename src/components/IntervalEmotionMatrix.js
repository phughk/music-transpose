import React, { useState } from 'react';
import { CHROMATIC, INTERVAL_EMOTIONS } from '../constants';

function IntervalEmotionMatrix({ rootNote, audioCtxRef }) {
  const [selectedIntervalIdx, setSelectedIntervalIdx] = useState(0);
  const sourceNoteName = CHROMATIC[rootNote];
  const interval = INTERVAL_EMOTIONS[selectedIntervalIdx];

  const playInterval = (semitones, isUp) => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

    const time = audioCtxRef.current.currentTime;
    const duration = 1.0;
    const rootMidi = 60 + rootNote;
    const targetMidi = isUp ? rootMidi + semitones : rootMidi - semitones;

    [rootMidi, targetMidi].forEach((midi, i) => {
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + (i * 0.4));

      gain.gain.setValueAtTime(0, time + (i * 0.4));
      gain.gain.linearRampToValueAtTime(0.2, time + (i * 0.4) + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + (i * 0.4) + duration);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start(time + (i * 0.4));
      osc.stop(time + (i * 0.4) + duration);
    });
  };

  const upNote = CHROMATIC[(rootNote + interval.semitones) % 12];
  const downNote = CHROMATIC[(rootNote - interval.semitones + 12) % 12];

  return (
    <div className="container">
      <h1>Interval Emotion Matrix</h1>
      <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
        Explore the emotional relationship between <strong>{sourceNoteName}</strong> and another note.
      </p>

      <div className="row" style={{ background: '#1f1f1f', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--accent)', marginTop: '20px' }}>
        <div className="input-group" style={{ flex: 1 }}>
          <label>Select Interval</label>
          <select 
            value={selectedIntervalIdx} 
            onChange={(e) => setSelectedIntervalIdx(parseInt(e.target.value))}
            style={{ width: '100%', fontSize: '1rem' }}
          >
            {INTERVAL_EMOTIONS.map((int, idx) => (
              <option key={idx} value={idx}>{int.name} ({int.semitones}st)</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
        <div className="track-card" style={{ borderLeft: '4px solid var(--secondary)', margin: 0 }}>
          <div style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '8px' }}>
            <strong>Ascending: {sourceNoteName} ➔ {upNote}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#aaa', fontStyle: 'italic', marginBottom: '12px', minHeight: '40px' }}>
            {interval.up}
          </div>
          <button 
            onClick={() => playInterval(interval.semitones, true)} 
            style={{ width: '100%', background: 'var(--secondary)', color: 'black' }}
          >
            🔊 Play Up
          </button>
        </div>

        <div className="track-card" style={{ borderLeft: '4px solid #cf6679', margin: 0 }}>
          <div style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '8px' }}>
            <strong>Descending: {sourceNoteName} ➔ {downNote}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#aaa', fontStyle: 'italic', marginBottom: '12px', minHeight: '40px' }}>
            {interval.down}
          </div>
          <button 
            onClick={() => playInterval(interval.semitones, false)} 
            style={{ width: '100%', background: '#cf6679', color: 'black' }}
          >
            🔊 Play Down
          </button>
        </div>
      </div>
    </div>
  );
}

export default IntervalEmotionMatrix;
