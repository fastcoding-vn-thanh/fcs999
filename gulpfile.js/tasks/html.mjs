import gulp from 'gulp';
const { src, dest, series } = gulp;
import { Transform } from 'node:stream';
import ejs from 'ejs';
import posthtml from 'gulp-posthtml';
import htmlnano from 'gulp-htmlnano';
import gulpPrettier from 'gulp-prettier';
import plumber from 'gulp-plumber';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import prettier from 'prettier';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { base as config } from '../config/index.mjs';
import { siteGlobals, loadProject, segmentsOf, isExtensionPage } from '../config/sitemap.mjs';

const argv = yargs(hideBin(process.argv)).argv;

/**
 * A template error has to fail `npm run build`, and has to not kill `npm run dev`.
 *
 * gulp-plumber is here so one broken file cannot tear the stream down mid-
 * rebuild, but its default handler logs and then lets the task end normally -
 * so a template error (an unclosed `<% if { %>`, a literal `%>` inside a
 * comment - TPL-10) left gulp exiting 0 with dist/ still holding the last good
 * render. A
 * production build could report success while shipping a stale page, and nothing
 * downstream would notice: audit-classes and audit-rules both read that stale
 * dist/ and both pass on it.
 *
 * So the errors are collected here and acted on in failOnHtmlErrors, which runs
 * as the step after buildHtml: thrown in a one-shot build, printed and survived
 * under the watcher, where the next save is the fix and stopping the dev server
 * helps nobody.
 */
const isWatchMode = argv._.includes('develop');
const isBem = config.css.flavour === 'bem';

let htmlErrors = [];

const onHtmlError = (error) => {
  htmlErrors.push(error);
  const where = error.fileName || error.file || error.path || '(unknown file)';
  const detail = String(error.message || error)
    .trim()
    .replace(/^/gm, '    ');
  console.error(`\n  html: failed to render ${where}\n${detail}\n`);
};

/**
 * Runs after buildHtml, in the same series, so it sees what that render hit.
 * Under the watcher it only reports - the stream already skipped the broken
 * file, so dist/ is stale for that page and the message says which one.
 */
const failOnHtmlErrors = async () => {
  const count = htmlErrors.length;
  if (count === 0) {
    return;
  }
  const files = htmlErrors.map((error) => error.fileName || error.file || error.path || '(unknown file)');
  htmlErrors = [];

  if (isWatchMode) {
    console.error(`  html: ${count} template error(s) - dist/ is stale for: ${files.join(', ')}\n`);
    return;
  }
  throw new Error(`html: ${count} template error(s), build aborted:\n  ${files.join('\n  ')}`);
};

/**
 * Prettier settings for the delivered HTML.
 *
 * This runs on dist/ - pure HTML at this point, no template syntax left - so
 * the formatter can never mangle an EJS tag. prettier-plugin-tailwindcss
 * normalises utility class order across every page.
 */
const prettierHtmlOptions = {
  parser: 'html',
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  htmlWhitespaceSensitivity: 'css',
  bracketSameLine: false,
  endOfLine: 'lf',
  /* The class sorter is Tailwind's and only Tailwind's. On the bem flavour a class list
     is one or two BEM names whose order carries no meaning, so there is nothing to sort
     and the plugin would be loading Tailwind to read a stylesheet that is not there. */
  ...(isBem ? {} : { plugins: ['prettier-plugin-tailwindcss'], tailwindStylesheet: './src/css/style.css' }),
};

/**
 * A `>` inside Tailwind's bracket syntax is a selector, not leaked markup:
 * `[&>li]:snap-center`, `*:[&>svg]:size-4`. Those segments are dropped from a
 * `class` value before the check, so a stray `<` or `>` anywhere else in the
 * attribute - the broken-template case this exists for - is still reported.
 */
const stripArbitrarySegments = (value) => value.replace(/\[[^\]\s]*\]/g, '');

const customLint = (root) => {
  const walkNode = (node) => {
    if (node.attrs) {
      const nodeOutput =
        `<${node.tag} ` +
        Object.entries(node.attrs)
          .map(([key, val]) => `${key}="${val}"`)
          .join(' ') +
        '>';
      for (const [attr, rawValue] of Object.entries(node.attrs)) {
        const value = attr === 'class' && rawValue ? stripArbitrarySegments(rawValue) : rawValue;
        if (value && (value.includes('<') || value.includes('>'))) {
          console.log(`Attribute "${attr}" contains "<" or ">" in element <${node.tag}>. Found at ${nodeOutput}`);
        }
      }
    }
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach((child) => {
        if (typeof child === 'object') {
          walkNode(child);
        }
      });
    }
  };
  root.walk(walkNode);
};

