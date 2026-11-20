/* =====================================================================
   Misión Estudio · motor común
   Lo cargan todos los juegos, DESPUÉS de su propio <script> de datos.
   El juego define antes: JUEGO (configuración y textos), BLOCKS (bloques
   con nota), MIC (estrellas del ranking), ROUTE_ST (estaciones de la ruta)
   y R (una función por misión). El motor pone R.route, R.arcade y R.exam.
   ===================================================================== */
/* ================== ESTADO ================== */
let XP=0, STREAK=0, BEST={}, BSTREAK=0, EXAMB=null, HIST=[], SEEDED=false, GR={};
try{const s=JSON.parse(localStorage.getItem(JUEGO.claves.estado)||'{}');XP=s.xp||0;BEST=s.best||{};BSTREAK=s.bs||0;EXAMB=s.exam||null;HIST=s.hist||[];SEEDED=!!s.seeded;GR=s.gr||{};}catch(e){}
function save(){try{localStorage.setItem(JUEGO.claves.estado,JSON.stringify({xp:XP,best:BEST,bs:BSTREAK,exam:EXAMB,hist:HIST,seeded:SEEDED,gr:GR}))}catch(e){}}
const MAP=Object.fromEntries(BLOCKS.map(b=>[b.k,1]));
function grade(k,n){n=Math.round(n*10)/10;(GR[k]=GR[k]||[]).push(n);if(GR[k].length>3)GR[k].shift();save();return n}
function nota(k){const a=GR[k];return a&&a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10:null}
function finalNota(){let s=0,w=0,miss=0;BLOCKS.forEach(b=>{const n=nota(b.k);if(n==null)miss++;else{s+=n*b.w;w+=b.w}});return{n:w?Math.round(s/w*10)/10:null,miss}}
function label(n){return n==null?'Sin datos':n<5?'Insuficiente':n<6?'Suficiente':n<7?'Bien':n<9?'Notable':'Sobresaliente'}
function sem(n){return n==null?'⚪':n>=8?'🟢':n>=5?'🟡':'🔴'}
const fmt=n=>n==null?'–':n.toFixed(1).replace('.',',');
function hoyToca(){
  const miss=BLOCKS.find(b=>nota(b.k)==null);if(miss)return{b:miss,why:'aún no lo has jugado'};
  const w=[...BLOCKS].sort((a,b)=>nota(a.k)-nota(b.k))[0];return nota(w.k)>=8?null:{b:w,why:'es tu nota más baja'};}
const MAXSTAR=c=>c=='arcade'?1:3;const MAXST=MIC.reduce((s,[k])=>s+MAXSTAR(k),0);
function starLine(b){return MIC.map(([k,ic])=>{const s=Math.min((b&&b[k])||0,MAXSTAR(k));const M3=MAXSTAR(k);return `<span style="display:inline-block;background:#0c1633;border-radius:8px;padding:2px 7px;margin:2px;white-space:nowrap">${ic} <span style="color:var(--gold)">${'★'.repeat(s)}</span><span style="color:#4a5a8f">${'★'.repeat(M3-s)}</span></span>`}).join('')}
const totalStars=()=>Object.values(BEST).reduce((a,b)=>a+b,0);
/* Partidas antiguas sin desglose: si sus estrellas coinciden con las actuales, se rellena */
HIST.forEach(e=>{if(!e.sb&&e.st===totalStars())e.sb={...BEST}});save();
function hud(){document.getElementById('xp').textContent='⭐ '+XP+' XP';document.getElementById('streak').textContent='🔥 '+STREAK}
function win(n=10){STREAK++;if(STREAK>BSTREAK)BSTREAK=STREAK;XP+=n+(STREAK>=3?5:0);hud();save();if(STREAK%5==0)confetti()}
function lose(){STREAK=0;hud()}
const $=s=>document.querySelector(s);
const app=()=>document.getElementById('app');
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=(a,n)=>shuf(a).slice(0,n);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function confetti(){const e=['⭐','🎉','✨','🏆','💥'];for(let i=0;i<24;i++){const d=document.createElement('div');d.className='conf';d.textContent=e[i%5];d.style.left=Math.random()*100+'vw';d.style.animationDelay=Math.random()*.5+'s';document.body.appendChild(d);setTimeout(()=>d.remove(),2300)}}
function starsFor(p){return p>=.9?3:p>=.7?2:p>=.5?1:0}
function setBest(k,p){const s=starsFor(p);if(!BEST[k]||s>BEST[k])BEST[k]=s;save()}
function starStr(k){const m=k=='arcade'?1:3;const s=Math.min(BEST[k]||0,m);return '★'.repeat(s)+'☆'.repeat(m-s)}

/* ================== MOTOR TEST ================== */
function quiz(title,sub,qs,key,after){
  let i=0,ok=0;qs=qs.map(q=>({...q,opts:shuf(q.opts)}));
  function show(){
    if(i>=qs.length)return end();
    const q=qs[i];
    app().innerHTML=`<div class="box"><h2>${title}</h2><p class="sub">${sub}</p>
    <div class="bar"><div style="width:${i/qs.length*100}%"></div></div>
    <div class="hint">Pregunta ${i+1} de ${qs.length}</div>
    <div class="q">${esc(q.q)}</div><div class="opts">${q.opts.map(o=>`<button class="opt">${esc(o)}</button>`).join('')}</div>
    <div class="fb" id="fb"></div><div id="nx"></div></div>`;
    document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      document.querySelectorAll('.opt').forEach(x=>{x.disabled=true;if(x.textContent==q.a)x.classList.add('ok')});
      if(b.textContent==q.a){ok++;win();$('#fb').innerHTML='✅ ¡Correcto! '+(q.ex?'<span style="color:var(--mut)">'+esc(q.ex)+'</span>':'')}
      else{b.classList.add('bad');b.classList.add('shake');lose();$('#fb').innerHTML='❌ Era: <b>'+esc(q.a)+'</b>. '+(q.ex?esc(q.ex):'')}
      $('#nx').innerHTML='<button class="btn">Siguiente ➜</button>';$('#nx .btn').onclick=()=>{i++;show()};
    });
  }
  function end(){const p=ok/qs.length;setBest(key,p);const g=MAP[key]?grade(key,p*10):null;if(p>=.7)confetti();
    app().innerHTML=`<div class="box center"><div class="big">${p>=.9?'🏆':p>=.7?'🥈':p>=.5?'👍':'💪'}</div>
    <h2>${ok} de ${qs.length}</h2>${g!=null?`<p style="font-size:22px;margin:4px">Nota: <b>${fmt(g)}</b> · ${label(g)} ${sem(g)}</p>`:''}<div class="stars" style="font-size:34px;color:var(--gold)">${'★'.repeat(starsFor(p))}${'☆'.repeat(3-starsFor(p))}</div>
    <p class="sub">${p>=.9?'¡Nivel experto!':p>=.7?'¡Muy bien! Repite para las 3 estrellas.':'Repite la misión, a la segunda sale mejor.'}</p>
    <button class="btn" id="again">🔁 Repetir</button> <button class="btn sec" onclick="home()">🏠 Menú</button></div>`;
    $('#again').onclick=after;}
  show();
}

/* ================== MISIONES ================== */
function home(){
  if(typeof ARC!=='undefined')ARC.clear();
  if(ROUTE&&ROUTE.on){ROUTE.on=false;saveRoute()}
  STREAK=STREAK;hud();
  const M=JUEGO.menu;
  const NAME=lsGet(JUEGO.claves.nombre);
  if(!NAME){app().innerHTML=`<div class="box center" style="margin-top:30px"><div class="big">👋</div><h2>¡Hola! ¿Cómo te llamas?</h2>
   <p class="sub">Así tu boletín y el ranking llevarán tu nombre.</p>
   <input class="typ" id="nm" maxlength="20" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Tu nombre" style="max-width:320px;text-align:center"><br>
   <button class="btn" id="nmok">¡Vamos! ▶</button><div class="fb" id="nmfb"></div></div>`;
   const go=()=>{const v=$('#nm').value.trim().slice(0,20);if(!v){$('#nmfb').textContent='Escribe tu nombre 😉';return}const vuelve=recuperaPerfil(v);try{localStorage.setItem(JUEGO.claves.nombre,vuelve||v)}catch(e){}if(vuelve)return location.reload();home()};
   $('#nmok').onclick=go;$('#nm').onkeydown=e=>{if(e.key=='Enter')go()};$('#nm').focus();return}
  app().innerHTML=`${boletin()}<button class="btn routebtn" onclick="R.route()">🧭 Ruta de estudio · unos 30 minutos ${ROUTE&&ROUTE.i>0?`<small>Vas por la estación ${ROUTE.i+1} de ${ROUTE_ST.length} · toca para seguir</small>`:`<small>Las ${ROUTE_ST.length} misiones seguidas, de lo más difícil a lo más ligero</small>`}</button><p class="sub" style="font-size:17px">Hola ${esc(NAME)} 👋 <button class="tab" id="chn" style="font-size:12px;padding:3px 10px">no soy yo</button><br> ${JUEGO.saludo}</p>
  <div class="grid">${M.map(m=>m[0]=='#'?`<div class="sect">${m[1]}</div>`:`<button class="mission ${m[0]=='arcade'?(finalNota().miss?'locked':'arc'):''}" data-k="${m[0]}"><div class="ic">${m[1]}</div><h3>${m[2]}</h3><p>${m[3]}</p><div class="stars" style="color:var(--gold)">${starStr(m[0])}</div>${MAP[m[0]]?`<div style="margin-top:4px;font-size:15px">${sem(nota(m[0]))} Nota ${fmt(nota(m[0]))}</div>`:''}${m[0]=='arcade'?(finalNota().miss?`<div style="margin-top:4px;font-size:14px">🔒 Faltan ${finalNota().miss} bloque${finalNota().miss>1?'s':''}</div>`:`<div style="margin-top:4px;font-size:14px;color:#a3e635">🔓 ¡Desbloqueado!</div>`):''}</button>`).join('')}</div>
  ${JUEGO.chuleta||''}
  ${classBox()}
  ${fame()}`;
  wireFame();
  document.querySelectorAll('.mission').forEach(b=>b.onclick=()=>R[b.dataset.k]());
  const ht=$('#hoy');if(ht)ht.onclick=()=>R[ht.dataset.k]();
  /* Recargar: si no, la XP y las notas que hay en memoria pasarían al siguiente niño */
  const cn=$('#chn');if(cn)cn.onclick=()=>{apartaPerfil();location.reload()};
}

function boletin(){
  const f=finalNota(),h=hoyToca(),ex=nota('exam');
  return `<div class="box" style="margin-top:0"><h2>📊 Boletín de ${esc(lsGet(JUEGO.claves.nombre)||'')}</h2>
  <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin:6px 0 10px">
   <div style="font-size:54px;font-weight:700;color:var(--gold)">${f.miss?'?':fmt(f.n)}</div>
   <div><b style="font-size:20px">${f.miss?'Nota pendiente':label(f.n)}</b><br><span style="color:var(--mut)">${f.miss?`Juega los ${f.miss} bloque(s) que faltan ⚪ para ver tu nota`:'Media de tus 3 últimas partidas en cada bloque'}</span></div>
   <div style="margin-left:auto;text-align:center;background:var(--card2);padding:10px 16px;border-radius:14px"><div style="color:var(--mut);font-size:13px">👑 Nota prevista examen</div><div style="font-size:28px;font-weight:700">${fmt(ex)}</div></div>
  </div>
  <table class="rules">${BLOCKS.map(b=>`<tr><td style="width:30px">${sem(nota(b.k))}</td><td>${b.n}${b.w==2?' <span style="color:var(--gold);font-size:13px">×2</span>':''}</td><td style="text-align:right"><b>${fmt(nota(b.k))}</b></td><td style="color:var(--mut);font-size:13px;text-align:right">${(GR[b.k]||[]).map(fmt).join(' · ')||'sin jugar'}</td></tr>`).join('')}</table>
  ${h?`<button class="btn" id="hoy" data-k="${h.b.k}">🎯 Hoy toca: ${h.b.n} <span style="font-weight:400">(${h.why})</span></button>`:'<p style="font-size:18px">🟢 ¡Todo dominado! Haz el examen final para confirmar.</p>'}
  <p class="sub" style="font-size:13px;margin-top:10px">${JUEGO.notaBoletin}</p></div>`;
}
/* ===== RANKING DE LA CLASE =====
   Se actualiza cuando el organizador envía las marcas a Claude. */
const API_URL='https://script.google.com/macros/s/AKfycbw7rxTYPt-c99ucT8Rxjcwj1_gMRJkSq0mmjagZlZjuOnpyWtTjAFE299CbkA2MViuwaQ/exec';   /* URL del script de Google (se rellena al montar) */
const GAME_ID=JUEGO.id;
let CLASS=[],CLASS_STATE='cargando';
function loadClass(){
  /* JUEGO.ranking=false: juego sin ranking (p. ej. el de pruebas del motor) */
  if(!API_URL||JUEGO.ranking===false){CLASS_STATE='sin';return}
  fetch(API_URL+'?juego='+GAME_ID).then(r=>r.json()).then(d=>{
    const last={};(d.rows||[]).forEach(x=>{const k=String(x.nombre).trim().toLowerCase();if(!last[k]||x.fecha>last[k].fecha)last[k]=x});
    CLASS=Object.values(last).map(x=>({n:x.nombre,nota:x.nota===''?null:+x.nota,ex:x.examen===''?null:+x.examen,xp:+x.xp,st:+x.estrellas,bs:+x.racha,sb:x.desglose?Object.fromEntries(MIC.map(([k],i)=>[k,+String(x.desglose).replace(/\D/g,'')[i]||0])):null,f:x.fecha}));
    CLASS_STATE='ok';const c=$('#clase');if(c){c.outerHTML=classBox();wireClass();if(window._msg){$('#sfb').textContent=window._msg;window._msg=''}}
  }).catch(()=>{CLASS_STATE='err';const c=$('#clase');if(c){c.outerHTML=classBox();wireClass()}});
}
function chk(s){let x=7;for(const c of s)x=(x*31+c.charCodeAt(0))%1679616;return x.toString(36).toUpperCase().padStart(4,'0')}
function classBox(){
  if(CLASS_STATE!='ok')return `<div class="box" id="clase"><h2>🏫 Ranking de la clase</h2><p class="sub">${CLASS_STATE=='cargando'?'Cargando el ranking… ⏳':CLASS_STATE=='sin'?'El ranking aún no está conectado.':'No se ha podido cargar el ranking. Prueba a recargar dentro de un rato.'}</p>${importBox()}</div>`;
  const rows=[...CLASS].sort((a,b)=>(b.nota??-1)-(a.nota??-1)||b.xp-a.xp);
  const med=['🥇','🥈','🥉'];
  return `<div class="box" id="clase"><h2>🏫 Ranking de la clase</h2>
  <p class="sub">Pulsa 📤 para subir tu marca. Ordenado por nota; si empatan, por XP. <button class="tab" id="crel" style="font-size:12px;padding:3px 10px">🔄 actualizar</button></p>
  ${rows.length?`<div class="rk-list">${rows.map((r,i)=>`<div class="rk"><div class="rk-m">${med[i]||(i+1)+'.'}</div><div class="rk-b"><div class="rk-n">${esc(r.n)}</div><div class="rk-s"><span>📊 <b>${r.nota!=null?fmt(r.nota):'–'}</b></span><span>👑 ${r.ex!=null?fmt(r.ex):'–'}</span><span>⭐ ${r.xp}</span><span>★ ${r.st}/${MAXST}</span><span>🔥 ${r.bs}</span></div>${r.sb?`<div class="rk-st">${starLine(r.sb)}</div>`:''}</div></div>`).join('')}</div>`
  :'<p style="font-size:18px">Todavía no hay nadie. ¡Juega, pulsa 📤 y sé el primero!</p>'}
  <button class="btn" id="fsend">📤 Subir mi marca al ranking</button>
  <div class="fb" id="sfb"></div>${importBox()}</div>`;
}
function importBox(){if(!JUEGO.importarAntiguo)return '';return `<details style="margin-top:14px"><summary style="cursor:pointer;color:var(--mut)">📥 ¿Jugabas en la página antigua? Trae tu progreso</summary>
  <p class="sub" style="margin-top:8px">En la página antigua pulsa <b>📦 Pasar mi progreso</b>, copia el código y pégalo aquí.</p>
  <textarea class="typ" id="imp" rows="3" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="MISION1:..."></textarea><button class="btn sec" id="impok" style="margin-top:0">Traer progreso</button><div class="fb" id="impfb"></div></details>`}
