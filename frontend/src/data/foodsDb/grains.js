import { makeFoods } from './base.js'

const rows = [
  // ── FINGER MILLET / RAGI ─────────────────────────────────────────────────────
  ['ragi_whole',       'Ragi / Finger Millet (whole)',   'Ragi | கேழ்வரகு | रागी',        'millet','🟤',336, 7.3,72.0,1.9,3.6,55,'vg','ld','CR IR MR HF DF TR GF'],
  ['ragi_flour',       'Ragi Flour',                     'Keezhvaragu Maavu | கேழ்வரகு மாவு | रागी का आटा','millet','🟤',328, 7.2,72.0,1.9,3.2,55,'vg','bld','CR IR MR HF GF TR'],
  ['ragi_flakes',      'Ragi Flakes',                    'Ragi Flakes | கேழ்வரகு செதில்கள்','millet','🟤',350, 7.0,75.0,2.0,3.5,55,'vg','b','CR IR GF MR'],
  ['ragi_malt',        'Ragi Malt Drink',                'Ragi Malt | ராகி மால்ட்',        'grain','🥛',152, 4.5,30.0,1.6,2.8,65,'vg','bs','CR IR MR ED TR'],
  ['ragi_ambali',      'Ragi Ambali (Fermented Porridge)','Ambali | கேழ்வரகு கஞ்சி | रागी अम्बाली','grain','🥛', 85, 4.2,18.0,0.8,2.8,45,'vg','b','CR IR PR GU GF TR'],
  ['ragi_roti',        'Ragi Roti',                     'Keezhvaragu Roti | கேழ்வரகு ரொட்டி','dish','🫓',230, 5.8,45.0,3.5,3.0,55,'vg','bl','CR MR GF TR'],
  ['ragi_mudde',       'Ragi Mudde (Ragi Ball)',         'Ragi Mudde | ராகி முட்டே | रागी मुड्डे','dish','🟤',145, 3.3,30.0,1.0,2.2,55,'vg','ld','CR MR GF TR'],
  ['ragi_dosa',        'Ragi Dosa',                      'Keezhvaragu Dosai | கேழ்வரகு தோசை','dish','🥞',118, 3.8,22.0,2.0,2.5,48,'vg','b','CR IR GF TR'],

  // ── PEARL MILLET / BAJRA ─────────────────────────────────────────────────────
  ['bajra_whole',      'Bajra / Pearl Millet (whole)',   'Bajra | கம்பு | बाजरा',          'millet','⬜',361, 10.9,67.5,5.0,1.2,55,'vg','ld','HP IR MR ZR HH GF TR'],
  ['bajra_flour',      'Bajra Flour',                    'Kambu Maavu | கம்பு மாவு | बाजरे का आटा','millet','⬜',352, 10.6,67.0,5.0,1.3,55,'vg','bld','HP IR MR GF TR'],
  ['bajra_roti',       'Bajra Roti / Bhakri',            'Kambu Roti | கம்பு ரொட்டி | बाजरे की रोटी','dish','🫓',220, 8.0,42.0,4.0,1.0,53,'vg','ld','HP IR MR GF TR'],
  ['bajra_khichdi',    'Bajra Khichdi',                  'Kambu Khichdi | கம்பு கிச்சடி', 'dish','🍲',140, 5.0,26.0,2.0,1.5,52,'vg','ld','HP IR GF TR'],
  ['bajra_rabdi',      'Bajra Raab (Warm Porridge)',     'Bajra Raab | கம்பு கஞ்சி',       'dish','🥛',120, 4.5,22.0,2.5,1.2,50,'vg','b','HP MR CR GF TR'],

  // ── SORGHUM / JOWAR ──────────────────────────────────────────────────────────
  ['jowar_whole',      'Jowar / Sorghum (whole)',        'Cholam | சோளம் | ज्वार',         'millet','🟡',329, 10.4,72.6,1.9,6.3,62,'vg','ld','HP HF IR MR GF TR'],
  ['jowar_flour',      'Jowar Flour',                    'Cholam Maavu | சோளம் மாவு | ज्वार का आटा','millet','🟡',325, 10.2,72.0,2.0,6.0,62,'vg','bld','HP HF IR MR GF'],
  ['jowar_roti',       'Jowar Roti / Bhakri',            'Cholam Roti | சோளம் ரொட்டி | ज्वार की रोटी','dish','🫓',200, 7.0,41.0,2.0,4.0,60,'vg','ld','HF IR GF TR'],
  ['jowar_popped',     'Popped Sorghum (Jowar Pop)',     'Jowar Pop | சோள பாப்',           'snack','⬜',366, 10.5,73.0,2.0,5.8,58,'vg','s','HF HP GF'],

  // ── FOXTAIL MILLET ───────────────────────────────────────────────────────────
  ['foxtail_whole',    'Foxtail Millet (Thinai / Kangni)','Thinai | தினை | कंगनी',         'millet','🟡',331, 12.3,60.9,4.0,8.0,50,'vg','ld','HP HF IR MR GF TR'],
  ['foxtail_rice',     'Foxtail Millet Rice',            'Thinai Sadam | தினை சாதம்',      'dish','🍚',118, 4.2,22.0,1.5,3.0,50,'vg','ld','HP HF GF TR'],
  ['foxtail_pongal',   'Foxtail Millet Pongal',          'Thinai Pongal | தினை பொங்கல்',  'dish','🍚',155, 5.5,27.5,3.0,2.8,48,'vg','b','HP MR GF TR'],

  // ── KODO MILLET ──────────────────────────────────────────────────────────────
  ['kodo_whole',       'Kodo Millet (Varagu / Kodon)', 'Varagu | வரகு | कोदो',            'millet','🟤',309, 8.3,65.9,1.4,9.0,55,'vg','ld','HF IR MR DF GF TR'],
  ['kodo_rice',        'Kodo Millet Rice',               'Varagu Sadam | வரகு சாதம்',      'dish','🍚',113, 3.0,24.0,0.7,3.5,53,'vg','ld','HF DF GF TR'],

  // ── LITTLE MILLET ─────────────────────────────────────────────────────────────
  ['little_whole',     'Little Millet (Samai / Kutki)', 'Samai | சாமை | छोटी ललरी',       'millet','⬜',341, 7.7,72.9,4.7,7.6,55,'vg','ld','HF IR HP GF TR'],
  ['little_millet_rice','Little Millet Rice',            'Samai Sadam | சாமை சாதம்',       'dish','🍚',110, 2.8,23.0,1.5,3.0,52,'vg','ld','HF GF TR'],

  // ── BARNYARD MILLET ─────────────────────────────────────────────────────────
  ['barnyard_whole',   'Barnyard Millet (Kuthiraivali)','Kuthiraivali | குதிரைவாலி | सांवा','millet','⬜',342, 6.2,65.5,2.9,12.6,50,'vg','ld','HF IR DF GF TR'],
  ['barnyard_rice',    'Barnyard Millet Rice',           'Kuthiraivali Sadam | குதிரைவாலி சாதம்','dish','🍚',108, 2.2,22.0,0.8,4.5,48,'vg','ld','HF DF GF TR'],

  // ── PROSO MILLET ────────────────────────────────────────────────────────────
  ['proso_whole',      'Proso Millet (Pani Varagu)',     'Pani Varagu | பனிவரகு | चेना',   'millet','⬜',356, 11.0,70.4,4.2,8.5,55,'vg','ld','HP HF GF TR'],

  // ── BROWNTOP MILLET ──────────────────────────────────────────────────────────
  ['browntop_whole',   'Browntop Millet (Andu Korralu)', 'Andu Korralu | அண்டு கொர்ரலு', 'millet','🟤',345, 11.5,67.0,3.7,12.5,50,'vg','ld','HF HP GF TR'],

  // ── AMARANTH (RAJGIRA) ───────────────────────────────────────────────────────
  ['amaranth_seeds',   'Amaranth Seeds (Rajgira)',       'Rajgira | ராஜ்கீரா | राजगिरा',   'millet','🟤',371, 13.6,65.3,7.0,6.7,35,'vg','blds','HP CR MR GF FS TR'],
  ['amaranth_flour',   'Amaranth Flour',                 'Rajgira Atta | ராஜ்கீரா மாவு',   'millet','🟤',367, 13.5,65.0,6.9,6.5,35,'vg','b','HP CR MR GF'],
  ['amaranth_popped',  'Popped Amaranth (Rajgira Ladoo base)','Rajgira Pop | ராஜ்கீரா பாப்','snack','⬜',371, 13.6,65.3,7.0,6.7,35,'vg','s','HP CR GF FS'],

  // ── QUINOA ───────────────────────────────────────────────────────────────────
  ['quinoa',           'Quinoa',                         'Quinoa | குவினோவா | क्विनोआ',    'grain','🟡',368, 14.1,64.2,6.1,7.0,53,'vg','ld','HP MR ZR HF GF'],
  ['quinoa_cooked',    'Cooked Quinoa',                  'Pakka Quinoa | வேகவைத்த குவினோவா','grain','🟡',120, 4.4,21.3,1.9,2.8,53,'vg','ld','HP GF MR'],

  // ── BUCKWHEAT ────────────────────────────────────────────────────────────────
  ['buckwheat',        'Buckwheat (Kuttu)',               'Kuttu | கோதுமை வகை | कुट्टू',    'grain','🟤',343, 13.3,71.5,3.4,10.0,54,'vg','bld','HP HF MR GF FS TR'],
  ['buckwheat_flour',  'Buckwheat Flour',                'Kuttu Atta | கட்டு மாவு',        'grain','🟤',335, 12.6,70.6,3.1,10.0,54,'vg','bld','HP HF MR GF'],
  ['buckwheat_soba',   'Soba Noodles (Buckwheat)',       'Soba | சோபா',                   'grain','🍜',355, 12.9,73.0,2.6,8.0,55,'vg','ld','HP HF MR GF'],

  // ── RICE VARIETIES ───────────────────────────────────────────────────────────
  ['white_rice',       'White Rice (Boiled)',            'Sadam | அரிசி சாதம் | सफेद चावल','grain','🍚',130, 2.7,28.2,0.3,0.4,73,'vg','ld','GF'],
  ['basmati_cooked',   'Basmati Rice (Cooked)',          'Basmati Sadam | பாஸ்மதி சாதம்',  'grain','🌾',121, 3.5,25.2,0.4,0.4,50,'vg','ld','GF LG'],
  ['basmati_raw',      'Basmati Rice (Raw)',             'Basmati | பாஸ்மதி | बासमती',      'grain','🌾',346, 6.8,78.1,0.5,0.4,50,'vg','ld','GF LG'],
  ['sona_masoori',     'Sona Masoori Rice',             'Sona Masoori | சோனா மசூரி',      'grain','🍚',346, 6.8,78.0,0.5,0.6,51,'vg','ld','GF LG TR'],
  ['kavuni_arisi',     'Kavuni Arisi / Black Rice',     'Kavuni | கவுனி அரிசி | काला चावल','grain','🟣',356, 8.9,76.0,3.5,4.5,42,'vg','ld','AI IR HF HH DF TR'],
  ['red_rice_matta',   'Matta / Red Rice (Kerala)',      'Matta | மட்ட அரிசி | लाल चावल', 'grain','🔴',351, 7.5,73.0,2.8,3.5,55,'vg','ld','HF IR MR DF TR'],
  ['brown_rice',       'Brown Rice (Whole Grain)',       'Paruppu Arisi | தவிட்டு அரிசி | भूरा चावल','grain','🟤',370, 7.9,77.0,2.9,3.5,50,'vg','ld','HF MR DF HH SE'],
  ['parboiled_rice',   'Parboiled Rice (Ukda Chawal)',   'Ukda | வேகவைத்த அரிசி | उबला चावल','grain','🍚',365, 7.4,78.6,1.0,0.6,56,'vg','ld','GF TR'],
  ['ponni_rice',       'Ponni Rice',                     'Ponni | பொன்னி அரிசி',           'grain','🍚',346, 6.8,78.0,0.5,0.5,56,'vg','ld','GF TR'],
  ['idli_rice',        'Idli Rice (Parboiled)',          'Idli Arisi | இட்லி அரிசி',        'grain','🍚',350, 6.9,77.0,0.6,0.5,56,'vg','b','GF TR'],
  ['poha',             'Poha / Flattened Rice (Aval)',   'Aval | அவல் | पोहा',              'grain','⬜',369, 6.4,79.9,1.2,0.3,82,'vg','bs','GF TR'],
  ['murmura',          'Puffed Rice (Murmura / Muri)',   'Pori | பொரி | मुरमुरा',           'snack','⬜',402, 6.0,89.0,0.8,0.5,90,'vg','s','GF LF TR'],
  ['rice_flour',       'Rice Flour',                     'Arisi Maavu | அரிசி மாவு | चावल का आटा','grain','⬜',366, 5.9,80.1,1.4,2.4,95,'vg','bld','GF TR'],
  ['rice_bran',        'Rice Bran',                      'Arisi Thoodu | அரிசி தவிடு | चावल की भूसी','grain','🟤',316, 13.4,49.9,20.8,6.5,42,'vg','a','MR HF HP'],
  ['kolam_rice',       'Kolam Rice (Maharashtra)',       'Kolam | கோலம் அரிசி',            'grain','🍚',345, 6.7,77.5,0.5,0.5,55,'vg','ld','GF TR'],
  ['gobindobhog_rice', 'Gobindobhog Rice (Bengal)',      'Gobindobhog | கோவிந்தபோக்',      'grain','🌾',345, 6.8,78.0,0.4,0.4,55,'vg','ld','GF TR FS'],
  ['ambemohar_rice',   'Ambemohar Rice (Maharashtra)',   'Ambemohar | அம்பேமோஹர்',         'grain','🌾',346, 6.9,77.8,0.5,0.5,55,'vg','ld','GF TR'],
  ['black_rice_raw',   'Black Rice (Forbidden Rice)',    'Kavuni / Kala Chawal | கருப்பு அரிசி','grain','🟣',356, 8.9,76.0,3.5,4.5,42,'vg','ld','AI IR DF TR HH'],
  ['red_rice_raw',     'Red Rice (Raw)',                 'Sivappu Arisi | சிவப்பு அரிசி',  'grain','🔴',362, 7.0,75.0,3.0,3.5,55,'vg','ld','HF IR MR TR'],
  ['rice_water',       'Kanji (Rice Water / Congee)',    'Kanji | கஞ்சி | माड़ (चावल का पानी)','beverage','⬜', 32, 0.5, 7.5,0.1,0.1,55,'vg','b','GU GF TR PR'],

  // ── WHEAT ────────────────────────────────────────────────────────────────────
  ['whole_wheat',      'Whole Wheat (Atta)',              'Gehun | கோதுமை | गेहूं',         'grain','🌾',340, 11.8,71.2,2.0,12.2,50,'vg','bld','HP HF MR SE'],
  ['atta_flour',       'Whole Wheat Flour (Chakki Atta)','Atta | கோதுமை மாவு | आटा',       'grain','🌾',340, 11.8,71.5,2.0,12.0,50,'vg','bld','HP HF MR'],
  ['maida_flour',      'Refined Wheat Flour (Maida)',    'Maida | மைதா | मैदा',             'grain','⬜',364, 10.0,76.3,1.2,2.7,85,'vg','bld',''],
  ['semolina',         'Semolina / Rava (Suji)',          'Rava | ரவை | सूजी',              'grain','🟡',360, 12.6,73.8,1.0,3.9,66,'vg','b',''],
  ['wheat_bran',       'Wheat Bran',                     'Gehun Chokar | கோதுமை தவிடு',    'grain','🟤',246, 15.6,64.5,4.3,43.6,15,'vg','a','HF HP MR ZR'],
  ['bulgur_wheat',     'Bulgur Wheat (Dalia)',            'Dalia | தலியம் | बुलगुर',         'grain','🟡',342, 12.3,75.9,1.3,18.3,46,'vg','bl','HF HP MR LG SE'],
  ['dalia',            'Broken Wheat (Daliya)',           'Daliya | கோதுமை ரவை | दलिया',   'grain','🌾',340, 12.0,72.0,1.5,10.0,50,'vg','b','HF HP MR TR'],
  ['khapli_wheat',     'Khapli / Emmer Wheat',           'Khapli | கப்பலி கோதுமை | खपली गेहूं','grain','🟤',339, 14.7,67.0,2.9,9.5,45,'vg','bld','HP HF MR LG DF TR AY'],
  ['sharbati_wheat',   'Sharbati Wheat',                 'Sharbati | ஷர்பதி கோதுமை',       'grain','🌾',338, 11.5,70.8,1.8,12.0,48,'vg','bld','HP HF'],

  // ── CORN / MAIZE ─────────────────────────────────────────────────────────────
  ['corn_dried',       'Dried Corn / Maize',             'Makka | சோளம் | मक्का',          'grain','🌽',365, 9.4,74.3,4.7,7.3,52,'vg','ld','SE HP'],
  ['corn_flour',       'Corn Flour / Makke Ka Atta',     'Makka Maavu | சோள மாவு | मक्के का आटा','grain','🟡',361, 6.9,73.0,3.9,7.3,70,'vg','bld','GF HP'],
  ['cornmeal',         'Cornmeal (Polenta base)',         'Makai | மக்காச்சோள மாவு',        'grain','🌽',362, 8.1,73.9,3.8,7.3,68,'vg','ld','GF HP'],
  ['popcorn',          'Popcorn (Air-Popped)',            'Makka Pori | சோள பாப்கார்ன்',   'snack','🍿',387, 12.9,78.1,4.5,14.5,55,'vg','s','HF HP GF'],

  // ── OATS ─────────────────────────────────────────────────────────────────────
  ['oats_rolled',      'Rolled Oats',                    'Oats | ஓட்ஸ் | जई',              'grain','⬜',389, 16.9,66.3,6.9,10.6,57,'vg','b','HP HF MR HH LG DF'],
  ['oats_steel_cut',   'Steel Cut Oats',                 'Steel Cut Oats | ஸ்டீல் கட் ஓட்ஸ்','grain','⬜',379, 14.8,65.9,8.2,11.0,42,'vg','b','HP HF MR LG HH'],
  ['oat_bran',         'Oat Bran',                       'Oat Bran | ஓட் தவிடு',           'grain','⬜',246, 17.3,66.2,7.0,15.4,50,'vg','b','HF HP MR HH LG'],
  ['oat_flour',        'Oat Flour',                      'Oat Maavu | ஓட் மாவு',           'grain','⬜',404, 14.7,65.7,9.1,9.0,55,'vg','b','HP HF MR'],

  // ── BARLEY ───────────────────────────────────────────────────────────────────
  ['barley_whole',     'Whole Barley (Jau)',              'Jau | வாற்கோதுமை | जौ',          'grain','🟤',354, 12.5,73.5,2.3,17.3,28,'vg','ld','HP HF MR LG HH DF'],
  ['barley_pearled',   'Pearled Barley',                  'Poti Jau | மெல்லிய ஜாவு',        'grain','🟤',354, 9.9,73.5,1.2,15.6,25,'vg','ld','HF LG HH DF'],
  ['barley_water',     'Barley Water',                    'Jau Ka Pani | வாற்கோதுமை தண்ணீர்','beverage','🥤', 15, 0.4, 3.5,0.1,0.5,25,'vg','s','DT GU LG AY'],
  ['sattu_barley',     'Sattu (Roasted Chana + Barley)', 'Sattu | சத்து | सत्तू',           'grain','⬜',406, 20.6,59.0,6.5,3.8,40,'vg','bs','HP HF LG DF ED TR'],

  // ── RYE / OTHER GRAINS ───────────────────────────────────────────────────────
  ['rye_flour',        'Rye Flour',                      'Rye Atta | ரை மாவு',             'grain','🟤',335, 8.5,75.9,1.6,14.6,34,'vg','bld','HF LG'],
  ['teff',             'Teff',                           'Teff | டெஃப்',                   'millet','🟤',367, 13.3,73.1,2.4,8.0,57,'vg','ld','HP CR IR MR GF'],
  ['spelt',            'Spelt',                          'Spelt | ஸ்பெல்ட்',               'grain','🟤',338, 14.6,70.2,2.4,10.7,50,'vg','ld','HP HF MR'],
  ['kamut',            'Kamut / Khorasan Wheat',         'Kamut | காமுட்',                  'grain','🟤',337, 14.7,69.2,2.6,10.3,45,'vg','ld','HP HF MR'],

  // ── SABUDANA / SAGO ──────────────────────────────────────────────────────────
  ['sabudana',         'Sabudana / Tapioca Pearls (Sago)','Sabudana | சாகோ | साबूदाना',    'grain','⬜',352, 0.2,86.7,0.0,0.9,85,'vg','s','GF ED TR'],
  ['sago_pearl',       'Sago Pearls (raw)',              'Sago | தபியோக்கா | साबूदाना',    'grain','⬜',358, 0.2,88.6,0.0,0.0,85,'vg','s','GF TR'],

  // ── ANCIENT GRAINS ───────────────────────────────────────────────────────────
  ['makhana',          'Makhana / Fox Nuts / Lotus Seeds','Makhana | மகாணா | मखाना',        'nut_seed','⬜',347, 9.7,76.9,0.1,14.5,55,'vg','s','HP HF GF LF FS TR'],
  ['water_chestnut',   'Water Chestnut (Singhara)',      'Singhara | சிங்காரா | सिंघाड़ा',  'grain','⚪', 97, 2.0,23.9,0.1,3.0,54,'vg','s','GF LF TR FS'],
  ['arrowroot',        'Arrowroot (Koova Podi)',          'Koova | அரோரூட் | अरारोट',        'grain','⚪',357, 0.3,88.2,0.1,3.4,85,'vg','b','GF TR'],
  ['lotus_seeds',      'Lotus Seeds (dried)',             'Thamarai Vithai | தாமரை விதை | कमल बीज','grain','⚪',350, 10.0,75.0,0.5,15.0,50,'vg','s','GF HP HF'],
]

export default makeFoods(rows)
