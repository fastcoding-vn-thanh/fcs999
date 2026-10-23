# Design analysis — fcs999 (Figma `KyNk93Eshiz4NPhNhGKIVa`, "fcs999_copy_01")

Read once from above on 2026-10-21 by `fa-figma-analysis`. Sources, cheapest first: `docs/project.json`, `docs/project.decisions.jsonl`, `docs/figma-sitemap.raw.json`, `fa figma-node <ten page frames> --repeats` (and `--repeats --all`), `get_variable_defs` on each of the ten page frames (unioned), one screenshot per page frame at 2000px (the pages are 4,000 to 9,000px tall, so those images served the page layout only), then `fa figma-node <section> --depth 3..4` and section-level screenshots for every section whose structure the page screenshot could not show. The Figma design-to-code skill was loaded (`Skill`).

Everything below is observed unless marked *inferred*. There is **no mobile artboard anywhere in the file** (`designSP` exists on none of the 56 sections), so every outline below is the PC (1440) design.

## 1. Design system

### 1a. Colours bound in the design

Union of the ten `get_variable_defs` calls. Nothing resolved to an empty string: every colour variable has a value.

| Figma variable | Value | Proposed token | Used by |
| --- | --- | --- | --- |
| Primary | #C11C1F | `--color-primary` | eyebrows, red rules, check bullets, footer, buttons (lower half), outlined buttons |
| Accent/Primary | #C11C1F | `--color-accent-primary` | same hex as Primary (see 1d, Q3) |
| Accent/Secondary | #283339 | `--color-accent-secondary` | dark banner, dark labels in the form, dark bars on `/feature03/` |
| Background/Primary | #F8F2F2 | `--color-bg-primary` | page body behind sections, form card |
| Background/Secondary | #F0F0F0 | `--color-bg-secondary` | grey cards and bands |
| text/Primary | #000000 | `--color-text-primary` | headings, body |
| text/Secondary | #6F6F6F | `--color-text-secondary` | lead and body copy in grey |
| Border/Primary | #E5E5E5 | `--color-border-primary` | card outlines, faq rows |
| Border/Secondary | #000000 | `--color-border-secondary` | rules above and below lists and tables |

