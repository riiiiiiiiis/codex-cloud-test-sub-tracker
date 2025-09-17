window.TRANSLATIONS = {
  ru: {
    common: {
      appName: 'SubTrack Cloud',
      loading: 'Загрузка данных…',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      confirm: 'Подтвердить',
      close: 'Закрыть',
      openSite: 'Открыть сайт',
      statusActive: 'Активна',
      statusInactive: 'Неактивна',
      confirmDeletionTitle: 'Удаление',
      confirmDeletionBody: 'Вы уверены? Это действие нельзя отменить.',
      yesRemove: 'Да, удалить',
      noKeep: 'Отмена',
      inactive: 'Неактивна',
      active: 'Активна',
      amountPerMonth: 'в месяц',
      amountPerPeriod: 'за период',
      emptyState: 'Здесь пока пусто',
      currency: 'Валюта',
      activate: 'Активировать',
      deactivate: 'Отключить'
    },
    landing: {
      navFeatures: 'Возможности',
      navAnalytics: 'Аналитика',
      navHow: 'Как это работает',
      navFaq: 'FAQ',
      navLogin: 'Войти',
      heroTitle: 'Контролируйте все подписки в одном месте',
      heroSubtitle: 'Отслеживайте расходы, получайте напоминания о платежах и управляйте подписками с любого устройства.',
      heroPrimary: 'Начать бесплатно',
      heroSecondary: 'Посмотреть демо',
      featuresTitle: 'Что умеет SubTrack Cloud',
      featureCards: [
        {
          title: 'Полная прозрачность',
          description: 'Храните все подписки в облаке и мгновенно синхронизируйте изменения между устройствами.'
        },
        {
          title: 'Продвинутая аналитика',
          description: 'Автоматический пересчёт трат по периодам и валютам, показатели на месяц и год.'
        },
        {
          title: 'Напоминания о платежах',
          description: 'Лента ближайших платежей и подсказки о том, что будет списано в ближайшее время.'
        }
      ],
      analyticsTitle: 'Живая аналитика подписок',
      analyticsTabs: {
        overview: 'Обзор',
        upcoming: 'Предстоящие'
      },
      analyticsOverview: {
        monthly: 'Ежемесячно',
        yearly: 'Ежегодно',
        active: 'Активных подписок'
      },
      analyticsUpcoming: {
        title: 'Платежи на 7 дней',
        hint: 'Будьте готовы к списаниям заранее.'
      },
      aboutTitle: 'Как это работает',
      steps: [
        {
          title: 'Создайте аккаунт',
          text: 'Зарегистрируйтесь с email и настройте язык интерфейса.'
        },
        {
          title: 'Добавьте подписки',
          text: 'Укажите стоимость, период и дату следующего платежа.'
        },
        {
          title: 'Получайте аналитику',
          text: 'Следите за тратами и управляйте статусами в два клика.'
        }
      ],
      securityTitle: 'Спокойствие и безопасность',
      securityPoints: [
        'Данные доступны только вам — никаких банковских подключений.',
        'Автоматическое резервное копирование и экспорт в один клик.',
        'Удобно на всех устройствах: десктоп, планшет, смартфон.'
      ],
      ctaTitle: 'Готовы навести порядок в подписках?',
      ctaButton: 'Присоединиться сейчас',
      faqTitle: 'Ответы на популярные вопросы',
      faqItems: [
        {
          question: 'Можно ли использовать бесплатно?',
          answer: 'Да, основной функционал доступен бесплатно. Оплачивается только ваше время на заполнение.'
        },
        {
          question: 'Нужны ли банковские данные?',
          answer: 'Нет, вы управляете списком вручную. Мы никогда не просим доступ к счетам.'
        },
        {
          question: 'Работает ли без интернета?',
          answer: 'Приложение кэширует данные, но синхронизация происходит при подключении к сети.'
        },
        {
          question: 'Есть ли экспорт?',
          answer: 'Да, в настройках доступен экспорт всех подписок в структурированный JSON-файл.'
        }
      ],
      footerNote: 'SubTrack Cloud — персональный менеджер подписок.',
      footerRepo: 'Исходники на GitHub'
    },
    auth: {
      title: 'Управляйте подписками',
      subtitle: 'Войдите или зарегистрируйтесь, чтобы продолжить.',
      loginTab: 'Вход',
      registerTab: 'Регистрация',
      email: 'Email',
      password: 'Пароль',
      confirmEmailHint: 'Подтвердите почту, чтобы получать напоминания — проверьте свой ящик.',
      submitLogin: 'Войти',
      submitRegister: 'Создать аккаунт',
      switchToLogin: 'Уже с нами? Войти',
      switchToRegister: 'Впервые? Зарегистрироваться',
      successRegistration: 'Аккаунт создан! Теперь можете войти.',
      logout: 'Выйти',
      errors: {
        generic: 'Что-то пошло не так. Попробуйте снова.',
        required: 'Заполните все поля.',
        mismatch: 'Данные не совпадают. Проверьте ввод.'
      }
    },
    dashboard: {
      title: 'Ваши подписки',
      add: 'Добавить подписку',
      empty: {
        title: 'Подписок пока нет',
        description: 'Нажмите кнопку, чтобы добавить первую подписку и начать контроль расходов.'
      },
      cards: {
        nextPayment: 'Следующий платёж',
        monthly: 'В месяц',
        perPeriod: 'За период'
      },
      analytics: {
        monthlyTotal: 'Ежемесячные траты',
        yearlyTotal: 'Годовые траты',
        activeCount: 'Активных подписок',
        payments30: 'Платежей в ближайшие 30 дней',
        upcomingTitle: 'Ближайшие 7 дней',
        upcomingEmpty: 'В ближайшую неделю списаний не ожидается.',
        groupedByCategory: 'По категориям'
      },
      confirmDeactivate: 'Вы действительно хотите изменить статус подписки?',
      confirmDelete: 'Удалить подписку?',
      confirmDeleteDetail: 'Это действие нельзя отменить.'
    },
    modal: {
      titleCreate: 'Новая подписка',
      titleEdit: 'Редактирование подписки',
      name: 'Название',
      description: 'Описание',
      amount: 'Сумма',
      currency: 'Валюта',
      period: 'Периодичность',
      nextPayment: 'Дата следующего платежа',
      category: 'Категория',
      url: 'Ссылка на сервис',
      active: 'Подписка активна',
      save: 'Сохранить',
      cancel: 'Отмена'
    },
    settings: {
      title: 'Настройки',
      accountTitle: 'Аккаунт',
      email: 'Email',
      language: 'Язык интерфейса',
      displayCurrency: 'Показывать суммы в валюте',
      logout: 'Выйти из аккаунта',
      dataTitle: 'Данные',
      export: 'Экспортировать подписки',
      clearLocal: 'Очистить локальные данные',
      confirmClear: 'Очистить локальные данные?',
      confirmClearDetail: 'Сохранённые в браузере настройки будут удалены.',
      infoTitle: 'Помощь',
      infoText: 'Нужна помощь? Напишите нам или загляните в FAQ на лендинге.',
      languageSaved: 'Язык сохранён',
      currencySaved: 'Валюта отображения сохранена',
      emailConfirmation: 'Подтвердили почту? Отметьте, чтобы убрать напоминание.',
      emailConfirmedLabel: 'Email подтверждён'
    },
    categories: {
      entertainment: 'Развлечения',
      utilities: 'Коммунальные услуги',
      software: 'ПО',
      food: 'Еда',
      health: 'Здоровье',
      education: 'Образование',
      news: 'Новости',
      productivity: 'Продуктивность',
      other: 'Прочее'
    },
    periods: {
      week: 'Неделя',
      month: 'Месяц',
      quarter: 'Квартал',
      year: 'Год'
    },
    notifications: {
      created: 'Подписка добавлена',
      updated: 'Подписка обновлена',
      toggled: 'Статус обновлён',
      deleted: 'Подписка удалена',
      error: 'Ошибка. Попробуйте снова.',
      loggedOut: 'Вы вышли из аккаунта',
      loginWelcome: 'Добро пожаловать!',
      languageUpdated: 'Язык обновлён',
      localCleared: 'Локальные данные очищены'
    }
  },
  en: {
    common: {
      appName: 'SubTrack Cloud',
      loading: 'Loading data…',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      confirm: 'Confirm',
      close: 'Close',
      openSite: 'Open website',
      statusActive: 'Active',
      statusInactive: 'Inactive',
      confirmDeletionTitle: 'Deletion',
      confirmDeletionBody: 'Are you sure? This action cannot be undone.',
      yesRemove: 'Yes, delete',
      noKeep: 'Cancel',
      inactive: 'Inactive',
      active: 'Active',
      amountPerMonth: 'per month',
      amountPerPeriod: 'per period',
      emptyState: 'Nothing here yet',
      currency: 'Currency',
      activate: 'Activate',
      deactivate: 'Deactivate'
    },
    landing: {
      navFeatures: 'Features',
      navAnalytics: 'Analytics',
      navHow: 'How it works',
      navFaq: 'FAQ',
      navLogin: 'Log in',
      heroTitle: 'Keep every subscription under control',
      heroSubtitle: 'Track spending, stay ahead of renewals, and manage subscriptions from any device.',
      heroPrimary: 'Start for free',
      heroSecondary: 'View demo',
      featuresTitle: 'What SubTrack Cloud delivers',
      featureCards: [
        {
          title: 'Full transparency',
          description: 'Store every subscription in the cloud and sync updates instantly across devices.'
        },
        {
          title: 'Powerful analytics',
          description: 'Automatic normalization of spending by period and currency with monthly and yearly totals.'
        },
        {
          title: 'Payment awareness',
          description: 'A timeline of upcoming charges so you always know what happens next.'
        }
      ],
      analyticsTitle: 'Live subscription analytics',
      analyticsTabs: {
        overview: 'Overview',
        upcoming: 'Upcoming'
      },
      analyticsOverview: {
        monthly: 'Monthly total',
        yearly: 'Yearly total',
        active: 'Active subscriptions'
      },
      analyticsUpcoming: {
        title: 'Next 7 days',
        hint: 'Stay prepared for upcoming renewals.'
      },
      aboutTitle: 'How it works',
      steps: [
        {
          title: 'Create an account',
          text: 'Register with your email and choose the interface language.'
        },
        {
          title: 'Add subscriptions',
          text: 'Provide amount, recurrence, and the next payment date.'
        },
        {
          title: 'Enjoy analytics',
          text: 'Monitor spending and toggle statuses in seconds.'
        }
      ],
      securityTitle: 'Peace of mind & security',
      securityPoints: [
        'Your data is yours only — no bank connections needed.',
        'Automatic backups and one-click export.',
        'Great on every device: desktop, tablet, phone.'
      ],
      ctaTitle: 'Ready to get organized?',
      ctaButton: 'Join now',
      faqTitle: 'Frequently asked questions',
      faqItems: [
        {
          question: 'Is it free to use?',
          answer: 'Yes, all essential features are free. The only investment is the time you spend managing your list.'
        },
        {
          question: 'Do I need to connect bank accounts?',
          answer: 'No, you maintain the list manually. We never request access to your finances.'
        },
        {
          question: 'Does it work offline?',
          answer: 'The app caches data locally, but synchronization happens whenever you are online.'
        },
        {
          question: 'Can I export my data?',
          answer: 'Absolutely. The settings page lets you export a structured JSON file with every subscription.'
        }
      ],
      footerNote: 'SubTrack Cloud — your personal subscription manager.',
      footerRepo: 'View source on GitHub'
    },
    auth: {
      title: 'Manage your subscriptions',
      subtitle: 'Log in or create an account to continue.',
      loginTab: 'Log in',
      registerTab: 'Sign up',
      email: 'Email',
      password: 'Password',
      confirmEmailHint: 'Confirm your email to receive reminders — check your inbox.',
      submitLogin: 'Log in',
      submitRegister: 'Create account',
      switchToLogin: 'Already here? Log in',
      switchToRegister: 'New here? Sign up',
      successRegistration: 'Account created! You can log in now.',
      logout: 'Log out',
      errors: {
        generic: 'Something went wrong. Try again.',
        required: 'Please fill every field.',
        mismatch: 'Credentials do not match. Please check your details.'
      }
    },
    dashboard: {
      title: 'Your subscriptions',
      add: 'Add subscription',
      empty: {
        title: 'No subscriptions yet',
        description: 'Use the button to add your first subscription and start tracking.'
      },
      cards: {
        nextPayment: 'Next payment',
        monthly: 'Monthly',
        perPeriod: 'Per period'
      },
      analytics: {
        monthlyTotal: 'Monthly spend',
        yearlyTotal: 'Yearly spend',
        activeCount: 'Active subscriptions',
        payments30: 'Payments in the next 30 days',
        upcomingTitle: 'Next 7 days',
        upcomingEmpty: 'No charges expected this week.',
        groupedByCategory: 'By category'
      },
      confirmDeactivate: 'Are you sure you want to change the subscription status?',
      confirmDelete: 'Delete this subscription?',
      confirmDeleteDetail: 'This action cannot be undone.'
    },
    modal: {
      titleCreate: 'New subscription',
      titleEdit: 'Edit subscription',
      name: 'Name',
      description: 'Description',
      amount: 'Amount',
      currency: 'Currency',
      period: 'Recurrence',
      nextPayment: 'Next payment date',
      category: 'Category',
      url: 'Service link',
      active: 'Subscription is active',
      save: 'Save',
      cancel: 'Cancel'
    },
    settings: {
      title: 'Settings',
      accountTitle: 'Account',
      email: 'Email',
      language: 'Language',
      displayCurrency: 'Display amounts in',
      logout: 'Log out',
      dataTitle: 'Data',
      export: 'Export subscriptions',
      clearLocal: 'Clear local data',
      confirmClear: 'Clear local data?',
      confirmClearDetail: 'Browser-only preferences will be removed.',
      infoTitle: 'Help',
      infoText: 'Need assistance? Contact us or read the FAQ on the landing page.',
      languageSaved: 'Language saved',
      currencySaved: 'Display currency saved',
      emailConfirmation: 'Email verified? Mark it to stop reminders.',
      emailConfirmedLabel: 'Email confirmed'
    },
    categories: {
      entertainment: 'Entertainment',
      utilities: 'Utilities',
      software: 'Software',
      food: 'Food',
      health: 'Health',
      education: 'Education',
      news: 'News',
      productivity: 'Productivity',
      other: 'Other'
    },
    periods: {
      week: 'Week',
      month: 'Month',
      quarter: 'Quarter',
      year: 'Year'
    },
    notifications: {
      created: 'Subscription added',
      updated: 'Subscription updated',
      toggled: 'Status updated',
      deleted: 'Subscription deleted',
      error: 'Error. Please try again.',
      loggedOut: 'You have logged out',
      loginWelcome: 'Welcome back!',
      languageUpdated: 'Language updated',
      localCleared: 'Local data cleared'
    }
  }
};
