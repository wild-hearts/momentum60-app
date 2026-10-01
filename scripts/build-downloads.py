"""Build the Momentum 60 downloads (HTML + PDF) from public/downloads/*.md.

Run from the repo root:  python3 scripts/build-downloads.py
Needs: pip install markdown playwright  (and a Chromium for Playwright)
"""
import pathlib
import markdown
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'downloads'
FILES = ['starter_kit', 'cheat_sheets', 'self_assessment', 'printable_calendar']

# Palette matches the app: deep teal, gold, bronze. Paper stays white so it prints cleanly.
CSS = """
@page { size: A4 portrait; margin: 1.8cm; }
* { box-sizing: border-box; }
body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0B2A2E; line-height: 1.55; max-width: 800px; margin: 0 auto; padding: 32px; background: #fff; font-size: 15px; }
h1 { color: #081C1F; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; font-size: 2rem; margin: 0 0 .4rem; padding-bottom: .5rem; border-bottom: 4px solid #E1A756; }
h2 { color: #0B2A2E; font-size: 1.25rem; margin-top: 1.8rem; padding-bottom: .35rem; border-bottom: 2px solid #E9DCC3; }
h3 { color: #A36E39; font-size: 1.05rem; margin: 1.3rem 0 .4rem; }
p, li { color: #26474B; margin: 0 0 .7rem; }
em { color: #A36E39; }
strong { color: #081C1F; }
ul, ol { padding-left: 1.3rem; }
li { margin-bottom: .45rem; }
hr { border: 0; border-top: 2px solid #E9DCC3; margin: 1.5rem 0; }
.box { border: 3px solid #081C1F; padding: 22px 26px; border-radius: 12px; margin: 24px 0; background: #FBF6EA; break-inside: avoid; }
.box h2 { margin-top: 0; border: 0; }
table { width: 100%; border-collapse: collapse; margin-top: 16px; break-inside: avoid; }
th, td { border: 1px solid #D9CDB4; padding: 11px 13px; text-align: left; vertical-align: top; }
th { background: #FBF3E4; color: #A36E39; font-weight: 800; }
tr { break-inside: avoid; }
.grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 8px; margin: 18px auto 0; width: 100%; }
.day { border: 2px solid #C9B68F; border-radius: 8px; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; color: #A36E39; }
.print-btn { background: #E1A756; color: #081C1F; border: none; padding: 14px 28px; font-size: 1rem; font-weight: 800; border-radius: 8px; cursor: pointer; display: block; margin: 0 auto 32px; text-transform: uppercase; letter-spacing: 1px; }
.print-btn:hover { background: #A36E39; color: #fff; }
.foot { margin-top: 2.5rem; padding-top: .8rem; border-top: 1px solid #E9DCC3; color: #8A7752; font-size: .8rem; text-align: center; }
@media print { body { padding: 0; } .print-btn { display: none; } }
"""

FOOT = '<div class="foot">Momentum 60 · The Momentum Series by Naomi Shiels · challenge.themomentumrule.com</div>'

def page(title, body, with_button):
    button = '<button class="print-btn" onclick="window.print()">Print / Save as PDF</button>' if with_button else ''
    return f"""<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} - Momentum 60</title>
<style>{CSS}</style>
</head>
<body>
{button}
{body}
{FOOT}
</body>
</html>"""

def main():
    built = []
    for name in FILES:
        text = (OUT / f'{name}.md').read_text(encoding='utf-8')
        body = markdown.markdown(text, extensions=['tables'])
        title = name.replace('_', ' ').title()
        (OUT / f'{name}.html').write_text(page(title, body, True), encoding='utf-8')
        (ROOT / '.build-tmp').mkdir(exist_ok=True)
        (ROOT / '.build-tmp' / f'{name}.html').write_text(page(title, body, False), encoding='utf-8')
        built.append(name)

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        ctx = browser.new_context()
        for name in built:
            pg = ctx.new_page()
            pg.goto((ROOT / '.build-tmp' / f'{name}.html').as_uri())
            pg.pdf(path=str(OUT / f'{name}.pdf'), format='A4', print_background=True,
                   margin={'top': '1.8cm', 'bottom': '1.8cm', 'left': '1.8cm', 'right': '1.8cm'})
            pg.close()
        browser.close()

    for f in (ROOT / '.build-tmp').glob('*.html'):
        f.unlink()
    (ROOT / '.build-tmp').rmdir()
    print('Built:', ', '.join(built))

if __name__ == '__main__':
    main()
