import { applyTranslations, setCurrentLanguage, getCurrentLanguage, t } from './i18n.js';
import { fetchUser, updateUser, logout as apiLogout, exportSubscriptions, setToken } from './api.js';
import { showToast, showConfirm } from './ui.js';
import { downloadFileFromResponse } from './util.js';

let currentUser = null;

async function initialize() {
  try {
    currentUser = await fetchUser();
    setCurrentLanguage(currentUser.language || 'ru');
    applyTranslations();
    populate();
    setupListeners();
  } catch (error) {
    console.error('Failed to load user', error);
    window.location.href = '/login.html';
  }
}

function populate() {
  document.querySelector('#account-email').textContent = currentUser.email;
  document.querySelector('#language-select').value = currentUser.language || getCurrentLanguage();
  document.querySelector('#currency-select').value = currentUser.displayCurrency || 'USD';
  document.querySelector('#email-confirmed').checked = Boolean(currentUser.emailConfirmed);
}

function setupListeners() {
  document.querySelector('#language-select').addEventListener('change', async event => {
    const lang = event.target.value;
    try {
      currentUser = await updateUser({ language: lang });
      setCurrentLanguage(lang);
      applyTranslations();
      populate();
      showToast(t('settings.languageSaved'), 'success');
    } catch (error) {
      console.error(error);
      showToast(t('notifications.error'), 'error');
    }
  });

  document.querySelector('#currency-select').addEventListener('change', async event => {
    const currency = event.target.value;
    try {
      currentUser = await updateUser({ displayCurrency: currency });
      showToast(t('settings.currencySaved'), 'success');
    } catch (error) {
      console.error(error);
      showToast(t('notifications.error'), 'error');
    }
  });

  document.querySelector('#email-confirmed').addEventListener('change', async event => {
    try {
      currentUser = await updateUser({ emailConfirmed: event.target.checked });
    } catch (error) {
      console.error(error);
      showToast(t('notifications.error'), 'error');
      event.target.checked = !event.target.checked;
    }
  });

  document.querySelector('#export-btn').addEventListener('click', async () => {
    try {
      const response = await exportSubscriptions();
      await downloadFileFromResponse(response, 'subscriptions-export.json');
      showToast(t('settings.export'), 'success');
    } catch (error) {
      console.error(error);
      showToast(t('notifications.error'), 'error');
    }
  });

  document.querySelector('#clear-local').addEventListener('click', async () => {
    const confirmed = await showConfirm({
      title: t('settings.confirmClear'),
      message: t('settings.confirmClearDetail'),
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel')
    });
    if (!confirmed) return;
    localStorage.removeItem('subtrack-language');
    localStorage.removeItem('subtrack-token');
    setToken(null);
    showToast(t('notifications.localCleared'), 'info');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 500);
  });

  document.querySelector('#logout-btn').addEventListener('click', async () => {
    await apiLogout();
    setToken(null);
    window.location.href = '/login.html';
  });
}

document.addEventListener('DOMContentLoaded', initialize);
