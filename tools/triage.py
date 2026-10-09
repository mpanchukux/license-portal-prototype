# -*- coding: utf-8 -*-
"""Builds TRIAGE.md: the NOTES.md debt list, sorted by WHO HAS TO ACT on each entry.

Run it after the debt list changes:   python3 tools/triage.py

⚠️ THE TITLES ARE READ FROM NOTES.md AND NEVER RETYPED HERE. A triage whose titles drift
from the source is worse than no triage, and translating them would make this a second
source that silently disagrees with the first.

⚠️⚠️ ENTRIES ARE KEYED BY A HASH OF THEIR FIRST LINE, NOT BY POSITION, and that is the
whole reason this file is shaped the way it is. The first version keyed on position in the
list; adding six entries at the top of the debt the same day shifted all 271 numbers and
the map pointed at the wrong entries — it reported 35 unassigned and would have silently
mislabelled the rest if the assert had been laxer. The numbers printed in TRIAGE.md are
positions, for finding an entry quickly; they are not identity.

⚠️ A REWORDED ENTRY LOSES ITS KEY and comes back as unassigned, which is the intended
failure: it stops the run and asks a human whether the category still holds.
"""
import re, sys, hashlib, collections

def sig(head):
    """Stable key: the first line, stripped of markers, lowercased, first 70 chars."""
    t = re.sub(r'[⚠️~*`]+', '', head)
    t = re.sub(r'\s+', ' ', t).strip().lower()
    return hashlib.md5(t[:70].encode('utf-8')).hexdigest()[:10]

