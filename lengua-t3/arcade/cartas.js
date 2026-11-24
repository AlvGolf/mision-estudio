/* =====================================================================
   Misión Estudio · arcade de Lengua U3 · 🃏 DUELO DE CARTAS (24-nov)
   Elegido por el padre en el artefacto «Juego de Lengua de 5º» (ronda 2, J3). Por turnos y sin reloj, como la Torre:
   cuatro rivales (sinónimos y antónimos, homófonas y parónimas, palabras y epítetos, grados del adjetivo).
   Cada turno, el rival lanza una carta con una orden («¡ANTÓNIMO de lleno!») y tú juegas, de tus cinco cartas,
   la que la vence (solo una vale). Si aciertas, el rival pierde una vida; si fallas, pierdes una de tus tres y ves
   por qué. Tres aciertos seguidos cargan el golpe fuerte: escribir la respuesta sin cartas, con su tilde.
   Bien escrito, el rival pierde media vida; mal escrito, se gasta la carga sin perder vida.
   Pantalla de «Empezar» antes de cada rival; sin vidas, se repite ese rival. Vencer al último da la estrella.
   Las palabras salen de las listas del juego (SINON, ANTON, VOC_GAP, POLI, MONO, EPI_SWIPE, GRAD_ESCRIBE…).
   Va con botones de la página, sin Phaser. Usa ZzFX (vendor/zzfx.js). Lo común lo pone el motor con api.
   Modo prueba (?prueba o window.ARCADE_PRUEBA): semilla fija y el estado en window._CARTAS para que el verificador juegue.
   ===================================================================== */
