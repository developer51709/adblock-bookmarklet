// Text that ad containers use to label themselves. This is not content, so a
// container holding only this (and the ad) can still be safely removed.
const AD_LABEL_RE =
  /^(advertisements?|ads?|sponsored( by)?|(story|article) continues below.*|scroll to continue.*)$/i;

// Real content if found outside of the ad element.
const CONTENT_SELECTOR =
  'img,picture,video,canvas,audio,object,embed,form,button,input,select,textarea';

// Only these elements are considered to be wrappers that hold ads.
const CONTAINER_TAGS = new Set([
  'DIV',
  'SECTION',
  'ASIDE',
  'SPAN',
  'FIGURE',
  'TD',
  'INS',
]);

/**
 * Checks whether `elem` holds anything except `ad` (and things like an
 * "Advertisement" label), in which case `elem` is not just an ad wrapper.
 * @param {Element} elem
 * @param {Element} ad
 * @returns {boolean}
 */
function holdsOtherContent(elem, ad) {
  for (const child of elem.childNodes) {
    // the branch that contains the ad is the ad's own markup so ignore it
    if (child == ad || (child.contains && child.contains(ad))) continue;
    if (child.nodeType == 3) {
      const text = child.data.trim();
      if (text && !AD_LABEL_RE.test(text)) return true;
      continue;
    }
    if (child.nodeType == 8) continue; // comments are not content
    if (child.nodeType != 1) return true;
    if (child.matches(CONTENT_SELECTOR)) return true;
    if (holdsOtherContent(child, ad)) return true;
  }
  return false;
}

/**
 * Removes the element that *holds* an ad widget/frame instead of only the
 * widget itself (sites usually style the holder, so removing just the widget
 * leaves an empty box or a sticky bar behind).
 *
 * Walks up from `ad` while the ancestors contain nothing but the ad (and
 * labels such as "Advertisement"), then removes the outermost such element.
 * If no ancestor qualifies, `ad` itself is removed, so pass an element that is
 * known to be part of an ad.
 *
 * @param {Element} ad
 * @param {{maxDepth?: number, ignore?: (elem: HTMLElement) => boolean}} [options]
 *   `ignore` is checked against every candidate before it is considered or removed.
 * @returns {boolean} whether an element was removed
 */
export default function removeAdContainer(
  ad,
  { maxDepth = 8, ignore = () => false } = {},
) {
  if (!ad.isConnected || !ad.parentElement) return false;
  let target = ad;
  for (
    let elem = ad.parentElement, depth = 0;
    elem && depth < maxDepth;
    elem = elem.parentElement, depth++
  ) {
    if (!CONTAINER_TAGS.has(elem.tagName)) break;
    if (ignore(/** @type {HTMLElement} */ (elem))) break;
    if (holdsOtherContent(elem, ad)) break; // would remove real content
    target = elem;
  }
  if (ignore(/** @type {HTMLElement} */ (target))) return false;
  // Anti-adblock stuff might overwrite their own prototype
  // This isn't perfect by any means but it's good enough.
  HTMLElement.prototype.remove.call(target);
  return true;
}
