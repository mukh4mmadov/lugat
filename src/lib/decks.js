// The word decks a learner can study with the Anki-style reviewer.
import { allWords } from "../data";
import { hasTopikDeck, loadTopikVocab, topikDeckWords } from "../data/topikVocab";

export const DECKS = [
  { id: "lessons", titleKey: "anki.deck.lessons", textKey: "anki.deck.lessonsText", words: () => allWords, ready: () => Promise.resolve(allWords), available: () => true },
  { id: "topik1", titleKey: "anki.deck.topik1", textKey: "anki.deck.topik1Text", words: () => topikDeckWords("topik1"), ready: () => loadTopikVocab("topik1"), available: () => hasTopikDeck("topik1") },
];

export const getDeck = (id) => DECKS.find((deck) => deck.id === id) || null;

export function availableDecks() {
  return DECKS.filter((deck) => deck.available());
}

// The words of the decks turned on in the settings, without repeats.
export function enabledDeckWords(options) {
  const seen = new Set();
  const words = [];
  for (const deck of availableDecks()) {
    if (!options.decks?.[deck.id]) continue;
    for (const word of deck.words()) {
      const key = `${word.lesson}-${word.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      words.push(word);
    }
  }
  return words;
}

export function loadEnabledDecks(options) {
  return Promise.all(availableDecks().filter((deck) => options.decks?.[deck.id]).map((deck) => deck.ready()));
}
