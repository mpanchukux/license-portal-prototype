# NOTES — стан роботи над прототипом

Ці нотатки для нової сесії, яка не бачила попередніх розмов. Тут — контекст,
ухвалені рішення та пастки середовища. Структуру коду детально не переказую —
вона видима з файлу; тут те, чого у файлі швидко не прочитаєш.

## Що це і де воно

Прототип ThingsBoard License Portal — **статичний багатосторінковий сайт** у корені
репозиторію. Без збірки: звичайні HTML/CSS/JS, відносні шляхи, віддається будь-яким
статичним сервером (локально — live server, далі GitHub Pages з підпапки).

**Сторінки** (кожна — окремий файл, навігація справжніми посиланнями):
`index.html` (Home/дашборд) · `licenses.html` · `license.html` (деталі, керується
`?id={licenseId}`) · `invoices.html` · `activity.html` · `users.html` ·
`account.html` · `security.html` · `billing.html` · `privacy.html` · `terms.html` ·
`license-agreement.html` · **`styleguide.html`** (дизайн-система).

**Спільне** — по одному джерелу на кожен предмет:
- `styles.css` — уся стилістика, включно з `styleguide.html`; шрифти в `fonts/*.woff2`
  (раніше були base64 всередині HTML — тепер 7 файлів, CSS важить 66 KB замість 391 KB);
- `data.js` — усі мокові дані (`DATASETS`, `TIER_SPECS`, `EC_PLANS`, `PRODUCT_CARDS`…);
- `shared.js` — **стор** (localStorage) + хром (топбар, банер імперсонації, футер,
  панель налаштувань) + спільні модалки + глобальні поведінки. Хром рендериться
  звідси в кожну сторінку — жодна сторінка не тримає його копії;
- `components.js` — рендерери, які потрібні більш ніж одній сторінці: таблиця
  ліцензій, рядки інвойсів/юзерів, фід активності, картки планів і продуктів,
  cancel-модалка, period-контрол, sticky-Save з guard'ом;
- `wizard.js` — Manage add-ons (`AMF`) і майстер нової ліцензії (`NL`) разом із їхньою
  розміткою; підключається на Home, Licenses і деталях;
- `page-*.js` — логіка конкретної сторінки (`page-home`, `page-licenses`, `page-license`,
  `page-invoices`, `page-activity`, `page-users`, `page-account`, `page-security`,
  `page-billing`), `styleguide.js` — наповнення дизайн-системи.

Порядок підключення на кожній сторінці: `data.js → shared.js → components.js →
[wizard.js] → page-*.js`, усі в кінці `<body>`. Скрипти ділять глобальну область —
namespace'ів немає навмисно, це прототип.

**Стару односторінкову версію `subscription-details-prototype.html` видалено** —
з неї все витягнуто, і два джерела правди в одній теці лише плутали б. Вона є
в git-історії (востаннє — у коміті чистки перед реструктуризацією).

**Vite/React-скелет `src/` теж видалено**: він ніколи не був частиною прототипу
(окремий React-застосунок), нічого на нього не посилалося, а його точкою входу був
кореневий `index.html`, який тепер Home прототипу. У git він лишається.
⚠️ У корені ще лежать **`package.json`, `vite.config.ts`, `tsconfig*.json`,
`node_modules/`, `package-lock.json`** і конфіг `dev` у `.claude/launch.json` —
це решта тієї ж збірки, зараз ні до чого не прив'язана. Прибирати чи ні — рішення
користувачки (нічого в прототипі їх не читає).

## Жорсткі константи прототипу (не порушувати)

- **Статика без збірки**: vanilla JS, без фреймворків і бандлерів, без зовнішніх
  запитів (шрифти локальні), **тільки відносні шляхи** — сайт має працювати з підпапки.
- **Стан — у localStorage** (див. «Стор»): усі ран-тайм мутації переживають перехід
  між сторінками й перезавантаження. Один ключ, одна кнопка «Reset demo data».
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
Збірка не потрібна взагалі: це статика. Конфіг **`prototype`** піднімає `python3` +
`serve_prototype.py` на порт 5500.

**Сервер не має доступу macOS (TCC) до теки Google Drive**, де лежить репозиторій
(`listdir` → `Operation not permitted`), хоча Bash-інструмент читає її нормально.
Тому сервер віддає **дзеркальну копію** з scratchpad-теки сесії:
- дзеркало лежить у `www/site/` — тобто сайт відкривається як
  **`http://localhost:5500/site/`**. Підпапка навмисна: так перевіряється те саме
  розташування, що й на GitHub Pages (`username.github.io/repo/`);
- `serve_prototype.py` і `www/` живуть у **scratchpad поточної сесії**; шлях
  у `.claude/launch.json` — **сесійний**, у новій сесії його доведеться переписати
  під свій scratchpad (скрипт при цьому перестворити — scratchpad чиститься);
- **після кожної правки треба перекопіювати файли в дзеркало**:
  `cp *.html *.js *.css "<scratchpad>/www/site/"` (і `cp -R fonts` за потреби),
  інакше браузер покаже стару версію;
- у `launch.json` **не можна** ставити `url` з шляхом (harness приймає лише origin) —
  на підпапку переходимо через `navigate`.

**Перевірка всіх сторінок одним заходом**: зручний трюк — з відкритої сторінки
завантажити кожну в прихований `<iframe>` і зібрати `contentWindow.onerror`; так
видно синтаксичні й рантайм-помилки на всіх 13 сторінках за один виклик.

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
- Після кожної правки — screenshot + `read_console_messages(onlyErrors:true)`. ⚠️ Буфер
  консолі панелі **не чиститься перезавантаженням** — стара помилка висить у списку;
  зіставляй номери рядків із поточним файлом, перш ніж їй вірити.
- ⚠️ **Порядок визначень**: рендерери таблиць викликаються під час першого рендера, тому
  хелпери, якими вони користуються, мусять бути **function-декларацією** (гоїстяться), а не
  `var f = function…`. `esc` через це перероблено на декларацію.

**Git**: комітимо прямо в `main`, файл прототипу **окремо**, з trailer
`Co-Authored-By: Claude …`. `.claude/launch.json` (сесійний scratchpad-шлях)
і `.claude/settings.local.json` **не комітимо**. git-identity **налаштована**
(user `mpanchukux`), `git commit` працює без env-обхідних. ⚠️ Репо на Google Drive
+ робота з кількох машин → git-стан інколи клобиться посеред сесії (HEAD відкочується
на чужий коміт, застряглий `main.lock`, «no commits yet»); мої проміжні коміти
ставали dangling — контент лишався в робочому файлі, я перекомічував поверх поточного
HEAD. Діагностика/відновлення — див. пам'ять `drive-git-hazard`.

