"""
gen_pdf_html.py
Gera proposta-pista-livre-PDF.html a partir do HTML renderizado + CSS extraído.
Saída: HTML standalone, pronto para page.pdf() landscape.
"""
import re
import base64
import urllib.request
from pathlib import Path

def img_to_b64(url):
    """Baixa uma imagem e retorna data URI base64."""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as r:
            data = r.read()
        mime = r.headers.get_content_type() or 'image/jpeg'
        b64  = base64.b64encode(data).decode('ascii')
        print(f'  baixado ({len(data)//1024}KB): {url[-50:]}')
        return f'data:{mime};base64,{b64}'
    except Exception as e:
        print(f'  FALHA: {e}')
        return None

folder = Path(__file__).parent
fonte  = folder / 'fonte'

html  = (fonte / 'proposta-original-rendered.html').read_text('utf-8')
tok   = (fonte / 'tokens.css').read_text('utf-8')
prop  = (fonte / 'proposta.css').read_text('utf-8')

# ─────────────────────────────────────────────────
# 1. Remove scripts (Supabase, GSAP, auth, proposta)
# ─────────────────────────────────────────────────
html = re.sub(r'<script\b[^>]*>.*?</script>', '', html, flags=re.DOTALL)

# ─────────────────────────────────────────────────
# 2. Strip GSAP ScrollTrigger inline styles
# ─────────────────────────────────────────────────
html = re.sub(
    r'\s*style="translate:\s*none;\s*rotate:\s*none;\s*scale:\s*none;\s*'
    r'transform:\s*translate\([^)]+\);\s*opacity:\s*0;"',
    '',
    html
)

# ─────────────────────────────────────────────────
# 3. Show both lineup days
# ─────────────────────────────────────────────────
html = html.replace(
    'class="lineup-day lineup-day--hidden"',
    'class="lineup-day"'
)

# ─────────────────────────────────────────────────
# 4. Add day labels before each lineup block
# ─────────────────────────────────────────────────
DAY_LABEL = (
    '<p style="font-size:0.7rem;font-weight:900;letter-spacing:0.22em;'
    'text-transform:uppercase;color:#ccdc2d;margin-bottom:0.75rem;'
    'padding-bottom:0.5rem;border-bottom:1px solid rgba(204,220,45,0.2);">'
)
html = html.replace(
    '<div class="lineup-day" id="lineup-sabado">',
    DAY_LABEL + 'SÁBADO 25/04</p>'
    '<div class="lineup-day" id="lineup-sabado">'
)
html = html.replace(
    '<div class="lineup-day" id="lineup-domingo">',
    DAY_LABEL + 'DOMINGO 26/04</p>'
    '<div class="lineup-day" id="lineup-domingo">'
)

# ─────────────────────────────────────────────────
# 5. Remove duplicate marquee artists
# ─────────────────────────────────────────────────
html = re.sub(
    r'\s*<!-- duplicado para loop.*?(?=\s*</div>\s*</div>\s*</div>)',
    '\n      ',
    html,
    flags=re.DOTALL
)

# ─────────────────────────────────────────────────
# 6. Replace logo img with SVG text
# ─────────────────────────────────────────────────
LOGO_SVG = (
    '<svg width="140" height="24" viewBox="0 0 140 24" xmlns="http://www.w3.org/2000/svg">'
    '<text x="0" y="19" '
    'font-family="\'Big Shoulders Display\', sans-serif" '
    'font-weight="900" font-size="18" letter-spacing="1" '
    'fill="oklch(0.985 0.003 110)" opacity="0.7">'
    'STUDIO COMP'
    '</text></svg>'
)
html = html.replace(
    '<img src="assets/studiocomp-logo.svg" alt="Studio Comp" height="24">',
    LOGO_SVG
)

# ─────────────────────────────────────────────────
# 7. Baixar thumbnail WhoMadeWho e substituir
#    todo o bloco .portfolio-featured por um
#    <figure> simples com <img> direto (sem yt-facade)
# ─────────────────────────────────────────────────
THUMB_URL = 'https://img.youtube.com/vi/4jyqoFcXzbY/maxresdefault.jpg'
print('Baixando thumbnail WhoMadeWho...')
thumb_b64 = img_to_b64(THUMB_URL)