# ---------- the judgement, and it is the only thing stored here ---------------------
# A  blocked: needs a product / data / copy / legal answer before code
# B  build the surface, but do not reproduce this defect
# C  prototype-local: harness, mirrors, checkers, demo seeding, publishing
# D  a design-system decision — goes into SCALES.md / COMPONENTS.md first
# E  closed (detected from the strikethrough, never written here)
CAT = {
  # ---- 2026-10-08, the revert / chip / trigger pass ----
  '64daf77a47': 'B',  # .perbtn carries an opaque grey again — deliberate, will bite on a tint
  'c9cc8dac5c': 'D',  # --sel stays the warm chrome grey in seven rules; the chip is the exception
  'a330f4a034': 'C',  # the rule-9 guard watches classes, not child order
  # ---- 2026-10-08, menu after the outline pass ----
  '469ada971a': 'D',  # menu is ghost at another size — collapse or keep is a design call
  '6741e81513': 'B',  # button()'s menu refusals are written twice and can drift
  # ---- 2026-10-08, secondary as an outline ----
  'a2c558a42b': 'D',  # .btn--menu answers the pointer with half of secondary's answer
  '159f0bc029': 'C',  # sweep.js PAINT_PROPS cannot see a border
  # ---- 2026-10-08, the secondary-as-outline census ----
  '0ed3fdc0f6': 'D',  # the border value is unchosen; ink and mid clear 3:1, ink .14 fails everywhere
  'dc67b5f6cb': 'D',  # the pager is a fifth host class nobody has ruled on
  '6ef9d36152': 'D',  # .btn--menu is not covered by the new secondary description
  'a96c5e39ca': 'D',  # --ring-hairline is a fixed grey at 1.70 on white — same defect
  'f9a7b99b3b': 'A',  # the seeded demo account now shows its address instead of a name
  # ---- 2026-10-08, the dropdown / accent / plan-card pass ----
  'f021f726df': 'A',  # ticks and Capacity icons reported missing, measured present — needs the surface named
  'd5c815fc28': 'D',  # Instance ID not shortened: its length was never the cause of the scroll
  '3ad305ee13': 'D',  # "as wide as Description" read as the ROW's width, not the control's
  '82df49a8c0': 'D',  # the modal's invoice and activity lists still run flush to its edge
  'fd606032b1': 'C',  # the "one value, four places" record about --accent was false: 19 declarations
  '7d6abb7831': 'B',  # --accent-soft is the first color-mix in a product rule — a new mechanism
  'fdf0ff8be5': 'D',  # the z-index scale needs re-reading for other pairs sharing one rung
  # ---- 2026-10-08, the auth/table pass ----
  'c5ff71d892': 'D',  # elevation for a white button on a tint needs a FOURTH level — §2 says tint, not rising
  '26f4713175': 'B',  # public header's `Sign in` is grey on --page-bg: the 09-30 rule never walked signed-out chrome
  'd335f8645a': 'A',  # signin.html has no footer, so it now has no route to the legal pages at all
  'a5ecfee2bc': 'C',  # .emptybox.on-tint holds no button in any measured state
  '1003b5cf30': 'C',  # paintDiff counts unpaired only in `after` — a delete-only pass reads as clean
  'dd2652e02e': 'A',  # the account name is no longer captured at sign-up; portalName() falls back
  'fcf8917561': 'C',  # .nl-paycard listed from source, not runtime-confirmed
  '82becf0314': 'C',  # font-weight on <use> is unstable in this panel — run the same-mirror control
  '74b305470f': 'D',  # five of the nine help-and-hint collisions remain
  '0ec3dde8a9': 'D',  # .field > label and .dwelcome p carry the same shape, left alone
  'f6eff4542d': 'B',  # ti-repeat is aria-hidden while carrying the autopay fact
  '9c48c18003': 'B',  # .link x27 is the only route to the legal pages — needs a non-colour cue?
  'b0579436a1': 'D',  # nine help-and-hint pairs now read as one block
  '46afcd4be0': 'C',  # --text-inactive: seven rules, none rendered in the measured dataset
  'de0aa18264': 'C',  # --surface-quiet 4.471 — recorded and closed
  'd44677809d': 'D',  # --faint fails AA as text in 507 places — the biggest contrast failure
  '29d412767e': 'C',  # a contrast scan must resolve tokens from :root, not know their hexes
  '400ba37293': 'C',  # a paired run needs a pre-flight that each URL renders its own page
  '5d9e3e7e72': 'C',  # the bottom-nav pill is sampled mid-transition
  '1424a9641d': 'C',  # .tablescroll gains .is-scrollable nondeterministically
  'ac870b54c9': 'D',  # .pg-d passes thinly over the gradient
  '6d9a9a3c3f': 'D',  # CONTRAST: the numbers are measured, the decision is not taken
  '1896136cc7': 'D',  # green has a latent hole on --surface-quiet
  'c48e0b270a': 'C',  # an ancestor walk lies about contrast over the mesh
  '0db9e5e5a6': 'D',  # tone-black's glyph on the Home banner — a decision, not a fix
  '949613642f': 'C',  # over_limit / updates_* / canceled unreachable by data-status
  'f2f2ea316e': 'C',  # path() У sweep.js КЛЮЧУЄ ЕЛЕМЕНТ ЙОГО КЛАСАМИ — ЦЕ ПОСТІЙНА 
  'dbaa07b340': 'C',  # OPENERS.usersModal ДО МОДАЛКИ НЕ ДОХОДИТЬ (2026-10-07). Він 
  '64063672a1': 'C',  # invoices.html@768 недетермінований на переповненні (2026-10-
  '1571dd84e6': 'C',  # .sg-item не обрізає свій .tablescroll на телефоні (2026-10-0
  'd6e7ea95aa': 'C',  # Номери в TRIAGE.md — ПОЗИЦІЇ, не id (2026-10-07). Запис, дод
  '13517eebf5': 'C',  # Категорії в tools/triage.py — це судження, і воно ревізуєтьс
  'e5a9fd8e38': 'D',  # ПʼЯТНАДЦЯТЬ ОДНОСТОРОННІХ ПРАВИЛ ЧЕКАЮТЬ НА ОДНЕ ПИТАННЯ КОЖ
  '48bdf6d6c6': 'D',  # .lic-row,.inv-row,.inst-row — ТРИ З ЧОТИРЬОХ, І ЦЕ НЕ ОГЛЯД 
  'ea120d3793': 'D',  # ВІСЬ ГРУНТУ ДЛЯ КНОПКИ ВЖЕ ЗАСЛУЖЕНА, І СВІТЛИМИ ПОВЕРХНЯМИ
  'db7731641d': 'D',  # Чіп має три висоти — 26 / 32 / 40 (2026-10-07). Звести їх до
  'b42cd89ab2': 'B',  # .pagetitlerow губить підпис Buy a license на телефоні (2026-
  'ba493121c2': 'D',  # Фонова межа телефона написана двічі (2026-10-07). --bp-phone
  '8b3d521377': 'D',  # КЛАС ВАДИ «ПЕРЕКРИТИЙ ЗАВЖДИ, ЗАМАПЛЕНИЙ ВСЕ ОДНО» — ДВА ВИП
  'a8c4f77584': 'D',  # Два рінги поза шісткою токенів (2026-10-07). #nlModal .nl-ca
  '6b7014baf7': 'C',  # sweep.js НЕ БАЧИТЬ МЕШУ ВЗАГАЛІ — ЦЕ ПОСТІЙНА ВЛАСТИВІСТЬ
  '0221645d85': 'C',  # ТРИ background-image МЕШУ СЕРІАЛІЗУЮТЬСЯ ЯК color(srgb …) (2
  'a3935b6d0b': 'C',  # Дизер градієнта розійшовся на ±1/255 у 0.125% каналів (2026-
  '0df6d52641': 'D',  # ГРАДІЄНТ ТЕПЕР НА ТРЬОХ ПОВЕРХНЯХ, І ДВІ З НИХ ПОРІВНЯННЯ НЕ
  '376101baa7': 'D',  # Два кольори градієнта лишились літералами (2026-10-07). rgb(
  '4092df0b5d': 'C',  # Landing › Gradient — ЄДИНЕ ВІДКРИТЕ ПОРІВНЯННЯ ДИЗАЙНУ (2026
  'ac2f2fe652': 'C',  # ГРУПА 2 DEAD.md ПІД ПІДОЗРОЮ ТАМ, ДЕ КЛАС ПИШЕТЬСЯ ЛИШЕ ПІД 
  'd42f610fa0': 'B',  # ?from у посиланнях на ліцензію більше ніхто не читає (2026-1
  '50a7e86ddd': 'C',  # .faq-cat — ДІРА В ЦЕНЗІ МЕРТВОГО, ЗНАЙДЕНА ПАСОМ ПРО ТОВЩИНУ
  'b1677a411c': 'D',  # 320 У shared.js:2085 НЕ МАЄ ЧИМ СТАТИ (2026-10-07). SCALES.m
  'b3ae2a884a': 'D',  # ДВА НАМІРИ ЗГОРНУТО НАВМИСНО, І ЇХ БІЛЬШЕ НІЩО НЕ ВИРАЖАЄ (2
  '768d1c2290': 'B',  # ІКОНКИ-КНОПКИ ВИРОСЛИ ПО ВСЬОМУ ПРОДУКТУ, І ЗВІТ ПРО ПАС ЦЬО
  '74658e2a75': 'B',  # ТОПБАР МАЄ ВЛАСНУ РОДИНУ КОНТРОЛІВ ПОЗА КОМПОНЕНТОМ КНОПКИ —
  'a48d9f3ad1': 'D',  # Activity на 390 став на 869px довшим (2026-10-06) — ПРИЙНЯТО
  'b2f3c73ea2': 'D',  # МОДЕЛЬ «НЕГАТИВ = ЗАПЕРЕЧЕННЯ ІНСЕТА» ПОКРИВАЄ ТРЕТИНУ (замі
  'd715a2e79f': 'B',  # .insttoolbar.stickybar ОГОЛОШУЄ z-index:12 НА position:stati
  '8fb6536469': 'B',  # Візард парує Billing email з Company name у вужчій колонці (
  'f93b869d99': 'D',  # --s-own тепер ПЕРЕДУМОВА пасу спейсингу, а не пункт у черзі 
  '1589678a77': 'B',  # СМУГА 601–952: ЦИФРИ ЗАМІРЯНІ 2026-10-06, ПОЧИНАТИ З НИХ, А 
  '59d99a881e': 'B',  # ОБГОРТКА, ЯКУ НІХТО НЕ МІРЯЄ, НЕ РОБИТЬ НІЧОГО (знайдено 202
  'e71f2f5a2f': 'B',  # Recent invoices на Home: обгортка — СТОПГЕП, не лік (2026-10
  '97b336d1c6': 'D',  # СКРОЛ МІЖ 601 І 952 — ПРИЙНЯТИЙ, НЕ ВІДКРИТИЙ (рішення 2026-
  'facedb5237': 'D',  # КРОК CAPACITY СКРОЛИТЬСЯ НА 600 — ЦЕ РІШЕННЯ (2026-10-02). П
  '706701f276': 'C',  # ЗАМІР КЕРУЄ РИШТУВАННЯМ, А НЕ УСПАДКОВУЄ ЙОГО (2026-10-02). 
  '4c474efdd8': 'D',  # ЗМІНА РЕЖИМУ ЗАГОРТАННЯ — ЦЕ ЗМІНА ВНУТРІШНЬОГО РОЗМІРУ (202
  '89d197b0fb': 'C',  # csscheck.py не бачить зіпсованих коментарів (2026-10-02). Ду
  '1163f40d66': 'C',  # MODALS.md §3.2 і §3.3 описують версію з flex-wrap (2026-10-0
  '0351458734': 'C',  # −53px на 944 у модалі заміряно й не пояснено (2026-10-02). О
  '9c4e9d5d13': 'C',  # Згрупований режим інстансів і tableframe/mesh не в сітці мер
  '33e4f141e3': 'C',  # Модалка авторизації не в сітці заміру (2026-10-02) — їй потр
  '7be8e38422': 'C',  # 15 із 16 діалогів спільного #overlay не міряні (2026-10-02).
  'd7d5f72214': 'C',  # БЛОК «ФАЙЛИ» І СПИСОК СТОРІНОК РОЗХОДИЛИСЬ ІЗ РЕПОЗИТОРІЄМ У
  'fb0b1dfa42': 'B',  # ТАБЛИЦЯ ІНВОЙСІВ ЛАМАЄ НОМЕР І ДАТУ НАДВОЄ НА 944 (заміряно 
  '2aefe402bb': 'B',  # Переповнення топбара на index стало на 5px гіршим (заміряно 
  '3dc65c3a1d': 'C',  # Одинадцять ролей позначені непевними (2026-10-02), найспірні
  '92086e1724': 'D',  # --t-body-sm-fs (15px) не має жодного читача (2026-10-02) — т
  '1173af5720': 'D',  # Текст на телефоні тепер 16/1.40, десктоп 16/1.50 (2026-10-02
  '1bf8597fb2': 'D',  # mockInvoiceUrl — ДРУГА СИСТЕМА ТИПОГРАФІКИ (2026-10-02). Окр
  '786376426d': 'C',  # 559 — стверджене число, виведене з заміру (2026-10-02, други
  '6e79a6af34': 'B',  # Чіпи add-on'ів переносять текст на вузькому десктопі (2026-1
  'fd44f7b65e': 'B',  # Кнопка Copy у рядку ключа переноситься на другий рядок — на 
  'e7c8f7a472': 'B',  # .licc-label оголошує white-space:nowrap, а діє normal (замір
  'c6a5e965fa': 'B',  # Пошук в Activity не бачить подій, яких немає в завантаженій 
  'd9cb192b96': 'C',  # data-tableframe лишився константою (2026-10-01). 36 правил ч
  '925ad46596': 'C',  # Ключі licBar, licTable, licZone, licPlan, homeBlocks, banner
  '5dc145285a': 'D',  # Три порівняння ще відкриті: Home › Layout (таблиці/картки), 
  '266d44b1e9': 'C',  # ДВАНАДЦЯТЬ НЕЗАКРИТИХ ПОРІВНЯНЬ У СМУЗІ (аудит 2026-10-01). 
  '5da8e5533e': 'C',  # Payment і Credit стоять на landing і signin (аудит 2026-10-0
  '4387a4370f': 'C',  # Три роди контролів лежать в одному ряду: дані · порівняння ·
  'd93bb98be7': 'B',  # Засіяна подія license.labeled у вже збереженому сторі не має
  '06d8c160dc': 'D',  # Проміжок між картками планів виріс на 20% трека (2026-10-01)
  '0fd9939fd6': 'C',  # signin.html не має жодного посилання В ПРОДУКТІ, окрім осі в
  '802a1927f5': 'D',  # Три нові спільні будівники (syncAppliedRow, wireSheetTrigger
  '9c58e16317': 'D',  # Період на телефоні втратив ОДНУ річ, і це свідомо: поля дати
  'fd45b7227a': 'B',  # ТОПБАР ПЕРЕПОВНЮЄ ВІКНО ВІД 601 ДО 1150px (заміряно 2026-10-
  'f12c1ab7c7': 'C',  # Прогін сторінок міряв ДВІ ширини, 1280 і 375 — рівно ті, де 
  '7d500aea37': 'C',  # 25 повторно оголошених класів не прочитані (2026-10-01). che
  '881384d6c0': 'C',  # Варіант 3 має ВЛАСНІ стопи й розмір (2026-10-01). До цього д
  'a8ae492311': 'B',  # ДУБЛЬОВАНИЙ id — КЛАС ВАДИ, ЯКИЙ НІЩО НЕ СТЕРЕГЛО ДО 2026-10
  '87fd3a295e': 'B',  # sgWizStep дублюється у styleguide.html. Працює через $$, але
  'c4246b3fb6': 'B',  # Тінь табів панелі ліцензії полагоджена, але не побачена в ді
  'afe2174b3c': 'B',  # Під баром тепер і волосина, і тінь (2026-10-01). Патерн .is-
  'e9f498a921': 'B',  # ЧОТИРИ LIST-ТУЛБАРИ СТАЛИ ДВОМА ПОВЕДІНКАМИ ПОШУКУ (2026-10-
  '2a85fad06a': 'D',  # ТЕЛЕФОННИЙ ТУЛБАР Є ТІЛЬКИ В C (2026-10-01, за рішенням). Де
  'ddf7165d85': 'B',  # Обидва тригери C у спокої читаються All 17 (2026-10-01). На 
  '75a3a32f53': 'B',  # Show N licenses і пейджер рахують різне (2026-10-01). Кнопка
  'bebce2401d': 'B',  # ПАНЕЛЬ ЛІЦЕНЗІЇ ШИРША ЗА ТЕЛЕФОН НА 51px (заміряно 2026-10-0
  'a854473343': 'D',  # licPlan: side падає в stacked на ≤600 (2026-10-01). Знято з 
  '324c0cc372': 'B',  # ПʼЯТИЙ ВИПАДОК «ПРАВИЛО ПЕРЕМАГАЄ ПОЗИЦІЄЮ» (2026-10-01, дру
  'acca96ccf4': 'B',  # Рядок колонок не липне, поки таблиця скролиться вбік (2026-1
  'a5eca29bc9': 'B',  # Лічильник у заголовку більше не ділить базову лінію з ним (2
  'ad4ed50d16': 'B',  # .inst-hint лишився з опт-аутом, якого нікому застосовувати (
  'fd1479b696': 'B',  # Чіп Activity рахує згорнуті прогони за один (2026-10-01). Це
  'f04846b52a': 'B',  # ТОНОВАНИЙ ВИГЛЯД БАНЕРА І ВИГЛЯД ink ТЕПЕР РОЗРІЗНЯЮТЬ РІЗНУ
  'd2fd6ee901': 'B',  # .fi-mark виріс до 30px, а відступи фіда під нього не перегля
  '43b34afde7': 'B',  # Мультиселект-рядок більше не menuitemcheckbox — це <label> з
  '8d36f559cc': 'B',  # .fs-screen .am-celltop ТЕПЕР ТРЕТІЙ ВИПАДОК ТОГО САМОГО ПЕРЕ
  '5d17af614d': 'D',  # Опис Description прибитий до гарнітури (2026-10-01). 74ch ви
  'a3c5536e58': 'D',  # Порожній стан Production тепер веде в доку, а Development ві
  '566b348a6e': 'D',  # Опис locked-рядків зведений до одного речення на ВСІ три (20
  'a2b2e12494': 'D',  # DEVICES_DESC лишився з одним читачем — редагований рядок дев
  'eaafc819e8': 'D',  # Вісь licPlan не має мобільного трактування (2026-10-01). sid
  'c978f1b3a8': 'D',  # subgrid у варіанті side — progressive enhancement. Де він є,
  'eb0966939d': 'B',  # .fs-screen .infoic{24px} ДОТЯГУЄТЬСЯ ДАЛІ, НІЖ ЙОГО НАМІР (з
  '0a64363ed6': 'B',  # Значення ключа сидить на 5.2px нижчій базовій лінії за три с
  '7840888d40': 'B',  # secondary на білому банері алерта — правило без сьогоднішньо
  '8f74ce9d5a': 'B',  # Зона картки Home виросла на 5px (2026-10-01): дівайдер y93→y
  'ff6dcc2936': 'B',  # ЗЕЛЕНИЙ СТАТУС У ШАПЦІ ЛІЦЕНЗІЇ — 4.24:1 (заміряно 2026-09-3
  '8c6de299cf': 'B',  # ТРЕТІЙ РІД КОЛІЗІЇ ПРАВИЛ, І ЙОГО ВАРТО ШУКАТИ ГРЕПОМ (знайд
  '49b6062a92': 'D',  # ПАНЕЛЬ ЛІЦЕНЗІЇ БІЛЬШЕ НЕ КАЖЕ НІЧОГО ПРО ТЕ, ЩО РОБИТИ З КЛ
  'd85010f34c': 'B',  # МОДАЛКА І СТОРІНКА ЛІЦЕНЗІЇ ТЕПЕР РОЗХОДЯТЬСЯ В ҐРУНТІ АЛЕРТ
  'a109eee511': 'B',  # Прогрес у степері тихіший, ніж був (2026-09-30). Конектори з
  '6ba3b4b15d': 'B',  # Payment як заголовок картки Review — inferred копірайт (2026
  'a23ad7a375': 'B',  # Заголовки кроків Capacity/Add-ons і секційні лейбли розрізня
  '7cb279bed8': 'B',  # Крапка-роздільник на картці ліцензії Home схована на ≤600 (2
  '4f9e1c69ba': 'B',  # Чіп Stale зʼявився на телефоні, і його там ніхто не проєктув
  'ab4e971b58': 'C',  # Специмена тулбара C у стайлгайді немає (2026-09-30). Сторінк
  '40eb3ea502': 'C',  # НА ТЕЛЕФОНІ НЕМА ЖОДНОЇ ПОВЕРХНІ НАЛАШТУВАНЬ (2026-09-30, на
  '3bbf43e24b': 'B',  # Три групи на Licenses дають рядок табів у три лінії (замірян
  '46bc724d14': 'C',  # instView лишився поза системою — світч на тулбарі Instances,
  '3f2e7eecfb': 'C',  # Purchase не показується на лендінгу, хоч звідти можна почати
  '52369d38a4': 'C',  # settingsContext() лишився з попереднім імʼям, хоч панелі нал
  'f824aecbcb': 'B',  # ЧЕРВОНА МАРКА НА INK — 3.35:1 (заміряно 2026-09-30, пас 13).
  '61c2b0060a': 'B',  # В INK-ФОРМІ НА ПАНЕЛІ ЛІЦЕНЗІЇ ТОН НЕСЕ ТІЛЬКИ КОЛІР (2026-0
  '3fada56ab4': 'C',  # Специмени банерів у стайлгайді написані літеральними tone- і
  'e96e0c0a34': 'B',  # Дві картки в ряд зупиняються на 900, і це моє судження, не ч
  '40a23535c8': 'B',  # Скидання треку на першу картку після дисміса тепер помітніше
  '5437f02c52': 'B',  # СТАТУС НА КАРТЦІ ІНВОЙСА: РЕФЕРЕНС ПРОСИТЬ ПІЛЮЛЮ, СТОЇТЬ КО
  '85f45000dc': 'B',  # Два дівайдери на картці інвойса розрізняються лише вставкою 
  '3eb9c34ebe': 'B',  # Роздільна розкладка банера не анімує перехід між картками (2
  '9a716b414c': 'B',  # Після дисміса картки трек стає на першу (2026-09-30). Банер 
  '6e33a3d574': 'B',  # ЛІД БАНЕРА ПАНЕЛІ НЕ ПРОХОДИТЬ AA: 4.48:1 (заміряно 2026-09-
  'f83cda891a': 'D',  # ТЕМНОЇ ТЕМИ НЕМАЄ, І ЦЕ ТЕПЕР НАЗВАНО (2026-09-30). Грепом: 
  '68292ad150': 'B',  # Марка банера розходиться між Home і панеллю (2026-09-30). Ho
  '0d61b2f95b': 'B',  # РЕЙЛ КРОКІВ НЕ ЦЕНТРОВАНИЙ У СМУЗІ, І ЦЕ ВПИРАЄТЬСЯ В ЗАПИСА
  'c94e6fb283': 'B',  # ЧІПА КІЛЬКОСТІ НА Invoices І Activity НЕМАЄ ВЗАГАЛІ (2026-09
  '19ebf33f9c': 'B',  # #backBtn у шапці ліцензії — мертва кнопка з голим гліфом ← (
  '02f3662301': 'B',  # На телефоні заголовок кроку налазить на ✕ у шапці візарда. C
  '64652dfac1': 'B',  # У ТАБЛИЦІ Licenses ГЛІФ СТАТУСУ (16) І МАРКА ВЕРСІЇ (20) ДОС
  '918dcd15df': 'B',  # Гліф статусу в панелі сидить на 1.7px нижче оптичного центру
  'e2c4e8341a': 'B',  # Продукт більше ніде не каже «no instance has checked in yet»
  'b12b904455': 'D',  # ПОГЛИНУТО ЗАПИСОМ ПАСУ 15 ВИЩЕ («панель більше не каже нічог
  '71adc62f56': 'A',  # ПРОДУКТ БІЛЬШЕ НІДЕ НЕ КАЖЕ, ЩО КЛЮЧ ВВОДИТЬСЯ В ThingsBoard
  '07c3cb1615': 'B',  # Next charge у варіанті B зони дублює картку Next charge нижч
  'ede93b4fb4': 'C',  # Видимість усередині модалки не можна міряти offsetParent — в
  '15b7403ce9': 'B',  # НА ТЕЛЕФОНІ ВЕСЬ БЛОК КЛЮЧА СТОЇТЬ НАД НАЗВОЮ ЛІЦЕНЗІЇ, І ВЕ
  'bdd3a01439': 'B',  # На сторінці ліцензії жолоб back-кнопки лишився порожнім (202
  '27740c77b3': 'B',  # ВІЗАРД НЕ СКЛАДАЄТЬСЯ В ОДНУ КОЛОНКУ НА ТЕЛЕФОНІ — кроки Cap
  '9fdf6bb6b2': 'B',  # Три рядки інвойсів у 600px рамці карткової розкладки (2026-0
  'a8e0250d31': 'C',  # Ліниву дозавантажку фіда не перевірити в цій панелі — і ніко
  '8baa2b254d': 'B',  # Full page І Shared link ТЕПЕР РІЗНЯТЬСЯ ОДНІЄЮ РІЧЧЮ (2026-0
  '9a8cc0ce16': 'C',  # Розгорнута смуга станів накриває останні 176px сторінки (202
  '416af51050': 'B',  # ПРАВИЛО, ЯКЕ ПРОГРАЄ, АЛЕ ЗБІГАЄТЬСЯ ЗНАЧЕННЯМ, — ЦЕ ТИХИЙ Б
  '53d02b1957': 'A',  # ЛІЧИЛЬНИК RECENT ACTIVITY — ВІДКРИТЕ РІШЕННЯ (2026-09-29). Т
  '1750137a12': 'B',  # Заголовок секції карткової розкладки — 20px, референс просит
  '3ec6c73927': 'B',  # ✎ Add label (картка Home) проти + Add label (деталі ліцензії
  '39b2554663': 'B',  # aria-label РЯДКА І КАРТКИ КАЖЕ status: Active ТАМ, ДЕ ВИДНО 
  '700dd3c8e0': 'C',  # Група Table frame лишається в ⚙ і на Home з картками, де жод
  '359940408a': 'B',  # Карткова розкладка не має телефонного чергування поверхонь. 
  '504b1a3c95': 'B',  # ТОПБАР ПЕРЕПОВНЮЄТЬСЯ МІЖ 600 І 1100px (заміряно 2026-09-29)
  'c621503079': 'C',  # Смуга станів знає лише дві поверхні. Licenses (варіанти тулб
  '4cd048a447': 'C',  # ЧЕКЕР ІКОНОК НЕ ЗНАЄ ЧЕТВЕРТОГО НАПИСАННЯ: HTML-СУТНОСТІ СТР
  '995ad38cf7': 'B',  # Лічильники двох тулбарів Licenses рахують РІЗНЕ — A фасетно,
  'b8dd237386': 'B',  # .authscreen .fs-header лишилась прозорою, коли решта шапок д
  '8baab9368b': 'C',  # Запит пошуку не переживає свап тулбарів Licenses — свідомо (
  '2cf590c849': 'B',  # ЛИПКИЙ КОЛОНКОВИЙ РЯДОК НЕ ЛИПНЕ, КОЛИ ТАБЛИЦЯ ЇДЕ ВБІК (зам
  '366bac7c72': 'B',  # .plantable — обрамлена таблиця на 69% ширини секції (записан
  '2c76a0a373': 'B',  # Біла підкладка під заокругленим кутом голови таблиці (thead 
  '42aed905e7': 'B',  # [hidden] ЛАМАЄТЬСЯ ЩОРАЗУ, КОЛИ КОМПОНЕНТ ДІСТАЄ display — І
  '082adc5199': 'B',  # Instance renamed to {entity} проти пункту меню Edit label. Т
  '574367675d': 'C',  # --bg більше не ґрунт жодної поверхні (2026-09-28). Обидві мо
  'a4f97d0e84': 'B',  # МЕРТВЕ ПРАВИЛО НЕ ІНЕРТНЕ, КОЛИ ЙОГО ІМʼЯ ОЧЕВИДНЕ (2026-09-
  'ebb7992eed': 'B',  # .infoic чекає на власний компонент. Рішення 2026-09-25: це н
  '8b54b83351': 'B',  # 22 <button class="link"> поза кнопкою — текст усередині рече
  '4afaafcc20': 'C',  # Пропущені перевірки — додані ДЕМО-ДАНІ (2026-09-25). 2% годи
  'd4d3194fae': 'A',  # ФАКТ ПРО 12 МІСЯЦІВ ОНОВЛЕНЬ НЕ СКАЗАНИЙ НІДЕ НА ПРОДАВАЛЬНІ
  '19c85bee94': 'C',  # Варіант B на телефоні не стилізований — свідомо, показаний «
  'dd1fd0bc74': 'B',  # --accent задано, а не виведено. Метод (--page-bg → зберегти 
  '32ebb7e440': 'B',  # assets/logo.svg і tools/build-logo.py більше нічим не читают
  '0715e64886': 'C',  # AUDIT.md застарів. Не перегенеровувала (щоб не затерти порож
  'da5c6df537': 'B',  # КОНТРАСТ: чотири рядки нижче AA, усі --mid #6b6b6b 14px, усі
  'a2ede0d482': 'B',  # --ic-30 і --ic-44 НЕ ОГОЛОШЕНІ, і використовуються без фолбе
  '1b154e23a7': 'B',  # --t-h3-fs теж не оголошений, але має фолбек 18px, тож працює
  '3c6628ddf1': 'B',  # --pg-start і --pg-cols пишуться щоразу і не читаються ніким:
  '3591079f1a': 'B',  # --s-own — колізія імені: 10px у #nlStepPick, 16px у .setgrid
  '5583a6cc55': 'B',  # Десять брейкпоінтів, а ноутси кажуть «один ≤600px»: 600, 601
  'ede84573c9': 'A',  # У TBMQ немає плану «Business». ТЗ пʼятірки Home називало йог
  '2e25b95a39': 'A',  # «Updates period over» на Home не показується і з теперішньою
  'cc462644be': 'A',  # Free-рядок показує «—» у колонці стану. Free-підписка не пон
  '99cc2d50ec': 'B',  # Альтернатива --page-bg не перевірена на екрані. Холодний беж
  '2cb14da6aa': 'B',  # corner-shape:squircle діє лише в Chrome 139+. Це чисте progr
  'df19755fb5': 'C',  # AUDIT.md List C — 37 кластерів і жодного рішення. Секція Ріш
  '70c253f512': 'C',  # prototypeaddons не має лінка у флоу: у датасетах такого рядк
  '30c7a8c8e1': 'D',  # Дані рядка → деталі зведені: деталі тепер керуються об'єктом
  '639f3d6a85': 'A',  # ВІДКРИТЕ РІШЕННЯ: що робити з ліцензіями на Maker / Prototyp
  '8316716dd8': 'A',  # Change plan на legacy-плані не має якоря. Ліцензія на Maker/
  '9207d79720': 'A',  # «From $X / mo» у прототипі НЕМАЄ. Перевірено грепом по всіх 
  'd7a25bae9d': 'A',  # Auth-форми нічого не перевіряють (див. батч 2026-09-16): і с
  'e78dc88de4': 'A',  # TAX_NOTE — копірайт очікує підтвердження команди. «Prices ex
  '4ab550e475': 'A',  # Блок Included in every plan для TBMQ ЗНЯТО 2026-09-22, не за
  '6b9d5f1859': 'A',  # Опису не мають: assets, sessions, msg/sec. Пас «пояснити ряд
  'f7d9e00459': 'A',  # Адресний блок на Billing у новому акаунті показує чужу адрес
  '377d8ba38d': 'A',  # WL_DESC — inferred копірайт, чекає підтвердження. «Your own 
  'ba6afef22d': 'A',  # Enabled для White labeling сьогодні недосяжний з даних. Слов
  'c1d3908d8d': 'A',  # Пояснення про оновлення недосяжне на телефоні. Знайдено 2026
  'e0738fe535': 'A',  # Info-іконка покриває два рядки з шести. Production instances
  '5efa8c4151': 'B',  # Дублікати id, коли модалка деталей відкривається ПОВЕРХ стор
  '6a110a6483': 'A',  # ВІДКРИТЕ ПИТАННЯ, і 2026-09-22 воно стало конкретнішим: яку 
  '050285ae07': 'A',  # ВІДКРИТЕ ПИТАННЯ (записано 2026-09-18, §12): ліцензійна угод
  '7af2d0ab14': 'A',  # «Вся ліцензія блокується» за перевищення ліміту інстансів — 
  'e8ed81276a': 'A',  # UPDATES_RENEW_RATE = 0.40 не підтверджений документом — теж 
  '0806c52d17': 'A',  # Ціни на «вільні» девайси перпетуала немає. Ввести 5 050 при 
  'c9163841d8': 'B',  # ВІДКРИТЕ: Home — 2.93 екрана на телефоні (записано 2026-09-1
  'b6d4df20b4': 'A',  # КОЛІР ПОМИЛКИ проти монохрому — рішення за командою, двічі в
  'dfddfad785': 'A',  # COUPON_RATE = 0.20 і саме правило купона — стаб. Будь-який к
  'fca095b1b0': 'A',  # LATEST_VERSION = '3.9.4' і версії інстансів — inferred. Номе
  'c333cf4d18': 'B',  # Розкладка пʼяти планових карток на 390 — рішення за користув
  '7b5bc0f4a6': 'B',  # Крок Capacity на 390 — 1.47 екрана. Чотири рядки самі по соб
  '9cfcb87e3f': 'A',  # Формулювання маркера для заблокованої ліцензії. ТЗ називало 
  '9257eb15d1': 'A',  # Речення про датування терміну оновлень — відкритий конфлікт.
  'ddda07ceb5': 'A',  # Чи потрібна юридична згода в Change plan / Manage add-ons. З
  '8028a49929': 'A',  # Forgot password? — стаб. Флоу відновлення пароля не проєктув
  '8c2bd50ad5': 'C',  # Log in не чіпає billingData. Свідомо: це окрема настройка ⚙-
  'e5f54e6a82': 'B',  # renderLicenseAlert малює порожній банер, якщо забути .amsg —
  '9b901bdc09': 'A',  # Renew subscription на скасованій — secondary, хоч це єдина д
  'd5c30972ce': 'A',  # Сортування колонок — тепер ЄДИНИЙ контрол, який видимо реагу
  'd1d0b55eba': 'B',  # Колонкові заголовки на Home просили «зменшити, але ≥14px» — 
  '7d2994a167': 'C',  # Дрібні свідомі рішення (можуть «повернутися» питанням): User
  '74226ba2c2': 'A',  # Докупка AI на перпетуалі: разова ціна за місячну квоту. Післ
  '3fb6ce32c4': 'A',  # NL-флоу — inferred ціни: perp-юніти (TB prod $1,999 / AI $50
  'fa5be238da': 'C',  # .claude/launch.json містить сесійний scratchpad-шлях (див. «
  'cf5211da13': 'B',  # Три варіанти степера в дизайн-системі ТЗ просило показати вс
  '97ba4c832c': 'A',  # ВІДКРИТЕ: чи показує Home перевірки інстансів. Після батчу 2
  'a8673a8ca3': 'A',  # Причини провалу перевірки — три, і це стеля даних. unreachab
  '582aa5613a': 'A',  # CHECK_WINDOW_DAYS = 3 — inferred. Три доби історії обрано як
  'a781f21d0d': 'C',  # Специмен #groupedcheck у стайлгайді розходиться з продуктом:
  'e74c3b1a4e': 'C',  # Мертвий коментар у styles.css перед блоком .acttypemenu: абз
  '7f4d65f9c6': 'B',  # Deactivate ставить i.active = false, і ніщо це поле не читає
  '208e59165a': 'A',  # Заголовок групи на Change plan. Крок показує заголовок модел
  '966a605ebf': 'A',  # Голос активності виконаний не повністю (2026-09-24, девʼятий
  '7023265a33': 'A',  # Пʼять засіяних шейпів досі без живого писача (2026-09-24, ін
  '4449688f8a': 'A',  # Два формати таймстемпа в сирці: Aug 17 2026, 16:20 у data.js
  '5f01edf421': 'A',  # PRODUCT_CHOICES[].ic став фолбеком, який ніколи не спрацьову
  '3d9ab337b6': 'A',  # ВІДКРИТЕ (2026-09-24, сьомий батч): Renew software updates н
  '629bcdd687': 'A',  # ВІДКРИТЕ (2026-09-24, восьма правка): лічильник банера і спи
  'b4e3edfff1': 'A',  # Дві перпетуальні картки описані по-різному (2026-09-24, шост
  'ed42b6fe84': 'A',  # Чотири константи копірайту лишились у data.js без жодного чи
  '1df5be5065': 'B',  # Назва перпетуала у візарді лягає в ТРИ рядки (2026-09-24, пе
  'c36dcc5f4e': 'B',  # max-width:62ch знято з підказки Instances (2026-09-24, восьм
  '74fca3cbf7': 'C',  # GitHub Pages — опубліковано. Репо: github.com/mpanchukux/lic
  '736590b7bf': 'C',  # Claude-артефакт — друга, приватна копія (2026-09-16, оновлен
}