## Архітектура: сторінка = файл, спільне = один модуль

Головний принцип не змінився, змінилася його реалізація: **одна поверхня — одне
місце**, тільки тепер це окремий HTML-файл, а не вузол, який показує/ховає JS.
Перехід між сторінками — справжня навігація браузера, без роутера.

- **Хром** (`shared.js` → `chromeHTML()`, `footerHTML()`, `settingsHTML()`,
  `modalsHTML()`) вставляється в кожну сторінку на завантаженні: топбар із
  nav-посиланнями, банер імперсонації, футер, ⚙-панель, спільні модалки.
  Активний nav-пункт бере з `document.body[data-nav]` (`syncTopNav`).
- **Деталі ліцензії** — `license.html?id={licenseId}` (+ `&from=home`, щоб знати,
  яку секцію підсвітити й куди веде back). Фолбек `?tier=maker|…|perp` дає
  синтезовану план-сторінку для пікера — рядка з такими даними в датасетах немає.
- **Порядок скриптів** фіксований (data → shared → components → wizard → page).
  Кожен файл оголошує глобальні функції; page-скрипт лише збирає сторінку.

### Стор — мок-бекенд на localStorage
`shared.js` → `Store`. Один ключ **`tb-license-portal-demo-v1`**. На першому
завантаженні туди пишеться **глибока копія `DATASETS`** із data.js, і далі вся
робота йде з цією копією — тобто «бекенд» має власний стан, а data.js лишається
незмінним сідом.

Що там лежить: `dash` (обраний стан дашборда), `datasets` (робоча копія всіх
трьох акаунтів), `pendingEmail`, `impersonating`, `dismissed` (одноразові банери),
`seq` (лічильник id/ключів нових ліцензій).

Мутації **тільки** через хелпери, кожен із них зберігає: `storeCancelLicense`,
`storeAddLicense`, `storeAddUser`, `storeDeleteUser`, `storeNextSeq`, `dismiss`,
`Store.set`. Читання — `DATA()` (повертає датасет обраного стану) і `licById(id)`
(шукає по **всіх** датасетах, бо посилання на деталі може пережити зміну стану).

**«Reset demo data»** в ⚙-панелі чистить ключ і перезавантажує сторінку.

