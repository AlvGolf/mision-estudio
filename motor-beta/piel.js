/* =====================================================================
   Misión Estudio · piel común (21-nov)
   Lo que comparten los juegos y el menú de la suite: el estilo según la hora, la app
   instalable, el personaje guía y los sonidos. Se carga antes que motor.js (en los juegos,
   después de su <script> de datos) y también en el menú, que define un JUEGO mínimo
   ({estilo, curso}). No usa nada de ninguna asignatura.
   ===================================================================== */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
/* ================== ESTILO VISUAL (rediseño, 20-nov) ==================
   El estilo cambia con la hora real: mañana (7 a 15) de día, tarde (15 a 20) al atardecer y noche (20 a 7).
   Cada juego lleva su grupo (JUEGO.estilo, de 0 a 5), así dos juegos seguidos no se ven iguales; el cómic (B) entra en los tres momentos.
   JUEGO.curso (2 o 5) pone el estilo de 2º, más grande y con más color. Para ver uno a propósito: ?estilo=C2 y ?hora=9 en la dirección. */
const ESTILOS={manana:['D1','B1','D2','D3','B3','B2'],tarde:['A1','A2','B2','A3','B1','B3'],noche:['C1','C2','C3','B3','B2','B1']};
const ESTILO_LETRAS={A:'Baloo+2:wght@600;700;800',B:'Lilita+One',C:'Fredoka:wght@500;600;700',D:'Baloo+2:wght@600;700;800',B2:'Bangers',D2:'Lilita+One',D3:'Fredoka:wght@500;600;700',c2:'Luckiest+Guy'};
function parametro(k){try{return new URLSearchParams(location.search).get(k)}catch(e){return null}}
function momentoAhora(){const p=parametro('hora'),h=p!=null&&p!==''&&!isNaN(+p)?+p:new Date().getHours();return h>=7&&h<15?'manana':h>=15&&h<20?'tarde':'noche'}
function luzAhora(){return{manana:'dia',tarde:'atardecer',noche:'noche'}[momentoAhora()]}
function estiloAhora(){const q=(parametro('estilo')||'').toUpperCase();if(/^[ABCD][123]$/.test(q))return q;return ESTILOS[momentoAhora()][(((JUEGO.estilo|0)%6)+6)%6]}
function aplicaEstilo(){const e=estiloAhora(),h=document.documentElement,c2=String(parametro('curso')||JUEGO.curso||5)==='2';
  if(h.dataset.estilo===e&&h.classList.contains('c2')===c2)return;
  h.dataset.estilo=e;h.dataset.fam=e[0];h.classList.toggle('c2',c2);
  const fams=['Nunito:wght@400;600;700;800',ESTILO_LETRAS[e]||ESTILO_LETRAS[e[0]],'Fraunces:opsz,wght@9..144,600'];if(c2&&(e[0]==='B'||e==='D2'))fams.push(ESTILO_LETRAS.c2);
  const href='https://fonts.googleapis.com/css2?family='+fams.join('&family=')+'&display=swap';
  let tc=document.querySelector('meta[name="theme-color"]');if(!tc){tc=document.createElement('meta');tc.name='theme-color';document.head.appendChild(tc)}tc.content={A:'#2b2357',B:'#18214a',C:'#0e1636',D:'#7cc6f2'}[e[0]];
  let l=document.getElementById('estilo-letras');if(!l){l=document.createElement('link');l.id='estilo-letras';l.rel='stylesheet';document.head.appendChild(l)}if(l.href!==href)l.href=href}
aplicaEstilo();

/* ================== EL MAPA DE LA RUTA (23-nov, el padre) ==================
   Se ilumina cada bloque terminado, se haya jugado en la ruta o suelto; el cohete va al último bloque terminado
   (si no hay ninguno, en la primera estación) y un tramo de línea solo se ilumina si están hechos los dos bloques que une.
   n estaciones · i: por dónde va la ruta · fin: ruta terminada · hecho(k) y corte(k) de cada estación. */