# entries that read DIFFERENTLY to a designer than to a developer: sig -> (dev, designer, why)
MOVES = {
  'f6eff4542d': ('B', 'D',
     'a glyph marked decorative that sighted readers use as data is a question about what the mark should say, not about its colour'),  # ti-repeat
  '9c48c18003': ('B', 'D',
     'whether a link needs a cue beyond being a link is a design decision; the developer just needs to know it has none'),  # .link x27
  'd44677809d': ('D', 'A',
     'one token value, 507 text elements: for a developer an undecided floor, for a designer the colour decision that is now the largest one open'),  # --faint
  '6d9a9a3c3f': ('D', 'A',
     'an undecided accessibility floor blocks handoff — for a developer it is not a preference to wait on'),  # CONTRAST: numbers measured
  'c48e0b270a': ('C', 'D',
     'a contrast checker that reads the wrong ground will certify the gradient as passing — the designer owns the surface it lies about'),  # ancestor walk lies over the mesh
  '1571dd84e6': ('C', 'D',
     'a specimen box that overflows its own border on a phone is the design system failing to show itself'),  # .sg-item does not clip its .tablescroll
  '4092df0b5d': ('C', 'A',
     'the last open design comparison — nothing can be handed over with three competing backgrounds'),  # Landing › Gradient — ЄДИНЕ ВІДКРИТЕ ПОРІВНЯННЯ ДИЗАЙНУ (2026
  '266d44b1e9': ('C', 'A',
     'twelve unclosed comparisons are twelve undecided designs, not prototype plumbing'),  # ДВАНАДЦЯТЬ НЕЗАКРИТИХ ПОРІВНЯНЬ У СМУЗІ (аудит 2026-10-01). 
  'f83cda891a': ('D', 'A',
     'no dark theme at all: for a developer a non-requirement, for a designer an unanswered half of the system'),  # ТЕМНОЇ ТЕМИ НЕМАЄ, І ЦЕ ТЕПЕР НАЗВАНО (2026-09-30). Грепом: 
  'ff6dcc2936': ('B', 'A',
     '4.24:1 is a token value, not a page bug — the green has to change, which changes every surface'),  # ЗЕЛЕНИЙ СТАТУС У ШАПЦІ ЛІЦЕНЗІЇ — 4.24:1 (заміряно 2026-09-3
  'f824aecbcb': ('B', 'A',
     '3.35:1 on ink: same, and it is the one place colour carries tone alone'),  # ЧЕРВОНА МАРКА НА INK — 3.35:1 (заміряно 2026-09-30, пас 13).
  '6e33a3d574': ('B', 'A',
     '4.48:1 on the panel lead — a type/colour pairing decision before it is a fix'),  # ЛІД БАНЕРА ПАНЕЛІ НЕ ПРОХОДИТЬ AA: 4.48:1 (заміряно 2026-09-
  'da5c6df537': ('B', 'A',
     'four lines below AA, all --mid at 14px: one token, every surface'),  # КОНТРАСТ: чотири рядки нижче AA, усі --mid #6b6b6b 14px, усі
  '61c2b0060a': ('B', 'A',
     'tone carried by colour alone breaks the rule the system states about itself'),  # В INK-ФОРМІ НА ПАНЕЛІ ЛІЦЕНЗІЇ ТОН НЕСЕ ТІЛЬКИ КОЛІР (2026-0
  'db7731641d': ('D', 'A',
     'three chip heights is a visible change nobody has decided — a developer needs the number'),  # Чіп має три висоти — 26 / 32 / 40 (2026-10-07). Звести їх до
  '5583a6cc55': ('B', 'A',
     'ten breakpoints against a documented one: the developer builds from whichever list is true'),  # Десять брейкпоінтів, а ноутси кажуть «один ≤600px»: 600, 601
  '1bf8597fb2': ('D', 'A',
     'a second type system in a generated document is a system question, not a page bug'),  # mockInvoiceUrl — ДРУГА СИСТЕМА ТИПОГРАФІКИ (2026-10-02). Окр
  '1750137a12': ('B', 'D',
     '20px against a reference asking ~24 is a scale decision, not a defect'),  # Заголовок секції карткової розкладки — 20px, референс просит
  'd1d0b55eba': ('B', 'D',
     "'smaller but >=14px' is the floor the scale already sets"),  # Колонкові заголовки на Home просили «зменшити, але ≥14px» — 
  '5437f02c52': ('B', 'D',
     'reference asks for a pill, the component is there: which one wins is a design call'),  # СТАТУС НА КАРТЦІ ІНВОЙСА: РЕФЕРЕНС ПРОСИТЬ ПІЛЮЛЮ, СТОЇТЬ КО
  '366bac7c72': ('B', 'D',
     'a framed table at 69% of the section is a layout decision that was never taken'),  # .plantable — обрамлена таблиця на 69% ширини секції (записан
  '8b54b83351': ('B', 'D',
     '22 button.link outside the component is the boundary of the button model'),  # 22 <button class="link"> поза кнопкою — текст усередині рече
  'ebb7992eed': ('B', 'D',
     "the info icon is waiting for a component, which is this phase's work"),  # .infoic чекає на власний компонент. Рішення 2026-09-25: це н
  'ab4e971b58': ('C', 'D',
     'a missing specimen is missing documentation of a shipped decision'),  # Специмена тулбара C у стайлгайді немає (2026-09-30). Сторінк
  '3fada56ab4': ('C', 'D',
     'specimens written as literals document a scale the product no longer has'),  # Специмени банерів у стайлгайді написані літеральними tone- і
  '40eb3ea502': ('C', 'D',
     'no settings surface on the phone is a consequence of a layout choice'),  # НА ТЕЛЕФОНІ НЕМА ЖОДНОЇ ПОВЕРХНІ НАЛАШТУВАНЬ (2026-09-30, на
  '881384d6c0': ('C', 'D',
     'variant 3 carries its own stops: that is a design fact, now the shipped one'),  # Варіант 3 має ВЛАСНІ стопи й розмір (2026-10-01). До цього д
  '19c85bee94': ('C', 'D',
     'an unstyled variant cannot be compared, so the comparison cannot close'),  # Варіант B на телефоні не стилізований — свідомо, показаний «
  'a854473343': ('D', 'B',
     'side falling back to stacked at <=600 is the missing mobile treatment, which a developer must build'),  # licPlan: side падає в stacked на ≤600 (2026-10-01). Знято з 
  '49b6062a92': ('D', 'A',
     'the panel no longer says what to do with the key: copy that has to exist before build'),  # ПАНЕЛЬ ЛІЦЕНЗІЇ БІЛЬШЕ НЕ КАЖЕ НІЧОГО ПРО ТЕ, ЩО РОБИТИ З КЛ
  '74658e2a75': ('B', 'D',
     "the topbar's own control family is a component question before it is a fix"),  # ТОПБАР МАЄ ВЛАСНУ РОДИНУ КОНТРОЛІВ ПОЗА КОМПОНЕНТОМ КНОПКИ —
  'ba493121c2': ('D', 'B',
     'one boundary written twice is a developer trap: two sources, one of them silently wrong'),  # Фонова межа телефона написана двічі (2026-10-07). --bp-phone
  'b1677a411c': ('D', 'B',
     'a z-index with no layer to become is a developer decision at implementation time'),  # 320 У shared.js:2085 НЕ МАЄ ЧИМ СТАТИ (2026-10-07). SCALES.m
}

