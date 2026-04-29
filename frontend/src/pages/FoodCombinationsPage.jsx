import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../store/profileStore'
import { mockUserProfile } from '../data/mockRecipes'

// ─── Data ─────────────────────────────────────────────────────────────────────

const SYNERGISTIC = [
  {
    id: 'iron-vitc',
    title: 'Iron + Vitamin C',
    icon: '🥬',
    badge: 'Absorption Booster',
    badgeColor: 'bg-green-100 text-green-700',
    description: 'Vitamin C converts non-heme iron (from plant sources) into its absorbable ferrous form — increasing absorption by up to 3×.',
    mechanism: 'Ascorbic acid reduces Fe³⁺ → Fe²⁺ and chelates iron to keep it soluble in the intestine, preventing inhibition by phytates and tannins.',
    combos: ['Palak dal + lemon juice', 'Ragi mudde + amla chutney', 'Rajma + raw tomato', 'Methi thepla + orange juice', 'Horsegram curry + lemon tadka', 'Drumstick leaves sabzi + amla pickle'],
    benefit: 'Treats iron-deficiency anemia, boosts energy, PCOD management',
    absorption_increase: '2–3×',
    conditions: ['pcod', 'anemia', 'pregnancy', 'general'],
  },
  {
    id: 'calcium-vitd',
    title: 'Calcium + Vitamin D',
    icon: '🥛',
    badge: 'Bone Synergy',
    badgeColor: 'bg-blue-100 text-blue-700',
    description: 'Vitamin D activates calcium-binding proteins in the intestine — without it, only 10–15% of dietary calcium is absorbed.',
    mechanism: 'Calcitriol (active Vit D) induces TRPV6 calcium channels and calbindin proteins in intestinal cells for active calcium transport.',
    combos: ['Fortified milk + morning sunlight (15 min)', 'Curd + egg yolk', 'Paneer with D-fortified cooking oil', 'Ragi + sesame', 'Raagi roti + sunflower seeds', 'Til chutney + outdoor physical activity'],
    benefit: 'Strong bones, prevents osteoporosis, thyroid support',
    absorption_increase: '30–40%',
    conditions: ['thyroid', 'bone_health', 'general'],
  },
  {
    id: 'turmeric-pepper',
    title: 'Turmeric + Black Pepper',
    icon: '🌿',
    badge: 'Anti-Inflammatory',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    description: 'Piperine in black pepper inhibits intestinal metabolism of curcumin, boosting its bioavailability by up to 2000%.',
    mechanism: 'Piperine inhibits glucuronidation enzymes (UGT) and P-glycoprotein transport, keeping curcumin in blood circulation longer.',
    combos: ['Haldi doodh (golden milk) with kali mirch', 'Dal with haldi + black pepper tadka', 'Any sabzi with both haldi and mirch', 'Turmeric rice with cracked pepper', 'Masala chai with turmeric and pepper'],
    benefit: 'Reduces inflammation, joint pain, blood sugar, PCOD',
    absorption_increase: '20×',
    conditions: ['diabetes', 'hypertension', 'pcod', 'anemia', 'general'],
  },
  {
    id: 'fat-vitaminADE',
    title: 'Fat-Soluble Vitamins + Healthy Fat',
    icon: '🫒',
    badge: 'Vitamin Activation',
    badgeColor: 'bg-orange-100 text-orange-700',
    description: 'Vitamins A, D, E, and K are fat-soluble — consuming them with dietary fat is essential for absorption. Without fat, up to 90% is lost.',
    mechanism: 'Dietary fat stimulates bile secretion and micelle formation in the small intestine, which is needed to solubilise fat-soluble vitamins for absorption.',
    combos: ['Carrot sabzi + ghee tadka', 'Spinach curry + sesame oil', 'Sweet potato + coconut oil', 'Moringa leaves + flaxseed oil', 'Methi with til oil', 'Pumpkin with coconut milk'],
    benefit: 'Vision, immunity, bone health, skin, thyroid function',
    absorption_increase: '4–5×',
    conditions: ['thyroid', 'bone_health', 'general'],
  },
  {
    id: 'omega3-vitE',
    title: 'Omega-3 + Vitamin E',
    icon: '🐟',
    badge: 'Brain & Heart',
    badgeColor: 'bg-cyan-100 text-cyan-700',
    description: 'Vitamin E protects omega-3 fatty acids (DHA, EPA) from oxidation, preserving their anti-inflammatory and brain-protective benefits.',
    mechanism: 'Alpha-tocopherol scavenges lipid peroxyl radicals that degrade polyunsaturated fatty acids, extending the bioactivity of omega-3s.',
    combos: ['Flaxseed + almonds', 'Walnuts + sunflower seeds', 'Mackerel curry + mustard oil', 'Chia seeds + almond milk', 'Flaxseed roti + peanut butter'],
    benefit: 'Brain health, reduces inflammation, PCOD hormone balance, heart protection',
    absorption_increase: 'Preserved bioactivity',
    conditions: ['pcod', 'hypertension', 'brain_health', 'general'],
  },
  {
    id: 'magnesium-vitb6',
    title: 'Magnesium + Vitamin B6',
    icon: '🌰',
    badge: 'Metabolic Synergy',
    badgeColor: 'bg-lime-100 text-lime-700',
    description: 'Vitamin B6 facilitates magnesium transport into cells — together they regulate blood sugar, reduce PMS/PCOD symptoms, and improve sleep quality.',
    mechanism: 'Pyridoxine (B6) activates Mg-ATP-dependent enzyme pathways. Magnesium is required cofactor for over 300 B6-dependent reactions including neurotransmitter synthesis.',
    combos: ['Banana + pumpkin seeds', 'Dark leafy greens + whole grains', 'Rajma + brown rice', 'Nuts + fortified cereal', 'Ragi porridge + banana'],
    benefit: 'Blood sugar control, PCOD, stress, better sleep, hormone balance',
    absorption_increase: 'Cellular uptake',
    conditions: ['diabetes', 'pcod', 'general'],
  },
  {
    id: 'zinc-protein',
    title: 'Zinc + Fermented/Animal Protein',
    icon: '🥚',
    badge: 'Immune Boost',
    badgeColor: 'bg-teal-100 text-teal-700',
    description: 'Zinc from plant foods is bound by phytate. Fermenting, soaking, or sprouting legumes reduces phytate, releasing zinc for optimal absorption.',
    mechanism: 'Fermentation activates phytase enzymes that break down phytic acid, freeing zinc from chelation. Animal proteins (cysteine, methionine) also act as zinc absorption ligands.',
    combos: ['Sprouted moong salad', 'Idli / dosa (fermented batter)', 'Soaked and boiled chana curry', 'Curd-based dishes with sesame', 'Egg + pumpkin seeds'],
    benefit: 'Immunity, wound healing, testosterone, PCOD hormone balance',
    absorption_increase: '2×',
    conditions: ['pcod', 'immunity', 'general'],
  },
  {
    id: 'protein-vitc',
    title: 'Plant Protein + Vitamin C',
    icon: '🫘',
    badge: 'Protein Quality',
    badgeColor: 'bg-purple-100 text-purple-700',
    description: 'Vitamin C improves the bioavailability of plant protein by aiding collagen synthesis and reducing oxidative damage to amino acids.',
    mechanism: 'Ascorbic acid regenerates tetrahydrobiopterin (BH4), needed for amino acid hydroxylation and collagen crosslinking from plant protein sources.',
    combos: ['Chana chaat + lemon', 'Moong dal + tomato', 'Soybean curry + capsicum', 'Rajma + raw onion', 'Peanut chutney + amla'],
    benefit: 'Better muscle repair, satiety, collagen synthesis',
    absorption_increase: '15–25%',
    conditions: ['general', 'pcod'],
  },
  {
    id: 'probiotics-prebiotics',
    title: 'Probiotics + Prebiotics (Synbiotic)',
    icon: '🥣',
    badge: 'Gut Health',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    description: 'Probiotics (live bacteria) survive and thrive far better when fed prebiotic fiber. This combination is called a "synbiotic" — the fiber feeds the bacteria.',
    mechanism: 'Prebiotic FOS and inulin (from banana, onion, garlic) selectively fermented by Lactobacillus and Bifidobacterium, producing SCFA (butyrate) that repair gut lining.',
    combos: ['Curd + banana', 'Buttermilk + raw garlic', 'Fermented rice + onion sambar', 'Kanji + drumstick', 'Dahi vada + fiber-rich accompaniment', 'Idli + sambhar with garlic'],
    benefit: 'Gut health, immunity, digestion, IBS relief',
    absorption_increase: '2–4× bacterial colonisation',
    conditions: ['diabetes', 'gut_health', 'general'],
  },
  {
    id: 'folate-b12',
    title: 'Folate + Vitamin B12',
    icon: '🌱',
    badge: 'Cell Health',
    badgeColor: 'bg-green-100 text-green-800',
    description: 'Folate and B12 work together in the methylation cycle — both are needed for DNA synthesis, red blood cell formation, and nerve health.',
    mechanism: 'Methylcobalamin (B12) converts 5-MTHF (active folate) into methionine through methionine synthase reaction. Deficiency of either causes megaloblastic anemia.',
    combos: ['Dal + curd (non-veg: dal + egg)', 'Rajma rice + fortified milk', 'Methi dal + paneer', 'Leafy greens with dairy', 'Sprouted lentils + egg scramble'],
    benefit: 'Prevent neural tube defects, anemia, nerve damage, fertility',
    absorption_increase: 'Synergistic methylation',
    conditions: ['pregnancy', 'pcod', 'anemia', 'general'],
  },
  {
    id: 'selenium-iodine',
    title: 'Selenium + Iodine',
    icon: '🦐',
    badge: 'Thyroid Support',
    badgeColor: 'bg-purple-100 text-purple-700',
    description: 'Selenium is essential for converting inactive T4 thyroid hormone to active T3. Iodine is needed to synthesize T4. Both must be adequate for thyroid health.',
    mechanism: 'Iodothyronine deiodinase enzymes (Types I, II, III) are selenoproteins — without selenium, T4 cannot be converted to active T3. Both deficiencies worsen hypothyroidism.',
    combos: ['Brazil nuts (2/day) + iodized salt in cooking', 'Fish + iodized salt', 'Sesame seeds + seaweed', 'Eggs + fish curry', 'Dairy + coconut (iodine source)'],
    benefit: 'Thyroid function, metabolism, antioxidant protection',
    absorption_increase: 'T4 → T3 conversion',
    conditions: ['thyroid', 'general'],
  },
  {
    id: 'iron-vitaminA',
    title: 'Iron + Vitamin A',
    icon: '🥕',
    badge: 'Iron Mobilisation',
    badgeColor: 'bg-amber-100 text-amber-700',
    description: 'Vitamin A mobilises iron from liver stores and supports its incorporation into hemoglobin — particularly important when dietary iron is adequate but anemia persists.',
    mechanism: 'Retinol regulates transferrin receptor expression and ferroportin activity — the gates that control iron release from storage cells (ferritin → serum iron).',
    combos: ['Carrot + iron-rich dal', 'Sweet potato curry + rajma', 'Liver + carrots (non-veg)', 'Drumstick leaves (high in both)', 'Pumpkin + lentil soup'],
    benefit: 'Combat iron-deficiency anemia especially in children, pregnancy',
    absorption_increase: 'Storage iron release',
    conditions: ['anemia', 'pregnancy', 'pcod', 'general'],
  },
  {
    id: 'vitk2-vitd',
    title: 'Vitamin K2 + Vitamin D3',
    icon: '🦷',
    badge: 'Bone Building',
    badgeColor: 'bg-blue-100 text-blue-800',
    description: 'Vitamin D3 increases calcium absorption from gut, but Vitamin K2 ensures that calcium is directed to bones and teeth — not arteries.',
    mechanism: 'K2 activates osteocalcin (bone matrix protein) and Matrix-Gla Protein (MGP) which direct calcium to bone and inhibit arterial calcification — critical when taking high-dose Vit D.',
    combos: ['Fermented foods (K2) + sunlight/egg yolk (D3)', 'Natto/fermented soybean + fortified milk', 'Hard cheese + egg', 'Curd + outdoor sunlight exposure'],
    benefit: 'Bone density, prevents arterial calcification, prevents kidney stones from D supplementation',
    absorption_increase: 'Calcium direction to bone',
    conditions: ['thyroid', 'bone_health', 'general'],
  },
  {
    id: 'quercetin-bromelain',
    title: 'Quercetin + Bromelain',
    icon: '🧅',
    badge: 'Anti-Inflammatory',
    badgeColor: 'bg-amber-100 text-amber-600',
    description: 'Bromelain (from pineapple/papaya) enhances quercetin bioavailability by 3× and together they form one of the most powerful natural anti-inflammatory combinations.',
    mechanism: 'Bromelain acts as a bioflavonoid absorption enhancer and independently inhibits COX-2 pathways, synergizing with quercetin\'s NF-κB inhibition.',
    combos: ['Raw onion + pineapple salsa', 'Kaanda (onion) + papaya', 'Apple + ginger (bromelain-like enzymes)', 'Methi seeds + raw papaya'],
    benefit: 'Joint pain, sinusitis, sports recovery, allergies',
    absorption_increase: '3× quercetin absorption',
    conditions: ['hypertension', 'general'],
  },
  {
    id: 'curcumin-fat',
    title: 'Turmeric + Any Healthy Fat',
    icon: '💛',
    badge: 'Curcumin Boost',
    badgeColor: 'bg-yellow-100 text-yellow-600',
    description: 'Curcumin is poorly absorbed when taken dry. Combining with fat increases absorption significantly since curcumin is fat-soluble.',
    mechanism: 'Fat promotes curcumin solubilization in the intestinal lumen and incorporation into chylomicrons for lymphatic absorption, bypassing first-pass liver metabolism.',
    combos: ['Haldi in ghee-based tadka', 'Turmeric + coconut oil golden paste', 'Haldi milk with full-fat milk', 'Masala curry cooked in oil + haldi'],
    benefit: 'Anti-inflammatory, brain protection, cancer prevention, gut healing',
    absorption_increase: '7–8×',
    conditions: ['diabetes', 'pcod', 'gut_health', 'general'],
  },
  {
    id: 'potassium-sodium',
    title: 'Potassium-Rich Foods + Low Sodium',
    icon: '🍌',
    badge: 'BP Control',
    badgeColor: 'bg-red-100 text-red-600',
    description: 'Potassium and sodium compete for renal reabsorption. High potassium diet helps kidneys excrete excess sodium — naturally lowering blood pressure.',
    mechanism: 'Na-K-ATPase pump in kidney tubules preferentially reabsorbs K over Na when K intake is high, increasing urinary sodium excretion (natriuresis).',
    combos: ['Banana + low-salt meal', 'Coconut water as post-exercise drink', 'Tomato chutney (low salt) + coconut', 'Potato (unsalted boiled) + curd', 'Dal with low salt + palak'],
    benefit: 'Blood pressure control, reduced stroke risk, kidney protection',
    absorption_increase: 'Sodium excretion 2×',
    conditions: ['hypertension', 'kidney', 'general'],
  },
  {
    id: 'fiber-water',
    title: 'Soluble Fiber + Adequate Water',
    icon: '💧',
    badge: 'Digestive Health',
    badgeColor: 'bg-sky-100 text-sky-700',
    description: 'Soluble fiber (in oats, dal, psyllium) requires water to form the viscous gel that slows glucose absorption and feeds gut bacteria. Without water, it becomes constipating.',
    mechanism: 'Soluble fiber (beta-glucan, pectin, guar) absorbs water to form gel matrix in intestine, which slows carbohydrate digestion, reduces LDL, and ferments to produce SCFA.',
    combos: ['Overnight oats with plenty of water', 'Dal soup (high water content)', 'Isabgol (psyllium) with 300ml water', 'Ragi porridge + warm water', 'Fruit with a glass of water'],
    benefit: 'Blood sugar control, cholesterol reduction, gut health, satiety',
    absorption_increase: 'Glucose absorption slowed 40%',
    conditions: ['diabetes', 'gut_health', 'hypertension', 'general'],
  },
  {
    id: 'protein-leucine',
    title: 'Complete Protein + Leucine-Rich Foods',
    icon: '💪',
    badge: 'Muscle Synthesis',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    description: 'Leucine is the master trigger for muscle protein synthesis (MPS). When combined with other proteins, even 2.5g of leucine can activate MPS.',
    mechanism: 'Leucine directly activates mTORC1 signaling pathway which initiates ribosomal translation of muscle proteins — even in the presence of only moderate total protein.',
    combos: ['Dal + rice (complete amino acids + leucine from dal)', 'Egg + legume combination', 'Dairy protein + peanuts', 'Paneer + rajma', 'Post-workout: banana + milk'],
    benefit: 'Muscle growth, recovery, prevent sarcopenia',
    absorption_increase: 'MPS activation threshold',
    conditions: ['gym', 'general'],
  },
  {
    id: 'antioxidants-variety',
    title: 'Multiple Antioxidant Colors',
    icon: '🌈',
    badge: 'Synergistic Protection',
    badgeColor: 'bg-violet-100 text-violet-700',
    description: 'Different antioxidants (Vitamin C, E, carotenoids, polyphenols) regenerate each other after neutralising free radicals — consuming diverse colors multiplies protection.',
    mechanism: 'Vitamin E radical (tocopheroxyl) is regenerated by Vitamin C. Carotenoids quench singlet oxygen independently. Beta-carotene and lycopene work at different oxygen tensions.',
    combos: ['Rainbow salad (red tomato + orange carrot + yellow bell pepper + green spinach)', 'Mixed berry chaat', 'Dal with haldi + green chutney + tamarind', 'Thalipeeth with multicolor vegetables'],
    benefit: 'Cancer prevention, anti-aging, immune strength, vision',
    absorption_increase: 'Regenerative cycle',
    conditions: ['immunity', 'general'],
  },
  {
    id: 'vitamin-c-skin',
    title: 'Vitamin C + Glycine (Collagen Synthesis)',
    icon: '✨',
    badge: 'Skin Health',
    badgeColor: 'bg-rose-100 text-rose-600',
    description: 'Vitamin C is an essential cofactor for collagen synthesis enzymes (prolyl and lysyl hydroxylase). Without adequate C, collagen strands cannot form properly.',
    mechanism: 'Ascorbic acid activates prolyl-4-hydroxylase which hydroxylates proline residues — a critical step in collagen triple helix stabilization. Glycine provides the backbone.',
    combos: ['Amla chutney + dal (glycine source)', 'Citrus + bone broth (non-veg)', 'Guava + sprouted legumes', 'Gooseberry juice + curd'],
    benefit: 'Skin elasticity, wound healing, joint health, anti-aging',
    absorption_increase: 'Collagen synthesis 2–3×',
    conditions: ['general', 'immunity'],
  },
  {
    id: 'magnesium-sleep',
    title: 'Magnesium + Tryptophan (Evening Combo)',
    icon: '🌙',
    badge: 'Sleep Quality',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    description: 'Magnesium activates GABA receptors (calming neurotransmitter) and tryptophan converts to melatonin + serotonin. Together they promote deep, restorative sleep.',
    mechanism: 'Magnesium blocks NMDA receptors and activates GABA-A receptors reducing neural excitability. Tryptophan → 5-HTP → serotonin → melatonin pathway requires Mg cofactors.',
    combos: ['Warm haldi milk + banana (evening)', 'Almonds + curd at dinner', 'Ragi roti + dahi (magnesium + tryptophan from dairy)', 'Pumpkin seeds + chamomile'],
    benefit: 'Better sleep, stress reduction, PCOD hormone regulation',
    absorption_increase: 'GABA/melatonin pathway',
    conditions: ['pcod', 'diabetes', 'general'],
  },
]