function rutaEstado(n,i,fin,hecho,corte){const D=[...Array(n)].map((_,k)=>!!fin||k<i||!!hecho(k));let ult=-1;D.forEach((d,k)=>{if(d)ult=k});
  const sig=D.indexOf(false),c=Math.max(ult,0);
  return {D,cohete:c,now:ult<0?0:sig,completa:sig<0,tramo:k=>D[k]&&!!D[k+1],aparca:ult>=0&&!!corte(c)&&c<n-1&&!D[c+1]}}

/* ================== MARCA (21-nov, rondas 8 a 10 del artefacto «Logo de Misión Estudio») ==================
   Opción B, equilibrada: el ME en la cabecera, la portada de cada juego, el boletín y el sello; nada mientras se estudia.
   Los archivos están en /marca/. A color en los estilos claros (familia D, la mañana) y en blanco en los oscuros. */
const MARCA=new URL('../marca/',(document.currentScript||{}).src||location.href).href;
const ES_BETA=/motor-beta\//.test((document.currentScript||{}).src||'');
function logoMarca(n,alt,h){return `<span class="lgm" style="--lgh:${h}px"${alt?` role="img" aria-label="${alt}"`:' aria-hidden="true"'}><img class="lg-neg" src="${MARCA}${n}-negativo.svg" alt=""><img class="lg-col" src="${MARCA}${n}-color.svg" alt=""></span>`}
function selloMarca(h){return `<span class="lgm sello-m" style="--lgh:${h}px" role="img" aria-label="Misión cumplida"><img class="lg-neg" src="${MARCA}sello-animado-negativo.svg?${Date.now()}" alt=""><img class="lg-col" src="${MARCA}sello-animado-color.svg?${Date.now()}" alt=""></span>`}
/* El cohete que sale del libro (el icono que eligió el padre el 21-nov) es ahora el símbolo del avance: ficha del mapa, botón de la ruta y despegue */
const COHETE_SVG=`<svg class="cohete" viewBox="140 56 232 350" aria-hidden="true"><path d="M224 352 q32 -30 64 0 q-8 30 -32 46 q-24 -16 -32 -46z" fill="#ffb02e" stroke="#1d2033" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/><path d="M240 352 q16 -14 32 0 q-4 16 -16 26 q-12 -10 -16 -26z" fill="#fff3c4"/><path d="M256 70 q70 60 62 196 h-124 q-8 -136 62 -196z" fill="#fff" stroke="#1d2033" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/><path d="M194 210 q-48 26 -46 92 l52 -26z M318 210 q48 26 46 92 l-52 -26z" fill="#ff5c6c" stroke="#1d2033" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/><path d="M206 266 h100 l-10 46 h-80z" fill="#ff5c6c" stroke="#1d2033" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/><circle cx="256" cy="168" r="34" fill="#7fd3ff" stroke="#1d2033" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/><circle cx="246" cy="158" r="9" fill="#fff" opacity=".8"/></svg>`;
const DESPEGUE_SVG=`<svg viewBox="96 56 320 400" aria-hidden="true"><path d="M256 362 C214 338 156 334 112 344 V420 C156 410 214 414 256 440 Z" fill="#fff" stroke="#1d2033" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/><path d="M256 362 C298 338 356 334 400 344 V420 C356 410 298 414 256 440 Z" fill="#e8eeff" stroke="#1d2033" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/><g class="vuela"><path d="M224 352 q32 -30 64 0 q-8 30 -32 46 q-24 -16 -32 -46z" fill="#ffb02e" stroke="#1d2033" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/><path d="M240 352 q16 -14 32 0 q-4 16 -16 26 q-12 -10 -16 -26z" fill="#fff3c4"/><path d="M256 70 q70 60 62 196 h-124 q-8 -136 62 -196z" fill="#fff" stroke="#1d2033" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/><path d="M194 210 q-48 26 -46 92 l52 -26z M318 210 q48 26 46 92 l-52 -26z" fill="#ff5c6c" stroke="#1d2033" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/><path d="M206 266 h100 l-10 46 h-80z" fill="#ff5c6c" stroke="#1d2033" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/><circle cx="256" cy="168" r="34" fill="#7fd3ff" stroke="#1d2033" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/><circle cx="246" cy="158" r="9" fill="#fff" opacity=".8"/></g></svg>`;
/* Animación de entrada: la primera vez que se abre la app cada día (unos 3 s; se salta tocando).
   21-nov, el padre eligió la E3 · versión 2 del artefacto del logo (ronda 11): el contorno del ME se dibuja a lápiz mientras
   «Misión Estudio» entra ya relleno, se rellena el ME, sale el descriptor, se dibuja el visto y cruza un brillo.
   Se hace con el propio dibujo (marca/descriptor-negativo.svg), no con vídeo: azul sobre claro por la mañana y blanco el resto.
   Si el dispositivo pide menos movimiento, el logo quieto un momento. Sin el dibujo (sin conexión la primera vez), no sale. */
