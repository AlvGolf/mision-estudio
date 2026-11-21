// Verificación automática de los juegos de Misión Estudio.
//
//   npm run verificar                  → todos los juegos
//   npm run verificar -- ingles-u2     → solo uno (vale también la beta: ingles-u2-beta)
//   npm run verificar -- ingles-u2 --ver   → con la ventana de Chrome visible
//
// Qué hace, por cada juego:
//   1. Cobertura: compara <juego>/temario.json con los datos del juego (cada palabra
//      con traducción y frase con hueco, cada verbo con sus formas y su frase, las
//      partes del vocabulario, las opciones falsas de otro tipo de palabra y las tres
//      formas de cada punto de gramática).
//   2. A 390, 820 y 1440 px: busca desbordes horizontales en cada pantalla, revisa los
//      campos de texto, juega la ruta entera ARRASTRANDO con el ratón (unas respuestas
//      bien y otras mal, para probar los dos caminos), hace el examen y comprueba que
//      el boletín da la nota final.
// El ranking se simula: nunca se escribe en la hoja de Google de verdad.
// Las capturas quedan en verificacion/<juego>/ (fuera de git).
// Sale con código 1 si hay algún FALLO; los AVISOS no bloquean.

import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARGS = process.argv.slice(2);
const VER = ARGS.includes('--ver');
const ANCHOS = [
  { n: 390, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  { n: 820, viewport: { width: 820, height: 1180 }, isMobile: true, hasTouch: true },
  { n: 1440, viewport: { width: 1440, height: 900 } },
];
const ES_REDIRECCION = f => /http-equiv="refresh"/i.test(fs.readFileSync(f, 'utf8').slice(0, 800));

let juegos = ARGS.filter(a => !a.startsWith('--'));
if (!juegos.length) {
  juegos = fs.readdirSync(RAIZ, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && !['node_modules', 'scripts', 'verificacion', 'apps-script', 'iconos', 'menu-beta'].includes(d.name))
    .map(d => d.name)
    .filter(n => fs.existsSync(path.join(RAIZ, n, 'index.html')) && !ES_REDIRECCION(path.join(RAIZ, n, 'index.html')));
}

/* ---------- Servidor local (las páginas se sirven igual que en GitHub Pages) ---------- */
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg' };
const servidor = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(RAIZ, p);
  if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TIPOS[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => servidor.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${servidor.address().port}`;

const navegador = await chromium.launch({ channel: 'chrome', headless: !VER, args: ['--mute-audio'] });
const RESUMEN = [];

for (const juego of juegos) {
  const R = { juego, fallos: [], avisos: [], notas: [] };
  RESUMEN.push(R);
  const fallo = (m) => { if (!R.fallos.includes(m)) R.fallos.push(m); };
  const aviso = (m) => { if (!R.avisos.includes(m)) R.avisos.push(m); };
  const dirCapturas = path.join(RAIZ, 'verificacion', juego);
  fs.rmSync(dirCapturas, { recursive: true, force: true });
  fs.mkdirSync(dirCapturas, { recursive: true });
  const temarioF = path.join(RAIZ, juego.replace(/-beta$/, ''), 'temario.json');
  const temarioBeta = path.join(RAIZ, juego, 'temario.json');
  const temario = fs.existsSync(temarioBeta) ? JSON.parse(fs.readFileSync(temarioBeta, 'utf8'))
    : fs.existsSync(temarioF) ? JSON.parse(fs.readFileSync(temarioF, 'utf8')) : null;
  if (!temario) aviso('No hay temario.json: no se comprueba la cobertura');

  for (const A of ANCHOS) {
    const tag = `${A.n}px`;
    const ctx = await navegador.newContext({ viewport: A.viewport, isMobile: !!A.isMobile, hasTouch: !!A.hasTouch, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { if (!localStorage.getItem('mision_name')) localStorage.setItem('mision_name', 'Prueba'); } catch (e) { } });
    await ctx.route('**/*', async r => {
      const u = r.request().url();
      if (u.startsWith(BASE) || /fonts\.(googleapis|gstatic)\.com/.test(u)) return r.continue();
      if (/script\.google(usercontent)?\.com/.test(u)) {
        return r.fulfill({ contentType: 'application/json', body: r.request().method() === 'POST' ? '{"ok":true}' : '{"rows":[]}' });
      }
      return r.abort();
    });
    const page = await ctx.newPage();
    page.on('pageerror', e => fallo(`[${tag}] Error de JavaScript: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) fallo(`[${tag}] Error en consola: ${m.text()}`); });
    page.on('dialog', d => { aviso(`[${tag}] El juego abre una ventana del navegador: «${d.message()}»`); d.dismiss(); });

    await page.goto(`${BASE}/${juego}/`, { waitUntil: 'load' });
    await page.waitForTimeout(300);

    /* ---------- 1. Cobertura (una vez por juego) ---------- */
    if (temario && A === ANCHOS[0]) {
      const c = await page.evaluate(comprobarCobertura, temario);
      c.F.forEach(fallo); c.A.forEach(aviso);
      R.notas.push(`Cobertura: ${c.n.vocab} palabras, ${c.n.verbos} verbos y ${c.n.gram} puntos del temario comprobados`);
    }

    /* ---------- Comprobaciones de cada pantalla ---------- */
    const vistas = new Set();
    const revisarPantalla = async (donde) => {
      const d = await page.evaluate(() => {
        const de = document.documentElement, w = de.clientWidth;
        let desb = null;
        if (de.scrollWidth > w + 1) {
          const quien = [...document.querySelectorAll('body *')]
            .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > w + 1 && getComputedStyle(e).position !== 'fixed' && (e.id || (typeof e.className === 'string' && e.className.trim())); })
            .slice(0, 3).map(e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).join('.') : ''));
          desb = { ancho: de.scrollWidth, w, quien };
        }
        const campos = [...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=hidden]), textarea')].map(e => ({
          id: e.id || e.name || e.placeholder || e.tagName.toLowerCase(),
          ac: (e.getAttribute('autocorrect') || '').toLowerCase(), cap: (e.getAttribute('autocapitalize') || '').toLowerCase(),
          sp: (e.getAttribute('spellcheck') || '').toLowerCase(), fs: parseFloat(getComputedStyle(e).fontSize), vis: e.offsetParent !== null,
        }));
        return { desb, campos };
      });
      if (d.desb) {
        const clave = donde + d.desb.quien.join();
        if (!vistas.has(clave)) {
          vistas.add(clave);
          fallo(`[${tag}] Desborde horizontal en «${donde}»: la página mide ${d.desb.ancho}px de ancho (pantalla ${d.desb.w}px). Se sale: ${d.desb.quien.join(', ')}`);
          await page.screenshot({ path: path.join(dirCapturas, `${A.n}-desborde-${vistas.size}.png`) });
        }
      }
      for (const f of d.campos) {
        if (!f.vis) continue;
        const malos = [];
        if (f.ac !== 'off') malos.push('autocorrect');
        if (!['off', 'none'].includes(f.cap)) malos.push('autocapitalize');
        if (f.sp !== 'false') malos.push('spellcheck');
        if (malos.length) aviso(`Campo «${f.id}»: sin desactivar ${malos.join(', ')} (regla del proyecto)`);
        if (f.fs < 16) fallo(`[${tag}] Campo «${f.id}» con letra de ${f.fs}px (mínimo 16; el móvil hace zoom)`);
      }
    };
    const titulo = () => page.evaluate(() => (document.querySelector('#app h2')?.textContent || document.title).trim());
    const visible = s => page.locator(s).first().isVisible().catch(() => false);

    await revisarPantalla('menú');
    await page.screenshot({ path: path.join(dirCapturas, `${A.n}-menu.png`), fullPage: true });

    /* ---------- 2. La ruta entera ---------- */
    /* Duración de la ruta según el curso (el padre, 20-nov): 2º, de 15 a 20 minutos en total; 5º, de 30 a 35 */
    if (A === ANCHOS[0]) {
      const d = await page.evaluate(() => ({ suma: typeof ROUTE_ST !== 'undefined' ? ROUTE_ST.reduce((a, s) => a + (s.min || 0), 0) : null, min: typeof JUEGO !== 'undefined' && JUEGO.ruta ? JUEGO.ruta.minutos : null }));
      const curso = temario && String(temario.curso || '');
      const pide = /2/.test(curso) ? [15, 20] : /5/.test(curso) ? [30, 35] : null;
      if (d.suma != null && pide) {
        if (d.suma < pide[0] || d.suma > pide[1]) aviso(`La ruta suma ${d.suma} minutos y en ${curso} tiene que durar de ${pide[0]} a ${pide[1]}: ajusta los «min» de ROUTE_ST`);
        if (!d.min) aviso(`JUEGO.ruta.minutos no está puesto: el botón dirá «unos 30 minutos» (en ${curso}: «${pide[0]} a ${pide[1]}»)`);
      }
    }
    const tieneRuta = await visible('.routebtn');
    if (!tieneRuta) { aviso(`[${tag}] No hay botón de ruta de estudio: no se juega la ruta`); await ctx.close(); continue; }
    await page.click('.routebtn');
    await page.click('#rgo');
    // La primera estación se hace pasar por 4 minutos: al acabarla, el mapa tiene que decir «tú: 4 min»
    await page.evaluate(() => { if (typeof ROUTE !== 'undefined' && ROUTE && ROUTE.t0) { ROUTE.t0 -= 240000; saveRoute(); } });
    let pasos = 0, estaciones = 1, atasco = 0, ultimo = '', n = 0;
    const t0 = Date.now();
    const mal = () => (++n % 3 === 0); // una de cada tres, mal a propósito

    for (let vuelta = 0; vuelta < 3000; vuelta++) {
      if (await visible('.routeend')) break;
      if (await visible('#rnext')) {
        await revisarPantalla('fin de estación');
        if (estaciones === 1) {
          await page.screenshot({ path: path.join(dirCapturas, `${A.n}-fin-estacion.png`) });
          const mapa = await page.locator('.rmap').innerText().catch(() => '');
          if (/~\d+ min|tú: \d+ min/.test(mapa)) { if (!/tú: 4 min/.test(mapa)) fallo(`[${tag}] El mapa de la ruta no apunta lo que tardó la primera estación (debía decir «tú: 4 min»)`); }
          else aviso(`[${tag}] El mapa de la ruta no enseña los minutos de cada estación (motor antiguo)`);
        }
        await page.click('#rnext'); estaciones++; continue;
      }
      const t = await titulo();
      const S = await page.evaluate(() => (document.querySelector('#stage') && !document.querySelector('#nx .btn')) ? window._S : null);
      if (S) {
        pasos++; atasco = 0;
        if (pasos === 3) await page.screenshot({ path: path.join(dirCapturas, `${A.n}-paso.png`) });
        await jugarPaso(page, S, mal(), tag, t, { fallo, aviso });
        await revisarPantalla(`${t} · ${S.t}`);
        const nx = page.locator('#nx .btn');
        if (await nx.isVisible().catch(() => false)) await nx.click();
        else { fallo(`[${tag}] «${t}»: tras responder (${S.t}) no sale el botón Siguiente`); break; }
        continue;
      }
      if (await visible('#src .chip')) { pasos++; atasco = 0; await jugarOrdenar(page, mal(), tag, t, { fallo }); await revisarPantalla(`${t} · ordenar`); continue; }
      if (await visible('input#a')) { pasos++; atasco = 0; await jugarEscrito(page, mal(), tag, t, { fallo }); await revisarPantalla(`${t} · escribir`); continue; }
      if (await visible('#again')) { fallo(`[${tag}] La ruta se corta en «${t}»: sale «Repetir» en vez de la siguiente estación`); break; }
      if (++atasco > 60) {
        fallo(`[${tag}] La ruta se queda atascada en «${t}» (no reconozco el ejercicio)`);
        await page.screenshot({ path: path.join(dirCapturas, `${A.n}-atasco.png`) }); break;
      }
      if (t !== ultimo) { ultimo = t; atasco = 0; }
      await page.waitForTimeout(50);
    }
    const acabada = await visible('.routeend');
    if (acabada) {
      R.notas.push(`[${tag}] Ruta completa: ${estaciones} estaciones, ${pasos} ejercicios, ${Math.round((Date.now() - t0) / 1000)} s`);
      await revisarPantalla('ruta completada');
      await page.screenshot({ path: path.join(dirCapturas, `${A.n}-ruta-completada.png`) });
    } else fallo(`[${tag}] La ruta no se completa (iba por la estación ${estaciones}, ${pasos} ejercicios)`);

    /* ---------- 3. Examen final ---------- */
    const btnExamen = page.locator('.routeend .btn');
    if (acabada && await btnExamen.count()) {
      await btnExamen.first().click();
      if (await visible('#go')) { await page.click('#go'); await page.waitForSelector('#app .opt', { timeout: 8000 }).catch(() => {}); }
      let preguntas = 0;
      for (let k = 0; k < 60 && await visible('#app .opt'); k++) { await page.locator('#app .opt').first().click(); preguntas++; }
      const txt = await page.locator('#app').innerText();
      if (/Nota/.test(txt)) R.notas.push(`[${tag}] Examen: ${preguntas} preguntas y sale la nota`);
      else fallo(`[${tag}] El examen no termina con nota (${preguntas} preguntas contestadas)`);
      await revisarPantalla('resultado del examen');
    }

    /* ---------- 4. Boletín con nota final ---------- */
    const fin = await page.evaluate(() => { try { if (typeof home === 'function') home(); return typeof finalNota === 'function' ? finalNota() : null; } catch (e) { return { err: e.message }; } });
    await page.waitForTimeout(200);
    if (fin && fin.miss) fallo(`[${tag}] Tras la ruta faltan ${fin.miss} bloques sin nota: el boletín no da la nota final`);
    await revisarPantalla('menú tras la ruta');

    /* ---------- 5. Nota real del colegio: se apunta, se ve y sigue al recargar ---------- */
    if (await visible('#realx')) {
      await page.click('#realx');
      await page.fill('#realn', '7,5'); await page.click('#realok'); await page.waitForTimeout(150);
      const ve = async () => (await page.locator('#realbox').innerText().catch(() => '')).includes('7,5');
      if (!await ve()) fallo(`[${tag}] Apuntar la nota del colegio (7,5) no la enseña en el boletín`);
      else {
        await page.reload(); await page.waitForTimeout(400);
        if (!await ve()) fallo(`[${tag}] La nota del colegio no se guarda: al recargar desaparece`);
        else R.notas.push(`[${tag}] Nota del colegio: se apunta y se guarda`);
      }
      await revisarPantalla('nota del colegio');
    } else aviso(`[${tag}] El boletín no tiene la casilla de la nota del colegio (motor antiguo)`);
    await page.screenshot({ path: path.join(dirCapturas, `${A.n}-menu-final.png`), fullPage: true });
    await ctx.close();
  }
}

