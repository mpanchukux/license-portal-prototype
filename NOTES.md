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

### Два флоу презентації (глобальний перемикач «Flow» у налаштуваннях)
1. **Top-bar navigation** (дефолт): у топбарі nav-пункти **Home · Licenses ·
   Invoices · Activity · Users**, відцентровані по самому бару (`position:absolute;
   left:50%`), активний підсвічений (`NAV_FOR_KIND`; для деталей — Licenses).
   Сторінки рендеряться під баром у `#shellMain`.
2. **Full-screen overlays**: nav-пунктів немає (`.tnav[hidden]`), базова сторінка
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

### Список поверхонь (kinds)
- `dash` — **Dashboard (Home)**, стартова сторінка прототипу. Блоки: Licenses
  (full-width таблиця, рендериться **тими самими** білдерами, що сторінка Licenses
  у варіанті product-first — 3 найновіші рядки з реальними сторінками + рядок
  перпетуалу), Recent invoices (колонки як на сторінці Invoices), Recent activity
  (фід), Users (колонки як на сторінці Users, без Activation status). Праворуч
  угорі — split-кнопка «+ New license».
- `dashempty` — **новий користувач**: структура планів із перемикачами
  **Product** (ThingsBoard/TBMQ) × **Billing** (Subscription/Perpetual), дані з
  `EC_PLANS`. TB×PAYG — 5 карток, решта — одна центрована + «You can fine-tune
  capacity before checkout». Deployment-перемикача немає (портал self-managed).
- `sub` / `perp` — деталі (спільний `#appView`): `maker/prototype/pilot/startup/
  business` + `prototypeaddons`, перпетуал — `perp`.
- `products3` — **сторінка Licenses** у флоу (product-first neutral). У флоу
  ведуть **лише** на неї (back із деталей — жорстко `products3`).
- `invoices` / `activity` / `users` / `profile` / `billing` — повні сторінки.
- Архів: `products` (grouped), `products2` (one column per field), `portfolio`.

### Активність — фід, не таблиця
`ACTIVITY` (список подій) + `feedItem()` рендерять і сторінку Activity, і блок на
дашборді (там 3 останні). Елемент: **компактна іконка типу 24px** (заливка `--track`),
muted-мета = **лише таймстемп** (без «Note»/«System note»), фраза в єдиному порядку
**що зроблено → from/to → ким** (виділені сутності). Кнопка «details» **розгортає
raw-JSON payload на місці** (`.fi-audit`, capped 300px зі скролом, кілька можна відкрити
разом) — модалки «Audit log details» **більше немає**. На деталях та сама структура
використовується в табі **«Audit log»** (перейменований з «Logs»).

### Таблиці
Колонки дій позначені класом `cellact` (+ `th[aria-label$="ctions"]`) і
стискаються під контент із `text-align:right`, щоб дії тримались краю таблиці.
Колонки з даними, що стоять останніми (Created Time в Instances, Limit у Plan &
Add-ons), свідомо не зачеплені.

### Стандартний тулбар (усі list-сторінки однаково)
Зліва направо: **`.searchbox`** (persistent input ~280px, лупа всередині, page-
placeholder) → фільтри (якщо є) → `.spacer` → refresh (outlined icon-btn) →
**primary** (напр. «+ New license») в самому правому куті. Search-інпути поки
**невізуальні** (без логіки). Патерн застосований на Licenses, Portfolio,
Invoices, Activity, Users, Instances-таб, Logs-таб.

### Пікер сторінок (тимчасовий, контекстний)
⚙ внизу праворуч → «Prototype settings». Порядок: **Flow** (Top-bar navigation /
Full-screen overlays) → таби **Settings | Archive**.
- Settings: «Dashboard (Home)» (populated / new user) + Products →
  «Product-first (neutral)». Варіанти планів (Maker…Business, Prototype + add-ons)
  і «Perpetual license details» показуються **лише** коли відкрита сторінка деталей
  (`syncSettingsContext`).
- Archive: `products`, `products2`, `portfolio` + перемикач Manage add-ons
  (Full-screen = флоу / Modal = архів).
- Секцій «Pages» і окремої «Perpetual» немає — ці сторінки досяжні у флоу.
- Стан у JS-змінних (`flowMode`, `detailsPage`, `productsVariant`, `addonsStyle`),
  без persist.

### Демо-хуки
- `window.showSubAlert('…')` / `clearSubAlert()` — банер на деталях.
- `window.setFeature('edge'|'trendz'|'whitelabel', on)` — чипи фіч на поточній
  details-сторінці.

## Типографіка (type-system, WIP)

**Шрифти вбудовані base64-woff2** (константа «без зовнішніх запитів»): Ubuntu
**400/500/700** + **Ubuntu Mono** (license keys / IDs). Light 300 свідомо не
вантажимо. Через це файл ~550KB (див. пастку Read-token-ліміту вище).