const lintHtml = () => {
  const stopOnError = argv.stopOnError || false;
  let filesToCheck = [config.html.path.outputFiles];
  if (argv.file) {
    filesToCheck = argv.file.replace(/"/g, '').replace(/, /g, ',').split(',');
  }
  return src(filesToCheck)
    .pipe(plumber())
    .pipe(posthtml([customLint]))
    .on('error', (error) => {
      if (stopOnError) {
        throw error;
      } else {
        console.warn(error.message);
      }
    });
};

/**
 * Take `data-figma-asset` back out on the way to dist.
 *
 * The attribute is the input to `fa assets-pull` - the node ID is the
 * durable handle for re-exporting an image, where the file name is not
 * (IMG-01) - so it has to stay in src/html, and that tool reads and writes
 * only there. It has no job in the delivered markup: the client carries dist
 * into WordPress, where a node ID from a design file nobody on that side can
 * open is noise at best.
 *
 * Runs before the formatter, so the attribute is gone before the line is laid
 * out and nothing is left holding its place. The preceding whitespace goes
 * with it for the same reason.
 */
const STRIP_FIGMA_ASSET = /\s*data-figma-asset="[^"]*"/g;

const stripFigmaAssets = () =>
  new Transform({
    objectMode: true,
    transform(file, _enc, done) {
      if (file.isBuffer()) {
        file.contents = Buffer.from(String(file.contents).replace(STRIP_FIGMA_ASSET, ''));
      }
      done(null, file);
    },
  });

/**
 * Tag each section's root element with `data-fasid="<page>/<section>"`,
 * under `npm run dev` only, so DevTools shows which section file an element
 * came from. The id is the one `fa status` and the decision logs use.
 *
 * Two passes, because a section's first element is not always in its own file
 * - several render through a component in common/. Before EJS, every
 * `<%- include('.../_components/<name>.ejs', page) %>` in a page file gets a
 * marker comment in front of it. After render, each marker is moved onto the first
 * element that follows it, skipping whitespace and landmark comments.
 *
 * Never in `build` or `build:fast`: dist/ is the deliverable, and .tmp/ from
 * build:fast is what the audits and verify-design read.
 */
