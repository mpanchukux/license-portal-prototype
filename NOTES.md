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
- `wizard.js` — **один** степовий візард (`NL`) у трьох режимах: нова ліцензія ·
  Change plan · Manage add-ons — разом із розміткою; підключається на Home,
  Licenses і деталях;
- **`license-details.js`** — **вся поверхня деталей ліцензії в одному місці**: розмітка
  (`DETAILS_HTML`), рендер-шар і всі внутрішні поведінки. Її монтують **два хости**, і
  жоден не тримає копії: `LicenseDetails.mountPage(hostSel, lic, {back})` — сторінка
  `license.html`; `LicenseDetails.openModal(lic)` — модалка над Home/Licenses.
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
  Виняток — **`.btn.lg`** (37px / 15px / padding 0 18px): для праймері, який стоїть
  **поруч із h1**, а не в контрольному рядку (наразі одна поверхня — «Buy a license»
  на Home; варіант є в інвентарі `styleguide.html`). У тулбарах бенд непорушний.
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

### Хром-посилання: без підкреслення (пастка багатосторінковості)
Коли топбар, профільне меню й пікер стали справжніми `<a>`, вони почали брати
браузерне підкреслення, а пункти меню без `display:flex` злипались в один рядок.
Базове правило в `styles.css` тримає це під контролем — **не прибирати**:
```css
.dtopbar a,.dprofmenu a,.settings-panel a{text-decoration:none;font-style:normal}
```
Плюс `.dprofmenu button,.dprofmenu a{…}` — розкладка пунктів меню однакова, чи це
кнопка, чи посилання. Прозові посилання (футер, «Show all») лишаються з класом
`.link`, який підкреслює навмисно.
**Футер вставляє тільки `shared.js`** — жодна сторінка не тримає власного (Home
колись тримала, звідси був подвійний футер).

**Футер тримається низу екрана.** `#shellMain` — flex-колонка, футер має
`margin-top:auto`: коли контент коротший за екран, футер стоїть на нижньому краї,
а не підлітає під контент; коли контент довший — іде за ним із заданим відступом
(44px нижнього паддінга сторінки + 6px власного). Обов'язковий супутник:
`#shellMain > *{flex:none}` — без нього вузол сторінки як flex-елемент **стискається**
під висоту вікна й ріже власний скрол.

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
  Мітка A1 — свідомо довга («Central Europe manufacturing cluster — building 4, line 2»),
  щоб **на Home** у першому рядку одразу було видно перенос мітки на два рядки, а під ним
  короткий («Broker»). Рядки різної висоти, і всі клітинки вирівняні по **верху**
  (`.lic-row > td{vertical-align:top}`) — на рівні назви продукту, а не по центру рядка.
  ⚠️ Датасети **знімкуються у Store** при першому завантаженні, тому правка в `data.js`
  видна лише після «Reset demo data» в панелі налаштувань (або очистки ключа
  `tb-license-portal-demo-v1`).
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
  статус — **`Active`**, як у будь-якої живої ліцензії (стан «ще не було чек-іну»
  живе в банері на деталях, не в статусі),
  а `actionsCell` для гранту віддає лише copy-key **без кебаба** (грант нічого
  не змінює й не скасовує — inferred).

**Єдине джерело на варіант** (`DATASETS[dashVariant]`, `DATA()`): дашборд-блоки
і **повні сторінки** Licenses/Invoices/Users/Activity рендеряться з того самого набору
(`renderDatasetViews`). **Субтайтла на Home немає взагалі** — H1 стоїть сам
(`#dashState`/`renderDashState` видалено). «Show all»-лінки — **без стрілки → і без
кількості** (`setShowAll` більше немає; деталі — у блоці про Home нижче).
`currentProducts()` для variant 3 читає `DATA().licenses`.
Дати — `Mon DD YYYY` (`dateKey`/`fmtDate`). today = **Aug 19 2026**.

### Деталі ліцензії — дві презентації (A — page / B — modal)
Перемикач у ⚙-панелі, група **License details**; стан у Store (`licDetails`, дефолт
**page**), хелпер `licDetailsMode()` у `shared.js`. Контент і функціональність в обох
режимах **однакові** — різниця лише в тому, де поверхня живе.
- **Одне джерело**: після рефакторингу вся поверхня в `license-details.js` (див. «Файли»).
  `page-license.js` схуднув до **23 рядків** — читає URL і кличе `mountPage`;
  `license.html` — до **24 рядків** (лишився `<div id="licDetailsHost">` і скрипти).
  Що переїхало: розмітка `#appView` з `license.html`; `licFromNamed`, `isPerpLike`,
  `statusChipHTML`, `renderEntitlements/Features/Alert/Actions/LabelSlot/GrantChrome/
  LicenseDetails`, `meterRow` і хелпери, контролер мітки, reveal/copy ключа, купон,
  Instances-таб, `MODALS`, header-дії — з `page-license.js`.
  Прибрано по дорозі: **легасі-хром** (`.sidebar`/`.topbar` — вони й так були
  `display:none`), **дубль `var MODALS`** і мертві хуки `showDashAlert/clearDashAlert`
  (елемента `#dashAlert` не існує). Демо-хуки `showSubAlert/clearSubAlert/setFeature`
  тепер шукають вузли **при виклику** (розмітка монтується після завантаження файлу).
  ⚠️ Контролер мітки мусить лежати на топ-левелі: `renderLabelSlot` кличе `reset()`,
  тож обидва не можуть бути всередині `wireDetailsOnce()` — і `#labelSlot` шукається
  лениво. Перша спроба з ним усередині ламала рендер на пів-дорозі (ReferenceError).
