import { makeFoods } from './base.js'

const rows = [
  // ── TRADITIONAL INDIAN OILS ──────────────────────────────────────────────────
  ['coconut_oil',       'Coconut Oil',                'Nariyal Ka Tel | தேங்காய் எண்ணெய் | नारियल तेल','oil','🥥',862,0.0,0.0,100.0,0.0,0,'vg','a','HH MR AY TR'],
  ['coconut_oil_virgin','Virgin Coconut Oil (VCO)',   'Virgin Nariyal Tel | கன்னி தேங்காய் எண்ணெய்','oil','🥥',862,0.0,0.0,100.0,0.0,0,'vg','a','HH MR AY BO'],
  ['sesame_oil',        'Sesame Oil (Gingelly)',       'Til Ka Tel | நல்லெண்ணெய் | तिल का तेल','oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','HH AI BO MR AY TR'],
  ['sesame_cold',       'Cold-pressed Sesame Oil',    'Kolhu Til Tel | குளிர் அழுத்த நல்லெண்ணெய்','oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','HH AI BO MR AY'],
  ['groundnut_oil',     'Groundnut Oil (Peanut)',     'Mungfali Tel | கடலை எண்ணெய் | मूँगफली तेल','oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','HH MR AY TR'],
  ['groundnut_cold',    'Cold-pressed Groundnut Oil', 'Kolhu Mungfali Tel | நிலக்கடலை எண்ணெய்','oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','HH MR AY'],
  ['mustard_oil',       'Mustard Oil',                'Sarson Ka Tel | கடுகு எண்ணெய் | सरसों का तेल','oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','HH AI BO MR AY TR HP'],
  ['mustard_cold',      'Cold-pressed Mustard Oil',   'Kolhu Sarson Tel | குளிர் அழுத்த கடுகு எண்ணெய்','oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','HH AI BO MR AY'],

  // ── GHEE & CLARIFIED BUTTER ──────────────────────────────────────────────────
  ['ghee_cow',          'Cow Ghee (Desi Ghee)',       'Desi Ghee | நெய் | देसी घी',         'dairy','🧈',900,0.0,0.1,99.8,0.0,0,'v','a','HH BO VD AY TR GF'],
  ['ghee_buffalo',      'Buffalo Ghee',               'Bhains Ka Ghee | எருமை நெய்',        'dairy','🧈',900,0.0,0.1,99.8,0.0,0,'v','a','HH VD AY'],
  ['ghee_a2',           'A2 Cow Ghee (Desi Breed)',   'A2 Desi Gaay Ka Ghee | A2 நெய்',    'dairy','🧈',900,0.0,0.1,99.8,0.0,0,'v','a','HH BO VD AY MR'],
  ['butter_salted',     'Salted Butter',              'Namkeen Makhan | உப்பு வெண்ணெய் | नमकीन मक्खन','dairy','🧈',717,0.9,0.1,81.1,0.0,0,'v','a','VD'],
  ['butter_unsalted',   'Unsalted Butter',            'Bina Namak Makhan | வெண்ணெய்',       'dairy','🧈',717,0.9,0.1,81.1,0.0,0,'v','a','VD AY'],
  ['white_butter',      'White Butter (Makhan)',       'Safed Makhan | வெண் மக்கன் | सफेद मक्खन','dairy','🧈',710,0.9,0.1,80.5,0.0,0,'v','a','VD AY TR'],

  // ── REFINED OILS ─────────────────────────────────────────────────────────────
  ['sunflower_oil',     'Sunflower Oil',              'Surajmukhi Tel | சூரியகாந்தி எண்ணெய் | सूरजमुखी तेल','oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','HH MR VD'],
  ['sunflower_refined', 'Refined Sunflower Oil',      'Refined Surajmukhi Tel | பரிष்கரிக்கப்பட்ட','oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','HH'],
  ['soybean_oil',       'Soybean Oil',                'Soyabean Tel | சோயா எண்ணெய் | सोयाबीन तेल','oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','HH O3'],
  ['rice_bran_oil',     'Rice Bran Oil',              'Rice Bran Tel | அரிசி தவிடு எண்ணெய் | राइस ब्रान तेल','oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','HH MR'],
  ['corn_oil',          'Corn / Maize Oil',           'Makka Ka Tel | சோளம் எண்ணெய் | मकई का तेल','oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','HH'],
  ['palm_oil',          'Palm Oil',                   'Palm Tel | பனை எண்ணெய் | पाम तेल','oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','HF'],
  ['cottonseed_oil',    'Cottonseed Oil',             'Kapas Ka Tel | பருத்தி விதை எண்ணெய்','oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','HH'],
  ['canola_oil',        'Canola Oil',                 'Canola Tel | கனோலா எண்ணெய் | कैनोला','oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','HH O3 MR'],

  // ── OLIVE & PREMIUM OILS ─────────────────────────────────────────────────────
  ['olive_extra_virgin','Extra Virgin Olive Oil',     'EVOO | ஆலிவ் எண்ணெய் | जैतून का तेल','oil','🫒',884,0.0,0.0,100.0,0.0,0,'vg','a','HH AI MR BC BO'],
  ['olive_refined',     'Refined Olive Oil',          'Refined Olive Tel | பரிஷ்கரித்த ஆலிவ் எண்ணெய்','oil','🫒',884,0.0,0.0,100.0,0.0,0,'vg','a','HH MR'],
  ['olive_light',       'Light Olive Oil',            'Light Olive Tel | லைட் ஆலிவ் எண்ணெய்','oil','🫒',884,0.0,0.0,100.0,0.0,0,'vg','a','HH'],
  ['avocado_oil',       'Avocado Oil',                'Avocado Tel | அவகாடோ எண்ணெய்',      'oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','HH MR AI BC'],
  ['walnut_oil',        'Walnut Oil',                 'Akhrot Ka Tel | அக்ரோட் எண்ணெய்',   'oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','O3 HH BC MR AI'],
  ['almond_oil',        'Almond Oil',                 'Badam Ka Tel | பாதாம் எண்ணெய்',     'oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','HH MR VD'],
  ['hemp_oil',          'Hemp Seed Oil',              'Hemp Tel | ஹெம்ப் எண்ணெய்',         'oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','O3 AI MR HH'],
  ['pumpkin_seed_oil',  'Pumpkin Seed Oil',           'Kaddu Beej Tel | பூசணி விதை எண்ணெய்','oil','🫙',884,0.0,0.0,100.0,0.0,0,'vg','a','ZR MR HH HP'],

  // ── SPECIALTY FATS ───────────────────────────────────────────────────────────
  ['dalda',             'Vanaspati / Dalda (Hydrogenated)','Dalda | டால்டா | डालडा',        'oil','🫙',900,0.0,0.0,100.0,0.0,0,'v','a','TR'],
  ['lard',              'Lard (Pork Fat)',             'Suar Ki Charbi | பன்றி கொழுப்பு',  'oil','🟤',902,0.0,0.0,100.0,0.0,0,'nv','a',''],
  ['tallow',            'Beef / Mutton Tallow',        'Charbi | கொழுப்பு | चर्बी',         'oil','🟤',902,0.0,0.0,100.0,0.0,0,'nv','a',''],
  ['cooking_spray',     'Cooking Spray (Oil Spray)',   'Tel Spray | எண்ணெய் ஸ்பிரே',       'oil','🫙',  6,0.0,0.0, 0.7,0.0,0,'vg','a','LF'],
]

export default makeFoods(rows)
