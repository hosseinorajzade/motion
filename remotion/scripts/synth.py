"""
Tiny synth + sound-design kit for the films' scores.
Everything is generated from numbers: no samples, no downloads.
"""
import numpy as np
from scipy import signal

SR = 48000
rng = np.random.default_rng(7)


def tt(sec):
    return np.arange(int(sec * SR)) / SR


def env_exp(n, decay):
    return np.exp(-np.arange(n) / SR / decay)


def adsr(n, a=0.01, d=0.1, s=0.7, r=0.2):
    e = np.ones(n) * s
    A, D, R = int(a * SR), int(d * SR), int(r * SR)
    A = min(A, n)
    e[:A] = np.linspace(0, 1, A, endpoint=False)
    D2 = min(D, max(0, n - A))
    e[A:A + D2] = np.linspace(1, s, D2, endpoint=False)
    if R > 0 and n > R:
        e[-R:] *= np.linspace(1, 0, R)
    return e


def butter(x, f, kind='low', order=2):
    f = np.clip(np.asarray(f, dtype=float), 20, SR / 2 - 100)
    b, a = signal.butter(order, f / (SR / 2), btype=kind)
    return signal.lfilter(b, a, x)


def sweep_filter(x, f0, f1, kind='low', block=256, q=0.9):
    """Time-varying state-variable filter (Chamberlin) — exponential cutoff sweep f0→f1."""
    n = len(x)
    fc = f0 * (f1 / f0) ** (np.arange(n) / max(1, n - 1))
    out = np.zeros(n)
    low = band = 0.0
    damp = 1 / q
    for i in range(n):
        f = 2 * np.sin(np.pi * min(fc[i], SR / 6) / SR)
        high = x[i] - low - damp * band
        band += f * high
        low += f * band
        out[i] = low if kind == 'low' else band if kind == 'band' else high
    return out


def saw(freq, sec, detune=0.0):
    t = tt(sec)
    ph = (t * freq * (1 + detune) + rng.random()) % 1.0
    return 2 * ph - 1


def sine(freq, sec, phase=0.0):
    return np.sin(2 * np.pi * freq * tt(sec) + phase)


def noise(sec):
    return rng.standard_normal(int(sec * SR))


def softclip(x, drive=1.5):
    return np.tanh(x * drive) / np.tanh(drive)


# ---------------------------------------------------------------- drums

def kick(punch=1.0):
    sec = 0.55
    t = tt(sec)
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.28)
    click = butter(noise(sec), 3000, 'high') * np.exp(-t / 0.004) * 0.35
    return softclip((body + click) * punch, 1.8) * 0.9


def clap():
    sec = 0.4
    n = noise(sec)
    n = butter(butter(n, 900, 'high'), 3200, 'low')
    t = tt(sec)
    e = np.zeros_like(t)
    for off in (0.0, 0.011, 0.023):
        e += (t >= off) * np.exp(-np.clip(t - off, 0, None) / 0.008)
    e += (t >= 0.03) * np.exp(-np.clip(t - 0.03, 0, None) / 0.12) * 0.6
    return n * e * 0.5


def hat(open_=False):
    sec = 0.32 if open_ else 0.06
    n = butter(noise(sec), 7000, 'high', 4)
    return n * env_exp(len(n), 0.09 if open_ else 0.014) * 0.25


def snare():
    sec = 0.3
    t = tt(sec)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05) * 0.5
    nz = butter(noise(sec), 1500, 'high') * np.exp(-t / 0.09) * 0.6
    return (tone + nz) * 0.6


# ---------------------------------------------------------------- tonal

def note_hz(name):
    names = {'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}
    pitch, octave = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[pitch] + 12 * (octave - 4)) / 12)


def sub_bass(freq, sec):
    t = tt(sec)
    x = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(4 * np.pi * freq * t)
    grit = butter(saw(freq, sec), 380, 'low') * 0.35
    return softclip((x + grit) * adsr(len(t), 0.004, 0.08, 0.8, 0.04), 1.4) * 0.55


def pad(freqs, sec, cutoff=1400, a=0.4, r=0.8):
    L = np.zeros(int(sec * SR))
    R = np.zeros(int(sec * SR))
    for f in freqs:
        for d in (-0.006, 0.0, 0.007):
            L += saw(f, sec, d)
            R += saw(f, sec, -d * 1.1)
    e = adsr(len(L), a, 0.3, 0.85, r)
    L = butter(L, cutoff, 'low', 2) * e
    R = butter(R, cutoff, 'low', 2) * e
    k = 0.11 / max(1, len(freqs))
    return L * k, R * k


def pluck(freq, sec=0.6, bright=4000):
    """Karplus–Strong string."""
    n = int(sec * SR)
    period = int(SR / freq)
    buf = rng.uniform(-1, 1, period)
    buf = butter(buf, bright, 'low')
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = 0.5 * (buf[i % period] + buf[(i + 1) % period]) * 0.996
    return out * 0.5


def marimba(freq, sec=0.9):
    t = tt(sec)
    x = (np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.45)
         + 0.35 * np.sin(2 * np.pi * freq * 3.93 * t) * np.exp(-t / 0.08)
         + 0.12 * np.sin(2 * np.pi * freq * 9.2 * t) * np.exp(-t / 0.025))
    att = np.clip(t / 0.002, 0, 1)
    return x * att * 0.5


def bell(freq, sec=2.5):
    t = tt(sec)
    ratios = [(1, 1.0, 1.6), (2.76, 0.5, 0.9), (5.4, 0.25, 0.5), (8.93, 0.12, 0.3)]
    x = sum(a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t / d) for r, a, d in ratios)
    return x * np.clip(t / 0.003, 0, 1) * 0.3


