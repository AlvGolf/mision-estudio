/* =====================================================================
   Misión Mates · Unidad 3 · cifras nuevas en cada partida (23-nov, plan hasta el examen, P4)
   Los mismos ejercicios del juego con otros números. Rellena en su sitio las listas del juego
   (DIV1, DIV2, MULT_*, DIVS_*, CRIT_*, PRIM_*, PRUEBA, PUERTAS, PROBS y las preguntas con
   números de DIV1_MC), con la misma forma que leen el motor y el verificador. Las preguntas de
   idea (sin números) y las dos historias (la excursión y el torneo) se quedan igual.
   El motor llama a JUEGO.cifras(k) antes de cada bloque y del examen.
   JUEGO.cifras.comprueba() rehace las cuentas de todo lo generado y devuelve los errores (el verificador).
   Se carga después del juego y de arcade/numeros.js, y antes de la piel y del motor.
   ===================================================================== */
(()=>{
const ent=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const elige=a=>a[Math.floor(Math.random()*a.length)];
const baraja=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const distintos=(n,f)=>{const s=new Set;let t=0;while(s.size<n&&t++<5000)s.add(f());return[...s]};
const {esPrimo,divisores}=NUMEROS;
const M=n=>miles(n);
const llena=(lista,nueva)=>{lista.splice(0,lista.length,...nueva)};

/* División: D con «cifras» cifras entre d; con cero=true, el cociente lleva un 0 que no es la primera cifra */
function division(d,cifras,cero){
  for(let t=0;t<5000;t++){const D=ent(10**(cifras-1),10**cifras-1),q=Math.floor(D/d);
    if(q<10)continue;
    if(cero!==undefined&&(/0/.test(String(q).slice(1))!==cero))continue;
    return D}
  return 10**(cifras-1)+1}

function generar(){
  /* A · División por una cifra: cinco, como en la hoja (3, 4, 4, 4 y 4 cifras), una con cero en el cociente */
  const cifras1=[3,4,4,4,4],cero1=ent(0,4);
  llena(DIV1,cifras1.map((c,i)=>{const d=ent(3,9);return{D:division(d,c,i===cero1?true:undefined),d,modo:'libre'}}));
  /* Las dos de «¿exacta o entera?» */
  {const d1=elige([3,4,5,6,8]),q1=ent(150,999),D1=d1*q1;
   const d2=elige([3,4,5,6,7,8,9]);let D2;do D2=ent(1000,4999);while(D2%d2===0);
   DIV1_MC[0]={q:`La división ${M(D1)} : ${d1}, ¿es exacta o entera?`,opts:['Exacta','Entera'],a:'Exacta',ex:`${M(D1)} : ${d1} = ${M(q1)} y el resto es 0.`};
   DIV1_MC[1]={q:`La división ${M(D2)} : ${d2}, ¿es exacta o entera?`,opts:['Exacta','Entera'],a:'Entera',ex:`${M(D2)} : ${d2} = ${M(Math.floor(D2/d2))} y sobra${D2%d2>1?'n':''} ${D2%d2}.`};
   if(Math.random()<.5)[DIV1_MC[0],DIV1_MC[1]]=[DIV1_MC[1],DIV1_MC[0]]}
  llena(PRUEBA,[0,1].map(()=>{const d=ent(3,9),q=ent(105,499),r=ent(1,d-1),D=q*d+r;
    return{q:`En una división, el divisor es ${d}, el cociente ${q} y el resto ${r}. ¿Cuál es el dividendo?`,a:D,ex:`${q} × ${d} + ${r} = ${M(D)}.`}}));

  /* B · Múltiplos */
  const [m1,m2]=baraja([3,4,6,7,8,9]);
  const fila=(m,primera)=>{const k=baraja([2,3,4,5,6,7,8,9,10]).slice(0,primera===0?4:5).sort((a,b)=>a-b);
    return[[`${m} × ${primera}`,String(m*primera),1],...k.map(x=>[`${m} × ${x}`,String(m*x)])]};
  llena(MULT_TAB,[{q:`Completa los múltiplos de ${m1}`,cab:['Operación','Múltiplo'],num:true,f:fila(m1,1)},
                  {q:`Completa los múltiplos de ${m2}`,cab:['Operación','Múltiplo'],num:true,f:fila(m2,0)}]);
  const esMult=(si)=>{const m=ent(3,9);let n;if(si)n=m*ent(6,15);else{do n=ent(20,120);while(n%m===0)}
    const q=Math.floor(n/m),r=n%m;return{q:`¿Es ${n} múltiplo de ${m}?`,opts:['Sí','No'],a:si?'Sí':'No',ex:si?`${n} : ${m} = ${q} y la división es exacta.`:`${n} : ${m} = ${q} y sobra${r>1?'n':''} ${r}: no es exacta.`}};
  const s3=baraja([true,true,false]);
  const mon=(()=>{const si=Math.random()<.5;let n;if(si)n=5*ent(15,60);else{do n=ent(70,300);while(n%5===0)}
    return{q:`Solo tienes monedas de 5 €. ¿Puedes juntar justo ${n} €?`,opts:['Sí','No'],a:si?'Sí':'No',ex:si?`${n} es múltiplo de 5: ${n} : 5 = ${n/5} monedas.`:`${n} : 5 = ${Math.floor(n/5)} y sobra${n%5>1?'n':''} ${n%5}: ${n} no es múltiplo de 5.`}})();
  const bil=(()=>{const b=elige([10,20,50]),si=Math.random()<.5;let n;if(si)n=b*ent(3,12);else{do n=5*ent(10,80);while(n%b===0)}
    return{q:`Con billetes de ${b} €, ¿puedes pagar justo ${n} €?`,opts:['Sí','No'],a:si?'Sí':'No',ex:si?`${n} : ${b} = ${n/b}, exacta: ${n} es múltiplo de ${b}.`:`${n} : ${b} = ${Math.floor(n/b)} y sobran ${n%b}: ${n} no es múltiplo de ${b}.`}})();
  llena(MULT_MC,[...s3.map(esMult),mon,bil]);
  {const m=elige([6,7,8,9]),si=distintos(4,()=>m*ent(2,12)),no=distintos(4,()=>{let n;do n=ent(12,99);while(n%m===0);return n});
   Object.assign(MULT_BINS,{q:`¿Es múltiplo de ${m}?`,bins:[`Múltiplo de ${m}`,`No es múltiplo de ${m}`],items:[...si.map(n=>({t:String(n),b:0})),...no.map(n=>({t:String(n),b:1}))]})}
  {const m=ent(6,9),k=ent(4,12),x=m*k,A=x-ent(1,3),a=ent(11,15),b=ent(3,9);
   llena(MULT_NUM,[{q:`¿Qué múltiplo de ${m} está entre ${A} y ${A+5}?`,a:x,ex:`${m} × ${k} = ${x}.`},{q:`¿Cuánto es ${a} × ${b}? Es un múltiplo de ${a}.`,a:a*b}])}

  /* C · Divisores */
  llena(DIVS_MARCA,baraja([12,14,15,16,18,20,21,22,24]).slice(0,2).map(N=>{const D=divisores(N).map(String);
    return{q:`Marca todos los divisores de ${N}`,texto:Array.from({length:N},(_,i)=>i+1).join(' '),si:D,ex:`${N} se divide exacto entre ${D.slice(0,-1).join(', ')} y ${N}.`}}));
  {const pares=distintos(2,()=>{const b=ent(3,9);let c;do c=ent(3,9);while(c===b);return b+'x'+c}).map(s=>s.split('x').map(Number));
   llena(DIVS_GAP,pares.flatMap(([b,c])=>{const a=b*c;return[
     {q:`${a} : ${b} = ${c} → ${b} es ____ de ${a}`,opts:['divisor','múltiplo'],a:'divisor',ex:`${b} divide a ${a} de forma exacta.`},
     {q:`${a} : ${b} = ${c} → ${a} es ____ de ${c}`,opts:['divisor','múltiplo'],a:'múltiplo',ex:`${a} = ${c} × ${b}.`}]}))}
  {const d1=ent(3,9),N1=d1*ent(4,12),d2=ent(3,9);let N2;do N2=ent(20,99);while(N2%d2===0);
   llena(DIVS_MC,baraja([{q:`¿Es ${d1} divisor de ${N1}?`,opts:['Sí','No'],a:'Sí',ex:`${N1} : ${d1} = ${N1/d1}, exacta.`},
     {q:`¿Es ${d2} divisor de ${N2}?`,opts:['Sí','No'],a:'No',ex:`${N2} : ${d2} = ${Math.floor(N2/d2)} y sobra${N2%d2>1?'n':''} ${N2%d2}.`}]))}
  {const N=elige([12,16,18,20,24,28,30,36]),D=divisores(N);
   llena(DIVS_NUM,[{q:`¿Cuántos divisores tiene el ${N}?`,a:D.length,ex:`${D.slice(0,-1).join(', ')} y ${N}.`}])}

  /* D · Criterios: dos números de cada caja (por 2 y por 3) */
  {const usados=new Set,de=(p2,p3)=>{let n;do n=ent(101,499);while(usados.has(n)||(n%2===0)!==p2||(n%3===0)!==p3);usados.add(n);return n};
   CRIT_CAJAS.w=[[1,1],[1,0],[0,1],[0,0]].flatMap(([a,b])=>[0,1].map(()=>[String(de(!!a,!!b)),a?0:1,b?0:1]))}
  {const si=distintos(4,()=>5*ent(20,400)),no=distintos(4,()=>{let n;do n=ent(60,2100);while(n%5===0);return n});
   CRIT_BINS.items=[...si.map(n=>({t:M(n),b:0})),...no.map(n=>({t:M(n),b:1}))]}
  {const u=elige([1,3,5,7,9]);CRIT_MC[0]={q:`Un número acaba en ${u}. ¿Puede ser divisible por 2?`,opts:['Sí','No'],a:'No',ex:'Los divisibles por 2 son pares: acaban en 0, 2, 4, 6 u 8.'};
   const S=ent(10,22),s3=S%3===0;CRIT_MC[1]={q:`Las cifras de un número suman ${S}. ¿Es divisible por 3?`,opts:['Sí','No'],a:s3?'Sí':'No',ex:s3?`${S} es múltiplo de 3.`:`${S} no es múltiplo de 3.`};
   const n=ent(120,990),par=n%2===0;CRIT_MC[3]={q:`Solo tienes monedas de 2 €. ¿Puedes tener ${n} € en la hucha?`,opts:['Sí','No'],a:par?'Sí':'No',ex:par?`${n} es par: es múltiplo de 2 (${n} : 2 = ${n/2}).`:`${n} es impar: no es múltiplo de 2.`}}
  {const a=ent(1,9),b=ent(0,9);let x=1;while((a+x+b)%3)x++;
   llena(CRIT_NUM,[{q:`¿Qué cifra, la más pequeña de 1 a 9, pondrías en ${a}_${b} para que sea divisible por 3?`,a:x,ex:`${a} + ${x} + ${b} = ${a+x+b}, que es múltiplo de 3.`}])}

  /* E · Primos y compuestos */
  const compImpar=()=>{let n;do n=ent(15,99);while(n%2===0||esPrimo(n));return n};
  {const p=distintos(5,()=>{let n;do n=ent(11,97);while(!esPrimo(n));return n}),c=distintos(5,compImpar);
   PRIM_BINS.items=[...p.map(n=>({t:String(n),b:0})),...c.map(n=>({t:String(n),b:1}))]}
  {const p=distintos(4,()=>{let n;do n=ent(5,79);while(!esPrimo(n));return n}),c=distintos(5,()=>{let n;do n=ent(6,80);while(esPrimo(n));return n});
   const todos=[...new Set([...p,...c])].sort((x,y)=>x-y);
   llena(PRIM_MARCA,[{q:'Marca los números primos',texto:todos.join(' '),si:p.sort((x,y)=>x-y).map(String),ex:`${p.slice(0,-1).join(', ')} y ${p[p.length-1]} solo se dividen entre 1 y ellos mismos.`}])}
  {const n=elige([51,57,87,91,69,93,39,77]),f=divisores(n)[1];
   PRIM_MC[2]={q:`¿Es primo el ${n}?`,opts:['Sí','No'],a:'No',ex:`${n} = ${f} × ${n/f}: es compuesto.`}}
  {let P;do P=ent(11,97);while(!esPrimo(P));const N=elige([15,21,22,26,27,33,35]),D=divisores(N);
   llena(PRIM_NUM,[{q:`¿Cuántos divisores tiene el ${P}?`,a:2,ex:`Solo el 1 y el ${P}: es primo.`},{q:`¿Cuántos divisores tiene el ${N}?`,a:D.length,ex:`${D.slice(0,-1).join(', ')} y ${N}: es compuesto.`}])}

  /* F · División por dos cifras: cinco (3, 4, 4, 4 y 4 cifras), una con cero en el cociente, todas con el resto rodeado */
  const cero2=ent(1,4);
  llena(DIV2,[3,4,4,4,4].map((c,i)=>{const d=ent(12,49);return{D:division(d,c,i===cero2?true:undefined),d,modo:'libre',rodea:true}}));
  llena(PUERTAS,[0,1].map(()=>{const d=ent(13,59),q=ent(30,180),r=ent(1,d-1),D=q*d+r;
    return{q:`🚪 El código de la puerta es el dividendo. Divisor ${d}, cociente ${q} y resto ${r}. ¿Cuál es el código?`,a:D,ex:`${q} × ${d} + ${r} = ${M(D)}.`}}));

  /* G · Problemas: las mismas ocho historias con otros números */
  const P=[];
  {const b=elige([5,10,20]),k=ent(12,60),p=b*k;P.push({q:`Una bicicleta cuesta ${p} €. ¿Cuántos billetes de ${b} € hacen falta para pagarla justo?`,a:k,cuenta:[p,':',b],ex:`${p} : ${b} = ${k}.`})}
  {let N,L,v;for(;;){N=elige([24,30,36,40,42,45,48,56,60]);L=ent(3,8);const c=divisores(N).filter(x=>x>L&&x<L+3);if(c.length===1){v=c[0];break}}
   P.push({q:`En el campamento hay ${N} niños. Quieren hacer equipos iguales de más de ${L} y menos de ${L+3} niños, sin que sobre nadie. ¿De cuántos niños es cada equipo?`,a:v,ex:`Los divisores de ${N} entre ${L+1} y ${L+2}: solo el ${v} (${N} : ${v} = ${N/v} equipos).`})}
  {const R=40*ent(10,30),az=R/2,ve=R/4;P.push({q:`En un juego, el equipo rojo saca ${R} puntos, el azul la mitad que el rojo y el verde la mitad que el azul. ¿Cuántos puntos menos que el rojo saca el verde?`,a:R-ve,cuenta:[R,'−',ve],ex:`Azul ${az}, verde ${ve}; ${R} − ${ve} = ${R-ve}.`})}
  {const A=50*ent(10,40),B=50*ent(10,50),[x,y]=baraja([4,5,6,8]);P.push({q:`Una fábrica envasa cada día ${M(A)} bandejas de ${x} tomates y ${M(B)} bandejas de ${y} tomates. ¿Cuántos tomates envasa al día?`,a:A*x+B*y,cuenta:[A,'×',x],ex:`${M(A)} × ${x} = ${M(A*x)}; ${M(B)} × ${y} = ${M(B*y)}; ${M(A*x)} + ${M(B*y)} = ${M(A*x+B*y)}.`})}
  {let p,k,tot,n,c;do{p=ent(12,25);k=ent(4,9);tot=p*k;n=Math.ceil((tot+1)/50);c=n*50-tot}while(c>=50||n>5);
   P.push({q:`Pagas con ${n} billetes de 50 € varias macetas iguales de ${p} € y te devuelven ${c} €. ¿Cuántas macetas has comprado?`,a:k,cuenta:[tot,':',p],ex:`${n*50} − ${c} = ${tot}; ${tot} : ${p} = ${k}.`})}
  {const [a,b]=elige([[12,18],[8,12],[6,8],[10,15],[6,9],[9,12],[4,10],[15,20]]),mcm=(()=>{let x=a;while(x%b)x+=a;return x})();
   const ma=Array.from({length:mcm/a},(_,i)=>a*(i+1)).join(', '),mb=Array.from({length:mcm/b},(_,i)=>b*(i+1)).join(', ');
   P.push({q:`Dos autobuses salen a la vez de la estación. Uno vuelve cada ${a} minutos y el otro cada ${b}. ¿A los cuántos minutos coinciden otra vez por primera vez?`,a:mcm,ex:`Múltiplos de ${a}: ${ma}… Múltiplos de ${b}: ${mb}… El primero común es ${mcm}.`})}
  {const e=ent(6,10);P.push({q:`Un niño tiene ${e} años, su prima el triple que él y su abuelo el doble de la suma de los dos. ¿Cuántos años tiene el abuelo más que el niño?`,a:7*e,cuenta:[8*e,'−',e],ex:`Prima ${3*e}; abuelo 2 × (${e} + ${3*e}) = ${8*e}; ${8*e} − ${e} = ${7*e}.`})}
  {let C,n;do{C=ent(300,900);n=ent(13,29)}while(C%n===0);P.push({q:`Hay ${C} cromos para repartir a partes iguales entre ${n} niños. ¿Cuántos cromos sobran?`,a:C%n,cuenta:[C,':',n],ex:`${C} : ${n} = ${Math.floor(C/n)} y sobran ${C%n}.`})}
  llena(PROBS,P);
}

/* Rehace las cuentas de todo lo generado: devuelve la lista de errores (vacía si todo está bien) */
function comprueba(){const E=[],num=t=>+String(t).replace(/\./g,''),mal=(l,x)=>E.push(l+': '+JSON.stringify(x).slice(0,160));
  const cif=n=>String(n).length,div=(D,d)=>[Math.floor(D/d),D%d];
  DIV1.forEach(x=>{if(x.d<3||x.d>9||cif(x.D)<3||cif(x.D)>4||div(x.D,x.d)[0]<10)mal('DIV1',x)});
  if(!DIV1.some(x=>/0/.test(String(Math.floor(x.D/x.d)).slice(1))))mal('DIV1 sin cero en el cociente',DIV1);
  DIV2.forEach(x=>{if(x.d<12||x.d>49||cif(x.D)<3||cif(x.D)>4||div(x.D,x.d)[0]<10||!x.rodea)mal('DIV2',x)});
  if(!DIV2.some(x=>/0/.test(String(Math.floor(x.D/x.d)).slice(1))))mal('DIV2 sin cero en el cociente',DIV2);
  DIV1_MC.slice(0,2).forEach(x=>{const m=x.q.match(/([\d.]+) : (\d+)/),D=num(m[1]),d=+m[2];if((D%d===0?'Exacta':'Entera')!==x.a)mal('DIV1_MC',x)});
  [...PRUEBA,...PUERTAS].forEach(x=>{const n=x.q.match(/\d+/g).map(Number),[d,q,r]=n;if(q*d+r!==x.a||r>=d||r<1)mal('PRUEBA/PUERTAS',x)});
  MULT_TAB.forEach(t=>{const m=+t.q.match(/\d+$/)[0];t.f.forEach(([op,sol])=>{const [a,b]=op.split(' × ').map(Number);if(a!==m||a*b!==+sol)mal('MULT_TAB',t)})});
  MULT_MC.forEach(x=>{let n,m;const q=x.q;
    if(/^¿Es (\d+) múltiplo de (\d+)\?$/.test(q)){[,n,m]=q.match(/(\d+) múltiplo de (\d+)/).map(Number)}
    else if(/monedas de 5/.test(q)){m=5;n=+q.match(/justo (\d+)/)[1]}else{m=+q.match(/billetes de (\d+)/)[1];n=+q.match(/justo (\d+)/)[1]}
    if((n%m===0?'Sí':'No')!==x.a)mal('MULT_MC',x)});
  {const m=+MULT_BINS.q.match(/\d+/)[0];MULT_BINS.items.forEach(i=>{if((num(i.t)%m===0?0:1)!==i.b)mal('MULT_BINS',i)})}
  {const [m,A,B]=MULT_NUM[0].q.match(/\d+/g).map(Number),c=[];for(let x=A+1;x<B;x++)if(x%m===0)c.push(x);if(c.length!==1||c[0]!==MULT_NUM[0].a)mal('MULT_NUM',MULT_NUM[0]);
   const [a,b]=MULT_NUM[1].q.match(/\d+/g).map(Number);if(a*b!==MULT_NUM[1].a)mal('MULT_NUM',MULT_NUM[1])}
  DIVS_MARCA.forEach(x=>{const N=+x.q.match(/\d+/)[0];if(divisores(N).join()!==x.si.join()||x.texto.split(' ').length!==N)mal('DIVS_MARCA',x)});
  DIVS_GAP.forEach(x=>{const [a,b,c,y,z]=x.q.match(/\d+/g).map(Number);if(a!==b*c||(y===b&&x.a!=='divisor')||(y===a&&(x.a!=='múltiplo'||z!==c)))mal('DIVS_GAP',x)});
  DIVS_MC.forEach(x=>{const [d,N]=x.q.match(/\d+/g).map(Number);if((N%d===0?'Sí':'No')!==x.a)mal('DIVS_MC',x)});
  [...DIVS_NUM,PRIM_NUM[1]].forEach(x=>{const N=+x.q.match(/\d+/)[0];if(divisores(N).length!==x.a)mal('DIVS_NUM',x)});
  if(!esPrimo(+PRIM_NUM[0].q.match(/\d+/)[0])||PRIM_NUM[0].a!==2)mal('PRIM_NUM',PRIM_NUM[0]);
  CRIT_CAJAS.w.forEach(([t,f,c])=>{const n=num(t);if((n%2===0?0:1)!==f||(n%3===0?0:1)!==c)mal('CRIT_CAJAS',t)});
  CRIT_BINS.items.forEach(i=>{if((num(i.t)%5===0?0:1)!==i.b)mal('CRIT_BINS',i)});
  {const S=+CRIT_MC[1].q.match(/\d+/)[0];if((S%3===0?'Sí':'No')!==CRIT_MC[1].a)mal('CRIT_MC',CRIT_MC[1]);
   const n=+CRIT_MC[3].q.match(/tener (\d+)/)[1];if((n%2===0?'Sí':'No')!==CRIT_MC[3].a)mal('CRIT_MC',CRIT_MC[3]);
   if(+CRIT_MC[0].q.match(/\d/)[0]%2===0)mal('CRIT_MC',CRIT_MC[0])}
  {const [a,b]=CRIT_NUM[0].q.match(/(\d)_(\d)/).slice(1).map(Number),x=CRIT_NUM[0].a;if((a+x+b)%3||[...Array(x-1)].some((_,i)=>(a+i+1+b)%3===0))mal('CRIT_NUM',CRIT_NUM[0])}
  PRIM_BINS.items.forEach(i=>{if((esPrimo(+i.t)?0:1)!==i.b)mal('PRIM_BINS',i)});
  PRIM_MARCA.forEach(x=>{const p=x.texto.split(' ').filter(t=>esPrimo(+t));if(p.join()!==x.si.join())mal('PRIM_MARCA',x)});
  if(esPrimo(+PRIM_MC[2].q.match(/\d+/)[0])!==(PRIM_MC[2].a==='Sí'))mal('PRIM_MC',PRIM_MC[2]);
  if(PROBS.length!==8)mal('PROBS',PROBS.length);
  PROBS.forEach(x=>{if(!Number.isInteger(x.a)||x.a<=0)mal('PROBS',x);
    if(x.cuenta){const [a,op,b]=x.cuenta;if(!Number.isInteger(a)||!Number.isInteger(b)||a<=0||b<=0)mal('PROBS cuenta',x)}});
  {const [p,b]=PROBS[0].q.match(/\d+/g).map(Number);if(p/b!==PROBS[0].a)mal('PROBS bici',PROBS[0])}
  {const [N,L]=PROBS[1].q.match(/\d+/g).map(Number),c=divisores(N).filter(x=>x>L&&x<L+3);if(c.length!==1||c[0]!==PROBS[1].a)mal('PROBS equipos',PROBS[1])}
  {const [n,c]=[+PROBS[4].q.match(/con (\d) billetes/)[1],+PROBS[4].q.match(/devuelven (\d+)/)[1]],p=+PROBS[4].q.match(/de (\d+) € y/)[1];if((n*50-c)/p!==PROBS[4].a||c>=50)mal('PROBS macetas',PROBS[4])}
  {const [C,n]=PROBS[7].q.match(/\d+/g).map(Number);if(C%n!==PROBS[7].a||!PROBS[7].a)mal('PROBS cromos',PROBS[7])}
  /* Cualquier test: la respuesta está entre las opciones y no hay opciones repetidas */
  [...DIV1_MC,...MULT_MC,...DIVS_GAP,...DIVS_MC,...CRIT_MC,...PRIM_MC].forEach(x=>{if(!x.opts.includes(x.a)||new Set(x.opts).size!==x.opts.length)mal('opciones',x)});
  [MULT_BINS,CRIT_BINS,PRIM_BINS].forEach(b=>{const t=b.items.map(i=>i.t);if(new Set(t).size!==t.length)mal('repetidos',t)});
  return E}

JUEGO.cifras=function(){generar()};
JUEGO.cifras.comprueba=comprueba;
JUEGO.cifras.generar=generar;
})();