(()=>{
const lista=n=>{try{return (0,eval)(n)}catch(e){return []}};
const RIVALES=[
  {k:'sin',n:'El Mago de los Sinónimos',ic:'🧙',b:'sin',col:'#6c3fb5',osc:'#2b1858'},
  {k:'hom',n:'El Loro Homófono',ic:'🦜',b:'voc',col:'#1f7a4a',osc:'#0c3a22'},
  {k:'pal',n:'El Pulpo de las Palabras',ic:'🐙',b:'epi',col:'#2a5bb8',osc:'#10285a'},
  {k:'grad',n:'El Dragón del Grado',ic:'🐲',b:'grad',col:'#c8602a',osc:'#5a250c'}];
const VIDA=5,FUERTE=Math.ceil(VIDA/2),CARGA=3,MANO=5;
const SON={bien:[.35,.05,520,0,.04,.18,0,1,,,400,.04],golpe:[.45,.05,160,0,.05,.25,4,1,-4],mal:[.4,0,150,.01,.12,.3,2,1,-3],
  carga:[.3,0,700,.02,.1,.3,0,1,,,350,.06],fuerte:[.6,.05,90,.02,.2,.6,4,1.4,-2],jefe:[.5,.05,90,.02,.25,.5,4,1,-1],gana:[.45,0,520,.02,.25,.4,0,1,,,260,.08,.1]};
const semilla=s=>()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296};
const elige=(r,a)=>a[Math.floor(r()*a.length)];
const mezcla=(r,a)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const sinT=s=>String(s).toLowerCase().trim().replace(/\s+/g,' ');
/* Una mano: la buena y cuatro que nunca pueden valer */
const mano=(r,buena,malas)=>mezcla(r,[{t:buena,ok:true},...mezcla(r,[...new Set(malas)].filter(x=>x!==buena)).slice(0,MANO-1).map(t=>({t,ok:false}))]);

/* ---------- Las cartas de cada rival ---------- */
function cartaSin(r){const S=lista('SINON'),A=lista('ANTON'),ant=r()<.5,P=ant?A:S,p=elige(r,P),i=r()<.5?0:1,w=p[i],buena=p[1-i];
  const otras=[...S,...A].filter(x=>x!==p).flat();
  return{orden:ant?'ANTÓNIMO':'SINÓNIMO',w,mano:mano(r,buena,otras),explica:`${ant?'Lo contrario':'Casi lo mismo'} de «${w}» es «${buena}».`}}
function cartaHom(r){const G=lista('VOC_GAP'),g=elige(r,G),otros=G.filter(x=>x.a!==g.a&&!g.opts.includes(x.a)).map(x=>x.a);
  const malas=[...g.opts.filter(o=>o!==g.a),...otros];
  return{orden:'COMPLETA',w:g.q,mano:mano(r,g.a,malas),explica:`Es «${g.a}». ${g.opts.filter(o=>o!==g.a).map(o=>`«${o}» es otra palabra que suena parecido.`).join(' ')}`,largo:true}}
function cartaPal(r){const tipo=Math.floor(r()*3);
  if(tipo===0){const b=elige(r,lista('POLI'));return{orden:'POLISÉMICA',w:'Juega una palabra con varios significados',mano:mano(r,b,lista('MONO')),explica:`«${b}» tiene varios significados; las otras, uno solo.`}}
  if(tipo===1){const b=elige(r,lista('MONO'));return{orden:'MONOSÉMICA',w:'Juega una palabra con un único significado',mano:mano(r,b,lista('POLI')),explica:`«${b}» tiene un único significado; las otras, varios.`}}
  const E=lista('EPI_SWIPE'),b=elige(r,E.filter(x=>x.ok)).w;
  return{orden:'EPÍTETO',w:'Juega un epíteto: delante y con una cualidad propia',mano:mano(r,b,E.filter(x=>!x.ok).map(x=>x.w)),explica:`«${b}»: el adjetivo va delante y dice una cualidad propia.`}}
function cartaGrad(r){const SUP=lista('GRAD_ESCRIBE').map(x=>[x.q.match(/«([^»]+)»/)[1],x.show]).filter(x=>x[0]),[a,sup]=elige(r,SUP);
  const F={'POSITIVO':a,'SUPERLATIVO':sup,'COMPARATIVO DE SUPERIORIDAD':`más ${a} que`,'COMPARATIVO DE INFERIORIDAD':`menos ${a} que`,'COMPARATIVO DE IGUALDAD':`tan ${a} como`};
  const o=elige(r,Object.keys(F));
  return{orden:o,w:`de «${a}»`,mano:mano(r,F[o],Object.values(F)),explica:`${o.charAt(0)+o.slice(1).toLowerCase()} de «${a}»: «${F[o]}».`}}
const CARTA={sin:cartaSin,hom:cartaHom,pal:cartaPal,grad:cartaGrad};
/* El golpe fuerte: se escribe la respuesta, sin cartas (las tildes cuentan) */
const FUERTES={sin:()=>lista('SIN_ESCRIBE'),hom:()=>lista('VOC_ESCRIBE'),pal:()=>lista('DEF_ESCRIBE'),grad:()=>lista('GRAD_ESCRIBE')};

let CSS=false;
function estilos(){if(CSS)return;CSS=true;const s=document.createElement('style');s.textContent=`
.ca{display:grid;gap:10px}
.ca-cab{display:flex;align-items:center;justify-content:space-between;gap:10px}.ca-cab b{font-family:var(--ft);font-size:17px}
.ca-duelo{position:relative;overflow:hidden;border-radius:18px;padding:14px 14px 16px;color:#eef1ff;background:linear-gradient(#10213f,#0b1230);display:grid;gap:10px}
.ca-rival{display:flex;align-items:center;gap:12px;justify-content:center}.ca-rival .ic{font-size:58px;line-height:1}.ca-rival b{font-family:var(--ft);font-size:18px}
.ca-vida{height:12px;border-radius:6px;background:#0c1633;overflow:hidden;max-width:420px;width:100%;justify-self:center}
.ca-vida i{display:block;height:100%;background:#EE3B4F;border-radius:6px;transition:width .35s ease}
.ca-marca{display:flex;justify-content:space-between;align-items:center;font-size:22px}
.ca-cor{color:#ff5c6c;letter-spacing:2px}.ca-pips{display:flex;gap:6px}.ca-pips i{width:14px;height:14px;border-radius:50%;border:2px solid #ffc83d;display:block}.ca-pips i.on{background:#ffc83d}
.ca-orden{justify-self:center;width:min(100%,340px);border-radius:16px;padding:12px 14px;text-align:center;background:var(--c,#EE3B4F);border:3px solid rgba(255,255,255,.35);box-shadow:0 10px 30px rgba(0,0,0,.35)}
.ca-orden small{display:block;font-weight:800;letter-spacing:.08em;font-size:14px}.ca-orden span{display:block;font-family:var(--ft);font-size:clamp(20px,5.4vw,26px);font-weight:600;line-height:1.25;margin-top:4px}
.ca-orden.largo span{font-size:clamp(17px,4.4vw,20px)}
.ca-mano{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(120px,30%),1fr));gap:8px}
.ca-mano button{font-family:var(--ft);font-size:clamp(16px,4.4vw,20px);font-weight:600;min-height:84px;padding:8px;border-radius:14px;border:2px solid #c9d2ff;background:#eef1ff;color:#0b1230;cursor:pointer;touch-action:manipulation;overflow-wrap:anywhere}
.ca-mano button:focus-visible,.ca-fuerte:focus-visible{outline:3px solid #ffc83d;outline-offset:2px}
.ca-mano button.ok{background:#2ecc71;border-color:#2ecc71}.ca-mano button.bad{background:#ff8a98;border-color:#EE3B4F}.ca-mano button:disabled{cursor:default}
.ca-fb{min-height:1.4em;text-align:center;font-size:17px;line-height:1.4}.ca-fb.bad{color:#ffb3bd}.ca-fb.ok{color:#9ff0c3}
.ca-fuerte{width:100%;font-family:var(--ft);font-size:20px;font-weight:700;min-height:52px;border-radius:14px;border:2px dashed #5d6fae;background:transparent;color:#8a96c8;cursor:default}
.ca-fuerte.on{border:3px solid #ffc83d;background:#2b1d00;color:#ffc83d;cursor:pointer}
.ca-gal{display:grid;gap:10px}.ca-gal .q{font-family:var(--ft);font-size:20px;text-align:center;line-height:1.35}
.ca-gal input{font:600 20px var(--fb,system-ui);padding:12px;border-radius:12px;border:3px solid #2a376f;background:#0b1230;color:#eef1ff;width:100%;box-sizing:border-box}
.ca-gal input.ok{border-color:#2ecc71}.ca-gal input.bad{border-color:#ff5c6c}
.ca-emp{position:absolute;inset:0;display:grid;align-content:center;justify-items:center;gap:12px;text-align:center;padding:20px;background:rgba(7,11,36,.92);border-radius:18px;z-index:5}
.ca-emp h3{margin:0;font-family:var(--ft);font-size:24px}.ca-emp p{margin:0;max-width:36ch;font-size:16px;line-height:1.45}.ca-emp .btn{font-size:22px;padding:14px 30px}
.ca-mapa{display:grid;gap:8px;margin:12px 0}
.ca-piso{display:flex;align-items:center;gap:12px;border-radius:14px;padding:10px 14px;color:#fff;border:2px solid rgba(255,255,255,.18);background:linear-gradient(90deg,var(--c),#151d45)}
.ca-piso b{font-family:var(--ft);font-size:17px}.ca-piso .ic{font-size:28px}.ca-piso span:last-child{margin-left:auto;font-size:20px}
@media (prefers-reduced-motion:no-preference){.ca-sacude{animation:caSacude .35s}.ca-golpe{animation:caGolpe .4s}}
@keyframes caSacude{20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
@keyframes caGolpe{30%{filter:brightness(2);transform:scale(.92) rotate(-4deg)}}`;document.head.appendChild(s)}

function start(api){estilos();const J=api.estado;J.ganados=J.ganados||0;
  const caja=api.caja,esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const son=k=>{if(api.sonido()&&window.zzfx)try{zzfx(...SON[k])}catch(e){}};
  const anima=(el,c)=>{if(api.quieto||!el)return;el.classList.remove(c);void el.offsetWidth;el.classList.add(c)};
  const limpia=x=>sinT(x).replace(/[.,;:!?¡¿"()]/g,'').trim();
  function mapa(){window._CARTAS=null;
    caja.innerHTML=`<div class="box ca"><h2>🃏 Duelo de Cartas</h2>
    <p class="sub">Cuatro rivales. Cada uno lanza una carta con una orden y tú juegas, de tus cinco cartas, la que la vence. Si aciertas, le quitas una vida; si fallas, pierdes una tuya. Con tres aciertos seguidos cargas el golpe fuerte: escribe la respuesta sin cartas y le quitas media vida.</p>
    <div class="ca-mapa">${RIVALES.map((R,i)=>`<div class="ca-piso" style="--c:${R.col}"><span class="ic">${R.ic}</span><b>${i+1} · ${esc(R.n)}</b><span>${J.ganados?'🏆':''}</span></div>`).join('')}</div>
    <p class="sub">Récord: ${api.mejor('cartas')} · Duelos ganados: ${J.ganados}</p>
    <button class="btn" id="caJuega">🃏 Empezar el duelo</button> <button class="btn sec" id="caArc">🎮 Arcade</button></div>`;
    caja.querySelector('#caJuega').onclick=jugar;caja.querySelector('#caArc').onclick=api.salir}

  function jugar(){
    const rnd=api.prueba?semilla(13):Math.random;
    const G={rival:0,vidas:3,vida:VIDA,racha:0,cargado:false,puntos:0,monedas:0,aciertos:0,fallos:0,fase:'empezar',c:null,f:null,acabado:false};
    const VMAX=G.vida;
    caja.innerHTML=`<div class="ca"><div class="ca-cab"><b>🃏 Duelo de Cartas</b><button class="btn sec" id="caSalir" style="margin:0;padding:8px 14px">✕ Salir</button></div><div class="ca-duelo" id="caDuelo"></div></div>`;
    const duelo=caja.querySelector('#caDuelo');
    caja.querySelector('#caSalir').onclick=()=>{G.acabado=true;mapa()};
    api.alSalir(()=>{G.acabado=true;window._CARTAS=null});
    const R=()=>RIVALES[G.rival];
    const estado=()=>{window._CARTAS={fase:G.fase,rival:G.rival,vidas:G.vidas,vida:G.vida,vmax:VMAX,racha:G.racha,cargado:G.cargado,puntos:G.puntos,
      orden:G.c&&G.c.orden,mano:G.c&&G.c.mano.map(m=>m.t),buena:G.c?G.c.mano.findIndex(m=>m.ok):-1,fuerte:G.f&&{acc:G.f.acc}}};
    function pinta(){const r=R();
      duelo.innerHTML=`<div class="ca-rival" id="caRival"><span class="ic" aria-hidden="true">${r.ic}</span><div><b>${esc(r.n)}</b><div style="font-size:14px;color:#aab4e6">Rival ${G.rival+1} de 4</div></div></div>
      <div class="ca-vida" role="img" aria-label="Vida del rival: ${G.vida} de ${VMAX}"><i style="width:${G.vida/VMAX*100}%"></i></div>
      <div class="ca-marca"><span class="ca-cor" aria-label="Te quedan ${G.vidas} vidas">${'♥'.repeat(G.vidas)}${'♡'.repeat(3-G.vidas)}</span>
        <span class="ca-pips" aria-label="Golpe fuerte: ${Math.min(G.racha,CARGA)} de ${CARGA}">${[0,1,2].map(i=>`<i class="${G.cargado||i<G.racha?'on':''}"></i>`).join('')}</span></div>
      <div id="caZona"></div>`;estado()}
    function empezar(texto){G.fase='empezar';G.c=null;pinta();
      duelo.insertAdjacentHTML('beforeend',`<div class="ca-emp"><span style="font-size:60px">${R().ic}</span><h3>${esc(R().n)}</h3><p>${texto}</p><button class="btn" id="caGo">Empezar ▶</button></div>`);
      const go=duelo.querySelector('#caGo');go.focus();go.onclick=()=>{duelo.querySelector('.ca-emp').remove();turno()};estado()}
    function turno(){G.c=CARTA[R().k](rnd);G.f=null;G.fase='turno';pinta();const z=duelo.querySelector('#caZona');
      z.innerHTML=`<div class="ca-orden${G.c.largo?' largo':''}" style="--c:${R().col}"><small>¡${esc(G.c.orden)}!</small><span>${esc(G.c.w)}</span></div>
        <div class="ca-mano">${G.c.mano.map((m,i)=>`<button data-o="${i}">${esc(m.t)}</button>`).join('')}</div>
        <div class="ca-fb" id="caFb" aria-live="polite"></div><button class="ca-fuerte${G.cargado?' on':''}" id="caFuerte" ${G.cargado?'':'disabled'}>⚡ Golpe fuerte${G.cargado?'':' · '+Math.min(G.racha,CARGA)+' de '+CARGA}</button>`;
      z.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>juega(+b.dataset.o));
      z.querySelector('#caFuerte').onclick=()=>{if(G.cargado&&G.fase==='turno')fuerte()};estado()}
    function juega(i){if(G.fase!=='turno')return;G.fase='espera';const m=G.c.mano[i],z=duelo.querySelector('#caZona'),fb=z.querySelector('#caFb');
      z.querySelectorAll('[data-o]').forEach((b,k)=>{b.disabled=true;if(G.c.mano[k].ok)b.classList.add('ok');else if(k===i)b.classList.add('bad')});
      z.querySelector('#caFuerte').disabled=true;
      if(m.ok){G.aciertos++;G.racha++;G.puntos+=10;son('bien');fb.className='ca-fb ok';fb.textContent='¡Carta ganadora!';
        if(G.racha>=CARGA&&!G.cargado){G.cargado=true;G.racha=0;setTimeout(()=>son('carga'),250);fb.textContent='¡Carta ganadora! Y tienes el golpe fuerte cargado ⚡'}
        return golpe(1,900)}
      G.fallos++;G.racha=0;G.vidas--;api.repasa(R().b);son('mal');fb.className='ca-fb bad';fb.textContent=G.c.explica;anima(duelo,'ca-sacude');estado();
      if(G.vidas<=0)return setTimeout(()=>{if(!G.acabado){G.vidas=3;G.vida=VMAX;G.racha=0;G.cargado=false;empezar('Te has quedado sin vidas. Repite este duelo: vuelves a tener las tres.')}},api.prueba?600:2800);
      sigue(api.prueba?500:2800)}
    function sigue(ms){setTimeout(()=>{if(!G.acabado)turno()},ms)}
    function golpe(n,ms){G.vida=Math.max(0,G.vida-n);son(n>1?'fuerte':'golpe');
      const bar=duelo.querySelector('.ca-vida i');if(bar)bar.style.width=G.vida/VMAX*100+'%';anima(duelo.querySelector('#caRival'),'ca-golpe');estado();
      if(G.vida>0)return sigue(api.prueba?300:ms);
      G.fase='vencido';G.puntos+=50;G.monedas+=2;estado();
      setTimeout(()=>{if(G.acabado)return;son('jefe');
        if(G.rival<3){G.rival++;G.vidas=3;G.vida=VMAX;G.racha=0;G.cargado=false;empezar('¡Rival vencido! +50 puntos · +2 🪙. Llega el siguiente.');return}
        fin()},api.prueba?300:1200)}
    function fuerte(){G.fase='fuerte';G.cargado=false;const q=elige(rnd,FUERTES[R().k]());G.f=q;son('carga');
      const z=duelo.querySelector('#caZona');
      z.innerHTML=`<div class="ca-gal"><div style="text-align:center;color:#ffc83d;font-weight:700">⚡ Golpe fuerte: escríbelo sin cartas (las tildes cuentan)</div>
        <div class="q">${esc(q.q)}</div><input id="caIn" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Tu respuesta" placeholder="Escribe aquí">
        <button class="btn" id="caOk" style="margin:0">⚡ ¡Golpe fuerte!</button><div class="ca-fb" id="caFb" aria-live="polite"></div></div>`;
      const inp=z.querySelector('#caIn');inp.focus({preventScroll:true});
      const comprueba=()=>{if(G.fase!=='fuerte')return;const fb=z.querySelector('#caFb'),v=limpia(inp.value);
        if(!v){fb.className='ca-fb bad';fb.textContent='Escribe tu respuesta.';return}
        G.fase='espera';inp.disabled=true;z.querySelector('#caOk').disabled=true;const bien=q.acc.some(a=>limpia(a)===v);inp.classList.add(bien?'ok':'bad');
        if(bien){G.puntos+=30;G.aciertos++;fb.className='ca-fb ok';fb.textContent='¡Golpe fuerte! «'+q.show+'»';return golpe(FUERTE,1600)}
        G.fallos++;api.repasa(R().b);son('mal');fb.className='ca-fb bad';fb.textContent=`Era «${q.show}». No pierdes vida, pero se gasta el golpe.`;estado();sigue(api.prueba?500:3200)};
      z.querySelector('#caOk').onclick=comprueba;inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();comprueba()}};estado()}
    function fin(){if(G.acabado)return;G.acabado=true;J.ganados++;G.monedas+=10;api.guarda();const estrella=api.estrella();son('gana');window._CARTAS=null;
      api.fin({ic:'🏆',titulo:'¡Duelo ganado!',gana:true,clave:'cartas',puntos:G.puntos,monedas:G.monedas,otra:jugar,
        lineas:`${G.puntos} puntos · ${G.aciertos} aciertos${G.fallos?` · ${G.fallos} fallo${G.fallos>1?'s':''}`:''}${estrella?'<br>⭐ ¡Estrella del arcade!':''}`})}
    empezar('Lee la orden del rival y juega la carta que la vence. Sin reloj: piensa antes de tocar. Con tres aciertos seguidos se carga el golpe fuerte ⚡.')}

  mapa();
}
(window.ARCADE=window.ARCADE||{}).cartas={start};
})();
