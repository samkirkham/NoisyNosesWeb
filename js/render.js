import { state } from './state.js';

const vuNasal = document.getElementById('vu-nasal-fill');
const vuOral = document.getElementById('vu-oral-fill');
const nasalanceVal = document.getElementById('nasalance-val');
const noseCircle = document.getElementById('nose-circle');
const mouthRect = document.getElementById('mouth-rect');
const traceCvs = document.getElementById('nasalance-trace-canvas');

let traceCtx;

const WHITE = [255,255,255];
const RED   = [255,50,50];
const GREY  = [208,208,208];

function lerp3(t, a, b) {
  t = Math.max(0, Math.min(1, t));
  return `rgb(${Math.round(a[0]+t*(b[0]-a[0]))},${Math.round(a[1]+t*(b[1]-a[1]))},${Math.round(a[2]+t*(b[2]-a[2]))})`;
}

function drawTrace(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);

  // Background grid lines at 25% intervals
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let p = 0.25; p < 1; p += 0.25) {
    const y = h - p * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Draw nasalance trace
  ctx.strokeStyle = '#5588cc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const len = state.traceLen;
  const head = state.traceHead;
  const hist = state.nasalanceHistory;
  for (let i = 0; i < len; i++) {
    const idx = (head + i) % len;
    const x = (i / (len - 1)) * w;
    const y = h - hist[idx] * h;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}

export function initCanvases() {
  const dpr = window.devicePixelRatio || 1;
  const r = traceCvs.getBoundingClientRect();
  traceCvs.width = r.width * dpr;
  traceCvs.height = r.height * dpr;
  traceCtx = traceCvs.getContext('2d');
  traceCtx.scale(dpr, dpr);
}

function render() {
  const G = 8;
  const nL = Math.min(1, state.cNasal * G);
  const oL = Math.min(1, state.cOral * G);

  // VU meters
  vuNasal.style.height = `${nL * 100}%`;
  vuOral.style.height = `${oL * 100}%`;

  // Face colours — white → red with energy
  noseCircle.setAttribute('fill', lerp3(nL, WHITE, RED));
  mouthRect.setAttribute('fill', lerp3(oL, GREY, RED));

  // Readout
  if (state.relativeMode) {
    nasalanceVal.textContent = `${Math.round(state.cNasalance * 100)}%`;
    nasalanceVal.style.fontSize = '2.4rem';
  } else {
    const nDb = state.cNasal > 1e-4 ? (20 * Math.log10(state.cNasal)).toFixed(0) : '-∞';
    const oDb = state.cOral > 1e-4 ? (20 * Math.log10(state.cOral)).toFixed(0) : '-∞';
    nasalanceVal.textContent = `N ${nDb} | O ${oDb} dB`;
    nasalanceVal.style.fontSize = '1.4rem';
  }

  // Push current nasalance to ring buffer
  state.nasalanceHistory[state.traceHead] = state.cNasalance;
  state.traceHead = (state.traceHead + 1) % state.traceLen;

  // Nasalance trace
  if (traceCtx) {
    const r = traceCvs.getBoundingClientRect();
    drawTrace(traceCtx, r.width, r.height);
  }

  requestAnimationFrame(render);
}

export function startRenderLoop() {
  requestAnimationFrame(render);
}