/* ---------- Menú principal: la suite (21-nov), pinta las tarjetas desde juegos.js ---------- */
{
  const R = { juego: 'menú principal', fallos: [], avisos: [], notas: [] };
  RESUMEN.push(R);
  for (const A of ANCHOS) for (const curso of ['5', '2']) {
    const ctx = await navegador.newContext({ viewport: A.viewport, isMobile: !!A.isMobile });
    await ctx.addInitScript(c => localStorage.setItem('mision_curso', c), curso);
    const page = await ctx.newPage();
    const errores = [];
    page.on('pageerror', e => errores.push(e.message));
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    errores.forEach(e => R.fallos.push(`[${A.n}px, ${curso}º] Error en la página: ${e}`));
    const enlaces = await page.$$eval('#app a', as => as.map(a => a.getAttribute('href')));
    const juegos = await page.evaluate(c => JUEGOS.filter(j => String(j.curso) === c).length, curso);
    const tarjetas = await page.$$eval('.tarj', a => a.length);
    if (tarjetas !== juegos) R.fallos.push(`[${A.n}px, ${curso}º] Hay ${juegos} juegos de ${curso}º en juegos.js y el menú enseña ${tarjetas}`);
    for (const href of enlaces) {
      const dest = path.join(RAIZ, href.replace(/\/$/, '/index.html'));
      if (!fs.existsSync(dest)) R.fallos.push(`El menú enlaza a «${href}», que no existe`);
    }
    const d = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (d > 1) R.fallos.push(`[${A.n}px, ${curso}º] El menú desborda ${d}px en horizontal`);
    await page.screenshot({ path: path.join(RAIZ, 'verificacion', `menu-suite-${A.n}-${curso}.png`), fullPage: true });
    await ctx.close();
  }
  if (!R.fallos.length) R.notas.push(`Cursos 5º y 2º a ${ANCHOS.map(a => a.n).join(', ')} px: tarjetas y enlaces bien, sin desbordes`);
}

