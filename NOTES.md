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
(`subscription-details-wireframe.html` — колишній драфт-референс — видалено як
сміття; за потреби він є в git-історії.)

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

⚠️ **Іноді вся тека Drive віддає `Operation not permitted` навіть Bash/Read-тулам**
(не лише серверу; `listdir` теж падає, з sandbox і без). Це TCC-локаут File Provider,
зазвичай після великого запису (вбудовані шрифти ~550KB роздувають файл) — Drive
синхронізується й тимчасово блокує теку. **Відновлюється сам за 1–2 хв** — ретраїти
`open()` з backoff, не смикати. Через розмір файлу (base64-шрифти) **Read-тул впирається
в token-ліміт** — читай/правь через `python3` по рядках, а не Read цілком.

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
і `.claude/settings.local.json` **не комітимо**. git-identity **налаштована**
(user `mpanchukux`), `git commit` працює без env-обхідних. ⚠️ Репо на Google Drive
+ робота з кількох машин → git-стан інколи клобиться посеред сесії (HEAD відкочується
на чужий коміт, застряглий `main.lock`, «no commits yet»); мої проміжні коміти
ставали dangling — контент лишався в робочому файлі, я перекомічував поверх поточного
HEAD. Діагностика/відновлення — див. пам'ять `drive-git-hazard`.

## Архітектура: сторінки окремо, презентація окремо

Головний принцип: **один вузол контенту на сторінку**, і тонкий шар презентації,
який вирішує, *де* цей вузол показати. Копій сторінок під різні флоу немає.

- **`PAGES`** — реєстр сторінок; ключ = значення radio в пікері, `kind` каже, який
  вузол показувати. Плани/перпетуал несуть ще `name/price/devices/prod/dev/ai/…`
  (звідси `renderPlanRows`/`renderFeatures`).
- **`PAGE_NODES`** (kind → `#id`) — той самий вузол контенту для обох флоу.
  `sub` і `perp` свідомо ділять `#appView` (один шаблон деталей).
- **`FLOW_HOSTS`** (`{ topbar:'#shellMain', overlay:'#pgoBody' }`) + `flowMode` —
  куди монтувати. `presentPage(kind)` ховає все, крім цільового вузла, і робить
  `host.appendChild(target)`. Додати новий спосіб показу = ще один хост, не копія
  сторінок.
- **`applyDetailsPage()`** готує дані сторінки й делегує показ у `presentPage`.
- **`goToPage(key)`** — програмна навігація (тримає radio в пікері синхронним).
- Деталі (`#appView`) розрізняють моделі атрибутом `data-page="sub"|"perp"`.

### Два флоу презентації
**Активний флоу — лише Top-bar navigation.** Full-screen overlays **заархівовано**:
перемикач Flow прибрано з верху панелі налаштувань, обидва radio (`flowMode`
topbar/overlay) переїхали в таб **Archive** («Flow (archived)»). Код декаплінгу
(`presentPage` / `FLOW_HOSTS` / overlay-гілка) лишили як є — overlay ще працює, якщо
вибрати його в Archive, просто він більше не дефолтний шлях.
1. **Top-bar navigation** (єдиний активний): у топбарі nav-пункти **Home · Licenses ·
   Invoices · Activity · Users**, відцентровані по самому бару (`position:absolute;
   left:50%`), активний підсвічений (`NAV_FOR_KIND`; для деталей — Licenses).
   Сторінки рендеряться під баром у `#shellMain`.
2. **Full-screen overlays** (архів): nav-пунктів немає (`.tnav[hidden]`), базова сторінка
   лише дашборд, усе інше відкривається **в одному** оверлеї `#pageOverlay`
   (хедер = заголовок області + ✕, тіло `#pgoBody`). Дашборд лишається змонтований
   під непрозорим оверлеєм. Заглиблення **замінює** контент оверлею — стеку немає.
   - смуга оверлею показує **заголовок області** (`AREA_TITLES`/`AREA_FOR_KIND`):
     у деталях це «Licenses», хоч зі списку, хоч із рядка дашборда;
   - `#pgoBody[data-level]`: `root` (списки/форми — власні back, `h1` і підзаголовок
     приховані, бо їхній back = ✕) / `deep` (деталі — back і власний заголовок є,
     бо back веде на список). Правило: **back існує лише коли він ≠ close**;
   - ✕ і Escape виходять на дашборд із будь-якої глибини.

### Спільний контейнер контенту
Усі сторінки в одному контейнері: `--pageW:1120px`, `--pageX:24px`, `--pageY:28px`,
правило на `.pagewrap,.dwrap,.licview,.sheet` (центровано). Тому при переходах
контент не стрибає горизонтально. Форми (Profile/Billing) мають власний ліміт
~760px, але центровані в тому ж контейнері.

### Dashboard density variants (A / B) — `DATASETS`
`dash` (populated) тепер має **два датасети густини**, обидва kind `dash`, DOM `#dashView`:
- **A — small account** (`PAGES.dashboard`, `variant:'A'`): 2 ліцензії (TB + TBMQ sub),
  2 users, 3 invoices. Licenses-блок показує **всі** рядки (нема чого тримати).
- **B — large account** (`PAGES.dashB`, `variant:'B'`): **12 ліцензій** (`id` B1–B12,
  кожна з `tier`), 8 users, 7 invoices. Мікс TB (maker/prototype/pilot/startup/business),
  TBMQ subs, TB/TBMQ perpetuals; статуси: active / **payment_failed** (B3) / **canceled**
  (B5) / **updates_expiring** (B11). Licenses-блок — **top-5 attention-first**
  (`payment_failed` 0 → `updates_expiring` 1 → active 2 → canceled 3, далі найближчий
  `event`), рядок **label-first**; Show all тотал: «Show all (12)» / «Show all (8)».
