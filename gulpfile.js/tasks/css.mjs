import { src, dest, series } from 'gulp';
import gulpPostcss from 'gulp-postcss';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import plumber from 'gulp-plumber';
import stylelint from 'stylelint';
import prettier from 'prettier';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { base as config } from '../config/index.mjs';

const argv = yargs(hideBin(process.argv)).argv;

const isBem = config.css.flavour === 'bem';

/**
 * How postcss should PARSE the hand-written layer before stylelint reads it.
 *
 * gulp-postcss parses with postcss's CSS parser, which cannot read `@use`, `$maps`,
 * `&__element` or `@mixin` - so on the bem flavour every file would fail to parse and
 * the lint step would report syntax errors for correct SCSS. postcss-scss is the
 * parser AND the stringifier, so lintStylesFix still round-trips the source.
 *
 * `.stylelintrc.json` has the matching `overrides` block for `**\/*.scss`; this is only
 * about getting the file into postcss in the first place.
 */
const lintSyntax = async () => {
  if (!isBem) return {};
  const { default: postcssScss } = await import('postcss-scss');
  return { syntax: postcssScss };
};

/** Prettier settings for the readable stylesheet. */
const prettierCssOptions = {
  parser: 'css',
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  singleQuote: false,
  endOfLine: 'lf',
};

/**
 * Lint only the hand-written CSS layer. The generated output is never linted -
 * Tailwind owns it.
 */
const lintStyles = async () => {
  if (!existsSync(config.css.path.input)) {
    return Promise.resolve();
  }
  let filesToCheck = [config.css.path.inputFiles].concat(config.ignore).concat(config.css.ignore);
  if (argv.file) {
    filesToCheck = argv.file.replace(/"/g, '').replace(/, /g, ',').split(',');
  }
  return src(filesToCheck)
    .pipe(plumber())
    .pipe(
      gulpPostcss(
        [
          stylelint({
            configFile: '.stylelintrc.json',
            formatter: 'string',
            failOnError: false,
            quietDeprecationWarnings: true,
          }),
        ],
        await lintSyntax()
      )
    );
};

const lintStylesFix = async () => {
  if (!existsSync(config.css.path.input)) {
    return Promise.resolve();
  }
  return src([config.css.path.inputFiles].concat(config.ignore).concat(config.css.ignore))
    .pipe(plumber())
    .pipe(
      gulpPostcss(
        [
          stylelint({
            configFile: '.stylelintrc.json',
            formatter: 'string',
            failOnError: false,
            quietDeprecationWarnings: true,
            fix: true,
          }),
        ],
        await lintSyntax()
      )
    )
    .pipe(dest(config.css.path.input));
};

/**
 * Compile the one entry point this flavour has, emitting both deliverables from one
 * pass.
 *
 *   style.min.css  exactly what the compiler produced, untouched
 *   style.css      the same CSS run through Prettier
 *
 * Which compiler is config.css.flavour's business, not this function's - see
 * compileTailwind and compileSass below. The two outputs, their names and their
 * contract are identical either way, which is what keeps everything downstream
 * (audit-classes, the <link> in head.ejs, the client) flavour-blind.
 *
 * `npm run dev` sets NODE_ENV=production too, so it takes this same path and
 * emits the same bytes as `npm run build` - see the note on `develop` in
 * gulpfile.js/index.mjs for why that split was removed.
 *
 * IMPORTANT: this must run AFTER the html task - but not for the reason this
 * comment used to give. It is no longer about scanning the output: that @source
 * glob was measured to contribute nothing and removed. Run on its own, in a
 * process where html has not run, this task emits 1,017 bytes less and drops
 * the `@layer properties` fallback. Cause not established - the suspect and the
 * experiment that would settle it are in the note above `lint` in
 * gulpfile.js/index.mjs; until then the order is what holds it.
 */

/**
 * The Tailwind flavour: one PostCSS pass over src/css/style.css.
 *
 * Tailwind v4 runs Lightning CSS optimisation itself when NODE_ENV=production, so its
 * own output IS the minified build - a second minifier over it gzips ~150 bytes larger.
 */
const compileTailwind = async (inputFile) => {
  const result = await postcss([tailwindcss()]).process(readFileSync(inputFile, 'utf8'), {
    from: inputFile,
  });
  return result.css;
};

/**
 * The bem flavour: Dart Sass over src/scss/style.scss, then autoprefixer (K-56).
 *
 * Both are imported HERE rather than at the top of the file, so a project on the other
 * flavour never loads a compiler it does not use - and a project that has pruned the
 * dependency it does not need still builds.
 *
 * `compressed` makes this output the minified build, the same contract the Tailwind path
 * has: style.min.css is exactly what the compiler produced and style.css is that run
 * through Prettier. Sass does no vendor prefixing of its own, which is the one thing
 * Tailwind's Lightning CSS pass was doing for free, so autoprefixer is not optional here
 * - `browserslist` in package.json is what it reads.
 */
const compileSass = async (inputFile) => {
  const { compileAsync } = await import('sass');
  const { default: autoprefixer } = await import('autoprefixer');

  const compiled = await compileAsync(inputFile, {
    style: 'compressed',
    loadPaths: [config.css.path.input],
    quietDeps: true,
  });
  const prefixed = await postcss([autoprefixer]).process(compiled.css, { from: inputFile });
  return prefixed.css;
};

const buildStyles = async () => {
  const inputFile = config.css.path.inputFile;
  if (!existsSync(inputFile)) {
    return;
  }

  const css = isBem ? await compileSass(inputFile) : await compileTailwind(inputFile);

  const outputDir = config.css.path.output;
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  if (config.css.options.emitMinified) {
    writeFileSync(`${outputDir}/style.min.css`, css);
  }

  const pretty = await prettier.format(css, prettierCssOptions);
  writeFileSync(`${outputDir}/style.css`, pretty);
};

const css = series(lintStyles, buildStyles);

export { lintStyles, lintStylesFix, buildStyles, css };
