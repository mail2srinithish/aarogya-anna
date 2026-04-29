import { makeFoods } from './base.js'

const rows = [
  // ── MOONG / GREEN GRAM ───────────────────────────────────────────────────────
  ['moong_whole',       'Whole Green Moong (raw)',        'Pachai Payiru | பாசி | हरा मूंग','legume','🟢',347,23.9,59.2,1.2,16.3,25,'vg','ld','HP HF FR IR MR TR'],
  ['moong_dal_raw',     'Moong Dal Split (raw)',          'Pasi Paruppu | பாசி பருப்பு | मूंग दाल','legume','💛',347,24.0,59.6,1.2,16.3,25,'vg','ld','HP HF FR IR GF'],
  ['moong_dal_cooked',  'Moong Dal (Cooked)',             'Pasi Paruppu Kootu | பாசி பருப்பு | मूंग दाल','legume','💛',105,7.0,19.0,0.4,7.6,25,'vg','ld','HP HF FR LG GF'],
  ['moong_yellow',      'Yellow Moong Dal (Dhuli)',       'Yellow Pasi Paruppu | பீட்டு பருப்பு | पीली मूंग','legume','💛',104,7.2,19.0,0.4,7.6,25,'vg','ld','HP HF LG GF TR'],
  ['moong_sprouted',    'Sprouted Moong',                 'Mulai Payiru | முளை பாசி | अंकुरित मूंग','legume','🌱', 30, 3.0, 5.5,0.2,1.8,25,'vg','s','HP FR LG IM PR GF'],
  ['moong_whole_cooked','Whole Moong (Cooked)',           'Pachai Payiru Kootu | பாசி கொட்டு | साबुत मूंग','legume','🟢',105,7.0,19.2,0.4,7.6,25,'vg','ld','HP HF TR GF'],

  // ── TOOR DAL / PIGEON PEA ────────────────────────────────────────────────────
  ['toor_dal_raw',      'Toor / Arhar Dal (raw)',         'Thuvaram Paruppu | துவரம் | तुअर दाल','legume','🟡',343,22.3,57.6,1.7,15.0,22,'vg','ld','HP HF FR SE GF TR'],
  ['toor_dal_cooked',   'Toor Dal (Cooked)',              'Thuvaram Kootu | துவரம் பருப்பு | तुअर दाल','legume','🟡',116,6.8,20.6,0.4,6.8,22,'vg','ld','HP HF FR LG GF'],
  ['pigeon_pea',        'Pigeon Pea (Whole)',             'Thuvarai | துவரை | अरहर',         'legume','🟡',343,21.7,57.6,1.5,15.0,22,'vg','ld','HP HF FR GF TR'],

  // ── MASOOR / RED LENTIL ──────────────────────────────────────────────────────
  ['masoor_raw',        'Masoor Dal / Red Lentil (raw)',  'Mysore Paruppu | மைசூர் பருப்பு | मसूर दाल','legume','🔴',352,25.8,60.1,1.1,10.9,26,'vg','ld','HP HF IR FR GF'],
  ['masoor_cooked',     'Masoor Dal (Cooked)',            'Paruppu | பருப்பு கொட்டு | मसूर दाल','legume','🔴',116,9.0,20.1,0.4,7.9,26,'vg','ld','HP HF IR FR LG GF'],
  ['masoor_whole',      'Whole Masoor (Green/Brown)',     'Green Masoor | பச்சை மைசூர்',   'legume','🟢',353,25.0,60.1,1.1,10.9,26,'vg','ld','HP HF IR FR GF'],

  // ── URAD DAL / BLACK GRAM ────────────────────────────────────────────────────
  ['urad_whole',        'Urad Dal Whole / Black Gram',   'Karuppu Ulundhu | கருப்பு உளுந்து | उड़द दाल','legume','⚫',341,25.2,58.9,1.4,18.3,26,'vg','ld','HP HF IR MR ZR GF TR'],
  ['urad_split_white',  'Urad Dal Split White (Dhuli)',  'Ulundhu Paruppu | உளுந்து பருப்பு | उड़द दाल (धुली)','legume','⚪',341,25.2,58.9,1.4,18.3,26,'vg','bld','HP HF IR MR GF TR'],
  ['urad_cooked',       'Urad Dal (Cooked)',             'Ulundhu Kootu | உளுந்து கறி | उड़द','legume','⚫',105,7.5,19.6,0.5,6.4,26,'vg','ld','HP HF MR GF'],

  // ── CHANA DAL / BENGAL GRAM ──────────────────────────────────────────────────
  ['chana_dal_raw',     'Chana Dal / Split Bengal Gram', 'Kadalai Paruppu | கடலை பருப்பு | चना दाल','legume','💛',370,22.5,56.9,5.0,17.4,27,'vg','ld','HP HF LG DF HH FR GF'],
  ['chana_dal_cooked',  'Chana Dal (Cooked)',            'Kadalai Paruppu Kootu | கடலை பருப்பு | चना दाल','legume','💛',164,8.9,27.3,2.7,7.6,27,'vg','ld','HP HF LG DF GF'],

  // ── KABULI CHANA / CHICKPEAS ─────────────────────────────────────────────────
  ['kabuli_chana_raw',  'White Chickpea / Kabuli Chana (raw)','Vellai Kondakadalai | வெள்ளை கொண்டைக்கடலை | काबुली चना','legume','🟤',364,19.3,60.6,6.0,17.4,28,'vg','ld','HP HF FR LG GF TR'],
  ['kabuli_chana_cooked','White Chickpea (Cooked)',      'Kondakadalai | கொண்டைக்கடலை | काबुली चना','legume','🟤',164,8.9,27.4,2.6,7.6,28,'vg','ld','HP HF FR LG GF'],
  ['chickpea_flour',    'Besan / Chickpea Flour',        'Kadalai Maavu | கடலை மாவு | बेसन','legume','💛',387,22.4,57.8,6.7,10.9,45,'vg','bld','HP HF GF'],

  // ── KALA CHANA / BLACK CHICKPEA ──────────────────────────────────────────────
  ['kala_chana_raw',    'Black Chickpea / Kala Chana (raw)','Karuppu Kondakadalai | கருப்பு கொண்டைக்கடலை | काला चना','legume','⚫',364,17.4,64.4,5.7,17.4,22,'vg','ld','HP HF FR IR GF TR DF'],
  ['kala_chana_cooked', 'Kala Chana (Cooked)',           'Karuppu Kondakadalai Kootu | காலா சனா | काला चना','legume','⚫',132,7.3,22.5,2.6,6.5,22,'vg','ld','HP HF FR LG DF GF'],
  ['kala_chana_sprouted','Sprouted Black Chickpea',      'Mulai Karuppu Kondakadalai | முளை கொண்டைக்கடலை | अंकुरित काला चना','legume','⚫', 70, 5.0,11.5,1.5,5.0,20,'vg','s','HP HF FR LG IM GF'],

  // ── RAJMA / KIDNEY BEANS ─────────────────────────────────────────────────────
  ['rajma_raw',         'Rajma / Red Kidney Beans (raw)','Rajma | ராஜ்மா | राजमा',          'legume','🔴',336,24.9,60.1,0.8,24.9,24,'vg','ld','HP HF FR LG HH GF TR'],
  ['rajma_cooked',      'Rajma (Cooked)',                'Rajma Kootu | ராஜ்மா கறி | राजमा','legume','🔴',127,8.7,22.8,0.5,6.4,24,'vg','ld','HP HF FR IR LG GF'],
  ['rajma_white',       'White Kidney Beans',           'White Rajma | வெள்ளை ராஜ்மா',    'legume','⚪',333,23.0,60.3,0.9,25.0,24,'vg','ld','HP HF FR LG GF'],
  ['rajma_black',       'Black Kidney Beans',           'Black Rajma | கருப்பு ராஜ்மா',   'legume','⚫',341,23.6,59.7,1.4,24.0,24,'vg','ld','HP HF FR LG AI GF'],

  // ── LOBIA / COWPEA ───────────────────────────────────────────────────────────
  ['lobia_raw',         'Cowpea / Lobia (raw)',          'Karamani | காராமணி | लोबिया',     'legume','⚪',336,23.5,60.3,1.3,10.9,33,'vg','ld','HP HF FR IR MR GF'],
  ['lobia_cooked',      'Cowpea (Cooked)',               'Karamani Kootu | காராமணி கறி | लोबिया','legume','⚪',116,7.7,20.8,0.5,6.4,33,'vg','ld','HP HF FR GF'],
  ['cowpea_black',      'Black-Eyed Peas',               'Black-Eyed Peas | கருப்பு கண் பருப்பு','legume','⚪',116,7.7,20.8,0.5,6.4,33,'vg','ld','HP HF FR GF'],

  // ── HORSE GRAM ────────────────────────────────────────────────────────────────
  ['horsegram_raw',     'Horse Gram / Kulthi (raw)',     'Kollu | கொள்ளு | कुलथी',         'legume','🟤',321,22.0,57.0,0.5,5.3,29,'vg','ld','HP IR CR WL DF TR AY GF'],
  ['horsegram_cooked',  'Horse Gram (Cooked)',           'Kollu Rasam base | கொள்ளு கறி',  'legume','🟤',107,6.2,19.8,0.2,2.8,29,'vg','ld','HP IR WL DF GF'],
  ['horsegram_sprout',  'Sprouted Horse Gram',           'Mulai Kollu | முளை கொள்ளு',      'legume','🌱', 65, 5.0,12.0,0.2,3.5,25,'vg','s','HP IR IM DF GF'],

  // ── MOTH BEAN / MATKI ────────────────────────────────────────────────────────
  ['moth_bean_raw',     'Moth Bean / Matki (raw)',       'Matki | மொட்டு பயிறு | मोठ',     'legume','🟡',343,22.9,60.0,1.6,8.0,38,'vg','ld','HP IR MR GF TR'],
  ['moth_bean_cooked',  'Moth Bean (Cooked)',            'Matki Kootu | மட்கி கறி | मोठ',  'legume','🟡',118,7.0,21.0,0.5,4.5,38,'vg','ld','HP IR GF'],
  ['moth_bean_sprouted','Sprouted Moth Bean',            'Mulai Matki | முளை மட்கி',        'legume','🌱', 59, 5.5,10.5,0.3,4.5,30,'vg','s','HP IR IM GF'],

  // ── FIELD BEANS / VAL ────────────────────────────────────────────────────────
  ['val_bean',          'Field Bean / Val (Papdi)',      'Avarai | அவரை | वाल',             'legume','⚪',340,24.9,60.1,0.9,18.0,22,'vg','ld','HP HF GF TR'],
  ['val_green',         'Green Field Bean',              'Pacha Avarai | பச்சை அவரை',      'legume','🟢', 71, 5.8,12.6,0.3,5.0,20,'vg','ld','HP HF LG GF'],

  // ── SOYBEAN ──────────────────────────────────────────────────────────────────
  ['soybean_raw',       'Soybean (raw)',                 'Soya | சோயாபீன் | सोयाबीन',      'legume','🟡',446,36.5,30.2,19.9,9.3,15,'vg','ld','HP HF O3 CR MR'],
  ['soybean_cooked',    'Soybean (Cooked)',              'Soya Kootu | சோயா கறி | सोयाबीन','legume','🟡',173,16.6,9.9,9.0,6.0,15,'vg','ld','HP O3 CR MR'],
  ['tofu_firm',         'Firm Tofu',                    'Tofu | டோஃபு | टोफू',            'legume','⚪', 83, 8.1, 1.9,4.8,0.3,15,'vg','ld','HP CR LG GF'],
  ['tofu_soft',         'Soft Silken Tofu',             'Soft Tofu | மென் டோஃபு',          'legume','⚪', 55, 5.3, 1.8,2.7,0.2,15,'vg','ld','HP CR LF LG GF'],
  ['soy_chunks',        'Soya Chunks (Meal Maker)',     'Meal Maker | மீல் மேக்கர் | सोया चंक्स','legume','⬜',336,52.4,33.9,0.5,13.4,20,'vg','ld','HP HF LG GF MB'],
  ['soy_milk',          'Soy Milk',                     'Soya Paal | சோயா பால் | सोया दूध','beverage','⬜', 33, 3.3, 1.8,1.8,0.4,44,'vg','bs','HP CR HH GF'],
  ['tempeh',            'Tempeh',                       'Tempeh | டெம்பே',                  'legume','🟤',193,18.5,10.0,9.2,9.7,20,'vg','ld','HP PR GF B12'],
  ['natto',             'Natto (Fermented Soybean)',    'Natto | நாட்டோ',                  'legume','🟤',211,19.4,14.4,11.0,5.4,15,'vg','b','HP B12 PR VD GF'],

  // ── PEAS ─────────────────────────────────────────────────────────────────────
  ['green_peas_dried',  'Dried Green Peas (Split)',     'Vatana | பட்டாணி | हरी मटर (सूखी)','legume','🫛',339,24.6,62.0,1.2,25.5,22,'vg','ld','HP HF LG FR GF'],
  ['yellow_split_peas', 'Yellow Split Peas',            'Yellow Vatana | மஞ்சள் பட்டாணி | पीली मटर','legume','🟡',339,23.5,62.4,1.0,25.5,22,'vg','ld','HP HF LG FR GF'],
  ['dried_peas_black',  'Black Peas (Kala Vatana)',     'Kala Vatana | கருப்பு பட்டாணி',   'legume','⚫',339,23.0,62.0,1.1,22.0,24,'vg','ld','HP HF LG GF'],

  // ── LOTUS SEEDS / MAKHANA ────────────────────────────────────────────────────
  ['makhana_popped',    'Makhana / Fox Nuts (popped)',  'Makhana | மகாணா | मखाना',         'snack','⬜',347, 9.7,76.9,0.1,14.5,55,'vg','s','HP HF GF LF FS'],

  // ── PEANUTS / GROUNDNUTS ─────────────────────────────────────────────────────
  ['groundnut_raw',     'Groundnut / Peanut (raw)',     'Verkadalai | வேர்க்கடலை | मूंगफली','nut_seed','🥜',567,25.8,16.1,49.2,8.5,14,'vg','s','HP HH O3 TR'],
  ['groundnut_roasted', 'Roasted Peanut',               'Vada Verkadalai | வறுத்த வேர்க்கடலை | भुनी मूंगफली','nut_seed','🥜',585,23.7,21.5,49.7,8.4,14,'vg','s','HP HH'],
  ['groundnut_boiled',  'Boiled Peanut',                'Velakka Verkadalai | வேகவைத்த வேர்க்கடலை | उबली मूंगफली','nut_seed','🥜',318,13.5,12.0,24.5,6.0,14,'vg','s','HP HF'],
  ['peanut_butter',     'Peanut Butter (natural)',      'Verkadalai Vennai | வேர்க்கடலை வெண்ணெய்','nut_seed','🥜',588,25.1,20.0,50.4,6.0,14,'vg','s','HP HH ED'],
  ['chana_roasted',     'Roasted Chana (Bhuna Chana)',  'Pottu Kadalai | பொட்டுக்கடலை | भुना चना','snack','💛',364,18.2,56.0,6.4,8.0,30,'vg','s','HP HF GF LG TR'],

  // ── LENTILS (INTERNATIONAL) ─────────────────────────────────────────────────
  ['lentils_red',       'Red Lentils (Split)',          'Red Lentils | சிவப்பு பருப்பு | लाल दाल','legume','🔴',352,24.6,63.4,1.1,10.7,21,'vg','ld','HP HF IR FR LG GF'],
  ['lentils_green',     'Green Lentils',                'Green Lentils | பச்சை பருப்பு | हरी दाल','legume','🟢',352,25.8,60.1,1.1,10.9,21,'vg','ld','HP HF IR FR LG GF'],
  ['lentils_beluga',    'Beluga Black Lentils',         'Black Lentils | கருப்பு பருப்பு', 'legume','⚫',352,25.0,60.0,1.0,12.0,21,'vg','ld','HP HF AI IR GF'],
  ['lima_beans',        'Lima Beans / Butter Beans',    'Mochai | மொச்சை | लाइमा बीन',     'legume','🟢',338,21.5,63.4,0.7,19.0,32,'vg','ld','HP HF FR LG GF'],
  ['lima_cooked',       'Lima Beans (Cooked)',          'Mochai Kootu | மொச்சை கறி',       'legume','🟢',115,7.8,20.9,0.4,7.0,32,'vg','ld','HP HF LG GF'],
  ['mochai',            'Field Beans / Mochai',         'Mochai | மொச்சை | मोचई',          'legume','🟢', 84, 6.2,14.3,0.3,6.0,32,'vg','ld','HP HF TR GF'],

  // ── MIXED / PREPARED DAL ─────────────────────────────────────────────────────
  ['pancha_kadalai',    'Pancha Kadalai (5-bean mix)',  'Pancha Kadalai | பஞ்ச கடலை',     'legume','🟤',320,20.0,56.0,2.0,15.0,25,'vg','ld','HP HF FR IR GF TR'],
  ['dal_powder',        'Mixed Dal Powder (Paruppu Podi)','Paruppu Podi | பருப்பு பொடி', 'legume','🟡',380,22.0,55.0,5.0,12.0,35,'vg','ld','HP HF GF TR'],
]

export default makeFoods(rows)
