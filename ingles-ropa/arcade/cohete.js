/* =====================================================================
   Misión Estudio · arcade de «La ropa en inglés» (2º) · 🚀 COHETE DEL ARMARIO (25-nov)
   Elegido por el padre en el artefacto «La ropa en inglés de 2º» (A1): el Cohete del Saber de Mates de 5º, adaptado a 2º.
   Cuatro planetas (prendas, colores, prenda con su color y con o sin «a»), cada uno con su guardián. En vez de rocas con
   números caen burbujas con una prenda de color; la consigna se lee y se oye en inglés («SOCKS», «RED THINGS», «A BLUE HAT»).
   Mismos mandos que en Mates: el cohete se mueve con la barra y dispara con el botón rojo; caen cápsulas de escudo, imán y
   doble disparo. Más lento que en 5º. Una burbuja mala quita una de tres vidas y dice por qué en español.
   Usa los dibujos y las frases del juego (PR, P, COL, COLS, CAJA, forma, parte), Phaser 3 y ZzFX.
   Lo común (XP, monedas, récords, estrella, «para repasar») lo pone el motor con api.
   Modo prueba (?prueba o window.ARCADE_PRUEBA): partida corta con semilla fija, sin láseres, una burbuja cada vez y el
   estado en window._ARC, con la misma forma que el cohete de Mates, para que el verificador lo juegue con su mismo jugador.
   ===================================================================== */
(()=>{
const PLANETAS=[
  {k:'prendas',n:'Planeta de las Prendas',corto:'Prendas',b:'deletreo',cielo:'#c8602a',suelo:'#ff8a3d',jefe:'Guardián de las prendas'},
  {k:'colores',n:'Planeta de los Colores',corto:'Colores',b:'vestidor',cielo:'#1f7a4a',suelo:'#2ecc71',jefe:'Guardián de los colores'},
  {k:'ropa',n:'Planeta de la Ropa',corto:'Prenda y color',b:'quien',cielo:'#2a5bb8',suelo:'#3dd6ff',jefe:'Guardián de la ropa'},
  {k:'plural',n:'Planeta del «a»',corto:'Con o sin «a»',b:'conA',cielo:'#6c3fb5',suelo:'#b48cff',jefe:'Guardián del «a»'}];
/* Consignas: tema(rnd) → {txt (cartel), corto (pecho del guardián), dice (lo que se oye), cumple(n), numero(rnd, bueno), explica(n)}; n = {k: prenda, c: color} */
const semilla=s=>()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296};
const elige=(r,a)=>a[Math.floor(r()*a.length)];
const colEs=c=>COL[c][1];
const TEMAS={
  prendas(r){const k0=elige(r,PR).k,otras=PR.filter(p=>p.k!==k0);
    return{txt:P[k0].en.toUpperCase(),corto:P[k0].en,dice:P[k0].en,cumple:n=>n.k===k0,
      numero:(q,bueno)=>({k:bueno?k0:elige(q,otras).k,c:elige(q,COLS)}),
      explica:n=>`Eso es «${P[n.k].en}» (${P[n.k].es}). Busca «${P[k0].en}» (${P[k0].es}).`}},
  colores(r){const c0=elige(r,COLS),otros=COLS.filter(c=>c!==c0);
    return{txt:`${c0.toUpperCase()} THINGS`,corto:c0,dice:`${c0} things`,cumple:n=>n.c===c0,
      numero:(q,bueno)=>({k:elige(q,PR).k,c:bueno?c0:elige(q,otros)}),
      explica:n=>`Eso es «${n.c}» (${colEs(n.c)}). Busca las cosas «${c0}» (${colEs(c0)}).`}},
  ropa(r){const k0=elige(r,PR).k,c0=elige(r,COLS.filter(c=>vale([k0,c]))),t=[k0,c0];
    return{txt:parte(t).toUpperCase(),corto:P[k0].en,dice:parte(t),cumple:n=>n.k===k0&&n.c===c0,
      numero:(q,bueno)=>{if(bueno)return{k:k0,c:c0};const m=q();
        return m<.4?{k:k0,c:elige(q,COLS.filter(c=>c!==c0))}:m<.8?{k:elige(q,PR.filter(p=>p.k!==k0)).k,c:c0}:{k:elige(q,PR.filter(p=>p.k!==k0)).k,c:elige(q,COLS.filter(c=>c!==c0))}},
      explica:n=>`Eso es «${parte([n.k,n.c])}». Busca «${parte(t)}».`}},
  plural(r){const sin=r()<.5,pl=PR.filter(p=>p.pl),un=PR.filter(p=>!p.pl);
    return{txt:sin?'SIN «a»: shoes…':'CON «a»: a hat…',corto:sin?'sin a':'con a',dice:'',cumple:n=>!!P[n.k].pl===sin,
      numero:(q,bueno)=>({k:elige(q,bueno===sin?pl:un).k,c:elige(q,COLS)}),
      explica:n=>P[n.k].pl?`«${P[n.k].en}» va sin «a»: son dos o es plural.`:`Se dice «a ${P[n.k].en}»: es una sola.`}}};
const hex=c=>parseInt(COL[c][0].slice(1),16);
/* Cada prenda en blanco, para teñirla de su color dentro de la burbuja */
const prendaSVG=k=>`<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="${CAJA[k]}">${forma(k,'#ffffff')}</svg>`;
const COLORES=[{k:'rojo',n:'Rojo',c:'#ff5c6c',p:0},{k:'oro',n:'Oro',c:'#ffc83d',p:20},{k:'menta',n:'Menta',c:'#2ecc71',p:30},{k:'galaxia',n:'Galaxia',c:'#8a5cff',p:40}];
const MEJORAS={escudo:{ic:'🛡️',n:'Escudo',ms:12000,c:0x3dd6ff},iman:{ic:'🧲',n:'Imán',ms:9000,c:0xffc83d},doble:{ic:'✨',n:'Doble disparo',ms:9000,c:0xff5c8a}};
const ESTELAS=[{k:'nada',n:'Sin estela',p:0},{k:'chispas',n:'Chispas',p:25},{k:'arcoiris',n:'Arcoíris',p:50}];
/* El campo de juego y, debajo, el panel de mandos: la barra (toda su anchura recorre toda la pantalla) y, aparte, el botón */
const W=600,H=1000,PANEL=170,NY=H-PANEL-85,BARRA={x0:28,x1:388,y:H-PANEL/2,alto:84},BOTON={x:500,y:H-PANEL/2,r:64},FUENTE='Fredoka, Nunito, system-ui, sans-serif';

/* Dibujos en SVG (los mismos del artefacto) */
const cohSVG=c=>`<svg xmlns="http://www.w3.org/2000/svg" width="232" height="350" viewBox="140 56 232 350"><path d="M224 352 q32 -30 64 0 q-8 30 -32 46 q-24 -16 -32 -46z" fill="#ffb02e" stroke="#1d2033" stroke-width="12" stroke-linejoin="round"/><path d="M240 352 q16 -14 32 0 q-4 16 -16 26 q-12 -10 -16 -26z" fill="#fff3c4"/><path d="M256 70 q70 60 62 196 h-124 q-8 -136 62 -196z" fill="#fff" stroke="#1d2033" stroke-width="12" stroke-linejoin="round"/><path d="M194 210 q-48 26 -46 92 l52 -26z M318 210 q48 26 46 92 l-52 -26z" fill="${c}" stroke="#1d2033" stroke-width="12" stroke-linejoin="round"/><path d="M206 266 h100 l-10 46 h-80z" fill="${c}" stroke="#1d2033" stroke-width="12" stroke-linejoin="round"/><circle cx="256" cy="168" r="34" fill="#7fd3ff" stroke="#1d2033" stroke-width="12"/><circle cx="246" cy="158" r="9" fill="#fff" opacity=".8"/></svg>`;
const ROBOT=`<svg xmlns="http://www.w3.org/2000/svg" width="280" height="260" viewBox="-70 -70 140 130"><path d="M0-58 V-46" stroke="#aab4e6" stroke-width="3"/><circle cy="-60" r="5" fill="#ffc83d"/><rect x="-34" y="-46" width="68" height="40" rx="10" fill="#6c3fb5" stroke="#2b1858" stroke-width="3"/><rect x="-22" y="-36" width="16" height="10" rx="3" fill="#ffc83d"/><rect x="6" y="-36" width="16" height="10" rx="3" fill="#ffc83d"/><rect x="-44" y="-2" width="88" height="54" rx="12" fill="#7d4fd0" stroke="#2b1858" stroke-width="3"/><rect x="-24" y="8" width="48" height="32" rx="6" fill="#0b1230" stroke="#3dd6ff" stroke-width="2"/><rect x="-62" y="4" width="16" height="36" rx="8" fill="#6c3fb5" stroke="#2b1858" stroke-width="3"/><rect x="46" y="4" width="16" height="36" rx="8" fill="#6c3fb5" stroke="#2b1858" stroke-width="3"/></svg>`;
const imagen=svg=>new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)});

