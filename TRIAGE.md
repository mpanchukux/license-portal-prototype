# Triage — the debt, read by who has to act on it

**`NOTES.md` keeps 333 debt entries in one list, newest first. That list is a log: it
is ordered by when something was found, which is the one order that helps nobody decide what
to do.** This file is the same entries sorted by **who acts**.

**It is a view, not a second source.** Every title below is read out of `NOTES.md` by
`tools/triage.py`; only the category letters are stored. Re-run it after the debt list
changes and the titles cannot drift.

⚠️ **The titles stay in the language `NOTES.md` wrote them in, on purpose.** Translating them
here would make this a second source that silently disagrees with the first — which is the
exact failure this file exists to avoid. The framing is in English because `SCALES.md` and
`COMPONENTS.md` are, and because the categories are what a reader outside this session needs.

⚠️ **The numbers are POSITIONS in that list, newest first — they are not ids and they move.**
An entry added at the top shifts every number below it. Match on the title; use the number to
find the entry quickly, not to refer to it from anywhere else.

## What is here

| | | n |
|---|---|---:|
| **A** | Blocked — needs an answer before anyone writes code | 47 |
| **B** | Build it — and do not copy this | 115 |
| **C** | Prototype-local — a developer can ignore all of it | 69 |
| **D** | Design-system decision — not a developer's call | 57 |
| **E** | Closed | 45 |
| | **total** | **333** |

⚠️⚠️ **The honest headline: 47 entries block implementation and most of them are NOT design.**
They are unconfirmed prices, `inferred` version numbers, copy waiting for approval and 2
legal questions. **The redesign is further along than the facts it is drawn on.**

## ⚠️⚠️ The designer reading, which is the part worth arguing with

`SCALES.md` and `COMPONENTS.md` are the record for designers and developers both, so the same
entry can sit in two places depending on who picks it up. **These are the ones that move, and
the move is the finding** — not a second opinion about the same thing.

| # | entry | dev | designer | why it moves |
|---:|---|:---:|:---:|---|
| 41 | `ti-repeat` ×11 — `aria-hidden`, АЛЕ НЕСЕ ФАКТ ПРО АВТОПЛАТІЖ (2026-10-07). | B | **D** | a glyph marked decorative that sighted readers use as data is a question about what the mark should say, not about its colour |
| 42 | `.link` ×27 — ЄДИНИЙ МАРШРУТ ДО PRIVACY, TERMS І ЛІЦЕНЗІЙНОЇ УГОДИ (2026-10-07). | B | **D** | whether a link needs a cue beyond being a link is a design decision; the developer just needs to know it has none |
| 52 | КОНТРАСТ: ЧИСЛА ЗАМІРЯНІ, РІШЕННЯ НЕ УХВАЛЕНЕ (2026-10-07). | D | **A** | an undecided accessibility floor blocks handoff — for a developer it is not a preference to wait on |
| 54 | ОБХІД ПРЕДКІВ БРЕШЕ ПРО КОНТРАСТ НАД МЕШЕМ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ | C | **D** | a contrast checker that reads the wrong ground will certify the gradient as passing — the designer owns the surface it lies about |
| 60 | `.sg-item` не обрізає свій `.tablescroll` на телефоні (2026-10-07). | C | **D** | a specimen box that overflows its own border on a phone is the design system failing to show itself |
| 66 | Чіп має три висоти — 26 / 32 / 40 (2026-10-07). | D | **A** | three chip heights is a visible change nobody has decided — a developer needs the number |
| 68 | Фонова межа телефона написана двічі (2026-10-07). | D | **B** | one boundary written twice is a developer trap: two sources, one of them silently wrong |
| 76 | `Landing › Gradient` — ЄДИНЕ ВІДКРИТЕ ПОРІВНЯННЯ ДИЗАЙНУ (2026-10-07). | C | **A** | the last open design comparison — nothing can be handed over with three competing backgrounds |
| 80 | `320` У `shared.js:2085` НЕ МАЄ ЧИМ СТАТИ (2026-10-07). | D | **B** | a z-index with no layer to become is a developer decision at implementation time |
| 84 | ТОПБАР МАЄ ВЛАСНУ РОДИНУ КОНТРОЛІВ ПОЗА КОМПОНЕНТОМ КНОПКИ — ПИТАННЯ ДО ФАЗИ | B | **D** | the topbar's own control family is a component question before it is a fix |
| 115 | `mockInvoiceUrl` — ДРУГА СИСТЕМА ТИПОГРАФІКИ (2026-10-02). | D | **A** | a second type system in a generated document is a system question, not a page bug |
| 124 | ДВАНАДЦЯТЬ НЕЗАКРИТИХ ПОРІВНЯНЬ У СМУЗІ (аудит 2026-10-01). | C | **A** | twelve unclosed comparisons are twelve undecided designs, not prototype plumbing |
| 135 | Варіант 3 має ВЛАСНІ стопи й розмір (2026-10-01). | C | **D** | variant 3 carries its own stops: that is a design fact, now the shipped one |
| 145 | `licPlan: side` падає в `stacked` на ≤600 (2026-10-01). | D | **B** | side falling back to stacked at <=600 is the missing mobile treatment, which a developer must build |
| 165 | ЗЕЛЕНИЙ СТАТУС У ШАПЦІ ЛІЦЕНЗІЇ — 4.24:1 (заміряно 2026-09-30, пас 15). | B | **A** | 4.24:1 is a token value, not a page bug — the green has to change, which changes every surface |
| 167 | ПАНЕЛЬ ЛІЦЕНЗІЇ БІЛЬШЕ НЕ КАЖЕ НІЧОГО ПРО ТЕ, ЩО РОБИТИ З КЛЮЧЕМ, І БІЛЬШЕ НЕ | D | **A** | the panel no longer says what to do with the key: copy that has to exist before build |
| 174 | Специмена тулбара C у стайлгайді немає (2026-09-30). | C | **D** | a missing specimen is missing documentation of a shipped decision |
| 175 | НА ТЕЛЕФОНІ НЕМА ЖОДНОЇ ПОВЕРХНІ НАЛАШТУВАНЬ (2026-09-30, наслідок вибору). | C | **D** | no settings surface on the phone is a consequence of a layout choice |
| 180 | ЧЕРВОНА МАРКА НА INK — 3.35:1 (заміряно 2026-09-30, пас 13). | B | **A** | 3.35:1 on ink: same, and it is the one place colour carries tone alone |
| 181 | В INK-ФОРМІ НА ПАНЕЛІ ЛІЦЕНЗІЇ ТОН НЕСЕ ТІЛЬКИ КОЛІР (2026-09-30, пас 13). | B | **A** | tone carried by colour alone breaks the rule the system states about itself |
| 182 | Специмени банерів у стайлгайді написані літеральними `tone-*` і не слухають | C | **D** | specimens written as literals document a scale the product no longer has |
| 185 | СТАТУС НА КАРТЦІ ІНВОЙСА: РЕФЕРЕНС ПРОСИТЬ ПІЛЮЛЮ, СТОЇТЬ КОМПОНЕНТ (2026-09-30). | B | **D** | reference asks for a pill, the component is there: which one wins is a design call |
| 189 | ЛІД БАНЕРА ПАНЕЛІ НЕ ПРОХОДИТЬ AA: 4.48:1 (заміряно 2026-09-30). | B | **A** | 4.48:1 on the panel lead — a type/colour pairing decision before it is a fix |
| 190 | ТЕМНОЇ ТЕМИ НЕМАЄ, І ЦЕ ТЕПЕР НАЗВАНО (2026-09-30). | D | **A** | no dark theme at all: for a developer a non-requirement, for a designer an unanswered half of the system |
| 213 | Заголовок секції карткової розкладки — 20px, референс просить 24. | B | **D** | 20px against a reference asking ~24 is a scale decision, not a defect |
| 232 | `.plantable` — обрамлена таблиця на 69% ширини секції (записано 2026-09-27). | B | **D** | a framed table at 69% of the section is a layout decision that was never taken |
| 240 | `.infoic` чекає на власний компонент. | B | **D** | the info icon is waiting for a component, which is this phase's work |
| 241 | 22 `<button class="link">` поза кнопкою — текст усередині речень. | B | **D** | 22 button.link outside the component is the boundary of the button model |
| 246 | Варіант B на телефоні не стилізований — свідомо, показаний «як є» на прохання. | C | **D** | an unstyled variant cannot be compared, so the comparison cannot close |
| 251 | КОНТРАСТ: чотири рядки нижче AA, усі `--mid` `#6b6b6b` 14px, усі лише В СПОКОЇ. | B | **A** | four lines below AA, all --mid at 14px: one token, every surface |
| 256 | Десять брейкпоінтів, а ноутси кажуть «один ≤600px»: 600, 601, 640, 700, 760, 820, | B | **A** | ten breakpoints against a documented one: the developer builds from whichever list is true |
| 306 | Колонкові заголовки на Home просили «зменшити, але ≥14px» — а 14px і є поточне | B | **D** | 'smaller but >=14px' is the floor the scale already sets |

