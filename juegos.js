/* Misión Estudio · los juegos del menú de la suite (21-nov).
   Un juego nuevo = una fila en JUEGOS al pasarlo a la normal (lo hace la skill juego-nuevo).
   carpeta: la del juego · curso: 5 o 2 · asignatura: una clave de ASIGNATURAS · examen: AAAA-MM-DD.
   Una asignatura sin juegos no sale en el menú. */
const JUEGOS=[
 {id:'ingles-u2',carpeta:'ingles-u2/',curso:5,asignatura:'ingles',titulo:'Unit 2',temas:'Adverbios, like / would like, verbos irregulares y vocabulario',examen:'2026-11-20'},
 {id:'mates-u3',carpeta:'mates-u3/',curso:5,asignatura:'mates',titulo:'Unidad 3',temas:'Divisiones, múltiplos, divisores, criterios de divisibilidad, primos y problemas',examen:'2026-11-27'}
];
const ASIGNATURAS={
 ingles:{n:'Inglés',ic:'🔤',col:'#2a8bf2'},
 mates:{n:'Mates',ic:'➗',col:'#ff7a45'},
 lengua:{n:'Lengua',ic:'📖',col:'#a78bfa'},
 naturales:{n:'Naturales',ic:'🌿',col:'#2ecc71'},
 sociales:{n:'Sociales',ic:'🌍',col:'#ffc83d'}
};
