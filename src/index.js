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

function excludeWhitespace(word) {
  return word && word.trim().length > 0;
}

function excludeByLength(word) {
  return excludeWhitespace(word) > MIN_WORD_LENGTH;
}

function excludedWords(word) {
  return excludeByLength(word) && !EXCLUDED_WORDS_MAP[word];
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

function findLongestPhrasesOld(text) {
  const phrases = new Map();

  const words = text
    .split(/\b/)
    .map(tokenize)
    // .filter(excludedWords);
    .filter(excludeByLength);

  // console.log({words});

  const grouping = 4;

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

function indexOfAll(text, word) {
  let count = -1;
  for (let index = 0; index < text.length; index++) {
    const newIndex = text.slice(index).indexOf(word);
    if (newIndex > -1) {
      count += 1;
      index += newIndex;
    }
  }
  return count < 0 ? 0 : (count + 1);
}

function findLongestPhrasesFrecuency(text, numWords = 4) {
  const words = text
    .split(/\b/)
    .map(tokenize)
    .filter(excludeWhitespace);
    // .filter(excludedWords);
    // .filter(excludeByLength);

  // console.log({words})

  const joinedWords = words.join(' ');

  const repeated = findLongestRepeatedPhrases(words, numWords);
  for (const [phrase] of repeated.entries()) {
    const count = indexOfAll(joinedWords, phrase);
    repeated.set(phrase, count);
  }
  return repeated;
}

function findLongestRepeatedPhrases(words, numWords = 3) {
  const phrases = new Map();

  // console.log({words});

  for (let index = 0; index < words.length; index++) {
    let longest = '';
    let distance = 0;
    const joinedWords = words.slice(index).join(' ');
    // console.log({joinedWords});

    for (let grouping = numWords; grouping < words.length; grouping++) {
      const phrase = words.slice(index, index + grouping).join(' ').trim();
      // console.log({ phrase, grouping, index, slice: (index + phrase.length), found: index + phrase.length + joinedWords.slice(index + phrase.length).indexOf(phrase) });

      if (joinedWords.slice(phrase.length).indexOf(phrase) > -1) {
        longest = phrase;
        distance = grouping;
      } else {
        break;
      }
    }

    const len = longest.length;
    if (len) {
      phrases.set(longest, 2);
      index += distance;
    }

    // console.log('index', index);
  }

  return phrases;
}


async function main() {
  // read text file
  // const text = await fs.readFile('data/repeated.txt', 'utf8');
  // const text = await fs.readFile('data/The-Science-of-Getting-Rich-summary3.txt', 'utf8');
  // const text = await fs.readFile('data/The-Science-of-Getting-Rich-summary2.txt', 'utf8');
  // const text = await fs.readFile('data/The-Science-of-Getting-Rich-summary1.txt', 'utf8');
  const text = await fs.readFile('data/The-Science-of-Getting-Rich-summary.txt', 'utf8');
  // const text = await fs.readFile('data/The-Science-of-Getting-Rich.txt', 'utf8');

  // get the most repeated words
  const words = getMostRepeatedWords(text);

  // console.log({text, words});
  const sortedWord1 = topKeys(words);
  console.log({sortedWords: sortedWord1});

  // get 2-word phrases
  const phrases = getPhrases(text);
  const sortedWord2 = topKeys(phrases);
  console.log({sortedPhrases: sortedWord2});

  // get 3-word phrases
  const phrases3 = getNPhrases(text, 2);
  const sortedWord3 = topKeys(phrases3);
  console.log({sortedPhrases3: sortedWord3});

  // longest repeated phrases
  // Find the longest repeated phrases (could be multiple sentenses).
  const phasesn = findLongestPhrasesFrecuency(text);
  const sortedWordN = topKeys(phasesn, 40);
  console.log({sortedPhrasesN: sortedWordN});
}

// main();

module.exports = {
  indexOfAll,
  findLongestPhrasesFrecuency,
  findLongestRepeatedPhrases,
};
