/* =====================================================================
   Las horas del reloj (2º) · horas nuevas en cada partida (23-nov, plan hasta el examen, P4)
   Los mismos ejercicios del día de Lía con otras horas, de cuarto en cuarto y cerca de la original
   (como mucho una hora antes o después), para que la historia siga teniendo sentido: el despertador,
   por la mañana; la merienda, por la tarde. Si el texto dice la hora («a las 9 en punto»), se reescribe.
   «Ordenar el día» y «¿Cuánto dura?» se quedan igual. El examen ya sale al azar.
   El motor llama a JUEGO.cifras(k) antes de cada bloque; JUEGO.cifras.comprueba() devuelve los errores.
   ===================================================================== */
(()=>{
const ORIG={LEER1:LEER1.map(x=>({...x})),PONER1:PONER1.map(x=>({...x})),ELIGE:ELIGE.map(x=>({...x})),PONERT:PONERT.map(x=>({...x}))};
const ent=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
/* La hora dicha como en el libro: «las 9 en punto», «la 1 y cuarto», «las 4 menos cuarto» */
const h12=h=>((h-1)%12+12)%12+1;
function dicha(h,m){const hh=m===45?h12(h+1):h12(h),art=hh===1?'la':'las';
  return `${art} ${hh} ${m===0?'en punto':m===15?'y cuarto':m===30?'y media':'menos cuarto'}`}
const FRASE=/\b(la|las) (\d{1,2}) (en punto|y cuarto|y media|menos cuarto)/;
/* Una hora nueva cerca de la original: entre una hora antes y una después, de cuarto en cuarto (de la 1 a las 12 y tres cuartos) */
function cerca(h,m){const t=h*60+m;let n;
  do n=t+15*ent(-4,4);while(n===t||n<60||n>12*60+45);
  return{h:Math.floor(n/60),m:n%60}}
function rehace(lista,nombre){const usadas=new Set;
  lista.splice(0,lista.length,...ORIG[nombre].map(x=>{let t,k=0;do t=cerca(x.h,x.m);while(usadas.has(t.h+':'+t.m)&&k++<30);usadas.add(t.h+':'+t.m);
    const y={...x,h:t.h,m:t.m};if(FRASE.test(x.relato))y.relato=x.relato.replace(FRASE,dicha(t.h,t.m));return y}))}
function generar(){rehace(LEER1,'LEER1');rehace(PONER1,'PONER1');rehace(ELIGE,'ELIGE');rehace(PONERT,'PONERT')}
function comprueba(){const E=[];
  [['LEER1',LEER1],['PONER1',PONER1],['ELIGE',ELIGE],['PONERT',PONERT]].forEach(([n,L])=>{
    if(L.length!==ORIG[n].length)E.push(n+': cambia de tamaño');
    L.forEach((x,i)=>{const o=ORIG[n][i];
      if(![0,15,30,45].includes(x.m)||x.h<1||x.h>12)E.push(n+': hora rara '+x.h+':'+x.m);
      if(Math.abs((x.h*60+x.m)-(o.h*60+o.m))>60)E.push(n+': demasiado lejos de la original '+x.h+':'+x.m);
      if(FRASE.test(x.relato)&&x.relato.match(FRASE)[0]!==dicha(x.h,x.m))E.push(n+': el texto no dice la hora del reloj: '+x.relato+' ('+x.h+':'+x.m+')')})});
  return E}
JUEGO.cifras=function(){generar()};
JUEGO.cifras.comprueba=comprueba;
JUEGO.cifras.generar=generar;
})();
