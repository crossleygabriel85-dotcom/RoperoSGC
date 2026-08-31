/* ================================================================
   ROPERO SG — ARCHIVO DE DATOS
   ----------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO QUE NECESITAS TOCAR PARA:
     · cambiar textos, horarios y contacto        -> CONFIG
     · cambiar la pauta de estados y sus colores  -> ESTADOS
     · agregar / editar / borrar prendas          -> PRENDAS
     · agregar tallas, marcas o tipos de prenda   -> LISTAS

   Regla de oro: cada coma y cada llave importan. Si algo deja de
   funcionar, abre la consola del navegador (F12 -> Console).
   ================================================================ */


/* ----------------------------------------------------------------
   1) CONFIGURACIÓN GENERAL
   ---------------------------------------------------------------- */
const CONFIG = {
  nombreSitio:   "Ropero SG",
  bajada:        "Uniformes de segunda mano · Saint George's College",

  // Texto de la portada
  tituloPortada: "Bienvenidos a Ropero SG",
  textoPortada:  "Uniformes recuperados, revisados y clasificados por apoderadas voluntarias. Comprar aquí alarga la vida de cada prenda y financia becas del viaje de estudios de 11° grado.",

  // Retiro presencial
  lugarRetiro:   "Ropero, Saint George's College — Av. Santa Cruz 5400, Vitacura",
  horarioRetiro: "Miércoles de 8:00 a 13:30 h",

  // Contacto
  instagram:     "https://www.instagram.com/roperosgc/",
  paginaColegio: "https://saintgeorge.cl/familia/ropero/",
  correo:        "ropero@saintgeorge.cl",   // <-- CAMBIAR por el correo real

  // Clave del panel de administración (solo demo, ver README)
  claveAdmin:    "ropero2026",

  // Medios de pago habilitados (pon false para esconder uno)
  pagos: {
    tarjeta:      true,   // simulado en el prototipo
    transferencia:true,
    efectivo:     true    // se paga al retirar
  },

  // Días que tiene el comprador para pedir reembolso
  diasReembolso: 7
};


/* ----------------------------------------------------------------
   2) PAUTA DE ESTADOS
   Cambia aquí los nombres, colores y criterios. La página de la
   pauta (pauta.html) y los puntos de color se generan desde acá.
   ---------------------------------------------------------------- */
const ESTADOS = {
  nuevo: {
    etiqueta: "Nuevo",
    color:    "#0B5FD8",
    resumen:  "Sin uso. Puede conservar la etiqueta original.",
    criterios: [
      "Nunca fue usada o se usó una o dos veces",
      "Sin desgaste, pilling, manchas ni deformación",
      "Insignia y botones completos y firmes",
      "Cierres y elásticos como nuevos"
    ]
  },
  excelente: {
    etiqueta: "Excelente",
    color:    "#00A651",
    resumen:  "Uso leve. Se ve prácticamente igual a una prenda nueva.",
    criterios: [
      "Color parejo, sin decoloración visible",
      "Sin manchas, roturas ni zurcidos",
      "Máximo pilling muy leve en zonas de roce",
      "Insignia completa, cierres funcionando"
    ]
  },
  bueno: {
    etiqueta: "Bueno",
    color:    "#F58220",
    resumen:  "Uso visible pero prenda entera y presentable para el día a día.",
    criterios: [
      "Leve decoloración o pilling notorio",
      "Puede tener una reparación bien hecha (basta, botón cambiado)",
      "Sin agujeros ni manchas que no salgan",
      "Insignia presente aunque algo gastada"
    ]
  },
  usado: {
    etiqueta: "Usado",
    color:    "#E8272C",
    resumen:  "Sirve para deporte, talleres o emergencias. Precio más bajo.",
    criterios: [
      "Decoloración clara, pilling generalizado o bastas gastadas",
      "Puede tener una marca pequeña que no sale",
      "Se indica el defecto en la ficha de la prenda",
      "No se venden prendas rotas: esas van a reciclaje con CIRKLA"
    ]
  }
};


/* ----------------------------------------------------------------
   3) LISTAS DE LOS FILTROS
   Si agregas una prenda con un tipo, marca o talla nuevos,
   agrégalos también acá para que aparezcan en el panel de filtros.
   ---------------------------------------------------------------- */
