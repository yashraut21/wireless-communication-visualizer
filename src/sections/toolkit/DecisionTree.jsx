import { useState } from 'react';
import { GitMerge, ArrowRight, RotateCcw, CheckCircle2, ExternalLink } from 'lucide-react';
import { MathText } from '../../components/math/MathText';
import { Link } from 'react-router-dom';

const treeNodes = {
  start: {
    question: "What scale of fading are you analyzing?",
    options: [
      { text: "Large-Scale (Path Loss & Shadowing)", next: "large_scale" },
      { text: "Small-Scale (Multipath Fading)", next: "small_scale" }
    ]
  },
  large_scale: {
    question: "Is there a direct Line-of-Sight (LOS) without major obstacles?",
    options: [
      { text: "Yes — clear LOS in free space (e.g. satellite link).", next: "fspl" },
      { text: "Yes — but with ground reflection (e.g. cellular tower over flat terrain).", next: "tworay" },
      { text: "No — environment is cluttered (Urban/Suburban NLOS).", next: "empirical" }
    ]
  },
  fspl: {
    result: "Free Space Path Loss (FSPL)",
    color: '#06b6d4',
    description: "Path loss exponent $n=2$. $P_{rx}$ falls off proportional to $1/d^2$ and $1/f_c^2$. Ideal for satellites and direct microwave links.",
    formula: "L_{fs} = 32.44 + 20\\log_{10}(d_{km}) + 20\\log_{10}(f_{MHz})",
    link: "/large-scale-fading/fspl",
    rules: ["Every decade in distance → +20 dB loss", "Every decade in frequency → +20 dB loss", "Doubling the distance → +6 dB loss"]
  },
  tworay: {
    result: "Two-Ray Ground Reflection Model",
    color: '#8b5cf6',
    description: "For large distances past the breakpoint $d_f = 4h_t h_r / \\lambda$, path loss exponent becomes $n=4$. Signal falls off proportional to $1/d^4$ and becomes independent of frequency!",
    formula: "P_r \\approx P_t G_t G_r \\frac{h_t^2 h_r^2}{d^4}",
    link: "/large-scale-fading/two-ray",
    rules: ["Valid only for d >> d_f (breakpoint)", "40 dB/decade path loss (vs 20 for FSPL)", "Frequency disappears from formula — height matters!"]
  },
  empirical: {
    question: "What is the carrier frequency ($f_c$)?",
    options: [
      { text: "150 MHz – 1500 MHz (GSM/CDMA range)", next: "okumura" },
      { text: "1500 MHz – 2000 MHz (PCS/early 3G)", next: "cost231" }
    ]
  },
  okumura: {
    result: "Okumura-Hata Model",
    color: '#f59e0b',
    description: "The standard empirical model for cellular planning at 150–1500 MHz in urban, suburban, and rural environments (GSM, CDMA).",
    formula: "L_u = 69.55 + 26.16\\log_{10}(f_c) - 13.82\\log_{10}(h_b) - a(h_m) + (44.9 - 6.55\\log_{10}(h_b))\\log_{10}(d)",
    link: "/large-scale-fading/okumura-hata",
    rules: ["Valid: 150–1500 MHz, 1–20 km, h_b = 30–200 m", "Add 6–10 dB shadowing margin for cell edge", "Reduce by 9.55 dB for suburban, 28.4 dB for rural"]
  },
  cost231: {
    result: "COST-231 Hata Model",
    color: '#ec4899',
    description: "An extension of Okumura-Hata for the 1500–2000 MHz range used in PCS and early 3G/4G networks. Adds a correction factor C_m (0 dB for medium cities, 3 dB for large cities).",
    formula: "L_u = 46.3 + 33.9\\log_{10}(f_c) - 13.82\\log_{10}(h_b) - a(h_m) + (44.9 - 6.55\\log_{10}(h_b))\\log_{10}(d) + C_m",
    link: null,
    rules: ["Valid: 1500–2000 MHz", "C_m = 0 dB (medium cities), 3 dB (metropolitan)"]
  },
  small_scale: {
    question: "Is there a dominant, stationary LOS path among the multipath components?",
    options: [
      { text: "Yes — strong LOS exists along with scattered multipath.", next: "ricean" },
      { text: "No — all paths are reflected/scattered (pure NLOS).", next: "rayleigh" }
    ]
  },
  ricean: {
    result: "Ricean Fading",
    color: '#10b981',
    description: "The K-factor quantifies the dominance of the LOS path: $K = A^2 / (2\\sigma^2)$. As $K \\to 0$, it converges to Rayleigh. As $K \\to \\infty$, it approaches AWGN (no fading).",
    formula: "p(r) = \\frac{r}{\\sigma^2}e^{-\\frac{r^2+A^2}{2\\sigma^2}}I_0\\!\\left(\\frac{rA}{\\sigma^2}\\right)",
    link: "/small-scale-fading/rayleigh-ricean",
    rules: ["K > 6 dB → mild fading (indoor WiFi with LOS)", "K ~ 0 dB → moderate fading (suburban)", "K → 0 (linear) = Rayleigh fading"]
  },
  rayleigh: {
    result: "Rayleigh Fading",
    color: '#ef4444',
    description: "The worst-case fading scenario — no dominant path. Signal amplitude follows a Rayleigh PDF. Mean received power = $2\\sigma^2$. Probability of deep fade (below threshold) is exponential.",
    formula: "p(r) = \\frac{r}{\\sigma^2}e^{-\\frac{r^2}{2\\sigma^2}}, \\quad r \\geq 0",
    link: "/small-scale-fading/rayleigh-ricean",
    rules: ["Envelope = magnitude of 2 Gaussian RVs", "P(SNR < threshold) ≈ threshold / mean SNR", "Use diversity combining to combat this!"]
  }
};