function entradaMarca(){let hoy=new Date().toISOString().slice(0,10),ya=null;try{ya=localStorage.getItem('mision_entrada')}catch(e){}
  if(ya===hoy||/[?&]sinentrada/.test(location.search))return;
  const quieto=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  fetch(MARCA+'descriptor-negativo.svg').then(r=>r.ok?r.text():Promise.reject()).then(txt=>{
    const p=[...txt.matchAll(/<path d="([^"]+)"/g)].map(m=>m[1]);if(p.length!==4)return;
    try{localStorage.setItem('mision_entrada',hoy)}catch(e){}
    const d=document.createElement('div');d.className='entrada-m'+(quieto?' quieto':'');d.setAttribute('role','button');d.setAttribute('aria-label','Misión Estudio. Toca para saltar');
    d.innerHTML=`<svg viewBox="-72.8 9.3 315.9 183.3" aria-hidden="true"><defs>
      <linearGradient id="ent-b" x1="0" x2="1"><stop offset="0" class="ent-bs" stop-opacity="0"/><stop offset=".5" class="ent-bs" stop-opacity=".9"/><stop offset="1" class="ent-bs" stop-opacity="0"/></linearGradient>
      <clipPath id="ent-c"><path d="${p[0]}"/><path d="${p[1]}"/><path d="${p[2]}"/><path d="${p[3]}"/></clipPath>
      <mask id="ent-m" maskUnits="userSpaceOnUse" x="-80" y="0" width="330" height="200"><path class="ent-vm" d="M30 45 L60 94 L124 17" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></mask></defs>
      <path class="ent-me" d="${p[0]}" pathLength="1"/><path class="ent-n" d="${p[2]}"/><path class="ent-d" d="${p[3]}"/><path class="ent-v" d="${p[1]}" mask="url(#ent-m)"/>
      <g clip-path="url(#ent-c)"><g transform="skewX(-20)"><rect class="ent-br" x="-130" y="0" width="60" height="200" fill="url(#ent-b)"/></g></g></svg><span>Toca para saltar</span>`;
    let fuera=false;const quita=()=>{if(fuera)return;fuera=true;d.classList.add('sale');setTimeout(()=>d.remove(),350)};
    d.onclick=quita;setTimeout(quita,quieto?1400:3500);document.body.appendChild(d)}).catch(()=>{})}
/* ================== APP INSTALABLE (20-nov) ==================
   Icono en la pantalla de inicio, pantalla completa y sin conexión (sw.js de la raíz). La beta solo controla su carpeta;
   el motor normal, todo el sitio. En el menú sale «Instalar la app» (Android y ordenador) o cómo hacerlo en el iPhone. */
