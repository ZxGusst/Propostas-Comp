# Design System — Proposta Audiovisual StudioComp

## Cores e tipografia

```css
/* Paleta */
--bg:       #0a0a0a;   /* fundo global */
--accent:   #C9FF58;   /* verde lima — cor de destaque */
--text:     #e0e0e0;   /* texto primário */
--muted:    #777;      /* texto secundário */
--dim:      #555;      /* texto terciário */
--border:   #1f1f1f;   /* borda sutil */
--border2:  #333;      /* borda section */
--card-bg:  #111;      /* fundo de cards */

/* Tipografia */
font-family: 'DM Sans', sans-serif;        /* UI geral */
font-family: 'Instrument Serif', serif;    /* italic accent (h1 em, op-sub) */

/* Google Fonts import (no <head>) */
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
```

---

## CSS Base completo

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #0a0a0a;
  min-height: 100vh;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
}

/* ── Header ── */
.header { padding: 40px 32px 0; }
.header-sub {
  color: #666; font-size: 13px; letter-spacing: 0.05em;
  height: 40px; display: flex; align-items: flex-end;
}
.header h1 { font-size: 32px; font-weight: 700; line-height: 1.15; margin-top: 6px; }
.header h1 em {
  color: #C9FF58; font-family: 'Instrument Serif', serif;
  font-weight: 400; font-style: italic; font-size: 36px;
}
.header-desc { margin-top: 16px; color: #555; font-size: 13px; line-height: 1.6; max-width: 500px; }
.header-desc strong { color: #ccc; font-weight: 600; }

/* ── Tabs ── */
.tabs { padding: 32px 32px 0; display: flex; gap: 8px; flex-wrap: wrap; }
.tab-btn {
  background: transparent; border: 1px solid #1a1a1a; color: #555;
  padding: 10px 16px; border-radius: 8px; font-size: 12px; font-weight: 500;
  cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
}
.tab-btn.active { background: #1a1a1a; border-color: #333; color: #fff; }

/* ── Content ── */
.content { padding: 32px 32px 40px; }
.tab-panel { display: none; }
.tab-panel.active { display: block; }

/* ── Op header ── */
.op-label { color: #666; font-size: 12px; margin-bottom: 4px; }
.op-title { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
.op-sub {
  color: #C9FF58; font-size: 14px;
  font-family: 'Instrument Serif', serif; font-style: italic; margin-bottom: 32px;
}
.op-sub small {
  display: block; color: #555; font-family: 'DM Sans', sans-serif;
  font-style: normal; font-size: 11px;
}

/* ── Section ── */
.section { margin-bottom: 48px; }
.section-title {
  letter-spacing: 0.25em; font-size: 11px; font-weight: 600; color: #999;
  text-transform: uppercase; border-bottom: 1px solid #333;
  padding-bottom: 10px; margin-bottom: 20px;
}

/* ── PriceRow ── */
.price-row {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 10px 0; border-bottom: 1px solid #1f1f1f;
}
.pr-label { color: #ccc; font-size: 14px; }
.pr-sub { color: #666; font-size: 11px; margin-top: 2px; }
.pr-value { color: #fff; font-size: 15px; font-weight: 600; white-space: nowrap; }

/* ── BulletItem ── */
.bullet-box { background: #111; border: 1px solid #1f1f1f; border-radius: 10px; padding: 20px 20px 8px; }
.bullet-item { display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-start; }
.bullet-dot { width: 8px; height: 8px; border-radius: 50%; background: #C9FF58; margin-top: 6px; flex-shrink: 0; }
.bullet-title { color: #e0e0e0; font-size: 14px; font-weight: 500; }
.bullet-desc { color: #777; font-size: 12px; margin-top: 3px; line-height: 1.5; }

/* ── TotalBar (LAYOUT PADRÃO — SEMPRE usar .tb-stack) ── */
.total-bar {
  background: #fff; border-radius: 8px; padding: 16px 20px;
  display: flex; justify-content: space-between; align-items: center; margin-top: 12px;
}
.tb-label { color: #333; font-size: 14px; font-weight: 600; }
.tb-right { display: flex; align-items: flex-end; }
.tb-stack { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.tb-original { color: #aaa; font-size: 12px; text-decoration: line-through; font-family: 'DM Sans', sans-serif; }
.tb-bottom-row { display: flex; align-items: center; gap: 8px; }
.tb-badge { background: rgba(232,57,57,0.1); color: #e83939; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; white-space: nowrap; }
.tb-final { color: #0a0a0a; font-size: 22px; font-weight: 700; white-space: nowrap; }

/* ── Divider ── */
.divider { height: 1px; background: linear-gradient(90deg, transparent, #333, transparent); margin: 48px 0; }

/* ── Shotdeck ── */
.shotdeck-cam-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.shotdeck-cam-dot { width: 10px; height: 10px; border-radius: 50%; background: #C9FF58; flex-shrink: 0; }
.shotdeck-cam-name { color: #e0e0e0; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
.shotdeck-frame { color: #999; font-size: 12px; margin-bottom: 10px; }
.shotdeck-img { width: 100%; border-radius: 8px; display: block; margin-bottom: 8px; }
.shotdeck-ref { color: #777; font-size: 11px; }
.shotdeck-ref a { color: #777; text-decoration: underline; transition: color 0.2s; }
.shotdeck-ref a:hover { color: #C9FF58; }
.shotdeck-card { margin-bottom: 24px; }

/* ── Payment Plan ── */
.payment-intro { color: #888; font-size: 13px; line-height: 1.7; margin-bottom: 20px; }
.payment-intro strong { color: #fff; font-weight: 600; }
.payment-intro .accent { color: #C9FF58; font-weight: 700; font-size: 15px; }
.payment-rows { display: flex; flex-direction: column; gap: 6px; }
.payment-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; background: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 8px;
}
.payment-row.first { background: rgba(200,255,0,0.05); border-color: rgba(200,255,0,0.15); }
.payment-month { font-size: 13px; font-weight: 600; color: #aaa; }
.payment-row.first .payment-month { color: #C9FF58; }
.payment-label { color: #555; font-size: 11px; }
.payment-right { display: flex; align-items: center; gap: 10px; }
.payment-stack { flex-direction: column; align-items: flex-end; gap: 2px; }
.payment-original { color: #666; font-size: 11px; text-decoration: line-through; font-family: 'DM Sans', sans-serif; }
.payment-bottom-row { display: flex; align-items: center; gap: 8px; }
.payment-badge { background: rgba(200,255,0,0.12); color: #C9FF58; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
.payment-value { color: #fff; font-size: 15px; font-weight: 600; }

/* ── Timeline ── */
.timeline { position: relative; padding-left: 20px; }
.timeline-line { position: absolute; left: 4px; top: 8px; bottom: 8px; width: 1px; background: #2a2a2a; }
.timeline-item { position: relative; margin-bottom: 28px; padding-left: 20px; }
.timeline-dot { position: absolute; left: -17px; top: 6px; width: 9px; height: 9px; border-radius: 50%; background: #333; border: 2px solid #444; }
.timeline-dot.active { background: #C9FF58; border-color: #C9FF58; }
.timeline-date { color: #777; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; margin-bottom: 4px; }
.timeline-item.active .timeline-date { color: #C9FF58; }
.timeline-title { color: #e0e0e0; font-size: 14px; font-weight: 600; margin-bottom: 3px; }
.timeline-desc { color: #666; font-size: 12px; line-height: 1.5; }

/* ── Nota ── */
.nota {
  margin-top: 16px; padding: 14px 18px;
  background: rgba(200,255,0,0.04); border: 1px solid rgba(200,255,0,0.1);
  border-radius: 8px; color: #888; font-size: 12px; line-height: 1.6;
}
.nota .accent { color: #C9FF58; font-weight: 600; }

/* ── Footer ── */
.footer {
  border-top: 1px solid #1a1a1a; padding: 20px 32px;
  display: flex; justify-content: space-between; align-items: center;
}
.footer-contact-label { color: #555; font-size: 10px; letter-spacing: 0.05em; }
.footer-contact-email { color: #777; font-size: 11px; }
.footer-tagline { color: #333; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; }
```

---

## SVG Logo StudioComp

```html
<svg width="18" height="88" viewBox="0 0 36 175" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M31.4209 0.53857C34.3116 2.2404 34.9508 8.4981 33.3344 19.3035L32.8255 22.6217L32.1863 25.9398C31.7588 28.6636 31.4209 30.8336 31.1644 32.45C30.57 37.299 30.4804 40.9591 30.9079 43.4264C31.1644 45.0427 31.3761 46.5328 31.5471 47.8927C31.885 49.851 32.1863 51.7238 32.4387 53.5112C33.2041 58.2787 33.8434 62.6188 34.3523 66.5314C35.7121 77.5933 36.1803 85.3412 35.7569 89.7627C35.4149 92.8284 34.9915 96.5293 34.4785 100.869C33.7131 106.146 32.9476 110.954 32.1782 115.294C29.9633 127.378 27.9236 133.847 26.0507 134.694C23.8359 135.631 21.3687 135.289 18.649 133.672C15.9252 132.056 14.3089 130.098 13.8 127.801C13.458 126.271 13.3725 123.844 13.5435 120.526C13.629 119.333 13.7552 117.717 13.9262 115.677L14.1827 113.124L14.4392 110.445C15.2901 101 15.0784 93.8096 13.8 88.871C13.0346 85.8949 12.0982 83.1711 10.9907 80.7039C10.2253 79.0875 9.15862 77.0885 7.79878 74.7027C5.07504 70.0247 3.3325 65.9411 2.56708 62.4478C1.03625 55.555 0.185322 46.8341 0.0143248 36.2811C-0.156673 23.7698 1.20318 16.1116 4.09792 13.3064C7.58709 9.73172 12.3099 6.45834 18.2663 3.4781C24.6502 0.245432 29.031 -0.735765 31.4127 0.542646L31.4209 0.53857ZM30.6555 152.82C32.0153 157.075 31.5919 161.968 29.377 167.501C27.2477 172.949 24.9108 175.16 22.358 174.138C19.2068 172.859 16.1044 171.076 13.0386 168.776C9.46397 166.052 7.76215 163.796 7.93315 162.009C8.27107 159.456 9.12199 156.692 10.4859 153.712C12.1877 150.222 13.9751 148.268 15.8479 147.841C18.4861 147.161 21.2506 147.161 24.1453 147.841C27.6345 148.606 29.8045 150.267 30.6555 152.82Z" fill="#C9FF58"/>
</svg>
```

Para o footer use `width="12" height="58"` no mesmo viewBox.

---

## TotalBar — Exemplos de uso

**Só valor final (subtotais):**
```html
<div class="total-bar">
  <div class="tb-label">Subtotal Operação 01</div>
  <div class="tb-right">
    <div class="tb-stack">
      <span class="tb-final">R$ 2.200</span>
    </div>
  </div>
</div>
```

**Com badge + preço riscado (pacote com desconto):**
```html
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

---

## Payment row com desconto (1ª parcela)

```html
<div class="payment-row first">
  <div>
    <div class="payment-month">Maio/2026</div>
    <div class="payment-label">1ª parcela · Fechamento</div>
  </div>
  <div class="payment-right payment-stack">
    <span class="payment-original">R$ 1.390</span>
    <div class="payment-bottom-row">
      <span class="payment-badge">-5% FECHAMENTO</span>
      <span class="payment-value">R$ 1.320</span>
    </div>
  </div>
</div>
```

---

## Shotdeck Card

```html
<div class="shotdeck-card">
  <div class="shotdeck-cam-header">
    <div class="shotdeck-cam-dot"></div>
    <div class="shotdeck-cam-name">Câmera 1</div>
  </div>
  <div class="shotdeck-frame">Frame: Na CDJ lateralizado no DJ</div>
  <img class="shotdeck-img" src="[base64 ou URL]" alt="Ref cam 1" />
  <div class="shotdeck-ref">Ref: <a href="[youtube url]" target="_blank">Artista - Evento Ano</a></div>
</div>
```

As imagens podem ser base64 (arquivo standalone) ou URLs diretas. Para pesquisar os vídeos de referência, use YouTube e busque o nome do artista + evento + ano.