- **Modal mode (B)**: клік по рядку (Home або Licenses) відкриває деталі у великій
  центрованій модалці **над** поточною сторінкою — той самий контейнер, бекдроп і блюр,
  що у візарда (`.fs-screen` + клас `.licmodal`), ~90% ширини до 1200, ~90vh, внутрішній
  скрол. Сторінка під нею лишається на місці: **nav-підсвітка не змінюється** (Home лишає
  Home), скрол і фільтри зберігаються (`body.licmodal-open #shellMain{overflow:hidden}`).
  **Одна поверхня, без вкладеної рамки.** Раніше контент приїзджав як картка-на-картці:
  `.fs-box` несла сірий фон сторінки (`--bg`), а `.canvas` кладала **другий** білий слеб
  усередині. Тепер **біле несе сама модалка** (`.licmodal .fs-box{background:var(--card)}`),
  а `.canvas` перестає бути шаром (`background:transparent`, `border:0`, `radius:0`,
  `overflow:visible`) — жодного внутрішнього контейнера, жодного другого фону, жодних
  подвійних бордерів. Контент іде **на ширину модалки, не сторінкового контейнера**:
  `.licmodal .sheet{max-width:none;padding:18px 24px 34px}` — `--pageW` капав його на
  1072px, тепер 1132px, з нормальним боковим паддінгом і **скромним 18px-відступом
  під хедером**. ⚠️ Правило скоупнуте на `.licmodal`, тому в `#nlModal` (візард) `.fs-box`
  лишається сірою — перевірено на вкладеному флоу: візард над деталями тримає свій фон.
  **Page mode не зачеплений** — там `.canvas` і далі біла картка з бордером на сірій
  сторінці (перевірено після правки).
  Хедер модалки: **тип ліцензії** ліворуч, **✕ праворуч**. Заголовок каже **лише вид**
  ліцензії — `Subscription plan` / `Perpetual license` / `Grant license` (`titleFor`,
  та сама формулювання, що в контентному кікері `.titlekicker`, мінус грантове «· Free»:
  це факт ціни, а не титул). Раніше він повторював назву+мітку
  («Prototype · Central Europe manufacturing cluster — building 4, line 2») — але обидві
  вже стоять першими двома рядками контенту одразу під ним, тож хедер був довгим дублем.
  ⚠️ Грантова гілка — **моє додавання** (ТЗ називало лише два значення): `isPerpLike`
  вважає грант перпетуалом, тож без неї грант отримав би «Perpetual license», що
  неправда. **Back-кнопки немає**
  (закриття — єдиний вихід; `#backBtn` ховається, а `.licmodal .headgrid` втрачає
  31px-канавку, інакше контент з’їжджав у неї). **Клік по бекдропу нічого не робить**
  (деталі можуть тримати відкриті редактори), **Esc закриває**.
- **Вкладені флоу** (Change plan, Manage add-ons, Apply coupon, Cancel subscription)
  відкриваються **над** модалкою деталей і по закриттю вертають **у неї**, не на сторінку:
  `.licmodal{z-index:95}` проти 100 у `.fs-screen`/`.payoverlay` і 400 у `#overlay`.
  Третього рівня немає. ⚠️ Esc-хендлер модалки деталей висить у **capture-фазі**: власні
  хендлери вкладених флоу спрацьовують у bubble і встигають закритись, тож у bubble ми б
  побачили «нічого не відкрито» і закрили б і деталі теж.
- **Зміна, зроблена в модалці, оновлює і сторінку під нею**: `LicenseDetails.setRerender(fn)`
  (хости передають `renderHome` / `renderProducts`), `afterChange()` для cancel і
  `reopen(lic)` для Change plan — `commitChange` у візарді більше не робить
  `location.href`, якщо модалка відкрита.
- ⚠️ **Modal mode втрачає deep-link `?id=`**: у режимі B у деталей немає власної URL —
  не можна ні поділитись посиланням на ліцензію, ні відкрити її в новому табі, ні
  повернутись на неї через історію браузера (кнопка «назад» браузера вийде зі сторінки,
  а не з модалки). Page mode (A) цю адресу має (`license.html?id=…&from=…`). Це головний
  аргумент у виборі між A і B — врахувати при рішенні.

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

### Крок 3 (Review) і крок 4 (Billing & payment)
**Review** (`renderStep3`) — **той самий двоколонковий `.fs-grid`, що на кроці 2**
(2fr / 1fr, gap 24). Раніше крок стояв одноколонковим `.fs-review` на всю ширину й через
це читався як інший екран; тепер сітка спільна, тож Review виглядає частиною візарда.
Заголовка в контенті немає — його каже хедер кроку (`.am-h2`/`.am-sub2` прибрані).
- **Ліва колонка — план-блок, зшитий із карткою умов** (`.nl-joined`): зверху
  `.am-order` (назва плану + ціна, рядок ентайтлментів, лайн-айтеми, monthly total),
  **впритул під ним** `.nl-terms` («Billed monthly · auto-pay. Cancel anytime.» / для
  перпетуала «One-time payment · includes 12 months of software updates.»). Два окремі
  контейнери **без зазору** й **без радіуса на кромках, де сходяться**
  (`6px 6px 0 0` + `0 0 6px 6px`), а картка умов підтягнута `margin-top:-1px`, щоб два
  1px-бордери легли один на одного й дали **одну лінію**, а не 2px-шов. Читається як
  один блок, поділений лінією.
