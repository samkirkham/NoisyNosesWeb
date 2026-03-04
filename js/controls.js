import { state } from './state.js';

export function initControls() {
  const gainNasalEl = document.getElementById('gain-nasal');
  const gainOralEl = document.getElementById('gain-oral');
  const smoothingEl = document.getElementById('smoothing');
  const modeRel = document.getElementById('mode-relative');
  const modeAbs = document.getElementById('mode-absolute');
  const cleanToggle = document.getElementById('clean-toggle');
  const appDiv = document.getElementById('app');

  gainNasalEl.addEventListener('input', () => {
    state.gNasal = +gainNasalEl.value;
    if (state.workletNode && state.workletNode.port)
      state.workletNode.port.postMessage({ gainNasal: state.gNasal });
  });
  gainOralEl.addEventListener('input', () => {
    state.gOral = +gainOralEl.value;
    if (state.workletNode && state.workletNode.port)
      state.workletNode.port.postMessage({ gainOral: state.gOral });
  });
  smoothingEl.addEventListener('input', () => {
    state.gAlpha = +smoothingEl.value;
    if (state.workletNode && state.workletNode.port)
      state.workletNode.port.postMessage({ alpha: state.gAlpha });
  });
  modeRel.addEventListener('click', () => {
    state.relativeMode = true;
    modeRel.classList.add('active'); modeAbs.classList.remove('active');
  });
  modeAbs.addEventListener('click', () => {
    state.relativeMode = false;
    modeAbs.classList.add('active'); modeRel.classList.remove('active');
  });
  cleanToggle.addEventListener('click', () => {
    appDiv.classList.toggle('clean-view');
  });
}
