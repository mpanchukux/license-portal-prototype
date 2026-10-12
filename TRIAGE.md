# Triage — the debt, read by who has to act on it

**`NOTES.md` keeps 354 debt entries in one list, newest first. That list is a log: it
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
| **A** | Blocked — needs an answer before anyone writes code | 50 |
| **B** | Build it — and do not copy this | 118 |
| **C** | Prototype-local — a developer can ignore all of it | 76 |
| **D** | Design-system decision — not a developer's call | 65 |
| **E** | Closed | 45 |
| | **total** | **354** |

⚠️⚠️ **The honest headline: 50 entries block implementation and most of them are NOT design.**
They are unconfirmed prices, `inferred` version numbers, copy waiting for approval and 2
legal questions. **The redesign is further along than the facts it is drawn on.**

## ⚠️⚠️ The designer reading, which is the part worth arguing with

`SCALES.md` and `COMPONENTS.md` are the record for designers and developers both, so the same
entry can sit in two places depending on who picks it up. **These are the ones that move, and
the move is the finding** — not a second opinion about the same thing.

| # | entry | dev | designer | why it moves |
|---:|---|:---:|:---:|---|
| 62 | `ti-repeat` ×11 — `aria-hidden`, АЛЕ НЕСЕ ФАКТ ПРО АВТОПЛАТІЖ (2026-10-07). | B | **D** | a glyph marked decorative that sighted readers use as data is a question about what the mark should say, not about its colour |
| 63 | `.link` ×27 — ЄДИНИЙ МАРШРУТ ДО PRIVACY, TERMS І ЛІЦЕНЗІЙНОЇ УГОДИ (2026-10-07). | B | **D** | whether a link needs a cue beyond being a link is a design decision; the developer just needs to know it has none |
| 73 | КОНТРАСТ: ЧИСЛА ЗАМІРЯНІ, РІШЕННЯ НЕ УХВАЛЕНЕ (2026-10-07). | D | **A** | an undecided accessibility floor blocks handoff — for a developer it is not a preference to wait on |
| 75 | ОБХІД ПРЕДКІВ БРЕШЕ ПРО КОНТРАСТ НАД МЕШЕМ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ | C | **D** | a contrast checker that reads the wrong ground will certify the gradient as passing — the designer owns the surface it lies about |
| 81 | `.sg-item` не обрізає свій `.tablescroll` на телефоні (2026-10-07). | C | **D** | a specimen box that overflows its own border on a phone is the design system failing to show itself |
| 87 | Чіп має три висоти — 26 / 32 / 40 (2026-10-07). | D | **A** | three chip heights is a visible change nobody has decided — a developer needs the number |
| 89 | Фонова межа телефона написана двічі (2026-10-07). | D | **B** | one boundary written twice is a developer trap: two sources, one of them silently wrong |
| 97 | `Landing › Gradient` — ЄДИНЕ ВІДКРИТЕ ПОРІВНЯННЯ ДИЗАЙНУ (2026-10-07). | C | **A** | the last open design comparison — nothing can be handed over with three competing backgrounds |
| 101 | `320` У `shared.js:2085` НЕ МАЄ ЧИМ СТАТИ (2026-10-07). | D | **B** | a z-index with no layer to become is a developer decision at implementation time |
| 105 | ТОПБАР МАЄ ВЛАСНУ РОДИНУ КОНТРОЛІВ ПОЗА КОМПОНЕНТОМ КНОПКИ — ПИТАННЯ ДО ФАЗИ | B | **D** | the topbar's own control family is a component question before it is a fix |
| 136 | `mockInvoiceUrl` — ДРУГА СИСТЕМА ТИПОГРАФІКИ (2026-10-02). | D | **A** | a second type system in a generated document is a system question, not a page bug |
| 145 | ДВАНАДЦЯТЬ НЕЗАКРИТИХ ПОРІВНЯНЬ У СМУЗІ (аудит 2026-10-01). | C | **A** | twelve unclosed comparisons are twelve undecided designs, not prototype plumbing |
| 156 | Варіант 3 має ВЛАСНІ стопи й розмір (2026-10-01). | C | **D** | variant 3 carries its own stops: that is a design fact, now the shipped one |
| 166 | `licPlan: side` падає в `stacked` на ≤600 (2026-10-01). | D | **B** | side falling back to stacked at <=600 is the missing mobile treatment, which a developer must build |
| 186 | ЗЕЛЕНИЙ СТАТУС У ШАПЦІ ЛІЦЕНЗІЇ — 4.24:1 (заміряно 2026-09-30, пас 15). | B | **A** | 4.24:1 is a token value, not a page bug — the green has to change, which changes every surface |
| 188 | ПАНЕЛЬ ЛІЦЕНЗІЇ БІЛЬШЕ НЕ КАЖЕ НІЧОГО ПРО ТЕ, ЩО РОБИТИ З КЛЮЧЕМ, І БІЛЬШЕ НЕ | D | **A** | the panel no longer says what to do with the key: copy that has to exist before build |
| 195 | Специмена тулбара C у стайлгайді немає (2026-09-30). | C | **D** | a missing specimen is missing documentation of a shipped decision |
| 196 | НА ТЕЛЕФОНІ НЕМА ЖОДНОЇ ПОВЕРХНІ НАЛАШТУВАНЬ (2026-09-30, наслідок вибору). | C | **D** | no settings surface on the phone is a consequence of a layout choice |
| 201 | ЧЕРВОНА МАРКА НА INK — 3.35:1 (заміряно 2026-09-30, пас 13). | B | **A** | 3.35:1 on ink: same, and it is the one place colour carries tone alone |
| 202 | В INK-ФОРМІ НА ПАНЕЛІ ЛІЦЕНЗІЇ ТОН НЕСЕ ТІЛЬКИ КОЛІР (2026-09-30, пас 13). | B | **A** | tone carried by colour alone breaks the rule the system states about itself |
| 203 | Специмени банерів у стайлгайді написані літеральними `tone-*` і не слухають | C | **D** | specimens written as literals document a scale the product no longer has |
| 206 | СТАТУС НА КАРТЦІ ІНВОЙСА: РЕФЕРЕНС ПРОСИТЬ ПІЛЮЛЮ, СТОЇТЬ КОМПОНЕНТ (2026-09-30). | B | **D** | reference asks for a pill, the component is there: which one wins is a design call |
| 210 | ЛІД БАНЕРА ПАНЕЛІ НЕ ПРОХОДИТЬ AA: 4.48:1 (заміряно 2026-09-30). | B | **A** | 4.48:1 on the panel lead — a type/colour pairing decision before it is a fix |
| 211 | ТЕМНОЇ ТЕМИ НЕМАЄ, І ЦЕ ТЕПЕР НАЗВАНО (2026-09-30). | D | **A** | no dark theme at all: for a developer a non-requirement, for a designer an unanswered half of the system |
| 234 | Заголовок секції карткової розкладки — 20px, референс просить 24. | B | **D** | 20px against a reference asking ~24 is a scale decision, not a defect |
| 253 | `.plantable` — обрамлена таблиця на 69% ширини секції (записано 2026-09-27). | B | **D** | a framed table at 69% of the section is a layout decision that was never taken |
| 261 | `.infoic` чекає на власний компонент. | B | **D** | the info icon is waiting for a component, which is this phase's work |
| 262 | 22 `<button class="link">` поза кнопкою — текст усередині речень. | B | **D** | 22 button.link outside the component is the boundary of the button model |
| 267 | Варіант B на телефоні не стилізований — свідомо, показаний «як є» на прохання. | C | **D** | an unstyled variant cannot be compared, so the comparison cannot close |
| 272 | КОНТРАСТ: чотири рядки нижче AA, усі `--mid` `#6b6b6b` 14px, усі лише В СПОКОЇ. | B | **A** | four lines below AA, all --mid at 14px: one token, every surface |
| 277 | Десять брейкпоінтів, а ноутси кажуть «один ≤600px»: 600, 601, 640, 700, 760, 820, | B | **A** | ten breakpoints against a documented one: the developer builds from whichever list is true |
| 327 | Колонкові заголовки на Home просили «зменшити, але ≥14px» — а 14px і є поточне | B | **D** | 'smaller but >=14px' is the floor the scale already sets |

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
| **copy** | 12 | a sentence waiting for approval, or missing entirely |
| **engineering** | 11 | a data or release fact the prototype guessed |
| **pricing** | 6 | a number nobody has confirmed in writing |
| **design** | 3 | a team decision, twice deferred |
| **legal** | 2 | questions that are not ours to answer |

