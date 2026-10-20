import { src, dest } from 'gulp';
import { finished } from 'node:stream/promises';
import changed from 'gulp-changed';
// IMPORTANT: Avoid importing gulp-imagemin at module load to prevent ESM TLA issues during non-image tasks
// We'll dynamically import it inside task functions instead.
import mozjpeg from 'imagemin-mozjpeg';
import pngquant from 'imagemin-pngquant';
import webp from 'gulp-webp';
import rename from 'gulp-rename';
import { base as config } from '../config/index.mjs';

// Dynamically load gulp-imagemin and its named exports
const getImagemin = async () => {
  const mod = await import('gulp-imagemin');
  const imageMinify = mod.default ?? mod; // compatibility for different module shapes
  const { svgo, optipng, gifsicle } = mod;
  return { imageMinify, svgo, optipng, gifsicle };
};

// Build the shared imagemin plugins lazily
const getCommonImagePlugins = async () => {
  const { svgo, gifsicle } = await getImagemin();
  return [
    // speed is pngquant's 1-11 quality/time dial, 1 being the slowest and best.
    // Kept at 1 because it is nearly free once optipng is gone: measured over these
    // 156 images, speed 3 saved 0.25s of a 5.2s pass and cost 12 KB.
    pngquant({
      quality: [0.7, 0.8],
      speed: 1,
    }),
    mozjpeg({ progressive: true, quality: 70 }),
    // imagemin-svgo hands these straight to svgo's optimize() as its CONFIG, so a
    // plugin descriptor has to sit inside `plugins`. Passed at the top level,
    // { name, params } are two keys svgo does not know, it finds no `plugins`, and
    // it silently runs the default preset - measured identical to passing no options
    // at all. removeViewBox is in that preset, which is how 29 of 31 SVGs in dist/
    // lost their viewBox while this block said they should keep it.
    svgo({
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false,
            },
          },
        },
      ],
    }),
    // NO optipng HERE, DELIBERATELY. It used to run after pngquant, losslessly
    // re-compressing an image pngquant had already quantised to an 8-bit palette, so
    // there was very little left for it to find. Measured over these 156 images: it
    // was 30 of the pass's 35 seconds and saved 20 KB in total - 0.4% of dist/img,
    // or about six seconds of build time per kilobyte. Without it minifyImage is
    // 5.2s. Re-adding it wants a measurement, not an instinct.
    gifsicle({ optimizationLevel: 3 }),
  ];
};

/**
 * Copy src/img to dist/img without minifying any of it.
 *
 * WHAT IT IS FOR: the code-and-review loop needs images to EXIST in dist/, not to
 * be small. audit-classes.py, audit-rules.py and verify-design read markup and
 * geometry, and none of them can tell a quantised PNG from its source - so the
 * minute-scale imagemin pass in that loop buys nothing that is ever looked at.
 * `buildFast` uses this; `build` does not, and still minifies.
 *
 * WHY `build` STILL DELETES ITS OWN img DIRECTORY (config.cleanDirectory) while
 * buildFast deletes only css and js. The original reason was self-protection: the
 * two wrote the same dist/img, one raw and one minified, and since gulp-changed
 * compares modification times a raw copy is NEWER than its source, so a later
 * minifyImage would skip it and ship unminified images silently.
 * That reason is gone - they write different directories now, dist/ and .tmp/.
 * The wipe stays for the reason that was always also true and is the
 * better one: it is the only thing that removes an image deleted from src/img,
 * and dist/ is the deliverable, where an orphan is worse than five seconds.
 */
const copyImage = () => {
  return src([config.image.path.inputFiles].concat(config.ignore).concat(config.image.ignore), { encoding: false })
    .pipe(changed(config.image.path.output))
    .pipe(dest(config.image.path.output));
};

// An async task that RETURNS a stream is not awaited: gulp sees a promise,
// resolves it the moment the stream object is handed back, and calls the task
// done while the files are still being written. Small images finish inside the
// rest of the build and hide it; the six largest PNGs on this project did not,
// and a build over an empty dist/ shipped six broken <img> tags with no error
// anywhere. `finished` waits for the writes, which is what the return value was
// meant to do.
const minifyImage = async () => {
  const { imageMinify } = await getImagemin();
  const commonImagePlugins = await getCommonImagePlugins();
  await finished(
    src([config.image.path.inputFiles].concat(config.ignore).concat(config.image.ignore), { encoding: false })
      .pipe(changed(config.image.path.output))
      .pipe(imageMinify(commonImagePlugins))
      .pipe(dest(config.image.path.output))
  );
};

// Same as above - this one converts every image, so it is the slower of the two.
const convertToWebp = async () => {
  const { imageMinify } = await getImagemin();
  const commonImagePlugins = await getCommonImagePlugins();
  await finished(
    src([config.image.path.inputFiles].concat(config.ignore).concat(config.image.ignore), { encoding: false })
      .pipe(imageMinify(commonImagePlugins))
      .pipe(rename((path) => {
        path.basename += '.' + path.extname.replace(/^\./, '');
      }))
      .pipe(webp({
        quality: 80,
        method: 6
      }))
      .pipe(dest(config.image.path.output))
  );
};

export {
  copyImage,
  minifyImage,
  convertToWebp
};
