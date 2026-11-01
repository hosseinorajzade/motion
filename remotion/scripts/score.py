"""
Scores for the films, composed on the same beat grid as the picture.
usage: python3 scripts/score.py [showreel|anar|tact|all]
Writes out/audio/<name>.wav (mastered to -14 LUFS, -1 dBTP with ffmpeg loudnorm).
"""
import json
import os
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from synth import (SR, Bus, Mix, bell, butter, clap, hat, impact, kick, marimba, note_hz, pad, pluck, pop,  # noqa: E402
                   reverb, riser, snare, sub_bass, thock, tick, whoosh, write_wav)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'out', 'audio')


def master(raw, final, lufs=-14.0, tp=-1.0):
    """Two-pass EBU R128 loudness normalisation."""
    probe = subprocess.run(
        ['ffmpeg', '-hide_banner', '-nostats', '-i', raw, '-af', f'loudnorm=I={lufs}:TP={tp}:LRA=11:print_format=json', '-f', 'null', '-'],
        capture_output=True, text=True,
    ).stderr
    m = json.loads(probe[probe.rindex('{'):probe.rindex('}') + 1])
    af = (f"loudnorm=I={lufs}:TP={tp}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-af', af + ',aresample=48000', '-c:a', 'pcm_s16le', final], check=True)
    check = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', final, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                           capture_output=True, text=True).stderr
    summary = check[check.rindex('Integrated loudness'):]
    print(final, ' '.join(summary.split())[:160])


# ============================================================ Showreel (120 BPM, A minor)

def score_showreel():
    cues = json.load(open(os.path.join(ROOT, 'src', 'showreel', 'cues.json')))
    fps, bpm = cues['fps'], cues['bpm']
    F = lambda f: f / fps  # frame → seconds
    dur = cues['durationInFrames'] / fps + 3.0  # room for the tail
    mix = Mix(dur, bpm)
    music = Bus(mix.n)
    drums = Bus(mix.n)
    beat = 60 / bpm
    bar = beat * 4

    chords = {
        'Am': ['A3', 'C4', 'E4', 'B4'],
        'F': ['F3', 'A3', 'C4', 'E4'],
        'C': ['C4', 'E4', 'G4', 'B4'],
        'G': ['G3', 'B3', 'D4', 'F#4'],
    }
    roots = {'Am': 'A1', 'F': 'F1', 'C': 'C2', 'G': 'G1'}
    prog = ['Am', 'F', 'C', 'G']
    card_bars = {4, 7, 10, 13}
    groove_bars = [b for b in range(2, 18) if b not in card_bars]

    # Intro: a pad that swells while the playhead scrubs
    l, r = pad([note_hz(n) for n in chords['Am']], bar * 2 + 0.3, cutoff=1100, a=1.2, r=0.4)
    mix.add((l, r), 0, 2.2, bus=music)
    mix.add(sub_bass(note_hz('A1'), bar * 2), 0, 0.35, bus=music)

    kicks = []
    for b in range(2, 18):
        t0 = b * bar
        ch = prog[(b - 2) % 4]
        # pad
        l, r = pad([note_hz(n) for n in chords[ch]], bar + 0.25, cutoff=1800 if b in card_bars else 1200, a=0.05, r=0.3)
        mix.add((l, r), t0, 0.75 if b in card_bars else 0.55, bus=music)
        # off-beat bass + root on the one
        root = note_hz(roots[ch])
        mix.add(sub_bass(root, beat * 0.45), t0, 0.9, bus=music)
        for k in range(4):
            mix.add(sub_bass(root * 2, beat * 0.4), t0 + k * beat + beat / 2, 0.75, bus=music)
        # drums
        if b in card_bars:
            for k in (0, 2):
                kicks.append(t0 + k * beat)
            mix.add(clap(), t0 + 3 * beat, 0.8, bus=drums)
            for k in range(8):
                mix.add(hat(), t0 + k * beat / 2, 0.5 if k % 2 else 0.25, pan=0.2, bus=drums)
        else:
            for k in range(4):
                kicks.append(t0 + k * beat)
            for k in (1, 3):
                mix.add(clap(), t0 + k * beat, 1.0, pan=-0.05, bus=drums)
            steps = 16 if b >= 16 else 8
            for k in range(steps):
                off = (k % 2 == 1) if steps == 8 else (k % 4 == 2)
                g = 0.8 if off else 0.3
                mix.add(hat(open_=(off and b >= 14 and k % 8 == (4 if steps == 8 else 6))), t0 + k * bar / steps, g, pan=0.25, bus=drums)
        # plucked arpeggio over the type and montage sections
        if b in (8, 9, 14, 15, 16, 17):
            tones = [note_hz(n) * 2 for n in chords[ch]]
            for k in range(16):
                f = tones[[0, 2, 1, 3, 2, 0, 3, 1][k % 8]]
                mix.add(pluck(f, 0.4), t0 + k * bar / 16, 0.35 if k % 4 == 0 else 0.22, pan=(-0.4 if k % 2 else 0.4), bus=music)

    # Snare roll into the outro
    t17 = 17 * bar
    for k in range(16):
        tk = t17 + 2 * beat + k * (2 * beat / 16)
        mix.add(snare(), tk, 0.15 + 0.5 * (k / 15), bus=drums)

    for k in kicks:
        mix.add(kick(), k, 1.0, bus=drums)

    # Outro: the one, then air
    t18 = 18 * bar
    kicks.append(t18)
    mix.add(kick(1.2), t18, 1.0, bus=drums)
    l, r = pad([note_hz(n) for n in ['A3', 'E4', 'B4', 'C5']], bar * 3 + 2.5, cutoff=1600, a=0.02, r=2.5)
    mix.add((l, r), t18, 0.9, bus=music)
    mix.add(sub_bass(note_hz('A1'), bar * 1.5), t18, 0.8, bus=music)

    # Sidechain the music bus to the kick
    g = mix.sidechain(kicks, depth=0.65)
    music.L *= g
    music.R *= g

    # Sound design straight from the cue sheet
    sfx = cues['sfx']
    fx = Bus(mix.n)
    for a, b in sfx['riser']:
        mix.add(riser(F(b - a)), F(a), 0.85, bus=fx)
    for f in sfx['impact']:
        mix.add(impact(), F(f), 1.0, bus=fx)
    for f in sfx['whoosh']:
        w = whoosh(0.55)
        mix.add_sweep(w * 0.8, F(f) - 0.3, 1.0)
    for i, f in enumerate(sfx['tick']):
        mix.add(tick(2200 + i * 140), F(f), 1.6, pan=-0.6 + i * 0.15, bus=fx)
    for f in sfx['flash']:
        mix.add(riser(F(120 - f), 2000, 12000), F(f), 0.4, bus=fx)
    for f in sfx['chime']:
        for k, n in enumerate(['A5', 'E6']):
            mix.add(bell(note_hz(n), 3.0), F(f) + k * 0.12, 0.55, pan=(-0.3 if k == 0 else 0.3), bus=fx)

    # bus processing + sum
    mL, mR = reverb(music.L, music.R, wet=0.22)
    fL, fR = reverb(fx.L, fx.R, wet=0.3, size=1.4)
    dL, dR = butter(drums.L, 30, 'high'), butter(drums.R, 30, 'high')
    L = mix.L + mL * 0.9 + dL * 1.0 + fL * 0.9
    R = mix.R + mR * 0.9 + dR * 1.0 + fR * 0.9
    # fade the tail
    end = int(cues['durationInFrames'] / fps * SR)
    fade = np.ones(mix.n)
    fade[end - int(1.5 * SR):end] = np.linspace(1, 0, int(1.5 * SR)) ** 1.5
    fade[end:] = 0
    return L[:end] * fade[:end], R[:end] * fade[:end]


# ============================================================ Anar ident (100 BPM, D major pentatonic)

def score_anar():
    cues = json.load(open(os.path.join(ROOT, 'src', 'anar', 'cues.json')))
    fps = cues['fps']
    E = cues['events']
    F = lambda f: f / fps
    dur = cues['durationInFrames'] / fps
    mix = Mix(dur + 2, 100)
    music = Bus(mix.n)
    fx = Bus(mix.n)
    beat = 60 / 100

    # the fall: a soft descending air sweep, then the landing
    from synth import sweep_filter, noise as wn
    fall = sweep_filter(wn(F(E['land'])), 5000, 600, 'band', q=2.0) * np.linspace(0.2, 1, int(F(E['land']) * SR)) * 0.35
    mix.add_sweep(fall, 0, 0.8, 0.1, -0.1)
    mix.add(pop(380), F(E['land']), 1.1, bus=fx)
    mix.add(kick(0.5), F(E['land']), 0.35)
    mix.add(marimba(note_hz('D4')), F(E['land']), 0.8, bus=music)
    mix.add(marimba(note_hz('A4')), F((E['land'] + E['burst']) / 2), 0.45, bus=music)

    # burst: a scatter of pops + a bright chord
    rnd = np.random.default_rng(3)
    for i in range(16):
        mix.add(pop(380 + rnd.random() * 700), F(E['burst']) + rnd.random() * 0.22, 0.45, pan=rnd.uniform(-0.9, 0.9), bus=fx)
    for n in ('D5', 'F#5', 'A5', 'E6'):
        mix.add(marimba(note_hz(n), 1.4), F(E['burst']), 0.4, pan=rnd.uniform(-0.4, 0.4), bus=music)
    mix.add(whoosh(0.5, 900, 7000) * 0.5, F(E['burst']) - 0.05, 0.6)

    # bed
    l, r = pad([note_hz(n) for n in ('D3', 'A3', 'E4', 'F#4')], F(E['fill'] - E['burst']) + 0.6, cutoff=1500, a=1.0, r=0.6)
    mix.add((l, r), F(E['burst']), 1.3, bus=music)

    # swirl home: a rising sweep and an ascending run as seeds land
    mix.add(riser(F(E['fill'] - E['swirl']), 400, 5000) * 0.6, F(E['swirl']), 0.7, bus=fx)
    penta = ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6']
    land0 = E['swirl'] + E['swirlDur'] * 0.8
    land1 = E['swirl'] + E['swirlSpread'] + E['swirlDur']
    for i in range(16):
        t = F(land0 + (land1 - land0) * i / 15)
        mix.add(marimba(note_hz(penta[i % 8]) * (1 if i < 8 else 1), 0.6), t, 0.22 + 0.02 * i, pan=-0.6 + i * 0.08, bus=music)
        mix.add(pop(600 + i * 40), t, 0.18, pan=0.6 - i * 0.08, bus=fx)

    # skin draws on, crown springs, the fruit closes
    mix.add(sweep_filter(wn(0.6), 800, 6000, 'band', q=3) * np.hanning(int(0.6 * SR)) * 0.4, F(E['skin']), 0.8, bus=fx)
    mix.add(pluck(note_hz('A5'), 0.8), F(E['crown']), 0.7, bus=music)
    mix.add(kick(0.8), F(E['fill']), 0.8)
    mix.add(impact() * 0.35, F(E['fill']), 0.6, bus=fx)
    l, r = pad([note_hz(n) for n in ('D3', 'F#3', 'A3', 'C#4', 'E4')], dur - F(E['fill']) + 1, cutoff=1800, a=0.05, r=1.5)
    mix.add((l, r), F(E['fill']), 1.2, bus=music)
    mix.add(sub_bass(note_hz('D2'), F(E['invert'] - E['fill'])), F(E['fill']), 0.5, bus=music)
    mix.add(bell(note_hz('D6'), 2.5), F(E['fill']), 0.5, bus=fx)
    mix.add(bell(note_hz('A6'), 1.5), F(E['glint']), 0.35, pan=-0.4, bus=fx)

    # a light groove once the mark resolves
    kicks = []
    t = F(E['slide'])
    while t < F(E['invert']):
        kicks.append(t)
        mix.add(kick(0.7), t, 0.45)
        mix.add(hat(), t + beat / 2, 0.35, pan=0.3)
        t += beat

    # letters: LTR rising, Persian RTL falling
    for f, n in zip(E['letters'], ('D5', 'F#5', 'A5', 'B5')):
        mix.add(marimba(note_hz(n)), F(f), 0.7, pan=-0.3 + 0.2 * E['letters'].index(f), bus=music)
    for k, n in enumerate(('B5', 'A5', 'F#5', 'D5')):
        mix.add(marimba(note_hz(n) / 2), F(E['fa']) + k * 0.18, 0.6, pan=0.3 - k * 0.2, bus=music)

    # the drip, the flood, the inverted lockup
    mix.add(tick(1800), F(E['drip']), 0.6, bus=fx)
    mix.add(pop(300), F(E['dripLand']), 1.2, bus=fx)
    mix.add_sweep(whoosh(0.9, 300, 3000) * 0.9, F(E['dripLand']) - 0.1, 0.9, -0.3, 0.6)
    mix.add(kick(1.0), F(E['invert']), 0.9)
    kicks.append(F(E['invert']))
    l, r = pad([note_hz(n) for n in ('D3', 'A3', 'D4', 'F#4', 'B4')], dur - F(E['invert']) + 1, cutoff=2400, a=0.02, r=1.2)
    mix.add((l, r), F(E['invert']), 1.4, bus=music)
    for k, n in enumerate(('D5', 'A5', 'D6')):
        mix.add(bell(note_hz(n), 2.5), F(E['invert']) + 0.12 * k, 0.4, pan=(-0.4, 0, 0.4)[k], bus=fx)

    g = mix.sidechain(kicks, depth=0.35)
    music.L *= g
    music.R *= g
    mL, mR = reverb(music.L, music.R, wet=0.3, size=1.2)
    fL, fR = reverb(fx.L, fx.R, wet=0.25)
    L = mix.L + mL + fL
    R = mix.R + mR + fR
    end = int(dur * SR)
    fade = np.ones(end)
    fade[-int(0.8 * SR):] = np.linspace(1, 0, int(0.8 * SR))
    return L[:end] * fade, R[:end] * fade


# ============================================================ Tact 75 (120 BPM, A minor, keys as percussion)

def score_tact():
    cues = json.load(open(os.path.join(ROOT, 'src', 'tact', 'cues.json')))
    fps = cues['fps']
    E = cues['events']
    S = cues['shots']
    F = lambda f: f / fps
    dur = cues['durationInFrames'] / fps
    mix = Mix(dur + 2, 120)
    music = Bus(mix.n)
    fx = Bus(mix.n)
    drums = Bus(mix.n)
    beat = 0.5
    layout = json.load(open(os.path.join(ROOT, 'out', 'tact_layout.json')))
    rnd = np.random.default_rng(11)

    # macro: drone, a slow rim-light sweep, ticks with the type
    from synth import sweep_filter, noise as wn
    l, r = pad([note_hz(n) for n in ('A2', 'E3', 'B3')], F(S['macro'][1]) + 0.5, cutoff=900, a=1.0, r=0.4)
    mix.add((l, r), 0, 3.2, bus=music)
    mix.add(sub_bass(note_hz('A1'), F(S['macro'][1])), 0, 0.55, bus=music)
    air = sweep_filter(wn(F(S['macro'][1])), 600, 2400, 'band', q=1.2) * 0.25
    mix.add_sweep(air * np.hanning(len(air)), 0, 1.8, -0.9, 0.9)
    for f in (18, 24, 36, 60):
        mix.add(tick(2400), F(f), 1.4, pan=-0.4, bus=fx)
    mix.add(riser(F(E['macroPress'] - 70), 200, 1800) * 0.5, F(70), 1.2, bus=fx)
    mix.add(thock(150), F(E['macroPress']), 2.2)
    mix.add(kick(1.1), F(E['macroPress']), 0.8)
    mix.add(bell(note_hz('E6'), 2.0), F(E['macroPress']), 0.25, bus=fx)

    # groove from the explode onwards
    kicks = []
    prog = [('A1', ('A3', 'C4', 'E4', 'G4')), ('F1', ('F3', 'A3', 'C4', 'E4')), ('D2', ('D3', 'F3', 'A3', 'C4')), ('E1', ('E3', 'G3', 'B3', 'D4'))]
    bar = 2.0
    for b in range(2, 10):
        t0 = b * bar
        root, chord = prog[(b - 2) % 4]
        quiet = b == 3 and False
        for k in range(4):
            kicks.append(t0 + k * beat)
            mix.add(kick(), t0 + k * beat, 1.0, bus=drums)
            mix.add(sub_bass(note_hz(root) * 2, beat * 0.4), t0 + k * beat + beat / 2, 0.8, bus=music)
        for k in (1, 3):
            mix.add(clap(), t0 + k * beat, 0.8, bus=drums)
        steps = 16 if b in (6, 7) else 8
        for k in range(steps):
            g = 0.6 if (k % (steps // 4)) == (steps // 8) else 0.22
            mix.add(hat(), t0 + k * bar / steps, g, pan=0.3, bus=drums)
        l, r = pad([note_hz(n) for n in chord], bar + 0.2, cutoff=1100, a=0.05, r=0.3)
        mix.add((l, r), t0, 0.6, bus=music)

    # explode open: outward whoosh + metallic clank
    mix.add(whoosh(0.5, 300, 5000), F(E['explodeOpen']) - 0.2, 0.8)
    mix.add(bell(note_hz('A4') * 1.07, 1.2), F(E['explodeOpen']), 0.25, bus=fx)
    for f in E['labels']:
        mix.add(tick(3000), F(f), 0.8, pan=0.5, bus=fx)
    # collapse into the slam
    mix.add(riser(F(E['impact'] - E['collapse']) + 0.2, 1500, 9000) * 0.8, F(E['collapse']) - 0.2, 0.8, bus=fx)
    mix.add(impact(), F(E['impact']), 1.0, bus=fx)
    for i in range(10):
        mix.add(thock(140 + rnd.random() * 80), F(E['impact']) + rnd.random() * 0.03, 0.35, pan=rnd.uniform(-0.7, 0.7))

    # ripples: every key thocks as the wave reaches it
    for rp in E['ripples']:
        o = layout['esc'] if rp['from'] == 'esc' else layout['enter']
        for k in layout['keys']:
            d = np.hypot(k['x'] - o['x'], (k['z'] - o['z']) * 1.1)
            t = F(rp['at'] + d * E['rippleSpeed'] + 3)
            pan = float(np.clip(-k['z'] / 3.5, -0.9, 0.9))
            mix.add(thock(170 + rnd.random() * 90 + (30 if k['kind'] == 'mod' else 0)), t, 0.16, pan=pan)

    # hero: title hit + riser into the end card
    mix.add(impact() * 0.8, F(E['titleHit']), 0.8, bus=fx)
    a, b = E['heroRiser']
    mix.add(riser(F(b - a)), F(a), 0.8, bus=fx)
    # end: hit, closing wave along the board, then air
    mix.add(impact(), F(E['endHit']), 0.9, bus=fx)
    for k in layout['keys']:
        t = F(S['end'][0] + 18 + (k['x'] + 8) * 1.2 + 3)
        mix.add(thock(200 + rnd.random() * 60), t, 0.09, pan=float(np.clip(k['x'] / 9, -0.9, 0.9)))
    l, r = pad([note_hz(n) for n in ('A2', 'E3', 'B3', 'C4', 'G4')], dur - F(E['endHit']) + 1, cutoff=1600, a=0.02, r=1.5)
    mix.add((l, r), F(E['endHit']), 1.2, bus=music)

    g = mix.sidechain(kicks, depth=0.6)
    music.L *= g
    music.R *= g
    mL, mR = reverb(music.L, music.R, wet=0.2)
    fL, fR = reverb(fx.L, fx.R, wet=0.3, size=1.3)
    dL, dR = butter(drums.L, 30, 'high'), butter(drums.R, 30, 'high')
    L = mix.L + mL + fL + dL
    R = mix.R + mR + fR + dR
    end = int(dur * SR)
    fade = np.ones(end)
    fade[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR)) ** 1.5
    return L[:end] * fade, R[:end] * fade


SCORES = {'showreel': score_showreel, 'anar': score_anar, 'tact': score_tact}


def main():
    os.makedirs(OUT, exist_ok=True)
    which = sys.argv[1:] or ['all']
    names = list(SCORES) if 'all' in which else which
    for name in names:
        L, R = SCORES[name]()
        raw = os.path.join(OUT, f'{name}_raw.wav')
        write_wav(raw, L, R)
        master(raw, os.path.join(OUT, f'{name}.wav'))


if __name__ == '__main__':
    main()
