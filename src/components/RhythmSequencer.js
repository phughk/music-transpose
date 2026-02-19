import React, { useState, useEffect, useCallback, useRef } from 'react';
import { checkGate } from '../utils';

function RhythmSequencer({ currentScaleMidi, currentScaleNotes, audioCtxRef }) {
  const [bpm, setBpm] = useState(120);
  const [globalRes, setGlobalRes] = useState(32);
  const [masterOn, setMasterOn] = useState(2);
  const [masterTotal, setMasterTotal] = useState(4);
  const [masterOffset, setMasterOffset] = useState(0);
  const [tracks, setTracks] = useState([
    { id: 1, degree: 1, period: 4, offset: 0, actOn: 1, actTotal: 1, actOffset: 0 },
    { id: 2, degree: 3, period: 3, offset: 1, actOn: 1, actTotal: 1, actOffset: 0 }
  ]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTick, setCurrentTick] = useState(-1);

  const timerIDRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const playbackGridRef = useRef([]);
  const currentTickRef = useRef(0);
  const bpmRef = useRef(bpm);
  const globalResRef = useRef(globalRes);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { globalResRef.current = globalRes; }, [globalRes]);

  useEffect(() => {
    const grid = Array.from({ length: globalRes }, () => []);
    for (let i = 0; i < globalRes; i++) {
      const isMasterOn = checkGate(i, masterOn, masterTotal, masterOffset);
      if (!isMasterOn) continue;

      tracks.forEach(t => {
        if ((i - t.offset) % t.period === 0 && i >= t.offset && checkGate(i, t.actOn, t.actTotal, t.actOffset)) {
          const midiNote = currentScaleMidi[t.degree - 1];
          if (midiNote) {
            const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
            grid[i].push(freq);
          }
        }
      });
    }
    playbackGridRef.current = grid;
  }, [globalRes, masterOn, masterTotal, masterOffset, tracks, currentScaleMidi]);

  const playTick = useCallback((tick, time, duration) => {
    if (!playbackGridRef.current[tick] || playbackGridRef.current[tick].length === 0) return;

    playbackGridRef.current[tick].forEach(freq => {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.2, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.01);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start(time);
      osc.stop(time + duration);
    });
  }, [audioCtxRef]);

  const schedule = useCallback(() => {
    const secondsPerTick = (60.0 / bpmRef.current) / 4;
    while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + 0.1) {
      const timeToPlay = nextNoteTimeRef.current;
      const tickToPlay = currentTickRef.current;
      
      playTick(tickToPlay, timeToPlay, secondsPerTick);

      const delay = (timeToPlay - audioCtxRef.current.currentTime) * 1000;
      setTimeout(() => {
        setCurrentTick(tickToPlay);
      }, Math.max(0, delay));

      currentTickRef.current = (currentTickRef.current + 1) % globalResRef.current;
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

  const addTrack = () => {
    setTracks([...tracks, { id: Date.now(), degree: 1, period: 1, offset: 0, actOn: 1, actTotal: 1, actOffset: 0 }]);
  };

  const removeTrack = (id) => {
    setTracks(tracks.filter(t => t.id !== id));
  };

  const updateTrack = (id, field, value) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  return (
    <div className="container">
      <div className="header-row" style={{ marginBottom: '15px' }}>
        <h1>Composite Rhythm Sequencer</h1>

        <div className="play-controls">
          <div className="input-group">
            <label>Tempo (BPM)</label>
            <input type="number" value={bpm} style={{ width: '70px', textAlign: 'center' }} onChange={(e) => setBpm(parseInt(e.target.value) || 120)} />
          </div>
          <button onClick={togglePlay} style={{ background: isPlaying ? '#cf6679' : 'var(--secondary)', color: 'black', fontSize: '1.1rem', padding: '10px 20px' }}>
            {isPlaying ? '⏹ Stop' : '▶ Play'}
          </button>
        </div>
      </div>

      <div className="instructions">
        <strong>How it works:</strong> This sequencer builds complex patterns by layering simple, repeating rules.
        <ul>
          <li><strong>Scale Degree:</strong> Chooses which note from your active scale (1st through 7th) the track will trigger.</li>
          <li><strong>Period & Offset:</strong> A track with a Period of 4 and an Offset of 0 pulses on ticks 0, 4, 8, 12. Changing the Offset to 1 shifts it to ticks 1, 5, 9, 13.</li>
          <li><strong>Gate Activators (On/Total/Offset):</strong> These act as rhythmic filters. E.g., setting Gate On to 2 and Gate Total to 4 means the gate is open for 2 ticks, then closed for 2 ticks. A note only plays if its Period pulse hits an open gate.</li>
          <li><strong>Master Gates:</strong> Master Gates act as a global mute. If the master gate is closed, the entire grid is muted for that tick (shown as dim columns).</li>
        </ul>
      </div>

      <div className="header-row" style={{ background: '#1f1f1f', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #cf6679' }}>
        <div className="input-group">
          <label>Global Resolution (Ticks)</label>
          <input type="number" value={globalRes} className="num-md" onChange={(e) => setGlobalRes(parseInt(e.target.value) || 16)} />
        </div>
        <div className="row" style={{ marginBottom: 0 }}>
          <div className="input-group"><label>Master Gate On</label><input type="number" value={masterOn} min="1" className="num-sm" onChange={(e) => setMasterOn(parseInt(e.target.value) || 1)} /></div>
          <div className="input-group"><label>Master Gate Total</label><input type="number" value={masterTotal} min="1" className="num-sm" onChange={(e) => setMasterTotal(parseInt(e.target.value) || 1)} /></div>
          <div className="input-group"><label>Master Gate Offset</label><input type="number" value={masterOffset} min="0" className="num-sm" onChange={(e) => setMasterOffset(parseInt(e.target.value) || 0)} /></div>
        </div>
      </div>

      <div className="header-row" style={{ marginTop: '25px' }}>
        <h3>Beat Tracks</h3>
        <button onClick={addTrack} style={{ background: 'var(--secondary)', color: 'black' }}>+ Add Track</button>
      </div>
      <div id="tracksContainer">
        {tracks.map(t => (
          <div key={t.id} className="track-card">
            <div className="row">
              <div className="input-group">
                <label>Scale Degree</label>
                <select value={t.degree} onChange={(e) => updateTrack(t.id, 'degree', parseInt(e.target.value))} style={{ width: '100px', color: 'var(--accent)' }}>
                  <option value="1">1 (Root)</option>
                  <option value="2">2nd</option>
                  <option value="3">3rd</option>
                  <option value="4">4th</option>
                  <option value="5">5th</option>
                  <option value="6">6th</option>
                  <option value="7">7th</option>
                </select>
              </div>
              <div className="input-group"><label>Period</label><input type="number" value={t.period} min="1" onChange={(e) => updateTrack(t.id, 'period', parseInt(e.target.value) || 1)} className="num-sm" /></div>
              <div className="input-group"><label>Offset</label><input type="number" value={t.offset} min="0" onChange={(e) => updateTrack(t.id, 'offset', parseInt(e.target.value) || 0)} className="num-sm" /></div>

              <div style={{ width: '2px', background: '#444', margin: '0 5px', height: '40px', alignSelf: 'center' }}></div>

              <div className="input-group"><label>Gate On</label><input type="number" value={t.actOn} min="1" onChange={(e) => updateTrack(t.id, 'actOn', parseInt(e.target.value) || 1)} className="num-sm" /></div>
              <div className="input-group"><label>Gate Total</label><input type="number" value={t.actTotal} min="1" onChange={(e) => updateTrack(t.id, 'actTotal', parseInt(e.target.value) || 1)} className="num-sm" /></div>
              <div className="input-group"><label>Gate Offset</label><input type="number" value={t.actOffset} min="0" onChange={(e) => updateTrack(t.id, 'actOffset', parseInt(e.target.value) || 0)} className="num-sm" /></div>

              <button onClick={() => removeTrack(t.id)} style={{ background: '#cf6679', marginLeft: 'auto' }}>×</button>
            </div>
          </div>
        ))}
      </div>

      <h3>Step Sequencer Output</h3>
      <div className="sequencer-grid">
        <div className="tick-ruler">
          {Array.from({ length: globalRes }).map((_, i) => (
            <div key={i} className={`tick-label ${currentTick === i ? 'playing' : ''}`}>{i}</div>
          ))}
        </div>
        {[7, 6, 5, 4, 3, 2, 1].map(degree => {
          const noteName = currentScaleNotes[degree - 1] || "?";
          return (
            <div key={degree} className="seq-row">
              <div className="seq-label" title={`Degree ${degree}`}>{noteName}</div>
              {Array.from({ length: globalRes }).map((_, i) => {
                const isMasterOn = checkGate(i, masterOn, masterTotal, masterOffset);
                let isNoteTriggered = false;
                tracks.forEach(t => {
                  if (t.degree === degree && (i - t.offset) % t.period === 0 && i >= t.offset && checkGate(i, t.actOn, t.actTotal, t.actOffset)) {
                    isNoteTriggered = true;
                  }
                });
                const active = isMasterOn && isNoteTriggered;
                let cellClass = `seq-cell`;
                if (!isMasterOn) cellClass += ' master-off';
                else if (active) cellClass += ' on';
                if (currentTick === i) cellClass += ' playing';

                return <div key={i} className={cellClass}>{active ? '♪' : ''}</div>;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RhythmSequencer;
