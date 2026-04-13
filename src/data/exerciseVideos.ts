/**
 * YouTube embed URLs for exercise tutorial videos.
 * Format: https://www.youtube.com/embed/VIDEO_ID
 *
 * These map exercise IDs → YouTube embed URL.
 * Exercises without an entry fall back to a YouTube search link.
 */
export const EXERCISE_VIDEOS: Record<string, string> = {
  // ── CHEST ────────────────────────────────────────────────────────────────
  'barbell-bench-press':       'https://www.youtube.com/embed/rT7DgCr-3pg',
  'dumbbell-chest-press':      'https://www.youtube.com/embed/VmB1G1K7v94',
  'incline-bench-press':       'https://www.youtube.com/embed/DbFgADa2PL8',
  'chest-fly-dumbbell':        'https://www.youtube.com/embed/eozdVDA78K0',
  'push-ups':                  'https://www.youtube.com/embed/IODxDxX7oi4',
  'cable-crossover':           'https://www.youtube.com/embed/Iwe6AmxVf7o',
  'chest-dip':                 'https://www.youtube.com/embed/2z8JmcrW-As',

  // ── BACK ─────────────────────────────────────────────────────────────────
  'bent-over-row':             'https://www.youtube.com/embed/FWJR5Ve8bnQ',
  'dumbbell-row':              'https://www.youtube.com/embed/pYcpY20QaE8',
  'lat-pulldown':              'https://www.youtube.com/embed/CAwf7n6Tuqs',
  'pull-ups':                  'https://www.youtube.com/embed/eGo4IYlbE5g',
  'seated-cable-row':          'https://www.youtube.com/embed/GZbfZ033f74',
  'deadlift':                  'https://www.youtube.com/embed/op9kVnSso6Q',
  'face-pulls':                'https://www.youtube.com/embed/rep-qVOkqgk',
  'inverted-row':              'https://www.youtube.com/embed/7nkOejPDCsU',

  // ── SHOULDERS ────────────────────────────────────────────────────────────
  'barbell-overhead-press':    'https://www.youtube.com/embed/2yjwXTZQDDI',
  'dumbbell-shoulder-press':   'https://www.youtube.com/embed/qEwKCR5JCog',
  'lateral-raises':            'https://www.youtube.com/embed/3VcKaXpzqRo',
  'front-raises':              'https://www.youtube.com/embed/gkOiPMSYKM8',
  'arnold-press':              'https://www.youtube.com/embed/6Z15_WdXmVw',
  'reverse-fly':               'https://www.youtube.com/embed/aSVAFwNMiAo',
  'upright-row':               'https://www.youtube.com/embed/Um3qQGWPBoo',

  // ── BICEPS ───────────────────────────────────────────────────────────────
  'bicep-curls':               'https://www.youtube.com/embed/ykJmrZ5v0Oo',
  'barbell-curl':              'https://www.youtube.com/embed/swKDB-UNifQ',
  'hammer-curl':               'https://www.youtube.com/embed/zC3nLlEvin4',
  'concentration-curl':        'https://www.youtube.com/embed/Jvj2wV0vOYU',
  'preacher-curl':             'https://www.youtube.com/embed/fIWP-FRFNU0',
  'ez-bar-curl':               'https://www.youtube.com/embed/nLY6q84tVEs',
  'spider-curl':               'https://www.youtube.com/embed/2-IIaqpDGeo',
  'incline-dumbbell-curl':     'https://www.youtube.com/embed/soxrZlIl35U',

  // ── TRICEPS ──────────────────────────────────────────────────────────────
  'tricep-pushdown':           'https://www.youtube.com/embed/2-LAMcpzODU',
  'skull-crushers':            'https://www.youtube.com/embed/d_KZxkY_0cM',
  'overhead-tricep-extension': 'https://www.youtube.com/embed/nRiJVZDpdL0',
  'close-grip-bench-press':    'https://www.youtube.com/embed/oRKO_pHMzIo',
  'tricep-dips':               'https://www.youtube.com/embed/6kALZikXxLc',
  'tricep-kickbacks':          'https://www.youtube.com/embed/6SS6K3lAwZ8',
  'diamond-push-ups':          'https://www.youtube.com/embed/J0DnG1_S92I',
  'bench-dip':                 'https://www.youtube.com/embed/c3ZGl4pnLZs',

  // ── LEGS ─────────────────────────────────────────────────────────────────
  'barbell-squat':             'https://www.youtube.com/embed/ultWZbUMPL8',
  'goblet-squat':              'https://www.youtube.com/embed/ZS3ZMdmFOEo',
  'leg-press':                 'https://www.youtube.com/embed/IZxyjW7MPJQ',
  'lunges':                    'https://www.youtube.com/embed/QOVaHwm-Q6U',
  'bulgarian-split-squat':     'https://www.youtube.com/embed/2C-uNgKwPLE',
  'leg-extension':             'https://www.youtube.com/embed/YyvSfVjQeL0',
  'leg-curl':                  'https://www.youtube.com/embed/1Tq3QdYUuHs',
  'calf-raises':               'https://www.youtube.com/embed/gwLzBJYoWlA',
  'sumo-squat':                'https://www.youtube.com/embed/DKGZ3NYF7lA',
  'front-squat':               'https://www.youtube.com/embed/m4ytaCJZpl0',
  'hack-squat':                'https://www.youtube.com/embed/0tn5K9NlCfo',
  'step-ups':                  'https://www.youtube.com/embed/dQqApCGd5Ss',
  'wall-sit':                  'https://www.youtube.com/embed/y-wV4Venusw',

  // ── GLUTES ───────────────────────────────────────────────────────────────
  'hip-thrust':                'https://www.youtube.com/embed/xDmFkJxPzeM',
  'romanian-deadlift':         'https://www.youtube.com/embed/JCXUYuzwNrM',
  'glute-bridge':              'https://www.youtube.com/embed/OUgsJ8-Vi0E',
  'glute-bridge-hold':         'https://www.youtube.com/embed/OUgsJ8-Vi0E',
  'cable-kickback':            'https://www.youtube.com/embed/WXpFBAxbBuY',
  'donkey-kicks':              'https://www.youtube.com/embed/SJ1Xuz9D-ZQ',
  'sumo-deadlift':             'https://www.youtube.com/embed/0RdPx0e3fVs',
  'good-mornings':             'https://www.youtube.com/embed/YA-h3n9L4YU',
  'single-leg-rdl':            'https://www.youtube.com/embed/bZBqSCDKcRg',

  // ── CORE ─────────────────────────────────────────────────────────────────
  'plank':                     'https://www.youtube.com/embed/pSHjTRCQxIw',
  'crunches':                  'https://www.youtube.com/embed/Xyd_fa5zoEU',
  'sit-ups':                   'https://www.youtube.com/embed/1fbU_MkV7NE',
  'bicycle-crunches':          'https://www.youtube.com/embed/9FGilxCbdz8',
  'russian-twists':            'https://www.youtube.com/embed/wkD8rjkodUI',
  'leg-raises':                'https://www.youtube.com/embed/JB2oyawG9KQ',
  'mountain-climbers':         'https://www.youtube.com/embed/nmwgirgXLYM',
  'dead-bug':                  'https://www.youtube.com/embed/4XLEnwUr1d8',
  'ab-wheel-rollout':          'https://www.youtube.com/embed/M2rwvNhTeu4',
  'cable-crunch':              'https://www.youtube.com/embed/2fbujeH3F0E',
  'hanging-knee-raises':       'https://www.youtube.com/embed/hdng3Nm1x70',
  'side-plank':                'https://www.youtube.com/embed/K-CrEi0ymMg',
  'hollow-body-hold':          'https://www.youtube.com/embed/44ScXWFaVBs',
  'v-ups':                     'https://www.youtube.com/embed/iP2fjvG0g3w',

  // ── FULL BODY ─────────────────────────────────────────────────────────────
  'burpees':                   'https://www.youtube.com/embed/dZgVxmf6jkA',
  'kettlebell-swing':          'https://www.youtube.com/embed/eSau7pY7BIk',
  'clean-and-press':           'https://www.youtube.com/embed/VBj3eH6cZ-A',
  'thrusters':                 'https://www.youtube.com/embed/ioB-8-xGGMo',
  'renegade-rows':             'https://www.youtube.com/embed/Ik4OfIFLT-Y',
  'turkish-get-up':            'https://www.youtube.com/embed/boB7H8bS36c',
  'farmers-walk':              'https://www.youtube.com/embed/Fkzk_RqlYig',

  // ── MISC ─────────────────────────────────────────────────────────────────
  'dumbbell-pullover':         'https://www.youtube.com/embed/FK4rHfPSMVo',
  'rack-pull':                 'https://www.youtube.com/embed/mRKkYKSk0T8',
  'landmine-press':            'https://www.youtube.com/embed/XxATgN0XTp0',
  'shrugs':                    'https://www.youtube.com/embed/cJRVVxmytaM',
}
