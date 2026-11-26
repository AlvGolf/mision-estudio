/* =====================================================================
   Misión Estudio · arcade de «La ropa en inglés» (2º) · 📸 EL FOTÓGRAFO DE LA PASARELA (25-nov)
   Elegido por el padre en el artefacto «La ropa en inglés de 2º» (A2). Desfilan cuatro niños por la pasarela y una voz
   dice a quién hay que fotografiar: «Take a photo of the girl wearing a yellow dress and blue shoes». Se pulsa 📸 cuando
   está dentro del marco. Seis rondas: en las dos primeras los demás van muy distintos; después se parecen (cambia un solo
   detalle), y la pasarela va un poco más deprisa cada ronda, empezando despacio. La frase se ve y se oye; en la segunda
   vuelta de la ruta, solo se oye (con «Ver» por si no hay sonido). Cuatro fotos buenas de seis: reportaje de moda.
   Va con botones de la página, sin Phaser. Usa los dibujos y las frases del juego (muneco, conjunto, parecidos, parte,
   respuesta, conRopa) y ZzFX. Lo común (XP, monedas, récords, estrella, «para repasar») lo pone el motor con api.
   Modo prueba (?prueba o window.ARCADE_PRUEBA): tres rondas, más rápidas, y el estado en window._FOTO para el verificador.
   ===================================================================== */
