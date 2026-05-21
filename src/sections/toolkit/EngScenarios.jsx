import { useState } from 'react';
import { Briefcase, ChevronDown, ChevronUp, Zap, Radio, Wifi, Satellite, Building2, CheckCircle2 } from 'lucide-react';

const scenarios = [
  {
    id: 'mmwave-5g',
    icon: Zap,
    color: '#8b5cf6',
    badge: '5G',
    title: 'Urban 5G mmWave Small-Cell Design',
    summary: 'Design a 28 GHz 5G small-cell link covering 150 m in a dense urban environment.',
    parameters: [
      { label: 'Carrier Frequency', value: '28 GHz' },
      { label: 'Cell Radius', value: '150 m' },
      { label: 'Environment', value: 'Dense Urban (NLOS)' },
      { label: 'Tx Power', value: '30 dBm' },
      { label: 'Tx Antenna Gain', value: '24 dBi (Beamformed)' },
    ],
    steps: [
      {
        title: 'Compute Free Space Path Loss (FSPL)',
        formula: 'FSPL = 32.44 + 20·log₁₀(0.15 km) + 20·log₁₀(28,000 MHz)',
        result: 'FSPL ≈ 32.44 − 16.5 + 88.9 = 104.8 dB',
        insight: 'At 28 GHz, FSPL is very high even at only 150 m — much worse than sub-6 GHz.',
      },
      {
        title: 'Add Clutter & Body Loss for NLOS Urban',
        formula: 'Additional Loss ≈ 15–25 dB (urban clutter) + 3 dB (body loss)',
        result: 'Total Path Loss ≈ 104.8 + 20 + 3 = 127.8 dB',
        insight: 'mmWave signals are easily blocked by buildings, foliage, and even human bodies — NLOS is severe.',
      },
      {
        title: 'Calculate Link Budget',
        formula: 'RSL = Tx Power + Tx Gain − Path Loss + Rx Gain',
        result: 'RSL = 30 + 24 − 127.8 + 0 = −73.8 dBm',
        insight: 'Even with a 24 dBi beamforming array, aggressive gain is needed to close the link.',
      },
      {
        title: 'Check Against Sensitivity & Plan Accordingly',
        formula: 'Typical 5G NR Rx Sensitivity ≈ −90 to −100 dBm at 100 MHz BW',
        result: 'Margin = RSL − Sensitivity ≈ −73.8 − (−95) = +21.2 dB ✓',
        insight: 'The link closes with good margin. In practice, dense small-cell deployment (every 150–200 m) is mandatory for urban mmWave 5G.',
      },
    ],
    conclusion: 'mmWave 5G requires dense small-cell grids, massive beamforming antenna arrays (64–256 elements), and tight NLOS planning. The extreme path loss is the price for the GHz-wide bandwidth that enables Gbps throughput.',
  },
  {
    id: 'gsm-coverage',
    icon: Radio,
    color: '#10b981',
    badge: 'GSM',
    title: 'GSM Cell Coverage Planning (Okumura-Hata)',
    summary: 'Determine the maximum cell radius for a GSM-900 base station in an urban area using the Okumura-Hata model.',
    parameters: [
      { label: 'Carrier Frequency', value: '900 MHz' },
      { label: 'BS Antenna Height', value: '30 m' },
      { label: 'MS Antenna Height', value: '1.5 m' },
      { label: 'Environment', value: 'Urban' },
      { label: 'Max Allowed Path Loss', value: '154 dB' },
    ],
    steps: [
      {
        title: 'Apply Okumura-Hata Urban Formula',
        formula: 'L_u(dB) = 69.55 + 26.16·log₁₀(f_c) − 13.82·log₁₀(h_b) − a(h_m) + (44.9 − 6.55·log₁₀(h_b))·log₁₀(d)',
        result: 'For large city at 900 MHz: a(h_m) = 3.2·(log₁₀(11.75·1.5))² − 4.97 ≈ 0.0 dB',
        insight: 'The mobile antenna height correction factor a(h_m) is near zero for a handset at 1.5 m in a large city.',
      },
      {
        title: 'Compute Model Constants',
        formula: 'L_u = 69.55 + 26.16·(2.954) − 13.82·(1.477) + (44.9 − 6.55·1.477)·log₁₀(d)',
        result: 'L_u = 69.55 + 77.2 − 20.4 + 35.2·log₁₀(d) = 126.3 + 35.2·log₁₀(d)',
        insight: 'The path loss exponent is effectively 3.52 (steeper than free space n=2).',
      },
      {
        title: 'Solve for Maximum Range',
        formula: '154 = 126.3 + 35.2·log₁₀(d_max) → log₁₀(d_max) = 27.7 / 35.2 = 0.787',
        result: 'd_max = 10^0.787 ≈ 6.12 km',
        insight: 'A GSM-900 cell can reliably cover a radius of roughly 6 km in urban areas, much less than the theoretical free-space range.',
      },
      {
        title: 'Apply Shadowing Margin',
        formula: 'Shadowing σ = 8 dB, 90% coverage → margin = 1.28 × 8 = 10.2 dB',
        result: 'Effective L_max = 154 − 10.2 = 143.8 dB → d_max ≈ 4.0 km at 90% coverage',
        insight: 'Shadowing margin significantly reduces the practical cell radius. This is why real GSM cells are often 3–5 km radius in cities.',
      },
    ],
    conclusion: 'Okumura-Hata is the standard empirical planning tool for cellular networks at 150–1500 MHz. Always add a log-normal shadowing margin to guarantee coverage probability. This is why network operators deploy many overlapping cells rather than a few high-power ones.',
  },
  {
    id: 'indoor-wifi',
    icon: Wifi,
    color: '#06b6d4',
    badge: 'WiFi',
    title: 'Indoor WiFi Coverage & Capacity Planning',
    summary: 'Assess 2.4 GHz WiFi coverage in a 40 m × 30 m office and estimate maximum throughput using Shannon capacity.',
    parameters: [
      { label: 'Carrier Frequency', value: '2.4 GHz' },
      { label: 'Office Area', value: '40 m × 30 m' },
      { label: 'AP Tx Power', value: '20 dBm (100 mW)' },
      { label: 'AP Antenna Gain', value: '2 dBi (Omni)' },
      { label: 'Channel Bandwidth', value: '20 MHz' },
    ],
    steps: [
      {
        title: 'Calculate FSPL at Maximum Corner Distance',
        formula: 'Max distance = √(40² + 30²) = 50 m; FSPL = 32.44 + 20·log₁₀(0.05) + 20·log₁₀(2400)',
        result: 'FSPL = 32.44 − 26.0 + 67.6 = 74.1 dB',
        insight: 'At 50 m, free-space loss is moderate. But indoor walls add 5–15 dB per wall penetration.',
      },
      {
        title: 'Add Indoor Partition Loss',
        formula: '2 office partition walls × 8 dB + 1 concrete wall × 15 dB = 31 dB extra loss',
        result: 'Total path loss = 74.1 + 31 = 105.1 dB',
        insight: 'Indoor propagation exponent is n = 2.8–4 depending on building materials. Concrete is the enemy of 2.4 GHz!',
      },
      {
        title: 'Compute Received SNR',
        formula: 'RSL = 20 + 2 − 105.1 = −83.1 dBm; Thermal Noise = −174 + 10·log₁₀(20×10⁶) = −101 dBm',
        result: 'SNR = RSL − Noise = −83.1 − (−101) = 17.9 dB',
        insight: 'SNR of 18 dB is sufficient for 802.11n 64-QAM with MIMO, but barely marginal at the far corner.',
      },
      {
        title: 'Apply Shannon Capacity Theorem',
        formula: 'C = B·log₂(1 + SNR) = 20 MHz × log₂(1 + 63) = 20 × 6 = 120 Mbps (theoretical max)',
        result: 'Practical 802.11n throughput ≈ 40–60 Mbps at this SNR (PHY overhead ≈ 50%)',
        insight: 'Shannon gives the theoretical ceiling. Real 802.11 efficiency is ~50–70% of the PHY rate due to MAC overhead, CSMA, and retransmissions.',
      },
    ],
    conclusion: 'For reliable office WiFi, plan for 2–3 APs in a 1200 m² floor. Use 5 GHz for high-throughput zones (less interference, more channels) and 2.4 GHz for better range through walls. Always perform a site survey — simulation alone is insufficient.',
  },
  {
    id: 'satellite',
    icon: Satellite,
    color: '#f59e0b',
    badge: 'SAT',
    title: 'GEO Satellite Downlink Budget',
    summary: 'Calculate the received power and SNR for a Ku-band (12 GHz) GEO satellite TV broadcast to a 60 cm dish.',
    parameters: [
      { label: 'Frequency', value: '12 GHz (Ku-band)' },
      { label: 'Satellite Altitude', value: '35,786 km (GEO)' },
      { label: 'Satellite EIRP', value: '52 dBW' },
      { label: 'Rx Dish Diameter', value: '0.6 m' },
      { label: 'System Noise Temp', value: '120 K' },
    ],
    steps: [
      {
        title: 'Compute Free Space Path Loss',
        formula: 'FSPL = 32.44 + 20·log₁₀(35,786,000 m / 1000) + 20·log₁₀(12,000 MHz)',
        result: 'FSPL = 32.44 + 20·(4.554) + 20·(4.079) = 32.44 + 91.1 + 81.6 = 205.1 dB',
        insight: 'GEO satellite distance creates an enormous path loss — this is the fundamental challenge of satellite communications.',
      },
      {
        title: 'Calculate Rx Dish Gain',
        formula: 'G = η·(π·D/λ)² = 0.55 × (π × 0.6 / 0.025)² [λ = c/f = 0.025 m at 12 GHz]',
        result: 'G = 0.55 × (75.4)² ≈ 3,127 → G_dBi = 10·log₁₀(3127) ≈ 35.0 dBi',
        insight: 'Even a 60 cm dish achieves 35 dBi gain — crucial to overcoming the 205 dB path loss. Dish gain scales as D².',
      },
      {
        title: 'Calculate Received Signal Power',
        formula: 'P_rx = EIRP − FSPL + G_rx − Misc losses (2 dB rain fade + 1 dB pointing)',
        result: 'P_rx = 52 − 205.1 + 35.0 − 3.0 = −121.1 dBW = −91.1 dBm',
        insight: 'The received power is tiny — less than 10⁻¹² watts — yet sufficient for reliable TV reception with modern LNBs.',
      },
      {
        title: 'Compute G/T and C/N₀',
        formula: 'G/T = G_rx(dBi) − 10·log₁₀(T_sys) = 35.0 − 20.8 = 14.2 dB/K; C/N₀ = EIRP − FSPL + G/T − k',
        result: 'C/N₀ = 52 − 205.1 + 14.2 − (−228.6) = 89.7 dBHz → SNR in 27 MHz BW = 89.7 − 74.3 = 15.4 dB',
        insight: 'G/T (Figure of Merit) is the key satellite link parameter. Boltzmann constant k = −228.6 dBW/K/Hz.',
      },
    ],
    conclusion: 'GEO satellite links rely on extremely high EIRP from powerful spacecraft transponders, precise pointing of parabolic antennas, and low-noise LNBs (Low Noise Block downconverters). Rain fade at Ku-band can cause 3–10 dB attenuation during heavy precipitation — link margins must account for local rain statistics.',
  },
  {
    id: 'urban-snr',
    icon: Building2,
    color: '#ef4444',
    badge: 'LTE',
    title: 'Urban LTE Cell-Edge SNR & Capacity',
    summary: 'Estimate the SNR and achievable data rate at the cell edge of an LTE-1800 (Band 3) base station.',
    parameters: [
      { label: 'Frequency', value: '1800 MHz (Band 3)' },
      { label: 'Cell Radius', value: '1 km (urban)' },
      { label: 'eNB Tx Power', value: '46 dBm (40W)' },
      { label: 'eNB Antenna Gain', value: '18 dBi' },
      { label: 'UE Noise Figure', value: '7 dB' },
    ],
    steps: [
      {
        title: 'Apply Okumura-Hata for Urban 1800 MHz',
        formula: 'L_u = 126.3 + 35.2·log₁₀(1.0) [using pre-computed constants for 1800 MHz, 30m BS, 1.5m MS]',
        result: 'At d = 1 km: L_u = 126.3 + 35.2·(0) = 126.3 dB... but for 1800 MHz: L_u ≈ 140.7 dB',
        insight: 'At higher frequencies, the empirical model constants shift. Path loss at 1800 MHz is roughly 7 dB more than at 900 MHz at the same distance.',
      },
      {
        title: 'Calculate Effective RSL at Cell Edge',
        formula: 'RSL = P_tx + G_tx − L_path − L_body − L_penetration + G_rx',
        result: 'RSL = 46 + 18 − 140.7 − 3 − 10 + 0 = −89.7 dBm',
        insight: 'Body loss (3 dB) and building penetration (10 dB for indoor UEs) are critical to include for realistic planning.',
      },
      {
        title: 'Compute Thermal Noise Floor',
        formula: 'N = kTB + NF = −174 + 10·log₁₀(180,000) + 7 = −174 + 52.6 + 7',
        result: 'N = −114.4 dBm (for a 180 kHz LTE resource block)',
        insight: 'LTE uses 180 kHz per resource block (12 subcarriers × 15 kHz). The noise floor depends on bandwidth allocated.',
      },
      {
        title: 'Estimate SNR and Shannon Capacity',
        formula: 'SNR = RSL − N = −89.7 − (−114.4) = 24.7 dB; C = 180 kHz × log₂(1 + 295) ≈ 1.44 Mbps/RB',
        result: 'With 50 RBs (10 MHz BW): Max DL throughput ≈ 50 × 1.44 ≈ 72 Mbps theoretical; practical ≈ 30–40 Mbps',
        insight: 'Cell-edge SNR of ~25 dB enables high-order modulation (64-QAM). Users close to the eNB see much higher SNR and can use 256-QAM.',
      },
    ],
    conclusion: 'LTE network planning uses the SINR (Signal-to-Interference-plus-Noise Ratio) metric in real deployments, since interference from adjacent cells is often dominant. Techniques like ICIC (Inter-Cell Interference Coordination) and beamforming are used to improve cell-edge performance.',
  },
];