function wireClass(){
  const rel=$('#crel');if(rel)rel.onclick=()=>{CLASS_STATE='cargando';$('#clase').outerHTML=classBox();wireClass();loadClass()};
  const s=$('#fsend');if(s)s.onclick=sendScore;
  const io=$('#impok');if(io)io.onclick=()=>{
    try{const t=$('#imp').value.trim();if(!t.startsWith('MISION1:'))throw 0;
      const o=JSON.parse(decodeURIComponent(escape(atob(t.slice(8)))));
      if(!o||!o.st)throw 0;localStorage.setItem(JUEGO.claves.estado,JSON.stringify(o.st));if(o.name)localStorage.setItem(JUEGO.claves.nombre,o.name);
      location.reload();
    }catch(e){$('#impfb').textContent='❌ Ese código no vale. Cópialo entero de la página antigua.'}};
}
let SENDING=false;
async function sendScore(){
  if(SENDING)return;const fb=$('#sfb');
  if(!API_URL||JUEGO.ranking===false){fb.textContent='Este juego no tiene ranking.';return}
  const n=(lsGet(JUEGO.claves.nombre)||'').trim();if(!n){fb.textContent='Primero pon tu nombre.';return}
  const f=finalNota(),ex=nota('exam');
  const d={juego:GAME_ID,nombre:n,nota:f.miss?'':f.n,examen:ex==null?'':ex,xp:XP,estrellas:totalStars(),racha:BSTREAK,desglose:MIC.map(([k])=>BEST[k]||0).join('')};
  SENDING=true;fb.textContent='Enviando… 📤';
  try{const r=await fetch(API_URL,{method:'POST',body:JSON.stringify(d)});const j=await r.json();if(!j.ok)throw 0;
    fb.textContent='✅ ¡Marca subida!';window._msg='✅ ¡Marca subida! Mira tu puesto.';confetti();loadClass();
  }catch(e){fb.textContent='❌ No se ha podido enviar. Revisa la conexión y prueba otra vez.'}
  SENDING=false;
}
function myCode(){
  const n=(lsGet(JUEGO.claves.nombre)||'').trim(),f=finalNota(),ex=nota('exam');
  const sb=MIC.map(([k])=>BEST[k]||0).join('');
  const core=[n,f.miss?'-':fmt(f.n),ex==null?'-':fmt(ex),XP,totalStars(),BSTREAK,sb].join('|');
  return `🏆 ${JUEGO.codigo}\nNombre: ${n}\nNota: ${f.miss?'pendiente':fmt(f.n)}\nExamen: ${ex==null?'sin hacer':fmt(ex)}\nXP: ${XP}\nEstrellas: ${totalStars()}/${MAXST}\nRacha: ${BSTREAK}\nCódigo: ${core}#${chk(core)}`;
}
function fame(){
  const rows=HIST.map((r,ix)=>({...r,ix})).sort((a,b)=>b.xp-a.xp||b.st-a.st).slice(0,10);
  const med=['🥇','🥈','🥉'];
  return `<div class="box" id="fame"><h2>🏅 Mis partidas</h2>
  <p class="sub">Tu marcador ahora: <b>⭐ ${XP} XP</b> · <b>${totalStars()}/${MAXST} estrellas</b> · <b>🔥 mejor racha ${BSTREAK}</b>${nota('exam')!=null?` · <b>👑 examen ${fmt(nota('exam'))}</b>`:''}</p>
  <div class="row2"><input class="typ" id="fn" maxlength="20" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" value="${esc(lsGet(JUEGO.claves.nombre)||'')}" placeholder="Tu nombre">
  <button class="btn" id="fsave" style="margin-top:0">💾 Guardar mi puntuación</button></div>
  <div class="fb" id="ffb"></div>
  ${rows.length?`<div class="rk-list">${rows.map((r,i)=>`<div class="rk"><div class="rk-m">${med[i]||(i+1)+'.'}</div><div class="rk-b"><div class="rk-n">${esc(r.n)} <small>${new Date(r.d).toLocaleDateString('es-ES',{day:'numeric',month:'short'})} ${new Date(r.d).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</small></div><div class="rk-s"><span>⭐ ${r.xp}</span><span>★ ${r.st}</span><span>🔥 ${r.bs}</span>${r.no?`<span>📊 ${r.no}</span>`:''}${r.ex?`<span>👑 ${r.ex}</span>`:''}</div><div class="rk-st">${r.sb?starLine(r.sb):'<span style="color:var(--mut)">Sin desglose de estrellas</span>'}</div></div><button class="tab fdel" data-ix="${r.ix}" title="Borrar">🗑️</button></div>`).join('')}</div>`:'<p class="sub">Aún no hay marcas. ¡Sé el primero!</p>'}
  <p class="sub" style="font-size:13px;margin-top:10px">Tus partidas se guardan en este dispositivo.</p></div>`;
}
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
/* Perfiles: cada niño guarda su progreso aparte en el mismo dispositivo.
   El progreso activo sigue en las claves de siempre. «No soy yo» lo aparta con su nombre;
   al escribir un nombre que ya jugó aquí, se recupera el suyo. */
const PERFIL_K=['estado','ruta','arcade'];
const perfilClave=n=>'perfil:'+JUEGO.id+':'+n.trim().toLowerCase();
function apartaPerfil(){try{const n=lsGet(JUEGO.claves.nombre);
  if(n)localStorage.setItem(perfilClave(n),JSON.stringify({nombre:n,...Object.fromEntries(PERFIL_K.map(k=>[k,lsGet(JUEGO.claves[k])]))}));
  PERFIL_K.forEach(k=>localStorage.removeItem(JUEGO.claves[k]));localStorage.removeItem(JUEGO.claves.nombre)}catch(e){}}
function recuperaPerfil(n){try{const p=JSON.parse(localStorage.getItem(perfilClave(n))||'null');if(!p)return false;
  PERFIL_K.forEach(k=>p[k]==null?localStorage.removeItem(JUEGO.claves[k]):localStorage.setItem(JUEGO.claves[k],p[k]));
  localStorage.removeItem(perfilClave(n));return p.nombre||n}catch(e){return false}}
