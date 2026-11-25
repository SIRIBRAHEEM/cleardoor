// ClearDoor core text logic.
// Pure functions only: no DOM, no storage. Unit tested in tests/logic.test.mjs.

// Academic or formal words mapped to plainer everyday words.
// Keys are lowercase. Values keep the same meaning in simpler form.
export const PLAIN_WORDS = {
  utilised: "used",
  utilizes: "uses",
  demonstrating: "showing",
  demonstrates: "shows",
  indicates: "shows",
  indicating: "showing",
  requires: "needs",
  required: "needed",
  contains: "holds",
  containing: "holding",
  includes: "adds",
  including: "adding",
  produces: "makes",
  producing: "making",
  provides: "gives",
  provide: "give",
  provided: "given",
  allows: "lets",
  allow: "let",
  enables: "lets",
  enable: "let",
  involves: "includes",
  involve: "include",
  occurs: "happens",
  occur: "happen",
  occurring: "happening",
  exists: "is there",
  exist: "be there",
  remains: "stays",
  remain: "stay",
  affects: "changes",
  affect: "change",
  influenced: "changed",
  influences: "changes",
  influence: "change",
  determines: "decides",
  depends: "relies",
  depend: "rely",
  consists: "is made",
  comprises: "is made of",
  represents: "stands for",
  maintains: "keeps",
  increases: "raises",
  decreases: "lowers",
  reduces: "cuts",
  improves: "makes better",
  develops: "grows",
  creates: "makes",
  create: "make",
  referred: "called",
  begins: "starts",
  begin: "start",
  continues: "goes on",
  continue: "go on",
  approximately: "about",
  utilise: "use",
  utilize: "use",
  demonstrate: "show",
  indicate: "show",
  subsequently: "later",
  therefore: "so",
  however: "but",
  nevertheless: "still",
  furthermore: "also",
  additionally: "also",
  consequently: "so",
  initially: "at first",
  eventually: "in the end",
  currently: "now",
  previously: "before",
  frequently: "often",
  occasionally: "sometimes",
  primarily: "mostly",
  essentially: "mostly",
  specifically: "in particular",
  particularly: "in particular",
  significant: "important",
  considerable: "large",
  sufficient: "enough",
  numerous: "many",
  various: "different",
  obtain: "get",
  receive: "get",
  purchase: "buy",
  require: "need",
  necessary: "needed",
  attempt: "try",
  assist: "help",
  assistance: "help",
  commence: "start",
  conclude: "end",
  terminate: "end",
  observe: "see",
  examine: "look at",
  investigate: "look into",
  determine: "find out",
  establish: "set up",
  maintain: "keep",
  preserve: "keep",
  retain: "keep",
  produce: "make",
  generate: "make",
  construct: "build",
  develop: "grow",
  improve: "make better",
  enhance: "improve",
  increase: "raise",
  decrease: "lower",
  reduce: "cut",
  expand: "grow",
  contain: "hold",
  include: "add",
  represent: "stand for",
  illustrate: "show",
  describe: "tell about",
  explain: "tell how",
  define: "say what it means",
  identify: "find",
  recognise: "know",
  recognize: "know",
  understand: "know",
  comprehend: "understand",
  consider: "think about",
  regard: "see",
  assume: "think",
  suppose: "think",
  suggest: "hint",
  propose: "suggest",
  recommend: "suggest",
  result: "outcome",
  consequence: "result",
  factor: "reason",
  aspect: "side",
  feature: "part",
  characteristic: "feature",
  property: "quality",
  function: "job",
  purpose: "aim",
  objective: "goal",
  method: "way",
  technique: "way",
  approach: "way",
  strategy: "plan",
  concept: "idea",
  theory: "idea",
  principle: "rule",
  phenomenon: "event",
  occurrence: "event",
  environment: "surroundings",
  organism: "living thing",
  substance: "material",
  component: "part",
  element: "part",
  structure: "make-up",
  surface: "outside",
  interior: "inside",
  exterior: "outside",
  region: "area",
  location: "place",
  position: "place",
  direction: "way",
  movement: "moving",
  behavior: "behaviour",
  ability: "skill",
  capacity: "amount it can hold",
  quantity: "amount",
  volume: "amount",
  proportion: "share",
  ratio: "share",
  average: "typical",
  typical: "usual",
  normal: "usual",
  ordinary: "usual",
  common: "usual",
  rare: "not common",
  similar: "alike",
  different: "not the same",
  identical: "the same",
  equal: "the same",
  equivalent: "the same as",
  distinct: "separate",
  separate: "apart",
  individual: "single",
  particular: "certain",
  certain: "sure",
  specific: "exact",
  general: "overall",
  overall: "in all",
  total: "whole",
  entire: "whole",
  complete: "full",
  partial: "part",
  major: "big",
  minor: "small",
  essential: "needed",
  vital: "very important",
  critical: "very important",
  fundamental: "basic",
  basic: "simple",
  complex: "hard",
  complicated: "hard",
  difficult: "hard",
  simple: "easy",
  straightforward: "clear",
  obvious: "clear",
  evident: "clear",
  apparent: "clear",
  visible: "able to be seen",
  invisible: "not able to be seen",
  available: "ready to use",
  accessible: "easy to reach",
  suitable: "right",
  appropriate: "right",
  proper: "right",
  correct: "right",
  accurate: "exact",
  precise: "exact",
  roughly: "about",
  nearly: "almost",
  entirely: "fully",
  completely: "fully",
  partially: "partly",
  mainly: "mostly",
  largely: "mostly",
  highly: "very",
  extremely: "very",
  relatively: "fairly",
  rather: "quite",
  somewhat: "a bit",
  slightly: "a bit",
  gradually: "slowly",
  rapidly: "fast",
  quickly: "fast",
  immediately: "at once",
  suddenly: "all at once",
  finally: "at last",
  firstly: "first",
  secondly: "second",
  thirdly: "third",
  moreover: "also",
  besides: "also",
  meanwhile: "at the same time",
  otherwise: "if not",
  instead: "in place of that",
  hence: "so",
  thus: "so",
  accordingly: "so",
  similarly: "in the same way",
  likewise: "in the same way",
  conversely: "on the other hand",
  whereas: "while",
  although: "even though",
  despite: "even with",
  unless: "if not",
  assuming: "if",
  regarding: "about",
  concerning: "about",
  relating: "about",
  according: "as said by",
  owing: "because of",
  due: "because of",
  via: "through",
  per: "for each",
  among: "between",
  within: "inside",
  throughout: "all through",
  beneath: "under",
  beyond: "past",
  towards: "toward",
  beside: "next to",
  glucose: "sugar",
  absorb: "take in",
  release: "let out",
  convert: "change",
  transform: "change",
  transfer: "move",
  transport: "carry",
  circulate: "move around",
  evaporate: "turn to vapour",
  condense: "turn to liquid",
  dissolve: "mix in",
  mixture: "mix",
  solution: "mix",
  vapor: "vapour",
  temperature: "heat level",
  pressure: "push",
  force: "push or pull",
  motion: "movement",
  velocity: "speed",
  acceleration: "speeding up",
  friction: "rubbing force",
  nucleus: "centre",
  membrane: "skin",
  human: "person",
  species: "kind",
  habitat: "home area",
  ecosystem: "living system",
  climate: "weather pattern",
  frequency: "how often",
  wavelength: "wave length",
  reflection: "bouncing back",
  refraction: "bending",
  image: "picture",
  object: "thing",
  material: "stuff",
  state: "form",
  circumference: "distance around",
  perimeter: "distance around",
  data: "facts",
  median: "middle value",
  mode: "most common value",
  range: "spread",
  probability: "chance",
  outcome: "result",
  experiment: "test",
  observation: "watching",
  conclusion: "final idea",
  hypothesis: "guess to test",
  variable: "thing that changes",
  record: "write down",
  predict: "guess ahead",
  estimate: "rough guess",
  calculate: "work out",
  solve: "work out",
  contrast: "show differences",
  classify: "sort into groups",
  sequence: "order",
  stage: "step",
  phase: "stage",
  growth: "growing",
  reproduction: "making new life",
  nutrition: "feeding",
  respiration: "breathing",
  excretion: "getting rid of waste",
  sensitivity: "sensing",
  heredity: "passing on traits",
  variation: "differences",
  adaptation: "fitting in",
  evolution: "slow change over time",
  extinct: "gone forever",
  endangered: "at risk",
  conserve: "protect",
  recycle: "use again",
  reuse: "use again",
  renewable: "can be replaced",
  nonrenewable: "cannot be replaced",
  solar: "from the sun",
  hydro: "from water",
  geothermal: "from earth heat",
  biomass: "plant and animal matter",
  reservoir: "water store",
  irrigation: "watering crops",
  agriculture: "farming",
  germination: "sprouting",
  transpiration: "water loss from leaves",
  absorption: "taking in",
  circulation: "moving around",
  nervous: "nerve",
  skeletal: "bone",
  muscular: "muscle",
  digestive: "digestion",
  respiratory: "breathing",
  circulatory: "blood moving",
  excretory: "waste removal",
  reproductive: "making new life",
  endocrine: "hormone",
  immune: "defence",
  diet: "food",
  deficiency: "lack",
  disease: "sickness",
  vector: "carrier",
  symptom: "sign",
  prevention: "stopping it",
  hygiene: "cleanliness",
  sanitation: "cleanliness",
  immunisation: "protection by vaccine",
  immunization: "protection by vaccine",
};

