// Prozedurale Landschaft: Alpen, Hügel des Hausruck, Fichtenwälder.
// Wird zur Build-Zeit berechnet (deterministisch per Seed) und als SVG ausgeliefert.

export const W = 1600;
export const H = 900;

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const r0 = (n: number) => Math.round(n);

type Wave = { amp: number; freq: number; phase: number };

export function makeRidge(seed: number, base: number, waves: [number, number][]) {
  const rnd = rng(seed);
  const ws: Wave[] = waves.map(([amp, freq]) => ({ amp, freq, phase: rnd() * Math.PI * 2 }));
  return (x: number) => base + ws.reduce((y, w) => y + w.amp * Math.sin(x * w.freq + w.phase), 0);
}

/** Fläche unter einer Kammlinie bis zum unteren Bildrand. */
export function ridgePath(ridge: (x: number) => number, step = 16, x0 = -40, x1 = W + 40, bottom = H + 20) {
  let d = `M${x0} ${bottom}`;
  for (let x = x0; x <= x1; x += step) d += `L${r0(x)} ${r0(ridge(x))}`;
  return `${d}L${x1} ${bottom}Z`;
}

/** Silhouette einer Fichte mit hängenden Ästen. */
export function spruce(x: number, y: number, h: number, w: number, rnd: () => number, precise = false) {
  const f = precise ? r1 : r0;
  const tiers = Math.max(3, Math.min(11, Math.round(h / 14)));
  const top = y - h;
  const crown = h * 0.9;
  const right: string[] = [];
  const left: string[] = [];
  for (let k = 1; k <= tiers; k++) {
    const t = k / tiers;
    const yk = top + t * crown;
    const half = (w / 2) * (0.12 + 0.88 * Math.pow(t, 0.9)) * (0.85 + rnd() * 0.3);
    const lift = (crown / tiers) * (0.35 + rnd() * 0.2);
    const tip = (crown / tiers) * 0.12;
    right.push(`${f(x + half)} ${f(yk + tip)}`);
    if (k < tiers) right.push(`${f(x + half * 0.42)} ${f(yk - lift * 0.1)}`);
    left.unshift(`${f(x - half)} ${f(yk + tip * (0.6 + rnd()))}`);
    if (k < tiers) left.unshift(`${f(x - half * 0.42)} ${f(yk - lift * 0.1)}`);
  }
  const trunk = Math.max(1, w * 0.07);
  return (
    `M${f(x)} ${f(top)}L${right.join('L')}` +
    `L${f(x + trunk)} ${f(y - h * 0.08)}L${f(x + trunk)} ${f(y + 6)}` +
    `L${f(x - trunk)} ${f(y + 6)}L${f(x - trunk)} ${f(y - h * 0.08)}` +
    `L${left.join('L')}Z`
  );
}

/** Waldstreifen entlang einer Kammlinie. */
export function forest(
  ridge: (x: number) => number,
  seed: number,
  opts: {
    spacing: [number, number];
    height: [number, number];
    widthRatio?: [number, number];
    sink?: number;
    x0?: number;
    x1?: number;
    gaps?: [number, number][];
    precise?: boolean;
  },
) {
  const rnd = rng(seed);
  const { spacing, height, widthRatio = [0.32, 0.42], sink = 6, x0 = -60, x1 = W + 60, gaps = [] } = opts;
  let d = '';
  let x = x0 + rnd() * spacing[0];
  while (x < x1) {
    const inGap = gaps.some(([a, b]) => x > a && x < b);
    const cluster = 0.55 + 0.45 * Math.sin(x * 0.011 + seed);
    if (!inGap && rnd() < 0.55 + cluster * 0.45) {
      const h = height[0] + (height[1] - height[0]) * (rnd() * 0.6 + cluster * 0.4);
      const w = h * (widthRatio[0] + rnd() * (widthRatio[1] - widthRatio[0]));
      d += spruce(x, ridge(x) + sink, h, w, rnd, opts.precise);
    }
    x += spacing[0] + rnd() * (spacing[1] - spacing[0]);
  }
  return d;
}

/** Alpenkette mit gezackten Gipfeln. */
export function alps(seed: number, base: number) {
  const rnd = rng(seed);
  const pts: [number, number][] = [[-40, base + 40]];
  let x = -40;
  while (x < W + 60) {
    const peak = base - 40 - rnd() * 150;
    const wHalf = 50 + rnd() * 110;
    pts.push([x + wHalf * 0.45, peak + 30 + rnd() * 30]);
    pts.push([x + wHalf * 0.8, peak + rnd() * 12]);
    pts.push([x + wHalf, peak]);
    pts.push([x + wHalf * 1.25, peak + 18 + rnd() * 24]);
    pts.push([x + wHalf * 1.6, base - rnd() * 40]);
    x += wHalf * 1.6;
  }
  pts.push([W + 60, base + 40]);
  let d = `M-40 ${H}`;
  for (const [px, py] of pts) d += `L${r0(px)} ${r0(py)}`;
  return `${d}L${W + 60} ${H}Z`;
}

/** Sterne für den Nachthimmel. */
export function stars(seed: number, count: number, maxY: number) {
  const rnd = rng(seed);
  return Array.from({ length: count }, () => ({
    x: r0(rnd() * W),
    y: r0(Math.pow(rnd(), 1.4) * maxY),
    r: r1(0.4 + Math.pow(rnd(), 3) * 1.6),
    d: r1(rnd() * 6),
  }));
}

/** Glühwürmchen für Abend & Nacht. */
export function fireflies(seed: number, count: number, yMin: number, yMax: number) {
  const rnd = rng(seed);
  return Array.from({ length: count }, () => ({
    x: r0(rnd() * W),
    y: r0(yMin + rnd() * (yMax - yMin)),
    d: r1(rnd() * 8),
    t: r1(6 + rnd() * 8),
    dx: r0(-40 + rnd() * 80),
    dy: r0(-30 + rnd() * 50),
  }));
}