- `dashempty` — новий користувач (без змін).

**Єдине джерело на варіант** (`DATASETS[dashVariant]`, `DATA()`): дашборд-блоки
і **повні сторінки** Licenses/Invoices/Users/Activity рендеряться з того самого набору
(`renderDatasetViews`). **Субтайтла на Home немає взагалі** — H1 стоїть сам
(`#dashState`/`renderDashState` видалено). «Show all»-лінки **без стрілки →** (усі 4
блоки + `setShowAll`). `currentProducts()` для variant 3 читає `DATA().licenses`.
Дати — `Mon DD YYYY` (`dateKey`/`fmtDate`). today = **Aug 19 2026**.

### Деталі ліцензії керуються рядком (`openLicense` / `renderLicenseDetails`)
`#appView` більше **не** статичний per-plan — він наповнюється з **об'єкта ліцензії**
(рядок датасету). Кожен рядок несе `data-licid`; `openRow` → `openLicense(licById(id))`
→ `activeLicense` + `PAGES.licenseView={kind:sub|perp}` + `goToPage('licenseView')`.
`applyDetailsPage` для licenseView кличе `renderLicenseDetails(activeLicense)`; для
іменованих plan-сторінок пікера — `licFromNamed(key)` (той самий рендер).
- **`TIER_SPECS`** (maker…business, `tbmqsub`, `tbperp`, `tbmqperp`) дає entitlements
  (**+ рядок Assets**; TBMQ — Sessions / Messages/sec, без Devices/AI; perp — без /month;
  perp/TB — 5,000/5,000/1/5M AI/WL; TBMQ perp — 10,000/1,000/1/WL). `renderEntitlements`
  будує meter-рядки; `extras` (prototypeaddons) → колонка Extra.
- `renderLicenseDetails` виставляє: назву (`#planName`/`#planNamePerp`), **статус-чіп**
  (`#statusSlot`: Active/dark attn/muted Canceled), мітку (`#labelSlot`), period
  (`#periodSub`/`#periodPerp`), ціну/next-charge, features (WL/edge/trendz), **alert**
  (`#subAlert`: payment-failed з лінком на Billing / updates-expiring / canceled), і
  **actions** (canceled → ховає Change plan+kebab, показує `#renewBtn`).
- **TBMQ-рядки більше не stub** — відкривають TBMQ-наповнену сторінку. Немає dead rows.
- **Details Activity-таб** (перейм. з «Audit log»): фід `#licFeed`, синтезований
  `licenseActivity(lic)` (created/label/payment/cancel/updates події цієї ліцензії),
  ті самі картки з expand-in-place; audit-toggle тепер слухає й `#appView`.

### Cancel subscription (`openCancelModal`)
Кебаб деталей (`[data-cancel-active]` → `activeLicense`) і меню рядка (`[data-cancel]`
→ `cancelFromRow` → `licById`) відкривають confirm-модалку (назва+мітка, наслідок,
**Keep subscription** secondary+focus / **Cancel subscription** destructive). Confirm:
`lic.status='canceled'` → `renderDatasetViews()` + `renderProducts()` + (якщо відкрита)
`renderLicenseDetails`. Статус пропагується скрізь (muted pill `Canceled · until {date}`,
рядок `.off`; хедер деталей — muted чіп + Renew-плейсхолдер).

### Період-фільтр активності (`filterFeedByPeriod`)
Компактний контрол `.perctl` (Period-дропдаун: All time / Last 24h / 7d / 30d / Custom
range…) на **Activity-сторінці** й у **details Activity-табі**. **Усе живе в одній
панелі дропдауна**: Custom range розкриває date-поля + Apply **всередині** `.permenu`
(панель лишається відкритою; toolbar ніколи не змінює склад). Apply закриває панель,
тригер читає «Period: 12.08 – 19.08» (`fmtDM`, dd.mm; один край → «from/until dd.mm»).
Повторне відкриття з активним custom тримає поля видимими. ⚠️ Generic `.dropmenu button`
стриптить хром — для Apply є явний override `.percustom .perapply` (вид secondary-кнопки).
Стан `actPeriod` / `licPeriod`; фільтр по днях через `epochDay` (days-from-civil — бо
`Date()` заблоковано), `TODAY_DAY = Aug 19 2026`. Порожньо → empty-state.

### Refresh feedback (`data-refresh`)
Усі refresh-кнопки → `data-refresh`: делегований хендлер додає `.spinning`
(~600ms CSS-спін). **Лише спін** — текст «Updated just now» прибрано на прохання.

**`homeKey`**: nav Home / лого / overlay-close / Escape ведуть на `homeKey` (останній
вибраний dash-варіант: dashboard/dashB/dashempty), а не жорстко на A — тому вибраний
варіант тримається при поверненні на Home.

Рендер dashboard-блоків: `renderDashLicenses/Invoices/Users` (top-level,
dataset-driven); рядки строяться **тими самими** `headHtml`/`rowHtml` (variant 3), що
сторінка Licenses. Recent invoices/users — тепер **не статичні копії**, а з `DATA()`
(`#dashInvBody`/`#dashUsersBody`). Стуб-кнопки в перерендерених таблицях працюють через
делегування на persistent `<tbody>` (не per-element). Рядки-ліцензії дашборда клікаються
через `openRow` → `openLicense` (кожен рядок відкриває реальну сторінку деталей).

