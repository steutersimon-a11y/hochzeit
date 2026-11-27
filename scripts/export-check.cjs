/* Standalone/export regression checks. No messages or responses are sent.
   Run: node scripts/export-check.cjs (after python3 build.py)
   Optional: INVITATION_QA_URL, CHROMIUM_PATH, INVITATION_QA_TEST_NAME1,
   INVITATION_QA_TEST_NAME2, INVITATION_QA_TEST_DATE. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { pathToFileURL } = require('node:url');

let playwright;
for (const modulePath of ['playwright', 'playwright-core', '/opt/codex/cua_node/lib/node_modules/playwright-core']) {
  try { playwright = require(modulePath); break; } catch (_) {}
}
if (!playwright) throw new Error('Playwright or playwright-core is required.');

const root = path.resolve(__dirname, '..');
const standalonePath = path.join(root, 'Unsere-Hochzeit.html');
const fixtureNames = [process.env.INVITATION_QA_TEST_NAME1 || 'Mia', process.env.INVITATION_QA_TEST_NAME2 || 'Ben'];
const fixtureDate = process.env.INVITATION_QA_TEST_DATE || '2027-09-04';
assert(/^\d{4}-\d{2}-\d{2}$/.test(fixtureDate), 'INVITATION_QA_TEST_DATE must be YYYY-MM-DD.');

function compactDate(date) { return date.replaceAll('-', ''); }
function nextDay(date) {
  const value = new Date(date + 'T12:00:00Z');
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

async function openInvitation(page) {
  await page.evaluate(() => document.fonts.ready);
  const opening = page.locator('#opening');
  if (await opening.isVisible()) {
    await page.locator('#open-text').click();
    await opening.waitFor({ state: 'hidden' });
  }
}

async function readCalendar(page) {
  const downloading = page.waitForEvent('download');
  await page.locator('#save-date').click();
  const download = await downloading;
  assert.equal(download.suggestedFilename(), 'Unsere-Hochzeit.ics');
  return fs.readFileSync(await download.path(), 'utf8').replace(/\r\n[ \t]/g, '');
}

function checkProvisionalCalendar(calendar, date) {
  assert(calendar.includes('BEGIN:VEVENT'), 'Calendar must contain an event.');
  assert(calendar.includes('DTSTART;VALUE=DATE:' + compactDate(date)), 'Unconfirmed schedule must export an all-day start.');
  assert(calendar.includes('DTEND;VALUE=DATE:' + compactDate(nextDay(date))), 'All-day DTEND must be the following exclusive date.');
  assert(!/^DTSTART:/m.test(calendar), 'Unconfirmed schedule must not publish a precise starting time.');
}

async function verifyOfflineFile(browser, filename, { names, date, confirmed = false } = {}) {
  const context = await browser.newContext({ offline: true, reducedMotion: 'reduce' });
  let page = await context.newPage();
  const requests = [], errors = [];
  const trackPage = target => {
    target.on('request', request => requests.push(request.url()));
    target.on('pageerror', error => errors.push(error.message));
  };
  trackPage(page);
  await context.route(/^https?:\/\//, route => route.abort('internetdisconnected'));
  if (confirmed) {
    // Override the fixture before either inline config or app code runs.
    await context.addInitScript(() => {
      let config;
      Object.defineProperty(window, 'WEDDING', {
        configurable: true,
        get: () => config,
        set(value) {
          value.scheduleConfirmed = true;
          value.date = '2027-08-28';
          value.calendar = { ...value.calendar, startTime: '14:00', endTime: '23:59', timezone: 'Europe/Berlin' };
          config = value;
        },
      });
    });
  }
  try {
    let url = pathToFileURL(filename).href;
    try {
      await page.goto(url, { waitUntil: 'load' });
    } catch (error) {
      if (!String(error).includes('ERR_BLOCKED_BY_ADMINISTRATOR')) throw error;
      // Managed Cloud Chromium disallows the file protocol. Keep this explicit;
      // the fallback still exercises only the real HTML bytes with the network offline.
      console.warn('NOTE file:// is blocked by managed browser policy; checking the same HTML bytes as one offline HTTP document.');
      await page.close();
      page = await context.newPage();
      trackPage(page);
      requests.length = 0;
      url = 'http://invitation-offline.test/' + encodeURIComponent(path.basename(filename));
      await context.route(url, route => route.fulfill({ body: fs.readFileSync(filename), contentType: 'text/html' }));
      await page.goto(url, { waitUntil: 'load' });
    }
    await openInvitation(page);
    // Decode even below-the-fold decorations so missing embedded assets cannot hide behind lazy loading.
    await page.evaluate(() => document.querySelectorAll('img[src]').forEach(image => { image.loading = 'eager'; }));
    await page.waitForFunction(() => [...document.querySelectorAll('img[src]')]
      .every(image => image.complete && image.naturalWidth > 0));
    const actual = await page.evaluate(() => ({ names: window.WEDDING.names, date: window.WEDDING.date,
      scheduleConfirmed: window.WEDDING.scheduleConfirmed,
      visibleNames: [...document.querySelectorAll('.hero-copy [data-name]')].map(element => element.textContent) }));
    if (names) {
      assert.deepEqual(actual.names, names, 'Edited names must survive the exported file.');
      assert.deepEqual(actual.visibleNames, names, 'Exported opening must render the edited names.');
    }
    if (date) assert.equal(actual.date, date, 'Edited date must survive the exported file.');
    const calendar = await readCalendar(page);
    if (confirmed) {
      assert.equal(actual.scheduleConfirmed, true, 'Confirmed schedule fixture was not installed.');
      assert(calendar.includes('DTSTART:20270828T120000Z'), '14:00 Berlin in August must export as 12:00 UTC.');
      assert(calendar.includes('DTEND:20270828T215900Z'), '23:59 Berlin in August must export as 21:59 UTC.');
      assert(!calendar.includes('DTSTART;VALUE=DATE:'), 'A confirmed schedule must retain its precise calendar time.');
    } else if (actual.scheduleConfirmed) {
      assert.match(calendar, /^DTSTART:\d{8}T\d{6}Z\r?$/m);
      assert.match(calendar, /^DTEND:\d{8}T\d{6}Z\r?$/m);
    } else {
      checkProvisionalCalendar(calendar, date || actual.date);
    }
    assert.deepEqual(requests, [url], 'Offline standalone must use only its own HTML file, with no external or sibling-file resources.');
    assert.deepEqual(errors, [], 'Offline standalone raised browser errors.');
  } finally {
    await context.close();
  }
}

async function localServer() {
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const filename = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!filename.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
    fs.readFile(filename, (error, data) => {
      response.writeHead(error ? 404 : 200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream' });
      response.end(error ? 'Not found' : data);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}/` };
}

(async () => {
  assert(fs.existsSync(standalonePath), 'Run python3 build.py to create the standalone invitation first.');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'invitation-export-'));
  let browser, server;
  try {
    browser = await playwright.chromium.launch({ headless: true,
      executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
    await verifyOfflineFile(browser, standalonePath, { date: '2027-08-28' });
    console.log('PASS built standalone: offline browser, embedded images and calendar');

    let baseURL = process.env.INVITATION_QA_URL;
    if (!baseURL) ({ server, url: baseURL } = await localServer());
    const editorURL = new URL(baseURL);
    editorURL.searchParams.set('edit', '1');
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(editorURL.href, { waitUntil: 'networkidle' });
      await openInvitation(page);
      await page.getByRole('button', { name: 'Einladung anpassen' }).click();
      const editor = page.locator('#editor-form');
      await editor.locator('[name="name1"]').fill(fixtureNames[0]);
      await editor.locator('[name="name2"]').fill(fixtureNames[1]);
      await editor.locator('[name="date"]').fill(fixtureDate);
      const downloading = page.waitForEvent('download');
      await page.locator('#export-html').click();
      const download = await downloading;
      assert.equal(download.suggestedFilename(), 'Unsere-Hochzeit.html');
      const htmlPath = path.join(temporary, 'edited-invitation.html');
      await download.saveAs(htmlPath);
      const html = fs.readFileSync(htmlPath, 'utf8');
      assert(html.includes('data:image/webp;base64,'), 'Edited export must embed the embroidered artwork.');
      assert(html.includes('window.WEDDING'), 'Edited export must contain its own invitation configuration.');
      assert.deepEqual(errors, [], 'Editor raised browser errors.');
      await verifyOfflineFile(browser, htmlPath, { names: fixtureNames, date: fixtureDate });
      console.log('PASS edited standalone: changed names/date survive download and offline reopening (file:// attempted)');
    } finally {
      await context.close();
    }
    await verifyOfflineFile(browser, standalonePath, { confirmed: true });
    console.log('PASS confirmed schedule fixture: Berlin summer time exports 14:00 as 12:00 UTC');
  } finally {
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
    fs.rmSync(temporary, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
