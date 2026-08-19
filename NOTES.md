# NOTES — стан роботи над прототипом

Ці нотатки для нової сесії, яка не бачила попередніх розмов. Тут — контекст,
ухвалені рішення та пастки середовища. Структуру коду детально не переказую —
вона видима з файлу; тут те, чого у файлі швидко не прочитаєш.

## Що це і де воно

Основний артефакт — **`subscription-details-prototype.html`** у корені: один
self-contained клікабельний low-fi wireframe порталу ThingsBoard License Portal.
Всередині — **багато «поверхонь» (views)**, що перемикаються ран-тайм одним
механізмом (`PAGES` + `applyDetailsPage`, див. «Архітектура»). Немає збірки,
немає роутів — усе в одному файлі.

Vite/React-скелет у `src/` — окрема історія, до прототипу відношення не має.
`subscription-details-wireframe.html` — вихідний драфт-референс, не редагуємо.

## Жорсткі константи прототипу (не порушувати)

- **Один self-contained HTML**: inline CSS + vanilla JS, без фреймворків,
  без зовнішніх запитів, **без localStorage/sessionStorage** (стан лише в JS-змінних).
- **Тільки монохром** — чорний/білий/сірі, усе через CSS-змінні (`--ink`, `--mid`,
  `--faint`, `--line`, `--line2`, `--bg`, `--card`). Жодних брендових/акцентних
  кольорів. Стан передаємо вагою, рамками, заливкою сірого — не кольором.
  Attention-чипи (needs attention, updates expiring, payment failed, Pending) —
  **заливка ink** (`.pill.attn`); тихі стани (Active/Paid/Success/Activated) —
  `.pill.soft` або `.chip`.
- Wireframe-фіделіті: структура/інтеракції важливіші за візуал.
- Спільна висота контролів через `--btnH` (31px): кнопки, іконки-кнопки, чипи,
  дропдауни, search-інпут, поля форм — усе 31px, щоб тулбар читався одним бендом.
- Клавіатурна доступність + видимі hover/focus стани.
- **Комітимо тільки коли користувачка явно попросить.** Кожну ітерацію вона
  спершу переглядає. Мова спілкування — українська.
- Припущення поза ТЗ позначаємо в коді коментарем `inferred`.

## Як запускати і перевіряти (кілька пасток)

**Node/npm у середовищі немає** — конфіг `dev` у `.claude/launch.json` не стартує.
Прототип збірки не потребує; є другий конфіг **`prototype`**: `python3` +
`serve_prototype.py` на порт 5500.

**Сервер не має доступу macOS (TCC) до теки Google Drive**, де лежить репозиторій
(`listdir` → `Operation not permitted`), хоча Bash-інструмент читає її нормально.
Тому сервер віддає **дзеркальну копію** з scratchpad-теки сесії (`www/index.html`),
а не сам файл:
- `serve_prototype.py` і тека `www/` живуть у **scratchpad поточної сесії**; шлях
  у `.claude/launch.json` — **сесійний**, у новій сесії його доведеться переписати
  під свій scratchpad (скрипт при цьому перестворити — scratchpad чиститься);
- **після кожної правки прототип треба перекопіювати в `www/index.html`**:
  `cp "<repo>/subscription-details-prototype.html" "<scratchpad>/www/index.html"`,
  інакше браузер покаже стару версію.

Пастки вбудованого браузера:
- Панель інколи віддає **застарілий кадр** — надійна перевірка через
  `javascript_tool` (читати DOM), а не лише screenshot; або повторний `navigate`.
- **Кліки координатами мис-скейляться** — інтеракції ганяй через `el.click()` /
  `dispatchEvent` з `javascript_tool`, не `computer{left_click}`.
- **`javascript_tool` — ізольований світ**: бачить DOM, але НЕ бачить IIFE-глобалів
  (`PAGES`, `AM`, …). Демо-хуки на `window` — бачить. Перемикати сторінку зручно
  через radio: `input[name="detailsPage"][value="…"]` + dispatch `change`.
- **SVG/`[hidden]`**: атрибут `hidden` на `<svg>` не ховає без CSS
  (`.icon[hidden]{display:none}` є); так само `[hidden]` не діє там, де CSS задає
  `display` — для view є явні правила `.app[hidden],.dashview[hidden],.licview[hidden]{display:none}`.
