import tomshardware from './tomshardware.js';

export { default as removeAdContainer } from './removeAdContainer.js';

/** @typedef {(document: Document, ignore: (elem: HTMLElement) => boolean) => void} SiteUtilT */
/** @typedef {{hosts: string[], run: SiteUtilT}} SiteT */

/**
 * Subutils for individual websites.
 * `hosts` match the document's hostname exactly or as a suffix (`www.` etc),
 * so `tomshardware.com` also matches `www.tomshardware.com`.
 * @type {SiteT[]}
 */
const sites = [{ hosts: ['tomshardware.com'], run: tomshardware }];

/**
 * Runs the subutils for the website that `document` belongs to, if there are any.
 * @param {Document} document
 * @param {(elem: HTMLElement) => boolean} ignore elements that must not be removed
 */
export function runSiteUtils(document, ignore) {
  const hostname = document.location?.hostname;
  if (!hostname) return;
  for (const { hosts, run } of sites) {
    if (hosts.some((host) => hostname == host || hostname.endsWith('.' + host))) {
      run(document, ignore);
    }
  }
}