# ---------------------------------------------------------------- sound design

def riser(sec, f0=300, f1=6000):
    n = noise(sec)
    x = sweep_filter(n, f0, f1, 'band', q=2.5)
    t = tt(sec)
    tone_f = 180 * (8 ** (t / sec))
    tone = np.sin(2 * np.pi * np.cumsum(tone_f) / SR) * 0.15
    e = (t / sec) ** 2.2
    return (x * 0.5 + tone) * e * 0.8


def impact():
    sec = 2.8
    t = tt(sec)
    f = 32 + 50 * np.exp(-t / 0.09)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.9)
    crack = butter(noise(sec), 2500, 'low') * np.exp(-t / 0.06) * 0.7
    air = butter(noise(sec), 5000, 'high') * np.exp(-t / 0.5) * 0.08
    return softclip(boom + crack + air, 1.3) * 0.9


def whoosh(sec=0.6, f0=400, f1=4500):
    n = noise(sec)
    half = len(n) // 2
    up = sweep_filter(n[:half], f0, f1, 'band', q=1.6)
    down = sweep_filter(n[half:], f1, f0 * 1.5, 'band', q=1.6)
    x = np.concatenate([up, down])
    t = np.linspace(0, 1, len(x))
    e = np.sin(np.pi * t) ** 1.6
    return x * e * 0.9


def tick(freq=2600):
    sec = 0.05
    t = tt(sec)
    return (np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.012) + butter(noise(sec), 6000, 'high') * np.exp(-t / 0.002) * 0.3) * 0.35


def pop(freq=520):
    """Wet bubble pop: fast upward pitch blip."""
    sec = 0.12
    t = tt(sec)
    f = freq * (1 + 1.8 * (1 - np.exp(-t / 0.02)))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03) * 0.5


def thock(freq=210):
    """Keyboard switch bottoming out: woody body + click."""
    sec = 0.16
    t = tt(sec)
    body = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.035)
    body += 0.5 * np.sin(2 * np.pi * freq * 2.7 * t) * np.exp(-t / 0.015)
    click = butter(noise(sec), 2500, 'band' if False else 'high') * np.exp(-t / 0.003) * 0.5
    return (body + click) * 0.6


# ---------------------------------------------------------------- mixing

class Mix:
    def __init__(self, seconds, bpm=120):
        self.n = int(seconds * SR)
        self.L = np.zeros(self.n)
        self.R = np.zeros(self.n)
        self.bpm = bpm
        self.kicks = []

    def beat(self, b):
        return b * 60 / self.bpm

    def add(self, x, at, gain=1.0, pan=0.0, bus=None):
        if isinstance(x, tuple):
            l, r = x
        else:
            l = r = x
        i = int(round(at * SR))
        if i >= self.n or i + len(l) <= 0:
            return
        j0 = max(0, -i)
        j1 = min(len(l), self.n - i)
        gl = gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
        gr = gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
        target = bus if bus is not None else self
        target.L[i + j0:i + j1] += l[j0:j1] * gl
        target.R[i + j0:i + j1] += r[j0:j1] * gr

    def add_sweep(self, x, at, gain=1.0, pan0=-0.8, pan1=0.8):
        """Mono source panned across the stereo field (follows a left→right wipe)."""
        i = int(round(at * SR))
        p = np.linspace(pan0, pan1, len(x))
        l = x * np.cos((p + 1) * np.pi / 4) * np.sqrt(2) * gain
        r = x * np.sin((p + 1) * np.pi / 4) * np.sqrt(2) * gain
        self.add((l, r), at if i >= 0 else 0)

    def sidechain(self, kicks, depth=0.7, release=0.16):
        g = np.ones(self.n)
        t = np.arange(self.n) / SR
        for k in kicks:
            i = int(k * SR)
            seg = t[i:] - k
            g[i:] = np.minimum(g[i:], 1 - depth * np.exp(-seg / release))
        return g


class Bus:
    def __init__(self, n):
        self.L = np.zeros(n)
        self.R = np.zeros(n)


def reverb(L, R, wet=0.25, size=1.0):
    """Schroeder reverb: parallel combs into series all-passes."""
    def comb(x, d, g):
        a = np.zeros(d + 1)
        a[0], a[d] = 1, -g
        return signal.lfilter([1], a, x)

    def allpass(x, d, g):
        b = np.zeros(d + 1)
        a = np.zeros(d + 1)
        b[0], b[d] = -g, 1
        a[0], a[d] = 1, -g
        return signal.lfilter(b, a, x)

    out = []
    for x, spread in ((L, 0), (R, 23)):
        delays = [int((ms + spread / 10) * size * SR / 1000) for ms in (29.7, 37.1, 41.1, 43.7)]
        y = sum(comb(x, d, 0.84) for d in delays) / 4
        for d in (int(5.0 * SR / 1000), int(1.7 * SR / 1000)):
            y = allpass(y, d + spread, 0.7)
        y = butter(y, 6500, 'low')
        out.append(x * (1 - wet) + y * wet * 2.2)
    return out[0], out[1]


def write_wav(path, L, R):
    import wave
    peak = max(np.max(np.abs(L)), np.max(np.abs(R)), 1e-9)
    scale = 0.89 / peak  # leave headroom; loudness is set by ffmpeg loudnorm afterwards
    data = np.stack([L, R], axis=1) * scale
    pcm = (np.clip(data, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