function wireFame(){
  $('#fsave').onclick=()=>{
    const n=($('#fn').value||'').trim().slice(0,20)||'Jugador';
    if(!lsGet(JUEGO.claves.nombre))try{localStorage.setItem(JUEGO.claves.nombre,n)}catch(e){}
    const fN=finalNota();HIST.push({n,xp:XP,st:totalStars(),bs:BSTREAK,ex:nota('exam')!=null?fmt(nota('exam')):null,no:fN.miss?null:fmt(fN.n),sb:{...BEST},d:new Date().toISOString()});
    save();confetti();home();
    setTimeout(()=>{const f=$('#ffb');if(f){f.textContent='✅ ¡Guardado! Mira tu puesto en el ranking.';$('#fame').scrollIntoView({behavior:'smooth'})}},50);
  };
  document.querySelectorAll('.fdel').forEach(b=>b.onclick=()=>{
    if(!b.dataset.sure){b.dataset.sure=1;b.textContent='¿Seguro?';b.style.background='var(--no)';
      setTimeout(()=>{if(b.isConnected){delete b.dataset.sure;b.textContent='🗑️';b.style.background=''}},3000);return}
    HIST.splice(+b.dataset.ix,1);save();home();
    setTimeout(()=>{const f=$('#ffb');if(f){f.textContent='🗑️ Borrado.';$('#fame').scrollIntoView({behavior:'smooth'})}},50);
  });
  wireClass();
}
function examRun(qs){
  qs=qs.map(q=>({...q,opts:shuf(q.opts)}));let i=0,ok=0,wrong=[],left=JUEGO.examen.min*60,done=false;
  app().innerHTML=`<div class="box"><h2>👑 EXAMEN FINAL</h2><p class="sub">Sin pistas. Las correcciones salen al final. Tienes ${JUEGO.examen.min} minutos.</p>
  <button class="btn" id="go">Empezar el examen ⏱️</button></div>`;
  $('#go').onclick=()=>{const t=setInterval(()=>{left--;const el=$('#clk');if(el)el.textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');if(left<=0){clearInterval(t);finish(true)}},1000);
    function show(){if(done)return;if(i>=qs.length){clearInterval(t);return finish(false)}
      const q=qs[i];
      app().innerHTML=`<div class="box"><div style="display:flex;justify-content:space-between"><h2>👑 Examen</h2><span class="pill" id="clk">${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}</span></div>
      <div class="bar"><div style="width:${i/qs.length*100}%"></div></div><div class="hint">Pregunta ${i+1} de ${qs.length}</div>
      <div class="q">${esc(q.q)}</div><div class="opts">${q.opts.map(o=>`<button class="opt">${esc(o)}</button>`).join('')}</div></div>`;
      document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{if(b.textContent==q.a)ok++;else wrong.push({q:q.q,yo:b.textContent,a:q.a});i++;show()});}
    show();
    function finish(timeout){if(done)return;done=true;
      qs.slice(i).forEach(q=>wrong.push({q:q.q,yo:'(sin contestar)',a:q.a}));
      const g=grade('exam',ok/qs.length*10);setBest('exam',ok/qs.length);XP+=ok*10;hud();save();if(g>=7)confetti();
      app().innerHTML=`<div class="box center"><div class="big">${g>=9?'🏆':g>=7?'🥈':g>=5?'👍':'💪'}</div>
      <h2>${timeout?'⏰ ¡Tiempo! ':''}${ok} de ${qs.length}</h2><p style="font-size:26px;margin:4px">Nota: <b>${fmt(g)}</b> · ${label(g)} ${sem(g)}</p>
      <p class="sub">Nota prevista para ${JUEGO.examen.dia} (media de tus 3 últimos exámenes): <b>${fmt(nota('exam'))}</b></p></div>
      ${wrong.length?`<div class="box"><h2>📌 Repasa estas</h2><table class="rules">${wrong.map(w=>`<tr><td>${esc(w.q)}<br><span style="color:var(--no)">Tú: ${esc(w.yo)}</span> · <span style="color:var(--yes)">Bien: ${esc(w.a)}</span></td></tr>`).join('')}</table></div>`:''}
      <div class="center"><button class="btn" onclick="R.exam()">🔁 Otro examen</button> <button class="btn sec" onclick="home()">🏠 Menú</button></div>`;}
  };
}
/* ===== Motores genéricos ===== */
function endScreen(icon,ok,tot,key,again,extra=''){
  const p=tot?ok/tot:0;setBest(key,p);const g=MAP[key]?grade(key,p*10):null;if(p>=.7)confetti();
  app().innerHTML=`<div class="box center"><div class="big">${icon}</div><h2>${ok} de ${tot} a la primera</h2>
  ${g!=null?`<p style="font-size:22px">Nota: <b>${fmt(g)}</b> · ${label(g)} ${sem(g)}</p>`:''}${extra}
  <button class="btn" id="again">🔁 Repetir</button> <button class="btn sec" onclick="home()">🏠 Menú</button></div>`;
  $('#again').onclick=again;
}
/* Ordenar palabras */
function orderGame(title,sub,set,key,again,hint){
  let i=0,ok=0;
  function show(){
    if(i>=set.length)return endScreen('🧩',ok,set.length,key,again);
    const it=set[i],sol=it.w.join(' ');let built=[],first=true;window._O=it;
    const ch=shuf(it.w.map((w,k)=>({w,k})));
    app().innerHTML=`<div class="box"><h2>${title}</h2><p class="sub">${sub}</p>
    <div class="bar"><div style="width:${i/set.length*100}%"></div></div>
    <div class="hint">${i+1} de ${set.length} · 🇪🇸 ${esc(it.h)}</div>
    <div class="chips" id="dst"></div><div class="chips" id="src" style="background:transparent">${ch.map(c=>`<button class="chip" data-k="${c.k}">${esc(c.w)}</button>`).join('')}</div>
    <div class="fb" id="fb"></div><button class="btn" id="chk">Comprobar ✔</button></div>`;
    function draw(){$('#dst').innerHTML=built.map((c,n)=>`<button class="chip" data-n="${n}">${esc(c.w)}</button>`).join('');
      document.querySelectorAll('#src .chip').forEach(b=>b.classList.toggle('used',built.some(c=>c.k==b.dataset.k)));
      document.querySelectorAll('#dst .chip').forEach(b=>b.onclick=()=>{built.splice(+b.dataset.n,1);draw()})}
    document.querySelectorAll('#src .chip').forEach(b=>b.onclick=()=>{built.push({w:b.textContent,k:b.dataset.k});draw()});
    $('#chk').onclick=()=>{
      if(built.length<it.w.length){$('#fb').textContent='Faltan palabras 😉';return}
      const hecho=built.map(c=>c.w).join(' ').toLowerCase(),acierto=[sol,...(it.alt||[])].find(x=>x.toLowerCase()==hecho);
      if(acierto){if(first)ok++;win();$('#fb').innerHTML='✅ ¡Perfecto! <b>'+esc(acierto)+'</b>';$('#chk').textContent='Siguiente ➜';$('#chk').onclick=()=>{i++;show()}}
      else{first=false;lose();$('#dst').classList.add('shake');setTimeout(()=>$('#dst')&&$('#dst').classList.remove('shake'),400);$('#fb').innerHTML='❌ Casi. '+hint}
    };
  }
  show();
}
/* Escribir la respuesta */
const norm=s=>s.toLowerCase().replace(/[’`´]/g,"'").trim().replace(/\s+/g,' ');
function typeGame(title,sub,items,key,again,xp=15){
  let i=0,ok=0;
  function show(){
    if(i>=items.length)return endScreen('⌨️',ok,items.length,key,again);
    const it=items[i];
    app().innerHTML=`<div class="box"><h2>${title}</h2><p class="sub">${sub}</p>
    <div class="bar"><div style="width:${i/items.length*100}%"></div></div><div class="hint">${i+1} de ${items.length}</div>
    <div class="q">${it.q}</div>${it.sub?`<div class="hint">${it.sub}</div>`:''}
    <input class="typ" id="a" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Escribe aquí">
    <div class="fb" id="fb"></div><button class="btn" id="chk">Comprobar ✔</button></div>`;
    const inp=$('#a');inp.focus();
    const go=()=>{const v=norm(inp.value);if(!v){$('#fb').textContent='Escribe tu respuesta 😉';return}
      const parts=v.split('/').map(x=>x.trim()).filter(Boolean);const right=parts.length&&parts.every(p=>it.acc.includes(p));
      inp.classList.add(right?'ok':'bad');inp.disabled=true;
      if(right){ok++;win(xp);$('#fb').innerHTML='✅ ¡Genial! '+(it.ex||'')}else{lose();$('#fb').innerHTML='❌ Es: <b>'+esc(it.show)+'</b>. '+(it.ex||'')}
      $('#chk').textContent='Siguiente ➜';$('#chk').onclick=()=>{i++;show()};inp.onkeydown=e=>{if(e.key=='Enter')$('#chk').click()}};
    $('#chk').onclick=go;inp.onkeydown=e=>{if(e.key=='Enter')go()};
  }
  show();
}
/* Elegir parte */
function chooser(title,sub,parts,run){
  app().innerHTML=`<div class="box"><h2>${title}</h2><p class="sub">${sub}</p>
  <div class="opts">${parts.map((p,k)=>`<button class="opt" data-k="${k}">${p.l}</button>`).join('')}</div></div>`;
  document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>run(parts[+b.dataset.k]));
}

/* El arcade bloqueado y el examen final, comunes a todos los juegos */
Object.assign(R,{
 arcade(){
   const f=finalNota();
   if(f.miss){app().innerHTML=`<div class="box center"><div class="big">🔒</div><h2>El arcade está bloqueado</h2>
     <p style="font-size:19px">Se desbloquea cuando juegues <b>todos los bloques</b> una vez y el boletín te dé tu nota.</p>
     <p class="sub">Te falta${f.miss>1?'n':''} <b>${f.miss}</b> bloque${f.miss>1?'s':''}: ${BLOCKS.filter(b=>nota(b.k)==null).map(b=>b.n).join(', ')}.</p>
     ${hoyToca()?`<button class="btn" id="hoy2">🎯 Ir a: ${hoyToca().b.n}</button> `:''}<button class="btn sec" onclick="home()">🏠 Menú</button></div>`;
     const b=$('#hoy2');if(b)b.onclick=()=>R[hoyToca().b.k]();return}
   ARC.home();
 },
 exam(){examRun(JUEGO.examen.preguntas())},
});
/* =====================================================================
   INTERACCIÓN: arrastrar al hueco, unir con líneas, fichas de letras,
   deslizar tarjetas y clasificar. Mismo contenido, otra forma de jugar.
   ===================================================================== */
/* Arrastrar con el dedo o el ratón; si no se mueve, cuenta como toque */
function dnd(el,{onDrop,onTap}){
  el.style.touchAction='none';
  el.addEventListener('pointerdown',e=>{
    if(el.disabled||el.classList.contains('used'))return;
    const sx=e.clientX,sy=e.clientY;let moved=false,ghost=null;
    try{el.setPointerCapture(e.pointerId)}catch(_){}
    const over=ev=>{const t=document.elementFromPoint(ev.clientX,ev.clientY);return t&&t.closest('.drop')};
    const mv=ev=>{
      if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>7){moved=true;ghost=el.cloneNode(true);ghost.classList.add('ghost');ghost.style.width=el.offsetWidth+'px';document.body.appendChild(ghost);el.classList.add('dragging')}
      if(moved){ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px';document.querySelectorAll('.drop.over').forEach(x=>x.classList.remove('over'));const d=over(ev);if(d)d.classList.add('over')}
    };
    const up=ev=>{el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);
      if(moved){const d=over(ev);ghost.remove();el.classList.remove('dragging');document.querySelectorAll('.drop.over').forEach(x=>x.classList.remove('over'));if(onDrop)onDrop(d)}
      else if(ev.type=='pointerup'&&onTap)onTap()};
    el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  });
}
const sparkle=(el)=>{if(!el)return;el.classList.remove('pulse');void el.offsetWidth;el.classList.add('pulse')};

/* Cada paso pinta su ejercicio en "st" y llama a done(aciertos, total, mensaje) */
const STEP={
  /* Test de siempre */
  mc(st,s,done){
    const long=s.opts.some(o=>o.length>22);
    st.innerHTML=`<div class="q">${esc(s.q)}</div><div class="opts ${long?'':'two'}">${shuf(s.opts).map(o=>`<button class="opt">${esc(o)}</button>`).join('')}</div>`;
    st.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      st.querySelectorAll('.opt').forEach(x=>{x.disabled=true;if(x.textContent==s.a)x.classList.add('ok')});
      const ok=b.textContent==s.a;if(!ok){b.classList.add('bad');b.classList.add('shake')}
      ok?win():lose();done(ok?1:0,1,(ok?'✅ ¡Correcto! ':'❌ Era: <b>'+esc(s.a)+'</b>. ')+(s.ex?`<span style="color:var(--mut)">${esc(s.ex)}</span>`:''));
    });
  },
  /* Escribe la respuesta (solo cuenta el primer intento) */
  type(st,s,done){
    st.innerHTML=`<div class="q">${s.q}</div>
    <input class="typ" id="wa" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Escribe aquí">
    <button class="btn" id="wchk" style="margin-top:0">Comprobar ✔</button>`;
    const inp=$('#wa');inp.focus({preventScroll:true});
    const limpia=x=>norm(x).replace(/[.,;:!?¡¿]/g,' ').replace(/\s+/g,' ').trim();
    const go=()=>{const v=limpia(inp.value);if(!v){$('#fb').textContent='Escribe tu respuesta 😉';return}
      const ok=s.acc.some(a=>limpia(a)==v);inp.classList.add(ok?'ok':'bad');inp.disabled=true;$('#wchk').remove();
      ok?win(15):lose();done(ok?1:0,1,(ok?'✅ ¡Genial! ':'❌ Es: <b>'+esc(s.show)+'</b>. ')+(s.ex?`<span style="color:var(--mut)">${esc(s.ex)}</span>`:''))};
    /* preventDefault: si no, el mismo Enter pulsa «Siguiente» y el niño no ve la corrección */
    $('#wchk').onclick=go;inp.onkeydown=e=>{if(e.key=='Enter'){e.preventDefault();go()}};
  },
  /* Arrastra la palabra al hueco (o tócala) */
  gap(st,s,done){
    const [pre,post]=s.q.split(/_{3,}/);
    st.innerHTML=`<div class="gapq">${esc(pre||'')}<span class="gap drop" id="gp">&nbsp;</span>${esc(post||'')}</div>
    <div class="hint" style="margin-top:6px">Arrastra la respuesta al hueco o tócala</div>
    <div class="tray">${shuf(s.opts).map(o=>`<button class="chip">${esc(o)}</button>`).join('')}</div>`;
    let over=false;
    const put=b=>{if(over)return;over=true;const gp=$('#gp');gp.textContent=b.textContent;const ok=b.textContent==s.a;
      st.querySelectorAll('.tray .chip').forEach(c=>{c.disabled=true;if(c.textContent==s.a)c.classList.add('right')});b.classList.add('used');
      gp.classList.add(ok?'ok':'bad');sparkle(gp);if(!ok){gp.innerHTML=`<s>${esc(b.textContent)}</s> ${esc(s.a)}`}
      ok?win():lose();done(ok?1:0,1,(ok?'✅ ¡Encaja! ':'❌ Era: <b>'+esc(s.a)+'</b>. ')+(s.ex?`<span style="color:var(--mut)">${esc(s.ex)}</span>`:''))};
    st.querySelectorAll('.tray .chip').forEach(b=>dnd(b,{onTap:()=>put(b),onDrop:d=>{if(d&&d.id=='gp')put(b)}}));
  },
  /* Une con líneas */
  lines(st,s,done){
    const L=s.pairs.map((p,i)=>({t:p[0],i})),Rt=shuf(s.pairs.map((p,i)=>({t:p[1],i})));
    st.innerHTML=`<div class="q" style="font-size:19px">${esc(s.q||'Une cada palabra con su pareja')}</div>
    <div class="lines" id="ln"><svg id="sv"></svg>
      <div class="col">${L.map(x=>`<button class="li lft" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div>
      <div class="col">${Rt.map(x=>`<button class="li rgt drop" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div></div>
    <div class="hint" style="margin-top:8px">Toca una de la izquierda y luego su pareja, o arrastra de una a otra</div>`;
    let sel=null,okc=0,left=s.pairs.length;const missed=new Set();const box=$('#ln'),sv=$('#sv');
    const line=(a,b,cls)=>{const r=box.getBoundingClientRect(),A=a.getBoundingClientRect(),B=b.getBoundingClientRect();
      const l=document.createElementNS('http://www.w3.org/2000/svg','line');l.setAttribute('x1',A.right-r.left);l.setAttribute('y1',A.top+A.height/2-r.top);
      l.setAttribute('x2',B.left-r.left);l.setAttribute('y2',B.top+B.height/2-r.top);l.setAttribute('class',cls);sv.appendChild(l);return l};
    const tryPair=(a,b)=>{if(!a||!b||a.classList.contains('done')||b.classList.contains('done'))return;
      if(a.dataset.i==b.dataset.i){a.classList.add('done');b.classList.add('done');a.classList.remove('sel');line(a,b,'okl');sfxOk();sparkle(b);
        if(!missed.has(a.dataset.i)){okc++;win(5)}left--;sel=null;
        if(!left)done(okc,s.pairs.length,okc==s.pairs.length?'✅ ¡Todas a la primera!':`👍 ${okc} de ${s.pairs.length} a la primera`)}
      else{missed.add(a.dataset.i);lose();const l=line(a,b,'badl');b.classList.add('shake');setTimeout(()=>{l.remove();b.classList.remove('shake')},500)}};
    st.querySelectorAll('.lft').forEach(a=>dnd(a,{onTap:()=>{if(a.classList.contains('done'))return;st.querySelectorAll('.lft').forEach(x=>x.classList.remove('sel'));a.classList.add('sel');sel=a},
      onDrop:d=>{if(d&&d.classList.contains('rgt'))tryPair(a,d)}}));
    st.querySelectorAll('.rgt').forEach(b=>b.onclick=()=>{if(sel)tryPair(sel,b)});
  },
  /* Construye la palabra con fichas de letras */
  tiles(st,s,done){
    const target=s.a.toLowerCase();const extra=shuf('abcdefghiklmnoprstuwy'.split('').filter(c=>!target.includes(c))).slice(0,2);
    const pool=shuf([...target,...extra]).map((c,k)=>({c,k}));let slots=Array(target.length).fill(null),first=true,over=false,tries=0;
    st.innerHTML=`<div class="q">${s.q}</div>${s.sub?`<div class="hint">${s.sub}</div>`:''}
    <div class="slots" id="sl"></div><div class="tray" id="tp"></div>
    <div class="center"><button class="btn sec" id="clr" style="margin-top:4px">⌫ Borrar</button></div>`;
    function draw(){
      $('#sl').innerHTML=slots.map((x,n)=>`<div class="slot drop ${x?'f':''}" data-n="${n}">${x?x.c:''}</div>`).join('');
      $('#tp').innerHTML=pool.map(t=>`<button class="chip lt ${slots.includes(t)?'used':''}" data-k="${t.k}">${t.c}</button>`).join('');
      st.querySelectorAll('.slot.f').forEach(e=>e.onclick=()=>{if(over)return;slots[+e.dataset.n]=null;draw()});
      st.querySelectorAll('#tp .chip').forEach(b=>{const t=pool.find(x=>x.k==b.dataset.k);dnd(b,{onTap:()=>place(t),onDrop:d=>{if(d&&d.classList.contains('slot'))place(t,+d.dataset.n)}})});
    }
    function place(t,n){if(over||slots.includes(t))return;if(n==null||slots[n])n=slots.indexOf(null);if(n<0)return;slots[n]=t;sfxTap();draw();
      if(!slots.includes(null))check()}
    function check(){const w=slots.map(x=>x.c).join('');
      if(w==target){over=true;st.querySelectorAll('.slot').forEach(e=>e.classList.add('ok'));sparkle($('#sl'));first?win(10):null;
        done(first?1:0,1,(first?'✅ ¡Perfecto! ':'✅ Ahora sí. ')+(s.ex?`<span style="color:var(--mut)">${esc(s.ex)}</span>`:''))}
      else{tries++;if(first){first=false;lose()}$('#sl').classList.add('shake');setTimeout(()=>$('#sl')&&$('#sl').classList.remove('shake'),400);
        if(tries>=2){over=true;slots=[...target].map(c=>({c}));draw();st.querySelectorAll('.slot').forEach(e=>e.classList.add('bad'));done(0,1,`❌ Es <b>${esc(s.a)}</b>. `+(s.ex?esc(s.ex):''))}
        else{$('#fb').innerHTML='❌ Casi. Toca las letras de arriba para quitarlas y prueba otra vez.'}}}
    $('#clr').onclick=()=>{if(over)return;const n=slots.map((x,i)=>x?i:-1).filter(i=>i>=0).pop();if(n!=null&&n>=0){slots[n]=null;draw()}};
    draw();
  },
  /* Desliza: derecha = bien, izquierda = mal */
  swipe(st,s,done){
    st.innerHTML=`<div class="swipezone"><div class="sw-l">❌ MAL</div><div class="scard" id="sc"><div style="font-size:15px;color:var(--mut)">¿Está bien traducido?</div>
      <div style="font-size:28px;font-weight:700;margin-top:8px">${esc(s.w)}</div><div style="font-size:24px;color:var(--gold)">= ${esc(s.tr)}</div></div><div class="sw-r">BIEN ✅</div></div>
    <div class="tf" style="margin-top:12px"><button class="opt center" data-v="0">⬅ ❌ Mal</button><button class="opt center" data-v="1">✅ Bien ➡</button></div>`;
    const card=$('#sc');let over=false;
    const decide=v=>{if(over)return;over=true;const ok=(v==1)==s.ok;card.style.transform=`translateX(${v?160:-160}px) rotate(${v?14:-14}deg)`;card.style.opacity=.15;
      st.querySelectorAll('.opt').forEach(x=>x.disabled=true);ok?win():lose();done(ok?1:0,1,(ok?'✅ ':'❌ ')+esc(s.ex))};
    st.querySelectorAll('.opt').forEach(b=>b.onclick=()=>decide(+b.dataset.v));
    let sx=null;card.style.touchAction='none';
    card.addEventListener('pointerdown',e=>{sx=e.clientX;try{card.setPointerCapture(e.pointerId)}catch(_){}card.style.transition='none'});
    card.addEventListener('pointermove',e=>{if(sx==null||over)return;const dx=e.clientX-sx;card.style.transform=`translateX(${dx}px) rotate(${dx/14}deg)`;
      st.querySelector('.sw-r').style.opacity=dx>30?1:.35;st.querySelector('.sw-l').style.opacity=dx<-30?1:.35});
    card.addEventListener('pointerup',e=>{if(sx==null)return;const dx=e.clientX-sx;sx=null;card.style.transition='';
      if(Math.abs(dx)>80)decide(dx>0?1:0);else card.style.transform=''});
  },
  /* Clasifica en cajas (cada ficha va a una caja) */
  bins(st,s,done){
    const items=shuf(s.items.map((it,k)=>({...it,k})));let okc=0,left=items.length;const missed=new Set();let sel=null;
    st.innerHTML=`<div class="q" style="font-size:19px">${esc(s.q)}</div>
    <div class="bins ${s.thermo?'thermo':''}">${s.bins.map((b,n)=>`<div class="bin drop" data-b="${n}"><span class="lab">${b}</span></div>`).join('')}</div>
    <div class="tray" id="bt">${items.map(it=>`<button class="chip" data-k="${it.k}">${esc(it.t)}</button>`).join('')}</div>
    <div class="hint center">Arrastra cada ficha a su sitio (o tócala y luego toca el sitio)</div>`;
    const drop=(it,el,binEl)=>{if(!binEl)return;const n=+binEl.dataset.b;
      if(s.thermo&&binEl.querySelector('.chip'))return;
      if(n==it.b){el.classList.add('used');const c=document.createElement('span');c.className='chip placed';c.textContent=it.t;binEl.appendChild(c);sparkle(binEl);sfxOk();
        if(!missed.has(it.k)){okc++;win(5)}left--;sel=null;st.querySelectorAll('#bt .chip').forEach(x=>x.classList.remove('sel'));
        if(!left)done(okc,items.length,okc==items.length?'✅ ¡Todo en su sitio a la primera!':`👍 ${okc} de ${items.length} a la primera`)}
      else{missed.add(it.k);lose();binEl.classList.add('shake');setTimeout(()=>binEl.classList.remove('shake'),400)}};
    st.querySelectorAll('#bt .chip').forEach(el=>{const it=items.find(x=>x.k==el.dataset.k);
      dnd(el,{onTap:()=>{st.querySelectorAll('#bt .chip').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');sel={it,el}},onDrop:d=>drop(it,el,d)})});
    st.querySelectorAll('.bin').forEach(b=>b.onclick=()=>{if(sel)drop(sel.it,sel.el,b)});
  },
};
/* =====================================================================
   FORMATOS NUEVOS (20-nov, MODALIDADES.md): escuchar y elegir, dictado,
   detectar y reparar, crucigrama y hueco con la primera letra.
   ===================================================================== */
/* Voz del dispositivo (gratis). Idioma: el del paso, el del juego (JUEGO.voz) o inglés británico */
function hablar(texto,lento,lang){
  try{if(!('speechSynthesis' in window))return false;speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(texto);u.lang=lang||JUEGO.voz||'en-GB';u.rate=lento?.7:.95;
    const L=u.lang.toLowerCase(),vs=speechSynthesis.getVoices();
    const v=vs.find(x=>x.lang.toLowerCase().replace('_','-')==L)||vs.find(x=>x.lang.toLowerCase().startsWith(L.slice(0,2)));if(v)u.voice=v;
    speechSynthesis.speak(u);return true}catch(e){return false}}
/* Botones de escuchar; cuenta cuántas veces se oye (se enseña, no se castiga) */
function vozHTML(){return `<div class="voz"><button class="speak" id="hb">🔊 Escuchar</button><button class="btn sec" id="hl" style="margin-top:0">🐢 Más despacio</button><span class="hint" id="hv" style="margin:0"></span></div>`}
function vozWire(s){let veces=0;
  const oir=l=>{veces++;$('#hv').textContent=`Escuchado ${veces} ${veces==1?'vez':'veces'}`;if(!hablar(s.say,l,s.lang))$('#hv').textContent='Este dispositivo no puede leer en voz alta'};
  $('#hb').onclick=()=>oir(false);$('#hl').onclick=()=>oir(true);
  setTimeout(()=>hablar(s.say,false,s.lang),250);return()=>veces}
/* Respuesta escrita: sin mayúsculas ni signos. Las tildes cuentan solo si el juego o el paso lo pide (Lengua de 5º) */
function limpiaR(x,tildes){x=norm(x).replace(/[.,;:!?¡¿"()]/g,' ').replace(/\s+/g,' ').trim();
  return tildes?x:x.normalize('NFD').replace(/[̀́]/g,'').normalize('NFC')}
const NOAUTO='autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"';

Object.assign(STEP,{
  /* 🎧 Escucha y elige: {say, opts, a, q?, lang?, ex?} */
  listen(st,s,done){
    st.innerHTML=`<div class="q">${esc(s.q||'Escucha y toca lo que oyes')}</div>${vozHTML()}
    <div class="opts ${s.opts.some(o=>o.length>22)?'':'two'}">${shuf(s.opts).map(o=>`<button class="opt">${esc(o)}</button>`).join('')}</div>`;
    vozWire(s);
    st.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      st.querySelectorAll('.opt').forEach(x=>{x.disabled=true;if(x.textContent==s.a)x.classList.add('ok')});
      const ok=b.textContent==s.a;if(!ok){b.classList.add('bad');b.classList.add('shake')}
      ok?win():lose();done(ok?1:0,1,(ok?'✅ ¡Bien oído! ':'❌ ')+`Decía: <b>“${esc(s.say)}”</b>`+(s.ex?` <span style="color:var(--mut)">${esc(s.ex)}</span>`:''));
    });
  },
  /* ✍️ Dictado: {say, q?, lang?, tildes?}. Corrige palabra a palabra */
  dictado(st,s,done){
    st.innerHTML=`<div class="q">${esc(s.q||'Escucha y escribe la frase')}</div>${vozHTML()}
    <input class="typ" id="wa" ${NOAUTO} placeholder="Escribe lo que oyes">
    <button class="btn" id="wchk" style="margin-top:0">Comprobar ✔</button>`;
    const veces=vozWire(s),tildes=s.tildes??JUEGO.tildesCuentan??false,inp=$('#wa');
    const go=()=>{const v=limpiaR(inp.value,tildes);if(!v){$('#fb').textContent='Escribe lo que oyes 😉';return}
      const bien=limpiaR(s.say,tildes).split(' '),yo=v.split(' '),ok=yo.length==bien.length&&bien.every((w,k)=>yo[k]===w);
      const marcado=bien.map((w,k)=>yo[k]===w?`<span class="w-ok">${esc(w)}</span>`:yo[k]?`<span class="w-bad">${esc(yo[k])}</span> <span class="w-miss">${esc(w)}</span>`:`<span class="w-miss">${esc(w)}</span>`).join(' ')
        +(yo.length>bien.length?' '+yo.slice(bien.length).map(w=>`<span class="w-bad">${esc(w)}</span>`).join(' '):'');
      inp.classList.add(ok?'ok':'bad');inp.disabled=true;$('#wchk').remove();ok?win(15):lose();
      const n=veces();done(ok?1:0,1,(ok?'✅ ¡Perfecto! ':`📝 ${bien.filter((w,k)=>yo[k]===w).length} de ${bien.length} palabras. `)+`${n?`<span style="color:var(--mut)">(lo escuchaste ${n} ${n==1?'vez':'veces'})</span>`:''}<div class="dicta">${marcado}</div>`)};
    $('#wchk').onclick=go;inp.onkeydown=e=>{if(e.key=='Enter'){e.preventDefault();go()}};
  },
  /* 🛠️ Detecta y repara: {w:[palabras], bad: índice, fix:[aceptadas], q?, ex?}. Encontrar y arreglar cuentan por separado */
  repair(st,s,done){let primera=true;
    st.innerHTML=`<div class="q">${esc(s.q||'Toca la palabra que está mal')}</div>
    <div class="frase">${s.w.map((w,k)=>`<button class="tok" data-k="${k}">${esc(w)}</button>`).join('')}</div><div id="rfx"></div>`;
    st.querySelectorAll('.tok').forEach(b=>b.onclick=()=>{
      if(+b.dataset.k!==s.bad){if(primera){primera=false;lose()}b.classList.add('nope');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');$('#fb').textContent='Esa está bien. Busca otra.';return}
      st.querySelectorAll('.tok').forEach(x=>x.disabled=true);b.classList.add('sel');$('#fb').textContent='¡Encontrada! Ahora escríbela bien.';
      $('#rfx').innerHTML=`<input class="typ" id="wa" ${NOAUTO} placeholder="La palabra correcta"><button class="btn" id="wchk" style="margin-top:0">Arreglar ✔</button>`;
      const inp=$('#wa');inp.focus({preventScroll:true});
      const go=()=>{const v=limpiaR(inp.value,true);if(!v){$('#fb').textContent='Escribe la palabra bien escrita 😉';return}
        const ok=s.fix.some(f=>limpiaR(f,true)==v);inp.classList.add(ok?'ok':'bad');inp.disabled=true;$('#wchk').remove();
        if(ok){b.textContent=s.fix[0]+((s.w[s.bad].match(/[.,?!]$/)||[''])[0]);b.classList.add('fixed');sparkle(b)}
        ok?win(primera?15:5):lose();
        done((primera?1:0)+(ok?1:0),2,(primera?'🔎 Encontrada a la primera · ':'🔎 Encontrada · ')+(ok?'✅ ¡Arreglada! ':`❌ Era <b>${esc(s.fix[0])}</b>. `)+(s.ex?`<span style="color:var(--mut)">${esc(s.ex)}</span>`:''))};
      $('#wchk').onclick=go;inp.onkeydown=e=>{if(e.key=='Enter'){e.preventDefault();go()}};
    });
  },
  /* 🧩 Crucigrama: {words:[{n, d:'h'|'v', r, c, w, pista}], q?}. Cuenta cada palabra; se comprueba una vez */
  cross(st,s,done){
    const W=s.words,G={};
    W.forEach(x=>[...x.w.toLowerCase()].forEach((ch,k)=>{const r=x.r+(x.d=='v'?k:0),c=x.c+(x.d=='h'?k:0);const g=(G[r+','+c]=G[r+','+c]||{ch,ws:[]});if(g.ch!==ch)console.error(`Crucigrama: «${g.ws[0].w}» y «${x.w}» no cruzan bien en la fila ${r+1}, columna ${c+1}`);g.ws.push(x)}));
    const K=Object.keys(G).map(k=>k.split(',').map(Number)),F=Math.max(...K.map(x=>x[0]))+1,C=Math.max(...K.map(x=>x[1]))+1;
    let dir='h';
    st.innerHTML=`<div class="q" style="font-size:19px">${esc(s.q||'Completa el crucigrama')}</div>
    <div class="cw-wrap"><div class="cw" style="--cols:${C}">${Array.from({length:F*C},(_,k)=>{const r=Math.floor(k/C),c=k%C,g=G[r+','+c];if(!g)return '<div></div>';
      const n=W.find(x=>x.r==r&&x.c==c);return `<div class="cell">${n?`<span class="n">${n.n}</span>`:''}<input maxlength="1" data-rc="${r},${c}" ${NOAUTO} aria-label="Fila ${r+1}, columna ${c+1}"></div>`}).join('')}</div>
    <div class="clues">${['h','v'].map(d=>W.some(x=>x.d==d)?`<div class="cl-t">${d=='h'?'Horizontales →':'Verticales ↓'}</div>${W.filter(x=>x.d==d).map(x=>`<button class="cl" data-w="${x.n}${x.d}">${x.n}. ${esc(x.pista)}</button>`).join('')}`:'').join('')}</div></div>
    <button class="btn" id="wchk" style="margin-top:6px">Comprobar ✔</button>`;
    const cell=(r,c)=>st.querySelector(`[data-rc="${r},${c}"]`),celdas=x=>[...x.w].map((_,k)=>cell(x.r+(x.d=='v'?k:0),x.c+(x.d=='h'?k:0)));
    const marca=x=>{st.querySelectorAll('.cell input').forEach(i=>i.classList.remove('hl'));celdas(x).forEach(i=>i.classList.add('hl'))};
    st.querySelectorAll('.cell input').forEach(inp=>{const [r,c]=inp.dataset.rc.split(',').map(Number),g=G[r+','+c];
      inp.onfocus=()=>{const x=g.ws.find(w=>w.d==dir)||g.ws[0];dir=x.d;marca(x)};
      inp.oninput=()=>{inp.value=inp.value.slice(-1).toLowerCase();if(!inp.value)return;sfxTap();const nx=dir=='h'?cell(r,c+1):cell(r+1,c);if(nx)nx.focus({preventScroll:true})};
      inp.onkeydown=e=>{if(e.key=='Backspace'&&!inp.value){const pv=dir=='h'?cell(r,c-1):cell(r-1,c);if(pv){pv.focus();pv.value='';e.preventDefault()}}if(e.key=='Enter'){e.preventDefault();$('#wchk')&&$('#wchk').click()}}});
    st.querySelectorAll('.cl').forEach(b=>b.onclick=()=>{const x=W.find(w=>w.n+w.d==b.dataset.w);dir=x.d;celdas(x)[0].focus();marca(x)});
    $('#wchk').onclick=()=>{
      const vacias=[...st.querySelectorAll('.cell input')].filter(i=>!i.value).length;
      if(vacias&&!$('#wchk').dataset.av){$('#wchk').dataset.av=1;$('#fb').textContent=`Faltan ${vacias} casillas. Pulsa otra vez para comprobar así.`;return}
      let ok=0;W.forEach(x=>{const bien=celdas(x).every((i,k)=>i.value==x.w[k].toLowerCase());if(bien){ok++;win(10)}});
      st.querySelectorAll('.cell input').forEach(i=>{const g=G[i.dataset.rc];i.disabled=true;i.classList.remove('hl');
        if(i.value!==g.ch){i.classList.add('bad');i.value=g.ch}else i.classList.add('ok')});
      if(ok<W.length)lose();$('#wchk').remove();
      done(ok,W.length,ok==W.length?'✅ ¡Crucigrama completo!':`👍 ${ok} de ${W.length} palabras bien. En rojo, las letras que faltaban o estaban mal.`)};
  },
  /* 🔡 Hueco con la primera letra: {pre, w, post, es?, ex?}. Producir con apoyo */
  first(st,s,done){
    const w=s.w.toLowerCase();
    st.innerHTML=`<div class="q">${esc(s.pre||'')}<span style="color:var(--gold)">${esc(w[0])}${' _'.repeat(w.length-1)}</span>${esc(s.post||'')}</div>
    ${s.es?`<div class="hint">🇪🇸 ${esc(s.es)}</div>`:''}
    <div class="letras"><span>${esc(w[0])}</span>${[...w.slice(1)].map((ch,k)=>ch==' '?'<i></i>':`<input maxlength="1" data-k="${k+1}" ${NOAUTO} aria-label="Letra ${k+2}">`).join('')}</div>
    <button class="btn" id="wchk" style="margin-top:6px">Comprobar ✔</button>`;
    const ins=[...st.querySelectorAll('.letras input')];ins[0]&&ins[0].focus({preventScroll:true});
    const go=()=>{if(ins.some(x=>!x.value)){$('#fb').textContent='Faltan letras 😉';return}
      const ok=ins.every(x=>x.value==w[+x.dataset.k]);
      ins.forEach(x=>{x.disabled=true;x.classList.add(x.value==w[+x.dataset.k]?'ok':'bad')});$('#wchk').remove();
      ok?win(10):lose();done(ok?1:0,1,(ok?'✅ ¡Genial! ':`❌ Es <b>${esc(s.w)}</b>. `)+(s.ex?`<span style="color:var(--mut)">${esc(s.ex)}</span>`:''))};
    ins.forEach((inp,k)=>{inp.oninput=()=>{inp.value=inp.value.slice(-1).toLowerCase();if(inp.value&&ins[k+1])ins[k+1].focus({preventScroll:true})};
      inp.onkeydown=e=>{if(e.key=='Backspace'&&!inp.value&&ins[k-1]){ins[k-1].focus();ins[k-1].value='';e.preventDefault()}if(e.key=='Enter'){e.preventDefault();go()}}});
    $('#wchk').onclick=go;
  },
});
/* =====================================================================
   ESCENAS (20-nov, MODALIDADES.md): dibujo SVG animado, elegido por el padre
   en el artefacto. Personajes de cómic con contorno, fondo al atardecer
   (luz 'dia' o 'noche' cuando una historia lo pida) y una biblioteca de
   sitios que cualquier juego elige por nombre. Un sitio nuevo se dibuja
   una vez aquí y sirve para todos los juegos.
   ===================================================================== */
const ESC_L='#1d2033';let ESC_UID=0;
const ESC_LUZ={
  atardecer:{cielo:['#433b80','#c8608a','#ffb36b'],estrellas:1,sol:'#ffd98a',mont:['#7a5c9e','#a46a9c'],colina:'#7f8f4c',suelo:['#5e7c3e','#36532c'],camino:'#c9a674',velo:'#ff8a3d',
    s:{muro:'#e9c79a',muroS:'#c9a274',tejado:'#b2463a',ventana:'#ffd56b',fronton:'#d1a07a',teatro:'#e0bb9c',tienda:'#e0782a',arbol:'#2f7a45',arbol2:'#36884c',brillo:1}},
  dia:{cielo:['#6fbcef','#cfeefd','#fff2cf'],nubes:1,sol:'#ffe27a',solAlto:1,mont:['#b9cde8','#cddcee'],colina:'#a8d983',suelo:['#8cc864','#4c8c3c'],camino:'#ecd59e',
    s:{muro:'#f6e3b8',muroS:'#e6cd95',tejado:'#d2553f',ventana:'#a9dcf5',fronton:'#e8c39a',teatro:'#f3dcc4',tienda:'#f08a2e',arbol:'#3e9b4f',arbol2:'#4aab58'}},
  noche:{cielo:['#0e1430','#1d2a5a','#34407a'],estrellas:2,luna:1,mont:['#2a3466','#34407a'],colina:'#2f4a3a',suelo:['#2c4634','#1c3024'],camino:'#6b6250',velo:'#1d2a5a',
    s:{muro:'#9c8b74',muroS:'#7d6f5c',tejado:'#6e3a33',ventana:'#ffd56b',fronton:'#8a7464',teatro:'#968272',tienda:'#a3561f',arbol:'#1f4f30',arbol2:'#245a36',brillo:1}}
};
/* Cielo, montañas, colinas y camino. W = ancho (100 por sitio) */
function escFondo(W,L,u){
  const c=L.cielo,sx=Math.round(W*.75);
  return `<defs><linearGradient id="ec${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset=".45" stop-color="${c[1]}"/><stop offset=".8" stop-color="${c[2]}"/></linearGradient>
    <linearGradient id="es${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L.suelo[0]}"/><stop offset="1" stop-color="${L.suelo[1]}"/></linearGradient></defs>
    <rect width="${W}" height="300" fill="url(#ec${u})"/>
    ${L.estrellas?`<g fill="#fff" opacity="${L.estrellas>1?.95:.8}">${[[30,14],[90,28],[150,10],[200,24],[330,16],[380,30],[260,8],[60,46],[230,40]].slice(0,L.estrellas>1?9:7).map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1"/>`).join('')}</g>`:''}
    ${L.luna?`<circle cx="${sx}" cy="40" r="11" fill="#fff3c4"/><circle cx="${sx+6}" cy="36" r="10" fill="${c[0]}"/>`:''}
    ${L.sol&&L.solAlto?`<circle cx="${sx}" cy="34" r="12" fill="${L.sol}" stroke="#f2b84b" stroke-width="3"/>`:''}
    ${L.sol&&!L.solAlto?`<circle cx="${sx}" cy="122" r="26" fill="${L.sol}"/><circle cx="${sx}" cy="122" r="36" fill="${L.sol}" opacity=".25"/>`:''}
    ${L.nubes?[[40,22,1.1],[214,12,.8]].map(([x,y,s])=>`<path class="nube" transform="translate(${x} ${y}) scale(${s})" d="M0 8 a7 7 0 0 1 9 -8 a10 10 0 0 1 18 1 a7 7 0 0 1 5 11 h-28 a5 5 0 0 1 -4 -4z" fill="#fff" stroke="${ESC_L}" stroke-width="1.2" vector-effect="non-scaling-stroke"/>`).join(''):''}
    <path d="M0 118 L44 92 L90 112 L140 82 L188 108 L236 88 L284 112 L330 90 L372 104 L400 96 V170 H0Z" fill="${L.mont[0]}"/>
    <path d="M0 136 L50 114 L104 132 L160 112 L214 132 L270 116 L330 134 L400 118 V170 H0Z" fill="${L.mont[1]}"/>
    <path d="M0 150 C60 132 110 142 160 148 S260 132 310 142 S380 142 400 140 V300 H0Z" fill="${L.colina}" stroke="${ESC_L}" stroke-width="1.4"/>
    <path d="M0 166 C80 158 160 170 240 164 S360 160 400 166 V300 H0Z" fill="url(#es${u})" stroke="${ESC_L}" stroke-width="1.4"/>
    <path d="M118 300 C140 252 176 232 150 168 L158 168 C190 228 172 252 226 300Z" fill="${L.camino}" stroke="${ESC_L}" stroke-width="1.4"/>`;
}
/* Biblioteca de sitios. Cada uno se dibujó en su columna (col) de una escena de 4; el motor lo traslada a la que le toque.
   spot = dónde se queda el personaje cuando acierta */
const ESC_O=`stroke="${ESC_L}" stroke-width="1.4" stroke-linejoin="round"`;
const ESC_SITIOS={
  cocina:{col:0,spot:{x:44,y:190},svg:p=>`
    <rect x="16" y="106" width="72" height="62" fill="${p.muro}"/><rect x="70" y="106" width="18" height="62" fill="${p.muroS}"/><rect x="16" y="106" width="72" height="62" fill="none" ${ESC_O}/>
    <rect x="70" y="76" width="9" height="20" fill="#a8402e" ${ESC_O}/>
    <g class="vapor"><circle cx="75" cy="68" r="3" fill="#fff" opacity=".85"/><circle cx="79" cy="60" r="4" fill="#fff" opacity=".7"/></g>
    <path d="M8 110 L52 72 L96 110Z" fill="${p.tejado}" ${ESC_O}/><path d="M33 89 h38 M22 100 h60" stroke="#00000033" stroke-width="1.3"/>
    <rect x="24" y="118" width="30" height="22" rx="2" fill="${p.ventana}" ${ESC_O}/><path d="M39 118 v22" stroke="${ESC_L}" stroke-width="1"/>
    <path d="M28 135 h13 a3 3 0 0 1 -3 3 h-7 a3 3 0 0 1 -3 -3z" fill="#444"/><path d="M41 135.5 h5" stroke="#444" stroke-width="1.5"/>
    <rect x="62" y="132" width="17" height="36" rx="2" fill="#8b5a2b" ${ESC_O}/><circle cx="75" cy="151" r="1.4" fill="#ffd75e"/>`},
  teatro:{col:1,spot:{x:152,y:151},svg:p=>`
    <path d="M100 86 L152 62 L204 86Z" fill="${p.fronton}" ${ESC_O}/><circle cx="152" cy="77" r="5" fill="#ffd75e" ${ESC_O}/>
    <rect x="106" y="86" width="92" height="80" fill="${p.teatro}" ${ESC_O}/>
    <rect x="114" y="100" width="76" height="52" fill="#2a1d45" ${ESC_O}/><polygon class="foco" points="142,100 162,100 178,150 126,150" fill="#fff6b0"/>
    <path d="M114 100 h18 q-6 26 0 52 h-18z" fill="#c0392b" ${ESC_O}/><path d="M120 102 q-3 24 0 48 M126 102 q-3 24 0 48" stroke="#8e2a20" stroke-width="1" fill="none"/>
    <path d="M190 100 h-18 q6 26 0 52 h18z" fill="#c0392b" ${ESC_O}/><path d="M184 102 q3 24 0 48 M178 102 q3 24 0 48" stroke="#8e2a20" stroke-width="1" fill="none"/>
    <g fill="#ffd75e" stroke="${ESC_L}" stroke-width=".7">${[0,1,2,3,4,5,6,7].map(i=>`<circle cx="${117+i*10}" cy="93" r="2"/>`).join('')}</g>
    <rect x="108" y="150" width="88" height="16" fill="#8a5a32" ${ESC_O}/>`},
  campamento:{col:2,spot:{x:226,y:193},svg:p=>`
    <path d="M206 172 L242 112 L278 172Z" fill="${p.tienda}" ${ESC_O}/><path d="M242 112 L278 172 L262 172Z" fill="#00000026"/><path d="M234 172 L242 146 L250 172Z" fill="#5e2e0d" ${ESC_O}/>
    <path d="M242 112 l-2 -6 M206 172 l-8 4 M278 172 l8 4" stroke="${ESC_L}" stroke-width="1.1"/>
    <g transform="translate(288 172)">${p.brillo?`<circle r="16" fill="#ffb02e" opacity=".22"/>`:''}
      <g fill="#9a9a9a" stroke="${ESC_L}" stroke-width=".8"><circle cx="-9" cy="1" r="2.6"/><circle cx="9" cy="1" r="2.6"/><circle cx="-4" cy="3" r="2.4"/><circle cx="4" cy="3" r="2.4"/></g>
      <rect x="-9" y="-3" width="18" height="4" rx="2" fill="#6b4b2a" stroke="${ESC_L}" stroke-width=".8" transform="rotate(15)"/><rect x="-9" y="-3" width="18" height="4" rx="2" fill="#6b4b2a" stroke="${ESC_L}" stroke-width=".8" transform="rotate(-15)"/>
      <path class="llama" d="M0 -3 q-7 -6 -2 -14 q1 5 4 6 q2 -4 1 -9 q6 6 3 15z" fill="#ffb02e" stroke="#c0661b" stroke-width=".8"/></g>`},
  campo:{col:3,spot:{x:346,y:191},svg:p=>`
    <g fill="#d9b27c" ${ESC_O}>${[0,1,2,3,4].map(i=>`<rect x="${306+i*21}" y="150" width="4" height="18" rx="1"/>`).join('')}<rect x="304" y="154" width="92" height="3"/><rect x="304" y="161" width="92" height="3"/></g>
    <rect x="316" y="114" width="7" height="40" fill="#7a5230" ${ESC_O}/><path d="M300 118 a13 13 0 0 1 6 -20 a14 14 0 0 1 26 -2 a12 12 0 0 1 5 22z" fill="${p.arbol}" ${ESC_O}/><circle cx="312" cy="104" r="4" fill="#ffffff2e"/>
    <rect x="370" y="108" width="7" height="46" fill="#7a5230" ${ESC_O}/><path d="M352 112 a15 15 0 0 1 6 -24 a17 17 0 0 1 32 -2 a14 14 0 0 1 4 26z" fill="${p.arbol2}" ${ESC_O}/><circle cx="366" cy="96" r="5" fill="#ffffff2e"/>
    <g stroke="${ESC_L}" stroke-width=".7">${[[330,182,'#ff7aa8'],[358,186,'#ffe14d'],[388,180,'#ff7aa8'],[342,192,'#ffe14d'],[376,190,'#b28dff']].map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="2.6" fill="${c}"/>`).join('')}</g>`},
};
/* Personajes de cómic con contorno. Si el juego no da colores, se toman en orden de aquí */
const ESC_DEF=[{ropa:'#3dd6ff',pelo:'#5a3a1a',piel:'#f2c9a0',pein:'corto'},{ropa:'#a78bfa',pelo:'#2b1a0f',piel:'#c98e62',pein:'coleta'},
  {ropa:'#ff7a45',pelo:'#e0b04a',piel:'#f5d2b0',pein:'rizos'},{ropa:'#2ecc71',pelo:'#7a2e12',piel:'#e8b48a',pein:'melena'},
  {ropa:'#ff5c8a',pelo:'#1b1b1b',piel:'#8d5a3b',pein:'rizos'},{ropa:'#ffc83d',pelo:'#c0392b',piel:'#f6d7bd',pein:'coleta'}];
function escPersona(p){
  const L=ESC_L,o=`stroke="${L}" stroke-width="1.1"`,hy=-45,hr=7.4,sc=hr/6.5,NS='vector-effect="non-scaling-stroke"';
  const t=`transform="translate(0 ${hy}) scale(${sc})"`,pst=`fill="${p.pelo}" stroke="${L}" stroke-width="1.1" ${NS}`;
  const atras=p.pein=='coleta'?`<ellipse cx="7.2" cy="1.5" rx="2.6" ry="5"/>`:p.pein=='melena'?`<rect x="-7.6" y="-5" width="15.2" height="14" rx="5"/>`:'';
  const delante=p.pein=='rizos'?`<circle cx="-5" cy="-3" r="3"/><circle cx="-1.7" cy="-5.6" r="3"/><circle cx="2" cy="-5.6" r="3"/><circle cx="5" cy="-3" r="3"/>`
    :`<path d="M-6.7 -.6 a6.7 6.7 0 0 1 13.4 0 q-3 -2.6 -6.7 -2.1 q-3.7 -.5 -6.7 2.1z"/>`;
  const ex={
    gorro:`<path transform="translate(0 ${hy-hr+1.5}) scale(${sc})" d="M-6 0 h12 v-4 a4.5 4.5 0 0 0 -2.5 -7 a4.5 4.5 0 0 0 -7 0 a4.5 4.5 0 0 0 -2.5 7z" fill="#fff" stroke="${L}" stroke-width="1.1" ${NS}/>`,
    mascara:`<path transform="translate(11 -19)" d="M-4.5 -2 q4.5 -3.4 9 0 q-1 5.5 -4.5 5.5 q-3.5 0 -4.5 -5.5z" fill="#ffc83d" ${o}/>`,
    camara:`<path d="M-6 -34 L0 -31 L6 -34" stroke="#222" stroke-width=".8" fill="none"/><g transform="translate(0 -28)"><rect x="-5" y="-3.5" width="10" height="7" rx="1.5" fill="#222" ${o}/><circle r="2" fill="#7fd3ff"/></g>`,
    libro:`<g transform="translate(11 -19) rotate(-10)"><rect x="-4" y="-5" width="8" height="10" rx="1" fill="#3d7bd9" ${o}/><path d="M-2 -3 h4 M-2 -1 h4" stroke="#fff" stroke-width=".7"/></g>`,
    balon:`<circle cx="12" cy="-17" r="4" fill="#fff" ${o}/><path d="M12 -19.5 l2 1.5 l-.8 2.3 h-2.4 l-.8 -2.3z" fill="${L}"/>`
  }[p.extra]||'';
  return `<ellipse class="aro" cx="0" cy="0" rx="17" ry="5"/><ellipse cx="0" cy="0" rx="10" ry="2.8" fill="rgba(0,0,0,.22)"/><g class="cuerpo">
    ${p.extra=='mochila'?`<rect x="-11" y="-33" width="7" height="14" rx="2.5" fill="#7a5530" ${o}/>`:''}
    <path d="M-3 -17 v15 M3 -17 v15" stroke="${L}" stroke-width="5.4" stroke-linecap="round"/><path d="M-3 -17 v15 M3 -17 v15" stroke="#2c3e66" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M-7.5 -32 q-3.5 6 -3.2 12.5 M7.5 -32 q3.5 6 3.2 12.5" stroke="${L}" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M-7.5 -32 q-3.5 6 -3.2 12.5 M7.5 -32 q3.5 6 3.2 12.5" stroke="${p.ropa}" stroke-width="3" stroke-linecap="round" fill="none"/>
    <circle cx="-10.7" cy="-19" r="2" fill="${p.piel}" ${o}/><circle cx="10.7" cy="-19" r="2" fill="${p.piel}" ${o}/>
    <path d="M-7.8 -32.5 q0 -3 3 -3 h9.6 q3 0 3 3 l-1.4 16 h-12.8z" fill="${p.ropa}" ${o}/>
    ${atras?`<g ${t} ${pst}>${atras}</g>`:''}<circle cx="0" cy="${hy}" r="${hr}" fill="${p.piel}" ${o}/>
    <ellipse cx="-2.7" cy="-44.2" rx="1.9" ry="2.3" fill="#fff" stroke="${L}" stroke-width=".7"/><ellipse cx="2.7" cy="-44.2" rx="1.9" ry="2.3" fill="#fff" stroke="${L}" stroke-width=".7"/>
    <circle cx="-2.3" cy="-43.8" r="1.1" fill="${L}"/><circle cx="3.1" cy="-43.8" r="1.1" fill="${L}"/><circle cx="-1.9" cy="-44.3" r=".4" fill="#fff"/><circle cx="3.5" cy="-44.3" r=".4" fill="#fff"/>
    <path d="M-4.4 -47.6 q1.6 -1 3.2 -.3 M1.2 -47.9 q1.6 -.7 3.2 .3" stroke="${L}" stroke-width=".8" fill="none" stroke-linecap="round"/>
    <circle cx="-4.6" cy="-41.4" r="1.2" fill="#ff8a8a" opacity=".55"/><circle cx="4.6" cy="-41.4" r="1.2" fill="#ff8a8a" opacity=".55"/>
    <path d="M-2.2 -40.6 q2.2 2.6 4.4 0z" fill="#8a2e2e" stroke="${L}" stroke-width=".6"/>
    <g ${t} ${pst}>${delante}</g>${ex}</g>
    <text y="13" text-anchor="middle" class="nom">${esc(p.n)}</text>`;
}
/* Dibuja una escena: sitios [{k, l}] (de 2 a 4), luz y lo que vaya encima (personajes). Devuelve el SVG y dónde se coloca cada uno */
function escSVG(sitios,luz,encima,etiqueta){
  const L=ESC_LUZ[luz]||ESC_LUZ.atardecer,W=sitios.length*100,u=++ESC_UID;
  const svg=`<svg class="esc" viewBox="0 0 ${W} 300" style="max-width:${Math.round(W*1.3)}px" role="img" aria-label="${esc(etiqueta||sitios.map(z=>z.l).join(', '))}">${escFondo(W,L,u)}
    ${sitios.map((z,i)=>{const d=ESC_SITIOS[z.k];if(!d){console.error(`Escena: no hay dibujo del sitio «${z.k}» (los que hay: ${Object.keys(ESC_SITIOS).join(', ')})`);return ''}
      return `<g transform="translate(${(i-d.col)*100} 0)">${d.svg(L.s)}</g>`}).join('')}
    ${L.velo?`<rect width="${W}" height="300" fill="${L.velo}" opacity=".08" pointer-events="none"/>`:''}
    ${sitios.map((z,i)=>`<g class="cartel"><rect x="${i*100+12}" y="50" width="76" height="16" rx="8"/><text x="${i*100+50}" y="62" text-anchor="middle">${esc(z.l)}</text></g>`).join('')}
    ${sitios.map((z,i)=>`<rect class="zona" data-z="${esc(z.k)}" x="${i*100+2}" y="46" width="96" height="178" rx="10" tabindex="0" role="button" aria-label="${esc(z.l)}"/>`).join('')}
    ${encima||''}</svg>`;
  const spot=k=>{const i=sitios.findIndex(z=>z.k==k),d=ESC_SITIOS[k];return d&&i>=0?{x:d.spot.x+(i-d.col)*100,y:d.spot.y}:{x:i*100+50,y:190}};
  return {svg,spot,W};
}
const escQuieto=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

Object.assign(STEP,{
  /* 🏞️ Construir una escena: {sitios:[{k,l}], gente:[{n, t, z, ropa?, pelo?, piel?, pein?, extra?}], luz?, q?}
     Lee la frase de cada persona y la lleva a su sitio (tocar, no arrastrar). Cuenta cada persona a la primera.
     Para que el último no salga por descarte: más sitios que personas, o dos personas en el mismo sitio. */
  scene(st,s,done){
    const G=s.gente.map((p,k)=>({...ESC_DEF[k%ESC_DEF.length],...p}));
    const E=escSVG(s.sitios,s.luz,'',s.q);
    const esp=shuf(G.map((_,k)=>Math.round(E.W*(k+.5)/G.length)));
    const gente=G.map((p,k)=>`<g class="pj" data-pj="${k}" style="transform:translate(${esp[k]}px,276px)" tabindex="0" role="button" aria-label="${esc(p.n)}">${escPersona(p)}</g>`).join('');
    st.innerHTML=`<div class="q">${esc(s.q||'Lee y lleva a cada uno a su sitio')}</div>
      ${E.svg.replace('</svg>',gente+'</svg>')}
      <div class="pers">${G.map((p,k)=>`<button class="per" data-p="${k}"><span class="sw" style="background:${p.ropa}"></span><span><b>${esc(p.n)}</b><br>${esc(p.t)}</span></button>`).join('')}</div>`;
    let sel=null,ok=0,puestos=0;const fallo=new Set(),enSitio={};
    const fb=m=>{$('#fb').innerHTML=m};
    const pj=k=>st.querySelector(`.pj[data-pj="${k}"]`),card=k=>st.querySelector(`.per[data-p="${k}"]`);
    const elegir=k=>{if(card(k).classList.contains('puesto'))return;sel=k;sfxTap();
      st.querySelectorAll('.per').forEach(x=>x.classList.toggle('sel',+x.dataset.p===k));st.querySelectorAll('.pj').forEach(g=>g.classList.toggle('sel',+g.dataset.pj===k));
      fb(`¿Dónde va <b>${esc(G[k].n)}</b>?`)};
    st.querySelectorAll('.per').forEach(b=>b.onclick=()=>elegir(+b.dataset.p));
    st.querySelectorAll('.pj').forEach(g=>{g.addEventListener('click',()=>elegir(+g.dataset.pj));g.addEventListener('keydown',e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();elegir(+g.dataset.pj)}})});
    st.querySelectorAll('.zona').forEach(z=>{
      const go=()=>{if(sel==null){fb('Primero toca a una persona 😉');return}
        const k=sel,p=G[k],g=pj(k);
        if(z.dataset.z!==p.z){
          if(!fallo.has(k)){fallo.add(k);lose()}
          z.classList.add('mal');g.classList.remove('err');void g.getBBox();g.classList.add('err');setTimeout(()=>{z.classList.remove('mal');g.classList.remove('err')},450);
          fb(`❌ Ahí no. Vuelve a leer: «${esc(p.t)}»`);return}
        if(!fallo.has(k)){ok++;win(10)}else sfxOk();
        puestos++;sel=null;st.querySelectorAll('.pj').forEach(x=>x.classList.remove('sel'));
        const c=card(k);c.classList.remove('sel');c.classList.add('puesto');c.disabled=true;
        const n=enSitio[p.z]=(enSitio[p.z]||0)+1,sp=E.spot(p.z),dx=[0,28,-28,56,-56][n-1]||0;
        g.classList.add('anda');g.style.transform=`translate(${sp.x+dx}px,${sp.y}px)`;g.style.pointerEvents='none';g.removeAttribute('tabindex');
        setTimeout(()=>{g.classList.remove('anda');g.classList.add('salta')},escQuieto()?0:900);
        if(puestos<G.length){fb(`✅ ¡Bien! ${esc(p.n)} ya está en su sitio.`);return}
        st.querySelectorAll('.zona').forEach(x=>{x.removeAttribute('tabindex');x.style.pointerEvents='none'});
        done(ok,G.length,ok==G.length?'✅ ¡Escena completa, todos a la primera!':`👍 Escena completa: ${ok} de ${G.length} a la primera.`)};
      z.addEventListener('click',go);z.addEventListener('keydown',e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();go()}})});
  },
});
Object.assign(STEP,{
  /* 📖 Historia ramificada: {titulo?, sitios:[{k,l}], luz?, reparto:[{n, ropa?, pelo?, piel?, pein?, extra?}], fin,
       nodos:[{relato, donde:{nombre:sitio}, luz?, q, opts+a | acc+show, repaso, bien?}]}
     Cada decisión es un ejercicio del temario. La escena se queda arriba y los personajes caminan de un sitio a otro.
     Si falla: repaso corto y otra oportunidad (ya no puntúa). Al segundo fallo se enseña la respuesta y la historia sigue
     (las ramas se juntan siempre). Cuenta cada decisión a la primera. */
  story(st,s,done){
    const RP=s.reparto.map((p,k)=>({...ESC_DEF[k%ESC_DEF.length],...p})),N=s.nodos,tildes=JUEGO.tildesCuentan??false;
    let i=0,primera=0,luz=null,E=null;const desvio=new Set();
    st.innerHTML=`${s.titulo?`<div class="hint" style="margin-top:0">📖 ${esc(s.titulo)}</div>`:''}<div class="mapa" id="hmapa" aria-label="Camino de la historia"></div>
      <div id="hesc"></div><div class="relato" id="hrel"></div><div id="hrep"></div><div class="q" id="hq"></div><div id="hans"></div><div class="fb" id="hfb"></div><div id="hnx"></div>`;
    const mapa=()=>{$('#hmapa').innerHTML=N.map((_,k)=>`<span class="nodo ${k<i?'done':k==i?'now':''}">${k<i?'✓':k+1}${desvio.has(k)?'<span class="rep">↺ repaso</span>':''}</span><span class="tramo"></span>`).join('')+`<span class="nodo ${i>=N.length?'done':''}">🏁</span>`};
    const pj=k=>$('#hesc').querySelector(`.pj[data-pj="${k}"]`);
    /* Coloca a cada personaje en su sitio del nodo; los que no salen se esconden */
    const coloca=(n,anim)=>{const cuenta={};
      RP.forEach((p,k)=>{const g=pj(k),z=n.donde&&n.donde[p.n];if(!g)return;
        if(!anim){g.style.transition='none'}
        if(z){const c=cuenta[z]=(cuenta[z]||0)+1,sp=E.spot(z),dx=[0,28,-28,56,-56][c-1]||0,estaba=!g.classList.contains('fuera');g.classList.remove('fuera');
          const antes=g.style.transform,ahora=`translate(${sp.x+dx}px,${sp.y}px)`;g.style.transform=ahora;
          if(anim&&estaba&&antes!==ahora){g.classList.add('anda');setTimeout(()=>g.classList.remove('anda'),escQuieto()?0:900)}}
        else g.classList.add('fuera');
        if(!anim){void g.getBBox();g.style.transition=''}})};
    const pinta=n=>{const lz=n.luz||s.luz||'atardecer';
      if(lz!==luz){luz=lz;E=escSVG(s.sitios,lz,'',s.titulo);
        $('#hesc').innerHTML=E.svg.replace('</svg>',RP.map((p,k)=>`<g class="pj fuera" data-pj="${k}" style="transform:translate(${E.W/2}px,276px)">${escPersona(p)}</g>`).join('')+'</svg>');
        $('#hesc').querySelectorAll('.zona').forEach(z=>{z.removeAttribute('tabindex');z.removeAttribute('role');z.style.pointerEvents='none'});
        coloca(n,false)}else coloca(n,true)};
    const reacciona=c=>{RP.forEach((_,k)=>{const g=pj(k);if(!g||g.classList.contains('fuera'))return;g.classList.remove('salta','err');void g.getBBox();g.classList.add(c)})};
    const seguir=()=>{const ult=i+1>=N.length;$('#hnx').innerHTML=`<button class="btn" id="hs">${ult?'Final de la historia 🏁':'Seguir la historia ➜'}</button>`;
      $('#hs').onclick=()=>{i++;ult?final():show(0)};$('#hs').focus({preventScroll:true})};
    const final=()=>{mapa();st.removeAttribute('data-nodo');['#hrep','#hq','#hans','#hfb','#hnx'].forEach(x=>$(x).innerHTML='');
      $('#hrel').textContent=s.fin||'¡Fin de la historia!';confetti();
      done(primera,N.length,primera==N.length?'✅ ¡Todas las decisiones a la primera!':`👍 ${primera} de ${N.length} decisiones a la primera.`)};
    function show(intento){
      const n=N[i];st.dataset.nodo=i;mapa();pinta(n);
      $('#hrel').textContent=n.relato;$('#hfb').innerHTML='';$('#hnx').innerHTML='';
      $('#hrep').innerHTML=intento?`<div class="repaso">↺ <b>Repaso rápido:</b> ${esc(n.repaso)} Prueba otra vez.</div>`:'';
      $('#hq').textContent=n.q;
      const responde=(ok,bueno)=>{
        if(ok){if(!intento){primera++;win(10)}else sfxOk();reacciona('salta');
          $('#hfb').innerHTML='✅ '+esc(n.bien||'¡Bien! La historia sigue.');seguir();return}
        reacciona('err');
        if(!intento){desvio.add(i);lose();$('#hfb').innerHTML='❌ Esa no encaja. Un repaso rápido…';setTimeout(()=>show(1),900);return}
        $('#hfb').innerHTML=`❌ Era: <b>${esc(bueno)}</b>. ${esc(n.repaso)}`;seguir()};
      if(n.opts){
        $('#hans').innerHTML=`<div class="opts ${n.opts.some(o=>o.length>22)?'':'two'}">${shuf(n.opts).map(o=>`<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
        $('#hans').querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const ok=b.dataset.o===n.a;
          $('#hans').querySelectorAll('.opt').forEach(x=>{x.disabled=true;if(x.dataset.o===n.a&&(ok||intento))x.classList.add('ok')});
          if(!ok){b.classList.add('bad','shake')}responde(ok,n.a)});
      }else{
        $('#hans').innerHTML=`<input class="typ" id="wa" ${NOAUTO} placeholder="Escribe aquí"><button class="btn" id="wchk" style="margin-top:0">Comprobar ✔</button>`;
        const inp=$('#wa');inp.focus({preventScroll:true});
        const go=()=>{const v=limpiaR(inp.value,tildes);if(!v){$('#hfb').textContent='Escribe tu respuesta 😉';return}
          const ok=n.acc.some(a=>limpiaR(a,tildes)==v);inp.classList.add(ok?'ok':'bad');inp.disabled=true;$('#wchk').remove();responde(ok,n.show||n.acc[0])};
        $('#wchk').onclick=go;inp.onkeydown=e=>{if(e.key=='Enter'){e.preventDefault();go()}};
      }
    }
    show(0);
  },
});
Object.assign(STEP,{
  /* 🔎 Miniinvestigación (5º): {quien:{n, aspecto…}, ficha:[[icono, texto]], agenda?:[[día, texto]], agendaT?, q, opts, a, ex?,
       sitios?, planes?:{opción: sitio}, luz?}
     Consulta la ficha y la agenda de un personaje y decide. Con sitios y planes, al elegir el personaje camina
     al sitio de ese plan: salta si encaja y tiembla si no. Cuenta a la primera, como un test. */
  probe(st,s,done){
    const P={...ESC_DEF[0],...s.quien},E=s.sitios?escSVG(s.sitios,s.luz,'',s.q):null;
    const dibujo=E?E.svg.replace('</svg>',`<g class="pj" data-pj="0" style="transform:translate(${E.W/2}px,276px)">${escPersona(P)}</g></svg>`)
      :`<svg class="retrato" viewBox="-24 -60 48 78" aria-hidden="true">${escPersona(P)}</svg>`;
    st.innerHTML=`${E?dibujo:''}<div class="dossier"><section><div class="quien">${E?'':dibujo}<h4>📇 ${esc(P.n)}</h4></div>
      <table>${s.ficha.map(([i,t])=>`<tr><td>${i}</td><td>${esc(t)}</td></tr>`).join('')}</table></section>
      ${s.agenda?`<section><h4>📅 ${esc(s.agendaT||'Agenda')}</h4><table>${s.agenda.map(([d,t])=>`<tr><td><b>${esc(d)}</b></td><td>${esc(t)}</td></tr>`).join('')}</table></section>`:''}</div>
      <div class="q">${esc(s.q)}</div><div class="opts">${shuf(s.opts).map(o=>`<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
    if(E)st.querySelectorAll('.zona').forEach(z=>{z.removeAttribute('tabindex');z.removeAttribute('role');z.style.pointerEvents='none'});
    st.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      const ok=b.dataset.o===s.a;
      st.querySelectorAll('.opt').forEach(x=>{x.disabled=true;if(x.dataset.o===s.a)x.classList.add('ok')});
      if(!ok)b.classList.add('bad','shake');
      const g=st.querySelector('.pj'),z=s.planes&&s.planes[b.dataset.o];
      if(g&&z&&E){const sp=E.spot(z);g.classList.add('anda');g.style.transform=`translate(${sp.x}px,${sp.y}px)`;
        setTimeout(()=>{g.classList.remove('anda');g.classList.add(ok?'salta':'err')},escQuieto()?0:900)}
      else if(g){g.classList.add(ok?'salta':'err')}
      else{const r=st.querySelector('.retrato .cuerpo');if(r){r.parentNode.classList.add(ok?'salta':'err')}}
      ok?win():lose();done(ok?1:0,1,(ok?'✅ ¡Buena investigación! ':'❌ Era: <b>'+esc(s.a)+'</b>'+(/[.!?]$/.test(s.a)?' ':'. '))+(s.ex?`<span style="color:var(--mut)">${esc(s.ex)}</span>`:''));
    });
  },
});
function sfxOk(){try{const A=window._ac||(window._ac=new (window.AudioContext||window.webkitAudioContext)());const o=A.createOscillator(),g=A.createGain();o.connect(g);g.connect(A.destination);const n=A.currentTime;o.frequency.setValueAtTime(660,n);o.frequency.exponentialRampToValueAtTime(990,n+.12);g.gain.setValueAtTime(.08,n);g.gain.exponentialRampToValueAtTime(.001,n+.2);o.start(n);o.stop(n+.21)}catch(e){}}
function sfxTap(){try{const A=window._ac||(window._ac=new (window.AudioContext||window.webkitAudioContext)());const o=A.createOscillator(),g=A.createGain();o.connect(g);g.connect(A.destination);const n=A.currentTime;o.frequency.setValueAtTime(520,n);g.gain.setValueAtTime(.05,n);g.gain.exponentialRampToValueAtTime(.001,n+.08);o.start(n);o.stop(n+.09)}catch(e){}}

/* Ejecuta una lista de pasos y da la nota del bloque */
function runSteps(title,steps,key,again,icon='⭐'){
  let i=0,ok=0,tot=0;
  function next(){
    if(i>=steps.length)return endScreen(icon,ok,tot,key,again);
    const s=steps[i];window._S=s;
    app().innerHTML=`<div class="box"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h2>${title}</h2>${routeTag()}</div>
    <p class="sub">${s.t=='tiles'?'':(s.sub||'')}</p><div class="bar"><div style="width:${i/steps.length*100}%"></div></div><div class="hint">${i+1} de ${steps.length}</div>
    <div id="stage"></div><div class="fb" id="fb"></div><div id="nx"></div></div>`;
    STEP[s.t]($('#stage'),s,(o,t,msg)=>{ok+=o;tot+=t;$('#fb').innerHTML=msg||'';
      $('#nx').innerHTML=`<button class="btn">${i+1<steps.length?'Siguiente ➜':'Ver resultado 🏁'}</button>`;$('#nx .btn').onclick=()=>{i++;next()};
      $('#nx .btn').focus({preventScroll:true})});
  }
  next();
}
const gapOf=q=>({t:'gap',q:q.q,opts:q.opts,a:q.a,ex:q.ex});
const mcOf=q=>({t:'mc',q:q.q,opts:q.opts,a:q.a,ex:q.ex});
const hasGap=q=>/_{3,}/.test(q.q);
const chunk=(a,n)=>{const o=[];for(let i=0;i<a.length;i+=n)o.push(a.slice(i,i+n));return o};

/* =====================================================================
   RUTA DE ESTUDIO: de lo más difícil a lo más ligero, por estaciones
   ===================================================================== */
let ROUTE=null;
try{ROUTE=JSON.parse(localStorage.getItem(JUEGO.claves.ruta)||'null')}catch(e){}
function saveRoute(){try{ROUTE?localStorage.setItem(JUEGO.claves.ruta,JSON.stringify(ROUTE)):localStorage.removeItem(JUEGO.claves.ruta)}catch(e){}}
function routePart(){const P=JUEGO.ruta.partes;if(!P||!P.length)return null;const n=(ROUTE&&ROUTE.part)||0;return P[n%P.length]}
function routeTag(){return ROUTE&&ROUTE.on?`<span class="pill" style="font-size:13px">🧭 ${ROUTE.i+1}/${ROUTE_ST.length}</span>`:''}
function startStation(){
  const s=ROUTE_ST[ROUTE.i];saveRoute();
  const part=routePart();
  if(JUEGO.ruta.estacion&&JUEGO.ruta.estacion(s.k,part))return;
  R[s.k]();
}
function routeMap(){
  const left=ROUTE_ST.slice(ROUTE?ROUTE.i:0).reduce((a,s)=>a+s.min,0);
  return `<div class="rmap">${ROUTE_ST.map((s,n)=>{const st=!ROUTE?'':n<ROUTE.i?'done':n==ROUTE.i?'now':'';
    return `<div class="rst ${st}"><div class="rdot">${st=='done'?'✓':s.ic}</div><div class="rname">${s.n}</div></div>`}).join('')}</div>
    <p class="sub center" style="margin-top:10px">⏱️ Quedan unos <b>${left} minutos</b></p>`;
}
const _end=endScreen;
endScreen=function(icon,ok,tot,key,again,extra=''){
  _end(icon,ok,tot,key,again,extra);
  if(!(ROUTE&&ROUTE.on&&ROUTE_ST[ROUTE.i]&&ROUTE_ST[ROUTE.i].k==key))return;
  ROUTE.i++;XP+=20;hud();save();
  const box=document.querySelector('.box');
  if(ROUTE.i>=ROUTE_ST.length){
    ROUTE.part=((ROUTE.part||0)+1)%Math.max(1,(JUEGO.ruta.partes||[]).length);ROUTE.on=false;ROUTE.i=0;saveRoute();confetti();setTimeout(confetti,600);
    box.insertAdjacentHTML('beforeend',`<div class="routeend"><div class="big">🏁</div><h2>¡Ruta completada!</h2><p style="font-size:18px">+20 XP por estación. ${JUEGO.ruta.textoFin||''}</p>
      <button class="btn" onclick="R.exam()">👑 Hacer el examen final</button></div>`);
    box.querySelector('#again').remove();return}
  saveRoute();const nx=ROUTE_ST[ROUTE.i];
  box.querySelector('#again').outerHTML=`<button class="btn" id="rnext">▶ Siguiente estación: ${nx.ic} ${nx.n}</button>`;
  box.insertAdjacentHTML('beforeend',`<div style="margin-top:14px">${routeMap()}</div><p class="center" style="color:var(--gold)">+20 XP por estación completada</p>`);
  $('#rnext').onclick=startStation;
};
R.route=function(){
  const resume=ROUTE&&ROUTE.i>0;
  if(!ROUTE)ROUTE={i:0,part:0,on:false};
  app().innerHTML=`<div class="box"><h2>🧭 Ruta de estudio</h2>
  <p class="sub">${ROUTE_ST.length} estaciones seguidas, unos 30 minutos. Empieza por lo más difícil, con la cabeza fresca, y termina con lo más ligero. Cuenta igual que las misiones sueltas.</p>
  ${routeMap()}
  ${routePart()?`<p class="sub center">${JUEGO.ruta.textoParte}: <b>${routePart().l}</b></p>`:''}
  <div class="center">${resume?`<button class="btn" id="rgo">▶ Seguir por la estación ${ROUTE.i+1}</button> <button class="btn sec" id="rnew">Empezar de cero</button>`:`<button class="btn" id="rgo">▶ Empezar la ruta</button>`}
  <button class="btn sec" onclick="home()">🏠 Menú</button></div></div>`;
  $('#rgo').onclick=()=>{ROUTE.on=true;startStation()};
  const rn=$('#rnew');if(rn)rn.onclick=()=>{ROUTE.i=0;ROUTE.on=true;startStation()};
};

/* ===== ARCADE (se desbloquea al jugar todos los bloques) ===== */
const ARC=(()=>{
/* ===== Banco de preguntas: los mismos ejercicios del juego ===== */
const mc=q=>({...q,opts:shuf([...new Set(q.opts)])});
const ABLK=JUEGO.arcade.bloques;
/* El juego da las preguntas de test (arcade.test) y las de deletrear (arcade.deletreo) de cada bloque */
function bankMC(k){return shuf(JUEGO.arcade.test(k).map(mc)).filter(q=>q.opts.length>=2&&q.opts.includes(q.a))}
function bankSpell(k){return shuf(JUEGO.arcade.deletreo(k))}
/* ===== Estado ===== */
let ST={coins:0,best:{},blk:'mix'};
try{Object.assign(ST,JSON.parse(localStorage.getItem(JUEGO.claves.arcade)||'{}'))}catch(e){}
function asave(){try{localStorage.setItem(JUEGO.claves.arcade,JSON.stringify(ST))}catch(e){}}
function coins(n){XP+=n*5;hud();save()}
function record(mode,score){const key=mode+':'+ST.blk;const old=ST.best[key]||0;if(score>old){ST.best[key]=score;asave();return true}return false}
const best=mode=>ST.best[mode+':'+ST.blk]||0;
/* ===== Sonido y efectos ===== */
let AC=null;
function sfx(t){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(AC.destination);
  const f={ok:[660,990],bad:[220,140],pop:[880,1320],win:[523,1047],hit:[300,600]}[t]||[440,440];const n=AC.currentTime;
  o.type=t=='bad'?'sawtooth':'triangle';o.frequency.setValueAtTime(f[0],n);o.frequency.exponentialRampToValueAtTime(f[1],n+.15);
  g.gain.setValueAtTime(.12,n);g.gain.exponentialRampToValueAtTime(.001,n+.25);o.start(n);o.stop(n+.26)}catch(e){}}
function confetti(){const e=['⭐','🎉','✨','🏆','🪙'];for(let i=0;i<24;i++){const d=document.createElement('div');d.className='conf';d.textContent=e[i%5];d.style.left=Math.random()*100+'vw';d.style.animationDelay=Math.random()*.5+'s';document.body.appendChild(d);setTimeout(()=>d.remove(),2300)}}
function floatTxt(txt,x,y,color){const d=document.createElement('div');d.className='dmg';d.textContent=txt;d.style.left=x+'px';d.style.top=y+'px';if(color)d.style.color=color;document.body.appendChild(d);setTimeout(()=>d.remove(),1000)}
let TIMERS=[];function clearAll(){TIMERS.forEach(t=>{clearInterval(t);clearTimeout(t);cancelAnimationFrame(t)});TIMERS=[];document.onkeydown=null}
/* ===== Pantalla de resultado ===== */
function result(icon,title,lines,mode,score,again){
  clearAll();const rec=record(mode,score);const c=Math.max(1,Math.round(score/10));coins(c);if(rec||score>0)confetti();sfx('win');
  app().innerHTML=`<div class="box center"><div class="big">${icon}</div><h2>${title}</h2>
  <p style="font-size:22px">${lines}</p>
  <p style="font-size:20px">${rec?'🏆 ¡NUEVO RÉCORD!':'Récord: '+best(mode)} · +${c*5} XP</p>
  <button class="btn" id="again">🔁 Otra vez</button> <button class="btn sec" onclick="ARC.home()">🏠 Modos</button></div>`;
  $('#again').onclick=again;
}
function answerOpts(q,onPick){
  const long=q.opts.some(o=>o.length>22);
  return `<div class="aopts ${long?'long':''}">${q.opts.map((o,i)=>`<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
}
function wireOpts(q,cb){document.querySelectorAll('.opt').forEach(b=>b.onclick=e=>{
  document.querySelectorAll('.opt').forEach(x=>{x.disabled=true;if(x.textContent==q.a)x.classList.add('ok')});
  const ok=b.textContent==q.a;if(!ok)b.classList.add('bad');cb(ok,e,b)})}

/* ===== MENÚ ===== */
const MODES=[
 {k:'time',c:'m1',ic:'⚡',n:'Contrarreloj',d:'60 segundos. Acierta seguido para multiplicar puntos.',r:s=>s+' puntos'},
 {k:'boss',c:'m2',ic:'🐉',n:'Batalla contra el jefe',d:'Cada acierto es un ataque. ¡Que no te quite las 3 vidas!',r:s=>s+' jefes'},
 {k:'balloon',c:'m3',ic:'🎈',n:'Explota globos',d:'Explota el globo correcto antes de que se escape.',r:s=>s+' globos'},
 {k:'spell',c:'m4',ic:'🚀',n:'Rescate letra a letra',d:'Escribe la palabra letra a letra antes de que despegue el cohete.',r:s=>s+' rescates'},
];
function ahome(){
  clearAll();
  app().innerHTML=`<div class="box"><h2>🎮 Arcade</h2><p class="sub">Los mismos ejercicios, en modo arcade. Lo que ganas suma XP, pero no cuenta para la nota. Vence a un jefe y gana la ⭐ número ${MAXST}.</p>
  <div class="achips">${ABLK.map(b=>`<button class="chipb ${ST.blk==b.k?'on':''}" data-k="${b.k}">${b.ic} ${b.n}</button>`).join('')}</div>
  <div class="modes">${MODES.map((m,ix)=>`<button class="mode ${m.c}" data-k="${m.k}"><div class="tag">Modo 0${ix+1}</div><div class="ic">${m.ic}</div><h3>${m.n}</h3><p>${m.d}</p><div class="rec">🏆 ${m.r(best(m.k))}</div></button>`).join('')}</div><button class="btn sec" onclick="home()">🏠 Volver a las misiones</button></div>`;
  document.querySelectorAll('.chipb').forEach(b=>b.onclick=()=>{ST.blk=b.dataset.k;asave();ahome()});
  document.querySelectorAll('.mode').forEach(b=>b.onclick=()=>G[b.dataset.k]());
}

const G={
 /* ⚡ CONTRARRELOJ */
 time(){
   let qs=bankMC(ST.blk),i=0,score=0,streak=0,left=60,total=60,hits=0,miss=0;
   app().innerHTML=`<div class="box"><div class="hudrow"><span>⚡ Contrarreloj</span><span id="sc">0 pts</span><span class="combo" id="cb"></span><span id="tl">60 s</span></div>
   <div class="timer"><div id="tb" style="width:100%"></div></div><div id="qa"></div></div>`;
   const tick=setInterval(()=>{left-=.2;if(left<=0){left=0;end()}$('#tb').style.width=(left/total*100)+'%';$('#tl').textContent=Math.ceil(left)+' s'},200);TIMERS.push(tick);
   function mult(){return streak>=9?4:streak>=6?3:streak>=3?2:1}
   function show(){if(i>=qs.length){qs=bankMC(ST.blk);i=0}const q=qs[i];
     $('#qa').innerHTML=`<div class="q">${esc(q.q)}</div>${answerOpts(q)}`;
     wireOpts(q,(ok,e)=>{if(ok){streak++;hits++;const p=10*mult();score+=p;left=Math.min(total,left+2);sfx('ok');floatTxt('+'+p,e.clientX,e.clientY)}
       else{streak=0;miss++;left=Math.max(0,left-3);sfx('bad');$('#qa').classList.add('shake');floatTxt('-3 s',e.clientX,e.clientY,'#ff5c5c')}
       $('#sc').textContent=score+' pts';$('#cb').textContent=mult()>1?'🔥 x'+mult():'';
       TIMERS.push(setTimeout(()=>{$('#qa')&&$('#qa').classList.remove('shake');i++;show()},ok?350:900))});
   }
   let done=false;function end(){if(done)return;done=true;result('⚡','¡Tiempo!',`${score} puntos · ${hits} aciertos · ${miss} fallos`,'time',score,G.time)}
   show();
 },
 /* 🐉 JEFE */
 boss(){
   const BOSS=JUEGO.arcade.jefes;
   let qs=bankMC(ST.blk),i=0,lives=3,beaten=0,streak=0,hp,maxhp,qtime=12,qleft;
   const [face,name]=BOSS[ST.blk];
   function newBoss(){maxhp=100+beaten*40;hp=maxhp;qtime=Math.max(6,12-beaten*2)}
   newBoss();
   app().innerHTML=`<div class="box"><div class="hudrow"><span id="bn"></span><span id="lv"></span></div>
   <div class="hp" style="margin-top:8px"><div id="hpb" style="width:100%"></div></div>
   <div class="arena"><div class="hero">🥷</div><div class="boss" id="boss">${face}</div></div>
   <div class="timer"><div id="atb" style="width:100%"></div></div><div class="hint" style="color:var(--mut);font-size:13px">Si la barra se vacía, ¡el jefe ataca!</div><div id="qa"></div></div>`;
   function hud(){$('#bn').textContent=`${name} ${beaten?'nivel '+(beaten+1):''}`;$('#lv').textContent='❤️'.repeat(lives)+'🖤'.repeat(3-lives);$('#hpb').style.width=(hp/maxhp*100)+'%'}
   function hurt(){lives--;sfx('bad');const b=$('#boss');b.classList.remove('atk');void b.offsetWidth;b.classList.add('atk');document.querySelector('.box').classList.add('flash-bad');setTimeout(()=>document.querySelector('.box')&&document.querySelector('.box').classList.remove('flash-bad'),400);streak=0;hud();if(lives<=0){end();return true}return false}
   let atk;
   function show(){if(i>=qs.length){qs=bankMC(ST.blk);i=0}const q=qs[i];qleft=qtime;
     $('#qa').innerHTML=`<div class="q">${esc(q.q)}</div>${answerOpts(q)}`;
     clearInterval(atk);atk=setInterval(()=>{qleft-=.1;$('#atb').style.width=Math.max(0,qleft/qtime*100)+'%';if(qleft<=0){clearInterval(atk);document.querySelectorAll('.opt').forEach(x=>{x.disabled=true;if(x.textContent==q.a)x.classList.add('ok')});if(!hurt())TIMERS.push(setTimeout(()=>{i++;show()},900))}},100);TIMERS.push(atk);
     wireOpts(q,(ok,e)=>{clearInterval(atk);
       if(ok){streak++;const crit=streak>=3;const d=(crit?30:20)+Math.round(qleft);hp=Math.max(0,hp-d);sfx('hit');const b=$('#boss');b.classList.remove('hit');void b.offsetWidth;b.classList.add('hit');
         const r=b.getBoundingClientRect();floatTxt((crit?'💥 CRÍTICO -':'-')+d,r.left,r.top);hud();
         if(hp<=0){beaten++;coins(5);if(!BEST.arcade){BEST.arcade=1;save()}confetti();sfx('win');$('#qa').innerHTML=`<div class="q center">🏆 ¡Has vencido al jefe! +25 XP · ⭐ estrella del arcade<br><span style="color:var(--mut);font-size:16px">Llega uno más fuerte y más rápido…</span></div>`;
           TIMERS.push(setTimeout(()=>{newBoss();hud();i++;show()},1800));return}
         TIMERS.push(setTimeout(()=>{i++;show()},500))}
       else{if(!hurt())TIMERS.push(setTimeout(()=>{i++;show()},1000))}});
   }
   let done=false;function end(){if(done)return;done=true;result(beaten?'🏆':'💀',beaten?`¡Venciste a ${beaten} jefe${beaten>1?'s':''}!`:'El jefe ganó esta vez',`Jefes vencidos: ${beaten}`,'boss',beaten,G.boss)}
   hud();show();
 },
 /* 🎈 GLOBOS */
 balloon(){
   let qs=bankMC(ST.blk).filter(q=>q.opts.every(o=>o.length<=24)),i=0,lives=3,popped=0,round=0,speed;
   const COLS=['#dc2f45','#7c4dde','#0f9d74','#e2672e','#c2398f','#1a8fc2'];
   app().innerHTML=`<div class="box"><div class="hudrow"><span>🎈 Explota globos</span><span id="pp">🎈 0</span><span id="lv"></span></div>
   <div class="q" id="qq"></div><div class="sky" id="sky"><div class="cloud" style="left:8%;top:12%">☁️</div><div class="cloud" style="right:10%;top:30%">☁️</div></div></div>`;
   function hud(){$('#lv').textContent='❤️'.repeat(lives)+'🖤'.repeat(Math.max(0,3-lives));$('#pp').textContent='🎈 '+popped}
   function show(){
     if(lives<=0)return end();
     if(i>=qs.length){qs=bankMC(ST.blk).filter(q=>q.opts.every(o=>o.length<=24));i=0}
     const q=qs[i];round++;speed=0.72+Math.min(1.45,round*0.065);
     $('#qq').textContent=q.q;
     const sky=$('#sky');sky.querySelectorAll('.bal').forEach(b=>b.remove());
     const n=q.opts.length,slots=shuf([...Array(n).keys()]);let resolved=false;
     const bals=q.opts.map((o,k)=>{const d=document.createElement('div');d.className='bal';d.dataset.o=o;
       d.style.left=(slots[k]*(100/n)+(100/n-40)/2)+'%';d.style.left=`calc(${slots[k]*(100/n)}% + 4px)`;d.style.width=`calc(${100/n}% - 8px)`;
       d.innerHTML=`<div class="b" style="background:${COLS[(k+round)%COLS.length]}">${esc(o)}</div><div class="s"></div>`;
       d._y=-130-Math.random()*90;d._v=speed*(0.85+Math.random()*0.3);sky.appendChild(d);
       d.onclick=()=>{if(resolved||d.classList.contains('pop'))return;
         if(o==q.a){resolved=true;d.classList.add('pop');sfx('pop');popped++;hud();const r=d.getBoundingClientRect();floatTxt('+1 🎈',r.left+20,r.top);
           bals.forEach(x=>{if(x!=d)x.style.opacity=.35});TIMERS.push(setTimeout(()=>{i++;show()},600))}
         else{d.classList.add('pop');sfx('bad');lives--;hud();sky.classList.add('shake');setTimeout(()=>sky.classList.remove('shake'),400);if(lives<=0){resolved=true;showAns(q);TIMERS.push(setTimeout(end,1400))}}};
       return d});
     const H=sky.clientHeight;
     function frame(){if(resolved)return;let esc=false;bals.forEach(b=>{if(b.classList.contains('pop'))return;b._y+=b._v;b.style.bottom=b._y+'px';if(b.dataset.o==q.a&&b._y>H+10)esc=true});
       if(esc){resolved=true;lives--;sfx('bad');hud();showAns(q);TIMERS.push(setTimeout(()=>{i++;show()},1300));return}
       TIMERS.push(requestAnimationFrame(frame))}
     TIMERS.push(requestAnimationFrame(frame));
   }
   function showAns(q){$('#qq').innerHTML=`${esc(q.q)}<br><span style="color:var(--yes)">✔ ${esc(q.a)}</span>`}
   let done=false;function end(){if(done)return;done=true;result('🎈','¡Se acabaron las vidas!',`Has explotado ${popped} globos buenos`,'balloon',popped,G.balloon)}
   hud();show();
 },
 /* 🚀 RESCATE LETRA A LETRA */
 spell(){
   let qs=bankSpell(ST.blk),i=0,saved=0,fails=0;const MAXF=6,ROUNDS=8;
   function show(){
     if(i>=ROUNDS||fails>=3)return result('🚀',fails>=3?'¡Fin de la misión!':'¡Misión completada!',`Rescates: ${saved} de ${i}`,'spell',saved,G.spell);
     const q=qs[i%qs.length],target=q.a.toLowerCase();let guessed=new Set(),miss=0,over=false;
     const isL=c=>/[a-z]/.test(c);
     app().innerHTML=`<div class="box"><div class="hudrow"><span>🚀 Rescate ${i+1}/${ROUNDS}</span><span>🧑‍🚀 ${saved}</span><span>${'❌'.repeat(fails)}</span></div>
     <div class="q center">${esc(q.q)}</div><div class="center" style="color:var(--mut)">${esc(q.h)}</div>
     <div class="rocket" id="rk"></div><div class="word" id="wd"></div><div class="kb" id="kb"></div><div class="center" id="fb" style="min-height:50px;font-size:18px;margin-top:10px"></div></div>`;
     const rows=['qwertyuiop','asdfghjkl','zxcvbnm'];
     $('#kb').innerHTML=rows.map(r=>`<div>${[...r].map(c=>`<button class="key" data-c="${c}">${c}</button>`).join('')}</div>`).join('');
     function draw(){
       $('#wd').innerHTML=target.split(' ').map(wd=>`<div class="wgrp">${[...wd].map(c=>!isL(c)?`<span class="sp">${esc(c)}</span>`:`<span>${guessed.has(c)||over?c:''}</span>`).join('')}</div>`).join('');
       $('#rk').textContent='🔥'.repeat(miss)+'🚀'+'·'.repeat(MAXF-miss)+'🌍';
     }
     function tryC(c){if(over||guessed.has(c))return;guessed.add(c);const k=document.querySelector(`.key[data-c="${c}"]`);
       if(target.includes(c)){k&&k.classList.add('ok');sfx('ok')}else{k&&k.classList.add('bad');miss++;sfx('bad')}
       const solved=[...target].every(x=>!isL(x)||guessed.has(x));
       if(solved){over=true;saved++;coins(2);confetti();sfx('win');$('#fb').innerHTML='✅ ¡Rescatado! +10 XP'}
       else if(miss>=MAXF){over=true;fails++;$('#fb').innerHTML=`🚀 ¡Despegó! Era <b>${esc(q.a)}</b>`}
       draw();if(over){$('#fb').innerHTML+=` <button class="btn" id="nx" style="margin-top:6px">Siguiente ➜</button>`;$('#nx').onclick=()=>{i++;show()}}}
     document.querySelectorAll('.key').forEach(b=>b.onclick=()=>tryC(b.dataset.c));
     document.onkeydown=e=>{if(/^[a-z]$/i.test(e.key))tryC(e.key.toLowerCase());else if(e.key=='Enter'&&$('#nx'))$('#nx').click()};
     draw();
   }
   show();
 },
};

return{home:ahome,clear:clearAll};
})();
hud();home();loadClass();