### Дизайн-система — `styleguide.html`
Живий інвентар: та сама `styles.css`, ті самі класи, а таблиця, картки планів,
картки продуктів і фід рендеряться **тими самими білдерами**, що й продукт
(`headHtml`/`rowHtml`, `planCard`, `productCardHTML`, `feedItem`). Токени
(кольори, тайп-шкала, спейсинг) читаються з живого CSS через `getComputedStyle`,
тому розійтися з продуктом не можуть. Посилання — в ⚙-панелі, не в nav порталу.
Правило: якщо елемент стилізований ad hoc, його спершу підіймають у клас
(так з'явилися `.tablescroll`, `.paymodal.narrow`, `.paymodal.tight`), і вже цей
клас використовують обидві сторони.

### Навігація — top-bar (єдиний флоу)
У топбарі nav-пункти **Home · Licenses · Invoices · Activity · Users** — це `<a>`
з відносними href, відцентровані по самому бару (`position:absolute; left:50%`).
Активний визначає `document.body[data-nav]` (`syncTopNav`). Деталі належать тій
секції, звідки їх відкрили: `?from=home` лишає підсвіченим Home, інакше Licenses —
той самий орієнтир, що й у back-кнопки.

Альтернативний флоу full-screen overlays знято ще в пасі чистки; у багатосторінковій
структурі його місце зайняла звичайна навігація.

### Back-кнопка: лише там, де вона робить не те саме
- **Списки під nav-табами** (Licenses, Invoices, Activity, Users) back **не мають** —
  таб уже дає і орієнтацію, і вихід.
- **Деталі** тримають back у лівій канавці: він вертає у *список* зі станом, а таб
  Licenses — у корінь секції.
- **Security** — внутрішня сторінка Account, тому має власну канавку back
  (`#secBackBtn` → `profile`).
- **Account / Billing & payment** back **не мають**: коли Profile розклали на картки
  Personal / Security / Company, канавку прибрали. Механізм `prevPage`, який їх
  обслуговував, теж знято — якщо back туди повернеться, його треба писати наново.

### Спільний контейнер контенту
Усі сторінки в одному контейнері: `--pageW:1120px`, `--pageX:24px`, `--pageY:28px`,
правило на `.pagewrap,.dwrap,.licview,.sheet` (центровано). Тому при переходах
контент не стрибає горизонтально. Форми (Profile/Billing) мають власний ліміт
~760px, але центровані в тому ж контейнері.

### Dashboard density variants (A / B) — `DATASETS`
`dash` (populated) тепер має **два датасети густини**, обидва kind `dash`, DOM `#dashView`:
- **A — small account** (`PAGES.dashboard`, `variant:'A'`): 2 ліцензії (TB + TBMQ sub),
  2 users, 3 invoices. Licenses-блок показує **всі** рядки (нема чого тримати).
- **B — large account** (`PAGES.dashB`, `variant:'B'`): **14 ліцензій** (`id` B1–B14,
  кожна з `tier`), 8 users, 7 invoices, **15 подій активності** (стільки, щоб було що
  доливати лези-лоудом на Home). Мікс TB (maker/prototype/pilot/startup/business),
  TBMQ subs, TB/TBMQ perpetuals; статуси в даних: active / **payment_failed** (B3) /
  **canceled** (B5) / **updates_expiring** (B11) — у таблиці вони згортаються до
  Active/Canceled (див. «Таблиці»). **B13/B14 несуть свідомо довгі мітки**
  («Production — Central Europe manufacturing cluster, building 4» і «Long-term
  evaluation environment for the Munich pilot») — тест на перенос у Product-колонці.
  Licenses-блок — **top-5 attention-first** (`payment_failed` 0 → `updates_expiring` 1
  → active 2 → canceled 3, далі найближчий `event`); «Show all» — без тотала (див. нижче).
- `dashempty` — новий користувач (без змін).
- **G — grant approved** (`PAGES.dashgrant`, `variant:'G'`): акаунт із **однією**
  ліцензією — Community Grant (`id` G1, `tier:'grant'`, `type:'Grant'`, `grant:true`,
  `price:'Free'`, `status:'awaiting_checkin'`, без `event`). 1 user, **0 інвойсів**
  (`noInvoicesNote` → рядок-emptybox замість таблиці), 1 подія активності
  («Community Grant issued»). Рядок у Licenses — звичайний: `rowHtml` має grant-гілку
  (мітка `—` · Free · muted «No expiry», другий meta-рядок — ліміти `p.limits`),
  статус — **тихий** `.pill.soft` «Waiting for first check-in» (`statusPill`),
  а `actionsCell` для гранту віддає лише copy-key **без кебаба** (грант нічого
  не змінює й не скасовує — inferred).

**Єдине джерело на варіант** (`DATASETS[dashVariant]`, `DATA()`): дашборд-блоки
і **повні сторінки** Licenses/Invoices/Users/Activity рендеряться з того самого набору
(`renderDatasetViews`). **Субтайтла на Home немає взагалі** — H1 стоїть сам
(`#dashState`/`renderDashState` видалено). «Show all»-лінки — **без стрілки → і без
кількості** (`setShowAll` більше немає; деталі — у блоці про Home нижче).
`currentProducts()` для variant 3 читає `DATA().licenses`.
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

### Мітка на деталях — опис, не тег
`renderLabelSlot` віддає **muted текст-рядок** (`.labeltext`, `--t-small` + `--mid`) під
заголовком, а не `.chip.label`. Інтерактивний шлях (`commit` після «+ Add label») будує
той самий `.labeltext` + маленький `.labelx` ✕ поруч, тож обидва шляхи дають однаковий
вигляд. Афорданс «+ Add label» лишається для ліцензій без мітки. У таблиці мітка живе
у Product-колонці (див. «Таблиці») — це два різні місця з однією суттю.

### Cancel subscription (`openCancelModal`)
Кебаб деталей (`[data-cancel-active]` → `activeLicense`) і меню рядка (`[data-cancel]`
→ `cancelFromRow` → `licById`) відкривають confirm-модалку (назва+мітка, наслідок,
**Keep subscription** secondary+focus / **Cancel subscription** destructive). Confirm:
`storeCancelLicense(id)` (запис у стор) → колбек `after`, яким сторінка перемальовує
себе. Статус пропагується скрізь (muted pill `Canceled · until {date}`, рядок `.off`;
хедер деталей — muted чіп + Renew-плейсхолдер) і переживає перезавантаження.
⚠️ У таблиці Licenses скасовану ліцензію видно **лише** при увімкненому перемикачі
«Display canceled licenses» (див. нижче); на Home-блоці вона показується завжди.

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

**Nav-підсвітка теж іде за походженням**: `syncTopNav` для `sub`/`perp` дивиться на
`licenseOrigin` — ліцензія, відкрита з Home, тримає підсвіченим **Home**; відкрита зі
списку — **Licenses**. Тобто back-кнопка й активний nav-пункт завжди кажуть одне й те саме.

**Origin-aware back на деталях**: `openLicense(lic, origin)` запам'ятовує, звідки відкрито
ліцензію (`licenseOrigin`): рядок на Home → back веде на `homeKey`, рядок зі сторінки
Licenses → на `products3` (стан списку живе в JS-змінних, тому фільтри/варіант вертаються
самі). `#backBtn` більше **не** захардкоджений на `products3`; `syncBackTarget()` (кличеться
з `renderLicenseDetails`) переписує його `aria-label`/`title` на «Back to Home» / «Back to
Licenses».

**`homeKey`**: nav Home / лого / overlay-close / Escape ведуть на `homeKey` (останній
вибраний dash-варіант: dashboard/dashB/dashempty), а не жорстко на A — тому вибраний
варіант тримається при поверненні на Home.

Рендер dashboard-блоків: `renderDashLicenses/Invoices` + `renderDashFeed` (top-level,
dataset-driven); рядки строяться **тими самими** `headHtml`/`rowHtml` (variant 3), що
сторінка Licenses. Recent invoices — не статична копія, а з `DATA()` (`#dashInvBody`).
Стуб-кнопки в перерендерених таблицях працюють через делегування на persistent `<tbody>`
(не per-element). Рядки-ліцензії дашборда клікаються через `openRow` → `openLicense`.

**Блоки Home** (у цьому порядку): Licenses → Recent invoices → **Recent activity**.
**«Show all» стоїть поруч із заголовком блоку** (порядок у `.dblock-head`: `h2` → лінк →
`.sp`), а не в правому куті, і **без кількості** — `setShowAll` прибрана зовсім, у розмітці
просто «Show all» (тотал видно на сторінці, яку лінк відкриває).
**Users-блоку на Home немає** — юзери живуть лише на власній сторінці (nav → Users);
`renderDashUsers` і статична таблиця прибрані.

**Вітання за часом дня** (`greetingFor(h)` + `renderGreeting`, `#dashGreeting`): 05:00–11:59
«Good morning» · 12:00–17:59 «Good afternoon» · 18:00–04:59 «Good evening», ім'я через кому.
Це **єдине місце, де прототип читає реальний час** (`new Date().getHours()`) — дані датасетів
лишаються прив'язані до Aug 19 2026. H1 на new-user дашборді («Welcome, Mariia») не чіпали.

**Лези-лоуд фіду на Home** (`renderDashFeed` / `dashFeedLoadMore`, `DASH_FEED_BATCH = 5`):
спершу 5 подій, далі доливається по 5. Тригерів **два**: `IntersectionObserver` на
`#dashFeedSentinel` і — бо в прихованому табі/вбудованій панелі колбеки обсервера не
запускаються (той самий клас пасток, що rAF) — **throttled scroll-хендлер** на `#shellMain`,
який сам міряє `#dashFeedMore`. Плюс тиха кнопка «Load more» (фолбек + клавіатурний шлях),
яка ховається, коли долито все. Лічильник `dashFeedShown` **скидається при зміні датасету**
(в `applyDetailsPage`, гілка `dash`), але не при кожному `renderDatasetViews`.

### Список поверхонь (сторінка → що на ній)
*(Історична назва «kinds» лишилась у тексті нижче; тепер кожна поверхня — окремий файл.)*
- `index.html` — **Dashboard (Home)**, п'ять станів (варіанти A/B — див. вище).
- **Community Grant states** (обидва в пікері поруч з рештою dash-варіантів):
  - `dashgrantpending` (`kind:'dashempty'`, `grant:'pending'`) — **той самий**
    new-user дашборд плюс статус-картка `#grantPending` (`.gstatus`: icon + h2
    «Your Community Grant is almost ready» + тіло + тихий лінк «Learn more»,
    стаб-модалка) **над** перемикачами й план-картками. Купівля **не блокується**:
    Product/Billing, план-картки й «Get started» → NL-візард працюють як завжди.
  - `dashgrant` (`kind:'dash'`, `variant:'G'`) — populated дашборд датасету G
    плюс **одноразовий** банер `#grantBanner` першим елементом `.dwrap`:
    «Your Community Grant is ready…» + «View license» (`openLicense(licById('G1'))`)
    + ✕ (`grantBannerDismissed` — на сесію, без persist). Вигляд — **як банер
    імперсонації** (`.imp-banner`): заливка ink, білий текст, біла пілюля-дія,
    напівпрозорий ✕. Відмінність лише в посадці: імперсонаційний живе в chrome
    і приклеєний до топ-бар-бенда (скруглення тільки знизу), а grant-банер стоїть
    у контентній колонці — тому всі чотири кути й `margin-bottom:26px` до H1.
  Обидва елементи чіпляє **`syncGrantChrome(p)`** з `applyDetailsPage` — тому жоден
  інший dash-стан їх не показує. `homeKey` тепер обчислюється через `isBaseKind`
  (а не списком трьох ключів), тож nav Home вертає у вибраний grant-стан.
- `dashempty` — **новий користувач**: структура планів із перемикачами
  **Product** (ThingsBoard/TBMQ) і **Billing** (Subscription/Perpetual), дані з
  `EC_PLANS`. Перемикачі **вертикально** (`.planpick` column, по `.planpick-row`): Product
  зверху, Billing під ним — залежність читається top-down (обидва left-aligned, лейбли
  вирівняні `min-width`). TB×Subscription — 5 карток, решта — одна центрована.
  Deployment-перемикача немає (портал self-managed).
- **Деталі гранту** — той самий `#appView` на **perp-гілці**: рішення «як перпетуал»
  зведено в один хелпер **`isPerpLike(lic)`** (`type==='Perpetual' || lic.grant`),
  який тепер використовують `renderLicenseDetails`, `renderLicenseActions` і
  `openLicense` (раніше `renderLicenseActions` мав власну перевірку типу й тому
  показував грантові Apply coupon). Відмінності гранту складає
  **`renderGrantChrome(lic)`**: кікер «Grant license», `.periodhead` → «Expiry»
  + `#periodPerp` → muted «No expiry», ховає Apply coupon і **Add capacity**,
  Invoices-таб → `#grantInvEmpty` (грант безплатний, тому інвойсів немає — inferred),
  Instances-таб → тулбар і таблиці приховані, лишається `#grantInstEmpty`
  («An instance appears here after it connects using this license key.»).
  Ентайтлменти — `TIER_SPECS.grant` (Devices 6,050 / Production servers 2).
  `licenseActivity` для гранту віддає одну подію «Community Grant issued».
  Хедер-чіпи: `statusChipHTML` для гранту — **два тихі чіпи** «Free» +
  «Waiting for first check-in» (`#statusSlot` тепер inline-flex із gap).
  ⚠️ Дві латентні CSS-пастки, знайдені тут: `.btn` і `.insttoolbar` задають
  `display`, тому плейн-`[hidden]` їх не ховав — додано `.headactions .btn[hidden]`
  і `.insttoolbar[hidden]` (у `[data-page]`-вузлів це працювало через
  `[data-page][hidden]{display:none}`).
- `sub` / `perp` — деталі (спільний `#appView`). Головний вхід — **`licenseView`**
  (row-driven, з `activeLicense`); іменовані plan-сторінки пікера (`maker`…`business`,
  `prototypeaddons`, `perp`) — той самий рендер через `licFromNamed`.
- `licenses.html` — **сторінка Licenses** (product-first neutral), єдиний макет списку:
  таблиця рендериться з поточного датасету, без варіантів. Back із деталей веде на
  `licenseOrigin` (звідки відкрили), із фолбеком `products3`.
- `invoices.html` / `activity.html` / `users.html` / `account.html` / `billing.html` — повні сторінки.
- `security.html` — внутрішня сторінка Account (Change password), із власною back-канавкою.
- `privacy.html` / `terms.html` / `license-agreement.html` — легальні сторінки з футера.
- `styleguide.html` — дизайн-система (посилання лише з ⚙-панелі).

### Активність — фід, не таблиця
**Що акцентуємо** (пас по всіх 25 семплах + синтезованих `licenseActivity`): **лише об'єкт
дії та змінені значення** — назви ліцензій/планів, значення міток, імена юзерів, номери
інвойсів, from → to, дати-значення. **Звичайною вагою**: дієслівні фрази («Payment failed»,
«was changed», «was invited»), родові іменники на початку («Subscription», «Plan», «Add-on»,
«Label», «User», «Invoice»), **email актора в кінці**, «System» і **номери карт**
(«Visa ••4242»). Приклад: `Plan was changed from <b>Prototype</b> to <b>Pilot</b> on
<b>Factory A</b> by i.petrenko@thingsboard.io.` Таблиці **не** отримали жодного жирного —
перевірено (0 `<b>/<strong>` у всіх tbody + `#planRows`).
Алерт на деталях (`#subAlert`, «**Payment failed.**») лишився жирним — це інший компонент
(attention-банер), не фід.
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
**Licenses (variant 3) — колонки**: Product · License · Type · Status · **State** ·
Created · actions. (Колонку перейменовано з «Renewal / Updates» — той самий `renewCell`.)
- **Мітка ліцензії живе в Product-колонці** другим рядком під назвою продукту
  (`.lic-prodcell` / `.lic-prodlabel`, `min-width:230px`, перенос дозволений) — саме мітка
  розрізняє рядки, тому вона отримала місце, де може розгорнутись на два рядки. Немітковані
  рядки тримають muted `—` (справжній «+ Add label» лишається на деталях). Старий
  label-first-режим для варіанта B прибраний — мітка тепер завжди в Product.
- **Status має лише два значення** — `Active` / `Canceled` (`statusPill`). `payment_failed`
  і `updates_expiring` **лишаються в даних** і далі керують алертом на деталях та
  attention-first сортуванням дашборда — таблиця їх просто не викрикує. Дата тепер у своїй
  колонці, тому з canceled-пілюлі знято «· until {date}» (більше не дублюється).
  Виняток — грант: тихий `Waiting for first check-in` (його стан, замовлений окремо).
- **`renewCell(p)`** формулює дату за суттю ліцензії: `Renews {date}` (підписка) /
  `Updates until {date}` (перпетуал) / `Active until {date}` (canceled) / muted `No expiry`
  (грант) / muted `—` (без `event`). `.lic-num` отримав `white-space:nowrap`, щоб дати
  не ламались на два рядки після того, як Product забрав ширину.

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
Фільтр Licenses — **без префікса «Type:»** (лише чипи) і **взаємовиключний**: замість
`licTypes{}` тепер одна змінна **`licType`** (`null` = нічого не вибрано = показати все).
Клік по чипу вибирає тип, клік по іншому — перемикає, повторний клік по активному —
скидає у «все». Хендлер перемальовує `is-on`/`aria-pressed` на **обох** чипах з `licType`.

**Профіль у топ-барі — без аватара**: коло «MP» прибрано, лишились ім'я + ▾
(правило `.dprofbtn .avatar` видалено; базовий `.avatar` лишився).

**Топ-бар — contained band**: білий фон **не** тягнеться edge-to-edge. Зовнішній
`.dtopbar` — прозорий (bg сторінки, `padding:12px 24px 0`); **сам бенд** —
`.dtopbar-inner` (`max-width:var(--pageW)`, центрований, `background:var(--card)`,
`border:--line2`, `border-radius:10`) — «плаваючий» бар, сірий фон видно з боків.
Контент бару (лого/nav/профіль) через внутрішній `padding:0 var(--pageX)` вирівняний
точно з текстом сторінок; біла кромка бенда — на ширині pageW-боксу (трохи ширша за
текст). `.tnav` абсолютно центрується в inner.

### Перемикач «Display canceled licenses» (Licenses)
**OFF за замовчуванням** — скасовані ліцензії в таблицю не потрапляють; ON — вони
з'являються зі своїм статусом `Canceled` (рядок muted, `.off`, у колонці State
«Active until {date}»). Стан — **збережене налаштування** (`Store.showCanceled`,
сідиться як `false`), тому переживає перехід між сторінками й refresh; чекбокс на
завантаженні відображає збережене значення. Лічильник пейджера рахує **видимі**
рядки. Раніше перемикач був підписаний «Display canceled products» і нічого не робив.

