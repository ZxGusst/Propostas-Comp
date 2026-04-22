/**
 * conversor-pdf/gerar-pdf.js
 * Converte qualquer HTML standalone em PDF (página única, sem quebras).
 *
 * Uso:
 *   node gerar-pdf.js <input.html>                → gera <input>.pdf
 *   node gerar-pdf.js <input.html> <output.pdf>   → gera no caminho especificado
 *
 * Requisitos: npm install puppeteer
 */

const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

const [,, inputArg, outputArg] = process.argv;

if (!inputArg) {
  console.error('Uso: node gerar-pdf.js <input.html> [output.pdf]');
  process.exit(1);
}

const HTML_FILE = path.resolve(inputArg);
const PDF_OUT   = outputArg
  ? path.resolve(outputArg)
  : HTML_FILE.replace(/\.html?$/i, '.pdf');

if (!fs.existsSync(HTML_FILE)) {
  console.error('Arquivo nao encontrado:', HTML_FILE);
  process.exit(1);
}

(async () => {
  console.log('Input :', HTML_FILE);
  console.log('Output:', PDF_OUT);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    protocolTimeout: 120000,
  });

  const page = await browser.newPage();

  // Viewport 1440px — largura padrao das propostas
  await page.setViewport({ width: 1440, height: 900 });

  // Screen media: evita que o Chrome aplique CSS de impressao (quebra layout)
  await page.emulateMediaType('screen');

  const fileUrl = 'file:///' + HTML_FILE.split(path.sep).join('/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 60000 });

  // Aguarda fontes e renderizacao
  await new Promise(r => setTimeout(r, 3000));

  // Mede altura real → PDF de pagina unica (sem quebras, sem texto cortado)
  const scrollH = await page.evaluate(() => {
    document.documentElement.style.height = 'auto';
    document.body.style.height = 'auto';
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
  });

  console.log('Altura do conteudo:', scrollH + 'px');
  console.log('Gerando PDF...');

  await page.pdf({
    path: PDF_OUT,
    width:  '1440px',
    height: `${scrollH + 1}px`,
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: false,
  });

  const sizeMB = (fs.statSync(PDF_OUT).size / 1024 / 1024).toFixed(1);
  console.log('PDF gerado:', PDF_OUT, '(' + sizeMB + 'MB)');

  await browser.close();
})();
