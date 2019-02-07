webpackJsonp([0],{

/***/ 107:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.isWhitespace = isWhitespace;
exports.pluralize = pluralize;
exports.isPlural = isPlural;
exports.singularize = singularize;
exports.isSingular = isSingular;
exports.getTabs = getTabs;

var _global = __webpack_require__(162);

var _global2 = _interopRequireDefault(_global);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Return true if text is all whitespace, including empty string.
var ALL_WHITESPACE = /^\s*$/;
function isWhitespace(text) {
	return ALL_WHITESPACE.test(text);
}

// Return the plural of `word`.
// NOTE: this is not very good at all!!!
// TODO: exceptions, etc.
function pluralize(word) {
	return word + "s";
}

// Return true if word is a plural.
// NOTE: for words which are BOTH singular and plural, this will return true.
function isPlural(word) {
	return word === pluralize(word);
}

// Return the singular of `word`.
// NOTE: this is not very good at all!!!
// TODO: exceptions, etc.
function singularize(word) {
	return word.replace(/e?s$/, "");
}

// Return true if word is a singular.
// NOTE: for words which are BOTH singular and plural, this will return true.
function isSingular(word) {
	return word === singularize(word);
}

// Return a certain `number` of tab characters.
var TABS = "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t";
function getTabs(number) {
	if (typeof number !== "number") return "";
	return TABS.substr(0, number);
}

// Export all as a lump
var allExports = _extends({}, exports);
exports.default = allExports;

// DEBUG: put on global for debugging.

_global2.default.STRING = allExports;

/***/ }),

/***/ 114:
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(92);
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),

/***/ 115:
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),

/***/ 148:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return modifiers; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return ALL_KEYS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return ALL_PRINTABLE_KEYS; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_core_js_es6_symbol__ = __webpack_require__(502);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_core_js_es6_symbol___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_core_js_es6_symbol__);


// TODO: Need better, more complete, and more methodical key definitions

var Keys = {
  backspace: 8,
  del: 46,
  delete: 46,
  tab: 9,
  enter: 13,
  'return': 13,
  esc: 27,
  space: 32,
  pageUp: 33,
  pageDown: 34,
  end: 35,
  home: 36,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '`': 192,
  '[': 219,
  '\\': 220,
  ']': 221
};

// Add uppercase versions of keys above for backwards compatibility
Object.keys(Keys).forEach(function (key) {
  return Keys[key.toUpperCase()] = Keys[key];
});

'0123456789'.split('').forEach(function (num, index) {
  return Keys[num] = index + 48;
});

'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (letter, index) {
  Keys[letter] = index + 65;
  Keys[letter.toLowerCase()] = index + 65;
});

// fn keys
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(function (item, index) {
  return Keys['f' + index] = 111 + index;
});

var modifiers = {
  control: 'ctrl',
  ctrl: 'ctrl',
  shift: 'shift',
  meta: 'meta',
  cmd: 'meta',
  command: 'meta',
  option: 'alt',
  alt: 'alt'
};

var ALL_KEYS = Symbol('ALL_KEYS');

var ALL_PRINTABLE_KEYS = Symbol('ALL_PRINTABLE_KEYS');

/* harmony default export */ __webpack_exports__["a"] = (Keys);

/***/ }),

/***/ 149:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export _resetStore */
/* harmony export (immutable) */ __webpack_exports__["c"] = activate;
/* harmony export (immutable) */ __webpack_exports__["f"] = deleteInstance;
/* harmony export (immutable) */ __webpack_exports__["e"] = findBindingForEvent;
/* harmony export (immutable) */ __webpack_exports__["b"] = getBinding;
/* harmony export (immutable) */ __webpack_exports__["d"] = getInstances;
/* harmony export (immutable) */ __webpack_exports__["g"] = isEmpty;
/* harmony export (immutable) */ __webpack_exports__["a"] = setBinding;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lib_match_keys__ = __webpack_require__(382);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lib_parse_keys__ = __webpack_require__(383);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__lib_uuid__ = __webpack_require__(849);
var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * @module store
 *
 */




/**
 * private
 *
 */

// dict for class prototypes => bindings
var _handlers = new Map();

// all mounted instances that have keybindings
var _instances = new Set();

// for testing
function _resetStore() {
  _handlers.clear();
  _instances.clear();
}

/**
 * activate
 *
 * @access public
 * @param {object} instance Instantiated class that extended React.Component, to be focused to receive keydown events
 */
function activate(instances) {
  var instancesArray = [].concat(instances);

  // if no components were found as ancestors of the event target,
  // effectively deactivate keydown handling by capping the set of instances
  // with `null`.
  if (!instancesArray.length) {
    _instances.add(null);
  } else {
    _instances.delete(null);

    // deleting and then adding the instance(s) has the effect of sorting the set
    // according to instance activation (ascending)
    instancesArray.forEach(function (instance) {
      _instances.delete(instance);
      _instances.add(instance);
    });
  }
};

/**
 * deleteInstance
 *
 * @access public
 * @param {object} target Instantiated class that extended React.Component
 * @return {boolean} The value set.has( target ) would have returned prior to deletion
 */
function deleteInstance(target) {
  _instances.delete(target);
};

function findBindingForEvent(event) {
  if (!_instances.has(null)) {
    var keyMatchesEvent = function keyMatchesEvent(keySet) {
      return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__lib_match_keys__["a" /* default */])({ keySet: keySet, event: event });
    };

    // loop through instances in reverse activation order so that most
    // recently activated instance gets first dibs on event
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = [].concat(_toConsumableArray(_instances)).reverse()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var instance = _step.value;

        var bindings = getBinding(instance.constructor.prototype);
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = bindings[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _step2$value = _slicedToArray(_step2.value, 2),
                keySets = _step2$value[0],
                fn = _step2$value[1];

            if (keySets.some(keyMatchesEvent)) {
              // return when matching keybinding is found - i.e. only one
              // keybound component can respond to a given key code. to get around this,
              // scope a common ancestor component class with @keydown and use
              // @keydownScoped to bind the duplicate keys in your child components
              // (or just inspect nextProps.keydown.event).
              return { fn: fn, instance: instance };
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
  return null;
};

/**
 * getBinding
 *
 * @access public
 * @param {object} target Class used as key in dict of key bindings
 * @return {object} The object containing bindings for the given class
 */
function getBinding(_ref) {
  var __reactKeydownUUID = _ref.__reactKeydownUUID;

  return _handlers.get(__reactKeydownUUID);
};

/**
 * getInstances
 *
 * @access public
 * @return {set} All stored instances (all mounted component instances with keybindings)
 */
function getInstances() {
  return _instances;
};

/**
 * isEmpty
 *
 * @access public
 * @return {number} Size of the set of all stored instances
 */
function isEmpty() {
  return !_instances.size;
};

/**
 * setBinding
 *
 * @access public
 * @param {object} args All arguments necessary to set the binding
 * @param {array} args.keys Key codes that should trigger the fn
 * @param {function} args.fn The callback to be triggered when given keys are pressed
 * @param {object} args.target The decorated class
 */
function setBinding(_ref2) {
  var keys = _ref2.keys,
      fn = _ref2.fn,
      target = _ref2.target;

  var keySets = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__lib_parse_keys__["a" /* default */])(keys);

  var __reactKeydownUUID = target.__reactKeydownUUID;

  if (!__reactKeydownUUID) {
    target.__reactKeydownUUID = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__lib_uuid__["a" /* default */])();
    _handlers.set(target.__reactKeydownUUID, new Map([[keySets, fn]]));
  } else {
    _handlers.get(__reactKeydownUUID).set(keySets, fn);
  }
};

/***/ }),

/***/ 162:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

Object.defineProperty(exports, "__esModule", {
	value: true
});
// Make sure `global` is defined globally:
//	- either as the nodejs `global`, or
//	- as an alias for `window` in browsers, or
//	- for the `self` context in web workers.
//
// NOTE: this modifies the "global" environment by making sure "global" is set.!
//

var global_identifier = void 0;
if (typeof global !== "undefined") {
	//	console.log("Running in node");
	global_identifier = global;
}

if (typeof window !== "undefined") {
	//	console.log("Running in a web browser");
	window.global = window;
	global_identifier = window;
}

if (typeof self !== "undefined") {
	//	console.log("Running in a web worker");
	self.global = self;
	global_identifier = self;
}

// Export for consumption by import.
exports.default = global_identifier;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(262)))

/***/ }),

/***/ 179:
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),

/***/ 180:
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),

/***/ 181:
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(74);
var createDesc = __webpack_require__(185);
module.exports = __webpack_require__(72) ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ 182:
/***/ (function(module, exports) {

module.exports = false;


/***/ }),

/***/ 183:
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(283);
var enumBugKeys = __webpack_require__(180);

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),

/***/ 184:
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ }),

/***/ 185:
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ 186:
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(48);
var hide = __webpack_require__(181);
var has = __webpack_require__(73);
var SRC = __webpack_require__(94)('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

__webpack_require__(91).inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});


/***/ }),

/***/ 187:
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__(91);
var global = __webpack_require__(48);
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__(182) ? 'pure' : 'global',
  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
});


/***/ }),

/***/ 188:
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(92);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ 279:
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(92);
var document = __webpack_require__(48).document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),

/***/ 280:
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(72) && !__webpack_require__(115)(function () {
  return Object.defineProperty(__webpack_require__(279)('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ 281:
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = __webpack_require__(283);
var hiddenKeys = __webpack_require__(180).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};


/***/ }),

/***/ 282:
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),

/***/ 283:
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(73);
var toIObject = __webpack_require__(93);
var arrayIndexOf = __webpack_require__(548)(false);
var IE_PROTO = __webpack_require__(284)('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),

/***/ 284:
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(187)('keys');
var uid = __webpack_require__(94);
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),

/***/ 285:
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),

/***/ 286:
/***/ (function(module, exports, __webpack_require__) {

exports.f = __webpack_require__(95);


/***/ }),

/***/ 287:
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),

/***/ 31:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp; // Spell "parser" class.
//

// TODO: dependency-inject tokenizer?


var _Tokenizer = __webpack_require__(89);

var _Tokenizer2 = _interopRequireDefault(_Tokenizer);

var _Rule = __webpack_require__(87);

var _Rule2 = _interopRequireDefault(_Rule);

var _RuleSyntax = __webpack_require__(88);

var _RuleSyntax2 = _interopRequireDefault(_RuleSyntax);

var _class2 = __webpack_require__(947);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// GRRR... will SOMEONE on the node team please implement console.group ???
if (!console.group) console.group = console.log;
if (!console.groupEnd) console.groupEnd = console.log;

var Parser = (_temp = _class = function () {

	// Constructor.


	// Should we warn about anomalous conditions?
	function Parser(properties) {
		_classCallCheck(this, Parser);

		this.imports = [];
		this._rules = {};

		Object.assign(this, properties);
	}

	//
	//### Parsing
	//
	// Parse `ruleName` rule at head of `text`.
	// If you pass only one argument, we'll assume that's `text` and you want to match `statements`.
	// Handles optional and repeating rules as well as eating whitespace.
	// Returns result of parse.
	//TESTME


	// Set to `true` to output timing info.

	// Set to `true` to output debug info while adding rules


	_createClass(Parser, [{
		key: "parse",
		value: function parse(ruleName, text) {
			// If only one argument, assume that's the text and parse `statements`
			if (arguments.length === 1) {
				text = ruleName;
				ruleName = "statements";
			}

			// Convert to tokens.
			if (Parser.TIME) console.time("tokenize");
			var tokens = _Tokenizer2.default.tokenize(text);
			// eat non-indent whitespace (since we ignore it)
			tokens = tokens.filter(function (token) {
				return !_Tokenizer2.default.isNormalWhitespace(token);
			});
			if (Parser.TIME) console.timeEnd("tokenize");

			// Bail if we didn't get any tokens back.
			if (!tokens || tokens.length === 0) return undefined;

			if (Parser.TIME) console.time("parse");
			// If we're not parsing `statements`, eat whitespace at the beginning of the line.
			if (ruleName !== "statements") {
				tokens = _Tokenizer2.default.removeLeadingWhitespace(tokens);
			}

			// Parse the rule or throw an exception if rule not found.
			var result = this.parseNamedRule(ruleName, tokens, 0, tokens.length, undefined, "parser.parse()");
			if (Parser.TIME) console.timeEnd("parse");
			return result;
		}

		// Parse `text` and return the resulting source code.
		//	- if one string argument, compiles as "statements"
		// Throws if not parseable.
		//TESTME

	}, {
		key: "compile",
		value: function compile(ruleName, text) {
			// If only one argument, assume that's the text and parse `statements`
			if (arguments.length === 1) {
				text = ruleName;
				ruleName = "statements";
			}
			var result = this.parse(ruleName, text);
			if (!result) throw new SyntaxError("parser.parse('" + ruleName + "', '" + text + "'): can't parse this");
			return result.toSource(this);
		}

		// Parse a named rule (defined in this parser or in any of our `imports`), returning the "best" match.
		// Returns `undefined` if no match.
		// Throws if rule is not implemented.

	}, {
		key: "parseNamedRule",
		value: function parseNamedRule(ruleName, tokens, start, end, stack) {
			var callingContext = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : "parseNamedRule";

			var rule = this.rules[ruleName];
			if (!rule) throw new SyntaxError(callingContext + ": rule '" + ruleName + "' not found");
			return rule.parse(this, tokens, start, end, stack);
		}

		// Test whether a rule (which may be specified by name) MIGHT be found in head of stream.
		// Returns:
		//	- `true` if the rule MIGHT be matched.
		//	- `false` if there is NO WAY the rule can be matched.
		//	- `undefined` if not determinstic (eg: no way to tell quickly).

	}, {
		key: "test",
		value: function test(rule, tokens, start, end) {
			if (typeof rule === "string") {
				rule = this.rules[rule];
				if (!rule) return undefined; // TODO: throw?
			}
			return rule.test(this, tokens, start, end);
		}

		//
		// ### 	Imports
		//		Parsers can depend on other parsers for additional `rules`.
		//		Imports are lazy-bound into `parser.rules` as necessary.
		//    We assume the top-level parser for a language will include all necessary imports automatically.
		//

		// Add one or more named imports to this parser.
		// Imports increase in priority the later they are in the list.

	}, {
		key: "import",
		value: function _import() {
			for (var _len = arguments.length, imports = Array(_len), _key = 0; _key < _len; _key++) {
				imports[_key] = arguments[_key];
			}

			// REVERSE the list of imports, so the most general one is LAST
			// Thus more specific imports will be EARLIER in the `imports` list.

			// Create new array of imports and add import names passed in.
			this.imports = imports.reverse().concat(this.imports);

			// clear concatenated list of rules so we'll recaculate in `parser.rules`
			delete this.__rules;
		}

		//
		// ### Rules
		//    List of all known rules for this parser.
		//    You can access named rules as `parser.rules["ruleName"]`
		//
		// Start with an empty map of rules.

	}, {
		key: "_mergeRule",


		// Merge `rule` into `map` of rules by `ruleName`.
		// If we already have a rule with that name, we'll add it as an alternative.
		//TESTME
		value: function _mergeRule(map, ruleName, rule) {
			var existing = map[ruleName];
			if (!existing) {
				map[ruleName] = rule;
				return;
			}

			if (!(existing instanceof _Rule2.default.Alternatives) || existing.group !== ruleName) {
				var altConstructor = (0, _class2.cloneClass)(_Rule2.default.Alternatives, ruleName);
				existing = map[ruleName] = new altConstructor({
					group: ruleName,
					rules: [existing]
				});
			}

			if (rule instanceof _Rule2.default.Alternatives && rule.group === ruleName) {
				var _existing;

				(_existing = existing).addRule.apply(_existing, _toConsumableArray(rule.rules));
			} else {
				existing.addRule(rule);
			}
		}

		// Add a `rule` to our list of rules!
		// Converts to `alternatives` on re-defining the same rule.

	}, {
		key: "addRule",
		value: function addRule(ruleName, rule) {
			var _this = this;

			// Clear memoized `__rules` so we'll recalculate `parser.rules` as necessary
			delete this.__rules;

			// If passed a function, create an instance for the actual rule.
			// This is commonly done so JS will give us meaningful class names in debug output.
			if (typeof rule === "function") {
				rule = new rule();
			}

			// If we got an array of `ruleName`s, recursively add under each name with the same `rule`.
			if (Array.isArray(ruleName)) {
				ruleName.forEach(function (ruleName) {
					return _this.addRule(ruleName, rule);
				});
				return rule;
			}

			// Add to our list of _rules
			this._mergeRule(this._rules, ruleName, rule);
			return rule;
		}

		// Return the concatenated blacklist for a given named rule.

	}, {
		key: "getBlacklist",
		value: function getBlacklist(ruleName) {
			var rule = this.rules[ruleName];
			var rules = rule instanceof _Rule2.default.Alternatives ? rule.rules : [rule];
			return rules.reduce(function (blacklist, rule) {
				return Object.assign(blacklist, rule.blacklist);
			}, {});
		}

		// Define multiple rules at once using ruleSyntax.
		// See `RuleSyntax.js::defineRule()`

	}, {
		key: "defineRules",
		value: function defineRules() {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = arguments[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var rule = _step.value;

					this.defineRule(rule);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}

		// Define a rule using (rule)`syntax` or `patterns` to create the rule instances.
		//  `name` (identifier, required)  Base name of the rule.
		//  `alias` (string or [string], optinal) Other names to define rule under.
		//  `canonical` (string, optional) Canonical name for the rule, available on `Rule` for debugging.
		//  `constructor` (class, required) Class which will be used to instantiate the rule.
		//  `syntax` (string, required) RuleSyntax string for this rule.
		//  `pattern` (RegExp, optional) Regular expression for `Pattern` rules
		//  `precedence` (number, optional) Precedence number for the rule (currently doesn't do anything)
		//  `blacklist` ([string], optional) Array of strings as blacklist for pattern rules.
		//  `leftRecursive' (boolean, optional) Set to `true` if the rule is left-recursive,
		//    i.e. it calls itself as a subrule before matching any literal tokens
		//  `testRule` (Rule or string, optional) Rule or rule name to use as a test rule
		//    specifying this can let us jump out quickly if there is no possible match
		//
		// Note that we munge the `constructor` passed in for efficiency while parsing.

	}, {
		key: "defineRule",
		value: function defineRule(_ref) {
			var name = _ref.name,
			    constructor = _ref.constructor,
			    _ref$alias = _ref.alias,
			    alias = _ref$alias === undefined ? [] : _ref$alias,
			    canonical = _ref.canonical,
			    syntax = _ref.syntax,
			    blacklist = _ref.blacklist,
			    otherProps = _objectWithoutProperties(_ref, ["name", "constructor", "alias", "canonical", "syntax", "blacklist"]);

			var names = [name].concat(alias);

			// throw if we're re-using a constructor
			if (constructor.prototype.ruleNames) {
				throw new TypeError("parser.define(): Attempting to re-use constructor for rule '" + ruleName + "'");
			}

			// Set properties on prototype.constructor
			Object.defineProperty(constructor.prototype, "ruleNames", { value: names });
			if (canonical) _Rule2.default[canonical] = constructor;
			if (blacklist) {
				var map = {};
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = blacklist[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var key = _step2.value;
						map[key] = true;
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}

				Object.defineProperty(constructor.prototype, "blacklist", { value: map });
			}

			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = Object.keys(otherProps)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var _key2 = _step3.value;

					//console.info(name, key, otherProps[key]);
					Object.defineProperty(constructor.prototype, _key2, { value: otherProps[_key2] });
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			var rule = syntax ? (0, _RuleSyntax2.default)(syntax, constructor) : new constructor();

			this.addRule(names, rule);
		}

		//
		// ### Parser registry.
		//

	}, {
		key: "rules",


		// Return map of all known rules by rule name, including rules defined in our imports.
		// NOTE: We memoize this, so make sure to clear `__rules` if you're manipulating rules or imports!
		get: function get() {
			var _this2 = this;

			if (!this.__rules) {
				var output = this.__rules = {};
				// Get all imported parsers, with us last
				var _imports = [this].concat(this.imports.map(Parser.forName));

				// For each parser
				_imports.forEach(function (parser) {
					for (var _ruleName in parser._rules) {
						_this2._mergeRule(output, _ruleName, parser._rules[_ruleName]);
					}
				});
			}
			return this.__rules;
		}
	}], [{
		key: "forName",


		// Get a parser for a given `contextName`.
		// Will re-use existing parser, or create a new one if not already defined.
		value: function forName(name) {
			if (!Parser.REGISTRY[name]) {
				Parser.REGISTRY[name] = new Parser({ name: name });
			}
			return Parser.REGISTRY[name];
		}

		//
		// ## Utility methods
		//

		// Find the matching instance of (possibly nested) `endToken` to balance `startToken`
		//	in array of `tokens` (strings).
		// If successful, returns `{ start, end, slice }`
		// Throws if unsucessful.

	}, {
		key: "findNestedTokens",
		value: function findNestedTokens(tokens, startToken, endToken) {
			var start = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

			if (tokens[start] !== startToken) throw new SyntaxError("Expected '" + startToken + "' at index " + start + " of tokens");
			var nesting = 0;
			var nested = false;
			for (var end = start + 1, lastIndex = tokens.length; end < lastIndex; end++) {
				var token = tokens[end];
				if (token === startToken) {
					nesting++;
					nested = true;
				}
				if (token === endToken) {
					if (nesting === 0) return { start: start, end: end, slice: tokens.slice(start + 1, end), nested: nested };
					nesting--;
				}
			}
			throw new SyntaxError("Couldn't find matching '" + endToken + "'s starting at item " + start);
		}
	}]);

	return Parser;
}(), _class.DEBUG = false, _class.WARN = false, _class.TIME = false, _class.REGISTRY = {}, _temp);
exports.default = Parser;

/***/ }),

/***/ 358:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

if (process.env.NODE_ENV !== 'production') {
  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
    Symbol.for &&
    Symbol.for('react.element')) ||
    0xeac7;

  var isValidElement = function(object) {
    return typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE;
  };

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = __webpack_require__(357)(isValidElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = __webpack_require__(770)();
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),

/***/ 381:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export _onClick */
/* harmony export (immutable) */ __webpack_exports__["c"] = _onKeyDown;
/* unused harmony export _shouldConsider */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return onMount; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return onUnmount; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lib_dom_helpers__ = __webpack_require__(847);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lib_listeners__ = __webpack_require__(848);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__store__ = __webpack_require__(149);
function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* eslint-disable no-use-before-define */
/**
 * @module eventHandlers
 *
 */




/**
 * private
 *
 */

/**
 * _onClick
 *
 * @access private
 * @param {object} event The click event object
 * @param {object} event.target The DOM node from the click event
 */
function _onClick(_ref) {
  var target = _ref.target;

  __WEBPACK_IMPORTED_MODULE_2__store__["c" /* activate */]([].concat(_toConsumableArray(__WEBPACK_IMPORTED_MODULE_2__store__["d" /* getInstances */]())).reduce(__WEBPACK_IMPORTED_MODULE_0__lib_dom_helpers__["a" /* default */].findContainerNodes(target), []).sort(__WEBPACK_IMPORTED_MODULE_0__lib_dom_helpers__["a" /* default */].sortByDOMPosition).map(function (item) {
    return item.instance;
  }));
}

/**
 * _onKeyDown: The keydown event callback
 *
 * @access private
 * @param {object} event The keydown event object
 * @param {number} event.which The key code (which) received from the keydown event
 */
function _onKeyDown(event) {
  var forceConsider = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  if (forceConsider || _shouldConsider(event)) {
    var _ref2 = __WEBPACK_IMPORTED_MODULE_2__store__["e" /* findBindingForEvent */](event) || {},
        fn = _ref2.fn,
        instance = _ref2.instance;

    if (fn) {
      fn.call(instance, event);
      return true;
    }
  }
  return false;
}

/**
 * _shouldConsider: Conditions for proceeding with key event handling
 *
 * @access private
 * @param {object} event The keydown event object
 * @param {object} event.target The node origin of the event
 * @return {boolean} Whether to continue procesing the keydown event
 */
function _shouldConsider(_ref3) {
  var ctrlKey = _ref3.ctrlKey,
      target = _ref3.target;

  return ctrlKey || !~['INPUT', 'SELECT', 'TEXTAREA'].indexOf(target.tagName) && (!target.getAttribute || target.getAttribute('role') !== 'textbox');
}

/**
 * public
 *
 */

/**
 * onMount
 *
 * @access public
 */
function onMount(instance) {
  __WEBPACK_IMPORTED_MODULE_2__store__["c" /* activate */](instance);
  __WEBPACK_IMPORTED_MODULE_1__lib_listeners__["a" /* default */].bindKeys(_onKeyDown);
  __WEBPACK_IMPORTED_MODULE_1__lib_listeners__["a" /* default */].bindClicks(_onClick);
  __WEBPACK_IMPORTED_MODULE_0__lib_dom_helpers__["a" /* default */].bindFocusables(instance, __WEBPACK_IMPORTED_MODULE_2__store__["c" /* activate */]);
}

/**
 * onUnmount
 *
 * @access public
 */
function onUnmount(instance) {
  __WEBPACK_IMPORTED_MODULE_2__store__["f" /* deleteInstance */](instance);
  if (__WEBPACK_IMPORTED_MODULE_2__store__["g" /* isEmpty */]()) {
    __WEBPACK_IMPORTED_MODULE_1__lib_listeners__["a" /* default */].unbindClicks(_onClick);
    __WEBPACK_IMPORTED_MODULE_1__lib_listeners__["a" /* default */].unbindKeys(_onKeyDown);
  }
}



/***/ }),

/***/ 382:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__keys__ = __webpack_require__(148);


var PRINTABLE_CHARACTERS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()-_+=[]\\{}|;\':",./<>?£';

var modKeys = Object.keys(__WEBPACK_IMPORTED_MODULE_0__keys__["d" /* modifiers */]);

function matchKeys(_ref) {
  var keySet = _ref.keySet,
      event = _ref.event;
  var key = keySet.key,
      _keySet$modifiers = keySet.modifiers,
      modifiers = _keySet$modifiers === undefined ? [] : _keySet$modifiers;

  var keysMatch = void 0;

  keysMatch = key === __WEBPACK_IMPORTED_MODULE_0__keys__["b" /* ALL_KEYS */];

  if (key === __WEBPACK_IMPORTED_MODULE_0__keys__["c" /* ALL_PRINTABLE_KEYS */]) {
    if (event.key) {
      // Modern browsers implement `key`, so if `key` is length 1, we have a match. e.g. 'a' for the
      // a key, or '2' for the 2 key. All other non-printable characters have names, e.g. 'Enter' or 'Backspace'.
      keysMatch = event.key.length === 1;
    } else {
      // For browsers that do no support `event.key`, we test against a list of characters
      var pressedChar = String.fromCharCode(event.charCode);
      keysMatch = PRINTABLE_CHARACTERS.indexOf(pressedChar) >= 0;
    }
  }

  if (key === event.which) {
    var evtModKeys = modKeys.filter(function (modKey) {
      return event[modKey + 'Key'];
    }).sort();
    keysMatch = modifiers.length === evtModKeys.length && modifiers.every(function (modKey, index) {
      return evtModKeys[index] === modKey;
    });
  }

  return keysMatch;
}

/* harmony default export */ __webpack_exports__["a"] = (matchKeys);

/***/ }),

/***/ 383:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__keys__ = __webpack_require__(148);


function parseKeys(keysArray) {
  return keysArray.map(function (key) {
    var keySet = { key: key };
    if (typeof key === 'string') {
      var keyString = key.toLowerCase().trim();
      var matches = keyString.split(/\s?\+\s?/);
      keySet = matches.length === 1 ? { key: __WEBPACK_IMPORTED_MODULE_0__keys__["a" /* default */][keyString] } : {
        key: __WEBPACK_IMPORTED_MODULE_0__keys__["a" /* default */][matches.pop()],
        modifiers: matches.map(function (modKey) {
          return __WEBPACK_IMPORTED_MODULE_0__keys__["d" /* modifiers */][modKey];
        }).sort()
      };
    }
    return keySet;
  });
}

/* harmony default export */ __webpack_exports__["a"] = (parseKeys);

/***/ }),

/***/ 476:
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		// Test for IE <= 9 as proposed by Browserhacks
		// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
		// Tests for existence of standard globals is to allow style-loader 
		// to operate correctly into non-standard environments
		// @see https://github.com/webpack-contrib/style-loader/issues/177
		return window && document && document.all && !window.atob;
	}),
	getElement = (function(fn) {
		var memo = {};
		return function(selector) {
			if (typeof memo[selector] === "undefined") {
				memo[selector] = fn.call(this, selector);
			}
			return memo[selector]
		};
	})(function (styleTarget) {
		return document.querySelector(styleTarget)
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [],
	fixUrls = __webpack_require__(943);

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (typeof options.insertInto === "undefined") options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list, options);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list, options) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var styleTarget = getElement(options.insertInto)
	if (!styleTarget) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			styleTarget.insertBefore(styleElement, styleTarget.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			styleTarget.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			styleTarget.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		styleTarget.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	options.attrs.type = "text/css";

	attachTagAttrs(styleElement, options.attrs);
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	attachTagAttrs(linkElement, options.attrs);
	insertStyleElement(options, linkElement);
	return linkElement;
}

function attachTagAttrs(element, attrs) {
	Object.keys(attrs).forEach(function (key) {
		element.setAttribute(key, attrs[key]);
	});
}

function addStyle(obj, options) {
	var styleElement, update, remove, transformResult;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    transformResult = options.transform(obj.css);
	    
	    if (transformResult) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = transformResult;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css. 
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement, options);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/* If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
	and there is no publicPath defined then lets turn convertToAbsoluteUrls
	on by default.  Otherwise default to the convertToAbsoluteUrls option
	directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls){
		css = fixUrls(css);
	}

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ 477:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _dec2, _dec3, _dec4, _dec5, _class, _desc, _value, _class2, _class3, _temp;

var _mobxReact = __webpack_require__(264);

var _react = __webpack_require__(1);

var _react2 = _interopRequireDefault(_react);

var _reactKeydown = __webpack_require__(845);

var _reactKeydown2 = _interopRequireDefault(_reactKeydown);

var _semanticUiReact = __webpack_require__(161);

var _ExampleStore = __webpack_require__(479);

var _ExampleStore2 = _interopRequireDefault(_ExampleStore);

var _Spacer = __webpack_require__(480);

var _Spacer2 = _interopRequireDefault(_Spacer);

__webpack_require__(945);

var _TabbableTextArea = __webpack_require__(481);

var _TabbableTextArea2 = _interopRequireDefault(_TabbableTextArea);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	var desc = {};
	Object['ke' + 'ys'](descriptor).forEach(function (key) {
		desc[key] = descriptor[key];
	});
	desc.enumerable = !!desc.enumerable;
	desc.configurable = !!desc.configurable;

	if ('value' in desc || desc.initializer) {
		desc.writable = true;
	}

	desc = decorators.slice().reverse().reduce(function (desc, decorator) {
		return decorator(target, property, desc) || desc;
	}, desc);

	if (context && desc.initializer !== void 0) {
		desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
		desc.initializer = undefined;
	}

	if (desc.initializer === void 0) {
		Object['define' + 'Property'](target, property, desc);
		desc = null;
	}

	return desc;
}

var SpellEditor = (_dec = (0, _reactKeydown2.default)("ctrl+s"), _dec2 = (0, _reactKeydown2.default)("ctrl+r"), _dec3 = (0, _reactKeydown2.default)("ctrl+c"), _dec4 = (0, _reactKeydown2.default)("ctrl+n"), _dec5 = (0, _reactKeydown2.default)("ctrl+d"), (0, _mobxReact.observer)(_class = (_class2 = (_temp = _class3 = function (_React$Component) {
	_inherits(SpellEditor, _React$Component);

	function SpellEditor(props) {
		_classCallCheck(this, SpellEditor);

		var _this = _possibleConstructorReturn(this, (SpellEditor.__proto__ || Object.getPrototypeOf(SpellEditor)).call(this, props));

		window.examples = props.examples;
		_this.props.examples.load();

		//DEBUG
		window.spellEditor = _this;
		window.examples = _this.props.examples;
		return _this;
	}

	_createClass(SpellEditor, [{
		key: "save",
		value: function save() {
			this.props.examples.save();
		}
	}, {
		key: "revert",
		value: function revert() {
			this.props.examples.revert();
		}
	}, {
		key: "compile",
		value: function compile() {
			this.props.examples.compile();
		}
	}, {
		key: "create",
		value: function create() {
			this.props.examples.create();
		}
	}, {
		key: "delete",
		value: function _delete() {
			this.props.examples.delete(undefined, "CONFIRM");
		}
	}, {
		key: "rename",
		value: function rename() {
			this.props.examples.rename();
		}
	}, {
		key: "duplicate",
		value: function duplicate() {
			this.props.examples.duplicate();
		}
	}, {
		key: "load",
		value: function load() {
			this.props.examples.load();
		}
	}, {
		key: "reset",
		value: function reset() {
			this.props.examples.reset();
		}
	}, {
		key: "render",
		value: function render() {
			var _this2 = this;

			var examples = this.props.examples;
			var titles = examples.titles,
			    selected = examples.selected,
			    dirty = examples.dirty,
			    code = examples.code,
			    output = examples.output;

			// Create menuitems from the examples

			var options = titles.map(function (title) {
				return {
					value: title,
					title: title,
					text: title,
					content: title,
					onClick: function onClick() {
						return examples.select(title);
					}
				};
			});

			var dirtyButtons = function dirtyButtons() {
				if (!dirty) return;
				return _react2.default.createElement(
					_semanticUiReact.Menu,
					{ secondary: true, style: { position: "absolute", right: "1rem", top: "3px", margin: 0 } },
					_react2.default.createElement(
						_semanticUiReact.Button,
						{ negative: true, onClick: function onClick() {
								return _this2.revert();
							} },
						_react2.default.createElement(
							"u",
							null,
							"R"
						),
						"evert"
					),
					_react2.default.createElement(
						_semanticUiReact.Button,
						{ positive: true, onClick: function onClick() {
								return _this2.save();
							} },
						_react2.default.createElement(
							"u",
							null,
							"S"
						),
						"ave"
					)
				);
			};

			var compileButton = function compileButton() {
				if (output) return;
				return _react2.default.createElement(_semanticUiReact.Button, {
					style: { position: "absolute", width: "4em", left: "calc(50% - 2em)", top: "50%" },
					onClick: function onClick() {
						return _this2.compile();
					},
					icon: "right chevron" });
			};

			return _react2.default.createElement(
				_semanticUiReact.Grid,
				{ stretched: true, padded: true, className: "fullHeight" },
				_react2.default.createElement(
					_semanticUiReact.Grid.Row,
					{ style: { height: "2rem", paddingTop: "0rem" }, className: "ui inverted attached menu" },
					_react2.default.createElement(
						_semanticUiReact.Grid.Column,
						{ width: 7 },
						_react2.default.createElement(
							_semanticUiReact.Menu,
							{ inverted: true, attached: true, fluid: true },
							_react2.default.createElement(
								_semanticUiReact.Menu.Item,
								null,
								"Example:"
							),
							_react2.default.createElement(_semanticUiReact.Dropdown, { item: true, selection: true, options: options, value: selected, style: { width: "20em" } }),
							_react2.default.createElement(
								_semanticUiReact.Menu.Item,
								{ onClick: function onClick() {
										return _this2.delete();
									} },
								_react2.default.createElement(
									"u",
									null,
									"D"
								),
								"elete"
							),
							_react2.default.createElement(
								_semanticUiReact.Menu.Item,
								{ onClick: function onClick() {
										return _this2.rename();
									} },
								"Rename"
							),
							_react2.default.createElement(
								_semanticUiReact.Menu.Item,
								{ onClick: function onClick() {
										return _this2.duplicate();
									} },
								"Duplicate"
							)
						)
					),
					_react2.default.createElement(
						_semanticUiReact.Grid.Column,
						{ width: 2 },
						_react2.default.createElement(
							_semanticUiReact.Menu,
							{ inverted: true, attached: true, fluid: true },
							_react2.default.createElement(_Spacer2.default, { fluid: true }),
							_react2.default.createElement(
								_semanticUiReact.Menu.Item,
								{ onClick: function onClick() {
										return _this2.create();
									} },
								_react2.default.createElement(
									"u",
									null,
									"N"
								),
								"ew"
							),
							_react2.default.createElement(_Spacer2.default, { fluid: true })
						)
					),
					_react2.default.createElement(
						_semanticUiReact.Grid.Column,
						{ width: 7 },
						_react2.default.createElement(
							_semanticUiReact.Menu,
							{ inverted: true, attached: true, fluid: true },
							_react2.default.createElement(_Spacer2.default, { fluid: true }),
							_react2.default.createElement(
								_semanticUiReact.Menu.Item,
								{ onClick: function onClick() {
										return _this2.load();
									} },
								"Reload"
							),
							_react2.default.createElement(
								_semanticUiReact.Menu.Item,
								{ onClick: function onClick() {
										return _this2.reset();
									} },
								"Reset"
							)
						)
					)
				),
				_react2.default.createElement(
					_semanticUiReact.Grid.Row,
					{ style: { height: "calc(100% - 3rem)" } },
					_react2.default.createElement(
						_semanticUiReact.Grid.Column,
						{ width: 8 },
						_react2.default.createElement(_TabbableTextArea2.default, {
							className: "ui segment",
							value: code,
							onChange: function onChange(event) {
								return examples.update(examples.selected, event.target.value, "SKIP_SAVE");
							}
						}),
						dirtyButtons()
					),
					_react2.default.createElement(
						_semanticUiReact.Grid.Column,
						{ width: 8 },
						_react2.default.createElement(_semanticUiReact.TextArea, { className: "ui segment", value: output })
					),
					compileButton()
				)
			);
		}
	}]);

	return SpellEditor;
}(_react2.default.Component), _class3.defaultProps = {
	examples: new _ExampleStore2.default()
}, _temp), (_applyDecoratedDescriptor(_class2.prototype, "save", [_dec], Object.getOwnPropertyDescriptor(_class2.prototype, "save"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "revert", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "revert"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "compile", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "compile"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "create", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "create"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "delete", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "delete"), _class2.prototype)), _class2)) || _class);
exports.default = SpellEditor;

/***/ }),

/***/ 478:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _Parser = __webpack_require__(31);

var _Parser2 = _interopRequireDefault(_Parser);

var _Tokenizer = __webpack_require__(89);

var _Tokenizer2 = _interopRequireDefault(_Tokenizer);

var _Rule = __webpack_require__(87);

var _Rule2 = _interopRequireDefault(_Rule);

__webpack_require__(66);

__webpack_require__(487);

__webpack_require__(488);

__webpack_require__(486);

__webpack_require__(489);

__webpack_require__(490);

__webpack_require__(485);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Create parser which combines all of the above...
// Export all standard "spell" rules.
var parser = _Parser2.default.forName("spell");
// ...which depends on rules loaded above...


// Load all standard rules files.
parser.import("core", "lists", "operators", "if", "statements", "types", "JSX");
// ...as the default export
exports.default = parser;

// Stick other stuff on `window` for reflection and ad-hoc testing.

if (typeof window !== "undefined") {
	Object.assign(window, {
		Tokenizer: _Tokenizer2.default,
		Rule: _Rule2.default,
		Parser: _Parser2.default,

		tokenize: _Tokenizer2.default.tokenize.bind(exports.Tokenizer),
		parser: parser,
		parse: parser.parse.bind(parser),
		compile: parser.compile.bind(parser)
	});
}

/***/ }),

/***/ 479:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _desc, _value, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4; /* Store of example spell code fragments. */


// Make Parser and Tokenizer WARN as we run


var _mobx = __webpack_require__(160);

var _mobx2 = _interopRequireDefault(_mobx);

var _Parser = __webpack_require__(31);

var _Parser2 = _interopRequireDefault(_Parser);

var _Tokenizer = __webpack_require__(89);

var _Tokenizer2 = _interopRequireDefault(_Tokenizer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _initDefineProp(target, property, descriptor, context) {
	if (!descriptor) return;
	Object.defineProperty(target, property, {
		enumerable: descriptor.enumerable,
		configurable: descriptor.configurable,
		writable: descriptor.writable,
		value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
	});
}

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	var desc = {};
	Object['ke' + 'ys'](descriptor).forEach(function (key) {
		desc[key] = descriptor[key];
	});
	desc.enumerable = !!desc.enumerable;
	desc.configurable = !!desc.configurable;

	if ('value' in desc || desc.initializer) {
		desc.writable = true;
	}

	desc = decorators.slice().reverse().reduce(function (desc, decorator) {
		return decorator(target, property, desc) || desc;
	}, desc);

	if (context && desc.initializer !== void 0) {
		desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
		desc.initializer = undefined;
	}

	if (desc.initializer === void 0) {
		Object['define' + 'Property'](target, property, desc);
		desc = null;
	}

	return desc;
}

function _initializerWarningHelper(descriptor, context) {
	throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
}

_Parser2.default.WARN = true;
_Parser2.default.DEBUG = true;
_Parser2.default.TIME = true;

_Tokenizer2.default.WARN = true;

var ExampleStore = (_class = function () {
	function ExampleStore() {
		_classCallCheck(this, ExampleStore);

		_initDefineProp(this, "examples", _descriptor, this);

		_initDefineProp(this, "_savedExamples", _descriptor2, this);

		_initDefineProp(this, "selected", _descriptor3, this);

		_initDefineProp(this, "output", _descriptor4, this);
	}
	// Examples as of last save (for rever)

	// Selected example key.

	// Compiled output.


	_createClass(ExampleStore, [{
		key: "reset",


		// Reset all examples from localStorage.
		value: function reset() {
			delete localStorage.spellEditorExamples;
			delete localStorage.spellEditorExample;
			window.location.reload();
		}

		// Load examples

	}, {
		key: "load",
		value: function load() {
			// Load examples from localStorage
			this.examples = JSON.parse(localStorage.spellEditorExamples || '{"Foo":"define type Foo", "Bar":"define type Bar"}');

			// Save a copy of examples for revert
			this._savedExamples = this.examples;

			// Load selected example name
			this.select(localStorage.spellEditorExample);
		}

		// Save current examples.

	}, {
		key: "save",
		value: function save() {
			localStorage.spellEditorExamples = JSON.stringify(this.examples);

			// Save a copy of examples for revert
			this._savedExamples = this.examples;
		}

		// Revert the current example

	}, {
		key: "revert",
		value: function revert() {
			var example = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.selected;

			this.update(example, this._savedExamples[example]);
		}

		// Select a different example.

	}, {
		key: "select",
		value: function select(example) {
			if (!example || this.examples[example] == null) example = Object.keys(this.examples)[0] || "";
			this.selected = localStorage.spellEditorExample = example;
			this.output = "";
		}

		// Create a new example.
		// Saves and selects the example automatically.

	}, {
		key: "update",
		value: function update(name, code, skipSave) {
			this.examples = Object.assign({}, this.examples, _defineProperty({}, name, code));
			this.select(name);
			this.output = "";
			if (!skipSave) this.save();
		}

		// Delete an example.
		// Saves and selects another example automatically.

	}, {
		key: "delete",
		value: function _delete() {
			var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.selected;
			var showConfirm = arguments[1];

			if (showConfirm && !confirm("Really delete example " + name + "?")) return;
			var examples = Object.assign({}, this.examples);
			delete examples[name];
			this.examples = examples;
			this.save();
			this.select();
		}

		// Create a new example.

	}, {
		key: "create",
		value: function create(name) {
			var code = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

			// If no name, prompt.
			if (!name) name = prompt("Name for this example?");
			// Forget it if no name.
			if (!name) return;

			this.update(name, code);
		}

		// Rename an example.
		// Selects and saves automatically.

	}, {
		key: "rename",
		value: function rename() {
			var oldName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.selected;
			var newName = arguments[1];

			// If no new name, prompt.
			if (!newName) newName = prompt("New name for this example?", oldName);

			// Forget it if no name supplied or name is the same
			if (!newName || newName === oldName) return;
			if (this.examples[newName]) return console.warn("examples.rename(\"" + newName + "\"): name already in use");

			var code = this.examples[oldName];
			this.delete(oldName);
			this.update(newName, code);
		}

		// Duplicate an example.

	}, {
		key: "duplicate",
		value: function duplicate() {
			var oldName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.selected;
			var newName = arguments[1];

			// If no new name, prompt.
			if (!newName) newName = prompt("New name for duplicate example?", oldName);
			// Forget it if no name supplied or name is the same
			if (!newName || newName === oldName) return;
			if (this.examples[newName]) return console.warn("examples.rename(\"" + newName + "\"): name already in use");

			this.update(newName, this.code);
		}

		// Compile the current example, placing it in our `output`.
		//TODO: some way to do this automatically w/ "output" ?

	}, {
		key: "compile",
		value: function compile() {
			var _this = this;

			this.output = "...compiling...";
			setTimeout(function () {
				var result = parser.parse("statements", _this.code);
				if (!result) {
					console.warn("Can't parse!");
					_this.output = "Can't parse statements";
				} else {
					console.info("Result", result);
					_this.output = result.toSource(parser);
				}
			}, 100);
		}
	}, {
		key: "titles",


		// Return just the titles of the examples.
		get: function get() {
			return Object.keys(this.examples);
		}

		// Return the code for the current example

	}, {
		key: "code",
		get: function get() {
			return this.examples[this.selected];
		}

		// Is ANYTHING dirty?

	}, {
		key: "dirty",
		get: function get() {
			return JSON.stringify(this._savedExamples) !== JSON.stringify(this.examples);
		}
	}]);

	return ExampleStore;
}(), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "examples", [_mobx.observable], {
	enumerable: true,
	initializer: function initializer() {
		return {};
	}
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "_savedExamples", [_mobx.observable], {
	enumerable: true,
	initializer: function initializer() {
		return {};
	}
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "selected", [_mobx.observable], {
	enumerable: true,
	initializer: function initializer() {
		return "";
	}
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "output", [_mobx.observable], {
	enumerable: true,
	initializer: function initializer() {
		return "";
	}
}), _applyDecoratedDescriptor(_class.prototype, "titles", [_mobx.computed], Object.getOwnPropertyDescriptor(_class.prototype, "titles"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "code", [_mobx.computed], Object.getOwnPropertyDescriptor(_class.prototype, "code"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "dirty", [_mobx.computed], Object.getOwnPropertyDescriptor(_class.prototype, "dirty"), _class.prototype)), _class);
exports.default = ExampleStore;

/***/ }),

/***/ 48:
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),

/***/ 480:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Spacer;

var _react = __webpack_require__(1);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(358);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _util = __webpack_require__(483);

__webpack_require__(944);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//////////////////////////////
//
//  <Spacer> component for use with oak.
//
//////////////////////////////

function Spacer(props) {
  var className = props.className,
      appearance = props.appearance,
      size = props.size,
      width = props.width,
      height = props.height,
      inline = props.inline,
      fluid = props.fluid,
      tiny = props.tiny,
      small = props.small,
      medium = props.medium,
      large = props.large,
      huge = props.huge,
      massive = props.massive;


  var spacerProps = {
    className: (0, _util.classNames)(className, "oak", size, appearance, { inline: inline, fluid: fluid }, "spacer"),
    style: {
      width: width,
      height: height
    }
  };

  return _react2.default.createElement("div", spacerProps);
}

Spacer.propTypes = {
  className: _propTypes2.default.string,
  appearance: _propTypes2.default.string,
  size: _propTypes2.default.string,
  width: _propTypes2.default.number,
  height: _propTypes2.default.number,

  inline: _propTypes2.default.bool,
  fluid: _propTypes2.default.bool

};

Spacer.defaultProps = {
  size: "medium"
};

/***/ }),

/***/ 481:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(1);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(358);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _semanticUiReact = __webpack_require__(161);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//
//	# <TabbableTextArea> -- <SUI.TextArea> in which you can type a tab character:
//	- If nothing is selected, inserts a tab character
//	- If anything is selected, inserts tab characters at the beginning of the line(s)
//	- If shift key is down, inserts tab characters at the beginning of the line(s).
//
//	### Properties
//	- `save` (required) -- function used to save the results on keypress
//
var TabbableTextArea = function (_TextArea) {
	_inherits(TabbableTextArea, _TextArea);

	function TabbableTextArea() {
		var _ref;

		var _temp, _this, _ret;

		_classCallCheck(this, TabbableTextArea);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = TabbableTextArea.__proto__ || Object.getPrototypeOf(TabbableTextArea)).call.apply(_ref, [this].concat(args))), _this), _this.onKeyDown = function (event) {

			//TODO fire `this.props.onKeyDown` if defined...
			// Forget it if not a tab
			if (event.keyCode !== 9) return;

			// prevent default so we don't exit the field
			event.preventDefault();

			// figure out the text range
			var element = event.target;
			var text = element.value;
			var start = element.selectionStart;
			var end = element.selectionEnd;

			// Replacement text
			var newText = "",
			    selectionStart = start,
			    selectionEnd = end;

			// If selection is empty,
			if (start === end && !event.shiftKey) {
				newText = "\t";
				selectionStart = selectionEnd = end + 1;
			}
			// otherwise indent/de-indent all of the lines
			else {
					// use start and end of line(s)
					//console.info(`start: ${start} :${text[start]}:   end: ${end} : ${text[end]}:`);
					if (text[start] !== "\n") start = text.lastIndexOf("\n", start) + 1;
					if (text[end - 1] === "\n") end--;else if (text[end + 1] !== "\n") end = text.indexOf("\n", end) - 1;
					//console.info(`start: ${start} :${text[start]}:   end: ${end} : ${text[end]}:`);

					var lines = text.slice(start, end).split("\n");
					// if shift key is down, REMOVE a tab from each line
					if (event.shiftKey) {
						lines = lines.map(function (line) {
							return line[0] === "\t" ? line.substr(1) : line;
						});
					}
					// otherwise ADD a tab to each line
					else {
							lines = lines.map(function (line) {
								return "\t" + line;
							});
						}
					selectionStart = start;
					newText = lines.join("\n");
					selectionEnd = selectionStart + newText.length + 1;
				}

			// Update input value.
			element.value = text.substr(0, start) + newText + text.substr(end);

			// Update the selection
			element.selectionStart = selectionStart;
			element.selectionEnd = selectionEnd;

			// Delegate to `props.onChange` to save the value outside of the control
			if (_this.props.onChange) _this.props.onChange(event);
		}, _temp), _possibleConstructorReturn(_this, _ret);
	}

	_createClass(TabbableTextArea, [{
		key: "render",
		value: function render() {
			return _react2.default.createElement(_semanticUiReact.TextArea, _extends({}, this.props, { onKeyDown: this.onKeyDown }));
		}

		// Do NOT exit on tab -- insert or remove tab(s) value instead.

	}]);

	return TabbableTextArea;
}(_semanticUiReact.TextArea);

exports.default = TabbableTextArea;

/***/ }),

/***/ 482:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _react = __webpack_require__(1);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(65);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _index = __webpack_require__(478);

var _index2 = _interopRequireDefault(_index);

var _SpellEditor = __webpack_require__(477);

var _SpellEditor2 = _interopRequireDefault(_SpellEditor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Kick off our top-level element


// Parser
// Common imports
_reactDom2.default.render(_react2.default.createElement(_SpellEditor2.default, null), document.getElementById('react-root'));

// App-specific imports

/***/ }),

/***/ 483:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.classNames = classNames;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

//////////////////////////////
//  React Utility functions
//////////////////////////////

// `classNames`, concept stolen from:  http://jedwatson.github.io/classnames
function classNames() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return args.map(function (arg) {
    if (!arg) return "";
    if (Array.isArray(arg)) return classNames.apply(undefined, _toConsumableArray(arg));
    switch (typeof arg === "undefined" ? "undefined" : _typeof(arg)) {
      case "number":
      case "string":
        return arg;
      default:
        return Object.keys(arg).map(function (key) {
          return arg[key] ? key : "";
        }).filter(Boolean).join(" ");
    }
  }).filter(Boolean).join(" ");
}

/***/ }),

/***/ 484:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.memoized = memoized;
exports.defineMemoized = defineMemoized;
// Memoize/forget semantics.

// Return a memoizing getter function.
// TESTME
function memoized(property, getter) {
	return function () {
		if (this[property] === undefined) {
			var value = getter.apply(this);
			if (value !== undefined) {
				// Define so that we can be deleted and re-defined, but not set or enumerated.
				Object.defineProperty(this, property, { value: value, configurable: true });
			}
		}
		return this[property];
	};
}

// Return a memoize function for use as a getter in a `Object.defineProperty()`
// TESTME
function defineMemoized(property, getter) {
	return {
		get: memoized(property, getter)
	};
}

/***/ }),

/***/ 485:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Parser = __webpack_require__(31);

var _Parser2 = _interopRequireDefault(_Parser);

var _Tokenizer = __webpack_require__(89);

var _Tokenizer2 = _interopRequireDefault(_Tokenizer);

var _Rule2 = __webpack_require__(87);

var _Rule3 = _interopRequireDefault(_Rule2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //
//	# Rules parsing jsx
//


// Create "JSX" parser.
var parser = _Parser2.default.forName("JSX");
exports.default = parser;


parser.defineRules({
  name: "jsx",
  alias: ["expression", "statement"],
  constructor: function (_Rule) {
    _inherits(jsxElement, _Rule);

    function jsxElement() {
      _classCallCheck(this, jsxElement);

      return _possibleConstructorReturn(this, (jsxElement.__proto__ || Object.getPrototypeOf(jsxElement)).apply(this, arguments));
    }

    _createClass(jsxElement, [{
      key: "parse",

      // Text strings get encoded as `text` objects in the token stream.
      value: function parse(parser, tokens) {
        var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var end = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : tokens.length;

        var token = tokens[start];
        if (!(token instanceof _Tokenizer2.default.JSXElement)) return undefined;
        return this.clone({
          matched: token,
          nextStart: start + 1
        });
      }

      // Convert our attributes to source.
      // Returns `undefined` if no attributes.

    }, {
      key: "attrsToSource",
      value: function attrsToSource() {
        var _this2 = this;

        var jsxElement = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.matched;

        var attributes = jsxElement.attributes;
        if (!attributes || !attributes.length) return undefined;

        var attrs = attributes.map(function (_ref) {
          var name = _ref.name,
              value = _ref.value;

          // if NO value, assume it's a variable of the same name
          if (value === undefined) value = name;
          // if it's an array, it's a spell expression, possibly with nested JSX elements...
          else if (value instanceof _Tokenizer2.default.JSXExpression) {
              value = _this2.jsxExpressionToSource(value);
            }
            // else if a JSX element, recurse
            //TODO: indent...
            else if (value instanceof _Tokenizer2.default.JSXElement) {
                value = value.toSource();
              }
          // Otherwise if a number or Text literal, just use it

          // special case `class` to `className` because React is effing persnickety.
          if (name === "class") name = "className";
          //TODO: escape names which are invalid JS identifiers
          return name + ": " + value;
        });

        return "{ " + attrs.join(", ") + " }";
      }

      // Return an array with source for each of our children.
      // Returns `undefined` if we don't have any children.

    }, {
      key: "childrenToSource",
      value: function childrenToSource() {
        var _this3 = this;

        var jsxElement = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.matched;

        var children = jsxElement.children;
        if (!children || children.length === 0) return undefined;
        return children.map(function (child) {
          //TODO: escape inner quotes...
          if (typeof child === "string") {
            //forget it if whitespace only... ???
            var text = child.trim();
            if (!text) return undefined;
            return "\"" + text + "\"";
          }
          if (child instanceof _Tokenizer2.default.JSXElement) {
            var childSource = _this3.jsxElementToSource(child);
            return childSource.split("\n").join("\n\t");
          }
          if (child instanceof _Tokenizer2.default.JSXExpression) {
            return _this3.jsxExpressionToSource(child);
          }
          throw new SyntaxError("childrenToSource(): don't understand child" + child);
        })
        // remove undefined/empty string rules
        .filter(Boolean);
      }

      // Convert JSX expression ( `{...}` ) to JS source.

    }, {
      key: "jsxExpressionToSource",
      value: function jsxExpressionToSource(jsxExpression) {
        var tokens = jsxExpression.tokens;
        console.info(jsxExpression, tokens);
        return "/" + ("*TODO: " + tokens.join(" ") + "*") + "/";
      }
    }, {
      key: "jsxElementToSource",
      value: function jsxElementToSource() {
        var jsxElement = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.matched;

        // get the bits of the output
        var tagName = "\"" + jsxElement.tagName + "\"";
        var attrs = this.attrsToSource(jsxElement);
        var children = this.childrenToSource(jsxElement);

        var output = "createElement(" + tagName;
        if (!attrs && children) attrs = "null";

        if (attrs) output += ", " + attrs;
        if (children) {
          output += ",\n\t" + children.join(",\n\t") + "\n";
        }
        output += ")";
        return output;
      }
    }, {
      key: "toSource",
      value: function toSource() {
        return this.jsxElementToSource(this.matched);
      }
    }]);

    return jsxElement;
  }(_Rule3.default)
});

/***/ }),

/***/ 486:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Parser = __webpack_require__(31);

var _Parser2 = _interopRequireDefault(_Parser);

var _Rule = __webpack_require__(87);

var _Rule2 = _interopRequireDefault(_Rule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //
//	# Rules for if statements.
//

// Create "if" parser.
var parser = _Parser2.default.forName("if");
exports.default = parser;


parser.defineRules({
  name: "if",
  alias: "statement",
  syntax: "if {condition:expression} (then|:)? {statement}?",
  constructor: function (_Rule$BlockStatement) {
    _inherits(if_, _Rule$BlockStatement);

    function if_() {
      _classCallCheck(this, if_);

      return _possibleConstructorReturn(this, (if_.__proto__ || Object.getPrototypeOf(if_)).apply(this, arguments));
    }

    _createClass(if_, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource = this.getMatchedSource(),
            condition = _getMatchedSource.condition,
            statement = _getMatchedSource.statement,
            block = _getMatchedSource.block;
        //			if (statement && block) throw new SyntaxError("if may only have inline statement OR block");


        var statements = _Rule2.default.Block.encloseStatements(statement, block);
        return "if (" + condition + ") " + statements;
      }
    }]);

    return if_;
  }(_Rule2.default.BlockStatement)
},

// NOTE: this is NOT a block statement... ???
{
  name: "backwards_if",
  alias: "statement",
  syntax: "{statement} if {condition:expression} (?:(else|otherwise) {elseStatement:statement})?",
  leftRecursive: true,
  testRule: new _Rule2.default.Keywords({ literals: ["if"] }),
  constructor: function (_Rule$Sequence) {
    _inherits(backwards_if, _Rule$Sequence);

    function backwards_if() {
      _classCallCheck(this, backwards_if);

      return _possibleConstructorReturn(this, (backwards_if.__proto__ || Object.getPrototypeOf(backwards_if)).apply(this, arguments));
    }

    _createClass(backwards_if, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource2 = this.getMatchedSource(),
            condition = _getMatchedSource2.condition,
            statement = _getMatchedSource2.statement,
            elseStatement = _getMatchedSource2.elseStatement;

        var output = "if (" + condition + ") { " + statement + " }";
        if (elseStatement) output += "\nelse { " + elseStatement + " }";
        return output;
      }
    }]);

    return backwards_if;
  }(_Rule2.default.Sequence)
}, {
  name: "else_if",
  alias: "statement",
  syntax: "(else|otherwise) if {condition:expression} (then|:) {statement}?",
  constructor: function (_Rule$BlockStatement2) {
    _inherits(else_if, _Rule$BlockStatement2);

    function else_if() {
      _classCallCheck(this, else_if);

      return _possibleConstructorReturn(this, (else_if.__proto__ || Object.getPrototypeOf(else_if)).apply(this, arguments));
    }

    _createClass(else_if, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource3 = this.getMatchedSource(),
            condition = _getMatchedSource3.condition,
            statement = _getMatchedSource3.statement,
            block = _getMatchedSource3.block;
        //			if (statement && block) throw new SyntaxError("else if may only have inline statement OR block");


        var statements = _Rule2.default.Block.encloseStatements(statement, block);
        return "else if (" + condition + ") " + statements;
      }
    }]);

    return else_if;
  }(_Rule2.default.BlockStatement)
}, {
  name: "else",
  alias: "statement",
  syntax: "(else|otherwise) (:)? {statement}?",
  constructor: function (_Rule$BlockStatement3) {
    _inherits(else_, _Rule$BlockStatement3);

    function else_() {
      _classCallCheck(this, else_);

      return _possibleConstructorReturn(this, (else_.__proto__ || Object.getPrototypeOf(else_)).apply(this, arguments));
    }

    _createClass(else_, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource4 = this.getMatchedSource(),
            statement = _getMatchedSource4.statement,
            block = _getMatchedSource4.block;
        //			if (statement && block) throw new SyntaxError("else if may only have inline statement OR block");


        var statements = _Rule2.default.Block.encloseStatements(statement, block);
        return "else " + statements;
      }
    }]);

    return else_;
  }(_Rule2.default.BlockStatement)
});

/***/ }),

/***/ 487:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Parser = __webpack_require__(31);

var _Parser2 = _interopRequireDefault(_Parser);

var _Rule = __webpack_require__(87);

var _Rule2 = _interopRequireDefault(_Rule);

var _string = __webpack_require__(107);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //
//	# Rules for dealing with lists
//

// TODO: confirm identifiers are plural in some of the below?
// TODO: `list.clone()` to return new list of same type.

// Create "lists" parser.
var parser = _Parser2.default.forName("lists");
exports.default = parser;

// WORKING FROM OTHER RULES (testme)
//	`the length of <list>`
//	`<thing> is not? in <list>`
//	`<list> is not? empty`
//	`set item 1 of myList to 'a'`


// TODO: 	`create list with <exp>, <exp>, <exp>`
// TODO:	`duplicate list`
// TODO:	`duplicate list with <exp>, <exp>, <exp>` ???
// TODO:	`the size of <list>` => will map to `list.size`...
//				- install `size` as an alias to `length`?
// TODO:	`move <thing> to end of <list>` ???
// TODO:	`Set` for a unique list?
// TODO:	typed list?
// TODO:	list which won't take null/undefined


parser.defineRules(
// Return the length of the list.
//TESTME
{
  name: "list_length",
  alias: "expression",
  syntax: "the? number of {identifier} in {list:expression}",
  constructor: function (_Rule$Sequence) {
    _inherits(list_length, _Rule$Sequence);

    function list_length() {
      _classCallCheck(this, list_length);

      return _possibleConstructorReturn(this, (list_length.__proto__ || Object.getPrototypeOf(list_length)).apply(this, arguments));
    }

    _createClass(list_length, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource = this.getMatchedSource(),
            list = _getMatchedSource.list,
            identifier = _getMatchedSource.identifier;
        // TODO: special case 'words', 'lines', etc


        return list + ".length";
      }
    }]);

    return list_length;
  }(_Rule2.default.Sequence)
},

// Return the first position of specified item in the list as an array.
// If item is not found, returns `undefined`.
// NOTE: this position returned is **1-based**.
//TESTME
// TODO: `positions`, `last position`, `after...`
{
  name: "list_position",
  alias: "expression",
  syntax: "the? position of {thing:expression} in {list:expression}",
  constructor: function (_Rule$Sequence2) {
    _inherits(list_position, _Rule$Sequence2);

    function list_position() {
      _classCallCheck(this, list_position);

      return _possibleConstructorReturn(this, (list_position.__proto__ || Object.getPrototypeOf(list_position)).apply(this, arguments));
    }

    _createClass(list_position, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource2 = this.getMatchedSource(),
            thing = _getMatchedSource2.thing,
            list = _getMatchedSource2.list;

        return "spell.positionOf(" + thing + ", " + list + ")";
      }
    }]);

    return list_position;
  }(_Rule2.default.Sequence)
},

//
//	Ordinal numbers (first, second, last, etc).
// TODO: sixty-fifth, two hundred forty ninth...
//
{
  name: "ordinal",
  syntax: "first",
  constructor: function (_Rule$Keywords) {
    _inherits(ordinal, _Rule$Keywords);

    function ordinal() {
      _classCallCheck(this, ordinal);

      return _possibleConstructorReturn(this, (ordinal.__proto__ || Object.getPrototypeOf(ordinal)).apply(this, arguments));
    }

    _createClass(ordinal, [{
      key: "toSource",
      value: function toSource() {
        return 1;
      }
    }]);

    return ordinal;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "second",
  constructor: function (_Rule$Keywords2) {
    _inherits(ordinal, _Rule$Keywords2);

    function ordinal() {
      _classCallCheck(this, ordinal);

      return _possibleConstructorReturn(this, (ordinal.__proto__ || Object.getPrototypeOf(ordinal)).apply(this, arguments));
    }

    _createClass(ordinal, [{
      key: "toSource",
      value: function toSource() {
        return 2;
      }
    }]);

    return ordinal;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "third",
  constructor: function (_Rule$Keywords3) {
    _inherits(ordinal, _Rule$Keywords3);

    function ordinal() {
      _classCallCheck(this, ordinal);

      return _possibleConstructorReturn(this, (ordinal.__proto__ || Object.getPrototypeOf(ordinal)).apply(this, arguments));
    }

    _createClass(ordinal, [{
      key: "toSource",
      value: function toSource() {
        return 3;
      }
    }]);

    return ordinal;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "fourth",
  constructor: function (_Rule$Keywords4) {
    _inherits(ordinal, _Rule$Keywords4);

    function ordinal() {
      _classCallCheck(this, ordinal);

      return _possibleConstructorReturn(this, (ordinal.__proto__ || Object.getPrototypeOf(ordinal)).apply(this, arguments));
    }

    _createClass(ordinal, [{
      key: "toSource",
      value: function toSource() {
        return 4;
      }
    }]);

    return ordinal;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "fifth",
  constructor: function (_Rule$Keywords5) {
    _inherits(ordinal, _Rule$Keywords5);

    function ordinal() {
      _classCallCheck(this, ordinal);

      return _possibleConstructorReturn(this, (ordinal.__proto__ || Object.getPrototypeOf(ordinal)).apply(this, arguments));
    }

    _createClass(ordinal, [{
      key: "toSource",
      value: function toSource() {
        return 5;
      }
    }]);

    return ordinal;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "sixth",
  constructor: function (_Rule$Keywords6) {
    _inherits(ordinal, _Rule$Keywords6);

    function ordinal() {
      _classCallCheck(this, ordinal);

      return _possibleConstructorReturn(this, (ordinal.__proto__ || Object.getPrototypeOf(ordinal)).apply(this, arguments));
    }

    _createClass(ordinal, [{
      key: "toSource",
      value: function toSource() {
        return 6;
      }
    }]);

    return ordinal;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "seventh",
  constructor: function (_Rule$Keywords7) {
    _inherits(ordinal, _Rule$Keywords7);

    function ordinal() {
      _classCallCheck(this, ordinal);

      return _possibleConstructorReturn(this, (ordinal.__proto__ || Object.getPrototypeOf(ordinal)).apply(this, arguments));
    }

    _createClass(ordinal, [{
      key: "toSource",
      value: function toSource() {
        return 7;
      }
    }]);

    return ordinal;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "eighth",
  constructor: function (_Rule$Keywords8) {
    _inherits(ordinal, _Rule$Keywords8);

    function ordinal() {
      _classCallCheck(this, ordinal);

      return _possibleConstructorReturn(this, (ordinal.__proto__ || Object.getPrototypeOf(ordinal)).apply(this, arguments));
    }

    _createClass(ordinal, [{
      key: "toSource",
      value: function toSource() {
        return 8;
      }
    }]);

    return ordinal;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "ninth",
  constructor: function (_Rule$Keywords9) {
    _inherits(ordinal, _Rule$Keywords9);

    function ordinal() {
      _classCallCheck(this, ordinal);

      return _possibleConstructorReturn(this, (ordinal.__proto__ || Object.getPrototypeOf(ordinal)).apply(this, arguments));
    }

    _createClass(ordinal, [{
      key: "toSource",
      value: function toSource() {
        return 9;
      }
    }]);

    return ordinal;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "tenth",
  constructor: function (_Rule$Keywords10) {
    _inherits(ordinal, _Rule$Keywords10);

    function ordinal() {
      _classCallCheck(this, ordinal);

      return _possibleConstructorReturn(this, (ordinal.__proto__ || Object.getPrototypeOf(ordinal)).apply(this, arguments));
    }

    _createClass(ordinal, [{
      key: "toSource",
      value: function toSource() {
        return 10;
      }
    }]);

    return ordinal;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "penultimate",
  constructor: function (_Rule$Keywords11) {
    _inherits(ordinal, _Rule$Keywords11);

    function ordinal() {
      _classCallCheck(this, ordinal);

      return _possibleConstructorReturn(this, (ordinal.__proto__ || Object.getPrototypeOf(ordinal)).apply(this, arguments));
    }

    _createClass(ordinal, [{
      key: "toSource",
      value: function toSource() {
        return -2;
      }
    }]);

    return ordinal;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "final",
  constructor: function (_Rule$Keywords12) {
    _inherits(ordinal, _Rule$Keywords12);

    function ordinal() {
      _classCallCheck(this, ordinal);

      return _possibleConstructorReturn(this, (ordinal.__proto__ || Object.getPrototypeOf(ordinal)).apply(this, arguments));
    }

    _createClass(ordinal, [{
      key: "toSource",
      value: function toSource() {
        return -1;
      }
    }]);

    return ordinal;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "last",
  constructor: function (_Rule$Keywords13) {
    _inherits(ordinal, _Rule$Keywords13);

    function ordinal() {
      _classCallCheck(this, ordinal);

      return _possibleConstructorReturn(this, (ordinal.__proto__ || Object.getPrototypeOf(ordinal)).apply(this, arguments));
    }

    _createClass(ordinal, [{
      key: "toSource",
      value: function toSource() {
        return -1;
      }
    }]);

    return ordinal;
  }(_Rule2.default.Keywords)
},

// treat list as a stack or queue
//TESTME
{
  name: "ordinal",
  syntax: "top",
  constructor: function (_Rule$Keywords14) {
    _inherits(ordinal, _Rule$Keywords14);

    function ordinal() {
      _classCallCheck(this, ordinal);

      return _possibleConstructorReturn(this, (ordinal.__proto__ || Object.getPrototypeOf(ordinal)).apply(this, arguments));
    }

    _createClass(ordinal, [{
      key: "toSource",
      value: function toSource() {
        return 1;
      }
    }]);

    return ordinal;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "bottom",
  constructor: function (_Rule$Keywords15) {
    _inherits(ordinal, _Rule$Keywords15);

    function ordinal() {
      _classCallCheck(this, ordinal);

      return _possibleConstructorReturn(this, (ordinal.__proto__ || Object.getPrototypeOf(ordinal)).apply(this, arguments));
    }

    _createClass(ordinal, [{
      key: "toSource",
      value: function toSource() {
        return -1;
      }
    }]);

    return ordinal;
  }(_Rule2.default.Keywords)
},

// Index expression: numeric position in some list.
//	e.g.	`card 1 of the pile`
//			`card #2 of the pile`
//			`the first card of the pile`
//
// NOTE: Negative numeric positions come from the END of the list.
//	e.g.	`card -1 of the pile`
//
// NOTE: Our positions are **1-based** and Javascript is **0-based**.
//		 e.g. `item 1 of the array`  = `array[0]`
//
// TODO: if `identifier` is "word", output `getWord()` etc
// TODO: special case 'words', 'lines', etc ?
{
  name: "position_expression",
  alias: "expression",
  syntax: ["{identifier} {position:expression} of (the?) {expression}", "the {position:ordinal} {identifier} of (the?) {expression}"],
  constructor: function (_Rule$Sequence3) {
    _inherits(position_expression, _Rule$Sequence3);

    function position_expression() {
      _classCallCheck(this, position_expression);

      return _possibleConstructorReturn(this, (position_expression.__proto__ || Object.getPrototypeOf(position_expression)).apply(this, arguments));
    }

    _createClass(position_expression, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource3 = this.getMatchedSource(),
            identifier = _getMatchedSource3.identifier,
            position = _getMatchedSource3.position,
            expression = _getMatchedSource3.expression;
        // If we got a positive number literal, compensate for JS 0-based arrays now, for nicer output.


        if (typeof position === "number" && position > 0) {
          return expression + "[" + (position - 1) + "]";
        }
        return "spell.getItem(" + expression + ", " + position + ")";
      }
    }]);

    return position_expression;
  }(_Rule2.default.Sequence)
},

// Pick a SINGLE random item from the list.
// TODO: confirm identifier is plural?
//TESTME
{
  name: "random_position_expression",
  alias: "expression",
  syntax: "a random {identifier} (of|from|in) (the)? {list:expression}",
  constructor: function (_Rule$Sequence4) {
    _inherits(random_position_expression, _Rule$Sequence4);

    function random_position_expression() {
      _classCallCheck(this, random_position_expression);

      return _possibleConstructorReturn(this, (random_position_expression.__proto__ || Object.getPrototypeOf(random_position_expression)).apply(this, arguments));
    }

    _createClass(random_position_expression, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource4 = this.getMatchedSource(),
            list = _getMatchedSource4.list;

        return "spell.getRandomItemOf(" + list + ")";
      }
    }]);

    return random_position_expression;
  }(_Rule2.default.Sequence)
},

// Pick a unique set of random items from the list, returning an array.
// TODO: `two random items...`
// TODO: confirm identifier is plural?
// TODO: `list.clone()` to return new list of same type.
//TESTME
{
  name: "random_positions_expression",
  alias: "expression",
  syntax: "{number} random {identifier} (of|from|in) (the)? {list:expression}",
  constructor: function (_Rule$Sequence5) {
    _inherits(random_positions_expression, _Rule$Sequence5);

    function random_positions_expression() {
      _classCallCheck(this, random_positions_expression);

      return _possibleConstructorReturn(this, (random_positions_expression.__proto__ || Object.getPrototypeOf(random_positions_expression)).apply(this, arguments));
    }

    _createClass(random_positions_expression, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource5 = this.getMatchedSource(),
            number = _getMatchedSource5.number,
            list = _getMatchedSource5.list;

        return "spell.getRandomItemsOf(" + list + ", " + number + ")";
      }
    }]);

    return random_positions_expression;
  }(_Rule2.default.Sequence)
},

// Range expression.
// Returns a new list.
// NOTE: `start` is **1-based**.
// NOTE: `end` is inclusive!
// TODO: confirm identifier is plural?
// TODO: `list.clone()` to return new list of same type.
//TESTME
{
  name: "range_expression",
  alias: "expression",
  syntax: "{identifier} {start:expression} to {end:expression} of {list:expression}",
  constructor: function (_Rule$Sequence6) {
    _inherits(range_expression, _Rule$Sequence6);

    function range_expression() {
      _classCallCheck(this, range_expression);

      return _possibleConstructorReturn(this, (range_expression.__proto__ || Object.getPrototypeOf(range_expression)).apply(this, arguments));
    }

    _createClass(range_expression, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource6 = this.getMatchedSource(),
            start = _getMatchedSource6.start,
            end = _getMatchedSource6.end,
            list = _getMatchedSource6.list;

        return "spell.getRange(" + list + ", " + start + ", " + end + ")";
      }
    }]);

    return range_expression;
  }(_Rule2.default.Sequence)
},

// Starting range expression.
// Returns a new list.
// e.g.	`first 4 items of list`
//TESTME
{
  name: "first_in_range",
  alias: "expression",
  syntax: "first {number:expression} {identifier} (in|of) {list:expression}",
  constructor: function (_Rule$Sequence7) {
    _inherits(range_expression, _Rule$Sequence7);

    function range_expression() {
      _classCallCheck(this, range_expression);

      return _possibleConstructorReturn(this, (range_expression.__proto__ || Object.getPrototypeOf(range_expression)).apply(this, arguments));
    }

    _createClass(range_expression, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource7 = this.getMatchedSource(),
            number = _getMatchedSource7.number,
            list = _getMatchedSource7.list;

        return "spell.getRange(" + list + ", 1, " + number + ")";
      }
    }]);

    return range_expression;
  }(_Rule2.default.Sequence)
},

// Ending range expression.
// Returns a new list.
// e.g.	`last 4 items of list`
//TESTME
{
  name: "last_in_range",
  alias: "expression",
  syntax: "last {number:expression} {identifier} (in|of) {list:expression}",
  constructor: function (_Rule$Sequence8) {
    _inherits(range_expression, _Rule$Sequence8);

    function range_expression() {
      _classCallCheck(this, range_expression);

      return _possibleConstructorReturn(this, (range_expression.__proto__ || Object.getPrototypeOf(range_expression)).apply(this, arguments));
    }

    _createClass(range_expression, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource8 = this.getMatchedSource(),
            number = _getMatchedSource8.number,
            list = _getMatchedSource8.list;

        return "spell.getEndRange(" + list + ", 1, " + number + ")";
      }
    }]);

    return range_expression;
  }(_Rule2.default.Sequence)
},

// Range expression starting at some item in the list.
// Returns a new list.
// If item is not found, returns an empty list. (???)
//TESTME
{
  name: "range_expression",
  alias: "expression",
  syntax: "{identifier} (in|of) {list:expression} starting with {thing:expression}",
  constructor: function (_Rule$Sequence9) {
    _inherits(range_expression, _Rule$Sequence9);

    function range_expression() {
      _classCallCheck(this, range_expression);

      return _possibleConstructorReturn(this, (range_expression.__proto__ || Object.getPrototypeOf(range_expression)).apply(this, arguments));
    }

    _createClass(range_expression, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource9 = this.getMatchedSource(),
            thing = _getMatchedSource9.thing,
            list = _getMatchedSource9.list;

        return "spell.getRange(" + list + ", spell.positionOf(" + thing + ", " + list + "))";
      }
    }]);

    return range_expression;
  }(_Rule2.default.Sequence)
},

// List filter.
// NOTE: we will singularize `identifier` and use that as the argument to `expression`.
//TESTME
{
  name: "list_filter",
  alias: "expression",
  syntax: "{identifier} (in|of) {list:expression} where {condition:expression}",
  constructor: function (_Rule$Sequence10) {
    _inherits(list_filter, _Rule$Sequence10);

    function list_filter() {
      _classCallCheck(this, list_filter);

      return _possibleConstructorReturn(this, (list_filter.__proto__ || Object.getPrototypeOf(list_filter)).apply(this, arguments));
    }

    _createClass(list_filter, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource10 = this.getMatchedSource(),
            identifier = _getMatchedSource10.identifier,
            condition = _getMatchedSource10.condition,
            list = _getMatchedSource10.list;
        // use singular of identifier for method argument


        var argument = (0, _string.singularize)(identifier.toSource());
        return "spell.filter(" + list + ", " + argument + " => " + condition + ")";
      }
    }]);

    return list_filter;
  }(_Rule2.default.Sequence)
},

// Set membership (left recursive).
// NOTE: we will singularize `identifier` and use that as the argument to `expression`.
//TESTME
{
  name: "list_membership_test",
  alias: "expression",
  syntax: "{list:expression} (operator:has|has no|doesnt have|does not have) {identifier} where {filter:expression}",
  leftRecursive: true,
  testRule: new _Rule2.default.Keywords({ match: "where" }),
  constructor: function (_Rule$Sequence11) {
    _inherits(list_membership_test, _Rule$Sequence11);

    function list_membership_test() {
      _classCallCheck(this, list_membership_test);

      return _possibleConstructorReturn(this, (list_membership_test.__proto__ || Object.getPrototypeOf(list_membership_test)).apply(this, arguments));
    }

    _createClass(list_membership_test, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource11 = this.getMatchedSource(),
            identifier = _getMatchedSource11.identifier,
            operator = _getMatchedSource11.operator,
            filter = _getMatchedSource11.filter,
            list = _getMatchedSource11.list;

        var bang = operator === "has" ? "" : "!";
        // use singular of identifier for method argument
        var argument = (0, _string.singularize)(identifier.toSource());
        return bang + "spell.any(" + list + ", " + argument + " => " + filter + ")";
      }
    }]);

    return list_membership_test;
  }(_Rule2.default.Sequence)
},

//
//	Adding to list (in-place)
//

// Add to end of list.
//TESTME
{
  name: "list_append",
  alias: "statement",
  syntax: ["append {thing:expression} to {list:expression}", "add {thing:expression} to ((the?) end of)? {list:expression}"],
  constructor: function (_Rule$Sequence12) {
    _inherits(list_append, _Rule$Sequence12);

    function list_append() {
      _classCallCheck(this, list_append);

      return _possibleConstructorReturn(this, (list_append.__proto__ || Object.getPrototypeOf(list_append)).apply(this, arguments));
    }

    _createClass(list_append, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource12 = this.getMatchedSource(),
            thing = _getMatchedSource12.thing,
            list = _getMatchedSource12.list;

        return "spell.append(" + list + ", " + thing + ")";
      }
    }]);

    return list_append;
  }(_Rule2.default.Sequence)
},

// Add to beginning of list.
//TESTME
{
  name: "list_prepend",
  alias: "statement",
  syntax: ["prepend {thing:expression} to {list:expression}", "add {thing:expression} to the (start|front|top) of {list:expression}"],
  constructor: function (_Rule$Sequence13) {
    _inherits(list_prepend, _Rule$Sequence13);

    function list_prepend() {
      _classCallCheck(this, list_prepend);

      return _possibleConstructorReturn(this, (list_prepend.__proto__ || Object.getPrototypeOf(list_prepend)).apply(this, arguments));
    }

    _createClass(list_prepend, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource13 = this.getMatchedSource(),
            thing = _getMatchedSource13.thing,
            list = _getMatchedSource13.list;

        return "spell.prepend(" + list + ", " + thing + ")";
      }
    }]);

    return list_prepend;
  }(_Rule2.default.Sequence)
},

// Add to middle of list, pushing existing items out of the way.
//TESTME
{
  name: "list_add_at",
  alias: "statement",
  syntax: "add {thing:expression} to {list:expression} at position {position:expression}",
  constructor: function (_Rule$Sequence14) {
    _inherits(list_splice, _Rule$Sequence14);

    function list_splice() {
      _classCallCheck(this, list_splice);

      return _possibleConstructorReturn(this, (list_splice.__proto__ || Object.getPrototypeOf(list_splice)).apply(this, arguments));
    }

    _createClass(list_splice, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource14 = this.getMatchedSource(),
            thing = _getMatchedSource14.thing,
            position = _getMatchedSource14.position,
            list = _getMatchedSource14.list;

        return "spell.splice(" + list + ", " + position + ", " + thing + ")";
      }
    }]);

    return list_splice;
  }(_Rule2.default.Sequence)
},

// TODO:  	"add {thing:expression} to {list:expression} before {item:expression}",

// Add to middle of list, pushing existing items out of the way.
//TESTME
{
  name: "list_add_after",
  alias: "statement",
  syntax: "add {thing:expression} to {list:expression} after {item:expression}",
  constructor: function (_Rule$Sequence15) {
    _inherits(list_add_after, _Rule$Sequence15);

    function list_add_after() {
      _classCallCheck(this, list_add_after);

      return _possibleConstructorReturn(this, (list_add_after.__proto__ || Object.getPrototypeOf(list_add_after)).apply(this, arguments));
    }

    _createClass(list_add_after, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource15 = this.getMatchedSource(),
            thing = _getMatchedSource15.thing,
            item = _getMatchedSource15.item,
            list = _getMatchedSource15.list;

        return "spell.splice(" + list + ", spell.positionOf(" + list + ", " + item + "), " + thing + ")";
      }
    }]);

    return list_add_after;
  }(_Rule2.default.Sequence)
},

//
//	Removing from list (in-place)
//

// Empty list.
//TODO: make `empty` and/or `clear` a generic statement???
//TESTME
{
  name: "list_empty",
  alias: "statement",
  syntax: "(empty|clear) {list:expression}",
  constructor: function (_Rule$Sequence16) {
    _inherits(list_empty, _Rule$Sequence16);

    function list_empty() {
      _classCallCheck(this, list_empty);

      return _possibleConstructorReturn(this, (list_empty.__proto__ || Object.getPrototypeOf(list_empty)).apply(this, arguments));
    }

    _createClass(list_empty, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource16 = this.getMatchedSource(),
            list = _getMatchedSource16.list;

        return "spell.clear(" + list + ")";
      }
    }]);

    return list_empty;
  }(_Rule2.default.Sequence)
},

// Remove one item from list by position.
//TESTME
{
  name: "list_remove_position",
  alias: "statement",
  syntax: "remove {identifier} {number:expression} of {list:expression}",
  constructor: function (_Rule$Sequence17) {
    _inherits(list_remove_position, _Rule$Sequence17);

    function list_remove_position() {
      _classCallCheck(this, list_remove_position);

      return _possibleConstructorReturn(this, (list_remove_position.__proto__ || Object.getPrototypeOf(list_remove_position)).apply(this, arguments));
    }

    _createClass(list_remove_position, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource17 = this.getMatchedSource(),
            number = _getMatchedSource17.number,
            list = _getMatchedSource17.list;

        return "spell.removeItem(" + list + ", " + number + ")";
      }
    }]);

    return list_remove_position;
  }(_Rule2.default.Sequence)
},

// Remove range of things from list.
// NOTE: `start` is **1-based**.
// NOTE: `end` is inclusive!
//TESTME
{
  name: "list_remove_range",
  alias: "statement",
  syntax: "remove {identifier} {start:expression} to {end:expression} of {list:expression}",
  constructor: function (_Rule$Sequence18) {
    _inherits(list_remove_position, _Rule$Sequence18);

    function list_remove_position() {
      _classCallCheck(this, list_remove_position);

      return _possibleConstructorReturn(this, (list_remove_position.__proto__ || Object.getPrototypeOf(list_remove_position)).apply(this, arguments));
    }

    _createClass(list_remove_position, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource18 = this.getMatchedSource(),
            start = _getMatchedSource18.start,
            end = _getMatchedSource18.end,
            list = _getMatchedSource18.list;

        return "spell.removeRange(" + list + ", " + start + ", " + end + ")";
      }
    }]);

    return list_remove_position;
  }(_Rule2.default.Sequence)
},

// Remove all instances of something from a list.
//TESTME
{
  name: "list_remove",
  alias: "statement",
  syntax: "remove {thing:expression} from {list:expression}",
  constructor: function (_Rule$Sequence19) {
    _inherits(list_remove, _Rule$Sequence19);

    function list_remove() {
      _classCallCheck(this, list_remove);

      return _possibleConstructorReturn(this, (list_remove.__proto__ || Object.getPrototypeOf(list_remove)).apply(this, arguments));
    }

    _createClass(list_remove, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource19 = this.getMatchedSource(),
            thing = _getMatchedSource19.thing,
            list = _getMatchedSource19.list;

        return "spell.remove(" + list + ", " + thing + ")";
      }
    }]);

    return list_remove;
  }(_Rule2.default.Sequence)
},

// Remove all items from list where condition is true.
// NOTE: we will singularize `identifier` and use that as the argument to `expression`.
//TESTME
{
  name: "list_remove_where",
  alias: "statement",
  syntax: "remove {identifier} (in|of|from) {list:expression} where {condition:expression}",
  constructor: function (_Rule$Sequence20) {
    _inherits(list_remove_where, _Rule$Sequence20);

    function list_remove_where() {
      _classCallCheck(this, list_remove_where);

      return _possibleConstructorReturn(this, (list_remove_where.__proto__ || Object.getPrototypeOf(list_remove_where)).apply(this, arguments));
    }

    _createClass(list_remove_where, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource20 = this.getMatchedSource(),
            identifier = _getMatchedSource20.identifier,
            condition = _getMatchedSource20.condition,
            list = _getMatchedSource20.list;
        // use singular of identifier for method argument


        var argument = (0, _string.singularize)(identifier.toSource());
        return "spell.removeWhere(" + list + ", " + argument + " => " + condition + ")";
      }
    }]);

    return list_remove_where;
  }(_Rule2.default.Sequence)
},

//
//	Random (in-place) list manipulation.
//

// Reverse list in-place.
//TESTME
{
  name: "list_reverse",
  alias: "statement",
  syntax: "reverse {list:expression}",
  constructor: function (_Rule$Sequence21) {
    _inherits(list_reverse, _Rule$Sequence21);

    function list_reverse() {
      _classCallCheck(this, list_reverse);

      return _possibleConstructorReturn(this, (list_reverse.__proto__ || Object.getPrototypeOf(list_reverse)).apply(this, arguments));
    }

    _createClass(list_reverse, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource21 = this.getMatchedSource(),
            list = _getMatchedSource21.list;

        return "spell.reverse(" + list + ")";
      }
    }]);

    return list_reverse;
  }(_Rule2.default.Sequence)
},

// Shuffle list in-place.
//TESTME
{
  name: "list_shuffle",
  alias: "statement",
  syntax: "(randomize|shuffle) {list:expression}",
  constructor: function (_Rule$Sequence22) {
    _inherits(list_shuffle, _Rule$Sequence22);

    function list_shuffle() {
      _classCallCheck(this, list_shuffle);

      return _possibleConstructorReturn(this, (list_shuffle.__proto__ || Object.getPrototypeOf(list_shuffle)).apply(this, arguments));
    }

    _createClass(list_shuffle, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource22 = this.getMatchedSource(),
            list = _getMatchedSource22.list;

        return "spell.shuffle(" + list + ")";
      }
    }]);

    return list_shuffle;
  }(_Rule2.default.Sequence)
},

// Iteration
//TESTME
{
  name: "list_iteration",
  alias: "statement",
  syntax: ["for (each)? {itemVar:identifier} in {list:expression}:? {statement}?", "for (each)? {itemVar:identifier} (and|,) {positionVar:identifier} in {list:expression}:? {statement}?"],
  constructor: function (_Rule$BlockStatement) {
    _inherits(list_iteration, _Rule$BlockStatement);

    function list_iteration() {
      _classCallCheck(this, list_iteration);

      return _possibleConstructorReturn(this, (list_iteration.__proto__ || Object.getPrototypeOf(list_iteration)).apply(this, arguments));
    }

    _createClass(list_iteration, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource23 = this.getMatchedSource(),
            itemVar = _getMatchedSource23.itemVar,
            positionVar = _getMatchedSource23.positionVar,
            list = _getMatchedSource23.list,
            statement = _getMatchedSource23.statement,
            block = _getMatchedSource23.block;

        var output = void 0;
        if (positionVar) {
          output = "for (let " + positionVar + " = 1, bar; " + itemVar + " = " + list + "[" + positionVar + "-1], " + positionVar + " <= " + list + ".length; " + positionVar + "++) ";
        } else {
          // NOTE: this is relatively slow...  probably doesn't matter...
          output = "for (let " + itemVar + " of " + list + ") ";
        }
        output += _Rule2.default.Block.encloseStatements(statement, block);
        return output;
      }
    }]);

    return list_iteration;
  }(_Rule2.default.BlockStatement)
},

// Range
//TESTME
{
  name: "range_expression",
  alias: "expression",
  syntax: "range {start:expression} to {end:expression}",
  constructor: function (_Rule$Sequence23) {
    _inherits(range_expression, _Rule$Sequence23);

    function range_expression() {
      _classCallCheck(this, range_expression);

      return _possibleConstructorReturn(this, (range_expression.__proto__ || Object.getPrototypeOf(range_expression)).apply(this, arguments));
    }

    _createClass(range_expression, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource24 = this.getMatchedSource(),
            start = _getMatchedSource24.start,
            end = _getMatchedSource24.end;

        return "spell.getRange(" + start + ", " + end + ")";
      }
    }]);

    return range_expression;
  }(_Rule2.default.Sequence)
});

/***/ }),

/***/ 488:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Parser = __webpack_require__(31);

var _Parser2 = _interopRequireDefault(_Parser);

var _Rule = __webpack_require__(87);

var _Rule2 = _interopRequireDefault(_Rule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //
//	# Rules for infix and prefix operators.
//

// Create "operators" parser.
var parser = _Parser2.default.forName("operators");
exports.default = parser;


parser.defineRules(
// TODO:
// 	// Find best match according to operator precedence as defined below.
// 	getBestMatch(matches) {
// 		console.warn("GBM", matches, matches.map(match => match.precedence), matches.map(match => match.matchedText));
// 		return matches.reduce(function (best, next) {
// 			// take highest precedence match first
// 			if (next.precedence > best.precedence) return next;
// 			// take longest match if same precedence
// 			if (next.precedence === best.precedence) {
// 				if (next.endIndex > best.endIndex) return next;
// 			}
// 			return best;
// 		}, matches[0]);
// 	}


{
  name: "infix_operator_expression",
  alias: "expression",
  syntax: "{lhs:expression} {operator:infix_operator} {rhs:expression}",
  leftRecursive: true,
  testRule: "infix_operator",
  constructor: function (_Rule$Sequence) {
    _inherits(infix_operator_expression, _Rule$Sequence);

    function infix_operator_expression() {
      _classCallCheck(this, infix_operator_expression);

      return _possibleConstructorReturn(this, (infix_operator_expression.__proto__ || Object.getPrototypeOf(infix_operator_expression)).apply(this, arguments));
    }

    _createClass(infix_operator_expression, [{
      key: "toSource",
      value: function toSource() {
        var _results = this.results,
            lhs = _results.lhs,
            rhs = _results.rhs,
            operator = _results.operator;

        return operator.apply(lhs.toSource(), rhs.toSource());
      }
    }]);

    return infix_operator_expression;
  }(_Rule2.default.Sequence)
},

//## Infix operators:   `{lhs} <operator> {rhs}`, eg: `a is 1`
// NOTE: `operator.apply` MUST return a function which transforms two arguments (`lhs` and `rhs`) into output.
// NOTE: `precedence` numbers come from Javascript equivalents
//		 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
{
  name: "infix_operator",
  precedence: 6,
  syntax: "and",
  constructor: function (_Rule$Keywords) {
    _inherits(and, _Rule$Keywords);

    function and() {
      _classCallCheck(this, and);

      return _possibleConstructorReturn(this, (and.__proto__ || Object.getPrototypeOf(and)).apply(this, arguments));
    }

    _createClass(and, [{
      key: "apply",
      value: function apply(a, b) {
        return "(" + a + " && " + b + ")";
      }
    }]);

    return and;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 5,
  syntax: "or",
  constructor: function (_Rule$Keywords2) {
    _inherits(or, _Rule$Keywords2);

    function or() {
      _classCallCheck(this, or);

      return _possibleConstructorReturn(this, (or.__proto__ || Object.getPrototypeOf(or)).apply(this, arguments));
    }

    _createClass(or, [{
      key: "apply",
      value: function apply(a, b) {
        return "(" + a + " || " + b + ")";
      }
    }]);

    return or;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 10,
  syntax: "is",
  constructor: function (_Rule$Keywords3) {
    _inherits(is, _Rule$Keywords3);

    function is() {
      _classCallCheck(this, is);

      return _possibleConstructorReturn(this, (is.__proto__ || Object.getPrototypeOf(is)).apply(this, arguments));
    }

    _createClass(is, [{
      key: "apply",
      value: function apply(a, b) {
        return "(" + a + " == " + b + ")";
      }
    }]);

    return is;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 10,
  syntax: "is not",
  constructor: function (_Rule$Keywords4) {
    _inherits(is_not, _Rule$Keywords4);

    function is_not() {
      _classCallCheck(this, is_not);

      return _possibleConstructorReturn(this, (is_not.__proto__ || Object.getPrototypeOf(is_not)).apply(this, arguments));
    }

    _createClass(is_not, [{
      key: "apply",
      value: function apply(a, b) {
        return "(" + a + " != " + b + ")";
      }
    }]);

    return is_not;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 10,
  syntax: "is exactly",
  constructor: function (_Rule$Keywords5) {
    _inherits(is_exactly, _Rule$Keywords5);

    function is_exactly() {
      _classCallCheck(this, is_exactly);

      return _possibleConstructorReturn(this, (is_exactly.__proto__ || Object.getPrototypeOf(is_exactly)).apply(this, arguments));
    }

    _createClass(is_exactly, [{
      key: "apply",
      value: function apply(a, b) {
        return "(" + a + " === " + b + ")";
      }
    }]);

    return is_exactly;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 10,
  syntax: "is not exactly",
  constructor: function (_Rule$Keywords6) {
    _inherits(is_not_exactly, _Rule$Keywords6);

    function is_not_exactly() {
      _classCallCheck(this, is_not_exactly);

      return _possibleConstructorReturn(this, (is_not_exactly.__proto__ || Object.getPrototypeOf(is_not_exactly)).apply(this, arguments));
    }

    _createClass(is_not_exactly, [{
      key: "apply",
      value: function apply(a, b) {
        return "(" + a + " !== " + b + ")";
      }
    }]);

    return is_not_exactly;
  }(_Rule2.default.Keywords)
},

//TODO: `spell.isOfType(thing, type)`
//TODO: `is same type as` ?
{
  name: "infix_operator",
  precedence: 11,
  syntax: ["is a", "is an"],
  constructor: function (_Rule$Keywords7) {
    _inherits(is_a, _Rule$Keywords7);

    function is_a() {
      _classCallCheck(this, is_a);

      return _possibleConstructorReturn(this, (is_a.__proto__ || Object.getPrototypeOf(is_a)).apply(this, arguments));
    }

    _createClass(is_a, [{
      key: "apply",
      value: function apply(thing, type) {
        return "spell.isOfType(" + thing + ", '" + type + "')";
      }
    }]);

    return is_a;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 11,
  syntax: ["is not a", "is not an"],
  constructor: function (_Rule$Keywords8) {
    _inherits(is_not_a, _Rule$Keywords8);

    function is_not_a() {
      _classCallCheck(this, is_not_a);

      return _possibleConstructorReturn(this, (is_not_a.__proto__ || Object.getPrototypeOf(is_not_a)).apply(this, arguments));
    }

    _createClass(is_not_a, [{
      key: "apply",
      value: function apply(thing, type) {
        return "!spell.isOfType(" + thing + ", '" + type + "')";
      }
    }]);

    return is_not_a;
  }(_Rule2.default.Keywords)
},

//TODO: `spell.contains(collection, thing)`
{
  name: "infix_operator",
  precedence: 11,
  syntax: ["is in", "is one of"],
  constructor: function (_Rule$Keywords9) {
    _inherits(is_in, _Rule$Keywords9);

    function is_in() {
      _classCallCheck(this, is_in);

      return _possibleConstructorReturn(this, (is_in.__proto__ || Object.getPrototypeOf(is_in)).apply(this, arguments));
    }

    _createClass(is_in, [{
      key: "apply",
      value: function apply(thing, list) {
        return list + ".includes(" + thing + ")";
      }
    }]);

    return is_in;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 11,
  syntax: ["is not in", "is not one of"],
  constructor: function (_Rule$Keywords10) {
    _inherits(is_not_in, _Rule$Keywords10);

    function is_not_in() {
      _classCallCheck(this, is_not_in);

      return _possibleConstructorReturn(this, (is_not_in.__proto__ || Object.getPrototypeOf(is_not_in)).apply(this, arguments));
    }

    _createClass(is_not_in, [{
      key: "apply",
      value: function apply(thing, list) {
        return "!" + list + ".includes(" + thing + ")";
      }
    }]);

    return is_not_in;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 11,
  syntax: ["includes", "contains"],
  constructor: function (_Rule$Keywords11) {
    _inherits(includes, _Rule$Keywords11);

    function includes() {
      _classCallCheck(this, includes);

      return _possibleConstructorReturn(this, (includes.__proto__ || Object.getPrototypeOf(includes)).apply(this, arguments));
    }

    _createClass(includes, [{
      key: "apply",
      value: function apply(list, thing) {
        return list + ".includes(" + thing + ")";
      }
    }]);

    return includes;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 11,
  syntax: ["does not include", "does not contain"],
  constructor: function (_Rule$Keywords12) {
    _inherits(does_not_include, _Rule$Keywords12);

    function does_not_include() {
      _classCallCheck(this, does_not_include);

      return _possibleConstructorReturn(this, (does_not_include.__proto__ || Object.getPrototypeOf(does_not_include)).apply(this, arguments));
    }

    _createClass(does_not_include, [{
      key: "apply",
      value: function apply(list, thing) {
        return "!" + list + ".includes(" + thing + ")";
      }
    }]);

    return does_not_include;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 11,
  syntax: ">",
  constructor: function (_Rule$Symbols) {
    _inherits(gt, _Rule$Symbols);

    function gt() {
      _classCallCheck(this, gt);

      return _possibleConstructorReturn(this, (gt.__proto__ || Object.getPrototypeOf(gt)).apply(this, arguments));
    }

    _createClass(gt, [{
      key: "apply",
      value: function apply(a, b) {
        return "(" + a + " > " + b + ")";
      }
    }]);

    return gt;
  }(_Rule2.default.Symbols)
}, {
  name: "infix_operator",
  precedence: 11,
  syntax: "is greater than",
  constructor: function (_Rule$Keywords13) {
    _inherits(is_gt, _Rule$Keywords13);

    function is_gt() {
      _classCallCheck(this, is_gt);

      return _possibleConstructorReturn(this, (is_gt.__proto__ || Object.getPrototypeOf(is_gt)).apply(this, arguments));
    }

    _createClass(is_gt, [{
      key: "apply",
      value: function apply(a, b) {
        return "(" + a + " > " + b + ")";
      }
    }]);

    return is_gt;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 11,
  syntax: ">=",
  constructor: function (_Rule$Symbols2) {
    _inherits(gte, _Rule$Symbols2);

    function gte() {
      _classCallCheck(this, gte);

      return _possibleConstructorReturn(this, (gte.__proto__ || Object.getPrototypeOf(gte)).apply(this, arguments));
    }

    _createClass(gte, [{
      key: "apply",
      value: function apply(a, b) {
        return "(" + a + " >= " + b + ")";
      }
    }]);

    return gte;
  }(_Rule2.default.Symbols)
}, {
  name: "infix_operator",
  precedence: 11,
  syntax: "is greater than or equal to",
  constructor: function (_Rule$Keywords14) {
    _inherits(is_gte, _Rule$Keywords14);

    function is_gte() {
      _classCallCheck(this, is_gte);

      return _possibleConstructorReturn(this, (is_gte.__proto__ || Object.getPrototypeOf(is_gte)).apply(this, arguments));
    }

    _createClass(is_gte, [{
      key: "apply",
      value: function apply(a, b) {
        return "(" + a + " >= " + b + ")";
      }
    }]);

    return is_gte;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 11,
  syntax: "<",
  constructor: function (_Rule$Symbols3) {
    _inherits(lt, _Rule$Symbols3);

    function lt() {
      _classCallCheck(this, lt);

      return _possibleConstructorReturn(this, (lt.__proto__ || Object.getPrototypeOf(lt)).apply(this, arguments));
    }

    _createClass(lt, [{
      key: "apply",
      value: function apply(a, b) {
        return "(" + a + " < " + b + ")";
      }
    }]);

    return lt;
  }(_Rule2.default.Symbols)
}, {
  name: "infix_operator",
  precedence: 11,
  syntax: "is less than",
  constructor: function (_Rule$Keywords15) {
    _inherits(is_lt, _Rule$Keywords15);

    function is_lt() {
      _classCallCheck(this, is_lt);

      return _possibleConstructorReturn(this, (is_lt.__proto__ || Object.getPrototypeOf(is_lt)).apply(this, arguments));
    }

    _createClass(is_lt, [{
      key: "apply",
      value: function apply(a, b) {
        return "(" + a + " < " + b + ")";
      }
    }]);

    return is_lt;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 11,
  syntax: "<=",
  constructor: function (_Rule$Symbols4) {
    _inherits(lte, _Rule$Symbols4);

    function lte() {
      _classCallCheck(this, lte);

      return _possibleConstructorReturn(this, (lte.__proto__ || Object.getPrototypeOf(lte)).apply(this, arguments));
    }

    _createClass(lte, [{
      key: "apply",
      value: function apply(a, b) {
        return "(" + a + " <= " + b + ")";
      }
    }]);

    return lte;
  }(_Rule2.default.Symbols)
}, {
  name: "infix_operator",
  precedence: 11,
  syntax: "is less than or equal to",
  constructor: function (_Rule$Keywords16) {
    _inherits(is_lte, _Rule$Keywords16);

    function is_lte() {
      _classCallCheck(this, is_lte);

      return _possibleConstructorReturn(this, (is_lte.__proto__ || Object.getPrototypeOf(is_lte)).apply(this, arguments));
    }

    _createClass(is_lte, [{
      key: "apply",
      value: function apply(a, b) {
        return "(" + a + " <= " + b + ")";
      }
    }]);

    return is_lte;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 13,
  syntax: "\\+",
  constructor: function (_Rule$Symbols5) {
    _inherits(plus, _Rule$Symbols5);

    function plus() {
      _classCallCheck(this, plus);

      return _possibleConstructorReturn(this, (plus.__proto__ || Object.getPrototypeOf(plus)).apply(this, arguments));
    }

    _createClass(plus, [{
      key: "apply",
      value: function apply(a, b) {
        return a + " + " + b;
      }
    }]);

    return plus;
  }(_Rule2.default.Symbols)
}, {
  name: "infix_operator",
  precedence: 13,
  syntax: "plus",
  constructor: function (_Rule$Keywords17) {
    _inherits(plus, _Rule$Keywords17);

    function plus() {
      _classCallCheck(this, plus);

      return _possibleConstructorReturn(this, (plus.__proto__ || Object.getPrototypeOf(plus)).apply(this, arguments));
    }

    _createClass(plus, [{
      key: "apply",
      value: function apply(a, b) {
        return a + " + " + b;
      }
    }]);

    return plus;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 13,
  syntax: "-",
  constructor: function (_Rule$Symbols6) {
    _inherits(minus, _Rule$Symbols6);

    function minus() {
      _classCallCheck(this, minus);

      return _possibleConstructorReturn(this, (minus.__proto__ || Object.getPrototypeOf(minus)).apply(this, arguments));
    }

    _createClass(minus, [{
      key: "apply",
      value: function apply(a, b) {
        return a + " - " + b;
      }
    }]);

    return minus;
  }(_Rule2.default.Symbols)
}, {
  name: "infix_operator",
  precedence: 13,
  syntax: "minus",
  constructor: function (_Rule$Keywords18) {
    _inherits(minus, _Rule$Keywords18);

    function minus() {
      _classCallCheck(this, minus);

      return _possibleConstructorReturn(this, (minus.__proto__ || Object.getPrototypeOf(minus)).apply(this, arguments));
    }

    _createClass(minus, [{
      key: "apply",
      value: function apply(a, b) {
        return a + " - " + b;
      }
    }]);

    return minus;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 14,
  syntax: "\\*",
  constructor: function (_Rule$Symbols7) {
    _inherits(times, _Rule$Symbols7);

    function times() {
      _classCallCheck(this, times);

      return _possibleConstructorReturn(this, (times.__proto__ || Object.getPrototypeOf(times)).apply(this, arguments));
    }

    _createClass(times, [{
      key: "apply",
      value: function apply(a, b) {
        return a + " * " + b;
      }
    }]);

    return times;
  }(_Rule2.default.Symbols)
}, {
  name: "infix_operator",
  precedence: 14,
  syntax: "times",
  constructor: function (_Rule$Keywords19) {
    _inherits(times, _Rule$Keywords19);

    function times() {
      _classCallCheck(this, times);

      return _possibleConstructorReturn(this, (times.__proto__ || Object.getPrototypeOf(times)).apply(this, arguments));
    }

    _createClass(times, [{
      key: "apply",
      value: function apply(a, b) {
        return a + " * " + b;
      }
    }]);

    return times;
  }(_Rule2.default.Keywords)
}, {
  name: "infix_operator",
  precedence: 14,
  syntax: "/",
  constructor: function (_Rule$Symbols8) {
    _inherits(divided_by, _Rule$Symbols8);

    function divided_by() {
      _classCallCheck(this, divided_by);

      return _possibleConstructorReturn(this, (divided_by.__proto__ || Object.getPrototypeOf(divided_by)).apply(this, arguments));
    }

    _createClass(divided_by, [{
      key: "apply",
      value: function apply(a, b) {
        return a + " / " + b;
      }
    }]);

    return divided_by;
  }(_Rule2.default.Symbols)
}, {
  name: "infix_operator",
  precedence: 14,
  syntax: "divided by",
  constructor: function (_Rule$Keywords20) {
    _inherits(divided_by, _Rule$Keywords20);

    function divided_by() {
      _classCallCheck(this, divided_by);

      return _possibleConstructorReturn(this, (divided_by.__proto__ || Object.getPrototypeOf(divided_by)).apply(this, arguments));
    }

    _createClass(divided_by, [{
      key: "apply",
      value: function apply(a, b) {
        return a + " / " + b;
      }
    }]);

    return divided_by;
  }(_Rule2.default.Keywords)
},

//TODO:  `+=` etc?  other math functions?


//
//
//## Postifx operators:   `{lhs} <operator>`, e.g. `a is defined`
// NOTE: `operator.apply` MUST return a function which transforms argument (`lhs`) into JS output.

{
  name: "postfix_operator_expression",
  alias: "expression",
  syntax: "{expression} {operator:postfix_operator}",
  leftRecursive: true,
  testRule: "postfix_operator",
  constructor: function (_Rule$Sequence2) {
    _inherits(postfix_operator_expresion, _Rule$Sequence2);

    function postfix_operator_expresion() {
      _classCallCheck(this, postfix_operator_expresion);

      return _possibleConstructorReturn(this, (postfix_operator_expresion.__proto__ || Object.getPrototypeOf(postfix_operator_expresion)).apply(this, arguments));
    }

    _createClass(postfix_operator_expresion, [{
      key: "toSource",
      value: function toSource() {
        var _results2 = this.results,
            expression = _results2.expression,
            operator = _results2.operator;

        return operator.apply(expression.toSource());
      }
    }]);

    return postfix_operator_expresion;
  }(_Rule2.default.Sequence)
}, {
  name: "postfix_operator",
  syntax: "is defined",
  constructor: function (_Rule$Keywords21) {
    _inherits(is_defined, _Rule$Keywords21);

    function is_defined() {
      _classCallCheck(this, is_defined);

      return _possibleConstructorReturn(this, (is_defined.__proto__ || Object.getPrototypeOf(is_defined)).apply(this, arguments));
    }

    _createClass(is_defined, [{
      key: "apply",
      value: function apply(thing) {
        return "(typeof " + thing + " !== 'undefined')";
      }
    }]);

    return is_defined;
  }(_Rule2.default.Keywords)
}, {
  name: "postfix_operator",
  syntax: ["is undefined", "is not defined"],
  constructor: function (_Rule$Keywords22) {
    _inherits(is_undefined, _Rule$Keywords22);

    function is_undefined() {
      _classCallCheck(this, is_undefined);

      return _possibleConstructorReturn(this, (is_undefined.__proto__ || Object.getPrototypeOf(is_undefined)).apply(this, arguments));
    }

    _createClass(is_undefined, [{
      key: "apply",
      value: function apply(thing) {
        return "(typeof " + thing + " === 'undefined')";
      }
    }]);

    return is_undefined;
  }(_Rule2.default.Keywords)
},

//TODO: `spell.isEmpty(thing)`
{
  name: "postfix_operator",
  syntax: "is empty",
  constructor: function (_Rule$Keywords23) {
    _inherits(is_empty, _Rule$Keywords23);

    function is_empty() {
      _classCallCheck(this, is_empty);

      return _possibleConstructorReturn(this, (is_empty.__proto__ || Object.getPrototypeOf(is_empty)).apply(this, arguments));
    }

    _createClass(is_empty, [{
      key: "apply",
      value: function apply(thing) {
        return "spell.isEmpty(" + thing + ")";
      }
    }]);

    return is_empty;
  }(_Rule2.default.Keywords)
}, {
  name: "postfix_operator",
  syntax: "is not empty",
  constructor: function (_Rule$Keywords24) {
    _inherits(is_not_empty, _Rule$Keywords24);

    function is_not_empty() {
      _classCallCheck(this, is_not_empty);

      return _possibleConstructorReturn(this, (is_not_empty.__proto__ || Object.getPrototypeOf(is_not_empty)).apply(this, arguments));
    }

    _createClass(is_not_empty, [{
      key: "apply",
      value: function apply(thing) {
        return "!spell.isEmpty(" + thing + ")";
      }
    }]);

    return is_not_empty;
  }(_Rule2.default.Keywords)
});

/***/ }),

/***/ 489:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Parser = __webpack_require__(31);

var _Parser2 = _interopRequireDefault(_Parser);

var _Rule = __webpack_require__(87);

var _Rule2 = _interopRequireDefault(_Rule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //
//	# Rules for creating variables, property access, etc
//

// Create "statements" parser.
var parser = _Parser2.default.forName("statements");
exports.default = parser;


parser.defineRules(
//
//	## Returns
//

// Return a value
//TESTME
{
  name: "return_statement",
  alias: "statement",
  syntax: "return {expression}",
  constructor: function (_Rule$Sequence) {
    _inherits(return_statement, _Rule$Sequence);

    function return_statement() {
      _classCallCheck(this, return_statement);

      return _possibleConstructorReturn(this, (return_statement.__proto__ || Object.getPrototypeOf(return_statement)).apply(this, arguments));
    }

    _createClass(return_statement, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource = this.getMatchedSource(),
            expression = _getMatchedSource.expression;

        return "return " + expression;
      }
    }]);

    return return_statement;
  }(_Rule2.default.Sequence)
},

//
//	## Assignment
//

//TESTME
//TODO: distinguish between `new_identifier` and `scoped_identifier`
{
  name: "assignment",
  alias: ["statement", "mutatesScope"],
  syntax: ["{thing:expression} = {value:expression}", "set {thing:expression} to {value:expression}", "put {value:expression} into {thing:expression}"],
  constructor: function (_Rule$Sequence2) {
    _inherits(assignment, _Rule$Sequence2);

    function assignment() {
      _classCallCheck(this, assignment);

      return _possibleConstructorReturn(this, (assignment.__proto__ || Object.getPrototypeOf(assignment)).apply(this, arguments));
    }

    _createClass(assignment, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource2 = this.getMatchedSource(),
            thing = _getMatchedSource2.thing,
            value = _getMatchedSource2.value;
        // TODO: declare identifier if not in scope, etc


        return thing + " = " + value;
      }
    }]);

    return assignment;
  }(_Rule2.default.Sequence)
},

//TESTME
// TODO: `it` may not already be defined... ???
{
  name: "get_value",
  alias: ["statement", "mutatesScope"],
  syntax: "get {value:expression}",
  constructor: function (_Rule$Sequence3) {
    _inherits(get_value, _Rule$Sequence3);

    function get_value() {
      _classCallCheck(this, get_value);

      return _possibleConstructorReturn(this, (get_value.__proto__ || Object.getPrototypeOf(get_value)).apply(this, arguments));
    }

    _createClass(get_value, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource3 = this.getMatchedSource(),
            value = _getMatchedSource3.value;

        ;
        return "it = " + value;
      }
    }]);

    return get_value;
  }(_Rule2.default.Sequence)
},

//
//	## User interaction
// TODO: move into another file
//

// Alert a message.
// TODO: need some fancy promise juju here?
//TESTME
{
  name: "alert",
  alias: "statement",
  syntax: "alert {message:expression} (?:with {okButton:text})?",
  constructor: function (_Rule$Sequence4) {
    _inherits(alert, _Rule$Sequence4);

    function alert() {
      _classCallCheck(this, alert);

      return _possibleConstructorReturn(this, (alert.__proto__ || Object.getPrototypeOf(alert)).apply(this, arguments));
    }

    _createClass(alert, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource4 = this.getMatchedSource(),
            message = _getMatchedSource4.message,
            _getMatchedSource4$ok = _getMatchedSource4.okButton,
            okButton = _getMatchedSource4$ok === undefined ? "\"OK\"" : _getMatchedSource4$ok;

        return "await spell.alert(" + message + ", " + okButton + ")";
      }
    }]);

    return alert;
  }(_Rule2.default.Sequence)
},

// Warning message -- like alert but fancier.
// TODO: need some fancy promise juju here?
//TESTME
{
  name: "warn",
  alias: "statement",
  syntax: "warn {expression:expression} (?:with {okButton:text})?",
  constructor: function (_Rule$Sequence5) {
    _inherits(warn, _Rule$Sequence5);

    function warn() {
      _classCallCheck(this, warn);

      return _possibleConstructorReturn(this, (warn.__proto__ || Object.getPrototypeOf(warn)).apply(this, arguments));
    }

    _createClass(warn, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource5 = this.getMatchedSource(),
            message = _getMatchedSource5.message,
            _getMatchedSource5$ok = _getMatchedSource5.okButton,
            okButton = _getMatchedSource5$ok === undefined ? "\"OK\"" : _getMatchedSource5$ok;

        return "await spell.warn(" + message + ", " + okButton + ")";
      }
    }]);

    return warn;
  }(_Rule2.default.Sequence)
},

// Confirm message -- present a question with two answers.
// TODO: need some fancy promise juju here?
//TESTME
{
  name: "confirm",
  alias: "statement",
  syntax: "confirm {message:expression} (?:with {okButton:text} (?: (and|or) {cancelButton:text})? )?",
  constructor: function (_Rule$Sequence6) {
    _inherits(confirm, _Rule$Sequence6);

    function confirm() {
      _classCallCheck(this, confirm);

      return _possibleConstructorReturn(this, (confirm.__proto__ || Object.getPrototypeOf(confirm)).apply(this, arguments));
    }

    _createClass(confirm, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource6 = this.getMatchedSource(),
            message = _getMatchedSource6.message,
            _getMatchedSource6$ok = _getMatchedSource6.okButton,
            okButton = _getMatchedSource6$ok === undefined ? "\"OK\"" : _getMatchedSource6$ok,
            _getMatchedSource6$ca = _getMatchedSource6.cancelButton,
            cancelButton = _getMatchedSource6$ca === undefined ? "\"Cancel\"" : _getMatchedSource6$ca;

        return "await spell.confirm(" + message + ", " + okButton + ", " + cancelButton + ")";
      }
    }]);

    return confirm;
  }(_Rule2.default.Sequence)
});

/***/ }),

/***/ 490:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Parser = __webpack_require__(31);

var _Parser2 = _interopRequireDefault(_Parser);

var _Rule = __webpack_require__(87);

var _Rule2 = _interopRequireDefault(_Rule);

var _global = __webpack_require__(162);

var _global2 = _interopRequireDefault(_global);

var _string = __webpack_require__(107);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //
//	# Rules for defining classes (known as `types`)
//

//TODO: constructor
// TODO: mixins / traits / composed classes / annotations

exports.default = _Parser2.default.forName("types").defineRules({
  name: "define_type",
  alias: ["statement", "mutatesScope"],
  syntax: "define type {name:type} (?:as (a|an) {superType:type})?",
  constructor: function (_Rule$BlockStatement) {
    _inherits(define_type, _Rule$BlockStatement);

    function define_type() {
      _classCallCheck(this, define_type);

      return _possibleConstructorReturn(this, (define_type.__proto__ || Object.getPrototypeOf(define_type)).apply(this, arguments));
    }

    _createClass(define_type, [{
      key: "toStructure",

      // Return a logical representation of the data structure
      value: function toStructure() {
        var structure = _get(define_type.prototype.__proto__ || Object.getPrototypeOf(define_type.prototype), "toStructure", this).call(this);
        structure.type = "class";
        return structure;
      }
    }, {
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource = this.getMatchedSource(),
            name = _getMatchedSource.name,
            superType = _getMatchedSource.superType,
            block = _getMatchedSource.block;

        var output = "class " + name;
        if (superType) output += " extends " + superType;
        output += " " + _Rule2.default.Block.encloseStatements(block);
        return output;
      }
    }]);

    return define_type;
  }(_Rule2.default.BlockStatement)
},

// `new` or `create`
// This works as an expression OR a statement.
// NOTE: we assume that all types take an object of properties????
{
  name: "new_thing",
  alias: ["expression", "statement"],
  syntax: "(create|new) {type} (?:with {props:object_literal_properties})?",
  constructor: function (_Rule$Sequence) {
    _inherits(new_thing, _Rule$Sequence);

    function new_thing() {
      _classCallCheck(this, new_thing);

      return _possibleConstructorReturn(this, (new_thing.__proto__ || Object.getPrototypeOf(new_thing)).apply(this, arguments));
    }

    _createClass(new_thing, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource2 = this.getMatchedSource(),
            type = _getMatchedSource2.type,
            _getMatchedSource2$pr = _getMatchedSource2.props,
            props = _getMatchedSource2$pr === undefined ? "" : _getMatchedSource2$pr;
        // Special case for object, which we'll create with an object literal.


        if (type === "Object") {
          if (!props) return "{}";
          return props;
        }

        return "new " + type + "(" + props + ")";
      }
    }]);

    return new_thing;
  }(_Rule2.default.Sequence)
},

// Declare instance method or normal function.
{
  name: "declare_method",
  alias: ["statement", "mutatesScope"],
  syntax: "(operator:to|on) {name:identifier} {args}? (\\:)? {statement}?",
  constructor: function (_Rule$BlockStatement2) {
    _inherits(declare_method, _Rule$BlockStatement2);

    function declare_method() {
      _classCallCheck(this, declare_method);

      return _possibleConstructorReturn(this, (declare_method.__proto__ || Object.getPrototypeOf(declare_method)).apply(this, arguments));
    }

    _createClass(declare_method, [{
      key: "toStructure",

      // Return a logical representation of the data structure
      value: function toStructure() {
        var _getMatchedSource3 = this.getMatchedSource(),
            operator = _getMatchedSource3.operator,
            name = _getMatchedSource3.name,
            _getMatchedSource3$ar = _getMatchedSource3.args,
            args = _getMatchedSource3$ar === undefined ? [] : _getMatchedSource3$ar;

        var subType = operator === "to" ? "method" : "event";
        return { type: "function", subType: subType, name: name, args: args };
      }
    }, {
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource4 = this.getMatchedSource(),
            name = _getMatchedSource4.name,
            _getMatchedSource4$ar = _getMatchedSource4.args,
            args = _getMatchedSource4$ar === undefined ? [] : _getMatchedSource4$ar,
            statement = _getMatchedSource4.statement,
            block = _getMatchedSource4.block;

        var output = name + "(" + args.join(", ") + ") ";
        output += _Rule2.default.Block.encloseStatements(statement, block);
        return output;
      }
    }]);

    return declare_method;
  }(_Rule2.default.BlockStatement)
},

// Declare "action", which can be called globally and affects the parser.
// TODO: `with` clause (will conflict with `word`)
// TODO: install in parser somehow
// TODO: create instance function?  or maybe we don't need it:
//			`action turn Card over` for an instance is just `turn me over`
//			`action add card to deck` => `add me to deck`
//TESTME
{
  name: "declare_action",
  alias: ["statement", "mutatesScope"],
  syntax: "action (keywords:{word}|{type})+ (\\:)? {statement}?",
  constructor: function (_Rule$BlockStatement3) {
    _inherits(declare_action, _Rule$BlockStatement3);

    function declare_action() {
      _classCallCheck(this, declare_action);

      return _possibleConstructorReturn(this, (declare_action.__proto__ || Object.getPrototypeOf(declare_action)).apply(this, arguments));
    }

    _createClass(declare_action, [{
      key: "getMatchedSource",

      // Add `name`, `args` and `types` to matched source
      value: function getMatchedSource() {
        var output = _get(declare_action.prototype.__proto__ || Object.getPrototypeOf(declare_action.prototype), "getMatchedSource", this).call(this);

        // if there's only one keyword, it can't be a blacklisted identifier or a type
        var keywords = output.keywords;

        var keywordMatches = this.results.keywords.matched;
        if (keywords.length === 1) {
          var keyword = keywords[0];
          if (keywordMatches[0] instanceof _Rule2.default.Type) {
            console.error("parse('declare_action'): one-word actions may not be types: " + keyword);
          }

          // HACK: `global.parser` is a hack here for convenience in testing...
          //           let parser = (context && context.parser) || global.parser;
          //           let blacklist = parser.getBlacklist("identifier");
          //           if (blacklist[keyword]) {
          //             console.error(`parse('declare_action'): one-word actions may not be blacklisted identifiers": ${keyword}`);
          //           }
        }

        // figure out arguments and/or types
        output.args = [];
        output.types = {};

        // if any of the words are types (capital letter) make that an argument of the same name.
        keywordMatches.map(function (item, index) {
          if (item instanceof _Rule2.default.Type) {
            var Type = keywords[index];
            var type = Type.toLowerCase();

            output.types[type] = Type;
            output.args.push(type);

            // replace with lowercase in method name
            keywords[index] = type;
          }
        });
        // get static method name and arguments for output
        output.name = keywords.join("_");
        return output;
      }
    }, {
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource5 = this.getMatchedSource(),
            name = _getMatchedSource5.name,
            _getMatchedSource5$ar = _getMatchedSource5.args,
            args = _getMatchedSource5$ar === undefined ? [] : _getMatchedSource5$ar,
            types = _getMatchedSource5.types,
            statement = _getMatchedSource5.statement,
            block = _getMatchedSource5.block;

        // figure out if there are any conditions due to known argument types


        var conditions = [];
        for (var arg in types) {
          conditions.push("\tif (!spell.isA(" + arg + ", " + types[arg] + ")) return undefined");
        }

        var statements = _Rule2.default.Block.encloseStatements(conditions, statement, block);

        // Create as a STATIC function
        //TODO: create as an instance function we can call on ourself!
        return "static " + name + "(" + args.join(", ") + ") " + statements;
      }
    }, {
      key: "toStructure",
      value: function toStructure() {
        var _getMatchedSource6 = this.getMatchedSource(),
            name = _getMatchedSource6.name,
            args = _getMatchedSource6.args,
            types = _getMatchedSource6.types;

        return { type: "function", subType: "action", name: name, args: args, types: types };
      }
    }]);

    return declare_action;
  }(_Rule2.default.BlockStatement)
},

// Getter either with or without arguments.
// If you specify arguments, yields a normal function which returns a value.
// TODO: `to get...` ?
{
  name: "getter",
  alias: ["statement", "mutatesScope"],
  syntax: "get {name:identifier}\\: {expression}?",
  constructor: function (_Rule$BlockStatement4) {
    _inherits(getter, _Rule$BlockStatement4);

    function getter() {
      _classCallCheck(this, getter);

      return _possibleConstructorReturn(this, (getter.__proto__ || Object.getPrototypeOf(getter)).apply(this, arguments));
    }

    _createClass(getter, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource7 = this.getMatchedSource(),
            name = _getMatchedSource7.name,
            expression = _getMatchedSource7.expression,
            block = _getMatchedSource7.block;
        // If they specified an inline-expression, prepend return


        if (expression && !expression.startsWith("return ")) expression = "return (" + expression + ")";
        var output = "get " + name + "() ";
        output += _Rule2.default.Block.encloseStatements(expression, block);
        return output;
      }

      // Return a logical representation of the data structure

    }, {
      key: "toStructure",
      value: function toStructure() {
        var _getMatchedSource8 = this.getMatchedSource(),
            name = _getMatchedSource8.name;

        return { type: "property", subType: "getter", name: name };
      }
    }]);

    return getter;
  }(_Rule2.default.BlockStatement)
},

// Setter.
// Complains if you specify more than one argument.
// If you don't pass an explicit argument, we'll assume it's the same as the identifier.
// eg;	`set color: set the color of my text to color`
//
// TODO: internal getter/setter semantics ala objective C
//			`set color: if color is in ["red", "blue"] then set my color to color`
//		 => `my color` within setter should automatically translate to `this._color` ???
// TODO: `to set...` ?
{
  name: "setter",
  alias: ["statement", "mutatesScope"],
  syntax: "set {name:identifier} {args}? (\\:)? {statement}?",
  constructor: function (_Rule$BlockStatement5) {
    _inherits(setter, _Rule$BlockStatement5);

    function setter() {
      _classCallCheck(this, setter);

      return _possibleConstructorReturn(this, (setter.__proto__ || Object.getPrototypeOf(setter)).apply(this, arguments));
    }

    _createClass(setter, [{
      key: "toSource",
      value: function toSource() {
        // default args to the setter name
        var _getMatchedSource9 = this.getMatchedSource(),
            name = _getMatchedSource9.name,
            _getMatchedSource9$ar = _getMatchedSource9.args,
            args = _getMatchedSource9$ar === undefined ? [name] : _getMatchedSource9$ar,
            statement = _getMatchedSource9.statement,
            block = _getMatchedSource9.block;
        // Complain if more than one argument


        if (args && args.length > 1) {
          console.warn("parse('setter'): only one argument allowed in setter:  ", this.matchedText);
          args = [args[0]];
        }
        var output = "set " + name + "(" + args + ") ";
        output += _Rule2.default.Block.encloseStatements(statement, block);
        return output;
      }

      // Return a logical representation of the data structure

    }, {
      key: "toStructure",
      value: function toStructure() {
        var _getMatchedSource10 = this.getMatchedSource(),
            name = _getMatchedSource10.name;

        return { type: "property", subType: "setter", name: name };
      }
    }]);

    return setter;
  }(_Rule2.default.BlockStatement)
},

//
//	declare properties
//

//TODO: another name for `constant` ?
{
  name: "declare_property",
  alias: ["statement", "mutatesScope"],
  syntax: "(scope:property|constant|shared property) {name:identifier} (?:= {value:expression})?",
  constructor: function (_Rule$Sequence2) {
    _inherits(declare_property, _Rule$Sequence2);

    function declare_property() {
      _classCallCheck(this, declare_property);

      return _possibleConstructorReturn(this, (declare_property.__proto__ || Object.getPrototypeOf(declare_property)).apply(this, arguments));
    }

    _createClass(declare_property, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource11 = this.getMatchedSource(),
            scope = _getMatchedSource11.scope,
            name = _getMatchedSource11.name,
            _getMatchedSource11$v = _getMatchedSource11.value,
            value = _getMatchedSource11$v === undefined ? "" : _getMatchedSource11$v;

        if (value) value = " = " + value;

        var declaration = "" + name + value;
        switch (scope) {
          case "constant":
            //            if (!value) console.warn("parse('declare_property'): constant properties must declare a value:  ", this.matchedText);
            return "const " + declaration;

          case "shared property":
            return "@proto " + declaration;

          case "property":
          default:
            return declaration;
        }
      }

      // Return a logical representation of the data structure

    }, {
      key: "toStructure",
      value: function toStructure() {
        var _getMatchedSource12 = this.getMatchedSource(),
            scope = _getMatchedSource12.scope,
            name = _getMatchedSource12.name;

        return { type: "property", name: name, scope: scope };
      }
    }]);

    return declare_property;
  }(_Rule2.default.Sequence)
},

// TODO: scope_modifier???
// TODO: initial value
{
  name: "declare_property_of_type",
  alias: ["statement", "mutatesScope"],
  syntax: "property {name:identifier} as (a|an)? {type}",
  constructor: function (_Rule$Sequence3) {
    _inherits(declare_property_of_type, _Rule$Sequence3);

    function declare_property_of_type() {
      _classCallCheck(this, declare_property_of_type);

      return _possibleConstructorReturn(this, (declare_property_of_type.__proto__ || Object.getPrototypeOf(declare_property_of_type)).apply(this, arguments));
    }

    _createClass(declare_property_of_type, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource13 = this.getMatchedSource(),
            name = _getMatchedSource13.name,
            type = _getMatchedSource13.type;

        return "get " + name + "() { return this.__" + name + " }\n" + ("set " + name + "(value) { if (spell.isA(value, " + type + ") this.__" + name + " = value }");
      }

      // Return a logical representation of the data structure

    }, {
      key: "toStructure",
      value: function toStructure() {
        var _getMatchedSource14 = this.getMatchedSource(),
            name = _getMatchedSource14.name,
            type = _getMatchedSource14.type;

        return { type: "property", subType: "setter", name: name, dataType: type };
      }
    }]);

    return declare_property_of_type;
  }(_Rule2.default.Sequence)
},

// TODO: warn on invalid set?  shared?  undefined? something other than the first value as default?
{
  name: "declare_property_as_one_of",
  alias: ["statement", "mutatesScope"],
  syntax: "property {name:identifier} as one of {list:literal_list}",
  constructor: function (_Rule$Sequence4) {
    _inherits(declare_property_as_one_of, _Rule$Sequence4);

    function declare_property_as_one_of() {
      _classCallCheck(this, declare_property_as_one_of);

      return _possibleConstructorReturn(this, (declare_property_as_one_of.__proto__ || Object.getPrototypeOf(declare_property_as_one_of)).apply(this, arguments));
    }

    _createClass(declare_property_as_one_of, [{
      key: "getMatchedSource",
      value: function getMatchedSource() {
        var output = _get(declare_property_as_one_of.prototype.__proto__ || Object.getPrototypeOf(declare_property_as_one_of.prototype), "getMatchedSource", this).call(this);
        output.plural = (0, _string.pluralize)(output.name);
        return output;
      }
    }, {
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource15 = this.getMatchedSource(),
            name = _getMatchedSource15.name,
            plural = _getMatchedSource15.plural,
            list = _getMatchedSource15.list;

        return "@proto " + plural + " = " + list + "\n" + ("get " + name + "() { return this.__" + name + " === undefined ? this." + plural + "[0] : this.__" + name + " }\n") + ("set " + name + "(value) { if (this." + plural + ".includes(value)) this.__" + name + " = value }");

        // MORE EFFICIENT BUT UGLIER
        // 			return `static ${plural} = ${list};\n`
        // 				 + `get ${name} { return ("__${name}" in this ? this.__${name} : ${firstValue}) }\n`
        // 				 + `set ${name}(value) { if (this.constructor.${plural}.includes(value)) this.__${name} = value }`;
      }

      // Return a logical representation of the data structure

    }, {
      key: "toStructure",
      value: function toStructure() {
        var _getMatchedSource16 = this.getMatchedSource(),
            name = _getMatchedSource16.name,
            plural = _getMatchedSource16.plural;

        return [{ type: "property", name: name }, { type: "property", subType: "shared", name: plural }];
      }
    }]);

    return declare_property_as_one_of;
  }(_Rule2.default.Sequence)
},

//
//	Self-reference
//
{
  name: "me",
  alias: "expression",
  syntax: "me",
  constructor: function (_Rule$Keywords) {
    _inherits(me, _Rule$Keywords);

    function me() {
      _classCallCheck(this, me);

      return _possibleConstructorReturn(this, (me.__proto__ || Object.getPrototypeOf(me)).apply(this, arguments));
    }

    _createClass(me, [{
      key: "toSource",
      value: function toSource() {
        return "this";
      }
    }]);

    return me;
  }(_Rule2.default.Keywords)
},

// TODO: this really makes me want to make `I am empty` etc work...
{
  name: "I",
  alias: "expression",
  syntax: "I",
  constructor: function (_Rule$Keywords2) {
    _inherits(I, _Rule$Keywords2);

    function I() {
      _classCallCheck(this, I);

      return _possibleConstructorReturn(this, (I.__proto__ || Object.getPrototypeOf(I)).apply(this, arguments));
    }

    _createClass(I, [{
      key: "toSource",
      value: function toSource() {
        return "this";
      }
    }]);

    return I;
  }(_Rule2.default.Keywords)
},

//
//	Property access
//

{
  name: "property_expression",
  alias: "expression",
  syntax: "(properties:the {identifier} of)+ the? {expression}",
  constructor: function (_Rule$Sequence5) {
    _inherits(property_expression, _Rule$Sequence5);

    function property_expression() {
      _classCallCheck(this, property_expression);

      return _possibleConstructorReturn(this, (property_expression.__proto__ || Object.getPrototypeOf(property_expression)).apply(this, arguments));
    }

    _createClass(property_expression, [{
      key: "getMatchedSource",
      value: function getMatchedSource() {
        var _results = this.results,
            expression = _results.expression,
            properties = _results.properties;

        return {
          expression: expression.toSource(),
          properties: properties.matched.map(function (property) {
            return property.results.identifier.toSource();
          })
        };
      }
    }, {
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource17 = this.getMatchedSource(),
            expression = _getMatchedSource17.expression,
            properties = _getMatchedSource17.properties;

        properties = properties.reverse().join(".");
        return expression + "." + properties;
        // NOTE: the following is safer, but ugly for demo purposes
        //			return `spell.get(${expression}, ['${properties}'])`;
      }
    }]);

    return property_expression;
  }(_Rule2.default.Sequence)
}, {
  name: "my_property_expression",
  alias: "expression",
  syntax: "(my|this) {identifier}",
  constructor: function (_Rule$Sequence6) {
    _inherits(my_property_expression, _Rule$Sequence6);

    function my_property_expression() {
      _classCallCheck(this, my_property_expression);

      return _possibleConstructorReturn(this, (my_property_expression.__proto__ || Object.getPrototypeOf(my_property_expression)).apply(this, arguments));
    }

    _createClass(my_property_expression, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource18 = this.getMatchedSource(),
            identifier = _getMatchedSource18.identifier;

        return "this." + identifier;
      }
    }]);

    return my_property_expression;
  }(_Rule2.default.Sequence)
},

//
//	Utility
//


// Properties clause: creates an object with one or more property values.
//	`foo = 1, bar = 2`
//TODO: would like to use `and` but that will barf on expressions...
//TODO: how to do properties on multiple lines?
{
  name: "object_literal_properties",
  syntax: "[({key:identifier}(?:= {value:expression})?) ,]",
  constructor: function (_Rule$List) {
    _inherits(object_literal_properties, _Rule$List);

    function object_literal_properties() {
      _classCallCheck(this, object_literal_properties);

      return _possibleConstructorReturn(this, (object_literal_properties.__proto__ || Object.getPrototypeOf(object_literal_properties)).apply(this, arguments));
    }

    _createClass(object_literal_properties, [{
      key: "toSource",
      value: function toSource() {
        var props = this.results.matched.map(function (prop) {
          var _prop$results = prop.results,
              key = _prop$results.key,
              value = _prop$results.value;

          key = key.toSource();
          value = value && value.toSource();
          if (value) return "\"" + key + "\": " + value;
          return key;
        });
        return "{ " + props.join(", ") + " }";
      }
    }]);

    return object_literal_properties;
  }(_Rule2.default.List)
},

//MOVE TO `functions`?
// Arguments clause for methods
//	`with foo` or `with foo and bar and baz`
//TODO: {identifier} = {expression}	=> requires `,` instead of `and`
//TODO: `with foo as Type`
//TODO:	`with foo...` for splat?
{
  name: "args",
  syntax: "with [args:{identifier} ,]",
  constructor: function (_Rule$Sequence7) {
    _inherits(args, _Rule$Sequence7);

    function args() {
      _classCallCheck(this, args);

      return _possibleConstructorReturn(this, (args.__proto__ || Object.getPrototypeOf(args)).apply(this, arguments));
    }

    _createClass(args, [{
      key: "toSource",

      // Returns an array of argument values
      value: function toSource() {
        return this.results.args.matched.map(function (arg) {
          return arg.matched;
        });
      }
    }]);

    return args;
  }(_Rule2.default.Sequence)
});

/***/ }),

/***/ 502:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(567);
__webpack_require__(566);
module.exports = __webpack_require__(91).Symbol;


/***/ }),

/***/ 547:
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),

/***/ 548:
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(93);
var toLength = __webpack_require__(564);
var toAbsoluteIndex = __webpack_require__(563);
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),

/***/ 549:
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__(179);
var TAG = __webpack_require__(95)('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),

/***/ 550:
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(547);
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),

/***/ 551:
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),

/***/ 552:
/***/ (function(module, exports, __webpack_require__) {

// all enumerable object keys, includes symbols
var getKeys = __webpack_require__(183);
var gOPS = __webpack_require__(282);
var pIE = __webpack_require__(184);
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};


/***/ }),

/***/ 553:
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(48);
var core = __webpack_require__(91);
var hide = __webpack_require__(181);
var redefine = __webpack_require__(186);
var ctx = __webpack_require__(550);
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),

/***/ 554:
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__(48).document;
module.exports = document && document.documentElement;


/***/ }),

/***/ 555:
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(179);
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),

/***/ 556:
/***/ (function(module, exports, __webpack_require__) {

// 7.2.2 IsArray(argument)
var cof = __webpack_require__(179);
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};


/***/ }),

/***/ 557:
/***/ (function(module, exports, __webpack_require__) {

var META = __webpack_require__(94)('meta');
var isObject = __webpack_require__(92);
var has = __webpack_require__(73);
var setDesc = __webpack_require__(74).f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !__webpack_require__(115)(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};


/***/ }),

/***/ 558:
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__(114);
var dPs = __webpack_require__(559);
var enumBugKeys = __webpack_require__(180);
var IE_PROTO = __webpack_require__(284)('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__(279)('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__(554).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),

/***/ 559:
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(74);
var anObject = __webpack_require__(114);
var getKeys = __webpack_require__(183);

module.exports = __webpack_require__(72) ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),

/***/ 560:
/***/ (function(module, exports, __webpack_require__) {

var pIE = __webpack_require__(184);
var createDesc = __webpack_require__(185);
var toIObject = __webpack_require__(93);
var toPrimitive = __webpack_require__(188);
var has = __webpack_require__(73);
var IE8_DOM_DEFINE = __webpack_require__(280);
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = __webpack_require__(72) ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};


/***/ }),

/***/ 561:
/***/ (function(module, exports, __webpack_require__) {

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = __webpack_require__(93);
var gOPN = __webpack_require__(281).f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};


/***/ }),

/***/ 562:
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__(74).f;
var has = __webpack_require__(73);
var TAG = __webpack_require__(95)('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),

/***/ 563:
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(285);
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),

/***/ 564:
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(285);
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),

/***/ 565:
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(48);
var core = __webpack_require__(91);
var LIBRARY = __webpack_require__(182);
var wksExt = __webpack_require__(286);
var defineProperty = __webpack_require__(74).f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};


/***/ }),

/***/ 566:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 19.1.3.6 Object.prototype.toString()
var classof = __webpack_require__(549);
var test = {};
test[__webpack_require__(95)('toStringTag')] = 'z';
if (test + '' != '[object z]') {
  __webpack_require__(186)(Object.prototype, 'toString', function toString() {
    return '[object ' + classof(this) + ']';
  }, true);
}


/***/ }),

/***/ 567:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// ECMAScript 6 symbols shim
var global = __webpack_require__(48);
var has = __webpack_require__(73);
var DESCRIPTORS = __webpack_require__(72);
var $export = __webpack_require__(553);
var redefine = __webpack_require__(186);
var META = __webpack_require__(557).KEY;
var $fails = __webpack_require__(115);
var shared = __webpack_require__(187);
var setToStringTag = __webpack_require__(562);
var uid = __webpack_require__(94);
var wks = __webpack_require__(95);
var wksExt = __webpack_require__(286);
var wksDefine = __webpack_require__(565);
var enumKeys = __webpack_require__(552);
var isArray = __webpack_require__(556);
var anObject = __webpack_require__(114);
var isObject = __webpack_require__(92);
var toIObject = __webpack_require__(93);
var toPrimitive = __webpack_require__(188);
var createDesc = __webpack_require__(185);
var _create = __webpack_require__(558);
var gOPNExt = __webpack_require__(561);
var $GOPD = __webpack_require__(560);
var $DP = __webpack_require__(74);
var $keys = __webpack_require__(183);
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  __webpack_require__(281).f = gOPNExt.f = $getOwnPropertyNames;
  __webpack_require__(184).f = $propertyIsEnumerable;
  __webpack_require__(282).f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !__webpack_require__(182)) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(181)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);


/***/ }),

/***/ 569:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(287)(false);
// imports


// module
exports.push([module.i, ".oak.spacer {\n  position: relative;\n  display: block;\n}\n.oak.spacer.inline {\n  display: inline-block;\n  vertical-align: baseline;\n}\n.oak.spacer.fluid {\n  width: 100%;\n  flex: 1 1 100%;\n}\n.oak.spacer.tiny {\n  width: 2px;\n  height: 2px;\n}\n.oak.spacer.small {\n  width: 4px;\n  height: 4px;\n}\n.oak.spacer.medium {\n  width: 10px;\n  height: 10px;\n}\n.oak.spacer.large {\n  width: 20px;\n  height: 20px;\n}\n.oak.spacer.huge {\n  width: 30px;\n  height: 30px;\n}\n.oak.spacer.massive {\n  width: 50px;\n  height: 50px;\n}\n", ""]);

// exports


/***/ }),

/***/ 570:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(287)(false);
// imports


// module
exports.push([module.i, ".fullWidth {\n  width: 100%;\n}\n.fullHeight {\n  height: 100%;\n}\n.fullSize {\n  width: 100%;\n  height: 100%;\n}\n", ""]);

// exports


/***/ }),

/***/ 66:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _class, _temp;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Parser = __webpack_require__(31);

var _Parser2 = _interopRequireDefault(_Parser);

var _Rule3 = __webpack_require__(87);

var _Rule4 = _interopRequireDefault(_Rule3);

var _Tokenizer = __webpack_require__(89);

var _Tokenizer2 = _interopRequireDefault(_Tokenizer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //
//	# Core `rules` -- simple datatypes, etc.
//
// NOTE: many of the below are created as custom Pattern subclasses for debugging.
//


// Create `core` parser.
var parser = _Parser2.default.forName("core");
exports.default = parser;


parser.defineRules({
  name: "statements",
  constructor: _Rule4.default.Statements
}, {
  name: "comment",
  constructor: _Rule4.default.Comment
},

// `word` = is a single alphanumeric word.
// MUST start with a lower-case letter (?)
{
  name: "word",
  pattern: /^[a-z][\w\-]*$/,
  canonical: "Word",
  constructor: function (_Rule$Pattern) {
    _inherits(word, _Rule$Pattern);

    function word() {
      _classCallCheck(this, word);

      return _possibleConstructorReturn(this, (word.__proto__ || Object.getPrototypeOf(word)).apply(this, arguments));
    }

    _createClass(word, [{
      key: "toSource",

      // Convert "-" to "_" in source output.
      value: function toSource() {
        return this.matched.replace(/\-/g, "_");
      }
    }]);

    return word;
  }(_Rule4.default.Pattern)
},

// `identifier` = variables or property name.
// MUST start with a lower-case letter (?)
// NOTE: We blacklist a lot of words as identifiers.
{
  name: "identifier",
  alias: "expression",
  canonical: "Idenfifier",
  pattern: /^[a-z][\w\-]*$/,
  constructor: function (_Rule$Pattern2) {
    _inherits(identifier, _Rule$Pattern2);

    function identifier() {
      _classCallCheck(this, identifier);

      return _possibleConstructorReturn(this, (identifier.__proto__ || Object.getPrototypeOf(identifier)).apply(this, arguments));
    }

    _createClass(identifier, [{
      key: "toSource",

      // Convert "-" to "_" in source output.
      value: function toSource() {
        return this.matched.replace(/\-/g, "_");
      }
    }]);

    return identifier;
  }(_Rule4.default.Pattern),
  blacklist: [
  // Add English prepositions to identifier blacklist.
  //
  // Wikipedia "Preposition":
  //	"Prepositions...are a class of words that
  //	express spatial or temporal relations  (in, under, towards, before)
  //	or mark various semantic roles (of, for).
  // TESTME
  "about", "above", "after", "and", "as", "at", "before", "behind", "below", "beneath", "beside", "between", "beyond", "by", "defined", "down", "during", "each", "empty", "exactly", "except", "for", "from", "greater", "I", "in", "into", "less", "long", "me", "minus", "more", "near", "not", "of", "off", "on", "onto", "opposite", "or", "out", "outside", "over", "short", "since", "than", "the", "then", "through", "thru", "to", "toward", "towards", "undefined", "under", "underneath", "unique", "until", "up", "upon", "upside", "versus", "vs", "where", "with", "within", "without",

  // Add common english verbs to identifier blacklist.
  "are", "do", "does", "contains", "has", "have", "is", "repeat", "was", "were",

  // Add special control keywords to identifier blacklist.
  "else", "if", "otherwise", "while",

  // Add boolean tokens to identifier blacklist.
  "true", "false", "yes", "no", "ok", "cancel", "success", "failure",

  // Add number words to identifier blacklist.
  // TESTME
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]
},

// `Type` = type name.
// MUST start with an upper-case letter (?)
{
  name: "type",
  alias: "expression",
  canonical: "Type",
  pattern: /^([A-Z][\w\-]*|list|text|number|integer|decimal|character|boolean|object)$/,
  constructor: function (_Rule$Pattern3) {
    _inherits(type, _Rule$Pattern3);

    function type() {
      _classCallCheck(this, type);

      return _possibleConstructorReturn(this, (type.__proto__ || Object.getPrototypeOf(type)).apply(this, arguments));
    }

    _createClass(type, [{
      key: "toSource",

      // Convert "-" to "_" in source output.
      value: function toSource() {
        var type = this.matched;
        switch (type) {
          // Alias `List` to `Array`
          case "List":
            return "Array";

          // special case to take the following as lowercase
          case "list":
            return "Array";
          case "text":
            return "String";
          case "character":
            return "Character";
          case "number":
            return "Number";
          case "integer":
            return "Integer";
          case "decimal":
            return "Decimal";
          case "boolean":
            return "Boolean";
          case "object":
            return "Object";
          default:
            return type.replace(/\-/g, "_");
        }
      }
    }]);

    return type;
  }(_Rule4.default.Pattern),
  blacklist: ["I"]
},

// Boolean literal, created with custom constructor for debugging.
// TODO: better name for this???
{
  name: "boolean",
  alias: "expression",
  canonical: "Boolean",
  pattern: /^(true|false|yes|no|ok|cancel|success|failure)$/,
  constructor: function (_Rule$Pattern4) {
    _inherits(boolean, _Rule$Pattern4);

    function boolean() {
      _classCallCheck(this, boolean);

      return _possibleConstructorReturn(this, (boolean.__proto__ || Object.getPrototypeOf(boolean)).apply(this, arguments));
    }

    _createClass(boolean, [{
      key: "toSource",
      value: function toSource() {
        switch (this.matched) {
          case "true":
          case "yes":
          case "ok":
          case "success":
            return true;

          default:
            return false;
        }
      }
    }]);

    return boolean;
  }(_Rule4.default.Pattern)
},

// `number` as either float or integer, created with custom constructor for debugging.
// NOTE: you can also use `one`...`ten` as strings.'
// TODO:  `integer` and `decimal`?  too techy?
{
  name: "number",
  alias: "expression",
  canonical: "Number",
  constructor: (_temp = _class = function (_Rule) {
    _inherits(number, _Rule);

    function number() {
      _classCallCheck(this, number);

      return _possibleConstructorReturn(this, (number.__proto__ || Object.getPrototypeOf(number)).apply(this, arguments));
    }

    _createClass(number, [{
      key: "parse",


      // Numbers get encoded as numbers in the token stream.
      value: function parse(parser, tokens) {
        var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        var token = tokens[start];
        // if a string, attempt to run through our NUMBER_NAMES
        if (typeof token === "string") token = _Rule4.default.Number.NUMBER_NAMES[token];
        if (typeof token !== "number") return undefined;
        return this.clone({
          matched: token,
          nextStart: start + 1
        });
      }

      // Convert to number on source output.

      // Special words you can use as numbers...

    }, {
      key: "toSource",
      value: function toSource() {
        return this.matched;
      }
    }]);

    return number;
  }(_Rule4.default), _class.NUMBER_NAMES = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10 }, _temp)
},

// Literal `text` string, created with custom constructor for debugging.
// You can use either single or double quotes on the outside (although double quotes are preferred).
// Returned value has enclosing quotes.
{
  name: "text",
  alias: "expression",
  canonical: "Text",
  constructor: function (_Rule2) {
    _inherits(text, _Rule2);

    function text() {
      _classCallCheck(this, text);

      return _possibleConstructorReturn(this, (text.__proto__ || Object.getPrototypeOf(text)).apply(this, arguments));
    }

    _createClass(text, [{
      key: "parse",

      // Text strings get encoded as `text` objects in the token stream.
      value: function parse(parser, tokens) {
        var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        var token = tokens[start];
        if (!(token instanceof _Tokenizer2.default.Text)) return undefined;
        return this.clone({
          matched: token.quotedString,
          nextStart: start + 1
        });
      }
    }, {
      key: "toSource",
      value: function toSource() {
        return this.matched;
      }
    }]);

    return text;
  }(_Rule4.default)
},

// Literal list (array), eg:  `[1,2 , true,false ]`
{
  name: "literal_list",
  alias: "expression",
  syntax: "\\[[list:{expression},]?\\]",
  constructor: function (_Rule$Sequence) {
    _inherits(literal_list, _Rule$Sequence);

    function literal_list() {
      _classCallCheck(this, literal_list);

      return _possibleConstructorReturn(this, (literal_list.__proto__ || Object.getPrototypeOf(literal_list)).apply(this, arguments));
    }

    _createClass(literal_list, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource = this.getMatchedSource(),
            list = _getMatchedSource.list;

        return "[" + (list ? list.join(", ") : "") + "]";
      }
    }]);

    return literal_list;
  }(_Rule4.default.Sequence)
},

// Parenthesized expression
//TESTME
{
  name: "parenthesized_expression",
  alias: "expression",
  syntax: "\\({expression}\\)",
  constructor: function (_Rule$Sequence2) {
    _inherits(parenthesized_expression, _Rule$Sequence2);

    function parenthesized_expression() {
      _classCallCheck(this, parenthesized_expression);

      return _possibleConstructorReturn(this, (parenthesized_expression.__proto__ || Object.getPrototypeOf(parenthesized_expression)).apply(this, arguments));
    }

    _createClass(parenthesized_expression, [{
      key: "toSource",
      value: function toSource() {
        var _getMatchedSource2 = this.getMatchedSource(),
            expression = _getMatchedSource2.expression;
        // don't double parens if not necessary


        if (typeof expression === "string" && expression.startsWith("(") && expression.endsWith(")")) return expression;
        return "(" + expression + ")";
      }
    }]);

    return parenthesized_expression;
  }(_Rule4.default.Sequence)
});

/***/ }),

/***/ 72:
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(115)(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ 73:
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),

/***/ 74:
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(114);
var IE8_DOM_DEFINE = __webpack_require__(280);
var toPrimitive = __webpack_require__(188);
var dP = Object.defineProperty;

exports.f = __webpack_require__(72) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ 770:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var ReactPropTypesSecret = __webpack_require__(220);

function emptyFunction() {}

module.exports = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      // It is still safe when called from React.
      return;
    }
    var err = new Error(
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    );
    err.name = 'Invariant Violation';
    throw err;
  };
  shim.isRequired = shim;
  function getShim() {
    return shim;
  };
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim,
    exact: getShim
  };

  ReactPropTypes.checkPropTypes = emptyFunction;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};


/***/ }),

/***/ 841:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__store__ = __webpack_require__(149);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__event_handlers__ = __webpack_require__(381);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__lib_keys__ = __webpack_require__(148);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @module componentWrapper
 *
 */






/**
 * componentWrapper
 *
 * @access public
 * @param {object} WrappedComponent React component class to be wrapped
 * @param {array} [keys] The key(s) bound to the class
 * @return {object} The higher-order function that wraps the decorated class
 */
function componentWrapper(WrappedComponent) {
  var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : __WEBPACK_IMPORTED_MODULE_3__lib_keys__["b" /* ALL_KEYS */];

  var KeyBoardHelper = function (_React$Component) {
    _inherits(KeyBoardHelper, _React$Component);

    function KeyBoardHelper(props) {
      _classCallCheck(this, KeyBoardHelper);

      var _this = _possibleConstructorReturn(this, (KeyBoardHelper.__proto__ || Object.getPrototypeOf(KeyBoardHelper)).call(this, props));

      _this.state = {
        event: null
      };
      return _this;
    }

    _createClass(KeyBoardHelper, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__event_handlers__["a" /* onMount */])(this);
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__event_handlers__["b" /* onUnmount */])(this);
      }
    }, {
      key: 'handleKeyDown',
      value: function handleKeyDown(event) {
        var _this2 = this;

        // to simulate a keypress, set the event and then clear it in the callback
        this.setState({ event: event }, function () {
          return _this2.setState({ event: null });
        });
      }
    }, {
      key: 'render',
      value: function render() {
        return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(WrappedComponent, _extends({}, this.props, { keydown: this.state }));
      }
    }]);

    return KeyBoardHelper;
  }(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

  __WEBPACK_IMPORTED_MODULE_1__store__["a" /* setBinding */]({ keys: [].concat(keys), fn: KeyBoardHelper.prototype.handleKeyDown, target: KeyBoardHelper.prototype });

  return KeyBoardHelper;
}

/* harmony default export */ __webpack_exports__["a"] = (componentWrapper);

/***/ }),

/***/ 842:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return keydownScoped; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__class_decorator__ = __webpack_require__(841);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__method_decorator__ = __webpack_require__(843);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__method_decorator_scoped__ = __webpack_require__(844);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * @module decorators
 *
 */




/**
 * noopDecorator
 *
 * @access private
 * @return {undefined} Returns `undefined` so that the original undecorated instance/method is used
 */
function noopDecorator() {
  return undefined;
}

/**
 * _decorator
 *
 * @access private
 * @param {Function} methodFn The method wrapper to delegate to, based on whether user has specified a scoped decorator or not
 * @param {Array} ...args Remainder of arguments passed in
 * @return {Function} The decorated class or method
 */
function _decorator(methodFn) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  // check the first argument to see if it's a user-supplied keycode or array
  // of keycodes, or if it's the wrapped class or method
  var testArg = args[0];
  var isArray = Array.isArray(testArg);

  // if the test argument is not an object or function, it is user-supplied
  // keycodes. else there are no arguments and it's just the wrapped class
  if (isArray || ~['string', 'number', 'symbol'].indexOf(typeof testArg === 'undefined' ? 'undefined' : _typeof(testArg))) {
    var keys = isArray ? testArg : args;

    // return the decorator function, which on the next call will look for
    // the presence of a method name to determine if this is a wrapped method
    // or component
    return function (target, methodName, descriptor) {
      return methodName ? methodFn({ target: target, descriptor: descriptor, keys: keys }) : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__class_decorator__["a" /* default */])(target, keys);
    };
  } else {
    var WrappedComponent = args[0];
    var methodName = args[1];

    // method decorators without keycode (which) arguments are not allowed.
    if (WrappedComponent && !methodName) {
      return __WEBPACK_IMPORTED_MODULE_0__class_decorator__["a" /* default */].apply(undefined, args);
    } else {
      console.warn(methodName + ': Method decorators must have keycode arguments, so the decorator for this method will not do anything');
      return noopDecorator;
    }
  }
}

/**
 * keydownScoped
 *
 * Method decorator that will look for changes to its targeted component's
 * `keydown` props to decide when to trigger, rather than responding directly
 * to keydown events. This lets you specify a @keydown decorated class higher
 * up in the view hierarchy for larger scoping of keydown events, or for
 * programmatically sending keydown events as props into the components in order
 * to trigger decorated methods with matching keys.
 *
 * @access public
 * @param {Array} ...args  All (or no) arguments passed in from decoration
 * @return {Function} The decorated class or method
 */
function keydownScoped() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return _decorator.apply(undefined, [__WEBPACK_IMPORTED_MODULE_2__method_decorator_scoped__["a" /* default */]].concat(args));
}

/**
 * keydown
 *
 * The main decorator and default export, handles both classes and methods.
 *
 * @access public
 * @param {Array} ...args  All (or no) arguments passed in from decoration
 * @return {Function} The decorated class or method
 */
function keydown() {
  for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  return _decorator.apply(undefined, [__WEBPACK_IMPORTED_MODULE_1__method_decorator__["a" /* default */]].concat(args));
}

/* harmony default export */ __webpack_exports__["a"] = (keydown);



/***/ }),

/***/ 843:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__store__ = __webpack_require__(149);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__event_handlers__ = __webpack_require__(381);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * @module methodWrapper
 *
 */



/**
 * _isReactKeyDown
 *
 * @access private
 * @param {object} event The possibly synthetic event passed as an argument with
 * the method invocation.
 * @return {boolean}
 */
function _isReactKeyDown(event) {
  return event && (typeof event === 'undefined' ? 'undefined' : _typeof(event)) === 'object' && event.nativeEvent instanceof window.KeyboardEvent && event.type === 'keydown';
}

/**
 * methodWrapper
 *
 * @access public
 * @param {object} args All arguments necessary for wrapping method
 * @param {object} args.target The decorated class
 * @param {object} args.descriptor Method descriptor
 * @param {array} args.keys The array of keys bound to the given method
 * @return {object} The method descriptor
 */
function methodWrapper(_ref) {
  var target = _ref.target,
      descriptor = _ref.descriptor,
      keys = _ref.keys;


  var fn = descriptor.value;

  // if we haven't already created a binding for this class (via another
  // decorated method), wrap these lifecycle methods.
  if (!__WEBPACK_IMPORTED_MODULE_0__store__["b" /* getBinding */](target)) {
    var componentDidMount = target.componentDidMount,
        componentWillUnmount = target.componentWillUnmount;


    target.componentDidMount = function () {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__event_handlers__["a" /* onMount */])(this);
      if (componentDidMount) return componentDidMount.call(this);
    };

    target.componentWillUnmount = function () {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__event_handlers__["b" /* onUnmount */])(this);
      if (componentWillUnmount) return componentWillUnmount.call(this);
    };
  }

  // add this binding of keys and method to the target's bindings
  __WEBPACK_IMPORTED_MODULE_0__store__["a" /* setBinding */]({ keys: keys, target: target, fn: fn });

  descriptor.value = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var maybeEvent = args[0];

    if (_isReactKeyDown(maybeEvent)) {
      // proxy method in order to use @keydown as filter for keydown events coming
      // from an actual onKeyDown binding (as identified by react's addition of
      // 'nativeEvent' + type === 'keydown')
      if (!maybeEvent.ctrlKey) {
        // we already whitelist shortcuts with ctrl modifiers so if we were to
        // fire it again here the method would trigger twice. see https://github.com/glortho/react-keydown/issues/38
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__event_handlers__["c" /* _onKeyDown */])(maybeEvent, true);
      }
    } else if (!maybeEvent || !(maybeEvent instanceof window.KeyboardEvent) || maybeEvent.type !== 'keydown') {
      // if our first argument is a keydown event it is being handled by our
      // binding system. if it's anything else, just pass through.
      return fn.call.apply(fn, [this].concat(args));
    }
  };

  return descriptor;
}

/* harmony default export */ __webpack_exports__["a"] = (methodWrapper);

/***/ }),

/***/ 844:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lib_match_keys__ = __webpack_require__(382);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lib_parse_keys__ = __webpack_require__(383);
/**
 * @module methodWrapperScoped
 *
 */



/**
 * methodWrapperScoped
 *
 * @access public
 * @param {object} args All args necessary for decorating the method
 * @param {object} args.target The decorated method's class object
 * @param {object} args.descriptor The method's descriptor object
 * @param {array} args.keys The key codes bound to the decorated method
 * @return {object} The method's descriptor object
 */
function methodWrapperScoped(_ref) {
  var target = _ref.target,
      descriptor = _ref.descriptor,
      keys = _ref.keys;
  var componentWillReceiveProps = target.componentWillReceiveProps;

  var fn = descriptor.value;
  if (!keys) {
    console.warn(fn + ': keydownScoped requires one or more keys');
  } else {

    /**
     * _shouldTrigger
     *
     * @access private
     * @param {object} thisProps Exsting props from the wrapped component
     * @param {object} thisProps.keydown The namespaced state from the higher-order
     * component (class_decorator)
     * @param {object} nextProps The incoming props from the wrapped component
     * @param {object} nextProps.keydown The namescaped state from the higher-order
     * component (class_decorator)
     * @param {array} keys The keys bound to the decorated method
     * @return {boolean} Whether all tests have passed
     */
    var _shouldTrigger = function _shouldTrigger(keydownThis, keydownNext) {
      if (!(keydownNext && keydownNext.event && !keydownThis.event)) return false;

      return keySets.some(function (keySet) {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__lib_match_keys__["a" /* default */])({ keySet: keySet, event: keydownNext.event });
      });
    };

    // wrap the component's lifecycle method to intercept key codes coming down
    // from the wrapped/scoped component up the view hierarchy. if new keydown
    // event has arrived and the key codes match what was specified in the
    // decorator, call the wrapped method.


    var keySets = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__lib_parse_keys__["a" /* default */])(keys);target.componentWillReceiveProps = function (nextProps) {
      var keydownNext = nextProps.keydown;
      var keydownThis = this.props.keydown;


      if (_shouldTrigger(keydownThis, keydownNext)) {
        return fn.call(this, keydownNext.event);
      }

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (componentWillReceiveProps) return componentWillReceiveProps.call.apply(componentWillReceiveProps, [this, nextProps].concat(args));
    };
  }

  return descriptor;
}

/* harmony default export */ __webpack_exports__["a"] = (methodWrapperScoped);

/***/ }),

/***/ 845:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lib_array_from__ = __webpack_require__(846);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lib_array_from___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__lib_array_from__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__decorators__ = __webpack_require__(842);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return __WEBPACK_IMPORTED_MODULE_1__decorators__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "keydownScoped", function() { return __WEBPACK_IMPORTED_MODULE_1__decorators__["b"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__store__ = __webpack_require__(149);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "setBinding", function() { return __WEBPACK_IMPORTED_MODULE_2__store__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__lib_keys__ = __webpack_require__(148);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Keys", function() { return __WEBPACK_IMPORTED_MODULE_3__lib_keys__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "ALL_KEYS", function() { return __WEBPACK_IMPORTED_MODULE_3__lib_keys__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "ALL_PRINTABLE_KEYS", function() { return __WEBPACK_IMPORTED_MODULE_3__lib_keys__["c"]; });
// polyfill array.from (mainly for IE)


// @keydown and @keydownScoped


// setBinding - only useful if you're not going to use decorators


// Keys - use this to find key codes for strings. for example: Keys.j, Keys.enter


/***/ }),

/***/ 846:
/***/ (function(module, exports) {

// Production steps of ECMA-262, Edition 6, 22.1.2.1
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
if (!Array.from) {
  Array.from = function () {
    var toStr = Object.prototype.toString;
    var isCallable = function isCallable(fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function toInteger(value) {
      var number = Number(value);
      if (isNaN(number)) {
        return 0;
      }
      if (number === 0 || !isFinite(number)) {
        return number;
      }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function toLength(value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike /*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method 
      // of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }();
}

/***/ }),

/***/ 847:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react_dom__ = __webpack_require__(65);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react_dom___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react_dom__);
/**
 * @module domHelpers
 *
 */


var focusableSelector = 'a[href], button, input, object, select, textarea, [tabindex]';

/**
 * bindFocusables: Find any focusable child elements of the component instance and
 * add an onFocus handler to focus our keydown handlers on the parent component
 * when user keys applies focus to the element.
 *
 * NOTE: One limitation of this right now is that if you tab out of the
 * component, _focusedInstance will still be set until next click or mount or
 * controlled focus.
 *
 * @access public
 * @param {object} instance The key-bound component instance
 * @param {callback} activateOnFocus The fn to fire when element is focused
 */
function bindFocusables(instance, activateOnFocus) {
  if (document.querySelectorAll) {
    try {
      var node = __WEBPACK_IMPORTED_MODULE_0_react_dom___default.a.findDOMNode(instance);
      if (node) {
        var focusables = node.querySelectorAll(focusableSelector);
        if (focusables.length) {
          var onFocus = function onFocus(element) {
            var onFocusPrev = element.onfocus;
            return function (event) {
              activateOnFocus(instance);
              if (onFocusPrev) onFocusPrev.call(element, event);
            };
          };
          Array.prototype.slice.call(focusables).forEach(function (element) {
            return element.onfocus = onFocus(element);
          });
        }
      }
    } catch (error) {
      // noop, mostly suppressing error here https://github.com/glortho/react-keydown/issues/76
    }
  }
}

/**
 * findContainerNodes: Called by our click handler to find instances with nodes
 * that are equal to or that contain the click target. Any that pass this test
 * will be recipients of the next keydown event.
 *
 * @access public
 * @param {object} target The click event.target DOM element
 * @return {function} Reducer function
 */
function findContainerNodes(target) {
  return function (memo, instance) {
    try {
      var node = __WEBPACK_IMPORTED_MODULE_0_react_dom___default.a.findDOMNode(instance);
      if (node && (node === target || node.contains(target))) {
        memo.push({ instance: instance, node: node });
      }
    } finally {
      return memo;
    }
  };
}

/**
 * sortByDOMPosition: Called by our click handler to sort a list of instances
 * according to least -> most nested. This is so that if multiple keybound
 * instances have nodes that are ancestors of the click target, they will be
 * sorted to let the instance closest to the click target get first dibs on the
 * next key down event.
 */
function sortByDOMPosition(a, b) {
  return a.node.compareDocumentPosition(b.node) === 10 ? 1 : -1;
}

/* harmony default export */ __webpack_exports__["a"] = ({ bindFocusables: bindFocusables, findContainerNodes: findContainerNodes, sortByDOMPosition: sortByDOMPosition });

/***/ }),

/***/ 848:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @module Listeners
 *
 */

// flag for whether click listener has been bound to document
var _clicksBound = false;

// flag for whether keydown listener has been bound to document
var _keysBound = false;

var Listeners = {
  /**
   * _bindKeys
   *
   * @access public
   */
  bindKeys: function bindKeys(callback) {
    if (!_keysBound) {
      document.addEventListener('keydown', callback);
      _keysBound = true;
    }
  },


  /**
   * unbindKeys
   *
   * @access public
   */
  unbindKeys: function unbindKeys(callback) {
    if (_keysBound) {
      document.removeEventListener('keydown', callback);
      _keysBound = false;
    }
  },


  /**
   * bindClicks
   *
   * @access public
   */
  bindClicks: function bindClicks(callback) {
    if (!_clicksBound) {
      document.addEventListener('click', callback, true);
      _clicksBound = true;
    }
  },


  /**
   * unbindClicks
   *
   * @access public
   */
  unbindClicks: function unbindClicks(callback) {
    if (_clicksBound) {
      document.removeEventListener('click', callback, true);
      _clicksBound = false;
    }
  }
};

/* harmony default export */ __webpack_exports__["a"] = (Listeners);

/***/ }),

/***/ 849:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = uuid;
// Counter being incremented. JS is single-threaded, so it'll Just Work™.
var __counter = 1;

/**
 * Returns a process-wide unique identifier.
 */
function uuid() {
  return "uid-" + __counter++;
}

/***/ }),

/***/ 87:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //	# Parser Rules
//	Rules can be as simple as a string `Keyword` or a complex sequence of (nested) rules.
//
//	Parse a rule with `rule.parse(parser, tokens, start, end)`, this will either:
//		- return `undefined` if the rule doesn't match the head of the tokens, or
//		- return a CLONE of the matched rule with at least the following:
//			- `matched`		Results of your parse.
//			- `nextStart`	Place where next match should start (eg: one beyond what you matched).
//
//	The clone returned above can be manipulated with
//		- `rule.results`			Return matched arguments in a format suitable to do:
//		- `rule.toSource()`	Return javascript source to interpret the rule.
//


var _Parser = __webpack_require__(31);

var _Parser2 = _interopRequireDefault(_Parser);

var _Tokenizer = __webpack_require__(89);

var _Tokenizer2 = _interopRequireDefault(_Tokenizer);

var _global = __webpack_require__(162);

var _global2 = _interopRequireDefault(_global);

var _string = __webpack_require__(107);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Abstract Rule class.
// TODOC
var Rule = function () {
	function Rule() {
		_classCallCheck(this, Rule);

		for (var _len = arguments.length, props = Array(_len), _key = 0; _key < _len; _key++) {
			props[_key] = arguments[_key];
		}

		Object.assign.apply(Object, [this].concat(props));
	}

	// Clone this rule and add any `props` passed in.


	_createClass(Rule, [{
		key: "clone",
		value: function clone(props) {
			return new this.constructor(this, props);
		}

		//
		//	Parsing primitives -- you MUST implement these in your subclasses!
		//

		// Attempt to match this rule between `start` and `end` of `tokens`.
		// Returns results of the parse or `undefined`.

	}, {
		key: "parse",
		value: function parse(parser, tokens) {
			var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var end = arguments[3];
			var stack = arguments[4];

			return undefined;
		}

		// Test to see if bits of our rule are found ANYWHERE between `start` and `end` in the `tokens`.
		// This is used by complicated (eg: left recursive) rules to exit quickly if there's no chance.
		// Returns:
		//	- `true` if the rule MIGHT be matched.
		//	- `false` if there is NO WAY the rule can be matched.
		//	- `undefined` if not determinstic (eg: no way to tell quickly).

	}, {
		key: "test",
		value: function test(parser, tokens) {
			var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var end = arguments[3];

			return undefined;
		}

		//
		// ## output as source
		//

		// Output value for this INSTANTIATED rule as source.

	}, {
		key: "toSource",
		value: function toSource() {
			return this.matched;
		}

		//
		// ## output as structure:
		//

	}, {
		key: "toStructure",
		value: function toStructure() {
			return undefined;
		}
	}]);

	return Rule;
}();

// Abstract rule for one or more sequential literal values to match.
// `rule.literals` is the literal string or array of literal strings to match.
// `rule.literalSeparator` is the string to put between multiple literals when joining.
//
// After parsing
//  `rule.matched` will be the string which was matched
//  `rule.nextStart` is the index of the next start token


exports.default = Rule;
Rule.Literals = function (_Rule) {
	_inherits(literals, _Rule);

	function literals() {
		var _ref;

		_classCallCheck(this, literals);

		for (var _len2 = arguments.length, props = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			props[_key2] = arguments[_key2];
		}

		// coerce to an array (a bit slower but cleaner).
		var _this = _possibleConstructorReturn(this, (_ref = literals.__proto__ || Object.getPrototypeOf(literals)).call.apply(_ref, [this].concat(props)));

		if (!Array.isArray(_this.literals)) _this.literals = [_this.literals];
		return _this;
	}

	// Attempt to match this rule in the `tokens`.
	// Returns results of the parse or `undefined`.


	_createClass(literals, [{
		key: "parse",
		value: function parse(parser, tokens) {
			var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var end = arguments[3];
			var stack = arguments[4];

			if (!this.matchesStartingAt(tokens, start, end)) return undefined;
			return this.clone({
				matched: this.literals.join(this.literalSeparator),
				nextStart: start + this.literals.length
			});
		}

		// Does this match appear ANYWHERE in the tokens?

	}, {
		key: "test",
		value: function test(parser, tokens) {
			var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var end = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : tokens.length;

			var first = this.literals[0];
			for (var index = start; index < end; index++) {
				if (tokens[index] !== first) continue;
				if (this.matchesStartingAt(tokens, index, end)) return true;
			}
			return false;
		}

		// Match our `literals` between `start` and `end` of tokens.

	}, {
		key: "matchesStartingAt",
		value: function matchesStartingAt(tokens) {
			var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
			var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : tokens.length;

			if (this.literals.length === 1) return tokens[start] === this.literals[0];
			return this.literals.every(function (literal, i) {
				return start + i < end && literal === tokens[start + i];
			});
		}
	}, {
		key: "toSource",
		value: function toSource() {
			return this.matched;
		}
	}, {
		key: "toSyntax",
		value: function toSyntax() {
			return "" + this.literals.join(this.literalSeparator || "") + (this.optional ? '?' : '');
		}
	}]);

	return literals;
}(Rule);

// One or more literal symbols: `<`, `%` etc.
// Symbols join WITHOUT spaces.
Rule.Symbols = function (_Rule$Literals) {
	_inherits(symbols, _Rule$Literals);

	function symbols() {
		_classCallCheck(this, symbols);

		return _possibleConstructorReturn(this, (symbols.__proto__ || Object.getPrototypeOf(symbols)).apply(this, arguments));
	}

	return symbols;
}(Rule.Literals);

// One or more literal keywords.
// Keywords join WITH spaces.
Rule.Keywords = function (_Rule$Literals2) {
	_inherits(keywords, _Rule$Literals2);

	function keywords() {
		_classCallCheck(this, keywords);

		return _possibleConstructorReturn(this, (keywords.__proto__ || Object.getPrototypeOf(keywords)).apply(this, arguments));
	}

	return keywords;
}(Rule.Literals);
Object.defineProperty(Rule.Keywords.prototype, "literalSeparator", { value: " " });

// Regex pattern to match a SINGLE token.
// `rule.pattern` is the regular expression to match.
//    Note that you MUST start your pattern with `^` and end with `$` to make sure it matches the entire token.
//    Note that this can only match a single token!
// `rule.blacklist` is a map of `{ key: true }` for strings which will NOT be accepted.
//
// After parsing
//  `rule.matched` will be the string which was matched.
//  `rule.nextStart` is the index of the next start token.
Rule.Pattern = function (_Rule2) {
	_inherits(pattern, _Rule2);

	function pattern() {
		_classCallCheck(this, pattern);

		return _possibleConstructorReturn(this, (pattern.__proto__ || Object.getPrototypeOf(pattern)).apply(this, arguments));
	}

	_createClass(pattern, [{
		key: "parse",

		// Attempt to match this pattern at the beginning of the tokens.
		value: function parse(parser, tokens) {
			var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var end = arguments[3];
			var stack = arguments[4];

			var token = tokens[start];
			if (typeof token !== "string") return undefined;

			var match = token.match(this.pattern);
			if (!match) return undefined;

			// bail if present in blacklist
			var matched = match[0];
			if (this.blacklist && this.blacklist[matched]) return undefined;

			return this.clone({
				matched: matched,
				nextStart: start + 1
			});
		}

		// Test to see if any of our pattern is found ANYWHERE in the tokens.

	}, {
		key: "test",
		value: function test(parser, tokens) {
			var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var end = arguments[3];

			return tokens.slice(start, end).some(function (token) {
				return typeof token === "string" && pattern.test(token);
			});
		}
	}, {
		key: "toSyntax",
		value: function toSyntax() {
			return this.pattern.source;
		}
	}]);

	return pattern;
}(Rule);

// Subrule -- name of another rule to be called.
// `rule.subrule` is the name of the rule in `parser.rules`.
//
// After parsing
//  we'll return the actual rule that was matched (rather than a clone of this rule)
Rule.Subrule = function (_Rule3) {
	_inherits(subrule, _Rule3);

	function subrule() {
		_classCallCheck(this, subrule);

		return _possibleConstructorReturn(this, (subrule.__proto__ || Object.getPrototypeOf(subrule)).apply(this, arguments));
	}

	_createClass(subrule, [{
		key: "parse",
		value: function parse(parser, tokens) {
			var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var end = arguments[3];
			var stack = arguments[4];

			var matchedRule = parser.parseNamedRule(this.subrule, tokens, start, end, stack, "parse subrule '" + this.rule + "'");
			if (!matchedRule) return undefined;
			if (this.argument) matchedRule.argument = this.argument;
			return matchedRule;
		}

		// Ask the subrule to figure out if a match is possible.

	}, {
		key: "test",
		value: function test(parser, tokens) {
			var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var end = arguments[3];

			return parser.test(this.subrule, tokens, start, end);
		}
	}, {
		key: "toSyntax",
		value: function toSyntax() {
			return "{" + (this.argument ? this.argument + ":" : "") + this.subrule + "}" + (this.optional ? '?' : '');
		}
	}]);

	return subrule;
}(Rule);

// Sequence of rules to match.
//  `rule.rules` is the array of rules to match.
//  `rule.leftRecursive` should be `true` if the first non-optional rule in our `rules`
//    may end up calling us again.  In this case, you should provide `rule.testRule`.
//
// After parsing
//  `rule.matched` will be the array of rules which were matched.
//  `rule.nextStart` is the index of the next start token.
Rule.Sequence = function (_Rule4) {
	_inherits(sequence, _Rule4);

	function sequence() {
		_classCallCheck(this, sequence);

		return _possibleConstructorReturn(this, (sequence.__proto__ || Object.getPrototypeOf(sequence)).apply(this, arguments));
	}

	_createClass(sequence, [{
		key: "parse",
		value: function parse(parser, tokens) {
			var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var end = arguments[3];
			var stack = arguments[4];

			// If we have a `testRule` defined
			if (this.testRule) {
				// Forget it if there is NO WAY the rule could be matched.
				if (parser.test(this.testRule, tokens, start) === false) return undefined;
			}

			// If we're a leftRecursive sequence...
			if (this.leftRecursive) {
				// If the stack already contains this rule, forget it.
				if (stack && stack.includes(this)) return undefined;

				// Clone stack and add this rule for recursion...
				stack = stack ? stack.concat() : [];
				stack.push(this);

				// TODO: We could distinguish between productive and unproductive rules
				//		 by checking only rules which occur at the same `start`...
				//		 This would probably allow more interesting things, but it's much much slower.
			}

			var matched = [];
			var nextStart = start;
			var index = 0,
			    rule = undefined;
			while (rule = this.rules[index++]) {
				var match = rule.parse(parser, tokens, nextStart, end, stack);
				if (!match && !rule.optional) return undefined;
				if (match) {
					matched.push(match);
					nextStart = match.nextStart;
				}
			}
			// if we get here, we matched all the rules!
			return this.clone({
				matched: matched,
				nextStart: nextStart
			});
		}

		//TODOC
		// "gather" arguments in preparation to call `toSource()`
		// Only callable after parse is completed.
		// Returns an object with properties from the `matched` array indexed by
		//		- `match.argument`:		argument set when rule was declared, eg: `{value:literal}` => `value`
		//		- `match.ruleName`:		name of rule when defined
		//		- `rule type`:			name of the rule type
		// NOTE: memoizes the results.

	}, {
		key: "_addResults",
		value: function _addResults(results, matched) {
			var index = 0,
			    match = undefined;
			while (match = matched[index++]) {
				if (match.promote) {
					this._addResults(results, match.matched);
				} else {
					var resultName = match.argument || match.group || match.constructor.name;
					// If arg already exists, convert to an array
					if (resultName in results) {
						if (!Array.isArray(results[resultName])) {
							results[resultName] = [results[resultName]];
							//					  results[sourceName] = [results[sourceName]];
						}
						results[resultName].push(match);
						//					results[sourceName].push(source);
					} else {
						results[resultName] = match;
						//					results[sourceName] = source;
					}
				}
			}
			return results;
		}

		// Return `toSource()` for our `results` as a map.
		// If you pass `keys`, we'll restrict to just those keys.

	}, {
		key: "getMatchedSource",
		value: function getMatchedSource() {
			var results = this.results;
			var output = {};
			Object.keys(results).forEach(function (key) {
				var value = results[key];
				if (value.toSource) output[key] = value.toSource();else output[key] = value;
			});
			return output;
		}

		// Echo this rule back out.

	}, {
		key: "toSyntax",
		value: function toSyntax() {
			var rules = this.rules.map(function (rule) {
				return rule.toSyntax();
			});
			return "" + this.rules.join(" ") + (this.optional ? '?' : '');
		}
	}, {
		key: "results",
		get: function get() {
			if (!this.matched) return undefined;
			var results = this._addResults({}, this.matched);
			if (this.comment) results.comment = this.comment;
			return results;
		}
	}]);

	return sequence;
}(Rule);

// Alternative syntax, matching one of a number of different rules.
// The result of a parse is the longest rule that actually matched.
// NOTE: Currently takes the longest valid match.
// TODO: match all valid alternatives
//
// After parsing
//  we'll return the rule which is the "best match" (rather than cloning this rule).
Rule.Alternatives = function (_Rule5) {
	_inherits(alternatives, _Rule5);

	function alternatives() {
		var _ref2;

		_classCallCheck(this, alternatives);

		for (var _len3 = arguments.length, props = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
			props[_key3] = arguments[_key3];
		}

		var _this7 = _possibleConstructorReturn(this, (_ref2 = alternatives.__proto__ || Object.getPrototypeOf(alternatives)).call.apply(_ref2, [this].concat(props)));

		if (!_this7.rules) _this7.rules = [];
		return _this7;
	}

	// Test to see if any of our alternatives are found ANYWHERE in the tokens.
	// NOTE: this should only be called if we're specified as a `testRule`
	//		 and then only if all of our rules are deterministic.


	_createClass(alternatives, [{
		key: "test",
		value: function test(parser, tokens) {
			var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var end = arguments[3];

			var index = 0,
			    rule = undefined;
			while (rule = this.rules[index++]) {
				if (rule.test(parser, tokens, start, end)) return true;
			}
			return false;
		}

		// Find all rules which match and delegate to `getBestMatch()` to pick the best one.

	}, {
		key: "parse",
		value: function parse(parser, tokens) {
			var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var end = arguments[3];
			var stack = arguments[4];

			var matches = [];
			var index = 0,
			    rule = undefined;
			while (rule = this.rules[index++]) {
				var match = rule.parse(parser, tokens, start, end, stack);
				if (match) matches.push(match);
			}

			if (!matches.length) return undefined;

			// uncomment the below to print alternatives
			// if (matches.length > 1) {
			//	console.info(this.argument || this.ruleName, matches, matches.map(match => match.matchedText));
			// }

			var bestMatch = matches.length === 1 ? matches[0] : this.getBestMatch(matches);

			// assign `argName` or `group` for `results`
			if (this.argument) bestMatch.argument = this.argument;else if (this.group) bestMatch.group = this.group;
			//TODO: other things to copy here???

			return bestMatch;
		}

		// Return the "best" match given more than one matches at the head of the tokens.
		// Default is to return the longest match.
		// Implement something else to do, eg, precedence rules.

	}, {
		key: "getBestMatch",
		value: function getBestMatch(matches) {
			return matches.reduce(function (best, current) {
				if (current.nextStart > best.nextStart) return current;
				return best;
			}, matches[0]);
		}
	}, {
		key: "addRule",
		value: function addRule() {
			var _rules;

			(_rules = this.rules).push.apply(_rules, arguments);
		}
	}, {
		key: "toSyntax",
		value: function toSyntax() {
			var rules = this.rules.map(function (rule) {
				return rule.toSyntax();
			}).join("|");
			return "(" + (this.argument ? this.argument + ":" : "") + rules + ")" + (this.optional ? '?' : '');
		}
	}]);

	return alternatives;
}(Rule);

// Repeating rule.
//	`this.repeat` is the rule that repeats.
//  `this.optional` is true if the prodution is optional.
//	Note: Automatically consumes whitespace before rules.
//	Note: Returns `undefined` if we don't match at least once.
//
// After matching:
//	`this.matched` is array of matched rules.
//  `rule.nextStart` is the index of the next start token.
Rule.Repeat = function (_Rule6) {
	_inherits(repeat, _Rule6);

	function repeat() {
		_classCallCheck(this, repeat);

		return _possibleConstructorReturn(this, (repeat.__proto__ || Object.getPrototypeOf(repeat)).apply(this, arguments));
	}

	_createClass(repeat, [{
		key: "parse",
		value: function parse(parser, tokens) {
			var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var end = arguments[3];
			var stack = arguments[4];

			var matched = [];
			var nextStart = start;
			while (true) {
				var match = this.repeat.parse(parser, tokens, nextStart, end, stack);
				if (!match) break;

				matched.push(match);
				nextStart = match.nextStart;
			}

			if (matched.length === 0) return undefined;

			return this.clone({
				matched: matched,
				nextStart: nextStart
			});
		}
	}, {
		key: "toSource",
		value: function toSource() {
			if (!this.matched) return undefined;
			return this.matched.map(function (match) {
				return match.toSource();
			});
		}
	}, {
		key: "toSyntax",
		value: function toSyntax() {
			var isCompoundRule = this.repeat instanceof Rule.Sequence || this.repeat instanceof Rule.Literals && this.repeat.literals.length > 1;
			var repeat = this.repeat.toSyntax();
			var rule = isCompoundRule ? "(" + repeat + ")" : "" + repeat;
			return "" + rule + (this.optional ? '*' : '+');
		}
	}]);

	return repeat;
}(Rule);

// List match rule:   `[<item><delimiter>]`. eg" `[{number},]` to match `1,2,3`
//	`rule.item` is the rule for each item,
//	`rule.delimiter` is the delimiter between each item, which is optional at the end.
//
// After matching:
//	`this.matched` is array of matched rules.
//  `rule.nextStart` is the index of the next start token.
//
// NOTE: we assume that a List rule itself will NOT repeat (????)
Rule.List = function (_Rule7) {
	_inherits(list, _Rule7);

	function list() {
		_classCallCheck(this, list);

		return _possibleConstructorReturn(this, (list.__proto__ || Object.getPrototypeOf(list)).apply(this, arguments));
	}

	_createClass(list, [{
		key: "parse",
		value: function parse(parser, tokens) {
			var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var end = arguments[3];
			var stack = arguments[4];

			// ensure item and delimiter are optional so we don't barf in `parseRule`
			//TODO: ???
			this.item.optional = true;
			this.delimiter.optional = true;

			var matched = [];
			var nextStart = start;
			while (true) {
				// get next item, exiting if not found
				var item = this.item.parse(parser, tokens, nextStart, end, stack);
				if (!item) break;

				matched.push(item);
				nextStart = item.nextStart;

				// get delimiter, exiting if not found
				var delimiter = this.delimiter.parse(parser, tokens, nextStart, end, stack);
				if (!delimiter) break;
				nextStart = delimiter.nextStart;
			}

			// If we didn't get any matches, forget it.
			if (matched.length === 0) return undefined;

			return this.clone({
				matched: matched,
				nextStart: nextStart
			});
		}

		// Returns list of values as source.

	}, {
		key: "toSource",
		value: function toSource() {
			if (!this.matched) return [];
			return this.matched.map(function (match) {
				return match.toSource();
			});
		}
	}, {
		key: "toSyntax",
		value: function toSyntax() {
			var item = this.item.toSyntax();
			var delimiter = this.delimiter.toSyntax();
			return "[" + (this.argument ? this.argument + ":" : "") + item + " " + delimiter + "]" + (this.optional ? '?' : '');
		}
	}]);

	return list;
}(Rule);

// A block is used to parse a nested block of statements.
// Abstract class.
Rule.Block = function (_Rule$Sequence) {
	_inherits(block, _Rule$Sequence);

	function block() {
		_classCallCheck(this, block);

		return _possibleConstructorReturn(this, (block.__proto__ || Object.getPrototypeOf(block)).apply(this, arguments));
	}

	_createClass(block, [{
		key: "parseBlock",


		// Parse the entire `block`, returning results.
		value: function parseBlock(parser, block) {
			var _this11 = this;

			var indent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

			var matched = [];
			//console.warn("block:", block);
			block.contents.forEach(function (item, index) {
				var result = void 0;
				if (item.length === 0) {
					matched.push(new Rule.BlankLine());
				} else if (item instanceof _Tokenizer2.default.Block) {
					var last = matched[matched.length - 1];
					if (last.parseBlock) {
						last.parseBlock(parser, item, indent + 1);
					} else {
						var _block = _this11.parseBlock(parser, item, indent + 1);
						if (_block !== undefined) matched.push(_block);
					}
				} else {
					matched = matched.concat(_this11.parseStatement(parser, item));
				}
			});

			return new Rule.Block({
				indent: indent,
				matched: matched
			});
		}

		// Parse a single statement (a line's worth of `tokens`).
		// Skips whitespace at the beginning of the line.
		// Auto-matches comment in the middle of the line.
		// Returns array of results.

	}, {
		key: "parseStatement",
		value: function parseStatement(parser, tokens) {
			var results = [];
			var start = 0,
			    end = tokens.length;
			var statement = void 0,
			    comment = void 0;

			// check for an indent at the start of the line
			if (tokens[start] instanceof _Tokenizer2.default.Whitespace) start++;

			// check for a comment at the end of the tokens
			if (tokens[end - 1] instanceof _Tokenizer2.default.Comment) {
				comment = parser.parseNamedRule("comment", tokens, end - 1, end, undefined, "parseStatement");
				// add comment FIRST if found
				results.push(comment);
				end--;
			}

			// parse the rest as a "statement"
			statement = parser.parseNamedRule("statement", tokens, start, end, undefined, "parseStatement");
			// complain if no statement and no comment
			if (!statement && !comment) {
				var error = new Rule.StatementParseError({
					unparsed: tokens.slice(start, end).join(" ")
				});
				results.push(error);
			}

			// complain if we can't parse the entire line!
			else if (statement && statement.nextStart !== end) {
					var _error = new Rule.StatementParseError({
						parsed: tokens.slice(start, statement.nextStart).join(" "),
						unparsed: tokens.slice(statement.nextStart, end).join(" ")
					});
					results.push(_error);
				}

				// Otherwise add the statement
				else if (statement) {
						results.push(statement);
					}

			return results;
		}

		// Return source for this block as an array of indented lines WITHOUT `{` OR `}`.

	}, {
		key: "blockToSource",
		value: function blockToSource() {
			var block = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.matched;

			var results = [],
			    statement = void 0;

			for (var i = 0; i < block.length; i++) {
				var match = block[i];
				//console.info(i, match);
				try {
					statement = match.toSource() || "";
				} catch (e) {
					console.error(e);
					console.warn("Error converting block: ", block, "statement:", match);
				}
				//console.info(i, statement);
				if ((0, _string.isWhitespace)(statement)) {
					results.push("");
				} else if (Array.isArray(statement)) {
					results = results.concat(statement);
				} else if (typeof statement === "string") {
					statement = statement.split("\n");
					results = results.concat(statement);
				} else {
					console.warn("blockToSource(): DON'T KNOW HOW TO WORK WITH\n\t", statement, "\n\tfrom match", match);
				}
			}
			if (this.indent !== 0) {
				return "\t" + results.join("\n\t");
			}
			return results.join("\n");
		}
	}, {
		key: "toSource",
		value: function toSource() {
			return " {\n" + this.blockToSource() + "\n" + "}";
		}

		// Convert to logical representation of structure by converting individual statements and grouping
		// NOTE: you should override this and include "type"

	}, {
		key: "toStructure",
		value: function toStructure() {
			var _getMatchedSource = this.getMatchedSource(),
			    name = _getMatchedSource.name,
			    superType = _getMatchedSource.superType;

			var block = this.block && this.block.matched || [];

			var named = {};
			var properties = [];
			var methods = [];
			var other = [];
			block.map(function (statement) {
				return statement.toStructure();
			}).filter(Boolean).forEach(addStructure);

			return {
				type: "unknown",
				name: name,
				superType: superType,
				named: named,
				properties: properties,
				methods: methods,
				other: other
			};

			function addStructure(structure) {
				// add arrays as individual items
				if (Array.isArray(structure)) return structure.forEach(addStructure);

				// add under `named` for quick hit of all significant bits...
				if (structure.name) named[structure.name] = structure;

				// add under 'methods', 'properties' or 'other'
				if (structure.type === "function") methods.push(structure);else if (structure.type === "property") properties.push(structure);else other.push(structure);
			}
		}

		// Format array of `statements` as a JS output block:
		//	- if `statements` is empty, returns `{}`
		//	- if `statements is a single line, returns `{ statement }`
		//	- else returns multiple lines

	}], [{
		key: "encloseStatements",
		value: function encloseStatements() {
			var statements = [];

			for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
				args[_key4] = arguments[_key4];
			}

			for (var i = 0; i < args.length; i++) {
				var arg = args[i];
				if (Array.isArray(arg)) {
					statements = statements.concat(arg);
				} else if (typeof arg === "string") {
					statements.push(arg);
				}
			}
			statements = statements.join("\n");

			if (!statements) return "{}";
			if (!statements.includes("\n") && statements.length < 40) {
				return "{ " + statements.trim() + " }";
			}
			if (statements[0] !== "\t") statements = "\t" + statements;
			return "{\n" + statements + "\n}";
		}
	}]);

	return block;
}(Rule.Sequence);

// `Statements` are a special case for a block of `Statement` rules
//	that understand nesting and comments.
//
// This is a top-level construct, e.g. used to parse an entire file.
Rule.Statements = function (_Rule$Block) {
	_inherits(statements, _Rule$Block);

	function statements() {
		_classCallCheck(this, statements);

		return _possibleConstructorReturn(this, (statements.__proto__ || Object.getPrototypeOf(statements)).apply(this, arguments));
	}

	_createClass(statements, [{
		key: "parse",


		// Split statements up into blocks and parse 'em.
		value: function parse(parser, tokens) {
			var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var end = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : tokens.length;
			var stack = arguments[4];

			var block = _Tokenizer2.default.breakIntoBlocks(tokens, start, end);

			var matched = this.parseBlock(parser, block);
			if (!matched) return undefined;

			return this.clone({
				matched: matched,
				nextStart: end
			});
		}

		// Output statements WITHOUT curly braces around them.

	}, {
		key: "toSource",
		value: function toSource() {
			return this.matched.blockToSource();
		}
	}]);

	return statements;
}(Rule.Block);

// A `BlockStatement` (e.g. an `if` or `repeat`):
//	- is assumed to have an initial partial `statement`
//	- MAY have an inline `statement` (on the same line, possibly after a `:`)
//	- MAY have contents as an embedded `block`
//
//	In your `getMatchedSource()`, `block` will be the resulting block output, if there is one.
//	It's up to your rule to do something with it...
Rule.BlockStatement = function (_Rule$Block2) {
	_inherits(block_statement, _Rule$Block2);

	function block_statement() {
		_classCallCheck(this, block_statement);

		return _possibleConstructorReturn(this, (block_statement.__proto__ || Object.getPrototypeOf(block_statement)).apply(this, arguments));
	}

	_createClass(block_statement, [{
		key: "parseBlock",


		// Parse a block and add it to `this.block`
		value: function parseBlock(parser, block) {
			var indent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

			this.block = _get(block_statement.prototype.__proto__ || Object.getPrototypeOf(block_statement.prototype), "parseBlock", this).apply(this, arguments);
		}

		// Return `toSource()` for our `results` as a map.
		// If you pass `keys`, we'll restrict to just those keys.

	}, {
		key: "getMatchedSource",
		value: function getMatchedSource() {
			var output = _get(block_statement.prototype.__proto__ || Object.getPrototypeOf(block_statement.prototype), "getMatchedSource", this).call(this);
			// add `block` to output if defined.
			if (this.block) {
				output.block = this.block.blockToSource();
			}
			return output;
		}
	}]);

	return block_statement;
}(Rule.Block);

// Blank line representation in parser output.
Rule.BlankLine = function (_Rule8) {
	_inherits(blank_line, _Rule8);

	function blank_line() {
		_classCallCheck(this, blank_line);

		return _possibleConstructorReturn(this, (blank_line.__proto__ || Object.getPrototypeOf(blank_line)).apply(this, arguments));
	}

	_createClass(blank_line, [{
		key: "toSource",
		value: function toSource() {
			return "\n";
		}
	}]);

	return blank_line;
}(Rule);

// Comment rule -- matches tokens of type `Tokenizer.Comment`.
Rule.Comment = function (_Rule9) {
	_inherits(comment, _Rule9);

	function comment() {
		_classCallCheck(this, comment);

		return _possibleConstructorReturn(this, (comment.__proto__ || Object.getPrototypeOf(comment)).apply(this, arguments));
	}

	_createClass(comment, [{
		key: "parse",

		// Comments are special nodes in our token stream.
		value: function parse(parser, tokens) {
			var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var end = arguments[3];
			var stack = arguments[4];

			var token = tokens[start];
			if (!(token instanceof _Tokenizer2.default.Comment)) return undefined;
			return this.clone({
				matched: token,
				nextStart: start + 1
			});
		}
	}, {
		key: "toSource",
		value: function toSource() {
			return "//" + this.matched.whitespace + this.matched.comment;
		}
	}]);

	return comment;
}(Rule);

// Parser error representation in parser output.
Rule.StatementParseError = function (_Rule10) {
	_inherits(parse_error, _Rule10);

	function parse_error() {
		var _ref3;

		_classCallCheck(this, parse_error);

		for (var _len5 = arguments.length, props = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
			props[_key5] = arguments[_key5];
		}

		var _this16 = _possibleConstructorReturn(this, (_ref3 = parse_error.__proto__ || Object.getPrototypeOf(parse_error)).call.apply(_ref3, [this].concat(props)));

		if (_Parser2.default.WARN) console.warn(_this16.message);
		return _this16;
	}

	_createClass(parse_error, [{
		key: "toSource",
		value: function toSource() {
			return "// " + this.message.split("\n").join("\n// ");
		}
	}, {
		key: "message",
		get: function get() {
			if (this.parsed) {
				return "CANT PARSE ENTIRE STATEMENT\n" + "PARSED      : `" + this.parsed + "`\n" + "CAN'T PARSE : `" + this.unparsed + "`";
			}
			return "CAN'T PARSE STATEMENT: `" + this.unparsed + "`";
		}
	}]);

	return parse_error;
}(Rule);

/***/ }),

/***/ 88:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = parseRule;
exports.parseSyntax = parseSyntax;

var _memoize = __webpack_require__(484);

var _Parser = __webpack_require__(31);

var _Parser2 = _interopRequireDefault(_Parser);

var _Rule = __webpack_require__(87);

var _Rule2 = _interopRequireDefault(_Rule);

var _class = __webpack_require__(947);

var _global = __webpack_require__(162);

var _global2 = _interopRequireDefault(_global);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
//	# Parsing `ruleSyntax` to create rules automatically.
//
// TODO:	Better name for `ruleSyntax`
// TODO:	Use keywords in syntax to make a quick regex-based `test` function for the entire rule

//
// ## group: parsing syntax
//

//TODOC
function parseRule(syntax, constructor) {
  // If we got an array of possible syntaxes...
  if (Array.isArray(syntax)) {
    // recursively parse each syntax, using a CLONE of the constructor
    var _rules = syntax.map(function (syntax) {
      return parseRule(syntax, (0, _class.cloneClass)(constructor));
    });
    // return an alternatives with the correct name
    var altClass = (0, _class.cloneClass)(_Rule2.default.Alternatives, constructor.name);
    Object.defineProperty(altClass.prototype, "rules", { value: _rules });
    return new altClass();
  };

  var rules = parseSyntax(syntax, []);
  if (rules.length === 0) {
    throw new SyntaxError("parser.defineRule(" + names[0] + ", " + syntax + "): no rule produced");
  }

  // Make an instance of the rule and add relevant properties to its prototype non-enumerably
  if (constructor.prototype instanceof _Rule2.default.Keywords || constructor.prototype instanceof _Rule2.default.Symbols || constructor.prototype instanceof _Rule2.default.List || constructor.prototype instanceof _Rule2.default.Alternatives) {
    for (var property in rules[0]) {
      Object.defineProperty(constructor.prototype, property, { value: rules[0][property] });
    }
  } else {
    Object.defineProperty(constructor.prototype, "rules", { value: rules });
  }

  return new constructor();
}

function tokeniseRuleSyntax(syntax) {
  var SYNTAX_EXPRESSION = /(?:[\w\-]+|\\[\[\(\{\)\}\]]|[^\s\w]|\|)/g;
  var syntaxStream = syntax.match(SYNTAX_EXPRESSION);
  if (!syntaxStream) throw new SyntaxError("Can't tokenize parse rule syntax >>" + syntax + "<<");
  return syntaxStream;
}

function parseSyntax(syntax) {
  var rules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  if (syntax == null) throw new TypeError("parseSyntax(): `syntax` is required");
  var syntaxStream = typeof syntax === "string" ? tokeniseRuleSyntax(syntax) : syntax;

  var lastIndex = syntaxStream.length;
  while (start < lastIndex) {
    var _parseToken = parseToken(syntaxStream, rules, start),
        _parseToken2 = _slicedToArray(_parseToken, 2),
        rule = _parseToken2[0],
        end = _parseToken2[1];

    if (rule) {
      var last = rules[rules.length - 1];
      // If this is a `Symbol` and last was a `Symbol`, merge together
      if (last && last instanceof _Rule2.default.Symbols && rule instanceof _Rule2.default.Symbols) {
        // remove the last rule
        rules.pop();
        // and replace with a rule that merges the keywords
        rule.literals = last.literals.concat(rule.literals);
      }
      rules.push(rule);
    }
    start = end + 1;
  }
  return rules;
}

var KEYWORD_PATTERN = /[A-Za-z][\w_-]*/;
function parseToken(syntaxStream) {
  var rules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var syntaxToken = syntaxStream[start];

  // if we got a "\\" (which also has to go into the source string as "\\")
  // treat the next token as a literal string rather than as a special character.
  if (syntaxToken === "\\") {
    return parseSymbol(syntaxStream, rules, start + 1);
  }

  switch (syntaxToken) {
    case "{":
      return parseSubrule(syntaxStream, rules, start);
    case "(":
      return parseAlternatives(syntaxStream, rules, start);
    case "[":
      return parseList(syntaxStream, rules, start);
    case "*":
    case "+":
    case "?":
      return parseRepeat(syntaxStream, rules, start);

    // the following should ALWAYS be consumed by the above
    case "}":
    case ")":
    case "]":
    case "|":
      throw new SyntaxError("Unexpected " + syntaxToken + " found as item " + start + " of " + syntaxStream);

    default:
      if (syntaxToken.match(KEYWORD_PATTERN)) {
        return parseKeyword(syntaxStream, rules, start);
      } else {
        return parseSymbol(syntaxStream, rules, start);
      }
  }
}

// Match `keyword` in syntax rules.
// If more than one keyword appears in a row, combines them into a single `Keyword` object.
// This is pretty safe, unless you have an optional keyword like
//		`the {identifier} of the? {expression}`
// in which case you can put the optional keyword in parens
//		`the {identifier} of (the?) {expression}`
//
// Returns `[ rule, end ]`
// Throws if invalid.
function parseKeyword(syntaxStream) {
  var rules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var constructor = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _Rule2.default.Keywords;

  var literals = [],
      end = void 0;
  // eat keywords while they last
  for (var i = start; i < syntaxStream.length; i++) {
    var next = syntaxStream[i];
    if (typeof next === "string" && next.match(KEYWORD_PATTERN)) {
      literals.push(next);
      end = i;
    } else break;
  }

  var rule = new constructor({ literals: literals });
  return [rule, end];
}

// Match `keyword` in syntax rules.
// Returns `[ rule, end ]`
// Throws if invalid.
function parseSymbol(syntaxStream) {
  var rules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var constructor = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _Rule2.default.Symbols;

  var string = syntaxStream[start];
  if (!constructor) constructor = _Rule2.default.Symbols;

  // If string starts with `\\`, it's an escaped literal (eg: `\[` needs to input as `\\[`).
  var isEscaped = string.startsWith("\\");
  var literals = isEscaped ? string.substr(1) : string;

  var rule = new constructor({ literals: literals });

  if (isEscaped) {
    rule.toSyntax = function () {
      return "\\" + literals + (this.optional ? '?' : '');
    };
  }

  return [rule, start];
}

// Match grouping expression `(...|...)` in syntax rules.
// Returns `[ rule, end ]`
// You can specify an explicit `rule.argument` with:  `(somearg:...)`
// You can specify that the results should be `promoted` to enclosing rule with: `(?:...)`
//
// NOTE: nested parens may not have alternatives... :-(   `(a|(b|c))` won't work???
function parseAlternatives(syntaxStream) {
  var rules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var _Parser$findNestedTok = _Parser2.default.findNestedTokens(syntaxStream, "(", ")", start),
      end = _Parser$findNestedTok.end,
      slice = _Parser$findNestedTok.slice;

  // pull out explicit "promote" flag: `?:`


  var promote = slice[0] === "?" && slice[1] === ":";
  if (promote) slice = slice.slice(2);

  // pull out explicit argument name
  var argument = void 0;
  if (slice.length > 2 && slice[1] === ":") {
    argument = slice[0];
    slice = slice.slice(2);
  }

  // split into groups, including nested parens
  var alternatives = groupAlternatives(slice).map(function (group) {
    var results = parseSyntax(group, []);
    if (results.length === 1) {
      return results[0];
    } else {
      return new _Rule2.default.Sequence({ rules: results });
    }
  });

  var rule = alternatives.length === 1 ? alternatives[0] : new _Rule2.default.Alternatives({ rules: alternatives });
  if (argument) rule.argument = argument;
  if (promote) rule.promote = true;
  return [rule, end];

  function groupAlternatives(tokens) {
    var alternatives = [];
    var current = [];
    for (var i = 0, token; token = tokens[i]; i++) {
      // handle alternate marker
      if (token === "|") {
        alternatives.push(current);
        current = [];
      }
      // handle nested parens
      else if (token === "(") {
          var _Parser$findNestedTok2 = _Parser2.default.findNestedTokens(tokens, "(", ")", i),
              _end = _Parser$findNestedTok2.end;

          current = current.concat(tokens.slice(i, _end + 1));
          i = _end;
        } else {
          current.push(token);
        }
    }
    if (current.length) alternatives.push(current);
    return alternatives;
  }
}

// Match repeat indicator `?`, `+` or `*` by attaching it to the previous rule.
function parseRepeat(syntaxStream) {
  var rules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var symbol = syntaxStream[start];
  var rule = rules[rules.length - 1];
  if (!rule) throw new SyntaxError("Can't attach repeat symbol " + symbol + " to empty rule!");

  // Transform last rule into a repeat for `*` and `+`.
  if (symbol === "*" || symbol === "+") {
    var argument = rule.argument;
    rule = new _Rule2.default.Repeat({ repeat: rule });
    if (argument) rule.argument = argument;
    // push into rule stack in place of old rule
    rules[rules.length - 1] = rule;
  }

  // Rule is optional for `?` and `*`.
  if (symbol === "?" || symbol === "*") {
    rule.optional = true;
  }

  return [undefined, start];
}

// Match `{<ruleName>}` in syntax rules.
// Returns `[ rule, end ]`
// Throws if invalid.
function parseSubrule(syntaxStream) {
  var rules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var match = _Parser2.default.findNestedTokens(syntaxStream, "{", "}", start);
  var argument = void 0;
  if (match.slice.length === 3 && match.slice[1] === ":") {
    argument = match.slice[0];
    match.slice = match.slice.slice(2);
  }
  if (match.slice.length > 1) throw new SyntaxError("Can't process rules with more than one rule name: {" + match.slice.join("") + "}");

  var params = { subrule: match.slice[0] };

  // see if there's a `not` rule in there
  var bangPosition = params.subrule.indexOf("!");
  if (bangPosition !== -1) {
    params.not = params.subrule.substr(bangPosition + 1);
    params.subrule = params.subrule.substr(0, bangPosition);
  }

  var rule = new _Rule2.default.Subrule(params);
  if (argument) rule.argument = argument;
  return [rule, match.end];
}

// Match list expression `[<item><delimiter>]` or `[<argument>:<item><delimiter>]` in syntax rules.
// Returns `[ rule, end ]`
// Throws if invalid.
function parseList(syntaxStream) {
  var rules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var constructor = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _Rule2.default.List;

  var _Parser$findNestedTok3 = _Parser2.default.findNestedTokens(syntaxStream, "[", "]", start),
      end = _Parser$findNestedTok3.end,
      slice = _Parser$findNestedTok3.slice;

  // get argument if supplied


  var argument = void 0;
  if (slice.length > 2 && slice[1] === ":") {
    argument = slice[0];
    slice = slice.slice(2);
  }

  var results = parseSyntax(slice, []);
  if (results.length !== 2) {
    throw new SyntaxError("Unexpected stuff at end of list: [" + slice.join(" ") + "]");
  }

  var _results = _slicedToArray(results, 2),
      item = _results[0],
      delimiter = _results[1];

  var rule = new constructor({ item: item, delimiter: delimiter });
  if (argument) rule.argument = argument;
  return [rule, end];
}

/***/ }),

/***/ 89:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _string = __webpack_require__(107);

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// GRRR... node doesn't include this???
// CHECK DIFFERENT NODE VERSIONS...
if (!Array.prototype.includes) {
	Object.defineProperty(Array.prototype, "includes", {
		value: function value(_value, start) {
			var index = this.indexOf(_value, start);
			return index !== -1;
		}
	});
}

// `whitespace` class for normal (non-indent, non-newline) whitespace.

var whitespace = function () {
	function whitespace(_whitespace) {
		_classCallCheck(this, whitespace);

		this.whitespace = _whitespace;
	}

	// Return the "length" of this whitespace, eg for an indent.


	_createClass(whitespace, [{
		key: "toString",
		value: function toString() {
			return this.whitespace;
		}
	}, {
		key: "length",
		get: function get() {
			return this.whitespace.length;
		}
	}]);

	return whitespace;
}();

// `indent` class.


var indent = function (_whitespace2) {
	_inherits(indent, _whitespace2);

	function indent() {
		_classCallCheck(this, indent);

		return _possibleConstructorReturn(this, (indent.__proto__ || Object.getPrototypeOf(indent)).apply(this, arguments));
	}

	return indent;
}(whitespace);

// Newline singleton.


var newline = function (_whitespace3) {
	_inherits(newline, _whitespace3);

	function newline() {
		_classCallCheck(this, newline);

		return _possibleConstructorReturn(this, (newline.__proto__ || Object.getPrototypeOf(newline)).apply(this, arguments));
	}

	return newline;
}(whitespace);

//
//	# Tokenizer
//	- `.tokenize()` 		Breaks up long string into tokens, including newlines, JSX expressions, etc.
//	- `.tokenizeLines()` 	Takes the above and breaks it into an array of arrays for each line.
//
// TODO: error checking / reporting, especially in JSX expressions.
// TODO: have normal `tokenize` stick whitespace elements in the stream, then `tokenizeLines()` takes them out?


var Tokenizer = {

	// Should we warn about anomalous conditions?
	WARN: false,

	// Whitespace constructor.
	Whitespace: whitespace,

	// Indent constructor
	Indent: indent,

	// NEWLINE singleton.
	NEWLINE: new newline("\n"),

	// Tokenize text between `start` and `end` into an array of `results`, an array of:
	//	- `Tokenizer.NEWLINE` for a newline symbol
	//	- strings for keywords/symbols
	//	- numbers for number literals
	//	- `{ indent: number }` for indent at start of line
	//	- `{ type: "text", literal: "'abc'", text: "abc" }
	//	- `{ type: "indent", level: 7 }`
	//	- `{ type: "comment", comment: "string", commentSymbol, whitespace }`
	//TESTME
	tokenize: function tokenize(text) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var end = arguments[2];

		if (typeof end !== "number" || end > text.length) end = text.length;
		// quick return out of range or only whitespace
		if (start >= end || !text.trim()) return [];

		var tokens = [];
		// Process our top-level rules.

		var _eatTokens = this.eatTokens(this.matchTopTokens, text, start, end),
		    _eatTokens2 = _slicedToArray(_eatTokens, 2),
		    results = _eatTokens2[0],
		    nextStart = _eatTokens2[1];

		if (results) {
			tokens = tokens.concat(results);
			start = nextStart;
		}
		if (start !== end) {
			if (Tokenizer.WARN) console.warn("tokenize(): didn't consume: `", text.slice(start, end) + "`");
		}

		return results;
	},


	// Repeatedly execute a `method` (bound to `this) which returns a `[result, nextStart]` or `undefined`.
	// Places matched results together in `results` array and returns `[results, nextStart]` for the entire set.
	// Stops if `method` doesn't return anything, or if calling `method` is unproductive.
	//TESTME
	eatTokens: function eatTokens(method, text) {
		var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
		var end = arguments[3];
		var results = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		// process rules repeatedly until we get to the end
		while (start < end) {
			var result = method.call(this, text, start, end);
			if (!result) break;

			var _result = _slicedToArray(result, 2),
			    tokens = _result[0],
			    nextStart = _result[1];
			// Bail if we didn't get a productive rule!


			if (start === nextStart) break;

			// handle newResults as an array or single object.
			if (tokens !== undefined) results = results.concat(tokens);
			start = nextStart;
		}
		return [results, start];
	},


	// Match a single top-level token at `text[start]`.
	//TESTME
	matchTopTokens: function matchTopTokens(text, start, end) {
		return this.matchWhitespace(text, start, end) || this.matchWord(text, start, end) || this.matchNumber(text, start, end) || this.matchNewline(text, start, end) || this.matchJSXElement(text, start, end) || this.matchText(text, start, end) || this.matchComment(text, start, end) || this.matchSymbol(text, start, end);
	},


	//
	//	### Symbol character
	//

	// Match the single "symbol" character at `text[start]`.
	// NOTE: This does not do any checking, it just blindly uses the character in question.
	//		 You should make sure all other possible rules have been exhausted first.
	matchSymbol: function matchSymbol(text) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var end = arguments[2];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		return [text[start], start + 1];
	},


	//
	//	### Whitespace
	//

	// Return the first char position after `start` which is NOT a whitespace char (space or tab only).
	// If `text[start]` is not whitespace, returns `start`,
	//	so you can call this at any time to skip whitespace in the output.
	eatWhitespace: function eatWhitespace(text) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var end = arguments[2];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return end;

		var whiteSpaceEnd = start;
		while (whiteSpaceEnd < end && (text[whiteSpaceEnd] === " " || text[whiteSpaceEnd] === "\t")) {
			whiteSpaceEnd++;
		}
		return whiteSpaceEnd;
	},


	//
	//	### Whitespace
	//	NOTE: Whitespace at the beginning of `text` or the beginning of a line
	//		  is considered an "indent" and will have `.isIndent === true`.
	//

	// Convert a run of spaces and/or tabs into a `Tokenizer.Whitespace`.
	matchWhitespace: function matchWhitespace(text) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var end = arguments[2];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		var whitespaceEnd = this.eatWhitespace(text, start, end);
		// forget it if no forward motion
		if (whitespaceEnd === start) return undefined;

		var whitespace = text.slice(start, whitespaceEnd);
		var token = void 0;
		if (start === 0 || text[start - 1] === "\n") token = new Tokenizer.Indent(whitespace);else token = new Tokenizer.Whitespace(whitespace);

		return [token, whitespaceEnd];
	},


	//
	//	### Newline
	//

	// Match a single newline character at `text[start]`.
	// Returns `[Tokenizer.NEWLINE, nextStart]` on match.
	// Otherwise returns `undefined`.
	matchNewline: function matchNewline(text) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var end = arguments[2];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end || text[start] !== "\n") return undefined;

		return [Tokenizer.NEWLINE, start + 1];
	},


	//
	//	### Word
	//

	// Match a single `word` in `text` at character `start`.
	// Returns `[word, wordEnd]`.
	// Returns an empty array if couldn't match a word.
	WORD_START: /[A-Za-z]/,
	WORD_CHAR: /^[\w_-]/,
	matchWord: function matchWord(text) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var end = arguments[2];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		if (!this.WORD_START.test(text[start])) return undefined;

		var wordEnd = start + 1;
		while (wordEnd < end && this.WORD_CHAR.test(text[wordEnd])) {
			wordEnd++;
		}
		if (wordEnd === start) return undefined;

		var word = text.slice(start, wordEnd);
		return [word, wordEnd];
	},


	//
	//	### Numbers
	//

	// Eat a single number.
	// Returns a `Number` if matched.
	NUMBER_START: /[0-9-.]/,
	NUMBER: /^-?([0-9]*\.)?[0-9]+/,
	matchNumber: function matchNumber(text) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var end = arguments[2];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		if (!this.NUMBER_START.test(text[start])) return undefined;

		var numberMatch = this.matchExpressionAtHead(this.NUMBER, text, start, end);
		if (!numberMatch) return undefined;

		var numberStr = numberMatch[0];
		var number = parseFloat(numberStr, 10);
		return [number, start + numberStr.length];
	},


	//
	//	### Text literal
	//

	// Eat a text literal (starts/ends with `'` or `"`).
	// Returns a `Tokenizer.Text` if matched.
	//TESTME:  not sure the escaping logic is really right...
	matchText: function matchText(text) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var end = arguments[2];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		var quoteSymbol = text[start];
		if (quoteSymbol !== '"' && quoteSymbol !== "'") return undefined;

		var textEnd = start + 1;
		while (textEnd < end) {
			var char = text[textEnd];
			if (char === quoteSymbol) break;
			// if we get a backquote, ignore quote in next char
			if (char === "\\" && text[textEnd + 1] === quoteSymbol) textEnd++;
			textEnd++;
		}
		// Forget it if we didn't end with the quote symbol
		if (text[textEnd] !== quoteSymbol) return undefined;
		// advance past end quote
		textEnd++;

		var quotedString = text.slice(start, textEnd);
		var token = new Tokenizer.Text(quotedString);
		return [token, textEnd];
	},


	// `Text` class for string literals.
	// Pass the literal value, use `.text` to get just the bit inside the quotes.
	Text: function () {
		function text(quotedString) {
			_classCallCheck(this, text);

			this.quotedString = quotedString;
		}

		_createClass(text, [{
			key: "toString",
			value: function toString() {
				return this.quotedString;
			}
		}, {
			key: "text",
			get: function get() {
				var string = this.quotedString;
				// calculate `text` as the bits between the quotes.
				var start = 0;
				var end = string.length;
				if (string[start] === '"' || string[start] === "'") start = 1;
				if (string[end - 1] === '"' || string[end - 1] === "'") end = -1;
				return string.slice(start, end);
			}
		}]);

		return text;
	}(),

	//
	//	### Comments
	//

	// Eat a comment (until the end of the line).
	// Returns a `Tokenizer.Comment` if matched.
	COMMENT: /^(##+|--+|\/\/+)(\s*)(.*)/,
	matchComment: function matchComment(text) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var end = arguments[2];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		var commentStart = text.slice(start, start + 2);
		if (commentStart !== "--" && commentStart !== "\/\/" && commentStart !== "##") return undefined;

		// comment eats until the end of the line
		var line = this.getLineAtHead(text, start, end);
		var commentMatch = line.match(this.COMMENT);
		if (!commentMatch) return undefined;

		var _commentMatch = _slicedToArray(commentMatch, 4),
		    match = _commentMatch[0],
		    commentSymbol = _commentMatch[1],
		    whitespace = _commentMatch[2],
		    comment = _commentMatch[3];

		var token = new Tokenizer.Comment({ commentSymbol: commentSymbol, whitespace: whitespace, comment: comment });
		return [token, start + line.length];
	},


	// Comment class
	//TESTME
	Comment: function () {
		function comment(props) {
			_classCallCheck(this, comment);

			Object.assign(this, props);
		}

		_createClass(comment, [{
			key: "toString",
			value: function toString() {
				return "" + this.commentSymbol + this.whitespace + this.comment;
			}
		}]);

		return comment;
	}(),

	//
	//	### JSX
	//

	// Eat a (nested) JSX expression.
	//TESTME
	matchJSXElement: function matchJSXElement(text) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var end = arguments[2];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		var _ref = this.matchJSXStartTag(text, start, end) || [],
		    _ref2 = _slicedToArray(_ref, 2),
		    jsxElement = _ref2[0],
		    nextStart = _ref2[1];

		if (!jsxElement) return undefined;

		if (!jsxElement.isUnaryTag) {
			var _matchJSXChildren = this.matchJSXChildren(jsxElement.tagName, text, nextStart, end),
			    _matchJSXChildren2 = _slicedToArray(_matchJSXChildren, 2),
			    children = _matchJSXChildren2[0],
			    childEnd = _matchJSXChildren2[1];

			if (children.length) {
				jsxElement.children = children;
				nextStart = childEnd;
			}
		}

		return [jsxElement, nextStart];
	},


	// Match JSX start tag and internal elements (but NOT children).
	// Returns `[jsxElement, nextStart]` or `undefined`.
	// Use `matchJSXElement()` to match children, end tag, etc.
	// Ignores leading whitespace.
	JSX_TAG_START: /^<([A-Za-z][\w-\.]*)(\s*\/>|\s*>|\s+)/,
	// TODO: clean this stuff up, maybe with findFirstAtHead?
	matchJSXStartTag: function matchJSXStartTag(text) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var end = arguments[2];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		var nextStart = this.eatWhitespace(text, start, end);
		// Make sure we start with `<`.
		if (text[nextStart] !== "<") return undefined;

		var tagMatch = this.matchExpressionAtHead(this.JSX_TAG_START, text, nextStart, end);
		if (!tagMatch) return undefined;

		var _tagMatch = _slicedToArray(tagMatch, 3),
		    matchText = _tagMatch[0],
		    tagName = _tagMatch[1],
		    endBit = _tagMatch[2];

		var jsxElement = new Tokenizer.JSXElement(tagName);
		nextStart = nextStart + matchText.length;

		// If unary tag, mark as such and return.
		endBit = endBit.trim();
		if (endBit === "/>") {
			jsxElement.isUnaryTag = true;
			return [jsxElement, nextStart];
		}

		// If we didn't immediately get an end marker, attempt to match attributes
		if (endBit !== ">" && endBit !== "/>") {
			var _eatTokens3 = this.eatTokens(this.matchJSXAttribute, text, nextStart, end),
			    _eatTokens4 = _slicedToArray(_eatTokens3, 2),
			    attrs = _eatTokens4[0],
			    attrEnd = _eatTokens4[1];

			jsxElement.attributes = attrs;
			nextStart = attrEnd;
		}

		// at this point we should get an `/>` or `>` (with no whitespace).
		if (text[nextStart] === "/" && text[nextStart + 1] === ">") {
			endBit = "/>";
			nextStart += 2;
		} else if (text[nextStart] === ">") {
			endBit = text[nextStart];
			nextStart += 1;
		}

		// Return immediately for unary tag
		if (endBit === "/>") {
			jsxElement.isUnaryTag = true;
			return [jsxElement, nextStart];
		}

		// advance past `>`
		if (endBit !== ">") {
			if (Tokenizer.WARN) {
				console.warn("Missing expected end `>` for jsxElement", jsxElement, "`" + text.slice(start, nextStart) + "`");
			}
			jsxElement.error = "No end >";
			return [jsxElement, nextStart];
		}

		return [jsxElement, nextStart];
	},


	// JSX element class
	JSXElement: function () {
		function jsxElement(tagName, attributes, children) {
			_classCallCheck(this, jsxElement);

			this.tagName = tagName;
			if (attributes) this.attributes = attributes;
			if (children) this.children = children;
		}

		// Return attributes as a map.
		//TESTME


		_createClass(jsxElement, [{
			key: "toString",
			value: function toString() {
				var attrs = this.attrsAsString;
				var children = this.childrenAsString;
				if (this.isUnaryTag) return "<" + this.tagName + attrs + "/>";
				return "<" + this.tagName + attrs + ">" + children + "</" + this.tagName + ">";
			}
		}, {
			key: "attrs",
			get: function get() {
				var attrs = {};
				if (this.attributes) this.attributes.forEach(function (attr) {
					// ignore unnamed attributes
					if (attr.name) attrs[attr.name] = attr.value;
				});
				return attrs;
			}

			// Return our attributes as a string
			//TESTME

		}, {
			key: "attrsAsString",
			get: function get() {
				if (!this.attributes) return "";
				return " " + this.attributes.map(function (_ref3) {
					var name = _ref3.name,
					    value = _ref3.value;

					if (value === undefined) return name;
					// convert value array (tokens) to string
					// TODO: this will want to be smarter...
					if (Array.isArray(value)) value = "{" + value.join(" ") + "}";
					return "name=" + value;
				}).join(" ");
			}

			// Return our children as a string.
			//TESTME

		}, {
			key: "childrenAsString",
			get: function get() {
				if (!this.children) return "";
				return this.children.map(function (child) {
					if (Array.isArray(child)) return "{" + child.join(" ") + "}";
					return "" + child;
				}).join("");
			}
		}]);

		return jsxElement;
	}(),

	//
	//	### JSX children
	//

	// Match JSX element children of `<tagName>` at `text[start]`.
	// Matches nested children and stops after matching end tag: `</tagName>`.
	// Returns `[children, nextStart]`.
	//TESTME
	matchJSXChildren: function matchJSXChildren(tagName, text, start, end) {
		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		var children = [];
		var nesting = 1;
		var endTag = "</" + tagName + ">";

		var nextStart = start;
		while (true) {
			var result = this.matchJSXChild(endTag, text, nextStart, end);
			if (!result) break;

			var _result2 = _slicedToArray(result, 2),
			    child = _result2[0],
			    childEnd = _result2[1];

			nextStart = childEnd;
			// If we got the endTag, update nesting and break out of loop if nesting !== 0
			if (child === endTag) {
				nesting--;
				if (nesting === 0) break;
				continue;
			} else {
				if (child) children.push(child);
			}
		}
		// TODO: how to surface this error???
		if (nesting !== 0) {
			if (Tokenizer.WARN) {
				console.warn("matchJSXChildren(" + text.slice(start, nextStart + 10) + ": didn't match end child!");
			}
		}
		return [children, nextStart];
	},


	// Match a single JSX child:
	//	- current endTag
	//	- `{ jsx expression }`
	//	- nested JSX element
	//	- (anything else) as jsxText expression.
	matchJSXChild: function matchJSXChild(endTag, text) {
		var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
		var end = arguments[3];

		return this.matchJSXEndTag(endTag, text, start, end) || this.matchJSXExpression(text, start, end) || this.matchJSXElement(text, start, end)
		// TODO: newline and indent?
		|| this.matchJSXText(text, start, end);
	},


	// Attempt to match a specific end tag.
	// Ignores leading whitespace.
	matchJSXEndTag: function matchJSXEndTag(endTag, text) {
		var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
		var end = arguments[3];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		var nextStart = this.eatWhitespace(text, start, end);
		if (!this.matchStringAtHead(endTag, text, nextStart, end)) return undefined;
		return [endTag, nextStart + endTag.length];
	},


	//
	//	### JSX attributes
	//

	// Match a single JSX element attribute as `<attr>={<value>}`
	// TODO: {...xxx}
	JSX_ATTRIBUTE_START: /^\s*([\w-]+\b)\s*(=?)\s*/,
	matchJSXAttribute: function matchJSXAttribute(text) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var end = arguments[2];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		// attributes must start with a word character
		if (!this.WORD_START.test(text[start])) return undefined;

		// attempt to match an attribute name, including `=` if present.
		var result = this.matchExpressionAtHead(this.JSX_ATTRIBUTE_START, text, start, end);
		if (!result) return undefined;

		var _result3 = _slicedToArray(result, 3),
		    match = _result3[0],
		    name = _result3[1],
		    equals = _result3[2];

		var nextStart = start + match.length;
		var attribute = new Tokenizer.JSXAttribute(name);

		// if there was an equals char, parse the value
		if (equals) {
			var _ref4 = this.matchJSXAttributeValue(text, nextStart, end) || [],
			    _ref5 = _slicedToArray(_ref4, 2),
			    value = _ref5[0],
			    valueEnd = _ref5[1];

			if (value) {
				attribute.value = value;
				nextStart = valueEnd;
			}
		}
		// eat whitespace before the next attribute / tag end
		nextStart = this.eatWhitespace(text, nextStart, end);
		return [attribute, nextStart];
	},


	// Match a value expression for a JSX element attribute:
	// NOTE: we will be called immediately after the `=` (and subsequent whitespace).
	matchJSXAttributeValue: function matchJSXAttributeValue(text, start, end) {
		return this.matchText(text, start, end) || this.matchJSXExpression(text, start, end) || this.matchJSXElement(text, start, end) || this.matchJSXAttributeValueIdentifier(text, start, end) || this.matchNumber(text, start, end);
	},


	// Match a single identifer as a JSX attribute value.
	// Returns as a `JSXExpression`.
	matchJSXAttributeValueIdentifier: function matchJSXAttributeValueIdentifier(text, start, end) {
		var result = this.matchWord(text, start, end);
		if (!result) return;

		var _result4 = _slicedToArray(result, 2),
		    word = _result4[0],
		    nextStart = _result4[1];

		var token = new Tokenizer.JSXExpression(word);
		return [token, nextStart];
	},


	// JSX attribute class
	// `name` is the name of the attribute.
	// `value` is one of:
	//		- `'...'`			// Text (literal string).
	//		- `"..."`			// Text (literal string).
	//		- `{...}`			// Expression.  Results will be tokenized array.
	//		- `<....>`			// JSX element.
	//		- `1`				// Number.  Note: this is an extension to JSX.

	JSXAttribute: function () {
		function jsxAttribute(name, value) {
			_classCallCheck(this, jsxAttribute);

			this.name = name;
			if (value !== undefined) this.value = value;
		}

		_createClass(jsxAttribute, [{
			key: "toString",
			value: function toString() {
				if (this.value === undefined) return this.name;
				return this.name + "={" + this.value + "}";
			}
		}]);

		return jsxAttribute;
	}(),

	// Match a JSX expression enclosed in curly braces, eg:  `{ ... }`.
	//  Handles nested curlies, quotes, etc.
	// Returns array of tokens of internal match.
	// Ignores leading whitespace.
	//TODO: newlines/indents???
	//TODO: {...xxx}
	//TESTME
	matchJSXExpression: function matchJSXExpression(text) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var end = arguments[2];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		var nextStart = this.eatWhitespace(text, start, end);
		var endIndex = this.findMatchingAtHead("{", "}", text, nextStart, end);
		if (endIndex === undefined) return undefined;

		// Get contents, including leading and trailing whitespace.
		var contents = text.slice(start + 1, endIndex);

		// return a new JSXExpression, advancing beyond the ending `}`.
		var expression = new Tokenizer.JSXExpression(contents);
		return [expression, endIndex + 1];
	},


	// JSX expression, composed of inline tokens which should yield an `expression`.
	JSXExpression: function () {
		function jsxExpression(contents) {
			_classCallCheck(this, jsxExpression);

			this.contents = contents || "";
		}
		// Divide contents into `tokens`.


		_createClass(jsxExpression, [{
			key: "tokens",
			get: function get() {
				return Tokenizer.tokenize(this.contents.trim());
			}
		}]);

		return jsxExpression;
	}(),

	// Match JSXText until the one of `{`, `<`, `>` or `}`.
	// NOTE: INCLUDES leading / trailing whitespace.
	JSX_TEXT_END_CHARS: ["{", "<", ">", "}"],
	//TESTME
	matchJSXText: function matchJSXText(text) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var end = arguments[2];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		// temporarily advance past whitespace (we'll include it in the output).
		var nextStart = this.eatWhitespace(text, start, end);
		var endIndex = this.findFirstAtHead(this.JSX_TEXT_END_CHARS, text, nextStart, end);
		// If the first non-whitespace char is in our END_CHARS, forget it.
		if (endIndex === nextStart) return undefined;

		// if no match, we've got some sort of error
		if (endIndex === undefined) {
			if (Tokenizer.WARN) {
				console.warn("matchJSXText(" + text.slice(start, start + 50) + "): JSX seems to be unbalanced.");
			}
			return undefined;
		}

		// include leading whitespace in the output.
		var jsxText = text.slice(start, endIndex);
		return [jsxText, endIndex];
	},


	//
	//	## Utility functions
	//

	// Return characters up to, but not including, the next newline char after `start`.
	// If `start` is a newline char or start >= end, returns empty string.
	// If at the end of the string (eg: no more newlines), returns from start to end.
	//TESTME
	getLineAtHead: function getLineAtHead(text) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var end = arguments[2];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return "";

		var newline = text.indexOf("\n", start);
		if (newline === -1 || newline > end) newline = end;
		return text.slice(start, newline);
	},


	// Match a multi-char string starting at `text[start]`.
	//TESTME
	matchStringAtHead: function matchStringAtHead(string, text) {
		var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
		var end = arguments[3];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		var stringEnd = start + string.length;
		if (stringEnd > end) return undefined;
		return string === text.slice(start, stringEnd);
	},


	// Match a regular expression starting at `text[start]`, returning the match.
	// Returns `null` if no match.
	//
	// NOTE: The expression MUST start with `/^.../`
	//TESTME
	matchExpressionAtHead: function matchExpressionAtHead(expression, text) {
		var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
		var end = arguments[3];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		var head = text.slice(start, end);
		return head.match(expression);
	},


	// Find index of the matching SINGLE CHARACTER `endDelimiter` to match `startDelimiter`.
	// Matches nested delimiters and handles escaped delimiters.
	// Assumes `text[start]` is the startDelimiter!
	// Returns numeric index or `undefined` if no match or if first char is not `startDelimiter`.
	//
	//	Also handles nested quotes -- if we encounter a single or double quote,
	//		we'll skip scanning until we find a matching quote.
	//
	//	eg:  `findMatchingAtHead("{", "}", "{aa{a}aa}")` => 8
	//TESTME
	findMatchingAtHead: function findMatchingAtHead(startDelimiter, endDelimiter, text) {
		var start = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
		var end = arguments[4];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		if (text[start] !== startDelimiter) return undefined;

		var nesting = 0;
		var current = start;
		while (current < end) {
			var char = text[current];
			// if startDelimiter, increase nesting
			if (char === startDelimiter) {
				nesting++;
			}
			// if endDelimiter, decrease nesting and return if nesting back to 0
			else if (char === endDelimiter) {
					nesting--;
					if (nesting === 0) return current;
				}
				// if a single or double quote, skip until the matching quote
				else if (char === "'" || char === '"') {
						var _ref6 = this.matchText(text, current, end) || [],
						    _ref7 = _slicedToArray(_ref6, 2),
						    token = _ref7[0],
						    afterQuote = _ref7[1];

						current = afterQuote;
						continue; // continue so we don't add 1 to curent below
					}
					// If backslash, skip an extra char if it's either delimiter or a quote
					else if (char === "\\") {
							char = text[current + 1];
							if (char === startDelimiter || char === endDelimiter || char === "'" || char === '"') {
								current++;;
							}
						}
			current++;
		}
	},


	// Return the index of the first NON-ESCAPED character in `chars` after `text[start]`.
	// Returns `undefined` if we didn't find a match.
	//TESTME
	findFirstAtHead: function findFirstAtHead(chars, text) {
		var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
		var end = arguments[3];

		if (typeof end !== "number" || end > text.length) end = text.length;
		if (start >= end) return undefined;

		while (start < end) {
			var char = text[start];
			if (chars.includes(char)) return start;
			// if we got an escape char, ignore the next char if it's in `chars`
			if (char === "\\" && chars.includes(text[start + 1])) start++;
			start++;
		}
		if (start >= end) return undefined;
		return start;
	},


	//
	// ### Utility
	//

	// Given a set of tokens, slice whitespace (indent, NEWLINE or normal whitespace) from the front.
	removeLeadingWhitespace: function removeLeadingWhitespace(tokens) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

		while (tokens[start] instanceof Tokenizer.Whitespace) {
			start++;
		}if (start === 0) return tokens;
		return tokens.slice(start);
	},


	// Given a set of tokens, remove ALL "normal" whitespace tokens (NOT indent or NEWLINE).
	removeNormalWhitespace: function removeNormalWhitespace(tokens) {
		return tokens.filter(function (token) {
			return !Tokenizer.isNormalWhitespace(token);
		});
	},


	// Return `true` if `token` is "normal" whitespce (not a newline or indent)
	isNormalWhitespace: function isNormalWhitespace(token) {
		return token instanceof Tokenizer.Whitespace && !(token instanceof Tokenizer.Indent) && token !== Tokenizer.NEWLINE;
	},


	//
	// ### Block / indent processing
	//

	// Simple block class for `breakIntoBlocks`.
	Block: function () {
		function block(props) {
			_classCallCheck(this, block);

			Object.assign(this, props);
			if (!this.contents) this.contents = [];
		}

		_createClass(block, [{
			key: "toString",
			value: function toString() {
				return JSON.stringify(this, null, "\t");
			}
		}]);

		return block;
	}(),

	// Break tokens into an array of arrays by `NEWLINE`s.
	// Returns an array of lines WITHOUT the `NEWLINE`s.
	// Lines which are composed solely of whitespace are treated as blank.
	breakIntoLines: function breakIntoLines(tokens) {
		// Convert to lines.
		var currentLine = [];
		var lines = [currentLine];
		tokens.forEach(function (token) {
			// add new array for each newline
			if (token === Tokenizer.NEWLINE) {
				// create a new line and push it in
				currentLine = [];
				return lines.push(currentLine);
			}

			// otherwise just add to the current line
			currentLine.push(token);
		});

		// Clear any lines that are only whitespace
		lines.forEach(function (line, index) {
			if (line.length === 1 && line[0] instanceof Tokenizer.Whitespace) lines[index] = [];
		});

		return lines;
	},


	// Return indents of the specified lines.
	// Indents empty lines (NEWLINEs) into the block AFTER they appear.
	getLineIndents: function getLineIndents(lines) {
		var defaultIndent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

		if (lines.length === 0) return [];

		var indents = lines.map(Tokenizer.getLineIndent);
		var end = indents.length;

		// figure out the indent of the first non-empty line
		var startIndent = getNextIndent(0);
		if (startIndent === undefined) startIndent = defaultIndent;

		// indent blank lines to the indent AFTER them
		for (var index = 0; index < end; index++) {
			if (indents[index] === undefined) {
				indents[index] = getNextIndent(index + 1);
			}
		}
		return indents;

		// Return the value of the NEXT non-undefined indent.
		function getNextIndent(index) {
			while (index < end) {
				if (indents[index] !== undefined) return indents[index];
				index++;
			}
			return startIndent;
		}
	},


	// Return the indent of a line of tokens.
	// Returns `0` if not indented.
	// Returns `undefined` if a blank line.
	getLineIndent: function getLineIndent(line) {
		if (!line || line.length === 0) return undefined;
		if (line[0] instanceof Tokenizer.Indent) return line[0].length;
		return 0;
	},


	// Break `tokens` between `start` and `end` into a `Tokenizer.Block` with nested `contents`.
	// Skips "normal" whitespace and indents in the results.
	breakIntoBlocks: function breakIntoBlocks(tokens) {
		var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : tokens.length;

		// restrict to tokens of interest
		tokens = tokens.slice(start, end);
		// remove "normal" whitespace
		//TODO: better to leave this to consumers???
		tokens = Tokenizer.removeNormalWhitespace(tokens);

		// break into lines & return early if no lines
		var lines = Tokenizer.breakIntoLines(tokens);
		if (lines.length === 0) return [];

		// figure out indents
		var indents = Tokenizer.getLineIndents(lines);

		// First block is at the MINIMUM indent of all lines!
		var maxIndent = Math.min.apply(Math, indents);
		var block = new Tokenizer.Block({ indent: maxIndent });

		// stack of blocks
		var stack = [block];

		lines.forEach(function (line, index) {
			// Remove leading whitespace (eg: indents)
			line = Tokenizer.removeLeadingWhitespace(line);

			var lineIndent = indents[index];
			var top = stack[stack.length - 1];
			// If indenting, push new block(s)
			if (lineIndent > top.indent) {
				while (lineIndent > top.indent) {
					var newBlock = new Tokenizer.Block({ indent: top.indent + 1 });
					top.contents.push(newBlock);
					stack.push(newBlock);

					top = newBlock;
				}
			}
			// If outdenting: pop block(s)
			else if (lineIndent < top.indent) {
					while (lineIndent < top.indent) {
						stack.pop();
						top = stack[stack.length - 1];
					}
				}
			// add to top block
			top.contents.push(line);
		});

		return block;
	}

};

exports.default = Tokenizer;

/***/ }),

/***/ 91:
/***/ (function(module, exports) {

var core = module.exports = { version: '2.5.7' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),

/***/ 92:
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),

/***/ 93:
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(555);
var defined = __webpack_require__(551);
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),

/***/ 94:
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),

/***/ 943:
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),

/***/ 944:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(569);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(476)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/dist/cjs.js!./Spacer.less", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/dist/cjs.js!./Spacer.less");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 945:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(570);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(476)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/dist/cjs.js!./styles.less", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/dist/cjs.js!./styles.less");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 947:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cloneClass = cloneClass;
//
//  # Class utilities
//

// Clone a class, re-using the original name.
// TODO: move to utility?
function cloneClass(constructor) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : constructor.name;

  // Clone the constructor, keeping the same name
  global.__cloneClass__ = constructor;
  var clone = new Function("name", "return class " + name + " extends __cloneClass__ {}")();
  delete global.__cloneClass__;
  return clone;
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(262)))

/***/ }),

/***/ 95:
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(187)('wks');
var uid = __webpack_require__(94);
var Symbol = __webpack_require__(48).Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ })

},[482]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvc3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2ZhaWxzLmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9saWIva2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvc3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY29mLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19saWJyYXJ5LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LXBpZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcG4uanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLWtleS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW50ZWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fd2tzLWV4dC5qcyIsIndlYnBhY2s6Ly8vLi9+L2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL3NyYy9QYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9ldmVudF9oYW5kbGVycy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL21hdGNoX2tleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9wYXJzZV9rZXlzLmpzIiwid2VicGFjazovLy8uL34vc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL1NwZWxsRWRpdG9yLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvcnVsZXMvc3BlbGwvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9FeGFtcGxlU3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL1NwYWNlci5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9UYWJiYWJsZVRleHRBcmVhLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL2luZGV4LmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL3V0aWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21lbW9pemUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL0pTWC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcnVsZXMvc3BlbGwvaWYuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL2xpc3RzLmpzIiwid2VicGFjazovLy8uL3NyYy9ydWxlcy9zcGVsbC9vcGVyYXRvcnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL3N0YXRlbWVudHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL3R5cGVzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9lczYvc3ltYm9sLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY2xhc3NvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY3R4LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faHRtbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faXMtYXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX21ldGEuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1jcmVhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcHMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wbi1leHQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3NldC10by1zdHJpbmctdGFnLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL190by1hYnNvbHV0ZS1pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tbGVuZ3RoLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL193a3MtZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL2VzNi5zeW1ib2wuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9TcGFjZXIubGVzcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL3N0eWxlcy5sZXNzIiwid2VicGFjazovLy8uL3NyYy9ydWxlcy9zcGVsbC9jb3JlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kZXNjcmlwdG9ycy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faGFzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2ZhY3RvcnlXaXRoVGhyb3dpbmdTaGltcy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9jbGFzc19kZWNvcmF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvbWV0aG9kX2RlY29yYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9tZXRob2RfZGVjb3JhdG9yX3Njb3BlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9hcnJheS5mcm9tLmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvZG9tX2hlbHBlcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9saXN0ZW5lcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi91dWlkLmpzIiwid2VicGFjazovLy8uL3NyYy9SdWxlLmpzIiwid2VicGFjazovLy8uL3NyYy9SdWxlU3ludGF4LmpzIiwid2VicGFjazovLy8uL3NyYy9Ub2tlbml6ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2lzLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdWlkLmpzIiwid2VicGFjazovLy8uL34vc3R5bGUtbG9hZGVyL2ZpeFVybHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9TcGFjZXIubGVzcz8wOGRlIiwid2VicGFjazovLy8uL3NyYy9hcHAvc3R5bGVzLmxlc3M/YjdlNyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvY2xhc3MuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3drcy5qcyJdLCJuYW1lcyI6WyJpc1doaXRlc3BhY2UiLCJwbHVyYWxpemUiLCJpc1BsdXJhbCIsInNpbmd1bGFyaXplIiwiaXNTaW5ndWxhciIsImdldFRhYnMiLCJBTExfV0hJVEVTUEFDRSIsInRleHQiLCJ0ZXN0Iiwid29yZCIsInJlcGxhY2UiLCJUQUJTIiwibnVtYmVyIiwic3Vic3RyIiwiYWxsRXhwb3J0cyIsImV4cG9ydHMiLCJnbG9iYWwiLCJTVFJJTkciLCJnbG9iYWxfaWRlbnRpZmllciIsIndpbmRvdyIsInNlbGYiLCJjb25zb2xlIiwiZ3JvdXAiLCJsb2ciLCJncm91cEVuZCIsIlBhcnNlciIsInByb3BlcnRpZXMiLCJpbXBvcnRzIiwiX3J1bGVzIiwiT2JqZWN0IiwiYXNzaWduIiwicnVsZU5hbWUiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJUSU1FIiwidGltZSIsInRva2VucyIsIlRva2VuaXplciIsInRva2VuaXplIiwiZmlsdGVyIiwiaXNOb3JtYWxXaGl0ZXNwYWNlIiwidG9rZW4iLCJ0aW1lRW5kIiwidW5kZWZpbmVkIiwicmVtb3ZlTGVhZGluZ1doaXRlc3BhY2UiLCJyZXN1bHQiLCJwYXJzZU5hbWVkUnVsZSIsInBhcnNlIiwiU3ludGF4RXJyb3IiLCJ0b1NvdXJjZSIsInN0YXJ0IiwiZW5kIiwic3RhY2siLCJjYWxsaW5nQ29udGV4dCIsInJ1bGUiLCJydWxlcyIsInJldmVyc2UiLCJjb25jYXQiLCJfX3J1bGVzIiwibWFwIiwiZXhpc3RpbmciLCJSdWxlIiwiQWx0ZXJuYXRpdmVzIiwiYWx0Q29uc3RydWN0b3IiLCJhZGRSdWxlIiwiQXJyYXkiLCJpc0FycmF5IiwiZm9yRWFjaCIsIl9tZXJnZVJ1bGUiLCJyZWR1Y2UiLCJibGFja2xpc3QiLCJkZWZpbmVSdWxlIiwibmFtZSIsImNvbnN0cnVjdG9yIiwiYWxpYXMiLCJjYW5vbmljYWwiLCJzeW50YXgiLCJvdGhlclByb3BzIiwibmFtZXMiLCJwcm90b3R5cGUiLCJydWxlTmFtZXMiLCJUeXBlRXJyb3IiLCJkZWZpbmVQcm9wZXJ0eSIsInZhbHVlIiwia2V5Iiwia2V5cyIsIm91dHB1dCIsImZvck5hbWUiLCJwYXJzZXIiLCJSRUdJU1RSWSIsInN0YXJ0VG9rZW4iLCJlbmRUb2tlbiIsIm5lc3RpbmciLCJuZXN0ZWQiLCJsYXN0SW5kZXgiLCJzbGljZSIsIkRFQlVHIiwiV0FSTiIsIlNwZWxsRWRpdG9yIiwib2JzZXJ2ZXIiLCJwcm9wcyIsImV4YW1wbGVzIiwibG9hZCIsInNwZWxsRWRpdG9yIiwic2F2ZSIsInJldmVydCIsImNvbXBpbGUiLCJjcmVhdGUiLCJkZWxldGUiLCJyZW5hbWUiLCJkdXBsaWNhdGUiLCJyZXNldCIsInRpdGxlcyIsInNlbGVjdGVkIiwiZGlydHkiLCJjb2RlIiwib3B0aW9ucyIsInRpdGxlIiwiY29udGVudCIsIm9uQ2xpY2siLCJzZWxlY3QiLCJkaXJ0eUJ1dHRvbnMiLCJwb3NpdGlvbiIsInJpZ2h0IiwidG9wIiwibWFyZ2luIiwiY29tcGlsZUJ1dHRvbiIsIndpZHRoIiwibGVmdCIsImhlaWdodCIsInBhZGRpbmdUb3AiLCJldmVudCIsInVwZGF0ZSIsInRhcmdldCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZGVmYXVsdFByb3BzIiwiRXhhbXBsZVN0b3JlIiwiaW1wb3J0IiwiYmluZCIsImxvY2FsU3RvcmFnZSIsInNwZWxsRWRpdG9yRXhhbXBsZXMiLCJzcGVsbEVkaXRvckV4YW1wbGUiLCJsb2NhdGlvbiIsInJlbG9hZCIsIkpTT04iLCJfc2F2ZWRFeGFtcGxlcyIsInN0cmluZ2lmeSIsImV4YW1wbGUiLCJza2lwU2F2ZSIsInNob3dDb25maXJtIiwiY29uZmlybSIsInByb21wdCIsIm9sZE5hbWUiLCJuZXdOYW1lIiwid2FybiIsInNldFRpbWVvdXQiLCJpbmZvIiwib2JzZXJ2YWJsZSIsImNvbXB1dGVkIiwiU3BhY2VyIiwiY2xhc3NOYW1lIiwiYXBwZWFyYW5jZSIsInNpemUiLCJpbmxpbmUiLCJmbHVpZCIsInRpbnkiLCJzbWFsbCIsIm1lZGl1bSIsImxhcmdlIiwiaHVnZSIsIm1hc3NpdmUiLCJzcGFjZXJQcm9wcyIsInN0eWxlIiwicHJvcFR5cGVzIiwiUHJvcFR5cGVzIiwic3RyaW5nIiwiYm9vbCIsIlRhYmJhYmxlVGV4dEFyZWEiLCJvbktleURvd24iLCJrZXlDb2RlIiwicHJldmVudERlZmF1bHQiLCJlbGVtZW50Iiwic2VsZWN0aW9uU3RhcnQiLCJzZWxlY3Rpb25FbmQiLCJuZXdUZXh0Iiwic2hpZnRLZXkiLCJsYXN0SW5kZXhPZiIsImluZGV4T2YiLCJsaW5lcyIsInNwbGl0IiwibGluZSIsImpvaW4iLCJvbkNoYW5nZSIsIlRleHRBcmVhIiwiUmVhY3RET00iLCJyZW5kZXIiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiY2xhc3NOYW1lcyIsImFyZ3MiLCJhcmciLCJCb29sZWFuIiwibWVtb2l6ZWQiLCJkZWZpbmVNZW1vaXplZCIsInByb3BlcnR5IiwiZ2V0dGVyIiwiYXBwbHkiLCJjb25maWd1cmFibGUiLCJnZXQiLCJkZWZpbmVSdWxlcyIsIkpTWEVsZW1lbnQiLCJjbG9uZSIsIm1hdGNoZWQiLCJuZXh0U3RhcnQiLCJqc3hFbGVtZW50IiwiYXR0cmlidXRlcyIsImF0dHJzIiwiSlNYRXhwcmVzc2lvbiIsImpzeEV4cHJlc3Npb25Ub1NvdXJjZSIsImNoaWxkcmVuIiwiY2hpbGQiLCJ0cmltIiwiY2hpbGRTb3VyY2UiLCJqc3hFbGVtZW50VG9Tb3VyY2UiLCJqc3hFeHByZXNzaW9uIiwidGFnTmFtZSIsImF0dHJzVG9Tb3VyY2UiLCJjaGlsZHJlblRvU291cmNlIiwiZ2V0TWF0Y2hlZFNvdXJjZSIsImNvbmRpdGlvbiIsInN0YXRlbWVudCIsImJsb2NrIiwic3RhdGVtZW50cyIsIkJsb2NrIiwiZW5jbG9zZVN0YXRlbWVudHMiLCJCbG9ja1N0YXRlbWVudCIsImxlZnRSZWN1cnNpdmUiLCJ0ZXN0UnVsZSIsIktleXdvcmRzIiwibGl0ZXJhbHMiLCJlbHNlU3RhdGVtZW50IiwiU2VxdWVuY2UiLCJsaXN0IiwiaWRlbnRpZmllciIsInRoaW5nIiwiZXhwcmVzc2lvbiIsImFyZ3VtZW50IiwibWF0Y2giLCJvcGVyYXRvciIsImJhbmciLCJpdGVtIiwiaXRlbVZhciIsInBvc2l0aW9uVmFyIiwicmVzdWx0cyIsImxocyIsInJocyIsInByZWNlZGVuY2UiLCJhIiwiYiIsInR5cGUiLCJTeW1ib2xzIiwibWVzc2FnZSIsIm9rQnV0dG9uIiwiY2FuY2VsQnV0dG9uIiwic3RydWN0dXJlIiwic3VwZXJUeXBlIiwic3ViVHlwZSIsImtleXdvcmRzIiwia2V5d29yZE1hdGNoZXMiLCJrZXl3b3JkIiwiVHlwZSIsImVycm9yIiwidHlwZXMiLCJpbmRleCIsInRvTG93ZXJDYXNlIiwicHVzaCIsImNvbmRpdGlvbnMiLCJzdGFydHNXaXRoIiwibWF0Y2hlZFRleHQiLCJzY29wZSIsImRlY2xhcmF0aW9uIiwiZGF0YVR5cGUiLCJwbHVyYWwiLCJwcm9wIiwiTGlzdCIsIlN0YXRlbWVudHMiLCJDb21tZW50IiwicGF0dGVybiIsIlBhdHRlcm4iLCJOdW1iZXIiLCJOVU1CRVJfTkFNRVMiLCJ6ZXJvIiwib25lIiwidHdvIiwidGhyZWUiLCJmb3VyIiwiZml2ZSIsInNpeCIsInNldmVuIiwiZWlnaHQiLCJuaW5lIiwidGVuIiwiVGV4dCIsInF1b3RlZFN0cmluZyIsImVuZHNXaXRoIiwiTGl0ZXJhbHMiLCJtYXRjaGVzU3RhcnRpbmdBdCIsImxpdGVyYWxTZXBhcmF0b3IiLCJmaXJzdCIsImV2ZXJ5IiwibGl0ZXJhbCIsImkiLCJvcHRpb25hbCIsInNvbWUiLCJzb3VyY2UiLCJTdWJydWxlIiwibWF0Y2hlZFJ1bGUiLCJzdWJydWxlIiwiaW5jbHVkZXMiLCJwcm9tb3RlIiwiX2FkZFJlc3VsdHMiLCJyZXN1bHROYW1lIiwidG9TeW50YXgiLCJjb21tZW50IiwibWF0Y2hlcyIsImJlc3RNYXRjaCIsImdldEJlc3RNYXRjaCIsImJlc3QiLCJjdXJyZW50IiwiUmVwZWF0IiwicmVwZWF0IiwiaXNDb21wb3VuZFJ1bGUiLCJkZWxpbWl0ZXIiLCJpbmRlbnQiLCJjb250ZW50cyIsIkJsYW5rTGluZSIsImxhc3QiLCJwYXJzZUJsb2NrIiwicGFyc2VTdGF0ZW1lbnQiLCJXaGl0ZXNwYWNlIiwiU3RhdGVtZW50UGFyc2VFcnJvciIsInVucGFyc2VkIiwicGFyc2VkIiwiZSIsImJsb2NrVG9Tb3VyY2UiLCJuYW1lZCIsIm1ldGhvZHMiLCJvdGhlciIsInRvU3RydWN0dXJlIiwiYWRkU3RydWN0dXJlIiwiYnJlYWtJbnRvQmxvY2tzIiwid2hpdGVzcGFjZSIsInBhcnNlUnVsZSIsInBhcnNlU3ludGF4IiwiYWx0Q2xhc3MiLCJ0b2tlbmlzZVJ1bGVTeW50YXgiLCJTWU5UQVhfRVhQUkVTU0lPTiIsInN5bnRheFN0cmVhbSIsInBhcnNlVG9rZW4iLCJwb3AiLCJLRVlXT1JEX1BBVFRFUk4iLCJzeW50YXhUb2tlbiIsInBhcnNlU3ltYm9sIiwicGFyc2VTdWJydWxlIiwicGFyc2VBbHRlcm5hdGl2ZXMiLCJwYXJzZUxpc3QiLCJwYXJzZVJlcGVhdCIsInBhcnNlS2V5d29yZCIsIm5leHQiLCJpc0VzY2FwZWQiLCJmaW5kTmVzdGVkVG9rZW5zIiwiYWx0ZXJuYXRpdmVzIiwiZ3JvdXBBbHRlcm5hdGl2ZXMiLCJzeW1ib2wiLCJwYXJhbXMiLCJiYW5nUG9zaXRpb24iLCJub3QiLCJuZXdsaW5lIiwiSW5kZW50IiwiTkVXTElORSIsImVhdFRva2VucyIsIm1hdGNoVG9wVG9rZW5zIiwibWV0aG9kIiwiY2FsbCIsIm1hdGNoV2hpdGVzcGFjZSIsIm1hdGNoV29yZCIsIm1hdGNoTnVtYmVyIiwibWF0Y2hOZXdsaW5lIiwibWF0Y2hKU1hFbGVtZW50IiwibWF0Y2hUZXh0IiwibWF0Y2hDb21tZW50IiwibWF0Y2hTeW1ib2wiLCJlYXRXaGl0ZXNwYWNlIiwid2hpdGVTcGFjZUVuZCIsIndoaXRlc3BhY2VFbmQiLCJXT1JEX1NUQVJUIiwiV09SRF9DSEFSIiwid29yZEVuZCIsIk5VTUJFUl9TVEFSVCIsIk5VTUJFUiIsIm51bWJlck1hdGNoIiwibWF0Y2hFeHByZXNzaW9uQXRIZWFkIiwibnVtYmVyU3RyIiwicGFyc2VGbG9hdCIsInF1b3RlU3ltYm9sIiwidGV4dEVuZCIsImNoYXIiLCJDT01NRU5UIiwiY29tbWVudFN0YXJ0IiwiZ2V0TGluZUF0SGVhZCIsImNvbW1lbnRNYXRjaCIsImNvbW1lbnRTeW1ib2wiLCJtYXRjaEpTWFN0YXJ0VGFnIiwiaXNVbmFyeVRhZyIsIm1hdGNoSlNYQ2hpbGRyZW4iLCJjaGlsZEVuZCIsIkpTWF9UQUdfU1RBUlQiLCJ0YWdNYXRjaCIsImVuZEJpdCIsIm1hdGNoSlNYQXR0cmlidXRlIiwiYXR0ckVuZCIsImF0dHJzQXNTdHJpbmciLCJjaGlsZHJlbkFzU3RyaW5nIiwiYXR0ciIsImVuZFRhZyIsIm1hdGNoSlNYQ2hpbGQiLCJtYXRjaEpTWEVuZFRhZyIsIm1hdGNoSlNYRXhwcmVzc2lvbiIsIm1hdGNoSlNYVGV4dCIsIm1hdGNoU3RyaW5nQXRIZWFkIiwiSlNYX0FUVFJJQlVURV9TVEFSVCIsImVxdWFscyIsImF0dHJpYnV0ZSIsIkpTWEF0dHJpYnV0ZSIsIm1hdGNoSlNYQXR0cmlidXRlVmFsdWUiLCJ2YWx1ZUVuZCIsIm1hdGNoSlNYQXR0cmlidXRlVmFsdWVJZGVudGlmaWVyIiwiZW5kSW5kZXgiLCJmaW5kTWF0Y2hpbmdBdEhlYWQiLCJKU1hfVEVYVF9FTkRfQ0hBUlMiLCJmaW5kRmlyc3RBdEhlYWQiLCJqc3hUZXh0Iiwic3RyaW5nRW5kIiwiaGVhZCIsInN0YXJ0RGVsaW1pdGVyIiwiZW5kRGVsaW1pdGVyIiwiYWZ0ZXJRdW90ZSIsImNoYXJzIiwicmVtb3ZlTm9ybWFsV2hpdGVzcGFjZSIsImJyZWFrSW50b0xpbmVzIiwiY3VycmVudExpbmUiLCJnZXRMaW5lSW5kZW50cyIsImRlZmF1bHRJbmRlbnQiLCJpbmRlbnRzIiwiZ2V0TGluZUluZGVudCIsInN0YXJ0SW5kZW50IiwiZ2V0TmV4dEluZGVudCIsIm1heEluZGVudCIsIk1hdGgiLCJtaW4iLCJsaW5lSW5kZW50IiwibmV3QmxvY2siLCJjbG9uZUNsYXNzIiwiX19jbG9uZUNsYXNzX18iLCJGdW5jdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7UUFJZ0JBLFksR0FBQUEsWTtRQU9BQyxTLEdBQUFBLFM7UUFNQUMsUSxHQUFBQSxRO1FBUUFDLFcsR0FBQUEsVztRQU1BQyxVLEdBQUFBLFU7UUFPQUMsTyxHQUFBQSxPOztBQXRDaEI7Ozs7OztBQUVBO0FBQ0EsSUFBSUMsaUJBQWlCLE9BQXJCO0FB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O0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVEQUF1RDtBQUN2RDs7QUFFQSw2QkFBNkIsbUJBQW1COztBQUVoRDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbFRB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QUNBeEQsU0FBT2djLGNBQVAsR0FBd0J2WSxXQUF4QjtBQUNBLE1BQU0ySSxRQUFRLElBQUk2UCxRQUFKLENBQWEsTUFBYixvQkFBcUN6WSxJQUFyQyxrQ0FBZDtBQUNBLFNBQU94RCxPQUFPZ2MsY0FBZDtBQUNBLFNBQU81UCxLQUFQO0FBQ0QsQzs7Ozs7Ozs7QUNaRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZ2xvYmFsIGZyb20gXCIuL2dsb2JhbFwiO1xuXG4vLyBSZXR1cm4gdHJ1ZSBpZiB0ZXh0IGlzIGFsbCB3aGl0ZXNwYWNlLCBpbmNsdWRpbmcgZW1wdHkgc3RyaW5nLlxubGV0IEFMTF9XSElURVNQQUNFID0gL15cXHMqJC87XG5leHBvcnQgZnVuY3Rpb24gaXNXaGl0ZXNwYWNlKHRleHQpIHtcblx0cmV0dXJuIEFMTF9XSElURVNQQUNFLnRlc3QodGV4dClcbn1cblxuLy8gUmV0dXJuIHRoZSBwbHVyYWwgb2YgYHdvcmRgLlxuLy8gTk9URTogdGhpcyBpcyBub3QgdmVyeSBnb29kIGF0IGFsbCEhIVxuLy8gVE9ETzogZXhjZXB0aW9ucywgZXRjLlxuZXhwb3J0IGZ1bmN0aW9uIHBsdXJhbGl6ZSh3b3JkKSB7XG5cdHJldHVybiB3b3JkICsgXCJzXCI7XG59XG5cbi8vIFJldHVybiB0cnVlIGlmIHdvcmQgaXMgYSBwbHVyYWwuXG4vLyBOT1RFOiBmb3Igd29yZHMgd2hpY2ggYXJlIEJPVEggc2luZ3VsYXIgYW5kIHBsdXJhbCwgdGhpcyB3aWxsIHJldHVybiB0cnVlLlxuZXhwb3J0IGZ1bmN0aW9uIGlzUGx1cmFsKHdvcmQpIHtcblx0cmV0dXJuIHdvcmQgPT09IHBsdXJhbGl6ZSh3b3JkKTtcbn1cblxuXG4vLyBSZXR1cm4gdGhlIHNpbmd1bGFyIG9mIGB3b3JkYC5cbi8vIE5PVEU6IHRoaXMgaXMgbm90IHZlcnkgZ29vZCBhdCBhbGwhISFcbi8vIFRPRE86IGV4Y2VwdGlvbnMsIGV0Yy5cbmV4cG9ydCBmdW5jdGlvbiBzaW5ndWxhcml6ZSh3b3JkKSB7XG5cdHJldHVybiB3b3JkLnJlcGxhY2UoL2U/cyQvLCBcIlwiKTtcbn1cblxuLy8gUmV0dXJuIHRydWUgaWYgd29yZCBpcyBhIHNpbmd1bGFyLlxuLy8gTk9URTogZm9yIHdvcmRzIHdoaWNoIGFyZSBCT1RIIHNpbmd1bGFyIGFuZCBwbHVyYWwsIHRoaXMgd2lsbCByZXR1cm4gdHJ1ZS5cbmV4cG9ydCBmdW5jdGlvbiBpc1Npbmd1bGFyKHdvcmQpIHtcblx0cmV0dXJuIHdvcmQgPT09IHNpbmd1bGFyaXplKHdvcmQpO1xufVxuXG5cbi8vIFJldHVybiBhIGNlcnRhaW4gYG51bWJlcmAgb2YgdGFiIGNoYXJhY3RlcnMuXG5jb25zdCBUQUJTID0gXCJcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcIjtcbmV4cG9ydCBmdW5jdGlvbiBnZXRUYWJzKG51bWJlcikge1xuXHRpZiAodHlwZW9mIG51bWJlciAhPT0gXCJudW1iZXJcIikgcmV0dXJuIFwiXCI7XG5cdHJldHVybiBUQUJTLnN1YnN0cigwLCBudW1iZXIpO1xufVxuXG5cbi8vIEV4cG9ydCBhbGwgYXMgYSBsdW1wXG5sZXQgYWxsRXhwb3J0cyA9IHsuLi5leHBvcnRzfTtcbmV4cG9ydCBkZWZhdWx0IGFsbEV4cG9ydHM7XG5cbi8vIERFQlVHOiBwdXQgb24gZ2xvYmFsIGZvciBkZWJ1Z2dpbmcuXG5nbG9iYWwuU1RSSU5HID0gYWxsRXhwb3J0cztcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91dGlscy9zdHJpbmcuanMiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICghaXNPYmplY3QoaXQpKSB0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XG4gIHJldHVybiBpdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanNcbi8vIG1vZHVsZSBpZCA9IDExNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGVjKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19mYWlscy5qc1xuLy8gbW9kdWxlIGlkID0gMTE1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAnY29yZS1qcy9lczYvc3ltYm9sJztcblxuLy8gVE9ETzogTmVlZCBiZXR0ZXIsIG1vcmUgY29tcGxldGUsIGFuZCBtb3JlIG1ldGhvZGljYWwga2V5IGRlZmluaXRpb25zXG5cbnZhciBLZXlzID0ge1xuICBiYWNrc3BhY2U6IDgsXG4gIGRlbDogNDYsXG4gIGRlbGV0ZTogNDYsXG4gIHRhYjogOSxcbiAgZW50ZXI6IDEzLFxuICAncmV0dXJuJzogMTMsXG4gIGVzYzogMjcsXG4gIHNwYWNlOiAzMixcbiAgcGFnZVVwOiAzMyxcbiAgcGFnZURvd246IDM0LFxuICBlbmQ6IDM1LFxuICBob21lOiAzNixcbiAgbGVmdDogMzcsXG4gIHVwOiAzOCxcbiAgcmlnaHQ6IDM5LFxuICBkb3duOiA0MCxcbiAgJzsnOiAxODYsXG4gICc9JzogMTg3LFxuICAnLCc6IDE4OCxcbiAgJy0nOiAxODksXG4gICcuJzogMTkwLFxuICAnLyc6IDE5MSxcbiAgJ2AnOiAxOTIsXG4gICdbJzogMjE5LFxuICAnXFxcXCc6IDIyMCxcbiAgJ10nOiAyMjFcbn07XG5cbi8vIEFkZCB1cHBlcmNhc2UgdmVyc2lvbnMgb2Yga2V5cyBhYm92ZSBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbk9iamVjdC5rZXlzKEtleXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gS2V5c1trZXkudG9VcHBlckNhc2UoKV0gPSBLZXlzW2tleV07XG59KTtcblxuJzAxMjM0NTY3ODknLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChudW0sIGluZGV4KSB7XG4gIHJldHVybiBLZXlzW251bV0gPSBpbmRleCArIDQ4O1xufSk7XG5cbidBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWicuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24gKGxldHRlciwgaW5kZXgpIHtcbiAgS2V5c1tsZXR0ZXJdID0gaW5kZXggKyA2NTtcbiAgS2V5c1tsZXR0ZXIudG9Mb3dlckNhc2UoKV0gPSBpbmRleCArIDY1O1xufSk7XG5cbi8vIGZuIGtleXNcblsxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCwgMTEsIDEyXS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xuICByZXR1cm4gS2V5c1snZicgKyBpbmRleF0gPSAxMTEgKyBpbmRleDtcbn0pO1xuXG5leHBvcnQgdmFyIG1vZGlmaWVycyA9IHtcbiAgY29udHJvbDogJ2N0cmwnLFxuICBjdHJsOiAnY3RybCcsXG4gIHNoaWZ0OiAnc2hpZnQnLFxuICBtZXRhOiAnbWV0YScsXG4gIGNtZDogJ21ldGEnLFxuICBjb21tYW5kOiAnbWV0YScsXG4gIG9wdGlvbjogJ2FsdCcsXG4gIGFsdDogJ2FsdCdcbn07XG5cbmV4cG9ydCB2YXIgQUxMX0tFWVMgPSBTeW1ib2woJ0FMTF9LRVlTJyk7XG5cbmV4cG9ydCB2YXIgQUxMX1BSSU5UQUJMRV9LRVlTID0gU3ltYm9sKCdBTExfUFJJTlRBQkxFX0tFWVMnKTtcblxuZXhwb3J0IGRlZmF1bHQgS2V5cztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9saWIva2V5cy5qc1xuLy8gbW9kdWxlIGlkID0gMTQ4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBfc2xpY2VkVG9BcnJheSA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gc2xpY2VJdGVyYXRvcihhcnIsIGkpIHsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0pIF9pW1wicmV0dXJuXCJdKCk7IH0gZmluYWxseSB7IGlmIChfZCkgdGhyb3cgX2U7IH0gfSByZXR1cm4gX2FycjsgfSByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IHJldHVybiBhcnI7IH0gZWxzZSBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSB7IHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7IH0gZWxzZSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpOyB9IH07IH0oKTtcblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbi8qKlxuICogQG1vZHVsZSBzdG9yZVxuICpcbiAqL1xuaW1wb3J0IG1hdGNoS2V5cyBmcm9tICcuL2xpYi9tYXRjaF9rZXlzJztcbmltcG9ydCBwYXJzZUtleXMgZnJvbSAnLi9saWIvcGFyc2Vfa2V5cyc7XG5pbXBvcnQgdXVpZCBmcm9tICcuL2xpYi91dWlkJztcblxuLyoqXG4gKiBwcml2YXRlXG4gKlxuICovXG5cbi8vIGRpY3QgZm9yIGNsYXNzIHByb3RvdHlwZXMgPT4gYmluZGluZ3NcbnZhciBfaGFuZGxlcnMgPSBuZXcgTWFwKCk7XG5cbi8vIGFsbCBtb3VudGVkIGluc3RhbmNlcyB0aGF0IGhhdmUga2V5YmluZGluZ3NcbnZhciBfaW5zdGFuY2VzID0gbmV3IFNldCgpO1xuXG4vLyBmb3IgdGVzdGluZ1xuZXhwb3J0IGZ1bmN0aW9uIF9yZXNldFN0b3JlKCkge1xuICBfaGFuZGxlcnMuY2xlYXIoKTtcbiAgX2luc3RhbmNlcy5jbGVhcigpO1xufVxuXG4vKipcbiAqIGFjdGl2YXRlXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSBpbnN0YW5jZSBJbnN0YW50aWF0ZWQgY2xhc3MgdGhhdCBleHRlbmRlZCBSZWFjdC5Db21wb25lbnQsIHRvIGJlIGZvY3VzZWQgdG8gcmVjZWl2ZSBrZXlkb3duIGV2ZW50c1xuICovXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoaW5zdGFuY2VzKSB7XG4gIHZhciBpbnN0YW5jZXNBcnJheSA9IFtdLmNvbmNhdChpbnN0YW5jZXMpO1xuXG4gIC8vIGlmIG5vIGNvbXBvbmVudHMgd2VyZSBmb3VuZCBhcyBhbmNlc3RvcnMgb2YgdGhlIGV2ZW50IHRhcmdldCxcbiAgLy8gZWZmZWN0aXZlbHkgZGVhY3RpdmF0ZSBrZXlkb3duIGhhbmRsaW5nIGJ5IGNhcHBpbmcgdGhlIHNldCBvZiBpbnN0YW5jZXNcbiAgLy8gd2l0aCBgbnVsbGAuXG4gIGlmICghaW5zdGFuY2VzQXJyYXkubGVuZ3RoKSB7XG4gICAgX2luc3RhbmNlcy5hZGQobnVsbCk7XG4gIH0gZWxzZSB7XG4gICAgX2luc3RhbmNlcy5kZWxldGUobnVsbCk7XG5cbiAgICAvLyBkZWxldGluZyBhbmQgdGhlbiBhZGRpbmcgdGhlIGluc3RhbmNlKHMpIGhhcyB0aGUgZWZmZWN0IG9mIHNvcnRpbmcgdGhlIHNldFxuICAgIC8vIGFjY29yZGluZyB0byBpbnN0YW5jZSBhY3RpdmF0aW9uIChhc2NlbmRpbmcpXG4gICAgaW5zdGFuY2VzQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICAgIF9pbnN0YW5jZXMuZGVsZXRlKGluc3RhbmNlKTtcbiAgICAgIF9pbnN0YW5jZXMuYWRkKGluc3RhbmNlKTtcbiAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiBkZWxldGVJbnN0YW5jZVxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IEluc3RhbnRpYXRlZCBjbGFzcyB0aGF0IGV4dGVuZGVkIFJlYWN0LkNvbXBvbmVudFxuICogQHJldHVybiB7Ym9vbGVhbn0gVGhlIHZhbHVlIHNldC5oYXMoIHRhcmdldCApIHdvdWxkIGhhdmUgcmV0dXJuZWQgcHJpb3IgdG8gZGVsZXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZUluc3RhbmNlKHRhcmdldCkge1xuICBfaW5zdGFuY2VzLmRlbGV0ZSh0YXJnZXQpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRCaW5kaW5nRm9yRXZlbnQoZXZlbnQpIHtcbiAgaWYgKCFfaW5zdGFuY2VzLmhhcyhudWxsKSkge1xuICAgIHZhciBrZXlNYXRjaGVzRXZlbnQgPSBmdW5jdGlvbiBrZXlNYXRjaGVzRXZlbnQoa2V5U2V0KSB7XG4gICAgICByZXR1cm4gbWF0Y2hLZXlzKHsga2V5U2V0OiBrZXlTZXQsIGV2ZW50OiBldmVudCB9KTtcbiAgICB9O1xuXG4gICAgLy8gbG9vcCB0aHJvdWdoIGluc3RhbmNlcyBpbiByZXZlcnNlIGFjdGl2YXRpb24gb3JkZXIgc28gdGhhdCBtb3N0XG4gICAgLy8gcmVjZW50bHkgYWN0aXZhdGVkIGluc3RhbmNlIGdldHMgZmlyc3QgZGlicyBvbiBldmVudFxuICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShfaW5zdGFuY2VzKSkucmV2ZXJzZSgpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICB2YXIgYmluZGluZ3MgPSBnZXRCaW5kaW5nKGluc3RhbmNlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSk7XG4gICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWU7XG4gICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yMiA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSBiaW5kaW5nc1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMjsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IChfc3RlcDIgPSBfaXRlcmF0b3IyLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZSkge1xuICAgICAgICAgICAgdmFyIF9zdGVwMiR2YWx1ZSA9IF9zbGljZWRUb0FycmF5KF9zdGVwMi52YWx1ZSwgMiksXG4gICAgICAgICAgICAgICAga2V5U2V0cyA9IF9zdGVwMiR2YWx1ZVswXSxcbiAgICAgICAgICAgICAgICBmbiA9IF9zdGVwMiR2YWx1ZVsxXTtcblxuICAgICAgICAgICAgaWYgKGtleVNldHMuc29tZShrZXlNYXRjaGVzRXZlbnQpKSB7XG4gICAgICAgICAgICAgIC8vIHJldHVybiB3aGVuIG1hdGNoaW5nIGtleWJpbmRpbmcgaXMgZm91bmQgLSBpLmUuIG9ubHkgb25lXG4gICAgICAgICAgICAgIC8vIGtleWJvdW5kIGNvbXBvbmVudCBjYW4gcmVzcG9uZCB0byBhIGdpdmVuIGtleSBjb2RlLiB0byBnZXQgYXJvdW5kIHRoaXMsXG4gICAgICAgICAgICAgIC8vIHNjb3BlIGEgY29tbW9uIGFuY2VzdG9yIGNvbXBvbmVudCBjbGFzcyB3aXRoIEBrZXlkb3duIGFuZCB1c2VcbiAgICAgICAgICAgICAgLy8gQGtleWRvd25TY29wZWQgdG8gYmluZCB0aGUgZHVwbGljYXRlIGtleXMgaW4geW91ciBjaGlsZCBjb21wb25lbnRzXG4gICAgICAgICAgICAgIC8vIChvciBqdXN0IGluc3BlY3QgbmV4dFByb3BzLmtleWRvd24uZXZlbnQpLlxuICAgICAgICAgICAgICByZXR1cm4geyBmbjogZm4sIGluc3RhbmNlOiBpbnN0YW5jZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IyID0gdHJ1ZTtcbiAgICAgICAgICBfaXRlcmF0b3JFcnJvcjIgPSBlcnI7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgJiYgX2l0ZXJhdG9yMi5yZXR1cm4pIHtcbiAgICAgICAgICAgICAgX2l0ZXJhdG9yMi5yZXR1cm4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMikge1xuICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBnZXRCaW5kaW5nXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXQgQ2xhc3MgdXNlZCBhcyBrZXkgaW4gZGljdCBvZiBrZXkgYmluZGluZ3NcbiAqIEByZXR1cm4ge29iamVjdH0gVGhlIG9iamVjdCBjb250YWluaW5nIGJpbmRpbmdzIGZvciB0aGUgZ2l2ZW4gY2xhc3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEJpbmRpbmcoX3JlZikge1xuICB2YXIgX19yZWFjdEtleWRvd25VVUlEID0gX3JlZi5fX3JlYWN0S2V5ZG93blVVSUQ7XG5cbiAgcmV0dXJuIF9oYW5kbGVycy5nZXQoX19yZWFjdEtleWRvd25VVUlEKTtcbn07XG5cbi8qKlxuICogZ2V0SW5zdGFuY2VzXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEByZXR1cm4ge3NldH0gQWxsIHN0b3JlZCBpbnN0YW5jZXMgKGFsbCBtb3VudGVkIGNvbXBvbmVudCBpbnN0YW5jZXMgd2l0aCBrZXliaW5kaW5ncylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEluc3RhbmNlcygpIHtcbiAgcmV0dXJuIF9pbnN0YW5jZXM7XG59O1xuXG4vKipcbiAqIGlzRW1wdHlcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHJldHVybiB7bnVtYmVyfSBTaXplIG9mIHRoZSBzZXQgb2YgYWxsIHN0b3JlZCBpbnN0YW5jZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHkoKSB7XG4gIHJldHVybiAhX2luc3RhbmNlcy5zaXplO1xufTtcblxuLyoqXG4gKiBzZXRCaW5kaW5nXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzIEFsbCBhcmd1bWVudHMgbmVjZXNzYXJ5IHRvIHNldCB0aGUgYmluZGluZ1xuICogQHBhcmFtIHthcnJheX0gYXJncy5rZXlzIEtleSBjb2RlcyB0aGF0IHNob3VsZCB0cmlnZ2VyIHRoZSBmblxuICogQHBhcmFtIHtmdW5jdGlvbn0gYXJncy5mbiBUaGUgY2FsbGJhY2sgdG8gYmUgdHJpZ2dlcmVkIHdoZW4gZ2l2ZW4ga2V5cyBhcmUgcHJlc3NlZFxuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MudGFyZ2V0IFRoZSBkZWNvcmF0ZWQgY2xhc3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEJpbmRpbmcoX3JlZjIpIHtcbiAgdmFyIGtleXMgPSBfcmVmMi5rZXlzLFxuICAgICAgZm4gPSBfcmVmMi5mbixcbiAgICAgIHRhcmdldCA9IF9yZWYyLnRhcmdldDtcblxuICB2YXIga2V5U2V0cyA9IHBhcnNlS2V5cyhrZXlzKTtcblxuICB2YXIgX19yZWFjdEtleWRvd25VVUlEID0gdGFyZ2V0Ll9fcmVhY3RLZXlkb3duVVVJRDtcblxuICBpZiAoIV9fcmVhY3RLZXlkb3duVVVJRCkge1xuICAgIHRhcmdldC5fX3JlYWN0S2V5ZG93blVVSUQgPSB1dWlkKCk7XG4gICAgX2hhbmRsZXJzLnNldCh0YXJnZXQuX19yZWFjdEtleWRvd25VVUlELCBuZXcgTWFwKFtba2V5U2V0cywgZm5dXSkpO1xuICB9IGVsc2Uge1xuICAgIF9oYW5kbGVycy5nZXQoX19yZWFjdEtleWRvd25VVUlEKS5zZXQoa2V5U2V0cywgZm4pO1xuICB9XG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL3N0b3JlLmpzXG4vLyBtb2R1bGUgaWQgPSAxNDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gTWFrZSBzdXJlIGBnbG9iYWxgIGlzIGRlZmluZWQgZ2xvYmFsbHk6XG4vL1x0LSBlaXRoZXIgYXMgdGhlIG5vZGVqcyBgZ2xvYmFsYCwgb3Jcbi8vXHQtIGFzIGFuIGFsaWFzIGZvciBgd2luZG93YCBpbiBicm93c2Vycywgb3Jcbi8vXHQtIGZvciB0aGUgYHNlbGZgIGNvbnRleHQgaW4gd2ViIHdvcmtlcnMuXG4vL1xuLy8gTk9URTogdGhpcyBtb2RpZmllcyB0aGUgXCJnbG9iYWxcIiBlbnZpcm9ubWVudCBieSBtYWtpbmcgc3VyZSBcImdsb2JhbFwiIGlzIHNldC4hXG4vL1xuXG5sZXQgZ2xvYmFsX2lkZW50aWZpZXI7XG5pZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuLy9cdGNvbnNvbGUubG9nKFwiUnVubmluZyBpbiBub2RlXCIpO1xuXHRnbG9iYWxfaWRlbnRpZmllciA9IGdsb2JhbDtcbn1cblxuaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbi8vXHRjb25zb2xlLmxvZyhcIlJ1bm5pbmcgaW4gYSB3ZWIgYnJvd3NlclwiKTtcblx0d2luZG93Lmdsb2JhbCA9IHdpbmRvdztcblx0Z2xvYmFsX2lkZW50aWZpZXIgPSB3aW5kb3c7XG59XG5cbmlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIikge1xuLy9cdGNvbnNvbGUubG9nKFwiUnVubmluZyBpbiBhIHdlYiB3b3JrZXJcIik7XG5cdHNlbGYuZ2xvYmFsID0gc2VsZjtcblx0Z2xvYmFsX2lkZW50aWZpZXIgPSBzZWxmO1xufVxuXG4vLyBFeHBvcnQgZm9yIGNvbnN1bXB0aW9uIGJ5IGltcG9ydC5cbmV4cG9ydCBkZWZhdWx0IGdsb2JhbF9pZGVudGlmaWVyO1xuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdXRpbHMvZ2xvYmFsLmpzIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fY29mLmpzXG4vLyBtb2R1bGUgaWQgPSAxNzlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gSUUgOC0gZG9uJ3QgZW51bSBidWcga2V5c1xubW9kdWxlLmV4cG9ydHMgPSAoXG4gICdjb25zdHJ1Y3RvcixoYXNPd25Qcm9wZXJ0eSxpc1Byb3RvdHlwZU9mLHByb3BlcnR5SXNFbnVtZXJhYmxlLHRvTG9jYWxlU3RyaW5nLHRvU3RyaW5nLHZhbHVlT2YnXG4pLnNwbGl0KCcsJyk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSAxODBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJyk7XG52YXIgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIGRQLmYob2JqZWN0LCBrZXksIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faGlkZS5qc1xuLy8gbW9kdWxlIGlkID0gMTgxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZmFsc2U7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19saWJyYXJ5LmpzXG4vLyBtb2R1bGUgaWQgPSAxODJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gMTkuMS4yLjE0IC8gMTUuMi4zLjE0IE9iamVjdC5rZXlzKE8pXG52YXIgJGtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cy1pbnRlcm5hbCcpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIGtleXMoTykge1xuICByZXR1cm4gJGtleXMoTywgZW51bUJ1Z0tleXMpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1rZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSAxODNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cy5mID0ge30ucHJvcGVydHlJc0VudW1lcmFibGU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtcGllLmpzXG4vLyBtb2R1bGUgaWQgPSAxODRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYml0bWFwLCB2YWx1ZSkge1xuICByZXR1cm4ge1xuICAgIGVudW1lcmFibGU6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlOiAhKGJpdG1hcCAmIDQpLFxuICAgIHZhbHVlOiB2YWx1ZVxuICB9O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3Byb3BlcnR5LWRlc2MuanNcbi8vIG1vZHVsZSBpZCA9IDE4NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4vX2hpZGUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBTUkMgPSByZXF1aXJlKCcuL191aWQnKSgnc3JjJyk7XG52YXIgVE9fU1RSSU5HID0gJ3RvU3RyaW5nJztcbnZhciAkdG9TdHJpbmcgPSBGdW5jdGlvbltUT19TVFJJTkddO1xudmFyIFRQTCA9ICgnJyArICR0b1N0cmluZykuc3BsaXQoVE9fU1RSSU5HKTtcblxucmVxdWlyZSgnLi9fY29yZScpLmluc3BlY3RTb3VyY2UgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuICR0b1N0cmluZy5jYWxsKGl0KTtcbn07XG5cbihtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChPLCBrZXksIHZhbCwgc2FmZSkge1xuICB2YXIgaXNGdW5jdGlvbiA9IHR5cGVvZiB2YWwgPT0gJ2Z1bmN0aW9uJztcbiAgaWYgKGlzRnVuY3Rpb24pIGhhcyh2YWwsICduYW1lJykgfHwgaGlkZSh2YWwsICduYW1lJywga2V5KTtcbiAgaWYgKE9ba2V5XSA9PT0gdmFsKSByZXR1cm47XG4gIGlmIChpc0Z1bmN0aW9uKSBoYXModmFsLCBTUkMpIHx8IGhpZGUodmFsLCBTUkMsIE9ba2V5XSA/ICcnICsgT1trZXldIDogVFBMLmpvaW4oU3RyaW5nKGtleSkpKTtcbiAgaWYgKE8gPT09IGdsb2JhbCkge1xuICAgIE9ba2V5XSA9IHZhbDtcbiAgfSBlbHNlIGlmICghc2FmZSkge1xuICAgIGRlbGV0ZSBPW2tleV07XG4gICAgaGlkZShPLCBrZXksIHZhbCk7XG4gIH0gZWxzZSBpZiAoT1trZXldKSB7XG4gICAgT1trZXldID0gdmFsO1xuICB9IGVsc2Uge1xuICAgIGhpZGUoTywga2V5LCB2YWwpO1xuICB9XG4vLyBhZGQgZmFrZSBGdW5jdGlvbiN0b1N0cmluZyBmb3IgY29ycmVjdCB3b3JrIHdyYXBwZWQgbWV0aG9kcyAvIGNvbnN0cnVjdG9ycyB3aXRoIG1ldGhvZHMgbGlrZSBMb0Rhc2ggaXNOYXRpdmVcbn0pKEZ1bmN0aW9uLnByb3RvdHlwZSwgVE9fU1RSSU5HLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuIHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgJiYgdGhpc1tTUkNdIHx8ICR0b1N0cmluZy5jYWxsKHRoaXMpO1xufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19yZWRlZmluZS5qc1xuLy8gbW9kdWxlIGlkID0gMTg2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIFNIQVJFRCA9ICdfX2NvcmUtanNfc2hhcmVkX18nO1xudmFyIHN0b3JlID0gZ2xvYmFsW1NIQVJFRF0gfHwgKGdsb2JhbFtTSEFSRURdID0ge30pO1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICByZXR1cm4gc3RvcmVba2V5XSB8fCAoc3RvcmVba2V5XSA9IHZhbHVlICE9PSB1bmRlZmluZWQgPyB2YWx1ZSA6IHt9KTtcbn0pKCd2ZXJzaW9ucycsIFtdKS5wdXNoKHtcbiAgdmVyc2lvbjogY29yZS52ZXJzaW9uLFxuICBtb2RlOiByZXF1aXJlKCcuL19saWJyYXJ5JykgPyAncHVyZScgOiAnZ2xvYmFsJyxcbiAgY29weXJpZ2h0OiAnwqkgMjAxOCBEZW5pcyBQdXNoa2FyZXYgKHpsb2lyb2NrLnJ1KSdcbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLmpzXG4vLyBtb2R1bGUgaWQgPSAxODdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gNy4xLjEgVG9QcmltaXRpdmUoaW5wdXQgWywgUHJlZmVycmVkVHlwZV0pXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbi8vIGluc3RlYWQgb2YgdGhlIEVTNiBzcGVjIHZlcnNpb24sIHdlIGRpZG4ndCBpbXBsZW1lbnQgQEB0b1ByaW1pdGl2ZSBjYXNlXG4vLyBhbmQgdGhlIHNlY29uZCBhcmd1bWVudCAtIGZsYWcgLSBwcmVmZXJyZWQgdHlwZSBpcyBhIHN0cmluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIFMpIHtcbiAgaWYgKCFpc09iamVjdChpdCkpIHJldHVybiBpdDtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmIChTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICBpZiAodHlwZW9mIChmbiA9IGl0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKCFTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBwcmltaXRpdmUgdmFsdWVcIik7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzXG4vLyBtb2R1bGUgaWQgPSAxODhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudDtcbi8vIHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFbGVtZW50IGlzICdvYmplY3QnIGluIG9sZCBJRVxudmFyIGlzID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGlzID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChpdCkgOiB7fTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzXG4vLyBtb2R1bGUgaWQgPSAyNzlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSAmJiAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdkaXYnKSwgJ2EnLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfSB9KS5hICE9IDc7XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2llOC1kb20tZGVmaW5lLmpzXG4vLyBtb2R1bGUgaWQgPSAyODBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gMTkuMS4yLjcgLyAxNS4yLjMuNCBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxudmFyICRrZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMtaW50ZXJuYWwnKTtcbnZhciBoaWRkZW5LZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpLmNvbmNhdCgnbGVuZ3RoJywgJ3Byb3RvdHlwZScpO1xuXG5leHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKE8pIHtcbiAgcmV0dXJuICRrZXlzKE8sIGhpZGRlbktleXMpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BuLmpzXG4vLyBtb2R1bGUgaWQgPSAyODFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cy5mID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BzLmpzXG4vLyBtb2R1bGUgaWQgPSAyODJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciBhcnJheUluZGV4T2YgPSByZXF1aXJlKCcuL19hcnJheS1pbmNsdWRlcycpKGZhbHNlKTtcbnZhciBJRV9QUk9UTyA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lcykge1xuICB2YXIgTyA9IHRvSU9iamVjdChvYmplY3QpO1xuICB2YXIgaSA9IDA7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIGtleTtcbiAgZm9yIChrZXkgaW4gTykgaWYgKGtleSAhPSBJRV9QUk9UTykgaGFzKE8sIGtleSkgJiYgcmVzdWx0LnB1c2goa2V5KTtcbiAgLy8gRG9uJ3QgZW51bSBidWcgJiBoaWRkZW4ga2V5c1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkgaWYgKGhhcyhPLCBrZXkgPSBuYW1lc1tpKytdKSkge1xuICAgIH5hcnJheUluZGV4T2YocmVzdWx0LCBrZXkpIHx8IHJlc3VsdC5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qc1xuLy8gbW9kdWxlIGlkID0gMjgzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBzaGFyZWQgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgna2V5cycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBzaGFyZWRba2V5XSB8fCAoc2hhcmVkW2tleV0gPSB1aWQoa2V5KSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLWtleS5qc1xuLy8gbW9kdWxlIGlkID0gMjg0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDcuMS40IFRvSW50ZWdlclxudmFyIGNlaWwgPSBNYXRoLmNlaWw7XG52YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGlzTmFOKGl0ID0gK2l0KSA/IDAgOiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW50ZWdlci5qc1xuLy8gbW9kdWxlIGlkID0gMjg1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMuZiA9IHJlcXVpcmUoJy4vX3drcycpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fd2tzLWV4dC5qc1xuLy8gbW9kdWxlIGlkID0gMjg2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qXG5cdE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cdEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG4vLyBjc3MgYmFzZSBjb2RlLCBpbmplY3RlZCBieSB0aGUgY3NzLWxvYWRlclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1c2VTb3VyY2VNYXApIHtcblx0dmFyIGxpc3QgPSBbXTtcblxuXHQvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG5cdGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcblx0XHRcdHZhciBjb250ZW50ID0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtLCB1c2VTb3VyY2VNYXApO1xuXHRcdFx0aWYoaXRlbVsyXSkge1xuXHRcdFx0XHRyZXR1cm4gXCJAbWVkaWEgXCIgKyBpdGVtWzJdICsgXCJ7XCIgKyBjb250ZW50ICsgXCJ9XCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gY29udGVudDtcblx0XHRcdH1cblx0XHR9KS5qb2luKFwiXCIpO1xuXHR9O1xuXG5cdC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG5cdGxpc3QuaSA9IGZ1bmN0aW9uKG1vZHVsZXMsIG1lZGlhUXVlcnkpIHtcblx0XHRpZih0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIilcblx0XHRcdG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIFwiXCJdXTtcblx0XHR2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaWQgPSB0aGlzW2ldWzBdO1xuXHRcdFx0aWYodHlwZW9mIGlkID09PSBcIm51bWJlclwiKVxuXHRcdFx0XHRhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG5cdFx0fVxuXHRcdGZvcihpID0gMDsgaSA8IG1vZHVsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpdGVtID0gbW9kdWxlc1tpXTtcblx0XHRcdC8vIHNraXAgYWxyZWFkeSBpbXBvcnRlZCBtb2R1bGVcblx0XHRcdC8vIHRoaXMgaW1wbGVtZW50YXRpb24gaXMgbm90IDEwMCUgcGVyZmVjdCBmb3Igd2VpcmQgbWVkaWEgcXVlcnkgY29tYmluYXRpb25zXG5cdFx0XHQvLyAgd2hlbiBhIG1vZHVsZSBpcyBpbXBvcnRlZCBtdWx0aXBsZSB0aW1lcyB3aXRoIGRpZmZlcmVudCBtZWRpYSBxdWVyaWVzLlxuXHRcdFx0Ly8gIEkgaG9wZSB0aGlzIHdpbGwgbmV2ZXIgb2NjdXIgKEhleSB0aGlzIHdheSB3ZSBoYXZlIHNtYWxsZXIgYnVuZGxlcylcblx0XHRcdGlmKHR5cGVvZiBpdGVtWzBdICE9PSBcIm51bWJlclwiIHx8ICFhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG5cdFx0XHRcdGlmKG1lZGlhUXVlcnkgJiYgIWl0ZW1bMl0pIHtcblx0XHRcdFx0XHRpdGVtWzJdID0gbWVkaWFRdWVyeTtcblx0XHRcdFx0fSBlbHNlIGlmKG1lZGlhUXVlcnkpIHtcblx0XHRcdFx0XHRpdGVtWzJdID0gXCIoXCIgKyBpdGVtWzJdICsgXCIpIGFuZCAoXCIgKyBtZWRpYVF1ZXJ5ICsgXCIpXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGlzdC5wdXNoKGl0ZW0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0cmV0dXJuIGxpc3Q7XG59O1xuXG5mdW5jdGlvbiBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0sIHVzZVNvdXJjZU1hcCkge1xuXHR2YXIgY29udGVudCA9IGl0ZW1bMV0gfHwgJyc7XG5cdHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcblx0aWYgKCFjc3NNYXBwaW5nKSB7XG5cdFx0cmV0dXJuIGNvbnRlbnQ7XG5cdH1cblxuXHRpZiAodXNlU291cmNlTWFwICYmIHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0dmFyIHNvdXJjZU1hcHBpbmcgPSB0b0NvbW1lbnQoY3NzTWFwcGluZyk7XG5cdFx0dmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcblx0XHRcdHJldHVybiAnLyojIHNvdXJjZVVSTD0nICsgY3NzTWFwcGluZy5zb3VyY2VSb290ICsgc291cmNlICsgJyAqLydcblx0XHR9KTtcblxuXHRcdHJldHVybiBbY29udGVudF0uY29uY2F0KHNvdXJjZVVSTHMpLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oJ1xcbicpO1xuXHR9XG5cblx0cmV0dXJuIFtjb250ZW50XS5qb2luKCdcXG4nKTtcbn1cblxuLy8gQWRhcHRlZCBmcm9tIGNvbnZlcnQtc291cmNlLW1hcCAoTUlUKVxuZnVuY3Rpb24gdG9Db21tZW50KHNvdXJjZU1hcCkge1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0dmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSk7XG5cdHZhciBkYXRhID0gJ3NvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LCcgKyBiYXNlNjQ7XG5cblx0cmV0dXJuICcvKiMgJyArIGRhdGEgKyAnICovJztcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1xuLy8gbW9kdWxlIGlkID0gMjg3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIFNwZWxsIFwicGFyc2VyXCIgY2xhc3MuXG4vL1xuXG4vLyBUT0RPOiBkZXBlbmRlbmN5LWluamVjdCB0b2tlbml6ZXI/XG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuL1Rva2VuaXplci5qc1wiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4vUnVsZS5qc1wiO1xuaW1wb3J0IHBhcnNlUnVsZSBmcm9tIFwiLi9SdWxlU3ludGF4LmpzXCI7XG5pbXBvcnQgeyBjbG9uZUNsYXNzIH0gZnJvbSBcIi4vdXRpbHMvY2xhc3MuanNcIjtcblxuLy8gR1JSUi4uLiB3aWxsIFNPTUVPTkUgb24gdGhlIG5vZGUgdGVhbSBwbGVhc2UgaW1wbGVtZW50IGNvbnNvbGUuZ3JvdXAgPz8/XG5pZiAoIWNvbnNvbGUuZ3JvdXApIGNvbnNvbGUuZ3JvdXAgPSBjb25zb2xlLmxvZztcbmlmICghY29uc29sZS5ncm91cEVuZCkgY29uc29sZS5ncm91cEVuZCA9IGNvbnNvbGUubG9nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJzZXIge1xuXHQvLyBTZXQgdG8gYHRydWVgIHRvIG91dHB1dCBkZWJ1ZyBpbmZvIHdoaWxlIGFkZGluZyBydWxlc1xuXHRzdGF0aWMgREVCVUcgPSBmYWxzZTtcblxuXHQvLyBTaG91bGQgd2Ugd2FybiBhYm91dCBhbm9tYWxvdXMgY29uZGl0aW9ucz9cblx0c3RhdGljIFdBUk4gPSBmYWxzZTtcblxuXHQvLyBTZXQgdG8gYHRydWVgIHRvIG91dHB1dCB0aW1pbmcgaW5mby5cblx0c3RhdGljIFRJTUUgPSBmYWxzZTtcblxuXHQvLyBDb25zdHJ1Y3Rvci5cblx0Y29uc3RydWN0b3IocHJvcGVydGllcykge1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywgcHJvcGVydGllcyk7XG5cdH1cblxuLy9cbi8vIyMjIFBhcnNpbmdcbi8vXG5cdC8vIFBhcnNlIGBydWxlTmFtZWAgcnVsZSBhdCBoZWFkIG9mIGB0ZXh0YC5cblx0Ly8gSWYgeW91IHBhc3Mgb25seSBvbmUgYXJndW1lbnQsIHdlJ2xsIGFzc3VtZSB0aGF0J3MgYHRleHRgIGFuZCB5b3Ugd2FudCB0byBtYXRjaCBgc3RhdGVtZW50c2AuXG5cdC8vIEhhbmRsZXMgb3B0aW9uYWwgYW5kIHJlcGVhdGluZyBydWxlcyBhcyB3ZWxsIGFzIGVhdGluZyB3aGl0ZXNwYWNlLlxuXHQvLyBSZXR1cm5zIHJlc3VsdCBvZiBwYXJzZS5cbi8vVEVTVE1FXG5cdHBhcnNlKHJ1bGVOYW1lLCB0ZXh0KSB7XG5cdFx0Ly8gSWYgb25seSBvbmUgYXJndW1lbnQsIGFzc3VtZSB0aGF0J3MgdGhlIHRleHQgYW5kIHBhcnNlIGBzdGF0ZW1lbnRzYFxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHR0ZXh0ID0gcnVsZU5hbWU7XG5cdFx0XHRydWxlTmFtZSA9IFwic3RhdGVtZW50c1wiO1xuXHRcdH1cblxuXHRcdC8vIENvbnZlcnQgdG8gdG9rZW5zLlxuXHRcdGlmIChQYXJzZXIuVElNRSkgY29uc29sZS50aW1lKFwidG9rZW5pemVcIik7XG5cdFx0bGV0IHRva2VucyA9IFRva2VuaXplci50b2tlbml6ZSh0ZXh0KTtcblx0XHQvLyBlYXQgbm9uLWluZGVudCB3aGl0ZXNwYWNlIChzaW5jZSB3ZSBpZ25vcmUgaXQpXG5cdFx0dG9rZW5zID0gdG9rZW5zLmZpbHRlcih0b2tlbiA9PiAhVG9rZW5pemVyLmlzTm9ybWFsV2hpdGVzcGFjZSh0b2tlbikpO1xuXHRcdGlmIChQYXJzZXIuVElNRSkgY29uc29sZS50aW1lRW5kKFwidG9rZW5pemVcIik7XG5cblx0XHQvLyBCYWlsIGlmIHdlIGRpZG4ndCBnZXQgYW55IHRva2VucyBiYWNrLlxuXHRcdGlmICghdG9rZW5zIHx8IHRva2Vucy5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRpZiAoUGFyc2VyLlRJTUUpIGNvbnNvbGUudGltZShcInBhcnNlXCIpO1xuXHRcdC8vIElmIHdlJ3JlIG5vdCBwYXJzaW5nIGBzdGF0ZW1lbnRzYCwgZWF0IHdoaXRlc3BhY2UgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZS5cblx0XHRpZiAocnVsZU5hbWUgIT09IFwic3RhdGVtZW50c1wiKSB7XG5cdFx0XHR0b2tlbnMgPSBUb2tlbml6ZXIucmVtb3ZlTGVhZGluZ1doaXRlc3BhY2UodG9rZW5zKTtcblx0XHR9XG5cblx0XHQvLyBQYXJzZSB0aGUgcnVsZSBvciB0aHJvdyBhbiBleGNlcHRpb24gaWYgcnVsZSBub3QgZm91bmQuXG5cdFx0bGV0IHJlc3VsdCA9IHRoaXMucGFyc2VOYW1lZFJ1bGUocnVsZU5hbWUsIHRva2VucywgMCwgdG9rZW5zLmxlbmd0aCwgdW5kZWZpbmVkLCBcInBhcnNlci5wYXJzZSgpXCIpO1xuXHRcdGlmIChQYXJzZXIuVElNRSkgY29uc29sZS50aW1lRW5kKFwicGFyc2VcIik7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cblxuXHQvLyBQYXJzZSBgdGV4dGAgYW5kIHJldHVybiB0aGUgcmVzdWx0aW5nIHNvdXJjZSBjb2RlLlxuXHQvL1x0LSBpZiBvbmUgc3RyaW5nIGFyZ3VtZW50LCBjb21waWxlcyBhcyBcInN0YXRlbWVudHNcIlxuXHQvLyBUaHJvd3MgaWYgbm90IHBhcnNlYWJsZS5cbi8vVEVTVE1FXG5cdGNvbXBpbGUocnVsZU5hbWUsIHRleHQpIHtcblx0XHQvLyBJZiBvbmx5IG9uZSBhcmd1bWVudCwgYXNzdW1lIHRoYXQncyB0aGUgdGV4dCBhbmQgcGFyc2UgYHN0YXRlbWVudHNgXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHRleHQgPSBydWxlTmFtZTtcblx0XHRcdHJ1bGVOYW1lID0gXCJzdGF0ZW1lbnRzXCI7XG5cdFx0fVxuXHRcdGxldCByZXN1bHQgPSB0aGlzLnBhcnNlKHJ1bGVOYW1lLCB0ZXh0KTtcblx0XHRpZiAoIXJlc3VsdCkgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBwYXJzZXIucGFyc2UoJyR7cnVsZU5hbWV9JywgJyR7dGV4dH0nKTogY2FuJ3QgcGFyc2UgdGhpc2ApO1xuXHRcdHJldHVybiByZXN1bHQudG9Tb3VyY2UodGhpcyk7XG5cdH1cblxuXG5cdC8vIFBhcnNlIGEgbmFtZWQgcnVsZSAoZGVmaW5lZCBpbiB0aGlzIHBhcnNlciBvciBpbiBhbnkgb2Ygb3VyIGBpbXBvcnRzYCksIHJldHVybmluZyB0aGUgXCJiZXN0XCIgbWF0Y2guXG5cdC8vIFJldHVybnMgYHVuZGVmaW5lZGAgaWYgbm8gbWF0Y2guXG5cdC8vIFRocm93cyBpZiBydWxlIGlzIG5vdCBpbXBsZW1lbnRlZC5cblx0cGFyc2VOYW1lZFJ1bGUocnVsZU5hbWUsIHRva2Vucywgc3RhcnQsIGVuZCwgc3RhY2ssIGNhbGxpbmdDb250ZXh0ID0gXCJwYXJzZU5hbWVkUnVsZVwiKSB7XG4gICAgY29uc3QgcnVsZSA9IHRoaXMucnVsZXNbcnVsZU5hbWVdO1xuXHRcdGlmICghcnVsZSkgdGhyb3cgbmV3IFN5bnRheEVycm9yKGAke2NhbGxpbmdDb250ZXh0fTogcnVsZSAnJHtydWxlTmFtZX0nIG5vdCBmb3VuZGApO1xuICAgIHJldHVybiBydWxlLnBhcnNlKHRoaXMsIHRva2Vucywgc3RhcnQsIGVuZCwgc3RhY2spO1xuXHR9XG5cblx0Ly8gVGVzdCB3aGV0aGVyIGEgcnVsZSAod2hpY2ggbWF5IGJlIHNwZWNpZmllZCBieSBuYW1lKSBNSUdIVCBiZSBmb3VuZCBpbiBoZWFkIG9mIHN0cmVhbS5cblx0Ly8gUmV0dXJuczpcblx0Ly9cdC0gYHRydWVgIGlmIHRoZSBydWxlIE1JR0hUIGJlIG1hdGNoZWQuXG5cdC8vXHQtIGBmYWxzZWAgaWYgdGhlcmUgaXMgTk8gV0FZIHRoZSBydWxlIGNhbiBiZSBtYXRjaGVkLlxuXHQvL1x0LSBgdW5kZWZpbmVkYCBpZiBub3QgZGV0ZXJtaW5zdGljIChlZzogbm8gd2F5IHRvIHRlbGwgcXVpY2tseSkuXG5cdHRlc3QocnVsZSwgdG9rZW5zLCBzdGFydCwgZW5kKSB7XG5cdCAgaWYgKHR5cGVvZiBydWxlID09PSBcInN0cmluZ1wiKSB7XG5cdCAgICBydWxlID0gdGhpcy5ydWxlc1tydWxlXTtcblx0ICAgIGlmICghcnVsZSkgcmV0dXJuIHVuZGVmaW5lZDsgICAgLy8gVE9ETzogdGhyb3c/XG5cdCAgfVxuXHQgIHJldHVybiBydWxlLnRlc3QodGhpcywgdG9rZW5zLCBzdGFydCwgZW5kKTtcblx0fVxuXG5cbi8vXG4vLyAjIyMgXHRJbXBvcnRzXG4vL1x0XHRQYXJzZXJzIGNhbiBkZXBlbmQgb24gb3RoZXIgcGFyc2VycyBmb3IgYWRkaXRpb25hbCBgcnVsZXNgLlxuLy9cdFx0SW1wb3J0cyBhcmUgbGF6eS1ib3VuZCBpbnRvIGBwYXJzZXIucnVsZXNgIGFzIG5lY2Vzc2FyeS5cbi8vICAgIFdlIGFzc3VtZSB0aGUgdG9wLWxldmVsIHBhcnNlciBmb3IgYSBsYW5ndWFnZSB3aWxsIGluY2x1ZGUgYWxsIG5lY2Vzc2FyeSBpbXBvcnRzIGF1dG9tYXRpY2FsbHkuXG4vL1xuXG5cdC8vIEFkZCBvbmUgb3IgbW9yZSBuYW1lZCBpbXBvcnRzIHRvIHRoaXMgcGFyc2VyLlxuXHQvLyBJbXBvcnRzIGluY3JlYXNlIGluIHByaW9yaXR5IHRoZSBsYXRlciB0aGV5IGFyZSBpbiB0aGUgbGlzdC5cbiAgaW1wb3J0cyA9IFtdO1xuXHRpbXBvcnQoLi4uaW1wb3J0cykge1xuXHRcdC8vIFJFVkVSU0UgdGhlIGxpc3Qgb2YgaW1wb3J0cywgc28gdGhlIG1vc3QgZ2VuZXJhbCBvbmUgaXMgTEFTVFxuXHRcdC8vIFRodXMgbW9yZSBzcGVjaWZpYyBpbXBvcnRzIHdpbGwgYmUgRUFSTElFUiBpbiB0aGUgYGltcG9ydHNgIGxpc3QuXG5cblx0XHQvLyBDcmVhdGUgbmV3IGFycmF5IG9mIGltcG9ydHMgYW5kIGFkZCBpbXBvcnQgbmFtZXMgcGFzc2VkIGluLlxuXHRcdHRoaXMuaW1wb3J0cyA9IGltcG9ydHMucmV2ZXJzZSgpLmNvbmNhdCh0aGlzLmltcG9ydHMpO1xuXG5cdFx0Ly8gY2xlYXIgY29uY2F0ZW5hdGVkIGxpc3Qgb2YgcnVsZXMgc28gd2UnbGwgcmVjYWN1bGF0ZSBpbiBgcGFyc2VyLnJ1bGVzYFxuXHRcdGRlbGV0ZSB0aGlzLl9fcnVsZXM7XG5cdH1cblxuLy9cbi8vICMjIyBSdWxlc1xuLy8gICAgTGlzdCBvZiBhbGwga25vd24gcnVsZXMgZm9yIHRoaXMgcGFyc2VyLlxuLy8gICAgWW91IGNhbiBhY2Nlc3MgbmFtZWQgcnVsZXMgYXMgYHBhcnNlci5ydWxlc1tcInJ1bGVOYW1lXCJdYFxuLy9cblx0Ly8gU3RhcnQgd2l0aCBhbiBlbXB0eSBtYXAgb2YgcnVsZXMuXG5cdF9ydWxlcyA9IHt9O1xuXG5cdC8vIFJldHVybiBtYXAgb2YgYWxsIGtub3duIHJ1bGVzIGJ5IHJ1bGUgbmFtZSwgaW5jbHVkaW5nIHJ1bGVzIGRlZmluZWQgaW4gb3VyIGltcG9ydHMuXG5cdC8vIE5PVEU6IFdlIG1lbW9pemUgdGhpcywgc28gbWFrZSBzdXJlIHRvIGNsZWFyIGBfX3J1bGVzYCBpZiB5b3UncmUgbWFuaXB1bGF0aW5nIHJ1bGVzIG9yIGltcG9ydHMhXG5cdGdldCBydWxlcygpIHtcblx0XHRpZiAoIXRoaXMuX19ydWxlcykge1xuXHRcdFx0Y29uc3Qgb3V0cHV0ID0gdGhpcy5fX3J1bGVzID0ge307XG5cdFx0XHQvLyBHZXQgYWxsIGltcG9ydGVkIHBhcnNlcnMsIHdpdGggdXMgbGFzdFxuXHRcdFx0Y29uc3QgaW1wb3J0cyA9IFt0aGlzXS5jb25jYXQodGhpcy5pbXBvcnRzLm1hcChQYXJzZXIuZm9yTmFtZSkpO1xuXG5cdFx0XHQvLyBGb3IgZWFjaCBwYXJzZXJcblx0XHRcdGltcG9ydHMuZm9yRWFjaChwYXJzZXIgPT4ge1xuXHRcdFx0XHRmb3IgKGNvbnN0IHJ1bGVOYW1lIGluIHBhcnNlci5fcnVsZXMpIHtcblx0XHRcdFx0ICB0aGlzLl9tZXJnZVJ1bGUob3V0cHV0LCBydWxlTmFtZSwgcGFyc2VyLl9ydWxlc1tydWxlTmFtZV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX19ydWxlcztcblx0fVxuXG4gIC8vIE1lcmdlIGBydWxlYCBpbnRvIGBtYXBgIG9mIHJ1bGVzIGJ5IGBydWxlTmFtZWAuXG4gIC8vIElmIHdlIGFscmVhZHkgaGF2ZSBhIHJ1bGUgd2l0aCB0aGF0IG5hbWUsIHdlJ2xsIGFkZCBpdCBhcyBhbiBhbHRlcm5hdGl2ZS5cbi8vVEVTVE1FXG4gIF9tZXJnZVJ1bGUobWFwLCBydWxlTmFtZSwgcnVsZSkge1xuICAgIGxldCBleGlzdGluZyA9IG1hcFtydWxlTmFtZV07XG4gICAgaWYgKCFleGlzdGluZykge1xuICAgICAgbWFwW3J1bGVOYW1lXSA9IHJ1bGU7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCEoZXhpc3RpbmcgaW5zdGFuY2VvZiBSdWxlLkFsdGVybmF0aXZlcykgfHwgKGV4aXN0aW5nLmdyb3VwICE9PSBydWxlTmFtZSkpIHtcbiAgICAgIGNvbnN0IGFsdENvbnN0cnVjdG9yID0gY2xvbmVDbGFzcyhSdWxlLkFsdGVybmF0aXZlcywgcnVsZU5hbWUpO1xuICAgICAgZXhpc3RpbmcgPSBtYXBbcnVsZU5hbWVdID0gbmV3IGFsdENvbnN0cnVjdG9yKHtcbiAgICAgICAgZ3JvdXA6IHJ1bGVOYW1lLFxuICAgICAgICBydWxlczogWyBleGlzdGluZyBdXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAocnVsZSBpbnN0YW5jZW9mIFJ1bGUuQWx0ZXJuYXRpdmVzICYmIChydWxlLmdyb3VwID09PSBydWxlTmFtZSkpIHtcbiAgICAgIGV4aXN0aW5nLmFkZFJ1bGUoLi4ucnVsZS5ydWxlcyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZXhpc3RpbmcuYWRkUnVsZShydWxlKTtcbiAgICB9XG4gIH1cblxuXHQvLyBBZGQgYSBgcnVsZWAgdG8gb3VyIGxpc3Qgb2YgcnVsZXMhXG5cdC8vIENvbnZlcnRzIHRvIGBhbHRlcm5hdGl2ZXNgIG9uIHJlLWRlZmluaW5nIHRoZSBzYW1lIHJ1bGUuXG5cdGFkZFJ1bGUocnVsZU5hbWUsIHJ1bGUpIHtcblx0XHQvLyBDbGVhciBtZW1vaXplZCBgX19ydWxlc2Agc28gd2UnbGwgcmVjYWxjdWxhdGUgYHBhcnNlci5ydWxlc2AgYXMgbmVjZXNzYXJ5XG5cdFx0ZGVsZXRlIHRoaXMuX19ydWxlcztcblxuXHRcdC8vIElmIHBhc3NlZCBhIGZ1bmN0aW9uLCBjcmVhdGUgYW4gaW5zdGFuY2UgZm9yIHRoZSBhY3R1YWwgcnVsZS5cblx0XHQvLyBUaGlzIGlzIGNvbW1vbmx5IGRvbmUgc28gSlMgd2lsbCBnaXZlIHVzIG1lYW5pbmdmdWwgY2xhc3MgbmFtZXMgaW4gZGVidWcgb3V0cHV0LlxuXHRcdGlmICh0eXBlb2YgcnVsZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRydWxlID0gbmV3IHJ1bGUoKTtcblx0XHR9XG5cblx0XHQvLyBJZiB3ZSBnb3QgYW4gYXJyYXkgb2YgYHJ1bGVOYW1lYHMsIHJlY3Vyc2l2ZWx5IGFkZCB1bmRlciBlYWNoIG5hbWUgd2l0aCB0aGUgc2FtZSBgcnVsZWAuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkocnVsZU5hbWUpKSB7XG5cdFx0XHRydWxlTmFtZS5mb3JFYWNoKHJ1bGVOYW1lID0+IHRoaXMuYWRkUnVsZShydWxlTmFtZSwgcnVsZSkgKTtcblx0XHRcdHJldHVybiBydWxlO1xuXHRcdH1cblxuXHRcdC8vIEFkZCB0byBvdXIgbGlzdCBvZiBfcnVsZXNcblx0XHR0aGlzLl9tZXJnZVJ1bGUodGhpcy5fcnVsZXMsIHJ1bGVOYW1lLCBydWxlKTtcblx0XHRyZXR1cm4gcnVsZTtcblx0fVxuXG5cdC8vIFJldHVybiB0aGUgY29uY2F0ZW5hdGVkIGJsYWNrbGlzdCBmb3IgYSBnaXZlbiBuYW1lZCBydWxlLlxuXHRnZXRCbGFja2xpc3QocnVsZU5hbWUpIHtcblx0ICBjb25zdCBydWxlID0gdGhpcy5ydWxlc1tydWxlTmFtZV07XG5cdCAgY29uc3QgcnVsZXMgPSBydWxlIGluc3RhbmNlb2YgUnVsZS5BbHRlcm5hdGl2ZXNcbiAgICAgICAgICA/IHJ1bGUucnVsZXNcbiAgICAgICAgICA6IFsgcnVsZSBdO1xuXHRcdHJldHVybiBydWxlcy5yZWR1Y2UoZnVuY3Rpb24gKGJsYWNrbGlzdCwgcnVsZSkge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oYmxhY2tsaXN0LCBydWxlLmJsYWNrbGlzdCk7XG5cdFx0fSwge30pO1xuXHR9XG5cbiAgLy8gRGVmaW5lIG11bHRpcGxlIHJ1bGVzIGF0IG9uY2UgdXNpbmcgcnVsZVN5bnRheC5cbiAgLy8gU2VlIGBSdWxlU3ludGF4LmpzOjpkZWZpbmVSdWxlKClgXG4gIGRlZmluZVJ1bGVzKCkge1xuICAgIGZvciAoY29uc3QgcnVsZSBvZiBhcmd1bWVudHMpIHtcbiAgICAgIHRoaXMuZGVmaW5lUnVsZShydWxlKTtcbiAgICB9XG4gIH1cblxuICAvLyBEZWZpbmUgYSBydWxlIHVzaW5nIChydWxlKWBzeW50YXhgIG9yIGBwYXR0ZXJuc2AgdG8gY3JlYXRlIHRoZSBydWxlIGluc3RhbmNlcy5cbiAgLy8gIGBuYW1lYCAoaWRlbnRpZmllciwgcmVxdWlyZWQpICBCYXNlIG5hbWUgb2YgdGhlIHJ1bGUuXG4gIC8vICBgYWxpYXNgIChzdHJpbmcgb3IgW3N0cmluZ10sIG9wdGluYWwpIE90aGVyIG5hbWVzIHRvIGRlZmluZSBydWxlIHVuZGVyLlxuICAvLyAgYGNhbm9uaWNhbGAgKHN0cmluZywgb3B0aW9uYWwpIENhbm9uaWNhbCBuYW1lIGZvciB0aGUgcnVsZSwgYXZhaWxhYmxlIG9uIGBSdWxlYCBmb3IgZGVidWdnaW5nLlxuICAvLyAgYGNvbnN0cnVjdG9yYCAoY2xhc3MsIHJlcXVpcmVkKSBDbGFzcyB3aGljaCB3aWxsIGJlIHVzZWQgdG8gaW5zdGFudGlhdGUgdGhlIHJ1bGUuXG4gIC8vICBgc3ludGF4YCAoc3RyaW5nLCByZXF1aXJlZCkgUnVsZVN5bnRheCBzdHJpbmcgZm9yIHRoaXMgcnVsZS5cbiAgLy8gIGBwYXR0ZXJuYCAoUmVnRXhwLCBvcHRpb25hbCkgUmVndWxhciBleHByZXNzaW9uIGZvciBgUGF0dGVybmAgcnVsZXNcbiAgLy8gIGBwcmVjZWRlbmNlYCAobnVtYmVyLCBvcHRpb25hbCkgUHJlY2VkZW5jZSBudW1iZXIgZm9yIHRoZSBydWxlIChjdXJyZW50bHkgZG9lc24ndCBkbyBhbnl0aGluZylcbiAgLy8gIGBibGFja2xpc3RgIChbc3RyaW5nXSwgb3B0aW9uYWwpIEFycmF5IG9mIHN0cmluZ3MgYXMgYmxhY2tsaXN0IGZvciBwYXR0ZXJuIHJ1bGVzLlxuICAvLyAgYGxlZnRSZWN1cnNpdmUnIChib29sZWFuLCBvcHRpb25hbCkgU2V0IHRvIGB0cnVlYCBpZiB0aGUgcnVsZSBpcyBsZWZ0LXJlY3Vyc2l2ZSxcbiAgLy8gICAgaS5lLiBpdCBjYWxscyBpdHNlbGYgYXMgYSBzdWJydWxlIGJlZm9yZSBtYXRjaGluZyBhbnkgbGl0ZXJhbCB0b2tlbnNcbiAgLy8gIGB0ZXN0UnVsZWAgKFJ1bGUgb3Igc3RyaW5nLCBvcHRpb25hbCkgUnVsZSBvciBydWxlIG5hbWUgdG8gdXNlIGFzIGEgdGVzdCBydWxlXG4gIC8vICAgIHNwZWNpZnlpbmcgdGhpcyBjYW4gbGV0IHVzIGp1bXAgb3V0IHF1aWNrbHkgaWYgdGhlcmUgaXMgbm8gcG9zc2libGUgbWF0Y2hcbiAgLy9cbiAgLy8gTm90ZSB0aGF0IHdlIG11bmdlIHRoZSBgY29uc3RydWN0b3JgIHBhc3NlZCBpbiBmb3IgZWZmaWNpZW5jeSB3aGlsZSBwYXJzaW5nLlxuICBkZWZpbmVSdWxlKHtcbiAgICBuYW1lLCBjb25zdHJ1Y3RvciwgYWxpYXMgPSBbXSwgY2Fub25pY2FsLFxuICAgIHN5bnRheCwgYmxhY2tsaXN0LFxuICAgIC4uLm90aGVyUHJvcHNcbiAgICAvLyBwYXR0ZXJuLCBwcmVjZWRlbmNlLCAsIGxlZnRSZWN1cnNpdmUsIHRlc3RSdWxlXG4gIH0pIHtcbiAgICBjb25zdCBuYW1lcyA9IFtuYW1lXS5jb25jYXQoYWxpYXMpO1xuXG4gICAgLy8gdGhyb3cgaWYgd2UncmUgcmUtdXNpbmcgYSBjb25zdHJ1Y3RvclxuICAgIGlmIChjb25zdHJ1Y3Rvci5wcm90b3R5cGUucnVsZU5hbWVzKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBwYXJzZXIuZGVmaW5lKCk6IEF0dGVtcHRpbmcgdG8gcmUtdXNlIGNvbnN0cnVjdG9yIGZvciBydWxlICcke3J1bGVOYW1lfSdgKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgcHJvcGVydGllcyBvbiBwcm90b3R5cGUuY29uc3RydWN0b3JcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IucHJvdG90eXBlLCBcInJ1bGVOYW1lc1wiLCB7IHZhbHVlOiBuYW1lcyB9KTtcbiAgICBpZiAoY2Fub25pY2FsKSBSdWxlW2Nhbm9uaWNhbF0gPSBjb25zdHJ1Y3RvcjtcbiAgICBpZiAoYmxhY2tsaXN0KSB7XG4gICAgICBjb25zdCBtYXAgPSB7fTtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGJsYWNrbGlzdCkgbWFwW2tleV0gPSB0cnVlO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLnByb3RvdHlwZSwgXCJibGFja2xpc3RcIiwgeyB2YWx1ZTogbWFwIH0pO1xuICAgIH1cblxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG90aGVyUHJvcHMpKSB7XG4vL2NvbnNvbGUuaW5mbyhuYW1lLCBrZXksIG90aGVyUHJvcHNba2V5XSk7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IucHJvdG90eXBlLCBrZXksIHsgdmFsdWU6IG90aGVyUHJvcHNba2V5XSB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBydWxlID0gc3ludGF4XG4gICAgICA/IHBhcnNlUnVsZShzeW50YXgsIGNvbnN0cnVjdG9yKVxuICAgICAgOiBuZXcgY29uc3RydWN0b3IoKTtcblxuICAgIHRoaXMuYWRkUnVsZShuYW1lcywgcnVsZSk7XG4gIH1cblxuXG4vL1xuLy8gIyMjIFBhcnNlciByZWdpc3RyeS5cbi8vXG5cdHN0YXRpYyBSRUdJU1RSWSA9IHt9O1xuXG5cdC8vIEdldCBhIHBhcnNlciBmb3IgYSBnaXZlbiBgY29udGV4dE5hbWVgLlxuXHQvLyBXaWxsIHJlLXVzZSBleGlzdGluZyBwYXJzZXIsIG9yIGNyZWF0ZSBhIG5ldyBvbmUgaWYgbm90IGFscmVhZHkgZGVmaW5lZC5cblx0c3RhdGljIGZvck5hbWUobmFtZSkge1xuXHRcdGlmICghUGFyc2VyLlJFR0lTVFJZW25hbWVdKSB7XG5cdFx0XHRQYXJzZXIuUkVHSVNUUllbbmFtZV0gPSBuZXcgUGFyc2VyKHsgbmFtZSB9KTtcblx0XHR9XG5cdFx0cmV0dXJuIFBhcnNlci5SRUdJU1RSWVtuYW1lXTtcblx0fVxuXG5cbi8vXG4vLyAjIyBVdGlsaXR5IG1ldGhvZHNcbi8vXG5cblx0Ly8gRmluZCB0aGUgbWF0Y2hpbmcgaW5zdGFuY2Ugb2YgKHBvc3NpYmx5IG5lc3RlZCkgYGVuZFRva2VuYCB0byBiYWxhbmNlIGBzdGFydFRva2VuYFxuXHQvL1x0aW4gYXJyYXkgb2YgYHRva2Vuc2AgKHN0cmluZ3MpLlxuXHQvLyBJZiBzdWNjZXNzZnVsLCByZXR1cm5zIGB7IHN0YXJ0LCBlbmQsIHNsaWNlIH1gXG5cdC8vIFRocm93cyBpZiB1bnN1Y2Vzc2Z1bC5cblx0c3RhdGljIGZpbmROZXN0ZWRUb2tlbnModG9rZW5zLCBzdGFydFRva2VuLCBlbmRUb2tlbiwgc3RhcnQgPSAwKSB7XG5cdFx0aWYgKHRva2Vuc1tzdGFydF0gIT09IHN0YXJ0VG9rZW4pIHRocm93IG5ldyBTeW50YXhFcnJvcihgRXhwZWN0ZWQgJyR7c3RhcnRUb2tlbn0nIGF0IGluZGV4ICR7c3RhcnR9IG9mIHRva2Vuc2ApO1xuXHRcdGxldCBuZXN0aW5nID0gMDtcblx0XHRsZXQgbmVzdGVkID0gZmFsc2U7XG5cdFx0Zm9yIChsZXQgZW5kID0gc3RhcnQgKyAxLCBsYXN0SW5kZXggPSB0b2tlbnMubGVuZ3RoOyBlbmQgPCBsYXN0SW5kZXg7IGVuZCsrKSB7XG5cdFx0XHRsZXQgdG9rZW4gPSB0b2tlbnNbZW5kXTtcblx0XHRcdGlmICh0b2tlbiA9PT0gc3RhcnRUb2tlbikge1xuXHRcdFx0XHRuZXN0aW5nKys7XG5cdFx0XHRcdG5lc3RlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAodG9rZW4gPT09IGVuZFRva2VuKSB7XG5cdFx0XHRcdGlmIChuZXN0aW5nID09PSAwKVxuXHRcdFx0XHRcdHJldHVybiB7IHN0YXJ0LCBlbmQsIHNsaWNlOiB0b2tlbnMuc2xpY2Uoc3RhcnQrMSwgZW5kKSwgbmVzdGVkIH07XG5cdFx0XHRcdG5lc3RpbmctLTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKGBDb3VsZG4ndCBmaW5kIG1hdGNoaW5nICcke2VuZFRva2VufSdzIHN0YXJ0aW5nIGF0IGl0ZW0gJHtzdGFydH1gKTtcblx0fVxufVxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvUGFyc2VyLmpzIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICB2YXIgUkVBQ1RfRUxFTUVOVF9UWVBFID0gKHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiZcbiAgICBTeW1ib2wuZm9yICYmXG4gICAgU3ltYm9sLmZvcigncmVhY3QuZWxlbWVudCcpKSB8fFxuICAgIDB4ZWFjNztcblxuICB2YXIgaXNWYWxpZEVsZW1lbnQgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIG9iamVjdCAhPT0gbnVsbCAmJlxuICAgICAgb2JqZWN0LiQkdHlwZW9mID09PSBSRUFDVF9FTEVNRU5UX1RZUEU7XG4gIH07XG5cbiAgLy8gQnkgZXhwbGljaXRseSB1c2luZyBgcHJvcC10eXBlc2AgeW91IGFyZSBvcHRpbmcgaW50byBuZXcgZGV2ZWxvcG1lbnQgYmVoYXZpb3IuXG4gIC8vIGh0dHA6Ly9mYi5tZS9wcm9wLXR5cGVzLWluLXByb2RcbiAgdmFyIHRocm93T25EaXJlY3RBY2Nlc3MgPSB0cnVlO1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZmFjdG9yeVdpdGhUeXBlQ2hlY2tlcnMnKShpc1ZhbGlkRWxlbWVudCwgdGhyb3dPbkRpcmVjdEFjY2Vzcyk7XG59IGVsc2Uge1xuICAvLyBCeSBleHBsaWNpdGx5IHVzaW5nIGBwcm9wLXR5cGVzYCB5b3UgYXJlIG9wdGluZyBpbnRvIG5ldyBwcm9kdWN0aW9uIGJlaGF2aW9yLlxuICAvLyBodHRwOi8vZmIubWUvcHJvcC10eXBlcy1pbi1wcm9kXG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9mYWN0b3J5V2l0aFRocm93aW5nU2hpbXMnKSgpO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3Byb3AtdHlwZXMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDM1OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJmdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuLyogZXNsaW50LWRpc2FibGUgbm8tdXNlLWJlZm9yZS1kZWZpbmUgKi9cbi8qKlxuICogQG1vZHVsZSBldmVudEhhbmRsZXJzXG4gKlxuICovXG5pbXBvcnQgZG9tSGVscGVycyBmcm9tICcuL2xpYi9kb21faGVscGVycyc7XG5pbXBvcnQgbGlzdGVuZXJzIGZyb20gJy4vbGliL2xpc3RlbmVycyc7XG5pbXBvcnQgKiBhcyBzdG9yZSBmcm9tICcuL3N0b3JlJztcblxuLyoqXG4gKiBwcml2YXRlXG4gKlxuICovXG5cbi8qKlxuICogX29uQ2xpY2tcbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCBUaGUgY2xpY2sgZXZlbnQgb2JqZWN0XG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnQudGFyZ2V0IFRoZSBET00gbm9kZSBmcm9tIHRoZSBjbGljayBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gX29uQ2xpY2soX3JlZikge1xuICB2YXIgdGFyZ2V0ID0gX3JlZi50YXJnZXQ7XG5cbiAgc3RvcmUuYWN0aXZhdGUoW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShzdG9yZS5nZXRJbnN0YW5jZXMoKSkpLnJlZHVjZShkb21IZWxwZXJzLmZpbmRDb250YWluZXJOb2Rlcyh0YXJnZXQpLCBbXSkuc29ydChkb21IZWxwZXJzLnNvcnRCeURPTVBvc2l0aW9uKS5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5pbnN0YW5jZTtcbiAgfSkpO1xufVxuXG4vKipcbiAqIF9vbktleURvd246IFRoZSBrZXlkb3duIGV2ZW50IGNhbGxiYWNrXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgVGhlIGtleWRvd24gZXZlbnQgb2JqZWN0XG4gKiBAcGFyYW0ge251bWJlcn0gZXZlbnQud2hpY2ggVGhlIGtleSBjb2RlICh3aGljaCkgcmVjZWl2ZWQgZnJvbSB0aGUga2V5ZG93biBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gX29uS2V5RG93bihldmVudCkge1xuICB2YXIgZm9yY2VDb25zaWRlciA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG5cbiAgaWYgKGZvcmNlQ29uc2lkZXIgfHwgX3Nob3VsZENvbnNpZGVyKGV2ZW50KSkge1xuICAgIHZhciBfcmVmMiA9IHN0b3JlLmZpbmRCaW5kaW5nRm9yRXZlbnQoZXZlbnQpIHx8IHt9LFxuICAgICAgICBmbiA9IF9yZWYyLmZuLFxuICAgICAgICBpbnN0YW5jZSA9IF9yZWYyLmluc3RhbmNlO1xuXG4gICAgaWYgKGZuKSB7XG4gICAgICBmbi5jYWxsKGluc3RhbmNlLCBldmVudCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIF9zaG91bGRDb25zaWRlcjogQ29uZGl0aW9ucyBmb3IgcHJvY2VlZGluZyB3aXRoIGtleSBldmVudCBoYW5kbGluZ1xuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IFRoZSBrZXlkb3duIGV2ZW50IG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50LnRhcmdldCBUaGUgbm9kZSBvcmlnaW4gb2YgdGhlIGV2ZW50XG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHRvIGNvbnRpbnVlIHByb2Nlc2luZyB0aGUga2V5ZG93biBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gX3Nob3VsZENvbnNpZGVyKF9yZWYzKSB7XG4gIHZhciBjdHJsS2V5ID0gX3JlZjMuY3RybEtleSxcbiAgICAgIHRhcmdldCA9IF9yZWYzLnRhcmdldDtcblxuICByZXR1cm4gY3RybEtleSB8fCAhflsnSU5QVVQnLCAnU0VMRUNUJywgJ1RFWFRBUkVBJ10uaW5kZXhPZih0YXJnZXQudGFnTmFtZSkgJiYgKCF0YXJnZXQuZ2V0QXR0cmlidXRlIHx8IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ3JvbGUnKSAhPT0gJ3RleHRib3gnKTtcbn1cblxuLyoqXG4gKiBwdWJsaWNcbiAqXG4gKi9cblxuLyoqXG4gKiBvbk1vdW50XG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gb25Nb3VudChpbnN0YW5jZSkge1xuICBzdG9yZS5hY3RpdmF0ZShpbnN0YW5jZSk7XG4gIGxpc3RlbmVycy5iaW5kS2V5cyhfb25LZXlEb3duKTtcbiAgbGlzdGVuZXJzLmJpbmRDbGlja3MoX29uQ2xpY2spO1xuICBkb21IZWxwZXJzLmJpbmRGb2N1c2FibGVzKGluc3RhbmNlLCBzdG9yZS5hY3RpdmF0ZSk7XG59XG5cbi8qKlxuICogb25Vbm1vdW50XG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gb25Vbm1vdW50KGluc3RhbmNlKSB7XG4gIHN0b3JlLmRlbGV0ZUluc3RhbmNlKGluc3RhbmNlKTtcbiAgaWYgKHN0b3JlLmlzRW1wdHkoKSkge1xuICAgIGxpc3RlbmVycy51bmJpbmRDbGlja3MoX29uQ2xpY2spO1xuICAgIGxpc3RlbmVycy51bmJpbmRLZXlzKF9vbktleURvd24pO1xuICB9XG59XG5cbmV4cG9ydCB7IG9uTW91bnQsIG9uVW5tb3VudCB9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2V2ZW50X2hhbmRsZXJzLmpzXG4vLyBtb2R1bGUgaWQgPSAzODFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgbW9kaWZpZXJzIGFzIG1vZGlmaWVyS2V5cywgQUxMX0tFWVMsIEFMTF9QUklOVEFCTEVfS0VZUyB9IGZyb20gJy4va2V5cyc7XG5cbnZhciBQUklOVEFCTEVfQ0hBUkFDVEVSUyA9ICcwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWn4hQCMkJV4mKigpLV8rPVtdXFxcXHt9fDtcXCc6XCIsLi88Pj/Coyc7XG5cbnZhciBtb2RLZXlzID0gT2JqZWN0LmtleXMobW9kaWZpZXJLZXlzKTtcblxuZnVuY3Rpb24gbWF0Y2hLZXlzKF9yZWYpIHtcbiAgdmFyIGtleVNldCA9IF9yZWYua2V5U2V0LFxuICAgICAgZXZlbnQgPSBfcmVmLmV2ZW50O1xuICB2YXIga2V5ID0ga2V5U2V0LmtleSxcbiAgICAgIF9rZXlTZXQkbW9kaWZpZXJzID0ga2V5U2V0Lm1vZGlmaWVycyxcbiAgICAgIG1vZGlmaWVycyA9IF9rZXlTZXQkbW9kaWZpZXJzID09PSB1bmRlZmluZWQgPyBbXSA6IF9rZXlTZXQkbW9kaWZpZXJzO1xuXG4gIHZhciBrZXlzTWF0Y2ggPSB2b2lkIDA7XG5cbiAga2V5c01hdGNoID0ga2V5ID09PSBBTExfS0VZUztcblxuICBpZiAoa2V5ID09PSBBTExfUFJJTlRBQkxFX0tFWVMpIHtcbiAgICBpZiAoZXZlbnQua2V5KSB7XG4gICAgICAvLyBNb2Rlcm4gYnJvd3NlcnMgaW1wbGVtZW50IGBrZXlgLCBzbyBpZiBga2V5YCBpcyBsZW5ndGggMSwgd2UgaGF2ZSBhIG1hdGNoLiBlLmcuICdhJyBmb3IgdGhlXG4gICAgICAvLyBhIGtleSwgb3IgJzInIGZvciB0aGUgMiBrZXkuIEFsbCBvdGhlciBub24tcHJpbnRhYmxlIGNoYXJhY3RlcnMgaGF2ZSBuYW1lcywgZS5nLiAnRW50ZXInIG9yICdCYWNrc3BhY2UnLlxuICAgICAga2V5c01hdGNoID0gZXZlbnQua2V5Lmxlbmd0aCA9PT0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgZG8gbm8gc3VwcG9ydCBgZXZlbnQua2V5YCwgd2UgdGVzdCBhZ2FpbnN0IGEgbGlzdCBvZiBjaGFyYWN0ZXJzXG4gICAgICB2YXIgcHJlc3NlZENoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LmNoYXJDb2RlKTtcbiAgICAgIGtleXNNYXRjaCA9IFBSSU5UQUJMRV9DSEFSQUNURVJTLmluZGV4T2YocHJlc3NlZENoYXIpID49IDA7XG4gICAgfVxuICB9XG5cbiAgaWYgKGtleSA9PT0gZXZlbnQud2hpY2gpIHtcbiAgICB2YXIgZXZ0TW9kS2V5cyA9IG1vZEtleXMuZmlsdGVyKGZ1bmN0aW9uIChtb2RLZXkpIHtcbiAgICAgIHJldHVybiBldmVudFttb2RLZXkgKyAnS2V5J107XG4gICAgfSkuc29ydCgpO1xuICAgIGtleXNNYXRjaCA9IG1vZGlmaWVycy5sZW5ndGggPT09IGV2dE1vZEtleXMubGVuZ3RoICYmIG1vZGlmaWVycy5ldmVyeShmdW5jdGlvbiAobW9kS2V5LCBpbmRleCkge1xuICAgICAgcmV0dXJuIGV2dE1vZEtleXNbaW5kZXhdID09PSBtb2RLZXk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4ga2V5c01hdGNoO1xufVxuXG5leHBvcnQgZGVmYXVsdCBtYXRjaEtleXM7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL21hdGNoX2tleXMuanNcbi8vIG1vZHVsZSBpZCA9IDM4MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgS2V5cywgeyBtb2RpZmllcnMgfSBmcm9tICcuL2tleXMnO1xuXG5mdW5jdGlvbiBwYXJzZUtleXMoa2V5c0FycmF5KSB7XG4gIHJldHVybiBrZXlzQXJyYXkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIga2V5U2V0ID0geyBrZXk6IGtleSB9O1xuICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgdmFyIGtleVN0cmluZyA9IGtleS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICAgIHZhciBtYXRjaGVzID0ga2V5U3RyaW5nLnNwbGl0KC9cXHM/XFwrXFxzPy8pO1xuICAgICAga2V5U2V0ID0gbWF0Y2hlcy5sZW5ndGggPT09IDEgPyB7IGtleTogS2V5c1trZXlTdHJpbmddIH0gOiB7XG4gICAgICAgIGtleTogS2V5c1ttYXRjaGVzLnBvcCgpXSxcbiAgICAgICAgbW9kaWZpZXJzOiBtYXRjaGVzLm1hcChmdW5jdGlvbiAobW9kS2V5KSB7XG4gICAgICAgICAgcmV0dXJuIG1vZGlmaWVyc1ttb2RLZXldO1xuICAgICAgICB9KS5zb3J0KClcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBrZXlTZXQ7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBwYXJzZUtleXM7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL3BhcnNlX2tleXMuanNcbi8vIG1vZHVsZSBpZCA9IDM4M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuXHRNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xudmFyIHN0eWxlc0luRG9tID0ge30sXG5cdG1lbW9pemUgPSBmdW5jdGlvbihmbikge1xuXHRcdHZhciBtZW1vO1xuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAodHlwZW9mIG1lbW8gPT09IFwidW5kZWZpbmVkXCIpIG1lbW8gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0cmV0dXJuIG1lbW87XG5cdFx0fTtcblx0fSxcblx0aXNPbGRJRSA9IG1lbW9pemUoZnVuY3Rpb24oKSB7XG5cdFx0Ly8gVGVzdCBmb3IgSUUgPD0gOSBhcyBwcm9wb3NlZCBieSBCcm93c2VyaGFja3Ncblx0XHQvLyBAc2VlIGh0dHA6Ly9icm93c2VyaGFja3MuY29tLyNoYWNrLWU3MWQ4NjkyZjY1MzM0MTczZmVlNzE1YzIyMmNiODA1XG5cdFx0Ly8gVGVzdHMgZm9yIGV4aXN0ZW5jZSBvZiBzdGFuZGFyZCBnbG9iYWxzIGlzIHRvIGFsbG93IHN0eWxlLWxvYWRlciBcblx0XHQvLyB0byBvcGVyYXRlIGNvcnJlY3RseSBpbnRvIG5vbi1zdGFuZGFyZCBlbnZpcm9ubWVudHNcblx0XHQvLyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJwYWNrLWNvbnRyaWIvc3R5bGUtbG9hZGVyL2lzc3Vlcy8xNzdcblx0XHRyZXR1cm4gd2luZG93ICYmIGRvY3VtZW50ICYmIGRvY3VtZW50LmFsbCAmJiAhd2luZG93LmF0b2I7XG5cdH0pLFxuXHRnZXRFbGVtZW50ID0gKGZ1bmN0aW9uKGZuKSB7XG5cdFx0dmFyIG1lbW8gPSB7fTtcblx0XHRyZXR1cm4gZnVuY3Rpb24oc2VsZWN0b3IpIHtcblx0XHRcdGlmICh0eXBlb2YgbWVtb1tzZWxlY3Rvcl0gPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0bWVtb1tzZWxlY3Rvcl0gPSBmbi5jYWxsKHRoaXMsIHNlbGVjdG9yKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBtZW1vW3NlbGVjdG9yXVxuXHRcdH07XG5cdH0pKGZ1bmN0aW9uIChzdHlsZVRhcmdldCkge1xuXHRcdHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHN0eWxlVGFyZ2V0KVxuXHR9KSxcblx0c2luZ2xldG9uRWxlbWVudCA9IG51bGwsXG5cdHNpbmdsZXRvbkNvdW50ZXIgPSAwLFxuXHRzdHlsZUVsZW1lbnRzSW5zZXJ0ZWRBdFRvcCA9IFtdLFxuXHRmaXhVcmxzID0gcmVxdWlyZShcIi4vZml4VXJsc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsaXN0LCBvcHRpb25zKSB7XG5cdGlmKHR5cGVvZiBERUJVRyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBERUJVRykge1xuXHRcdGlmKHR5cGVvZiBkb2N1bWVudCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHN0eWxlLWxvYWRlciBjYW5ub3QgYmUgdXNlZCBpbiBhIG5vbi1icm93c2VyIGVudmlyb25tZW50XCIpO1xuXHR9XG5cblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdG9wdGlvbnMuYXR0cnMgPSB0eXBlb2Ygb3B0aW9ucy5hdHRycyA9PT0gXCJvYmplY3RcIiA/IG9wdGlvbnMuYXR0cnMgOiB7fTtcblxuXHQvLyBGb3JjZSBzaW5nbGUtdGFnIHNvbHV0aW9uIG9uIElFNi05LCB3aGljaCBoYXMgYSBoYXJkIGxpbWl0IG9uIHRoZSAjIG9mIDxzdHlsZT5cblx0Ly8gdGFncyBpdCB3aWxsIGFsbG93IG9uIGEgcGFnZVxuXHRpZiAodHlwZW9mIG9wdGlvbnMuc2luZ2xldG9uID09PSBcInVuZGVmaW5lZFwiKSBvcHRpb25zLnNpbmdsZXRvbiA9IGlzT2xkSUUoKTtcblxuXHQvLyBCeSBkZWZhdWx0LCBhZGQgPHN0eWxlPiB0YWdzIHRvIHRoZSA8aGVhZD4gZWxlbWVudFxuXHRpZiAodHlwZW9mIG9wdGlvbnMuaW5zZXJ0SW50byA9PT0gXCJ1bmRlZmluZWRcIikgb3B0aW9ucy5pbnNlcnRJbnRvID0gXCJoZWFkXCI7XG5cblx0Ly8gQnkgZGVmYXVsdCwgYWRkIDxzdHlsZT4gdGFncyB0byB0aGUgYm90dG9tIG9mIHRoZSB0YXJnZXRcblx0aWYgKHR5cGVvZiBvcHRpb25zLmluc2VydEF0ID09PSBcInVuZGVmaW5lZFwiKSBvcHRpb25zLmluc2VydEF0ID0gXCJib3R0b21cIjtcblxuXHR2YXIgc3R5bGVzID0gbGlzdFRvU3R5bGVzKGxpc3QsIG9wdGlvbnMpO1xuXHRhZGRTdHlsZXNUb0RvbShzdHlsZXMsIG9wdGlvbnMpO1xuXG5cdHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuXHRcdHZhciBtYXlSZW1vdmUgPSBbXTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IHN0eWxlc1tpXTtcblx0XHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXHRcdFx0ZG9tU3R5bGUucmVmcy0tO1xuXHRcdFx0bWF5UmVtb3ZlLnB1c2goZG9tU3R5bGUpO1xuXHRcdH1cblx0XHRpZihuZXdMaXN0KSB7XG5cdFx0XHR2YXIgbmV3U3R5bGVzID0gbGlzdFRvU3R5bGVzKG5ld0xpc3QsIG9wdGlvbnMpO1xuXHRcdFx0YWRkU3R5bGVzVG9Eb20obmV3U3R5bGVzLCBvcHRpb25zKTtcblx0XHR9XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IG1heVJlbW92ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGRvbVN0eWxlID0gbWF5UmVtb3ZlW2ldO1xuXHRcdFx0aWYoZG9tU3R5bGUucmVmcyA9PT0gMCkge1xuXHRcdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgZG9tU3R5bGUucGFydHMubGVuZ3RoOyBqKyspXG5cdFx0XHRcdFx0ZG9tU3R5bGUucGFydHNbal0oKTtcblx0XHRcdFx0ZGVsZXRlIHN0eWxlc0luRG9tW2RvbVN0eWxlLmlkXTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59O1xuXG5mdW5jdGlvbiBhZGRTdHlsZXNUb0RvbShzdHlsZXMsIG9wdGlvbnMpIHtcblx0Zm9yKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xuXHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXHRcdGlmKGRvbVN0eWxlKSB7XG5cdFx0XHRkb21TdHlsZS5yZWZzKys7XG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgZG9tU3R5bGUucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0ZG9tU3R5bGUucGFydHNbal0oaXRlbS5wYXJ0c1tqXSk7XG5cdFx0XHR9XG5cdFx0XHRmb3IoOyBqIDwgaXRlbS5wYXJ0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRkb21TdHlsZS5wYXJ0cy5wdXNoKGFkZFN0eWxlKGl0ZW0ucGFydHNbal0sIG9wdGlvbnMpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHBhcnRzID0gW107XG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgaXRlbS5wYXJ0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRwYXJ0cy5wdXNoKGFkZFN0eWxlKGl0ZW0ucGFydHNbal0sIG9wdGlvbnMpKTtcblx0XHRcdH1cblx0XHRcdHN0eWxlc0luRG9tW2l0ZW0uaWRdID0ge2lkOiBpdGVtLmlkLCByZWZzOiAxLCBwYXJ0czogcGFydHN9O1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBsaXN0VG9TdHlsZXMobGlzdCwgb3B0aW9ucykge1xuXHR2YXIgc3R5bGVzID0gW107XG5cdHZhciBuZXdTdHlsZXMgPSB7fTtcblx0Zm9yKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgaXRlbSA9IGxpc3RbaV07XG5cdFx0dmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG5cdFx0dmFyIGNzcyA9IGl0ZW1bMV07XG5cdFx0dmFyIG1lZGlhID0gaXRlbVsyXTtcblx0XHR2YXIgc291cmNlTWFwID0gaXRlbVszXTtcblx0XHR2YXIgcGFydCA9IHtjc3M6IGNzcywgbWVkaWE6IG1lZGlhLCBzb3VyY2VNYXA6IHNvdXJjZU1hcH07XG5cdFx0aWYoIW5ld1N0eWxlc1tpZF0pXG5cdFx0XHRzdHlsZXMucHVzaChuZXdTdHlsZXNbaWRdID0ge2lkOiBpZCwgcGFydHM6IFtwYXJ0XX0pO1xuXHRcdGVsc2Vcblx0XHRcdG5ld1N0eWxlc1tpZF0ucGFydHMucHVzaChwYXJ0KTtcblx0fVxuXHRyZXR1cm4gc3R5bGVzO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgc3R5bGVFbGVtZW50KSB7XG5cdHZhciBzdHlsZVRhcmdldCA9IGdldEVsZW1lbnQob3B0aW9ucy5pbnNlcnRJbnRvKVxuXHRpZiAoIXN0eWxlVGFyZ2V0KSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnRJbnRvJyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG5cdH1cblx0dmFyIGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wID0gc3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3Bbc3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AubGVuZ3RoIC0gMV07XG5cdGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcInRvcFwiKSB7XG5cdFx0aWYoIWxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wKSB7XG5cdFx0XHRzdHlsZVRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGVFbGVtZW50LCBzdHlsZVRhcmdldC5maXJzdENoaWxkKTtcblx0XHR9IGVsc2UgaWYobGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3AubmV4dFNpYmxpbmcpIHtcblx0XHRcdHN0eWxlVGFyZ2V0Lmluc2VydEJlZm9yZShzdHlsZUVsZW1lbnQsIGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3R5bGVUYXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGVFbGVtZW50KTtcblx0XHR9XG5cdFx0c3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AucHVzaChzdHlsZUVsZW1lbnQpO1xuXHR9IGVsc2UgaWYgKG9wdGlvbnMuaW5zZXJ0QXQgPT09IFwiYm90dG9tXCIpIHtcblx0XHRzdHlsZVRhcmdldC5hcHBlbmRDaGlsZChzdHlsZUVsZW1lbnQpO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdmFsdWUgZm9yIHBhcmFtZXRlciAnaW5zZXJ0QXQnLiBNdXN0IGJlICd0b3AnIG9yICdib3R0b20nLlwiKTtcblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG5cdHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG5cdHZhciBpZHggPSBzdHlsZUVsZW1lbnRzSW5zZXJ0ZWRBdFRvcC5pbmRleE9mKHN0eWxlRWxlbWVudCk7XG5cdGlmKGlkeCA+PSAwKSB7XG5cdFx0c3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3Auc3BsaWNlKGlkeCwgMSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcblx0b3B0aW9ucy5hdHRycy50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuXG5cdGF0dGFjaFRhZ0F0dHJzKHN0eWxlRWxlbWVudCwgb3B0aW9ucy5hdHRycyk7XG5cdGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zLCBzdHlsZUVsZW1lbnQpO1xuXHRyZXR1cm4gc3R5bGVFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVMaW5rRWxlbWVudChvcHRpb25zKSB7XG5cdHZhciBsaW5rRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xuXHRvcHRpb25zLmF0dHJzLnR5cGUgPSBcInRleHQvY3NzXCI7XG5cdG9wdGlvbnMuYXR0cnMucmVsID0gXCJzdHlsZXNoZWV0XCI7XG5cblx0YXR0YWNoVGFnQXR0cnMobGlua0VsZW1lbnQsIG9wdGlvbnMuYXR0cnMpO1xuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgbGlua0VsZW1lbnQpO1xuXHRyZXR1cm4gbGlua0VsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGF0dGFjaFRhZ0F0dHJzKGVsZW1lbnQsIGF0dHJzKSB7XG5cdE9iamVjdC5rZXlzKGF0dHJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gYWRkU3R5bGUob2JqLCBvcHRpb25zKSB7XG5cdHZhciBzdHlsZUVsZW1lbnQsIHVwZGF0ZSwgcmVtb3ZlLCB0cmFuc2Zvcm1SZXN1bHQ7XG5cblx0Ly8gSWYgYSB0cmFuc2Zvcm0gZnVuY3Rpb24gd2FzIGRlZmluZWQsIHJ1biBpdCBvbiB0aGUgY3NzXG5cdGlmIChvcHRpb25zLnRyYW5zZm9ybSAmJiBvYmouY3NzKSB7XG5cdCAgICB0cmFuc2Zvcm1SZXN1bHQgPSBvcHRpb25zLnRyYW5zZm9ybShvYmouY3NzKTtcblx0ICAgIFxuXHQgICAgaWYgKHRyYW5zZm9ybVJlc3VsdCkge1xuXHQgICAgXHQvLyBJZiB0cmFuc2Zvcm0gcmV0dXJucyBhIHZhbHVlLCB1c2UgdGhhdCBpbnN0ZWFkIG9mIHRoZSBvcmlnaW5hbCBjc3MuXG5cdCAgICBcdC8vIFRoaXMgYWxsb3dzIHJ1bm5pbmcgcnVudGltZSB0cmFuc2Zvcm1hdGlvbnMgb24gdGhlIGNzcy5cblx0ICAgIFx0b2JqLmNzcyA9IHRyYW5zZm9ybVJlc3VsdDtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICBcdC8vIElmIHRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24gcmV0dXJucyBhIGZhbHN5IHZhbHVlLCBkb24ndCBhZGQgdGhpcyBjc3MuIFxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBjb25kaXRpb25hbCBsb2FkaW5nIG9mIGNzc1xuXHQgICAgXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgICBcdFx0Ly8gbm9vcFxuXHQgICAgXHR9O1xuXHQgICAgfVxuXHR9XG5cblx0aWYgKG9wdGlvbnMuc2luZ2xldG9uKSB7XG5cdFx0dmFyIHN0eWxlSW5kZXggPSBzaW5nbGV0b25Db3VudGVyKys7XG5cdFx0c3R5bGVFbGVtZW50ID0gc2luZ2xldG9uRWxlbWVudCB8fCAoc2luZ2xldG9uRWxlbWVudCA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKSk7XG5cdFx0dXBkYXRlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlRWxlbWVudCwgc3R5bGVJbmRleCwgZmFsc2UpO1xuXHRcdHJlbW92ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZUVsZW1lbnQsIHN0eWxlSW5kZXgsIHRydWUpO1xuXHR9IGVsc2UgaWYob2JqLnNvdXJjZU1hcCAmJlxuXHRcdHR5cGVvZiBVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBVUkwuY3JlYXRlT2JqZWN0VVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgVVJMLnJldm9rZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIEJsb2IgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRzdHlsZUVsZW1lbnQgPSBjcmVhdGVMaW5rRWxlbWVudChvcHRpb25zKTtcblx0XHR1cGRhdGUgPSB1cGRhdGVMaW5rLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50LCBvcHRpb25zKTtcblx0XHRyZW1vdmUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuXHRcdFx0aWYoc3R5bGVFbGVtZW50LmhyZWYpXG5cdFx0XHRcdFVSTC5yZXZva2VPYmplY3RVUkwoc3R5bGVFbGVtZW50LmhyZWYpO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0c3R5bGVFbGVtZW50ID0gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuXHRcdHVwZGF0ZSA9IGFwcGx5VG9UYWcuYmluZChudWxsLCBzdHlsZUVsZW1lbnQpO1xuXHRcdHJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG5cdFx0fTtcblx0fVxuXG5cdHVwZGF0ZShvYmopO1xuXG5cdHJldHVybiBmdW5jdGlvbiB1cGRhdGVTdHlsZShuZXdPYmopIHtcblx0XHRpZihuZXdPYmopIHtcblx0XHRcdGlmKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcClcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0dXBkYXRlKG9iaiA9IG5ld09iaik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlbW92ZSgpO1xuXHRcdH1cblx0fTtcbn1cblxudmFyIHJlcGxhY2VUZXh0ID0gKGZ1bmN0aW9uICgpIHtcblx0dmFyIHRleHRTdG9yZSA9IFtdO1xuXG5cdHJldHVybiBmdW5jdGlvbiAoaW5kZXgsIHJlcGxhY2VtZW50KSB7XG5cdFx0dGV4dFN0b3JlW2luZGV4XSA9IHJlcGxhY2VtZW50O1xuXHRcdHJldHVybiB0ZXh0U3RvcmUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuXHR9O1xufSkoKTtcblxuZnVuY3Rpb24gYXBwbHlUb1NpbmdsZXRvblRhZyhzdHlsZUVsZW1lbnQsIGluZGV4LCByZW1vdmUsIG9iaikge1xuXHR2YXIgY3NzID0gcmVtb3ZlID8gXCJcIiA6IG9iai5jc3M7XG5cblx0aWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG5cdFx0c3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IHJlcGxhY2VUZXh0KGluZGV4LCBjc3MpO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBjc3NOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKTtcblx0XHR2YXIgY2hpbGROb2RlcyA9IHN0eWxlRWxlbWVudC5jaGlsZE5vZGVzO1xuXHRcdGlmIChjaGlsZE5vZGVzW2luZGV4XSkgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKGNoaWxkTm9kZXNbaW5kZXhdKTtcblx0XHRpZiAoY2hpbGROb2Rlcy5sZW5ndGgpIHtcblx0XHRcdHN0eWxlRWxlbWVudC5pbnNlcnRCZWZvcmUoY3NzTm9kZSwgY2hpbGROb2Rlc1tpbmRleF0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoY3NzTm9kZSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGFwcGx5VG9UYWcoc3R5bGVFbGVtZW50LCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBtZWRpYSA9IG9iai5tZWRpYTtcblxuXHRpZihtZWRpYSkge1xuXHRcdHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJtZWRpYVwiLCBtZWRpYSlcblx0fVxuXG5cdGlmKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG5cdFx0c3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcblx0fSBlbHNlIHtcblx0XHR3aGlsZShzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuXHRcdFx0c3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcblx0XHR9XG5cdFx0c3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUxpbmsobGlua0VsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuXHR2YXIgY3NzID0gb2JqLmNzcztcblx0dmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cblx0LyogSWYgY29udmVydFRvQWJzb2x1dGVVcmxzIGlzbid0IGRlZmluZWQsIGJ1dCBzb3VyY2VtYXBzIGFyZSBlbmFibGVkXG5cdGFuZCB0aGVyZSBpcyBubyBwdWJsaWNQYXRoIGRlZmluZWQgdGhlbiBsZXRzIHR1cm4gY29udmVydFRvQWJzb2x1dGVVcmxzXG5cdG9uIGJ5IGRlZmF1bHQuICBPdGhlcndpc2UgZGVmYXVsdCB0byB0aGUgY29udmVydFRvQWJzb2x1dGVVcmxzIG9wdGlvblxuXHRkaXJlY3RseVxuXHQqL1xuXHR2YXIgYXV0b0ZpeFVybHMgPSBvcHRpb25zLmNvbnZlcnRUb0Fic29sdXRlVXJscyA9PT0gdW5kZWZpbmVkICYmIHNvdXJjZU1hcDtcblxuXHRpZiAob3B0aW9ucy5jb252ZXJ0VG9BYnNvbHV0ZVVybHMgfHwgYXV0b0ZpeFVybHMpe1xuXHRcdGNzcyA9IGZpeFVybHMoY3NzKTtcblx0fVxuXG5cdGlmKHNvdXJjZU1hcCkge1xuXHRcdC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI2NjAzODc1XG5cdFx0Y3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIiArIGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSkgKyBcIiAqL1wiO1xuXHR9XG5cblx0dmFyIGJsb2IgPSBuZXcgQmxvYihbY3NzXSwgeyB0eXBlOiBcInRleHQvY3NzXCIgfSk7XG5cblx0dmFyIG9sZFNyYyA9IGxpbmtFbGVtZW50LmhyZWY7XG5cblx0bGlua0VsZW1lbnQuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cblx0aWYob2xkU3JjKVxuXHRcdFVSTC5yZXZva2VPYmplY3RVUkwob2xkU3JjKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9zdHlsZS1sb2FkZXIvYWRkU3R5bGVzLmpzXG4vLyBtb2R1bGUgaWQgPSA0NzZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tIFwibW9ieC1yZWFjdFwiO1xuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IGtleWRvd24gZnJvbSBcInJlYWN0LWtleWRvd25cIjtcbmltcG9ydCB7IEJ1dHRvbiwgRHJvcGRvd24sIEdyaWQsIE1lbnUsIFNlZ21lbnQsIFRleHRBcmVhIH0gZnJvbSAnc2VtYW50aWMtdWktcmVhY3QnXG5cbmltcG9ydCBFeGFtcGxlU3RvcmUgZnJvbSBcIi4vRXhhbXBsZVN0b3JlXCI7XG5pbXBvcnQgU3BhY2VyIGZyb20gXCIuL1NwYWNlci5qc3hcIjtcbmltcG9ydCBcIi4vc3R5bGVzLmxlc3NcIjtcbmltcG9ydCBUYWJiYWJsZVRleHRBcmVhIGZyb20gXCIuL1RhYmJhYmxlVGV4dEFyZWEuanN4XCI7XG5cbkBvYnNlcnZlclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BlbGxFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuXHRcdGV4YW1wbGVzOiBuZXcgRXhhbXBsZVN0b3JlKClcblx0fTtcblxuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHN1cGVyKHByb3BzKTtcbndpbmRvdy5leGFtcGxlcyA9IHByb3BzLmV4YW1wbGVzO1xuXHRcdHRoaXMucHJvcHMuZXhhbXBsZXMubG9hZCgpO1xuXG5cdFx0Ly9ERUJVR1xuXHRcdHdpbmRvdy5zcGVsbEVkaXRvciA9IHRoaXM7XG5cdFx0d2luZG93LmV4YW1wbGVzID0gdGhpcy5wcm9wcy5leGFtcGxlcztcblx0fVxuXG5cdEBrZXlkb3duKFwiY3RybCtzXCIpXG5cdHNhdmUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuc2F2ZSgpOyB9XG5cblx0QGtleWRvd24oXCJjdHJsK3JcIilcblx0cmV2ZXJ0KCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLnJldmVydCgpOyB9XG5cblx0QGtleWRvd24oXCJjdHJsK2NcIilcblx0Y29tcGlsZSgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5jb21waWxlKCk7IH1cblxuXHRAa2V5ZG93bihcImN0cmwrblwiKVxuXHRjcmVhdGUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuY3JlYXRlKCk7IH1cblxuXHRAa2V5ZG93bihcImN0cmwrZFwiKVxuXHRkZWxldGUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuZGVsZXRlKHVuZGVmaW5lZCwgXCJDT05GSVJNXCIpOyB9XG5cblx0cmVuYW1lKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLnJlbmFtZSgpOyB9XG5cdGR1cGxpY2F0ZSgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5kdXBsaWNhdGUoKTsgfVxuXHRsb2FkKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLmxvYWQoKTsgfVxuXHRyZXNldCgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5yZXNldCgpOyB9XG5cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IHsgZXhhbXBsZXMgfSA9IHRoaXMucHJvcHM7XG5cdFx0bGV0IHsgdGl0bGVzLCBzZWxlY3RlZCwgZGlydHksIGNvZGUsIG91dHB1dCB9ID0gZXhhbXBsZXM7XG5cblx0XHQvLyBDcmVhdGUgbWVudWl0ZW1zIGZyb20gdGhlIGV4YW1wbGVzXG5cdFx0bGV0IG9wdGlvbnMgPSB0aXRsZXMubWFwKCB0aXRsZSA9PlxuXHRcdFx0KHtcblx0XHRcdFx0dmFsdWU6IHRpdGxlLFxuXHRcdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRcdHRleHQ6IHRpdGxlLFxuXHRcdFx0XHRjb250ZW50OiB0aXRsZSxcblx0XHRcdFx0b25DbGljazogKCkgPT4gZXhhbXBsZXMuc2VsZWN0KHRpdGxlKVxuXHRcdFx0fSkpO1xuXG5cdFx0bGV0IGRpcnR5QnV0dG9ucyA9ICgpID0+IHtcblx0XHRcdGlmICghZGlydHkpIHJldHVybjtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxNZW51IHNlY29uZGFyeSBzdHlsZT17eyBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLCByaWdodDogXCIxcmVtXCIsIHRvcDogXCIzcHhcIiwgbWFyZ2luOiAwIH19PlxuXHRcdFx0XHRcdDxCdXR0b24gbmVnYXRpdmUgb25DbGljaz17KCkgPT4gdGhpcy5yZXZlcnQoKX0+PHU+UjwvdT5ldmVydDwvQnV0dG9uPlxuXHRcdFx0XHRcdDxCdXR0b24gcG9zaXRpdmUgb25DbGljaz17KCkgPT4gdGhpcy5zYXZlKCl9Pjx1PlM8L3U+YXZlPC9CdXR0b24+XG5cdFx0XHRcdDwvTWVudT5cblx0XHRcdCk7XG5cdFx0fTtcblxuXHRcdGxldCBjb21waWxlQnV0dG9uID0gKCkgPT4ge1xuXHRcdFx0aWYgKG91dHB1dCkgcmV0dXJuO1xuXHRcdFx0cmV0dXJuIDxCdXR0b25cblx0XHRcdFx0XHRzdHlsZT17eyBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLCAgd2lkdGg6IFwiNGVtXCIsIGxlZnQ6IFwiY2FsYyg1MCUgLSAyZW0pXCIsIHRvcDogXCI1MCVcIiB9fVxuXHRcdFx0XHRcdG9uQ2xpY2s9eygpID0+IHRoaXMuY29tcGlsZSgpfVxuXHRcdFx0XHRcdGljb249XCJyaWdodCBjaGV2cm9uXCIvPjtcblx0XHR9O1xuXG5cdFx0cmV0dXJuIChcblx0XHQ8R3JpZCBzdHJldGNoZWQgcGFkZGVkIGNsYXNzTmFtZT1cImZ1bGxIZWlnaHRcIj5cblx0XHRcdDxHcmlkLlJvdyBzdHlsZT17eyBoZWlnaHQ6IFwiMnJlbVwiLCBwYWRkaW5nVG9wOiBcIjByZW1cIiB9fSBjbGFzc05hbWU9XCJ1aSBpbnZlcnRlZCBhdHRhY2hlZCBtZW51XCI+XG5cdFx0XHRcdDxHcmlkLkNvbHVtbiB3aWR0aD17N30+XG5cdFx0XHRcdFx0PE1lbnUgaW52ZXJ0ZWQgYXR0YWNoZWQgZmx1aWQ+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtPkV4YW1wbGU6PC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0XHQ8RHJvcGRvd24gaXRlbSBzZWxlY3Rpb24gb3B0aW9ucz17b3B0aW9uc30gdmFsdWU9e3NlbGVjdGVkfSBzdHlsZT17eyB3aWR0aDogXCIyMGVtXCIgfX0vPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbSBvbkNsaWNrPXsoKSA9PiB0aGlzLmRlbGV0ZSgpfT48dT5EPC91PmVsZXRlPC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtIG9uQ2xpY2s9eygpID0+IHRoaXMucmVuYW1lKCl9PlJlbmFtZTwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbSBvbkNsaWNrPXsoKSA9PiB0aGlzLmR1cGxpY2F0ZSgpfT5EdXBsaWNhdGU8L01lbnUuSXRlbT5cblx0XHRcdFx0XHQ8L01lbnU+XG5cdFx0XHRcdDwvR3JpZC5Db2x1bW4+XG5cdFx0XHRcdDxHcmlkLkNvbHVtbiB3aWR0aD17Mn0+XG5cdFx0XHRcdFx0PE1lbnUgaW52ZXJ0ZWQgYXR0YWNoZWQgZmx1aWQ+XG5cdFx0XHRcdFx0XHQ8U3BhY2VyIGZsdWlkLz5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0gb25DbGljaz17KCkgPT4gdGhpcy5jcmVhdGUoKX0+PHU+TjwvdT5ldzwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdFx0PFNwYWNlciBmbHVpZC8+XG5cdFx0XHRcdFx0PC9NZW51PlxuXHRcdFx0XHQ8L0dyaWQuQ29sdW1uPlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezd9PlxuXHRcdFx0XHRcdDxNZW51IGludmVydGVkIGF0dGFjaGVkIGZsdWlkPlxuXHRcdFx0XHRcdFx0PFNwYWNlciBmbHVpZC8+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtIG9uQ2xpY2s9eygpID0+IHRoaXMubG9hZCgpfT5SZWxvYWQ8L01lbnUuSXRlbT5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0gb25DbGljaz17KCkgPT4gdGhpcy5yZXNldCgpfT5SZXNldDwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdDwvTWVudT5cblx0XHRcdFx0PC9HcmlkLkNvbHVtbj5cblx0XHRcdDwvR3JpZC5Sb3c+XG5cdFx0XHQ8R3JpZC5Sb3cgc3R5bGU9e3sgaGVpZ2h0OiBcImNhbGMoMTAwJSAtIDNyZW0pXCIgfX0+XG5cdFx0XHRcdDxHcmlkLkNvbHVtbiB3aWR0aD17OH0+XG5cdFx0XHRcdFx0PFRhYmJhYmxlVGV4dEFyZWFcblx0XHRcdFx0XHRcdGNsYXNzTmFtZT1cInVpIHNlZ21lbnRcIlxuXHRcdFx0XHRcdFx0dmFsdWU9e2NvZGV9XG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17KGV2ZW50KSA9PiBleGFtcGxlcy51cGRhdGUoZXhhbXBsZXMuc2VsZWN0ZWQsIGV2ZW50LnRhcmdldC52YWx1ZSwgXCJTS0lQX1NBVkVcIil9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHR7ZGlydHlCdXR0b25zKCl9XG5cdFx0XHRcdDwvR3JpZC5Db2x1bW4+XG5cdFx0XHRcdDxHcmlkLkNvbHVtbiB3aWR0aD17OH0+XG5cdFx0XHRcdFx0PFRleHRBcmVhIGNsYXNzTmFtZT1cInVpIHNlZ21lbnRcIiB2YWx1ZT17b3V0cHV0fS8+XG5cdFx0XHRcdDwvR3JpZC5Db2x1bW4+XG5cdFx0XHRcdHtjb21waWxlQnV0dG9uKCl9XG5cdFx0XHQ8L0dyaWQuUm93PlxuXHRcdDwvR3JpZD5cblx0KTt9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL1NwZWxsRWRpdG9yLmpzeCIsIi8vIEV4cG9ydCBhbGwgc3RhbmRhcmQgXCJzcGVsbFwiIHJ1bGVzLlxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuLi8uLi9Ub2tlbml6ZXIuanNcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlLmpzXCI7XG5cbi8vIExvYWQgYWxsIHN0YW5kYXJkIHJ1bGVzIGZpbGVzLlxuaW1wb3J0IFwiLi9jb3JlXCI7XG5pbXBvcnQgXCIuL2xpc3RzXCI7XG5pbXBvcnQgXCIuL29wZXJhdG9yc1wiO1xuaW1wb3J0IFwiLi9pZlwiO1xuaW1wb3J0IFwiLi9zdGF0ZW1lbnRzXCI7XG5pbXBvcnQgXCIuL3R5cGVzXCI7XG5pbXBvcnQgXCIuL0pTWFwiO1xuXG4vLyBDcmVhdGUgcGFyc2VyIHdoaWNoIGNvbWJpbmVzIGFsbCBvZiB0aGUgYWJvdmUuLi5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JOYW1lKFwic3BlbGxcIik7XG4vLyAuLi53aGljaCBkZXBlbmRzIG9uIHJ1bGVzIGxvYWRlZCBhYm92ZS4uLlxucGFyc2VyLmltcG9ydChcImNvcmVcIiwgXCJsaXN0c1wiLCBcIm9wZXJhdG9yc1wiLCBcImlmXCIsIFwic3RhdGVtZW50c1wiLCBcInR5cGVzXCIsIFwiSlNYXCIpO1xuLy8gLi4uYXMgdGhlIGRlZmF1bHQgZXhwb3J0XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbi8vIFN0aWNrIG90aGVyIHN0dWZmIG9uIGB3aW5kb3dgIGZvciByZWZsZWN0aW9uIGFuZCBhZC1ob2MgdGVzdGluZy5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdE9iamVjdC5hc3NpZ24od2luZG93LCB7XG5cdFx0VG9rZW5pemVyLFxuXHRcdFJ1bGUsXG5cdFx0UGFyc2VyLFxuXG5cdFx0dG9rZW5pemU6IFRva2VuaXplci50b2tlbml6ZS5iaW5kKGV4cG9ydHMuVG9rZW5pemVyKSxcblx0XHRwYXJzZXIsXG5cdFx0cGFyc2U6IHBhcnNlci5wYXJzZS5iaW5kKHBhcnNlciksXG5cdFx0Y29tcGlsZTogcGFyc2VyLmNvbXBpbGUuYmluZChwYXJzZXIpLFxuXHR9KTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ydWxlcy9zcGVsbC9pbmRleC5qcyIsIi8qIFN0b3JlIG9mIGV4YW1wbGUgc3BlbGwgY29kZSBmcmFnbWVudHMuICovXG5pbXBvcnQgbW9ieCwgeyBvYnNlcnZhYmxlLCBjb21wdXRlZCB9IGZyb20gXCJtb2J4XCI7XG5cbi8vIE1ha2UgUGFyc2VyIGFuZCBUb2tlbml6ZXIgV0FSTiBhcyB3ZSBydW5cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4uL1BhcnNlclwiO1xuUGFyc2VyLldBUk4gPSB0cnVlO1xuUGFyc2VyLkRFQlVHID0gdHJ1ZTtcblBhcnNlci5USU1FID0gdHJ1ZTtcblxuaW1wb3J0IFRva2VuaXplciBmcm9tIFwiLi4vVG9rZW5pemVyXCI7XG5Ub2tlbml6ZXIuV0FSTiA9IHRydWU7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhhbXBsZVN0b3JlIHtcblx0Ly8gQ1VSUkVOVCBleGFtcGxlc1xuXHRAb2JzZXJ2YWJsZSBleGFtcGxlcyA9IHt9O1xuXHQvLyBFeGFtcGxlcyBhcyBvZiBsYXN0IHNhdmUgKGZvciByZXZlcilcblx0QG9ic2VydmFibGUgX3NhdmVkRXhhbXBsZXMgPSB7fTtcblx0Ly8gU2VsZWN0ZWQgZXhhbXBsZSBrZXkuXG5cdEBvYnNlcnZhYmxlIHNlbGVjdGVkID0gXCJcIjtcblx0Ly8gQ29tcGlsZWQgb3V0cHV0LlxuXHRAb2JzZXJ2YWJsZSBvdXRwdXQgPSBcIlwiO1xuXG5cdC8vIFJldHVybiBqdXN0IHRoZSB0aXRsZXMgb2YgdGhlIGV4YW1wbGVzLlxuXHRAY29tcHV0ZWQgZ2V0IHRpdGxlcygpIHtcblx0XHRyZXR1cm4gT2JqZWN0LmtleXModGhpcy5leGFtcGxlcyk7XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIGNvZGUgZm9yIHRoZSBjdXJyZW50IGV4YW1wbGVcblx0QGNvbXB1dGVkIGdldCBjb2RlKCkge1xuXHRcdHJldHVybiB0aGlzLmV4YW1wbGVzW3RoaXMuc2VsZWN0ZWRdO1xuXHR9XG5cblx0Ly8gSXMgQU5ZVEhJTkcgZGlydHk/XG5cdEBjb21wdXRlZCBnZXQgZGlydHkoKSB7XG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMuX3NhdmVkRXhhbXBsZXMpICE9PSBKU09OLnN0cmluZ2lmeSh0aGlzLmV4YW1wbGVzKTtcblx0fVxuXG5cdC8vIFJlc2V0IGFsbCBleGFtcGxlcyBmcm9tIGxvY2FsU3RvcmFnZS5cblx0cmVzZXQoKSB7XG5cdFx0ZGVsZXRlIGxvY2FsU3RvcmFnZS5zcGVsbEVkaXRvckV4YW1wbGVzO1xuXHRcdGRlbGV0ZSBsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlO1xuXHRcdHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcblx0fVxuXG5cdC8vIExvYWQgZXhhbXBsZXNcblx0bG9hZCgpIHtcblx0XHQvLyBMb2FkIGV4YW1wbGVzIGZyb20gbG9jYWxTdG9yYWdlXG5cdFx0dGhpcy5leGFtcGxlcyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZXNcblx0XHRcdHx8ICd7XCJGb29cIjpcImRlZmluZSB0eXBlIEZvb1wiLCBcIkJhclwiOlwiZGVmaW5lIHR5cGUgQmFyXCJ9Jyk7XG5cblx0XHQvLyBTYXZlIGEgY29weSBvZiBleGFtcGxlcyBmb3IgcmV2ZXJ0XG5cdFx0dGhpcy5fc2F2ZWRFeGFtcGxlcyA9IHRoaXMuZXhhbXBsZXM7XG5cblx0XHQvLyBMb2FkIHNlbGVjdGVkIGV4YW1wbGUgbmFtZVxuXHRcdHRoaXMuc2VsZWN0KGxvY2FsU3RvcmFnZS5zcGVsbEVkaXRvckV4YW1wbGUpO1xuXHR9XG5cblx0Ly8gU2F2ZSBjdXJyZW50IGV4YW1wbGVzLlxuXHRzYXZlKCkge1xuXHRcdGxvY2FsU3RvcmFnZS5zcGVsbEVkaXRvckV4YW1wbGVzID0gSlNPTi5zdHJpbmdpZnkodGhpcy5leGFtcGxlcyk7XG5cblx0XHQvLyBTYXZlIGEgY29weSBvZiBleGFtcGxlcyBmb3IgcmV2ZXJ0XG5cdFx0dGhpcy5fc2F2ZWRFeGFtcGxlcyA9IHRoaXMuZXhhbXBsZXM7XG5cdH1cblxuXHQvLyBSZXZlcnQgdGhlIGN1cnJlbnQgZXhhbXBsZVxuXHRyZXZlcnQoZXhhbXBsZSA9IHRoaXMuc2VsZWN0ZWQpIHtcblx0XHR0aGlzLnVwZGF0ZShleGFtcGxlLCB0aGlzLl9zYXZlZEV4YW1wbGVzW2V4YW1wbGVdKTtcblx0fVxuXG5cdC8vIFNlbGVjdCBhIGRpZmZlcmVudCBleGFtcGxlLlxuXHRzZWxlY3QoZXhhbXBsZSkge1xuXHRcdGlmICghZXhhbXBsZSB8fCB0aGlzLmV4YW1wbGVzW2V4YW1wbGVdID09IG51bGwpIGV4YW1wbGUgPSBPYmplY3Qua2V5cyh0aGlzLmV4YW1wbGVzKVswXSB8fCBcIlwiO1xuXHRcdHRoaXMuc2VsZWN0ZWQgPSBsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlID0gZXhhbXBsZTtcblx0XHR0aGlzLm91dHB1dCA9IFwiXCI7XG5cdH1cblxuXHQvLyBDcmVhdGUgYSBuZXcgZXhhbXBsZS5cblx0Ly8gU2F2ZXMgYW5kIHNlbGVjdHMgdGhlIGV4YW1wbGUgYXV0b21hdGljYWxseS5cblx0dXBkYXRlKG5hbWUsIGNvZGUsIHNraXBTYXZlKSB7XG5cdFx0dGhpcy5leGFtcGxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZXhhbXBsZXMsIHsgWyBuYW1lIF06IGNvZGUgfSk7XG5cdFx0dGhpcy5zZWxlY3QobmFtZSk7XG5cdFx0dGhpcy5vdXRwdXQgPSBcIlwiO1xuXHRcdGlmICghc2tpcFNhdmUpIHRoaXMuc2F2ZSgpO1xuXHR9XG5cblx0Ly8gRGVsZXRlIGFuIGV4YW1wbGUuXG5cdC8vIFNhdmVzIGFuZCBzZWxlY3RzIGFub3RoZXIgZXhhbXBsZSBhdXRvbWF0aWNhbGx5LlxuXHRkZWxldGUobmFtZSA9IHRoaXMuc2VsZWN0ZWQsIHNob3dDb25maXJtKSB7XG5cdFx0aWYgKHNob3dDb25maXJtICYmICFjb25maXJtKGBSZWFsbHkgZGVsZXRlIGV4YW1wbGUgJHtuYW1lfT9gKSkgcmV0dXJuO1xuXHRcdGxldCBleGFtcGxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZXhhbXBsZXMpO1xuXHRcdGRlbGV0ZSBleGFtcGxlc1tuYW1lXTtcblx0XHR0aGlzLmV4YW1wbGVzID0gZXhhbXBsZXM7XG5cdFx0dGhpcy5zYXZlKCk7XG5cdFx0dGhpcy5zZWxlY3QoKTtcblx0fVxuXG5cdC8vIENyZWF0ZSBhIG5ldyBleGFtcGxlLlxuXHRjcmVhdGUobmFtZSwgY29kZSA9IFwiXCIpIHtcblx0XHQvLyBJZiBubyBuYW1lLCBwcm9tcHQuXG5cdFx0aWYgKCFuYW1lKSBuYW1lID0gcHJvbXB0KFwiTmFtZSBmb3IgdGhpcyBleGFtcGxlP1wiKTtcblx0XHQvLyBGb3JnZXQgaXQgaWYgbm8gbmFtZS5cblx0XHRpZiAoIW5hbWUpIHJldHVybjtcblxuXHRcdHRoaXMudXBkYXRlKG5hbWUsIGNvZGUpO1xuXHR9XG5cblx0Ly8gUmVuYW1lIGFuIGV4YW1wbGUuXG5cdC8vIFNlbGVjdHMgYW5kIHNhdmVzIGF1dG9tYXRpY2FsbHkuXG5cdHJlbmFtZShvbGROYW1lID0gdGhpcy5zZWxlY3RlZCwgbmV3TmFtZSkge1xuXHRcdC8vIElmIG5vIG5ldyBuYW1lLCBwcm9tcHQuXG5cdFx0aWYgKCFuZXdOYW1lKSBuZXdOYW1lID0gcHJvbXB0KFwiTmV3IG5hbWUgZm9yIHRoaXMgZXhhbXBsZT9cIiwgb2xkTmFtZSk7XG5cblx0XHQvLyBGb3JnZXQgaXQgaWYgbm8gbmFtZSBzdXBwbGllZCBvciBuYW1lIGlzIHRoZSBzYW1lXG5cdFx0aWYgKCFuZXdOYW1lIHx8IG5ld05hbWUgPT09IG9sZE5hbWUpIHJldHVybjtcblx0XHRpZiAodGhpcy5leGFtcGxlc1tuZXdOYW1lXSkgcmV0dXJuIGNvbnNvbGUud2FybihgZXhhbXBsZXMucmVuYW1lKFwiJHtuZXdOYW1lfVwiKTogbmFtZSBhbHJlYWR5IGluIHVzZWApO1xuXG5cdFx0bGV0IGNvZGUgPSB0aGlzLmV4YW1wbGVzW29sZE5hbWVdO1xuXHRcdHRoaXMuZGVsZXRlKG9sZE5hbWUpO1xuXHRcdHRoaXMudXBkYXRlKG5ld05hbWUsIGNvZGUpO1xuXHR9XG5cblx0Ly8gRHVwbGljYXRlIGFuIGV4YW1wbGUuXG5cdGR1cGxpY2F0ZShvbGROYW1lID0gdGhpcy5zZWxlY3RlZCwgbmV3TmFtZSkge1xuXHRcdC8vIElmIG5vIG5ldyBuYW1lLCBwcm9tcHQuXG5cdFx0aWYgKCFuZXdOYW1lKSBuZXdOYW1lID0gcHJvbXB0KFwiTmV3IG5hbWUgZm9yIGR1cGxpY2F0ZSBleGFtcGxlP1wiLCBvbGROYW1lKTtcblx0XHQvLyBGb3JnZXQgaXQgaWYgbm8gbmFtZSBzdXBwbGllZCBvciBuYW1lIGlzIHRoZSBzYW1lXG5cdFx0aWYgKCFuZXdOYW1lIHx8IG5ld05hbWUgPT09IG9sZE5hbWUpIHJldHVybjtcblx0XHRpZiAodGhpcy5leGFtcGxlc1tuZXdOYW1lXSkgcmV0dXJuIGNvbnNvbGUud2FybihgZXhhbXBsZXMucmVuYW1lKFwiJHtuZXdOYW1lfVwiKTogbmFtZSBhbHJlYWR5IGluIHVzZWApO1xuXG5cdFx0dGhpcy51cGRhdGUobmV3TmFtZSwgdGhpcy5jb2RlKTtcblx0fVxuXG5cdC8vIENvbXBpbGUgdGhlIGN1cnJlbnQgZXhhbXBsZSwgcGxhY2luZyBpdCBpbiBvdXIgYG91dHB1dGAuXG4vL1RPRE86IHNvbWUgd2F5IHRvIGRvIHRoaXMgYXV0b21hdGljYWxseSB3LyBcIm91dHB1dFwiID9cblx0Y29tcGlsZSgpIHtcblx0XHR0aGlzLm91dHB1dCA9IFwiLi4uY29tcGlsaW5nLi4uXCI7XG5cdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRsZXQgcmVzdWx0ID0gcGFyc2VyLnBhcnNlKFwic3RhdGVtZW50c1wiLCB0aGlzLmNvZGUpO1xuXHRcdFx0aWYgKCFyZXN1bHQpIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKFwiQ2FuJ3QgcGFyc2UhXCIpO1xuXHRcdFx0XHR0aGlzLm91dHB1dCA9IFwiQ2FuJ3QgcGFyc2Ugc3RhdGVtZW50c1wiO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUuaW5mbyhcIlJlc3VsdFwiLCByZXN1bHQpO1xuXHRcdFx0XHR0aGlzLm91dHB1dCA9IHJlc3VsdC50b1NvdXJjZShwYXJzZXIpO1xuXHRcdFx0fVxuXHRcdH0sIDEwMCk7XG5cdH1cblxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC9FeGFtcGxlU3RvcmUuanMiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTExNTc1OTAyOFxudmFyIGdsb2JhbCA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuTWF0aCA9PSBNYXRoXG4gID8gd2luZG93IDogdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgJiYgc2VsZi5NYXRoID09IE1hdGggPyBzZWxmXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1uZXctZnVuY1xuICA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5pZiAodHlwZW9mIF9fZyA9PSAnbnVtYmVyJykgX19nID0gZ2xvYmFsOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19nbG9iYWwuanNcbi8vIG1vZHVsZSBpZCA9IDQ4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy9cbi8vICA8U3BhY2VyPiBjb21wb25lbnQgZm9yIHVzZSB3aXRoIG9hay5cbi8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tIFwicHJvcC10eXBlc1wiO1xuaW1wb3J0IHsgY2xhc3NOYW1lcyB9IGZyb20gXCIuL3V0aWxcIjtcblxuaW1wb3J0IFwiLi9TcGFjZXIubGVzc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBTcGFjZXIocHJvcHMpIHtcbiAgY29uc3Qge1xuICAgIGNsYXNzTmFtZSxcbiAgICBhcHBlYXJhbmNlLCBzaXplLCB3aWR0aCwgaGVpZ2h0LFxuICAgIGlubGluZSwgZmx1aWQsIHRpbnksIHNtYWxsLCBtZWRpdW0sIGxhcmdlLCBodWdlLCBtYXNzaXZlXG4gIH0gPSBwcm9wcztcblxuICBjb25zdCBzcGFjZXJQcm9wcyA9IHtcbiAgICBjbGFzc05hbWU6IGNsYXNzTmFtZXMoY2xhc3NOYW1lLCBcIm9ha1wiLCBzaXplLCBhcHBlYXJhbmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB7IGlubGluZSwgZmx1aWQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzcGFjZXJcIiksXG4gICAgc3R5bGU6IHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiA8ZGl2IHsuLi5zcGFjZXJQcm9wc30vPjtcbn1cblxuU3BhY2VyLnByb3BUeXBlcyA9IHtcbiAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICBhcHBlYXJhbmNlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICBzaXplOiBQcm9wVHlwZXMuc3RyaW5nLFxuICB3aWR0aDogUHJvcFR5cGVzLm51bWJlcixcbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLFxuXG4gIGlubGluZTogUHJvcFR5cGVzLmJvb2wsXG4gIGZsdWlkOiBQcm9wVHlwZXMuYm9vbCxcblxufTtcblxuU3BhY2VyLmRlZmF1bHRQcm9wcyA9IHtcbiAgc2l6ZTogXCJtZWRpdW1cIlxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC9TcGFjZXIuanN4IiwiaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHByb3BUeXBlcyBmcm9tIFwicHJvcC10eXBlc1wiO1xuaW1wb3J0IHsgVGV4dEFyZWEgfSBmcm9tICdzZW1hbnRpYy11aS1yZWFjdCdcblxuLy9cbi8vXHQjIDxUYWJiYWJsZVRleHRBcmVhPiAtLSA8U1VJLlRleHRBcmVhPiBpbiB3aGljaCB5b3UgY2FuIHR5cGUgYSB0YWIgY2hhcmFjdGVyOlxuLy9cdC0gSWYgbm90aGluZyBpcyBzZWxlY3RlZCwgaW5zZXJ0cyBhIHRhYiBjaGFyYWN0ZXJcbi8vXHQtIElmIGFueXRoaW5nIGlzIHNlbGVjdGVkLCBpbnNlcnRzIHRhYiBjaGFyYWN0ZXJzIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmUocylcbi8vXHQtIElmIHNoaWZ0IGtleSBpcyBkb3duLCBpbnNlcnRzIHRhYiBjaGFyYWN0ZXJzIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmUocykuXG4vL1xuLy9cdCMjIyBQcm9wZXJ0aWVzXG4vL1x0LSBgc2F2ZWAgKHJlcXVpcmVkKSAtLSBmdW5jdGlvbiB1c2VkIHRvIHNhdmUgdGhlIHJlc3VsdHMgb24ga2V5cHJlc3Ncbi8vXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYWJiYWJsZVRleHRBcmVhIGV4dGVuZHMgVGV4dEFyZWEge1xuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIDxUZXh0QXJlYSB7Li4udGhpcy5wcm9wc30gb25LZXlEb3duPXt0aGlzLm9uS2V5RG93bn0gLz47XG5cdH1cblxuXHQvLyBEbyBOT1QgZXhpdCBvbiB0YWIgLS0gaW5zZXJ0IG9yIHJlbW92ZSB0YWIocykgdmFsdWUgaW5zdGVhZC5cblx0b25LZXlEb3duID0gKGV2ZW50KSA9PiB7XG5cbi8vVE9ETyBmaXJlIGB0aGlzLnByb3BzLm9uS2V5RG93bmAgaWYgZGVmaW5lZC4uLlxuXHRcdC8vIEZvcmdldCBpdCBpZiBub3QgYSB0YWJcblx0XHRpZiAoZXZlbnQua2V5Q29kZSAhPT0gOSkgcmV0dXJuO1xuXG5cdFx0Ly8gcHJldmVudCBkZWZhdWx0IHNvIHdlIGRvbid0IGV4aXQgdGhlIGZpZWxkXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdC8vIGZpZ3VyZSBvdXQgdGhlIHRleHQgcmFuZ2Vcblx0XHR2YXIgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcblx0XHR2YXIgdGV4dCA9IGVsZW1lbnQudmFsdWU7XG5cdFx0dmFyIHN0YXJ0ID0gZWxlbWVudC5zZWxlY3Rpb25TdGFydDtcblx0XHR2YXIgZW5kID0gZWxlbWVudC5zZWxlY3Rpb25FbmQ7XG5cblx0XHQvLyBSZXBsYWNlbWVudCB0ZXh0XG5cdFx0bGV0IG5ld1RleHQgPSBcIlwiLCBzZWxlY3Rpb25TdGFydCA9IHN0YXJ0LCBzZWxlY3Rpb25FbmQgPSBlbmQ7XG5cblx0XHQvLyBJZiBzZWxlY3Rpb24gaXMgZW1wdHksXG5cdFx0aWYgKHN0YXJ0ID09PSBlbmQgJiYgIWV2ZW50LnNoaWZ0S2V5KSB7XG5cdFx0XHRuZXdUZXh0ID0gXCJcXHRcIjtcblx0XHRcdHNlbGVjdGlvblN0YXJ0ID0gc2VsZWN0aW9uRW5kID0gZW5kICsgMTtcblx0XHR9XG5cdFx0Ly8gb3RoZXJ3aXNlIGluZGVudC9kZS1pbmRlbnQgYWxsIG9mIHRoZSBsaW5lc1xuXHRcdGVsc2Uge1xuXHRcdC8vIHVzZSBzdGFydCBhbmQgZW5kIG9mIGxpbmUocylcbi8vY29uc29sZS5pbmZvKGBzdGFydDogJHtzdGFydH0gOiR7dGV4dFtzdGFydF19OiAgIGVuZDogJHtlbmR9IDogJHt0ZXh0W2VuZF19OmApO1xuXHRcdFx0aWYgKHRleHRbc3RhcnRdICE9PSBcIlxcblwiKSBzdGFydCA9IHRleHQubGFzdEluZGV4T2YoXCJcXG5cIiwgc3RhcnQpICsgMTtcblx0XHRcdGlmICh0ZXh0W2VuZC0xXSA9PT0gXCJcXG5cIikgZW5kLS07XG5cdFx0XHRlbHNlIGlmICh0ZXh0W2VuZCsxXSAhPT0gXCJcXG5cIikgZW5kID0gdGV4dC5pbmRleE9mKFwiXFxuXCIsIGVuZCkgLSAxO1xuLy9jb25zb2xlLmluZm8oYHN0YXJ0OiAke3N0YXJ0fSA6JHt0ZXh0W3N0YXJ0XX06ICAgZW5kOiAke2VuZH0gOiAke3RleHRbZW5kXX06YCk7XG5cblx0XHRcdGxldCBsaW5lcyA9IHRleHQuc2xpY2Uoc3RhcnQsIGVuZCkuc3BsaXQoXCJcXG5cIik7XG5cdFx0XHQvLyBpZiBzaGlmdCBrZXkgaXMgZG93biwgUkVNT1ZFIGEgdGFiIGZyb20gZWFjaCBsaW5lXG5cdFx0XHRpZiAoZXZlbnQuc2hpZnRLZXkpIHtcblx0XHRcdFx0bGluZXMgPSBsaW5lcy5tYXAobGluZSA9PiBsaW5lWzBdID09PSBcIlxcdFwiID8gbGluZS5zdWJzdHIoMSkgOiBsaW5lKTtcblx0XHRcdH1cblx0XHRcdC8vIG90aGVyd2lzZSBBREQgYSB0YWIgdG8gZWFjaCBsaW5lXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0bGluZXMgPSBsaW5lcy5tYXAobGluZSA9PiBcIlxcdFwiICsgbGluZSk7XG5cdFx0XHR9XG5cdFx0XHRzZWxlY3Rpb25TdGFydCA9IHN0YXJ0O1xuXHRcdFx0bmV3VGV4dCA9IGxpbmVzLmpvaW4oXCJcXG5cIik7XG5cdFx0XHRzZWxlY3Rpb25FbmQgPSBzZWxlY3Rpb25TdGFydCArIG5ld1RleHQubGVuZ3RoICsgMTtcblx0XHR9XG5cblx0XHQvLyBVcGRhdGUgaW5wdXQgdmFsdWUuXG5cdFx0ZWxlbWVudC52YWx1ZSBcdD0gdGV4dC5zdWJzdHIoMCwgc3RhcnQpXG5cdFx0XHRcdFx0XHQrIG5ld1RleHRcblx0XHRcdFx0XHRcdCsgdGV4dC5zdWJzdHIoZW5kKTtcblxuXHRcdC8vIFVwZGF0ZSB0aGUgc2VsZWN0aW9uXG5cdFx0ZWxlbWVudC5zZWxlY3Rpb25TdGFydCA9IHNlbGVjdGlvblN0YXJ0O1xuXHRcdGVsZW1lbnQuc2VsZWN0aW9uRW5kID0gc2VsZWN0aW9uRW5kO1xuXG5cdFx0Ly8gRGVsZWdhdGUgdG8gYHByb3BzLm9uQ2hhbmdlYCB0byBzYXZlIHRoZSB2YWx1ZSBvdXRzaWRlIG9mIHRoZSBjb250cm9sXG5cdFx0aWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHRoaXMucHJvcHMub25DaGFuZ2UoZXZlbnQpO1xuXHR9XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hcHAvVGFiYmFibGVUZXh0QXJlYS5qc3giLCIvLyBDb21tb24gaW1wb3J0c1xuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5cbi8vIFBhcnNlclxuaW1wb3J0IHBhcnNlciBmcm9tIFwiLi4vcnVsZXMvc3BlbGwvaW5kZXguanNcIjtcblxuLy8gQXBwLXNwZWNpZmljIGltcG9ydHNcbmltcG9ydCBTcGVsbEVkaXRvciBmcm9tIFwiLi9TcGVsbEVkaXRvci5qc3hcIjtcblxuLy8gS2ljayBvZmYgb3VyIHRvcC1sZXZlbCBlbGVtZW50XG5SZWFjdERPTS5yZW5kZXIoXG4gIDxTcGVsbEVkaXRvciAvPixcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlYWN0LXJvb3QnKVxuKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hcHAvaW5kZXguanN4IiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgUmVhY3QgVXRpbGl0eSBmdW5jdGlvbnNcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBgY2xhc3NOYW1lc2AsIGNvbmNlcHQgc3RvbGVuIGZyb206ICBodHRwOi8vamVkd2F0c29uLmdpdGh1Yi5pby9jbGFzc25hbWVzXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NOYW1lcyAoLi4uYXJncykge1xuICByZXR1cm4gYXJncy5tYXAoIGFyZyA9PiB7XG4gICAgaWYgKCFhcmcpIHJldHVybiBcIlwiO1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFyZykpIHJldHVybiBjbGFzc05hbWVzKC4uLmFyZyk7XG4gICAgc3dpdGNoICh0eXBlb2YgYXJnKSB7XG4gICAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICBjYXNlIFwic3RyaW5nXCI6ICByZXR1cm4gYXJnO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGFyZykubWFwKCBrZXkgPT4gYXJnW2tleV0gPyBrZXkgOiBcIlwiKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgICAgICAgICAgICAgICAuam9pbihcIiBcIik7XG4gICAgfVxuICB9KS5maWx0ZXIoQm9vbGVhbilcbiAgICAuam9pbihcIiBcIik7XG59XG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hcHAvdXRpbC5qcyIsIi8vIE1lbW9pemUvZm9yZ2V0IHNlbWFudGljcy5cblxuLy8gUmV0dXJuIGEgbWVtb2l6aW5nIGdldHRlciBmdW5jdGlvbi5cbi8vIFRFU1RNRVxuZXhwb3J0IGZ1bmN0aW9uIG1lbW9pemVkKHByb3BlcnR5LCBnZXR0ZXIpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzW3Byb3BlcnR5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR2YXIgdmFsdWUgPSBnZXR0ZXIuYXBwbHkodGhpcyk7XG5cdFx0XHRpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHQvLyBEZWZpbmUgc28gdGhhdCB3ZSBjYW4gYmUgZGVsZXRlZCBhbmQgcmUtZGVmaW5lZCwgYnV0IG5vdCBzZXQgb3IgZW51bWVyYXRlZC5cblx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIHByb3BlcnR5LCB7IHZhbHVlLCBjb25maWd1cmFibGU6IHRydWUgfSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzW3Byb3BlcnR5XTtcblx0fVxufVxuXG5cbi8vIFJldHVybiBhIG1lbW9pemUgZnVuY3Rpb24gZm9yIHVzZSBhcyBhIGdldHRlciBpbiBhIGBPYmplY3QuZGVmaW5lUHJvcGVydHkoKWBcbi8vIFRFU1RNRVxuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZU1lbW9pemVkKHByb3BlcnR5LCBnZXR0ZXIpIHtcblx0cmV0dXJuIHtcblx0XHRnZXQgOiBtZW1vaXplZChwcm9wZXJ0eSwgZ2V0dGVyKVxuXHR9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvbWVtb2l6ZS5qcyIsIi8vXG4vL1x0IyBSdWxlcyBwYXJzaW5nIGpzeFxuLy9cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4uLy4uL1BhcnNlclwiO1xuaW1wb3J0IFRva2VuaXplciBmcm9tIFwiLi4vLi4vVG9rZW5pemVyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG4vLyBDcmVhdGUgXCJKU1hcIiBwYXJzZXIuXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTmFtZShcIkpTWFwiKTtcbmV4cG9ydCBkZWZhdWx0IHBhcnNlcjtcblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICB7XG4gICAgbmFtZTogXCJqc3hcIixcbiAgICBhbGlhczogWyBcImV4cHJlc3Npb25cIiwgXCJzdGF0ZW1lbnRcIiBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBqc3hFbGVtZW50IGV4dGVuZHMgUnVsZSB7XG4gICAgICAvLyBUZXh0IHN0cmluZ3MgZ2V0IGVuY29kZWQgYXMgYHRleHRgIG9iamVjdHMgaW4gdGhlIHRva2VuIHN0cmVhbS5cbiAgICAgIHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGgpIHtcbiAgICAgICAgbGV0IHRva2VuID0gdG9rZW5zW3N0YXJ0XTtcbiAgICAgICAgaWYgKCEodG9rZW4gaW5zdGFuY2VvZiBUb2tlbml6ZXIuSlNYRWxlbWVudCkpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiB0aGlzLmNsb25lKHtcbiAgICAgICAgICBtYXRjaGVkOiB0b2tlbixcbiAgICAgICAgICBuZXh0U3RhcnQ6IHN0YXJ0ICsgMVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udmVydCBvdXIgYXR0cmlidXRlcyB0byBzb3VyY2UuXG4gICAgICAvLyBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIG5vIGF0dHJpYnV0ZXMuXG4gICAgICBhdHRyc1RvU291cmNlKGpzeEVsZW1lbnQgPSB0aGlzLm1hdGNoZWQpIHtcbiAgICAgICAgbGV0IGF0dHJpYnV0ZXMgPSBqc3hFbGVtZW50LmF0dHJpYnV0ZXM7XG4gICAgICAgIGlmICghYXR0cmlidXRlcyB8fCAhYXR0cmlidXRlcy5sZW5ndGgpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICAgICAgbGV0IGF0dHJzID0gYXR0cmlidXRlcy5tYXAoICh7IG5hbWUsIHZhbHVlIH0pID0+IHtcbiAgICAgICAgICAvLyBpZiBOTyB2YWx1ZSwgYXNzdW1lIGl0J3MgYSB2YXJpYWJsZSBvZiB0aGUgc2FtZSBuYW1lXG4gICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHZhbHVlID0gbmFtZTtcbiAgICAgICAgICAvLyBpZiBpdCdzIGFuIGFycmF5LCBpdCdzIGEgc3BlbGwgZXhwcmVzc2lvbiwgcG9zc2libHkgd2l0aCBuZXN0ZWQgSlNYIGVsZW1lbnRzLi4uXG4gICAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBUb2tlbml6ZXIuSlNYRXhwcmVzc2lvbikge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmpzeEV4cHJlc3Npb25Ub1NvdXJjZSh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGVsc2UgaWYgYSBKU1ggZWxlbWVudCwgcmVjdXJzZVxuICAgIC8vVE9ETzogaW5kZW50Li4uXG4gICAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBUb2tlbml6ZXIuSlNYRWxlbWVudCkge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1NvdXJjZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBPdGhlcndpc2UgaWYgYSBudW1iZXIgb3IgVGV4dCBsaXRlcmFsLCBqdXN0IHVzZSBpdFxuXG4gICAgICAgICAgLy8gc3BlY2lhbCBjYXNlIGBjbGFzc2AgdG8gYGNsYXNzTmFtZWAgYmVjYXVzZSBSZWFjdCBpcyBlZmZpbmcgcGVyc25pY2tldHkuXG4gICAgICAgICAgaWYgKG5hbWUgPT09IFwiY2xhc3NcIikgbmFtZSA9IFwiY2xhc3NOYW1lXCI7XG4gICAgLy9UT0RPOiBlc2NhcGUgbmFtZXMgd2hpY2ggYXJlIGludmFsaWQgSlMgaWRlbnRpZmllcnNcbiAgICAgICAgICByZXR1cm4gYCR7bmFtZX06ICR7dmFsdWV9YDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGB7ICR7YXR0cnMuam9pbihcIiwgXCIpfSB9YDtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIGFuIGFycmF5IHdpdGggc291cmNlIGZvciBlYWNoIG9mIG91ciBjaGlsZHJlbi5cbiAgICAgIC8vIFJldHVybnMgYHVuZGVmaW5lZGAgaWYgd2UgZG9uJ3QgaGF2ZSBhbnkgY2hpbGRyZW4uXG4gICAgICBjaGlsZHJlblRvU291cmNlKGpzeEVsZW1lbnQgPSB0aGlzLm1hdGNoZWQpIHtcbiAgICAgICAgbGV0IGNoaWxkcmVuID0ganN4RWxlbWVudC5jaGlsZHJlbjtcbiAgICAgICAgaWYgKCFjaGlsZHJlbiB8fCBjaGlsZHJlbi5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBjaGlsZHJlbi5tYXAoY2hpbGQgPT4ge1xuICAgIC8vVE9ETzogZXNjYXBlIGlubmVyIHF1b3Rlcy4uLlxuICAgICAgICAgIGlmICh0eXBlb2YgY2hpbGQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIC8vZm9yZ2V0IGl0IGlmIHdoaXRlc3BhY2Ugb25seS4uLiA/Pz9cbiAgICAgICAgICAgIGxldCB0ZXh0ID0gY2hpbGQudHJpbSgpO1xuICAgICAgICAgICAgaWYgKCF0ZXh0KSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmV0dXJuIGBcIiR7dGV4dH1cImA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIFRva2VuaXplci5KU1hFbGVtZW50KSB7XG4gICAgICAgICAgICBsZXQgY2hpbGRTb3VyY2UgPSB0aGlzLmpzeEVsZW1lbnRUb1NvdXJjZShjaGlsZCk7XG4gICAgICAgICAgICByZXR1cm4gY2hpbGRTb3VyY2Uuc3BsaXQoXCJcXG5cIikuam9pbihcIlxcblxcdFwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmpzeEV4cHJlc3Npb25Ub1NvdXJjZShjaGlsZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcImNoaWxkcmVuVG9Tb3VyY2UoKTogZG9uJ3QgdW5kZXJzdGFuZCBjaGlsZFwiICsgIGNoaWxkKTtcbiAgICAgICAgfSlcbiAgICAgICAgLy8gcmVtb3ZlIHVuZGVmaW5lZC9lbXB0eSBzdHJpbmcgcnVsZXNcbiAgICAgICAgLmZpbHRlcihCb29sZWFuKTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udmVydCBKU1ggZXhwcmVzc2lvbiAoIGB7Li4ufWAgKSB0byBKUyBzb3VyY2UuXG4gICAgICBqc3hFeHByZXNzaW9uVG9Tb3VyY2UoanN4RXhwcmVzc2lvbikge1xuICAgICAgICBsZXQgdG9rZW5zID0ganN4RXhwcmVzc2lvbi50b2tlbnM7XG4gICAgY29uc29sZS5pbmZvKGpzeEV4cHJlc3Npb24sIHRva2Vucyk7XG4gICAgICAgIHJldHVybiBcIi9cIiArIGAqVE9ETzogJHt0b2tlbnMuam9pbihcIiBcIil9KmAgKyBcIi9cIjtcbiAgICAgIH1cblxuICAgICAganN4RWxlbWVudFRvU291cmNlKGpzeEVsZW1lbnQgPSB0aGlzLm1hdGNoZWQpIHtcbiAgICAgICAgLy8gZ2V0IHRoZSBiaXRzIG9mIHRoZSBvdXRwdXRcbiAgICAgICAgbGV0IHRhZ05hbWUgPSBgXCIke2pzeEVsZW1lbnQudGFnTmFtZX1cImA7XG4gICAgICAgIGxldCBhdHRycyA9IHRoaXMuYXR0cnNUb1NvdXJjZShqc3hFbGVtZW50KTtcbiAgICAgICAgbGV0IGNoaWxkcmVuID0gdGhpcy5jaGlsZHJlblRvU291cmNlKGpzeEVsZW1lbnQpO1xuXG4gICAgICAgIGxldCBvdXRwdXQgPSBgY3JlYXRlRWxlbWVudCgke3RhZ05hbWV9YDtcbiAgICAgICAgaWYgKCFhdHRycyAmJiBjaGlsZHJlbikgYXR0cnMgPSBcIm51bGxcIjtcblxuICAgICAgICBpZiAoYXR0cnMpIG91dHB1dCArPSBgLCAke2F0dHJzfWA7XG4gICAgICAgIGlmIChjaGlsZHJlbikge1xuICAgICAgICAgIG91dHB1dCArPSBcIixcXG5cXHRcIiArIGNoaWxkcmVuLmpvaW4oXCIsXFxuXFx0XCIpICsgXCJcXG5cIjtcbiAgICAgICAgfVxuICAgICAgICBvdXRwdXQgKz0gXCIpXCJcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmpzeEVsZW1lbnRUb1NvdXJjZSh0aGlzLm1hdGNoZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ydWxlcy9zcGVsbC9KU1guanMiLCIvL1xuLy9cdCMgUnVsZXMgZm9yIGlmIHN0YXRlbWVudHMuXG4vL1xuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5cbi8vIENyZWF0ZSBcImlmXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck5hbWUoXCJpZlwiKTtcbmV4cG9ydCBkZWZhdWx0IHBhcnNlcjtcblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICB7XG4gICAgbmFtZTogXCJpZlwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJpZiB7Y29uZGl0aW9uOmV4cHJlc3Npb259ICh0aGVufDopPyB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaWZfIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgY29uZGl0aW9uLCBzdGF0ZW1lbnQsIGJsb2NrIH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoKTtcbiAgLy9cdFx0XHRpZiAoc3RhdGVtZW50ICYmIGJsb2NrKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJpZiBtYXkgb25seSBoYXZlIGlubGluZSBzdGF0ZW1lbnQgT1IgYmxvY2tcIik7XG4gICAgICAgIGxldCBzdGF0ZW1lbnRzID0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhzdGF0ZW1lbnQsIGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIGBpZiAoJHtjb25kaXRpb259KSAke3N0YXRlbWVudHN9YDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gTk9URTogdGhpcyBpcyBOT1QgYSBibG9jayBzdGF0ZW1lbnQuLi4gPz8/XG4gIHtcbiAgICBuYW1lOiBcImJhY2t3YXJkc19pZlwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJ7c3RhdGVtZW50fSBpZiB7Y29uZGl0aW9uOmV4cHJlc3Npb259ICg/OihlbHNlfG90aGVyd2lzZSkge2Vsc2VTdGF0ZW1lbnQ6c3RhdGVtZW50fSk/XCIsXG4gICAgbGVmdFJlY3Vyc2l2ZTogdHJ1ZSxcbiAgICB0ZXN0UnVsZTogbmV3IFJ1bGUuS2V5d29yZHMoeyBsaXRlcmFsczogWyBcImlmXCIgXSB9KSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgYmFja3dhcmRzX2lmIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgY29uZGl0aW9uLCBzdGF0ZW1lbnQsIGVsc2VTdGF0ZW1lbnQgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICBsZXQgb3V0cHV0ID0gYGlmICgke2NvbmRpdGlvbn0pIHsgJHtzdGF0ZW1lbnR9IH1gO1xuICAgICAgICBpZiAoZWxzZVN0YXRlbWVudCkgb3V0cHV0ICs9IGBcXG5lbHNlIHsgJHtlbHNlU3RhdGVtZW50fSB9YFxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJlbHNlX2lmXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIihlbHNlfG90aGVyd2lzZSkgaWYge2NvbmRpdGlvbjpleHByZXNzaW9ufSAodGhlbnw6KSB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZWxzZV9pZiBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGNvbmRpdGlvbiwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gIC8vXHRcdFx0aWYgKHN0YXRlbWVudCAmJiBibG9jaykgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiZWxzZSBpZiBtYXkgb25seSBoYXZlIGlubGluZSBzdGF0ZW1lbnQgT1IgYmxvY2tcIik7XG4gICAgICAgIGxldCBzdGF0ZW1lbnRzID0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhzdGF0ZW1lbnQsIGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIGBlbHNlIGlmICgke2NvbmRpdGlvbn0pICR7c3RhdGVtZW50c31gXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImVsc2VcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiKGVsc2V8b3RoZXJ3aXNlKSAoOik/IHtzdGF0ZW1lbnR9P1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBlbHNlXyBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHN0YXRlbWVudCwgYmxvY2sgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAvL1x0XHRcdGlmIChzdGF0ZW1lbnQgJiYgYmxvY2spIHRocm93IG5ldyBTeW50YXhFcnJvcihcImVsc2UgaWYgbWF5IG9ubHkgaGF2ZSBpbmxpbmUgc3RhdGVtZW50IE9SIGJsb2NrXCIpO1xuICAgICAgICBsZXQgc3RhdGVtZW50cyA9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoc3RhdGVtZW50LCBibG9jayk7XG4gICAgICAgIHJldHVybiBgZWxzZSAke3N0YXRlbWVudHN9YFxuICAgICAgfVxuICAgIH1cbiAgfVxuKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ydWxlcy9zcGVsbC9pZi5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgZGVhbGluZyB3aXRoIGxpc3RzXG4vL1xuXG4vLyBUT0RPOiBjb25maXJtIGlkZW50aWZpZXJzIGFyZSBwbHVyYWwgaW4gc29tZSBvZiB0aGUgYmVsb3c/XG4vLyBUT0RPOiBgbGlzdC5jbG9uZSgpYCB0byByZXR1cm4gbmV3IGxpc3Qgb2Ygc2FtZSB0eXBlLlxuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5cbmltcG9ydCB7IGlzUGx1cmFsLCBzaW5ndWxhcml6ZSB9IGZyb20gXCIuLi8uLi91dGlscy9zdHJpbmdcIjtcblxuLy8gQ3JlYXRlIFwibGlzdHNcIiBwYXJzZXIuXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTmFtZShcImxpc3RzXCIpO1xuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG5cbi8vIFdPUktJTkcgRlJPTSBPVEhFUiBSVUxFUyAodGVzdG1lKVxuLy9cdGB0aGUgbGVuZ3RoIG9mIDxsaXN0PmBcbi8vXHRgPHRoaW5nPiBpcyBub3Q/IGluIDxsaXN0PmBcbi8vXHRgPGxpc3Q+IGlzIG5vdD8gZW1wdHlgXG4vL1x0YHNldCBpdGVtIDEgb2YgbXlMaXN0IHRvICdhJ2BcblxuXG4vLyBUT0RPOiBcdGBjcmVhdGUgbGlzdCB3aXRoIDxleHA+LCA8ZXhwPiwgPGV4cD5gXG4vLyBUT0RPOlx0YGR1cGxpY2F0ZSBsaXN0YFxuLy8gVE9ETzpcdGBkdXBsaWNhdGUgbGlzdCB3aXRoIDxleHA+LCA8ZXhwPiwgPGV4cD5gID8/P1xuLy8gVE9ETzpcdGB0aGUgc2l6ZSBvZiA8bGlzdD5gID0+IHdpbGwgbWFwIHRvIGBsaXN0LnNpemVgLi4uXG4vL1x0XHRcdFx0LSBpbnN0YWxsIGBzaXplYCBhcyBhbiBhbGlhcyB0byBgbGVuZ3RoYD9cbi8vIFRPRE86XHRgbW92ZSA8dGhpbmc+IHRvIGVuZCBvZiA8bGlzdD5gID8/P1xuLy8gVE9ETzpcdGBTZXRgIGZvciBhIHVuaXF1ZSBsaXN0P1xuLy8gVE9ETzpcdHR5cGVkIGxpc3Q/XG4vLyBUT0RPOlx0bGlzdCB3aGljaCB3b24ndCB0YWtlIG51bGwvdW5kZWZpbmVkXG5cblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICAvLyBSZXR1cm4gdGhlIGxlbmd0aCBvZiB0aGUgbGlzdC5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9sZW5ndGhcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcInRoZT8gbnVtYmVyIG9mIHtpZGVudGlmaWVyfSBpbiB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X2xlbmd0aCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxpc3QsIGlkZW50aWZpZXIgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAvLyBUT0RPOiBzcGVjaWFsIGNhc2UgJ3dvcmRzJywgJ2xpbmVzJywgZXRjXG4gICAgICAgIHJldHVybiBgJHtsaXN0fS5sZW5ndGhgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBSZXR1cm4gdGhlIGZpcnN0IHBvc2l0aW9uIG9mIHNwZWNpZmllZCBpdGVtIGluIHRoZSBsaXN0IGFzIGFuIGFycmF5LlxuICAvLyBJZiBpdGVtIGlzIG5vdCBmb3VuZCwgcmV0dXJucyBgdW5kZWZpbmVkYC5cbiAgLy8gTk9URTogdGhpcyBwb3NpdGlvbiByZXR1cm5lZCBpcyAqKjEtYmFzZWQqKi5cbiAgLy9URVNUTUVcbiAgLy8gVE9ETzogYHBvc2l0aW9uc2AsIGBsYXN0IHBvc2l0aW9uYCwgYGFmdGVyLi4uYFxuICB7XG4gICAgbmFtZTogXCJsaXN0X3Bvc2l0aW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ0aGU/IHBvc2l0aW9uIG9mIHt0aGluZzpleHByZXNzaW9ufSBpbiB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3Bvc2l0aW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIGxpc3QgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnBvc2l0aW9uT2YoJHt0aGluZ30sICR7bGlzdH0pYFxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvL1xuICAvL1x0T3JkaW5hbCBudW1iZXJzIChmaXJzdCwgc2Vjb25kLCBsYXN0LCBldGMpLlxuICAvLyBUT0RPOiBzaXh0eS1maWZ0aCwgdHdvIGh1bmRyZWQgZm9ydHkgbmludGguLi5cbiAgLy9cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJmaXJzdFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gMSB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwic2Vjb25kXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAyIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJ0aGlyZFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gMyB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiZm91cnRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiA0IH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJmaWZ0aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gNSB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwic2l4dGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDYgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInNldmVudGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDcgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImVpZ2h0aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gOCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwibmludGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDkgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInRlbnRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAxMCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwicGVudWx0aW1hdGVcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIC0yIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJmaW5hbFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gLTEgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImxhc3RcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIC0xIH1cbiAgICB9XG4gIH0sXG5cblxuXG4gIC8vIHRyZWF0IGxpc3QgYXMgYSBzdGFjayBvciBxdWV1ZVxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInRvcFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gMSB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiYm90dG9tXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAtMSB9XG4gICAgfVxuICB9LFxuXG5cblxuICAvLyBJbmRleCBleHByZXNzaW9uOiBudW1lcmljIHBvc2l0aW9uIGluIHNvbWUgbGlzdC5cbiAgLy9cdGUuZy5cdGBjYXJkIDEgb2YgdGhlIHBpbGVgXG4gIC8vXHRcdFx0YGNhcmQgIzIgb2YgdGhlIHBpbGVgXG4gIC8vXHRcdFx0YHRoZSBmaXJzdCBjYXJkIG9mIHRoZSBwaWxlYFxuICAvL1xuICAvLyBOT1RFOiBOZWdhdGl2ZSBudW1lcmljIHBvc2l0aW9ucyBjb21lIGZyb20gdGhlIEVORCBvZiB0aGUgbGlzdC5cbiAgLy9cdGUuZy5cdGBjYXJkIC0xIG9mIHRoZSBwaWxlYFxuICAvL1xuICAvLyBOT1RFOiBPdXIgcG9zaXRpb25zIGFyZSAqKjEtYmFzZWQqKiBhbmQgSmF2YXNjcmlwdCBpcyAqKjAtYmFzZWQqKi5cbiAgLy9cdFx0IGUuZy4gYGl0ZW0gMSBvZiB0aGUgYXJyYXlgICA9IGBhcnJheVswXWBcbiAgLy9cbiAgLy8gVE9ETzogaWYgYGlkZW50aWZpZXJgIGlzIFwid29yZFwiLCBvdXRwdXQgYGdldFdvcmQoKWAgZXRjXG4gIC8vIFRPRE86IHNwZWNpYWwgY2FzZSAnd29yZHMnLCAnbGluZXMnLCBldGMgP1xuICB7XG4gICAgbmFtZTogXCJwb3NpdGlvbl9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJ7aWRlbnRpZmllcn0ge3Bvc2l0aW9uOmV4cHJlc3Npb259IG9mICh0aGU/KSB7ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwidGhlIHtwb3NpdGlvbjpvcmRpbmFsfSB7aWRlbnRpZmllcn0gb2YgKHRoZT8pIHtleHByZXNzaW9ufVwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcG9zaXRpb25fZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2V7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgaWRlbnRpZmllciwgcG9zaXRpb24sIGV4cHJlc3Npb24gfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICAvLyBJZiB3ZSBnb3QgYSBwb3NpdGl2ZSBudW1iZXIgbGl0ZXJhbCwgY29tcGVuc2F0ZSBmb3IgSlMgMC1iYXNlZCBhcnJheXMgbm93LCBmb3IgbmljZXIgb3V0cHV0LlxuICAgICAgICBpZiAodHlwZW9mIHBvc2l0aW9uID09PSBcIm51bWJlclwiICYmIHBvc2l0aW9uID4gMCkge1xuICAgICAgICAgIHJldHVybiBgJHtleHByZXNzaW9ufVske3Bvc2l0aW9uIC0gMX1dYDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYHNwZWxsLmdldEl0ZW0oJHtleHByZXNzaW9ufSwgJHtwb3NpdGlvbn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBQaWNrIGEgU0lOR0xFIHJhbmRvbSBpdGVtIGZyb20gdGhlIGxpc3QuXG4gIC8vIFRPRE86IGNvbmZpcm0gaWRlbnRpZmllciBpcyBwbHVyYWw/XG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcInJhbmRvbV9wb3NpdGlvbl9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJhIHJhbmRvbSB7aWRlbnRpZmllcn0gKG9mfGZyb218aW4pICh0aGUpPyB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5kb21fcG9zaXRpb25fZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxpc3QgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldFJhbmRvbUl0ZW1PZigke2xpc3R9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFBpY2sgYSB1bmlxdWUgc2V0IG9mIHJhbmRvbSBpdGVtcyBmcm9tIHRoZSBsaXN0LCByZXR1cm5pbmcgYW4gYXJyYXkuXG4gIC8vIFRPRE86IGB0d28gcmFuZG9tIGl0ZW1zLi4uYFxuICAvLyBUT0RPOiBjb25maXJtIGlkZW50aWZpZXIgaXMgcGx1cmFsP1xuICAvLyBUT0RPOiBgbGlzdC5jbG9uZSgpYCB0byByZXR1cm4gbmV3IGxpc3Qgb2Ygc2FtZSB0eXBlLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJyYW5kb21fcG9zaXRpb25zX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIntudW1iZXJ9IHJhbmRvbSB7aWRlbnRpZmllcn0gKG9mfGZyb218aW4pICh0aGUpPyB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5kb21fcG9zaXRpb25zX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBudW1iZXIsIGxpc3QgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldFJhbmRvbUl0ZW1zT2YoJHtsaXN0fSwgJHtudW1iZXJ9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gUmFuZ2UgZXhwcmVzc2lvbi5cbiAgLy8gUmV0dXJucyBhIG5ldyBsaXN0LlxuICAvLyBOT1RFOiBgc3RhcnRgIGlzICoqMS1iYXNlZCoqLlxuICAvLyBOT1RFOiBgZW5kYCBpcyBpbmNsdXNpdmUhXG4gIC8vIFRPRE86IGNvbmZpcm0gaWRlbnRpZmllciBpcyBwbHVyYWw/XG4gIC8vIFRPRE86IGBsaXN0LmNsb25lKClgIHRvIHJldHVybiBuZXcgbGlzdCBvZiBzYW1lIHR5cGUuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcInJhbmdlX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIntpZGVudGlmaWVyfSB7c3RhcnQ6ZXhwcmVzc2lvbn0gdG8ge2VuZDpleHByZXNzaW9ufSBvZiB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5nZV9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgc3RhcnQsIGVuZCwgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0UmFuZ2UoJHtsaXN0fSwgJHtzdGFydH0sICR7ZW5kfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBTdGFydGluZyByYW5nZSBleHByZXNzaW9uLlxuICAvLyBSZXR1cm5zIGEgbmV3IGxpc3QuXG4gIC8vIGUuZy5cdGBmaXJzdCA0IGl0ZW1zIG9mIGxpc3RgXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImZpcnN0X2luX3JhbmdlXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJmaXJzdCB7bnVtYmVyOmV4cHJlc3Npb259IHtpZGVudGlmaWVyfSAoaW58b2YpIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJhbmdlX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBudW1iZXIsIGxpc3QgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldFJhbmdlKCR7bGlzdH0sIDEsICR7bnVtYmVyfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBFbmRpbmcgcmFuZ2UgZXhwcmVzc2lvbi5cbiAgLy8gUmV0dXJucyBhIG5ldyBsaXN0LlxuICAvLyBlLmcuXHRgbGFzdCA0IGl0ZW1zIG9mIGxpc3RgXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxhc3RfaW5fcmFuZ2VcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcImxhc3Qge251bWJlcjpleHByZXNzaW9ufSB7aWRlbnRpZmllcn0gKGlufG9mKSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5nZV9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbnVtYmVyLCBsaXN0IH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoKTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRFbmRSYW5nZSgke2xpc3R9LCAxLCAke251bWJlcn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBSYW5nZSBleHByZXNzaW9uIHN0YXJ0aW5nIGF0IHNvbWUgaXRlbSBpbiB0aGUgbGlzdC5cbiAgLy8gUmV0dXJucyBhIG5ldyBsaXN0LlxuICAvLyBJZiBpdGVtIGlzIG5vdCBmb3VuZCwgcmV0dXJucyBhbiBlbXB0eSBsaXN0LiAoPz8/KVxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJyYW5nZV9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7aWRlbnRpZmllcn0gKGlufG9mKSB7bGlzdDpleHByZXNzaW9ufSBzdGFydGluZyB3aXRoIHt0aGluZzpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5nZV9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIGxpc3QgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldFJhbmdlKCR7bGlzdH0sIHNwZWxsLnBvc2l0aW9uT2YoJHt0aGluZ30sICR7bGlzdH0pKWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gTGlzdCBmaWx0ZXIuXG4gIC8vIE5PVEU6IHdlIHdpbGwgc2luZ3VsYXJpemUgYGlkZW50aWZpZXJgIGFuZCB1c2UgdGhhdCBhcyB0aGUgYXJndW1lbnQgdG8gYGV4cHJlc3Npb25gLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2ZpbHRlclwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2lkZW50aWZpZXJ9IChpbnxvZikge2xpc3Q6ZXhwcmVzc2lvbn0gd2hlcmUge2NvbmRpdGlvbjpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X2ZpbHRlciBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGlkZW50aWZpZXIsIGNvbmRpdGlvbiwgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIC8vIHVzZSBzaW5ndWxhciBvZiBpZGVudGlmaWVyIGZvciBtZXRob2QgYXJndW1lbnRcbiAgICAgICAgbGV0IGFyZ3VtZW50ID0gc2luZ3VsYXJpemUoaWRlbnRpZmllci50b1NvdXJjZSgpKTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5maWx0ZXIoJHtsaXN0fSwgJHthcmd1bWVudH0gPT4gJHtjb25kaXRpb259KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gU2V0IG1lbWJlcnNoaXAgKGxlZnQgcmVjdXJzaXZlKS5cbiAgLy8gTk9URTogd2Ugd2lsbCBzaW5ndWxhcml6ZSBgaWRlbnRpZmllcmAgYW5kIHVzZSB0aGF0IGFzIHRoZSBhcmd1bWVudCB0byBgZXhwcmVzc2lvbmAuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfbWVtYmVyc2hpcF90ZXN0XCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7bGlzdDpleHByZXNzaW9ufSAob3BlcmF0b3I6aGFzfGhhcyBub3xkb2VzbnQgaGF2ZXxkb2VzIG5vdCBoYXZlKSB7aWRlbnRpZmllcn0gd2hlcmUge2ZpbHRlcjpleHByZXNzaW9ufVwiLFxuICAgIGxlZnRSZWN1cnNpdmU6IHRydWUsXG4gICAgdGVzdFJ1bGU6IG5ldyBSdWxlLktleXdvcmRzKHsgbWF0Y2g6IFwid2hlcmVcIiB9KSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9tZW1iZXJzaGlwX3Rlc3QgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyLCBvcGVyYXRvciwgZmlsdGVyLCBsaXN0IH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoKTtcbiAgICAgICAgbGV0IGJhbmcgPSBvcGVyYXRvciA9PT0gXCJoYXNcIiA/IFwiXCIgOiBcIiFcIjtcbiAgICAgICAgLy8gdXNlIHNpbmd1bGFyIG9mIGlkZW50aWZpZXIgZm9yIG1ldGhvZCBhcmd1bWVudFxuICAgICAgICBsZXQgYXJndW1lbnQgPSBzaW5ndWxhcml6ZShpZGVudGlmaWVyLnRvU291cmNlKCkpO1xuICAgICAgICByZXR1cm4gYCR7YmFuZ31zcGVsbC5hbnkoJHtsaXN0fSwgJHthcmd1bWVudH0gPT4gJHtmaWx0ZXJ9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vXG4gIC8vXHRBZGRpbmcgdG8gbGlzdCAoaW4tcGxhY2UpXG4gIC8vXG5cbiAgLy8gQWRkIHRvIGVuZCBvZiBsaXN0LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2FwcGVuZFwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJhcHBlbmQge3RoaW5nOmV4cHJlc3Npb259IHRvIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgICBcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8gKCh0aGU/KSBlbmQgb2YpPyB7bGlzdDpleHByZXNzaW9ufVwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9hcHBlbmQgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIHJldHVybiBgc3BlbGwuYXBwZW5kKCR7bGlzdH0sICR7dGhpbmd9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIEFkZCB0byBiZWdpbm5pbmcgb2YgbGlzdC5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9wcmVwZW5kXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBbXG4gICAgICBcInByZXBlbmQge3RoaW5nOmV4cHJlc3Npb259IHRvIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgICBcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8gdGhlIChzdGFydHxmcm9udHx0b3ApIG9mIHtsaXN0OmV4cHJlc3Npb259XCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3ByZXBlbmQgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIHJldHVybiBgc3BlbGwucHJlcGVuZCgke2xpc3R9LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBBZGQgdG8gbWlkZGxlIG9mIGxpc3QsIHB1c2hpbmcgZXhpc3RpbmcgaXRlbXMgb3V0IG9mIHRoZSB3YXkuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfYWRkX2F0XCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn0gYXQgcG9zaXRpb24ge3Bvc2l0aW9uOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3Rfc3BsaWNlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIHBvc2l0aW9uLCBsaXN0IH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoKTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5zcGxpY2UoJHtsaXN0fSwgJHtwb3NpdGlvbn0sICR7dGhpbmd9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gVE9ETzogIFx0XCJhZGQge3RoaW5nOmV4cHJlc3Npb259IHRvIHtsaXN0OmV4cHJlc3Npb259IGJlZm9yZSB7aXRlbTpleHByZXNzaW9ufVwiLFxuXG4gIC8vIEFkZCB0byBtaWRkbGUgb2YgbGlzdCwgcHVzaGluZyBleGlzdGluZyBpdGVtcyBvdXQgb2YgdGhlIHdheS5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9hZGRfYWZ0ZXJcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiYWRkIHt0aGluZzpleHByZXNzaW9ufSB0byB7bGlzdDpleHByZXNzaW9ufSBhZnRlciB7aXRlbTpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X2FkZF9hZnRlciBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBpdGVtLCBsaXN0IH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoKTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5zcGxpY2UoJHtsaXN0fSwgc3BlbGwucG9zaXRpb25PZigke2xpc3R9LCAke2l0ZW19KSwgJHt0aGluZ30pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy9cbiAgLy9cdFJlbW92aW5nIGZyb20gbGlzdCAoaW4tcGxhY2UpXG4gIC8vXG5cbiAgLy8gRW1wdHkgbGlzdC5cbiAgLy9UT0RPOiBtYWtlIGBlbXB0eWAgYW5kL29yIGBjbGVhcmAgYSBnZW5lcmljIHN0YXRlbWVudD8/P1xuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2VtcHR5XCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIihlbXB0eXxjbGVhcikge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9lbXB0eSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxpc3QgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmNsZWFyKCR7bGlzdH0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gUmVtb3ZlIG9uZSBpdGVtIGZyb20gbGlzdCBieSBwb3NpdGlvbi5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9yZW1vdmVfcG9zaXRpb25cIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwicmVtb3ZlIHtpZGVudGlmaWVyfSB7bnVtYmVyOmV4cHJlc3Npb259IG9mIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcmVtb3ZlX3Bvc2l0aW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbnVtYmVyLCBsaXN0IH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoKTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5yZW1vdmVJdGVtKCR7bGlzdH0sICR7bnVtYmVyfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBSZW1vdmUgcmFuZ2Ugb2YgdGhpbmdzIGZyb20gbGlzdC5cbiAgLy8gTk9URTogYHN0YXJ0YCBpcyAqKjEtYmFzZWQqKi5cbiAgLy8gTk9URTogYGVuZGAgaXMgaW5jbHVzaXZlIVxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3JlbW92ZV9yYW5nZVwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJyZW1vdmUge2lkZW50aWZpZXJ9IHtzdGFydDpleHByZXNzaW9ufSB0byB7ZW5kOmV4cHJlc3Npb259IG9mIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcmVtb3ZlX3Bvc2l0aW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgc3RhcnQsIGVuZCwgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIHJldHVybiBgc3BlbGwucmVtb3ZlUmFuZ2UoJHtsaXN0fSwgJHtzdGFydH0sICR7ZW5kfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFJlbW92ZSBhbGwgaW5zdGFuY2VzIG9mIHNvbWV0aGluZyBmcm9tIGEgbGlzdC5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9yZW1vdmVcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwicmVtb3ZlIHt0aGluZzpleHByZXNzaW9ufSBmcm9tIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcmVtb3ZlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIGxpc3QgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnJlbW92ZSgke2xpc3R9LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBSZW1vdmUgYWxsIGl0ZW1zIGZyb20gbGlzdCB3aGVyZSBjb25kaXRpb24gaXMgdHJ1ZS5cbiAgLy8gTk9URTogd2Ugd2lsbCBzaW5ndWxhcml6ZSBgaWRlbnRpZmllcmAgYW5kIHVzZSB0aGF0IGFzIHRoZSBhcmd1bWVudCB0byBgZXhwcmVzc2lvbmAuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcmVtb3ZlX3doZXJlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJlbW92ZSB7aWRlbnRpZmllcn0gKGlufG9mfGZyb20pIHtsaXN0OmV4cHJlc3Npb259IHdoZXJlIHtjb25kaXRpb246ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9yZW1vdmVfd2hlcmUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyLCBjb25kaXRpb24sIGxpc3QgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICAvLyB1c2Ugc2luZ3VsYXIgb2YgaWRlbnRpZmllciBmb3IgbWV0aG9kIGFyZ3VtZW50XG4gICAgICAgIGxldCBhcmd1bWVudCA9IHNpbmd1bGFyaXplKGlkZW50aWZpZXIudG9Tb3VyY2UoKSk7XG4gICAgICAgIHJldHVybiBgc3BlbGwucmVtb3ZlV2hlcmUoJHtsaXN0fSwgJHthcmd1bWVudH0gPT4gJHtjb25kaXRpb259KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy9cbiAgLy9cdFJhbmRvbSAoaW4tcGxhY2UpIGxpc3QgbWFuaXB1bGF0aW9uLlxuICAvL1xuXG4gIC8vIFJldmVyc2UgbGlzdCBpbi1wbGFjZS5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9yZXZlcnNlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJldmVyc2Uge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9yZXZlcnNlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIHJldHVybiBgc3BlbGwucmV2ZXJzZSgke2xpc3R9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFNodWZmbGUgbGlzdCBpbi1wbGFjZS5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9zaHVmZmxlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIihyYW5kb21pemV8c2h1ZmZsZSkge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9zaHVmZmxlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIHJldHVybiBgc3BlbGwuc2h1ZmZsZSgke2xpc3R9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gSXRlcmF0aW9uXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfaXRlcmF0aW9uXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImZvciAoZWFjaCk/IHtpdGVtVmFyOmlkZW50aWZpZXJ9IGluIHtsaXN0OmV4cHJlc3Npb259Oj8ge3N0YXRlbWVudH0/XCIsXG4gICAgICBcImZvciAoZWFjaCk/IHtpdGVtVmFyOmlkZW50aWZpZXJ9IChhbmR8LCkge3Bvc2l0aW9uVmFyOmlkZW50aWZpZXJ9IGluIHtsaXN0OmV4cHJlc3Npb259Oj8ge3N0YXRlbWVudH0/XCIsXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9pdGVyYXRpb24gZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpdGVtVmFyLCBwb3NpdGlvblZhciwgbGlzdCwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIGxldCBvdXRwdXQ7XG4gICAgICAgIGlmIChwb3NpdGlvblZhcikge1xuICAgICAgICAgIG91dHB1dCA9IGBmb3IgKGxldCAke3Bvc2l0aW9uVmFyfSA9IDEsIGJhcjsgJHtpdGVtVmFyfSA9ICR7bGlzdH1bJHtwb3NpdGlvblZhcn0tMV0sICR7cG9zaXRpb25WYXJ9IDw9ICR7bGlzdH0ubGVuZ3RoOyAke3Bvc2l0aW9uVmFyfSsrKSBgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gTk9URTogdGhpcyBpcyByZWxhdGl2ZWx5IHNsb3cuLi4gIHByb2JhYmx5IGRvZXNuJ3QgbWF0dGVyLi4uXG4gICAgICAgICAgb3V0cHV0ID0gYGZvciAobGV0ICR7aXRlbVZhcn0gb2YgJHtsaXN0fSkgYDtcbiAgICAgICAgfVxuICAgICAgICBvdXRwdXQgKz0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhzdGF0ZW1lbnQsIGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBSYW5nZVxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJyYW5nZV9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJyYW5nZSB7c3RhcnQ6ZXhwcmVzc2lvbn0gdG8ge2VuZDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5nZV9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgc3RhcnQsIGVuZCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0UmFuZ2UoJHtzdGFydH0sICR7ZW5kfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfVxuKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ydWxlcy9zcGVsbC9saXN0cy5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgaW5maXggYW5kIHByZWZpeCBvcGVyYXRvcnMuXG4vL1xuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5cbi8vIENyZWF0ZSBcIm9wZXJhdG9yc1wiIHBhcnNlci5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JOYW1lKFwib3BlcmF0b3JzXCIpO1xuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG5wYXJzZXIuZGVmaW5lUnVsZXMoXG4gIC8vIFRPRE86XG4gIC8vIFx0Ly8gRmluZCBiZXN0IG1hdGNoIGFjY29yZGluZyB0byBvcGVyYXRvciBwcmVjZWRlbmNlIGFzIGRlZmluZWQgYmVsb3cuXG4gIC8vIFx0Z2V0QmVzdE1hdGNoKG1hdGNoZXMpIHtcbiAgLy8gXHRcdGNvbnNvbGUud2FybihcIkdCTVwiLCBtYXRjaGVzLCBtYXRjaGVzLm1hcChtYXRjaCA9PiBtYXRjaC5wcmVjZWRlbmNlKSwgbWF0Y2hlcy5tYXAobWF0Y2ggPT4gbWF0Y2gubWF0Y2hlZFRleHQpKTtcbiAgLy8gXHRcdHJldHVybiBtYXRjaGVzLnJlZHVjZShmdW5jdGlvbiAoYmVzdCwgbmV4dCkge1xuICAvLyBcdFx0XHQvLyB0YWtlIGhpZ2hlc3QgcHJlY2VkZW5jZSBtYXRjaCBmaXJzdFxuICAvLyBcdFx0XHRpZiAobmV4dC5wcmVjZWRlbmNlID4gYmVzdC5wcmVjZWRlbmNlKSByZXR1cm4gbmV4dDtcbiAgLy8gXHRcdFx0Ly8gdGFrZSBsb25nZXN0IG1hdGNoIGlmIHNhbWUgcHJlY2VkZW5jZVxuICAvLyBcdFx0XHRpZiAobmV4dC5wcmVjZWRlbmNlID09PSBiZXN0LnByZWNlZGVuY2UpIHtcbiAgLy8gXHRcdFx0XHRpZiAobmV4dC5lbmRJbmRleCA+IGJlc3QuZW5kSW5kZXgpIHJldHVybiBuZXh0O1xuICAvLyBcdFx0XHR9XG4gIC8vIFx0XHRcdHJldHVybiBiZXN0O1xuICAvLyBcdFx0fSwgbWF0Y2hlc1swXSk7XG4gIC8vIFx0fVxuXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2xoczpleHByZXNzaW9ufSB7b3BlcmF0b3I6aW5maXhfb3BlcmF0b3J9IHtyaHM6ZXhwcmVzc2lvbn1cIixcbiAgICBsZWZ0UmVjdXJzaXZlOiB0cnVlLFxuICAgIHRlc3RSdWxlOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGluZml4X29wZXJhdG9yX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBsaHMsIHJocywgb3BlcmF0b3IgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIG9wZXJhdG9yLmFwcGx5KGxocy50b1NvdXJjZSgpLCByaHMudG9Tb3VyY2UoKSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIyMgSW5maXggb3BlcmF0b3JzOiAgIGB7bGhzfSA8b3BlcmF0b3I+IHtyaHN9YCwgZWc6IGBhIGlzIDFgXG4gIC8vIE5PVEU6IGBvcGVyYXRvci5hcHBseWAgTVVTVCByZXR1cm4gYSBmdW5jdGlvbiB3aGljaCB0cmFuc2Zvcm1zIHR3byBhcmd1bWVudHMgKGBsaHNgIGFuZCBgcmhzYCkgaW50byBvdXRwdXQuXG4gIC8vIE5PVEU6IGBwcmVjZWRlbmNlYCBudW1iZXJzIGNvbWUgZnJvbSBKYXZhc2NyaXB0IGVxdWl2YWxlbnRzXG4gIC8vXHRcdCBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9PcGVyYXRvcnMvT3BlcmF0b3JfUHJlY2VkZW5jZVxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDYsXG4gICAgc3ludGF4OiBcImFuZFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBhbmQgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm4gYCgke2F9ICYmICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogNSxcbiAgICBzeW50YXg6IFwib3JcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3IgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm4gYCgke2F9IHx8ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTAsXG4gICAgc3ludGF4OiBcImlzXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuIGAoJHthfSA9PSAke2J9KWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEwLFxuICAgIHN5bnRheDogXCJpcyBub3RcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuIGAoJHthfSAhPSAke2J9KWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEwLFxuICAgIHN5bnRheDogXCJpcyBleGFjdGx5XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2V4YWN0bHkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm4gYCgke2F9ID09PSAke2J9KWAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMCxcbiAgICBzeW50YXg6IFwiaXMgbm90IGV4YWN0bHlcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2V4YWN0bHkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm4gYCgke2F9ICE9PSAke2J9KWAgfVxuICAgIH1cbiAgfSxcblxuICAvL1RPRE86IGBzcGVsbC5pc09mVHlwZSh0aGluZywgdHlwZSlgXG4gIC8vVE9ETzogYGlzIHNhbWUgdHlwZSBhc2AgP1xuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpcyBhXCIsXG4gICAgICBcImlzIGFuXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19hIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseSh0aGluZywgdHlwZSkgeyByZXR1cm4gYHNwZWxsLmlzT2ZUeXBlKCR7dGhpbmd9LCAnJHt0eXBlfScpYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImlzIG5vdCBhXCIsXG4gICAgICBcImlzIG5vdCBhblwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2EgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KHRoaW5nLCB0eXBlKSB7IHJldHVybiBgIXNwZWxsLmlzT2ZUeXBlKCR7dGhpbmd9LCAnJHt0eXBlfScpYCB9XG4gICAgfVxuICB9LFxuXG4gIC8vVE9ETzogYHNwZWxsLmNvbnRhaW5zKGNvbGxlY3Rpb24sIHRoaW5nKWBcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgaW5cIixcbiAgICAgIFwiaXMgb25lIG9mXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19pbiBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkodGhpbmcsIGxpc3QpIHsgcmV0dXJuIGAke2xpc3R9LmluY2x1ZGVzKCR7dGhpbmd9KWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpcyBub3QgaW5cIixcbiAgICAgIFwiaXMgbm90IG9uZSBvZlwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2luIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseSh0aGluZywgbGlzdCkgeyByZXR1cm4gYCEke2xpc3R9LmluY2x1ZGVzKCR7dGhpbmd9KWAgfVxuICAgIH1cbiAgfSxcblxuXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaW5jbHVkZXNcIixcbiAgICAgIFwiY29udGFpbnNcIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGluY2x1ZGVzIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShsaXN0LCB0aGluZykgeyByZXR1cm4gYCR7bGlzdH0uaW5jbHVkZXMoJHt0aGluZ30pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImRvZXMgbm90IGluY2x1ZGVcIixcbiAgICAgIFwiZG9lcyBub3QgY29udGFpblwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZG9lc19ub3RfaW5jbHVkZSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkobGlzdCwgdGhpbmcpIHsgcmV0dXJuIGAhJHtsaXN0fS5pbmNsdWRlcygke3RoaW5nfSlgIH1cbiAgICB9XG4gIH0sXG5cblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCI+XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGd0IGV4dGVuZHMgUnVsZS5TeW1ib2xzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gKCR7YX0gPiAke2J9KWAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiaXMgZ3JlYXRlciB0aGFuXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2d0IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9ID4gJHtifSlgIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiPj1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZ3RlIGV4dGVuZHMgUnVsZS5TeW1ib2xzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gKCR7YX0gPj0gJHtifSlgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcImlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0b1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19ndGUgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gKCR7YX0gPj0gJHtifSlgIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiPFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsdCBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9IDwgJHtifSlgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcImlzIGxlc3MgdGhhblwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19sdCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAoJHthfSA8ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcIjw9XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGx0ZSBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9IDw9ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCJpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbHRlIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9IDw9ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMyxcbiAgICBzeW50YXg6IFwiXFxcXCtcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcGx1cyBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gKyAke2J9YCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEzLFxuICAgIHN5bnRheDogXCJwbHVzXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHBsdXMgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gJHthfSArICR7Yn1gIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMyxcbiAgICBzeW50YXg6IFwiLVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBtaW51cyBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gLSAke2J9YCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEzLFxuICAgIHN5bnRheDogXCJtaW51c1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBtaW51cyBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAke2F9IC0gJHtifWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDE0LFxuICAgIHN5bnRheDogXCJcXFxcKlwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0aW1lcyBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gKiAke2J9YCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDE0LFxuICAgIHN5bnRheDogXCJ0aW1lc1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0aW1lcyBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAke2F9ICogJHtifWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDE0LFxuICAgIHN5bnRheDogXCIvXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRpdmlkZWRfYnkgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAke2F9IC8gJHtifWAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxNCxcbiAgICBzeW50YXg6IFwiZGl2aWRlZCBieVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkaXZpZGVkX2J5IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gLyAke2J9YCB9XG4gICAgfVxuICB9LFxuXG4gIC8vVE9ETzogIGArPWAgZXRjPyAgb3RoZXIgbWF0aCBmdW5jdGlvbnM/XG5cblxuICAvL1xuICAvL1xuICAvLyMjIFBvc3RpZnggb3BlcmF0b3JzOiAgIGB7bGhzfSA8b3BlcmF0b3I+YCwgZS5nLiBgYSBpcyBkZWZpbmVkYFxuICAvLyBOT1RFOiBgb3BlcmF0b3IuYXBwbHlgIE1VU1QgcmV0dXJuIGEgZnVuY3Rpb24gd2hpY2ggdHJhbnNmb3JtcyBhcmd1bWVudCAoYGxoc2ApIGludG8gSlMgb3V0cHV0LlxuXG4gIHtcbiAgICBuYW1lOiBcInBvc3RmaXhfb3BlcmF0b3JfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2V4cHJlc3Npb259IHtvcGVyYXRvcjpwb3N0Zml4X29wZXJhdG9yfVwiLFxuICAgIGxlZnRSZWN1cnNpdmU6IHRydWUsXG4gICAgdGVzdFJ1bGU6IFwicG9zdGZpeF9vcGVyYXRvclwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBwb3N0Zml4X29wZXJhdG9yX2V4cHJlc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGV4cHJlc3Npb24sIG9wZXJhdG9yIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBvcGVyYXRvci5hcHBseShleHByZXNzaW9uLnRvU291cmNlKCkpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgc3ludGF4OiBcImlzIGRlZmluZWRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfZGVmaW5lZCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkodGhpbmcpIHsgcmV0dXJuIGAodHlwZW9mICR7dGhpbmd9ICE9PSAndW5kZWZpbmVkJylgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcInBvc3RmaXhfb3BlcmF0b3JcIixcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgdW5kZWZpbmVkXCIsXG4gICAgICBcImlzIG5vdCBkZWZpbmVkXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc191bmRlZmluZWQgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KHRoaW5nKSB7IHJldHVybiBgKHR5cGVvZiAke3RoaW5nfSA9PT0gJ3VuZGVmaW5lZCcpYCB9XG4gICAgfVxuICB9LFxuXG4gIC8vVE9ETzogYHNwZWxsLmlzRW1wdHkodGhpbmcpYFxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgc3ludGF4OiBcImlzIGVtcHR5XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2VtcHR5IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseSh0aGluZykgeyByZXR1cm4gYHNwZWxsLmlzRW1wdHkoJHt0aGluZ30pYCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgc3ludGF4OiBcImlzIG5vdCBlbXB0eVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19ub3RfZW1wdHkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KHRoaW5nKSB7IHJldHVybiBgIXNwZWxsLmlzRW1wdHkoJHt0aGluZ30pYCB9XG4gICAgfVxuICB9LFxuXG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL29wZXJhdG9ycy5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgY3JlYXRpbmcgdmFyaWFibGVzLCBwcm9wZXJ0eSBhY2Nlc3MsIGV0Y1xuLy9cblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG4vLyBDcmVhdGUgXCJzdGF0ZW1lbnRzXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck5hbWUoXCJzdGF0ZW1lbnRzXCIpO1xuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG5wYXJzZXIuZGVmaW5lUnVsZXMoXG4gIC8vXG4gIC8vXHQjIyBSZXR1cm5zXG4gIC8vXG5cbiAgLy8gUmV0dXJuIGEgdmFsdWVcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmV0dXJuX3N0YXRlbWVudFwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJyZXR1cm4ge2V4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJldHVybl9zdGF0ZW1lbnQgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBleHByZXNzaW9uIH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoKTtcbiAgICAgICAgcmV0dXJuIGByZXR1cm4gJHtleHByZXNzaW9ufWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vXG4gIC8vXHQjIyBBc3NpZ25tZW50XG4gIC8vXG5cbiAgLy9URVNUTUVcbiAgLy9UT0RPOiBkaXN0aW5ndWlzaCBiZXR3ZWVuIGBuZXdfaWRlbnRpZmllcmAgYW5kIGBzY29wZWRfaWRlbnRpZmllcmBcbiAge1xuICAgIG5hbWU6IFwiYXNzaWdubWVudFwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBbXG4gICAgICBcInt0aGluZzpleHByZXNzaW9ufSA9IHt2YWx1ZTpleHByZXNzaW9ufVwiLFxuICAgICAgXCJzZXQge3RoaW5nOmV4cHJlc3Npb259IHRvIHt2YWx1ZTpleHByZXNzaW9ufVwiLFxuICAgICAgXCJwdXQge3ZhbHVlOmV4cHJlc3Npb259IGludG8ge3RoaW5nOmV4cHJlc3Npb259XCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBhc3NpZ25tZW50IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIHZhbHVlIH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoKTtcbiAgICAgICAgLy8gVE9ETzogZGVjbGFyZSBpZGVudGlmaWVyIGlmIG5vdCBpbiBzY29wZSwgZXRjXG4gICAgICAgIHJldHVybiBgJHt0aGluZ30gPSAke3ZhbHVlfWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vVEVTVE1FXG4gIC8vIFRPRE86IGBpdGAgbWF5IG5vdCBhbHJlYWR5IGJlIGRlZmluZWQuLi4gPz8/XG4gIHtcbiAgICBuYW1lOiBcImdldF92YWx1ZVwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcImdldCB7dmFsdWU6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZ2V0X3ZhbHVlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdmFsdWUgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpOztcbiAgICAgICAgcmV0dXJuIGBpdCA9ICR7dmFsdWV9YFxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG5cbiAgLy9cbiAgLy9cdCMjIFVzZXIgaW50ZXJhY3Rpb25cbiAgLy8gVE9ETzogbW92ZSBpbnRvIGFub3RoZXIgZmlsZVxuICAvL1xuXG4gIC8vIEFsZXJ0IGEgbWVzc2FnZS5cbiAgLy8gVE9ETzogbmVlZCBzb21lIGZhbmN5IHByb21pc2UganVqdSBoZXJlP1xuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJhbGVydFwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJhbGVydCB7bWVzc2FnZTpleHByZXNzaW9ufSAoPzp3aXRoIHtva0J1dHRvbjp0ZXh0fSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGFsZXJ0IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbWVzc2FnZSwgb2tCdXR0b24gPSBgXCJPS1wiYCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIHJldHVybiBgYXdhaXQgc3BlbGwuYWxlcnQoJHttZXNzYWdlfSwgJHtva0J1dHRvbn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gV2FybmluZyBtZXNzYWdlIC0tIGxpa2UgYWxlcnQgYnV0IGZhbmNpZXIuXG4gIC8vIFRPRE86IG5lZWQgc29tZSBmYW5jeSBwcm9taXNlIGp1anUgaGVyZT9cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwid2FyblwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJ3YXJuIHtleHByZXNzaW9uOmV4cHJlc3Npb259ICg/OndpdGgge29rQnV0dG9uOnRleHR9KT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgd2FybiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG1lc3NhZ2UsIG9rQnV0dG9uID0gYFwiT0tcImAgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICByZXR1cm4gYGF3YWl0IHNwZWxsLndhcm4oJHttZXNzYWdlfSwgJHtva0J1dHRvbn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBDb25maXJtIG1lc3NhZ2UgLS0gcHJlc2VudCBhIHF1ZXN0aW9uIHdpdGggdHdvIGFuc3dlcnMuXG4gIC8vIFRPRE86IG5lZWQgc29tZSBmYW5jeSBwcm9taXNlIGp1anUgaGVyZT9cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwiY29uZmlybVwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJjb25maXJtIHttZXNzYWdlOmV4cHJlc3Npb259ICg/OndpdGgge29rQnV0dG9uOnRleHR9ICg/OiAoYW5kfG9yKSB7Y2FuY2VsQnV0dG9uOnRleHR9KT8gKT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgY29uZmlybSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG1lc3NhZ2UsIG9rQnV0dG9uID0gYFwiT0tcImAsIGNhbmNlbEJ1dHRvbiA9IGBcIkNhbmNlbFwiYCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIHJldHVybiBgYXdhaXQgc3BlbGwuY29uZmlybSgke21lc3NhZ2V9LCAke29rQnV0dG9ufSwgJHtjYW5jZWxCdXR0b259KWA7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL3N0YXRlbWVudHMuanMiLCIvL1xuLy9cdCMgUnVsZXMgZm9yIGRlZmluaW5nIGNsYXNzZXMgKGtub3duIGFzIGB0eXBlc2ApXG4vL1xuXG4vL1RPRE86IGNvbnN0cnVjdG9yXG4vLyBUT0RPOiBtaXhpbnMgLyB0cmFpdHMgLyBjb21wb3NlZCBjbGFzc2VzIC8gYW5ub3RhdGlvbnNcblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG5pbXBvcnQgZ2xvYmFsIGZyb20gXCIuLi8uLi91dGlscy9nbG9iYWxcIjtcbmltcG9ydCB7IHBsdXJhbGl6ZSB9IGZyb20gXCIuLi8uLi91dGlscy9zdHJpbmdcIjtcblxuZXhwb3J0IGRlZmF1bHQgUGFyc2VyLmZvck5hbWUoXCJ0eXBlc1wiKS5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwiZGVmaW5lX3R5cGVcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJkZWZpbmUgdHlwZSB7bmFtZTp0eXBlfSAoPzphcyAoYXxhbikge3N1cGVyVHlwZTp0eXBlfSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRlZmluZV90eXBlIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCBzdHJ1Y3R1cmUgPSBzdXBlci50b1N0cnVjdHVyZSgpO1xuICAgICAgICBzdHJ1Y3R1cmUudHlwZSA9IFwiY2xhc3NcIjtcbiAgICAgICAgcmV0dXJuIHN0cnVjdHVyZTtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHN1cGVyVHlwZSwgYmxvY2sgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICBsZXQgb3V0cHV0ID0gYGNsYXNzICR7bmFtZX1gO1xuICAgICAgICBpZiAoc3VwZXJUeXBlKSBvdXRwdXQgKz0gYCBleHRlbmRzICR7c3VwZXJUeXBlfWA7XG4gICAgICAgIG91dHB1dCArPSBcIiBcIiArIFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoYmxvY2spO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBgbmV3YCBvciBgY3JlYXRlYFxuICAvLyBUaGlzIHdvcmtzIGFzIGFuIGV4cHJlc3Npb24gT1IgYSBzdGF0ZW1lbnQuXG4gIC8vIE5PVEU6IHdlIGFzc3VtZSB0aGF0IGFsbCB0eXBlcyB0YWtlIGFuIG9iamVjdCBvZiBwcm9wZXJ0aWVzPz8/P1xuICB7XG4gICAgbmFtZTogXCJuZXdfdGhpbmdcIixcbiAgICBhbGlhczogW1wiZXhwcmVzc2lvblwiLCBcInN0YXRlbWVudFwiXSxcbiAgICBzeW50YXg6IFwiKGNyZWF0ZXxuZXcpIHt0eXBlfSAoPzp3aXRoIHtwcm9wczpvYmplY3RfbGl0ZXJhbF9wcm9wZXJ0aWVzfSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG5ld190aGluZyBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHR5cGUsIHByb3BzID0gXCJcIiB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIC8vIFNwZWNpYWwgY2FzZSBmb3Igb2JqZWN0LCB3aGljaCB3ZSdsbCBjcmVhdGUgd2l0aCBhbiBvYmplY3QgbGl0ZXJhbC5cbiAgICAgICAgaWYgKHR5cGUgPT09IFwiT2JqZWN0XCIpIHtcbiAgICAgICAgICBpZiAoIXByb3BzKSByZXR1cm4gXCJ7fVwiO1xuICAgICAgICAgIHJldHVybiBwcm9wcztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBgbmV3ICR7dHlwZX0oJHtwcm9wc30pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gRGVjbGFyZSBpbnN0YW5jZSBtZXRob2Qgb3Igbm9ybWFsIGZ1bmN0aW9uLlxuICB7XG4gICAgbmFtZTogXCJkZWNsYXJlX21ldGhvZFwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcIihvcGVyYXRvcjp0b3xvbikge25hbWU6aWRlbnRpZmllcn0ge2FyZ3N9PyAoXFxcXDopPyB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVjbGFyZV9tZXRob2QgZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIC8vIFJldHVybiBhIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlXG4gICAgICB0b1N0cnVjdHVyZSgpIHtcbiAgICAgICAgbGV0IHsgb3BlcmF0b3IsIG5hbWUsIGFyZ3MgPSBbXX0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoKTtcbiAgICAgICAgbGV0IHN1YlR5cGUgPSAob3BlcmF0b3IgPT09IFwidG9cIiA/IFwibWV0aG9kXCIgOiBcImV2ZW50XCIpO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcImZ1bmN0aW9uXCIsIHN1YlR5cGUsIG5hbWUsIGFyZ3MgfTtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIGFyZ3MgPSBbXSwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIGxldCBvdXRwdXQgPSBgJHtuYW1lfSgke2FyZ3Muam9pbihcIiwgXCIpfSkgYDtcbiAgICAgICAgb3V0cHV0ICs9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoc3RhdGVtZW50LCBibG9jayk7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIERlY2xhcmUgXCJhY3Rpb25cIiwgd2hpY2ggY2FuIGJlIGNhbGxlZCBnbG9iYWxseSBhbmQgYWZmZWN0cyB0aGUgcGFyc2VyLlxuICAvLyBUT0RPOiBgd2l0aGAgY2xhdXNlICh3aWxsIGNvbmZsaWN0IHdpdGggYHdvcmRgKVxuICAvLyBUT0RPOiBpbnN0YWxsIGluIHBhcnNlciBzb21laG93XG4gIC8vIFRPRE86IGNyZWF0ZSBpbnN0YW5jZSBmdW5jdGlvbj8gIG9yIG1heWJlIHdlIGRvbid0IG5lZWQgaXQ6XG4gIC8vXHRcdFx0YGFjdGlvbiB0dXJuIENhcmQgb3ZlcmAgZm9yIGFuIGluc3RhbmNlIGlzIGp1c3QgYHR1cm4gbWUgb3ZlcmBcbiAgLy9cdFx0XHRgYWN0aW9uIGFkZCBjYXJkIHRvIGRlY2tgID0+IGBhZGQgbWUgdG8gZGVja2BcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwiZGVjbGFyZV9hY3Rpb25cIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJhY3Rpb24gKGtleXdvcmRzOnt3b3JkfXx7dHlwZX0pKyAoXFxcXDopPyB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVjbGFyZV9hY3Rpb24gZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIC8vIEFkZCBgbmFtZWAsIGBhcmdzYCBhbmQgYHR5cGVzYCB0byBtYXRjaGVkIHNvdXJjZVxuICAgICAgZ2V0TWF0Y2hlZFNvdXJjZSgpIHtcbiAgICAgICAgbGV0IG91dHB1dCA9IHN1cGVyLmdldE1hdGNoZWRTb3VyY2UoKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSdzIG9ubHkgb25lIGtleXdvcmQsIGl0IGNhbid0IGJlIGEgYmxhY2tsaXN0ZWQgaWRlbnRpZmllciBvciBhIHR5cGVcbiAgICAgICAgbGV0IHsga2V5d29yZHMgfSA9IG91dHB1dDtcbiAgICAgICAgbGV0IGtleXdvcmRNYXRjaGVzID0gdGhpcy5yZXN1bHRzLmtleXdvcmRzLm1hdGNoZWQ7XG4gICAgICAgIGlmIChrZXl3b3Jkcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICBsZXQga2V5d29yZCA9IGtleXdvcmRzWzBdO1xuICAgICAgICAgIGlmIChrZXl3b3JkTWF0Y2hlc1swXSBpbnN0YW5jZW9mIFJ1bGUuVHlwZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgcGFyc2UoJ2RlY2xhcmVfYWN0aW9uJyk6IG9uZS13b3JkIGFjdGlvbnMgbWF5IG5vdCBiZSB0eXBlczogJHtrZXl3b3JkfWApO1xuICAgICAgICAgIH1cblxuICAvLyBIQUNLOiBgZ2xvYmFsLnBhcnNlcmAgaXMgYSBoYWNrIGhlcmUgZm9yIGNvbnZlbmllbmNlIGluIHRlc3RpbmcuLi5cbi8vICAgICAgICAgICBsZXQgcGFyc2VyID0gKGNvbnRleHQgJiYgY29udGV4dC5wYXJzZXIpIHx8IGdsb2JhbC5wYXJzZXI7XG4vLyAgICAgICAgICAgbGV0IGJsYWNrbGlzdCA9IHBhcnNlci5nZXRCbGFja2xpc3QoXCJpZGVudGlmaWVyXCIpO1xuLy8gICAgICAgICAgIGlmIChibGFja2xpc3Rba2V5d29yZF0pIHtcbi8vICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHBhcnNlKCdkZWNsYXJlX2FjdGlvbicpOiBvbmUtd29yZCBhY3Rpb25zIG1heSBub3QgYmUgYmxhY2tsaXN0ZWQgaWRlbnRpZmllcnNcIjogJHtrZXl3b3JkfWApO1xuLy8gICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZpZ3VyZSBvdXQgYXJndW1lbnRzIGFuZC9vciB0eXBlc1xuICAgICAgICBvdXRwdXQuYXJncyA9IFtdO1xuICAgICAgICBvdXRwdXQudHlwZXMgPSB7fTtcblxuICAgICAgICAvLyBpZiBhbnkgb2YgdGhlIHdvcmRzIGFyZSB0eXBlcyAoY2FwaXRhbCBsZXR0ZXIpIG1ha2UgdGhhdCBhbiBhcmd1bWVudCBvZiB0aGUgc2FtZSBuYW1lLlxuICAgICAgICBrZXl3b3JkTWF0Y2hlcy5tYXAoIChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgUnVsZS5UeXBlKSB7XG4gICAgICAgICAgICBsZXQgVHlwZSA9IGtleXdvcmRzW2luZGV4XTtcbiAgICAgICAgICAgIGxldCB0eXBlID0gVHlwZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICBvdXRwdXQudHlwZXNbdHlwZV0gPSBUeXBlO1xuICAgICAgICAgICAgb3V0cHV0LmFyZ3MucHVzaCh0eXBlKTtcblxuICAgICAgICAgICAgLy8gcmVwbGFjZSB3aXRoIGxvd2VyY2FzZSBpbiBtZXRob2QgbmFtZVxuICAgICAgICAgICAga2V5d29yZHNbaW5kZXhdID0gdHlwZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBnZXQgc3RhdGljIG1ldGhvZCBuYW1lIGFuZCBhcmd1bWVudHMgZm9yIG91dHB1dFxuICAgICAgICBvdXRwdXQubmFtZSA9IGtleXdvcmRzLmpvaW4oXCJfXCIpO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgYXJncyA9IFtdLCB0eXBlcywgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG5cbiAgICAgICAgLy8gZmlndXJlIG91dCBpZiB0aGVyZSBhcmUgYW55IGNvbmRpdGlvbnMgZHVlIHRvIGtub3duIGFyZ3VtZW50IHR5cGVzXG4gICAgICAgIGxldCBjb25kaXRpb25zID0gW107XG4gICAgICAgIGZvciAobGV0IGFyZyBpbiB0eXBlcykge1xuICAgICAgICAgIGNvbmRpdGlvbnMucHVzaChgXFx0aWYgKCFzcGVsbC5pc0EoJHthcmd9LCAke3R5cGVzW2FyZ119KSkgcmV0dXJuIHVuZGVmaW5lZGApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHN0YXRlbWVudHMgPSBSdWxlLkJsb2NrLmVuY2xvc2VTdGF0ZW1lbnRzKGNvbmRpdGlvbnMsIHN0YXRlbWVudCwgYmxvY2spO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhcyBhIFNUQVRJQyBmdW5jdGlvblxuICAgIC8vVE9ETzogY3JlYXRlIGFzIGFuIGluc3RhbmNlIGZ1bmN0aW9uIHdlIGNhbiBjYWxsIG9uIG91cnNlbGYhXG4gICAgICAgIHJldHVybiBgc3RhdGljICR7bmFtZX0oJHthcmdzLmpvaW4oXCIsIFwiKX0pICR7c3RhdGVtZW50c31gO1xuICAgICAgfVxuXG4gICAgICB0b1N0cnVjdHVyZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgYXJncywgdHlwZXMgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcImZ1bmN0aW9uXCIsIHN1YlR5cGU6IFwiYWN0aW9uXCIsIG5hbWUsIGFyZ3MsIHR5cGVzIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBHZXR0ZXIgZWl0aGVyIHdpdGggb3Igd2l0aG91dCBhcmd1bWVudHMuXG4gIC8vIElmIHlvdSBzcGVjaWZ5IGFyZ3VtZW50cywgeWllbGRzIGEgbm9ybWFsIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSB2YWx1ZS5cbiAgLy8gVE9ETzogYHRvIGdldC4uLmAgP1xuICB7XG4gICAgbmFtZTogXCJnZXR0ZXJcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJnZXQge25hbWU6aWRlbnRpZmllcn1cXFxcOiB7ZXhwcmVzc2lvbn0/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGdldHRlciBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIGV4cHJlc3Npb24sIGJsb2NrIH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoKTtcbiAgICAgICAgLy8gSWYgdGhleSBzcGVjaWZpZWQgYW4gaW5saW5lLWV4cHJlc3Npb24sIHByZXBlbmQgcmV0dXJuXG4gICAgICAgIGlmIChleHByZXNzaW9uICYmICFleHByZXNzaW9uLnN0YXJ0c1dpdGgoXCJyZXR1cm4gXCIpKSBleHByZXNzaW9uID0gYHJldHVybiAoJHtleHByZXNzaW9ufSlgO1xuICAgICAgICBsZXQgb3V0cHV0ID0gYGdldCAke25hbWV9KCkgYDtcbiAgICAgICAgb3V0cHV0ICs9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoZXhwcmVzc2lvbiwgYmxvY2spO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IG5hbWUgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcInByb3BlcnR5XCIsIHN1YlR5cGU6IFwiZ2V0dGVyXCIsIG5hbWUgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBTZXR0ZXIuXG4gIC8vIENvbXBsYWlucyBpZiB5b3Ugc3BlY2lmeSBtb3JlIHRoYW4gb25lIGFyZ3VtZW50LlxuICAvLyBJZiB5b3UgZG9uJ3QgcGFzcyBhbiBleHBsaWNpdCBhcmd1bWVudCwgd2UnbGwgYXNzdW1lIGl0J3MgdGhlIHNhbWUgYXMgdGhlIGlkZW50aWZpZXIuXG4gIC8vIGVnO1x0YHNldCBjb2xvcjogc2V0IHRoZSBjb2xvciBvZiBteSB0ZXh0IHRvIGNvbG9yYFxuICAvL1xuICAvLyBUT0RPOiBpbnRlcm5hbCBnZXR0ZXIvc2V0dGVyIHNlbWFudGljcyBhbGEgb2JqZWN0aXZlIENcbiAgLy9cdFx0XHRgc2V0IGNvbG9yOiBpZiBjb2xvciBpcyBpbiBbXCJyZWRcIiwgXCJibHVlXCJdIHRoZW4gc2V0IG15IGNvbG9yIHRvIGNvbG9yYFxuICAvL1x0XHQgPT4gYG15IGNvbG9yYCB3aXRoaW4gc2V0dGVyIHNob3VsZCBhdXRvbWF0aWNhbGx5IHRyYW5zbGF0ZSB0byBgdGhpcy5fY29sb3JgID8/P1xuICAvLyBUT0RPOiBgdG8gc2V0Li4uYCA/XG4gIHtcbiAgICBuYW1lOiBcInNldHRlclwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcInNldCB7bmFtZTppZGVudGlmaWVyfSB7YXJnc30/IChcXFxcOik/IHtzdGF0ZW1lbnR9P1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBzZXR0ZXIgZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICAvLyBkZWZhdWx0IGFyZ3MgdG8gdGhlIHNldHRlciBuYW1lXG4gICAgICAgIGxldCB7IG5hbWUsIGFyZ3MgPSBbbmFtZV0sIHN0YXRlbWVudCwgYmxvY2sgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICAvLyBDb21wbGFpbiBpZiBtb3JlIHRoYW4gb25lIGFyZ3VtZW50XG4gICAgICAgIGlmIChhcmdzICYmIGFyZ3MubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcInBhcnNlKCdzZXR0ZXInKTogb25seSBvbmUgYXJndW1lbnQgYWxsb3dlZCBpbiBzZXR0ZXI6ICBcIiwgdGhpcy5tYXRjaGVkVGV4dCk7XG4gICAgICAgICAgYXJncyA9IFsgYXJnc1swXSBdO1xuICAgICAgICB9XG4gICAgICAgIGxldCBvdXRwdXQgPSBgc2V0ICR7bmFtZX0oJHthcmdzfSkgYDtcbiAgICAgICAgb3V0cHV0ICs9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoc3RhdGVtZW50LCBibG9jayk7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlXG4gICAgICB0b1N0cnVjdHVyZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IFwicHJvcGVydHlcIiwgc3ViVHlwZTogXCJzZXR0ZXJcIiwgbmFtZSB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy9cbiAgLy9cdGRlY2xhcmUgcHJvcGVydGllc1xuICAvL1xuXG4gIC8vVE9ETzogYW5vdGhlciBuYW1lIGZvciBgY29uc3RhbnRgID9cbiAge1xuICAgIG5hbWU6IFwiZGVjbGFyZV9wcm9wZXJ0eVwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcIihzY29wZTpwcm9wZXJ0eXxjb25zdGFudHxzaGFyZWQgcHJvcGVydHkpIHtuYW1lOmlkZW50aWZpZXJ9ICg/Oj0ge3ZhbHVlOmV4cHJlc3Npb259KT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVjbGFyZV9wcm9wZXJ0eSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHNjb3BlLCBuYW1lLCB2YWx1ZSA9IFwiXCIgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICBpZiAodmFsdWUpIHZhbHVlID0gYCA9ICR7dmFsdWV9YDtcblxuICAgICAgICBsZXQgZGVjbGFyYXRpb24gPSBgJHtuYW1lfSR7dmFsdWV9YDtcbiAgICAgICAgc3dpdGNoIChzY29wZSkge1xuICAgICAgICAgIGNhc2UgXCJjb25zdGFudFwiOlxuLy8gICAgICAgICAgICBpZiAoIXZhbHVlKSBjb25zb2xlLndhcm4oXCJwYXJzZSgnZGVjbGFyZV9wcm9wZXJ0eScpOiBjb25zdGFudCBwcm9wZXJ0aWVzIG11c3QgZGVjbGFyZSBhIHZhbHVlOiAgXCIsIHRoaXMubWF0Y2hlZFRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIGBjb25zdCAke2RlY2xhcmF0aW9ufWA7XG5cbiAgICAgICAgICBjYXNlIFwic2hhcmVkIHByb3BlcnR5XCI6XG4gICAgICAgICAgICByZXR1cm4gYEBwcm90byAke2RlY2xhcmF0aW9ufWA7XG5cbiAgICAgICAgICBjYXNlIFwicHJvcGVydHlcIjpcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGRlY2xhcmF0aW9uO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlXG4gICAgICB0b1N0cnVjdHVyZSgpIHtcbiAgICAgICAgbGV0IHsgc2NvcGUsIG5hbWUgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcInByb3BlcnR5XCIsIG5hbWUsIHNjb3BlIH07XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFRPRE86IHNjb3BlX21vZGlmaWVyPz8/XG4gIC8vIFRPRE86IGluaXRpYWwgdmFsdWVcbiAge1xuICAgIG5hbWU6IFwiZGVjbGFyZV9wcm9wZXJ0eV9vZl90eXBlXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwicHJvcGVydHkge25hbWU6aWRlbnRpZmllcn0gYXMgKGF8YW4pPyB7dHlwZX1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVjbGFyZV9wcm9wZXJ0eV9vZl90eXBlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgdHlwZSB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIHJldHVybiBgZ2V0ICR7bmFtZX0oKSB7IHJldHVybiB0aGlzLl9fJHtuYW1lfSB9XFxuYFxuICAgICAgICAgICArIGBzZXQgJHtuYW1lfSh2YWx1ZSkgeyBpZiAoc3BlbGwuaXNBKHZhbHVlLCAke3R5cGV9KSB0aGlzLl9fJHtuYW1lfSA9IHZhbHVlIH1gO1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHR5cGUgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcInByb3BlcnR5XCIsIHN1YlR5cGU6IFwic2V0dGVyXCIsIG5hbWUsIGRhdGFUeXBlOiB0eXBlIH07XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gVE9ETzogd2FybiBvbiBpbnZhbGlkIHNldD8gIHNoYXJlZD8gIHVuZGVmaW5lZD8gc29tZXRoaW5nIG90aGVyIHRoYW4gdGhlIGZpcnN0IHZhbHVlIGFzIGRlZmF1bHQ/XG4gIHtcbiAgICBuYW1lOiBcImRlY2xhcmVfcHJvcGVydHlfYXNfb25lX29mXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwicHJvcGVydHkge25hbWU6aWRlbnRpZmllcn0gYXMgb25lIG9mIHtsaXN0OmxpdGVyYWxfbGlzdH1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVjbGFyZV9wcm9wZXJ0eV9hc19vbmVfb2YgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIGdldE1hdGNoZWRTb3VyY2UoKSB7XG4gICAgICAgIGxldCBvdXRwdXQgPSBzdXBlci5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIG91dHB1dC5wbHVyYWwgPSBwbHVyYWxpemUob3V0cHV0Lm5hbWUpO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgcGx1cmFsLCBsaXN0IH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoKTtcbiAgICAgICAgcmV0dXJuIGBAcHJvdG8gJHtwbHVyYWx9ID0gJHtsaXN0fVxcbmBcbiAgICAgICAgICAgKyBgZ2V0ICR7bmFtZX0oKSB7IHJldHVybiB0aGlzLl9fJHtuYW1lfSA9PT0gdW5kZWZpbmVkID8gdGhpcy4ke3BsdXJhbH1bMF0gOiB0aGlzLl9fJHtuYW1lfSB9XFxuYFxuICAgICAgICAgICArIGBzZXQgJHtuYW1lfSh2YWx1ZSkgeyBpZiAodGhpcy4ke3BsdXJhbH0uaW5jbHVkZXModmFsdWUpKSB0aGlzLl9fJHtuYW1lfSA9IHZhbHVlIH1gO1xuXG4gIC8vIE1PUkUgRUZGSUNJRU5UIEJVVCBVR0xJRVJcbiAgLy8gXHRcdFx0cmV0dXJuIGBzdGF0aWMgJHtwbHVyYWx9ID0gJHtsaXN0fTtcXG5gXG4gIC8vIFx0XHRcdFx0ICsgYGdldCAke25hbWV9IHsgcmV0dXJuIChcIl9fJHtuYW1lfVwiIGluIHRoaXMgPyB0aGlzLl9fJHtuYW1lfSA6ICR7Zmlyc3RWYWx1ZX0pIH1cXG5gXG4gIC8vIFx0XHRcdFx0ICsgYHNldCAke25hbWV9KHZhbHVlKSB7IGlmICh0aGlzLmNvbnN0cnVjdG9yLiR7cGx1cmFsfS5pbmNsdWRlcyh2YWx1ZSkpIHRoaXMuX18ke25hbWV9ID0gdmFsdWUgfWA7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlXG4gICAgICB0b1N0cnVjdHVyZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgcGx1cmFsIH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICB7IHR5cGU6IFwicHJvcGVydHlcIiwgbmFtZSB9LFxuICAgICAgICAgIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBzdWJUeXBlOiBcInNoYXJlZFwiLCBuYW1lOiBwbHVyYWwgfVxuICAgICAgICBdO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vXG4gIC8vXHRTZWxmLXJlZmVyZW5jZVxuICAvL1xuICB7XG4gICAgbmFtZTogXCJtZVwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwibWVcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbWUgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gXCJ0aGlzXCI7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFRPRE86IHRoaXMgcmVhbGx5IG1ha2VzIG1lIHdhbnQgdG8gbWFrZSBgSSBhbSBlbXB0eWAgZXRjIHdvcmsuLi5cbiAge1xuICAgIG5hbWU6IFwiSVwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiSVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBJIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIFwidGhpc1wiO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vXG4gIC8vXHRQcm9wZXJ0eSBhY2Nlc3NcbiAgLy9cblxuICB7XG4gICAgbmFtZTogXCJwcm9wZXJ0eV9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCIocHJvcGVydGllczp0aGUge2lkZW50aWZpZXJ9IG9mKSsgdGhlPyB7ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcHJvcGVydHlfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgZ2V0TWF0Y2hlZFNvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgZXhwcmVzc2lvbiwgcHJvcGVydGllcyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGV4cHJlc3Npb246IGV4cHJlc3Npb24udG9Tb3VyY2UoKSxcbiAgICAgICAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLm1hdGNoZWQubWFwKCBwcm9wZXJ0eSA9PiBwcm9wZXJ0eS5yZXN1bHRzLmlkZW50aWZpZXIudG9Tb3VyY2UoKSApXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBleHByZXNzaW9uLCBwcm9wZXJ0aWVzIH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoKTtcbiAgICAgICAgcHJvcGVydGllcyA9IHByb3BlcnRpZXMucmV2ZXJzZSgpLmpvaW4oXCIuXCIpO1xuICAgICAgICByZXR1cm4gYCR7ZXhwcmVzc2lvbn0uJHtwcm9wZXJ0aWVzfWA7XG4gIC8vIE5PVEU6IHRoZSBmb2xsb3dpbmcgaXMgc2FmZXIsIGJ1dCB1Z2x5IGZvciBkZW1vIHB1cnBvc2VzXG4gIC8vXHRcdFx0cmV0dXJuIGBzcGVsbC5nZXQoJHtleHByZXNzaW9ufSwgWycke3Byb3BlcnRpZXN9J10pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwibXlfcHJvcGVydHlfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiKG15fHRoaXMpIHtpZGVudGlmaWVyfVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBteV9wcm9wZXJ0eV9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgaWRlbnRpZmllciB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG4gICAgICAgIHJldHVybiBgdGhpcy4ke2lkZW50aWZpZXJ9YDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvL1xuICAvL1x0VXRpbGl0eVxuICAvL1xuXG5cbiAgLy8gUHJvcGVydGllcyBjbGF1c2U6IGNyZWF0ZXMgYW4gb2JqZWN0IHdpdGggb25lIG9yIG1vcmUgcHJvcGVydHkgdmFsdWVzLlxuICAvL1x0YGZvbyA9IDEsIGJhciA9IDJgXG4gIC8vVE9ETzogd291bGQgbGlrZSB0byB1c2UgYGFuZGAgYnV0IHRoYXQgd2lsbCBiYXJmIG9uIGV4cHJlc3Npb25zLi4uXG4gIC8vVE9ETzogaG93IHRvIGRvIHByb3BlcnRpZXMgb24gbXVsdGlwbGUgbGluZXM/XG4gIHtcbiAgICBuYW1lOiBcIm9iamVjdF9saXRlcmFsX3Byb3BlcnRpZXNcIixcbiAgICBzeW50YXg6IFwiWyh7a2V5OmlkZW50aWZpZXJ9KD86PSB7dmFsdWU6ZXhwcmVzc2lvbn0pPykgLF1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb2JqZWN0X2xpdGVyYWxfcHJvcGVydGllcyBleHRlbmRzIFJ1bGUuTGlzdCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHByb3BzID0gdGhpcy5yZXN1bHRzLm1hdGNoZWQubWFwKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgICAgICBsZXQgeyBrZXksIHZhbHVlIH0gPSBwcm9wLnJlc3VsdHM7XG4gICAgICAgICAgICBrZXkgPSBrZXkudG9Tb3VyY2UoKTtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgJiYgdmFsdWUudG9Tb3VyY2UoKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkgcmV0dXJuIGBcIiR7a2V5fVwiOiAke3ZhbHVlfWBcbiAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBgeyAke3Byb3BzLmpvaW4oXCIsIFwiKX0gfWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy9NT1ZFIFRPIGBmdW5jdGlvbnNgP1xuICAvLyBBcmd1bWVudHMgY2xhdXNlIGZvciBtZXRob2RzXG4gIC8vXHRgd2l0aCBmb29gIG9yIGB3aXRoIGZvbyBhbmQgYmFyIGFuZCBiYXpgXG4gIC8vVE9ETzoge2lkZW50aWZpZXJ9ID0ge2V4cHJlc3Npb259XHQ9PiByZXF1aXJlcyBgLGAgaW5zdGVhZCBvZiBgYW5kYFxuICAvL1RPRE86IGB3aXRoIGZvbyBhcyBUeXBlYFxuICAvL1RPRE86XHRgd2l0aCBmb28uLi5gIGZvciBzcGxhdD9cbiAge1xuICAgIG5hbWU6IFwiYXJnc1wiLFxuICAgIHN5bnRheDogXCJ3aXRoIFthcmdzOntpZGVudGlmaWVyfSAsXVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBhcmdzIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICAvLyBSZXR1cm5zIGFuIGFycmF5IG9mIGFyZ3VtZW50IHZhbHVlc1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdHMuYXJncy5tYXRjaGVkLm1hcChhcmcgPT4gYXJnLm1hdGNoZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ydWxlcy9zcGVsbC90eXBlcy5qcyIsInJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN5bWJvbCcpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL19jb3JlJykuU3ltYm9sO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvZXM2L3N5bWJvbC5qc1xuLy8gbW9kdWxlIGlkID0gNTAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICh0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJykgdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2EtZnVuY3Rpb24uanNcbi8vIG1vZHVsZSBpZCA9IDU0N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBmYWxzZSAtPiBBcnJheSNpbmRleE9mXG4vLyB0cnVlICAtPiBBcnJheSNpbmNsdWRlc1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpO1xudmFyIHRvQWJzb2x1dGVJbmRleCA9IHJlcXVpcmUoJy4vX3RvLWFic29sdXRlLWluZGV4Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChJU19JTkNMVURFUykge1xuICByZXR1cm4gZnVuY3Rpb24gKCR0aGlzLCBlbCwgZnJvbUluZGV4KSB7XG4gICAgdmFyIE8gPSB0b0lPYmplY3QoJHRoaXMpO1xuICAgIHZhciBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgdmFyIGluZGV4ID0gdG9BYnNvbHV0ZUluZGV4KGZyb21JbmRleCwgbGVuZ3RoKTtcbiAgICB2YXIgdmFsdWU7XG4gICAgLy8gQXJyYXkjaW5jbHVkZXMgdXNlcyBTYW1lVmFsdWVaZXJvIGVxdWFsaXR5IGFsZ29yaXRobVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICBpZiAoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpIHdoaWxlIChsZW5ndGggPiBpbmRleCkge1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgaWYgKHZhbHVlICE9IHZhbHVlKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBBcnJheSNpbmRleE9mIGlnbm9yZXMgaG9sZXMsIEFycmF5I2luY2x1ZGVzIC0gbm90XG4gICAgfSBlbHNlIGZvciAoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKSBpZiAoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTykge1xuICAgICAgaWYgKE9baW5kZXhdID09PSBlbCkgcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4IHx8IDA7XG4gICAgfSByZXR1cm4gIUlTX0lOQ0xVREVTICYmIC0xO1xuICB9O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2FycmF5LWluY2x1ZGVzLmpzXG4vLyBtb2R1bGUgaWQgPSA1NDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gZ2V0dGluZyB0YWcgZnJvbSAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbnZhciBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcbi8vIEVTMyB3cm9uZyBoZXJlXG52YXIgQVJHID0gY29mKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnQXJndW1lbnRzJztcblxuLy8gZmFsbGJhY2sgZm9yIElFMTEgU2NyaXB0IEFjY2VzcyBEZW5pZWQgZXJyb3JcbnZhciB0cnlHZXQgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICB0cnkge1xuICAgIHJldHVybiBpdFtrZXldO1xuICB9IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHZhciBPLCBULCBCO1xuICByZXR1cm4gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogaXQgPT09IG51bGwgPyAnTnVsbCdcbiAgICAvLyBAQHRvU3RyaW5nVGFnIGNhc2VcbiAgICA6IHR5cGVvZiAoVCA9IHRyeUdldChPID0gT2JqZWN0KGl0KSwgVEFHKSkgPT0gJ3N0cmluZycgPyBUXG4gICAgLy8gYnVpbHRpblRhZyBjYXNlXG4gICAgOiBBUkcgPyBjb2YoTylcbiAgICAvLyBFUzMgYXJndW1lbnRzIGZhbGxiYWNrXG4gICAgOiAoQiA9IGNvZihPKSkgPT0gJ09iamVjdCcgJiYgdHlwZW9mIE8uY2FsbGVlID09ICdmdW5jdGlvbicgPyAnQXJndW1lbnRzJyA6IEI7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fY2xhc3NvZi5qc1xuLy8gbW9kdWxlIGlkID0gNTQ5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuLCB0aGF0LCBsZW5ndGgpIHtcbiAgYUZ1bmN0aW9uKGZuKTtcbiAgaWYgKHRoYXQgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZuO1xuICBzd2l0Y2ggKGxlbmd0aCkge1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uIChhKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiAoLyogLi4uYXJncyAqLykge1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2N0eC5qc1xuLy8gbW9kdWxlIGlkID0gNTUwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDcuMi4xIFJlcXVpcmVPYmplY3RDb2VyY2libGUoYXJndW1lbnQpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoaXQgPT0gdW5kZWZpbmVkKSB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzXG4vLyBtb2R1bGUgaWQgPSA1NTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gYWxsIGVudW1lcmFibGUgb2JqZWN0IGtleXMsIGluY2x1ZGVzIHN5bWJvbHNcbnZhciBnZXRLZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcbnZhciBnT1BTID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcHMnKTtcbnZhciBwSUUgPSByZXF1aXJlKCcuL19vYmplY3QtcGllJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgcmVzdWx0ID0gZ2V0S2V5cyhpdCk7XG4gIHZhciBnZXRTeW1ib2xzID0gZ09QUy5mO1xuICBpZiAoZ2V0U3ltYm9scykge1xuICAgIHZhciBzeW1ib2xzID0gZ2V0U3ltYm9scyhpdCk7XG4gICAgdmFyIGlzRW51bSA9IHBJRS5mO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIga2V5O1xuICAgIHdoaWxlIChzeW1ib2xzLmxlbmd0aCA+IGkpIGlmIChpc0VudW0uY2FsbChpdCwga2V5ID0gc3ltYm9sc1tpKytdKSkgcmVzdWx0LnB1c2goa2V5KTtcbiAgfSByZXR1cm4gcmVzdWx0O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2VudW0ta2V5cy5qc1xuLy8gbW9kdWxlIGlkID0gNTUyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuL19yZWRlZmluZScpO1xudmFyIGN0eCA9IHJlcXVpcmUoJy4vX2N0eCcpO1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG52YXIgJGV4cG9ydCA9IGZ1bmN0aW9uICh0eXBlLCBuYW1lLCBzb3VyY2UpIHtcbiAgdmFyIElTX0ZPUkNFRCA9IHR5cGUgJiAkZXhwb3J0LkY7XG4gIHZhciBJU19HTE9CQUwgPSB0eXBlICYgJGV4cG9ydC5HO1xuICB2YXIgSVNfU1RBVElDID0gdHlwZSAmICRleHBvcnQuUztcbiAgdmFyIElTX1BST1RPID0gdHlwZSAmICRleHBvcnQuUDtcbiAgdmFyIElTX0JJTkQgPSB0eXBlICYgJGV4cG9ydC5CO1xuICB2YXIgdGFyZ2V0ID0gSVNfR0xPQkFMID8gZ2xvYmFsIDogSVNfU1RBVElDID8gZ2xvYmFsW25hbWVdIHx8IChnbG9iYWxbbmFtZV0gPSB7fSkgOiAoZ2xvYmFsW25hbWVdIHx8IHt9KVtQUk9UT1RZUEVdO1xuICB2YXIgZXhwb3J0cyA9IElTX0dMT0JBTCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pO1xuICB2YXIgZXhwUHJvdG8gPSBleHBvcnRzW1BST1RPVFlQRV0gfHwgKGV4cG9ydHNbUFJPVE9UWVBFXSA9IHt9KTtcbiAgdmFyIGtleSwgb3duLCBvdXQsIGV4cDtcbiAgaWYgKElTX0dMT0JBTCkgc291cmNlID0gbmFtZTtcbiAgZm9yIChrZXkgaW4gc291cmNlKSB7XG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXG4gICAgb3duID0gIUlTX0ZPUkNFRCAmJiB0YXJnZXQgJiYgdGFyZ2V0W2tleV0gIT09IHVuZGVmaW5lZDtcbiAgICAvLyBleHBvcnQgbmF0aXZlIG9yIHBhc3NlZFxuICAgIG91dCA9IChvd24gPyB0YXJnZXQgOiBzb3VyY2UpW2tleV07XG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICBleHAgPSBJU19CSU5EICYmIG93biA/IGN0eChvdXQsIGdsb2JhbCkgOiBJU19QUk9UTyAmJiB0eXBlb2Ygb3V0ID09ICdmdW5jdGlvbicgPyBjdHgoRnVuY3Rpb24uY2FsbCwgb3V0KSA6IG91dDtcbiAgICAvLyBleHRlbmQgZ2xvYmFsXG4gICAgaWYgKHRhcmdldCkgcmVkZWZpbmUodGFyZ2V0LCBrZXksIG91dCwgdHlwZSAmICRleHBvcnQuVSk7XG4gICAgLy8gZXhwb3J0XG4gICAgaWYgKGV4cG9ydHNba2V5XSAhPSBvdXQpIGhpZGUoZXhwb3J0cywga2V5LCBleHApO1xuICAgIGlmIChJU19QUk9UTyAmJiBleHBQcm90b1trZXldICE9IG91dCkgZXhwUHJvdG9ba2V5XSA9IG91dDtcbiAgfVxufTtcbmdsb2JhbC5jb3JlID0gY29yZTtcbi8vIHR5cGUgYml0bWFwXG4kZXhwb3J0LkYgPSAxOyAgIC8vIGZvcmNlZFxuJGV4cG9ydC5HID0gMjsgICAvLyBnbG9iYWxcbiRleHBvcnQuUyA9IDQ7ICAgLy8gc3RhdGljXG4kZXhwb3J0LlAgPSA4OyAgIC8vIHByb3RvXG4kZXhwb3J0LkIgPSAxNjsgIC8vIGJpbmRcbiRleHBvcnQuVyA9IDMyOyAgLy8gd3JhcFxuJGV4cG9ydC5VID0gNjQ7ICAvLyBzYWZlXG4kZXhwb3J0LlIgPSAxMjg7IC8vIHJlYWwgcHJvdG8gbWV0aG9kIGZvciBgbGlicmFyeWBcbm1vZHVsZS5leHBvcnRzID0gJGV4cG9ydDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qc1xuLy8gbW9kdWxlIGlkID0gNTUzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkb2N1bWVudCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50O1xubW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19odG1sLmpzXG4vLyBtb2R1bGUgaWQgPSA1NTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3NcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0KCd6JykucHJvcGVydHlJc0VudW1lcmFibGUoMCkgPyBPYmplY3QgOiBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2lvYmplY3QuanNcbi8vIG1vZHVsZSBpZCA9IDU1NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyA3LjIuMiBJc0FycmF5KGFyZ3VtZW50KVxudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIGlzQXJyYXkoYXJnKSB7XG4gIHJldHVybiBjb2YoYXJnKSA9PSAnQXJyYXknO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2lzLWFycmF5LmpzXG4vLyBtb2R1bGUgaWQgPSA1NTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIE1FVEEgPSByZXF1aXJlKCcuL191aWQnKSgnbWV0YScpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgc2V0RGVzYyA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmY7XG52YXIgaWQgPSAwO1xudmFyIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdHJ1ZTtcbn07XG52YXIgRlJFRVpFID0gIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gaXNFeHRlbnNpYmxlKE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyh7fSkpO1xufSk7XG52YXIgc2V0TWV0YSA9IGZ1bmN0aW9uIChpdCkge1xuICBzZXREZXNjKGl0LCBNRVRBLCB7IHZhbHVlOiB7XG4gICAgaTogJ08nICsgKytpZCwgLy8gb2JqZWN0IElEXG4gICAgdzoge30gICAgICAgICAgLy8gd2VhayBjb2xsZWN0aW9ucyBJRHNcbiAgfSB9KTtcbn07XG52YXIgZmFzdEtleSA9IGZ1bmN0aW9uIChpdCwgY3JlYXRlKSB7XG4gIC8vIHJldHVybiBwcmltaXRpdmUgd2l0aCBwcmVmaXhcbiAgaWYgKCFpc09iamVjdChpdCkpIHJldHVybiB0eXBlb2YgaXQgPT0gJ3N5bWJvbCcgPyBpdCA6ICh0eXBlb2YgaXQgPT0gJ3N0cmluZycgPyAnUycgOiAnUCcpICsgaXQ7XG4gIGlmICghaGFzKGl0LCBNRVRBKSkge1xuICAgIC8vIGNhbid0IHNldCBtZXRhZGF0YSB0byB1bmNhdWdodCBmcm96ZW4gb2JqZWN0XG4gICAgaWYgKCFpc0V4dGVuc2libGUoaXQpKSByZXR1cm4gJ0YnO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIG1ldGFkYXRhXG4gICAgaWYgKCFjcmVhdGUpIHJldHVybiAnRSc7XG4gICAgLy8gYWRkIG1pc3NpbmcgbWV0YWRhdGFcbiAgICBzZXRNZXRhKGl0KTtcbiAgLy8gcmV0dXJuIG9iamVjdCBJRFxuICB9IHJldHVybiBpdFtNRVRBXS5pO1xufTtcbnZhciBnZXRXZWFrID0gZnVuY3Rpb24gKGl0LCBjcmVhdGUpIHtcbiAgaWYgKCFoYXMoaXQsIE1FVEEpKSB7XG4gICAgLy8gY2FuJ3Qgc2V0IG1ldGFkYXRhIHRvIHVuY2F1Z2h0IGZyb3plbiBvYmplY3RcbiAgICBpZiAoIWlzRXh0ZW5zaWJsZShpdCkpIHJldHVybiB0cnVlO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIG1ldGFkYXRhXG4gICAgaWYgKCFjcmVhdGUpIHJldHVybiBmYWxzZTtcbiAgICAvLyBhZGQgbWlzc2luZyBtZXRhZGF0YVxuICAgIHNldE1ldGEoaXQpO1xuICAvLyByZXR1cm4gaGFzaCB3ZWFrIGNvbGxlY3Rpb25zIElEc1xuICB9IHJldHVybiBpdFtNRVRBXS53O1xufTtcbi8vIGFkZCBtZXRhZGF0YSBvbiBmcmVlemUtZmFtaWx5IG1ldGhvZHMgY2FsbGluZ1xudmFyIG9uRnJlZXplID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmIChGUkVFWkUgJiYgbWV0YS5ORUVEICYmIGlzRXh0ZW5zaWJsZShpdCkgJiYgIWhhcyhpdCwgTUVUQSkpIHNldE1ldGEoaXQpO1xuICByZXR1cm4gaXQ7XG59O1xudmFyIG1ldGEgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgS0VZOiBNRVRBLFxuICBORUVEOiBmYWxzZSxcbiAgZmFzdEtleTogZmFzdEtleSxcbiAgZ2V0V2VhazogZ2V0V2VhayxcbiAgb25GcmVlemU6IG9uRnJlZXplXG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fbWV0YS5qc1xuLy8gbW9kdWxlIGlkID0gNTU3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgZFBzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwcycpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpO1xudmFyIElFX1BST1RPID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpO1xudmFyIEVtcHR5ID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggZmFrZSBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXG52YXIgY3JlYXRlRGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gVGhyYXNoLCB3YXN0ZSBhbmQgc29kb215OiBJRSBHQyBidWdcbiAgdmFyIGlmcmFtZSA9IHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnaWZyYW1lJyk7XG4gIHZhciBpID0gZW51bUJ1Z0tleXMubGVuZ3RoO1xuICB2YXIgbHQgPSAnPCc7XG4gIHZhciBndCA9ICc+JztcbiAgdmFyIGlmcmFtZURvY3VtZW50O1xuICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgcmVxdWlyZSgnLi9faHRtbCcpLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZS5zcmMgPSAnamF2YXNjcmlwdDonOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNjcmlwdC11cmxcbiAgLy8gY3JlYXRlRGljdCA9IGlmcmFtZS5jb250ZW50V2luZG93Lk9iamVjdDtcbiAgLy8gaHRtbC5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICBpZnJhbWVEb2N1bWVudCA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICBpZnJhbWVEb2N1bWVudC5vcGVuKCk7XG4gIGlmcmFtZURvY3VtZW50LndyaXRlKGx0ICsgJ3NjcmlwdCcgKyBndCArICdkb2N1bWVudC5GPU9iamVjdCcgKyBsdCArICcvc2NyaXB0JyArIGd0KTtcbiAgaWZyYW1lRG9jdW1lbnQuY2xvc2UoKTtcbiAgY3JlYXRlRGljdCA9IGlmcmFtZURvY3VtZW50LkY7XG4gIHdoaWxlIChpLS0pIGRlbGV0ZSBjcmVhdGVEaWN0W1BST1RPVFlQRV1bZW51bUJ1Z0tleXNbaV1dO1xuICByZXR1cm4gY3JlYXRlRGljdCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIGNyZWF0ZShPLCBQcm9wZXJ0aWVzKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmIChPICE9PSBudWxsKSB7XG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IGFuT2JqZWN0KE8pO1xuICAgIHJlc3VsdCA9IG5ldyBFbXB0eSgpO1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBudWxsO1xuICAgIC8vIGFkZCBcIl9fcHJvdG9fX1wiIGZvciBPYmplY3QuZ2V0UHJvdG90eXBlT2YgcG9seWZpbGxcbiAgICByZXN1bHRbSUVfUFJPVE9dID0gTztcbiAgfSBlbHNlIHJlc3VsdCA9IGNyZWF0ZURpY3QoKTtcbiAgcmV0dXJuIFByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IGRQcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1jcmVhdGUuanNcbi8vIG1vZHVsZSBpZCA9IDU1OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGdldEtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcykge1xuICBhbk9iamVjdChPKTtcbiAgdmFyIGtleXMgPSBnZXRLZXlzKFByb3BlcnRpZXMpO1xuICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gIHZhciBpID0gMDtcbiAgdmFyIFA7XG4gIHdoaWxlIChsZW5ndGggPiBpKSBkUC5mKE8sIFAgPSBrZXlzW2krK10sIFByb3BlcnRpZXNbUF0pO1xuICByZXR1cm4gTztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHBzLmpzXG4vLyBtb2R1bGUgaWQgPSA1NTlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHBJRSA9IHJlcXVpcmUoJy4vX29iamVjdC1waWUnKTtcbnZhciBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKTtcbnZhciBnT1BEID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGdPUEQgOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUCkge1xuICBPID0gdG9JT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gZ09QRChPLCBQKTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG4gIGlmIChoYXMoTywgUCkpIHJldHVybiBjcmVhdGVEZXNjKCFwSUUuZi5jYWxsKE8sIFApLCBPW1BdKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wZC5qc1xuLy8gbW9kdWxlIGlkID0gNTYwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGZhbGxiYWNrIGZvciBJRTExIGJ1Z2d5IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHdpdGggaWZyYW1lIGFuZCB3aW5kb3dcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgZ09QTiA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BuJykuZjtcbnZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG52YXIgd2luZG93TmFtZXMgPSB0eXBlb2Ygd2luZG93ID09ICdvYmplY3QnICYmIHdpbmRvdyAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc1xuICA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHdpbmRvdykgOiBbXTtcblxudmFyIGdldFdpbmRvd05hbWVzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGdPUE4oaXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHdpbmRvd05hbWVzLnNsaWNlKCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLmYgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KSB7XG4gIHJldHVybiB3aW5kb3dOYW1lcyAmJiB0b1N0cmluZy5jYWxsKGl0KSA9PSAnW29iamVjdCBXaW5kb3ddJyA/IGdldFdpbmRvd05hbWVzKGl0KSA6IGdPUE4odG9JT2JqZWN0KGl0KSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcG4tZXh0LmpzXG4vLyBtb2R1bGUgaWQgPSA1NjFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRlZiA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmY7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCB0YWcsIHN0YXQpIHtcbiAgaWYgKGl0ICYmICFoYXMoaXQgPSBzdGF0ID8gaXQgOiBpdC5wcm90b3R5cGUsIFRBRykpIGRlZihpdCwgVEFHLCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHRhZyB9KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19zZXQtdG8tc3RyaW5nLXRhZy5qc1xuLy8gbW9kdWxlIGlkID0gNTYyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJyk7XG52YXIgbWF4ID0gTWF0aC5tYXg7XG52YXIgbWluID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbmRleCwgbGVuZ3RoKSB7XG4gIGluZGV4ID0gdG9JbnRlZ2VyKGluZGV4KTtcbiAgcmV0dXJuIGluZGV4IDwgMCA/IG1heChpbmRleCArIGxlbmd0aCwgMCkgOiBtaW4oaW5kZXgsIGxlbmd0aCk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tYWJzb2x1dGUtaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDU2M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyA3LjEuMTUgVG9MZW5ndGhcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJyk7XG52YXIgbWluID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3RvLWxlbmd0aC5qc1xuLy8gbW9kdWxlIGlkID0gNTY0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIExJQlJBUlkgPSByZXF1aXJlKCcuL19saWJyYXJ5Jyk7XG52YXIgd2tzRXh0ID0gcmVxdWlyZSgnLi9fd2tzLWV4dCcpO1xudmFyIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgdmFyICRTeW1ib2wgPSBjb3JlLlN5bWJvbCB8fCAoY29yZS5TeW1ib2wgPSBMSUJSQVJZID8ge30gOiBnbG9iYWwuU3ltYm9sIHx8IHt9KTtcbiAgaWYgKG5hbWUuY2hhckF0KDApICE9ICdfJyAmJiAhKG5hbWUgaW4gJFN5bWJvbCkpIGRlZmluZVByb3BlcnR5KCRTeW1ib2wsIG5hbWUsIHsgdmFsdWU6IHdrc0V4dC5mKG5hbWUpIH0pO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3drcy1kZWZpbmUuanNcbi8vIG1vZHVsZSBpZCA9IDU2NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG4vLyAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjbGFzc29mID0gcmVxdWlyZSgnLi9fY2xhc3NvZicpO1xudmFyIHRlc3QgPSB7fTtcbnRlc3RbcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyldID0gJ3onO1xuaWYgKHRlc3QgKyAnJyAhPSAnW29iamVjdCB6XScpIHtcbiAgcmVxdWlyZSgnLi9fcmVkZWZpbmUnKShPYmplY3QucHJvdG90eXBlLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gJ1tvYmplY3QgJyArIGNsYXNzb2YodGhpcykgKyAnXSc7XG4gIH0sIHRydWUpO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZy5qc1xuLy8gbW9kdWxlIGlkID0gNTY2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0Jztcbi8vIEVDTUFTY3JpcHQgNiBzeW1ib2xzIHNoaW1cbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJyk7XG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBNRVRBID0gcmVxdWlyZSgnLi9fbWV0YScpLktFWTtcbnZhciAkZmFpbHMgPSByZXF1aXJlKCcuL19mYWlscycpO1xudmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpO1xudmFyIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi9fc2V0LXRvLXN0cmluZy10YWcnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuL191aWQnKTtcbnZhciB3a3MgPSByZXF1aXJlKCcuL193a3MnKTtcbnZhciB3a3NFeHQgPSByZXF1aXJlKCcuL193a3MtZXh0Jyk7XG52YXIgd2tzRGVmaW5lID0gcmVxdWlyZSgnLi9fd2tzLWRlZmluZScpO1xudmFyIGVudW1LZXlzID0gcmVxdWlyZSgnLi9fZW51bS1rZXlzJyk7XG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJy4vX2lzLWFycmF5Jyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG52YXIgX2NyZWF0ZSA9IHJlcXVpcmUoJy4vX29iamVjdC1jcmVhdGUnKTtcbnZhciBnT1BORXh0ID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcG4tZXh0Jyk7XG52YXIgJEdPUEQgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wZCcpO1xudmFyICREUCA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpO1xudmFyICRrZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcbnZhciBnT1BEID0gJEdPUEQuZjtcbnZhciBkUCA9ICREUC5mO1xudmFyIGdPUE4gPSBnT1BORXh0LmY7XG52YXIgJFN5bWJvbCA9IGdsb2JhbC5TeW1ib2w7XG52YXIgJEpTT04gPSBnbG9iYWwuSlNPTjtcbnZhciBfc3RyaW5naWZ5ID0gJEpTT04gJiYgJEpTT04uc3RyaW5naWZ5O1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xudmFyIEhJRERFTiA9IHdrcygnX2hpZGRlbicpO1xudmFyIFRPX1BSSU1JVElWRSA9IHdrcygndG9QcmltaXRpdmUnKTtcbnZhciBpc0VudW0gPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcbnZhciBTeW1ib2xSZWdpc3RyeSA9IHNoYXJlZCgnc3ltYm9sLXJlZ2lzdHJ5Jyk7XG52YXIgQWxsU3ltYm9scyA9IHNoYXJlZCgnc3ltYm9scycpO1xudmFyIE9QU3ltYm9scyA9IHNoYXJlZCgnb3Atc3ltYm9scycpO1xudmFyIE9iamVjdFByb3RvID0gT2JqZWN0W1BST1RPVFlQRV07XG52YXIgVVNFX05BVElWRSA9IHR5cGVvZiAkU3ltYm9sID09ICdmdW5jdGlvbic7XG52YXIgUU9iamVjdCA9IGdsb2JhbC5RT2JqZWN0O1xuLy8gRG9uJ3QgdXNlIHNldHRlcnMgaW4gUXQgU2NyaXB0LCBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvMTczXG52YXIgc2V0dGVyID0gIVFPYmplY3QgfHwgIVFPYmplY3RbUFJPVE9UWVBFXSB8fCAhUU9iamVjdFtQUk9UT1RZUEVdLmZpbmRDaGlsZDtcblxuLy8gZmFsbGJhY2sgZm9yIG9sZCBBbmRyb2lkLCBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9Njg3XG52YXIgc2V0U3ltYm9sRGVzYyA9IERFU0NSSVBUT1JTICYmICRmYWlscyhmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBfY3JlYXRlKGRQKHt9LCAnYScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRQKHRoaXMsICdhJywgeyB2YWx1ZTogNyB9KS5hOyB9XG4gIH0pKS5hICE9IDc7XG59KSA/IGZ1bmN0aW9uIChpdCwga2V5LCBEKSB7XG4gIHZhciBwcm90b0Rlc2MgPSBnT1BEKE9iamVjdFByb3RvLCBrZXkpO1xuICBpZiAocHJvdG9EZXNjKSBkZWxldGUgT2JqZWN0UHJvdG9ba2V5XTtcbiAgZFAoaXQsIGtleSwgRCk7XG4gIGlmIChwcm90b0Rlc2MgJiYgaXQgIT09IE9iamVjdFByb3RvKSBkUChPYmplY3RQcm90bywga2V5LCBwcm90b0Rlc2MpO1xufSA6IGRQO1xuXG52YXIgd3JhcCA9IGZ1bmN0aW9uICh0YWcpIHtcbiAgdmFyIHN5bSA9IEFsbFN5bWJvbHNbdGFnXSA9IF9jcmVhdGUoJFN5bWJvbFtQUk9UT1RZUEVdKTtcbiAgc3ltLl9rID0gdGFnO1xuICByZXR1cm4gc3ltO1xufTtcblxudmFyIGlzU3ltYm9sID0gVVNFX05BVElWRSAmJiB0eXBlb2YgJFN5bWJvbC5pdGVyYXRvciA9PSAnc3ltYm9sJyA/IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnO1xufSA6IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgaW5zdGFuY2VvZiAkU3ltYm9sO1xufTtcblxudmFyICRkZWZpbmVQcm9wZXJ0eSA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KGl0LCBrZXksIEQpIHtcbiAgaWYgKGl0ID09PSBPYmplY3RQcm90bykgJGRlZmluZVByb3BlcnR5KE9QU3ltYm9scywga2V5LCBEKTtcbiAgYW5PYmplY3QoaXQpO1xuICBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpO1xuICBhbk9iamVjdChEKTtcbiAgaWYgKGhhcyhBbGxTeW1ib2xzLCBrZXkpKSB7XG4gICAgaWYgKCFELmVudW1lcmFibGUpIHtcbiAgICAgIGlmICghaGFzKGl0LCBISURERU4pKSBkUChpdCwgSElEREVOLCBjcmVhdGVEZXNjKDEsIHt9KSk7XG4gICAgICBpdFtISURERU5dW2tleV0gPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSkgaXRbSElEREVOXVtrZXldID0gZmFsc2U7XG4gICAgICBEID0gX2NyZWF0ZShELCB7IGVudW1lcmFibGU6IGNyZWF0ZURlc2MoMCwgZmFsc2UpIH0pO1xuICAgIH0gcmV0dXJuIHNldFN5bWJvbERlc2MoaXQsIGtleSwgRCk7XG4gIH0gcmV0dXJuIGRQKGl0LCBrZXksIEQpO1xufTtcbnZhciAkZGVmaW5lUHJvcGVydGllcyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoaXQsIFApIHtcbiAgYW5PYmplY3QoaXQpO1xuICB2YXIga2V5cyA9IGVudW1LZXlzKFAgPSB0b0lPYmplY3QoUCkpO1xuICB2YXIgaSA9IDA7XG4gIHZhciBsID0ga2V5cy5sZW5ndGg7XG4gIHZhciBrZXk7XG4gIHdoaWxlIChsID4gaSkgJGRlZmluZVByb3BlcnR5KGl0LCBrZXkgPSBrZXlzW2krK10sIFBba2V5XSk7XG4gIHJldHVybiBpdDtcbn07XG52YXIgJGNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpdCwgUCkge1xuICByZXR1cm4gUCA9PT0gdW5kZWZpbmVkID8gX2NyZWF0ZShpdCkgOiAkZGVmaW5lUHJvcGVydGllcyhfY3JlYXRlKGl0KSwgUCk7XG59O1xudmFyICRwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IGZ1bmN0aW9uIHByb3BlcnR5SXNFbnVtZXJhYmxlKGtleSkge1xuICB2YXIgRSA9IGlzRW51bS5jYWxsKHRoaXMsIGtleSA9IHRvUHJpbWl0aXZlKGtleSwgdHJ1ZSkpO1xuICBpZiAodGhpcyA9PT0gT2JqZWN0UHJvdG8gJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIWhhcyhPUFN5bWJvbHMsIGtleSkpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIEUgfHwgIWhhcyh0aGlzLCBrZXkpIHx8ICFoYXMoQWxsU3ltYm9scywga2V5KSB8fCBoYXModGhpcywgSElEREVOKSAmJiB0aGlzW0hJRERFTl1ba2V5XSA/IEUgOiB0cnVlO1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpIHtcbiAgaXQgPSB0b0lPYmplY3QoaXQpO1xuICBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpO1xuICBpZiAoaXQgPT09IE9iamVjdFByb3RvICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICFoYXMoT1BTeW1ib2xzLCBrZXkpKSByZXR1cm47XG4gIHZhciBEID0gZ09QRChpdCwga2V5KTtcbiAgaWYgKEQgJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIShoYXMoaXQsIEhJRERFTikgJiYgaXRbSElEREVOXVtrZXldKSkgRC5lbnVtZXJhYmxlID0gdHJ1ZTtcbiAgcmV0dXJuIEQ7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCkge1xuICB2YXIgbmFtZXMgPSBnT1BOKHRvSU9iamVjdChpdCkpO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBpID0gMDtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIHtcbiAgICBpZiAoIWhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiBrZXkgIT0gSElEREVOICYmIGtleSAhPSBNRVRBKSByZXN1bHQucHVzaChrZXkpO1xuICB9IHJldHVybiByZXN1bHQ7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoaXQpIHtcbiAgdmFyIElTX09QID0gaXQgPT09IE9iamVjdFByb3RvO1xuICB2YXIgbmFtZXMgPSBnT1BOKElTX09QID8gT1BTeW1ib2xzIDogdG9JT2JqZWN0KGl0KSk7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIGkgPSAwO1xuICB2YXIga2V5O1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkge1xuICAgIGlmIChoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkgJiYgKElTX09QID8gaGFzKE9iamVjdFByb3RvLCBrZXkpIDogdHJ1ZSkpIHJlc3VsdC5wdXNoKEFsbFN5bWJvbHNba2V5XSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8vIDE5LjQuMS4xIFN5bWJvbChbZGVzY3JpcHRpb25dKVxuaWYgKCFVU0VfTkFUSVZFKSB7XG4gICRTeW1ib2wgPSBmdW5jdGlvbiBTeW1ib2woKSB7XG4gICAgaWYgKHRoaXMgaW5zdGFuY2VvZiAkU3ltYm9sKSB0aHJvdyBUeXBlRXJyb3IoJ1N5bWJvbCBpcyBub3QgYSBjb25zdHJ1Y3RvciEnKTtcbiAgICB2YXIgdGFnID0gdWlkKGFyZ3VtZW50cy5sZW5ndGggPiAwID8gYXJndW1lbnRzWzBdIDogdW5kZWZpbmVkKTtcbiAgICB2YXIgJHNldCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHRoaXMgPT09IE9iamVjdFByb3RvKSAkc2V0LmNhbGwoT1BTeW1ib2xzLCB2YWx1ZSk7XG4gICAgICBpZiAoaGFzKHRoaXMsIEhJRERFTikgJiYgaGFzKHRoaXNbSElEREVOXSwgdGFnKSkgdGhpc1tISURERU5dW3RhZ10gPSBmYWxzZTtcbiAgICAgIHNldFN5bWJvbERlc2ModGhpcywgdGFnLCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG4gICAgfTtcbiAgICBpZiAoREVTQ1JJUFRPUlMgJiYgc2V0dGVyKSBzZXRTeW1ib2xEZXNjKE9iamVjdFByb3RvLCB0YWcsIHsgY29uZmlndXJhYmxlOiB0cnVlLCBzZXQ6ICRzZXQgfSk7XG4gICAgcmV0dXJuIHdyYXAodGFnKTtcbiAgfTtcbiAgcmVkZWZpbmUoJFN5bWJvbFtQUk9UT1RZUEVdLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5faztcbiAgfSk7XG5cbiAgJEdPUEQuZiA9ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG4gICREUC5mID0gJGRlZmluZVByb3BlcnR5O1xuICByZXF1aXJlKCcuL19vYmplY3QtZ29wbicpLmYgPSBnT1BORXh0LmYgPSAkZ2V0T3duUHJvcGVydHlOYW1lcztcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpLmYgPSAkcHJvcGVydHlJc0VudW1lcmFibGU7XG4gIHJlcXVpcmUoJy4vX29iamVjdC1nb3BzJykuZiA9ICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbiAgaWYgKERFU0NSSVBUT1JTICYmICFyZXF1aXJlKCcuL19saWJyYXJ5JykpIHtcbiAgICByZWRlZmluZShPYmplY3RQcm90bywgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJHByb3BlcnR5SXNFbnVtZXJhYmxlLCB0cnVlKTtcbiAgfVxuXG4gIHdrc0V4dC5mID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gd3JhcCh3a3MobmFtZSkpO1xuICB9O1xufVxuXG4kZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCB7IFN5bWJvbDogJFN5bWJvbCB9KTtcblxuZm9yICh2YXIgZXM2U3ltYm9scyA9IChcbiAgLy8gMTkuNC4yLjIsIDE5LjQuMi4zLCAxOS40LjIuNCwgMTkuNC4yLjYsIDE5LjQuMi44LCAxOS40LjIuOSwgMTkuNC4yLjEwLCAxOS40LjIuMTEsIDE5LjQuMi4xMiwgMTkuNC4yLjEzLCAxOS40LjIuMTRcbiAgJ2hhc0luc3RhbmNlLGlzQ29uY2F0U3ByZWFkYWJsZSxpdGVyYXRvcixtYXRjaCxyZXBsYWNlLHNlYXJjaCxzcGVjaWVzLHNwbGl0LHRvUHJpbWl0aXZlLHRvU3RyaW5nVGFnLHVuc2NvcGFibGVzJ1xuKS5zcGxpdCgnLCcpLCBqID0gMDsgZXM2U3ltYm9scy5sZW5ndGggPiBqOyl3a3MoZXM2U3ltYm9sc1tqKytdKTtcblxuZm9yICh2YXIgd2VsbEtub3duU3ltYm9scyA9ICRrZXlzKHdrcy5zdG9yZSksIGsgPSAwOyB3ZWxsS25vd25TeW1ib2xzLmxlbmd0aCA+IGs7KSB3a3NEZWZpbmUod2VsbEtub3duU3ltYm9sc1trKytdKTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgJ1N5bWJvbCcsIHtcbiAgLy8gMTkuNC4yLjEgU3ltYm9sLmZvcihrZXkpXG4gICdmb3InOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIGhhcyhTeW1ib2xSZWdpc3RyeSwga2V5ICs9ICcnKVxuICAgICAgPyBTeW1ib2xSZWdpc3RyeVtrZXldXG4gICAgICA6IFN5bWJvbFJlZ2lzdHJ5W2tleV0gPSAkU3ltYm9sKGtleSk7XG4gIH0sXG4gIC8vIDE5LjQuMi41IFN5bWJvbC5rZXlGb3Ioc3ltKVxuICBrZXlGb3I6IGZ1bmN0aW9uIGtleUZvcihzeW0pIHtcbiAgICBpZiAoIWlzU3ltYm9sKHN5bSkpIHRocm93IFR5cGVFcnJvcihzeW0gKyAnIGlzIG5vdCBhIHN5bWJvbCEnKTtcbiAgICBmb3IgKHZhciBrZXkgaW4gU3ltYm9sUmVnaXN0cnkpIGlmIChTeW1ib2xSZWdpc3RyeVtrZXldID09PSBzeW0pIHJldHVybiBrZXk7XG4gIH0sXG4gIHVzZVNldHRlcjogZnVuY3Rpb24gKCkgeyBzZXR0ZXIgPSB0cnVlOyB9LFxuICB1c2VTaW1wbGU6IGZ1bmN0aW9uICgpIHsgc2V0dGVyID0gZmFsc2U7IH1cbn0pO1xuXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCAnT2JqZWN0Jywge1xuICAvLyAxOS4xLjIuMiBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXG4gIGNyZWF0ZTogJGNyZWF0ZSxcbiAgLy8gMTkuMS4yLjQgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXG4gIGRlZmluZVByb3BlcnR5OiAkZGVmaW5lUHJvcGVydHksXG4gIC8vIDE5LjEuMi4zIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpXG4gIGRlZmluZVByb3BlcnRpZXM6ICRkZWZpbmVQcm9wZXJ0aWVzLFxuICAvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogJGdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgLy8gMTkuMS4yLjcgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbiAgZ2V0T3duUHJvcGVydHlOYW1lczogJGdldE93blByb3BlcnR5TmFtZXMsXG4gIC8vIDE5LjEuMi44IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoTylcbiAgZ2V0T3duUHJvcGVydHlTeW1ib2xzOiAkZ2V0T3duUHJvcGVydHlTeW1ib2xzXG59KTtcblxuLy8gMjQuMy4yIEpTT04uc3RyaW5naWZ5KHZhbHVlIFssIHJlcGxhY2VyIFssIHNwYWNlXV0pXG4kSlNPTiAmJiAkZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICghVVNFX05BVElWRSB8fCAkZmFpbHMoZnVuY3Rpb24gKCkge1xuICB2YXIgUyA9ICRTeW1ib2woKTtcbiAgLy8gTVMgRWRnZSBjb252ZXJ0cyBzeW1ib2wgdmFsdWVzIHRvIEpTT04gYXMge31cbiAgLy8gV2ViS2l0IGNvbnZlcnRzIHN5bWJvbCB2YWx1ZXMgdG8gSlNPTiBhcyBudWxsXG4gIC8vIFY4IHRocm93cyBvbiBib3hlZCBzeW1ib2xzXG4gIHJldHVybiBfc3RyaW5naWZ5KFtTXSkgIT0gJ1tudWxsXScgfHwgX3N0cmluZ2lmeSh7IGE6IFMgfSkgIT0gJ3t9JyB8fCBfc3RyaW5naWZ5KE9iamVjdChTKSkgIT0gJ3t9Jztcbn0pKSwgJ0pTT04nLCB7XG4gIHN0cmluZ2lmeTogZnVuY3Rpb24gc3RyaW5naWZ5KGl0KSB7XG4gICAgdmFyIGFyZ3MgPSBbaXRdO1xuICAgIHZhciBpID0gMTtcbiAgICB2YXIgcmVwbGFjZXIsICRyZXBsYWNlcjtcbiAgICB3aGlsZSAoYXJndW1lbnRzLmxlbmd0aCA+IGkpIGFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XG4gICAgJHJlcGxhY2VyID0gcmVwbGFjZXIgPSBhcmdzWzFdO1xuICAgIGlmICghaXNPYmplY3QocmVwbGFjZXIpICYmIGl0ID09PSB1bmRlZmluZWQgfHwgaXNTeW1ib2woaXQpKSByZXR1cm47IC8vIElFOCByZXR1cm5zIHN0cmluZyBvbiB1bmRlZmluZWRcbiAgICBpZiAoIWlzQXJyYXkocmVwbGFjZXIpKSByZXBsYWNlciA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICBpZiAodHlwZW9mICRyZXBsYWNlciA9PSAnZnVuY3Rpb24nKSB2YWx1ZSA9ICRyZXBsYWNlci5jYWxsKHRoaXMsIGtleSwgdmFsdWUpO1xuICAgICAgaWYgKCFpc1N5bWJvbCh2YWx1ZSkpIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICAgIGFyZ3NbMV0gPSByZXBsYWNlcjtcbiAgICByZXR1cm4gX3N0cmluZ2lmeS5hcHBseSgkSlNPTiwgYXJncyk7XG4gIH1cbn0pO1xuXG4vLyAxOS40LjMuNCBTeW1ib2wucHJvdG90eXBlW0BAdG9QcmltaXRpdmVdKGhpbnQpXG4kU3ltYm9sW1BST1RPVFlQRV1bVE9fUFJJTUlUSVZFXSB8fCByZXF1aXJlKCcuL19oaWRlJykoJFN5bWJvbFtQUk9UT1RZUEVdLCBUT19QUklNSVRJVkUsICRTeW1ib2xbUFJPVE9UWVBFXS52YWx1ZU9mKTtcbi8vIDE5LjQuMy41IFN5bWJvbC5wcm90b3R5cGVbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKCRTeW1ib2wsICdTeW1ib2wnKTtcbi8vIDIwLjIuMS45IE1hdGhbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKE1hdGgsICdNYXRoJywgdHJ1ZSk7XG4vLyAyNC4zLjMgSlNPTltAQHRvU3RyaW5nVGFnXVxuc2V0VG9TdHJpbmdUYWcoZ2xvYmFsLkpTT04sICdKU09OJywgdHJ1ZSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL2VzNi5zeW1ib2wuanNcbi8vIG1vZHVsZSBpZCA9IDU2N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKGZhbHNlKTtcbi8vIGltcG9ydHNcblxuXG4vLyBtb2R1bGVcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIi5vYWsuc3BhY2VyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbn1cXG4ub2FrLnNwYWNlci5pbmxpbmUge1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xcbn1cXG4ub2FrLnNwYWNlci5mbHVpZCB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGZsZXg6IDEgMSAxMDAlO1xcbn1cXG4ub2FrLnNwYWNlci50aW55IHtcXG4gIHdpZHRoOiAycHg7XFxuICBoZWlnaHQ6IDJweDtcXG59XFxuLm9hay5zcGFjZXIuc21hbGwge1xcbiAgd2lkdGg6IDRweDtcXG4gIGhlaWdodDogNHB4O1xcbn1cXG4ub2FrLnNwYWNlci5tZWRpdW0ge1xcbiAgd2lkdGg6IDEwcHg7XFxuICBoZWlnaHQ6IDEwcHg7XFxufVxcbi5vYWsuc3BhY2VyLmxhcmdlIHtcXG4gIHdpZHRoOiAyMHB4O1xcbiAgaGVpZ2h0OiAyMHB4O1xcbn1cXG4ub2FrLnNwYWNlci5odWdlIHtcXG4gIHdpZHRoOiAzMHB4O1xcbiAgaGVpZ2h0OiAzMHB4O1xcbn1cXG4ub2FrLnNwYWNlci5tYXNzaXZlIHtcXG4gIHdpZHRoOiA1MHB4O1xcbiAgaGVpZ2h0OiA1MHB4O1xcbn1cXG5cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY3NzLWxvYWRlciEuL34vbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zcmMvYXBwL1NwYWNlci5sZXNzXG4vLyBtb2R1bGUgaWQgPSA1Njlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKShmYWxzZSk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIuZnVsbFdpZHRoIHtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG4uZnVsbEhlaWdodCB7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcbi5mdWxsU2l6ZSB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuXCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2Nzcy1sb2FkZXIhLi9+L2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3JjL2FwcC9zdHlsZXMubGVzc1xuLy8gbW9kdWxlIGlkID0gNTcwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vXG4vL1x0IyBDb3JlIGBydWxlc2AgLS0gc2ltcGxlIGRhdGF0eXBlcywgZXRjLlxuLy9cbi8vIE5PVEU6IG1hbnkgb2YgdGhlIGJlbG93IGFyZSBjcmVhdGVkIGFzIGN1c3RvbSBQYXR0ZXJuIHN1YmNsYXNzZXMgZm9yIGRlYnVnZ2luZy5cbi8vXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuLi8uLi9Ub2tlbml6ZXJcIjtcblxuLy8gQ3JlYXRlIGBjb3JlYCBwYXJzZXIuXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTmFtZShcImNvcmVcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwic3RhdGVtZW50c1wiLFxuICAgIGNvbnN0cnVjdG9yOiBSdWxlLlN0YXRlbWVudHNcbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJjb21tZW50XCIsXG4gICAgY29uc3RydWN0b3I6IFJ1bGUuQ29tbWVudFxuICB9LFxuXG4gIC8vIGB3b3JkYCA9IGlzIGEgc2luZ2xlIGFscGhhbnVtZXJpYyB3b3JkLlxuICAvLyBNVVNUIHN0YXJ0IHdpdGggYSBsb3dlci1jYXNlIGxldHRlciAoPylcbiAge1xuICAgIG5hbWU6IFwid29yZFwiLFxuICAgIHBhdHRlcm46IC9eW2Etel1bXFx3XFwtXSokLyxcbiAgICBjYW5vbmljYWw6IFwiV29yZFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB3b3JkIGV4dGVuZHMgUnVsZS5QYXR0ZXJuIHtcbiAgICAgIC8vIENvbnZlcnQgXCItXCIgdG8gXCJfXCIgaW4gc291cmNlIG91dHB1dC5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVkLnJlcGxhY2UoL1xcLS9nLCBcIl9cIik7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIGBpZGVudGlmaWVyYCA9IHZhcmlhYmxlcyBvciBwcm9wZXJ0eSBuYW1lLlxuICAvLyBNVVNUIHN0YXJ0IHdpdGggYSBsb3dlci1jYXNlIGxldHRlciAoPylcbiAgLy8gTk9URTogV2UgYmxhY2tsaXN0IGEgbG90IG9mIHdvcmRzIGFzIGlkZW50aWZpZXJzLlxuICB7XG4gICAgbmFtZTogXCJpZGVudGlmaWVyXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIGNhbm9uaWNhbDogXCJJZGVuZmlmaWVyXCIsXG4gICAgcGF0dGVybjogL15bYS16XVtcXHdcXC1dKiQvLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpZGVudGlmaWVyIGV4dGVuZHMgUnVsZS5QYXR0ZXJuIHtcbiAgICAgIC8vIENvbnZlcnQgXCItXCIgdG8gXCJfXCIgaW4gc291cmNlIG91dHB1dC5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVkLnJlcGxhY2UoL1xcLS9nLCBcIl9cIik7XG4gICAgICB9XG4gICAgfSxcbiAgICBibGFja2xpc3Q6IFtcbiAgICAgIC8vIEFkZCBFbmdsaXNoIHByZXBvc2l0aW9ucyB0byBpZGVudGlmaWVyIGJsYWNrbGlzdC5cbiAgICAgIC8vXG4gICAgICAvLyBXaWtpcGVkaWEgXCJQcmVwb3NpdGlvblwiOlxuICAgICAgLy9cdFwiUHJlcG9zaXRpb25zLi4uYXJlIGEgY2xhc3Mgb2Ygd29yZHMgdGhhdFxuICAgICAgLy9cdGV4cHJlc3Mgc3BhdGlhbCBvciB0ZW1wb3JhbCByZWxhdGlvbnMgIChpbiwgdW5kZXIsIHRvd2FyZHMsIGJlZm9yZSlcbiAgICAgIC8vXHRvciBtYXJrIHZhcmlvdXMgc2VtYW50aWMgcm9sZXMgKG9mLCBmb3IpLlxuICAgICAgLy8gVEVTVE1FXG4gICAgICBcImFib3V0XCIsIFwiYWJvdmVcIiwgXCJhZnRlclwiLCBcImFuZFwiLCBcImFzXCIsIFwiYXRcIixcbiAgICAgIFwiYmVmb3JlXCIsIFwiYmVoaW5kXCIsIFwiYmVsb3dcIiwgXCJiZW5lYXRoXCIsIFwiYmVzaWRlXCIsIFwiYmV0d2VlblwiLCBcImJleW9uZFwiLCBcImJ5XCIsXG4gICAgICBcImRlZmluZWRcIiwgXCJkb3duXCIsIFwiZHVyaW5nXCIsXG4gICAgICBcImVhY2hcIiwgXCJlbXB0eVwiLCBcImV4YWN0bHlcIiwgXCJleGNlcHRcIixcbiAgICAgIFwiZm9yXCIsIFwiZnJvbVwiLFxuICAgICAgXCJncmVhdGVyXCIsXG4gICAgICBcIklcIiwgXCJpblwiLCBcImludG9cIixcbiAgICAgIFwibGVzc1wiLCBcImxvbmdcIixcbiAgICAgIFwibWVcIiwgXCJtaW51c1wiLCBcIm1vcmVcIixcbiAgICAgIFwibmVhclwiLCBcIm5vdFwiLFxuICAgICAgXCJvZlwiLCBcIm9mZlwiLCBcIm9uXCIsIFwib250b1wiLCBcIm9wcG9zaXRlXCIsIFwib3JcIiwgXCJvdXRcIiwgXCJvdXRzaWRlXCIsIFwib3ZlclwiLFxuICAgICAgXCJzaG9ydFwiLCBcInNpbmNlXCIsXG4gICAgICBcInRoYW5cIiwgXCJ0aGVcIiwgXCJ0aGVuXCIsIFwidGhyb3VnaFwiLCBcInRocnVcIiwgXCJ0b1wiLCBcInRvd2FyZFwiLCBcInRvd2FyZHNcIixcbiAgICAgIFwidW5kZWZpbmVkXCIsIFwidW5kZXJcIiwgXCJ1bmRlcm5lYXRoXCIsIFwidW5pcXVlXCIsIFwidW50aWxcIiwgXCJ1cFwiLCBcInVwb25cIiwgXCJ1cHNpZGVcIixcbiAgICAgIFwidmVyc3VzXCIsIFwidnNcIixcbiAgICAgIFwid2hlcmVcIiwgXCJ3aXRoXCIsIFwid2l0aGluXCIsIFwid2l0aG91dFwiLFxuXG4gICAgICAvLyBBZGQgY29tbW9uIGVuZ2xpc2ggdmVyYnMgdG8gaWRlbnRpZmllciBibGFja2xpc3QuXG4gICAgICBcImFyZVwiLFxuICAgICAgXCJkb1wiLCBcImRvZXNcIixcbiAgICAgIFwiY29udGFpbnNcIixcbiAgICAgIFwiaGFzXCIsIFwiaGF2ZVwiLFxuICAgICAgXCJpc1wiLFxuICAgICAgXCJyZXBlYXRcIixcbiAgICAgIFwid2FzXCIsIFwid2VyZVwiLFxuXG4gICAgICAvLyBBZGQgc3BlY2lhbCBjb250cm9sIGtleXdvcmRzIHRvIGlkZW50aWZpZXIgYmxhY2tsaXN0LlxuICAgICAgXCJlbHNlXCIsXG4gICAgICBcImlmXCIsXG4gICAgICBcIm90aGVyd2lzZVwiLFxuICAgICAgXCJ3aGlsZVwiLFxuXG4gICAgICAvLyBBZGQgYm9vbGVhbiB0b2tlbnMgdG8gaWRlbnRpZmllciBibGFja2xpc3QuXG4gICAgICBcInRydWVcIiwgXCJmYWxzZVwiLFxuICAgICAgXCJ5ZXNcIiwgXCJub1wiLFxuICAgICAgXCJva1wiLCBcImNhbmNlbFwiLFxuICAgICAgXCJzdWNjZXNzXCIsIFwiZmFpbHVyZVwiLFxuXG4gICAgICAvLyBBZGQgbnVtYmVyIHdvcmRzIHRvIGlkZW50aWZpZXIgYmxhY2tsaXN0LlxuICAgICAgLy8gVEVTVE1FXG4gICAgICBcIm9uZVwiLCBcInR3b1wiLCBcInRocmVlXCIsIFwiZm91clwiLCBcImZpdmVcIixcbiAgICAgIFwic2l4XCIsIFwic2V2ZW5cIiwgXCJlaWdodFwiLCBcIm5pbmVcIiwgXCJ0ZW5cIixcbiAgICBdXG4gIH0sXG5cbiAgLy8gYFR5cGVgID0gdHlwZSBuYW1lLlxuICAvLyBNVVNUIHN0YXJ0IHdpdGggYW4gdXBwZXItY2FzZSBsZXR0ZXIgKD8pXG4gIHtcbiAgICBuYW1lOiBcInR5cGVcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgY2Fub25pY2FsOiBcIlR5cGVcIixcbiAgICBwYXR0ZXJuOiAvXihbQS1aXVtcXHdcXC1dKnxsaXN0fHRleHR8bnVtYmVyfGludGVnZXJ8ZGVjaW1hbHxjaGFyYWN0ZXJ8Ym9vbGVhbnxvYmplY3QpJC8sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHR5cGUgZXh0ZW5kcyBSdWxlLlBhdHRlcm4ge1xuICAgICAgLy8gQ29udmVydCBcIi1cIiB0byBcIl9cIiBpbiBzb3VyY2Ugb3V0cHV0LlxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB0eXBlID0gdGhpcy5tYXRjaGVkO1xuICAgICAgICBzd2l0Y2godHlwZSkge1xuICAgICAgICAgIC8vIEFsaWFzIGBMaXN0YCB0byBgQXJyYXlgXG4gICAgICAgICAgY2FzZSBcIkxpc3RcIjpcdFx0cmV0dXJuIFwiQXJyYXlcIjtcblxuICAgICAgICAgIC8vIHNwZWNpYWwgY2FzZSB0byB0YWtlIHRoZSBmb2xsb3dpbmcgYXMgbG93ZXJjYXNlXG4gICAgICAgICAgY2FzZSBcImxpc3RcIjpcdFx0cmV0dXJuIFwiQXJyYXlcIjtcbiAgICAgICAgICBjYXNlIFwidGV4dFwiOlx0XHRyZXR1cm4gXCJTdHJpbmdcIjtcbiAgICAgICAgICBjYXNlIFwiY2hhcmFjdGVyXCI6XHRyZXR1cm4gXCJDaGFyYWN0ZXJcIjtcbiAgICAgICAgICBjYXNlIFwibnVtYmVyXCI6XHRcdHJldHVybiBcIk51bWJlclwiO1xuICAgICAgICAgIGNhc2UgXCJpbnRlZ2VyXCI6XHRcdHJldHVybiBcIkludGVnZXJcIjtcbiAgICAgICAgICBjYXNlIFwiZGVjaW1hbFwiOlx0XHRyZXR1cm4gXCJEZWNpbWFsXCI7XG4gICAgICAgICAgY2FzZSBcImJvb2xlYW5cIjpcdFx0cmV0dXJuIFwiQm9vbGVhblwiO1xuICAgICAgICAgIGNhc2UgXCJvYmplY3RcIjpcdFx0cmV0dXJuIFwiT2JqZWN0XCI7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB0eXBlLnJlcGxhY2UoL1xcLS9nLCBcIl9cIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGJsYWNrbGlzdDogWyBcIklcIiBdXG4gIH0sXG5cblxuXG4gIC8vIEJvb2xlYW4gbGl0ZXJhbCwgY3JlYXRlZCB3aXRoIGN1c3RvbSBjb25zdHJ1Y3RvciBmb3IgZGVidWdnaW5nLlxuICAvLyBUT0RPOiBiZXR0ZXIgbmFtZSBmb3IgdGhpcz8/P1xuICB7XG4gICAgbmFtZTogXCJib29sZWFuXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIGNhbm9uaWNhbDogXCJCb29sZWFuXCIsXG4gICAgcGF0dGVybjogL14odHJ1ZXxmYWxzZXx5ZXN8bm98b2t8Y2FuY2VsfHN1Y2Nlc3N8ZmFpbHVyZSkkLyxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgYm9vbGVhbiBleHRlbmRzIFJ1bGUuUGF0dGVybiB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLm1hdGNoZWQpIHtcbiAgICAgICAgICBjYXNlIFwidHJ1ZVwiOlxuICAgICAgICAgIGNhc2UgXCJ5ZXNcIjpcbiAgICAgICAgICBjYXNlIFwib2tcIjpcbiAgICAgICAgICBjYXNlIFwic3VjY2Vzc1wiOlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIGBudW1iZXJgIGFzIGVpdGhlciBmbG9hdCBvciBpbnRlZ2VyLCBjcmVhdGVkIHdpdGggY3VzdG9tIGNvbnN0cnVjdG9yIGZvciBkZWJ1Z2dpbmcuXG4gIC8vIE5PVEU6IHlvdSBjYW4gYWxzbyB1c2UgYG9uZWAuLi5gdGVuYCBhcyBzdHJpbmdzLidcbiAgLy8gVE9ETzogIGBpbnRlZ2VyYCBhbmQgYGRlY2ltYWxgPyAgdG9vIHRlY2h5P1xuICB7XG4gICAgbmFtZTogXCJudW1iZXJcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgY2Fub25pY2FsOiBcIk51bWJlclwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBudW1iZXIgZXh0ZW5kcyBSdWxlIHtcbiAgICAgIC8vIFNwZWNpYWwgd29yZHMgeW91IGNhbiB1c2UgYXMgbnVtYmVycy4uLlxuICAgICAgc3RhdGljIE5VTUJFUl9OQU1FUyA9IHtcbiAgICAgICAgemVybzogMCxcbiAgICAgICAgb25lOiAxLFxuICAgICAgICB0d286IDIsXG4gICAgICAgIHRocmVlOiAzLFxuICAgICAgICBmb3VyOiA0LFxuICAgICAgICBmaXZlOiA1LFxuICAgICAgICBzaXg6IDYsXG4gICAgICAgIHNldmVuOiA3LFxuICAgICAgICBlaWdodDogOCxcbiAgICAgICAgbmluZTogOSxcbiAgICAgICAgdGVuOiAxMFxuICAgICAgfVxuXG4gICAgICAvLyBOdW1iZXJzIGdldCBlbmNvZGVkIGFzIG51bWJlcnMgaW4gdGhlIHRva2VuIHN0cmVhbS5cbiAgICAgIHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDApIHtcbiAgICAgICAgbGV0IHRva2VuID0gdG9rZW5zW3N0YXJ0XTtcbiAgICAgICAgLy8gaWYgYSBzdHJpbmcsIGF0dGVtcHQgdG8gcnVuIHRocm91Z2ggb3VyIE5VTUJFUl9OQU1FU1xuICAgICAgICBpZiAodHlwZW9mIHRva2VuID09PSBcInN0cmluZ1wiKSB0b2tlbiA9IFJ1bGUuTnVtYmVyLk5VTUJFUl9OQU1FU1t0b2tlbl07XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW4gIT09IFwibnVtYmVyXCIpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiB0aGlzLmNsb25lKHtcbiAgICAgICAgICBtYXRjaGVkOiB0b2tlbixcbiAgICAgICAgICBuZXh0U3RhcnQ6IHN0YXJ0ICsgMVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udmVydCB0byBudW1iZXIgb24gc291cmNlIG91dHB1dC5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVkO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBMaXRlcmFsIGB0ZXh0YCBzdHJpbmcsIGNyZWF0ZWQgd2l0aCBjdXN0b20gY29uc3RydWN0b3IgZm9yIGRlYnVnZ2luZy5cbiAgLy8gWW91IGNhbiB1c2UgZWl0aGVyIHNpbmdsZSBvciBkb3VibGUgcXVvdGVzIG9uIHRoZSBvdXRzaWRlIChhbHRob3VnaCBkb3VibGUgcXVvdGVzIGFyZSBwcmVmZXJyZWQpLlxuICAvLyBSZXR1cm5lZCB2YWx1ZSBoYXMgZW5jbG9zaW5nIHF1b3Rlcy5cbiAge1xuICAgIG5hbWU6IFwidGV4dFwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBjYW5vbmljYWw6IFwiVGV4dFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0ZXh0IGV4dGVuZHMgUnVsZSB7XG4gICAgICAvLyBUZXh0IHN0cmluZ3MgZ2V0IGVuY29kZWQgYXMgYHRleHRgIG9iamVjdHMgaW4gdGhlIHRva2VuIHN0cmVhbS5cbiAgICAgIHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDApIHtcbiAgICAgICAgbGV0IHRva2VuID0gdG9rZW5zW3N0YXJ0XTtcbiAgICAgICAgaWYgKCEodG9rZW4gaW5zdGFuY2VvZiBUb2tlbml6ZXIuVGV4dCkpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiB0aGlzLmNsb25lKHtcbiAgICAgICAgICBtYXRjaGVkOiB0b2tlbi5xdW90ZWRTdHJpbmcsXG4gICAgICAgICAgbmV4dFN0YXJ0OiBzdGFydCArIDFcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVkO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBMaXRlcmFsIGxpc3QgKGFycmF5KSwgZWc6ICBgWzEsMiAsIHRydWUsZmFsc2UgXWBcbiAge1xuICAgIG5hbWU6IFwibGl0ZXJhbF9saXN0XCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJcXFxcW1tsaXN0OntleHByZXNzaW9ufSxdP1xcXFxdXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpdGVyYWxfbGlzdCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxpc3QgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZSgpO1xuICAgICAgICByZXR1cm4gYFske2xpc3QgPyBsaXN0LmpvaW4oXCIsIFwiKSA6IFwiXCJ9XWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gUGFyZW50aGVzaXplZCBleHByZXNzaW9uXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcInBhcmVudGhlc2l6ZWRfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiXFxcXCh7ZXhwcmVzc2lvbn1cXFxcKVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBwYXJlbnRoZXNpemVkX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBleHByZXNzaW9uIH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoKTtcbiAgICAgICAgLy8gZG9uJ3QgZG91YmxlIHBhcmVucyBpZiBub3QgbmVjZXNzYXJ5XG4gICAgICAgIGlmICh0eXBlb2YgZXhwcmVzc2lvbiA9PT0gXCJzdHJpbmdcIiAmJiBleHByZXNzaW9uLnN0YXJ0c1dpdGgoXCIoXCIpICYmIGV4cHJlc3Npb24uZW5kc1dpdGgoXCIpXCIpKSByZXR1cm4gZXhwcmVzc2lvbjtcbiAgICAgICAgcmV0dXJuIGAoJHtleHByZXNzaW9ufSlgO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL2NvcmUuanMiLCIvLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfSB9KS5hICE9IDc7XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzXG4vLyBtb2R1bGUgaWQgPSA3MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faGFzLmpzXG4vLyBtb2R1bGUgaWQgPSA3M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4vX2llOC1kb20tZGVmaW5lJyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKTtcbnZhciBkUCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgYW5PYmplY3QoQXR0cmlidXRlcyk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gZFAoTywgUCwgQXR0cmlidXRlcyk7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKSB0aHJvdyBUeXBlRXJyb3IoJ0FjY2Vzc29ycyBub3Qgc3VwcG9ydGVkIScpO1xuICBpZiAoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKSBPW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcbiAgcmV0dXJuIE87XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwLmpzXG4vLyBtb2R1bGUgaWQgPSA3NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxMy1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0UHJvcFR5cGVzU2VjcmV0ID0gcmVxdWlyZSgnLi9saWIvUmVhY3RQcm9wVHlwZXNTZWNyZXQnKTtcblxuZnVuY3Rpb24gZW1wdHlGdW5jdGlvbigpIHt9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIHNoaW0ocHJvcHMsIHByb3BOYW1lLCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgcHJvcEZ1bGxOYW1lLCBzZWNyZXQpIHtcbiAgICBpZiAoc2VjcmV0ID09PSBSZWFjdFByb3BUeXBlc1NlY3JldCkge1xuICAgICAgLy8gSXQgaXMgc3RpbGwgc2FmZSB3aGVuIGNhbGxlZCBmcm9tIFJlYWN0LlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKFxuICAgICAgJ0NhbGxpbmcgUHJvcFR5cGVzIHZhbGlkYXRvcnMgZGlyZWN0bHkgaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgYHByb3AtdHlwZXNgIHBhY2thZ2UuICcgK1xuICAgICAgJ1VzZSBQcm9wVHlwZXMuY2hlY2tQcm9wVHlwZXMoKSB0byBjYWxsIHRoZW0uICcgK1xuICAgICAgJ1JlYWQgbW9yZSBhdCBodHRwOi8vZmIubWUvdXNlLWNoZWNrLXByb3AtdHlwZXMnXG4gICAgKTtcbiAgICBlcnIubmFtZSA9ICdJbnZhcmlhbnQgVmlvbGF0aW9uJztcbiAgICB0aHJvdyBlcnI7XG4gIH07XG4gIHNoaW0uaXNSZXF1aXJlZCA9IHNoaW07XG4gIGZ1bmN0aW9uIGdldFNoaW0oKSB7XG4gICAgcmV0dXJuIHNoaW07XG4gIH07XG4gIC8vIEltcG9ydGFudCFcbiAgLy8gS2VlcCB0aGlzIGxpc3QgaW4gc3luYyB3aXRoIHByb2R1Y3Rpb24gdmVyc2lvbiBpbiBgLi9mYWN0b3J5V2l0aFR5cGVDaGVja2Vycy5qc2AuXG4gIHZhciBSZWFjdFByb3BUeXBlcyA9IHtcbiAgICBhcnJheTogc2hpbSxcbiAgICBib29sOiBzaGltLFxuICAgIGZ1bmM6IHNoaW0sXG4gICAgbnVtYmVyOiBzaGltLFxuICAgIG9iamVjdDogc2hpbSxcbiAgICBzdHJpbmc6IHNoaW0sXG4gICAgc3ltYm9sOiBzaGltLFxuXG4gICAgYW55OiBzaGltLFxuICAgIGFycmF5T2Y6IGdldFNoaW0sXG4gICAgZWxlbWVudDogc2hpbSxcbiAgICBpbnN0YW5jZU9mOiBnZXRTaGltLFxuICAgIG5vZGU6IHNoaW0sXG4gICAgb2JqZWN0T2Y6IGdldFNoaW0sXG4gICAgb25lT2Y6IGdldFNoaW0sXG4gICAgb25lT2ZUeXBlOiBnZXRTaGltLFxuICAgIHNoYXBlOiBnZXRTaGltLFxuICAgIGV4YWN0OiBnZXRTaGltXG4gIH07XG5cbiAgUmVhY3RQcm9wVHlwZXMuY2hlY2tQcm9wVHlwZXMgPSBlbXB0eUZ1bmN0aW9uO1xuICBSZWFjdFByb3BUeXBlcy5Qcm9wVHlwZXMgPSBSZWFjdFByb3BUeXBlcztcblxuICByZXR1cm4gUmVhY3RQcm9wVHlwZXM7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3Byb3AtdHlwZXMvZmFjdG9yeVdpdGhUaHJvd2luZ1NoaW1zLmpzXG4vLyBtb2R1bGUgaWQgPSA3NzBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG4vKipcbiAqIEBtb2R1bGUgY29tcG9uZW50V3JhcHBlclxuICpcbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0ICogYXMgc3RvcmUgZnJvbSAnLi4vc3RvcmUnO1xuaW1wb3J0IHsgb25Nb3VudCwgb25Vbm1vdW50IH0gZnJvbSAnLi4vZXZlbnRfaGFuZGxlcnMnO1xuaW1wb3J0IHsgQUxMX0tFWVMgfSBmcm9tICcuLi9saWIva2V5cyc7XG5cbi8qKlxuICogY29tcG9uZW50V3JhcHBlclxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gV3JhcHBlZENvbXBvbmVudCBSZWFjdCBjb21wb25lbnQgY2xhc3MgdG8gYmUgd3JhcHBlZFxuICogQHBhcmFtIHthcnJheX0gW2tleXNdIFRoZSBrZXkocykgYm91bmQgdG8gdGhlIGNsYXNzXG4gKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBoaWdoZXItb3JkZXIgZnVuY3Rpb24gdGhhdCB3cmFwcyB0aGUgZGVjb3JhdGVkIGNsYXNzXG4gKi9cbmZ1bmN0aW9uIGNvbXBvbmVudFdyYXBwZXIoV3JhcHBlZENvbXBvbmVudCkge1xuICB2YXIga2V5cyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogQUxMX0tFWVM7XG5cbiAgdmFyIEtleUJvYXJkSGVscGVyID0gZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoS2V5Qm9hcmRIZWxwZXIsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gS2V5Qm9hcmRIZWxwZXIocHJvcHMpIHtcbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBLZXlCb2FyZEhlbHBlcik7XG5cbiAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChLZXlCb2FyZEhlbHBlci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKEtleUJvYXJkSGVscGVyKSkuY2FsbCh0aGlzLCBwcm9wcykpO1xuXG4gICAgICBfdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgZXZlbnQ6IG51bGxcbiAgICAgIH07XG4gICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEtleUJvYXJkSGVscGVyLCBbe1xuICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBvbk1vdW50KHRoaXMpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgb25Vbm1vdW50KHRoaXMpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2hhbmRsZUtleURvd24nLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZUtleURvd24oZXZlbnQpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgLy8gdG8gc2ltdWxhdGUgYSBrZXlwcmVzcywgc2V0IHRoZSBldmVudCBhbmQgdGhlbiBjbGVhciBpdCBpbiB0aGUgY2FsbGJhY2tcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGV2ZW50OiBldmVudCB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzMi5zZXRTdGF0ZSh7IGV2ZW50OiBudWxsIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoV3JhcHBlZENvbXBvbmVudCwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHsga2V5ZG93bjogdGhpcy5zdGF0ZSB9KSk7XG4gICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEtleUJvYXJkSGVscGVyO1xuICB9KFJlYWN0LkNvbXBvbmVudCk7XG5cbiAgc3RvcmUuc2V0QmluZGluZyh7IGtleXM6IFtdLmNvbmNhdChrZXlzKSwgZm46IEtleUJvYXJkSGVscGVyLnByb3RvdHlwZS5oYW5kbGVLZXlEb3duLCB0YXJnZXQ6IEtleUJvYXJkSGVscGVyLnByb3RvdHlwZSB9KTtcblxuICByZXR1cm4gS2V5Qm9hcmRIZWxwZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbXBvbmVudFdyYXBwZXI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9jbGFzc19kZWNvcmF0b3IuanNcbi8vIG1vZHVsZSBpZCA9IDg0MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbi8qKlxuICogQG1vZHVsZSBkZWNvcmF0b3JzXG4gKlxuICovXG5pbXBvcnQgY2xhc3NXcmFwcGVyIGZyb20gJy4vY2xhc3NfZGVjb3JhdG9yJztcbmltcG9ydCBtZXRob2RXcmFwcGVyIGZyb20gJy4vbWV0aG9kX2RlY29yYXRvcic7XG5pbXBvcnQgbWV0aG9kV3JhcHBlclNjb3BlZCBmcm9tICcuL21ldGhvZF9kZWNvcmF0b3Jfc2NvcGVkJztcblxuLyoqXG4gKiBub29wRGVjb3JhdG9yXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9IFJldHVybnMgYHVuZGVmaW5lZGAgc28gdGhhdCB0aGUgb3JpZ2luYWwgdW5kZWNvcmF0ZWQgaW5zdGFuY2UvbWV0aG9kIGlzIHVzZWRcbiAqL1xuZnVuY3Rpb24gbm9vcERlY29yYXRvcigpIHtcbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBfZGVjb3JhdG9yXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtZXRob2RGbiBUaGUgbWV0aG9kIHdyYXBwZXIgdG8gZGVsZWdhdGUgdG8sIGJhc2VkIG9uIHdoZXRoZXIgdXNlciBoYXMgc3BlY2lmaWVkIGEgc2NvcGVkIGRlY29yYXRvciBvciBub3RcbiAqIEBwYXJhbSB7QXJyYXl9IC4uLmFyZ3MgUmVtYWluZGVyIG9mIGFyZ3VtZW50cyBwYXNzZWQgaW5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgZGVjb3JhdGVkIGNsYXNzIG9yIG1ldGhvZFxuICovXG5mdW5jdGlvbiBfZGVjb3JhdG9yKG1ldGhvZEZuKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgLy8gY2hlY2sgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHNlZSBpZiBpdCdzIGEgdXNlci1zdXBwbGllZCBrZXljb2RlIG9yIGFycmF5XG4gIC8vIG9mIGtleWNvZGVzLCBvciBpZiBpdCdzIHRoZSB3cmFwcGVkIGNsYXNzIG9yIG1ldGhvZFxuICB2YXIgdGVzdEFyZyA9IGFyZ3NbMF07XG4gIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSh0ZXN0QXJnKTtcblxuICAvLyBpZiB0aGUgdGVzdCBhcmd1bWVudCBpcyBub3QgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uLCBpdCBpcyB1c2VyLXN1cHBsaWVkXG4gIC8vIGtleWNvZGVzLiBlbHNlIHRoZXJlIGFyZSBubyBhcmd1bWVudHMgYW5kIGl0J3MganVzdCB0aGUgd3JhcHBlZCBjbGFzc1xuICBpZiAoaXNBcnJheSB8fCB+WydzdHJpbmcnLCAnbnVtYmVyJywgJ3N5bWJvbCddLmluZGV4T2YodHlwZW9mIHRlc3RBcmcgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKHRlc3RBcmcpKSkge1xuICAgIHZhciBrZXlzID0gaXNBcnJheSA/IHRlc3RBcmcgOiBhcmdzO1xuXG4gICAgLy8gcmV0dXJuIHRoZSBkZWNvcmF0b3IgZnVuY3Rpb24sIHdoaWNoIG9uIHRoZSBuZXh0IGNhbGwgd2lsbCBsb29rIGZvclxuICAgIC8vIHRoZSBwcmVzZW5jZSBvZiBhIG1ldGhvZCBuYW1lIHRvIGRldGVybWluZSBpZiB0aGlzIGlzIGEgd3JhcHBlZCBtZXRob2RcbiAgICAvLyBvciBjb21wb25lbnRcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbWV0aG9kTmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgcmV0dXJuIG1ldGhvZE5hbWUgPyBtZXRob2RGbih7IHRhcmdldDogdGFyZ2V0LCBkZXNjcmlwdG9yOiBkZXNjcmlwdG9yLCBrZXlzOiBrZXlzIH0pIDogY2xhc3NXcmFwcGVyKHRhcmdldCwga2V5cyk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgV3JhcHBlZENvbXBvbmVudCA9IGFyZ3NbMF07XG4gICAgdmFyIG1ldGhvZE5hbWUgPSBhcmdzWzFdO1xuXG4gICAgLy8gbWV0aG9kIGRlY29yYXRvcnMgd2l0aG91dCBrZXljb2RlICh3aGljaCkgYXJndW1lbnRzIGFyZSBub3QgYWxsb3dlZC5cbiAgICBpZiAoV3JhcHBlZENvbXBvbmVudCAmJiAhbWV0aG9kTmFtZSkge1xuICAgICAgcmV0dXJuIGNsYXNzV3JhcHBlci5hcHBseSh1bmRlZmluZWQsIGFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4obWV0aG9kTmFtZSArICc6IE1ldGhvZCBkZWNvcmF0b3JzIG11c3QgaGF2ZSBrZXljb2RlIGFyZ3VtZW50cywgc28gdGhlIGRlY29yYXRvciBmb3IgdGhpcyBtZXRob2Qgd2lsbCBub3QgZG8gYW55dGhpbmcnKTtcbiAgICAgIHJldHVybiBub29wRGVjb3JhdG9yO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIGtleWRvd25TY29wZWRcbiAqXG4gKiBNZXRob2QgZGVjb3JhdG9yIHRoYXQgd2lsbCBsb29rIGZvciBjaGFuZ2VzIHRvIGl0cyB0YXJnZXRlZCBjb21wb25lbnQnc1xuICogYGtleWRvd25gIHByb3BzIHRvIGRlY2lkZSB3aGVuIHRvIHRyaWdnZXIsIHJhdGhlciB0aGFuIHJlc3BvbmRpbmcgZGlyZWN0bHlcbiAqIHRvIGtleWRvd24gZXZlbnRzLiBUaGlzIGxldHMgeW91IHNwZWNpZnkgYSBAa2V5ZG93biBkZWNvcmF0ZWQgY2xhc3MgaGlnaGVyXG4gKiB1cCBpbiB0aGUgdmlldyBoaWVyYXJjaHkgZm9yIGxhcmdlciBzY29waW5nIG9mIGtleWRvd24gZXZlbnRzLCBvciBmb3JcbiAqIHByb2dyYW1tYXRpY2FsbHkgc2VuZGluZyBrZXlkb3duIGV2ZW50cyBhcyBwcm9wcyBpbnRvIHRoZSBjb21wb25lbnRzIGluIG9yZGVyXG4gKiB0byB0cmlnZ2VyIGRlY29yYXRlZCBtZXRob2RzIHdpdGggbWF0Y2hpbmcga2V5cy5cbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtBcnJheX0gLi4uYXJncyAgQWxsIChvciBubykgYXJndW1lbnRzIHBhc3NlZCBpbiBmcm9tIGRlY29yYXRpb25cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgZGVjb3JhdGVkIGNsYXNzIG9yIG1ldGhvZFxuICovXG5mdW5jdGlvbiBrZXlkb3duU2NvcGVkKCkge1xuICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuMiksIF9rZXkyID0gMDsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgIGFyZ3NbX2tleTJdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgfVxuXG4gIHJldHVybiBfZGVjb3JhdG9yLmFwcGx5KHVuZGVmaW5lZCwgW21ldGhvZFdyYXBwZXJTY29wZWRdLmNvbmNhdChhcmdzKSk7XG59XG5cbi8qKlxuICoga2V5ZG93blxuICpcbiAqIFRoZSBtYWluIGRlY29yYXRvciBhbmQgZGVmYXVsdCBleHBvcnQsIGhhbmRsZXMgYm90aCBjbGFzc2VzIGFuZCBtZXRob2RzLlxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge0FycmF5fSAuLi5hcmdzICBBbGwgKG9yIG5vKSBhcmd1bWVudHMgcGFzc2VkIGluIGZyb20gZGVjb3JhdGlvblxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBkZWNvcmF0ZWQgY2xhc3Mgb3IgbWV0aG9kXG4gKi9cbmZ1bmN0aW9uIGtleWRvd24oKSB7XG4gIGZvciAodmFyIF9sZW4zID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4zKSwgX2tleTMgPSAwOyBfa2V5MyA8IF9sZW4zOyBfa2V5MysrKSB7XG4gICAgYXJnc1tfa2V5M10gPSBhcmd1bWVudHNbX2tleTNdO1xuICB9XG5cbiAgcmV0dXJuIF9kZWNvcmF0b3IuYXBwbHkodW5kZWZpbmVkLCBbbWV0aG9kV3JhcHBlcl0uY29uY2F0KGFyZ3MpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQga2V5ZG93bjtcblxuZXhwb3J0IHsga2V5ZG93blNjb3BlZCB9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDg0MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbi8qKlxuICogQG1vZHVsZSBtZXRob2RXcmFwcGVyXG4gKlxuICovXG5pbXBvcnQgKiBhcyBzdG9yZSBmcm9tICcuLi9zdG9yZSc7XG5pbXBvcnQgeyBvbk1vdW50LCBvblVubW91bnQsIF9vbktleURvd24gfSBmcm9tICcuLi9ldmVudF9oYW5kbGVycyc7XG5cbi8qKlxuICogX2lzUmVhY3RLZXlEb3duXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgVGhlIHBvc3NpYmx5IHN5bnRoZXRpYyBldmVudCBwYXNzZWQgYXMgYW4gYXJndW1lbnQgd2l0aFxuICogdGhlIG1ldGhvZCBpbnZvY2F0aW9uLlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gX2lzUmVhY3RLZXlEb3duKGV2ZW50KSB7XG4gIHJldHVybiBldmVudCAmJiAodHlwZW9mIGV2ZW50ID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihldmVudCkpID09PSAnb2JqZWN0JyAmJiBldmVudC5uYXRpdmVFdmVudCBpbnN0YW5jZW9mIHdpbmRvdy5LZXlib2FyZEV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICdrZXlkb3duJztcbn1cblxuLyoqXG4gKiBtZXRob2RXcmFwcGVyXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzIEFsbCBhcmd1bWVudHMgbmVjZXNzYXJ5IGZvciB3cmFwcGluZyBtZXRob2RcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzLnRhcmdldCBUaGUgZGVjb3JhdGVkIGNsYXNzXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncy5kZXNjcmlwdG9yIE1ldGhvZCBkZXNjcmlwdG9yXG4gKiBAcGFyYW0ge2FycmF5fSBhcmdzLmtleXMgVGhlIGFycmF5IG9mIGtleXMgYm91bmQgdG8gdGhlIGdpdmVuIG1ldGhvZFxuICogQHJldHVybiB7b2JqZWN0fSBUaGUgbWV0aG9kIGRlc2NyaXB0b3JcbiAqL1xuZnVuY3Rpb24gbWV0aG9kV3JhcHBlcihfcmVmKSB7XG4gIHZhciB0YXJnZXQgPSBfcmVmLnRhcmdldCxcbiAgICAgIGRlc2NyaXB0b3IgPSBfcmVmLmRlc2NyaXB0b3IsXG4gICAgICBrZXlzID0gX3JlZi5rZXlzO1xuXG5cbiAgdmFyIGZuID0gZGVzY3JpcHRvci52YWx1ZTtcblxuICAvLyBpZiB3ZSBoYXZlbid0IGFscmVhZHkgY3JlYXRlZCBhIGJpbmRpbmcgZm9yIHRoaXMgY2xhc3MgKHZpYSBhbm90aGVyXG4gIC8vIGRlY29yYXRlZCBtZXRob2QpLCB3cmFwIHRoZXNlIGxpZmVjeWNsZSBtZXRob2RzLlxuICBpZiAoIXN0b3JlLmdldEJpbmRpbmcodGFyZ2V0KSkge1xuICAgIHZhciBjb21wb25lbnREaWRNb3VudCA9IHRhcmdldC5jb21wb25lbnREaWRNb3VudCxcbiAgICAgICAgY29tcG9uZW50V2lsbFVubW91bnQgPSB0YXJnZXQuY29tcG9uZW50V2lsbFVubW91bnQ7XG5cblxuICAgIHRhcmdldC5jb21wb25lbnREaWRNb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIG9uTW91bnQodGhpcyk7XG4gICAgICBpZiAoY29tcG9uZW50RGlkTW91bnQpIHJldHVybiBjb21wb25lbnREaWRNb3VudC5jYWxsKHRoaXMpO1xuICAgIH07XG5cbiAgICB0YXJnZXQuY29tcG9uZW50V2lsbFVubW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBvblVubW91bnQodGhpcyk7XG4gICAgICBpZiAoY29tcG9uZW50V2lsbFVubW91bnQpIHJldHVybiBjb21wb25lbnRXaWxsVW5tb3VudC5jYWxsKHRoaXMpO1xuICAgIH07XG4gIH1cblxuICAvLyBhZGQgdGhpcyBiaW5kaW5nIG9mIGtleXMgYW5kIG1ldGhvZCB0byB0aGUgdGFyZ2V0J3MgYmluZGluZ3NcbiAgc3RvcmUuc2V0QmluZGluZyh7IGtleXM6IGtleXMsIHRhcmdldDogdGFyZ2V0LCBmbjogZm4gfSk7XG5cbiAgZGVzY3JpcHRvci52YWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICB2YXIgbWF5YmVFdmVudCA9IGFyZ3NbMF07XG5cbiAgICBpZiAoX2lzUmVhY3RLZXlEb3duKG1heWJlRXZlbnQpKSB7XG4gICAgICAvLyBwcm94eSBtZXRob2QgaW4gb3JkZXIgdG8gdXNlIEBrZXlkb3duIGFzIGZpbHRlciBmb3Iga2V5ZG93biBldmVudHMgY29taW5nXG4gICAgICAvLyBmcm9tIGFuIGFjdHVhbCBvbktleURvd24gYmluZGluZyAoYXMgaWRlbnRpZmllZCBieSByZWFjdCdzIGFkZGl0aW9uIG9mXG4gICAgICAvLyAnbmF0aXZlRXZlbnQnICsgdHlwZSA9PT0gJ2tleWRvd24nKVxuICAgICAgaWYgKCFtYXliZUV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgLy8gd2UgYWxyZWFkeSB3aGl0ZWxpc3Qgc2hvcnRjdXRzIHdpdGggY3RybCBtb2RpZmllcnMgc28gaWYgd2Ugd2VyZSB0b1xuICAgICAgICAvLyBmaXJlIGl0IGFnYWluIGhlcmUgdGhlIG1ldGhvZCB3b3VsZCB0cmlnZ2VyIHR3aWNlLiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2dsb3J0aG8vcmVhY3Qta2V5ZG93bi9pc3N1ZXMvMzhcbiAgICAgICAgcmV0dXJuIF9vbktleURvd24obWF5YmVFdmVudCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghbWF5YmVFdmVudCB8fCAhKG1heWJlRXZlbnQgaW5zdGFuY2VvZiB3aW5kb3cuS2V5Ym9hcmRFdmVudCkgfHwgbWF5YmVFdmVudC50eXBlICE9PSAna2V5ZG93bicpIHtcbiAgICAgIC8vIGlmIG91ciBmaXJzdCBhcmd1bWVudCBpcyBhIGtleWRvd24gZXZlbnQgaXQgaXMgYmVpbmcgaGFuZGxlZCBieSBvdXJcbiAgICAgIC8vIGJpbmRpbmcgc3lzdGVtLiBpZiBpdCdzIGFueXRoaW5nIGVsc2UsIGp1c3QgcGFzcyB0aHJvdWdoLlxuICAgICAgcmV0dXJuIGZuLmNhbGwuYXBwbHkoZm4sIFt0aGlzXS5jb25jYXQoYXJncykpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZGVzY3JpcHRvcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWV0aG9kV3JhcHBlcjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9kZWNvcmF0b3JzL21ldGhvZF9kZWNvcmF0b3IuanNcbi8vIG1vZHVsZSBpZCA9IDg0M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEBtb2R1bGUgbWV0aG9kV3JhcHBlclNjb3BlZFxuICpcbiAqL1xuaW1wb3J0IG1hdGNoS2V5cyBmcm9tICcuLi9saWIvbWF0Y2hfa2V5cyc7XG5pbXBvcnQgcGFyc2VLZXlzIGZyb20gJy4uL2xpYi9wYXJzZV9rZXlzJztcblxuLyoqXG4gKiBtZXRob2RXcmFwcGVyU2NvcGVkXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzIEFsbCBhcmdzIG5lY2Vzc2FyeSBmb3IgZGVjb3JhdGluZyB0aGUgbWV0aG9kXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncy50YXJnZXQgVGhlIGRlY29yYXRlZCBtZXRob2QncyBjbGFzcyBvYmplY3RcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzLmRlc2NyaXB0b3IgVGhlIG1ldGhvZCdzIGRlc2NyaXB0b3Igb2JqZWN0XG4gKiBAcGFyYW0ge2FycmF5fSBhcmdzLmtleXMgVGhlIGtleSBjb2RlcyBib3VuZCB0byB0aGUgZGVjb3JhdGVkIG1ldGhvZFxuICogQHJldHVybiB7b2JqZWN0fSBUaGUgbWV0aG9kJ3MgZGVzY3JpcHRvciBvYmplY3RcbiAqL1xuZnVuY3Rpb24gbWV0aG9kV3JhcHBlclNjb3BlZChfcmVmKSB7XG4gIHZhciB0YXJnZXQgPSBfcmVmLnRhcmdldCxcbiAgICAgIGRlc2NyaXB0b3IgPSBfcmVmLmRlc2NyaXB0b3IsXG4gICAgICBrZXlzID0gX3JlZi5rZXlzO1xuICB2YXIgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IHRhcmdldC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzO1xuXG4gIHZhciBmbiA9IGRlc2NyaXB0b3IudmFsdWU7XG4gIGlmICgha2V5cykge1xuICAgIGNvbnNvbGUud2FybihmbiArICc6IGtleWRvd25TY29wZWQgcmVxdWlyZXMgb25lIG9yIG1vcmUga2V5cycpO1xuICB9IGVsc2Uge1xuXG4gICAgLyoqXG4gICAgICogX3Nob3VsZFRyaWdnZXJcbiAgICAgKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGlzUHJvcHMgRXhzdGluZyBwcm9wcyBmcm9tIHRoZSB3cmFwcGVkIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGlzUHJvcHMua2V5ZG93biBUaGUgbmFtZXNwYWNlZCBzdGF0ZSBmcm9tIHRoZSBoaWdoZXItb3JkZXJcbiAgICAgKiBjb21wb25lbnQgKGNsYXNzX2RlY29yYXRvcilcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbmV4dFByb3BzIFRoZSBpbmNvbWluZyBwcm9wcyBmcm9tIHRoZSB3cmFwcGVkIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBuZXh0UHJvcHMua2V5ZG93biBUaGUgbmFtZXNjYXBlZCBzdGF0ZSBmcm9tIHRoZSBoaWdoZXItb3JkZXJcbiAgICAgKiBjb21wb25lbnQgKGNsYXNzX2RlY29yYXRvcilcbiAgICAgKiBAcGFyYW0ge2FycmF5fSBrZXlzIFRoZSBrZXlzIGJvdW5kIHRvIHRoZSBkZWNvcmF0ZWQgbWV0aG9kXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciBhbGwgdGVzdHMgaGF2ZSBwYXNzZWRcbiAgICAgKi9cbiAgICB2YXIgX3Nob3VsZFRyaWdnZXIgPSBmdW5jdGlvbiBfc2hvdWxkVHJpZ2dlcihrZXlkb3duVGhpcywga2V5ZG93bk5leHQpIHtcbiAgICAgIGlmICghKGtleWRvd25OZXh0ICYmIGtleWRvd25OZXh0LmV2ZW50ICYmICFrZXlkb3duVGhpcy5ldmVudCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgcmV0dXJuIGtleVNldHMuc29tZShmdW5jdGlvbiAoa2V5U2V0KSB7XG4gICAgICAgIHJldHVybiBtYXRjaEtleXMoeyBrZXlTZXQ6IGtleVNldCwgZXZlbnQ6IGtleWRvd25OZXh0LmV2ZW50IH0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIHdyYXAgdGhlIGNvbXBvbmVudCdzIGxpZmVjeWNsZSBtZXRob2QgdG8gaW50ZXJjZXB0IGtleSBjb2RlcyBjb21pbmcgZG93blxuICAgIC8vIGZyb20gdGhlIHdyYXBwZWQvc2NvcGVkIGNvbXBvbmVudCB1cCB0aGUgdmlldyBoaWVyYXJjaHkuIGlmIG5ldyBrZXlkb3duXG4gICAgLy8gZXZlbnQgaGFzIGFycml2ZWQgYW5kIHRoZSBrZXkgY29kZXMgbWF0Y2ggd2hhdCB3YXMgc3BlY2lmaWVkIGluIHRoZVxuICAgIC8vIGRlY29yYXRvciwgY2FsbCB0aGUgd3JhcHBlZCBtZXRob2QuXG5cblxuICAgIHZhciBrZXlTZXRzID0gcGFyc2VLZXlzKGtleXMpO3RhcmdldC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzID0gZnVuY3Rpb24gKG5leHRQcm9wcykge1xuICAgICAgdmFyIGtleWRvd25OZXh0ID0gbmV4dFByb3BzLmtleWRvd247XG4gICAgICB2YXIga2V5ZG93blRoaXMgPSB0aGlzLnByb3BzLmtleWRvd247XG5cblxuICAgICAgaWYgKF9zaG91bGRUcmlnZ2VyKGtleWRvd25UaGlzLCBrZXlkb3duTmV4dCkpIHtcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywga2V5ZG93bk5leHQuZXZlbnQpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgYXJnc1tfa2V5IC0gMV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIGlmIChjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKSByZXR1cm4gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcy5jYWxsLmFwcGx5KGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMsIFt0aGlzLCBuZXh0UHJvcHNdLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBkZXNjcmlwdG9yO1xufVxuXG5leHBvcnQgZGVmYXVsdCBtZXRob2RXcmFwcGVyU2NvcGVkO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvbWV0aG9kX2RlY29yYXRvcl9zY29wZWQuanNcbi8vIG1vZHVsZSBpZCA9IDg0NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBwb2x5ZmlsbCBhcnJheS5mcm9tIChtYWlubHkgZm9yIElFKVxuaW1wb3J0ICcuL2xpYi9hcnJheS5mcm9tJztcblxuLy8gQGtleWRvd24gYW5kIEBrZXlkb3duU2NvcGVkXG5leHBvcnQgeyBkZWZhdWx0LCBrZXlkb3duU2NvcGVkIH0gZnJvbSAnLi9kZWNvcmF0b3JzJztcblxuLy8gc2V0QmluZGluZyAtIG9ubHkgdXNlZnVsIGlmIHlvdSdyZSBub3QgZ29pbmcgdG8gdXNlIGRlY29yYXRvcnNcbmV4cG9ydCB7IHNldEJpbmRpbmcgfSBmcm9tICcuL3N0b3JlJztcblxuLy8gS2V5cyAtIHVzZSB0aGlzIHRvIGZpbmQga2V5IGNvZGVzIGZvciBzdHJpbmdzLiBmb3IgZXhhbXBsZTogS2V5cy5qLCBLZXlzLmVudGVyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEtleXMsIEFMTF9LRVlTLCBBTExfUFJJTlRBQkxFX0tFWVMgfSBmcm9tICcuL2xpYi9rZXlzJztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gODQ1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIFByb2R1Y3Rpb24gc3RlcHMgb2YgRUNNQS0yNjIsIEVkaXRpb24gNiwgMjIuMS4yLjFcbi8vIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9mcm9tXG5pZiAoIUFycmF5LmZyb20pIHtcbiAgQXJyYXkuZnJvbSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuICAgIHZhciBpc0NhbGxhYmxlID0gZnVuY3Rpb24gaXNDYWxsYWJsZShmbikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJyB8fCB0b1N0ci5jYWxsKGZuKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgICB9O1xuICAgIHZhciB0b0ludGVnZXIgPSBmdW5jdGlvbiB0b0ludGVnZXIodmFsdWUpIHtcbiAgICAgIHZhciBudW1iZXIgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgaWYgKGlzTmFOKG51bWJlcikpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgICBpZiAobnVtYmVyID09PSAwIHx8ICFpc0Zpbml0ZShudW1iZXIpKSB7XG4gICAgICAgIHJldHVybiBudW1iZXI7XG4gICAgICB9XG4gICAgICByZXR1cm4gKG51bWJlciA+IDAgPyAxIDogLTEpICogTWF0aC5mbG9vcihNYXRoLmFicyhudW1iZXIpKTtcbiAgICB9O1xuICAgIHZhciBtYXhTYWZlSW50ZWdlciA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gICAgdmFyIHRvTGVuZ3RoID0gZnVuY3Rpb24gdG9MZW5ndGgodmFsdWUpIHtcbiAgICAgIHZhciBsZW4gPSB0b0ludGVnZXIodmFsdWUpO1xuICAgICAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KGxlbiwgMCksIG1heFNhZmVJbnRlZ2VyKTtcbiAgICB9O1xuXG4gICAgLy8gVGhlIGxlbmd0aCBwcm9wZXJ0eSBvZiB0aGUgZnJvbSBtZXRob2QgaXMgMS5cbiAgICByZXR1cm4gZnVuY3Rpb24gZnJvbShhcnJheUxpa2UgLyosIG1hcEZuLCB0aGlzQXJnICovKSB7XG4gICAgICAvLyAxLiBMZXQgQyBiZSB0aGUgdGhpcyB2YWx1ZS5cbiAgICAgIHZhciBDID0gdGhpcztcblxuICAgICAgLy8gMi4gTGV0IGl0ZW1zIGJlIFRvT2JqZWN0KGFycmF5TGlrZSkuXG4gICAgICB2YXIgaXRlbXMgPSBPYmplY3QoYXJyYXlMaWtlKTtcblxuICAgICAgLy8gMy4gUmV0dXJuSWZBYnJ1cHQoaXRlbXMpLlxuICAgICAgaWYgKGFycmF5TGlrZSA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcnJheS5mcm9tIHJlcXVpcmVzIGFuIGFycmF5LWxpa2Ugb2JqZWN0IC0gbm90IG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgfVxuXG4gICAgICAvLyA0LiBJZiBtYXBmbiBpcyB1bmRlZmluZWQsIHRoZW4gbGV0IG1hcHBpbmcgYmUgZmFsc2UuXG4gICAgICB2YXIgbWFwRm4gPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHZvaWQgdW5kZWZpbmVkO1xuICAgICAgdmFyIFQ7XG4gICAgICBpZiAodHlwZW9mIG1hcEZuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAvLyA1LiBlbHNlXG4gICAgICAgIC8vIDUuIGEgSWYgSXNDYWxsYWJsZShtYXBmbikgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgICAgaWYgKCFpc0NhbGxhYmxlKG1hcEZuKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FycmF5LmZyb206IHdoZW4gcHJvdmlkZWQsIHRoZSBzZWNvbmQgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyA1LiBiLiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVCBiZSB1bmRlZmluZWQuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgICAgICAgIFQgPSBhcmd1bWVudHNbMl07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gMTAuIExldCBsZW5WYWx1ZSBiZSBHZXQoaXRlbXMsIFwibGVuZ3RoXCIpLlxuICAgICAgLy8gMTEuIExldCBsZW4gYmUgVG9MZW5ndGgobGVuVmFsdWUpLlxuICAgICAgdmFyIGxlbiA9IHRvTGVuZ3RoKGl0ZW1zLmxlbmd0aCk7XG5cbiAgICAgIC8vIDEzLiBJZiBJc0NvbnN0cnVjdG9yKEMpIGlzIHRydWUsIHRoZW5cbiAgICAgIC8vIDEzLiBhLiBMZXQgQSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbQ29uc3RydWN0XV0gaW50ZXJuYWwgbWV0aG9kIFxuICAgICAgLy8gb2YgQyB3aXRoIGFuIGFyZ3VtZW50IGxpc3QgY29udGFpbmluZyB0aGUgc2luZ2xlIGl0ZW0gbGVuLlxuICAgICAgLy8gMTQuIGEuIEVsc2UsIExldCBBIGJlIEFycmF5Q3JlYXRlKGxlbikuXG4gICAgICB2YXIgQSA9IGlzQ2FsbGFibGUoQykgPyBPYmplY3QobmV3IEMobGVuKSkgOiBuZXcgQXJyYXkobGVuKTtcblxuICAgICAgLy8gMTYuIExldCBrIGJlIDAuXG4gICAgICB2YXIgayA9IDA7XG4gICAgICAvLyAxNy4gUmVwZWF0LCB3aGlsZSBrIDwgbGVu4oCmIChhbHNvIHN0ZXBzIGEgLSBoKVxuICAgICAgdmFyIGtWYWx1ZTtcbiAgICAgIHdoaWxlIChrIDwgbGVuKSB7XG4gICAgICAgIGtWYWx1ZSA9IGl0ZW1zW2tdO1xuICAgICAgICBpZiAobWFwRm4pIHtcbiAgICAgICAgICBBW2tdID0gdHlwZW9mIFQgPT09ICd1bmRlZmluZWQnID8gbWFwRm4oa1ZhbHVlLCBrKSA6IG1hcEZuLmNhbGwoVCwga1ZhbHVlLCBrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBBW2tdID0ga1ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGsgKz0gMTtcbiAgICAgIH1cbiAgICAgIC8vIDE4LiBMZXQgcHV0U3RhdHVzIGJlIFB1dChBLCBcImxlbmd0aFwiLCBsZW4sIHRydWUpLlxuICAgICAgQS5sZW5ndGggPSBsZW47XG4gICAgICAvLyAyMC4gUmV0dXJuIEEuXG4gICAgICByZXR1cm4gQTtcbiAgICB9O1xuICB9KCk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL2FycmF5LmZyb20uanNcbi8vIG1vZHVsZSBpZCA9IDg0NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEBtb2R1bGUgZG9tSGVscGVyc1xuICpcbiAqL1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5cbnZhciBmb2N1c2FibGVTZWxlY3RvciA9ICdhW2hyZWZdLCBidXR0b24sIGlucHV0LCBvYmplY3QsIHNlbGVjdCwgdGV4dGFyZWEsIFt0YWJpbmRleF0nO1xuXG4vKipcbiAqIGJpbmRGb2N1c2FibGVzOiBGaW5kIGFueSBmb2N1c2FibGUgY2hpbGQgZWxlbWVudHMgb2YgdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhbmRcbiAqIGFkZCBhbiBvbkZvY3VzIGhhbmRsZXIgdG8gZm9jdXMgb3VyIGtleWRvd24gaGFuZGxlcnMgb24gdGhlIHBhcmVudCBjb21wb25lbnRcbiAqIHdoZW4gdXNlciBrZXlzIGFwcGxpZXMgZm9jdXMgdG8gdGhlIGVsZW1lbnQuXG4gKlxuICogTk9URTogT25lIGxpbWl0YXRpb24gb2YgdGhpcyByaWdodCBub3cgaXMgdGhhdCBpZiB5b3UgdGFiIG91dCBvZiB0aGVcbiAqIGNvbXBvbmVudCwgX2ZvY3VzZWRJbnN0YW5jZSB3aWxsIHN0aWxsIGJlIHNldCB1bnRpbCBuZXh0IGNsaWNrIG9yIG1vdW50IG9yXG4gKiBjb250cm9sbGVkIGZvY3VzLlxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gaW5zdGFuY2UgVGhlIGtleS1ib3VuZCBjb21wb25lbnQgaW5zdGFuY2VcbiAqIEBwYXJhbSB7Y2FsbGJhY2t9IGFjdGl2YXRlT25Gb2N1cyBUaGUgZm4gdG8gZmlyZSB3aGVuIGVsZW1lbnQgaXMgZm9jdXNlZFxuICovXG5mdW5jdGlvbiBiaW5kRm9jdXNhYmxlcyhpbnN0YW5jZSwgYWN0aXZhdGVPbkZvY3VzKSB7XG4gIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBub2RlID0gUmVhY3RET00uZmluZERPTU5vZGUoaW5zdGFuY2UpO1xuICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgdmFyIGZvY3VzYWJsZXMgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoZm9jdXNhYmxlU2VsZWN0b3IpO1xuICAgICAgICBpZiAoZm9jdXNhYmxlcy5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgb25Gb2N1cyA9IGZ1bmN0aW9uIG9uRm9jdXMoZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIG9uRm9jdXNQcmV2ID0gZWxlbWVudC5vbmZvY3VzO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICBhY3RpdmF0ZU9uRm9jdXMoaW5zdGFuY2UpO1xuICAgICAgICAgICAgICBpZiAob25Gb2N1c1ByZXYpIG9uRm9jdXNQcmV2LmNhbGwoZWxlbWVudCwgZXZlbnQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZvY3VzYWJsZXMpLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50Lm9uZm9jdXMgPSBvbkZvY3VzKGVsZW1lbnQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIG5vb3AsIG1vc3RseSBzdXBwcmVzc2luZyBlcnJvciBoZXJlIGh0dHBzOi8vZ2l0aHViLmNvbS9nbG9ydGhvL3JlYWN0LWtleWRvd24vaXNzdWVzLzc2XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogZmluZENvbnRhaW5lck5vZGVzOiBDYWxsZWQgYnkgb3VyIGNsaWNrIGhhbmRsZXIgdG8gZmluZCBpbnN0YW5jZXMgd2l0aCBub2Rlc1xuICogdGhhdCBhcmUgZXF1YWwgdG8gb3IgdGhhdCBjb250YWluIHRoZSBjbGljayB0YXJnZXQuIEFueSB0aGF0IHBhc3MgdGhpcyB0ZXN0XG4gKiB3aWxsIGJlIHJlY2lwaWVudHMgb2YgdGhlIG5leHQga2V5ZG93biBldmVudC5cbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCBUaGUgY2xpY2sgZXZlbnQudGFyZ2V0IERPTSBlbGVtZW50XG4gKiBAcmV0dXJuIHtmdW5jdGlvbn0gUmVkdWNlciBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBmaW5kQ29udGFpbmVyTm9kZXModGFyZ2V0KSB7XG4gIHJldHVybiBmdW5jdGlvbiAobWVtbywgaW5zdGFuY2UpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIG5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZShpbnN0YW5jZSk7XG4gICAgICBpZiAobm9kZSAmJiAobm9kZSA9PT0gdGFyZ2V0IHx8IG5vZGUuY29udGFpbnModGFyZ2V0KSkpIHtcbiAgICAgICAgbWVtby5wdXNoKHsgaW5zdGFuY2U6IGluc3RhbmNlLCBub2RlOiBub2RlIH0pO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogc29ydEJ5RE9NUG9zaXRpb246IENhbGxlZCBieSBvdXIgY2xpY2sgaGFuZGxlciB0byBzb3J0IGEgbGlzdCBvZiBpbnN0YW5jZXNcbiAqIGFjY29yZGluZyB0byBsZWFzdCAtPiBtb3N0IG5lc3RlZC4gVGhpcyBpcyBzbyB0aGF0IGlmIG11bHRpcGxlIGtleWJvdW5kXG4gKiBpbnN0YW5jZXMgaGF2ZSBub2RlcyB0aGF0IGFyZSBhbmNlc3RvcnMgb2YgdGhlIGNsaWNrIHRhcmdldCwgdGhleSB3aWxsIGJlXG4gKiBzb3J0ZWQgdG8gbGV0IHRoZSBpbnN0YW5jZSBjbG9zZXN0IHRvIHRoZSBjbGljayB0YXJnZXQgZ2V0IGZpcnN0IGRpYnMgb24gdGhlXG4gKiBuZXh0IGtleSBkb3duIGV2ZW50LlxuICovXG5mdW5jdGlvbiBzb3J0QnlET01Qb3NpdGlvbihhLCBiKSB7XG4gIHJldHVybiBhLm5vZGUuY29tcGFyZURvY3VtZW50UG9zaXRpb24oYi5ub2RlKSA9PT0gMTAgPyAxIDogLTE7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHsgYmluZEZvY3VzYWJsZXM6IGJpbmRGb2N1c2FibGVzLCBmaW5kQ29udGFpbmVyTm9kZXM6IGZpbmRDb250YWluZXJOb2Rlcywgc29ydEJ5RE9NUG9zaXRpb246IHNvcnRCeURPTVBvc2l0aW9uIH07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL2RvbV9oZWxwZXJzLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBAbW9kdWxlIExpc3RlbmVyc1xuICpcbiAqL1xuXG4vLyBmbGFnIGZvciB3aGV0aGVyIGNsaWNrIGxpc3RlbmVyIGhhcyBiZWVuIGJvdW5kIHRvIGRvY3VtZW50XG52YXIgX2NsaWNrc0JvdW5kID0gZmFsc2U7XG5cbi8vIGZsYWcgZm9yIHdoZXRoZXIga2V5ZG93biBsaXN0ZW5lciBoYXMgYmVlbiBib3VuZCB0byBkb2N1bWVudFxudmFyIF9rZXlzQm91bmQgPSBmYWxzZTtcblxudmFyIExpc3RlbmVycyA9IHtcbiAgLyoqXG4gICAqIF9iaW5kS2V5c1xuICAgKlxuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKi9cbiAgYmluZEtleXM6IGZ1bmN0aW9uIGJpbmRLZXlzKGNhbGxiYWNrKSB7XG4gICAgaWYgKCFfa2V5c0JvdW5kKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY2FsbGJhY2spO1xuICAgICAgX2tleXNCb3VuZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG5cbiAgLyoqXG4gICAqIHVuYmluZEtleXNcbiAgICpcbiAgICogQGFjY2VzcyBwdWJsaWNcbiAgICovXG4gIHVuYmluZEtleXM6IGZ1bmN0aW9uIHVuYmluZEtleXMoY2FsbGJhY2spIHtcbiAgICBpZiAoX2tleXNCb3VuZCkge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGNhbGxiYWNrKTtcbiAgICAgIF9rZXlzQm91bmQgPSBmYWxzZTtcbiAgICB9XG4gIH0sXG5cblxuICAvKipcbiAgICogYmluZENsaWNrc1xuICAgKlxuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKi9cbiAgYmluZENsaWNrczogZnVuY3Rpb24gYmluZENsaWNrcyhjYWxsYmFjaykge1xuICAgIGlmICghX2NsaWNrc0JvdW5kKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbGxiYWNrLCB0cnVlKTtcbiAgICAgIF9jbGlja3NCb3VuZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG5cbiAgLyoqXG4gICAqIHVuYmluZENsaWNrc1xuICAgKlxuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKi9cbiAgdW5iaW5kQ2xpY2tzOiBmdW5jdGlvbiB1bmJpbmRDbGlja3MoY2FsbGJhY2spIHtcbiAgICBpZiAoX2NsaWNrc0JvdW5kKSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbGxiYWNrLCB0cnVlKTtcbiAgICAgIF9jbGlja3NCb3VuZCA9IGZhbHNlO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgTGlzdGVuZXJzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9saXN0ZW5lcnMuanNcbi8vIG1vZHVsZSBpZCA9IDg0OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBDb3VudGVyIGJlaW5nIGluY3JlbWVudGVkLiBKUyBpcyBzaW5nbGUtdGhyZWFkZWQsIHNvIGl0J2xsIEp1c3QgV29ya+KEoi5cbnZhciBfX2NvdW50ZXIgPSAxO1xuXG4vKipcbiAqIFJldHVybnMgYSBwcm9jZXNzLXdpZGUgdW5pcXVlIGlkZW50aWZpZXIuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHV1aWQoKSB7XG4gIHJldHVybiBcInVpZC1cIiArIF9fY291bnRlcisrO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi91dWlkLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy9cdCMgUGFyc2VyIFJ1bGVzXG4vL1x0UnVsZXMgY2FuIGJlIGFzIHNpbXBsZSBhcyBhIHN0cmluZyBgS2V5d29yZGAgb3IgYSBjb21wbGV4IHNlcXVlbmNlIG9mIChuZXN0ZWQpIHJ1bGVzLlxuLy9cbi8vXHRQYXJzZSBhIHJ1bGUgd2l0aCBgcnVsZS5wYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQsIGVuZClgLCB0aGlzIHdpbGwgZWl0aGVyOlxuLy9cdFx0LSByZXR1cm4gYHVuZGVmaW5lZGAgaWYgdGhlIHJ1bGUgZG9lc24ndCBtYXRjaCB0aGUgaGVhZCBvZiB0aGUgdG9rZW5zLCBvclxuLy9cdFx0LSByZXR1cm4gYSBDTE9ORSBvZiB0aGUgbWF0Y2hlZCBydWxlIHdpdGggYXQgbGVhc3QgdGhlIGZvbGxvd2luZzpcbi8vXHRcdFx0LSBgbWF0Y2hlZGBcdFx0UmVzdWx0cyBvZiB5b3VyIHBhcnNlLlxuLy9cdFx0XHQtIGBuZXh0U3RhcnRgXHRQbGFjZSB3aGVyZSBuZXh0IG1hdGNoIHNob3VsZCBzdGFydCAoZWc6IG9uZSBiZXlvbmQgd2hhdCB5b3UgbWF0Y2hlZCkuXG4vL1xuLy9cdFRoZSBjbG9uZSByZXR1cm5lZCBhYm92ZSBjYW4gYmUgbWFuaXB1bGF0ZWQgd2l0aFxuLy9cdFx0LSBgcnVsZS5yZXN1bHRzYFx0XHRcdFJldHVybiBtYXRjaGVkIGFyZ3VtZW50cyBpbiBhIGZvcm1hdCBzdWl0YWJsZSB0byBkbzpcbi8vXHRcdC0gYHJ1bGUudG9Tb3VyY2UoKWBcdFJldHVybiBqYXZhc2NyaXB0IHNvdXJjZSB0byBpbnRlcnByZXQgdGhlIHJ1bGUuXG4vL1xuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi9QYXJzZXIuanNcIjtcbmltcG9ydCBUb2tlbml6ZXIgZnJvbSBcIi4vVG9rZW5pemVyLmpzXCI7XG5cbmltcG9ydCBnbG9iYWwgZnJvbSBcIi4vdXRpbHMvZ2xvYmFsXCI7XG5pbXBvcnQgeyBpc1doaXRlc3BhY2UgfSBmcm9tIFwiLi91dGlscy9zdHJpbmdcIjtcblxuXG4vLyBBYnN0cmFjdCBSdWxlIGNsYXNzLlxuLy8gVE9ET0NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJ1bGUge1xuXHRjb25zdHJ1Y3RvciguLi5wcm9wcykge1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywgLi4ucHJvcHMpO1xuXHR9XG5cblx0Ly8gQ2xvbmUgdGhpcyBydWxlIGFuZCBhZGQgYW55IGBwcm9wc2AgcGFzc2VkIGluLlxuXHRjbG9uZShwcm9wcykge1xuXHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzLCBwcm9wcyk7XG5cdH1cblxuLy9cbi8vXHRQYXJzaW5nIHByaW1pdGl2ZXMgLS0geW91IE1VU1QgaW1wbGVtZW50IHRoZXNlIGluIHlvdXIgc3ViY2xhc3NlcyFcbi8vXG5cblx0Ly8gQXR0ZW1wdCB0byBtYXRjaCB0aGlzIHJ1bGUgYmV0d2VlbiBgc3RhcnRgIGFuZCBgZW5kYCBvZiBgdG9rZW5zYC5cblx0Ly8gUmV0dXJucyByZXN1bHRzIG9mIHRoZSBwYXJzZSBvciBgdW5kZWZpbmVkYC5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvLyBUZXN0IHRvIHNlZSBpZiBiaXRzIG9mIG91ciBydWxlIGFyZSBmb3VuZCBBTllXSEVSRSBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgIGluIHRoZSBgdG9rZW5zYC5cblx0Ly8gVGhpcyBpcyB1c2VkIGJ5IGNvbXBsaWNhdGVkIChlZzogbGVmdCByZWN1cnNpdmUpIHJ1bGVzIHRvIGV4aXQgcXVpY2tseSBpZiB0aGVyZSdzIG5vIGNoYW5jZS5cblx0Ly8gUmV0dXJuczpcblx0Ly9cdC0gYHRydWVgIGlmIHRoZSBydWxlIE1JR0hUIGJlIG1hdGNoZWQuXG5cdC8vXHQtIGBmYWxzZWAgaWYgdGhlcmUgaXMgTk8gV0FZIHRoZSBydWxlIGNhbiBiZSBtYXRjaGVkLlxuXHQvL1x0LSBgdW5kZWZpbmVkYCBpZiBub3QgZGV0ZXJtaW5zdGljIChlZzogbm8gd2F5IHRvIHRlbGwgcXVpY2tseSkuXG5cdHRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG4vL1xuLy8gIyMgb3V0cHV0IGFzIHNvdXJjZVxuLy9cblxuXHQvLyBPdXRwdXQgdmFsdWUgZm9yIHRoaXMgSU5TVEFOVElBVEVEIHJ1bGUgYXMgc291cmNlLlxuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkO1xuXHR9XG5cblxuLy9cbi8vICMjIG91dHB1dCBhcyBzdHJ1Y3R1cmU6XG4vL1xuXHR0b1N0cnVjdHVyZSgpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG59XG5cblxuLy8gQWJzdHJhY3QgcnVsZSBmb3Igb25lIG9yIG1vcmUgc2VxdWVudGlhbCBsaXRlcmFsIHZhbHVlcyB0byBtYXRjaC5cbi8vIGBydWxlLmxpdGVyYWxzYCBpcyB0aGUgbGl0ZXJhbCBzdHJpbmcgb3IgYXJyYXkgb2YgbGl0ZXJhbCBzdHJpbmdzIHRvIG1hdGNoLlxuLy8gYHJ1bGUubGl0ZXJhbFNlcGFyYXRvcmAgaXMgdGhlIHN0cmluZyB0byBwdXQgYmV0d2VlbiBtdWx0aXBsZSBsaXRlcmFscyB3aGVuIGpvaW5pbmcuXG4vL1xuLy8gQWZ0ZXIgcGFyc2luZ1xuLy8gIGBydWxlLm1hdGNoZWRgIHdpbGwgYmUgdGhlIHN0cmluZyB3aGljaCB3YXMgbWF0Y2hlZFxuLy8gIGBydWxlLm5leHRTdGFydGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IHN0YXJ0IHRva2VuXG5SdWxlLkxpdGVyYWxzID0gY2xhc3MgbGl0ZXJhbHMgZXh0ZW5kcyBSdWxlIHtcblx0Y29uc3RydWN0b3IoLi4ucHJvcHMpIHtcblx0XHRzdXBlciguLi5wcm9wcyk7XG5cdFx0Ly8gY29lcmNlIHRvIGFuIGFycmF5IChhIGJpdCBzbG93ZXIgYnV0IGNsZWFuZXIpLlxuXHRcdGlmICghQXJyYXkuaXNBcnJheSh0aGlzLmxpdGVyYWxzKSkgdGhpcy5saXRlcmFscyA9IFt0aGlzLmxpdGVyYWxzXTtcblx0fVxuXG5cdC8vIEF0dGVtcHQgdG8gbWF0Y2ggdGhpcyBydWxlIGluIHRoZSBgdG9rZW5zYC5cblx0Ly8gUmV0dXJucyByZXN1bHRzIG9mIHRoZSBwYXJzZSBvciBgdW5kZWZpbmVkYC5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGlmICghdGhpcy5tYXRjaGVzU3RhcnRpbmdBdCh0b2tlbnMsIHN0YXJ0LCBlbmQpKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQ6IHRoaXMubGl0ZXJhbHMuam9pbih0aGlzLmxpdGVyYWxTZXBhcmF0b3IpLFxuXHRcdFx0bmV4dFN0YXJ0OiBzdGFydCArIHRoaXMubGl0ZXJhbHMubGVuZ3RoXG5cdFx0fSk7XG5cdH1cblxuXHQvLyBEb2VzIHRoaXMgbWF0Y2ggYXBwZWFyIEFOWVdIRVJFIGluIHRoZSB0b2tlbnM/XG5cdHRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kID0gdG9rZW5zLmxlbmd0aCkge1xuXHQgIGxldCBmaXJzdCA9IHRoaXMubGl0ZXJhbHNbMF07XG5cdCAgZm9yICh2YXIgaW5kZXggPSBzdGFydDsgaW5kZXggPCBlbmQ7IGluZGV4KyspIHtcblx0ICAgIGlmICh0b2tlbnNbaW5kZXhdICE9PSBmaXJzdCkgY29udGludWU7XG5cdCAgICBpZiAodGhpcy5tYXRjaGVzU3RhcnRpbmdBdCh0b2tlbnMsIGluZGV4LCBlbmQpKSByZXR1cm4gdHJ1ZTtcblx0ICB9XG5cdCAgcmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gTWF0Y2ggb3VyIGBsaXRlcmFsc2AgYmV0d2VlbiBgc3RhcnRgIGFuZCBgZW5kYCBvZiB0b2tlbnMuXG5cdG1hdGNoZXNTdGFydGluZ0F0KHRva2Vucywgc3RhcnQgPSAwLCBlbmQgPSB0b2tlbnMubGVuZ3RoKSB7XG5cdCAgaWYgKHRoaXMubGl0ZXJhbHMubGVuZ3RoID09PSAxKSByZXR1cm4gdG9rZW5zW3N0YXJ0XSA9PT0gdGhpcy5saXRlcmFsc1swXTtcbiAgICByZXR1cm4gdGhpcy5saXRlcmFscy5ldmVyeSgobGl0ZXJhbCwgaSkgPT4gKHN0YXJ0ICsgaSA8IGVuZCkgJiYgKGxpdGVyYWwgPT09IHRva2Vuc1tzdGFydCArIGldKSk7XG5cdH1cblxuICB0b1NvdXJjZSgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaGVkO1xuICB9XG5cblx0dG9TeW50YXgoKSB7XG5cdFx0cmV0dXJuIGAke3RoaXMubGl0ZXJhbHMuam9pbih0aGlzLmxpdGVyYWxTZXBhcmF0b3IgfHwgXCJcIil9JHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcblx0fVxufVxuXG4vLyBPbmUgb3IgbW9yZSBsaXRlcmFsIHN5bWJvbHM6IGA8YCwgYCVgIGV0Yy5cbi8vIFN5bWJvbHMgam9pbiBXSVRIT1VUIHNwYWNlcy5cblJ1bGUuU3ltYm9scyA9IGNsYXNzIHN5bWJvbHMgZXh0ZW5kcyBSdWxlLkxpdGVyYWxzIHt9XG5cblxuLy8gT25lIG9yIG1vcmUgbGl0ZXJhbCBrZXl3b3Jkcy5cbi8vIEtleXdvcmRzIGpvaW4gV0lUSCBzcGFjZXMuXG5SdWxlLktleXdvcmRzID0gY2xhc3Mga2V5d29yZHMgZXh0ZW5kcyBSdWxlLkxpdGVyYWxzIHt9XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoUnVsZS5LZXl3b3Jkcy5wcm90b3R5cGUsIFwibGl0ZXJhbFNlcGFyYXRvclwiLCB7IHZhbHVlOiBcIiBcIiB9KTtcblxuXG5cbi8vIFJlZ2V4IHBhdHRlcm4gdG8gbWF0Y2ggYSBTSU5HTEUgdG9rZW4uXG4vLyBgcnVsZS5wYXR0ZXJuYCBpcyB0aGUgcmVndWxhciBleHByZXNzaW9uIHRvIG1hdGNoLlxuLy8gICAgTm90ZSB0aGF0IHlvdSBNVVNUIHN0YXJ0IHlvdXIgcGF0dGVybiB3aXRoIGBeYCBhbmQgZW5kIHdpdGggYCRgIHRvIG1ha2Ugc3VyZSBpdCBtYXRjaGVzIHRoZSBlbnRpcmUgdG9rZW4uXG4vLyAgICBOb3RlIHRoYXQgdGhpcyBjYW4gb25seSBtYXRjaCBhIHNpbmdsZSB0b2tlbiFcbi8vIGBydWxlLmJsYWNrbGlzdGAgaXMgYSBtYXAgb2YgYHsga2V5OiB0cnVlIH1gIGZvciBzdHJpbmdzIHdoaWNoIHdpbGwgTk9UIGJlIGFjY2VwdGVkLlxuLy9cbi8vIEFmdGVyIHBhcnNpbmdcbi8vICBgcnVsZS5tYXRjaGVkYCB3aWxsIGJlIHRoZSBzdHJpbmcgd2hpY2ggd2FzIG1hdGNoZWQuXG4vLyAgYHJ1bGUubmV4dFN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RhcnQgdG9rZW4uXG5SdWxlLlBhdHRlcm4gPSBjbGFzcyBwYXR0ZXJuIGV4dGVuZHMgUnVsZSB7XG5cdC8vIEF0dGVtcHQgdG8gbWF0Y2ggdGhpcyBwYXR0ZXJuIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHRva2Vucy5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG5cdFx0aWYgKHR5cGVvZiB0b2tlbiAhPT0gXCJzdHJpbmdcIikgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBtYXRjaCA9IHRva2VuLm1hdGNoKHRoaXMucGF0dGVybik7XG5cdFx0aWYgKCFtYXRjaCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIGJhaWwgaWYgcHJlc2VudCBpbiBibGFja2xpc3Rcblx0XHRsZXQgbWF0Y2hlZCA9IG1hdGNoWzBdO1xuXHRcdGlmICh0aGlzLmJsYWNrbGlzdCAmJiB0aGlzLmJsYWNrbGlzdFttYXRjaGVkXSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQsXG5cdFx0XHRuZXh0U3RhcnQ6IHN0YXJ0ICsgMVxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gVGVzdCB0byBzZWUgaWYgYW55IG9mIG91ciBwYXR0ZXJuIGlzIGZvdW5kIEFOWVdIRVJFIGluIHRoZSB0b2tlbnMuXG5cdHRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0cmV0dXJuIHRva2Vucy5zbGljZShzdGFydCwgZW5kKS5zb21lKHRva2VuID0+IHR5cGVvZiB0b2tlbiA9PT0gXCJzdHJpbmdcIiAmJiBwYXR0ZXJuLnRlc3QodG9rZW4pKTtcblx0fVxuXG5cdHRvU3ludGF4KCkge1xuXHRcdHJldHVybiB0aGlzLnBhdHRlcm4uc291cmNlO1xuXHR9XG59XG5cblxuLy8gU3VicnVsZSAtLSBuYW1lIG9mIGFub3RoZXIgcnVsZSB0byBiZSBjYWxsZWQuXG4vLyBgcnVsZS5zdWJydWxlYCBpcyB0aGUgbmFtZSBvZiB0aGUgcnVsZSBpbiBgcGFyc2VyLnJ1bGVzYC5cbi8vXG4vLyBBZnRlciBwYXJzaW5nXG4vLyAgd2UnbGwgcmV0dXJuIHRoZSBhY3R1YWwgcnVsZSB0aGF0IHdhcyBtYXRjaGVkIChyYXRoZXIgdGhhbiBhIGNsb25lIG9mIHRoaXMgcnVsZSlcblJ1bGUuU3VicnVsZSA9IGNsYXNzIHN1YnJ1bGUgZXh0ZW5kcyBSdWxlIHtcblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGxldCBtYXRjaGVkUnVsZSA9IHBhcnNlci5wYXJzZU5hbWVkUnVsZSh0aGlzLnN1YnJ1bGUsIHRva2Vucywgc3RhcnQsIGVuZCwgc3RhY2ssIGBwYXJzZSBzdWJydWxlICcke3RoaXMucnVsZX0nYCk7XG5cdFx0aWYgKCFtYXRjaGVkUnVsZSkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRpZiAodGhpcy5hcmd1bWVudCkgbWF0Y2hlZFJ1bGUuYXJndW1lbnQgPSB0aGlzLmFyZ3VtZW50O1xuXHRcdHJldHVybiBtYXRjaGVkUnVsZTtcblx0fVxuXG5cdC8vIEFzayB0aGUgc3VicnVsZSB0byBmaWd1cmUgb3V0IGlmIGEgbWF0Y2ggaXMgcG9zc2libGUuXG5cdHRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0cmV0dXJuIHBhcnNlci50ZXN0KHRoaXMuc3VicnVsZSwgdG9rZW5zLCBzdGFydCwgZW5kKTtcblx0fVxuXG5cdHRvU3ludGF4KCkge1xuXHRcdHJldHVybiBgeyR7dGhpcy5hcmd1bWVudCA/IHRoaXMuYXJndW1lbnQrXCI6XCIgOiBcIlwifSR7dGhpcy5zdWJydWxlfX0ke3RoaXMub3B0aW9uYWwgPyAnPycgOiAnJ31gO1xuXHR9XG59XG5cblxuLy8gU2VxdWVuY2Ugb2YgcnVsZXMgdG8gbWF0Y2guXG4vLyAgYHJ1bGUucnVsZXNgIGlzIHRoZSBhcnJheSBvZiBydWxlcyB0byBtYXRjaC5cbi8vICBgcnVsZS5sZWZ0UmVjdXJzaXZlYCBzaG91bGQgYmUgYHRydWVgIGlmIHRoZSBmaXJzdCBub24tb3B0aW9uYWwgcnVsZSBpbiBvdXIgYHJ1bGVzYFxuLy8gICAgbWF5IGVuZCB1cCBjYWxsaW5nIHVzIGFnYWluLiAgSW4gdGhpcyBjYXNlLCB5b3Ugc2hvdWxkIHByb3ZpZGUgYHJ1bGUudGVzdFJ1bGVgLlxuLy9cbi8vIEFmdGVyIHBhcnNpbmdcbi8vICBgcnVsZS5tYXRjaGVkYCB3aWxsIGJlIHRoZSBhcnJheSBvZiBydWxlcyB3aGljaCB3ZXJlIG1hdGNoZWQuXG4vLyAgYHJ1bGUubmV4dFN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RhcnQgdG9rZW4uXG5SdWxlLlNlcXVlbmNlID0gY2xhc3Mgc2VxdWVuY2UgZXh0ZW5kcyBSdWxlIHtcblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdC8vIElmIHdlIGhhdmUgYSBgdGVzdFJ1bGVgIGRlZmluZWRcblx0XHRpZiAodGhpcy50ZXN0UnVsZSkge1xuXHRcdFx0Ly8gRm9yZ2V0IGl0IGlmIHRoZXJlIGlzIE5PIFdBWSB0aGUgcnVsZSBjb3VsZCBiZSBtYXRjaGVkLlxuXHRcdFx0aWYgKHBhcnNlci50ZXN0KHRoaXMudGVzdFJ1bGUsIHRva2Vucywgc3RhcnQpID09PSBmYWxzZSkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHQvLyBJZiB3ZSdyZSBhIGxlZnRSZWN1cnNpdmUgc2VxdWVuY2UuLi5cblx0XHRpZiAodGhpcy5sZWZ0UmVjdXJzaXZlKSB7XG5cdFx0XHQvLyBJZiB0aGUgc3RhY2sgYWxyZWFkeSBjb250YWlucyB0aGlzIHJ1bGUsIGZvcmdldCBpdC5cblx0XHRcdGlmIChzdGFjayAmJiBzdGFjay5pbmNsdWRlcyh0aGlzKSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdFx0Ly8gQ2xvbmUgc3RhY2sgYW5kIGFkZCB0aGlzIHJ1bGUgZm9yIHJlY3Vyc2lvbi4uLlxuXHRcdFx0c3RhY2sgPSBzdGFjayA/IHN0YWNrLmNvbmNhdCgpIDogW107XG5cdFx0XHRzdGFjay5wdXNoKHRoaXMpO1xuXG5cdFx0XHQvLyBUT0RPOiBXZSBjb3VsZCBkaXN0aW5ndWlzaCBiZXR3ZWVuIHByb2R1Y3RpdmUgYW5kIHVucHJvZHVjdGl2ZSBydWxlc1xuXHRcdFx0Ly9cdFx0IGJ5IGNoZWNraW5nIG9ubHkgcnVsZXMgd2hpY2ggb2NjdXIgYXQgdGhlIHNhbWUgYHN0YXJ0YC4uLlxuXHRcdFx0Ly9cdFx0IFRoaXMgd291bGQgcHJvYmFibHkgYWxsb3cgbW9yZSBpbnRlcmVzdGluZyB0aGluZ3MsIGJ1dCBpdCdzIG11Y2ggbXVjaCBzbG93ZXIuXG5cdFx0fVxuXG5cdFx0bGV0IG1hdGNoZWQgPSBbXTtcblx0XHRsZXQgbmV4dFN0YXJ0ID0gc3RhcnQ7XG5cdFx0bGV0IGluZGV4ID0gMCwgcnVsZSA9IHVuZGVmaW5lZDtcblx0XHR3aGlsZSAocnVsZSA9IHRoaXMucnVsZXNbaW5kZXgrK10pIHtcblx0XHRcdGxldCBtYXRjaCA9IHJ1bGUucGFyc2UocGFyc2VyLCB0b2tlbnMsIG5leHRTdGFydCwgZW5kLCBzdGFjayk7XG5cdFx0XHRpZiAoIW1hdGNoICYmICFydWxlLm9wdGlvbmFsKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0aWYgKG1hdGNoKSB7XG5cdFx0XHRcdG1hdGNoZWQucHVzaChtYXRjaCk7XG5cdFx0XHRcdG5leHRTdGFydCA9IG1hdGNoLm5leHRTdGFydDtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gaWYgd2UgZ2V0IGhlcmUsIHdlIG1hdGNoZWQgYWxsIHRoZSBydWxlcyFcblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkLFxuXHRcdFx0bmV4dFN0YXJ0XG5cdFx0fSk7XG5cdH1cblxuXG4vL1RPRE9DXG5cdC8vIFwiZ2F0aGVyXCIgYXJndW1lbnRzIGluIHByZXBhcmF0aW9uIHRvIGNhbGwgYHRvU291cmNlKClgXG5cdC8vIE9ubHkgY2FsbGFibGUgYWZ0ZXIgcGFyc2UgaXMgY29tcGxldGVkLlxuXHQvLyBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHByb3BlcnRpZXMgZnJvbSB0aGUgYG1hdGNoZWRgIGFycmF5IGluZGV4ZWQgYnlcblx0Ly9cdFx0LSBgbWF0Y2guYXJndW1lbnRgOlx0XHRhcmd1bWVudCBzZXQgd2hlbiBydWxlIHdhcyBkZWNsYXJlZCwgZWc6IGB7dmFsdWU6bGl0ZXJhbH1gID0+IGB2YWx1ZWBcblx0Ly9cdFx0LSBgbWF0Y2gucnVsZU5hbWVgOlx0XHRuYW1lIG9mIHJ1bGUgd2hlbiBkZWZpbmVkXG5cdC8vXHRcdC0gYHJ1bGUgdHlwZWA6XHRcdFx0bmFtZSBvZiB0aGUgcnVsZSB0eXBlXG5cdC8vIE5PVEU6IG1lbW9pemVzIHRoZSByZXN1bHRzLlxuXHRnZXQgcmVzdWx0cygpIHtcblx0XHRpZiAoIXRoaXMubWF0Y2hlZCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRsZXQgcmVzdWx0cyA9IHRoaXMuX2FkZFJlc3VsdHMoe30sIHRoaXMubWF0Y2hlZCk7XG5cdFx0aWYgKHRoaXMuY29tbWVudCkgcmVzdWx0cy5jb21tZW50ID0gdGhpcy5jb21tZW50O1xuXHRcdHJldHVybiByZXN1bHRzO1xuXHR9XG5cblx0X2FkZFJlc3VsdHMocmVzdWx0cywgbWF0Y2hlZCkge1xuXHRcdGxldCBpbmRleCA9IDAsIG1hdGNoID0gdW5kZWZpbmVkO1xuXHRcdHdoaWxlIChtYXRjaCA9IG1hdGNoZWRbaW5kZXgrK10pIHtcblx0XHRcdGlmIChtYXRjaC5wcm9tb3RlKSB7XG5cdFx0XHRcdHRoaXMuX2FkZFJlc3VsdHMocmVzdWx0cywgbWF0Y2gubWF0Y2hlZCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0bGV0IHJlc3VsdE5hbWUgPSBtYXRjaC5hcmd1bWVudCB8fCBtYXRjaC5ncm91cCB8fCBtYXRjaC5jb25zdHJ1Y3Rvci5uYW1lO1xuXHRcdFx0XHQvLyBJZiBhcmcgYWxyZWFkeSBleGlzdHMsIGNvbnZlcnQgdG8gYW4gYXJyYXlcblx0XHRcdFx0aWYgKHJlc3VsdE5hbWUgaW4gcmVzdWx0cykge1xuXHRcdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShyZXN1bHRzW3Jlc3VsdE5hbWVdKSkge1xuXHRcdFx0XHRcdCAgcmVzdWx0c1tyZXN1bHROYW1lXSA9IFtyZXN1bHRzW3Jlc3VsdE5hbWVdXTtcbi8vXHRcdFx0XHRcdCAgcmVzdWx0c1tzb3VyY2VOYW1lXSA9IFtyZXN1bHRzW3NvdXJjZU5hbWVdXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmVzdWx0c1tyZXN1bHROYW1lXS5wdXNoKG1hdGNoKTtcbi8vXHRcdFx0XHRcdHJlc3VsdHNbc291cmNlTmFtZV0ucHVzaChzb3VyY2UpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHJlc3VsdHNbcmVzdWx0TmFtZV0gPSBtYXRjaDtcbi8vXHRcdFx0XHRcdHJlc3VsdHNbc291cmNlTmFtZV0gPSBzb3VyY2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdHM7XG5cdH1cblxuXHQvLyBSZXR1cm4gYHRvU291cmNlKClgIGZvciBvdXIgYHJlc3VsdHNgIGFzIGEgbWFwLlxuXHQvLyBJZiB5b3UgcGFzcyBga2V5c2AsIHdlJ2xsIHJlc3RyaWN0IHRvIGp1c3QgdGhvc2Uga2V5cy5cblx0Z2V0TWF0Y2hlZFNvdXJjZSgpIHtcblx0XHRsZXQgcmVzdWx0cyA9IHRoaXMucmVzdWx0cztcblx0XHRsZXQgb3V0cHV0ID0ge307XG5cdFx0T2JqZWN0LmtleXMocmVzdWx0cykuZm9yRWFjaChrZXkgPT4ge1xuXHRcdFx0bGV0IHZhbHVlID0gcmVzdWx0c1trZXldO1xuXHRcdFx0aWYgKHZhbHVlLnRvU291cmNlKSBvdXRwdXRba2V5XSA9IHZhbHVlLnRvU291cmNlKCk7XG5cdFx0XHRlbHNlIG91dHB1dFtrZXldID0gdmFsdWU7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8vIEVjaG8gdGhpcyBydWxlIGJhY2sgb3V0LlxuXHR0b1N5bnRheCgpIHtcblx0ICBjb25zdCBydWxlcyA9IHRoaXMucnVsZXMubWFwKHJ1bGUgPT4gcnVsZS50b1N5bnRheCgpKTtcblx0XHRyZXR1cm4gYCR7dGhpcy5ydWxlcy5qb2luKFwiIFwiKX0ke3RoaXMub3B0aW9uYWwgPyAnPycgOiAnJ31gO1xuXHR9XG5cbn1cblxuXG4vLyBBbHRlcm5hdGl2ZSBzeW50YXgsIG1hdGNoaW5nIG9uZSBvZiBhIG51bWJlciBvZiBkaWZmZXJlbnQgcnVsZXMuXG4vLyBUaGUgcmVzdWx0IG9mIGEgcGFyc2UgaXMgdGhlIGxvbmdlc3QgcnVsZSB0aGF0IGFjdHVhbGx5IG1hdGNoZWQuXG4vLyBOT1RFOiBDdXJyZW50bHkgdGFrZXMgdGhlIGxvbmdlc3QgdmFsaWQgbWF0Y2guXG4vLyBUT0RPOiBtYXRjaCBhbGwgdmFsaWQgYWx0ZXJuYXRpdmVzXG4vL1xuLy8gQWZ0ZXIgcGFyc2luZ1xuLy8gIHdlJ2xsIHJldHVybiB0aGUgcnVsZSB3aGljaCBpcyB0aGUgXCJiZXN0IG1hdGNoXCIgKHJhdGhlciB0aGFuIGNsb25pbmcgdGhpcyBydWxlKS5cblJ1bGUuQWx0ZXJuYXRpdmVzID0gY2xhc3MgYWx0ZXJuYXRpdmVzIGV4dGVuZHMgUnVsZSB7XG5cdGNvbnN0cnVjdG9yKC4uLnByb3BzKSB7XG5cdFx0c3VwZXIoLi4ucHJvcHMpO1xuXHRcdGlmICghdGhpcy5ydWxlcykgdGhpcy5ydWxlcyA9IFtdO1xuXHR9XG5cblx0Ly8gVGVzdCB0byBzZWUgaWYgYW55IG9mIG91ciBhbHRlcm5hdGl2ZXMgYXJlIGZvdW5kIEFOWVdIRVJFIGluIHRoZSB0b2tlbnMuXG5cdC8vIE5PVEU6IHRoaXMgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGlmIHdlJ3JlIHNwZWNpZmllZCBhcyBhIGB0ZXN0UnVsZWBcblx0Ly9cdFx0IGFuZCB0aGVuIG9ubHkgaWYgYWxsIG9mIG91ciBydWxlcyBhcmUgZGV0ZXJtaW5pc3RpYy5cblx0dGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRsZXQgaW5kZXggPSAwLCBydWxlID0gdW5kZWZpbmVkO1xuXHRcdHdoaWxlIChydWxlID0gdGhpcy5ydWxlc1tpbmRleCsrXSkge1xuXHRcdFx0aWYgKHJ1bGUudGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQsIGVuZCkpIHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBGaW5kIGFsbCBydWxlcyB3aGljaCBtYXRjaCBhbmQgZGVsZWdhdGUgdG8gYGdldEJlc3RNYXRjaCgpYCB0byBwaWNrIHRoZSBiZXN0IG9uZS5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGxldCBtYXRjaGVzID0gW107XG5cdFx0bGV0IGluZGV4ID0gMCwgcnVsZSA9IHVuZGVmaW5lZDtcblx0XHR3aGlsZSAocnVsZSA9IHRoaXMucnVsZXNbaW5kZXgrK10pIHtcblx0XHRcdGxldCBtYXRjaCA9IHJ1bGUucGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0XHRcdGlmIChtYXRjaCkgbWF0Y2hlcy5wdXNoKG1hdGNoKTtcblx0XHR9XG5cblx0XHRpZiAoIW1hdGNoZXMubGVuZ3RoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gdW5jb21tZW50IHRoZSBiZWxvdyB0byBwcmludCBhbHRlcm5hdGl2ZXNcblx0XHQvLyBpZiAobWF0Y2hlcy5sZW5ndGggPiAxKSB7XG5cdFx0Ly9cdGNvbnNvbGUuaW5mbyh0aGlzLmFyZ3VtZW50IHx8IHRoaXMucnVsZU5hbWUsIG1hdGNoZXMsIG1hdGNoZXMubWFwKG1hdGNoID0+IG1hdGNoLm1hdGNoZWRUZXh0KSk7XG5cdFx0Ly8gfVxuXG5cdFx0bGV0IGJlc3RNYXRjaCA9IChtYXRjaGVzLmxlbmd0aCA9PT0gMSA/IG1hdGNoZXNbMF0gOiB0aGlzLmdldEJlc3RNYXRjaChtYXRjaGVzKSk7XG5cblx0XHQvLyBhc3NpZ24gYGFyZ05hbWVgIG9yIGBncm91cGAgZm9yIGByZXN1bHRzYFxuXHRcdGlmICh0aGlzLmFyZ3VtZW50KSBiZXN0TWF0Y2guYXJndW1lbnQgPSB0aGlzLmFyZ3VtZW50O1xuXHRcdGVsc2UgaWYgKHRoaXMuZ3JvdXApIGJlc3RNYXRjaC5ncm91cCA9IHRoaXMuZ3JvdXA7XG4vL1RPRE86IG90aGVyIHRoaW5ncyB0byBjb3B5IGhlcmU/Pz9cblxuXHRcdHJldHVybiBiZXN0TWF0Y2g7XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIFwiYmVzdFwiIG1hdGNoIGdpdmVuIG1vcmUgdGhhbiBvbmUgbWF0Y2hlcyBhdCB0aGUgaGVhZCBvZiB0aGUgdG9rZW5zLlxuXHQvLyBEZWZhdWx0IGlzIHRvIHJldHVybiB0aGUgbG9uZ2VzdCBtYXRjaC5cblx0Ly8gSW1wbGVtZW50IHNvbWV0aGluZyBlbHNlIHRvIGRvLCBlZywgcHJlY2VkZW5jZSBydWxlcy5cblx0Z2V0QmVzdE1hdGNoKG1hdGNoZXMpIHtcblx0XHRyZXR1cm4gbWF0Y2hlcy5yZWR1Y2UoZnVuY3Rpb24gKGJlc3QsIGN1cnJlbnQpIHtcblx0XHRcdGlmIChjdXJyZW50Lm5leHRTdGFydCA+IGJlc3QubmV4dFN0YXJ0KSByZXR1cm4gY3VycmVudDtcblx0XHRcdHJldHVybiBiZXN0O1xuXHRcdH0sIG1hdGNoZXNbMF0pO1xuXHR9XG5cblx0YWRkUnVsZSguLi5ydWxlKSB7XG5cdFx0dGhpcy5ydWxlcy5wdXNoKC4uLnJ1bGUpO1xuXHR9XG5cblx0dG9TeW50YXgoKSB7XG5cdCAgY29uc3QgcnVsZXMgPSB0aGlzLnJ1bGVzLm1hcChydWxlID0+IHJ1bGUudG9TeW50YXgoKSkuam9pbihcInxcIik7XG5cdFx0cmV0dXJuIGAoJHt0aGlzLmFyZ3VtZW50ID8gdGhpcy5hcmd1bWVudCtcIjpcIiA6IFwiXCJ9JHtydWxlc30pJHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcblx0fVxufTtcblxuXG4vLyBSZXBlYXRpbmcgcnVsZS5cbi8vXHRgdGhpcy5yZXBlYXRgIGlzIHRoZSBydWxlIHRoYXQgcmVwZWF0cy5cbi8vICBgdGhpcy5vcHRpb25hbGAgaXMgdHJ1ZSBpZiB0aGUgcHJvZHV0aW9uIGlzIG9wdGlvbmFsLlxuLy9cdE5vdGU6IEF1dG9tYXRpY2FsbHkgY29uc3VtZXMgd2hpdGVzcGFjZSBiZWZvcmUgcnVsZXMuXG4vL1x0Tm90ZTogUmV0dXJucyBgdW5kZWZpbmVkYCBpZiB3ZSBkb24ndCBtYXRjaCBhdCBsZWFzdCBvbmNlLlxuLy9cbi8vIEFmdGVyIG1hdGNoaW5nOlxuLy9cdGB0aGlzLm1hdGNoZWRgIGlzIGFycmF5IG9mIG1hdGNoZWQgcnVsZXMuXG4vLyAgYHJ1bGUubmV4dFN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RhcnQgdG9rZW4uXG5SdWxlLlJlcGVhdCA9IGNsYXNzIHJlcGVhdCBleHRlbmRzIFJ1bGUge1xuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0bGV0IG1hdGNoZWQgPSBbXTtcblx0XHRsZXQgbmV4dFN0YXJ0ID0gc3RhcnQ7XG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdGxldCBtYXRjaCA9IHRoaXMucmVwZWF0LnBhcnNlKHBhcnNlciwgdG9rZW5zLCBuZXh0U3RhcnQsIGVuZCwgc3RhY2spO1xuXHRcdFx0aWYgKCFtYXRjaCkgYnJlYWs7XG5cblx0XHRcdG1hdGNoZWQucHVzaChtYXRjaCk7XG5cdFx0XHRuZXh0U3RhcnQgPSBtYXRjaC5uZXh0U3RhcnQ7XG5cdFx0fVxuXG5cdFx0aWYgKG1hdGNoZWQubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZCxcblx0XHRcdG5leHRTdGFydFxuXHRcdH0pO1xuXHR9XG5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0aWYgKCF0aGlzLm1hdGNoZWQpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hlZC5tYXAobWF0Y2ggPT4gbWF0Y2gudG9Tb3VyY2UoKSk7XG5cdH1cblxuXHR0b1N5bnRheCgpIHtcblx0XHRsZXQgaXNDb21wb3VuZFJ1bGUgPSAodGhpcy5yZXBlYXQgaW5zdGFuY2VvZiBSdWxlLlNlcXVlbmNlKVxuICAgICAgfHwgKHRoaXMucmVwZWF0IGluc3RhbmNlb2YgUnVsZS5MaXRlcmFscyAmJiB0aGlzLnJlcGVhdC5saXRlcmFscy5sZW5ndGggPiAxKTtcbiAgICBjb25zdCByZXBlYXQgPSB0aGlzLnJlcGVhdC50b1N5bnRheCgpO1xuXHRcdGNvbnN0IHJ1bGUgPSBpc0NvbXBvdW5kUnVsZSA/IGAoJHtyZXBlYXR9KWAgOiBgJHtyZXBlYXR9YDtcblx0XHRyZXR1cm4gYCR7cnVsZX0ke3RoaXMub3B0aW9uYWwgPyAnKicgOiAnKyd9YDtcblx0fVxufVxuXG5cbi8vIExpc3QgbWF0Y2ggcnVsZTogICBgWzxpdGVtPjxkZWxpbWl0ZXI+XWAuIGVnXCIgYFt7bnVtYmVyfSxdYCB0byBtYXRjaCBgMSwyLDNgXG4vL1x0YHJ1bGUuaXRlbWAgaXMgdGhlIHJ1bGUgZm9yIGVhY2ggaXRlbSxcbi8vXHRgcnVsZS5kZWxpbWl0ZXJgIGlzIHRoZSBkZWxpbWl0ZXIgYmV0d2VlbiBlYWNoIGl0ZW0sIHdoaWNoIGlzIG9wdGlvbmFsIGF0IHRoZSBlbmQuXG4vL1xuLy8gQWZ0ZXIgbWF0Y2hpbmc6XG4vL1x0YHRoaXMubWF0Y2hlZGAgaXMgYXJyYXkgb2YgbWF0Y2hlZCBydWxlcy5cbi8vICBgcnVsZS5uZXh0U3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGFydCB0b2tlbi5cbi8vXG4vLyBOT1RFOiB3ZSBhc3N1bWUgdGhhdCBhIExpc3QgcnVsZSBpdHNlbGYgd2lsbCBOT1QgcmVwZWF0ICg/Pz8/KVxuUnVsZS5MaXN0ID0gY2xhc3MgbGlzdCBleHRlbmRzIFJ1bGUge1xuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0Ly8gZW5zdXJlIGl0ZW0gYW5kIGRlbGltaXRlciBhcmUgb3B0aW9uYWwgc28gd2UgZG9uJ3QgYmFyZiBpbiBgcGFyc2VSdWxlYFxuLy9UT0RPOiA/Pz9cblx0XHR0aGlzLml0ZW0ub3B0aW9uYWwgPSB0cnVlO1xuXHRcdHRoaXMuZGVsaW1pdGVyLm9wdGlvbmFsID0gdHJ1ZTtcblxuXHRcdGxldCBtYXRjaGVkID0gW107XG5cdFx0bGV0IG5leHRTdGFydCA9IHN0YXJ0O1xuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHQvLyBnZXQgbmV4dCBpdGVtLCBleGl0aW5nIGlmIG5vdCBmb3VuZFxuXHRcdFx0bGV0IGl0ZW0gPSB0aGlzLml0ZW0ucGFyc2UocGFyc2VyLCB0b2tlbnMsIG5leHRTdGFydCwgZW5kLCBzdGFjayk7XG5cdFx0XHRpZiAoIWl0ZW0pIGJyZWFrO1xuXG5cdFx0XHRtYXRjaGVkLnB1c2goaXRlbSk7XG5cdFx0XHRuZXh0U3RhcnQgPSBpdGVtLm5leHRTdGFydDtcblxuXHRcdFx0Ly8gZ2V0IGRlbGltaXRlciwgZXhpdGluZyBpZiBub3QgZm91bmRcblx0XHRcdGxldCBkZWxpbWl0ZXIgPSB0aGlzLmRlbGltaXRlci5wYXJzZShwYXJzZXIsIHRva2VucywgbmV4dFN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0XHRcdGlmICghZGVsaW1pdGVyKSBicmVhaztcblx0XHRcdG5leHRTdGFydCA9IGRlbGltaXRlci5uZXh0U3RhcnQ7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgd2UgZGlkbid0IGdldCBhbnkgbWF0Y2hlcywgZm9yZ2V0IGl0LlxuXHRcdGlmIChtYXRjaGVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQsXG5cdFx0XHRuZXh0U3RhcnRcblx0XHR9KTtcblx0fVxuXG5cdC8vIFJldHVybnMgbGlzdCBvZiB2YWx1ZXMgYXMgc291cmNlLlxuXHR0b1NvdXJjZSgpIHtcblx0XHRpZiAoIXRoaXMubWF0Y2hlZCkgcmV0dXJuIFtdO1xuXHRcdHJldHVybiB0aGlzLm1hdGNoZWQubWFwKCBtYXRjaCA9PiBtYXRjaC50b1NvdXJjZSgpICk7XG5cdH1cblxuXHR0b1N5bnRheCgpIHtcblx0ICBjb25zdCBpdGVtID0gdGhpcy5pdGVtLnRvU3ludGF4KCk7XG5cdCAgY29uc3QgZGVsaW1pdGVyID0gdGhpcy5kZWxpbWl0ZXIudG9TeW50YXgoKTtcblx0XHRyZXR1cm4gYFske3RoaXMuYXJndW1lbnQgPyB0aGlzLmFyZ3VtZW50K1wiOlwiIDogXCJcIn0ke2l0ZW19ICR7ZGVsaW1pdGVyfV0ke3RoaXMub3B0aW9uYWwgPyAnPycgOiAnJ31gO1xuXHR9XG59O1xuXG5cblxuLy8gQSBibG9jayBpcyB1c2VkIHRvIHBhcnNlIGEgbmVzdGVkIGJsb2NrIG9mIHN0YXRlbWVudHMuXG4vLyBBYnN0cmFjdCBjbGFzcy5cblJ1bGUuQmxvY2sgPSBjbGFzcyBibG9jayBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuXG5cdC8vIFBhcnNlIHRoZSBlbnRpcmUgYGJsb2NrYCwgcmV0dXJuaW5nIHJlc3VsdHMuXG5cdHBhcnNlQmxvY2socGFyc2VyLCBibG9jaywgaW5kZW50ID0gMCkge1xuXHRcdGxldCBtYXRjaGVkID0gW107XG4vL2NvbnNvbGUud2FybihcImJsb2NrOlwiLCBibG9jayk7XG5cdFx0YmxvY2suY29udGVudHMuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcblx0XHRcdGxldCByZXN1bHQ7XG5cdFx0XHRpZiAoaXRlbS5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0bWF0Y2hlZC5wdXNoKG5ldyBSdWxlLkJsYW5rTGluZSgpKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGl0ZW0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuQmxvY2spIHtcblx0XHRcdFx0bGV0IGxhc3QgPSBtYXRjaGVkW21hdGNoZWQubGVuZ3RoIC0gMV07XG5cdFx0XHRcdGlmIChsYXN0LnBhcnNlQmxvY2spIHtcblx0XHRcdFx0XHRsYXN0LnBhcnNlQmxvY2socGFyc2VyLCBpdGVtLCBpbmRlbnQgKyAxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRsZXQgYmxvY2sgPSB0aGlzLnBhcnNlQmxvY2socGFyc2VyLCBpdGVtLCBpbmRlbnQgKyAxKTtcblx0XHRcdFx0XHRpZiAoYmxvY2sgIT09IHVuZGVmaW5lZCkgbWF0Y2hlZC5wdXNoKGJsb2NrKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdG1hdGNoZWQgPSBtYXRjaGVkLmNvbmNhdCh0aGlzLnBhcnNlU3RhdGVtZW50KHBhcnNlciwgaXRlbSkpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIG5ldyBSdWxlLkJsb2NrKHtcblx0XHRcdGluZGVudCxcblx0XHRcdG1hdGNoZWRcblx0XHR9KTtcblx0fVxuXG5cdC8vIFBhcnNlIGEgc2luZ2xlIHN0YXRlbWVudCAoYSBsaW5lJ3Mgd29ydGggb2YgYHRva2Vuc2ApLlxuXHQvLyBTa2lwcyB3aGl0ZXNwYWNlIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmUuXG5cdC8vIEF1dG8tbWF0Y2hlcyBjb21tZW50IGluIHRoZSBtaWRkbGUgb2YgdGhlIGxpbmUuXG5cdC8vIFJldHVybnMgYXJyYXkgb2YgcmVzdWx0cy5cblx0cGFyc2VTdGF0ZW1lbnQocGFyc2VyLCB0b2tlbnMpIHtcblx0XHRsZXQgcmVzdWx0cyA9IFtdO1xuXHRcdGxldCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGg7XG5cdFx0bGV0IHN0YXRlbWVudCwgY29tbWVudDtcblxuXHRcdC8vIGNoZWNrIGZvciBhbiBpbmRlbnQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBsaW5lXG5cdFx0aWYgKHRva2Vuc1tzdGFydF0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuV2hpdGVzcGFjZSkgc3RhcnQrKztcblxuXHRcdC8vIGNoZWNrIGZvciBhIGNvbW1lbnQgYXQgdGhlIGVuZCBvZiB0aGUgdG9rZW5zXG5cdFx0aWYgKHRva2Vuc1tlbmQtMV0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuQ29tbWVudCkge1xuXHRcdFx0Y29tbWVudCA9IHBhcnNlci5wYXJzZU5hbWVkUnVsZShcImNvbW1lbnRcIiwgdG9rZW5zLCBlbmQtMSwgZW5kLCB1bmRlZmluZWQsIFwicGFyc2VTdGF0ZW1lbnRcIik7XG5cdFx0XHQvLyBhZGQgY29tbWVudCBGSVJTVCBpZiBmb3VuZFxuXHRcdFx0cmVzdWx0cy5wdXNoKGNvbW1lbnQpO1xuXHRcdFx0ZW5kLS07XG5cdFx0fVxuXG5cdFx0Ly8gcGFyc2UgdGhlIHJlc3QgYXMgYSBcInN0YXRlbWVudFwiXG5cdFx0c3RhdGVtZW50ID0gcGFyc2VyLnBhcnNlTmFtZWRSdWxlKFwic3RhdGVtZW50XCIsIHRva2Vucywgc3RhcnQsIGVuZCwgdW5kZWZpbmVkLCBcInBhcnNlU3RhdGVtZW50XCIpO1xuXHRcdC8vIGNvbXBsYWluIGlmIG5vIHN0YXRlbWVudCBhbmQgbm8gY29tbWVudFxuXHRcdGlmICghc3RhdGVtZW50ICYmICFjb21tZW50KSB7XG5cdFx0XHRsZXQgZXJyb3IgPSBuZXcgUnVsZS5TdGF0ZW1lbnRQYXJzZUVycm9yKHtcblx0XHRcdFx0dW5wYXJzZWQ6IHRva2Vucy5zbGljZShzdGFydCwgZW5kKS5qb2luKFwiIFwiKVxuXHRcdFx0fSk7XG5cdFx0XHRyZXN1bHRzLnB1c2goZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8vIGNvbXBsYWluIGlmIHdlIGNhbid0IHBhcnNlIHRoZSBlbnRpcmUgbGluZSFcblx0XHRlbHNlIGlmIChzdGF0ZW1lbnQgJiYgc3RhdGVtZW50Lm5leHRTdGFydCAhPT0gZW5kKSB7XG5cdFx0XHRsZXQgZXJyb3IgPSBuZXcgUnVsZS5TdGF0ZW1lbnRQYXJzZUVycm9yKHtcblx0XHRcdFx0cGFyc2VkIDogdG9rZW5zLnNsaWNlKHN0YXJ0LCBzdGF0ZW1lbnQubmV4dFN0YXJ0KS5qb2luKFwiIFwiKSxcblx0XHRcdFx0dW5wYXJzZWQgOiB0b2tlbnMuc2xpY2Uoc3RhdGVtZW50Lm5leHRTdGFydCwgZW5kKS5qb2luKFwiIFwiKVxuXHRcdFx0fSk7XG5cdFx0XHRyZXN1bHRzLnB1c2goZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8vIE90aGVyd2lzZSBhZGQgdGhlIHN0YXRlbWVudFxuXHRcdGVsc2UgaWYgKHN0YXRlbWVudCkge1xuXHRcdFx0cmVzdWx0cy5wdXNoKHN0YXRlbWVudCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdHM7XG5cdH1cblxuXHQvLyBSZXR1cm4gc291cmNlIGZvciB0aGlzIGJsb2NrIGFzIGFuIGFycmF5IG9mIGluZGVudGVkIGxpbmVzIFdJVEhPVVQgYHtgIE9SIGB9YC5cblx0YmxvY2tUb1NvdXJjZShibG9jayA9IHRoaXMubWF0Y2hlZCkge1xuXHRcdGxldCByZXN1bHRzID0gW10sIHN0YXRlbWVudDtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYmxvY2subGVuZ3RoOyBpKyspIHtcblx0XHRcdGxldCBtYXRjaCA9IGJsb2NrW2ldO1xuICAgICAgLy9jb25zb2xlLmluZm8oaSwgbWF0Y2gpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHN0YXRlbWVudCA9IG1hdGNoLnRvU291cmNlKCkgfHwgXCJcIjtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgY29uc29sZS53YXJuKFwiRXJyb3IgY29udmVydGluZyBibG9jazogXCIsIGJsb2NrLCBcInN0YXRlbWVudDpcIiwgbWF0Y2gpO1xuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmluZm8oaSwgc3RhdGVtZW50KTtcblx0XHRcdGlmIChpc1doaXRlc3BhY2Uoc3RhdGVtZW50KSkge1xuXHRcdFx0XHRyZXN1bHRzLnB1c2goXCJcIik7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChBcnJheS5pc0FycmF5KHN0YXRlbWVudCkpIHtcblx0XHRcdFx0cmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHN0YXRlbWVudCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2Ygc3RhdGVtZW50ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHN0YXRlbWVudCA9IHN0YXRlbWVudC5zcGxpdChcIlxcblwiKTtcblx0XHRcdFx0cmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHN0YXRlbWVudCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKFwiYmxvY2tUb1NvdXJjZSgpOiBET04nVCBLTk9XIEhPVyBUTyBXT1JLIFdJVEhcXG5cXHRcIiwgc3RhdGVtZW50LCBcIlxcblxcdGZyb20gbWF0Y2hcIiwgbWF0Y2gpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAodGhpcy5pbmRlbnQgIT09IDApIHtcblx0XHRcdHJldHVybiBcIlxcdFwiICsgcmVzdWx0cy5qb2luKFwiXFxuXFx0XCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0cy5qb2luKFwiXFxuXCIpO1xuXHR9XG5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0cmV0dXJuIFwiIHtcXG5cIiArIHRoaXMuYmxvY2tUb1NvdXJjZSgpICsgXCJcXG5cIiArIFwifVwiO1xuXHR9XG5cblx0Ly8gQ29udmVydCB0byBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHN0cnVjdHVyZSBieSBjb252ZXJ0aW5nIGluZGl2aWR1YWwgc3RhdGVtZW50cyBhbmQgZ3JvdXBpbmdcblx0Ly8gTk9URTogeW91IHNob3VsZCBvdmVycmlkZSB0aGlzIGFuZCBpbmNsdWRlIFwidHlwZVwiXG5cdHRvU3RydWN0dXJlKCkge1xuXHRcdGxldCB7IG5hbWUsIHN1cGVyVHlwZSB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKCk7XG5cdFx0bGV0IGJsb2NrID0gKHRoaXMuYmxvY2sgJiYgdGhpcy5ibG9jay5tYXRjaGVkKSB8fCBbXTtcblxuXHRcdGxldCBuYW1lZCA9IHt9O1xuXHRcdGxldCBwcm9wZXJ0aWVzID0gW107XG5cdFx0bGV0IG1ldGhvZHMgPSBbXTtcblx0XHRsZXQgb3RoZXIgPSBbXTtcblx0XHRibG9jay5tYXAoc3RhdGVtZW50ID0+IHN0YXRlbWVudC50b1N0cnVjdHVyZSgpKVxuXHRcdFx0IC5maWx0ZXIoQm9vbGVhbilcblx0XHRcdCAuZm9yRWFjaChhZGRTdHJ1Y3R1cmUpO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHR5cGU6IFwidW5rbm93blwiLFxuXHRcdFx0bmFtZSxcblx0XHRcdHN1cGVyVHlwZSxcblx0XHRcdG5hbWVkLFxuXHRcdFx0cHJvcGVydGllcyxcblx0XHRcdG1ldGhvZHMsXG5cdFx0XHRvdGhlclxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGFkZFN0cnVjdHVyZShzdHJ1Y3R1cmUpIHtcblx0XHRcdC8vIGFkZCBhcnJheXMgYXMgaW5kaXZpZHVhbCBpdGVtc1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoc3RydWN0dXJlKSkgcmV0dXJuIHN0cnVjdHVyZS5mb3JFYWNoKGFkZFN0cnVjdHVyZSk7XG5cblx0XHRcdC8vIGFkZCB1bmRlciBgbmFtZWRgIGZvciBxdWljayBoaXQgb2YgYWxsIHNpZ25pZmljYW50IGJpdHMuLi5cblx0XHRcdGlmIChzdHJ1Y3R1cmUubmFtZSkgbmFtZWRbc3RydWN0dXJlLm5hbWVdID0gc3RydWN0dXJlO1xuXG5cdFx0XHQvLyBhZGQgdW5kZXIgJ21ldGhvZHMnLCAncHJvcGVydGllcycgb3IgJ290aGVyJ1xuXHRcdFx0aWYgKHN0cnVjdHVyZS50eXBlID09PSBcImZ1bmN0aW9uXCIpIG1ldGhvZHMucHVzaChzdHJ1Y3R1cmUpO1xuXHRcdFx0ZWxzZSBpZiAoc3RydWN0dXJlLnR5cGUgPT09IFwicHJvcGVydHlcIikgcHJvcGVydGllcy5wdXNoKHN0cnVjdHVyZSk7XG5cdFx0XHRlbHNlIG90aGVyLnB1c2goc3RydWN0dXJlKTtcblx0XHR9XG5cdH1cblxuXHQvLyBGb3JtYXQgYXJyYXkgb2YgYHN0YXRlbWVudHNgIGFzIGEgSlMgb3V0cHV0IGJsb2NrOlxuXHQvL1x0LSBpZiBgc3RhdGVtZW50c2AgaXMgZW1wdHksIHJldHVybnMgYHt9YFxuXHQvL1x0LSBpZiBgc3RhdGVtZW50cyBpcyBhIHNpbmdsZSBsaW5lLCByZXR1cm5zIGB7IHN0YXRlbWVudCB9YFxuXHQvL1x0LSBlbHNlIHJldHVybnMgbXVsdGlwbGUgbGluZXNcblx0c3RhdGljIGVuY2xvc2VTdGF0ZW1lbnRzKC4uLmFyZ3MpIHtcblx0XHR2YXIgc3RhdGVtZW50cyA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGV0IGFyZyA9IGFyZ3NbaV07XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XG5cdFx0XHRcdHN0YXRlbWVudHMgPSBzdGF0ZW1lbnRzLmNvbmNhdChhcmcpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodHlwZW9mIGFyZyA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRzdGF0ZW1lbnRzLnB1c2goYXJnKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0c3RhdGVtZW50cyA9IHN0YXRlbWVudHMuam9pbihcIlxcblwiKTtcblxuXHRcdGlmICghc3RhdGVtZW50cykgcmV0dXJuIFwie31cIjtcblx0XHRpZiAoIXN0YXRlbWVudHMuaW5jbHVkZXMoXCJcXG5cIikgJiYgc3RhdGVtZW50cy5sZW5ndGggPCA0MCkge1xuXHRcdFx0cmV0dXJuIGB7ICR7c3RhdGVtZW50cy50cmltKCl9IH1gO1xuXHRcdH1cblx0XHRpZiAoc3RhdGVtZW50c1swXSAhPT0gXCJcXHRcIikgc3RhdGVtZW50cyA9IGBcXHQke3N0YXRlbWVudHN9YDtcblx0XHRyZXR1cm4gYHtcXG4ke3N0YXRlbWVudHN9XFxufWA7XG5cdH1cblxufVxuXG5cbi8vIGBTdGF0ZW1lbnRzYCBhcmUgYSBzcGVjaWFsIGNhc2UgZm9yIGEgYmxvY2sgb2YgYFN0YXRlbWVudGAgcnVsZXNcbi8vXHR0aGF0IHVuZGVyc3RhbmQgbmVzdGluZyBhbmQgY29tbWVudHMuXG4vL1xuLy8gVGhpcyBpcyBhIHRvcC1sZXZlbCBjb25zdHJ1Y3QsIGUuZy4gdXNlZCB0byBwYXJzZSBhbiBlbnRpcmUgZmlsZS5cblJ1bGUuU3RhdGVtZW50cyA9IGNsYXNzIHN0YXRlbWVudHMgZXh0ZW5kcyBSdWxlLkJsb2NrIHtcblxuXHQvLyBTcGxpdCBzdGF0ZW1lbnRzIHVwIGludG8gYmxvY2tzIGFuZCBwYXJzZSAnZW0uXG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGgsIHN0YWNrKSB7XG5cdFx0dmFyIGJsb2NrID0gVG9rZW5pemVyLmJyZWFrSW50b0Jsb2Nrcyh0b2tlbnMsIHN0YXJ0LCBlbmQpO1xuXG5cdFx0bGV0IG1hdGNoZWQgPSB0aGlzLnBhcnNlQmxvY2socGFyc2VyLCBibG9jayk7XG5cdFx0aWYgKCFtYXRjaGVkKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZCxcblx0XHRcdG5leHRTdGFydDogZW5kXG5cdFx0fSk7XG5cdH1cblxuXHQvLyBPdXRwdXQgc3RhdGVtZW50cyBXSVRIT1VUIGN1cmx5IGJyYWNlcyBhcm91bmQgdGhlbS5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hlZC5ibG9ja1RvU291cmNlKCk7XG5cdH1cbn1cblxuXG4vLyBBIGBCbG9ja1N0YXRlbWVudGAgKGUuZy4gYW4gYGlmYCBvciBgcmVwZWF0YCk6XG4vL1x0LSBpcyBhc3N1bWVkIHRvIGhhdmUgYW4gaW5pdGlhbCBwYXJ0aWFsIGBzdGF0ZW1lbnRgXG4vL1x0LSBNQVkgaGF2ZSBhbiBpbmxpbmUgYHN0YXRlbWVudGAgKG9uIHRoZSBzYW1lIGxpbmUsIHBvc3NpYmx5IGFmdGVyIGEgYDpgKVxuLy9cdC0gTUFZIGhhdmUgY29udGVudHMgYXMgYW4gZW1iZWRkZWQgYGJsb2NrYFxuLy9cbi8vXHRJbiB5b3VyIGBnZXRNYXRjaGVkU291cmNlKClgLCBgYmxvY2tgIHdpbGwgYmUgdGhlIHJlc3VsdGluZyBibG9jayBvdXRwdXQsIGlmIHRoZXJlIGlzIG9uZS5cbi8vXHRJdCdzIHVwIHRvIHlvdXIgcnVsZSB0byBkbyBzb21ldGhpbmcgd2l0aCBpdC4uLlxuUnVsZS5CbG9ja1N0YXRlbWVudCA9IGNsYXNzIGJsb2NrX3N0YXRlbWVudCBleHRlbmRzIFJ1bGUuQmxvY2sge1xuXG5cdC8vIFBhcnNlIGEgYmxvY2sgYW5kIGFkZCBpdCB0byBgdGhpcy5ibG9ja2Bcblx0cGFyc2VCbG9jayhwYXJzZXIsIGJsb2NrLCBpbmRlbnQgPSAwKSB7XG5cdFx0dGhpcy5ibG9jayA9IHN1cGVyLnBhcnNlQmxvY2soLi4uYXJndW1lbnRzKTtcblx0fVxuXG5cdC8vIFJldHVybiBgdG9Tb3VyY2UoKWAgZm9yIG91ciBgcmVzdWx0c2AgYXMgYSBtYXAuXG5cdC8vIElmIHlvdSBwYXNzIGBrZXlzYCwgd2UnbGwgcmVzdHJpY3QgdG8ganVzdCB0aG9zZSBrZXlzLlxuXHRnZXRNYXRjaGVkU291cmNlKCkge1xuXHRcdGxldCBvdXRwdXQgPSBzdXBlci5nZXRNYXRjaGVkU291cmNlKCk7XG5cdFx0Ly8gYWRkIGBibG9ja2AgdG8gb3V0cHV0IGlmIGRlZmluZWQuXG5cdFx0aWYgKHRoaXMuYmxvY2spIHtcblx0XHRcdG91dHB1dC5ibG9jayA9IHRoaXMuYmxvY2suYmxvY2tUb1NvdXJjZSgpO1xuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG59XG5cblxuLy8gQmxhbmsgbGluZSByZXByZXNlbnRhdGlvbiBpbiBwYXJzZXIgb3V0cHV0LlxuUnVsZS5CbGFua0xpbmUgPSBjbGFzcyBibGFua19saW5lIGV4dGVuZHMgUnVsZSB7XG5cdHRvU291cmNlKCkge1xuXHRcdHJldHVybiBcIlxcblwiO1xuXHR9XG59XG5cbi8vIENvbW1lbnQgcnVsZSAtLSBtYXRjaGVzIHRva2VucyBvZiB0eXBlIGBUb2tlbml6ZXIuQ29tbWVudGAuXG5SdWxlLkNvbW1lbnQgPSBjbGFzcyBjb21tZW50IGV4dGVuZHMgUnVsZSB7XG5cdC8vIENvbW1lbnRzIGFyZSBzcGVjaWFsIG5vZGVzIGluIG91ciB0b2tlbiBzdHJlYW0uXG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHRsZXQgdG9rZW4gPSB0b2tlbnNbc3RhcnRdO1xuXHRcdGlmICghKHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLkNvbW1lbnQpKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQ6IHRva2VuLFxuXHRcdFx0bmV4dFN0YXJ0OiBzdGFydCArIDFcblx0XHR9KTtcblx0fVxuXG5cdHRvU291cmNlKCkge1xuXHRcdHJldHVybiBgLy8ke3RoaXMubWF0Y2hlZC53aGl0ZXNwYWNlfSR7dGhpcy5tYXRjaGVkLmNvbW1lbnR9YDtcblx0fVxufVxuXG4vLyBQYXJzZXIgZXJyb3IgcmVwcmVzZW50YXRpb24gaW4gcGFyc2VyIG91dHB1dC5cblJ1bGUuU3RhdGVtZW50UGFyc2VFcnJvciA9IGNsYXNzIHBhcnNlX2Vycm9yIGV4dGVuZHMgUnVsZSB7XG5cdGNvbnN0cnVjdG9yKC4uLnByb3BzKSB7XG5cdFx0c3VwZXIoLi4ucHJvcHMpO1xuXHRcdGlmIChQYXJzZXIuV0FSTikgY29uc29sZS53YXJuKHRoaXMubWVzc2FnZSk7XG5cdH1cblxuXHRnZXQgbWVzc2FnZSgpIHtcblx0XHRpZiAodGhpcy5wYXJzZWQpIHtcblx0XHRcdHJldHVybiBcIkNBTlQgUEFSU0UgRU5USVJFIFNUQVRFTUVOVFxcblwiXG5cdFx0XHRcdCArIFwiUEFSU0VEICAgICAgOiBgXCIrIHRoaXMucGFyc2VkICsgXCJgXFxuXCJcblx0XHRcdFx0ICsgXCJDQU4nVCBQQVJTRSA6IGBcIisgdGhpcy51bnBhcnNlZCArIFwiYFwiO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJDQU4nVCBQQVJTRSBTVEFURU1FTlQ6IGBcIiArIHRoaXMudW5wYXJzZWQgKyBcImBcIjtcblx0fVxuXG5cdHRvU291cmNlKCkge1xuXHRcdHJldHVybiBcIi8vIFwiICsgdGhpcy5tZXNzYWdlLnNwbGl0KFwiXFxuXCIpLmpvaW4oXCJcXG4vLyBcIik7XG5cdH1cbn1cblxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvUnVsZS5qcyIsImltcG9ydCB7IGRlZmluZU1lbW9pemVkIH0gZnJvbSBcIi4vbWVtb2l6ZS5qc1wiO1xuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi9QYXJzZXIuanNcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuL1J1bGUuanNcIjtcbmltcG9ydCB7IGNsb25lQ2xhc3MgfSBmcm9tIFwiLi91dGlscy9jbGFzcy5qc1wiO1xuaW1wb3J0IGdsb2JhbCBmcm9tIFwiLi91dGlscy9nbG9iYWwuanNcIjtcblxuXG5cbi8vXG4vL1x0IyBQYXJzaW5nIGBydWxlU3ludGF4YCB0byBjcmVhdGUgcnVsZXMgYXV0b21hdGljYWxseS5cbi8vXG4vLyBUT0RPOlx0QmV0dGVyIG5hbWUgZm9yIGBydWxlU3ludGF4YFxuLy8gVE9ETzpcdFVzZSBrZXl3b3JkcyBpbiBzeW50YXggdG8gbWFrZSBhIHF1aWNrIHJlZ2V4LWJhc2VkIGB0ZXN0YCBmdW5jdGlvbiBmb3IgdGhlIGVudGlyZSBydWxlXG5cbi8vXG4vLyAjIyBncm91cDogcGFyc2luZyBzeW50YXhcbi8vXG5cbi8vVE9ET0NcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlUnVsZShzeW50YXgsIGNvbnN0cnVjdG9yKSB7XG4gIC8vIElmIHdlIGdvdCBhbiBhcnJheSBvZiBwb3NzaWJsZSBzeW50YXhlcy4uLlxuICBpZiAoQXJyYXkuaXNBcnJheShzeW50YXgpKSB7XG4gICAgLy8gcmVjdXJzaXZlbHkgcGFyc2UgZWFjaCBzeW50YXgsIHVzaW5nIGEgQ0xPTkUgb2YgdGhlIGNvbnN0cnVjdG9yXG4gICAgY29uc3QgcnVsZXMgPSBzeW50YXgubWFwKHN5bnRheCA9PiBwYXJzZVJ1bGUoc3ludGF4LCBjbG9uZUNsYXNzKGNvbnN0cnVjdG9yKSkgKTtcbiAgICAvLyByZXR1cm4gYW4gYWx0ZXJuYXRpdmVzIHdpdGggdGhlIGNvcnJlY3QgbmFtZVxuICAgIGNvbnN0IGFsdENsYXNzID0gY2xvbmVDbGFzcyhSdWxlLkFsdGVybmF0aXZlcywgY29uc3RydWN0b3IubmFtZSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGFsdENsYXNzLnByb3RvdHlwZSwgXCJydWxlc1wiLCB7IHZhbHVlOiBydWxlcyB9KTtcbiAgICByZXR1cm4gbmV3IGFsdENsYXNzKCk7XG4gIH07XG5cbiAgbGV0IHJ1bGVzID0gcGFyc2VTeW50YXgoc3ludGF4LCBbXSk7XG4gIGlmIChydWxlcy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYHBhcnNlci5kZWZpbmVSdWxlKCR7bmFtZXNbMF19LCAke3N5bnRheH0pOiBubyBydWxlIHByb2R1Y2VkYCk7XG4gIH1cblxuICAvLyBNYWtlIGFuIGluc3RhbmNlIG9mIHRoZSBydWxlIGFuZCBhZGQgcmVsZXZhbnQgcHJvcGVydGllcyB0byBpdHMgcHJvdG90eXBlIG5vbi1lbnVtZXJhYmx5XG4gIGlmIChjb25zdHJ1Y3Rvci5wcm90b3R5cGUgaW5zdGFuY2VvZiBSdWxlLktleXdvcmRzXG4gICB8fCBjb25zdHJ1Y3Rvci5wcm90b3R5cGUgaW5zdGFuY2VvZiBSdWxlLlN5bWJvbHNcbiAgIHx8IGNvbnN0cnVjdG9yLnByb3RvdHlwZSBpbnN0YW5jZW9mIFJ1bGUuTGlzdFxuICAgfHwgY29uc3RydWN0b3IucHJvdG90eXBlIGluc3RhbmNlb2YgUnVsZS5BbHRlcm5hdGl2ZXNcbiAgKSB7XG4gICAgZm9yIChsZXQgcHJvcGVydHkgaW4gcnVsZXNbMF0pIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3BlcnR5LCB7IHZhbHVlOiBydWxlc1swXVtwcm9wZXJ0eV0gfSk7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb25zdHJ1Y3Rvci5wcm90b3R5cGUsIFwicnVsZXNcIiwgeyB2YWx1ZTogcnVsZXMgfSk7XG4gIH1cblxuICByZXR1cm4gbmV3IGNvbnN0cnVjdG9yKCk7XG59XG5cbmZ1bmN0aW9uIHRva2VuaXNlUnVsZVN5bnRheChzeW50YXgpIHtcbiAgY29uc3QgU1lOVEFYX0VYUFJFU1NJT04gPSAvKD86W1xcd1xcLV0rfFxcXFxbXFxbXFwoXFx7XFwpXFx9XFxdXXxbXlxcc1xcd118XFx8KS9nO1xuICBsZXQgc3ludGF4U3RyZWFtID0gc3ludGF4Lm1hdGNoKFNZTlRBWF9FWFBSRVNTSU9OKTtcbiAgaWYgKCFzeW50YXhTdHJlYW0pIHRocm93IG5ldyBTeW50YXhFcnJvcihgQ2FuJ3QgdG9rZW5pemUgcGFyc2UgcnVsZSBzeW50YXggPj4ke3N5bnRheH08PGApO1xuICByZXR1cm4gc3ludGF4U3RyZWFtO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTeW50YXgoc3ludGF4LCBydWxlcyA9IFtdLCBzdGFydCA9IDApIHtcbiAgaWYgKHN5bnRheCA9PSBudWxsKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwicGFyc2VTeW50YXgoKTogYHN5bnRheGAgaXMgcmVxdWlyZWRcIik7XG4gIGNvbnN0IHN5bnRheFN0cmVhbSA9IHR5cGVvZiBzeW50YXggPT09IFwic3RyaW5nXCJcbiAgICA/IHRva2VuaXNlUnVsZVN5bnRheChzeW50YXgpXG4gICAgOiBzeW50YXg7XG5cbiAgbGV0IGxhc3RJbmRleCA9IHN5bnRheFN0cmVhbS5sZW5ndGg7XG4gIHdoaWxlIChzdGFydCA8IGxhc3RJbmRleCkge1xuICAgIGxldCBbIHJ1bGUsIGVuZCBdID0gcGFyc2VUb2tlbihzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgaWYgKHJ1bGUpIHtcbiAgICAgIGxldCBsYXN0ID0gcnVsZXNbcnVsZXMubGVuZ3RoLTFdO1xuICAgICAgLy8gSWYgdGhpcyBpcyBhIGBTeW1ib2xgIGFuZCBsYXN0IHdhcyBhIGBTeW1ib2xgLCBtZXJnZSB0b2dldGhlclxuICAgICAgaWYgKGxhc3QgJiYgbGFzdCBpbnN0YW5jZW9mIFJ1bGUuU3ltYm9scyAmJiBydWxlIGluc3RhbmNlb2YgUnVsZS5TeW1ib2xzKSB7XG4gICAgICAgIC8vIHJlbW92ZSB0aGUgbGFzdCBydWxlXG4gICAgICAgIHJ1bGVzLnBvcCgpO1xuICAgICAgICAvLyBhbmQgcmVwbGFjZSB3aXRoIGEgcnVsZSB0aGF0IG1lcmdlcyB0aGUga2V5d29yZHNcbiAgICAgICAgcnVsZS5saXRlcmFscyA9IGxhc3QubGl0ZXJhbHMuY29uY2F0KHJ1bGUubGl0ZXJhbHMpO1xuICAgICAgfVxuICAgICAgcnVsZXMucHVzaChydWxlKTtcbiAgICB9XG4gICAgc3RhcnQgPSBlbmQgKyAxO1xuICB9XG4gIHJldHVybiBydWxlcztcbn1cblxuY29uc3QgS0VZV09SRF9QQVRURVJOID0gL1tBLVphLXpdW1xcd18tXSovO1xuZnVuY3Rpb24gcGFyc2VUb2tlbihzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCkge1xuICBsZXQgc3ludGF4VG9rZW4gPSBzeW50YXhTdHJlYW1bc3RhcnRdO1xuXG4gIC8vIGlmIHdlIGdvdCBhIFwiXFxcXFwiICh3aGljaCBhbHNvIGhhcyB0byBnbyBpbnRvIHRoZSBzb3VyY2Ugc3RyaW5nIGFzIFwiXFxcXFwiKVxuICAvLyB0cmVhdCB0aGUgbmV4dCB0b2tlbiBhcyBhIGxpdGVyYWwgc3RyaW5nIHJhdGhlciB0aGFuIGFzIGEgc3BlY2lhbCBjaGFyYWN0ZXIuXG4gIGlmIChzeW50YXhUb2tlbiA9PT0gXCJcXFxcXCIpIHtcbiAgICByZXR1cm4gcGFyc2VTeW1ib2woc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQgKyAxKTtcbiAgfVxuXG4gIHN3aXRjaCAoc3ludGF4VG9rZW4pIHtcbiAgICBjYXNlIFwie1wiOlx0cmV0dXJuIHBhcnNlU3VicnVsZShzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgY2FzZSBcIihcIjpcdHJldHVybiBwYXJzZUFsdGVybmF0aXZlcyhzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgY2FzZSBcIltcIjpcdHJldHVybiBwYXJzZUxpc3Qoc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuICAgIGNhc2UgXCIqXCI6XG4gICAgY2FzZSBcIitcIjpcbiAgICBjYXNlIFwiP1wiOlx0cmV0dXJuIHBhcnNlUmVwZWF0KHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcblxuICAgIC8vIHRoZSBmb2xsb3dpbmcgc2hvdWxkIEFMV0FZUyBiZSBjb25zdW1lZCBieSB0aGUgYWJvdmVcbiAgICBjYXNlIFwifVwiOlxuICAgIGNhc2UgXCIpXCI6XG4gICAgY2FzZSBcIl1cIjpcbiAgICBjYXNlIFwifFwiOlxuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkICR7c3ludGF4VG9rZW59IGZvdW5kIGFzIGl0ZW0gJHtzdGFydH0gb2YgJHtzeW50YXhTdHJlYW19YCk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgaWYgKHN5bnRheFRva2VuLm1hdGNoKEtFWVdPUkRfUEFUVEVSTikpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlS2V5d29yZChzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlU3ltYm9sKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICAgIH1cbiAgfVxufVxuXG5cbi8vIE1hdGNoIGBrZXl3b3JkYCBpbiBzeW50YXggcnVsZXMuXG4vLyBJZiBtb3JlIHRoYW4gb25lIGtleXdvcmQgYXBwZWFycyBpbiBhIHJvdywgY29tYmluZXMgdGhlbSBpbnRvIGEgc2luZ2xlIGBLZXl3b3JkYCBvYmplY3QuXG4vLyBUaGlzIGlzIHByZXR0eSBzYWZlLCB1bmxlc3MgeW91IGhhdmUgYW4gb3B0aW9uYWwga2V5d29yZCBsaWtlXG4vL1x0XHRgdGhlIHtpZGVudGlmaWVyfSBvZiB0aGU/IHtleHByZXNzaW9ufWBcbi8vIGluIHdoaWNoIGNhc2UgeW91IGNhbiBwdXQgdGhlIG9wdGlvbmFsIGtleXdvcmQgaW4gcGFyZW5zXG4vL1x0XHRgdGhlIHtpZGVudGlmaWVyfSBvZiAodGhlPykge2V4cHJlc3Npb259YFxuLy9cbi8vIFJldHVybnMgYFsgcnVsZSwgZW5kIF1gXG4vLyBUaHJvd3MgaWYgaW52YWxpZC5cbmZ1bmN0aW9uIHBhcnNlS2V5d29yZChzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCwgY29uc3RydWN0b3IgPSBSdWxlLktleXdvcmRzKSB7XG4gIGxldCBsaXRlcmFscyA9IFtdLCBlbmQ7XG4gIC8vIGVhdCBrZXl3b3JkcyB3aGlsZSB0aGV5IGxhc3RcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgc3ludGF4U3RyZWFtLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IG5leHQgPSBzeW50YXhTdHJlYW1baV07XG4gICAgaWYgKHR5cGVvZiBuZXh0ID09PSBcInN0cmluZ1wiICYmIG5leHQubWF0Y2goS0VZV09SRF9QQVRURVJOKSkge1xuICAgICAgbGl0ZXJhbHMucHVzaChuZXh0KTtcbiAgICAgIGVuZCA9IGk7XG4gICAgfVxuICAgIGVsc2UgYnJlYWs7XG4gIH1cblxuICBsZXQgcnVsZSA9IG5ldyBjb25zdHJ1Y3Rvcih7IGxpdGVyYWxzIH0pO1xuICByZXR1cm4gWyBydWxlLCBlbmQgXTtcbn1cblxuLy8gTWF0Y2ggYGtleXdvcmRgIGluIHN5bnRheCBydWxlcy5cbi8vIFJldHVybnMgYFsgcnVsZSwgZW5kIF1gXG4vLyBUaHJvd3MgaWYgaW52YWxpZC5cbmZ1bmN0aW9uIHBhcnNlU3ltYm9sKHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwLCBjb25zdHJ1Y3RvciA9IFJ1bGUuU3ltYm9scykge1xuICBsZXQgc3RyaW5nID0gc3ludGF4U3RyZWFtW3N0YXJ0XTtcbiAgaWYgKCFjb25zdHJ1Y3RvcikgY29uc3RydWN0b3IgPSBSdWxlLlN5bWJvbHM7XG5cbiAgLy8gSWYgc3RyaW5nIHN0YXJ0cyB3aXRoIGBcXFxcYCwgaXQncyBhbiBlc2NhcGVkIGxpdGVyYWwgKGVnOiBgXFxbYCBuZWVkcyB0byBpbnB1dCBhcyBgXFxcXFtgKS5cbiAgbGV0IGlzRXNjYXBlZCA9IHN0cmluZy5zdGFydHNXaXRoKFwiXFxcXFwiKTtcbiAgbGV0IGxpdGVyYWxzID0gaXNFc2NhcGVkID8gc3RyaW5nLnN1YnN0cigxKSA6IHN0cmluZztcblxuICBsZXQgcnVsZSA9IG5ldyBjb25zdHJ1Y3Rvcih7IGxpdGVyYWxzIH0pO1xuXG4gIGlmIChpc0VzY2FwZWQpIHtcbiAgICBydWxlLnRvU3ludGF4ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYFxcXFwke2xpdGVyYWxzfSR7dGhpcy5vcHRpb25hbCA/ICc/JyA6ICcnfWA7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFsgcnVsZSwgc3RhcnQgXTtcbn1cblxuXG4vLyBNYXRjaCBncm91cGluZyBleHByZXNzaW9uIGAoLi4ufC4uLilgIGluIHN5bnRheCBydWxlcy5cbi8vIFJldHVybnMgYFsgcnVsZSwgZW5kIF1gXG4vLyBZb3UgY2FuIHNwZWNpZnkgYW4gZXhwbGljaXQgYHJ1bGUuYXJndW1lbnRgIHdpdGg6ICBgKHNvbWVhcmc6Li4uKWBcbi8vIFlvdSBjYW4gc3BlY2lmeSB0aGF0IHRoZSByZXN1bHRzIHNob3VsZCBiZSBgcHJvbW90ZWRgIHRvIGVuY2xvc2luZyBydWxlIHdpdGg6IGAoPzouLi4pYFxuLy9cbi8vIE5PVEU6IG5lc3RlZCBwYXJlbnMgbWF5IG5vdCBoYXZlIGFsdGVybmF0aXZlcy4uLiA6LSggICBgKGF8KGJ8YykpYCB3b24ndCB3b3JrPz8/XG5mdW5jdGlvbiBwYXJzZUFsdGVybmF0aXZlcyhzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCkge1xuICBsZXQgeyBlbmQsIHNsaWNlIH0gPSBQYXJzZXIuZmluZE5lc3RlZFRva2VucyhzeW50YXhTdHJlYW0sIFwiKFwiLCBcIilcIiwgc3RhcnQpO1xuXG4gIC8vIHB1bGwgb3V0IGV4cGxpY2l0IFwicHJvbW90ZVwiIGZsYWc6IGA/OmBcbiAgbGV0IHByb21vdGUgPSAoc2xpY2VbMF0gPT09IFwiP1wiICYmIHNsaWNlWzFdID09PSBcIjpcIik7XG4gIGlmIChwcm9tb3RlKSBzbGljZSA9IHNsaWNlLnNsaWNlKDIpO1xuXG4gIC8vIHB1bGwgb3V0IGV4cGxpY2l0IGFyZ3VtZW50IG5hbWVcbiAgbGV0IGFyZ3VtZW50O1xuICBpZiAoc2xpY2UubGVuZ3RoID4gMiAmJiBzbGljZVsxXSA9PT0gXCI6XCIpIHtcbiAgICBhcmd1bWVudCA9IHNsaWNlWzBdO1xuICAgIHNsaWNlID0gc2xpY2Uuc2xpY2UoMik7XG4gIH1cblxuICAvLyBzcGxpdCBpbnRvIGdyb3VwcywgaW5jbHVkaW5nIG5lc3RlZCBwYXJlbnNcbiAgbGV0IGFsdGVybmF0aXZlcyA9XG4gICAgZ3JvdXBBbHRlcm5hdGl2ZXMoc2xpY2UpXG4gICAgLm1hcChmdW5jdGlvbihncm91cCkge1xuICAgICAgbGV0IHJlc3VsdHMgPSBwYXJzZVN5bnRheChncm91cCwgW10pO1xuICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiByZXN1bHRzWzBdO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgUnVsZS5TZXF1ZW5jZSh7IHJ1bGVzOiByZXN1bHRzIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIGxldCBydWxlID0gYWx0ZXJuYXRpdmVzLmxlbmd0aCA9PT0gMSA/IGFsdGVybmF0aXZlc1swXSA6IG5ldyBSdWxlLkFsdGVybmF0aXZlcyh7IHJ1bGVzOiBhbHRlcm5hdGl2ZXMgfSk7XG4gIGlmIChhcmd1bWVudCkgcnVsZS5hcmd1bWVudCA9IGFyZ3VtZW50O1xuICBpZiAocHJvbW90ZSkgcnVsZS5wcm9tb3RlID0gdHJ1ZTtcbiAgcmV0dXJuIFsgcnVsZSwgZW5kIF07XG5cbiAgZnVuY3Rpb24gZ3JvdXBBbHRlcm5hdGl2ZXModG9rZW5zKSB7XG4gICAgbGV0IGFsdGVybmF0aXZlcyA9IFtdO1xuICAgIGxldCBjdXJyZW50ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDAsIHRva2VuOyB0b2tlbiA9IHRva2Vuc1tpXTsgaSsrKSB7XG4gICAgICAvLyBoYW5kbGUgYWx0ZXJuYXRlIG1hcmtlclxuICAgICAgaWYgKHRva2VuID09PSBcInxcIikge1xuICAgICAgICBhbHRlcm5hdGl2ZXMucHVzaChjdXJyZW50KTtcbiAgICAgICAgY3VycmVudCA9IFtdO1xuICAgICAgfVxuICAgICAgLy8gaGFuZGxlIG5lc3RlZCBwYXJlbnNcbiAgICAgIGVsc2UgaWYgKHRva2VuID09PSBcIihcIikge1xuICAgICAgICBsZXQgeyBlbmQgfSA9IFBhcnNlci5maW5kTmVzdGVkVG9rZW5zKHRva2VucywgXCIoXCIsIFwiKVwiLCBpKTtcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQuY29uY2F0KHRva2Vucy5zbGljZShpLCBlbmQgKyAxKSk7XG4gICAgICAgIGkgPSBlbmQ7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY3VycmVudC5wdXNoKHRva2VuKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGN1cnJlbnQubGVuZ3RoKSBhbHRlcm5hdGl2ZXMucHVzaChjdXJyZW50KTtcbiAgICByZXR1cm4gYWx0ZXJuYXRpdmVzO1xuICB9XG59XG5cbi8vIE1hdGNoIHJlcGVhdCBpbmRpY2F0b3IgYD9gLCBgK2Agb3IgYCpgIGJ5IGF0dGFjaGluZyBpdCB0byB0aGUgcHJldmlvdXMgcnVsZS5cbmZ1bmN0aW9uIHBhcnNlUmVwZWF0KHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwKSB7XG4gIGxldCBzeW1ib2wgPSBzeW50YXhTdHJlYW1bc3RhcnRdO1xuICBsZXQgcnVsZSA9IHJ1bGVzW3J1bGVzLmxlbmd0aCAtIDFdO1xuICBpZiAoIXJ1bGUpIHRocm93IG5ldyBTeW50YXhFcnJvcihgQ2FuJ3QgYXR0YWNoIHJlcGVhdCBzeW1ib2wgJHtzeW1ib2x9IHRvIGVtcHR5IHJ1bGUhYCk7XG5cbiAgLy8gVHJhbnNmb3JtIGxhc3QgcnVsZSBpbnRvIGEgcmVwZWF0IGZvciBgKmAgYW5kIGArYC5cbiAgaWYgKHN5bWJvbCA9PT0gXCIqXCIgfHwgc3ltYm9sID09PSBcIitcIikge1xuICAgIGxldCBhcmd1bWVudCA9IHJ1bGUuYXJndW1lbnQ7XG4gICAgcnVsZSA9IG5ldyBSdWxlLlJlcGVhdCh7IHJlcGVhdDogcnVsZSB9KTtcbiAgICBpZiAoYXJndW1lbnQpIHJ1bGUuYXJndW1lbnQgPSBhcmd1bWVudDtcbiAgICAvLyBwdXNoIGludG8gcnVsZSBzdGFjayBpbiBwbGFjZSBvZiBvbGQgcnVsZVxuICAgIHJ1bGVzW3J1bGVzLmxlbmd0aCAtIDFdID0gcnVsZTtcbiAgfVxuXG4gIC8vIFJ1bGUgaXMgb3B0aW9uYWwgZm9yIGA/YCBhbmQgYCpgLlxuICBpZiAoc3ltYm9sID09PSBcIj9cIiB8fCBzeW1ib2wgPT09IFwiKlwiKSB7XG4gICAgcnVsZS5vcHRpb25hbCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gWyB1bmRlZmluZWQsIHN0YXJ0IF1cbn1cblxuLy8gTWF0Y2ggYHs8cnVsZU5hbWU+fWAgaW4gc3ludGF4IHJ1bGVzLlxuLy8gUmV0dXJucyBgWyBydWxlLCBlbmQgXWBcbi8vIFRocm93cyBpZiBpbnZhbGlkLlxuZnVuY3Rpb24gcGFyc2VTdWJydWxlKHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwKSB7XG4gIGxldCBtYXRjaCA9IFBhcnNlci5maW5kTmVzdGVkVG9rZW5zKHN5bnRheFN0cmVhbSwgXCJ7XCIsIFwifVwiLCBzdGFydCk7XG4gIGxldCBhcmd1bWVudDtcbiAgaWYgKG1hdGNoLnNsaWNlLmxlbmd0aCA9PT0gMyAmJiBtYXRjaC5zbGljZVsxXSA9PT0gXCI6XCIpIHtcbiAgICBhcmd1bWVudCA9IG1hdGNoLnNsaWNlWzBdO1xuICAgIG1hdGNoLnNsaWNlID0gbWF0Y2guc2xpY2Uuc2xpY2UoMik7XG4gIH1cbiAgaWYgKG1hdGNoLnNsaWNlLmxlbmd0aCA+IDEpIHRocm93IG5ldyBTeW50YXhFcnJvcihgQ2FuJ3QgcHJvY2VzcyBydWxlcyB3aXRoIG1vcmUgdGhhbiBvbmUgcnVsZSBuYW1lOiB7JHttYXRjaC5zbGljZS5qb2luKFwiXCIpfX1gKTtcblxuICBsZXQgcGFyYW1zID0geyBzdWJydWxlOiBtYXRjaC5zbGljZVswXSB9O1xuXG4gIC8vIHNlZSBpZiB0aGVyZSdzIGEgYG5vdGAgcnVsZSBpbiB0aGVyZVxuICBsZXQgYmFuZ1Bvc2l0aW9uID0gcGFyYW1zLnN1YnJ1bGUuaW5kZXhPZihcIiFcIik7XG4gIGlmIChiYW5nUG9zaXRpb24gIT09IC0xKSB7XG4gICAgcGFyYW1zLm5vdCA9IHBhcmFtcy5zdWJydWxlLnN1YnN0cihiYW5nUG9zaXRpb24gKyAxKTtcbiAgICBwYXJhbXMuc3VicnVsZSA9IHBhcmFtcy5zdWJydWxlLnN1YnN0cigwLCBiYW5nUG9zaXRpb24pO1xuICB9XG5cbiAgbGV0IHJ1bGUgPSBuZXcgUnVsZS5TdWJydWxlKHBhcmFtcyk7XG4gIGlmIChhcmd1bWVudCkgcnVsZS5hcmd1bWVudCA9IGFyZ3VtZW50O1xuICByZXR1cm4gWyBydWxlLCBtYXRjaC5lbmQgXTtcbn1cblxuLy8gTWF0Y2ggbGlzdCBleHByZXNzaW9uIGBbPGl0ZW0+PGRlbGltaXRlcj5dYCBvciBgWzxhcmd1bWVudD46PGl0ZW0+PGRlbGltaXRlcj5dYCBpbiBzeW50YXggcnVsZXMuXG4vLyBSZXR1cm5zIGBbIHJ1bGUsIGVuZCBdYFxuLy8gVGhyb3dzIGlmIGludmFsaWQuXG5mdW5jdGlvbiBwYXJzZUxpc3Qoc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDAsIGNvbnN0cnVjdG9yID0gUnVsZS5MaXN0KSB7XG4gIGxldCB7IGVuZCwgc2xpY2UgfSA9IFBhcnNlci5maW5kTmVzdGVkVG9rZW5zKHN5bnRheFN0cmVhbSwgXCJbXCIsIFwiXVwiLCBzdGFydCk7XG5cbiAgLy8gZ2V0IGFyZ3VtZW50IGlmIHN1cHBsaWVkXG4gIGxldCBhcmd1bWVudDtcbiAgaWYgKHNsaWNlLmxlbmd0aCA+IDIgJiYgc2xpY2VbMV0gPT09IFwiOlwiKSB7XG4gICAgYXJndW1lbnQgPSBzbGljZVswXTtcbiAgICBzbGljZSA9IHNsaWNlLnNsaWNlKDIpO1xuICB9XG5cbiAgbGV0IHJlc3VsdHMgPSBwYXJzZVN5bnRheChzbGljZSwgW10pO1xuICBpZiAocmVzdWx0cy5sZW5ndGggIT09IDIpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFVuZXhwZWN0ZWQgc3R1ZmYgYXQgZW5kIG9mIGxpc3Q6IFske3NsaWNlLmpvaW4oXCIgXCIpfV1gKTtcbiAgfVxuICBsZXQgWyBpdGVtLCBkZWxpbWl0ZXIgXSA9IHJlc3VsdHM7XG5cbiAgbGV0IHJ1bGUgPSBuZXcgY29uc3RydWN0b3IoeyBpdGVtLCBkZWxpbWl0ZXIgfSk7XG4gIGlmIChhcmd1bWVudCkgcnVsZS5hcmd1bWVudCA9IGFyZ3VtZW50O1xuICByZXR1cm4gWyBydWxlLCBlbmQgXTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9SdWxlU3ludGF4LmpzIiwiaW1wb3J0IHsgZ2V0VGFicyB9IGZyb20gXCIuL3V0aWxzL3N0cmluZ1wiO1xuXG4vLyBHUlJSLi4uIG5vZGUgZG9lc24ndCBpbmNsdWRlIHRoaXM/Pz9cbi8vIENIRUNLIERJRkZFUkVOVCBOT0RFIFZFUlNJT05TLi4uXG5pZiAoIShBcnJheS5wcm90b3R5cGUuaW5jbHVkZXMpKSB7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsIFwiaW5jbHVkZXNcIiwge1xuXHRcdHZhbHVlOiBmdW5jdGlvbih2YWx1ZSwgc3RhcnQpIHtcblx0XHRcdGxldCBpbmRleCA9IHRoaXMuaW5kZXhPZih2YWx1ZSwgc3RhcnQpO1xuXHRcdFx0cmV0dXJuIChpbmRleCAhPT0gLTEpO1xuXHRcdH1cblx0fSk7XG59XG5cblxuXG4vLyBgd2hpdGVzcGFjZWAgY2xhc3MgZm9yIG5vcm1hbCAobm9uLWluZGVudCwgbm9uLW5ld2xpbmUpIHdoaXRlc3BhY2UuXG5jbGFzcyB3aGl0ZXNwYWNlIHtcblx0Y29uc3RydWN0b3Iod2hpdGVzcGFjZSkge1xuXHRcdHRoaXMud2hpdGVzcGFjZSA9IHdoaXRlc3BhY2U7XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIFwibGVuZ3RoXCIgb2YgdGhpcyB3aGl0ZXNwYWNlLCBlZyBmb3IgYW4gaW5kZW50LlxuXHRnZXQgbGVuZ3RoKCkge1xuXHRcdHJldHVybiB0aGlzLndoaXRlc3BhY2UubGVuZ3RoO1xuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIHRoaXMud2hpdGVzcGFjZTtcblx0fVxufVxuXG5cbi8vIGBpbmRlbnRgIGNsYXNzLlxuY2xhc3MgaW5kZW50IGV4dGVuZHMgd2hpdGVzcGFjZSB7fVxuXG5cbi8vIE5ld2xpbmUgc2luZ2xldG9uLlxuY2xhc3MgbmV3bGluZSBleHRlbmRzIHdoaXRlc3BhY2Uge31cblxuXG4vL1xuLy9cdCMgVG9rZW5pemVyXG4vL1x0LSBgLnRva2VuaXplKClgIFx0XHRCcmVha3MgdXAgbG9uZyBzdHJpbmcgaW50byB0b2tlbnMsIGluY2x1ZGluZyBuZXdsaW5lcywgSlNYIGV4cHJlc3Npb25zLCBldGMuXG4vL1x0LSBgLnRva2VuaXplTGluZXMoKWAgXHRUYWtlcyB0aGUgYWJvdmUgYW5kIGJyZWFrcyBpdCBpbnRvIGFuIGFycmF5IG9mIGFycmF5cyBmb3IgZWFjaCBsaW5lLlxuLy9cbi8vIFRPRE86IGVycm9yIGNoZWNraW5nIC8gcmVwb3J0aW5nLCBlc3BlY2lhbGx5IGluIEpTWCBleHByZXNzaW9ucy5cbi8vIFRPRE86IGhhdmUgbm9ybWFsIGB0b2tlbml6ZWAgc3RpY2sgd2hpdGVzcGFjZSBlbGVtZW50cyBpbiB0aGUgc3RyZWFtLCB0aGVuIGB0b2tlbml6ZUxpbmVzKClgIHRha2VzIHRoZW0gb3V0P1xuY29uc3QgVG9rZW5pemVyID0ge1xuXG5cdC8vIFNob3VsZCB3ZSB3YXJuIGFib3V0IGFub21hbG91cyBjb25kaXRpb25zP1xuXHRXQVJOIDogZmFsc2UsXG5cblx0Ly8gV2hpdGVzcGFjZSBjb25zdHJ1Y3Rvci5cblx0V2hpdGVzcGFjZTogd2hpdGVzcGFjZSxcblxuXHQvLyBJbmRlbnQgY29uc3RydWN0b3Jcblx0SW5kZW50OiBpbmRlbnQsXG5cblx0Ly8gTkVXTElORSBzaW5nbGV0b24uXG5cdE5FV0xJTkU6IG5ldyBuZXdsaW5lKFwiXFxuXCIpLFxuXG5cdC8vIFRva2VuaXplIHRleHQgYmV0d2VlbiBgc3RhcnRgIGFuZCBgZW5kYCBpbnRvIGFuIGFycmF5IG9mIGByZXN1bHRzYCwgYW4gYXJyYXkgb2Y6XG5cdC8vXHQtIGBUb2tlbml6ZXIuTkVXTElORWAgZm9yIGEgbmV3bGluZSBzeW1ib2xcblx0Ly9cdC0gc3RyaW5ncyBmb3Iga2V5d29yZHMvc3ltYm9sc1xuXHQvL1x0LSBudW1iZXJzIGZvciBudW1iZXIgbGl0ZXJhbHNcblx0Ly9cdC0gYHsgaW5kZW50OiBudW1iZXIgfWAgZm9yIGluZGVudCBhdCBzdGFydCBvZiBsaW5lXG5cdC8vXHQtIGB7IHR5cGU6IFwidGV4dFwiLCBsaXRlcmFsOiBcIidhYmMnXCIsIHRleHQ6IFwiYWJjXCIgfVxuXHQvL1x0LSBgeyB0eXBlOiBcImluZGVudFwiLCBsZXZlbDogNyB9YFxuXHQvL1x0LSBgeyB0eXBlOiBcImNvbW1lbnRcIiwgY29tbWVudDogXCJzdHJpbmdcIiwgY29tbWVudFN5bWJvbCwgd2hpdGVzcGFjZSB9YFxuLy9URVNUTUVcblx0dG9rZW5pemUodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0Ly8gcXVpY2sgcmV0dXJuIG91dCBvZiByYW5nZSBvciBvbmx5IHdoaXRlc3BhY2Vcblx0XHRpZiAoc3RhcnQgPj0gZW5kIHx8ICF0ZXh0LnRyaW0oKSkgcmV0dXJuIFtdO1xuXG5cdFx0bGV0IHRva2VucyA9IFtdO1xuXHRcdC8vIFByb2Nlc3Mgb3VyIHRvcC1sZXZlbCBydWxlcy5cblx0XHRsZXQgW3Jlc3VsdHMsIG5leHRTdGFydF0gPSB0aGlzLmVhdFRva2Vucyh0aGlzLm1hdGNoVG9wVG9rZW5zLCB0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRpZiAocmVzdWx0cykge1xuXHRcdFx0dG9rZW5zID0gdG9rZW5zLmNvbmNhdChyZXN1bHRzKTtcblx0XHRcdHN0YXJ0ID0gbmV4dFN0YXJ0O1xuXHRcdH1cblx0XHRpZiAoc3RhcnQgIT09IGVuZCkge1xuXHRcdFx0aWYgKFRva2VuaXplci5XQVJOKSBjb25zb2xlLndhcm4oXCJ0b2tlbml6ZSgpOiBkaWRuJ3QgY29uc3VtZTogYFwiLCB0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpICsgXCJgXCIpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHRzO1xuXHR9LFxuXG5cdC8vIFJlcGVhdGVkbHkgZXhlY3V0ZSBhIGBtZXRob2RgIChib3VuZCB0byBgdGhpcykgd2hpY2ggcmV0dXJucyBhIGBbcmVzdWx0LCBuZXh0U3RhcnRdYCBvciBgdW5kZWZpbmVkYC5cblx0Ly8gUGxhY2VzIG1hdGNoZWQgcmVzdWx0cyB0b2dldGhlciBpbiBgcmVzdWx0c2AgYXJyYXkgYW5kIHJldHVybnMgYFtyZXN1bHRzLCBuZXh0U3RhcnRdYCBmb3IgdGhlIGVudGlyZSBzZXQuXG5cdC8vIFN0b3BzIGlmIGBtZXRob2RgIGRvZXNuJ3QgcmV0dXJuIGFueXRoaW5nLCBvciBpZiBjYWxsaW5nIGBtZXRob2RgIGlzIHVucHJvZHVjdGl2ZS5cbi8vVEVTVE1FXG5cdGVhdFRva2VucyhtZXRob2QsIHRleHQsIHN0YXJ0ID0gMCwgZW5kLCByZXN1bHRzID0gW10pIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIHByb2Nlc3MgcnVsZXMgcmVwZWF0ZWRseSB1bnRpbCB3ZSBnZXQgdG8gdGhlIGVuZFxuXHRcdHdoaWxlIChzdGFydCA8IGVuZCkge1xuXHRcdFx0bGV0IHJlc3VsdCA9IG1ldGhvZC5jYWxsKHRoaXMsIHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdFx0aWYgKCFyZXN1bHQpIGJyZWFrO1xuXG5cdFx0XHRsZXQgW3Rva2VucywgbmV4dFN0YXJ0XSA9IHJlc3VsdDtcblx0XHRcdC8vIEJhaWwgaWYgd2UgZGlkbid0IGdldCBhIHByb2R1Y3RpdmUgcnVsZSFcblx0XHRcdGlmIChzdGFydCA9PT0gbmV4dFN0YXJ0KSBicmVhaztcblxuXHRcdFx0Ly8gaGFuZGxlIG5ld1Jlc3VsdHMgYXMgYW4gYXJyYXkgb3Igc2luZ2xlIG9iamVjdC5cblx0XHRcdGlmICh0b2tlbnMgIT09IHVuZGVmaW5lZCkgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHRva2Vucyk7XG5cdFx0XHRzdGFydCA9IG5leHRTdGFydDtcblx0XHR9XG5cdFx0cmV0dXJuIFtyZXN1bHRzLCBzdGFydF07XG5cdH0sXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgdG9wLWxldmVsIHRva2VuIGF0IGB0ZXh0W3N0YXJ0XWAuXG4vL1RFU1RNRVxuXHRtYXRjaFRvcFRva2Vucyh0ZXh0LCBzdGFydCwgZW5kKSB7XG5cdFx0cmV0dXJuXHR0aGlzLm1hdGNoV2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0IHx8IHRoaXMubWF0Y2hXb3JkKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaE51bWJlcih0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0IHx8IHRoaXMubWF0Y2hOZXdsaW5lKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaEpTWEVsZW1lbnQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoVGV4dCh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0IHx8IHRoaXMubWF0Y2hDb21tZW50KHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaFN5bWJvbCh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdDtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgU3ltYm9sIGNoYXJhY3RlclxuXHQvL1xuXG5cdC8vIE1hdGNoIHRoZSBzaW5nbGUgXCJzeW1ib2xcIiBjaGFyYWN0ZXIgYXQgYHRleHRbc3RhcnRdYC5cblx0Ly8gTk9URTogVGhpcyBkb2VzIG5vdCBkbyBhbnkgY2hlY2tpbmcsIGl0IGp1c3QgYmxpbmRseSB1c2VzIHRoZSBjaGFyYWN0ZXIgaW4gcXVlc3Rpb24uXG5cdC8vXHRcdCBZb3Ugc2hvdWxkIG1ha2Ugc3VyZSBhbGwgb3RoZXIgcG9zc2libGUgcnVsZXMgaGF2ZSBiZWVuIGV4aGF1c3RlZCBmaXJzdC5cblx0bWF0Y2hTeW1ib2wodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiBbdGV4dFtzdGFydF0sIHN0YXJ0ICsgMV1cblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgV2hpdGVzcGFjZVxuXHQvL1xuXG5cdC8vIFJldHVybiB0aGUgZmlyc3QgY2hhciBwb3NpdGlvbiBhZnRlciBgc3RhcnRgIHdoaWNoIGlzIE5PVCBhIHdoaXRlc3BhY2UgY2hhciAoc3BhY2Ugb3IgdGFiIG9ubHkpLlxuXHQvLyBJZiBgdGV4dFtzdGFydF1gIGlzIG5vdCB3aGl0ZXNwYWNlLCByZXR1cm5zIGBzdGFydGAsXG5cdC8vXHRzbyB5b3UgY2FuIGNhbGwgdGhpcyBhdCBhbnkgdGltZSB0byBza2lwIHdoaXRlc3BhY2UgaW4gdGhlIG91dHB1dC5cblx0ZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gZW5kO1xuXG5cdFx0bGV0IHdoaXRlU3BhY2VFbmQgPSBzdGFydDtcblx0XHR3aGlsZSAod2hpdGVTcGFjZUVuZCA8IGVuZCAmJiAodGV4dFt3aGl0ZVNwYWNlRW5kXSA9PT0gXCIgXCIgfHwgdGV4dFt3aGl0ZVNwYWNlRW5kXSA9PT0gXCJcXHRcIikpIHtcblx0XHRcdHdoaXRlU3BhY2VFbmQrKztcblx0XHR9XG5cdFx0cmV0dXJuIHdoaXRlU3BhY2VFbmQ7XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIFdoaXRlc3BhY2Vcblx0Ly9cdE5PVEU6IFdoaXRlc3BhY2UgYXQgdGhlIGJlZ2lubmluZyBvZiBgdGV4dGAgb3IgdGhlIGJlZ2lubmluZyBvZiBhIGxpbmVcblx0Ly9cdFx0ICBpcyBjb25zaWRlcmVkIGFuIFwiaW5kZW50XCIgYW5kIHdpbGwgaGF2ZSBgLmlzSW5kZW50ID09PSB0cnVlYC5cblx0Ly9cblxuXHQvLyBDb252ZXJ0IGEgcnVuIG9mIHNwYWNlcyBhbmQvb3IgdGFicyBpbnRvIGEgYFRva2VuaXplci5XaGl0ZXNwYWNlYC5cblx0bWF0Y2hXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgd2hpdGVzcGFjZUVuZCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHQvLyBmb3JnZXQgaXQgaWYgbm8gZm9yd2FyZCBtb3Rpb25cblx0XHRpZiAod2hpdGVzcGFjZUVuZCA9PT0gc3RhcnQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgd2hpdGVzcGFjZSA9IHRleHQuc2xpY2Uoc3RhcnQsIHdoaXRlc3BhY2VFbmQpO1xuXHRcdGxldCB0b2tlbjtcblx0XHRpZiAoc3RhcnQgPT09IDAgfHwgdGV4dFtzdGFydC0xXSA9PT0gXCJcXG5cIilcblx0XHRcdHRva2VuID0gbmV3IFRva2VuaXplci5JbmRlbnQod2hpdGVzcGFjZSk7XG5cdFx0ZWxzZVxuXHRcdFx0dG9rZW4gPSBuZXcgVG9rZW5pemVyLldoaXRlc3BhY2Uod2hpdGVzcGFjZSk7XG5cblx0XHRyZXR1cm4gW3Rva2VuLCB3aGl0ZXNwYWNlRW5kXTtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgTmV3bGluZVxuXHQvL1xuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIG5ld2xpbmUgY2hhcmFjdGVyIGF0IGB0ZXh0W3N0YXJ0XWAuXG5cdC8vIFJldHVybnMgYFtUb2tlbml6ZXIuTkVXTElORSwgbmV4dFN0YXJ0XWAgb24gbWF0Y2guXG5cdC8vIE90aGVyd2lzZSByZXR1cm5zIGB1bmRlZmluZWRgLlxuXHRtYXRjaE5ld2xpbmUodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCB8fCB0ZXh0W3N0YXJ0XSAhPT0gXCJcXG5cIikgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiBbVG9rZW5pemVyLk5FV0xJTkUsIHN0YXJ0ICsgMV07XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIFdvcmRcblx0Ly9cblxuXHQvLyBNYXRjaCBhIHNpbmdsZSBgd29yZGAgaW4gYHRleHRgIGF0IGNoYXJhY3RlciBgc3RhcnRgLlxuXHQvLyBSZXR1cm5zIGBbd29yZCwgd29yZEVuZF1gLlxuXHQvLyBSZXR1cm5zIGFuIGVtcHR5IGFycmF5IGlmIGNvdWxkbid0IG1hdGNoIGEgd29yZC5cblx0V09SRF9TVEFSVDogL1tBLVphLXpdLyxcblx0V09SRF9DSEFSIDogL15bXFx3Xy1dLyxcblx0bWF0Y2hXb3JkKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRpZiAoIXRoaXMuV09SRF9TVEFSVC50ZXN0KHRleHRbc3RhcnRdKSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB3b3JkRW5kID0gc3RhcnQgKyAxO1xuXHRcdHdoaWxlICh3b3JkRW5kIDwgZW5kICYmIHRoaXMuV09SRF9DSEFSLnRlc3QodGV4dFt3b3JkRW5kXSkpIHtcblx0XHRcdHdvcmRFbmQrKztcblx0XHR9XG5cdFx0aWYgKHdvcmRFbmQgPT09IHN0YXJ0KSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHdvcmQgPSB0ZXh0LnNsaWNlKHN0YXJ0LCB3b3JkRW5kKTtcblx0XHRyZXR1cm4gW3dvcmQsIHdvcmRFbmRdO1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBOdW1iZXJzXG5cdC8vXG5cblx0Ly8gRWF0IGEgc2luZ2xlIG51bWJlci5cblx0Ly8gUmV0dXJucyBhIGBOdW1iZXJgIGlmIG1hdGNoZWQuXG5cdE5VTUJFUl9TVEFSVDogL1swLTktLl0vLFxuXHROVU1CRVIgOiAvXi0/KFswLTldKlxcLik/WzAtOV0rLyxcblx0bWF0Y2hOdW1iZXIodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGlmICghdGhpcy5OVU1CRVJfU1RBUlQudGVzdCh0ZXh0W3N0YXJ0XSkpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbnVtYmVyTWF0Y2ggPSB0aGlzLm1hdGNoRXhwcmVzc2lvbkF0SGVhZCh0aGlzLk5VTUJFUiwgdGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0aWYgKCFudW1iZXJNYXRjaCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBudW1iZXJTdHIgPSBudW1iZXJNYXRjaFswXTtcblx0XHRsZXQgbnVtYmVyID0gcGFyc2VGbG9hdChudW1iZXJTdHIsIDEwKTtcblx0XHRyZXR1cm4gW251bWJlciwgc3RhcnQgKyBudW1iZXJTdHIubGVuZ3RoXTtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgVGV4dCBsaXRlcmFsXG5cdC8vXG5cblx0Ly8gRWF0IGEgdGV4dCBsaXRlcmFsIChzdGFydHMvZW5kcyB3aXRoIGAnYCBvciBgXCJgKS5cblx0Ly8gUmV0dXJucyBhIGBUb2tlbml6ZXIuVGV4dGAgaWYgbWF0Y2hlZC5cbi8vVEVTVE1FOiAgbm90IHN1cmUgdGhlIGVzY2FwaW5nIGxvZ2ljIGlzIHJlYWxseSByaWdodC4uLlxuXHRtYXRjaFRleHQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBxdW90ZVN5bWJvbCA9IHRleHRbc3RhcnRdO1xuXHRcdGlmIChxdW90ZVN5bWJvbCAhPT0gJ1wiJyAmJiBxdW90ZVN5bWJvbCAhPT0gXCInXCIpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgdGV4dEVuZCA9IHN0YXJ0ICsgMTtcblx0XHR3aGlsZSAodGV4dEVuZCA8IGVuZCkge1xuXHRcdFx0bGV0IGNoYXIgPSB0ZXh0W3RleHRFbmRdO1xuXHRcdFx0aWYgKGNoYXIgPT09IHF1b3RlU3ltYm9sKSBicmVhaztcblx0XHRcdC8vIGlmIHdlIGdldCBhIGJhY2txdW90ZSwgaWdub3JlIHF1b3RlIGluIG5leHQgY2hhclxuXHRcdFx0aWYgKGNoYXIgPT09IFwiXFxcXFwiICYmIHRleHRbdGV4dEVuZCArIDFdID09PSBxdW90ZVN5bWJvbCkgdGV4dEVuZCsrO1xuXHRcdFx0dGV4dEVuZCsrO1xuXHRcdH1cblx0XHQvLyBGb3JnZXQgaXQgaWYgd2UgZGlkbid0IGVuZCB3aXRoIHRoZSBxdW90ZSBzeW1ib2xcblx0XHRpZiAodGV4dFt0ZXh0RW5kXSAhPT0gcXVvdGVTeW1ib2wpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0Ly8gYWR2YW5jZSBwYXN0IGVuZCBxdW90ZVxuXHRcdHRleHRFbmQrKztcblxuXHRcdGxldCBxdW90ZWRTdHJpbmcgPSB0ZXh0LnNsaWNlKHN0YXJ0LCB0ZXh0RW5kKTtcblx0XHRsZXQgdG9rZW4gPSBuZXcgVG9rZW5pemVyLlRleHQocXVvdGVkU3RyaW5nKTtcblx0XHRyZXR1cm4gW3Rva2VuLCB0ZXh0RW5kXTtcblx0fSxcblxuXHQvLyBgVGV4dGAgY2xhc3MgZm9yIHN0cmluZyBsaXRlcmFscy5cblx0Ly8gUGFzcyB0aGUgbGl0ZXJhbCB2YWx1ZSwgdXNlIGAudGV4dGAgdG8gZ2V0IGp1c3QgdGhlIGJpdCBpbnNpZGUgdGhlIHF1b3Rlcy5cblx0VGV4dCA6IGNsYXNzIHRleHQge1xuXHRcdGNvbnN0cnVjdG9yKHF1b3RlZFN0cmluZykge1xuXHRcdFx0dGhpcy5xdW90ZWRTdHJpbmcgPSBxdW90ZWRTdHJpbmc7XG5cdFx0fVxuXHRcdGdldCB0ZXh0KCkge1xuXHRcdFx0bGV0IHN0cmluZyA9IHRoaXMucXVvdGVkU3RyaW5nO1xuXHRcdFx0Ly8gY2FsY3VsYXRlIGB0ZXh0YCBhcyB0aGUgYml0cyBiZXR3ZWVuIHRoZSBxdW90ZXMuXG5cdFx0XHRsZXQgc3RhcnQgPSAwO1xuXHRcdFx0bGV0IGVuZCA9IHN0cmluZy5sZW5ndGg7XG5cdFx0XHRpZiAoc3RyaW5nW3N0YXJ0XSA9PT0gJ1wiJyB8fCBzdHJpbmdbc3RhcnRdID09PSBcIidcIikgc3RhcnQgPSAxO1xuXHRcdFx0aWYgKHN0cmluZ1tlbmQtMV0gPT09ICdcIicgfHwgc3RyaW5nW2VuZC0xXSA9PT0gXCInXCIpIGVuZCA9IC0xO1xuXHRcdFx0cmV0dXJuIHN0cmluZy5zbGljZShzdGFydCwgZW5kKTtcblx0XHR9XG5cdFx0dG9TdHJpbmcoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5xdW90ZWRTdHJpbmc7XG5cdFx0fVxuXHR9LFxuXG5cdC8vXG5cdC8vXHQjIyMgQ29tbWVudHNcblx0Ly9cblxuXHQvLyBFYXQgYSBjb21tZW50ICh1bnRpbCB0aGUgZW5kIG9mIHRoZSBsaW5lKS5cblx0Ly8gUmV0dXJucyBhIGBUb2tlbml6ZXIuQ29tbWVudGAgaWYgbWF0Y2hlZC5cblx0Q09NTUVOVCA6IC9eKCMjK3wtLSt8XFwvXFwvKykoXFxzKikoLiopLyxcblx0bWF0Y2hDb21tZW50KHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgY29tbWVudFN0YXJ0ID0gdGV4dC5zbGljZShzdGFydCwgc3RhcnQgKyAyKTtcblx0XHRpZiAoY29tbWVudFN0YXJ0ICE9PSBcIi0tXCIgJiYgY29tbWVudFN0YXJ0ICE9PSBcIlxcL1xcL1wiICYmIGNvbW1lbnRTdGFydCAhPT0gXCIjI1wiKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gY29tbWVudCBlYXRzIHVudGlsIHRoZSBlbmQgb2YgdGhlIGxpbmVcblx0XHRsZXQgbGluZSA9IHRoaXMuZ2V0TGluZUF0SGVhZCh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRsZXQgY29tbWVudE1hdGNoID0gbGluZS5tYXRjaCh0aGlzLkNPTU1FTlQpXG5cdFx0aWYgKCFjb21tZW50TWF0Y2gpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgW21hdGNoLCBjb21tZW50U3ltYm9sLCB3aGl0ZXNwYWNlLCBjb21tZW50XSA9IGNvbW1lbnRNYXRjaDtcblx0XHRsZXQgdG9rZW4gPSBuZXcgVG9rZW5pemVyLkNvbW1lbnQoeyBjb21tZW50U3ltYm9sLCB3aGl0ZXNwYWNlLCBjb21tZW50IH0pO1xuXHRcdHJldHVybiBbdG9rZW4sIHN0YXJ0ICsgbGluZS5sZW5ndGhdO1xuXHR9LFxuXG5cdC8vIENvbW1lbnQgY2xhc3Ncbi8vVEVTVE1FXG5cdENvbW1lbnQgOiBjbGFzcyBjb21tZW50IHtcblx0XHRjb25zdHJ1Y3RvciAocHJvcHMpIHtcblx0XHRcdE9iamVjdC5hc3NpZ24odGhpcywgcHJvcHMpO1xuXHRcdH1cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdHJldHVybiBgJHt0aGlzLmNvbW1lbnRTeW1ib2x9JHt0aGlzLndoaXRlc3BhY2V9JHt0aGlzLmNvbW1lbnR9YDtcblx0XHR9XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIEpTWFxuXHQvL1xuXG5cdC8vIEVhdCBhIChuZXN0ZWQpIEpTWCBleHByZXNzaW9uLlxuLy9URVNUTUVcblx0bWF0Y2hKU1hFbGVtZW50KHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgW2pzeEVsZW1lbnQsIG5leHRTdGFydF0gPSB0aGlzLm1hdGNoSlNYU3RhcnRUYWcodGV4dCwgc3RhcnQsIGVuZCkgfHwgW107XG5cdFx0aWYgKCFqc3hFbGVtZW50KSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0aWYgKCFqc3hFbGVtZW50LmlzVW5hcnlUYWcpIHtcblx0XHRcdGxldCBbY2hpbGRyZW4sIGNoaWxkRW5kXSA9IHRoaXMubWF0Y2hKU1hDaGlsZHJlbihqc3hFbGVtZW50LnRhZ05hbWUsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRcdGlmIChjaGlsZHJlbi5sZW5ndGgpIHtcblx0XHRcdFx0anN4RWxlbWVudC5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuXHRcdFx0XHRuZXh0U3RhcnQgPSBjaGlsZEVuZDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gW2pzeEVsZW1lbnQsIG5leHRTdGFydF07XG5cdH0sXG5cblx0Ly8gTWF0Y2ggSlNYIHN0YXJ0IHRhZyBhbmQgaW50ZXJuYWwgZWxlbWVudHMgKGJ1dCBOT1QgY2hpbGRyZW4pLlxuXHQvLyBSZXR1cm5zIGBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XWAgb3IgYHVuZGVmaW5lZGAuXG5cdC8vIFVzZSBgbWF0Y2hKU1hFbGVtZW50KClgIHRvIG1hdGNoIGNoaWxkcmVuLCBlbmQgdGFnLCBldGMuXG5cdC8vIElnbm9yZXMgbGVhZGluZyB3aGl0ZXNwYWNlLlxuXHRKU1hfVEFHX1NUQVJUIDogL148KFtBLVphLXpdW1xcdy1cXC5dKikoXFxzKlxcLz58XFxzKj58XFxzKykvLFxuLy8gVE9ETzogY2xlYW4gdGhpcyBzdHVmZiB1cCwgbWF5YmUgd2l0aCBmaW5kRmlyc3RBdEhlYWQ/XG5cdG1hdGNoSlNYU3RhcnRUYWcodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBuZXh0U3RhcnQgPSB0aGlzLmVhdFdoaXRlc3BhY2UodGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0Ly8gTWFrZSBzdXJlIHdlIHN0YXJ0IHdpdGggYDxgLlxuXHRcdGlmICh0ZXh0W25leHRTdGFydF0gIT09IFwiPFwiKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHRhZ01hdGNoID0gdGhpcy5tYXRjaEV4cHJlc3Npb25BdEhlYWQodGhpcy5KU1hfVEFHX1NUQVJULCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0aWYgKCF0YWdNYXRjaCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBbIG1hdGNoVGV4dCwgdGFnTmFtZSwgZW5kQml0IF0gPSB0YWdNYXRjaDtcblx0XHRsZXQganN4RWxlbWVudCA9IG5ldyBUb2tlbml6ZXIuSlNYRWxlbWVudCh0YWdOYW1lKTtcblx0XHRuZXh0U3RhcnQgPSBuZXh0U3RhcnQgKyBtYXRjaFRleHQubGVuZ3RoO1xuXG5cdFx0Ly8gSWYgdW5hcnkgdGFnLCBtYXJrIGFzIHN1Y2ggYW5kIHJldHVybi5cblx0XHRlbmRCaXQgPSBlbmRCaXQudHJpbSgpO1xuXHRcdGlmIChlbmRCaXQgPT09IFwiLz5cIikge1xuXHRcdFx0anN4RWxlbWVudC5pc1VuYXJ5VGFnID0gdHJ1ZTtcblx0XHRcdHJldHVybiBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XTtcblx0XHR9XG5cblx0XHQvLyBJZiB3ZSBkaWRuJ3QgaW1tZWRpYXRlbHkgZ2V0IGFuIGVuZCBtYXJrZXIsIGF0dGVtcHQgdG8gbWF0Y2ggYXR0cmlidXRlc1xuXHRcdGlmIChlbmRCaXQgIT09IFwiPlwiICYmIGVuZEJpdCAhPT0gXCIvPlwiKSB7XG5cdFx0XHRsZXQgWyBhdHRycywgYXR0ckVuZCBdID0gdGhpcy5lYXRUb2tlbnModGhpcy5tYXRjaEpTWEF0dHJpYnV0ZSwgdGV4dCwgbmV4dFN0YXJ0LCBlbmQpO1xuXHRcdFx0anN4RWxlbWVudC5hdHRyaWJ1dGVzID0gYXR0cnM7XG5cdFx0XHRuZXh0U3RhcnQgPSBhdHRyRW5kO1xuXHRcdH1cblxuXHRcdC8vIGF0IHRoaXMgcG9pbnQgd2Ugc2hvdWxkIGdldCBhbiBgLz5gIG9yIGA+YCAod2l0aCBubyB3aGl0ZXNwYWNlKS5cblx0XHRpZiAodGV4dFtuZXh0U3RhcnRdID09PSBcIi9cIiAmJiB0ZXh0W25leHRTdGFydCArIDFdID09PSBcIj5cIikge1xuXHRcdFx0ZW5kQml0ID0gXCIvPlwiO1xuXHRcdFx0bmV4dFN0YXJ0ICs9IDI7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKHRleHRbbmV4dFN0YXJ0XSA9PT0gXCI+XCIpIHtcblx0XHRcdGVuZEJpdCA9IHRleHRbbmV4dFN0YXJ0XTtcblx0XHRcdG5leHRTdGFydCArPSAxO1xuXHRcdH1cblxuXHRcdC8vIFJldHVybiBpbW1lZGlhdGVseSBmb3IgdW5hcnkgdGFnXG5cdFx0aWYgKGVuZEJpdCA9PT0gXCIvPlwiKSB7XG5cdFx0XHRqc3hFbGVtZW50LmlzVW5hcnlUYWcgPSB0cnVlO1xuXHRcdFx0cmV0dXJuIFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdO1xuXHRcdH1cblxuXHRcdC8vIGFkdmFuY2UgcGFzdCBgPmBcblx0XHRpZiAoZW5kQml0ICE9PSBcIj5cIikge1xuXHRcdFx0aWYgKFRva2VuaXplci5XQVJOKSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihcIk1pc3NpbmcgZXhwZWN0ZWQgZW5kIGA+YCBmb3IganN4RWxlbWVudFwiLCBqc3hFbGVtZW50LCBcImBcIit0ZXh0LnNsaWNlKHN0YXJ0LCBuZXh0U3RhcnQpK1wiYFwiKTtcblx0XHRcdH1cblx0XHRcdGpzeEVsZW1lbnQuZXJyb3IgPSBcIk5vIGVuZCA+XCI7XG5cdFx0XHRyZXR1cm4gW2pzeEVsZW1lbnQsIG5leHRTdGFydF07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdO1xuXHR9LFxuXG5cblx0Ly8gSlNYIGVsZW1lbnQgY2xhc3Ncblx0SlNYRWxlbWVudCA6IGNsYXNzIGpzeEVsZW1lbnQge1xuXHRcdGNvbnN0cnVjdG9yKHRhZ05hbWUsIGF0dHJpYnV0ZXMsIGNoaWxkcmVuKSB7XG5cdFx0XHR0aGlzLnRhZ05hbWUgPSB0YWdOYW1lO1xuXHRcdFx0aWYgKGF0dHJpYnV0ZXMpIHRoaXMuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG5cdFx0XHRpZiAoY2hpbGRyZW4pIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcblx0XHR9XG5cblx0XHQvLyBSZXR1cm4gYXR0cmlidXRlcyBhcyBhIG1hcC5cbi8vVEVTVE1FXG5cdFx0Z2V0IGF0dHJzKCkge1xuXHRcdFx0bGV0IGF0dHJzID0ge307XG5cdFx0XHRpZiAodGhpcy5hdHRyaWJ1dGVzKSB0aGlzLmF0dHJpYnV0ZXMuZm9yRWFjaChhdHRyID0+IHtcblx0XHRcdFx0Ly8gaWdub3JlIHVubmFtZWQgYXR0cmlidXRlc1xuXHRcdFx0XHRpZiAoYXR0ci5uYW1lKSBhdHRyc1thdHRyLm5hbWVdID0gYXR0ci52YWx1ZVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gYXR0cnM7XG5cdFx0fVxuXG5cdFx0Ly8gUmV0dXJuIG91ciBhdHRyaWJ1dGVzIGFzIGEgc3RyaW5nXG4vL1RFU1RNRVxuXHRcdGdldCBhdHRyc0FzU3RyaW5nKCkge1xuXHRcdFx0aWYgKCF0aGlzLmF0dHJpYnV0ZXMpIHJldHVybiBcIlwiO1xuXHRcdFx0cmV0dXJuIFwiIFwiICsgdGhpcy5hdHRyaWJ1dGVzLm1hcCggKHsgbmFtZSwgdmFsdWUgfSkgPT4ge1xuXHRcdFx0XHRpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuIG5hbWU7XG5cdFx0XHRcdC8vIGNvbnZlcnQgdmFsdWUgYXJyYXkgKHRva2VucykgdG8gc3RyaW5nXG5cdFx0XHRcdC8vIFRPRE86IHRoaXMgd2lsbCB3YW50IHRvIGJlIHNtYXJ0ZXIuLi5cblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB2YWx1ZSA9IGB7JHt2YWx1ZS5qb2luKFwiIFwiKX19YDtcblx0XHRcdFx0cmV0dXJuIGBuYW1lPSR7dmFsdWV9YDtcblx0XHRcdH0pLmpvaW4oXCIgXCIpO1xuXHRcdH1cblxuXHRcdC8vIFJldHVybiBvdXIgY2hpbGRyZW4gYXMgYSBzdHJpbmcuXG4vL1RFU1RNRVxuXHRcdGdldCBjaGlsZHJlbkFzU3RyaW5nKCkge1xuXHRcdFx0aWYgKCF0aGlzLmNoaWxkcmVuKSByZXR1cm4gXCJcIjtcblx0XHRcdHJldHVybiB0aGlzLmNoaWxkcmVuLm1hcChjaGlsZCA9PiB7XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KGNoaWxkKSkgcmV0dXJuIGB7JHtjaGlsZC5qb2luKFwiIFwiKX19YDtcblx0XHRcdFx0cmV0dXJuIFwiXCIgKyBjaGlsZDtcblx0XHRcdH0pLmpvaW4oXCJcIik7XG5cdFx0fVxuXG5cdFx0dG9TdHJpbmcoKSB7XG5cdFx0XHRsZXQgYXR0cnMgPSB0aGlzLmF0dHJzQXNTdHJpbmc7XG5cdFx0XHRsZXQgY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuQXNTdHJpbmc7XG5cdFx0XHRpZiAodGhpcy5pc1VuYXJ5VGFnKSByZXR1cm4gYDwke3RoaXMudGFnTmFtZX0ke2F0dHJzfS8+YDtcblx0XHRcdHJldHVybiBgPCR7dGhpcy50YWdOYW1lfSR7YXR0cnN9PiR7Y2hpbGRyZW59PC8ke3RoaXMudGFnTmFtZX0+YDtcblx0XHR9XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIEpTWCBjaGlsZHJlblxuXHQvL1xuXG5cdC8vIE1hdGNoIEpTWCBlbGVtZW50IGNoaWxkcmVuIG9mIGA8dGFnTmFtZT5gIGF0IGB0ZXh0W3N0YXJ0XWAuXG5cdC8vIE1hdGNoZXMgbmVzdGVkIGNoaWxkcmVuIGFuZCBzdG9wcyBhZnRlciBtYXRjaGluZyBlbmQgdGFnOiBgPC90YWdOYW1lPmAuXG5cdC8vIFJldHVybnMgYFtjaGlsZHJlbiwgbmV4dFN0YXJ0XWAuXG4vL1RFU1RNRVxuXHRtYXRjaEpTWENoaWxkcmVuKHRhZ05hbWUsIHRleHQsIHN0YXJ0LCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBjaGlsZHJlbiA9IFtdO1xuXHRcdGxldCBuZXN0aW5nID0gMTtcblx0XHRsZXQgZW5kVGFnID0gYDwvJHt0YWdOYW1lfT5gO1xuXG5cdFx0bGV0IG5leHRTdGFydCA9IHN0YXJ0O1xuXHRcdHdoaWxlKHRydWUpIHtcblx0XHRcdGxldCByZXN1bHQgPSB0aGlzLm1hdGNoSlNYQ2hpbGQoZW5kVGFnLCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0XHRpZiAoIXJlc3VsdCkgYnJlYWs7XG5cblx0XHRcdGxldCBbY2hpbGQsIGNoaWxkRW5kXSA9IHJlc3VsdDtcblx0XHRcdG5leHRTdGFydCA9IGNoaWxkRW5kO1xuXHRcdFx0Ly8gSWYgd2UgZ290IHRoZSBlbmRUYWcsIHVwZGF0ZSBuZXN0aW5nIGFuZCBicmVhayBvdXQgb2YgbG9vcCBpZiBuZXN0aW5nICE9PSAwXG5cdFx0XHRpZiAoY2hpbGQgPT09IGVuZFRhZykge1xuXHRcdFx0XHRuZXN0aW5nIC0tO1xuXHRcdFx0XHRpZiAobmVzdGluZyA9PT0gMCkgYnJlYWs7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmIChjaGlsZCkgY2hpbGRyZW4ucHVzaChjaGlsZCk7XG5cdFx0XHR9XG5cdFx0fVxuLy8gVE9ETzogaG93IHRvIHN1cmZhY2UgdGhpcyBlcnJvcj8/P1xuXHRcdGlmIChuZXN0aW5nICE9PSAwKSB7XG5cdFx0XHRpZiAoVG9rZW5pemVyLldBUk4pIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKGBtYXRjaEpTWENoaWxkcmVuKCR7dGV4dC5zbGljZShzdGFydCwgbmV4dFN0YXJ0ICsgMTApfTogZGlkbid0IG1hdGNoIGVuZCBjaGlsZCFgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIFtjaGlsZHJlbiwgbmV4dFN0YXJ0XTtcblx0fSxcblxuXHQvLyBNYXRjaCBhIHNpbmdsZSBKU1ggY2hpbGQ6XG5cdC8vXHQtIGN1cnJlbnQgZW5kVGFnXG5cdC8vXHQtIGB7IGpzeCBleHByZXNzaW9uIH1gXG5cdC8vXHQtIG5lc3RlZCBKU1ggZWxlbWVudFxuXHQvL1x0LSAoYW55dGhpbmcgZWxzZSkgYXMganN4VGV4dCBleHByZXNzaW9uLlxuXHRtYXRjaEpTWENoaWxkKGVuZFRhZywgdGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaEpTWEVuZFRhZyhlbmRUYWcsIHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoSlNYRXhwcmVzc2lvbih0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0fHwgdGhpcy5tYXRjaEpTWEVsZW1lbnQodGV4dCwgc3RhcnQsIGVuZClcbi8vIFRPRE86IG5ld2xpbmUgYW5kIGluZGVudD9cblx0XHRcdHx8IHRoaXMubWF0Y2hKU1hUZXh0KHRleHQsIHN0YXJ0LCBlbmQpO1xuXHR9LFxuXG5cdC8vIEF0dGVtcHQgdG8gbWF0Y2ggYSBzcGVjaWZpYyBlbmQgdGFnLlxuXHQvLyBJZ25vcmVzIGxlYWRpbmcgd2hpdGVzcGFjZS5cblx0bWF0Y2hKU1hFbmRUYWcoZW5kVGFnLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG5leHRTdGFydCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRpZiAoIXRoaXMubWF0Y2hTdHJpbmdBdEhlYWQoZW5kVGFnLCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCkpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIFtlbmRUYWcsIG5leHRTdGFydCArIGVuZFRhZy5sZW5ndGhdO1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBKU1ggYXR0cmlidXRlc1xuXHQvL1xuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIEpTWCBlbGVtZW50IGF0dHJpYnV0ZSBhcyBgPGF0dHI+PXs8dmFsdWU+fWBcbi8vIFRPRE86IHsuLi54eHh9XG5cdEpTWF9BVFRSSUJVVEVfU1RBUlQgOiAvXlxccyooW1xcdy1dK1xcYilcXHMqKD0/KVxccyovLFxuXHRtYXRjaEpTWEF0dHJpYnV0ZSh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gYXR0cmlidXRlcyBtdXN0IHN0YXJ0IHdpdGggYSB3b3JkIGNoYXJhY3RlclxuXHRcdGlmICghdGhpcy5XT1JEX1NUQVJULnRlc3QodGV4dFtzdGFydF0pKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gYXR0ZW1wdCB0byBtYXRjaCBhbiBhdHRyaWJ1dGUgbmFtZSwgaW5jbHVkaW5nIGA9YCBpZiBwcmVzZW50LlxuXHRcdGxldCByZXN1bHQgPSB0aGlzLm1hdGNoRXhwcmVzc2lvbkF0SGVhZCh0aGlzLkpTWF9BVFRSSUJVVEVfU1RBUlQsIHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGlmICghcmVzdWx0KSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IFsgbWF0Y2gsIG5hbWUsIGVxdWFscyBdID0gcmVzdWx0O1xuXHRcdGxldCBuZXh0U3RhcnQgPSBzdGFydCArIG1hdGNoLmxlbmd0aDtcblx0XHRsZXQgYXR0cmlidXRlID0gbmV3IFRva2VuaXplci5KU1hBdHRyaWJ1dGUobmFtZSk7XG5cblx0XHQvLyBpZiB0aGVyZSB3YXMgYW4gZXF1YWxzIGNoYXIsIHBhcnNlIHRoZSB2YWx1ZVxuXHRcdGlmIChlcXVhbHMpIHtcblx0XHRcdGxldCBbdmFsdWUsIHZhbHVlRW5kXSA9IHRoaXMubWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZSh0ZXh0LCBuZXh0U3RhcnQsIGVuZCkgfHwgW107XG5cdFx0XHRpZiAodmFsdWUpIHtcblx0XHRcdFx0YXR0cmlidXRlLnZhbHVlID0gdmFsdWU7XG5cdFx0XHRcdG5leHRTdGFydCA9IHZhbHVlRW5kO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBlYXQgd2hpdGVzcGFjZSBiZWZvcmUgdGhlIG5leHQgYXR0cmlidXRlIC8gdGFnIGVuZFxuXHRcdG5leHRTdGFydCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0cmV0dXJuIFthdHRyaWJ1dGUsIG5leHRTdGFydF07XG5cdH0sXG5cblx0Ly8gTWF0Y2ggYSB2YWx1ZSBleHByZXNzaW9uIGZvciBhIEpTWCBlbGVtZW50IGF0dHJpYnV0ZTpcblx0Ly8gTk9URTogd2Ugd2lsbCBiZSBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGA9YCAoYW5kIHN1YnNlcXVlbnQgd2hpdGVzcGFjZSkuXG5cdG1hdGNoSlNYQXR0cmlidXRlVmFsdWUodGV4dCwgc3RhcnQsIGVuZCkge1xuXHRcdHJldHVybiB0aGlzLm1hdGNoVGV4dCh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0fHwgdGhpcy5tYXRjaEpTWEV4cHJlc3Npb24odGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hKU1hFbGVtZW50KHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoSlNYQXR0cmlidXRlVmFsdWVJZGVudGlmaWVyKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoTnVtYmVyKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0O1xuXHR9LFxuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIGlkZW50aWZlciBhcyBhIEpTWCBhdHRyaWJ1dGUgdmFsdWUuXG5cdC8vIFJldHVybnMgYXMgYSBgSlNYRXhwcmVzc2lvbmAuXG5cdG1hdGNoSlNYQXR0cmlidXRlVmFsdWVJZGVudGlmaWVyKHRleHQsIHN0YXJ0LCBlbmQpIHtcblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5tYXRjaFdvcmQodGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0aWYgKCFyZXN1bHQpIHJldHVybjtcblxuXHRcdGxldCBbIHdvcmQsIG5leHRTdGFydCBdID0gcmVzdWx0O1xuXHRcdGxldCB0b2tlbiA9IG5ldyBUb2tlbml6ZXIuSlNYRXhwcmVzc2lvbih3b3JkKTtcblx0XHRyZXR1cm4gW3Rva2VuLCBuZXh0U3RhcnRdO1xuXHR9LFxuXG5cdC8vIEpTWCBhdHRyaWJ1dGUgY2xhc3Ncblx0Ly8gYG5hbWVgIGlzIHRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUuXG5cdC8vIGB2YWx1ZWAgaXMgb25lIG9mOlxuXHQvL1x0XHQtIGAnLi4uJ2BcdFx0XHQvLyBUZXh0IChsaXRlcmFsIHN0cmluZykuXG5cdC8vXHRcdC0gYFwiLi4uXCJgXHRcdFx0Ly8gVGV4dCAobGl0ZXJhbCBzdHJpbmcpLlxuXHQvL1x0XHQtIGB7Li4ufWBcdFx0XHQvLyBFeHByZXNzaW9uLiAgUmVzdWx0cyB3aWxsIGJlIHRva2VuaXplZCBhcnJheS5cblx0Ly9cdFx0LSBgPC4uLi4+YFx0XHRcdC8vIEpTWCBlbGVtZW50LlxuXHQvL1x0XHQtIGAxYFx0XHRcdFx0Ly8gTnVtYmVyLiAgTm90ZTogdGhpcyBpcyBhbiBleHRlbnNpb24gdG8gSlNYLlxuXG5cdEpTWEF0dHJpYnV0ZSA6IGNsYXNzIGpzeEF0dHJpYnV0ZSB7XG5cdFx0Y29uc3RydWN0b3IobmFtZSwgdmFsdWUpIHtcblx0XHRcdHRoaXMubmFtZSA9IG5hbWU7XG5cdFx0XHRpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkgdGhpcy52YWx1ZSA9IHZhbHVlO1xuXHRcdH1cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdGlmICh0aGlzLnZhbHVlID09PSB1bmRlZmluZWQpIHJldHVybiB0aGlzLm5hbWU7XG5cdFx0XHRyZXR1cm4gYCR7dGhpcy5uYW1lfT17JHt0aGlzLnZhbHVlfX1gO1xuXHRcdH1cblx0fSxcblxuXG5cdC8vIE1hdGNoIGEgSlNYIGV4cHJlc3Npb24gZW5jbG9zZWQgaW4gY3VybHkgYnJhY2VzLCBlZzogIGB7IC4uLiB9YC5cblx0Ly8gIEhhbmRsZXMgbmVzdGVkIGN1cmxpZXMsIHF1b3RlcywgZXRjLlxuXHQvLyBSZXR1cm5zIGFycmF5IG9mIHRva2VucyBvZiBpbnRlcm5hbCBtYXRjaC5cblx0Ly8gSWdub3JlcyBsZWFkaW5nIHdoaXRlc3BhY2UuXG4vL1RPRE86IG5ld2xpbmVzL2luZGVudHM/Pz9cbi8vVE9ETzogey4uLnh4eH1cbi8vVEVTVE1FXG5cdG1hdGNoSlNYRXhwcmVzc2lvbih0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG5leHRTdGFydCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRsZXQgZW5kSW5kZXggPSB0aGlzLmZpbmRNYXRjaGluZ0F0SGVhZChcIntcIiwgXCJ9XCIsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRpZiAoZW5kSW5kZXggPT09IHVuZGVmaW5lZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIEdldCBjb250ZW50cywgaW5jbHVkaW5nIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UuXG5cdFx0bGV0IGNvbnRlbnRzID0gdGV4dC5zbGljZShzdGFydCArIDEsIGVuZEluZGV4KTtcblxuXHRcdC8vIHJldHVybiBhIG5ldyBKU1hFeHByZXNzaW9uLCBhZHZhbmNpbmcgYmV5b25kIHRoZSBlbmRpbmcgYH1gLlxuXHRcdGxldCBleHByZXNzaW9uID0gbmV3IFRva2VuaXplci5KU1hFeHByZXNzaW9uKGNvbnRlbnRzKTtcblx0XHRyZXR1cm4gW2V4cHJlc3Npb24sIGVuZEluZGV4ICsgMV07XG5cdH0sXG5cblx0Ly8gSlNYIGV4cHJlc3Npb24sIGNvbXBvc2VkIG9mIGlubGluZSB0b2tlbnMgd2hpY2ggc2hvdWxkIHlpZWxkIGFuIGBleHByZXNzaW9uYC5cblx0SlNYRXhwcmVzc2lvbiA6IGNsYXNzIGpzeEV4cHJlc3Npb24ge1xuXHRcdGNvbnN0cnVjdG9yKGNvbnRlbnRzKSB7XG5cdFx0XHR0aGlzLmNvbnRlbnRzID0gY29udGVudHMgfHwgXCJcIjtcblx0XHR9XG5cdFx0Ly8gRGl2aWRlIGNvbnRlbnRzIGludG8gYHRva2Vuc2AuXG5cdFx0Z2V0IHRva2VucygpIHtcblx0XHRcdHJldHVybiBUb2tlbml6ZXIudG9rZW5pemUodGhpcy5jb250ZW50cy50cmltKCkpO1xuXHRcdH1cblx0fSxcblxuXHQvLyBNYXRjaCBKU1hUZXh0IHVudGlsIHRoZSBvbmUgb2YgYHtgLCBgPGAsIGA+YCBvciBgfWAuXG5cdC8vIE5PVEU6IElOQ0xVREVTIGxlYWRpbmcgLyB0cmFpbGluZyB3aGl0ZXNwYWNlLlxuXHRKU1hfVEVYVF9FTkRfQ0hBUlMgOiBbXCJ7XCIsIFwiPFwiLCBcIj5cIiwgXCJ9XCJdLFxuLy9URVNUTUVcblx0bWF0Y2hKU1hUZXh0KHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyB0ZW1wb3JhcmlseSBhZHZhbmNlIHBhc3Qgd2hpdGVzcGFjZSAod2UnbGwgaW5jbHVkZSBpdCBpbiB0aGUgb3V0cHV0KS5cblx0XHRsZXQgbmV4dFN0YXJ0ID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGxldCBlbmRJbmRleCA9IHRoaXMuZmluZEZpcnN0QXRIZWFkKHRoaXMuSlNYX1RFWFRfRU5EX0NIQVJTLCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0Ly8gSWYgdGhlIGZpcnN0IG5vbi13aGl0ZXNwYWNlIGNoYXIgaXMgaW4gb3VyIEVORF9DSEFSUywgZm9yZ2V0IGl0LlxuXHRcdGlmIChlbmRJbmRleCA9PT0gbmV4dFN0YXJ0KSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gaWYgbm8gbWF0Y2gsIHdlJ3ZlIGdvdCBzb21lIHNvcnQgb2YgZXJyb3Jcblx0XHRpZiAoZW5kSW5kZXggPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYgKFRva2VuaXplci5XQVJOKSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihcIm1hdGNoSlNYVGV4dChcIit0ZXh0LnNsaWNlKHN0YXJ0LCBzdGFydCArIDUwKStcIik6IEpTWCBzZWVtcyB0byBiZSB1bmJhbGFuY2VkLlwiKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Ly8gaW5jbHVkZSBsZWFkaW5nIHdoaXRlc3BhY2UgaW4gdGhlIG91dHB1dC5cblx0XHRsZXQganN4VGV4dCA9IHRleHQuc2xpY2Uoc3RhcnQsIGVuZEluZGV4KTtcblx0XHRyZXR1cm4gW2pzeFRleHQsIGVuZEluZGV4XTtcblx0fSxcblxuXG5cblxuXHQvL1xuXHQvL1x0IyMgVXRpbGl0eSBmdW5jdGlvbnNcblx0Ly9cblxuXHQvLyBSZXR1cm4gY2hhcmFjdGVycyB1cCB0bywgYnV0IG5vdCBpbmNsdWRpbmcsIHRoZSBuZXh0IG5ld2xpbmUgY2hhciBhZnRlciBgc3RhcnRgLlxuXHQvLyBJZiBgc3RhcnRgIGlzIGEgbmV3bGluZSBjaGFyIG9yIHN0YXJ0ID49IGVuZCwgcmV0dXJucyBlbXB0eSBzdHJpbmcuXG5cdC8vIElmIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZyAoZWc6IG5vIG1vcmUgbmV3bGluZXMpLCByZXR1cm5zIGZyb20gc3RhcnQgdG8gZW5kLlxuLy9URVNUTUVcblx0Z2V0TGluZUF0SGVhZCh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gXCJcIjtcblxuXHRcdGxldCBuZXdsaW5lID0gdGV4dC5pbmRleE9mKFwiXFxuXCIsIHN0YXJ0KTtcblx0XHRpZiAobmV3bGluZSA9PT0gLTEgfHwgbmV3bGluZSA+IGVuZCkgbmV3bGluZSA9IGVuZDtcblx0XHRyZXR1cm4gdGV4dC5zbGljZShzdGFydCwgbmV3bGluZSk7XG5cdH0sXG5cblx0Ly8gTWF0Y2ggYSBtdWx0aS1jaGFyIHN0cmluZyBzdGFydGluZyBhdCBgdGV4dFtzdGFydF1gLlxuLy9URVNUTUVcblx0bWF0Y2hTdHJpbmdBdEhlYWQoc3RyaW5nLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHN0cmluZ0VuZCA9IHN0YXJ0ICsgc3RyaW5nLmxlbmd0aDtcblx0XHRpZiAoc3RyaW5nRW5kID4gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdHJldHVybiBzdHJpbmcgPT09IHRleHQuc2xpY2Uoc3RhcnQsIHN0cmluZ0VuZCk7XG5cdH0sXG5cblxuXHQvLyBNYXRjaCBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBzdGFydGluZyBhdCBgdGV4dFtzdGFydF1gLCByZXR1cm5pbmcgdGhlIG1hdGNoLlxuXHQvLyBSZXR1cm5zIGBudWxsYCBpZiBubyBtYXRjaC5cblx0Ly9cblx0Ly8gTk9URTogVGhlIGV4cHJlc3Npb24gTVVTVCBzdGFydCB3aXRoIGAvXi4uLi9gXG4vL1RFU1RNRVxuXHRtYXRjaEV4cHJlc3Npb25BdEhlYWQoZXhwcmVzc2lvbiwgdGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBoZWFkID0gdGV4dC5zbGljZShzdGFydCwgZW5kKTtcblx0XHRyZXR1cm4gaGVhZC5tYXRjaChleHByZXNzaW9uKTtcblx0fSxcblxuXHQvLyBGaW5kIGluZGV4IG9mIHRoZSBtYXRjaGluZyBTSU5HTEUgQ0hBUkFDVEVSIGBlbmREZWxpbWl0ZXJgIHRvIG1hdGNoIGBzdGFydERlbGltaXRlcmAuXG5cdC8vIE1hdGNoZXMgbmVzdGVkIGRlbGltaXRlcnMgYW5kIGhhbmRsZXMgZXNjYXBlZCBkZWxpbWl0ZXJzLlxuXHQvLyBBc3N1bWVzIGB0ZXh0W3N0YXJ0XWAgaXMgdGhlIHN0YXJ0RGVsaW1pdGVyIVxuXHQvLyBSZXR1cm5zIG51bWVyaWMgaW5kZXggb3IgYHVuZGVmaW5lZGAgaWYgbm8gbWF0Y2ggb3IgaWYgZmlyc3QgY2hhciBpcyBub3QgYHN0YXJ0RGVsaW1pdGVyYC5cblx0Ly9cblx0Ly9cdEFsc28gaGFuZGxlcyBuZXN0ZWQgcXVvdGVzIC0tIGlmIHdlIGVuY291bnRlciBhIHNpbmdsZSBvciBkb3VibGUgcXVvdGUsXG5cdC8vXHRcdHdlJ2xsIHNraXAgc2Nhbm5pbmcgdW50aWwgd2UgZmluZCBhIG1hdGNoaW5nIHF1b3RlLlxuXHQvL1xuXHQvL1x0ZWc6ICBgZmluZE1hdGNoaW5nQXRIZWFkKFwie1wiLCBcIn1cIiwgXCJ7YWF7YX1hYX1cIilgID0+IDhcbi8vVEVTVE1FXG5cdGZpbmRNYXRjaGluZ0F0SGVhZChzdGFydERlbGltaXRlciwgZW5kRGVsaW1pdGVyLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0aWYgKHRleHRbc3RhcnRdICE9PSBzdGFydERlbGltaXRlcikgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBuZXN0aW5nID0gMDtcblx0XHRsZXQgY3VycmVudCA9IHN0YXJ0O1xuXHRcdHdoaWxlIChjdXJyZW50IDwgZW5kKSB7XG5cdFx0XHRsZXQgY2hhciA9IHRleHRbY3VycmVudF07XG5cdFx0XHQvLyBpZiBzdGFydERlbGltaXRlciwgaW5jcmVhc2UgbmVzdGluZ1xuXHRcdFx0aWYgKGNoYXIgPT09IHN0YXJ0RGVsaW1pdGVyKSB7XG5cdFx0XHRcdG5lc3RpbmcrKztcblx0XHRcdH1cblx0XHRcdC8vIGlmIGVuZERlbGltaXRlciwgZGVjcmVhc2UgbmVzdGluZyBhbmQgcmV0dXJuIGlmIG5lc3RpbmcgYmFjayB0byAwXG5cdFx0XHRlbHNlIGlmIChjaGFyID09PSBlbmREZWxpbWl0ZXIpIHtcblx0XHRcdFx0bmVzdGluZy0tO1xuXHRcdFx0XHRpZiAobmVzdGluZyA9PT0gMCkgcmV0dXJuIGN1cnJlbnQ7XG5cdFx0XHR9XG5cdFx0XHQvLyBpZiBhIHNpbmdsZSBvciBkb3VibGUgcXVvdGUsIHNraXAgdW50aWwgdGhlIG1hdGNoaW5nIHF1b3RlXG5cdFx0XHRlbHNlIGlmIChjaGFyID09PSBcIidcIiB8fCBjaGFyID09PSAnXCInKSB7XG5cdFx0XHRcdGxldCBbdG9rZW4sIGFmdGVyUXVvdGVdID0gdGhpcy5tYXRjaFRleHQodGV4dCwgY3VycmVudCwgZW5kKSB8fCBbXTtcblx0XHRcdFx0Y3VycmVudCA9IGFmdGVyUXVvdGU7XG5cdFx0XHRcdGNvbnRpbnVlO1x0Ly8gY29udGludWUgc28gd2UgZG9uJ3QgYWRkIDEgdG8gY3VyZW50IGJlbG93XG5cdFx0XHR9XG5cdFx0XHQvLyBJZiBiYWNrc2xhc2gsIHNraXAgYW4gZXh0cmEgY2hhciBpZiBpdCdzIGVpdGhlciBkZWxpbWl0ZXIgb3IgYSBxdW90ZVxuXHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gXCJcXFxcXCIpIHtcblx0XHRcdFx0Y2hhciA9IHRleHRbY3VycmVudCArIDFdO1xuXHRcdFx0XHRpZiAoY2hhciA9PT0gc3RhcnREZWxpbWl0ZXJcblx0XHRcdFx0IHx8IGNoYXIgPT09IGVuZERlbGltaXRlclxuXHRcdFx0XHQgfHwgY2hhciA9PT0gXCInXCJcblx0XHRcdFx0IHx8IGNoYXIgPT09ICdcIidcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0Y3VycmVudCsrOztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y3VycmVudCsrO1xuXHRcdH1cblx0fSxcblxuXG5cdC8vIFJldHVybiB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IE5PTi1FU0NBUEVEIGNoYXJhY3RlciBpbiBgY2hhcnNgIGFmdGVyIGB0ZXh0W3N0YXJ0XWAuXG5cdC8vIFJldHVybnMgYHVuZGVmaW5lZGAgaWYgd2UgZGlkbid0IGZpbmQgYSBtYXRjaC5cbi8vVEVTVE1FXG5cdGZpbmRGaXJzdEF0SGVhZChjaGFycywgdGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHdoaWxlIChzdGFydCA8IGVuZCkge1xuXHRcdFx0bGV0IGNoYXIgPSB0ZXh0W3N0YXJ0XTtcblx0XHRcdGlmIChjaGFycy5pbmNsdWRlcyhjaGFyKSkgcmV0dXJuIHN0YXJ0O1xuXHRcdFx0Ly8gaWYgd2UgZ290IGFuIGVzY2FwZSBjaGFyLCBpZ25vcmUgdGhlIG5leHQgY2hhciBpZiBpdCdzIGluIGBjaGFyc2Bcblx0XHRcdGlmIChjaGFyID09PSBcIlxcXFxcIiAmJiBjaGFycy5pbmNsdWRlcyh0ZXh0W3N0YXJ0KzFdKSkgc3RhcnQrKztcblx0XHRcdHN0YXJ0Kys7XG5cdFx0fVxuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHN0YXJ0O1xuXHR9LFxuXG5cbi8vXG4vLyAjIyMgVXRpbGl0eVxuLy9cblxuXHQvLyBHaXZlbiBhIHNldCBvZiB0b2tlbnMsIHNsaWNlIHdoaXRlc3BhY2UgKGluZGVudCwgTkVXTElORSBvciBub3JtYWwgd2hpdGVzcGFjZSkgZnJvbSB0aGUgZnJvbnQuXG5cdHJlbW92ZUxlYWRpbmdXaGl0ZXNwYWNlKHRva2Vucywgc3RhcnQgPSAwKSB7XG5cdFx0d2hpbGUgKHRva2Vuc1tzdGFydF0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuV2hpdGVzcGFjZSkgc3RhcnQrKztcblx0XHRpZiAoc3RhcnQgPT09IDApIHJldHVybiB0b2tlbnM7XG5cdFx0cmV0dXJuIHRva2Vucy5zbGljZShzdGFydCk7XG5cdH0sXG5cblx0Ly8gR2l2ZW4gYSBzZXQgb2YgdG9rZW5zLCByZW1vdmUgQUxMIFwibm9ybWFsXCIgd2hpdGVzcGFjZSB0b2tlbnMgKE5PVCBpbmRlbnQgb3IgTkVXTElORSkuXG5cdHJlbW92ZU5vcm1hbFdoaXRlc3BhY2UodG9rZW5zKSB7XG5cdFx0cmV0dXJuIHRva2Vucy5maWx0ZXIodG9rZW4gPT4gIVRva2VuaXplci5pc05vcm1hbFdoaXRlc3BhY2UodG9rZW4pKTtcblx0fSxcblxuXG5cdC8vIFJldHVybiBgdHJ1ZWAgaWYgYHRva2VuYCBpcyBcIm5vcm1hbFwiIHdoaXRlc3BjZSAobm90IGEgbmV3bGluZSBvciBpbmRlbnQpXG5cdGlzTm9ybWFsV2hpdGVzcGFjZSh0b2tlbikge1xuXHRcdHJldHVybiB0b2tlbiBpbnN0YW5jZW9mIFRva2VuaXplci5XaGl0ZXNwYWNlXG5cdFx0XHQmJiAhKHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLkluZGVudClcblx0XHRcdCYmICh0b2tlbiAhPT0gVG9rZW5pemVyLk5FV0xJTkUpO1xuXHR9LFxuXG5cbi8vXG4vLyAjIyMgQmxvY2sgLyBpbmRlbnQgcHJvY2Vzc2luZ1xuLy9cblxuXHQvLyBTaW1wbGUgYmxvY2sgY2xhc3MgZm9yIGBicmVha0ludG9CbG9ja3NgLlxuXHRCbG9jazogY2xhc3MgYmxvY2sge1xuXHRcdGNvbnN0cnVjdG9yKHByb3BzKXtcblx0XHRcdE9iamVjdC5hc3NpZ24odGhpcywgcHJvcHMpO1xuXHRcdFx0aWYgKCF0aGlzLmNvbnRlbnRzKSB0aGlzLmNvbnRlbnRzID0gW107XG5cdFx0fVxuXG5cdFx0dG9TdHJpbmcoKSB7XG5cdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcywgbnVsbCwgXCJcXHRcIik7XG5cdFx0fVxuXHR9LFxuXG5cdC8vIEJyZWFrIHRva2VucyBpbnRvIGFuIGFycmF5IG9mIGFycmF5cyBieSBgTkVXTElORWBzLlxuXHQvLyBSZXR1cm5zIGFuIGFycmF5IG9mIGxpbmVzIFdJVEhPVVQgdGhlIGBORVdMSU5FYHMuXG5cdC8vIExpbmVzIHdoaWNoIGFyZSBjb21wb3NlZCBzb2xlbHkgb2Ygd2hpdGVzcGFjZSBhcmUgdHJlYXRlZCBhcyBibGFuay5cblx0YnJlYWtJbnRvTGluZXModG9rZW5zKSB7XG5cdFx0Ly8gQ29udmVydCB0byBsaW5lcy5cblx0XHRsZXQgY3VycmVudExpbmUgPSBbXTtcblx0XHRsZXQgbGluZXMgPSBbY3VycmVudExpbmVdO1xuXHRcdHRva2Vucy5mb3JFYWNoKHRva2VuID0+IHtcblx0XHRcdC8vIGFkZCBuZXcgYXJyYXkgZm9yIGVhY2ggbmV3bGluZVxuXHRcdFx0aWYgKHRva2VuID09PSBUb2tlbml6ZXIuTkVXTElORSkge1xuXHRcdFx0XHQvLyBjcmVhdGUgYSBuZXcgbGluZSBhbmQgcHVzaCBpdCBpblxuXHRcdFx0XHRjdXJyZW50TGluZSA9IFtdO1xuXHRcdFx0XHRyZXR1cm4gbGluZXMucHVzaChjdXJyZW50TGluZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIG90aGVyd2lzZSBqdXN0IGFkZCB0byB0aGUgY3VycmVudCBsaW5lXG5cdFx0XHRjdXJyZW50TGluZS5wdXNoKHRva2VuKTtcblx0XHR9KTtcblxuXHRcdC8vIENsZWFyIGFueSBsaW5lcyB0aGF0IGFyZSBvbmx5IHdoaXRlc3BhY2Vcblx0XHRsaW5lcy5mb3JFYWNoKChsaW5lLCBpbmRleCkgPT4ge1xuXHRcdFx0aWYgKGxpbmUubGVuZ3RoID09PSAxICYmIGxpbmVbMF0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuV2hpdGVzcGFjZSkgbGluZXNbaW5kZXhdID0gW107XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gbGluZXM7XG5cdH0sXG5cblx0Ly8gUmV0dXJuIGluZGVudHMgb2YgdGhlIHNwZWNpZmllZCBsaW5lcy5cblx0Ly8gSW5kZW50cyBlbXB0eSBsaW5lcyAoTkVXTElORXMpIGludG8gdGhlIGJsb2NrIEFGVEVSIHRoZXkgYXBwZWFyLlxuXHRnZXRMaW5lSW5kZW50cyhsaW5lcywgZGVmYXVsdEluZGVudCA9IDApIHtcblx0XHRpZiAobGluZXMubGVuZ3RoID09PSAwKSByZXR1cm4gW107XG5cblx0XHRjb25zdCBpbmRlbnRzID0gbGluZXMubWFwKFRva2VuaXplci5nZXRMaW5lSW5kZW50KTtcblx0XHRjb25zdCBlbmQgPSBpbmRlbnRzLmxlbmd0aDtcblxuXHRcdC8vIGZpZ3VyZSBvdXQgdGhlIGluZGVudCBvZiB0aGUgZmlyc3Qgbm9uLWVtcHR5IGxpbmVcblx0XHRsZXQgc3RhcnRJbmRlbnQgPSBnZXROZXh0SW5kZW50KDApO1xuXHRcdGlmIChzdGFydEluZGVudCA9PT0gdW5kZWZpbmVkKSBzdGFydEluZGVudCA9IGRlZmF1bHRJbmRlbnQ7XG5cblx0XHQvLyBpbmRlbnQgYmxhbmsgbGluZXMgdG8gdGhlIGluZGVudCBBRlRFUiB0aGVtXG5cdFx0Zm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGVuZDsgaW5kZXgrKykge1xuXHRcdFx0aWYgKGluZGVudHNbaW5kZXhdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0aW5kZW50c1tpbmRleF0gPSBnZXROZXh0SW5kZW50KGluZGV4ICsgMSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBpbmRlbnRzO1xuXG5cdFx0Ly8gUmV0dXJuIHRoZSB2YWx1ZSBvZiB0aGUgTkVYVCBub24tdW5kZWZpbmVkIGluZGVudC5cblx0XHRmdW5jdGlvbiBnZXROZXh0SW5kZW50KGluZGV4KSB7XG5cdFx0XHR3aGlsZSAoaW5kZXggPCBlbmQpIHtcblx0XHRcdFx0aWYgKGluZGVudHNbaW5kZXhdICE9PSB1bmRlZmluZWQpIHJldHVybiBpbmRlbnRzW2luZGV4XTtcblx0XHRcdFx0aW5kZXgrKztcblx0XHRcdH1cblx0XHRcdHJldHVybiBzdGFydEluZGVudDtcblx0XHR9XG5cdH0sXG5cblxuXHQvLyBSZXR1cm4gdGhlIGluZGVudCBvZiBhIGxpbmUgb2YgdG9rZW5zLlxuXHQvLyBSZXR1cm5zIGAwYCBpZiBub3QgaW5kZW50ZWQuXG5cdC8vIFJldHVybnMgYHVuZGVmaW5lZGAgaWYgYSBibGFuayBsaW5lLlxuXHRnZXRMaW5lSW5kZW50KGxpbmUpIHtcblx0XHRpZiAoIWxpbmUgfHwgbGluZS5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0aWYgKGxpbmVbMF0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuSW5kZW50KSByZXR1cm4gbGluZVswXS5sZW5ndGg7XG5cdFx0cmV0dXJuIDA7XG5cdH0sXG5cblx0Ly8gQnJlYWsgYHRva2Vuc2AgYmV0d2VlbiBgc3RhcnRgIGFuZCBgZW5kYCBpbnRvIGEgYFRva2VuaXplci5CbG9ja2Agd2l0aCBuZXN0ZWQgYGNvbnRlbnRzYC5cblx0Ly8gU2tpcHMgXCJub3JtYWxcIiB3aGl0ZXNwYWNlIGFuZCBpbmRlbnRzIGluIHRoZSByZXN1bHRzLlxuXHRicmVha0ludG9CbG9ja3M6IGZ1bmN0aW9uKHRva2Vucywgc3RhcnQgPSAwLCBlbmQgPSB0b2tlbnMubGVuZ3RoKSB7XG5cdFx0Ly8gcmVzdHJpY3QgdG8gdG9rZW5zIG9mIGludGVyZXN0XG5cdFx0dG9rZW5zID0gdG9rZW5zLnNsaWNlKHN0YXJ0LCBlbmQpO1xuXHRcdC8vIHJlbW92ZSBcIm5vcm1hbFwiIHdoaXRlc3BhY2Vcbi8vVE9ETzogYmV0dGVyIHRvIGxlYXZlIHRoaXMgdG8gY29uc3VtZXJzPz8/XG5cdFx0dG9rZW5zID0gVG9rZW5pemVyLnJlbW92ZU5vcm1hbFdoaXRlc3BhY2UodG9rZW5zKTtcblxuXHRcdC8vIGJyZWFrIGludG8gbGluZXMgJiByZXR1cm4gZWFybHkgaWYgbm8gbGluZXNcblx0XHRsZXQgbGluZXMgPSBUb2tlbml6ZXIuYnJlYWtJbnRvTGluZXModG9rZW5zKTtcblx0XHRpZiAobGluZXMubGVuZ3RoID09PSAwKSByZXR1cm4gW107XG5cblx0XHQvLyBmaWd1cmUgb3V0IGluZGVudHNcblx0XHRsZXQgaW5kZW50cyA9IFRva2VuaXplci5nZXRMaW5lSW5kZW50cyhsaW5lcyk7XG5cblx0XHQvLyBGaXJzdCBibG9jayBpcyBhdCB0aGUgTUlOSU1VTSBpbmRlbnQgb2YgYWxsIGxpbmVzIVxuXHRcdGxldCBtYXhJbmRlbnQgPSBNYXRoLm1pbi5hcHBseShNYXRoLCBpbmRlbnRzKTtcblx0XHRsZXQgYmxvY2sgPSBuZXcgVG9rZW5pemVyLkJsb2NrKHsgaW5kZW50OiBtYXhJbmRlbnQgfSk7XG5cblx0XHQvLyBzdGFjayBvZiBibG9ja3Ncblx0XHRsZXQgc3RhY2sgPSBbYmxvY2tdO1xuXG5cdFx0bGluZXMuZm9yRWFjaCggKGxpbmUsIGluZGV4KSA9PiB7XG5cdFx0XHQvLyBSZW1vdmUgbGVhZGluZyB3aGl0ZXNwYWNlIChlZzogaW5kZW50cylcblx0XHRcdGxpbmUgPSBUb2tlbml6ZXIucmVtb3ZlTGVhZGluZ1doaXRlc3BhY2UobGluZSk7XG5cblx0XHRcdGxldCBsaW5lSW5kZW50ID0gaW5kZW50c1tpbmRleF07XG5cdFx0XHRsZXQgdG9wID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG5cdFx0XHQvLyBJZiBpbmRlbnRpbmcsIHB1c2ggbmV3IGJsb2NrKHMpXG5cdFx0XHRpZiAobGluZUluZGVudCA+IHRvcC5pbmRlbnQpIHtcblx0XHRcdFx0d2hpbGUgKGxpbmVJbmRlbnQgPiB0b3AuaW5kZW50KSB7XG5cdFx0XHRcdFx0dmFyIG5ld0Jsb2NrID0gbmV3IFRva2VuaXplci5CbG9jayh7IGluZGVudDogdG9wLmluZGVudCArIDEgfSk7XG5cdFx0XHRcdFx0dG9wLmNvbnRlbnRzLnB1c2gobmV3QmxvY2spO1xuXHRcdFx0XHRcdHN0YWNrLnB1c2gobmV3QmxvY2spO1xuXG5cdFx0XHRcdFx0dG9wID0gbmV3QmxvY2s7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIElmIG91dGRlbnRpbmc6IHBvcCBibG9jayhzKVxuXHRcdFx0ZWxzZSBpZiAobGluZUluZGVudCA8IHRvcC5pbmRlbnQpIHtcblx0XHRcdFx0d2hpbGUgKGxpbmVJbmRlbnQgPCB0b3AuaW5kZW50KSB7XG5cdFx0XHRcdFx0c3RhY2sucG9wKCk7XG5cdFx0XHRcdFx0dG9wID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIGFkZCB0byB0b3AgYmxvY2tcblx0XHRcdHRvcC5jb250ZW50cy5wdXNoKGxpbmUpO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGJsb2NrO1xuXHR9LFxuXG5cblxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBUb2tlbml6ZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvVG9rZW5pemVyLmpzIiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHsgdmVyc2lvbjogJzIuNS43JyB9O1xuaWYgKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpIF9fZSA9IGNvcmU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanNcbi8vIG1vZHVsZSBpZCA9IDkxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faXMtb2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSA5MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyB0byBpbmRleGVkIG9iamVjdCwgdG9PYmplY3Qgd2l0aCBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIHN0cmluZ3NcbnZhciBJT2JqZWN0ID0gcmVxdWlyZSgnLi9faW9iamVjdCcpO1xudmFyIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gSU9iamVjdChkZWZpbmVkKGl0KSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qc1xuLy8gbW9kdWxlIGlkID0gOTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGlkID0gMDtcbnZhciBweCA9IE1hdGgucmFuZG9tKCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL191aWQuanNcbi8vIG1vZHVsZSBpZCA9IDk0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlxuLyoqXG4gKiBXaGVuIHNvdXJjZSBtYXBzIGFyZSBlbmFibGVkLCBgc3R5bGUtbG9hZGVyYCB1c2VzIGEgbGluayBlbGVtZW50IHdpdGggYSBkYXRhLXVyaSB0b1xuICogZW1iZWQgdGhlIGNzcyBvbiB0aGUgcGFnZS4gVGhpcyBicmVha3MgYWxsIHJlbGF0aXZlIHVybHMgYmVjYXVzZSBub3cgdGhleSBhcmUgcmVsYXRpdmUgdG8gYVxuICogYnVuZGxlIGluc3RlYWQgb2YgdGhlIGN1cnJlbnQgcGFnZS5cbiAqXG4gKiBPbmUgc29sdXRpb24gaXMgdG8gb25seSB1c2UgZnVsbCB1cmxzLCBidXQgdGhhdCBtYXkgYmUgaW1wb3NzaWJsZS5cbiAqXG4gKiBJbnN0ZWFkLCB0aGlzIGZ1bmN0aW9uIFwiZml4ZXNcIiB0aGUgcmVsYXRpdmUgdXJscyB0byBiZSBhYnNvbHV0ZSBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgcGFnZSBsb2NhdGlvbi5cbiAqXG4gKiBBIHJ1ZGltZW50YXJ5IHRlc3Qgc3VpdGUgaXMgbG9jYXRlZCBhdCBgdGVzdC9maXhVcmxzLmpzYCBhbmQgY2FuIGJlIHJ1biB2aWEgdGhlIGBucG0gdGVzdGAgY29tbWFuZC5cbiAqXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzKSB7XG4gIC8vIGdldCBjdXJyZW50IGxvY2F0aW9uXG4gIHZhciBsb2NhdGlvbiA9IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93LmxvY2F0aW9uO1xuXG4gIGlmICghbG9jYXRpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJmaXhVcmxzIHJlcXVpcmVzIHdpbmRvdy5sb2NhdGlvblwiKTtcbiAgfVxuXG5cdC8vIGJsYW5rIG9yIG51bGw/XG5cdGlmICghY3NzIHx8IHR5cGVvZiBjc3MgIT09IFwic3RyaW5nXCIpIHtcblx0ICByZXR1cm4gY3NzO1xuICB9XG5cbiAgdmFyIGJhc2VVcmwgPSBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIGxvY2F0aW9uLmhvc3Q7XG4gIHZhciBjdXJyZW50RGlyID0gYmFzZVVybCArIGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcL1teXFwvXSokLywgXCIvXCIpO1xuXG5cdC8vIGNvbnZlcnQgZWFjaCB1cmwoLi4uKVxuXHQvKlxuXHRUaGlzIHJlZ3VsYXIgZXhwcmVzc2lvbiBpcyBqdXN0IGEgd2F5IHRvIHJlY3Vyc2l2ZWx5IG1hdGNoIGJyYWNrZXRzIHdpdGhpblxuXHRhIHN0cmluZy5cblxuXHQgL3VybFxccypcXCggID0gTWF0Y2ggb24gdGhlIHdvcmQgXCJ1cmxcIiB3aXRoIGFueSB3aGl0ZXNwYWNlIGFmdGVyIGl0IGFuZCB0aGVuIGEgcGFyZW5zXG5cdCAgICggID0gU3RhcnQgYSBjYXB0dXJpbmcgZ3JvdXBcblx0ICAgICAoPzogID0gU3RhcnQgYSBub24tY2FwdHVyaW5nIGdyb3VwXG5cdCAgICAgICAgIFteKShdICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICB8ICA9IE9SXG5cdCAgICAgICAgIFxcKCAgPSBNYXRjaCBhIHN0YXJ0IHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAoPzogID0gU3RhcnQgYW5vdGhlciBub24tY2FwdHVyaW5nIGdyb3Vwc1xuXHQgICAgICAgICAgICAgICAgIFteKShdKyAgPSBNYXRjaCBhbnl0aGluZyB0aGF0IGlzbid0IGEgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICB8ICA9IE9SXG5cdCAgICAgICAgICAgICAgICAgXFwoICA9IE1hdGNoIGEgc3RhcnQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICAgICAgW14pKF0qICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgIFxcKSAgPSBNYXRjaCBhIGVuZCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgKSAgPSBFbmQgR3JvdXBcbiAgICAgICAgICAgICAgKlxcKSA9IE1hdGNoIGFueXRoaW5nIGFuZCB0aGVuIGEgY2xvc2UgcGFyZW5zXG4gICAgICAgICAgKSAgPSBDbG9zZSBub24tY2FwdHVyaW5nIGdyb3VwXG4gICAgICAgICAgKiAgPSBNYXRjaCBhbnl0aGluZ1xuICAgICAgICkgID0gQ2xvc2UgY2FwdHVyaW5nIGdyb3VwXG5cdCBcXCkgID0gTWF0Y2ggYSBjbG9zZSBwYXJlbnNcblxuXHQgL2dpICA9IEdldCBhbGwgbWF0Y2hlcywgbm90IHRoZSBmaXJzdC4gIEJlIGNhc2UgaW5zZW5zaXRpdmUuXG5cdCAqL1xuXHR2YXIgZml4ZWRDc3MgPSBjc3MucmVwbGFjZSgvdXJsXFxzKlxcKCgoPzpbXikoXXxcXCgoPzpbXikoXSt8XFwoW14pKF0qXFwpKSpcXCkpKilcXCkvZ2ksIGZ1bmN0aW9uKGZ1bGxNYXRjaCwgb3JpZ1VybCkge1xuXHRcdC8vIHN0cmlwIHF1b3RlcyAoaWYgdGhleSBleGlzdClcblx0XHR2YXIgdW5xdW90ZWRPcmlnVXJsID0gb3JpZ1VybFxuXHRcdFx0LnRyaW0oKVxuXHRcdFx0LnJlcGxhY2UoL15cIiguKilcIiQvLCBmdW5jdGlvbihvLCAkMSl7IHJldHVybiAkMTsgfSlcblx0XHRcdC5yZXBsYWNlKC9eJyguKiknJC8sIGZ1bmN0aW9uKG8sICQxKXsgcmV0dXJuICQxOyB9KTtcblxuXHRcdC8vIGFscmVhZHkgYSBmdWxsIHVybD8gbm8gY2hhbmdlXG5cdFx0aWYgKC9eKCN8ZGF0YTp8aHR0cDpcXC9cXC98aHR0cHM6XFwvXFwvfGZpbGU6XFwvXFwvXFwvKS9pLnRlc3QodW5xdW90ZWRPcmlnVXJsKSkge1xuXHRcdCAgcmV0dXJuIGZ1bGxNYXRjaDtcblx0XHR9XG5cblx0XHQvLyBjb252ZXJ0IHRoZSB1cmwgdG8gYSBmdWxsIHVybFxuXHRcdHZhciBuZXdVcmw7XG5cblx0XHRpZiAodW5xdW90ZWRPcmlnVXJsLmluZGV4T2YoXCIvL1wiKSA9PT0gMCkge1xuXHRcdCAgXHQvL1RPRE86IHNob3VsZCB3ZSBhZGQgcHJvdG9jb2w/XG5cdFx0XHRuZXdVcmwgPSB1bnF1b3RlZE9yaWdVcmw7XG5cdFx0fSBlbHNlIGlmICh1bnF1b3RlZE9yaWdVcmwuaW5kZXhPZihcIi9cIikgPT09IDApIHtcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlIHJlbGF0aXZlIHRvIHRoZSBiYXNlIHVybFxuXHRcdFx0bmV3VXJsID0gYmFzZVVybCArIHVucXVvdGVkT3JpZ1VybDsgLy8gYWxyZWFkeSBzdGFydHMgd2l0aCAnLydcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgcmVsYXRpdmUgdG8gY3VycmVudCBkaXJlY3Rvcnlcblx0XHRcdG5ld1VybCA9IGN1cnJlbnREaXIgKyB1bnF1b3RlZE9yaWdVcmwucmVwbGFjZSgvXlxcLlxcLy8sIFwiXCIpOyAvLyBTdHJpcCBsZWFkaW5nICcuLydcblx0XHR9XG5cblx0XHQvLyBzZW5kIGJhY2sgdGhlIGZpeGVkIHVybCguLi4pXG5cdFx0cmV0dXJuIFwidXJsKFwiICsgSlNPTi5zdHJpbmdpZnkobmV3VXJsKSArIFwiKVwiO1xuXHR9KTtcblxuXHQvLyBzZW5kIGJhY2sgdGhlIGZpeGVkIGNzc1xuXHRyZXR1cm4gZml4ZWRDc3M7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3N0eWxlLWxvYWRlci9maXhVcmxzLmpzXG4vLyBtb2R1bGUgaWQgPSA5NDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL1NwYWNlci5sZXNzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHt9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9hZGRTdHlsZXMuanNcIikoY29udGVudCwgb3B0aW9ucyk7XG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2Fscztcbi8vIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnRcbmlmKG1vZHVsZS5ob3QpIHtcblx0Ly8gV2hlbiB0aGUgc3R5bGVzIGNoYW5nZSwgdXBkYXRlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0aWYoIWNvbnRlbnQubG9jYWxzKSB7XG5cdFx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL1NwYWNlci5sZXNzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9TcGFjZXIubGVzc1wiKTtcblx0XHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXHRcdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHRcdH0pO1xuXHR9XG5cdC8vIFdoZW4gdGhlIG1vZHVsZSBpcyBkaXNwb3NlZCwgcmVtb3ZlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvYXBwL1NwYWNlci5sZXNzXG4vLyBtb2R1bGUgaWQgPSA5NDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlcy5sZXNzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHt9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9hZGRTdHlsZXMuanNcIikoY29udGVudCwgb3B0aW9ucyk7XG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2Fscztcbi8vIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnRcbmlmKG1vZHVsZS5ob3QpIHtcblx0Ly8gV2hlbiB0aGUgc3R5bGVzIGNoYW5nZSwgdXBkYXRlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0aWYoIWNvbnRlbnQubG9jYWxzKSB7XG5cdFx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlcy5sZXNzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZXMubGVzc1wiKTtcblx0XHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXHRcdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHRcdH0pO1xuXHR9XG5cdC8vIFdoZW4gdGhlIG1vZHVsZSBpcyBkaXNwb3NlZCwgcmVtb3ZlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvYXBwL3N0eWxlcy5sZXNzXG4vLyBtb2R1bGUgaWQgPSA5NDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy9cbi8vICAjIENsYXNzIHV0aWxpdGllc1xuLy9cblxuLy8gQ2xvbmUgYSBjbGFzcywgcmUtdXNpbmcgdGhlIG9yaWdpbmFsIG5hbWUuXG4vLyBUT0RPOiBtb3ZlIHRvIHV0aWxpdHk/XG5leHBvcnQgZnVuY3Rpb24gY2xvbmVDbGFzcyhjb25zdHJ1Y3RvciwgbmFtZSA9IGNvbnN0cnVjdG9yLm5hbWUpIHtcbiAgLy8gQ2xvbmUgdGhlIGNvbnN0cnVjdG9yLCBrZWVwaW5nIHRoZSBzYW1lIG5hbWVcbiAgZ2xvYmFsLl9fY2xvbmVDbGFzc19fID0gY29uc3RydWN0b3I7XG4gIGNvbnN0IGNsb25lID0gbmV3IEZ1bmN0aW9uKFwibmFtZVwiLCBgcmV0dXJuIGNsYXNzICR7bmFtZX0gZXh0ZW5kcyBfX2Nsb25lQ2xhc3NfXyB7fWApKCk7XG4gIGRlbGV0ZSBnbG9iYWwuX19jbG9uZUNsYXNzX187XG4gIHJldHVybiBjbG9uZTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91dGlscy9jbGFzcy5qcyIsInZhciBzdG9yZSA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpKCd3a3MnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuL191aWQnKTtcbnZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5TeW1ib2w7XG52YXIgVVNFX1NZTUJPTCA9IHR5cGVvZiBTeW1ib2wgPT0gJ2Z1bmN0aW9uJztcblxudmFyICRleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID1cbiAgICBVU0VfU1lNQk9MICYmIFN5bWJvbFtuYW1lXSB8fCAoVVNFX1NZTUJPTCA/IFN5bWJvbCA6IHVpZCkoJ1N5bWJvbC4nICsgbmFtZSkpO1xufTtcblxuJGV4cG9ydHMuc3RvcmUgPSBzdG9yZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3drcy5qc1xuLy8gbW9kdWxlIGlkID0gOTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==