const ANTAGONISTIC = [
  {
    id: 'calcium-iron',
    title: 'Calcium vs Iron',
    icon: '⚠️',
    severity: 'high',
    description: 'Calcium and iron share the same intestinal transporter (DMT-1). When consumed together, calcium blocks iron absorption by 30–60%.',
    avoid_combos: ['Milk with dal', 'Curd rice as sole meal for iron deficiency', 'Cheese with leafy greens', 'Paneer in spinach curry if iron is priority', 'Milk immediately before/after rajma'],
    timing_tip: 'Space iron-rich meals and dairy by at least 2 hours. Have dairy as a separate snack.',
    conditions: ['anemia', 'pcod', 'pregnancy', 'general'],
  },
  {
    id: 'coffee-iron',
    title: 'Tea / Coffee + Iron-Rich Foods',
    icon: '☕',
    severity: 'high',
    description: 'Tannins in chai and chlorogenic acid in coffee bind iron in the gut, reducing non-heme iron absorption by 60–70%.',
    avoid_combos: ['Chai with iron-rich dal meals', 'Coffee immediately after palak dal-rice', 'Green tea with spinach salad', 'Black tea with ragi'],
    timing_tip: 'Wait 1–2 hours after iron-rich meals before drinking tea or coffee. Avoid chai at lunch if eating dal.',
    conditions: ['anemia', 'pcod', 'pregnancy', 'general'],
  },
  {
    id: 'oxalate-calcium',
    title: 'High-Oxalate Foods + Calcium',
    icon: '🫙',
    severity: 'medium',
    description: 'Oxalic acid in spinach, beets, and almonds binds calcium to form insoluble calcium oxalate — reducing both calcium absorption AND increasing kidney stone risk.',
    avoid_combos: ['Raw spinach + milk in smoothies', 'Beetroot with paneer', 'Raw spinach salad as primary calcium source', 'Palak paneer (calcium reduced vs cooked separately)'],
    timing_tip: 'Cook spinach to reduce oxalate by 30–50%. Pair calcium with low-oxalate greens like moringa and amaranth.',
    conditions: ['kidney', 'bone_health', 'general'],
  },
  {
    id: 'phytate-zinc-iron',
    title: 'Unsoaked Grains/Legumes + Zinc & Iron',
    icon: '🌾',
    severity: 'medium',
    description: 'Phytic acid in whole grains and unsoaked legumes chelates zinc, iron, and calcium — making them unavailable for absorption. Up to 50% of mineral content is lost.',
    avoid_combos: ['Unsoaked overnight rajma / chana', 'Bran cereal with iron supplements', 'Raw wheat bran with mineral-rich meals', 'Uncooked sprouted grains in excess'],
    timing_tip: 'Always soak legumes 8–12h, sprout, or ferment grains. Soaking reduces phytate by 50–75%. Fermented idli/dosa is ideal.',
    conditions: ['anemia', 'pcod', 'general'],
  },
  {
    id: 'sugar-chromium',
    title: 'High Sugar + Chromium',
    icon: '🍬',
    severity: 'medium',
    description: 'High-glycemic meals cause urinary chromium loss — reducing its ability to enhance insulin sensitivity over time. Critical for diabetes and PCOD management.',
    avoid_combos: ['Sugary drinks with meals', 'White rice + sugar-heavy dessert', 'Maida-based items for diabetics', 'Jaggery-heavy meals with insulin resistance'],
    timing_tip: 'Choose low-GI alternatives. Pair carbs with protein + fiber to slow glucose spike and preserve chromium.',
    conditions: ['diabetes', 'pcod', 'general'],
  },
  {
    id: 'thyroid-goitrogens',
    title: 'Raw Cruciferous Vegetables + Thyroid',
    icon: '🥦',
    severity: 'high',
    description: 'Goitrogens in raw cabbage, cauliflower, broccoli, radish block iodine uptake by the thyroid, suppressing T4 hormone synthesis. Cooking reduces goitrogens by 50–70%.',
    avoid_combos: ['Raw cabbage juice for thyroid patients', 'Raw cauliflower eaten daily', 'Radish as main raw vegetable with thyroid medication', 'Kale/mustard greens in large raw quantities'],
    timing_tip: 'Always cook cruciferous vegetables if you have thyroid conditions. Steam or stir-fry to reduce goitrogens. Eat thyroid medication 4h+ away from any cruciferous.',
    conditions: ['thyroid'],
  },
  {
    id: 'sodium-calcium',
    title: 'High Sodium + Calcium Loss',
    icon: '🧂',
    severity: 'medium',
    description: 'For every 2,300 mg of sodium excreted, approximately 40 mg of calcium is also lost in urine — accelerating bone resorption, especially post-menopause.',
    avoid_combos: ['Heavily salted snacks', 'Processed pickles as daily staple', 'Salty papad with every meal', 'High-sodium instant foods daily'],
    timing_tip: 'Keep sodium below 2g/day (ICMR). Increase calcium intake to compensate if sodium is unavoidably high.',
    conditions: ['hypertension', 'bone_health', 'general'],
  },
  {
    id: 'alcohol-bvitamins',
    title: 'Alcohol + B Vitamins',
    icon: '🚫',
    severity: 'high',
    description: 'Alcohol impairs intestinal absorption of folate, thiamine (B1), and B6 — and increases their urinary excretion and depletes liver stores rapidly.',
    avoid_combos: ['Alcohol with any B-vitamin rich meal', 'Beer with folate-rich lentils (net absorption blocked)', 'Wine before B12-heavy meals'],
    timing_tip: 'Avoid alcohol completely, especially during pregnancy or PCOD management. If consumed, supplement B-complex separately.',
    conditions: ['pregnancy', 'anemia', 'general'],
  },
  {
    id: 'vitc-b12',
    title: 'Megadose Vitamin C + B12',
    icon: '💊',
    severity: 'medium',
    description: 'Very high doses of Vitamin C supplement (>1000mg) can oxidize and destroy cobalamin (Vitamin B12) in the gut before it can be absorbed.',
    avoid_combos: ['High-dose Vitamin C supplement taken at same time as B12 supplement', 'Amla juice (1g+ natural C) with fortified dairy at same meal'],
    timing_tip: 'Space Vitamin C supplements and B12 supplements by at least 2 hours. Food-form Vitamin C (100–300mg) is safe with dietary B12.',
    conditions: ['anemia', 'pcod', 'vegetarian', 'general'],
  },
  {
    id: 'zinc-copper',
    title: 'Excess Zinc Supplementation + Copper',
    icon: '⚖️',
    severity: 'medium',
    description: 'High-dose zinc supplementation (>40mg/day from supplements) competes with copper for intestinal absorption, causing copper deficiency and potentially neurological symptoms.',
    avoid_combos: ['High-dose zinc supplement without copper monitoring', 'Zinc-fortified foods + zinc supplement same day'],
    timing_tip: 'Do not supplement zinc beyond 25mg/day without medical advice. Whole food zinc sources (pumpkin seeds, legumes) are safe. If supplementing, include copper.',
    conditions: ['pcod', 'general'],
  },
  {
    id: 'omega3-omega6',
    title: 'Omega-3 Blocked by Excess Omega-6',
    icon: '🛢️',
    severity: 'medium',
    description: 'Omega-6 and Omega-3 compete for the same elongase/desaturase enzymes. High omega-6 intake (refined oils) suppresses conversion of ALA → DHA/EPA by up to 80%.',
    avoid_combos: ['Sunflower/corn/soya oil for cooking while trying to boost omega-3', 'Vegetable oil based frying with flaxseed supplementation', 'Excess peanuts + flaxseed in same meal'],
    timing_tip: 'Use ghee, coconut oil, or mustard oil for cooking. Maintain omega-6:omega-3 ratio below 4:1. Replace refined oils with cold-pressed options.',
    conditions: ['hypertension', 'pcod', 'brain_health', 'general'],
  },
  {
    id: 'raw-egg-biotin',
    title: 'Raw Egg White + Biotin',
    icon: '🥚',
    severity: 'medium',
    description: 'Avidin — a glycoprotein in raw egg white — tightly binds biotin (Vitamin B7) in the gut, completely blocking its absorption. Cooking denatures avidin.',
    avoid_combos: ['Raw egg whites in protein shakes', 'Uncooked egg whites with biotin-rich foods (nuts, sweet potato)', 'Egg-white only omelets at very high heat without full cooking'],
    timing_tip: 'Always cook eggs fully (scrambled, boiled, poached). Cooked eggs do NOT block biotin — only raw whites do. The yolk is fine either way.',
    conditions: ['pcod', 'hair_health', 'general'],
  },
  {
    id: 'excess-fiber-minerals',
    title: 'Very High Fiber (Bran) + Mineral Absorption',
    icon: '🌿',
    severity: 'low',
    description: 'Excessive fiber intake (especially from wheat bran >50g/day) can reduce absorption of zinc, iron, calcium, and magnesium by forming insoluble mineral-fiber complexes.',
    avoid_combos: ['Adding large amounts of raw wheat bran to mineral-rich meals', 'Psyllium husk taken with iron-rich meals', 'Very high-fiber diet without mineral compensation'],
    timing_tip: 'Whole food fiber sources (dal, vegetables, fruits) are safe. Only isolated bran supplements in large doses are problematic. Space mineral supplements from fiber.',
    conditions: ['anemia', 'bone_health', 'general'],
  },
  {
    id: 'fat-heavy-light-protein',
    title: 'Heavy Fat + Lean Protein Absorption',
    icon: '🍳',
    severity: 'low',
    description: 'Very high-fat meals delay gastric emptying significantly, slowing protein digestion and absorption. Less critical for whole foods, more relevant for post-workout protein timing.',
    avoid_combos: ['High-fat fried meal as post-workout protein source', 'Ghee-heavy meal immediately post exercise', 'Deep-fried chicken as primary protein source'],
    timing_tip: 'Post-workout: choose lean protein sources (boiled egg, low-fat curd, grilled chicken) over high-fat fried versions for faster amino acid delivery.',
    conditions: ['gym', 'general'],
  },
  {
    id: 'magnesium-excess-calcium',
    title: 'Excess Calcium Supplement + Magnesium',
    icon: '🔬',
    severity: 'medium',
    description: 'High-dose calcium supplementation (>500mg at once) reduces magnesium absorption, worsening magnesium deficiency — common in PCOD and hypertension patients.',
    avoid_combos: ['Taking 1000mg calcium supplement all at once', 'Calcium supplement + magnesium supplement taken simultaneously', 'Very high dairy with no magnesium-rich foods'],
    timing_tip: 'Split calcium supplements: 500mg max per dose. Take calcium and magnesium supplements at different times. Food-based calcium (sesame, ragi) contains natural magnesium too.',
    conditions: ['pcod', 'hypertension', 'bone_health', 'general'],
  },
]

