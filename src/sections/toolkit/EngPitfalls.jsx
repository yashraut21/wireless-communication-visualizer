import { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronUp, Zap, Signal, Calculator, Layers, Radio, Settings } from 'lucide-react';

const pitfallCategories = [
  {
    id: 'decibels',
    icon: Calculator,
    color: '#ef4444',
    title: 'Decibel Confusion',
    subtitle: 'The #1 source of exam errors',
    pitfalls: [
      {
        title: 'Mixing dBm and dBW',
        wrong: 'P_rx = −85 dBm + 10 dBW = −75 dBm',
        right: 'Always convert to the same reference FIRST: −85 dBm = −115 dBW; then −115 dBW + 10 dBW = −105 dBW = −75 dBm',
        rule: 'dBm = dBW + 30. Never add dBm directly to dBW.',
        severity: 'critical',
      },
      {
        title: 'Forgetting FSPL is in dB',
        wrong: 'P_rx = P_tx × (λ/4πd)² directly in Watts without log conversion',
        right: 'In dB: P_rx(dBm) = P_tx(dBm) + G_tx(dBi) − FSPL(dB) + G_rx(dBi). FSPL = 20·log₁₀(4πd/λ)',
        rule: 'All link budget additions/subtractions must be in dB/dBm/dBW. Never mix linear and log-scale quantities.',
        severity: 'critical',
      },
      {
        title: 'Confusing dBi vs dBd',
        wrong: 'Using a 2 dBd antenna gain as 2 dBi in a link budget',
        right: 'dBi = dBd + 2.15 dB. A 2 dBd dipole = 4.15 dBi. Always clarify the reference (isotropic vs dipole).',
        rule: 'dBi references an isotropic radiator. dBd references a half-wave dipole. dBi = dBd + 2.15.',
        severity: 'moderate',
      },
    ],
  },
  {
    id: 'path-loss',
    icon: Signal,
    color: '#f59e0b',
    title: 'Path Loss Model Misuse',
    subtitle: 'Applying the wrong model to the wrong scenario',
    pitfalls: [
      {
        title: 'Using FSPL for Terrestrial Cellular Links',
        wrong: 'Using FSPL (n=2) to estimate coverage of a GSM base station at 1 km in an urban area',
        right: 'Use Okumura-Hata or COST-231 for terrestrial cellular. FSPL only applies to free-space (e.g., satellites, clear LOS microwave links). Urban environments have n = 3–4.',
        rule: 'FSPL assumes perfect free space. Any obstacle, reflection, or ground interaction invalidates it.',
        severity: 'critical',
      },
      {
        title: 'Ignoring Frequency Validity Ranges',
        wrong: 'Applying the Okumura-Hata model at 5 GHz',
        right: 'Okumura-Hata is valid for 150–1500 MHz. Use COST-231 for 1500–2000 MHz. Use 3GPP or WINNER models for higher frequencies.',
        rule: 'Every empirical model has a defined validity range (frequency, distance, antenna heights). Check before using!',
        severity: 'moderate',
      },
      {
        title: 'Neglecting the Ground Reflection in Two-Ray Model',
        wrong: 'Using the Two-Ray model formula at short distances (d < crossover distance)',
        right: 'Two-Ray model has a crossover distance d_c = (4·h_t·h_r)/λ. Below d_c, it behaves like FSPL. Above d_c, path loss ∝ d⁴.',
        rule: 'The d⁴ power law of the Two-Ray model is only valid at distances much greater than the crossover distance.',
        severity: 'moderate',
      },
    ],
  },
  {
    id: 'fading',
    icon: Layers,
    color: '#8b5cf6',
    title: 'Fading Classification Errors',
    subtitle: 'Flat vs frequency-selective, fast vs slow',
    pitfalls: [
      {
        title: 'Confusing Flat and Frequency-Selective Fading',
        wrong: 'A system with B_s = 5 MHz and B_c = 1 MHz is experiencing flat fading',
        right: 'Fading is FLAT only when the signal bandwidth B_s ≪ coherence bandwidth B_c. Here B_s = 5 MHz > B_c = 1 MHz → Frequency-Selective Fading. Use equalizers or OFDM.',
        rule: 'Flat fading: B_s ≪ B_c (signal fits within one fade). Frequency-selective: B_s > B_c (different parts of signal fade independently).',
        severity: 'critical',
      },
      {
        title: 'Confusing Fast and Slow Fading',
        wrong: 'A user moving at 60 km/h on a 900 MHz link with 10 ms symbol period experiences fast fading',
        right: 'Coherence time T_c ≈ 0.423/f_d where f_d = v·f_c/c = (60/3.6)×900e6/3e8 = 50 Hz → T_c = 8.5 ms. Symbol period 10 ms > T_c = 8.5 ms → Fast Fading.',
        rule: 'Slow fading: T_s ≪ T_c (channel constant per symbol). Fast fading: T_s > T_c (channel varies within symbol period).',
        severity: 'moderate',
      },
      {
        title: 'Assuming Rayleigh When LOS Exists',
        wrong: 'Applying Rayleigh fading statistics to an indoor WiFi link where the AP is clearly visible',
        right: 'When a dominant LOS path exists, use Ricean fading. The K-factor = LOS power / scatter power. K → ∞ is AWGN (no fading), K = 0 is Rayleigh.',
        rule: 'Rayleigh = NLOS only (no dominant path). Ricean = LOS + multipath. The K-factor quantifies the LOS dominance.',
        severity: 'moderate',
      },
    ],
  },
  {
    id: 'shannon',
    icon: Zap,
    color: '#06b6d4',
    title: 'Shannon Capacity Mistakes',
    subtitle: 'Misinterpreting the capacity formula',
    pitfalls: [
      {
        title: 'Treating Shannon Capacity as Achievable Throughput',
        wrong: 'A 10 MHz LTE channel with SNR = 20 dB can deliver C = 10M × log₂(101) ≈ 66 Mbps to each user',
        right: 'Shannon capacity is the theoretical MAXIMUM. Practical systems achieve 40–70% of it due to coding overhead, guard intervals, pilot signals, MAC overhead, and retransmissions. Expect 30–45 Mbps.',
        rule: 'C = B·log₂(1+SNR) is an upper bound, not a real-world target. Always apply a practical efficiency factor (50–70%).',
        severity: 'critical',
      },
      {
        title: 'Using SNR in dB Directly in the Formula',
        wrong: 'C = B·log₂(1 + 20) when SNR = 20 dB',
        right: 'The formula requires LINEAR SNR! SNR = 20 dB → SNR_linear = 10^(20/10) = 100. Therefore C = B·log₂(1 + 100) = B·6.66 bits/Hz.',
        rule: 'Always convert SNR from dB to linear (ratio) before plugging into C = B·log₂(1 + SNR). This is the most common Shannon mistake.',
        severity: 'critical',
      },
      {
        title: 'Forgetting Noise Bandwidth in SNR Calculation',
        wrong: 'Computing SNR as just P_rx/P_noise where P_noise is thermal power at a fixed reference BW',
        right: 'Thermal noise power N = kTB where B is the RECEIVER BANDWIDTH, not some reference. N scales with B. Doubling bandwidth doubles noise power by 3 dB.',
        rule: 'N(dBm) = −174 dBm/Hz + 10·log₁₀(B). The bandwidth in the SNR must match the channel bandwidth.',
        severity: 'moderate',
      },
    ],
  },
  {
    id: 'antenna',
    icon: Radio,
    color: '#10b981',
    title: 'Antenna & Beamforming Errors',
    subtitle: 'Gain, patterns, and array misconceptions',
    pitfalls: [
      {
        title: 'Confusing Antenna Gain with Amplification',
        wrong: 'A 20 dBi antenna amplifies signals by 100× in all directions',
        right: 'Antennas are passive — they cannot create power. They REDIRECT power. A 20 dBi gain means 100× more power in the main beam direction compared to an isotropic radiator, but at the cost of reduced power in other directions.',
        rule: 'Antenna gain = directivity × efficiency. High gain = narrow beam. Total radiated power is conserved (Σ = 1 for lossless).',
        severity: 'moderate',
      },
      {
        title: 'Linear vs Quadratic Phased Array Gain Scaling',
        wrong: 'A 16-element phased array provides 16× (12 dB) gain improvement vs a single element',
        right: 'An N-element phased array coherently combines both Tx and Rx. Total SNR gain = N² = 16² = 256 = 24 dB for two-way (beamforming both ends). For single-end beamforming: gain = N = 16 = 12 dB.',
        rule: 'Single-sided beamforming: gain ∝ N. Both sides: gain ∝ N². This is why massive MIMO (256+ antennas) is so powerful.',
        severity: 'moderate',
      },
      {
        title: 'Ignoring Half-Power Beamwidth vs Coverage',
        wrong: 'A 120° sector antenna covers exactly 1/3 of the horizon uniformly',
        right: 'The 120° figure refers to the 3 dB beamwidth — at the beam edges, power is already halved (−3 dB). Coverage degrades further toward the horizon. Always use the full radiation pattern for planning.',
        rule: 'HPBW is not "coverage width". Users at the beam edge experience 3 dB less gain than users in the bore-sight direction.',
        severity: 'low',
      },
    ],
  },
  {
    id: 'units',
    icon: Settings,
    color: '#ec4899',
    title: 'Units & Frequency Conversion Errors',
    subtitle: 'The small mistakes that invalidate big calculations',
    pitfalls: [
      {
        title: 'Forgetting to Convert km to m (or vice versa) in FSPL',
        wrong: 'FSPL = 32.44 + 20·log₁₀(10) + 20·log₁₀(900e6) using d=10 km unmodified',
        right: 'The FSPL formula 32.44 + 20·log₁₀(d_km) + 20·log₁₀(f_MHz) uses d in km and f in MHz. Mixing units shifts the result by ±60 dB!',
        rule: 'FSPL (dB) = 32.44 + 20·log₁₀(d in km) + 20·log₁₀(f in MHz). The 32.44 constant encodes both conversions.',
        severity: 'critical',
      },
      {
        title: 'Wavelength Miscalculation',
        wrong: 'λ = f/c = 2.4e9 / 3e8 = 8 m for 2.4 GHz WiFi',
        right: 'λ = c/f = 3e8 / 2.4e9 = 0.125 m = 12.5 cm. Getting this backwards gives errors of 10⁴× in antenna gain formulas.',
        rule: 'λ = c/f (speed over frequency, NOT frequency over speed). Always sanity-check: 1 GHz → λ ≈ 30 cm.',
        severity: 'critical',
      },
      {
        title: 'Using f in Hz Instead of MHz in Hata Model',
        wrong: 'Okumura-Hata: A = 69.55 + 26.16·log₁₀(1.8e9) instead of log₁₀(1800)',
        right: 'The Okumura-Hata formula requires frequency in MHz, NOT Hz. log₁₀(1800) ≈ 3.255; log₁₀(1.8×10⁹) ≈ 9.255 — a difference of 6, giving 156 dB extra (impossible!) error.',
        rule: 'Always check empirical model units. Hata uses f in MHz (150–1500). Input in Hz gives nonsensical results.',
        severity: 'critical',
      },
    ],
  },
];

