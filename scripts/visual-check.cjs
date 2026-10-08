/* Browser regression checks for the invitation's real visual/interaction failures.
   Run: node scripts/visual-check.cjs
   Optional: INVITATION_QA_URL=http://127.0.0.1:8000 INVITATION_QA_OUTPUT=/tmp/wedding-qa
   Uses Playwright and Chromium; never reads files outside the checked-out repo. */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');
const { isDeepStrictEqual } = require('node:util');

let playwright;
for (const modulePath of ['playwright', 'playwright-core', '/opt/codex/cua_node/lib/node_modules/playwright-core']) {
  try { playwright = require(modulePath); break; } catch (_) {}
}
if (!playwright) throw new Error('Playwright or playwright-core is required.');

const root = path.resolve(__dirname, '..');
const output = process.env.INVITATION_QA_OUTPUT || '/tmp/wedding-qa';
const requiredArt = ['opener.webp', 'welcome.webp', 'venues-frame.webp', 'story-frame.webp',
  'gift-frame.webp', 'medallion.webp', 'timeline-icons.webp', 'mago-location.webp'];
const missing = requiredArt.filter(file => !fs.existsSync(path.join(root, 'assets/loom', file)));
if (missing.length) {
  console.error('WAITING FOR ART: ' + missing.join(', '));
  process.exit(2);
}
fs.mkdirSync(output, { recursive: true });

const failures = [];
const results = [];
function check(value, message) {
  if (!value) failures.push(message);
}
// Decorative scenes have one deliberate home. Only the three countdown seals repeat.
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const artSources = [...source.matchAll(/<img\b[^>]*\bsrc=["'](assets\/(?:loom|art)\/[^"']+)["']/g)]
  .map(match => match[1]);