### Стандартний тулбар (усі list-сторінки однаково)
Зліва направо: **`.searchbox`** (persistent input ~280px, лупа всередині, page-
placeholder) → фільтри (якщо є) → `.spacer` → refresh (outlined icon-btn) →
**primary** (напр. «+ New license») в самому правому куті. Search-інпути поки
**невізуальні** (без логіки). Патерн застосований на Licenses, Invoices,
Activity, Users та Instances-табі.

### Пікер сторінок (тимчасовий, контекстний)
⚙ внизу праворуч → «Prototype settings», однаковий на всіх сторінках (його вставляє
`shared.js`). Вміст:
- **Dashboard (Home)** — п'ять станів (`small account (A)` / `large account (B)` /
  `new user (empty)` / `grant pending` / `grant approved`). Вибір **зберігається**
  (`Store.dash`); якщо ти не на Home — перекидає на Home з обраним станом.
- **Plan details** — посилання на `license.html?tier=…` (Maker…Business,
  Prototype + add-ons, Perpetual): синтезовані план-сторінки, яких немає в датасетах.
- **Account** — дев-кнопка «Confirm email change» (активна, лише коли є pending;
  сам pending лежить у сторі, тому підтвердити можна з будь-якої сторінки).
- **Reference** — «Design system → styleguide» і **«Reset demo data»**.