export default function EngScenarios() {
  const [openId, setOpenId] = useState(scenarios[0].id);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-[var(--color-accent-green)]/20">
          <Briefcase className="w-8 h-8 text-[var(--color-accent-green)]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Real-World Scenarios</h1>
          <p className="text-white/60">
            Complete end-to-end engineering case studies with step-by-step analysis, formulas, and practical conclusions.
          </p>
        </div>
      </div>

      {/* Scenario Accordions */}
      <div className="space-y-4">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          const isOpen = openId === scenario.id;

          return (
            <div
              key={scenario.id}
              className="rounded-2xl border transition-all duration-300"
              style={{
                background: isOpen
                  ? `color-mix(in srgb, ${scenario.color} 6%, oklch(0.16 0.018 260))`
                  : 'oklch(0.16 0.018 260)',
                borderColor: isOpen ? `${scenario.color}55` : 'oklch(0.25 0.015 260)',
              }}
            >
              {/* Accordion Header */}
              <button
                className="w-full flex items-center gap-4 p-6 text-left"
                onClick={() => setOpenId(isOpen ? null : scenario.id)}
              >
                <div
                  className="p-2.5 rounded-lg flex-shrink-0"
                  style={{ background: `${scenario.color}22` }}
                >
                  <Icon className="w-5 h-5" style={{ color: scenario.color }} />
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${scenario.color}33`, color: scenario.color }}
                    >
                      {scenario.badge}
                    </span>
                    <h3 className="text-base font-bold text-white truncate">{scenario.title}</h3>
                  </div>
                  <p className="text-sm text-white/50 truncate">{scenario.summary}</p>
                </div>

                <div className="flex-shrink-0 ml-4">
                  {isOpen
                    ? <ChevronUp className="w-5 h-5 text-white/40" />
                    : <ChevronDown className="w-5 h-5 text-white/40" />}
                </div>
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div className="px-6 pb-6 border-t border-white/5 pt-6 space-y-6">
                  {/* Scenario Parameters */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
                      Scenario Parameters
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {scenario.parameters.map((p) => (
                        <div
                          key={p.label}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                          style={{ background: 'oklch(0.20 0.02 260)', border: '1px solid oklch(0.28 0.018 260)' }}
                        >
                          <span className="text-white/40">{p.label}:</span>
                          <span className="font-mono font-semibold text-white/90">{p.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">
                      Step-by-Step Analysis
                    </h4>
                    {scenario.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl p-5"
                        style={{
                          background: 'oklch(0.13 0.015 260)',
                          border: '1px solid oklch(0.22 0.015 260)',
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                            style={{ background: `${scenario.color}33`, color: scenario.color }}
                          >
                            {idx + 1}
                          </div>
                          <div className="flex-grow space-y-2">
                            <h5 className="font-semibold text-white">{step.title}</h5>
                            <div
                              className="text-sm font-mono px-3 py-2 rounded-lg text-white/70"
                              style={{ background: 'oklch(0.18 0.02 260)' }}
                            >
                              {step.formula}
                            </div>
                            <div
                              className="text-sm font-mono px-3 py-2 rounded-lg font-semibold"
                              style={{ background: `${scenario.color}15`, color: scenario.color }}
                            >
                              → {step.result}
                            </div>
                            <p className="text-sm text-white/50 italic">{step.insight}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Conclusion */}
                  <div
                    className="p-5 rounded-xl flex gap-4"
                    style={{
                      background: `${scenario.color}12`,
                      border: `1px solid ${scenario.color}30`,
                    }}
                  >
                    <CheckCircle2
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: scenario.color }}
                    />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: scenario.color }}>
                        Engineering Conclusion
                      </p>
                      <p className="text-sm text-white/70 leading-relaxed">{scenario.conclusion}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
