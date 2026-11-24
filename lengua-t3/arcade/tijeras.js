/* =====================================================================
   Misión Estudio · arcade de Lengua U3 · ✂️ TIJERAS DE SÍLABAS (24-nov)
   Elegido por el padre en el artefacto «Juego de Lengua de 5º» (ronda 2, J1). Juego de acción:
   las palabras cruzan la pantalla flotando y se cortan por sus sílabas deslizando el dedo entre las letras
   (o tocando el hueco). Cada corte es para siempre: un corte que no va (dentro de un diptongo, o donde no hay
   sílaba) rompe la tijera, cuesta una vida y la palabra queda para repasar. Si una palabra se escapa sin cortar
   del todo, también cuesta una vida. Cuatro mundos: palabras sueltas, diptongos (no se cortan), hiatos (sí)
   y mezcla con triptongos. Al final de cada mundo, el guardián: un verso para medir (sinalefa, +1 aguda,
   −1 esdrújula), con tres burbujas de número. Vencer a un guardián da la estrella del arcade.
   Las palabras salen de las listas del juego (HIATOS, DIPTONGOS, TRIPTONGOS y VERSOS de lengua-t3).
   Usa Phaser 3 y ZzFX (vendor/). Lo común (XP, monedas, récords, estrella, «para repasar») lo pone el motor con api.
   Modo prueba (?prueba o window.ARCADE_PRUEBA): semilla fija, partida corta y el estado en window._TIJ para el verificador.
   ===================================================================== */
