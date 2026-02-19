import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import {
  CHROMATIC,
  ALL_MODES,
  CHORD_RELATIONSHIP_DATA,
  INTERVAL_MAP,
  COMMON_GROUPINGS,
  EXTENDED_CHORDS
} from './constants';
import { findMatchingModes, buildChord, checkGate } from './utils';

function App() {
  // --- Scale & Mode State ---
  const [rootNote, setRootNote] = useState(0);
  const [intervals, setIntervals] = useState(ALL_MODES["Ionian (Major)"]);
  const [currentModeName, setCurrentModeName] = useState("Ionian (Major)");
  const [currentScaleNotes, setCurrentScaleNotes] = useState(
    ALL_MODES["Ionian (Major)"].map(s => CHROMATIC[(0 + s) % 12])
  );
  const [currentScaleMidi, setCurrentScaleMidi] = useState(
    ALL_MODES["Ionian (Major)"].map(s => 60 + 0 + s)
  );

  // --- Chord Relationship State ---
  const [spectrum, setSpectrum] = useState(CHORD_RELATIONSHIP_DATA[0].spectrum);
  const [emotion, setEmotion] = useState(CHORD_RELATIONSHIP_DATA[0].emotion);
  const [chordRel, setChordRel] = useState(CHORD_RELATIONSHIP_DATA[0].chord);

  // --- Chord Dictionary State ---
  const [dictRoot, setDictRoot] = useState(0);
  const [dictQuality, setDictQuality] = useState("Major");

  // --- Time Signature State ---
  const [tsNum, setTsNum] = useState(9);
  const [tsDen, setTsDen] = useState("8");
  const [tsPattern, setTsPattern] = useState("3+3+3");

  // --- Sequencer State ---
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

  const audioCtxRef = useRef(null);
  const timerIDRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const playbackGridRef = useRef([]);

  // --- Derived Calculations ---

  const calculateScale = useCallback(() => {
    const notes = intervals.map(s => CHROMATIC[(rootNote + s) % 12]);
    const midi = intervals.map(s => 60 + rootNote + s);
    setCurrentScaleNotes(notes);
    setCurrentScaleMidi(midi);
  }, [rootNote, intervals]);

  useEffect(() => {
    calculateScale();
  }, [calculateScale]);

  const applyPreset = (arr, modeName) => {
    setIntervals(arr);
    setCurrentModeName(modeName);
  };

  const syncChordData = (sourceField, value) => {
    let targetEntry;
    if (sourceField === 'chord') {
      setChordRel(value);
      targetEntry = CHORD_RELATIONSHIP_DATA.find(item => item.chord === value);
      if (targetEntry) {
        setEmotion(targetEntry.emotion);
        setSpectrum(targetEntry.spectrum);
      }
    } else if (sourceField === 'emotion') {
      setEmotion(value);
      targetEntry = CHORD_RELATIONSHIP_DATA.find(item => item.emotion === value);
      if (targetEntry) {
        setChordRel(targetEntry.chord);
        setSpectrum(targetEntry.spectrum);
      }
    } else if (sourceField === 'spectrum') {
      setSpectrum(value);
      targetEntry = CHORD_RELATIONSHIP_DATA.find(item => item.spectrum === value);
      if (targetEntry) {
        setChordRel(targetEntry.chord);
        setEmotion(targetEntry.emotion);
      }
    }
  };

  const getChordNotesDisplay = () => {
    if (!chordRel) return null;
    const parts = chordRel.split(' ');
    if (parts.length !== 3) return null;

    const [q1, intSym, q2] = parts;
    const semitones = INTERVAL_MAP[intSym] || 0;

    const root2Index = (rootNote + semitones) % 12;
    const chord1 = buildChord(rootNote, q1);
    const chord2 = buildChord(root2Index, q2);

    const modeOffsets = {
      "Ionian (Major)": { maj: 0, min: 9 },
      "Dorian": { maj: 10, min: 7 },
      "Phrygian": { maj: 8, min: 5 },
      "Lydian": { maj: 7, min: 4 },
      "Mixolydian": { maj: 5, min: 2 },
      "Aeolian (Minor)": { maj: 3, min: 0 },
      "Locrian": { maj: 1, min: 10 }
    };

    const offsets = modeOffsets[currentModeName] || { maj: 0, min: 9 };
    const isMinor = intervals.includes(3);
    const relOffset = isMinor ? offsets.min : offsets.maj;
    const relRootIndex = (rootNote + relOffset) % 12;
    const relRoot2Index = (relRootIndex + semitones) % 12;

    const relChord1 = buildChord(relRootIndex, q1);
    const relChord2 = buildChord(relRoot2Index, q2);

    const scale2Name = `${CHROMATIC[root2Index]} ${q2 === 'M' ? 'Major' : 'Minor'}`;
    const intervals2 = (q2 === 'M') ? ALL_MODES["Ionian (Major)"] : ALL_MODES["Aeolian (Minor)"];
    const notes2 = intervals2.map(s => CHROMATIC[(root2Index + s) % 12]);
    const matches2 = findMatchingModes(notes2);

    return {
      chord1, chord2, relChord1, relChord2,
      scale2Name, notes2, matches2,
      isMinor, relRootIndex
    };
  };

  const chordNotes = getChordNotesDisplay();

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

  // --- Sequencer Logic ---

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
  }, []);

  const bpmRef = useRef(bpm);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  const globalResRef = useRef(globalRes);
  useEffect(() => { globalResRef.current = globalRes; }, [globalRes]);

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
  }, [playTick]);

  const currentTickRef = useRef(0);

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

  // --- UI Components ---

  const renderRhythmVisualization = () => {
    const groups = tsPattern.split('+').map(Number);
    let beatCount = 1;
    let noteSymbol = '♩';
    if (tsDen === '2') noteSymbol = '𝅗𝅥';
    if (tsDen === '8') noteSymbol = '♪';
    if (tsDen === '16') noteSymbol = '𝅘𝅥𝅯';

    return groups.map((groupSize, gIdx) => (
      <div key={gIdx} className="rhythm-group">
        {Array.from({ length: groupSize }).map((_, i) => {
          const isAccent = (i === 0);
          const currentBeat = beatCount++;
          return (
            <div key={i} className={`rhythm-block ${isAccent ? 'accent' : ''}`} title={`Beat ${currentBeat}`}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.7rem', marginBottom: '-4px' }}>{currentBeat}</span>
                <span>{noteSymbol}</span>
              </div>
            </div>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="App">
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

      <div className="container">
        <h1>Chord Relationship Matrix</h1>
        <p style={{ fontSize: 0.9 + 'rem', color: '#aaa' }}>Select a chord, emotion, or spectrum. The Scale Transposer will automatically update to show the transition.</p>
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

      <div className="container">
        <h1>Chord Dictionary Visualizer</h1>
        <p style={{ fontSize: 0.9 + 'rem', color: '#aaa' }}>Explore all standard chord qualities, their interval structures, and how they feel.</p>

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

      <div className="container">
        <h1>Time Signature & Rhythm Visualizer</h1>
        <p style={{ fontSize: 0.9 + 'rem', color: '#aaa' }}>Enter a time signature to see common accent patterns and visual groupings.</p>

        <div className="row" style={{ background: '#1f1f1f', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
          <div className="input-group">
            <label>Beats</label>
            <input type="number" value={tsNum} min="1" max="32" className="num-md" onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setTsNum(val);
              const opts = COMMON_GROUPINGS[val] || [val.toString(), Array(val).fill(1).join('+')];
              setTsPattern(opts[0]);
            }} />
          </div>

          <div style={{ fontSize: '2rem', fontWeight: '300', margin: '0 5px', color: '#555', alignSelf: 'center' }}>/</div>

          <div className="input-group">
            <label>Note Value</label>
            <select value={tsDen} onChange={(e) => setTsDen(e.target.value)}>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="16">16</option>
            </select>
          </div>

          <div className="input-group" style={{ marginLeft: '20px', flex: 1, minWidth: '200px' }}>
            <label>Accent Grouping</label>
            <select value={tsPattern} onChange={(e) => setTsPattern(e.target.value)}>
              {(COMMON_GROUPINGS[tsNum] || [tsNum.toString(), Array(tsNum).fill(1).join('+')]).map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <div className="rhythm-visualizer">
          {renderRhythmVisualization()}
        </div>
      </div>

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
    </div>
  );
}

export default App;
