import { series, parallel } from 'gulp';
import { cleanResources, cleanResourcesWithoutImage } from './tasks/clean.mjs';
import { html, lintHtml, lintHtmlFix } from './tasks/html.mjs';
import { css, buildStyles, lintStyles, lintStylesFix } from './tasks/css.mjs';
import { js, lintJs, lintJsFix } from './tasks/js.mjs';
import { copyImage, minifyImage, convertToWebp } from './tasks/image.mjs';
import { copy } from './tasks/copy.mjs';
import { bs as browser, previewServer } from './tasks/browser-sync.mjs';
import { myWatch } from './tasks/watch.mjs';

/**
 * Task order matters: html MUST run before css. Do not reorder this.
 *
 * THE REASON EVERYTHING USED TO GIVE WAS WRONG. It said src/css/style.css scans
 * dist/**\/*.html, so the pages had to exist before Tailwind could see the
 * utilities. That glob has been measured to contribute nothing and is gone -
 * every utility is already a literal string in src/html, which is scanned
 * directly.
 *
 * THE REASON THAT SURVIVED MEASUREMENT, cause not established: running
 * the css task in a process where html has NOT run emits a stylesheet 1,017
 * bytes smaller, missing the `@layer properties` / `@supports` block that
 * declares the --tw-* custom properties for browsers without `@property`. Every
 * path that produces output runs html first in the same process - build,
 * buildFast, develop, and both watchers, since html runs at dev startup - so
 * nothing shipped has ever been missing it. `npx gulp css` on its own is.
 *
 * Suspected, not shown: the html task loads prettier-plugin-tailwindcss with
 * tailwindStylesheet pointed at src/css/style.css, which initialises Tailwind in
 * this process before @tailwindcss/postcss runs. To settle it, run the css task
 * in a process that has loaded that plugin and in one that has not, everything
 * else equal, and diff the output. If that is the cause, the fix is for
 * buildStyles not to depend on another task having warmed the process.
 */
const lint = series(lintStyles, lintHtml, lintJs);
const lintFix = series(lintHtmlFix, lintStylesFix, lintJsFix);
/**
 * `js` and `minifyImage` are the only two steps here that depend on nothing and
 * write disjoint directories - dist/js and dist/img - so they run together. The
 * order that does matter is html before css, for the reason in the note above
 * `lint`: not scanning (style.css reads src/html directly) but the 1,017 bytes
 * the css task drops in a process where html has not run.
 */
const build = series(cleanResources, copy, html, css, parallel(js, minifyImage));
/**
 * `build` without the minifier - for the code-and-review loop, not for the deliverable.
 *
 * WHY IT EXISTS: `build` runs minifyImage over every file in src/img on every
 * run, because cleanResources deletes dist/img first and the `changed` filter in
 * minifyImage then has nothing to compare against. That is the right thing for a
 * build that is delivered and the wrong thing for the twenty builds a section
 * costs, where nothing downstream reads a minified image: audit-classes,
 * audit-rules and verify-design read markup and geometry. So this one copies
 * src/img across untouched and deletes only dist/css and dist/js, which lets
 * copyImage's own `changed` skip a directory that has not moved.
 *
 * WHAT IT IS NOT: a deliverable. Its img directory holds source-sized images.
 * It cannot damage one either, because it writes .tmp/ and never dist/ - the npm
 * script sets BUILD_OUT, and dist/ has exactly one writer, `npm run build`.
 * That is structural rather than documented, which is the point.
 */
const buildFast = series(cleanResourcesWithoutImage, copy, copyImage, html, css, js);
const buildJsOnly = series(js);
/**
 * `develop` IS `buildFast`, then lint, then watch. It reuses a build task rather
 * than restating its steps, so it cannot drift from one.
 *
 * IT USED TO REUSE `build`, THE MINIFYING ONE, AND THE REASON IS GONE.
 * The reason was that dev and build wrote the SAME dist/, so they had to emit
 * identical bytes or whichever ran last won silently - a watcher left running in
 * another terminal would quietly replace a production build. Now they write
 * different directories, .tmp/ and dist/, and dist/ has one writer. There is
 * nothing left to keep identical. Startup 8s -> 3s.
 * It was also already inconsistent with itself: the image watcher below copies a
 * changed image across raw, with no minifier, so one edit put a source-sized file
 * next to the minified ones. Now every image in .tmp/ is the source, always.
 * What you give up is seeing the LOSSY result - pngquant runs at quality
 * [0.7, 0.8] - so "does this photograph survive compression" is a question for
 * `npm run preview`, which builds dist/ and serves it on :3001.
 *
 * `npm run dev` still sets NODE_ENV=production, and that half of the old reason
 * stands:
 * dev left it unset once, so Tailwind skipped its own Lightning CSS pass and the
 * stylesheet was 90.6 KB instead of 66.5 KB. Optimising costs nothing measurable
 * (4 ms against 5-8 ms warm), so there was never anything to buy with that split.
 * lint is read-only - the writing variants are lintFix - so it cannot change what
 * the build produced.
 *
 * It runs lintHtml rather than the whole `lint`, and that is not a reduction in
 * what gets checked: `css` is series(lintStyles, buildStyles) and `js` is
 * series(lintJs, buildJs), so `build` has already run both of those linters by the
 * time it returns. `lint` would run them a second time over files nothing has
 * touched since. lintHtml is the only one a build does not reach, because it reads
 * the rendered pages and so cannot run until they exist. `npm run lint` is
 * unchanged and still runs all three.
 */
const develop = series(buildFast, lintHtml, parallel(browser, myWatch));

/**
 * `npm run preview`: the deliverable, built and served on :3001.
 *
 * It used to be `npm run build && fa serve dist 3001`, which needs the kit - and this
 * package.json goes to the client with dist/, who has no kit (K-35). browser-sync is
 * already a dependency, and its static server redirects `/service/web` to
 * `/service/web/` the way a real host does, which is the one thing `fa serve` was
 * chosen for. No file watching and no injected script: this is a look at a finished
 * build, not a dev server.
 */
const preview = series(build, previewServer);

const lintStylesOnly = series(lintStyles);
const lintHtmlOnly = series(lintHtml);
const lintJsOnly = series(lintJs);
const lintJsFixOnly = series(lintJsFix);
const lintHtmlFixOnly = series(lintHtmlFix);

export {
  preview,
  build,
  buildFast,
  develop,
  html,
  css,
  buildStyles,
  js,
  lint,
  lintFix,
  copyImage,
  minifyImage,
  convertToWebp,
  cleanResources,
  cleanResourcesWithoutImage,
  lintStylesOnly,
  lintHtmlOnly,
  lintJsOnly,
  lintJsFixOnly,
  lintHtmlFixOnly,
  buildJsOnly,
};
