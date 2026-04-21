# Handoff — Conversão de Proposta React/JSX → HTML Standalone + PDF Navegável

## O que este documento cobre

Como transformar uma proposta comercial construída em React/TypeScript (`.jsx`/`.tsx`) em:
1. **HTML standalone** — um único arquivo `.html` sem dependências externas, com CSS inline e JS mínimo
2. **PDF navegável** — PDF com capa de navegação + links internos clicáveis para cada seção

Stack usada: **HTML/CSS puro + Puppeteer + pdf-lib**

---

## Parte 1 — Conversão React → HTML Standalone

### Por que não usar o build do React

O Vite/CRA gera vários arquivos (`main.js`, `assets/`, `index.html` separado). Para mandar no WhatsApp ou hospedar sem servidor, o ideal é **um único arquivo `.html`** que funciona offline.

### Problema das imagens base64

Se o JSX tiver imagens embutidas em base64, o arquivo tem centenas de KB. Ler o JSX diretamente trava a IA (contexto enorme). Solução: **extrair os base64 com Python antes de gerar o HTML**.

```python
# extrai_base64.py — rode antes de gerar o HTML
import re

with open('proposta-cliente.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Captura todas as strings base64 de imagens
matches = re.findall(r'src=\{`(data:image/[^`]+)`\}', content)
# ou: re.findall(r'"(data:image/[^"]{100,})"', content)

for i, b64 in enumerate(matches):
    prefix = b64[:50].replace('/', '_').replace('+', '-')
    with open(f'img_{i}.txt', 'w') as out:
        out.write(b64)
    print(f'img_{i}.txt — {len(b64)} chars')
```

Depois use as variáveis no script de geração do HTML:

```python
# gen_html.py
imgs = []
for i in range(4):  # ajuste o range para o número de imagens
    with open(f'img_{i}.txt') as f:
        imgs.append(f.read().strip())

html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Proposta — Cliente</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet"/>
  <style>
    /* TODO: cole o CSS completo aqui */
  </style>
</head>
<body>
  <!-- TODO: cole o HTML aqui, substituindo {{imgs[0]}} etc -->
  <img src="{imgs[0]}" />
</body>
</html>"""

with open('proposta-cliente.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('OK')
```

> **Dica importante:** nunca escreva HTML com conteúdo base64 diretamente num heredoc bash — as aspas e chaves causam erro de EOF. Sempre grave num arquivo `.py` e execute separado.

---

### Estrutura do HTML gerado

```
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <!-- Google Fonts: DM Sans + Instrument Serif -->
  <!-- CSS completo inline na tag <style> -->
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <!-- SVG logo + label + h1 + descrição -->
  </div>

  <!-- TABS (uma por operação + Pacote Final) -->
  <div class="tabs">
    <button class="tab-btn active" onclick="switchTab('op01', this)">Op 01 — Nome Evento</button>
    <button class="tab-btn" onclick="switchTab('pacote', this)">Pacote Final</button>
  </div>

  <!-- CONTEÚDO DAS TABS -->
  <div class="content">

    <!-- ABA OPERAÇÃO -->
    <div class="tab-panel active" id="tab-op01">
      <!-- Valores, O que está incluso, Shotdeck, TotalBar subtotal -->
    </div>

    <!-- ABA PACOTE FINAL -->
    <div class="tab-panel" id="tab-pacote">
      <!-- Resumo ops, Total Bruto, Total Pacote, Plano de Pagamento, Timeline, Nota -->
    </div>

  </div>

  <!-- FOOTER -->
  <div class="footer"><!-- logo + contato + tagline --></div>

  <script>
    function switchTab(id, btn) {
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('tab-' + id).classList.add('active');
      btn.classList.add('active');
    }
  </script>
</body>
</html>
```

---

### Componente TotalBar (layout stacked — padrão)

Sempre use `.tb-stack` para empilhar preço original (riscado) + badge + preço final:

```html
<!-- Subtotal simples (sem desconto) -->
<div class="total-bar">
  <div class="tb-label">Subtotal Operação 01</div>
  <div class="tb-right">
    <div class="tb-stack">
      <span class="tb-final">R$ 2.200</span>
    </div>
  </div>
</div>

<!-- Com desconto (pacote) -->
<div class="total-bar">
  <div class="tb-label">Total Pacote</div>
  <div class="tb-right">
    <div class="tb-stack">
      <span class="tb-original">R$ 7.300</span>
      <div class="tb-bottom-row">
        <span class="tb-badge">-5% PACOTE</span>
        <span class="tb-final">R$ 6.950</span>
      </div>
    </div>
  </div>
</div>
```

CSS necessário:
```css
.total-bar {
  background: #fff; border-radius: 8px; padding: 16px 20px;
  display: flex; justify-content: space-between; align-items: center; margin-top: 12px;
}
.tb-label  { color: #333; font-size: 14px; font-weight: 600; }
.tb-right  { display: flex; align-items: flex-end; }
.tb-stack  { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.tb-original { color: #aaa; font-size: 12px; text-decoration: line-through; }
.tb-bottom-row { display: flex; align-items: center; gap: 8px; }
.tb-badge  { background: rgba(232,57,57,0.1); color: #e83939; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
.tb-final  { color: #0a0a0a; font-size: 22px; font-weight: 700; }
```

---

## Parte 2 — Capa de Navegação (página 1 do PDF)

Crie `capa-navegacao.html` — dimensões fixas **430×932px** (mobile portrait), sem scroll.

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* mesmo design system da proposta */
    html, body { width: 430px; height: 932px; overflow: hidden; margin: 0; }

    .nav-card {
      display: flex; justify-content: space-between; align-items: center;
      background: #111; border: 1px solid #1f1f1f; border-radius: 12px;
      padding: 20px 24px; cursor: pointer; margin-bottom: 12px;
      transition: border-color 0.2s;
    }
    .nav-card:hover { border-color: #C9FF58; }
    .nav-card-left  { display: flex; align-items: center; gap: 16px; }
    .nav-num        { color: #C9FF58; font-size: 22px; font-weight: 700; }
    .nav-title      { color: #e0e0e0; font-size: 15px; font-weight: 600; }
    .nav-sub        { color: #555; font-size: 12px; margin-top: 2px; }
    .nav-arrow      { color: #333; font-size: 24px; }
  </style>
</head>
<body>
  <!-- mesmo .header da proposta -->

  <div style="padding: 32px;">
    <!-- um .nav-card por aba -->
    <div class="nav-card" id="btn-op01">
      <div class="nav-card-left">
        <div class="nav-num">01</div>
        <div>
          <div class="nav-title">Nome da Operação</div>
          <div class="nav-sub">Tipo · Localização</div>
        </div>
      </div>
      <div class="nav-arrow">›</div>
    </div>

    <div class="nav-card" id="btn-pacote">
      <div class="nav-card-left">
        <div class="nav-num">03</div>
        <div>
          <div class="nav-title">Pacote Final</div>
          <div class="nav-sub">Resumo · Pagamento · Timeline</div>
        </div>
      </div>
      <div class="nav-arrow">›</div>
    </div>
  </div>

  <!-- mesmo .footer da proposta -->
</body>
</html>
```

> Os `id="btn-xxx"` não precisam fazer nada — o Puppeteer mede as posições dos `.nav-card` em runtime e o pdf-lib adiciona os links GoTo depois.

---

## Parte 3 — Geração do PDF (`gerar-pdf.js`)

### Instalação

```bash
npm install puppeteer pdf-lib
```

### Fluxo do script

```
1. Puppeteer abre capa-navegacao.html
   → screenshot 430×932
   → mede getBoundingClientRect() de cada .nav-card

2. Para cada aba da proposta:
   → abre proposta-cliente.html
   → ativa o tab-panel correto via JS
   → oculta a barra de tabs (não precisa no PDF)
   → mede altura real: header + panel.scrollHeight + footer
   → redimensiona viewport e tira screenshot fullPage: false

3. pdf-lib combina todas as imagens em páginas PDF

4. Adiciona anotações Link (GoTo) na capa apontando para cada página
```

### Ponto crítico — medir altura real do conteúdo

```js
const fullH = await page.evaluate((id) => {
  const header = document.querySelector('.header');
  const panel  = document.getElementById('tab-' + id);
  const footer = document.querySelector('.footer');
  return header.offsetHeight + 32       // header + gap
       + panel.scrollHeight             // conteúdo completo da aba
       + footer.offsetHeight + 48;      // footer + padding
}, tabId);

await page.setViewport({ width: 430, height: Math.ceil(fullH), deviceScaleFactor: 2 });
// NÃO use fullPage: true — use fullPage: false com viewport já no tamanho certo
return page.screenshot({ type: 'png', fullPage: false });
```

### Ponto crítico — GoTo links no PDF (coordenadas invertidas)

PDF tem origem no **canto inferior esquerdo** — Y é invertido em relação ao browser:

```js
const capaH = capaPage.getSize().height;  // altura da página em pts

cardBounds.forEach((b, i) => {
  const targetPage = tabPages[i];

  const destArray = pdfDoc.context.obj([
    targetPage.ref,
    PDFName.of('XYZ'),
    PDFNumber.of(0),
    PDFNumber.of(targetPage.getSize().height), // topo da página destino
    PDFNumber.of(0)
  ]);

  const rect = pdfDoc.context.obj([
    PDFNumber.of(b.x),              // left
    PDFNumber.of(capaH - (b.y + b.h)), // bottom (Y invertido!)
    PDFNumber.of(b.x + b.w),        // right
    PDFNumber.of(capaH - b.y)       // top (Y invertido!)
  ]);

  const annot = pdfDoc.context.obj({
    Type: PDFName.of('Annot'), Subtype: PDFName.of('Link'),
    F: PDFNumber.of(4),
    Rect: rect,
    Border: pdfDoc.context.obj([0, 0, 0]),
    A: pdfDoc.context.obj({ Type: PDFName.of('Action'), S: PDFName.of('GoTo'), D: destArray }),
  });

  const annotRef = pdfDoc.context.register(annot);
  const existing = capaPage.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
  if (existing) existing.push(annotRef);
  else capaPage.node.set(PDFName.of('Annots'), pdfDoc.context.obj([annotRef]));
});
```

### Script completo de referência

Veja `skill-proposta-audiovisual/scripts/gerar-pdf.js` — é a versão genérica com os pontos `← ADAPTAR` marcados.

Para adaptar a um novo cliente, edite só:
```js
const OUT        = path.join(DIR, 'proposta-[cliente].pdf');   // ← nome do arquivo
const TABS       = [{ id: 'op01', label: 'Op 01' }, ...];     // ← ids dos tab-panels
const proposalFile = path.join(DIR, 'proposta-[cliente].html'); // ← nome do HTML
```

---

## Troubleshooting rápido

| Problema | Causa | Solução |
|---|---|---|
| Fontes borradas/fallback | `fonts.ready` não esperou carregar | Aumente timeout para 1500ms |
| Conteúdo cortado no PDF | `scrollHeight` não captura elementos `fixed` | Debug: `console.log(fullH)` antes do screenshot |
| Links não funcionam | Viewer não suporta GoTo | Abra no Chrome ou Adobe Reader (evite Preview do macOS) |
| `Cannot find module 'puppeteer'` | npm instalado no lugar errado | `npm install` dentro da pasta do projeto |
| `headless: 'new'` warning | Puppeteer v22+ deprecou esse valor | Troque para `headless: true` |
| Heredoc bash com HTML falha | Aspas/chaves dentro do heredoc quebram EOF | Escreva o script Python em arquivo separado e execute com `python script.py` |

---

## Checklist por proposta nova

```
[ ] Extrair base64 das imagens (se o JSX tiver imagens embutidas)
[ ] Gerar proposta-[cliente].html com HTML/CSS inline
[ ] Copiar como index.html (para Vercel)
[ ] Criar capa-navegacao.html (430×932px, sem scroll)
[ ] Copiar gerar-pdf.js da skill, adaptar OUT + TABS + proposalFile
[ ] npm install puppeteer pdf-lib (primeira vez)
[ ] node gerar-pdf.js → verificar PDF gerado
[ ] git add index.html proposta-[cliente].html + push → Vercel deploya automático
```

---

## Referências

- Design system completo (cores, CSS, componentes): `skill-proposta-audiovisual/references/design-system.md`
- Pesquisa de preços e fórmulas: `skill-proposta-audiovisual/references/pricing-research.md`
- Guia PDF detalhado + troubleshooting: `skill-proposta-audiovisual/references/export-pdf.md`
- Script PDF genérico: `skill-proposta-audiovisual/scripts/gerar-pdf.js`