- **Права колонка — sticky-картка з дією всередині** (`.am-sec.fs-right`): рядок
  **Due today** + сума (`.nl-duerow` + `.am-duelabel`/`.am-dueval`), під ним
  **контекст оплати** (`.nl-payline`: «Charged to Visa ••4242 · auto-pay · Change →
  Billing & payment» або «You’ll add billing and payment details on the next step.»),
  далі **primary** (`#nlCommit`: `confirmLabel()` на останньому кроці або
  **«Continue to billing»**, якщо далі є крок 4). Кнопка стоїть **у власному паддінгу
  картки** — `.fs-right{padding:16px}` + `.fs-nextbtn{margin-top:14px}`, тобто рівно та
  сама внутрішня метрика, що в Calculation summary на кроці 2: 17px до низу картки,
  ширина 335 при внутрішніх 337 — не впритул до кромки й не full-bleed.
  `.nl-duerow` вирівняний по **baseline**: у change-plan лейбл несе довгу prorate-ноту
  на 3 рядки, і сума лишається на першому рядку, а не з'їжджає в центр блоку.
- ⚠️ **Класи навмисно нові** (`.nl-duerow`, `.nl-payline`, а не `.am-duerow`/`.am-payrow`):
  ті два несли `.fs-screen`-паддінги для статичного рев'ю AMF (уже видаленого разом
  із ним), і перевикористання затягло б чужі відступи. Мертві `.nl-duecard`-правила прибрані, `#nlModal .fs-review`
  теж. `.fs-review` після видалення AMF став мертвим і **прибраний** — див. розділ
  про консолідацію Manage add-ons.

**Billing & payment** (`renderStep4`) — власний монохром, не копія рефсу: ліворуч дві
панелі — **Billing information** (Company name*, Billing email*, Phone із хінтом E.164,
Country*, City*, State / Province, ZIP*, Address*, Address line 2) і **Payment method**.
У Payment method порядок полів — **номер картки перший** (з exp/CVC **в одному полі** —
той самий `.paystripe`, що в модалці Update payment method), **під ним рядок Cardholder
name* | Country***, і в підвалі панелі тиха нота «Powered by Stripe». Номер веде, бо
він і є те, про що панель; ім'я та країна нижче — реквізити, які його уточнюють. Нота
лишилась останнім елементом панелі (вона про панель, не про одне поле).
Праворуч — **Order summary** (компактний recap + Due today), тиха картка умов і **коміт,
disabled поки форма невалідна** (`billValid()`; обовʼязкові позначені `.req`). Значення
живуть у `bill`, тому крок назад-вперед їх не губить.

### Успіх — сторінка ліцензії, не модалка
**Success-модалку з ключем видалено** (`WIZARD_SUCCESS_HTML`, `showSuccess`,
`finishSuccess`, `#nlKeyCopy` — усе прибрано). `commitPurchase` пише
`Store.set('justCreated', lic.id)` і робить `location.href = licenseHref(lic)`.
На сторінці деталей `syncNewBanner()` показує **одноразовий банер** (`#licNewBanner`,
вигляд `.gbanner`, всередині `.sheet`, тому кромки збігаються з контентом): «License
created. Your license key is on this page — reveal and copy it below.» + дія
«Installation instructions» (стаб) + ✕, який чистить прапорець назавжди. Ключ копіюється
зі звичайного блока License key на сторінці — окремої копії в банері немає.
⚠️ **У режимі licDetails = modal це єдиний випадок, коли застосунок таки покидає сторінку**:
після купівлі ми відкриваємо повну сторінку ліцензії (там живе ключ і працює deep-link),
а не модалку. Back на ній веде на Licenses (без `&from`).

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
тригер читає **лише вибране значення** — «All time» / «Last 7 days» / «12.08 – 19.08»
(`fmtDM`, dd.mm; один край → «from/until dd.mm»), плюс каретка. Префікса «Period:» немає
(лейбл переїхав у `aria-label="Period"`, а `.perbtn b` став weight 400 — тригер це
значення, а не підписане поле). Панель дропдауна лишилась без змін.
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
  Хедер: статус — **`Active`**; «Free» переїхало в кікер («Grant license · Free»),
  бо це факт ліцензії, а не статус; стан першого чек-іну — банер над контентом
  («No instance has checked in yet…» + дата видачі ключа + стаб «Installation guide →»).
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
(`licenseActivity`). Елемент: **без іконки події** — перший рядок це muted-таймстемп,
під ним фраза на всю ширину; обидва починаються **від краю контейнера** (колонки під
іконку немає). `.fi-ic` і набір `FEED_ICONS` видалені як мертвий код; поле `kind`
у подіях лишилось — це те, чим подія є, і воно знадобиться першому ж групуванню
чи фільтру. Причина: тип події вже стоїть першими словами речення, іконка його
лише дублювала. Фраза в порядку **що зроблено → from/to → ким** (виділені сутності).
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
- **Status має лише два значення** — `Active` / `Canceled`, і **на всіх поверхнях**:
  `statusPill` (таблиці) і `statusChipHTML` (хедер деталей) тримають те саме правило,
  **без винятків** (грант теж `Active`). `payment_failed`, `updates_expiring` і
  `awaiting_checkin` **лишаються в даних** — вони керують **банером** на деталях
  (конкретна дата + дія) та attention-first сортуванням дашборда, але статусами не є.
  Розподіл свідомий: **статус каже, чи ліцензія жива; банер — що потребує уваги.**
  Дата тепер у колонці State, тому з canceled-пілюлі знято «· until {date}»
  (на деталях чіп лишає «Canceled · active until {date}» + muted-трактування).
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
- **Products** — «Product-first (neutral)» → `licenses.html` (як і до реструктуризації).
- **Plan details** — посилання на `license.html?tier=…` (Maker…Business,
  Prototype + add-ons, Perpetual): синтезовані план-сторінки, яких немає в датасетах.
