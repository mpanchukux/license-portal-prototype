# Triage — the debt, read by who has to act on it

**`NOTES.md` keeps 381 debt entries in one list, newest first. That list is a log: it
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
| **A** | Blocked — needs an answer before anyone writes code | 53 |
| **B** | Build it — and do not copy this | 121 |
| **C** | Prototype-local — a developer can ignore all of it | 85 |
| **D** | Design-system decision — not a developer's call | 73 |
| **E** | Closed | 49 |
| | **total** | **381** |

⚠️⚠️ **The honest headline: 53 entries block implementation and most of them are NOT design.**
They are unconfirmed prices, `inferred` version numbers, copy waiting for approval and 2
legal questions. **The redesign is further along than the facts it is drawn on.**

## ⚠️⚠️ The designer reading, which is the part worth arguing with

`SCALES.md` and `COMPONENTS.md` are the record for designers and developers both, so the same
entry can sit in two places depending on who picks it up. **These are the ones that move, and
the move is the finding** — not a second opinion about the same thing.

| # | entry | dev | designer | why it moves |
|---:|---|:---:|:---:|---|
| 89 | `ti-repeat` ×11 — `aria-hidden`, АЛЕ НЕСЕ ФАКТ ПРО АВТОПЛАТІЖ (2026-10-07). | B | **D** | a glyph marked decorative that sighted readers use as data is a question about what the mark should say, not about its colour |
| 90 | `.link` ×27 — ЄДИНИЙ МАРШРУТ ДО PRIVACY, TERMS І ЛІЦЕНЗІЙНОЇ УГОДИ (2026-10-07). | B | **D** | whether a link needs a cue beyond being a link is a design decision; the developer just needs to know it has none |
| 100 | КОНТРАСТ: ЧИСЛА ЗАМІРЯНІ, РІШЕННЯ НЕ УХВАЛЕНЕ (2026-10-07). | D | **A** | an undecided accessibility floor blocks handoff — for a developer it is not a preference to wait on |
| 102 | ОБХІД ПРЕДКІВ БРЕШЕ ПРО КОНТРАСТ НАД МЕШЕМ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ | C | **D** | a contrast checker that reads the wrong ground will certify the gradient as passing — the designer owns the surface it lies about |
| 108 | `.sg-item` не обрізає свій `.tablescroll` на телефоні (2026-10-07). | C | **D** | a specimen box that overflows its own border on a phone is the design system failing to show itself |
| 114 | Чіп має три висоти — 26 / 32 / 40 (2026-10-07). | D | **A** | three chip heights is a visible change nobody has decided — a developer needs the number |
| 116 | Фонова межа телефона написана двічі (2026-10-07). | D | **B** | one boundary written twice is a developer trap: two sources, one of them silently wrong |
| 124 | `Landing › Gradient` — ЄДИНЕ ВІДКРИТЕ ПОРІВНЯННЯ ДИЗАЙНУ (2026-10-07). | C | **A** | the last open design comparison — nothing can be handed over with three competing backgrounds |
| 128 | `320` У `shared.js:2085` НЕ МАЄ ЧИМ СТАТИ (2026-10-07). | D | **B** | a z-index with no layer to become is a developer decision at implementation time |
| 132 | ТОПБАР МАЄ ВЛАСНУ РОДИНУ КОНТРОЛІВ ПОЗА КОМПОНЕНТОМ КНОПКИ — ПИТАННЯ ДО ФАЗИ | B | **D** | the topbar's own control family is a component question before it is a fix |
| 163 | `mockInvoiceUrl` — ДРУГА СИСТЕМА ТИПОГРАФІКИ (2026-10-02). | D | **A** | a second type system in a generated document is a system question, not a page bug |
| 172 | ДВАНАДЦЯТЬ НЕЗАКРИТИХ ПОРІВНЯНЬ У СМУЗІ (аудит 2026-10-01). | C | **A** | twelve unclosed comparisons are twelve undecided designs, not prototype plumbing |
| 183 | Варіант 3 має ВЛАСНІ стопи й розмір (2026-10-01). | C | **D** | variant 3 carries its own stops: that is a design fact, now the shipped one |
| 193 | `licPlan: side` падає в `stacked` на ≤600 (2026-10-01). | D | **B** | side falling back to stacked at <=600 is the missing mobile treatment, which a developer must build |
| 213 | ЗЕЛЕНИЙ СТАТУС У ШАПЦІ ЛІЦЕНЗІЇ — 4.24:1 (заміряно 2026-09-30, пас 15). | B | **A** | 4.24:1 is a token value, not a page bug — the green has to change, which changes every surface |
| 215 | ПАНЕЛЬ ЛІЦЕНЗІЇ БІЛЬШЕ НЕ КАЖЕ НІЧОГО ПРО ТЕ, ЩО РОБИТИ З КЛЮЧЕМ, І БІЛЬШЕ НЕ | D | **A** | the panel no longer says what to do with the key: copy that has to exist before build |
| 222 | Специмена тулбара C у стайлгайді немає (2026-09-30). | C | **D** | a missing specimen is missing documentation of a shipped decision |
| 223 | НА ТЕЛЕФОНІ НЕМА ЖОДНОЇ ПОВЕРХНІ НАЛАШТУВАНЬ (2026-09-30, наслідок вибору). | C | **D** | no settings surface on the phone is a consequence of a layout choice |
| 228 | ЧЕРВОНА МАРКА НА INK — 3.35:1 (заміряно 2026-09-30, пас 13). | B | **A** | 3.35:1 on ink: same, and it is the one place colour carries tone alone |
| 229 | В INK-ФОРМІ НА ПАНЕЛІ ЛІЦЕНЗІЇ ТОН НЕСЕ ТІЛЬКИ КОЛІР (2026-09-30, пас 13). | B | **A** | tone carried by colour alone breaks the rule the system states about itself |
| 230 | Специмени банерів у стайлгайді написані літеральними `tone-*` і не слухають | C | **D** | specimens written as literals document a scale the product no longer has |
| 233 | СТАТУС НА КАРТЦІ ІНВОЙСА: РЕФЕРЕНС ПРОСИТЬ ПІЛЮЛЮ, СТОЇТЬ КОМПОНЕНТ (2026-09-30). | B | **D** | reference asks for a pill, the component is there: which one wins is a design call |
| 237 | ЛІД БАНЕРА ПАНЕЛІ НЕ ПРОХОДИТЬ AA: 4.48:1 (заміряно 2026-09-30). | B | **A** | 4.48:1 on the panel lead — a type/colour pairing decision before it is a fix |
| 238 | ТЕМНОЇ ТЕМИ НЕМАЄ, І ЦЕ ТЕПЕР НАЗВАНО (2026-09-30). | D | **A** | no dark theme at all: for a developer a non-requirement, for a designer an unanswered half of the system |
| 261 | Заголовок секції карткової розкладки — 20px, референс просить 24. | B | **D** | 20px against a reference asking ~24 is a scale decision, not a defect |
| 280 | `.plantable` — обрамлена таблиця на 69% ширини секції (записано 2026-09-27). | B | **D** | a framed table at 69% of the section is a layout decision that was never taken |
| 288 | `.infoic` чекає на власний компонент. | B | **D** | the info icon is waiting for a component, which is this phase's work |
| 289 | 22 `<button class="link">` поза кнопкою — текст усередині речень. | B | **D** | 22 button.link outside the component is the boundary of the button model |
| 294 | Варіант B на телефоні не стилізований — свідомо, показаний «як є» на прохання. | C | **D** | an unstyled variant cannot be compared, so the comparison cannot close |
| 299 | КОНТРАСТ: чотири рядки нижче AA, усі `--mid` `#6b6b6b` 14px, усі лише В СПОКОЇ. | B | **A** | four lines below AA, all --mid at 14px: one token, every surface |
| 304 | Десять брейкпоінтів, а ноутси кажуть «один ≤600px»: 600, 601, 640, 700, 760, 820, | B | **A** | ten breakpoints against a documented one: the developer builds from whichever list is true |
| 354 | Колонкові заголовки на Home просили «зменшити, але ≥14px» — а 14px і є поточне | B | **D** | 'smaller but >=14px' is the floor the scale already sets |

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
| **copy** | 14 | a sentence waiting for approval, or missing entirely |
| **engineering** | 11 | a data or release fact the prototype guessed |
| **pricing** | 6 | a number nobody has confirmed in writing |
| **design** | 4 | a team decision, twice deferred |
| **legal** | 2 | questions that are not ours to answer |

