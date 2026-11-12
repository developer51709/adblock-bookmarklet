import removeAdContainer from './removeAdContainer.js';

/**
 * Tom's Hardware (Future plc) fills `.bordeaux-slot` elements with Google Ad
 * Manager (DFP) iframes using the 'bordeaux' ad framework, wrapping each slot
 * in an element with an id starting with `bordeaux-ad-`. Blocking the iframe
 * alone leaves behind big empty boxes and a sticky bottom leaderboard, so
 * remove the element that holds each slot instead.
 *
 * @param {Document} document
 * @param {(elem: HTMLElement) => boolean} ignore elements that must not be removed
 */
export default function tomshardware(document, ignore) {
  const ads = document.querySelectorAll(
    '.bordeaux-slot,[id^="bordeaux-ad-"],iframe[id^="google_ads_iframe_"]',
  );
  for (const ad of ads) {
    removeAdContainer(ad, { ignore });
  }
}