- **Reference** — «Design system → styleguide».
- **Billing data** — `saved` / `none`: перше дає візарду 3 кроки з комітом на
  Review & pay, друге додає 4-й крок Billing & payment (`Store.billingData`).
- **License details** — `A — page` / `B — modal`: сторінка `license.html` чи модалка
  над Home/Licenses (`Store.licDetails`).
- **Customize step** — `A — Plan card` / `B — Locked inputs` (`Store.custVariant`).
- **Dev actions** — «Confirm email change» (активна, лише коли є pending; сам pending
  лежить у сторі, тому підтвердити можна з будь-якої сторінки) і **«Reset demo data»**.
  Групу «Account», яка не вела нікуди, прибрано — дев-дії тепер разом.

⚠️ Панель **вища за до-реструктуризаційну**: план-посилання показуються завжди, а не
лише в контексті деталей (`syncSettingsContext` не переносили). Якщо заважає —
ховати групу, коли `document.body[data-page] !== 'license'`.

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
- **Дії Account — в одному sticky-хедері** (`.pagehead`), праворуч, у порядку
  наростання до primary: **Change password** (`.btn.sec`, лінк на `security.html`) ·
  **Save** (primary). Блок `.pdactions` у Personal details прибрано. **«Log out» з хедера
  прибрано** — вихід із сесії глобальний, його дім — профіль-меню, і дублювати його на
  сторінці не треба; назва одна всюди — **«Sign out»**. **Тексту «All changes saved» на
  Account немає** — disabled-стан Save сам каже, що зберігати нічого (`wirePageSave(…, null)`;
  третій аргумент опційний). ⚠️ На **Billing** і **Security** нотатка ще є — свідомо
  не чіпала, бо просили тільки Account.
- **Security — окрема внутрішня сторінка** (`#securityView`, `PAGES.security`,
  `kind:'security'`): картку Security з Account прибрано, вхід — кнопка **Change password**
  у хедері Account.
  Сторінка має **власну back-канавку** (`.secgrid` = ті самі `--backW`/`--backGap`, що
  `.headgrid` деталей; `#secBackBtn` → `goToPage('profile')` через unsaved-guard) і **власний
  Save** (`wirePageSave('#securityView', …)`). Три поля пароля стоять **вертикально**
  (`.pwstack`), кожен інпут — 393px = ширина однієї клітинки `.field2`; кап стоїть на
  **інпутах** (`.pwstack .field input{max-width:393px}`), бо `.setcard > *:not(.setcard-h)`
  зі своїм `max-width:800px` специфічніший за `.pwstack`. `overlayLevel` для `security` —
  `deep` (back ≠ close).
- **Зміна email — verify-then-switch** (контролер `EMAIL`): Save з новою адресою **не**
  міняє акаунтний email — інпут і далі показує адресу, яка реально працює.
  Pending — **один компактний рядок-значення** під інпутом (`.emailpend`): іконка-годинник,
  **«Pending: {new email}»**, далі інлайн-дії **Resend** і **Cancel**, розділені `·`.
  Ні пунктирної «пілюлі», ні другого абзацу — і поки pending активний, **статичний
  helper («Used to sign in…») ховається** (`#emailHelp`), бо рядок сам пояснює стан;
  helper вертається, коли pending знято. Resend на ~1.6s підміняє значення на
  «Re-sent to {new}…» у тому ж слоті. Підтвердження в прототипі — **клік по значенню**
  або дев-кнопка **Confirm email change** у Settings-табі пікера (enabled лише коли є
  pending). Pending живе у Store, тому переживає перезавантаження. Невалідний email
  на Save просто відкатується без pending.
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

## Manage add-ons — **режим того самого візарда**, не друга модалка (2026-08-27)
Раніше це була **паралельна реалізація**: окрема модалка `#fsAddons`, контролер `AMF`
із власними константами (`BASE`/`INCL`/`MIN`/`MAX`/`UNIT`/`ADD`/`AMF_TIERS`), власними
`money`/`extras`/`changes`/`newMonthly`/`dueToday`, **статичною розміткою на 152 рядки**,
власним степером, success-модалкою і **без unsaved-changes guard'а**. Підписи розходились
(«Review →» проти «Review order», «Approve & pay» проти коміт-лейблів візарда).

Тепер **`AMF` і `ADDONS_HTML` видалені цілком**, а Manage add-ons — це
**`NL.open({mode:'addons', license:lic})`**. `wizard.js`: 1119 → **822 рядки** (−297).
Що на що зійшлося:

| було в AMF | тепер |
|---|---|
| `ADDONS_HTML` (152 рядки статики) | `WIZARD_HTML` + `renderStep2/3/4` |
| `BASE`/`INCL`/`MIN`/`MAX`/`UNIT`/`ADD`/`AMF_TIERS` | `BASE`/`INCL`/`MAXQ`/`UNITS`/`ADD` візарда |
| `money`/`extras`/`changes`/`newMonthly`/`dueToday` | `money`/`extras`/`changeRows`/`total`/проратація в `renderStep3` |
| `render`/`render2`/`goStep`/`seed` | `renderStep2`/`renderStep3`/`gotoStep`/`seedFromLicense` |
| `showSuccess` + `#fsSuccess` | нічого — success-модалки немає в жодному режимі |
| «Review →» · «Approve & pay» | **«Review order»** · **«Confirm changes»** |
| Esc без guard'а | спільний `attemptClose()` |
| `AMF.refresh()` (хук у shared.js) | `NL.refreshCustomize()` |

