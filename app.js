const J=window.JOURNAL, TM=window.TELEMETRY;
const toS=s=>{if(s==null)return null;if(typeof s==='number')return s;const[m,r]=s.split(':');return +m*60+ +r};
const fmt=(t,d=3)=>{if(t==null)return'—';const m=Math.floor(t/60);return m+':'+(t-m*60).toFixed(d).padStart(d+3,'0')};
const PAGES=[['overview','Обзор'],['progress','Прогресс · Mugello'],['sectors','Сектора'],['corners','Повороты'],['incidents','Инциденты'],['hardware','Железо и настройки'],['guides','Гайды и ссылки'],['guide','Гайд тренера: Mugello'],['goals','Цели и план']];
const charts=[];
if(window.Chart){Chart.defaults.color='#8b95a3';Chart.defaults.borderColor='#262c35';Chart.defaults.font.family='Inter';Chart.defaults.animation=false}
const nav=document.getElementById('nav');
nav.innerHTML=PAGES.map(([id,t],i)=>`<a href="#${id}" data-id="${id}"><i>${String(i+1).padStart(2,'0')}</i>${t}</a>`).join('');
const app=document.getElementById('app');
function route(){const id=(location.hash||'#overview').slice(1);const p=PAGES.find(x=>x[0]===id)?id:'overview';
 charts.splice(0).forEach(c=>c.destroy());nav.querySelectorAll('a').forEach(a=>a.classList.toggle('on',a.dataset.id===p));
 app.innerHTML='';R[p]();window.scrollTo(0,0)}
