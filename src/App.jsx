import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';

/* Lazy-loaded pages — Fundamentals */
const HomePage = lazy(() => import('./sections/home/HomePage'));
const FundamentalsIndex = lazy(() => import('./sections/fundamentals/FundamentalsIndex'));
const WhatIsAWave = lazy(() => import('./sections/fundamentals/WhatIsAWave'));
const EMSpectrum = lazy(() => import('./sections/fundamentals/EMSpectrum'));
const Decibels = lazy(() => import('./sections/fundamentals/Decibels'));
const CellularConcept = lazy(() => import('./sections/fundamentals/CellularConcept'));

/* Section 2 — Antennas */
const AntennasIndex = lazy(() => import('./sections/antennas/AntennasIndex'));
const AntennaTypes = lazy(() => import('./sections/antennas/AntennaTypes'));
const RadiationPatterns = lazy(() => import('./sections/antennas/RadiationPatterns'));
const Beamforming = lazy(() => import('./sections/antennas/Beamforming'));
const Polarization = lazy(() => import('./sections/antennas/Polarization'));

/* Section 3 — Propagation */
const PropagationIndex = lazy(() => import('./sections/propagation/PropagationIndex'));
const Reflection = lazy(() => import('./sections/propagation/Reflection'));
const Diffraction = lazy(() => import('./sections/propagation/Diffraction'));
const Scattering = lazy(() => import('./sections/propagation/Scattering'));
const PhasorSum = lazy(() => import('./sections/propagation/PhasorSum'));

/* Section 4 — Large-Scale Fading */
const LargeScaleIndex = lazy(() => import('./sections/large-scale-fading/LargeScaleIndex'));
const FreeSpacePathLoss = lazy(() => import('./sections/large-scale-fading/FreeSpacePathLoss'));
const TwoRayModel = lazy(() => import('./sections/large-scale-fading/TwoRayModel'));
const OkumuraHata = lazy(() => import('./sections/large-scale-fading/OkumuraHata'));
const Shadowing = lazy(() => import('./sections/large-scale-fading/Shadowing'));

/* Section 5 — Small-Scale Fading */
const SmallScaleIndex = lazy(() => import('./sections/small-scale-fading/SmallScaleIndex'));
const PowerDelayProfile = lazy(() => import('./sections/small-scale-fading/PowerDelayProfile'));
const DelaySpread = lazy(() => import('./sections/small-scale-fading/DelaySpread'));
const DopplerSpread = lazy(() => import('./sections/small-scale-fading/DopplerSpread'));
const RayleighRicean = lazy(() => import('./sections/small-scale-fading/RayleighRicean'));
const FadingSimulator = lazy(() => import('./sections/small-scale-fading/FadingSimulator'));

/* Section 6 — Diversity */
const DiversityIndex = lazy(() => import('./sections/diversity/DiversityIndex'));
const DiversityConcept = lazy(() => import('./sections/diversity/DiversityConcept'));
const CombiningMethods = lazy(() => import('./sections/diversity/CombiningMethods'));
const RakeReceiver = lazy(() => import('./sections/diversity/RakeReceiver'));

/* Section 7 — Modulation */
const ModulationIndex = lazy(() => import('./sections/modulation/ModulationIndex'));
const ConstellationDiagrams = lazy(() => import('./sections/modulation/ConstellationDiagrams'));
const PulseShaping = lazy(() => import('./sections/modulation/PulseShaping'));
const GMSK = lazy(() => import('./sections/modulation/GMSK'));
const BERinFading = lazy(() => import('./sections/modulation/BERinFading'));

/* Section 8 — Multiple Access */
const MultipleAccessIndex = lazy(() => import('./sections/multiple-access/MultipleAccessIndex'));
const AccessComparison = lazy(() => import('./sections/multiple-access/AccessComparison'));
const CDMASpreading = lazy(() => import('./sections/multiple-access/CDMASpreading'));