**Три режими одного контролера** (`st.mode`): `new` · `change` · `addons`.
- **Внутрішні id кроків лишились 1..4** (1 пікер · 2 Customize · 3 Review · 4 Billing),
  щоб один `renderStepN` обслуговував усі режими. Add-ons пікера не має, тож
  **стартує з 2**, а **показуваний** індекс зсунутий: `firstStep()` / `stepIndex()` /
  `lastStep()`. Тому «Step 1 of 2 · Customize» при `st.step === 2`.
- **Кроків 2 або 3**: `Customize → Review & pay` (білінг є, коміт там) або
  `Customize → Review → Billing & payment` (білінгу немає, коміт на 3-му).
  Прогрес-лінія читає `stepLabels()`, нічого не захардкоджено.
  ⚠️ **Асиметрія з change-plan**: `needsBilling()` = `!isChange() && !billingSaved()`,
  тобто add-ons білінг-крок отримує, а change-plan — ніколи (аргумент був «ліцензію,
  яку змінюють, вже хтось оплачує»). Add-ons просили саме так; якщо вирівнювати —
  рішення користувачки.
- **Tier пінується**: `st.fixedTier = lic.tier`, тож `tier()` не намагається вивести
  план із `st.plan`. `seedFromLicense(lic)` ставить `cust` = включене планом + наявні
  `lic.extras` + `edge`/`trendz`, і **знімкує це у `st.baseCust`**; воно ж виставляє
  `seededTier`, інакше `renderStep2` перезасіяв би мінімумами плану.
- **Review показує дельту, а не рахунок**: `changeRows()` порівнює `cust` із
  `st.baseCust` — «Production instances 1 → 2», «Added / Removed Edge Computing», суми
  зі знаком (`moneySigned`, бо зміна може й зменшити рахунок). ⚠️ `deltas()` для цього
  не годиться: він перелічує **все понад включене планом**, тобто весь extras-рахунок,
  а не те, що змінив цей флоу. Порожньо → тихий рядок «No changes yet».
  `oldMonthly()` для add-ons = база плану + вартість `st.baseCust` (для change-plan —
  база **старого** плану). Due today прорейтиться в обох (`isMod()`), 16/31.
- **Коміт**: `commitPurchase` → `commitChange` для обох мод-режимів. Add-ons додатково
  пише `Store.set('justChanged', {id, text})`, і сторінка деталей показує **одноразовий
  банер** `#licChgBanner` («License updated. Production instances 1 → 2 · Added Trendz
  Analytics.») поруч з уже оновленими ентайтлментами (`syncChangedBanner`, ✕ чистить
  прапорець назавжди). У modal-режимі деталей коміт **не покидає сторінку** —
  `LicenseDetails.reopen(lic)` перемальовує деталі під собою (перевірено).
- **Коміт-лейбли**: `confirmLabel()` → add-ons **«Confirm changes»**, change-plan
  «Confirm change», нова ліцензія «Subscribe» / «Buy license». ⚠️ Однина/множина між
  двома мод-режимами розходиться — так просили; якщо вирівнювати, то на одному з двох.
- **Guard**: спільний `attemptClose()`; текст per-режим **цілим реченням**, бо
  «add-on changes» не узгоджується зі спільним хвостом «hasn’t».
- Бекдроп — no-op, Esc → `attemptClose()`, нижнього футера немає (як у решти візарда).
- Проратація фіксована **16 з 31 дня** (картка Next charge каже «in 16 days»).
- **Мертвий CSS прибраний** (21 правило): `.am-card*`/`.am-cardgrid`, `.am-h2`,
  `.am-sub2`, `.am-due`, `.fs-screen .am-due/.am-duerow/.am-payrow`, `.am-success`,
  `.am-checkbig`, `.am-chgcount`, `.fs-review`, `.fs-reviewactions`, `.fs-confirmbtn`.
  `.am-duelabel`/`.am-dueval`/`.am-order`/`.am-orow`/`.am-newmonthly` **лишились** —
  ними користується `renderStep3`. `styles.css`: 1008 → 987.
- `#fsAddons` прибраний зі списку `NESTED` у `license-details.js` — `#nlModal` тепер
  покриває і add-ons.

## New license flow (`#nlModal`, контролер `NL`)
Створення ліцензії тепер **робочий степовий флоу** на chrome великої Manage-модалки
(`.fs-screen`/`.fs-box`, бекдроп, sticky footer). Вибір — **видимі картки, ніколи
селекти**.
- **Входи**: **один** праймері на кожній поверхні → `NL.open({})`. На **Home** він
  підписаний **«Buy a license»** і на розмір більший за бенд (`.btn.lg`: 37px / 15px /
  padding 0 18px) — стоїть у `.dwelcome` **поруч із h1**, а не в тулбарі, тож константа
  `--btnH` (31px) на нього не діє. На **Licenses** кнопка лишилась «+ New license»
  у 31px — вона **в тулбарі**, де бенд тримати обов'язково. ⚠️ Два різні підписи для
  одного жесту — свідомо (просили тільки Home); якщо вирівнювати, то на «Buy a license».
  Дропдауна subscription/perpetual більше немає — тип білінгу вибирається **всередині кроку 1**,
  тож розвилка на вході його лише дублювала (`#dashNewMenu`/`#licNewMenu` видалені).
  «Get started» на плані нового користувача → `NL.open({kind, product, plan, startStep:2})`
  — вибір уже зроблений, тому візард відкривається одразу на **Customize**.