**Шкала** — CSS custom properties у `:root` (одне місце) + утиліти `.t-*`:
`--t-display 64` · `--t-h1 36/700` · `--t-h2 20/500` · `--t-body 16/400` ·
`--t-small 14/400` · `--t-label 14/500 uppercase +0.10em`. Правила: **14px — підлога**,
вага росте з розміром, **bold 700 лише для display/h1**; `--t-small` і `--t-label` —
один розмір, різняться регістром+трекінгом. Числа — `.tnum`; mono — `.t-mono` (ls:0).

**Застосовано частково — лише Profile settings** (спільні селектори `.lic-h1`,
`.setcard-h h2`, `.field*`, `.cardhelp` зачепили й Billing + усі page-titles). Решта
сторінок ще на старих розмірах. Процес — **по секції, з рев'ю в браузері**. Не вирішено:
field-labels → `--t-small` чи `--t-label`?; page-subtitle → `small`/`body`?; input-текст
→ `body 16` чи `small 14`?

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
- §3 **Users без статусу**: прибрати Activation-status + чипи (→ «Added {date}»); таб
  «Audit log» вирівняти до фіду (прибрати Status/Success).
- §4 **прайсинг**: рядок **Assets** в entitlements; AI-юніт «{N}M AI credits» + `TODO`
  (cadence перпетуалу; чи включають self-managed subs AI взагалі); `+$0.10`.
- §5 **механіка**: формат дат/грошей; sentence case.
- §6 **зайвий копірайт**: usage-tooltip геть; пароль-плейсхолдери «••••••••»;
  entitlements-заголовки **Resource / Purchased**; stateful dashboard-subtitle; empty-states.
- §7 **поведінка**: діалог «Login as» (підтвердження + запис в audit); payment-failed
  алерт із дедлайном + кнопкою «Update payment method» → Billing.

## Підтверджені дані

**Плани підписки** (Included = Limit, usage — плейсхолдер 0):
Maker $10/mo (10 dev · 1 prod · 1M AI); Prototype $39 (50·1·2M);
Pilot $99 (100·1·4M +WL); Startup $299 (500·2·8M +WL); Business $499 (1,000·3·16M +WL).
Prototype + add-ons = $126/mo (1+2 prod, 2M+2M AI, Edge+Trendz).

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

## Відкриті питання / борг
- **Немає сторінки створення ліцензії.** «+ New license» (дашборд, Licenses,
  Portfolio) відкриває stub-модалку в **обох** флоу; в оверлейному флоу ТЗ хотіло
  «overlay with the create flow entry», але презентувати нічого — потрібна спільна
  сторінка-заготовка. Рішення за користувачкою.
- **Превʼю Invoices і Users на дашборді — статичні копії рядків** цих сторінок
  (Licenses-превʼю і фід уже беруть спільні джерела). Зміниш дані на сторінці —
  треба правити і превʼю.
- **Хронологія фіду суперечлива**: порядок задала користувачка (newest first), тож
  зверху «Subscription created», а нижче «Plan changed» — тобто підписку ніби
  створили після зміни плану. Виправляється переворотом масиву `ACTIVITY`.
- **`prototypeaddons` не має лінка у флоу**: у `PRODUCTS_V3` (product-first) такого
  рядка немає, тож сторінка досяжна лише через контекстний список у налаштуваннях —
  так вирішено свідомо («хай там і лежить»).
- **`AM`/`AMF` не знають про плани**: жорстко зашитий Prototype (BASE 39, incl
  1 prod / 2M AI). Відкривши «Manage» на Business — побачиш дані Prototype.
  Полагодити = перевести контролери на `PAGES`.
- **TBMQ не має детальних сторінок** — його рядки (variant 3, portfolio, дашборд)
  відкривають stub-модалку. ThingsBoard-рядки ведуть на реальні. (Viaanix прибрано.)
- **Дані окремих сторінок мокові й не звʼязані** між собою: Invoices/Activity/
  Users/дашборд мають власні набори, не похідні від `PAGES`. Números/дати не
  зведені в одну систему.
- **Search-інпути невізуальні** (лупа + placeholder, без фільтрації).
- **Заголовки списків**: `#licensesView` тепер **«Licenses»**; `#portfolioView`
  (архів) ще «Products».
- Дрібні свідомі рішення (можуть «повернутися» питанням): Users сортовані Created
  desc; Pending — attention-чип (заливка); у профільному меню лишено «Sign out».
- `.claude/launch.json` містить сесійний scratchpad-шлях (див. «Як запускати»).

## Файли
- `subscription-details-prototype.html` — **єдиний активний файл** прототипу.
- `subscription-details-wireframe.html` — вихідний драфт-референс, не редагуємо.
- `serve_prototype.py` (у scratchpad сесії) — статичний сервер + `www/`-дзеркало.
- `NOTES.md` — цей файл.
