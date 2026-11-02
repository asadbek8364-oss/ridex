'use strict';

/**
 * Ridex Taxi — логика сайта.
 * Данные (города, цены, автомобили) лежат в assets/js/data.js
 */

(function () {

  const { cities, cars, classes, fuels, formats, incomeFactor } = SITE_DATA;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const numberFormat = new Intl.NumberFormat('ru-RU');
  const STORAGE_KEY = 'ridex-city';

  const state = {
    city: getInitialCity(),
    cls: 'all',
  };



  /**
   * helpers
   */

  function getInitialCity() {
    const fromUrl = new URLSearchParams(window.location.search).get('city');
    if (fromUrl && cities[fromUrl]) return fromUrl;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && cities[saved]) return saved;
    } catch (e) { /* хранилище недоступно — используем город по умолчанию */ }

    return SITE_DATA.defaultCity;
  }

  function money(value, city = state.city) {
    return `${numberFormat.format(Math.round(value))} ${cities[city].currency}`;
  }

  function plural(n, forms) {
    const n10 = n % 10;
    const n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return forms[0];
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1];
    return forms[2];
  }

  const carById = id => cars.find(car => car.id === id);
  const carsInCity = (city = state.city) => cars.filter(car => car.prices[city] != null);
  const minPrice = (city = state.city) => Math.min(...carsInCity(city).map(car => car.prices[city]));
  const telHref = phone => 'tel:' + phone.replace(/[^\d+]/g, '');
  const waHref = (number, text) => `https://wa.me/${number}` + (text ? `?text=${encodeURIComponent(text)}` : '');
  const tgHref = user => `https://t.me/${user}`;
  const mapHref = city => 'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(`${cities[city].name}, ${cities[city].address}`);

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }



  /**
   * navbar toggle
   */

  const overlay = $('[data-overlay]');
  const navbar = $('[data-navbar]');
  const navToggleBtn = $('[data-nav-toggle-btn]');

  function setNav(open) {
    navToggleBtn.classList.toggle('active', open);
    navbar.classList.toggle('active', open);
    overlay.classList.toggle('active', open);
    navToggleBtn.setAttribute('aria-expanded', String(open));
    navToggleBtn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('nav-open', open);
  }

  navToggleBtn.addEventListener('click', () => setNav(!navbar.classList.contains('active')));
  overlay.addEventListener('click', () => setNav(false));
  $$('[data-nav-link]').forEach(link => link.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navbar.classList.contains('active')) setNav(false);
  });



  /**
   * header active on scroll
   */

  const header = $('[data-header]');
  const floatWa = $('.float-wa');

  const onScroll = () => {
    header.classList.toggle('active', window.scrollY >= 10);
    floatWa.classList.toggle('is-visible', window.scrollY >= 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();



  /**
   * fleet
   */

  const fleetList = $('[data-fleet-list]');
  const fleetEmpty = $('[data-fleet-empty]');
  const fleetCount = $('[data-fleet-count]');

  function carCard(car) {
    const price = car.prices[state.city];
    const fuel = fuels[car.fuel];

    return `
      <li>
        <article class="car-card">
          <figure class="car-banner" style="--car-color: ${car.color}">
            <svg viewBox="0 0 400 160" role="img" aria-label="${car.name} ${car.year}">
              <use href="#car-${car.body}"></use>
            </svg>
            <span class="car-badge">${car.tier || classes[car.cls]}</span>
          </figure>

          <div class="card-content">
            <div class="card-title-wrapper">
              <h3 class="h3 card-title">${car.name}</h3>
              <data class="year" value="${car.year}">${car.year}</data>
            </div>

            <ul class="card-list">
              <li class="card-list-item">
                <ion-icon name="people-outline" aria-hidden="true"></ion-icon>
                <span class="card-item-text">${car.seats} ${plural(car.seats, ['место', 'места', 'мест'])}</span>
              </li>
              <li class="card-list-item">
                <ion-icon name="${fuel.icon}" aria-hidden="true"></ion-icon>
                <span class="card-item-text">${fuel.label}</span>
              </li>
              <li class="card-list-item">
                <ion-icon name="speedometer-outline" aria-hidden="true"></ion-icon>
                <span class="card-item-text">${car.consumption}</span>
              </li>
              <li class="card-list-item">
                <ion-icon name="cog-outline" aria-hidden="true"></ion-icon>
                <span class="card-item-text">${car.gearbox}</span>
              </li>
            </ul>

            <div class="card-price-wrapper">
              <p class="card-price">
                <strong>${money(price)}</strong> / сутки
                <small>Залог ${money(cities[state.city].deposit)} · на месяц −10%</small>
              </p>

              <button type="button" class="btn btn-icon" data-calc-car-id="${car.id}"
                aria-label="Рассчитать доход на ${car.name}" title="Рассчитать доход">
                <ion-icon name="calculator-outline" aria-hidden="true"></ion-icon>
              </button>

              <button type="button" class="btn btn-primary" data-rent-car-id="${car.id}">Арендовать</button>
            </div>
          </div>
        </article>
      </li>`;
  }

  function renderFleet() {
    const available = carsInCity();

    // счётчики в фильтрах; пустые классы отключаем
    $$('[data-filter-count]').forEach(el => {
      const cls = el.dataset.filterCount;
      const count = cls === 'all' ? available.length : available.filter(car => car.cls === cls).length;
      el.textContent = count;
      el.closest('button').disabled = count === 0 && cls !== 'all';
    });

    const items = available.filter(car => state.cls === 'all' || car.cls === state.cls);

    fleetList.innerHTML = items.map(carCard).join('');
    fleetEmpty.hidden = items.length > 0;
    fleetCount.textContent = `${items.length} ${plural(items.length, ['модель', 'модели', 'моделей'])} ${cities[state.city].nameIn}`;

    $$('[data-filter]').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.filter === state.cls)));
  }

  function setClass(cls) {
    state.cls = cls;
    renderFleet();
  }

  $$('[data-filter]').forEach(btn => btn.addEventListener('click', () => setClass(btn.dataset.filter)));
  $('[data-filter-reset]').addEventListener('click', () => setClass('all'));

  fleetList.addEventListener('click', e => {
    const rentBtn = e.target.closest('[data-rent-car-id]');
    const calcBtn = e.target.closest('[data-calc-car-id]');

    if (rentBtn) {
      bookingCar.value = rentBtn.dataset.rentCarId;
      scrollToSection('booking');
      setTimeout(() => $('#b-name').focus({ preventScroll: true }), 500);
    }

    if (calcBtn) {
      calcCar.value = calcBtn.dataset.calcCarId;
      resetCalcDefaults();
      computeCalc();
      scrollToSection('calculator');
    }
  });



  /**
   * hero form & tariffs
   */

  const heroForm = $('[data-hero-form]');
  const bookingFormat = $('[data-booking-format]');

  function setFormat(format) {
    bookingFormat.value = format;
    if (format !== 'buyout') {
      calcFormat.value = format;
      computeCalc();
    }
  }

  heroForm.addEventListener('submit', e => {
    e.preventDefault();
    setClass(heroForm.elements.class.value);
    setFormat(heroForm.elements.format.value);
    scrollToSection('fleet');
  });

  $$('[data-choose-format]').forEach(btn => btn.addEventListener('click', () => {
    setFormat(btn.dataset.chooseFormat);
    heroForm.elements.format.value = btn.dataset.chooseFormat;
    scrollToSection('booking');
  }));



  /**
   * calculator
   */

  const calcCar = $('[data-calc-car]');
  const calcFormat = $('[data-calc-format]');
  const calcDays = $('[data-calc-days]');
  const calcIncome = $('[data-calc-income]');
  const calcFuel = $('[data-calc-fuel]');

  const out = {
    days: $('[data-calc-days-out]'),
    income: $('[data-calc-income-out]'),
    net: $('[data-calc-net]'),
    incomeTotal: $('[data-calc-income-total]'),
    rent: $('[data-calc-rent]'),
    fuel: $('[data-calc-fuel-total]'),
    barRent: $('[data-calc-bar-rent]'),
    barFuel: $('[data-calc-bar-fuel]'),
    barNet: $('[data-calc-bar-net]'),
  };

  function setRangeFill(input) {
    const min = Number(input.min);
    const max = Number(input.max);
    const pct = ((Number(input.value) - min) / (max - min)) * 100;
    input.style.setProperty('--fill', `${pct}%`);
  }

  // подставляет типичные доход и расход топлива для выбранной машины и города
  function resetCalcDefaults() {
    const car = carById(calcCar.value);
    if (!car) return;

    const { min, max, step, value } = cities[state.city].income;
    const factor = incomeFactor[car.cls] || 1;
    calcIncome.min = min;
    calcIncome.max = max;
    calcIncome.step = step;
    calcIncome.value = Math.min(max, Math.round((value * factor) / step) * step);
    calcFuel.step = step;
    calcFuel.value = cities[state.city].fuelPerShift[car.fuel];
  }

  function computeCalc() {
    const car = carById(calcCar.value);
    if (!car) return;

    const discount = formats[calcFormat.value].discount;
    const daysPerWeek = Number(calcDays.value);
    const workDays = daysPerWeek * 30 / 7;

    const income = Number(calcIncome.value) * workDays;
    const rent = car.prices[state.city] * (1 - discount) * 30;
    const fuel = Math.max(0, Number(calcFuel.value) || 0) * workDays;
    const net = income - rent - fuel;

    out.days.textContent = daysPerWeek;
    out.income.textContent = money(Number(calcIncome.value));
    out.incomeTotal.textContent = money(income);
    out.rent.textContent = '− ' + money(rent);
    out.fuel.textContent = '− ' + money(fuel);
    out.net.textContent = (net < 0 ? '− ' : '') + money(Math.abs(net));
    out.net.classList.toggle('is-negative', net < 0);

    const total = Math.max(income, rent + fuel) || 1;
    out.barRent.style.width = `${(rent / total) * 100}%`;
    out.barFuel.style.width = `${(fuel / total) * 100}%`;
    out.barNet.style.width = `${(Math.max(net, 0) / total) * 100}%`;

    setRangeFill(calcDays);
    setRangeFill(calcIncome);
  }

  calcCar.addEventListener('change', () => { resetCalcDefaults(); computeCalc(); });
  [calcFormat, calcDays, calcIncome, calcFuel].forEach(input => input.addEventListener('input', computeCalc));

  $('[data-calc-book]').addEventListener('click', () => {
    bookingCar.value = calcCar.value;
    bookingFormat.value = calcFormat.value;
    scrollToSection('booking');
  });



  /**
   * offices & footer
   */

  function renderOffices() {
    $('[data-offices]').innerHTML = Object.entries(cities).map(([id, c]) => `
      <li>
        <article class="office-card" data-office="${id}">
          <div class="office-head">
            <h3 class="h3">${c.name}<span class="office-country">${c.country}</span></h3>
            <span class="office-current">Ваш город</span>
          </div>

          <ul class="office-info">
            <li>
              <ion-icon name="location-outline" aria-hidden="true"></ion-icon>
              <span>${c.address}</span>
            </li>
            <li>
              <ion-icon name="call-outline" aria-hidden="true"></ion-icon>
              <a href="${telHref(c.phone)}">${c.phone}</a>
            </li>
            <li>
              <ion-icon name="time-outline" aria-hidden="true"></ion-icon>
              <span>${c.hours}</span>
            </li>
          </ul>

          <div class="office-actions">
            <a href="${waHref(c.whatsapp)}" class="btn btn-whatsapp" target="_blank" rel="noopener">
              <ion-icon name="logo-whatsapp" aria-hidden="true"></ion-icon>
              <span>WhatsApp</span>
            </a>
            <a href="${mapHref(id)}" class="btn btn-secondary" target="_blank" rel="noopener">
              <ion-icon name="navigate-outline" aria-hidden="true"></ion-icon>
              <span>Маршрут</span>
            </a>
          </div>
        </article>
      </li>`).join('');

    const footerCities = $('[data-footer-cities]');
    footerCities.insertAdjacentHTML('beforeend', Object.values(cities).map(c => `
      <li class="footer-city">
        <strong>${c.name}</strong>
        <a href="${telHref(c.phone)}">${c.phone}</a>
      </li>`).join(''));
  }



  /**
   * booking form
   */

  const bookingForm = $('[data-booking-form]');
  const bookingCar = $('[data-booking-car]');
  const bookingPhone = $('[data-booking-phone]');
  const bookingStatus = $('[data-booking-status]');

  function populateCarSelects() {
    const available = carsInCity();
    const prevCalc = calcCar.value;
    const prevBooking = bookingCar.value;

    calcCar.innerHTML = available.map(car =>
      `<option value="${car.id}">${car.name} — ${money(car.prices[state.city])} / сутки</option>`).join('');

    bookingCar.innerHTML = '<option value="">Любой подходящий</option>' + available.map(car =>
      `<option value="${car.id}">${car.name} ${car.year}</option>`).join('');

    if (available.some(car => car.id === prevCalc)) calcCar.value = prevCalc;
    if (available.some(car => car.id === prevBooking)) bookingCar.value = prevBooking;
  }

  function setError(input, errorId, hasError) {
    const error = document.getElementById(errorId);
    error.hidden = !hasError;
    if (input) {
      input.setAttribute('aria-invalid', String(hasError));
      if (hasError) input.setAttribute('aria-describedby', errorId);
      else input.removeAttribute('aria-describedby');
    }
    return hasError;
  }

  bookingPhone.addEventListener('focus', () => {
    if (!bookingPhone.value.trim()) bookingPhone.value = cities[state.city].dialCode + ' ';
  });

  bookingPhone.addEventListener('blur', () => {
    if (bookingPhone.value.trim() === cities[state.city].dialCode) bookingPhone.value = '';
  });

  bookingForm.addEventListener('submit', e => {
    e.preventDefault();

    const data = new FormData(bookingForm);
    const name = String(data.get('name')).trim();
    const phone = String(data.get('phone')).trim();
    const digits = phone.replace(/\D/g, '');

    const nameError = setError(bookingForm.elements.name, 'b-name-error', name.length < 2);
    const phoneError = setError(bookingPhone, 'b-phone-error', digits.length < 9);
    const consentError = setError(null, 'b-consent-error', !data.get('consent'));

    if (nameError || phoneError || consentError) {
      (nameError ? bookingForm.elements.name : phoneError ? bookingPhone : $('[data-booking-consent]')).focus();
      return;
    }

    const city = cities[state.city];
    const car = carById(String(data.get('car')));
    const comment = String(data.get('comment')).trim();

    const message = [
      'Здравствуйте! Заявка на аренду авто для такси (сайт Ridex Taxi).',
      `Город: ${city.name}`,
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      `Автомобиль: ${car ? `${car.name} ${car.year}` : 'любой подходящий'}`,
      `Формат: ${formats[data.get('format')].label}`,
      `Стаж вождения: ${data.get('experience')}`,
      comment ? `Комментарий: ${comment}` : '',
    ].filter(Boolean).join('\n');

    const url = waHref(city.whatsapp, message);
    window.open(url, '_blank', 'noopener');

    bookingStatus.hidden = false;
    bookingStatus.innerHTML = `Спасибо, ${name}! Заявка подготовлена в WhatsApp — отправьте сообщение менеджеру ${city.nameIn}. ` +
      `Если WhatsApp не открылся, <a href="${url}" target="_blank" rel="noopener">нажмите здесь</a> ` +
      `или позвоните: <a href="${telHref(city.phone)}">${city.phone}</a>.`;
  });

  ['name', 'phone'].forEach(field => {
    bookingForm.elements[field].addEventListener('input', () => {
      const input = bookingForm.elements[field];
      if (input.getAttribute('aria-invalid') === 'true') {
        const valid = field === 'name' ? input.value.trim().length >= 2 : input.value.replace(/\D/g, '').length >= 9;
        if (valid) setError(input, `b-${field}-error`, false);
      }
    });
  });

  $('[data-booking-consent]').addEventListener('change', e => {
    if (e.target.checked) setError(null, 'b-consent-error', false);
  });



  /**
   * city
   */

  let renderedCity = null;

  function setCity(city, { save = true } = {}) {
    if (!cities[city] || city === renderedCity) return;

    const c = cities[city];
    state.city = city;
    renderedCity = city;
    document.documentElement.dataset.city = city;

    if (save) {
      try { localStorage.setItem(STORAGE_KEY, city); } catch (e) { /* ignore */ }
    }

    const count = carsInCity().length;

    $$('[data-city-select]').forEach(select => { select.value = city; });
    $$('[data-city-tab]').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.cityTab === city)));
    $$('[data-city-name-in]').forEach(el => { el.textContent = c.nameIn; });
    $$('[data-city-currency]').forEach(el => { el.textContent = c.currency; });
    $$('[data-city-phone]').forEach(el => { el.textContent = c.phone; el.href = telHref(c.phone); });
    $$('[data-city-phone-text]').forEach(el => { el.textContent = c.phone; });
    $$('[data-city-tel]').forEach(el => { el.href = telHref(c.phone); });
    $$('[data-city-hours]').forEach(el => { el.textContent = c.hours; });
    $$('[data-city-wa]').forEach(el => { el.href = waHref(c.whatsapp); });
    $$('[data-city-tg]').forEach(el => { el.href = tgHref(c.telegram); });
    $$('[data-city-deposit]').forEach(el => { el.textContent = money(c.deposit); });
    $$('[data-city-min-price]').forEach(el => { el.textContent = money(minPrice()); });
    $$('[data-city-car-count]').forEach(el => { el.textContent = count; });
    $$('[data-city-car-word]').forEach(el => { el.textContent = plural(count, ['модель', 'модели', 'моделей']); });
    $$('[data-office]').forEach(el => el.classList.toggle('is-active', el.dataset.office === city));

    bookingPhone.placeholder = city === 'tashkent' ? '+998 90 123 45 67' : '+996 555 123 456';
    const phoneValue = bookingPhone.value.trim();
    if (Object.values(cities).some(other => phoneValue === other.dialCode)) bookingPhone.value = '';

    populateCarSelects();
    renderFleet();

    resetCalcDefaults();
    computeCalc();
  }

  $$('[data-city-select]').forEach(select => select.addEventListener('change', () => setCity(select.value)));
  $$('[data-city-tab]').forEach(btn => btn.addEventListener('click', () => setCity(btn.dataset.cityTab)));



  /**
   * init
   */

  renderOffices();
  setCity(state.city, { save: false });
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

})();
