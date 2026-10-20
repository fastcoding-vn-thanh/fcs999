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
- **Anything unusual about this build:** CSS flavour is `bem` (chosen at `/fa-new`). The design has no mobile artboard, so `spWidth` stays at the starter's 390 and the SP layout is not drawn: TW-25 applies (sections are derived at both widths in one pass).
