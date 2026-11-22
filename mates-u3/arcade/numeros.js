/* =====================================================================
   Misión Estudio · generador de números para el arcade de Mates
   Consignas y números sin listas escritas a mano: múltiplos, divisores,
   criterios de divisibilidad y primos. Cada número trae si cumple la
   consigna y la explicación corta que ve el niño cuando falla.
   Sirve para cualquier juego de arcade de Mates y para las próximas unidades.
   rnd: función que da un número entre 0 y 1 (Math.random o una semilla fija).
   ===================================================================== */
const NUMEROS=(()=>{
  const ent=(rnd,a,b)=>a+Math.floor(rnd()*(b-a+1));
  const elige=(rnd,a)=>a[Math.floor(rnd()*a.length)];
  const esPrimo=n=>{if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true};
  const factor=n=>{for(let d=2;d*d<=n;d++)if(n%d===0)return[d,n/d];return null};
  const divisores=n=>{const r=[];for(let d=1;d<=n;d++)if(n%d===0)r.push(d);return r};
  const suma=n=>String(n).split('').reduce((s,c)=>s+ +c,0);

  /* Cada tema: consigna(rnd) → {txt, corto (para el pecho del jefe), cumple(n), numero(rnd, bueno), explica(n)} */
  const TEMAS={
    /* Múltiplos de un número: los buenos son n × k; los malos, vecinos que no lo son */
    multiplos(rnd){const m=elige(rnd,[3,4,6,7,8,9,11,12,15]);
      return{txt:`Múltiplo de ${m}`,corto:'×'+m,cumple:n=>n%m===0,
        numero:(r,bueno)=>{if(bueno)return m*ent(r,2,10);let n;do n=m*ent(r,2,10)+ent(r,1,m-1);while(n%m===0);return n},
        explica:n=>{const k=Math.floor(n/m);return n%m===0?`${n} = ${m} × ${n/m}`:`${n} no: ${m} × ${k} = ${m*k} y ${m} × ${k+1} = ${m*(k+1)}`}}},
    /* Divisores de un número: los buenos lo dividen sin resto */
    divisores(rnd){const N=elige(rnd,[12,18,20,24,30,36,40,48,60,72]),D=divisores(N);
      return{txt:`Divisor de ${N}`,corto:'÷'+N,cumple:n=>N%n===0,
        numero:(r,bueno)=>{if(bueno)return elige(r,D.length>2?D.slice(1):D);let n;do n=ent(r,2,Math.min(N-1,30));while(N%n===0);return n},
        explica:n=>N%n===0?`${N} : ${n} = ${N/n}, sin resto`:`${n} no: ${N} : ${n} = ${Math.floor(N/n)} y sobran ${N%n}`}},
    /* Criterios: divisible entre 2, 3, 5, 9 o 10, con números de dos y tres cifras */
    criterios(rnd){const d=elige(rnd,[2,3,5,9,10]);
      const regla={2:n=>`termina en ${n%10}`,5:n=>`termina en ${n%10}`,10:n=>`termina en ${n%10}`,
        3:n=>`sus cifras suman ${String(n).split('').join(' + ')} = ${suma(n)}`,9:n=>`sus cifras suman ${String(n).split('').join(' + ')} = ${suma(n)}`}[d];
      const como={2:'en cifra par',5:'en 0 o en 5',10:'en 0',3:'un múltiplo de 3',9:'un múltiplo de 9'}[d];
      return{txt:`Divisible entre ${d}`,corto:'÷'+d,cumple:n=>n%d===0,
        numero:(r,bueno)=>{let n;do n=ent(r,12,999);while((n%d===0)!==bueno);return n},
        explica:n=>`${n} ${n%d===0?'sí':'no'}: ${regla(n)}${d===3||d===9?(n%d===0?', que es':', que no es')+' '+como:(n%d===0?'':', y tiene que acabar '+como)}`}},
    /* Primos y compuestos, hasta 99 */
    primos(rnd){const quiere=rnd()<.65;
      return{txt:quiere?'Es primo':'Es compuesto',corto:quiere?'P':'C',cumple:n=>esPrimo(n)===quiere,
        numero:(r,bueno)=>{let n;do n=ent(r,2,99);while((esPrimo(n)===quiere)!==bueno);return n},
        explica:n=>{const f=factor(n);return esPrimo(n)?`${n} es primo: solo se divide entre 1 y ${n}`:`${n} es compuesto: ${n} = ${f[0]} × ${f[1]}`}}},
  };
  /* Semilla fija para el modo prueba: siempre la misma partida */
  const semilla=s=>()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296};
  return{TEMAS,semilla,esPrimo,divisores};
})();
