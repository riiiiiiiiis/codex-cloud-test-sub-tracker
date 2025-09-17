import { applyTranslations, getCurrentLanguage, setCurrentLanguage, t } from './i18n.js';
import { login, register, setToken, fetchUser, getToken } from './api.js';
import { showToast } from './ui.js';

let mode = 'login';

async function redirectIfAuthenticated() {
  const token = getToken();
  if (!token) return;
  try {
    await fetchUser();
    window.location.href = '/dashboard.html';
  } catch (error) {
    console.warn('Token invalid', error);
    setToken(null);
  }
}

function setMode(newMode) {
  mode = newMode;
  const tabs = document.querySelectorAll('.auth-tabs .tab');
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });
  const submitBtn = document.querySelector('#submit-btn');
  const switchLink = document.querySelector('#switch-link');
  const registerHint = document.querySelector('#register-only');
  if (mode === 'login') {
    submitBtn.dataset.i18n = 'auth.submitLogin';
    switchLink.dataset.i18n = 'auth.switchToRegister';
    registerHint.setAttribute('hidden', '');
  } else {
    submitBtn.dataset.i18n = 'auth.submitRegister';
    switchLink.dataset.i18n = 'auth.switchToLogin';
    registerHint.removeAttribute('hidden');
  }
  applyTranslations();
}

function setupTabs() {
  document.querySelectorAll('.auth-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => setMode(tab.dataset.mode));
  });
  const switchLink = document.querySelector('#switch-link');
  switchLink.addEventListener('click', event => {
    event.preventDefault();
    setMode(mode === 'login' ? 'register' : 'login');
  });
}

function setupLanguageSwitcher() {
  const buttons = document.querySelectorAll('[data-language]');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const lang = button.dataset.language;
      setCurrentLanguage(lang);
      applyTranslations();
      setMode(mode);
      buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.language === lang));
    });
    button.classList.toggle('active', button.dataset.language === getCurrentLanguage());
  });
}

function showMessage(text, type = 'info') {
  const messageBox = document.querySelector('#auth-message');
  if (!text) {
    messageBox.hidden = true;
    messageBox.textContent = '';
    return;
  }
  messageBox.hidden = false;
  messageBox.textContent = text;
  messageBox.dataset.type = type;
}

function setLoading(isLoading) {
  const button = document.querySelector('#submit-btn');
  button.disabled = isLoading;
  button.classList.toggle('loading', isLoading);
}

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value.trim();
  if (!email || !password) {
    showMessage(t('auth.errors.required'), 'error');
    return;
  }
  setLoading(true);
  showMessage('');
  try {
    if (mode === 'register') {
      await register({ email, password, language: getCurrentLanguage() });
      showToast(t('auth.successRegistration'), 'success');
      setMode('login');
      form.reset();
    } else {
      const data = await login({ email, password });
      setToken(data.token);
      showToast(t('notifications.loginWelcome'), 'success');
      if (data.message) {
        showMessage(data.message, 'info');
      }
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 800);
    }
  } catch (error) {
    console.error(error);
    showMessage(error.message || t('auth.errors.generic'), 'error');
    showToast(t('auth.errors.generic'), 'error');
  } finally {
    setLoading(false);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await redirectIfAuthenticated();
  applyTranslations();
  setupTabs();
  setupLanguageSwitcher();
  document.querySelector('#auth-form').addEventListener('submit', handleSubmit);
  setMode('login');
});
