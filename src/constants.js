export const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const ALL_MODES = {
  "Ionian (Major)": [0, 2, 4, 5, 7, 9, 11],
  "Dorian": [0, 2, 3, 5, 7, 9, 10],
  "Phrygian": [0, 1, 3, 5, 7, 8, 10],
  "Lydian": [0, 2, 4, 6, 7, 9, 11],
  "Mixolydian": [0, 2, 4, 5, 7, 9, 10],
  "Aeolian (Minor)": [0, 2, 3, 5, 7, 8, 10],
  "Locrian": [0, 1, 3, 5, 6, 8, 10]
};

export const CHORD_RELATIONSHIP_DATA = [
  { chord: "M III m", emotion: "Sadness", spectrum: "Sad" }, { chord: "m IV m", emotion: "Tragic", spectrum: "Sad" },
  { chord: "m V m", emotion: "Tragic", spectrum: "Sad" }, { chord: "m V M", emotion: "Bitter Sweet", spectrum: "Sad" },
  { chord: "m vii M", emotion: "Bitter Sweet", spectrum: "Sad" }, { chord: "M II m", emotion: "Bitter Sweet", spectrum: "Sad" },
  { chord: "m ii m", emotion: "Mysterious and Tense", spectrum: "Evil Sounding" }, { chord: "m VII m", emotion: "Mysterious and Tense", spectrum: "Evil Sounding" },
  { chord: "m VI M", emotion: "Mysterious and Tense", spectrum: "Evil Sounding" }, { chord: "M iii m", emotion: "Mysterious and Tense", spectrum: "Evil Sounding" },
  { chord: "m II m", emotion: "A Little Uneasy", spectrum: "Evil Sounding" }, { chord: "m vii m", emotion: "A Little Uneasy", spectrum: "Evil Sounding" },
  { chord: "m iii m", emotion: "Otherworldly and Ominous", spectrum: "Evil Sounding" }, { chord: "m VI m", emotion: "Otherworldly and Ominous", spectrum: "Evil Sounding" },
  { chord: "m III m", emotion: "Ominous and Dark Sounding", spectrum: "Evil Sounding" }, { chord: "m vi m", emotion: "Ominous and Dark Sounding", spectrum: "Evil Sounding" },
  { chord: "m IV+ m", emotion: "Antagonism and Danger", spectrum: "Evil Sounding" }, { chord: "m VII M", emotion: "Dramatic", spectrum: "Evil/Neutral Sounding" },
  { chord: "M ii m", emotion: "Dramatic", spectrum: "Evil/Neutral Sounding" }, { chord: "m II M", emotion: "Mysterious/Dark comedy", spectrum: "Evil/Neutral Sounding" },
  { chord: "M vii m", emotion: "Mysterious/Dark comedy", spectrum: "Evil/Neutral Sounding" }, { chord: "m IV+ M", emotion: "Outer Space", spectrum: "Evil/Neutral Sounding" },
  { chord: "M IV+ m", emotion: "Outer Space", spectrum: "Evil/Neutral Sounding" }, { chord: "M ii M", emotion: "Exotic/Cowboy/Enchanted Forest", spectrum: "Neutral Sounding" },
  { chord: "M VII M", emotion: "Exotic/Cowboy/Enchanted Forest", spectrum: "Neutral Sounding" }, { chord: "M IV+ M", emotion: "Outer Space (Neutral)", spectrum: "Neutral Sounding" },
  { chord: "M VII m", emotion: "Cautious but Optimistic", spectrum: "Neutral Sounding" }, { chord: "m ii M", emotion: "Cautious but Optimistic", spectrum: "Neutral Sounding" },
  { chord: "m iii M", emotion: "Rising Action/Tension", spectrum: "Neutral Sounding" }, { chord: "m III M", emotion: "Powerful and Mysterious", spectrum: "Neutral Sounding" },
  { chord: "M vi m", emotion: "Powerful and Mysterious", spectrum: "Neutral Sounding" }, { chord: "m vi M", emotion: "Resolution", spectrum: "Neutral Sounding" },
  { chord: "M IV m", emotion: "Romantic/Exotic", spectrum: "Good/Neutral Sounding" }, { chord: "M VI m", emotion: "Other worldly/Heavenly", spectrum: "Good/Neutral Sounding" },
  { chord: "m IV M", emotion: "Wonder and Transcendence", spectrum: "Good/Neutral Sounding" }, { chord: "M V m", emotion: "Wonder and Transcendence", spectrum: "Good/Neutral Sounding" },
  { chord: "M II M", emotion: "Protagonism", spectrum: "Good Sounding" }, { chord: "M vii M", emotion: "Protagonism", spectrum: "Good Sounding" },
  { chord: "M iii M", emotion: "Heroic", spectrum: "Good Sounding" }, { chord: "M VI M", emotion: "Heroic", spectrum: "Good Sounding" },
  { chord: "M III M", emotion: "Fantastical", spectrum: "Good Sounding" }, { chord: "M vi M", emotion: "Fantastical", spectrum: "Good Sounding" },
  { chord: "M IV M", emotion: "Good Energy", spectrum: "Good Sounding" }, { chord: "M V M", emotion: "Good Energy", spectrum: "Good Sounding" }
];