await navegador.close();
servidor.close();

/* ---------- Informe ---------- */
let hayFallos = false;
for (const R of RESUMEN) {
  console.log(`\n══ ${R.juego} ══`);
  R.notas.forEach(x => console.log('  ✓ ' + x));
  R.fallos.forEach(x => console.log('  ✗ FALLO: ' + x));
  R.avisos.forEach(x => console.log('  · aviso: ' + x));
  if (R.fallos.length) hayFallos = true;
  if (!R.fallos.length && !R.avisos.length) console.log('  Todo bien.');
}
console.log(`\n${hayFallos ? '✗ HAY FALLOS: no se sube hasta arreglarlos.' : '✓ Sin fallos.'}  Capturas en verificacion/`);
process.exit(hayFallos ? 1 : 0);

/* =====================================================================
   Jugadores de cada formato
   ===================================================================== */
async function arrastrar(page, de, a) {
  const cab = await page.evaluate(() => document.querySelector('header')?.getBoundingClientRect().bottom || 0);
  const vh = page.viewportSize().height;
  const dentro = r => r && r.y >= cab && r.y + r.height <= vh;
  await a.scrollIntoViewIfNeeded();
  let A = await de.boundingBox(), B = await a.boundingBox();
  if (!dentro(A) || !dentro(B)) {
    await page.evaluate(([y1, y2, c]) => window.scrollBy(0, (y1 + y2) / 2 - (innerHeight + c) / 2), [A.y, B.y, cab]);
    A = await de.boundingBox(); B = await a.boundingBox();
  }
  if (!dentro(A) || !dentro(B)) return false;
  const ax = A.x + A.width / 2, ay = A.y + A.height / 2, bx = B.x + B.width / 2, by = B.y + B.height / 2;
  await page.mouse.move(ax, ay);
  await page.mouse.down();
  await page.mouse.move(ax + 12, ay + 6, { steps: 3 });
  await page.mouse.move(bx, by, { steps: 12 });
  await page.mouse.up();
  return true;
}

