import { getQuote } from './api';

const STORAGE_KEY = 'your-energy-quote';

function today() {
  return new Date().toLocaleDateString('en-CA');
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function saveCache(entry) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // storage unavailable, the quote is just fetched again next time
  }
}

function render({ quote, author }) {
  const text = document.querySelector('[data-quote-text]');
  const name = document.querySelector('[data-quote-author]');
  if (!text || !name) return;

  text.textContent = quote;
  name.textContent = author;
}

export async function initQuote() {
  if (!document.querySelector('[data-quote-text]')) return;

  const cached = readCache();
  if (cached?.date === today()) {
    render(cached);
    return;
  }

  try {
    const { quote, author } = await getQuote();
    const entry = { quote, author, date: today() };
    render(entry);
    saveCache(entry);
  } catch {
    if (cached) render(cached);
  }
}
