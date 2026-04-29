import { makeFoods } from './base.js'

const rows = [
  // ── ALMONDS ──────────────────────────────────────────────────────────────────
  ['almond_raw',       'Almonds (raw)',                  'Badam | பாதாம் | बादाम',           'nut_seed','🥜',579,21.2,21.6,49.9,12.5,15,'vg','s','HP BO BC MR VD HH'],
  ['almond_soaked',    'Soaked Almonds (overnight)',     'Bheega Badam | ஊறவைத்த பாதாம்',  'nut_seed','🥜',579,21.2,21.6,49.9,12.5,15,'vg','b','HP BO BC MR GU AY'],
  ['almond_roasted',   'Roasted Almonds (unsalted)',     'Bhuna Badam | வறுத்த பாதாம்',    'nut_seed','🥜',598,21.0,21.6,52.5,12.0,15,'vg','s','HP BO BC MR'],
  ['almond_flour',     'Almond Flour',                   'Badam Atta | பாதாம் மாவு',        'nut_seed','🥜',571,21.4,21.4,49.9,10.3,15,'vg','bld','HP BO GF MR'],
  ['almond_milk',      'Almond Milk (unsweetened)',      'Badam Paal | பாதாம் பால்',        'beverage','🥛', 13, 0.4, 0.3,1.0,0.0,25,'vg','b','LF LG GF'],
  ['almond_butter',    'Almond Butter',                 'Badam Makkhan | பாதாம் வெண்ணெய்','nut_seed','🥜',614,21.0,18.8,55.5,10.3,15,'vg','s','HP BO MR HH GF'],

  // ── CASHEWS ───────────────────────────────────────────────────────────────────
  ['cashew_raw',       'Cashews (raw)',                  'Kaju | முந்திரி | काजू',           'nut_seed','🥜',553,18.2,30.2,43.9,3.3,22,'vg','s','HP MR ZR HH'],
  ['cashew_roasted',   'Roasted Cashews',               'Bhuna Kaju | வறுத்த முந்திரி',    'nut_seed','🥜',574,15.3,32.7,46.4,3.0,22,'vg','s','HP MR ZR'],
  ['cashew_salted',    'Salted Cashews',                'Namkeen Kaju | உப்பு முந்திரி',   'nut_seed','🥜',574,15.3,32.7,46.4,3.0,22,'vg','s','HP MR'],

  // ── WALNUTS ───────────────────────────────────────────────────────────────────
  ['walnut_raw',       'Walnuts',                       'Akhrot | அக்ரோட் | अखरोट',         'nut_seed','🥜',654,15.2,13.7,65.2,6.7,15,'vg','s','O3 BC HH HP AI'],
  ['walnut_roasted',   'Roasted Walnuts',               'Bhuna Akhrot | வறுத்த அக்ரோட்',  'nut_seed','🥜',654,15.0,14.4,65.0,6.5,15,'vg','s','O3 BC HH HP'],

  // ── PISTACHIOS ───────────────────────────────────────────────────────────────
  ['pistachio_raw',    'Pistachios',                    'Pista | பிஸ்தா | पिस्ता',          'nut_seed','🟢',560,20.2,27.5,45.4,10.3,15,'vg','s','HP FR MR ZR'],
  ['pistachio_roasted','Roasted Pistachios',            'Bhuna Pista | வறுத்த பிஸ்தா',    'nut_seed','🟢',568,21.1,28.3,45.8,10.0,15,'vg','s','HP FR MR'],

  // ── HAZELNUTS ────────────────────────────────────────────────────────────────
  ['hazelnut',         'Hazelnut (Filbert)',             'Hazelnut | ஹேசல்நட்',             'nut_seed','🟤',628,15.0,16.7,60.8,9.7,15,'vg','s','MR HP HH BC O3'],

  // ── BRAZIL NUTS ──────────────────────────────────────────────────────────────
  ['brazil_nut',       'Brazil Nuts',                   'Brazil Nuts | பிரேஜில் நட்',       'nut_seed','🟤',659,14.3,12.3,67.1,7.5,15,'vg','s','SE TY BC MR HP'],

  // ── PINE NUTS ────────────────────────────────────────────────────────────────
  ['pine_nuts',        'Pine Nuts (Chilgoza)',           'Chilgoza | சில்கோஜா | चिलगोजा',   'nut_seed','🟡',673,13.7, 9.4,68.4,3.7,15,'vg','s','MR ZR HP HH O3'],

  // ── MACADAMIA ────────────────────────────────────────────────────────────────
  ['macadamia',        'Macadamia Nuts',                'Macadamia | மகாடமியா',             'nut_seed','🟡',718, 7.9,13.8,75.8,8.6,10,'vg','s','MR HH LG'],

  // ── COCONUT (DRIED) ──────────────────────────────────────────────────────────
  ['coconut_desiccated','Desiccated Coconut',           'Kopra | கோப்ரா | कोपरा',           'nut_seed','🥥',660, 6.9,24.0,64.5,16.3,35,'vg','a','ED HH MR TR'],
  ['coconut_flakes',   'Coconut Flakes (sweetened)',    'Meetha Nariyal | தேங்காய் செதில்','nut_seed','🥥',443, 3.0,46.5,28.8,14.0,42,'vg','s','HF ED TR'],

  // ── SESAME SEEDS ─────────────────────────────────────────────────────────────
  ['sesame_white',     'White Sesame Seeds (Til)',      'Ellu | எள் | सफेद तिल',            'nut_seed','⬜',573,17.7,23.4,49.7,11.8,35,'vg','a','CR BO HH MR ZR TR'],
  ['sesame_black',     'Black Sesame Seeds',            'Kala Til | கருப்பு எள்',           'nut_seed','⚫',573,17.7,23.4,49.7,11.8,35,'vg','a','CR BO AI MR ZR TR'],
  ['sesame_roasted',   'Roasted Sesame Seeds',          'Bhuna Til | வறுத்த எள்',           'nut_seed','🟤',573,17.7,23.4,49.7,11.8,35,'vg','a','CR BO MR ZR'],
  ['tahini',           'Tahini (Sesame Paste)',          'Til Paste | எள் கிண்டல்',          'nut_seed','⬜',595,17.0,21.2,53.8,9.3,35,'vg','a','CR BO MR ZR HP'],

  // ── FLAXSEEDS ────────────────────────────────────────────────────────────────
  ['flaxseed',         'Flaxseeds / Linseeds (Alsi)',   'Alsi | அல்சி | अलसी',              'nut_seed','🟤',534,18.3,28.9,42.2,27.3,35,'vg','a','O3 HF HH AI PC BC HT'],
  ['flaxseed_ground',  'Ground Flaxseed (Flax Meal)',   'Pisi Alsi | பொடி அல்சி',          'nut_seed','🟤',534,18.3,28.9,42.2,27.3,35,'vg','a','O3 HF HH AI'],
  ['flaxseed_oil',     'Flaxseed Oil',                  'Alsi Ka Tel | அல்சி எண்ணெய்',     'oil','🟡',884, 0.1, 0.0,99.9,0.0,0,'vg','a','O3 HH AI'],

  // ── SUNFLOWER SEEDS ─────────────────────────────────────────────────────────
  ['sunflower_seeds',  'Sunflower Seeds',               'Surajmukhi Beej | சூரியகாந்தி விதை | सूरजमुखी बीज','nut_seed','🌻',584,20.8,20.0,51.5,8.6,35,'vg','s','SE VD MR ZR HP HH'],
  ['sunflower_roasted','Roasted Sunflower Seeds',       'Bhuna Surajmukhi | வறுத்த சூரிய விதை','nut_seed','🌻',592,23.4,24.1,49.8,9.2,35,'vg','s','SE MR ZR HP'],

  // ── PUMPKIN SEEDS ────────────────────────────────────────────────────────────
  ['pumpkin_seeds',    'Pumpkin Seeds (Pepitas)',        'Kaddu Ke Beej | பூசணி விதை | कद्दू के बीज','nut_seed','🟢',559,30.2,10.7,49.1,6.0,35,'vg','s','HP ZR MR BO TY'],
  ['pumpkin_roasted',  'Roasted Pumpkin Seeds',         'Bhuna Kaddu Beej | வறுத்த பூசணி விதை','nut_seed','🟢',542,29.8,15.3,47.4,5.8,35,'vg','s','HP ZR MR'],

  // ── CHIA SEEDS ───────────────────────────────────────────────────────────────
  ['chia_seeds',       'Chia Seeds',                    'Chia Beej | சியா விதை | चिया बीज','nut_seed','⬜',486,16.5,42.1,30.7,34.4,35,'vg','s','O3 HF BO CR MR BC GF'],
  ['chia_soaked',      'Soaked Chia Seeds',             'Bheega Chia | ஊறிய சியா விதை',   'nut_seed','⬜', 78, 2.7, 6.7,4.9, 5.5,35,'vg','s','O3 HF BO CR GF'],

  // ── HEMP SEEDS ───────────────────────────────────────────────────────────────
  ['hemp_seeds',       'Hemp Seeds',                    'Hemp Beej | ஹெம்ப் விதை',         'nut_seed','🟢',553,31.6, 8.7,48.7, 4.0,35,'vg','s','HP O3 MR ZR GF'],

  // ── POPPY SEEDS ──────────────────────────────────────────────────────────────
  ['poppy_seeds',      'Poppy Seeds (Khus Khus)',       'Khus Khus | கஸ்கஸ் | खसखस',       'nut_seed','⬜',525,17.9,28.1,41.6,19.5,35,'vg','a','CR MR ZR HP TR'],

  // ── SABJA / BASIL SEEDS ─────────────────────────────────────────────────────
  ['sabja_seeds',      'Sabja / Sweet Basil Seeds',     'Sabja | சப்ஜா | सब्जा',            'nut_seed','⬜',442,14.4,63.8,4.0,22.6,35,'vg','s','HF GU DT IM AY TR GF'],
  ['sabja_soaked',     'Soaked Sabja Seeds',            'Bheega Sabja | ஊறிய சப்ஜா',       'nut_seed','⬜', 18, 0.6, 2.6,0.2, 0.9,35,'vg','s','GU DT IM GF'],

  // ── WATERMELON SEEDS ─────────────────────────────────────────────────────────
  ['watermelon_seeds', 'Watermelon Seeds (roasted)',    'Tarbooz Ke Beej | தர்பூசணி விதை | तरबूज के बीज','nut_seed','🌑',557,28.3,15.3,47.4,0.5,35,'vg','s','HP MR ZR SE'],

  // ── NIGELLA / KALONJI ────────────────────────────────────────────────────────
  ['kalonji',          'Nigella / Kalonji Seeds',       'Kalonji | கலோஞ்சி | कलौंजी',      'spice','⚫',375,17.8,44.2,22.3,38.2,35,'vg','a','AI HH IM AY TR'],

  // ── CAROM SEEDS ──────────────────────────────────────────────────────────────
  ['ajwain',           'Carom Seeds (Ajwain)',           'Omam | ஓமம் | अजवाइन',            'spice','⬜',305,15.9,43.1,25.0,21.2,35,'vg','a','GU AI IM AY TR'],

  // ── MUSTARD SEEDS ────────────────────────────────────────────────────────────
  ['mustard_seeds',    'Black Mustard Seeds',           'Kadugu | கடுகு | राई (सरसों)',     'spice','🟤',508,26.1,28.1,36.2,12.2,35,'vg','a','AI HH TR AY'],
  ['mustard_yellow',   'Yellow Mustard Seeds',          'Peeli Sarson | மஞ்சள் கடுகு',    'spice','🟡',469,24.9,30.4,32.4,15.0,35,'vg','a','AI TR'],
  ['mustard_powder',   'Mustard Powder',                'Sarson Powder | கடுகு தூள்',       'spice','🟡',469,23.0,30.0,28.0,15.0,35,'vg','a','AI GU'],

  // ── LOTUS SEEDS / MAKHANA ───────────────────────────────────────────────────
  ['makhana_raw',      'Fox Nuts / Makhana (raw)',      'Makhana | மகாணா | मखाना',          'nut_seed','⬜',347, 9.7,76.9,0.1,14.5,55,'vg','s','HP HF GF LF FS TR AY'],

  // ── PINE SEEDS / MELON SEEDS ─────────────────────────────────────────────────
  ['melon_seeds',      'Musk Melon Seeds (Charmagaz)', 'Charmagaz | சர்மகஜ் | खरबूज के बीज','nut_seed','🟡',560,26.0,21.0,44.0,6.0,35,'vg','s','HP MR ZR TR AY'],
  ['chironji',         'Chironji Nuts (Charoli)',       'Charoli | சரோலி | चिरौंजी',        'nut_seed','🟤',573,21.6,12.1,53.5,6.4,30,'vg','s','HP MR ZR FS TR'],
]

export default makeFoods(rows)
