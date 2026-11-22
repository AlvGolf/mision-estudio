/* =====================================================================
   Misión Estudio · arcade de Mates · 🚀 COHETE DEL SABER (22-nov)
   Elegido por el padre en el artefacto «Arcade de Misión Estudio» (A1, rondas 2 y 3):
   cuatro planetas (múltiplos, divisores, criterios y primos), cada uno con su jefe.
   El cohete se mueve arrastrando el dedo y dispara solo. Hay que reventar las rocas
   que cumplen la consigna; una roca mala quita una de tres vidas y enseña por qué.
   Dibujos: el cohete de la app (C1), rocas moradas con el número en blanco (A1),
   robot guardián (J1) y un color por planeta (F1). Las monedas compran colores y estelas.
   Necesita Phaser 3 (vendor/phaser.min.js), ZzFX (vendor/zzfx.js) y arcade/numeros.js.
   Lo común (XP, monedas, récords, estrella, «para repasar») lo pone el motor con api.
   Modo prueba (?prueba o window.ARCADE_PRUEBA): partida corta con semilla fija, sin láseres,
   una roca cada vez, y el estado en window._ARC para que el verificador juegue solo.
   ===================================================================== */
(()=>{
const PLANETAS=[
  {k:'multiplos',n:'Planeta de los Múltiplos',corto:'Múltiplos',b:'mult',cielo:'#c8602a',suelo:'#ff8a3d',jefe:'Guardián de los múltiplos'},
  {k:'divisores',n:'Planeta de los Divisores',corto:'Divisores',b:'divs',cielo:'#1f7a4a',suelo:'#2ecc71',jefe:'Guardián de los divisores'},
  {k:'criterios',n:'Planeta de los Criterios',corto:'Criterios',b:'crit',cielo:'#2a5bb8',suelo:'#3dd6ff',jefe:'Guardián de los criterios'},
  {k:'primos',n:'Planeta de los Primos',corto:'Primos',b:'prim',cielo:'#6c3fb5',suelo:'#b48cff',jefe:'Guardián de los primos'}];
const COLORES=[{k:'rojo',n:'Rojo',c:'#ff5c6c',p:0},{k:'oro',n:'Oro',c:'#ffc83d',p:20},{k:'menta',n:'Menta',c:'#2ecc71',p:30},{k:'galaxia',n:'Galaxia',c:'#8a5cff',p:40}];
const ESTELAS=[{k:'nada',n:'Sin estela',p:0},{k:'chispas',n:'Chispas',p:25},{k:'arcoiris',n:'Arcoíris',p:50}];
const W=600,H=1000,FUENTE='Fredoka, Nunito, system-ui, sans-serif';

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
.coh-barra{display:flex;align-items:center;justify-content:space-between;gap:10px}
.coh-barra b{font-family:var(--ft);font-size:17px}
#cohLienzo{width:100%;height:min(calc(100dvh - 150px),1000px);min-height:420px;touch-action:none;user-select:none;-webkit-user-select:none;border-radius:16px;overflow:hidden;background:#0a1030}
@media (max-width:600px){.coh .planetas{grid-template-columns:1fr 1fr}.coh .pl{min-height:118px;padding:12px 10px 40px}.coh .pl b{font-size:16px}}`;document.head.appendChild(s)}

function start(api){estilos();const J=api.estado;J.vencidos=J.vencidos||{};J.tengo=J.tengo||['rojo','nada'];J.color=J.color||'rojo';J.estela=J.estela||'nada';
  const caja=api.caja,esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function mapa(){const mon=api.monedas();
    caja.innerHTML=`<div class="box coh"><h2>🚀 Cohete del Saber</h2>
    <p class="sub">Mueve el cohete con el dedo: dispara solo. Revienta las rocas que cumplen la consigna y no toques las demás. Al final de cada planeta te espera su guardián.</p>
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
    caja.innerHTML=`<div class="coh-juego"><div class="coh-barra"><b>🚀 ${esc(P.n)}</b><button class="btn sec" id="cohSalir" style="margin:0;padding:8px 14px">✕ Salir</button></div><div id="cohLienzo" aria-label="Juego del cohete: arrastra el dedo para moverlo"></div></div>`;
    const color=(COLORES.find(c=>c.k===J.color)||COLORES[0]).c;let juego=null,acabado=false;
    const cierra=()=>{if(juego){juego.destroy(true);juego=null}window._ARC=null};
    api.alSalir(cierra);
    caja.querySelector('#cohSalir').onclick=()=>{acabado=true;cierra();mapa()};
    Promise.all([imagen(cohSVG(color)),imagen(ROBOT),document.fonts?document.fonts.ready:null]).then(([iCoh,iRob])=>{
      if(!document.getElementById('cohLienzo'))return;
      juego=new Phaser.Game({type:Phaser.AUTO,parent:'cohLienzo',width:W,height:H,backgroundColor:'#0a1030',banner:false,audio:{noAudio:true},
        scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[escena(P,iCoh,iRob,fin)]})});
    function fin(o){if(acabado)return;acabado=true;
      if(o.gana){J.vencidos[P.k]=1;api.guarda()}const estrella=o.gana&&api.estrella();
      setTimeout(()=>{cierra();api.fin({ic:o.gana?'🏆':'💥',titulo:o.gana?'¡Planeta conquistado!':'¡Fin de la partida!',gana:o.gana,
        lineas:`${o.puntos} puntos · ${o.aciertos} rocas buenas${o.fallos?` · ${o.fallos} fallo${o.fallos>1?'s':''}`:''}${estrella?'<br>⭐ ¡Estrella del arcade!':''}`,
        clave:P.k,puntos:o.puntos,monedas:o.monedas,otra:()=>jugar(P)})},o.gana?1400:900)}
  }

  /* ---------- La partida ---------- */
  function escena(P,iCoh,iRob,fin){
    const prueba=api.prueba,rnd=prueba?NUMEROS.semilla(7):Math.random,quieto=api.quieto;
    const META=prueba?4:16,VIDA_JEFE=prueba?3:10,CAMBIO=6;
    const tema=NUMEROS.TEMAS[P.k];
    const son=k=>{if(api.sonido()&&window.zzfx)try{zzfx(...SON[k])}catch(e){}};
    return class extends Phaser.Scene{
      constructor(){super('cohete')}
      create(){const S=this;
        /* Fondo F1: cielo del color del planeta, estrellas que bajan y el planeta grande abajo */
        const cv=S.textures.createCanvas('cielo',W,H),c=cv.getContext(),g=c.createLinearGradient(0,0,0,H);
        g.addColorStop(0,'#070b24');g.addColorStop(.55,'#0f1640');g.addColorStop(1,P.cielo);c.fillStyle=g;c.fillRect(0,0,W,H);
        c.fillStyle=P.suelo;c.beginPath();c.ellipse(W/2,H+250,W*.95,330,0,0,Math.PI*2);c.fill();
        c.strokeStyle='rgba(255,255,255,.3)';c.lineWidth=4;c.stroke();cv.refresh();
        S.add.image(0,0,'cielo').setOrigin(0);
        const ev=S.textures.createCanvas('estrellas',W,H),e=ev.getContext();
        for(let i=0;i<70;i++){e.globalAlpha=.3+Math.random()*.7;e.fillStyle='#fff';e.beginPath();e.arc(Math.random()*W,Math.random()*H,Math.random()*2+.6,0,7);e.fill()}ev.refresh();
        S.est=S.add.tileSprite(0,0,W,H,'estrellas').setOrigin(0);
        /* Texturas */
        S.textures.addImage('cohete',iCoh);S.textures.addImage('robot',iRob);
        const gg=S.make.graphics({x:0,y:0,add:false});
        for(let v=0;v<3;v++){gg.clear();const pts=[],R=40,n=8;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+v,r=R*(.82+((i*37+v*11)%7)/30);pts.push(new Phaser.Math.Vector2(46+Math.cos(a)*r,46+Math.sin(a)*r))}
          gg.fillStyle(0x5b4a8a,1);gg.fillPoints(pts,true);gg.lineStyle(5,0x2b2150,1);gg.strokePoints(pts,true,true);
          gg.fillStyle(0x45386e,1);gg.fillCircle(32+v*4,34,7);gg.fillCircle(62-v*3,62,5);gg.generateTexture('roca'+v,92,92)}
        gg.clear();gg.fillStyle(0xffc83d,1);gg.fillRoundedRect(0,0,10,30,5);gg.generateTexture('bala',10,30);
        gg.clear();gg.fillStyle(0xff3b5c,1);gg.fillRoundedRect(0,0,12,40,6);gg.fillStyle(0xffd0d8,1);gg.fillRoundedRect(3,4,6,32,3);gg.generateTexture('laser',12,40);
        gg.clear();gg.fillStyle(0xffffff,1);gg.fillCircle(6,6,6);gg.generateTexture('chispa',12,12);gg.destroy();
        S.boom=S.add.particles(0,0,'chispa',{speed:{min:120,max:340},lifespan:550,scale:{start:1.1,end:0},tint:[0xb48cff,0xffc83d,0xffffff],emitting:false,blendMode:'ADD'});
        S.chispas=S.add.particles(0,0,'chispa',{speed:{min:60,max:200},lifespan:300,scale:{start:.7,end:0},tint:0x3dd6ff,emitting:false});
        /* Nave */
        S.nave=S.add.image(W/2,H-150,'cohete').setScale(.42).setDepth(5);
        if(J.estela!=='nada'){const arco=J.estela==='arcoiris';
          S.estela=S.add.particles(0,0,'chispa',{speed:{min:30,max:90},angle:{min:80,max:100},lifespan:arco?520:380,scale:{start:arco?.9:.7,end:0},frequency:28,
            tint:arco?[0xff5c6c,0xffc83d,0x2ecc71,0x3dd6ff,0x8a5cff]:[0xffc83d,0xffe9a0],blendMode:'ADD'}).setDepth(4);
          S.estela.startFollow(S.nave,0,70)}
        /* Mover: arrastrando (el dedo no tapa el cohete) o con las flechas en el ordenador */
        let ult=null;S.input.on('pointerdown',p=>{ult=p.x});S.input.on('pointerup',()=>{ult=null});
        S.input.on('pointermove',p=>{if(ult==null||!p.isDown)return;S.nave.x=Phaser.Math.Clamp(S.nave.x+(p.x-ult)*1.15,44,W-44);ult=p.x});
        S.teclas=S.input.keyboard?S.input.keyboard.createCursorKeys():null;
        /* Marcador */
        S.vidas=3;S.puntos=0;S.racha=0;S.buenas=0;S.fallos=0;S.monedas=0;S.fase='rocas';S.cuenta=0;S.lento=1;S.inv=0;
        S.rocas=[];S.balas=[];S.laseres=[];S.tiro=0;S.sale=600;
        const txt=(x,y,t,o)=>S.add.text(x,y,t,{fontFamily:FUENTE,fontSize:'30px',color:'#fff',fontStyle:'700',...o}).setDepth(20);
        S.tVidas=txt(22,18,'',{color:'#ff5c6c',fontSize:'34px'});S.tPuntos=txt(W-22,18,'0',{fontSize:'32px'}).setOrigin(1,0);
        S.cartel=S.add.graphics().setDepth(19);S.tCons=txt(W/2,92,'',{fontSize:'34px',color:'#eef1ff'}).setOrigin(.5);
        S.barra=S.add.graphics().setDepth(19);S.tBarra=txt(W/2,142,'',{fontSize:'20px',color:'#aab4e6',fontStyle:'600'}).setOrigin(.5);
        S.nuevaConsigna();S.pinta();
        S.aviso('¡Vamos!','Revienta las que cumplen la consigna',1400);
      }
      nuevaConsigna(){const S=this;let c;do c=tema(rnd);while(S.cons&&c.txt===S.cons.txt&&!prueba);S.cons=c;S.cuenta=0;
        S.rocas.forEach(r=>{r.fuera=true;S.tweens.add({targets:r.c,alpha:0,scale:.4,duration:250,onComplete:()=>r.c.destroy()})});S.rocas=[];
        S.tCons.setText(c.txt);const w=Math.max(260,S.tCons.width+60);S.cartel.clear();S.cartel.fillStyle(0x151d45,.92);S.cartel.fillRoundedRect(W/2-w/2,66,w,54,27);S.cartel.lineStyle(3,0x3dd6ff,1);S.cartel.strokeRoundedRect(W/2-w/2,66,w,54,27);
        if(!quieto)S.tweens.add({targets:S.tCons,scale:{from:1.35,to:1},duration:380,ease:'Back.out'});
        if(S.jefe)S.jefe.pecho.setText(c.corto)}
      pinta(){const S=this;S.tVidas.setText('♥'.repeat(S.vidas)+'♡'.repeat(3-S.vidas));S.tPuntos.setText(S.puntos+(S.racha>=3?`  🔥x${S.mult()}`:''));
        const jf=S.fase==='jefe',k=jf?S.jefe.vida/VIDA_JEFE:Math.min(1,S.buenas/META);S.barra.clear();S.barra.fillStyle(0x0c1633,1);S.barra.fillRoundedRect(150,160,300,12,6);
        S.barra.fillStyle(jf?0xee3b4f:0xffc83d,1);if(k>0)S.barra.fillRoundedRect(150,160,300*k,12,6);
        S.tBarra.setText(jf?P.jefe:`Hasta el guardián: ${Math.min(S.buenas,META)} de ${META}`);
        window._ARC={fase:S.fase,vidas:S.vidas,puntos:S.puntos,buenas:S.buenas,consigna:S.cons.txt,nave:{x:S.nave.x,y:S.nave.y},ancho:W,alto:H,
          jefe:S.jefe?{vida:S.jefe.vida,x:S.jefe.c.x}:null,rocas:S.rocas.filter(r=>!r.fuera).map(r=>({n:r.n,bueno:r.bueno,x:r.c.x,y:r.c.y}))}}
      mult(){return this.racha>=9?3:this.racha>=4?2:1}
      aviso(t,sub,ms,rojo){const S=this;if(S.cajaAviso)S.cajaAviso.destroy();
        const tt=S.add.text(0,0,t,{fontFamily:FUENTE,fontSize:'44px',fontStyle:'700',color:rojo?'#ff9aa8':'#ffc83d',align:'center'}).setOrigin(.5,1);
        const ts=S.add.text(0,8,sub||'',{fontFamily:FUENTE,fontSize:'27px',color:'#fff',align:'center',wordWrap:{width:W-110}}).setOrigin(.5,0);
        const h=tt.height+ts.height+44,w=Math.min(W-40,Math.max(tt.width,ts.width)+60),bg=S.add.graphics();
        bg.fillStyle(0x0b1230,.94);bg.fillRoundedRect(-w/2,-tt.height-22,w,h,22);bg.lineStyle(3,rojo?0xee3b4f:0x3dd6ff,1);bg.strokeRoundedRect(-w/2,-tt.height-22,w,h,22);
        S.cajaAviso=S.add.container(W/2,H*.44,[bg,tt,ts]).setDepth(30);if(!quieto)S.tweens.add({targets:S.cajaAviso,scale:{from:.7,to:1},duration:220,ease:'Back.out'});
        const caja=S.cajaAviso;S.time.delayedCall(ms,()=>{if(caja.active)S.tweens.add({targets:caja,alpha:0,duration:220,onComplete:()=>caja.destroy()})})}
      roca(x,y,vy,bueno){const S=this,n=S.cons.numero(rnd,bueno),im=S.add.image(0,0,'roca'+Math.floor(rnd()*3)).setScale(.95);
        const t=S.add.text(0,2,String(n),{fontFamily:FUENTE,fontSize:n>99?'34px':'40px',fontStyle:'700',color:'#fff',stroke:'#1d1438',strokeThickness:9}).setOrigin(.5);
        const c=S.add.container(x,y,[im,t]).setDepth(3);S.rocas.push({c,im,n,bueno:S.cons.cumple(n),vy,giro:(rnd()-.5)*1.4})}
      dano(motivo){const S=this;if(S.inv>0)return;S.vidas--;S.racha=0;S.fallos++;S.inv=1300;son('mal');
        if(!quieto)S.cameras.main.shake(220,.012);S.cameras.main.flash(160,238,59,79);
        S.tweens.add({targets:S.nave,alpha:.3,duration:120,yoyo:true,repeat:4,onComplete:()=>S.nave.setAlpha(1)});
        if(S.vidas<=0){S.fase='fin';S.pinta();S.aviso('¡Sin vidas!',motivo||'',2000,true);
          fin({gana:false,puntos:S.puntos,aciertos:S.buenas,fallos:S.fallos,monedas:S.monedas})}}
      update(_,dtReal){const S=this;if(S.fase==='fin'||S.fase==='gana')return;
        if(S.lento<1)S.lento=Math.min(1,S.lento+dtReal/1600);const dt=dtReal*S.lento/1000;S.inv=Math.max(0,S.inv-dtReal);
        S.est.tilePositionY-=40*dt;
        if(S.teclas){if(S.teclas.left.isDown)S.nave.x=Math.max(44,S.nave.x-520*dt);if(S.teclas.right.isDown)S.nave.x=Math.min(W-44,S.nave.x+520*dt)}
        /* Disparo automático */
        S.tiro-=dtReal;if(S.tiro<=0){S.tiro=290;S.balas.push(S.add.image(S.nave.x,S.nave.y-70,'bala').setDepth(4));son('disparo')}
        S.balas.forEach(b=>b.y-=1000*dt);
        /* Rocas: llegan de arriba (o las lanza el guardián) */
        S.sale-=dtReal*S.lento;const hay=S.rocas.filter(r=>!r.fuera).length;
        if(S.sale<=0&&(!prueba||hay===0)){
          if(S.fase==='rocas'){S.sale=prueba?500:Math.max(620,1050-S.buenas*22);const bueno=rnd()<.5;S.roca(60+rnd()*(W-120),-50,prueba?150:150+S.buenas*5+rnd()*50,bueno)}
          else if(S.fase==='jefe'){S.sale=prueba?500:1100;const bueno=rnd()<.55;S.roca(Phaser.Math.Clamp(S.jefe.c.x+(rnd()-.5)*160,60,W-60),S.jefe.c.y+90,prueba?160:190,bueno)}}
        for(const r of S.rocas){if(r.fuera)continue;r.c.y+=r.vy*dt;r.im.rotation+=r.giro*dt;
          if(r.c.y>H+60){r.fuera=true;r.c.destroy();if(r.bueno){S.racha=0;S.flota(r.c.x,H-60,'se escapó','#aab4e6')}continue}
          if(Math.abs(r.c.x-S.nave.x)<62&&Math.abs(r.c.y-S.nave.y)<70){r.fuera=true;S.boom.explode(10,r.c.x,r.c.y);r.c.destroy();
            if(r.bueno){S.racha=0;S.flota(S.nave.x,S.nave.y-90,'¡choque!','#ff9aa8')}S.dano('Te ha dado una roca. Muévete para esquivarlas.');continue}
          for(const b of S.balas){if(b.active&&Math.abs(b.x-r.c.x)<46&&Math.abs(b.y-r.c.y)<50){b.destroy();S.golpe(r);break}}}
        S.rocas=S.rocas.filter(r=>!r.fuera);S.balas=S.balas.filter(b=>{if(b.active&&b.y<-40)b.destroy();return b.active});
        /* El guardián */
        if(S.fase==='jefe'&&S.jefe.listo){const j=S.jefe;j.t+=dt;j.c.x=W/2+Math.sin(j.t*.9)*(W/2-120);
          for(const b of S.balas){if(b.active&&Math.abs(b.x-j.c.x)<90&&Math.abs(b.y-j.c.y)<80){b.destroy();S.chispas.explode(5,b.x,j.c.y+60);if(j.clang<=0){son('clang');j.clang=400;if(!j.dicho){j.dicho=1;S.flota(j.c.x,j.c.y+120,'¡Escudo! Revienta sus rocas buenas','#3dd6ff')}}}}
          j.clang-=dtReal;if(!prueba){j.dispara-=dtReal;if(j.dispara<=0){j.dispara=2300-Math.min(900,(VIDA_JEFE-j.vida)*90);son('laser');S.laseres.push(S.add.image(j.c.x,j.c.y+70,'laser').setDepth(4))}}}
        S.laseres.forEach(l=>{l.y+=380*dt;if(l.active&&Math.abs(l.x-S.nave.x)<34&&Math.abs(l.y-S.nave.y)<70){l.destroy();S.dano('Te ha dado un láser del guardián.')}});
        S.laseres=S.laseres.filter(l=>{if(l.active&&l.y>H+40)l.destroy();return l.active});
        S.pinta()}
      flota(x,y,t,col){const S=this,f=S.add.text(x,y,t,{fontFamily:FUENTE,fontSize:'26px',fontStyle:'700',color:col||'#ffc83d',stroke:'#0b1230',strokeThickness:6}).setOrigin(.5).setDepth(25);
        S.tweens.add({targets:f,y:y-60,alpha:0,duration:quieto?700:900,onComplete:()=>f.destroy()})}
      golpe(r){const S=this;r.fuera=true;
        if(r.bueno){S.racha++;const p=10*S.mult();S.puntos+=p;S.buenas++;son('roca');S.boom.explode(quieto?8:18,r.c.x,r.c.y);S.flota(r.c.x,r.c.y-40,'+'+p);r.c.destroy();
          if(S.buenas%3===0){S.monedas++;son('moneda');S.flota(r.c.x,r.c.y-80,'+1 🪙','#ffc83d')}
          if(S.fase==='rocas'){S.cuenta++;if(S.buenas>=META)return S.llegaJefe();if(S.cuenta>=CAMBIO)S.time.delayedCall(350,()=>{if(S.fase==='rocas')S.nuevaConsigna()})}
          else if(S.fase==='jefe')S.pegaJefe();return}
        /* Roca mala: pierde una vida y ve por qué */
        S.tweens.add({targets:r.c,alpha:0,scale:1.4,duration:300,onComplete:()=>r.c.destroy()});r.im.setTint(0xee3b4f);S.lento=.3;
        api.repasa(P.b);S.aviso('¡Esa no!',S.cons.explica(r.n),2600,true);S.dano()}
      llegaJefe(){const S=this;S.fase='espera';S.rocas.forEach(r=>{r.fuera=true;S.tweens.add({targets:r.c,alpha:0,duration:250,onComplete:()=>r.c.destroy()})});S.rocas=[];son('jefe');
        S.aviso('¡Llega el guardián!','Rompe su escudo reventando las rocas buenas que lanza',1800);
        const im=S.add.image(0,0,'robot').setScale(.85),pecho=S.add.text(0,40,S.cons.corto,{fontFamily:FUENTE,fontSize:'30px',fontStyle:'700',color:'#3dd6ff'}).setOrigin(.5);
        const c=S.add.container(W/2,-160,[im,pecho]).setDepth(6);S.jefe={c,im,pecho,vida:VIDA_JEFE,t:0,listo:false,clang:0,dispara:2600};
        S.tweens.add({targets:c,y:290,duration:quieto?300:1300,ease:'Cubic.out',onComplete:()=>{S.jefe.listo=true;S.fase='jefe';S.sale=900;if(!quieto)S.tweens.add({targets:im,scaleX:.9,scaleY:.8,duration:600,yoyo:true,repeat:-1,ease:'Sine.inOut'})}})}
      pegaJefe(){const S=this,j=S.jefe;j.vida--;j.im.setTint(0xff7a8a);S.time.delayedCall(140,()=>j.im.clearTint());S.chispas.explode(12,j.c.x,j.c.y+40);if(!quieto)S.cameras.main.shake(120,.006);
        if(j.vida>0){if(j.vida%4===0)S.time.delayedCall(300,()=>{if(S.fase==='jefe')S.nuevaConsigna()});return}
        S.fase='gana';S.monedas+=10;S.puntos+=100;S.pinta();son('gana');S.boom.explode(40,j.c.x,j.c.y);S.tweens.add({targets:j.c,alpha:0,scale:1.6,angle:20,duration:700});
        S.laseres.forEach(l=>l.destroy());S.rocas.forEach(r=>r.c.destroy());S.rocas=[];
        S.aviso('¡Guardián vencido!',`+100 puntos · +10 🪙`,1400);fin({gana:true,puntos:S.puntos,aciertos:S.buenas,fallos:S.fallos,monedas:S.monedas})}
    }}

  mapa();
}
(window.ARCADE=window.ARCADE||{}).cohete={start};
})();
