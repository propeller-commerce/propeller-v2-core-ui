/**
 * Pagination link behaviour, shared by the React and Vue grid paginations.
 *
 * Pagination entries navigate to a different URL, so they are anchors with a
 * real `href`: that is what gives the status-bar preview, open-in-new-tab,
 * middle-click and copy-link-address. A left click is still handled in the
 * client, so `shouldHandlePaginationClick` says whether this event is the
 * plain click we take over, or one the browser must keep.
 */

/** Minimal shape of the click/mouse event both frameworks hand us. */
export interface PaginationClickEvent {
  button?: number;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  defaultPrevented?: boolean;
}

/**
 * True when the client should take the click over (and call preventDefault).
 * False for a modified or non-primary click, which must reach the browser so
 * open-in-new-tab and open-in-new-window keep working.
 */
export function shouldHandlePaginationClick(event?: PaginationClickEvent | null): boolean {
  if (!event) return true;
  if (event.defaultPrevented) return false;
  if (event.button !== undefined && event.button !== 0) return false;
  return !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
}

/**
 * `rel` for a pagination entry: `prev`/`next` describe this document's
 * relationship to the adjacent pages. Numbered entries carry no `rel`.
 *
 * Note Google dropped `rel=next`/`rel=prev` as an indexing signal in 2019;
 * this is correct markup that some browsers and reader modes still use, not
 * an SEO measure.
 */
export function paginationRel(page: number, currentPage: number): 'prev' | 'next' | undefined {
  if (page === currentPage - 1) return 'prev';
  if (page === currentPage + 1) return 'next';
  return undefined;
}
