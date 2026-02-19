import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GROOVE_PRESETS, CHROMATIC } from '../constants';
import { mulberry32 } from '../utils';

function GrooveMelodyGenerator({ 
  currentScaleMidi, 
  currentScaleNotes, 
  audioCtxRef,
  tsNum,
  tsDen,
  tsPattern
}) {
  const [selectedGroove, setSelectedGroove] = useState("Folk Happy");
  const [useVisualizerPattern, setUseVisualizerPattern] = useState(false);
  const [seed, setSeed] = useState(12345);
  const [bpm, setBpm] = useState(120);
  const [melody, setMelody] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTick, setCurrentTick] = useState(-1);

  const timerIDRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const melodyRef = useRef([]);
  const currentTickRef = useRef(0);
  const bpmRef = useRef(bpm);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  const generateMelody = useCallback(() => {
    const rng = mulberry32(seed);
    let pattern = [];

    if (useVisualizerPattern) {
      // Create a pattern based on the TS Visualizer
      // Every '1' in a group is a trigger
      const groups = tsPattern.split('+').map(Number);
      groups.forEach(groupSize => {
        pattern.push(1); // Accent at start of group
        for (let i = 1; i < groupSize; i++) {
          // Fill with optional notes or rests based on RNG
          pattern.push(rng() > 0.6 ? 1 : 0);
        }
      });
    } else {
      pattern = GROOVE_PRESETS[selectedGroove].pattern;
    }

    const newMelody = pattern.map((isTriggered) => {
      if (!isTriggered) return null;
      const degreeIdx = Math.floor(rng() * currentScaleMidi.length);
      return {
        degree: degreeIdx,
        midi: currentScaleMidi[degreeIdx],
        noteName: currentScaleNotes[degreeIdx]
      };
    });
    setMelody(newMelody);
    melodyRef.current = newMelody;
  }, [selectedGroove, useVisualizerPattern, seed, currentScaleMidi, currentScaleNotes, tsPattern]);

  useEffect(() => {
    generateMelody();
  }, [generateMelody]);

  const playTick = useCallback((tick, time, duration) => {
    const note = melodyRef.current[tick];
    if (!note) return;

    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440 * Math.pow(2, (note.midi - 69) / 12), time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.1, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.01);

    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);

    osc.start(time);
    osc.stop(time + duration);
  }, [audioCtxRef]);

  const schedule = useCallback(() => {
    const secondsPerTick = (60.0 / bpmRef.current) / 4;
    const len = melodyRef.current.length;
    if (len === 0) return;

    while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + 0.1) {
      const timeToPlay = nextNoteTimeRef.current;
      const tickToPlay = currentTickRef.current;
      
      playTick(tickToPlay, timeToPlay, secondsPerTick);

      const delay = (timeToPlay - audioCtxRef.current.currentTime) * 1000;
      setTimeout(() => {
        setCurrentTick(tickToPlay);
      }, Math.max(0, delay));

      currentTickRef.current = (currentTickRef.current + 1) % len;
      nextNoteTimeRef.current += secondsPerTick;
    }
    timerIDRef.current = setTimeout(schedule, 25);
  }, [audioCtxRef, playTick]);

  const togglePlay = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

    if (isPlaying) {
      setIsPlaying(false);
      clearTimeout(timerIDRef.current);
      setCurrentTick(-1);
    } else {
      setIsPlaying(true);
      currentTickRef.current = 0;
      nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.05;
      schedule();
    }
  };

  return (
    <div className="container">
      <h1>Groove & Melody Generator</h1>
      <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
        Deterministic melody generation based on rhythmic presets or the visualizer pattern.
      </p>

      <div className="row" style={{ background: '#1f1f1f', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
        <div className="input-group">
          <label>Source</label>
          <select value={useVisualizerPattern ? "visualizer" : "preset"} onChange={(e) => setUseVisualizerPattern(e.target.value === "visualizer")}>
            <option value="preset">Use Groove Preset</option>
            <option value="visualizer">Follow Time Signature Visualizer</option>
          </select>
        </div>

        {!useVisualizerPattern && (
          <div className="input-group">
            <label>Groove Preset</label>
            <select value={selectedGroove} onChange={(e) => setSelectedGroove(e.target.value)}>
              {Object.keys(GROOVE_PRESETS).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        )}

        {useVisualizerPattern && (
          <div className="input-group">
            <label>Current Pattern</label>
            <div style={{ background: '#333', padding: '6px', borderRadius: '4px', border: '1px solid #555' }}>
              {tsNum}/{tsDen} ({tsPattern})
            </div>
          </div>
        )}

        <div className="input-group">
          <label>Seed</label>
          <input 
            type="number" 
            value={seed} 
            onChange={(e) => setSeed(parseInt(e.target.value) || 0)} 
            style={{ width: '80px', textAlign: 'center' }} 
          />
        </div>

        <div className="input-group">
          <label>BPM</label>
          <input 
            type="number" 
            value={bpm} 
            onChange={(e) => setBpm(parseInt(e.target.value) || 120)} 
            style={{ width: '70px', textAlign: 'center' }} 
          />
        </div>

        <button onClick={togglePlay} style={{ background: isPlaying ? '#cf6679' : 'var(--secondary)', color: 'black', padding: '8px 20px' }}>
          {isPlaying ? '⏹ Stop' : '▶ Play Melody'}
        </button>
      </div>

      <div style={{ marginTop: '15px', fontStyle: 'italic', color: '#888', textAlign: 'center' }}>
        {useVisualizerPattern 
          ? `Generating melody from ${tsNum}/${tsDen} pattern: ${tsPattern}` 
          : GROOVE_PRESETS[selectedGroove].description}
      </div>

      <div className="sequencer-grid" style={{ marginTop: '20px' }}>
        <div className="tick-ruler">
          {melody.map((_, i) => (
            <div key={i} className={`tick-label ${currentTick === i ? 'playing' : ''}`}>{i}</div>
          ))}
        </div>
        <div className="seq-row">
          <div className="seq-label">Note</div>
          {melody.map((note, i) => (
            <div 
              key={i} 
              className={`seq-cell ${note ? 'on' : ''} ${currentTick === i ? 'playing' : ''}`}
              style={note ? { background: 'var(--accent)', color: 'black' } : {}}
            >
              {note ? note.noteName : ''}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '1.1rem', letterSpacing: '1px', color: 'var(--secondary)' }}>
        Generated Sequence: {melody.filter(n => n).map(n => n.noteName).join(' - ')}
      </div>
    </div>
  );
}

export default GrooveMelodyGenerator;