- **Степер — один: Progress line.** Тонкий (3px) трек **на всю ширину модалки**
  одразу під hairline хедера (`.nl-stepbar`, паддінг `0 0 10px`), fill = step/totalSteps;
  нижче один рядок з лівим паддінгом «Step 2 of 4 · **Plan**» (muted + bold назва,
  `.nl-plabel`). Без окремих пунктів, без часткових треків. Рендерить `renderSteps()`
  у `#nlSteps`. Варіанти A (summary rail) і C (numbered steps) **видалено** разом із
  перемикачем «Wizard stepper» (обидва прибрані ще до розбиття на файли); клікнути
  пройдений крок, щоб повернутись, більше не
  можна — назад лише кнопкою Back.
  **Кроків три або чотири — залежно від того, чи є білінг-дані** (нічого не захардкоджено:
  `stepLabels()` → масив, `totalSteps()` = його довжина, прогрес-лінія читає їх):
  - **білінг збережений** (`billingSaved()`, дефолт): **Choose your product and plan →
    Customize → Review & pay**, коміт на кроці 3;
  - **білінгу немає**: **… → Review → Billing & payment**, коміт на кроці 4.
  Перемикач у ⚙-панелі — група **Billing data: saved / none** (Store `billingData`);
  зміна перемальовує відкритий візард (`NL.refreshOpen()`). ⚠️ У режимі **change-plan**
  білінг-крок не додається ніколи (`needsBilling()` = `!isChange() && !billingSaved()`):
  ліцензію, яку змінюють, вже хтось оплачує, отже дані є.
  **Нижнього футера у візарді немає взагалі** — розмітку `.nl-foot` разом із `#nlBack`/
  `#nlNext` і `renderFooter()` видалено. Кожен крок діє **з тієї картки, що несе його
  тотал**: крок 1 — кнопки на офер-картках, крок 2 — «Review order» у Calculation summary,
  крок 3 — коміт у картці Due today, крок 4 — коміт у картці Order summary. Back — icon-
  кнопка в хедері кроку.
- **Крок 1 — «Choose your product and plan»**: **три рівні, без жодних боксів і без
  секційних підписів** (рендерить `renderStep1`; хости — `#nlChoices` для рівнів 1–2,
  `#nlOfferHead` для лічильника, `#nlPlanCards` для ґріда):
  1. **Product — один компактний pill-сегментед, центрований** (`.nl-prodrow` центрує,
     `.nl-prodseg` = контейнер `border-radius:999px` з паддінгом 4px, `.nl-prodopt` =
     опція): гліф + назва, **активна опція — залита ink-пілюля всередині контейнера**,
     неактивна muted. Гліфи — 16px монохром через `.icon`: **хаб зі спицями** для
     платформи, **дуга броадкасту** для брокера (лежать у `PRODUCT_CHOICES[].g`).
     ⚠️ **Описів у контролі немає** — це пікер, не пітч, тому два однорядкові описи
     продуктів («IoT platform — devices…» / «High-performance MQTT broker…») **зникли
     з візарда зовсім**. Багатша копія на продукти лишилась у `PRODUCT_CARDS` (data.js,
     специмен у стайлгайді).
  2. **Рядок заголовка + білінг-тогл праворуч** (`.nl-billrow`, `align-items:center`):
     ліворуч заголовок, який **називає те, що показує ґрід** — **«Subscription plans»**
     або **«Perpetual licenses»** (`.nl-billhead`, h2-токен); праворуч на тій самій лінії
     тогл (`.nl-billtoggle`): **Subscription ⓘ — switch — Perpetual ⓘ**. Активна сторона
     ink+500, неактивна faint. **Switch — справжній контрол** (`input[data-nl-billsw]`,
     off = Subscription, on = Perpetual), лейбли — просто текст; тому білінг тепер
     приходить у **`change`-хендлер**, а не в `click` (у `click` лишився тільки
     `[data-nl-product]`).
     **Описи білінгу переїхали в ⓘ-тултіпи** (`.nl-info` + наявний CSS-only `.tip`
     через `data-tip`): «Pay every month. Unlimited customers, dashboards, integrations,
     API calls, data points and messages, and you can change the plan any time.» /
     «Pay once, run it indefinitely. Includes 12 months of software updates, renewable.»
     ⚠️ Базовий `.tip` — **nowrap-однорядковик**, і речення розтягло б його на ~900px,
     тому додано модифікатор **`.tip.wide`** (`white-space:normal; width:300px`).
     Тултіп right-anchored, тож ⓘ біля правої кромки модалки тримає бабл усередині
     (заміряно). ⓘ мають `tabindex="0"`, тож тултіп відкривається і з клавіатури
     (`:focus-visible`). Термін **«Pay-as-you-go» не використовуємо ніде** — тільки
     «Subscription» (перевірено грепом по всіх файлах).
  3. **Plans** — офер-картки поточної пари, **без змін**: TB+Sub → 5 карток, решта →
     одна (`.plangrid.one` центрує 380px). CTA, primary-правила й вибраний стан ті самі.
  **Лічильник** («5 plans» / «1 plan») — **на власному рядку під заголовком**,
  right-aligned (`.nl-countrow`). Це свідомий вибір із двох, які пропонувало ТЗ:
  правий кінець рядка заголовка належить тоглу, і там вони б колідували.
  **Прибрано з кроку**: секційні підписи PRODUCT/BILLING/PLANS і їхні лінійки
  (`.nl-ghead`), картки вибору з описами (`.nl-choice*`), а раніше — group-контейнери
  (`.nl-gbox`/`.nl-plansbox`), конектори (`.nl-connect`), `.nl-group` і вся
  legend-механіка. Бордери на кроці лишились **тільки** на `.nl-prodseg`, `.switch`
  і на офер-картках.
  **Блоку «What’s included in Professional Edition» у візарді більше немає** — його
  копію тепер несе ⓘ-тултіп Subscription у білінг-тоглі. На екрані нового користувача блок
  лишився без змін; `peBlockHTML` переїхав із `wizard.js` у `components.js`, бо
  обслуговує тепер лише одну поверхню (`#ecPlanExtra`).
  **CTA переїхав на картки**: у кожної свій **завжди видимий** `.pc-cta` «Select»
  (без hover-reveal — на тач-екрані hover не існує і ховає дію), **primary на Popular
  (Pilot)**, secondary на решті, а коли картка одна — вона primary. Клік по кнопці **або
  будь-де по картці** → крок 2 з обраним product/billing/plan. Футера на кроці немає.
  Великі product-картки (`.nl-prodcard`) **більше не використовуються** — лишились як
  специмен у стайлгайді (`PRODUCT_CARDS` + `productCardHTML`), дубль масиву у `wizard.js`
  прибрано.
