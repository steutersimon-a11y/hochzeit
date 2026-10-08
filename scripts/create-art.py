from pathlib import Path
import math, random, re

OUT=Path(__file__).resolve().parents[1] / 'assets'
random.seed(19)
def svg(content, w, h, defs=''):
 result = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><defs>
 <filter id="thread" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".22" numOctaves="2" seed="3" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale=".45"/><feDropShadow dx=".45" dy=".75" stdDeviation=".55" flood-color="#383d2d" flood-opacity=".15"/></filter>
 <pattern id="linen" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 1H5M1 0V5" stroke="#96896e" opacity=".13" stroke-width=".35"/></pattern>
 <linearGradient id="leaf" x2="1" y2=".7"><stop stop-color="#3f5946"/><stop offset=".5" stop-color="#7a8b60"/><stop offset="1" stop-color="#506b4c"/></linearGradient>
 <radialGradient id="rose"><stop stop-color="#ba786e"/><stop offset=".6" stop-color="#e6b7a7"/><stop offset="1" stop-color="#bf8275"/></radialGradient>
 <linearGradient id="blue"><stop stop-color="#d6e2e1"/><stop offset=".5" stop-color="#89a9b2"/><stop offset="1" stop-color="#5d8391"/></linearGradient>
 <linearGradient id="purple"><stop stop-color="#e5d5e8"/><stop offset=".5" stop-color="#b4a2c3"/><stop offset="1" stop-color="#8c81a3"/></linearGradient>
 {defs}<g id="bouquet">{bouquet_raw(0,0)}</g></defs>{content}</svg>'''
 return re.sub(r"-?\d+\.\d{3,}(?:e-\d+)?",lambda m:format(float(m[0]),".2f").rstrip("0").rstrip("."),result)

def leaf(x,y,size=24,angle=0):
 p=f'<g transform="translate({x},{y}) rotate({angle})"><path d="M0 0C{-size*.65} {-size*.32} {-size*.55} {-size*.85} 0 {-size}C{size*.6} {-size*.85} {size*.63} {-size*.3} 0 0" fill="url(#leaf)"/>'
 for i in range(1,13):
  t=i/14; yy=-size*t; ww=math.sin(t*math.pi)*size*.29
  p+=f'<path d="M{-ww:.2f} {yy-size*.09:.2f}L0 {yy:.2f}L{ww:.2f} {yy-size*.09:.2f}" fill="none" stroke="{["#bcc7a0","#80966d","#d0d0a7"][i%3]}" stroke-width=".6" opacity=".75"/>'
 return p+'<path d="M0 0V-'+str(size)+'" stroke="#d1cbae" stroke-width=".8" opacity=".6"/></g>'

def rose(x,y,r=28):
 p=f'<g transform="translate({x},{y})">'
 for ring,n in [(1,9),(.73,7),(.48,5)]:
  for i in range(n):
   a=i*360/n+ring*45
   p+=f'<g transform="rotate({a})"><ellipse cy="{-r*ring*.5}" rx="{r*ring*.48}" ry="{r*ring*.53}" fill="url(#rose)" stroke="#b9766a" stroke-width=".65"/>'
   for j in range(9):
    off=(j-4)*r*ring*.08
    p+=f'<path d="M{off*.45:.2f} {-r*ring*.14:.2f}Q{off*1.2:.2f} {-r*ring*.59:.2f} {off:.2f} {-r*ring*.93:.2f}" stroke="#f7d8c8" opacity=".5" fill="none" stroke-width=".6"/>'
   p+='</g>'
 p+=f'<circle r="{r*.16}" fill="#ad7264"/><path d="M{-r*.1} 0Q0 {-r*.17} {r*.13} 0Q0 {r*.11} {-r*.1} 0" stroke="#efc4af" stroke-width="1.5" fill="none"/></g>'
 return p

def flower(x,y,r=20,color='blue',petals=7):
 p=f'<g transform="translate({x},{y})">'
 for i in range(petals):
  p+=f'<g transform="rotate({i*360/petals})"><ellipse cy="{-r*.55}" rx="{r*.32}" ry="{r*.52}" fill="url(#{color})" stroke="{ "#668b99" if color=="blue" else "#a394b5"}" stroke-width=".5"/>'
  for k in range(5):
   xx=(k-2)*r*.09
   p+=f'<path d="M0 {-r*.1}Q{xx} {-r*.6} {xx} {-r*.98}" fill="none" stroke="#fff4e5" opacity=".55" stroke-width=".55"/>'
  p+='</g>'
 p+=f'<circle r="{r*.18}" fill="#cfb66d"/>'
 for i in range(10):
  a=i*2.4; rr=r*.12
  p+=f'<circle cx="{math.cos(a)*rr}" cy="{math.sin(a)*rr}" r=".9" fill="#f5df9e"/>'
 return p+'</g>'

def sprig(x,y,scale=1,angle=0):
 p=f'<g transform="translate({x},{y}) rotate({angle}) scale({scale})"><path d="M0 0Q-22 -65 0 -140" stroke="#68724b" stroke-width="2.5" fill="none"/><path d="M2 0Q-20 -65 2 -140" stroke="#bbbfa0" stroke-width=".7" fill="none"/>'
 for i in range(6):
  p+=leaf(-10,-20-i*18,28-i*1.7,-55)+leaf(-9,-30-i*18,30-i*2.1,52)
 return p+'</g>'

def wisteria(x,y,length=130):
 p=f'<g transform="translate({x},{y})"><path d="M0 0Q15 {length*.5} 3 {length}" stroke="#829267" stroke-width="1.4" fill="none"/>'
 for i in range(int(length/8)):
  yy=i*8; rr=(1-i/(length/8)) * 8+2
  p+=f'<g transform="translate({(i%2*2-1)*rr*.6+math.sin(i*.6)*4},{yy}) rotate({(i%2*2-1)*25})"><ellipse rx="{rr}" ry="{rr*1.25}" fill="url(#purple)" stroke="#a999b9" stroke-width=".6"/><path d="M-2 {-rr*.8}Q-4 0 -1 {rr*.8}M1 {-rr*.9}Q-1 0 2 {rr*.8}" fill="none" stroke="#eedeea" opacity=".7" stroke-width=".6"/></g>'
 return p+'</g>'

def bouquet_raw(x,y,scale=1,angle=0):
 p=f'<g filter="url(#thread)" transform="translate({x},{y}) rotate({angle}) scale({scale})">'
 p+=sprig(-3,35,1,-43)+sprig(23,18,1.06,43)+sprig(0,12,1.14,5)
 p+=leaf(-55,-22,40,-68)+leaf(60,-10,43,65)
 p+=rose(-22,-23,31)+rose(30,-61,23)+flower(48,4,22)+flower(-56,-58,18)+flower(2,-103,17,'purple',5)
 return p+'</g>'

def bouquet(x,y,scale=1,angle=0):
 return f'<use href="#bouquet" transform="translate({x},{y}) rotate({angle}) scale({scale})"/>'

def church(x=0,y=0,scale=1):
 p=f'<g transform="translate({x},{y}) scale({scale})" stroke-linejoin="round" filter="url(#thread)">'
 p+='''<path d="M35 283H322M53 276H304M69 268H289" stroke="#b5a18b" fill="none" stroke-width="4"/>
 <path d="M46 129L76 104H271L307 129V267H46Z" fill="#ebe6d6" stroke="#a19e8c" stroke-width="2"/>
 <path d="M76 113V264M273 112V264" stroke="#d0c7b3" stroke-width="6"/>
 <path d="M76 118H273V264H76Z" fill="#f8f1df" stroke="#b8b09b" stroke-width="1.5"/>
 <path d="M31 129L74 101L141 76H213L277 99L323 129L308 136H42Z" fill="#a68c79" stroke="#796e60" stroke-width="2"/>
 <path d="M150 75V19L166 9H192L208 19V75" fill="#8b8b77" stroke="#6f7562" stroke-width="2"/>
 <path d="M143 22L150 10L166 0H193L208 10L216 22Z" fill="#6f7968"/>
 <path d="M166 28H192V62H166Z" fill="#4d5e52" stroke="#c5bf9e" stroke-width="2"/>
 <path d="M131 257V210Q174 184 217 210V257Z" fill="#687364" stroke="#ac9d7c" stroke-width="3"/>
 <path d="M174 202V258" stroke="#adac8f" stroke-width="2"/>
 <circle cx="184" cy="233" r="2.2" fill="#d1b776"/>
 <path d="M139 177V141Q174 119 210 141V177Z" fill="#7d938b" stroke="#cac1a8" stroke-width="4"/>
 <path d="M152 136V175M167 130V175M182 130V175M197 136V175M140 146H210M140 160H210" stroke="#eee6d5" stroke-width="2"/>
 <path d="M49 240V167Q58 145 70 162V240M281 239V165Q295 146 304 165V239" stroke="#c1b79f" fill="#8d9a8a" stroke-width="3"/>
 <path d="M75 193H130M218 193H273M75 208H130M219 208H273M76 226H127M221 226H273M77 244H127M221 244H273M77 154H132M216 154H272M78 171H134M216 171H271" stroke="#cec5b0" stroke-width="1.4"/>
 <path d="M172 0V-17M166 -11H178" stroke="#89917c" stroke-width="2"/>
 '''
 # individual stitches across roof, walls and shutters
 for i in range(45):
  xx=48+i*5.7; top=127-45*max(0,1-abs(xx-175)/125)
  p+=f'<path d="M{xx} {top:.1f}l3 5" stroke="#d5b7a0" stroke-width=".75" opacity=".65"/>'
 for yy in range(32,61,4): p+=f'<path d="M167 {yy}H191" stroke="#9eaa8b" stroke-width=".8"/>'
 for xx in range(134,215,4): p+=f'<path d="M{xx} 213V256" stroke="#b7ba9c" stroke-width=".7" opacity=".45"/>'
 return p+'</g>'

def mago():
 p='<g stroke-linejoin="round" filter="url(#thread)">'
 p+='''<path d="M35 101L120 52H325L357 101Z" fill="#809081" stroke="#566e5c" stroke-width="2"/>
 <path d="M51 101H347V259H51Z" fill="#f2e9d7" stroke="#a59f8c" stroke-width="2"/>
 <path d="M51 184H347V260H51Z" fill="#b9a087"/><path d="M36 183H363" stroke="#61745e" stroke-width="5"/>
 <path d="M80 116H106V151H80ZM157 116H183V151H157ZM239 116H265V151H239ZM297 116H323V151H297Z" fill="#687c6e" stroke="#cfc5ac" stroke-width="3"/>
 <path d="M82 199H125V257H82ZM155 197H208V257H155ZM239 199H290V248H239ZM305 199H331V248H305Z" fill="#e7d09a" stroke="#626e58" stroke-width="3"/>
 <path d="M168 197V257M194 197V257M256 199V248M314 199V248" stroke="#6c7861" stroke-width="2"/>
 <text x="199" y="177" fill="#4a6050" text-anchor="middle" font-family="Georgia,serif" font-size="17" letter-spacing="5">MAGO</text>
 <path d="M24 266H377" stroke="#a8a487" stroke-width="3"/>
 <path d="M40 184Q155 213 361 184" stroke="#a59b70" stroke-width="1.3" fill="none"/>
 <path d="M104 242H143M111 244L108 266M135 244L139 266M273 253H309M280 254L277 269M302 254L308 269" stroke="#69715a" stroke-width="2"/>
 '''
 for xx in range(62,351,19): p+=f'<circle cx="{xx}" cy="{193+8*math.sin((xx-40)/321*math.pi):.1f}" r="2.5" fill="#eac683"/>'
 for yy in range(190,258,7): p+=f'<path d="M52 {yy}H80M127 {yy}H154M210 {yy}H237M333 {yy}H346" stroke="#e1c7a4" stroke-width="1" opacity=".75"/>'
 p+=sprig(37,267,.8,-4)+sprig(357,269,.8,10)
 return p+'</g>'

# An ornamental garden frame, spacious enough to carry live typography.
garden=''
garden+='<path d="M180 775C100 614 122 437 110 255C102 130 200 65 348 81M820 775C900 614 878 437 890 255C898 130 800 65 652 81" stroke="#7c8860" stroke-width="3" fill="none" filter="url(#thread)"/>'
for side in [1,-1]:
 for i in range(7):
  xx=110+math.sin(i*.8)*13; yy=175+i*79
  if side==-1: xx=1000-xx
  garden+=leaf(xx,yy,37,-side*52)+leaf(xx,yy+24,30,side*36)
 for i in range(5):
  x=183+i*40 if side==1 else 817-i*40
  garden+=wisteria(x,97+i%2*4,105-i*11)
 garden+=bouquet(130 if side==1 else 870,335,.95,side*-10)
 garden+=bouquet(190 if side==1 else 810,787,1.32,side*-38)
 garden+=rose(125 if side==1 else 875,542,23)
 garden+=flower(118 if side==1 else 882,630,18,'purple')
 garden+=sprig(270 if side==1 else 730,870,1.02,side*62)
garden+=bouquet(277,127,.63,-67)+bouquet(723,127,.63,67)
# Pearl canopy.
for xx,drop in [(340,44),(374,68),(407,87),(441,101),(475,111),(509,114),(543,109),(577,98),(611,83),(645,62),(679,37)]:
 for i in range(int(drop/8)):
  garden+=f'<circle cx="{xx}" cy="{39+i*8}" r="2.7" fill="#f2e8d3" stroke="#beaf90" stroke-width=".6"/>'
# Low garden and a stylised fountain.
garden+='<g filter="url(#thread)"><path d="M402 851Q500 876 598 851L577 871H423Z" fill="#d2c6a9" stroke="#aaa78b" stroke-width="2"/><path d="M484 856L489 823H511L516 856" fill="#dbd0b4" stroke="#aba88c" stroke-width="2"/><path d="M456 812Q500 830 544 812L535 825H465Z" fill="#e1d5b9" stroke="#aaa78a" stroke-width="2"/><path d="M496 813V783H504V813" fill="#cec4a9" stroke="#aaa78a" stroke-width="1.5"/><path d="M500 783Q476 797 474 815M500 783Q524 797 526 815" fill="none" stroke="#89a9ab" stroke-width="1.5"/><circle cx="500" cy="780" r="5" fill="#dfd1ac"/></g>'
for xx in [338,368,632,662]: garden+=flower(xx,850,15)+leaf(xx,876,31,xx%40-20)
(OUT/'garden-frame.svg').write_text(svg(garden,1000,940))
(OUT/'bouquet.svg').write_text(svg(bouquet(160,220,1.22,0),320,300))
(OUT/'church.svg').write_text(svg(church(47,50,.93)+bouquet(65,327,.55,-48)+bouquet(346,327,.55,48),420,370))
(OUT/'mago.svg').write_text(svg(mago()+bouquet(74,285,.45,-40)+bouquet(338,285,.45,40),400,320))
# A horizontal garland and a tiny stitched monogram ornament.
garland=''
for i in range(7): garland+=bouquet(80+i*106,148,.47,(-1)**i*68)
(OUT/'garland.svg').write_text(svg(garland,800,210))
wreath=''
for i in range(12):
 a=i*math.pi/6; x=100+72*math.cos(a); y=100+72*math.sin(a)
 wreath+=leaf(x,y,26,a*180/math.pi+90)
wreath+=rose(54,156,17)+flower(147,43,13)+flower(157,149,13,'purple')
(OUT/'wreath.svg').write_text(svg(wreath,200,200))
print('Six original embroidered SVG illustrations created.')

mobile='<path d="M61 727C23 596 30 470 31 271C32 152 15 89 126 60M369 727C407 596 400 470 399 271C398 152 415 89 304 60" stroke="#84926c" stroke-width="1.8" fill="none"/>'
for side in [1,-1]:
 for i in range(7):
  xx=31 if side==1 else 399
  mobile+=leaf(xx,251+i*59,22,-side*48)+leaf(xx,271+i*59,18,side*42)
 mobile+=bouquet(40 if side==1 else 390,222,.42,-side*14)
 mobile+=bouquet(68 if side==1 else 362,735,.62,-side*38)
 mobile+=bouquet(101 if side==1 else 329,72,.45,-side*56)
 for i in range(3):
  mobile+=wisteria(29+i*18 if side==1 else 401-i*18,89,73-i*9)
 mobile+=flower(34 if side==1 else 396,478,11,'purple')
for x,d in [(145,28),(165,42),(185,54),(205,60),(225,60),(245,54),(265,42),(285,28)]:
 for i in range(int(d/7)):
  mobile+=f'<circle cx="{x}" cy="{17+i*7}" r="1.8" fill="#f1e6d0" stroke="#bdac88" stroke-width=".5"/>'
mobile+='<g transform="translate(215,780)"><path d="M-44 0Q0 12 44 0L35 12H-35Z" fill="#d2c6a9" stroke="#aaa78b" stroke-width="1"/><path d="M-6 0L-4-18H4L6 0M-21-22Q0-13 21-22L17-15H-17Z" fill="#dbd0b4" stroke="#aaa78b" stroke-width="1"/><path d="M0-22V-40M0-40Q-12-33-12-23M0-40Q12-33 12-23" fill="none" stroke="#89a9ab" stroke-width="1"/><circle cy="-41" r="2.5" fill="#cfb98a"/></g>'
(OUT/'garden-mobile.svg').write_text(svg(mobile,430,830))
