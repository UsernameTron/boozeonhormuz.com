import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function projectControls(page: Page) {
  const panel = page.locator('.project-tools');
  if (await panel.getAttribute('open') === null) await panel.locator('summary').click();
  return panel;
}
async function exportProject(page: Page) {
  const panel = await projectControls(page);
  const downloading = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Export Project', exact: true }).click();
  return JSON.parse(await readFile((await (await downloading).path())!, 'utf8'));
}
async function previewImport(page: Page, data: unknown) {
  const panel = await projectControls(page);
  await panel.locator('input[type=file]').setInputFiles({ name: 'project.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
  await expect(page.getByRole('dialog', { name: 'Review import' })).toBeVisible();
}

test('edited briefs clearly disable stale copying; current export and share keep edited values', async ({ page }) => {
  await page.goto('/apps/broadcast-room.html');
  await expect(page.locator('#out-master')).toContainText('FAST PRODUCTION ORDER');
  await page.locator('#title').fill('Current café $&');
  await expect(page.locator('#generationStatus')).toContainText('regenerate');
  await expect(page.locator('#copyBtn')).toBeDisabled();
  expect((await exportProject(page)).brief.title).toBe('Current café $&');
  await page.locator('#shareBtn').click();
  await expect(page).toHaveURL(/#b=/);
  await page.reload();
  await expect(page.locator('#title')).toHaveValue('Current café $&');
  await expect(page.locator('#copyBtn')).toBeEnabled();
  for (let index = 0; index < 12; index++) { await page.locator('#randomBtn').click(); await expect(page.locator('#reaction')).not.toHaveValue(''); }
});

test('Shorts produces five timed shots and restores generated state, references and section choices', async ({ page }) => {
  await page.goto('/apps/broadcast-room.html');
  await page.locator('#format').selectOption('Shorts/Reels pack');
  await expect(page.locator('#presetNote')).toContainText('30 seconds');
  await page.locator('#includeLyrics').uncheck();
  await page.locator('#generateBtn').click();
  await expect(page.locator('#out-master')).toContainText('30 seconds, 9:16 portrait, five shots');
  await expect(page.locator('#out-lyrics')).toHaveText('[Suno pack disabled]');
  await expect(page.locator('#shotRows article')).toHaveCount(5);
  await page.locator('#shotManifest summary').click();
  await page.locator('#short-01-image').fill('my-first-frame.webp');
  await page.locator('#short-01-review').selectOption('approved');
  const saved = await exportProject(page);
  expect(saved.shots.reduce((n: number, s: { duration: number }) => n + s.duration, 0)).toBe(30);
  await page.reload();
  await previewImport(page, saved);
  await expect(page.locator('#format')).toHaveValue('Music video pack');
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  await expect(page.locator('#format')).toHaveValue('Shorts/Reels pack');
  await expect(page.locator('#includeLyrics')).not.toBeChecked();
  await expect(page.locator('#short-01-review')).toHaveValue('approved');
  await expect(page.locator('#copyBtn')).toBeEnabled();
  const restored = await exportProject(page);
  expect(restored.brief).toEqual(saved.brief); expect(restored.shots).toEqual(saved.shots); expect(restored.generation).toEqual(saved.generation);
  await page.locator('#concept').fill('A different production premise');
  await page.locator('#generateBtn').click();
  await expect(page.locator('#short-01-review')).toHaveValue('review');
  await page.locator('#includeVideo').uncheck();
  await page.locator('#includeImage').uncheck();
  await page.locator('#generateBtn').click();
  await expect(page.locator('#shotManifest')).toBeHidden();
  await expect(page.locator('#out-video')).toHaveText('[Video pack disabled]');
  await expect(page.locator('#out-image')).toHaveText('[Image pack disabled]');
});

test('Studio portable session restores literal variables and custom work; merge and undo are explicit', async ({ page }) => {
  await page.goto('/apps/evidence-lounge-studio.html');
  await page.locator('#editor1').fill('Invoice {{price}}. {{song_title}}');
  await page.locator('#variable-price').fill('$& $$ $` $\' café');
  await page.locator('#variable-song_title').fill('Gold Quiet');
  await expect(page.locator('#previewBox')).toContainText('$& $$ $` $\' café');
  await expect(page.getByLabel('{{price}}')).toBeVisible();
  await page.locator('#saveBtn').click();
  await page.locator('#saveName').fill('My preserved template');
  await page.locator('#saveConfirmBtn').click();
  const saved = await exportProject(page);
  await page.locator('#editor1').fill('Current session must remain until confirmation');
  await previewImport(page, saved);
  await expect(page.locator('#editor1')).toHaveValue('Current session must remain until confirmation');
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  await expect(page.locator('#editor1')).toHaveValue(saved.studio.editor);
  expect((await exportProject(page)).studio.variables).toEqual(saved.studio.variables);
  await page.getByRole('button', { name: 'Undo import', exact: true }).click();
  await expect(page.locator('#editor1')).toHaveValue('Current session must remain until confirmation');
});

test('Studio production kits survive project import, Undo and opted-in device restore', async ({ page }) => {
  await page.goto('/apps/evidence-lounge-studio.html');
  await page.locator('#editor1').fill('Kit {{price}}');
  await page.locator('#variable-price').fill('Café $&');
  const prompt = await exportProject(page);
  const panel = await projectControls(page);
  await panel.getByLabel('Save on this device').check();
  await page.locator('#packageBtn').click();
  const kitText = await page.locator('#previewBox').textContent();
  expect(kitText).toContain('QUICK PRODUCTION KIT');
  const kit = await exportProject(page);
  expect(kit.studio.rendered).toEqual({ version: 1, mode: 'kit', text: kitText });
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('boh-project-studio-v1')))!).studio.rendered).toEqual(kit.studio.rendered);
  await page.locator('#packageBtn').click();
  await expect(page.locator('#previewBox')).toHaveText(kitText!);
  await panel.getByLabel('Save on this device').uncheck();
  await previewImport(page, prompt);
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  await expect(page.locator('#previewBox')).not.toContainText('QUICK PRODUCTION KIT');
  await page.getByRole('button', { name: 'Undo import', exact: true }).click();
  await expect(page.locator('#previewBox')).toHaveText(kitText!);
  await page.reload();
  await previewImport(page, kit);
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  expect((await exportProject(page)).studio.rendered).toEqual(kit.studio.rendered);
  await page.locator('#variable-price').fill('Updated value');
  await expect(page.locator('#previewBox')).not.toContainText('QUICK PRODUCTION KIT');
  expect((await exportProject(page)).studio.rendered.mode).toBe('prompt');
  await page.reload();
  await (await projectControls(page)).getByRole('button', { name: 'Restore device save' }).click();
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  await expect(page.locator('#previewBox')).toHaveText(kitText!);
  await page.locator('#formatSelect').selectOption('clean');
  await expect(page.locator('#previewBox')).not.toContainText('QUICK PRODUCTION KIT');
  await expect(page.locator('#previewBox')).toContainText('EDITORIAL NOTE');
});