- **Крок 1 у режимі change-plan**: `NL.openChange(lic)` відкриває **той самий** екран
  (ті самі три рівні), але **обидва контроли залочені під значення ліцензії**:
  `.nl-prodopt` — `<button disabled>` (невибрана опція faint, клік нічого не робить,
  перевірено), switch — `disabled` із `opacity:.45` на треку. Заголовок і ґрід так само
  показують поточну пару. Картка поточного плану несе стрип **«Current plan»**, без CTA і не
  клікається (`tabindex="-1"`, `aria-disabled`). Висота стрипа зарезервована над
  кожною карткою (`.plangrid.withcur`), тому назви планів стоять на одній горизонталі
  (заміряно: усі `.pc-head h2` на одному top). ⚠️ Відомий тупик: change-plan для TBMQ-підписки
  показує єдину картку, і вона ж поточна — переходити нікуди (було так і раніше).
- **Крок 2 — Customize: два варіанти** (перемикач у ⚙-панелі, група «Customize step»,
  стан у Store `custVariant`, дефолт **A**; `custVariant()` живе в `shared.js`, бо його
  читає візард у всіх режимах; хук перемалювання один — `NL.refreshCustomize()`,
  тож перемикати можна з відкритою модалкою):
  - **A — Plan card**: над контролами картка `.nl-plansum` — тайтл «{Product} {Plan} ·
    {Subscription|Perpetual}» і під ним фіксовані ентайтлменти як факти
    («100 devices · 100 assets · fixed by this plan»). Картка — **якір кроку**, тому
    читається як хедер лівої колонки, а не як ще одна рівна картка: тайтл на **h2**
    (20/500 — рівнем вище за label-заголовки під ним), паддінг `18px 20px`, факти
    другим рядком (`--t-small`, `--mid`, line-height 1.55). ⚠️ Паддінг заданий як
    `.fs-panel.nl-plansum`, бо `.fs-panel` лежить у файлі нижче й на рівній
    специфічності перебивав `.nl-plansum`. Devices/Assets **прибрані зі
    списку контролів** — вони не редаговані, тож живуть у картці. У списку лишається
    лише те, що змінюється: Production instances, AI credits, Development instances, Add-ons.
  - **B — Locked inputs**: Devices/Assets лишаються рядками, але helper «fixed by {plan}
    plan» під ними прибраний — замість нього **замок усередині** disabled-інпута
    (`.fs-lockfield` + `.fs-lockic`, `.fs-devinput.locked` з лівим паддінгом),
    disabled-стилістика та сама.
  Фіксовані ентайтлменти беруться з `TIER_SPECS.ent` мінус редаговані
  (`fixedEnt()`), тому працює й на перпетуалі (5,000 devices / 5,000 assets) і на
  TBMQ (sessions / messages / sec).
- **Крок 2 — переїзд дій** (спільне для обох варіантів):
  - **Кнопка в картці Calculation summary** — full-width primary під тоталом
    (`#nlSumNext`, клас `.fs-nextbtn`), підписана
    **«Review order»** (не «Continue») — вона називає, куди веде: Review & pay. На
    перпетуал-шляху та сама назва — і в режимі Manage add-ons теж (його власна
    «Review →» пішла разом з AMF).
    Картка
    **sticky** у межах кроку (`.fs-right{position:sticky;top:0}`), тож тотал і дія
    видні під час скролу лівої колонки.
  - **Back став icon-кнопкою в хедері кроку**, одразу перед «Step N of M · …»
    (`#nlStepBack` у `.nl-plabel`, який тепер flex). Рендериться на кожному кроці > 1,
    делегований хендлер на `#nlStepbar`.
  - **Нижнього футера на цьому кроці немає** (`renderFooter`: `#nlFoot` схований, поки
    крок < останнього; `#nlBack` схований завжди). Футер лишився тільки на Review & pay
    і несе один primary — Subscribe / Buy license / Confirm change.
  - **Заголовок блока контролів — «Capacity»** (був «PLAN {назва}» / «PACKAGE {назва}»):
    рядки — це те, чого можна докупити (production instances, AI credits, development
    instances), а не налаштування плану; назва плану вже стоїть у картці вище, тому
    `.am-cap` із цього хедера прибраний. ⚠️ У режимі
    change-plan цей хедер більше не показує перехід «Prototype → Startup» — його видно
    в картці плану (нова назва), у рядку summary «Current · {old}» і на кроці Review.
    «Add-ons» нижче — без змін.
  - **Add-ons — тогли, вирівняні праворуч**: замість чекбокс-карток `.am-card` тепер
    ті самі рядки `.am-cell` + `.fs-cellhead`, що й степери: назва + опис + ціна ліворуч,
    `.switch` на правому краю. `#nlStep2 .am-capgrid` і `#fsStep1 .am-capgrid` зведені
    в **одну колонку**, тож усі контролі (степери + тогли) стоять одним правим стовпцем.