### Список поверхонь (kinds)
- `dash` — **Dashboard (Home)**, стартова сторінка (варіанти A/B — див. вище).
- `dashempty` — **новий користувач**: структура планів із перемикачами
  **Product** (ThingsBoard/TBMQ) і **Billing** (Subscription/Perpetual), дані з
  `EC_PLANS`. Перемикачі **вертикально** (`.planpick` column, по `.planpick-row`): Product
  зверху, Billing під ним — залежність читається top-down (обидва left-aligned, лейбли
  вирівняні `min-width`). TB×Subscription — 5 карток, решта — одна центрована.
  Deployment-перемикача немає (портал self-managed).
- `sub` / `perp` — деталі (спільний `#appView`). Головний вхід — **`licenseView`**
  (row-driven, з `activeLicense`); іменовані plan-сторінки пікера (`maker`…`business`,
  `prototypeaddons`, `perp`) — той самий рендер через `licFromNamed`.
- `products3` — **сторінка Licenses** у флоу (product-first neutral). У флоу
  ведуть **лише** на неї (back із деталей — жорстко `products3`).
- `invoices` / `activity` / `users` / `profile` / `billing` — повні сторінки.
- Архів: `products` (grouped), `products2` (one column per field), `portfolio`.

### Активність — фід, не таблиця
Події живуть **per-variant** у `DATASETS[..].activity` (`DATA().activity`);
`feedItem()` рендерить сторінку Activity, блок на дашборді (3 останні) і details-таб
(`licenseActivity`). Елемент: **іконка типу inline в мета-рядку** (`.fi-ic`,
16px, заливка `--track`, у розмір тексту мети) — таймстемп поруч праворуч, **фраза
нижче** на всю ширину (раніше іконка була окремим блоком 24px зліва). muted-мета =
**лише таймстемп**, фраза в порядку **що зроблено → from/to → ким** (виділені сутності).
Кнопка «details» **розгортає raw-JSON payload на місці** (`.fi-audit`, capped 300px зі
скролом, кілька разом) і **тримає pressed-стан** поки payload відкритий
(`.iconbtn[data-audit][aria-expanded="true"]` — рамка/заливка ink) — модалки
«Audit log details» **більше немає**. На деталях та сама структура — таб **«Activity»**
(перейменований з «Audit log», тепер фід, не таблиця).

### Таблиці
Колонки дій позначені класом `cellact` (+ `th[aria-label$="ctions"]`) і
стискаються під контент із `text-align:right`, щоб дії тримались краю таблиці.
Колонки з даними, що стоять останніми (Created Time в Instances, Limit у Plan &
Add-ons), свідомо не зачеплені.

**Стиль `th`**: uppercase label-токен, але **weight 400** (не 500 — column-heads
свідомо легші за секційні заголовки). Сорт-індикатор — **тонкий SVG-шеврон** у
`.arrow` (11px), обертається через CSS `th[aria-sort="ascending"] .arrow{rotate 180}`;
JS більше **не свопає** ▲/▼ текстом, лише перемикає `aria-sort`.

**Рамка list-сторінок** (`.listcard`): Licenses / Invoices / Activity / Users — по
**дві окремі картки** (`--line2`-рамка, `border-radius:10`, як `.dblock` дашборда):
(1) **тулбар** (search/фільтри/refresh/primary) у власному блоці, (2) **таблиця/фід
+ пейджер** у білій картці нижче. Заголовок+підзаголовок — **над** обома. `overflow`
на картці **не ставимо** (клипить дропдауни); широкі таблиці скролить власний wrapper.
Portfolio (архів) не загорнутий. Фільтр Licenses — **без префікса «Type:»** (лише чипи).

**Топ-бар — contained band**: білий фон **не** тягнеться edge-to-edge. Зовнішній
`.dtopbar` — прозорий (bg сторінки, `padding:12px 24px 0`); **сам бенд** —
`.dtopbar-inner` (`max-width:var(--pageW)`, центрований, `background:var(--card)`,
`border:--line2`, `border-radius:10`) — «плаваючий» бар, сірий фон видно з боків.
Контент бару (лого/nav/профіль) через внутрішній `padding:0 var(--pageX)` вирівняний
точно з текстом сторінок; біла кромка бенда — на ширині pageW-боксу (трохи ширша за
текст). `.tnav` абсолютно центрується в inner.

### Стандартний тулбар (усі list-сторінки однаково)
Зліва направо: **`.searchbox`** (persistent input ~280px, лупа всередині, page-
placeholder) → фільтри (якщо є) → `.spacer` → refresh (outlined icon-btn) →
**primary** (напр. «+ New license») в самому правому куті. Search-інпути поки
**невізуальні** (без логіки). Патерн застосований на Licenses, Portfolio,
Invoices, Activity, Users, Instances-таб, Logs-таб.

### Пікер сторінок (тимчасовий, контекстний)
⚙ внизу праворуч → «Prototype settings». Перемикача **Flow вгорі більше немає** —
одразу таби **Settings | Archive**.
- Settings: «Dashboard (Home)» — три опції: **small account (A)** / **large account
  (B)** / **new user (empty)** + Products → «Product-first (neutral)» + **Wizard
  stepper** (A — Summary rail / B — Progress line / C — Numbered steps; перемикає
  презентацію степера NL-візарда наживо). Варіанти планів (Maker…Business, Prototype
  + add-ons) і «Perpetual license details» показуються **лише** коли відкрита
  сторінка деталей (`syncSettingsContext`).
