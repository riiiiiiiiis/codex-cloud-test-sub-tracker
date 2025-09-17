import { formatCurrency, formatDate } from './i18n.js';

export const CURRENCY_RATES = {
  USD: 1,
  EUR: 1.08,
  RUB: 0.011
};

export const PERIODS_IN_MONTH = {
  week: 52 / 12,
  month: 1,
  quarter: 1 / 3,
  year: 1 / 12
};

export const PERIODS_IN_YEAR = {
  week: 52,
  month: 12,
  quarter: 4,
  year: 1
};

export function convertCurrency(amount, fromCurrency, toCurrency) {
  const fromRate = CURRENCY_RATES[fromCurrency] || 1;
  const toRate = CURRENCY_RATES[toCurrency] || 1;
  const amountInUsd = amount * fromRate;
  return amountInUsd / toRate;
}

export function monthlyAmount(amount, period) {
  const factor = PERIODS_IN_MONTH[period] || 1;
  return amount * factor;
}

export function yearlyAmount(amount, period) {
  const factor = PERIODS_IN_YEAR[period] || 1;
  return amount * factor;
}

export function formatAmount(amount, currency) {
  return formatCurrency(amount, currency);
}

export function readableDate(dateString) {
  return formatDate(dateString);
}

export function tomorrowISO() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  return tomorrow.toISOString().split('T')[0];
}

export function sortByDateAscending(items, key) {
  return [...items].sort((a, b) => new Date(a[key]) - new Date(b[key]));
}

export function paymentsWithinDays(subscriptions, days) {
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);
  return subscriptions
    .filter(sub => sub.active)
    .filter(sub => {
      const date = new Date(sub.nextPayment);
      return date >= now && date <= threshold;
    })
    .sort((a, b) => new Date(a.nextPayment) - new Date(b.nextPayment));
}

export function groupByCategory(subscriptions) {
  return subscriptions.reduce((acc, sub) => {
    acc[sub.category] = acc[sub.category] || [];
    acc[sub.category].push(sub);
    return acc;
  }, {});
}

export function nextPaymentLabel(subscription) {
  return readableDate(subscription.nextPayment);
}

export function withConvertedAmounts(subscriptions, displayCurrency) {
  return subscriptions.map(sub => {
    const monthly = monthlyAmount(sub.amount, sub.period);
    const yearly = yearlyAmount(sub.amount, sub.period);
    return {
      ...sub,
      monthlyDisplay: convertCurrency(monthly, sub.currency, displayCurrency),
      yearlyDisplay: convertCurrency(yearly, sub.currency, displayCurrency)
    };
  });
}

export function downloadFileFromResponse(response, filename) {
  return response.blob().then(blob => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      link.remove();
    }, 1000);
  });
}
