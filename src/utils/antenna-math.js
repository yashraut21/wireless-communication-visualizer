import { PI } from './constants';

/**
 * Isotropic antenna — gain is 1 (0 dBi) in all directions
 */
export function isotropicGain() {
  return 1;
}

/**
 * Short dipole radiation pattern (normalized)
 * U(θ) = sin²(θ)
 */
export function shortDipolePattern(thetaRad) {
  return Math.pow(Math.sin(thetaRad), 2);
}

/**
 * Half-wave dipole radiation pattern (normalized, approximate)
 * U(θ) ≈ [cos(π/2 · cos θ) / sin θ]²
 */
export function halfWaveDipolePattern(thetaRad) {
  const sinTheta = Math.sin(thetaRad);
  if (Math.abs(sinTheta) < 1e-10) return 0;
  const cosHalf = Math.cos((PI / 2) * Math.cos(thetaRad));
  return Math.pow(cosHalf / sinTheta, 2);
}

/**
 * Directional / patch antenna pattern (approximate cosine model)
 * U(θ) = cos^n(θ) for θ ∈ [0, π/2], 0 otherwise
 * n controls directivity
 */
export function directionalPattern(thetaRad, n = 2) {
  const cosTheta = Math.cos(thetaRad);
  if (cosTheta < 0) return 0;
  return Math.pow(cosTheta, n);
}

/**
 * Yagi-Uda approximate pattern (simplified)
 */
export function yagiPattern(thetaRad, elements = 5) {
  const mainLobe = Math.pow(Math.cos(thetaRad), elements);
  const sideLobes = Math.abs(Math.sin(elements * thetaRad)) * 0.1;
  return Math.max(0, mainLobe + sideLobes);
}

/**
 * Linear array factor (uniform, equal-amplitude)
 * AF(θ) = |sin(N·ψ/2) / (N·sin(ψ/2))|²
 * where ψ = 2π·d/λ·cos(θ) + β (phase shift)
 */
export function linearArrayFactor(thetaRad, N, dOverLambda, betaRad = 0) {
  const psi = 2 * PI * dOverLambda * Math.cos(thetaRad) + betaRad;
  const halfPsi = psi / 2;
  if (Math.abs(Math.sin(halfPsi)) < 1e-10) return 1; // l'Hopital limit
  const AF = Math.sin(N * halfPsi) / (N * Math.sin(halfPsi));
  return AF * AF;
}

/**
 * Compute gain in dBi from normalized pattern value
 * G_dBi = 10·log10(η · (4π / Ω_A)) where Ω_A is beam solid angle
 * Here we use a simpler approximation: G_max = 10·log10(2n+1) for cos^n
 */
export function gainDbi(nDirectivity) {
  return 10 * Math.log10(2 * nDirectivity + 1);
}

/**
 * Half-power beamwidth (HPBW) for cos^n pattern
 * HPBW ≈ 2 · arccos(0.5^(1/(2n))) in radians
 */
export function hpbwRad(n) {
  return 2 * Math.acos(Math.pow(0.5, 1 / (2 * n)));
}

/**
 * Convert HPBW to degrees
 */
export function hpbwDeg(n) {
  return (hpbwRad(n) * 180) / PI;
}

/**
 * Generate polar plot data (φ = 0..2π for a 2D cut)
 * Returns array of {angle, r} objects
 */
export function generatePolarData(patternFn, steps = 360, ...args) {
  const data = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * PI;
    const r = patternFn(theta, ...args);
    data.push({ angle: theta, r: Math.max(0, r) });
  }
  return data;
}

/**
 * Fresnel zone radius at distance d from TX (and d_total - d from RX)
 * r_n = sqrt(n · λ · d1 · d2 / (d1 + d2))
 */
export function fresnelRadius(n, lambdaM, d1M, d2M) {
  return Math.sqrt((n * lambdaM * d1M * d2M) / (d1M + d2M));
}

/**
 * Knife-edge diffraction parameter ν
 * ν = h · sqrt(2(d1+d2) / (λ·d1·d2))
 */
export function knifedgeNu(heightM, lambdaM, d1M, d2M) {
  return heightM * Math.sqrt((2 * (d1M + d2M)) / (lambdaM * d1M * d2M));
}

/**
 * Knife-edge diffraction loss (approximate, Lee's formula)
 * L_d(ν) in dB
 */
export function knifeedgeLossDb(nu) {
  if (nu < -1) return 0;
  if (nu < 0) return 20 * Math.log10(0.5 - 0.62 * nu);
  if (nu < 1) return 20 * Math.log10(0.5 * Math.exp(-0.95 * nu));
  if (nu < 2.4) return 20 * Math.log10(0.4 - Math.sqrt(0.1184 - (0.38 - 0.1 * nu) ** 2));
  return 20 * Math.log10(0.225 / nu);
}

/**
 * Reflection coefficient — perpendicular polarization (Fresnel)
 * Γ⊥ = (cos θ_i - sqrt(ε_r - sin²θ_i)) / (cos θ_i + sqrt(ε_r - sin²θ_i))
 */
export function reflectionCoeffPerp(thetaIncRad, epsilonR) {
  const cosI = Math.cos(thetaIncRad);
  const sinI = Math.sin(thetaIncRad);
  const inner = epsilonR - sinI * sinI;
  if (inner < 0) return { mag: 1, phase: PI }; // total internal reflection
  const sqrtE = Math.sqrt(inner);
  const num = cosI - sqrtE;
  const den = cosI + sqrtE;
  const mag = Math.abs(num / den);
  const phase = num / den < 0 ? PI : 0;
  return { mag, phase };
}

/**
 * Reflection coefficient — parallel polarization (Fresnel)
 * Γ∥ = (ε_r·cos θ_i - sqrt(ε_r - sin²θ_i)) / (ε_r·cos θ_i + sqrt(ε_r - sin²θ_i))
 */
export function reflectionCoeffParallel(thetaIncRad, epsilonR) {
  const cosI = Math.cos(thetaIncRad);
  const sinI = Math.sin(thetaIncRad);
  const inner = epsilonR - sinI * sinI;
  if (inner < 0) return { mag: 1, phase: PI };
  const sqrtE = Math.sqrt(inner);
  const num = epsilonR * cosI - sqrtE;
  const den = epsilonR * cosI + sqrtE;
  const mag = Math.abs(num / den);
  const phase = num / den < 0 ? PI : 0;
  return { mag, phase };
}

/**
 * Brewster angle (parallel polarization, Γ∥ = 0)
 * θ_B = arctan(sqrt(ε_r))
 */
export function brewsterAngle(epsilonR) {
  return Math.atan(Math.sqrt(epsilonR));
}
