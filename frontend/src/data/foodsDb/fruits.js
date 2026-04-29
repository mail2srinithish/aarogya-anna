import { makeFoods } from './base.js'

// [id, nameEn, nameRegional, cat, emoji, kcal, pro, carb, fat, fib, gi, diet, meal, tags]
// Nutrition per 100g (raw/fresh unless noted)

const rows = [
  // ── MANGO VARIETIES ─────────────────────────────────────────────────────────
  ['mango_alphonso',   'Alphonso Mango (Hapus)',         'Hapus | ஆம்பழம் | आम',         'fruit','🥭', 63, 0.8,16.0,0.4,1.8,51,'vg','s','IM VD AI'],
  ['mango_kesar',      'Kesar Mango',                    'Kesar Aam | கேசர் ஆம்பழம்',    'fruit','🥭', 61, 0.8,15.0,0.4,1.6,50,'vg','s','IM VD'],
  ['mango_dashehari',  'Dashehari Mango',                'Dashehari | தாஷேஹரி',          'fruit','🥭', 60, 0.7,14.8,0.3,1.5,51,'vg','s','IM'],
  ['mango_langra',     'Langra Mango',                   'Langra Aam | லாங்க்ரா',        'fruit','🥭', 59, 0.7,14.5,0.4,1.4,50,'vg','s','IM'],
  ['mango_totapuri',   'Totapuri Mango',                 'Totapuri | தோட்டாபுரி',        'fruit','🥭', 56, 0.7,13.8,0.2,1.5,50,'vg','s','IM LG'],
  ['mango_neelam',     'Neelam Mango',                   'Neelam | நீலம் மாம்பழம்',      'fruit','🥭', 62, 0.7,15.5,0.3,1.6,52,'vg','s','IM'],
  ['mango_sindhuri',   'Sindhuri Mango',                 'Sindhuri Aam | சிந்தூரி',      'fruit','🥭', 64, 0.9,16.0,0.4,1.7,53,'vg','s','IM ED'],
  ['mango_banganapalli','Banganapalli Mango',            'Benishan | பங்கனபள்ளி',        'fruit','🥭', 61, 0.7,15.0,0.3,1.6,51,'vg','s','IM'],
  ['mango_chausa',     'Chausa Mango',                   'Chausa Aam | சௌஸா',            'fruit','🥭', 65, 0.8,16.2,0.4,1.8,52,'vg','s','IM'],
  ['mango_amrapali',   'Amrapali Mango',                 'Amrapali Aam | அம்ரபாலி',      'fruit','🥭', 60, 0.8,14.9,0.3,1.5,50,'vg','s','IM'],
  ['mango_mallika',    'Mallika Mango',                  'Mallika | மல்லிகா',             'fruit','🥭', 63, 0.8,15.5,0.3,1.7,51,'vg','s','IM'],
  ['mango_fazli',      'Fazli Mango',                    'Fazli Aam | ஃபாஸ்லி',          'fruit','🥭', 59, 0.7,14.6,0.3,1.5,50,'vg','s','IM'],
  ['raw_mango',        'Raw Mango (Kaccha Aam)',         'Kairi | மாங்காய் | कच्चा आम', 'fruit','🥭', 60, 0.7,14.8,0.1,1.6,41,'vg','a','IM LG DT'],
  ['mango_dried',      'Dried Mango (Amchur)',           'Amchur | சுக்கு மாம்பழம்',    'fruit','🥭',319, 2.5,78.6,0.7,2.4,55,'vg','s','IM'],

  // ── BANANA VARIETIES ────────────────────────────────────────────────────────
  ['banana_cavendish', 'Banana (Cavendish)',             'Banana | வாழைப்பழம் | केला',   'fruit','🍌', 89, 1.1,23.0,0.3,2.6,51,'vg','s','ED MR GU'],
  ['banana_robusta',   'Robusta Banana',                 'Robusta | ரொபஸ்டா வாழை',      'fruit','🍌', 90, 1.2,23.0,0.3,2.6,51,'vg','s','ED MR'],
  ['banana_yelakki',   'Yelakki / Elaichi Banana',      'Yelakki | ஏலக்கி வாழை | इलाइची केला','fruit','🍌', 92, 1.1,24.0,0.2,2.3,47,'vg','s','ED GU'],
  ['banana_poovan',    'Poovan Banana',                  'Poovan | பூவன் வாழை',          'fruit','🍌', 88, 1.0,22.5,0.2,2.4,46,'vg','s','ED GU TR'],
  ['banana_nendran',   'Nendran Plantain',               'Nendran | நேந்திரம் | नेंद्रन', 'fruit','🍌', 95, 1.3,24.8,0.3,2.5,50,'vg','s','ED MR TR'],
  ['banana_red',       'Red Banana',                     'Red Banana | சிவப்பு வாழை',    'fruit','🍌', 90, 1.3,22.9,0.4,3.0,49,'vg','s','IM IR'],
  ['banana_hill',      'Hill Banana (Malai Vazhai)',     'Malai Vazhai | மலை வாழை',      'fruit','🍌', 87, 1.0,22.5,0.2,2.4,46,'vg','s','ED TR'],
  ['banana_karpooravalli','Karpooravalli Banana',        'Karpooravalli | கற்பூரவல்லி',  'fruit','🍌', 91, 1.1,23.2,0.3,2.5,48,'vg','s','GU TR'],
  ['raw_banana_green', 'Green / Raw Banana',             'Kachcha Kela | வாழைக்காய்',    'fruit','🍌', 89, 1.3,22.8,0.4,2.6,40,'vg','ld','HF DF LG GU TR'],
  ['banana_flower',    'Banana Blossom / Flower',        'Vazhai Poo | வாழைப்பூ | केले का फूल','vegetable','🌸', 51, 1.6,13.0,0.6,5.7,35,'vg','ld','IR CR HF TR'],

  // ── CITRUS ──────────────────────────────────────────────────────────────────
  ['orange_nagpur',    'Nagpur Orange / Mandarin',       'Nagpuri Santra | நாகபுர் ஆரஞ்சு', 'fruit','🍊', 47, 0.9,11.8,0.1,2.4,43,'vg','s','IM HT LG'],
  ['orange_kinnow',    'Kinnow Mandarin',                'Kinnow | கின்னோ',               'fruit','🍊', 50, 0.8,12.0,0.2,2.5,43,'vg','s','IM LG'],
  ['sweet_lime',       'Sweet Lime / Mosambi',           'Mosambi | மோசம்பி | मौसमी',    'fruit','🟡', 43, 0.8,10.9,0.3,0.3,41,'vg','s','IM DT'],
  ['lemon_nimbu',      'Lemon (Nimbu)',                  'Nimbu | எலுமிச்சை | नींबू',    'fruit','🍋', 29, 1.1, 9.3,0.3,2.8,20,'vg','a','IM IR LG DT'],
  ['lime',             'Lime',                           'Lime | சுண்டைக்காய் | चूना',   'fruit','🍋', 30, 0.7, 7.7,0.2,2.8,30,'vg','a','IM DT'],
  ['grapefruit',       'Grapefruit (Chakotra)',          'Chakotra | சக்கோத்திரை | चकोतरा','fruit','🍊', 42, 0.8,10.7,0.1,1.6,25,'vg','s','HH LG DT'],
  ['blood_orange',     'Blood Orange',                   'Blood Orange | செம்மண் ஆரஞ்சு','fruit','🍊', 50, 0.9,12.0,0.1,2.2,43,'vg','s','IM AI'],
  ['pomelo',           'Pomelo (Batabi Lebu)',           'Batabi Lebu | பம்பிலிமாஸ்',    'fruit','🍊', 38, 0.8, 9.6,0.0,1.0,35,'vg','s','IM LG'],
  ['tangerine',        'Tangerine',                      'Tangerine | கீனா',              'fruit','🍊', 53, 0.8,13.3,0.3,1.8,42,'vg','s','IM'],

  // ── BERRIES / SMALL FRUITS ───────────────────────────────────────────────────
  ['jamun',            'Jamun / Java Plum',              'Jamun | நாவல் | जामुन',         'fruit','🫐', 62, 0.7,14.0,0.2,0.6,25,'vg','s','DF LG AI IR TR'],
  ['strawberry',       'Strawberry',                     'Strawberry | ஸ்ட்ராபெரி',      'fruit','🍓', 32, 0.7, 7.7,0.3,2.0,40,'vg','s','IM LG LF'],
  ['mulberry',         'Mulberry (Shahtoot)',            'Shahtoot | முல்பெரி | शहतूत',  'fruit','🫐', 43, 1.4, 9.8,0.4,1.7,25,'vg','s','IR IM AI'],
  ['phalsa',           'Phalsa (Sherbet Berry)',         'Phalsa | பால்சா | फालसा',      'fruit','🫐', 72, 1.4,16.3,0.9,3.1,30,'vg','s','IR CR LG TR'],
  ['karonda',          'Karonda / Carissa',              'Karonda | கலாக்காய் | करौंदा',  'fruit','🫐', 42, 1.1, 9.3,0.6,2.8,35,'vg','s','IR IM'],
  ['gooseberry',       'Gooseberry (Indian)',            'Gooseberry | நெல்லிக்காய்',    'fruit','🟢', 44, 0.9,10.2,0.6,4.3,30,'vg','s','IM HF AY'],
  ['blueberry',        'Blueberry',                      'Blueberry | நீல பெர்ரி',       'fruit','🫐', 57, 0.7,14.5,0.3,2.4,53,'vg','s','AI BC IM'],
  ['cranberry',        'Cranberry',                      'Cranberry | கிராம்பெரி',       'fruit','🔴', 46, 0.5,12.2,0.1,4.6,45,'vg','s','IM GU HH'],
  ['elderberry',       'Elderberry',                     'Elderberry | இல்டர்பெரி',      'fruit','🫐', 73, 0.7,18.4,0.5,7.0,52,'vg','s','IM AI'],
  ['raspberries',      'Raspberry',                      'Raspberry | ராஸ்பெரி',         'fruit','🍓', 52, 1.2,11.9,0.7,6.5,40,'vg','s','HF AI LF'],
  ['blackberry',       'Blackberry',                     'Blackberry | கருப்பு பெர்ரி',  'fruit','🫐', 43, 1.4, 9.6,0.5,5.3,25,'vg','s','HF AI IR'],

  // ── TROPICAL FRUITS ──────────────────────────────────────────────────────────
  ['papaya',           'Papaya (Paw Paw)',               'Papaya | பப்பாளி | पपीता',      'fruit','🍈', 43, 0.5,11.0,0.3,1.7,59,'vg','s','IM GU LG AI DF'],
  ['papaya_raw',       'Raw Green Papaya',               'Kachchi Papita | பச்சை பப்பாளி','fruit','🍈', 32, 0.5, 7.6,0.1,0.9,35,'vg','a','LG GU DT'],
  ['pineapple',        'Pineapple',                      'Ananas | அன்னாசி | अनानास',    'fruit','🍍', 50, 0.5,13.1,0.1,1.4,59,'vg','s','IM GU AI'],
  ['guava',            'Guava',                          'Guava | கொய்யா | अमरूद',        'fruit','🍐', 68, 2.6,14.3,1.0,5.4,31,'vg','s','IM HF DF LG PC'],
  ['guava_pink',       'Pink Guava',                     'Pink Guava | ரோஜா கொய்யா',     'fruit','🍐', 68, 2.5,14.2,0.9,5.2,31,'vg','s','IM HF LG'],
  ['jackfruit_ripe',   'Ripe Jackfruit (Chakka)',        'Chakka | பலா | कटहल',          'fruit','💚', 95, 1.7,23.2,0.6,1.5,50,'vg','s','ED GU'],
  ['jackfruit_raw',    'Raw Jackfruit',                  'Pacha Chakka | இளம் பலா',      'vegetable','💚', 51, 2.0,11.4,0.2,1.5,40,'vg','ld','HP HF TR GF'],
  ['breadfruit',       'Breadfruit',                     'Breadfruit | ஈரப்பல | ब्रेडफ्रूट','fruit','🍈', 103, 1.1,27.1,0.2,4.9,50,'vg','l','HF ED GF TR'],
  ['starfruit',        'Star Fruit (Kamrakh)',           'Kamrakh | கமரக் | करमबोला',    'fruit','⭐', 31, 1.0, 6.7,0.3,2.8,30,'vg','s','IM LG LF'],
  ['dragon_fruit',     'Dragon Fruit',                   'Dragon Fruit | ட்ராகன் பழம்',  'fruit','🐉', 60, 1.2,13.0,0.4,3.0,50,'vg','s','IM AI LG'],
  ['passion_fruit',    'Passion Fruit (Krishna Phal)',   'Krishna Phal | பேஷன் பழம்',    'fruit','🟡', 97, 2.2,23.4,0.7,10.4,30,'vg','s','HF IM AI LG'],
  ['rambutan',         'Rambutan',                       'Rambutan | ராம்புட்டான்',       'fruit','🔴', 82, 0.7,20.9,0.2,0.9,50,'vg','s','IM'],
  ['mangosteen',       'Mangosteen (Kokum)',              'Mangosteen | மாங்கோஸ்டீன்',    'fruit','🟣', 73, 0.4,17.9,0.6,1.8,44,'vg','s','AI IM'],
  ['persimmon',        'Persimmon (Tendu)',              'Tendu | தேண்டு | तेंदू',        'fruit','🟠', 70, 0.6,18.6,0.2,3.6,50,'vg','s','HF AI'],
  ['lychee',           'Lychee (Litchi)',                'Litchi | லிச்சி | लीची',        'fruit','🍓', 66, 0.8,17.0,0.4,1.3,50,'vg','s','IM HH'],
  ['longan',           'Longan',                         'Longan | லோங்கான்',             'fruit','🟤', 60, 1.3,15.1,0.1,1.1,50,'vg','s','IM'],
  ['lanzones',         'Lanzones / Langsat',             'Langsat | லான்சோனஸ்',           'fruit','🟡', 57, 1.0,14.2,0.2,0.8,52,'vg','s','IM'],
  ['soursop',          'Soursop (Lakshmi Phal)',         'Lakshmi Phal | சவர்சோப்',       'fruit','🍈', 66, 1.0,16.8,0.3,3.3,40,'vg','s','AI IM BC'],
  ['custard_apple',    'Custard Apple (Sitaphal)',       'Sitaphal | சீதாப்பழம் | सीताफल','fruit','💚', 75, 1.7,17.7,0.6,2.4,54,'vg','s','ED CR BO'],
  ['sapota_chikoo',    'Sapota / Chikoo',               'Chikoo | சப்போட்டா | चीकू',     'fruit','🟤', 83, 0.4,20.0,1.1,5.3,55,'vg','s','HF IR GU'],

  // ── MELON FAMILY ────────────────────────────────────────────────────────────
  ['watermelon',       'Watermelon',                     'Tarbooz | தர்பூசணி | तरबूज',   'fruit','🍉', 30, 0.6, 7.6,0.2,0.4,72,'vg','s','HT LF IM DT'],
  ['muskmelon',        'Muskmelon (Kharbooja)',          'Kharbooja | கஸ்தூரி | खरबूजा', 'fruit','🍈', 34, 0.8, 8.2,0.2,0.9,65,'vg','s','HT IM LF'],
  ['cantaloupe',       'Cantaloupe',                     'Cantaloupe | கேன்டலூப்',        'fruit','🍈', 34, 0.8, 8.2,0.2,0.9,65,'vg','s','IM VD'],
  ['honeydew_melon',   'Honeydew Melon',                 'Honeydew | ஹணிடியூ',           'fruit','🍈', 36, 0.5, 9.1,0.1,0.8,65,'vg','s','HT LF'],
  ['tinda',            'Tinda / Round Gourd',            'Tinda | திண்டை | टिंडा',       'vegetable','🟢', 21, 1.0, 4.6,0.2,1.5,35,'vg','ld','LF LS WL'],
  ['ash_gourd',        'Ash Gourd (Winter Melon)',       'Petha | பேசுக்காய் | पेठा',    'vegetable','💚', 13, 0.4, 3.0,0.2,2.9,35,'vg','ld','LF WL DT AY'],

  // ── STONE FRUITS ─────────────────────────────────────────────────────────────
  ['peach',            'Peach (Aadoo)',                  'Aadoo | பீச் | आड़ू',           'fruit','🍑', 39, 0.9, 9.5,0.3,1.5,42,'vg','s','LG LF IM'],
  ['plum',             'Plum (Alucha)',                  'Alucha | அலூஷா | आलूबुखारा',   'fruit','🍑', 46, 0.7,11.4,0.3,1.4,40,'vg','s','LG AI'],
  ['apricot',          'Apricot (Khubani)',              'Khubani | குப்பானி | खुबानी',   'fruit','🍑', 48, 1.4,11.1,0.4,2.0,57,'vg','s','VD IR IM'],
  ['apricot_dried',    'Dried Apricot',                  'Sukhi Khubani | உலர் குப்பானி','fruit','🟠',241, 3.4,62.6,0.5,7.3,30,'vg','s','IR BO HF'],
  ['cherry',           'Cherry',                         'Cherry | செர்ரி | चेरी',        'fruit','🍒', 63, 1.1,16.0,0.2,2.1,63,'vg','s','AI IM'],
  ['fig_fresh',        'Fresh Fig (Anjeer)',             'Anjeer | அத்தி | अंजीर',        'fruit','🟤', 74, 0.8,19.2,0.3,2.9,61,'vg','s','CR IR BO HF'],
  ['fig_dried',        'Dried Fig',                      'Sukha Anjeer | உலர் அத்தி',    'fruit','🟤',249, 3.3,63.9,0.9,9.8,40,'vg','s','IR CR BO HF ED'],

  // ── GRAPES ──────────────────────────────────────────────────────────────────
  ['grapes_black',     'Black Grapes',                   'Kali Angoor | கருப்பு திராட்சை | काली अंगूर','fruit','🍇', 69, 0.6,18.1,0.2,0.9,59,'vg','s','AI HH'],
  ['grapes_green',     'Green Grapes (Seedless)',        'Hara Angoor | பச்சை திராட்சை', 'fruit','🍏', 67, 0.6,17.5,0.4,0.9,59,'vg','s','HH'],
  ['grapes_red',       'Red Grapes',                     'Laal Angoor | சிவப்பு திராட்சை','fruit','🍇', 70, 0.7,18.1,0.2,0.9,59,'vg','s','AI HH'],
  ['raisins',          'Raisins (Kishmish)',             'Kishmish | கிஷ்மிஷ் | किशमिश','fruit','🍇',299, 3.1,79.2,0.5,3.7,64,'vg','s','IR ED CR BO'],
  ['sultanas',         'Sultanas / Golden Raisins',      'Munakka | முனக்கா',             'fruit','🍇',298, 2.6,78.4,0.4,2.9,64,'vg','s','IR ED'],
  ['currants',         'Dried Currants',                 'Currants | கருந்திராட்சை',     'fruit','🍇',283, 4.0,73.4,0.5,6.8,55,'vg','s','IR HF'],

  // ── APPLES & PEARS ──────────────────────────────────────────────────────────
  ['apple_red',        'Apple (Red)',                    'Seb | ஆப்பிள் | सेब',          'fruit','🍎', 52, 0.3,13.8,0.2,2.4,38,'vg','s','GU HF LG'],
  ['apple_green',      'Apple (Granny Smith)',           'Hari Seb | பச்சை ஆப்பிள்',    'fruit','🍏', 58, 0.4,13.6,0.2,2.8,38,'vg','s','GU HF LG DF'],
  ['apple_shimla',     'Shimla Apple',                   'Shimla Seb | ஷிம்லா ஆப்பிள்', 'fruit','🍎', 52, 0.3,13.5,0.2,2.4,38,'vg','s','GU HF'],
  ['pear',             'Pear (Nashpati)',                'Nashpati | பேரிக்காய் | नाशपाती','fruit','🍐', 57, 0.4,15.2,0.1,3.1,38,'vg','s','HF GU LG'],
  ['pear_chinese',     'Chinese Pear',                   'Chinese Pear | சீன பேரிக்காய்','fruit','🍐', 42, 0.5,10.6,0.1,3.6,30,'vg','s','HF GU LG'],

  // ── RARE / TRADITIONAL INDIAN FRUITS ────────────────────────────────────────
  ['amla',             'Amla (Indian Gooseberry)',       'Nellikai | நெல்லிக்காய் | आंवला','fruit','🫑', 58, 0.9,13.7,0.1,3.4,40,'vg','s','IM IR AI DT AY'],
  ['bael',             'Bael / Wood Apple',             'Bael | வில்வம் | बेल',          'fruit','🟡', 83, 1.8,18.8,0.3,2.9,40,'vg','s','GU DT AY TR'],
  ['ber_jujube',       'Ber / Indian Jujube',           'Ber | இலந்தை | बेर',            'fruit','🟤', 79, 1.2,20.2,0.2,0.6,55,'vg','s','IM IR'],
  ['kokum',            'Kokum (Garcinia)',               'Kokum | கோகும் | कोकम',         'fruit','🟣', 61, 0.9,13.8,0.6,3.0,35,'vg','s','GU AI IM DT TR'],
  ['tamarind',         'Tamarind (Imli)',                'Puli | புளி | इमली',            'spice','🟫',239, 2.8,62.5,0.6,5.1,65,'vg','a','IR GU IM TR'],
  ['dates',            'Dates (Khajoor)',                'Khajoor | பேரீச்சம்பழம் | खजूर','fruit','🟤',277, 1.8,75.0,0.2,6.7,42,'vg','s','IR ED FR MR BO'],
  ['palm_fruit',       'Palm Fruit (Nungu / Ice Apple)','Nungu | நுங்கு | ताड़ का फल',   'fruit','⚪', 43, 0.8,10.9,0.3,1.0,40,'vg','s','HT DT TR'],
  ['karpit',           'Jackfruit Seed (Chakka Kuru)',  'Chakka Kuru | சக்க விதை',      'legume','🟤', 98, 2.0,22.0,0.4,2.5,50,'vg','l','HP GF TR'],
  ['sandapazham',      'Wild Indian Fig',               'Attipazham | அத்திப்பழம்',      'fruit','🟤', 74, 0.8,19.2,0.3,2.9,55,'vg','s','HF'],
  ['kavalam_pazham',   'Karpoora Valli Banana (Tiny)',  'Karpoora Valli | கற்பூரவள்ளி', 'fruit','🍌', 90, 1.1,23.5,0.3,2.5,47,'vg','s','TR GU'],

  // ── DRIED FRUITS ─────────────────────────────────────────────────────────────
  ['prunes',           'Prunes / Dried Plum',           'Prunes | உலர் பழம் | सूखे आलूबुखारे','fruit','🟤',240, 2.2,63.9,0.4,7.1,29,'vg','s','IR HF GU LG DF'],
  ['dates_medjool',    'Medjool Dates',                 'Medjool Khajoor | மேட்ஜூல் ஈச்சம்பழம்','fruit','🟤',277, 2.0,75.0,0.1,6.7,42,'vg','s','IR ED MR'],
  ['black_currant',    'Black Currant (Dried)',         'Kali Currant | கருப்பு கிஸ்மிஸ்','fruit','🟣',283, 3.5,63.5,0.4,7.9,55,'vg','s','IR HF AI'],
  ['dried_berries',    'Mixed Dried Berries',           'Mixed Berries | மிக்ஸ் பெர்ரி', 'fruit','🫐',300, 2.0,75.0,0.5,6.0,55,'vg','s','AI HF IR'],

  // ── AVOCADO & EXOTIC ────────────────────────────────────────────────────────
  ['avocado',          'Avocado',                        'Avocado | அவகாடோ | एवोकाडो',   'fruit','🥑',160, 2.0, 8.5,14.7,6.7,10,'vg','s','HH O3 MR FR'],
  ['kiwi',             'Kiwi Fruit',                     'Kiwi | கிவி | कीवी',           'fruit','🥝', 61, 1.1,14.7,0.5,3.0,52,'vg','s','IM VD GU'],
  ['pomegranate',      'Pomegranate (Anar)',              'Anar | மாதுளை | अनार',          'fruit','🔴', 83, 1.7,18.7,1.2,4.0,35,'vg','s','AI HH IR PCOD HT'],
  ['fig_banana',       'Figs with Banana',              'Fig Banana Mix | திக்கி',        'fruit','🟤', 80, 1.0,19.0,0.5,3.5,50,'vg','s','HF IR BO'],
  ['coconut_fresh',    'Fresh Coconut (Nariyal)',        'Thenga | தேங்காய் | नारियल',   'fruit','🥥',354, 3.3,15.2,33.5,9.0,45,'vg','a','ED HH ST TR'],
  ['coconut_tender',   'Tender Coconut Meat',            'Ilaneer Kopra | இளம் தேங்காய்','fruit','🥥', 96, 1.0,14.1, 3.3,0.9,55,'vg','s','GU HT'],
  ['coconut_water',    'Coconut Water (Nariyal Pani)',   'Ilaneer | இளநீர் | नारियल पानी','beverage','🥥', 19, 0.7, 3.7,0.2,1.1,54,'vg','s','HT GU DT'],

  // ── AVOCADO FAMILY & MORE ────────────────────────────────────────────────────
  ['sapodilla',        'Sapodilla / Chikoo',            'Chiku | சப்போட்டா',              'fruit','🟤', 83, 0.4,20.0,1.1,5.3,55,'vg','s','GU IR HF'],
  ['rose_apple',       'Rose Apple (Jambu)',             'Jambu | ஜாம்பு',               'fruit','🍏', 25, 0.6, 5.7,0.3,1.1,20,'vg','s','IM LF LG'],
  ['wax_apple',        'Wax Apple / Java Apple',        'Java Apple | ஜாவா ஆப்பிள்',   'fruit','🔴', 32, 0.6, 7.2,0.3,0.4,35,'vg','s','LF LS'],
  ['banana_blossom',   'Banana Flower Stir Fry',        'Vazhaipoo Poriyal | வாழைப்பூ',  'vegetable','🌸', 55, 1.6,13.0,0.6,5.7,35,'vg','ld','IR CR HF TR'],

  // ── MANGOES (MORE VARIETIES) ─────────────────────────────────────────────────
  ['mango_himsagar',   'Himsagar Mango',                'Himsagar | ஹிம்சாகர்',          'fruit','🥭', 65, 0.9,16.5,0.4,1.8,52,'vg','s','IM'],
  ['mango_safeda',     'Safeda Mango (Lucknow)',        'Safeda Aam | சஃபேடா',           'fruit','🥭', 62, 0.8,15.5,0.3,1.6,51,'vg','s','IM'],
  ['mango_pairi',      'Pairi Mango',                   'Pairi | பைரி',                  'fruit','🥭', 60, 0.7,14.8,0.3,1.5,50,'vg','s','IM'],

  // ── POMEGRANATE / PASSION / EXOTIC ──────────────────────────────────────────
  ['jackfruit_seeds',  'Jackfruit Seeds (Boiled)',       'Chakka Kuru | சக்க விதை | कटहल बीज','legume','🟤', 98, 2.0,22.0,0.4,2.5,50,'vg','l','TR GF'],
  ['velvet_tamarind',  'Velvet Tamarind (Kodukkaapuli)','Kodukkaapuli | கொடுக்காபுளி',  'fruit','🟫', 65, 0.9,15.0,0.3,3.0,35,'vg','s','IM TR'],
  ['wood_apple_ripe',  'Ripe Wood Apple / Bael',        'Vilvam | வில்வம்பழம்',          'fruit','🟡', 83, 1.8,18.8,0.3,2.9,40,'vg','s','GU AY TR'],
  ['cucumber',         'Cucumber',                       'Vellarikkai | வெள்ளரிக்காய் | खीरा','vegetable','🥒', 15, 0.6, 3.6,0.1,0.5,15,'vg','s','HT LF LG WL DT'],
]

export default makeFoods(rows)
