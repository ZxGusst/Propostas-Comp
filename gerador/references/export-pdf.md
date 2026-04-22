# Export PDF — Guia Completo

## Visão geral

O script `gerar-pdf.js` usa Puppeteer (headless Chrome) para capturar screenshots de cada aba da proposta, depois combina tudo em PDF com navegação interna via pdf-lib.

**Fluxo:**
```
capa-navegacao.html → screenshot + bounds dos cards
proposta-[cliente].html → 1 screenshot por aba (tabs ocultas)
pdf-lib → combina páginas + adiciona GoTo links na capa
```

---

## Dependências

```bash
npm install puppeteer pdf-lib
```

Versões testadas: puppeteer ^21, pdf-lib ^1.17.

---

## Estrutura do script

```
gerar-pdf.js
├── Constantes (DIR, OUT, W=430, H=932, SCALE=2)
├── screenshot() — captura página inteira (para a capa)
├── screenshotTab() — ativa aba + oculta tabs bar + mede altura real
├── getCardBounds() — mede posições dos .nav-card na capa
└── main() — orquestra tudo e salva o PDF
```

### Captura de aba (screenshotTab)

Cada aba é capturada em fullHeight real:
```js
// 1. Ativa o painel correto
document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
document.getElementById('tab-' + id).classList.add('active');

// 2. Oculta a barra de tabs (não precisa no PDF)
const tabsBar = document.querySelector('.tabs');
if (tabsBar) tabsBar.style.display = 'none';

// 3. Mede altura real: header + painel + footer
const fullH = header.offsetHeight + 32 + panel.scrollHeight + footer.offsetHeight + 48;

// 4. Redimensiona viewport e captura
await page.setViewport({ width: W, height: Math.ceil(fullH), deviceScaleFactor: SCALE });
return page.screenshot({ type: 'png', fullPage: false });
```

### GoTo links (navegação PDF)

Os links são anotações PDF que apontam para páginas internas. Usa a API de baixo nível do pdf-lib:

```js
const { PDFName, PDFNumber } = require('pdf-lib');

// Destino: página X, posição XYZ (0,0 = top-left)
const destArray = pdfDoc.context.obj([
  targetPage.ref,
  PDFName.of('XYZ'),
  PDFNumber.of(0),
  PDFNumber.of(targetPage.getSize().height),
  PDFNumber.of(0)
]);

// Ação GoTo
const action = pdfDoc.context.obj({
  Type: PDFName.of('Action'),
  S: PDFName.of('GoTo'),
  D: destArray
});

// Anotação Link (coordenadas em PDF = Y invertido)
const annot = pdfDoc.context.obj({
  Type: PDFName.of('Annot'),
  Subtype: PDFName.of('Link'),
  F: PDFNumber.of(4),
  Rect: pdfDoc.context.obj([x, capaH - (y + h), x + w, capaH - y]),
  Border: pdfDoc.context.obj([0, 0, 0]),
  A: action,
});
```

**Importante:** coordenadas PDF têm origem no canto inferior esquerdo — por isso a inversão de Y: `capaH - (y + h)`.

---

## Script completo (`scripts/gerar-pdf.js`)

Adapte as linhas marcadas com `← ADAPTAR` para cada cliente:

```js
const puppeteer = require('puppeteer');
const { PDFDocument, PDFName, PDFNumber, PDFArray } = require('pdf-lib');
const path = require('path');
const fs   = require('fs');

const DIR   = __dirname;  // ← ADAPTAR: use o diretório do projeto se rodando de outro lugar
const OUT   = path.join(DIR, 'proposta-[cliente].pdf');  // ← ADAPTAR
const W     = 430;
const H     = 932;
const SCALE = 2;

// Tabs da proposta — ← ADAPTAR: ids e nomes dos painéis
const TABS = [
  { id: 'op01', label: 'Operação 01' },
  { id: 'op02', label: 'Operação 02' },
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

  // 4. GoTo links na capa
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
      PDFNumber.of(b.x), PDFNumber.of(capaH - (b.y + b.h)),
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
```

---

## Como usar

1. Copie `gerar-pdf.js` para a pasta do projeto
2. No terminal, `cd` para a pasta do projeto
3. `npm install puppeteer pdf-lib` (só na primeira vez)
4. `node gerar-pdf.js`
5. Aguarde — vai imprimir `✓ Capa`, `✓ Op 01`, etc.
6. Abra o PDF gerado para verificar navegação

---

## Troubleshooting

**"Cannot find module 'puppeteer'"**
→ Rode `npm install puppeteer pdf-lib` na pasta do projeto (não globalmente).

**Fontes não carregadas (texto borrado/fallback)**
→ Aumente o timeout após `document.fonts.ready`:
```js
await new Promise(r => setTimeout(r, 1500)); // era 900
```

**Links não funcionam no PDF**
→ Abra no Adobe Reader ou Chrome (alguns viewers não suportam GoTo). Evite Preview do macOS.

**Conteúdo cortado**
→ O cálculo de `fullH` soma `header.offsetHeight + panel.scrollHeight + footer.offsetHeight`. Se algum elemento usa `position: fixed` ou `overflow: hidden`, pode não contar. Debug: `console.log` o `fullH` antes de tirar o screenshot.

**"headless: 'new'" aviso no Puppeteer v22+**
→ Troque para `headless: true` (o valor `'new'` foi deprecated).

**SCALE muito alto (PDF gigante)**
→ Reduza para `SCALE = 1.5` para qualidade menor porém arquivo menor.

---

## Estrutura esperada dos arquivos

```
projeto/
├── proposta-[cliente].html   ← proposta principal
├── index.html                ← cópia para Vercel
├── capa-navegacao.html       ← capa do PDF
├── gerar-pdf.js              ← script (não commitar)
├── package.json              ← criado pelo npm init
└── node_modules/             ← não commitar
```

O `.gitignore` deve conter:
```
node_modules/
*.pdf
gerar-pdf.js
capa-navegacao.html
```