export const INTERVAL_MAP = { "ii": 1, "II": 2, "iii": 3, "III": 4, "IV": 5, "IV+": 6, "V": 7, "vi": 8, "VI": 9, "vii": 10, "VII": 11 };

export const COMMON_GROUPINGS = {
  2: ["2", "1+1"],
  3: ["3", "1+1+1"],
  4: ["4", "2+2", "3+1", "1+3"],
  5: ["3+2", "2+3"],
  6: ["3+3", "2+2+2"],
  7: ["3+2+2", "2+3+2", "2+2+3"],
  8: ["3+3+2", "2+3+3", "3+2+3", "2+2+2+2", "4+4"],
  9: ["3+3+3", "2+2+2+3", "2+2+3+2", "2+3+2+2", "3+2+2+2"],
  10: ["3+3+2+2", "3+2+2+3", "2+2+3+3", "2+3+3+2"],
  11: ["3+3+3+2", "3+3+2+3", "3+2+3+3", "2+3+3+3"],
  12: ["3+3+3+3", "4+4+4", "2+2+2+2+2+2"]
};

export const EXTENDED_CHORDS = {
  "Major": { intervals: [0, 4, 7], desc: "Happy, stable, and resolved. The foundation of Western music." },
  "Major Sixth": { intervals: [0, 4, 7, 9], desc: "Warm, playful, and sweet. Often used in vintage pop and Hawaiian music." },
  "Major Seventh": { intervals: [0, 4, 7, 11], desc: "Lush, dreamy, and romantic. Very common in jazz and lo-fi." },
  "Minor": { intervals: [0, 3, 7], desc: "Sad, melancholic, and serious." },
  "Minor Sixth": { intervals: [0, 3, 7, 9], desc: "Mysterious and dark, often associated with spy films or noir soundtracks." },
  "Minor Seventh": { intervals: [0, 3, 7, 10], desc: "Smooth, mellow, and slightly mournful. A staple of R&B and jazz." },
  "Diminished": { intervals: [0, 3, 6], desc: "Tense, spooky, and highly unstable. Sounds like impending danger." },
  "Diminished Seventh": { intervals: [0, 3, 6, 9], desc: "Dramatic, suspenseful, and classic horror-villain music." },
  "Half-Diminished": { intervals: [0, 3, 6, 10], desc: "Tragic and wandering. Common in deeply emotional, romantic progressions." },
  "Augmented": { intervals: [0, 4, 8], desc: "Floating, dream-like, and ambiguous. Sounds like stepping into a magical portal." },
  "Aug. Seventh": { intervals: [0, 4, 8, 10], desc: "Highly tense and pulling, forcefully pushing the listener toward a resolution." },
  "Aug. Maj. Seventh": { intervals: [0, 4, 8, 11], desc: "Complex, highly dissonant but lush. Often sounds sci-fi or otherworldly." },
  "Dominant Seventh": { intervals: [0, 4, 7, 10], desc: "Bluesy, energetic, and restless. Strongly wants to resolve to a major chord." },
  "Suspended 2": { intervals: [0, 2, 7], desc: "Open, airy, and hopeful. Lacks the definitive emotion of a Major/Minor 3rd." },
  "Suspended 4": { intervals: [0, 5, 7], desc: "Unresolved and floating. Feels like it's holding its breath before resolving." },
  "Power": { intervals: [0, 7], desc: "Strong, neutral, and punchy. The driving backbone of rock and heavy metal." }
};
