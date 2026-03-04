import { state } from './state.js';
import { switchSource } from './audio.js';

const audioSrc = document.getElementById('audio-source');
const audioSrcLive = document.getElementById('audio-source-live');

export async function populateDevices() {
  try {
    const tmp = await navigator.mediaDevices.getUserMedia({ audio: true });
    tmp.getTracks().forEach(t => t.stop());
  } catch(e) {}
  const devs = (await navigator.mediaDevices.enumerateDevices())
    .filter(d => d.kind === 'audioinput');
  [audioSrc, audioSrcLive].forEach(sel => {
    sel.innerHTML = '';
    devs.forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = d.deviceId;
      opt.textContent = d.label || `Mic ${i + 1}`;
      sel.appendChild(opt);
    });
  });
}

export function initDeviceListeners() {
  audioSrc.addEventListener('change', () => { audioSrcLive.value = audioSrc.value; });
  audioSrcLive.addEventListener('change', async () => {
    audioSrc.value = audioSrcLive.value;
    if (state.audioCtx) await switchSource(audioSrcLive.value);
  });
}
