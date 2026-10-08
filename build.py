from pathlib import Path
import base64, re, json

root=Path(__file__).resolve().parent
def data_uri(path):
 mime={'.svg':'image/svg+xml','.woff2':'font/woff2','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp'}[Path(path).suffix]
 return 'data:'+mime+';base64,'+base64.b64encode((root/path).read_bytes()).decode()
css='\n'.join((root/path).read_text() for path in ['style.css','atelier.css'])
css=re.sub(r"url\('([^']+)'\)",lambda m:"url('"+data_uri(m[1])+"')",css)
html=(root/'index.html').read_text()
html=html.replace('<link rel="preload" href="assets/fonts/cormorant-garamond-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>','')
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
html=html.replace('<link rel="stylesheet" href="atelier.css">','')
config=(root/'wedding-config.js').read_text()
photos={}
def embed_photo(match):
 path=match[2]
 photos[path]=data_uri(path)
 return match[1]+photos[path]+match[1]
config=re.sub(r"(['\"])(assets/images/[^'\"]+)\1",embed_photo,config)
html=html.replace('<script src="wedding-config.js" defer></script>','<script id="wedding-config">'+config+'</script>')
html=html.replace('<script src="export-template.js" defer></script>','')
html=html.replace('<script src="app.js" defer></script>','')
html=re.sub(r'(src|href|srcset)="(assets/[^\"]+\.(?:svg|webp|png|jpg|jpeg))"',lambda m:m[1]+'="'+data_uri(m[2])+'"',html)
app=(root/'app.js').read_text().replace('</script','<\\/script')
html=html.replace('</body>','<script>'+app+'</script>\n</body>')
html='\n'.join(line.rstrip() for line in html.splitlines())+'\n'
(root/'Unsere-Hochzeit.html').write_text(html)
template=html
tokens={}
for index,(path,encoded) in enumerate(photos.items()):
 token='__INVITATION_PHOTO_'+str(index)+'__'
 tokens[token]=path
 template=template.replace(encoded,token)
js='window.INVITATION_PHOTOS = '+json.dumps(photos)+';\n'
js+='window.INVITATION_TEMPLATE = '+json.dumps(template,ensure_ascii=False).replace('<','\\u003c')+';\n'
js+='Object.entries('+json.dumps(tokens)+').forEach(([token,path]) => { window.INVITATION_TEMPLATE = window.INVITATION_TEMPLATE.replaceAll(token, window.INVITATION_PHOTOS[path]); });\n'
(root/'export-template.js').write_text(js)
print('Standalone HTML created:',len(html.encode()),'bytes')
