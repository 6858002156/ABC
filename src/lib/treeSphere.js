// Decorative 3D "tree" sphere drawn on a transparent canvas.
// The branch shape is generated once, then only rotated and re-projected each frame.
const TREE_NEAR = [167, 243, 208]; // emerald-200, near branches
const TREE_FAR = [15, 74, 58]; // deep green, far branches

const MOTION = {
  idle: { turn: 0.28, sway: 0.24, pace: 1, fade: 0.26 },
  thinking: { turn: 1.1, sway: 0.42, pace: 2.6, fade: 0.2 },
  answer: { turn: 1.1, sway: 0.42, pace: 2.6, fade: 0.2 },
};

function rand(seed) {
  return function () {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function norm(v) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function buildTree(seedNum) {
  const R = rand(seedNum);
  const segs = [];
  let curTr = 0;

  function bend(dir, axis, ang) {
    const w = cross(axis, dir);
    const c = Math.cos(ang);
    const sn = Math.sin(ang);
    return norm([dir[0] * c + w[0] * sn, dir[1] * c + w[1] * sn, dir[2] * c + w[2] * sn]);
  }

  function grow(p, dir, len, depth, parent, root) {
    const end = [p[0] + dir[0] * len, p[1] + dir[1] * len, p[2] + dir[2] * len];
    const idx = segs.length;
    segs.push({ a: p, b: end, d: depth, tr: curTr, kids: [] });
    if (parent >= 0) segs[parent].kids.push(idx);
    if (depth >= 6) return;
    const r = [R() - 0.5, R() - 0.5, R() - 0.5];
    const axis = norm(cross(dir, r));
    const ang = 0.26 + R() * 0.16;
    [ang, -ang].forEach((a) => {
      let nd = bend(dir, axis, a);
      const dot = nd[0] * root[0] + nd[1] * root[1] + nd[2] * root[2];
      if (dot < 0.58) nd = norm([nd[0] + root[0] * 0.8, nd[1] + root[1] * 0.8, nd[2] + root[2] * 0.8]);
      grow(end, nd, len * (0.78 + R() * 0.06), depth + 1, idx, root);
    });
  }

  const TRUNKS = 26;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let t = 0; t < TRUNKS; t++) {
    const y = 1 - ((t + 0.5) * 2) / TRUNKS;
    const rr = Math.sqrt(1 - y * y);
    const th = t * golden;
    const d0 = norm([Math.cos(th) * rr + (R() - 0.5) * 0.15, y, Math.sin(th) * rr + (R() - 0.5) * 0.15]);
    curTr = t;
    grow([0, 0, 0], d0, 0.24, 0, -1, d0);
  }
  return segs;
}

const TREE = buildTree(7);

const SWING = (function () {
  const R = rand(31);
  const list = [];
  for (let t = 0; t < 26; t++) {
    const ax = [R() - 0.5, R() - 0.5, R() - 0.5];
    const l = Math.hypot(ax[0], ax[1], ax[2]) || 1;
    list.push({ ax: [ax[0] / l, ax[1] / l, ax[2] / l], w: 0.6 + R() * 0.9, ph: R() * 6.283 });
  }
  return list;
})();

function rotMatrix(a, ang) {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const t = 1 - c;
  const x = a[0];
  const y = a[1];
  const z = a[2];
  return [
    t * x * x + c, t * x * y - s * z, t * x * z + s * y,
    t * x * y + s * z, t * y * y + c, t * y * z - s * x,
    t * x * z - s * y, t * y * z + s * x, t * z * z + c,
  ];
}

export function createTreeSphere(canvas, getState) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  let W = 0;
  let H = 0;
  let dpr = 1;
  let angle = 0.6;
  let last = 0;
  let clock = 0;
  const cur = { ...MOTION.idle };

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
  }

  function swing(p, m, r) {
    const x = p[0] * m[0] + p[1] * m[1] + p[2] * m[2];
    const y = p[0] * m[3] + p[1] * m[4] + p[2] * m[5];
    const z = p[0] * m[6] + p[1] * m[7] + p[2] * m[8];
    const rr = x * x + y * y + z * z;
    const amp = 0.05 * rr * r;
    return [
      x + Math.sin(clock * 1.3 + y * 6) * amp,
      y + Math.sin(clock * 1.1 + z * 6) * amp,
      z + Math.sin(clock * 1.5 + x * 6) * amp,
    ];
  }

  function project(p, cosA, sinA, wob) {
    const x = p[0] * cosA + p[2] * sinA;
    const z = -p[0] * sinA + p[2] * cosA;
    const tilt = 0.38 + wob;
    const y2 = p[1] * Math.cos(tilt) - z * Math.sin(tilt);
    const z2 = p[1] * Math.sin(tilt) + z * Math.cos(tilt);
    const k = 3.2 / (3.2 + z2);
    const scale = Math.min(W, H) / 2.4;
    return [W / 2 + x * k * scale, H / 2 + y2 * k * scale, z2, k];
  }

  function frame(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    const target = MOTION[getState()] || MOTION.idle;
    Object.keys(target).forEach((key) => {
      cur[key] += (target[key] - cur[key]) * Math.min(1, dt * 3);
    });
    angle += cur.turn * dt;
    clock += cur.pace * dt;

    const mats = SWING.map((sw) => rotMatrix(sw.ax, Math.sin(clock * sw.w + sw.ph) * cur.sway));
    const ripple = cur.sway / 0.24;
    const wob = Math.sin(now / 3200) * 0.22;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // fading the previous frame instead of clearing it gives soft motion trails
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = `rgba(0,0,0,${cur.fade})`;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';

    const lines = [];
    const lw = Math.max(0.6, Math.min(W, H * 1.6) / 420);
    TREE.forEach((s) => {
      const m = mats[s.tr];
      const a = project(swing(s.a, m, ripple), cosA, sinA, wob);
      const b = project(swing(s.b, m, ripple), cosA, sinA, wob);
      lines.push({ a, b, z: (a[2] + b[2]) / 2, d: s.d });
    });
    lines.sort((p, q) => q.z - p.z);

    ctx.lineCap = 'round';
    lines.forEach((l) => {
      const t = Math.max(0, Math.min(1, (1 - l.z) / 2));
      const c = TREE_FAR.map((f, i) => Math.round(f + (TREE_NEAR[i] - f) * t));
      ctx.strokeStyle = `rgb(${c.join(',')})`;
      ctx.lineWidth = lw * Math.max(0.5, 3.4 - l.d * 0.42) * l.a[3];
      ctx.beginPath();
      ctx.moveTo(l.a[0], l.a[1]);
      ctx.lineTo(l.b[0], l.b[1]);
      ctx.stroke();
    });
  }

  resize();
  const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  observer?.observe(canvas);

  let raf = 0;
  frame(performance.now());
  const loop = (now) => {
    if (!document.hidden) frame(now);
    else last = 0;
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    observer?.disconnect();
  };
}