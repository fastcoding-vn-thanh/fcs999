import { series } from 'gulp';
import { create } from 'browser-sync';
import { base as config } from '../config/index.mjs';

const webServer = () => {
  create().init({
    server: {
      baseDir: config.pathDestination,
      logLevel: 'silent',
      notify: false,
      reloadDelay: 1000,
      reloadDebounce: 1000,
    },
    files: config.pathDestination,
    ui: false,
    port: 3000,
    open: 'local',
  });
};

export const bs = series(webServer);

/* Serves dist/ as delivered: no watcher, no reload snippet, nothing opened for you. */
export const previewServer = (done) => {
  create('preview').init(
    {
      server: { baseDir: 'dist' },
      port: 3001,
      listen: 'localhost',
      ui: false,
      open: false,
      notify: false,
      snippet: false,
      ghostMode: false,
      logPrefix: 'preview',
    },
    done
  );
};
