import { t } from './i18n.js';

let toastContainer;

function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}

export function showToast(message, type = 'info', timeout = 3500) {
  ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, timeout);
}

export function showConfirm({ title, message, confirmText, cancelText }) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const header = document.createElement('div');
    header.className = 'modal-header';
    header.textContent = title;
    modal.appendChild(header);

    const body = document.createElement('div');
    body.className = 'modal-body';
    body.textContent = message;
    modal.appendChild(body);

    const footer = document.createElement('div');
    footer.className = 'modal-footer';

    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn ghost';
    cancelButton.textContent = cancelText || t('common.cancel');
    cancelButton.addEventListener('click', () => {
      overlay.remove();
      resolve(false);
    });

    const confirmButton = document.createElement('button');
    confirmButton.className = 'btn danger';
    confirmButton.textContent = confirmText || t('common.confirm');
    confirmButton.addEventListener('click', () => {
      overlay.remove();
      resolve(true);
    });

    footer.appendChild(cancelButton);
    footer.appendChild(confirmButton);
    modal.appendChild(footer);
    overlay.appendChild(modal);

    overlay.addEventListener('click', event => {
      if (event.target === overlay) {
        overlay.remove();
        resolve(false);
      }
    });

    document.body.appendChild(overlay);
    confirmButton.focus();
  });
}

export function openCustomModal(contentBuilder) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal large';

    const { titleElement, bodyElement, footerElement, onClose } = contentBuilder(() => {
      overlay.remove();
      resolve();
    });

    if (titleElement) {
      titleElement.classList.add('modal-header');
      modal.appendChild(titleElement);
    }

    if (bodyElement) {
      bodyElement.classList.add('modal-body');
      modal.appendChild(bodyElement);
    }

    if (footerElement) {
      footerElement.classList.add('modal-footer');
      modal.appendChild(footerElement);
    }

    overlay.addEventListener('click', event => {
      if (event.target === overlay) {
        overlay.remove();
        if (onClose) onClose();
        resolve();
      }
    });

    document.addEventListener(
      'keydown',
      event => {
        if (event.key === 'Escape') {
          overlay.remove();
          if (onClose) onClose();
          resolve();
        }
      },
      { once: true }
    );

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  });
}
