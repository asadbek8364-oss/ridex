'use strict';

/**
 * ДАННЫЕ САЙТА
 *
 * Здесь в одном месте редактируются города, контакты, цены и автомобили.
 * Телефоны, адреса и цены ниже — примерные. Перед запуском замените их
 * на реальные данные вашего таксопарка.
 */

const SITE_DATA = {

  /* Город, который открывается по умолчанию (osh | tashkent | bishkek) */
  defaultCity: 'osh',

  cities: {

    osh: {
      name: 'Ош',
      nameIn: 'в Оше',
      country: 'Кыргызстан',
      currency: 'сом',
      dialCode: '+996',
      phone: '+996 555 000 101',
      whatsapp: '996555000101', // номер для WhatsApp — только цифры, с кодом страны
      telegram: 'ridex_osh',    // имя пользователя Telegram без @
      address: 'ул. Ленина, 100',
      hours: 'Пн–Сб: 8:00–20:00',
      deposit: 7000,
      // Ползунок «доход за смену» в калькуляторе (value — для класса «Эконом»)
      income: { min: 1000, max: 8000, step: 100, value: 3000 },
      // Примерные расходы на топливо за смену, по типу топлива
      fuelPerShift: { methane: 400, propane: 600, petrol: 1000, hybrid: 550, phev: 400 },
    },

    tashkent: {
      name: 'Ташкент',
      nameIn: 'в Ташкенте',
      country: 'Узбекистан',
      currency: 'сум',
      dialCode: '+998',
      phone: '+998 90 000 01 02',
      whatsapp: '998900000102',
      telegram: 'ridex_tashkent',
      address: 'ул. Амира Темура, 100',
      hours: 'Пн–Сб: 8:00–20:00',
      deposit: 2000000,
      income: { min: 200000, max: 1500000, step: 10000, value: 650000 },
      fuelPerShift: { methane: 45000, propane: 70000, petrol: 130000, hybrid: 70000, phev: 50000 },
    },

    bishkek: {
      name: 'Бишкек',
      nameIn: 'в Бишкеке',
      country: 'Кыргызстан',
      currency: 'сом',
      dialCode: '+996',
      phone: '+996 700 000 103',
      whatsapp: '996700000103',
      telegram: 'ridex_bishkek',
      address: 'пр. Чуй, 100',
      hours: 'Ежедневно: 8:00–21:00',
      deposit: 10000,
      income: { min: 1000, max: 10000, step: 100, value: 4000 },
      fuelPerShift: { methane: 450, propane: 650, petrol: 1100, hybrid: 600, phev: 450 },
    },

  },

  /* Классы автомобилей — используются в фильтре автопарка */
  classes: {
    econom: 'Эконом',
    comfort: 'Комфорт',
    eco: 'Гибрид и электро',
  },

  /* Во сколько раз доход за смену в этом классе выше, чем в эконом (для калькулятора) */
  incomeFactor: {
    econom: 1,
    comfort: 1.4,
    eco: 1,
  },

  /* Типы топлива: подпись и иконка (https://ionic.io/ionicons) */
  fuels: {
    methane: { label: 'Метан + бензин', icon: 'flame-outline' },
    propane: { label: 'Пропан + бензин', icon: 'flame-outline' },
    petrol: { label: 'Бензин', icon: 'water-outline' },
    hybrid: { label: 'Гибрид', icon: 'leaf-outline' },
    phev: { label: 'Гибрид с зарядкой', icon: 'flash-outline' },
  },

  /* Форматы аренды и скидки к суточной цене */
  formats: {
    day: { label: 'Посуточно', discount: 0 },
    week: { label: 'На неделю (−5%)', discount: 0.05 },
    month: { label: 'На месяц (−10%)', discount: 0.10 },
    buyout: { label: 'Аренда с выкупом', discount: 0 },
  },

  /**
   * Автопарк.
   * prices — цена за сутки в валюте города. Если города нет в prices,
   * машина в этом городе не показывается.
   * body — силуэт на карточке: sedan | hatch.
   */
  cars: [
    {
      id: 'cobalt', name: 'Chevrolet Cobalt', year: 2023, cls: 'econom', body: 'sedan', color: '#eef0f2',
      fuel: 'methane', gearbox: 'МКПП', seats: 4, consumption: '7,0 л / 100 км',
      prices: { tashkent: 250000, osh: 1300 },
    },
    {
      id: 'gentra', name: 'Chevrolet Gentra', year: 2022, cls: 'econom', body: 'sedan', color: '#b9bec6',
      fuel: 'methane', gearbox: 'АКПП', seats: 4, consumption: '7,5 л / 100 км',
      prices: { tashkent: 280000 },
    },
    {
      id: 'onix', name: 'Chevrolet Onix', year: 2024, cls: 'econom', body: 'sedan', color: '#b5302d',
      fuel: 'petrol', gearbox: 'АКПП', seats: 4, consumption: '6,2 л / 100 км',
      prices: { tashkent: 300000 },
    },
    {
      id: 'fit', name: 'Honda Fit Hybrid', year: 2017, cls: 'eco', body: 'hatch', color: '#2f6fb3',
      fuel: 'hybrid', gearbox: 'АКПП', seats: 4, consumption: '4,5 л / 100 км',
      prices: { bishkek: 1300, osh: 1200 },
    },
    {
      id: 'prius', name: 'Toyota Prius', year: 2015, cls: 'eco', body: 'hatch', color: '#e6e7e3',
      fuel: 'hybrid', gearbox: 'Вариатор', seats: 4, consumption: '4,2 л / 100 км',
      prices: { bishkek: 1700, osh: 1600 },
    },
    {
      id: 'sonata', name: 'Hyundai Sonata', year: 2020, cls: 'comfort', body: 'sedan', color: '#24324a',
      fuel: 'propane', gearbox: 'АКПП', seats: 4, consumption: '10 л газа / 100 км',
      prices: { bishkek: 2300, tashkent: 400000 },
    },
    {
      id: 'k5', name: 'Kia K5', year: 2021, cls: 'comfort', body: 'sedan', color: '#7d838d',
      fuel: 'propane', gearbox: 'АКПП', seats: 4, consumption: '10 л газа / 100 км',
      prices: { bishkek: 2400, osh: 2200 },
    },
    {
      id: 'camry', name: 'Toyota Camry', year: 2021, cls: 'comfort', tier: 'Комфорт+', body: 'sedan', color: '#15181d',
      fuel: 'petrol', gearbox: 'АКПП', seats: 4, consumption: '8,5 л / 100 км',
      prices: { bishkek: 2800, tashkent: 500000 },
    },
    {
      id: 'chazor', name: 'BYD Chazor', year: 2024, cls: 'eco', body: 'sedan', color: '#5b7487',
      fuel: 'phev', gearbox: 'АКПП', seats: 4, consumption: '3,9 л / 100 км',
      prices: { tashkent: 450000, bishkek: 2600 },
    },
  ],

};