src = open('NOTES.md', encoding='utf-8').read().split('\n')
start = next(i for i,l in enumerate(src) if l.startswith('## Відкриті питання / борг'))
end   = next(i for i,l in enumerate(src) if i>start and l.startswith('## Файли'))
seg = src[start+1:end]
idx = [i for i,l in enumerate(seg) if l.startswith('- ')]

entries = []
for n,i in enumerate(idx):
    j = idx[n+1] if n+1 < len(idx) else len(seg)
    body = '\n'.join(seg[i:j])
    head = seg[i][2:].strip()
    closed = head.startswith('~~') or '~~' in head[:4]
    # a readable short title: drop markers, keep the first clause
    t = re.sub(r'[⚠️~]+', '', head).strip()
    t = re.sub(r'\*\*', '', t)
    t = re.sub(r'\s+', ' ', t)
    t = re.split(r'(?<=[.!]) ', t)[0]
    if len(t) > 112: t = t[:109].rstrip() + '…'
    entries.append({'n': n+1, 'title': t, 'closed': closed, 'lines': j-i,
                    'sig': sig(head),
                    'cat': 'E' if closed else CAT.get(sig(head))})

unassigned = [(e['n'], e['title'][:70]) for e in entries if e['cat'] is None]
if unassigned:
    print('UNASSIGNED — a new or reworded entry needs a category in CAT:', file=sys.stderr)
    for n, t in unassigned:
        print('  %3d  %s  %s' % (n, [e for e in entries if e['n']==n][0]['sig'], t), file=sys.stderr)
    sys.exit(2)
