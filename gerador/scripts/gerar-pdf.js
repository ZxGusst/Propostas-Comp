// gerar-pdf.js — adapte as linhas marcadas com ← ADAPTAR para cada cliente
const puppeteer = require('puppeteer');
const { PDFDocument, PDFName, PDFNumber, PDFArray } = require('pdf-lib');
const path = require('path');
const fs   = require('fs');

const DIR   = __dirname;
const OUT   = path.join(DIR, 'proposta-[cliente].pdf'); // ← ADAPTAR
const W     = 430;
const H     = 932;
const SCALE = 2;

// ← ADAPTAR: ids dos tab-panels e labels para o console
const TABS = [
  { id: 'op01',   label: 'Operação 01' },
  { id: 'op02',   label: 'Operação 02' },
  { id: 'pacote', label: 'Pacote Final' },
];

async function screenshotTab(page, filePath, tabId) {
  await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });
  await page.goto('file:///' + filePath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate((id) => {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('tab-' + id).classList.add('active');
    const tabsBar = document.querySelector('.tabs');
    if (tabsBar) tabsBar.style.display = 'none';
  }, tabId);

  await new Promise(r => setTimeout(r, 400));

  const fullH = await page.evaluate((id) => {
    const header = document.querySelector('.header');
    const panel  = document.getElementById('tab-' + id);
    const footer = document.querySelector('.footer');
    return header.offsetHeight + 32 + panel.scrollHeight + footer.offsetHeight + 48;
  }, tabId);

  await page.setViewport({ width: W, height: Math.ceil(fullH), deviceScaleFactor: SCALE });
  await new Promise(r => setTimeout(r, 300));
  return page.screenshot({ type: 'png', fullPage: false });
}

async function getCardBounds(page) {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('.nav-card')).map(c => {
      const r = c.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    });
  });
}

(async () => {
  console.log('Gerando PDF...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page    = await browser.newPage();

  // 1. Capa
  const capaFile = path.join(DIR, 'capa-navegacao.html');
  await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });
  await page.goto('file:///' + capaFile.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 900));
  const cardBounds = await getCardBounds(page);
  const capaBuf    = await page.screenshot({ type: 'png', fullPage: false });
  console.log('✓ Capa');

  // 2. Tabs
  const proposalFile = path.join(DIR, 'proposta-[cliente].html'); // ← ADAPTAR
  const tabBufs = [];
  for (const tab of TABS) {
    const buf = await screenshotTab(page, proposalFile, tab.id);
    tabBufs.push(buf);
    console.log('✓', tab.label);
  }

  await browser.close();

  // 3. Montar PDF
  const pdfDoc = await PDFDocument.create();

  async function addImagePage(buf) {
    const img = await pdfDoc.embedPng(buf);
    const { width: imgW, height: imgH } = img;
    const pdfPage = pdfDoc.addPage([imgW / SCALE, imgH / SCALE]);
    pdfPage.drawImage(img, { x: 0, y: 0, width: imgW / SCALE, height: imgH / SCALE });
    return pdfPage;
  }

  const capaPage = await addImagePage(capaBuf);
  const tabPages = [];
  for (const buf of tabBufs) tabPages.push(await addImagePage(buf));

  // 4. GoTo links na capa (coordenadas PDF têm origem no canto inferior esquerdo)
  const capaH = capaPage.getSize().height;
  cardBounds.forEach((b, i) => {
    if (!tabPages[i]) return;
    const targetPage = tabPages[i];
    const destArray = pdfDoc.context.obj([
      targetPage.ref, PDFName.of('XYZ'),
      PDFNumber.of(0), PDFNumber.of(targetPage.getSize().height), PDFNumber.of(0)
    ]);
    const action = pdfDoc.context.obj({ Type: PDFName.of('Action'), S: PDFName.of('GoTo'), D: destArray });
    const rect   = pdfDoc.context.obj([
      PDFNumber.of(b.x),       PDFNumber.of(capaH - (b.y + b.h)),
      PDFNumber.of(b.x + b.w), PDFNumber.of(capaH - b.y)
    ]);
    const annot = pdfDoc.context.obj({
      Type: PDFName.of('Annot'), Subtype: PDFName.of('Link'),
      F: PDFNumber.of(4), Rect: rect,
      Border: pdfDoc.context.obj([0, 0, 0]), A: action,
    });
    const annotRef = pdfDoc.context.register(annot);
    const existing = capaPage.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
    if (existing) existing.push(annotRef);
    else capaPage.node.set(PDFName.of('Annots'), pdfDoc.context.obj([annotRef]));
  });

  // 5. Salvar
  fs.writeFileSync(OUT, await pdfDoc.save());
  console.log('\n✅ PDF gerado:', OUT);
})();
