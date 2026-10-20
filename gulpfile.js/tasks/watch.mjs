import { src, dest, watch, series } from 'gulp';
import * as del from 'del';
import { relative, resolve, sep } from 'path';
import { base as config } from '../config/index.mjs';

const isBem = config.css.flavour === 'bem';

const monitoring = () => {
  /**
   * Under Tailwind, template changes rebuild the pages AND the stylesheet: it scans
   * src/html/**\/*.ejs, so a new utility class in the markup has to re-run the
   * CSS build to exist. Under bem they rebuild the pages only (K-50).
   *
   * `buildStyles`, not `css`: the latter is series(lintStyles, buildStyles), and
   * saving a template changes no CSS source, so linting src/css again on every
   * markup save is work with nothing to find. The cssWatcher below still runs the
   * full `css` task, because there a CSS file genuinely did change.
   */
  const htmlWatcher = watch(
    [config.html.path.watchFiles].concat(config.ignore),
    /* ON THE BEM FLAVOUR A TEMPLATE SAVE REBUILDS THE PAGES ONLY. Sass does not read
       src/html at all - every rule exists whether a class uses it or not - so re-running
       the stylesheet on a markup save would be work with nothing to find. Under Tailwind
       it is the opposite and the rebuild is required, for the reason above. */
    isBem ? series('html') : series('html', 'buildStyles')
  );
  htmlWatcher.on('all', function (event, filepath) {
    console.log(`File ${filepath} was changed`);
    if (event === 'unlink') {
      // Only page files have a dist counterpart. A deleted partial maps outside
      // dist/, so skip it - the rebuild already dropped it from the output.
      const filePathFromSrc = relative(resolve(config.html.path.input), filepath);
      if (filePathFromSrc.startsWith('..')) {
        return;
      }
      const distFilePath = resolve(config.pathDestination, filePathFromSrc.replace(/\.ejs$/, '.html'));
      del.deleteAsync([distFilePath]);
    }
  });

  const cssWatcher = watch(
    [config.css.path.inputFiles].concat(config.ignore).concat(config.css.ignore),
    series('css')
  );
  cssWatcher.on('all', function (event, filepath) {
    console.log(`File ${filepath} was changed`);
  });

  const jsWatcher = watch([config.js.path.inputFiles].concat(config.js.ignore), series('js'));
  jsWatcher.on('all', function (event, filepath) {
    console.log(`File ${filepath} was changed`);
  });

  const images = watch([config.image.path.inputFiles].concat(config.ignore).concat(config.image.ignore));
  images.on('all', (event, filepath) => {
    if (event === 'add' || event === 'change') {
      src(filepath, { base: config.image.path.input, encoding: false }).pipe(dest(config.image.path.output));
    } else if (event === 'unlink') {
      const filePathFromSrc = relative(resolve(config.pathSource), filepath);
      const distFilePath = resolve(config.pathDestination, filePathFromSrc);
      del.deleteAsync([distFilePath]);
    }
    console.log(`File ${filepath} was changed`);
  });
};

export const myWatch = monitoring;