const sourceCounts = new Map();
artSources.forEach(src => sourceCounts.set(src, (sourceCounts.get(src) || 0) + 1));
for (const [src, count] of sourceCounts) {
  check(count === (src === 'assets/loom/medallion.webp' ? 3 : 1),
    `Static markup repeats a decorative scene: ${src} appears ${count} times`);
}
for (const file of ['opener.webp', 'welcome.webp', 'venues-frame.webp', 'story-frame.webp', 'gift-frame.webp']) {
  check(sourceCounts.get('assets/loom/' + file) === 1, `Missing unique textile scene: ${file}`);
}
// The contextual Mago artwork is the sole intended configuration change.
function readConfig(code) {
  const context = { window: {} };
  vm.runInNewContext(code, context);
  return JSON.parse(JSON.stringify(context.window.WEDDING));
}
const currentConfig = readConfig(fs.readFileSync(path.join(root, 'wedding-config.js'), 'utf8'));
const previous = spawnSync('git', ['show', 'HEAD:wedding-config.js'], { cwd: root, encoding: 'utf8' });
if (previous.status === 0) {
  const baseline = readConfig(previous.stdout);
  baseline.photos.party = currentConfig.photos.party;
  check(isDeepStrictEqual(baseline, currentConfig), 'Invitation inputs changed beyond the contextual Mago artwork');
}
async function overflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  check(dimensions.document <= dimensions.viewport + 1 && dimensions.body <= dimensions.viewport + 1,
    `${label}: horizontal overflow ${JSON.stringify(dimensions)}`);
}
function centerDiversity(file) {
  const result = spawnSync('python3', ['-c',
    'from PIL import Image\nimport sys\nim=Image.open(sys.argv[1]).convert("RGB")\nw,h=im.size\npix=im.load()\nprint(len({pix[x,y] for x in range(int(w*.35),int(w*.65),3) for y in range(int(h*.2),int(h*.8),3)}))', file],
    { encoding: 'utf8' });
  if (result.status !== 0) throw new Error('Pillow screenshot check failed: ' + result.stderr);
  return Number(result.stdout.trim());
}
async function exerciseViewport(browser, baseURL, width) {
  const startingFailures = failures.length;
  const height = width <= 700 ? 844 : 900;
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#opening').waitFor({ state: 'visible' });
  await overflow(page, `${width} initial`);
  check(await page.evaluate(() => document.querySelector('main').inert), `${width}: main is interactive behind opening`);
  await page.keyboard.press('Tab');
  check(await page.evaluate(() => document.activeElement.id === 'open-invitation'), `${width}: first opening keyboard stop is wrong`);
  await page.keyboard.press('Shift+Tab');
  check(await page.evaluate(() => document.activeElement.id === 'open-text'), `${width}: opening reverse focus trap fails`);
  await page.keyboard.press('Tab');
  check(await page.evaluate(() => document.activeElement.id === 'open-invitation'), `${width}: opening forward focus trap fails`);
  await page.screenshot({ path: path.join(output, `closed-${width}.png`) });
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelector('#opening').classList.contains('is-opening'));
  await page.waitForTimeout(1550);
  const mid = await page.evaluate(() => {
    const hero = document.querySelector('.hero');
    const image = document.querySelector('.garden-frame');
    const copy = document.querySelector('.hero-copy');
    const pseudo = getComputedStyle(document.body, '::after');
    return {
      y: hero.getBoundingClientRect().top,
      loaded: image.complete && image.naturalWidth > 0,
      source: image.currentSrc,
      opacity: Number(getComputedStyle(copy).opacity),
      pseudoContent: pseudo.content,
      pseudoBackground: pseudo.backgroundColor,
      leftTransform: getComputedStyle(document.querySelector('.gate-left')).transform,
    };
  });
  const midFile = path.join(output, `opening-${width}.png`);
  await page.screenshot({ path: midFile });
  const diversity = centerDiversity(midFile);
  check(mid.y === 0 && mid.loaded && mid.opacity > .7, `${width}: live first scene missing during opening ${JSON.stringify(mid)}`);
  check(diversity > 150, `${width}: mid-opening central scene is blank (${diversity} sampled colors)`);
  check(mid.source.includes('assets/loom/opener.webp'), `${width}: wrong first-scene artwork source`);
  check(mid.pseudoContent === 'none' || mid.pseudoBackground === 'rgba(0, 0, 0, 0)', `${width}: opaque page pseudo-element covers opener`);
  await page.locator('#opening').waitFor({ state: 'hidden', timeout: 5000 });
  check(await page.evaluate(() => !document.querySelector('main').inert), `${width}: page stays inert after opening`);
  check(await page.evaluate(() => document.activeElement.classList.contains('hero-discover')), `${width}: focus not restored to first scene`);
  const copyBox = await page.locator('.hero-copy').boundingBox();
  const heroBox = await page.locator('.hero').boundingBox();
  check(copyBox.y + copyBox.height <= heroBox.y + heroBox.height - 20, `${width}: opening copy clips below hero`);
  const heroPlacement = await page.evaluate(() => {
    const image = document.querySelector('.garden-frame');
    const imageBox = image.getBoundingClientRect(), copy = document.querySelector('.hero-copy').getBoundingClientRect();
    const scale = Math.min(imageBox.width / image.naturalWidth, imageBox.height / image.naturalHeight);
    const artworkHeight = image.naturalHeight * scale;
    const artworkTop = imageBox.top + (imageBox.height - artworkHeight) / 2;
    return { top: (copy.top-artworkTop)/artworkHeight, bottom: (copy.bottom-artworkTop)/artworkHeight };
  });
  // The chapel cross begins at 48% of this specific scene; text belongs above it.
  check(heroPlacement.bottom <= .475, `${width}: opening text overlaps the chapel ${JSON.stringify(heroPlacement)}`);
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: path.join(output, `opened-${width}.png`) });
  await page.locator('.hero').screenshot({ path: path.join(output, `hero-${width}.png`) });

  // Scroll each real section to exercise lazy loading, reveal animation, and layout.
  for (const selector of ['#willkommen', '#datum', '.venues-intro', '.venue-grid', '.dresscode',
    '.story-framed', '.story-photos', '#unser-tag', '#gut-zu-wissen', '.gift-section', '#rueckmeldung']) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    await overflow(page, `${width} ${selector}`);
  }
  // Long sections can hold several reveals; cross the whole page as a guest would.
  await page.evaluate(async () => {
    const step = Math.max(300, innerHeight * .7);
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      scrollTo({ top: y, behavior: 'instant' });
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
  });
  await page.evaluate(async () => {
    await Promise.all([...document.images].filter(image => image.getAttribute('src') && image.clientWidth > 0 && image.clientHeight > 0)
      .map(image => image.decode().catch(() => {})));
  });
  await page.waitForTimeout(850);
  const ornaments = await page.evaluate(() => [...document.querySelectorAll('img[src*="assets/loom/"],img[src*="assets/art/"]')]
    .filter(image => !image.classList.contains('garden-frame') && image.clientWidth > 0)
    .map(image => ({
      src: image.getAttribute('src'),
      width: image.clientWidth, height: image.clientHeight,
      naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
      fit: getComputedStyle(image).objectFit,
      error: Math.abs((image.clientWidth / image.clientHeight) / (image.naturalWidth / image.naturalHeight) - 1),
    })));
  for (const image of ornaments) {
    check(image.naturalWidth > 0, `${width}: ornament failed to load ${image.src}`);
    check(image.error < .012 || ['contain', 'cover', 'scale-down', 'none'].includes(image.fit),
      `${width}: stretched ornament ${JSON.stringify(image)}`);
  }
  const fallbackVisibility = await page.evaluate(() => [...document.querySelectorAll('[data-photo]')].map(image => {
    const fallback = image.parentElement.querySelector('.photo-fallback,.venue-fallback');
    const visible = element => !!element && getComputedStyle(element).display !== 'none' && element.getBoundingClientRect().width > 0;
    return { key: image.dataset.photo, loaded: image.complete && image.naturalWidth > 0,
      primaryVisible: visible(image), fallbackVisible: visible(fallback) };
  }));
  for (const image of fallbackVisibility) {
    check(image.loaded && image.primaryVisible, `${width}: primary photo not visible ${JSON.stringify(image)}`);
    check(!(image.primaryVisible && image.fallbackVisible), `${width}: duplicate primary/fallback illustrations ${JSON.stringify(image)}`);
  }
  const panels = await page.evaluate(() => [...document.querySelectorAll('.textile-panel')].map(panel => {
    const copy = panel.querySelector('.panel-copy');
    const a = panel.getBoundingClientRect(), b = copy.getBoundingClientRect();
    return { class: panel.className, top: (b.top-a.top)/a.height, bottom: (b.bottom-a.top)/a.height,
      left: (b.left-a.left)/a.width, right: (b.right-a.left)/a.width,
      clipped: copy.scrollWidth > copy.clientWidth+1 || copy.scrollHeight > copy.clientHeight+1 };
  }));
  for (const panel of panels) {
    check(!panel.clipped && panel.top >= 0 && panel.bottom <= 1 && panel.left >= 0 && panel.right <= 1,
      `${width}: panel text clips outside its textile scene ${JSON.stringify(panel)}`);
    const safeBand = panel.class.includes('welcome') ? [.30, .69]
      : panel.class.includes('venues-intro') ? [.22, .81]
      : panel.class.includes('story-framed') ? [.28, .73] : [.15, .90];
    check(panel.top >= safeBand[0]-.002 && panel.bottom <= safeBand[1]+.002,
      `${width}: text reaches a decorated part of its frame ${JSON.stringify(panel)}`);
  }
  const textBindings = await page.evaluate(() => {
    const get = key => key.split('.').reduce((value, part) => value?.[part], window.WEDDING);
    return [...document.querySelectorAll('[data-bind]')].filter(element => element.textContent !== String(get(element.dataset.bind) ?? ''))
      .map(element => element.dataset.bind);
  });
  check(textBindings.length === 0, `${width}: missing or changed invitation text ${textBindings.join(', ')}`);
  const timelineIcons = await page.evaluate(() => [...document.querySelectorAll('.timeline-icon')].map(icon => {
    const style = getComputedStyle(icon), box = icon.getBoundingClientRect();
    return { icon: icon.dataset.icon, position: style.backgroundPosition, source: style.backgroundImage,
      ratio: box.width/box.height, overlays: icon.querySelectorAll('svg,img').length };
  }));
  check(new Set(timelineIcons.map(icon => icon.position)).size === timelineIcons.length,
    `${width}: timeline repeats a sprite cell`);
  for (const icon of timelineIcons) {
    check(icon.source.includes('timeline-icons.webp') && Math.abs(icon.ratio-2/3) < .01 && icon.overlays === 0,
      `${width}: distorted or doubled timeline icon ${JSON.stringify(icon)}`);
  }
  const venueImages = await page.evaluate(() => [...document.querySelectorAll('.venue-art>[data-photo]')].map(image => {
    const frame = image.parentElement;
    const style = getComputedStyle(frame);
    return {
      src: image.getAttribute('src'),
      height: image.clientHeight,
      maxHeight: frame.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom),
      width: image.clientWidth,
      maxWidth: frame.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
    };
  }));
  for (const image of venueImages) {
    check(image.width <= image.maxWidth + 1 && image.height <= image.maxHeight + 1,
      `${width}: full venue illustration clipped by its frame ${JSON.stringify(image)}`);
  }
  await page.evaluate(() => { document.activeElement?.blur(); scrollTo({ top: 0, behavior: 'instant' }); });
  await page.screenshot({ path: path.join(output, `page-${width}.png`), fullPage: true });
  for (const selector of ['.welcome', '.venues-intro', '.story-framed', '.gift-section', '.timeline-section']) {
    await page.locator(selector).evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.waitForTimeout(50);
    await page.locator(selector).screenshot({ path: path.join(output, `${selector.slice(1)}-${width}.png`) });
  }

  const faq = page.locator('#faq-list summary').nth(1);
  await faq.focus();
  await page.keyboard.press('Enter');
  check(await faq.evaluate(element => element.parentElement.open), `${width}: FAQ keyboard opening failed`);
  await page.keyboard.press('Enter');
  check(await faq.evaluate(element => !element.parentElement.open), `${width}: FAQ keyboard closing failed`);

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#save-date').click();
  const calendarDownload = await downloadPromise;
  check(calendarDownload.suggestedFilename() === 'Unsere-Hochzeit.ics', `${width}: calendar download missing`);
  const calendarPath = await calendarDownload.path();
  const calendar = fs.readFileSync(calendarPath, 'utf8').replace(/\r\n /g, '');
  check(calendar.includes('BEGIN:VEVENT') && calendar.includes('SUMMARY:Hochzeit von ' + currentConfig.names.join(' & ')),
    `${width}: calendar omits invitation event`);

  const trigger = page.locator('[data-rsvp]').first();
  await trigger.click();
  await page.locator('#rsvp-dialog').waitFor({ state: 'visible' });
  const dialogBox = await page.locator('#rsvp-dialog').boundingBox();
  check(dialogBox.x >= 0 && dialogBox.x + dialogBox.width <= width + 1, `${width}: RSVP dialog outside viewport`);
  check(dialogBox.height <= height * .91, `${width}: RSVP dialog exceeds viewport height`);
  await page.locator('#rsvp-form input[name=names]').fill('Testgäste QA');
  await page.locator('#rsvp-form textarea').fill('Reine lokale Funktionsprüfung.');
  if (!await page.evaluate(() => window.WEDDING.rsvpEmail)) {
    await page.locator('#rsvp-form button[type=submit]').click();
    check((await page.locator('#rsvp-result').textContent()).includes('keine Antwort'), `${width}: preview RSVP incorrectly claims delivery`);
  }
  await page.keyboard.press('Escape');
  await page.locator('#rsvp-dialog').waitFor({ state: 'hidden' });
  await page.waitForFunction(() => document.activeElement === document.querySelector('[data-rsvp]'));
  check(await trigger.evaluate(element => document.activeElement === element), `${width}: RSVP focus restoration failed`);

  const photo = page.locator('.photo-main [data-photo]');
  await photo.scrollIntoViewIfNeeded();
  await photo.focus();
  await page.waitForFunction(() => document.activeElement === document.querySelector('.photo-main [data-photo]'));
  await page.keyboard.press('Enter');
  await page.locator('#photo-dialog').waitFor({ state: 'visible' });
  await page.locator('#large-photo').evaluate(image => image.decode());
  const largeBox = await page.locator('#photo-dialog').boundingBox();
  check(largeBox.x >= 0 && largeBox.x + largeBox.width <= width + 1, `${width}: photo dialog outside viewport`);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement === document.querySelector('.photo-main [data-photo]'));
  check(await photo.evaluate(element => document.activeElement === element), `${width}: photo focus restoration failed`);
  await overflow(page, `${width} dialogs complete`);
  await page.locator('#replay').click();
  await page.locator('#opening').waitFor({ state: 'visible' });
  check(await page.evaluate(() => scrollY === 0), `${width}: replay does not reveal top scene`);
  await page.keyboard.press('Escape');
  await page.locator('#opening').waitFor({ state: 'hidden', timeout: 5000 });
  check(errors.length === 0, `${width}: browser errors ${errors.join('; ')}`);
  results.push({ width, height, centerColors: diversity, ornaments: ornaments.length, heroPlacement, panels,
    timelineIcons, fallbackVisibility, errors });
  console.log(`${failures.length === startingFailures ? 'PASS' : 'FAIL'} viewport ${width}×${height}: opener, art, overflow, keyboard, dialogs, replay`);
  await context.close();
}

