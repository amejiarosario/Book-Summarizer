// get the most repeated 2-words
// get the most repeated 3-words

// exclude articles.
// include only sustantives and verbs
const fs = require('fs').promises;

function tokenize(word) {
  return word.toLowerCase().trim();
}

function getMostRepeatedWords(text) {
  return text.split(/\b/).reduce((map, word) => {
    const token = tokenize(word);

    if (map.has(token)) {
      map.set(token, 1 + map.get(token));
    } else {
      map.set(token, 1);
    }

    return map;
  }, new Map());
}

async function main() {
  // read text file
  // const text = await fs.readFile('data/The-Science-of-Getting-Rich.txt', 'utf8');
  const text = (await fs.readFile('data/The-Science-of-Getting-Rich.txt', 'utf8')).substring(0, 1e4);
  // get the most repeated words
  const words = getMostRepeatedWords(text);

  // console.log({text, words});
  const sortedWords = Array.from(words.entries()).sort((a, b) => b[1] - a[1]);
  console.log({sortedWords});
}

main();
