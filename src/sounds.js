let ac = null

function ctx() {
  if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)()
  if (ac.state === 'suspended') ac.resume()
  return ac
}

export function playClick() {
  const c = ctx()
  const osc = c.createOscillator(), gain = c.createGain()
  osc.connect(gain); gain.connect(c.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(880, c.currentTime)
  osc.frequency.exponentialRampToValueAtTime(440, c.currentTime + 0.07)
  gain.gain.setValueAtTime(0.1, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.09)
  osc.start(c.currentTime); osc.stop(c.currentTime + 0.1)
}

export function playChime() {
  const c = ctx()
  ;[523.25, 659.25, 783.99].forEach((freq, i) => {
    const t = c.currentTime + i * 0.13
    const osc = c.createOscillator(), gain = c.createGain()
    osc.connect(gain); gain.connect(c.destination)
    osc.type = 'sine'; osc.frequency.value = freq
    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(0.065, t + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45)
    osc.start(t); osc.stop(t + 0.5)
  })
}

export function playMaxLove() {
  const c = ctx()
  ;[261.63, 329.63, 392, 523.25, 659.25, 783.99].forEach((freq, i) => {
    const t = c.currentTime + i * 0.1
    const osc = c.createOscillator(), gain = c.createGain()
    osc.connect(gain); gain.connect(c.destination)
    osc.type = 'sine'; osc.frequency.value = freq
    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(0.055, t + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1)
    osc.start(t); osc.stop(t + 1.2)
  })
}

/* ── Ambient: CRT hum + tape hiss ── */
let ambientNodes = null

export function toggleAmbient() {
  if (ambientNodes) {
    ambientNodes.forEach(n => { try { n.stop?.(); n.disconnect?.() } catch {} })
    ambientNodes = null
    return false
  }

  const c = ctx()

  // Tape hiss — filtered white noise
  const buf = c.createBuffer(1, c.sampleRate * 3, c.sampleRate)
  const data = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < data.length; i++) {
    const w = Math.random() * 2 - 1
    data[i] = last = (last + 0.02 * w) / 1.02
    data[i] *= 3.5
  }
  const noise = c.createBufferSource()
  noise.buffer = buf
  noise.loop = true
  const noiseFilter = c.createBiquadFilter()
  noiseFilter.type = 'lowpass'
  noiseFilter.frequency.value = 1200
  const noiseGain = c.createGain()
  noiseGain.gain.value = 0.016
  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(c.destination)
  noise.start()

  // CRT 60 Hz hum
  const hum = c.createOscillator()
  const humGain = c.createGain()
  hum.type = 'sine'
  hum.frequency.value = 60
  humGain.gain.value = 0.005
  hum.connect(humGain)
  humGain.connect(c.destination)
  hum.start()

  ambientNodes = [noise, hum, noiseFilter, noiseGain, humGain]
  return true
}
