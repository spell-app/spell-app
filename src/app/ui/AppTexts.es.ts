/**
 * The editor's texts in Spanish (epic `spanish` P13):  `APP_TEXTS`' every key, and the web components' own.
 * - A LAZY chunk:  `AppTexts.load()` imports it only when the page's language is Spanish,
 *   so an English page never downloads a word of it.
 * - "Personas", never "usuarios" (WWOD §3 › "People", never "users").
 * - A first draft, for a native speaker to review, as Spell UI's Spanish is.
 * - Each language words a sentence its own way:
 *   Spanish names a project group with its article (`{theType}`, `la guía`) where English says `{Type}`,
 *   so the noun's gender never has to agree with a word around it.
 */

import type { AppLanguagePack, AppTextPack } from "spell-app/app/ui/AppTexts"
import { spellAppEs } from "spell-app/app/components/spell-app/SpellApp.es"
import { spellEditorEs } from "spell-app/app/components/spell-editor/SpellEditor.es"

/** The editor's own texts, in Spanish. */
const APP_TEXTS_ES: AppTextPack = {
  ////////////////
  // ## Actions
  ////////////////

  editApp: "Editar {type}",
  preview: "Ejecutar",
  settings: "Ajustes",
  openOrCreate: "Abrir o crear...",
  help: "Ayuda",
  you: "Tú",
  createApp: "Crear {type}",
  duplicateApp: "Duplicar {type}",
  renameApp: "Renombrar {type}",
  deleteApp: "Borrar {type}",
  restart: "Reiniciar",
  runMode: "Ejecutar",
  editMode: "Editar",
  debugMode: "Depurar",
  showLineNumbers: "Mostrar los números de línea",
  resetApp: "Restablecer {theType}",
  runTests: "Ejecutar las pruebas",
  newProject: "Proyecto nuevo",
  newExample: "Ejemplo nuevo",
  newGuide: "Guía nueva",
  newFile: "Archivo nuevo",
  duplicateFile: "Duplicar archivo",
  renameFile: "Renombrar archivo",
  deleteFile: "Borrar archivo",
  save: "Guardar",
  reload: "Recargar",
  clearConsole: "Limpiar la consola",
  alert: "Aviso",
  confirm: "Confirmar",
  prompt: "Preguntar",
  promptNumber: "Pedir un número",
  choose: "Elegir",
  cancel: "Cancelar",

  ////////////////
  // ## The editor's panes
  ////////////////

  appMenu: "Aplicación",
  javascriptOutput: "Salida en JavaScript",
  programOutput: "Salida del programa",
  spellTree: "Árbol de spell",
  spellTreeHint: "Pon el cursor en una línea para ver su árbol de spell.",
  outputTab: "Salida del programa",
  typescriptTab: "TypeScript",
  pythonTab: "Python",
  closeProgram: "Cerrar el panel del programa",
  thingsTab: "Cosas",
  typesTab: "Tipos",
  javascriptTab: "JavaScript",
  treeTab: "Árbol de la frase",
  loadingEditor: "Cargando el editor…",
  errorContext: "Contexto:",
  errorParams: "Parámetros:",
  error: "Error",

  consoleCompiling: "Compilando",
  consoleCompiledTo: "Compilado a JavaScript:",
  consoleExecuting: "Ejecutando {theType}",
  consoleFailed: "{Type}:  falló con un error:",
  consoleExecuted: "{Type}:  se ejecutó sin errores.",
  testResults: "Pruebas:  {passed} pasaron, {failed} fallaron",
  noTests: "No hay pruebas:  escribe una como `para probar <algo>:`",

  ////////////////
  // ## The project chooser
  ////////////////

  welcome: "¡Te damos la bienvenida a Spell!",
  openGroup: "Abrir {type}",
  createNewProject: "Crear un proyecto nuevo",
  createNewExample: "Crear un ejemplo nuevo",
  createNewGuide: "Crear una guía nueva",
  loadingGroup: "Cargando...",
  couldNotLoadGroup: "No se pudo cargar:  {title}",
  nothingInGroup: "¡Aún no hay {titleLower}!",

  ////////////////
  // ## La página de inicio, y la barra superior del editor
  ////////////////

  appName: "Spell",
  homeEyebrow: "Spell, en vista previa",
  homeTitle: "Escribe una app en una frase.",
  homeTagline: "Palabras sencillas.  Una app que funciona.",
  homeIntro:
    "Spell es un lenguaje de programación que se puede leer en voz alta.  Abre un ejemplo, cambia una frase y mira cómo cambia la app a su lado.",
  tryAnExample: "Prueba un ejemplo",
  readFirstSpell: "Lee tu primer spell",
  homeQuoteTitle: "De la Lista de tareas",
  homeQuote:
    'Una "tarea" es una cosa donde:\nsu "título" es texto,\nsu "hecha" es sí o no,\ny "está hecha" si su hecha es sí.',
  homeQuoteNote: "Cuatro líneas, una lista que funciona.",
  homeExamplesLine: "Abre uno, cámbialo, hazlo tuyo.",
  homeGuidesLine: "Tu idea, a tu ritmo.",
  homeProjectsLine: "Lo que has hecho, y por dónde empezar lo siguiente.",
  homeFixturesLine: "Los proyectos congelados con los que corren las pruebas.",
  homeNoGuides: "Las guías están en camino.",

  ////////////////
  // ## Project groups
  ////////////////

  "type.project": "proyecto",
  "Type.project": "Proyecto",
  "theType.project": "el proyecto",
  "title.project": "Proyectos",
  "description.project": "Tus propios proyectos",
  "type.example": "ejemplo",
  "Type.example": "Ejemplo",
  "theType.example": "el ejemplo",
  "title.example": "Ejemplos",
  "description.example": "Proyectos de ejemplo",
  "type.guide": "guía",
  "Type.guide": "Guía",
  "theType.guide": "la guía",
  "title.guide": "Guías",
  "description.guide": "Guías de uso",
  "type.library": "biblioteca",
  "Type.library": "Biblioteca",
  "theType.library": "la biblioteca",
  "title.library": "Bibliotecas",
  "description.library":
    "Bibliotecas que importan otros proyectos, p. ej. `@spell/library/people` en un archivo de proyecto",
  "type.fixture": "proyecto de prueba",
  "Type.fixture": "Proyecto de prueba",
  "theType.fixture": "el proyecto de prueba",
  "title.fixture": "Proyectos de prueba",
  "description.fixture":
    "Proyectos congelados contra los que corren las pruebas:  edita uno, y luego `yarn spell:test:fixtures:bless`",

  ////////////////
  // ## Notices and errors
  ////////////////

  pathInvalid: "¡La ruta '{path}' no es válida!",
  createdApp: "Se creó {theType} {name}.",
  duplicatedApp: "Se duplicó {theType}.",
  renamedApp: "Se renombró {theType}.",
  removedApp: "Se borró {theType}.",
  resetAppConfirm: "¿Olvidar tus cambios en {theType} y mostrarlo como era?",
  fileCreated: "Se creó el archivo.",
  fileDuplicated: "Se duplicó el archivo.",
  fileRenamed: "Se renombró el archivo.",
  fileRemoved: "Se borró el archivo.",
  noTypesYet: "{Type} {name}:  aún no tiene tipos;  compila primero.",
  noSuchType: "{Type} {name}:  no tiene el tipo `{typeName}`.",
  propertyEditorHeader: "Editor de propiedades nuevo",
  propertyEditorMessage: "¿Para qué tipo hacemos un editor de propiedades?",
  create: "Crear",

  ////////////////
  // ## The Type Explorer
  ////////////////

  scopes: "Ámbitos",
  refreshScopes: "Actualizar los ámbitos",
  runToSeeScopes: "Ejecuta el proyecto para ver sus ámbitos.",
  details: "Detalles",
  orderDocument: "En el orden del documento, bajo sus encabezados",
  orderAlphabetical: "En orden alfabético",
  loading: "Cargando…",
  members: "Miembros",
  spell: "Spell",
  showWhereDefined: "Mostrar dónde se define",
  rules: "Reglas",
  compiledOutput: "Salida compilada",
  clickToEdit: "Haz clic para editar",
  addDescription: "Añade una descripción…",
  "members.Types": "Tipos",
  "members.Properties": "Propiedades",
  "members.Actions": "Acciones",
  "members.Constants": "Constantes",
  "members.Functions": "Funciones",
  "members.Variables": "Variables",

  ////////////////
  // ## The Thing Explorer
  ////////////////

  things: "Cosas",
  runToSeeThings: "Ejecuta el proyecto para ver sus cosas.",
  topLevel: "Nivel superior",
  allThings: "Todas las cosas",
  selectThing: "Elige una cosa para ver sus propiedades.",
  properties: "Propiedades",
  actions: "Acciones",
  empty: "vacío",
  list: "lista",
  thing: "cosa",
  computed: "calculada",
  action: "acción",
  listOf: "{type} de {count}",
  doIt: "Hazlo:  {action}()",
  thingsInOrderMade: "En el orden en que se crearon",
  thingsByType: "Por tipo, con sus subtipos",

  ////////////////
  // ## The runners
  ////////////////

  typeExplorer: "Explorador de tipos",
  thingExplorer: "Explorador de cosas",
  console: "Consola",
  debug: "Depurar",
  showConsole: "Mostrar la consola",
  hideConsole: "Ocultar la consola",

  ////////////////
  // ## `<spell-editor>`'s pane
  ////////////////

  editedSinceSaved: "Editado desde que se guardó",
  editorKeys: "⌘S guardar · ⌘↵ ejecutar",
  compiling: "Compilando…",
  compiled: "Compilado",
  saved: "Guardado",
  parseError: "{count} error de análisis -- no se ejecuta",
  parseErrors: "{count} errores de análisis -- no se ejecuta",
  compileAndRun: "Compilar y ejecutar",

  ////////////////
  // ## The "You" panel
  ////////////////

  youHeader: "Tú:  {address}",
  fileProblems: "Tu archivo tiene problemas:  se leyó de todos modos",
  names: "Nombres",
  nickname: "Apodo",
  emails: "Correos, uno por línea",
  dates: "Fechas",
  dateWhat: "Qué",
  dateDay: "Día",
  dateRemove: "Quitar",
  datePlaceholder: "cumpleaños",
  addDate: "Añadir una fecha",
  yourOrgs: "Tus organizaciones",
  noneYet: "Ninguna todavía.",

  ////////////////
  // ## A project's settings
  ////////////////

  projectSettings: "Ajustes de {title}",
  titleHint: "El nombre de su carpeta, en palabras, si se deja vacío.",
  titleTip: "El nombre del proyecto para las personas, en la lista de proyectos y en la barra de título del editor.",
  versionTip: "Su versión, como `1.2.0`:  se marca en lo que declara, para los proyectos que lo importan.",
  targetsLabel: "También compila a",
  targetsTip: "Lenguajes a los que compila además de JavaScript, al que compila siempre.",
  listsStartAtLabel: "Las listas empiezan en",
  listsStartAtTip: "Dónde empiezan a contar sus listas:  en 1, como spell, o en 0, como JavaScript y Python."
}

/** Everything Spanish the app shows:  its own texts, then each web component's. */
export const appTextsEs: AppLanguagePack = {
  lang: "es",
  texts: APP_TEXTS_ES,
  tags: [spellAppEs, spellEditorEs]
}
