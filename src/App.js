import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { CHROMATIC, ALL_MODES, CHORD_RELATIONSHIP_DATA, INTERVAL_MAP } from './constants';
import { buildChord } from './utils';
import ScaleTransposer from './components/ScaleTransposer';
import ChordRelationshipMatrix from './components/ChordRelationshipMatrix';
import ChordDictionaryVisualizer from './components/ChordDictionaryVisualizer';
import TimeSignatureVisualizer from './components/TimeSignatureVisualizer';
import RhythmSequencer from './components/RhythmSequencer';

function App() {
  // --- Scale & Mode State (Shared) ---
  const [rootNote, setRootNote] = useState(0);
  const [intervals, setIntervals] = useState(ALL_MODES["Ionian (Major)"]);
  const [currentModeName, setCurrentModeName] = useState("Ionian (Major)");
  const [currentScaleNotes, setCurrentScaleNotes] = useState(
    ALL_MODES["Ionian (Major)"].map(s => CHROMATIC[(0 + s) % 12])
  );
  const [currentScaleMidi, setCurrentScaleMidi] = useState(
    ALL_MODES["Ionian (Major)"].map(s => 60 + 0 + s)
  );

  // --- Chord Relationship State (Shared with Scale Transposer) ---
  const [spectrum, setSpectrum] = useState(CHORD_RELATIONSHIP_DATA[0].spectrum);
  const [emotion, setEmotion] = useState(CHORD_RELATIONSHIP_DATA[0].emotion);
  const [chordRel, setChordRel] = useState(CHORD_RELATIONSHIP_DATA[0].chord);

  const audioCtxRef = useRef(null);

  const calculateScale = useCallback(() => {
    const notes = intervals.map(s => CHROMATIC[(rootNote + s) % 12]);
    const midi = intervals.map(s => 60 + rootNote + s);
    setCurrentScaleNotes(notes);
    setCurrentScaleMidi(midi);
  }, [rootNote, intervals]);

  useEffect(() => {
    calculateScale();
  }, [calculateScale]);

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

  return (
    <div className="App">
      <ScaleTransposer 
        rootNote={rootNote}
        setRootNote={setRootNote}
        currentModeName={currentModeName}
        setCurrentModeName={setCurrentModeName}
        setIntervals={setIntervals}
        currentScaleNotes={currentScaleNotes}
        chordNotes={chordNotes}
      />

      <ChordRelationshipMatrix 
        spectrum={spectrum}
        emotion={emotion}
        chordRel={chordRel}
        syncChordData={syncChordData}
        chordNotes={chordNotes}
        rootNote={rootNote}
        currentModeName={currentModeName}
      />

      <ChordDictionaryVisualizer audioCtxRef={audioCtxRef} />

      <TimeSignatureVisualizer />

      <RhythmSequencer 
        currentScaleMidi={currentScaleMidi}
        currentScaleNotes={currentScaleNotes}
        audioCtxRef={audioCtxRef}
      />
    </div>
  );
}

export default App;