(()=>{
const W=600,H=900;
const SUELTAS=['ca-sa','pe-lo-ta','ma-ri-po-sa','ven-ta-na','li-bro','ár-bol','ca-mión','lá-piz','te-lé-fo-no','pá-ja-ro','es-tre-lla','plá-ta-no','ca-ra-col','bo-ca-di-llo','mon-ta-ña','ca-ba-llo','pa-ra-guas'];
const lista=n=>{try{return (0,eval)(n)}catch(e){return []}};
const MUNDOS=[
  {k:'sueltas',n:'Palabras sueltas',cielo:'#1a1450',col:0xffc83d,b:'dip',pista:'Corta cada palabra por sus sílabas',pal:()=>SUELTAS},
  {k:'dipt',n:'Diptongos',cielo:'#0f2f4a',col:0x3dd6ff,b:'dip',pista:'¡Los diptongos no se cortan!',pal:()=>lista('DIPTONGOS')},
  {k:'hiato',n:'Hiatos',cielo:'#3a1440',col:0xff7ab0,b:'dip',pista:'Los hiatos sí se cortan: dos vocales, dos sílabas',pal:()=>lista('HIATOS')},
  {k:'mezcla',n:'Mezcla y triptongos',cielo:'#14361f',col:0x7ef0a8,b:'dip',pista:'Ojo: diptongos, hiatos y triptongos mezclados',pal:()=>[...lista('DIPTONGOS'),...lista('HIATOS'),...lista('TRIPTONGOS')]}];
const SON={corte:[.3,0,900,0,.02,.05,0,1.8,,,600,.01],parte:[.4,.05,520,0,.05,.2,0,1,,,300,.05],mal:[.4,0,150,.01,.12,.3,2,1,-3],
  jefe:[.5,.05,90,.02,.25,.5,4,1,-1],golpe:[.45,.05,160,0,.05,.25,4,1,-4],gana:[.45,0,520,.02,.25,.4,0,1,,,260,.08,.1]};
const semilla=s=>()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296};
const silabas=h=>{const p=h.split('-'),c=[];let n=0;p.slice(0,-1).forEach(x=>{n+=[...x].length;c.push(n)});return{w:p.join(''),c,h}};

let CSS=false;
function estilos(){if(CSS)return;CSS=true;const s=document.createElement('style');s.textContent=`
.tij .mundos{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:12px 0}
.tij .mu{position:relative;border-radius:16px;padding:14px;min-height:96px;text-align:left;color:#fff;border:2px solid rgba(255,255,255,.2);background:linear-gradient(160deg,var(--c),#0b1230);cursor:pointer;font:inherit;display:grid;gap:4px;align-content:end}
.tij .mu b{font-family:var(--ft);font-size:18px}.tij .mu small{color:#cdd6ff}.tij .mu .ok{position:absolute;top:8px;right:10px}
.tij-juego{display:grid;gap:8px}.tij-barra{display:flex;justify-content:space-between;align-items:center;gap:10px}.tij-barra b{font-family:var(--ft);font-size:17px}
.tij-caja{position:relative;border-radius:18px;overflow:hidden;background:#0a1030;max-width:520px;width:100%;margin:0 auto;aspect-ratio:${W}/${H}}
#tijLienzo,#tijLienzo canvas{width:100%;height:100%;display:block;touch-action:none}
.tij-emp{position:absolute;inset:0;display:grid;align-content:center;justify-items:center;gap:12px;text-align:center;padding:20px;background:rgba(7,11,36,.88);color:#eef1ff;z-index:5}
.tij-emp h3{margin:0;font-family:var(--ft);font-size:26px}.tij-emp p{margin:0;max-width:34ch;line-height:1.45}.tij-emp .btn{font-size:22px;padding:14px 30px}`;document.head.appendChild(s)}

function start(api){estilos();const J=api.estado;J.vencidos=J.vencidos||{};
  const caja=api.caja,esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function mapa(){window._TIJ=null;
    caja.innerHTML=`<div class="box tij"><h2>✂️ Tijeras de sílabas</h2>
    <p class="sub">Las palabras cruzan flotando: desliza el dedo entre sus sílabas para cortarlas (o toca el hueco). Cada corte es para siempre: si cortas donde no va, pierdes una vida. ¡Un diptongo no se corta! Al final de cada mundo, el guardián te pide medir un verso.</p>
    <div class="mundos">${MUNDOS.map(m=>`<button class="mu" data-p="${m.k}" style="--c:${m.cielo}">${J.vencidos[m.k]?'<span class="ok" aria-label="conquistado">🏆</span>':''}<b>${esc(m.n)}</b><small>Récord: ${api.mejor(m.k)}</small></button>`).join('')}</div>
    <button class="btn sec" id="tijArc">🎮 Arcade</button></div>`;
    caja.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>jugar(MUNDOS.find(m=>m.k===b.dataset.p)));
    caja.querySelector('#tijArc').onclick=api.salir}

  function jugar(M){
    caja.innerHTML=`<div class="tij-juego"><div class="tij-barra"><b>✂️ ${esc(M.n)}</b><button class="btn sec" id="tijSalir" style="margin:0;padding:8px 14px">✕ Salir</button></div>
      <div class="tij-caja"><div id="tijLienzo" aria-label="Juego de las tijeras: desliza el dedo entre las sílabas de las palabras que flotan"></div>
      <div class="tij-emp" id="tijEmp"><h3>${esc(M.n)}</h3><p>${esc(M.pista)}. Desliza el dedo entre dos sílabas para cortar, o toca el hueco. Si una palabra se escapa sin cortar, pierdes una vida.</p>
      <button class="btn" id="tijGo" disabled>Empezar ▶</button></div></div></div>`;
    let juego=null,acabado=false;
    const cierra=()=>{if(juego){juego.destroy(true);juego=null}window._TIJ=null};
    api.alSalir(cierra);
    caja.querySelector('#tijSalir').onclick=()=>{acabado=true;cierra();mapa()};
    Promise.resolve(document.fonts?document.fonts.ready:null).then(()=>{
      if(!document.getElementById('tijLienzo'))return;
      juego=new Phaser.Game({type:Phaser.AUTO,parent:'tijLienzo',width:W,height:H,backgroundColor:M.cielo,banner:false,audio:{noAudio:true},
        scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},input:{activePointers:2},scene:[escena(M,fin)]});
      const go=caja.querySelector('#tijGo');go.disabled=false;go.focus();
      go.onclick=()=>{const S=juego&&juego.scene.getScene('tijeras');if(!S||!S.empieza)return;caja.querySelector('#tijEmp').remove();S.empieza()}});
    function fin(o){if(acabado)return;acabado=true;
      if(o.gana){J.vencidos[M.k]=1;api.guarda()}const estrella=o.gana&&api.estrella();
      setTimeout(()=>{cierra();api.fin({ic:o.gana?'🏆':'✂️',titulo:o.gana?'¡Mundo conquistado!':'¡Fin de la partida!',gana:o.gana,
        lineas:`${o.puntos} puntos · ${o.aciertos} palabras cortadas${o.fallos?` · ${o.fallos} fallo${o.fallos>1?'s':''}`:''}${estrella?'<br>⭐ ¡Estrella del arcade!':''}`,
        clave:M.k,puntos:o.puntos,monedas:o.monedas,otra:()=>jugar(M)})},o.gana?1400:900)}
  }

  /* ---------- La partida ---------- */
  function escena(M,fin){
    const prueba=api.prueba,rnd=prueba?semilla(5):Math.random,quieto=api.quieto;
    const META=prueba?3:12,VIDA_JEFE=prueba?2:5,VEL=prueba?26:42;
    const son=k=>{if(api.sonido()&&window.zzfx)try{zzfx(...SON[k])}catch(e){}};
    const mezcla=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
    let bolsa=[];const otra=()=>{if(!bolsa.length)bolsa=mezcla(M.pal().map(silabas).filter(x=>x.c.length));return bolsa.pop()};
    const versos=()=>mezcla(lista('VERSOS').filter(v=>v[1]>=4&&v[1]<=10));
    return class extends Phaser.Scene{
      constructor(){super('tijeras')}
      create(){const S=this;S.fase='listo';S.vidas=3;S.puntos=0;S.monedas=0;S.hechas=0;S.fallos=0;S.pals=[];S.sale=0;S.id=0;S.vv=versos();
        const g=S.add.graphics();for(let i=0;i<70;i++){g.fillStyle(0xffffff,.25+rnd()*.5);g.fillCircle(rnd()*W,rnd()*H,rnd()*1.8+.4)}
        S.tHud=S.add.text(18,16,'',{fontFamily:'Fredoka, sans-serif',fontSize:'26px',color:'#ffffff'}).setDepth(20);
        S.tPista=S.add.text(W/2,64,M.pista,{fontFamily:'Fredoka, sans-serif',fontSize:'24px',color:'#ffe9a8',align:'center',wordWrap:{width:W-40}}).setOrigin(.5,0).setDepth(20);
        S.trazo=S.add.graphics().setDepth(15);S.boom=S.add.particles(0,0,(()=>{const t=S.make.graphics({x:0,y:0,add:false});t.fillStyle(0xffffff);t.fillCircle(4,4,4);t.generateTexture('chispa',8,8);t.destroy();return 'chispa'})(),
          {speed:{min:80,max:260},lifespan:450,scale:{start:1,end:0},tint:[M.col,0xffffff],emitting:false});
        S.input.on('pointerdown',p=>{S.ult={x:p.x,y:p.y};S.toque(p.x,p.y)});
        S.input.on('pointermove',p=>{if(!p.isDown||!S.ult)return;S.cruza(S.ult.x,S.ult.y,p.x,p.y);
          if(!quieto){S.trazo.lineStyle(4,0xffffff,.8);S.trazo.lineBetween(S.ult.x,S.ult.y,p.x,p.y);S.time.delayedCall(120,()=>S.trazo.clear())}S.ult={x:p.x,y:p.y}});
        S.input.on('pointerup',()=>{S.ult=null});
        S.pinta();S.estado()}
      empieza(){this.fase='juego';this.sale=0;this.estado()}
      pinta(){this.tHud.setText(`${'♥'.repeat(this.vidas)}${'♡'.repeat(3-this.vidas)}   ✂️ ${this.hechas}/${META}   ${this.puntos} pts`)}
      estado(){const S=this;window._TIJ={fase:S.fase,vidas:S.vidas,puntos:S.puntos,hechas:S.hechas,meta:META,ancho:W,alto:H,
        palabras:S.pals.filter(p=>!p.fuera).map(p=>({id:p.id,w:p.d.w,gaps:p.gaps.map(g=>({x:p.c.x+g.x,y:p.c.y,ok:p.d.c.includes(g.k),cortado:g.cortado}))})),
        jefe:S.jefe&&S.jefe.burbujas?{vida:S.jefe.vida,verso:S.jefe.v&&S.jefe.v[0],burbujas:S.jefe.burbujas.map(b=>({x:b.c.x,y:b.c.y,ok:b.ok}))}:null}}
      nueva(){const S=this,d=otra();if(!d)return;const L=[...d.w],st={fontFamily:'Fredoka, sans-serif',fontSize:'52px',color:'#0b1230',fontStyle:'600'};
        const letras=L.map(ch=>S.add.text(0,0,ch,st).setOrigin(0,.5));const sep=14;let x=0;const pos=[];
        letras.forEach((t,i)=>{if(i)x+=sep;t.x=x;pos.push(x);x+=t.width});const ancho=x;letras.forEach(t=>t.x-=ancho/2);
        const fondo=S.add.graphics();fondo.fillStyle(M.col,1);fondo.fillRoundedRect(-ancho/2-22,-40,ancho+44,80,40);
        const gaps=[];for(let k=1;k<L.length;k++){const gx=pos[k]-sep/2-ancho/2;gaps.push({k,x:gx,cortado:false})}
        const marcas=S.add.graphics();
        const carriles=[230,380,530,680],y=carriles[S.id%4];
        const c=S.add.container(W+ancho/2+30,y,[fondo,...letras,marcas]).setDepth(5);
        S.pals.push({id:++S.id,d,c,gaps,marcas,ancho,letras,fuera:false,vel:VEL*(0.9+rnd()*.3)});S.estado()}
      /* Un toque cerca de un hueco lo corta */
      toque(x,y){if(this.fase==='jefe')return this.tocaBurbuja(x,y);if(this.fase!=='juego')return;
        for(const p of this.pals){if(p.fuera)continue;for(const g of p.gaps){if(!g.cortado&&Math.abs(p.c.x+g.x-x)<16&&Math.abs(p.c.y-y)<44)return this.corta(p,g)}}}
      /* Un trazo que cruza el hueco de arriba abajo (o al revés) también corta */
      cruza(x1,y1,x2,y2){if(this.fase!=='juego')return;
        for(const p of this.pals){if(p.fuera)continue;const top=p.c.y-44,bot=p.c.y+44;if(Math.max(y1,y2)<top||Math.min(y1,y2)>bot)continue;
          for(const g of p.gaps){if(g.cortado)continue;const gx=p.c.x+g.x;if(gx>=Math.min(x1,x2)-16&&gx<=Math.max(x1,x2)+16&&Math.abs(x2-x1)<60&&Math.abs(y2-y1)>6)this.corta(p,g)}}}
      corta(p,g){const S=this;if(p.fuera||g.cortado)return;g.cortado=true;
        if(!p.d.c.includes(g.k)){p.marcas.lineStyle(6,0xee3b4f);p.marcas.lineBetween(g.x-p.ancho/2*0,-38,g.x,38);return S.falla(p,'¡Ese corte no va! Es '+p.d.h+'.')}
        son('corte');p.marcas.lineStyle(5,0xffffff);p.marcas.lineBetween(g.x,-36,g.x,36);
        if(p.d.c.every(k=>p.gaps.find(x=>x.k===k).cortado))S.parte(p);S.estado()}
      parte(p){const S=this;p.fuera=true;son('parte');S.hechas++;S.puntos+=10+p.d.c.length*5;if(S.hechas%4===0)S.monedas++;
        S.boom.explode(16,p.c.x,p.c.y);
        if(!quieto)S.tweens.add({targets:p.c,alpha:0,scale:1.25,duration:380,onComplete:()=>p.c.destroy()});else p.c.destroy();
        S.flota(p.d.h,p.c.x,p.c.y);S.pinta();if(S.hechas>=META)S.time.delayedCall(700,()=>S.llegaJefe())}
      flota(txt,x,y,col){const t=this.add.text(Math.min(W-80,Math.max(80,x)),y,txt,{fontFamily:'Fredoka, sans-serif',fontSize:'34px',color:col||'#ffffff'}).setOrigin(.5).setDepth(25);
        this.tweens.add({targets:t,y:y-70,alpha:0,duration:quieto?600:1300,onComplete:()=>t.destroy()})}
      falla(p,msg){const S=this;son('mal');S.fallos++;S.vidas--;api.repasa(M.b);if(!quieto)S.cameras.main.shake(160,.008);
        if(p){p.fuera=true;S.tweens.add({targets:p.c,alpha:0,duration:quieto?100:700,delay:300,onComplete:()=>p.c.destroy()})}
        S.flota(msg,W/2,p?p.c.y:H/2,'#ffb3bd');S.pinta();S.estado();
        if(S.vidas<=0){S.fase='fin';S.time.delayedCall(900,()=>fin({gana:false,puntos:S.puntos,aciertos:S.hechas,fallos:S.fallos,monedas:S.monedas}))}}
      /* ---------- El guardián: un verso para medir ---------- */
      llegaJefe(){const S=this;if(S.fase!=='juego')return;S.fase='jefe';S.pals.forEach(p=>{if(!p.fuera){p.fuera=true;p.c.destroy()}});S.pals=[];son('jefe');
        const cuerpo=S.add.graphics();cuerpo.fillStyle(0xc0c6e8);cuerpo.fillCircle(-40,40,30);cuerpo.fillCircle(40,40,30);cuerpo.fillStyle(0x0a1030);cuerpo.fillCircle(-40,40,14);cuerpo.fillCircle(40,40,14);
        cuerpo.fillStyle(0xdfe4ff);cuerpo.fillTriangle(-26,20,-6,-110,8,-100);cuerpo.fillTriangle(26,20,6,-110,-8,-100);cuerpo.fillStyle(M.col);cuerpo.fillCircle(0,8,9);
        S.jefe={vida:VIDA_JEFE,c:S.add.container(W/2,250,[cuerpo]).setDepth(6)};
        S.tJefe=S.add.text(W/2,120,'',{fontFamily:'Fredoka, sans-serif',fontSize:'26px',color:'#ffffff'}).setOrigin(.5).setDepth(20);
        S.tPista.setText('El guardián: ¿cuántas sílabas mide el verso?');S.pregunta()}
      pregunta(){const S=this,j=S.jefe;if(j.burbujas)j.burbujas.forEach(b=>b.c.destroy());if(j.tV)j.tV.destroy();
        const v=S.vv.pop()||['La luna brilla',5];if(!S.vv.length)S.vv=versos();j.v=v;
        S.tJefe.setText(`Guardián: ${'■'.repeat(j.vida)}${'□'.repeat(VIDA_JEFE-j.vida)}`);
        j.tV=S.add.text(W/2,410,`«${v[0]}»`,{fontFamily:'Fredoka, sans-serif',fontSize:'34px',color:'#ffe9a8',align:'center',wordWrap:{width:W-60}}).setOrigin(.5).setDepth(20);
        const malas=mezcla([v[1]-1,v[1]+1,v[1]+2,v[1]-2].filter(n=>n>0&&n!==v[1])).slice(0,2);
        const nums=mezcla([v[1],...malas]);
        j.burbujas=nums.map((n,i)=>{const b=S.add.graphics();b.fillStyle(0xffffff,.95);b.fillCircle(0,0,58);b.lineStyle(6,M.col);b.strokeCircle(0,0,58);
          const t=S.add.text(0,0,String(n),{fontFamily:'Fredoka, sans-serif',fontSize:'48px',color:'#0b1230',fontStyle:'700'}).setOrigin(.5);
          const c=S.add.container(110+i*190,640,[b,t]).setDepth(8);if(!quieto)S.tweens.add({targets:c,y:620,duration:900+i*150,yoyo:true,repeat:-1,ease:'Sine.inOut'});
          return{c,n,ok:n===v[1]}});S.estado()}
      tocaBurbuja(x,y){const S=this,j=S.jefe;if(!j||!j.burbujas||S.espera)return;const b=j.burbujas.find(b=>Math.hypot(b.c.x-x,b.c.y-y)<64);if(!b)return;
        S.espera=true;
        if(b.ok){son('golpe');j.vida--;S.puntos+=20;S.boom.explode(20,j.c.x,j.c.y);if(!quieto)S.tweens.add({targets:j.c,angle:{from:-12,to:0},duration:300});
          S.flota('¡Bien medido! '+b.n+' sílabas',W/2,520,'#9ff0c3');S.pinta();
          if(j.vida<=0){S.fase='gana';S.monedas+=10;S.puntos+=100;S.pinta();son('gana');S.tweens.add({targets:j.c,alpha:0,scale:1.6,duration:700});
            j.burbujas.forEach(b=>b.c.destroy());j.burbujas=null;S.estado();return fin({gana:true,puntos:S.puntos,aciertos:S.hechas,fallos:S.fallos,monedas:S.monedas})}
          S.time.delayedCall(prueba?200:900,()=>{S.espera=false;if(S.fase==='jefe')S.pregunta()});return}
        const ex=(lista('VERSOS').find(v=>v[0]===j.v[0])||[])[2]||'';S.falla(null,`Mide ${j.v[1]}. ${ex}`);
        S.time.delayedCall(prueba?300:2600,()=>{S.espera=false;if(S.fase==='jefe')S.pregunta()})}
      update(t,dt){const S=this;if(S.fase!=='juego')return;S.sale-=dt;
        const vivas=S.pals.filter(p=>!p.fuera).length;if(S.sale<=0&&vivas<(prueba?1:2)&&S.hechas+vivas<META){S.nueva();S.sale=prueba?600:2600}
        for(const p of S.pals){if(p.fuera)continue;p.c.x-=p.vel*dt/1000;
          if(p.c.x+p.ancho/2+22<0){S.falla(p,'Se ha escapado: '+p.d.h)}}
        S.pals=S.pals.filter(p=>!p.fuera||p.c.active);
        S.tick=(S.tick||0)+dt;if(S.tick>120){S.tick=0;S.estado()}}
    }}

  mapa();
}
(window.ARCADE=window.ARCADE||{}).tijeras={start};
})();
