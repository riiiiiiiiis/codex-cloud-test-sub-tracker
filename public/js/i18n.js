const STORAGE_KEY = 'subtrack-language';

export function getAvailableLanguages() {
  return Object.keys(window.TRANSLATIONS || { ru: {}, en: {} });
}

export function getCurrentLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && getAvailableLanguages().includes(saved)) {
    return saved;
  }
  return 'ru';
}

export function setCurrentLanguage(lang) {
  if (!getAvailableLanguages().includes(lang)) return;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
}

export function t(key) {
  const lang = getCurrentLanguage();
  const segments = key.split('.');
  let node = window.TRANSLATIONS?.[lang];
  for (const segment of segments) {
    if (node && Object.prototype.hasOwnProperty.call(node, segment)) {
      node = node[segment];
    } else {
      return key;
    }
  }
  return node;
}

export function applyTranslations(root = document) {
  const lang = getCurrentLanguage();
  document.documentElement.lang = lang;
  const elements = root.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.dataset.i18n;
    const value = t(key);
    if (value === undefined || value === null) return;
    if (element.dataset.i18nAttr) {
      element.setAttribute(element.dataset.i18nAttr, value);
    } else if (typeof value === 'string') {
      if (element.dataset.i18nHtml === 'true') {
        element.innerHTML = value;
      } else {
        element.textContent = value;
      }
    }
  });
}

export function formatCurrency(value, currency) {
  try {
    return new Intl.NumberFormat(getCurrentLanguage() === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency
    }).format(value);
  } catch (error) {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat(getCurrentLanguage() === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}
