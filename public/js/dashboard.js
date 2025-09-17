import { applyTranslations, setCurrentLanguage, t, formatCurrency, formatDate } from './i18n.js';
import {
  fetchUser,
  fetchSubscriptions,
  logout as apiLogout,
  createSubscription,
  updateSubscription,
  toggleSubscription,
  deleteSubscription
} from './api.js';
import { showToast, showConfirm, openCustomModal } from './ui.js';
import {
  convertCurrency,
  monthlyAmount,
  yearlyAmount,
  paymentsWithinDays,
  groupByCategory,
  tomorrowISO
} from './util.js';

let currentUser = null;
let subscriptions = [];

async function initialize() {
  try {
    currentUser = await fetchUser();
    setCurrentLanguage(currentUser.language || 'ru');
    applyTranslations();
    await loadSubscriptions();
    setupListeners();
  } catch (error) {
    console.error('Failed to load user', error);
    window.location.href = '/login.html';
  }
}

async function loadSubscriptions() {
  try {
    subscriptions = await fetchSubscriptions();
    render();
  } catch (error) {
    console.error(error);
    showToast(t('notifications.error'), 'error');
  }
}

function setupListeners() {
  document.querySelector('#logout-btn').addEventListener('click', async () => {
    await apiLogout();
    showToast(t('notifications.loggedOut'), 'info');
    window.location.href = '/login.html';
  });
  const addBtn = document.querySelector('#add-subscription');
  const emptyAdd = document.querySelector('#empty-add');
  addBtn.addEventListener('click', () => openSubscriptionModal());
  emptyAdd.addEventListener('click', () => openSubscriptionModal());
}

function render() {
  renderMetrics();
  renderSubscriptions();
  renderUpcoming();
}

function renderMetrics() {
  const displayCurrency = currentUser.displayCurrency || 'USD';
  let monthlyTotal = 0;
  let yearlyTotal = 0;
  let activeCount = 0;
  const activeSubs = subscriptions.filter(sub => sub.active);
  activeSubs.forEach(sub => {
    const monthly = monthlyAmount(sub.amount, sub.period);
    const yearly = yearlyAmount(sub.amount, sub.period);
    monthlyTotal += convertCurrency(monthly, sub.currency, displayCurrency);
    yearlyTotal += convertCurrency(yearly, sub.currency, displayCurrency);
  });
  activeCount = activeSubs.length;
  const payments = paymentsWithinDays(activeSubs, 30);

  document.querySelector('#metric-monthly').textContent = formatCurrency(monthlyTotal, displayCurrency);
  document.querySelector('#metric-yearly').textContent = formatCurrency(yearlyTotal, displayCurrency);
  document.querySelector('#metric-active').textContent = activeCount;
  document.querySelector('#metric-payments').textContent = payments.length;
}

function renderSubscriptions() {
  const container = document.querySelector('#subscriptions-container');
  const emptyState = document.querySelector('#empty-state');
  container.innerHTML = '';

  if (!subscriptions.length) {
    emptyState.hidden = false;
    container.hidden = true;
    return;
  }

  emptyState.hidden = true;
  container.hidden = false;

  subscriptions
    .slice()
    .sort((a, b) => new Date(a.nextPayment) - new Date(b.nextPayment))
    .forEach(subscription => {
      container.appendChild(createSubscriptionCard(subscription));
    });
}