/* Sonidos ZzFX: cortos y suaves */
const SON={disparo:[.04,.05,900,0,.01,.05,1,1.5,-40],bien:[.35,.05,520,0,.04,.18,0,1,,,400,.04],roca:[.4,.1,110,0,.04,.3,4,1,-2],
  mal:[.4,0,150,.01,.12,.3,2,1,-3],moneda:[.3,0,1300,0,.03,.12,0,1,,,600,.04],clang:[.25,.05,700,0,.01,.08,3,1,-10],
  jefe:[.5,.05,90,.02,.25,.5,4,1,-1],gana:[.45,0,520,.02,.25,.4,0,1,,,260,.08,.1],laser:[.12,.05,300,0,.02,.12,2,1,-20]};

let CSS=false;
function estilos(){if(CSS)return;CSS=true;const s=document.createElement('style');s.textContent=`
.coh .planetas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:14px 0}
.coh .pl{position:relative;overflow:hidden;text-align:left;border:2px solid rgba(255,255,255,.18);border-radius:18px;padding:16px 14px 46px;color:#fff;cursor:pointer;font-family:inherit;min-height:132px;
  background:radial-gradient(150% 60% at 50% 128%,var(--s) 0 52%,transparent 53%),linear-gradient(#0a1030,var(--c))}
.coh .pl b{display:block;font-family:var(--ft);font-size:19px;line-height:1.15}.coh .pl small{display:block;margin-top:6px;font-size:13px;font-weight:700;opacity:.92}
.coh .pl .ok{position:absolute;top:10px;right:12px;font-size:20px}
.coh .pl:focus-visible{outline:3px solid var(--gold);outline-offset:2px}
.coh .taller{display:grid;gap:8px;margin:6px 0 12px}.coh .taller h3{margin:6px 0 0;font-size:17px}
.coh .fila{display:flex;gap:8px;flex-wrap:wrap}
.coh .it{font:700 14px var(--fb);color:var(--txt);background:var(--card2);border:2px solid transparent;border-radius:12px;padding:8px 12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.coh .it i{width:16px;height:16px;border-radius:50%;background:var(--c);display:inline-block;border:2px solid #1d2033}
.coh .it[aria-pressed="true"]{border-color:var(--gold)}.coh .it:disabled{opacity:.45;cursor:default}
.coh-juego{display:grid;gap:8px}
.coh-caja{position:relative;min-width:0;overflow:hidden;border-radius:16px}
.coh-empezar{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1fr);align-content:center;gap:12px;text-align:center;padding:20px;background:rgba(7,11,36,.82);border-radius:16px;color:#fff}
.coh-empezar h3{margin:0;font-family:var(--ft);font-size:26px}.coh-empezar p{margin:0 auto;max-width:34ch;font-size:16px;line-height:1.45}
.coh-empezar .ctl{display:grid;gap:6px;justify-items:center;font-size:15px;color:#cfe2ff}
.coh-empezar .btn{justify-self:center;font-size:22px;padding:14px 30px}
.coh-barra{display:flex;align-items:center;justify-content:space-between;gap:10px}
.coh-barra b{font-family:var(--ft);font-size:17px}
#cohLienzo{width:100%;height:min(calc(100dvh - 150px),1000px);min-height:420px;touch-action:none;user-select:none;-webkit-user-select:none;border-radius:16px;overflow:hidden;background:#0a1030}
@media (max-width:600px){.coh .planetas{grid-template-columns:1fr 1fr}.coh .pl{min-height:118px;padding:12px 10px 40px}.coh .pl b{font-size:16px}}`;document.head.appendChild(s)}