### Демо-хуки
- `window.showSubAlert('…')` / `clearSubAlert()` — банер на деталях.
- `window.setFeature('edge'|'trendz'|'whitelabel', on)` — чипи фіч на поточній
  details-сторінці.

## Типографіка (type-system)

**Шрифти вбудовані base64-woff2** (константа «без зовнішніх запитів»): Ubuntu
**400/500/700** + **Ubuntu Mono** (license keys / IDs). Light 300 свідомо не
вантажимо. Через це файл ~550KB (див. пастку Read-token-ліміту вище).

**Акцент у реченні** — `--t-em-fw:500` + клас **`.em`** (і `<b>` у текстах фіду мапиться
на той самий токен правилом `.em,.fi-txt b`). Це **єдина** вага акценту для активності:
body 400 → акцент 500, **ніколи 700** — фрагмент має підніматись із речення, а не читатись
як заголовок у ньому. Стара локальна `.fi-txt b{font-weight:600}` прибрана.

**Шкала** — CSS custom properties у `:root` (одне місце) + утиліти `.t-*`:
`--t-display 64` · `--t-h1 36/700` · `--t-h2 20/500` · `--t-body 16/400` ·
`--t-small 14/400` · `--t-label 14/500 uppercase +0.10em`. Правила: **14px — підлога**,
вага росте з розміром, **bold 700 лише для display/h1**; `--t-small` і `--t-label` —
один розмір, різняться регістром+трекінгом. Числа — `.tnum`; mono — `.t-mono` (ls:0).