// Words that are long but common enough to keep out of the hard word list.
const COMMON_LONG = new Set([
  "because", "another", "together", "important", "different", "however",
  "everything", "something", "anything", "nothing", "everybody",
  "somebody", "anybody", "nobody", "everywhere", "somewhere", "anywhere",
  "nowhere", "whatever", "whenever", "wherever", "whoever", "however",
  "moreover", "therefore", "otherwise", "meanwhile", "nevertheless",
  "furthermore", "consequently", "subsequently", "approximately",
  "particularly", "specifically", "especially", "generally", "usually",
  "normally", "typically", "frequently", "occasionally", "rarely",
  "seldom", "always", "never", "often", "sometimes", "usually",
  "already", "still", "yet", "just", "even", "also", "only", "very",
  "quite", "rather", "pretty", "fairly", "really", "truly", "actually",
  "basically", "essentially", "literally", "probably", "possibly",
  "perhaps", "maybe", "certainly", "definitely", "absolutely",
  "completely", "entirely", "totally", "fully", "partly", "mostly",
  "mainly", "largely", "highly", "extremely", "incredibly", "amazingly",
  "surprisingly", "fortunately", "unfortunately", "luckily", "hopefully",
  "thankfully", "interestingly", "importantly", "significantly",
  "considerably", "substantially", "relatively", "comparatively",
  "gradually", "rapidly", "quickly", "slowly", "suddenly", "immediately",
  "eventually", "finally", "recently", "lately", "currently", "previously",
  "originally", "initially", "formerly", "once", "twice", "again",
  "almost", "nearly", "hardly", "barely", "scarcely", "simply",
  "merely", "exactly", "precisely", "roughly", "about", "around",
  "almost", "nearly", "practically", "virtually", "essentially",
  "basically", "fundamentally", "ultimately", "eventually", "finally",
  "lastly", "firstly", "secondly", "thirdly", "next", "then", "later",
  "earlier", "sooner", "afterwards", "afterward", "beforehand",
  "meanwhile", "meantime", "simultaneously", "concurrently",
]);