- Archive: **Flow (archived)** (topbar / overlay), `products`, `products2`, `portfolio`
  + перемикач Manage add-ons
  (Full-screen = флоу / Modal = архів).
- Секцій «Pages» і окремої «Perpetual» немає — ці сторінки досяжні у флоу.
- Стан у JS-змінних (`flowMode`, `detailsPage`, `productsVariant`, `addonsStyle`),
  без persist.

### Демо-хуки
- `window.showSubAlert('…')` / `clearSubAlert()` — банер на деталях.
- `window.setFeature('edge'|'trendz'|'whitelabel', on)` — чипи фіч на поточній
  details-сторінці.

## Типографіка (type-system)

**Шрифти вбудовані base64-woff2** (константа «без зовнішніх запитів»): Ubuntu
**400/500/700** + **Ubuntu Mono** (license keys / IDs). Light 300 свідомо не
вантажимо. Через це файл ~550KB (див. пастку Read-token-ліміту вище).

**Шкала** — CSS custom properties у `:root` (одне місце) + утиліти `.t-*`:
`--t-display 64` · `--t-h1 36/700` · `--t-h2 20/500` · `--t-body 16/400` ·
`--t-small 14/400` · `--t-label 14/500 uppercase +0.10em`. Правила: **14px — підлога**,
вага росте з розміром, **bold 700 лише для display/h1**; `--t-small` і `--t-label` —
один розмір, різняться регістром+трекінгом. Числа — `.tnum`; mono — `.t-mono` (ls:0).

**Застосовано на всіх сторінках.** Ієрархію зведено на 6 рівнів шкали (рев'ю в
браузері по кожній поверхні: dashboard, деталі sub/perp, Licenses, Users, portfolio,
модалки Manage add-ons / generic / pay). Мапінг, за яким котили:
- **page-titles → h1** (36/700): `.lic-h1` (Profile/Billing/списки), `.planname`
  (деталі), `.dwelcome h1` (дашборд). Прибрано ad-hoc 30/800.
- **блок/картка/модалка-титули → h2** (20/500, sentence): `.dblock-head h2`,
  `.pc-head h2` (plan cards), `.am-h2`, `.am-titlebar h3`, `.modal .mh h3`,
  `.paymodal-h h3`, `.fs-maintitle`. Прибрано 16–18/700.
- **тихі маркери/колонки/груп-лейбли → label** (14/500 UPPERCASE +0.10em):
  `th`, `.sh h3`, `.am-sechead h4`, `.pf-gname`, `.pf-tile .k`, `.dprofmenu .grp`,
  `.setcard-h h2`, `.minihead`, і **`.billcard-h`** (тепер теж uppercase-кікер).
- **hero/stat-числа → h2 size, weight 500, `.tnum`**: `.nextcharge .big` (сума
  next-charge), `.am-cellval`, `.am-dueval`, `.pf-tile .v`, `.pc-price`, `.big`.
  Свідомо weight **500, не 700** — правило «bold 700 лише для display/h1» тримаємо
  навіть на числах.
- **subtitle → small**: `.dwelcome p` (як `.lic-sub`).
Body/контроли/клітинки, що вже були 14px (= підлога small), лишили літералами —
не churn'или. Прото-gear-панель (`.settings-panel`, `.sp-*`) свідомо не чіпали.

Розв'язані раніше відкриті питання: field-labels = `--t-small`; input-текст =
`body 16`; page-subtitle = `small`.

⚠️ Один свідомий компроміс: на plan-cards (`dashempty`) назва плану і ціна тепер
**однакові** (обидві h2/500) — ціна більше не домінує як 22/800, бо правило забороняє
важчу вагу. Узгоджено з карткою Next charge (label-заголовок + h2-число). Якщо
захочеться повернути ціні перевагу в межах системи — демоутити назву до label-кікера.

**Деталі — один section-heading стиль**: усі секційні заголовки на details
(«License key», «Subscription period»/«Software updates», «Plan & add-ons») **і таби**
(Invoices/Instances/Activity) тепер label-стиль (uppercase 14/500 +0.10em, ink).
`.periodhead` і `.tab` зведені на label-токен; вибраний таб лишає ink+underline (600).

## Модалки та поведінкові додатки

- **Apply coupon → модалка** (`#couponOverlay`, IIFE-контролер): reuse chrome
  payment-modal (`.payoverlay/.paymodal`, вужча — inline `width:min(420px,96vw)`).
  Один інпут + placeholder, Cancel/✕/Esc/бекдроп закривають, **Apply disabled поки
  інпут порожній**. Раніше був inline-експандер у хедері (`#couponInline`) — прибрано.
- **Unsaved-changes guard** (Profile + Billing): `goToPage` обгорнуто —
  `goToPage` перевіряє `anyDirty()` і, якщо є незбережені правки, кличе `confirmLeave`
  (реальна навігація в `_goToPage`). Через це guard ловить **усі** переходи одним
  місцем: nav-таби, лого, профіль-меню, in-page `[data-goto]`-лінки. `dirtyViews` +
  `settingsClean` веде `wirePageSave`; Save чистить прапорець (guard не спрацює).
  Модалка — generic `openModal` з ін'єктованими кнопками (як delete-confirm):
  **Stay** (`.btn.sec`, справа) / **Leave without saving** (`.btn.ter`, зліва).
  Leave кличе всі `settingsClean` (скидає прапорці; значення полів у прототипі **не**
  відкочуються — свідомо, це wireframe). Прото-gear-перемикання сторінок guard оминає
  (кличе `applyDetailsPage`, не `goToPage`).