const severityConfig = {
  critical: { label: 'Critical', color: '#ef4444', bg: '#ef444420' },
  moderate: { label: 'Moderate', color: '#f59e0b', bg: '#f59e0b20' },
  low: { label: 'Low', color: '#06b6d4', bg: '#06b6d420' },
};

export default function EngPitfalls() {
  const [openCategoryId, setOpenCategoryId] = useState('decibels');
  const [openPitfallIdx, setOpenPitfallIdx] = useState(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-[var(--color-accent-amber)]/20">
          <AlertTriangle className="w-8 h-8 text-[var(--color-accent-amber)]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Common Pitfalls</h1>
          <p className="text-white/60">
            The most frequent mistakes in wireless engineering exams and practice — with clear
            corrections and rules to remember.
          </p>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { value: '6', label: 'Pitfall Categories', color: '#ef4444' },
          { value: '18', label: 'Common Mistakes', color: '#f59e0b' },
          { value: '100%', label: 'Exam Relevant', color: '#10b981' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4 text-center"
            style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}30` }}
          >
            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs text-white/50 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="space-y-4">
        {pitfallCategories.map((category) => {
          const Icon = category.icon;
          const isOpen = openCategoryId === category.id;

          return (
            <div
              key={category.id}
              className="rounded-2xl border transition-all duration-300 overflow-hidden"
              style={{
                background: isOpen
                  ? `color-mix(in srgb, ${category.color} 5%, oklch(0.16 0.018 260))`
                  : 'oklch(0.16 0.018 260)',
                borderColor: isOpen ? `${category.color}50` : 'oklch(0.25 0.015 260)',
              }}
            >
              {/* Category Header */}
              <button
                className="w-full flex items-center gap-4 p-5 text-left"
                onClick={() => {
                  setOpenCategoryId(isOpen ? null : category.id);
                  setOpenPitfallIdx(null);
                }}
              >
                <div
                  className="p-2.5 rounded-lg flex-shrink-0"
                  style={{ background: `${category.color}22` }}
                >
                  <Icon className="w-5 h-5" style={{ color: category.color }} />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{category.title}</h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${category.color}22`, color: category.color }}
                    >
                      {category.pitfalls.length} pitfalls
                    </span>
                  </div>
                  <p className="text-sm text-white/40 mt-0.5">{category.subtitle}</p>
                </div>
                {isOpen
                  ? <ChevronUp className="w-5 h-5 text-white/30 flex-shrink-0" />
                  : <ChevronDown className="w-5 h-5 text-white/30 flex-shrink-0" />}
              </button>

              {/* Pitfalls List */}
              {isOpen && (
                <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-5">
                  {category.pitfalls.map((pitfall, idx) => {
                    const sev = severityConfig[pitfall.severity];
                    const isExpanded = openPitfallIdx === idx;

                    return (
                      <div
                        key={idx}
                        className="rounded-xl overflow-hidden"
                        style={{
                          background: 'oklch(0.13 0.015 260)',
                          border: '1px solid oklch(0.22 0.015 260)',
                        }}
                      >
                        {/* Pitfall Header */}
                        <button
                          className="w-full flex items-center gap-3 p-4 text-left"
                          onClick={() => setOpenPitfallIdx(isExpanded ? null : idx)}
                        >
                          <AlertTriangle
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: sev.color }}
                          />
                          <span className="flex-grow font-medium text-white/90 text-sm">{pitfall.title}</span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: sev.bg, color: sev.color }}
                          >
                            {sev.label}
                          </span>
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-white/30 flex-shrink-0" />
                            : <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />}
                        </button>

                        {/* Pitfall Detail */}
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-4">
                            {/* Wrong */}
                            <div className="rounded-lg p-3 flex gap-3" style={{ background: '#ef444415', border: '1px solid #ef444430' }}>
                              <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                              <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">Wrong ✗</div>
                                <p className="text-sm text-white/70 font-mono">{pitfall.wrong}</p>
                              </div>
                            </div>

                            {/* Right */}
                            <div className="rounded-lg p-3 flex gap-3" style={{ background: '#10b98115', border: '1px solid #10b98130' }}>
                              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                              <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">Correct ✓</div>
                                <p className="text-sm text-white/70 font-mono">{pitfall.right}</p>
                              </div>
                            </div>

                            {/* Rule */}
                            <div
                              className="rounded-lg p-3 flex gap-3"
                              style={{ background: `${category.color}10`, border: `1px solid ${category.color}25` }}
                            >
                              <span className="text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: category.color }}>📌</span>
                              <div>
                                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: category.color }}>
                                  Golden Rule
                                </div>
                                <p className="text-sm text-white/80 font-medium">{pitfall.rule}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Reference Card */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'oklch(0.18 0.025 260)', border: '1px solid oklch(0.28 0.02 260)' }}
      >
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-green)]" />
          Pre-Calculation Checklist
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            'Are all powers in the same unit (dBm or dBW)?',
            'Is frequency in the correct unit for the model (MHz, GHz, Hz)?',
            'Is distance in km for FSPL formula (32.44 constant)?',
            'Is the path loss model valid for this frequency & environment?',
            'Have I added shadowing margin for coverage probability?',
            'Is my SNR in linear (not dB) for Shannon formula?',
            'Does the fading type match B_s vs B_c and T_s vs T_c?',
            'Are antenna gains in dBi (not dBd) in the link budget?',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-white/60">
              <div className="w-4 h-4 rounded border border-white/20 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
