// <spell-flourish> — procedural "swoops & blobs" for Spell surfaces.
// Mock implementation: the production version will be theme-specific (colours/weights read from theme tokens).
//   <spell-flourish variant="blobs|swoop|edge-curls|sparkle-trail|rising-wave" seed="3"></spell-flourish>
// Fills its positioned parent (position:absolute; inset:0) and re-draws on resize.
// Attributes: variant, seed, stroke (colour), fill, fill2, weight (stroke px), corner (tl|tr|bl|br).
(() => {
  if (customElements.get('spell-flourish')) return;
  const rng = seed => { let a = (seed >>> 0) || 1; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const f = n => Math.round(n * 10) / 10;
  // Catmull-Rom → cubic Bézier through points
  const smooth = (pts, closed = false, k = 1) => {
    const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
    let d = `M${f(P[1][0])},${f(P[1][1])}`;
    for (let i = 1; i < P.length - 2; i++) {
      const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6 * k)},${f(p1[1] + (p2[1] - p0[1]) / 6 * k)} ${f(p2[0] - (p3[0] - p1[0]) / 6 * k)},${f(p2[1] - (p3[1] - p1[1]) / 6 * k)} ${f(p2[0])},${f(p2[1])}`;
    }
    return closed ? d + 'Z' : d;
  };
  const blob = (cx, cy, r, R, n = 7) => { const pts = []; const o = R() * Math.PI; for (let i = 0; i < n; i++) { const a = o + i / n * Math.PI * 2; const rr = r * (0.78 + R() * 0.38); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * (0.82 + R() * 0.2)]); } return smooth(pts, true); };
  const sparkle = (x, y, r) => `M${f(x)},${f(y - r)}Q${f(x)},${f(y)} ${f(x + r)},${f(y)}Q${f(x)},${f(y)} ${f(x)},${f(y + r)}Q${f(x)},${f(y)} ${f(x - r)},${f(y)}Q${f(x)},${f(y)} ${f(x)},${f(y - r)}Z`;
  // A rightward wave with an optional loop at t = loopAt
  const swoopPts = (W, H, R, { y0, y1, amp, loopAt = 0.45, loopR = 0, n = 900 }) => {
    const pts = []; const ph = R() * Math.PI * 2;
    for (let i = 0; i <= n; i++) {
      const t = i / n; let x = -0.04 * W + t * W * 1.08; let y = y0 + (y1 - y0) * t + amp * Math.sin(t * Math.PI * 1.6 + ph);
      if (loopR) { const span = 0.07; const u = (t - (loopAt - span / 2)) / span; if (u > 0 && u < 1) { x += loopR * 1.15 * Math.sin(u * Math.PI * 2); y -= loopR * (1 - Math.cos(u * Math.PI * 2)); } }
      pts.push([x, y]);
    }
    return 'M' + pts.map(p => `${f(p[0])},${f(p[1])}`).join('L');
  };
  const draw = {
    blobs(W, H, R, c) {
      const m = Math.min(W, H);
      return `<path d="${blob(W * 0.96, H * 1.08, m * 0.78, R, 8)}" fill="${c.fill}"/><path d="${blob(-W * 0.04, -H * 0.1, m * 0.5, R, 7)}" fill="${c.fill2}"/><path d="${blob(W * 0.62, -H * 0.12, m * 0.2, R, 6)}" fill="${c.fill}" opacity=".55"/>`;
    },
    swoop(W, H, R, c) {
      return `<path d="${swoopPts(W, H, R, { y0: H * 0.62, y1: H * 0.3, amp: H * 0.08, loopAt: 0.5 + (R() - 0.5) * 0.2, loopR: Math.min(W, H) * 0.12 })}" fill="none" stroke="${c.stroke}" stroke-width="${c.weight}" stroke-linecap="round" stroke-linejoin="round"/>`;
    },
    'edge-curls'(W, H, R, c) {
      const m = Math.min(W, H); const out = [];
      // top-right arc entering and curling
      const a = []; for (let i = 0; i <= 60; i++) { const t = i / 60; const ang = Math.PI * (0.9 + 1.5 * t); const rr = m * (0.75 - 0.5 * t); a.push([W * 0.98 + Math.cos(ang) * rr * 1.3, H * 0.2 + Math.sin(ang) * rr]); }
      out.push(smooth(a));
      // bottom-left sweep
      const b = [[-W * 0.05, H * 0.55], [W * 0.08, H * 0.7], [W * 0.18, H * 0.92], [W * 0.26, H * 1.08]];
      out.push(smooth(b));
      // right edge wave
      const cpts = [[W * 1.04, H * 0.62], [W * 0.86, H * 0.7], [W * 0.82, H * 0.86], [W * 0.95, H * 0.98], [W * 1.1, H * 0.96]];
      out.push(smooth(cpts));
      return out.map(d => `<path d="${d}" fill="none" stroke="${c.stroke}" stroke-width="${c.weight}" stroke-linecap="round"/>`).join('') + `<path d="${blob(-W * 0.04, H * 1.02, m * 0.26, R, 7)}" fill="${c.fill}"/>`;
    },
    'sparkle-trail'(W, H, R, c) {
      const line = swoopPts(W * 0.78, H, R, { y0: H * 0.82, y1: H * 0.28, amp: H * 0.05, loopAt: 0.62, loopR: Math.min(W, H) * 0.08, n: 700 });
      const ex = W * 0.8, ey = H * 0.26;
      return `<path d="${line}" fill="none" stroke="${c.stroke}" stroke-width="${c.weight}" stroke-linecap="round" stroke-dasharray="0.1 ${c.weight * 3.2}" opacity=".9"/>` +
        `<path d="${sparkle(ex + 26, ey - 10, 22)}" fill="${c.stroke}"/><path d="${sparkle(ex + 66, ey - 44, 11)}" fill="${c.stroke}" opacity=".75"/><path d="${sparkle(ex + 62, ey + 22, 8)}" fill="${c.stroke}" opacity=".55"/>`;
    },
    'rising-wave'(W, H, R, c) {
      const pts = [[W * 0.38, H * 1.05], [W * 0.55, H * 0.86], [W * 0.78, H * 0.74], [W * 1.05, H * 0.5]];
      const fillD = smooth(pts) + `L${f(W * 1.05)},${f(H * 1.05)}Z`;
      const echo = smooth([[W * 0.28, H * 1.04], [W * 0.5, H * 0.78], [W * 0.75, H * 0.64], [W * 1.04, H * 0.36]]);
      return `<path d="${fillD}" fill="${c.fill}"/><path d="${echo}" fill="none" stroke="${c.stroke}" stroke-width="${c.weight}" stroke-linecap="round" opacity=".8"/>`;
    }
  };
  class SpellFlourish extends HTMLElement {
    static get observedAttributes() { return ['variant', 'seed', 'stroke', 'fill', 'fill2', 'weight']; }
    connectedCallback() {
      Object.assign(this.style, { position: 'absolute', inset: '0', display: 'block', pointerEvents: 'none', overflow: 'hidden' });
      this.ro = new ResizeObserver(() => this.render()); this.ro.observe(this); this.render();
    }
    disconnectedCallback() { this.ro && this.ro.disconnect(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      const W = this.clientWidth || 600, H = this.clientHeight || 300;
      const v = this.getAttribute('variant') || 'swoop';
      const R = rng(+(this.getAttribute('seed') || 7));
      const c = { stroke: this.getAttribute('stroke') || 'var(--line-flourish, #968AFF)', fill: this.getAttribute('fill') || 'var(--blob, #E0DFFF)', fill2: this.getAttribute('fill2') || 'var(--blob-2, #EEF0FA)', weight: +(this.getAttribute('weight') || 1.6) };
      const body = (draw[v] || draw.swoop)(W, H, R, c);
      this.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;overflow:visible" aria-hidden="true">${body}</svg>`;
    }
  }
  customElements.define('spell-flourish', SpellFlourish);
})();
