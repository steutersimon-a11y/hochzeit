(() => {
  'use strict';
  const originalHTML = '<!doctype html>\n' + document.documentElement.outerHTML;
  const config = window.WEDDING;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeTrigger = null;
  const pathValue = (path) => path.split('.').reduce((v,k) => v?.[k], config);
  const inlineNames = () => config.names.join(' & ');

  function render() {
    $$('[data-bind]').forEach(el => { el.textContent = pathValue(el.dataset.bind) ?? ''; });
    $$('[data-name]').forEach(el => { el.textContent = config.names[+el.dataset.name] ?? ''; });
    $$('[data-initial]').forEach(el => { el.textContent = [...(config.names[+el.dataset.initial] || '').trim()][0] || ''; });
    $$('.names-inline').forEach(el => { el.textContent = inlineNames(); });
    $$('.initials').forEach(el => { el.textContent = config.names.map(n => [...n.trim()][0] || '').join(' · '); });
    document.title = inlineNames() + ' · Wir heiraten';
    $$('[data-map]').forEach(el => { el.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(config[el.dataset.map].mapQuery); });
    $('#timeline').replaceChildren();
    config.timeline.forEach(item => {
      const li = document.createElement('li'); li.className = 'reveal';
      const time = document.createElement('time'); time.textContent = item.time; time.dateTime = item.time;
      const icon = document.createElement('span'); icon.className = 'timeline-icon'; icon.setAttribute('aria-hidden','true');
      icon.dataset.icon = item.icon;
      const copy = document.createElement('div'), title = document.createElement('h3'), text = document.createElement('p');
      title.textContent = item.title; text.textContent = item.text; copy.append(title,text); li.append(time,icon,copy); $('#timeline').append(li);
    });
    $('#faq-list').replaceChildren();
    $$('[data-detail-title]').forEach(el => { el.textContent = config.details[+el.dataset.detailTitle]?.title || ''; });
    $$('[data-detail-text]').forEach(el => { el.textContent = config.details[+el.dataset.detailText]?.text || ''; });
    config.details.filter((_, i) => i !== 0 && i !== 3).forEach((item,i) => {
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

  async function openInvitation() {
    if ($('#opening').classList.contains('is-opening') || $('#opening').hasAttribute('aria-busy')) return;
    $('#opening').setAttribute('aria-busy', 'true');
    const hero = $('.garden-frame');
    try { if (hero.decode) await hero.decode(); } catch (error) { /* The linen fallback remains visible if an image fails. */ }
    await document.fonts.ready;
    $('#opening').removeAttribute('aria-busy');
    $('#opening').classList.add('is-opening');
    document.body.classList.add('opening-running');
    setTimeout(() => {
      $('#opening').hidden = true;
      $('#opening').classList.remove('is-opening');
      document.body.classList.remove('opening-active', 'opening-running');
      $$('.skip-link,.site-header,main,footer').forEach(el => { el.inert = false; });
      $('.hero-discover').focus({ preventScroll: true });
    }, reducedMotion ? 0 : 3150);
    try { sessionStorage.setItem('invitation-opened-loom-v5', 'yes'); } catch (error) {}
  }
  function showOpening() {
    $$('.skip-link,.site-header,main,footer').forEach(el=>{el.inert=true;});window.scrollTo({top:0,behavior:'instant'});
    $('#opening').hidden = false; document.body.classList.add('opening-active'); $('#opening').focus({preventScroll:true});
  }
  $('#opening').addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();openInvitation();}
    if(event.key==='Tab'){
      const first=$('#open-invitation'),last=$('#open-text');
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===$('#opening'))){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  $('#open-invitation').addEventListener('click',openInvitation); $('#open-text').addEventListener('click',openInvitation);
  $('#replay').addEventListener('click',showOpening);
  let alreadyOpened = false;
  try { alreadyOpened = sessionStorage.getItem('invitation-opened-loom-v5') === 'yes'; } catch(e) {}
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
    const note=document.createElement('span');note.textContent='Designvorschau · Uhrzeiten & weitere Details sind Platzhalter.';
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
    let templateLoading;
    $('#export-html').onclick=async()=>{
      if(!applyEditorConfig())return;
      // The large self-contained export is loaded only when it is requested.
      if(!window.INVITATION_TEMPLATE && !$('#wedding-config')) {
        const button=$('#export-html'); button.disabled=true; button.textContent='Einladung wird vorbereitet …';
        try {
          if(!templateLoading) templateLoading=new Promise((resolve,reject)=>{
            const script=document.createElement('script'); script.src='export-template.js';
            script.onload=resolve; script.onerror=()=>{templateLoading=null;script.remove();reject(new Error('Exportvorlage nicht geladen'));}; document.head.append(script);
          });
          await templateLoading;
        } catch(error) { button.textContent='Bitte erneut versuchen · HTML speichern'; button.disabled=false; return; }
        button.disabled=false; button.textContent='HTML mit Bildern speichern ↗';
      }
      const exportConfig={...config,photos:{...config.photos}};
      Object.entries(exportConfig.photos).forEach(([key,src])=>{exportConfig.photos[key]=window.INVITATION_PHOTOS?.[src] || src;});
      const json=JSON.stringify(exportConfig,null,2).replace(/</g,'\\u003c');
      const script='<script id="wedding-config">window.WEDDING = '+json+';<\/script>';
      const source=window.INVITATION_TEMPLATE || originalHTML;
      const html=source.replace(/<script id="wedding-config">[\s\S]*?<\/script>/,()=>script);
      download(html,'text/html;charset=utf-8','Unsere-Hochzeit.html');
    };
  }
  render();setInterval(updateCountdown,30000);if(editMode)setupEditor();
})();
