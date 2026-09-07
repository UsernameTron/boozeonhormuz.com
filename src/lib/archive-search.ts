type SearchItem = { id: string; category: string; title: string; description: string; caption?: string; track?: { title: string } };
import { filterArchive } from './archive';
export function initializeArchiveSearch() {
  const controls = document.querySelector<HTMLElement>('#archive-controls');
  const form = document.querySelector<HTMLFormElement>('#archive-search');
  const input = document.querySelector<HTMLInputElement>('#archive-query');
  const group = document.querySelector<HTMLElement>('#archive-filters');
  const count = document.querySelector<HTMLElement>('#archive-count');
  const empty = document.querySelector<HTMLElement>('#archive-empty');
  const data = document.querySelector('#archive-search-data');
  if (!controls || !form || !input || !group || !count || !empty || !data) return;
  let items: SearchItem[];
  try { items = JSON.parse(data.textContent ?? '[]'); } catch { return; }
  const categories = new Set(['all', ...items.map((item) => item.category)]);
  const cards = [...document.querySelectorAll<HTMLElement>('[data-archive-item]')];
  let category = 'all';
  const apply = () => {
    const matching = new Set(filterArchive(items, input.value, category).map((item) => item.id));
    cards.forEach((card) => { card.hidden = !matching.has(card.dataset.id!); });
    group.querySelectorAll<HTMLButtonElement>('button[data-filter]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    count.textContent = `${matching.size} of ${items.length} ${items.length === 1 ? 'item' : 'items'}`;
    empty.hidden = matching.size > 0;
    for (const link of document.querySelectorAll<HTMLAnchorElement>('a[data-detail-href]')) {
      const url = new URL(link.dataset.detailHref!, location.origin);
      if (input.value) url.searchParams.set('q', input.value);
      if (category !== 'all') url.searchParams.set('type', category);
      link.href = url.pathname + url.search;
    }
    document.dispatchEvent(new Event('archive:filtered'));
  };
  const save = (mode: 'push' | 'replace') => {
    const url = new URL(location.href);
    if (input.value) url.searchParams.set('q', input.value); else url.searchParams.delete('q');
    if (category !== 'all') url.searchParams.set('type', category); else url.searchParams.delete('type');
    if (url.href !== location.href) history[mode === 'push' ? 'pushState' : 'replaceState'](history.state, '', url);
    apply();
  };
  const restore = () => {
    const params = new URLSearchParams(location.search);
    input.value = (params.get('q') ?? '').slice(0, 200);
    const requested = params.get('type') ?? 'all';
    category = categories.has(requested) ? requested : 'all';
    apply();
  };
  input.addEventListener('input', () => save('replace'));
  form.addEventListener('submit', (event) => { event.preventDefault(); save('replace'); });
  group.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button[data-filter]');
    if (!button || !categories.has(button.dataset.filter!)) return;
    category = button.dataset.filter!; save('push');
  });
  document.querySelector('#archive-reset')?.addEventListener('click', () => { input.value = ''; category = 'all'; save('push'); input.focus(); });
  window.addEventListener('popstate', restore);
  restore();
  controls.style.visibility = 'visible';
  controls.removeAttribute('aria-hidden');
  controls.removeAttribute('inert');
}
