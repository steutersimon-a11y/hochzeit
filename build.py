from pathlib import Path
import base64, re, json

root=Path(__file__).resolve().parent
def data_uri(path):
 mime={'.svg':'image/svg+xml','.woff2':'font/woff2','.jpg':'image/jpeg','.png':'image/png'}[Path(path).suffix]
 return 'data:'+mime+';base64,'+base64.b64encode((root/path).read_bytes()).decode()
css=(root/'style.css').read_text()
css=re.sub(r"url\('([^']+)'\)",lambda m:"url('"+data_uri(m[1])+"')",css)
html=(root/'index.html').read_text()
html=html.replace('<link rel="preload" href="assets/fonts/cormorant-garamond-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>','')
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
html=html.replace('<script src="wedding-config.js" defer></script>','<script id="wedding-config">'+(root/'wedding-config.js').read_text()+'</script>')
html=html.replace('<script src="export-template.js" defer></script>','')
html=html.replace('<script src="app.js" defer></script>','')
html=re.sub(r'(src|href|srcset)="(assets/[^\"]+\.svg)"',lambda m:m[1]+'="'+data_uri(m[2])+'"',html)
app=(root/'app.js').read_text().replace('</script','<\\/script')
html=html.replace('</body>','<script>'+app+'</script>\n</body>')
html='\n'.join(line.rstrip() for line in html.splitlines())+'\n'
(root/'Unsere-Hochzeit.html').write_text(html)
(root/'export-template.js').write_text('window.INVITATION_TEMPLATE = '+json.dumps(html,ensure_ascii=False).replace('<','\\u003c')+';\n')
print('Standalone HTML created:',len(html.encode()),'bytes')