async function jugarPaso(page, S, mal, tag, t, { fallo, aviso }) {
  const st = page.locator('#stage');
  const arrastrarOTocar = async (de, a, que) => {
    if (await arrastrar(page, de, a)) return;
    aviso(`[${tag}] «${t}» (${que}): la ficha y su destino no caben a la vez en pantalla; el niño no puede arrastrar, solo tocar`);
    await de.click();
    if (que !== 'hueco') await a.click();
  };
  switch (S.t) {
    case 'mc': {
      const opts = st.locator('.opt'); const k = await opts.count();
      const txt = await opts.allTextContents(); const bien = txt.indexOf(S.a);
      await opts.nth(mal ? (bien === 0 ? 1 : 0) : bien).click();
      break;
    }
    case 'gap': {
      const chips = st.locator('.tray .chip'); const txt = await chips.allTextContents(); const bien = txt.indexOf(S.a);
      const elegido = mal ? (bien === 0 ? 1 : 0) : bien;
      await arrastrarOTocar(chips.nth(elegido), page.locator('#gp'), 'hueco');
      if (!await page.locator('#gp.ok, #gp.bad').count()) fallo(`[${tag}] «${t}»: arrastrar la palabra al hueco no la coloca`);
      break;
    }
    case 'lines': {
      for (let i = 0; i < S.pairs.length; i++) {
        const izq = st.locator(`.lft[data-i="${i}"]`);
        if (mal && i === 0 && S.pairs.length > 1) {
          await arrastrarOTocar(izq, st.locator(`.rgt[data-i="1"]`), 'líneas');
          await page.waitForTimeout(550);
        }
        await arrastrarOTocar(izq, st.locator(`.rgt[data-i="${i}"]`), 'líneas');
        if (!await izq.evaluate(e => e.classList.contains('done'))) { fallo(`[${tag}] «${t}»: unir con líneas no une la pareja ${i + 1}`); return; }
      }
      break;
    }
    case 'bins': {
      for (let k = 0; k < S.items.length; k++) {
        const it = S.items[k], ficha = st.locator(`#bt .chip[data-k="${k}"]`);
        if (mal && k === 0 && S.bins.length > 1) {
          await arrastrarOTocar(ficha, st.locator(`.bin[data-b="${(it.b + 1) % S.bins.length}"]`), 'cajas');
          await page.waitForTimeout(450);
        }
        await arrastrarOTocar(ficha, st.locator(`.bin[data-b="${it.b}"]`), 'cajas');
        if (!await ficha.evaluate(e => e.classList.contains('used'))) { fallo(`[${tag}] «${t}»: arrastrar «${it.t}» a su caja no la coloca`); return; }
      }
      break;
    }
    case 'tiles': {
      const obj = S.a.toLowerCase();
      const ficha = c => page.locator('#tp .chip.lt:not(.used)').filter({ hasText: new RegExp(`^${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first();
      const poner = async (letras, primeraArrastrada) => {
        for (let k = 0; k < letras.length; k++) {
          if (k === 0 && primeraArrastrada) await arrastrarOTocar(ficha(letras[0]), page.locator('.slot[data-n="0"]'), 'fichas');
          else await ficha(letras[k]).click();
        }
      };
      if (mal) {
        await poner([...obj].reverse(), false);
        await page.waitForTimeout(450);
        if (!await page.locator('#nx .btn').count()) for (let k = 0; k < obj.length; k++) await page.click('#clr');
      }
      if (!await page.locator('#nx .btn').count()) await poner([...obj], true);
      break;
    }
    case 'swipe': {
      const carta = page.locator('#sc'); const b = await carta.boundingBox();
      const derecha = S.ok !== mal; const dx = derecha ? 140 : -140;
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await page.mouse.down();
      await page.mouse.move(b.x + b.width / 2 + dx, b.y + b.height / 2, { steps: 12 });
      await page.mouse.up();
      break;
    }
    case 'type': {
      const campo = st.locator('input.typ');
      await campo.fill(mal ? 'x' : S.acc[0]);
      await campo.press('Enter');
      if (!mal && !await campo.evaluate(e => e.classList.contains('ok'))) fallo(`[${tag}] «${t}»: escribir la respuesta correcta («${S.acc[0]}») la da por mala`);
      break;
    }
    case 'listen': {
      await st.locator('#hb').click(); // oír no puede romper nada
      const opts = st.locator('.opt'); const txt = await opts.allTextContents(); const bien = txt.indexOf(S.a);
      if (bien < 0) { fallo(`[${tag}] «${t}»: escuchar y elegir no tiene la respuesta «${S.a}» entre las opciones`); break; }
      await opts.nth(mal ? (bien === 0 ? 1 : 0) : bien).click();
      break;
    }
    case 'dictado': {
      const campo = st.locator('#wa');
      await campo.fill(mal ? 'x' : S.say.toUpperCase().replace(/[.?!]/g, '')); // mayúsculas y sin puntos: debe valer
      await campo.press('Enter');
      if (!mal && !await campo.evaluate(e => e.classList.contains('ok'))) fallo(`[${tag}] «${t}»: el dictado da por mala la frase correcta en mayúsculas y sin puntos («${S.say}»)`);
      break;
    }
    case 'repair': {
      if (mal) await st.locator(`.tok[data-k="${S.bad === 0 ? 1 : 0}"]`).click();
      await st.locator(`.tok[data-k="${S.bad}"]`).click();
      const campo = st.locator('#wa');
      if (!await campo.count()) { fallo(`[${tag}] «${t}»: tocar la palabra mala no deja escribir el arreglo`); break; }
      await campo.fill(S.fix[0]); await campo.press('Enter');
      if (!await campo.evaluate(e => e.classList.contains('ok'))) fallo(`[${tag}] «${t}»: el arreglo correcto («${S.fix[0]}») sale como malo`);
      break;
    }
    case 'cross': {
      for (const [i, w] of S.words.entries())
        for (let k = 0; k < w.w.length; k++) {
          const r = w.r + (w.d === 'v' ? k : 0), c = w.c + (w.d === 'h' ? k : 0);
          await st.locator(`[data-rc="${r},${c}"]`).fill(mal && i === 0 && k === w.w.length - 1 ? 'z' : w.w[k]);
        }
      await st.locator('#wchk').click();
      if (!mal && await st.locator('.cell input.bad').count()) fallo(`[${tag}] «${t}»: el crucigrama bien rellenado tiene casillas en rojo`);
      if (mal && !await st.locator('.cell input.bad').count()) fallo(`[${tag}] «${t}»: el crucigrama no marca la letra mal puesta`);
      break;
    }
    case 'first': {
      const casillas = st.locator('.letras input'); const n = await casillas.count();
      for (let k = 0; k < n; k++) { const c = casillas.nth(k); const pos = +(await c.getAttribute('data-k')); await c.fill(mal && k === 0 ? 'z' : S.w[pos].toLowerCase()); }
      await st.locator('#wchk').click();
      if (!mal && await st.locator('.letras input.bad').count()) fallo(`[${tag}] «${t}»: la palabra con la primera letra bien escrita («${S.w}») sale como mala`);
      break;
    }
    case 'scene': {
      for (const [k, p] of S.gente.entries()) {
        await st.locator(`.per[data-p="${k}"]`).click();
        if (mal && k === 0) {
          const otro = S.sitios.find(z => z.k !== p.z).k;
          await st.locator(`.zona[data-z="${otro}"]`).click();
          if (await st.locator(`.per[data-p="${k}"].puesto`).count()) { fallo(`[${tag}] «${t}»: la escena acepta a ${p.n} en un sitio que no es el suyo`); break; }
        }
        await st.locator(`.zona[data-z="${p.z}"]`).click();
        if (!await st.locator(`.per[data-p="${k}"].puesto`).count()) { fallo(`[${tag}] «${t}»: llevar a ${p.n} a su sitio («${p.z}») no lo coloca`); break; }
      }
      break;
    }
    case 'probe': {
      const opts = st.locator('.opt'); const txt = await opts.allTextContents(); const bien = txt.indexOf(S.a);
      if (bien < 0) { fallo(`[${tag}] «${t}»: la miniinvestigación no tiene la respuesta «${S.a}» entre las opciones`); break; }
      await opts.nth(mal ? (bien === 0 ? 1 : 0) : bien).click();
      if (!mal && !/✅/.test(await page.locator('#fb').innerText())) fallo(`[${tag}] «${t}»: la respuesta correcta de la miniinvestigación («${S.a}») sale como mala`);
      if (S.planes && Object.keys(S.planes).some(o => !S.opts.includes(o))) fallo(`[${tag}] «${t}»: un plan de la miniinvestigación no coincide con ninguna opción`);
      break;
    }
    case 'story': {
      for (const [i, n] of S.nodos.entries()) {
        const listo = `#stage[data-nodo="${i}"] #hans ${n.opts ? '.opt:not([disabled])' : '#wa:not([disabled])'}`;
        const responde = async bien => {
          await page.locator(listo).first().waitFor({ timeout: 3000 });
          if (n.opts) { const o = page.locator('#hans .opt'); const txt = await o.allTextContents(); const k = txt.indexOf(n.a); await o.nth(bien ? k : (k === 0 ? 1 : 0)).click(); }
          else { await page.locator('#wa').fill(bien ? n.acc[0] : 'x'); await page.locator('#wa').press('Enter'); }
        };
        // Cada historia prueba sus tres caminos: a la primera, fallo + repaso + acierto (nodo 2) y dos fallos (nodo 3: enseña la respuesta y sigue)
        const fallos = i === 1 || (mal && i === 0) ? 1 : i === 2 ? 2 : 0;
        if (fallos) {
          await responde(false);
          if (!await page.locator('#hrep .repaso').waitFor({ timeout: 3000 }).then(() => true, () => false)) { fallo(`[${tag}] «${t}»: fallar una decisión de la historia no lleva al repaso`); break; }
        }
        if (fallos === 2) {
          await responde(false);
          if (!await page.locator('#hs').count() || !/Era:/.test(await page.locator('#hfb').innerText())) { fallo(`[${tag}] «${t}»: tras dos fallos la historia no enseña la respuesta ni sigue`); break; }
        } else await responde(true);
        if (!await page.locator('#hs').count()) { fallo(`[${tag}] «${t}»: la historia no sigue tras la decisión ${i + 1} bien contestada`); break; }
        await page.click('#hs');
      }
      break;
    }
    default:
      fallo(`[${tag}] «${t}»: formato de ejercicio desconocido para el verificador (${S.t})`);
  }
  await page.locator('#nx .btn').waitFor({ timeout: 2500 }).catch(() => { });
}

async function jugarOrdenar(page, mal, tag, t, { fallo }) {
  const O = await page.evaluate(() => window._O && window._O.w);
  const n = O ? O.length : await page.locator('#src .chip').count();
  const tocar = async orden => { for (const k of orden) await page.click(`#src .chip[data-k="${k}"]`); };
  const bien = [...Array(n).keys()];
  if (mal && n > 1) {
    await tocar([...bien].reverse());
    await page.click('#chk');
    while (await page.locator('#dst .chip').count()) await page.locator('#dst .chip').first().click();
  }
  await tocar(bien);
  await page.click('#chk');
  if (!/Siguiente/.test(await page.locator('#chk').innerText())) { fallo(`[${tag}] «${t}»: ordenar la frase bien no da paso a la siguiente`); return; }
  await page.click('#chk');
}

async function jugarEscrito(page, mal, tag, t, { fallo }) {
  const info = await page.evaluate(() => ({
    q: document.querySelector('#app .q')?.textContent || '',
    hint: [...document.querySelectorAll('#app .hint')].map(x => x.textContent).join(' '),
    verbos: typeof VERBS !== 'undefined' ? VERBS : [],
  }));
  const v = info.verbos.find(x => info.q.startsWith(x[0] + ' (') || info.hint.includes('(' + x[0] + ' ·'));
  const dos = await page.locator('input#b').isVisible().catch(() => false);
  await page.fill('input#a', v && !mal ? v[1][0] : 'x');
  if (dos) await page.fill('input#b', v && !mal ? v[2][0] : 'x');
  await page.click('#chk');
  if (!/Siguiente/.test(await page.locator('#chk').innerText())) { fallo(`[${tag}] «${t}»: tras escribir y comprobar no sale Siguiente`); return; }
  await page.click('#chk');
}

/* =====================================================================
   Cobertura: se ejecuta DENTRO de la página del juego
   ===================================================================== */
function comprobarCobertura(T) {
  const F = [], A = [];
  const g = n => { try { return (0, eval)(n); } catch (e) { return undefined; } };
  const VOC = g('VOCAB'), VER = g('VERBS'), VS = g('VSENT'), VP = g('VPARTS'), sq = g('vocabSentQ');
  const J = x => JSON.stringify(x);
  if (T.vocabulario && T.vocabulario.length) {
    if (!VOC) F.push('El temario tiene vocabulario, pero el juego no tiene lista VOCAB');
    else {
      const m = new Map(VOC.map(w => [w[0], w]));
      for (const x of T.vocabulario) {
        const w = m.get(x.en);
        if (!w) { F.push(`Palabra del temario sin ejercicio: «${x.en}»`); continue; }
        if (!w[1]) F.push(`«${x.en}» no tiene traducción`);
        else if (x.es && w[1] !== x.es) A.push(`«${x.en}»: el temario dice «${x.es}» y el juego «${w[1]}»`);
        if (!/_{3,}/.test(w[3] || '')) F.push(`«${x.en}» no tiene frase con hueco`);
      }
      for (const w of VOC) if (!T.vocabulario.some(x => x.en === w[0])) A.push(`El juego pregunta «${w[0]}», que no está en el temario`);
      if (VP) {
        const todas = VP.some(p => p.a === 0 && p.b === VOC.length);
        if (!todas) F.push('Falta la opción con todas las palabras del vocabulario');
        let c = 0;
        for (const p of VP.filter(p => !(p.a === 0 && p.b === VOC.length)).sort((x, y) => x.a - y.a)) {
          if (p.a !== c) F.push(`Las partes del vocabulario se saltan o repiten palabras (en la ${c + 1})`);
          if (p.b - p.a > 20) A.push(`La parte «${p.l}» tiene ${p.b - p.a} palabras (objetivo: unas 17)`);
          c = p.b;
        }
        if (VP.length > 1 && c !== VOC.length) F.push('Las partes del vocabulario no llegan a la última palabra');
      } else if (VOC.length > 20) F.push(`Vocabulario de ${VOC.length} palabras sin partes`);
      if (sq) {
        const tipo = new Map(VOC.map(w => [w[4] || w[0], w[2]]));
        for (const w of VOC) for (let k = 0; k < 10; k++) {
          const q = sq(w);
          if (!q.opts.includes(q.a)) { F.push(`Frase de «${w[0]}»: la respuesta no está entre las opciones`); break; }
          const igual = q.opts.filter(o => o !== q.a && tipo.get(o) === w[2]);
          if (igual.length) { F.push(`Frase de «${w[0]}»: la opción falsa «${igual[0]}» es del mismo tipo de palabra y podría encajar`); break; }
        }
      } else A.push('No encuentro vocabSentQ: no se comprueban las opciones falsas de las frases');
    }
  }
  for (const v of T.verbos || []) {
    const x = VER && VER.find(y => y[0] === v.base);
    if (!x) { F.push(`Verbo del temario sin ejercicio: «${v.base}»`); continue; }
    if (J(x[1]) !== J(v.pasado) || J(x[2]) !== J(v.participio)) F.push(`«${v.base}»: las formas del juego no coinciden con el temario`);
    if (!VS || !/_{3,}/.test(VS[v.base] || '')) F.push(`«${v.base}» no tiene frase`);
  }
  /* gramatica (Inglés) y puntos (cualquier asignatura): cada punto del temario dice qué lista del juego lo practica de cada forma ('-' si no aplica) */
  for (const p of [...(T.gramatica || []), ...(T.puntos || [])]) for (const f of ['test', 'escribir', 'ordenar']) {
    const n = p[f];
    if (n === '-') continue;
    if (n == null) { A.push(`Punto «${p.punto}»: falta la forma «${f}»`); continue; }
    const arr = g(n);
    if (!Array.isArray(arr) || !arr.length) F.push(`Punto «${p.punto}»: la lista ${n} no existe en el juego o está vacía`);
  }
  return { F, A, n: { vocab: (T.vocabulario || []).length, verbos: (T.verbos || []).length, gram: (T.gramatica || []).length + (T.puntos || []).length } };
}
