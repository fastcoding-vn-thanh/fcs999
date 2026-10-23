# fcs999

A static coding project — the deliverable is **formatted HTML / CSS / JS** that the client
carries into WordPress, Vue or React, so `dist/` must always stay readable as-is.

The workflow, the conventions and the coding rules belong to **Fastagents** and are
imported rather than copied, so this project follows whatever version of them is installed
on the machine. Do not paste them in here; a copy is a copy that goes stale.
Templates are EJS (`src/html/**/*.ejs`), which is kit 2.x, so the installed kit must be a
2.x one — `"fastagents"` in `package.json` says what this was made with, `fa doctor` what is
installed.

@~/.claude/skills/fastagents/CLAUDE.md

## This project

Everything below this line is this project's own, and nothing above it is. Client
decisions, environment notes, links, the things no other project shares — they go here.

- **Client:**
- **Design:** Figma file key `KyNk93Eshiz4NPhNhGKIVa`, page `design-v3` (10 desktop frames, all 1440 wide)
- **Anything unusual about this build:** CSS flavour is `bem` (chosen at `/fa-new`). The design has no mobile artboard, so `spWidth` stays at the starter's 390 and the SP layout is not drawn: RSP-04 applies (sections are derived at both widths in one pass).
- **This project is also the kit's BEM test bed.** The kit is being extended to support BEM SCSS beside Tailwind
  (kit branch `feature/bem-scss`), and this is the project that exercises it. So:
  - **Read every rule in BEM terms.** The kit's core rules (`RSP-`, `LAY-`, `LEN-`) still show Tailwind
    syntax (`md:`, `lg:`, `pc:`, `md:min-w-[…]`), but each ends with a **BEM:** line saying what it means in
    SCSS, and `bem-rules.md` has the translation table: `md:` → `@include mq("md")`, `md:min-w-[144rem]` →
    `min-width: 144rem` under `mq("md")` in the block's partial. A `TW-` rule never applies here. In reports
    and briefs to sub-agents, write the SCSS form, never the utility form. Rules cited in older log entries as
    `TW-nn` were renamed at K-58; the map is in `rule-notes.md#the-flavour-split`.
  - **A place where the kit assumes Tailwind, is vague, or contradicts `bem-rules.md` is a kit gap.** Do not
    work around it silently and do not patch the kit mid-task. Say so to the user as a proposal (what, where,
    suggested change) and add a one-line `kit-gap` note to `docs/project.decisions.jsonl`. The kit is patched
    only by the orchestrator, on a branch, and the user decides whether it ships (see "When the kit itself is
    wrong" in the imported kit instructions).
  - Sub-agent briefs must say `CSS flavour: bem` explicitly.