window.addEventListener('hashchange',route);
const noChart='<div class="ph">График не загрузился (нет доступа к CDN Chart.js)</div>';
function chart(el,cfg){if(!window.Chart){el.innerHTML=noChart;return}const c=document.createElement('canvas');el.appendChild(c);charts.push(new Chart(c,cfg))}
const H=(t,s)=>`<h1>${t}</h1><div class="sub">${s||''}</div>`;
const R={
overview(){const s=J.stats,c=s.career,ses=J.mugello.sessions,last=ses[ses.length-1];
 app.innerHTML=H('Обзор',`${J.driver.sim} · ${J.driver.simNote}`)+`
 <div class="grid g4">
  <div class="card acc"><div class="k">Машина</div><div style="font-size:20px;font-weight:800">${J.car}</div><div class="note">Сетап: ${J.setup}</div></div>
  <div class="card acc"><div class="k">Серия</div><div style="font-size:20px;font-weight:800">${J.series}</div><div class="note">Трассы блока: ${J.seriesTracks.join(', ')}</div></div>
  <div class="card teal"><div class="k">iRating</div><div class="v">${s.iRating}</div><div class="note">на ${s.date} · ${s.season}</div></div>
  <div class="card teal"><div class="k">Safety Rating</div><div class="v">${s.sr} <small>${s.licenseClass}</small></div><div class="note">ttRating ${s.ttRating} · на ${s.date}</div></div>
 </div>
 <div class="insight">Ключевой вывод: <span>средний чистый круг и стабильность важнее лучшего круга.</span> Последняя сессия (${J.latest.date}, ${J.latest.setup}, ${J.latest.line}): лучший ${last.best} (с инцидентом), лучший чистый ${last.bestClean}, средний чистый ${last.avg} (σ ${last.sigma}), инцидентов ${last.inc}.</div>
 <h2>To-do от тренера</h2><div class="card">${J.todo.map(t=>`<div class="goal"><span class="dot ${t.warn?'now':'next'}"></span><div style="flex:1">${t.warn?'⚠️ ':''}${t.text}</div>${t.warn?'<span class="tag off">не сделано</span>':''}</div>`).join('')}</div>
 <div class="grid g2">
  <div><h2>Лучший круг по трассам</h2><table><tr><th>Трасса</th><th>Лучший</th><th>Примечание</th></tr>
   ${J.bestLaps.map(b=>`<tr><td>${b.track}</td><td class="n">${b.best||'—'}</td><td>${b.best?b.note:'<span class="note">ещё не ездил / данные появятся</span>'}</td></tr>`).join('')}</table></div>
  <div><h2>Ближайшая цель</h2><div class="card acc"><div style="font-size:20px;font-weight:700">${J.goals.find(g=>g.status==='now').text}</div>
   <div class="note">Затем: ${J.goals.find(g=>g.status==='next').text}. Сейчас без линии: ${last.best} → цель ~${J.mugello.target.slice(0,4)}</div></div>
   <h2>Карьера Sports Car</h2><div class="grid g3">
   ${[['Старты',c.starts],['Победы',c.wins],['Топ-5',c.top5],['Ср. старт',c.avgStart],['Ср. финиш',c.avgFinish],['Инц./гонка',c.incPerRace]].map(([k,v])=>`<div class="card"><div class="k">${k}</div><div class="v" style="font-size:24px">${v}</div></div>`).join('')}
   </div><div class="note">Последние гонки: ${s.recentRaces}. Источник: ${s.source}.</div></div>
 </div>`},
progress(){const S=J.mugello.sessions;
 app.innerHTML=H('Прогресс · Mugello',`${J.car} · 5191 м · данные тренера`)+`
 <table><tr><th>Дата</th><th>Driving Line</th><th>Лучший круг</th><th>Средний чистый</th><th>σ, с</th><th>Инциденты</th><th>Примечание</th></tr>
 ${S.map(s=>`<tr><td>${s.date}</td><td><span class="tag ${s.drivingLine?'on':'off'}">${s.lineLabel||(s.drivingLine?'с линией':'без линии')}</span></td><td class="n">${s.best}</td><td class="n">${s.avg||'—'}</td><td class="n">${s.sigma??'—'}</td><td class="n">${s.inc??'—'}</td><td class="note">${s.note||''}</td></tr>`).join('')}</table>
 <h2>Лучший и средний круг по сессиям</h2><div class="chartbox" id="c1"></div>
 <div class="note">Пунктир: baseline с линией ${J.mugello.baseline} и цель ~1:49.000. Чем ниже — тем быстрее.</div>
 <h2>Заметки</h2><ul class="list">${J.progressNotes.map(n=>`<li class="${n.type}">${n.text}</li>`).join('')}</ul>
 <h2>Круги по сессиям (телеметрия .ibt)</h2>${lapTables()}`;
 const L=S.map(s=>s.date+(s.drivingLine?' (линия)':''));
 chart(document.getElementById('c1'),{type:'line',data:{labels:L,datasets:[
  {label:'Лучший круг',data:S.map(s=>toS(s.best)),borderColor:'#ff4d1f',backgroundColor:'#ff4d1f',tension:.2,pointRadius:5},
  {label:'Средний чистый',data:S.map(s=>toS(s.avg)),borderColor:'#18c3b1',backgroundColor:'#18c3b1',tension:.2,pointRadius:5,spanGaps:true},
  {label:'Лучший чистый',data:S.map(s=>toS(s.bestClean)),borderColor:'#b06cff',backgroundColor:'#b06cff',pointRadius:6,showLine:false},
  {label:'Baseline 1:49.250',data:S.map(()=>toS(J.mugello.baseline)),borderColor:'#ffb020',borderDash:[6,6],pointRadius:0},
  {label:'Цель ~1:49',data:S.map(()=>toS(J.mugello.target)),borderColor:'#3ccf6e',borderDash:[2,4],pointRadius:0}]},
  options:{maintainAspectRatio:false,scales:{y:{ticks:{callback:v=>fmt(v,1)}}},plugins:{tooltip:{callbacks:{label:c=>c.dataset.label+': '+fmt(c.parsed.y)}}}}})},
sectors(){if(!TM||!TM.sessions){app.innerHTML=H('Сектора')+'<div class="ph">Данные появятся после разбора телеметрии.</div>';return}
 const st=TM.sectorStarts.map(p=>(p*100).toFixed(2)+'%');
 app.innerHTML=H('Сектора',`Границы секторов из SplitTimeInfo: S1 0 → ${st[1]}, S2 → ${st[2]}, S3 → финиш. Время — по телеметрии .ibt (шаг 1/60 с).`)+`
 <table><tr><th>Сессия</th><th>Лучший круг</th><th>S1</th><th>S2</th><th>S3</th><th>Лучшие S1 / S2 / S3</th><th>Идеальный круг</th><th>Потенциал</th></tr>
 ${TM.sessions.map(s=>`<tr><td>${s.name}</td><td class="n">${fmt(s.bestLap.time)}</td>${s.bestLap.sectors.map(x=>`<td class="n">${x.toFixed(3)}</td>`).join('')}<td class="n">${s.bestSectors.map(x=>x.toFixed(3)).join(' / ')}</td><td class="n" style="color:#18c3b1">${fmt(s.ideal)}</td><td class="n">−${(s.bestLap.time-s.ideal).toFixed(3)}</td></tr>`).join('')}</table>
 <div class="note">Идеальный круг = сумма лучших секторов сессии. В гайде тренера baseline: лучшие сектора 39.567 / 31.183 / 38.383, оптимум 1:49.133 — телеметрия здесь даёт S3 38.400 и 1:49.150 (разница из-за округления до кадра 1/60 с; правильным считаем число тренера).</div>
 <h2>Сектора лучшего круга по сессиям</h2><div class="chartbox" id="c2"></div>
 <h2>Отставание от baseline по секторам (лучшие сектора), с</h2><div class="chartbox" id="c3" style="height:300px"></div>`;
 const L=TM.sessions.map(s=>s.name.split(' — ')[0]+(s.drivingLine?' (линия)':'')),col=['#ff4d1f','#18c3b1','#ffb020'];
 chart(document.getElementById('c2'),{type:'bar',data:{labels:L,datasets:[0,1,2].map(k=>({label:'S'+(k+1),data:TM.sessions.map(s=>s.bestLap.sectors[k]),backgroundColor:col[k]}))},options:{maintainAspectRatio:false,scales:{y:{min:30,title:{display:true,text:'секунды'}}}}});
 const b=TM.sessions[0].bestSectors;
 chart(document.getElementById('c3'),{type:'bar',data:{labels:L.slice(1),datasets:[0,1,2].map(k=>({label:'S'+(k+1),data:TM.sessions.slice(1).map(s=>+(s.bestSectors[k]-b[k]).toFixed(3)),backgroundColor:col[k]}))},options:{maintainAspectRatio:false}})},
corners(){const prev=TM?TM.sessions.find(s=>s.name.startsWith('24.10')):null,base=TM?TM.sessions[0]:null;
 const br=(s,z)=>{const a=s&&s.braking[z];return a?a.map(x=>`${x.median_m} м ±${x.sd_m} <span class="note">(${x.file.slice(5,16)}, n=${x.n})</span>`).join('<br>'):'—'};
 app.innerHTML=H('Повороты Mugello','Карточки по гайду тренера + анализ ошибок. [ориентир] — общий ориентир GT3, проверить в Test Drive с Driving Line.')+`
 <div style="display:grid;grid-template-columns:1fr 360px;gap:20px;align-items:start"><div class="grid g2">
 ${J.corners.map(c=>`<div class="card corner ${c.inc?'acc':''}">${c.inc||c.inc2510?`<div class="badge">${c.inc?c.inc+' инц.':c.inc2510}</div>`:''}<span class="t">${c.turn}</span><h3>${c.name}</h3><div class="d">${c.dir} · ${c.gear} · ${c.speed}</div>
  <dl><dt>Торможение</dt><dd>${c.braking}</dd><dt>Ориентиры</dt><dd>${c.ref}</dd><dt>Типичная ошибка</dt><dd class="err">${c.mistake}</dd><dt>Совет</dt><dd class="adv">${c.advice}</dd>
  ${c.stability?`<dt>Стабильность</dt><dd>${c.stability}</dd>`:''}
  ${c.brake2510?`<dt>Торможение 25.10</dt><dd class="mono" style="font-size:13px;color:#18c3b1">${c.brake2510} <span class="note">(тренер)</span></dd>`:''}${c.tele?`<dt>Ранее (ibt)</dt><dd class="mono" style="font-size:12px">baseline: ${br(base,c.tele)}<br>24.10: ${br(prev,c.tele)}</dd>`:''}</dl></div>`).join('')}
 </div><div class="card" style="position:sticky;top:20px"><img src="guides/img/mugello-map-15-turns.png" style="width:100%;background:#fff;border-radius:6px"><div class="note">Карта: Wikimedia Commons, Will Pittenger, CC BY-SA 3.0. Движение по часовой.</div>
 <h2>Как читать «начало торможения»</h2><div class="note">Медиана дистанции от старта (м) и σ точки, где тормоз > 10%, по каждому кругу из .ibt. Показано, только если в зоне ровно одно торможение на круг; иначе «—». Оценки по телеметрии грубые — для разброса на входе в S2 опирайся на цифру тренера (41 м → 12–18 м).</div></div></div>`},
incidents(){const I=J.incidents;
 app.innerHTML=H('Инциденты','Где и почему')+`<div class="insight">${I.summary}</div>
 <div class="grid g2"><div class="chartbox" id="c4"></div><div>${I.byCorner.map(b=>`<div class="card acc" style="margin-bottom:16px"><div class="k">${b.corner} · ${b.pctLabel} инцидентов</div><div style="margin:8px 0"><b>Почему:</b> <span style="color:#ff8a6b">${b.why}</span></div><div><b>Что делать:</b> <span style="color:#8ff0e4">${b.fix}</span></div></div>`).join('')}</div></div>
 <div class="note">${I.pctNote}</div>
 <h2>25.10.2026 — где были инциденты</h2><table><tr><th>Место</th><th>Дистанция</th><th>Круги</th><th>Кол-во</th></tr>${I.session2510.map(x=>`<tr><td>${x.where}</td><td class="n">${x.dist}</td><td>${x.laps}</td><td class="n">${x.count}</td></tr>`).join('')}</table><div class="note">${I.session2510Note}</div>
 <h2>Инциденты по сессиям (данные тренера)</h2><div class="chartbox" id="c5" style="height:280px"></div>`;
 chart(document.getElementById('c4'),{type:'bar',data:{labels:I.byCorner.map(b=>b.corner),datasets:[{label:'% инцидентов',data:I.byCorner.map(b=>b.pct),backgroundColor:['#ff4d1f','#ffb020']}]},options:{indexAxis:'y',maintainAspectRatio:false,scales:{x:{max:100,ticks:{callback:v=>v+'%'}}},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>I.byCorner[c.dataIndex].pctLabel}}}}});
 const S=J.mugello.sessions.filter(s=>s.inc!=null);
 chart(document.getElementById('c5'),{type:'bar',data:{labels:S.map(s=>s.date),datasets:[{label:'Инциденты',data:S.map(s=>s.inc),backgroundColor:'#18c3b1'}]},options:{maintainAspectRatio:false,plugins:{legend:{display:false}}}})},