const SECTION_INCLUDE = /<%-\s*include\(\s*["']((?:([\w\-/]+)\/)?_components\/(?:([\w-]+)\/)?([\w-]+)\.ejs)["'][^%]*%>/g;
const SECTION_MARKER = /<!--fa-section:([^>]*?)-->((?:\s|<!--(?!fa-section:)[\s\S]*?-->)*)<([a-zA-Z][\w-]*)/g;
const SECTION_MARKER_LEFT = /<!--fa-section:[^>]*?-->/g;

const pageIdsByDir = () => {
  const project = loadProject();
  const ids = new Map();
  for (const page of (project && project.sitemap) || []) {
    // An extension page's parts sit one level deeper, under its basename, so it is
    // keyed by folder and basename: "/contact/document.html" -> "contact#document".
    const segments = segmentsOf(page.path);
    const key = isExtensionPage(page.path)
      ? `${segments.slice(0, -1).join('/')}#${segments.at(-1).replace(/\.html?$/i, '')}`
      : segments.join('/');
    ids.set(key, page.id);
  }
  return ids;
};

const markSections = () => {
  const ids = pageIdsByDir();
  return new Transform({
    objectMode: true,
    transform(file, _enc, done) {
      if (file.isBuffer()) {
        file.contents = Buffer.from(
          String(file.contents).replace(SECTION_INCLUDE, (whole, _file, dir = '', sub, name) => {
            const page = (sub ? ids.get(`${dir}#${sub}`) : ids.get(dir)) || dir || 'top';
            return `<!--fa-section:${page}/${name}-->${whole}`;
          })
        );
      }
      done(null, file);
    },
  });
};

const applySectionMarkers = () =>
  new Transform({
    objectMode: true,
    transform(file, _enc, done) {
      if (file.isBuffer()) {
        file.contents = Buffer.from(
          String(file.contents)
            .replace(SECTION_MARKER, (_match, id, gap, tag) => `${gap}<${tag} data-fasid="${id}"`)
            .replace(SECTION_MARKER_LEFT, '')
        );
      }
      done(null, file);
    },
  });

/**
 * Drop the trailing slash from void elements on the way to dist.
 *
 * `<br />` is valid HTML, but the W3C validator flags it: the slash does
 * nothing, and next to an unquoted attribute value it is read as part of that
 * value rather than as the end of the tag. The deliverable is HTML, not XHTML,
 * so `<br>` is the honest form and the one the client's validator is quiet
 * about.
 *
 * It runs AFTER the formatter, which is the whole trick: Prettier normalises
 * void elements to the self-closing form and has no option not to, so anything
 * done before it is simply put back.
 *
 * Only the fourteen HTML void elements are touched, by name. A self-closing
 * tag inside an inline `<svg>` - `<path />`, `<circle />` - is XML, where the
 * slash is required, and none of those names is on this list. Attribute values
 * are skipped whole, so a `>` inside one - a Tailwind variant like the child
 * selector, say - cannot end the tag early.
 */
const VOID_ELEMENTS = 'area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr';

const VOID_TRAILING_SLASH = new RegExp(`<(${VOID_ELEMENTS})\\b((?:"[^"]*"|'[^']*'|[^'">])*)/>`, 'gi');

const dropVoidSlashes = () =>
  new Transform({
    objectMode: true,
    transform(file, _enc, done) {
      if (file.isBuffer()) {
        file.contents = Buffer.from(
          String(file.contents).replace(
            VOID_TRAILING_SLASH,
            (_match, tag, attrs) => `<${tag}${attrs.replace(/\s+$/, '')}>`
          )
        );
      }
      done(null, file);
    },
  });

/**
 * Resolve an include() the way the search paths say, and no other way.
 *
 * EJS's own lookup tries the including file's folder first and falls back to
 * `views` second, so `include('common/module/btn.ejs')` would mean one file from
 * src/html/pages/news/ and could mean another from somewhere with a common/ of
 * its own. This makes every include a search-path lookup - src/html, then
 * src/html/pages - so the string in the markup is the file, wherever it is
 * written. A path found nowhere is an error with the file named, rather than
 * whatever the fallback happened to find.
 */
const searchRoots = config.html.path.searchPaths.map((dir) => resolve(dir));

/**
 * A line holding nothing but a scriptlet or a comment renders as nothing.
 *
 * `<% items.forEach(...) { %>` on a line of its own otherwise leaves its
 * indentation and its newline in the output, once per iteration, and the
 * formatter turns each into a blank line in dist/. Nunjucks had trimBlocks and
 * lstripBlocks for this; EJS has only per-tag `-%>` / `_%>`, which nobody
 * writes consistently.
 *
 * The whitespace is moved INSIDE the tag rather than deleted - after `<%` and
 * before `%>`, where it is JavaScript or comment text - so every line keeps its
 * number and a render error still points at the right line of the source.
 * Each pattern matches exactly one tag - its body can hold no `%>` - so a line
 * that carries markup after the tag is never touched.
 *
 * An include() alone on its line is treated the same way, because the file it
 * pulls in already ends in a newline of its own. Every other output tag
 * (`<%= %>`, `<%- %>`) is content and is left alone.
 */
const TAG_LINE = /^([ \t]*)<%([_#]?)(?![=-])((?:(?!%>)[\s\S])*?)([-_]?)%>[ \t]*\n/gm;
const INCLUDE_LINE = /^([ \t]*)<%-(\s*include\((?:(?!%>)[\s\S])*?\)\s*)%>[ \t]*\n/gm;

const trimTagLines = (source) =>
  source
    .replace(TAG_LINE, (whole, indent, type, body, close) => (close ? whole : `<%${type}${indent}${body}\n%>`))
    .replace(INCLUDE_LINE, (_whole, indent, body) => `<%-${indent}${body}\n%>`);

const includer = (originalPath) => {
  for (const root of searchRoots) {
    const candidate = join(root, originalPath);
    if (existsSync(candidate)) {
      return { filename: candidate, template: trimTagLines(readFileSync(candidate, 'utf8')) };
    }
  }
  throw new Error(`include('${originalPath}') - not found under ${config.html.path.searchPaths.join(' or ')}`);
};

/**
 * Render one page template to HTML, and give it the .html name it is served at.
 *
 * `site` is handed to every page as data, and through it to every include,
 * because an include copies its caller's data before adding its own.
 *
 * A render error is collected, not thrown: the file is dropped from the stream
 * so dist/ holds no half-rendered page, and failOnHtmlErrors decides whether
 * that ends the build.
 */
const renderEjs = () => {
  const data = siteGlobals();
  return new Transform({
    objectMode: true,
    transform(file, _enc, done) {
      if (!file.isBuffer()) {
        done(null, file);
        return;
      }
      try {
        const html = ejs.render(trimTagLines(String(file.contents)), data, {
          filename: file.path,
          includer,
          async: false,
        });
        file.contents = Buffer.from(html);
        file.extname = '.html';
        done(null, file);
      } catch (error) {
        error.fileName = error.fileName || file.path;
        onHtmlError(error);
        done();
      }
    },
  });
};

/**
 * Render src/html/pages/**\/*.ejs through EJS, then prettify.
 *
 * Only src/html/pages is routable. Inside it, folders starting with "_" are
 * partials and are excluded by config.html.ignore. layouts/ and common/ sit
 * outside the glob entirely, so they need no marker.
 */
const buildHtml = () => {
  htmlErrors = [];
  if (!existsSync(config.html.path.input)) {
    return Promise.resolve();
  }
  let stream = src([config.html.path.inputFiles].concat(config.ignore).concat(config.html.ignore)).pipe(
    plumber({ errorHandler: onHtmlError })
  );

  if (isWatchMode) {
    stream = stream.pipe(markSections());
  }

  stream = stream.pipe(renderEjs()).pipe(stripFigmaAssets());

  if (isWatchMode) {
    stream = stream.pipe(applySectionMarkers());
  }

  if (config.html.options.minify) {
    stream = stream.pipe(htmlnano({ removeComments: false }));
  } else {
    stream = stream.pipe(gulpPrettier(prettierHtmlOptions));
  }

  return stream.pipe(dropVoidSlashes()).pipe(dest(config.html.path.output));
};

/**
 * Sort the Tailwind utilities inside src/html, and touch nothing else.
 *
 * buildHtml already runs prettier-plugin-tailwindcss, but only over dist/ -
 * pure HTML by then - and that is the only safe place for the formatter as a
 * whole. Point Prettier's html parser at a template source file and it eats
 * markup silently: a measured run over a Nunjucks src/html turned a
 * conditional <span> into `<span >` - every attribute gone, exit code 0
 * - and it has no more idea what `<% %>` is than it had of `{% %}`.
 * So this task never formats a source file.
 *
 * Instead it lifts every class value out, sorts the whole set in one batch by
 * round-tripping it through a throwaway document, and writes each sorted
 * string back into the byte range it came from. Document structure and
 * whitespace are untouched by construction - the only bytes that can change
 * are the ones between a pair of quotes that held utilities.
 *
 * Two shapes are supported, and nothing else is:
 *   class="a b <%= look %>"          a class list; output tags are fine
 *   const primaryClass = 'a b c';    a variant in a component's scriptlet -
 *   primaryClass: 'a b c',           any name ending in Class, one line
 *
 * An OUTPUT tag in a class attribute is carried through the sort as one
 * opaque token and put back, so `<%= look %>` cannot be split into three and
 * scattered. A CONTROL tag - `<% if (full) { %>w-full<% } %>` - is NOT
 * supported, and lintHtmlFix skips it with a warning rather than sorting it.
 * The sorter would reorder across the tag: utilities hoisted out of the
 * conditional, the default branch losing them and the other gaining
 * duplicates. sameTokens cannot catch that - it compares the token multiset,
 * which a reorder preserves exactly - and the rewrite often still renders, so
 * the build, audit-classes, audit-rules and verify-design all stay green over
 * a corrupted source, the same silent failure as the formatter above. Compute the
 * condition into a `const ...Class` above the element instead, which is the
 * second shape above.
 *
 * A value spanning two lines is not matched and there are none; a value
 * carrying a `"` cannot be embedded and is skipped.
 */
const CLASS_ATTR = /class="([^"\n]*)"/g;
const CLASS_SET = /(\b[A-Za-z_$][\w$]*[Cc]lass\s*[=:]\s*')([^'\n]*)(')/g;
const OUTPUT_TAG = /<%[=-][\s\S]*?%>/g;
const TAG_TOKEN = /fa-ejs-tag-(\d+)/g;

/** Swap each output tag for a token the sorter treats as one unknown class. */
const protectTags = (value) => {
  const tags = [];
  const text = value.replace(OUTPUT_TAG, (tag) => `fa-ejs-tag-${tags.push(tag) - 1}`);
  return { text, restore: (sorted) => sorted.replace(TAG_TOKEN, (_m, i) => tags[Number(i)]) };
};

const prettierSortOptions = {
  parser: 'html',
  // One <div> per line whatever the class list is - the sorted value has to
  // come back out of a single attribute, not wrapped across several lines.
  printWidth: 100000,
  htmlWhitespaceSensitivity: 'css',
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: prettierHtmlOptions.tailwindStylesheet,
};

/** The same multiset of tokens, in any order. */
const sameTokens = (a, b) => {
  const split = (v) => v.split(/\s+/).filter(Boolean).sort();
  const [x, y] = [split(a), split(b)];
  return x.length === y.length && x.every((token, i) => token === y[i]);
};

/**
 * Sort many class strings in one Prettier call. Returns a Map of original ->
 * sorted, and drops any value Prettier did not hand back token-for-token.
 */
const sortClassValues = async (values) => {
  const sorted = new Map();
  const chunkSize = 400;

  for (let i = 0; i < values.length; i += chunkSize) {
    const chunk = values.slice(i, i + chunkSize);
    const doc = chunk.map((value) => `<div class="${value}"></div>`).join('\n');
    const out = await prettier.format(doc, prettierSortOptions);
    const back = [...out.matchAll(CLASS_ATTR)].map((match) => match[1]);

    // A count mismatch means Prettier restructured the throwaway document and
    // the values no longer line up with their sources. Skip the chunk rather
    // than write a class list onto the wrong element.
    if (back.length !== chunk.length) {
      console.warn(`sortClasses: skipped ${chunk.length} value(s) - Prettier returned ${back.length}`);
      continue;
    }

    chunk.forEach((value, index) => {
      if (sameTokens(value, back[index])) {
        sorted.set(value, back[index]);
      }
    });
  }

  return sorted;
};

const lintHtmlFix = async () => {
  /* NOTHING TO SORT ON THE BEM FLAVOUR, and it says so rather than reporting
     "sorted 0 class list(s)" - which reads as a sorter that ran and found the file
     already in order. TW-09 is a Tailwind rule; a BEM class list is one or two names
     whose order carries no meaning. */
  if (isBem) {
    console.log('sortClasses: skipped - this project is bem, where class order carries no meaning (TW-09)');
    return;
  }

  const root = config.html.path.input.replace(/\/pages$/, '');
  if (!existsSync(root)) {
    return;
  }

  const files = [];
  for await (const file of glob(`${root}/**/*.ejs`)) {
    files.push(file);
  }
  files.sort();

  const sources = new Map();
  const values = new Set();
  const skipped = new Set();

  // A class value holding a control tag is markup, not a class list, and the
  // sorter would move utilities across the tag. Leave it unsorted -
  // and say so, because an unsorted value looks exactly like a sorted one to
  // whoever wrote it. This is the only place the file name is still known.
  const collect = (file, value) => {
    if (!protectTags(value).text.includes('<%')) {
      values.add(value);
      return;
    }
    const key = `${file}\n${value}`;
    if (!skipped.has(key)) {
      skipped.add(key);
      console.warn(`sortClasses: not sorted - ${file} holds an EJS control tag in a class value: ${value}`);
    }
  };

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    sources.set(file, source);
    for (const [, value] of source.matchAll(CLASS_ATTR)) {
      collect(file, value);
    }
    for (const [, , value] of source.matchAll(CLASS_SET)) {
      collect(file, value);
    }
  }

  const protectedValues = [...values].map((value) => ({ value, ...protectTags(value) }));
  const sortedText = await sortClassValues(protectedValues.map((entry) => entry.text));
  const sorted = new Map();
  for (const { value, text, restore } of protectedValues) {
    if (sortedText.has(text)) {
      sorted.set(value, restore(sortedText.get(text)));
    }
  }
  let changedFiles = 0;
  let changedValues = 0;

  for (const [file, source] of sources) {
    const next = source
      .replace(CLASS_ATTR, (whole, value) => {
        const fixed = sorted.get(value);
        if (!fixed || fixed === value) {
          return whole;
        }
        changedValues += 1;
        return `class="${fixed}"`;
      })
      .replace(CLASS_SET, (whole, open, value, close) => {
        const fixed = sorted.get(value);
        if (!fixed || fixed === value) {
          return whole;
        }
        changedValues += 1;
        return `${open}${fixed}${close}`;
      });

    if (next !== source) {
      await writeFile(file, next);
      changedFiles += 1;
      console.log(`sortClasses: ${file}`);
    }
  }

  console.log(`sortClasses: sorted ${changedValues} class list(s) across ${changedFiles} file(s)`);
};

const html = series(buildHtml, failOnHtmlErrors);

export { buildHtml, failOnHtmlErrors, lintHtml, lintHtmlFix, html, prettierHtmlOptions };