- **Manage add-ons отримує це автоматично** — він тепер режим цього ж візарда й
  ходить через той самий `renderStep2`. ~~Дві гілки варіанта A/B (статична розмітка
  AMF проти JS-рендера)~~ **зведені**: гілка одна.
- **План-картки кроку 1** (детально): з **`EC_PLANS`** — name/price/**повні feats**
  (capacity + support-tier + WL, див. нижче). Під ґрідом — **одна самодостатня картка**
  «What's included in Professional Edition» (`peBlockHTML(intro)`, `.nl-pe`): титул =
  хедер картки (h2), під ним muted-інтро **«All plans include unlimited customers…»**
  (`PLANS_INCLUDE_NOTE`; на perp-шляху інтро немає), далі список `PE_FEATURES`
  (**7 фіч** — White-labeling прибрано, бо він НЕ edition-wide: лише Pilot+;
  HTML-`TODO: confirm with product…` біля `#nlPlanExtra`). Окремого плавучого
  рядка між ґрідом і карткою **немає** (`#nlPlanNote` видалено) — ґрід → один
  20px-гап → картка, вирівняна по лівому/правому краю ґріда на всю його ширину.
  `peBlockHTML` живе на топ-левелі (не в NL-IIFE) — той самий рендер на **двох
  поверхнях**: крок 1 візарда (`#nlPlanExtra`) і екран нового користувача
  (`#ecPlanExtra`); `#nlProdExtra` зник разом із product-кроком. **Лише продукт ThingsBoard** (фічі TB PE,
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
  **Review-крок вирівняний вліво** (переїхав на `.fs-grid`, див. розділ про крок 3). **Топи вирівняні**:
  `.fs-right{top:0}` — ⚠️ sticky-інсет резолвиться від **padding box** скролпорта
  (fs-body має padding 24), тож будь-який позитивний top зсував панель нижче лівої
  навіть у спокої (старі 57px → 57px зсуву).
- **Крок 4 Review & pay**: головний рядок **розбитий**: жирний «ThingsBoard Pilot»
  зліва + жирна ціна справа (`.nl-mainline`), під ним regular-рядок ентайтлментів
  «100 devices · 100 assets · …» (`.nl-entline`); далі дельти → total → Due today,
  платіжний рядок Visa ••4242 (+auto-pay для sub) з лінком «Change → Billing &
  payment» (веде на Billing через guard).
- **Subscribe / Buy license → loading → сторінка ліцензії**: клік по кнопці **в картці**
  (Due today на кроці 3 або Order summary на кроці 4) → `startPurchase(btn)` ставить у неї
  спінер (`.nl-spin`, ширина зафіксована JS-ом) на ~1.5s → `commitPurchase` пушить ліцензію
  в **поточний** `DATA().licenses` (id `N1…`, created **Aug 19 2026**, sub renews
  Sep 19 2026 / perp updates до Aug 19 2027, extras/edge/trendz зберігаються), ставить
  `Store.justCreated` і **переходить на сторінку нової ліцензії** (див. «Успіх — сторінка
  ліцензії, не модалка»). Спінер не відновлюється — ми йдемо зі сторінки.
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
  Product і Billing залочені у фільтр-барі кроку 1, старт **із кроку 1**; поточний
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
- ~~`AMF` не знає про плани~~ / ~~статичні лейбли markup TB-словами~~ **знято разом
  із `AMF`**: Manage add-ons тепер режим візарда й сідиться через `seedFromLicense`
  із `TIER_SPECS`, тому TBMQ отримує Sessions / Messages-sec, а не «Devices».
  Входи ті самі: деталі (`activeLicense`) і меню рядка (`[data-manageaddons]`).
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
- ~~Залишки Vite-збірки в корені~~ **прибрано** перед публікацією: `package.json`,
  `package-lock.json`, `vite.config.ts`, `tsconfig*.json` вилучені з репозиторію (у
  git-історії лишаються). `node_modules/` і так у `.gitignore`. ⚠️ Конфіг `dev` у
  `.claude/launch.json` тепер указує в нікуди — прототипу він не потрібен, працює
  конфіг `prototype`.
- **GitHub Pages**: усі шляхи відносні, перевірено з підпапки `/site/`; `.nojekyll`
  у корені додано. Сайт **лежить у корені репозиторію**, тому Pages треба вмикати з
  `main` / `(root)` — нічого нікуди переносити не треба.
  ⚠️ **Не опубліковано**: на цій машині немає ані remote, ані `gh`, ані збережених
  креденшлів GitHub (`osxkeychain` є, але запису для github.com немає). Створити репо
  й запушити може лише власниця акаунта — команди в кінці цього розділу.

## Файли
```
index.html licenses.html license.html invoices.html activity.html users.html
account.html security.html billing.html privacy.html terms.html
license-agreement.html styleguide.html
styles.css  fonts/ubuntu-{400,500,700}-{latin,latin-ext}.woff2  fonts/ubuntu-mono-400-latin.woff2
data.js  shared.js  components.js  wizard.js  license-details.js
page-home.js page-licenses.js page-license.js page-invoices.js page-activity.js
page-users.js page-account.js page-security.js page-billing.js  styleguide.js
NOTES.md  README.md
serve_prototype.py + www/site/        ← у scratchpad сесії: статичний сервер і дзеркало
(залишки Vite: package.json, vite.config.ts, tsconfig*.json, node_modules/ — не використовуються)
```