- **Profile / Billing без back-кнопки**: `#profBackBtn`/`#billBackBtn` прибрано.
  `.setgrid{width:100%}` — сторінки займають **весь спільний контейнер** (1120).
  **Картки (`.setcard`) теж full-width** (та сама кромка, що таблиці/дашборд-блоки);
  форми всередині капнуті: `.setcard > *:not(.setcard-h){max-width:800px}` — поля не
  розтягуються, ліве вирівнювання по паддінгу картки. Хедер+Save — до правого краю
  контейнера. Субтайтли обох сторінок прибрано (Billing — «How you pay…» видалено;
  H1 стоїть сам).
- **Profile — три картки**: «Your profile» розбито на окремі `.setcard` **Personal**
  (First/Last/Email/Language) і **Security** (паролі + helper), поряд із **Company** —
  усі один стиль. Опис-рядок під заголовком прибрано (title сам). Sticky Save один
  на всю сторінку (гардить обидві + Company через `#profileView` input-делегування).
- **Billing → Payment method**: кнопка «Update» замінена на **icon-btn олівець**
  (`.iconbtn.ib`, `#payUpdateBtn`) — відкриває ту саму Update-payment-method модалку.
- **Activity шрифти**: увесь фід (meta / речення / raw-JSON) уже ≥14px (з type-pass);
  перевірено — нічого нижче 14 немає, JSON лишається 14px mono.

## Content audit (копірайт/дані-пас) — статус

**§1 (термінологія) зроблено**, §2–§7 у черзі.

§1: Activity vs таб «Audit log»; **License key** скрізь (не «secret» — воно лише в raw
JSON); **Offline/Viaanix прибрано**; no «Pay-as-you-go» (→ Subscription); заголовок
«Products»→**«Licenses»**; **Auto-pay**; дві Manage-дії розведено (**«Manage add-ons»** +
прямий лінк **«Billing & payment →»**); меню **«Profile settings»**; одне «White labeling»;
**Cardholder name**; **Plan & add-ons**; AI-формулювання; sentence-case заголовки.

Ще НЕ зроблено:
- §2 **єдиний датасет**: today Aug 19 2026; інвойси → `NAWE49WG-000X` (вбити `INV-2026-…`);
  одна renewal-дата на підписку, узгоджена з проратацією (16/31 → цикл до **Sep 4 2026**?
  — **відкрите питання, чекає підтвердження**); одна purchase+updates-end для перпетуалу.
- §3 **Users без статусу**: колонку Activation-status + чипи (Pending/Activated)
  **прибрано** ✅; таб на деталях **вирівняно до фіду** ✅ (тепер «Activity»,
  Status/Success-таблиці немає). Ще: перейменувати Created → «Added {date}»? —
  **не зроблено**.
- §4 **прайсинг**: рядок **Assets** в entitlements; AI-юніт «{N}M AI credits» + `TODO`
  (cadence перпетуалу; чи включають self-managed subs AI взагалі); `+$0.10`.
- §5 **механіка**: формат дат/грошей; sentence case.
- §6 **зайвий копірайт**: usage-tooltip геть; пароль-плейсхолдери «••••••••»;
  entitlements-заголовки **Resource / Purchased**; stateful dashboard-subtitle; empty-states.
- §7 **поведінка**: payment-failed алерт із дедлайном + лінком «Update payment
  method →» на Billing — **зроблено** ✅ (`renderLicenseAlert`). Діалог «Login as»
  (підтвердження + запис в audit) — **не зроблено**.

## Підтверджені дані

**Плани підписки** (Included = Limit, usage — плейсхолдер 0):
Maker $10/mo (10 dev · 1 prod · 1M AI); Prototype $39 (50·1·2M);
Pilot $99 (100·1·4M +WL); Startup $299 (500·2·8M +WL); Business $499 (1,000·3·16M +WL).
Prototype + add-ons = $126/mo (1+2 prod, 2M+2M AI, Edge+Trendz).
**+ Assets** (підтверджено пізнішим ТЗ): assets = devices на кожному tier
(10/10 … 1,000/1,000; перпетуал TB 5,000/5,000) — рядок Assets є в `TIER_SPECS`.
**TBMQ** (теж із ТЗ): sub $15/mo — 100 sessions · 100 msg/sec · 1 prod;
perp $2,999 — 10,000 sessions · 1,000 msg/sec · 1 prod · WL.

**Перпетуал**: «ThingsBoard PE Perpetual License», **$4,999 one-time**,
1 рік апдейтів (issued Aug 13 2026 · until Aug 13 2027), 5,000 dev · 1 prod ·
5M AI · White labeling. Жодних recurring-понять. (Прайс-рядок у хедері прибрано
на прохання — суму видно в Invoices.)

