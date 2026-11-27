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
const requiredArt = ['welcome-border.webp', 'curtain-navy.webp',
  'farewell-swans-blue.webp', 'stitched-sprig-blue.webp', 'gift-bow-blue.webp',
  'countdown-navy.webp', 'timeline-blue.webp', 'mago-flow.webp', 'church-edition.webp', 'linen-ivory.webp'];
const missing = requiredArt.filter(file => !fs.existsSync(path.join(root, 'assets/loom', file)));
for (const file of ['linen-navy.webp', 'seal-relief-ms.webp']) {
  if (!fs.existsSync(path.join(root, 'assets/art', file))) missing.push('assets/art/' + file);
}
if (missing.length) {
  console.error('WAITING FOR ART: ' + missing.join(', '));
  process.exit(2);
}
fs.mkdirSync(output, { recursive: true });

const failures = [];
const results = [];
function check(value, message) {
  if (!value) { failures.push(message); console.error('CHECK FAILED: ' + message); }
}
// Decorative scenes have one home; the same curtain is reflected at the two frame edges.
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const artSources = [...source.matchAll(/<img\b[^>]*\bsrc=["'](assets\/(?:loom|art)\/[^"']+)["']/g)]
  .map(match => match[1]);
const sourceCounts = new Map();
artSources.forEach(src => sourceCounts.set(src, (sourceCounts.get(src) || 0) + 1));
for (const [src, count] of sourceCounts) {
  check(count === (src === 'assets/loom/curtain-navy.webp' ? 2 : 1),
    `Static markup repeats a decorative scene: ${src} appears ${count} times`);
}
for (const file of ['welcome-border.webp', 'countdown-navy.webp', 'farewell-swans-blue.webp', 'stitched-sprig-blue.webp', 'gift-bow-blue.webp']) {
  check(sourceCounts.get('assets/loom/' + file) === 1, `Missing unique textile scene: ${file}`);
}
// Guests' own information stays intact; the requested Dresscode is removed,
// and uploaded personal photos may replace the two existing story photographs.
function readConfig(code) {
  const context = { window: {} };
  vm.runInNewContext(code, context);
  return JSON.parse(JSON.stringify(context.window.WEDDING));
}
const currentConfig = readConfig(fs.readFileSync(path.join(root, 'wedding-config.js'), 'utf8'));
const previous = spawnSync('git', ['show', 'HEAD:wedding-config.js'], { cwd: root, encoding: 'utf8' });
if (previous.status === 0) {
  const baseline = readConfig(previous.stdout);
  baseline.photos = currentConfig.photos;
  baseline.scheduleConfirmed = currentConfig.scheduleConfirmed;
  baseline.details = baseline.details.filter(detail => !/dresscode|was ziehen wir an/i.test(detail.title));
  check(isDeepStrictEqual(baseline, currentConfig), 'Invitation inputs changed beyond schedule confirmation status, Dresscode removal and requested photographic/illustrated assets');
}
check(!currentConfig.details.some(detail => /dresscode|was ziehen wir an/i.test(detail.title)), 'Dresscode remains in the invitation configuration');
check(!/class=["'][^"']*\bdresscode\b/i.test(source), 'Dresscode section remains in the markup');
async function overflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  check(dimensions.document <= dimensions.viewport + 1 && dimensions.body <= dimensions.viewport + 1,
    `${label}: horizontal overflow ${JSON.stringify(dimensions)}`);
}
async function navyText(page, selector, label) {
  const mismatches = await page.locator(selector).evaluateAll(roots => roots.flatMap(root => [root, ...root.querySelectorAll('*')])
    .filter(element => element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0
      && [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()))
    .map(element => ({ text: element.textContent.trim().slice(0, 60), color: getComputedStyle(element).color }))
    .filter(element => element.color !== 'rgb(20, 38, 62)'));
  check(mismatches.length === 0, `${label}: interior text is not navy ${JSON.stringify(mismatches)}`);
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
  const cover = await page.locator('#opening').evaluate(opening => {
    const visible = element => !!element && getComputedStyle(element).display !== 'none'
      && getComputedStyle(element).visibility !== 'hidden' && element.getBoundingClientRect().width > 0;
    const focusable = [...opening.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')]
      .filter(element => !element.disabled && element.tabIndex >= 0 && element.getBoundingClientRect().width > 0);
    const stamped = opening.querySelector('img.seal-stamped'), blank = opening.querySelector('img.seal-blank');
    const monogram = opening.querySelector('.seal-monogram');
    return { text: opening.innerText.replace(/\s+/g, ''), expected: window.WEDDING.names.map(name => [...name.trim()][0]).join('&'),
      buttons: [...opening.querySelectorAll('button')].map(button => button.id), focusable: focusable.map(element => element.id),
      sealTag: opening.querySelector('#open-invitation')?.tagName,
      seal: stamped?.getAttribute('src'), sealAlt: stamped?.getAttribute('alt'),
      stampedVisible: visible(stamped), blankVisible: visible(blank), monogramVisible: visible(monogram),
      linen: getComputedStyle(opening.querySelector('.door-face')).backgroundImage,
      removed: opening.querySelectorAll('#open-text,.opening-note,.opening-bottom').length };
  });
  check(cover.text === '' && cover.removed === 0, `${width}: stamped cover contains extra text or old opening content ${JSON.stringify(cover)}`);
  check(cover.sealTag === 'BUTTON' && cover.buttons.length === 1 && cover.buttons[0] === 'open-invitation'
    && cover.focusable.length === 1 && cover.focusable[0] === 'open-invitation', `${width}: seal is not the only cover control ${JSON.stringify(cover)}`);
  check(cover.seal?.endsWith('seal-relief-ms.webp') && cover.sealAlt === '' && cover.stampedVisible
    && !cover.blankVisible && !cover.monogramVisible && cover.linen.includes('assets/art/linen-navy.webp'),
    `${width}: centered relief seal is missing or doubled ${JSON.stringify(cover)}`);
  check(await page.evaluate(() => document.activeElement.id === 'opening'), `${width}: initial cover focus should avoid a seal halo`);
  await page.screenshot({ path: path.join(output, `closed-${width}.png`) });
  await page.keyboard.press('Tab');
  check(await page.evaluate(() => document.activeElement.id === 'open-invitation'), `${width}: first opening keyboard stop is wrong`);
  await page.keyboard.press('Shift+Tab');
  check(await page.evaluate(() => document.activeElement.id === 'open-invitation'), `${width}: opening reverse focus trap leaves the seal`);
  await page.locator('#opening').focus();
  await page.keyboard.press('Shift+Tab');
  check(await page.evaluate(() => document.activeElement.id === 'open-invitation'), `${width}: reverse keyboard entry misses the seal`);
  await page.keyboard.press('Tab');
  check(await page.evaluate(() => document.activeElement.id === 'open-invitation'), `${width}: opening forward focus trap leaves the seal`);
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelector('#opening').classList.contains('is-opening'));
  await page.waitForTimeout(1550);
  const mid = await page.evaluate(() => {
    const hero = document.querySelector('.hero');
    const images = [...hero.querySelectorAll('img')];
    const copy = document.querySelector('.hero-copy');
    const pseudo = getComputedStyle(document.body, '::after');
    return {
      scrollY: window.scrollY,
      y: hero.getBoundingClientRect().top,
      loaded: images.length === 2 && images.every(image => image.matches('.hero-curtain') && image.complete && image.naturalWidth > 0),
      sources: images.map(image => image.currentSrc),
      opacity: Number(getComputedStyle(copy).opacity),
      pseudoContent: pseudo.content,
      pseudoBackground: pseudo.backgroundColor,
      leftTransform: getComputedStyle(document.querySelector('.gate-left')).transform,
    };
  });
  const midFile = path.join(output, `opening-${width}.png`);
  await page.screenshot({ path: midFile });
  const diversity = centerDiversity(midFile);
  check(mid.scrollY === 0 && mid.y >= 0 && mid.y < 50 && mid.loaded && mid.opacity > .7, `${width}: live first scene missing during opening ${JSON.stringify(mid)}`);
  check(mid.sources.every(source => source.includes('assets/loom/curtain-navy.webp')), `${width}: opening contains another illustration ${JSON.stringify(mid.sources)}`);
  check(mid.pseudoContent === 'none' || mid.pseudoBackground === 'rgba(0, 0, 0, 0)', `${width}: opaque page pseudo-element covers opener`);
  await page.locator('#opening').waitFor({ state: 'hidden', timeout: 5000 });
  check(await page.evaluate(() => !document.querySelector('main').inert), `${width}: page stays inert after opening`);
  check(await page.evaluate(() => document.activeElement.id === 'hero-title'), `${width}: focus not restored to first scene heading`);
  const copyBox = await page.locator('.hero-copy').boundingBox();
  const heroBox = await page.locator('.hero').boundingBox();
  check(copyBox.y + copyBox.height <= heroBox.y + heroBox.height - 20, `${width}: opening copy clips below hero`);
  const heroPlacement = await page.evaluate(() => {
    const hero = document.querySelector('.hero'), box = hero.getBoundingClientRect();
    const title = hero.querySelector('#hero-title').getBoundingClientRect();
    const date = hero.querySelector('.hero-date').getBoundingClientRect();
    const discover = hero.querySelector('.hero-discover').getBoundingClientRect();
    const text = hero.querySelector('.hero-copy').textContent.replace(/\s+/g, '');
    const expected = (window.WEDDING.names.join('&') + window.WEDDING.dateLabel).replace(/\s+/g, '');
    return { images: hero.querySelectorAll('img').length, removedChurch: hero.querySelectorAll('picture,.garden-frame').length === 0,
      removedRegion: hero.querySelectorAll('.hero-place,[data-bind="region"]').length === 0,
      text, expected, dateAfterTitle: date.top >= title.bottom - 1, discoverAfterDate: discover.top >= date.bottom + 8,
      textContained: [title, date, discover].every(rect => rect.left >= box.left - 1 && rect.right <= box.right + 1
        && rect.top >= box.top - 1 && rect.bottom <= box.bottom + 1) };
  });
  check(heroPlacement.images === 2 && heroPlacement.removedChurch && heroPlacement.removedRegion
    && heroPlacement.text === heroPlacement.expected, `${width}: simplified opening retains a church, region, or unexpected content ${JSON.stringify(heroPlacement)}`);
  check(heroPlacement.dateAfterTitle && heroPlacement.discoverAfterDate && heroPlacement.textContained,
    `${width}: simplified opening text overlaps or clips ${JSON.stringify(heroPlacement)}`);
  const linenFlow = await page.evaluate(() => {
    const main = document.querySelector('main');
    const mainBox = main.getBoundingClientRect();
    const hero = document.querySelector('.hero');
    const heroBox = hero.getBoundingClientRect();
    const layers = [document.body, main, document.querySelector('.invitation-sheet')].filter(Boolean).flatMap(element => [null, '::before', '::after'].map(pseudo => {
      const style = getComputedStyle(element, pseudo);
      return { element: element.tagName, pseudo, image: style.backgroundImage };
    }));
    const sections = [...document.querySelectorAll('.hero,.site-header,.welcome,.date-section,#orte,.story,.timeline-section,.details,.gift-section,.rsvp-section,footer')]
      .map(element => ({ element: element.className || element.tagName, background: getComputedStyle(element).backgroundColor,
        image: getComputedStyle(element).backgroundImage }));
    const panels = [...document.querySelectorAll('.textile-panel')].map(panel => {
      const box = panel.getBoundingClientRect();
      return { class: panel.className, left: box.left, width: box.width };
    });
    return { main: { left: mainBox.left, width: mainBox.width }, hero: { left: heroBox.left, width: heroBox.width },
      layers, sections, panels,
      dresscodeText: /dresscode|was ziehen wir an/i.test(main.innerText), dresscodeNodes: document.querySelectorAll('.dresscode,#dresscode-title').length };
  });
  check(Math.abs(linenFlow.hero.left-linenFlow.main.left) <= 1 && Math.abs(linenFlow.hero.width-linenFlow.main.width) <= 1,
    `${width}: opening and scrolling canvas have different widths ${JSON.stringify(linenFlow)}`);
  const border = await page.locator('.invitation-border').evaluate(element => {
    const frame = element.getBoundingClientRect();
    const main = document.querySelector('main').getBoundingClientRect();
    const footer = document.querySelector('footer').getBoundingClientRect();
    return {
      enclosesInvitation: frame.top < main.top && frame.left < main.left &&
        frame.right > main.right && frame.bottom > footer.bottom,
      lines: [getComputedStyle(element).borderTopStyle, getComputedStyle(element, '::before').borderTopStyle],
      pearls: element.children.length,
      decorative: element.getAttribute('aria-hidden') === 'true' && getComputedStyle(element).pointerEvents === 'none',
    };
  });
  check(border.enclosesInvitation && border.lines.every(line => line === 'solid') && border.pearls === 4 && border.decorative,
    `${width}: double border and corner pearls do not enclose the invitation ${JSON.stringify(border)}`);
  for (const panel of linenFlow.panels) {
    check(Math.abs(panel.left-linenFlow.main.left) <= 1 && Math.abs(panel.width-linenFlow.main.width) <= 1,
      `${width}: textile scene has a segmented width ${JSON.stringify(panel)}`);
  }
  check(linenFlow.layers.some(layer => /url\(/.test(layer.image)), `${width}: no shared linen texture on the invitation canvas`);
  for (const section of linenFlow.sections) {
    check(section.background === 'rgba(0, 0, 0, 0)' && section.image === 'none',
      `${width}: a scrolling section covers the continuous linen canvas ${JSON.stringify(section)}`);
  }
  check(!linenFlow.dresscodeText && linenFlow.dresscodeNodes === 0, `${width}: Dresscode still shown to guests`);
  if (width <= 700) {
    check(await page.locator('.site-header nav a').evaluateAll(links => links.length > 0 && links.every(link => link.getBoundingClientRect().width > 0)),
      `${width}: invitation navigation is hidden on mobile`);
  }
  if (!currentConfig.scheduleConfirmed) {
    check(await page.locator('main').evaluate(main => /vorläufig/i.test(main.innerText)), `${width}: provisional schedule has no visible label`);
  }
  await navyText(page, 'main,footer', `${width} invitation`);
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: path.join(output, `opened-${width}.png`) });
  await page.locator('.hero').screenshot({ path: path.join(output, `hero-${width}.png`) });

  // Scroll each real section to exercise lazy loading, reveal animation, and layout.
  for (const selector of ['#willkommen', '#datum', '.venues-intro', '.venue-grid',
    '.story-framed', '.story-photos', '#unser-tag', '#gut-zu-wissen', '.gift-section', '#rueckmeldung', 'footer']) {
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
      .map(image => {
        // The guest scroll above exercises lazy loading; resolve offscreen art for the full-page capture too.
        image.loading = 'eager';
        return image.decode().catch(() => {});
      }));
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
  const venueChurch = await page.locator('#orte [data-photo="church"]').evaluate(image => ({
    visible: !image.hidden && image.getBoundingClientRect().width > 0,
    loaded: image.complete && image.naturalWidth > 0, source: image.getAttribute('src'),
  }));
  check(venueChurch.visible && venueChurch.loaded && venueChurch.source === currentConfig.photos.church,
    `${width}: church illustration is missing from its venue section ${JSON.stringify(venueChurch)}`);
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
  }
  const sceneDetails = await page.evaluate(() => {
    const frame = document.querySelector('.invitation-border').getBoundingClientRect();
    const curtains = [...document.querySelectorAll('.hero-curtain')].map(image => {
      const box = image.getBoundingClientRect(), style = getComputedStyle(image);
      const scale = Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight);
      const paintedWidth = image.naturalWidth * scale, paintedHeight = image.naturalHeight * scale;
      const mirrored = style.transform !== 'none' && new DOMMatrixReadOnly(style.transform).a < 0;
      return { src: image.getAttribute('src'), fit: style.objectFit, position: style.objectPosition,
        naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, paintedWidth, paintedHeight, mirrored,
        topOffset: box.top - frame.top,
        edgeOffset: mirrored ? frame.right - box.right : box.left - frame.left };
    });
    const welcomeArt = document.querySelector('.welcome-border').getBoundingClientRect();
    const welcomeCopy = document.querySelector('.welcome-copy').getBoundingClientRect();
    const countdown = document.querySelector('.countdown'), image = countdown.querySelector('img');
    const circle = image.getBoundingClientRect(), area = countdown.getBoundingClientRect();
    const number = document.querySelector('#count-days').getBoundingClientRect();
    const localDate = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: window.WEDDING.calendar.timezone || 'Europe/Berlin',
      year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
      .filter(part => ['year', 'month', 'day'].includes(part.type)).map(part => [part.type, Number(part.value)]));
    const [year, month, day] = window.WEDDING.date.split('-').map(Number);
    const remainingDays = Math.max(0, Math.round((Date.UTC(year, month - 1, day)
      - Date.UTC(localDate.year, localDate.month - 1, localDate.day)) / 86400000));
    return { curtains, welcomeGap: welcomeCopy.top - welcomeArt.bottom,
      countdown: { images: countdown.querySelectorAll('img').length,
        obsolete: document.querySelectorAll('#count-hours,#count-minutes').length,
        text: countdown.textContent.trim(), label: document.querySelector('#count-days-label')?.textContent.trim(),
        days: Number(document.querySelector('#count-days').textContent), expectedDays: remainingDays,
        imageCenter: circle.left + circle.width / 2, areaCenter: area.left + area.width / 2,
        numberCenter: number.left + number.width / 2,
        numberContained: number.left >= circle.left && number.right <= circle.right
          && number.top >= circle.top && number.bottom <= circle.bottom } };
  });
  check(sceneDetails.curtains.length === 2 && sceneDetails.curtains.every(curtain =>
    curtain.src.endsWith('curtain-navy.webp') && curtain.fit === 'contain' && curtain.position === '0% 0%'
      && curtain.naturalWidth > 0 && curtain.naturalHeight > 0
      && Math.abs(curtain.topOffset - 5) <= 1 && Math.abs(curtain.edgeOffset - 5) <= 1)
    && sceneDetails.curtains[0].mirrored !== sceneDetails.curtains[1].mirrored
    && Math.abs(sceneDetails.curtains[0].paintedWidth - sceneDetails.curtains[1].paintedWidth) <= 1
    && Math.abs(sceneDetails.curtains[0].paintedHeight - sceneDetails.curtains[1].paintedHeight) <= 1,
    `${width}: curtains do not meet the frame or keep their proportions ${JSON.stringify(sceneDetails.curtains)}`);
  check(sceneDetails.welcomeGap >= -1, `${width}: welcome ornament covers the message (${sceneDetails.welcomeGap}px gap)`);
  const dayCounter = sceneDetails.countdown;
  check(dayCounter.images === 1 && dayCounter.obsolete === 0 && !/stund|minut/i.test(dayCounter.text)
    && /^tage?$/i.test(dayCounter.label || '') && dayCounter.days === dayCounter.expectedDays,
    `${width}: countdown must show only the remaining local calendar days ${JSON.stringify(dayCounter)}`);
  check(Math.abs(dayCounter.imageCenter - dayCounter.areaCenter) <= 1
    && Math.abs(dayCounter.numberCenter - dayCounter.imageCenter) <= 1 && dayCounter.numberContained,
    `${width}: single day medallion is not centered or clips its number ${JSON.stringify(dayCounter)}`);
  const textBindings = await page.evaluate(() => {
    const get = key => key.split('.').reduce((value, part) => value?.[part], window.WEDDING);
    const mismatches = [...document.querySelectorAll('[data-bind]')].filter(element => element.textContent !== String(get(element.dataset.bind) ?? ''))
      .map(element => element.dataset.bind);
    for (const element of document.querySelectorAll('[data-detail-title],[data-detail-text]')) {
      const title = element.hasAttribute('data-detail-title');
      const index = Number(element.getAttribute(title ? 'data-detail-title' : 'data-detail-text'));
      const expected = window.WEDDING.details[index]?.[title ? 'title' : 'text'] ?? '';
      if (element.textContent !== expected) mismatches.push(`details.${index}.${title ? 'title' : 'text'}`);
    }
    const renderedTitles = [...document.querySelectorAll('main [data-detail-title],#faq-list summary')].map(element => element.textContent.trim());
    for (const detail of window.WEDDING.details) {
      if (renderedTitles.filter(title => title === detail.title).length !== 1) mismatches.push(`details title ${detail.title} missing or duplicated`);
    }
    return mismatches;
  });
  check(textBindings.length === 0, `${width}: missing or changed invitation text ${textBindings.join(', ')}`);
  const farewell = await page.evaluate(() => {
    const artwork = [...document.querySelectorAll('img')].filter(image => image.matches('[data-farewell-art],.farewell-art') || /swans|swan|schwaene|schwan|farewell/i.test(image.getAttribute('src') || ''));
    const rsvp = document.querySelector('#rueckmeldung').getBoundingClientRect();
    return artwork.map(image => ({ src: image.getAttribute('src'), footer: !!image.closest('footer'),
      top: image.getBoundingClientRect().top, rsvpBottom: rsvp.bottom, loaded: image.complete && image.naturalWidth > 0,
      lastScene: image.closest('footer')?.parentElement?.lastElementChild === image.closest('footer') }));
  });
  check(farewell.length === 1, `${width}: swans must have one farewell home, found ${farewell.length}`);
  for (const image of farewell) {
    check(image.footer && image.top >= image.rsvpBottom - 1 && image.loaded && image.lastScene,
      `${width}: swans are not the final farewell after RSVP ${JSON.stringify(image)}`);
  }
  const timelineIcons = await page.evaluate(() => [...document.querySelectorAll('.timeline-icon')].map(icon => {
    const style = getComputedStyle(icon), box = icon.getBoundingClientRect();
    return { icon: icon.dataset.icon, position: style.backgroundPosition, source: style.backgroundImage,
      ratio: box.width/box.height, overlays: icon.querySelectorAll('svg,img').length };
  }));
  check(new Set(timelineIcons.map(icon => icon.position)).size === timelineIcons.length,
    `${width}: timeline repeats a sprite cell`);
  for (const icon of timelineIcons) {
    check(icon.source.includes('timeline-blue.webp') && Math.abs(icon.ratio-2/3) < .01 && icon.overlays === 0,
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
  for (const [selector, filename] of [['.welcome', 'welcome'], ['#datum', 'countdown'], ['.venues-intro', 'venues-intro'],
    ['.venue-grid', 'locations'], ['.story-framed', 'story-framed'], ['.story-photos', 'photos'],
    ['.gift-section', 'gift-section'], ['.timeline-section', 'timeline-section'], ['footer', 'farewell']]) {
    await page.locator(selector).evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.waitForTimeout(50);
    await page.locator(selector).screenshot({ path: path.join(output, `${filename}-${width}.png`) });
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
  if (!currentConfig.scheduleConfirmed) {
    const date = currentConfig.date.replaceAll('-', '');
    const followingDay = new Date(Date.parse(currentConfig.date + 'T12:00:00Z') + 86400000).toISOString().slice(0, 10).replaceAll('-', '');
    check(calendar.includes('DTSTART;VALUE=DATE:' + date) && calendar.includes('DTEND;VALUE=DATE:' + followingDay)
      && !/DTSTART:\d{8}T/.test(calendar), `${width}: provisional schedule exports an unconfirmed calendar time`);
  }

  const trigger = page.locator('[data-rsvp]').first();
  await trigger.click();
  await page.locator('#rsvp-dialog').waitFor({ state: 'visible' });
  const dialogBox = await page.locator('#rsvp-dialog').boundingBox();
  check(dialogBox.x >= 0 && dialogBox.x + dialogBox.width <= width + 1, `${width}: RSVP dialog outside viewport`);
  check(dialogBox.height <= height * .91, `${width}: RSVP dialog exceeds viewport height`);
  await navyText(page, '#rsvp-dialog', `${width} RSVP dialog`);
  if (!await page.evaluate(() => window.WEDDING.rsvpEmail)) {
    check(!await page.locator('#rsvp-form').isVisible(), `${width}: unconfigured RSVP asks guests to fill a form`);
    check(await page.locator('#rsvp-note').isVisible() && (await page.locator('#rsvp-note').textContent()).trim().length > 0,
      `${width}: unconfigured RSVP omits its status message`);
  } else {
    await page.locator('#rsvp-form input[name=names]').fill('Testgäste QA');
    await page.locator('#rsvp-form textarea').fill('Reine lokale Funktionsprüfung.');
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
  await page.waitForFunction(() => scrollY === 0, null, { timeout: 1000 });
  check(await page.evaluate(() => scrollY === 0), `${width}: replay does not reveal top scene`);
  await page.keyboard.press('Escape');
  await page.locator('#opening').waitFor({ state: 'hidden', timeout: 5000 });
  check(errors.length === 0, `${width}: browser errors ${errors.join('; ')}`);
  results.push({ width, height, centerColors: diversity, ornaments: ornaments.length, cover, heroPlacement, linenFlow, panels, sceneDetails,
    farewell, timelineIcons, fallbackVisibility, errors });
  console.log(`${failures.length === startingFailures ? 'PASS' : 'FAIL'} viewport ${width}×${height}: continuous linen, equal widths, farewell swans, opener, art, keyboard, dialogs`);
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
