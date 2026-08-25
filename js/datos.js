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
const PRENDAS = [
  {
    id:"SG-0001", tipo:"Blazer", nombre:"Blazer entallado mujer", marca:"First Option",
    talla:"M", estado:"excelente", precio:12000, stock:1, imagen:"",
    detalle:"Forro completo, botones originales. Sin brillo en codos.", publicado:true
  },
  {
    id:"SG-0002", tipo:"Blazer", nombre:"Blazer corte redondo", marca:"First Option",
    talla:"14", estado:"bueno", precio:9000, stock:1, imagen:"",
    detalle:"Leve brillo en las mangas. Insignia en buen estado.", publicado:true
  },
  {
    id:"SG-0003", tipo:"Blusa", nombre:"Blusa blanca spandex manga larga", marca:"Vestuario Escolar",
    talla:"12", estado:"usado", precio:3000, stock:1, imagen:"",
    detalle:"Cuello con leve amarilleo. Ideal para uso bajo polar.", publicado:true
  },
  {
    id:"SG-0004", tipo:"Polera", nombre:"Polera piqué manga corta", marca:"First Option",
    talla:"10", estado:"excelente", precio:4000, stock:1, imagen:"",
    detalle:"Insignia bordada completa. Sin manchas.", publicado:true
  },
  {
    id:"SG-0005", tipo:"Polera", nombre:"Polera piqué manga corta", marca:"Uniformes Sport",
    talla:"14", estado:"bueno", precio:4000, stock:2, imagen:"",
    detalle:"Pilling leve en el cuello.", publicado:true
  },
  {
    id:"SG-0006", tipo:"Buzo", nombre:"Pantalón de buzo algodón", marca:"Uniformes Sport",
    talla:"L", estado:"excelente", precio:4000, stock:1, imagen:"",
    detalle:"Elástico firme, bastas sin deshilachar.", publicado:true
  },
  {
    id:"SG-0007", tipo:"Buzo", nombre:"Chaqueta de buzo con cierre", marca:"Uniformes Sport",
    talla:"12", estado:"bueno", precio:5000, stock:1, imagen:"",
    detalle:"Cierre funciona perfecto. Puños algo estirados.", publicado:true
  },
  {
    id:"SG-0008", tipo:"Polar", nombre:"Polar azul con cierre completo", marca:"First Option",
    talla:"S", estado:"excelente", precio:6000, stock:1, imagen:"",
    detalle:"Insignia impecable. Sin pelusas.", publicado:true
  },
  {
    id:"SG-0009", tipo:"Polar", nombre:"Polar azul con capucha", marca:"Sin marca",
    talla:"10", estado:"nuevo", precio:6000, stock:1, imagen:"",
    detalle:"Donación, nunca usada. Conserva etiqueta.", publicado:true
  },
  {
    id:"SG-0010", tipo:"Falda", nombre:"Falda tableada gris", marca:"Vestuario Escolar",
    talla:"12", estado:"bueno", precio:5000, stock:1, imagen:"",
    detalle:"Tableado marcado. Basta subida prolijamente.", publicado:true
  },
  {
    id:"SG-0011", tipo:"Pantalón", nombre:"Pantalón gris de vestir", marca:"First Option",
    talla:"16", estado:"excelente", precio:5000, stock:1, imagen:"",
    detalle:"Sin brillo ni manchas. Pretina firme.", publicado:true
  },
  {
    id:"SG-0012", tipo:"Parka", nombre:"Parka azul institucional", marca:"First Option",
    talla:"M", estado:"bueno", precio:6000, stock:1, imagen:"",
    detalle:"Cierre principal cambiado el 2025, funciona bien.", publicado:true
  },
  {
    id:"SG-0013", tipo:"Corbata", nombre:"Corbata institucional", marca:"Sin marca",
    talla:"S", estado:"excelente", precio:2000, stock:3, imagen:"",
    detalle:"Nudo listo. Colores firmes.", publicado:true
  },
  {
    id:"SG-0014", tipo:"Camisa", nombre:"Camisa blanca manga larga", marca:"Falabella",
    talla:"14", estado:"nuevo", precio:5000, stock:1, imagen:"",
    detalle:"Donación sin uso.", publicado:true
  },
  {
    id:"SG-0015", tipo:"Chaleco", nombre:"Chaleco azul escote V", marca:"Vestuario Escolar",
    talla:"8", estado:"usado", precio:3000, stock:1, imagen:"",
    detalle:"Un pequeño zurcido en el borde inferior, poco visible.", publicado:true
  },
  {
    id:"SG-0016", tipo:"Calcetas", nombre:"Calcetas azules (par nuevo)", marca:"Sin marca",
    talla:"M", estado:"nuevo", precio:2000, stock:5, imagen:"",
    detalle:"Pack de donación, sin uso.", publicado:true
  },
  {
  id:"SG-0017", tipo:"Short", nombre:"Short de educación física", marca:"First Option",
  talla:"14", estado:"excelente", precio:4000, stock:1, imagen:"",
  detalle:"Cintura elástica ajustable. Sin desgaste.", publicado:true
},
];
