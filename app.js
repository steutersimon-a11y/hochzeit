(() => {
  'use strict';
  const originalHTML = '<!doctype html>\n' + document.documentElement.outerHTML;
  const config = window.WEDDING;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeTrigger = null;
  const icons = {
    sun:'<circle cx="16" cy="16" r="5"/><path d="M16 3v4m0 18v4M3 16h4m18 0h4M7 7l3 3m12 12 3 3M7 25l3-3M22 10l3-3"/>',
    rings:'<circle cx="12" cy="18" r="7"/><circle cx="21" cy="18" r="7"/><path d="m8 7 4-4 4 4-4 5Z"/>',
    glasses:'<path d="m7 5 6 3-4 10c-3 4-9 0-6-4Zm18 0-6 3 4 10c3 4 9 0 6-4ZM6 19l-3 7m-3-1 7 3M26 19l3 7m-4 2 7-3M14 4l2 3 2-3"/>',
    leaf:'<path d="M7 26C8 12 17 5 27 4c1 12-6 22-20 22ZM7 26 23 8M13 18l9 1M18 12l-1-6"/>',
    dinner:'<circle cx="17" cy="17" r="9"/><circle cx="17" cy="17" r="6"/><path d="M3 4v9m3-9v9M1 4v6q2 6 6 0V4M4 14v15M30 4v25m0-25q-5 4-4 12h4"/>',
    music:'<path d="M12 23V8l14-4v17M12 12l14-4"/><ellipse cx="8" cy="24" rx="4" ry="3"/><ellipse cx="22" cy="22" rx="4" ry="3"/>'
  };
  const pathValue = (path) => path.split('.').reduce((v,k) => v?.[k], config);
  const inlineNames = () => config.names.join(' & ');

  function render() {
    $$('[data-bind]').forEach(el => { el.textContent = pathValue(el.dataset.bind) ?? ''; });
    $$('[data-name]').forEach(el => { el.textContent = config.names[+el.dataset.name] ?? ''; });
    $$('.names-inline').forEach(el => { el.textContent = inlineNames(); });
    $$('.initials').forEach(el => { el.textContent = config.names.map(n => [...n.trim()][0] || '').join(' · '); });
    document.title = inlineNames() + ' · Wir heiraten';
    $$('[data-map]').forEach(el => { el.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(config[el.dataset.map].mapQuery); });
    $('#timeline').replaceChildren();
    config.timeline.forEach(item => {
      const li = document.createElement('li'); li.className = 'reveal';
      const time = document.createElement('time'); time.textContent = item.time; time.dateTime = item.time;
      const icon = document.createElement('span'); icon.className = 'timeline-icon'; icon.setAttribute('aria-hidden','true');
      icon.innerHTML = '<svg viewBox="0 0 32 32">' + (icons[item.icon] || icons.leaf) + '</svg>';
      const copy = document.createElement('div'), title = document.createElement('h3'), text = document.createElement('p');
      title.textContent = item.title; text.textContent = item.text; copy.append(title,text); li.append(time,icon,copy); $('#timeline').append(li);
    });
    $('#faq-list').replaceChildren();
    config.details.forEach((item,i) => {
      const details = document.createElement('details'), summary = document.createElement('summary'), text = document.createElement('p');
      summary.textContent = item.title; text.textContent = item.text; details.append(summary,text); if (i === 0) details.open = true; $('#faq-list').append(details);
    });
    $('#rsvp-note').textContent = config.rsvpEmail
      ? 'Eure Antwort wird in eurem E-Mail-Programm vorbereitet. Ihr könnt sie dort noch einmal prüfen und absenden.'
      : 'Die Rückmeldung öffnet in Kürze. Wir freuen uns schon jetzt auf euch.';
    $$('[data-photo]').forEach(loadPhoto);
    updateCountdown(); observeReveals();
  }

  function loadPhoto(el) {
    const src = config.photos[el.dataset.photo];
    const fallback = el.parentElement.querySelector('.photo-fallback,.venue-fallback');
    el.hidden = true; if(fallback) fallback.hidden = false;
    if(!src) return;
    el.onload = () => { el.hidden = false; if(fallback) fallback.hidden = true; };
    el.onerror = () => { el.hidden = true; if(fallback) fallback.hidden = false; };
    el.src = src;
  }

  // A timezone-independent epoch for the Berlin ceremony, including summer time.
  function eventEpoch() {
    const time = config.calendar.startTime;
    const tentative = Date.parse(config.date + 'T' + time + ':00Z');
    if (!Number.isFinite(tentative)) return NaN;
    const parts = new Intl.DateTimeFormat('en-US',{timeZone:config.calendar.timezone,timeZoneName:'shortOffset',hour:'2-digit'}).formatToParts(tentative);
    const offset = parts.find(p => p.type === 'timeZoneName')?.value.match(/GMT([+-])(\d+)(?::(\d+))?/);
    const minutes = offset ? (+offset[2]*60 + +(offset[3] || 0)) * (offset[1] === '+' ? 1 : -1) : 0;
    return tentative - minutes*60000;
  }
  function updateCountdown() {
    const left = eventEpoch() - Date.now();
    if(!Number.isFinite(left)) return;
    const minutes = Math.max(0,Math.floor(left/60000));
    $('#count-days').textContent = String(Math.floor(minutes/1440)).padStart(2,'0');
    $('#count-hours').textContent = String(Math.floor(minutes%1440/60)).padStart(2,'0');
    $('#count-minutes').textContent = String(minutes%60).padStart(2,'0');
    $('#countdown-note').textContent = left > 0 ? 'Bis wir gemeinsam Erinnerungen sammeln.' : 'Unser Für immer hat begonnen.';
  }
  let observer;
  function observeReveals() {
    if(reducedMotion || !('IntersectionObserver' in window)) return;
    document.body.classList.add('motion-enabled');
    if(!observer) observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
    }),{threshold:.07});
    $$('.reveal:not(.is-visible)').forEach(el => observer.observe(el));
  }

  function openInvitation() {
    $('#opening').classList.add('is-opening'); document.body.classList.remove('opening-active');
    $$('.site-header,main,footer').forEach(el=>{el.inert=false;});
    setTimeout(() => { $('#opening').hidden = true; $('#opening').classList.remove('is-opening'); $('.brand').focus({preventScroll:true}); },reducedMotion ? 0 : 1700);
    try { sessionStorage.setItem('invitation-opened','yes'); } catch(e) { /* File URLs may disable session storage. */ }
  }
  function showOpening() {
    $$('.site-header,main,footer').forEach(el=>{el.inert=true;});window.scrollTo(0,0);
    $('#opening').hidden = false; document.body.classList.add('opening-active'); $('#open-invitation').focus({preventScroll:true});
  }
  $('#opening').addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();openInvitation();}});
  $('#open-invitation').addEventListener('click',openInvitation); $('#open-text').addEventListener('click',openInvitation);
  $('#replay').addEventListener('click',showOpening);
  let alreadyOpened = false;
  try { alreadyOpened = sessionStorage.getItem('invitation-opened') === 'yes'; } catch(e) {}
  const editMode = new URLSearchParams(location.search).has('edit');
  if(!alreadyOpened && !location.hash && !editMode) showOpening();

  function openDialog(dialog,trigger) { activeTrigger = trigger; dialog.showModal(); }
  $$('[data-rsvp]').forEach(button => button.addEventListener('click',() => openDialog($('#rsvp-dialog'),button)));
  $$('[data-close]').forEach(button => button.addEventListener('click',() => button.closest('dialog').close()));
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('click',event => { if(event.target === dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();} });
    dialog.addEventListener('close',() => { activeTrigger?.focus({preventScroll:true}); });
  });
  $$('.photo-frame>[data-photo]').forEach(img => {
    img.tabIndex=0; img.setAttribute('role','button');
    const show = () => { if(img.hidden) return; $('#large-photo').src=img.src; $('#large-photo').alt=img.alt; openDialog($('#photo-dialog'),img); };
    img.addEventListener('click',show); img.addEventListener('keydown',e => {if(e.key==='Enter'||e.key===' '){e.preventDefault();show();}});
  });

  $('#rsvp-form').addEventListener('submit',event => {
    event.preventDefault(); const result = $('#rsvp-result'); result.hidden = false;
    if(!config.rsvpEmail){result.textContent='Unsere Rückmeldung ist noch nicht geöffnet. Bitte schaut bald wieder vorbei. Es wurde keine Antwort verschickt oder gespeichert.';return;}
    const data = new FormData(event.currentTarget);
    const body = ['Liebe '+inlineNames()+',','',String(data.get('attendance')),'Namen: '+data.get('names'),'Erwachsene: '+data.get('adults'),'Kinder: '+data.get('children'),'','Wünsche & liebe Worte:',String(data.get('message'))].join('\n');
    const link = document.createElement('a'); link.href='mailto:'+encodeURIComponent(config.rsvpEmail)+'?subject='+encodeURIComponent('Unsere Rückmeldung zu eurer Hochzeit')+'&body='+encodeURIComponent(body); link.click();
    result.textContent='Eure E-Mail ist vorbereitet. Bitte sendet sie in eurem E-Mail-Programm ab, damit eure Rückmeldung bei uns ankommt.';
  });

  function download(content,type,name) {
    const url = URL.createObjectURL(new Blob([content],{type})); const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
  }
  const icsEscape = value => String(value).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const utcICS = date => new Date(date).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
  $('#save-date').addEventListener('click',() => {
    const start=eventEpoch();if(!Number.isFinite(start))return;
    const [sh,sm]=config.calendar.startTime.split(':').map(Number),[eh,em]=config.calendar.endTime.split(':').map(Number);
    let duration=(eh*60+em-sh*60-sm)*60000;if(duration<=0)duration+=86400000;
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Unser Hochzeitsgarten//DE','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+config.date+'-'+config.names.map(n=>encodeURIComponent(n)).join('-')+'@hochzeitsgarten.local','DTSTAMP:'+utcICS(Date.now()),'DTSTART:'+utcICS(start),'DTEND:'+utcICS(start+duration),'SUMMARY:'+icsEscape('Hochzeit von '+inlineNames()),'LOCATION:'+icsEscape(config.ceremony.name+', '+config.ceremony.address),'DESCRIPTION:'+icsEscape('Trauung: '+config.ceremony.time+' · '+config.ceremony.name+'\nFeier: '+config.party.time+' · '+config.party.name),'END:VEVENT','END:VCALENDAR'];
    // RFC 5545 folds by UTF-8 bytes, preserving multibyte characters.
    const folded=lines.map(line=>{let out='',bytes=0;for(const ch of line){const size=new TextEncoder().encode(ch).length;if(bytes+size>73){out+='\r\n ';bytes=1;}out+=ch;bytes+=size;}return out;}).join('\r\n')+'\r\n';
    download(folded,'text/calendar;charset=utf-8','Unsere-Hochzeit.ics');
  });

  function setupEditor() {
    const bar=document.createElement('div');bar.className='editor-bar';
    const note=document.createElement('span');note.textContent='Designvorschau · Namen & Datum sind Beispielangaben.';
    const button=document.createElement('button');button.textContent='Einladung anpassen';bar.append(note,button);document.body.append(bar);
    const dialog=document.createElement('dialog');dialog.id='editor-dialog';
    dialog.innerHTML='<button class="dialog-close" type="button" aria-label="Schließen">×</button><div class="editor-content"><p class="eyebrow">EUER KLEINES DESIGNATELIER</p><h2>Eine Einladung, die nach euch aussieht.</h2><p class="editor-note">Änderungen bleiben in dieser Vorschau. Mit „HTML speichern“ bekommt ihr eine vollständige Einladung inklusive eurer Bilder – kostenlos und ohne Konto.</p><form id="editor-form"><label>Vorname 1<input name="name1" required></label><label>Vorname 2<input name="name2" required></label><label>Hochzeitsdatum<input name="date" type="date" required></label><label>E-Mail für Rückmeldungen<input name="email" type="email" placeholder="Optional · eure echte Kontaktadresse"></label><div id="image-inputs"></div><button class="primary-button" type="submit">Vorschau aktualisieren ↗</button></form><button class="text-button" id="export-html">HTML mit Bildern speichern ↗</button><p class="editor-note">Alle weiteren Texte und Uhrzeiten könnt ihr in wedding-config.js bearbeiten. Bilddateien verlassen euren Browser erst, wenn ihr die gespeicherte Einladung selbst teilt.</p></div>';
    document.body.append(dialog);dialog.querySelector('.dialog-close').onclick=()=>dialog.close();
    dialog.addEventListener('close',()=>button.focus());button.onclick=()=>openDialog(dialog,button);
    const form=dialog.querySelector('form');form.elements.name1.value=config.names[0];form.elements.name2.value=config.names[1];form.elements.date.value=config.date;form.elements.email.value=config.rsvpEmail;
    const labels={couple:'Euer Paarfoto',hands:'Eure Hände / der Ring',church:'Kirchenillustration',party:'Mago-Illustration oder Foto'};
    Object.entries(labels).forEach(([key,label])=>{
      const wrap=document.createElement('label');wrap.className='image-input';wrap.textContent=label;
      const input=document.createElement('input');input.type='file';input.accept='image/jpeg,image/png,image/webp';
      const status=document.createElement('small');status.textContent='JPG, PNG oder WebP · bis 12 MB';wrap.append(input,status);$('#image-inputs').append(wrap);
      input.onchange=()=>{const file=input.files[0];if(!file)return;if(file.size>12*1024*1024){status.textContent='Bitte eine Datei unter 12 MB wählen.';input.value='';return;}if(!['image/jpeg','image/png','image/webp'].includes(file.type)){status.textContent='Bitte JPG, PNG oder WebP wählen.';return;}const reader=new FileReader();reader.onload=()=>{config.photos[key]=String(reader.result);$$('[data-photo="'+key+'"]').forEach(loadPhoto);status.textContent=file.name+' · eingebunden';};reader.readAsDataURL(file);};
    });
    function applyEditorConfig(){if(!form.reportValidity())return false;const names=[form.elements.name1.value.trim(),form.elements.name2.value.trim()];if(names.some(name=>!name))return false;config.names=names;config.date=form.elements.date.value;const date=new Date(config.date+'T12:00:00Z');config.dateLabel=new Intl.DateTimeFormat('de-DE',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(date);config.weekday=new Intl.DateTimeFormat('de-DE',{weekday:'long',timeZone:'UTC'}).format(date);config.rsvpEmail=form.elements.email.value.trim();render();return true;}
    form.onsubmit=event=>{event.preventDefault();if(applyEditorConfig())dialog.close();};
    $('#export-html').onclick=()=>{
      if(!applyEditorConfig())return;
      const json=JSON.stringify(config,null,2).replace(/</g,'\\u003c');
      const script='<script id="wedding-config">window.WEDDING = '+json+';<\/script>';
      const source=window.INVITATION_TEMPLATE || originalHTML;
      const html=source.replace(/<script id="wedding-config">[\s\S]*?<\/script>/,()=>script);
      download(html,'text/html;charset=utf-8','Unsere-Hochzeit.html');
    };
  }
  render();setInterval(updateCountdown,30000);if(editMode)setupEditor();
})();
