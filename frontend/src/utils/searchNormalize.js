/**
 * Indian food search normalization
 *
 * Handles:
 *  1. Joined words:   "moongdhal" → "moong dal"
 *  2. Regional names: "karuppu kavuni arisi" → "black rice"
 *  3. Spelling variants: "idly" → "idli", "dosai" → "dosa"
 *  4. Common shortenings: "chole" → "chickpea chole"
 */

// Map of canonical query expansions (key → array of extra search terms)
// When any key matches (anywhere in query), its terms are ADDED to the search
const ALIAS_MAP = {
  // Millets
  'ragi':          ['finger millet', 'nachni'],
  'bajra':         ['pearl millet'],
  'jowar':         ['sorghum'],
  'foxtail millet':['thinai', 'kangni'],
  'kodo millet':   ['varagu'],
  'barnyard millet':['kuthiraivali', 'sama'],
  'little millet': ['samai', 'kutki'],
  'proso millet':  ['pani varagu', 'chena'],

  // Dals / Legumes
  'moong':         ['green gram', 'moong dal', 'mung'],
  'moongdal':      ['moong dal', 'green gram', 'mung'],
  'moongdhal':     ['moong dal', 'green gram', 'mung'],
  'moong dhal':    ['moong dal'],
  'masoor':        ['red lentil', 'masoor dal'],
  'toor':          ['pigeon pea', 'arhar', 'tur dal'],
  'arhar':         ['toor dal', 'pigeon pea'],
  'urad':          ['black gram', 'urad dal'],
  'chana':         ['chickpea', 'chana dal'],
  'kaala chana':   ['black chickpea', 'kala chana'],
  'kabuli chana':  ['white chickpea'],
  'rajma':         ['kidney bean', 'rajma'],
  'lobia':         ['black eyed pea', 'cowpea'],
  'horsegram':     ['kulthi', 'kollu'],
  'kulthi':        ['horse gram', 'horsegram'],
  'kollu':         ['horse gram'],
  'moth bean':     ['matki', 'turkish gram'],
  'matki':         ['moth bean'],

  // Rice varieties
  'kavuni arisi':      ['black rice', 'purple rice', 'kavuni'],
  'karuppu kavuni':    ['black rice', 'purple rice'],
  'karuppu kavuni arisi': ['black rice'],
  'kavunarisi':        ['black rice'],
  'red rice':          ['kerala matta', 'rosematta'],
  'brown rice':        ['whole grain rice'],
  'basmati':           ['basmati rice', 'long grain rice'],
  'sona masoori':      ['sona masuri', 'medium grain rice'],
  'ponni':             ['ponni rice', 'boiled rice'],
  'parboiled rice':    ['ukda chawal', 'ponni'],
  'matta rice':        ['kerala red rice', 'rosematta'],
  'forbidden rice':    ['black rice', 'kavuni arisi'],
  'broken rice':       ['akki tari', 'congee rice'],

  // Juices / Drinks
  'melon juice':    ['muskmelon', 'watermelon', 'cantaloupe'],
  'sugarcane juice':['ganne ka ras', 'cane juice'],
  'coconut water':  ['tender coconut', 'nariyal pani'],
  'buttermilk':     ['chaas', 'majjiga', 'neer mor'],
  'lassi':          ['yogurt drink', 'dahi lassi'],
  'kanji':          ['fermented rice drink', 'ragi kanji'],
  'thandai':        ['milk drink', 'spiced milk'],
  'panakam':        ['jaggery drink'],
  'nannari':        ['sarsaparilla syrup'],

  // Vegetables (regional names)
  'drumstick':     ['moringa', 'murungakkai', 'sahjan'],
  'murungakkai':   ['drumstick', 'moringa'],
  'brinjal':       ['eggplant', 'baingan', 'kathirikkai'],
  'baingan':       ['eggplant', 'brinjal'],
  'ladies finger': ['okra', 'bhindi', 'vendakkai'],
  'bhindi':        ['okra', 'ladies finger'],
  'vendakkai':     ['okra', 'ladies finger'],
  'bitter gourd':  ['karela', 'pavakkai', 'bitter melon'],
  'karela':        ['bitter gourd', 'bitter melon'],
  'bottle gourd':  ['lauki', 'sorakkai', 'dudhi'],
  'lauki':         ['bottle gourd', 'dudhi'],
  'ridge gourd':   ['turai', 'peerkangai'],
  'snake gourd':   ['chichinda', 'podalangai'],
  'raw banana':    ['kache kela', 'valakkai', 'plantain'],
  'plantain':      ['raw banana', 'valakkai'],
  'yam':           ['suran', 'elephant yam', 'senaikizhangu'],
  'arbi':          ['colocasia', 'taro root', 'arbi'],
  'taro':          ['arbi', 'colocasia'],
  'beetroot':      ['beet', 'chukandar'],
  'raw papaya':    ['green papaya', 'kache papita'],

  // Fruits (alternate names)
  'chikoo':        ['sapota', 'sapodilla'],
  'sitaphal':      ['custard apple', 'sharifa'],
  'custard apple': ['sitaphal', 'sharifa'],
  'kokum':         ['garcinia indica', 'mangosteen'],
  'wood apple':    ['bael', 'elephant apple'],
  'bael':          ['wood apple'],
  'mulberry':      ['shahtoot'],
  'star fruit':    ['carambola', 'kamrakh'],
  'phalsa':        ['sherbet berry'],

  // Nuts / Seeds (regional)
  'kaju':          ['cashew'],
  'badaam':        ['almond'],
  'akhrot':        ['walnut'],
  'pista':         ['pistachio'],
  'til':           ['sesame', 'ellu'],
  'ellu':          ['sesame', 'til'],
  'alsi':          ['flaxseed', 'linseed'],
  'sabja':         ['basil seeds', 'chia'],
  'sunflower seeds':['surajmukhi beej'],
  'pumpkin seeds': ['kaddu ke beej'],

  // Dairy / Fermented
  'curd':          ['yogurt', 'dahi'],
  'dahi':          ['yogurt', 'curd'],
  'paneer':        ['cottage cheese', 'Indian cheese'],
  'ghee':          ['clarified butter'],
  'khoa':          ['mawa', 'dried milk'],
  'mawa':          ['khoa', 'milk solid'],
  'chaas':         ['buttermilk', 'thin buttermilk'],

  // Dishes (alternate spellings)
  'idly':          ['idli'],
  'idlies':        ['idli'],
  'dosai':         ['dosa'],
  'appam':         ['rice pancake', 'hoppers'],
  'puttu':         ['steamed rice cake'],
  'kozhukattai':   ['modak', 'rice dumpling'],
  'modak':         ['kozhukattai', 'rice dumpling'],
  'vada':          ['medu vada', 'doughnut fritter'],
  'medu vada':     ['urad dal vada'],
  'pongal':        ['ven pongal', 'khichdi rice'],
  'bisibele bath': ['bisi bele bath', 'bisibelebath'],
  'bisibelebath':  ['bisi bele bath'],
  'curd rice':     ['thayir sadam', 'yogurt rice', 'bagala bath'],
  'thayir sadam':  ['curd rice', 'yogurt rice'],
  'rasam':         ['pepper soup', 'saaru'],
  'dal tadka':     ['dal fry', 'tempering dal'],
  'dal fry':       ['tadka dal'],
  'aloo':          ['potato', 'aaloo'],
  'aloo paratha':  ['potato stuffed flatbread'],
  'poori':         ['puri'],
  'roti':          ['chapati', 'phulka', 'flatbread'],
  'chapati':       ['roti', 'phulka'],
  'naan':          ['tandoor bread', 'leavened flatbread'],
  'upma':          ['rava upma', 'semolina breakfast'],
  'poha':          ['flattened rice', 'aval', 'chivda'],
  'aval':          ['poha', 'flattened rice'],
  'sabudana':      ['tapioca pearls', 'sago'],
  'khichdi':       ['khichri', 'rice lentil porridge'],
  'halwa':         ['sheera', 'sooji halwa'],
  'sheera':        ['halwa', 'sooji'],

  // Spices / Condiments
  'jeera':         ['cumin'],
  'ajwain':        ['carom seeds', 'thymol seeds'],
  'methi':         ['fenugreek'],
  'fenugreek':     ['methi', 'vendhayam'],
  'hing':          ['asafoetida'],
  'haldi':         ['turmeric'],
  'turmeric':      ['haldi'],
  'dhania':        ['coriander'],
  'kalonji':       ['nigella seeds', 'black onion seeds'],
  'mustard':       ['sarson', 'kadugu'],
  'curry leaves':  ['kadi patta', 'kariveppilai'],

  // Proteins (non-veg)
  'chicken breast':['murgh tikka', 'boneless chicken'],
  'chicken tikka': ['murgi tikka'],
  'butter chicken':['murgh makhani', 'murgi makhani'],
  'mutton':        ['goat meat', 'lamb', 'gosht'],
  'gosht':         ['mutton', 'goat meat'],
  'keema':         ['minced meat', 'qeema'],
  'fish curry':    ['meen kulambu', 'meen kuzhambu'],
  'meen':          ['fish', 'machli'],
  'machli':        ['fish'],
  'jheenga':       ['prawn', 'shrimp'],
  'prawn':         ['shrimp', 'jheenga', 'chingri'],
  'shrimp':        ['prawn', 'jheenga'],
  'chingri':       ['prawn', 'bengali prawn'],
  'crab':          ['kekda', 'nandu', 'crab curry'],
  'nandu':         ['crab'],
  'bangda':        ['mackerel', 'indian mackerel'],
  'pomfret':       ['paplet', 'white pomfret'],
  'paplet':        ['pomfret'],
  'surmai':        ['king fish', 'seer fish'],
  'rawas':         ['indian salmon', 'salmon'],
  'rohu':          ['rohu fish', 'freshwater fish'],
  'hilsa':         ['ilish', 'herring'],
  'ilish':         ['hilsa'],
  'sardinei':      ['sardine', 'mathi', 'chalai'],
  'mathi':         ['sardine', 'anchovy'],
  'nethili':       ['anchovies', 'dried fish'],
  'karuvadu':      ['dried fish', 'dried prawns'],
  'egg curry':     ['anda curry', 'muttai curry'],
  'boiled egg':    ['ubla anda', 'hard boiled egg'],
  'egg bhurji':    ['anda bhurji', 'scrambled egg'],
  'anda':          ['egg', 'egg recipe'],

  // Health / Wellness foods
  'wheatgrass':    ['gehun ka ras'],
  'ashwagandha':   ['winter cherry', 'Indian ginseng'],
  'brahmi':        ['bacopa'],
  'shatavari':     ['wild asparagus'],
  'triphala':      ['herbal blend', 'ayurvedic supplement'],
  'chyawanprash':  ['herbal jam', 'ayurvedic jam'],
  'sattu':         ['roasted gram flour', 'sattu powder'],
  'makhana':       ['foxnuts', 'lotus seeds', 'phool makhana'],
  'foxnuts':       ['makhana', 'lotus seeds'],
  'murmura':       ['puffed rice', 'kurmura'],
  'puffed rice':   ['murmura', 'muri'],
}

/**
 * Normalize a search query for local food database matching.
 * Returns an array of search terms (original + expanded) to OR-match.
 */
export function expandSearchTerms(query) {
  const q = query.toLowerCase().trim()

  // Collect all matching alias expansions
  const extras = new Set()

  for (const [key, values] of Object.entries(ALIAS_MAP)) {
    if (q === key || q.includes(key) || key.includes(q)) {
      values.forEach((v) => extras.add(v.toLowerCase()))
    }
  }

  // Also split joined words (moongdhal → moong + dhal)
  // Insert spaces before transitions: lowercase→lowercase is kept, find runs of alpha
  const deJoined = q
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase
    .toLowerCase()

  // Return unique terms
  return [q, deJoined, ...extras].filter(Boolean)
}

/**
 * Check if a food item matches a search query (using expanded terms).
 * Used in RecipesPage filteredRecipes.
 */
export function foodMatchesQuery(item, searchTerms) {
  const haystack = [
    item.name,
    item.name_regional,
    item.state,
    item.description,
    ...(item.health_tags  || []),
    ...(item.cuisine_tags || []),
    item.category,
  ].join(' ').toLowerCase()

  return searchTerms.some((term) => haystack.includes(term))
}
