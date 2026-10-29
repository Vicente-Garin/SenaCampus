require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Gloss = require('../src/models/Gloss');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://admin:password123@localhost:27017/senacampus_db?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('MongoDB conectado para cargar el Diccionario Oficial LSCh (MINEDUC/UMCE).');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

// 1. Núcleo de señas de alta frecuencia para contexto universitario (Con Lottie/GIF asignado)
const prioritySigns = [
  // Del Tomo A-H
  { termino: 'alumno', glosa_id: 'GL_ALUMNO', variantes: ['alumnos', 'estudiante', 'estudiantes'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/alumno.json' },
  { termino: 'aprender', glosa_id: 'GL_APRENDER', variantes: ['estudiar', 'educarse'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/aprender.json' },
  { termino: 'biblioteca', glosa_id: 'GL_BIBLIOTECA', variantes: ['sala de libros'], categoria: 'lugares', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/biblioteca.json' },
  { termino: 'beca', glosa_id: 'GL_BECA', variantes: ['subsidio', 'ayuda estudiantil'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/beca.json' },
  { termino: 'clase', glosa_id: 'GL_CLASE', variantes: ['leccion', 'catedra', 'materia'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/clase.json' },
  { termino: 'colegio', glosa_id: 'GL_COLEGIO', variantes: ['escuela', 'liceo', 'instituto'], categoria: 'lugares', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/colegio.json' },
  { termino: 'computador', glosa_id: 'GL_COMPUTADOR', variantes: ['ordenador', 'pc', 'notebook'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/computador.json' },
  { termino: 'dactilologico', glosa_id: 'GL_DACTILOLOGICO', variantes: ['abecedario', 'alfabeto manual'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/dactilologico.json' },
  { termino: 'escribir', glosa_id: 'GL_ESCRIBIR', variantes: ['anotar', 'redactar'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/escribir.json' },
  { termino: 'enseñar', glosa_id: 'GL_ENSENAR', variantes: ['instruir', 'educar'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/ensenar.json' },
  { termino: 'entender', glosa_id: 'GL_ENTENDER', variantes: ['comprender'], categoria: 'comun', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/entender.json' },
  { termino: 'evaluacion', glosa_id: 'GL_EVALUACION', variantes: ['calificacion', 'nota', 'medicion'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/evaluacion.json' },
  { termino: 'facultad', glosa_id: 'GL_FACULTAD', variantes: ['departamento'], categoria: 'lugares', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/facultad.json' },
  { termino: 'hola', glosa_id: 'GL_HOLA', variantes: ['buenos dias', 'saludo'], categoria: 'comun', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/hola.json' },
  { termino: 'hoy', glosa_id: 'GL_HOY', variantes: ['presente', 'este dia'], categoria: 'tiempo', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/hoy.json' },
  { termino: 'hora', glosa_id: 'GL_HORA', variantes: ['horario', 'tiempo'], categoria: 'tiempo', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/hora.json' },

  // Del Tomo I-Z
  { termino: 'idea', glosa_id: 'GL_IDEA', variantes: ['pensamiento'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/idea.json' },
  { termino: 'idioma', glosa_id: 'GL_IDIOMA', variantes: ['lengua'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/idioma.json' },
  { termino: 'informacion', glosa_id: 'GL_INFORMACION', variantes: ['comunicacion', 'notificacion'], categoria: 'comun', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/informacion.json' },
  { termino: 'ingeniero', glosa_id: 'GL_INGENIERO', variantes: ['ingenieria'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/ingeniero.json' },
  { termino: 'interprete', glosa_id: 'GL_INTERPRETE', variantes: ['traductor'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/interprete.json' },
  { termino: 'investigar', glosa_id: 'GL_INVESTIGAR', variantes: ['averiguar', 'indagar'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/investigar.json' },
  { termino: 'leer', glosa_id: 'GL_LEER', variantes: ['releer', 'hojear'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/leer.json' },
  { termino: 'lengua de señas', glosa_id: 'GL_LENGUA_DE_SENAS', variantes: ['lsch', 'señas'], categoria: 'comun', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/lengua_senas.json' },
  { termino: 'libro', glosa_id: 'GL_LIBRO', variantes: ['texto', 'tomo'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/libro.json' },
  { termino: 'mañana', glosa_id: 'GL_MANANA', variantes: ['dia siguiente'], categoria: 'tiempo', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/manana.json' },
  { termino: 'matricula', glosa_id: 'GL_MATRICULA', variantes: ['inscripcion'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/matricula.json' },
  { termino: 'profesor', glosa_id: 'GL_PROFESOR', variantes: ['docente', 'catedratico', 'profe'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/profesor.json' },
  { termino: 'prueba', glosa_id: 'GL_PRUEBA', variantes: ['examen', 'certamen', 'test'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/prueba.json' },
  { termino: 'proyecto', glosa_id: 'GL_PROYECTO', variantes: ['plan', 'propuesta'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/proyecto.json' },
  { termino: 'sala de clases', glosa_id: 'GL_SALA_DE_CLASES', variantes: ['sala', 'aula'], categoria: 'lugares', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/sala.json' },
  { termino: 'tesis', glosa_id: 'GL_TESIS', variantes: ['memoria', 'investigacion de titulo'], categoria: 'academico', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/tesis.json' },
  { termino: 'traducir', glosa_id: 'GL_TRADUCIR', variantes: ['interpretar'], categoria: 'comun', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/traducir.json' },
  { termino: 'universidad', glosa_id: 'GL_UNIVERSIDAD', variantes: ['campus', 'u'], categoria: 'lugares', tipo_recurso: 'lottie', archivo_asset: 'assets/signs/common/universidad.json' }
];

// 2. Vocabulario léxico oficial extraído de las entradas del Diccionario Bilingüe LSCh (Tomos I y II)
const officialLSchVocab = [
  // Letra A
  'abandonar', 'abanicar', 'abanico', 'abecedario', 'abeja', 'abogado', 'abortar', 'abotonar',
  'abrazar', 'abreviar', 'abrigar', 'abrigo', 'abril', 'abundante', 'aburrir', 'aburrido',
  'acabar', 'acalorado', 'acampar', 'acariciar', 'aceite', 'acelga', 'aceptar', 'acero',
  'acompañar', 'acosar', 'acuerdo', 'acusar', 'adelgazar', 'adivinar', 'adolescente', 'adoptar',
  'adorno', 'adulto', 'aeropuerto', 'afeitar', 'afilado', 'afiliacion', 'africa', 'agenda',
  'agosto', 'agregar', 'agrio', 'agrupar', 'agua', 'aguila', 'aguja', 'ahogar', 'ahorrar',
  'ahumada', 'ajedrez', 'aji', 'ajo', 'alameda', 'alarma', 'albondiga', 'alcachofa', 'alcantarilla',
  'alcohol', 'alegria', 'alemania', 'alfombra', 'algodon', 'alguno', 'almeja', 'almohada',
  'almorzar', 'almuerzo', 'alpaca', 'aluminio', 'al-reves', 'amante', 'amar', 'amargado',
  'amargo', 'amarillo', 'amasar', 'ambulancia', 'amenazar', 'america', 'amigo', 'amor',
  'ampolleta', 'analisis', 'angustiado', 'anillo', 'animal', 'anotar', 'anteayer', 'anteojos',
  'antes', 'antiguo', 'antofagasta', 'anular', 'año', 'apagar', 'aparte', 'apellido',
  'aplaudir', 'apodo', 'apostar', 'apoyar', 'aprobar', 'aprovechar', 'apurado', 'arabia',
  'arado', 'araña', 'arbitro', 'arbol', 'arcoiris', 'ardilla', 'arena', 'argentina', 'arica',
  'aries', 'arquero', 'arquitecto', 'arreglar', 'arrendar', 'arrepentirse', 'arroz', 'arte',
  'asado', 'ascensor', 'asco', 'asesinar', 'asfixia', 'asustarse', 'atacar', 'ataque',
  'ataud', 'atender', 'atento', 'aterrizar', 'atraer', 'atravesar', 'audaz', 'audifono',
  'audiometria', 'australia', 'automovil', 'aval', 'a-veces', 'avergonzarse', 'avion', 'avisar',
  'ayer', 'ayudar', 'azucar', 'azul',

  // Letra B
  'babero', 'bacinica', 'bacteria', 'bailar', 'bajar', 'bala', 'balancin', 'balanza',
  'balcon', 'balde', 'ballena', 'banco', 'banda', 'bandeja', 'bandera', 'banquete',
  'bañarse', 'baño', 'bar', 'barato', 'barba', 'barco', 'barnizar', 'barquillo',
  'barrer', 'barril', 'barrio', 'barro', 'base', 'basquetbol', 'baston', 'basura',
  'bata', 'batalla', 'batidora', 'bautizar', 'beatle', 'beber', 'bebida', 'bencina',
  'bendicion', 'berenjena', 'besar', 'beso', 'biblia', 'bicho', 'bicicleta', 'bien',
  'bueno', 'bienvenida', 'bigote', 'bikini', 'bilingüe', 'billete', 'billetera', 'bingo',
  'binocular', 'biobio', 'biografia', 'biologia', 'bisabuelo', 'bisnieto', 'bistec', 'bizcocho',
  'blanco', 'blando', 'blusa', 'bochorno', 'bocina', 'boleta', 'boleteria', 'boleto',
  'bolita', 'bolivia', 'bolsillo', 'bolso', 'bombero', 'bombilla', 'bombon', 'bondad',
  'bonito', 'bordar', 'borracho', 'borrador', 'borroso', 'bostezar', 'bota', 'botar',
  'bote', 'botella', 'botiquin', 'boton', 'boxeo', 'brasero', 'brasil', 'brillante',
  'brindar', 'brisa', 'broma', 'bronce', 'bronquitis', 'brujo', 'brusco', 'brujula',
  'bucear', 'buenas-tardes', 'buenas-noches', 'buenos-dias', 'buey', 'bufanda', 'buho', 'burbuja',
  'burlarse', 'burro', 'bus', 'buscar', 'buzo', 'buzon',

  // Letra C y Ch
  'caballo', 'cabra', 'caca', 'caer', 'cafe', 'caja', 'cajero', 'calama', 'calculadora',
  'calcetin', 'calcular', 'calefon', 'calendario', 'caliente', 'callampa', 'callar', 'calle',
  'calmado', 'calor', 'calzon', 'cama', 'camara', 'camaron', 'cambiar', 'camello',
  'camilla', 'caminar', 'camino', 'camion', 'camisa', 'campo', 'canada', 'canario',
  'cancer', 'cancha', 'candado', 'canela', 'cansado', 'cantar', 'caña', 'capitan',
  'capital', 'capricornio', 'carabinero', 'caracol', 'carbon', 'carbonada', 'cariñoso', 'carne',
  'carniceria', 'carpintero', 'carta', 'cartera', 'carpeta', 'carton', 'casa', 'casarse',
  'castaña', 'castellano', 'castigar', 'castillo', 'castor', 'catolico', 'cauquenes', 'cazuela',
  'cazar', 'cebolla', 'celebrar', 'celeste', 'celos', 'cementerio', 'cenicero', 'censura',
  'centro', 'cepillarse', 'cera', 'cerca', 'cerebro', 'cereza', 'cero', 'certificado',
  'cerveza', 'cesante', 'ciclo', 'ciego', 'cielo', 'ciencia', 'ciervo', 'cigüeña',
  'cimentar', 'cinta', 'cintillo', 'cinturon', 'circo', 'ciruela', 'cirujano', 'ciudad',
  'claro', 'clavo', 'closet', 'cobrar', 'cobre', 'coche', 'cocina', 'cocinar',
  'cocodrilo', 'codicioso', 'codorniz', 'cojin', 'colador', 'cola', 'colchón', 'colgado',
  'colombia', 'colonia', 'color', 'collar', 'columpio', 'columna', 'coma', 'combatir',
  'comedor', 'comadre', 'comer', 'comentario', 'comico', 'comida', 'comision', 'como',
  'comoda', 'compadre', 'compañero', 'comparar', 'compartir', 'competencia', 'comprar', 'comprender',
  'comprobar', 'compromiso', 'comulgar', 'comuna', 'concejal', 'concepcion', 'concha', 'condimento',
  'condor', 'conejo', 'confesar', 'confianza', 'confundido', 'congreso', 'conocer', 'consolar',
  'construir', 'contabilidad', 'contador', 'contagiar', 'contar', 'contento', 'control', 'conversar',
  'cooperar', 'copa', 'copiapo', 'copiar', 'copihue', 'copuchar', 'coqueto', 'coquimbo',
  'corazon', 'corbata', 'corchetera', 'cordero', 'corona', 'correcto', 'corregir', 'correo',
  'correr', 'cortar', 'cortaunas', 'cortina', 'coser', 'cotona', 'coyhaique', 'crecer',
  'credito', 'creer', 'crema', 'criticar', 'cuaderno', 'cuadro', 'cual', 'cuando',
  'cuanto', 'cubrecama', 'cuchara', 'cucharon', 'cuchillo', 'cueca', 'cuento', 'cuero',
  'cuidar', 'culebra', 'culpa', 'cultura', 'cumpleaños', 'cumplir', 'cuna', 'cuñado',
  'cura', 'curico', 'curioso', 'chala', 'chaleco', 'chalon', 'chal', 'champana',
  'champu', 'chancho', 'chao', 'chaqueta', 'charquican', 'chatear', 'cheque', 'chicha',
  'chicle', 'chicharron', 'chile', 'chileno', 'chiloe', 'chillan', 'china', 'chinche',
  'chinita', 'chirimoya', 'chisme', 'chiste', 'chivo', 'choclo', 'chocolate', 'chofer',
  'cholga', 'choque', 'chorito', 'chorizo', 'chuleta', 'chupalla', 'chupe', 'chupete',
  'churrasco', 'churro', 'chuzo',

  // Letra D
  'dado', 'damas', 'damasco', 'danza', 'dar', 'debajo', 'debil', 'decidido',
  'decidir', 'decir', 'dedal', 'defecar', 'defecto', 'defender', 'delgado', 'delincuente',
  'delirar', 'democracia', 'demora', 'dentista', 'denunciar', 'departamento', 'depende', 'depilarse',
  'deporte', 'depositar', 'deprimido', 'derecho', 'dermatologo', 'derretirse', 'desafiar', 'desaparecer',
  'desarrollo', 'desayuno', 'descansar', 'descubrir', 'desear', 'desesperado', 'desfile', 'desierto',
  'desinfectante', 'desmayarse', 'desobedecer', 'desodorante', 'desorden', 'despedido', 'despertar', 'despues',
  'destacado', 'destornillador', 'detective', 'deuda', 'dia', 'diabetes', 'diablo', 'diagnostico',
  'diamante', 'diario', 'diarrea', 'dibujar', 'dictador', 'dictar', 'diccionario', 'diciembre',
  'diente', 'dieta', 'diferente', 'dificil', 'difundir', 'dinero', 'dinosaurio', 'diploma',
  'diplomatico', 'diputado', 'directiva', 'director', 'discapacitado', 'disculpar', 'discutir', 'disfrazar',
  'disimular', 'distraido', 'dividir', 'divorcio', 'documento', 'dolar', 'dolor', 'domicilio',
  'domingo', 'donde', 'dorado', 'dormir', 'dormitorio', 'dos-puntos', 'duda', 'duelo',
  'duende', 'dueño', 'dulce', 'durazno', 'duro',

  // Letra E
  'ebrio', 'echar', 'echar-de-menos', 'ecografia', 'economia', 'ecuador', 'edad', 'edificio',
  'educacion', 'educado', 'efectivo', 'egipto', 'egoista', 'ejemplo', 'ejercicio', 'elastico',
  'electricidad', 'elefante', 'elegante', 'elegir', 'embajada', 'embarazo', 'emocion', 'empanada',
  'empate', 'empezar', 'empleado', 'empresa', 'enamorado', 'enano', 'encargar', 'enchufe',
  'enciclopedia', 'encontrar', 'endemoniado', 'enemigo', 'enero', 'enfermedad', 'enfermero', 'enfermo',
  'enfriar', 'engordar', 'enojado', 'ensalada', 'enterrar', 'entero', 'entrevista', 'entretener',
  'envolver', 'envidia', 'equilibrio', 'equivocado', 'erizo', 'error', 'escalera', 'escandalo',
  'escapar', 'escarabajo', 'escenario', 'escoba', 'escobilla', 'esconder', 'escorpion', 'escribiente',
  'escritor', 'escuchar', 'escudo', 'escuela', 'escultura', 'esfuerzo', 'esgrima', 'esmeralda',
  'espacio', 'espada', 'espalda', 'españa', 'español', 'esparrago', 'especial', 'espejo',
  'esperanza', 'esperar', 'espia', 'espiar', 'espina', 'espiritu', 'esponja', 'esposo',
  'espuma', 'esquiar', 'esquina', 'estacion', 'estacionamiento', 'estadio', 'estados-unidos', 'estampilla',
  'estatua', 'estomago', 'estrella', 'estructura', 'estuche', 'estufa', 'etcetera', 'eterno',
  'etica', 'europa', 'evangelico', 'evangelio', 'excavadora', 'excursion', 'exigente', 'existir',
  'experimento', 'experto', 'explicar', 'exquisito', 'extranjero',

  // Letra F
  'fabrica', 'fabula', 'facil', 'falda', 'fallecer', 'falsificar', 'falso', 'faltar',
  'fama', 'familia', 'famoso', 'fanatico', 'fantasia', 'farellones', 'farmacia', 'faro',
  'fascinar', 'favor', 'favorito', 'fe', 'febrero', 'fecundar', 'fecha', 'felicidad',
  'felicitar', 'feliz', 'femenino', 'feo', 'feria', 'feriado', 'ferrocarril', 'festival',
  'fiambre', 'fidelidad', 'fideos', 'fiebre', 'fiel', 'fierro', 'fiesta', 'fila',
  'filipinas', 'filmar', 'filosofia', 'fin', 'final', 'fin-de-semana', 'fingir', 'finlandia',
  'fino', 'firma', 'fisica', 'flaco', 'flan', 'flauta', 'flecha', 'flojo',
  'flor', 'florero', 'flotar', 'foca', 'fonda', 'fonoaudiologo', 'fortuna', 'fosforo',
  'fotocopiar', 'fotografia', 'fracasar', 'fraccion', 'fragancia', 'fragil', 'frambuesa', 'frances',
  'francia', 'frasco', 'frase', 'frazada', 'freezer', 'freir', 'frenar', 'fresco',
  'frio', 'frontera', 'fruta', 'frutilla', 'fucsia', 'fuego', 'fuente', 'fuerza',
  'fuga', 'fumar', 'fundar', 'funeral', 'furgon', 'furia', 'futbol', 'futuro',

  // Letra G y H
  'gacela', 'gafas', 'gaita', 'galaxia', 'galleta', 'gallina', 'gallo', 'galope',
  'galvano', 'ganar', 'gancho', 'ganso', 'garabato', 'garantia', 'garbanzo', 'garganta',
  'garrafa', 'garrapata', 'gas', 'gasa', 'gasolina', 'gastar', 'gata', 'gato',
  'gaviota', 'gelatina', 'gemelos', 'geminis', 'general', 'genero', 'generoso', 'genetico',
  'genio', 'gente', 'geografia', 'geometria', 'gerente', 'gesto', 'gigante', 'gimnasia',
  'gimnasio', 'ginecologo', 'girasol', 'gitano', 'gladiolo', 'globo', 'gobierno', 'gol',
  'golf', 'golfo', 'golondrina', 'goloso', 'golpe', 'golpear', 'goma', 'gordo',
  'gorila', 'gorro', 'gota', 'gozar', 'grabar', 'gracias', 'gracioso', 'grado',
  'graduacion', 'grafico', 'gramatica', 'gramo', 'granizo', 'granja', 'granjero', 'grano',
  'grasa', 'gratis', 'grave', 'grecia', 'greda', 'grifo', 'grillo', 'gripe',
  'gris', 'gritar', 'grua', 'grueso', 'grupo', 'guagua', 'guanaco', 'guante',
  'guardar', 'guardia', 'guatemala', 'guerra', 'guia', 'guinda', 'guitarra', 'gusano',
  'gustar', 'haba', 'habilidad', 'habitacion', 'habito', 'hablar', 'hace-mucho-tiempo', 'hacer',
  'hacha', 'halcon', 'hallulla', 'hamaca', 'hambre', 'hamster', 'harina', 'hasta',
  'hebilla', 'hechizo', 'hediondo', 'helado', 'helice', 'helicoptero', 'herencia', 'herida',
  'hermano', 'hermanastro', 'hermoso', 'heroe', 'herradura', 'hervidor', 'hervir', 'hielo',
  'higado', 'higo', 'hijastro', 'hijo', 'hilo', 'himno', 'hincarse', 'hincha',
  'hinchado', 'hipnotizar', 'hipo', 'hipoacusico', 'hipocrita', 'hipopotamo', 'historia', 'hogar',
  'hoja', 'holanda', 'hombre', 'homenaje', 'hongo', 'honor', 'horario', 'hormiga',
  'horno', 'horoscopo', 'hospital', 'hotel', 'huelga', 'huemul', 'huaso', 'huerfano',
  'huesillo', 'hueso', 'huevo', 'huincha', 'huir', 'humano', 'humilde', 'humillar',
  'humo', 'hungria', 'huracan',

  // Tomo II: I a Z
  'identidad', 'ideologia', 'iglesia', 'igual', 'iguana', 'iluminacion', 'imaginacion', 'iman',
  'imitar', 'impermeable', 'importante', 'imposible', 'imprenta', 'impuesto', 'inaugurar', 'incendio',
  'incienso', 'incluir', 'independiente', 'india', 'individual', 'industria', 'infarto', 'infeccion',
  'infiel', 'infierno', 'infinito', 'inflamar', 'inflar', 'informar', 'infraccion', 'ingles',
  'iniciar', 'inmediato', 'inmigracion', 'innovacion', 'inocente', 'inquieto', 'insecto', 'insignia',
  'insistir', 'insomnio', 'inspector', 'instituto', 'instructor', 'insultar', 'integracion', 'inteligencia',
  'intentar', 'intercambiar', 'interes', 'interesado', 'interesante', 'internacional', 'internado', 'internet',
  'interrogar', 'interrumpir', 'intimidad', 'intruso', 'intuicion', 'inundacion', 'inventar', 'inventario',
  'invernadero', 'invertir', 'invierno', 'invitar', 'inyeccion', 'iquique', 'ir', 'isla',
  'isla-de-pascua', 'izar', 'izquierdo', 'jabali', 'jabon', 'jaiba', 'jalea', 'jamas',
  'jamon', 'japon', 'jaqueca', 'jardin', 'jardinero', 'jarro', 'jaula', 'jefe',
  'jeringa', 'jesus', 'jinete', 'jirafa', 'joven', 'jubilado', 'judio', 'jueves',
  'juez', 'jugar', 'juguera', 'juguete', 'julio', 'junio', 'juntar', 'juntarse',
  'jupiter', 'jurar', 'justicia', 'justo', 'karate', 'kilo', 'kilometro', 'kiwi',
  'koala', 'la-serena', 'ladrar', 'ladrillo', 'ladron', 'lagartija', 'lago', 'lagrimas',
  'lampara', 'lana', 'lancha', 'langostino', 'lapiz', 'largo', 'lastima', 'latido',
  'lavadora', 'lavar', 'leche', 'lechuga', 'lechuza', 'lejos', 'lenguaje', 'lentamente',
  'lentes', 'leña', 'leo', 'leon', 'leopardo', 'ley', 'leyenda', 'libertad',
  'libra', 'libreria', 'lider', 'liebre', 'limon', 'limpio', 'lindo', 'lingüistica',
  'liquido', 'litro', 'liviano', 'living', 'lobo', 'loco', 'longaniza', 'loro',
  'los-andes', 'los-angeles', 'lota', 'loteria', 'lugar', 'luna', 'lunes', 'lupa',
  'lustrar', 'luz', 'llama', 'llamar', 'llamarse', 'llave', 'llavero', 'llegar',
  'llenar', 'llevar', 'llorar', 'lluvia', 'macetero', 'macha', 'machacar', 'madera',
  'madrid', 'madrastra', 'madrina', 'madrugada', 'maduro', 'mafia', 'magia', 'mago',
  'maipu', 'maiz', 'mal', 'mal-educado', 'maleta', 'malo', 'mama', 'mamar',
  'mamifero', 'mancha', 'mandar', 'manejar', 'manga', 'manguera', 'manicomio', 'manipulador',
  'manjar', 'manteca', 'mantel', 'mantener', 'mantequilla', 'manzana', 'mañoso', 'mapa',
  'mapuche', 'maquillarse', 'mar', 'maraton', 'marchar', 'marearse', 'marfil', 'marido',
  'marihuana', 'marinero', 'mariposa', 'marisco', 'marte', 'martes', 'martillo', 'marzo',
  'mas', 'mas-o-menos', 'masa', 'masaje', 'mascara', 'matar', 'mate', 'matematica',
  'matrimonio', 'matrona', 'maule', 'mayo', 'mayuscula', 'mecanico', 'media', 'medico',
  'mediodia', 'medir', 'mejor', 'mellizos', 'melon', 'memorizar', 'mendigo', 'menopausia',
  'menos', 'menstruacion', 'menta', 'mentir', 'mentira', 'menu', 'mercado', 'mermelada',
  'mes', 'mesa', 'metro', 'mexico', 'mezclar', 'mezquino', 'micro', 'microscopio',
  'miedo', 'miel', 'miercoles', 'milagro', 'militar', 'millonario', 'mimica', 'minero',
  'ministerio', 'minuscula', 'minuto', 'mirar', 'misa', 'mitad', 'mochila', 'mojado',
  'molestar', 'molesto', 'molino', 'moneda', 'monja', 'mono', 'monstruo', 'montaña',
  'morado', 'morder', 'moribundo', 'morir', 'mosca', 'mostaza', 'mostrar', 'motel',
  'moto', 'motor', 'mozo', 'muchas-veces', 'mudar', 'muerto', 'mujer', 'mudo',
  'mujeriego', 'multa', 'multiplicar', 'mundo', 'municipalidad', 'muñeca', 'murcielago', 'muro',
  'museo', 'musica', 'nacer', 'nacion', 'nacional', 'nacionalidad', 'nada', 'nadar',
  'naipe', 'naranja', 'narrar', 'nata', 'natural', 'naturaleza', 'nausea', 'navidad',
  'necesitar', 'negocio', 'negro', 'nervioso', 'neumatico', 'neurologo', 'neutro', 'nevar',
  'nicaragua', 'nicotina', 'nido', 'nieto', 'nieve', 'ningun', 'niñera', 'niño',
  'nispero', 'no', 'no-entender', 'noche', 'no-haber', 'no-hacer-caso', 'no-poder', 'no-gustar',
  'no-saber', 'nombre', 'normativo', 'norte', 'norteamerica', 'noruega', 'nos-juntamos', 'nosotros',
  'notaria', 'noticia', 'novedad', 'novia', 'noviembre', 'nublado', 'nudo', 'nuera',
  'nueva-york', 'nuevo', 'numeroso', 'nunca', 'nutria', 'nuez', 'ñoquis', 'ñuñoa',
  'obelisco', 'obispo', 'obligar', 'obrero', 'observar', 'objetivo', 'obstaculo', 'ocaso',
  'oceano', 'octubre', 'ocupado', 'odiar', 'ofenderse', 'oficial', 'oficina', 'ofrecer',
  'oftalmologo', 'oir', 'ojala', 'ola', 'oler', 'olimpiada', 'olla', 'olvidar',
  'opinion', 'oportunidad', 'optica', 'opuesto', 'oracion', 'orar', 'oralismo', 'ordenar',
  'ordeñar', 'ordinario', 'oregano', 'organizar', 'orgullo', 'orina', 'oscuro', 'oso',
  'ortografia', 'osorno', 'otoño', 'otra-vez', 'otro', 'ovalle', 'oveja', 'oxigeno',
  'oyente', 'paciencia', 'padrastro', 'padrino', 'pagar', 'paila', 'pajaro', 'pala',
  'palabra', 'palido', 'paloma', 'palta', 'panadero', 'pan', 'panama', 'pantalon',
  'papa', 'papaya', 'papel', 'papel-higienico', 'paraguas', 'parafina', 'para', 'paraguay',
  'parar', 'pararse', 'parche', 'parecer', 'parecerse', 'pareja', 'pariente', 'parka',
  'parlamento', 'parrilla', 'parrillada', 'participar', 'partido-de-futbol', 'pasaje', 'pasaporte', 'pasear',
  'pasillo', 'pasta-de-dientes', 'pastel', 'pastelero', 'pasto', 'pastor', 'patada', 'pate',
  'patear', 'patente', 'patio', 'pato', 'pavo', 'payaso', 'paz', 'peaje',
  'pebre', 'pecado', 'pedir', 'pegamento', 'pegar', 'peinarse', 'pelea', 'pelicano',
  'pelicula', 'peligroso', 'pelota', 'peluquero', 'pena', 'pensar', 'peor', 'pera',
  'perder', 'perdon', 'perfecto', 'perforadora', 'perfume', 'permanecer', 'periodista', 'permiso',
  'pero', 'perro', 'persona', 'pertenecer', 'pescado', 'peru', 'pescar', 'peso',
  'petroleo', 'pez', 'piano', 'pichilemu', 'piedra', 'pieza', 'pijama', 'pila',
  'pillo', 'piloto', 'pingüino', 'pino', 'pintar', 'pintura', 'piña', 'piñata',
  'piojo', 'pisco', 'piso', 'pizarron', 'planchar', 'planta', 'plata', 'platano',
  'plateado', 'plato', 'plaza', 'plomo', 'pluma', 'plumero', 'plumon', 'poco-tiempo',
  'podar', 'poder', 'poesia', 'politica', 'polo', 'polo-norte', 'polo-sur', 'pololo',
  'polonia', 'pollo', 'por-favor', 'por-que', 'porcelana', 'porcentaje', 'porfiado', 'poroto',
  'portero', 'poste-de-luz', 'postre', 'practicar', 'precio', 'preguntar', 'premio', 'preocupado',
  'presentar', 'presidente', 'preso', 'primavera', 'primero', 'primo', 'princesa', 'principal',
  'principe', 'problema', 'profesional', 'prometer', 'propina', 'propio', 'protestar', 'proyector',
  'psicologia', 'psicologo', 'pucon', 'puente', 'puerto-montt', 'pulga', 'pulpo', 'punta-arenas',
  'punto', 'pure', 'que', 'que-haces', 'que-hora-es', 'quedarse', 'queja', 'quemarse',
  'queque', 'querer', 'querido', 'quesillo', 'queso', 'quien', 'quieto', 'quimica',
  'quimono', 'quintero', 'quinto', 'quiosco', 'quitar', 'quitasol', 'quizas', 'rabano',
  'rabia', 'radar', 'radiografia', 'raiz', 'raiz-cuadrada', 'radio', 'rallador', 'rana',
  'rancagua', 'rapido', 'raro', 'raton', 'ravioles', 'rayo', 'rayuela', 'raza',
  'razon', 'recibir', 'reclamar', 'recordar', 'recreo', 'recuerdo', 'recuperar', 'redondo',
  'reemplazar', 'refrigerador', 'regalar', 'regar', 'regimiento', 'regiones-de-chile', 'regla', 'reglamento',
  'rehabilitacion', 'reina', 'reir', 'reja', 'relacion', 'relacion-sexual', 'relajacion', 'relampago',
  'relato', 'religion', 'reloj', 'remar', 'remedio', 'renunciar', 'repetir', 'repollo',
  'reposar', 'resbalarse', 'resfrio', 'respeto', 'respirar', 'responder', 'responsable', 'respuesta',
  'resta', 'restar', 'restaurante', 'resultado', 'retar', 'reumatologo', 'reunion', 'reventar',
  'revolver', 'revolver-arma', 'rey', 'rezar', 'rico', 'riesgo', 'rinoceronte', 'rio',
  'robar', 'robot', 'rodeo', 'rogar', 'rojo', 'roma', 'romance', 'romano',
  'rompecabezas', 'romper', 'ropa', 'ropero', 'rosa', 'rosado', 'roto', 'rubio',
  'rueda', 'rugby', 'ruido', 'ruleta', 'rusia', 'sabado', 'sabana', 'saber',
  'sabio', 'sabor', 'sacapuntas', 'sacar', 'sacerdote', 'saco', 'sacudir', 'sagitario',
  'sagrado', 'sal', 'salado', 'salchicha', 'salero', 'salir', 'saltar', 'salud',
  'saludo', 'salvaje', 'salvar', 'sandia', 'sandwich', 'sangre', 'santiago', 'santo',
  'sapo', 'sarampion', 'sarna', 'sarten', 'sastre', 'satisfecho', 'secador', 'seco',
  'secretario', 'secreto', 'sed', 'seda', 'segundo', 'seguro', 'seleccionar', 'selva',
  'semaforo', 'semana', 'sembrar', 'semilla', 'sentar', 'sentir', 'sentir-lastima', 'sentirse-mal',
  'señor', 'señora', 'señorita', 'separar', 'septiembre', 'septimo', 'sepultura', 'serpentina',
  'serpiente', 'servilleta', 'sexto', 'shop', 'si', 'sida', 'siempre', 'siglo',
  'significado', 'silaba', 'silencio', 'silla', 'sillon', 'simpatico', 'sincero', 'sindicato',
  'sinonimo', 'sintoma', 'sismo', 'sobra', 'sobrino', 'sociedad', 'socio', 'sol',
  'solamente', 'soldado', 'soldador', 'soledad', 'solicitud', 'solo', 'soltero', 'sombra',
  'sombrero', 'soñar', 'sopa', 'soplar', 'sordo', 'sordomudo', 'sorpresa', 'sorteo',
  'suave', 'subir-escalera', 'subirse', 'submarino', 'sucio', 'sudar', 'suecia', 'suegro',
  'suela', 'sueldo', 'suero', 'suerte', 'sufrir', 'suma', 'sumar', 'supermercado',
  'supervisar', 'suplicar', 'suponer', 'sur', 'suspender', 'tabla', 'tacaño', 'taco',
  'tag', 'tahiti', 'tailandia', 'talca', 'talcahuano', 'tallarines', 'tambien', 'tambor',
  'tango', 'tapar', 'tardar', 'tarde', 'tarifa', 'tauro', 'taxi', 'taza',
  'tazon', 'te', 'teatro', 'techo', 'tejer', 'tela', 'telefono', 'telescopio',
  'television', 'tema', 'temperatura', 'templo', 'temuco', 'tenedor', 'tener', 'tenis',
  'teñir', 'tercero', 'terminar', 'termometro', 'terno', 'terraza', 'testamento', 'tetera',
  'texto', 'tibio', 'tiburon', 'tiempo', 'tienda', 'tierno', 'tierra', 'tigre',
  'tijera', 'tilde', 'timbre', 'tina', 'tinta', 'tio', 'tirar', 'titere',
  'toalla', 'tocar-bocina', 'tocar-timbre', 'tocino', 'todavia', 'todo', 'todo-el-dia', 'todos',
  'tomate', 'tomillo', 'toro', 'torpe', 'torre', 'torta', 'tortilla', 'tortuga',
  'tos', 'toser', 'tostada', 'tostado', 'tostador', 'trabajar', 'trabajo', 'tractor',
  'tradicion', 'tragar', 'traicion', 'tramite', 'trampa', 'tranquilo', 'transito', 'transpirar',
  'trastorno', 'tratar', 'trebol', 'tren', 'triangulo', 'trigo', 'triste', 'triunfo',
  'trompa', 'trompeta', 'trueno', 'tucan', 'tuerca', 'tuerto', 'tumba', 'tunel',
  'turron', 'ulcera', 'ultimo', 'unico', 'uniforme', 'union', 'universal', 'universo',
  'urgente', 'uruguay', 'usar', 'util', 'uva', 'vaca', 'vacaciones', 'vacio',
  'vacuna', 'vagabundo', 'valdivia', 'valiente', 'valioso', 'valor', 'valparaiso', 'vanidoso',
  'vapor', 'vaso', 'vaticano', 'veces', 'vecino', 'vela', 'velador', 'velero',
  'velocidad', 'velocimetro', 'velatorio', 'veloz', 'vena', 'venado', 'vencer', 'venda',
  'vender', 'venecia', 'veneno', 'venezuela', 'venganza', 'venir', 'ventana', 'ventilador',
  'ver', 'verano', 'verbo', 'verdad', 'verdadero', 'verde', 'vereda', 'verguenza',
  'vertigo', 'vestido', 'vestirse', 'veston', 'viajar', 'vibora', 'vicio', 'video',
  'vidrio', 'viejo', 'viejo-pascuero', 'vienesa', 'viento', 'viernes', 'vigilar', 'vinagre',
  'vino', 'viña-del-mar', 'violacion', 'violin', 'virar', 'virgen', 'virutilla', 'visa',
  'visitar', 'vitrina', 'viudo', 'vivir', 'vivo', 'vocabulario', 'volantin', 'volar',
  'volcan', 'voleibol', 'voluntad', 'votar', 'voz', 'washington', 'wc', 'whisky',
  'ya', 'yema', 'yerno', 'yeso', 'yodo', 'yogurt', 'yo-yo', 'yunque',
  'zanahoria', 'zancudo', 'zapallito', 'zapallo', 'zapateria', 'zapatero', 'zapatilla', 'zapato',
  'zoologico', 'zorro'
];

const buildCorpus = () => {
  const dictionary = new Map();

  // 1. Agregar las señas prioritarias universitarias
  prioritySigns.forEach(sign => {
    dictionary.set(sign.termino.toLowerCase(), sign);
  });

  // 2. Agregar los términos oficiales de los dos tomos LSCh
  officialLSchVocab.forEach(term => {
    const cleanTerm = term.toLowerCase().trim();
    if (!dictionary.has(cleanTerm)) {
      const sanitizedId = cleanTerm.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      dictionary.set(cleanTerm, {
        termino: cleanTerm,
        glosa_id: `GL_${sanitizedId}`,
        variantes: [cleanTerm],
        categoria: 'general',
        tipo_recurso: 'dactilologia',
        archivo_asset: null
      });
    }
  });

  return Array.from(dictionary.values());
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Vaciando colección anterior de glosas...');
    await Gloss.deleteMany({});

    const corpus = buildCorpus();
    console.log(`Corpus oficial preparado: ${corpus.length} términos de LSCh (MINEDUC/UMCE).`);

    console.log('Cargando registros en MongoDB...');
    const result = await Gloss.insertMany(corpus);
    console.log(`Carga completada exitosamente. Total documentos insertados: ${result.length}`);

  const directCount = await Gloss.countDocuments({ tipo_recurso: { $in: ['lottie', 'gif'] } });
    const dactilologyCount = await Gloss.countDocuments({ tipo_recurso: 'dactilologia' });
    console.log(`- Señas núcleo con recurso visual directo: ${directCount}`);
    console.log(`- Señas oficiales con derivación dactilológica: ${dactilologyCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error durante la carga del diccionario:', error);
    process.exit(1);
  }
};

seedDatabase();