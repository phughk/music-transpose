import React from 'react';
import { CHROMATIC, INTERVAL_EMOTIONS } from '../constants';

function IntervalEmotionMatrix({ rootNote, audioCtxRef }) {
  const sourceNoteName = CHROMATIC[rootNote];

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
      osc.frequency.setValueAtTime(freq, time + (i * 0.4)); // Stagger the notes

      gain.gain.setValueAtTime(0, time + (i * 0.4));
      gain.gain.linearRampToValueAtTime(0.2, time + (i * 0.4) + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + (i * 0.4) + duration);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start(time + (i * 0.4));
      osc.stop(time + (i * 0.4) + duration);
    });
  };

  return (
    <div className="container">
      <h1>Interval Emotion Matrix</h1>
      <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
        Explore the emotional relationship between <strong>{sourceNoteName}</strong> and every other note, both up and down.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px', marginTop: '20px' }}>
        {INTERVAL_EMOTIONS.map((interval) => {
          const upNote = CHROMATIC[(rootNote + interval.semitones) % 12];
          const downNote = CHROMATIC[(rootNote - interval.semitones + 12) % 12];

          return (
            <div key={interval.semitones} className="track-card" style={{ borderLeft: '4px solid var(--accent)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>{interval.name} ({interval.semitones}st)</span>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '0.85rem', color: '#fff' }}><strong>Up to {upNote}:</strong></div>
                <div style={{ fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic' }}>{interval.up}</div>
                <button 
                  onClick={() => playInterval(interval.semitones, true)} 
                  style={{ background: '#333', color: 'white', padding: '4px 8px', fontSize: '0.7rem', marginTop: '5px' }}
                >
                  🔊 Play {sourceNoteName} ➔ {upNote}
                </button>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', color: '#fff' }}><strong>Down to {downNote}:</strong></div>
                <div style={{ fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic' }}>{interval.down}</div>
                <button 
                  onClick={() => playInterval(interval.semitones, false)} 
                  style={{ background: '#333', color: 'white', padding: '4px 8px', fontSize: '0.7rem', marginTop: '5px' }}
                >
                  🔊 Play {sourceNoteName} ➔ {downNote}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IntervalEmotionMatrix;
