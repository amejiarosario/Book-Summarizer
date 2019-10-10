const fs = require('fs').promises;

MIN_WORD_LENGTH = 2;
const EXCLUDED_WORDS = [
  // articles
  'a', 'an', 'the',
  // conjunctions
  'for', 'and', 'nor', 'or', 'but', 'yet', 'so',
  'after', 'although', 'as', 'because', 'before', 'even', 'when', 'where', 'whenever',
  // pronous
  'i', 'you', 'he', 'she', 'it', 'we', 'you', 'they',
  'me', 'him', 'her', 'it', 'us', 'them',
  'my', 'your', 'his',
  // others
  'all', 'that', 'not', 'are', 'which', 'with', 'this', 'get', 'who', 'more', 'what', 'must',
  'there', 'from', 'upon', 'every', 'into', 'one',
];
const EXCLUDED_WORDS_MAP = EXCLUDED_WORDS.reduce((map, word) => (map[word] = true, map), {});

function tokenize(word) {
  return word.toLowerCase().trim();
}

function excludedWords(word) {
  return excludeByLength(word) && !EXCLUDED_WORDS_MAP[word];
}

function excludeByLength(word) {
  return word && word.length > MIN_WORD_LENGTH;
}

function getMostRepeatedWords(text) {
  return text
    .split(/\b/)
    .map(tokenize)
    .filter(excludedWords)
    .reduce((map, token) => {

    if (map.has(token)) {
      map.set(token, 1 + map.get(token));
    } else {
      map.set(token, 1);
    }

    return map;
  }, new Map());
}

function getPhrases(text, grouping = 1) {
  const phrases = new Map();
  const words = text
    .split(/\b/)
    .map(tokenize)
    .filter(excludedWords);
    // .filter(excludeByLength);

  for (let index = 1; index < words.length; index++) {
    const prev = words[index - 1];
    const curr = words[index];
    const phrase = `${prev} ${curr}`.trim();

    if (phrases.has(phrase)) {
      phrases.set(phrase, 1 + phrases.get(phrase));
    } else {
      phrases.set(phrase, 1);
    }
  }

  return phrases;
}

function getNPhrases(text, grouping = 1) {
  const phrases = new Map();
  const words = text
    .split(/\b/)
    .map(tokenize)
    // .filter(excludedWords);
    .filter(excludeByLength);

  for (let index = grouping; index < words.length; index++) {
    const phrase = words.slice(index - grouping, index + 1).join(' ').trim();

    if (phrases.has(phrase)) {
      phrases.set(phrase, 1 + phrases.get(phrase));
    } else {
      phrases.set(phrase, 1);
    }
  }

  return phrases;
}

function sortByFrecuency(map) {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

function topKeys(map, top = 10) {
  return sortByFrecuency(map).filter(a => a[1] > 1).slice(0, top);
}

function findLongestPhrases(text) {
  const phrases = new Map();

  const words = text
    .split(/\b/)
    .map(tokenize)
    // .filter(excludedWords);
    .filter(excludeByLength);

  // console.log({words});

  const grouping = 3;

  for (let index = grouping; index < words.length; index++) {
    const phrase = words.slice(index - grouping, index).join(' ').trim();

    for (let index2 = index + 1; index2 < words.length; index2++) {
      const phrase2 = words.slice(index2 - grouping, index2).join(' ').trim();

      if (phrase.length < 1 || phrase !== phrase2) continue;

      // console.log({phrase, phrase2, index, index2})
      if (phrases.has(phrase)) {
        phrases.set(phrase, 1 + phrases.get(phrase));
      } else {
        phrases.set(phrase, 2);
      }
    }
  }

  return phrases;
}

async function main() {
  // read text file
  const text = await fs.readFile('data/repeated.txt', 'utf8');
  // const text = await fs.readFile('data/The-Science-of-Getting-Rich-summary3.txt', 'utf8');
  // const text = await fs.readFile('data/The-Science-of-Getting-Rich-summary2.txt', 'utf8');
  // const text = await fs.readFile('data/The-Science-of-Getting-Rich-summary1.txt', 'utf8');
  // const text = await fs.readFile('data/The-Science-of-Getting-Rich-summary.txt', 'utf8');
  // const text = await fs.readFile('data/The-Science-of-Getting-Rich.txt', 'utf8');
  // get the most repeated words
  const words = getMostRepeatedWords(text);

  // console.log({text, words});
  const sortedWords = topKeys(words);
  console.log({sortedWords});

  // get 2-word phrases
  const phrases = getPhrases(text);
  const sortedPhrases = topKeys(phrases);
  console.log({sortedPhrases});

  // get 3-word phrases
  const phrases3 = getNPhrases(text, 2);
  const sortedPhrases3 = topKeys(phrases3);
  console.log({sortedPhrases3});

  // longest repeated phrases
  // Find the longest repeated phrases (could be multiple sentenses).
  const phasesn = findLongestPhrases(text);
  const sortedPhrasesN = topKeys(phasesn);
  console.log({sortedPhrasesN});
}

main();