let INSTALA=null;
(function(){const yo=(document.currentScript||{}).src||location.href,beta=/motor-beta\//.test(yo),raiz=new URL('../',yo).href;
  const add=(t,a)=>{const e=document.createElement(t);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));document.head.appendChild(e)};
  /* Un enlace por curso (22-nov): un juego de 2º se instala como la app de 2º (su enlace, el cohete del libro y su nombre) */
  const dos=typeof JUEGO!=='undefined'&&JUEGO.curso==2;
  if(!document.querySelector('link[rel="manifest"]'))add('link',{rel:'manifest',href:raiz+(dos?'segundo/':'')+'manifest.webmanifest'});
  if(!document.querySelector('link[rel="apple-touch-icon"]'))add('link',{rel:'apple-touch-icon',href:raiz+(dos?'iconos/cohete/':'iconos/')+'apple-touch-icon.png'});
  if(dos&&!document.querySelector('meta[name="apple-mobile-web-app-title"]'))add('meta',{name:'apple-mobile-web-app-title',content:'Misión Estudio 2'});
  add('meta',{name:'apple-mobile-web-app-capable',content:'yes'});add('meta',{name:'mobile-web-app-capable',content:'yes'});add('meta',{name:'apple-mobile-web-app-title',content:'Misión Estudio'});
  if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register(raiz+'sw.js',{scope:beta?'./':raiz}).catch(()=>{});
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();INSTALA=e;pintaInstalar()});
  addEventListener('appinstalled',()=>{INSTALA=null;pintaInstalar()})})();
function pintaInstalar(){const b=document.getElementById('instalar');if(!b)return;
  if(matchMedia('(display-mode: standalone)').matches||navigator.standalone){b.innerHTML='';return}
  if(INSTALA){b.innerHTML='<button class="btn sec" id="inst">📲 Instalar la app en este dispositivo</button>';
    document.getElementById('inst').onclick=async()=>{const e=INSTALA;INSTALA=null;e.prompt();try{await e.userChoice}catch(x){}pintaInstalar()};return}
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  b.innerHTML=ios?'<p class="sub">📲 Para tenerla como una app: toca <b>Compartir</b> y luego <b>«Añadir a pantalla de inicio»</b>.</p>':''}
/* ================== PERSONAJE GUÍA ================== */
const ESC_L='#1d2033';
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
    <path d="${p.celebra?'M-7.5 -32 q-5 -5 -6 -13':'M-7.5 -32 q-3.5 6 -3.2 12.5'} ${p.saluda||p.celebra?'M7.5 -32 q5 -5 6 -13':'M7.5 -32 q3.5 6 3.2 12.5'}" stroke="${L}" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="${p.celebra?'M-7.5 -32 q-5 -5 -6 -13':'M-7.5 -32 q-3.5 6 -3.2 12.5'} ${p.saluda||p.celebra?'M7.5 -32 q5 -5 6 -13':'M7.5 -32 q3.5 6 3.2 12.5'}" stroke="${p.ropa}" stroke-width="3" stroke-linecap="round" fill="none"/>
    <circle cx="${p.celebra?-13.6:-10.7}" cy="${p.celebra?-46:-19}" r="2" fill="${p.piel}" ${o}/><circle cx="${p.saluda||p.celebra?13.6:10.7}" cy="${p.saluda||p.celebra?-46:-19}" r="2" fill="${p.piel}" ${o}/>
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
/* Personaje guía (rediseño, 20-nov): uno por juego (JUEGO.guia o el del grupo de estilos), con bocadillo.
   Sale en el menú, al empezar la ruta y en los resultados; el ejercicio queda limpio. */
function guiaP(o={}){return{...ESC_DEF[(((JUEGO.estilo|0)%6)+6)%6],...(JUEGO.guia||{}),...(o.saluda?{saluda:1}:{}),...(o.celebra?{celebra:1}:{}),n:''}}
function guia(txt,o={}){
  return `<div class="guia${o.salta?' salta':''}"><svg viewBox="-18 -58 36 60" aria-hidden="true">${escPersona(guiaP(o))}</svg><div class="bocadillo${o.sinTexto?' oculto':''}">${txt}</div></div>`}