print('entries', len(entries), 'closed', sum(1 for e in entries if e['closed']), file=sys.stderr)
print(collections.Counter(e['cat'] for e in entries), file=sys.stderr)

# ---------- routing: who answers the blockers in A ----------------------------------
# ⚠️ These are the OWNERS, not the answers. The 46 entries in A are questions about the
# product, its prices, its copy and two legal points; none of them is a design question
# this document can settle, and none was attempted. Naming who answers is the whole job.
OWNER = {
  'f9a7b99b3b': 'product',  # should the demo account's own name be seeded as its record?
  # ---- 2026-10-08 ----
  'f021f726df': 'design',   # which surface and width showed the missing ticks/icons?
  # ---- 2026-10-08, the auth/table pass ----
  'd335f8645a': 'legal',    # signin.html now offers no route to the prototype's legal pages
  'dd2652e02e': 'product',  # is a name asked later, or does the greeting stop naming anyone?
  'e78dc88de4': 'copy',  # TAX_NOTE — копірайт очікує підтвердження команди. 
  '377d8ba38d': 'copy',  # WL_DESC — inferred копірайт, чекає підтвердження. 
  '7af2d0ab14': 'copy',  # «Вся ліцензія блокується» за перевищення ліміту ін
  '966a605ebf': 'copy',  # Голос активності виконаний не повністю (2026-09-24
  '6b9d5f1859': 'copy',  # Опису не мають: assets, sessions, msg/sec. Пас «по
  '71adc62f56': 'copy',  # ПРОДУКТ БІЛЬШЕ НІДЕ НЕ КАЖЕ, ЩО КЛЮЧ ВВОДИТЬСЯ В T
  '9257eb15d1': 'copy',  # Речення про датування терміну оновлень — відкритий
  'd4d3194fae': 'copy',  # ФАКТ ПРО 12 МІСЯЦІВ ОНОВЛЕНЬ НЕ СКАЗАНИЙ НІДЕ НА П
  '9cfcb87e3f': 'copy',  # Формулювання маркера для заблокованої ліцензії. ТЗ
  'ed42b6fe84': 'copy',  # Чотири константи копірайту лишились у data.js без 
  'b6d4df20b4': 'design',  # КОЛІР ПОМИЛКИ проти монохрому — рішення за командо
  'd7a25bae9d': 'engineering',  # Auth-форми нічого не перевіряють (див. батч 2026-0
  '582aa5613a': 'engineering',  # CHECK_WINDOW_DAYS = 3 — inferred. Три доби історії
  '8028a49929': 'engineering',  # Forgot password? — стаб. Флоу відновлення пароля н
  'fca095b1b0': 'engineering',  # LATEST_VERSION = '3.9.4' і версії інстансів — infe
  '5f01edf421': 'engineering',  # PRODUCT_CHOICES[].ic став фолбеком, який ніколи не
  'f7d9e00459': 'engineering',  # Адресний блок на Billing у новому акаунті показує 
  '6a110a6483': 'engineering',  # ВІДКРИТЕ ПИТАННЯ, і 2026-09-22 воно стало конкретн
  '4449688f8a': 'engineering',  # Два формати таймстемпа в сирці: Aug 17 2026, 16:20
  '7023265a33': 'engineering',  # Пʼять засіяних шейпів досі без живого писача (2026
  'c1d3908d8d': 'engineering',  # Пояснення про оновлення недосяжне на телефоні. Зна
  'a8673a8ca3': 'engineering',  # Причини провалу перевірки — три, і це стеля даних.
  '050285ae07': 'legal',  # ВІДКРИТЕ ПИТАННЯ (записано 2026-09-18, §12): ліцен
  'ddda07ceb5': 'legal',  # Чи потрібна юридична згода в Change plan / Manage 
  'dfddfad785': 'pricing',  # COUPON_RATE = 0.20 і саме правило купона — стаб. Б
  '3fb6ce32c4': 'pricing',  # NL-флоу — inferred ціни: perp-юніти (TB prod $1,99
  'e8ed81276a': 'pricing',  # UPDATES_RENEW_RATE = 0.40 не підтверджений докумен
  '9207d79720': 'pricing',  # «From $X / mo» у прототипі НЕМАЄ. Перевірено грепо
  '74226ba2c2': 'pricing',  # Докупка AI на перпетуалі: разова ціна за місячну к
  '0806c52d17': 'pricing',  # Ціни на «вільні» девайси перпетуала немає. Ввести 
  '8316716dd8': 'product',  # Change plan на legacy-плані не має якоря. Ліцензія
  'ba6afef22d': 'product',  # Enabled для White labeling сьогодні недосяжний з д
  'cc462644be': 'product',  # Free-рядок показує «—» у колонці стану. Free-підпи
  'e0738fe535': 'product',  # Info-іконка покриває два рядки з шести. Production
  '9b901bdc09': 'product',  # Renew subscription на скасованій — secondary, хоч 
  '2e25b95a39': 'product',  # «Updates period over» на Home не показується і з т
  '4ab550e475': 'product',  # Блок Included in every plan для TBMQ ЗНЯТО 2026-09
  '629bcdd687': 'product',  # ВІДКРИТЕ (2026-09-24, восьма правка): лічильник ба
  '3d9ab337b6': 'product',  # ВІДКРИТЕ (2026-09-24, сьомий батч): Renew software
  '639f3d6a85': 'product',  # ВІДКРИТЕ РІШЕННЯ: що робити з ліцензіями на Maker 
  '97ba4c832c': 'product',  # ВІДКРИТЕ: чи показує Home перевірки інстансів. Піс
  'b4e3edfff1': 'product',  # Дві перпетуальні картки описані по-різному (2026-0
  '208e59165a': 'product',  # Заголовок групи на Change plan. Крок показує загол
  '53d02b1957': 'product',  # ЛІЧИЛЬНИК RECENT ACTIVITY — ВІДКРИТЕ РІШЕННЯ (2026
  'd5c30972ce': 'product',  # Сортування колонок — тепер ЄДИНИЙ контрол, який ви
  'ede84573c9': 'product',  # У TBMQ немає плану «Business». ТЗ пʼятірки Home на
}
OWNER_LABEL = {
  'product':     'Product — a decision about what the portal does or shows',
  'pricing':     'Pricing — a number nobody has confirmed in writing',
  'copy':        'Copywriting — a sentence waiting for approval, or missing entirely',
  # ⚠️ NO COUNT IN A LABEL. This said "the two questions" and the table beside it printed 3.
  'legal':       'Legal — questions that are not ours to answer',
  'engineering': 'Engineering — a data or release fact the prototype guessed',
  'design':      'Design — a team decision, twice deferred',
}

