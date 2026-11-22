/* Los iconos de las dos apps (el padre, 22-nov): 5º, el ME con «Misión Estudio» sobre azul; 2º, el cohete que sale del libro.
   Se dibujan aquí, en proporción, y se pasan a PNG con Chrome:  node scripts/iconos.mjs [carpeta de salida]
   - «any» (Android e iPhone): lo más grande posible dejando margen para las esquinas redondeadas.
   - «maskable» (Android recorta con círculo, gota…): todo dentro del círculo seguro, el 80 % central.
   El ME y el nombre se escalan por separado: el nombre es el doble de ancho que el ME y, juntos, el ME se quedaba pequeño. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.argv[2] || path.join(RAIZ, 'iconos'));
const FONDO = `<defs><radialGradient id="f" cx="50%" cy="20%" r="100%"><stop offset="0" stop-color="#2f3f99"/><stop offset="1" stop-color="#0b1230"/></radialGradient></defs><rect width="512" height="512" fill="url(#f)"/>`;

/* El logo en negativo: [0] el ME, [1] el visto rojo, [2] «Misión Estudio» (medidos con getBBox) */
const P = [...fs.readFileSync(path.join(RAIZ, 'marca', 'descriptor-negativo.svg'), 'utf8').matchAll(/<path d="([^"]+)"/g)].map(m => m[1]);
const ME = { x: 18, y: 16, w: 134, h: 97 }, NOM = { x: -48, y: 132, w: 265, h: 28 };
/* sube: cuánto se sube el conjunto sobre el centro (el visto rojo sube por encima de las letras y, centrado, el ME parecía bajo) */
function me(anchoME, anchoNom, hueco, sube) {
  const s1 = anchoME / ME.w, s2 = anchoNom / NOM.w, alto = ME.h * s1 + hueco + NOM.h * s2, y0 = (512 - alto) / 2 - sube;
  const g1 = `translate(${(512 - anchoME) / 2 - ME.x * s1} ${y0 - ME.y * s1}) scale(${s1})`;
  const g2 = `translate(${(512 - anchoNom) / 2 - NOM.x * s2} ${y0 + ME.h * s1 + hueco - NOM.y * s2}) scale(${s2})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${FONDO}
  <g transform="${g1}"><path d="${P[0]}" fill="#FFFFFF"/><path d="${P[1]}" fill="#EE3B4F"/></g>
  <g transform="${g2}"><path d="${P[2]}" fill="#FFFFFF"/></g></svg>`;
}

/* El cohete: el mismo dibujo, con el cohete y el libro más grandes (las estrellas se quedan donde estaban) */
function cohete(escala) {
  const s = fs.readFileSync(path.join(RAIZ, 'iconos', 'cohete', 'icono.svg'), 'utf8');
  const i = s.indexOf('<path d="M256 362'), j = s.lastIndexOf('<path d="M110.0 114.0');
  const dibujo = s.slice(i, j), resto = s.slice(j);
  return s.slice(0, i) + `<g transform="translate(256 255) scale(${escala}) translate(-256 -255)">${dibujo}</g>` + resto;
}

const ICONOS = {
  '': { any: me(330, 370, 30, 16), mask: me(256, 300, 22, 10) },
  'cohete': { any: cohete(1.2), mask: cohete(1.08) },
};

const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage();
for (const [dir, I] of Object.entries(ICONOS)) {
  const d = path.join(OUT, dir); fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'icono-any.svg'), I.any); fs.writeFileSync(path.join(d, 'icono-mask.svg'), I.mask);
  for (const [f, svg, px] of [['icono-512.png', I.any, 512], ['icono-192.png', I.any, 192], ['apple-touch-icon.png', I.any, 180], ['icono-mask-512.png', I.mask, 512]]) {
    await p.setViewportSize({ width: px, height: px });
    await p.setContent(`<style>html,body{margin:0}svg{display:block;width:${px}px;height:${px}px}</style>${svg}`);
    await p.screenshot({ path: path.join(d, f), clip: { x: 0, y: 0, width: px, height: px } });
  }
  console.log('Iconos en ' + path.relative(RAIZ, d));
}
await b.close();
