/* =====================================================================
   Misión Estudio · arcade de Mates · 🗼 LA TORRE DEL JEFE (22-nov)
   Elegida por el padre en el artefacto «Arcade de Misión Estudio» (A1; plan del 22-nov y ronda 5, T1 «Duelo de frente»):
   cuatro plantas de abajo arriba (dividir por una cifra, por dos cifras, divisores y un problema corto), cada una con
   el robot guardián de su color. Cada turno, una pregunta con tres respuestas y sin reloj: acertar le quita una vida
   al guardián; fallar quita una de tus tres vidas y enseña la cuenta. Tres aciertos seguidos cargan el golpe fuerte:
   escribir el cociente y el resto de una división (teclado de la app y borrador al lado). Si sale bien, el guardián
   pierde media vida; si sale mal, se gasta la carga sin perder vida.
   Pantalla de «Empezar» antes de cada planta; sin vidas, se repite esa planta (con las tres vidas otra vez).
   La torre entera dura de dos a tres minutos. Vencer al guardián de arriba da la estrella del arcade (si no la tenía).
   Las monedas van al mismo monedero que las del Cohete; lo que se falla vuelve a «Hoy toca».
   Es por turnos: va con botones de la página, sin Phaser. Usa ZzFX (vendor/zzfx.js) y, del motor, borrador() y la
   clase .pad-c del teclado de números. Lo común (XP, monedas, récords, estrella, «para repasar») lo pone el motor con api.
   Modo prueba (?prueba o window.ARCADE_PRUEBA): semilla fija y el estado en window._TORRE para que el verificador juegue.
   ===================================================================== */
