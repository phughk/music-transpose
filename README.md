# Music Theory & Composition Toolset

An interactive React-based toolkit for composers, songwriters, and music theorists to explore scales, intervals, chords, and rhythmic structures. This application helps bridge the gap between abstract theory and emotional impact.

## ✨ Key Features

### 1. Scale Transposer & Mode Finder
*   **Root Note Selection:** Change the root note of any scale.
*   **7 Diatonic Modes:** Instant presets for Ionian (Major), Dorian, Phrygian, Lydian, Mixolydian, Aeolian (Minor), and Locrian.
*   **Automatic Mode Matching:** Brute-forces all 84 standard scales to find and display relative modes for your current selection.

### 2. Interval Emotion Matrix
*   **12-Interval Explorer:** Detailed emotional descriptions for every interval from the minor second to the octave.
*   **Dual Directionality:** Shows the distinct emotional character of both ascending and descending intervals.
*   **Interactive Playback:** Staggered sine-wave playback to hear the relationship between the source and destination notes.

### 3. Chord Relationship Matrix
*   **Emotional Mapping:** Based on research into chordal transitions and the "spectrum" of musical feeling (Sad, Evil, Neutral, Good).
*   **Dynamic Translation:** Automatically calculates how a chord relationship (e.g., `M III m`) translates into your current scale's logical base and its derived relative.

### 4. Chord Dictionary Visualizer
*   **16 Standard Qualities:** Explore everything from basic triads to lush Major Sevenths and dissonant Augmented Major Sevenths.
*   **Interval Visualization:** Interactive dot-grid showing the semitone structure of each chord.
*   **Dictionary Playback:** Arpeggiated triangle-wave playback for a warm, electric-piano-like timbre.

### 5. Time Signature & Rhythm Visualizer
*   **Custom Signatures:** Supports beats from 1 to 32 and note values (2, 4, 8, 16).
*   **Accent Grouping:** Visualize common rhythmic subdivisions (e.g., 9/8 as `3+3+3` or `2+2+2+3`).
*   **Visual Feedback:** Clearly indicates accents and beat numbering for complex meters.

### 6. Groove & Melody Generator
*   **Deterministic Creation:** Uses a seedable `mulberry32` random number generator so you can replicate your favorite sequences.
*   **Groove Presets:** Includes characteristic rhythms for Folk, Medieval, Irish, and Scottish styles.
*   **Visualizer Sync:** Can optionally follow the custom patterns defined in the Time Signature Visualizer.

### 7. Composite Rhythm Sequencer
*   **Rule-Based Layers:** Build complex polyrhythms by layering simple "Period & Offset" rules.
*   **Gate Activators:** Rhythmic filters that open and close based on "On/Total/Offset" counters.
*   **Master Gates:** A global rhythmic "mask" to create breathing room and syncopation across all tracks.
*   **Real-time Playhead:** Synchronized visual feedback and audio execution.

---

## 🚀 Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Prerequisites
*   Node.js (v14 or higher)
*   npm

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
Start the development server:
```bash
npm start
```
The app will open at `http://localhost:3000`.

---

## 🛠 Technical Details

*   **Web Audio API:** All sound generation is handled natively in the browser using Oscillators and GainNodes. No external audio files or samples are required.
*   **Deterministic RNG:** The Melody Generator uses the `mulberry32` algorithm to ensure that melody generation is consistent for any given seed value.
*   **Component Architecture:** Refactored into specialized, reusable React components for maintainability.
*   **Modular Data:** All musical constants (modes, chord qualities, interval emotions) are stored in `src/constants.js`.

---

## 📚 Credits & Sources

*   **Diatonic Modes:** [Wikipedia - Mode (music)](https://en.wikipedia.org/wiki/Mode_(music)#Modern_diatonic_modes)
*   **Chord Relationships:** [Stephen Berkemeier, Tabletop Composer](https://www.tabletopcomposer.com/post/chord-relationships-and-emotion)
*   **Interval Emotions:** Curated from various classical and contemporary music theory resources.

## 📄 License
This project is licensed under the MIT License - see the `LICENSE` file for details.