async function reducedMotion(browser, baseURL) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  const start = Date.now();
  await page.locator('#open-invitation').click();
  await page.locator('#opening').waitFor({ state: 'hidden', timeout: 1500 });
  check(Date.now() - start < 1500, 'Reduced motion keeps the long opening animation');
  const animations = await page.evaluate(() => [...document.querySelectorAll('.garden-frame,.hero-copy,.panel-copy,.hero-discover span')]
    .map(element => ({ selector: element.className, animation: getComputedStyle(element).animationName, transition: getComputedStyle(element).transitionDuration })));
  check(animations.every(style => style.animation === 'none' && style.transition === '0s'), 'Reduced motion has active decorative animations');
  await page.locator('#willkommen').scrollIntoViewIfNeeded();
  check(await page.locator('.welcome-copy').evaluate(element => Number(getComputedStyle(element).opacity) === 1), 'Reduced motion hides revealed content');
  await overflow(page, 'reduced motion');
  await page.screenshot({ path: path.join(output, 'reduced-motion-390.png') });
  results.push({ reducedMotion: true });
  console.log('PASS reduced motion: immediate opening and visible static content');
  await context.close();
}

(async () => {
  let server;
  let baseURL = process.env.INVITATION_QA_URL;
  if (!baseURL) {
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
    server = http.createServer((request, response) => {
      const filename = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname === '/' ? '/index.html' : new URL(request.url, 'http://localhost').pathname));
      if (!filename.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
      fs.readFile(filename, (error, data) => {
        response.writeHead(error ? 404 : 200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream' });
        response.end(error ? 'Not found' : data);
      });
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    baseURL = `http://127.0.0.1:${server.address().port}/`;
  }
  const browser = await playwright.chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const widths = (process.env.INVITATION_QA_WIDTHS || '320,390,700,1100,1440')
      .split(',').map(Number).filter(width => Number.isFinite(width) && width >= 200);
    for (const width of widths) {
      try { await exerciseViewport(browser, baseURL, width); }
      catch (error) { failures.push(`${width}: ${error.stack}`); }
    }
    if (process.env.INVITATION_QA_REDUCED !== '0') {
      try { await reducedMotion(browser, baseURL); }
      catch (error) { failures.push(`reduced motion: ${error.stack}`); }
    }
  } finally {
    await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ results, failures }, null, 2));
  if (failures.length) {
    console.error('FAILURES:\n' + failures.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`All visual/interaction checks passed. Screenshots: ${output}`);
  }
})();