/* ================== SONIDOS (20-nov) ==================
   Suaves y cortos, sintetizados (sin archivos). Encendidos al principio; el botón 🔊 de la cabecera los apaga y se recuerda en el dispositivo.
   El arcade sigue con los suyos (aparcado). */
let SONIDO=lsGet('mision_sonido')!=='0';
function son(t,k=0){if(!SONIDO)return;try{const A=window._ac||(window._ac=new (window.AudioContext||window.webkitAudioContext)());if(A.state==='suspended')A.resume();const n0=A.currentTime+.01;
  const nota=(f,a,d,tipo='triangle',v=.06,f2)=>{const o=A.createOscillator(),g=A.createGain();o.type=tipo;o.connect(g);g.connect(A.destination);o.frequency.setValueAtTime(f,n0+a);if(f2)o.frequency.exponentialRampToValueAtTime(f2,n0+a+d);
    g.gain.setValueAtTime(.0001,n0+a);g.gain.exponentialRampToValueAtTime(v,n0+a+.012);g.gain.exponentialRampToValueAtTime(.0001,n0+a+d);o.start(n0+a);o.stop(n0+a+d+.02)};
  const ruido=(d,v,f1,f2,q=1)=>{const b=A.createBuffer(1,Math.ceil(A.sampleRate*d),A.sampleRate),x=b.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=Math.random()*2-1;
    const s=A.createBufferSource(),fl=A.createBiquadFilter(),g=A.createGain();s.buffer=b;fl.type='bandpass';fl.Q.value=q;fl.frequency.setValueAtTime(f1,n0);fl.frequency.exponentialRampToValueAtTime(f2,n0+d);
    g.gain.setValueAtTime(v,n0);g.gain.exponentialRampToValueAtTime(.0001,n0+d);s.connect(fl);fl.connect(g);g.connect(A.destination);s.start(n0);s.stop(n0+d)};
  ({ok:()=>{nota(660,0,.1);nota(990,.08,.16)},
    bad:()=>nota(330,0,.2,'sine',.07,220),
    tap:()=>{}, /* 21-nov, el padre: sin sonido al tocar teclas y fichas; se quedan los de acertar, recompensa y fin de bloque */
    estrella:()=>nota([784,988,1175][k]||1175,0,.16,'triangle',.06),
    sello:()=>{ruido(.12,.12,500,180,.8);nota(120,0,.16,'sine',.14,70)},
    fanfarria:()=>[523,659,784,1047].forEach((f,i)=>nota(f,i*.09,i==3?.32:.15,'triangle',.05)),
    cuenta:()=>nota(523,0,.12,'square',.03),
    ya:()=>{nota(784,0,.1,'square',.03);nota(1047,.08,.26,'square',.035)},
    asoma:()=>{nota(880,0,.06,'sine',.05);nota(1320,.05,.09,'sine',.05)},
    pasa:()=>ruido(.38,.05,350,2200,1.2),
    despegue:()=>{ruido(1.3,.07,160,1800,.7);nota(70,0,.6,'sine',.06,45)}})[t]()}catch(e){}}
function botonSonido(){const h=document.querySelector('header .hud');if(!h||document.getElementById('sonido'))return;
  const b=document.createElement('button');b.id='sonido';b.className='pill sonido';b.type='button';
  const pon=()=>{b.textContent=SONIDO?'🔊':'🔇';b.setAttribute('aria-label',SONIDO?'Quitar el sonido':'Poner el sonido');b.setAttribute('aria-pressed',String(!SONIDO))};
  b.onclick=()=>{SONIDO=!SONIDO;try{localStorage.setItem('mision_sonido',SONIDO?'1':'0')}catch(e){}pon();son('tap')};pon();h.appendChild(b)}
botonSonido();
