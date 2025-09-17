import { applyTranslations, getCurrentLanguage, setCurrentLanguage, t, formatCurrency, formatDate } from './i18n.js';
import { getToken, fetchUser } from './api.js';

const demoOverview = {
  monthly: 482.4,
  yearly: 5788.8,
  active: 14
};

const demoUpcoming = [
  { name: 'Netflix', category: 'entertainment', amount: 15.99, currency: 'USD', date: offsetDate(1) },
  { name: 'Spotify', category: 'entertainment', amount: 9.99, currency: 'USD', date: offsetDate(2) },
  { name: 'Adobe CC', category: 'software', amount: 54.99, currency: 'USD', date: offsetDate(5) },
  { name: 'NYTimes', category: 'news', amount: 6.5, currency: 'USD', date: offsetDate(6) }
];

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

async function ensureAuthenticatedRedirect() {
  const token = getToken();
  if (!token) return;
  try {
    await fetchUser();
    window.location.href = '/dashboard.html';
  } catch (error) {
    console.warn('Failed to validate token', error);
  }
}

function renderFeatureCards() {
  const container = document.querySelector('#feature-grid');
  if (!container) return;
  container.innerHTML = '';
  const cards = t('landing.featureCards');
  cards.forEach(card => {
    const element = document.createElement('article');
    element.className = 'feature-card';
    const title = document.createElement('h3');
    title.textContent = card.title;
    const description = document.createElement('p');
    description.textContent = card.description;
    element.appendChild(title);
    element.appendChild(description);
    container.appendChild(element);
  });
}

function renderAnalyticsTab(tab) {
  const overviewSection = document.querySelector('#analytics-overview');
  const upcomingSection = document.querySelector('#analytics-upcoming');
  if (!overviewSection || !upcomingSection) return;
  const tabs = document.querySelectorAll('[data-analytics-tab]');
  tabs.forEach(btn => {
    if (btn.dataset.analyticsTab === tab) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (tab === 'overview') {
    overviewSection.innerHTML = '';
    overviewSection.classList.remove('hidden');
    upcomingSection.classList.add('hidden');

    const monthly = document.createElement('div');
    monthly.className = 'analytics-card';
    monthly.innerHTML = `<span>${t('landing.analyticsOverview.monthly')}</span><strong>${formatCurrency(demoOverview.monthly, 'USD')}</strong>`;

    const yearly = document.createElement('div');
    yearly.className = 'analytics-card';
    yearly.innerHTML = `<span>${t('landing.analyticsOverview.yearly')}</span><strong>${formatCurrency(demoOverview.yearly, 'USD')}</strong>`;

    const active = document.createElement('div');
    active.className = 'analytics-card';
    active.innerHTML = `<span>${t('landing.analyticsOverview.active')}</span><strong>${demoOverview.active}</strong>`;

    overviewSection.appendChild(monthly);
    overviewSection.appendChild(yearly);
    overviewSection.appendChild(active);
  } else {
    upcomingSection.innerHTML = '';
    overviewSection.classList.add('hidden');
    upcomingSection.classList.remove('hidden');

    demoUpcoming.forEach(item => {
      const row = document.createElement('div');
      row.className = 'upcoming-item';
      const name = document.createElement('span');
      name.className = 'upcoming-name';
      name.textContent = item.name;

      const category = document.createElement('span');
      category.className = 'badge';
      category.textContent = t(`categories.${item.category}`);

      const date = document.createElement('span');
      date.className = 'upcoming-date';
      date.textContent = formatDate(item.date);

      const amount = document.createElement('span');
      amount.className = 'upcoming-amount';
      amount.textContent = formatCurrency(item.amount, item.currency);

      row.appendChild(name);
      row.appendChild(category);
      row.appendChild(date);
      row.appendChild(amount);

      upcomingSection.appendChild(row);
    });
  }
}

function setupAnalyticsTabs() {
  const buttons = document.querySelectorAll('[data-analytics-tab]');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      renderAnalyticsTab(button.dataset.analyticsTab);
    });
  });
}

function setupNavigation() {
  const links = document.querySelectorAll('[data-scroll-to]');
  links.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const targetId = link.dataset.scrollTo;
      const section = document.querySelector(targetId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  const heroPrimary = document.querySelector('#hero-primary');
  if (heroPrimary) {
    heroPrimary.addEventListener('click', () => {
      window.location.href = '/login.html';
    });
  }

  const heroSecondary = document.querySelector('#hero-secondary');
  if (heroSecondary) {
    heroSecondary.addEventListener('click', () => {
      const analytics = document.querySelector('#analytics');
      if (analytics) {
        analytics.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  const navLogin = document.querySelector('#nav-login');
  if (navLogin) {
    navLogin.addEventListener('click', event => {
      event.preventDefault();
      window.location.href = '/login.html';
    });
  }
}

function setupLanguageToggle() {
  const toggleButtons = document.querySelectorAll('[data-language]');
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const lang = button.dataset.language;
      setCurrentLanguage(lang);
      refreshLandingContent();
      toggleButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.language === lang));
    });
  });
  toggleButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.language === getCurrentLanguage()));
}

function refreshLandingContent() {
  applyTranslations();
  renderFeatureCards();
  renderAnalyticsTab(document.querySelector('[data-analytics-tab].active')?.dataset.analyticsTab || 'overview');
  renderSteps();
  renderFaq();
  renderSecurity();
}

function renderFaq() {
  const faqContainer = document.querySelector('#faq-list');
  if (!faqContainer) return;
  faqContainer.innerHTML = '';
  const faqItems = t('landing.faqItems');
  faqItems.forEach(item => {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = item.question;
    const answer = document.createElement('p');
    answer.textContent = item.answer;
    details.appendChild(summary);
    details.appendChild(answer);
    faqContainer.appendChild(details);
  });
}

function renderSecurity() {
  const list = document.querySelector('#security-points');
  if (!list) return;
  list.innerHTML = '';
  const points = t('landing.securityPoints');
  points.forEach(point => {
    const li = document.createElement('li');
    li.textContent = point;
    list.appendChild(li);
  });
}

function renderSteps() {
  const container = document.querySelector('#steps');
  if (!container) return;
  container.innerHTML = '';
  const steps = t('landing.steps');
  steps.forEach(step => {
    const li = document.createElement('li');
    const title = document.createElement('h4');
    title.textContent = step.title;
    const text = document.createElement('p');
    text.textContent = step.text;
    li.appendChild(title);
    li.appendChild(text);
    container.appendChild(li);
  });
}

function setupHeaderObserver() {
  const header = document.querySelector('header');
  const hero = document.querySelector('.hero');
  if (!header || !hero) return;
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        header.classList.toggle('solid', !entry.isIntersecting);
      });
    },
    { threshold: 0 }
  );
  observer.observe(hero);
}

function setupMobileMenu() {
  const burger = document.querySelector('#burger');
  const nav = document.querySelector('#nav-items');
  if (!burger || !nav) return;
  burger.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await ensureAuthenticatedRedirect();
  applyTranslations();
  renderFeatureCards();
  setupNavigation();
  setupLanguageToggle();
  setupAnalyticsTabs();
  renderAnalyticsTab('overview');
  renderSteps();
  renderFaq();
  renderSecurity();
  setupHeaderObserver();
  setupMobileMenu();
});