- Після кожної правки — screenshot + `read_console_messages(onlyErrors:true)` (чисто).

**Git**: комітимо прямо в `main`, файл прототипу **окремо**, з trailer
`Co-Authored-By: Claude …`. `.claude/launch.json` (сесійний scratchpad-шлях)
**не комітимо**. ⚠️ Репо на Google Drive + робота з кількох машин → git-стан
інколи клобиться посеред сесії (застряглий `main.lock`, «no commits yet»);
діагностика/відновлення — див. пам'ять `drive-git-hazard`.

## Архітектура: один механізм view-перемикання

- **`PAGES`** (JS-обʼєкт) — реєстр усіх сторінок; ключ = значення radio в пікері,
  `kind` визначає, який DOM-view показати. Плани підписки/перпетуал несуть ще
  `name/price/devices/prod/dev/ai/…` (звідси `renderPlanRows`/`renderFeatures`).
- **`applyDetailsPage()`** — серце навігації. Тримає мапу `VIEWS` (kind → `#id`
  контейнера) і ховає всі, крім активного; `#appView` (деталі) показується лише
  для `sub`/`perp`. Додати нову сторінку = запис у `PAGES` + запис у `VIEWS` +
  контейнер `.licview` + опція в пікері.
- **`goToPage(key)`** — програмна навігація (лишає radio в пікері синхронним).
- Деталі (`#appView`, `.app`) розрізняють моделі атрибутом `data-page="sub"|"perp"`.
  Глобально хром деталей прихований (`.sidebar,.topbar{display:none}`).

### Список поверхонь (kinds)
- `dash` — **Dashboard (Overview) v2**: `#dashView`, full-width топ-бар (лого +
  profile-hub меню), **без сайдбару**, центрована колонка ~1040px. Блоки: Products
  (2/3) + дві create-CTA (1/3), Recent invoices, split Recent activity / Users.
  «Show more →» ведуть на відповідні сторінки; back усіх list-сторінок вертає сюди.
