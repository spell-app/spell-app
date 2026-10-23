/*! SPELL: WORDS Solitario es */
export const words = {
  lang: "es",
  types: {
    Carta: {
      palo: "palo",
      rango: "rango",
      color: "color",
      valor: "valor",
      esUnPalo: "es un (palo)",
      esUnRango: "es un (rango)",
      esElRangoDePalos: "es el (rango) de (palos)",
      esUnaFigura: "es una figura",
      esElComodínColor: "es el comodín (color como un color)",
      dirección: "dirección",
      estáBocaArriba: "está boca arriba",
      estáBocaAbajo: "está boca abajo",
      nombre: "nombre",
      paloCorto: "palo corto",
      rangoCorto: "rango corto",
      direcciónCorta: "dirección corta",
      nombreCorto: "nombre corto",
      estado: "estado",
      columnaDeImagen: "columna de imagen",
      imagen: "imagen",
      voltearBocaArriba: "voltear una carta boca arriba",
      voltearBocaAbajo: "voltear una carta boca abajo",
      darVuelta: "dar vuelta una carta",
      jugar: "jugar una carta",
      pila: "pila"
    },
    Comodín: {
      color: "color",
      nombre: "nombre",
      nombreCorto: "nombre corto",
      estado: "estado",
      imagen: "imagen"
    },
    Palo: {
      color: "color",
      símbolo: "símbolo"
    },
    Rango: {
      esUnaFigura: "es una figura"
    },
    Mazo: {
      comodines: "comodines",
      preparar: "preparar",
      mostrar: "mostrar"
    },
    Pila: {
      name: "nombre",
      color: "color",
      valor: "valor",
      estado: "estado"
    },
    Fundación: {
      palo: "palo"
    },
    Solitario: {
      puntuación: "puntuación",
      mazo: "mazo",
      reserva: "reserva",
      descartes: "descartes",
      tréboles: "tréboles",
      diamantes: "diamantes",
      corazones: "corazones",
      espadas: "espadas",
      C1: "C1",
      C2: "C2",
      C3: "C3",
      C4: "C4",
      C5: "C5",
      C6: "C6",
      C7: "C7",
      preparar: "preparar",
      depurar: "depurar",
      rehacerLaReserva: "rehacer la reserva",
      robarDeLaReserva: "robar de la reserva",
      repartirLasCartas: "repartir las cartas",
      empezarElJuego: "empezar el juego",
      hacerTrampa: "hacer trampa",
      jugarSolo: "jugar solo"
    }
  },
  messages: {
    "expect-passed": "Como se esperaba, {what} es {expected}",
    "expect-failed": "Inesperado: {what} debería ser {expected} pero en realidad es {actual}",
    "expect-truthy": "verdadero",
    "test-step": "▶️ Ejecutando   {step}",
    "test-threw": "Error en la prueba {test}:",
    "cant-draw": "⚠ {type} no se puede dibujar",
    "confirm-default": "{question} (sí)"
  }
}