# ---------- the document ----------------------------------------------------------
# ⚠️ Every "from" letter in MOVES is checked against CAT before anything is written.
# A triage that disagrees with its own table is worse than none.
bad = [(k, f, CAT.get(k)) for k,(f,t,why) in MOVES.items() if CAT.get(k) != f]
if bad:
    print('MOVES disagrees with CAT:', bad, file=sys.stderr); sys.exit(3)

LET = {
 'A': ('A · Blocked — needs an answer before anyone writes code',
   "Product, data, copy or legal questions. The prototype shows a shape; it does not know the "
   "real value, the confirmed price, the approved sentence or the legal answer. **A developer "
   "who implements these as they stand ships a guess.**"),
 'B': ('B · Build it — and do not copy this',
   "The surface is decided. These are defects measured in the prototype: overflow, contrast, "
   "a wrong `aria-label`, a rule that wins by position, a token used without being declared. "
   "**Read as: this is what the prototype does wrong at this spot.** Several are one-line fixes "
   "in a real build and exist here only because the prototype is hand-written CSS."),
 'C': ('C · Prototype-local — a developer can ignore all of it',
   "The measurement harness, the mirrors, the checkers, the settings bar, seeded demo data, "
   "publishing. **None of it exists in the product.** It is here because the next session "
   "needs it, not because anyone implements it."),
 'D': ('D · Design-system decision — not a developer\'s call',
   "Open questions about the system itself: which scale a value collapses to, whether a form "
   "is a variant, what an axis means. **The answer goes into `SCALES.md` or `COMPONENTS.md` "
   "first, and reaches code from there.**"),
 'E': ('E · Closed',
   "Struck through in `NOTES.md` and kept for the reasoning. **Listed so nobody re-opens them "
   "by reading the list and not the strikethrough.**"),
}

