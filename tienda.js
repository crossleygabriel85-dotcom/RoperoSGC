/* ================================================================
   ROPERO SG — Lógica de la tienda
   No necesitas editar este archivo para operar el ropero.
   Para agregar prendas o cambiar textos, usa js/datos.js
   ================================================================ */

/* ---------- Guardado local (con respaldo en memoria) ------------- */
const memoria = {};
const almacen = {
  leer(clave, porDefecto){
    try{
      const v = localStorage.getItem(clave);
      return v ? JSON.parse(v) : porDefecto;
    }catch(e){
      return (clave in memoria) ? memoria[clave] : porDefecto;
    }
  },
  guardar(clave, valor){
    try{ localStorage.setItem(clave, JSON.stringify(valor)); }
    catch(e){ memoria[clave] = valor; }
  }
};

/* ---------- Estado de la aplicación ----------------------------- */
const estado = {
  prendas:       almacen.leer("ropero_prendas", null) || structuredClone(PRENDAS),
  carrito:       almacen.leer("ropero_carrito", []),
  pedidos:       almacen.leer("ropero_pedidos", []),
  compraDirecta: null,
  filtros:       { tipos:[], marcas:[], tallas:[], estados:[] },
  busqueda:      "",
  orden:         "recientes"
};

function guardarPrendas(){ almacen.guardar("ropero_prendas", estado.prendas); }
function guardarCarrito(){ almacen.guardar("ropero_carrito", estado.carrito); }
function guardarPedidos(){ almacen.guardar("ropero_pedidos", estado.pedidos); }

/* ---------- Utilidades ------------------------------------------ */
const $  = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => [...ctx.querySelectorAll(s)];

const plata = n => "$" + Number(n).toLocaleString("es-CL");

const limpiar = t => (t ?? "").toString().toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* Escapa un valor que va dentro de un onclick="...('valor')" */
function jsSeguro(v){
  return String(v ?? "").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/"/g,"&quot;");
}

