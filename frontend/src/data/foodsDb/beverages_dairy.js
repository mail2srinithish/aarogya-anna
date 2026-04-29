import { makeFoods } from './base.js'

const rows = [
  // ── MILK ─────────────────────────────────────────────────────────────────────
  ['milk_whole',       'Whole Cow Milk',                 'Paal | பால் | पूरा दूध',            'dairy','🥛', 61, 3.2, 4.8,3.3,0.0,40,'v','b','CR VD B12 HP TR'],
  ['milk_toned',       'Toned Milk (3% fat)',            'Toned Paal | டோன்ட் பால் | टोन्ड दूध','dairy','🥛', 58, 3.5, 4.9,3.0,0.0,40,'v','b','CR VD B12'],
  ['milk_double_toned','Double Toned Milk (1.5% fat)',  'Double Toned | டபுள் டோன்ட் | डबल टोन्ड दूध','dairy','🥛', 46, 3.5, 5.1,1.5,0.0,40,'v','b','CR VD B12 LF'],
  ['milk_skimmed',     'Skimmed Milk (0.1% fat)',        'Skimmed Paal | ஸ்கிம்ட் பால் | स्किम्ड दूध','dairy','🥛', 35, 3.6, 5.1,0.1,0.0,40,'v','b','CR VD B12 LF WL'],
  ['milk_buffalo',     'Buffalo Milk',                   'Erumai Paal | எருமை பால் | भैंस का दूध','dairy','🥛',112, 4.5, 5.2,7.0,0.0,40,'v','b','CR HP ED VD B12'],
  ['milk_goat',        'Goat Milk',                      'Aadu Paal | ஆடு பால் | बकरी का दूध','dairy','🥛', 69, 3.6, 4.5,4.1,0.0,40,'v','b','CR VD B12 HP GU'],
  ['milk_powder',      'Whole Milk Powder',              'Paal Podi | பால் பொடி | दूध पाउडर','dairy','⬜',496,26.3,38.4,26.7,0.0,35,'v','b','CR VD B12 HP'],
  ['milk_condensed',   'Sweetened Condensed Milk',       'Kondensed Milk | மதுரமான பால் | मीठा दूध','sweet','🥛',321, 7.9,54.4,8.7,0.0,65,'v','s','CR TR'],
  ['milk_evaporated',  'Evaporated Milk',               'Evaporated Milk | ஆவியாக்கிய பால்', 'dairy','🥛',135, 6.8,10.0,7.6,0.0,40,'v','b','CR VD B12'],
  ['milk_soy2',        'Soy Milk (unsweetened)',          'Soya Paal | சோயா பால் | सोया दूध', 'dairy','🥛', 33, 3.3, 1.8,1.8,0.4,44,'vg','b','HP CR GF HH'],
  ['milk_almond2',     'Almond Milk (unsweetened)',       'Badam Paal | பாதாம் பால் | बादाम दूध','dairy','🥛', 13, 0.4, 0.3,1.0,0.0,25,'vg','b','LF LG GF MR'],
  ['milk_oat',         'Oat Milk',                       'Oat Paal | ஓட் பால் | ओट दूध',      'dairy','🥛', 47, 1.0, 9.0,1.5,0.8,50,'vg','b','HF GF'],
  ['milk_coconut2',    'Coconut Milk (thick)',            'Thengai Paal | தேங்காய் பால் | नारियल दूध','dairy','🥛',197, 2.3, 5.5,19.0,2.2,45,'vg','ld','HH GF TR'],
  ['milk_coconut_thin','Coconut Milk (thin)',             'Elunda Thengai Paal | நீர்த்த தேங்காய் பால்','dairy','🥛', 68, 1.5, 3.0, 6.5,1.0,45,'vg','ld','HH GF TR'],

  // ── YOGURT / CURD ─────────────────────────────────────────────────────────────
  ['curd_whole',       'Curd / Dahi (whole milk)',       'Dahi | தயிர் | दही',                'dairy','🥛', 98, 3.5, 3.4,4.3,0.0,35,'v','blds','PR GU CR B12 VD TR'],
  ['curd_low_fat',     'Low-Fat Curd',                   'Konda Dahi | குறைந்த கொழுப்பு தயிர் | दही (कम चर्बी)','dairy','🥛', 63, 3.5, 3.9,3.0,0.0,35,'v','blds','PR GU CR B12 LF WL'],
  ['curd_thick',       'Thick Curd / Hung Curd',         'Thayir | கட்டு தயிர் | गाढ़ा दही',  'dairy','🥛',110, 7.5, 3.5,6.0,0.0,30,'v','b','PR HP CR TR'],
  ['greek_yogurt',     'Greek Yogurt',                   'Greek Yogurt | கிரீக் யோகர்ட்',    'dairy','🥛', 59, 10.0,3.6,0.4,0.0,35,'v','b','PR HP CR LF GF WL'],
  ['raita',            'Raita (Yogurt Salad)',            'Raita | ரைதா | रायता',              'dish','🥣', 52, 2.5, 5.5,2.0,1.0,35,'v','ld','PR GU CR TR GF'],
  ['lassi_sweet',      'Sweet Lassi',                    'Meetha Lassi | இனிப்பு லஸ்ஸி | मीठी लस्सी','beverage','🥛',158, 5.5,25.5,4.5,0.0,60,'v','bs','PR CR GU TR'],
  ['lassi_plain',      'Plain Lassi',                    'Sada Lassi | சாதா லஸ்ஸி | सादी लस्सी','beverage','🥛', 78, 5.0, 7.0,3.5,0.0,35,'v','bs','PR CR GU TR'],
  ['lassi_mango',      'Mango Lassi',                    'Mango Lassi | மாம்பழ லஸ்ஸி | आम लस्सी','beverage','🥛',165, 5.0,28.0,4.5,0.5,62,'v','s','PR CR IM TR'],
  ['chaas',            'Chaas / Buttermilk',              'Moru | மோர் | छाछ',                 'beverage','🥛', 28, 1.8, 2.9,1.2,0.0,35,'v','s','PR GU HT CR DT TR LG'],
  ['neer_mor',         'Neer Mor (Thin Buttermilk)',     'Neer Mor | நீர் மோர்',              'beverage','🥛', 18, 1.0, 1.8,0.7,0.0,30,'v','s','PR GU HT DT TR GF LG'],
  ['kefir',            'Kefir',                          'Kefir | கேஃபிர்',                   'dairy','🥛', 61, 3.4, 4.5,3.3,0.0,35,'v','b','PR GU CR B12 VD'],

  // ── PANEER & CHEESE ───────────────────────────────────────────────────────────
  ['paneer',           'Paneer (Indian Cottage Cheese)', 'Paneer | பனீர் | पनीर',             'dairy','🟤',265,18.3, 1.2,20.8,0.0,25,'v','ld','HP CR BO B12 TR'],
  ['paneer_low_fat',   'Low-Fat Paneer',                 'Low Fat Paneer | குறைந்த கொழுப்பு பனீர்','dairy','🟤',168,18.5, 2.0,9.5,0.0,25,'v','ld','HP CR BO LF'],
  ['chhena',           'Chhena (Fresh Paneer Crumbled)','Chhena | சேனா | छेना',              'dairy','🟤',225,16.0, 2.5,17.0,0.0,25,'v','ld','HP CR TR'],
  ['mozzarella',       'Mozzarella Cheese',              'Mozzarella | மொஸ்ஸரெல்லா',         'dairy','⬜',280,28.1, 2.2,17.1,0.0,25,'v','ld','HP CR B12'],
  ['cheddar',          'Cheddar Cheese',                 'Cheddar | செட்டர்',                  'dairy','🟡',402,25.0, 1.3,33.1,0.0,25,'v','ld','HP CR B12'],

  // ── BUTTER & GHEE ─────────────────────────────────────────────────────────────
  ['ghee_cow',         'Cow Ghee',                       'Nei | நெய் | देसी घी',              'oil','💛',900, 0.0, 0.0,99.5,0.0,0,'v','a','VD HH ST TR AY'],
  ['ghee_buffalo',     'Buffalo Ghee',                   'Erumai Nei | எருமை நெய்',           'oil','💛',895, 0.1, 0.0,99.0,0.0,0,'v','a','VD HH TR'],
  ['butter_salted',    'Butter (salted)',                 'Vennai | வெண்ணெய் | मक्खन',         'dairy','💛',717, 0.9, 0.1,81.1,0.0,0,'v','b','VD HH'],
  ['butter_unsalted',  'Butter (unsalted)',               'Unsalted Vennai | உப்பற்ற வெண்ணெய்','dairy','💛',717, 0.9, 0.1,81.1,0.0,0,'v','b','VD HH'],

  // ── TRADITIONAL BEVERAGES ────────────────────────────────────────────────────
  ['chai',             'Masala Chai (Indian Tea)',       'Masala Chai | மசாலா சாய் | मसाला चाय','beverage','🍵', 42, 2.0, 6.0,1.5,0.0,35,'v','b','GU AI IM TR AY'],
  ['black_tea',        'Black Tea (without milk)',        'Kari Chai | கருப்பு டீ | काली चाय', 'beverage','☕',  2, 0.0, 0.0,0.0,0.0,35,'vg','b','AI HH BC'],
  ['green_tea',        'Green Tea',                      'Pacha Chai | பச்சை டீ | हरी चाय',   'beverage','🍵',  2, 0.0, 0.0,0.0,0.0,35,'vg','b','AI HH IM BC WL'],
  ['herbal_tea',       'Herbal / Kadha Tea',             'Kadha | கஷாயம் | काढ़ा',             'beverage','🍵',  8, 0.2, 1.5,0.1,0.0,25,'vg','b','AI GU IM AY TR'],
  ['turmeric_milk',    'Turmeric Milk (Golden Milk)',    'Manjal Paal | மஞ்சள் பால் | हल्दी दूध','beverage','🟡', 90, 4.5,10.5,3.0,0.0,35,'v','b','AI IM CR AY TR'],
  ['ginger_tea',       'Ginger Tea',                     'Inji Chai | இஞ்சி டீ | अदरक की चाय','beverage','🍵', 18, 0.3, 3.5,0.2,0.0,25,'v','b','GU AI IM AY'],
  ['rose_milk',        'Rose Milk (Rooh Afza)',           'Rose Paal | ரோஸ் பால் | रोज मिल्क', 'beverage','🌹',128, 4.0,22.0,3.0,0.0,55,'v','s','CR TR'],
  ['badam_milk',       'Badam Milk',                     'Badam Paal | பாதாம் பால் | बादाम दूध','beverage','🟡',165, 7.0,21.0,6.5,0.5,45,'v','bs','CR MR BO TR'],
  ['coffee_filter',    'Filter Coffee (South Indian)',   'Filter Coffee | ஃபில்டர் காபி | फ़िल्टर कॉफ़ी','beverage','☕', 48, 2.2, 6.5,1.8,0.0,40,'v','b','BC CR TR'],
  ['coffee_black',     'Black Coffee (plain)',            'Kari Coffee | கருப்பு காபி | ब्लैक कॉफी','beverage','☕',  2, 0.3, 0.0,0.0,0.0,35,'vg','b','BC AI WL'],
  ['bournvita',        'Bournvita / Malt Drink (with milk)','Bournvita | பவுர்விட்டா',        'beverage','🟤',185, 7.5,28.0,5.5,0.0,55,'v','b','CR VD SE MR'],
  ['horlicks',         'Horlicks / Malted Milk Drink',   'Horlicks | ஹோர்லிக்ஸ்',            'beverage','⬜',175, 7.0,27.5,4.5,0.0,52,'v','b','CR VD SE'],
  ['milo',             'Milo (Nestle Chocolate Malt)',   'Milo | மைலோ',                       'beverage','🟤',185, 6.5,30.0,5.0,0.0,55,'v','b','CR VD SE MR'],
  ['sugarcane_juice2', 'Sugarcane Juice',                'Karumbu Juice | கரும்பு சாறு | गन्ने का रस','beverage','🥤', 73, 0.4,17.5,0.0,0.0,43,'vg','s','IR ED TR'],
  ['nannari_sherbet',  'Nannari Sherbet (Sarsaparilla)', 'Nannari | நன்னாரி | नन्नारी',      'beverage','🟤', 62, 0.2,16.0,0.0,0.0,45,'vg','s','DT GU TR AY'],
  ['panakam',          'Panakam (Jaggery Pepper Drink)', 'Panakam | பானகம்',                  'beverage','🟤', 55, 0.2,14.0,0.0,0.0,40,'vg','s','AI GU IR TR AY FS'],
  ['neera',            'Neera (Fresh Palm Toddy)',        'Neera | நீரா | नीरा',               'beverage','⬜', 21, 0.1, 5.2,0.0,0.0,35,'vg','s','IR GU TR'],
  ['watermelon_juice', 'Watermelon Juice',               'Tarbuz Juice | தர்பூசணி ஜூஸ்',     'beverage','🍉', 30, 0.6, 7.6,0.2,0.4,72,'vg','s','HT LF DT IM'],
  ['orange_juice',     'Orange Juice (fresh)',            'Orange Juice | ஆரஞ்சு ஜூஸ்',       'beverage','🍊', 45, 0.7,10.4,0.2,0.2,50,'vg','b','IM HT LF'],
  ['pomegranate_juice','Pomegranate Juice',              'Anar Juice | மாதுளை ஜூஸ்',          'beverage','🔴', 54, 0.2,13.1,0.3,0.1,30,'vg','s','AI HH IR HT'],
  ['amla_juice',       'Amla Juice',                     'Nellikai Juice | நெல்லி ஜூஸ்',     'beverage','🟢', 28, 0.4, 6.8,0.1,0.8,30,'vg','b','IM IR DT AY TR'],
  ['aloe_vera_juice',  'Aloe Vera Juice',                'Aloe Juice | கற்றாழை ஜூஸ்',        'beverage','💚',  8, 0.1, 1.8,0.0,0.3,15,'vg','b','GU DT AI IM AY'],
  ['coconut_water2',   'Coconut Water',                  'Ilaneer | இளநீர் | नारियल पानी',   'beverage','🥥', 19, 0.7, 3.7,0.2,1.1,54,'vg','s','HT DT GU IM TR'],
  ['ragi_malt2',       'Ragi Malt (Finger Millet Drink)','Ragi Malt | ராகி மால்ட்',           'beverage','🥛',152, 4.5,30.0,1.6,2.8,65,'vg','bs','CR IR MR GF ED TR'],
  ['sattu_drink2',     'Sattu Sherbet',                  'Sattu Drink | சத்துமாவு நீர்',      'beverage','🥤',140, 8.0,23.0,2.5,3.5,40,'vg','s','HP HF ED DF TR'],
  ['banana_lassi',     'Banana Lassi',                   'Vaazhai Lassi | வாழைப்பழ லஸ்ஸி',  'beverage','🍌',165, 5.5,28.0,4.5,1.5,55,'v','bs','PR CR GU MB TR'],
  ['thandai',          'Thandai (Nut Spice Milk)',        'Thandai | தாண்டாய் | ठंडाई',        'beverage','🥛',220, 8.0,28.0,9.5,0.5,50,'v','s','MR CR IM TR FS'],
  ['jal_jeera',        'Jal Jeera',                      'Jal Jeera | ஜல் ஜீரா',              'beverage','🟢', 15, 0.5, 3.0,0.2,0.5,20,'vg','s','GU AI DT IM TR'],
  ['kanji_drink',      'Kanji (Fermented Rice Drink)',   'Kanji | கஞ்சி | कांजी',              'beverage','🥤', 32, 0.5, 7.5,0.1,0.1,30,'vg','b','GU PR GF DT TR'],
  ['rose_sherbet',     'Rose Sherbet',                   'Rose Sherbet | ரோஜா பானம்',         'beverage','🌹', 65, 0.2,16.5,0.0,0.0,55,'vg','s','TR'],
  ['aam_panna',        'Aam Panna (Raw Mango Drink)',    'Aam Panna | ஆம் பன்னா | आम पना',   'beverage','🥭', 40, 0.3, 9.8,0.1,0.5,38,'vg','s','IM DT GU TR'],
  ['sol_kadhi',        'Sol Kadhi (Kokum-Coconut)',      'Sol Kadhi | சோல் கட்ஹி | सोल कढ़ी','beverage','🟣', 35, 1.0, 5.0,1.5,0.5,25,'vg','ld','GU AI DT TR'],
  ['milk_kesar',       'Kesar Milk (Saffron)',           'Kesar Paal | கேசர் பால்',           'beverage','🟡',140, 6.5,18.5,4.5,0.0,40,'v','bs','CR AI BC VD TR FS'],

  // ── KHOA / MILK SOLIDS ───────────────────────────────────────────────────────
  ['khoa_mawa',        'Khoa / Mawa (Milk Solids)',      'Khoa | கோவா | खोया',               'dairy','🟤',421,19.8,27.5,25.0,0.0,30,'v','a','HP CR VD TR'],
  ['rabri',            'Rabri (Reduced Sweetened Milk)', 'Rabri | ரப்ரி | रबड़ी',             'sweet','⬜',200, 7.0,26.5,8.0,0.0,60,'v','s','CR HP TR FS'],
  ['malai',            'Malai (Milk Cream)',              'Aadai | ஆடை | मलाई',               'dairy','💛',195, 3.0, 3.5,20.0,0.0,25,'v','a','CR TR'],

  // ── FERMENTED DAIRY ───────────────────────────────────────────────────────────
  ['idli_batter',      'Idli Batter (fermented)',        'Idli Maavu | இட்லி மாவு',           'fermented','⬜', 60, 2.5,12.0,0.5,0.5,45,'vg','b','PR GU GF TR'],
  ['dosa_batter',      'Dosa Batter (fermented)',        'Dosai Maavu | தோசை மாவு',           'fermented','⬜', 65, 2.8,13.0,0.6,0.5,50,'vg','b','PR GU GF TR'],
  ['kanji_rice_ferm',  'Fermented Rice Water (Kanji)',   'Pazaya Kanji | பழைய கஞ்சி',        'fermented','⬜', 25, 0.8, 5.5,0.1,0.2,30,'vg','b','PR GU GF TR AY'],
]

export default makeFoods(rows)
