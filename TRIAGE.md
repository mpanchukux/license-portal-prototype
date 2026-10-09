# Triage — the debt, read by who has to act on it

**`NOTES.md` keeps 332 debt entries in one list, newest first. That list is a log: it
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
| **D** | Design-system decision — not a developer's call | 56 |
| **E** | Closed | 45 |
| | **total** | **332** |

⚠️⚠️ **The honest headline: 47 entries block implementation and most of them are NOT design.**
They are unconfirmed prices, `inferred` version numbers, copy waiting for approval and 2
legal questions. **The redesign is further along than the facts it is drawn on.**

## ⚠️⚠️ The designer reading, which is the part worth arguing with

`SCALES.md` and `COMPONENTS.md` are the record for designers and developers both, so the same
entry can sit in two places depending on who picks it up. **These are the ones that move, and
the move is the finding** — not a second opinion about the same thing.

| # | entry | dev | designer | why it moves |
|---:|---|:---:|:---:|---|
| 40 | `ti-repeat` ×11 — `aria-hidden`, АЛЕ НЕСЕ ФАКТ ПРО АВТОПЛАТІЖ (2026-10-07). | B | **D** | a glyph marked decorative that sighted readers use as data is a question about what the mark should say, not about its colour |
| 41 | `.link` ×27 — ЄДИНИЙ МАРШРУТ ДО PRIVACY, TERMS І ЛІЦЕНЗІЙНОЇ УГОДИ (2026-10-07). | B | **D** | whether a link needs a cue beyond being a link is a design decision; the developer just needs to know it has none |
| 51 | КОНТРАСТ: ЧИСЛА ЗАМІРЯНІ, РІШЕННЯ НЕ УХВАЛЕНЕ (2026-10-07). | D | **A** | an undecided accessibility floor blocks handoff — for a developer it is not a preference to wait on |
| 53 | ОБХІД ПРЕДКІВ БРЕШЕ ПРО КОНТРАСТ НАД МЕШЕМ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ | C | **D** | a contrast checker that reads the wrong ground will certify the gradient as passing — the designer owns the surface it lies about |
| 59 | `.sg-item` не обрізає свій `.tablescroll` на телефоні (2026-10-07). | C | **D** | a specimen box that overflows its own border on a phone is the design system failing to show itself |
| 65 | Чіп має три висоти — 26 / 32 / 40 (2026-10-07). | D | **A** | three chip heights is a visible change nobody has decided — a developer needs the number |
| 67 | Фонова межа телефона написана двічі (2026-10-07). | D | **B** | one boundary written twice is a developer trap: two sources, one of them silently wrong |
| 75 | `Landing › Gradient` — ЄДИНЕ ВІДКРИТЕ ПОРІВНЯННЯ ДИЗАЙНУ (2026-10-07). | C | **A** | the last open design comparison — nothing can be handed over with three competing backgrounds |
| 79 | `320` У `shared.js:2085` НЕ МАЄ ЧИМ СТАТИ (2026-10-07). | D | **B** | a z-index with no layer to become is a developer decision at implementation time |
| 83 | ТОПБАР МАЄ ВЛАСНУ РОДИНУ КОНТРОЛІВ ПОЗА КОМПОНЕНТОМ КНОПКИ — ПИТАННЯ ДО ФАЗИ | B | **D** | the topbar's own control family is a component question before it is a fix |
| 114 | `mockInvoiceUrl` — ДРУГА СИСТЕМА ТИПОГРАФІКИ (2026-10-02). | D | **A** | a second type system in a generated document is a system question, not a page bug |
| 123 | ДВАНАДЦЯТЬ НЕЗАКРИТИХ ПОРІВНЯНЬ У СМУЗІ (аудит 2026-10-01). | C | **A** | twelve unclosed comparisons are twelve undecided designs, not prototype plumbing |
| 134 | Варіант 3 має ВЛАСНІ стопи й розмір (2026-10-01). | C | **D** | variant 3 carries its own stops: that is a design fact, now the shipped one |
| 144 | `licPlan: side` падає в `stacked` на ≤600 (2026-10-01). | D | **B** | side falling back to stacked at <=600 is the missing mobile treatment, which a developer must build |
| 164 | ЗЕЛЕНИЙ СТАТУС У ШАПЦІ ЛІЦЕНЗІЇ — 4.24:1 (заміряно 2026-09-30, пас 15). | B | **A** | 4.24:1 is a token value, not a page bug — the green has to change, which changes every surface |
| 166 | ПАНЕЛЬ ЛІЦЕНЗІЇ БІЛЬШЕ НЕ КАЖЕ НІЧОГО ПРО ТЕ, ЩО РОБИТИ З КЛЮЧЕМ, І БІЛЬШЕ НЕ | D | **A** | the panel no longer says what to do with the key: copy that has to exist before build |
| 173 | Специмена тулбара C у стайлгайді немає (2026-09-30). | C | **D** | a missing specimen is missing documentation of a shipped decision |
| 174 | НА ТЕЛЕФОНІ НЕМА ЖОДНОЇ ПОВЕРХНІ НАЛАШТУВАНЬ (2026-09-30, наслідок вибору). | C | **D** | no settings surface on the phone is a consequence of a layout choice |
| 179 | ЧЕРВОНА МАРКА НА INK — 3.35:1 (заміряно 2026-09-30, пас 13). | B | **A** | 3.35:1 on ink: same, and it is the one place colour carries tone alone |
| 180 | В INK-ФОРМІ НА ПАНЕЛІ ЛІЦЕНЗІЇ ТОН НЕСЕ ТІЛЬКИ КОЛІР (2026-09-30, пас 13). | B | **A** | tone carried by colour alone breaks the rule the system states about itself |
| 181 | Специмени банерів у стайлгайді написані літеральними `tone-*` і не слухають | C | **D** | specimens written as literals document a scale the product no longer has |
| 184 | СТАТУС НА КАРТЦІ ІНВОЙСА: РЕФЕРЕНС ПРОСИТЬ ПІЛЮЛЮ, СТОЇТЬ КОМПОНЕНТ (2026-09-30). | B | **D** | reference asks for a pill, the component is there: which one wins is a design call |
| 188 | ЛІД БАНЕРА ПАНЕЛІ НЕ ПРОХОДИТЬ AA: 4.48:1 (заміряно 2026-09-30). | B | **A** | 4.48:1 on the panel lead — a type/colour pairing decision before it is a fix |
| 189 | ТЕМНОЇ ТЕМИ НЕМАЄ, І ЦЕ ТЕПЕР НАЗВАНО (2026-09-30). | D | **A** | no dark theme at all: for a developer a non-requirement, for a designer an unanswered half of the system |
| 212 | Заголовок секції карткової розкладки — 20px, референс просить 24. | B | **D** | 20px against a reference asking ~24 is a scale decision, not a defect |
| 231 | `.plantable` — обрамлена таблиця на 69% ширини секції (записано 2026-09-27). | B | **D** | a framed table at 69% of the section is a layout decision that was never taken |
| 239 | `.infoic` чекає на власний компонент. | B | **D** | the info icon is waiting for a component, which is this phase's work |
| 240 | 22 `<button class="link">` поза кнопкою — текст усередині речень. | B | **D** | 22 button.link outside the component is the boundary of the button model |
| 245 | Варіант B на телефоні не стилізований — свідомо, показаний «як є» на прохання. | C | **D** | an unstyled variant cannot be compared, so the comparison cannot close |
| 250 | КОНТРАСТ: чотири рядки нижче AA, усі `--mid` `#6b6b6b` 14px, усі лише В СПОКОЇ. | B | **A** | four lines below AA, all --mid at 14px: one token, every surface |
| 255 | Десять брейкпоінтів, а ноутси кажуть «один ≤600px»: 600, 601, 640, 700, 760, 820, | B | **A** | ten breakpoints against a documented one: the developer builds from whichever list is true |
| 305 | Колонкові заголовки на Home просили «зменшити, але ≥14px» — а 14px і є поточне | B | **D** | 'smaller but >=14px' is the floor the scale already sets |

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
| 200 | copy | ПРОДУКТ БІЛЬШЕ НІДЕ НЕ КАЖЕ, ЩО КЛЮЧ ВВОДИТЬСЯ В ThingsBoard АБО TBMQ |  |
| 244 | copy | ФАКТ ПРО 12 МІСЯЦІВ ОНОВЛЕНЬ НЕ СКАЗАНИЙ НІДЕ НА ПРОДАВАЛЬНІЙ ПОВЕРХНІ. |  |
| 273 | copy | `TAX_NOTE` — копірайт очікує підтвердження команди. |  |
| 275 | copy | Опису не мають: `assets`, `sessions`, `msg/sec`. |  |
| 278 | copy | `WL_DESC` — `inferred` копірайт, чекає підтвердження. |  |
| 285 | copy | «Вся ліцензія блокується» за перевищення ліміту інстансів — ПОПЕРЕДНЄ формулювання. |  |
| 296 | copy | Формулювання маркера для заблокованої ліцензії. |  |
| 297 | copy | Речення про датування терміну оновлень — відкритий конфлікт. |  |
| 321 | copy | Голос активності виконаний не повністю (2026-09-24, девʼятий батч). |  |
| 328 | copy | Чотири константи копірайту лишились у `data.js` без жодного читача. |  |
| 23 | design | ГАЛКИ КАРТОК ПЛАНІВ І ІКОНКИ CAPACITY/ADD-ONS: ПОВІДОМЛЕНІ ЯК ЗНИКЛІ, ЗАМІРОМ НА |  |
| 290 | design | КОЛІР ПОМИЛКИ проти монохрому — рішення за командою, двічі відкладене. |  |
| 271 | engineering | Auth-форми нічого не перевіряють (див. |  |
| 276 | engineering | Адресний блок на Billing у новому акаунті показує чужу адресу — ВСЕ ЩЕ ВІДКРИТЕ. |  |
| 280 | engineering | Пояснення про оновлення недосяжне на телефоні. |  |
| 283 | engineering | ВІДКРИТЕ ПИТАННЯ, і 2026-09-22 воно стало конкретнішим: яку ВЕРСІЮ ThingsBoard |  |
| 293 | engineering | `LATEST_VERSION = '3.9.4'` і версії інстансів — `inferred`. |  |
| 299 | engineering | `Forgot password?` — стаб. |  |
| 313 | engineering | Причини провалу перевірки — три, і це стеля даних. |  |
| 314 | engineering | `CHECK_WINDOW_DAYS = 3` — `inferred`. |  |
| 322 | engineering | Пʼять засіяних шейпів досі без живого писача (2026-09-24, інвентар активності): |  |
| 323 | engineering | Два формати таймстемпа в сирці: `Aug 17 2026, 16:20` у data.js проти |  |
| 324 | engineering | `PRODUCT_CHOICES[].ic` став фолбеком, який ніколи не спрацьовує. |  |
| 284 | legal | ВІДКРИТЕ ПИТАННЯ (записано 2026-09-18, §12): ліцензійна угода в футері — загальна. |  |
| 298 | legal | Чи потрібна юридична згода в Change plan / Manage add-ons. |  |
| 269 | pricing | «From $X / mo» у прототипі НЕМАЄ. |  |
| 287 | pricing | `UPDATES_RENEW_RATE = 0.40` не підтверджений документом — теж усна цифра. |  |
| 288 | pricing | Ціни на «вільні» девайси перпетуала немає. |  |
| 292 | pricing | `COUPON_RATE = 0.20` і саме правило купона — стаб. |  |
| 307 | pricing | Докупка AI на перпетуалі: разова ціна за місячну квоту. |  |
| 308 | pricing | NL-флоу — inferred ціни: perp-юніти (TB prod $1,999 / AI $500 / TBMQ prod $999) |  |
| 211 | product | ЛІЧИЛЬНИК RECENT ACTIVITY — ВІДКРИТЕ РІШЕННЯ (2026-09-29). |  |
| 256 | product | У TBMQ немає плану «Business». |  |
| 257 | product | «Updates period over» на Home не показується і з теперішньою пʼятіркою не може: |  |
| 258 | product | Free-рядок показує «—» у колонці стану. |  |
| 267 | product | ВІДКРИТЕ РІШЕННЯ: що робити з ліцензіями на Maker / Prototype в датасеті. |  |
| 268 | product | Change plan на legacy-плані не має якоря. |  |
| 274 | product | Блок `Included in every plan` для TBMQ ЗНЯТО 2026-09-22, не заповнено. |  |
| 279 | product | `Enabled` для White labeling сьогодні недосяжний з даних. |  |
| 281 | product | Info-іконка покриває два рядки з шести. |  |
| 303 | product | `Renew subscription` на скасованій — secondary, хоч це єдина дія зони 4. |  |
| 304 | product | Сортування колонок — тепер ЄДИНИЙ контрол, який видимо реагує й нічого не |  |
| 312 | product | ВІДКРИТЕ: чи показує Home перевірки інстансів. |  |
| 320 | product | Заголовок групи на Change plan. |  |
| 325 | product | ВІДКРИТЕ (2026-09-24, сьомий батч): `Renew software updates` не їде на шеллі |  |
| 326 | product | ВІДКРИТЕ (2026-09-24, восьма правка): лічильник банера і список, куди він веде, |  |
| 327 | product | Дві перпетуальні картки описані по-різному (2026-09-24, шоста правка). |  |

---

## B · Build it — and do not copy this

The surface is decided. These are defects measured in the prototype: overflow, contrast, a wrong `aria-label`, a rule that wins by position, a token used without being declared. **Read as: this is what the prototype does wrong at this spot.** Several are one-line fixes in a real build and exist here only because the prototype is hand-written CSS.

| # | entry | |
|---:|---|---|
| 3 | НЕПРОЗОРА ЗАЛИВКА ДИСКА ✕ — ТРЕТІЙ ВИПАДОК «ЗНАЧЕННЯ ПІД ОДИН ФОН», І ЄДИНИЙ |  |
| 9 | `.5px` НЕ ПЕРЕВІРЕНА НА 1x ЕКРАНІ (2026-10-09). |  |
| 10 | ОБГОРТКОВИЙ СПАН ЛЕЙБЛА ЧІПА ДІСТАВСЯ `+ Add label` (2026-10-09). |  |
| 11 | `.perbtn` ЗНОВУ НЕСЕ НЕПРОЗОРУ СІРУ ЗАЛИВКУ, І ЦЕ СВІДОМО (2026-10-08). |  |
| 15 | ВІДМОВИ `button()` ДЛЯ `menu` ЖИВУТЬ У ДВОХ МІСЦЯХ (`shared.js:230` і `:343`, |  |
| 28 | `--accent-soft` — ПЕРШИЙ `color-mix` У ПРОДУКТОВОМУ ПРАВИЛІ (2026-10-08). |  |
| 31 | `Sign in` У ПУБЛІЧНІЙ ШАПЦІ — СІРИЙ НА `--page-bg` (заміряно 2026-10-08). |  |
| 40 | `ti-repeat` ×11 — `aria-hidden`, АЛЕ НЕСЕ ФАКТ ПРО АВТОПЛАТІЖ (2026-10-07). | → **D** for a designer |
| 41 | `.link` ×27 — ЄДИНИЙ МАРШРУТ ДО PRIVACY, TERMS І ЛІЦЕНЗІЙНОЇ УГОДИ (2026-10-07). | → **D** for a designer |
| 66 | `.pagetitlerow` губить підпис `Buy a license` на телефоні (2026-10-07). |  |
| 77 | `?from` у посиланнях на ліцензію більше ніхто не читає (2026-10-07). |  |
| 81 | ІКОНКИ-КНОПКИ ВИРОСЛИ ПО ВСЬОМУ ПРОДУКТУ, І ЗВІТ ПРО ПАС ЦЬОГО НЕ НАЗВАВ |  |
| 83 | ТОПБАР МАЄ ВЛАСНУ РОДИНУ КОНТРОЛІВ ПОЗА КОМПОНЕНТОМ КНОПКИ — ПИТАННЯ ДО ФАЗИ | → **D** for a designer |
| 86 | `.insttoolbar.stickybar` ОГОЛОШУЄ `z-index:12` НА `position:static` ЕЛЕМЕНТІ |  |
| 87 | Візард парує `Billing email` з `Company name` у вужчій колонці (2026-10-06). |  |
| 89 | СМУГА 601–952: ЦИФРИ ЗАМІРЯНІ 2026-10-06, ПОЧИНАТИ З НИХ, А НЕ З «ВОНО |  |
| 90 | ОБГОРТКА, ЯКУ НІХТО НЕ МІРЯЄ, НЕ РОБИТЬ НІЧОГО (знайдено 2026-10-06). |  |
| 91 | Recent invoices на Home: обгортка — СТОПГЕП, не лік (2026-10-06). |  |
| 106 | ТАБЛИЦЯ ІНВОЙСІВ ЛАМАЄ НОМЕР І ДАТУ НАДВОЄ НА 944 (заміряно 2026-10-01). |  |
| 107 | Переповнення топбара на `index` стало на 5px гіршим (заміряно 2026-10-01). |  |
| 116 | Чіпи add-on'ів переносять текст на вузькому десктопі (2026-10-02). |  |
| 117 | Кнопка Copy у рядку ключа переноситься на другий рядок — на 0.7px (заміряно |  |
| 118 | `.licc-label` оголошує `white-space:nowrap`, а діє `normal` (заміряно 2026-10-02). |  |
| 119 | Пошук в Activity не бачить подій, яких немає в завантаженій сторінці (2026-10-02). |  |
| 126 | Засіяна подія `license.labeled` у вже збереженому сторі не має деталі (2026-10-01). |  |
| 131 | ТОПБАР ПЕРЕПОВНЮЄ ВІКНО ВІД 601 ДО 1150px (заміряно 2026-10-01). |  |
| 135 | ДУБЛЬОВАНИЙ `id` — КЛАС ВАДИ, ЯКИЙ НІЩО НЕ СТЕРЕГЛО ДО 2026-10-01. |  |
| 136 | `sgWizStep` дублюється у `styleguide.html`. |  |
| 137 | Тінь табів панелі ліцензії полагоджена, але не побачена в дії (2026-10-01). |  |
| 138 | Під баром тепер і волосина, і тінь (2026-10-01). |  |
| 139 | ЧОТИРИ LIST-ТУЛБАРИ СТАЛИ ДВОМА ПОВЕДІНКАМИ ПОШУКУ (2026-10-01). |  |
| 141 | Обидва тригери C у спокої читаються `All 17` (2026-10-01). |  |
| 142 | `Show N licenses` і пейджер рахують різне (2026-10-01). |  |
| 143 | ПАНЕЛЬ ЛІЦЕНЗІЇ ШИРША ЗА ТЕЛЕФОН НА 51px (заміряно 2026-10-01). |  |
| 145 | ПʼЯТИЙ ВИПАДОК «ПРАВИЛО ПЕРЕМАГАЄ ПОЗИЦІЄЮ» (2026-10-01, друга сесія). |  |
| 146 | Рядок колонок не липне, поки таблиця скролиться вбік (2026-10-01). |  |
| 147 | Лічильник у заголовку більше не ділить базову лінію з ним (2026-10-01). |  |
| 148 | `.inst-hint` лишився з опт-аутом, якого нікому застосовувати (2026-10-01). |  |
| 149 | Чіп Activity рахує згорнуті прогони за один (2026-10-01). |  |
| 150 | ТОНОВАНИЙ ВИГЛЯД БАНЕРА І ВИГЛЯД `ink` ТЕПЕР РОЗРІЗНЯЮТЬ РІЗНУ КІЛЬКІСТЬ СТАНІВ |  |
| 151 | `.fi-mark` виріс до 30px, а відступи фіда під нього не переглядались |  |
| 152 | Мультиселект-рядок більше не `menuitemcheckbox` — це `<label>` з нативним |  |
| 153 | `.fs-screen .am-celltop` ТЕПЕР ТРЕТІЙ ВИПАДОК ТОГО САМОГО ПЕРЕВИЩЕННЯ СКОУПУ |  |
| 160 | `.fs-screen .infoic{24px}` ДОТЯГУЄТЬСЯ ДАЛІ, НІЖ ЙОГО НАМІР (знайдено 2026-10-01). |  |
| 161 | Значення ключа сидить на 5.2px нижчій базовій лінії за три сусідні (2026-10-01). |  |
| 162 | `secondary` на білому банері алерта — правило без сьогоднішнього читача |  |
| 163 | Зона картки Home виросла на 5px (2026-10-01): дівайдер y93→y98, картка |  |
| 164 | ЗЕЛЕНИЙ СТАТУС У ШАПЦІ ЛІЦЕНЗІЇ — 4.24:1 (заміряно 2026-09-30, пас 15). | → **A** for a designer |
| 165 | ТРЕТІЙ РІД КОЛІЗІЇ ПРАВИЛ, І ЙОГО ВАРТО ШУКАТИ ГРЕПОМ (знайдено 2026-09-30). |  |
| 167 | МОДАЛКА І СТОРІНКА ЛІЦЕНЗІЇ ТЕПЕР РОЗХОДЯТЬСЯ В ҐРУНТІ АЛЕРТА (2026-09-30). |  |
| 168 | Прогрес у степері тихіший, ніж був (2026-09-30). |  |
| 169 | `Payment` як заголовок картки Review — `inferred` копірайт (2026-09-30). |  |
| 170 | Заголовки кроків Capacity/Add-ons і секційні лейбли розрізняються вже не кеглем |  |
| 171 | Крапка-роздільник на картці ліцензії Home схована на ≤600 (2026-09-30). |  |
| 172 | Чіп `Stale` зʼявився на телефоні, і його там ніхто не проєктував (2026-09-30). |  |
| 175 | Три групи на Licenses дають рядок табів у три лінії (заміряно 2026-09-30). |  |
| 179 | ЧЕРВОНА МАРКА НА INK — 3.35:1 (заміряно 2026-09-30, пас 13). | → **A** for a designer |
| 180 | В INK-ФОРМІ НА ПАНЕЛІ ЛІЦЕНЗІЇ ТОН НЕСЕ ТІЛЬКИ КОЛІР (2026-09-30, пас 13). | → **A** for a designer |
| 182 | Дві картки в ряд зупиняються на 900, і це моє судження, не число із запиту |  |
| 183 | Скидання треку на першу картку після дисміса тепер помітніше (запис від того ж |  |
| 184 | СТАТУС НА КАРТЦІ ІНВОЙСА: РЕФЕРЕНС ПРОСИТЬ ПІЛЮЛЮ, СТОЇТЬ КОМПОНЕНТ (2026-09-30). | → **D** for a designer |
| 185 | Два дівайдери на картці інвойса розрізняються лише вставкою (2026-09-30). |  |
| 186 | Роздільна розкладка банера не анімує перехід між картками (2026-09-30). |  |
| 187 | Після дисміса картки трек стає на першу (2026-09-30). |  |
| 188 | ЛІД БАНЕРА ПАНЕЛІ НЕ ПРОХОДИТЬ AA: 4.48:1 (заміряно 2026-09-30). | → **A** for a designer |
| 190 | Марка банера розходиться між Home і панеллю (2026-09-30). |  |
| 191 | РЕЙЛ КРОКІВ НЕ ЦЕНТРОВАНИЙ У СМУЗІ, І ЦЕ ВПИРАЄТЬСЯ В ЗАПИСАНЕ РІШЕННЯ |  |
| 192 | ЧІПА КІЛЬКОСТІ НА `Invoices` І `Activity` НЕМАЄ ВЗАГАЛІ (2026-09-30). |  |
| 193 | `#backBtn` у шапці ліцензії — мертва кнопка з голим гліфом `←` (знайдено |  |
| 195 | На телефоні заголовок кроку налазить на ✕ у шапці візарда. |  |
| 196 | У ТАБЛИЦІ Licenses ГЛІФ СТАТУСУ (16) І МАРКА ВЕРСІЇ (20) ДОСІ РІЗНОГО РОЗМІРУ |  |
| 197 | Гліф статусу в панелі сидить на 1.7px нижче оптичного центру слова, марка версії — |  |
| 198 | Продукт більше ніде не каже «no instance has checked in yet» банером (2026-09-30). |  |
| 201 | `Next charge` у варіанті B зони дублює картку `Next charge` нижче. |  |
| 203 | НА ТЕЛЕФОНІ ВЕСЬ БЛОК КЛЮЧА СТОЇТЬ НАД НАЗВОЮ ЛІЦЕНЗІЇ, І ВЕСЬ `order` |  |
| 204 | На сторінці ліцензії жолоб back-кнопки лишився порожнім (2026-09-29). |  |
| 205 | ВІЗАРД НЕ СКЛАДАЄТЬСЯ В ОДНУ КОЛОНКУ НА ТЕЛЕФОНІ — кроки Capacity і Add-ons |  |
| 206 | Три рядки інвойсів у 600px рамці карткової розкладки (2026-09-29). |  |
| 208 | `Full page` І `Shared link` ТЕПЕР РІЗНЯТЬСЯ ОДНІЄЮ РІЧЧЮ (2026-09-29). |  |
| 210 | ПРАВИЛО, ЯКЕ ПРОГРАЄ, АЛЕ ЗБІГАЄТЬСЯ ЗНАЧЕННЯМ, — ЦЕ ТИХИЙ БОРГ. |  |
| 212 | Заголовок секції карткової розкладки — 20px, референс просить 24. | → **D** for a designer |
| 213 | `✎ Add label` (картка Home) проти `+ Add label` (деталі ліцензії) — два написання |  |
| 214 | `aria-label` РЯДКА І КАРТКИ КАЖЕ `status: Active` ТАМ, ДЕ ВИДНО `Blocked`. |  |
| 216 | Карткова розкладка не має телефонного чергування поверхонь. |  |
| 219 | ТОПБАР ПЕРЕПОВНЮЄТЬСЯ МІЖ 600 І 1100px (заміряно 2026-09-29). |  |
| 224 | Лічильники двох тулбарів Licenses рахують РІЗНЕ — A фасетно, B по акаунту. |  |
| 226 | `.authscreen .fs-header` лишилась прозорою, коли решта шапок діалогів стала |  |
| 228 | ЛИПКИЙ КОЛОНКОВИЙ РЯДОК НЕ ЛИПНЕ, КОЛИ ТАБЛИЦЯ ЇДЕ ВБІК (заміряно 2026-09-28). |  |
| 231 | `.plantable` — обрамлена таблиця на 69% ширини секції (записано 2026-09-27). | → **D** for a designer |
| 233 | Біла підкладка під заокругленим кутом голови таблиці (`thead th::before`) |  |
| 234 | `[hidden]` ЛАМАЄТЬСЯ ЩОРАЗУ, КОЛИ КОМПОНЕНТ ДІСТАЄ `display` — І ЦЕ ВЖЕ |  |
| 236 | `Instance renamed to {entity}` проти пункту меню `Edit label`. |  |
| 238 | МЕРТВЕ ПРАВИЛО НЕ ІНЕРТНЕ, КОЛИ ЙОГО ІМʼЯ ОЧЕВИДНЕ (2026-09-29). |  |
| 239 | `.infoic` чекає на власний компонент. | → **D** for a designer |
| 240 | 22 `<button class="link">` поза кнопкою — текст усередині речень. | → **D** for a designer |
| 247 | `--accent` задано, а не виведено. |  |
| 248 | `assets/logo.svg` і `tools/build-logo.py` більше нічим не читаються — вордмарк |  |
| 250 | КОНТРАСТ: чотири рядки нижче AA, усі `--mid` `#6b6b6b` 14px, усі лише В СПОКОЇ. | → **A** for a designer |
| 251 | `--ic-30` і `--ic-44` НЕ ОГОЛОШЕНІ, і використовуються без фолбека (`.iconbutton`, |  |
| 252 | `--t-h3-fs` теж не оголошений, але має фолбек `18px`, тож працює. |  |
| 253 | `--pg-start` і `--pg-cols` пишуться щоразу і не читаються ніким: CSS перейшов на |  |
| 254 | `--s-own` — колізія імені: 10px у `#nlStepPick`, 16px у `.setgrid`, різні селектори, |  |
| 255 | Десять брейкпоінтів, а ноутси кажуть «один ≤600px»: 600, 601, 640, 700, 760, 820, | → **A** for a designer |
| 259 | Альтернатива `--page-bg` не перевірена на екрані. |  |
| 260 | `corner-shape:squircle` діє лише в Chrome 139+. |  |
| 282 | Дублікати id, коли модалка деталей відкривається ПОВЕРХ сторінки деталей. |  |
| 289 | ВІДКРИТЕ: Home — 2.93 екрана на телефоні (записано 2026-09-18, §14). |  |
| 294 | Розкладка пʼяти планових карток на 390 — рішення за користувачкою. |  |
| 295 | Крок Capacity на 390 — 1.47 екрана. |  |
| 301 | `renderLicenseAlert` малює порожній банер, якщо забути `.amsg` — і взагалі |  |
| 305 | Колонкові заголовки на Home просили «зменшити, але ≥14px» — а 14px і є поточне | → **D** for a designer |
| 310 | Три варіанти степера в дизайн-системі ТЗ просило показати всі три; варіанти |  |
| 317 | `Deactivate` ставить `i.active = false`, і ніщо це поле не читає у фільтрах. |  |
| 329 | Назва перпетуала у візарді лягає в ТРИ рядки (2026-09-24, перший батч). |  |
| 330 | `max-width:62ch` знято з підказки Instances (2026-09-24, восьма правка) — ТЗ просило |  |

---

## C · Prototype-local — a developer can ignore all of it

The measurement harness, the mirrors, the checkers, the settings bar, seeded demo data, publishing. **None of it exists in the product.** It is here because the next session needs it, not because anyone implements it.

| # | entry | |
|---:|---|---|
| 2 | `#overlay` СИДИТЬ НА `--z-toast`, ЩОБ ПЕРЕКРИТИ ВІЗАРД, І ЙОГО КОМЕНТАР ЦЕ ВИЗНАЄ |  |
| 13 | ҐАРД ПРАВИЛА 9 НЕ БАЧИТЬ ПЕРЕСТАНОВКИ ДІТЕЙ (2026-10-08). |  |
| 27 | ЗАПИС «ОДНЕ ЗНАЧЕННЯ, ЧОТИРИ МІСЦЯ» ПРО `--accent` БУВ НЕПРАВДОЮ (виправлено |  |
| 33 | `.emptybox.eb.on-tint` НЕ ТРИМАЄ ЖОДНОЇ КНОПКИ В ЗАМІРЯНИХ СТАНАХ (2026-10-08). |  |
| 36 | `.billcard.nl-paycard.on-tint` РАНТАЙМОМ НЕ ПІДТВЕРДЖЕНИЙ (2026-10-08). |  |
| 37 | `font-weight` НА `<use>` НЕСТАБІЛЬНИЙ У ЦІЙ ПАНЕЛІ (2026-10-07). |  |
| 43 | `--text-inactive` — сім правил, і жодне не відрендерилось у заміряному датасеті |  |
| 44 | `--surface-quiet` 4.471 — записано й закрито (2026-10-07). |  |
| 46 | СКАН КОНТРАСТУ МУСИТЬ ЧИТАТИ ТОКЕНИ З `:root`, А НЕ ЗНАТИ ЇХ HEX |  |
| 48 | Пілюля нижньої навігації ловиться в середині транзиції (механізм, 2026-10-07). |  |
| 49 | `.tablescroll` недетерміновано дістає `.is-scrollable` (2026-10-07). |  |
| 53 | ОБХІД ПРЕДКІВ БРЕШЕ ПРО КОНТРАСТ НАД МЕШЕМ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ | → **D** for a designer |
| 55 | Банери `over_limit` / `updates_*` / `canceled` недосяжні з датасету `dashB` за |  |
| 57 | `OPENERS.usersModal` ДО МОДАЛКИ НЕ ДОХОДИТЬ (2026-10-07). |  |
| 58 | `invoices.html@768` недетермінований на переповненні (2026-10-07). |  |
| 59 | `.sg-item` не обрізає свій `.tablescroll` на телефоні (2026-10-07). | → **D** for a designer |
| 60 | Номери в `TRIAGE.md` — ПОЗИЦІЇ, не id (2026-10-07). |  |
| 61 | Категорії в `tools/triage.py` — це судження, і воно ревізується (2026-10-07). |  |
| 70 | `sweep.js` НЕ БАЧИТЬ МЕШУ ВЗАГАЛІ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ |  |
| 71 | ТРИ `background-image` МЕШУ СЕРІАЛІЗУЮТЬСЯ ЯК `color(srgb …)` (2026-10-07). |  |
| 72 | Дизер градієнта розійшовся на ±1/255 у 0.125% каналів (2026-10-07). |  |
| 75 | `Landing › Gradient` — ЄДИНЕ ВІДКРИТЕ ПОРІВНЯННЯ ДИЗАЙНУ (2026-10-07). | → **A** for a designer |
| 76 | ГРУПА 2 `DEAD.md` ПІД ПІДОЗРОЮ ТАМ, ДЕ КЛАС ПИШЕТЬСЯ ЛИШЕ ПІД НЕДЕФОЛТНИМ |  |
| 78 | `.faq-cat` — ДІРА В ЦЕНЗІ МЕРТВОГО, ЗНАЙДЕНА ПАСОМ ПРО ТОВЩИНУ РАМКИ |  |
| 95 | ЗАМІР КЕРУЄ РИШТУВАННЯМ, А НЕ УСПАДКОВУЄ ЙОГО (2026-10-02). |  |
| 99 | `csscheck.py` не бачить зіпсованих коментарів (2026-10-02). |  |
| 100 | `MODALS.md` §3.2 і §3.3 описують версію з `flex-wrap` (2026-10-02) — у файлі є |  |
| 101 | −53px на 944 у модалі заміряно й не пояснено (2026-10-02). |  |
| 102 | Згрупований режим інстансів і `tableframe`/`mesh` не в сітці мертвих селекторів |  |
| 103 | Модалка авторизації не в сітці заміру (2026-10-02) — їй потрібна сесія `out`, а |  |
| 104 | 15 із 16 діалогів спільного `#overlay` не міряні (2026-10-02). |  |
| 105 | БЛОК «ФАЙЛИ» І СПИСОК СТОРІНОК РОЗХОДИЛИСЬ ІЗ РЕПОЗИТОРІЄМ У ПʼЯТИ МІСЦЯХ |  |
| 111 | Одинадцять ролей позначені непевними (2026-10-02), найспірніша — `.field > label` |  |
| 115 | 559 — стверджене число, виведене з заміру (2026-10-02, другий пас). |  |
| 120 | `data-tableframe` лишився константою (2026-10-01). |  |
| 121 | Ключі `licBar`, `licTable`, `licZone`, `licPlan`, `homeBlocks`, `bannerLayout`, |  |
| 123 | ДВАНАДЦЯТЬ НЕЗАКРИТИХ ПОРІВНЯНЬ У СМУЗІ (аудит 2026-10-01). | → **A** for a designer |
| 124 | `Payment` і `Credit` стоять на `landing` і `signin` (аудит 2026-10-01) — білінг |  |
| 125 | Три роди контролів лежать в одному ряду: дані · порівняння · навігація. |  |
| 128 | `signin.html` не має жодного посилання В ПРОДУКТІ, окрім осі в смузі налаштувань. |  |
| 132 | Прогін сторінок міряв ДВІ ширини, 1280 і 375 — рівно ті, де все гаразд. |  |
| 133 | 25 повторно оголошених класів не прочитані (2026-10-01). |  |
| 134 | Варіант 3 має ВЛАСНІ стопи й розмір (2026-10-01). | → **D** for a designer |
| 173 | Специмена тулбара C у стайлгайді немає (2026-09-30). | → **D** for a designer |
| 174 | НА ТЕЛЕФОНІ НЕМА ЖОДНОЇ ПОВЕРХНІ НАЛАШТУВАНЬ (2026-09-30, наслідок вибору). | → **D** for a designer |
| 176 | `instView` лишився поза системою — світч на тулбарі Instances, а не таб смуги. |  |
| 177 | `Purchase` не показується на лендінгу, хоч звідти можна почати покупку: `when` |  |
| 178 | `settingsContext()` лишився з попереднім імʼям, хоч панелі налаштувань уже нема. |  |
| 181 | Специмени банерів у стайлгайді написані літеральними `tone-*` і не слухають | → **D** for a designer |
| 202 | Видимість усередині модалки не можна міряти `offsetParent` — він `null` для всього |  |
| 207 | Ліниву дозавантажку фіда не перевірити в цій панелі — і ніколи не було можна. |  |
| 209 | Розгорнута смуга станів накриває останні 176px сторінки (2026-09-29, за запитом). |  |
| 215 | Група `Table frame` лишається в ⚙ і на Home з картками, де жодної таблиці нема. |  |
| 222 | Смуга станів знає лише дві поверхні. |  |
| 223 | ЧЕКЕР ІКОНОК НЕ ЗНАЄ ЧЕТВЕРТОГО НАПИСАННЯ: HTML-СУТНОСТІ СТРІЛКИ. |  |
| 227 | Запит пошуку не переживає свап тулбарів Licenses — свідомо (див. |  |
| 237 | `--bg` більше не ґрунт жодної поверхні (2026-09-28). |  |
| 243 | Пропущені перевірки — додані ДЕМО-ДАНІ (2026-09-25). |  |
| 245 | Варіант B на телефоні не стилізований — свідомо, показаний «як є» на прохання. | → **D** for a designer |
| 249 | `AUDIT.md` застарів. |  |
| 261 | `AUDIT.md` List C — 37 кластерів і жодного рішення. |  |
| 263 | `prototypeaddons` не має лінка у флоу: у датасетах такого рядка немає, тож |  |
| 300 | Log in не чіпає `billingData`. |  |
| 306 | Дрібні свідомі рішення (можуть «повернутися» питанням): Users сортовані Created |  |
| 309 | `.claude/launch.json` містить сесійний scratchpad-шлях (див. |  |
| 315 | Специмен `#groupedcheck` у стайлгайді розходиться з продуктом: `feedGroupItem` кладе |  |
| 316 | Мертвий коментар у `styles.css` перед блоком `.acttypemenu`: абзац про «chips … |  |
| 331 | GitHub Pages — опубліковано. |  |
| 332 | Claude-артефакт — друга, приватна копія (2026-09-16, оновлено 2026-09-24): |  |

---

## D · Design-system decision — not a developer's call

Open questions about the system itself: which scale a value collapses to, whether a form is a variant, what an axis means. **The answer goes into `SCALES.md` or `COMPONENTS.md` first, and reaches code from there.**

| # | entry | |
|---:|---|---|
| 1 | СТЕПЕР І КАРТКИ ADD-ON'ІВ ВІДПОВІДАЮТЬ НА ВКАЗІВНИК РІЗНИМИ МЕХАНІЗМАМИ (2026-10-09). |  |
| 4 | ЧОТИРИ КЕБАБИ СТАЛИ ТРЬОМА (2026-10-09). |  |
| 5 | `--hover` `#f0f0ee` ЛИШАЄТЬСЯ У 30 ПРАВИЛАХ (2026-10-09). |  |
| 6 | ВИБРАНИЙ ADD-ON НЕ ВІДПОВІДАЄ НА ВКАЗІВНИК (2026-10-09). |  |
| 7 | РАМПА SECONDARY ТЕПЕР 0 / .04 / .14 (2026-10-09). |  |
| 8 | ТРИ МЕТРИКИ UBUNTU СТОЯТЬ ЛІТЕРАЛАМИ В `calc()` ЯКОРЯ ЛІЧИЛЬНИКА (2026-10-09). |  |
| 12 | `--sel` `#e4e4e0` ЛИШАЄТЬСЯ ТЕПЛИМ СІРИМ У СЕМИ ПРАВИЛАХ (2026-10-08). |  |
| 14 | `.btn--menu` — ЦЕ GHOST ІНШОГО РОЗМІРУ, І ЗГОРТАТИ ЙОГО ЧИ НІ — ВІДКРИТЕ (заміряно |  |
| 20 | `.btn--menu` НЕ НАКРИТИЙ НОВИМ ОПИСОМ SECONDARY (2026-10-08). |  |
| 24 | ДОВЖИНУ `Instance ID` НЕ СКОРОЧЕНО (2026-10-08). |  |
| 26 | СПИСКИ ІНВОЙСІВ І АКТИВНОСТІ В МОДАЛЦІ ЛІЦЕНЗІЇ ВСЕ ЩЕ ЙДУТЬ ВПРИТУЛ (2026-10-08). |  |
| 29 | ДВІ РУНГИ ЗАМІСТЬ ОДНОЇ НА ОСІ `z-index` (2026-10-08). |  |
| 30 | ЕЛЕВАЦІЯ ДЛЯ БІЛОЇ КНОПКИ НА КОЛЬОРОВОМУ ҐРУНТІ ПРОСИТЬ ЧЕТВЕРТОГО РІВНЯ (2026-10-08, |  |
| 38 | Пʼять із девʼяти колізій help-і-hint лишились (2026-10-07). |  |
| 39 | `.field > label` і `.dwelcome p` — та сама форма, не чіпані (2026-10-07). |  |
| 42 | Девʼять help-і-hint стоять `--mid` 16px під лейблом `--mid` 16px (2026-10-07). |  |
| 50 | `.pg-d` проходить тонко над градієнтом (2026-10-07). |  |
| 51 | КОНТРАСТ: ЧИСЛА ЗАМІРЯНІ, РІШЕННЯ НЕ УХВАЛЕНЕ (2026-10-07). | → **A** for a designer |
| 52 | Зелений має ЛАТЕНТНУ діру на `--surface-quiet` (2026-10-07). |  |
| 54 | Гліф `tone-black` на банері Home — рішення, не правка (2026-10-07). |  |
| 62 | ПʼЯТНАДЦЯТЬ ОДНОСТОРОННІХ ПРАВИЛ ЧЕКАЮТЬ НА ОДНЕ ПИТАННЯ КОЖНЕ (2026-10-07). |  |
| 63 | `.lic-row,.inv-row,.inst-row` — ТРИ З ЧОТИРЬОХ, І ЦЕ НЕ ОГЛЯД (2026-10-07). |  |
| 64 | ВІСЬ ГРУНТУ ДЛЯ КНОПКИ ВЖЕ ЗАСЛУЖЕНА, І СВІТЛИМИ ПОВЕРХНЯМИ |  |
| 65 | Чіп має три висоти — 26 / 32 / 40 (2026-10-07). | → **A** for a designer |
| 67 | Фонова межа телефона написана двічі (2026-10-07). | → **B** for a designer |
| 68 | КЛАС ВАДИ «ПЕРЕКРИТИЙ ЗАВЖДИ, ЗАМАПЛЕНИЙ ВСЕ ОДНО» — ДВА ВИПАДКИ, |  |
| 69 | Два рінги поза шісткою токенів (2026-10-07). |  |
| 73 | ГРАДІЄНТ ТЕПЕР НА ТРЬОХ ПОВЕРХНЯХ, І ДВІ З НИХ ПОРІВНЯННЯ НЕ СТОСУВАЛОСЬ |  |
| 74 | Два кольори градієнта лишились літералами (2026-10-07). |  |
| 79 | `320` У `shared.js:2085` НЕ МАЄ ЧИМ СТАТИ (2026-10-07). | → **B** for a designer |
| 80 | ДВА НАМІРИ ЗГОРНУТО НАВМИСНО, І ЇХ БІЛЬШЕ НІЩО НЕ ВИРАЖАЄ (2026-10-07). |  |
| 84 | Activity на 390 став на 869px довшим (2026-10-06) — ПРИЙНЯТО, не борг. |  |
| 85 | МОДЕЛЬ «НЕГАТИВ = ЗАПЕРЕЧЕННЯ ІНСЕТА» ПОКРИВАЄ ТРЕТИНУ (заміряно 2026-10-06). |  |
| 88 | `--s-own` тепер ПЕРЕДУМОВА пасу спейсингу, а не пункт у черзі (2026-10-06). |  |
| 92 | СКРОЛ МІЖ 601 І 952 — ПРИЙНЯТИЙ, НЕ ВІДКРИТИЙ (рішення 2026-10-05). |  |
| 94 | КРОК CAPACITY СКРОЛИТЬСЯ НА 600 — ЦЕ РІШЕННЯ (2026-10-02). |  |
| 98 | ЗМІНА РЕЖИМУ ЗАГОРТАННЯ — ЦЕ ЗМІНА ВНУТРІШНЬОГО РОЗМІРУ (2026-10-02). |  |
| 112 | `--t-body-sm-fs` (15px) не має жодного читача (2026-10-02) — токен лишився, бо |  |
| 113 | Текст на телефоні тепер 16/1.40, десктоп 16/1.50 (2026-10-02). |  |
| 114 | `mockInvoiceUrl` — ДРУГА СИСТЕМА ТИПОГРАФІКИ (2026-10-02). | → **A** for a designer |
| 122 | Три порівняння ще відкриті: `Home › Layout` (таблиці/картки), `Everywhere › Alert |  |
| 127 | Проміжок між картками планів виріс на 20% трека (2026-10-01). |  |
| 129 | Три нові спільні будівники (`syncAppliedRow`, `wireSheetTrigger`, |  |
| 130 | Період на телефоні втратив ОДНУ річ, і це свідомо: поля дати в шіті відкриваються |  |
| 140 | ТЕЛЕФОННИЙ ТУЛБАР Є ТІЛЬКИ В C (2026-10-01, за рішенням). |  |
| 144 | `licPlan: side` падає в `stacked` на ≤600 (2026-10-01). | → **B** for a designer |
| 154 | Опис `Description` прибитий до гарнітури (2026-10-01). |  |
| 155 | Порожній стан Production тепер веде в доку, а Development вів туди й раніше — |  |
| 156 | Опис locked-рядків зведений до одного речення на ВСІ три (2026-10-01). |  |
| 157 | `DEVICES_DESC` лишився з одним читачем — редагований рядок девайсів. |  |
| 158 | Вісь `licPlan` не має мобільного трактування (2026-10-01). |  |
| 159 | `subgrid` у варіанті `side` — progressive enhancement. |  |
| 166 | ПАНЕЛЬ ЛІЦЕНЗІЇ БІЛЬШЕ НЕ КАЖЕ НІЧОГО ПРО ТЕ, ЩО РОБИТИ З КЛЮЧЕМ, І БІЛЬШЕ НЕ | → **A** for a designer |
| 189 | ТЕМНОЇ ТЕМИ НЕМАЄ, І ЦЕ ТЕПЕР НАЗВАНО (2026-09-30). | → **A** for a designer |
| 199 | ПОГЛИНУТО ЗАПИСОМ ПАСУ 15 ВИЩЕ («панель більше не каже нічого про ключ і не веде |  |
| 266 | Дані рядка → деталі зведені: деталі тепер керуються об'єктом ліцензії (не `PAGES`) — |  |

---

## E · Closed

Struck through in `NOTES.md` and kept for the reasoning. **Listed so nobody re-opens them by reading the list and not the strikethrough.**

| # | entry | |
|---:|---|---|
| 16 | `.btn--menu` ВІДПОВІДАЄ НА ВКАЗІВНИК НАПОЛОВИНУ (заміряно 2026-10-08). |  |
| 17 | `PAINT_PROPS` У `sweep.js` НЕ МІСТИТЬ `border-color` (2026-10-08). |  |
| 18 | SECONDARY ЯК КОНТУР: ЗНАЧЕННЯ ОБВОДКИ НЕ ОБРАНЕ, ЗБІРКА ЗАЧЕКАНА (2026-10-08). |  |
| 19 | ПЕЙДЖЕР — ПʼЯТИЙ КЛАС ХОСТІВ, І ПРО НЬОГО НІХТО НЕ ПИТАВ (2026-10-08). |  |
| 21 | `--ring-hairline` — ФІКСОВАНИЙ СІРИЙ `#c9c9c9`, 1.70 на білому (заміряно 2026-10-08). |  |
| 22 | ДЕФОЛТНИЙ ДЕМО-АКАУНТ ТЕПЕР ПОКАЗУЄ АДРЕСУ, А НЕ ІМʼЯ (2026-10-08). |  |
| 25 | «ШИРИНА ЯК DESCRIPTION» ВИКОНАНА ЯК ШИРИНА РЯДКА, НЕ КОНТРОЛА (2026-10-08). |  |
| 32 | `signin.html` НЕ МАЄ ФУТЕРА, І ТЕПЕР ТАМ НЕМА ЖОДНОГО МАРШРУТУ ДО ЮРИДИЧНИХ СТОРІНОК |  |
| 34 | `paintDiff` РАХУЄ НЕПАРНІ ЛИШЕ В «ПІСЛЯ» (2026-10-08). |  |
| 35 | ІМʼЯ АКАУНТА БІЛЬШЕ НЕ ЗБИРАЄТЬСЯ ПРИ РЕЄСТРАЦІЇ (2026-10-08, наслідок пункту 2). |  |
| 45 | `--faint` ПРОВАЛЮЄ AA ЯК ТЕКСТ У 507 МІСЦЯХ ЗАКРИТО 2026-10-07 (батч |  |
| 47 | ПАРНИЙ ПРОГІН МУСИТЬ МАТИ ПРЕ-ФЛІТ «ЦЯ URL РЕНДЕРИТЬ СВОЮ СТОРІНКУ» |  |
| 56 | `path()` У `sweep.js` КЛЮЧУЄ ЕЛЕМЕНТ ЙОГО КЛАСАМИ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ, |  |
| 82 | ТОПБАР — НАСТУПНИЙ ПАС, І ВІН ІДЕ САМ (2026-10-06). |  |
| 93 | 48px ПОВІТРЯ БІЛЯ AMOUNT ДІЄ НА ОДНІЙ ПОВЕРХНІ З ТРЬОХ ВИРІШЕНО |  |
| 96 | `MODALS.md` названо чотири не-типографічні вади, жодна не полагоджена |  |
| 97 | Одинадцять рядків сітки `MODALS.md` досі міряні ЗІ смугою (2026-10-02) |  |
| 108 | `mirror.sh` живе в scratchpad, як і `roles.py` (2026-10-01) ЗАКРИТО |  |
| 109 | ЗВІТ ПРО ПОЛОМКИ ПАСУ 2 НЕ ЗРОБЛЕНИЙ ЗАКРИТО 2026-10-01 — повний звіт |  |
| 110 | Класифікація 173 декларацій живе у scratchpad (`ds/roles.py`), не в репо |  |
| 194 | СТЕПЕР ПРИ ПʼЯТИ КРОКАХ ВИЛАЗИТЬ ЗА ВІКНО ЗАКРИТО 2026-09-30 (пас 15), |  |
| 217 | СІМ БЛОКІВ ЗАПИТУ 2026-09-28 НЕ ПОЧАТО ЗАКРИТО 2026-09-29 (другий |  |
| 218 | ТРИ РІШЕННЯ, ЯКІ ТОЙ ЗАПИТ СКАСОВУЄ ЗАКРИТО 2026-09-29: усі три |  |
| 220 | `card_expiring` недосяжний із чистого демо ЗАКРИТО 2026-09-28 |  |
| 221 | `settingsContext().home` і `.details` більше ніхто не читає ПОЛОВИНА |  |
| 225 | У барі два ховер-фони ЗАКРИТО 2026-09-28 (десятий батч): обидва читають |  |
| 229 | Три різні відповіді на «як цей список гортається» ЗАКРИТО 2026-09-28 |  |
| 230 | Моделі кнопки бракує осі «на чому вона стоїть» ЗАКРИТО 2026-09-28. |  |
| 232 | Колір — єдиний носій у колонці Status. |  |
| 235 | Три речення згорнутої групи кажуть дату тричі. |  |
| 241 | `--status-ok` (#009A4F) не проходить AA як текст: 3.66:1 ЗАКРИТО |  |
| 242 | `Rename` у кебабі на сторінці Instances не робить нічого ЗАКРИТО |  |
| 246 | Пройдені кроки степера не клікабельні знято 2026-09-25 (четвертий батч): |  |
| 262 | Превʼю Invoices і Users на дашборді — статичні копії виправлено: дашборд |  |
| 264 | `AMF` не знає про плани / статичні лейбли markup TB-словами знято разом |  |
| 265 | TBMQ не має детальних сторінок виправлено: TBMQ-рядки (sub і perp) відкривають |  |
| 270 | Search-інпути невізуальні виправлено 2026-09-17: `wireSearch()` фільтрує з |  |
| 272 | ЧЕКАЄ НА URL: `EXT.install` виправлено 2026-09-18: |  |
| 277 | Фільтр до нуля на Licenses не показує нічого. |  |
| 286 | `CHECKIN_INTERVAL_H = 24` не підтверджений ВИПРАВЛЕНО 2026-09-22: перевірка щогодини. |  |
| 291 | Повернення при зниженні плану. |  |
| 302 | Таблиця Invoices всередині деталей на телефоні рве заголовки виправлено |  |
| 311 | Залишки Vite-збірки в корені прибрано перед публікацією: `package.json`, |  |
| 318 | Пейджери Licenses та Invoices досі інертні. |  |
| 319 | Пейджери Licenses та Invoices досі інертні — і 2026-09-28 це стало ВИДИМИМ. |  |

