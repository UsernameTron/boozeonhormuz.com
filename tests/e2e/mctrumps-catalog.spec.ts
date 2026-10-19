import { test, expect } from '@playwright/test';

const nativeSource = (slug: string) => ['premium-costs', 'chief-accountability-officer'].includes(slug)
  ? `https://github.com/UsernameTron/boozeonhormuz.com/releases/download/site-media-2026-10-19/${slug}.mp4`
  : `/mctrumps/${slug}.mp4`;

const clips = [
  ['welcome', '720 / 1280'],
  ['birthday', '960 / 960'],
  ['supervision', '960 / 734'],
  ['appreciation', '960 / 840'],
  ['tehran', '960 / 734'],
  ['premium-costs', '1080 / 1080'],
  ['chief-accountability-officer', '1080 / 1080'],
] as const;

test('all seven McTrumps company videos are discoverable from Watch and Archive', async ({ page }) => {
  await page.goto('/watch/');
  await page.locator('#watch-collections a[href="/mctrumps/"]').click();
  await expect(page).toHaveURL(/\/mctrumps\/$/);
  await expect(page.locator('.mctr video')).toHaveCount(1);
  await expect(page.locator('#welcome video')).toHaveAttribute('src', '/mctrumps/welcome.mp4');
  const companyVideos = page.locator('#company-videos');
  await expect(companyVideos.locator('video, iframe, lite-youtube')).toHaveCount(0);
  await expect(companyVideos.locator('a[href^="/watch/mctrumps-"]')).toHaveCount(6);
  await expect(companyVideos.locator('a[href="/watch/mctrumps-welcome/"]')).toHaveCount(0);
  for (const [slug] of clips.slice(1)) {
    const card = companyVideos.locator(`#${slug}`);
    await expect(card).toHaveCount(1);
    const link = companyVideos.locator(`a[href="/watch/mctrumps-${slug}/"]`);
    await expect(link).toHaveCount(1);
    await expect(link.locator('img')).toHaveCount(1);
    await link.scrollIntoViewIfNeeded();
    await expect.poll(() => link.locator('img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  }
  await page.goto('/archive/');
  await page.getByRole('button', { name: /McTrumps \(7\)/ }).click();
  await expect(page.locator('#archive-grid [data-type="mctrumps"]:visible')).toHaveCount(7);
  for (const [slug] of clips) {
    await expect(page.locator(`#archive-grid [data-type="mctrumps"] a[data-detail-href="/watch/mctrumps-${slug}"]`)).toHaveCount(1);
  }
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByLabel('Search songs, videos, and images').fill('McTrumps');
  await expect(page.locator('#archive-grid [data-type="mctrumps"]:visible')).toHaveCount(7);
  await expect(page.locator('#archive-grid [data-type="image"]:visible')).toHaveCount(2);
  await expect(page.locator('#archive-grid [data-archive-item]:visible')).toHaveCount(9);
});

test('each McTrumps watch page uses its native source and frame and returns to its hub anchor', async ({ page }) => {
  for (const [slug, ratio] of clips) {
    const response = await page.goto(`/watch/mctrumps-${slug}/`);
    expect(response?.status()).toBe(200);
    const frame = page.locator('.video-frame');
    await expect(frame).toHaveAttribute('style', new RegExp(`--video-ratio: ${ratio.replace('/', '\\/')}`));
    const player = frame.locator('video');
    await expect(player).toHaveAttribute('src', nativeSource(slug));
    await expect(player).toHaveAttribute('controls', '');
    await expect(page.locator('main lite-youtube')).toHaveCount(0);
    await expect.poll(() => player.evaluate((video: HTMLVideoElement) => [video.videoWidth, video.videoHeight])).toEqual(ratio.split(' / ').map(Number));
    const added = ['premium-costs', 'chief-accountability-officer'].includes(slug);
    await expect(page.locator('article > p').first()).toContainText(added ? 'October 18, 2026' : 'October 11, 2026');
    await expect(page.locator('article').getByRole('link', { name: 'McTrumps', exact: true })).toHaveAttribute('href', `/mctrumps/#${slug}`);
    await expect(page.locator('#watch-back-link')).toHaveAttribute('href', `/mctrumps/#${slug}`);
    const notes = page.locator('article details');
    await expect(notes).toHaveCount(1);
    await expect(notes).not.toHaveAttribute('open');
    const summary = notes.locator('summary');
    await expect(summary).toHaveText(slug === 'appreciation' ? 'Interview script' : 'Scene notes');
    await summary.click();
    await expect(notes).toHaveAttribute('open', '');
    if (slug === 'appreciation') {
      await expect(notes).toContainText('Employee Appreciation Day. Tremendous day. Very important. Especially for me.');
      await expect(notes).toContainText("Unsigned. I'm not running a charity.");
    }
  }
});

test('company cards open playable square clips and preserve the programme order', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/mctrumps/#premium-costs');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#company-videos a[href="/watch/mctrumps-premium-costs/"]').click();
  await expect(page).toHaveURL(/\/watch\/mctrumps-premium-costs\/$/);
  await expect(page.locator('#watch-previous-link')).toHaveAttribute('href', /mctrumps-tehran/);
  await expect(page.locator('#watch-next-link')).toHaveAttribute('href', /mctrumps-chief-accountability-officer/);
  for (const slug of ['premium-costs', 'chief-accountability-officer']) {
    const player = page.locator('.video-frame video');
    await expect(player).toHaveAttribute('src', nativeSource(slug));
    await player.evaluate(async (video: HTMLVideoElement) => { video.muted = true; await video.play(); });
    await expect.poll(() => player.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0.2);
    const box = await player.boundingBox();
    expect(box!.width / box!.height).toBeCloseTo(1, 2);
    expect(box!.width).toBeLessThanOrEqual(390);
    await player.evaluate((video: HTMLVideoElement) => video.pause());
    if (slug === 'premium-costs') await page.locator('#watch-next-link').click();
  }
  await page.locator('#watch-back-link').click();
  await expect(page).toHaveURL(/\/mctrumps\/#chief-accountability-officer$/);
  await expect(page.locator('#chief-accountability-officer')).toBeVisible();
});

test('the McTrumps hub groups company videos by department and keeps its office compact', async ({ page }) => {
  await page.goto('/mctrumps/?page=999#company-videos');
  await expect(page.locator('.mc-hero h1')).toHaveText(/Billions served\.\s*Books cooked\./);
  const welcome = page.locator('#welcome video');
  await expect(welcome).toHaveAttribute('width', '720');
  await expect(welcome).toHaveAttribute('height', '1280');
  await expect(welcome).toHaveAttribute('controls', '');
  await expect(page.locator('#company-videos a[href^="/watch/mctrumps-"]:visible')).toHaveCount(6);
  for (const [department, ids] of Object.entries({
    'customer-relations': ['birthday', 'premium-costs'],
    'corporate-leadership': ['supervision', 'appreciation', 'chief-accountability-officer'],
    'international-expansion': ['tehran'],
  })) {
    const section = page.locator(`#${department}`);
    await expect(section.locator('a[data-episode-id]')).toHaveCount(ids.length);
    for (const id of ids) await expect(section.locator(`a[data-episode-id="${id}"]`)).toBeVisible();
  }
  await expect(page.locator('#company-office')).not.toHaveAttribute('open');
  await page.locator('#company-office > summary').click();
  const complaints = page.locator('#complaint-desk details');
  await expect(complaints).toHaveCount(3);
  await expect(complaints.locator('summary')).toContainText(['Can I see an itemized receipt?', 'Where did the employee appreciation fund go?', 'Is there someone above the manager?']);
  await complaints.first().locator('summary').click();
  await expect(complaints.first().locator('.mc-don')).toBeVisible();
  await expect(page.locator('.mc-other-list strong')).toHaveText(['Hormuz Premium Yacht Fuel', 'Discovery Shredding Co.', 'Panic Room Realty', 'Legal-Ish Insurance Group']);
  for (const blurb of await page.locator('.mc-other-list span').all()) await expect(blurb).not.toBeEmpty();
  for (const id of ['resort-contracts', 'company-records']) {
    const section = page.locator(`#${id}`);
    await expect(section).toHaveAttribute('data-content-state', 'empty');
    const heading = section.getByRole('heading');
    await expect(heading).toHaveCount(1);
    await expect(heading).not.toBeEmpty();
    await expect(section).toHaveText(await heading.innerText());
    await expect(section.locator('a, button, article, video, img')).toHaveCount(0);
  }
});

test('legacy sponsor links preserve their query and every episode anchor', async ({ page }) => {
  for (const [slug] of clips) {
    await page.goto(`/sponsor-reads/?from=legacy&campaign=staff%20brief#${slug}`);
    await expect.poll(() => new URL(page.url()).pathname).toBe('/mctrumps/');
    const destination = new URL(page.url());
    expect(destination.searchParams.get('from')).toBe('legacy');
    expect(destination.searchParams.get('campaign')).toBe('staff brief');
    expect(destination.hash).toBe(`#${slug}`);
    await expect(page.locator(`#${slug}`)).toBeVisible();
  }
});

test('legacy sponsor links and every company video remain reachable without scripts', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    expect((await page.goto('/sponsor-reads/'))?.status()).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/mctrumps\/$/);
    const legacyNav = page.getByRole('navigation', { name: 'McTrumps videos' });
    await expect(legacyNav.getByRole('link')).toHaveCount(7);
    for (const [slug] of clips) await expect(legacyNav.locator(`a[href="/mctrumps/#${slug}"]`)).toHaveCount(1);
    await page.getByRole('link', { name: 'Open McTrumps →', exact: true }).click();
    await expect(page).toHaveURL(/\/mctrumps\/$/);
    await expect(page.locator('#welcome video')).toHaveAttribute('src', '/mctrumps/welcome.mp4');
    for (const [slug] of clips.slice(1)) await expect(page.locator(`#company-videos a[href="/watch/mctrumps-${slug}/"]`)).toBeVisible();
    await page.locator('#company-videos a[href="/watch/mctrumps-appreciation/"]').click();
    await expect(page.locator('.video-frame video')).toHaveAttribute('src', '/mctrumps/appreciation.mp4');
    await expect(page.locator('#watch-back-link')).toHaveAttribute('href', '/mctrumps/#appreciation');
    await page.locator('article details summary').click();
    await expect(page.locator('article details')).toContainText("Unsigned. I'm not running a charity.");
  } finally {
    await context.close();
  }
});
