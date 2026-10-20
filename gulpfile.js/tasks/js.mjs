import { src, dest, series } from 'gulp';
import eslint, { format, failAfterError } from 'gulp-eslint-new';
import gulpPrettier from 'gulp-prettier';
import uglify from 'gulp-uglify';
import plumber from 'gulp-plumber';
import rename from 'gulp-rename';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { rollup } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { base as config } from '../config/index.mjs';

const argv = yargs(hideBin(process.argv)).argv;

/** Prettier settings for the delivered JavaScript. */
const prettierJsOptions = {
  parser: 'babel',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  singleQuote: true,
  semi: true,
  trailingComma: 'none',
  endOfLine: 'lf'
};

/** Resolve which files to lint, honouring `--file a.ts,b.ts`. */
const targetFiles = () => {
  if (argv.file) {
    return argv.file.replace(/"/g, '').replace(/, /g, ',').split(',');
  }
  return [config.js.path.inputFiles];
};

const lintJs = () => {
  const stopOnError = argv.stopOnError || false;
  const stream = src(targetFiles())
    .pipe(plumber())
    .pipe(eslint({ fix: false, overrideConfigFile: '.eslintrc-ts.js' }));

  if (stopOnError) {
    stream.pipe(failAfterError());
  }
  stream.pipe(format());
  return stream;
};

const lintJsFix = () => {
  const stopOnError = argv.stopOnError || false;
  const stream = src(targetFiles())
    .pipe(plumber())
    .pipe(gulpPrettier({ ...prettierJsOptions, parser: 'typescript' }))
    .pipe(eslint({ fix: true, overrideConfigFile: '.eslintrc-ts.js' }))
    .pipe(eslint.fix())
    .pipe(format());

  if (stopOnError) {
    stream.pipe(failAfterError());
  }
  return stream.pipe(dest(config.js.path.input));
};

/**
 * Bundle src/ts/scripts.ts with Rollup, then run the bundle through Prettier so
 * the delivered JS is readable. No jQuery - the output is dependency-free
 * vanilla JS that ports cleanly into WordPress, Vue or React.
 */
const buildJs = async () => {
  if (!existsSync(config.js.path.entry)) {
    return;
  }

  const bundle = await rollup({
    input: config.js.path.entry,
    plugins: [
      typescript({ tsconfig: 'tsconfig.json', declaration: false, sourceMap: false }),
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs()
    ]
  });

  const { output } = await bundle.generate({ format: 'iife', name: 'App' });
  await bundle.close();

  if (!existsSync(config.js.path.output)) {
    mkdirSync(config.js.path.output, { recursive: true });
  }
  for (const chunk of output) {
    if (chunk.type === 'chunk') {
      writeFileSync(`${config.js.path.output}/scripts.js`, chunk.code);
    }
  }

  return formatJsOutput();
};

/** Prettify - or minify - whatever landed in dist/js. */
const formatJsOutput = () => {
  const outputFile = `${config.js.path.output}/scripts.js`;
  if (!existsSync(outputFile)) {
    return Promise.resolve();
  }
  if (config.js.options.minify) {
    return src(outputFile)
      .pipe(plumber())
      .pipe(uglify())
      .pipe(rename({ suffix: '.min' }))
      .pipe(dest(config.js.path.output));
  }
  return src(outputFile).pipe(plumber()).pipe(gulpPrettier(prettierJsOptions)).pipe(dest(config.js.path.output));
};

const js = series(lintJs, buildJs);

export { buildJs, lintJs, lintJsFix, js, prettierJsOptions };