if thumb_b64:
    PORTFOLIO_BLOCK = (
        '<div class="portfolio-featured">'
        '<figure style="margin:0;position:relative;border-radius:var(--radius-lg);'
        'overflow:hidden;line-height:0;">'
        f'<img src="{thumb_b64}" alt="WhoMadeWho @ BOMA - Museu Nacional" '
        'style="width:100%;display:block;">'
        '<figcaption style="position:absolute;bottom:0;left:0;right:0;'
        'padding:2rem;'
        'background:linear-gradient(to top,rgba(10,10,10,0.88) 0%,transparent 100%);'
        'display:flex;flex-direction:column;gap:0.5rem;line-height:normal;">'
        '<span class="badge" style="width:fit-content;">+1M views</span>'
        '<p style="font-size:1.25rem;font-weight:900;color:#f8f8f3;margin:0;">'
        'WhoMadeWho @ BOMA \u2013 Museu Nacional</p>'
        '<p style="font-size:0.875rem;color:oklch(0.70 0.008 110);margin:0;">'
        'Full Set \u00b7 Studio Comp</p>'
        '</figcaption>'
        '</figure>'
        '</div>'
    )

    # Substitui o bloco inteiro da .portfolio-featured (que vai do div até o </div> fechando)
    html = re.sub(
        r'<div class="portfolio-featured[^"]*"[^>]*>.*?</div>\s*</section>',
        PORTFOLIO_BLOCK + '\n\n    </div>\n  </section>',
        html,
        flags=re.DOTALL
    )
    print('  Portfolio substituido por figure/img simples.')
else:
    print('  AVISO: nao foi possivel baixar o thumbnail.')

# ─────────────────────────────────────────────────
# 8. PDF-specific CSS overrides
# ─────────────────────────────────────────────────
PDF_CSS = """
/* ============================================================
   PDF OVERRIDES
   ============================================================ */

/* Reset GSAP ScrollTrigger */
.will-animate {
  opacity: 1 !important;
  transform: none !important;
  translate: none !important;
  rotate: none !important;
  scale: none !important;
}

/* Reset hero CSS animations */
.hero__eyebrow,
.hero__title,
.hero__meta {
  opacity: 1 !important;
  animation: none !important;
  transform: none !important;
}

/* Ocultar navegação / interação */
.progress-bar,
.sticky-nav,
.section-dots,
.hero__scroll-hint,
.hero__scroll-arrow,
.lineup-tabs {
  display: none !important;
}

#footer-signout-btn {
  display: none !important;
}

/* Mostrar os dois dias do lineup */
.lineup-day--hidden {
  display: grid !important;
}

#lineup-domingo {
  margin-top: 2rem;
}

/* Marquee estático */
.artists-marquee__track {
  mask-image: none !important;
  -webkit-mask-image: none !important;
}
.artists-marquee__inner {
  animation: none !important;
  flex-wrap: wrap !important;
  width: auto !important;
  justify-content: center !important;
  row-gap: 0.5rem !important;
}

/* Ocultar play buttons */
.yt-facade__play {
  display: none !important;
}

/* Sem transições */
* {
  transition: none !important;
}

/* Hero sem min-height 100vh */
.hero {
  min-height: auto !important;
  padding-block: 6rem !important;
}
"""

# ─────────────────────────────────────────────────
# 9. Build new <head> com CSS inline
# ─────────────────────────────────────────────────
NEW_HEAD = (
    '<head>\n'
    '  <meta charset="UTF-8">\n'
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    '  <title>Proposta Pista Livre 2026 · Studio Comp</title>\n'
    '  <link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '  <link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900'
    '&family=Barlow:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">\n'
    '  <style>\n'
    + tok + '\n'
    + prop + '\n'
    + PDF_CSS
    + '\n  </style>\n'
    '</head>'
)

html = re.sub(r'<head>.*?</head>', NEW_HEAD, html, flags=re.DOTALL)

# ─────────────────────────────────────────────────
# 10. Limpar atributos no html/body
# ─────────────────────────────────────────────────
html = html.replace('<html lang="pt-BR" style="scroll-behavior: smooth;">', '<html lang="pt-BR">')
html = html.replace('<body style="">', '<body>')

# ─────────────────────────────────────────────────
# 11. Escrever arquivo de saída
# ─────────────────────────────────────────────────
out = folder / 'proposta-pista-livre-PDF.html'
out.write_text(html, 'utf-8')
print(f'OK: {out.name}  ({len(html)//1024}KB)')