| # | owner | entry | |
|---:|---|---|---|
| 26 | copy | `PLANS_INCLUDE_NOTE` І `PE_FEATURES` ЛИШИЛИСЬ БЕЗ ЖОДНОГО ВКАЗІВНИКА (2026-10-12). |  |
| 27 | copy | КОПІЯ АКТИВНОСТІ НЕ ВИКОНУЄ ВЛАСНОГО ПРАВИЛА ГОЛОСУ, І ЦЕ ЄДИНИЙ ЗАПИС ПРО ТОЙ АУДИТ |  |
| 43 | copy | ПЛЕЙСХОЛДЕР ІНВАЙТУ НЕ ВЛАЗИТЬ, І РОЗКЛАДКА ЦЬОГО НЕ ВИРІШУЄ (2026-10-09). |  |
| 48 | copy | НА 375px КНОПКИ ACCOUNT І BILLING ВСЕ ОДНО ПЕРЕНОСЯТЬСЯ (2026-10-09). |  |
| 249 | copy | ПРОДУКТ БІЛЬШЕ НІДЕ НЕ КАЖЕ, ЩО КЛЮЧ ВВОДИТЬСЯ В ThingsBoard АБО TBMQ |  |
| 293 | copy | ФАКТ ПРО 12 МІСЯЦІВ ОНОВЛЕНЬ НЕ СКАЗАНИЙ НІДЕ НА ПРОДАВАЛЬНІЙ ПОВЕРХНІ. |  |
| 322 | copy | `TAX_NOTE` — копірайт очікує підтвердження команди. |  |
| 324 | copy | Опису не мають: `assets`, `sessions`, `msg/sec`. |  |
| 327 | copy | `WL_DESC` — `inferred` копірайт, чекає підтвердження. |  |
| 334 | copy | «Вся ліцензія блокується» за перевищення ліміту інстансів — ПОПЕРЕДНЄ формулювання. |  |
| 345 | copy | Формулювання маркера для заблокованої ліцензії. |  |
| 346 | copy | Речення про датування терміну оновлень — відкритий конфлікт. |  |
| 370 | copy | Голос активності виконаний не повністю (2026-09-24, девʼятий батч). |  |
| 377 | copy | Чотири константи копірайту лишились у `data.js` без жодного читача. |  |
| 15 | design | ЗАМІНА ТЕКСТУ КОЛЬОРУ ЗНЯЛА ЗІ СТОРІНКИ ДВА ПОРОГИ, ЯКІ САМІ Ж ПРОСИЛИ ПОВЕРНУТИ |  |
| 44 | design | ЧОТИРИКОЛІРНОЇ «G» GOOGLE У ПРОДУКТІ НЕМАЄ (2026-10-09). |  |
| 72 | design | ГАЛКИ КАРТОК ПЛАНІВ І ІКОНКИ CAPACITY/ADD-ONS: ПОВІДОМЛЕНІ ЯК ЗНИКЛІ, ЗАМІРОМ НА |  |
| 339 | design | КОЛІР ПОМИЛКИ проти монохрому — рішення за командою, двічі відкладене. |  |
| 320 | engineering | Auth-форми нічого не перевіряють (див. |  |
| 325 | engineering | Адресний блок на Billing у новому акаунті показує чужу адресу — ВСЕ ЩЕ ВІДКРИТЕ. |  |
| 329 | engineering | Пояснення про оновлення недосяжне на телефоні. |  |
| 332 | engineering | ВІДКРИТЕ ПИТАННЯ, і 2026-09-22 воно стало конкретнішим: яку ВЕРСІЮ ThingsBoard |  |
| 342 | engineering | `LATEST_VERSION = '3.9.4'` і версії інстансів — `inferred`. |  |
| 348 | engineering | `Forgot password?` — стаб. |  |
| 362 | engineering | Причини провалу перевірки — три, і це стеля даних. |  |
| 363 | engineering | `CHECK_WINDOW_DAYS = 3` — `inferred`. |  |
| 371 | engineering | Пʼять засіяних шейпів досі без живого писача (2026-09-24, інвентар активності): |  |
| 372 | engineering | Два формати таймстемпа в сирці: `Aug 17 2026, 16:20` у data.js проти |  |
| 373 | engineering | `PRODUCT_CHOICES[].ic` став фолбеком, який ніколи не спрацьовує. |  |
| 333 | legal | ВІДКРИТЕ ПИТАННЯ (записано 2026-09-18, §12): ліцензійна угода в футері — загальна. |  |
| 347 | legal | Чи потрібна юридична згода в Change plan / Manage add-ons. |  |
| 318 | pricing | «From $X / mo» у прототипі НЕМАЄ. |  |
| 336 | pricing | `UPDATES_RENEW_RATE = 0.40` не підтверджений документом — теж усна цифра. |  |
| 337 | pricing | Ціни на «вільні» девайси перпетуала немає. |  |
| 341 | pricing | `COUPON_RATE = 0.20` і саме правило купона — стаб. |  |
| 356 | pricing | Докупка AI на перпетуалі: разова ціна за місячну квоту. |  |
| 357 | pricing | NL-флоу — inferred ціни: perp-юніти (TB prod $1,999 / AI $500 / TBMQ prod $999) |  |
| 260 | product | ЛІЧИЛЬНИК RECENT ACTIVITY — ВІДКРИТЕ РІШЕННЯ (2026-09-29). |  |
| 305 | product | У TBMQ немає плану «Business». |  |
| 306 | product | «Updates period over» на Home не показується і з теперішньою пʼятіркою не може: |  |
| 307 | product | Free-рядок показує «—» у колонці стану. |  |
| 316 | product | ВІДКРИТЕ РІШЕННЯ: що робити з ліцензіями на Maker / Prototype в датасеті. |  |
| 317 | product | Change plan на legacy-плані не має якоря. |  |
| 323 | product | Блок `Included in every plan` для TBMQ ЗНЯТО 2026-09-22, не заповнено. |  |
| 328 | product | `Enabled` для White labeling сьогодні недосяжний з даних. |  |
| 330 | product | Info-іконка покриває два рядки з шести. |  |
| 352 | product | `Renew subscription` на скасованій — secondary, хоч це єдина дія зони 4. |  |
| 353 | product | Сортування колонок — тепер ЄДИНИЙ контрол, який видимо реагує й нічого не |  |
| 361 | product | ВІДКРИТЕ: чи показує Home перевірки інстансів. |  |
| 369 | product | Заголовок групи на Change plan. |  |
| 374 | product | ВІДКРИТЕ (2026-09-24, сьомий батч): `Renew software updates` не їде на шеллі |  |
| 375 | product | ВІДКРИТЕ (2026-09-24, восьма правка): лічильник банера і список, куди він веде, |  |
| 376 | product | Дві перпетуальні картки описані по-різному (2026-09-24, шоста правка). |  |

---

## B · Build it — and do not copy this

The surface is decided. These are defects measured in the prototype: overflow, contrast, a wrong `aria-label`, a rule that wins by position, a token used without being declared. **Read as: this is what the prototype does wrong at this spot.** Several are one-line fixes in a real build and exist here only because the prototype is hand-written CSS.

| # | entry | |
|---:|---|---|
| 2 | СТАЙЛГАЙД ТЕПЕР ВАНТАЖИТЬ `wizard.js` І `license-details.js` ЗАРАДИ ОДНІЄЇ |  |
| 22 | `--radius-control` НАЗИВАЄ НЕ ТЕ, ЩО ЙОГО ЧИТАЄ (ценз 2026-10-12). |  |
| 23 | ЧІП `Needs attention` ЩЕ РОСТЕ, КОЛИ РЕЙКУ ВЖЕ ПРОГОРНУЛИ (2026-10-12). |  |
| 32 | `.lic-typeseg` НА 320 ГОРТАЄТЬСЯ 29px ЗАМІСТЬ 13 (2026-10-12). |  |
| 37 | `[hidden]` ПРОТИ `display` — СІМ ВИПАДКІВ, І ЖОДНОГО ЧЕКЕРА (2026-10-09). |  |
| 45 | ТРИ РІЗНІ ЗАПИСИ ПРО ОДНУ Й ТУ САМУ ВАДУ СПЕЦИФІЧНОСТІ (2026-10-09). |  |
| 52 | НЕПРОЗОРА ЗАЛИВКА ДИСКА ✕ — ТРЕТІЙ ВИПАДОК «ЗНАЧЕННЯ ПІД ОДИН ФОН», І ЄДИНИЙ |  |
| 58 | `.5px` НЕ ПЕРЕВІРЕНА НА 1x ЕКРАНІ (2026-10-09). |  |
| 59 | ОБГОРТКОВИЙ СПАН ЛЕЙБЛА ЧІПА ДІСТАВСЯ `+ Add label` (2026-10-09). |  |
| 60 | `.perbtn` ЗНОВУ НЕСЕ НЕПРОЗОРУ СІРУ ЗАЛИВКУ, І ЦЕ СВІДОМО (2026-10-08). |  |
| 64 | ВІДМОВИ `button()` ДЛЯ `menu` ЖИВУТЬ У ДВОХ МІСЦЯХ (`shared.js:230` і `:343`, |  |
| 77 | `--accent-soft` — ПЕРШИЙ `color-mix` У ПРОДУКТОВОМУ ПРАВИЛІ (2026-10-08). |  |
| 80 | `Sign in` У ПУБЛІЧНІЙ ШАПЦІ — СІРИЙ НА `--page-bg` (заміряно 2026-10-08). |  |
| 89 | `ti-repeat` ×11 — `aria-hidden`, АЛЕ НЕСЕ ФАКТ ПРО АВТОПЛАТІЖ (2026-10-07). | → **D** for a designer |
| 90 | `.link` ×27 — ЄДИНИЙ МАРШРУТ ДО PRIVACY, TERMS І ЛІЦЕНЗІЙНОЇ УГОДИ (2026-10-07). | → **D** for a designer |
| 115 | `.pagetitlerow` губить підпис `Buy a license` на телефоні (2026-10-07). |  |
| 126 | `?from` у посиланнях на ліцензію більше ніхто не читає (2026-10-07). |  |
| 130 | ІКОНКИ-КНОПКИ ВИРОСЛИ ПО ВСЬОМУ ПРОДУКТУ, І ЗВІТ ПРО ПАС ЦЬОГО НЕ НАЗВАВ |  |
| 132 | ТОПБАР МАЄ ВЛАСНУ РОДИНУ КОНТРОЛІВ ПОЗА КОМПОНЕНТОМ КНОПКИ — ПИТАННЯ ДО ФАЗИ | → **D** for a designer |
| 135 | `.insttoolbar.stickybar` ОГОЛОШУЄ `z-index:12` НА `position:static` ЕЛЕМЕНТІ |  |
| 136 | Візард парує `Billing email` з `Company name` у вужчій колонці (2026-10-06). |  |
| 138 | СМУГА 601–952: ЦИФРИ ЗАМІРЯНІ 2026-10-06, ПОЧИНАТИ З НИХ, А НЕ З «ВОНО |  |
| 139 | ОБГОРТКА, ЯКУ НІХТО НЕ МІРЯЄ, НЕ РОБИТЬ НІЧОГО (знайдено 2026-10-06). |  |
| 140 | Recent invoices на Home: обгортка — СТОПГЕП, не лік (2026-10-06). |  |
| 155 | ТАБЛИЦЯ ІНВОЙСІВ ЛАМАЄ НОМЕР І ДАТУ НАДВОЄ НА 944 (заміряно 2026-10-01). |  |
| 156 | Переповнення топбара на `index` стало на 5px гіршим (заміряно 2026-10-01). |  |
| 165 | Чіпи add-on'ів переносять текст на вузькому десктопі (2026-10-02). |  |
| 166 | Кнопка Copy у рядку ключа переноситься на другий рядок — на 0.7px (заміряно |  |
| 167 | `.licc-label` оголошує `white-space:nowrap`, а діє `normal` (заміряно 2026-10-02). |  |
| 168 | Пошук в Activity не бачить подій, яких немає в завантаженій сторінці (2026-10-02). |  |
| 175 | Засіяна подія `license.labeled` у вже збереженому сторі не має деталі (2026-10-01). |  |
| 180 | ТОПБАР ПЕРЕПОВНЮЄ ВІКНО ВІД 601 ДО 1150px (заміряно 2026-10-01). |  |
| 184 | ДУБЛЬОВАНИЙ `id` — КЛАС ВАДИ, ЯКИЙ НІЩО НЕ СТЕРЕГЛО ДО 2026-10-01. |  |
| 185 | `sgWizStep` дублюється у `styleguide.html`. |  |
| 186 | Тінь табів панелі ліцензії полагоджена, але не побачена в дії (2026-10-01). |  |
| 187 | Під баром тепер і волосина, і тінь (2026-10-01). |  |
| 188 | ЧОТИРИ LIST-ТУЛБАРИ СТАЛИ ДВОМА ПОВЕДІНКАМИ ПОШУКУ (2026-10-01). |  |
| 190 | Обидва тригери C у спокої читаються `All 17` (2026-10-01). |  |
| 191 | `Show N licenses` і пейджер рахують різне (2026-10-01). |  |
| 192 | ПАНЕЛЬ ЛІЦЕНЗІЇ ШИРША ЗА ТЕЛЕФОН НА 51px (заміряно 2026-10-01). |  |
| 194 | ПʼЯТИЙ ВИПАДОК «ПРАВИЛО ПЕРЕМАГАЄ ПОЗИЦІЄЮ» (2026-10-01, друга сесія). |  |
| 195 | Рядок колонок не липне, поки таблиця скролиться вбік (2026-10-01). |  |
| 196 | Лічильник у заголовку більше не ділить базову лінію з ним (2026-10-01). |  |
| 197 | `.inst-hint` лишився з опт-аутом, якого нікому застосовувати (2026-10-01). |  |
| 198 | Чіп Activity рахує згорнуті прогони за один (2026-10-01). |  |
| 199 | ТОНОВАНИЙ ВИГЛЯД БАНЕРА І ВИГЛЯД `ink` ТЕПЕР РОЗРІЗНЯЮТЬ РІЗНУ КІЛЬКІСТЬ СТАНІВ |  |
| 200 | `.fi-mark` виріс до 30px, а відступи фіда під нього не переглядались |  |
| 201 | Мультиселект-рядок більше не `menuitemcheckbox` — це `<label>` з нативним |  |
| 202 | `.fs-screen .am-celltop` ТЕПЕР ТРЕТІЙ ВИПАДОК ТОГО САМОГО ПЕРЕВИЩЕННЯ СКОУПУ |  |
| 209 | `.fs-screen .infoic{24px}` ДОТЯГУЄТЬСЯ ДАЛІ, НІЖ ЙОГО НАМІР (знайдено 2026-10-01). |  |
| 210 | Значення ключа сидить на 5.2px нижчій базовій лінії за три сусідні (2026-10-01). |  |
| 211 | `secondary` на білому банері алерта — правило без сьогоднішнього читача |  |
| 212 | Зона картки Home виросла на 5px (2026-10-01): дівайдер y93→y98, картка |  |
| 213 | ЗЕЛЕНИЙ СТАТУС У ШАПЦІ ЛІЦЕНЗІЇ — 4.24:1 (заміряно 2026-09-30, пас 15). | → **A** for a designer |
| 214 | ТРЕТІЙ РІД КОЛІЗІЇ ПРАВИЛ, І ЙОГО ВАРТО ШУКАТИ ГРЕПОМ (знайдено 2026-09-30). |  |
| 216 | МОДАЛКА І СТОРІНКА ЛІЦЕНЗІЇ ТЕПЕР РОЗХОДЯТЬСЯ В ҐРУНТІ АЛЕРТА (2026-09-30). |  |
| 217 | Прогрес у степері тихіший, ніж був (2026-09-30). |  |
| 218 | `Payment` як заголовок картки Review — `inferred` копірайт (2026-09-30). |  |
| 219 | Заголовки кроків Capacity/Add-ons і секційні лейбли розрізняються вже не кеглем |  |
| 220 | Крапка-роздільник на картці ліцензії Home схована на ≤600 (2026-09-30). |  |
| 221 | Чіп `Stale` зʼявився на телефоні, і його там ніхто не проєктував (2026-09-30). |  |
| 224 | Три групи на Licenses дають рядок табів у три лінії (заміряно 2026-09-30). |  |
| 228 | ЧЕРВОНА МАРКА НА INK — 3.35:1 (заміряно 2026-09-30, пас 13). | → **A** for a designer |
| 229 | В INK-ФОРМІ НА ПАНЕЛІ ЛІЦЕНЗІЇ ТОН НЕСЕ ТІЛЬКИ КОЛІР (2026-09-30, пас 13). | → **A** for a designer |
| 231 | Дві картки в ряд зупиняються на 900, і це моє судження, не число із запиту |  |
| 232 | Скидання треку на першу картку після дисміса тепер помітніше (запис від того ж |  |
| 233 | СТАТУС НА КАРТЦІ ІНВОЙСА: РЕФЕРЕНС ПРОСИТЬ ПІЛЮЛЮ, СТОЇТЬ КОМПОНЕНТ (2026-09-30). | → **D** for a designer |
| 234 | Два дівайдери на картці інвойса розрізняються лише вставкою (2026-09-30). |  |
| 235 | Роздільна розкладка банера не анімує перехід між картками (2026-09-30). |  |
| 236 | Після дисміса картки трек стає на першу (2026-09-30). |  |
| 237 | ЛІД БАНЕРА ПАНЕЛІ НЕ ПРОХОДИТЬ AA: 4.48:1 (заміряно 2026-09-30). | → **A** for a designer |
| 239 | Марка банера розходиться між Home і панеллю (2026-09-30). |  |
| 240 | РЕЙЛ КРОКІВ НЕ ЦЕНТРОВАНИЙ У СМУЗІ, І ЦЕ ВПИРАЄТЬСЯ В ЗАПИСАНЕ РІШЕННЯ |  |
| 241 | ЧІПА КІЛЬКОСТІ НА `Invoices` І `Activity` НЕМАЄ ВЗАГАЛІ (2026-09-30). |  |
| 242 | `#backBtn` у шапці ліцензії — мертва кнопка з голим гліфом `←` (знайдено |  |
| 244 | На телефоні заголовок кроку налазить на ✕ у шапці візарда. |  |
| 245 | У ТАБЛИЦІ Licenses ГЛІФ СТАТУСУ (16) І МАРКА ВЕРСІЇ (20) ДОСІ РІЗНОГО РОЗМІРУ |  |
| 246 | Гліф статусу в панелі сидить на 1.7px нижче оптичного центру слова, марка версії — |  |
| 247 | Продукт більше ніде не каже «no instance has checked in yet» банером (2026-09-30). |  |
| 250 | `Next charge` у варіанті B зони дублює картку `Next charge` нижче. |  |
| 252 | НА ТЕЛЕФОНІ ВЕСЬ БЛОК КЛЮЧА СТОЇТЬ НАД НАЗВОЮ ЛІЦЕНЗІЇ, І ВЕСЬ `order` |  |
| 253 | На сторінці ліцензії жолоб back-кнопки лишився порожнім (2026-09-29). |  |
| 254 | ВІЗАРД НЕ СКЛАДАЄТЬСЯ В ОДНУ КОЛОНКУ НА ТЕЛЕФОНІ — кроки Capacity і Add-ons |  |
| 255 | Три рядки інвойсів у 600px рамці карткової розкладки (2026-09-29). |  |
| 257 | `Full page` І `Shared link` ТЕПЕР РІЗНЯТЬСЯ ОДНІЄЮ РІЧЧЮ (2026-09-29). |  |
| 259 | ПРАВИЛО, ЯКЕ ПРОГРАЄ, АЛЕ ЗБІГАЄТЬСЯ ЗНАЧЕННЯМ, — ЦЕ ТИХИЙ БОРГ. |  |
| 261 | Заголовок секції карткової розкладки — 20px, референс просить 24. | → **D** for a designer |
| 262 | `✎ Add label` (картка Home) проти `+ Add label` (деталі ліцензії) — два написання |  |
| 263 | `aria-label` РЯДКА І КАРТКИ КАЖЕ `status: Active` ТАМ, ДЕ ВИДНО `Blocked`. |  |
| 265 | Карткова розкладка не має телефонного чергування поверхонь. |  |
| 268 | ТОПБАР ПЕРЕПОВНЮЄТЬСЯ МІЖ 600 І 1100px (заміряно 2026-09-29). |  |
| 273 | Лічильники двох тулбарів Licenses рахують РІЗНЕ — A фасетно, B по акаунту. |  |
| 275 | `.authscreen .fs-header` лишилась прозорою, коли решта шапок діалогів стала |  |
| 277 | ЛИПКИЙ КОЛОНКОВИЙ РЯДОК НЕ ЛИПНЕ, КОЛИ ТАБЛИЦЯ ЇДЕ ВБІК (заміряно 2026-09-28). |  |
| 280 | `.plantable` — обрамлена таблиця на 69% ширини секції (записано 2026-09-27). | → **D** for a designer |
| 282 | Біла підкладка під заокругленим кутом голови таблиці (`thead th::before`) |  |
| 283 | `[hidden]` ЛАМАЄТЬСЯ ЩОРАЗУ, КОЛИ КОМПОНЕНТ ДІСТАЄ `display` — І ЦЕ ВЖЕ |  |
| 285 | `Instance renamed to {entity}` проти пункту меню `Edit label`. |  |
| 287 | МЕРТВЕ ПРАВИЛО НЕ ІНЕРТНЕ, КОЛИ ЙОГО ІМʼЯ ОЧЕВИДНЕ (2026-09-29). |  |
| 288 | `.infoic` чекає на власний компонент. | → **D** for a designer |
| 289 | 22 `<button class="link">` поза кнопкою — текст усередині речень. | → **D** for a designer |
| 296 | `--accent` задано, а не виведено. |  |
| 297 | `assets/logo.svg` і `tools/build-logo.py` більше нічим не читаються — вордмарк |  |
| 299 | КОНТРАСТ: чотири рядки нижче AA, усі `--mid` `#6b6b6b` 14px, усі лише В СПОКОЇ. | → **A** for a designer |
| 300 | `--ic-30` і `--ic-44` НЕ ОГОЛОШЕНІ, і використовуються без фолбека (`.iconbutton`, |  |
| 301 | `--t-h3-fs` теж не оголошений, але має фолбек `18px`, тож працює. |  |
| 302 | `--pg-start` і `--pg-cols` пишуться щоразу і не читаються ніким: CSS перейшов на |  |
| 303 | `--s-own` — колізія імені: 10px у `#nlStepPick`, 16px у `.setgrid`, різні селектори, |  |
| 304 | Десять брейкпоінтів, а ноутси кажуть «один ≤600px»: 600, 601, 640, 700, 760, 820, | → **A** for a designer |
| 308 | Альтернатива `--page-bg` не перевірена на екрані. |  |
| 309 | `corner-shape:squircle` діє лише в Chrome 139+. |  |
| 331 | Дублікати id, коли модалка деталей відкривається ПОВЕРХ сторінки деталей. |  |
| 338 | ВІДКРИТЕ: Home — 2.93 екрана на телефоні (записано 2026-09-18, §14). |  |
| 343 | Розкладка пʼяти планових карток на 390 — рішення за користувачкою. |  |
| 344 | Крок Capacity на 390 — 1.47 екрана. |  |
| 350 | `renderLicenseAlert` малює порожній банер, якщо забути `.amsg` — і взагалі |  |
| 354 | Колонкові заголовки на Home просили «зменшити, але ≥14px» — а 14px і є поточне | → **D** for a designer |
| 359 | Три варіанти степера в дизайн-системі ТЗ просило показати всі три; варіанти |  |
| 366 | `Deactivate` ставить `i.active = false`, і ніщо це поле не читає у фільтрах. |  |
| 378 | Назва перпетуала у візарді лягає в ТРИ рядки (2026-09-24, перший батч). |  |
| 379 | `max-width:62ch` знято з підказки Instances (2026-09-24, восьма правка) — ТЗ просило |  |

---

## C · Prototype-local — a developer can ignore all of it

The measurement harness, the mirrors, the checkers, the settings bar, seeded demo data, publishing. **None of it exists in the product.** It is here because the next session needs it, not because anyone implements it.

| # | entry | |
|---:|---|---|
| 1 | СПЕЦИМЕН СТЕПЕРА НЕ РЕАГУЄ НА ШИРИНУ (2026-10-12). |  |
| 3 | `styleguide.html` НЕ ВІДДАЄ `onload` 16 СЕКУНД В АЙФРЕЙМІ, І ПРИЧИНА НЕ ЗНАЙДЕНА |  |
| 4 | ТРЕТІЙ РАЗ ЗА ДЕНЬ Я ПОВІРИЛА ЕКРАНУ ЗАМІСТЬ `curl` (2026-10-12). |  |
| 7 | ПʼЯТЬ ПРАВИЛ `.sg-act*` ЛИШИЛИСЬ БЕЗ РОЗМІТКИ (2026-10-12). |  |
| 8 | `.sg-head` І `.sg-lead` ЛИШИЛИСЬ БЕЗ ЖОДНОГО ЧИТАЧА (2026-10-12). |  |
| 10 | `#empty` У ФАЙЛІ — ВСЕ ЩЕ DRAWER, І ОДИН ІЗ ЙОГО МЕШКАНЦІВ — ЦІЛА СТОРІНКА |  |
| 11 | СПЕЦИМЕН ТІНІ МАЛЮЄ НІЧОГО, І МАЛЮВАВ НІЧОГО ЗАВЖДИ (заміряно 2026-10-12). |  |
| 19 | БЛОК СІРИХ ПОКАЗУЄ ПРИМІТИВ І ХОВАЄ ОБОХ ЙОГО ЧИТАЧІВ (ценз 2026-10-12). |  |
| 25 | `.sg-warn` БІЛЬШЕ НІХТО НЕ ПИШЕ, А CSS ЛИШИВСЯ (2026-10-12). |  |
| 28 | ТРИ ПАСИ НЕПЕРЕВІРЕНІ ПОВНИМ ГЕОМЕТРИЧНИМ ДІФОМ, І КАМПАНІЮ ЗАКРИТО СВІДОМО |  |
| 29 | ЗНАХІДКА ПРО ШИРИНУ 601 ЗНЯТА ТОГО САМОГО ДНЯ — ВАДА БУЛА В МОЄМУ ЗОНДІ (2026-10-12). |  |
| 34 | ТРЕТЯ ЖИВА КОПІЯ ПРОТОТИПУ НЕ БУЛА НАЗВАНА В ЦЬОМУ ФАЙЛІ (2026-10-09). |  |
| 36 | СТРИМАННЯ ПРАВОК НІХТО НЕ ПЕРЕВІРЯЄ АВТОМАТИЧНО (2026-10-09). |  |
| 38 | ЗАМІР 10-09 «ДЕСКТОП НЕДОТОРКАНИЙ» БУВ ПРО АТРИБУТ, А НЕ ПРО РОЗКЛАДКУ (2026-10-09). |  |
| 41 | `#usersModal .fs-box{height:100vh}` І `.fs-box.usersbox` ТЕПЕР КАЖУТЬ ОДНЕ Й ТЕ САМЕ |  |
| 47 | КАРТКИ ВИЩІ ЗА РЯДКИ, І СТОРІНКИ ПОДОВШАЛИ (2026-10-09). |  |
| 51 | `#overlay` СИДИТЬ НА `--z-toast`, ЩОБ ПЕРЕКРИТИ ВІЗАРД, І ЙОГО КОМЕНТАР ЦЕ ВИЗНАЄ |  |
| 62 | ҐАРД ПРАВИЛА 9 НЕ БАЧИТЬ ПЕРЕСТАНОВКИ ДІТЕЙ (2026-10-08). |  |
| 76 | ЗАПИС «ОДНЕ ЗНАЧЕННЯ, ЧОТИРИ МІСЦЯ» ПРО `--accent` БУВ НЕПРАВДОЮ (виправлено |  |
| 82 | `.emptybox.eb.on-tint` НЕ ТРИМАЄ ЖОДНОЇ КНОПКИ В ЗАМІРЯНИХ СТАНАХ (2026-10-08). |  |
| 85 | `.billcard.nl-paycard.on-tint` РАНТАЙМОМ НЕ ПІДТВЕРДЖЕНИЙ (2026-10-08). |  |
| 86 | `font-weight` НА `<use>` НЕСТАБІЛЬНИЙ У ЦІЙ ПАНЕЛІ (2026-10-07). |  |
| 92 | `--text-inactive` — сім правил, і жодне не відрендерилось у заміряному датасеті |  |
| 93 | `--surface-quiet` 4.471 — записано й закрито (2026-10-07). |  |
| 95 | СКАН КОНТРАСТУ МУСИТЬ ЧИТАТИ ТОКЕНИ З `:root`, А НЕ ЗНАТИ ЇХ HEX |  |
| 97 | Пілюля нижньої навігації ловиться в середині транзиції (механізм, 2026-10-07). |  |
| 98 | `.tablescroll` недетерміновано дістає `.is-scrollable` (2026-10-07). |  |
| 102 | ОБХІД ПРЕДКІВ БРЕШЕ ПРО КОНТРАСТ НАД МЕШЕМ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ | → **D** for a designer |
| 104 | Банери `over_limit` / `updates_*` / `canceled` недосяжні з датасету `dashB` за |  |
| 106 | `OPENERS.usersModal` ДО МОДАЛКИ НЕ ДОХОДИТЬ (2026-10-07). |  |
| 107 | `invoices.html@768` недетермінований на переповненні (2026-10-07). |  |
| 108 | `.sg-item` не обрізає свій `.tablescroll` на телефоні (2026-10-07). | → **D** for a designer |
| 109 | Номери в `TRIAGE.md` — ПОЗИЦІЇ, не id (2026-10-07). |  |
| 110 | Категорії в `tools/triage.py` — це судження, і воно ревізується (2026-10-07). |  |
| 119 | `sweep.js` НЕ БАЧИТЬ МЕШУ ВЗАГАЛІ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ |  |
| 120 | ТРИ `background-image` МЕШУ СЕРІАЛІЗУЮТЬСЯ ЯК `color(srgb …)` (2026-10-07). |  |
| 121 | Дизер градієнта розійшовся на ±1/255 у 0.125% каналів (2026-10-07). |  |
| 124 | `Landing › Gradient` — ЄДИНЕ ВІДКРИТЕ ПОРІВНЯННЯ ДИЗАЙНУ (2026-10-07). | → **A** for a designer |
| 125 | ГРУПА 2 `DEAD.md` ПІД ПІДОЗРОЮ ТАМ, ДЕ КЛАС ПИШЕТЬСЯ ЛИШЕ ПІД НЕДЕФОЛТНИМ |  |
| 127 | `.faq-cat` — ДІРА В ЦЕНЗІ МЕРТВОГО, ЗНАЙДЕНА ПАСОМ ПРО ТОВЩИНУ РАМКИ |  |
| 144 | ЗАМІР КЕРУЄ РИШТУВАННЯМ, А НЕ УСПАДКОВУЄ ЙОГО (2026-10-02). |  |
| 148 | `csscheck.py` не бачить зіпсованих коментарів (2026-10-02). |  |
| 149 | `MODALS.md` §3.2 і §3.3 описують версію з `flex-wrap` (2026-10-02) — у файлі є |  |
| 150 | −53px на 944 у модалі заміряно й не пояснено (2026-10-02). |  |
| 151 | Згрупований режим інстансів і `tableframe`/`mesh` не в сітці мертвих селекторів |  |
| 152 | Модалка авторизації не в сітці заміру (2026-10-02) — їй потрібна сесія `out`, а |  |
| 153 | 15 із 16 діалогів спільного `#overlay` не міряні (2026-10-02). |  |
| 154 | БЛОК «ФАЙЛИ» І СПИСОК СТОРІНОК РОЗХОДИЛИСЬ ІЗ РЕПОЗИТОРІЄМ У ПʼЯТИ МІСЦЯХ |  |
| 160 | Одинадцять ролей позначені непевними (2026-10-02), найспірніша — `.field > label` |  |
| 164 | 559 — стверджене число, виведене з заміру (2026-10-02, другий пас). |  |
| 169 | `data-tableframe` лишився константою (2026-10-01). |  |
| 170 | Ключі `licBar`, `licTable`, `licZone`, `licPlan`, `homeBlocks`, `bannerLayout`, |  |
| 172 | ДВАНАДЦЯТЬ НЕЗАКРИТИХ ПОРІВНЯНЬ У СМУЗІ (аудит 2026-10-01). | → **A** for a designer |
| 173 | `Payment` і `Credit` стоять на `landing` і `signin` (аудит 2026-10-01) — білінг |  |
| 174 | Три роди контролів лежать в одному ряду: дані · порівняння · навігація. |  |
| 177 | `signin.html` не має жодного посилання В ПРОДУКТІ, окрім осі в смузі налаштувань. |  |
| 181 | Прогін сторінок міряв ДВІ ширини, 1280 і 375 — рівно ті, де все гаразд. |  |
| 182 | 25 повторно оголошених класів не прочитані (2026-10-01). |  |
| 183 | Варіант 3 має ВЛАСНІ стопи й розмір (2026-10-01). | → **D** for a designer |
| 222 | Специмена тулбара C у стайлгайді немає (2026-09-30). | → **D** for a designer |
| 223 | НА ТЕЛЕФОНІ НЕМА ЖОДНОЇ ПОВЕРХНІ НАЛАШТУВАНЬ (2026-09-30, наслідок вибору). | → **D** for a designer |
| 225 | `instView` лишився поза системою — світч на тулбарі Instances, а не таб смуги. |  |
| 226 | `Purchase` не показується на лендінгу, хоч звідти можна почати покупку: `when` |  |
| 227 | `settingsContext()` лишився з попереднім імʼям, хоч панелі налаштувань уже нема. |  |
| 230 | Специмени банерів у стайлгайді написані літеральними `tone-*` і не слухають | → **D** for a designer |
| 251 | Видимість усередині модалки не можна міряти `offsetParent` — він `null` для всього |  |
| 256 | Ліниву дозавантажку фіда не перевірити в цій панелі — і ніколи не було можна. |  |
| 258 | Розгорнута смуга станів накриває останні 176px сторінки (2026-09-29, за запитом). |  |
| 264 | Група `Table frame` лишається в ⚙ і на Home з картками, де жодної таблиці нема. |  |
| 271 | Смуга станів знає лише дві поверхні. |  |
| 272 | ЧЕКЕР ІКОНОК НЕ ЗНАЄ ЧЕТВЕРТОГО НАПИСАННЯ: HTML-СУТНОСТІ СТРІЛКИ. |  |
| 276 | Запит пошуку не переживає свап тулбарів Licenses — свідомо (див. |  |
| 286 | `--bg` більше не ґрунт жодної поверхні (2026-09-28). |  |
| 292 | Пропущені перевірки — додані ДЕМО-ДАНІ (2026-09-25). |  |
| 294 | Варіант B на телефоні не стилізований — свідомо, показаний «як є» на прохання. | → **D** for a designer |
| 298 | `AUDIT.md` застарів. |  |
| 310 | `AUDIT.md` List C — 37 кластерів і жодного рішення. |  |
| 312 | `prototypeaddons` не має лінка у флоу: у датасетах такого рядка немає, тож |  |
| 349 | Log in не чіпає `billingData`. |  |
| 355 | Дрібні свідомі рішення (можуть «повернутися» питанням): Users сортовані Created |  |
| 358 | `.claude/launch.json` містить сесійний scratchpad-шлях (див. |  |
| 364 | Специмен `#groupedcheck` у стайлгайді розходиться з продуктом: `feedGroupItem` кладе |  |
| 365 | Мертвий коментар у `styles.css` перед блоком `.acttypemenu`: абзац про «chips … |  |
| 380 | GitHub Pages — опубліковано. |  |
| 381 | Claude-артефакт — друга, приватна копія (2026-09-16, оновлено 2026-09-24): |  |

---

## D · Design-system decision — not a developer's call

Open questions about the system itself: which scale a value collapses to, whether a form is a variant, what an axis means. **The answer goes into `SCALES.md` or `COMPONENTS.md` first, and reaches code from there.**

| # | entry | |
|---:|---|---|
| 6 | ЧОТИРИ ЖИВІ ФОРМИ БІЛЬШЕ НЕ МАЮТЬ СПЕЦИМЕНА (2026-10-12). |  |
| 9 | ЩЕ ЧОТИРИ ТАБИ РЕЙКИ ТРЕБА ПЕРЕВІРИТИ ТИМ САМИМ ПИТАННЯМ (2026-10-12). |  |
| 12 | ТРИ ПРАВИЛА CSS ЛИШИЛИСЬ БЕЗ ЖОДНОГО ЧИТАЧА (2026-10-12). |  |
| 13 | `.pill.attn` НАЗВАНИЙ У ЖИВОМУ ТЕКСТІ СТОРІНКИ, АЛЕ `DEAD.md` ЧИСЛИТЬ ЙОГО МЕРТВИМ |  |
| 14 | ТРИ МЕРТВІ ЧИСЛА ЗНАЙДЕНІ В ПРОЗІ, ЯКОЇ НІХТО НЕ ПРОСИВ ПЕРЕВІРЯТИ (2026-10-12). |  |
| 16 | БЛОК ВИНЯТКІВ ТИПОГРАФІКИ ЛИШИВСЯ БЕЗ ВЛАСНИКА (2026-10-12). |  |
| 17 | ТЕПЛІ СІРІ ПОЗА КНОПКОЮ: 20 + 5 ЧИТАЧІВ, ЗАПИСАНІ Й НЕ ЗРУШЕНІ (2026-10-12). |  |
| 18 | `--chromeLine` МАЄ РІВНО ОДНОГО ЖИВОГО ЧИТАЧА (2026-10-12). |  |
| 30 | `.typechip` І `.filterchip` ТЕПЕР ВІДРІЗНЯЮТЬСЯ ЛИШЕ ГАЛОЧКОЮ (2026-10-12). |  |
| 31 | КРОК CAPACITY СТАВ ВИЩИЙ НА 18px (2026-10-12). |  |
| 33 | ПОРОЖНІЙ БОКС ADD-ONS СТОЇТЬ НА x=44, А НЕ НА 16 (2026-10-12). |  |
| 35 | `.nl-couponerr` ТЕПЕР РІЗНИЙ НА ДВОХ ШИРИНАХ (2026-10-09). |  |
| 39 | ID ІНСТАНСА ЦІЛИЙ ЛИШЕ ВІД 390px (2026-10-09). |  |
| 40 | ТОТАЛ ВІЗАРДА ТЕПЕР РУХАЄТЬСЯ НА РЯДОК, КОЛИ КУПОН ВІДПОВІДАЄ ПОМИЛКОЮ (2026-10-09). |  |
| 42 | ТУЛБАР ДІСТАВ 12 ЗВЕРХУ Й ЗНИЗУ ПРИ ГОРИЗОНТАЛЬНИХ 16 (2026-10-09). |  |
| 46 | ЗГРУПОВАНИЙ ВИГЛЯД INSTANCES ЛИШИВСЯ ТАБЛИЦЕЮ НА ТЕЛЕФОНІ (2026-10-09). |  |
| 49 | `.nl-prodcard` ТЕПЕР ПІДНІМАЄТЬСЯ НА ХОВЕРІ Й СІРІЄ НА НАТИСКУ (2026-10-09). |  |
| 50 | СТЕПЕР І КАРТКИ ADD-ON'ІВ ВІДПОВІДАЮТЬ НА ВКАЗІВНИК РІЗНИМИ МЕХАНІЗМАМИ (2026-10-09). |  |
| 53 | ЧОТИРИ КЕБАБИ СТАЛИ ТРЬОМА (2026-10-09). |  |
| 54 | `--hover` `#f0f0ee` ЛИШАЄТЬСЯ У 30 ПРАВИЛАХ (2026-10-09). |  |
| 55 | ВИБРАНИЙ ADD-ON НЕ ВІДПОВІДАЄ НА ВКАЗІВНИК (2026-10-09). |  |
| 56 | РАМПА SECONDARY ТЕПЕР 0 / .04 / .14 (2026-10-09). |  |
| 57 | ТРИ МЕТРИКИ UBUNTU СТОЯТЬ ЛІТЕРАЛАМИ В `calc()` ЯКОРЯ ЛІЧИЛЬНИКА (2026-10-09). |  |
| 61 | `--sel` `#e4e4e0` ЛИШАЄТЬСЯ ТЕПЛИМ СІРИМ У СЕМИ ПРАВИЛАХ (2026-10-08). |  |
| 63 | `.btn--menu` — ЦЕ GHOST ІНШОГО РОЗМІРУ, І ЗГОРТАТИ ЙОГО ЧИ НІ — ВІДКРИТЕ (заміряно |  |
| 69 | `.btn--menu` НЕ НАКРИТИЙ НОВИМ ОПИСОМ SECONDARY (2026-10-08). |  |
| 73 | ДОВЖИНУ `Instance ID` НЕ СКОРОЧЕНО (2026-10-08). |  |
| 75 | СПИСКИ ІНВОЙСІВ І АКТИВНОСТІ В МОДАЛЦІ ЛІЦЕНЗІЇ ВСЕ ЩЕ ЙДУТЬ ВПРИТУЛ (2026-10-08). |  |
| 78 | ДВІ РУНГИ ЗАМІСТЬ ОДНОЇ НА ОСІ `z-index` (2026-10-08). |  |
| 79 | ЕЛЕВАЦІЯ ДЛЯ БІЛОЇ КНОПКИ НА КОЛЬОРОВОМУ ҐРУНТІ ПРОСИТЬ ЧЕТВЕРТОГО РІВНЯ (2026-10-08, |  |
| 87 | Пʼять із девʼяти колізій help-і-hint лишились (2026-10-07). |  |
| 88 | `.field > label` і `.dwelcome p` — та сама форма, не чіпані (2026-10-07). |  |
| 91 | Девʼять help-і-hint стоять `--mid` 16px під лейблом `--mid` 16px (2026-10-07). |  |
| 99 | `.pg-d` проходить тонко над градієнтом (2026-10-07). |  |
| 100 | КОНТРАСТ: ЧИСЛА ЗАМІРЯНІ, РІШЕННЯ НЕ УХВАЛЕНЕ (2026-10-07). | → **A** for a designer |
| 101 | Зелений має ЛАТЕНТНУ діру на `--surface-quiet` (2026-10-07). |  |
| 103 | Гліф `tone-black` на банері Home — рішення, не правка (2026-10-07). |  |
| 111 | ПʼЯТНАДЦЯТЬ ОДНОСТОРОННІХ ПРАВИЛ ЧЕКАЮТЬ НА ОДНЕ ПИТАННЯ КОЖНЕ (2026-10-07). |  |
| 112 | `.lic-row,.inv-row,.inst-row` — ТРИ З ЧОТИРЬОХ, І ЦЕ НЕ ОГЛЯД (2026-10-07). |  |
| 113 | ВІСЬ ГРУНТУ ДЛЯ КНОПКИ ВЖЕ ЗАСЛУЖЕНА, І СВІТЛИМИ ПОВЕРХНЯМИ |  |
| 114 | Чіп має три висоти — 26 / 32 / 40 (2026-10-07). | → **A** for a designer |
| 116 | Фонова межа телефона написана двічі (2026-10-07). | → **B** for a designer |
| 117 | КЛАС ВАДИ «ПЕРЕКРИТИЙ ЗАВЖДИ, ЗАМАПЛЕНИЙ ВСЕ ОДНО» — ДВА ВИПАДКИ, |  |
| 118 | Два рінги поза шісткою токенів (2026-10-07). |  |
| 122 | ГРАДІЄНТ ТЕПЕР НА ТРЬОХ ПОВЕРХНЯХ, І ДВІ З НИХ ПОРІВНЯННЯ НЕ СТОСУВАЛОСЬ |  |
| 123 | Два кольори градієнта лишились літералами (2026-10-07). |  |
| 128 | `320` У `shared.js:2085` НЕ МАЄ ЧИМ СТАТИ (2026-10-07). | → **B** for a designer |
| 129 | ДВА НАМІРИ ЗГОРНУТО НАВМИСНО, І ЇХ БІЛЬШЕ НІЩО НЕ ВИРАЖАЄ (2026-10-07). |  |
| 133 | Activity на 390 став на 869px довшим (2026-10-06) — ПРИЙНЯТО, не борг. |  |
| 134 | МОДЕЛЬ «НЕГАТИВ = ЗАПЕРЕЧЕННЯ ІНСЕТА» ПОКРИВАЄ ТРЕТИНУ (заміряно 2026-10-06). |  |
| 137 | `--s-own` тепер ПЕРЕДУМОВА пасу спейсингу, а не пункт у черзі (2026-10-06). |  |
| 141 | СКРОЛ МІЖ 601 І 952 — ПРИЙНЯТИЙ, НЕ ВІДКРИТИЙ (рішення 2026-10-05). |  |
| 143 | КРОК CAPACITY СКРОЛИТЬСЯ НА 600 — ЦЕ РІШЕННЯ (2026-10-02). |  |
| 147 | ЗМІНА РЕЖИМУ ЗАГОРТАННЯ — ЦЕ ЗМІНА ВНУТРІШНЬОГО РОЗМІРУ (2026-10-02). |  |
| 161 | `--t-body-sm-fs` (15px) не має жодного читача (2026-10-02) — токен лишився, бо |  |
| 162 | Текст на телефоні тепер 16/1.40, десктоп 16/1.50 (2026-10-02). |  |
| 163 | `mockInvoiceUrl` — ДРУГА СИСТЕМА ТИПОГРАФІКИ (2026-10-02). | → **A** for a designer |
| 171 | Три порівняння ще відкриті: `Home › Layout` (таблиці/картки), `Everywhere › Alert |  |
| 176 | Проміжок між картками планів виріс на 20% трека (2026-10-01). |  |
| 178 | Три нові спільні будівники (`syncAppliedRow`, `wireSheetTrigger`, |  |
| 179 | Період на телефоні втратив ОДНУ річ, і це свідомо: поля дати в шіті відкриваються |  |
| 189 | ТЕЛЕФОННИЙ ТУЛБАР Є ТІЛЬКИ В C (2026-10-01, за рішенням). |  |
| 193 | `licPlan: side` падає в `stacked` на ≤600 (2026-10-01). | → **B** for a designer |
| 203 | Опис `Description` прибитий до гарнітури (2026-10-01). |  |
| 204 | Порожній стан Production тепер веде в доку, а Development вів туди й раніше — |  |
| 205 | Опис locked-рядків зведений до одного речення на ВСІ три (2026-10-01). |  |
| 206 | `DEVICES_DESC` лишився з одним читачем — редагований рядок девайсів. |  |
| 207 | Вісь `licPlan` не має мобільного трактування (2026-10-01). |  |
| 208 | `subgrid` у варіанті `side` — progressive enhancement. |  |
| 215 | ПАНЕЛЬ ЛІЦЕНЗІЇ БІЛЬШЕ НЕ КАЖЕ НІЧОГО ПРО ТЕ, ЩО РОБИТИ З КЛЮЧЕМ, І БІЛЬШЕ НЕ | → **A** for a designer |
| 238 | ТЕМНОЇ ТЕМИ НЕМАЄ, І ЦЕ ТЕПЕР НАЗВАНО (2026-09-30). | → **A** for a designer |
| 248 | ПОГЛИНУТО ЗАПИСОМ ПАСУ 15 ВИЩЕ («панель більше не каже нічого про ключ і не веде |  |
| 315 | Дані рядка → деталі зведені: деталі тепер керуються об'єктом ліцензії (не `PAGES`) — |  |

---

## E · Closed

Struck through in `NOTES.md` and kept for the reasoning. **Listed so nobody re-opens them by reading the list and not the strikethrough.**

| # | entry | |
|---:|---|---|
| 5 | ТРИ СТАНИ, ЯКИХ У ПРОДУКТІ НЕМАЄ, ЗНАЙДЕНІ МАТРИЦЕЮ ІНПУТІВ (2026-10-12). |  |
| 20 | `--chrome` НЕ ЧИТАЄ НІЩО ЖИВЕ (заміряно 2026-10-12). |  |
| 21 | «ТЕПЛИЙ ХРОМ МЕРТВИЙ» — ПОЛОВИНА ЦЬОГО ХИБНА (заміряно 2026-10-12). |  |
| 24 | ПРЕСОВАНИЙ ЧІП `Needs attention` НЕ ПІДТЯГУЄ СЕБЕ У ВИДИМІСТЬ — ЗАЯВА БУЛА ХИБНА |  |
| 65 | `.btn--menu` ВІДПОВІДАЄ НА ВКАЗІВНИК НАПОЛОВИНУ (заміряно 2026-10-08). |  |
| 66 | `PAINT_PROPS` У `sweep.js` НЕ МІСТИТЬ `border-color` (2026-10-08). |  |
| 67 | SECONDARY ЯК КОНТУР: ЗНАЧЕННЯ ОБВОДКИ НЕ ОБРАНЕ, ЗБІРКА ЗАЧЕКАНА (2026-10-08). |  |
| 68 | ПЕЙДЖЕР — ПʼЯТИЙ КЛАС ХОСТІВ, І ПРО НЬОГО НІХТО НЕ ПИТАВ (2026-10-08). |  |
| 70 | `--ring-hairline` — ФІКСОВАНИЙ СІРИЙ `#c9c9c9`, 1.70 на білому (заміряно 2026-10-08). |  |
| 71 | ДЕФОЛТНИЙ ДЕМО-АКАУНТ ТЕПЕР ПОКАЗУЄ АДРЕСУ, А НЕ ІМʼЯ (2026-10-08). |  |
| 74 | «ШИРИНА ЯК DESCRIPTION» ВИКОНАНА ЯК ШИРИНА РЯДКА, НЕ КОНТРОЛА (2026-10-08). |  |
| 81 | `signin.html` НЕ МАЄ ФУТЕРА, І ТЕПЕР ТАМ НЕМА ЖОДНОГО МАРШРУТУ ДО ЮРИДИЧНИХ СТОРІНОК |  |
| 83 | `paintDiff` РАХУЄ НЕПАРНІ ЛИШЕ В «ПІСЛЯ» (2026-10-08). |  |
| 84 | ІМʼЯ АКАУНТА БІЛЬШЕ НЕ ЗБИРАЄТЬСЯ ПРИ РЕЄСТРАЦІЇ (2026-10-08, наслідок пункту 2). |  |
| 94 | `--faint` ПРОВАЛЮЄ AA ЯК ТЕКСТ У 507 МІСЦЯХ ЗАКРИТО 2026-10-07 (батч |  |
| 96 | ПАРНИЙ ПРОГІН МУСИТЬ МАТИ ПРЕ-ФЛІТ «ЦЯ URL РЕНДЕРИТЬ СВОЮ СТОРІНКУ» |  |
| 105 | `path()` У `sweep.js` КЛЮЧУЄ ЕЛЕМЕНТ ЙОГО КЛАСАМИ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ, |  |
| 131 | ТОПБАР — НАСТУПНИЙ ПАС, І ВІН ІДЕ САМ (2026-10-06). |  |
| 142 | 48px ПОВІТРЯ БІЛЯ AMOUNT ДІЄ НА ОДНІЙ ПОВЕРХНІ З ТРЬОХ ВИРІШЕНО |  |
| 145 | `MODALS.md` названо чотири не-типографічні вади, жодна не полагоджена |  |
| 146 | Одинадцять рядків сітки `MODALS.md` досі міряні ЗІ смугою (2026-10-02) |  |
| 157 | `mirror.sh` живе в scratchpad, як і `roles.py` (2026-10-01) ЗАКРИТО |  |
| 158 | ЗВІТ ПРО ПОЛОМКИ ПАСУ 2 НЕ ЗРОБЛЕНИЙ ЗАКРИТО 2026-10-01 — повний звіт |  |
| 159 | Класифікація 173 декларацій живе у scratchpad (`ds/roles.py`), не в репо |  |
| 243 | СТЕПЕР ПРИ ПʼЯТИ КРОКАХ ВИЛАЗИТЬ ЗА ВІКНО ЗАКРИТО 2026-09-30 (пас 15), |  |
| 266 | СІМ БЛОКІВ ЗАПИТУ 2026-09-28 НЕ ПОЧАТО ЗАКРИТО 2026-09-29 (другий |  |
| 267 | ТРИ РІШЕННЯ, ЯКІ ТОЙ ЗАПИТ СКАСОВУЄ ЗАКРИТО 2026-09-29: усі три |  |
| 269 | `card_expiring` недосяжний із чистого демо ЗАКРИТО 2026-09-28 |  |
| 270 | `settingsContext().home` і `.details` більше ніхто не читає ПОЛОВИНА |  |
| 274 | У барі два ховер-фони ЗАКРИТО 2026-09-28 (десятий батч): обидва читають |  |
| 278 | Три різні відповіді на «як цей список гортається» ЗАКРИТО 2026-09-28 |  |
| 279 | Моделі кнопки бракує осі «на чому вона стоїть» ЗАКРИТО 2026-09-28. |  |
| 281 | Колір — єдиний носій у колонці Status. |  |
| 284 | Три речення згорнутої групи кажуть дату тричі. |  |
| 290 | `--status-ok` (#009A4F) не проходить AA як текст: 3.66:1 ЗАКРИТО |  |
| 291 | `Rename` у кебабі на сторінці Instances не робить нічого ЗАКРИТО |  |
| 295 | Пройдені кроки степера не клікабельні знято 2026-09-25 (четвертий батч): |  |
| 311 | Превʼю Invoices і Users на дашборді — статичні копії виправлено: дашборд |  |
| 313 | `AMF` не знає про плани / статичні лейбли markup TB-словами знято разом |  |
| 314 | TBMQ не має детальних сторінок виправлено: TBMQ-рядки (sub і perp) відкривають |  |
| 319 | Search-інпути невізуальні виправлено 2026-09-17: `wireSearch()` фільтрує з |  |
| 321 | ЧЕКАЄ НА URL: `EXT.install` виправлено 2026-09-18: |  |
| 326 | Фільтр до нуля на Licenses не показує нічого. |  |
| 335 | `CHECKIN_INTERVAL_H = 24` не підтверджений ВИПРАВЛЕНО 2026-09-22: перевірка щогодини. |  |
| 340 | Повернення при зниженні плану. |  |
| 351 | Таблиця Invoices всередині деталей на телефоні рве заголовки виправлено |  |
| 360 | Залишки Vite-збірки в корені прибрано перед публікацією: `package.json`, |  |
| 367 | Пейджери Licenses та Invoices досі інертні. |  |
| 368 | Пейджери Licenses та Invoices досі інертні — і 2026-09-28 це стало ВИДИМИМ. |  |

