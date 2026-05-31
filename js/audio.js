let audioCtx = null;
let masterGain = null;
let soundBuffers = {};

function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(audioCtx.destination);
  } catch(e) { console.warn('Audio init failed:', e); }
}

function loadSound(name, url) {
  return new Promise((resolve) => {
    if (!audioCtx) { resolve(); return; }
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      if (xhr.status === 0 || xhr.status === 200) {
        audioCtx.decodeAudioData(xhr.response, (buf) => {
          soundBuffers[name] = buf;
          resolve();
        }, () => resolve());
      } else resolve();
    };
    xhr.onerror = () => resolve();
    xhr.send();
  });
}

var soundsLoaded = false;

function loadAllSounds() {
  if (soundsLoaded) return;
  soundsLoaded = true;
  const snd = (file) => encodeURI('audio/' + file);
  loadSound('playerDeath', snd('смерть персонажа.ogg'));
  loadSound('playerHurt', snd('звук пропадания здоровья у персонажа.ogg'));
  loadSound('monster', snd('звук который издают монстры.ogg'));
}

function playBuf(name, vol, rate) {
  if (!audioCtx || !soundBuffers[name]) return false;
  try {
    const src = audioCtx.createBufferSource();
    src.buffer = soundBuffers[name];
    if (rate) src.playbackRate.value = rate;
    const g = audioCtx.createGain();
    g.gain.value = vol || 0.5;
    src.connect(g);
    g.connect(masterGain);
    src.start();
    return true;
  } catch(e) { return false; }
}

function synthNoise(dur, freq, type, vol, ramp) {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type || 'sawtooth';
    osc.frequency.value = freq || 200;
    const now = audioCtx.currentTime;
    g.gain.setValueAtTime(vol || 0.3, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + (ramp !== false ? (dur || 0.1) : 999));
    osc.connect(g);
    g.connect(masterGain);
    osc.start(now);
    osc.stop(now + (dur || 0.1));
  } catch(e) { console.warn('audio error:', e); }
}

function synthNoiseBuf(dur) {
  if (!audioCtx) return null;
  const sr = audioCtx.sampleRate;
  const len = Math.floor(sr * dur);
  const buf = audioCtx.createBuffer(1, len, sr);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  return buf;
}

function playBufRaw(buf, vol) {
  if (!audioCtx || !buf) return;
  try {
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const g = audioCtx.createGain();
    g.gain.value = vol || 0.5;
    src.connect(g);
    g.connect(masterGain);
    src.start();
  } catch(e) { console.warn('audio error:', e); }
}

let cachedGunshot, cachedShotgun;

function playGunshot() {
  if (!cachedGunshot && audioCtx) cachedGunshot = synthNoiseBuf(0.1);
  playBufRaw(cachedGunshot, 0.5);
}

function playShotgun() {
  if (!cachedShotgun && audioCtx) cachedShotgun = synthNoiseBuf(0.25);
  playBufRaw(cachedShotgun, 0.7);
}

function playPlasma() {
  synthNoise(0.06, 1200, 'sawtooth', 0.15);
  synthNoise(0.04, 600, 'square', 0.1);
}

function playEnemyPain() {
  synthNoise(0.15, 80, 'sawtooth', 0.15);
}

function playEnemyDeath() {
  synthNoise(0.6, 40, 'sawtooth', 0.2);
  synthNoise(0.4, 25, 'square', 0.15);
}

function playPlayerHurt() {
  if (!playBuf('playerHurt', 0.5)) synthNoise(0.12, 150, 'sine', 0.25);
}

function playPlayerDeath() {
  if (!playBuf('playerDeath', 0.6)) synthNoise(0.8, 30, 'sawtooth', 0.3);
}

function playMonsterSound() {
  if (!playBuf('monster', 0.3)) { synthNoise(0.2, 60, 'sawtooth', 0.1); }
}

