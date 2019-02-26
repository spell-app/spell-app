
// -- a Card is a Thing
export class Card extends Thing {}

//
//  ## Face up / Face down
//

// -- cards have a face as either up or down
Card.Faces = { up: "up", down: "down" };
// (adds `card faces` to list of known identifiers as `Card.Faces`)
// (adds `up` and `down` to list of known identifiers as `Card.Faces.up` and `Card.Faces.down`)
defineProp(Card.prototype, "faces", { value: Card.Faces });

Card.get_face = function(card) {
  Card.assertType(card, Card)                   // (make sure we're the right type)
  return card.props.face || Card.Faces.up;      // (assume the first value is the default)
}
Card.set_face = function(card, face) {
  Card.assertType(card, Card)                         // (make sure we're the right type)
  Card.assertSetEnumType(card, "face", Card.Faces);   // (make sure value is recognized)
  card.props.face = face                              // (assume `props.x` is how we actually get values)
}
defineProp(Card.prototype, "face", {
  get() { return Card.get_face(this) }
  set(face) { return Card.set_face(this, face) }
});

// -- a card is face up if its face is up
// -- a card is face down if its face is down
Card.card_is_face_up = function(card) {
  return Card.get_face(card) === Card.Faces.up
}
defineProp(Card.protoype, "is_face_up", { get() { Card.card_is_face_up(this) } });
// (...repeat for `card_is_face_down`)

// -- to turn a card face up: set its face to up
// -- to turn a card face down: set its face to down
Card.turn_card_face_up = function(card) {
  Card.set_face(card, Card.Faces.up);
}
defineProp(Card.prototype, "turn_face_up", { value: function() { Card.turn_card_face_up(this) } });
// (...repeat for `turn_card_face_down`)

// -- to flip a card over
// --   if it is face up turn it face down
// --   otherwise turn it face up
Card.flip_card_over = function(card) {
  if (Card.card_is_face_up(card))
    Card.turn_card_face_up(card);
  else
    Card.turn_card_face_down(card);
}
defineProp(Card.prototype, "flip_over", { value: function() { Card.flip_card_overt(this) } });

//
//  ## Ranks
//

// -- cards have a suit as one of clubs, diamonds, hearts, spades
Card.Suits = {...}
// (...continue as for Card.Faces above)

// -- a card is a {suit} if its suit is {suit}
// (note: we somehow infer that `suit` needs to be singular because of `a` ?)
Card.card_is_a_suit = function(card, suit) {
  return Card.get_suit(card) === suit;
}
// (rule `a card is not a suit` is generated automatically)
Card.card_is_not_a_suit = function(card, suit) {
  return !Card.card_is_a_suit(card, suit);
}


//
//  ## Colors
//

// -- the color of a card is red if its suit is either diamonds or hearts, otherwise it is black
Card.Colors = { red: "red", black: "black" };
// TODO: (how do we determine need to make these constants?)
Card.get_color(card) {
  const suit = Card.get_suit(card);
  if ([Card.Suits.diamonds, Card.Suits.clubs].includes(suit))
    return Card.Colors.red;
  return Card.Colors.red
}

// -- a card is {color} if its color is {color}
// (...continue as for `card_is_a_suit`.  Automatically does `card is not a {color}`)

//
//  ## Ranks
//

// -- cards have a rank as one of ace, 2, 3, 4, 5, 6, 7, 8, 9, 10, jack, queen, king
Card.Ranks = { ace: "ace", "2": 2... }
// (...continue as for Card.Faces above)

// -- the value of a card is the number of its rank in the card ranks
Card.get_value(card) {
  const ranks = Card.Ranks;
  const rank = Card.get_rank(card);
  return spell.indexOf(ranks, rank);
}
defineProp(Card.prototype, "value", { value() { Card.get_value(this) } });

// -- a card is a face card if its rank is one of jack, queen or king
// (... as per `card_is_face_up`.  Automatically does `card is not a face card`)

// -- a card is a {rank} if its rank is {rank}
// (... as per `card_is_a_suit`.  Automatically does `card is not a {rank}`)

// -- a card is the {rank} of {suit} if its rank is {rank} and its suit is {suit}
// (... as per `card_is_a_suit`.  Automatically does `card is not the {rank} of {suit}`)

// -- a card is a {color} {rank} if its color is {color} and its rank is {rank}
// (... as per `card_is_a_suit`.  Automatically does `card is not a {color} {rank}`)