export default function DecisionTree() {
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [history, setHistory] = useState([]);

  const currentNode = treeNodes[currentNodeId];

  const handleOptionSelect = (nextId) => {
    setHistory([...history, currentNodeId]);
    setCurrentNodeId(nextId);
  };

  const handleReset = () => {
    setCurrentNodeId('start');
    setHistory([]);
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const prev = newHistory.pop();
    setHistory(newHistory);
    setCurrentNodeId(prev);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="border-b border-white/10 pb-6 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-[var(--color-accent-green)]/20">
          <GitMerge className="w-8 h-8 text-[var(--color-accent-green)]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Which Model?</h1>
          <p className="text-white/60">Answer the questions to find the correct propagation or fading model for your scenario.</p>
        </div>
      </div>

      {/* Progress breadcrumb */}
      {history.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-white/30 flex-wrap">
          {history.map((id, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded bg-white/5 text-white/50">
                {treeNodes[id]?.result ?? treeNodes[id]?.question?.slice(0, 30) + '…'}
              </span>
              <ArrowRight className="w-3 h-3" />
            </span>
          ))}
        </div>
      )}

      <div className="glass-panel p-8 rounded-2xl min-h-[400px] flex flex-col" style={{ background: 'oklch(0.16 0.018 260)', border: '1px solid oklch(0.25 0.015 260)' }}>
        {currentNode.result ? (
          /* ── Result view ── */
          <div className="flex-grow flex flex-col animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${currentNode.color}25` }}
              >
                <CheckCircle2 className="w-6 h-6" style={{ color: currentNode.color }} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: currentNode.color }}>
                  Recommended Model
                </div>
                <h2 className="text-2xl font-bold text-white">{currentNode.result}</h2>
              </div>
            </div>

            <p className="text-white/70 mb-5 leading-relaxed">
              <MathText text={currentNode.description} />
            </p>

            {/* Formula */}
            <div
              className="rounded-xl p-4 mb-5 overflow-x-auto"
              style={{ background: 'oklch(0.12 0.015 260)', border: `1px solid ${currentNode.color}30` }}
            >
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: currentNode.color }}>
                Key Formula
              </div>
              <div className="text-center py-2">
                <MathText text={`$${currentNode.formula}$`} />
              </div>
            </div>

            {/* Practical rules */}
            <div className="space-y-2 mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-white/30 mb-2">
                Practical Rules
              </div>
              {currentNode.rules?.map((rule, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-white/30 mt-0.5">→</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/10">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                Start Over
              </button>
              {currentNode.link && (
                <Link
                  to={currentNode.link}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: `${currentNode.color}22`, color: currentNode.color }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Go to Full Module
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* ── Question view ── */
          <div className="flex-grow flex flex-col animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-8">
              <MathText text={currentNode.question} />
            </h2>
            <div className="space-y-3 flex-grow">
              {currentNode.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option.next)}
                  className="w-full text-left p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--color-accent-green)] hover:bg-[var(--color-accent-green)]/5 transition-all group flex items-center justify-between"
                >
                  <span className="text-base text-white/90 group-hover:text-white leading-snug pr-4">
                    {option.text}
                  </span>
                  <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-[var(--color-accent-green)] group-hover:translate-x-1 transition-all flex-shrink-0" />
                </button>
              ))}
            </div>

            {history.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={handleBack}
                  className="text-white/50 hover:text-white transition-colors text-sm font-medium"
                >
                  ← Back to previous question
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