hardware(){const h=J.hardware,t=rows=>`<table>${rows.map(r=>`<tr><td style="color:#8b95a3;width:40%">${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>`;
 app.innerHTML=H('Железо и настройки')+`<div class="grid g2"><div><h2>ПК</h2>${t(h.pc)}</div><div><h2>MOZA</h2>${t(h.moza)}</div></div>
 <h2>Настройки руля</h2><table><tr><th>Параметр</th><th>Сейчас</th><th>Было</th></tr>${h.settings.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td class="note">${r[2]}</td></tr>`).join('')}</table>
 <h2>Апгрейды MOZA — по порядку <span class="note" style="letter-spacing:0;text-transform:none">совет тренера от ${h.upgradesDate}</span></h2>
 <div class="grid g3">${h.upgrades.map((u,i)=>`<div class="card acc"><div class="prio">${i+1}</div><div style="font-weight:700;font-size:17px;margin-bottom:6px">${u.title}</div><div class="note" style="font-size:14px">${u.text}</div></div>`).join('')}</div>
 <div class="note" style="margin-top:10px">⛔ ${h.upgradesNote}</div>
 <div class="grid g2" style="margin-top:20px"><div class="card teal"><div class="k">Угол поворота: почему 900°</div><div style="margin-top:8px">${h.rotationNote}</div></div>
 <div class="card acc"><div class="k">FFB — совет тренера (не применён)</div><div style="margin-top:8px;font-weight:600">${h.reminder}</div>
 <div style="margin-top:10px" class="warn">⚠️ На ${J.ffbStatus.date}: сила руля всё ещё ${J.ffbStatus.strengthNm} Нм, клиппинг ${J.ffbStatus.clippingPct}%.</div><div class="note">Альтернатива — Auto в iRacing.</div></div></div>`},
guides(){app.innerHTML=H('Гайды и ссылки')+`<div class="grid g3">${J.guides.map(g=>`<a class="card teal" style="text-decoration:none;color:inherit" href="${g.url}" ${g.url.startsWith('#')?'':'target="_blank" rel="noopener"'}><div style="font-weight:700;font-size:17px">${g.name}</div><div class="note">${g.url.startsWith('#')?'Открыть в журнале':g.url}</div></a>`).join('')}</div>
 <h2>Чеклист перед сессией</h2><div class="card"><ol class="list">${J.checklist.map(c=>`<li>${c}</li>`).join('')}</ol></div>`},
guide(){app.innerHTML=H('Гайд тренера: Mugello','Mercedes-AMG GT3 · guides/mugello-mercedes-gt3-guide.md')+'<div class="md" id="md">Загрузка…</div>';
 fetch('guides/mugello-mercedes-gt3-guide.md').then(r=>r.text()).then(t=>{const el=document.getElementById('md');if(!el)return;
  el.innerHTML=window.marked?marked.parse(t.replace(/\]\(img\//g,'](guides/img/')):'<pre>'+t.replace(/</g,'&lt;')+'</pre>'}).catch(()=>{document.getElementById('md').innerHTML='Не удалось загрузить гайд (открой сайт через http-сервер).'})},
goals(){app.innerHTML=H('Цели и план')+`<div class="card">${J.goals.map(g=>`<div class="goal"><span class="dot ${g.status}"></span><div style="flex:1">${g.text}</div><span class="tag ${g.status==='now'?'off':g.status==='next'?'bad':''}">${{now:'сейчас',next:'следующая',later:'позже'}[g.status]}</span></div>`).join('')}</div>
 <h2>Фокус на ближайшие сессии</h2><div class="grid g3">
 <div class="card acc"><div class="k">Arrabbiata</div>Ждать апекс, плавный газ, вся ширина выхода</div>
 <div class="card acc"><div class="k">Casanova</div>Закончить торможение раньше, по прямой</div>
 <div class="card teal"><div class="k">Стабильность</div>Серии чистых кругов: средний и σ важнее лучшего</div></div>
 <h2>Чеклист</h2><div class="card"><ol class="list">${J.checklist.map(c=>`<li>${c}</li>`).join('')}</ol></div>`}
};
function lapTables(){if(!TM)return'<div class="ph">Данные появятся</div>';
 return TM.sessions.map(s=>{const b=s.bestLap.time;return `<details><summary>${s.name} — ${s.laps.length} полных кругов, лучший ${fmt(b)}</summary>
 <table style="margin-top:10px"><tr><th>Файл</th><th>Круг</th><th>Время</th><th>S1</th><th>S2</th><th>S3</th><th>Инц.</th><th>Статус</th></tr>
 ${s.laps.map(l=>`<tr class="${l.time===b?'best':''}"><td class="note">${l.file}</td><td class="n">${l.lap}</td><td class="n">${fmt(l.time)}</td>${l.sectors.map(x=>`<td class="n">${x.toFixed(3)}</td>`).join('')}<td class="n">${l.inc}</td><td><span class="tag ${l.valid?'ok':'bad'}">${l.valid?'чистый':'инцидент'}</span></td></tr>`).join('')}</table></details>`}).join('')+
 '<div class="note">Из телеметрии: только полные круги без пит-лейна. «Инцидент» = счётчик инцидентов вырос за круг. Средние/σ в таблице выше — от тренера (по его выборке чистых кругов).</div>'}
document.querySelector('.side-foot').innerHTML='Обновлено: '+(J.updated||'—')+'<br>'+document.querySelector('.side-foot').innerHTML;
route();
