const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const path = require('path');
const fs   = require('fs');

const DIR   = __dirname;
const OUT   = path.join(DIR, 'proposta-simon.pdf');
const W     = 430;
const H     = 932;
const SCALE = 2;

async function screenshot(page, filePath, opts = {}) {
  await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });
  await page.goto('file:///' + filePath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 900));

  if (opts.fullHeight) {
    const h = await page.evaluate(() => document.body.scrollHeight);
    await page.setViewport({ width: W, height: h, deviceScaleFactor: SCALE });
    await new Promise(r => setTimeout(r, 300));
  }

  return page.screenshot({ type: 'png', fullPage: !!opts.fullHeight });
}

async function screenshotTab(page, filePath, tabId) {
  await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });
  await page.goto('file:///' + filePath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 800));

  // Activate tab, hide tab buttons, measure full content height
  await page.evaluate((id) => {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('tab-' + id).classList.add('active');
    // Hide tab buttons — not needed since cover page handles navigation
    const tabsBar = document.querySelector('.tabs');
    if (tabsBar) tabsBar.style.display = 'none';
  }, tabId);

  await new Promise(r => setTimeout(r, 400));

  const fullH = await page.evaluate((id) => {
    const header = document.querySelector('.header');
    const panel  = document.getElementById('tab-' + id);
    const footer = document.querySelector('.footer');
    return header.offsetHeight + 32
         + panel.scrollHeight  + footer.offsetHeight + 48;
  }, tabId);

  await page.setViewport({ width: W, height: Math.ceil(fullH), deviceScaleFactor: SCALE });
  await new Promise(r => setTimeout(r, 300));

  return page.screenshot({ type: 'png', fullPage: false });
}

// --- Button bounding boxes on the cover page (in px at 1x scale) ---
// These match the 3 .nav-card positions in capa-navegacao.html
// We'll measure them at runtime
async function getCardBounds(page) {
  return page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.nav-card'));
    return cards.map(c => {
      const r = c.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    });
  });
}

(async () => {
  console.log('Iniciando geração do PDF...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page    = await browser.newPage();

  // 1. Cover page screenshot + button bounds
  const capaFile = path.join(DIR, 'capa-navegacao.html');
  await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });
  await page.goto('file:///' + capaFile.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 900));
  const cardBounds = await getCardBounds(page);
  const capaBuf    = await page.screenshot({ type: 'png', fullPage: false });
  console.log('✓ Capa capturada');

  // 2. Tab screenshots
  const proposalFile = path.join(DIR, 'proposta-simon.html');
  const quartzo   = await screenshotTab(page, proposalFile, 'quartzo');   console.log('✓ Quartzo');
  const rockinrio = await screenshotTab(page, proposalFile, 'rockinrio'); console.log('✓ Rock in Rio');
  const pacote    = await screenshotTab(page, proposalFile, 'pacote');    console.log('✓ Pacote Final');

  await browser.close();

  // 3. Build PDF with pdf-lib
  const pdfDoc = await PDFDocument.create();

  async function addImagePage(buf, label) {
    const img    = await pdfDoc.embedPng(buf);
    const { width: imgW, height: imgH } = img;
    // Keep aspect ratio, fit to A4-ish width
    const pdfW = imgW / SCALE;
    const pdfH = imgH / SCALE;
    const pdfPage = pdfDoc.addPage([pdfW, pdfH]);
    pdfPage.drawImage(img, { x: 0, y: 0, width: pdfW, height: pdfH });
    console.log(`  + Página: ${label} (${Math.round(pdfW)}×${Math.round(pdfH)}px)`);
    return { page: pdfPage, w: pdfW, h: pdfH };
  }

  const capa = await addImagePage(capaBuf,   'Capa');
  await addImagePage(quartzo,   'Quartzo');
  await addImagePage(rockinrio, 'Rock in Rio');
  await addImagePage(pacote,    'Pacote Final');

  // 4. Add GoTo link annotations on cover page
  const pages = pdfDoc.getPages();
  // page index: 0=capa, 1=quartzo, 2=rockinrio, 3=pacote
  const targets = [1, 2, 3]; // page indices for each card button

  cardBounds.forEach((b, i) => {
    const targetPage = pages[targets[i]];
    const capaPage   = pages[0];
    const capaH      = capa.h;

    // Convert screen coords to PDF coords (PDF origin is bottom-left)
    const x  = b.x;
    const y  = capaH - (b.y + b.h); // flip Y
    const bw = b.w;
    const bh = b.h;

    capaPage.doc; // ensure loaded

    // Use pdf-lib's low-level annotation API
    const { PDFName, PDFArray, PDFNumber, PDFDict, PDFRef } = require('pdf-lib');

    const targetRef  = pdfDoc.context.getObjectRef(targetPage.ref);
    const destArray  = pdfDoc.context.obj([targetPage.ref, PDFName.of('XYZ'), PDFNumber.of(0), PDFNumber.of(targetPage.getSize().height), PDFNumber.of(0)]);
    const action     = pdfDoc.context.obj({ Type: PDFName.of('Action'), S: PDFName.of('GoTo'), D: destArray });
    const borderArr  = pdfDoc.context.obj([0, 0, 0]);
    const rect       = pdfDoc.context.obj([PDFNumber.of(x), PDFNumber.of(y), PDFNumber.of(x + bw), PDFNumber.of(y + bh)]);

    const annot = pdfDoc.context.obj({
      Type:    PDFName.of('Annot'),
      Subtype: PDFName.of('Link'),
      F:       PDFNumber.of(4),
      Rect:    rect,
      Border:  borderArr,
      A:       action,
    });

    const annotRef = pdfDoc.context.register(annot);

    const existing = capaPage.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
    if (existing) {
      existing.push(annotRef);
    } else {
      capaPage.node.set(PDFName.of('Annots'), pdfDoc.context.obj([annotRef]));
    }
  });

  // 5. Save
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(OUT, pdfBytes);
  console.log('\n✅ PDF gerado com navegação:', OUT);
})();
