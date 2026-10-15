import { filterArchive } from './archive';
type SearchItem = { id: string; category: string; title: string; description: string; caption?: string; track?: { title: string } };
const PAGE_SIZE = 12;
const legacyTypes: Record<string, string> = {
  track: 'album-song', performance: 'deep-cuts', 'sponsor-read': 'mctrumps',
  poster: 'image', bts: 'image', artwork: 'image',
};
export function initializeArchiveSearch() {
  const controls = document.querySelector<HTMLElement>('#archive-controls');
  const form = document.querySelector<HTMLFormElement>('#archive-search');
  const input = document.querySelector<HTMLInputElement>('#archive-query');
  const group = document.querySelector<HTMLElement>('#archive-filters');
  const count = document.querySelector<HTMLElement>('#archive-count');
  const empty = document.querySelector<HTMLElement>('#archive-empty');
  const grid = document.querySelector<HTMLElement>('#archive-grid');
  const pagination = document.querySelector<HTMLElement>('#archive-pagination');
  const pageStatus = document.querySelector<HTMLElement>('#archive-page-status');
  const data = document.querySelector('#archive-search-data');
  if (!controls || !form || !input || !group || !count || !empty || !grid || !pagination || !pageStatus || !data) return;
  let items: SearchItem[];
  try { items = JSON.parse(data.textContent ?? '[]'); } catch { return; }
  const categories = new Set(['all', ...items.map((item) => item.category)]);
  const templates = new Map([...document.querySelectorAll<HTMLTemplateElement>('template[data-card-id]')].map((template) => [template.dataset.cardId!, template]));
  let category = 'all';
  let active = false;
  let page = 1;
  const render = () => {
    const matches = active ? filterArchive(items, input.value, category) : [];
    const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
    page = Math.min(page, pages);
    const visible = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const currentIds = [...grid.children].map((child) => (child as HTMLElement).dataset.id);
    if (currentIds.length !== visible.length || currentIds.some((id, index) => id !== visible[index].id)) {
      grid.replaceChildren(...visible.flatMap((item) => {
        const child = templates.get(item.id)?.content.firstElementChild?.cloneNode(true);
        return child instanceof HTMLElement ? [child] : [];
      }));
    }
    group.querySelectorAll<HTMLButtonElement>('button[data-filter]').forEach((button) => button.setAttribute('aria-pressed', String(active && button.dataset.filter === category)));
    count.textContent = active ? `${matches.length} ${matches.length === 1 ? 'result' : 'results'} of ${items.length}` : `Search ${items.length} items or choose a type.`;
    empty.hidden = !active || matches.length > 0;
    pagination.hidden = !active || pages < 2;
    pageStatus.textContent = `Page ${page} of ${pages}`;
    pagination.querySelector<HTMLButtonElement>('[data-page="previous"]')!.disabled = page <= 1;
    pagination.querySelector<HTMLButtonElement>('[data-page="next"]')!.disabled = page >= pages;
    for (const link of grid.querySelectorAll<HTMLAnchorElement>('a[data-detail-href]')) {
      const url = new URL(link.dataset.detailHref!, location.origin);
      url.searchParams.set('from', 'search');
      if (input.value) url.searchParams.set('q', input.value);
      if (active) url.searchParams.set('type', category);
      if (page > 1) url.searchParams.set('page', String(page));
      link.href = url.pathname + url.search;
    }
    document.dispatchEvent(new Event('archive:filtered'));
  };
  const save = (mode: 'push' | 'replace') => {
    const url = new URL(location.href);
    if (input.value.trim()) url.searchParams.set('q', input.value); else url.searchParams.delete('q');
    if (active) url.searchParams.set('type', category); else url.searchParams.delete('type');
    if (active && page > 1) url.searchParams.set('page', String(page)); else url.searchParams.delete('page');
    url.searchParams.delete('art');
    if (url.href !== location.href) history[mode === 'push' ? 'pushState' : 'replaceState'](history.state, '', url);
    render();
  };
  const restore = () => {
    const params = new URLSearchParams(location.search);
    input.value = (params.get('q') ?? '').slice(0, 200);
    const requested = params.get('type') ?? '';
    category = categories.has(requested) ? requested : (legacyTypes[requested] ?? 'all');
    active = !!input.value.trim() || categories.has(requested) || !!legacyTypes[requested];
    const requestedPage = Number(params.get('page'));
    page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    render();
  };
  input.addEventListener('input', () => { active = !!input.value.trim() || active && category !== 'all'; page = 1; save('replace'); });
  form.addEventListener('submit', (event) => { event.preventDefault(); active = !!input.value.trim() || active; page = 1; save('push'); });
  group.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button[data-filter]');
    if (!button || !categories.has(button.dataset.filter!)) return;
    category = button.dataset.filter!; active = true; page = 1; save('push');
  });
  pagination.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button[data-page]');
    if (!button || button.disabled) return;
    page += button.dataset.page === 'next' ? 1 : -1;
    save('push');
    grid.scrollIntoView({ block: 'start' });
  });
  document.querySelector('#archive-reset')?.addEventListener('click', () => { input.value = ''; category = 'all'; active = false; page = 1; save('push'); input.focus(); });
  window.addEventListener('popstate', restore);
  restore();
  controls.removeAttribute('hidden');
  controls.removeAttribute('aria-hidden');
  controls.removeAttribute('inert');
  const recovery = document.querySelector<HTMLElement>('#archive-recovery');
  if (recovery) recovery.hidden = true;
  const section = controls.closest<HTMLElement>('.search-section');
  if (section) section.dataset.ready = 'true';
}
