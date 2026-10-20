import { loadProject } from './sitemap.mjs';

const pathSource = './src';

/**
 * Where this build writes. `dist` unless BUILD_OUT says otherwise, and the npm
 * scripts set BUILD_OUT=./.tmp for `dev` and `build:fast`.
 *
 * WHY THE SPLIT: dist/ is tracked in git and is what the client receives, so it
 * should change when somebody produces a deliverable and at no other time. It was
 * changing on every build of the code-and-review loop, and once build:fast
 * existed it could also hold source-sized images that `build` then had to wipe to protect itself.
 * With the loop writing .tmp/ instead, dist/ has exactly one writer, `git status`
 * means "the deliverable moved", and nothing has to clean around anything.
 *
 * Everything below derives from it, so nothing else in the config knows the name.
 */
const pathDestination = process.env.BUILD_OUT ?? './dist';
/**
 * Which CSS flavour this project is written in (K-50): "tailwind" or "bem".
 *
 * It decides the entry point, the compiler, and whether a template save has to rebuild
 * the stylesheet - Tailwind scans src/html, Sass does not. Nothing else in the build
 * knows the difference, and `dist/css/style.css` is the same deliverable either way.
 *
 * FIXED AT SCAFFOLD TIME. Changing it on a project that already has sections means
 * rewriting every class in src/html, which is not a migration this kit offers;
 * `fa doctor` reports which flavour a project is in.
 *
 * An unrecognised value falls back to tailwind AND SAYS SO. Silence there would mean a
 * typo ("scss", "bem-scss") quietly building the other flavour, which looks like the
 * stylesheet simply not working.
 */
const FLAVOURS = ['tailwind', 'bem'];
const declaredFlavour = loadProject()?.project?.css;
if (declaredFlavour && !FLAVOURS.includes(declaredFlavour)) {
  console.warn(
    `  css: docs/project.json has "css": "${declaredFlavour}", which is not ${FLAVOURS.join(' or ')} - building as tailwind.`
  );
}
const cssFlavour = FLAVOURS.includes(declaredFlavour) ? declaredFlavour : 'tailwind';

/* One entry point either way. The output path is deliberately the same for both: the
   client receives dist/css/style.css and has no reason to know which compiler wrote it. */
const cssSource =
  cssFlavour === 'bem'
    ? { dir: pathSource + '/scss', entry: pathSource + '/scss/style.scss', all: pathSource + '/scss/**/*.scss' }
    : { dir: pathSource + '/css', entry: pathSource + '/css/style.css', all: pathSource + '/css/**/*.css' };

const ignoreGlobal = ['!**/.DS_Store', '!**/* copy.*', '!./wp/**/*', '!./dist/wp/**/*'];
const cleanDirectory = [pathDestination + '/css', pathDestination + '/js', pathDestination + '/img'];
const cleanDirectoryWithoutImage = [pathDestination + '/css', pathDestination + '/js'];

const baseConfig = {
  pathSource: pathSource,
  pathDestination: pathDestination,
  cleanDirectory: cleanDirectory,
  cleanDirectoryWithoutImage: cleanDirectoryWithoutImage,
  ignore: ignoreGlobal,
  html: {
    path: {
      // Only src/html/pages is routable. Gulp infers the base from this glob, so
      // the "pages" segment is stripped on output and the extension becomes
      // .html: pages/news/index.ejs -> dist/news/index.html. Everything outside
      // pages/ can never reach dist.
      input: pathSource + '/html/pages',
      inputFiles: pathSource + '/html/pages/**/*.ejs',
      // Where an EJS include() is looked up, in this order and nowhere else.
      // src/html resolves layouts/ and the global common/; src/html/pages
      // resolves each page's own _components/. A path is never resolved relative
      // to the file that includes it, so the same include() names the same file
      // wherever it is written (tasks/html.mjs, `includer`).
      // common/ and _components/ are named differently on purpose: if both were
      // _components/, a root-page file would be silently shadowed by the global one.
      searchPaths: [pathSource + '/html', pathSource + '/html/pages'],
      // Watch everything, build only pages/ - otherwise editing a global
      // component would not rebuild the pages that include it.
      watchFiles: pathSource + '/html/**/*.ejs',
      output: pathDestination + '',
      outputFiles: pathDestination + '/**/*.html',
    },
    // An underscore means "inside the page tree but not a route". layouts/ and
    // common/ need no marker - they sit outside this glob entirely.
    ignore: ['!' + pathSource + '/html/pages/**/_*/**'],
    options: {
      minify: false, // To Minify HTML files
    },
  },
  css: {
    // Which compiler reads the entry point. tasks/css.mjs is the only reader.
    flavour: cssFlavour,
    path: {
      // Single entry point, per flavour. Every page shares one stylesheet.
      input: cssSource.dir,
      inputFile: cssSource.entry,
      inputFiles: cssSource.all,
      output: pathDestination + '/css',
      outputFiles: pathDestination + '/css/**/*.css',
    },
    ignore: [],
    options: {
      // Emit dist/css/style.min.css (Tailwind's own output) alongside the
      // readable dist/css/style.css.
      emitMinified: true,
      // Point <link> at the minified file instead of the readable one.
      linkMinified: false,
    },
  },
  // Source is TypeScript, output is JavaScript. This template is TypeScript-only.
  js: {
    path: {
      input: pathSource + '/ts',
      inputFiles: pathSource + '/ts/**/*.ts',
      entry: pathSource + '/ts/scripts.ts',
      output: pathDestination + '/js',
      outputFiles: pathDestination + '/js/**/*.js',
    },
    ignore: [],
    options: {
      minify: false, // To Minify JS files
    },
  },
  image: {
    path: {
      input: pathSource + '/img',
      inputFiles: pathSource + '/img/**/*',
      output: pathDestination + '/img',
      outputFiles: pathDestination + '/img/**/*',
    },
    ignore: [],
  },
  font: {
    path: {
      input: pathSource + '/font',
      inputFiles: pathSource + '/font/**/*',
      output: pathDestination + '/font',
      outputFiles: pathDestination + '/font/**/*',
    },
    ignore: [],
  },
  doc: {
    path: {
      input: pathSource + '/doc',
      inputFiles: pathSource + '/doc/**/*',
      output: pathDestination + '/doc',
      outputFiles: pathDestination + '/doc/**/*',
    },
    ignore: [],
  },
  pdf: {
    path: {
      input: pathSource + '/pdf',
      inputFiles: pathSource + '/pdf/**/*',
      output: pathDestination + '/pdf',
      outputFiles: pathDestination + '/pdf/**/*',
    },
    ignore: [],
  },
  video: {
    path: {
      input: pathSource + '/video',
      inputFiles: pathSource + '/video/**/*',
      output: pathDestination + '/video',
      outputFiles: pathDestination + '/video/**/*',
    },
    ignore: [],
  },
};

export const base = baseConfig;
export { cssFlavour };
