/*! SPELL: WORDS Solitario es */
export const words = {
  lang: "es",
  types: {
    Carta: {
      rango: "rango",
      valor: "valor",
      esUnRango: "es un (rango)",
      esUnaFigura: "es una figura",
      esUnaCartaNumérica: "es una carta numérica",
      palo: "palo",
      esUnPalo: "es un (palo)",
      color: "color",
      nombre: "nombre",
      esElRangoDePalo: "es el (rango) de (palo)",
      dirección: "dirección",
      estáBocaDirección: "está boca (dirección)",
      voltearBocaArriba: "voltearla boca arriba",
      voltearBocaAbajo: "voltearla boca abajo",
      voltear: "voltearla",
      imagen: "imagen",
      símbolo: "símbolo",
      estado: "estado",
      jugar: "jugar una carta",
      pila: "pila"
    },
    Comodín: {
      color: "color",
      esElComodínColor: "es el comodín (color)",
      valor: "valor",
      imagen: "imagen",
      nombre: "nombre",
      estado: "estado"
    },
    Mazo: {
      comodines: "comodines",
      create: "crearlo",
      estado: "estado"
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
      create: "crearlo",
      depurar: "depurarlo",
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
