# Style guide — Ridex Taxi

## Подключения в HTML

Google Fonts (с кириллицей):

``` html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Open+Sans:wght@400;600&display=swap"
  rel="stylesheet">
```

Ionicons:

``` html
<script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
<script nomodule src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
```

---

## Цвета

``` css
--yellow: hsl(45, 100%, 55%);      /* основной «такси» — кнопки, акценты */
--yellow-600: hsl(42, 100%, 47%);  /* hover кнопок, иконки */
--yellow-100: hsl(48, 100%, 90%);
--yellow-50: hsl(48, 100%, 96%);

--ink-900: hsl(222, 28%, 14%);     /* заголовки, тёмные секции */
--ink-800: hsl(222, 24%, 19%);
--ink-700: hsl(222, 16%, 30%);     /* основной текст */
--ink-500: hsl(220, 10%, 44%);     /* второстепенный текст */
--ink-300: hsl(220, 14%, 78%);

--line: hsl(220, 16%, 90%);
--bg: hsl(40, 33%, 97%);
--surface: hsl(0, 0%, 100%);
--surface-2: hsl(220, 30%, 97%);

--green: hsl(150, 60%, 30%);       /* доход, галочки */
--red: hsl(0, 68%, 46%);           /* ошибки, минус */
--whatsapp: hsl(142, 70%, 40%);
```

Шахматная полоса такси:

``` css
background: repeating-conic-gradient(var(--ink-900) 0 25%, var(--yellow) 0 50%) 0 0 / 16px 16px;
```

## Типографика

``` css
--ff-head: 'Nunito', system-ui, sans-serif;
--ff-body: 'Open Sans', system-ui, sans-serif;

--fs-1: 2.125rem;   /* 2.75rem от 768px, 3.25rem от 1200px */
--fs-2: 1.75rem;    /* 2rem от 768px, 2.25rem от 1200px */
--fs-3: 1.5rem;
--fs-4: 1.25rem;
--fs-5: 1.125rem;
--fs-6: 0.9375rem;
--fs-7: 0.8125rem;
```

## Радиусы и тени

``` css
--radius-10: 10px;
--radius-14: 14px;
--radius-18: 18px;
--radius-28: 28px;

--shadow-1: 0 1px 2px hsla(222, 30%, 14%, 0.05), 0 8px 24px hsla(222, 30%, 14%, 0.07);
--shadow-2: 0 8px 22px hsla(42, 100%, 42%, 0.35);
--shadow-3: 0 18px 50px hsla(222, 30%, 14%, 0.14);
```

## Брейкпоинты

340px · 480px · 580px · 768px · 992px · 1200px (mobile-first)
