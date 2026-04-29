import { makeFoods } from './base.js'

const rows = [
  // ── EGGS ─────────────────────────────────────────────────────────────────────
  ['egg_whole',        'Whole Egg (raw)',              'Anda | முட்டை | अंडा',                 'egg','🥚',143, 12.6, 0.7,9.5,0.0,0,'nv','bld','HP B12 VD ZR CR SE MR'],
  ['egg_boiled',       'Boiled Egg (whole)',           'Ubla Anda | வேகவைத்த முட்டை',         'egg','🥚',155, 12.6, 1.1,10.6,0.0,0,'nv','bld','HP B12 VD ZR CR SE'],
  ['egg_white',        'Egg White (raw)',              'Anda Safed | முட்டை வெள்ளை | अंडे का सफेद','egg','⬜', 52, 10.9, 0.7,0.2,0.0,0,'nv','bld','HP LF LG MR'],
  ['egg_yolk',         'Egg Yolk',                    'Anda Zardhi | முட்டை மஞ்சள்',         'egg','🟡',322, 15.9, 3.6,26.5,0.0,0,'nv','bld','VD B12 CR ZR SE HP'],
  ['egg_fried',        'Fried Egg (sunny side up)',   'Tala Anda | வறுத்த முட்டை',           'egg','🍳',196, 13.6, 0.8,15.0,0.0,0,'nv','bld','HP B12 VD'],
  ['egg_scrambled',    'Scrambled Eggs',              'Bhurji Anda | முட்டை பர்ஜி | भुर्जी', 'egg','🍳',173, 10.6, 2.2,13.0,0.0,0,'nv','bld','HP B12 VD'],
  ['egg_omelette',     'Plain Omelette',              'Omelette | ஆம்லட் | ऑमलेट',           'egg','🍳',154, 11.2, 0.8,11.8,0.0,0,'nv','bld','HP B12'],
  ['egg_masala',       'Egg Bhurji (Masala)',         'Masala Anda Bhurji | மசாலா முட்டை',  'dish','🍳',187, 12.0, 5.0,13.0,1.0,0,'nv','bld','HP B12'],
  ['egg_curry',        'Egg Curry',                   'Anda Curry | முட்டை கறி | अंडा करी', 'dish','🍛',165, 10.5, 8.5,10.0,1.5,45,'nv','ld','HP B12'],
  ['duck_egg',         'Duck Egg',                    'Batakh Ka Anda | வாத்து முட்டை',      'egg','🥚',185, 12.8, 1.5,13.8,0.0,0,'nv','bld','HP B12 ZR CR'],
  ['quail_egg',        'Quail Eggs',                  'Bater Ka Anda | காடை முட்டை',         'egg','🥚',158, 13.1, 0.4,11.1,0.0,0,'nv','bld','HP B12 VD ZR'],

  // ── CHICKEN ──────────────────────────────────────────────────────────────────
  ['chicken_breast',   'Chicken Breast (raw)',        'Murgi Ka Seena | சிக்கன் ப்ரெஸ்ட்',  'meat','🍗',165, 31.0, 0.0, 3.6,0.0,0,'nv','ld','HP LF B12 ZR SE MR'],
  ['chicken_thigh',    'Chicken Thigh (raw)',         'Murgi Ki Jangha | சிக்கன் தொடை',     'meat','🍗',209, 26.0, 0.0,11.0,0.0,0,'nv','ld','HP B12 ZR SE'],
  ['chicken_leg',      'Chicken Leg (drumstick)',     'Murgi Ka Tanga | சிக்கன் கால்',      'meat','🍗',172, 28.3, 0.0, 5.7,0.0,0,'nv','ld','HP B12 ZR'],
  ['chicken_whole',    'Whole Chicken',               'Poora Murgi | முழு கோழி',             'meat','🍗',215, 18.0, 0.0,15.0,0.0,0,'nv','ld','HP B12 ZR'],
  ['chicken_wings',    'Chicken Wings',               'Murgi Ke Pankh | சிக்கன் இறக்கை',   'meat','🍗',203, 18.0, 0.0,13.6,0.0,0,'nv','ld','HP B12 ZR'],
  ['chicken_mince',    'Chicken Mince (Keema)',       'Murgi Ka Keema | சிக்கன் கீமா',      'meat','🍗',172, 20.0, 0.0, 9.0,0.0,0,'nv','ld','HP B12 ZR'],
  ['chicken_liver',    'Chicken Liver',               'Murgi Ka Kaleji | கோழி கல்லீரல்',   'meat','🟤',172, 26.5, 0.9, 6.0,0.0,0,'nv','ld','HP IR B12 VD ZR'],
  ['chicken_tandoori', 'Tandoori Chicken',            'Tandoori Murgi | தந்தூரி சிக்கன்',   'dish','🍗',150, 25.6, 3.8, 3.9,0.5,0,'nv','ld','HP B12 ZR'],
  ['chicken_tikka',    'Chicken Tikka',               'Murgi Tikka | சிக்கன் திக்கா',       'dish','🍗',163, 25.0, 4.0, 5.0,0.5,0,'nv','ld','HP B12'],
  ['chicken_tikka_masala','Chicken Tikka Masala',     'Murgi Tikka Masala | திக்கா மசாலா', 'dish','🍛',183, 20.0,10.0, 7.5,1.5,45,'nv','ld','HP B12'],
  ['butter_chicken',   'Butter Chicken (Murgh Makhani)','Murgh Makhani | மக்கன் கோழி | मुर्ग मक्खनी','dish','🍛',230, 18.0, 9.0,14.0,1.2,45,'nv','ld','HP B12'],
  ['chicken_biryani',  'Chicken Biryani',             'Murgi Biryani | சிக்கன் பிரியாணி',   'dish','🍛',290, 14.5,35.5, 8.5,1.5,65,'nv','ld','HP B12'],
  ['chicken_curry',    'Chicken Curry',               'Murgi Curry | சிக்கன் கறி | मुर्ग करी','dish','🍛',175, 18.5, 7.0, 8.0,1.5,45,'nv','ld','HP B12'],
  ['chicken_65',       'Chicken 65',                  'Chicken 65 | சிக்கன் 65',             'dish','🍗',210, 22.0, 8.0,10.0,0.5,40,'nv','ld','HP B12'],
  ['chicken_korma',    'Chicken Korma',               'Murgi Korma | சிக்கன் கொர்மா',       'dish','🍛',280, 18.0, 8.0,19.0,1.0,45,'nv','ld','HP B12'],
  ['chettinad_chicken','Chettinad Chicken Curry',     'Chettinad Murgi | செட்டிநாடு சிக்கன்','dish','🍛',190, 19.5, 7.5, 9.5,2.0,45,'nv','ld','HP B12 AI'],
  ['chicken_soup',     'Chicken Soup / Clear Broth',  'Murgi Ka Shorba | சிக்கன் சூப்',     'dish','🍲', 37,  5.0, 2.0, 1.0,0.5,20,'nv','ld','HP B12 LF'],
  ['chicken_keema',    'Chicken Keema Curry',         'Murgi Keema | சிக்கன் கீமா',         'dish','🍛',225, 21.0, 7.5,12.0,1.5,35,'nv','ld','HP B12'],
  ['fried_chicken',    'Fried Chicken',               'Tali Murgi | வறுத்த சிக்கன்',        'dish','🍗',294, 26.0, 8.0,17.0,0.5,50,'nv','ld','HP B12'],

  // ── MUTTON / GOAT / LAMB ─────────────────────────────────────────────────────
  ['mutton_raw',       'Mutton / Goat Meat (raw)',    'Bakra Gosht | ஆட்டு இறைச்சி | बकरे का मांस','meat','🥩',122, 20.6, 0.0, 3.9,0.0,0,'nv','ld','HP IR B12 ZR SE'],
  ['mutton_leg',       'Mutton Leg',                  'Raan | ஆட்டு கால் | राँ',             'meat','🥩',135, 21.0, 0.0, 5.0,0.0,0,'nv','ld','HP B12 ZR'],
  ['mutton_chops',     'Mutton Chops',                'Mutton Chops | ஆட்டு சாப்ஸ்',        'meat','🥩',242, 25.4, 0.0,14.8,0.0,0,'nv','ld','HP B12 ZR'],
  ['mutton_keema',     'Mutton Keema (Minced)',       'Gosht Ka Keema | ஆட்டு கீமா',        'meat','🥩',290, 22.0, 0.0,22.0,0.0,0,'nv','ld','HP B12 ZR IR'],
  ['mutton_liver',     'Mutton Liver (Kaleji)',       'Gosht Ka Kaleji | ஆட்டு கல்லீரல்', 'meat','🟤',165, 26.5, 3.9, 4.9,0.0,0,'nv','ld','HP IR B12 VD ZR'],
  ['mutton_curry',     'Mutton Curry',                'Gosht Curry | ஆட்டு கறி | गोश्त करी','dish','🍛',225, 20.0, 7.0,13.5,1.5,45,'nv','ld','HP B12 IR'],
  ['mutton_biryani',   'Mutton Biryani',              'Gosht Biryani | ஆட்டு பிரியாணி | बिरयानी','dish','🍛',310, 14.0,37.5,10.0,1.5,65,'nv','ld','HP B12'],
  ['mutton_rogan_josh','Mutton Rogan Josh',           'Rogan Josh | ரோகன் ஜோஷ் | रोगन जोश','dish','🍛',250, 21.0, 8.5,15.5,1.5,45,'nv','ld','HP B12'],
  ['mutton_korma',     'Mutton Korma',                'Gosht Korma | ஆட்டு கொர்மா',         'dish','🍛',310, 20.0, 7.5,21.5,1.0,45,'nv','ld','HP B12'],
  ['mutton_nihari',    'Nihari (Mutton)',              'Nihari | நிஹாரி | निहारी',            'dish','🍲',265, 20.5, 9.5,15.5,1.0,45,'nv','ld','HP B12 IR'],
  ['mutton_haleem',    'Haleem (Mutton)',              'Haleem | ஹலீம் | हलीम',               'dish','🍲',245, 17.5,15.5,12.5,2.5,50,'nv','ld','HP B12 HF IR'],
  ['kheema_matar',     'Keema Matar',                 'Keema Matar | கீமா மட்டர் | कीमा मटर','dish','🍛',220, 18.0,10.0,12.5,2.0,45,'nv','ld','HP B12'],
  ['lamb_chops',       'Lamb Chops',                  'Lamb Chops | ஆட்டு சாப்ஸ்',          'meat','🥩',294, 25.0, 0.0,20.5,0.0,0,'nv','ld','HP B12 ZR'],
  ['seekh_kebab',      'Seekh Kebab (Mutton)',        'Seekh Kebab | சீக் கபாப் | सीख कबाब','dish','🍢',196, 20.5, 5.0,10.5,0.5,0,'nv','ld','HP B12'],
  ['shammi_kebab',     'Shammi Kebab',                'Shammi Kebab | ஷம்மி கபாப்',         'dish','🍢',210, 18.0, 8.5,12.0,1.0,40,'nv','ld','HP B12'],

  // ── FISH ─────────────────────────────────────────────────────────────────────
  ['rohu',             'Rohu Fish',                   'Rohu | ரோஹு | रोहु',                 'seafood','🐟',119, 16.6, 0.0, 6.5,0.0,0,'nv','ld','HP O3 B12 VD ZR SE'],
  ['katla',            'Katla Fish',                  'Katla | கட்லா | कटला',                'seafood','🐟',111, 20.5, 0.0, 3.5,0.0,0,'nv','ld','HP O3 B12 VD'],
  ['pomfret',          'Pomfret Fish',                'Paplet | பாம்ப்ரெட் | पापलेट',        'seafood','🐟',117, 21.0, 0.0, 3.6,0.0,0,'nv','ld','HP O3 B12 VD ZR'],
  ['bangda',           'Indian Mackerel (Bangda)',    'Bangda | பாங்டா | बांगडा',            'seafood','🐟',205, 19.0, 0.0,14.0,0.0,0,'nv','ld','HP O3 B12 VD HH'],
  ['surmai',           'King Fish / Surmai',          'Surmai | சூர்மை | सुरमई',             'seafood','🐟',109, 23.4, 0.0, 1.5,0.0,0,'nv','ld','HP O3 B12 ZR LF'],
  ['rawas',            'Indian Salmon (Rawas)',        'Rawas | ரவாஸ் | रावस',               'seafood','🐟',208, 20.0, 0.0,13.5,0.0,0,'nv','ld','HP O3 B12 VD HH'],
  ['tilapia',          'Tilapia Fish',                'Tilapia | திலாப்பியா',               'seafood','🐟',128, 26.2, 0.0, 2.7,0.0,0,'nv','ld','HP B12 LF ZR'],
  ['hilsa',            'Hilsa Fish (Ilish)',           'Ilish | இல்லிஷ் | हिलसा',            'seafood','🐟',310, 21.8, 0.0,24.0,0.0,0,'nv','ld','HP O3 B12 VD'],
  ['sardine',          'Sardines (Mathi / Chalai)',   'Mathi | மத்தி | सार्डिन',            'seafood','🐟',208, 24.6, 0.0,11.5,0.0,0,'nv','ld','HP O3 B12 CR VD'],
  ['anchovies',        'Anchovies (Nethili)',          'Nethili | நெத்திலி | नेथिली',        'seafood','🐟',210, 28.0, 0.0,10.0,0.0,0,'nv','ld','HP O3 CR B12'],
  ['tuna',             'Tuna Fish',                   'Tuna | டூனா | ट्यूना',               'seafood','🐟',109, 24.4, 0.0, 0.5,0.0,0,'nv','ld','HP O3 B12 ZR LF SE'],
  ['salmon',           'Salmon Fish',                 'Salmon | சால்மன் | सैल्मन',           'seafood','🐟',208, 20.0, 0.0,13.4,0.0,0,'nv','ld','HP O3 B12 VD HH'],
  ['cod',              'Cod Fish',                    'Cod | காட் | कॉड',                   'seafood','🐟', 82, 17.8, 0.0, 0.7,0.0,0,'nv','ld','HP B12 LF ZR'],
  ['seer_fish',        'Seer Fish (Vanjaram)',         'Vanjaram | வஞ்சரம் | वनजरम',         'seafood','🐟',100, 23.0, 0.0, 0.7,0.0,0,'nv','ld','HP O3 B12 LF ZR'],
  ['red_snapper',      'Red Snapper',                 'Red Snapper | சிவப்பு மீன்',         'seafood','🐟',128, 26.3, 0.0, 1.7,0.0,0,'nv','ld','HP B12 ZR LF'],
  ['catfish',          'Catfish (Singhara/Singhi)',   'Singhara | சிங்கி மீன் | सिंघाड़ा', 'seafood','🐟',105, 18.0, 0.0, 2.8,0.0,0,'nv','ld','HP B12 ZR'],
  ['barramundi',       'Asian Sea Bass (Koduva)',      'Koduva | கொடுவா | सी बास',           'seafood','🐟',124, 20.1, 0.0, 4.5,0.0,0,'nv','ld','HP O3 B12 VD'],
  ['dried_fish',       'Dried Fish (Karuvadu)',        'Karuvadu | காரவாடு | सूखी मछली',    'seafood','🐟',260, 58.0, 0.0, 2.0,0.0,0,'nv','ld','HP CR ZR B12'],
  ['fish_curry',       'Fish Curry (South Indian)',   'Meen Kuzhambhu | மீன் குழம்பு',      'dish','🍛',165, 17.5, 8.0, 7.5,1.5,40,'nv','ld','HP O3 B12'],
  ['fish_fry',         'Fish Fry (Tawa)',              'Machli Fry | மீன் வறுவல் | माछली',  'dish','🍗',210, 24.0, 5.0,10.5,0.5,35,'nv','ld','HP B12'],
  ['fish_biryani',     'Fish Biryani',                'Machli Biryani | மீன் பிரியாணி',     'dish','🍛',280, 14.5,34.0, 8.5,1.5,65,'nv','ld','HP O3 B12'],
  ['goa_fish_curry',   'Goan Fish Curry',             'Goa Machli Curry | கோவா மீன் கறி',  'dish','🍛',185, 18.0, 9.5, 9.0,1.5,40,'nv','ld','HP O3 B12'],
  ['kerala_fish_molee','Kerala Fish Molee',           'Kerala Meen Molee | கேரள மீன்',     'dish','🍛',210, 17.5, 6.5,13.0,1.5,35,'nv','ld','HP O3 B12'],

  // ── PRAWNS / SHRIMP ──────────────────────────────────────────────────────────
  ['prawn_raw',        'Prawns / Shrimp (raw)',       'Jheenga | இறால் | झींगा',            'seafood','🦐', 99, 20.3, 0.2, 1.7,0.0,0,'nv','ld','HP B12 ZR SE MR'],
  ['prawn_cooked',     'Cooked Prawns',               'Pakke Jheenga | வேகவைத்த இறால்',    'seafood','🦐',105, 22.0, 0.2, 2.0,0.0,0,'nv','ld','HP B12 ZR'],
  ['tiger_prawn',      'Tiger Prawns',                'Bada Jheenga | புலி இறால்',          'seafood','🦐', 89, 20.3, 0.0, 0.6,0.0,0,'nv','ld','HP B12 ZR LF'],
  ['prawn_masala',     'Prawn Masala Curry',          'Jheenga Masala | இறால் மசாலா',       'dish','🍛',165, 17.5, 8.0, 7.5,1.5,40,'nv','ld','HP B12 ZR'],
  ['prawn_biryani',    'Prawn Biryani',               'Jheenga Biryani | இறால் பிரியாணி',  'dish','🍛',275, 13.5,35.0, 7.5,1.5,65,'nv','ld','HP B12'],
  ['prawn_fry',        'Prawn Fry / Tawa Prawn',     'Jheenga Fry | இறால் வறுவல்',         'dish','🦐',175, 20.5, 5.5, 8.0,0.5,35,'nv','ld','HP B12 ZR'],
  ['prawn_kerala',     'Kerala Prawn Curry',          'Chemeen Curry | ചെമ്മീൻ கறி',       'dish','🍛',185, 17.5, 6.5,10.0,1.5,40,'nv','ld','HP O3 B12'],
  ['dried_prawns',     'Dried Prawns (Karuvadu)',     'Sukha Jheenga | காய்ந்த இறால்',      'seafood','🦐',295, 58.5, 2.8, 4.5,0.0,0,'nv','ld','HP CR ZR B12'],

  // ── CRAB / LOBSTER / SQUID ───────────────────────────────────────────────────
  ['crab_raw',         'Crab (raw)',                  'Kekda | நண்டு | केकड़ा',              'seafood','🦀', 97, 19.5, 0.0, 1.5,0.0,0,'nv','ld','HP B12 ZR CR'],
  ['crab_curry',       'Crab Curry',                  'Kekda Curry | நண்டு கறி | केकड़ा करी','dish','🍛',160, 16.0, 7.0, 8.5,1.5,40,'nv','ld','HP B12 ZR'],
  ['lobster_raw',      'Lobster',                     'Jheenga Machchli | ஓமர் | झींगा',   'seafood','🦞', 89, 18.8, 1.2, 0.9,0.0,0,'nv','ld','HP B12 ZR LF'],
  ['squid',            'Squid / Calamari',            'Squid | கணவாய் | स्क्विड',           'seafood','🦑', 92, 15.6, 3.1, 1.4,0.0,0,'nv','ld','HP B12 ZR SE'],
  ['squid_fry',        'Squid Fry (Calamari)',        'Tali Squid | வறுத்த கணவாய்',        'dish','🦑',175, 17.0, 7.5, 8.5,0.5,40,'nv','ld','HP B12'],
  ['clams',            'Clams / Oysters',             'Ghongha | கோழி | क्लैम',             'seafood','🦪', 74, 12.8, 3.7, 0.8,0.0,0,'nv','ld','HP IR B12 ZR'],

  // ── PORK ─────────────────────────────────────────────────────────────────────
  ['pork_raw',         'Pork (lean, raw)',             'Suar Ka Gosht | பன்றி இறைச்சி',     'meat','🥩',143, 21.3, 0.0, 6.0,0.0,0,'nv','ld','HP B12 ZR SE'],
  ['pork_belly',       'Pork Belly',                  'Suar Ki Belly | பன்றி வயிறு',       'meat','🥩',518,  9.3, 0.0,53.0,0.0,0,'nv','ld','HP B12'],
  ['pork_ribs',        'Pork Ribs',                   'Suar Ki Pasliyaan | பன்றி ரிப்',    'meat','🥩',292, 15.6, 0.0,25.0,0.0,0,'nv','ld','HP B12'],
  ['goan_pork_vindaloo','Goan Pork Vindaloo',         'Vindaloo | விண்டாலூ',               'dish','🍛',275, 20.5, 9.5,17.5,1.5,45,'nv','ld','HP B12 AI'],
  ['pork_sorpotel',    'Pork Sorpotel (Goa)',         'Sorpotel | சோர்போட்டெல்',           'dish','🍛',290, 19.5,10.0,18.5,1.0,45,'nv','ld','HP B12'],

  // ── PROCESSED / PACKAGED MEATS ───────────────────────────────────────────────
  ['chicken_sausage',  'Chicken Sausage',             'Murgi Ka Sausage | சிக்கன் சாஸேஜ்', 'meat','🌭',218, 13.4, 2.0,17.0,0.0,0,'nv','bld','HP B12'],
  ['chicken_nuggets',  'Chicken Nuggets',             'Chicken Nuggets | சிக்கன் நகெட்ஸ்', 'meat','🍗',297, 16.0,17.0,17.5,1.0,55,'nv','ld','HP B12'],
  ['chicken_salami',   'Chicken Salami',              'Murgi Salami | சிக்கன் சலாமி',      'meat','🍖',161, 12.6, 2.1,11.5,0.0,0,'nv','bld','HP B12'],
  ['mutton_keema_pav', 'Mutton Keema Pav',            'Keema Pav | கீமா பாவ்',              'dish','🍞',320, 16.5,32.0,13.5,2.0,60,'nv','bld','HP B12'],

  // ── OFFAL / ORGAN MEATS ──────────────────────────────────────────────────────
  ['goat_brain',       'Goat Brain (Bheja)',          'Bheja | மூளை | भेजा',               'meat','🟤',151, 11.4, 0.8,10.3,0.0,0,'nv','ld','B12 HP ZR MR'],
  ['goat_kidney',      'Goat Kidney',                 'Gurda | சிறுநீரகம் | गुर्दा',       'meat','🟤',115, 17.4, 0.3, 3.6,0.0,0,'nv','ld','HP IR B12 ZR'],
  ['goat_trotters',    'Goat Trotters (Paya)',        'Paya | ஆட்டுக் காலடி | पाया',       'dish','🍲',160, 14.5, 5.0, 8.5,0.5,30,'nv','ld','HP B12 CR'],
  ['bone_broth',       'Bone Broth / Stock',          'Haddi Ka Shorba | எலும்பு சாறு',    'dish','🍲', 35,  5.0, 1.5, 1.0,0.0,5,'nv','ld','HP CR GF LF AY'],
]

export default makeFoods(rows)
