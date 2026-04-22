---
name: proposta-audiovisual
description: >
  Cria propostas comerciais completas para serviços audiovisuais de eventos (cobertura de sets, drops, full sets, festivais).
  Gera um HTML standalone com design system dark profissional, tabs por operação, shotdeck com links YouTube, plano de pagamento com desconto de fechamento, e exporta para Vercel (web) e PDF navegável (com capa + links internos).

  USE ESTA SKILL sempre que o usuário pedir para criar uma proposta comercial audiovisual, proposta para DJ/artista, orçamento de cobertura de evento, proposta de captação + pós-produção, ou qualquer variação disso. Também use quando pedir para atualizar ou gerar uma nova versão de proposta seguindo o padrão StudioComp.
---

# Proposta Audiovisual — StudioComp

Você vai gerar uma proposta comercial completa, do briefing ao export final (web + PDF). Siga o fluxo abaixo na ordem.

---

## FASE 1 — Briefing do cliente

Antes de gerar qualquer código, colete as informações necessárias. Se o usuário não forneceu tudo, pergunte de forma objetiva e compacta:

**Informações obrigatórias:**
- Nome do cliente / artista
- Quantas operações (eventos)? Para cada uma:
  - Nome e localização do evento
  - Data aproximada
  - Tipo de cobertura: Drops (24/48h) ou Full Set (até 2h)
  - Setup de câmeras (quantas, modelos se souber)
- Cidade de origem da equipe (padrão: Brasília/DF)
- Email de contato da produtora

**Calculado automaticamente** (veja `references/pricing-research.md`):
- Custos de logística (transporte, hospedagem, deslocamento)
- Valor de captação e pós-produção
- Desconto de pacote (se múltiplas operações)
- Plano de pagamento parcelado

---

## FASE 2 — Pesquisa de logística e precificação

Leia `references/pricing-research.md` para o briefing completo de pesquisa.

**Resumo do fluxo:**
1. Pesquise no Google/YouTube os custos atuais de transporte BSB → destino (ônibus ou aéreo)
2. Pesquise hospedagem na região do evento (2 diárias para equipe de 2)
3. Pesquise no YouTube os vídeos de referência (shotdeck) para o estilo do evento
4. Calcule preços seguindo as fórmulas da referência

---

## FASE 3 — Geração do HTML

Use o design system de `references/design-system.md` para gerar o arquivo `proposta-[cliente].html`.

**Estrutura obrigatória do HTML:**
```
1. <head> — Google Fonts (DM Sans + Instrument Serif) + CSS inline
2. .header — Logo SVG + label + título h1 + "Cliente — [Nome]"
3. .tabs — 1 botão por operação + "Pacote Final"
4. .content — 1 .tab-panel por aba:
   - Aba de operação: label op, título, subtítulo evento, Valores Referência,
     O que está incluso, Shotdeck - [Tipo], TotalBar subtotal
   - Aba Pacote Final: Resumo das Operações, TotalBar bruto, TotalBar pacote (stacked),
     Divider, Plano de Pagamento, Divider, Timeline, Nota
5. .footer — contato + tagline + logo SVG
```

**Regra crítica do TotalBar (SEMPRE seguir este layout):**
```
Branco, padding 16px 20px, border-radius 8px
[Label à esquerda]          [Direita empilhada:]
                              ~~Preço original~~ (se houver)
                              [badge]  Preço final (22px bold)
```
Ver CSS completo em `references/design-system.md`.

**JavaScript:** Só precisa de 1 função:
```js
function switchTab(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  btn.classList.add('active');
}
```

Salve também como `index.html` (cópia idêntica para Vercel).

---

## FASE 4 — Capa de navegação (PDF)

Crie `capa-navegacao.html` — página de menu visual usada como página 1 do PDF.

**Estrutura:** Mesmos header e footer da proposta principal. No centro, 3 cards de navegação empilhados:
```html
<div class="nav-card" id="btn-[tab-id]">
  <div class="nav-card-left">
    <div class="nav-num">01</div>  <!-- 02, 03 -->
    <div>
      <div class="nav-title">[Nome da operação]</div>
      <div class="nav-sub">[Tipo · Localização]</div>
    </div>
  </div>
  <div class="nav-arrow">›</div>
</div>
```

Dimensões fixas: `width: 430px; height: 932px` (mobile portrait). Não deve ter scroll.

---

## FASE 5 — Script de exportação PDF

Copie o script base de `scripts/gerar-pdf.js` para a pasta do projeto.

O script:
1. Abre `capa-navegacao.html` → screenshot da capa + captura bounds dos `.nav-card`
2. Para cada aba: oculta `.tabs`, ativa o painel, mede altura real do conteúdo, screenshot
3. Combina em PDF com pdf-lib
4. Adiciona links GoTo na capa apontando para cada página

**Dependências:** `npm install puppeteer pdf-lib`

**Executar:** `node gerar-pdf.js`

**Output:** `proposta-[cliente].pdf` na mesma pasta

---

## FASE 6 — Deploy Vercel

1. `git init` na pasta do projeto
2. `git remote add origin [repo do usuário]`
3. Adicione `.gitignore`:
   ```
   node_modules/
   *.pdf
   gerar-pdf.js
   capa-navegacao.html
   proposta-*-studiocomp.jsx
   ```
4. `git add index.html proposta-[cliente].html .gitignore`
5. `git commit -m "feat: proposta [cliente]"`
6. `git push -u origin main`
7. No Vercel: Import repo → Deploy (zero config, detecta HTML estático)

---

## Checklist de entrega

- [ ] `proposta-[cliente].html` — arquivo web com tabs interativos
- [ ] `index.html` — cópia idêntica para Vercel
- [ ] `capa-navegacao.html` — capa PDF com nav cards
- [ ] `gerar-pdf.js` — script de exportação
- [ ] `proposta-[cliente].pdf` — PDF gerado com navegação
- [ ] GitHub push + URL Vercel para enviar no WhatsApp

---

## Referências

- `references/design-system.md` — CSS completo, cores, tipografia, todos os componentes
- `references/pricing-research.md` — briefing de pesquisa de logística + fórmulas de precificação
- `references/export-pdf.md` — script PDF detalhado + troubleshooting