out = []
w = out.append
w("# Triage — the debt, read by who has to act on it")
w("")
w(f"**`NOTES.md` keeps {len(entries)} debt entries in one list, newest first. That list is a log: it")
w("is ordered by when something was found, which is the one order that helps nobody decide what")
w("to do.** This file is the same entries sorted by **who acts**.")
w("")
w("**It is a view, not a second source.** Every title below is read out of `NOTES.md` by")
w("`tools/triage.py`; only the category letters are stored. Re-run it after the debt list")
w("changes and the titles cannot drift.")
w("")
w("⚠️ **The titles stay in the language `NOTES.md` wrote them in, on purpose.** Translating them")
w("here would make this a second source that silently disagrees with the first — which is the")
w("exact failure this file exists to avoid. The framing is in English because `SCALES.md` and")
w("`COMPONENTS.md` are, and because the categories are what a reader outside this session needs.")
w("")
w("⚠️ **The numbers are POSITIONS in that list, newest first — they are not ids and they move.**")
w("An entry added at the top shifts every number below it. Match on the title; use the number to")
w("find the entry quickly, not to refer to it from anywhere else.")
w("")
w("## What is here")
w("")
w("| | | n |")
w("|---|---|---:|")
for k in 'ABCDE':
    n = sum(1 for e in entries if e['cat']==k)
    w(f"| **{k}** | {LET[k][0].split(' · ',1)[1]} | {n} |")