// Condition-specific recommendations
const CONDITION_FOCUS = {
  pcod: {
    label: 'PCOD / PCOS',
    icon: 'female',
    color: 'text-pink-700',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    combos_to_boost: ['iron-vitc', 'omega3-vitE', 'magnesium-vitb6', 'turmeric-pepper', 'folate-b12', 'magnesium-sleep'],
    combos_to_avoid: ['coffee-iron', 'calcium-iron', 'sugar-chromium', 'omega3-omega6'],
    insight: 'Focus on anti-inflammatory, insulin-sensitising synergies. Iron+VitC is critical due to heavy periods. Omega-3+VitE reduces inflammation and balances hormones. Avoid refined oils that block omega-3 conversion.',
  },
  diabetes: {
    label: 'Diabetes',
    icon: 'glucose',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    combos_to_boost: ['turmeric-pepper', 'magnesium-vitb6', 'probiotics-prebiotics', 'fiber-water', 'potassium-sodium'],
    combos_to_avoid: ['sugar-chromium', 'phytate-zinc-iron'],
    insight: 'Prioritise blood sugar stabilisation synergies. Fiber+water slows glucose absorption. Turmeric+pepper improves insulin sensitivity. Probiotics+prebiotics reduce gut inflammation linked to diabetes.',
  },
  hypertension: {
    label: 'Hypertension',
    icon: 'monitor_heart',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    combos_to_boost: ['omega3-vitE', 'potassium-sodium', 'quercetin-bromelain', 'fiber-water'],
    combos_to_avoid: ['sodium-calcium', 'omega3-omega6'],
    insight: 'Omega-3+VitE reduces blood pressure. Potassium-rich diet helps kidneys excrete sodium naturally. Quercetin+Bromelain reduces vascular inflammation. Replace refined oils with ghee or coconut oil.',
  },
  thyroid: {
    label: 'Thyroid',
    icon: 'biotech',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    combos_to_boost: ['selenium-iodine', 'calcium-vitd', 'vitk2-vitd', 'fat-vitaminADE'],
    combos_to_avoid: ['thyroid-goitrogens', 'oxalate-calcium', 'omega3-omega6'],
    insight: 'Selenium+Iodine is the foundational thyroid synergy — both required for T4 synthesis and T3 conversion. Calcium+VitD protects bones from thyroid medication effects. Never eat raw cruciferous vegetables.',
  },
  anemia: {
    label: 'Anemia / Iron Deficiency',
    icon: 'water_drop',
    color: 'text-red-800',
    bg: 'bg-red-50',
    border: 'border-red-200',
    combos_to_boost: ['iron-vitc', 'iron-vitaminA', 'folate-b12', 'turmeric-pepper'],
    combos_to_avoid: ['calcium-iron', 'coffee-iron', 'phytate-zinc-iron', 'vitc-b12'],
    insight: 'Iron+VitC is your most powerful tool — triples iron absorption. Iron+VitA mobilises stored iron. Completely avoid tea/coffee within 2 hours of iron-rich meals. Soak all legumes before cooking.',
  },
  pregnancy: {
    label: 'Pregnancy',
    icon: 'pregnant_woman',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    combos_to_boost: ['iron-vitc', 'folate-b12', 'calcium-vitd', 'iron-vitaminA', 'omega3-vitE'],
    combos_to_avoid: ['calcium-iron', 'coffee-iron', 'alcohol-bvitamins', 'raw-egg-biotin'],
    insight: 'Folate+B12 is critical for neural tube development — take together. Iron+VitC prevents pregnancy anemia. Completely avoid alcohol, raw eggs, and tea/coffee within meals. Calcium must be timed away from iron supplements.',
  },
  bone_health: {
    label: 'Bone Health',
    icon: 'accessibility',
    color: 'text-blue-800',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    combos_to_boost: ['calcium-vitd', 'vitk2-vitd', 'fat-vitaminADE', 'potassium-sodium'],
    combos_to_avoid: ['oxalate-calcium', 'sodium-calcium', 'excess-fiber-minerals', 'magnesium-excess-calcium'],
    insight: 'Calcium+D3+K2 is the complete bone trifecta — D3 increases absorption, K2 directs calcium to bone (not arteries). Low sodium diet preserves calcium. Avoid oxalate-rich raw vegetables with dairy.',
  },
  gut_health: {
    label: 'Gut Health',
    icon: 'spa',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    combos_to_boost: ['probiotics-prebiotics', 'fiber-water', 'turmeric-pepper', 'curcumin-fat', 'antioxidants-variety'],
    combos_to_avoid: ['fat-heavy-light-protein', 'alcohol-bvitamins'],
    insight: 'Probiotics+Prebiotics (synbiotics) are the foundation of gut health — fermented Indian foods with fiber-rich accompaniments are ideal. Curcumin+fat reduces gut inflammation. High fiber needs adequate water.',
  },
  immunity: {
    label: 'Immunity',
    icon: 'shield',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    combos_to_boost: ['zinc-protein', 'vitamin-c-skin', 'antioxidants-variety', 'probiotics-prebiotics', 'selenium-iodine'],
    combos_to_avoid: ['sugar-chromium', 'alcohol-bvitamins'],
    insight: 'Zinc+fermented protein is the top immune synergy. Diverse antioxidant colors regenerate each other. Probiotics strengthen the gut immune barrier. Avoid sugar and refined carbs which suppress immune function.',
  },
  gym: {
    label: 'Gym / Athletes',
    icon: 'fitness_center',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    combos_to_boost: ['protein-leucine', 'magnesium-vitb6', 'omega3-vitE', 'antioxidants-variety', 'fiber-water'],
    combos_to_avoid: ['fat-heavy-light-protein', 'excess-fiber-minerals'],
    insight: 'Leucine-triggered protein synthesis is critical for muscle building — combine dal+rice or egg+legume for complete amino acid profile. Omega-3 reduces post-workout inflammation. Time protein within 2h post-workout.',
  },
  general: {
    label: 'General Wellness',
    icon: 'spa',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    combos_to_boost: ['iron-vitc', 'calcium-vitd', 'turmeric-pepper', 'fat-vitaminADE', 'probiotics-prebiotics'],
    combos_to_avoid: ['coffee-iron', 'phytate-zinc-iron', 'sodium-calcium'],
    insight: 'Build your meals around absorption synergies — what you eat together matters as much as what you eat. Iron+VitC, Calcium+D, and Turmeric+Pepper are foundational Indian food synergies to practice daily.',
  },
}

