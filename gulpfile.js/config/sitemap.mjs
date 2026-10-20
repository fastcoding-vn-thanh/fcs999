import { readFileSync, existsSync } from 'fs';

/**
 * The sitemap, as the build reads it: the project settings every page sees, and whether
 * a page is an extension URL (which decides the file it is written to).
 *
 * Which source file a page or section lives in is the kit's - tools/lib/pages.mjs, used
 * by `fa scaffold` and every tool (K-35). It was repeated here for the scaffold gulp task,
 * which has moved into the kit, so the build no longer carries a second copy.
 */

const PROJECT_FILE = './docs/project.json';
const STATE_FILE = './docs/project.state.json';

export const loadProject = () => {
  if (!existsSync(PROJECT_FILE)) {
    return null;
  }
  return JSON.parse(readFileSync(PROJECT_FILE, 'utf8'));
};

/** Agent-written progress and findings. Separate file so it never mixes with config. */
export const loadState = () => {
  if (!existsSync(STATE_FILE)) {
    return null;
  }
  return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
};

/**
 * Site-wide values exposed to every template as `site`, so a page does not have to
 * repeat what the project already declares.
 */
export const siteGlobals = () => {
  const project = loadProject();
  const p = (project && project.project) || {};
  return {
    site: {
      name: p.name || '',
      lang: p.lang || 'ja',
      contentWidth: p.contentWidth || null,
      designWidth: p.designWidth || null,
    },
  };
};

/** "/news/detail/" -> ["news", "detail"];  "/" -> [] */
export const segmentsOf = (urlPath) => String(urlPath || '/').split('/').filter(Boolean);

/**
 * Folder-per-page is the default: "/news/" is the folder news/ holding index.html.
 * A path whose last segment carries an .html extension is the documented
 * alternative - an extension URL - and becomes a FILE beside its siblings:
 * "/contact/document.html" -> dist/contact/document.html, never
 * dist/contact/document.html/index.html.
 */
const EXTENSION = /\.html?$/i;

export const isExtensionPage = (urlPath) => {
  const segments = segmentsOf(urlPath);
  return segments.length > 0 && EXTENSION.test(segments[segments.length - 1]);
};