White (#FFFFFF) is used 790 times with no variable. It is exempt from a token.

### 1b. Text styles (named in Figma) and the unstyled sizes that matter

Size / weight; line-height as Figma reports it. The same style name is **reported with different line-heights on different pages** (H1 1 or 1.5, H3 1 or 1.5, H4 1 or 1.5, Body/Large 1 or 1.8, Body/Medium 1 or 1.8, Body/Small 1 or 1.8), so the variable does not carry line-height and each node overrides it. LAY-06 sets the floor anyway (1.3 headings, 1.5 running text).

| Figma style | Value | Proposed token | Used by |
| --- | --- | --- | --- |
| Desktop_Heading/H1 | 45 / 900 | `--text-h1` | the page title **and** every section title (see below) |
| Desktop_Heading/H3 | 35 / 900 | `--text-h3` | banner titles, `capability-item` titles, `/faq/` "カテゴリから探す", benefit item titles |
| Desktop_Heading/H4 | 23 / 900 | `--text-h4` | item titles, lead bars |
| Desktop_Heading/H5 | 20 / 900 | `--text-h5` | numbered-item titles, link-card titles |
| Desktop_Body/Large | 18 / 600 | `--text-body-lg` | lead paragraphs, button labels |
| Desktop_Body/Large(B) | 18 / 900 | `--text-body-lg-bold` | `/` problems and `/aimes/` |
| Desktop_Body/Medium | 16 / 500 | `--text-body-md` | body text (28.8 = 1.8 in the nodes) |
| Desktop_Body/Small | 14 / 400 | `--text-body-sm` | breadcrumb, notes |
| Button/Large | 25 / 900 | `--text-btn-lg` | in the variable set, **not found on any node I read** |
| Button/Medium | 20 / 900 | `--text-btn-md` | in the variable set |
| Button/Small | 18 / 600 | `--text-btn-sm` | button labels |
| Button/XSmall | 16 / 600 | `--text-btn-xs` | `button-more` S |
| Button/XXSmall | 14 / 700 | `--text-btn-xxs` | `text-link` labels |

- **There is no H2 style.** Section titles are 45px, the H1 style, so a heading's level cannot be read off its size (SEM-02). Every outline below assigns levels from the document.
- **Fonts**: Noto Sans JP (400/500/600/700/900) for text; **Avenir** (800/900) for eyebrows and large figures; **Avenir Next** (700 at 12px for the header nav, 900 for numerals); **Outfit** (700) for the black numbered circles and the "¥". Avenir and Avenir Next are not web fonts (Q9).
- Unstyled sizes that matter: 100/900 "CONTACT" in the footer, 80/900 "3" and 86/900 "4" inside two section titles, 89.8/900 numerals on `/services/`, 64/900 pale numerals on solution cards, 12 header nav.

### 1c. Effects and gradients

- One drop shadow in the whole file: the hero form card on `/`, `0 4 4` #000 at 25%, radius 20.
- Buttons are a two-tone pill, not a gradient: upper half #F83030, lower half #C11C1F (two rectangles), radius 60.
- Gradients are linear, all white to white or #F8F2F2 to white (section backgrounds at 1240px wide with radius 40). Page-level pale "watermark words" (PROBLEMS, SOLUTION, QUALITY, ORDER…) are vector outlines filled #C11C1F at low opacity.

### 1d. Values used with no variable behind them

- **#F83030** (upper half of every red button, 6 placements): a missing variable. Token proposed: `--color-primary-light`.
- **#6F0103** (footer button shadow plate, 10 placements, one per footer): a missing variable. Token proposed: `--color-primary-dark`.
- **#E92225** (the header's slanted red block, 10 headers): a missing variable, and it is not Primary (#C11C1F). Token proposed: `--color-header`.
- **#FFF1F1** (pale rectangles in the footer art, 6): artwork, not a token.
- **Accent/Primary and Primary are the same hex.** One of the two variables is redundant (Q3).
- Hexes #34A773, #95AED3, #5476AB, #CACCE6, #FFE6D8 occur in illustrations only and are not tokens.

### 1e. Spacing and radius actually in use

Read from every Auto Layout frame in the ten pages.

- **Gap**: 1, 2, 4, 6, 8, 10, 16, 20, 21, 24, 32, 40, 48, 56, 64, 80 (most used 16, 20, 10, 40, 32). 7.56 appears three times (an inherited fractional value).
- **Padding** (all four sides equal unless stated): 0 (300 frames), 32 (18), 40 (3), 56 (1), `24 40 24 40` (6), hero `180 62 180 62` and `180 104 180 104`.
- **Radius**: 2, 3, 5 (140 uses, mostly vector shapes), 10, 20, 35, 40, 44, 60, 89, 1200. The ones that govern markup are **5, 10, 20, 40 and 60** (button = 60, card = 10 or 20, section panel = 40).
- **Strokes** (px): 1, 1.5, 2, 2.5, 3, 4. Stroke colours: #000 (410), #C11C1F (86), #E5E5E5 (80).
- The scale is mostly 8 / 16 / 24 / 32 / 40 / 48 / 64 / 80 with a second family of 10 / 20. Not a 13 / 27 / 41 design.

## 2. Layout

- `designWidth` 1440, `spWidth` 390 (from `docs/project.json`; no SP frame exists).
- **Content column observed: 1080px, centred (x 180 to 1260).** Measured on `/` problems (`1517:3796`, 1080 wide at x 180 in the 1440 page) and confirmed on `/faq/` faq-list, `/aimes/` benefit and `/services/` capabilities. `project.json` has `contentWidth: 0`; record **1080**.
- Sections come in two widths: 1080 (content only) and **1240** (the same 1080 column with an 80px bleed each side, used where the section has a card or white panel, radius 40: `/` quality and orderflow, `/figma-guideline/` essentials, `/aimes/` service, `/faq/` search and more-information, the four `quality-detail` sections). Header, hero, footer and the CTA band are full bleed 1440.
- **Vertical rhythm: 104px between consecutive sections** (frame to frame, measured on `/`, `/flow/`, `/faq/`, `/quality/`), also hero to first section and last section to footer. **The one exception is 80px before a banner** (`/flow/`, `/aimes/`, `/quality/`, `/services/`, `/feature01/`), then 104 after it.
- Column grid, as drawn: 2 columns 530 + 20; 3 columns 346 + 21 (results, navigation cards, guideline specification at 346); 4 columns 255 + 20 (documents, faq category buttons, link cards). No 12-column grid is drawn.
- The breadcrumb sits at x=100, inside the hero and above the title, not on the 180 content column. It is at y=96, 16px under the header.
- Page frames are **not Auto Layout**: sections are absolutely positioned children of the page frame, and the include order has to be read off y (done for all ten pages and it agrees with `project.json`, except the four banners, see §7). Inside a section Auto Layout is used heavily (about 340 Auto Layout frames over the ten pages).

### 2a. Layouts

| Layout | Header | Footer | Pages | Notes |
| --- | --- | --- | --- | --- |
| default | `header` | `footer` | all | One layout. The header is a detached frame on all ten pages and the **ten are identical**: same children, text, fills and positions in page coordinates. Only the wrapper frame differs: `/` is 1440 wide at x 0, the other nine are 1415 wide at x 25, so the children land on the same page coordinates (the nine cut 25px off the left of an empty strip). The footer is a real instance of one component on all ten pages. |

## 3. Catalog

### 3a. Catalog

| Name | Folder | Node | Pages | In `components[]`? | Uses | Variants | DADS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `banner` | parts | 1820:3053 (also 1820:2972, 1820:3019, 1820:2994, 1820:2961, 1820:3097, 1820:3142) | feature01, feature02, feature03, flow, aimes, quality, services | yes — `banner` 1820:2827 and `banner-aimes` 1820:2960 are declared as two; merge (3b) | 7 | eyebrow label (ICONCLUSION / POWERED BY AIMES); title; text; `button-more` size S or L; button hidden (feature03 1820:3145) | - |
| `faq-group` | parts | 1520:6162 (also 1520:6146, 1520:6131, 1520:6117) | faq | no — add | 4 | eyebrow label; title; item count (7, 8, 7, 6) is data | - |
| `footer` | parts | 1517:3603 | all | yes | 10 | - | - |
| `header` | parts | 1517:3978 (also 1517:4889, 1520:5391, 1520:5804, 1520:6217, 1520:7094, 1520:7401, 1520:7986, 1653:4253, 1653:6604) | all | yes — detached on all ten pages | 10 | wrapper 1440 at x 0 on `/`, 1415 at x 25 elsewhere (children identical) | `header-container` |
| `navigation` | parts | 1683:7221 (also 1683:8204, 1722:3637) | feature01, feature02, feature03 | no — add | 3 | which three of the four `number-card`s are shown (data); contains `back-to-home` | - |
| `page-hero` | parts | 1517:4875 (also 1520:5375, 1602:6237, 1520:6204, 1653:4237, 1653:6587, 1520:7076, 1683:7458, 1711:2724) | all but / | no — add | 9 | CTA `button-contact` shown (flow, figma-guideline, quality, services) or none (aimes, faq, features); number badge 01 to 03 beside the title (feature01 to 03); lead 1 to 3 lines | - |
| `quality-detail` | parts | 1653:4143 (also 1653:4107, 1653:4002, 1653:3966) | quality | no — add | 4 | image left or right (see note); eyebrow; texts | - |
| `back-to-home` | module | 1825:5619 (also 1825:5627, 1825:5631) | feature01, feature02, feature03 | yes | 3 | - | - |
| `benefit-item` | module | 1520:5612 (also 1520:5628, 1520:5646) | aimes | no — add | 3 | icon; label POINT 0n; heading; sub line; text (right column) | - |
| `breadcrumb` | module | 1517:4881 (also 1517:3681, 1520:5383, 1520:5795, 1520:6209, 1520:7085, 1520:7392, 1520:7977, 1653:4245, 1653:6596) | all | no — add | 10 | depth 2 on `/`, depth 3 elsewhere; current label | `breadcrumb` |
| `button-contact` | module | 1517:3897 (also 1517:3661, 1517:4880, 1520:5382, 1653:4244, 1653:6595, 1517:3763, 1653:4065) | /, flow, figma-guideline, quality, services | yes — but the declared node 1602:5418 is not what pages place; they place 671:46 (`btn-contact`) and 672:176 (`flow-button`) | 8 | label; red or white fill (white = 1653:4065, a detached 360x60 copy); hover | `button` |
| `button-more` | module | 1535:9772 (also 1812:2680, 1535:9756, 1535:9760, 1535:9764, 1535:9768, 1653:6421, 1820:2919, 1653:6462, 1653:6466, 1653:6470, 1653:6474, 1820:3100) | /, flow, aimes, faq, feature01, feature02, quality, services | yes | 18 | size S (207x44), M (250 or 300 x 60), L (350x60); label; hover | `button` |
| `capability-item` | module | 1653:6582 (also 1653:6583, 1653:6584, 1653:6585, 1653:6586) | services | no — add | 5 | title; lead text; four title-and-text cells; grey band on alternate items | - |
| `case-item` | module | 1517:3649 (also 1517:3650, 1517:3651) | / | no — add | 3 | site type; quote; client; five spec rows (all dummy copy today) | `card` |
| `check-item` | module | 1517:3663 (also 1517:3666, 1517:3669, 1517:3672, 1517:3675, 1517:3678, 1653:6530, 1520:5104, 1653:4192) | /, figma-guideline, quality, services | no — add | 33 | text; one or two lines | - |
| `conclusion-box` | module | 1776:5661 (also 1781:5807, 1722:2781) | feature01, feature02 | no — add | 3 | arrow tab on the top border (feature01) or none (feature02); text | - |
| `explanation-block` | module | 1683:6968 (also 1683:6969) | feature01 | no — add | 2 | title; lead bar; text; figure and list; contains `conclusion-box` | - |
| `faq-item` | module | 1535:9827 (also 1535:9828, 1535:9826, 1520:6164, 1520:6165, 1520:6148, 1520:6133, 1520:6119) | /, faq | yes — declared as `faq-question` 1215:5249 and `faq-answer` 1458:3547; merge (3b) | 31 | open (answer and `text-link` shown) or closed | `accordion` |
| `form-field` | module | 1517:3973 (also 1517:3974, 1517:3975, 1517:3976) | / | no — add (component 671:9 `hero-form`) | 4 | label; placeholder | `input-text` |
| `guideline-detail` | module | 1602:6114 (also 1520:5203, 1653:4622, 1653:4699, 1653:4779, 1653:4858) | figma-guideline | no — add | 6 | grey band behind (detail-02, 04, 05, 06) or none (01, 03); one or two help links; texts | - |
| `icon-card` | module | 1785:6081 (also 1785:6220, 1785:6615, 1786:6801, 1786:7199, 1785:6082, 1785:6234, 1785:6646, 1786:6819, 1786:7231, 1722:3171, 1786:7609, 1786:7624, 1786:7639, 1786:7647, 1786:7655, 1806:7809, 1806:7817) | feature02, feature03 | no — add | 18 | title shown (feature03) or not (feature02); icon; text | `card` |
| `lead-bar` | module | 1520:5600 (also 1520:5665, 1520:6949, 1683:6985, 1683:7956, 1520:7864, 1722:3480, 1653:4186) | aimes, feature01, feature02, feature03, quality | no — add | 8 | text; one or two lines. *estimate* — `--repeats` printed 7, the eighth is quality 1653:4186 which I did not read below depth 2 | - |
| `link-card` | module | 1559:5687 (also 1559:5695, 1559:5703, 1559:5711) | faq | no — add | 4 | title; text; `button-more` S; a `text-link` that is hidden in the design | `card` |
| `number-card` | module | 1825:5180 (also 1825:5181, 1825:5260, 1825:5340, 1825:5341, 1825:5342, 1825:5500, 1825:5541, 1825:5564, 1644:6564, 1646:7083, 1646:7084, 1646:7085, 1517:3730, 1517:3737, 1517:3744, 1517:3751) | /, faq, feature01, feature02, feature03 | yes — declared as `navigation-button01` to `04` (four); merge (3b) | 17 | size 255x184 / 346x210 / 530x255; link with hover or static; description (only on `/`); number; title; icon | `card` |
| `numbered-item` | module | 1520:5599 (also 1520:5596, 1520:5597, 1520:5598, 1517:4855, 1517:4860, 1517:4865, 1517:4870, 1520:5338, 1653:4430, 1653:4436, 1520:5358, 1653:4449, 1653:4455, 1520:5142, 1520:5147, 1520:5152, 1520:5157, 1520:5162, 1520:5167, 1653:6558, 1653:6562) | flow, figma-guideline, aimes, services | no — add (the four on aimes are instances of component 1202:1189 `service-item`) | 22 | label "01" or "01｜TASK"; title 20 / 23 / 25px; body 14 / 16px; card border (aimes) or none | - |
| `orderflow-item` | module | 1531:9521 (also 1531:9529, 1531:9537, 1531:9545, 1531:9553, 1531:9561) | / | no — add | 6 | number; title; text below the card | - |
| `point-item` | module | 1761:6079 (also 1761:6096, 1761:6124) | feature01 | no — add | 3 | icon; label POINT 0n; heading; text below | - |
| `problem-item` | module | 1520:9051 (also 1520:9061, 1520:9071) | / | no — add | 3 | number; eyebrow; heading; sub line; text; `text-link` | - |
| `quality-item` | module | 1517:3689 (also 1517:3697, 1517:3705, 1517:3713) | / | no — add | 4 | image left or right (alternating); label QUALITY｜0n; title; text; `button-more` | - |
| `reason-group` | module | 1722:3139 (also 1722:3199) | feature03 | no — add | 2 | heading; four `icon-card`s; dark conclusion bar (text, icon) | - |
| `role-column` | module | 1722:3321 (also 1722:3322, 1722:3323) | feature03 | no — add | 3 | image; name; bullet list; role text | `card` |
| `section-heading` | module | 1535:9829 (also 1517:3721, 1517:4841, 1517:4748, 1520:5331, 1520:6179, 1653:4174) | all | no — add | 50 | eyebrow label; h2 text; lead text below; size 45 or 35; eyebrow with or without the red rule; on white or on dark. *estimate* — counted from the section trees and screenshots, not from a component | - |
| `step-item` | module | 1543:2332 (also 1543:2296, 1543:2362, 1543:2363, 1543:2379, 1543:2411, 1683:8042, 1683:8043, 1683:8057, 1683:8071, 1722:3483, 1722:3484, 1722:3494, 1722:3515) | flow, feature02, feature03 | no — add | 14 | STEP label shown (flow, feature02) or hidden (feature03); sub-heading shown (flow only); title column width and alignment | - |
| `text-link` | module | 1520:9057 (also 1520:9067, 1520:9077, 1535:9826) | /, faq, figma-guideline | no — add | 16 | label; arrow left of the label | - |

Notes on the table:
- Read from the tree and exact: every `Uses` except the two marked *estimate*. `button-more` is 6 M + 6 L + 6 S; the `button-more` inside the feature03 banner (1820:3145) is **hidden** and not counted. `check-item`: `--repeats` printed 32, the 33 is the seven items of `/services/` (their widths differ so the tool grouped six).
- `quality-detail` image side: analysis-1 and comparison put the image on the right, analysis-2 and review on the left *(inferred from review 1653:3966 and analysis-1 1653:4143, which I viewed; the other two I did not view)*.
- `navigation` and `banner` are sections. `1820:2872` (`impact` on `/`, inside problems) is the same block as `banner` without a button; it is not counted because it is not a section (3b).
- Where a node listed is an instance, the component is: `footer` 1275:1782, `button-more` 1535:9740, `button-contact` 671:46, `back-to-home` 1825:5584, `faq-question` 1215:5249, `faq-answer` 1458:3547.

### 3b. Near-misses

- **`banner` / `banner-aimes`** — nodes `1820:2827`, `1820:2960`. They differ in **one thing**: strings and the button size (S 207x44 against L 350x60). Eyebrow, title, text and button sit in the same tree, and the screenshots match. Lean: **one component `banner`**, because every difference is a value, and the button can be hidden (feature03 hides it). The same block appears without a button as `impact` (1820:2872) inside `/` problems; reuse it there.
- **`faq-question` / `faq-answer`** — nodes `1215:5249`, `1458:3547`. They differ in **one thing**: the answer body and a `text-link` are shown or not. Lean: **one component `faq-item` with an open state**, because it is a flag on a child.
- **`navigation-button01` to `04`, `faq-category-button01` to `04` and the four `solution` cards on `/`** — nodes `1820:3203`, `1643:6342`, `1517:3730`. Each is a card holding a pale circle with an icon, a pale numeral top right and a title. They differ in **one thing**: size (346x210, 255x184, 530x255), link with hover against static, and a description on the solution cards. Lean: **one `number-card`**, because all of those are values or flags. If the reviewer disagrees, the other split is `number-card` (the eight link cards) and `solution-item` (the four static ones).
- **`step-item` (flow, feature02) / the feature03 flow items** — nodes `1543:2332`, `1722:3483`. They differ in **one thing**: no "STEP | 0n" label and the title is centred in a narrower column. Lean: **one component**, because it is a flag and an alignment.
- **`step-item` / `orderflow-item`** — nodes `1543:2332`, `1531:9521`. They differ in **one thing**: on `/` the card holds only the title and the text sits below it, outside the card. Lean: **two components**, because that is a different tree, not a value.
- **`point-item` / `benefit-item`** — nodes `1761:6079`, `1520:5612`. They differ in **one thing**: on `/aimes/` the text moves to a right column behind a vertical divider and a sub line is added. Lean: **two components**, because the arrangement changes.
- **`icon-card` on feature02 / feature03** — nodes `1785:6081`, `1722:3171`. They differ in **one thing**: feature03 adds a title beside the icon. Lean: **one component** (flag).
- **`conclusion-box` / the dark bar in `reason-group` / the underlined `list-title` in `quality-detail`** — nodes `1776:5661`, `1722:3140`, `1653:4159`. All three are a bold line with a circled icon. They differ in **one thing each**: red outlined box (feature01, feature02), dark filled bar (feature03), a rule under the line (quality). Lean: **`conclusion-box` and the dark bar are one component with a tone**, and the `list-title` stays inside `quality-detail`. I did not read the feature03 bar below depth 2, so this is a lean, not a finding.
- **`button-contact` / `flow-button` (1517:3763, a separate component) / the white CTA button (1653:4065)** — they differ in **one thing**: the white one is filled white with red text; `flow-button` and `btn-contact` are the same red pill. Lean: **one component, with a colour variant**.
- **Header buttons "自動見積り" and "お問合せ"** — nodes `1517:3990`, `1517:3993` (153x40 and 95x40 white pills). They are **not** `btn-contact`; they are detached rectangles in the detached header. Lean: keep them inside `header`, not a shared button (AN-06: they exist ten times only because the header does).

### 3c. Considered, not catalogued

- `footer-button-deadline` ×10 and `footer-button-price` ×10 — AN-06 only because the footer repeats (also `footer-bg` ×11, `footer-text` ×11, `footer-button-text` ×20, `img_cv1 1` ×16)
- `title x9, titile x6` ×19, `title x11, title-group x8` ×49, `title x15, Frame 226 x10` ×63, `scale x6, FEATURES x3` ×35, `title x7` ×7 — folded into `section-heading` or `step-item` (AN-06: children of blocks that repeat)
- `step-number x14, Group 1088 x3` ×23 — AN-06 only because `step-item` and `orderflow-item` repeat
- `description x6, item-02` ×8 — AN-06 child of `step-item`
- `text-group x6` (banner), `text-group x4` (aimes), `text-group x5`, `text-group x4` — AN-06 children of `banner`, `benefit-item` and the section headers
- `help label x6` (guideline) and `details x6` — AN-06 children of `guideline-detail`; `details x3` — child of `role-column`
- `section2 x3`, `list x4`, `item-2 x3 / item-1 x3` — AN-06 children of `quality-detail`
- `faq-list x2` — AN-06 child of `faq-group`
- `item-01, item-02` ×10 (flow documents and guideline specification) and `item-06, item-05` ×6 (requirements) — became `numbered-item`
- `item-01, item-02` ×6 (`/` orderflow), ×3 (`/` problems), ×4 (feature03 flow), ×4 (faq more-information) — became `orderflow-item`, `problem-item`, `step-item`, `link-card`
- `hero x3`, `hero x2`, `text-group x3, hero x2` — became `page-hero`
- `conclusion x3`, `list-title x4, Frame 342 x2` — became `conclusion-box` and the lean in 3b
- `impact, iconclusion` ×2 — same block as `banner` (3b); not counted because `impact` is not a section
- `banner_AIMES x4, banner` — became `banner`
- `hero-btn x4, btn-contact x2` ×7 — became `button-contact`
- `subtitle x7` — became `lead-bar`
- `alert-circle x7, download` ×10 — AN-04 a lone icon
- `arrow x6` — AN-04 a lone circled arrow (the connector above a dark box or conclusion)
- `decoration-image` (all variants, about 40 nodes on all ten pages) — AN-04 pale watermark words, decorative vectors, no bundle of states
- `explanation-figure-l, explanation-figure-r` ×2 (`/quality/` approach) — AN-04 one picture with a caption
- `image-AI x7, image` ×8 — AN-04 one illustration repeated, an asset not a block
- the 42 shapes carrying only default layer names (`Group`, `Clip path group`, `Mask group`, `グループ`, `_レイヤー_1`) — AN-04 vector artwork (icons and illustrations), assets rather than blocks; not opened one by one
- the comparison table cells (16 per column set) on feature03 — AN-06 only because the table repeats; one `table` in the outline
- `results` spec rows ×5 per card and `capability` cells ×4 per item — AN-06 children of `case-item` and `capability-item`
- `hero-form-submit` ×1, `solution-button` ×1 — seen once (the latter is `button-contact`)

## 4. Per page

Heading levels below follow the document. The "4つの特長" and "…、3つの理由" titles are each two text nodes in the design (a large figure in Avenir plus the rest in Noto), so the h2 text is reassembled here. Instance-internal node ids contain a semicolon (`I1535:9826;1458:3400`); they are written in full.

### / — node 1517:3602 · SP none

**Semantic outline**

```
header            > nav @1517:3984
main
  section  hero          nav @1517:3681  h1 "AIの速さと、HTMLコーディング専門会社の品質を両立します。" @1517:3891  form @1517:3898 > h2 "資料請求はこちら" @1517:3902
  section  problems      h2 "AIコーディングを実案件で使い切れない、3つの理由" @1517:3799  ul > li x3 @1520:9051,1520:9061,1520:9071 > h3 @1520:9052,1520:9062,1520:9072  h3 "AIの速さが、確認と手直しの負担に変わる" @1820:2878
  section  solution      h2 "AIの速さと、専門会社の品質を両立。" @1517:3769  figure @1517:3764  h3? "AIMES" @1531:9118  ul @1517:3729 > li x4 > h3 @1517:3732,1517:3739,1517:3746,1517:3753
  section  quality       h2 "4つの特長" @1517:3725  ul @1517:3688 > li x4 > h3 @1517:3694,1517:3701,1517:3710,1517:3717
  section  pricing       h2 "料金・お見積もり" @1517:3655  ul @1602:3961 > li x6
  section  results       h2 "制作実績" @1517:3647  ul @1517:3648 > li x3 > article @1517:3649,1517:3650,1517:3651 > h3 @I1517:3649;1215:4541,I1517:3650;1215:4541,I1517:3651;1215:4541
  section  orderflow     h2 "ご依頼の流れ" @1531:9582  ol @1531:9520 > li x6 > h3 @1531:9525,1531:9533,1531:9541,1531:9549,1531:9557,1531:9565
  section  faq           h2 "よくあるご質問" @1535:9830  ul @1535:9825 > li x3 > h3 @I1535:9826;1458:3400,I1535:9827;1215:5243,I1535:9828;1215:5243
footer            > h2 "中・大規模サイトのコーディングをご相談ください。" @I1517:3603;1275:1666
# problems — the "3" in the title is a separate 80px text node 1520:9099 laid over a blank in the string; the dark IMPACT box (1820:2872) is a banner without a button, h3 is my reading
# solution — figure 1517:3764 is a grey placeholder labelled "AIMES運用画面", not a delivered image; the AIMES wordmark 1531:9118 is a 56px Avenir line, its h3 level is a guess
```

**Sections** — in include order (confirmed against y on the page frame).

| Section | Node | What it is | Notes |
| --- | --- | --- | --- |
| hero | 1517:3815 | Title, lead, `button-contact`, and a form card ("資料請求はこちら", four `form-field`s, a download button) over a red art panel | Layout `HORIZONTAL`, padding 180; breadcrumb overlays at y=96; the form is the only shadowed card in the file |
| problems | 1517:3796 | Intro, three `problem-item`s on a divider list, then the dark IMPACT box | Dotted dividers are LINE nodes between the items |
| solution | 1517:3728 | Intro, AIMES capture and text with a `button-contact`, four static `number-card`s | The pale numerals 01 to 04 are text nodes inside each card |
| quality | 1517:3686 | Title "4つの特長" and four `quality-item`s alternating image side | 1240 wide panel, radius 40; images are grey placeholders |
| pricing | 1517:3652 | Intro and a red-squared check list of six `check-item`s with a `button-contact` | The check list and the button sit in one 204px band |
| results | 1517:3641 | Three `case-item` cards | All copy is dummy ("ダミーダミー", "サイト種別が入ります") |
| orderflow | 1531:9393 | Title, text, `button-more`; an illustration and six `orderflow-item`s on a dotted line | 1240 panel; the number circles and the dotted line are separate vector nodes |
| faq | 1535:9824 | Title, three `faq-item`s (first open), `button-more` | Layer order inside the list is answer first, then two questions |

**Interactive** — `js-faq-toggle` (accordion, 3 items, first open); `js-form` on the hero form (4 fields and a download button, nothing about validation drawn); hover on every button and card link (CSS).
**Assets** — the header logo (bitmap), a bitmap search icon, one hero art panel (about 9 vector groups), a woman illustration in the form card, a robot illustration repeated in the orderflow art, 4 illustrated icons, 4 quality images and one AIMES capture (placeholders), the footer art; *counts inferred from layer names*.
**Risks** — hero is layered over a page-level pink background and four page-level watermark words (`decoration-image`) that are absolutely placed behind sections; the h2 of problems and quality are split text; results are dummy copy; the breadcrumb on this page is two levels deep.

### /flow/ — node 1517:4668 · SP none

**Semantic outline**

```
header            > nav @1517:4895
main
  section  hero          nav @1517:4881  h1 "ご依頼の流れ" @1517:4877
  section  documents     h2 "ご相談時にお送りいただくもの" @1517:4853  ul @1517:4854 > li x4 > h3 @1517:4858,1517:4863,1517:4868,1517:4873
  section  before-order  h2 "お問い合わせからご発注まで" @1517:4845  ol > li x3 @1543:2332,1543:2296,1543:2362 > h3 @1543:2336,1543:2225,1543:2351
  section  after-order   h2 "ご発注後から納品まで" @1517:4752  ol > li x3 @1543:2363,1543:2379,1543:2411 > h3 @1543:2367,1543:2383,1543:2399
  section  banner        [part]
footer            > h2 "中・大規模サイトのコーディングをご相談ください。" @I1517:4669;1275:1666
# banner — in the design (1820:2972, y=3653) but not in `project.json` sections for this page, see §7
```

**Sections**

| Section | Node | What it is | Notes |
| --- | --- | --- | --- |
| hero | 1517:4875 | `page-hero` with eyebrow, h1, lead and a `button-contact` | h1 is 45px and so are the section titles |
| documents | 1517:4846 | Intro and four `numbered-item`s in a row | 255 wide each, gap 20 |
| before-order | 1517:4753 | Title and three `step-item`s on a timeline; step 2 holds an image and a `button-more` L | 1240 panel; children are in reverse layer order (step-03, 02, 01) |
| after-order | 1517:4694 | Title and three `step-item`s (steps 4 to 6) | Step 6 repeats the label "STEP｜05" and its title "制作中の確認" (copy slip, Q7) |
| banner | 1820:2972 | `banner` with a `button-more` L | Not in `project.json` |

**Interactive** — hover on buttons (CSS). The timeline dots are static.
**Assets** — one image inside step 2 (a screenshot frame), the footer art.
**Risks** — the layer order of the steps is reversed against the visual order, so the HTML must follow the visual order; the black numbered circles and the dotted line are separate vector nodes from the cards.

### /figma-guideline/ — node 1520:5068 · SP none

**Semantic outline**

```
header            > nav @1520:5397
main
  section  hero            nav @1520:5383  h1 "Figmaデザインガイドライン" @1520:5377
  section  requirements    h2 "必須となるのは、次の6項目です" @1520:5335  ul > li x6 @1520:5338,1653:4430,1653:4436,1520:5358,1653:4449,1653:4455 > h3 @1520:5341,1653:4432,1653:4438,1520:5360,1653:4452,1653:4458
  section  essentials      h2 "各項目の確認ポイント" @1520:5179  ol > li x6 @1602:6114,1520:5203,1653:4622,1653:4699,1653:4779,1653:4858 > h3 @1520:5192,1520:5217,1653:4653,1653:4732,1653:4815,1653:4891
  section  specification   h2 "画面だけでは分からない仕様" @1520:5140  ul @1520:5141 > li x6 > h3 @1520:5145,1520:5150,1520:5155,1520:5160,1520:5165,1520:5170
  section  checklist       h2 "入稿前チェックリスト" @1520:5098  ul @1653:4901 > li x5  ul @1653:4900 > li x5
footer            > h2 "中・大規模サイトのコーディングをご相談ください。" @I1520:5069;1275:1666
# essentials — each detail holds three groups ("確認すること", "なぜ必要ですか？", "避けていただきたい例") that are h4 or a `dl`; their ids are 18 nodes I did not read, left out rather than guessed
# requirements — the last line "必須ではないもの：…" (1520:5374) is a note, not drawn
```

**Sections**

| Section | Node | What it is | Notes |
| --- | --- | --- | --- |
| hero | 1520:5375 | `page-hero` with a `button-contact` | |
| requirements | 1520:5328 | Intro and six `numbered-item`s in a 3x2 grid, second row on a grey band | 1080 wide with rules above and below |
| essentials | 1520:5172 | Six `guideline-detail`s one under the other | 3,880px tall; large numerals 01 to 06 (89.8px, 1520:5322 to 5327) are page-level texts beside, not inside, each detail |
| specification | 1520:5133 | Intro and six `numbered-item`s in a 3x2 grid | |
| checklist | 1520:5095 | Title and two columns of `check-item`s (5 + 5) | Items 40 to 43px tall where they wrap |

**Interactive** — none. External links in `guideline-detail` ("Figmaヘルプセンター" and 1 to 3 arrow links) are plain links.
**Assets** — a Figma logo icon per detail (6), the footer art.
**Risks** — the six details alternate between a 1080 and a 1240 frame (grey band on 02, 04, 05, 06 only); the numerals are absolutely placed texts.

### /aimes/ — node 1520:5563 · SP none

**Semantic outline**

```
header            > nav @1520:5810
main
  section  hero      nav @1520:5795  h1 "AIと人を「AIMES」で一元管理" @1602:6239
  section  about     h2 "AIMESが制作工程をひとつにつなぐ" @1520:5785  figure @1520:5674
  section  benefit   h2 "「AIMES」を使うメリット" @1520:5672  ul @1520:5610 > li x3 > h3 @1520:5622,1520:5640,1520:5660
  section  service   h2 "AIMESが管理する4つ" @1520:5608  ul > li x4 @1520:5599,1520:5598,1520:5597,1520:5596 > h3 @I1520:5599;1202:1163,I1520:5598;1202:1163,I1520:5597;1202:1163,I1520:5596;1202:1163
  section  banner    [part]
footer            > h2 "中・大規模サイトのコーディングをご相談ください。" @I1520:5803;1275:1666
# about — the diagram (1520:5674) is vectors plus about 15 live text nodes (AIMES, 完了, AI, Coder, QC, ベース実装, …); whether it is one image or live markup is Q8
# banner — in the design (1820:3019, y=3032) but not in `project.json` sections
```

**Sections**

| Section | Node | What it is | Notes |
| --- | --- | --- | --- |
| hero | 1602:6237 | `page-hero` without a button | |
| about | 1653:4903 | Title with three short lines at left, a diagram at right | Pale ABOUT watermark behind |
| benefit | 1653:4905 | Title, `lead-bar`, three `benefit-item`s between rules | |
| service | 1520:5593 | Title, text, `lead-bar`, four `numbered-item`s in a 2x2 grid | 1240 white panel, radius 40; layer order is 04, 03, 02, 01 |
| banner | 1820:3019 | `banner` with a `button-more` L | Not in `project.json` |

**Interactive** — none beyond hover.
**Assets** — the diagram (or live markup), three line icons, the footer art.
**Risks** — the service items are in reverse layer order; the diagram mixes vector and text.

### /faq/ — node 1520:6086 · SP none

**Semantic outline**

```
header            > nav @1520:6223
main
  section  hero                nav @1520:6209  h1 "よくある質問" @1520:6206
  section  search              h2 "カテゴリから探す" @1520:6183  nav @1646:7141 > ul > li x4 @1644:6564,1646:7083,1646:7084,1646:7085
  section  requirements        [faq-group]
  section  ai-quality          [faq-group]
  section  capabilities        [faq-group]
  section  estimate-delivery   [faq-group]
  section  more-information    h2 "詳しく確認する" @1520:6116  ul @1646:7142 > li x4 > h3 @1559:5689,1559:5697,1559:5705,1559:5713
footer            > h2 "中・大規模サイトのコーディングをご相談ください。" @I1520:6104;1275:1666
# requirements, ai-quality, capabilities, estimate-delivery — each `faq-group` holds an h2 (1520:6175, 1520:6160, 1520:6144, 1520:6129) and a `ul` of `faq-item`s with an h3 each; the ids are instance internals, not repeated here
# search — the four category buttons are anchors to the four groups (*inferred*, the design shows no target)
```

**Sections**

| Section | Node | What it is | Notes |
| --- | --- | --- | --- |
| hero | 1520:6204 | `page-hero` without a button | |
| search | 1520:6177 | Title (35px) and four `number-card` category buttons | 1240 panel; the button text is 2 lines on the first and fourth |
| requirements | 1520:6162 | `faq-group` 01: title and 7 `faq-item`s (first open) | Frame is named "01-requirements" |
| ai-quality | 1520:6146 | `faq-group` 02: 8 items | Frame "02-ai & quality" |
| capabilities | 1520:6131 | `faq-group` 03: 7 items | |
| estimate-delivery | 1520:6117 | `faq-group` 04: 6 items | Frame "04-estimate & delivery" |
| more-information | 1520:6105 | Title and four `link-card`s each with a `button-more` S | The `text-link` in every card is hidden in the design |

**Interactive** — `js-faq-toggle` on 31 items (4 groups); category anchors; hover.
**Assets** — four line icons in the category buttons, illustrations behind the group titles, the footer art.
**Risks** — the group title carries a decorative drawing (Frame 323 and similar, 1555:4159 and 1555:4207) with no name.

### /feature01/ — node 1520:6580 · SP none

**Semantic outline**

```
header            > nav @1520:7100
main
  section  hero        nav @1520:7085  h1 "AIで1画面は作れても、サイト全体の品質は揃わない" @1520:7083
  section  reason      h2 "1画面の再現だけでは足りない理由" @1520:7075  ul @1761:6077 > li x3 > h3 @1761:6093,1761:6121,1761:6159
  section  about       h2 "1画面の再現と、サイト全体の品質は別の問題です" @1520:6970  h3 "一画面だけを見たAI" @1520:6965  h3 "サイト全体で必要になる情報" @1683:6984
  section  banner      [part]
  section  navigation  [part]
footer            > h2 "中・大規模サイトのコーディングをご相談ください。" @I1520:7093;1275:1666
# about — the two details (1683:6968, 1683:6969) each hold a lead bar, a figure with a list and a `conclusion-box`; the list ids (1772:5414, 1776:5666) are left out because I did not count their items
```

**Sections**

| Section | Node | What it is | Notes |
| --- | --- | --- | --- |
| hero | 1520:7076 | `page-hero` with the number badge "01" and the eyebrow "QualityConsistency" | The eyebrow has no space here and "Quality Consistency" on `/` |
| reason | 1520:6971 | Title and three `point-item`s between rules | |
| about | 1520:6609 | Title and text, then two `explanation-block`s | 1240 wide |
| banner | 1820:3053 | `banner` (instance of the component) with a `button-more` S | The only banner here that is an instance |
| navigation | 1683:7221 | Title and `navigation` with three `number-card`s and `back-to-home` | Shows cards 02, 03, 04 |

**Interactive** — hover on the cards and buttons.
**Assets** — three icons in `point-item`s, two illustrated figures, three card icons, the footer art.
**Risks** — the eyebrow of the banner reads "ICONCLUSION" (Q7).

### /feature02/ — node 1520:7113 · SP none

**Semantic outline**

```
header            > nav @1520:7407
main
  section  hero        nav @1520:7392  h1 "小規模では直せても、大規模では破綻する" @1683:7467
  section  about       h2 "増えるのは、ページ数ではなく関係性です" @1683:7963  h3 "小規模サイト" @1722:2823  h3 "中・大規模サイト" @1722:2824  ul @1786:7511 > li x5  ul @1786:7513 > li x5
  section  flow        h2 "生成してから直す方法が破綻する流れ" @1520:7209  ol @1520:7143 > li x4 > h3 @1683:8032,1683:8049,1683:8063,1683:8077
  section  banner      [part]
  section  navigation  [part]
footer            > h2 "中・大規模サイトのコーディングをご相談ください。" @I1520:7400;1275:1666
# about — the two lists are paired row by row (small against large site) and read as a comparison; the `conclusion-box` 1722:2781 below them is not a heading
```

**Sections**

| Section | Node | What it is | Notes |
| --- | --- | --- | --- |
| hero | 1683:7458 | `page-hero` with the badge "02" | |
| about | 1683:7954 | Title, two lines, `lead-bar`, two columns of five `icon-card`s, `conclusion-box` | 1240 wide; cards are 474 x 128 |
| flow | 1520:7141 | Title, text, four `step-item`s on a timeline | 1240 wide; layer order is 04, 03, 02, 01 |
| banner | 1820:3097 | `banner` (detached copy) with a `button-more` S | |
| navigation | 1683:8204 | `navigation` showing cards 01, 03, 04 | |

**Interactive** — hover on the cards and buttons.
**Assets** — ten icons in the cards (an illustrated pair each), the footer art.
**Risks** — the banner is a detached copy of the component (D-001).

### /feature03/ — node 1520:7420 · SP none

**Semantic outline**

```
header            > nav @1520:7992
main
  section  hero        nav @1520:7977  h1 "AIに丸投げしない" @1711:2733
  section  reason      h2 "AIだけでは、判断を伴う品質確認まで完結できない" @1520:7967  h3 "AIが得意なこと" @1722:3198  ul @1722:3170 > li x4  h3 "人が判断すべきこと" @1722:3246  ul @1722:3218 > li x4
  section  service     h2 "AI × コーダー × 専任QC" @1520:7872  ul > li x3 @1722:3321,1722:3322,1722:3323 > h3 @1520:7712,1520:7819,1520:7857
  section  comparison  h2 "「AIだけ」との違い" @1520:7674  table @1520:7514
  section  flow        h2 "制作フロー" @1520:7508  ol @1722:3514 > li x4 > h3 @1520:7496,1722:3487,1722:3497,1722:3518
  section  conclusion  [banner]
  section  navigation  [part]
footer            > h2 "中・大規模サイトのコーディングをご相談ください。" @I1520:7985;1275:1666
# reason — each of the two groups ends in a dark bar ("AIが得意なことはAIへ。" and "文脈を伴う判断は人へ。") with a circled icon; they are text, not headings
# comparison — the table is drawn as three columns of frames (labels, "本サービス", "AIだけのコーディング"), not a table; the markup should be a real `table`
```

**Sections**

| Section | Node | What it is | Notes |
| --- | --- | --- | --- |
| hero | 1711:2724 | `page-hero` with the badge "03" | |
| reason | 1520:7873 | Intro, two `reason-group`s (four `icon-card`s each and a dark bar) | |
| service | 1722:3324 | Title, text, `lead-bar`, three `role-column`s joined by × lines | |
| comparison | 1520:7509 | Title, text, a three-column comparison with the middle column outlined | 1082 wide; one cell reads "A必要な検査を…" (stray A, Q7) |
| flow | 1520:7461 | Title, `lead-bar`, four `step-item`s without the STEP label | 1240 wide |
| conclusion | 1820:3142 | `banner` (detached) whose `button-more` is hidden | Body starts with a stray "サ" (Q7) |
| navigation | 1722:3637 | `navigation` showing cards 01, 02, 04 | |

**Interactive** — hover on the cards.
**Assets** — eight icons, three role illustrations, a robot and a person icon in the dark bars, the footer art.
**Risks** — the comparison table is not a table in Figma; the banner has a hidden button and a typo.

### /quality/ — node 1653:3929 · SP none

**Semantic outline**

```
header            > nav @1653:4259
main
  section  hero              nav @1653:4245  h1 "品質への取り組み" @1653:4239
  section  approach          h2 "品質は、制作工程全体で管理します" @1653:4229  figure x2 @1653:4231,1653:4234
  section  qualitystandard   h2 "品質基準の事前確認" @1653:4182  ul x2
  section  analysis-1        [quality-detail]
  section  analysis-2        [quality-detail]
  section  cta               h2 "案件に必要な品質工程をご案内します" @1653:4105
  section  comparison        [quality-detail]
  section  review            [quality-detail]
  section  banner            [part]
footer            > h2 "中・大規模サイトのコーディングをご相談ください。" @I1653:3930;1275:1666
# qualitystandard — the two `ul`s are one frame (1653:4191, 746 wide) holding ten `check-item`s in two columns, so I could not give each `ul` a node
# analysis-1, analysis-2, comparison, review — each `quality-detail` holds an h2 (1653:4175, 1653:4139, 1653:4034, 1653:3998), two h3 ("起きる問題", "本サービスの方法") and a callout with two rows
# banner — in the design (1820:2994, y=7141) but not in `project.json` sections
```

**Sections**

| Section | Node | What it is | Notes |
| --- | --- | --- | --- |
| hero | 1653:4237 | `page-hero` with a `button-contact` | |
| approach | 1653:4222 | Title, text, two grey picture placeholders with captions | Images not delivered |
| qualitystandard | 1653:4179 | Title, `lead-bar`, ten `check-item`s in two columns | |
| analysis-1 | 1653:4143 | `quality-detail`, image right | 1240 wide |
| analysis-2 | 1653:4107 | `quality-detail` | |
| cta | 1653:4038 | Full-bleed red band, h2, text and a white `button-contact` (a detached 360x60 frame) | The only white button |
| comparison | 1653:4002 | `quality-detail` | |
| review | 1653:3966 | `quality-detail`, image left | |
| banner | 1820:2994 | `banner` with a `button-more` L | Not in `project.json` |

**Interactive** — hover.
**Assets** — six grey placeholders (two in approach, four in the `quality-detail`s), the footer art and the CTA band art.
**Risks** — every image is a placeholder; the CTA band is a second use of the footer art with a smaller height (400).

### /services/ — node 1653:6482 · SP none

**Semantic outline**

```
header            > nav @1653:6610
main
  section  hero            nav @1653:6596  h1 "AIHTMLコーディング代行でできること" @1653:6589
  section  capabilities    h2 "依頼できる内容" @1653:6579  ul @1653:6581 > li x5 > h3 @I1653:6582;1405:3343,I1653:6583;1405:3343,I1653:6584;1405:3343,I1653:6585;1405:3343,I1653:6586;1405:3343
  section  requirements    h2 "ご依頼に必要な2つの条件" @1653:6568  ul > li x2 @1653:6562,1653:6558 > h3 @1653:6564,1653:6560  h2 "個別の仕様もご相談ください" @1653:6553  ul @1653:6529 > li x7
  section  banner          [part]
footer            > h2 "中・大規模サイトのコーディングをご相談ください。" @I1653:6510;1275:1666
# requirements — one frame (1653:6523, "requirements_group") holds two titled blocks; `project.json` has it as one section "requirements", so two h2 sit in one section
# capabilities — the `button-more` L "品質への取り組みを見る" (1820:2919) closes the section
# banner — in the design (1820:2961, y=5272) but not in `project.json` sections
```

**Sections**

| Section | Node | What it is | Notes |
| --- | --- | --- | --- |
| hero | 1653:6587 | `page-hero` with a three-part lead (23px bold, 18px, 14px note) and a `button-contact` | The longest hero |
| capabilities | 1653:6572 | Intro and five `capability-item`s each with a title and four title-and-text cells | 3,213px tall; grey band on items 2 and 4; numerals 01 to 05 (89.8px, 1653:6511 to 6515) are page-level texts outside the items |
| requirements | 1653:6523 | Two `numbered-item`s, then an intro and seven `check-item`s | 1240 wide |
| banner | 1820:2961 | `banner` with a `button-more` L | Not in `project.json` |

**Interactive** — hover.
**Assets** — the footer art only; no images in this page.
**Risks** — the large numerals 01 to 05 float at page level and have to be placed per item; the h1 reads "AIHTML…" with no space.

## 5. Interactions

| Hook | Where | What the design shows | Needs the designer |
| --- | --- | --- | --- |
| `js-faq-toggle` | `/` faq (3 items), `/faq/` (4 groups, 31 items) | `faq-answer` is the open state (answer and a `text-link` shown), `faq-question` the closed one; the first item of each list is open | Whether opening one closes the others; the icon (a "+" is visible on closed rows) and its open form; the animation. Not described. |
| `js-form` | `/` hero form (資料ダウンロード) | Four fields and one button | Validation, error and thank-you states, destination, what the button downloads. Not described. |
| `js-header-search` | header, all pages | A search icon (a bitmap) at the right end | What it opens. No input, overlay or result is drawn. |
| `js-smooth-scroll` | `/faq/` `search` (four category buttons) | Four buttons "01 ご依頼条件・Figma" … "04 …" | *Inferred* anchors to the four groups; the design shows no target. |
| hover (CSS) | `button-more`, `button-contact`, `footer-button-deadline`, `footer-button-price`, `number-card` (both `navigation-button` and `faq-category-button`) | A `State=hover` variant exists for every one | Nothing; CSS only, no `js-` hook. |
| none | header | No hamburger, no mega menu, no sticky bar drawn | Whether the header is fixed on scroll (not drawn). |

## 6. Design file health

- **No SP frame at all.** `designSP` exists on none of the 56 sections and none of the ten pages, and `project.json` declares `spWidth` 390. Is the small screen still coming or declined? If declined, RSP-04 applies from the first section. Q1.
- **Page frames are not Auto Layout**: every section is an absolutely positioned child of the page frame, so the include order is read off y. Overlap warnings in `docs/figma-sitemap.raw.json` are the page-level `content-bg` rectangle and the `decoration-image` watermarks, which sit behind sections on purpose; they are not sections.
- **Four pages carry a banner section that `project.json` does not list** (flow, aimes, quality, services), see §7.
- **Layer order is reversed against reading order** in four lists (flow before- and after-order steps, aimes service items, feature02 flow steps): the markup must follow the visual order.
- **Header** is a detached frame ×10 (identical, wrapper box differs 1440 against 1415, 3a); **two banner copies are detached** (D-001); two components for what is one (`faq-question` and `faq-answer`); four for what is one (`navigation-button01` to `04`) and four more (`faq-category-button01` to `04`).
- **`button-contact` 1602:5418 is declared in `project.json` but no page places it.** Pages place `btn-contact` 671:46 (and `flow-button` 672:176). D-002 says the header's `btn-contact` is `button-contact`; the header has no `btn-contact` instance (its two buttons are detached white rectangles 153x40 and 95x40). Q2.
- **Raw fills where no variable exists**: #F83030, #6F0103, #E92225 (1d). Accent/Primary and Primary share a hex.
- **Line-heights are not held by the text variables** (1b).
- **Text baked into artwork**: none found as bitmaps. The `/aimes/` diagram is vectors plus live text nodes (Q8); the hero and orderflow illustrations are vector groups with the words "BAD", "GOOD", "HTML" as vector outlines (not text).
- **Placeholders instead of images**: grey rectangles on `/` quality (4) and solution (1, labelled "AIMES運用画面"), `/quality/` approach (2) and the four `quality-detail`s. Q6.
- **Dummy copy**: the three `case-item`s on `/` ("ダミーダミー", "サイト種別が入ります"). Q10.
- **Hidden layers**: `text-link` 1559:5692 (faq more-information), `button-more` 1820:3145 (feature03 banner).
- **Split heading text**: `/` problems ("3" at 1520:9099, 80px Avenir) and `/` quality ("4" at 1517:3727, 86px Avenir) are separate text nodes.
- **Copy slips seen**: "ICONCLUSION" in three banners; a stray "サ" before "AI" in the feature03 banner (1820:3146); a stray "A" in "A必要な検査を終えた状態を完了とする" (feature03 comparison); "STEP｜05" on both step 5 and 6 of `/flow/`; "QualityConsistency" without a space on feature01 but "Quality Consistency" on `/`; "QUALITYSTANDARD" and "ADVANCECONSULTATION" without spaces; "AIHTMLコーディング代行" without a space. Q7.
- **Naming**: `titile` (typo) on six layers, `Frame 215`/`Group 1019`/`Group 743`, `hero-btn` for `btn-contact`, `iconclusion` for the feature03 banner.
- **Breadcrumb** sits at x=100 (not the 180 content column) and overlaps the hero frame; on `/` it is two levels deep ("HOME > AI Hybrid Coding"), elsewhere three. Q5.
- **Avenir and Avenir Next** are used for eyebrows and figures; they are not web-licensed. Q9.

## 7. Recommendations for `docs/project.json`

1. **Record `project.contentWidth: 1080`** (measured, §2).
2. **Add a `banner` section to four pages**, after the last listed section: `/flow/` (1820:2972, after `after-order`), `/aimes/` (1820:3019, after `service`), `/quality/` (1820:2994, after `review`), `/services/` (1820:2961, after `requirements`). The design places it there; `project.json` omits it, so `fa scaffold` would not build it.
3. **Components to add** (all meet AN-05, none is declared): `breadcrumb`, `section-heading`, `page-hero`, `navigation`, `step-item`, `numbered-item`, `check-item`, `text-link`, `icon-card`, `lead-bar`, `conclusion-box`, `faq-group`, `quality-detail`, and the page-local ones: `case-item`, `form-field`, `orderflow-item`, `problem-item`, `quality-item` (`/`); `guideline-detail` (`/figma-guideline/`); `benefit-item` (`/aimes/`); `capability-item` (`/services/`); `explanation-block`, `point-item` (`/feature01/`); `reason-group`, `role-column` (`/feature03/`); `link-card` (`/faq/`).
4. **Merge** `banner` and `banner-aimes` into one `banner` (3b); merge `faq-question` and `faq-answer` into `faq-item`; replace `navigation-button01` to `04` with one `number-card` (and decide whether `faq-category-button` and the solution cards on `/` belong to it).
5. **Revise D-002.** `button-contact`'s node 1602:5418 is not what pages place; the instances are `btn-contact` 671:46 (and `flow-button` 672:176). The header's contact buttons are not `btn-contact` (Q2).
6. **D-003 is answered**: the ten headers are identical in content, text, fills and page-coordinates; only the wrapper frame differs (3a, §2a). One `header` component is correct.
7. **Component `design` ids**: for `header` the id taken (1517:3978) is a frame, not a component; `button-contact` is as in 5; `back-to-home` 1825:5584 and `button-more` 1535:9740 are the right component-set ids.
8. Nothing about the sitemap SEO copy; it stays as the draft.