function playPickup() {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(700, now + 0.1);
    g.gain.setValueAtTime(0.08, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch(e) { console.warn('audio error:', e); }
}

function playDash() {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.12);
    g.gain.setValueAtTime(0.15, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch(e) { console.warn('audio error:', e); }
}

function playScare() {
  if (!audioCtx) return;
  try {
    const buf = synthNoiseBuf(0.4);
    if (buf) playBufRaw(buf, 0.7);
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 60;
    const now = audioCtx.currentTime;
    g.gain.setValueAtTime(0.4, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch(e) { console.warn('audio error:', e); }
}

function playProjectileShoot() {
  synthNoise(0.08, 300, 'sawtooth', 0.1);
}

function playProjectileHit() {
  synthNoise(0.1, 100, 'sawtooth', 0.15);
  synthNoise(0.05, 50, 'square', 0.1);
}

function playStairs() {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.3);
    g.gain.setValueAtTime(0.15, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch(e) { console.warn('audio error:', e); }
}

let footstepTimer = 0;

function playFootstep(dt) {
  if (!audioCtx) return;
  footstepTimer -= dt;
  if (footstepTimer > 0) return;
  footstepTimer = 0.35;
  synthNoise(0.05, 50, 'sine', 0.05);
  synthNoise(0.04, 30, 'square', 0.03);
}

function playBossRoar() {
  synthNoise(0.8, 40, 'sawtooth', 0.35);
  synthNoise(0.6, 20, 'square', 0.2);
}

let bgMusicGain = null;
let bgMusicNodes = [];

function startMusic() {
  if (!audioCtx || bgMusicNodes.length) return;
  try {
    bgMusicGain = audioCtx.createGain();
    bgMusicGain.gain.value = 0.08;
    bgMusicGain.connect(masterGain);

    const bpm = 140;
    const beat = 60 / bpm;
    let nextTime = audioCtx.currentTime + 0.05;

    function scheduleNote(freq, dur, vol, type, time) {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = type || 'square';
      osc.frequency.setValueAtTime(freq, time);
      g.gain.setValueAtTime(vol || 0.06, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.connect(g);
      g.connect(bgMusicGain);
      osc.start(time);
      osc.stop(time + dur);
      bgMusicNodes.push(osc);
    }

    function scheduleKick(time, vol) {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
      g.gain.setValueAtTime(vol || 0.12, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      osc.connect(g);
      g.connect(bgMusicGain);
      osc.start(time);
      osc.stop(time + 0.15);
      bgMusicNodes.push(osc);
    }

    function scheduleSnare(time, vol) {
      const g = audioCtx.createGain();
      const bufSize = audioCtx.sampleRate * 0.08;
      const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 3);
      }
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      g.gain.setValueAtTime(vol || 0.06, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
      src.connect(g);
      g.connect(bgMusicGain);
      src.start(time);
      bgMusicNodes.push(src);
    }

    // Action bass riff (E minor pentatonic)
    const bassNotes = [82, 82, 98, 82, 110, 98, 82, 73];
    const bassDurs = [1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1];

    // Melody (E minor pentatonic scale: E G A B D E)
    const melody = [
      [330, 0.5], [392, 0.25], [440, 0.25],
      [494, 0.5], [440, 0.25], [392, 0.25],
      [330, 0.5], [262, 0.5],
      [294, 0.5], [330, 0.25], [294, 0.25],
      [330, 0.5], [392, 0.5],
      [440, 0.5], [392, 0.25], [440, 0.25],
      [494, 1], [0, 0.5],
      [523, 0.5], [494, 0.25], [440, 0.25],
      [392, 0.5], [440, 0.5],
      [330, 0.5], [392, 0.5],
      [262, 0.5], [294, 0.5],
      [330, 1], [0, 1]
    ];

    // Schedule 4 loops
    for (let loop = 0; loop < 4; loop++) {
      const loopStart = nextTime + loop * beat * 16;

      // Bass riff (2 bars)
      let bassTime = loopStart;
      for (let i = 0; i < bassNotes.length; i++) {
        if (bassNotes[i] > 0) scheduleNote(bassNotes[i], bassDurs[i] * beat * 0.9, 0.08, 'sawtooth', bassTime);
        bassTime += bassDurs[i] * beat;
      }

      // Melody
      let melTime = loopStart + beat * 8;
      for (let i = 0; i < melody.length; i++) {
        if (melody[i][0] > 0) scheduleNote(melody[i][0], melody[i][1] * beat * 0.9, 0.05, 'square', melTime);
        melTime += melody[i][1] * beat;
      }

      // Drums (kick on 1, 3; snare on 2, 4)
      for (let b = 0; b < 16; b++) {
        const bt = loopStart + b * beat;
        if (b % 4 === 0 || b % 4 === 2) scheduleKick(bt, b % 4 === 0 ? 0.15 : 0.1);
        if (b % 4 === 1 || b % 4 === 3) scheduleSnare(bt, 0.08);
      }
    }
  } catch(e) { bgMusicNodes = []; }
}

function stopMusic() {
  if (bgMusicNodes.length) {
    bgMusicNodes.forEach(n => { try { n.stop(); } catch(e) {} });
    bgMusicNodes = [];
  }
  if (bgMusicGain) {
    try { bgMusicGain.disconnect(); } catch(e) {}
    bgMusicGain = null;
  }
}