const LISTAS = {
  tipos:  ["Polera", "Buzo", "Polar", "Blazer", "Blusa", "Camisa",
           "Falda", "Pantalón", "Parka", "Chaleco", "Corbata", "Calcetas", "Short"],

  marcas: ["First Option", "Uniformes Sport", "Falabella", "Vestuario Escolar",
           "Sin marca", "Otra"],

  tallas: ["4", "6", "8", "10", "12", "14", "16",
           "XS", "S", "M", "L", "XL"]
};
const PRENDAS = [
  {
    "id": "SG-0004",
    "tipo": "Polera",
    "nombre": "Polera piqué manga corta",
    "marca": "First Option",
    "talla": "10",
    "estado": "excelente",
    "precio": 4000,
    "stock": 1,
    "imagen": "",
    "detalle": "Insignia bordada completa. Sin manchas.",
    "publicado": true
  },
  {
    "id": "SG-0005",
    "tipo": "Polera",
    "nombre": "Polera piqué manga corta",
    "marca": "Uniformes Sport",
    "talla": "14",
    "estado": "bueno",
    "precio": 4000,
    "stock": 2,
    "imagen": "",
    "detalle": "Pilling leve en el cuello.",
    "publicado": true
  },
  {
    "id": "SG-0006",
    "tipo": "Buzo",
    "nombre": "Pantalón de buzo algodón",
    "marca": "Uniformes Sport",
    "talla": "L",
    "estado": "excelente",
    "precio": 4000,
    "stock": 1,
    "imagen": "",
    "detalle": "Elástico firme, bastas sin deshilachar.",
    "publicado": true
  },
  {
    "id": "SG-0007",
    "tipo": "Buzo",
    "nombre": "Chaqueta de buzo con cierre",
    "marca": "Uniformes Sport",
    "talla": "12",
    "estado": "bueno",
    "precio": 5000,
    "stock": 1,
    "imagen": "",
    "detalle": "Cierre funciona perfecto. Puños algo estirados.",
    "publicado": true
  },
  {
    "id": "SG-0008",
    "nombre": "Polar azul con cierre completo",
    "tipo": "Polar",
    "marca": "First Option",
    "talla": "L",
    "estado": "excelente",
    "precio": 6000,
    "stock": 1,
    "detalle": "Insignia impecable. Sin pelusas.",
    "imagen": "data:image/jpeg;base64,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",
    "publicado": true
  },
  {
    "id": "SG-0009",
    "tipo": "Polar",
    "nombre": "Polar azul con capucha",
    "marca": "Sin marca",
    "talla": "10",
    "estado": "nuevo",
    "precio": 6000,
    "stock": 1,
    "imagen": "",
    "detalle": "Donación, nunca usada. Conserva etiqueta.",
    "publicado": true
  },
  {
    "id": "SG-0010",
    "tipo": "Falda",
    "nombre": "Falda tableada gris",
    "marca": "Vestuario Escolar",
    "talla": "12",
    "estado": "bueno",
    "precio": 5000,
    "stock": 1,
    "imagen": "",
    "detalle": "Tableado marcado. Basta subida prolijamente.",
    "publicado": true
  },
  {
    "id": "SG-0011",
    "tipo": "Pantalón",
    "nombre": "Pantalón gris de vestir",
    "marca": "First Option",
    "talla": "16",
    "estado": "excelente",
    "precio": 5000,
    "stock": 1,
    "imagen": "",
    "detalle": "Sin brillo ni manchas. Pretina firme.",
    "publicado": true
  },
  {
    "id": "SG-0013",
    "tipo": "Corbata",
    "nombre": "Corbata institucional",
    "marca": "Sin marca",
    "talla": "S",
    "estado": "excelente",
    "precio": 2000,
    "stock": 3,
    "imagen": "",
    "detalle": "Nudo listo. Colores firmes.",
    "publicado": true
  },
  {
    "id": "SG-0014",
    "tipo": "Camisa",
    "nombre": "Camisa blanca manga larga",
    "marca": "Falabella",
    "talla": "14",
    "estado": "nuevo",
    "precio": 5000,
    "stock": 1,
    "imagen": "",
    "detalle": "Donación sin uso.",
    "publicado": true
  },
  {
    "id": "SG-0015",
    "tipo": "Chaleco",
    "nombre": "Chaleco azul escote V",
    "marca": "Vestuario Escolar",
    "talla": "8",
    "estado": "usado",
    "precio": 3000,
    "stock": 1,
    "imagen": "",
    "detalle": "Un pequeño zurcido en el borde inferior, poco visible.",
    "publicado": true
  },
  {
    "id": "SG-0016",
    "tipo": "Calcetas",
    "nombre": "Calcetas azules (par nuevo)",
    "marca": "Sin marca",
    "talla": "M",
    "estado": "nuevo",
    "precio": 2000,
    "stock": 5,
    "imagen": "",
    "detalle": "Pack de donación, sin uso.",
    "publicado": true
  },
  {
    "id": "SG-0017",
    "tipo": "Short",
    "nombre": "Short de educación física",
    "marca": "First Option",
    "talla": "14",
    "estado": "excelente",
    "precio": 4000,
    "stock": 1,
    "imagen": "",
    "detalle": "Cintura elástica ajustable. Sin desgaste.",
    "publicado": true
  }
];


/* ----------------------------------------------------------------
   4) PRENDAS EN VENTA
   ----------------------------------------------------------------
   Copia un bloque completo (desde { hasta },) para agregar otra.

   id       : código único. No repetir. Formato sugerido SG-0001
   tipo     : debe existir en LISTAS.tipos
   nombre   : cómo se ve en la tarjeta
   marca    : debe existir en LISTAS.marcas
   talla    : debe existir en LISTAS.tallas
   estado   : "nuevo" | "excelente" | "bueno" | "usado"
   precio   : número entero, sin puntos ni signo $
   stock    : cuántas unidades hay (normalmente 1, son prendas únicas)
   imagen   : ruta a la foto, ej "img/polera-12.jpg". Deja "" y se
              dibuja un marcador de posición automático.
   detalle  : observaciones honestas de la voluntaria que la revisó
   publicado: true la muestra en el catálogo, false la esconde
   ---------------------------------------------------------------- */