function escapar(t){
  return (t ?? "").toString()
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

/* Marcador de posición cuando la prenda no tiene foto */
function fotoDe(p){
  if (p.imagen && p.imagen.trim()) return p.imagen;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
    <rect width="300" height="300" fill="#EDF1F9"/>
    <rect x="70" y="72" width="160" height="156" rx="18" fill="#C9D6EE"/>
    <path d="M92 92h116v40H92z" fill="#B0C2E4"/>
    <text x="150" y="256" font-family="Montserrat,Arial" font-size="20"
      font-weight="700" fill="#1E3C7B" text-anchor="middle">${escapar(p.tipo)}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function infoEstado(clave){
  return ESTADOS[clave] || { etiqueta: clave, color:"#6B7590", resumen:"" };
}

/* ================================================================
   FILTROS Y BÚSQUEDA
   ================================================================ */

function prendasVisibles(){
  return estado.prendas.filter(p => p.publicado !== false);
}

function aplicarFiltros(){
  const q = limpiar(estado.busqueda).trim();
  const f = estado.filtros;

  let r = prendasVisibles().filter(p => {
    if (f.tipos.length   && !f.tipos.includes(p.tipo))     return false;
    if (f.marcas.length  && !f.marcas.includes(p.marca))   return false;
    if (f.tallas.length  && !f.tallas.includes(p.talla))   return false;
    if (f.estados.length && !f.estados.includes(p.estado)) return false;
    if (q){
      const heno = limpiar([p.nombre,p.tipo,p.marca,p.talla,p.id,p.detalle,
                            infoEstado(p.estado).etiqueta].join(" "));
      if (!q.split(/\s+/).every(pal => heno.includes(pal))) return false;
    }
    return true;
  });

  const sinStock = p => (p.stock ?? 0) <= 0;
  r.sort((a,b) => sinStock(a) - sinStock(b));   // lo agotado va al final

  if (estado.orden === "precio-asc")  r.sort((a,b)=>a.precio-b.precio);
  if (estado.orden === "precio-desc") r.sort((a,b)=>b.precio-a.precio);
  if (estado.orden === "talla")       r.sort((a,b)=>LISTAS.tallas.indexOf(a.talla)-LISTAS.tallas.indexOf(b.talla));
  if (estado.orden === "estado"){
    const ord = Object.keys(ESTADOS);
    r.sort((a,b)=>ord.indexOf(a.estado)-ord.indexOf(b.estado));
  }
  return r;
}

function contarPor(campo, valor){
  return prendasVisibles().filter(p => p[campo] === valor && (p.stock ?? 0) > 0).length;
}

function pintarFiltros(){
  const g = (titulo, clave, opciones, extra="") => `
    <div class="grupo" data-abierto="si">
      <button type="button" onclick="alternarGrupo(this)">
        ${titulo} <span class="flecha">▼</span>
      </button>
      <div class="opciones ${extra}">${opciones}</div>
    </div>`;

  const casilla = (clave, valor, etiqueta, cuenta=null, punto="") => `
    <label class="${estado.filtros[clave].includes(valor) ? "marcada" : ""}">
      <input type="checkbox" value="${escapar(valor)}"
        ${estado.filtros[clave].includes(valor) ? "checked" : ""}
        onchange="alternarFiltro('${clave}', this.value, this.checked, this)">
      ${punto}<span>${escapar(etiqueta)}</span>
      ${cuenta !== null ? `<span class="cant">${cuenta}</span>` : ""}
    </label>`;

  $("#panelFiltros").innerHTML =
    g("Categoría", "tipos",
      LISTAS.tipos.map(t => casilla("tipos", t, t, contarPor("tipo", t))).join("")) +

    g("Marcas", "marcas",
      LISTAS.marcas.map(m => casilla("marcas", m, m, contarPor("marca", m))).join("")) +

    g("Tallas", "tallas",
      LISTAS.tallas.map(t => casilla("tallas", t, t)).join(""), "tallas") +

    g("Estado", "estados",
      Object.entries(ESTADOS).map(([k,v]) =>
        casilla("estados", k, v.etiqueta, contarPor("estado", k),
          `<span class="punto" style="background:${v.color}"></span>`)).join("")) +

    `<button class="limpiar" onclick="limpiarFiltros()">Borrar todos los filtros</button>
     <p style="font-size:.78rem;color:#B9C8E6;margin-top:12px;text-align:center">
       <a href="pauta.html" style="color:#FFE1A6">¿Qué significa cada estado?</a>
     </p>`;
}

function alternarGrupo(btn){
  const g = btn.closest(".grupo");
  g.dataset.abierto = g.dataset.abierto === "si" ? "no" : "si";
}

function alternarFiltro(clave, valor, activo, elemento){
  const lista = estado.filtros[clave];
  if (activo){ if (!lista.includes(valor)) lista.push(valor); }
  else       { estado.filtros[clave] = lista.filter(v => v !== valor); }
  if (elemento){
    const etiqueta = elemento.closest("label");
    if (etiqueta) etiqueta.classList.toggle("marcada", activo);
  }
  pintarCatalogo();
}

function limpiarFiltros(){
  estado.filtros = { tipos:[], marcas:[], tallas:[], estados:[] };
  estado.busqueda = "";
  $("#campoBusqueda").value = "";
  pintarFiltros();
  pintarCatalogo();
}

function pintarChips(){
  const chips = [];
  const agregar = (clave, valor, texto) => chips.push(
    `<span class="chip">${escapar(texto)}
      <button onclick="alternarFiltro('${clave}','${jsSeguro(valor)}',false);pintarFiltros()"
        aria-label="Quitar filtro">✕</button></span>`);

  estado.filtros.tipos.forEach(v => agregar("tipos", v, v));
  estado.filtros.marcas.forEach(v => agregar("marcas", v, v));
  estado.filtros.tallas.forEach(v => agregar("tallas", v, "Talla " + v));
  estado.filtros.estados.forEach(v => agregar("estados", v, infoEstado(v).etiqueta));
  if (estado.busqueda.trim())
    chips.push(`<span class="chip">Búsqueda: ${escapar(estado.busqueda)}
      <button onclick="$('#campoBusqueda').value='';estado.busqueda='';pintarCatalogo()">✕</button></span>`);

  $("#chipsFiltros").innerHTML = chips.join("");
}

/* ================================================================
   CATÁLOGO
   ================================================================ */

function pintarCatalogo(){
  const lista = aplicarFiltros();
  pintarChips();

  $("#conteo").textContent =
    lista.length === 1 ? "1 prenda disponible" : `${lista.length} prendas disponibles`;

  if (!lista.length){
    $("#grillaPrendas").innerHTML = `
      <div class="vacio">
        <h3>No encontramos prendas con esos filtros</h3>
        <p>Prueba quitando alguno o revisa el catálogo completo.</p>
        <p style="margin-top:16px"><button class="btn btn-azul" onclick="limpiarFiltros()">Ver todo el catálogo</button></p>
      </div>`;
    return;
  }

  $("#grillaPrendas").innerHTML = lista.map(p => {
    const e = infoEstado(p.estado);
    const agotado = (p.stock ?? 0) <= 0;
    return `
      <article class="prenda ${agotado ? "sin-stock" : ""}">
        <div class="foto">
          <span class="talla-flotante">Talla ${escapar(p.talla)}</span>
          <img src="${escapar(fotoDe(p))}" alt="${escapar(p.nombre)}" loading="lazy">
          ${agotado ? '<span class="etiqueta-vendido">Vendida</span>' : ""}
        </div>
        <div class="cuerpo">
          <span class="tipo">${escapar(p.tipo)} · ${escapar(p.id)}</span>
          <span class="nombre">${escapar(p.nombre)}</span>
          <span class="marca">${escapar(p.marca)}</span>
          <span class="estado-linea">
            <span class="punto" style="background:${e.color}"></span>${escapar(e.etiqueta)}
          </span>
          <div class="pie">
            <span class="precio">${plata(p.precio)}</span>
            <button class="btn btn-azul btn-chico" onclick="abrirFicha('${p.id}')">
              ${agotado ? "Ver ficha" : "Ver prenda"}
            </button>
          </div>
        </div>
      </article>`;
  }).join("");
}

/* ================================================================
   FICHA DE LA PRENDA
   ================================================================ */

function abrirFicha(id){
  const p = estado.prendas.find(x => x.id === id);
  if (!p) return;
  const e = infoEstado(p.estado);
  const agotado = (p.stock ?? 0) <= 0;

  $("#capaModal").innerHTML = `
    <div class="telon" onclick="if(event.target===this) cerrarFicha()">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Ficha de la prenda">
        <button class="cerrar" onclick="cerrarFicha()" aria-label="Cerrar">✕</button>
        <div class="ficha">
          <div class="imagen"><img src="${escapar(fotoDe(p))}" alt="${escapar(p.nombre)}"></div>
          <div class="datos">
            <h2>${escapar(p.nombre)}</h2>
            <dl>
              <dt>Producto:</dt><dd>${escapar(p.tipo)}</dd>
              <dt>Marca:</dt><dd>${escapar(p.marca)}</dd>
              <dt>Estado:</dt>
              <dd>
                ${escapar(e.etiqueta)}
                <span class="punto" style="background:${e.color}"></span>
                <a class="ver-pauta" href="pauta.html#${escapar(p.estado)}" target="_blank" rel="noopener">Ver pauta</a>
              </dd>
              <dt>Talla:</dt><dd>${escapar(p.talla)}</dd>
              <dt>Código:</dt><dd>${escapar(p.id)}</dd>
            </dl>
            <p class="notas"><strong>Revisión del ropero:</strong> ${escapar(p.detalle || "Sin observaciones.")}</p>
            <div class="precio-grande">${plata(p.precio)}</div>
            <p style="font-size:.85rem;color:var(--tenue)">
              ${agotado ? "Sin stock por ahora." : `Quedan ${p.stock} unidad(es) · Retiro: ${escapar(CONFIG.horarioRetiro)}`}
            </p>
            <div class="acciones">
              <button class="btn btn-azul"   ${agotado?"disabled":""} onclick="alCarrito('${p.id}')">🛒 Añadir al carrito</button>
              <button class="btn btn-dorado" ${agotado?"disabled":""} onclick="comprarAhora('${p.id}')">Comprar ahora</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  document.body.style.overflow = "hidden";
}

function cerrarFicha(){
  $("#capaModal").innerHTML = "";
  document.body.style.overflow = "";
}

/* ================================================================
   CARRITO
   ================================================================ */

function alCarrito(id){
  const p = estado.prendas.find(x => x.id === id);
  if (!p || (p.stock ?? 0) <= 0) return;
  const linea = estado.carrito.find(l => l.id === id);
  if (linea){
    if (linea.cant >= p.stock){ avisar("Ya tienes todas las unidades disponibles en el carrito."); return; }
    linea.cant++;
  } else {
    estado.carrito.push({ id, cant:1 });
  }
  guardarCarrito();
  actualizarContador();
  cerrarFicha();
  abrirCarrito();
}

function quitarDelCarrito(id){
  estado.carrito = estado.carrito.filter(l => l.id !== id);
  guardarCarrito();
  actualizarContador();
  abrirCarrito();
}

function cambiarCantidad(id, delta){
  const linea = estado.carrito.find(l => l.id === id);
  const p = estado.prendas.find(x => x.id === id);
  if (!linea || !p) return;
  linea.cant = Math.max(1, Math.min(p.stock, linea.cant + delta));
  guardarCarrito();
  abrirCarrito();
  actualizarContador();
}

function itemsActivos(){
  const fuente = estado.compraDirecta || estado.carrito;
  return fuente.map(l => {
    const p = estado.prendas.find(x => x.id === l.id);
    return p ? { ...p, cant: l.cant } : null;
  }).filter(Boolean);
}

function totalActivo(){
  return itemsActivos().reduce((s,i) => s + i.precio * i.cant, 0);
}

function actualizarContador(){
  const n = estado.carrito.reduce((s,l) => s + l.cant, 0);
  const c = $("#contadorCarrito");
  c.textContent = n;
  c.style.display = n ? "grid" : "none";
}

function abrirCarrito(){
  estado.compraDirecta = null;
  const items = estado.carrito.map(l => {
    const p = estado.prendas.find(x => x.id === l.id);
    return p ? { ...p, cant:l.cant } : null;
  }).filter(Boolean);
  const total = items.reduce((s,i) => s + i.precio*i.cant, 0);

  $("#capaPanel").innerHTML = `
    <div class="telon" onclick="if(event.target===this) cerrarPanel()">
      <aside class="panel" role="dialog" aria-label="Carrito de compras">
        <header>
          <h2>Tu carrito</h2>
          <button onclick="cerrarPanel()" aria-label="Cerrar">✕</button>
        </header>
        <div class="lista">
          ${items.length ? items.map(i => `
            <div class="linea-carro">
              <div class="mini"><img src="${escapar(fotoDe(i))}" alt=""></div>
              <div>
                <div class="t">${escapar(i.nombre)}</div>
                <div class="s">Talla ${escapar(i.talla)} · ${escapar(i.marca)} · ${escapar(infoEstado(i.estado).etiqueta)}</div>
                <div class="s" style="margin-top:5px;display:flex;align-items:center;gap:8px">
                  <button class="btn btn-fantasma btn-chico" style="padding:2px 9px" onclick="cambiarCantidad('${i.id}',-1)">−</button>
                  ${i.cant}
                  <button class="btn btn-fantasma btn-chico" style="padding:2px 9px" onclick="cambiarCantidad('${i.id}',1)">+</button>
                  <strong style="margin-left:6px">${plata(i.precio*i.cant)}</strong>
                </div>
              </div>
              <button class="quitar" onclick="quitarDelCarrito('${i.id}')" aria-label="Quitar">🗑</button>
            </div>`).join("")
          : `<div class="vacio" style="border:0;background:none">
               <h3>Tu carrito está vacío</h3>
               <p>Explora el catálogo y agrega prendas.</p>
             </div>`}
        </div>
        <footer>
          <div class="total-fila"><span>Subtotal</span><span>${plata(total)}</span></div>
          <div class="total-fila"><span>Retiro en el colegio</span><span>Gratis</span></div>
          <div class="total-fila grande"><span>Total</span><span>${plata(total)}</span></div>
          <button class="btn btn-azul btn-ancho" ${items.length?"":"disabled"} onclick="irACheckout()">
            Continuar con la entrega
          </button>
          <button class="btn btn-fantasma btn-ancho" style="margin-top:9px" onclick="cerrarPanel()">Seguir comprando</button>
        </footer>
      </aside>
    </div>`;
  document.body.style.overflow = "hidden";
}

function cerrarPanel(){
  $("#capaPanel").innerHTML = "";
  document.body.style.overflow = "";
}

function comprarAhora(id){
  const p = estado.prendas.find(x => x.id === id);
  if (!p || (p.stock ?? 0) <= 0) return;
  estado.compraDirecta = [{ id, cant:1 }];
  cerrarFicha();
  irACheckout(true);
}

/* ================================================================
   NAVEGACIÓN ENTRE VISTAS
   ================================================================ */

function mostrarVista(nombre){
  $$(".vista").forEach(v => v.classList.add("oculto"));
  $("#vista" + nombre).classList.remove("oculto");
  window.scrollTo({ top:0, behavior:"instant" });
}

function irACatalogo(){ estado.compraDirecta = null; mostrarVista("Catalogo"); }

function irACheckout(directa=false){
  if (!directa) estado.compraDirecta = null;
  if (!itemsActivos().length){ avisar("Primero agrega al menos una prenda."); return; }
  cerrarPanel();
  pintarCheckout();
  mostrarVista("Checkout");
}

function irAPedidos(){ pintarBuscadorPedidos(); mostrarVista("Pedidos"); }

/* ================================================================
   CHECKOUT
   ================================================================ */

function pintarCheckout(){
  const items = itemsActivos();
  const total = totalActivo();
  const pagos = CONFIG.pagos;

  $("#resumenPedido").innerHTML = `
    <div class="caja">
      <h3>Resumen del pedido</h3>
      <p class="ayuda">${items.length} prenda(s)</p>
      ${items.map(i => `
        <div class="linea-carro" style="margin-bottom:12px">
          <div class="mini"><img src="${escapar(fotoDe(i))}" alt=""></div>
          <div>
            <div class="t">${escapar(i.nombre)}</div>
            <div class="s">Talla ${escapar(i.talla)} · ${escapar(i.marca)} · x${i.cant}</div>
          </div>
          <strong>${plata(i.precio*i.cant)}</strong>
        </div>`).join("")}
      <div class="total-fila" style="border-top:1px solid var(--borde);padding-top:12px">
        <span>Subtotal</span><span>${plata(total)}</span></div>
      <div class="total-fila"><span>Retiro en el colegio</span><span>Gratis</span></div>
      <div class="total-fila grande"><span>Total</span><span>${plata(total)}</span></div>
      <p style="font-size:.8rem;color:var(--tenue)">
        Lo recaudado va íntegro a las becas del viaje de estudios de 11° grado.
      </p>
    </div>`;

  $("#opcionesPago").innerHTML = `
    ${pagos.tarjeta ? `
      <label class="opcion">
        <input type="radio" name="pago" value="tarjeta" checked onchange="mostrarFormularioPago()">
        <span><span class="t">Tarjeta de crédito o débito</span>
        <span class="d">Pago inmediato en línea. El cupo se reserva al confirmar.</span></span>
      </label>` : ""}
    ${pagos.transferencia ? `
      <label class="opcion">
        <input type="radio" name="pago" value="transferencia" ${!pagos.tarjeta?"checked":""} onchange="mostrarFormularioPago()">
        <span><span class="t">Transferencia bancaria</span>
        <span class="d">Te enviamos los datos por correo. La prenda queda reservada 48 horas.</span></span>
      </label>` : ""}
    ${pagos.efectivo ? `
      <label class="opcion">
        <input type="radio" name="pago" value="efectivo" ${(!pagos.tarjeta&&!pagos.transferencia)?"checked":""} onchange="mostrarFormularioPago()">
        <span><span class="t">Efectivo al retirar</span>
        <span class="d">Pagas en el ropero el día del retiro. ${escapar(CONFIG.horarioRetiro)}.</span></span>
      </label>` : ""}
    <div id="formularioPago"></div>`;

  mostrarFormularioPago();
  cambiarRetiro();
}

function metodoPago(){
  const r = $$('input[name="pago"]').find(x => x.checked);
  return r ? r.value : "efectivo";
}

function mostrarFormularioPago(){
  const m = metodoPago();
  const c = $("#formularioPago");
  if (m === "tarjeta"){
    c.innerHTML = `
      <div class="aviso">
        <strong>Modo demostración.</strong> Este prototipo no procesa pagos reales y no
        guarda ningún dato de tarjeta. Usa la tarjeta de prueba
        <strong>4111 1111 1111 1111</strong>, cualquier fecha futura y CVV 123.
        No escribas datos de una tarjeta real.
      </div>
      <div class="campo">
        <label for="tarjNumero">Número de tarjeta de prueba</label>
        <input id="tarjNumero" inputmode="numeric" autocomplete="off" placeholder="4111 1111 1111 1111" value="4111 1111 1111 1111">
      </div>
      <div class="dos">
        <div class="campo"><label for="tarjVence">Vencimiento</label>
          <input id="tarjVence" placeholder="MM/AA" value="12/29" autocomplete="off"></div>
        <div class="campo"><label for="tarjCvv">CVV</label>
          <input id="tarjCvv" inputmode="numeric" maxlength="4" placeholder="123" value="123" autocomplete="off"></div>
      </div>
      <div class="campo"><label for="tarjNombre">Nombre en la tarjeta</label>
        <input id="tarjNombre" placeholder="Como aparece en la tarjeta" autocomplete="off"></div>`;
  } else if (m === "transferencia"){
    c.innerHTML = `
      <div class="aviso info">
        Al confirmar te mostramos los datos de la cuenta y te llegan también por correo.
        La prenda queda reservada 48 horas a tu nombre.
      </div>`;
  } else {
    c.innerHTML = `
      <div class="aviso info">
        Pagas al retirar en el ropero. ${escapar(CONFIG.horarioRetiro)}.
        Lleva el número de pedido anotado o en el teléfono.
      </div>`;
  }
}

function cambiarRetiro(){
  const v = ($$('input[name="retira"]').find(x => x.checked) || {}).value;
  $("#datosEstudiante").classList.toggle("oculto", v !== "estudiante");
  $("#datosTercero").classList.toggle("oculto",   v !== "tercero");
}

function confirmarPedido(){
  const items = itemsActivos();
  if (!items.length){ avisar("No hay prendas en el pedido."); return; }

  const nombre   = $("#compNombre").value.trim();
  const correo   = $("#compCorreo").value.trim();
  const fono     = $("#compFono").value.trim();
  const retira   = ($$('input[name="retira"]').find(x => x.checked) || {}).value;
  const pago     = metodoPago();

  if (!nombre){ avisar("Falta el nombre del apoderado o apoderada."); $("#compNombre").focus(); return; }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)){ avisar("Revisa el correo: no tiene un formato válido."); $("#compCorreo").focus(); return; }
  if (!fono){ avisar("Falta el teléfono de contacto."); $("#compFono").focus(); return; }

  let quienRetira = { tipo:"apoderado", nombre, extra:"" };
  if (retira === "estudiante"){
    const n = $("#estNombre").value.trim(), curso = $("#estCurso").value.trim();
    if (!n || !curso){ avisar("Completa el nombre y el curso del estudiante."); return; }
    quienRetira = { tipo:"estudiante", nombre:n, extra:"Curso " + curso };
  }
  if (retira === "tercero"){
    const n = $("#terNombre").value.trim(), rut = $("#terRut").value.trim();
    if (!n || !rut){ avisar("Completa el nombre y el RUT de quien retira."); return; }
    quienRetira = { tipo:"tercero", nombre:n, extra:"RUT " + rut };
  }

  if (pago === "tarjeta"){
    const num = ($("#tarjNumero").value || "").replace(/\s/g,"");
    if (num.length < 13){ avisar("Ingresa un número de tarjeta de prueba válido."); return; }
  }

  // Descontar stock
  items.forEach(i => {
    const p = estado.prendas.find(x => x.id === i.id);
    if (p) p.stock = Math.max(0, (p.stock ?? 0) - i.cant);
  });
  guardarPrendas();

  const pedido = {
    numero:   nuevoNumero(),
    fecha:    new Date().toISOString(),
    comprador:{ nombre, correo, fono },
    retira:   quienRetira,
    pago,
    estadoPago: pago === "tarjeta" ? "pagado" : "pendiente",
    entrega:  "por retirar",
    reembolso: null,
    items:    items.map(i => ({ id:i.id, nombre:i.nombre, talla:i.talla, marca:i.marca,
                                estado:i.estado, precio:i.precio, cant:i.cant })),
    total:    totalActivo()
  };

  estado.pedidos.push(pedido);
  guardarPedidos();

  if (!estado.compraDirecta){ estado.carrito = []; guardarCarrito(); }
  estado.compraDirecta = null;
  actualizarContador();
  pintarFiltros();
  pintarCatalogo();
  pintarConfirmacion(pedido);
  mostrarVista("Confirmacion");
}

function nuevoNumero(){
  const n = 1000 + estado.pedidos.length + 1;
  return "RSG-" + new Date().getFullYear() + "-" + n;
}

function pintarConfirmacion(p){
  const etiquetaPago = { tarjeta:"Tarjeta (pagado)", transferencia:"Transferencia (por pagar)", efectivo:"Efectivo al retirar" };
  $("#vistaConfirmacion").innerHTML = `
    <div class="contenedor" style="max-width:760px">
      <div class="caja exito">
        <div class="tic">✓</div>
        <h2>¡Pedido confirmado!</h2>
        <p style="color:var(--tenue)">Te enviamos el detalle a ${escapar(p.comprador.correo)}.</p>
        <div class="numero">${escapar(p.numero)}</div>
        <p style="color:var(--tenue);font-size:.9rem">Anota este número: lo necesitas para retirar y para pedir un reembolso.</p>
      </div>

      <div class="caja">
        <h3>Retiro</h3>
        <p class="ayuda">${escapar(CONFIG.lugarRetiro)}</p>
        <table>
          <tr><th>Retira</th><td>${escapar(p.retira.nombre)} ${p.retira.extra ? "· " + escapar(p.retira.extra) : ""}
            <span class="pastilla gris">${p.retira.tipo === "apoderado" ? "Apoderado/a" : p.retira.tipo === "estudiante" ? "Estudiante" : "Tercero autorizado"}</span></td></tr>
          <tr><th>Horario</th><td>${escapar(CONFIG.horarioRetiro)}</td></tr>
          <tr><th>Pago</th><td>${etiquetaPago[p.pago]}</td></tr>
          <tr><th>Total</th><td><strong>${plata(p.total)}</strong></td></tr>
        </table>
        ${p.pago === "transferencia" ? `
          <div class="aviso" style="margin-top:16px">
            <strong>Datos de transferencia (ejemplo):</strong><br>
            Centro de Apoderados Saint George · Cuenta corriente 000-00-00000<br>
            RUT 00.000.000-0 · ${escapar(CONFIG.correo)}<br>
            Envía el comprobante indicando el número de pedido.
          </div>` : ""}
      </div>

      <div style="display:flex;gap:11px;flex-wrap:wrap;padding-bottom:60px">
        <button class="btn btn-azul" onclick="irACatalogo()">Volver al catálogo</button>
        <button class="btn btn-linea" onclick="irAPedidos()">Ver mis pedidos</button>
        <button class="btn btn-fantasma" onclick="window.print()">Imprimir comprobante</button>
      </div>
    </div>`;
}

/* ================================================================
   MIS PEDIDOS Y REEMBOLSOS
   ================================================================ */

function pintarBuscadorPedidos(){
  $("#resultadoPedidos").innerHTML = "";
}

function buscarPedido(){
  const num = $("#buscarNumero").value.trim().toUpperCase();
  const mail= $("#buscarCorreo").value.trim().toLowerCase();
  const p = estado.pedidos.find(x =>
    x.numero.toUpperCase() === num && x.comprador.correo.toLowerCase() === mail);

  if (!p){
    $("#resultadoPedidos").innerHTML = `
      <div class="aviso">No encontramos un pedido con ese número y ese correo. Revisa que
      coincidan exactamente con los del comprobante.</div>`;
    return;
  }
  pintarPedido(p);
}

function diasDesde(iso){
  return Math.floor((Date.now() - new Date(iso)) / 86400000);
}

function pintarPedido(p){
  const dias = diasDesde(p.fecha);
  const puedePedir = !p.reembolso && p.estadoPago === "pagado" && dias <= CONFIG.diasReembolso;

  const estadoReembolso = p.reembolso ? {
    solicitado:'<span class="pastilla ambar">Reembolso en revisión</span>',
    aprobado:  '<span class="pastilla verde">Reembolso aprobado</span>',
    rechazado: '<span class="pastilla roja">Reembolso rechazado</span>',
    devuelto:  '<span class="pastilla verde">Dinero devuelto</span>'
  }[p.reembolso.estado] : "";

  $("#resultadoPedidos").innerHTML = `
    <div class="caja">
      <h3>Pedido ${escapar(p.numero)}</h3>
      <p class="ayuda">${new Date(p.fecha).toLocaleString("es-CL")} · ${dias} día(s) atrás</p>
      <table>
        <tr><th>Estado del pago</th><td>${p.estadoPago === "pagado"
            ? '<span class="pastilla verde">Pagado</span>'
            : '<span class="pastilla ambar">Pendiente</span>'} ${estadoReembolso}</td></tr>
        <tr><th>Entrega</th><td>${escapar(p.entrega)}</td></tr>
        <tr><th>Retira</th><td>${escapar(p.retira.nombre)} ${p.retira.extra ? "· "+escapar(p.retira.extra) : ""}</td></tr>
        <tr><th>Total</th><td><strong>${plata(p.total)}</strong></td></tr>
      </table>

      <h3 style="margin-top:22px">Prendas</h3>
      <div class="tabla-marco" style="margin-top:10px">
        <table>
          <thead><tr><th>Código</th><th>Prenda</th><th>Talla</th><th>Cant.</th><th>Precio</th></tr></thead>
          <tbody>${p.items.map(i => `<tr>
            <td>${escapar(i.id)}</td><td>${escapar(i.nombre)}</td>
            <td>${escapar(i.talla)}</td><td>${i.cant}</td><td>${plata(i.precio*i.cant)}</td>
          </tr>`).join("")}</tbody>
        </table>
      </div>

      <h3 style="margin-top:24px">Reembolso</h3>
      ${p.reembolso ? `
        <p class="ayuda">Solicitado el ${new Date(p.reembolso.fecha).toLocaleDateString("es-CL")}</p>
        <p><strong>Motivo:</strong> ${escapar(p.reembolso.motivo)}</p>
        <p style="margin-top:8px">${estadoReembolso}</p>
        ${p.reembolso.respuesta ? `<div class="aviso info" style="margin-top:12px">${escapar(p.reembolso.respuesta)}</div>` : ""}
      ` : puedePedir ? `
        <p class="ayuda">Tienes ${CONFIG.diasReembolso} días desde la compra para pedir la devolución.
          Quedan ${CONFIG.diasReembolso - dias} día(s).</p>
        <div class="campo">
          <label for="motivoReembolso">¿Qué pasó?</label>
          <textarea id="motivoReembolso" rows="3" placeholder="Ej: la talla no le quedó, el estado no coincide con la descripción…"></textarea>
        </div>
        <button class="btn btn-azul" onclick="pedirReembolso('${p.numero}')">Solicitar reembolso</button>
      ` : `
        <div class="aviso info">
          ${p.estadoPago !== "pagado"
            ? "Este pedido todavía no está pagado, así que no hay nada que devolver. Si ya no lo quieres, avísanos por correo y lo anulamos."
            : `El plazo de ${CONFIG.diasReembolso} días ya venció. Escríbenos a ${escapar(CONFIG.correo)} y lo vemos caso a caso.`}
        </div>`}
    </div>`;
}

function pedirReembolso(numero){
  const motivo = $("#motivoReembolso").value.trim();
  if (motivo.length < 10){ avisar("Cuéntanos un poco más del motivo (mínimo 10 caracteres)."); return; }
  const p = estado.pedidos.find(x => x.numero === numero);
  p.reembolso = { estado:"solicitado", motivo, fecha:new Date().toISOString(), respuesta:"" };
  guardarPedidos();
  pintarPedido(p);
  avisar("Solicitud enviada. El ropero la revisa los miércoles.");
}

/* ================================================================
   AVISOS
   ================================================================ */

function avisar(texto){
  let caja = $("#avisoFlotante");
  if (!caja){
    caja = document.createElement("div");
    caja.id = "avisoFlotante";
    caja.style.cssText = "position:fixed;left:50%;bottom:26px;transform:translateX(-50%);"+
      "background:#142A57;color:#fff;padding:13px 22px;border-radius:999px;z-index:200;"+
      "box-shadow:0 8px 24px rgba(0,0,0,.25);font-size:.9rem;max-width:90vw;text-align:center";
    document.body.appendChild(caja);
  }
  caja.textContent = texto;
  caja.style.display = "block";
  clearTimeout(caja._t);
  caja._t = setTimeout(() => caja.style.display = "none", 3800);
}

/* ================================================================
   ARRANQUE
   ================================================================ */

function iniciar(){
  $("#tituloPortada").textContent = CONFIG.tituloPortada;
  $("#textoPortada").textContent  = CONFIG.textoPortada;
  $("#horarioPortada").textContent = "Retiro: " + CONFIG.horarioRetiro;
  $$(".js-horario").forEach(e => e.textContent = CONFIG.horarioRetiro);
  $$(".js-lugar").forEach(e => e.textContent = CONFIG.lugarRetiro);
  $$(".js-correo").forEach(e => { e.textContent = CONFIG.correo; e.href = "mailto:"+CONFIG.correo; });
  $$(".js-instagram").forEach(e => e.href = CONFIG.instagram);

  const campo = $("#campoBusqueda");
  let temporizador;
  campo.addEventListener("input", () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      estado.busqueda = campo.value;
      irACatalogo();
      pintarCatalogo();
    }, 220);
  });

  $("#ordenar").addEventListener("change", e => { estado.orden = e.target.value; pintarCatalogo(); });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape"){ cerrarFicha(); cerrarPanel(); }
  });

  pintarFiltros();
  pintarCatalogo();
  actualizarContador();

  // En pantallas chicas el panel de filtros parte cerrado
  if (window.innerWidth <= 1000) $("#panelFiltros").classList.add("plegado");
}

document.addEventListener("DOMContentLoaded", iniciar);