w(f"| | **total** | **{len(entries)}** |")
w("")
NA = sum(1 for e in entries if e["cat"] == "A")
w(f"⚠️⚠️ **The honest headline: {NA} entries block implementation and most of them are NOT design.**")
# ⚠️ THE COUNT IS COMPUTED, NOT TYPED. This sentence said "two legal questions" as prose and
# went stale the moment a third one was added (2026-10-08) — a generated file disagreeing with
# its own table two paragraphs down, which is exactly the drift this generator exists to stop.
NLEG = sum(1 for e in entries if e["cat"] == "A" and OWNER.get(e["sig"]) == "legal")
w(f"They are unconfirmed prices, `inferred` version numbers, copy waiting for approval and {NLEG}")
w("legal questions. **The redesign is further along than the facts it is drawn on.**")
w("")
w("## ⚠️⚠️ The designer reading, which is the part worth arguing with")
w("")
w("`SCALES.md` and `COMPONENTS.md` are the record for designers and developers both, so the same")
w("entry can sit in two places depending on who picks it up. **These are the ones that move, and")
w("the move is the finding** — not a second opinion about the same thing.")
w("")
w("| # | entry | dev | designer | why it moves |")
w("|---:|---|:---:|:---:|---|")
mv_rows = [(e['n'], e['title'], MOVES[e['sig']]) for e in entries if e['sig'] in MOVES]
for n, ttl, (f,t,why) in mv_rows:
    w(f"| {n} | {ttl} | {f} | **{t}** | {why} |")
w("")
w("**The shape of it, in one line each:**")
w("")
w("- **Contrast is the big one, and it is not five bugs.** Five entries sit in B for a developer —")
w("  a line fails AA, fix the line. For a designer all five are **A**, and they are not five")
w("  separate problems: **three are token VALUES** (`--status-ok` at 4.24:1, `--status-alert` at")
w("  3.35:1, `--mid` at 14px across four lines), **one is a type/colour pairing** (the panel")
w("  banner's lead at 4.48:1) and **one is the system contradicting its own rule** — tone carried")
w("  by colour alone, where the page says colour is never the only carrier. Changing a token")
w("  changes every surface it reaches, so the order matters: **decide the values, then re-measure")
w("  the lines.**")
w("- **An undecided design is not plumbing.** `Landing › Gradient` and the twelve unclosed")
w("  comparisons read as prototype settings to a developer and as **unfinished work** to a designer.")
w("  Nothing can be handed over while a surface has three competing versions and no winner.")
w("- **A missing specimen is missing documentation**, not a nice-to-have: toolbar C ships and the")
w("  styleguide shows A and B.")
w("- **And two move the other way.** `licPlan: side` with no mobile treatment, and a boundary")
w("  written twice (`--bp-phone` plus nine hard-coded `matchMedia`): a designer reads both as")
w("  recorded decisions, a developer reads them as **two sources of truth, one of which is")
w("  silently wrong.**")
w("")
for k in 'ABCDE':
    title, blurb = LET[k]
    w("---")
    w("")
    w(f"## {title}")
    w("")
    for line in blurb.split('. '):
        pass
    w(blurb)
    w("")
    rows = [e for e in entries if e['cat']==k]
    if k == 'A':
        unowned = [e['n'] for e in rows if e['sig'] not in OWNER]
        if unowned:
            print('A entries with no owner:', unowned, file=sys.stderr); sys.exit(4)
        by = collections.Counter(OWNER[e['sig']] for e in rows)
        w("**Routed by who answers it.** None of these is a design question, and none was")
        w("attempted here.")
        w("")
        w("| owner | n | what the bucket means |")
        w("|---|---:|---|")
        for o, n in by.most_common():
            w(f"| **{o}** | {n} | {OWNER_LABEL[o].split(' — ',1)[1]} |")
        w("")
        w("| # | owner | entry | |")
        w("|---:|---|---|---|")
        for e in sorted(rows, key=lambda e:(OWNER[e['sig']], e['n'])):
            mv = f"→ **{MOVES[e['sig']][1]}** for a designer" if e['sig'] in MOVES else ''
            w(f"| {e['n']} | {OWNER[e['sig']]} | {e['title']} | {mv} |")
        w("")
        continue
    w("| # | entry | |")
    w("|---:|---|---|")
    for e in rows:
        mv = ''
        if e['sig'] in MOVES: mv = f"→ **{MOVES[e['sig']][1]}** for a designer"
        w(f"| {e['n']} | {e['title']} | {mv} |")
    w("")
open('TRIAGE.md','w',encoding='utf-8').write('\n'.join(out) + '\n')
print('wrote TRIAGE.md', len(out), 'lines', file=sys.stderr)