(()=>{
const PLANTAS=[
  {k:'div1',n:'Dividir por una cifra',b:'div1',col:'#c8602a',osc:'#5a250c'},
  {k:'div2',n:'Dividir por dos cifras',b:'div2',col:'#1f7a4a',osc:'#0c3a22'},
  {k:'divs',n:'Divisores',b:'divs',col:'#2a5bb8',osc:'#10285a'},
  {k:'prob',n:'Un problema corto',b:'prob',col:'#6c3fb5',osc:'#2b1858'}];
const VIDA=5,FUERTE=Math.ceil(VIDA/2),CARGA=3;
const SON={bien:[.35,.05,520,0,.04,.18,0,1,,,400,.04],golpe:[.45,.05,160,0,.05,.25,4,1,-4],mal:[.4,0,150,.01,.12,.3,2,1,-3],
  carga:[.3,0,700,.02,.1,.3,0,1,,,350,.06],fuerte:[.6,.05,90,.02,.2,.6,4,1.4,-2],moneda:[.3,0,1300,0,.03,.12,0,1,,,600,.04],
  jefe:[.5,.05,90,.02,.25,.5,4,1,-1],gana:[.45,0,520,.02,.25,.4,0,1,,,260,.08,.1]};
const robot=(P,pecho)=>`<svg viewBox="-70 -70 140 130" class="tr-robot" role="img" aria-label="Guardián de la planta: ${P.n}"><path d="M0-58 V-46" stroke="#aab4e6" stroke-width="3"/><circle cy="-60" r="5" fill="#ffc83d"/>
<rect x="-34" y="-46" width="68" height="40" rx="10" fill="${P.col}" stroke="${P.osc}" stroke-width="3"/><rect x="-22" y="-36" width="16" height="10" rx="3" fill="#ffc83d"/><rect x="6" y="-36" width="16" height="10" rx="3" fill="#ffc83d"/>
<rect x="-44" y="-2" width="88" height="54" rx="12" fill="${P.col}" stroke="${P.osc}" stroke-width="3"/><rect x="-24" y="8" width="48" height="32" rx="6" fill="#0b1230" stroke="#3dd6ff" stroke-width="2"/>
<text y="31" text-anchor="middle" font-family="Fredoka,system-ui,sans-serif" font-weight="700" font-size="20" fill="#3dd6ff">${pecho}</text>
<rect x="-62" y="4" width="16" height="36" rx="8" fill="${P.col}" stroke="${P.osc}" stroke-width="3"/><rect x="46" y="4" width="16" height="36" rx="8" fill="${P.col}" stroke="${P.osc}" stroke-width="3"/></svg>`;

/* ---------- Las preguntas de cada planta ---------- */
const ent=(r,a,b)=>a+Math.floor(r()*(b-a+1)),elige=(r,a)=>a[Math.floor(r()*a.length)];
const mezcla=(r,a)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* Tres opciones distintas: la buena y dos falsas de la lista de candidatas (que nunca pueden ser correctas) */
function trio(r,buena,cands,txt){const t=txt||String,vistas=new Set([t(buena)]),malas=[];
  for(const c of cands){const s=t(c);if(c!=null&&!vistas.has(s)&&malas.length<2){vistas.add(s);malas.push(c)}}
  for(let k=1;typeof buena==='number'&&malas.length<2&&k<50;k++){const c=buena+k;if(!vistas.has(t(c))){vistas.add(t(c));malas.push(c)}}
  return mezcla(r,[{t:t(buena),ok:true},...malas.map(c=>({t:t(c),ok:false}))])}
const fmt=(q,res)=>res?`${q} y sobran ${res}`:String(q);
/* Una división con su cociente y su resto (unaCifra: divisor de 2 a 9; si no, de 11 a 35) */
function division(r,unaCifra){let D,d;
  do{d=unaCifra?ent(r,2,9):ent(r,11,35);D=ent(r,unaCifra?40:100,unaCifra?999:999)}while(Math.floor(D/d)<(unaCifra?6:3));
  if(r()<.45)D-=D%d;return{D,d,q:Math.floor(D/d),res:D%d}}
const prueba=(D,d,q,res)=>res?`${d} × ${q} + ${res} = ${D}`:`${d} × ${q} = ${D}`;
function pregDiv(r,unaCifra){const {D,d,q,res}=division(r,unaCifra);
  /* Falsas: el cociente de al lado (o con una cifra de más o de menos) y, si hay resto, un resto que no vale */
  const c=res?[[q+1,res],[q-1,res],[q,res+d>D?res+1:res+d],[q+10,res],[q,(res+1)%d||1]]:[[q+1,0],[q-1,0],[q+10,0],[q*10,0],[q+2,0]];
  return{txt:`${D} : ${d} = ?`,pecho:'÷'+d,ops:trio(r,[q,res],c.filter(([a,b])=>a>0&&!(a===q&&b===res)&&!(a*d+b===D&&b<d)),([a,b])=>fmt(a,b)),
    explica:`${D} : ${d} = ${fmt(q,res)}, porque ${prueba(D,d,q,res)}.`}}
function pregDivs(r){const N=elige(r,[12,18,20,24,28,30,32,36,40,45]),D=NUMEROS.divisores(N),no=[];for(let n=2;n<N;n++)if(N%n)no.push(n);
  const tipo=ent(r,0,2),lista=a=>a.join(', ');
  if(tipo===0){const x=elige(r,D.slice(1,-1));return{txt:`¿Cuál es divisor de ${N}?`,pecho:'D',ops:trio(r,x,mezcla(r,no.filter(n=>n<20))),explica:`${x} es divisor de ${N}: ${N} : ${x} = ${N/x}, sin resto.`}}
  if(tipo===1){const x=elige(r,no.filter(n=>n<20)),si=mezcla(r,D.slice(1,-1));return{txt:`¿Cuál NO es divisor de ${N}?`,pecho:'D',ops:trio(r,x,si),explica:`${x} no es divisor de ${N}: ${N} : ${x} = ${Math.floor(N/x)} y sobran ${N%x}.`}}
  /* Falsas: a la lista le falta un divisor, o le sobra un número que no lo es */
  const fuera=ent(r,1,D.length-2),quita=D.filter((_,i)=>i!==fuera),extra=mezcla(r,no.filter(n=>n<N/2)),con=x=>[...D,x].sort((a,b)=>a-b);
  return{txt:`Todos los divisores de ${N}`,pecho:'D',ops:trio(r,D,[quita,con(extra[0]),con(extra[1])],lista),explica:`Los divisores de ${N} son ${lista(D)}.`}}
function pregProb(r){const tipo=ent(r,0,3);let d=ent(r,4,15),q=ent(r,6,25),res=tipo===0?0:ent(r,1,d-1),D=d*q+res;
  const T=[
    [`Reparten ${D} cromos entre ${d} amigos, a partes iguales. ¿Cuántos cromos le tocan a cada uno?`,q,[q+1,q-1,D-d,d],`${D} : ${d} = ${q}, porque ${d} × ${q} = ${D}.`],
    [`Hay ${D} huevos y se guardan en cajas de ${d}. ¿Cuántos huevos sobran?`,res,[q,res+1,d-res,res+d],`${D} : ${d} = ${q} y sobran ${res}, porque ${d} × ${q} + ${res} = ${D}.`],
    [`Van ${D} alumnos de excursión y en cada autobús caben ${d}. ¿Cuántos autobuses hacen falta como mínimo?`,q+1,[q,q+2,res],`${D} : ${d} = ${q} y sobran ${res}: esos ${res} también necesitan autobús, así que hacen falta ${q+1}.`],
    [`Con ${D} lápices se hacen paquetes de ${d}. ¿Cuántos paquetes completos salen?`,q,[q+1,res,q-1],`${D} : ${d} = ${q} y sobran ${res}, que no llegan a otro paquete.`]][tipo];
  return{txt:T[0],pecho:'?',ops:trio(r,T[1],T[2].filter(x=>x>=0&&x!==T[1])),explica:T[3],largo:true}}
const PREG={div1:r=>pregDiv(r,true),div2:r=>pregDiv(r,false),divs:pregDivs,prob:pregProb};

let CSS=false;
function estilos(){if(CSS)return;CSS=true;const s=document.createElement('style');s.textContent=`
.tr{display:grid;gap:10px}
.tr-cab{display:flex;align-items:center;justify-content:space-between;gap:10px}.tr-cab b{font-family:var(--ft);font-size:17px}
.tr-duelo{position:relative;overflow:hidden;border-radius:18px;padding:14px 14px 16px;color:#eef1ff;background:linear-gradient(#2a1a4a,#0f1640);display:grid;gap:10px}
.tr-planta{text-align:center;font-size:15px;font-weight:700;color:#aab4e6}
.tr-vida{height:12px;border-radius:6px;background:#0c1633;overflow:hidden;max-width:420px;width:100%;justify-self:center}
.tr-vida i{display:block;height:100%;background:#EE3B4F;border-radius:6px;transition:width .35s ease}
.tr-robot{display:block;width:min(46vw,190px);height:auto;margin:0 auto}
.tr-marca{display:flex;justify-content:space-between;align-items:center;font-size:22px}
.tr-cor{color:#ff5c6c;letter-spacing:2px}.tr-pips{display:flex;gap:6px}.tr-pips i{width:14px;height:14px;border-radius:50%;border:2px solid #ffc83d;display:block}.tr-pips i.on{background:#ffc83d}
.tr-preg{background:#0b1230;border:2px solid #3dd6ff;border-radius:16px;padding:12px;text-align:center;font-family:var(--ft);font-size:clamp(26px,7vw,34px);font-weight:700;font-variant-numeric:tabular-nums}
.tr-preg.largo{font-size:clamp(18px,4.6vw,22px);font-weight:600;line-height:1.35;text-align:left}
#trZona{display:grid;gap:10px}.tr-ops{display:grid;gap:10px}
.tr-ops button{font-family:var(--ft);font-size:clamp(20px,5.4vw,26px);font-weight:600;min-height:58px;padding:8px 12px;border-radius:14px;border:2px solid #3d4f8f;background:#151d45;color:#eef1ff;cursor:pointer;touch-action:manipulation;font-variant-numeric:tabular-nums}
.tr-ops button:focus-visible,.tr-fuerte:focus-visible{outline:3px solid #ffc83d;outline-offset:2px}
.tr-ops button.ok{background:#1f7a4a;border-color:#2ecc71}.tr-ops button.bad{background:#7a1f2e;border-color:#ff5c6c}.tr-ops button:disabled{cursor:default}
.tr-fb{min-height:1.4em;text-align:center;font-size:17px;line-height:1.4}.tr-fb.bad{color:#ffb3bd}.tr-fb.ok{color:#9ff0c3}
.tr-fuerte{width:100%;font-family:var(--ft);font-size:20px;font-weight:700;min-height:52px;border-radius:14px;border:2px dashed #5d6fae;background:transparent;color:#8a96c8;cursor:default}
.tr-fuerte.on{border:3px solid #ffc83d;border-style:solid;background:#2b1d00;color:#ffc83d;cursor:pointer}
.tr-gal{display:grid;gap:10px;justify-items:center}
.tr-cuenta{display:grid;grid-template-columns:auto auto;gap:0 0;font-family:var(--ft);font-size:34px;font-weight:700;font-variant-numeric:tabular-nums}
.tr-cuenta .dv{padding:0 14px 6px 0;text-align:right}.tr-cuenta .dr{padding:0 0 6px 14px;border-left:3px solid #eef1ff;border-bottom:3px solid #eef1ff}
.tr-cuenta .rs{padding:8px 14px 0 0;display:flex;justify-content:flex-end}.tr-cuenta .cc{padding:8px 0 0 14px}
.tr-casilla{font:inherit;min-width:2.6em;min-height:1.5em;padding:0 8px;border-radius:10px;border:3px solid #2a376f;background:#0b1230;color:#eef1ff;cursor:pointer}
.tr-casilla.act{border-color:#3dd6ff}.tr-casilla.ok{border-color:#2ecc71}.tr-casilla.bad{border-color:#ff5c6c}
.tr-etq{font-size:13px;color:#aab4e6;text-align:center;font-family:var(--fb);font-weight:600}
.tr-gal .pad-c{margin:0 auto;width:100%}
.tr-gal .borr{width:100%;height:140px;background:#fffbea;border-radius:12px;touch-action:none;display:block}
.tr-gal #trBorr{width:100%;display:grid;gap:6px}
.tr-emp{position:absolute;inset:0;display:grid;align-content:center;justify-items:center;gap:12px;text-align:center;padding:20px;background:rgba(7,11,36,.9);border-radius:18px;z-index:5}
.tr-emp h3{margin:0;font-family:var(--ft);font-size:26px}.tr-emp p{margin:0;max-width:36ch;font-size:16px;line-height:1.45}
.tr-emp .btn{font-size:22px;padding:14px 30px}
.tr-mapa{display:grid;gap:8px;margin:12px 0}
.tr-piso{display:flex;align-items:center;gap:12px;border-radius:14px;padding:10px 14px;color:#fff;border:2px solid rgba(255,255,255,.18);background:linear-gradient(90deg,var(--c),#151d45)}
.tr-piso b{font-family:var(--ft);font-size:18px}.tr-piso span{margin-left:auto;font-size:20px}
@media (prefers-reduced-motion:no-preference){.tr-sacude{animation:trSacude .35s}.tr-golpe{animation:trGolpe .4s}.tr-carga{animation:trCarga .6s 2}}
@keyframes trSacude{20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
@keyframes trGolpe{0%{filter:none}30%{filter:brightness(2.2) saturate(.4);transform:scale(.94) rotate(-3deg)}100%{filter:none}}
@keyframes trCarga{50%{box-shadow:0 0 0 8px rgba(255,200,61,.35)}}`;document.head.appendChild(s)}

function start(api){estilos();const J=api.estado;J.subidas=J.subidas||0;
  const caja=api.caja,esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const son=k=>{if(api.sonido()&&window.zzfx)try{zzfx(...SON[k])}catch(e){}};
  const anima=(el,c)=>{if(api.quieto||!el)return;el.classList.remove(c);void el.offsetWidth;el.classList.add(c)};
  function mapa(){window._TORRE=null;
    caja.innerHTML=`<div class="box tr"><h2>🗼 La Torre del Jefe</h2>
    <p class="sub">Sube las cuatro plantas. En cada una, un guardián te pregunta: si aciertas, le das un golpe; si fallas, pierdes una vida. Con tres aciertos seguidos cargas el golpe fuerte: escribe el cociente y el resto y le quitas media vida.</p>
    <div class="tr-mapa">${PLANTAS.slice().reverse().map((P,i)=>`<div class="tr-piso" style="--c:${P.col}"><b>${4-i} · ${esc(P.n)}</b><span>${J.subidas?'🏆':''}</span></div>`).join('')}</div>
    <p class="sub">Récord: ${api.mejor('torre')} · Torres conquistadas: ${J.subidas}</p>
    <button class="btn" id="trSube">🗼 Subir a la torre</button> <button class="btn sec" id="trArc">🎮 Arcade</button></div>`;
    caja.querySelector('#trSube').onclick=jugar;caja.querySelector('#trArc').onclick=api.salir}

  function jugar(){
    const rnd=api.prueba?NUMEROS.semilla(11):Math.random;
    const G={planta:0,vidas:3,vida:VIDA,racha:0,cargado:false,puntos:0,monedas:0,aciertos:0,fallos:0,fase:'empezar',p:null,f:null,acabado:false};
    caja.innerHTML=`<div class="tr"><div class="tr-cab"><b>🗼 La Torre del Jefe</b><button class="btn sec" id="trSalir" style="margin:0;padding:8px 14px">✕ Salir</button></div><div class="tr-duelo" id="trDuelo"></div></div>`;
    const duelo=caja.querySelector('#trDuelo');
    caja.querySelector('#trSalir').onclick=()=>{G.acabado=true;mapa()};
    api.alSalir(()=>{G.acabado=true;window._TORRE=null});
    const P=()=>PLANTAS[G.planta];
    const estado=()=>{window._TORRE={fase:G.fase,planta:G.planta,vidas:G.vidas,vida:G.vida,racha:G.racha,cargado:G.cargado,puntos:G.puntos,
      pregunta:G.p&&{txt:G.p.txt,ops:G.p.ops.map(o=>o.t),buena:G.p.ops.findIndex(o=>o.ok)},fuerte:G.f&&{D:G.f.D,d:G.f.d,q:G.f.q,res:G.f.res}}};
    function pinta(){const pl=P();
      duelo.innerHTML=`<div class="tr-planta">Planta ${G.planta+1} de 4 · ${esc(pl.n)}</div>
      <div class="tr-vida" role="img" aria-label="Vida del guardián: ${G.vida} de ${VIDA}"><i style="width:${G.vida/VIDA*100}%"></i></div>
      <div id="trRobot">${robot(pl,G.p?G.p.pecho:'÷')}</div>
      <div class="tr-marca"><span class="tr-cor" aria-label="Te quedan ${G.vidas} vidas">${'♥'.repeat(G.vidas)}${'♡'.repeat(3-G.vidas)}</span>
        <span class="tr-pips" aria-label="Golpe fuerte: ${Math.min(G.racha,CARGA)} de ${CARGA}">${[0,1,2].map(i=>`<i class="${G.cargado||i<G.racha?'on':''}"></i>`).join('')}</span></div>
      <div id="trZona"></div>`;estado()}
    function empezar(texto){G.fase='empezar';pinta();
      duelo.insertAdjacentHTML('beforeend',`<div class="tr-emp"><h3>Planta ${G.planta+1} · ${esc(P().n)}</h3><p>${texto}</p><button class="btn" id="trGo">Empezar ▶</button></div>`);
      const go=duelo.querySelector('#trGo');go.focus();go.onclick=()=>{duelo.querySelector('.tr-emp').remove();G.fase='pregunta';pregunta()};estado()}
    function pregunta(){G.p=PREG[P().k](rnd);G.f=null;G.fase='pregunta';pinta();const z=duelo.querySelector('#trZona');
      z.innerHTML=`<div class="tr-preg${G.p.largo?' largo':''}">${esc(G.p.txt)}</div><div class="tr-ops">${G.p.ops.map((o,i)=>`<button data-o="${i}">${esc(o.t)}</button>`).join('')}</div>
        <div class="tr-fb" id="trFb" aria-live="polite"></div><button class="tr-fuerte${G.cargado?' on':''}" id="trFuerte" ${G.cargado?'':'disabled'}>⚡ Golpe fuerte${G.cargado?'':' · '+Math.min(G.racha,CARGA)+' de '+CARGA}</button>`;
      z.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>responde(+b.dataset.o));
      z.querySelector('#trFuerte').onclick=()=>{if(G.cargado&&G.fase==='pregunta')fuerte()};estado()}
    function responde(i){if(G.fase!=='pregunta')return;G.fase='espera';const o=G.p.ops[i],z=duelo.querySelector('#trZona'),fb=z.querySelector('#trFb');
      z.querySelectorAll('[data-o]').forEach((b,k)=>{b.disabled=true;if(G.p.ops[k].ok)b.classList.add('ok');else if(k===i)b.classList.add('bad')});
      z.querySelector('#trFuerte').disabled=true;
      if(o.ok){G.aciertos++;G.racha++;G.puntos+=10;son('bien');fb.className='tr-fb ok';fb.textContent='¡Golpe!';
        if(G.racha>=CARGA&&!G.cargado){G.cargado=true;G.racha=0;setTimeout(()=>son('carga'),250);fb.textContent='¡Golpe! Y tienes el golpe fuerte cargado ⚡'}
        return golpe(1,900)}
      G.fallos++;G.racha=0;G.vidas--;api.repasa(P().b);son('mal');fb.className='tr-fb bad';fb.textContent=G.p.explica;
      anima(duelo,'tr-sacude');estado();
      if(G.vidas<=0)return setTimeout(()=>{if(!G.acabado){G.vidas=3;G.vida=VIDA;G.racha=0;G.cargado=false;empezar('Te has quedado sin vidas. Repite esta planta: vuelves a tener las tres.')}},api.prueba?600:2600);
      pinta2(api.prueba?500:2600)}
    /* Repinta la marca y sigue con otra pregunta al cabo de ms */
    function pinta2(ms){setTimeout(()=>{if(!G.acabado)pregunta()},ms)}
    function golpe(n,ms){G.vida=Math.max(0,G.vida-n);son(n>1?'fuerte':'golpe');
      const bar=duelo.querySelector('.tr-vida i');if(bar)bar.style.width=G.vida/VIDA*100+'%';anima(duelo.querySelector('#trRobot'),'tr-golpe');estado();
      if(G.vida>0)return pinta2(api.prueba?300:ms);
      G.fase='vencido';G.puntos+=50;G.monedas+=2;estado();
      setTimeout(()=>{if(G.acabado)return;son('jefe');
        if(G.planta<3){G.planta++;G.vidas=3;G.vida=VIDA;G.racha=0;G.cargado=false;G.p=null;empezar('¡Guardián vencido! +50 puntos · +2 🪙. Sube a la planta siguiente.');return}
        fin()},api.prueba?300:1200)}
    function fuerte(){G.fase='fuerte';G.cargado=false;const pl=P();const f=division(rnd,G.planta===0);G.f=f;
      duelo.querySelector('#trRobot').innerHTML=robot(pl,'÷'+f.d);
      const z=duelo.querySelector('#trZona');son('carga');
      z.innerHTML=`<div class="tr-gal"><div class="tr-planta" style="color:#ffc83d">⚡ Golpe fuerte: escribe el cociente y el resto</div>
        <div class="tr-cuenta"><div class="dv">${f.D}</div><div class="dr">${f.d}</div>
          <div class="rs"><div><button class="tr-casilla" id="trR" aria-label="Resto">&nbsp;</button><div class="tr-etq">resto</div></div></div>
          <div class="cc"><button class="tr-casilla act" id="trQ" aria-label="Cociente">&nbsp;</button><div class="tr-etq">cociente</div></div></div>
        <div class="pad-c" role="group" aria-label="Teclado de números">${[1,2,3,4,5,6,7,8,9,0].map(n=>`<button type="button" data-c="${n}">${n}</button>`).join('')}<button type="button" data-c="b" aria-label="Borrar">⌫</button></div>
        <button class="btn" id="trOk" style="margin:0">⚡ ¡Golpe fuerte!</button>
        <div class="tr-fb" id="trFb" aria-live="polite"></div>
        <div id="trBorr"></div></div>`;
      if(typeof borrador==='function')borrador(z.querySelector('#trBorr'));
      const v={trQ:'',trR:''};let act='trQ';
      const ver=()=>{['trQ','trR'].forEach(id=>{const b=z.querySelector('#'+id);b.textContent=v[id]||' ';b.classList.toggle('act',id===act)})};
      ['trQ','trR'].forEach(id=>z.querySelector('#'+id).onclick=()=>{act=id;ver()});
      const tecla=c=>{if(G.fase!=='fuerte')return;if(c==='b')v[act]=v[act].slice(0,-1);else if(v[act].length<4)v[act]+=c;ver()};
      z.querySelectorAll('.pad-c button').forEach(b=>{b.onpointerdown=e=>e.preventDefault();b.onclick=()=>tecla(b.dataset.c)});
      const kd=e=>{if(!z.isConnected||G.fase!=='fuerte'){document.removeEventListener('keydown',kd);return}
        if(/^\d$/.test(e.key))tecla(e.key);else if(e.key==='Backspace')tecla('b');else if(e.key==='Tab'){act=act==='trQ'?'trR':'trQ';ver()}else if(e.key==='Enter')comprueba();else return;e.preventDefault()};
      document.addEventListener('keydown',kd);
      const comprueba=()=>{if(G.fase!=='fuerte')return;const fb=z.querySelector('#trFb');
        if(v.trQ===''||v.trR===''){fb.className='tr-fb bad';fb.textContent='Escribe el cociente y el resto (si no sobra nada, el resto es 0).';return}
        G.fase='espera';const bq=+v.trQ===f.q,br=+v.trR===f.res;
        z.querySelector('#trQ').classList.add(bq?'ok':'bad');z.querySelector('#trR').classList.add(br?'ok':'bad');z.querySelectorAll('.pad-c button,#trOk').forEach(b=>b.disabled=true);
        if(bq&&br){G.puntos+=30;G.aciertos++;fb.className='tr-fb ok';fb.textContent=`¡Golpe fuerte! ${prueba(f.D,f.d,f.q,f.res)}`;return golpe(FUERTE,1600)}
        G.fallos++;api.repasa(G.planta===0?'div1':'div2');son('mal');fb.className='tr-fb bad';
        fb.textContent=`Se escapa: ${f.D} : ${f.d} = ${f.q} y sobran ${f.res}, porque ${prueba(f.D,f.d,f.q,f.res)}. No pierdes vida, pero se gasta el golpe.`;
        estado();pinta2(api.prueba?500:3400)};
      z.querySelector('#trOk').onclick=comprueba;ver();estado()}
    function fin(){if(G.acabado)return;G.acabado=true;J.subidas++;G.monedas+=10;api.guarda();const estrella=api.estrella();son('gana');window._TORRE=null;
      api.fin({ic:'🏆',titulo:'¡Torre conquistada!',gana:true,clave:'torre',puntos:G.puntos,monedas:G.monedas,otra:jugar,
        lineas:`${G.puntos} puntos · ${G.aciertos} aciertos${G.fallos?` · ${G.fallos} fallo${G.fallos>1?'s':''}`:''}${estrella?'<br>⭐ ¡Estrella del arcade!':''}`})}
    empezar('Contesta a lo que te pregunta el guardián. Sin reloj: piensa antes de tocar. Con tres aciertos seguidos se carga el golpe fuerte ⚡.')}

  mapa();
}
(window.ARCADE=window.ARCADE||{}).torre={start};
})();
