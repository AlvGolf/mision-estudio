/* Misión Estudio · los juegos del menú de la suite (21-nov).
   Un juego nuevo = una fila en JUEGOS al pasarlo a la normal (lo hace la skill juego-nuevo).
   carpeta: la del juego · curso: 5 o 2 · asignatura: una clave de ASIGNATURAS · examen: AAAA-MM-DD (sin examen del cole, se deja fuera).
   Una asignatura sin juegos no sale en el menú.
   soloBeta:true (24-nov): el juego está en pruebas y solo sale en el menú beta que abre su beta; se quita al pasarlo a la normal. */
const JUEGOS=[
 {id:'ingles-u2',carpeta:'ingles-u2/',curso:5,asignatura:'ingles',titulo:'Unit 2',temas:'Adverbios, like / would like, verbos irregulares y vocabulario',examen:'2026-11-20'},
 {id:'mates-u3',carpeta:'mates-u3/',curso:5,asignatura:'mates',titulo:'Unidad 3',temas:'Divisiones, múltiplos, divisores, criterios de divisibilidad, primos y problemas',examen:'2026-11-27'},
 {id:'lengua-t3',carpeta:'lengua-t3/',curso:5,asignatura:'lengua',titulo:'Unidad 3',temas:'El adjetivo y sus grados, epítetos, vocabulario, diptongos e hiatos y la medida de los versos',examen:'2026-12-01',soloBeta:true},
 {id:'mates-reloj',carpeta:'mates-reloj/',curso:2,asignatura:'mates',titulo:'Las horas del reloj',temas:'En punto, y cuarto, y media y menos cuarto en el reloj de agujas'}
];
const ASIGNATURAS={
 ingles:{n:'Inglés',ic:'🔤',col:'#2a8bf2'},
 mates:{n:'Mates',ic:'➗',col:'#ff7a45'},
 lengua:{n:'Lengua',ic:'📖',col:'#a78bfa'},
 naturales:{n:'Naturales',ic:'🌿',col:'#2ecc71'},
 sociales:{n:'Sociales',ic:'🌍',col:'#ffc83d'}
};