**The shape of it, in one line each:**

- **Contrast is the big one, and it is not five bugs.** Five entries sit in B for a developer —
  a line fails AA, fix the line. For a designer all five are **A**, and they are not five
  separate problems: **three are token VALUES** (`--status-ok` at 4.24:1, `--status-alert` at
  3.35:1, `--mid` at 14px across four lines), **one is a type/colour pairing** (the panel
  banner's lead at 4.48:1) and **one is the system contradicting its own rule** — tone carried
  by colour alone, where the page says colour is never the only carrier. Changing a token
  changes every surface it reaches, so the order matters: **decide the values, then re-measure
  the lines.**
- **An undecided design is not plumbing.** `Landing › Gradient` and the twelve unclosed
  comparisons read as prototype settings to a developer and as **unfinished work** to a designer.
  Nothing can be handed over while a surface has three competing versions and no winner.
- **A missing specimen is missing documentation**, not a nice-to-have: toolbar C ships and the
  styleguide shows A and B.
- **And two move the other way.** `licPlan: side` with no mobile treatment, and a boundary
  written twice (`--bp-phone` plus nine hard-coded `matchMedia`): a designer reads both as
  recorded decisions, a developer reads them as **two sources of truth, one of which is
  silently wrong.**

---

## A · Blocked — needs an answer before anyone writes code

Product, data, copy or legal questions. The prototype shows a shape; it does not know the real value, the confirmed price, the approved sentence or the legal answer. **A developer who implements these as they stand ships a guess.**

**Routed by who answers it.** None of these is a design question, and none was
attempted here.

| owner | n | what the bucket means |
|---|---:|---|
| **product** | 16 | a decision about what the portal does or shows |
| **engineering** | 11 | a data or release fact the prototype guessed |
| **copy** | 10 | a sentence waiting for approval, or missing entirely |
| **pricing** | 6 | a number nobody has confirmed in writing |
| **design** | 2 | a team decision, twice deferred |
| **legal** | 2 | questions that are not ours to answer |

| # | owner | entry | |
|---:|---|---|---|
| 201 | copy | ПРОДУКТ БІЛЬШЕ НІДЕ НЕ КАЖЕ, ЩО КЛЮЧ ВВОДИТЬСЯ В ThingsBoard АБО TBMQ |  |
| 245 | copy | ФАКТ ПРО 12 МІСЯЦІВ ОНОВЛЕНЬ НЕ СКАЗАНИЙ НІДЕ НА ПРОДАВАЛЬНІЙ ПОВЕРХНІ. |  |
| 274 | copy | `TAX_NOTE` — копірайт очікує підтвердження команди. |  |
| 276 | copy | Опису не мають: `assets`, `sessions`, `msg/sec`. |  |
| 279 | copy | `WL_DESC` — `inferred` копірайт, чекає підтвердження. |  |
| 286 | copy | «Вся ліцензія блокується» за перевищення ліміту інстансів — ПОПЕРЕДНЄ формулювання. |  |
| 297 | copy | Формулювання маркера для заблокованої ліцензії. |  |
| 298 | copy | Речення про датування терміну оновлень — відкритий конфлікт. |  |
| 322 | copy | Голос активності виконаний не повністю (2026-09-24, девʼятий батч). |  |
| 329 | copy | Чотири константи копірайту лишились у `data.js` без жодного читача. |  |
| 24 | design | ГАЛКИ КАРТОК ПЛАНІВ І ІКОНКИ CAPACITY/ADD-ONS: ПОВІДОМЛЕНІ ЯК ЗНИКЛІ, ЗАМІРОМ НА |  |
| 291 | design | КОЛІР ПОМИЛКИ проти монохрому — рішення за командою, двічі відкладене. |  |
| 272 | engineering | Auth-форми нічого не перевіряють (див. |  |
| 277 | engineering | Адресний блок на Billing у новому акаунті показує чужу адресу — ВСЕ ЩЕ ВІДКРИТЕ. |  |
| 281 | engineering | Пояснення про оновлення недосяжне на телефоні. |  |
| 284 | engineering | ВІДКРИТЕ ПИТАННЯ, і 2026-09-22 воно стало конкретнішим: яку ВЕРСІЮ ThingsBoard |  |
| 294 | engineering | `LATEST_VERSION = '3.9.4'` і версії інстансів — `inferred`. |  |
| 300 | engineering | `Forgot password?` — стаб. |  |
| 314 | engineering | Причини провалу перевірки — три, і це стеля даних. |  |
| 315 | engineering | `CHECK_WINDOW_DAYS = 3` — `inferred`. |  |
| 323 | engineering | Пʼять засіяних шейпів досі без живого писача (2026-09-24, інвентар активності): |  |
| 324 | engineering | Два формати таймстемпа в сирці: `Aug 17 2026, 16:20` у data.js проти |  |
| 325 | engineering | `PRODUCT_CHOICES[].ic` став фолбеком, який ніколи не спрацьовує. |  |
| 285 | legal | ВІДКРИТЕ ПИТАННЯ (записано 2026-09-18, §12): ліцензійна угода в футері — загальна. |  |
| 299 | legal | Чи потрібна юридична згода в Change plan / Manage add-ons. |  |
| 270 | pricing | «From $X / mo» у прототипі НЕМАЄ. |  |
| 288 | pricing | `UPDATES_RENEW_RATE = 0.40` не підтверджений документом — теж усна цифра. |  |
| 289 | pricing | Ціни на «вільні» девайси перпетуала немає. |  |
| 293 | pricing | `COUPON_RATE = 0.20` і саме правило купона — стаб. |  |
| 308 | pricing | Докупка AI на перпетуалі: разова ціна за місячну квоту. |  |
| 309 | pricing | NL-флоу — inferred ціни: perp-юніти (TB prod $1,999 / AI $500 / TBMQ prod $999) |  |
| 212 | product | ЛІЧИЛЬНИК RECENT ACTIVITY — ВІДКРИТЕ РІШЕННЯ (2026-09-29). |  |
| 257 | product | У TBMQ немає плану «Business». |  |
| 258 | product | «Updates period over» на Home не показується і з теперішньою пʼятіркою не може: |  |
| 259 | product | Free-рядок показує «—» у колонці стану. |  |
| 268 | product | ВІДКРИТЕ РІШЕННЯ: що робити з ліцензіями на Maker / Prototype в датасеті. |  |
| 269 | product | Change plan на legacy-плані не має якоря. |  |
| 275 | product | Блок `Included in every plan` для TBMQ ЗНЯТО 2026-09-22, не заповнено. |  |
| 280 | product | `Enabled` для White labeling сьогодні недосяжний з даних. |  |
| 282 | product | Info-іконка покриває два рядки з шести. |  |
| 304 | product | `Renew subscription` на скасованій — secondary, хоч це єдина дія зони 4. |  |
| 305 | product | Сортування колонок — тепер ЄДИНИЙ контрол, який видимо реагує й нічого не |  |
| 313 | product | ВІДКРИТЕ: чи показує Home перевірки інстансів. |  |
| 321 | product | Заголовок групи на Change plan. |  |
| 326 | product | ВІДКРИТЕ (2026-09-24, сьомий батч): `Renew software updates` не їде на шеллі |  |
| 327 | product | ВІДКРИТЕ (2026-09-24, восьма правка): лічильник банера і список, куди він веде, |  |
| 328 | product | Дві перпетуальні картки описані по-різному (2026-09-24, шоста правка). |  |

---

## B · Build it — and do not copy this

The surface is decided. These are defects measured in the prototype: overflow, contrast, a wrong `aria-label`, a rule that wins by position, a token used without being declared. **Read as: this is what the prototype does wrong at this spot.** Several are one-line fixes in a real build and exist here only because the prototype is hand-written CSS.

| # | entry | |
|---:|---|---|
| 4 | НЕПРОЗОРА ЗАЛИВКА ДИСКА ✕ — ТРЕТІЙ ВИПАДОК «ЗНАЧЕННЯ ПІД ОДИН ФОН», І ЄДИНИЙ |  |
| 10 | `.5px` НЕ ПЕРЕВІРЕНА НА 1x ЕКРАНІ (2026-10-09). |  |
| 11 | ОБГОРТКОВИЙ СПАН ЛЕЙБЛА ЧІПА ДІСТАВСЯ `+ Add label` (2026-10-09). |  |
| 12 | `.perbtn` ЗНОВУ НЕСЕ НЕПРОЗОРУ СІРУ ЗАЛИВКУ, І ЦЕ СВІДОМО (2026-10-08). |  |
| 16 | ВІДМОВИ `button()` ДЛЯ `menu` ЖИВУТЬ У ДВОХ МІСЦЯХ (`shared.js:230` і `:343`, |  |
| 29 | `--accent-soft` — ПЕРШИЙ `color-mix` У ПРОДУКТОВОМУ ПРАВИЛІ (2026-10-08). |  |
| 32 | `Sign in` У ПУБЛІЧНІЙ ШАПЦІ — СІРИЙ НА `--page-bg` (заміряно 2026-10-08). |  |
| 41 | `ti-repeat` ×11 — `aria-hidden`, АЛЕ НЕСЕ ФАКТ ПРО АВТОПЛАТІЖ (2026-10-07). | → **D** for a designer |
| 42 | `.link` ×27 — ЄДИНИЙ МАРШРУТ ДО PRIVACY, TERMS І ЛІЦЕНЗІЙНОЇ УГОДИ (2026-10-07). | → **D** for a designer |
| 67 | `.pagetitlerow` губить підпис `Buy a license` на телефоні (2026-10-07). |  |
| 78 | `?from` у посиланнях на ліцензію більше ніхто не читає (2026-10-07). |  |
| 82 | ІКОНКИ-КНОПКИ ВИРОСЛИ ПО ВСЬОМУ ПРОДУКТУ, І ЗВІТ ПРО ПАС ЦЬОГО НЕ НАЗВАВ |  |
| 84 | ТОПБАР МАЄ ВЛАСНУ РОДИНУ КОНТРОЛІВ ПОЗА КОМПОНЕНТОМ КНОПКИ — ПИТАННЯ ДО ФАЗИ | → **D** for a designer |
| 87 | `.insttoolbar.stickybar` ОГОЛОШУЄ `z-index:12` НА `position:static` ЕЛЕМЕНТІ |  |
| 88 | Візард парує `Billing email` з `Company name` у вужчій колонці (2026-10-06). |  |
| 90 | СМУГА 601–952: ЦИФРИ ЗАМІРЯНІ 2026-10-06, ПОЧИНАТИ З НИХ, А НЕ З «ВОНО |  |
| 91 | ОБГОРТКА, ЯКУ НІХТО НЕ МІРЯЄ, НЕ РОБИТЬ НІЧОГО (знайдено 2026-10-06). |  |
| 92 | Recent invoices на Home: обгортка — СТОПГЕП, не лік (2026-10-06). |  |
| 107 | ТАБЛИЦЯ ІНВОЙСІВ ЛАМАЄ НОМЕР І ДАТУ НАДВОЄ НА 944 (заміряно 2026-10-01). |  |
| 108 | Переповнення топбара на `index` стало на 5px гіршим (заміряно 2026-10-01). |  |
| 117 | Чіпи add-on'ів переносять текст на вузькому десктопі (2026-10-02). |  |
| 118 | Кнопка Copy у рядку ключа переноситься на другий рядок — на 0.7px (заміряно |  |
| 119 | `.licc-label` оголошує `white-space:nowrap`, а діє `normal` (заміряно 2026-10-02). |  |
| 120 | Пошук в Activity не бачить подій, яких немає в завантаженій сторінці (2026-10-02). |  |
| 127 | Засіяна подія `license.labeled` у вже збереженому сторі не має деталі (2026-10-01). |  |
| 132 | ТОПБАР ПЕРЕПОВНЮЄ ВІКНО ВІД 601 ДО 1150px (заміряно 2026-10-01). |  |
| 136 | ДУБЛЬОВАНИЙ `id` — КЛАС ВАДИ, ЯКИЙ НІЩО НЕ СТЕРЕГЛО ДО 2026-10-01. |  |
| 137 | `sgWizStep` дублюється у `styleguide.html`. |  |
| 138 | Тінь табів панелі ліцензії полагоджена, але не побачена в дії (2026-10-01). |  |
| 139 | Під баром тепер і волосина, і тінь (2026-10-01). |  |
| 140 | ЧОТИРИ LIST-ТУЛБАРИ СТАЛИ ДВОМА ПОВЕДІНКАМИ ПОШУКУ (2026-10-01). |  |
| 142 | Обидва тригери C у спокої читаються `All 17` (2026-10-01). |  |
| 143 | `Show N licenses` і пейджер рахують різне (2026-10-01). |  |
| 144 | ПАНЕЛЬ ЛІЦЕНЗІЇ ШИРША ЗА ТЕЛЕФОН НА 51px (заміряно 2026-10-01). |  |
| 146 | ПʼЯТИЙ ВИПАДОК «ПРАВИЛО ПЕРЕМАГАЄ ПОЗИЦІЄЮ» (2026-10-01, друга сесія). |  |
| 147 | Рядок колонок не липне, поки таблиця скролиться вбік (2026-10-01). |  |
| 148 | Лічильник у заголовку більше не ділить базову лінію з ним (2026-10-01). |  |
| 149 | `.inst-hint` лишився з опт-аутом, якого нікому застосовувати (2026-10-01). |  |
| 150 | Чіп Activity рахує згорнуті прогони за один (2026-10-01). |  |
| 151 | ТОНОВАНИЙ ВИГЛЯД БАНЕРА І ВИГЛЯД `ink` ТЕПЕР РОЗРІЗНЯЮТЬ РІЗНУ КІЛЬКІСТЬ СТАНІВ |  |
| 152 | `.fi-mark` виріс до 30px, а відступи фіда під нього не переглядались |  |
| 153 | Мультиселект-рядок більше не `menuitemcheckbox` — це `<label>` з нативним |  |
| 154 | `.fs-screen .am-celltop` ТЕПЕР ТРЕТІЙ ВИПАДОК ТОГО САМОГО ПЕРЕВИЩЕННЯ СКОУПУ |  |
| 161 | `.fs-screen .infoic{24px}` ДОТЯГУЄТЬСЯ ДАЛІ, НІЖ ЙОГО НАМІР (знайдено 2026-10-01). |  |
| 162 | Значення ключа сидить на 5.2px нижчій базовій лінії за три сусідні (2026-10-01). |  |
| 163 | `secondary` на білому банері алерта — правило без сьогоднішнього читача |  |
| 164 | Зона картки Home виросла на 5px (2026-10-01): дівайдер y93→y98, картка |  |
| 165 | ЗЕЛЕНИЙ СТАТУС У ШАПЦІ ЛІЦЕНЗІЇ — 4.24:1 (заміряно 2026-09-30, пас 15). | → **A** for a designer |
| 166 | ТРЕТІЙ РІД КОЛІЗІЇ ПРАВИЛ, І ЙОГО ВАРТО ШУКАТИ ГРЕПОМ (знайдено 2026-09-30). |  |
| 168 | МОДАЛКА І СТОРІНКА ЛІЦЕНЗІЇ ТЕПЕР РОЗХОДЯТЬСЯ В ҐРУНТІ АЛЕРТА (2026-09-30). |  |
| 169 | Прогрес у степері тихіший, ніж був (2026-09-30). |  |
| 170 | `Payment` як заголовок картки Review — `inferred` копірайт (2026-09-30). |  |
| 171 | Заголовки кроків Capacity/Add-ons і секційні лейбли розрізняються вже не кеглем |  |
| 172 | Крапка-роздільник на картці ліцензії Home схована на ≤600 (2026-09-30). |  |
| 173 | Чіп `Stale` зʼявився на телефоні, і його там ніхто не проєктував (2026-09-30). |  |
| 176 | Три групи на Licenses дають рядок табів у три лінії (заміряно 2026-09-30). |  |
| 180 | ЧЕРВОНА МАРКА НА INK — 3.35:1 (заміряно 2026-09-30, пас 13). | → **A** for a designer |
| 181 | В INK-ФОРМІ НА ПАНЕЛІ ЛІЦЕНЗІЇ ТОН НЕСЕ ТІЛЬКИ КОЛІР (2026-09-30, пас 13). | → **A** for a designer |
| 183 | Дві картки в ряд зупиняються на 900, і це моє судження, не число із запиту |  |
| 184 | Скидання треку на першу картку після дисміса тепер помітніше (запис від того ж |  |
| 185 | СТАТУС НА КАРТЦІ ІНВОЙСА: РЕФЕРЕНС ПРОСИТЬ ПІЛЮЛЮ, СТОЇТЬ КОМПОНЕНТ (2026-09-30). | → **D** for a designer |
| 186 | Два дівайдери на картці інвойса розрізняються лише вставкою (2026-09-30). |  |
| 187 | Роздільна розкладка банера не анімує перехід між картками (2026-09-30). |  |
| 188 | Після дисміса картки трек стає на першу (2026-09-30). |  |
| 189 | ЛІД БАНЕРА ПАНЕЛІ НЕ ПРОХОДИТЬ AA: 4.48:1 (заміряно 2026-09-30). | → **A** for a designer |
| 191 | Марка банера розходиться між Home і панеллю (2026-09-30). |  |
| 192 | РЕЙЛ КРОКІВ НЕ ЦЕНТРОВАНИЙ У СМУЗІ, І ЦЕ ВПИРАЄТЬСЯ В ЗАПИСАНЕ РІШЕННЯ |  |
| 193 | ЧІПА КІЛЬКОСТІ НА `Invoices` І `Activity` НЕМАЄ ВЗАГАЛІ (2026-09-30). |  |
| 194 | `#backBtn` у шапці ліцензії — мертва кнопка з голим гліфом `←` (знайдено |  |
| 196 | На телефоні заголовок кроку налазить на ✕ у шапці візарда. |  |
| 197 | У ТАБЛИЦІ Licenses ГЛІФ СТАТУСУ (16) І МАРКА ВЕРСІЇ (20) ДОСІ РІЗНОГО РОЗМІРУ |  |
| 198 | Гліф статусу в панелі сидить на 1.7px нижче оптичного центру слова, марка версії — |  |
| 199 | Продукт більше ніде не каже «no instance has checked in yet» банером (2026-09-30). |  |
| 202 | `Next charge` у варіанті B зони дублює картку `Next charge` нижче. |  |
| 204 | НА ТЕЛЕФОНІ ВЕСЬ БЛОК КЛЮЧА СТОЇТЬ НАД НАЗВОЮ ЛІЦЕНЗІЇ, І ВЕСЬ `order` |  |
| 205 | На сторінці ліцензії жолоб back-кнопки лишився порожнім (2026-09-29). |  |
| 206 | ВІЗАРД НЕ СКЛАДАЄТЬСЯ В ОДНУ КОЛОНКУ НА ТЕЛЕФОНІ — кроки Capacity і Add-ons |  |
| 207 | Три рядки інвойсів у 600px рамці карткової розкладки (2026-09-29). |  |
| 209 | `Full page` І `Shared link` ТЕПЕР РІЗНЯТЬСЯ ОДНІЄЮ РІЧЧЮ (2026-09-29). |  |
| 211 | ПРАВИЛО, ЯКЕ ПРОГРАЄ, АЛЕ ЗБІГАЄТЬСЯ ЗНАЧЕННЯМ, — ЦЕ ТИХИЙ БОРГ. |  |
| 213 | Заголовок секції карткової розкладки — 20px, референс просить 24. | → **D** for a designer |
| 214 | `✎ Add label` (картка Home) проти `+ Add label` (деталі ліцензії) — два написання |  |
| 215 | `aria-label` РЯДКА І КАРТКИ КАЖЕ `status: Active` ТАМ, ДЕ ВИДНО `Blocked`. |  |
| 217 | Карткова розкладка не має телефонного чергування поверхонь. |  |
| 220 | ТОПБАР ПЕРЕПОВНЮЄТЬСЯ МІЖ 600 І 1100px (заміряно 2026-09-29). |  |
| 225 | Лічильники двох тулбарів Licenses рахують РІЗНЕ — A фасетно, B по акаунту. |  |
| 227 | `.authscreen .fs-header` лишилась прозорою, коли решта шапок діалогів стала |  |
| 229 | ЛИПКИЙ КОЛОНКОВИЙ РЯДОК НЕ ЛИПНЕ, КОЛИ ТАБЛИЦЯ ЇДЕ ВБІК (заміряно 2026-09-28). |  |
| 232 | `.plantable` — обрамлена таблиця на 69% ширини секції (записано 2026-09-27). | → **D** for a designer |
| 234 | Біла підкладка під заокругленим кутом голови таблиці (`thead th::before`) |  |
| 235 | `[hidden]` ЛАМАЄТЬСЯ ЩОРАЗУ, КОЛИ КОМПОНЕНТ ДІСТАЄ `display` — І ЦЕ ВЖЕ |  |
| 237 | `Instance renamed to {entity}` проти пункту меню `Edit label`. |  |
| 239 | МЕРТВЕ ПРАВИЛО НЕ ІНЕРТНЕ, КОЛИ ЙОГО ІМʼЯ ОЧЕВИДНЕ (2026-09-29). |  |
| 240 | `.infoic` чекає на власний компонент. | → **D** for a designer |
| 241 | 22 `<button class="link">` поза кнопкою — текст усередині речень. | → **D** for a designer |
| 248 | `--accent` задано, а не виведено. |  |
| 249 | `assets/logo.svg` і `tools/build-logo.py` більше нічим не читаються — вордмарк |  |
| 251 | КОНТРАСТ: чотири рядки нижче AA, усі `--mid` `#6b6b6b` 14px, усі лише В СПОКОЇ. | → **A** for a designer |
| 252 | `--ic-30` і `--ic-44` НЕ ОГОЛОШЕНІ, і використовуються без фолбека (`.iconbutton`, |  |
| 253 | `--t-h3-fs` теж не оголошений, але має фолбек `18px`, тож працює. |  |
| 254 | `--pg-start` і `--pg-cols` пишуться щоразу і не читаються ніким: CSS перейшов на |  |
| 255 | `--s-own` — колізія імені: 10px у `#nlStepPick`, 16px у `.setgrid`, різні селектори, |  |
| 256 | Десять брейкпоінтів, а ноутси кажуть «один ≤600px»: 600, 601, 640, 700, 760, 820, | → **A** for a designer |
| 260 | Альтернатива `--page-bg` не перевірена на екрані. |  |
| 261 | `corner-shape:squircle` діє лише в Chrome 139+. |  |
| 283 | Дублікати id, коли модалка деталей відкривається ПОВЕРХ сторінки деталей. |  |
| 290 | ВІДКРИТЕ: Home — 2.93 екрана на телефоні (записано 2026-09-18, §14). |  |
| 295 | Розкладка пʼяти планових карток на 390 — рішення за користувачкою. |  |
| 296 | Крок Capacity на 390 — 1.47 екрана. |  |
| 302 | `renderLicenseAlert` малює порожній банер, якщо забути `.amsg` — і взагалі |  |
| 306 | Колонкові заголовки на Home просили «зменшити, але ≥14px» — а 14px і є поточне | → **D** for a designer |
| 311 | Три варіанти степера в дизайн-системі ТЗ просило показати всі три; варіанти |  |
| 318 | `Deactivate` ставить `i.active = false`, і ніщо це поле не читає у фільтрах. |  |
| 330 | Назва перпетуала у візарді лягає в ТРИ рядки (2026-09-24, перший батч). |  |
| 331 | `max-width:62ch` знято з підказки Instances (2026-09-24, восьма правка) — ТЗ просило |  |

---

## C · Prototype-local — a developer can ignore all of it

The measurement harness, the mirrors, the checkers, the settings bar, seeded demo data, publishing. **None of it exists in the product.** It is here because the next session needs it, not because anyone implements it.

| # | entry | |
|---:|---|---|
| 3 | `#overlay` СИДИТЬ НА `--z-toast`, ЩОБ ПЕРЕКРИТИ ВІЗАРД, І ЙОГО КОМЕНТАР ЦЕ ВИЗНАЄ |  |
| 14 | ҐАРД ПРАВИЛА 9 НЕ БАЧИТЬ ПЕРЕСТАНОВКИ ДІТЕЙ (2026-10-08). |  |
| 28 | ЗАПИС «ОДНЕ ЗНАЧЕННЯ, ЧОТИРИ МІСЦЯ» ПРО `--accent` БУВ НЕПРАВДОЮ (виправлено |  |
| 34 | `.emptybox.eb.on-tint` НЕ ТРИМАЄ ЖОДНОЇ КНОПКИ В ЗАМІРЯНИХ СТАНАХ (2026-10-08). |  |
| 37 | `.billcard.nl-paycard.on-tint` РАНТАЙМОМ НЕ ПІДТВЕРДЖЕНИЙ (2026-10-08). |  |
| 38 | `font-weight` НА `<use>` НЕСТАБІЛЬНИЙ У ЦІЙ ПАНЕЛІ (2026-10-07). |  |
| 44 | `--text-inactive` — сім правил, і жодне не відрендерилось у заміряному датасеті |  |
| 45 | `--surface-quiet` 4.471 — записано й закрито (2026-10-07). |  |
| 47 | СКАН КОНТРАСТУ МУСИТЬ ЧИТАТИ ТОКЕНИ З `:root`, А НЕ ЗНАТИ ЇХ HEX |  |
| 49 | Пілюля нижньої навігації ловиться в середині транзиції (механізм, 2026-10-07). |  |
| 50 | `.tablescroll` недетерміновано дістає `.is-scrollable` (2026-10-07). |  |
| 54 | ОБХІД ПРЕДКІВ БРЕШЕ ПРО КОНТРАСТ НАД МЕШЕМ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ | → **D** for a designer |
| 56 | Банери `over_limit` / `updates_*` / `canceled` недосяжні з датасету `dashB` за |  |
| 58 | `OPENERS.usersModal` ДО МОДАЛКИ НЕ ДОХОДИТЬ (2026-10-07). |  |
| 59 | `invoices.html@768` недетермінований на переповненні (2026-10-07). |  |
| 60 | `.sg-item` не обрізає свій `.tablescroll` на телефоні (2026-10-07). | → **D** for a designer |
| 61 | Номери в `TRIAGE.md` — ПОЗИЦІЇ, не id (2026-10-07). |  |
| 62 | Категорії в `tools/triage.py` — це судження, і воно ревізується (2026-10-07). |  |
| 71 | `sweep.js` НЕ БАЧИТЬ МЕШУ ВЗАГАЛІ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ |  |
| 72 | ТРИ `background-image` МЕШУ СЕРІАЛІЗУЮТЬСЯ ЯК `color(srgb …)` (2026-10-07). |  |
| 73 | Дизер градієнта розійшовся на ±1/255 у 0.125% каналів (2026-10-07). |  |
| 76 | `Landing › Gradient` — ЄДИНЕ ВІДКРИТЕ ПОРІВНЯННЯ ДИЗАЙНУ (2026-10-07). | → **A** for a designer |
| 77 | ГРУПА 2 `DEAD.md` ПІД ПІДОЗРОЮ ТАМ, ДЕ КЛАС ПИШЕТЬСЯ ЛИШЕ ПІД НЕДЕФОЛТНИМ |  |
| 79 | `.faq-cat` — ДІРА В ЦЕНЗІ МЕРТВОГО, ЗНАЙДЕНА ПАСОМ ПРО ТОВЩИНУ РАМКИ |  |
| 96 | ЗАМІР КЕРУЄ РИШТУВАННЯМ, А НЕ УСПАДКОВУЄ ЙОГО (2026-10-02). |  |
| 100 | `csscheck.py` не бачить зіпсованих коментарів (2026-10-02). |  |
| 101 | `MODALS.md` §3.2 і §3.3 описують версію з `flex-wrap` (2026-10-02) — у файлі є |  |
| 102 | −53px на 944 у модалі заміряно й не пояснено (2026-10-02). |  |
| 103 | Згрупований режим інстансів і `tableframe`/`mesh` не в сітці мертвих селекторів |  |
| 104 | Модалка авторизації не в сітці заміру (2026-10-02) — їй потрібна сесія `out`, а |  |
| 105 | 15 із 16 діалогів спільного `#overlay` не міряні (2026-10-02). |  |
| 106 | БЛОК «ФАЙЛИ» І СПИСОК СТОРІНОК РОЗХОДИЛИСЬ ІЗ РЕПОЗИТОРІЄМ У ПʼЯТИ МІСЦЯХ |  |
| 112 | Одинадцять ролей позначені непевними (2026-10-02), найспірніша — `.field > label` |  |
| 116 | 559 — стверджене число, виведене з заміру (2026-10-02, другий пас). |  |
| 121 | `data-tableframe` лишився константою (2026-10-01). |  |
| 122 | Ключі `licBar`, `licTable`, `licZone`, `licPlan`, `homeBlocks`, `bannerLayout`, |  |
| 124 | ДВАНАДЦЯТЬ НЕЗАКРИТИХ ПОРІВНЯНЬ У СМУЗІ (аудит 2026-10-01). | → **A** for a designer |
| 125 | `Payment` і `Credit` стоять на `landing` і `signin` (аудит 2026-10-01) — білінг |  |
| 126 | Три роди контролів лежать в одному ряду: дані · порівняння · навігація. |  |
| 129 | `signin.html` не має жодного посилання В ПРОДУКТІ, окрім осі в смузі налаштувань. |  |
| 133 | Прогін сторінок міряв ДВІ ширини, 1280 і 375 — рівно ті, де все гаразд. |  |
| 134 | 25 повторно оголошених класів не прочитані (2026-10-01). |  |
| 135 | Варіант 3 має ВЛАСНІ стопи й розмір (2026-10-01). | → **D** for a designer |
| 174 | Специмена тулбара C у стайлгайді немає (2026-09-30). | → **D** for a designer |
| 175 | НА ТЕЛЕФОНІ НЕМА ЖОДНОЇ ПОВЕРХНІ НАЛАШТУВАНЬ (2026-09-30, наслідок вибору). | → **D** for a designer |
| 177 | `instView` лишився поза системою — світч на тулбарі Instances, а не таб смуги. |  |
| 178 | `Purchase` не показується на лендінгу, хоч звідти можна почати покупку: `when` |  |
| 179 | `settingsContext()` лишився з попереднім імʼям, хоч панелі налаштувань уже нема. |  |
| 182 | Специмени банерів у стайлгайді написані літеральними `tone-*` і не слухають | → **D** for a designer |
| 203 | Видимість усередині модалки не можна міряти `offsetParent` — він `null` для всього |  |
| 208 | Ліниву дозавантажку фіда не перевірити в цій панелі — і ніколи не було можна. |  |
| 210 | Розгорнута смуга станів накриває останні 176px сторінки (2026-09-29, за запитом). |  |
| 216 | Група `Table frame` лишається в ⚙ і на Home з картками, де жодної таблиці нема. |  |
| 223 | Смуга станів знає лише дві поверхні. |  |
| 224 | ЧЕКЕР ІКОНОК НЕ ЗНАЄ ЧЕТВЕРТОГО НАПИСАННЯ: HTML-СУТНОСТІ СТРІЛКИ. |  |
| 228 | Запит пошуку не переживає свап тулбарів Licenses — свідомо (див. |  |
| 238 | `--bg` більше не ґрунт жодної поверхні (2026-09-28). |  |
| 244 | Пропущені перевірки — додані ДЕМО-ДАНІ (2026-09-25). |  |
| 246 | Варіант B на телефоні не стилізований — свідомо, показаний «як є» на прохання. | → **D** for a designer |
| 250 | `AUDIT.md` застарів. |  |
| 262 | `AUDIT.md` List C — 37 кластерів і жодного рішення. |  |
| 264 | `prototypeaddons` не має лінка у флоу: у датасетах такого рядка немає, тож |  |
| 301 | Log in не чіпає `billingData`. |  |
| 307 | Дрібні свідомі рішення (можуть «повернутися» питанням): Users сортовані Created |  |
| 310 | `.claude/launch.json` містить сесійний scratchpad-шлях (див. |  |
| 316 | Специмен `#groupedcheck` у стайлгайді розходиться з продуктом: `feedGroupItem` кладе |  |
| 317 | Мертвий коментар у `styles.css` перед блоком `.acttypemenu`: абзац про «chips … |  |
| 332 | GitHub Pages — опубліковано. |  |
| 333 | Claude-артефакт — друга, приватна копія (2026-09-16, оновлено 2026-09-24): |  |

---

## D · Design-system decision — not a developer's call

Open questions about the system itself: which scale a value collapses to, whether a form is a variant, what an axis means. **The answer goes into `SCALES.md` or `COMPONENTS.md` first, and reaches code from there.**

| # | entry | |
|---:|---|---|
| 1 | `.nl-prodcard` ТЕПЕР ПІДНІМАЄТЬСЯ НА ХОВЕРІ Й СІРІЄ НА НАТИСКУ (2026-10-09). |  |
| 2 | СТЕПЕР І КАРТКИ ADD-ON'ІВ ВІДПОВІДАЮТЬ НА ВКАЗІВНИК РІЗНИМИ МЕХАНІЗМАМИ (2026-10-09). |  |
| 5 | ЧОТИРИ КЕБАБИ СТАЛИ ТРЬОМА (2026-10-09). |  |
| 6 | `--hover` `#f0f0ee` ЛИШАЄТЬСЯ У 30 ПРАВИЛАХ (2026-10-09). |  |
| 7 | ВИБРАНИЙ ADD-ON НЕ ВІДПОВІДАЄ НА ВКАЗІВНИК (2026-10-09). |  |
| 8 | РАМПА SECONDARY ТЕПЕР 0 / .04 / .14 (2026-10-09). |  |
| 9 | ТРИ МЕТРИКИ UBUNTU СТОЯТЬ ЛІТЕРАЛАМИ В `calc()` ЯКОРЯ ЛІЧИЛЬНИКА (2026-10-09). |  |
| 13 | `--sel` `#e4e4e0` ЛИШАЄТЬСЯ ТЕПЛИМ СІРИМ У СЕМИ ПРАВИЛАХ (2026-10-08). |  |
| 15 | `.btn--menu` — ЦЕ GHOST ІНШОГО РОЗМІРУ, І ЗГОРТАТИ ЙОГО ЧИ НІ — ВІДКРИТЕ (заміряно |  |
| 21 | `.btn--menu` НЕ НАКРИТИЙ НОВИМ ОПИСОМ SECONDARY (2026-10-08). |  |
| 25 | ДОВЖИНУ `Instance ID` НЕ СКОРОЧЕНО (2026-10-08). |  |
| 27 | СПИСКИ ІНВОЙСІВ І АКТИВНОСТІ В МОДАЛЦІ ЛІЦЕНЗІЇ ВСЕ ЩЕ ЙДУТЬ ВПРИТУЛ (2026-10-08). |  |
| 30 | ДВІ РУНГИ ЗАМІСТЬ ОДНОЇ НА ОСІ `z-index` (2026-10-08). |  |
| 31 | ЕЛЕВАЦІЯ ДЛЯ БІЛОЇ КНОПКИ НА КОЛЬОРОВОМУ ҐРУНТІ ПРОСИТЬ ЧЕТВЕРТОГО РІВНЯ (2026-10-08, |  |
| 39 | Пʼять із девʼяти колізій help-і-hint лишились (2026-10-07). |  |
| 40 | `.field > label` і `.dwelcome p` — та сама форма, не чіпані (2026-10-07). |  |
| 43 | Девʼять help-і-hint стоять `--mid` 16px під лейблом `--mid` 16px (2026-10-07). |  |
| 51 | `.pg-d` проходить тонко над градієнтом (2026-10-07). |  |
| 52 | КОНТРАСТ: ЧИСЛА ЗАМІРЯНІ, РІШЕННЯ НЕ УХВАЛЕНЕ (2026-10-07). | → **A** for a designer |
| 53 | Зелений має ЛАТЕНТНУ діру на `--surface-quiet` (2026-10-07). |  |
| 55 | Гліф `tone-black` на банері Home — рішення, не правка (2026-10-07). |  |
| 63 | ПʼЯТНАДЦЯТЬ ОДНОСТОРОННІХ ПРАВИЛ ЧЕКАЮТЬ НА ОДНЕ ПИТАННЯ КОЖНЕ (2026-10-07). |  |
| 64 | `.lic-row,.inv-row,.inst-row` — ТРИ З ЧОТИРЬОХ, І ЦЕ НЕ ОГЛЯД (2026-10-07). |  |
| 65 | ВІСЬ ГРУНТУ ДЛЯ КНОПКИ ВЖЕ ЗАСЛУЖЕНА, І СВІТЛИМИ ПОВЕРХНЯМИ |  |
| 66 | Чіп має три висоти — 26 / 32 / 40 (2026-10-07). | → **A** for a designer |
| 68 | Фонова межа телефона написана двічі (2026-10-07). | → **B** for a designer |
| 69 | КЛАС ВАДИ «ПЕРЕКРИТИЙ ЗАВЖДИ, ЗАМАПЛЕНИЙ ВСЕ ОДНО» — ДВА ВИПАДКИ, |  |
| 70 | Два рінги поза шісткою токенів (2026-10-07). |  |
| 74 | ГРАДІЄНТ ТЕПЕР НА ТРЬОХ ПОВЕРХНЯХ, І ДВІ З НИХ ПОРІВНЯННЯ НЕ СТОСУВАЛОСЬ |  |
| 75 | Два кольори градієнта лишились літералами (2026-10-07). |  |
| 80 | `320` У `shared.js:2085` НЕ МАЄ ЧИМ СТАТИ (2026-10-07). | → **B** for a designer |
| 81 | ДВА НАМІРИ ЗГОРНУТО НАВМИСНО, І ЇХ БІЛЬШЕ НІЩО НЕ ВИРАЖАЄ (2026-10-07). |  |
| 85 | Activity на 390 став на 869px довшим (2026-10-06) — ПРИЙНЯТО, не борг. |  |
| 86 | МОДЕЛЬ «НЕГАТИВ = ЗАПЕРЕЧЕННЯ ІНСЕТА» ПОКРИВАЄ ТРЕТИНУ (заміряно 2026-10-06). |  |
| 89 | `--s-own` тепер ПЕРЕДУМОВА пасу спейсингу, а не пункт у черзі (2026-10-06). |  |
| 93 | СКРОЛ МІЖ 601 І 952 — ПРИЙНЯТИЙ, НЕ ВІДКРИТИЙ (рішення 2026-10-05). |  |
| 95 | КРОК CAPACITY СКРОЛИТЬСЯ НА 600 — ЦЕ РІШЕННЯ (2026-10-02). |  |
| 99 | ЗМІНА РЕЖИМУ ЗАГОРТАННЯ — ЦЕ ЗМІНА ВНУТРІШНЬОГО РОЗМІРУ (2026-10-02). |  |
| 113 | `--t-body-sm-fs` (15px) не має жодного читача (2026-10-02) — токен лишився, бо |  |
| 114 | Текст на телефоні тепер 16/1.40, десктоп 16/1.50 (2026-10-02). |  |
| 115 | `mockInvoiceUrl` — ДРУГА СИСТЕМА ТИПОГРАФІКИ (2026-10-02). | → **A** for a designer |
| 123 | Три порівняння ще відкриті: `Home › Layout` (таблиці/картки), `Everywhere › Alert |  |
| 128 | Проміжок між картками планів виріс на 20% трека (2026-10-01). |  |
| 130 | Три нові спільні будівники (`syncAppliedRow`, `wireSheetTrigger`, |  |
| 131 | Період на телефоні втратив ОДНУ річ, і це свідомо: поля дати в шіті відкриваються |  |
| 141 | ТЕЛЕФОННИЙ ТУЛБАР Є ТІЛЬКИ В C (2026-10-01, за рішенням). |  |
| 145 | `licPlan: side` падає в `stacked` на ≤600 (2026-10-01). | → **B** for a designer |
| 155 | Опис `Description` прибитий до гарнітури (2026-10-01). |  |
| 156 | Порожній стан Production тепер веде в доку, а Development вів туди й раніше — |  |
| 157 | Опис locked-рядків зведений до одного речення на ВСІ три (2026-10-01). |  |
| 158 | `DEVICES_DESC` лишився з одним читачем — редагований рядок девайсів. |  |
| 159 | Вісь `licPlan` не має мобільного трактування (2026-10-01). |  |
| 160 | `subgrid` у варіанті `side` — progressive enhancement. |  |
| 167 | ПАНЕЛЬ ЛІЦЕНЗІЇ БІЛЬШЕ НЕ КАЖЕ НІЧОГО ПРО ТЕ, ЩО РОБИТИ З КЛЮЧЕМ, І БІЛЬШЕ НЕ | → **A** for a designer |
| 190 | ТЕМНОЇ ТЕМИ НЕМАЄ, І ЦЕ ТЕПЕР НАЗВАНО (2026-09-30). | → **A** for a designer |
| 200 | ПОГЛИНУТО ЗАПИСОМ ПАСУ 15 ВИЩЕ («панель більше не каже нічого про ключ і не веде |  |
| 267 | Дані рядка → деталі зведені: деталі тепер керуються об'єктом ліцензії (не `PAGES`) — |  |

---

## E · Closed

Struck through in `NOTES.md` and kept for the reasoning. **Listed so nobody re-opens them by reading the list and not the strikethrough.**

| # | entry | |
|---:|---|---|
| 17 | `.btn--menu` ВІДПОВІДАЄ НА ВКАЗІВНИК НАПОЛОВИНУ (заміряно 2026-10-08). |  |
| 18 | `PAINT_PROPS` У `sweep.js` НЕ МІСТИТЬ `border-color` (2026-10-08). |  |
| 19 | SECONDARY ЯК КОНТУР: ЗНАЧЕННЯ ОБВОДКИ НЕ ОБРАНЕ, ЗБІРКА ЗАЧЕКАНА (2026-10-08). |  |
| 20 | ПЕЙДЖЕР — ПʼЯТИЙ КЛАС ХОСТІВ, І ПРО НЬОГО НІХТО НЕ ПИТАВ (2026-10-08). |  |
| 22 | `--ring-hairline` — ФІКСОВАНИЙ СІРИЙ `#c9c9c9`, 1.70 на білому (заміряно 2026-10-08). |  |
| 23 | ДЕФОЛТНИЙ ДЕМО-АКАУНТ ТЕПЕР ПОКАЗУЄ АДРЕСУ, А НЕ ІМʼЯ (2026-10-08). |  |
| 26 | «ШИРИНА ЯК DESCRIPTION» ВИКОНАНА ЯК ШИРИНА РЯДКА, НЕ КОНТРОЛА (2026-10-08). |  |
| 33 | `signin.html` НЕ МАЄ ФУТЕРА, І ТЕПЕР ТАМ НЕМА ЖОДНОГО МАРШРУТУ ДО ЮРИДИЧНИХ СТОРІНОК |  |
| 35 | `paintDiff` РАХУЄ НЕПАРНІ ЛИШЕ В «ПІСЛЯ» (2026-10-08). |  |
| 36 | ІМʼЯ АКАУНТА БІЛЬШЕ НЕ ЗБИРАЄТЬСЯ ПРИ РЕЄСТРАЦІЇ (2026-10-08, наслідок пункту 2). |  |
| 46 | `--faint` ПРОВАЛЮЄ AA ЯК ТЕКСТ У 507 МІСЦЯХ ЗАКРИТО 2026-10-07 (батч |  |
| 48 | ПАРНИЙ ПРОГІН МУСИТЬ МАТИ ПРЕ-ФЛІТ «ЦЯ URL РЕНДЕРИТЬ СВОЮ СТОРІНКУ» |  |
| 57 | `path()` У `sweep.js` КЛЮЧУЄ ЕЛЕМЕНТ ЙОГО КЛАСАМИ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ, |  |
| 83 | ТОПБАР — НАСТУПНИЙ ПАС, І ВІН ІДЕ САМ (2026-10-06). |  |
| 94 | 48px ПОВІТРЯ БІЛЯ AMOUNT ДІЄ НА ОДНІЙ ПОВЕРХНІ З ТРЬОХ ВИРІШЕНО |  |
| 97 | `MODALS.md` названо чотири не-типографічні вади, жодна не полагоджена |  |
| 98 | Одинадцять рядків сітки `MODALS.md` досі міряні ЗІ смугою (2026-10-02) |  |
| 109 | `mirror.sh` живе в scratchpad, як і `roles.py` (2026-10-01) ЗАКРИТО |  |
| 110 | ЗВІТ ПРО ПОЛОМКИ ПАСУ 2 НЕ ЗРОБЛЕНИЙ ЗАКРИТО 2026-10-01 — повний звіт |  |
| 111 | Класифікація 173 декларацій живе у scratchpad (`ds/roles.py`), не в репо |  |
| 195 | СТЕПЕР ПРИ ПʼЯТИ КРОКАХ ВИЛАЗИТЬ ЗА ВІКНО ЗАКРИТО 2026-09-30 (пас 15), |  |
| 218 | СІМ БЛОКІВ ЗАПИТУ 2026-09-28 НЕ ПОЧАТО ЗАКРИТО 2026-09-29 (другий |  |
| 219 | ТРИ РІШЕННЯ, ЯКІ ТОЙ ЗАПИТ СКАСОВУЄ ЗАКРИТО 2026-09-29: усі три |  |
| 221 | `card_expiring` недосяжний із чистого демо ЗАКРИТО 2026-09-28 |  |
| 222 | `settingsContext().home` і `.details` більше ніхто не читає ПОЛОВИНА |  |
| 226 | У барі два ховер-фони ЗАКРИТО 2026-09-28 (десятий батч): обидва читають |  |
| 230 | Три різні відповіді на «як цей список гортається» ЗАКРИТО 2026-09-28 |  |
| 231 | Моделі кнопки бракує осі «на чому вона стоїть» ЗАКРИТО 2026-09-28. |  |
| 233 | Колір — єдиний носій у колонці Status. |  |
| 236 | Три речення згорнутої групи кажуть дату тричі. |  |
| 242 | `--status-ok` (#009A4F) не проходить AA як текст: 3.66:1 ЗАКРИТО |  |
| 243 | `Rename` у кебабі на сторінці Instances не робить нічого ЗАКРИТО |  |
| 247 | Пройдені кроки степера не клікабельні знято 2026-09-25 (четвертий батч): |  |
| 263 | Превʼю Invoices і Users на дашборді — статичні копії виправлено: дашборд |  |
| 265 | `AMF` не знає про плани / статичні лейбли markup TB-словами знято разом |  |
| 266 | TBMQ не має детальних сторінок виправлено: TBMQ-рядки (sub і perp) відкривають |  |
| 271 | Search-інпути невізуальні виправлено 2026-09-17: `wireSearch()` фільтрує з |  |
| 273 | ЧЕКАЄ НА URL: `EXT.install` виправлено 2026-09-18: |  |
| 278 | Фільтр до нуля на Licenses не показує нічого. |  |
| 287 | `CHECKIN_INTERVAL_H = 24` не підтверджений ВИПРАВЛЕНО 2026-09-22: перевірка щогодини. |  |
| 292 | Повернення при зниженні плану. |  |
| 303 | Таблиця Invoices всередині деталей на телефоні рве заголовки виправлено |  |
| 312 | Залишки Vite-збірки в корені прибрано перед публікацією: `package.json`, |  |
| 319 | Пейджери Licenses та Invoices досі інертні. |  |
| 320 | Пейджери Licenses та Invoices досі інертні — і 2026-09-28 це стало ВИДИМИМ. |  |