**Продукти (variant 3 / portfolio)**: сімʼї **ThingsBoard / TBMQ** (Viaanix та тип
**Offline прибрано** — content audit §1); пакети — Maker/Prototype/Pilot/Startup/Business
+ Professional edition (perpetual) для ThingsBoard, TBMQ PE + Professional edition для TBMQ.
Типи білінгу: **Subscription / Perpetual**. (Instance-статус Online/**Offline** лишається —
це інша вісь.)

**Дати** — наразі мішанина, уніфікація в content audit §5 (**ще не зроблено**):
цільовий формат `Aug 13, 2026` (з комою), date-time `Aug 13, 2026, 10:33`, ISO —
**лише** в raw audit-payload. Поточно в коді ще: списки `Mon DD YYYY` без коми, фід
`19 Aug 2026, 13:13`, ISO в деяких таблицях. Єдиний датасет (today = **Aug 19, 2026**)
і одна renewal-дата — теж §2, ще не зведені.

## Дві поверхні «Manage add-ons» (не плутати)
1. **Великa центрована модалка** (`#fsAddons`, контролер `AMF`) — **дефолт флоу**.
   Раніше був full-screen takeover; тепер `.fs-screen` = бекдроп (dim + `backdrop-filter:blur`),
   `.fs-box` = панель (~90vw до 1200px × 90vh, rounded, shadow), `.fs-body` скролиться
   всередині. Клік по бекдропу — no-op; закриття лише ✕ / Cancel / Esc.
   ⚠️ У пікері перемикач ще підписаний «Full-screen» — назва застаріла (це вже модалка).
2. **Modal** (`#addonsOverlay`, контролер `AM`) — архівна компактна двокрокова модалка,
   вибирається в Archive-табі налаштувань.
Класи `.am-*` спільні; щоб змінити лише flow-версію — скоупи `.fs-screen .am-…`.
Проратація фіксована **16 з 31 дня** (картка Next charge каже «in 16 days»).

## New license flow (`#nlModal`, контролер `NL`)
Створення ліцензії тепер **робочий степовий флоу** на chrome великої Manage-модалки
(`.fs-screen`/`.fs-box`, бекдроп, sticky footer). Вибір — **видимі картки, ніколи
селекти**.
- **Входи**: «+ New license ▾» (Home, Licenses, Portfolio-архів) → subscription /
  perpetual, `NL.open({kind})`; «Get started» на плані нового користувача →
  `NL.open({kind, product, plan, startStep:3})` — одразу Customize, кроки 1–2 ✓.
- **Степер — три варіанти презентації** (`nlStepperMode`, перемикач «Wizard stepper»
  у Settings-табі пікера: A/B/C; live-перемикання навіть із відкритим візардом):
  - **A — Summary rail (дефолт)**: вертикальний рейл ліворуч (`#nlRail`, `.nl-rstep`),
    заміняє горизонтальний бар повністю. Пройдені кроки — заливний ✓-дот + **обране
    значення** під лейблом («Product — ThingsBoard», «Plan — Pilot · $99 / month»,
    Customize — тотал; `railValue`), клікабельні назад; активний виділений; майбутні
    dimmed. Розмітка: `.nl-main` (flex row) = рейл + `.fs-body`.
  - **B — Progress line**: тонкий (3px) трек **на всю ширину модалки** одразу під
    hairline хедера (степбар у `nl-pb-mode` без паддінгів), fill = step/totalSteps;
    нижче один рядок з лівим паддінгом «Step 2 of 4 · **Plan**» (muted + bold назва).
    Без окремих пунктів, без часткових треків.
  - **C — Numbered**: кроки розподілені **на всю ширину** (max-width:680 знято;
    `.am-stepline{flex:1}` розтягує з'єднувальні лінії).
  - **C — Numbered steps**: початкова горизонтальна реалізація (`.am-steps`).
  Кроки: sub — **4** (Product → Plan → Customize → Review & pay); perp — **3**
  (**Product & Plan** злиті → Customize → Review & pay, бо на продукт рівно один
  пакет). Механіка: `totalSteps()` (3/4) + `panelFor(n)` мапить wizard-крок на
  панель (`perp: 2→#nlStep3, 3→#nlStep4`; `#nlStep2` на perp-шляху не існує).
  На perp-кроці 1 картки несуть **повний пакет** (назва пакета, value-line, ціна
  «$4,999 · one-time», термін апдейтів, ліміти з `EC_PLANS` без «All …»-рядка) +
  PE-блок нижче (`#nlProdExtra`); клік ставить product **і** plan → одразу Customize.
  Rail-значення кроку 1: «ThingsBoard PE Perpetual · $4,999» / «TBMQ PE license ·
  $2,999»; B: «Step N of 3», fill N/3. Футер `.nl-foot`: **на кроці 1 схований
  повністю** (клік по картці = перехід);
  далі Back / Continue (disabled без вибору; на кроці 4 → «Subscribe»/«Buy license»).
  ⚠️ `.btn` ставить display → правила `.nl-foot[hidden]`/`.nl-foot .btn[hidden]`.
- **Крок 1**: 2 **великі** product-картки (`.nl-prodcard`, ~половина модалки кожна,
  grid max-width 960): назва + value-line («Build your IoT solution. On your terms.» /
  «Scale your messaging. On demand.») + sub-line + для TB група **Unlimited**
  (Customers · Users · Dashboards · Messages · API calls · Integrations); на perp-шляху
  обидві картки додають тихий рядок «First year of software updates included.»
  **Клік одразу веде на крок 2** — Continue на цьому кроці немає.
- **Крок 2**: плани з **`EC_PLANS`**, але картки **компактні** — name/price/**лише
  key limits** (фільтр `keyLimits`: devices/assets/instances/sessions/msg-sec/AI;
  support/WL-рядки прибрано з карток). Під ґрідом один muted-рядок «All plans include
  unlimited customers…» (лише sub-шлях) і **один спільний блок** «What's included
  in Professional Edition» (`PE_FEATURES`, **7 фіч** — White-labeling прибрано,
  бо він НЕ edition-wide: лише Pilot+; HTML-`TODO: confirm with product that these
  PE features apply to Maker/Prototype` біля `#nlPlanExtra`) — **завжди розгорнутий**,
  без шеврона/кліку, вирівняний по лівому краю контенту кроку (як план-картки);
  **лише продукт ThingsBoard** (фічі TB PE, для TBMQ не показуємо — inferred).
  Вибір картки **не** авто-продовжує. TBMQ sub — одна картка preselected.
  **План-картки кроку 2 — повні feats** з `EC_PLANS` (capacity + support-tier +
  White labeling лише Pilot/Startup/Business — на Maker/Prototype рядка просто немає)
  + muted `foot`-рядок (Maker: «Includes Trendz Analytics & Edge Computing for
  testing.»; Business лишає «+$0.10 per extra device»). `foot` рендериться і на
  new-user екрані (`planCard`). Дані WL узгоджені з `TIER_SPECS` (maker/prototype
  wl:false) — Customize/Review/деталі показують те саме.
- **Крок 3 Customize**: контент Manage add-ons, **сідиться з обраного tier**
  (`INCL`/`BASE` в NL): fixed-поля з `TIER_SPECS.ent` (Devices/Assets або
  Sessions/Msg-sec), степери prod/AI (+dev лише TB sub), add-ons лише TB sub.
  Unit-ціни: sub 29/15/5; perp TB prod **$1,999 one-time** (заякорено інвойсом
  Add-capacity), AI $500/1M; perp TBMQ prod $999 — **inferred**. Fixed-рядки
  (Devices/Assets): «fixed by {plan} plan» лежить у **description-слоті**
  (`.fs-celldesc`) — один 4px-токен title→desc на всі рядки PLAN-секції.
  Праворуч calc summary: base + дельти + «New monthly» / «One-time total».
  **Review-крок вирівняний вліво** (`#nlModal .fs-review{margin:0}`; AMF-рев'ю
  лишився центрованим). **Топи вирівняні**:
  `.fs-right{top:0}` — ⚠️ sticky-інсет резолвиться від **padding box** скролпорта
  (fs-body має padding 24), тож будь-який позитивний top зсував панель нижче лівої
  навіть у спокої (старі 57px → 57px зсуву; стосувалось і AMF — виправлено спільно).
- **Крок 4 Review & pay**: головний рядок **розбитий**: жирний «ThingsBoard Pilot»
  зліва + жирна ціна справа (`.nl-mainline`), під ним regular-рядок ентайтлментів
  «100 devices · 100 assets · …» (`.nl-entline`); далі дельти → total → Due today,
  платіжний рядок Visa ••4242 (+auto-pay для sub) з лінком «Change → Billing &
  payment» (веде на Billing через guard).
- **Subscribe / Buy license → loading + success**: клік → кнопка в loading
  (`.nl-spin`, disabled, **ширина зафіксована** JS-ом) ~1.5s (`startPurchase`) →
  `commitPurchase` пушить ліцензію в **поточний** `DATA().licenses` (id `N1…`,
  created **Aug 19 2026**, sub renews Sep 19 2026 / perp updates до Aug 19 2027,
  extras/edge/trendz зберігаються), рендерить усе і ховає візард → **success-модалка**
  `#nlSuccess` (свіжий монохром, не копія порталу: ✓-коло, «Thank you for purchasing
  {ThingsBoard|TBMQ} Professional Edition {subscription|perpetual license}», «Use this
  license key to activate your instance:», **mono-key** у `.nl-keybox` + copy-iconbtn,
  лінк «installation page» (stub), full-width **Done**). Done/Esc → **Licenses**, де
  новий рядок видно (і в dashboard-блоці). Ключ детермінований від `nlSeq`.
- **Закриття mid-flow** (✕/Esc) з зробленим вибором → та сама unsaved-changes
  модалка (Stay / Leave without saving); preselected-вхід (Get started) теж рахується
  як «selections made». Контент кроків повністю рендериться JS — усі події делеговані.

## Інтеракції-пас (15-пунктовий батч)
- **Дропдауни не кліпляться**: `elevateOpenPops` — на кожен клік (capture-фаза +
  `setTimeout 0`, бо opener-и роблять stopPropagation; rAF не годиться — не тікає
  в прихованому табі) всі відкриті `.dropmenu`/`.menu .pop` перепозиціонуються
  `position:fixed` (z 320) із прив'язкою до тригера ([aria-haspopup] у батьку);
  `.pop`/`.right` — right-aligned; фліп догори біля низу вьюпорта. Без внутрішніх
  скролбарів (`overflow:visible`).
- **View invoice → мок-PDF у новому табі**: усі кнопки → **`<a data-viewinv
  target="_blank">`**, blob-`href` (print-styled HTML-інвойс: хедер ThingsBoard,
  номер, line items, total, @media print) заповнюється в **capture-фазі реального
  кліку** — новий таб відкриває сам браузер, popup-blocker не діє. ⚠️ Вбудована
  панель прев'ю глушить navіть untrusted-anchor нові таби — в реальному браузері ок;
  контент верифіковано через iframe.
- **Download PDF**: `buildPdf()` — мінімальний валідний односторінковий PDF,
  зібраний ран-таймом (динамічні xref-офсети, Helvetica) → `{num}.pdf` через
  blob+`a[download]`; фідбек: лейбл «✓ Downloaded» ~1s. Дані рядка — `rowInvoiceData`
  (перші 3 `<td>`), тож працює і в статичних таблицях деталей.
- **Delete user**: `[data-deluser]` → confirm-модалка «Delete {email}? They will
  lose access…», Cancel (default) / Delete (ter) → видаляє з **усіх** датасетів.
- **Login as → імперсонація**: `[data-loginas]` → confirm → **чорний банер**
  `#impBanner` під топ-бар-бендом (та сама ширина/лівий край, **без зазору**,
  скруглення лише знизу; у бенда знімається нижній радіус через
  `body.impersonating`). «Return to my account» (біла кнопка) знімає. Персистить
  між сторінками (живе в chrome поза `#shellMain`).
- **Licenses-фільтр без «All»**: два чипи Subscription/Perpetual, тогляться
  **незалежно** (`licTypes{}`); обидва off = показати все.
- **Change plan = режим візарда** (`NL.openChange(lic)`, `st.mode='change'`):
  продукт залочений (крок 1 done, **не клікабельний**), старт із Plan; поточний
  план — бейдж **Current plan** + `.nl-current` (не вибирається; `currentCardName`
  мапить tbmqsub→'TBMQ PE subscription'); Customize/Review показують перехід
  «Prototype → Startup» (cap, mainline, rail «Plan — Prototype → Startup»),
  summary має рядок «Current · {old}», **Due today prorated** = (new−oldBase)×16/31
  з тим самим формулюванням. Кнопка «Confirm change» → лоадинг → апдейт об'єкта
  ліцензії (tier/name/price/extras/addons) → деталі цієї ліцензії. Входи: details
  `#changePlanBtn` (MODALS через activeLicense) і меню рядків `[data-changeplan]`.
- **Період-фільтр**: вибір «Custom range…» одразу позначається в списку
  (`.is-sel` + ✓ через ::after; активний пресет теж маркується), поля+Apply
  рендеряться нижче **в тій самій панелі**.
- **Add user** (`#addUserOverlay`, свій монохром): Email (required, regex) /
  First/Last/Description/Activation method (select: Display activation link /
  Send activation email). Add disabled без валідного email. Крок 2: link-режим —
  «Share this activation link…» + mono-блок + copy; email-режим — «Activation
  email sent to {email}». В обох — юзер додається в `DATA().users` і видимий
  у таблиці одразу.
- **Profile**: gap рядків форм зменшено (`.field2{gap:12px 14px}` +
  `.field2 .field{margin-bottom:0}`); email-хелпер → «Used to sign in.» (той самий
  `.help`-слот); Security-хелпер про паролі видалено; Company-хелпер → «Used as
  your billing / invoice address by default — change it in [Billing & payment]»
  з робочим `[data-goto="billing"]`-лінком (делегування на `#profileView`).
- **Legal-сторінки**: `privacy`/`terms`/`eula` — повні сторінки в спільному shell
  (`#privacyView/#termsView/#eulaView`, стилі `.legal` — body 16/1.6, h2-секції,
  max-width 800), відкриваються з Legal-групи профіль-меню (`data-goto`).
  Плейсхолдерний юридичний текст, помічений як несправжній.

## Відкриті питання / борг
- ~~Превʼю Invoices і Users на дашборді — статичні копії~~ **виправлено**: дашборд
  і повні сторінки Invoices/Users/Activity/Licenses тепер усі з `DATASETS[dashVariant]`
  (див. «Dashboard density variants»). `ACTIVITY`-масив прибрано — фід теж з `DATA()`.
- **`prototypeaddons` не має лінка у флоу**: у `PRODUCTS_V3` (product-first) такого
  рядка немає, тож сторінка досяжна лише через контекстний список у налаштуваннях —
  так вирішено свідомо («хай там і лежить»).
- ~~`AMF` не знає про плани~~ **виправлено**: `AMF.open(lic)` сідиться з ліцензії
  (`AMF_TIERS` + `TIER_SPECS`: base/incl/extras/addons, титул `#fsTitle`, devices-поле,
  «fixed by {plan} plan», рядок review `#fsPlanLine`). Вхід: details (activeLicense)
  і **меню рядка** (`[data-manageaddons]` → `licById`). Лишилось: статичні лейбли
  markup TB-словами (для TBMQ «Devices» ≠ Sessions); архівний `AM` досі Prototype.
- ~~TBMQ не має детальних сторінок~~ **виправлено**: TBMQ-рядки (sub і perp) відкривають
  повноцінну TBMQ-наповнену сторінку (`TIER_SPECS.tbmqsub`/`tbmqperp`). Немає dead rows.
- **Дані рядка → деталі зведені**: деталі тепер керуються об'єктом ліцензії (не `PAGES`) —
  entitlements із `TIER_SPECS[tier]`, хедер/статус/період/ціна з рядка (див. «Деталі
  ліцензії керуються рядком»). Ще окремо стоять: **Instances-таб** (статичні 2 інстанси,
  не per-license), **license key** (спільний мок), і perp-**Invoices**-таб (статичні суми).
- **Search-інпути невізуальні** (лупа + placeholder, без фільтрації).
- **Заголовки списків**: `#licensesView` тепер **«Licenses»**; `#portfolioView`
  (архів) ще «Products».
- Дрібні свідомі рішення (можуть «повернутися» питанням): Users сортовані Created
  desc; у профільному меню лишено «Sign out».
- **NL-флоу — inferred ціни**: perp-юніти (TB prod $1,999 / AI $500 / TBMQ prod $999)
  і дати нових ліцензій (renews Sep 19 2026 / updates Aug 19 2027) — плейсхолдери.
  «Renew subscription» на canceled-деталях — TODO-стаб.
- `.claude/launch.json` містить сесійний scratchpad-шлях (див. «Як запускати»).

## Файли
- `subscription-details-prototype.html` — **єдиний активний файл** прототипу.
- `serve_prototype.py` (у scratchpad сесії) — статичний сервер + `www/`-дзеркало.
- `NOTES.md` — цей файл.