function createSubscriptionCard(subscription) {
  const displayCurrency = currentUser.displayCurrency || 'USD';
  const card = document.createElement('article');
  card.className = `subscription-card ${subscription.active ? 'active' : 'inactive'}`;

  const header = document.createElement('div');
  header.className = 'card-header';

  const title = document.createElement('h3');
  title.textContent = subscription.name;

  const badge = document.createElement('span');
  badge.className = `badge category-${subscription.category}`;
  badge.textContent = t(`categories.${subscription.category}`);

  const status = document.createElement('span');
  status.className = `status ${subscription.active ? 'active' : 'inactive'}`;
  status.textContent = subscription.active ? t('common.statusActive') : t('common.statusInactive');

  header.appendChild(title);
  header.appendChild(badge);
  header.appendChild(status);

  const description = document.createElement('p');
  description.className = 'card-description';
  description.textContent = subscription.description || '';

  const amounts = document.createElement('div');
  amounts.className = 'card-amounts';
  const perPeriod = document.createElement('div');
  perPeriod.innerHTML = `<span>${t('common.amountPerPeriod')}</span><strong>${formatCurrency(subscription.amount, subscription.currency)}</strong>`;
  const perMonthValue = convertCurrency(monthlyAmount(subscription.amount, subscription.period), subscription.currency, displayCurrency);
  const perMonth = document.createElement('div');
  perMonth.innerHTML = `<span>${t('common.amountPerMonth')}</span><strong>${formatCurrency(perMonthValue, displayCurrency)}</strong>`;

  amounts.appendChild(perPeriod);
  amounts.appendChild(perMonth);

  const nextPayment = document.createElement('div');
  nextPayment.className = 'card-next';
  nextPayment.innerHTML = `<span>${t('dashboard.cards.nextPayment')}</span><strong>${formatDate(subscription.nextPayment)}</strong>`;

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  if (subscription.url) {
    const openButton = document.createElement('a');
    openButton.href = subscription.url;
    openButton.target = '_blank';
    openButton.rel = 'noopener';
    openButton.className = 'btn ghost';
    openButton.textContent = t('common.openSite');
    actions.appendChild(openButton);
  }

  const toggleButton = document.createElement('button');
  toggleButton.className = 'btn ghost';
  toggleButton.textContent = subscription.active ? t('common.deactivate') : t('common.activate');
  toggleButton.addEventListener('click', async () => {
    const confirmed = await showConfirm({
      title: t('dashboard.confirmDeactivate'),
      message: subscription.name,
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel')
    });
    if (!confirmed) return;
    try {
      const updated = await toggleSubscription(subscription.id);
      subscriptions = subscriptions.map(sub => (sub.id === updated.id ? updated : sub));
      showToast(t('notifications.toggled'), 'success');
      render();
    } catch (error) {
      console.error(error);
      showToast(t('notifications.error'), 'error');
    }
  });

  const editButton = document.createElement('button');
  editButton.className = 'btn ghost';
  editButton.textContent = t('common.edit');
  editButton.addEventListener('click', () => openSubscriptionModal(subscription));

  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn danger';
  deleteButton.textContent = t('common.delete');
  deleteButton.addEventListener('click', async () => {
    const confirmed = await showConfirm({
      title: t('dashboard.confirmDelete'),
      message: t('dashboard.confirmDeleteDetail'),
      confirmText: t('common.yesRemove'),
      cancelText: t('common.noKeep')
    });
    if (!confirmed) return;
    try {
      await deleteSubscription(subscription.id);
      subscriptions = subscriptions.filter(sub => sub.id !== subscription.id);
      showToast(t('notifications.deleted'), 'success');
      render();
    } catch (error) {
      console.error(error);
      showToast(t('notifications.error'), 'error');
    }
  });

  actions.appendChild(toggleButton);
  actions.appendChild(editButton);
  actions.appendChild(deleteButton);

  card.appendChild(header);
  card.appendChild(description);
  card.appendChild(amounts);
  card.appendChild(nextPayment);
  card.appendChild(actions);

  return card;
}

function renderUpcoming() {
  const container = document.querySelector('#upcoming-list');
  const empty = document.querySelector('#upcoming-empty');
  container.innerHTML = '';
  const displayCurrency = currentUser.displayCurrency || 'USD';
  const upcoming = paymentsWithinDays(subscriptions, 7);
  if (!upcoming.length) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  const grouped = groupByCategory(upcoming);
  Object.keys(grouped).forEach(categoryKey => {
    const groupBlock = document.createElement('div');
    groupBlock.className = 'upcoming-group';
    const heading = document.createElement('h3');
    heading.textContent = t(`categories.${categoryKey}`);
    groupBlock.appendChild(heading);
    grouped[categoryKey]
      .sort((a, b) => new Date(a.nextPayment) - new Date(b.nextPayment))
      .forEach(item => {
        const row = document.createElement('div');
        row.className = 'upcoming-row';
        const name = document.createElement('span');
        name.className = 'row-name';
        name.textContent = item.name;

        const date = document.createElement('span');
        date.className = 'row-date';
        date.textContent = formatDate(item.nextPayment);

        const amount = document.createElement('span');
        amount.className = 'row-amount';
        const converted = convertCurrency(item.amount, item.currency, displayCurrency);
        amount.textContent = formatCurrency(converted, displayCurrency);

        row.appendChild(name);
        row.appendChild(date);
        row.appendChild(amount);
        groupBlock.appendChild(row);
      });
    container.appendChild(groupBlock);
  });
}