test('oversized multibyte merges and new templates fail before mutation; autosave keeps its last valid copy', async ({ page }) => {
  await page.goto('/apps/evidence-lounge-studio.html');
  const library = (count: number, prefix: string, content: string) => ({ version: 2, custom: Array.from({ length: count }, (_, id) => ({ id: Date.now() + id, name: `${prefix} ${id}`, category: 'custom', heat: 'custom', content, builtIn: false })) });
  await previewImport(page, library(40, 'Existing', '漢'.repeat(10_000)));
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  const before = await exportProject(page);
  await previewImport(page, library(30, 'Incoming', '漢'.repeat(10_000)));
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  await expect(page.locator('#toast')).toContainText('too large');
  await expect(page.getByRole('dialog', { name: 'Review import' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect((await exportProject(page)).studio).toEqual(before.studio);

  const nearLimit = before;
  nearLimit.studio.customTemplates = library(97, 'Bounded', 'x'.repeat(20_000)).custom;
  const excess = Buffer.byteLength(JSON.stringify(nearLimit, null, 2)) - 1_945_000;
  expect(excess).toBeGreaterThan(0); expect(excess).toBeLessThan(20_000);
  nearLimit.studio.customTemplates.at(-1)!.content = 'x'.repeat(20_000 - excess);
  await previewImport(page, nearLimit);
  await page.locator('[data-merge]').selectOption('replace');
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  await page.locator('#editor1').fill('x'.repeat(20_000));
  const valid = await exportProject(page);
  expect(Buffer.byteLength(JSON.stringify(valid, null, 2))).toBeLessThan(2_000_000);
  await page.locator('#saveBtn').click();
  await page.locator('#saveName').fill('One template too many');
  await page.locator('#saveConfirmBtn').click();
  await expect(page.locator('#toast')).toContainText('too large');
  await expect(page.locator('#saveModal')).toBeVisible();
  await page.keyboard.press('Escape');
  expect((await exportProject(page)).studio.customTemplates).toEqual(valid.studio.customTemplates);
  const panel = await projectControls(page);
  await panel.getByLabel('Save on this device').check();
  await expect(panel.locator('.storage-status')).toContainText('Saved on this device');
  const deviceCopy = await page.evaluate(() => localStorage.getItem('boh-project-studio-v1'));
  await page.locator('#editor1').fill('é'.repeat(20_000));
  await expect(panel.locator('.storage-status')).toContainText('too large');
  await expect(panel.locator('.storage-status')).not.toContainText('Saved on this device');
  await expect(panel.getByLabel('Save on this device')).not.toBeChecked();
  expect(await page.evaluate(() => localStorage.getItem('boh-project-studio-v1'))).toBe(deviceCopy);
  expect(Buffer.byteLength(deviceCopy!)).toBeLessThan(2_000_000);
});

test('bad files leave both tools unchanged; Studio native save dialog contains keyboard focus', async ({ page }) => {
  for (const app of ['broadcast-room', 'evidence-lounge-studio']) {
    await page.goto(`/apps/${app}.html`);
    const field = page.locator(app === 'broadcast-room' ? '#title' : '#editor1');
    await field.fill('Keep this work');
    const panel = await projectControls(page);
    await panel.locator('input[type=file]').setInputFiles({ name: 'wrong.json', mimeType: 'application/json', buffer: Buffer.from('{"format":"boh-creative-project","version":999}') });
    await expect(page.locator('#toast')).toContainText(/Unsupported/);
    await expect(field).toHaveValue('Keep this work');
    await panel.locator('input[type=file]').setInputFiles({ name: 'big.json', mimeType: 'application/json', buffer: Buffer.alloc(2_000_001) });
    await expect(page.locator('#toast')).toContainText(/large/);
    await expect(field).toHaveValue('Keep this work');
  }
  await page.locator('#saveBtn').click();
  await page.locator('#saveName').focus();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#saveConfirmBtn')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#saveBtn')).toBeFocused();
});

test('device saving is opt-in; unavailable storage preserves the in-memory project', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage disabled', 'SecurityError'); } }); });
  await page.goto('/apps/broadcast-room.html');
  await page.locator('#title').fill('Keep without storage');
  const panel = await projectControls(page);
  await panel.getByLabel('Save on this device').click();
  await expect(panel.locator('.storage-status')).toContainText('unavailable or full');
  await expect(panel.getByLabel('Save on this device')).not.toBeChecked();
  await expect(page.locator('#title')).toHaveValue('Keep without storage');
  expect((await exportProject(page)).brief.title).toBe('Keep without storage');
});

test('device save restores only after review and can be deleted while keeping the open session', async ({ page }) => {
  await page.goto('/apps/broadcast-room.html');
  await page.locator('#title').fill('Device project');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  let panel = await projectControls(page);
  await panel.getByLabel('Save on this device').check();
  await expect(panel.locator('.storage-status')).toContainText('Saved on this device');
  await page.reload();
  await expect(page.locator('#title')).toHaveValue('Booze on Hormuz');
  panel = await projectControls(page);
  await panel.getByRole('button', { name: 'Restore device save' }).click();
  await expect(page.locator('#title')).toHaveValue('Booze on Hormuz');
  await page.keyboard.press('Escape');
  await expect(panel.getByRole('button', { name: 'Restore device save' })).toBeFocused();
  await panel.getByRole('button', { name: 'Restore device save' }).click();
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  await expect(page.locator('#title')).toHaveValue('Device project');
  await panel.getByRole('button', { name: 'Delete device save' }).click();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await expect(page.locator('#title')).toHaveValue('Device project');
});

test('quota failure preserves Studio text and does not claim a device save', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); }; });
  await page.goto('/apps/evidence-lounge-studio.html');
  await page.locator('#editor1').fill('Still in memory');
  const panel = await projectControls(page);
  await panel.getByLabel('Save on this device').click();
  await expect(panel.locator('.storage-status')).toContainText('unavailable or full');
  await expect(page.locator('#editor1')).toHaveValue('Still in memory');
  expect((await exportProject(page)).studio.editor).toBe('Still in memory');
});

