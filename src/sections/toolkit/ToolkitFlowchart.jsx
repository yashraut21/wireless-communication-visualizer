import { useState } from 'react';
import { ArrowRight, CheckCircle2, Circle, BookOpen } from 'lucide-react';
import { MathText } from '../../components/math/MathText';
import { EquationCard } from '../../components/math/Equation';

const steps = [
  {
    id: 'define',
    title: '1. Define the Scenario',
    questions: [
      'What is the operating frequency ($f_c$)?',
      'What is the distance between Tx and Rx ($d$)?',
      'What is the environment? (Urban, Rural, Indoor, Free Space)'
    ],
    tip: 'Higher frequencies (like mmWave) have significantly higher Free Space Path Loss. Environment determines your path loss exponent ($n$).',
  },
  {
    id: 'large-scale',
    title: '2. Large-Scale Propagation Analysis',
    questions: [
      'Is there a direct Line-of-Sight (LOS)?',
      'If LOS: Calculate Free Space Path Loss (FSPL) and Two-Ray Model.',
      'If Non-LOS: Choose empirical model (Okumura-Hata, COST231) or calculate shadowing variance.'
    ],
    tip: 'Ensure you add Log-Normal Shadowing margin (typically 6–10 dB) to ensure reliability at the cell edge.',
  },
  {
    id: 'small-scale',
    title: '3. Small-Scale Fading Analysis',
    questions: [
      'Is the receiver moving? (Determines Doppler Spread & Fast vs Slow Fading)',
      'Are there many reflectors? (Determines Delay Spread & Flat vs Frequency-Selective Fading)',
      'Is there a dominant path? (Rayleigh vs Ricean Fading)'
    ],
    tip: 'If signal bandwidth > coherence bandwidth, you have frequency-selective fading. Use OFDM or equalizers.',
  },
  {
    id: 'link-budget',
    title: '4. Link Budget Calculation',
    questions: [
      'Calculate Total Tx Power: $P_{tx} + G_{tx}$ (EIRP)',
      'Subtract Losses: Path Loss, Shadowing Margin, Cable Losses',
      'Add Rx Gain: $G_{rx}$',
      'Calculate Received Power ($P_{rx}$) and SNR.'
    ],
    tip: 'Remember that $P_{rx}$ must be greater than Receiver Sensitivity ($S_{rx}$) plus the required fade margin.',
  },
  {
    id: 'capacity',
    title: '5. Capacity & Network Planning',
    questions: [
      'Calculate Shannon Capacity: $C = B \\log_2(1 + \\text{SNR})$',
      'If capacity is insufficient: Increase Bandwidth, use MIMO, or decrease cell size.',
      'Determine frequency reuse factor and cluster size ($K$).'
    ],
    tip: 'Cellular networks are usually interference-limited, not noise-limited. Lower cluster sizes give more capacity but more co-channel interference.',
  }
];

const refFormulas = [
  { title: 'FSPL (dB)', math: 'L_{fs} = 32.44 + 20\\log_{10}(d_{km}) + 20\\log_{10}(f_{MHz})' },
  { title: 'Two-Ray Far-Field', math: 'P_r \\approx P_t G_t G_r \\frac{h_t^2 h_r^2}{d^4}' },
  { title: 'Shannon Capacity', math: 'C = B \\log_2(1 + \\text{SNR})' },
  { title: 'Max Doppler Shift', math: 'f_m = \\frac{v \\cdot f_c}{c}' },
  { title: 'Coherence Bandwidth', math: 'B_c \\approx \\frac{1}{5\\sigma_\\tau}' },
  { title: 'Coherence Time', math: 'T_c \\approx \\frac{0.423}{f_m}' },
];

export default function ToolkitFlowchart() {
  const [activeStep, setActiveStep] = useState(0);
  const [showRef, setShowRef] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="border-b border-white/10 pb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Problem-Solving Flowchart</h1>
          <p className="text-white/60">A systematic methodology for tackling wireless engineering problems step by step.</p>
        </div>
        <button
          onClick={() => setShowRef(!showRef)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium flex-shrink-0 transition-all"
          style={{
            borderColor: showRef ? 'var(--color-accent-green)' : 'oklch(0.30 0.02 260)',
            color: showRef ? 'var(--color-accent-green)' : 'var(--color-text-secondary)',
            background: showRef ? 'color-mix(in oklch, var(--color-accent-green) 10%, transparent)' : 'transparent',
          }}
        >
          <BookOpen className="w-4 h-4" />
          Formula Reference
        </button>
      </div>

      {/* Collapsible Formula Reference Card */}
      {showRef && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {refFormulas.map((f) => (
            <EquationCard key={f.title} title={f.title} math={f.math} />
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Flowchart */}
        <div className="md:w-1/3 flex flex-col gap-3">
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isPast = index < activeStep;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(index)}
                className={`flex items-start text-left p-4 rounded-xl transition-all ${
                  isActive
                    ? 'bg-white/10 border border-[var(--color-accent-green)] shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                    : 'bg-white/5 border border-white/5 hover:border-white/20'
                }`}
              >
                <div className="mr-3 mt-1">
                  {isPast ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-green)]" />
                  ) : isActive ? (
                    <Circle className="w-5 h-5 text-[var(--color-accent-green)] fill-[var(--color-accent-green)]/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-white/30" />
                  )}
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-white/70'}`}>
                    {step.title}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail View */}
        <div className="md:w-2/3">
          <div className="glass-panel p-8 rounded-2xl h-full flex flex-col" style={{ background: 'oklch(0.16 0.018 260)', border: '1px solid oklch(0.25 0.015 260)' }}>
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">
              {steps[activeStep].title}
            </h2>

            <div className="flex-grow space-y-6">
              <div>
                <h3 className="text-[var(--color-accent-green)] font-semibold mb-3 flex items-center gap-2">
                  Key Questions / Actions
                </h3>
                <ul className="space-y-3">
                  {steps[activeStep].questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/80">
                      <ArrowRight className="w-4 h-4 mt-1 text-[var(--color-accent-green)] flex-shrink-0" />
                      <MathText text={q} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-accent-green)]/10 border border-[var(--color-accent-green)]/20">
                <p className="text-sm text-[var(--color-accent-green)]">
                  <span className="font-bold">Engineer's Tip: </span>
                  <MathText text={steps[activeStep].tip} />
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between">
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Previous
              </button>
              <span className="text-white/30 text-sm self-center">
                Step {activeStep + 1} of {steps.length}
              </span>
              <button
                onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                disabled={activeStep === steps.length - 1}
                className="px-4 py-2 rounded-lg bg-[var(--color-accent-green)] text-black font-semibold hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none transition-all"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
