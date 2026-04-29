import { makeFoods } from './base.js'

const rows = [
  // ── PASTA & NOODLES ──────────────────────────────────────────────────────────
  ['pasta_raw',         'Pasta (dry)',                 'Pasta | பாஸ்தா | पास्ता',             'grain','🍝',371,13.0,74.7, 1.5, 2.5,55,'vg','ld','MR HP'],
  ['pasta_cooked',      'Pasta (cooked, plain)',       'Pasta Pakka | வேகவைத்த பாஸ்தா',    'grain','🍝',131, 5.0,25.0, 1.1, 1.8,55,'vg','ld','MR'],
  ['spaghetti',         'Spaghetti (cooked)',          'Spaghetti | ஸ்பகெட்டி',              'grain','🍝',131, 5.0,25.0, 1.1, 1.8,55,'vg','ld','MR'],
  ['penne',             'Penne Pasta (cooked)',        'Penne | பென்னே',                    'grain','🍝',131, 5.0,25.0, 1.1, 1.8,55,'vg','ld','MR'],
  ['pasta_bolognese',   'Pasta Bolognese',             'Bolognese Pasta | போலோக்னீஸ்',      'dish','🍝',255,13.5,25.5, 9.5, 2.5,55,'nv','ld','HP B12'],
  ['mac_and_cheese',    'Macaroni & Cheese',           'Mac and Cheese | மேக் அண்ட் சீஸ்',  'dish','🍝',320,13.5,35.5,13.0, 1.5,60,'v','ld','HP CR'],
  ['udon_noodles',      'Udon Noodles (cooked)',       'Udon | உடான்',                      'grain','🍜',132, 3.5,27.5, 0.6, 0.5,55,'vg','ld',''],
  ['rice_noodles',      'Rice Noodles (cooked)',       'Rice Noodle | அரிசி நூடுல்',        'grain','🍜',108, 1.8,25.0, 0.2, 0.4,61,'vg','ld','GF'],
  ['glass_noodles',     'Glass Noodles / Vermicelli',  'Glass Noodle | கண்ணாடி நூடுல்',     'grain','🍜',351, 0.2,86.1, 0.1, 0.5,65,'vg','ld','GF'],
  ['instant_noodles',   'Instant Noodles (Maggi type)','Instant Noodle | இன்ஸ்டண்ட் நூடுல்','grain','🍜',458, 8.5,59.5,19.5, 2.0,72,'v','bld','HF'],
  ['ramen',             'Ramen (cooked)',               'Ramen | ராமேன்',                    'dish','🍜',195, 9.0,25.0, 6.5, 1.0,55,'nv','ld','HP B12'],

  // ── BREAD & BAKERY ───────────────────────────────────────────────────────────
  ['white_bread',       'White Bread',                 'Safed Bread | வெள்ளை ரொட்டி | सफेद ब्रेड','grain','🍞',265, 9.0,49.2, 3.2, 2.3,75,'v','b',''],
  ['whole_wheat_bread', 'Whole Wheat Bread',           'Gehun Ka Bread | முழு கோதுமை ரொட்டி','grain','🍞',247,13.0,41.3, 3.5, 6.8,68,'v','b','HF'],
  ['multigrain_bread',  'Multigrain Bread',            'Multigrain Bread | மல்டிக்ரேன் ரொட்டி','grain','🍞',257,11.0,43.5, 4.0, 7.2,65,'v','b','HF'],
  ['sourdough',         'Sourdough Bread',             'Sourdough | சவர்டவ் ரொட்டி',        'grain','🍞',274,10.5,52.0, 1.8, 2.3,54,'v','b',''],
  ['pita_bread',        'Pita Bread',                  'Pita Bread | பிட்டா ரொட்டி | पिटा','grain','🫓',275,10.5,54.0, 1.2, 2.3,57,'v','bld',''],
  ['toast',             'Toast (white bread)',          'Toast | டோஸ்ட் | टोस्ट',             'grain','🍞',314,10.6,58.5, 4.1, 2.6,75,'v','b',''],
  ['bagel',             'Bagel',                       'Bagel | பாகெல்',                     'grain','🥯',270,10.5,53.0, 1.7, 2.3,72,'v','b',''],
  ['croissant',         'Croissant',                   'Croissant | க்ரோய்சாண்ட்',           'grain','🥐',406,8.2,45.8,21.0, 1.8,67,'v','b',''],
  ['burger_bun',        'Burger Bun',                  'Burger Bun | பர்கர் பன்',            'grain','🍞',270,9.5,49.5, 4.2, 2.0,72,'v','bld',''],

  // ── FAST FOOD ────────────────────────────────────────────────────────────────
  ['veg_burger',        'Veg Burger',                  'Veg Burger | வெஜ் பர்கர்',           'dish','🍔',295,10.5,42.5, 9.0, 3.5,60,'v','bld',''],
  ['chicken_burger',    'Chicken Burger',              'Chicken Burger | சிக்கன் பர்கர்',    'dish','🍔',390,21.5,37.5,17.5, 2.5,65,'nv','bld','HP B12'],
  ['french_fries',      'French Fries',                'French Fries | ஃப்ரெஞ்ச் ஃப்ரைஸ்', 'dish','🍟',312, 3.4,41.0,15.0, 3.5,75,'vg','bld',''],
  ['pizza_margherita',  'Pizza Margherita',            'Pizza | பீட்ஜா | पिज्जा',            'dish','🍕',250,11.5,31.5, 8.5, 2.0,65,'v','bld','HP CR'],
  ['pizza_pepperoni',   'Pepperoni Pizza',             'Pepperoni Pizza | பெப்பரோனி பீட்ஜா', 'dish','🍕',295,13.5,28.5,13.5, 2.0,65,'nv','bld','HP B12'],
  ['hotdog',            'Hot Dog',                     'Hot Dog | ஹாட் டாக்',                'dish','🌭',290,11.0,26.5,15.5, 1.0,65,'nv','bld','HP B12'],
  ['sandwich_veg',      'Veg Sandwich',                'Veg Sandwich | வெஜ் சாண்ட்விச்',    'dish','🥪',220, 8.5,30.5, 6.5, 3.5,60,'v','bld','HF'],
  ['sandwich_chicken',  'Chicken Sandwich',            'Chicken Sandwich | சிக்கன் சாண்ட்விச்','dish','🥪',295,18.5,27.0,11.5, 2.5,60,'nv','bld','HP B12'],
  ['shawarma_chicken',  'Chicken Shawarma',            'Chicken Shawarma | சிக்கன் ஷவர்மா', 'dish','🌯',315,18.5,30.5,12.5, 2.5,55,'nv','bld','HP B12'],
  ['shawarma_veg',      'Veg Shawarma',                'Veg Shawarma | வெஜ் ஷவர்மா',        'dish','🌯',270, 8.5,33.5, 9.5, 3.5,55,'v','bld','HF'],
  ['wrap_veg',          'Veg Wrap / Burrito',          'Veg Wrap | வெஜ் ராப்',               'dish','🌯',275,10.5,35.5, 8.5, 4.5,55,'v','bld','HF'],
  ['tacos',             'Tacos (veg)',                  'Tacos | டேக்கோஸ்',                   'dish','🌮',210, 6.5,28.0, 8.5, 3.5,55,'v','bld','HF'],

  // ── SOUPS ────────────────────────────────────────────────────────────────────
  ['tomato_soup',       'Tomato Soup',                 'Tamatar Ka Shorba | தக்காளி சூப்',   'dish','🍅', 68, 1.8,13.5, 0.5, 1.5,40,'vg','bld','AI IM LF'],
  ['mushroom_soup',     'Cream of Mushroom Soup',      'Mushroom Soup | காளான் சூப்',        'dish','🍄',120, 3.0,11.5, 6.5, 1.0,40,'v','bld',''],
  ['sweet_corn_soup',   'Sweet Corn Soup',             'Sweet Corn Shorba | ஸ்வீட் கார்ன் சூப்','dish','🌽', 85, 3.5,15.5, 1.5, 2.0,50,'v','bld','HF'],
  ['hot_sour_soup',     'Hot and Sour Soup',           'Hot Sour Soup | ஹாட் சவர் சூப்',    'dish','🍲', 78, 5.5,10.0, 2.5, 1.5,35,'v','bld','GU AI'],
  ['chicken_noodle_soup','Chicken Noodle Soup',        'Chicken Noodle Soup | சிக்கன் நூடுல் சூப்','dish','🍜',115, 8.0,13.5, 2.5, 1.5,40,'nv','bld','HP B12'],

  // ── SALADS & BOWLS ───────────────────────────────────────────────────────────
  ['caesar_salad',      'Caesar Salad',                'Caesar Salad | சீஸர் சாலட்',         'dish','🥗',155, 7.5, 8.0,10.5, 2.0,25,'v','bld','CR HF'],
  ['greek_salad',       'Greek Salad',                 'Greek Salad | கிரீக் சாலட்',         'dish','🥗',115, 4.5, 8.5, 7.5, 2.5,30,'v','bld','CR HF AI'],
  ['coleslaw',          'Coleslaw',                    'Coleslaw | கோல்ஸ்லா',               'dish','🥗',145, 1.5,12.5, 9.5, 2.5,35,'v','bld','HF'],
  ['hummus',            'Hummus',                      'Hummus | ஹம்மஸ்',                    'dish','🫘',166, 7.9,14.3, 9.6, 6.0,28,'vg','bld','HP HF BO MR ZR'],
  ['falafel',           'Falafel',                     'Falafel | ஃபலாஃபெல்',               'dish','🫘',333,13.3,31.8,17.8,10.0,28,'vg','bld','HP HF BO'],
  ['tabouleh',          'Tabbouleh Salad',             'Tabouleh | டேபூலே',                  'dish','🥗', 85, 2.5,10.5, 3.5, 3.5,28,'vg','bld','HF AI'],
  ['acai_bowl',         'Acai Bowl',                   'Acai Bowl | அகாயி பவுல்',             'dish','🫐',185, 4.5,36.5, 4.5, 6.5,45,'vg','b','HF AI BO BC'],
  ['grain_bowl',        'Grain Bowl (Quinoa/Brown Rice)','Grain Bowl | கிரெய்ன் பவுல்',     'dish','🥣',280,12.5,35.5, 8.5, 6.5,50,'v','bld','HP HF MR'],

  // ── INTERNATIONAL BREAKFAST ──────────────────────────────────────────────────
  ['pancakes',          'Pancakes',                    'Pancakes | பேன்கேக்',                'dish','🥞',227, 6.0,38.0, 6.5, 1.5,67,'v','b',''],
  ['waffles',           'Waffles',                     'Waffles | வாஃபிள்',                  'dish','🧇',291, 7.9,35.0,14.0, 1.4,75,'v','b',''],
  ['french_toast',      'French Toast',                'French Toast | ஃப்ரெஞ்ச் டோஸ்ட்',   'dish','🍞',229,10.0,27.5, 8.5, 1.5,63,'v','b','HP CR'],
  ['granola',           'Granola (with oats)',          'Granola | கிரானோலா',                 'grain','🥣',471, 9.8,65.0,17.5, 5.0,55,'v','b','HF MR BO'],
  ['muesli',            'Muesli',                      'Muesli | மியூஸ்லி',                  'grain','🥣',348,11.0,61.5, 6.5, 7.0,45,'v','b','HF O3 MR BO'],
  ['corn_flakes',       'Corn Flakes',                 'Corn Flakes | கார்ன் ஃப்லேக்ஸ்',    'grain','🥣',357, 7.5,84.0, 0.4, 1.2,81,'v','b',''],
  ['oatmeal',           'Oatmeal / Porridge',          'Oatmeal | ஓட்மீல்',                  'grain','🥣', 71, 2.5,12.0, 1.5, 1.5,55,'v','b','HF BO MR'],

  // ── DAIRY & ALTERNATIVES ─────────────────────────────────────────────────────
  ['cheese_cheddar',    'Cheddar Cheese',              'Cheddar | செடர் சீஸ்',               'dairy','🧀',402,25.0, 1.3,33.1, 0.0,0,'v','bld','HP CR B12 ZR'],
  ['cheese_mozzarella', 'Mozzarella Cheese',           'Mozzarella | மொட்ஸரல்லா',           'dairy','🧀',280,17.9, 2.2,22.4, 0.0,0,'v','bld','HP CR B12'],
  ['cheese_parmesan',   'Parmesan Cheese',             'Parmesan | பார்மேசன்',               'dairy','🧀',431,38.5, 4.1,29.2, 0.0,0,'v','bld','HP CR B12 ZR'],
  ['cheese_cream',      'Cream Cheese',                'Cream Cheese | க்ரீம் சீஸ்',         'dairy','🧀',349, 6.2, 4.1,34.9, 0.0,0,'v','bld','CR'],
  ['cheese_feta',       'Feta Cheese',                 'Feta | ஃபேடா',                       'dairy','🧀',264,14.2, 4.1,21.3, 0.0,0,'v','bld','CR B12 HP'],
  ['sour_cream',        'Sour Cream',                  'Sour Cream | சவர் க்ரீம்',           'dairy','🫙',193, 2.4, 4.3,18.8, 0.0,0,'v','bld','CR'],
  ['heavy_cream',       'Heavy Cream / Double Cream',  'Heavy Cream | ஹெவி க்ரீம்',         'dairy','🫙',345, 2.8, 2.7,37.0, 0.0,0,'v','bld','VD CR'],
  ['oat_milk',          'Oat Milk',                    'Oat Milk | ஓட் பால்',               'beverage','🥛', 46, 1.0, 8.3, 1.5, 0.8,40,'vg','b','HF'],
  ['coconut_milk_thin', 'Coconut Milk (thin)',         'Patal Nariyal Doodh | மெல்லிய தேங்காய் பால்','beverage','🥛', 19, 0.2, 2.7, 0.8, 0.2,35,'vg','bld','GF'],
  ['rice_milk',         'Rice Milk',                   'Chawal Ka Doodh | அரிசி பால்',       'beverage','🥥', 47, 0.3, 9.2, 1.0, 0.2,86,'vg','b','GF'],

  // ── CONDIMENTS & SAUCES ──────────────────────────────────────────────────────
  ['ketchup',           'Tomato Ketchup',              'Tamatar Sauce | தக்காளி சாஸ்',       'condiment','🍅',112, 1.4,25.7, 0.2, 0.3,45,'vg','a',''],
  ['mayonnaise',        'Mayonnaise',                  'Mayonnaise | மயோனைஸ்',               'condiment','🫙',680, 1.0, 0.6,74.8, 0.0,0,'v','a',''],
  ['mustard_sauce',     'Mustard Sauce',               'Mustard Sauce | கடுகு சாஸ்',         'condiment','🫙', 66, 4.4, 8.1, 3.3, 2.0,0,'vg','a',''],
  ['soy_sauce',         'Soy Sauce',                   'Soya Sauce | சோயா சாஸ் | सोया सॉस', 'condiment','🫙', 60, 5.6, 5.6, 0.1, 0.8,0,'vg','a',''],
  ['hot_sauce',         'Hot Sauce / Chilli Sauce',    'Chilli Sauce | மிளகாய் சாஸ்',        'condiment','🌶️', 30, 1.0, 5.5, 0.5, 1.5,0,'vg','a','AI'],
  ['salsa',             'Tomato Salsa',                 'Salsa | சால்சா',                     'condiment','🍅', 36, 1.5, 7.5, 0.2, 1.5,30,'vg','a','AI LF'],
  ['vinegar_white',     'White Vinegar',               'Safed Sirka | வெள்ளை வினிகர்',       'condiment','🫙', 18, 0.0, 0.0, 0.0, 0.0,0,'vg','a','GF'],
  ['apple_cider_vinegar','Apple Cider Vinegar (ACV)',  'ACV | ஆப்பிள் சைடர் வினிகர்',       'condiment','🫙', 21, 0.0, 0.9, 0.0, 0.0,0,'vg','a','GU AY GF'],

  // ── DESSERTS ─────────────────────────────────────────────────────────────────
  ['chocolate_dark',    'Dark Chocolate (70%+)',       'Dark Chocolate | டார்க் சாக்லேட்',   'sweet','🍫',598, 7.8,46.4,43.1, 10.9,25,'v','s','AI BO BC MR HP'],
  ['chocolate_milk',    'Milk Chocolate',              'Milk Chocolate | மில்க் சாக்லேட்',   'sweet','🍫',535, 7.6,59.4,29.7, 3.4,49,'v','s','CR'],
  ['ice_cream_vanilla', 'Vanilla Ice Cream',           'Vanilla Ice Cream | வெனிலா ஐஸ்க்ரீம்','sweet','🍦',207, 3.5,23.6,11.0, 0.7,57,'v','s','CR VD'],
  ['ice_cream_chocolate','Chocolate Ice Cream',        'Chocolate Ice Cream | சாக்லேட் ஐஸ்க்ரீம்','sweet','🍫',216, 3.8,25.0,11.5, 0.7,50,'v','s','CR'],
  ['yogurt_flavored',   'Flavored Yogurt',             'Flavored Dahi | ஃப்ளேவர்டு தயிர்',  'dairy','🫙',105, 5.5,16.0, 2.5, 0.3,35,'v','s','CR VD'],
  ['brownie',           'Chocolate Brownie',           'Brownie | பிரவுனி',                   'sweet','🍫',466, 5.9,58.5,23.5, 2.5,63,'v','s',''],
  ['cookies',           'Chocolate Chip Cookies',      'Cookies | குக்கீஸ்',                  'sweet','🍪',502, 5.8,65.0,24.5, 1.5,72,'v','s',''],

  // ── INTERNATIONAL GRAINS & SEEDS ─────────────────────────────────────────────
  ['bulgur_wheat',      'Bulgur Wheat',                'Bulgur | புல்கர் கோதுமை | बुलगुर',  'grain','🌾',342,12.3,75.9, 1.3,18.3,46,'vg','ld','HF HP MR'],
  ['polenta',           'Polenta (Cornmeal)',           'Polenta | போலென்டா',                 'grain','🌽',362, 8.1,78.1, 3.6, 7.3,69,'vg','ld','GF'],
  ['freekeh',           'Freekeh (Green Wheat)',        'Freekeh | ஃப்ரீக்கே',               'grain','🌾',350,13.0,65.0, 1.5,16.5,43,'vg','ld','HF HP MR BO'],
  ['farro',             'Farro (Emmer Wheat)',          'Farro | ஃபாரோ',                     'grain','🌾',337,14.0,69.5, 1.5,10.7,40,'vg','ld','HF HP MR'],
  ['spelt',             'Spelt (Ancient Grain)',        'Spelt | ஸ்பெல்ட்',                  'grain','🌾',338,14.6,70.2, 2.4, 7.6,54,'v','ld','HP MR'],
  ['kamut',             'Kamut / Khorasan Wheat',      'Kamut | கமுட்',                      'grain','🌾',337,14.5,71.0, 2.2, 9.5,45,'v','ld','HP MR ZR'],

  // ── INTERNATIONAL LEGUMES ────────────────────────────────────────────────────
  ['black_beans',       'Black Beans',                 'Kali Rajma | கருப்பு பீன்ஸ்',        'legume','⚫',341,21.6,62.4, 1.4,15.5,30,'vg','ld','HP HF IR MR ZR'],
  ['cannellini_beans',  'Cannellini Beans (White)',    'Safed Rajma | வெள்ளை பீன்ஸ்',       'legume','⬜',335,21.0,60.0, 1.0,16.5,31,'vg','ld','HP HF IR MR ZR'],
  ['pinto_beans',       'Pinto Beans',                 'Pinto Beans | பிண்டோ பீன்ஸ்',        'legume','🟤',347,21.4,62.5, 1.2,15.5,30,'vg','ld','HP HF IR MR ZR'],
  ['edamame',           'Edamame (Green Soybean)',     'Hari Soybean | எடாமாமே',             'legume','🟢',122, 11.9, 8.9, 5.2, 5.2,18,'vg','bld','HP HF MR ZR GF'],

  // ── INTERNATIONAL MEATS ──────────────────────────────────────────────────────
  ['beef_steak',        'Beef Steak',                  'Gai Ka Gosht | மாட்டு இறைச்சி | गाय का मांस','meat','🥩',271,26.0, 0.0,17.5, 0.0,0,'nv','ld','HP IR B12 ZR SE'],
  ['beef_mince',        'Beef Mince',                  'Gai Ka Keema | மாட்டு கீமா',         'meat','🥩',332,20.0, 0.0,27.5, 0.0,0,'nv','ld','HP IR B12 ZR'],
  ['turkey_breast',     'Turkey Breast',               'Turkey | டர்க்கி | टर्की',           'meat','🍗',135,29.9, 0.0, 1.8, 0.0,0,'nv','ld','HP B12 ZR LF SE'],
  ['duck_meat',         'Duck Breast',                 'Batakh Ka Gosht | வாத்து இறைச்சி',   'meat','🦆',201,19.7, 0.0,13.0, 0.0,0,'nv','ld','HP B12 ZR IR'],
  ['ham',               'Ham (cured)',                  'Ham | ஹாம்',                         'meat','🍖',163,19.7, 1.5, 8.7, 0.0,0,'nv','bld','HP B12'],
  ['bacon',             'Bacon',                       'Bacon | பேகன்',                       'meat','🥓',541,37.0, 0.4,42.0, 0.0,0,'nv','b','HP B12'],
]

export default makeFoods(rows)