test('imported mismatched snapshots remain stale even if revision numbers match', async ({ page }) => {
  await page.goto('/apps/broadcast-room.html');
  const saved = await exportProject(page);
  saved.brief.title = 'Different from the generated snapshot';
  await previewImport(page, saved);
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  await expect(page.locator('#title')).toHaveValue(saved.brief.title);
  await expect(page.locator('#copyBtn')).toBeDisabled();
  await page.locator('#generateBtn').click();
  await expect(page.locator('#copyBtn')).toBeEnabled();
});

test('blank raw brief fields round-trip without falsely marking their generated defaults stale', async ({ page }) => {
  await page.goto('/apps/broadcast-room.html');
  await page.locator('#title').fill('');
  await page.locator('#setting').fill('');
  await page.locator('#generateBtn').click();
  const saved = await exportProject(page);
  expect(saved.brief.title).toBe(''); expect(saved.brief.setting).toBe('');
  await page.locator('#setting').fill('Unrelated current setting');
  await previewImport(page, saved);
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  await expect(page.locator('#title')).toHaveValue('');
  await expect(page.locator('#setting')).toHaveValue('');
  await expect(page.locator('#copyBtn')).toBeEnabled();
});

test('Studio preserves edited built-in selection and resolves custom-name collisions without replacing work', async ({ page }) => {
  await page.goto('/apps/evidence-lounge-studio.html');
  await page.locator('#editor1').fill('An edited built-in prompt');
  const builtIn = await exportProject(page);
  await previewImport(page, builtIn);
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  expect((await exportProject(page)).studio.selectedTemplate).toBe(builtIn.studio.selectedTemplate);
  await page.locator('#saveBtn').click();
  await page.locator('#saveName').fill('Collision template');
  await page.locator('#saveConfirmBtn').click();
  const custom = await exportProject(page);
  custom.studio.customTemplates[0].content = 'A different incoming original template';
  custom.studio.editor = 'An edited incoming custom prompt';
  await previewImport(page, custom);
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  const restored = await exportProject(page);
  expect(restored.studio.customTemplates).toHaveLength(2);
  expect(restored.studio.customTemplates[0].content).toBe('An edited built-in prompt');
  expect(restored.studio.selectedTemplate).toBe('Collision template (imported 2)');
  expect(restored.studio.editor).toBe('An edited incoming custom prompt');
});