/* Section 9 — GSM System */
const GSMIndex = lazy(() => import('./sections/gsm/GSMIndex'));
const GSMFrameStructure = lazy(() => import('./sections/gsm/GSMFrameStructure'));
const GSMSignalProcessing = lazy(() => import('./sections/gsm/GSMSignalProcessing'));
const GSMSpeechCoding = lazy(() => import('./sections/gsm/GSMSpeechCoding'));
const GSMHandover = lazy(() => import('./sections/gsm/GSMHandover'));

/* Section 10 — Playground */
const PlaygroundIndex = lazy(() => import('./sections/playground/PlaygroundIndex'));
const LinkBudget = lazy(() => import('./sections/playground/LinkBudget'));
const PropComparator = lazy(() => import('./sections/playground/PropComparator'));
const FadingPro = lazy(() => import('./sections/playground/FadingPro'));
const ArrayDesigner = lazy(() => import('./sections/playground/ArrayDesigner'));
const ConstellationViz = lazy(() => import('./sections/playground/ConstellationViz'));

const ComingSoon = lazy(() => import('./sections/shared/ComingSoon'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: 'var(--color-accent-teal)', borderTopColor: 'transparent' }} />
        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Loading...</span>
      </div>
    </div>
  );
}

function SuspenseWrap({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <SuspenseWrap><HomePage /></SuspenseWrap> },

      /* Section 1 — Fundamentals */
      { path: 'fundamentals', element: <SuspenseWrap><FundamentalsIndex /></SuspenseWrap> },
      { path: 'fundamentals/waves', element: <SuspenseWrap><WhatIsAWave /></SuspenseWrap> },
      { path: 'fundamentals/em-spectrum', element: <SuspenseWrap><EMSpectrum /></SuspenseWrap> },
      { path: 'fundamentals/decibels', element: <SuspenseWrap><Decibels /></SuspenseWrap> },
      { path: 'fundamentals/cellular-concept', element: <SuspenseWrap><CellularConcept /></SuspenseWrap> },

      /* Section 2 — Antennas */
      { path: 'antennas', element: <SuspenseWrap><AntennasIndex /></SuspenseWrap> },
      { path: 'antennas/types', element: <SuspenseWrap><AntennaTypes /></SuspenseWrap> },
      { path: 'antennas/radiation-patterns', element: <SuspenseWrap><RadiationPatterns /></SuspenseWrap> },
      { path: 'antennas/beamforming', element: <SuspenseWrap><Beamforming /></SuspenseWrap> },
      { path: 'antennas/polarization', element: <SuspenseWrap><Polarization /></SuspenseWrap> },

      /* Section 3 — Propagation */
      { path: 'propagation', element: <SuspenseWrap><PropagationIndex /></SuspenseWrap> },
      { path: 'propagation/reflection', element: <SuspenseWrap><Reflection /></SuspenseWrap> },
      { path: 'propagation/diffraction', element: <SuspenseWrap><Diffraction /></SuspenseWrap> },
      { path: 'propagation/scattering', element: <SuspenseWrap><Scattering /></SuspenseWrap> },
      { path: 'propagation/phasor-sum', element: <SuspenseWrap><PhasorSum /></SuspenseWrap> },

      /* Section 4 — Large-Scale Fading */
      { path: 'large-scale-fading', element: <SuspenseWrap><LargeScaleIndex /></SuspenseWrap> },
      { path: 'large-scale-fading/fspl', element: <SuspenseWrap><FreeSpacePathLoss /></SuspenseWrap> },
      { path: 'large-scale-fading/two-ray', element: <SuspenseWrap><TwoRayModel /></SuspenseWrap> },
      { path: 'large-scale-fading/okumura-hata', element: <SuspenseWrap><OkumuraHata /></SuspenseWrap> },
      { path: 'large-scale-fading/shadowing', element: <SuspenseWrap><Shadowing /></SuspenseWrap> },

      /* Section 5 — Small-Scale Fading */
      { path: 'small-scale-fading', element: <SuspenseWrap><SmallScaleIndex /></SuspenseWrap> },
      { path: 'small-scale-fading/pdp', element: <SuspenseWrap><PowerDelayProfile /></SuspenseWrap> },
      { path: 'small-scale-fading/delay-spread', element: <SuspenseWrap><DelaySpread /></SuspenseWrap> },
      { path: 'small-scale-fading/doppler', element: <SuspenseWrap><DopplerSpread /></SuspenseWrap> },
      { path: 'small-scale-fading/rayleigh-ricean', element: <SuspenseWrap><RayleighRicean /></SuspenseWrap> },
      { path: 'small-scale-fading/fading-simulator', element: <SuspenseWrap><FadingSimulator /></SuspenseWrap> },

      /* Section 6 — Diversity */
      { path: 'diversity', element: <SuspenseWrap><DiversityIndex /></SuspenseWrap> },
      { path: 'diversity/concept', element: <SuspenseWrap><DiversityConcept /></SuspenseWrap> },
      { path: 'diversity/combining', element: <SuspenseWrap><CombiningMethods /></SuspenseWrap> },
      { path: 'diversity/rake', element: <SuspenseWrap><RakeReceiver /></SuspenseWrap> },

      /* Section 7 — Modulation */
      { path: 'modulation', element: <SuspenseWrap><ModulationIndex /></SuspenseWrap> },
      { path: 'modulation/constellation', element: <SuspenseWrap><ConstellationDiagrams /></SuspenseWrap> },
      { path: 'modulation/pulse-shaping', element: <SuspenseWrap><PulseShaping /></SuspenseWrap> },
      { path: 'modulation/gmsk', element: <SuspenseWrap><GMSK /></SuspenseWrap> },
      { path: 'modulation/ber-fading', element: <SuspenseWrap><BERinFading /></SuspenseWrap> },
      /* Section 8 — Multiple Access */
      { path: 'multiple-access', element: <SuspenseWrap><MultipleAccessIndex /></SuspenseWrap> },
      { path: 'multiple-access/comparison', element: <SuspenseWrap><AccessComparison /></SuspenseWrap> },
      { path: 'multiple-access/cdma', element: <SuspenseWrap><CDMASpreading /></SuspenseWrap> },

      /* Section 9 — GSM System */
      { path: 'gsm', element: <SuspenseWrap><GSMIndex /></SuspenseWrap> },
      { path: 'gsm/frame-structure', element: <SuspenseWrap><GSMFrameStructure /></SuspenseWrap> },
      { path: 'gsm/signal-processing', element: <SuspenseWrap><GSMSignalProcessing /></SuspenseWrap> },
      { path: 'gsm/speech-coding', element: <SuspenseWrap><GSMSpeechCoding /></SuspenseWrap> },
      { path: 'gsm/handover', element: <SuspenseWrap><GSMHandover /></SuspenseWrap> },

      /* Section 10 — Playground */
      { path: 'playground', element: <SuspenseWrap><PlaygroundIndex /></SuspenseWrap> },
      { path: 'playground/link-budget', element: <SuspenseWrap><LinkBudget /></SuspenseWrap> },
      { path: 'playground/propagation-comparator', element: <SuspenseWrap><PropComparator /></SuspenseWrap> },
      { path: 'playground/fading-pro', element: <SuspenseWrap><FadingPro /></SuspenseWrap> },
      { path: 'playground/array-designer', element: <SuspenseWrap><ArrayDesigner /></SuspenseWrap> },
      { path: 'playground/constellation', element: <SuspenseWrap><ConstellationViz /></SuspenseWrap> },

      /* Future sections — placeholders */
      { path: 'toolkit/*', element: <SuspenseWrap><ComingSoon /></SuspenseWrap> },

      /* Catch-all */
      { path: '*', element: <SuspenseWrap><ComingSoon /></SuspenseWrap> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
