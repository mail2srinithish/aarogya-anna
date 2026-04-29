import { makeFoods } from './base.js'

const rows = [
  // ── TURMERIC ─────────────────────────────────────────────────────────────────
  ['turmeric_powder',  'Turmeric Powder (Haldi)',       'Manjal | மஞ்சள் | हल्दी',          'spice','🟡',354, 7.8,64.9,9.9,21.1,25,'vg','a','AI IM AY TR'],
  ['turmeric_fresh',   'Fresh Turmeric',                'Pacha Manjal | பச்சை மஞ்சள் | कच्ची हल्दी','spice','🟡', 79, 1.4,14.7,4.1,4.2,25,'vg','a','AI IM AY TR'],
  ['kasturi_manjal',   'Kasturi Manjal (Wild Turmeric)','Kasturi Turmeric | கஸ்தூரி மஞ்சள்','spice','🟡',354, 7.8,64.9,9.9,21.1,25,'vg','a','AI IM AY'],

  // ── GINGER ───────────────────────────────────────────────────────────────────
  ['ginger_powder',    'Ginger Powder (Sonth)',         'Sukku | சுக்கு | सोंठ',            'spice','🟤',335,8.98,71.6,4.2,14.1,15,'vg','a','AI GU IM AY TR'],
  ['ginger_fresh',     'Fresh Ginger',                  'Inji | இஞ்சி | अदरक',              'spice','🌿', 80, 1.8,17.8,0.8,2.0,15,'vg','a','AI GU IM AY TR'],
  ['ginger_pickle',    'Ginger Pickle',                 'Inji Pickle | இஞ்சி ஊறுகாய்',    'spice','🟤', 80, 1.5,15.0,1.5,2.0,20,'vg','a','AI GU TR'],

  // ── CUMIN ────────────────────────────────────────────────────────────────────
  ['cumin_seeds',      'Cumin Seeds (Jeera)',           'Jeeragam | ஜீரகம் | जीरा',         'spice','⬜',375,17.8,44.2,22.3,10.5,35,'vg','a','GU AI IM TR AY'],
  ['cumin_powder',     'Cumin Powder',                  'Jeera Powder | ஜீரக தூள்',        'spice','🟤',375,17.8,44.2,22.3,10.5,35,'vg','a','GU AI IM TR'],
  ['black_cumin',      'Black Cumin (Kala Jeera)',      'Kala Jeera | கருஞ்சீரகம் | काला जीरा','spice','⚫',375,16.8,47.5,22.3,11.5,35,'vg','a','AI GU AY TR'],
  ['cumin_roasted',    'Roasted Cumin (Bhuna Jeera)',   'Bhuna Jeera | வறுத்த ஜீரகம்',    'spice','🟤',375,17.8,44.2,22.3,10.5,35,'vg','a','GU IM AY'],

  // ── CORIANDER ────────────────────────────────────────────────────────────────
  ['coriander_seeds',  'Coriander Seeds (Dhania)',      'Dhaniya | கொத்தமல்லி விதை | धनिया','spice','⬜',298,12.4,54.9,17.8,41.9,35,'vg','a','GU AI IM TR'],
  ['coriander_powder', 'Coriander Powder',              'Dhania Powder | கொத்தமல்லி தூள்', 'spice','🟤',298,12.4,54.9,17.8,41.9,35,'vg','a','GU AI IM'],
  ['coriander_fresh',  'Fresh Coriander Leaves',        'Kothamalli | கொத்தமல்லி | धनिया पत्ती','herb','🌿', 23, 2.1, 3.7,0.5,2.8,30,'vg','a','IM CR AI'],

  // ── RED CHILLI ───────────────────────────────────────────────────────────────
  ['red_chilli_powder','Red Chilli Powder (Lal Mirch)', 'Milagai Podi | மிளகாய் பொடி | लाल मिर्च','spice','🌶️',282,13.5,39.7,16.8,27.2,35,'vg','a','AI IM'],
  ['kashmiri_chilli',  'Kashmiri Red Chilli',           'Kashmiri Mirch | காஷ்மீர் மிளகாய்','spice','🔴',282,13.5,39.7,16.8,27.2,35,'vg','a','AI IM VD'],
  ['guntur_chilli',    'Guntur Chilli',                 'Guntur Mirch | குண்டூர் மிளகாய்', 'spice','🌶️',282,14.0,39.0,18.0,28.0,35,'vg','a','AI IM'],
  ['byadagi_chilli',   'Byadagi Chilli (Karnataka)',    'Byadagi | ப்யாடகி மிளகாய்',       'spice','🔴',282,13.5,39.7,16.8,27.2,35,'vg','a','AI VD'],
  ['chilli_flakes',    'Dried Chilli Flakes',           'Chilli Flakes | மிளகாய் செதில்கள்','spice','🔴',314,12.0,56.6,8.8,27.2,35,'vg','a','AI IM'],

  // ── BLACK PEPPER ─────────────────────────────────────────────────────────────
  ['black_pepper',     'Black Pepper (Kali Mirch)',     'Milagu | மிளகு | काली मिर्च',       'spice','⚫',251,10.4,63.7,3.3,25.3,35,'vg','a','AI GU IM AY TR'],
  ['white_pepper',     'White Pepper',                  'Safed Mirch | வெள்ளை மிளகு | सफेद मिर्च','spice','⬜',296,10.4,68.6,2.1,26.2,35,'vg','a','AI GU'],
  ['long_pepper',      'Long Pepper (Pippali)',         'Pippalamul | திப்பிலி | पिप्पली', 'spice','🟤',256,10.4,65.7,2.7,26.3,35,'vg','a','AI GU AY TR'],

  // ── CARDAMOM ─────────────────────────────────────────────────────────────────
  ['cardamom_green',   'Green Cardamom (Elaichi)',      'Elakkai | ஏலக்காய் | हरी इलाइची', 'spice','🟢',311, 8.1,71.5,6.7,28.0,35,'vg','a','GU AI IM AY TR FS'],
  ['cardamom_black',   'Black Cardamom',                'Bada Elaichi | பெரிய ஏலக்காய் | बड़ी इलाइची','spice','⚫',305, 8.0,70.5,6.0,28.0,35,'vg','a','GU AI AY TR'],
  ['cardamom_powder',  'Cardamom Powder',               'Elaichi Powder | ஏலக்காய் தூள்', 'spice','🟡',311, 8.1,71.5,6.7,28.0,35,'vg','a','GU IM AY'],

  // ── CLOVES ───────────────────────────────────────────────────────────────────
  ['cloves',           'Cloves (Laung)',                 'Lavangam | லவங்கம் | लौंग',        'spice','🟤',274, 5.9,65.5,13.0,33.9,35,'vg','a','AI GU AY TR IM'],
  ['clove_oil',        'Clove Oil',                     'Lavanga Tel | லவங்க எண்ணெய்',    'oil','🟤',884, 0.0, 0.0,99.9,0.0,0,'vg','a','AI GU AY'],

  // ── CINNAMON ─────────────────────────────────────────────────────────────────
  ['cinnamon',         'Cinnamon (Dalchini)',            'Ilangai Pattai | இலவங்கப்பட்டை | दालचीनी','spice','🟤',247, 4.0,80.6,1.2,53.1,15,'vg','a','AI DF GU AY TR HH'],
  ['cassia',           'Cassia Cinnamon (Indian)',       'Taj | தாஜ்',                      'spice','🟤',240, 4.0,80.0,1.0,53.0,18,'vg','a','AI DF GU TR'],

  // ── STAR ANISE ────────────────────────────────────────────────────────────────
  ['star_anise',       'Star Anise (Chakra Phool)',      'Annasi Poo | அன்னாசிப்பூ | चक्र फूल','spice','⭐',337, 17.6,50.0,15.9,14.6,35,'vg','a','GU AI IM AY TR'],

  // ── FENUGREEK ────────────────────────────────────────────────────────────────
  ['fenugreek_seeds',  'Fenugreek Seeds (Methi)',       'Vendhayam | வெந்தயம் | मेथी दाना','spice','🟡',323,23.0,58.4,6.4,24.6,25,'vg','a','DF AI HP GU AY TR IR'],
  ['fenugreek_powder', 'Fenugreek Powder',              'Methi Powder | வெந்தயம் தூள்',   'spice','🟤',323,23.0,58.4,6.4,24.6,25,'vg','a','DF AI HP GU'],

  // ── MUSTARD ──────────────────────────────────────────────────────────────────
  ['mustard_black',    'Black Mustard Seeds',           'Kadugu | கடுகு | काली सरसों',      'spice','⚫',508,26.1,28.1,36.2,12.2,35,'vg','a','AI HH TR'],
  ['mustard_oil',      'Mustard Oil',                   'Sarson Ka Tel | கடுகு எண்ணெய்',  'oil','💛',884, 0.0, 0.0,99.9,0.0,0,'vg','a','O3 HH'],

  // ── ASAFOETIDA ────────────────────────────────────────────────────────────────
  ['asafoetida',       'Asafoetida (Hing)',              'Perungayam | பெருங்காயம் | हींग', 'spice','🟤',297, 4.0,67.8,1.1,4.1,35,'vg','a','GU AI AY TR'],

  // ── BAY LEAVES ────────────────────────────────────────────────────────────────
  ['bay_leaves',       'Bay Leaves (Tej Patta)',         'Tej Patta | தேஜ் பத்தா | तेज पत्ता','spice','🌿',313, 7.6,74.9,8.4,26.3,35,'vg','a','AI GU AY'],
  ['curry_leaves',     'Curry Leaves (Kadi Patta)',      'Karivepilai | கறிவேப்பிலை | कड़ी पत्ता','herb','🌿',108, 6.1,18.7,1.0,6.4,30,'vg','a','CR IR IM AI TR AY'],

  // ── NUTMEG & MACE ─────────────────────────────────────────────────────────────
  ['nutmeg',           'Nutmeg (Jaiphal)',               'Jathikkai | ஜாதிக்காய் | जायफल', 'spice','🟤',525, 5.8,49.3,36.3,20.8,35,'vg','a','GU AI AY TR BC'],
  ['mace',             'Mace (Javitri)',                 'Javitri | ஜாவித்திரி | जावित्री', 'spice','🟡',475, 6.7,50.5,32.4,20.2,35,'vg','a','GU AI AY'],

  // ── SAFFRON ──────────────────────────────────────────────────────────────────
  ['saffron',          'Saffron (Kesar)',                'Kunkumapoo | குங்குமப்பூ | केसर', 'spice','🟡',310,11.4,65.4,5.9,3.9,35,'vg','a','AI IM BC AY TR FS'],

  // ── VANILLA ──────────────────────────────────────────────────────────────────
  ['vanilla_pod',      'Vanilla Pod / Bean',             'Vanilla | வெண்ணிலா | वेनिला',     'spice','🟤',288,0.1,12.7,0.1,0.0,35,'vg','a','AI GU'],

  // ── KOKUM ────────────────────────────────────────────────────────────────────
  ['kokum_dried',      'Dried Kokum (Amsol)',            'Kokum | கோகும் | कोकम',            'spice','🟣', 61, 0.9,13.8,0.6,3.0,35,'vg','a','GU AI DT TR'],

  // ── CHAAT MASALA & BLENDS ────────────────────────────────────────────────────
  ['chaat_masala',     'Chaat Masala',                   'Chaat Masala | சாட் மசாலா',        'spice','🟤',265,10.0,42.0,8.0,30.0,35,'vg','a','GU AI TR'],
  ['garam_masala',     'Garam Masala',                   'Garam Masala | கரம் மசாலா',        'spice','🟤',271, 9.8,55.0,8.2,28.0,35,'vg','a','AI GU TR AY'],
  ['sambar_powder',    'Sambar Powder',                  'Sambar Podi | சாம்பார் பொடி',     'spice','🟤',280,12.0,46.0,9.0,24.0,35,'vg','ld','AI GU TR'],
  ['rasam_powder',     'Rasam Powder',                   'Rasam Podi | ரசம் பொடி',           'spice','🟤',275,11.0,48.0,8.5,22.0,35,'vg','ld','AI GU TR'],
  ['idli_podi',        'Idli Podi / Gunpowder',          'Idli Milagai Podi | இட்லி மிளகாய் பொடி','spice','🟤',380,18.0,50.0,10.0,14.0,35,'vg','b','HP IR TR'],
  ['biryani_masala',   'Biryani Masala',                 'Biryani Masala | பிரியாணி மசாலா', 'spice','🟤',265,10.0,44.0,8.0,28.0,35,'vg','ld','AI GU TR FS'],
  ['pav_bhaji_masala', 'Pav Bhaji Masala',               'Pav Bhaji Masala | பாவ் பாஜி மசாலா','spice','🟤',255,10.0,43.5,7.5,25.0,35,'vg','ld','AI GU TR'],
  ['rajma_masala',     'Rajma Masala',                   'Rajma Masala | ராஜ்மா மசாலா',     'spice','🟤',260,10.5,45.0,7.5,26.0,35,'vg','ld','AI GU TR'],
  ['chole_masala',     'Chole Masala',                   'Chole Masala | சோலே மசாலா',        'spice','🟤',260,10.5,44.5,7.5,26.5,35,'vg','ld','AI GU TR'],
  ['kitchen_king',     'Kitchen King Masala',            'Kitchen King | கிட்சன் கிங் மசாலா','spice','🟤',270,11.0,45.0,8.0,28.0,35,'vg','ld','AI GU TR'],
  ['amchur',           'Amchur / Dry Mango Powder',      'Amchur | கொடுக்காபுளி | अमचूर',   'spice','🟡',319, 2.5,78.6,0.7,2.4,35,'vg','a','IM DT TR'],
  ['tamarind_paste',   'Tamarind Paste / Concentrate',  'Puli Kuzhambu | புளி | इमली पेस्ट','spice','🟤',124, 1.4,32.8,0.3,2.6,55,'vg','a','IR GU TR'],
  ['pomegranate_pdr',  'Anardana (Pomegranate Powder)', 'Anardana | மாதுளை பொடி | अनारदाना','spice','🔴',290, 2.5,68.0,2.0,5.0,35,'vg','a','AI IR HH TR'],

  // ── HERBS ─────────────────────────────────────────────────────────────────────
  ['tulsi',            'Tulsi / Holy Basil',             'Tulsi | துளசி | तुलसी',            'herb','🌿', 22, 3.2, 2.7,0.6,1.6,20,'vg','a','AI IM BC ST AY TR'],
  ['neem_leaves',      'Neem Leaves',                    'Vembu | வேப்பிலை | नीम पत्ती',    'herb','🌿', 50, 5.7, 4.2,0.5,1.0,20,'vg','a','AI DT AY TR IM'],
  ['brahmi',           'Brahmi / Bacopa',                'Brahmi | பிரம்மி | ब्राह्मी',      'herb','🌿', 50, 4.5, 7.2,0.9,1.5,20,'vg','a','BC AI IM AY TR'],
  ['ashwagandha_root', 'Ashwagandha Root',               'Aswagandha | அஸ்வகந்தா | अश्वगंधा','herb','🟤',245,3.9,49.9,0.3,32.3,20,'vg','a','MB BC AI AY TR'],
  ['shatavari',        'Shatavari Root',                 'Shatavari | சதாவரி | शतावरी',     'herb','🟤',220, 3.5,45.0,0.5,25.0,20,'vg','a','PC CR HH AY TR'],
  ['triphala',         'Triphala Powder',                'Triphala | திரிஃபலா | त्रिफला',    'herb','🟤',250, 3.0,60.0,1.0,25.0,25,'vg','a','GU AI DT AY TR'],
  ['moringa_powder2',  'Moringa Leaf Powder',            'Murungai Podi | முருங்கை பொடி | मोरिंगा पाउडर','herb','💚',268,27.1,38.2,6.0,19.2,25,'vg','a','HP IR CR MR ZR IM AY TR'],
  ['peppermint',       'Peppermint Leaves',              'Pudina | புதினா | पुदीना',          'herb','🌿', 70, 3.8,15.0,0.9,8.0,25,'vg','a','GU IM AI'],
  ['lemongrass',       'Lemongrass',                     'Elumichai Pullu | எலுமிச்சை புல்','herb','🌿', 99, 1.8,25.3,0.5,0.0,30,'vg','a','AI GU IM TR'],
  ['fennel_seeds',     'Fennel Seeds (Saunf)',           'Sombu | சோம்பு | सौंफ',             'spice','🟢',345,15.8,52.3,14.9,39.8,35,'vg','a','GU AI IM AY TR'],
  ['dried_ginger',     'Dried Ginger / Chukku',          'Chukku | சுக்கு | सोंठ',            'spice','🟤',335,8.98,71.6,4.2,14.1,15,'vg','a','AI GU AY TR IM'],
  ['pepper_long',      'Long Pepper (Pippali)',          'Thippili | திப்பிலி | पिप्पली',    'spice','🟤',256,10.4,65.7,2.7,26.3,35,'vg','a','AI GU BC AY TR'],
  ['licorice',         'Licorice Root (Mulethi)',        'Atimadhuram | அதிமதுரம் | मुलेठी','herb','🟤',351, 5.5,82.6,0.5,7.4,30,'vg','a','GU AI AY TR'],
  ['holy_basil_seeds', 'Holy Basil / Sabja Seeds',      'Sabja | சப்ஜா | सब्जा',             'herb','⬜',442,14.4,63.8,4.0,22.6,35,'vg','s','GU DT IM AY GF'],
]

export default makeFoods(rows)