test('Broadcast handoff opens only through a reviewed Studio file import', async ({ page }) => {
  await page.goto('/apps/broadcast-room.html');
  await page.locator('#title').fill('Cross-tool café');
  await page.locator('#setting').fill('A gold deck');
  const panel = await projectControls(page);
  const downloading = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Export for Studio' }).click();
  const handoff = JSON.parse(await readFile((await (await downloading).path())!, 'utf8'));
  await page.goto('/apps/evidence-lounge-studio.html');
  await page.locator('#editor1').fill('Existing work');
  await previewImport(page, handoff);
  await expect(page.locator('#editor1')).toHaveValue('Existing work');
  await page.getByRole('button', { name: 'Apply import', exact: true }).click();
  await expect(page.locator('#variable-song_title')).toHaveValue('Cross-tool café');
  await expect(page.locator('#previewBox')).toContainText('A gold deck');
});

test('both wrappers activate desktop layouts at1440 and offer reachable mobile step navigation', async ({ page }) => {
  for (const app of ['broadcast-room', 'evidence-lounge-studio']) {
    await page.goto(`/tools/${app}/`);
    const frame = page.frameLocator('iframe');
    const width = await frame.locator('body').evaluate(() => innerWidth);
    expect(width).toBeGreaterThan(1100);
    await expect(page.getByRole('link', { name: /Open full workspace/ })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(frame.getByRole('navigation', { name: 'Workbench steps' })).toBeVisible();
    await frame.getByRole('link', { name: app === 'broadcast-room' ? '2. Output' : '3. Preview', exact: true }).click();
    await expect(frame.locator(app === 'broadcast-room' ? '#outputPanel' : '#previewSection')).toBeInViewport();
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
});
