/* ================================================================
   ROPERO SG — Panel de administración
   Uso: apoderadas voluntarias que reciben, revisan y publican prendas.
   ================================================================ */

/* ---------- Guardado local (mismo mecanismo que la tienda) ------ */
const memoria = {};
const almacen = {
  leer(c, d){ try{ const v = localStorage.getItem(c); return v ? JSON.parse(v) : d; }
              catch(e){ return (c in memoria) ? memoria[c] : d; } },
  guardar(c, v){ try{ localStorage.setItem(c, JSON.stringify(v)); } catch(e){ memoria[c] = v; } }
};

const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];
const plata = n => "$" + Number(n).toLocaleString("es-CL");
const escapar = t => (t ?? "").toString()
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;").replace(/'/g,"&#39;");

let prendas = almacen.leer("ropero_prendas", null) || structuredClone(PRENDAS);
let pedidos = almacen.leer("ropero_pedidos", []);
let editando = null;

const guardarPrendas = () => almacen.guardar("ropero_prendas", prendas);
const guardarPedidos = () => almacen.guardar("ropero_pedidos", pedidos);

function fotoDe(p){
  if (p.imagen && p.imagen.trim()) return p.imagen;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#EDF1F9"/>
    <rect x="24" y="24" width="52" height="52" rx="7" fill="#C9D6EE"/></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function avisar(t){
  const c = $("#aviso");
  c.textContent = t; c.style.display = "block";
  clearTimeout(c._t); c._t = setTimeout(() => c.style.display = "none", 3800);
}

/* ================================================================
   ACCESO
   ================================================================ */

function entrar(){
  const clave = $("#claveIngreso").value;
  if (clave !== CONFIG.claveAdmin){
    $("#errorClave").textContent = "Clave incorrecta. Pídesela a la coordinadora del ropero.";
    return;
  }
  try{ sessionStorage.setItem("ropero_admin", "si"); }catch(e){}
  mostrarPanel();
}

function salir(){
  try{ sessionStorage.removeItem("ropero_admin"); }catch(e){}
  location.reload();
}

function mostrarPanel(){
  $("#pantallaIngreso").classList.add("oculto");
  $("#panel").classList.remove("oculto");
  cargarSelectores();
  pestana("prendas");
}

/* ================================================================
   PESTAÑAS
   ================================================================ */

function pestana(nombre){
  $$(".pestanas button").forEach(b => b.classList.toggle("activa", b.dataset.p === nombre));
  $$(".seccion").forEach(s => s.classList.add("oculto"));
  $("#sec-" + nombre).classList.remove("oculto");
  if (nombre === "prendas")    pintarTablaPrendas();
  if (nombre === "pedidos")    pintarTablaPedidos();
  if (nombre === "reembolsos") pintarReembolsos();
  if (nombre === "exportar")   pintarResumen();
}

/* ================================================================
   PRENDAS
   ================================================================ */

function cargarSelectores(){
  $("#fTipo").innerHTML   = LISTAS.tipos.map(t => `<option>${escapar(t)}</option>`).join("");
  $("#fMarca").innerHTML  = LISTAS.marcas.map(m => `<option>${escapar(m)}</option>`).join("");
  $("#fTalla").innerHTML  = LISTAS.tallas.map(t => `<option>${escapar(t)}</option>`).join("");
  $("#fEstado").innerHTML = Object.entries(ESTADOS)
    .map(([k,v]) => `<option value="${k}">${escapar(v.etiqueta)} — ${escapar(v.resumen)}</option>`).join("");
}

function pintarTablaPrendas(){
  const q = ($("#filtroPrendas").value || "").toLowerCase();
  const lista = prendas.filter(p =>
    !q || [p.id,p.nombre,p.tipo,p.marca,p.talla].join(" ").toLowerCase().includes(q));

  $("#tablaPrendas").innerHTML = `
    <table>
      <thead><tr>
        <th></th><th>Código</th><th>Prenda</th><th>Marca</th><th>Talla</th>
        <th>Estado</th><th>Precio</th><th>Stock</th><th>Visible</th><th>Acciones</th>
      </tr></thead>
      <tbody>
        ${lista.map(p => {
          const e = ESTADOS[p.estado] || {etiqueta:p.estado, color:"#999"};
          return `<tr>
            <td><img src="${escapar(fotoDe(p))}" alt="" style="width:42px;height:42px;object-fit:contain;border:1px solid var(--borde);border-radius:6px"></td>
            <td>${escapar(p.id)}</td>
            <td>${escapar(p.nombre)}<br><span style="color:var(--tenue);font-size:.8rem">${escapar(p.tipo)}</span></td>
            <td>${escapar(p.marca)}</td>
            <td>${escapar(p.talla)}</td>
            <td><span class="punto" style="background:${e.color}"></span> ${escapar(e.etiqueta)}</td>
            <td>${plata(p.precio)}</td>
            <td>${p.stock}</td>
            <td>${p.publicado !== false
              ? '<span class="pastilla verde">Publicada</span>'
              : '<span class="pastilla gris">Oculta</span>'}</td>
            <td style="white-space:nowrap">
              <button class="btn btn-linea btn-chico" onclick="editarPrenda('${p.id}')">Editar</button>
              <button class="btn btn-fantasma btn-chico" onclick="alternarPublicado('${p.id}')">${p.publicado !== false ? "Ocultar" : "Publicar"}</button>
              <button class="btn btn-peligro btn-chico" onclick="borrarPrenda('${p.id}')">Borrar</button>
            </td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>`;
  $("#totalPrendas").textContent =
    `${prendas.length} prendas · ${prendas.filter(p=>p.stock>0 && p.publicado!==false).length} disponibles en el catálogo`;
}

function nuevoCodigo(){
  const nums = prendas.map(p => parseInt((p.id.match(/(\d+)$/) || [0,0])[1], 10)).filter(n => !isNaN(n));
  const sig = (nums.length ? Math.max(...nums) : 0) + 1;
  return "SG-" + String(sig).padStart(4, "0");
}

function limpiarFormulario(){
  editando = null;
  $("#tituloFormulario").textContent = "Agregar una prenda";
  $("#fCodigo").value  = nuevoCodigo();
  $("#fNombre").value  = "";
  $("#fPrecio").value  = 4000;
  $("#fStock").value   = 1;
  $("#fDetalle").value = "";
  $("#fImagen").value  = "";
  $("#fArchivo").value = "";
  $("#vistaPrevia").innerHTML = "";
  $("#fPublicado").checked = true;
  $("#btnGuardar").textContent = "Guardar prenda";
}

function editarPrenda(id){
  const p = prendas.find(x => x.id === id);
  if (!p) return;
  editando = id;
  pestana("nueva");
  $("#tituloFormulario").textContent = "Editar " + p.id;
  $("#fCodigo").value = p.id;
  $("#fNombre").value = p.nombre;
  $("#fTipo").value   = p.tipo;
  $("#fMarca").value  = p.marca;
  $("#fTalla").value  = p.talla;
  $("#fEstado").value = p.estado;
  $("#fPrecio").value = p.precio;
  $("#fStock").value  = p.stock;
  $("#fDetalle").value= p.detalle || "";
  $("#fImagen").value = p.imagen && p.imagen.startsWith("data:") ? "" : (p.imagen || "");
  $("#vistaPrevia").innerHTML = `<img src="${escapar(fotoDe(p))}" style="max-height:130px;border:1px solid var(--borde);border-radius:9px;padding:6px;background:#fff">`;
  $("#vistaPrevia").dataset.base64 = p.imagen && p.imagen.startsWith("data:") ? p.imagen : "";
  $("#fPublicado").checked = p.publicado !== false;
  $("#btnGuardar").textContent = "Guardar cambios";
}

function previsualizar(input){
  const f = input.files[0];
  if (!f) return;
  if (f.size > 900000){ avisar("La foto pesa mucho. Usa una imagen de menos de 900 KB."); input.value=""; return; }
  const lector = new FileReader();
  lector.onload = () => {
    $("#vistaPrevia").innerHTML = `<img src="${lector.result}" style="max-height:130px;border:1px solid var(--borde);border-radius:9px;padding:6px;background:#fff">`;
    $("#vistaPrevia").dataset.base64 = lector.result;
  };
  lector.readAsDataURL(f);
}

function guardarPrenda(){
  const id = $("#fCodigo").value.trim();
  if (!id){ avisar("Falta el código de la prenda."); return; }
  if (!editando && prendas.some(p => p.id === id)){ avisar("Ese código ya existe. Usa otro."); return; }
  const nombre = $("#fNombre").value.trim();
  if (!nombre){ avisar("Ponle un nombre a la prenda."); return; }

  const datos = {
    id,
    nombre,
    tipo:   $("#fTipo").value,
    marca:  $("#fMarca").value,
    talla:  $("#fTalla").value,
    estado: $("#fEstado").value,
    precio: parseInt($("#fPrecio").value, 10) || 0,
    stock:  parseInt($("#fStock").value, 10) || 0,
    detalle:$("#fDetalle").value.trim(),
    imagen: $("#vistaPrevia").dataset.base64 || $("#fImagen").value.trim(),
    publicado: $("#fPublicado").checked
  };

  if (editando){
    const i = prendas.findIndex(p => p.id === editando);
    prendas[i] = datos;
    avisar("Prenda actualizada.");
  } else {
    prendas.push(datos);
    avisar("Prenda publicada en el catálogo.");
  }
  guardarPrendas();
  limpiarFormulario();
  pestana("prendas");
}

function alternarPublicado(id){
  const p = prendas.find(x => x.id === id);
  p.publicado = p.publicado === false;
  guardarPrendas();
  pintarTablaPrendas();
}

function borrarPrenda(id){
  if (!confirm("¿Borrar la prenda " + id + "? Esto no se puede deshacer.")) return;
  prendas = prendas.filter(p => p.id !== id);
  guardarPrendas();
  pintarTablaPrendas();
  avisar("Prenda borrada.");
}

/* ================================================================
   PEDIDOS
   ================================================================ */

function pintarTablaPedidos(){
  pedidos = almacen.leer("ropero_pedidos", []);
  if (!pedidos.length){
    $("#tablaPedidos").innerHTML = `<div class="vacio"><h3>Todavía no hay pedidos</h3>
      <p>Cuando alguien compre en el catálogo, aparecerá aquí.</p></div>`;
    return;
  }
  const rol = { apoderado:"Apoderado/a", estudiante:"Estudiante", tercero:"Tercero autorizado" };
  $("#tablaPedidos").innerHTML = `
    <table>
      <thead><tr>
        <th>N° pedido</th><th>Fecha</th><th>Compra</th><th>Retira</th>
        <th>Prendas</th><th>Total</th><th>Pago</th><th>Entrega</th><th>Acciones</th>
      </tr></thead>
      <tbody>
        ${[...pedidos].reverse().map(p => `
          <tr>
            <td><strong>${escapar(p.numero)}</strong></td>
            <td>${new Date(p.fecha).toLocaleDateString("es-CL")}</td>
            <td>${escapar(p.comprador.nombre)}<br>
                <span style="color:var(--tenue);font-size:.8rem">${escapar(p.comprador.correo)}<br>${escapar(p.comprador.fono)}</span></td>
            <td>${escapar(p.retira.nombre)}<br>
                <span class="pastilla gris">${rol[p.retira.tipo]}</span>
                ${p.retira.extra ? `<br><span style="font-size:.8rem;color:var(--tenue)">${escapar(p.retira.extra)}</span>` : ""}</td>
            <td>${p.items.map(i => `${escapar(i.id)} · ${escapar(i.nombre)} (T${escapar(i.talla)}) x${i.cant}`).join("<br>")}</td>
            <td><strong>${plata(p.total)}</strong></td>
            <td>${escapar(p.pago)}<br>${p.estadoPago === "pagado"
                ? '<span class="pastilla verde">Pagado</span>'
                : '<span class="pastilla ambar">Pendiente</span>'}</td>
            <td>${p.entrega === "entregado"
                ? '<span class="pastilla verde">Entregado</span>'
                : '<span class="pastilla ambar">Por retirar</span>'}</td>
            <td style="white-space:nowrap">
              ${p.estadoPago !== "pagado" ? `<button class="btn btn-linea btn-chico" onclick="marcarPagado('${p.numero}')">Marcar pagado</button>` : ""}
              ${p.entrega !== "entregado" ? `<button class="btn btn-azul btn-chico" onclick="marcarEntregado('${p.numero}')">Marcar entregado</button>` : ""}
            </td>
          </tr>`).join("")}
      </tbody>
    </table>`;
}

function marcarPagado(numero){
  const p = pedidos.find(x => x.numero === numero);
  p.estadoPago = "pagado"; guardarPedidos(); pintarTablaPedidos(); avisar("Pedido marcado como pagado.");
}

function marcarEntregado(numero){
  const p = pedidos.find(x => x.numero === numero);
  p.entrega = "entregado"; guardarPedidos(); pintarTablaPedidos(); avisar("Pedido marcado como entregado.");
}

/* ================================================================
   REEMBOLSOS
   ================================================================ */

function pintarReembolsos(){
  pedidos = almacen.leer("ropero_pedidos", []);
  const conSolicitud = pedidos.filter(p => p.reembolso);
  if (!conSolicitud.length){
    $("#listaReembolsos").innerHTML = `<div class="vacio"><h3>No hay solicitudes de reembolso</h3>
      <p>Las solicitudes que envíen los apoderados desde "Mis pedidos" llegan aquí.</p></div>`;
    return;
  }
  const pastilla = { solicitado:"ambar", aprobado:"verde", rechazado:"roja", devuelto:"verde" };
  $("#listaReembolsos").innerHTML = conSolicitud.map(p => `
    <div class="caja">
      <div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap">
        <h3>${escapar(p.numero)} · ${plata(p.total)}</h3>
        <span class="pastilla ${pastilla[p.reembolso.estado]}">${escapar(p.reembolso.estado)}</span>
      </div>
      <p class="ayuda">${escapar(p.comprador.nombre)} · ${escapar(p.comprador.correo)} ·
        solicitado el ${new Date(p.reembolso.fecha).toLocaleDateString("es-CL")}</p>
      <p><strong>Motivo:</strong> ${escapar(p.reembolso.motivo)}</p>
      <p style="font-size:.85rem;color:var(--tenue);margin-top:8px">
        Prendas: ${p.items.map(i => escapar(i.id)).join(", ")}</p>
      ${p.reembolso.estado === "solicitado" ? `
        <div class="campo" style="margin-top:14px">
          <label for="resp-${p.numero}">Respuesta para la familia</label>
          <textarea id="resp-${p.numero}" rows="2" placeholder="Ej: aprobado, devolvemos el miércoles en el ropero."></textarea>
        </div>
        <button class="btn btn-azul btn-chico" onclick="resolverReembolso('${p.numero}','aprobado')">Aprobar</button>
        <button class="btn btn-peligro btn-chico" onclick="resolverReembolso('${p.numero}','rechazado')">Rechazar</button>
      ` : p.reembolso.estado === "aprobado" ? `
        <p style="margin-top:10px">${escapar(p.reembolso.respuesta || "")}</p>
        <button class="btn btn-azul btn-chico" onclick="resolverReembolso('${p.numero}','devuelto')">Marcar dinero devuelto</button>
      ` : `<p style="margin-top:10px">${escapar(p.reembolso.respuesta || "")}</p>`}
    </div>`).join("");
}

function resolverReembolso(numero, nuevoEstado){
  const p = pedidos.find(x => x.numero === numero);
  const campo = $("#resp-" + numero);
  if (campo && campo.value.trim()) p.reembolso.respuesta = campo.value.trim();
  p.reembolso.estado = nuevoEstado;

  // Al aprobar, la prenda vuelve al stock
  if (nuevoEstado === "aprobado"){
    p.items.forEach(i => {
      const pr = prendas.find(x => x.id === i.id);
      if (pr) pr.stock = (pr.stock || 0) + i.cant;
    });
    guardarPrendas();
  }
  guardarPedidos();
  pintarReembolsos();
  avisar("Solicitud actualizada.");
}

/* ================================================================
   EXPORTAR
   ================================================================ */

function pintarResumen(){
  pedidos = almacen.leer("ropero_pedidos", []);
  const vendidas = pedidos.reduce((s,p) => s + p.items.reduce((a,i)=>a+i.cant,0), 0);
  const recaudado = pedidos.filter(p => p.estadoPago === "pagado").reduce((s,p)=>s+p.total,0);
  const porCobrar = pedidos.filter(p => p.estadoPago !== "pagado").reduce((s,p)=>s+p.total,0);

  $("#resumenCifras").innerHTML = `
    <div class="tabla-marco"><table>
      <tr><th>Prendas en el sistema</th><td>${prendas.length}</td></tr>
      <tr><th>Disponibles en el catálogo</th><td>${prendas.filter(p=>p.stock>0&&p.publicado!==false).length}</td></tr>
      <tr><th>Pedidos</th><td>${pedidos.length}</td></tr>
      <tr><th>Prendas vendidas</th><td>${vendidas}</td></tr>
      <tr><th>Recaudado (pagado)</th><td><strong>${plata(recaudado)}</strong></td></tr>
      <tr><th>Por cobrar</th><td>${plata(porCobrar)}</td></tr>
    </table></div>`;
}

function bajarArchivo(nombre, contenido, tipo="text/plain"){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([contenido], {type:tipo+";charset=utf-8"}));
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportarDatos(){
  const texto =
`/* Archivo generado desde el panel del Ropero SG
   ${new Date().toLocaleString("es-CL")}
   Reemplaza el bloque PRENDAS de js/datos.js con este. */

const PRENDAS = ${JSON.stringify(prendas, null, 2)};
`;
  bajarArchivo("PRENDAS-actualizado.js", texto, "text/javascript");
  avisar("Archivo descargado. Pégalo en js/datos.js y súbelo a GitHub.");
}

function exportarVentas(){
  pedidos = almacen.leer("ropero_pedidos", []);
  const filas = [["N pedido","Fecha","Comprador","Correo","Telefono","Retira","Rol","Dato extra",
                  "Codigo","Prenda","Talla","Marca","Estado","Cantidad","Precio","Metodo de pago","Pago","Entrega","Reembolso"]];
  pedidos.forEach(p => p.items.forEach(i => filas.push([
    p.numero, new Date(p.fecha).toLocaleString("es-CL"),
    p.comprador.nombre, p.comprador.correo, p.comprador.fono,
    p.retira.nombre, p.retira.tipo, p.retira.extra,
    i.id, i.nombre, i.talla, i.marca, i.estado, i.cant, i.precio,
    p.pago, p.estadoPago, p.entrega, p.reembolso ? p.reembolso.estado : ""
  ])));
  const csv = "\uFEFF" + filas.map(f => f.map(c => `"${(c ?? "").toString().replace(/"/g,'""')}"`).join(";")).join("\n");
  bajarArchivo("ventas-ropero.csv", csv, "text/csv");
}

function reiniciarTodo(){
  if (!confirm("Esto borra prendas, pedidos y reembolsos guardados en este navegador y vuelve a los datos de js/datos.js. ¿Seguir?")) return;
  try{ localStorage.removeItem("ropero_prendas");
       localStorage.removeItem("ropero_pedidos");
       localStorage.removeItem("ropero_carrito"); }catch(e){}
  location.reload();
}

/* ================================================================
   ARRANQUE
   ================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  let logueado = false;
  try{ logueado = sessionStorage.getItem("ropero_admin") === "si"; }catch(e){}
  if (logueado) mostrarPanel();
  $("#claveIngreso").addEventListener("keydown", e => { if (e.key === "Enter") entrar(); });
  $("#filtroPrendas").addEventListener("input", pintarTablaPrendas);
  limpiarFormulario();
});