export function countSyllables(word) {
  const w = String(word || "").toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const cleaned = w.replace(/(?:[^laeiouy]e|ed|es)$/, "").replace(/^y/, "");
  const groups = cleaned.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

export function splitSentences(text) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (!t) return [];
  const parts = t.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) || [];
  return parts.map((s) => s.trim()).filter(Boolean);
}

export function wordsOf(text) {
  return String(text || "").match(/[A-Za-z']+/g) || [];
}

export function textStats(text) {
  const words = wordsOf(text);
  const sentences = splitSentences(text);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);
  const avgSentence = wordCount ? wordCount / sentenceCount : 0;
  const avgSyllables = wordCount ? syllables / wordCount : 0;
  const grade = wordCount
    ? 0.39 * avgSentence + 11.8 * avgSyllables - 15.59
    : 0;
  const ease = wordCount
    ? 206.835 - 1.015 * avgSentence - 84.6 * avgSyllables
    : 0;
  const hard = words.filter(
    (w) => countSyllables(w) >= 3 && !COMMON_LONG.has(w.toLowerCase()),
  );
  return {
    words: wordCount,
    sentences: sentences.length,
    syllables,
    avgSentence: round1(avgSentence),
    grade: Math.max(0, round1(grade)),
    ease: clamp(round1(ease), 0, 100),
    hardWords: hard.length,
    hardList: [...new Set(hard.map((w) => w.toLowerCase()))].slice(0, 24),
    minutes: Math.max(1, Math.round(wordCount / 180)),
  };
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function matchCase(original, replacement) {
  if (!original) return replacement;
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

// Split one long sentence at a natural join so each part stays short.
function splitLongSentence(sentence, maxWords = 20) {
  const words = sentence.split(/\s+/);
  if (words.length <= maxWords) return [sentence];
  const joins = [
    ", and ",
    ", but ",
    ", which ",
    ", so ",
    "; ",
    ", ",
    " and ",
  ];
  for (const join of joins) {
    const idx = sentence.indexOf(join, Math.floor(sentence.length / 3));
    if (idx > 0) {
      const left = sentence.slice(0, idx).trim();
      const rightRaw = sentence.slice(idx + join.length).trim();
      const firstWord = (rightRaw.split(/\s+/)[0] || "").toLowerCase();
      const fragmentStarters = ["where", "which", "who", "that", "when", "whose"];
      if (fragmentStarters.includes(firstWord)) continue;
      const verbs = [
        "is", "are", "was", "were", "has", "have", "had", "can", "could",
        "will", "would", "may", "might", "makes", "make", "uses", "use",
        "takes", "take", "gives", "give", "helps", "help", "shows", "show",
        "needs", "need", "gets", "get", "comes", "come", "goes", "go",
        "keeps", "keep", "lets", "let", "starts", "start", "ends", "end",
        "happens", "happen", "contains", "contain", "includes", "include",
      ];
      const rightWords = rightRaw.toLowerCase().split(/\s+/);
      if (!rightWords.some((w) => verbs.includes(w.replace(/[^a-z]/g, "")))) {
        continue;
      }
      if (left.split(/\s+/).length >= 5 && rightRaw.split(/\s+/).length >= 4) {
        const right = rightRaw[0].toUpperCase() + rightRaw.slice(1);
        return [
          ...splitLongSentence(ensureEnd(left), maxWords),
          ...splitLongSentence(ensureEnd(right), maxWords),
        ];
      }
    }
  }
  return [sentence];
}

function ensureEnd(s) {
  return /[.!?]$/.test(s) ? s : s + ".";
}

// Main simplifier. Returns the clearer text plus a list of word swaps made.
export function simplifyText(text) {
  const input = String(text || "");
  const before = textStats(input);
  const changes = [];
  const seen = new Set();

  const paragraphs = input.split(/\n\s*\n/);
  const outParagraphs = paragraphs.map((para) => {
    const sentences = splitSentences(para);
    const outSentences = [];
    for (const sentence of sentences) {
      const swapped = sentence.replace(/[A-Za-z']+/g, (word) => {
        const key = word.toLowerCase();
        const plain = PLAIN_WORDS[key];
        if (plain && plain !== key) {
          if (!seen.has(key)) {
            seen.add(key);
            changes.push({ from: word, to: matchCase(word, plain) });
          }
          return matchCase(word, plain);
        }
        return word;
      });
      outSentences.push(...splitLongSentence(swapped));
    }
    return outSentences.join(" ");
  });

  const simplified = outParagraphs.join("\n\n").trim();
  const after = textStats(simplified);
  return { text: simplified, changes, before, after };
}

export function gradeLabel(grade) {
  if (grade <= 5) return "Very easy";
  if (grade <= 7) return "Easy";
  if (grade <= 9) return "Fairly easy";
  if (grade <= 11) return "Medium";
  if (grade <= 13) return "Hard";
  return "Very hard";
}

export function makeId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

export function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