(()=>{
const SON={foto:[.5,0,1600,0,.02,.06,4,1,,,,,,.2],bien:[.35,.05,520,0,.04,.18,0,1,,,400,.04],mal:[.4,0,150,.01,.12,.3,2,1,-3],
  moneda:[.3,0,1300,0,.03,.12,0,1,,,600,.04],gana:[.45,0,520,.02,.25,.4,0,1,,,260,.08,.1]};
let CSS=false;
function estilos(){if(CSS)return;CSS=true;const s=document.createElement('style');s.textContent=`
.fo-hud{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
.fo-hud b{font-family:var(--ft);font-size:18px}
.fo-pasarela{position:relative;height:250px;background:linear-gradient(#3a1e5c 0 62%,#c25a8a 62%);border-radius:16px;overflow:hidden;margin:10px 0}
.fo-pasarela::after{content:'';position:absolute;left:0;right:0;bottom:30px;height:4px;background:#ffffff55}
.fo-modelo{position:absolute;bottom:10px;left:0;width:92px;will-change:transform}
.fo-modelo svg{width:100%;height:auto;display:block;filter:drop-shadow(0 4px 0 #0004)}
.fo-modelo.ok svg{filter:drop-shadow(0 0 10px #2ecc71)}.fo-modelo.bad svg{filter:drop-shadow(0 0 10px #ff5c5c)}
.fo-marco{position:absolute;top:14px;bottom:4px;border:4px dashed #ffffffcc;border-radius:12px}
.fo-flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
.fo-flash.on{animation:fofl .4s}@keyframes fofl{0%{opacity:.9}100%{opacity:0}}
.fo-dispara{display:block;margin:0 auto;font-size:24px;padding:14px 34px}
@media (prefers-reduced-motion:reduce){.fo-flash.on{animation:none}}`;document.head.appendChild(s)}

function start(api){estilos();const J=api.estado;J.reportajes=J.reportajes||0;
  const caja=api.caja,esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const son=k=>{if(api.sonido()&&window.zzfx)try{zzfx(...SON[k])}catch(e){}};
  const di=t=>{if(typeof hablar==='function')hablar(t,false,'en-GB')};
  const prueba=api.prueba,N=prueba?3:6,ANCHO_M=92,SEP=150;
  let G=null;
  api.alSalir(()=>{if(G)G.acabado=true;window._FOTO=null});

  function portada(){window._FOTO={fase:'portada'};
    caja.innerHTML=`<div class="box"><h2>📸 El fotógrafo de la pasarela</h2>
    <p class="sub">Desfilan niños por la pasarela. Escucha a quién hay que fotografiar y pulsa 📸 cuando esté dentro del marco. Con cuatro fotos buenas de seis, ¡reportaje de moda!</p>
    <p class="sub">Récord: ${api.mejor('foto')} · Reportajes: ${J.reportajes}</p>
    <button class="btn" id="foGo">¡Empezar! ▶</button> <button class="btn sec" id="foArc">🎮 Arcade</button></div>`;
    caja.querySelector('#foGo').onclick=jugar;caja.querySelector('#foArc').onclick=api.salir}

  function jugar(){G={ronda:0,buenas:0,fallos:0,puntos:0,monedas:0,acabado:false};ronda()}

  function ronda(){if(G.acabado)return;if(G.ronda>=N)return fin();
    const t=conjunto(),otros=G.ronda<2?distintos(t,3):parecidos(t,3);
    const fila=[t,...otros].sort(()=>Math.random()-.5),obj=fila.indexOf(t);
    const frase=`Take a photo of the ${t.s==='she'?'girl':'boy'} wearing ${t.items.map(parte).join(' and ')}.`;
    const oculta=typeof soloOir==='function'&&soloOir();
    caja.innerHTML=`<div class="box"><div class="fo-hud"><b>📸 Ronda ${G.ronda+1} de ${N}</b><span>⭐ ${G.puntos} · 📷 ${G.buenas} buenas</span><button class="btn sec" id="foSalir" style="margin:0;padding:8px 14px">✕ Salir</button></div>
      <div class="rp-frase"><button type="button" class="rp-oye" id="foOye" aria-label="Escuchar">🔊</button><span class="rp-en ${oculta?'rp-oculta':''}" id="foTxt">${oculta?'Escucha a quién hay que fotografiar 👂':esc(frase)}</span>${oculta?'<button type="button" class="rp-ver" id="foVer">👀 Ver</button>':''}</div>
      <div class="fo-pasarela" id="foPas"><div class="fo-marco" id="foMarco"></div>${fila.map((p,j)=>`<div class="fo-modelo" data-j="${j}">${muneco(conRopa(p))}</div>`).join('')}<div class="fo-flash" id="foFlash"></div></div>
      <button class="btn fo-dispara" id="foFoto">📸 ¡Foto!</button><div class="fb" id="foFb"></div></div>`;
    caja.querySelector('#foSalir').onclick=()=>{G.acabado=true;window._FOTO=null;portada()};
    caja.querySelector('#foOye').onclick=()=>di(frase);
    const ver=caja.querySelector('#foVer');if(ver)ver.onclick=()=>{const s=caja.querySelector('#foTxt');s.textContent=frase;s.classList.remove('rp-oculta');ver.remove()};
    di(frase);
    const pas=caja.querySelector('#foPas'),W=pas.clientWidth,MW=Math.min(120,W*.32),marco={c:W/2,r:MW/2};
    const mk=caja.querySelector('#foMarco');mk.style.left=(marco.c-marco.r)+'px';mk.style.width=MW+'px';
    const M=[...pas.querySelectorAll('.fo-modelo')],v=prueba?170:52+G.ronda*9,esperaIni=prueba?250:1600;
    let x0=-ANCHO_M/2-10,prev=null,hecho=false;const yo=G;
    const centros=()=>M.map((_,j)=>x0-j*SEP);
    const estado=fase=>{window._FOTO={fase,ronda:G.ronda,objetivo:obj,x:centros(),marco,buenas:G.buenas,fallos:G.fallos,puntos:G.puntos}};
    const pinta=()=>M.forEach((m,j)=>{m.style.transform=`translateX(${x0-j*SEP-ANCHO_M/2}px)`});pinta();estado('espera');
    const sigue=(ms)=>setTimeout(()=>{if(yo===G&&!G.acabado){G.ronda++;ronda()}},ms);
    const t0=performance.now();
    const loop=now=>{if(yo!==G||G.acabado||hecho||!pas.isConnected)return;
      if(now-t0<esperaIni){requestAnimationFrame(loop);return}
      if(prev==null)prev=now;x0+=v*(now-prev)/1000;prev=now;pinta();estado('desfile');
      if(x0-(M.length-1)*SEP>W+ANCHO_M){hecho=true;G.fallos++;api.repasa('quien');son('mal');
        const fb=caja.querySelector('#foFb');fb.className='fb bad';fb.textContent='¡Se ha ido sin foto! Escucha bien la ropa.';estado('resultado');sigue(prueba?400:1800);return}
      requestAnimationFrame(loop)};
    requestAnimationFrame(loop);
    caja.querySelector('#foFoto').onclick=()=>{if(hecho)return;const cs=centros();if(cs[0]<-ANCHO_M/2)return;/* aún no ha salido nadie */
      hecho=true;son('foto');const fl=caja.querySelector('#foFlash');fl.classList.remove('on');void fl.offsetWidth;fl.classList.add('on');
      let cual=-1;cs.forEach((x,j)=>{if(Math.abs(x-marco.c)<=marco.r)cual=j});
      const ok=cual===obj,fb=caja.querySelector('#foFb');
      if(ok){G.buenas++;const p=10+G.ronda*2;G.puntos+=p;G.monedas++;son('bien');M[cual].classList.add('ok');fb.className='fb ok';fb.textContent=`¡Foto perfecta! +${p}`}
      else{G.fallos++;api.repasa('quien');son('mal');if(cual>=0)M[cual].classList.add('bad');M[obj].classList.add('ok');fb.className='fb bad';
        fb.textContent=cual<0?'En el marco no había nadie.':`Ese lleva ${fila[cual].items.map(parte).join(' and ')}.`}
      estado('resultado');sigue(prueba?400:ok?1400:2400)};
  }
  /* En las primeras rondas, los demás van muy distintos: otra prenda de arriba y otros colores */
  function distintos(t,n){const o=[],k=x=>JSON.stringify([x.s,...x.items]),vistos=new Set([k(t)]);let g=0;
    while(o.length<n&&g++<200){const c=conjunto();if(c.items[0][0]===t.items[0][0]&&c.items[0][1]===t.items[0][1])continue;if(!vistos.has(k(c))){vistos.add(k(c));o.push(c)}}return o}

  function fin(){if(G.acabado)return;G.acabado=true;window._FOTO=null;const gana=G.buenas>=Math.ceil(N*2/3);
    if(gana){J.reportajes++;G.monedas+=5;api.guarda()}const estrella=gana&&api.estrella();if(gana)son('gana');
    api.fin({ic:gana?'🏆':'📸',titulo:gana?'¡Reportaje de moda!':'¡Fin del desfile!',gana,
      lineas:`${G.buenas} de ${N} fotos buenas · ${G.puntos} puntos${estrella?'<br>⭐ ¡Estrella del arcade!':''}`,
      clave:'foto',puntos:G.puntos,monedas:G.monedas,otra:jugar})}

  portada();
}
(window.ARCADE=window.ARCADE||{}).foto={start};
})();
