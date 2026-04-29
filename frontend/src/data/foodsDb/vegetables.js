import { makeFoods } from './base.js'

const rows = [
  // ── LEAFY GREENS ─────────────────────────────────────────────────────────────
  ['spinach',          'Spinach (Palak)',                'Palak | பாலக் | पालक',          'vegetable','🥬', 23, 2.9, 3.6,0.4,2.2,15,'vg','ld','IR FR AI IM'],
  ['fenugreek_leaves', 'Fenugreek Leaves (Methi)',      'Methi | வெந்தய கீரை | मेथी साग','vegetable','🌿', 49, 4.4, 6.0,0.9,1.1,35,'vg','bld','IR CR FR DF PC TR'],
  ['amaranth_leaves',  'Amaranth Leaves (Chaulai)',     'Chaulai | முளைக்கீரை | चौलाई',  'vegetable','🌿', 23, 2.5, 4.0,0.3,2.2,25,'vg','ld','IR CR IM AI FR'],
  ['drumstick_leaves', 'Drumstick Leaves (Moringa)',    'Murungai Keerai | முருங்கை கீரை | सहजन पत्ती','vegetable','🌿', 64, 9.4, 8.3,1.4,2.0,25,'vg','ld','IR CR HP IM TR AY'],
  ['curry_leaves',     'Curry Leaves (Kadi Patta)',     'Karivepillai | கறிவேப்பிலை | कड़ी पत्ता','vegetable','🌿', 108, 6.1,18.7,1.0,6.4,30,'vg','a','CR IR IM AI TR AY'],
  ['coriander_fresh',  'Fresh Coriander (Dhania)',      'Kothamalli | கொத்தமல்லி | धनिया','vegetable','🌿', 23, 2.1, 3.7,0.5,2.8,30,'vg','a','IM LF CR'],
  ['mint_leaves',      'Mint Leaves (Pudina)',          'Pudina | புதினா | पुदीना',       'vegetable','🌿', 70, 3.8,15.0,0.9,8.0,25,'vg','a','GU IM DT'],
  ['bathua',           'Bathua / Lamb\'s Quarter',      'Bathua | வத்தல் கீரை | बथुआ',   'vegetable','🌿', 43, 4.2, 7.3,0.8,4.0,25,'vg','ld','IR CR IM TR'],
  ['sarson_leaves',    'Mustard Greens (Sarson Saag)', 'Sarson | கடுக்காய் கீரை | सरसों साग','vegetable','🌿', 27, 2.9, 4.7,0.4,3.2,25,'vg','ld','IR CR IM TR HH'],
  ['colocasia_leaves', 'Colocasia Leaves (Arbi Patta)','Seppankizhangu Ilai | தாரோ இலை | अरबी पत्ता','vegetable','🌿', 31, 2.3, 5.6,0.5,1.0,30,'vg','ld','IR CR TR'],
  ['drumstick_leaf_powder','Moringa Powder',            'Murungai Podi | முருங்கை தூள்',  'vegetable','💚',268,27.1,38.2,6.0,19.2,25,'vg','a','IR CR HP MR ZR IM AY TR'],
  ['agathi_keerai',    'Agathi Greens (Hummingbird)',  'Agathi | அகத்தி கீரை',           'vegetable','🌿', 59, 8.4,10.5,1.4,1.1,30,'vg','ld','HP IR CR TR AY'],
  ['ponnanganai',      'Dwarf Copperleaf (Ponnanganni)','Ponnanganni | பொன்னாங்காணி',    'vegetable','🌿', 30, 3.2, 4.5,0.5,1.5,25,'vg','ld','IR CR IM TR AY'],
  ['mukunuwenna',      'Water Spinach (Kangkung)',      'Kangkung | கண்கொங்கு',          'vegetable','🌿', 19, 2.6, 3.1,0.2,2.1,20,'vg','ld','IR IM LF'],
  ['taro_leaves',      'Taro Leaves (Colocasia)',       'Chembu Ilai | கேழ்வரகு இலை',   'vegetable','🌿', 31, 2.3, 5.6,0.5,1.0,30,'vg','ld','CR IR TR'],
  ['radish_leaves',    'Radish Leaves (Moolangi Keerai)','Moolangi Keerai | முள்ளங்கி கீரை','vegetable','🌿', 31, 2.3, 5.6,0.5,1.0,25,'vg','ld','IR CR DT'],
  ['drumstick_flowers','Drumstick Flowers',            'Murungai Poo | முருங்கை பூ',     'vegetable','🌸', 44, 5.9, 7.0,0.9,0.9,25,'vg','a','IR HP IM TR AY'],
  ['banana_stem',      'Banana Stem (Vazhai Thandu)', 'Vazhai Thandu | வாழைத்தண்டு | केले का तना','vegetable','⚪', 27, 1.0, 6.1,0.3,6.7,30,'vg','ld','HF WL GU TR IR'],
  ['moringa_pods',     'Drumstick Pods (Murungakkai)','Murungakkai | முருங்கைக்காய் | सहजन की फली','vegetable','💚', 37, 2.1, 8.5,0.1,3.2,35,'vg','ld','IM CR AI TR'],
  ['lotus_stem',       'Lotus Stem (Kamal Kakdi)',     'Kamal Kakdi | தாமரை தண்டு | कमल ककड़ी','vegetable','🪷', 74, 2.6,17.2,0.1,4.9,45,'vg','ld','IR FR IM'],
  ['lettuce',          'Lettuce',                       'Lettuce | கீரை | लेट्यूस',       'vegetable','🥬', 15, 1.4, 2.9,0.2,1.3,10,'vg','s','LF LS WL LG'],
  ['spinach_water',    'Water Spinach (Ipomoea)',       'Kalmi Saag | வெற்றிலை கீரை',   'vegetable','🌿', 19, 2.6, 3.1,0.2,2.1,20,'vg','ld','IR IM LF'],
  ['kale',             'Kale',                          'Kale | கேல்',                   'vegetable','🥬', 49, 4.3, 8.8,0.9,3.6,15,'vg','ld','IR CR AI BO BC'],
  ['swiss_chard',      'Swiss Chard',                   'Swiss Chard | சவீஸ் சார்ட்',   'vegetable','🥬', 19, 1.8, 3.7,0.2,1.6,20,'vg','ld','IR MR BO'],
  ['bok_choy',         'Bok Choy / Pak Choy',           'Pak Choy | பாக் சாய்',          'vegetable','🥬', 13, 1.5, 2.2,0.2,1.0,25,'vg','ld','CR IM LF'],

  // ── ROOT VEGETABLES ──────────────────────────────────────────────────────────
  ['carrot',           'Carrot (Gajar)',                 'Gajar | கேரட் | गाजर',          'vegetable','🥕', 41, 0.9, 9.6,0.2,2.8,47,'vg','a','VD IM LG WL'],
  ['carrot_red',       'Red Carrot (Desi Gajar)',        'Desi Gajar | சிவப்பு கேரட்',   'vegetable','🥕', 43, 1.0,10.0,0.2,2.9,47,'vg','a','VD IM LG'],
  ['beetroot',         'Beetroot (Chukandar)',           'Chukandar | பீட்ரூட் | चुकंदर', 'vegetable','🔴', 43, 1.6, 9.6,0.2,2.8,64,'vg','a','FR IR HH AI PC'],
  ['radish_white',     'White Radish / Daikon (Mooli)', 'Mooli | முள்ளங்கி | मूली',      'vegetable','⚪', 16, 0.6, 3.4,0.1,1.6,15,'vg','a','LG WL DT GU'],
  ['radish_red',       'Red Radish',                    'Lal Mooli | சிவப்பு முள்ளங்கி','vegetable','🔴', 16, 0.7, 3.4,0.1,1.6,15,'vg','s','LG WL DT'],
  ['turnip',           'Turnip (Shalgam)',               'Shalgam | திணை | शलजम',         'vegetable','⚪', 28, 0.9, 6.4,0.1,1.8,62,'vg','ld','IM LG WL DT'],
  ['sweet_potato',     'Sweet Potato (Shakarkandi)',     'Shakarkandi | சர்க்கரை வள்ளி | शकरकंद','vegetable','🍠', 86, 1.6,20.1,0.1,3.0,63,'vg','ld','VD MR GU HH'],
  ['sweet_potato_purple','Purple Sweet Potato',         'Violet Shakarkandi | ஊதா சர்க்கரை வள்ளி','vegetable','🟣', 83, 1.6,19.0,0.1,3.3,55,'vg','ld','AI MR GU'],
  ['yam',              'Yam (Suran / Elephant Yam)',    'Suran | சேனைக்கிழங்கு | सूरन',  'vegetable','🟤',118, 1.5,27.0,0.1,4.2,51,'vg','ld','HF GU DF TR'],
  ['taro_root',        'Taro Root (Arbi / Colocasia)',  'Chembu | சேப்பங்கிழங்கு | अरबी','vegetable','🥔',112, 1.5,26.5,0.2,4.1,55,'vg','ld','HF GU IM'],
  ['cassava',          'Cassava / Tapioca (Kappa)',     'Kappa | மரவள்ளிக்கிழங்கு | कसावा','vegetable','⚪',160, 1.4,38.1,0.3,1.8,55,'vg','ld','GF TR ED'],
  ['lotus_root',       'Lotus Root (Bhen / Kamal Kakdi)','Bhen | தாமரைக்கிழங்கு | कमल जड़','vegetable','🪷', 74, 2.6,17.2,0.1,4.9,45,'vg','ld','HF IR FR IM'],
  ['ginger_fresh',     'Fresh Ginger (Adrak)',          'Inji | இஞ்சி | अदरक',            'spice','🌿', 80, 1.8,17.8,0.8,2.0,15,'vg','a','AI GU IM AY TR'],
  ['turmeric_fresh',   'Fresh Turmeric (Kacchi Haldi)','Manjal | மஞ்சள் | कच्ची हल्दी', 'spice','🟡', 79, 1.4,14.7,4.1,4.2,25,'vg','a','AI IM AY TR'],
  ['galangal',         'Galangal (Greater)',             'Galangal | கஞ்சி | अदरक परिवार', 'spice','🟡', 85, 1.5,17.5,0.8,2.1,30,'vg','a','AI GU TR'],
  ['potato',           'Potato (Aalu)',                  'Aalu | உருளைக்கிழங்கு | आलू',   'vegetable','🥔', 77, 2.0,17.5,0.1,2.2,78,'vg','ld','MB VD'],
  ['purple_potato',    'Purple Potato',                  'Purple Aalu | ஊதா உருளை',       'vegetable','🟣', 77, 2.1,17.0,0.1,2.4,75,'vg','ld','AI'],
  ['baby_potato',      'Baby Potato',                    'Chote Aalu | சிறிய உருளை',      'vegetable','🥔', 74, 2.0,17.0,0.1,2.1,78,'vg','ld',''],
  ['parsnip',          'Parsnip',                        'Parsnip | பார்ஸ்னிப்',          'vegetable','⚪', 75, 1.3,18.0,0.3,4.9,52,'vg','ld','HF GU'],
  ['Jerusalem_artichoke','Jerusalem Artichoke',          'Jerusalem Artichoke | மண்கிழங்கு','vegetable','🟤', 73, 2.0,17.4,0.0,1.6,50,'vg','ld','GU PR'],

  // ── GOURDS & CUCURBITS ────────────────────────────────────────────────────────
  ['bitter_gourd',     'Bitter Gourd (Karela)',          'Pavakkai | பாவக்காய் | करेला',  'vegetable','🥒', 17, 1.0, 3.7,0.2,2.8,20,'vg','ld','DF LG AI DT TR AY'],
  ['bottle_gourd',     'Bottle Gourd (Lauki / Dudhi)',  'Sorakkai | சுரைக்காய் | लौकी',   'vegetable','💚', 14, 0.6, 3.4,0.1,0.5,15,'vg','ld','WL HT LG DF AY'],
  ['ridge_gourd',      'Ridge Gourd (Turai / Peerkangai)','Peerkangai | பீர்க்கங்காய் | तोरई','vegetable','💚', 17, 0.5, 4.0,0.1,0.4,15,'vg','ld','LF LG WL'],
  ['snake_gourd',      'Snake Gourd (Pudalangai)',       'Pudalangai | புடலங்காய் | चिचिंडा','vegetable','💚', 18, 0.5, 4.2,0.1,0.6,20,'vg','ld','LF LG WL'],
  ['pointed_gourd',    'Pointed Gourd (Parwal / Potol)','Parwal | பட்டல் | परवल',        'vegetable','💚', 20, 1.0, 4.4,0.3,3.0,20,'vg','ld','LF LG DF TR'],
  ['ivy_gourd',        'Ivy Gourd (Tendli / Kovakkai)', 'Kovakkai | கோவக்காய் | कुंदरू', 'vegetable','🟢', 19, 0.7, 4.4,0.1,1.6,30,'vg','ld','DF LG WL TR'],
  ['pumpkin',          'Pumpkin (Kaddu)',                 'Poosanikkai | பூசணிக்காய் | कद्दू','vegetable','🎃', 26, 1.0, 6.5,0.1,0.5,75,'vg','ld','VD LF WL'],
  ['zucchini',         'Zucchini / Courgette',           'Courgette | சுரைக்காய் வகை',   'vegetable','💚', 17, 1.2, 3.1,0.3,1.0,15,'vg','ld','LF LG WL'],
  ['ash_gourd',        'Ash Gourd / Winter Melon (Petha)','Poosanikkai | வெண்பூசணி | पेठा','vegetable','💚', 13, 0.4, 3.0,0.2,2.9,35,'vg','ld','LF WL DT AY'],
  ['tinda_round',      'Round Gourd (Tinda)',            'Tinda | திண்டை | टिंडा',        'vegetable','🟢', 21, 1.0, 4.6,0.2,1.5,35,'vg','ld','LF LS WL'],
  ['bitter_melon',     'Bitter Melon (Long Variety)',   'Bitter Melon | கொடிகாரை',       'vegetable','🥒', 17, 1.0, 3.7,0.2,2.8,20,'vg','ld','DF AI TR'],
  ['wild_bitter_gourd','Wild Bitter Gourd (Siru Pavakkai)','Siru Pavakkai | சிறு பாகற்காய்','vegetable','🥒', 20, 1.2, 4.0,0.3,3.2,18,'vg','ld','DF AI TR AY'],

  // ── CRUCIFEROUS ──────────────────────────────────────────────────────────────
  ['cabbage',          'Cabbage (Patta Gobhi)',           'Muttaikose | முட்டைகோஸ் | पत्ता गोभी','vegetable','🥬', 25, 1.3, 5.8,0.1,2.5,10,'vg','ld','IM LF WL GU'],
  ['cauliflower',      'Cauliflower (Phool Gobhi)',       'Cauliflower | காலிஃப்ளவர் | फूलगोभी','vegetable','⚪', 25, 1.9, 5.0,0.3,2.0,10,'vg','ld','IM LF WL GU'],
  ['broccoli',         'Broccoli',                        'Broccoli | ப்ரோக்கோலி | ब्रोकली','vegetable','🥦', 34, 2.8, 6.6,0.4,2.6,10,'vg','ld','IM CR AI WL FR'],
  ['kohlrabi',         'Kohlrabi (Ganth Gobhi)',          'Ganth Gobhi | கொல்ராபி | गांठ गोभी','vegetable','💚', 27, 1.7, 6.2,0.1,3.6,15,'vg','ld','LG WL IM'],
  ['brussels_sprouts', 'Brussels Sprouts',                'Brussels Sprouts | ப்ரஸ்ஸல்ஸ்','vegetable','🥦', 43, 3.4, 8.9,0.3,3.8,10,'vg','ld','IM CR AI FR'],
  ['purple_cabbage',   'Purple / Red Cabbage',            'Lal Patta Gobhi | ஊதா முட்டைகோஸ்','vegetable','🟣', 31, 1.4, 7.4,0.2,2.1,10,'vg','ld','AI IM LF'],
  ['cabbage_chinese',  'Chinese Cabbage (Napa)',          'Napa Cabbage | சீன முட்டைகோஸ்','vegetable','🥬', 16, 1.2, 2.9,0.2,1.2,12,'vg','ld','LF LG'],

  // ── ALLIUMS ──────────────────────────────────────────────────────────────────
  ['onion',            'Onion (Pyaaz)',                   'Vengayam | வெங்காயம் | प्याज', 'vegetable','🧅', 40, 1.1, 9.3,0.1,1.7,10,'vg','ld','AI HH HT GU'],
  ['onion_red',        'Red Onion (Lal Pyaaz)',          'Lal Vengayam | சிவப்பு வெங்காயம்','vegetable','🧅', 40, 1.1, 9.3,0.1,1.7,10,'vg','ld','AI HH'],
  ['shallots',         'Shallots (Sambar Onion / Chinna Vengayam)','Chinna Vengayam | சின்ன வெங்காயம் | छोटा प्याज','vegetable','🧅', 72, 2.5,16.8,0.1,3.2,15,'vg','ld','AI HH IR TR'],
  ['spring_onion',     'Spring Onion / Scallion',        'Hara Pyaaz | வெங்காய நாற்று | हरा प्याज','vegetable','🌱', 32, 1.8, 7.3,0.2,2.6,15,'vg','ld','IM AI LF'],
  ['garlic',           'Garlic (Lehsun)',                 'Poondu | பூண்டு | लहसुन',       'spice','🧄', 149, 6.4,33.1,0.5,2.1,30,'vg','a','AI HH IM HT AY'],
  ['garlic_black',     'Black Garlic',                    'Black Garlic | கருப்பு பூண்டு', 'spice','⚫', 116, 5.7,25.1,0.3,1.3,25,'vg','a','AI HH BC'],
  ['leek',             'Leek (Leek)',                     'Leek | லீக்',                   'vegetable','🥬', 61, 1.5,14.2,0.3,1.8,15,'vg','ld','CR FR LG'],
  ['chive',            'Chives',                          'Chives | சைவ்',                  'vegetable','🌿', 30, 3.3, 4.4,0.7,2.5,15,'vg','a','VD CR IM'],

  // ── NIGHTSHADES ──────────────────────────────────────────────────────────────
  ['tomato',           'Tomato',                          'Thakkali | தக்காளி | टमाटर',   'vegetable','🍅', 18, 0.9, 3.9,0.2,1.2,30,'vg','a','IM AI LG LF HH'],
  ['tomato_cherry',    'Cherry Tomato',                   'Cherry Thakkali | செர்ரி தக்காளி','vegetable','🍒', 18, 0.9, 3.9,0.2,1.2,30,'vg','s','IM LG LF'],
  ['eggplant_brinjal', 'Eggplant / Brinjal (Baingan)',   'Kathirikkai | கத்தரிக்காய் | बैंगन','vegetable','🍆', 25, 1.0, 5.9,0.2,3.0,15,'vg','ld','AI HH GU WL'],
  ['eggplant_small',   'Small Indian Brinjal',            'Chinna Kathirikkai | சிறிய கத்தரி','vegetable','🍆', 24, 1.0, 5.7,0.2,3.0,15,'vg','ld','AI GU WL TR'],
  ['eggplant_white',   'White Eggplant',                  'Vellai Kathirikkai | வெள்ளை கத்தரி','vegetable','⚪', 25, 1.0, 5.9,0.2,3.0,15,'vg','ld','GU WL'],
  ['green_chilli',     'Green Chilli (Hari Mirch)',       'Pacha Milagai | பச்சை மிளகாய் | हरी मिर्च','spice','🌶️', 40, 2.0, 9.5,0.2,1.5,25,'vg','a','IM AI MR'],
  ['red_chilli_fresh', 'Fresh Red Chilli',               'Milagai | சிவப்பு மிளகாய்',    'spice','🌶️', 31, 1.5, 7.3,0.4,1.5,30,'vg','a','IM AI'],
  ['capsicum_green',   'Green Capsicum / Bell Pepper',   'Kudai Milagai | கப்சிக்கம் | शिमला मिर्च','vegetable','🫑', 31, 1.0, 7.1,0.3,2.1,15,'vg','ld','IM LF LG'],
  ['capsicum_red',     'Red Bell Pepper',                 'Red Kudai Milagai | சிவப்பு கப்சிக்கம்','vegetable','🔴', 31, 1.0, 6.0,0.3,2.1,15,'vg','ld','IM VD LG'],
  ['capsicum_yellow',  'Yellow Bell Pepper',             'Yellow Kudai Milagai | மஞ்சள் கப்சிக்கம்','vegetable','🟡', 27, 1.0, 6.3,0.2,0.9,15,'vg','ld','IM LG'],

  // ── BEANS / PODS ─────────────────────────────────────────────────────────────
  ['french_beans',     'French Beans (Haricot)',         'Fransi Karamani | பீன்ஸ் | फ्रेंच बीन्स','vegetable','🫘', 31, 1.8, 7.0,0.2,2.7,32,'vg','ld','LF LG GU HF'],
  ['cluster_beans',    'Cluster Beans (Guar / Gawar)',   'Kothavarangai | கொத்தவரங்காய் | ग्वार फली','vegetable','🫘', 16, 1.2, 3.2,0.4,1.3,30,'vg','ld','DF LG TR'],
  ['flat_beans',       'Flat Beans (Papdi)',             'Avarakkai | அவரக்காய் | पापड़ी',  'vegetable','🫘', 36, 2.8, 6.5,0.2,3.0,20,'vg','ld','HP LG TR'],
  ['long_beans',       'Long Beans (Chawli / Karamani)', 'Karamani | காராமணி | लोबिया बीन','vegetable','🫘', 47, 2.8,10.0,0.2,3.2,40,'vg','ld','HP HF LG'],
  ['runner_beans',     'Runner Beans',                   'Runner Beans | ரன்னர் பீன்ஸ்', 'vegetable','🫘', 35, 2.0, 7.0,0.2,2.9,35,'vg','ld','LF LG'],
  ['peas_green',       'Green Peas (Matar)',              'Pattani | பட்டாணி | मटर',       'vegetable','🫛', 81, 5.4,14.5,0.4,5.1,48,'vg','ld','HP HF FR DF'],
  ['peas_snow',        'Snow Peas / Mangetout',          'Snow Peas | உறைந்த பட்டாணி',   'vegetable','🫛', 42, 2.8, 7.6,0.2,2.6,40,'vg','ld','IM LF LG'],
  ['edamame',          'Edamame (Green Soybean)',         'Edamame | பச்சை சோயா',          'vegetable','🫛',121, 11.9,8.9,5.2,5.2,30,'vg','s','HP GU HH'],
  ['winged_beans',     'Winged Beans (Goa Bean)',         'Goa Bean | கோவா பீன்ஸ்',       'vegetable','🫘', 49, 4.0, 5.6,2.3,4.3,30,'vg','ld','HP HF TR'],

  // ── ROOT VEGETABLES (MORE) ────────────────────────────────────────────────────
  ['raw_jackfruit2',   'Raw Jackfruit (Kathal)',          'Kachha Kathal | பச்சை பலா | कच्चा कटहल','vegetable','💚', 51, 2.0,11.4,0.2,1.5,40,'vg','ld','GF HF TR'],
  ['raw_mango_veg',    'Raw Mango (Kairi) — Vegetable',  'Maangai | மாங்காய் | कच्चा आम','vegetable','🥭', 60, 0.7,14.8,0.1,1.6,41,'vg','ld','IM LG DT TR'],
  ['raw_papaya_veg',   'Raw Papaya (Green)',              'Kachha Papita | பச்சை பப்பாளி | कच्चा पपीता','vegetable','🍈', 32, 0.5, 7.6,0.1,0.9,35,'vg','ld','GU LG DT'],
  ['raw_banana_veg',   'Raw Banana / Valakkai',           'Valakkai | வாழைக்காய் | कच्चा केला','vegetable','🍌', 89, 1.3,22.8,0.4,2.6,40,'vg','ld','GU HF DF LG TR'],
  ['plantain',         'Plantain (Nendran Raw)',          'Nendran Kaai | நேந்திர காய்',   'vegetable','🍌', 96, 1.3,25.0,0.2,2.3,42,'vg','ld','GF TR ED'],

  // ── MUSHROOMS ────────────────────────────────────────────────────────────────
  ['mushroom_button',  'Button Mushroom (White)',        'Khumb | காளான் | मशरूम',        'vegetable','🍄', 22, 3.1, 3.3,0.3,1.0,15,'vg','ld','B12 VD HP SE'],
  ['mushroom_oyster',  'Oyster Mushroom',                'Oyster Khumb | சிப்பி காளான்',  'vegetable','🍄', 33, 3.3, 6.1,0.4,2.3,15,'vg','ld','B12 VD HP'],
  ['mushroom_shiitake','Shiitake Mushroom',              'Shiitake | ஷீட்டாக்கே',          'vegetable','🍄', 34, 2.2, 6.8,0.5,2.5,15,'vg','ld','B12 VD AI BC'],
  ['mushroom_portobello','Portobello Mushroom',          'Portobello Khumb | போர்டோபெல்ல','vegetable','🍄', 22, 2.1, 3.9,0.3,1.3,15,'vg','ld','B12 VD SE'],
  ['mushroom_reishi',  'Reishi Mushroom (Lingzhi)',      'Reishi | ரீஷி காளான்',          'vegetable','🍄', 40, 3.5, 7.0,0.4,2.5,10,'vg','a','AI BC IM AY'],
  ['mushroom_milky',   'Milky Mushroom (Doodh Khumb)',  'Doodh Khumb | பால் காளான்',     'vegetable','🍄', 28, 3.0, 4.0,0.4,1.5,10,'vg','ld','B12 VD TR'],

  // ── UNUSUAL VEGETABLES ───────────────────────────────────────────────────────
  ['artichoke',        'Globe Artichoke',                'Artichoke | ஆர்டிச்சோக்',       'vegetable','🌿', 47, 3.3,11.4,0.2,5.4,15,'vg','ld','HF FR GU LG'],
  ['asparagus',        'Asparagus',                      'Asparagus | அஸ்பரகஸ்',          'vegetable','🌿', 20, 2.2, 3.9,0.1,2.1,15,'vg','ld','FR LF LG GU'],
  ['celery',           'Celery',                         'Celery | செலரி | अजवाइन (पत्ते)','vegetable','🌿', 16, 0.7, 3.0,0.2,1.6,35,'vg','a','HT LS WL DT'],
  ['fennel_bulb',      'Fennel Bulb',                    'Saunf Vegetable | சோம்பு கிழங்கு','vegetable','⚪', 31, 1.2, 7.3,0.2,3.1,15,'vg','ld','GU HH LG'],
  ['okra',             'Okra / Ladies Finger (Bhindi)',  'Vendakkai | வெண்டைக்காய் | भिंडी','vegetable','💚', 33, 2.0, 7.5,0.2,3.2,20,'vg','ld','GU HF DF CR LG TR'],
  ['eggplant_thai',    'Thai Eggplant / Solanum',        'Sundakkai | சுண்டைக்காய்',      'vegetable','🟢', 44, 2.5, 9.2,0.3,3.5,20,'vg','ld','GU TR AY'],
  ['drumstick_sambar', 'Drumstick (Sahjan / Murungakkai)','Murungakkai | முருங்கைக்காய் | सहजन','vegetable','💚', 37, 2.1, 8.5,0.1,3.2,35,'vg','ld','IM CR AI TR AY'],
  ['raw_turmeric',     'Fresh Turmeric Root',            'Pacha Manjal | பச்சை மஞ்சள்',  'spice','🟡', 79, 1.4,14.7,4.1,4.2,25,'vg','a','AI IM AY TR'],

  // ── MORE COMMON VEGETABLES ────────────────────────────────────────────────────
  ['corn',             'Sweet Corn (Bhutta)',             'Makka Cholam | சோளம் | मक्का',  'vegetable','🌽', 86, 3.2,19.0,1.2,2.7,52,'vg','s','GU SE MB'],
  ['corn_baby',        'Baby Corn',                      'Baby Corn | குட்டி சோளம்',       'vegetable','🌽', 26, 2.5, 5.4,0.2,2.5,30,'vg','ld','LG LF'],
  ['cucumber',         'Cucumber (Vellarikkai)',          'Vellarikkai | வெள்ளரிக்காய் | खीरा','vegetable','🥒', 15, 0.6, 3.6,0.1,0.5,15,'vg','s','HT LF LG WL DT'],
  ['cucumber_kheera',  'Indian Kheera Cucumber',         'Kheera | கீரா வெள்ளரி',         'vegetable','🥒', 15, 0.7, 3.4,0.1,0.5,15,'vg','s','HT LF DT'],
  ['pumpkin_white',    'White Pumpkin / Ash Gourd',      'Kumbalanga | குழைக்கா',          'vegetable','⚪', 13, 0.4, 3.0,0.2,2.9,35,'vg','ld','WL DT AY'],
  ['kabocha',          'Kabocha / Japanese Pumpkin',     'Japanese Kaddu | ஜப்பான் காடு', 'vegetable','🎃', 34, 1.0, 7.5,0.1,1.2,65,'vg','ld','VD LF WL'],

  // ── PRESERVED / PICKLED VEGETABLES ───────────────────────────────────────────
  ['brinjal_curry',    'Brinjal Curry Preparation',      'Kathirikkai Curry | கத்தரிக்காய் குழம்பு','dish','🍆', 65, 2.0, 9.0,2.5,3.0,30,'vg','ld','AI GU TR'],
  ['mixed_veg',        'Mixed Indian Vegetables',         'Mixed Veg | கலந்த காய்கறி',     'vegetable','🥗', 30, 1.5, 6.5,0.3,2.5,30,'vg','ld','IM LG WL'],

  // ── SPROUTS ──────────────────────────────────────────────────────────────────
  ['moong_sprouts',    'Sprouted Moong / Mung Bean',    'Mulaikattiya Payiru | முளைகட்டிய பாசி | अंकुरित मूंग','vegetable','🌱', 30, 3.0, 5.5,0.2,1.8,25,'vg','s','HP FR LG IM PR GF'],
  ['fenugreek_sprouts','Sprouted Fenugreek (Methi)',     'Mulaikattiya Vendhayam | முளைகட்டிய வெந்தயம்','vegetable','🌱', 49, 4.4, 6.0,0.9,2.8,25,'vg','s','HP IR DF PR'],
  ['wheat_grass',      'Wheatgrass',                     'Gehun ka Ras | கோதுமை புல்',    'vegetable','🌿', 45, 3.5, 8.0,0.5,3.0,20,'vg','s','IR CR AI DT TR'],
  ['bean_sprouts',     'Bean Sprouts (Mixed)',           'Mulaikattiya Payiru | பீன் ஸ்ப்ரவுட்ஸ்','vegetable','🌱', 30, 3.1, 5.5,0.2,1.8,25,'vg','s','HP LG IM PR'],
  ['alfalfa_sprouts',  'Alfalfa Sprouts',                'Alfalfa | அல்ஃபால்ஃபா',         'vegetable','🌱', 23, 4.0, 2.1,0.7,1.9,10,'vg','s','CR VD IM LG'],
]

export default makeFoods(rows)
