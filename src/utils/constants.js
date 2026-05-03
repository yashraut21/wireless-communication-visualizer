/* Physical constants */
export const SPEED_OF_LIGHT = 3e8; // m/s
export const BOLTZMANN_CONSTANT = 1.38e-23; // J/K
export const PI = Math.PI;

/* Frequency band definitions for EM Spectrum */
export const EM_BANDS = [
  { name: 'ELF', label: 'Extremely Low', range: [3, 30], unit: 'Hz', color: '#ef4444', apps: ['Submarine communication'] },
  { name: 'SLF', label: 'Super Low', range: [30, 300], unit: 'Hz', color: '#f97316', apps: ['AC power'] },
  { name: 'ULF', label: 'Ultra Low', range: [300, 3000], unit: 'Hz', color: '#eab308', apps: ['Mine communication'] },
  { name: 'VLF', label: 'Very Low', range: [3, 30], unit: 'kHz', color: '#84cc16', apps: ['Navigation, time signals'] },
  { name: 'LF', label: 'Low Frequency', range: [30, 300], unit: 'kHz', color: '#22c55e', apps: ['AM longwave radio, RFID'] },
  { name: 'MF', label: 'Medium Frequency', range: [300, 3000], unit: 'kHz', color: '#14b8a6', apps: ['AM broadcast radio'] },
  { name: 'HF', label: 'High Frequency', range: [3, 30], unit: 'MHz', color: '#06b6d4', apps: ['Shortwave radio, aviation'] },
  { name: 'VHF', label: 'Very High', range: [30, 300], unit: 'MHz', color: '#3b82f6', apps: ['FM radio, TV broadcast'] },
  { name: 'UHF', label: 'Ultra High', range: [300, 3000], unit: 'MHz', color: '#6366f1', apps: ['4G/LTE, WiFi 2.4 GHz, GPS'] },
  { name: 'SHF', label: 'Super High', range: [3, 30], unit: 'GHz', color: '#8b5cf6', apps: ['5G, WiFi 5 GHz, radar, satellite'] },
  { name: 'EHF', label: 'Extremely High', range: [30, 300], unit: 'GHz', color: '#a855f7', apps: ['5G mmWave, radio astronomy'] },
];

/* Wireless technology markers for EM Spectrum */
export const TECH_MARKERS = [
  { name: 'AM Radio', freq: 1e6, color: '#14b8a6' },
  { name: 'FM Radio', freq: 100e6, color: '#3b82f6' },
  { name: 'GPS', freq: 1.575e9, color: '#22c55e' },
  { name: '4G LTE', freq: 700e6, color: '#6366f1' },
  { name: 'WiFi 2.4', freq: 2.4e9, color: '#06b6d4' },
  { name: '5G Sub-6', freq: 3.5e9, color: '#8b5cf6' },
  { name: 'WiFi 5', freq: 5e9, color: '#3b82f6' },
  { name: '5G mmWave', freq: 28e9, color: '#a855f7' },
];

/* Common presets for calculators */
export const FSPL_PRESETS = [
  { name: 'WiFi at Home', distance: 10, frequency: 2.4e9, description: '2.4 GHz WiFi, 10m range' },
  { name: 'Cell Tower → Phone', distance: 3000, frequency: 900e6, description: '900 MHz, 3 km urban' },
  { name: '5G Small Cell', distance: 200, frequency: 28e9, description: '28 GHz mmWave, 200m' },
  { name: 'Satellite Link', distance: 35786000, frequency: 12e9, description: 'GEO satellite, 12 GHz' },
];

/* dB reference levels */
export const DB_EXAMPLES = [
  { name: 'Threshold of hearing', db: 0 },
  { name: 'Whisper', db: 30 },
  { name: 'Normal conversation', db: 60 },
  { name: 'City traffic', db: 85 },
  { name: 'Rock concert', db: 110 },
  { name: 'Jet engine', db: 140 },
];

/* Cell cluster sizes */
export const CLUSTER_SIZES = [3, 4, 7, 9, 12, 13, 19];