**Застосовано на всіх сторінках.** Ієрархію зведено на 6 рівнів шкали (рев'ю в
браузері по кожній поверхні: dashboard, деталі sub/perp, Licenses, Users,
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
- **Сторінка тепер «Account»** (не «Profile settings»): H1, пункт профіль-меню і
  `AREA_TITLES.profile` — усі три. Картки: **Personal details** (First/Last/Email/Language)
  і **Company details**.
- **Усі дії Account — в одному sticky-хедері** (`.pagehead`), праворуч, у порядку
  наростання до primary: **Log out** (`.btn.ter` — найтихіша, підкреслений текст) ·
  **Change password** (`.btn.sec`, `data-goto="security"`) · **Save** (primary).
  Блок `.pdactions` у Personal details прибрано. **Тексту «All changes saved» на Account
  немає** — disabled-стан Save сам каже, що зберігати нічого (`wirePageSave(…, null)`;
  третій аргумент опційний). ⚠️ На **Billing** і **Security** нотатка ще є — свідомо
  не чіпала, бо просили тільки Account.
- **Security — окрема внутрішня сторінка** (`#securityView`, `PAGES.security`,
  `kind:'security'`): картку Security з Account прибрано, замість неї в Personal details
  два `.btn.sec` — **Change password** (`data-goto="security"`) і **Log out** (стаб-модалка).
  Сторінка має **власну back-канавку** (`.secgrid` = ті самі `--backW`/`--backGap`, що
  `.headgrid` деталей; `#secBackBtn` → `goToPage('profile')` через unsaved-guard) і **власний
  Save** (`wirePageSave('#securityView', …)`). Три поля пароля стоять **вертикально**
  (`.pwstack`), кожен інпут — 393px = ширина однієї клітинки `.field2`; кап стоїть на
  **інпутах** (`.pwstack .field input{max-width:393px}`), бо `.setcard > *:not(.setcard-h)`
  зі своїм `max-width:800px` специфічніший за `.pwstack`. `overlayLevel` для `security` —
  `deep` (back ≠ close).
- **Зміна email — verify-then-switch** (контролер `EMAIL`): Save з новою адресою **не**
  міняє акаунтний email. Поле відкатується на поточну адресу, під ним — pending-чіп
  «Verification sent to {new} — the change applies once confirmed.» + текстові дії
  **Resend** (тимчасово підмінює текст на «re-sent…») і **Cancel change**. Опис поля
  попереджає, що зміна потребує підтвердження з нової адреси, а поточна працює доти.
  Підтвердження в прототипі — **клік по чіпу** або дев-кнопка **Confirm email change**
  у Settings-табі пікера (enabled лише коли є pending). Невалідний email на Save просто
  відкатується без pending.
- **Billing → Payment method**: кнопка «Update» замінена на **icon-btn олівець**
  (`.iconbtn.ib`, `#payUpdateBtn`) — відкриває ту саму Update-payment-method модалку.
- **Activity шрифти**: увесь фід (meta / речення / raw-JSON) уже ≥14px (з type-pass);
  перевірено — нічого нижче 14 немає, JSON лишається 14px mono.

## Content audit (копірайт/дані-пас) — статус

**§1 (термінологія) зроблено**, §2–§7 у черзі.

§1: Activity vs таб «Audit log»; **License key** скрізь (не «secret» — воно лише в raw
JSON); **Offline/Viaanix прибрано**; no «Pay-as-you-go» (→ Subscription); заголовок
«Products»→**«Licenses»**; **Auto-pay**; дві Manage-дії розведено (**«Manage add-ons»** +
прямий лінк **«Billing & payment →»**); меню **«Profile settings»** (згодом → **«Account»**);
одне «White labeling»; **Cardholder name**; **Plan & add-ons**; AI-формулювання;
sentence-case заголовки.

Ще НЕ зроблено:
- §2 **єдиний датасет**: today Aug 19 2026; інвойси → `NAWE49WG-000X` (вбити `INV-2026-…`);
  одна renewal-дата на підписку, узгоджена з проратацією (16/31 → цикл до **Sep 4 2026**?
  — **відкрите питання, чекає підтвердження**); одна purchase+updates-end для перпетуалу.
- §3 **Users без статусу**: колонку Activation-status + чипи (Pending/Activated)
  **прибрано** ✅; таб на деталях **вирівняно до фіду** ✅ (тепер «Activity»,
  Status/Success-таблиці немає). Ще: перейменувати Created → «Added {date}»? —
  **не зроблено**.
- §4 **прайсинг**: рядок **Assets** в entitlements ✅ (`TIER_SPECS`); `+$0.10` ✅
  (Business-картка). Ще: AI-юніт «{N}M AI credits» + `TODO` (cadence перпетуалу;
  чи включають self-managed subs AI взагалі) — **не зроблено**.
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
**Support / WL** (verified ТЗ): support-tier per plan — Maker/Prototype Community
support · Pilot Help desk · Startup/Business Priority help desk; **White labeling
лише з Pilot** (Maker/Prototype без WL — рядка просто немає, без перекреслень).
Maker включає **Trendz & Edge для тестування** (muted foot-рядок на картці).
**TBMQ** (теж із ТЗ): sub $15/mo — 100 sessions · 100 msg/sec · 1 prod;
perp $2,999 — 10,000 sessions · 1,000 msg/sec · 1 prod · WL.

**Перпетуал**: «ThingsBoard PE Perpetual License», **$4,999 one-time**,
1 рік апдейтів (issued Aug 13 2026 · until Aug 13 2027), 5,000 dev · 1 prod ·
5M AI · White labeling. Жодних recurring-понять. (Прайс-рядок у хедері прибрано
на прохання — суму видно в Invoices.)

**Продукти**: сімʼї **ThingsBoard / TBMQ** (Viaanix та тип
**Offline прибрано** — content audit §1); пакети — Maker/Prototype/Pilot/Startup/Business
+ Professional edition (perpetual) для ThingsBoard, TBMQ PE + Professional edition для TBMQ.
Типи білінгу: **Subscription / Perpetual**. (Instance-статус Online/**Offline** лишається —
це інша вісь.)

**Дати** — наразі мішанина, уніфікація в content audit §5 (**ще не зроблено**):
цільовий формат `Aug 13, 2026` (з комою), date-time `Aug 13, 2026, 10:33`, ISO —
**лише** в raw audit-payload. Поточно в коді ще: списки `Mon DD YYYY` без коми, фід
`19 Aug 2026, 13:13`, ISO в деяких таблицях. Єдиний датасет (today = **Aug 19, 2026**)
і одна renewal-дата — теж §2, ще не зведені.

## Manage add-ons (`#fsAddons`, контролер `AMF`)
Одна поверхня — **велика центрована модалка**: `.fs-screen` = бекдроп (dim +
`backdrop-filter:blur`), `.fs-box` = панель (~90vw до 1200px × 90vh, rounded, shadow),
`.fs-body` скролиться всередині. Клік по бекдропу — no-op; закриття лише ✕ / Cancel / Esc.
Відкривається засіяною з ліцензії (`AMF.open(lic)` через `openManageAddons`) — і з рядка
списку, і з деталей, тому дані відповідають плану, а не зашитому Prototype.
Архівна компактна двокрокова модалка (`#addonsOverlay`, контролер `AM`) **видалена**;
класи `.am-*`, що лишились, обслуговують цю модалку і візард.
Проратація фіксована **16 з 31 дня** (картка Next charge каже «in 16 days»).

## New license flow (`#nlModal`, контролер `NL`)
Створення ліцензії тепер **робочий степовий флоу** на chrome великої Manage-модалки
(`.fs-screen`/`.fs-box`, бекдроп, sticky footer). Вибір — **видимі картки, ніколи
селекти**.
- **Входи**: «+ New license ▾» (Home, Licenses) → subscription /
  perpetual, `NL.open({kind})`; «Get started» на плані нового користувача →
  `NL.open({kind, product, plan, startStep})` — `open()` сам приземляє на Customize
  відповідного шляху (sub → крок 3, perp → крок 2), попередні кроки ✓.
- **Степер — один: Progress line.** Тонкий (3px) трек **на всю ширину модалки**
  одразу під hairline хедера (`.nl-stepbar`, паддінг `0 0 10px`), fill = step/totalSteps;
  нижче один рядок з лівим паддінгом «Step 2 of 4 · **Plan**» (muted + bold назва,
  `.nl-plabel`). Без окремих пунктів, без часткових треків. Рендерить `renderSteps()`
  у `#nlSteps`. Варіанти A (summary rail) і C (numbered steps) **видалено** разом із
  перемикачем «Wizard stepper»; клікнути пройдений крок, щоб повернутись, більше не
  можна — назад лише кнопкою Back.
  Кроки: sub — **4** (Product → Plan → Customize → Review & pay); perp — **3**
  (**Product & Plan** злиті → Customize → Review & pay, бо на продукт рівно один
  пакет). Механіка: `totalSteps()` (3/4) + `panelFor(n)` мапить wizard-крок на
  панель (`perp: 2→#nlStep3, 3→#nlStep4`; `#nlStep2` на perp-шляху не існує).
  На perp-кроці 1 картки несуть **повний пакет** (назва пакета, value-line, ціна
  «$4,999 · one-time», термін апдейтів, ліміти з `EC_PLANS` без «All …»-рядка) +
  PE-блок нижче (`#nlProdExtra`); клік ставить product **і** plan → одразу Customize.
  На perp-шляху степер каже «Step N of 3», fill N/3. Футер `.nl-foot`: **на кроці 1 схований
  повністю** (клік по картці = перехід);
  далі Back / Continue (disabled без вибору; на останньому кроці —
  «Subscribe» / «Buy license» / «Confirm change» via `confirmLabel()`).
  ⚠️ `.btn` ставить display → правила `.nl-foot[hidden]`/`.nl-foot .btn[hidden]`.
- **Крок 1 (sub)**: 2 **великі** product-картки (`.nl-prodcard`, ~половина модалки,
  grid max-width 960): назва + value-line («Build your IoT solution. On your terms.» /
  «Scale your messaging. On demand.») + sub-line + для TB група **Unlimited**
  (Customers · Users · Dashboards · Messages · API calls · Integrations).
  **Клік одразу веде на крок 2** — Continue на цьому кроці немає. На perp-шляху
  крок 1 — **злиті Product & Plan картки** (див. блок про кроки вище).
- **Крок 2 (sub)**: план-картки з **`EC_PLANS`** — name/price/**повні feats**
  (capacity + support-tier + WL, див. нижче). Під ґрідом — **одна самодостатня картка**
  «What's included in Professional Edition» (`peBlockHTML(intro)`, `.nl-pe`): титул =
  хедер картки (h2), під ним muted-інтро **«All plans include unlimited customers…»**
  (`PLANS_INCLUDE_NOTE`; на perp-шляху інтро немає), далі список `PE_FEATURES`
  (**7 фіч** — White-labeling прибрано, бо він НЕ edition-wide: лише Pilot+;
  HTML-`TODO: confirm with product…` біля `#nlPlanExtra`). Окремого плавучого
  рядка між ґрідом і карткою **немає** (`#nlPlanNote` видалено) — ґрід → один
  20px-гап → картка, вирівняна по лівому/правому краю ґріда на всю його ширину.
  `peBlockHTML` живе на топ-левелі (не в NL-IIFE) — той самий рендер на **трьох
  поверхнях**: крок 2 візарда, perp-крок 1 (`#nlProdExtra`, центрована до 960),
  екран нового користувача (`#ecPlanExtra`). **Лише продукт ThingsBoard** (фічі TB PE,
  для TBMQ не показуємо — inferred); на single-сетах (perp / TBMQ) картки немає,
  `#ecNote` лишає тільки `EC_SINGLE_NOTE`.
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
- **Licenses-фільтр без «All»**: два чипи Subscription/Perpetual. ⚠️ Спочатку тоглились
  незалежно (`licTypes{}`) — тепер **взаємовиключні** (`licType`), див. «Таблиці».
- **Change plan = режим візарда** (`NL.openChange(lic)`, `st.mode='change'`):
  продукт залочений (крок 1 done, **не клікабельний**), старт із Plan; поточний
  план — **стрип «CURRENT PLAN»** на верхній кромці картки (`.pc-strip`, поза тілом
  картки, накриває її верхній бордер), а не чіп усередині. Висота стрипа
  **зарезервована над кожною карткою** (`.plangrid.withcur{--stripH}` +
  `margin-top` на всіх `.plancard`) — тому висоти карток рівні, а назви планів
  стоять на одній горизонталі; картка лишається невибірною (`.nl-current`,
  `currentCardName` мапить tbmqsub→'TBMQ PE subscription'); Customize/Review показують перехід
  «Prototype → Startup» (cap, mainline),
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
- **Глобальний футер** (`#shellFoot`, `.shellfoot` / `.shellfoot-in`): один тихий muted
  рядок «© 2026 ThingsBoard · Privacy policy · Terms of service · License agreement»
  на **кожній** сторінці, шириною спільного контейнера (`--pageW` + `--pageX`). Живе
  **всередині `#shellMain`** (скролиться разом з контентом), тому `presentPage` після
  монтування вузла сторінки **перевішує футер назад у кінець** — інакше `appendChild`
  цільового вузла лишав би футер вище контенту. Лінки — власний делегований хендлер
  на `#shellFoot` (у футері немає view-скоупу, який ловить `[data-goto]`).
  **Групу Legal з профіль-меню прибрано** — тепер меню це Account · Billing & payment ·
  Sign out.
- **Legal-сторінки**: `privacy`/`terms`/`eula` — повні сторінки в спільному shell
  (`#privacyView/#termsView/#eulaView`, стилі `.legal` — body 16/1.6, h2-секції,
  max-width 800), відкриваються з Legal-групи профіль-меню (`data-goto`).
  Плейсхолдерний юридичний текст, помічений як несправжній.

## Пас чистки перед реструктуризацією (2026-08-26)
Прибрано **все, що не в активному флоу**, щоб реструктуризація на кілька файлів
починалася з мінімальної бази:
- **Архів** цілком: таб Archive у пікері, Portfolio-сторінка, макети списку Grouped /
  One column per field (разом зі статичними `PRODUCTS` / `PRODUCTS_V3` і
  `productsVariant`), архівна модалка Manage add-ons (`#addonsOverlay` + контролер `AM`),
  флоу full-screen overlays (`#pageOverlay`, `flowMode`, `FLOW_HOSTS`, `AREA_*`,
  `overlayLevel`, `syncFlowChrome`).
- **Степер візарда** зведено до Progress line (варіанти rail і numbered видалені).
- **Мертвий CSS**: ~160 правил (сімейство `.am-*` архівної модалки, `.pf-*`, `.pgo-*`,
  `.nl-r*`, `.t-*`-утиліти, `.savebar`, `.rowaction`, `.roblock`, `#billAddrReadonly`,
  `.setheadrow`, `.setfooter`, `.addrow`, `.crumb`, `.kv`, `.drow`/`.di-*`/`.dmini`).
- **Мертвий JS**: гілка `Offline` в `menuItems()` (тип прибрано ще в аудиті
  термінології), хендлер `.lic-back` разом зі змінною `prevPage` (кнопок із цим
  класом у розмітці не лишилось після розділення Profile на картки).
Файл: 5 461 → 4 526 рядків (−935). Поведінка не змінювалась — лише видалення.

## Реструктуризація на багатосторінковий сайт (2026-08-26)
Один HTML розібрано на 13 сторінок + 5 спільних модулів; поведінка не змінювалась,
крім того, що вимагала багатосторінковість:
- навігація — справжні посилання (`data-goto`-кнопки стали `<a href>`), деталі
  ліцензії — `license.html?id=…&from=…`, back і підсвітка nav читають `from`;
- стан переїхав у localStorage (див. «Стор»), бо між сторінками JS-змінні не живуть:
  cancel, покупка з майстра, add/delete user, pending email, згорнутий банер,
  обраний стан дашборда;
- шрифти витягнуто з base64 у `fonts/*.woff2`, CSS — у `styles.css`;
- `planCard` і картка продукту стали спільними білдерами (`components.js`), бо тепер
  їх викликають і сторінки, і `styleguide.html`;
- дії рядків інвойсів (View invoice / Download PDF) переїхали в `components.js` —
  вони потрібні і на Home, і на Invoices.

## Відкриті питання / борг
- ~~Превʼю Invoices і Users на дашборді — статичні копії~~ **виправлено**: дашборд
  і повні сторінки Invoices/Users/Activity/Licenses тепер усі з `DATASETS[dashVariant]`
  (див. «Dashboard density variants»). `ACTIVITY`-масив прибрано — фід теж з `DATA()`.
- **`prototypeaddons` не має лінка у флоу**: у датасетах такого рядка немає, тож
  сторінка досяжна лише через контекстний список у налаштуваннях — так вирішено
  свідомо («хай там і лежить»).
- ~~`AMF` не знає про плани~~ **виправлено**: `AMF.open(lic)` сідиться з ліцензії
  (`AMF_TIERS` + `TIER_SPECS`: base/incl/extras/addons, титул `#fsTitle`, devices-поле,
  «fixed by {plan} plan», рядок review `#fsPlanLine`). Вхід: details (activeLicense)
  і **меню рядка** (`[data-manageaddons]` → `licById`). Лишилось: статичні лейбли
  markup TB-словами (для TBMQ «Devices» ≠ Sessions).
- ~~TBMQ не має детальних сторінок~~ **виправлено**: TBMQ-рядки (sub і perp) відкривають
  повноцінну TBMQ-наповнену сторінку (`TIER_SPECS.tbmqsub`/`tbmqperp`). Немає dead rows.
- **Дані рядка → деталі зведені**: деталі тепер керуються об'єктом ліцензії (не `PAGES`) —
  entitlements із `TIER_SPECS[tier]`, хедер/статус/період/ціна з рядка (див. «Деталі
  ліцензії керуються рядком»). Ще окремо стоять: **Instances-таб** (статичні 2 інстанси,
  не per-license), **license key** (спільний мок), і perp-**Invoices**-таб (статичні суми).
- **Search-інпути невізуальні** (лупа + placeholder, без фільтрації).
- Дрібні свідомі рішення (можуть «повернутися» питанням): Users сортовані Created
  desc; у профільному меню лишено «Sign out».
- **NL-флоу — inferred ціни**: perp-юніти (TB prod $1,999 / AI $500 / TBMQ prod $999)
  і дати нових ліцензій (renews Sep 19 2026 / updates Aug 19 2027) — плейсхолдери.
  «Renew subscription» на canceled-деталях — TODO-стаб.
- `.claude/launch.json` містить сесійний scratchpad-шлях (див. «Як запускати»).
- **Три варіанти степера в дизайн-системі** ТЗ просило показати всі три; варіанти
  A (summary rail) і C (numbered steps) видалені в пасі чистки, тому `styleguide.html`
  показує єдиний наявний — progress line — і **прямо про це каже** в блоці степера.
  Відновлювати видалене заради інвентаря не стали: сторінка описує те, що є.
- **Залишки Vite-збірки** (`package.json`, `vite.config.ts`, `tsconfig*.json`,
  `node_modules/`, `package-lock.json`, конфіг `dev` у `launch.json`) лишились у корені
  після видалення `src/`. Прототипу вони не потрібні; прибрати — окреме рішення.
- **GitHub Pages**: усі шляхи відносні, перевірено з підпапки `/site/`. Що ще
  знадобиться при публікації — `.nojekyll` (файли з підкресленням тут не використовуються,
  тож поки не критично) і вибір гілки/теки в налаштуваннях репозиторію.

## Файли
```
index.html licenses.html license.html invoices.html activity.html users.html
account.html security.html billing.html privacy.html terms.html
license-agreement.html styleguide.html
styles.css  fonts/ubuntu-{400,500,700}-{latin,latin-ext}.woff2  fonts/ubuntu-mono-400-latin.woff2
data.js  shared.js  components.js  wizard.js
page-home.js page-licenses.js page-license.js page-invoices.js page-activity.js
page-users.js page-account.js page-security.js page-billing.js  styleguide.js
NOTES.md  README.md
serve_prototype.py + www/site/        ← у scratchpad сесії: статичний сервер і дзеркало
(залишки Vite: package.json, vite.config.ts, tsconfig*.json, node_modules/ — не використовуються)
```