function openSubscriptionModal(subscription = null) {
  openCustomModal(close => {
    const isEdit = Boolean(subscription);
    const titleElement = document.createElement('div');
    titleElement.textContent = isEdit ? t('modal.titleEdit') : t('modal.titleCreate');

    const form = document.createElement('form');
    form.className = 'subscription-form';

    const nameField = createTextField('name', t('modal.name'), subscription?.name || '');
    const descriptionField = createTextArea('description', t('modal.description'), subscription?.description || '');
    const amountField = createNumberField('amount', t('modal.amount'), subscription?.amount || '');
    const currencyField = createSelectField('currency', t('modal.currency'), ['USD', 'EUR', 'RUB'], subscription?.currency || 'USD');
    const periodField = createSelectField('period', t('modal.period'), ['week', 'month', 'quarter', 'year'], subscription?.period || 'month');
    const nextPaymentField = createDateField(
      'nextPayment',
      t('modal.nextPayment'),
      subscription ? subscription.nextPayment.split('T')[0] : tomorrowISO()
    );
    const categoryField = createSelectField(
      'category',
      t('modal.category'),
      ['entertainment', 'utilities', 'software', 'food', 'health', 'education', 'news', 'productivity', 'other'],
      subscription?.category || 'other'
    );
    const urlField = createTextField('url', t('modal.url'), subscription?.url || '', 'url');
    const activeField = createCheckbox('active', t('modal.active'), subscription?.active !== false);

    [
      nameField,
      descriptionField,
      amountField,
      currencyField,
      periodField,
      nextPaymentField,
      categoryField,
      urlField,
      activeField
    ].forEach(field => form.appendChild(field));

    const footerElement = document.createElement('div');
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'btn ghost';
    cancelButton.textContent = t('modal.cancel');
    cancelButton.addEventListener('click', () => close());

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn primary';
    submitButton.textContent = t('modal.save');

    footerElement.appendChild(cancelButton);
    footerElement.appendChild(submitButton);

    form.addEventListener('submit', async event => {
      event.preventDefault();
      submitButton.disabled = true;
      try {
        const payload = collectFormData(form);
        if (isEdit) {
          const updated = await updateSubscription(subscription.id, payload);
          subscriptions = subscriptions.map(sub => (sub.id === updated.id ? updated : sub));
          showToast(t('notifications.updated'), 'success');
        } else {
          const created = await createSubscription(payload);
          subscriptions.push(created);
          showToast(t('notifications.created'), 'success');
        }
        render();
        close();
      } catch (error) {
        console.error(error);
        showToast(error.message || t('notifications.error'), 'error');
      } finally {
        submitButton.disabled = false;
      }
    });

    return {
      titleElement,
      bodyElement: form,
      footerElement,
      onClose: null
    };
  });
}

function collectFormData(form) {
  const formData = new FormData(form);
  const amount = Number(formData.get('amount'));
  if (!amount || amount <= 0) {
    throw new Error(t('notifications.error'));
  }
  const nextPayment = formData.get('nextPayment');
  if (!nextPayment) {
    throw new Error(t('notifications.error'));
  }
  const nextPaymentISO = new Date(`${nextPayment}T00:00:00`).toISOString();
  const name = (formData.get('name') || '').toString().trim();
  if (!name) {
    throw new Error(t('notifications.error'));
  }
  return {
    name,
    description: (formData.get('description') || '').toString().trim(),
    amount,
    currency: formData.get('currency'),
    period: formData.get('period'),
    nextPayment: nextPaymentISO,
    category: formData.get('category'),
    url: (formData.get('url') || '').toString().trim(),
    active: formData.get('active') === 'on'
  };
}

function createTextField(name, label, value = '', type = 'text') {
  const wrapper = document.createElement('label');
  wrapper.className = 'form-field';
  wrapper.textContent = label;
  const input = document.createElement('input');
  input.type = type;
  input.name = name;
  input.required = name !== 'url';
  input.value = value;
  if (type === 'number') {
    input.min = '0';
    input.step = '0.01';
  }
  wrapper.appendChild(input);
  return wrapper;
}

function createTextArea(name, label, value = '') {
  const wrapper = document.createElement('label');
  wrapper.className = 'form-field';
  wrapper.textContent = label;
  const textarea = document.createElement('textarea');
  textarea.name = name;
  textarea.rows = 3;
  textarea.value = value;
  wrapper.appendChild(textarea);
  return wrapper;
}

function createNumberField(name, label, value = '') {
  return createTextField(name, label, value, 'number');
}

function createSelectField(name, label, options, selected) {
  const wrapper = document.createElement('label');
  wrapper.className = 'form-field';
  const span = document.createElement('span');
  span.textContent = label;
  const select = document.createElement('select');
  select.name = name;
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = name === 'period' ? t(`periods.${option}`) : t(`categories.${option}`) || option;
    if (name === 'currency') {
      opt.textContent = option;
    }
    if (option === selected) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
  wrapper.appendChild(span);
  wrapper.appendChild(select);
  return wrapper;
}

function createDateField(name, label, value) {
  const wrapper = document.createElement('label');
  wrapper.className = 'form-field';
  wrapper.textContent = label;
  const input = document.createElement('input');
  input.type = 'date';
  input.name = name;
  input.required = true;
  input.value = value;
  wrapper.appendChild(input);
  return wrapper;
}

function createCheckbox(name, label, checked) {
  const wrapper = document.createElement('label');
  wrapper.className = 'form-checkbox';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.name = name;
  input.checked = checked;
  const span = document.createElement('span');
  span.textContent = label;
  wrapper.appendChild(input);
  wrapper.appendChild(span);
  return wrapper;
}

document.addEventListener('DOMContentLoaded', initialize);
