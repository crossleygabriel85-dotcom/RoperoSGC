# Ropero SG — prototipo web

Venta online de uniformes de segunda mano del Saint George's College.
HTML, CSS y JavaScript puros: no necesita instalar nada ni compilar nada.

---

## 1. Qué contiene cada archivo

| Archivo | Qué hace | ¿Lo vas a editar? |
|---|---|---|
| `index.html` | Catálogo, filtros, buscador, ficha, carrito, pago y "mis pedidos" | Solo si cambias textos fijos |
| `admin.html` | Panel de las apoderadas voluntarias | Casi nunca |
| `pauta.html` | Pauta de estados (se arma sola desde los datos) | Nunca |
| `js/datos.js` | **Prendas, precios, tallas, marcas, estados, horarios, clave** | **Sí, este es TU archivo** |
| `js/tienda.js` | Lógica de la tienda | No |
| `js/admin.js` | Lógica del panel | No |
| `css/estilos.css` | Colores y tipografía (todo arriba, en `:root`) | Solo para cambiar la paleta |
| `img/` | Fotos de las prendas | Sí, aquí van las fotos |

---

## 2. Verlo funcionando en tu computador (2 minutos)

1. Descomprime la carpeta `ropero-sg`.
2. Abre **Visual Studio Code** → `Archivo` → `Abrir carpeta…` → elige `ropero-sg`.
3. Instala la extensión **Live Server** (busca "Live Server" de Ritwick Dey en el panel de extensiones).
4. Click derecho sobre `index.html` → **Open with Live Server**.

Se abre en el navegador en `http://127.0.0.1:5500`.

> **Por qué Live Server y no abrir el archivo directo:** abriendo `index.html` con doble
> click también funciona, pero algunos navegadores bloquean el guardado local en modo
> `file://`. Con Live Server no pasa.

Para entrar al panel de voluntarias: `admin.html`, clave **`ropero2026`**.

---

## 3. Subirlo a GitHub Pages (queda con dirección pública)

1. Crea una cuenta en [github.com](https://github.com) si no tienes.
2. Botón **New repository** → nombre `ropero-sg` → **Public** → **Create**.
3. En la página del repositorio: **Add file → Upload files**, arrastra *el contenido* de la
   carpeta (`index.html`, `admin.html`, `pauta.html`, y las carpetas `css`, `js`, `img`).
   Ojo: sube los archivos, no la carpeta contenedora.
4. **Commit changes**.
5. Pestaña **Settings** → menú lateral **Pages** → en *Source* elige **Deploy from a branch**
   → rama `main`, carpeta `/ (root)` → **Save**.
6. Espera 1–2 minutos. Tu sitio queda en:
   `https://TU-USUARIO.github.io/ropero-sg/`

Desde VS Code también puedes hacerlo con Git: `git init`, `git add .`,
`git commit -m "primera versión"`, `git remote add origin <url>`, `git push -u origin main`.

---

## 4. Cómo agregar una prenda

**Opción A — desde el panel (recomendado para las apoderadas).**
`admin.html` → pestaña *Agregar prenda* → llenar → *Guardar prenda*.
Aparece al instante en el catálogo.

**Opción B — editando el código.**
Abre `js/datos.js`, busca `const PRENDAS = [` y copia un bloque completo:

```js
{
  id:"SG-0017", tipo:"Polar", nombre:"Polar azul talla 8", marca:"First Option",
  talla:"8", estado:"excelente", precio:6000, stock:1, imagen:"img/polar-8.jpg",
  detalle:"Sin pilling, insignia completa.", publicado:true
},
```

Reglas: `id` no se repite, `tipo` / `marca` / `talla` deben existir en `LISTAS`,
`estado` debe ser una de las claves de `ESTADOS`, `precio` sin puntos ni `$`.

**Fotos:** ponlas en `img/` (jpg o png, cuadradas, fondo claro, menos de 300 KB)
y escribe la ruta en `imagen`. Si dejas `imagen:""` se dibuja un marcador de posición.

---

## 5. IMPORTANTE: dónde se guardan los datos

Este prototipo **no tiene servidor**. Todo lo que se agrega desde el panel se guarda en el
*navegador de ese computador* (`localStorage`). Eso significa:

- Si una apoderada publica una prenda desde su notebook, **solo ella la ve**.
- Los pedidos que hace un comprador quedan solo en el navegador del comprador.
- Si se borran los datos del navegador, se pierde todo.

Para que los cambios los vea todo el mundo:
`admin.html` → *Resumen y respaldo* → **Descargar PRENDAS actualizado** → pegar ese bloque
en `js/datos.js` → subir a GitHub.

Sirve perfecto para presentar el proyecto y probar la experiencia completa.
Para operar de verdad hay que agregar una base de datos (ver punto 7).

---

## 6. Cambiar colores y tipografía

Todo está en las primeras líneas de `css/estilos.css`:

```css
:root{
  --azul:   #1E3C7B;   /* azul principal */
  --dorado: #F2B233;   /* acento */
  --display: 'Montserrat', ...;   /* titulares */
  --cuerpo:  'Open Sans', ...;    /* texto */
}
```

Si el colegio te pasa los códigos exactos de su manual de marca, cambia esos valores y
listo: se actualiza todo el sitio.

Para cambiar la tipografía, edita también la línea de Google Fonts que está en el
`<head>` de los tres archivos `.html`.

---

## 7. Lo que este prototipo simula y no hace de verdad

| Función | Estado |
|---|---|
| Catálogo, filtros, búsqueda | Real y funcionando |
| Carrito y compra directa | Real |
| Opciones de retiro | Real |
| Panel de administración | Real (guardado local) |
| Registro de pedidos y reembolsos | Real (guardado local) |
| **Pago con tarjeta** | **Simulado**. No se conecta a ningún banco. |
| **Devolución de dinero** | **Simulada**. Registra la solicitud y la respuesta. |
| Clave de administrador | Simulada: está escrita en el código, cualquiera puede leerla |

### Para pagos reales haría falta

Una página estática en GitHub Pages **no puede** cobrar con tarjeta: cualquier clave o
llave secreta quedaría a la vista en el código. Se necesita un servidor intermedio.
Alternativas en Chile:

- **Transbank Webpay Plus** — es lo que ya usa el colegio. Requiere convenio y un servidor.
- **Flow.cl** o **Mercado Pago** — más simples de integrar para proyectos chicos.
- **Firebase** o **Supabase** — dan la base de datos compartida y el login real de las
  voluntarias, sin montar un servidor propio. Ambos tienen plan gratuito.

Camino recomendado si el proyecto avanza: primero Supabase (base de datos compartida +
login real), después la pasarela de pago.

---

## 8. Atajos útiles en VS Code

- `Ctrl + P` (Windows) / `Cmd + P` (Mac): abrir un archivo por nombre.
- `Ctrl + F`: buscar dentro del archivo. Útil para encontrar una prenda por su código.
- `Alt + Shift + F`: ordenar y alinear el código automáticamente.
- `F12` en el navegador → pestaña *Console*: ahí aparecen los errores si algo se rompe.
  El más común es una coma o una llave que falta en `js/datos.js`.