| # | owner | entry | |
|---:|---|---|---|
| 16 | copy | ПЛЕЙСХОЛДЕР ІНВАЙТУ НЕ ВЛАЗИТЬ, І РОЗКЛАДКА ЦЬОГО НЕ ВИРІШУЄ (2026-10-09). |  |
| 21 | copy | НА 375px КНОПКИ ACCOUNT І BILLING ВСЕ ОДНО ПЕРЕНОСЯТЬСЯ (2026-10-09). |  |
| 222 | copy | ПРОДУКТ БІЛЬШЕ НІДЕ НЕ КАЖЕ, ЩО КЛЮЧ ВВОДИТЬСЯ В ThingsBoard АБО TBMQ |  |
| 266 | copy | ФАКТ ПРО 12 МІСЯЦІВ ОНОВЛЕНЬ НЕ СКАЗАНИЙ НІДЕ НА ПРОДАВАЛЬНІЙ ПОВЕРХНІ. |  |
| 295 | copy | `TAX_NOTE` — копірайт очікує підтвердження команди. |  |
| 297 | copy | Опису не мають: `assets`, `sessions`, `msg/sec`. |  |
| 300 | copy | `WL_DESC` — `inferred` копірайт, чекає підтвердження. |  |
| 307 | copy | «Вся ліцензія блокується» за перевищення ліміту інстансів — ПОПЕРЕДНЄ формулювання. |  |
| 318 | copy | Формулювання маркера для заблокованої ліцензії. |  |
| 319 | copy | Речення про датування терміну оновлень — відкритий конфлікт. |  |
| 343 | copy | Голос активності виконаний не повністю (2026-09-24, девʼятий батч). |  |
| 350 | copy | Чотири константи копірайту лишились у `data.js` без жодного читача. |  |
| 17 | design | ЧОТИРИКОЛІРНОЇ «G» GOOGLE У ПРОДУКТІ НЕМАЄ (2026-10-09). |  |
| 45 | design | ГАЛКИ КАРТОК ПЛАНІВ І ІКОНКИ CAPACITY/ADD-ONS: ПОВІДОМЛЕНІ ЯК ЗНИКЛІ, ЗАМІРОМ НА |  |
| 312 | design | КОЛІР ПОМИЛКИ проти монохрому — рішення за командою, двічі відкладене. |  |
| 293 | engineering | Auth-форми нічого не перевіряють (див. |  |
| 298 | engineering | Адресний блок на Billing у новому акаунті показує чужу адресу — ВСЕ ЩЕ ВІДКРИТЕ. |  |
| 302 | engineering | Пояснення про оновлення недосяжне на телефоні. |  |
| 305 | engineering | ВІДКРИТЕ ПИТАННЯ, і 2026-09-22 воно стало конкретнішим: яку ВЕРСІЮ ThingsBoard |  |
| 315 | engineering | `LATEST_VERSION = '3.9.4'` і версії інстансів — `inferred`. |  |
| 321 | engineering | `Forgot password?` — стаб. |  |
| 335 | engineering | Причини провалу перевірки — три, і це стеля даних. |  |
| 336 | engineering | `CHECK_WINDOW_DAYS = 3` — `inferred`. |  |
| 344 | engineering | Пʼять засіяних шейпів досі без живого писача (2026-09-24, інвентар активності): |  |
| 345 | engineering | Два формати таймстемпа в сирці: `Aug 17 2026, 16:20` у data.js проти |  |
| 346 | engineering | `PRODUCT_CHOICES[].ic` став фолбеком, який ніколи не спрацьовує. |  |
| 306 | legal | ВІДКРИТЕ ПИТАННЯ (записано 2026-09-18, §12): ліцензійна угода в футері — загальна. |  |
| 320 | legal | Чи потрібна юридична згода в Change plan / Manage add-ons. |  |
| 291 | pricing | «From $X / mo» у прототипі НЕМАЄ. |  |
| 309 | pricing | `UPDATES_RENEW_RATE = 0.40` не підтверджений документом — теж усна цифра. |  |
| 310 | pricing | Ціни на «вільні» девайси перпетуала немає. |  |
| 314 | pricing | `COUPON_RATE = 0.20` і саме правило купона — стаб. |  |
| 329 | pricing | Докупка AI на перпетуалі: разова ціна за місячну квоту. |  |
| 330 | pricing | NL-флоу — inferred ціни: perp-юніти (TB prod $1,999 / AI $500 / TBMQ prod $999) |  |
| 233 | product | ЛІЧИЛЬНИК RECENT ACTIVITY — ВІДКРИТЕ РІШЕННЯ (2026-09-29). |  |
| 278 | product | У TBMQ немає плану «Business». |  |
| 279 | product | «Updates period over» на Home не показується і з теперішньою пʼятіркою не може: |  |
| 280 | product | Free-рядок показує «—» у колонці стану. |  |
| 289 | product | ВІДКРИТЕ РІШЕННЯ: що робити з ліцензіями на Maker / Prototype в датасеті. |  |
| 290 | product | Change plan на legacy-плані не має якоря. |  |
| 296 | product | Блок `Included in every plan` для TBMQ ЗНЯТО 2026-09-22, не заповнено. |  |
| 301 | product | `Enabled` для White labeling сьогодні недосяжний з даних. |  |
| 303 | product | Info-іконка покриває два рядки з шести. |  |
| 325 | product | `Renew subscription` на скасованій — secondary, хоч це єдина дія зони 4. |  |
| 326 | product | Сортування колонок — тепер ЄДИНИЙ контрол, який видимо реагує й нічого не |  |
| 334 | product | ВІДКРИТЕ: чи показує Home перевірки інстансів. |  |
| 342 | product | Заголовок групи на Change plan. |  |
| 347 | product | ВІДКРИТЕ (2026-09-24, сьомий батч): `Renew software updates` не їде на шеллі |  |
| 348 | product | ВІДКРИТЕ (2026-09-24, восьма правка): лічильник банера і список, куди він веде, |  |
| 349 | product | Дві перпетуальні картки описані по-різному (2026-09-24, шоста правка). |  |

---

## B · Build it — and do not copy this

The surface is decided. These are defects measured in the prototype: overflow, contrast, a wrong `aria-label`, a rule that wins by position, a token used without being declared. **Read as: this is what the prototype does wrong at this spot.** Several are one-line fixes in a real build and exist here only because the prototype is hand-written CSS.

| # | entry | |
|---:|---|---|
| 5 | `.lic-typeseg` НА 320 ГОРТАЄТЬСЯ 29px ЗАМІСТЬ 13 (2026-10-12). |  |
| 10 | `[hidden]` ПРОТИ `display` — СІМ ВИПАДКІВ, І ЖОДНОГО ЧЕКЕРА (2026-10-09). |  |
| 18 | ТРИ РІЗНІ ЗАПИСИ ПРО ОДНУ Й ТУ САМУ ВАДУ СПЕЦИФІЧНОСТІ (2026-10-09). |  |
| 25 | НЕПРОЗОРА ЗАЛИВКА ДИСКА ✕ — ТРЕТІЙ ВИПАДОК «ЗНАЧЕННЯ ПІД ОДИН ФОН», І ЄДИНИЙ |  |
| 31 | `.5px` НЕ ПЕРЕВІРЕНА НА 1x ЕКРАНІ (2026-10-09). |  |
| 32 | ОБГОРТКОВИЙ СПАН ЛЕЙБЛА ЧІПА ДІСТАВСЯ `+ Add label` (2026-10-09). |  |
| 33 | `.perbtn` ЗНОВУ НЕСЕ НЕПРОЗОРУ СІРУ ЗАЛИВКУ, І ЦЕ СВІДОМО (2026-10-08). |  |
| 37 | ВІДМОВИ `button()` ДЛЯ `menu` ЖИВУТЬ У ДВОХ МІСЦЯХ (`shared.js:230` і `:343`, |  |
| 50 | `--accent-soft` — ПЕРШИЙ `color-mix` У ПРОДУКТОВОМУ ПРАВИЛІ (2026-10-08). |  |
| 53 | `Sign in` У ПУБЛІЧНІЙ ШАПЦІ — СІРИЙ НА `--page-bg` (заміряно 2026-10-08). |  |
| 62 | `ti-repeat` ×11 — `aria-hidden`, АЛЕ НЕСЕ ФАКТ ПРО АВТОПЛАТІЖ (2026-10-07). | → **D** for a designer |
| 63 | `.link` ×27 — ЄДИНИЙ МАРШРУТ ДО PRIVACY, TERMS І ЛІЦЕНЗІЙНОЇ УГОДИ (2026-10-07). | → **D** for a designer |
| 88 | `.pagetitlerow` губить підпис `Buy a license` на телефоні (2026-10-07). |  |
| 99 | `?from` у посиланнях на ліцензію більше ніхто не читає (2026-10-07). |  |
| 103 | ІКОНКИ-КНОПКИ ВИРОСЛИ ПО ВСЬОМУ ПРОДУКТУ, І ЗВІТ ПРО ПАС ЦЬОГО НЕ НАЗВАВ |  |
| 105 | ТОПБАР МАЄ ВЛАСНУ РОДИНУ КОНТРОЛІВ ПОЗА КОМПОНЕНТОМ КНОПКИ — ПИТАННЯ ДО ФАЗИ | → **D** for a designer |
| 108 | `.insttoolbar.stickybar` ОГОЛОШУЄ `z-index:12` НА `position:static` ЕЛЕМЕНТІ |  |
| 109 | Візард парує `Billing email` з `Company name` у вужчій колонці (2026-10-06). |  |
| 111 | СМУГА 601–952: ЦИФРИ ЗАМІРЯНІ 2026-10-06, ПОЧИНАТИ З НИХ, А НЕ З «ВОНО |  |
| 112 | ОБГОРТКА, ЯКУ НІХТО НЕ МІРЯЄ, НЕ РОБИТЬ НІЧОГО (знайдено 2026-10-06). |  |
| 113 | Recent invoices на Home: обгортка — СТОПГЕП, не лік (2026-10-06). |  |
| 128 | ТАБЛИЦЯ ІНВОЙСІВ ЛАМАЄ НОМЕР І ДАТУ НАДВОЄ НА 944 (заміряно 2026-10-01). |  |
| 129 | Переповнення топбара на `index` стало на 5px гіршим (заміряно 2026-10-01). |  |
| 138 | Чіпи add-on'ів переносять текст на вузькому десктопі (2026-10-02). |  |
| 139 | Кнопка Copy у рядку ключа переноситься на другий рядок — на 0.7px (заміряно |  |
| 140 | `.licc-label` оголошує `white-space:nowrap`, а діє `normal` (заміряно 2026-10-02). |  |
| 141 | Пошук в Activity не бачить подій, яких немає в завантаженій сторінці (2026-10-02). |  |
| 148 | Засіяна подія `license.labeled` у вже збереженому сторі не має деталі (2026-10-01). |  |
| 153 | ТОПБАР ПЕРЕПОВНЮЄ ВІКНО ВІД 601 ДО 1150px (заміряно 2026-10-01). |  |
| 157 | ДУБЛЬОВАНИЙ `id` — КЛАС ВАДИ, ЯКИЙ НІЩО НЕ СТЕРЕГЛО ДО 2026-10-01. |  |
| 158 | `sgWizStep` дублюється у `styleguide.html`. |  |
| 159 | Тінь табів панелі ліцензії полагоджена, але не побачена в дії (2026-10-01). |  |
| 160 | Під баром тепер і волосина, і тінь (2026-10-01). |  |
| 161 | ЧОТИРИ LIST-ТУЛБАРИ СТАЛИ ДВОМА ПОВЕДІНКАМИ ПОШУКУ (2026-10-01). |  |
| 163 | Обидва тригери C у спокої читаються `All 17` (2026-10-01). |  |
| 164 | `Show N licenses` і пейджер рахують різне (2026-10-01). |  |
| 165 | ПАНЕЛЬ ЛІЦЕНЗІЇ ШИРША ЗА ТЕЛЕФОН НА 51px (заміряно 2026-10-01). |  |
| 167 | ПʼЯТИЙ ВИПАДОК «ПРАВИЛО ПЕРЕМАГАЄ ПОЗИЦІЄЮ» (2026-10-01, друга сесія). |  |
| 168 | Рядок колонок не липне, поки таблиця скролиться вбік (2026-10-01). |  |
| 169 | Лічильник у заголовку більше не ділить базову лінію з ним (2026-10-01). |  |
| 170 | `.inst-hint` лишився з опт-аутом, якого нікому застосовувати (2026-10-01). |  |
| 171 | Чіп Activity рахує згорнуті прогони за один (2026-10-01). |  |
| 172 | ТОНОВАНИЙ ВИГЛЯД БАНЕРА І ВИГЛЯД `ink` ТЕПЕР РОЗРІЗНЯЮТЬ РІЗНУ КІЛЬКІСТЬ СТАНІВ |  |
| 173 | `.fi-mark` виріс до 30px, а відступи фіда під нього не переглядались |  |
| 174 | Мультиселект-рядок більше не `menuitemcheckbox` — це `<label>` з нативним |  |
| 175 | `.fs-screen .am-celltop` ТЕПЕР ТРЕТІЙ ВИПАДОК ТОГО САМОГО ПЕРЕВИЩЕННЯ СКОУПУ |  |
| 182 | `.fs-screen .infoic{24px}` ДОТЯГУЄТЬСЯ ДАЛІ, НІЖ ЙОГО НАМІР (знайдено 2026-10-01). |  |
| 183 | Значення ключа сидить на 5.2px нижчій базовій лінії за три сусідні (2026-10-01). |  |
| 184 | `secondary` на білому банері алерта — правило без сьогоднішнього читача |  |
| 185 | Зона картки Home виросла на 5px (2026-10-01): дівайдер y93→y98, картка |  |
| 186 | ЗЕЛЕНИЙ СТАТУС У ШАПЦІ ЛІЦЕНЗІЇ — 4.24:1 (заміряно 2026-09-30, пас 15). | → **A** for a designer |
| 187 | ТРЕТІЙ РІД КОЛІЗІЇ ПРАВИЛ, І ЙОГО ВАРТО ШУКАТИ ГРЕПОМ (знайдено 2026-09-30). |  |
| 189 | МОДАЛКА І СТОРІНКА ЛІЦЕНЗІЇ ТЕПЕР РОЗХОДЯТЬСЯ В ҐРУНТІ АЛЕРТА (2026-09-30). |  |
| 190 | Прогрес у степері тихіший, ніж був (2026-09-30). |  |
| 191 | `Payment` як заголовок картки Review — `inferred` копірайт (2026-09-30). |  |
| 192 | Заголовки кроків Capacity/Add-ons і секційні лейбли розрізняються вже не кеглем |  |
| 193 | Крапка-роздільник на картці ліцензії Home схована на ≤600 (2026-09-30). |  |
| 194 | Чіп `Stale` зʼявився на телефоні, і його там ніхто не проєктував (2026-09-30). |  |
| 197 | Три групи на Licenses дають рядок табів у три лінії (заміряно 2026-09-30). |  |
| 201 | ЧЕРВОНА МАРКА НА INK — 3.35:1 (заміряно 2026-09-30, пас 13). | → **A** for a designer |
| 202 | В INK-ФОРМІ НА ПАНЕЛІ ЛІЦЕНЗІЇ ТОН НЕСЕ ТІЛЬКИ КОЛІР (2026-09-30, пас 13). | → **A** for a designer |
| 204 | Дві картки в ряд зупиняються на 900, і це моє судження, не число із запиту |  |
| 205 | Скидання треку на першу картку після дисміса тепер помітніше (запис від того ж |  |
| 206 | СТАТУС НА КАРТЦІ ІНВОЙСА: РЕФЕРЕНС ПРОСИТЬ ПІЛЮЛЮ, СТОЇТЬ КОМПОНЕНТ (2026-09-30). | → **D** for a designer |
| 207 | Два дівайдери на картці інвойса розрізняються лише вставкою (2026-09-30). |  |
| 208 | Роздільна розкладка банера не анімує перехід між картками (2026-09-30). |  |
| 209 | Після дисміса картки трек стає на першу (2026-09-30). |  |
| 210 | ЛІД БАНЕРА ПАНЕЛІ НЕ ПРОХОДИТЬ AA: 4.48:1 (заміряно 2026-09-30). | → **A** for a designer |
| 212 | Марка банера розходиться між Home і панеллю (2026-09-30). |  |
| 213 | РЕЙЛ КРОКІВ НЕ ЦЕНТРОВАНИЙ У СМУЗІ, І ЦЕ ВПИРАЄТЬСЯ В ЗАПИСАНЕ РІШЕННЯ |  |
| 214 | ЧІПА КІЛЬКОСТІ НА `Invoices` І `Activity` НЕМАЄ ВЗАГАЛІ (2026-09-30). |  |
| 215 | `#backBtn` у шапці ліцензії — мертва кнопка з голим гліфом `←` (знайдено |  |
| 217 | На телефоні заголовок кроку налазить на ✕ у шапці візарда. |  |
| 218 | У ТАБЛИЦІ Licenses ГЛІФ СТАТУСУ (16) І МАРКА ВЕРСІЇ (20) ДОСІ РІЗНОГО РОЗМІРУ |  |
| 219 | Гліф статусу в панелі сидить на 1.7px нижче оптичного центру слова, марка версії — |  |
| 220 | Продукт більше ніде не каже «no instance has checked in yet» банером (2026-09-30). |  |
| 223 | `Next charge` у варіанті B зони дублює картку `Next charge` нижче. |  |
| 225 | НА ТЕЛЕФОНІ ВЕСЬ БЛОК КЛЮЧА СТОЇТЬ НАД НАЗВОЮ ЛІЦЕНЗІЇ, І ВЕСЬ `order` |  |
| 226 | На сторінці ліцензії жолоб back-кнопки лишився порожнім (2026-09-29). |  |
| 227 | ВІЗАРД НЕ СКЛАДАЄТЬСЯ В ОДНУ КОЛОНКУ НА ТЕЛЕФОНІ — кроки Capacity і Add-ons |  |
| 228 | Три рядки інвойсів у 600px рамці карткової розкладки (2026-09-29). |  |
| 230 | `Full page` І `Shared link` ТЕПЕР РІЗНЯТЬСЯ ОДНІЄЮ РІЧЧЮ (2026-09-29). |  |
| 232 | ПРАВИЛО, ЯКЕ ПРОГРАЄ, АЛЕ ЗБІГАЄТЬСЯ ЗНАЧЕННЯМ, — ЦЕ ТИХИЙ БОРГ. |  |
| 234 | Заголовок секції карткової розкладки — 20px, референс просить 24. | → **D** for a designer |
| 235 | `✎ Add label` (картка Home) проти `+ Add label` (деталі ліцензії) — два написання |  |
| 236 | `aria-label` РЯДКА І КАРТКИ КАЖЕ `status: Active` ТАМ, ДЕ ВИДНО `Blocked`. |  |
| 238 | Карткова розкладка не має телефонного чергування поверхонь. |  |
| 241 | ТОПБАР ПЕРЕПОВНЮЄТЬСЯ МІЖ 600 І 1100px (заміряно 2026-09-29). |  |
| 246 | Лічильники двох тулбарів Licenses рахують РІЗНЕ — A фасетно, B по акаунту. |  |
| 248 | `.authscreen .fs-header` лишилась прозорою, коли решта шапок діалогів стала |  |
| 250 | ЛИПКИЙ КОЛОНКОВИЙ РЯДОК НЕ ЛИПНЕ, КОЛИ ТАБЛИЦЯ ЇДЕ ВБІК (заміряно 2026-09-28). |  |
| 253 | `.plantable` — обрамлена таблиця на 69% ширини секції (записано 2026-09-27). | → **D** for a designer |
| 255 | Біла підкладка під заокругленим кутом голови таблиці (`thead th::before`) |  |
| 256 | `[hidden]` ЛАМАЄТЬСЯ ЩОРАЗУ, КОЛИ КОМПОНЕНТ ДІСТАЄ `display` — І ЦЕ ВЖЕ |  |
| 258 | `Instance renamed to {entity}` проти пункту меню `Edit label`. |  |
| 260 | МЕРТВЕ ПРАВИЛО НЕ ІНЕРТНЕ, КОЛИ ЙОГО ІМʼЯ ОЧЕВИДНЕ (2026-09-29). |  |
| 261 | `.infoic` чекає на власний компонент. | → **D** for a designer |
| 262 | 22 `<button class="link">` поза кнопкою — текст усередині речень. | → **D** for a designer |
| 269 | `--accent` задано, а не виведено. |  |
| 270 | `assets/logo.svg` і `tools/build-logo.py` більше нічим не читаються — вордмарк |  |
| 272 | КОНТРАСТ: чотири рядки нижче AA, усі `--mid` `#6b6b6b` 14px, усі лише В СПОКОЇ. | → **A** for a designer |
| 273 | `--ic-30` і `--ic-44` НЕ ОГОЛОШЕНІ, і використовуються без фолбека (`.iconbutton`, |  |
| 274 | `--t-h3-fs` теж не оголошений, але має фолбек `18px`, тож працює. |  |
| 275 | `--pg-start` і `--pg-cols` пишуться щоразу і не читаються ніким: CSS перейшов на |  |
| 276 | `--s-own` — колізія імені: 10px у `#nlStepPick`, 16px у `.setgrid`, різні селектори, |  |
| 277 | Десять брейкпоінтів, а ноутси кажуть «один ≤600px»: 600, 601, 640, 700, 760, 820, | → **A** for a designer |
| 281 | Альтернатива `--page-bg` не перевірена на екрані. |  |
| 282 | `corner-shape:squircle` діє лише в Chrome 139+. |  |
| 304 | Дублікати id, коли модалка деталей відкривається ПОВЕРХ сторінки деталей. |  |
| 311 | ВІДКРИТЕ: Home — 2.93 екрана на телефоні (записано 2026-09-18, §14). |  |
| 316 | Розкладка пʼяти планових карток на 390 — рішення за користувачкою. |  |
| 317 | Крок Capacity на 390 — 1.47 екрана. |  |
| 323 | `renderLicenseAlert` малює порожній банер, якщо забути `.amsg` — і взагалі |  |
| 327 | Колонкові заголовки на Home просили «зменшити, але ≥14px» — а 14px і є поточне | → **D** for a designer |
| 332 | Три варіанти степера в дизайн-системі ТЗ просило показати всі три; варіанти |  |
| 339 | `Deactivate` ставить `i.active = false`, і ніщо це поле не читає у фільтрах. |  |
| 351 | Назва перпетуала у візарді лягає в ТРИ рядки (2026-09-24, перший батч). |  |
| 352 | `max-width:62ch` знято з підказки Instances (2026-09-24, восьма правка) — ТЗ просило |  |

---

## C · Prototype-local — a developer can ignore all of it

The measurement harness, the mirrors, the checkers, the settings bar, seeded demo data, publishing. **None of it exists in the product.** It is here because the next session needs it, not because anyone implements it.

| # | entry | |
|---:|---|---|
| 1 | ТРИ ПАСИ НЕПЕРЕВІРЕНІ ПОВНИМ ГЕОМЕТРИЧНИМ ДІФОМ, І КАМПАНІЮ ЗАКРИТО СВІДОМО |  |
| 2 | ЗНАХІДКА ПРО ШИРИНУ 601 ЗНЯТА ТОГО САМОГО ДНЯ — ВАДА БУЛА В МОЄМУ ЗОНДІ (2026-10-12). |  |
| 7 | ТРЕТЯ ЖИВА КОПІЯ ПРОТОТИПУ НЕ БУЛА НАЗВАНА В ЦЬОМУ ФАЙЛІ (2026-10-09). |  |
| 9 | СТРИМАННЯ ПРАВОК НІХТО НЕ ПЕРЕВІРЯЄ АВТОМАТИЧНО (2026-10-09). |  |
| 11 | ЗАМІР 10-09 «ДЕСКТОП НЕДОТОРКАНИЙ» БУВ ПРО АТРИБУТ, А НЕ ПРО РОЗКЛАДКУ (2026-10-09). |  |
| 14 | `#usersModal .fs-box{height:100vh}` І `.fs-box.usersbox` ТЕПЕР КАЖУТЬ ОДНЕ Й ТЕ САМЕ |  |
| 20 | КАРТКИ ВИЩІ ЗА РЯДКИ, І СТОРІНКИ ПОДОВШАЛИ (2026-10-09). |  |
| 24 | `#overlay` СИДИТЬ НА `--z-toast`, ЩОБ ПЕРЕКРИТИ ВІЗАРД, І ЙОГО КОМЕНТАР ЦЕ ВИЗНАЄ |  |
| 35 | ҐАРД ПРАВИЛА 9 НЕ БАЧИТЬ ПЕРЕСТАНОВКИ ДІТЕЙ (2026-10-08). |  |
| 49 | ЗАПИС «ОДНЕ ЗНАЧЕННЯ, ЧОТИРИ МІСЦЯ» ПРО `--accent` БУВ НЕПРАВДОЮ (виправлено |  |
| 55 | `.emptybox.eb.on-tint` НЕ ТРИМАЄ ЖОДНОЇ КНОПКИ В ЗАМІРЯНИХ СТАНАХ (2026-10-08). |  |
| 58 | `.billcard.nl-paycard.on-tint` РАНТАЙМОМ НЕ ПІДТВЕРДЖЕНИЙ (2026-10-08). |  |
| 59 | `font-weight` НА `<use>` НЕСТАБІЛЬНИЙ У ЦІЙ ПАНЕЛІ (2026-10-07). |  |
| 65 | `--text-inactive` — сім правил, і жодне не відрендерилось у заміряному датасеті |  |
| 66 | `--surface-quiet` 4.471 — записано й закрито (2026-10-07). |  |
| 68 | СКАН КОНТРАСТУ МУСИТЬ ЧИТАТИ ТОКЕНИ З `:root`, А НЕ ЗНАТИ ЇХ HEX |  |
| 70 | Пілюля нижньої навігації ловиться в середині транзиції (механізм, 2026-10-07). |  |
| 71 | `.tablescroll` недетерміновано дістає `.is-scrollable` (2026-10-07). |  |
| 75 | ОБХІД ПРЕДКІВ БРЕШЕ ПРО КОНТРАСТ НАД МЕШЕМ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ | → **D** for a designer |
| 77 | Банери `over_limit` / `updates_*` / `canceled` недосяжні з датасету `dashB` за |  |
| 79 | `OPENERS.usersModal` ДО МОДАЛКИ НЕ ДОХОДИТЬ (2026-10-07). |  |
| 80 | `invoices.html@768` недетермінований на переповненні (2026-10-07). |  |
| 81 | `.sg-item` не обрізає свій `.tablescroll` на телефоні (2026-10-07). | → **D** for a designer |
| 82 | Номери в `TRIAGE.md` — ПОЗИЦІЇ, не id (2026-10-07). |  |
| 83 | Категорії в `tools/triage.py` — це судження, і воно ревізується (2026-10-07). |  |
| 92 | `sweep.js` НЕ БАЧИТЬ МЕШУ ВЗАГАЛІ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ |  |
| 93 | ТРИ `background-image` МЕШУ СЕРІАЛІЗУЮТЬСЯ ЯК `color(srgb …)` (2026-10-07). |  |
| 94 | Дизер градієнта розійшовся на ±1/255 у 0.125% каналів (2026-10-07). |  |
| 97 | `Landing › Gradient` — ЄДИНЕ ВІДКРИТЕ ПОРІВНЯННЯ ДИЗАЙНУ (2026-10-07). | → **A** for a designer |
| 98 | ГРУПА 2 `DEAD.md` ПІД ПІДОЗРОЮ ТАМ, ДЕ КЛАС ПИШЕТЬСЯ ЛИШЕ ПІД НЕДЕФОЛТНИМ |  |
| 100 | `.faq-cat` — ДІРА В ЦЕНЗІ МЕРТВОГО, ЗНАЙДЕНА ПАСОМ ПРО ТОВЩИНУ РАМКИ |  |
| 117 | ЗАМІР КЕРУЄ РИШТУВАННЯМ, А НЕ УСПАДКОВУЄ ЙОГО (2026-10-02). |  |
| 121 | `csscheck.py` не бачить зіпсованих коментарів (2026-10-02). |  |
| 122 | `MODALS.md` §3.2 і §3.3 описують версію з `flex-wrap` (2026-10-02) — у файлі є |  |
| 123 | −53px на 944 у модалі заміряно й не пояснено (2026-10-02). |  |
| 124 | Згрупований режим інстансів і `tableframe`/`mesh` не в сітці мертвих селекторів |  |
| 125 | Модалка авторизації не в сітці заміру (2026-10-02) — їй потрібна сесія `out`, а |  |
| 126 | 15 із 16 діалогів спільного `#overlay` не міряні (2026-10-02). |  |
| 127 | БЛОК «ФАЙЛИ» І СПИСОК СТОРІНОК РОЗХОДИЛИСЬ ІЗ РЕПОЗИТОРІЄМ У ПʼЯТИ МІСЦЯХ |  |
| 133 | Одинадцять ролей позначені непевними (2026-10-02), найспірніша — `.field > label` |  |
| 137 | 559 — стверджене число, виведене з заміру (2026-10-02, другий пас). |  |
| 142 | `data-tableframe` лишився константою (2026-10-01). |  |
| 143 | Ключі `licBar`, `licTable`, `licZone`, `licPlan`, `homeBlocks`, `bannerLayout`, |  |
| 145 | ДВАНАДЦЯТЬ НЕЗАКРИТИХ ПОРІВНЯНЬ У СМУЗІ (аудит 2026-10-01). | → **A** for a designer |
| 146 | `Payment` і `Credit` стоять на `landing` і `signin` (аудит 2026-10-01) — білінг |  |
| 147 | Три роди контролів лежать в одному ряду: дані · порівняння · навігація. |  |
| 150 | `signin.html` не має жодного посилання В ПРОДУКТІ, окрім осі в смузі налаштувань. |  |
| 154 | Прогін сторінок міряв ДВІ ширини, 1280 і 375 — рівно ті, де все гаразд. |  |
| 155 | 25 повторно оголошених класів не прочитані (2026-10-01). |  |
| 156 | Варіант 3 має ВЛАСНІ стопи й розмір (2026-10-01). | → **D** for a designer |
| 195 | Специмена тулбара C у стайлгайді немає (2026-09-30). | → **D** for a designer |
| 196 | НА ТЕЛЕФОНІ НЕМА ЖОДНОЇ ПОВЕРХНІ НАЛАШТУВАНЬ (2026-09-30, наслідок вибору). | → **D** for a designer |
| 198 | `instView` лишився поза системою — світч на тулбарі Instances, а не таб смуги. |  |
| 199 | `Purchase` не показується на лендінгу, хоч звідти можна почати покупку: `when` |  |
| 200 | `settingsContext()` лишився з попереднім імʼям, хоч панелі налаштувань уже нема. |  |
| 203 | Специмени банерів у стайлгайді написані літеральними `tone-*` і не слухають | → **D** for a designer |
| 224 | Видимість усередині модалки не можна міряти `offsetParent` — він `null` для всього |  |
| 229 | Ліниву дозавантажку фіда не перевірити в цій панелі — і ніколи не було можна. |  |
| 231 | Розгорнута смуга станів накриває останні 176px сторінки (2026-09-29, за запитом). |  |
| 237 | Група `Table frame` лишається в ⚙ і на Home з картками, де жодної таблиці нема. |  |
| 244 | Смуга станів знає лише дві поверхні. |  |
| 245 | ЧЕКЕР ІКОНОК НЕ ЗНАЄ ЧЕТВЕРТОГО НАПИСАННЯ: HTML-СУТНОСТІ СТРІЛКИ. |  |
| 249 | Запит пошуку не переживає свап тулбарів Licenses — свідомо (див. |  |
| 259 | `--bg` більше не ґрунт жодної поверхні (2026-09-28). |  |
| 265 | Пропущені перевірки — додані ДЕМО-ДАНІ (2026-09-25). |  |
| 267 | Варіант B на телефоні не стилізований — свідомо, показаний «як є» на прохання. | → **D** for a designer |
| 271 | `AUDIT.md` застарів. |  |
| 283 | `AUDIT.md` List C — 37 кластерів і жодного рішення. |  |
| 285 | `prototypeaddons` не має лінка у флоу: у датасетах такого рядка немає, тож |  |
| 322 | Log in не чіпає `billingData`. |  |
| 328 | Дрібні свідомі рішення (можуть «повернутися» питанням): Users сортовані Created |  |
| 331 | `.claude/launch.json` містить сесійний scratchpad-шлях (див. |  |
| 337 | Специмен `#groupedcheck` у стайлгайді розходиться з продуктом: `feedGroupItem` кладе |  |
| 338 | Мертвий коментар у `styles.css` перед блоком `.acttypemenu`: абзац про «chips … |  |
| 353 | GitHub Pages — опубліковано. |  |
| 354 | Claude-артефакт — друга, приватна копія (2026-09-16, оновлено 2026-09-24): |  |

---

## D · Design-system decision — not a developer's call

Open questions about the system itself: which scale a value collapses to, whether a form is a variant, what an axis means. **The answer goes into `SCALES.md` or `COMPONENTS.md` first, and reaches code from there.**

| # | entry | |
|---:|---|---|
| 3 | `.typechip` І `.filterchip` ТЕПЕР ВІДРІЗНЯЮТЬСЯ ЛИШЕ ГАЛОЧКОЮ (2026-10-12). |  |
| 4 | КРОК CAPACITY СТАВ ВИЩИЙ НА 18px (2026-10-12). |  |
| 6 | ПОРОЖНІЙ БОКС ADD-ONS СТОЇТЬ НА x=44, А НЕ НА 16 (2026-10-12). |  |
| 8 | `.nl-couponerr` ТЕПЕР РІЗНИЙ НА ДВОХ ШИРИНАХ (2026-10-09). |  |
| 12 | ID ІНСТАНСА ЦІЛИЙ ЛИШЕ ВІД 390px (2026-10-09). |  |
| 13 | ТОТАЛ ВІЗАРДА ТЕПЕР РУХАЄТЬСЯ НА РЯДОК, КОЛИ КУПОН ВІДПОВІДАЄ ПОМИЛКОЮ (2026-10-09). |  |
| 15 | ТУЛБАР ДІСТАВ 12 ЗВЕРХУ Й ЗНИЗУ ПРИ ГОРИЗОНТАЛЬНИХ 16 (2026-10-09). |  |
| 19 | ЗГРУПОВАНИЙ ВИГЛЯД INSTANCES ЛИШИВСЯ ТАБЛИЦЕЮ НА ТЕЛЕФОНІ (2026-10-09). |  |
| 22 | `.nl-prodcard` ТЕПЕР ПІДНІМАЄТЬСЯ НА ХОВЕРІ Й СІРІЄ НА НАТИСКУ (2026-10-09). |  |
| 23 | СТЕПЕР І КАРТКИ ADD-ON'ІВ ВІДПОВІДАЮТЬ НА ВКАЗІВНИК РІЗНИМИ МЕХАНІЗМАМИ (2026-10-09). |  |
| 26 | ЧОТИРИ КЕБАБИ СТАЛИ ТРЬОМА (2026-10-09). |  |
| 27 | `--hover` `#f0f0ee` ЛИШАЄТЬСЯ У 30 ПРАВИЛАХ (2026-10-09). |  |
| 28 | ВИБРАНИЙ ADD-ON НЕ ВІДПОВІДАЄ НА ВКАЗІВНИК (2026-10-09). |  |
| 29 | РАМПА SECONDARY ТЕПЕР 0 / .04 / .14 (2026-10-09). |  |
| 30 | ТРИ МЕТРИКИ UBUNTU СТОЯТЬ ЛІТЕРАЛАМИ В `calc()` ЯКОРЯ ЛІЧИЛЬНИКА (2026-10-09). |  |
| 34 | `--sel` `#e4e4e0` ЛИШАЄТЬСЯ ТЕПЛИМ СІРИМ У СЕМИ ПРАВИЛАХ (2026-10-08). |  |
| 36 | `.btn--menu` — ЦЕ GHOST ІНШОГО РОЗМІРУ, І ЗГОРТАТИ ЙОГО ЧИ НІ — ВІДКРИТЕ (заміряно |  |
| 42 | `.btn--menu` НЕ НАКРИТИЙ НОВИМ ОПИСОМ SECONDARY (2026-10-08). |  |
| 46 | ДОВЖИНУ `Instance ID` НЕ СКОРОЧЕНО (2026-10-08). |  |
| 48 | СПИСКИ ІНВОЙСІВ І АКТИВНОСТІ В МОДАЛЦІ ЛІЦЕНЗІЇ ВСЕ ЩЕ ЙДУТЬ ВПРИТУЛ (2026-10-08). |  |
| 51 | ДВІ РУНГИ ЗАМІСТЬ ОДНОЇ НА ОСІ `z-index` (2026-10-08). |  |
| 52 | ЕЛЕВАЦІЯ ДЛЯ БІЛОЇ КНОПКИ НА КОЛЬОРОВОМУ ҐРУНТІ ПРОСИТЬ ЧЕТВЕРТОГО РІВНЯ (2026-10-08, |  |
| 60 | Пʼять із девʼяти колізій help-і-hint лишились (2026-10-07). |  |
| 61 | `.field > label` і `.dwelcome p` — та сама форма, не чіпані (2026-10-07). |  |
| 64 | Девʼять help-і-hint стоять `--mid` 16px під лейблом `--mid` 16px (2026-10-07). |  |
| 72 | `.pg-d` проходить тонко над градієнтом (2026-10-07). |  |
| 73 | КОНТРАСТ: ЧИСЛА ЗАМІРЯНІ, РІШЕННЯ НЕ УХВАЛЕНЕ (2026-10-07). | → **A** for a designer |
| 74 | Зелений має ЛАТЕНТНУ діру на `--surface-quiet` (2026-10-07). |  |
| 76 | Гліф `tone-black` на банері Home — рішення, не правка (2026-10-07). |  |
| 84 | ПʼЯТНАДЦЯТЬ ОДНОСТОРОННІХ ПРАВИЛ ЧЕКАЮТЬ НА ОДНЕ ПИТАННЯ КОЖНЕ (2026-10-07). |  |
| 85 | `.lic-row,.inv-row,.inst-row` — ТРИ З ЧОТИРЬОХ, І ЦЕ НЕ ОГЛЯД (2026-10-07). |  |
| 86 | ВІСЬ ГРУНТУ ДЛЯ КНОПКИ ВЖЕ ЗАСЛУЖЕНА, І СВІТЛИМИ ПОВЕРХНЯМИ |  |
| 87 | Чіп має три висоти — 26 / 32 / 40 (2026-10-07). | → **A** for a designer |
| 89 | Фонова межа телефона написана двічі (2026-10-07). | → **B** for a designer |
| 90 | КЛАС ВАДИ «ПЕРЕКРИТИЙ ЗАВЖДИ, ЗАМАПЛЕНИЙ ВСЕ ОДНО» — ДВА ВИПАДКИ, |  |
| 91 | Два рінги поза шісткою токенів (2026-10-07). |  |
| 95 | ГРАДІЄНТ ТЕПЕР НА ТРЬОХ ПОВЕРХНЯХ, І ДВІ З НИХ ПОРІВНЯННЯ НЕ СТОСУВАЛОСЬ |  |
| 96 | Два кольори градієнта лишились літералами (2026-10-07). |  |
| 101 | `320` У `shared.js:2085` НЕ МАЄ ЧИМ СТАТИ (2026-10-07). | → **B** for a designer |
| 102 | ДВА НАМІРИ ЗГОРНУТО НАВМИСНО, І ЇХ БІЛЬШЕ НІЩО НЕ ВИРАЖАЄ (2026-10-07). |  |
| 106 | Activity на 390 став на 869px довшим (2026-10-06) — ПРИЙНЯТО, не борг. |  |
| 107 | МОДЕЛЬ «НЕГАТИВ = ЗАПЕРЕЧЕННЯ ІНСЕТА» ПОКРИВАЄ ТРЕТИНУ (заміряно 2026-10-06). |  |
| 110 | `--s-own` тепер ПЕРЕДУМОВА пасу спейсингу, а не пункт у черзі (2026-10-06). |  |
| 114 | СКРОЛ МІЖ 601 І 952 — ПРИЙНЯТИЙ, НЕ ВІДКРИТИЙ (рішення 2026-10-05). |  |
| 116 | КРОК CAPACITY СКРОЛИТЬСЯ НА 600 — ЦЕ РІШЕННЯ (2026-10-02). |  |
| 120 | ЗМІНА РЕЖИМУ ЗАГОРТАННЯ — ЦЕ ЗМІНА ВНУТРІШНЬОГО РОЗМІРУ (2026-10-02). |  |
| 134 | `--t-body-sm-fs` (15px) не має жодного читача (2026-10-02) — токен лишився, бо |  |
| 135 | Текст на телефоні тепер 16/1.40, десктоп 16/1.50 (2026-10-02). |  |
| 136 | `mockInvoiceUrl` — ДРУГА СИСТЕМА ТИПОГРАФІКИ (2026-10-02). | → **A** for a designer |
| 144 | Три порівняння ще відкриті: `Home › Layout` (таблиці/картки), `Everywhere › Alert |  |
| 149 | Проміжок між картками планів виріс на 20% трека (2026-10-01). |  |
| 151 | Три нові спільні будівники (`syncAppliedRow`, `wireSheetTrigger`, |  |
| 152 | Період на телефоні втратив ОДНУ річ, і це свідомо: поля дати в шіті відкриваються |  |
| 162 | ТЕЛЕФОННИЙ ТУЛБАР Є ТІЛЬКИ В C (2026-10-01, за рішенням). |  |
| 166 | `licPlan: side` падає в `stacked` на ≤600 (2026-10-01). | → **B** for a designer |
| 176 | Опис `Description` прибитий до гарнітури (2026-10-01). |  |
| 177 | Порожній стан Production тепер веде в доку, а Development вів туди й раніше — |  |
| 178 | Опис locked-рядків зведений до одного речення на ВСІ три (2026-10-01). |  |
| 179 | `DEVICES_DESC` лишився з одним читачем — редагований рядок девайсів. |  |
| 180 | Вісь `licPlan` не має мобільного трактування (2026-10-01). |  |
| 181 | `subgrid` у варіанті `side` — progressive enhancement. |  |
| 188 | ПАНЕЛЬ ЛІЦЕНЗІЇ БІЛЬШЕ НЕ КАЖЕ НІЧОГО ПРО ТЕ, ЩО РОБИТИ З КЛЮЧЕМ, І БІЛЬШЕ НЕ | → **A** for a designer |
| 211 | ТЕМНОЇ ТЕМИ НЕМАЄ, І ЦЕ ТЕПЕР НАЗВАНО (2026-09-30). | → **A** for a designer |
| 221 | ПОГЛИНУТО ЗАПИСОМ ПАСУ 15 ВИЩЕ («панель більше не каже нічого про ключ і не веде |  |
| 288 | Дані рядка → деталі зведені: деталі тепер керуються об'єктом ліцензії (не `PAGES`) — |  |

---

## E · Closed

Struck through in `NOTES.md` and kept for the reasoning. **Listed so nobody re-opens them by reading the list and not the strikethrough.**

| # | entry | |
|---:|---|---|
| 38 | `.btn--menu` ВІДПОВІДАЄ НА ВКАЗІВНИК НАПОЛОВИНУ (заміряно 2026-10-08). |  |
| 39 | `PAINT_PROPS` У `sweep.js` НЕ МІСТИТЬ `border-color` (2026-10-08). |  |
| 40 | SECONDARY ЯК КОНТУР: ЗНАЧЕННЯ ОБВОДКИ НЕ ОБРАНЕ, ЗБІРКА ЗАЧЕКАНА (2026-10-08). |  |
| 41 | ПЕЙДЖЕР — ПʼЯТИЙ КЛАС ХОСТІВ, І ПРО НЬОГО НІХТО НЕ ПИТАВ (2026-10-08). |  |
| 43 | `--ring-hairline` — ФІКСОВАНИЙ СІРИЙ `#c9c9c9`, 1.70 на білому (заміряно 2026-10-08). |  |
| 44 | ДЕФОЛТНИЙ ДЕМО-АКАУНТ ТЕПЕР ПОКАЗУЄ АДРЕСУ, А НЕ ІМʼЯ (2026-10-08). |  |
| 47 | «ШИРИНА ЯК DESCRIPTION» ВИКОНАНА ЯК ШИРИНА РЯДКА, НЕ КОНТРОЛА (2026-10-08). |  |
| 54 | `signin.html` НЕ МАЄ ФУТЕРА, І ТЕПЕР ТАМ НЕМА ЖОДНОГО МАРШРУТУ ДО ЮРИДИЧНИХ СТОРІНОК |  |
| 56 | `paintDiff` РАХУЄ НЕПАРНІ ЛИШЕ В «ПІСЛЯ» (2026-10-08). |  |
| 57 | ІМʼЯ АКАУНТА БІЛЬШЕ НЕ ЗБИРАЄТЬСЯ ПРИ РЕЄСТРАЦІЇ (2026-10-08, наслідок пункту 2). |  |
| 67 | `--faint` ПРОВАЛЮЄ AA ЯК ТЕКСТ У 507 МІСЦЯХ ЗАКРИТО 2026-10-07 (батч |  |
| 69 | ПАРНИЙ ПРОГІН МУСИТЬ МАТИ ПРЕ-ФЛІТ «ЦЯ URL РЕНДЕРИТЬ СВОЮ СТОРІНКУ» |  |
| 78 | `path()` У `sweep.js` КЛЮЧУЄ ЕЛЕМЕНТ ЙОГО КЛАСАМИ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ, |  |
| 104 | ТОПБАР — НАСТУПНИЙ ПАС, І ВІН ІДЕ САМ (2026-10-06). |  |
| 115 | 48px ПОВІТРЯ БІЛЯ AMOUNT ДІЄ НА ОДНІЙ ПОВЕРХНІ З ТРЬОХ ВИРІШЕНО |  |
| 118 | `MODALS.md` названо чотири не-типографічні вади, жодна не полагоджена |  |
| 119 | Одинадцять рядків сітки `MODALS.md` досі міряні ЗІ смугою (2026-10-02) |  |
| 130 | `mirror.sh` живе в scratchpad, як і `roles.py` (2026-10-01) ЗАКРИТО |  |
| 131 | ЗВІТ ПРО ПОЛОМКИ ПАСУ 2 НЕ ЗРОБЛЕНИЙ ЗАКРИТО 2026-10-01 — повний звіт |  |
| 132 | Класифікація 173 декларацій живе у scratchpad (`ds/roles.py`), не в репо |  |
| 216 | СТЕПЕР ПРИ ПʼЯТИ КРОКАХ ВИЛАЗИТЬ ЗА ВІКНО ЗАКРИТО 2026-09-30 (пас 15), |  |
| 239 | СІМ БЛОКІВ ЗАПИТУ 2026-09-28 НЕ ПОЧАТО ЗАКРИТО 2026-09-29 (другий |  |
| 240 | ТРИ РІШЕННЯ, ЯКІ ТОЙ ЗАПИТ СКАСОВУЄ ЗАКРИТО 2026-09-29: усі три |  |
| 242 | `card_expiring` недосяжний із чистого демо ЗАКРИТО 2026-09-28 |  |
| 243 | `settingsContext().home` і `.details` більше ніхто не читає ПОЛОВИНА |  |
| 247 | У барі два ховер-фони ЗАКРИТО 2026-09-28 (десятий батч): обидва читають |  |
| 251 | Три різні відповіді на «як цей список гортається» ЗАКРИТО 2026-09-28 |  |
| 252 | Моделі кнопки бракує осі «на чому вона стоїть» ЗАКРИТО 2026-09-28. |  |
| 254 | Колір — єдиний носій у колонці Status. |  |
| 257 | Три речення згорнутої групи кажуть дату тричі. |  |
| 263 | `--status-ok` (#009A4F) не проходить AA як текст: 3.66:1 ЗАКРИТО |  |
| 264 | `Rename` у кебабі на сторінці Instances не робить нічого ЗАКРИТО |  |
| 268 | Пройдені кроки степера не клікабельні знято 2026-09-25 (четвертий батч): |  |
| 284 | Превʼю Invoices і Users на дашборді — статичні копії виправлено: дашборд |  |
| 286 | `AMF` не знає про плани / статичні лейбли markup TB-словами знято разом |  |
| 287 | TBMQ не має детальних сторінок виправлено: TBMQ-рядки (sub і perp) відкривають |  |
| 292 | Search-інпути невізуальні виправлено 2026-09-17: `wireSearch()` фільтрує з |  |
| 294 | ЧЕКАЄ НА URL: `EXT.install` виправлено 2026-09-18: |  |
| 299 | Фільтр до нуля на Licenses не показує нічого. |  |
| 308 | `CHECKIN_INTERVAL_H = 24` не підтверджений ВИПРАВЛЕНО 2026-09-22: перевірка щогодини. |  |
| 313 | Повернення при зниженні плану. |  |
| 324 | Таблиця Invoices всередині деталей на телефоні рве заголовки виправлено |  |
| 333 | Залишки Vite-збірки в корені прибрано перед публікацією: `package.json`, |  |
| 340 | Пейджери Licenses та Invoices досі інертні. |  |
| 341 | Пейджери Licenses та Invoices досі інертні — і 2026-09-28 це стало ВИДИМИМ. |  |

