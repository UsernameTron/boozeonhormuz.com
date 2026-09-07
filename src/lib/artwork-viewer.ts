type ViewerItem = { id: string; title: string; label: string; href: string; full?: string; alt: string; caption?: string; width?: number; height?: number; srcset?: string };

export function initializeArtworkViewer() {
  const dialog = document.querySelector<HTMLDialogElement>('#artwork-viewer');
  const data = document.querySelector('#artwork-viewer-data');
  if (!dialog || !data || typeof dialog.showModal !== 'function') return;
  let items: ViewerItem[];
  try { items = JSON.parse(data.textContent ?? '[]'); } catch { return; }
  const catalog = new Map(items.map((item) => [item.id, item]));
  const image = dialog.querySelector<HTMLImageElement>('[data-viewer-image]')!;
  const fallback = dialog.querySelector<HTMLElement>('[data-viewer-fallback]')!;
  const title = dialog.querySelector<HTMLElement>('#artwork-viewer-title')!;
  const label = dialog.querySelector<HTMLElement>('[data-viewer-label]')!;
  const caption = dialog.querySelector<HTMLElement>('[data-viewer-caption]')!;
  const count = dialog.querySelector<HTMLElement>('[data-viewer-count]')!;
  const previous = dialog.querySelector<HTMLButtonElement>('[data-viewer-prev]')!;
  const next = dialog.querySelector<HTMLButtonElement>('[data-viewer-next]')!;
  const details = dialog.querySelector<HTMLAnchorElement>('[data-viewer-details]')!;
  const download = dialog.querySelector<HTMLAnchorElement>('[data-viewer-download]')!;
  const closeButton = dialog.querySelector<HTMLButtonElement>('[data-viewer-close]')!;
  let selection: string[] = [];
  let current = '';
  let invokingLink: HTMLElement | null = null;
  let savedOverflow = '';
  let savedScroll = { x: 0, y: 0 };
  let pushed = false;

  const visibleIds = () => [...new Set([...document.querySelectorAll<HTMLAnchorElement>('a[data-art-id]')].filter((link) => link.getClientRects().length && catalog.has(link.dataset.artId!)).map((link) => link.dataset.artId!))];
  const withContext = (href: string) => {
    const url = new URL(href, location.origin);
    const context = new URLSearchParams(location.search);
    for (const key of ['q', 'type']) if (context.get(key)) url.searchParams.set(key, context.get(key)!);
    return url.pathname + url.search;
  };
  const render = (id: string) => {
    const item = catalog.get(id);
    if (!item) return false;
    current = id;
    title.textContent = item.title;
    label.textContent = item.label;
    caption.textContent = item.caption ?? '';
    caption.hidden = !item.caption;
    image.alt = item.alt;
    image.hidden = !item.full;
    fallback.hidden = !!item.full;
    image.removeAttribute('srcset');
    if (item.width && item.height) { image.width = item.width; image.height = item.height; }
    else { image.removeAttribute('width'); image.removeAttribute('height'); }
    if (item.srcset) { image.sizes = '(min-width: 1100px) 1050px, calc(100vw - 48px)'; image.srcset = item.srcset; }
    if (item.full) image.src = item.full; else image.removeAttribute('src');
    details.href = withContext(item.href);
    download.hidden = !item.full;
    if (item.full) download.href = item.full; else download.removeAttribute('href');
    const index = selection.indexOf(id);
    count.textContent = `${index + 1} of ${selection.length}`;
    previous.disabled = next.disabled = selection.length < 2;
    return true;
  };
  const open = (id: string, trigger?: HTMLElement) => {
    if (!catalog.has(id)) return;
    if (!dialog.open) {
      invokingLink = trigger ?? document.activeElement as HTMLElement;
      selection = visibleIds();
      if (!selection.includes(id)) selection = [id];
      savedScroll = { x: scrollX, y: scrollY };
      savedOverflow = document.body.style.overflow;
      if (!render(id)) return;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      closeButton.focus();
    } else render(id);
  };
  const closeUI = () => {
    if (!dialog.open) return;
    dialog.close();
    document.body.style.overflow = savedOverflow;
    image.removeAttribute('src'); image.removeAttribute('srcset');
    if (invokingLink?.isConnected) invokingLink.focus({ preventScroll: true });
    window.scrollTo(savedScroll.x, savedScroll.y);
  };
  const requestClose = () => {
    closeUI();
    if (pushed) { pushed = false; history.back(); }
    else { const url = new URL(location.href); url.searchParams.delete('art'); history.replaceState(history.state, '', url); }
  };
  image.addEventListener('error', () => { image.hidden = true; fallback.hidden = false; });
  closeButton.addEventListener('click', requestClose);
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); requestClose(); });
  dialog.addEventListener('click', (event) => { if (event.target === dialog) requestClose(); });
  const move = (offset: number) => {
    const id = selection[(selection.indexOf(current) + offset + selection.length) % selection.length];
    if (!id) return;
    render(id);
    const url = new URL(location.href); url.searchParams.set('art', id); history.replaceState(history.state, '', url);
  };
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      const targets = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])')].filter((target) => target.getClientRects().length);
      const first = targets[0]; const last = targets.at(-1);
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
  });
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-art-id]');
    if (!link || link.target || link.hasAttribute('download') || !catalog.has(link.dataset.artId!)) return;
    // The ordinary detail link remains usable unless enhancement succeeded.
    try { open(link.dataset.artId!, link); } catch { return; }
    if (!dialog.open) return;
    event.preventDefault();
    const url = new URL(location.href); url.searchParams.set('art', link.dataset.artId!);
    history.pushState(history.state, '', url); pushed = true;
  });
  window.addEventListener('popstate', () => {
    const id = new URLSearchParams(location.search).get('art');
    if (id && catalog.has(id)) { open(id); pushed = true; }
    else { closeUI(); pushed = false; }
  });
  document.addEventListener('archive:filtered', () => {
    if (!dialog.open) return;
    selection = visibleIds();
    if (!selection.includes(current)) selection = [current];
    render(current);
  });
  const initial = new URLSearchParams(location.search).get('art');
  if (initial && catalog.has(initial)) open(initial);
}
