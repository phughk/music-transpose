import React from 'react';
import { COMMON_GROUPINGS } from '../constants';

function TimeSignatureVisualizer({ tsNum, setTsNum, tsDen, setTsDen, tsPattern, setTsPattern }) {
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
    <div className="container">
      <h1>Time Signature & Rhythm Visualizer</h1>
      <p style={{ fontSize: '0.9rem', color: '#aaa' }}>Enter a time signature to see common accent patterns and visual groupings.</p>

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
  );
}

export default TimeSignatureVisualizer;