function start(api){estilos();const J=api.estado;J.vencidos=J.vencidos||{};J.tengo=J.tengo||['rojo','nada'];J.color=J.color||'rojo';J.estela=J.estela||'nada';
  const caja=api.caja,esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function mapa(){const mon=api.monedas();
    caja.innerHTML=`<div class="box coh"><h2>🚀 Cohete del armario</h2>
    <p class="sub">Mueve el cohete con la barra y dispara con el botón rojo. Revienta las prendas que pide la consigna y no toques las demás. Coge las cápsulas: escudo, imán y doble disparo. Al final de cada planeta te espera su guardián.</p>
    <div class="planetas">${PLANETAS.map(p=>`<button class="pl" data-p="${p.k}" style="--c:${p.cielo};--s:${p.suelo}">${J.vencidos[p.k]?'<span class="ok" aria-label="conquistado">🏆</span>':''}<b>${esc(p.n)}</b><small>Récord: ${api.mejor(p.k)}</small></button>`).join('')}</div>
    <div class="taller"><h3>🛠️ Taller · tienes 🪙 ${mon}</h3>
      <div class="fila">${COLORES.map(c=>boton('color',c,`<i style="--c:${c.c}"></i>${c.n}`,mon)).join('')}</div>
      <div class="fila">${ESTELAS.map(c=>boton('estela',c,c.n,mon)).join('')}</div></div>
    <button class="btn sec" id="cohArc">🎮 Arcade</button></div>`;
    caja.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>jugar(PLANETAS.find(p=>p.k===b.dataset.p)));
    caja.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const t=b.dataset.t,it=(t==='color'?COLORES:ESTELAS).find(x=>x.k===b.dataset.k);
      if(!J.tengo.includes(it.k)){if(!api.gasta(it.p))return;J.tengo.push(it.k)}J[t]=it.k;api.guarda();mapa()});
    caja.querySelector('#cohArc').onclick=api.salir}
  function boton(t,it,txt,mon){const tiene=J.tengo.includes(it.k),puesto=J[t]===it.k;
    return `<button class="it" data-t="${t}" data-k="${it.k}" aria-pressed="${puesto}" ${!tiene&&mon<it.p?'disabled':''}>${txt}${tiene?'':` · 🪙 ${it.p}`}</button>`}

  function jugar(P){
    caja.innerHTML=`<div class="coh-juego"><div class="coh-barra"><b>🚀 ${esc(P.n)}</b><button class="btn sec" id="cohSalir" style="margin:0;padding:8px 14px">✕ Salir</button></div><div class="coh-caja"><div id="cohLienzo" aria-label="Juego del cohete del armario: mueve el cohete con la barra de abajo y dispara con el botón rojo"></div>
      <div class="coh-empezar" id="cohEmp"><h3>${esc(P.n)}</h3><p>Revienta las burbujas con lo que pide la consigna de arriba: la oirás en inglés. Si revientas otra, pierdes una vida.</p>
      <div class="ctl"><span>👆 Mueve el cohete con la barra de abajo</span><span>🔥 Dispara con el botón rojo: un toque, un disparo</span><span>🛡️ 🧲 ✨ Toca las cápsulas con el cohete: escudo, imán y doble disparo</span></div>
      <button class="btn" id="cohGo" disabled>Empezar ▶</button></div></div></div>`;
    const color=(COLORES.find(c=>c.k===J.color)||COLORES[0]).c;let juego=null,acabado=false;
    const cierra=()=>{if(juego){juego.destroy(true);juego=null}window._ARC=null};
    api.alSalir(cierra);
    caja.querySelector('#cohSalir').onclick=()=>{acabado=true;cierra();mapa()};
    Promise.all([imagen(cohSVG(color)),imagen(ROBOT),Promise.all(PR.map(p=>imagen(prendaSVG(p.k)))),document.fonts?document.fonts.ready:null]).then(([iCoh,iRob,iPr])=>{
      if(!document.getElementById('cohLienzo'))return;
      juego=new Phaser.Game({type:Phaser.AUTO,parent:'cohLienzo',width:W,height:H,backgroundColor:'#0a1030',banner:false,audio:{noAudio:true},
        scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},input:{activePointers:3},scene:[escena(P,iCoh,iRob,iPr,fin)]});
      const go=caja.querySelector('#cohGo');go.disabled=false;go.focus();
      go.onclick=()=>{const S=juego&&juego.scene.getScene('cohete');if(!S||!S.empieza)return;caja.querySelector('#cohEmp').remove();S.empieza()}});
    function fin(o){if(acabado)return;acabado=true;
      if(o.gana){J.vencidos[P.k]=1;api.guarda()}const estrella=o.gana&&api.estrella();
      setTimeout(()=>{cierra();api.fin({ic:o.gana?'🏆':'💥',titulo:o.gana?'¡Planeta conquistado!':'¡Fin de la partida!',gana:o.gana,
        lineas:`${o.puntos} puntos · ${o.aciertos} prendas buenas${o.fallos?` · ${o.fallos} fallo${o.fallos>1?'s':''}`:''}${estrella?'<br>⭐ ¡Estrella del arcade!':''}`,
        clave:P.k,puntos:o.puntos,monedas:o.monedas,otra:()=>jugar(P)})},o.gana?1400:900)}
  }

  /* ---------- La partida ---------- */
  function escena(P,iCoh,iRob,iPr,fin){
    const prueba=api.prueba,rnd=prueba?semilla(7):Math.random,quieto=api.quieto;
    const META=prueba?4:16,VIDA_JEFE=prueba?3:10,CAMBIO=6;
    const tema=TEMAS[P.k];
    const son=k=>{if(api.sonido()&&window.zzfx)try{zzfx(...SON[k])}catch(e){}};
    return class extends Phaser.Scene{
      constructor(){super('cohete')}
      create(){const S=this;
        /* Fondo F1: cielo del color del planeta, estrellas que bajan y el planeta grande abajo */
        const cv=S.textures.createCanvas('cielo',W,H),c=cv.getContext(),g=c.createLinearGradient(0,0,0,H);
        g.addColorStop(0,'#070b24');g.addColorStop(.5,'#0f1640');g.addColorStop((H-PANEL)/H,P.cielo);g.addColorStop(1,P.cielo);c.fillStyle=g;c.fillRect(0,0,W,H);
        c.fillStyle=P.suelo;c.beginPath();c.ellipse(W/2,H-PANEL+265,W*.95,330,0,0,Math.PI*2);c.fill();
        c.strokeStyle='rgba(255,255,255,.3)';c.lineWidth=4;c.stroke();cv.refresh();
        S.add.image(0,0,'cielo').setOrigin(0);
        const ev=S.textures.createCanvas('estrellas',W,H),e=ev.getContext();
        for(let i=0;i<70;i++){e.globalAlpha=.3+Math.random()*.7;e.fillStyle='#fff';e.beginPath();e.arc(Math.random()*W,Math.random()*H,Math.random()*2+.6,0,7);e.fill()}ev.refresh();
        S.est=S.add.tileSprite(0,0,W,H,'estrellas').setOrigin(0);
        /* Texturas */
        S.textures.addImage('cohete',iCoh);S.textures.addImage('robot',iRob);PR.forEach((p,i)=>S.textures.addImage('p_'+p.k,iPr[i]));
        const gg=S.make.graphics({x:0,y:0,add:false});
        for(let v=0;v<3;v++){gg.clear();const pts=[],R=40,n=8;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+v,r=R*(.82+((i*37+v*11)%7)/30);pts.push(new Phaser.Math.Vector2(46+Math.cos(a)*r,46+Math.sin(a)*r))}
          gg.fillStyle(0x5b4a8a,1);gg.fillPoints(pts,true);gg.lineStyle(5,0x2b2150,1);gg.strokePoints(pts,true,true);
          gg.fillStyle(0x45386e,1);gg.fillCircle(32+v*4,34,7);gg.fillCircle(62-v*3,62,5);gg.generateTexture('roca'+v,92,92)}
        /* La burbuja de cada prenda: clara, para que se vea bien cualquier color */
        gg.clear();gg.fillStyle(0xf4f6ff,1);gg.fillCircle(48,48,44);gg.lineStyle(5,0x3dd6ff,1);gg.strokeCircle(48,48,44);gg.generateTexture('burbuja',96,96);
        gg.clear();gg.fillStyle(0xffc83d,1);gg.fillRoundedRect(0,0,10,30,5);gg.generateTexture('bala',10,30);
        gg.clear();gg.fillStyle(0xff3b5c,1);gg.fillRoundedRect(0,0,12,40,6);gg.fillStyle(0xffd0d8,1);gg.fillRoundedRect(3,4,6,32,3);gg.generateTexture('laser',12,40);
        gg.clear();gg.fillStyle(0xffffff,1);gg.fillCircle(6,6,6);gg.generateTexture('chispa',12,12);gg.destroy();
        S.boom=S.add.particles(0,0,'chispa',{speed:{min:120,max:340},lifespan:550,scale:{start:1.1,end:0},tint:[0xb48cff,0xffc83d,0xffffff],emitting:false,blendMode:'ADD'});
        S.chispas=S.add.particles(0,0,'chispa',{speed:{min:60,max:200},lifespan:300,scale:{start:.7,end:0},tint:0x3dd6ff,emitting:false});
        /* Nave */
        S.nave=S.add.image(W/2,NY,'cohete').setScale(.42).setDepth(5);
        if(J.estela!=='nada'){const arco=J.estela==='arcoiris';
          S.estela=S.add.particles(0,0,'chispa',{speed:{min:30,max:90},angle:{min:80,max:100},lifespan:arco?520:380,scale:{start:arco?.9:.7,end:0},frequency:28,
            tint:arco?[0xff5c6c,0xffc83d,0x2ecc71,0x3dd6ff,0x8a5cff]:[0xffc83d,0xffe9a0],blendMode:'ADD'}).setDepth(4);
          S.estela.startFollow(S.nave,0,70)}
        /* Mover: arrastrando (el dedo no tapa el cohete) o con las flechas en el ordenador */
        /* Panel de mandos: barra de movimiento a la izquierda y botón de disparo a la derecha, separados.
           La barra es como un deslizador: su punto más a la derecha lleva el cohete al borde derecho. Se puede mover y disparar a la vez. */
        const pan=S.add.graphics().setDepth(18);pan.fillStyle(0x0b1230,1);pan.fillRect(0,H-PANEL,W,PANEL);pan.lineStyle(3,0x2a376f,1);pan.lineBetween(0,H-PANEL,W,H-PANEL);
        pan.fillStyle(0x151d45,1);pan.fillRoundedRect(BARRA.x0,BARRA.y-BARRA.alto/2,BARRA.x1-BARRA.x0,BARRA.alto,BARRA.alto/2);pan.lineStyle(3,0x3d4f8f,1);pan.strokeRoundedRect(BARRA.x0,BARRA.y-BARRA.alto/2,BARRA.x1-BARRA.x0,BARRA.alto,BARRA.alto/2);
        S.add.text(BARRA.x0+30,BARRA.y,'◀',{fontFamily:FUENTE,fontSize:'28px',color:'#5d6fae'}).setOrigin(.5).setDepth(19);S.add.text(BARRA.x1-30,BARRA.y,'▶',{fontFamily:FUENTE,fontSize:'28px',color:'#5d6fae'}).setOrigin(.5).setDepth(19);
        S.mando=S.add.circle(0,BARRA.y,32,0x3dd6ff,1).setStrokeStyle(4,0xffffff).setDepth(19);
        S.boton=S.add.circle(BOTON.x,BOTON.y,BOTON.r,0xee3b4f,1).setStrokeStyle(5,0xffffff).setDepth(19);
        S.add.text(BOTON.x,BOTON.y-6,'🔥',{fontSize:'40px'}).setOrigin(.5).setDepth(20);S.add.text(BOTON.x,BOTON.y+40,'DISPARA',{fontFamily:FUENTE,fontSize:'15px',fontStyle:'700',color:'#fff'}).setOrigin(.5).setDepth(20);
        const aX=px=>44+Phaser.Math.Clamp((px-BARRA.x0-32)/(BARRA.x1-BARRA.x0-64),0,1)*(W-88);
        S.dedo=null;
        S.input.on('pointerdown',p=>{if(Math.hypot(p.x-BOTON.x,p.y-BOTON.y)<BOTON.r+18)return S.dispara();
          if(p.y>H-PANEL&&p.x<BARRA.x1+30){S.dedo=p.id;S.nave.x=aX(p.x)}});
        S.input.on('pointermove',p=>{if(p.id===S.dedo&&p.isDown)S.nave.x=aX(p.x)});
        S.input.on('pointerup',p=>{if(p.id===S.dedo)S.dedo=null});
        S.teclas=S.input.keyboard?S.input.keyboard.createCursorKeys():null;
        if(S.input.keyboard)S.input.keyboard.on('keydown-SPACE',()=>S.dispara());
        /* Marcador */
        S.vidas=3;S.puntos=0;S.racha=0;S.buenas=0;S.fallos=0;S.monedas=0;S.fase='listo';S.cuenta=0;S.lento=1;S.inv=0;
        /* Mejoras: lo que le queda a cada una (ms), las cápsulas que caen y el aro del escudo */
        S.mej={escudo:0,iman:0,doble:0};S.caps=[];S.capT=prueba?700:9000;S.nCap=0;S.escudos=0;S.ultimoN=0;
        S.aro=S.add.circle(S.nave.x,S.nave.y,78).setStrokeStyle(5,0x3dd6ff,.9).setFillStyle(0x3dd6ff,.12).setDepth(6).setVisible(false);
        S.rocas=[];S.balas=[];S.laseres=[];S.tiro=0;S.sale=600;
        const txt=(x,y,t,o)=>S.add.text(x,y,t,{fontFamily:FUENTE,fontSize:'30px',color:'#fff',fontStyle:'700',...o}).setDepth(20);
        S.tVidas=txt(22,18,'',{color:'#ff5c6c',fontSize:'34px'});S.tPuntos=txt(W-22,18,'0',{fontSize:'32px'}).setOrigin(1,0);S.tMej=txt(22,62,'',{fontSize:'24px',color:'#eef1ff'});
        S.cartel=S.add.graphics().setDepth(19);S.tCons=txt(W/2,92,'',{fontSize:'34px',color:'#eef1ff'}).setOrigin(.5);
        S.barra=S.add.graphics().setDepth(19);S.tBarra=txt(W/2,142,'',{fontSize:'20px',color:'#aab4e6',fontStyle:'600'}).setOrigin(.5);
        S.nuevaConsigna();S.pinta();
      }
      empieza(){if(this.fase!=='listo')return;this.fase='rocas';this.aviso('¡Vamos!','Revienta las que pide la consigna',1400);this.oir()}
      oir(){const d=this.cons&&this.cons.dice;if(d&&!prueba&&typeof hablar==='function')hablar(d,false,'en-GB')}
      dispara(){const S=this;if((S.fase!=='rocas'&&S.fase!=='jefe')||S.tiro>0)return;S.tiro=170;
        const xs=S.mej.doble>0?[S.nave.x-24,S.nave.x+24]:[S.nave.x];S.ultimoN=xs.length;
        xs.forEach(x=>S.balas.push(S.add.image(x,S.nave.y-70,'bala').setDepth(4)));son('disparo');
        if(!quieto)S.tweens.add({targets:S.boton,scale:{from:.86,to:1},duration:140})}
      nuevaConsigna(){const S=this;let c;do c=tema(rnd);while(S.cons&&c.txt===S.cons.txt&&!prueba);S.cons=c;S.cuenta=0;
        S.rocas.forEach(r=>{r.fuera=true;S.tweens.add({targets:r.c,alpha:0,scale:.4,duration:250,onComplete:()=>r.c.destroy()})});S.rocas=[];
        S.tCons.setText(c.txt);const w=Math.max(260,S.tCons.width+60);S.cartel.clear();S.cartel.fillStyle(0x151d45,.92);S.cartel.fillRoundedRect(W/2-w/2,66,w,54,27);S.cartel.lineStyle(3,0x3dd6ff,1);S.cartel.strokeRoundedRect(W/2-w/2,66,w,54,27);
        if(!quieto)S.tweens.add({targets:S.tCons,scale:{from:1.35,to:1},duration:380,ease:'Back.out'});
        if(S.jefe)S.jefe.pecho.setText(c.corto);if(S.fase!=='listo')S.oir()}
      pinta(){const S=this;S.tVidas.setText('♥'.repeat(S.vidas)+'♡'.repeat(3-S.vidas));S.tPuntos.setText(S.puntos+(S.racha>=3?`  🔥x${S.mult()}`:''));
        const jf=S.fase==='jefe',k=jf?S.jefe.vida/VIDA_JEFE:Math.min(1,S.buenas/META);S.barra.clear();S.barra.fillStyle(0x0c1633,1);S.barra.fillRoundedRect(150,160,300,12,6);
        S.barra.fillStyle(jf?0xee3b4f:0xffc83d,1);if(k>0)S.barra.fillRoundedRect(150,160,300*k,12,6);
        S.tBarra.setText(jf?P.jefe:`Hasta el guardián: ${Math.min(S.buenas,META)} de ${META}`);
        S.tMej.setText(Object.keys(MEJORAS).filter(k=>S.mej[k]>0).map(k=>MEJORAS[k].ic+' '+Math.ceil(S.mej[k]/1000)).join('   '));
        window._ARC={fase:S.fase,vidas:S.vidas,puntos:S.puntos,buenas:S.buenas,consigna:S.cons.txt,nave:{x:S.nave.x,y:S.nave.y},ancho:W,alto:H,controles:{barra:BARRA,boton:BOTON,margen:44},
          jefe:S.jefe?{vida:S.jefe.vida,x:S.jefe.c.x}:null,mejora:{...S.mej},escudos:S.escudos,malas:S.malas||0,balasPorDisparo:S.ultimoN,
          capsulas:S.caps.filter(c=>!c.fuera).map(c=>({k:c.k,x:c.c.x,y:c.c.y})),rocas:S.rocas.filter(r=>!r.fuera).map(r=>({n:r.n,bueno:r.bueno,x:r.c.x,y:r.c.y}))}}
      mult(){return this.racha>=9?3:this.racha>=4?2:1}
      aviso(t,sub,ms,rojo){const S=this;if(S.cajaAviso)S.cajaAviso.destroy();
        const tt=S.add.text(0,0,t,{fontFamily:FUENTE,fontSize:'44px',fontStyle:'700',color:rojo?'#ff9aa8':'#ffc83d',align:'center'}).setOrigin(.5,1);
        const ts=S.add.text(0,8,sub||'',{fontFamily:FUENTE,fontSize:'27px',color:'#fff',align:'center',wordWrap:{width:W-110}}).setOrigin(.5,0);
        const h=tt.height+ts.height+44,w=Math.min(W-40,Math.max(tt.width,ts.width)+60),bg=S.add.graphics();
        bg.fillStyle(0x0b1230,.94);bg.fillRoundedRect(-w/2,-tt.height-22,w,h,22);bg.lineStyle(3,rojo?0xee3b4f:0x3dd6ff,1);bg.strokeRoundedRect(-w/2,-tt.height-22,w,h,22);
        S.cajaAviso=S.add.container(W/2,H*.44,[bg,tt,ts]).setDepth(30);if(!quieto)S.tweens.add({targets:S.cajaAviso,scale:{from:.7,to:1},duration:220,ease:'Back.out'});
        const caja=S.cajaAviso;S.time.delayedCall(ms,()=>{if(caja.active)S.tweens.add({targets:caja,alpha:0,duration:220,onComplete:()=>caja.destroy()})})}
      roca(x,y,vy,bueno){const S=this,n=S.cons.numero(rnd,bueno),im=S.add.image(0,0,'burbuja');
        const pr=S.add.image(0,0,'p_'+n.k).setScale(.52).setTint(hex(n.c));
        const c=S.add.container(x,y,[im,pr]).setDepth(3);S.rocas.push({c,im,n,bueno:S.cons.cumple(n),vy,giro:0})}
      dano(motivo,fisico){const S=this;if(S.inv>0)return;
        if(fisico&&S.mej.escudo>0){S.mej.escudo=0;S.escudos++;S.inv=700;son('clang');S.chispas.explode(16,S.nave.x,S.nave.y-40);S.flota(S.nave.x,S.nave.y-110,'¡El escudo te salva!','#3dd6ff');return}S.vidas--;S.racha=0;S.fallos++;S.inv=1300;son('mal');
        if(!quieto)S.cameras.main.shake(220,.012);S.cameras.main.flash(160,238,59,79);
        S.tweens.add({targets:S.nave,alpha:.3,duration:120,yoyo:true,repeat:4,onComplete:()=>S.nave.setAlpha(1)});
        if(S.vidas<=0){S.fase='fin';S.pinta();S.aviso('¡Sin vidas!',motivo||'',2000,true);
          fin({gana:false,puntos:S.puntos,aciertos:S.buenas,fallos:S.fallos,monedas:S.monedas})}}
      update(_,dtReal){const S=this;S.mando.x=BARRA.x0+32+(S.nave.x-44)/(W-88)*(BARRA.x1-BARRA.x0-64);if(S.fase==='fin'||S.fase==='gana'||S.fase==='listo'){S.pinta();return}
        if(S.lento<1)S.lento=Math.min(1,S.lento+dtReal/1600);const dt=dtReal*S.lento/1000;S.inv=Math.max(0,S.inv-dtReal);
        S.est.tilePositionY-=40*dt;
        if(S.teclas){if(S.teclas.left.isDown)S.nave.x=Math.max(44,S.nave.x-520*dt);if(S.teclas.right.isDown)S.nave.x=Math.min(W-44,S.nave.x+520*dt)}
        S.tiro=Math.max(0,S.tiro-dtReal);
        for(const k in S.mej)S.mej[k]=Math.max(0,S.mej[k]-dtReal);
        S.aro.setPosition(S.nave.x,S.nave.y-10).setVisible(S.mej.escudo>0);
        /* Cápsulas: una cada poco (en la prueba, enseguida y por orden: escudo, doble e imán) */
        S.capT-=dtReal;if(S.capT<=0&&!S.caps.some(c=>!c.fuera)){const ks=Object.keys(MEJORAS).filter(k=>!S.mej[k]);
          S.capT=prueba?700:13000+Math.random()*5000;if(ks.length){const k=prueba?['escudo','doble','iman'][S.nCap%3]:ks[Math.floor(Math.random()*ks.length)];S.nCap++;S.capsula(k)}}
        for(const c of S.caps){if(c.fuera)continue;c.t+=dt;c.c.y+=150*dt;c.c.x=c.x0+Math.sin(c.t*2.2)*(prueba?0:40);
          if(c.c.y>H-PANEL+40){c.fuera=true;c.c.destroy();continue}
          if(Math.abs(c.c.x-S.nave.x)<62&&Math.abs(c.c.y-S.nave.y)<75){c.fuera=true;S.coge(c)}}
        S.caps=S.caps.filter(c=>!c.fuera);
        S.balas.forEach(b=>b.y-=1000*dt);
        /* Rocas: llegan de arriba (o las lanza el guardián) */
        S.sale-=dtReal*S.lento;const hay=S.rocas.filter(r=>!r.fuera).length;
        if(S.sale<=0&&(!prueba||hay===0)){
          if(S.fase==='rocas'){S.sale=prueba?500:Math.max(620,1050-S.buenas*22);/* en la prueba, tras la primera mala, todas buenas: el verificador dispara a lo que baja por su columna mientras coge cápsulas */const bueno=prueba&&S.malas?true:rnd()<.5;S.roca(60+rnd()*(W-120),-50,prueba?150:100+S.buenas*3+rnd()*35,bueno)}
          else if(S.fase==='jefe'){S.sale=prueba?500:1100;const bueno=prueba&&S.malas?true:rnd()<.55;S.roca(Phaser.Math.Clamp(S.jefe.c.x+(rnd()-.5)*160,60,W-60),S.jefe.c.y+90,prueba?160:130,bueno)}}
        for(const r of S.rocas){if(r.fuera)continue;r.c.y+=r.vy*dt;r.im.rotation+=r.giro*dt;
          if(r.c.y>H-PANEL+40){r.fuera=true;r.c.destroy();if(r.bueno){S.racha=0;S.flota(r.c.x,H-PANEL-30,'se escapó','#aab4e6')}continue}
          if(Math.abs(r.c.x-S.nave.x)<62&&Math.abs(r.c.y-S.nave.y)<70){r.fuera=true;S.boom.explode(10,r.c.x,r.c.y);r.c.destroy();
            if(r.bueno){S.racha=0;S.flota(S.nave.x,S.nave.y-90,'¡choque!','#ff9aa8')}S.dano('Te ha dado una burbuja. Muévete para esquivarlas.',true);continue}
          for(const b of S.balas){if(b.active&&Math.abs(b.x-r.c.x)<46&&Math.abs(b.y-r.c.y)<50){b.destroy();S.golpe(r);break}}}
        S.rocas=S.rocas.filter(r=>!r.fuera);S.balas=S.balas.filter(b=>{if(b.active&&b.y<-40)b.destroy();return b.active});
        /* El guardián */
        if(S.fase==='jefe'&&S.jefe.listo){const j=S.jefe;j.t+=dt;j.c.x=W/2+Math.sin(j.t*.9)*(W/2-120);
          for(const b of S.balas){if(b.active&&Math.abs(b.x-j.c.x)<90&&Math.abs(b.y-j.c.y)<80){b.destroy();S.chispas.explode(5,b.x,j.c.y+60);if(j.clang<=0){son('clang');j.clang=400;if(!j.dicho){j.dicho=1;S.flota(j.c.x,j.c.y+120,'¡Escudo! Revienta sus burbujas buenas','#3dd6ff')}}}}
          j.clang-=dtReal;if(!prueba){j.dispara-=dtReal;if(j.dispara<=0){j.dispara=2300-Math.min(900,(VIDA_JEFE-j.vida)*90);son('laser');S.laseres.push(S.add.image(j.c.x,j.c.y+70,'laser').setDepth(4))}}}
        S.laseres.forEach(l=>{l.y+=380*dt;if(l.active&&Math.abs(l.x-S.nave.x)<34&&Math.abs(l.y-S.nave.y)<70){l.destroy();S.dano('Te ha dado un láser del guardián.',true)}});
        S.laseres=S.laseres.filter(l=>{if(l.active&&l.y>H-PANEL+30)l.destroy();return l.active});
        S.pinta()}
      capsula(k){const S=this,M=MEJORAS[k],x0=prueba?W/2:90+Math.random()*(W-180);
        const bola=S.add.circle(0,0,34,0x151d45,1).setStrokeStyle(5,M.c,1),ic=S.add.text(0,2,M.ic,{fontSize:'34px'}).setOrigin(.5);
        const c=S.add.container(x0,-50,[bola,ic]).setDepth(3);if(!quieto)S.tweens.add({targets:bola,scale:{from:1,to:1.15},duration:420,yoyo:true,repeat:-1});
        S.caps.push({k,c,x0,t:0})}
      coge(cap){const S=this,M=MEJORAS[cap.k];S.mej[cap.k]=prueba?60000:M.ms;son('moneda');S.chispas.explode(14,cap.c.x,cap.c.y);cap.c.destroy();
        S.flota(S.nave.x,S.nave.y-120,M.ic+' '+M.n+'!','#eef1ff')}
      flota(x,y,t,col){const S=this,f=S.add.text(x,y,t,{fontFamily:FUENTE,fontSize:'26px',fontStyle:'700',color:col||'#ffc83d',stroke:'#0b1230',strokeThickness:6}).setOrigin(.5).setDepth(25);
        S.tweens.add({targets:f,y:y-60,alpha:0,duration:quieto?700:900,onComplete:()=>f.destroy()})}
      golpe(r){const S=this;r.fuera=true;
        if(r.bueno){S.racha++;const p=10*S.mult();S.puntos+=p;S.buenas++;son('roca');S.boom.explode(quieto?8:18,r.c.x,r.c.y);S.flota(r.c.x,r.c.y-40,'+'+p);r.c.destroy();
          if(S.mej.iman>0||S.buenas%3===0){S.monedas++;son('moneda');S.flota(r.c.x,r.c.y-80,'+1 🪙','#ffc83d')}
          if(S.fase==='rocas'){S.cuenta++;if(S.buenas>=META)return S.llegaJefe();if(S.cuenta>=CAMBIO)S.time.delayedCall(350,()=>{if(S.fase==='rocas')S.nuevaConsigna()})}
          else if(S.fase==='jefe')S.pegaJefe();return}
        /* Roca mala: pierde una vida y ve por qué */
        S.tweens.add({targets:r.c,alpha:0,scale:1.4,duration:300,onComplete:()=>r.c.destroy()});r.im.setTint(0xee3b4f);S.lento=.3;
        S.malas=(S.malas||0)+1;api.repasa(P.b);S.aviso('¡Esa no!',S.cons.explica(r.n),2600,true);S.dano()}
      llegaJefe(){const S=this;S.fase='espera';S.rocas.forEach(r=>{r.fuera=true;S.tweens.add({targets:r.c,alpha:0,duration:250,onComplete:()=>r.c.destroy()})});S.rocas=[];son('jefe');
        S.aviso('¡Llega el guardián!','Rompe su escudo reventando las burbujas buenas que lanza',1800);
        const im=S.add.image(0,0,'robot').setScale(.85),pecho=S.add.text(0,40,S.cons.corto,{fontFamily:FUENTE,fontSize:'24px',fontStyle:'700',color:'#3dd6ff'}).setOrigin(.5);
        const c=S.add.container(W/2,-160,[im,pecho]).setDepth(6);S.jefe={c,im,pecho,vida:VIDA_JEFE,t:0,listo:false,clang:0,dispara:2600};
        S.tweens.add({targets:c,y:290,duration:quieto?300:1300,ease:'Cubic.out',onComplete:()=>{S.jefe.listo=true;S.fase='jefe';S.sale=900;if(!quieto)S.tweens.add({targets:im,scaleX:.9,scaleY:.8,duration:600,yoyo:true,repeat:-1,ease:'Sine.inOut'})}})}
      pegaJefe(){const S=this,j=S.jefe;j.vida--;j.im.setTint(0xff7a8a);S.time.delayedCall(140,()=>j.im.clearTint());S.chispas.explode(12,j.c.x,j.c.y+40);if(!quieto)S.cameras.main.shake(120,.006);
        if(j.vida>0){if(j.vida%4===0)S.time.delayedCall(300,()=>{if(S.fase==='jefe')S.nuevaConsigna()});return}
        S.fase='gana';S.monedas+=10;S.puntos+=100;S.pinta();son('gana');S.boom.explode(40,j.c.x,j.c.y);S.tweens.add({targets:j.c,alpha:0,scale:1.6,angle:20,duration:700});
        S.laseres.forEach(l=>l.destroy());S.rocas.forEach(r=>r.c.destroy());S.rocas=[];S.caps.forEach(c=>c.c.destroy());S.caps=[];
        S.aviso('¡Guardián vencido!',`+100 puntos · +10 🪙`,1400);fin({gana:true,puntos:S.puntos,aciertos:S.buenas,fallos:S.fallos,monedas:S.monedas})}
    }}

  mapa();
}
(window.ARCADE=window.ARCADE||{}).cohete={start};
})();