/* Section navigation data */
export const SECTIONS = [
  {
    id: 'fundamentals',
    title: 'Fundamentals',
    icon: 'Waves',
    path: '/fundamentals',
    color: 'var(--color-accent-teal)',
    topics: [
      { id: 'waves', title: 'What is a Wave?', path: '/fundamentals/waves' },
      { id: 'em-spectrum', title: 'EM Spectrum', path: '/fundamentals/em-spectrum' },
      { id: 'decibels', title: 'Decibels (dB)', path: '/fundamentals/decibels' },
      { id: 'cellular-concept', title: 'Cellular Concept', path: '/fundamentals/cellular-concept' },
    ],
  },
  {
    id: 'antennas',
    title: 'Antennas',
    icon: 'Radio',
    path: '/antennas',
    color: 'var(--color-accent-blue)',
    topics: [
      { id: 'antenna-types', title: 'Antenna Types', path: '/antennas/types' },
      { id: 'radiation-patterns', title: 'Radiation Patterns', path: '/antennas/radiation-patterns' },
      { id: 'beamforming', title: 'Beamforming', path: '/antennas/beamforming' },
      { id: 'polarization', title: 'Polarization', path: '/antennas/polarization' },
    ],
  },
  {
    id: 'propagation',
    title: 'Propagation',
    icon: 'Zap',
    path: '/propagation',
    color: 'var(--color-accent-violet)',
    topics: [
      { id: 'reflection', title: 'Reflection', path: '/propagation/reflection' },
      { id: 'diffraction', title: 'Diffraction', path: '/propagation/diffraction' },
      { id: 'scattering', title: 'Scattering', path: '/propagation/scattering' },
      { id: 'phasor-sum', title: 'Phasor Sum', path: '/propagation/phasor-sum' },
    ],
  },
  {
    id: 'large-scale-fading',
    title: 'Large-Scale Fading',
    icon: 'TrendingDown',
    path: '/large-scale-fading',
    color: 'var(--color-accent-amber)',
    topics: [
      { id: 'fspl', title: 'Free Space Path Loss', path: '/large-scale-fading/fspl' },
      { id: 'two-ray', title: 'Two-Ray Model', path: '/large-scale-fading/two-ray' },
      { id: 'okumura-hata', title: 'Okumura-Hata', path: '/large-scale-fading/okumura-hata' },
      { id: 'shadowing', title: 'Shadowing', path: '/large-scale-fading/shadowing' },
    ],
  },
  {
    id: 'small-scale-fading',
    title: 'Small-Scale Fading',
    icon: 'Activity',
    path: '/small-scale-fading',
    color: 'var(--color-accent-green)',
    topics: [
      { id: 'pdp', title: 'Power Delay Profile', path: '/small-scale-fading/pdp' },
      { id: 'delay-spread', title: 'Delay Spread', path: '/small-scale-fading/delay-spread' },
      { id: 'doppler', title: 'Doppler Spread', path: '/small-scale-fading/doppler' },
      { id: 'rayleigh-ricean', title: 'Rayleigh vs Ricean', path: '/small-scale-fading/rayleigh-ricean' },
      { id: 'fading-sim', title: 'Fading Simulator', path: '/small-scale-fading/fading-simulator' },
    ],
  },
  {
    id: 'diversity',
    title: 'Diversity',
    icon: 'GitBranch',
    path: '/diversity',
    color: 'var(--color-accent-cyan)',
    topics: [
      { id: 'diversity-concept', title: 'Concept', path: '/diversity/concept' },
      { id: 'combining', title: 'Combining Methods', path: '/diversity/combining' },
      { id: 'rake', title: 'Rake Receiver', path: '/diversity/rake' },
    ],
  },
  {
    id: 'modulation',
    title: 'Modulation',
    icon: 'AudioWaveform',
    path: '/modulation',
    color: 'var(--color-accent-teal)',
    topics: [
      { id: 'constellation', title: 'Constellation Diagrams', path: '/modulation/constellation' },
      { id: 'pulse-shaping', title: 'Pulse Shaping', path: '/modulation/pulse-shaping' },
      { id: 'gmsk', title: 'GMSK', path: '/modulation/gmsk' },
      { id: 'ber-fading', title: 'BER in Fading', path: '/modulation/ber-fading' },
    ],
  },
  {
    id: 'multiple-access',
    title: 'Multiple Access',
    icon: 'Users',
    path: '/multiple-access',
    color: 'var(--color-accent-blue)',
    topics: [
      { id: 'fdma-tdma-cdma', title: 'FDMA/TDMA/CDMA', path: '/multiple-access/comparison' },
      { id: 'cdma-spreading', title: 'CDMA & Spreading', path: '/multiple-access/cdma' },
    ],
  },
  {
    id: 'gsm',
    title: 'GSM System',
    icon: 'Smartphone',
    path: '/gsm',
    color: 'var(--color-accent-violet)',
    topics: [
      { id: 'gsm-frame', title: 'Time-Frame Structure', path: '/gsm/frame-structure' },
      { id: 'gsm-signal', title: 'Signal Processing', path: '/gsm/signal-processing' },
      { id: 'gsm-coding', title: 'Speech & Coding', path: '/gsm/speech-coding' },
      { id: 'gsm-handover', title: 'Handover', path: '/gsm/handover' },
    ],
  },
  {
    id: 'playground',
    title: 'Playground',
    icon: 'FlaskConical',
    path: '/playground',
    color: 'var(--color-accent-amber)',
    topics: [
      { id: 'link-budget', title: 'Link Budget Calculator', path: '/playground/link-budget' },
      { id: 'prop-comparator', title: 'Model Comparator', path: '/playground/propagation-comparator' },
      { id: 'fading-pro', title: 'Fading Simulator Pro', path: '/playground/fading-pro' },
      { id: 'array-designer', title: 'Array Designer', path: '/playground/array-designer' },
      { id: 'constellation-viz', title: 'Constellation Viz', path: '/playground/constellation' },
    ],
  },
  {
    id: 'toolkit',
    title: "Engineer's Toolkit",
    icon: 'Wrench',
    path: '/toolkit',
    color: 'var(--color-accent-green)',
    topics: [
      { id: 'flowchart', title: 'Problem-Solving', path: '/toolkit/flowchart' },
      { id: 'decision-tree', title: 'Which Model?', path: '/toolkit/decision-tree' },
      { id: 'scenarios', title: 'Real-World Scenarios', path: '/toolkit/scenarios' },
      { id: 'pitfalls', title: 'Common Pitfalls', path: '/toolkit/pitfalls' },
    ],
  },
];

/* Search index data for fuzzy search */
export const SEARCH_INDEX = SECTIONS.flatMap((section) =>
  section.topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    section: section.title,
    path: topic.path,
    sectionColor: section.color,
  }))
);