- `sub` / `perp` — сторінка деталей (спільний shell `#appView`). Плани:
  `maker/prototype/pilot/startup/business` + `prototypeaddons` (Prototype з
  докупленими add-on'ами: колонка Extra, ціна $126). Перпетуал — `perp`.
- `products` / `products2` / `products3` — **сторінка Products** (`#licensesView`),
  data-driven таблиця з `PRODUCTS`/`PRODUCTS_V3` через `renderProducts()`.
  Три лейаути: `1` grouped (name+label, renewal+price+billing разом), `2` «one
  column per field» (перша колонка Product, без Renewal), `3` «product-first
  (neutral)»: Product·License·Type·Status·Created; у нього ще фільтр по лейблу.
  Рядки TBMQ/Viaanix не мають детальних сторінок → відкривають stub (`openRow`).
- `portfolio` — **Portfolio** (`#portfolioView`), теж заголовок «Products»,
  згруповано по продукту з роллапами; спільні хедер-колонки над групами.
- `invoices` / `activity` / `users` — окремі повні сторінки (зі списку дашборда).
- `profile` / `billing` — **Profile settings** і **Billing & payment**, повні
  форм-сторінки з профільного меню. Форм-система (нова, з токенів): `.setcard`
  (секція+hint), `.field`/`.field2`, `.savebar` (Save **disabled until change**),
  `.searchbox`, danger-картка, toggle `.switch`.

### Стандартний тулбар (усі list-сторінки однаково)
Зліва направо: **`.searchbox`** (persistent input ~280px, лупа всередині, page-
placeholder) → фільтри (якщо є) → `.spacer` → refresh (outlined icon-btn) →
**primary** (напр. «+ New license») в самому правому куті. Search-інпути поки
**невізуальні** (без логіки). Патерн застосований на Products, Portfolio,
Invoices, Activity, Users, Instances-таб, Logs-таб.

### Пікер сторінок (тимчасовий)
⚙-кнопка внизу праворуч → «Prototype settings». Перемикачі: «Manage add-ons style»
(Modal/Full-screen) і «Details page» — radio-список: Dashboard · група **Products**
(Grouped / One column per field / Product-first / Portfolio) · група **Pages**
(Invoices / Activity / Users / Profile settings / Billing) · група Perpetual ·
група Subscription plans (Maker…Business, Prototype + add-ons). Дефолт —
**Prototype**. Стан у JS-змінних (`detailsPage`, `productsVariant`, `addonsStyle`),
без persist.

### Демо-хуки
- `window.showSubAlert('…')` / `clearSubAlert()` — банер на деталях.
- `window.setFeature('edge'|'trendz'|'whitelabel', on)` — чипи фіч на поточній
  details-сторінці. (Дашбордного банера `showDashAlert` більше нема у v2 —
  функція лишилась як no-op, бо `#dashAlert` прибрано.)

## Підтверджені дані

**Плани підписки** (Included = Limit, usage — плейсхолдер 0):
Maker $10/mo (10 dev · 1 prod · 1M AI); Prototype $39 (50·1·2M);
Pilot $99 (100·1·4M +WL); Startup $299 (500·2·8M +WL); Business $499 (1,000·3·16M +WL).
Prototype + add-ons = $126/mo (1+2 prod, 2M+2M AI, Edge+Trendz).

**Перпетуал**: «ThingsBoard PE Perpetual License», **$4,999 one-time**,
1 рік апдейтів (issued Aug 13 2026 · until Aug 13 2027), 5,000 dev · 1 prod ·
5M AI · white-labeling. Жодних recurring-понять. (Прайс-рядок у хедері прибрано
на прохання — суму видно в Invoices.)

**Продукти (variant 3 / portfolio)**: сімʼї **ThingsBoard / TBMQ / Viaanix**;
пакети — Maker/Prototype/Pilot/Startup/Business + Professional edition (perpetual)
для ThingsBoard, TBMQ PE + Professional edition для TBMQ, Offline для Viaanix.
Типи білінгу: Subscription / Perpetual / Offline.

**Дати**: у списках/картках формат `Mon DD YYYY`; таймстемпи логів/activity —
ISO `YYYY-MM-DD HH:MM:SS` (свідомо, як у Logs-табі).

## Дві поверхні «Manage add-ons» (не плутати)
1. **Modal** (`#addonsOverlay`, контролер `AM`) — компактна двокрокова модалка.
2. **Full-screen** (`#fsAddons`, контролер `AMF`) — окрема сторінка.
Класи `.am-*` спільні; щоб змінити лише full-screen — скоупи `.fs-screen .am-…`.
Проратація фіксована **16 з 31 дня** (картка Next charge каже «in 16 days», щоб не
суперечити — це вже узгоджено).

## Відкриті питання / борг
- **`AM`/`AMF` не знають про плани**: жорстко зашитий Prototype (BASE 39, incl
  1 prod / 2M AI). Відкривши «Manage» на Business — побачиш дані Prototype.
  Полагодити = перевести контролери на `PAGES`.
- **TBMQ / Viaanix не мають детальних сторінок** — їхні рядки (у variant 3,
  portfolio, дашборді) відкривають stub-модалку. ThingsBoard-рядки ведуть на реальні.
- **Дані окремих сторінок мокові й не звʼязані** між собою: Invoices/Activity/
  Users/дашборд мають власні набори, не похідні від `PAGES`. Números/дати не
  зведені в одну систему.
- **Search-інпути невізуальні** (лупа + placeholder, без фільтрації).
- **Два заголовки «Products»** (список `#licensesView` і `#portfolioView`) —
  розрізняються лише підписами в пікері.
- Дрібні свідомі рішення (можуть «повернутися» питанням): Users сортовані Created
  desc; Pending — attention-чип (заливка); у профільному меню лишено «Sign out».
- `.claude/launch.json` містить сесійний scratchpad-шлях (див. «Як запускати»).

## Файли
- `subscription-details-prototype.html` — **єдиний активний файл** прототипу.
- `subscription-details-wireframe.html` — вихідний драфт-референс, не редагуємо.
- `serve_prototype.py` (у scratchpad сесії) — статичний сервер + `www/`-дзеркало.
- `NOTES.md` — цей файл.