// ─── Quick Reference Card ─────────────────────────────────────────────────────

const QUICK_FACTS = [
  { label: 'Always add lemon to dal', reason: 'Triples iron absorption', icon: '🍋', color: 'bg-green-50 border-green-200' },
  { label: 'Black pepper in every dish with haldi', reason: '2000× curcumin boost', icon: '🌿', color: 'bg-yellow-50 border-yellow-200' },
  { label: 'Milk 2h after iron-rich meal', reason: 'Calcium blocks iron absorption', icon: '🥛', color: 'bg-orange-50 border-orange-200' },
  { label: 'No tea with lunch/dinner', reason: 'Tannins block 60% of iron', icon: '☕', color: 'bg-red-50 border-red-200' },
  { label: 'Cook spinach, never eat raw in excess', reason: 'Reduces oxalate by 50%', icon: '🥬', color: 'bg-blue-50 border-blue-200' },
  { label: 'Soak all legumes overnight', reason: 'Reduces phytate by 75%', icon: '🫘', color: 'bg-purple-50 border-purple-200' },
  { label: 'Add ghee to carrot/sweet potato dishes', reason: 'Fat-soluble Vit A needs fat', icon: '🥕', color: 'bg-amber-50 border-amber-200' },
  { label: 'Eat curd with fiber-rich foods', reason: 'Synbiotic = gut health', icon: '🥣', color: 'bg-emerald-50 border-emerald-200' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SynergyCard({ combo, highlight = false }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        highlight
          ? 'border-[#154212] bg-[#154212]/5 shadow-md'
          : 'border-[#e6e9e7] bg-white hover:border-[#154212]/40 hover:shadow-sm'
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-4 p-5 text-left"
      >
        <span className="text-2xl mt-0.5 flex-shrink-0">{combo.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="font-headline font-bold text-[#1a2e19] text-base">{combo.title}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${combo.badgeColor}`}>
              {combo.badge}
            </span>
          </div>
          <p className="text-xs text-[#6b7c68] mt-1 leading-relaxed line-clamp-2">{combo.description}</p>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="text-xs font-semibold text-[#154212] flex items-center gap-1">
              <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '14px' }}>trending_up</span>
              {combo.absorption_increase}
            </span>
            <span className="text-xs text-[#6b7c68] flex items-center gap-1">
              <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '14px' }}>favorite</span>
              {combo.benefit}
            </span>
          </div>
        </div>
        <span className={`material-symbols-outlined text-[#6b7c68] shrink-0 transition-transform overflow-hidden ${open ? 'rotate-180' : ''}`} style={{ fontSize: '20px' }}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-[#f2f4f2]">
          <div className="mt-4">
            <p className="text-[11px] font-semibold text-[#6b7c68] uppercase tracking-wider mb-1.5">The Science</p>
            <p className="text-xs text-[#42493e] leading-relaxed bg-[#f8faf8] rounded-xl px-3 py-2.5">
              {combo.mechanism}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#6b7c68] uppercase tracking-wider mb-2">Ideal Food Pairings</p>
            <div className="flex flex-wrap gap-2">
              {combo.combos.map((c, i) => (
                <span key={i} className="text-xs bg-[#bcf0ae]/60 text-[#154212] font-medium px-2.5 py-1 rounded-full border border-[#154212]/15">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AvoidCard({ combo, highlight = false }) {
  const [open, setOpen] = useState(false)
  const severityConfig = {
    high:   { bg: 'bg-red-50',    border: 'border-red-200',   badge: 'bg-red-100 text-red-700',    label: 'High Impact' },
    medium: { bg: 'bg-amber-50',  border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', label: 'Moderate' },
    low:    { bg: 'bg-gray-50',   border: 'border-gray-200',  badge: 'bg-gray-100 text-gray-600',   label: 'Low Impact' },
  }
  const cfg = severityConfig[combo.severity] || severityConfig.medium
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-200 ${highlight ? `${cfg.border} ${cfg.bg}` : 'border-[#e6e9e7] bg-white hover:border-red-200 hover:shadow-sm'}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-4 p-5 text-left"
      >
        <span className="text-2xl mt-0.5 flex-shrink-0">{combo.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="font-headline font-bold text-[#1a2e19] text-base">{combo.title}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cfg.badge}`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-[#6b7c68] mt-1 leading-relaxed line-clamp-2">{combo.description}</p>
          <p className="text-[11px] font-medium text-amber-700 mt-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '14px' }}>schedule</span>
            {combo.timing_tip.length > 80 ? combo.timing_tip.slice(0, 80) + '…' : combo.timing_tip}
          </p>
        </div>
        <span className={`material-symbols-outlined text-[#6b7c68] shrink-0 transition-transform overflow-hidden ${open ? 'rotate-180' : ''}`} style={{ fontSize: '20px' }}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-[#f2f4f2]">
          <div className="mt-4">
            <p className="text-[11px] font-semibold text-[#6b7c68] uppercase tracking-wider mb-2">Combinations to Avoid</p>
            <div className="flex flex-wrap gap-2">
              {combo.avoid_combos.map((c, i) => (
                <span key={i} className="text-xs bg-red-50 text-red-700 font-medium px-2.5 py-1 rounded-full border border-red-200">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className={`p-3 rounded-xl ${cfg.bg} border ${cfg.border}`}>
            <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '14px' }}>tips_and_updates</span>
              Timing Tip
            </p>
            <p className="text-xs text-[#42493e] leading-relaxed">{combo.timing_tip}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FoodCombinationsPage() {
  const navigate = useNavigate()
  const { profile } = useProfileStore()
  const activeProfile = profile || mockUserProfile

  const conditions = (activeProfile.health_conditions ?? activeProfile.healthConditions ?? ['general'])
    .map((c) => c.toLowerCase())

  const relevantConditionKey = conditions.find((c) => CONDITION_FOCUS[c]) ?? 'general'
  const relevantCondition = CONDITION_FOCUS[relevantConditionKey]

  const [activeTab, setActiveTab] = useState('synergy')
  const [conditionFilter, setConditionFilter] = useState(relevantConditionKey)
  const [searchQuery, setSearchQuery] = useState('')

  const cf = CONDITION_FOCUS[conditionFilter] || CONDITION_FOCUS.general
  const highlightedSynergyIds = cf.combos_to_boost || []
  const highlightedAvoidIds   = cf.combos_to_avoid || []

  const filteredSynergy = SYNERGISTIC.filter((c) => {
    const matchesCond = conditionFilter === 'general' || c.conditions.includes(conditionFilter)
    const matchesSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCond && matchesSearch
  }).sort((a, b) => (highlightedSynergyIds.includes(b.id) ? 1 : 0) - (highlightedSynergyIds.includes(a.id) ? 1 : 0))

  const filteredAvoid = ANTAGONISTIC.filter((c) => {
    const matchesCond = conditionFilter === 'general' || c.conditions.includes(conditionFilter)
    const matchesSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCond && matchesSearch
  }).sort((a, b) => (highlightedAvoidIds.includes(b.id) ? 1 : 0) - (highlightedAvoidIds.includes(a.id) ? 1 : 0))

  return (
    <div className="min-h-screen bg-[#f8faf8]">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e6e9e7] px-8 py-7">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-[#154212] flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '22px' }}>join_inner</span>
                </div>
                <h1 className="font-headline text-3xl font-black text-[#154212]">Food Synergy</h1>
              </div>
              <p className="text-sm text-[#6b7c68] mt-1 max-w-2xl">
                Unlock the hidden intelligence of Indian food pairing — {SYNERGISTIC.length} power combinations to boost absorption
                and {ANTAGONISTIC.length} antagonistic pairs to avoid for maximum nutrient benefit.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7c68] overflow-hidden" style={{ fontSize: '16px' }}>search</span>
                <input
                  type="text"
                  placeholder="Search combinations…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-4 py-2 text-sm rounded-xl border border-[#e6e9e7] bg-[#f8faf8] text-[#1a2e19] focus:outline-none focus:border-[#154212] w-52"
                />
              </div>
              <button
                onClick={() => navigate('/recipes')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#154212] text-white text-sm font-semibold hover:bg-[#2d5a27] transition-all"
              >
                <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '18px' }}>restaurant_menu</span>
                Explore Recipes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Quick Reference ──────────────────────────────────────────────── */}
        <div>
          <h2 className="font-headline text-base font-bold text-[#1a2e19] mb-3">⚡ Daily Quick Rules</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_FACTS.map((fact, i) => (
              <div key={i} className={`rounded-xl border p-3 ${fact.color}`}>
                <div className="text-xl mb-1">{fact.icon}</div>
                <p className="text-xs font-bold text-[#1a2e19] leading-tight">{fact.label}</p>
                <p className="text-[10px] text-[#6b7c68] mt-0.5">{fact.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Personalised Insight Banner ─────────────────────────────────── */}
        <div className={`rounded-2xl p-5 border ${relevantCondition.border} ${relevantCondition.bg} flex items-start gap-4`}>
          <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shrink-0 overflow-hidden">
            <span className={`material-symbols-outlined ${relevantCondition.color} overflow-hidden`} style={{ fontSize: '22px' }}>{relevantCondition.icon}</span>
          </div>
          <div className="flex-1">
            <p className={`font-semibold text-sm ${relevantCondition.color}`}>
              Personalised for: {relevantCondition.label}
            </p>
            <p className="text-xs text-[#42493e] mt-0.5 leading-relaxed">{relevantCondition.insight}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="text-[11px] text-[#6b7c68]">Priority synergies:</span>
              {highlightedSynergyIds.slice(0, 4).map((id) => {
                const c = SYNERGISTIC.find((s) => s.id === id)
                return c ? (
                  <span key={id} className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.badgeColor}`}>{c.title}</span>
                ) : null
              })}
            </div>
          </div>
        </div>

        {/* ── Condition Filter Pills ───────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(CONDITION_FOCUS).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setConditionFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                conditionFilter === key
                  ? 'bg-[#154212] text-white border-[#154212]'
                  : 'bg-white text-[#42493e] border-[#e6e9e7] hover:border-[#154212] hover:text-[#154212]'
              }`}
            >
              <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '14px' }}>{val.icon}</span>
              {val.label}
            </button>
          ))}
        </div>

        {/* ── Tab Switcher ────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-[#e6e9e7] p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('synergy')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'synergy' ? 'bg-[#154212] text-white shadow-sm' : 'text-[#6b7c68] hover:text-[#1a2e19]'
            }`}
          >
            <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '18px' }}>join_inner</span>
            Power Combinations
            <span className="text-[11px] bg-white/20 px-1.5 py-0.5 rounded-full">{filteredSynergy.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('avoid')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'avoid' ? 'bg-[#692000] text-white shadow-sm' : 'text-[#6b7c68] hover:text-[#1a2e19]'
            }`}
          >
            <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '18px' }}>block</span>
            Avoid Together
            <span className="text-[11px] bg-white/20 px-1.5 py-0.5 rounded-full">{filteredAvoid.length}</span>
          </button>
        </div>

        {/* ── Content Grid ────────────────────────────────────────────────── */}
        {activeTab === 'synergy' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#154212] overflow-hidden" style={{ fontSize: '22px' }}>join_inner</span>
              <h2 className="font-headline text-xl font-bold text-[#1a2e19]">
                Power Combinations — Boost Absorption
              </h2>
            </div>
            <p className="text-xs text-[#6b7c68]">
              These food pairings work together synergistically — eating them at the same meal significantly increases nutrient uptake. Highlighted cards are most relevant for your condition.
            </p>
            {filteredSynergy.length === 0 ? (
              <p className="text-center text-[#6b7c68] py-10">No combinations match your search. Try a different condition or search term.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredSynergy.map((combo) => (
                  <SynergyCard key={combo.id} combo={combo} highlight={highlightedSynergyIds.includes(combo.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'avoid' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#692000] overflow-hidden" style={{ fontSize: '22px' }}>block</span>
              <h2 className="font-headline text-xl font-bold text-[#1a2e19]">
                Antagonistic Pairs — Avoid Together
              </h2>
            </div>
            <p className="text-xs text-[#6b7c68]">
              These combinations silently reduce nutrient effectiveness. Most require only timing separation — not permanent avoidance.
            </p>
            {filteredAvoid.length === 0 ? (
              <p className="text-center text-[#6b7c68] py-10">No antagonisms match your search. Try a different condition or search term.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredAvoid.map((combo) => (
                  <AvoidCard key={combo.id} combo={combo} highlight={highlightedAvoidIds.includes(combo.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Science Footer ───────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-[#154212]/5 border border-[#154212]/10 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[#154212] overflow-hidden" style={{ fontSize: '20px' }}>science</span>
            <p className="font-headline font-bold text-[#154212] text-base">Ancient Wisdom • Modern Science</p>
          </div>
          <p className="text-xs text-[#42493e] leading-relaxed">
            Traditional Indian cooking already embodies these synergies — haldi in every sabzi, lemon on dal,
            tadka in ghee, fermented idli-dosa batter, curd with every meal. The Alchemist's kitchen is optimised
            for nutrient absorption by design. These are not new discoveries — they are the rediscovery of what
            Indian grandmothers always knew.
          </p>
        </div>
      </div>
    </div>
  )
}
