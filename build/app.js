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


// Create "JSX" parser context.
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
      value: function attrsToSource(context) {
        var _this2 = this;

        var jsxElement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.matched;

        var attributes = jsxElement.attributes;
        if (!attributes || !attributes.length) return undefined;

        var attrs = attributes.map(function (_ref) {
          var name = _ref.name,
              value = _ref.value;

          // if NO value, assume it's a variable of the same name
          if (value === undefined) value = name;
          // if it's an array, it's a spell expression, possibly with nested JSX elements...
          else if (value instanceof _Tokenizer2.default.JSXExpression) {
              value = _this2.jsxExpressionToSource(context, value);
            }
            // else if a JSX element, recurse
            //TODO: indent...
            else if (value instanceof _Tokenizer2.default.JSXElement) {
                value = value.toSource(context);
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
      value: function childrenToSource(context) {
        var _this3 = this;

        var jsxElement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.matched;

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
            var childSource = _this3.jsxElementToSource(context, child);
            return childSource.split("\n").join("\n\t");
          }
          if (child instanceof _Tokenizer2.default.JSXExpression) {
            return _this3.jsxExpressionToSource(context, child);
          }
          throw new SyntaxError("childrenToSource(): don't understand child" + child);
        })
        // remove undefined/empty string rules
        .filter(Boolean);
      }

      // Convert JSX expression ( `{...}` ) to JS source.

    }, {
      key: "jsxExpressionToSource",
      value: function jsxExpressionToSource(context, jsxExpression) {
        var tokens = jsxExpression.tokens;
        console.info(jsxExpression, tokens);
        return "/" + ("*TODO: " + tokens.join(" ") + "*") + "/";
      }
    }, {
      key: "jsxElementToSource",
      value: function jsxElementToSource(context) {
        var jsxElement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.matched;

        // get the bits of the output
        var tagName = "\"" + jsxElement.tagName + "\"";
        var attrs = this.attrsToSource(context, jsxElement);
        var children = this.childrenToSource(context, jsxElement);

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
      value: function toSource(context) {
        return this.jsxElementToSource(context, this.matched);
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

// Create "if" parser context.
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
      value: function toSource(context) {
        var _getMatchedSource = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource2 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource3 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource4 = this.getMatchedSource(context),
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

// Create "lists" parser context.
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
      value: function toSource(context) {
        var _getMatchedSource = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource2 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource3 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource4 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource5 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource6 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource7 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource8 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource9 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource10 = this.getMatchedSource(context),
            identifier = _getMatchedSource10.identifier,
            condition = _getMatchedSource10.condition,
            list = _getMatchedSource10.list;
        // use singular of identifier for method argument


        var argument = (0, _string.singularize)(identifier.toSource(context));
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
      value: function toSource(context) {
        var _getMatchedSource11 = this.getMatchedSource(context),
            identifier = _getMatchedSource11.identifier,
            operator = _getMatchedSource11.operator,
            filter = _getMatchedSource11.filter,
            list = _getMatchedSource11.list;

        var bang = operator === "has" ? "" : "!";
        // use singular of identifier for method argument
        var argument = (0, _string.singularize)(identifier.toSource(context));
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
      value: function toSource(context) {
        var _getMatchedSource12 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource13 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource14 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource15 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource16 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource17 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource18 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource19 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource20 = this.getMatchedSource(context),
            identifier = _getMatchedSource20.identifier,
            condition = _getMatchedSource20.condition,
            list = _getMatchedSource20.list;
        // use singular of identifier for method argument


        var argument = (0, _string.singularize)(identifier.toSource(context));
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
      value: function toSource(context) {
        var _getMatchedSource21 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource22 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource23 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource24 = this.getMatchedSource(context),
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

// Create "operators" parser context.
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
      value: function toSource(context) {
        var _results = this.results,
            lhs = _results.lhs,
            rhs = _results.rhs,
            operator = _results.operator;

        return operator.apply(lhs.toSource(context), rhs.toSource(context));
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
      value: function toSource(context) {
        var _results2 = this.results,
            expression = _results2.expression,
            operator = _results2.operator;

        return operator.apply(expression.toSource(context));
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

// Create "statements" parser context.
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
      value: function toSource(context) {
        var _getMatchedSource = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource2 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource3 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource4 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource5 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource6 = this.getMatchedSource(context),
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
      value: function toStructure(context) {
        var structure = _get(define_type.prototype.__proto__ || Object.getPrototypeOf(define_type.prototype), "toStructure", this).call(this, context);
        structure.type = "class";
        return structure;
      }
    }, {
      key: "toSource",
      value: function toSource(context) {
        var _getMatchedSource = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource2 = this.getMatchedSource(context),
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
      value: function toStructure(context) {
        var _getMatchedSource3 = this.getMatchedSource(context),
            operator = _getMatchedSource3.operator,
            name = _getMatchedSource3.name,
            _getMatchedSource3$ar = _getMatchedSource3.args,
            args = _getMatchedSource3$ar === undefined ? [] : _getMatchedSource3$ar;

        var subType = operator === "to" ? "method" : "event";
        return { type: "function", subType: subType, name: name, args: args };
      }
    }, {
      key: "toSource",
      value: function toSource(context) {
        var _getMatchedSource4 = this.getMatchedSource(context),
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
      value: function getMatchedSource(context) {
        var output = _get(declare_action.prototype.__proto__ || Object.getPrototypeOf(declare_action.prototype), "getMatchedSource", this).call(this, context);

        // if there's only one keyword, it can't be a blacklisted identifier or a type
        var keywords = output.keywords;

        var keywordMatches = this.results.keywords.matched;
        if (keywords.length === 1) {
          var keyword = keywords[0];
          if (keywordMatches[0] instanceof _Rule2.default.Type) {
            console.error("parse('declare_action'): one-word actions may not be types: " + keyword);
          }

          // HACK: `global.parser` is a hack here for convenience in testing...
          var parser = context && context.parser || _global2.default.parser;
          var blacklist = parser.getBlacklist("identifier");
          if (blacklist[keyword]) {
            console.error("parse('declare_action'): one-word actions may not be blacklisted identifiers\": " + keyword);
          }
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
      value: function toSource(context) {
        var _getMatchedSource5 = this.getMatchedSource(context),
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
      value: function toStructure(context) {
        var _getMatchedSource6 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource7 = this.getMatchedSource(context),
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
      value: function toStructure(context) {
        var _getMatchedSource8 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        // default args to the setter name
        var _getMatchedSource9 = this.getMatchedSource(context),
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
      value: function toStructure(context) {
        var _getMatchedSource10 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource11 = this.getMatchedSource(context),
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
      value: function toStructure(context) {
        var _getMatchedSource12 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource13 = this.getMatchedSource(context),
            name = _getMatchedSource13.name,
            type = _getMatchedSource13.type;

        return "get " + name + "() { return this.__" + name + " }\n" + ("set " + name + "(value) { if (spell.isA(value, " + type + ") this.__" + name + " = value }");
      }

      // Return a logical representation of the data structure

    }, {
      key: "toStructure",
      value: function toStructure(context) {
        var _getMatchedSource14 = this.getMatchedSource(context),
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
      value: function getMatchedSource(context) {
        var output = _get(declare_property_as_one_of.prototype.__proto__ || Object.getPrototypeOf(declare_property_as_one_of.prototype), "getMatchedSource", this).call(this, context);
        output.plural = (0, _string.pluralize)(output.name);
        return output;
      }
    }, {
      key: "toSource",
      value: function toSource(context) {
        var _getMatchedSource15 = this.getMatchedSource(context),
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
      value: function toStructure(context) {
        var _getMatchedSource16 = this.getMatchedSource(context),
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
      value: function toSource(context) {
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
      value: function toSource(context) {
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
      value: function getMatchedSource(context) {
        var _results = this.results,
            expression = _results.expression,
            properties = _results.properties;

        return {
          expression: expression.toSource(context),
          properties: properties.matched.map(function (property) {
            return property.results.identifier.toSource(context);
          })
        };
      }
    }, {
      key: "toSource",
      value: function toSource(context) {
        var _getMatchedSource17 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var _getMatchedSource18 = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var props = this.results.matched.map(function (prop) {
          var _prop$results = prop.results,
              key = _prop$results.key,
              value = _prop$results.value;

          key = key.toSource(context);
          value = value && value.toSource(context);
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
      value: function toSource(context) {
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


// Create `core` parser context.
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
      value: function toSource(context) {
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
      value: function toSource(context) {
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
      value: function toSource(context) {
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
      value: function toSource(context) {
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
      value: function toSource(context) {
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
          matched: token,
          nextStart: start + 1
        });
      }
    }, {
      key: "toSource",
      value: function toSource(context) {
        return this.matched.quotedString;
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
      value: function toSource(context) {
        var _getMatchedSource = this.getMatchedSource(context),
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
      value: function toSource(context) {
        var expression = this.results.toSource(context);
        // don't double parens if not necessary
        if (typeof expression === "string" && expression.startsWith("(") && expression.endsWith(")")) return expression;
        return "(" + expression + ")";
      }
    }, {
      key: "results",
      get: function get() {
        return this.matched[1];
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
//		- `rule.toSource(context)`	Return javascript source to interpret the rule.
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
		value: function toSource(context) {
			return this.matched;
		}

		//
		// ## output as structure:
		//

	}, {
		key: "toStructure",
		value: function toStructure(context) {
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
					//TODO: unclear that promote should return, that will ignore subsequent stuff, right?
					return this._addResults(results, match.matched);
				} else {
					var argName = match.argument || match.group || match.constructor.name;
					// If arg already exists, convert to an array
					if (argName in results) {
						if (!Array.isArray(results[argName])) results[argName] = [results[argName]];
						results[argName].push(match);
					} else {
						results[argName] = match;
					}
				}
			}
			return results;
		}

		// Return `toSource()` for our `results` as a map.
		// If you pass `keys`, we'll restrict to just those keys.

	}, {
		key: "getMatchedSource",
		value: function getMatchedSource(context) {
			var results = this.results;
			var output = {};
			Object.keys(results).forEach(function (key) {
				var value = results[key];
				if (value == null) return;
				if (value.toSource) output[key] = value.toSource(context);else output[key] = value;
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

		// "gather" arguments in preparation to call `toSource()`
		// Only callable after parse is completed.
		// Returns an array with arguments of all results.

	}, {
		key: "toSource",
		value: function toSource(context) {
			if (!this.matched) return undefined;
			return this.matched.map(function (match) {
				return match.toSource(context);
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
	}, {
		key: "results",
		get: function get() {
			if (!this.matched) return [];
			return this.matched.map(function (match) {
				return match.results || match.matched;
			});
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
		value: function toSource(context) {
			if (!this.matched) return [];
			return this.matched.map(function (match) {
				return match.toSource(context);
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
		value: function blockToSource(context) {
			var block = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.matched;

			var results = [],
			    statement = void 0;

			for (var i = 0; i < block.length; i++) {
				var match = block[i];
				//console.info(i, match);
				try {
					statement = match.toSource(context) || "";
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
		value: function toSource(context) {
			return " {\n" + this.blockToSource(context) + "\n" + "}";
		}

		// Convert to logical representation of structure by converting individual statements and grouping
		// NOTE: you should override this and include "type"

	}, {
		key: "toStructure",
		value: function toStructure(context) {
			var _getMatchedSource = this.getMatchedSource(context),
			    name = _getMatchedSource.name,
			    superType = _getMatchedSource.superType;

			var block = this.block && this.block.matched || [];

			var named = {};
			var properties = [];
			var methods = [];
			var other = [];
			block.map(function (statement) {
				return statement.toStructure(context);
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
		value: function toSource(context) {
			return this.matched.blockToSource(context);
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
		value: function getMatchedSource(context) {
			var _get2;

			for (var _len5 = arguments.length, keys = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
				keys[_key5 - 1] = arguments[_key5];
			}

			var output = (_get2 = _get(block_statement.prototype.__proto__ || Object.getPrototypeOf(block_statement.prototype), "getMatchedSource", this)).call.apply(_get2, [this, context].concat(keys));
			// add `block` to output if defined.
			if (this.block) {
				output.block = this.block.blockToSource(context);
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
		value: function toSource(context) {
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
		value: function toSource(context) {
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

		for (var _len6 = arguments.length, props = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
			props[_key6] = arguments[_key6];
		}

		var _this16 = _possibleConstructorReturn(this, (_ref3 = parse_error.__proto__ || Object.getPrototypeOf(parse_error)).call.apply(_ref3, [this].concat(props)));

		if (_Parser2.default.WARN) console.warn(_this16.message);
		return _this16;
	}

	_createClass(parse_error, [{
		key: "toSource",
		value: function toSource(context) {
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
// You can specify that the results should be `promoted` to enclosing context with: `(?:...)`
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvc3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2ZhaWxzLmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9saWIva2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvc3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY29mLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19saWJyYXJ5LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LXBpZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcG4uanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLWtleS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW50ZWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fd2tzLWV4dC5qcyIsIndlYnBhY2s6Ly8vLi9+L2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL3NyYy9QYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9ldmVudF9oYW5kbGVycy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL21hdGNoX2tleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9wYXJzZV9rZXlzLmpzIiwid2VicGFjazovLy8uL34vc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL1NwZWxsRWRpdG9yLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvcnVsZXMvc3BlbGwvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9FeGFtcGxlU3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL1NwYWNlci5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9UYWJiYWJsZVRleHRBcmVhLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL2luZGV4LmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL3V0aWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21lbW9pemUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL0pTWC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcnVsZXMvc3BlbGwvaWYuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL2xpc3RzLmpzIiwid2VicGFjazovLy8uL3NyYy9ydWxlcy9zcGVsbC9vcGVyYXRvcnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL3N0YXRlbWVudHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL3R5cGVzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9lczYvc3ltYm9sLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY2xhc3NvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY3R4LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faHRtbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faXMtYXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX21ldGEuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1jcmVhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcHMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wbi1leHQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3NldC10by1zdHJpbmctdGFnLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL190by1hYnNvbHV0ZS1pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tbGVuZ3RoLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL193a3MtZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL2VzNi5zeW1ib2wuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9TcGFjZXIubGVzcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL3N0eWxlcy5sZXNzIiwid2VicGFjazovLy8uL3NyYy9ydWxlcy9zcGVsbC9jb3JlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kZXNjcmlwdG9ycy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faGFzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2ZhY3RvcnlXaXRoVGhyb3dpbmdTaGltcy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9jbGFzc19kZWNvcmF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvbWV0aG9kX2RlY29yYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9tZXRob2RfZGVjb3JhdG9yX3Njb3BlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9hcnJheS5mcm9tLmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvZG9tX2hlbHBlcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9saXN0ZW5lcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi91dWlkLmpzIiwid2VicGFjazovLy8uL3NyYy9SdWxlLmpzIiwid2VicGFjazovLy8uL3NyYy9SdWxlU3ludGF4LmpzIiwid2VicGFjazovLy8uL3NyYy9Ub2tlbml6ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2lzLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdWlkLmpzIiwid2VicGFjazovLy8uL34vc3R5bGUtbG9hZGVyL2ZpeFVybHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9TcGFjZXIubGVzcz8wOGRlIiwid2VicGFjazovLy8uL3NyYy9hcHAvc3R5bGVzLmxlc3M/YjdlNyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvY2xhc3MuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3drcy5qcyJdLCJuYW1lcyI6WyJpc1doaXRlc3BhY2UiLCJwbHVyYWxpemUiLCJpc1BsdXJhbCIsInNpbmd1bGFyaXplIiwiaXNTaW5ndWxhciIsImdldFRhYnMiLCJBTExfV0hJVEVTUEFDRSIsInRleHQiLCJ0ZXN0Iiwid29yZCIsInJlcGxhY2UiLCJUQUJTIiwibnVtYmVyIiwic3Vic3RyIiwiYWxsRXhwb3J0cyIsImV4cG9ydHMiLCJnbG9iYWwiLCJTVFJJTkciLCJnbG9iYWxfaWRlbnRpZmllciIsIndpbmRvdyIsInNlbGYiLCJjb25zb2xlIiwiZ3JvdXAiLCJsb2ciLCJncm91cEVuZCIsIlBhcnNlciIsInByb3BlcnRpZXMiLCJpbXBvcnRzIiwiX3J1bGVzIiwiT2JqZWN0IiwiYXNzaWduIiwicnVsZU5hbWUiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJUSU1FIiwidGltZSIsInRva2VucyIsIlRva2VuaXplciIsInRva2VuaXplIiwiZmlsdGVyIiwiaXNOb3JtYWxXaGl0ZXNwYWNlIiwidG9rZW4iLCJ0aW1lRW5kIiwidW5kZWZpbmVkIiwicmVtb3ZlTGVhZGluZ1doaXRlc3BhY2UiLCJyZXN1bHQiLCJwYXJzZU5hbWVkUnVsZSIsInBhcnNlIiwiU3ludGF4RXJyb3IiLCJ0b1NvdXJjZSIsInN0YXJ0IiwiZW5kIiwic3RhY2siLCJjYWxsaW5nQ29udGV4dCIsInJ1bGUiLCJydWxlcyIsInJldmVyc2UiLCJjb25jYXQiLCJfX3J1bGVzIiwibWFwIiwiZXhpc3RpbmciLCJSdWxlIiwiQWx0ZXJuYXRpdmVzIiwiYWx0Q29uc3RydWN0b3IiLCJhZGRSdWxlIiwiQXJyYXkiLCJpc0FycmF5IiwiZm9yRWFjaCIsIl9tZXJnZVJ1bGUiLCJyZWR1Y2UiLCJibGFja2xpc3QiLCJkZWZpbmVSdWxlIiwibmFtZSIsImNvbnN0cnVjdG9yIiwiYWxpYXMiLCJjYW5vbmljYWwiLCJzeW50YXgiLCJvdGhlclByb3BzIiwibmFtZXMiLCJwcm90b3R5cGUiLCJydWxlTmFtZXMiLCJUeXBlRXJyb3IiLCJkZWZpbmVQcm9wZXJ0eSIsInZhbHVlIiwia2V5Iiwia2V5cyIsIm91dHB1dCIsImZvck5hbWUiLCJwYXJzZXIiLCJSRUdJU1RSWSIsInN0YXJ0VG9rZW4iLCJlbmRUb2tlbiIsIm5lc3RpbmciLCJuZXN0ZWQiLCJsYXN0SW5kZXgiLCJzbGljZSIsIkRFQlVHIiwiV0FSTiIsIlNwZWxsRWRpdG9yIiwib2JzZXJ2ZXIiLCJwcm9wcyIsImV4YW1wbGVzIiwibG9hZCIsInNwZWxsRWRpdG9yIiwic2F2ZSIsInJldmVydCIsImNvbXBpbGUiLCJjcmVhdGUiLCJkZWxldGUiLCJyZW5hbWUiLCJkdXBsaWNhdGUiLCJyZXNldCIsInRpdGxlcyIsInNlbGVjdGVkIiwiZGlydHkiLCJjb2RlIiwib3B0aW9ucyIsInRpdGxlIiwiY29udGVudCIsIm9uQ2xpY2siLCJzZWxlY3QiLCJkaXJ0eUJ1dHRvbnMiLCJwb3NpdGlvbiIsInJpZ2h0IiwidG9wIiwibWFyZ2luIiwiY29tcGlsZUJ1dHRvbiIsIndpZHRoIiwibGVmdCIsImhlaWdodCIsInBhZGRpbmdUb3AiLCJldmVudCIsInVwZGF0ZSIsInRhcmdldCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZGVmYXVsdFByb3BzIiwiRXhhbXBsZVN0b3JlIiwiaW1wb3J0IiwiYmluZCIsImxvY2FsU3RvcmFnZSIsInNwZWxsRWRpdG9yRXhhbXBsZXMiLCJzcGVsbEVkaXRvckV4YW1wbGUiLCJsb2NhdGlvbiIsInJlbG9hZCIsIkpTT04iLCJfc2F2ZWRFeGFtcGxlcyIsInN0cmluZ2lmeSIsImV4YW1wbGUiLCJza2lwU2F2ZSIsInNob3dDb25maXJtIiwiY29uZmlybSIsInByb21wdCIsIm9sZE5hbWUiLCJuZXdOYW1lIiwid2FybiIsInNldFRpbWVvdXQiLCJpbmZvIiwib2JzZXJ2YWJsZSIsImNvbXB1dGVkIiwiU3BhY2VyIiwiY2xhc3NOYW1lIiwiYXBwZWFyYW5jZSIsInNpemUiLCJpbmxpbmUiLCJmbHVpZCIsInRpbnkiLCJzbWFsbCIsIm1lZGl1bSIsImxhcmdlIiwiaHVnZSIsIm1hc3NpdmUiLCJzcGFjZXJQcm9wcyIsInN0eWxlIiwicHJvcFR5cGVzIiwiUHJvcFR5cGVzIiwic3RyaW5nIiwiYm9vbCIsIlRhYmJhYmxlVGV4dEFyZWEiLCJvbktleURvd24iLCJrZXlDb2RlIiwicHJldmVudERlZmF1bHQiLCJlbGVtZW50Iiwic2VsZWN0aW9uU3RhcnQiLCJzZWxlY3Rpb25FbmQiLCJuZXdUZXh0Iiwic2hpZnRLZXkiLCJsYXN0SW5kZXhPZiIsImluZGV4T2YiLCJsaW5lcyIsInNwbGl0IiwibGluZSIsImpvaW4iLCJvbkNoYW5nZSIsIlRleHRBcmVhIiwiUmVhY3RET00iLCJyZW5kZXIiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiY2xhc3NOYW1lcyIsImFyZ3MiLCJhcmciLCJCb29sZWFuIiwibWVtb2l6ZWQiLCJkZWZpbmVNZW1vaXplZCIsInByb3BlcnR5IiwiZ2V0dGVyIiwiYXBwbHkiLCJjb25maWd1cmFibGUiLCJnZXQiLCJkZWZpbmVSdWxlcyIsIkpTWEVsZW1lbnQiLCJjbG9uZSIsIm1hdGNoZWQiLCJuZXh0U3RhcnQiLCJjb250ZXh0IiwianN4RWxlbWVudCIsImF0dHJpYnV0ZXMiLCJhdHRycyIsIkpTWEV4cHJlc3Npb24iLCJqc3hFeHByZXNzaW9uVG9Tb3VyY2UiLCJjaGlsZHJlbiIsImNoaWxkIiwidHJpbSIsImNoaWxkU291cmNlIiwianN4RWxlbWVudFRvU291cmNlIiwianN4RXhwcmVzc2lvbiIsInRhZ05hbWUiLCJhdHRyc1RvU291cmNlIiwiY2hpbGRyZW5Ub1NvdXJjZSIsImdldE1hdGNoZWRTb3VyY2UiLCJjb25kaXRpb24iLCJzdGF0ZW1lbnQiLCJibG9jayIsInN0YXRlbWVudHMiLCJCbG9jayIsImVuY2xvc2VTdGF0ZW1lbnRzIiwiQmxvY2tTdGF0ZW1lbnQiLCJsZWZ0UmVjdXJzaXZlIiwidGVzdFJ1bGUiLCJLZXl3b3JkcyIsImxpdGVyYWxzIiwiZWxzZVN0YXRlbWVudCIsIlNlcXVlbmNlIiwibGlzdCIsImlkZW50aWZpZXIiLCJ0aGluZyIsImV4cHJlc3Npb24iLCJhcmd1bWVudCIsIm1hdGNoIiwib3BlcmF0b3IiLCJiYW5nIiwiaXRlbSIsIml0ZW1WYXIiLCJwb3NpdGlvblZhciIsInJlc3VsdHMiLCJsaHMiLCJyaHMiLCJwcmVjZWRlbmNlIiwiYSIsImIiLCJ0eXBlIiwiU3ltYm9scyIsIm1lc3NhZ2UiLCJva0J1dHRvbiIsImNhbmNlbEJ1dHRvbiIsInN0cnVjdHVyZSIsInN1cGVyVHlwZSIsInN1YlR5cGUiLCJrZXl3b3JkcyIsImtleXdvcmRNYXRjaGVzIiwia2V5d29yZCIsIlR5cGUiLCJlcnJvciIsImdldEJsYWNrbGlzdCIsInR5cGVzIiwiaW5kZXgiLCJ0b0xvd2VyQ2FzZSIsInB1c2giLCJjb25kaXRpb25zIiwic3RhcnRzV2l0aCIsIm1hdGNoZWRUZXh0Iiwic2NvcGUiLCJkZWNsYXJhdGlvbiIsImRhdGFUeXBlIiwicGx1cmFsIiwicHJvcCIsIkxpc3QiLCJTdGF0ZW1lbnRzIiwiQ29tbWVudCIsInBhdHRlcm4iLCJQYXR0ZXJuIiwiTnVtYmVyIiwiTlVNQkVSX05BTUVTIiwiemVybyIsIm9uZSIsInR3byIsInRocmVlIiwiZm91ciIsImZpdmUiLCJzaXgiLCJzZXZlbiIsImVpZ2h0IiwibmluZSIsInRlbiIsIlRleHQiLCJxdW90ZWRTdHJpbmciLCJlbmRzV2l0aCIsIkxpdGVyYWxzIiwibWF0Y2hlc1N0YXJ0aW5nQXQiLCJsaXRlcmFsU2VwYXJhdG9yIiwiZmlyc3QiLCJldmVyeSIsImxpdGVyYWwiLCJpIiwib3B0aW9uYWwiLCJzb21lIiwic291cmNlIiwiU3VicnVsZSIsIm1hdGNoZWRSdWxlIiwic3VicnVsZSIsImluY2x1ZGVzIiwicHJvbW90ZSIsIl9hZGRSZXN1bHRzIiwiYXJnTmFtZSIsInRvU3ludGF4IiwiY29tbWVudCIsIm1hdGNoZXMiLCJiZXN0TWF0Y2giLCJnZXRCZXN0TWF0Y2giLCJiZXN0IiwiY3VycmVudCIsIlJlcGVhdCIsInJlcGVhdCIsImlzQ29tcG91bmRSdWxlIiwiZGVsaW1pdGVyIiwiaW5kZW50IiwiY29udGVudHMiLCJCbGFua0xpbmUiLCJsYXN0IiwicGFyc2VCbG9jayIsInBhcnNlU3RhdGVtZW50IiwiV2hpdGVzcGFjZSIsIlN0YXRlbWVudFBhcnNlRXJyb3IiLCJ1bnBhcnNlZCIsInBhcnNlZCIsImUiLCJibG9ja1RvU291cmNlIiwibmFtZWQiLCJtZXRob2RzIiwib3RoZXIiLCJ0b1N0cnVjdHVyZSIsImFkZFN0cnVjdHVyZSIsImJyZWFrSW50b0Jsb2NrcyIsIndoaXRlc3BhY2UiLCJwYXJzZVJ1bGUiLCJwYXJzZVN5bnRheCIsImFsdENsYXNzIiwidG9rZW5pc2VSdWxlU3ludGF4IiwiU1lOVEFYX0VYUFJFU1NJT04iLCJzeW50YXhTdHJlYW0iLCJwYXJzZVRva2VuIiwicG9wIiwiS0VZV09SRF9QQVRURVJOIiwic3ludGF4VG9rZW4iLCJwYXJzZVN5bWJvbCIsInBhcnNlU3VicnVsZSIsInBhcnNlQWx0ZXJuYXRpdmVzIiwicGFyc2VMaXN0IiwicGFyc2VSZXBlYXQiLCJwYXJzZUtleXdvcmQiLCJuZXh0IiwiaXNFc2NhcGVkIiwiZmluZE5lc3RlZFRva2VucyIsImFsdGVybmF0aXZlcyIsImdyb3VwQWx0ZXJuYXRpdmVzIiwic3ltYm9sIiwicGFyYW1zIiwiYmFuZ1Bvc2l0aW9uIiwibm90IiwibmV3bGluZSIsIkluZGVudCIsIk5FV0xJTkUiLCJlYXRUb2tlbnMiLCJtYXRjaFRvcFRva2VucyIsIm1ldGhvZCIsImNhbGwiLCJtYXRjaFdoaXRlc3BhY2UiLCJtYXRjaFdvcmQiLCJtYXRjaE51bWJlciIsIm1hdGNoTmV3bGluZSIsIm1hdGNoSlNYRWxlbWVudCIsIm1hdGNoVGV4dCIsIm1hdGNoQ29tbWVudCIsIm1hdGNoU3ltYm9sIiwiZWF0V2hpdGVzcGFjZSIsIndoaXRlU3BhY2VFbmQiLCJ3aGl0ZXNwYWNlRW5kIiwiV09SRF9TVEFSVCIsIldPUkRfQ0hBUiIsIndvcmRFbmQiLCJOVU1CRVJfU1RBUlQiLCJOVU1CRVIiLCJudW1iZXJNYXRjaCIsIm1hdGNoRXhwcmVzc2lvbkF0SGVhZCIsIm51bWJlclN0ciIsInBhcnNlRmxvYXQiLCJxdW90ZVN5bWJvbCIsInRleHRFbmQiLCJjaGFyIiwiQ09NTUVOVCIsImNvbW1lbnRTdGFydCIsImdldExpbmVBdEhlYWQiLCJjb21tZW50TWF0Y2giLCJjb21tZW50U3ltYm9sIiwibWF0Y2hKU1hTdGFydFRhZyIsImlzVW5hcnlUYWciLCJtYXRjaEpTWENoaWxkcmVuIiwiY2hpbGRFbmQiLCJKU1hfVEFHX1NUQVJUIiwidGFnTWF0Y2giLCJlbmRCaXQiLCJtYXRjaEpTWEF0dHJpYnV0ZSIsImF0dHJFbmQiLCJhdHRyc0FzU3RyaW5nIiwiY2hpbGRyZW5Bc1N0cmluZyIsImF0dHIiLCJlbmRUYWciLCJtYXRjaEpTWENoaWxkIiwibWF0Y2hKU1hFbmRUYWciLCJtYXRjaEpTWEV4cHJlc3Npb24iLCJtYXRjaEpTWFRleHQiLCJtYXRjaFN0cmluZ0F0SGVhZCIsIkpTWF9BVFRSSUJVVEVfU1RBUlQiLCJlcXVhbHMiLCJhdHRyaWJ1dGUiLCJKU1hBdHRyaWJ1dGUiLCJtYXRjaEpTWEF0dHJpYnV0ZVZhbHVlIiwidmFsdWVFbmQiLCJtYXRjaEpTWEF0dHJpYnV0ZVZhbHVlSWRlbnRpZmllciIsImVuZEluZGV4IiwiZmluZE1hdGNoaW5nQXRIZWFkIiwiSlNYX1RFWFRfRU5EX0NIQVJTIiwiZmluZEZpcnN0QXRIZWFkIiwianN4VGV4dCIsInN0cmluZ0VuZCIsImhlYWQiLCJzdGFydERlbGltaXRlciIsImVuZERlbGltaXRlciIsImFmdGVyUXVvdGUiLCJjaGFycyIsInJlbW92ZU5vcm1hbFdoaXRlc3BhY2UiLCJicmVha0ludG9MaW5lcyIsImN1cnJlbnRMaW5lIiwiZ2V0TGluZUluZGVudHMiLCJkZWZhdWx0SW5kZW50IiwiaW5kZW50cyIsImdldExpbmVJbmRlbnQiLCJzdGFydEluZGVudCIsImdldE5leHRJbmRlbnQiLCJtYXhJbmRlbnQiLCJNYXRoIiwibWluIiwibGluZUluZGVudCIsIm5ld0Jsb2NrIiwiY2xvbmVDbGFzcyIsIl9fY2xvbmVDbGFzc19fIiwiRnVuY3Rpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O1FBSWdCQSxZLEdBQUFBLFk7UUFPQUMsUyxHQUFBQSxTO1FBTUFDLFEsR0FBQUEsUTtRQVFBQyxXLEdBQUFBLFc7UUFNQUMsVSxHQUFBQSxVO1FBT0FDLE8sR0FBQUEsTzs7QUF0Q2hCOzs7Ozs7QUFFQTtBQUNB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1REFBdUQ7QUFDdkQ7O0FBRUEsNkJBQTZCLG1CQUFtQjs7QUFFaEQ7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2xUQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUdxQnlFLFcsV0FlbkIsNEJBQVEsUUFBUixDLFVBR0EsNEJBQVEsUUFBUixDLFVBR0EsNEJBQVEsUUFBUixDLFVBR0EsNEJBQVEsUUFBUixDLFVBR0EsNEJBQVEsUUFBUixDLE1BNUJEQyxtQjs7O0FBTUEsc0JBQVlDLEtBQVosRUFBbUI7QUFBQTs7QUFBQSx3SEFDWkEsS0FEWTs7QUFFcEJqRixTQUFPa0YsUUFBUCxHQUFrQkQsTUFBTUMsUUFBeEI7QUFDRSxRQUFLRCxLQUFMLENBQVdDLFFBQVgsQ0FBb0JDLElBQXBCOztBQUVBO0FBQ0FuRixTQUFPb0YsV0FBUDtBQUNBcEYsU0FBT2tGLFFBQVAsR0FBa0IsTUFBS0QsS0FBTCxDQUFXQyxRQUE3QjtBQVBrQjtBQVFsQjs7Ozt5QkFHTTtBQUFFLFFBQUtELEtBQUwsQ0FBV0MsUUFBWCxDQUFvQkcsSUFBcEI7QUFBNkI7OzsyQkFHN0I7QUFBRSxRQUFLSixLQUFMLENBQVdDLFFBQVgsQ0FBb0JJLE1BQXBCO0FBQStCOzs7NEJBR2hDO0FBQUUsUUFBS0wsS0FBTCxDQUFXQyxRQUFYLENBQW9CSyxPQUFwQjtBQUFnQzs7OzJCQUduQztBQUFFLFFBQUtOLEtBQUwsQ0FBV0MsUUFBWCxDQUFvQk0sTUFBcEI7QUFBK0I7Ozs0QkFHakM7QUFBRSxRQUFLUCxLQUFMLENBQVdDLFFBQVgsQ0FBb0JPLE1BQXBCLENBQTJCakUsU0FBM0IsRUFBc0MsU0FBdEM7QUFBbUQ7OzsyQkFFckQ7QUFBRSxRQUFLeUQsS0FBTCxDQUFXQyxRQUFYLENBQW9CUSxNQUFwQjtBQUErQjs7OzhCQUM5QjtBQUFFLFFBQUtULEtBQUwsQ0FBV0MsUUFBWCxDQUFvQlMsU0FBcEI7QUFBa0M7Ozt5QkFDekM7QUFBRSxRQUFLVixLQUFMLENBQVdDLFFBQVgsQ0FBb0JDLElBQXBCO0FBQTZCOzs7MEJBQzlCO0FBQUUsUUFBS0YsS0FBTCxDQUFXQyxRQUFYLENBQW9CVSxLQUFwQjtBQUE4Qjs7OzJCQUcvQjtBQUFBOztBQUFBLE9BQ0ZWLFFBREUsR0FDVyxLQUFLRCxLQURoQixDQUNGQyxRQURFO0FBQUEsT0FFRlcsTUFGRSxHQUV3Q1gsUUFGeEMsQ0FFRlcsTUFGRTtBQUFBLE9BRU1DLFFBRk4sR0FFd0NaLFFBRnhDLENBRU1ZLFFBRk47QUFBQSxPQUVnQkMsS0FGaEIsR0FFd0NiLFFBRnhDLENBRWdCYSxLQUZoQjtBQUFBLE9BRXVCQyxJQUZ2QixHQUV3Q2QsUUFGeEMsQ0FFdUJjLElBRnZCO0FBQUEsT0FFNkI3QixNQUY3QixHQUV3Q2UsUUFGeEMsQ0FFNkJmLE1BRjdCOztBQUlSOztBQUNBLE9BQUk4QixVQUFVSixPQUFPckQsR0FBUCxDQUFZO0FBQUEsV0FDeEI7QUFDQXdCLFlBQU9rQyxLQURQO0FBRUFBLFlBQU9BLEtBRlA7QUFHQTlHLFdBQU04RyxLQUhOO0FBSUFDLGNBQVNELEtBSlQ7QUFLQUUsY0FBUztBQUFBLGFBQU1sQixTQUFTbUIsTUFBVCxDQUFnQkgsS0FBaEIsQ0FBTjtBQUFBO0FBTFQsS0FEd0I7QUFBQSxJQUFaLENBQWQ7O0FBU0EsT0FBSUksZUFBZSxTQUFmQSxZQUFlLEdBQU07QUFDeEIsUUFBSSxDQUFDUCxLQUFMLEVBQVk7QUFDWixXQUNDO0FBQUMsMEJBQUQ7QUFBQSxPQUFNLGVBQU4sRUFBZ0IsT0FBTyxFQUFFUSxVQUFVLFVBQVosRUFBd0JDLE9BQU8sTUFBL0IsRUFBdUNDLEtBQUssS0FBNUMsRUFBbURDLFFBQVEsQ0FBM0QsRUFBdkI7QUFDQztBQUFDLDZCQUFEO0FBQUEsUUFBUSxjQUFSLEVBQWlCLFNBQVM7QUFBQSxlQUFNLE9BQUtwQixNQUFMLEVBQU47QUFBQSxRQUExQjtBQUErQztBQUFBO0FBQUE7QUFBQTtBQUFBLE9BQS9DO0FBQUE7QUFBQSxNQUREO0FBRUM7QUFBQyw2QkFBRDtBQUFBLFFBQVEsY0FBUixFQUFpQixTQUFTO0FBQUEsZUFBTSxPQUFLRCxJQUFMLEVBQU47QUFBQSxRQUExQjtBQUE2QztBQUFBO0FBQUE7QUFBQTtBQUFBLE9BQTdDO0FBQUE7QUFBQTtBQUZELEtBREQ7QUFNQSxJQVJEOztBQVVBLE9BQUlzQixnQkFBZ0IsU0FBaEJBLGFBQWdCLEdBQU07QUFDekIsUUFBSXhDLE1BQUosRUFBWTtBQUNaLFdBQU8sOEJBQUMsdUJBQUQ7QUFDTCxZQUFPLEVBQUVvQyxVQUFVLFVBQVosRUFBeUJLLE9BQU8sS0FBaEMsRUFBdUNDLE1BQU0saUJBQTdDLEVBQWdFSixLQUFLLEtBQXJFLEVBREY7QUFFTCxjQUFTO0FBQUEsYUFBTSxPQUFLbEIsT0FBTCxFQUFOO0FBQUEsTUFGSjtBQUdMLFdBQUssZUFIQSxHQUFQO0FBSUEsSUFORDs7QUFRQSxVQUNBO0FBQUMseUJBQUQ7QUFBQSxNQUFNLGVBQU4sRUFBZ0IsWUFBaEIsRUFBdUIsV0FBVSxZQUFqQztBQUNDO0FBQUMsMEJBQUQsQ0FBTSxHQUFOO0FBQUEsT0FBVSxPQUFPLEVBQUV1QixRQUFRLE1BQVYsRUFBa0JDLFlBQVksTUFBOUIsRUFBakIsRUFBeUQsV0FBVSwyQkFBbkU7QUFDQztBQUFDLDJCQUFELENBQU0sTUFBTjtBQUFBLFFBQWEsT0FBTyxDQUFwQjtBQUNDO0FBQUMsNEJBQUQ7QUFBQSxTQUFNLGNBQU4sRUFBZSxjQUFmLEVBQXdCLFdBQXhCO0FBQ0M7QUFBQyw2QkFBRCxDQUFNLElBQU47QUFBQTtBQUFBO0FBQUEsUUFERDtBQUVDLHFDQUFDLHlCQUFELElBQVUsVUFBVixFQUFlLGVBQWYsRUFBeUIsU0FBU2QsT0FBbEMsRUFBMkMsT0FBT0gsUUFBbEQsRUFBNEQsT0FBTyxFQUFFYyxPQUFPLE1BQVQsRUFBbkUsR0FGRDtBQUdDO0FBQUMsNkJBQUQsQ0FBTSxJQUFOO0FBQUEsVUFBVyxTQUFTO0FBQUEsaUJBQU0sT0FBS25CLE1BQUwsRUFBTjtBQUFBLFVBQXBCO0FBQXlDO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FBekM7QUFBQTtBQUFBLFFBSEQ7QUFJQztBQUFDLDZCQUFELENBQU0sSUFBTjtBQUFBLFVBQVcsU0FBUztBQUFBLGlCQUFNLE9BQUtDLE1BQUwsRUFBTjtBQUFBLFVBQXBCO0FBQUE7QUFBQSxRQUpEO0FBS0M7QUFBQyw2QkFBRCxDQUFNLElBQU47QUFBQSxVQUFXLFNBQVM7QUFBQSxpQkFBTSxPQUFLQyxTQUFMLEVBQU47QUFBQSxVQUFwQjtBQUFBO0FBQUE7QUFMRDtBQURELE1BREQ7QUFVQztBQUFDLDJCQUFELENBQU0sTUFBTjtBQUFBLFFBQWEsT0FBTyxDQUFwQjtBQUNDO0FBQUMsNEJBQUQ7QUFBQSxTQUFNLGNBQU4sRUFBZSxjQUFmLEVBQXdCLFdBQXhCO0FBQ0MscUNBQUMsZ0JBQUQsSUFBUSxXQUFSLEdBREQ7QUFFQztBQUFDLDZCQUFELENBQU0sSUFBTjtBQUFBLFVBQVcsU0FBUztBQUFBLGlCQUFNLE9BQUtILE1BQUwsRUFBTjtBQUFBLFVBQXBCO0FBQXlDO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FBekM7QUFBQTtBQUFBLFFBRkQ7QUFHQyxxQ0FBQyxnQkFBRCxJQUFRLFdBQVI7QUFIRDtBQURELE1BVkQ7QUFpQkM7QUFBQywyQkFBRCxDQUFNLE1BQU47QUFBQSxRQUFhLE9BQU8sQ0FBcEI7QUFDQztBQUFDLDRCQUFEO0FBQUEsU0FBTSxjQUFOLEVBQWUsY0FBZixFQUF3QixXQUF4QjtBQUNDLHFDQUFDLGdCQUFELElBQVEsV0FBUixHQUREO0FBRUM7QUFBQyw2QkFBRCxDQUFNLElBQU47QUFBQSxVQUFXLFNBQVM7QUFBQSxpQkFBTSxPQUFLTCxJQUFMLEVBQU47QUFBQSxVQUFwQjtBQUFBO0FBQUEsUUFGRDtBQUdDO0FBQUMsNkJBQUQsQ0FBTSxJQUFOO0FBQUEsVUFBVyxTQUFTO0FBQUEsaUJBQU0sT0FBS1MsS0FBTCxFQUFOO0FBQUEsVUFBcEI7QUFBQTtBQUFBO0FBSEQ7QUFERDtBQWpCRCxLQUREO0FBMEJDO0FBQUMsMEJBQUQsQ0FBTSxHQUFOO0FBQUEsT0FBVSxPQUFPLEVBQUVrQixRQUFRLG1CQUFWLEVBQWpCO0FBQ0M7QUFBQywyQkFBRCxDQUFNLE1BQU47QUFBQSxRQUFhLE9BQU8sQ0FBcEI7QUFDQyxvQ0FBQywwQkFBRDtBQUNDLGtCQUFVLFlBRFg7QUFFQyxjQUFPZCxJQUZSO0FBR0MsaUJBQVUsa0JBQUNnQixLQUFEO0FBQUEsZUFBVzlCLFNBQVMrQixNQUFULENBQWdCL0IsU0FBU1ksUUFBekIsRUFBbUNrQixNQUFNRSxNQUFOLENBQWFsRCxLQUFoRCxFQUF1RCxXQUF2RCxDQUFYO0FBQUE7QUFIWCxRQUREO0FBTUVzQztBQU5GLE1BREQ7QUFTQztBQUFDLDJCQUFELENBQU0sTUFBTjtBQUFBLFFBQWEsT0FBTyxDQUFwQjtBQUNDLG9DQUFDLHlCQUFELElBQVUsV0FBVSxZQUFwQixFQUFpQyxPQUFPbkMsTUFBeEM7QUFERCxNQVREO0FBWUV3QztBQVpGO0FBMUJELElBREE7QUEwQ0U7Ozs7RUE5R3FDUSxnQkFBTUMsUyxXQUN2Q0MsWSxHQUFlO0FBQ3JCbkMsV0FBVSxJQUFJb0Msc0JBQUo7QUFEVyxDO2tCQURGdkMsVzs7Ozs7Ozs7Ozs7Ozs7QUNWckI7Ozs7QUFDQTs7OztBQUNBOzs7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQTtBQWRBO0FBZUEsSUFBTVYsU0FBUy9ELGlCQUFPOEQsT0FBUCxDQUFlLE9BQWYsQ0FBZjtBQUNBOzs7QUFYQTtBQVlBQyxPQUFPa0QsTUFBUCxDQUFjLE1BQWQsRUFBc0IsT0FBdEIsRUFBK0IsV0FBL0IsRUFBNEMsSUFBNUMsRUFBa0QsWUFBbEQsRUFBZ0UsT0FBaEUsRUFBeUUsS0FBekU7QUFDQTtrQkFDZWxELE07O0FBRWY7O0FBQ0EsSUFBSSxPQUFPckUsTUFBUCxLQUFrQixXQUF0QixFQUFtQztBQUNsQ1UsUUFBT0MsTUFBUCxDQUFjWCxNQUFkLEVBQXNCO0FBQ3JCa0IsZ0NBRHFCO0FBRXJCd0Isc0JBRnFCO0FBR3JCcEMsMEJBSHFCOztBQUtyQmEsWUFBVUQsb0JBQVVDLFFBQVYsQ0FBbUJxRyxJQUFuQixDQUF3QjVILFFBQVFzQixTQUFoQyxDQUxXO0FBTXJCbUQsZ0JBTnFCO0FBT3JCekMsU0FBT3lDLE9BQU96QyxLQUFQLENBQWE0RixJQUFiLENBQWtCbkQsTUFBbEIsQ0FQYztBQVFyQmtCLFdBQVNsQixPQUFPa0IsT0FBUCxDQUFlaUMsSUFBZixDQUFvQm5ELE1BQXBCO0FBUlksRUFBdEI7QUFVQSxDOzs7Ozs7Ozs7Ozs7Ozs7OztrRkNqQ0Q7OztBQUdBOzs7QUFGQTs7OztBQUdBOzs7O0FBS0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSkEvRCxpQkFBT3dFLElBQVAsR0FBYyxJQUFkO0FBQ0F4RSxpQkFBT3VFLEtBQVAsR0FBZSxJQUFmO0FBQ0F2RSxpQkFBT1MsSUFBUCxHQUFjLElBQWQ7O0FBR0FHLG9CQUFVNEQsSUFBVixHQUFpQixJQUFqQjs7SUFHcUJ3QyxZOzs7Ozs7Ozs7Ozs7QUFHcEI7O0FBRUE7O0FBRUE7Ozs7Ozs7QUFrQkE7MEJBQ1E7QUFDUCxVQUFPRyxhQUFhQyxtQkFBcEI7QUFDQSxVQUFPRCxhQUFhRSxrQkFBcEI7QUFDQTNILFVBQU80SCxRQUFQLENBQWdCQyxNQUFoQjtBQUNBOztBQUVEOzs7O3lCQUNPO0FBQ047QUFDQSxRQUFLM0MsUUFBTCxHQUFnQjRDLEtBQUtsRyxLQUFMLENBQVc2RixhQUFhQyxtQkFBYixJQUN2QixvREFEWSxDQUFoQjs7QUFHQTtBQUNBLFFBQUtLLGNBQUwsR0FBc0IsS0FBSzdDLFFBQTNCOztBQUVBO0FBQ0EsUUFBS21CLE1BQUwsQ0FBWW9CLGFBQWFFLGtCQUF6QjtBQUNBOztBQUVEOzs7O3lCQUNPO0FBQ05GLGdCQUFhQyxtQkFBYixHQUFtQ0ksS0FBS0UsU0FBTCxDQUFlLEtBQUs5QyxRQUFwQixDQUFuQzs7QUFFQTtBQUNBLFFBQUs2QyxjQUFMLEdBQXNCLEtBQUs3QyxRQUEzQjtBQUNBOztBQUVEOzs7OzJCQUNnQztBQUFBLE9BQXpCK0MsT0FBeUIsdUVBQWYsS0FBS25DLFFBQVU7O0FBQy9CLFFBQUttQixNQUFMLENBQVlnQixPQUFaLEVBQXFCLEtBQUtGLGNBQUwsQ0FBb0JFLE9BQXBCLENBQXJCO0FBQ0E7O0FBRUQ7Ozs7eUJBQ09BLE8sRUFBUztBQUNmLE9BQUksQ0FBQ0EsT0FBRCxJQUFZLEtBQUsvQyxRQUFMLENBQWMrQyxPQUFkLEtBQTBCLElBQTFDLEVBQWdEQSxVQUFVdkgsT0FBT3dELElBQVAsQ0FBWSxLQUFLZ0IsUUFBakIsRUFBMkIsQ0FBM0IsS0FBaUMsRUFBM0M7QUFDaEQsUUFBS1ksUUFBTCxHQUFnQjJCLGFBQWFFLGtCQUFiLEdBQWtDTSxPQUFsRDtBQUNBLFFBQUs5RCxNQUFMLEdBQWMsRUFBZDtBQUNBOztBQUVEO0FBQ0E7Ozs7eUJBQ09kLEksRUFBTTJDLEksRUFBTWtDLFEsRUFBVTtBQUM1QixRQUFLaEQsUUFBTCxHQUFnQnhFLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEtBQUt1RSxRQUF2QixzQkFBcUM3QixJQUFyQyxFQUE2QzJDLElBQTdDLEVBQWhCO0FBQ0EsUUFBS0ssTUFBTCxDQUFZaEQsSUFBWjtBQUNBLFFBQUtjLE1BQUwsR0FBYyxFQUFkO0FBQ0EsT0FBSSxDQUFDK0QsUUFBTCxFQUFlLEtBQUs3QyxJQUFMO0FBQ2Y7O0FBRUQ7QUFDQTs7Ozs0QkFDMEM7QUFBQSxPQUFuQ2hDLElBQW1DLHVFQUE1QixLQUFLeUMsUUFBdUI7QUFBQSxPQUFicUMsV0FBYTs7QUFDekMsT0FBSUEsZUFBZSxDQUFDQyxtQ0FBaUMvRSxJQUFqQyxPQUFwQixFQUErRDtBQUMvRCxPQUFJNkIsV0FBV3hFLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEtBQUt1RSxRQUF2QixDQUFmO0FBQ0EsVUFBT0EsU0FBUzdCLElBQVQsQ0FBUDtBQUNBLFFBQUs2QixRQUFMLEdBQWdCQSxRQUFoQjtBQUNBLFFBQUtHLElBQUw7QUFDQSxRQUFLZ0IsTUFBTDtBQUNBOztBQUVEOzs7O3lCQUNPaEQsSSxFQUFpQjtBQUFBLE9BQVgyQyxJQUFXLHVFQUFKLEVBQUk7O0FBQ3ZCO0FBQ0EsT0FBSSxDQUFDM0MsSUFBTCxFQUFXQSxPQUFPZ0YsT0FBTyx3QkFBUCxDQUFQO0FBQ1g7QUFDQSxPQUFJLENBQUNoRixJQUFMLEVBQVc7O0FBRVgsUUFBSzRELE1BQUwsQ0FBWTVELElBQVosRUFBa0IyQyxJQUFsQjtBQUNBOztBQUVEO0FBQ0E7Ozs7MkJBQ3lDO0FBQUEsT0FBbENzQyxPQUFrQyx1RUFBeEIsS0FBS3hDLFFBQW1CO0FBQUEsT0FBVHlDLE9BQVM7O0FBQ3hDO0FBQ0EsT0FBSSxDQUFDQSxPQUFMLEVBQWNBLFVBQVVGLE9BQU8sNEJBQVAsRUFBcUNDLE9BQXJDLENBQVY7O0FBRWQ7QUFDQSxPQUFJLENBQUNDLE9BQUQsSUFBWUEsWUFBWUQsT0FBNUIsRUFBcUM7QUFDckMsT0FBSSxLQUFLcEQsUUFBTCxDQUFjcUQsT0FBZCxDQUFKLEVBQTRCLE9BQU9ySSxRQUFRc0ksSUFBUix3QkFBaUNELE9BQWpDLDhCQUFQOztBQUU1QixPQUFJdkMsT0FBTyxLQUFLZCxRQUFMLENBQWNvRCxPQUFkLENBQVg7QUFDQSxRQUFLN0MsTUFBTCxDQUFZNkMsT0FBWjtBQUNBLFFBQUtyQixNQUFMLENBQVlzQixPQUFaLEVBQXFCdkMsSUFBckI7QUFDQTs7QUFFRDs7Ozs4QkFDNEM7QUFBQSxPQUFsQ3NDLE9BQWtDLHVFQUF4QixLQUFLeEMsUUFBbUI7QUFBQSxPQUFUeUMsT0FBUzs7QUFDM0M7QUFDQSxPQUFJLENBQUNBLE9BQUwsRUFBY0EsVUFBVUYsT0FBTyxpQ0FBUCxFQUEwQ0MsT0FBMUMsQ0FBVjtBQUNkO0FBQ0EsT0FBSSxDQUFDQyxPQUFELElBQVlBLFlBQVlELE9BQTVCLEVBQXFDO0FBQ3JDLE9BQUksS0FBS3BELFFBQUwsQ0FBY3FELE9BQWQsQ0FBSixFQUE0QixPQUFPckksUUFBUXNJLElBQVIsd0JBQWlDRCxPQUFqQyw4QkFBUDs7QUFFNUIsUUFBS3RCLE1BQUwsQ0FBWXNCLE9BQVosRUFBcUIsS0FBS3ZDLElBQTFCO0FBQ0E7O0FBRUQ7QUFDRDs7Ozs0QkFDVztBQUFBOztBQUNULFFBQUs3QixNQUFMLEdBQWMsaUJBQWQ7QUFDQXNFLGNBQVcsWUFBTTtBQUNoQixRQUFJL0csU0FBUzJDLE9BQU96QyxLQUFQLENBQWEsWUFBYixFQUEyQixNQUFLb0UsSUFBaEMsQ0FBYjtBQUNBLFFBQUksQ0FBQ3RFLE1BQUwsRUFBYTtBQUNaeEIsYUFBUXNJLElBQVIsQ0FBYSxjQUFiO0FBQ0EsV0FBS3JFLE1BQUwsR0FBYyx3QkFBZDtBQUNBLEtBSEQsTUFJSztBQUNKakUsYUFBUXdJLElBQVIsQ0FBYSxRQUFiLEVBQXVCaEgsTUFBdkI7QUFDQSxXQUFLeUMsTUFBTCxHQUFjekMsT0FBT0ksUUFBUCxDQUFnQnVDLE1BQWhCLENBQWQ7QUFDQTtBQUNELElBVkQsRUFVRyxHQVZIO0FBV0E7Ozs7O0FBOUhEO3NCQUN1QjtBQUN0QixVQUFPM0QsT0FBT3dELElBQVAsQ0FBWSxLQUFLZ0IsUUFBakIsQ0FBUDtBQUNBOztBQUVEOzs7O3NCQUNxQjtBQUNwQixVQUFPLEtBQUtBLFFBQUwsQ0FBYyxLQUFLWSxRQUFuQixDQUFQO0FBQ0E7O0FBRUQ7Ozs7c0JBQ3NCO0FBQ3JCLFVBQU9nQyxLQUFLRSxTQUFMLENBQWUsS0FBS0QsY0FBcEIsTUFBd0NELEtBQUtFLFNBQUwsQ0FBZSxLQUFLOUMsUUFBcEIsQ0FBL0M7QUFDQTs7Ozs2RUFyQkF5RCxnQjs7O1NBQXNCLEU7O2tGQUV0QkEsZ0I7OztTQUE0QixFOzs0RUFFNUJBLGdCOzs7U0FBc0IsRTs7MEVBRXRCQSxnQjs7O1NBQW9CLEU7OzJEQUdwQkMsYyx3SUFLQUEsYyx1SUFLQUEsYztrQkFyQm1CdEIsWTs7Ozs7OztBQ2JyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUNBQXlDOzs7Ozs7Ozs7Ozs7OztrQkNPakJ1QixNOztBQU54Qjs7OztBQUNBOzs7O0FBQ0E7O0FBRUE7Ozs7QUFWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQVFlLFNBQVNBLE1BQVQsQ0FBZ0I1RCxLQUFoQixFQUF1QjtBQUFBLE1BRWxDNkQsU0FGa0MsR0FLaEM3RCxLQUxnQyxDQUVsQzZELFNBRmtDO0FBQUEsTUFHbENDLFVBSGtDLEdBS2hDOUQsS0FMZ0MsQ0FHbEM4RCxVQUhrQztBQUFBLE1BR3RCQyxJQUhzQixHQUtoQy9ELEtBTGdDLENBR3RCK0QsSUFIc0I7QUFBQSxNQUdoQnBDLEtBSGdCLEdBS2hDM0IsS0FMZ0MsQ0FHaEIyQixLQUhnQjtBQUFBLE1BR1RFLE1BSFMsR0FLaEM3QixLQUxnQyxDQUdUNkIsTUFIUztBQUFBLE1BSWxDbUMsTUFKa0MsR0FLaENoRSxLQUxnQyxDQUlsQ2dFLE1BSmtDO0FBQUEsTUFJMUJDLEtBSjBCLEdBS2hDakUsS0FMZ0MsQ0FJMUJpRSxLQUowQjtBQUFBLE1BSW5CQyxJQUptQixHQUtoQ2xFLEtBTGdDLENBSW5Ca0UsSUFKbUI7QUFBQSxNQUliQyxLQUphLEdBS2hDbkUsS0FMZ0MsQ0FJYm1FLEtBSmE7QUFBQSxNQUlOQyxNQUpNLEdBS2hDcEUsS0FMZ0MsQ0FJTm9FLE1BSk07QUFBQSxNQUlFQyxLQUpGLEdBS2hDckUsS0FMZ0MsQ0FJRXFFLEtBSkY7QUFBQSxNQUlTQyxJQUpULEdBS2hDdEUsS0FMZ0MsQ0FJU3NFLElBSlQ7QUFBQSxNQUllQyxPQUpmLEdBS2hDdkUsS0FMZ0MsQ0FJZXVFLE9BSmY7OztBQU9wQyxNQUFNQyxjQUFjO0FBQ2xCWCxlQUFXLHNCQUFXQSxTQUFYLEVBQXNCLEtBQXRCLEVBQTZCRSxJQUE3QixFQUFtQ0QsVUFBbkMsRUFDVyxFQUFFRSxjQUFGLEVBQVVDLFlBQVYsRUFEWCxFQUVXLFFBRlgsQ0FETztBQUlsQlEsV0FBTztBQUNMOUMsa0JBREs7QUFFTEU7QUFGSztBQUpXLEdBQXBCOztBQVVBLFNBQU8scUNBQVMyQyxXQUFULENBQVA7QUFDRDs7QUFFRFosT0FBT2MsU0FBUCxHQUFtQjtBQUNqQmIsYUFBV2Msb0JBQVVDLE1BREo7QUFFakJkLGNBQVlhLG9CQUFVQyxNQUZMO0FBR2pCYixRQUFNWSxvQkFBVUMsTUFIQztBQUlqQmpELFNBQU9nRCxvQkFBVW5LLE1BSkE7QUFLakJxSCxVQUFROEMsb0JBQVVuSyxNQUxEOztBQU9qQndKLFVBQVFXLG9CQUFVRSxJQVBEO0FBUWpCWixTQUFPVSxvQkFBVUU7O0FBUkEsQ0FBbkI7O0FBWUFqQixPQUFPeEIsWUFBUCxHQUFzQjtBQUNwQjJCLFFBQU07QUFEYyxDQUF0QixDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDNUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNxQmUsZ0I7Ozs7Ozs7Ozs7Ozs7O3dNQU1wQkMsUyxHQUFZLFVBQUNoRCxLQUFELEVBQVc7O0FBRXhCO0FBQ0U7QUFDQSxPQUFJQSxNQUFNaUQsT0FBTixLQUFrQixDQUF0QixFQUF5Qjs7QUFFekI7QUFDQWpELFNBQU1rRCxjQUFOOztBQUVBO0FBQ0EsT0FBSUMsVUFBVW5ELE1BQU1FLE1BQXBCO0FBQ0EsT0FBSTlILE9BQU8rSyxRQUFRbkcsS0FBbkI7QUFDQSxPQUFJakMsUUFBUW9JLFFBQVFDLGNBQXBCO0FBQ0EsT0FBSXBJLE1BQU1tSSxRQUFRRSxZQUFsQjs7QUFFQTtBQUNBLE9BQUlDLFVBQVUsRUFBZDtBQUFBLE9BQWtCRixpQkFBaUJySSxLQUFuQztBQUFBLE9BQTBDc0ksZUFBZXJJLEdBQXpEOztBQUVBO0FBQ0EsT0FBSUQsVUFBVUMsR0FBVixJQUFpQixDQUFDZ0YsTUFBTXVELFFBQTVCLEVBQXNDO0FBQ3JDRCxjQUFVLElBQVY7QUFDQUYscUJBQWlCQyxlQUFlckksTUFBTSxDQUF0QztBQUNBO0FBQ0Q7QUFKQSxRQUtLO0FBQ0w7QUFDRjtBQUNHLFNBQUk1QyxLQUFLMkMsS0FBTCxNQUFnQixJQUFwQixFQUEwQkEsUUFBUTNDLEtBQUtvTCxXQUFMLENBQWlCLElBQWpCLEVBQXVCekksS0FBdkIsSUFBZ0MsQ0FBeEM7QUFDMUIsU0FBSTNDLEtBQUs0QyxNQUFJLENBQVQsTUFBZ0IsSUFBcEIsRUFBMEJBLE1BQTFCLEtBQ0ssSUFBSTVDLEtBQUs0QyxNQUFJLENBQVQsTUFBZ0IsSUFBcEIsRUFBMEJBLE1BQU01QyxLQUFLcUwsT0FBTCxDQUFhLElBQWIsRUFBbUJ6SSxHQUFuQixJQUEwQixDQUFoQztBQUNsQzs7QUFFRyxTQUFJMEksUUFBUXRMLEtBQUt3RixLQUFMLENBQVc3QyxLQUFYLEVBQWtCQyxHQUFsQixFQUF1QjJJLEtBQXZCLENBQTZCLElBQTdCLENBQVo7QUFDQTtBQUNBLFNBQUkzRCxNQUFNdUQsUUFBVixFQUFvQjtBQUNuQkcsY0FBUUEsTUFBTWxJLEdBQU4sQ0FBVTtBQUFBLGNBQVFvSSxLQUFLLENBQUwsTUFBWSxJQUFaLEdBQW1CQSxLQUFLbEwsTUFBTCxDQUFZLENBQVosQ0FBbkIsR0FBb0NrTCxJQUE1QztBQUFBLE9BQVYsQ0FBUjtBQUNBO0FBQ0Q7QUFIQSxVQUlLO0FBQ0pGLGVBQVFBLE1BQU1sSSxHQUFOLENBQVU7QUFBQSxlQUFRLE9BQU9vSSxJQUFmO0FBQUEsUUFBVixDQUFSO0FBQ0E7QUFDRFIsc0JBQWlCckksS0FBakI7QUFDQXVJLGVBQVVJLE1BQU1HLElBQU4sQ0FBVyxJQUFYLENBQVY7QUFDQVIsb0JBQWVELGlCQUFpQkUsUUFBUXhKLE1BQXpCLEdBQWtDLENBQWpEO0FBQ0E7O0FBRUQ7QUFDQXFKLFdBQVFuRyxLQUFSLEdBQWlCNUUsS0FBS00sTUFBTCxDQUFZLENBQVosRUFBZXFDLEtBQWYsSUFDWHVJLE9BRFcsR0FFWGxMLEtBQUtNLE1BQUwsQ0FBWXNDLEdBQVosQ0FGTjs7QUFJQTtBQUNBbUksV0FBUUMsY0FBUixHQUF5QkEsY0FBekI7QUFDQUQsV0FBUUUsWUFBUixHQUF1QkEsWUFBdkI7O0FBRUE7QUFDQSxPQUFJLE1BQUtwRixLQUFMLENBQVc2RixRQUFmLEVBQXlCLE1BQUs3RixLQUFMLENBQVc2RixRQUFYLENBQW9COUQsS0FBcEI7QUFDekIsRzs7Ozs7MkJBOURRO0FBQ1IsVUFBTyw4QkFBQyx5QkFBRCxlQUFjLEtBQUsvQixLQUFuQixJQUEwQixXQUFXLEtBQUsrRSxTQUExQyxJQUFQO0FBQ0E7O0FBRUQ7Ozs7O0VBTDZDZSx5Qjs7a0JBQXpCaEIsZ0I7Ozs7Ozs7Ozs7QUNackI7Ozs7QUFDQTs7OztBQUdBOzs7O0FBR0E7Ozs7OztBQUVBOzs7QUFOQTtBQUpBO0FBV0FpQixtQkFBU0MsTUFBVCxDQUNFLDhCQUFDLHFCQUFELE9BREYsRUFFRUMsU0FBU0MsY0FBVCxDQUF3QixZQUF4QixDQUZGOztBQUpBLHVCOzs7Ozs7Ozs7Ozs7Ozs7O1FDRmdCQyxVLEdBQUFBLFU7Ozs7QUFMaEI7QUFDQTtBQUNBOztBQUVBO0FBQ08sU0FBU0EsVUFBVCxHQUE4QjtBQUFBLG9DQUFOQyxJQUFNO0FBQU5BLFFBQU07QUFBQTs7QUFDbkMsU0FBT0EsS0FBSzdJLEdBQUwsQ0FBVSxlQUFPO0FBQ3RCLFFBQUksQ0FBQzhJLEdBQUwsRUFBVSxPQUFPLEVBQVA7QUFDVixRQUFJeEksTUFBTUMsT0FBTixDQUFjdUksR0FBZCxDQUFKLEVBQXdCLE9BQU9GLCtDQUFjRSxHQUFkLEVBQVA7QUFDeEIsbUJBQWVBLEdBQWYseUNBQWVBLEdBQWY7QUFDRSxXQUFLLFFBQUw7QUFDQSxXQUFLLFFBQUw7QUFBZ0IsZUFBT0EsR0FBUDtBQUNoQjtBQUNFLGVBQU81SyxPQUFPd0QsSUFBUCxDQUFZb0gsR0FBWixFQUFpQjlJLEdBQWpCLENBQXNCO0FBQUEsaUJBQU84SSxJQUFJckgsR0FBSixJQUFXQSxHQUFYLEdBQWlCLEVBQXhCO0FBQUEsU0FBdEIsRUFDRTdDLE1BREYsQ0FDU21LLE9BRFQsRUFFRVYsSUFGRixDQUVPLEdBRlAsQ0FBUDtBQUpKO0FBUUQsR0FYTSxFQVdKekosTUFYSSxDQVdHbUssT0FYSCxFQVlKVixJQVpJLENBWUMsR0FaRCxDQUFQO0FBYUQsQzs7Ozs7Ozs7Ozs7OztRQ2ZlVyxRLEdBQUFBLFE7UUFnQkFDLGMsR0FBQUEsYztBQXBCaEI7O0FBRUE7QUFDQTtBQUNPLFNBQVNELFFBQVQsQ0FBa0JFLFFBQWxCLEVBQTRCQyxNQUE1QixFQUFvQztBQUMxQyxRQUFPLFlBQVc7QUFDakIsTUFBSSxLQUFLRCxRQUFMLE1BQW1CbEssU0FBdkIsRUFBa0M7QUFDakMsT0FBSXdDLFFBQVEySCxPQUFPQyxLQUFQLENBQWEsSUFBYixDQUFaO0FBQ0EsT0FBSTVILFVBQVV4QyxTQUFkLEVBQXlCO0FBQ3hCO0FBQ0FkLFdBQU9xRCxjQUFQLENBQXNCLElBQXRCLEVBQTRCMkgsUUFBNUIsRUFBc0MsRUFBRTFILFlBQUYsRUFBUzZILGNBQWMsSUFBdkIsRUFBdEM7QUFDQTtBQUNEO0FBQ0QsU0FBTyxLQUFLSCxRQUFMLENBQVA7QUFDQSxFQVREO0FBVUE7O0FBR0Q7QUFDQTtBQUNPLFNBQVNELGNBQVQsQ0FBd0JDLFFBQXhCLEVBQWtDQyxNQUFsQyxFQUEwQztBQUNoRCxRQUFPO0FBQ05HLE9BQU1OLFNBQVNFLFFBQVQsRUFBbUJDLE1BQW5CO0FBREEsRUFBUDtBQUdBLEM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNyQkQ7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7OytlQUxBO0FBQ0E7QUFDQTs7O0FBS0E7QUFDQSxJQUFNdEgsU0FBUy9ELGlCQUFPOEQsT0FBUCxDQUFlLEtBQWYsQ0FBZjtrQkFDZUMsTTs7O0FBRWZBLE9BQU8wSCxXQUFQLENBQ0U7QUFDRTFJLFFBQU0sS0FEUjtBQUVFRSxTQUFPLENBQUUsWUFBRixFQUFnQixXQUFoQixDQUZUO0FBR0VEO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQ0U7QUFERiw0QkFFUWUsTUFGUixFQUVnQnBELE1BRmhCLEVBRXdEO0FBQUEsWUFBaENjLEtBQWdDLHVFQUF4QixDQUF3QjtBQUFBLFlBQXJCQyxHQUFxQix1RUFBZmYsT0FBT0gsTUFBUTs7QUFDcEQsWUFBSVEsUUFBUUwsT0FBT2MsS0FBUCxDQUFaO0FBQ0EsWUFBSSxFQUFFVCxpQkFBaUJKLG9CQUFVOEssVUFBN0IsQ0FBSixFQUE4QyxPQUFPeEssU0FBUDtBQUM5QyxlQUFPLEtBQUt5SyxLQUFMLENBQVc7QUFDaEJDLG1CQUFTNUssS0FETztBQUVoQjZLLHFCQUFXcEssUUFBUTtBQUZILFNBQVgsQ0FBUDtBQUlEOztBQUVEO0FBQ0E7O0FBWkY7QUFBQTtBQUFBLG9DQWFnQnFLLE9BYmhCLEVBYW9EO0FBQUE7O0FBQUEsWUFBM0JDLFVBQTJCLHVFQUFkLEtBQUtILE9BQVM7O0FBQ2hELFlBQUlJLGFBQWFELFdBQVdDLFVBQTVCO0FBQ0EsWUFBSSxDQUFDQSxVQUFELElBQWUsQ0FBQ0EsV0FBV3hMLE1BQS9CLEVBQXVDLE9BQU9VLFNBQVA7O0FBRXZDLFlBQUkrSyxRQUFRRCxXQUFXOUosR0FBWCxDQUFnQixnQkFBcUI7QUFBQSxjQUFsQmEsSUFBa0IsUUFBbEJBLElBQWtCO0FBQUEsY0FBWlcsS0FBWSxRQUFaQSxLQUFZOztBQUMvQztBQUNBLGNBQUlBLFVBQVV4QyxTQUFkLEVBQXlCd0MsUUFBUVgsSUFBUjtBQUN6QjtBQURBLGVBRUssSUFBSVcsaUJBQWlCOUMsb0JBQVVzTCxhQUEvQixFQUE4QztBQUNqRHhJLHNCQUFRLE9BQUt5SSxxQkFBTCxDQUEyQkwsT0FBM0IsRUFBb0NwSSxLQUFwQyxDQUFSO0FBQ0Q7QUFDRDtBQUNOO0FBSlcsaUJBS0EsSUFBSUEsaUJBQWlCOUMsb0JBQVU4SyxVQUEvQixFQUEyQztBQUM5Q2hJLHdCQUFRQSxNQUFNbEMsUUFBTixDQUFlc0ssT0FBZixDQUFSO0FBQ0Q7QUFDRDs7QUFFQTtBQUNBLGNBQUkvSSxTQUFTLE9BQWIsRUFBc0JBLE9BQU8sV0FBUDtBQUM1QjtBQUNNLGlCQUFVQSxJQUFWLFVBQW1CVyxLQUFuQjtBQUNELFNBbEJXLENBQVo7O0FBb0JBLHNCQUFZdUksTUFBTTFCLElBQU4sQ0FBVyxJQUFYLENBQVo7QUFDRDs7QUFFRDtBQUNBOztBQXpDRjtBQUFBO0FBQUEsdUNBMENtQnVCLE9BMUNuQixFQTBDdUQ7QUFBQTs7QUFBQSxZQUEzQkMsVUFBMkIsdUVBQWQsS0FBS0gsT0FBUzs7QUFDbkQsWUFBSVEsV0FBV0wsV0FBV0ssUUFBMUI7QUFDQSxZQUFJLENBQUNBLFFBQUQsSUFBYUEsU0FBUzVMLE1BQVQsS0FBb0IsQ0FBckMsRUFBd0MsT0FBT1UsU0FBUDtBQUN4QyxlQUFPa0wsU0FBU2xLLEdBQVQsQ0FBYSxpQkFBUztBQUNqQztBQUNNLGNBQUksT0FBT21LLEtBQVAsS0FBaUIsUUFBckIsRUFBK0I7QUFDN0I7QUFDQSxnQkFBSXZOLE9BQU91TixNQUFNQyxJQUFOLEVBQVg7QUFDQSxnQkFBSSxDQUFDeE4sSUFBTCxFQUFXLE9BQU9vQyxTQUFQO0FBQ1gsMEJBQVdwQyxJQUFYO0FBQ0Q7QUFDRCxjQUFJdU4saUJBQWlCekwsb0JBQVU4SyxVQUEvQixFQUEyQztBQUN6QyxnQkFBSWEsY0FBYyxPQUFLQyxrQkFBTCxDQUF3QlYsT0FBeEIsRUFBaUNPLEtBQWpDLENBQWxCO0FBQ0EsbUJBQU9FLFlBQVlsQyxLQUFaLENBQWtCLElBQWxCLEVBQXdCRSxJQUF4QixDQUE2QixNQUE3QixDQUFQO0FBQ0Q7QUFDRCxjQUFJOEIsaUJBQWlCekwsb0JBQVVzTCxhQUEvQixFQUE4QztBQUM1QyxtQkFBTyxPQUFLQyxxQkFBTCxDQUEyQkwsT0FBM0IsRUFBb0NPLEtBQXBDLENBQVA7QUFDRDtBQUNELGdCQUFNLElBQUk5SyxXQUFKLENBQWdCLCtDQUFnRDhLLEtBQWhFLENBQU47QUFDRCxTQWhCTTtBQWlCUDtBQWpCTyxTQWtCTnZMLE1BbEJNLENBa0JDbUssT0FsQkQsQ0FBUDtBQW1CRDs7QUFFRDs7QUFsRUY7QUFBQTtBQUFBLDRDQW1Fd0JhLE9BbkV4QixFQW1FaUNXLGFBbkVqQyxFQW1FZ0Q7QUFDNUMsWUFBSTlMLFNBQVM4TCxjQUFjOUwsTUFBM0I7QUFDSmYsZ0JBQVF3SSxJQUFSLENBQWFxRSxhQUFiLEVBQTRCOUwsTUFBNUI7QUFDSSxlQUFPLG1CQUFnQkEsT0FBTzRKLElBQVAsQ0FBWSxHQUFaLENBQWhCLFVBQXNDLEdBQTdDO0FBQ0Q7QUF2RUg7QUFBQTtBQUFBLHlDQXlFcUJ1QixPQXpFckIsRUF5RXlEO0FBQUEsWUFBM0JDLFVBQTJCLHVFQUFkLEtBQUtILE9BQVM7O0FBQ3JEO0FBQ0EsWUFBSWMsaUJBQWNYLFdBQVdXLE9BQXpCLE9BQUo7QUFDQSxZQUFJVCxRQUFRLEtBQUtVLGFBQUwsQ0FBbUJiLE9BQW5CLEVBQTRCQyxVQUE1QixDQUFaO0FBQ0EsWUFBSUssV0FBVyxLQUFLUSxnQkFBTCxDQUFzQmQsT0FBdEIsRUFBK0JDLFVBQS9CLENBQWY7O0FBRUEsWUFBSWxJLDRCQUEwQjZJLE9BQTlCO0FBQ0EsWUFBSSxDQUFDVCxLQUFELElBQVVHLFFBQWQsRUFBd0JILFFBQVEsTUFBUjs7QUFFeEIsWUFBSUEsS0FBSixFQUFXcEksaUJBQWVvSSxLQUFmO0FBQ1gsWUFBSUcsUUFBSixFQUFjO0FBQ1p2SSxvQkFBVSxVQUFVdUksU0FBUzdCLElBQVQsQ0FBYyxPQUFkLENBQVYsR0FBbUMsSUFBN0M7QUFDRDtBQUNEMUcsa0JBQVUsR0FBVjtBQUNBLGVBQU9BLE1BQVA7QUFDRDtBQXhGSDtBQUFBO0FBQUEsK0JBMEZXaUksT0ExRlgsRUEwRm9CO0FBQ2hCLGVBQU8sS0FBS1Usa0JBQUwsQ0FBd0JWLE9BQXhCLEVBQWlDLEtBQUtGLE9BQXRDLENBQVA7QUFDRDtBQTVGSDs7QUFBQTtBQUFBLElBQXNDeEosY0FBdEM7QUFIRixDQURGLEU7Ozs7Ozs7Ozs7Ozs7Ozs7QUNQQTs7OztBQUNBOzs7Ozs7Ozs7OytlQUxBO0FBQ0E7QUFDQTs7QUFLQTtBQUNBLElBQU0yQixTQUFTL0QsaUJBQU84RCxPQUFQLENBQWUsSUFBZixDQUFmO2tCQUNlQyxNOzs7QUFFZkEsT0FBTzBILFdBQVAsQ0FDRTtBQUNFMUksUUFBTSxJQURSO0FBRUVFLFNBQU8sV0FGVDtBQUdFRSxVQUFRLGtEQUhWO0FBSUVIO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSwrQkFDVzhJLE9BRFgsRUFDb0I7QUFBQSxnQ0FDc0IsS0FBS2UsZ0JBQUwsQ0FBc0JmLE9BQXRCLENBRHRCO0FBQUEsWUFDVmdCLFNBRFUscUJBQ1ZBLFNBRFU7QUFBQSxZQUNDQyxTQURELHFCQUNDQSxTQUREO0FBQUEsWUFDWUMsS0FEWixxQkFDWUEsS0FEWjtBQUV0Qjs7O0FBQ00sWUFBSUMsYUFBYTdLLGVBQUs4SyxLQUFMLENBQVdDLGlCQUFYLENBQTZCSixTQUE3QixFQUF3Q0MsS0FBeEMsQ0FBakI7QUFDQSx3QkFBY0YsU0FBZCxVQUE0QkcsVUFBNUI7QUFDRDtBQU5IOztBQUFBO0FBQUEsSUFBK0I3SyxlQUFLZ0wsY0FBcEM7QUFKRixDQURGOztBQWVFO0FBQ0E7QUFDRXJLLFFBQU0sY0FEUjtBQUVFRSxTQUFPLFdBRlQ7QUFHRUUsVUFBUSx1RkFIVjtBQUlFa0ssaUJBQWUsSUFKakI7QUFLRUMsWUFBVSxJQUFJbEwsZUFBS21MLFFBQVQsQ0FBa0IsRUFBRUMsVUFBVSxDQUFFLElBQUYsQ0FBWixFQUFsQixDQUxaO0FBTUV4SztBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsK0JBQ1c4SSxPQURYLEVBQ29CO0FBQUEsaUNBQzhCLEtBQUtlLGdCQUFMLENBQXNCZixPQUF0QixDQUQ5QjtBQUFBLFlBQ1ZnQixTQURVLHNCQUNWQSxTQURVO0FBQUEsWUFDQ0MsU0FERCxzQkFDQ0EsU0FERDtBQUFBLFlBQ1lVLGFBRFosc0JBQ1lBLGFBRFo7O0FBRWhCLFlBQUk1SixrQkFBZ0JpSixTQUFoQixZQUFnQ0MsU0FBaEMsT0FBSjtBQUNBLFlBQUlVLGFBQUosRUFBbUI1Six3QkFBc0I0SixhQUF0QjtBQUNuQixlQUFPNUosTUFBUDtBQUNEO0FBTkg7O0FBQUE7QUFBQSxJQUF3Q3pCLGVBQUtzTCxRQUE3QztBQU5GLENBaEJGLEVBZ0NFO0FBQ0UzSyxRQUFNLFNBRFI7QUFFRUUsU0FBTyxXQUZUO0FBR0VFLFVBQVEsa0VBSFY7QUFJRUg7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLCtCQUNXOEksT0FEWCxFQUNvQjtBQUFBLGlDQUNzQixLQUFLZSxnQkFBTCxDQUFzQmYsT0FBdEIsQ0FEdEI7QUFBQSxZQUNWZ0IsU0FEVSxzQkFDVkEsU0FEVTtBQUFBLFlBQ0NDLFNBREQsc0JBQ0NBLFNBREQ7QUFBQSxZQUNZQyxLQURaLHNCQUNZQSxLQURaO0FBRXRCOzs7QUFDTSxZQUFJQyxhQUFhN0ssZUFBSzhLLEtBQUwsQ0FBV0MsaUJBQVgsQ0FBNkJKLFNBQTdCLEVBQXdDQyxLQUF4QyxDQUFqQjtBQUNBLDZCQUFtQkYsU0FBbkIsVUFBaUNHLFVBQWpDO0FBQ0Q7QUFOSDs7QUFBQTtBQUFBLElBQW1DN0ssZUFBS2dMLGNBQXhDO0FBSkYsQ0FoQ0YsRUE4Q0U7QUFDRXJLLFFBQU0sTUFEUjtBQUVFRSxTQUFPLFdBRlQ7QUFHRUUsVUFBUSxvQ0FIVjtBQUlFSDtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsK0JBQ1c4SSxPQURYLEVBQ29CO0FBQUEsaUNBQ1csS0FBS2UsZ0JBQUwsQ0FBc0JmLE9BQXRCLENBRFg7QUFBQSxZQUNWaUIsU0FEVSxzQkFDVkEsU0FEVTtBQUFBLFlBQ0NDLEtBREQsc0JBQ0NBLEtBREQ7QUFFdEI7OztBQUNNLFlBQUlDLGFBQWE3SyxlQUFLOEssS0FBTCxDQUFXQyxpQkFBWCxDQUE2QkosU0FBN0IsRUFBd0NDLEtBQXhDLENBQWpCO0FBQ0EseUJBQWVDLFVBQWY7QUFDRDtBQU5IOztBQUFBO0FBQUEsSUFBaUM3SyxlQUFLZ0wsY0FBdEM7QUFKRixDQTlDRixFOzs7Ozs7Ozs7Ozs7Ozs7O0FDSkE7Ozs7QUFDQTs7OztBQUVBOzs7Ozs7OzsrZUFWQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFPQTtBQUNBLElBQU1ySixTQUFTL0QsaUJBQU84RCxPQUFQLENBQWUsT0FBZixDQUFmO2tCQUNlQyxNOztBQUdmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0FBLE9BQU8wSCxXQUFQO0FBQ0U7QUFDQTtBQUNBO0FBQ0UxSSxRQUFNLGFBRFI7QUFFRUUsU0FBTyxZQUZUO0FBR0VFLFVBQVEsa0RBSFY7QUFJRUg7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLCtCQUNXOEksT0FEWCxFQUNvQjtBQUFBLGdDQUNXLEtBQUtlLGdCQUFMLENBQXNCZixPQUF0QixDQURYO0FBQUEsWUFDVjZCLElBRFUscUJBQ1ZBLElBRFU7QUFBQSxZQUNKQyxVQURJLHFCQUNKQSxVQURJO0FBRXRCOzs7QUFDTSxlQUFVRCxJQUFWO0FBQ0Q7QUFMSDs7QUFBQTtBQUFBLElBQXVDdkwsZUFBS3NMLFFBQTVDO0FBSkYsQ0FIRjs7QUFnQkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0UzSyxRQUFNLGVBRFI7QUFFRUUsU0FBTyxZQUZUO0FBR0VFLFVBQVEsMERBSFY7QUFJRUg7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLCtCQUNXOEksT0FEWCxFQUNvQjtBQUFBLGlDQUNNLEtBQUtlLGdCQUFMLENBQXNCZixPQUF0QixDQUROO0FBQUEsWUFDVitCLEtBRFUsc0JBQ1ZBLEtBRFU7QUFBQSxZQUNIRixJQURHLHNCQUNIQSxJQURHOztBQUVoQixxQ0FBMkJFLEtBQTNCLFVBQXFDRixJQUFyQztBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUF5Q3ZMLGVBQUtzTCxRQUE5QztBQUpGLENBckJGOztBQWlDRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0UzSyxRQUFNLFNBRFI7QUFFRUksVUFBUSxPQUZWO0FBR0VIO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNaLGVBQUttTCxRQUF4QztBQUhGLENBckNGLEVBNkNFO0FBQ0V4SyxRQUFNLFNBRFI7QUFFRUksVUFBUSxRQUZWO0FBR0VIO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNaLGVBQUttTCxRQUF4QztBQUhGLENBN0NGLEVBcURFO0FBQ0V4SyxRQUFNLFNBRFI7QUFFRUksVUFBUSxPQUZWO0FBR0VIO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNaLGVBQUttTCxRQUF4QztBQUhGLENBckRGLEVBNkRFO0FBQ0V4SyxRQUFNLFNBRFI7QUFFRUksVUFBUSxRQUZWO0FBR0VIO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNaLGVBQUttTCxRQUF4QztBQUhGLENBN0RGLEVBcUVFO0FBQ0V4SyxRQUFNLFNBRFI7QUFFRUksVUFBUSxPQUZWO0FBR0VIO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNaLGVBQUttTCxRQUF4QztBQUhGLENBckVGLEVBNkVFO0FBQ0V4SyxRQUFNLFNBRFI7QUFFRUksVUFBUSxPQUZWO0FBR0VIO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNaLGVBQUttTCxRQUF4QztBQUhGLENBN0VGLEVBcUZFO0FBQ0V4SyxRQUFNLFNBRFI7QUFFRUksVUFBUSxTQUZWO0FBR0VIO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNaLGVBQUttTCxRQUF4QztBQUhGLENBckZGLEVBNkZFO0FBQ0V4SyxRQUFNLFNBRFI7QUFFRUksVUFBUSxRQUZWO0FBR0VIO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNaLGVBQUttTCxRQUF4QztBQUhGLENBN0ZGLEVBcUdFO0FBQ0V4SyxRQUFNLFNBRFI7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YyxjQUFQLEdBQXdCelksV0FBeEI7QUFDQSxNQUFNMkksUUFBUSxJQUFJK1AsUUFBSixDQUFhLE1BQWIsb0JBQXFDM1ksSUFBckMsa0NBQWQ7QUFDQSxTQUFPeEQsT0FBT2tjLGNBQWQ7QUFDQSxTQUFPOVAsS0FBUDtBQUNELEM7Ozs7Ozs7O0FDWkQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGdsb2JhbCBmcm9tIFwiLi9nbG9iYWxcIjtcblxuLy8gUmV0dXJuIHRydWUgaWYgdGV4dCBpcyBhbGwgd2hpdGVzcGFjZSwgaW5jbHVkaW5nIGVtcHR5IHN0cmluZy5cbmxldCBBTExfV0hJVEVTUEFDRSA9IC9eXFxzKiQvO1xuZXhwb3J0IGZ1bmN0aW9uIGlzV2hpdGVzcGFjZSh0ZXh0KSB7XG5cdHJldHVybiBBTExfV0hJVEVTUEFDRS50ZXN0KHRleHQpXG59XG5cbi8vIFJldHVybiB0aGUgcGx1cmFsIG9mIGB3b3JkYC5cbi8vIE5PVEU6IHRoaXMgaXMgbm90IHZlcnkgZ29vZCBhdCBhbGwhISFcbi8vIFRPRE86IGV4Y2VwdGlvbnMsIGV0Yy5cbmV4cG9ydCBmdW5jdGlvbiBwbHVyYWxpemUod29yZCkge1xuXHRyZXR1cm4gd29yZCArIFwic1wiO1xufVxuXG4vLyBSZXR1cm4gdHJ1ZSBpZiB3b3JkIGlzIGEgcGx1cmFsLlxuLy8gTk9URTogZm9yIHdvcmRzIHdoaWNoIGFyZSBCT1RIIHNpbmd1bGFyIGFuZCBwbHVyYWwsIHRoaXMgd2lsbCByZXR1cm4gdHJ1ZS5cbmV4cG9ydCBmdW5jdGlvbiBpc1BsdXJhbCh3b3JkKSB7XG5cdHJldHVybiB3b3JkID09PSBwbHVyYWxpemUod29yZCk7XG59XG5cblxuLy8gUmV0dXJuIHRoZSBzaW5ndWxhciBvZiBgd29yZGAuXG4vLyBOT1RFOiB0aGlzIGlzIG5vdCB2ZXJ5IGdvb2QgYXQgYWxsISEhXG4vLyBUT0RPOiBleGNlcHRpb25zLCBldGMuXG5leHBvcnQgZnVuY3Rpb24gc2luZ3VsYXJpemUod29yZCkge1xuXHRyZXR1cm4gd29yZC5yZXBsYWNlKC9lP3MkLywgXCJcIik7XG59XG5cbi8vIFJldHVybiB0cnVlIGlmIHdvcmQgaXMgYSBzaW5ndWxhci5cbi8vIE5PVEU6IGZvciB3b3JkcyB3aGljaCBhcmUgQk9USCBzaW5ndWxhciBhbmQgcGx1cmFsLCB0aGlzIHdpbGwgcmV0dXJuIHRydWUuXG5leHBvcnQgZnVuY3Rpb24gaXNTaW5ndWxhcih3b3JkKSB7XG5cdHJldHVybiB3b3JkID09PSBzaW5ndWxhcml6ZSh3b3JkKTtcbn1cblxuXG4vLyBSZXR1cm4gYSBjZXJ0YWluIGBudW1iZXJgIG9mIHRhYiBjaGFyYWN0ZXJzLlxuY29uc3QgVEFCUyA9IFwiXFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XCI7XG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFicyhudW1iZXIpIHtcblx0aWYgKHR5cGVvZiBudW1iZXIgIT09IFwibnVtYmVyXCIpIHJldHVybiBcIlwiO1xuXHRyZXR1cm4gVEFCUy5zdWJzdHIoMCwgbnVtYmVyKTtcbn1cblxuXG4vLyBFeHBvcnQgYWxsIGFzIGEgbHVtcFxubGV0IGFsbEV4cG9ydHMgPSB7Li4uZXhwb3J0c307XG5leHBvcnQgZGVmYXVsdCBhbGxFeHBvcnRzO1xuXG4vLyBERUJVRzogcHV0IG9uIGdsb2JhbCBmb3IgZGVidWdnaW5nLlxuZ2xvYmFsLlNUUklORyA9IGFsbEV4cG9ydHM7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdXRpbHMvc3RyaW5nLmpzIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoIWlzT2JqZWN0KGl0KSkgdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fYW4tb2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSAxMTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhlYykge1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZmFpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDExNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgJ2NvcmUtanMvZXM2L3N5bWJvbCc7XG5cbi8vIFRPRE86IE5lZWQgYmV0dGVyLCBtb3JlIGNvbXBsZXRlLCBhbmQgbW9yZSBtZXRob2RpY2FsIGtleSBkZWZpbml0aW9uc1xuXG52YXIgS2V5cyA9IHtcbiAgYmFja3NwYWNlOiA4LFxuICBkZWw6IDQ2LFxuICBkZWxldGU6IDQ2LFxuICB0YWI6IDksXG4gIGVudGVyOiAxMyxcbiAgJ3JldHVybic6IDEzLFxuICBlc2M6IDI3LFxuICBzcGFjZTogMzIsXG4gIHBhZ2VVcDogMzMsXG4gIHBhZ2VEb3duOiAzNCxcbiAgZW5kOiAzNSxcbiAgaG9tZTogMzYsXG4gIGxlZnQ6IDM3LFxuICB1cDogMzgsXG4gIHJpZ2h0OiAzOSxcbiAgZG93bjogNDAsXG4gICc7JzogMTg2LFxuICAnPSc6IDE4NyxcbiAgJywnOiAxODgsXG4gICctJzogMTg5LFxuICAnLic6IDE5MCxcbiAgJy8nOiAxOTEsXG4gICdgJzogMTkyLFxuICAnWyc6IDIxOSxcbiAgJ1xcXFwnOiAyMjAsXG4gICddJzogMjIxXG59O1xuXG4vLyBBZGQgdXBwZXJjYXNlIHZlcnNpb25zIG9mIGtleXMgYWJvdmUgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG5PYmplY3Qua2V5cyhLZXlzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIEtleXNba2V5LnRvVXBwZXJDYXNlKCldID0gS2V5c1trZXldO1xufSk7XG5cbicwMTIzNDU2Nzg5Jy5zcGxpdCgnJykuZm9yRWFjaChmdW5jdGlvbiAobnVtLCBpbmRleCkge1xuICByZXR1cm4gS2V5c1tudW1dID0gaW5kZXggKyA0ODtcbn0pO1xuXG4nQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChsZXR0ZXIsIGluZGV4KSB7XG4gIEtleXNbbGV0dGVyXSA9IGluZGV4ICsgNjU7XG4gIEtleXNbbGV0dGVyLnRvTG93ZXJDYXNlKCldID0gaW5kZXggKyA2NTtcbn0pO1xuXG4vLyBmbiBrZXlzXG5bMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIDExLCAxMl0uZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcbiAgcmV0dXJuIEtleXNbJ2YnICsgaW5kZXhdID0gMTExICsgaW5kZXg7XG59KTtcblxuZXhwb3J0IHZhciBtb2RpZmllcnMgPSB7XG4gIGNvbnRyb2w6ICdjdHJsJyxcbiAgY3RybDogJ2N0cmwnLFxuICBzaGlmdDogJ3NoaWZ0JyxcbiAgbWV0YTogJ21ldGEnLFxuICBjbWQ6ICdtZXRhJyxcbiAgY29tbWFuZDogJ21ldGEnLFxuICBvcHRpb246ICdhbHQnLFxuICBhbHQ6ICdhbHQnXG59O1xuXG5leHBvcnQgdmFyIEFMTF9LRVlTID0gU3ltYm9sKCdBTExfS0VZUycpO1xuXG5leHBvcnQgdmFyIEFMTF9QUklOVEFCTEVfS0VZUyA9IFN5bWJvbCgnQUxMX1BSSU5UQUJMRV9LRVlTJyk7XG5cbmV4cG9ydCBkZWZhdWx0IEtleXM7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL2tleXMuanNcbi8vIG1vZHVsZSBpZCA9IDE0OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgX3NsaWNlZFRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH0gcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyByZXR1cm4gYXJyOyB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkgeyByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpOyB9IGVsc2UgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTsgfSB9OyB9KCk7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG4vKipcbiAqIEBtb2R1bGUgc3RvcmVcbiAqXG4gKi9cbmltcG9ydCBtYXRjaEtleXMgZnJvbSAnLi9saWIvbWF0Y2hfa2V5cyc7XG5pbXBvcnQgcGFyc2VLZXlzIGZyb20gJy4vbGliL3BhcnNlX2tleXMnO1xuaW1wb3J0IHV1aWQgZnJvbSAnLi9saWIvdXVpZCc7XG5cbi8qKlxuICogcHJpdmF0ZVxuICpcbiAqL1xuXG4vLyBkaWN0IGZvciBjbGFzcyBwcm90b3R5cGVzID0+IGJpbmRpbmdzXG52YXIgX2hhbmRsZXJzID0gbmV3IE1hcCgpO1xuXG4vLyBhbGwgbW91bnRlZCBpbnN0YW5jZXMgdGhhdCBoYXZlIGtleWJpbmRpbmdzXG52YXIgX2luc3RhbmNlcyA9IG5ldyBTZXQoKTtcblxuLy8gZm9yIHRlc3RpbmdcbmV4cG9ydCBmdW5jdGlvbiBfcmVzZXRTdG9yZSgpIHtcbiAgX2hhbmRsZXJzLmNsZWFyKCk7XG4gIF9pbnN0YW5jZXMuY2xlYXIoKTtcbn1cblxuLyoqXG4gKiBhY3RpdmF0ZVxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gaW5zdGFuY2UgSW5zdGFudGlhdGVkIGNsYXNzIHRoYXQgZXh0ZW5kZWQgUmVhY3QuQ29tcG9uZW50LCB0byBiZSBmb2N1c2VkIHRvIHJlY2VpdmUga2V5ZG93biBldmVudHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKGluc3RhbmNlcykge1xuICB2YXIgaW5zdGFuY2VzQXJyYXkgPSBbXS5jb25jYXQoaW5zdGFuY2VzKTtcblxuICAvLyBpZiBubyBjb21wb25lbnRzIHdlcmUgZm91bmQgYXMgYW5jZXN0b3JzIG9mIHRoZSBldmVudCB0YXJnZXQsXG4gIC8vIGVmZmVjdGl2ZWx5IGRlYWN0aXZhdGUga2V5ZG93biBoYW5kbGluZyBieSBjYXBwaW5nIHRoZSBzZXQgb2YgaW5zdGFuY2VzXG4gIC8vIHdpdGggYG51bGxgLlxuICBpZiAoIWluc3RhbmNlc0FycmF5Lmxlbmd0aCkge1xuICAgIF9pbnN0YW5jZXMuYWRkKG51bGwpO1xuICB9IGVsc2Uge1xuICAgIF9pbnN0YW5jZXMuZGVsZXRlKG51bGwpO1xuXG4gICAgLy8gZGVsZXRpbmcgYW5kIHRoZW4gYWRkaW5nIHRoZSBpbnN0YW5jZShzKSBoYXMgdGhlIGVmZmVjdCBvZiBzb3J0aW5nIHRoZSBzZXRcbiAgICAvLyBhY2NvcmRpbmcgdG8gaW5zdGFuY2UgYWN0aXZhdGlvbiAoYXNjZW5kaW5nKVxuICAgIGluc3RhbmNlc0FycmF5LmZvckVhY2goZnVuY3Rpb24gKGluc3RhbmNlKSB7XG4gICAgICBfaW5zdGFuY2VzLmRlbGV0ZShpbnN0YW5jZSk7XG4gICAgICBfaW5zdGFuY2VzLmFkZChpbnN0YW5jZSk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8qKlxuICogZGVsZXRlSW5zdGFuY2VcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCBJbnN0YW50aWF0ZWQgY2xhc3MgdGhhdCBleHRlbmRlZCBSZWFjdC5Db21wb25lbnRcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRoZSB2YWx1ZSBzZXQuaGFzKCB0YXJnZXQgKSB3b3VsZCBoYXZlIHJldHVybmVkIHByaW9yIHRvIGRlbGV0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVJbnN0YW5jZSh0YXJnZXQpIHtcbiAgX2luc3RhbmNlcy5kZWxldGUodGFyZ2V0KTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kQmluZGluZ0ZvckV2ZW50KGV2ZW50KSB7XG4gIGlmICghX2luc3RhbmNlcy5oYXMobnVsbCkpIHtcbiAgICB2YXIga2V5TWF0Y2hlc0V2ZW50ID0gZnVuY3Rpb24ga2V5TWF0Y2hlc0V2ZW50KGtleVNldCkge1xuICAgICAgcmV0dXJuIG1hdGNoS2V5cyh7IGtleVNldDoga2V5U2V0LCBldmVudDogZXZlbnQgfSk7XG4gICAgfTtcblxuICAgIC8vIGxvb3AgdGhyb3VnaCBpbnN0YW5jZXMgaW4gcmV2ZXJzZSBhY3RpdmF0aW9uIG9yZGVyIHNvIHRoYXQgbW9zdFxuICAgIC8vIHJlY2VudGx5IGFjdGl2YXRlZCBpbnN0YW5jZSBnZXRzIGZpcnN0IGRpYnMgb24gZXZlbnRcbiAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoX2luc3RhbmNlcykpLnJldmVyc2UoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gX3N0ZXAudmFsdWU7XG5cbiAgICAgICAgdmFyIGJpbmRpbmdzID0gZ2V0QmluZGluZyhpbnN0YW5jZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUpO1xuICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyID0gZmFsc2U7XG4gICAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gYmluZGluZ3NbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDI7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSAoX3N0ZXAyID0gX2l0ZXJhdG9yMi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWUpIHtcbiAgICAgICAgICAgIHZhciBfc3RlcDIkdmFsdWUgPSBfc2xpY2VkVG9BcnJheShfc3RlcDIudmFsdWUsIDIpLFxuICAgICAgICAgICAgICAgIGtleVNldHMgPSBfc3RlcDIkdmFsdWVbMF0sXG4gICAgICAgICAgICAgICAgZm4gPSBfc3RlcDIkdmFsdWVbMV07XG5cbiAgICAgICAgICAgIGlmIChrZXlTZXRzLnNvbWUoa2V5TWF0Y2hlc0V2ZW50KSkge1xuICAgICAgICAgICAgICAvLyByZXR1cm4gd2hlbiBtYXRjaGluZyBrZXliaW5kaW5nIGlzIGZvdW5kIC0gaS5lLiBvbmx5IG9uZVxuICAgICAgICAgICAgICAvLyBrZXlib3VuZCBjb21wb25lbnQgY2FuIHJlc3BvbmQgdG8gYSBnaXZlbiBrZXkgY29kZS4gdG8gZ2V0IGFyb3VuZCB0aGlzLFxuICAgICAgICAgICAgICAvLyBzY29wZSBhIGNvbW1vbiBhbmNlc3RvciBjb21wb25lbnQgY2xhc3Mgd2l0aCBAa2V5ZG93biBhbmQgdXNlXG4gICAgICAgICAgICAgIC8vIEBrZXlkb3duU2NvcGVkIHRvIGJpbmQgdGhlIGR1cGxpY2F0ZSBrZXlzIGluIHlvdXIgY2hpbGQgY29tcG9uZW50c1xuICAgICAgICAgICAgICAvLyAob3IganVzdCBpbnNwZWN0IG5leHRQcm9wcy5rZXlkb3duLmV2ZW50KS5cbiAgICAgICAgICAgICAgcmV0dXJuIHsgZm46IGZuLCBpbnN0YW5jZTogaW5zdGFuY2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgICAgICAgX2l0ZXJhdG9yRXJyb3IyID0gZXJyO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yICYmIF9pdGVyYXRvcjIucmV0dXJuKSB7XG4gICAgICAgICAgICAgIF9pdGVyYXRvcjIucmV0dXJuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjIpIHtcbiAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogZ2V0QmluZGluZ1xuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IENsYXNzIHVzZWQgYXMga2V5IGluIGRpY3Qgb2Yga2V5IGJpbmRpbmdzXG4gKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBvYmplY3QgY29udGFpbmluZyBiaW5kaW5ncyBmb3IgdGhlIGdpdmVuIGNsYXNzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRCaW5kaW5nKF9yZWYpIHtcbiAgdmFyIF9fcmVhY3RLZXlkb3duVVVJRCA9IF9yZWYuX19yZWFjdEtleWRvd25VVUlEO1xuXG4gIHJldHVybiBfaGFuZGxlcnMuZ2V0KF9fcmVhY3RLZXlkb3duVVVJRCk7XG59O1xuXG4vKipcbiAqIGdldEluc3RhbmNlc1xuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcmV0dXJuIHtzZXR9IEFsbCBzdG9yZWQgaW5zdGFuY2VzIChhbGwgbW91bnRlZCBjb21wb25lbnQgaW5zdGFuY2VzIHdpdGgga2V5YmluZGluZ3MpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbnN0YW5jZXMoKSB7XG4gIHJldHVybiBfaW5zdGFuY2VzO1xufTtcblxuLyoqXG4gKiBpc0VtcHR5XG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEByZXR1cm4ge251bWJlcn0gU2l6ZSBvZiB0aGUgc2V0IG9mIGFsbCBzdG9yZWQgaW5zdGFuY2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5KCkge1xuICByZXR1cm4gIV9pbnN0YW5jZXMuc2l6ZTtcbn07XG5cbi8qKlxuICogc2V0QmluZGluZ1xuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncyBBbGwgYXJndW1lbnRzIG5lY2Vzc2FyeSB0byBzZXQgdGhlIGJpbmRpbmdcbiAqIEBwYXJhbSB7YXJyYXl9IGFyZ3Mua2V5cyBLZXkgY29kZXMgdGhhdCBzaG91bGQgdHJpZ2dlciB0aGUgZm5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGFyZ3MuZm4gVGhlIGNhbGxiYWNrIHRvIGJlIHRyaWdnZXJlZCB3aGVuIGdpdmVuIGtleXMgYXJlIHByZXNzZWRcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzLnRhcmdldCBUaGUgZGVjb3JhdGVkIGNsYXNzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRCaW5kaW5nKF9yZWYyKSB7XG4gIHZhciBrZXlzID0gX3JlZjIua2V5cyxcbiAgICAgIGZuID0gX3JlZjIuZm4sXG4gICAgICB0YXJnZXQgPSBfcmVmMi50YXJnZXQ7XG5cbiAgdmFyIGtleVNldHMgPSBwYXJzZUtleXMoa2V5cyk7XG5cbiAgdmFyIF9fcmVhY3RLZXlkb3duVVVJRCA9IHRhcmdldC5fX3JlYWN0S2V5ZG93blVVSUQ7XG5cbiAgaWYgKCFfX3JlYWN0S2V5ZG93blVVSUQpIHtcbiAgICB0YXJnZXQuX19yZWFjdEtleWRvd25VVUlEID0gdXVpZCgpO1xuICAgIF9oYW5kbGVycy5zZXQodGFyZ2V0Ll9fcmVhY3RLZXlkb3duVVVJRCwgbmV3IE1hcChbW2tleVNldHMsIGZuXV0pKTtcbiAgfSBlbHNlIHtcbiAgICBfaGFuZGxlcnMuZ2V0KF9fcmVhY3RLZXlkb3duVVVJRCkuc2V0KGtleVNldHMsIGZuKTtcbiAgfVxufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9zdG9yZS5qc1xuLy8gbW9kdWxlIGlkID0gMTQ5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIE1ha2Ugc3VyZSBgZ2xvYmFsYCBpcyBkZWZpbmVkIGdsb2JhbGx5OlxuLy9cdC0gZWl0aGVyIGFzIHRoZSBub2RlanMgYGdsb2JhbGAsIG9yXG4vL1x0LSBhcyBhbiBhbGlhcyBmb3IgYHdpbmRvd2AgaW4gYnJvd3NlcnMsIG9yXG4vL1x0LSBmb3IgdGhlIGBzZWxmYCBjb250ZXh0IGluIHdlYiB3b3JrZXJzLlxuLy9cbi8vIE5PVEU6IHRoaXMgbW9kaWZpZXMgdGhlIFwiZ2xvYmFsXCIgZW52aXJvbm1lbnQgYnkgbWFraW5nIHN1cmUgXCJnbG9iYWxcIiBpcyBzZXQuIVxuLy9cblxubGV0IGdsb2JhbF9pZGVudGlmaWVyO1xuaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbi8vXHRjb25zb2xlLmxvZyhcIlJ1bm5pbmcgaW4gbm9kZVwiKTtcblx0Z2xvYmFsX2lkZW50aWZpZXIgPSBnbG9iYWw7XG59XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4vL1x0Y29uc29sZS5sb2coXCJSdW5uaW5nIGluIGEgd2ViIGJyb3dzZXJcIik7XG5cdHdpbmRvdy5nbG9iYWwgPSB3aW5kb3c7XG5cdGdsb2JhbF9pZGVudGlmaWVyID0gd2luZG93O1xufVxuXG5pZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcbi8vXHRjb25zb2xlLmxvZyhcIlJ1bm5pbmcgaW4gYSB3ZWIgd29ya2VyXCIpO1xuXHRzZWxmLmdsb2JhbCA9IHNlbGY7XG5cdGdsb2JhbF9pZGVudGlmaWVyID0gc2VsZjtcbn1cblxuLy8gRXhwb3J0IGZvciBjb25zdW1wdGlvbiBieSBpbXBvcnQuXG5leHBvcnQgZGVmYXVsdCBnbG9iYWxfaWRlbnRpZmllcjtcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3V0aWxzL2dsb2JhbC5qcyIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2NvZi5qc1xuLy8gbW9kdWxlIGlkID0gMTc5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIElFIDgtIGRvbid0IGVudW0gYnVnIGtleXNcbm1vZHVsZS5leHBvcnRzID0gKFxuICAnY29uc3RydWN0b3IsaGFzT3duUHJvcGVydHksaXNQcm90b3R5cGVPZixwcm9wZXJ0eUlzRW51bWVyYWJsZSx0b0xvY2FsZVN0cmluZyx0b1N0cmluZyx2YWx1ZU9mJ1xuKS5zcGxpdCgnLCcpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZW51bS1idWcta2V5cy5qc1xuLy8gbW9kdWxlIGlkID0gMTgwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkUCA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpO1xudmFyIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIHJldHVybiBkUC5mKG9iamVjdCwga2V5LCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG59IDogZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICByZXR1cm4gb2JqZWN0O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2hpZGUuanNcbi8vIG1vZHVsZSBpZCA9IDE4MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZhbHNlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fbGlicmFyeS5qc1xuLy8gbW9kdWxlIGlkID0gMTgyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDE5LjEuMi4xNCAvIDE1LjIuMy4xNCBPYmplY3Qua2V5cyhPKVxudmFyICRrZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMtaW50ZXJuYWwnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiBrZXlzKE8pIHtcbiAgcmV0dXJuICRrZXlzKE8sIGVudW1CdWdLZXlzKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy5qc1xuLy8gbW9kdWxlIGlkID0gMTgzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMuZiA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LXBpZS5qc1xuLy8gbW9kdWxlIGlkID0gMTg0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJpdG1hcCwgdmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZTogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZTogdmFsdWVcbiAgfTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19wcm9wZXJ0eS1kZXNjLmpzXG4vLyBtb2R1bGUgaWQgPSAxODVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgU1JDID0gcmVxdWlyZSgnLi9fdWlkJykoJ3NyYycpO1xudmFyIFRPX1NUUklORyA9ICd0b1N0cmluZyc7XG52YXIgJHRvU3RyaW5nID0gRnVuY3Rpb25bVE9fU1RSSU5HXTtcbnZhciBUUEwgPSAoJycgKyAkdG9TdHJpbmcpLnNwbGl0KFRPX1NUUklORyk7XG5cbnJlcXVpcmUoJy4vX2NvcmUnKS5pbnNwZWN0U291cmNlID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiAkdG9TdHJpbmcuY2FsbChpdCk7XG59O1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTywga2V5LCB2YWwsIHNhZmUpIHtcbiAgdmFyIGlzRnVuY3Rpb24gPSB0eXBlb2YgdmFsID09ICdmdW5jdGlvbic7XG4gIGlmIChpc0Z1bmN0aW9uKSBoYXModmFsLCAnbmFtZScpIHx8IGhpZGUodmFsLCAnbmFtZScsIGtleSk7XG4gIGlmIChPW2tleV0gPT09IHZhbCkgcmV0dXJuO1xuICBpZiAoaXNGdW5jdGlvbikgaGFzKHZhbCwgU1JDKSB8fCBoaWRlKHZhbCwgU1JDLCBPW2tleV0gPyAnJyArIE9ba2V5XSA6IFRQTC5qb2luKFN0cmluZyhrZXkpKSk7XG4gIGlmIChPID09PSBnbG9iYWwpIHtcbiAgICBPW2tleV0gPSB2YWw7XG4gIH0gZWxzZSBpZiAoIXNhZmUpIHtcbiAgICBkZWxldGUgT1trZXldO1xuICAgIGhpZGUoTywga2V5LCB2YWwpO1xuICB9IGVsc2UgaWYgKE9ba2V5XSkge1xuICAgIE9ba2V5XSA9IHZhbDtcbiAgfSBlbHNlIHtcbiAgICBoaWRlKE8sIGtleSwgdmFsKTtcbiAgfVxuLy8gYWRkIGZha2UgRnVuY3Rpb24jdG9TdHJpbmcgZm9yIGNvcnJlY3Qgd29yayB3cmFwcGVkIG1ldGhvZHMgLyBjb25zdHJ1Y3RvcnMgd2l0aCBtZXRob2RzIGxpa2UgTG9EYXNoIGlzTmF0aXZlXG59KShGdW5jdGlvbi5wcm90b3R5cGUsIFRPX1NUUklORywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nICYmIHRoaXNbU1JDXSB8fCAkdG9TdHJpbmcuY2FsbCh0aGlzKTtcbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanNcbi8vIG1vZHVsZSBpZCA9IDE4NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBTSEFSRUQgPSAnX19jb3JlLWpzX3NoYXJlZF9fJztcbnZhciBzdG9yZSA9IGdsb2JhbFtTSEFSRURdIHx8IChnbG9iYWxbU0hBUkVEXSA9IHt9KTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIHN0b3JlW2tleV0gfHwgKHN0b3JlW2tleV0gPSB2YWx1ZSAhPT0gdW5kZWZpbmVkID8gdmFsdWUgOiB7fSk7XG59KSgndmVyc2lvbnMnLCBbXSkucHVzaCh7XG4gIHZlcnNpb246IGNvcmUudmVyc2lvbixcbiAgbW9kZTogcmVxdWlyZSgnLi9fbGlicmFyeScpID8gJ3B1cmUnIDogJ2dsb2JhbCcsXG4gIGNvcHlyaWdodDogJ8KpIDIwMTggRGVuaXMgUHVzaGthcmV2ICh6bG9pcm9jay5ydSknXG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qc1xuLy8gbW9kdWxlIGlkID0gMTg3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDcuMS4xIFRvUHJpbWl0aXZlKGlucHV0IFssIFByZWZlcnJlZFR5cGVdKVxudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG4vLyBpbnN0ZWFkIG9mIHRoZSBFUzYgc3BlYyB2ZXJzaW9uLCB3ZSBkaWRuJ3QgaW1wbGVtZW50IEBAdG9QcmltaXRpdmUgY2FzZVxuLy8gYW5kIHRoZSBzZWNvbmQgYXJndW1lbnQgLSBmbGFnIC0gcHJlZmVycmVkIHR5cGUgaXMgYSBzdHJpbmdcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBTKSB7XG4gIGlmICghaXNPYmplY3QoaXQpKSByZXR1cm4gaXQ7XG4gIHZhciBmbiwgdmFsO1xuICBpZiAoUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKHR5cGVvZiAoZm4gPSBpdC52YWx1ZU9mKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIGlmICghUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gcHJpbWl0aXZlIHZhbHVlXCIpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qc1xuLy8gbW9kdWxlIGlkID0gMTg4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGRvY3VtZW50ID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuZG9jdW1lbnQ7XG4vLyB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0JyBpbiBvbGQgSUVcbnZhciBpcyA9IGlzT2JqZWN0KGRvY3VtZW50KSAmJiBpc09iamVjdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpcyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZG9tLWNyZWF0ZS5qc1xuLy8gbW9kdWxlIGlkID0gMjc5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgJiYgIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnZGl2JyksICdhJywgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH0gfSkuYSAhPSA3O1xufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qc1xuLy8gbW9kdWxlIGlkID0gMjgwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDE5LjEuMi43IC8gMTUuMi4zLjQgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbnZhciAka2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzLWludGVybmFsJyk7XG52YXIgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKS5jb25jYXQoJ2xlbmd0aCcsICdwcm90b3R5cGUnKTtcblxuZXhwb3J0cy5mID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhPKSB7XG4gIHJldHVybiAka2V5cyhPLCBoaWRkZW5LZXlzKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wbi5qc1xuLy8gbW9kdWxlIGlkID0gMjgxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wcy5qc1xuLy8gbW9kdWxlIGlkID0gMjgyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgYXJyYXlJbmRleE9mID0gcmVxdWlyZSgnLi9fYXJyYXktaW5jbHVkZXMnKShmYWxzZSk7XG52YXIgSUVfUFJPVE8gPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZXMpIHtcbiAgdmFyIE8gPSB0b0lPYmplY3Qob2JqZWN0KTtcbiAgdmFyIGkgPSAwO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBrZXk7XG4gIGZvciAoa2V5IGluIE8pIGlmIChrZXkgIT0gSUVfUFJPVE8pIGhhcyhPLCBrZXkpICYmIHJlc3VsdC5wdXNoKGtleSk7XG4gIC8vIERvbid0IGVudW0gYnVnICYgaGlkZGVuIGtleXNcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIGlmIChoYXMoTywga2V5ID0gbmFtZXNbaSsrXSkpIHtcbiAgICB+YXJyYXlJbmRleE9mKHJlc3VsdCwga2V5KSB8fCByZXN1bHQucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWtleXMtaW50ZXJuYWwuanNcbi8vIG1vZHVsZSBpZCA9IDI4M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgc2hhcmVkID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ2tleXMnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuL191aWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gc2hhcmVkW2tleV0gfHwgKHNoYXJlZFtrZXldID0gdWlkKGtleSkpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC1rZXkuanNcbi8vIG1vZHVsZSBpZCA9IDI4NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsID0gTWF0aC5jZWlsO1xudmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3RvLWludGVnZXIuanNcbi8vIG1vZHVsZSBpZCA9IDI4NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzLmYgPSByZXF1aXJlKCcuL193a3MnKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3drcy1leHQuanNcbi8vIG1vZHVsZSBpZCA9IDI4NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuXHRNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xuLy8gY3NzIGJhc2UgY29kZSwgaW5qZWN0ZWQgYnkgdGhlIGNzcy1sb2FkZXJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXNlU291cmNlTWFwKSB7XG5cdHZhciBsaXN0ID0gW107XG5cblx0Ly8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXHRsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHR2YXIgY29udGVudCA9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKTtcblx0XHRcdGlmKGl0ZW1bMl0pIHtcblx0XHRcdFx0cmV0dXJuIFwiQG1lZGlhIFwiICsgaXRlbVsyXSArIFwie1wiICsgY29udGVudCArIFwifVwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGNvbnRlbnQ7XG5cdFx0XHR9XG5cdFx0fSkuam9pbihcIlwiKTtcblx0fTtcblxuXHQvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXHRsaXN0LmkgPSBmdW5jdGlvbihtb2R1bGVzLCBtZWRpYVF1ZXJ5KSB7XG5cdFx0aWYodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpXG5cdFx0XHRtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCBcIlwiXV07XG5cdFx0dmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGlkID0gdGhpc1tpXVswXTtcblx0XHRcdGlmKHR5cGVvZiBpZCA9PT0gXCJudW1iZXJcIilcblx0XHRcdFx0YWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuXHRcdH1cblx0XHRmb3IoaSA9IDA7IGkgPCBtb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IG1vZHVsZXNbaV07XG5cdFx0XHQvLyBza2lwIGFscmVhZHkgaW1wb3J0ZWQgbW9kdWxlXG5cdFx0XHQvLyB0aGlzIGltcGxlbWVudGF0aW9uIGlzIG5vdCAxMDAlIHBlcmZlY3QgZm9yIHdlaXJkIG1lZGlhIHF1ZXJ5IGNvbWJpbmF0aW9uc1xuXHRcdFx0Ly8gIHdoZW4gYSBtb2R1bGUgaXMgaW1wb3J0ZWQgbXVsdGlwbGUgdGltZXMgd2l0aCBkaWZmZXJlbnQgbWVkaWEgcXVlcmllcy5cblx0XHRcdC8vICBJIGhvcGUgdGhpcyB3aWxsIG5ldmVyIG9jY3VyIChIZXkgdGhpcyB3YXkgd2UgaGF2ZSBzbWFsbGVyIGJ1bmRsZXMpXG5cdFx0XHRpZih0eXBlb2YgaXRlbVswXSAhPT0gXCJudW1iZXJcIiB8fCAhYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuXHRcdFx0XHRpZihtZWRpYVF1ZXJ5ICYmICFpdGVtWzJdKSB7XG5cdFx0XHRcdFx0aXRlbVsyXSA9IG1lZGlhUXVlcnk7XG5cdFx0XHRcdH0gZWxzZSBpZihtZWRpYVF1ZXJ5KSB7XG5cdFx0XHRcdFx0aXRlbVsyXSA9IFwiKFwiICsgaXRlbVsyXSArIFwiKSBhbmQgKFwiICsgbWVkaWFRdWVyeSArIFwiKVwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxpc3QucHVzaChpdGVtKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdHJldHVybiBsaXN0O1xufTtcblxuZnVuY3Rpb24gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtLCB1c2VTb3VyY2VNYXApIHtcblx0dmFyIGNvbnRlbnQgPSBpdGVtWzFdIHx8ICcnO1xuXHR2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG5cdGlmICghY3NzTWFwcGluZykge1xuXHRcdHJldHVybiBjb250ZW50O1xuXHR9XG5cblx0aWYgKHVzZVNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHZhciBzb3VyY2VNYXBwaW5nID0gdG9Db21tZW50KGNzc01hcHBpbmcpO1xuXHRcdHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG5cdFx0XHRyZXR1cm4gJy8qIyBzb3VyY2VVUkw9JyArIGNzc01hcHBpbmcuc291cmNlUm9vdCArIHNvdXJjZSArICcgKi8nXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKCdcXG4nKTtcblx0fVxuXG5cdHJldHVybiBbY29udGVudF0uam9pbignXFxuJyk7XG59XG5cbi8vIEFkYXB0ZWQgZnJvbSBjb252ZXJ0LXNvdXJjZS1tYXAgKE1JVClcbmZ1bmN0aW9uIHRvQ29tbWVudChzb3VyY2VNYXApIHtcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpO1xuXHR2YXIgZGF0YSA9ICdzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCwnICsgYmFzZTY0O1xuXG5cdHJldHVybiAnLyojICcgKyBkYXRhICsgJyAqLyc7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcbi8vIG1vZHVsZSBpZCA9IDI4N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBTcGVsbCBcInBhcnNlclwiIGNsYXNzLlxuLy9cblxuLy8gVE9ETzogZGVwZW5kZW5jeS1pbmplY3QgdG9rZW5pemVyP1xuaW1wb3J0IFRva2VuaXplciBmcm9tIFwiLi9Ub2tlbml6ZXIuanNcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuL1J1bGUuanNcIjtcbmltcG9ydCBwYXJzZVJ1bGUgZnJvbSBcIi4vUnVsZVN5bnRheC5qc1wiO1xuaW1wb3J0IHsgY2xvbmVDbGFzcyB9IGZyb20gXCIuL3V0aWxzL2NsYXNzLmpzXCI7XG5cbi8vIEdSUlIuLi4gd2lsbCBTT01FT05FIG9uIHRoZSBub2RlIHRlYW0gcGxlYXNlIGltcGxlbWVudCBjb25zb2xlLmdyb3VwID8/P1xuaWYgKCFjb25zb2xlLmdyb3VwKSBjb25zb2xlLmdyb3VwID0gY29uc29sZS5sb2c7XG5pZiAoIWNvbnNvbGUuZ3JvdXBFbmQpIGNvbnNvbGUuZ3JvdXBFbmQgPSBjb25zb2xlLmxvZztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VyIHtcblx0Ly8gU2V0IHRvIGB0cnVlYCB0byBvdXRwdXQgZGVidWcgaW5mbyB3aGlsZSBhZGRpbmcgcnVsZXNcblx0c3RhdGljIERFQlVHID0gZmFsc2U7XG5cblx0Ly8gU2hvdWxkIHdlIHdhcm4gYWJvdXQgYW5vbWFsb3VzIGNvbmRpdGlvbnM/XG5cdHN0YXRpYyBXQVJOID0gZmFsc2U7XG5cblx0Ly8gU2V0IHRvIGB0cnVlYCB0byBvdXRwdXQgdGltaW5nIGluZm8uXG5cdHN0YXRpYyBUSU1FID0gZmFsc2U7XG5cblx0Ly8gQ29uc3RydWN0b3IuXG5cdGNvbnN0cnVjdG9yKHByb3BlcnRpZXMpIHtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIHByb3BlcnRpZXMpO1xuXHR9XG5cbi8vXG4vLyMjIyBQYXJzaW5nXG4vL1xuXHQvLyBQYXJzZSBgcnVsZU5hbWVgIHJ1bGUgYXQgaGVhZCBvZiBgdGV4dGAuXG5cdC8vIElmIHlvdSBwYXNzIG9ubHkgb25lIGFyZ3VtZW50LCB3ZSdsbCBhc3N1bWUgdGhhdCdzIGB0ZXh0YCBhbmQgeW91IHdhbnQgdG8gbWF0Y2ggYHN0YXRlbWVudHNgLlxuXHQvLyBIYW5kbGVzIG9wdGlvbmFsIGFuZCByZXBlYXRpbmcgcnVsZXMgYXMgd2VsbCBhcyBlYXRpbmcgd2hpdGVzcGFjZS5cblx0Ly8gUmV0dXJucyByZXN1bHQgb2YgcGFyc2UuXG4vL1RFU1RNRVxuXHRwYXJzZShydWxlTmFtZSwgdGV4dCkge1xuXHRcdC8vIElmIG9ubHkgb25lIGFyZ3VtZW50LCBhc3N1bWUgdGhhdCdzIHRoZSB0ZXh0IGFuZCBwYXJzZSBgc3RhdGVtZW50c2Bcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0dGV4dCA9IHJ1bGVOYW1lO1xuXHRcdFx0cnVsZU5hbWUgPSBcInN0YXRlbWVudHNcIjtcblx0XHR9XG5cblx0XHQvLyBDb252ZXJ0IHRvIHRva2Vucy5cblx0XHRpZiAoUGFyc2VyLlRJTUUpIGNvbnNvbGUudGltZShcInRva2VuaXplXCIpO1xuXHRcdGxldCB0b2tlbnMgPSBUb2tlbml6ZXIudG9rZW5pemUodGV4dCk7XG5cdFx0Ly8gZWF0IG5vbi1pbmRlbnQgd2hpdGVzcGFjZSAoc2luY2Ugd2UgaWdub3JlIGl0KVxuXHRcdHRva2VucyA9IHRva2Vucy5maWx0ZXIodG9rZW4gPT4gIVRva2VuaXplci5pc05vcm1hbFdoaXRlc3BhY2UodG9rZW4pKTtcblx0XHRpZiAoUGFyc2VyLlRJTUUpIGNvbnNvbGUudGltZUVuZChcInRva2VuaXplXCIpO1xuXG5cdFx0Ly8gQmFpbCBpZiB3ZSBkaWRuJ3QgZ2V0IGFueSB0b2tlbnMgYmFjay5cblx0XHRpZiAoIXRva2VucyB8fCB0b2tlbnMubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0aWYgKFBhcnNlci5USU1FKSBjb25zb2xlLnRpbWUoXCJwYXJzZVwiKTtcblx0XHQvLyBJZiB3ZSdyZSBub3QgcGFyc2luZyBgc3RhdGVtZW50c2AsIGVhdCB3aGl0ZXNwYWNlIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmUuXG5cdFx0aWYgKHJ1bGVOYW1lICE9PSBcInN0YXRlbWVudHNcIikge1xuXHRcdFx0dG9rZW5zID0gVG9rZW5pemVyLnJlbW92ZUxlYWRpbmdXaGl0ZXNwYWNlKHRva2Vucyk7XG5cdFx0fVxuXG5cdFx0Ly8gUGFyc2UgdGhlIHJ1bGUgb3IgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIHJ1bGUgbm90IGZvdW5kLlxuXHRcdGxldCByZXN1bHQgPSB0aGlzLnBhcnNlTmFtZWRSdWxlKHJ1bGVOYW1lLCB0b2tlbnMsIDAsIHRva2Vucy5sZW5ndGgsIHVuZGVmaW5lZCwgXCJwYXJzZXIucGFyc2UoKVwiKTtcblx0XHRpZiAoUGFyc2VyLlRJTUUpIGNvbnNvbGUudGltZUVuZChcInBhcnNlXCIpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXG5cblx0Ly8gUGFyc2UgYHRleHRgIGFuZCByZXR1cm4gdGhlIHJlc3VsdGluZyBzb3VyY2UgY29kZS5cblx0Ly9cdC0gaWYgb25lIHN0cmluZyBhcmd1bWVudCwgY29tcGlsZXMgYXMgXCJzdGF0ZW1lbnRzXCJcblx0Ly8gVGhyb3dzIGlmIG5vdCBwYXJzZWFibGUuXG4vL1RFU1RNRVxuXHRjb21waWxlKHJ1bGVOYW1lLCB0ZXh0KSB7XG5cdFx0Ly8gSWYgb25seSBvbmUgYXJndW1lbnQsIGFzc3VtZSB0aGF0J3MgdGhlIHRleHQgYW5kIHBhcnNlIGBzdGF0ZW1lbnRzYFxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHR0ZXh0ID0gcnVsZU5hbWU7XG5cdFx0XHRydWxlTmFtZSA9IFwic3RhdGVtZW50c1wiO1xuXHRcdH1cblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5wYXJzZShydWxlTmFtZSwgdGV4dCk7XG5cdFx0aWYgKCFyZXN1bHQpIHRocm93IG5ldyBTeW50YXhFcnJvcihgcGFyc2VyLnBhcnNlKCcke3J1bGVOYW1lfScsICcke3RleHR9Jyk6IGNhbid0IHBhcnNlIHRoaXNgKTtcblx0XHRyZXR1cm4gcmVzdWx0LnRvU291cmNlKHRoaXMpO1xuXHR9XG5cblxuXHQvLyBQYXJzZSBhIG5hbWVkIHJ1bGUgKGRlZmluZWQgaW4gdGhpcyBwYXJzZXIgb3IgaW4gYW55IG9mIG91ciBgaW1wb3J0c2ApLCByZXR1cm5pbmcgdGhlIFwiYmVzdFwiIG1hdGNoLlxuXHQvLyBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIG5vIG1hdGNoLlxuXHQvLyBUaHJvd3MgaWYgcnVsZSBpcyBub3QgaW1wbGVtZW50ZWQuXG5cdHBhcnNlTmFtZWRSdWxlKHJ1bGVOYW1lLCB0b2tlbnMsIHN0YXJ0LCBlbmQsIHN0YWNrLCBjYWxsaW5nQ29udGV4dCA9IFwicGFyc2VOYW1lZFJ1bGVcIikge1xuICAgIGNvbnN0IHJ1bGUgPSB0aGlzLnJ1bGVzW3J1bGVOYW1lXTtcblx0XHRpZiAoIXJ1bGUpIHRocm93IG5ldyBTeW50YXhFcnJvcihgJHtjYWxsaW5nQ29udGV4dH06IHJ1bGUgJyR7cnVsZU5hbWV9JyBub3QgZm91bmRgKTtcbiAgICByZXR1cm4gcnVsZS5wYXJzZSh0aGlzLCB0b2tlbnMsIHN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0fVxuXG5cdC8vIFRlc3Qgd2hldGhlciBhIHJ1bGUgKHdoaWNoIG1heSBiZSBzcGVjaWZpZWQgYnkgbmFtZSkgTUlHSFQgYmUgZm91bmQgaW4gaGVhZCBvZiBzdHJlYW0uXG5cdC8vIFJldHVybnM6XG5cdC8vXHQtIGB0cnVlYCBpZiB0aGUgcnVsZSBNSUdIVCBiZSBtYXRjaGVkLlxuXHQvL1x0LSBgZmFsc2VgIGlmIHRoZXJlIGlzIE5PIFdBWSB0aGUgcnVsZSBjYW4gYmUgbWF0Y2hlZC5cblx0Ly9cdC0gYHVuZGVmaW5lZGAgaWYgbm90IGRldGVybWluc3RpYyAoZWc6IG5vIHdheSB0byB0ZWxsIHF1aWNrbHkpLlxuXHR0ZXN0KHJ1bGUsIHRva2Vucywgc3RhcnQsIGVuZCkge1xuXHQgIGlmICh0eXBlb2YgcnVsZSA9PT0gXCJzdHJpbmdcIikge1xuXHQgICAgcnVsZSA9IHRoaXMucnVsZXNbcnVsZV07XG5cdCAgICBpZiAoIXJ1bGUpIHJldHVybiB1bmRlZmluZWQ7ICAgIC8vIFRPRE86IHRocm93P1xuXHQgIH1cblx0ICByZXR1cm4gcnVsZS50ZXN0KHRoaXMsIHRva2Vucywgc3RhcnQsIGVuZCk7XG5cdH1cblxuXG4vL1xuLy8gIyMjIFx0SW1wb3J0c1xuLy9cdFx0UGFyc2VycyBjYW4gZGVwZW5kIG9uIG90aGVyIHBhcnNlcnMgZm9yIGFkZGl0aW9uYWwgYHJ1bGVzYC5cbi8vXHRcdEltcG9ydHMgYXJlIGxhenktYm91bmQgaW50byBgcGFyc2VyLnJ1bGVzYCBhcyBuZWNlc3NhcnkuXG4vLyAgICBXZSBhc3N1bWUgdGhlIHRvcC1sZXZlbCBwYXJzZXIgZm9yIGEgbGFuZ3VhZ2Ugd2lsbCBpbmNsdWRlIGFsbCBuZWNlc3NhcnkgaW1wb3J0cyBhdXRvbWF0aWNhbGx5LlxuLy9cblxuXHQvLyBBZGQgb25lIG9yIG1vcmUgbmFtZWQgaW1wb3J0cyB0byB0aGlzIHBhcnNlci5cblx0Ly8gSW1wb3J0cyBpbmNyZWFzZSBpbiBwcmlvcml0eSB0aGUgbGF0ZXIgdGhleSBhcmUgaW4gdGhlIGxpc3QuXG4gIGltcG9ydHMgPSBbXTtcblx0aW1wb3J0KC4uLmltcG9ydHMpIHtcblx0XHQvLyBSRVZFUlNFIHRoZSBsaXN0IG9mIGltcG9ydHMsIHNvIHRoZSBtb3N0IGdlbmVyYWwgb25lIGlzIExBU1Rcblx0XHQvLyBUaHVzIG1vcmUgc3BlY2lmaWMgaW1wb3J0cyB3aWxsIGJlIEVBUkxJRVIgaW4gdGhlIGBpbXBvcnRzYCBsaXN0LlxuXG5cdFx0Ly8gQ3JlYXRlIG5ldyBhcnJheSBvZiBpbXBvcnRzIGFuZCBhZGQgaW1wb3J0IG5hbWVzIHBhc3NlZCBpbi5cblx0XHR0aGlzLmltcG9ydHMgPSBpbXBvcnRzLnJldmVyc2UoKS5jb25jYXQodGhpcy5pbXBvcnRzKTtcblxuXHRcdC8vIGNsZWFyIGNvbmNhdGVuYXRlZCBsaXN0IG9mIHJ1bGVzIHNvIHdlJ2xsIHJlY2FjdWxhdGUgaW4gYHBhcnNlci5ydWxlc2Bcblx0XHRkZWxldGUgdGhpcy5fX3J1bGVzO1xuXHR9XG5cbi8vXG4vLyAjIyMgUnVsZXNcbi8vICAgIExpc3Qgb2YgYWxsIGtub3duIHJ1bGVzIGZvciB0aGlzIHBhcnNlci5cbi8vICAgIFlvdSBjYW4gYWNjZXNzIG5hbWVkIHJ1bGVzIGFzIGBwYXJzZXIucnVsZXNbXCJydWxlTmFtZVwiXWBcbi8vXG5cdC8vIFN0YXJ0IHdpdGggYW4gZW1wdHkgbWFwIG9mIHJ1bGVzLlxuXHRfcnVsZXMgPSB7fTtcblxuXHQvLyBSZXR1cm4gbWFwIG9mIGFsbCBrbm93biBydWxlcyBieSBydWxlIG5hbWUsIGluY2x1ZGluZyBydWxlcyBkZWZpbmVkIGluIG91ciBpbXBvcnRzLlxuXHQvLyBOT1RFOiBXZSBtZW1vaXplIHRoaXMsIHNvIG1ha2Ugc3VyZSB0byBjbGVhciBgX19ydWxlc2AgaWYgeW91J3JlIG1hbmlwdWxhdGluZyBydWxlcyBvciBpbXBvcnRzIVxuXHRnZXQgcnVsZXMoKSB7XG5cdFx0aWYgKCF0aGlzLl9fcnVsZXMpIHtcblx0XHRcdGNvbnN0IG91dHB1dCA9IHRoaXMuX19ydWxlcyA9IHt9O1xuXHRcdFx0Ly8gR2V0IGFsbCBpbXBvcnRlZCBwYXJzZXJzLCB3aXRoIHVzIGxhc3Rcblx0XHRcdGNvbnN0IGltcG9ydHMgPSBbdGhpc10uY29uY2F0KHRoaXMuaW1wb3J0cy5tYXAoUGFyc2VyLmZvck5hbWUpKTtcblxuXHRcdFx0Ly8gRm9yIGVhY2ggcGFyc2VyXG5cdFx0XHRpbXBvcnRzLmZvckVhY2gocGFyc2VyID0+IHtcblx0XHRcdFx0Zm9yIChjb25zdCBydWxlTmFtZSBpbiBwYXJzZXIuX3J1bGVzKSB7XG5cdFx0XHRcdCAgdGhpcy5fbWVyZ2VSdWxlKG91dHB1dCwgcnVsZU5hbWUsIHBhcnNlci5fcnVsZXNbcnVsZU5hbWVdKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9fcnVsZXM7XG5cdH1cblxuICAvLyBNZXJnZSBgcnVsZWAgaW50byBgbWFwYCBvZiBydWxlcyBieSBgcnVsZU5hbWVgLlxuICAvLyBJZiB3ZSBhbHJlYWR5IGhhdmUgYSBydWxlIHdpdGggdGhhdCBuYW1lLCB3ZSdsbCBhZGQgaXQgYXMgYW4gYWx0ZXJuYXRpdmUuXG4vL1RFU1RNRVxuICBfbWVyZ2VSdWxlKG1hcCwgcnVsZU5hbWUsIHJ1bGUpIHtcbiAgICBsZXQgZXhpc3RpbmcgPSBtYXBbcnVsZU5hbWVdO1xuICAgIGlmICghZXhpc3RpbmcpIHtcbiAgICAgIG1hcFtydWxlTmFtZV0gPSBydWxlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghKGV4aXN0aW5nIGluc3RhbmNlb2YgUnVsZS5BbHRlcm5hdGl2ZXMpIHx8IChleGlzdGluZy5ncm91cCAhPT0gcnVsZU5hbWUpKSB7XG4gICAgICBjb25zdCBhbHRDb25zdHJ1Y3RvciA9IGNsb25lQ2xhc3MoUnVsZS5BbHRlcm5hdGl2ZXMsIHJ1bGVOYW1lKTtcbiAgICAgIGV4aXN0aW5nID0gbWFwW3J1bGVOYW1lXSA9IG5ldyBhbHRDb25zdHJ1Y3Rvcih7XG4gICAgICAgIGdyb3VwOiBydWxlTmFtZSxcbiAgICAgICAgcnVsZXM6IFsgZXhpc3RpbmcgXVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHJ1bGUgaW5zdGFuY2VvZiBSdWxlLkFsdGVybmF0aXZlcyAmJiAocnVsZS5ncm91cCA9PT0gcnVsZU5hbWUpKSB7XG4gICAgICBleGlzdGluZy5hZGRSdWxlKC4uLnJ1bGUucnVsZXMpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGV4aXN0aW5nLmFkZFJ1bGUocnVsZSk7XG4gICAgfVxuICB9XG5cblx0Ly8gQWRkIGEgYHJ1bGVgIHRvIG91ciBsaXN0IG9mIHJ1bGVzIVxuXHQvLyBDb252ZXJ0cyB0byBgYWx0ZXJuYXRpdmVzYCBvbiByZS1kZWZpbmluZyB0aGUgc2FtZSBydWxlLlxuXHRhZGRSdWxlKHJ1bGVOYW1lLCBydWxlKSB7XG5cdFx0Ly8gQ2xlYXIgbWVtb2l6ZWQgYF9fcnVsZXNgIHNvIHdlJ2xsIHJlY2FsY3VsYXRlIGBwYXJzZXIucnVsZXNgIGFzIG5lY2Vzc2FyeVxuXHRcdGRlbGV0ZSB0aGlzLl9fcnVsZXM7XG5cblx0XHQvLyBJZiBwYXNzZWQgYSBmdW5jdGlvbiwgY3JlYXRlIGFuIGluc3RhbmNlIGZvciB0aGUgYWN0dWFsIHJ1bGUuXG5cdFx0Ly8gVGhpcyBpcyBjb21tb25seSBkb25lIHNvIEpTIHdpbGwgZ2l2ZSB1cyBtZWFuaW5nZnVsIGNsYXNzIG5hbWVzIGluIGRlYnVnIG91dHB1dC5cblx0XHRpZiAodHlwZW9mIHJ1bGUgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0cnVsZSA9IG5ldyBydWxlKCk7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgd2UgZ290IGFuIGFycmF5IG9mIGBydWxlTmFtZWBzLCByZWN1cnNpdmVseSBhZGQgdW5kZXIgZWFjaCBuYW1lIHdpdGggdGhlIHNhbWUgYHJ1bGVgLlxuXHRcdGlmIChBcnJheS5pc0FycmF5KHJ1bGVOYW1lKSkge1xuXHRcdFx0cnVsZU5hbWUuZm9yRWFjaChydWxlTmFtZSA9PiB0aGlzLmFkZFJ1bGUocnVsZU5hbWUsIHJ1bGUpICk7XG5cdFx0XHRyZXR1cm4gcnVsZTtcblx0XHR9XG5cblx0XHQvLyBBZGQgdG8gb3VyIGxpc3Qgb2YgX3J1bGVzXG5cdFx0dGhpcy5fbWVyZ2VSdWxlKHRoaXMuX3J1bGVzLCBydWxlTmFtZSwgcnVsZSk7XG5cdFx0cmV0dXJuIHJ1bGU7XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIGNvbmNhdGVuYXRlZCBibGFja2xpc3QgZm9yIGEgZ2l2ZW4gbmFtZWQgcnVsZS5cblx0Z2V0QmxhY2tsaXN0KHJ1bGVOYW1lKSB7XG5cdCAgY29uc3QgcnVsZSA9IHRoaXMucnVsZXNbcnVsZU5hbWVdO1xuXHQgIGNvbnN0IHJ1bGVzID0gcnVsZSBpbnN0YW5jZW9mIFJ1bGUuQWx0ZXJuYXRpdmVzXG4gICAgICAgICAgPyBydWxlLnJ1bGVzXG4gICAgICAgICAgOiBbIHJ1bGUgXTtcblx0XHRyZXR1cm4gcnVsZXMucmVkdWNlKGZ1bmN0aW9uIChibGFja2xpc3QsIHJ1bGUpIHtcblx0XHRcdHJldHVybiBPYmplY3QuYXNzaWduKGJsYWNrbGlzdCwgcnVsZS5ibGFja2xpc3QpO1xuXHRcdH0sIHt9KTtcblx0fVxuXG4gIC8vIERlZmluZSBtdWx0aXBsZSBydWxlcyBhdCBvbmNlIHVzaW5nIHJ1bGVTeW50YXguXG4gIC8vIFNlZSBgUnVsZVN5bnRheC5qczo6ZGVmaW5lUnVsZSgpYFxuICBkZWZpbmVSdWxlcygpIHtcbiAgICBmb3IgKGNvbnN0IHJ1bGUgb2YgYXJndW1lbnRzKSB7XG4gICAgICB0aGlzLmRlZmluZVJ1bGUocnVsZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gRGVmaW5lIGEgcnVsZSB1c2luZyAocnVsZSlgc3ludGF4YCBvciBgcGF0dGVybnNgIHRvIGNyZWF0ZSB0aGUgcnVsZSBpbnN0YW5jZXMuXG4gIC8vICBgbmFtZWAgKGlkZW50aWZpZXIsIHJlcXVpcmVkKSAgQmFzZSBuYW1lIG9mIHRoZSBydWxlLlxuICAvLyAgYGFsaWFzYCAoc3RyaW5nIG9yIFtzdHJpbmddLCBvcHRpbmFsKSBPdGhlciBuYW1lcyB0byBkZWZpbmUgcnVsZSB1bmRlci5cbiAgLy8gIGBjYW5vbmljYWxgIChzdHJpbmcsIG9wdGlvbmFsKSBDYW5vbmljYWwgbmFtZSBmb3IgdGhlIHJ1bGUsIGF2YWlsYWJsZSBvbiBgUnVsZWAgZm9yIGRlYnVnZ2luZy5cbiAgLy8gIGBjb25zdHJ1Y3RvcmAgKGNsYXNzLCByZXF1aXJlZCkgQ2xhc3Mgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIGluc3RhbnRpYXRlIHRoZSBydWxlLlxuICAvLyAgYHN5bnRheGAgKHN0cmluZywgcmVxdWlyZWQpIFJ1bGVTeW50YXggc3RyaW5nIGZvciB0aGlzIHJ1bGUuXG4gIC8vICBgcGF0dGVybmAgKFJlZ0V4cCwgb3B0aW9uYWwpIFJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgYFBhdHRlcm5gIHJ1bGVzXG4gIC8vICBgcHJlY2VkZW5jZWAgKG51bWJlciwgb3B0aW9uYWwpIFByZWNlZGVuY2UgbnVtYmVyIGZvciB0aGUgcnVsZSAoY3VycmVudGx5IGRvZXNuJ3QgZG8gYW55dGhpbmcpXG4gIC8vICBgYmxhY2tsaXN0YCAoW3N0cmluZ10sIG9wdGlvbmFsKSBBcnJheSBvZiBzdHJpbmdzIGFzIGJsYWNrbGlzdCBmb3IgcGF0dGVybiBydWxlcy5cbiAgLy8gIGBsZWZ0UmVjdXJzaXZlJyAoYm9vbGVhbiwgb3B0aW9uYWwpIFNldCB0byBgdHJ1ZWAgaWYgdGhlIHJ1bGUgaXMgbGVmdC1yZWN1cnNpdmUsXG4gIC8vICAgIGkuZS4gaXQgY2FsbHMgaXRzZWxmIGFzIGEgc3VicnVsZSBiZWZvcmUgbWF0Y2hpbmcgYW55IGxpdGVyYWwgdG9rZW5zXG4gIC8vICBgdGVzdFJ1bGVgIChSdWxlIG9yIHN0cmluZywgb3B0aW9uYWwpIFJ1bGUgb3IgcnVsZSBuYW1lIHRvIHVzZSBhcyBhIHRlc3QgcnVsZVxuICAvLyAgICBzcGVjaWZ5aW5nIHRoaXMgY2FuIGxldCB1cyBqdW1wIG91dCBxdWlja2x5IGlmIHRoZXJlIGlzIG5vIHBvc3NpYmxlIG1hdGNoXG4gIC8vXG4gIC8vIE5vdGUgdGhhdCB3ZSBtdW5nZSB0aGUgYGNvbnN0cnVjdG9yYCBwYXNzZWQgaW4gZm9yIGVmZmljaWVuY3kgd2hpbGUgcGFyc2luZy5cbiAgZGVmaW5lUnVsZSh7XG4gICAgbmFtZSwgY29uc3RydWN0b3IsIGFsaWFzID0gW10sIGNhbm9uaWNhbCxcbiAgICBzeW50YXgsIGJsYWNrbGlzdCxcbiAgICAuLi5vdGhlclByb3BzXG4gICAgLy8gcGF0dGVybiwgcHJlY2VkZW5jZSwgLCBsZWZ0UmVjdXJzaXZlLCB0ZXN0UnVsZVxuICB9KSB7XG4gICAgY29uc3QgbmFtZXMgPSBbbmFtZV0uY29uY2F0KGFsaWFzKTtcblxuICAgIC8vIHRocm93IGlmIHdlJ3JlIHJlLXVzaW5nIGEgY29uc3RydWN0b3JcbiAgICBpZiAoY29uc3RydWN0b3IucHJvdG90eXBlLnJ1bGVOYW1lcykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgcGFyc2VyLmRlZmluZSgpOiBBdHRlbXB0aW5nIHRvIHJlLXVzZSBjb25zdHJ1Y3RvciBmb3IgcnVsZSAnJHtydWxlTmFtZX0nYCk7XG4gICAgfVxuXG4gICAgLy8gU2V0IHByb3BlcnRpZXMgb24gcHJvdG90eXBlLmNvbnN0cnVjdG9yXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLnByb3RvdHlwZSwgXCJydWxlTmFtZXNcIiwgeyB2YWx1ZTogbmFtZXMgfSk7XG4gICAgaWYgKGNhbm9uaWNhbCkgUnVsZVtjYW5vbmljYWxdID0gY29uc3RydWN0b3I7XG4gICAgaWYgKGJsYWNrbGlzdCkge1xuICAgICAgY29uc3QgbWFwID0ge307XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBibGFja2xpc3QpIG1hcFtrZXldID0gdHJ1ZTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb25zdHJ1Y3Rvci5wcm90b3R5cGUsIFwiYmxhY2tsaXN0XCIsIHsgdmFsdWU6IG1hcCB9KTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvdGhlclByb3BzKSkge1xuLy9jb25zb2xlLmluZm8obmFtZSwga2V5LCBvdGhlclByb3BzW2tleV0pO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLnByb3RvdHlwZSwga2V5LCB7IHZhbHVlOiBvdGhlclByb3BzW2tleV0gfSk7XG4gICAgfVxuXG4gICAgY29uc3QgcnVsZSA9IHN5bnRheFxuICAgICAgPyBwYXJzZVJ1bGUoc3ludGF4LCBjb25zdHJ1Y3RvcilcbiAgICAgIDogbmV3IGNvbnN0cnVjdG9yKCk7XG5cbiAgICB0aGlzLmFkZFJ1bGUobmFtZXMsIHJ1bGUpO1xuICB9XG5cblxuLy9cbi8vICMjIyBQYXJzZXIgcmVnaXN0cnkuXG4vL1xuXHRzdGF0aWMgUkVHSVNUUlkgPSB7fTtcblxuXHQvLyBHZXQgYSBwYXJzZXIgZm9yIGEgZ2l2ZW4gYGNvbnRleHROYW1lYC5cblx0Ly8gV2lsbCByZS11c2UgZXhpc3RpbmcgcGFyc2VyLCBvciBjcmVhdGUgYSBuZXcgb25lIGlmIG5vdCBhbHJlYWR5IGRlZmluZWQuXG5cdHN0YXRpYyBmb3JOYW1lKG5hbWUpIHtcblx0XHRpZiAoIVBhcnNlci5SRUdJU1RSWVtuYW1lXSkge1xuXHRcdFx0UGFyc2VyLlJFR0lTVFJZW25hbWVdID0gbmV3IFBhcnNlcih7IG5hbWUgfSk7XG5cdFx0fVxuXHRcdHJldHVybiBQYXJzZXIuUkVHSVNUUllbbmFtZV07XG5cdH1cblxuXG4vL1xuLy8gIyMgVXRpbGl0eSBtZXRob2RzXG4vL1xuXG5cdC8vIEZpbmQgdGhlIG1hdGNoaW5nIGluc3RhbmNlIG9mIChwb3NzaWJseSBuZXN0ZWQpIGBlbmRUb2tlbmAgdG8gYmFsYW5jZSBgc3RhcnRUb2tlbmBcblx0Ly9cdGluIGFycmF5IG9mIGB0b2tlbnNgIChzdHJpbmdzKS5cblx0Ly8gSWYgc3VjY2Vzc2Z1bCwgcmV0dXJucyBgeyBzdGFydCwgZW5kLCBzbGljZSB9YFxuXHQvLyBUaHJvd3MgaWYgdW5zdWNlc3NmdWwuXG5cdHN0YXRpYyBmaW5kTmVzdGVkVG9rZW5zKHRva2Vucywgc3RhcnRUb2tlbiwgZW5kVG9rZW4sIHN0YXJ0ID0gMCkge1xuXHRcdGlmICh0b2tlbnNbc3RhcnRdICE9PSBzdGFydFRva2VuKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEV4cGVjdGVkICcke3N0YXJ0VG9rZW59JyBhdCBpbmRleCAke3N0YXJ0fSBvZiB0b2tlbnNgKTtcblx0XHRsZXQgbmVzdGluZyA9IDA7XG5cdFx0bGV0IG5lc3RlZCA9IGZhbHNlO1xuXHRcdGZvciAobGV0IGVuZCA9IHN0YXJ0ICsgMSwgbGFzdEluZGV4ID0gdG9rZW5zLmxlbmd0aDsgZW5kIDwgbGFzdEluZGV4OyBlbmQrKykge1xuXHRcdFx0bGV0IHRva2VuID0gdG9rZW5zW2VuZF07XG5cdFx0XHRpZiAodG9rZW4gPT09IHN0YXJ0VG9rZW4pIHtcblx0XHRcdFx0bmVzdGluZysrO1xuXHRcdFx0XHRuZXN0ZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRva2VuID09PSBlbmRUb2tlbikge1xuXHRcdFx0XHRpZiAobmVzdGluZyA9PT0gMClcblx0XHRcdFx0XHRyZXR1cm4geyBzdGFydCwgZW5kLCBzbGljZTogdG9rZW5zLnNsaWNlKHN0YXJ0KzEsIGVuZCksIG5lc3RlZCB9O1xuXHRcdFx0XHRuZXN0aW5nLS07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgQ291bGRuJ3QgZmluZCBtYXRjaGluZyAnJHtlbmRUb2tlbn0ncyBzdGFydGluZyBhdCBpdGVtICR7c3RhcnR9YCk7XG5cdH1cbn1cblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1BhcnNlci5qcyIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgdmFyIFJFQUNUX0VMRU1FTlRfVFlQRSA9ICh0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmXG4gICAgU3ltYm9sLmZvciAmJlxuICAgIFN5bWJvbC5mb3IoJ3JlYWN0LmVsZW1lbnQnKSkgfHxcbiAgICAweGVhYzc7XG5cbiAgdmFyIGlzVmFsaWRFbGVtZW50ID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICBvYmplY3QgIT09IG51bGwgJiZcbiAgICAgIG9iamVjdC4kJHR5cGVvZiA9PT0gUkVBQ1RfRUxFTUVOVF9UWVBFO1xuICB9O1xuXG4gIC8vIEJ5IGV4cGxpY2l0bHkgdXNpbmcgYHByb3AtdHlwZXNgIHlvdSBhcmUgb3B0aW5nIGludG8gbmV3IGRldmVsb3BtZW50IGJlaGF2aW9yLlxuICAvLyBodHRwOi8vZmIubWUvcHJvcC10eXBlcy1pbi1wcm9kXG4gIHZhciB0aHJvd09uRGlyZWN0QWNjZXNzID0gdHJ1ZTtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2ZhY3RvcnlXaXRoVHlwZUNoZWNrZXJzJykoaXNWYWxpZEVsZW1lbnQsIHRocm93T25EaXJlY3RBY2Nlc3MpO1xufSBlbHNlIHtcbiAgLy8gQnkgZXhwbGljaXRseSB1c2luZyBgcHJvcC10eXBlc2AgeW91IGFyZSBvcHRpbmcgaW50byBuZXcgcHJvZHVjdGlvbiBiZWhhdmlvci5cbiAgLy8gaHR0cDovL2ZiLm1lL3Byb3AtdHlwZXMtaW4tcHJvZFxuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZmFjdG9yeVdpdGhUaHJvd2luZ1NoaW1zJykoKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9wcm9wLXR5cGVzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAzNThcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVzZS1iZWZvcmUtZGVmaW5lICovXG4vKipcbiAqIEBtb2R1bGUgZXZlbnRIYW5kbGVyc1xuICpcbiAqL1xuaW1wb3J0IGRvbUhlbHBlcnMgZnJvbSAnLi9saWIvZG9tX2hlbHBlcnMnO1xuaW1wb3J0IGxpc3RlbmVycyBmcm9tICcuL2xpYi9saXN0ZW5lcnMnO1xuaW1wb3J0ICogYXMgc3RvcmUgZnJvbSAnLi9zdG9yZSc7XG5cbi8qKlxuICogcHJpdmF0ZVxuICpcbiAqL1xuXG4vKipcbiAqIF9vbkNsaWNrXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgVGhlIGNsaWNrIGV2ZW50IG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50LnRhcmdldCBUaGUgRE9NIG5vZGUgZnJvbSB0aGUgY2xpY2sgZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9vbkNsaWNrKF9yZWYpIHtcbiAgdmFyIHRhcmdldCA9IF9yZWYudGFyZ2V0O1xuXG4gIHN0b3JlLmFjdGl2YXRlKFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoc3RvcmUuZ2V0SW5zdGFuY2VzKCkpKS5yZWR1Y2UoZG9tSGVscGVycy5maW5kQ29udGFpbmVyTm9kZXModGFyZ2V0KSwgW10pLnNvcnQoZG9tSGVscGVycy5zb3J0QnlET01Qb3NpdGlvbikubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uaW5zdGFuY2U7XG4gIH0pKTtcbn1cblxuLyoqXG4gKiBfb25LZXlEb3duOiBUaGUga2V5ZG93biBldmVudCBjYWxsYmFja1xuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IFRoZSBrZXlkb3duIGV2ZW50IG9iamVjdFxuICogQHBhcmFtIHtudW1iZXJ9IGV2ZW50LndoaWNoIFRoZSBrZXkgY29kZSAod2hpY2gpIHJlY2VpdmVkIGZyb20gdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9vbktleURvd24oZXZlbnQpIHtcbiAgdmFyIGZvcmNlQ29uc2lkZXIgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuXG4gIGlmIChmb3JjZUNvbnNpZGVyIHx8IF9zaG91bGRDb25zaWRlcihldmVudCkpIHtcbiAgICB2YXIgX3JlZjIgPSBzdG9yZS5maW5kQmluZGluZ0ZvckV2ZW50KGV2ZW50KSB8fCB7fSxcbiAgICAgICAgZm4gPSBfcmVmMi5mbixcbiAgICAgICAgaW5zdGFuY2UgPSBfcmVmMi5pbnN0YW5jZTtcblxuICAgIGlmIChmbikge1xuICAgICAgZm4uY2FsbChpbnN0YW5jZSwgZXZlbnQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBfc2hvdWxkQ29uc2lkZXI6IENvbmRpdGlvbnMgZm9yIHByb2NlZWRpbmcgd2l0aCBrZXkgZXZlbnQgaGFuZGxpbmdcbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCBUaGUga2V5ZG93biBldmVudCBvYmplY3RcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudC50YXJnZXQgVGhlIG5vZGUgb3JpZ2luIG9mIHRoZSBldmVudFxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0byBjb250aW51ZSBwcm9jZXNpbmcgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9zaG91bGRDb25zaWRlcihfcmVmMykge1xuICB2YXIgY3RybEtleSA9IF9yZWYzLmN0cmxLZXksXG4gICAgICB0YXJnZXQgPSBfcmVmMy50YXJnZXQ7XG5cbiAgcmV0dXJuIGN0cmxLZXkgfHwgIX5bJ0lOUFVUJywgJ1NFTEVDVCcsICdURVhUQVJFQSddLmluZGV4T2YodGFyZ2V0LnRhZ05hbWUpICYmICghdGFyZ2V0LmdldEF0dHJpYnV0ZSB8fCB0YXJnZXQuZ2V0QXR0cmlidXRlKCdyb2xlJykgIT09ICd0ZXh0Ym94Jyk7XG59XG5cbi8qKlxuICogcHVibGljXG4gKlxuICovXG5cbi8qKlxuICogb25Nb3VudFxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKi9cbmZ1bmN0aW9uIG9uTW91bnQoaW5zdGFuY2UpIHtcbiAgc3RvcmUuYWN0aXZhdGUoaW5zdGFuY2UpO1xuICBsaXN0ZW5lcnMuYmluZEtleXMoX29uS2V5RG93bik7XG4gIGxpc3RlbmVycy5iaW5kQ2xpY2tzKF9vbkNsaWNrKTtcbiAgZG9tSGVscGVycy5iaW5kRm9jdXNhYmxlcyhpbnN0YW5jZSwgc3RvcmUuYWN0aXZhdGUpO1xufVxuXG4vKipcbiAqIG9uVW5tb3VudFxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKi9cbmZ1bmN0aW9uIG9uVW5tb3VudChpbnN0YW5jZSkge1xuICBzdG9yZS5kZWxldGVJbnN0YW5jZShpbnN0YW5jZSk7XG4gIGlmIChzdG9yZS5pc0VtcHR5KCkpIHtcbiAgICBsaXN0ZW5lcnMudW5iaW5kQ2xpY2tzKF9vbkNsaWNrKTtcbiAgICBsaXN0ZW5lcnMudW5iaW5kS2V5cyhfb25LZXlEb3duKTtcbiAgfVxufVxuXG5leHBvcnQgeyBvbk1vdW50LCBvblVubW91bnQgfTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9ldmVudF9oYW5kbGVycy5qc1xuLy8gbW9kdWxlIGlkID0gMzgxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IG1vZGlmaWVycyBhcyBtb2RpZmllcktleXMsIEFMTF9LRVlTLCBBTExfUFJJTlRBQkxFX0tFWVMgfSBmcm9tICcuL2tleXMnO1xuXG52YXIgUFJJTlRBQkxFX0NIQVJBQ1RFUlMgPSAnMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVp+IUAjJCVeJiooKS1fKz1bXVxcXFx7fXw7XFwnOlwiLC4vPD4/wqMnO1xuXG52YXIgbW9kS2V5cyA9IE9iamVjdC5rZXlzKG1vZGlmaWVyS2V5cyk7XG5cbmZ1bmN0aW9uIG1hdGNoS2V5cyhfcmVmKSB7XG4gIHZhciBrZXlTZXQgPSBfcmVmLmtleVNldCxcbiAgICAgIGV2ZW50ID0gX3JlZi5ldmVudDtcbiAgdmFyIGtleSA9IGtleVNldC5rZXksXG4gICAgICBfa2V5U2V0JG1vZGlmaWVycyA9IGtleVNldC5tb2RpZmllcnMsXG4gICAgICBtb2RpZmllcnMgPSBfa2V5U2V0JG1vZGlmaWVycyA9PT0gdW5kZWZpbmVkID8gW10gOiBfa2V5U2V0JG1vZGlmaWVycztcblxuICB2YXIga2V5c01hdGNoID0gdm9pZCAwO1xuXG4gIGtleXNNYXRjaCA9IGtleSA9PT0gQUxMX0tFWVM7XG5cbiAgaWYgKGtleSA9PT0gQUxMX1BSSU5UQUJMRV9LRVlTKSB7XG4gICAgaWYgKGV2ZW50LmtleSkge1xuICAgICAgLy8gTW9kZXJuIGJyb3dzZXJzIGltcGxlbWVudCBga2V5YCwgc28gaWYgYGtleWAgaXMgbGVuZ3RoIDEsIHdlIGhhdmUgYSBtYXRjaC4gZS5nLiAnYScgZm9yIHRoZVxuICAgICAgLy8gYSBrZXksIG9yICcyJyBmb3IgdGhlIDIga2V5LiBBbGwgb3RoZXIgbm9uLXByaW50YWJsZSBjaGFyYWN0ZXJzIGhhdmUgbmFtZXMsIGUuZy4gJ0VudGVyJyBvciAnQmFja3NwYWNlJy5cbiAgICAgIGtleXNNYXRjaCA9IGV2ZW50LmtleS5sZW5ndGggPT09IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZvciBicm93c2VycyB0aGF0IGRvIG5vIHN1cHBvcnQgYGV2ZW50LmtleWAsIHdlIHRlc3QgYWdhaW5zdCBhIGxpc3Qgb2YgY2hhcmFjdGVyc1xuICAgICAgdmFyIHByZXNzZWRDaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZShldmVudC5jaGFyQ29kZSk7XG4gICAgICBrZXlzTWF0Y2ggPSBQUklOVEFCTEVfQ0hBUkFDVEVSUy5pbmRleE9mKHByZXNzZWRDaGFyKSA+PSAwO1xuICAgIH1cbiAgfVxuXG4gIGlmIChrZXkgPT09IGV2ZW50LndoaWNoKSB7XG4gICAgdmFyIGV2dE1vZEtleXMgPSBtb2RLZXlzLmZpbHRlcihmdW5jdGlvbiAobW9kS2V5KSB7XG4gICAgICByZXR1cm4gZXZlbnRbbW9kS2V5ICsgJ0tleSddO1xuICAgIH0pLnNvcnQoKTtcbiAgICBrZXlzTWF0Y2ggPSBtb2RpZmllcnMubGVuZ3RoID09PSBldnRNb2RLZXlzLmxlbmd0aCAmJiBtb2RpZmllcnMuZXZlcnkoZnVuY3Rpb24gKG1vZEtleSwgaW5kZXgpIHtcbiAgICAgIHJldHVybiBldnRNb2RLZXlzW2luZGV4XSA9PT0gbW9kS2V5O1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGtleXNNYXRjaDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWF0Y2hLZXlzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9tYXRjaF9rZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSAzODJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IEtleXMsIHsgbW9kaWZpZXJzIH0gZnJvbSAnLi9rZXlzJztcblxuZnVuY3Rpb24gcGFyc2VLZXlzKGtleXNBcnJheSkge1xuICByZXR1cm4ga2V5c0FycmF5Lm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGtleVNldCA9IHsga2V5OiBrZXkgfTtcbiAgICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhciBrZXlTdHJpbmcgPSBrZXkudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgICB2YXIgbWF0Y2hlcyA9IGtleVN0cmluZy5zcGxpdCgvXFxzP1xcK1xccz8vKTtcbiAgICAgIGtleVNldCA9IG1hdGNoZXMubGVuZ3RoID09PSAxID8geyBrZXk6IEtleXNba2V5U3RyaW5nXSB9IDoge1xuICAgICAgICBrZXk6IEtleXNbbWF0Y2hlcy5wb3AoKV0sXG4gICAgICAgIG1vZGlmaWVyczogbWF0Y2hlcy5tYXAoZnVuY3Rpb24gKG1vZEtleSkge1xuICAgICAgICAgIHJldHVybiBtb2RpZmllcnNbbW9kS2V5XTtcbiAgICAgICAgfSkuc29ydCgpXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ga2V5U2V0O1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcGFyc2VLZXlzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9wYXJzZV9rZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSAzODNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbnZhciBzdHlsZXNJbkRvbSA9IHt9LFxuXHRtZW1vaXplID0gZnVuY3Rpb24oZm4pIHtcblx0XHR2YXIgbWVtbztcblx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKHR5cGVvZiBtZW1vID09PSBcInVuZGVmaW5lZFwiKSBtZW1vID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdHJldHVybiBtZW1vO1xuXHRcdH07XG5cdH0sXG5cdGlzT2xkSUUgPSBtZW1vaXplKGZ1bmN0aW9uKCkge1xuXHRcdC8vIFRlc3QgZm9yIElFIDw9IDkgYXMgcHJvcG9zZWQgYnkgQnJvd3NlcmhhY2tzXG5cdFx0Ly8gQHNlZSBodHRwOi8vYnJvd3NlcmhhY2tzLmNvbS8jaGFjay1lNzFkODY5MmY2NTMzNDE3M2ZlZTcxNWMyMjJjYjgwNVxuXHRcdC8vIFRlc3RzIGZvciBleGlzdGVuY2Ugb2Ygc3RhbmRhcmQgZ2xvYmFscyBpcyB0byBhbGxvdyBzdHlsZS1sb2FkZXIgXG5cdFx0Ly8gdG8gb3BlcmF0ZSBjb3JyZWN0bHkgaW50byBub24tc3RhbmRhcmQgZW52aXJvbm1lbnRzXG5cdFx0Ly8gQHNlZSBodHRwczovL2dpdGh1Yi5jb20vd2VicGFjay1jb250cmliL3N0eWxlLWxvYWRlci9pc3N1ZXMvMTc3XG5cdFx0cmV0dXJuIHdpbmRvdyAmJiBkb2N1bWVudCAmJiBkb2N1bWVudC5hbGwgJiYgIXdpbmRvdy5hdG9iO1xuXHR9KSxcblx0Z2V0RWxlbWVudCA9IChmdW5jdGlvbihmbikge1xuXHRcdHZhciBtZW1vID0ge307XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG5cdFx0XHRpZiAodHlwZW9mIG1lbW9bc2VsZWN0b3JdID09PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdG1lbW9bc2VsZWN0b3JdID0gZm4uY2FsbCh0aGlzLCBzZWxlY3Rvcik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbWVtb1tzZWxlY3Rvcl1cblx0XHR9O1xuXHR9KShmdW5jdGlvbiAoc3R5bGVUYXJnZXQpIHtcblx0XHRyZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzdHlsZVRhcmdldClcblx0fSksXG5cdHNpbmdsZXRvbkVsZW1lbnQgPSBudWxsLFxuXHRzaW5nbGV0b25Db3VudGVyID0gMCxcblx0c3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AgPSBbXSxcblx0Zml4VXJscyA9IHJlcXVpcmUoXCIuL2ZpeFVybHNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlzdCwgb3B0aW9ucykge1xuXHRpZih0eXBlb2YgREVCVUcgIT09IFwidW5kZWZpbmVkXCIgJiYgREVCVUcpIHtcblx0XHRpZih0eXBlb2YgZG9jdW1lbnQgIT09IFwib2JqZWN0XCIpIHRocm93IG5ldyBFcnJvcihcIlRoZSBzdHlsZS1sb2FkZXIgY2Fubm90IGJlIHVzZWQgaW4gYSBub24tYnJvd3NlciBlbnZpcm9ubWVudFwiKTtcblx0fVxuXG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRvcHRpb25zLmF0dHJzID0gdHlwZW9mIG9wdGlvbnMuYXR0cnMgPT09IFwib2JqZWN0XCIgPyBvcHRpb25zLmF0dHJzIDoge307XG5cblx0Ly8gRm9yY2Ugc2luZ2xlLXRhZyBzb2x1dGlvbiBvbiBJRTYtOSwgd2hpY2ggaGFzIGEgaGFyZCBsaW1pdCBvbiB0aGUgIyBvZiA8c3R5bGU+XG5cdC8vIHRhZ3MgaXQgd2lsbCBhbGxvdyBvbiBhIHBhZ2Vcblx0aWYgKHR5cGVvZiBvcHRpb25zLnNpbmdsZXRvbiA9PT0gXCJ1bmRlZmluZWRcIikgb3B0aW9ucy5zaW5nbGV0b24gPSBpc09sZElFKCk7XG5cblx0Ly8gQnkgZGVmYXVsdCwgYWRkIDxzdHlsZT4gdGFncyB0byB0aGUgPGhlYWQ+IGVsZW1lbnRcblx0aWYgKHR5cGVvZiBvcHRpb25zLmluc2VydEludG8gPT09IFwidW5kZWZpbmVkXCIpIG9wdGlvbnMuaW5zZXJ0SW50byA9IFwiaGVhZFwiO1xuXG5cdC8vIEJ5IGRlZmF1bHQsIGFkZCA8c3R5bGU+IHRhZ3MgdG8gdGhlIGJvdHRvbSBvZiB0aGUgdGFyZ2V0XG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ1bmRlZmluZWRcIikgb3B0aW9ucy5pbnNlcnRBdCA9IFwiYm90dG9tXCI7XG5cblx0dmFyIHN0eWxlcyA9IGxpc3RUb1N0eWxlcyhsaXN0LCBvcHRpb25zKTtcblx0YWRkU3R5bGVzVG9Eb20oc3R5bGVzLCBvcHRpb25zKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcblx0XHR2YXIgbWF5UmVtb3ZlID0gW107XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGl0ZW0gPSBzdHlsZXNbaV07XG5cdFx0XHR2YXIgZG9tU3R5bGUgPSBzdHlsZXNJbkRvbVtpdGVtLmlkXTtcblx0XHRcdGRvbVN0eWxlLnJlZnMtLTtcblx0XHRcdG1heVJlbW92ZS5wdXNoKGRvbVN0eWxlKTtcblx0XHR9XG5cdFx0aWYobmV3TGlzdCkge1xuXHRcdFx0dmFyIG5ld1N0eWxlcyA9IGxpc3RUb1N0eWxlcyhuZXdMaXN0LCBvcHRpb25zKTtcblx0XHRcdGFkZFN0eWxlc1RvRG9tKG5ld1N0eWxlcywgb3B0aW9ucyk7XG5cdFx0fVxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBtYXlSZW1vdmUubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBkb21TdHlsZSA9IG1heVJlbW92ZVtpXTtcblx0XHRcdGlmKGRvbVN0eWxlLnJlZnMgPT09IDApIHtcblx0XHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKVxuXHRcdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKCk7XG5cdFx0XHRcdGRlbGV0ZSBzdHlsZXNJbkRvbVtkb21TdHlsZS5pZF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufTtcblxuZnVuY3Rpb24gYWRkU3R5bGVzVG9Eb20oc3R5bGVzLCBvcHRpb25zKSB7XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgaXRlbSA9IHN0eWxlc1tpXTtcblx0XHR2YXIgZG9tU3R5bGUgPSBzdHlsZXNJbkRvbVtpdGVtLmlkXTtcblx0XHRpZihkb21TdHlsZSkge1xuXHRcdFx0ZG9tU3R5bGUucmVmcysrO1xuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKGl0ZW0ucGFydHNbal0pO1xuXHRcdFx0fVxuXHRcdFx0Zm9yKDsgaiA8IGl0ZW0ucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0ZG9tU3R5bGUucGFydHMucHVzaChhZGRTdHlsZShpdGVtLnBhcnRzW2pdLCBvcHRpb25zKSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBwYXJ0cyA9IFtdO1xuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGl0ZW0ucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0cGFydHMucHVzaChhZGRTdHlsZShpdGVtLnBhcnRzW2pdLCBvcHRpb25zKSk7XG5cdFx0XHR9XG5cdFx0XHRzdHlsZXNJbkRvbVtpdGVtLmlkXSA9IHtpZDogaXRlbS5pZCwgcmVmczogMSwgcGFydHM6IHBhcnRzfTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gbGlzdFRvU3R5bGVzKGxpc3QsIG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlcyA9IFtdO1xuXHR2YXIgbmV3U3R5bGVzID0ge307XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGl0ZW0gPSBsaXN0W2ldO1xuXHRcdHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuXHRcdHZhciBjc3MgPSBpdGVtWzFdO1xuXHRcdHZhciBtZWRpYSA9IGl0ZW1bMl07XG5cdFx0dmFyIHNvdXJjZU1hcCA9IGl0ZW1bM107XG5cdFx0dmFyIHBhcnQgPSB7Y3NzOiBjc3MsIG1lZGlhOiBtZWRpYSwgc291cmNlTWFwOiBzb3VyY2VNYXB9O1xuXHRcdGlmKCFuZXdTdHlsZXNbaWRdKVxuXHRcdFx0c3R5bGVzLnB1c2gobmV3U3R5bGVzW2lkXSA9IHtpZDogaWQsIHBhcnRzOiBbcGFydF19KTtcblx0XHRlbHNlXG5cdFx0XHRuZXdTdHlsZXNbaWRdLnBhcnRzLnB1c2gocGFydCk7XG5cdH1cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIHN0eWxlRWxlbWVudCkge1xuXHR2YXIgc3R5bGVUYXJnZXQgPSBnZXRFbGVtZW50KG9wdGlvbnMuaW5zZXJ0SW50bylcblx0aWYgKCFzdHlsZVRhcmdldCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0SW50bycgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuXHR9XG5cdHZhciBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCA9IHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wW3N0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLmxlbmd0aCAtIDFdO1xuXHRpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ0b3BcIikge1xuXHRcdGlmKCFsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCkge1xuXHRcdFx0c3R5bGVUYXJnZXQuaW5zZXJ0QmVmb3JlKHN0eWxlRWxlbWVudCwgc3R5bGVUYXJnZXQuZmlyc3RDaGlsZCk7XG5cdFx0fSBlbHNlIGlmKGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKSB7XG5cdFx0XHRzdHlsZVRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGVFbGVtZW50LCBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcC5uZXh0U2libGluZyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0eWxlVGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlRWxlbWVudCk7XG5cdFx0fVxuXHRcdHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLnB1c2goc3R5bGVFbGVtZW50KTtcblx0fSBlbHNlIGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcImJvdHRvbVwiKSB7XG5cdFx0c3R5bGVUYXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGVFbGVtZW50KTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHZhbHVlIGZvciBwYXJhbWV0ZXIgJ2luc2VydEF0Jy4gTXVzdCBiZSAndG9wJyBvciAnYm90dG9tJy5cIik7XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuXHRzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xuXHR2YXIgaWR4ID0gc3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AuaW5kZXhPZihzdHlsZUVsZW1lbnQpO1xuXHRpZihpZHggPj0gMCkge1xuXHRcdHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLnNwbGljZShpZHgsIDEpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKSB7XG5cdHZhciBzdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG5cdG9wdGlvbnMuYXR0cnMudHlwZSA9IFwidGV4dC9jc3NcIjtcblxuXHRhdHRhY2hUYWdBdHRycyhzdHlsZUVsZW1lbnQsIG9wdGlvbnMuYXR0cnMpO1xuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgc3R5bGVFbGVtZW50KTtcblx0cmV0dXJuIHN0eWxlRWxlbWVudDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTGlua0VsZW1lbnQob3B0aW9ucykge1xuXHR2YXIgbGlua0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcblx0b3B0aW9ucy5hdHRycy50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuXHRvcHRpb25zLmF0dHJzLnJlbCA9IFwic3R5bGVzaGVldFwiO1xuXG5cdGF0dGFjaFRhZ0F0dHJzKGxpbmtFbGVtZW50LCBvcHRpb25zLmF0dHJzKTtcblx0aW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIGxpbmtFbGVtZW50KTtcblx0cmV0dXJuIGxpbmtFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBhdHRhY2hUYWdBdHRycyhlbGVtZW50LCBhdHRycykge1xuXHRPYmplY3Qua2V5cyhhdHRycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGFkZFN0eWxlKG9iaiwgb3B0aW9ucykge1xuXHR2YXIgc3R5bGVFbGVtZW50LCB1cGRhdGUsIHJlbW92ZSwgdHJhbnNmb3JtUmVzdWx0O1xuXG5cdC8vIElmIGEgdHJhbnNmb3JtIGZ1bmN0aW9uIHdhcyBkZWZpbmVkLCBydW4gaXQgb24gdGhlIGNzc1xuXHRpZiAob3B0aW9ucy50cmFuc2Zvcm0gJiYgb2JqLmNzcykge1xuXHQgICAgdHJhbnNmb3JtUmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm0ob2JqLmNzcyk7XG5cdCAgICBcblx0ICAgIGlmICh0cmFuc2Zvcm1SZXN1bHQpIHtcblx0ICAgIFx0Ly8gSWYgdHJhbnNmb3JtIHJldHVybnMgYSB2YWx1ZSwgdXNlIHRoYXQgaW5zdGVhZCBvZiB0aGUgb3JpZ2luYWwgY3NzLlxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBydW5uaW5nIHJ1bnRpbWUgdHJhbnNmb3JtYXRpb25zIG9uIHRoZSBjc3MuXG5cdCAgICBcdG9iai5jc3MgPSB0cmFuc2Zvcm1SZXN1bHQ7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgXHQvLyBJZiB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIHJldHVybnMgYSBmYWxzeSB2YWx1ZSwgZG9uJ3QgYWRkIHRoaXMgY3NzLiBcblx0ICAgIFx0Ly8gVGhpcyBhbGxvd3MgY29uZGl0aW9uYWwgbG9hZGluZyBvZiBjc3Ncblx0ICAgIFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHQgICAgXHRcdC8vIG5vb3Bcblx0ICAgIFx0fTtcblx0ICAgIH1cblx0fVxuXG5cdGlmIChvcHRpb25zLnNpbmdsZXRvbikge1xuXHRcdHZhciBzdHlsZUluZGV4ID0gc2luZ2xldG9uQ291bnRlcisrO1xuXHRcdHN0eWxlRWxlbWVudCA9IHNpbmdsZXRvbkVsZW1lbnQgfHwgKHNpbmdsZXRvbkVsZW1lbnQgPSBjcmVhdGVTdHlsZUVsZW1lbnQob3B0aW9ucykpO1xuXHRcdHVwZGF0ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZUVsZW1lbnQsIHN0eWxlSW5kZXgsIGZhbHNlKTtcblx0XHRyZW1vdmUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50LCBzdHlsZUluZGV4LCB0cnVlKTtcblx0fSBlbHNlIGlmKG9iai5zb3VyY2VNYXAgJiZcblx0XHR0eXBlb2YgVVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgVVJMLmNyZWF0ZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIFVSTC5yZXZva2VPYmplY3RVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBCbG9iID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0c3R5bGVFbGVtZW50ID0gY3JlYXRlTGlua0VsZW1lbnQob3B0aW9ucyk7XG5cdFx0dXBkYXRlID0gdXBkYXRlTGluay5iaW5kKG51bGwsIHN0eWxlRWxlbWVudCwgb3B0aW9ucyk7XG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcblx0XHRcdGlmKHN0eWxlRWxlbWVudC5ocmVmKVxuXHRcdFx0XHRVUkwucmV2b2tlT2JqZWN0VVJMKHN0eWxlRWxlbWVudC5ocmVmKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHN0eWxlRWxlbWVudCA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKTtcblx0XHR1cGRhdGUgPSBhcHBseVRvVGFnLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50KTtcblx0XHRyZW1vdmUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuXHRcdH07XG5cdH1cblxuXHR1cGRhdGUob2JqKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlU3R5bGUobmV3T2JqKSB7XG5cdFx0aWYobmV3T2JqKSB7XG5cdFx0XHRpZihuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXApXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdHVwZGF0ZShvYmogPSBuZXdPYmopO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZW1vdmUoKTtcblx0XHR9XG5cdH07XG59XG5cbnZhciByZXBsYWNlVGV4dCA9IChmdW5jdGlvbiAoKSB7XG5cdHZhciB0ZXh0U3RvcmUgPSBbXTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gKGluZGV4LCByZXBsYWNlbWVudCkge1xuXHRcdHRleHRTdG9yZVtpbmRleF0gPSByZXBsYWNlbWVudDtcblx0XHRyZXR1cm4gdGV4dFN0b3JlLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG4nKTtcblx0fTtcbn0pKCk7XG5cbmZ1bmN0aW9uIGFwcGx5VG9TaW5nbGV0b25UYWcoc3R5bGVFbGVtZW50LCBpbmRleCwgcmVtb3ZlLCBvYmopIHtcblx0dmFyIGNzcyA9IHJlbW92ZSA/IFwiXCIgOiBvYmouY3NzO1xuXG5cdGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSByZXBsYWNlVGV4dChpbmRleCwgY3NzKTtcblx0fSBlbHNlIHtcblx0XHR2YXIgY3NzTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcyk7XG5cdFx0dmFyIGNoaWxkTm9kZXMgPSBzdHlsZUVsZW1lbnQuY2hpbGROb2Rlcztcblx0XHRpZiAoY2hpbGROb2Rlc1tpbmRleF0pIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChjaGlsZE5vZGVzW2luZGV4XSk7XG5cdFx0aWYgKGNoaWxkTm9kZXMubGVuZ3RoKSB7XG5cdFx0XHRzdHlsZUVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNzc05vZGUsIGNoaWxkTm9kZXNbaW5kZXhdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGNzc05vZGUpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBhcHBseVRvVGFnKHN0eWxlRWxlbWVudCwgb2JqKSB7XG5cdHZhciBjc3MgPSBvYmouY3NzO1xuXHR2YXIgbWVkaWEgPSBvYmoubWVkaWE7XG5cblx0aWYobWVkaWEpIHtcblx0XHRzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibWVkaWFcIiwgbWVkaWEpXG5cdH1cblxuXHRpZihzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG5cdH0gZWxzZSB7XG5cdFx0d2hpbGUoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcblx0XHRcdHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG5cdFx0fVxuXHRcdHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcblx0fVxufVxuXG5mdW5jdGlvbiB1cGRhdGVMaW5rKGxpbmtFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuXG5cdC8qIElmIGNvbnZlcnRUb0Fic29sdXRlVXJscyBpc24ndCBkZWZpbmVkLCBidXQgc291cmNlbWFwcyBhcmUgZW5hYmxlZFxuXHRhbmQgdGhlcmUgaXMgbm8gcHVibGljUGF0aCBkZWZpbmVkIHRoZW4gbGV0cyB0dXJuIGNvbnZlcnRUb0Fic29sdXRlVXJsc1xuXHRvbiBieSBkZWZhdWx0LiAgT3RoZXJ3aXNlIGRlZmF1bHQgdG8gdGhlIGNvbnZlcnRUb0Fic29sdXRlVXJscyBvcHRpb25cblx0ZGlyZWN0bHlcblx0Ki9cblx0dmFyIGF1dG9GaXhVcmxzID0gb3B0aW9ucy5jb252ZXJ0VG9BYnNvbHV0ZVVybHMgPT09IHVuZGVmaW5lZCAmJiBzb3VyY2VNYXA7XG5cblx0aWYgKG9wdGlvbnMuY29udmVydFRvQWJzb2x1dGVVcmxzIHx8IGF1dG9GaXhVcmxzKXtcblx0XHRjc3MgPSBmaXhVcmxzKGNzcyk7XG5cdH1cblxuXHRpZihzb3VyY2VNYXApIHtcblx0XHQvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNjYwMzg3NVxuXHRcdGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIgKyBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpICsgXCIgKi9cIjtcblx0fVxuXG5cdHZhciBibG9iID0gbmV3IEJsb2IoW2Nzc10sIHsgdHlwZTogXCJ0ZXh0L2Nzc1wiIH0pO1xuXG5cdHZhciBvbGRTcmMgPSBsaW5rRWxlbWVudC5ocmVmO1xuXG5cdGxpbmtFbGVtZW50LmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXG5cdGlmKG9sZFNyYylcblx0XHRVUkwucmV2b2tlT2JqZWN0VVJMKG9sZFNyYyk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qc1xuLy8gbW9kdWxlIGlkID0gNDc2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IG9ic2VydmVyIH0gZnJvbSBcIm1vYngtcmVhY3RcIjtcbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBrZXlkb3duIGZyb20gXCJyZWFjdC1rZXlkb3duXCI7XG5pbXBvcnQgeyBCdXR0b24sIERyb3Bkb3duLCBHcmlkLCBNZW51LCBTZWdtZW50LCBUZXh0QXJlYSB9IGZyb20gJ3NlbWFudGljLXVpLXJlYWN0J1xuXG5pbXBvcnQgRXhhbXBsZVN0b3JlIGZyb20gXCIuL0V4YW1wbGVTdG9yZVwiO1xuaW1wb3J0IFNwYWNlciBmcm9tIFwiLi9TcGFjZXIuanN4XCI7XG5pbXBvcnQgXCIuL3N0eWxlcy5sZXNzXCI7XG5pbXBvcnQgVGFiYmFibGVUZXh0QXJlYSBmcm9tIFwiLi9UYWJiYWJsZVRleHRBcmVhLmpzeFwiO1xuXG5Ab2JzZXJ2ZXJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwZWxsRWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0c3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcblx0XHRleGFtcGxlczogbmV3IEV4YW1wbGVTdG9yZSgpXG5cdH07XG5cblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcyk7XG53aW5kb3cuZXhhbXBsZXMgPSBwcm9wcy5leGFtcGxlcztcblx0XHR0aGlzLnByb3BzLmV4YW1wbGVzLmxvYWQoKTtcblxuXHRcdC8vREVCVUdcblx0XHR3aW5kb3cuc3BlbGxFZGl0b3IgPSB0aGlzO1xuXHRcdHdpbmRvdy5leGFtcGxlcyA9IHRoaXMucHJvcHMuZXhhbXBsZXM7XG5cdH1cblxuXHRAa2V5ZG93bihcImN0cmwrc1wiKVxuXHRzYXZlKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLnNhdmUoKTsgfVxuXG5cdEBrZXlkb3duKFwiY3RybCtyXCIpXG5cdHJldmVydCgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5yZXZlcnQoKTsgfVxuXG5cdEBrZXlkb3duKFwiY3RybCtjXCIpXG5cdGNvbXBpbGUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuY29tcGlsZSgpOyB9XG5cblx0QGtleWRvd24oXCJjdHJsK25cIilcblx0Y3JlYXRlKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLmNyZWF0ZSgpOyB9XG5cblx0QGtleWRvd24oXCJjdHJsK2RcIilcblx0ZGVsZXRlKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLmRlbGV0ZSh1bmRlZmluZWQsIFwiQ09ORklSTVwiKTsgfVxuXG5cdHJlbmFtZSgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5yZW5hbWUoKTsgfVxuXHRkdXBsaWNhdGUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuZHVwbGljYXRlKCk7IH1cblx0bG9hZCgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5sb2FkKCk7IH1cblx0cmVzZXQoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMucmVzZXQoKTsgfVxuXG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCB7IGV4YW1wbGVzIH0gPSB0aGlzLnByb3BzO1xuXHRcdGxldCB7IHRpdGxlcywgc2VsZWN0ZWQsIGRpcnR5LCBjb2RlLCBvdXRwdXQgfSA9IGV4YW1wbGVzO1xuXG5cdFx0Ly8gQ3JlYXRlIG1lbnVpdGVtcyBmcm9tIHRoZSBleGFtcGxlc1xuXHRcdGxldCBvcHRpb25zID0gdGl0bGVzLm1hcCggdGl0bGUgPT5cblx0XHRcdCh7XG5cdFx0XHRcdHZhbHVlOiB0aXRsZSxcblx0XHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0XHR0ZXh0OiB0aXRsZSxcblx0XHRcdFx0Y29udGVudDogdGl0bGUsXG5cdFx0XHRcdG9uQ2xpY2s6ICgpID0+IGV4YW1wbGVzLnNlbGVjdCh0aXRsZSlcblx0XHRcdH0pKTtcblxuXHRcdGxldCBkaXJ0eUJ1dHRvbnMgPSAoKSA9PiB7XG5cdFx0XHRpZiAoIWRpcnR5KSByZXR1cm47XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8TWVudSBzZWNvbmRhcnkgc3R5bGU9e3sgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgcmlnaHQ6IFwiMXJlbVwiLCB0b3A6IFwiM3B4XCIsIG1hcmdpbjogMCB9fT5cblx0XHRcdFx0XHQ8QnV0dG9uIG5lZ2F0aXZlIG9uQ2xpY2s9eygpID0+IHRoaXMucmV2ZXJ0KCl9Pjx1PlI8L3U+ZXZlcnQ8L0J1dHRvbj5cblx0XHRcdFx0XHQ8QnV0dG9uIHBvc2l0aXZlIG9uQ2xpY2s9eygpID0+IHRoaXMuc2F2ZSgpfT48dT5TPC91PmF2ZTwvQnV0dG9uPlxuXHRcdFx0XHQ8L01lbnU+XG5cdFx0XHQpO1xuXHRcdH07XG5cblx0XHRsZXQgY29tcGlsZUJ1dHRvbiA9ICgpID0+IHtcblx0XHRcdGlmIChvdXRwdXQpIHJldHVybjtcblx0XHRcdHJldHVybiA8QnV0dG9uXG5cdFx0XHRcdFx0c3R5bGU9e3sgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgIHdpZHRoOiBcIjRlbVwiLCBsZWZ0OiBcImNhbGMoNTAlIC0gMmVtKVwiLCB0b3A6IFwiNTAlXCIgfX1cblx0XHRcdFx0XHRvbkNsaWNrPXsoKSA9PiB0aGlzLmNvbXBpbGUoKX1cblx0XHRcdFx0XHRpY29uPVwicmlnaHQgY2hldnJvblwiLz47XG5cdFx0fTtcblxuXHRcdHJldHVybiAoXG5cdFx0PEdyaWQgc3RyZXRjaGVkIHBhZGRlZCBjbGFzc05hbWU9XCJmdWxsSGVpZ2h0XCI+XG5cdFx0XHQ8R3JpZC5Sb3cgc3R5bGU9e3sgaGVpZ2h0OiBcIjJyZW1cIiwgcGFkZGluZ1RvcDogXCIwcmVtXCIgfX0gY2xhc3NOYW1lPVwidWkgaW52ZXJ0ZWQgYXR0YWNoZWQgbWVudVwiPlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezd9PlxuXHRcdFx0XHRcdDxNZW51IGludmVydGVkIGF0dGFjaGVkIGZsdWlkPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbT5FeGFtcGxlOjwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdFx0PERyb3Bkb3duIGl0ZW0gc2VsZWN0aW9uIG9wdGlvbnM9e29wdGlvbnN9IHZhbHVlPXtzZWxlY3RlZH0gc3R5bGU9e3sgd2lkdGg6IFwiMjBlbVwiIH19Lz5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0gb25DbGljaz17KCkgPT4gdGhpcy5kZWxldGUoKX0+PHU+RDwvdT5lbGV0ZTwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbSBvbkNsaWNrPXsoKSA9PiB0aGlzLnJlbmFtZSgpfT5SZW5hbWU8L01lbnUuSXRlbT5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0gb25DbGljaz17KCkgPT4gdGhpcy5kdXBsaWNhdGUoKX0+RHVwbGljYXRlPC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0PC9NZW51PlxuXHRcdFx0XHQ8L0dyaWQuQ29sdW1uPlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezJ9PlxuXHRcdFx0XHRcdDxNZW51IGludmVydGVkIGF0dGFjaGVkIGZsdWlkPlxuXHRcdFx0XHRcdFx0PFNwYWNlciBmbHVpZC8+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtIG9uQ2xpY2s9eygpID0+IHRoaXMuY3JlYXRlKCl9Pjx1Pk48L3U+ZXc8L01lbnUuSXRlbT5cblx0XHRcdFx0XHRcdDxTcGFjZXIgZmx1aWQvPlxuXHRcdFx0XHRcdDwvTWVudT5cblx0XHRcdFx0PC9HcmlkLkNvbHVtbj5cblx0XHRcdFx0PEdyaWQuQ29sdW1uIHdpZHRoPXs3fT5cblx0XHRcdFx0XHQ8TWVudSBpbnZlcnRlZCBhdHRhY2hlZCBmbHVpZD5cblx0XHRcdFx0XHRcdDxTcGFjZXIgZmx1aWQvPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbSBvbkNsaWNrPXsoKSA9PiB0aGlzLmxvYWQoKX0+UmVsb2FkPC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtIG9uQ2xpY2s9eygpID0+IHRoaXMucmVzZXQoKX0+UmVzZXQ8L01lbnUuSXRlbT5cblx0XHRcdFx0XHQ8L01lbnU+XG5cdFx0XHRcdDwvR3JpZC5Db2x1bW4+XG5cdFx0XHQ8L0dyaWQuUm93PlxuXHRcdFx0PEdyaWQuUm93IHN0eWxlPXt7IGhlaWdodDogXCJjYWxjKDEwMCUgLSAzcmVtKVwiIH19PlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezh9PlxuXHRcdFx0XHRcdDxUYWJiYWJsZVRleHRBcmVhXG5cdFx0XHRcdFx0XHRjbGFzc05hbWU9XCJ1aSBzZWdtZW50XCJcblx0XHRcdFx0XHRcdHZhbHVlPXtjb2RlfVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyhldmVudCkgPT4gZXhhbXBsZXMudXBkYXRlKGV4YW1wbGVzLnNlbGVjdGVkLCBldmVudC50YXJnZXQudmFsdWUsIFwiU0tJUF9TQVZFXCIpfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0e2RpcnR5QnV0dG9ucygpfVxuXHRcdFx0XHQ8L0dyaWQuQ29sdW1uPlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezh9PlxuXHRcdFx0XHRcdDxUZXh0QXJlYSBjbGFzc05hbWU9XCJ1aSBzZWdtZW50XCIgdmFsdWU9e291dHB1dH0vPlxuXHRcdFx0XHQ8L0dyaWQuQ29sdW1uPlxuXHRcdFx0XHR7Y29tcGlsZUJ1dHRvbigpfVxuXHRcdFx0PC9HcmlkLlJvdz5cblx0XHQ8L0dyaWQ+XG5cdCk7fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC9TcGVsbEVkaXRvci5qc3giLCIvLyBFeHBvcnQgYWxsIHN0YW5kYXJkIFwic3BlbGxcIiBydWxlcy5cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4uLy4uL1BhcnNlclwiO1xuaW1wb3J0IFRva2VuaXplciBmcm9tIFwiLi4vLi4vVG9rZW5pemVyLmpzXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZS5qc1wiO1xuXG4vLyBMb2FkIGFsbCBzdGFuZGFyZCBydWxlcyBmaWxlcy5cbmltcG9ydCBcIi4vY29yZVwiO1xuaW1wb3J0IFwiLi9saXN0c1wiO1xuaW1wb3J0IFwiLi9vcGVyYXRvcnNcIjtcbmltcG9ydCBcIi4vaWZcIjtcbmltcG9ydCBcIi4vc3RhdGVtZW50c1wiO1xuaW1wb3J0IFwiLi90eXBlc1wiO1xuaW1wb3J0IFwiLi9KU1hcIjtcblxuLy8gQ3JlYXRlIHBhcnNlciB3aGljaCBjb21iaW5lcyBhbGwgb2YgdGhlIGFib3ZlLi4uXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTmFtZShcInNwZWxsXCIpO1xuLy8gLi4ud2hpY2ggZGVwZW5kcyBvbiBydWxlcyBsb2FkZWQgYWJvdmUuLi5cbnBhcnNlci5pbXBvcnQoXCJjb3JlXCIsIFwibGlzdHNcIiwgXCJvcGVyYXRvcnNcIiwgXCJpZlwiLCBcInN0YXRlbWVudHNcIiwgXCJ0eXBlc1wiLCBcIkpTWFwiKTtcbi8vIC4uLmFzIHRoZSBkZWZhdWx0IGV4cG9ydFxuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG4vLyBTdGljayBvdGhlciBzdHVmZiBvbiBgd2luZG93YCBmb3IgcmVmbGVjdGlvbiBhbmQgYWQtaG9jIHRlc3RpbmcuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRPYmplY3QuYXNzaWduKHdpbmRvdywge1xuXHRcdFRva2VuaXplcixcblx0XHRSdWxlLFxuXHRcdFBhcnNlcixcblxuXHRcdHRva2VuaXplOiBUb2tlbml6ZXIudG9rZW5pemUuYmluZChleHBvcnRzLlRva2VuaXplciksXG5cdFx0cGFyc2VyLFxuXHRcdHBhcnNlOiBwYXJzZXIucGFyc2UuYmluZChwYXJzZXIpLFxuXHRcdGNvbXBpbGU6IHBhcnNlci5jb21waWxlLmJpbmQocGFyc2VyKSxcblx0fSk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvaW5kZXguanMiLCIvKiBTdG9yZSBvZiBleGFtcGxlIHNwZWxsIGNvZGUgZnJhZ21lbnRzLiAqL1xuaW1wb3J0IG1vYngsIHsgb2JzZXJ2YWJsZSwgY29tcHV0ZWQgfSBmcm9tIFwibW9ieFwiO1xuXG4vLyBNYWtlIFBhcnNlciBhbmQgVG9rZW5pemVyIFdBUk4gYXMgd2UgcnVuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi9QYXJzZXJcIjtcblBhcnNlci5XQVJOID0gdHJ1ZTtcblBhcnNlci5ERUJVRyA9IHRydWU7XG5QYXJzZXIuVElNRSA9IHRydWU7XG5cbmltcG9ydCBUb2tlbml6ZXIgZnJvbSBcIi4uL1Rva2VuaXplclwiO1xuVG9rZW5pemVyLldBUk4gPSB0cnVlO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4YW1wbGVTdG9yZSB7XG5cdC8vIENVUlJFTlQgZXhhbXBsZXNcblx0QG9ic2VydmFibGUgZXhhbXBsZXMgPSB7fTtcblx0Ly8gRXhhbXBsZXMgYXMgb2YgbGFzdCBzYXZlIChmb3IgcmV2ZXIpXG5cdEBvYnNlcnZhYmxlIF9zYXZlZEV4YW1wbGVzID0ge307XG5cdC8vIFNlbGVjdGVkIGV4YW1wbGUga2V5LlxuXHRAb2JzZXJ2YWJsZSBzZWxlY3RlZCA9IFwiXCI7XG5cdC8vIENvbXBpbGVkIG91dHB1dC5cblx0QG9ic2VydmFibGUgb3V0cHV0ID0gXCJcIjtcblxuXHQvLyBSZXR1cm4ganVzdCB0aGUgdGl0bGVzIG9mIHRoZSBleGFtcGxlcy5cblx0QGNvbXB1dGVkIGdldCB0aXRsZXMoKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuZXhhbXBsZXMpO1xuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBjb2RlIGZvciB0aGUgY3VycmVudCBleGFtcGxlXG5cdEBjb21wdXRlZCBnZXQgY29kZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5leGFtcGxlc1t0aGlzLnNlbGVjdGVkXTtcblx0fVxuXG5cdC8vIElzIEFOWVRISU5HIGRpcnR5P1xuXHRAY29tcHV0ZWQgZ2V0IGRpcnR5KCkge1xuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLl9zYXZlZEV4YW1wbGVzKSAhPT0gSlNPTi5zdHJpbmdpZnkodGhpcy5leGFtcGxlcyk7XG5cdH1cblxuXHQvLyBSZXNldCBhbGwgZXhhbXBsZXMgZnJvbSBsb2NhbFN0b3JhZ2UuXG5cdHJlc2V0KCkge1xuXHRcdGRlbGV0ZSBsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlcztcblx0XHRkZWxldGUgbG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZTtcblx0XHR3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG5cdH1cblxuXHQvLyBMb2FkIGV4YW1wbGVzXG5cdGxvYWQoKSB7XG5cdFx0Ly8gTG9hZCBleGFtcGxlcyBmcm9tIGxvY2FsU3RvcmFnZVxuXHRcdHRoaXMuZXhhbXBsZXMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5zcGVsbEVkaXRvckV4YW1wbGVzXG5cdFx0XHR8fCAne1wiRm9vXCI6XCJkZWZpbmUgdHlwZSBGb29cIiwgXCJCYXJcIjpcImRlZmluZSB0eXBlIEJhclwifScpO1xuXG5cdFx0Ly8gU2F2ZSBhIGNvcHkgb2YgZXhhbXBsZXMgZm9yIHJldmVydFxuXHRcdHRoaXMuX3NhdmVkRXhhbXBsZXMgPSB0aGlzLmV4YW1wbGVzO1xuXG5cdFx0Ly8gTG9hZCBzZWxlY3RlZCBleGFtcGxlIG5hbWVcblx0XHR0aGlzLnNlbGVjdChsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlKTtcblx0fVxuXG5cdC8vIFNhdmUgY3VycmVudCBleGFtcGxlcy5cblx0c2F2ZSgpIHtcblx0XHRsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlcyA9IEpTT04uc3RyaW5naWZ5KHRoaXMuZXhhbXBsZXMpO1xuXG5cdFx0Ly8gU2F2ZSBhIGNvcHkgb2YgZXhhbXBsZXMgZm9yIHJldmVydFxuXHRcdHRoaXMuX3NhdmVkRXhhbXBsZXMgPSB0aGlzLmV4YW1wbGVzO1xuXHR9XG5cblx0Ly8gUmV2ZXJ0IHRoZSBjdXJyZW50IGV4YW1wbGVcblx0cmV2ZXJ0KGV4YW1wbGUgPSB0aGlzLnNlbGVjdGVkKSB7XG5cdFx0dGhpcy51cGRhdGUoZXhhbXBsZSwgdGhpcy5fc2F2ZWRFeGFtcGxlc1tleGFtcGxlXSk7XG5cdH1cblxuXHQvLyBTZWxlY3QgYSBkaWZmZXJlbnQgZXhhbXBsZS5cblx0c2VsZWN0KGV4YW1wbGUpIHtcblx0XHRpZiAoIWV4YW1wbGUgfHwgdGhpcy5leGFtcGxlc1tleGFtcGxlXSA9PSBudWxsKSBleGFtcGxlID0gT2JqZWN0LmtleXModGhpcy5leGFtcGxlcylbMF0gfHwgXCJcIjtcblx0XHR0aGlzLnNlbGVjdGVkID0gbG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZSA9IGV4YW1wbGU7XG5cdFx0dGhpcy5vdXRwdXQgPSBcIlwiO1xuXHR9XG5cblx0Ly8gQ3JlYXRlIGEgbmV3IGV4YW1wbGUuXG5cdC8vIFNhdmVzIGFuZCBzZWxlY3RzIHRoZSBleGFtcGxlIGF1dG9tYXRpY2FsbHkuXG5cdHVwZGF0ZShuYW1lLCBjb2RlLCBza2lwU2F2ZSkge1xuXHRcdHRoaXMuZXhhbXBsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmV4YW1wbGVzLCB7IFsgbmFtZSBdOiBjb2RlIH0pO1xuXHRcdHRoaXMuc2VsZWN0KG5hbWUpO1xuXHRcdHRoaXMub3V0cHV0ID0gXCJcIjtcblx0XHRpZiAoIXNraXBTYXZlKSB0aGlzLnNhdmUoKTtcblx0fVxuXG5cdC8vIERlbGV0ZSBhbiBleGFtcGxlLlxuXHQvLyBTYXZlcyBhbmQgc2VsZWN0cyBhbm90aGVyIGV4YW1wbGUgYXV0b21hdGljYWxseS5cblx0ZGVsZXRlKG5hbWUgPSB0aGlzLnNlbGVjdGVkLCBzaG93Q29uZmlybSkge1xuXHRcdGlmIChzaG93Q29uZmlybSAmJiAhY29uZmlybShgUmVhbGx5IGRlbGV0ZSBleGFtcGxlICR7bmFtZX0/YCkpIHJldHVybjtcblx0XHRsZXQgZXhhbXBsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmV4YW1wbGVzKTtcblx0XHRkZWxldGUgZXhhbXBsZXNbbmFtZV07XG5cdFx0dGhpcy5leGFtcGxlcyA9IGV4YW1wbGVzO1xuXHRcdHRoaXMuc2F2ZSgpO1xuXHRcdHRoaXMuc2VsZWN0KCk7XG5cdH1cblxuXHQvLyBDcmVhdGUgYSBuZXcgZXhhbXBsZS5cblx0Y3JlYXRlKG5hbWUsIGNvZGUgPSBcIlwiKSB7XG5cdFx0Ly8gSWYgbm8gbmFtZSwgcHJvbXB0LlxuXHRcdGlmICghbmFtZSkgbmFtZSA9IHByb21wdChcIk5hbWUgZm9yIHRoaXMgZXhhbXBsZT9cIik7XG5cdFx0Ly8gRm9yZ2V0IGl0IGlmIG5vIG5hbWUuXG5cdFx0aWYgKCFuYW1lKSByZXR1cm47XG5cblx0XHR0aGlzLnVwZGF0ZShuYW1lLCBjb2RlKTtcblx0fVxuXG5cdC8vIFJlbmFtZSBhbiBleGFtcGxlLlxuXHQvLyBTZWxlY3RzIGFuZCBzYXZlcyBhdXRvbWF0aWNhbGx5LlxuXHRyZW5hbWUob2xkTmFtZSA9IHRoaXMuc2VsZWN0ZWQsIG5ld05hbWUpIHtcblx0XHQvLyBJZiBubyBuZXcgbmFtZSwgcHJvbXB0LlxuXHRcdGlmICghbmV3TmFtZSkgbmV3TmFtZSA9IHByb21wdChcIk5ldyBuYW1lIGZvciB0aGlzIGV4YW1wbGU/XCIsIG9sZE5hbWUpO1xuXG5cdFx0Ly8gRm9yZ2V0IGl0IGlmIG5vIG5hbWUgc3VwcGxpZWQgb3IgbmFtZSBpcyB0aGUgc2FtZVxuXHRcdGlmICghbmV3TmFtZSB8fCBuZXdOYW1lID09PSBvbGROYW1lKSByZXR1cm47XG5cdFx0aWYgKHRoaXMuZXhhbXBsZXNbbmV3TmFtZV0pIHJldHVybiBjb25zb2xlLndhcm4oYGV4YW1wbGVzLnJlbmFtZShcIiR7bmV3TmFtZX1cIik6IG5hbWUgYWxyZWFkeSBpbiB1c2VgKTtcblxuXHRcdGxldCBjb2RlID0gdGhpcy5leGFtcGxlc1tvbGROYW1lXTtcblx0XHR0aGlzLmRlbGV0ZShvbGROYW1lKTtcblx0XHR0aGlzLnVwZGF0ZShuZXdOYW1lLCBjb2RlKTtcblx0fVxuXG5cdC8vIER1cGxpY2F0ZSBhbiBleGFtcGxlLlxuXHRkdXBsaWNhdGUob2xkTmFtZSA9IHRoaXMuc2VsZWN0ZWQsIG5ld05hbWUpIHtcblx0XHQvLyBJZiBubyBuZXcgbmFtZSwgcHJvbXB0LlxuXHRcdGlmICghbmV3TmFtZSkgbmV3TmFtZSA9IHByb21wdChcIk5ldyBuYW1lIGZvciBkdXBsaWNhdGUgZXhhbXBsZT9cIiwgb2xkTmFtZSk7XG5cdFx0Ly8gRm9yZ2V0IGl0IGlmIG5vIG5hbWUgc3VwcGxpZWQgb3IgbmFtZSBpcyB0aGUgc2FtZVxuXHRcdGlmICghbmV3TmFtZSB8fCBuZXdOYW1lID09PSBvbGROYW1lKSByZXR1cm47XG5cdFx0aWYgKHRoaXMuZXhhbXBsZXNbbmV3TmFtZV0pIHJldHVybiBjb25zb2xlLndhcm4oYGV4YW1wbGVzLnJlbmFtZShcIiR7bmV3TmFtZX1cIik6IG5hbWUgYWxyZWFkeSBpbiB1c2VgKTtcblxuXHRcdHRoaXMudXBkYXRlKG5ld05hbWUsIHRoaXMuY29kZSk7XG5cdH1cblxuXHQvLyBDb21waWxlIHRoZSBjdXJyZW50IGV4YW1wbGUsIHBsYWNpbmcgaXQgaW4gb3VyIGBvdXRwdXRgLlxuLy9UT0RPOiBzb21lIHdheSB0byBkbyB0aGlzIGF1dG9tYXRpY2FsbHkgdy8gXCJvdXRwdXRcIiA/XG5cdGNvbXBpbGUoKSB7XG5cdFx0dGhpcy5vdXRwdXQgPSBcIi4uLmNvbXBpbGluZy4uLlwiO1xuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0bGV0IHJlc3VsdCA9IHBhcnNlci5wYXJzZShcInN0YXRlbWVudHNcIiwgdGhpcy5jb2RlKTtcblx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihcIkNhbid0IHBhcnNlIVwiKTtcblx0XHRcdFx0dGhpcy5vdXRwdXQgPSBcIkNhbid0IHBhcnNlIHN0YXRlbWVudHNcIjtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmluZm8oXCJSZXN1bHRcIiwgcmVzdWx0KTtcblx0XHRcdFx0dGhpcy5vdXRwdXQgPSByZXN1bHQudG9Tb3VyY2UocGFyc2VyKTtcblx0XHRcdH1cblx0XHR9LCAxMDApO1xuXHR9XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hcHAvRXhhbXBsZVN0b3JlLmpzIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0xMTU3NTkwMjhcbnZhciBnbG9iYWwgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lk1hdGggPT0gTWF0aFxuICA/IHdpbmRvdyA6IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnICYmIHNlbGYuTWF0aCA9PSBNYXRoID8gc2VsZlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3LWZ1bmNcbiAgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuaWYgKHR5cGVvZiBfX2cgPT0gJ251bWJlcicpIF9fZyA9IGdsb2JhbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZ2xvYmFsLmpzXG4vLyBtb2R1bGUgaWQgPSA0OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vXG4vLyAgPFNwYWNlcj4gY29tcG9uZW50IGZvciB1c2Ugd2l0aCBvYWsuXG4vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSBcInByb3AtdHlwZXNcIjtcbmltcG9ydCB7IGNsYXNzTmFtZXMgfSBmcm9tIFwiLi91dGlsXCI7XG5cbmltcG9ydCBcIi4vU3BhY2VyLmxlc3NcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU3BhY2VyKHByb3BzKSB7XG4gIGNvbnN0IHtcbiAgICBjbGFzc05hbWUsXG4gICAgYXBwZWFyYW5jZSwgc2l6ZSwgd2lkdGgsIGhlaWdodCxcbiAgICBpbmxpbmUsIGZsdWlkLCB0aW55LCBzbWFsbCwgbWVkaXVtLCBsYXJnZSwgaHVnZSwgbWFzc2l2ZVxuICB9ID0gcHJvcHM7XG5cbiAgY29uc3Qgc3BhY2VyUHJvcHMgPSB7XG4gICAgY2xhc3NOYW1lOiBjbGFzc05hbWVzKGNsYXNzTmFtZSwgXCJvYWtcIiwgc2l6ZSwgYXBwZWFyYW5jZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgeyBpbmxpbmUsIGZsdWlkIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3BhY2VyXCIpLFxuICAgIHN0eWxlOiB7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICB9XG4gIH1cblxuICByZXR1cm4gPGRpdiB7Li4uc3BhY2VyUHJvcHN9Lz47XG59XG5cblNwYWNlci5wcm9wVHlwZXMgPSB7XG4gIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgYXBwZWFyYW5jZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgc2l6ZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIsXG4gIGhlaWdodDogUHJvcFR5cGVzLm51bWJlcixcblxuICBpbmxpbmU6IFByb3BUeXBlcy5ib29sLFxuICBmbHVpZDogUHJvcFR5cGVzLmJvb2wsXG5cbn07XG5cblNwYWNlci5kZWZhdWx0UHJvcHMgPSB7XG4gIHNpemU6IFwibWVkaXVtXCJcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hcHAvU3BhY2VyLmpzeCIsImltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBwcm9wVHlwZXMgZnJvbSBcInByb3AtdHlwZXNcIjtcbmltcG9ydCB7IFRleHRBcmVhIH0gZnJvbSAnc2VtYW50aWMtdWktcmVhY3QnXG5cbi8vXG4vL1x0IyA8VGFiYmFibGVUZXh0QXJlYT4gLS0gPFNVSS5UZXh0QXJlYT4gaW4gd2hpY2ggeW91IGNhbiB0eXBlIGEgdGFiIGNoYXJhY3Rlcjpcbi8vXHQtIElmIG5vdGhpbmcgaXMgc2VsZWN0ZWQsIGluc2VydHMgYSB0YWIgY2hhcmFjdGVyXG4vL1x0LSBJZiBhbnl0aGluZyBpcyBzZWxlY3RlZCwgaW5zZXJ0cyB0YWIgY2hhcmFjdGVycyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lKHMpXG4vL1x0LSBJZiBzaGlmdCBrZXkgaXMgZG93biwgaW5zZXJ0cyB0YWIgY2hhcmFjdGVycyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lKHMpLlxuLy9cbi8vXHQjIyMgUHJvcGVydGllc1xuLy9cdC0gYHNhdmVgIChyZXF1aXJlZCkgLS0gZnVuY3Rpb24gdXNlZCB0byBzYXZlIHRoZSByZXN1bHRzIG9uIGtleXByZXNzXG4vL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFiYmFibGVUZXh0QXJlYSBleHRlbmRzIFRleHRBcmVhIHtcblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiA8VGV4dEFyZWEgey4uLnRoaXMucHJvcHN9IG9uS2V5RG93bj17dGhpcy5vbktleURvd259IC8+O1xuXHR9XG5cblx0Ly8gRG8gTk9UIGV4aXQgb24gdGFiIC0tIGluc2VydCBvciByZW1vdmUgdGFiKHMpIHZhbHVlIGluc3RlYWQuXG5cdG9uS2V5RG93biA9IChldmVudCkgPT4ge1xuXG4vL1RPRE8gZmlyZSBgdGhpcy5wcm9wcy5vbktleURvd25gIGlmIGRlZmluZWQuLi5cblx0XHQvLyBGb3JnZXQgaXQgaWYgbm90IGEgdGFiXG5cdFx0aWYgKGV2ZW50LmtleUNvZGUgIT09IDkpIHJldHVybjtcblxuXHRcdC8vIHByZXZlbnQgZGVmYXVsdCBzbyB3ZSBkb24ndCBleGl0IHRoZSBmaWVsZFxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHQvLyBmaWd1cmUgb3V0IHRoZSB0ZXh0IHJhbmdlXG5cdFx0dmFyIGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG5cdFx0dmFyIHRleHQgPSBlbGVtZW50LnZhbHVlO1xuXHRcdHZhciBzdGFydCA9IGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7XG5cdFx0dmFyIGVuZCA9IGVsZW1lbnQuc2VsZWN0aW9uRW5kO1xuXG5cdFx0Ly8gUmVwbGFjZW1lbnQgdGV4dFxuXHRcdGxldCBuZXdUZXh0ID0gXCJcIiwgc2VsZWN0aW9uU3RhcnQgPSBzdGFydCwgc2VsZWN0aW9uRW5kID0gZW5kO1xuXG5cdFx0Ly8gSWYgc2VsZWN0aW9uIGlzIGVtcHR5LFxuXHRcdGlmIChzdGFydCA9PT0gZW5kICYmICFldmVudC5zaGlmdEtleSkge1xuXHRcdFx0bmV3VGV4dCA9IFwiXFx0XCI7XG5cdFx0XHRzZWxlY3Rpb25TdGFydCA9IHNlbGVjdGlvbkVuZCA9IGVuZCArIDE7XG5cdFx0fVxuXHRcdC8vIG90aGVyd2lzZSBpbmRlbnQvZGUtaW5kZW50IGFsbCBvZiB0aGUgbGluZXNcblx0XHRlbHNlIHtcblx0XHQvLyB1c2Ugc3RhcnQgYW5kIGVuZCBvZiBsaW5lKHMpXG4vL2NvbnNvbGUuaW5mbyhgc3RhcnQ6ICR7c3RhcnR9IDoke3RleHRbc3RhcnRdfTogICBlbmQ6ICR7ZW5kfSA6ICR7dGV4dFtlbmRdfTpgKTtcblx0XHRcdGlmICh0ZXh0W3N0YXJ0XSAhPT0gXCJcXG5cIikgc3RhcnQgPSB0ZXh0Lmxhc3RJbmRleE9mKFwiXFxuXCIsIHN0YXJ0KSArIDE7XG5cdFx0XHRpZiAodGV4dFtlbmQtMV0gPT09IFwiXFxuXCIpIGVuZC0tO1xuXHRcdFx0ZWxzZSBpZiAodGV4dFtlbmQrMV0gIT09IFwiXFxuXCIpIGVuZCA9IHRleHQuaW5kZXhPZihcIlxcblwiLCBlbmQpIC0gMTtcbi8vY29uc29sZS5pbmZvKGBzdGFydDogJHtzdGFydH0gOiR7dGV4dFtzdGFydF19OiAgIGVuZDogJHtlbmR9IDogJHt0ZXh0W2VuZF19OmApO1xuXG5cdFx0XHRsZXQgbGluZXMgPSB0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpLnNwbGl0KFwiXFxuXCIpO1xuXHRcdFx0Ly8gaWYgc2hpZnQga2V5IGlzIGRvd24sIFJFTU9WRSBhIHRhYiBmcm9tIGVhY2ggbGluZVxuXHRcdFx0aWYgKGV2ZW50LnNoaWZ0S2V5KSB7XG5cdFx0XHRcdGxpbmVzID0gbGluZXMubWFwKGxpbmUgPT4gbGluZVswXSA9PT0gXCJcXHRcIiA/IGxpbmUuc3Vic3RyKDEpIDogbGluZSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBvdGhlcndpc2UgQUREIGEgdGFiIHRvIGVhY2ggbGluZVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGxpbmVzID0gbGluZXMubWFwKGxpbmUgPT4gXCJcXHRcIiArIGxpbmUpO1xuXHRcdFx0fVxuXHRcdFx0c2VsZWN0aW9uU3RhcnQgPSBzdGFydDtcblx0XHRcdG5ld1RleHQgPSBsaW5lcy5qb2luKFwiXFxuXCIpO1xuXHRcdFx0c2VsZWN0aW9uRW5kID0gc2VsZWN0aW9uU3RhcnQgKyBuZXdUZXh0Lmxlbmd0aCArIDE7XG5cdFx0fVxuXG5cdFx0Ly8gVXBkYXRlIGlucHV0IHZhbHVlLlxuXHRcdGVsZW1lbnQudmFsdWUgXHQ9IHRleHQuc3Vic3RyKDAsIHN0YXJ0KVxuXHRcdFx0XHRcdFx0KyBuZXdUZXh0XG5cdFx0XHRcdFx0XHQrIHRleHQuc3Vic3RyKGVuZCk7XG5cblx0XHQvLyBVcGRhdGUgdGhlIHNlbGVjdGlvblxuXHRcdGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPSBzZWxlY3Rpb25TdGFydDtcblx0XHRlbGVtZW50LnNlbGVjdGlvbkVuZCA9IHNlbGVjdGlvbkVuZDtcblxuXHRcdC8vIERlbGVnYXRlIHRvIGBwcm9wcy5vbkNoYW5nZWAgdG8gc2F2ZSB0aGUgdmFsdWUgb3V0c2lkZSBvZiB0aGUgY29udHJvbFxuXHRcdGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB0aGlzLnByb3BzLm9uQ2hhbmdlKGV2ZW50KTtcblx0fVxuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL1RhYmJhYmxlVGV4dEFyZWEuanN4IiwiLy8gQ29tbW9uIGltcG9ydHNcbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuXG4vLyBQYXJzZXJcbmltcG9ydCBwYXJzZXIgZnJvbSBcIi4uL3J1bGVzL3NwZWxsL2luZGV4LmpzXCI7XG5cbi8vIEFwcC1zcGVjaWZpYyBpbXBvcnRzXG5pbXBvcnQgU3BlbGxFZGl0b3IgZnJvbSBcIi4vU3BlbGxFZGl0b3IuanN4XCI7XG5cbi8vIEtpY2sgb2ZmIG91ciB0b3AtbGV2ZWwgZWxlbWVudFxuUmVhY3RET00ucmVuZGVyKFxuICA8U3BlbGxFZGl0b3IgLz4sXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdC1yb290Jylcbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL2luZGV4LmpzeCIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gIFJlYWN0IFV0aWxpdHkgZnVuY3Rpb25zXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gYGNsYXNzTmFtZXNgLCBjb25jZXB0IHN0b2xlbiBmcm9tOiAgaHR0cDovL2plZHdhdHNvbi5naXRodWIuaW8vY2xhc3NuYW1lc1xuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzTmFtZXMgKC4uLmFyZ3MpIHtcbiAgcmV0dXJuIGFyZ3MubWFwKCBhcmcgPT4ge1xuICAgIGlmICghYXJnKSByZXR1cm4gXCJcIjtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSByZXR1cm4gY2xhc3NOYW1lcyguLi5hcmcpO1xuICAgIHN3aXRjaCAodHlwZW9mIGFyZykge1xuICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgY2FzZSBcInN0cmluZ1wiOiAgcmV0dXJuIGFyZztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhhcmcpLm1hcCgga2V5ID0+IGFyZ1trZXldID8ga2V5IDogXCJcIilcbiAgICAgICAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICAgICAgICAgICAgLmpvaW4oXCIgXCIpO1xuICAgIH1cbiAgfSkuZmlsdGVyKEJvb2xlYW4pXG4gICAgLmpvaW4oXCIgXCIpO1xufVxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL3V0aWwuanMiLCIvLyBNZW1vaXplL2ZvcmdldCBzZW1hbnRpY3MuXG5cbi8vIFJldHVybiBhIG1lbW9pemluZyBnZXR0ZXIgZnVuY3Rpb24uXG4vLyBURVNUTUVcbmV4cG9ydCBmdW5jdGlvbiBtZW1vaXplZChwcm9wZXJ0eSwgZ2V0dGVyKSB7XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRpZiAodGhpc1twcm9wZXJ0eV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dmFyIHZhbHVlID0gZ2V0dGVyLmFwcGx5KHRoaXMpO1xuXHRcdFx0aWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Ly8gRGVmaW5lIHNvIHRoYXQgd2UgY2FuIGJlIGRlbGV0ZWQgYW5kIHJlLWRlZmluZWQsIGJ1dCBub3Qgc2V0IG9yIGVudW1lcmF0ZWQuXG5cdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBwcm9wZXJ0eSwgeyB2YWx1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdGhpc1twcm9wZXJ0eV07XG5cdH1cbn1cblxuXG4vLyBSZXR1cm4gYSBtZW1vaXplIGZ1bmN0aW9uIGZvciB1c2UgYXMgYSBnZXR0ZXIgaW4gYSBgT2JqZWN0LmRlZmluZVByb3BlcnR5KClgXG4vLyBURVNUTUVcbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVNZW1vaXplZChwcm9wZXJ0eSwgZ2V0dGVyKSB7XG5cdHJldHVybiB7XG5cdFx0Z2V0IDogbWVtb2l6ZWQocHJvcGVydHksIGdldHRlcilcblx0fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21lbW9pemUuanMiLCIvL1xuLy9cdCMgUnVsZXMgcGFyc2luZyBqc3hcbi8vXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBUb2tlbml6ZXIgZnJvbSBcIi4uLy4uL1Rva2VuaXplclwiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVcIjtcblxuLy8gQ3JlYXRlIFwiSlNYXCIgcGFyc2VyIGNvbnRleHQuXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTmFtZShcIkpTWFwiKTtcbmV4cG9ydCBkZWZhdWx0IHBhcnNlcjtcblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICB7XG4gICAgbmFtZTogXCJqc3hcIixcbiAgICBhbGlhczogWyBcImV4cHJlc3Npb25cIiwgXCJzdGF0ZW1lbnRcIiBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBqc3hFbGVtZW50IGV4dGVuZHMgUnVsZSB7XG4gICAgICAvLyBUZXh0IHN0cmluZ3MgZ2V0IGVuY29kZWQgYXMgYHRleHRgIG9iamVjdHMgaW4gdGhlIHRva2VuIHN0cmVhbS5cbiAgICAgIHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGgpIHtcbiAgICAgICAgbGV0IHRva2VuID0gdG9rZW5zW3N0YXJ0XTtcbiAgICAgICAgaWYgKCEodG9rZW4gaW5zdGFuY2VvZiBUb2tlbml6ZXIuSlNYRWxlbWVudCkpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiB0aGlzLmNsb25lKHtcbiAgICAgICAgICBtYXRjaGVkOiB0b2tlbixcbiAgICAgICAgICBuZXh0U3RhcnQ6IHN0YXJ0ICsgMVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udmVydCBvdXIgYXR0cmlidXRlcyB0byBzb3VyY2UuXG4gICAgICAvLyBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIG5vIGF0dHJpYnV0ZXMuXG4gICAgICBhdHRyc1RvU291cmNlKGNvbnRleHQsIGpzeEVsZW1lbnQgPSB0aGlzLm1hdGNoZWQpIHtcbiAgICAgICAgbGV0IGF0dHJpYnV0ZXMgPSBqc3hFbGVtZW50LmF0dHJpYnV0ZXM7XG4gICAgICAgIGlmICghYXR0cmlidXRlcyB8fCAhYXR0cmlidXRlcy5sZW5ndGgpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICAgICAgbGV0IGF0dHJzID0gYXR0cmlidXRlcy5tYXAoICh7IG5hbWUsIHZhbHVlIH0pID0+IHtcbiAgICAgICAgICAvLyBpZiBOTyB2YWx1ZSwgYXNzdW1lIGl0J3MgYSB2YXJpYWJsZSBvZiB0aGUgc2FtZSBuYW1lXG4gICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHZhbHVlID0gbmFtZTtcbiAgICAgICAgICAvLyBpZiBpdCdzIGFuIGFycmF5LCBpdCdzIGEgc3BlbGwgZXhwcmVzc2lvbiwgcG9zc2libHkgd2l0aCBuZXN0ZWQgSlNYIGVsZW1lbnRzLi4uXG4gICAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBUb2tlbml6ZXIuSlNYRXhwcmVzc2lvbikge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmpzeEV4cHJlc3Npb25Ub1NvdXJjZShjb250ZXh0LCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGVsc2UgaWYgYSBKU1ggZWxlbWVudCwgcmVjdXJzZVxuICAgIC8vVE9ETzogaW5kZW50Li4uXG4gICAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBUb2tlbml6ZXIuSlNYRWxlbWVudCkge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1NvdXJjZShjb250ZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGlmIGEgbnVtYmVyIG9yIFRleHQgbGl0ZXJhbCwganVzdCB1c2UgaXRcblxuICAgICAgICAgIC8vIHNwZWNpYWwgY2FzZSBgY2xhc3NgIHRvIGBjbGFzc05hbWVgIGJlY2F1c2UgUmVhY3QgaXMgZWZmaW5nIHBlcnNuaWNrZXR5LlxuICAgICAgICAgIGlmIChuYW1lID09PSBcImNsYXNzXCIpIG5hbWUgPSBcImNsYXNzTmFtZVwiO1xuICAgIC8vVE9ETzogZXNjYXBlIG5hbWVzIHdoaWNoIGFyZSBpbnZhbGlkIEpTIGlkZW50aWZpZXJzXG4gICAgICAgICAgcmV0dXJuIGAke25hbWV9OiAke3ZhbHVlfWA7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBgeyAke2F0dHJzLmpvaW4oXCIsIFwiKX0gfWA7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhbiBhcnJheSB3aXRoIHNvdXJjZSBmb3IgZWFjaCBvZiBvdXIgY2hpbGRyZW4uXG4gICAgICAvLyBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIHdlIGRvbid0IGhhdmUgYW55IGNoaWxkcmVuLlxuICAgICAgY2hpbGRyZW5Ub1NvdXJjZShjb250ZXh0LCBqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIGxldCBjaGlsZHJlbiA9IGpzeEVsZW1lbnQuY2hpbGRyZW47XG4gICAgICAgIGlmICghY2hpbGRyZW4gfHwgY2hpbGRyZW4ubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcbiAgICAvL1RPRE86IGVzY2FwZSBpbm5lciBxdW90ZXMuLi5cbiAgICAgICAgICBpZiAodHlwZW9mIGNoaWxkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAvL2ZvcmdldCBpdCBpZiB3aGl0ZXNwYWNlIG9ubHkuLi4gPz8/XG4gICAgICAgICAgICBsZXQgdGV4dCA9IGNoaWxkLnRyaW0oKTtcbiAgICAgICAgICAgIGlmICghdGV4dCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJldHVybiBgXCIke3RleHR9XCJgO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBUb2tlbml6ZXIuSlNYRWxlbWVudCkge1xuICAgICAgICAgICAgbGV0IGNoaWxkU291cmNlID0gdGhpcy5qc3hFbGVtZW50VG9Tb3VyY2UoY29udGV4dCwgY2hpbGQpO1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkU291cmNlLnNwbGl0KFwiXFxuXCIpLmpvaW4oXCJcXG5cXHRcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIFRva2VuaXplci5KU1hFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5qc3hFeHByZXNzaW9uVG9Tb3VyY2UoY29udGV4dCwgY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJjaGlsZHJlblRvU291cmNlKCk6IGRvbid0IHVuZGVyc3RhbmQgY2hpbGRcIiArICBjaGlsZCk7XG4gICAgICAgIH0pXG4gICAgICAgIC8vIHJlbW92ZSB1bmRlZmluZWQvZW1wdHkgc3RyaW5nIHJ1bGVzXG4gICAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgSlNYIGV4cHJlc3Npb24gKCBgey4uLn1gICkgdG8gSlMgc291cmNlLlxuICAgICAganN4RXhwcmVzc2lvblRvU291cmNlKGNvbnRleHQsIGpzeEV4cHJlc3Npb24pIHtcbiAgICAgICAgbGV0IHRva2VucyA9IGpzeEV4cHJlc3Npb24udG9rZW5zO1xuICAgIGNvbnNvbGUuaW5mbyhqc3hFeHByZXNzaW9uLCB0b2tlbnMpO1xuICAgICAgICByZXR1cm4gXCIvXCIgKyBgKlRPRE86ICR7dG9rZW5zLmpvaW4oXCIgXCIpfSpgICsgXCIvXCI7XG4gICAgICB9XG5cbiAgICAgIGpzeEVsZW1lbnRUb1NvdXJjZShjb250ZXh0LCBqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIC8vIGdldCB0aGUgYml0cyBvZiB0aGUgb3V0cHV0XG4gICAgICAgIGxldCB0YWdOYW1lID0gYFwiJHtqc3hFbGVtZW50LnRhZ05hbWV9XCJgO1xuICAgICAgICBsZXQgYXR0cnMgPSB0aGlzLmF0dHJzVG9Tb3VyY2UoY29udGV4dCwganN4RWxlbWVudCk7XG4gICAgICAgIGxldCBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW5Ub1NvdXJjZShjb250ZXh0LCBqc3hFbGVtZW50KTtcblxuICAgICAgICBsZXQgb3V0cHV0ID0gYGNyZWF0ZUVsZW1lbnQoJHt0YWdOYW1lfWA7XG4gICAgICAgIGlmICghYXR0cnMgJiYgY2hpbGRyZW4pIGF0dHJzID0gXCJudWxsXCI7XG5cbiAgICAgICAgaWYgKGF0dHJzKSBvdXRwdXQgKz0gYCwgJHthdHRyc31gO1xuICAgICAgICBpZiAoY2hpbGRyZW4pIHtcbiAgICAgICAgICBvdXRwdXQgKz0gXCIsXFxuXFx0XCIgKyBjaGlsZHJlbi5qb2luKFwiLFxcblxcdFwiKSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0ICs9IFwiKVwiXG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuanN4RWxlbWVudFRvU291cmNlKGNvbnRleHQsIHRoaXMubWF0Y2hlZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL0pTWC5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgaWYgc3RhdGVtZW50cy5cbi8vXG5cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4uLy4uL1BhcnNlclwiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVcIjtcblxuLy8gQ3JlYXRlIFwiaWZcIiBwYXJzZXIgY29udGV4dC5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JOYW1lKFwiaWZcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwiaWZcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiaWYge2NvbmRpdGlvbjpleHByZXNzaW9ufSAodGhlbnw6KT8ge3N0YXRlbWVudH0/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlmXyBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICBsZXQgeyBjb25kaXRpb24sIHN0YXRlbWVudCwgYmxvY2sgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KTtcbiAgLy9cdFx0XHRpZiAoc3RhdGVtZW50ICYmIGJsb2NrKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJpZiBtYXkgb25seSBoYXZlIGlubGluZSBzdGF0ZW1lbnQgT1IgYmxvY2tcIik7XG4gICAgICAgIGxldCBzdGF0ZW1lbnRzID0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhzdGF0ZW1lbnQsIGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIGBpZiAoJHtjb25kaXRpb259KSAke3N0YXRlbWVudHN9YDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gTk9URTogdGhpcyBpcyBOT1QgYSBibG9jayBzdGF0ZW1lbnQuLi4gPz8/XG4gIHtcbiAgICBuYW1lOiBcImJhY2t3YXJkc19pZlwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJ7c3RhdGVtZW50fSBpZiB7Y29uZGl0aW9uOmV4cHJlc3Npb259ICg/OihlbHNlfG90aGVyd2lzZSkge2Vsc2VTdGF0ZW1lbnQ6c3RhdGVtZW50fSk/XCIsXG4gICAgbGVmdFJlY3Vyc2l2ZTogdHJ1ZSxcbiAgICB0ZXN0UnVsZTogbmV3IFJ1bGUuS2V5d29yZHMoeyBsaXRlcmFsczogWyBcImlmXCIgXSB9KSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgYmFja3dhcmRzX2lmIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IGNvbmRpdGlvbiwgc3RhdGVtZW50LCBlbHNlU3RhdGVtZW50IH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoY29udGV4dCk7XG4gICAgICAgIGxldCBvdXRwdXQgPSBgaWYgKCR7Y29uZGl0aW9ufSkgeyAke3N0YXRlbWVudH0gfWA7XG4gICAgICAgIGlmIChlbHNlU3RhdGVtZW50KSBvdXRwdXQgKz0gYFxcbmVsc2UgeyAke2Vsc2VTdGF0ZW1lbnR9IH1gXG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImVsc2VfaWZcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiKGVsc2V8b3RoZXJ3aXNlKSBpZiB7Y29uZGl0aW9uOmV4cHJlc3Npb259ICh0aGVufDopIHtzdGF0ZW1lbnR9P1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBlbHNlX2lmIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IGNvbmRpdGlvbiwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAvL1x0XHRcdGlmIChzdGF0ZW1lbnQgJiYgYmxvY2spIHRocm93IG5ldyBTeW50YXhFcnJvcihcImVsc2UgaWYgbWF5IG9ubHkgaGF2ZSBpbmxpbmUgc3RhdGVtZW50IE9SIGJsb2NrXCIpO1xuICAgICAgICBsZXQgc3RhdGVtZW50cyA9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoc3RhdGVtZW50LCBibG9jayk7XG4gICAgICAgIHJldHVybiBgZWxzZSBpZiAoJHtjb25kaXRpb259KSAke3N0YXRlbWVudHN9YFxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJlbHNlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIihlbHNlfG90aGVyd2lzZSkgKDopPyB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZWxzZV8gZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHsgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAvL1x0XHRcdGlmIChzdGF0ZW1lbnQgJiYgYmxvY2spIHRocm93IG5ldyBTeW50YXhFcnJvcihcImVsc2UgaWYgbWF5IG9ubHkgaGF2ZSBpbmxpbmUgc3RhdGVtZW50IE9SIGJsb2NrXCIpO1xuICAgICAgICBsZXQgc3RhdGVtZW50cyA9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoc3RhdGVtZW50LCBibG9jayk7XG4gICAgICAgIHJldHVybiBgZWxzZSAke3N0YXRlbWVudHN9YFxuICAgICAgfVxuICAgIH1cbiAgfVxuKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ydWxlcy9zcGVsbC9pZi5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgZGVhbGluZyB3aXRoIGxpc3RzXG4vL1xuXG4vLyBUT0RPOiBjb25maXJtIGlkZW50aWZpZXJzIGFyZSBwbHVyYWwgaW4gc29tZSBvZiB0aGUgYmVsb3c/XG4vLyBUT0RPOiBgbGlzdC5jbG9uZSgpYCB0byByZXR1cm4gbmV3IGxpc3Qgb2Ygc2FtZSB0eXBlLlxuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5cbmltcG9ydCB7IGlzUGx1cmFsLCBzaW5ndWxhcml6ZSB9IGZyb20gXCIuLi8uLi91dGlscy9zdHJpbmdcIjtcblxuLy8gQ3JlYXRlIFwibGlzdHNcIiBwYXJzZXIgY29udGV4dC5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JOYW1lKFwibGlzdHNcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cblxuLy8gV09SS0lORyBGUk9NIE9USEVSIFJVTEVTICh0ZXN0bWUpXG4vL1x0YHRoZSBsZW5ndGggb2YgPGxpc3Q+YFxuLy9cdGA8dGhpbmc+IGlzIG5vdD8gaW4gPGxpc3Q+YFxuLy9cdGA8bGlzdD4gaXMgbm90PyBlbXB0eWBcbi8vXHRgc2V0IGl0ZW0gMSBvZiBteUxpc3QgdG8gJ2EnYFxuXG5cbi8vIFRPRE86IFx0YGNyZWF0ZSBsaXN0IHdpdGggPGV4cD4sIDxleHA+LCA8ZXhwPmBcbi8vIFRPRE86XHRgZHVwbGljYXRlIGxpc3RgXG4vLyBUT0RPOlx0YGR1cGxpY2F0ZSBsaXN0IHdpdGggPGV4cD4sIDxleHA+LCA8ZXhwPmAgPz8/XG4vLyBUT0RPOlx0YHRoZSBzaXplIG9mIDxsaXN0PmAgPT4gd2lsbCBtYXAgdG8gYGxpc3Quc2l6ZWAuLi5cbi8vXHRcdFx0XHQtIGluc3RhbGwgYHNpemVgIGFzIGFuIGFsaWFzIHRvIGBsZW5ndGhgP1xuLy8gVE9ETzpcdGBtb3ZlIDx0aGluZz4gdG8gZW5kIG9mIDxsaXN0PmAgPz8/XG4vLyBUT0RPOlx0YFNldGAgZm9yIGEgdW5pcXVlIGxpc3Q/XG4vLyBUT0RPOlx0dHlwZWQgbGlzdD9cbi8vIFRPRE86XHRsaXN0IHdoaWNoIHdvbid0IHRha2UgbnVsbC91bmRlZmluZWRcblxuXG5wYXJzZXIuZGVmaW5lUnVsZXMoXG4gIC8vIFJldHVybiB0aGUgbGVuZ3RoIG9mIHRoZSBsaXN0LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2xlbmd0aFwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwidGhlPyBudW1iZXIgb2Yge2lkZW50aWZpZXJ9IGluIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfbGVuZ3RoIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IGxpc3QsIGlkZW50aWZpZXIgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KTtcbiAgLy8gVE9ETzogc3BlY2lhbCBjYXNlICd3b3JkcycsICdsaW5lcycsIGV0Y1xuICAgICAgICByZXR1cm4gYCR7bGlzdH0ubGVuZ3RoYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gUmV0dXJuIHRoZSBmaXJzdCBwb3NpdGlvbiBvZiBzcGVjaWZpZWQgaXRlbSBpbiB0aGUgbGlzdCBhcyBhbiBhcnJheS5cbiAgLy8gSWYgaXRlbSBpcyBub3QgZm91bmQsIHJldHVybnMgYHVuZGVmaW5lZGAuXG4gIC8vIE5PVEU6IHRoaXMgcG9zaXRpb24gcmV0dXJuZWQgaXMgKioxLWJhc2VkKiouXG4gIC8vVEVTVE1FXG4gIC8vIFRPRE86IGBwb3NpdGlvbnNgLCBgbGFzdCBwb3NpdGlvbmAsIGBhZnRlci4uLmBcbiAge1xuICAgIG5hbWU6IFwibGlzdF9wb3NpdGlvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwidGhlPyBwb3NpdGlvbiBvZiB7dGhpbmc6ZXhwcmVzc2lvbn0gaW4ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9wb3NpdGlvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICBsZXQgeyB0aGluZywgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnBvc2l0aW9uT2YoJHt0aGluZ30sICR7bGlzdH0pYFxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvL1xuICAvL1x0T3JkaW5hbCBudW1iZXJzIChmaXJzdCwgc2Vjb25kLCBsYXN0LCBldGMpLlxuICAvLyBUT0RPOiBzaXh0eS1maWZ0aCwgdHdvIGh1bmRyZWQgZm9ydHkgbmludGguLi5cbiAgLy9cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJmaXJzdFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gMSB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwic2Vjb25kXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAyIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJ0aGlyZFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gMyB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiZm91cnRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiA0IH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJmaWZ0aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gNSB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwic2l4dGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDYgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInNldmVudGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDcgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImVpZ2h0aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gOCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwibmludGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDkgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInRlbnRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAxMCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwicGVudWx0aW1hdGVcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIC0yIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJmaW5hbFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gLTEgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImxhc3RcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIC0xIH1cbiAgICB9XG4gIH0sXG5cblxuXG4gIC8vIHRyZWF0IGxpc3QgYXMgYSBzdGFjayBvciBxdWV1ZVxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInRvcFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gMSB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiYm90dG9tXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAtMSB9XG4gICAgfVxuICB9LFxuXG5cblxuICAvLyBJbmRleCBleHByZXNzaW9uOiBudW1lcmljIHBvc2l0aW9uIGluIHNvbWUgbGlzdC5cbiAgLy9cdGUuZy5cdGBjYXJkIDEgb2YgdGhlIHBpbGVgXG4gIC8vXHRcdFx0YGNhcmQgIzIgb2YgdGhlIHBpbGVgXG4gIC8vXHRcdFx0YHRoZSBmaXJzdCBjYXJkIG9mIHRoZSBwaWxlYFxuICAvL1xuICAvLyBOT1RFOiBOZWdhdGl2ZSBudW1lcmljIHBvc2l0aW9ucyBjb21lIGZyb20gdGhlIEVORCBvZiB0aGUgbGlzdC5cbiAgLy9cdGUuZy5cdGBjYXJkIC0xIG9mIHRoZSBwaWxlYFxuICAvL1xuICAvLyBOT1RFOiBPdXIgcG9zaXRpb25zIGFyZSAqKjEtYmFzZWQqKiBhbmQgSmF2YXNjcmlwdCBpcyAqKjAtYmFzZWQqKi5cbiAgLy9cdFx0IGUuZy4gYGl0ZW0gMSBvZiB0aGUgYXJyYXlgICA9IGBhcnJheVswXWBcbiAgLy9cbiAgLy8gVE9ETzogaWYgYGlkZW50aWZpZXJgIGlzIFwid29yZFwiLCBvdXRwdXQgYGdldFdvcmQoKWAgZXRjXG4gIC8vIFRPRE86IHNwZWNpYWwgY2FzZSAnd29yZHMnLCAnbGluZXMnLCBldGMgP1xuICB7XG4gICAgbmFtZTogXCJwb3NpdGlvbl9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJ7aWRlbnRpZmllcn0ge3Bvc2l0aW9uOmV4cHJlc3Npb259IG9mICh0aGU/KSB7ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwidGhlIHtwb3NpdGlvbjpvcmRpbmFsfSB7aWRlbnRpZmllcn0gb2YgKHRoZT8pIHtleHByZXNzaW9ufVwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcG9zaXRpb25fZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2V7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IGlkZW50aWZpZXIsIHBvc2l0aW9uLCBleHByZXNzaW9uIH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoY29udGV4dCk7XG4gICAgICAgIC8vIElmIHdlIGdvdCBhIHBvc2l0aXZlIG51bWJlciBsaXRlcmFsLCBjb21wZW5zYXRlIGZvciBKUyAwLWJhc2VkIGFycmF5cyBub3csIGZvciBuaWNlciBvdXRwdXQuXG4gICAgICAgIGlmICh0eXBlb2YgcG9zaXRpb24gPT09IFwibnVtYmVyXCIgJiYgcG9zaXRpb24gPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIGAke2V4cHJlc3Npb259WyR7cG9zaXRpb24gLSAxfV1gO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0SXRlbSgke2V4cHJlc3Npb259LCAke3Bvc2l0aW9ufSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFBpY2sgYSBTSU5HTEUgcmFuZG9tIGl0ZW0gZnJvbSB0aGUgbGlzdC5cbiAgLy8gVE9ETzogY29uZmlybSBpZGVudGlmaWVyIGlzIHBsdXJhbD9cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmFuZG9tX3Bvc2l0aW9uX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcImEgcmFuZG9tIHtpZGVudGlmaWVyfSAob2Z8ZnJvbXxpbikgKHRoZSk/IHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJhbmRvbV9wb3NpdGlvbl9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IGxpc3QgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5kb21JdGVtT2YoJHtsaXN0fSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBQaWNrIGEgdW5pcXVlIHNldCBvZiByYW5kb20gaXRlbXMgZnJvbSB0aGUgbGlzdCwgcmV0dXJuaW5nIGFuIGFycmF5LlxuICAvLyBUT0RPOiBgdHdvIHJhbmRvbSBpdGVtcy4uLmBcbiAgLy8gVE9ETzogY29uZmlybSBpZGVudGlmaWVyIGlzIHBsdXJhbD9cbiAgLy8gVE9ETzogYGxpc3QuY2xvbmUoKWAgdG8gcmV0dXJuIG5ldyBsaXN0IG9mIHNhbWUgdHlwZS5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmFuZG9tX3Bvc2l0aW9uc19leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7bnVtYmVyfSByYW5kb20ge2lkZW50aWZpZXJ9IChvZnxmcm9tfGluKSAodGhlKT8ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZG9tX3Bvc2l0aW9uc19leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IG51bWJlciwgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldFJhbmRvbUl0ZW1zT2YoJHtsaXN0fSwgJHtudW1iZXJ9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gUmFuZ2UgZXhwcmVzc2lvbi5cbiAgLy8gUmV0dXJucyBhIG5ldyBsaXN0LlxuICAvLyBOT1RFOiBgc3RhcnRgIGlzICoqMS1iYXNlZCoqLlxuICAvLyBOT1RFOiBgZW5kYCBpcyBpbmNsdXNpdmUhXG4gIC8vIFRPRE86IGNvbmZpcm0gaWRlbnRpZmllciBpcyBwbHVyYWw/XG4gIC8vIFRPRE86IGBsaXN0LmNsb25lKClgIHRvIHJldHVybiBuZXcgbGlzdCBvZiBzYW1lIHR5cGUuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcInJhbmdlX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIntpZGVudGlmaWVyfSB7c3RhcnQ6ZXhwcmVzc2lvbn0gdG8ge2VuZDpleHByZXNzaW9ufSBvZiB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5nZV9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IHN0YXJ0LCBlbmQsIGxpc3QgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5nZSgke2xpc3R9LCAke3N0YXJ0fSwgJHtlbmR9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFN0YXJ0aW5nIHJhbmdlIGV4cHJlc3Npb24uXG4gIC8vIFJldHVybnMgYSBuZXcgbGlzdC5cbiAgLy8gZS5nLlx0YGZpcnN0IDQgaXRlbXMgb2YgbGlzdGBcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwiZmlyc3RfaW5fcmFuZ2VcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcImZpcnN0IHtudW1iZXI6ZXhwcmVzc2lvbn0ge2lkZW50aWZpZXJ9IChpbnxvZikge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICBsZXQgeyBudW1iZXIsIGxpc3QgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5nZSgke2xpc3R9LCAxLCAke251bWJlcn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gRW5kaW5nIHJhbmdlIGV4cHJlc3Npb24uXG4gIC8vIFJldHVybnMgYSBuZXcgbGlzdC5cbiAgLy8gZS5nLlx0YGxhc3QgNCBpdGVtcyBvZiBsaXN0YFxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsYXN0X2luX3JhbmdlXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJsYXN0IHtudW1iZXI6ZXhwcmVzc2lvbn0ge2lkZW50aWZpZXJ9IChpbnxvZikge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICBsZXQgeyBudW1iZXIsIGxpc3QgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRFbmRSYW5nZSgke2xpc3R9LCAxLCAke251bWJlcn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBSYW5nZSBleHByZXNzaW9uIHN0YXJ0aW5nIGF0IHNvbWUgaXRlbSBpbiB0aGUgbGlzdC5cbiAgLy8gUmV0dXJucyBhIG5ldyBsaXN0LlxuICAvLyBJZiBpdGVtIGlzIG5vdCBmb3VuZCwgcmV0dXJucyBhbiBlbXB0eSBsaXN0LiAoPz8/KVxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJyYW5nZV9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7aWRlbnRpZmllcn0gKGlufG9mKSB7bGlzdDpleHByZXNzaW9ufSBzdGFydGluZyB3aXRoIHt0aGluZzpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5nZV9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBsaXN0IH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoY29udGV4dCk7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0UmFuZ2UoJHtsaXN0fSwgc3BlbGwucG9zaXRpb25PZigke3RoaW5nfSwgJHtsaXN0fSkpYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBMaXN0IGZpbHRlci5cbiAgLy8gTk9URTogd2Ugd2lsbCBzaW5ndWxhcml6ZSBgaWRlbnRpZmllcmAgYW5kIHVzZSB0aGF0IGFzIHRoZSBhcmd1bWVudCB0byBgZXhwcmVzc2lvbmAuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfZmlsdGVyXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7aWRlbnRpZmllcn0gKGlufG9mKSB7bGlzdDpleHByZXNzaW9ufSB3aGVyZSB7Y29uZGl0aW9uOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfZmlsdGVyIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IGlkZW50aWZpZXIsIGNvbmRpdGlvbiwgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICAvLyB1c2Ugc2luZ3VsYXIgb2YgaWRlbnRpZmllciBmb3IgbWV0aG9kIGFyZ3VtZW50XG4gICAgICAgIGxldCBhcmd1bWVudCA9IHNpbmd1bGFyaXplKGlkZW50aWZpZXIudG9Tb3VyY2UoY29udGV4dCkpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmZpbHRlcigke2xpc3R9LCAke2FyZ3VtZW50fSA9PiAke2NvbmRpdGlvbn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBTZXQgbWVtYmVyc2hpcCAobGVmdCByZWN1cnNpdmUpLlxuICAvLyBOT1RFOiB3ZSB3aWxsIHNpbmd1bGFyaXplIGBpZGVudGlmaWVyYCBhbmQgdXNlIHRoYXQgYXMgdGhlIGFyZ3VtZW50IHRvIGBleHByZXNzaW9uYC5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9tZW1iZXJzaGlwX3Rlc3RcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIntsaXN0OmV4cHJlc3Npb259IChvcGVyYXRvcjpoYXN8aGFzIG5vfGRvZXNudCBoYXZlfGRvZXMgbm90IGhhdmUpIHtpZGVudGlmaWVyfSB3aGVyZSB7ZmlsdGVyOmV4cHJlc3Npb259XCIsXG4gICAgbGVmdFJlY3Vyc2l2ZTogdHJ1ZSxcbiAgICB0ZXN0UnVsZTogbmV3IFJ1bGUuS2V5d29yZHMoeyBtYXRjaDogXCJ3aGVyZVwiIH0pLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X21lbWJlcnNoaXBfdGVzdCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyLCBvcGVyYXRvciwgZmlsdGVyLCBsaXN0IH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoY29udGV4dCk7XG4gICAgICAgIGxldCBiYW5nID0gb3BlcmF0b3IgPT09IFwiaGFzXCIgPyBcIlwiIDogXCIhXCI7XG4gICAgICAgIC8vIHVzZSBzaW5ndWxhciBvZiBpZGVudGlmaWVyIGZvciBtZXRob2QgYXJndW1lbnRcbiAgICAgICAgbGV0IGFyZ3VtZW50ID0gc2luZ3VsYXJpemUoaWRlbnRpZmllci50b1NvdXJjZShjb250ZXh0KSk7XG4gICAgICAgIHJldHVybiBgJHtiYW5nfXNwZWxsLmFueSgke2xpc3R9LCAke2FyZ3VtZW50fSA9PiAke2ZpbHRlcn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy9cbiAgLy9cdEFkZGluZyB0byBsaXN0IChpbi1wbGFjZSlcbiAgLy9cblxuICAvLyBBZGQgdG8gZW5kIG9mIGxpc3QuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfYXBwZW5kXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImFwcGVuZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwiYWRkIHt0aGluZzpleHByZXNzaW9ufSB0byAoKHRoZT8pIGVuZCBvZik/IHtsaXN0OmV4cHJlc3Npb259XCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X2FwcGVuZCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICBsZXQgeyB0aGluZywgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmFwcGVuZCgke2xpc3R9LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBBZGQgdG8gYmVnaW5uaW5nIG9mIGxpc3QuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcHJlcGVuZFwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJwcmVwZW5kIHt0aGluZzpleHByZXNzaW9ufSB0byB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgICAgXCJhZGQge3RoaW5nOmV4cHJlc3Npb259IHRvIHRoZSAoc3RhcnR8ZnJvbnR8dG9wKSBvZiB7bGlzdDpleHByZXNzaW9ufVwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9wcmVwZW5kIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBsaXN0IH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoY29udGV4dCk7XG4gICAgICAgIHJldHVybiBgc3BlbGwucHJlcGVuZCgke2xpc3R9LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBBZGQgdG8gbWlkZGxlIG9mIGxpc3QsIHB1c2hpbmcgZXhpc3RpbmcgaXRlbXMgb3V0IG9mIHRoZSB3YXkuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfYWRkX2F0XCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn0gYXQgcG9zaXRpb24ge3Bvc2l0aW9uOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3Rfc3BsaWNlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBwb3NpdGlvbiwgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnNwbGljZSgke2xpc3R9LCAke3Bvc2l0aW9ufSwgJHt0aGluZ30pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBUT0RPOiAgXHRcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn0gYmVmb3JlIHtpdGVtOmV4cHJlc3Npb259XCIsXG5cbiAgLy8gQWRkIHRvIG1pZGRsZSBvZiBsaXN0LCBwdXNoaW5nIGV4aXN0aW5nIGl0ZW1zIG91dCBvZiB0aGUgd2F5LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2FkZF9hZnRlclwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJhZGQge3RoaW5nOmV4cHJlc3Npb259IHRvIHtsaXN0OmV4cHJlc3Npb259IGFmdGVyIHtpdGVtOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfYWRkX2FmdGVyIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBpdGVtLCBsaXN0IH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoY29udGV4dCk7XG4gICAgICAgIHJldHVybiBgc3BlbGwuc3BsaWNlKCR7bGlzdH0sIHNwZWxsLnBvc2l0aW9uT2YoJHtsaXN0fSwgJHtpdGVtfSksICR7dGhpbmd9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vXG4gIC8vXHRSZW1vdmluZyBmcm9tIGxpc3QgKGluLXBsYWNlKVxuICAvL1xuXG4gIC8vIEVtcHR5IGxpc3QuXG4gIC8vVE9ETzogbWFrZSBgZW1wdHlgIGFuZC9vciBgY2xlYXJgIGEgZ2VuZXJpYyBzdGF0ZW1lbnQ/Pz9cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9lbXB0eVwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCIoZW1wdHl8Y2xlYXIpIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfZW1wdHkgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHsgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmNsZWFyKCR7bGlzdH0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gUmVtb3ZlIG9uZSBpdGVtIGZyb20gbGlzdCBieSBwb3NpdGlvbi5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9yZW1vdmVfcG9zaXRpb25cIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwicmVtb3ZlIHtpZGVudGlmaWVyfSB7bnVtYmVyOmV4cHJlc3Npb259IG9mIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcmVtb3ZlX3Bvc2l0aW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IG51bWJlciwgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnJlbW92ZUl0ZW0oJHtsaXN0fSwgJHtudW1iZXJ9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFJlbW92ZSByYW5nZSBvZiB0aGluZ3MgZnJvbSBsaXN0LlxuICAvLyBOT1RFOiBgc3RhcnRgIGlzICoqMS1iYXNlZCoqLlxuICAvLyBOT1RFOiBgZW5kYCBpcyBpbmNsdXNpdmUhXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcmVtb3ZlX3JhbmdlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJlbW92ZSB7aWRlbnRpZmllcn0ge3N0YXJ0OmV4cHJlc3Npb259IHRvIHtlbmQ6ZXhwcmVzc2lvbn0gb2Yge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9yZW1vdmVfcG9zaXRpb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHsgc3RhcnQsIGVuZCwgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnJlbW92ZVJhbmdlKCR7bGlzdH0sICR7c3RhcnR9LCAke2VuZH0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBSZW1vdmUgYWxsIGluc3RhbmNlcyBvZiBzb21ldGhpbmcgZnJvbSBhIGxpc3QuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcmVtb3ZlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJlbW92ZSB7dGhpbmc6ZXhwcmVzc2lvbn0gZnJvbSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3JlbW92ZSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICBsZXQgeyB0aGluZywgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnJlbW92ZSgke2xpc3R9LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBSZW1vdmUgYWxsIGl0ZW1zIGZyb20gbGlzdCB3aGVyZSBjb25kaXRpb24gaXMgdHJ1ZS5cbiAgLy8gTk9URTogd2Ugd2lsbCBzaW5ndWxhcml6ZSBgaWRlbnRpZmllcmAgYW5kIHVzZSB0aGF0IGFzIHRoZSBhcmd1bWVudCB0byBgZXhwcmVzc2lvbmAuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcmVtb3ZlX3doZXJlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJlbW92ZSB7aWRlbnRpZmllcn0gKGlufG9mfGZyb20pIHtsaXN0OmV4cHJlc3Npb259IHdoZXJlIHtjb25kaXRpb246ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9yZW1vdmVfd2hlcmUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHsgaWRlbnRpZmllciwgY29uZGl0aW9uLCBsaXN0IH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoY29udGV4dCk7XG4gICAgICAgIC8vIHVzZSBzaW5ndWxhciBvZiBpZGVudGlmaWVyIGZvciBtZXRob2QgYXJndW1lbnRcbiAgICAgICAgbGV0IGFyZ3VtZW50ID0gc2luZ3VsYXJpemUoaWRlbnRpZmllci50b1NvdXJjZShjb250ZXh0KSk7XG4gICAgICAgIHJldHVybiBgc3BlbGwucmVtb3ZlV2hlcmUoJHtsaXN0fSwgJHthcmd1bWVudH0gPT4gJHtjb25kaXRpb259KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy9cbiAgLy9cdFJhbmRvbSAoaW4tcGxhY2UpIGxpc3QgbWFuaXB1bGF0aW9uLlxuICAvL1xuXG4gIC8vIFJldmVyc2UgbGlzdCBpbi1wbGFjZS5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9yZXZlcnNlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJldmVyc2Uge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9yZXZlcnNlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IGxpc3QgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5yZXZlcnNlKCR7bGlzdH0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gU2h1ZmZsZSBsaXN0IGluLXBsYWNlLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3NodWZmbGVcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiKHJhbmRvbWl6ZXxzaHVmZmxlKSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3NodWZmbGUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHsgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnNodWZmbGUoJHtsaXN0fSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIEl0ZXJhdGlvblxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2l0ZXJhdGlvblwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJmb3IgKGVhY2gpPyB7aXRlbVZhcjppZGVudGlmaWVyfSBpbiB7bGlzdDpleHByZXNzaW9ufTo/IHtzdGF0ZW1lbnR9P1wiLFxuICAgICAgXCJmb3IgKGVhY2gpPyB7aXRlbVZhcjppZGVudGlmaWVyfSAoYW5kfCwpIHtwb3NpdGlvblZhcjppZGVudGlmaWVyfSBpbiB7bGlzdDpleHByZXNzaW9ufTo/IHtzdGF0ZW1lbnR9P1wiLFxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfaXRlcmF0aW9uIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IGl0ZW1WYXIsIHBvc2l0aW9uVmFyLCBsaXN0LCBzdGF0ZW1lbnQsIGJsb2NrIH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoY29udGV4dCk7XG4gICAgICAgIGxldCBvdXRwdXQ7XG4gICAgICAgIGlmIChwb3NpdGlvblZhcikge1xuICAgICAgICAgIG91dHB1dCA9IGBmb3IgKGxldCAke3Bvc2l0aW9uVmFyfSA9IDEsIGJhcjsgJHtpdGVtVmFyfSA9ICR7bGlzdH1bJHtwb3NpdGlvblZhcn0tMV0sICR7cG9zaXRpb25WYXJ9IDw9ICR7bGlzdH0ubGVuZ3RoOyAke3Bvc2l0aW9uVmFyfSsrKSBgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gTk9URTogdGhpcyBpcyByZWxhdGl2ZWx5IHNsb3cuLi4gIHByb2JhYmx5IGRvZXNuJ3QgbWF0dGVyLi4uXG4gICAgICAgICAgb3V0cHV0ID0gYGZvciAobGV0ICR7aXRlbVZhcn0gb2YgJHtsaXN0fSkgYDtcbiAgICAgICAgfVxuICAgICAgICBvdXRwdXQgKz0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhzdGF0ZW1lbnQsIGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBSYW5nZVxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJyYW5nZV9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJyYW5nZSB7c3RhcnQ6ZXhwcmVzc2lvbn0gdG8ge2VuZDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5nZV9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IHN0YXJ0LCBlbmQgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5nZSgke3N0YXJ0fSwgJHtlbmR9KWA7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL2xpc3RzLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBpbmZpeCBhbmQgcHJlZml4IG9wZXJhdG9ycy5cbi8vXG5cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4uLy4uL1BhcnNlclwiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVcIjtcblxuLy8gQ3JlYXRlIFwib3BlcmF0b3JzXCIgcGFyc2VyIGNvbnRleHQuXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTmFtZShcIm9wZXJhdG9yc1wiKTtcbmV4cG9ydCBkZWZhdWx0IHBhcnNlcjtcblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICAvLyBUT0RPOlxuICAvLyBcdC8vIEZpbmQgYmVzdCBtYXRjaCBhY2NvcmRpbmcgdG8gb3BlcmF0b3IgcHJlY2VkZW5jZSBhcyBkZWZpbmVkIGJlbG93LlxuICAvLyBcdGdldEJlc3RNYXRjaChtYXRjaGVzKSB7XG4gIC8vIFx0XHRjb25zb2xlLndhcm4oXCJHQk1cIiwgbWF0Y2hlcywgbWF0Y2hlcy5tYXAobWF0Y2ggPT4gbWF0Y2gucHJlY2VkZW5jZSksIG1hdGNoZXMubWFwKG1hdGNoID0+IG1hdGNoLm1hdGNoZWRUZXh0KSk7XG4gIC8vIFx0XHRyZXR1cm4gbWF0Y2hlcy5yZWR1Y2UoZnVuY3Rpb24gKGJlc3QsIG5leHQpIHtcbiAgLy8gXHRcdFx0Ly8gdGFrZSBoaWdoZXN0IHByZWNlZGVuY2UgbWF0Y2ggZmlyc3RcbiAgLy8gXHRcdFx0aWYgKG5leHQucHJlY2VkZW5jZSA+IGJlc3QucHJlY2VkZW5jZSkgcmV0dXJuIG5leHQ7XG4gIC8vIFx0XHRcdC8vIHRha2UgbG9uZ2VzdCBtYXRjaCBpZiBzYW1lIHByZWNlZGVuY2VcbiAgLy8gXHRcdFx0aWYgKG5leHQucHJlY2VkZW5jZSA9PT0gYmVzdC5wcmVjZWRlbmNlKSB7XG4gIC8vIFx0XHRcdFx0aWYgKG5leHQuZW5kSW5kZXggPiBiZXN0LmVuZEluZGV4KSByZXR1cm4gbmV4dDtcbiAgLy8gXHRcdFx0fVxuICAvLyBcdFx0XHRyZXR1cm4gYmVzdDtcbiAgLy8gXHRcdH0sIG1hdGNoZXNbMF0pO1xuICAvLyBcdH1cblxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIntsaHM6ZXhwcmVzc2lvbn0ge29wZXJhdG9yOmluZml4X29wZXJhdG9yfSB7cmhzOmV4cHJlc3Npb259XCIsXG4gICAgbGVmdFJlY3Vyc2l2ZTogdHJ1ZSxcbiAgICB0ZXN0UnVsZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpbmZpeF9vcGVyYXRvcl9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IGxocywgcmhzLCBvcGVyYXRvciB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gb3BlcmF0b3IuYXBwbHkobGhzLnRvU291cmNlKGNvbnRleHQpLCByaHMudG9Tb3VyY2UoY29udGV4dCkpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyMjIEluZml4IG9wZXJhdG9yczogICBge2xoc30gPG9wZXJhdG9yPiB7cmhzfWAsIGVnOiBgYSBpcyAxYFxuICAvLyBOT1RFOiBgb3BlcmF0b3IuYXBwbHlgIE1VU1QgcmV0dXJuIGEgZnVuY3Rpb24gd2hpY2ggdHJhbnNmb3JtcyB0d28gYXJndW1lbnRzIChgbGhzYCBhbmQgYHJoc2ApIGludG8gb3V0cHV0LlxuICAvLyBOT1RFOiBgcHJlY2VkZW5jZWAgbnVtYmVycyBjb21lIGZyb20gSmF2YXNjcmlwdCBlcXVpdmFsZW50c1xuICAvL1x0XHQgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvT3BlcmF0b3JzL09wZXJhdG9yX1ByZWNlZGVuY2VcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiA2LFxuICAgIHN5bnRheDogXCJhbmRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgYW5kIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuIGAoJHthfSAmJiAke2J9KWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDUsXG4gICAgc3ludGF4OiBcIm9yXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuIGAoJHthfSB8fCAke2J9KWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEwLFxuICAgIHN5bnRheDogXCJpc1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpcyBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybiBgKCR7YX0gPT0gJHtifSlgIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMCxcbiAgICBzeW50YXg6IFwiaXMgbm90XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX25vdCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybiBgKCR7YX0gIT0gJHtifSlgIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMCxcbiAgICBzeW50YXg6IFwiaXMgZXhhY3RseVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19leGFjdGx5IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuIGAoJHthfSA9PT0gJHtifSlgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTAsXG4gICAgc3ludGF4OiBcImlzIG5vdCBleGFjdGx5XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX25vdF9leGFjdGx5IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuIGAoJHthfSAhPT0gJHtifSlgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy9UT0RPOiBgc3BlbGwuaXNPZlR5cGUodGhpbmcsIHR5cGUpYFxuICAvL1RPRE86IGBpcyBzYW1lIHR5cGUgYXNgID9cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgYVwiLFxuICAgICAgXCJpcyBhblwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfYSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkodGhpbmcsIHR5cGUpIHsgcmV0dXJuIGBzcGVsbC5pc09mVHlwZSgke3RoaW5nfSwgJyR7dHlwZX0nKWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpcyBub3QgYVwiLFxuICAgICAgXCJpcyBub3QgYW5cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX25vdF9hIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseSh0aGluZywgdHlwZSkgeyByZXR1cm4gYCFzcGVsbC5pc09mVHlwZSgke3RoaW5nfSwgJyR7dHlwZX0nKWAgfVxuICAgIH1cbiAgfSxcblxuICAvL1RPRE86IGBzcGVsbC5jb250YWlucyhjb2xsZWN0aW9uLCB0aGluZylgXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImlzIGluXCIsXG4gICAgICBcImlzIG9uZSBvZlwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfaW4gZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KHRoaW5nLCBsaXN0KSB7IHJldHVybiBgJHtsaXN0fS5pbmNsdWRlcygke3RoaW5nfSlgIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgbm90IGluXCIsXG4gICAgICBcImlzIG5vdCBvbmUgb2ZcIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX25vdF9pbiBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkodGhpbmcsIGxpc3QpIHsgcmV0dXJuIGAhJHtsaXN0fS5pbmNsdWRlcygke3RoaW5nfSlgIH1cbiAgICB9XG4gIH0sXG5cblxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImluY2x1ZGVzXCIsXG4gICAgICBcImNvbnRhaW5zXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpbmNsdWRlcyBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkobGlzdCwgdGhpbmcpIHsgcmV0dXJuIGAke2xpc3R9LmluY2x1ZGVzKCR7dGhpbmd9KWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJkb2VzIG5vdCBpbmNsdWRlXCIsXG4gICAgICBcImRvZXMgbm90IGNvbnRhaW5cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRvZXNfbm90X2luY2x1ZGUgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGxpc3QsIHRoaW5nKSB7IHJldHVybiBgISR7bGlzdH0uaW5jbHVkZXMoJHt0aGluZ30pYCB9XG4gICAgfVxuICB9LFxuXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiPlwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBndCBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9ID4gJHtifSlgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcImlzIGdyZWF0ZXIgdGhhblwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19ndCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAoJHthfSA+ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcIj49XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGd0ZSBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9ID49ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCJpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfZ3RlIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9ID49ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcIjxcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbHQgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAoJHthfSA8ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCJpcyBsZXNzIHRoYW5cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbHQgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gKCR7YX0gPCAke2J9KWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCI8PVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsdGUgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAoJHthfSA8PSAke2J9KWAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2x0ZSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAoJHthfSA8PSAke2J9KWAgfVxuICAgIH1cbiAgfSxcblxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTMsXG4gICAgc3ludGF4OiBcIlxcXFwrXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHBsdXMgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAke2F9ICsgJHtifWAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMyxcbiAgICBzeW50YXg6IFwicGx1c1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBwbHVzIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gKyAke2J9YCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTMsXG4gICAgc3ludGF4OiBcIi1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbWludXMgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAke2F9IC0gJHtifWAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMyxcbiAgICBzeW50YXg6IFwibWludXNcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbWludXMgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gJHthfSAtICR7Yn1gIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxNCxcbiAgICBzeW50YXg6IFwiXFxcXCpcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgdGltZXMgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAke2F9ICogJHtifWAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxNCxcbiAgICBzeW50YXg6IFwidGltZXNcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgdGltZXMgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gJHthfSAqICR7Yn1gIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxNCxcbiAgICBzeW50YXg6IFwiL1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkaXZpZGVkX2J5IGV4dGVuZHMgUnVsZS5TeW1ib2xzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gJHthfSAvICR7Yn1gIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTQsXG4gICAgc3ludGF4OiBcImRpdmlkZWQgYnlcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGl2aWRlZF9ieSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAke2F9IC8gJHtifWAgfVxuICAgIH1cbiAgfSxcblxuICAvL1RPRE86ICBgKz1gIGV0Yz8gIG90aGVyIG1hdGggZnVuY3Rpb25zP1xuXG5cbiAgLy9cbiAgLy9cbiAgLy8jIyBQb3N0aWZ4IG9wZXJhdG9yczogICBge2xoc30gPG9wZXJhdG9yPmAsIGUuZy4gYGEgaXMgZGVmaW5lZGBcbiAgLy8gTk9URTogYG9wZXJhdG9yLmFwcGx5YCBNVVNUIHJldHVybiBhIGZ1bmN0aW9uIHdoaWNoIHRyYW5zZm9ybXMgYXJndW1lbnQgKGBsaHNgKSBpbnRvIEpTIG91dHB1dC5cblxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIntleHByZXNzaW9ufSB7b3BlcmF0b3I6cG9zdGZpeF9vcGVyYXRvcn1cIixcbiAgICBsZWZ0UmVjdXJzaXZlOiB0cnVlLFxuICAgIHRlc3RSdWxlOiBcInBvc3RmaXhfb3BlcmF0b3JcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcG9zdGZpeF9vcGVyYXRvcl9leHByZXNpb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHsgZXhwcmVzc2lvbiwgb3BlcmF0b3IgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIG9wZXJhdG9yLmFwcGx5KGV4cHJlc3Npb24udG9Tb3VyY2UoY29udGV4dCkpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgc3ludGF4OiBcImlzIGRlZmluZWRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfZGVmaW5lZCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkodGhpbmcpIHsgcmV0dXJuIGAodHlwZW9mICR7dGhpbmd9ICE9PSAndW5kZWZpbmVkJylgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcInBvc3RmaXhfb3BlcmF0b3JcIixcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgdW5kZWZpbmVkXCIsXG4gICAgICBcImlzIG5vdCBkZWZpbmVkXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc191bmRlZmluZWQgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KHRoaW5nKSB7IHJldHVybiBgKHR5cGVvZiAke3RoaW5nfSA9PT0gJ3VuZGVmaW5lZCcpYCB9XG4gICAgfVxuICB9LFxuXG4gIC8vVE9ETzogYHNwZWxsLmlzRW1wdHkodGhpbmcpYFxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgc3ludGF4OiBcImlzIGVtcHR5XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2VtcHR5IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseSh0aGluZykgeyByZXR1cm4gYHNwZWxsLmlzRW1wdHkoJHt0aGluZ30pYCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgc3ludGF4OiBcImlzIG5vdCBlbXB0eVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19ub3RfZW1wdHkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KHRoaW5nKSB7IHJldHVybiBgIXNwZWxsLmlzRW1wdHkoJHt0aGluZ30pYCB9XG4gICAgfVxuICB9LFxuXG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL29wZXJhdG9ycy5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgY3JlYXRpbmcgdmFyaWFibGVzLCBwcm9wZXJ0eSBhY2Nlc3MsIGV0Y1xuLy9cblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG4vLyBDcmVhdGUgXCJzdGF0ZW1lbnRzXCIgcGFyc2VyIGNvbnRleHQuXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTmFtZShcInN0YXRlbWVudHNcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAgLy9cbiAgLy9cdCMjIFJldHVybnNcbiAgLy9cblxuICAvLyBSZXR1cm4gYSB2YWx1ZVxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJyZXR1cm5fc3RhdGVtZW50XCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJldHVybiB7ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmV0dXJuX3N0YXRlbWVudCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICBsZXQgeyBleHByZXNzaW9uIH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoY29udGV4dCk7XG4gICAgICAgIHJldHVybiBgcmV0dXJuICR7ZXhwcmVzc2lvbn1gO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvL1xuICAvL1x0IyMgQXNzaWdubWVudFxuICAvL1xuXG4gIC8vVEVTVE1FXG4gIC8vVE9ETzogZGlzdGluZ3Vpc2ggYmV0d2VlbiBgbmV3X2lkZW50aWZpZXJgIGFuZCBgc2NvcGVkX2lkZW50aWZpZXJgXG4gIHtcbiAgICBuYW1lOiBcImFzc2lnbm1lbnRcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJ7dGhpbmc6ZXhwcmVzc2lvbn0gPSB7dmFsdWU6ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwic2V0IHt0aGluZzpleHByZXNzaW9ufSB0byB7dmFsdWU6ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwicHV0IHt2YWx1ZTpleHByZXNzaW9ufSBpbnRvIHt0aGluZzpleHByZXNzaW9ufVwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgYXNzaWdubWVudCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICBsZXQgeyB0aGluZywgdmFsdWUgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KTtcbiAgICAgICAgLy8gVE9ETzogZGVjbGFyZSBpZGVudGlmaWVyIGlmIG5vdCBpbiBzY29wZSwgZXRjXG4gICAgICAgIHJldHVybiBgJHt0aGluZ30gPSAke3ZhbHVlfWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vVEVTVE1FXG4gIC8vIFRPRE86IGBpdGAgbWF5IG5vdCBhbHJlYWR5IGJlIGRlZmluZWQuLi4gPz8/XG4gIHtcbiAgICBuYW1lOiBcImdldF92YWx1ZVwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcImdldCB7dmFsdWU6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZ2V0X3ZhbHVlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IHZhbHVlIH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoY29udGV4dCk7O1xuICAgICAgICByZXR1cm4gYGl0ID0gJHt2YWx1ZX1gXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cblxuICAvL1xuICAvL1x0IyMgVXNlciBpbnRlcmFjdGlvblxuICAvLyBUT0RPOiBtb3ZlIGludG8gYW5vdGhlciBmaWxlXG4gIC8vXG5cbiAgLy8gQWxlcnQgYSBtZXNzYWdlLlxuICAvLyBUT0RPOiBuZWVkIHNvbWUgZmFuY3kgcHJvbWlzZSBqdWp1IGhlcmU/XG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImFsZXJ0XCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcImFsZXJ0IHttZXNzYWdlOmV4cHJlc3Npb259ICg/OndpdGgge29rQnV0dG9uOnRleHR9KT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgYWxlcnQgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHsgbWVzc2FnZSwgb2tCdXR0b24gPSBgXCJPS1wiYCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gYGF3YWl0IHNwZWxsLmFsZXJ0KCR7bWVzc2FnZX0sICR7b2tCdXR0b259KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFdhcm5pbmcgbWVzc2FnZSAtLSBsaWtlIGFsZXJ0IGJ1dCBmYW5jaWVyLlxuICAvLyBUT0RPOiBuZWVkIHNvbWUgZmFuY3kgcHJvbWlzZSBqdWp1IGhlcmU/XG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcIndhcm5cIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwid2FybiB7ZXhwcmVzc2lvbjpleHByZXNzaW9ufSAoPzp3aXRoIHtva0J1dHRvbjp0ZXh0fSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHdhcm4gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHsgbWVzc2FnZSwgb2tCdXR0b24gPSBgXCJPS1wiYCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gYGF3YWl0IHNwZWxsLndhcm4oJHttZXNzYWdlfSwgJHtva0J1dHRvbn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBDb25maXJtIG1lc3NhZ2UgLS0gcHJlc2VudCBhIHF1ZXN0aW9uIHdpdGggdHdvIGFuc3dlcnMuXG4gIC8vIFRPRE86IG5lZWQgc29tZSBmYW5jeSBwcm9taXNlIGp1anUgaGVyZT9cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwiY29uZmlybVwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJjb25maXJtIHttZXNzYWdlOmV4cHJlc3Npb259ICg/OndpdGgge29rQnV0dG9uOnRleHR9ICg/OiAoYW5kfG9yKSB7Y2FuY2VsQnV0dG9uOnRleHR9KT8gKT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgY29uZmlybSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICBsZXQgeyBtZXNzYWdlLCBva0J1dHRvbiA9IGBcIk9LXCJgLCBjYW5jZWxCdXR0b24gPSBgXCJDYW5jZWxcImAgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIGBhd2FpdCBzcGVsbC5jb25maXJtKCR7bWVzc2FnZX0sICR7b2tCdXR0b259LCAke2NhbmNlbEJ1dHRvbn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvc3RhdGVtZW50cy5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgZGVmaW5pbmcgY2xhc3NlcyAoa25vd24gYXMgYHR5cGVzYClcbi8vXG5cbi8vVE9ETzogY29uc3RydWN0b3Jcbi8vIFRPRE86IG1peGlucyAvIHRyYWl0cyAvIGNvbXBvc2VkIGNsYXNzZXMgLyBhbm5vdGF0aW9uc1xuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5cbmltcG9ydCBnbG9iYWwgZnJvbSBcIi4uLy4uL3V0aWxzL2dsb2JhbFwiO1xuaW1wb3J0IHsgcGx1cmFsaXplIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3N0cmluZ1wiO1xuXG5leHBvcnQgZGVmYXVsdCBQYXJzZXIuZm9yTmFtZShcInR5cGVzXCIpLmRlZmluZVJ1bGVzKFxuICB7XG4gICAgbmFtZTogXCJkZWZpbmVfdHlwZVwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcImRlZmluZSB0eXBlIHtuYW1lOnR5cGV9ICg/OmFzIChhfGFuKSB7c3VwZXJUeXBlOnR5cGV9KT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVmaW5lX3R5cGUgZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIC8vIFJldHVybiBhIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlXG4gICAgICB0b1N0cnVjdHVyZShjb250ZXh0KSB7XG4gICAgICAgIGxldCBzdHJ1Y3R1cmUgPSBzdXBlci50b1N0cnVjdHVyZShjb250ZXh0KTtcbiAgICAgICAgc3RydWN0dXJlLnR5cGUgPSBcImNsYXNzXCI7XG4gICAgICAgIHJldHVybiBzdHJ1Y3R1cmU7XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgc3VwZXJUeXBlLCBibG9jayB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICBsZXQgb3V0cHV0ID0gYGNsYXNzICR7bmFtZX1gO1xuICAgICAgICBpZiAoc3VwZXJUeXBlKSBvdXRwdXQgKz0gYCBleHRlbmRzICR7c3VwZXJUeXBlfWA7XG4gICAgICAgIG91dHB1dCArPSBcIiBcIiArIFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoYmxvY2spO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBgbmV3YCBvciBgY3JlYXRlYFxuICAvLyBUaGlzIHdvcmtzIGFzIGFuIGV4cHJlc3Npb24gT1IgYSBzdGF0ZW1lbnQuXG4gIC8vIE5PVEU6IHdlIGFzc3VtZSB0aGF0IGFsbCB0eXBlcyB0YWtlIGFuIG9iamVjdCBvZiBwcm9wZXJ0aWVzPz8/P1xuICB7XG4gICAgbmFtZTogXCJuZXdfdGhpbmdcIixcbiAgICBhbGlhczogW1wiZXhwcmVzc2lvblwiLCBcInN0YXRlbWVudFwiXSxcbiAgICBzeW50YXg6IFwiKGNyZWF0ZXxuZXcpIHt0eXBlfSAoPzp3aXRoIHtwcm9wczpvYmplY3RfbGl0ZXJhbF9wcm9wZXJ0aWVzfSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG5ld190aGluZyBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICBsZXQgeyB0eXBlLCBwcm9wcyA9IFwiXCIgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KTtcbiAgICAgICAgLy8gU3BlY2lhbCBjYXNlIGZvciBvYmplY3QsIHdoaWNoIHdlJ2xsIGNyZWF0ZSB3aXRoIGFuIG9iamVjdCBsaXRlcmFsLlxuICAgICAgICBpZiAodHlwZSA9PT0gXCJPYmplY3RcIikge1xuICAgICAgICAgIGlmICghcHJvcHMpIHJldHVybiBcInt9XCI7XG4gICAgICAgICAgcmV0dXJuIHByb3BzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBuZXcgJHt0eXBlfSgke3Byb3BzfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBEZWNsYXJlIGluc3RhbmNlIG1ldGhvZCBvciBub3JtYWwgZnVuY3Rpb24uXG4gIHtcbiAgICBuYW1lOiBcImRlY2xhcmVfbWV0aG9kXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwiKG9wZXJhdG9yOnRvfG9uKSB7bmFtZTppZGVudGlmaWVyfSB7YXJnc30/IChcXFxcOik/IHtzdGF0ZW1lbnR9P1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkZWNsYXJlX21ldGhvZCBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHsgb3BlcmF0b3IsIG5hbWUsIGFyZ3MgPSBbXX0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoY29udGV4dCk7XG4gICAgICAgIGxldCBzdWJUeXBlID0gKG9wZXJhdG9yID09PSBcInRvXCIgPyBcIm1ldGhvZFwiIDogXCJldmVudFwiKTtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJmdW5jdGlvblwiLCBzdWJUeXBlLCBuYW1lLCBhcmdzIH07XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgYXJncyA9IFtdLCBzdGF0ZW1lbnQsIGJsb2NrIH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoY29udGV4dCk7XG4gICAgICAgIGxldCBvdXRwdXQgPSBgJHtuYW1lfSgke2FyZ3Muam9pbihcIiwgXCIpfSkgYDtcbiAgICAgICAgb3V0cHV0ICs9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoc3RhdGVtZW50LCBibG9jayk7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIERlY2xhcmUgXCJhY3Rpb25cIiwgd2hpY2ggY2FuIGJlIGNhbGxlZCBnbG9iYWxseSBhbmQgYWZmZWN0cyB0aGUgcGFyc2VyLlxuICAvLyBUT0RPOiBgd2l0aGAgY2xhdXNlICh3aWxsIGNvbmZsaWN0IHdpdGggYHdvcmRgKVxuICAvLyBUT0RPOiBpbnN0YWxsIGluIHBhcnNlciBzb21laG93XG4gIC8vIFRPRE86IGNyZWF0ZSBpbnN0YW5jZSBmdW5jdGlvbj8gIG9yIG1heWJlIHdlIGRvbid0IG5lZWQgaXQ6XG4gIC8vXHRcdFx0YGFjdGlvbiB0dXJuIENhcmQgb3ZlcmAgZm9yIGFuIGluc3RhbmNlIGlzIGp1c3QgYHR1cm4gbWUgb3ZlcmBcbiAgLy9cdFx0XHRgYWN0aW9uIGFkZCBjYXJkIHRvIGRlY2tgID0+IGBhZGQgbWUgdG8gZGVja2BcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwiZGVjbGFyZV9hY3Rpb25cIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJhY3Rpb24gKGtleXdvcmRzOnt3b3JkfXx7dHlwZX0pKyAoXFxcXDopPyB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVjbGFyZV9hY3Rpb24gZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIC8vIEFkZCBgbmFtZWAsIGBhcmdzYCBhbmQgYHR5cGVzYCB0byBtYXRjaGVkIHNvdXJjZVxuICAgICAgZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCBvdXRwdXQgPSBzdXBlci5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlJ3Mgb25seSBvbmUga2V5d29yZCwgaXQgY2FuJ3QgYmUgYSBibGFja2xpc3RlZCBpZGVudGlmaWVyIG9yIGEgdHlwZVxuICAgICAgICBsZXQgeyBrZXl3b3JkcyB9ID0gb3V0cHV0O1xuICAgICAgICBsZXQga2V5d29yZE1hdGNoZXMgPSB0aGlzLnJlc3VsdHMua2V5d29yZHMubWF0Y2hlZDtcbiAgICAgICAgaWYgKGtleXdvcmRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIGxldCBrZXl3b3JkID0ga2V5d29yZHNbMF07XG4gICAgICAgICAgaWYgKGtleXdvcmRNYXRjaGVzWzBdIGluc3RhbmNlb2YgUnVsZS5UeXBlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBwYXJzZSgnZGVjbGFyZV9hY3Rpb24nKTogb25lLXdvcmQgYWN0aW9ucyBtYXkgbm90IGJlIHR5cGVzOiAke2tleXdvcmR9YCk7XG4gICAgICAgICAgfVxuXG4gIC8vIEhBQ0s6IGBnbG9iYWwucGFyc2VyYCBpcyBhIGhhY2sgaGVyZSBmb3IgY29udmVuaWVuY2UgaW4gdGVzdGluZy4uLlxuICAgICAgICAgIGxldCBwYXJzZXIgPSAoY29udGV4dCAmJiBjb250ZXh0LnBhcnNlcikgfHwgZ2xvYmFsLnBhcnNlcjtcbiAgICAgICAgICBsZXQgYmxhY2tsaXN0ID0gcGFyc2VyLmdldEJsYWNrbGlzdChcImlkZW50aWZpZXJcIik7XG4gICAgICAgICAgaWYgKGJsYWNrbGlzdFtrZXl3b3JkXSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgcGFyc2UoJ2RlY2xhcmVfYWN0aW9uJyk6IG9uZS13b3JkIGFjdGlvbnMgbWF5IG5vdCBiZSBibGFja2xpc3RlZCBpZGVudGlmaWVyc1wiOiAke2tleXdvcmR9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZmlndXJlIG91dCBhcmd1bWVudHMgYW5kL29yIHR5cGVzXG4gICAgICAgIG91dHB1dC5hcmdzID0gW107XG4gICAgICAgIG91dHB1dC50eXBlcyA9IHt9O1xuXG4gICAgICAgIC8vIGlmIGFueSBvZiB0aGUgd29yZHMgYXJlIHR5cGVzIChjYXBpdGFsIGxldHRlcikgbWFrZSB0aGF0IGFuIGFyZ3VtZW50IG9mIHRoZSBzYW1lIG5hbWUuXG4gICAgICAgIGtleXdvcmRNYXRjaGVzLm1hcCggKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBSdWxlLlR5cGUpIHtcbiAgICAgICAgICAgIGxldCBUeXBlID0ga2V5d29yZHNbaW5kZXhdO1xuICAgICAgICAgICAgbGV0IHR5cGUgPSBUeXBlLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIG91dHB1dC50eXBlc1t0eXBlXSA9IFR5cGU7XG4gICAgICAgICAgICBvdXRwdXQuYXJncy5wdXNoKHR5cGUpO1xuXG4gICAgICAgICAgICAvLyByZXBsYWNlIHdpdGggbG93ZXJjYXNlIGluIG1ldGhvZCBuYW1lXG4gICAgICAgICAgICBrZXl3b3Jkc1tpbmRleF0gPSB0eXBlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGdldCBzdGF0aWMgbWV0aG9kIG5hbWUgYW5kIGFyZ3VtZW50cyBmb3Igb3V0cHV0XG4gICAgICAgIG91dHB1dC5uYW1lID0ga2V5d29yZHMuam9pbihcIl9cIik7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgYXJncyA9IFtdLCB0eXBlcywgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuXG4gICAgICAgIC8vIGZpZ3VyZSBvdXQgaWYgdGhlcmUgYXJlIGFueSBjb25kaXRpb25zIGR1ZSB0byBrbm93biBhcmd1bWVudCB0eXBlc1xuICAgICAgICBsZXQgY29uZGl0aW9ucyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBhcmcgaW4gdHlwZXMpIHtcbiAgICAgICAgICBjb25kaXRpb25zLnB1c2goYFxcdGlmICghc3BlbGwuaXNBKCR7YXJnfSwgJHt0eXBlc1thcmddfSkpIHJldHVybiB1bmRlZmluZWRgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzdGF0ZW1lbnRzID0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhjb25kaXRpb25zLCBzdGF0ZW1lbnQsIGJsb2NrKTtcblxuICAgICAgICAvLyBDcmVhdGUgYXMgYSBTVEFUSUMgZnVuY3Rpb25cbiAgICAvL1RPRE86IGNyZWF0ZSBhcyBhbiBpbnN0YW5jZSBmdW5jdGlvbiB3ZSBjYW4gY2FsbCBvbiBvdXJzZWxmIVxuICAgICAgICByZXR1cm4gYHN0YXRpYyAke25hbWV9KCR7YXJncy5qb2luKFwiLCBcIil9KSAke3N0YXRlbWVudHN9YDtcbiAgICAgIH1cblxuICAgICAgdG9TdHJ1Y3R1cmUoY29udGV4dCkge1xuICAgICAgICBsZXQgeyBuYW1lLCBhcmdzLCB0eXBlcyB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcImZ1bmN0aW9uXCIsIHN1YlR5cGU6IFwiYWN0aW9uXCIsIG5hbWUsIGFyZ3MsIHR5cGVzIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBHZXR0ZXIgZWl0aGVyIHdpdGggb3Igd2l0aG91dCBhcmd1bWVudHMuXG4gIC8vIElmIHlvdSBzcGVjaWZ5IGFyZ3VtZW50cywgeWllbGRzIGEgbm9ybWFsIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSB2YWx1ZS5cbiAgLy8gVE9ETzogYHRvIGdldC4uLmAgP1xuICB7XG4gICAgbmFtZTogXCJnZXR0ZXJcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJnZXQge25hbWU6aWRlbnRpZmllcn1cXFxcOiB7ZXhwcmVzc2lvbn0/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGdldHRlciBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICBsZXQgeyBuYW1lLCBleHByZXNzaW9uLCBibG9jayB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICAvLyBJZiB0aGV5IHNwZWNpZmllZCBhbiBpbmxpbmUtZXhwcmVzc2lvbiwgcHJlcGVuZCByZXR1cm5cbiAgICAgICAgaWYgKGV4cHJlc3Npb24gJiYgIWV4cHJlc3Npb24uc3RhcnRzV2l0aChcInJldHVybiBcIikpIGV4cHJlc3Npb24gPSBgcmV0dXJuICgke2V4cHJlc3Npb259KWA7XG4gICAgICAgIGxldCBvdXRwdXQgPSBgZ2V0ICR7bmFtZX0oKSBgO1xuICAgICAgICBvdXRwdXQgKz0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhleHByZXNzaW9uLCBibG9jayk7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlXG4gICAgICB0b1N0cnVjdHVyZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IG5hbWUgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBzdWJUeXBlOiBcImdldHRlclwiLCBuYW1lIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gU2V0dGVyLlxuICAvLyBDb21wbGFpbnMgaWYgeW91IHNwZWNpZnkgbW9yZSB0aGFuIG9uZSBhcmd1bWVudC5cbiAgLy8gSWYgeW91IGRvbid0IHBhc3MgYW4gZXhwbGljaXQgYXJndW1lbnQsIHdlJ2xsIGFzc3VtZSBpdCdzIHRoZSBzYW1lIGFzIHRoZSBpZGVudGlmaWVyLlxuICAvLyBlZztcdGBzZXQgY29sb3I6IHNldCB0aGUgY29sb3Igb2YgbXkgdGV4dCB0byBjb2xvcmBcbiAgLy9cbiAgLy8gVE9ETzogaW50ZXJuYWwgZ2V0dGVyL3NldHRlciBzZW1hbnRpY3MgYWxhIG9iamVjdGl2ZSBDXG4gIC8vXHRcdFx0YHNldCBjb2xvcjogaWYgY29sb3IgaXMgaW4gW1wicmVkXCIsIFwiYmx1ZVwiXSB0aGVuIHNldCBteSBjb2xvciB0byBjb2xvcmBcbiAgLy9cdFx0ID0+IGBteSBjb2xvcmAgd2l0aGluIHNldHRlciBzaG91bGQgYXV0b21hdGljYWxseSB0cmFuc2xhdGUgdG8gYHRoaXMuX2NvbG9yYCA/Pz9cbiAgLy8gVE9ETzogYHRvIHNldC4uLmAgP1xuICB7XG4gICAgbmFtZTogXCJzZXR0ZXJcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJzZXQge25hbWU6aWRlbnRpZmllcn0ge2FyZ3N9PyAoXFxcXDopPyB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgc2V0dGVyIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIC8vIGRlZmF1bHQgYXJncyB0byB0aGUgc2V0dGVyIG5hbWVcbiAgICAgICAgbGV0IHsgbmFtZSwgYXJncyA9IFtuYW1lXSwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICAvLyBDb21wbGFpbiBpZiBtb3JlIHRoYW4gb25lIGFyZ3VtZW50XG4gICAgICAgIGlmIChhcmdzICYmIGFyZ3MubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcInBhcnNlKCdzZXR0ZXInKTogb25seSBvbmUgYXJndW1lbnQgYWxsb3dlZCBpbiBzZXR0ZXI6ICBcIiwgdGhpcy5tYXRjaGVkVGV4dCk7XG4gICAgICAgICAgYXJncyA9IFsgYXJnc1swXSBdO1xuICAgICAgICB9XG4gICAgICAgIGxldCBvdXRwdXQgPSBgc2V0ICR7bmFtZX0oJHthcmdzfSkgYDtcbiAgICAgICAgb3V0cHV0ICs9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoc3RhdGVtZW50LCBibG9jayk7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlXG4gICAgICB0b1N0cnVjdHVyZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IG5hbWUgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBzdWJUeXBlOiBcInNldHRlclwiLCBuYW1lIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvL1xuICAvL1x0ZGVjbGFyZSBwcm9wZXJ0aWVzXG4gIC8vXG5cbiAgLy9UT0RPOiBhbm90aGVyIG5hbWUgZm9yIGBjb25zdGFudGAgP1xuICB7XG4gICAgbmFtZTogXCJkZWNsYXJlX3Byb3BlcnR5XCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwiKHNjb3BlOnByb3BlcnR5fGNvbnN0YW50fHNoYXJlZCBwcm9wZXJ0eSkge25hbWU6aWRlbnRpZmllcn0gKD86PSB7dmFsdWU6ZXhwcmVzc2lvbn0pP1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkZWNsYXJlX3Byb3BlcnR5IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IHNjb3BlLCBuYW1lLCB2YWx1ZSA9IFwiXCIgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KTtcbiAgICAgICAgaWYgKHZhbHVlKSB2YWx1ZSA9IGAgPSAke3ZhbHVlfWA7XG5cbiAgICAgICAgbGV0IGRlY2xhcmF0aW9uID0gYCR7bmFtZX0ke3ZhbHVlfWA7XG4gICAgICAgIHN3aXRjaCAoc2NvcGUpIHtcbiAgICAgICAgICBjYXNlIFwiY29uc3RhbnRcIjpcbi8vICAgICAgICAgICAgaWYgKCF2YWx1ZSkgY29uc29sZS53YXJuKFwicGFyc2UoJ2RlY2xhcmVfcHJvcGVydHknKTogY29uc3RhbnQgcHJvcGVydGllcyBtdXN0IGRlY2xhcmUgYSB2YWx1ZTogIFwiLCB0aGlzLm1hdGNoZWRUZXh0KTtcbiAgICAgICAgICAgIHJldHVybiBgY29uc3QgJHtkZWNsYXJhdGlvbn1gO1xuXG4gICAgICAgICAgY2FzZSBcInNoYXJlZCBwcm9wZXJ0eVwiOlxuICAgICAgICAgICAgcmV0dXJuIGBAcHJvdG8gJHtkZWNsYXJhdGlvbn1gO1xuXG4gICAgICAgICAgY2FzZSBcInByb3BlcnR5XCI6XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBkZWNsYXJhdGlvbjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoY29udGV4dCkge1xuICAgICAgICBsZXQgeyBzY29wZSwgbmFtZSB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcInByb3BlcnR5XCIsIG5hbWUsIHNjb3BlIH07XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFRPRE86IHNjb3BlX21vZGlmaWVyPz8/XG4gIC8vIFRPRE86IGluaXRpYWwgdmFsdWVcbiAge1xuICAgIG5hbWU6IFwiZGVjbGFyZV9wcm9wZXJ0eV9vZl90eXBlXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwicHJvcGVydHkge25hbWU6aWRlbnRpZmllcn0gYXMgKGF8YW4pPyB7dHlwZX1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVjbGFyZV9wcm9wZXJ0eV9vZl90eXBlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHR5cGUgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIGBnZXQgJHtuYW1lfSgpIHsgcmV0dXJuIHRoaXMuX18ke25hbWV9IH1cXG5gXG4gICAgICAgICAgICsgYHNldCAke25hbWV9KHZhbHVlKSB7IGlmIChzcGVsbC5pc0EodmFsdWUsICR7dHlwZX0pIHRoaXMuX18ke25hbWV9ID0gdmFsdWUgfWA7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlXG4gICAgICB0b1N0cnVjdHVyZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHR5cGUgfSA9IHRoaXMuZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBzdWJUeXBlOiBcInNldHRlclwiLCBuYW1lLCBkYXRhVHlwZTogdHlwZSB9O1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFRPRE86IHdhcm4gb24gaW52YWxpZCBzZXQ/ICBzaGFyZWQ/ICB1bmRlZmluZWQ/IHNvbWV0aGluZyBvdGhlciB0aGFuIHRoZSBmaXJzdCB2YWx1ZSBhcyBkZWZhdWx0P1xuICB7XG4gICAgbmFtZTogXCJkZWNsYXJlX3Byb3BlcnR5X2FzX29uZV9vZlwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcInByb3BlcnR5IHtuYW1lOmlkZW50aWZpZXJ9IGFzIG9uZSBvZiB7bGlzdDpsaXRlcmFsX2xpc3R9XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRlY2xhcmVfcHJvcGVydHlfYXNfb25lX29mIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICBnZXRNYXRjaGVkU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IG91dHB1dCA9IHN1cGVyLmdldE1hdGNoZWRTb3VyY2UoY29udGV4dCk7XG4gICAgICAgIG91dHB1dC5wbHVyYWwgPSBwbHVyYWxpemUob3V0cHV0Lm5hbWUpO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuXG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHBsdXJhbCwgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gYEBwcm90byAke3BsdXJhbH0gPSAke2xpc3R9XFxuYFxuICAgICAgICAgICArIGBnZXQgJHtuYW1lfSgpIHsgcmV0dXJuIHRoaXMuX18ke25hbWV9ID09PSB1bmRlZmluZWQgPyB0aGlzLiR7cGx1cmFsfVswXSA6IHRoaXMuX18ke25hbWV9IH1cXG5gXG4gICAgICAgICAgICsgYHNldCAke25hbWV9KHZhbHVlKSB7IGlmICh0aGlzLiR7cGx1cmFsfS5pbmNsdWRlcyh2YWx1ZSkpIHRoaXMuX18ke25hbWV9ID0gdmFsdWUgfWA7XG5cbiAgLy8gTU9SRSBFRkZJQ0lFTlQgQlVUIFVHTElFUlxuICAvLyBcdFx0XHRyZXR1cm4gYHN0YXRpYyAke3BsdXJhbH0gPSAke2xpc3R9O1xcbmBcbiAgLy8gXHRcdFx0XHQgKyBgZ2V0ICR7bmFtZX0geyByZXR1cm4gKFwiX18ke25hbWV9XCIgaW4gdGhpcyA/IHRoaXMuX18ke25hbWV9IDogJHtmaXJzdFZhbHVlfSkgfVxcbmBcbiAgLy8gXHRcdFx0XHQgKyBgc2V0ICR7bmFtZX0odmFsdWUpIHsgaWYgKHRoaXMuY29uc3RydWN0b3IuJHtwbHVyYWx9LmluY2x1ZGVzKHZhbHVlKSkgdGhpcy5fXyR7bmFtZX0gPSB2YWx1ZSB9YDtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgcGx1cmFsIH0gPSB0aGlzLmdldE1hdGNoZWRTb3VyY2UoY29udGV4dCk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgeyB0eXBlOiBcInByb3BlcnR5XCIsIG5hbWUgfSxcbiAgICAgICAgICB7IHR5cGU6IFwicHJvcGVydHlcIiwgc3ViVHlwZTogXCJzaGFyZWRcIiwgbmFtZTogcGx1cmFsIH1cbiAgICAgICAgXTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvL1xuICAvL1x0U2VsZi1yZWZlcmVuY2VcbiAgLy9cbiAge1xuICAgIG5hbWU6IFwibWVcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIm1lXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG1lIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiBcInRoaXNcIjtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gVE9ETzogdGhpcyByZWFsbHkgbWFrZXMgbWUgd2FudCB0byBtYWtlIGBJIGFtIGVtcHR5YCBldGMgd29yay4uLlxuICB7XG4gICAgbmFtZTogXCJJXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJJXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIEkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIFwidGhpc1wiO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vXG4gIC8vXHRQcm9wZXJ0eSBhY2Nlc3NcbiAgLy9cblxuICB7XG4gICAgbmFtZTogXCJwcm9wZXJ0eV9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCIocHJvcGVydGllczp0aGUge2lkZW50aWZpZXJ9IG9mKSsgdGhlPyB7ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcHJvcGVydHlfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgZ2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IGV4cHJlc3Npb24sIHByb3BlcnRpZXMgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBleHByZXNzaW9uOiBleHByZXNzaW9uLnRvU291cmNlKGNvbnRleHQpLFxuICAgICAgICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXMubWF0Y2hlZC5tYXAoIHByb3BlcnR5ID0+IHByb3BlcnR5LnJlc3VsdHMuaWRlbnRpZmllci50b1NvdXJjZShjb250ZXh0KSApXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHsgZXhwcmVzc2lvbiwgcHJvcGVydGllcyB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICBwcm9wZXJ0aWVzID0gcHJvcGVydGllcy5yZXZlcnNlKCkuam9pbihcIi5cIik7XG4gICAgICAgIHJldHVybiBgJHtleHByZXNzaW9ufS4ke3Byb3BlcnRpZXN9YDtcbiAgLy8gTk9URTogdGhlIGZvbGxvd2luZyBpcyBzYWZlciwgYnV0IHVnbHkgZm9yIGRlbW8gcHVycG9zZXNcbiAgLy9cdFx0XHRyZXR1cm4gYHNwZWxsLmdldCgke2V4cHJlc3Npb259LCBbJyR7cHJvcGVydGllc30nXSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJteV9wcm9wZXJ0eV9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCIobXl8dGhpcykge2lkZW50aWZpZXJ9XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG15X3Byb3BlcnR5X2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHsgaWRlbnRpZmllciB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gYHRoaXMuJHtpZGVudGlmaWVyfWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy9cbiAgLy9cdFV0aWxpdHlcbiAgLy9cblxuXG4gIC8vIFByb3BlcnRpZXMgY2xhdXNlOiBjcmVhdGVzIGFuIG9iamVjdCB3aXRoIG9uZSBvciBtb3JlIHByb3BlcnR5IHZhbHVlcy5cbiAgLy9cdGBmb28gPSAxLCBiYXIgPSAyYFxuICAvL1RPRE86IHdvdWxkIGxpa2UgdG8gdXNlIGBhbmRgIGJ1dCB0aGF0IHdpbGwgYmFyZiBvbiBleHByZXNzaW9ucy4uLlxuICAvL1RPRE86IGhvdyB0byBkbyBwcm9wZXJ0aWVzIG9uIG11bHRpcGxlIGxpbmVzP1xuICB7XG4gICAgbmFtZTogXCJvYmplY3RfbGl0ZXJhbF9wcm9wZXJ0aWVzXCIsXG4gICAgc3ludGF4OiBcIlsoe2tleTppZGVudGlmaWVyfSg/Oj0ge3ZhbHVlOmV4cHJlc3Npb259KT8pICxdXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9iamVjdF9saXRlcmFsX3Byb3BlcnRpZXMgZXh0ZW5kcyBSdWxlLkxpc3Qge1xuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICBsZXQgcHJvcHMgPSB0aGlzLnJlc3VsdHMubWF0Y2hlZC5tYXAoZnVuY3Rpb24gKHByb3ApIHtcbiAgICAgICAgICAgIGxldCB7IGtleSwgdmFsdWUgfSA9IHByb3AucmVzdWx0cztcbiAgICAgICAgICAgIGtleSA9IGtleS50b1NvdXJjZShjb250ZXh0KTtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgJiYgdmFsdWUudG9Tb3VyY2UoY29udGV4dCk7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHJldHVybiBgXCIke2tleX1cIjogJHt2YWx1ZX1gXG4gICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYHsgJHtwcm9wcy5qb2luKFwiLCBcIil9IH1gO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vTU9WRSBUTyBgZnVuY3Rpb25zYD9cbiAgLy8gQXJndW1lbnRzIGNsYXVzZSBmb3IgbWV0aG9kc1xuICAvL1x0YHdpdGggZm9vYCBvciBgd2l0aCBmb28gYW5kIGJhciBhbmQgYmF6YFxuICAvL1RPRE86IHtpZGVudGlmaWVyfSA9IHtleHByZXNzaW9ufVx0PT4gcmVxdWlyZXMgYCxgIGluc3RlYWQgb2YgYGFuZGBcbiAgLy9UT0RPOiBgd2l0aCBmb28gYXMgVHlwZWBcbiAgLy9UT0RPOlx0YHdpdGggZm9vLi4uYCBmb3Igc3BsYXQ/XG4gIHtcbiAgICBuYW1lOiBcImFyZ3NcIixcbiAgICBzeW50YXg6IFwid2l0aCBbYXJnczp7aWRlbnRpZmllcn0gLF1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgYXJncyBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgLy8gUmV0dXJucyBhbiBhcnJheSBvZiBhcmd1bWVudCB2YWx1ZXNcbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzdWx0cy5hcmdzLm1hdGNoZWQubWFwKGFyZyA9PiBhcmcubWF0Y2hlZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL3R5cGVzLmpzIiwicmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3ltYm9sJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvX2NvcmUnKS5TeW1ib2w7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9lczYvc3ltYm9sLmpzXG4vLyBtb2R1bGUgaWQgPSA1MDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKHR5cGVvZiBpdCAhPSAnZnVuY3Rpb24nKSB0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fYS1mdW5jdGlvbi5qc1xuLy8gbW9kdWxlIGlkID0gNTQ3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGZhbHNlIC0+IEFycmF5I2luZGV4T2Zcbi8vIHRydWUgIC0+IEFycmF5I2luY2x1ZGVzXG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIHRvTGVuZ3RoID0gcmVxdWlyZSgnLi9fdG8tbGVuZ3RoJyk7XG52YXIgdG9BYnNvbHV0ZUluZGV4ID0gcmVxdWlyZSgnLi9fdG8tYWJzb2x1dGUtaW5kZXgnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKElTX0lOQ0xVREVTKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoJHRoaXMsIGVsLCBmcm9tSW5kZXgpIHtcbiAgICB2YXIgTyA9IHRvSU9iamVjdCgkdGhpcyk7XG4gICAgdmFyIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKTtcbiAgICB2YXIgaW5kZXggPSB0b0Fic29sdXRlSW5kZXgoZnJvbUluZGV4LCBsZW5ndGgpO1xuICAgIHZhciB2YWx1ZTtcbiAgICAvLyBBcnJheSNpbmNsdWRlcyB1c2VzIFNhbWVWYWx1ZVplcm8gZXF1YWxpdHkgYWxnb3JpdGhtXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgIGlmIChJU19JTkNMVURFUyAmJiBlbCAhPSBlbCkgd2hpbGUgKGxlbmd0aCA+IGluZGV4KSB7XG4gICAgICB2YWx1ZSA9IE9baW5kZXgrK107XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgICBpZiAodmFsdWUgIT0gdmFsdWUpIHJldHVybiB0cnVlO1xuICAgIC8vIEFycmF5I2luZGV4T2YgaWdub3JlcyBob2xlcywgQXJyYXkjaW5jbHVkZXMgLSBub3RcbiAgICB9IGVsc2UgZm9yICg7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIGlmIChJU19JTkNMVURFUyB8fCBpbmRleCBpbiBPKSB7XG4gICAgICBpZiAoT1tpbmRleF0gPT09IGVsKSByZXR1cm4gSVNfSU5DTFVERVMgfHwgaW5kZXggfHwgMDtcbiAgICB9IHJldHVybiAhSVNfSU5DTFVERVMgJiYgLTE7XG4gIH07XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fYXJyYXktaW5jbHVkZXMuanNcbi8vIG1vZHVsZSBpZCA9IDU0OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBnZXR0aW5nIHRhZyBmcm9tIDE5LjEuMy42IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcoKVxudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpO1xudmFyIFRBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpO1xuLy8gRVMzIHdyb25nIGhlcmVcbnZhciBBUkcgPSBjb2YoZnVuY3Rpb24gKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID09ICdBcmd1bWVudHMnO1xuXG4vLyBmYWxsYmFjayBmb3IgSUUxMSBTY3JpcHQgQWNjZXNzIERlbmllZCBlcnJvclxudmFyIHRyeUdldCA9IGZ1bmN0aW9uIChpdCwga2V5KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGl0W2tleV07XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdmFyIE8sIFQsIEI7XG4gIHJldHVybiBpdCA9PT0gdW5kZWZpbmVkID8gJ1VuZGVmaW5lZCcgOiBpdCA9PT0gbnVsbCA/ICdOdWxsJ1xuICAgIC8vIEBAdG9TdHJpbmdUYWcgY2FzZVxuICAgIDogdHlwZW9mIChUID0gdHJ5R2V0KE8gPSBPYmplY3QoaXQpLCBUQUcpKSA9PSAnc3RyaW5nJyA/IFRcbiAgICAvLyBidWlsdGluVGFnIGNhc2VcbiAgICA6IEFSRyA/IGNvZihPKVxuICAgIC8vIEVTMyBhcmd1bWVudHMgZmFsbGJhY2tcbiAgICA6IChCID0gY29mKE8pKSA9PSAnT2JqZWN0JyAmJiB0eXBlb2YgTy5jYWxsZWUgPT0gJ2Z1bmN0aW9uJyA/ICdBcmd1bWVudHMnIDogQjtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19jbGFzc29mLmpzXG4vLyBtb2R1bGUgaWQgPSA1NDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi9fYS1mdW5jdGlvbicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZm4sIHRoYXQsIGxlbmd0aCkge1xuICBhRnVuY3Rpb24oZm4pO1xuICBpZiAodGhhdCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZm47XG4gIHN3aXRjaCAobGVuZ3RoKSB7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24gKGEpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uICgvKiAuLi5hcmdzICovKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fY3R4LmpzXG4vLyBtb2R1bGUgaWQgPSA1NTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gNy4yLjEgUmVxdWlyZU9iamVjdENvZXJjaWJsZShhcmd1bWVudClcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmIChpdCA9PSB1bmRlZmluZWQpIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uICBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2RlZmluZWQuanNcbi8vIG1vZHVsZSBpZCA9IDU1MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBhbGwgZW51bWVyYWJsZSBvYmplY3Qga2V5cywgaW5jbHVkZXMgc3ltYm9sc1xudmFyIGdldEtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xudmFyIGdPUFMgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wcycpO1xudmFyIHBJRSA9IHJlcXVpcmUoJy4vX29iamVjdC1waWUnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHZhciByZXN1bHQgPSBnZXRLZXlzKGl0KTtcbiAgdmFyIGdldFN5bWJvbHMgPSBnT1BTLmY7XG4gIGlmIChnZXRTeW1ib2xzKSB7XG4gICAgdmFyIHN5bWJvbHMgPSBnZXRTeW1ib2xzKGl0KTtcbiAgICB2YXIgaXNFbnVtID0gcElFLmY7XG4gICAgdmFyIGkgPSAwO1xuICAgIHZhciBrZXk7XG4gICAgd2hpbGUgKHN5bWJvbHMubGVuZ3RoID4gaSkgaWYgKGlzRW51bS5jYWxsKGl0LCBrZXkgPSBzeW1ib2xzW2krK10pKSByZXN1bHQucHVzaChrZXkpO1xuICB9IHJldHVybiByZXN1bHQ7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZW51bS1rZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSA1NTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4vX2hpZGUnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJyk7XG52YXIgY3R4ID0gcmVxdWlyZSgnLi9fY3R4Jyk7XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbnZhciAkZXhwb3J0ID0gZnVuY3Rpb24gKHR5cGUsIG5hbWUsIHNvdXJjZSkge1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRjtcbiAgdmFyIElTX0dMT0JBTCA9IHR5cGUgJiAkZXhwb3J0Lkc7XG4gIHZhciBJU19TVEFUSUMgPSB0eXBlICYgJGV4cG9ydC5TO1xuICB2YXIgSVNfUFJPVE8gPSB0eXBlICYgJGV4cG9ydC5QO1xuICB2YXIgSVNfQklORCA9IHR5cGUgJiAkZXhwb3J0LkI7XG4gIHZhciB0YXJnZXQgPSBJU19HTE9CQUwgPyBnbG9iYWwgOiBJU19TVEFUSUMgPyBnbG9iYWxbbmFtZV0gfHwgKGdsb2JhbFtuYW1lXSA9IHt9KSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV07XG4gIHZhciBleHBvcnRzID0gSVNfR0xPQkFMID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSk7XG4gIHZhciBleHBQcm90byA9IGV4cG9ydHNbUFJPVE9UWVBFXSB8fCAoZXhwb3J0c1tQUk9UT1RZUEVdID0ge30pO1xuICB2YXIga2V5LCBvd24sIG91dCwgZXhwO1xuICBpZiAoSVNfR0xPQkFMKSBzb3VyY2UgPSBuYW1lO1xuICBmb3IgKGtleSBpbiBzb3VyY2UpIHtcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcbiAgICBvd24gPSAhSVNfRk9SQ0VEICYmIHRhcmdldCAmJiB0YXJnZXRba2V5XSAhPT0gdW5kZWZpbmVkO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gKG93biA/IHRhcmdldCA6IHNvdXJjZSlba2V5XTtcbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxuICAgIGV4cCA9IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4dGVuZCBnbG9iYWxcbiAgICBpZiAodGFyZ2V0KSByZWRlZmluZSh0YXJnZXQsIGtleSwgb3V0LCB0eXBlICYgJGV4cG9ydC5VKTtcbiAgICAvLyBleHBvcnRcbiAgICBpZiAoZXhwb3J0c1trZXldICE9IG91dCkgaGlkZShleHBvcnRzLCBrZXksIGV4cCk7XG4gICAgaWYgKElTX1BST1RPICYmIGV4cFByb3RvW2tleV0gIT0gb3V0KSBleHBQcm90b1trZXldID0gb3V0O1xuICB9XG59O1xuZ2xvYmFsLmNvcmUgPSBjb3JlO1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgIC8vIGdsb2JhbFxuJGV4cG9ydC5TID0gNDsgICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAgLy8gYmluZFxuJGV4cG9ydC5XID0gMzI7ICAvLyB3cmFwXG4kZXhwb3J0LlUgPSA2NDsgIC8vIHNhZmVcbiRleHBvcnQuUiA9IDEyODsgLy8gcmVhbCBwcm90byBtZXRob2QgZm9yIGBsaWJyYXJ5YFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZXhwb3J0LmpzXG4vLyBtb2R1bGUgaWQgPSA1NTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRvY3VtZW50ID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuZG9jdW1lbnQ7XG5tb2R1bGUuZXhwb3J0cyA9IGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2h0bWwuanNcbi8vIG1vZHVsZSBpZCA9IDU1NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIGFuZCBub24tZW51bWVyYWJsZSBvbGQgVjggc3RyaW5nc1xudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKSA/IE9iamVjdCA6IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gY29mKGl0KSA9PSAnU3RyaW5nJyA/IGl0LnNwbGl0KCcnKSA6IE9iamVjdChpdCk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faW9iamVjdC5qc1xuLy8gbW9kdWxlIGlkID0gNTU1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDcuMi4yIElzQXJyYXkoYXJndW1lbnQpXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gaXNBcnJheShhcmcpIHtcbiAgcmV0dXJuIGNvZihhcmcpID09ICdBcnJheSc7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faXMtYXJyYXkuanNcbi8vIG1vZHVsZSBpZCA9IDU1NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgTUVUQSA9IHJlcXVpcmUoJy4vX3VpZCcpKCdtZXRhJyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBzZXREZXNjID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbnZhciBpZCA9IDA7XG52YXIgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0cnVlO1xufTtcbnZhciBGUkVFWkUgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBpc0V4dGVuc2libGUoT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKHt9KSk7XG59KTtcbnZhciBzZXRNZXRhID0gZnVuY3Rpb24gKGl0KSB7XG4gIHNldERlc2MoaXQsIE1FVEEsIHsgdmFsdWU6IHtcbiAgICBpOiAnTycgKyArK2lkLCAvLyBvYmplY3QgSURcbiAgICB3OiB7fSAgICAgICAgICAvLyB3ZWFrIGNvbGxlY3Rpb25zIElEc1xuICB9IH0pO1xufTtcbnZhciBmYXN0S2V5ID0gZnVuY3Rpb24gKGl0LCBjcmVhdGUpIHtcbiAgLy8gcmV0dXJuIHByaW1pdGl2ZSB3aXRoIHByZWZpeFxuICBpZiAoIWlzT2JqZWN0KGl0KSkgcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJyA/IGl0IDogKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyA/ICdTJyA6ICdQJykgKyBpdDtcbiAgaWYgKCFoYXMoaXQsIE1FVEEpKSB7XG4gICAgLy8gY2FuJ3Qgc2V0IG1ldGFkYXRhIHRvIHVuY2F1Z2h0IGZyb3plbiBvYmplY3RcbiAgICBpZiAoIWlzRXh0ZW5zaWJsZShpdCkpIHJldHVybiAnRic7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgbWV0YWRhdGFcbiAgICBpZiAoIWNyZWF0ZSkgcmV0dXJuICdFJztcbiAgICAvLyBhZGQgbWlzc2luZyBtZXRhZGF0YVxuICAgIHNldE1ldGEoaXQpO1xuICAvLyByZXR1cm4gb2JqZWN0IElEXG4gIH0gcmV0dXJuIGl0W01FVEFdLmk7XG59O1xudmFyIGdldFdlYWsgPSBmdW5jdGlvbiAoaXQsIGNyZWF0ZSkge1xuICBpZiAoIWhhcyhpdCwgTUVUQSkpIHtcbiAgICAvLyBjYW4ndCBzZXQgbWV0YWRhdGEgdG8gdW5jYXVnaHQgZnJvemVuIG9iamVjdFxuICAgIGlmICghaXNFeHRlbnNpYmxlKGl0KSkgcmV0dXJuIHRydWU7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgbWV0YWRhdGFcbiAgICBpZiAoIWNyZWF0ZSkgcmV0dXJuIGZhbHNlO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBoYXNoIHdlYWsgY29sbGVjdGlvbnMgSURzXG4gIH0gcmV0dXJuIGl0W01FVEFdLnc7XG59O1xuLy8gYWRkIG1ldGFkYXRhIG9uIGZyZWV6ZS1mYW1pbHkgbWV0aG9kcyBjYWxsaW5nXG52YXIgb25GcmVlemUgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKEZSRUVaRSAmJiBtZXRhLk5FRUQgJiYgaXNFeHRlbnNpYmxlKGl0KSAmJiAhaGFzKGl0LCBNRVRBKSkgc2V0TWV0YShpdCk7XG4gIHJldHVybiBpdDtcbn07XG52YXIgbWV0YSA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBLRVk6IE1FVEEsXG4gIE5FRUQ6IGZhbHNlLFxuICBmYXN0S2V5OiBmYXN0S2V5LFxuICBnZXRXZWFrOiBnZXRXZWFrLFxuICBvbkZyZWV6ZTogb25GcmVlemVcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19tZXRhLmpzXG4vLyBtb2R1bGUgaWQgPSA1NTdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gMTkuMS4yLjIgLyAxNS4yLjMuNSBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBkUHMgPSByZXF1aXJlKCcuL19vYmplY3QtZHBzJyk7XG52YXIgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuL19lbnVtLWJ1Zy1rZXlzJyk7XG52YXIgSUVfUFJPVE8gPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJyk7XG52YXIgRW1wdHkgPSBmdW5jdGlvbiAoKSB7IC8qIGVtcHR5ICovIH07XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbi8vIENyZWF0ZSBvYmplY3Qgd2l0aCBmYWtlIGBudWxsYCBwcm90b3R5cGU6IHVzZSBpZnJhbWUgT2JqZWN0IHdpdGggY2xlYXJlZCBwcm90b3R5cGVcbnZhciBjcmVhdGVEaWN0ID0gZnVuY3Rpb24gKCkge1xuICAvLyBUaHJhc2gsIHdhc3RlIGFuZCBzb2RvbXk6IElFIEdDIGJ1Z1xuICB2YXIgaWZyYW1lID0gcmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdpZnJhbWUnKTtcbiAgdmFyIGkgPSBlbnVtQnVnS2V5cy5sZW5ndGg7XG4gIHZhciBsdCA9ICc8JztcbiAgdmFyIGd0ID0gJz4nO1xuICB2YXIgaWZyYW1lRG9jdW1lbnQ7XG4gIGlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICByZXF1aXJlKCcuL19odG1sJykuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgaWZyYW1lLnNyYyA9ICdqYXZhc2NyaXB0Oic7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2NyaXB0LXVybFxuICAvLyBjcmVhdGVEaWN0ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuT2JqZWN0O1xuICAvLyBodG1sLnJlbW92ZUNoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZURvY3VtZW50ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XG4gIGlmcmFtZURvY3VtZW50Lm9wZW4oKTtcbiAgaWZyYW1lRG9jdW1lbnQud3JpdGUobHQgKyAnc2NyaXB0JyArIGd0ICsgJ2RvY3VtZW50LkY9T2JqZWN0JyArIGx0ICsgJy9zY3JpcHQnICsgZ3QpO1xuICBpZnJhbWVEb2N1bWVudC5jbG9zZSgpO1xuICBjcmVhdGVEaWN0ID0gaWZyYW1lRG9jdW1lbnQuRjtcbiAgd2hpbGUgKGktLSkgZGVsZXRlIGNyZWF0ZURpY3RbUFJPVE9UWVBFXVtlbnVtQnVnS2V5c1tpXV07XG4gIHJldHVybiBjcmVhdGVEaWN0KCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gY3JlYXRlKE8sIFByb3BlcnRpZXMpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKE8gIT09IG51bGwpIHtcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gYW5PYmplY3QoTyk7XG4gICAgcmVzdWx0ID0gbmV3IEVtcHR5KCk7XG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IG51bGw7XG4gICAgLy8gYWRkIFwiX19wcm90b19fXCIgZm9yIE9iamVjdC5nZXRQcm90b3R5cGVPZiBwb2x5ZmlsbFxuICAgIHJlc3VsdFtJRV9QUk9UT10gPSBPO1xuICB9IGVsc2UgcmVzdWx0ID0gY3JlYXRlRGljdCgpO1xuICByZXR1cm4gUHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogZFBzKHJlc3VsdCwgUHJvcGVydGllcyk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWNyZWF0ZS5qc1xuLy8gbW9kdWxlIGlkID0gNTU4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkUCA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgZ2V0S2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzIDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKSB7XG4gIGFuT2JqZWN0KE8pO1xuICB2YXIga2V5cyA9IGdldEtleXMoUHJvcGVydGllcyk7XG4gIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgdmFyIGkgPSAwO1xuICB2YXIgUDtcbiAgd2hpbGUgKGxlbmd0aCA+IGkpIGRQLmYoTywgUCA9IGtleXNbaSsrXSwgUHJvcGVydGllc1tQXSk7XG4gIHJldHVybiBPO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcHMuanNcbi8vIG1vZHVsZSBpZCA9IDU1OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgcElFID0gcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpO1xudmFyIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIHRvUHJpbWl0aXZlID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuL19pZTgtZG9tLWRlZmluZScpO1xudmFyIGdPUEQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZ09QRCA6IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKSB7XG4gIE8gPSB0b0lPYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBnT1BEKE8sIFApO1xuICB9IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cbiAgaWYgKGhhcyhPLCBQKSkgcmV0dXJuIGNyZWF0ZURlc2MoIXBJRS5mLmNhbGwoTywgUCksIE9bUF0pO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BkLmpzXG4vLyBtb2R1bGUgaWQgPSA1NjBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gZmFsbGJhY2sgZm9yIElFMTEgYnVnZ3kgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgd2l0aCBpZnJhbWUgYW5kIHdpbmRvd1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciBnT1BOID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcG4nKS5mO1xudmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbnZhciB3aW5kb3dOYW1lcyA9IHR5cGVvZiB3aW5kb3cgPT0gJ29iamVjdCcgJiYgd2luZG93ICYmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzXG4gID8gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMod2luZG93KSA6IFtdO1xuXG52YXIgZ2V0V2luZG93TmFtZXMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZ09QTihpdCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gd2luZG93TmFtZXMuc2xpY2UoKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuZiA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpIHtcbiAgcmV0dXJuIHdpbmRvd05hbWVzICYmIHRvU3RyaW5nLmNhbGwoaXQpID09ICdbb2JqZWN0IFdpbmRvd10nID8gZ2V0V2luZG93TmFtZXMoaXQpIDogZ09QTih0b0lPYmplY3QoaXQpKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wbi1leHQuanNcbi8vIG1vZHVsZSBpZCA9IDU2MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZGVmID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIHRhZywgc3RhdCkge1xuICBpZiAoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSkgZGVmKGl0LCBUQUcsIHsgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogdGFnIH0pO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3NldC10by1zdHJpbmctdGFnLmpzXG4vLyBtb2R1bGUgaWQgPSA1NjJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKTtcbnZhciBtYXggPSBNYXRoLm1heDtcbnZhciBtaW4gPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluZGV4LCBsZW5ndGgpIHtcbiAgaW5kZXggPSB0b0ludGVnZXIoaW5kZXgpO1xuICByZXR1cm4gaW5kZXggPCAwID8gbWF4KGluZGV4ICsgbGVuZ3RoLCAwKSA6IG1pbihpbmRleCwgbGVuZ3RoKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL190by1hYnNvbHV0ZS1pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gNTYzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDcuMS4xNSBUb0xlbmd0aFxudmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKTtcbnZhciBtaW4gPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpdCA+IDAgPyBtaW4odG9JbnRlZ2VyKGl0KSwgMHgxZmZmZmZmZmZmZmZmZikgOiAwOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tbGVuZ3RoLmpzXG4vLyBtb2R1bGUgaWQgPSA1NjRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgTElCUkFSWSA9IHJlcXVpcmUoJy4vX2xpYnJhcnknKTtcbnZhciB3a3NFeHQgPSByZXF1aXJlKCcuL193a3MtZXh0Jyk7XG52YXIgZGVmaW5lUHJvcGVydHkgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobmFtZSkge1xuICB2YXIgJFN5bWJvbCA9IGNvcmUuU3ltYm9sIHx8IChjb3JlLlN5bWJvbCA9IExJQlJBUlkgPyB7fSA6IGdsb2JhbC5TeW1ib2wgfHwge30pO1xuICBpZiAobmFtZS5jaGFyQXQoMCkgIT0gJ18nICYmICEobmFtZSBpbiAkU3ltYm9sKSkgZGVmaW5lUHJvcGVydHkoJFN5bWJvbCwgbmFtZSwgeyB2YWx1ZTogd2tzRXh0LmYobmFtZSkgfSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fd2tzLWRlZmluZS5qc1xuLy8gbW9kdWxlIGlkID0gNTY1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0Jztcbi8vIDE5LjEuMy42IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcoKVxudmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuL19jbGFzc29mJyk7XG52YXIgdGVzdCA9IHt9O1xudGVzdFtyZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKV0gPSAneic7XG5pZiAodGVzdCArICcnICE9ICdbb2JqZWN0IHpdJykge1xuICByZXF1aXJlKCcuL19yZWRlZmluZScpKE9iamVjdC5wcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiAnW29iamVjdCAnICsgY2xhc3NvZih0aGlzKSArICddJztcbiAgfSwgdHJ1ZSk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzXG4vLyBtb2R1bGUgaWQgPSA1NjZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuLy8gRUNNQVNjcmlwdCA2IHN5bWJvbHMgc2hpbVxudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKTtcbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuL19yZWRlZmluZScpO1xudmFyIE1FVEEgPSByZXF1aXJlKCcuL19tZXRhJykuS0VZO1xudmFyICRmYWlscyA9IHJlcXVpcmUoJy4vX2ZhaWxzJyk7XG52YXIgc2hhcmVkID0gcmVxdWlyZSgnLi9fc2hhcmVkJyk7XG52YXIgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuL19zZXQtdG8tc3RyaW5nLXRhZycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xudmFyIHdrcyA9IHJlcXVpcmUoJy4vX3drcycpO1xudmFyIHdrc0V4dCA9IHJlcXVpcmUoJy4vX3drcy1leHQnKTtcbnZhciB3a3NEZWZpbmUgPSByZXF1aXJlKCcuL193a3MtZGVmaW5lJyk7XG52YXIgZW51bUtleXMgPSByZXF1aXJlKCcuL19lbnVtLWtleXMnKTtcbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnLi9faXMtYXJyYXknKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIHRvUHJpbWl0aXZlID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJyk7XG52YXIgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbnZhciBfY3JlYXRlID0gcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpO1xudmFyIGdPUE5FeHQgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wbi1leHQnKTtcbnZhciAkR09QRCA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BkJyk7XG52YXIgJERQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJyk7XG52YXIgJGtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xudmFyIGdPUEQgPSAkR09QRC5mO1xudmFyIGRQID0gJERQLmY7XG52YXIgZ09QTiA9IGdPUE5FeHQuZjtcbnZhciAkU3ltYm9sID0gZ2xvYmFsLlN5bWJvbDtcbnZhciAkSlNPTiA9IGdsb2JhbC5KU09OO1xudmFyIF9zdHJpbmdpZnkgPSAkSlNPTiAmJiAkSlNPTi5zdHJpbmdpZnk7XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG52YXIgSElEREVOID0gd2tzKCdfaGlkZGVuJyk7XG52YXIgVE9fUFJJTUlUSVZFID0gd2tzKCd0b1ByaW1pdGl2ZScpO1xudmFyIGlzRW51bSA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlO1xudmFyIFN5bWJvbFJlZ2lzdHJ5ID0gc2hhcmVkKCdzeW1ib2wtcmVnaXN0cnknKTtcbnZhciBBbGxTeW1ib2xzID0gc2hhcmVkKCdzeW1ib2xzJyk7XG52YXIgT1BTeW1ib2xzID0gc2hhcmVkKCdvcC1zeW1ib2xzJyk7XG52YXIgT2JqZWN0UHJvdG8gPSBPYmplY3RbUFJPVE9UWVBFXTtcbnZhciBVU0VfTkFUSVZFID0gdHlwZW9mICRTeW1ib2wgPT0gJ2Z1bmN0aW9uJztcbnZhciBRT2JqZWN0ID0gZ2xvYmFsLlFPYmplY3Q7XG4vLyBEb24ndCB1c2Ugc2V0dGVycyBpbiBRdCBTY3JpcHQsIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy8xNzNcbnZhciBzZXR0ZXIgPSAhUU9iamVjdCB8fCAhUU9iamVjdFtQUk9UT1RZUEVdIHx8ICFRT2JqZWN0W1BST1RPVFlQRV0uZmluZENoaWxkO1xuXG4vLyBmYWxsYmFjayBmb3Igb2xkIEFuZHJvaWQsIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvdjgvaXNzdWVzL2RldGFpbD9pZD02ODdcbnZhciBzZXRTeW1ib2xEZXNjID0gREVTQ1JJUFRPUlMgJiYgJGZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIF9jcmVhdGUoZFAoe30sICdhJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZFAodGhpcywgJ2EnLCB7IHZhbHVlOiA3IH0pLmE7IH1cbiAgfSkpLmEgIT0gNztcbn0pID8gZnVuY3Rpb24gKGl0LCBrZXksIEQpIHtcbiAgdmFyIHByb3RvRGVzYyA9IGdPUEQoT2JqZWN0UHJvdG8sIGtleSk7XG4gIGlmIChwcm90b0Rlc2MpIGRlbGV0ZSBPYmplY3RQcm90b1trZXldO1xuICBkUChpdCwga2V5LCBEKTtcbiAgaWYgKHByb3RvRGVzYyAmJiBpdCAhPT0gT2JqZWN0UHJvdG8pIGRQKE9iamVjdFByb3RvLCBrZXksIHByb3RvRGVzYyk7XG59IDogZFA7XG5cbnZhciB3cmFwID0gZnVuY3Rpb24gKHRhZykge1xuICB2YXIgc3ltID0gQWxsU3ltYm9sc1t0YWddID0gX2NyZWF0ZSgkU3ltYm9sW1BST1RPVFlQRV0pO1xuICBzeW0uX2sgPSB0YWc7XG4gIHJldHVybiBzeW07XG59O1xuXG52YXIgaXNTeW1ib2wgPSBVU0VfTkFUSVZFICYmIHR5cGVvZiAkU3ltYm9sLml0ZXJhdG9yID09ICdzeW1ib2wnID8gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0eXBlb2YgaXQgPT0gJ3N5bWJvbCc7XG59IDogZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpdCBpbnN0YW5jZW9mICRTeW1ib2w7XG59O1xuXG52YXIgJGRlZmluZVByb3BlcnR5ID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgRCkge1xuICBpZiAoaXQgPT09IE9iamVjdFByb3RvKSAkZGVmaW5lUHJvcGVydHkoT1BTeW1ib2xzLCBrZXksIEQpO1xuICBhbk9iamVjdChpdCk7XG4gIGtleSA9IHRvUHJpbWl0aXZlKGtleSwgdHJ1ZSk7XG4gIGFuT2JqZWN0KEQpO1xuICBpZiAoaGFzKEFsbFN5bWJvbHMsIGtleSkpIHtcbiAgICBpZiAoIUQuZW51bWVyYWJsZSkge1xuICAgICAgaWYgKCFoYXMoaXQsIEhJRERFTikpIGRQKGl0LCBISURERU4sIGNyZWF0ZURlc2MoMSwge30pKTtcbiAgICAgIGl0W0hJRERFTl1ba2V5XSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChoYXMoaXQsIEhJRERFTikgJiYgaXRbSElEREVOXVtrZXldKSBpdFtISURERU5dW2tleV0gPSBmYWxzZTtcbiAgICAgIEQgPSBfY3JlYXRlKEQsIHsgZW51bWVyYWJsZTogY3JlYXRlRGVzYygwLCBmYWxzZSkgfSk7XG4gICAgfSByZXR1cm4gc2V0U3ltYm9sRGVzYyhpdCwga2V5LCBEKTtcbiAgfSByZXR1cm4gZFAoaXQsIGtleSwgRCk7XG59O1xudmFyICRkZWZpbmVQcm9wZXJ0aWVzID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhpdCwgUCkge1xuICBhbk9iamVjdChpdCk7XG4gIHZhciBrZXlzID0gZW51bUtleXMoUCA9IHRvSU9iamVjdChQKSk7XG4gIHZhciBpID0gMDtcbiAgdmFyIGwgPSBrZXlzLmxlbmd0aDtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKGwgPiBpKSAkZGVmaW5lUHJvcGVydHkoaXQsIGtleSA9IGtleXNbaSsrXSwgUFtrZXldKTtcbiAgcmV0dXJuIGl0O1xufTtcbnZhciAkY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGl0LCBQKSB7XG4gIHJldHVybiBQID09PSB1bmRlZmluZWQgPyBfY3JlYXRlKGl0KSA6ICRkZWZpbmVQcm9wZXJ0aWVzKF9jcmVhdGUoaXQpLCBQKTtcbn07XG52YXIgJHByb3BlcnR5SXNFbnVtZXJhYmxlID0gZnVuY3Rpb24gcHJvcGVydHlJc0VudW1lcmFibGUoa2V5KSB7XG4gIHZhciBFID0gaXNFbnVtLmNhbGwodGhpcywga2V5ID0gdG9QcmltaXRpdmUoa2V5LCB0cnVlKSk7XG4gIGlmICh0aGlzID09PSBPYmplY3RQcm90byAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhaGFzKE9QU3ltYm9scywga2V5KSkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gRSB8fCAhaGFzKHRoaXMsIGtleSkgfHwgIWhhcyhBbGxTeW1ib2xzLCBrZXkpIHx8IGhhcyh0aGlzLCBISURERU4pICYmIHRoaXNbSElEREVOXVtrZXldID8gRSA6IHRydWU7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSkge1xuICBpdCA9IHRvSU9iamVjdChpdCk7XG4gIGtleSA9IHRvUHJpbWl0aXZlKGtleSwgdHJ1ZSk7XG4gIGlmIChpdCA9PT0gT2JqZWN0UHJvdG8gJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIWhhcyhPUFN5bWJvbHMsIGtleSkpIHJldHVybjtcbiAgdmFyIEQgPSBnT1BEKGl0LCBrZXkpO1xuICBpZiAoRCAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0pKSBELmVudW1lcmFibGUgPSB0cnVlO1xuICByZXR1cm4gRDtcbn07XG52YXIgJGdldE93blByb3BlcnR5TmFtZXMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KSB7XG4gIHZhciBuYW1lcyA9IGdPUE4odG9JT2JqZWN0KGl0KSk7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIGkgPSAwO1xuICB2YXIga2V5O1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkge1xuICAgIGlmICghaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pICYmIGtleSAhPSBISURERU4gJiYga2V5ICE9IE1FVEEpIHJlc3VsdC5wdXNoKGtleSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgJGdldE93blByb3BlcnR5U3ltYm9scyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5U3ltYm9scyhpdCkge1xuICB2YXIgSVNfT1AgPSBpdCA9PT0gT2JqZWN0UHJvdG87XG4gIHZhciBuYW1lcyA9IGdPUE4oSVNfT1AgPyBPUFN5bWJvbHMgOiB0b0lPYmplY3QoaXQpKTtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIgaSA9IDA7XG4gIHZhciBrZXk7XG4gIHdoaWxlIChuYW1lcy5sZW5ndGggPiBpKSB7XG4gICAgaWYgKGhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiAoSVNfT1AgPyBoYXMoT2JqZWN0UHJvdG8sIGtleSkgOiB0cnVlKSkgcmVzdWx0LnB1c2goQWxsU3ltYm9sc1trZXldKTtcbiAgfSByZXR1cm4gcmVzdWx0O1xufTtcblxuLy8gMTkuNC4xLjEgU3ltYm9sKFtkZXNjcmlwdGlvbl0pXG5pZiAoIVVTRV9OQVRJVkUpIHtcbiAgJFN5bWJvbCA9IGZ1bmN0aW9uIFN5bWJvbCgpIHtcbiAgICBpZiAodGhpcyBpbnN0YW5jZW9mICRTeW1ib2wpIHRocm93IFR5cGVFcnJvcignU3ltYm9sIGlzIG5vdCBhIGNvbnN0cnVjdG9yIScpO1xuICAgIHZhciB0YWcgPSB1aWQoYXJndW1lbnRzLmxlbmd0aCA+IDAgPyBhcmd1bWVudHNbMF0gOiB1bmRlZmluZWQpO1xuICAgIHZhciAkc2V0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAodGhpcyA9PT0gT2JqZWN0UHJvdG8pICRzZXQuY2FsbChPUFN5bWJvbHMsIHZhbHVlKTtcbiAgICAgIGlmIChoYXModGhpcywgSElEREVOKSAmJiBoYXModGhpc1tISURERU5dLCB0YWcpKSB0aGlzW0hJRERFTl1bdGFnXSA9IGZhbHNlO1xuICAgICAgc2V0U3ltYm9sRGVzYyh0aGlzLCB0YWcsIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbiAgICB9O1xuICAgIGlmIChERVNDUklQVE9SUyAmJiBzZXR0ZXIpIHNldFN5bWJvbERlc2MoT2JqZWN0UHJvdG8sIHRhZywgeyBjb25maWd1cmFibGU6IHRydWUsIHNldDogJHNldCB9KTtcbiAgICByZXR1cm4gd3JhcCh0YWcpO1xuICB9O1xuICByZWRlZmluZSgkU3ltYm9sW1BST1RPVFlQRV0sICd0b1N0cmluZycsIGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLl9rO1xuICB9KTtcblxuICAkR09QRC5mID0gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgJERQLmYgPSAkZGVmaW5lUHJvcGVydHk7XG4gIHJlcXVpcmUoJy4vX29iamVjdC1nb3BuJykuZiA9IGdPUE5FeHQuZiA9ICRnZXRPd25Qcm9wZXJ0eU5hbWVzO1xuICByZXF1aXJlKCcuL19vYmplY3QtcGllJykuZiA9ICRwcm9wZXJ0eUlzRW51bWVyYWJsZTtcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LWdvcHMnKS5mID0gJGdldE93blByb3BlcnR5U3ltYm9scztcblxuICBpZiAoREVTQ1JJUFRPUlMgJiYgIXJlcXVpcmUoJy4vX2xpYnJhcnknKSkge1xuICAgIHJlZGVmaW5lKE9iamVjdFByb3RvLCAncHJvcGVydHlJc0VudW1lcmFibGUnLCAkcHJvcGVydHlJc0VudW1lcmFibGUsIHRydWUpO1xuICB9XG5cbiAgd2tzRXh0LmYgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiB3cmFwKHdrcyhuYW1lKSk7XG4gIH07XG59XG5cbiRleHBvcnQoJGV4cG9ydC5HICsgJGV4cG9ydC5XICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsIHsgU3ltYm9sOiAkU3ltYm9sIH0pO1xuXG5mb3IgKHZhciBlczZTeW1ib2xzID0gKFxuICAvLyAxOS40LjIuMiwgMTkuNC4yLjMsIDE5LjQuMi40LCAxOS40LjIuNiwgMTkuNC4yLjgsIDE5LjQuMi45LCAxOS40LjIuMTAsIDE5LjQuMi4xMSwgMTkuNC4yLjEyLCAxOS40LjIuMTMsIDE5LjQuMi4xNFxuICAnaGFzSW5zdGFuY2UsaXNDb25jYXRTcHJlYWRhYmxlLGl0ZXJhdG9yLG1hdGNoLHJlcGxhY2Usc2VhcmNoLHNwZWNpZXMsc3BsaXQsdG9QcmltaXRpdmUsdG9TdHJpbmdUYWcsdW5zY29wYWJsZXMnXG4pLnNwbGl0KCcsJyksIGogPSAwOyBlczZTeW1ib2xzLmxlbmd0aCA+IGo7KXdrcyhlczZTeW1ib2xzW2orK10pO1xuXG5mb3IgKHZhciB3ZWxsS25vd25TeW1ib2xzID0gJGtleXMod2tzLnN0b3JlKSwgayA9IDA7IHdlbGxLbm93blN5bWJvbHMubGVuZ3RoID4gazspIHdrc0RlZmluZSh3ZWxsS25vd25TeW1ib2xzW2srK10pO1xuXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCAnU3ltYm9sJywge1xuICAvLyAxOS40LjIuMSBTeW1ib2wuZm9yKGtleSlcbiAgJ2Zvcic6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gaGFzKFN5bWJvbFJlZ2lzdHJ5LCBrZXkgKz0gJycpXG4gICAgICA/IFN5bWJvbFJlZ2lzdHJ5W2tleV1cbiAgICAgIDogU3ltYm9sUmVnaXN0cnlba2V5XSA9ICRTeW1ib2woa2V5KTtcbiAgfSxcbiAgLy8gMTkuNC4yLjUgU3ltYm9sLmtleUZvcihzeW0pXG4gIGtleUZvcjogZnVuY3Rpb24ga2V5Rm9yKHN5bSkge1xuICAgIGlmICghaXNTeW1ib2woc3ltKSkgdGhyb3cgVHlwZUVycm9yKHN5bSArICcgaXMgbm90IGEgc3ltYm9sIScpO1xuICAgIGZvciAodmFyIGtleSBpbiBTeW1ib2xSZWdpc3RyeSkgaWYgKFN5bWJvbFJlZ2lzdHJ5W2tleV0gPT09IHN5bSkgcmV0dXJuIGtleTtcbiAgfSxcbiAgdXNlU2V0dGVyOiBmdW5jdGlvbiAoKSB7IHNldHRlciA9IHRydWU7IH0sXG4gIHVzZVNpbXBsZTogZnVuY3Rpb24gKCkgeyBzZXR0ZXIgPSBmYWxzZTsgfVxufSk7XG5cbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsICdPYmplY3QnLCB7XG4gIC8vIDE5LjEuMi4yIE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbiAgY3JlYXRlOiAkY3JlYXRlLFxuICAvLyAxOS4xLjIuNCBPYmplY3QuZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcylcbiAgZGVmaW5lUHJvcGVydHk6ICRkZWZpbmVQcm9wZXJ0eSxcbiAgLy8gMTkuMS4yLjMgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcylcbiAgZGVmaW5lUHJvcGVydGllczogJGRlZmluZVByb3BlcnRpZXMsXG4gIC8vIDE5LjEuMi42IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUClcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxuICAvLyAxOS4xLjIuNyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxuICBnZXRPd25Qcm9wZXJ0eU5hbWVzOiAkZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgLy8gMTkuMS4yLjggT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhPKVxuICBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM6ICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHNcbn0pO1xuXG4vLyAyNC4zLjIgSlNPTi5zdHJpbmdpZnkodmFsdWUgWywgcmVwbGFjZXIgWywgc3BhY2VdXSlcbiRKU09OICYmICRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogKCFVU0VfTkFUSVZFIHx8ICRmYWlscyhmdW5jdGlvbiAoKSB7XG4gIHZhciBTID0gJFN5bWJvbCgpO1xuICAvLyBNUyBFZGdlIGNvbnZlcnRzIHN5bWJvbCB2YWx1ZXMgdG8gSlNPTiBhcyB7fVxuICAvLyBXZWJLaXQgY29udmVydHMgc3ltYm9sIHZhbHVlcyB0byBKU09OIGFzIG51bGxcbiAgLy8gVjggdGhyb3dzIG9uIGJveGVkIHN5bWJvbHNcbiAgcmV0dXJuIF9zdHJpbmdpZnkoW1NdKSAhPSAnW251bGxdJyB8fCBfc3RyaW5naWZ5KHsgYTogUyB9KSAhPSAne30nIHx8IF9zdHJpbmdpZnkoT2JqZWN0KFMpKSAhPSAne30nO1xufSkpLCAnSlNPTicsIHtcbiAgc3RyaW5naWZ5OiBmdW5jdGlvbiBzdHJpbmdpZnkoaXQpIHtcbiAgICB2YXIgYXJncyA9IFtpdF07XG4gICAgdmFyIGkgPSAxO1xuICAgIHZhciByZXBsYWNlciwgJHJlcGxhY2VyO1xuICAgIHdoaWxlIChhcmd1bWVudHMubGVuZ3RoID4gaSkgYXJncy5wdXNoKGFyZ3VtZW50c1tpKytdKTtcbiAgICAkcmVwbGFjZXIgPSByZXBsYWNlciA9IGFyZ3NbMV07XG4gICAgaWYgKCFpc09iamVjdChyZXBsYWNlcikgJiYgaXQgPT09IHVuZGVmaW5lZCB8fCBpc1N5bWJvbChpdCkpIHJldHVybjsgLy8gSUU4IHJldHVybnMgc3RyaW5nIG9uIHVuZGVmaW5lZFxuICAgIGlmICghaXNBcnJheShyZXBsYWNlcikpIHJlcGxhY2VyID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgIGlmICh0eXBlb2YgJHJlcGxhY2VyID09ICdmdW5jdGlvbicpIHZhbHVlID0gJHJlcGxhY2VyLmNhbGwodGhpcywga2V5LCB2YWx1ZSk7XG4gICAgICBpZiAoIWlzU3ltYm9sKHZhbHVlKSkgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gICAgYXJnc1sxXSA9IHJlcGxhY2VyO1xuICAgIHJldHVybiBfc3RyaW5naWZ5LmFwcGx5KCRKU09OLCBhcmdzKTtcbiAgfVxufSk7XG5cbi8vIDE5LjQuMy40IFN5bWJvbC5wcm90b3R5cGVbQEB0b1ByaW1pdGl2ZV0oaGludClcbiRTeW1ib2xbUFJPVE9UWVBFXVtUT19QUklNSVRJVkVdIHx8IHJlcXVpcmUoJy4vX2hpZGUnKSgkU3ltYm9sW1BST1RPVFlQRV0sIFRPX1BSSU1JVElWRSwgJFN5bWJvbFtQUk9UT1RZUEVdLnZhbHVlT2YpO1xuLy8gMTkuNC4zLjUgU3ltYm9sLnByb3RvdHlwZVtAQHRvU3RyaW5nVGFnXVxuc2V0VG9TdHJpbmdUYWcoJFN5bWJvbCwgJ1N5bWJvbCcpO1xuLy8gMjAuMi4xLjkgTWF0aFtAQHRvU3RyaW5nVGFnXVxuc2V0VG9TdHJpbmdUYWcoTWF0aCwgJ01hdGgnLCB0cnVlKTtcbi8vIDI0LjMuMyBKU09OW0BAdG9TdHJpbmdUYWddXG5zZXRUb1N0cmluZ1RhZyhnbG9iYWwuSlNPTiwgJ0pTT04nLCB0cnVlKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvZXM2LnN5bWJvbC5qc1xuLy8gbW9kdWxlIGlkID0gNTY3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcIikoZmFsc2UpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiLm9hay5zcGFjZXIge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgZGlzcGxheTogYmxvY2s7XFxufVxcbi5vYWsuc3BhY2VyLmlubGluZSB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XFxufVxcbi5vYWsuc3BhY2VyLmZsdWlkIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZmxleDogMSAxIDEwMCU7XFxufVxcbi5vYWsuc3BhY2VyLnRpbnkge1xcbiAgd2lkdGg6IDJweDtcXG4gIGhlaWdodDogMnB4O1xcbn1cXG4ub2FrLnNwYWNlci5zbWFsbCB7XFxuICB3aWR0aDogNHB4O1xcbiAgaGVpZ2h0OiA0cHg7XFxufVxcbi5vYWsuc3BhY2VyLm1lZGl1bSB7XFxuICB3aWR0aDogMTBweDtcXG4gIGhlaWdodDogMTBweDtcXG59XFxuLm9hay5zcGFjZXIubGFyZ2Uge1xcbiAgd2lkdGg6IDIwcHg7XFxuICBoZWlnaHQ6IDIwcHg7XFxufVxcbi5vYWsuc3BhY2VyLmh1Z2Uge1xcbiAgd2lkdGg6IDMwcHg7XFxuICBoZWlnaHQ6IDMwcHg7XFxufVxcbi5vYWsuc3BhY2VyLm1hc3NpdmUge1xcbiAgd2lkdGg6IDUwcHg7XFxuICBoZWlnaHQ6IDUwcHg7XFxufVxcblwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jc3MtbG9hZGVyIS4vfi9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3NyYy9hcHAvU3BhY2VyLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDU2OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKGZhbHNlKTtcbi8vIGltcG9ydHNcblxuXG4vLyBtb2R1bGVcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIi5mdWxsV2lkdGgge1xcbiAgd2lkdGg6IDEwMCU7XFxufVxcbi5mdWxsSGVpZ2h0IHtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuLmZ1bGxTaXplIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG5cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY3NzLWxvYWRlciEuL34vbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zcmMvYXBwL3N0eWxlcy5sZXNzXG4vLyBtb2R1bGUgaWQgPSA1NzBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy9cbi8vXHQjIENvcmUgYHJ1bGVzYCAtLSBzaW1wbGUgZGF0YXR5cGVzLCBldGMuXG4vL1xuLy8gTk9URTogbWFueSBvZiB0aGUgYmVsb3cgYXJlIGNyZWF0ZWQgYXMgY3VzdG9tIFBhdHRlcm4gc3ViY2xhc3NlcyBmb3IgZGVidWdnaW5nLlxuLy9cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4uLy4uL1BhcnNlclwiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVcIjtcbmltcG9ydCBUb2tlbml6ZXIgZnJvbSBcIi4uLy4uL1Rva2VuaXplclwiO1xuXG4vLyBDcmVhdGUgYGNvcmVgIHBhcnNlciBjb250ZXh0LlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck5hbWUoXCJjb3JlXCIpO1xuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG5wYXJzZXIuZGVmaW5lUnVsZXMoXG4gIHtcbiAgICBuYW1lOiBcInN0YXRlbWVudHNcIixcbiAgICBjb25zdHJ1Y3RvcjogUnVsZS5TdGF0ZW1lbnRzXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiY29tbWVudFwiLFxuICAgIGNvbnN0cnVjdG9yOiBSdWxlLkNvbW1lbnRcbiAgfSxcblxuICAvLyBgd29yZGAgPSBpcyBhIHNpbmdsZSBhbHBoYW51bWVyaWMgd29yZC5cbiAgLy8gTVVTVCBzdGFydCB3aXRoIGEgbG93ZXItY2FzZSBsZXR0ZXIgKD8pXG4gIHtcbiAgICBuYW1lOiBcIndvcmRcIixcbiAgICBwYXR0ZXJuOiAvXlthLXpdW1xcd1xcLV0qJC8sXG4gICAgY2Fub25pY2FsOiBcIldvcmRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgd29yZCBleHRlbmRzIFJ1bGUuUGF0dGVybiB7XG4gICAgICAvLyBDb252ZXJ0IFwiLVwiIHRvIFwiX1wiIGluIHNvdXJjZSBvdXRwdXQuXG4gICAgICB0b1NvdXJjZShjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoZWQucmVwbGFjZSgvXFwtL2csIFwiX1wiKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gYGlkZW50aWZpZXJgID0gdmFyaWFibGVzIG9yIHByb3BlcnR5IG5hbWUuXG4gIC8vIE1VU1Qgc3RhcnQgd2l0aCBhIGxvd2VyLWNhc2UgbGV0dGVyICg/KVxuICAvLyBOT1RFOiBXZSBibGFja2xpc3QgYSBsb3Qgb2Ygd29yZHMgYXMgaWRlbnRpZmllcnMuXG4gIHtcbiAgICBuYW1lOiBcImlkZW50aWZpZXJcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgY2Fub25pY2FsOiBcIklkZW5maWZpZXJcIixcbiAgICBwYXR0ZXJuOiAvXlthLXpdW1xcd1xcLV0qJC8sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlkZW50aWZpZXIgZXh0ZW5kcyBSdWxlLlBhdHRlcm4ge1xuICAgICAgLy8gQ29udmVydCBcIi1cIiB0byBcIl9cIiBpbiBzb3VyY2Ugb3V0cHV0LlxuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVkLnJlcGxhY2UoL1xcLS9nLCBcIl9cIik7XG4gICAgICB9XG4gICAgfSxcbiAgICBibGFja2xpc3Q6IFtcbiAgICAgIC8vIEFkZCBFbmdsaXNoIHByZXBvc2l0aW9ucyB0byBpZGVudGlmaWVyIGJsYWNrbGlzdC5cbiAgICAgIC8vXG4gICAgICAvLyBXaWtpcGVkaWEgXCJQcmVwb3NpdGlvblwiOlxuICAgICAgLy9cdFwiUHJlcG9zaXRpb25zLi4uYXJlIGEgY2xhc3Mgb2Ygd29yZHMgdGhhdFxuICAgICAgLy9cdGV4cHJlc3Mgc3BhdGlhbCBvciB0ZW1wb3JhbCByZWxhdGlvbnMgIChpbiwgdW5kZXIsIHRvd2FyZHMsIGJlZm9yZSlcbiAgICAgIC8vXHRvciBtYXJrIHZhcmlvdXMgc2VtYW50aWMgcm9sZXMgKG9mLCBmb3IpLlxuICAgICAgLy8gVEVTVE1FXG4gICAgICBcImFib3V0XCIsIFwiYWJvdmVcIiwgXCJhZnRlclwiLCBcImFuZFwiLCBcImFzXCIsIFwiYXRcIixcbiAgICAgIFwiYmVmb3JlXCIsIFwiYmVoaW5kXCIsIFwiYmVsb3dcIiwgXCJiZW5lYXRoXCIsIFwiYmVzaWRlXCIsIFwiYmV0d2VlblwiLCBcImJleW9uZFwiLCBcImJ5XCIsXG4gICAgICBcImRlZmluZWRcIiwgXCJkb3duXCIsIFwiZHVyaW5nXCIsXG4gICAgICBcImVhY2hcIiwgXCJlbXB0eVwiLCBcImV4YWN0bHlcIiwgXCJleGNlcHRcIixcbiAgICAgIFwiZm9yXCIsIFwiZnJvbVwiLFxuICAgICAgXCJncmVhdGVyXCIsXG4gICAgICBcIklcIiwgXCJpblwiLCBcImludG9cIixcbiAgICAgIFwibGVzc1wiLCBcImxvbmdcIixcbiAgICAgIFwibWVcIiwgXCJtaW51c1wiLCBcIm1vcmVcIixcbiAgICAgIFwibmVhclwiLCBcIm5vdFwiLFxuICAgICAgXCJvZlwiLCBcIm9mZlwiLCBcIm9uXCIsIFwib250b1wiLCBcIm9wcG9zaXRlXCIsIFwib3JcIiwgXCJvdXRcIiwgXCJvdXRzaWRlXCIsIFwib3ZlclwiLFxuICAgICAgXCJzaG9ydFwiLCBcInNpbmNlXCIsXG4gICAgICBcInRoYW5cIiwgXCJ0aGVcIiwgXCJ0aGVuXCIsIFwidGhyb3VnaFwiLCBcInRocnVcIiwgXCJ0b1wiLCBcInRvd2FyZFwiLCBcInRvd2FyZHNcIixcbiAgICAgIFwidW5kZWZpbmVkXCIsIFwidW5kZXJcIiwgXCJ1bmRlcm5lYXRoXCIsIFwidW5pcXVlXCIsIFwidW50aWxcIiwgXCJ1cFwiLCBcInVwb25cIiwgXCJ1cHNpZGVcIixcbiAgICAgIFwidmVyc3VzXCIsIFwidnNcIixcbiAgICAgIFwid2hlcmVcIiwgXCJ3aXRoXCIsIFwid2l0aGluXCIsIFwid2l0aG91dFwiLFxuXG4gICAgICAvLyBBZGQgY29tbW9uIGVuZ2xpc2ggdmVyYnMgdG8gaWRlbnRpZmllciBibGFja2xpc3QuXG4gICAgICBcImFyZVwiLFxuICAgICAgXCJkb1wiLCBcImRvZXNcIixcbiAgICAgIFwiY29udGFpbnNcIixcbiAgICAgIFwiaGFzXCIsIFwiaGF2ZVwiLFxuICAgICAgXCJpc1wiLFxuICAgICAgXCJyZXBlYXRcIixcbiAgICAgIFwid2FzXCIsIFwid2VyZVwiLFxuXG4gICAgICAvLyBBZGQgc3BlY2lhbCBjb250cm9sIGtleXdvcmRzIHRvIGlkZW50aWZpZXIgYmxhY2tsaXN0LlxuICAgICAgXCJlbHNlXCIsXG4gICAgICBcImlmXCIsXG4gICAgICBcIm90aGVyd2lzZVwiLFxuICAgICAgXCJ3aGlsZVwiLFxuXG4gICAgICAvLyBBZGQgYm9vbGVhbiB0b2tlbnMgdG8gaWRlbnRpZmllciBibGFja2xpc3QuXG4gICAgICBcInRydWVcIiwgXCJmYWxzZVwiLFxuICAgICAgXCJ5ZXNcIiwgXCJub1wiLFxuICAgICAgXCJva1wiLCBcImNhbmNlbFwiLFxuICAgICAgXCJzdWNjZXNzXCIsIFwiZmFpbHVyZVwiLFxuXG4gICAgICAvLyBBZGQgbnVtYmVyIHdvcmRzIHRvIGlkZW50aWZpZXIgYmxhY2tsaXN0LlxuICAgICAgLy8gVEVTVE1FXG4gICAgICBcIm9uZVwiLCBcInR3b1wiLCBcInRocmVlXCIsIFwiZm91clwiLCBcImZpdmVcIixcbiAgICAgIFwic2l4XCIsIFwic2V2ZW5cIiwgXCJlaWdodFwiLCBcIm5pbmVcIiwgXCJ0ZW5cIixcbiAgICBdXG4gIH0sXG5cbiAgLy8gYFR5cGVgID0gdHlwZSBuYW1lLlxuICAvLyBNVVNUIHN0YXJ0IHdpdGggYW4gdXBwZXItY2FzZSBsZXR0ZXIgKD8pXG4gIHtcbiAgICBuYW1lOiBcInR5cGVcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgY2Fub25pY2FsOiBcIlR5cGVcIixcbiAgICBwYXR0ZXJuOiAvXihbQS1aXVtcXHdcXC1dKnxsaXN0fHRleHR8bnVtYmVyfGludGVnZXJ8ZGVjaW1hbHxjaGFyYWN0ZXJ8Ym9vbGVhbnxvYmplY3QpJC8sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHR5cGUgZXh0ZW5kcyBSdWxlLlBhdHRlcm4ge1xuICAgICAgLy8gQ29udmVydCBcIi1cIiB0byBcIl9cIiBpbiBzb3VyY2Ugb3V0cHV0LlxuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICBsZXQgdHlwZSA9IHRoaXMubWF0Y2hlZDtcbiAgICAgICAgc3dpdGNoKHR5cGUpIHtcbiAgICAgICAgICAvLyBBbGlhcyBgTGlzdGAgdG8gYEFycmF5YFxuICAgICAgICAgIGNhc2UgXCJMaXN0XCI6XHRcdHJldHVybiBcIkFycmF5XCI7XG5cbiAgICAgICAgICAvLyBzcGVjaWFsIGNhc2UgdG8gdGFrZSB0aGUgZm9sbG93aW5nIGFzIGxvd2VyY2FzZVxuICAgICAgICAgIGNhc2UgXCJsaXN0XCI6XHRcdHJldHVybiBcIkFycmF5XCI7XG4gICAgICAgICAgY2FzZSBcInRleHRcIjpcdFx0cmV0dXJuIFwiU3RyaW5nXCI7XG4gICAgICAgICAgY2FzZSBcImNoYXJhY3RlclwiOlx0cmV0dXJuIFwiQ2hhcmFjdGVyXCI7XG4gICAgICAgICAgY2FzZSBcIm51bWJlclwiOlx0XHRyZXR1cm4gXCJOdW1iZXJcIjtcbiAgICAgICAgICBjYXNlIFwiaW50ZWdlclwiOlx0XHRyZXR1cm4gXCJJbnRlZ2VyXCI7XG4gICAgICAgICAgY2FzZSBcImRlY2ltYWxcIjpcdFx0cmV0dXJuIFwiRGVjaW1hbFwiO1xuICAgICAgICAgIGNhc2UgXCJib29sZWFuXCI6XHRcdHJldHVybiBcIkJvb2xlYW5cIjtcbiAgICAgICAgICBjYXNlIFwib2JqZWN0XCI6XHRcdHJldHVybiBcIk9iamVjdFwiO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gdHlwZS5yZXBsYWNlKC9cXC0vZywgXCJfXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBibGFja2xpc3Q6IFsgXCJJXCIgXVxuICB9LFxuXG5cblxuICAvLyBCb29sZWFuIGxpdGVyYWwsIGNyZWF0ZWQgd2l0aCBjdXN0b20gY29uc3RydWN0b3IgZm9yIGRlYnVnZ2luZy5cbiAgLy8gVE9ETzogYmV0dGVyIG5hbWUgZm9yIHRoaXM/Pz9cbiAge1xuICAgIG5hbWU6IFwiYm9vbGVhblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBjYW5vbmljYWw6IFwiQm9vbGVhblwiLFxuICAgIHBhdHRlcm46IC9eKHRydWV8ZmFsc2V8eWVzfG5vfG9rfGNhbmNlbHxzdWNjZXNzfGZhaWx1cmUpJC8sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGJvb2xlYW4gZXh0ZW5kcyBSdWxlLlBhdHRlcm4ge1xuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMubWF0Y2hlZCkge1xuICAgICAgICAgIGNhc2UgXCJ0cnVlXCI6XG4gICAgICAgICAgY2FzZSBcInllc1wiOlxuICAgICAgICAgIGNhc2UgXCJva1wiOlxuICAgICAgICAgIGNhc2UgXCJzdWNjZXNzXCI6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gYG51bWJlcmAgYXMgZWl0aGVyIGZsb2F0IG9yIGludGVnZXIsIGNyZWF0ZWQgd2l0aCBjdXN0b20gY29uc3RydWN0b3IgZm9yIGRlYnVnZ2luZy5cbiAgLy8gTk9URTogeW91IGNhbiBhbHNvIHVzZSBgb25lYC4uLmB0ZW5gIGFzIHN0cmluZ3MuJ1xuICAvLyBUT0RPOiAgYGludGVnZXJgIGFuZCBgZGVjaW1hbGA/ICB0b28gdGVjaHk/XG4gIHtcbiAgICBuYW1lOiBcIm51bWJlclwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBjYW5vbmljYWw6IFwiTnVtYmVyXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG51bWJlciBleHRlbmRzIFJ1bGUge1xuICAgICAgLy8gU3BlY2lhbCB3b3JkcyB5b3UgY2FuIHVzZSBhcyBudW1iZXJzLi4uXG4gICAgICBzdGF0aWMgTlVNQkVSX05BTUVTID0ge1xuICAgICAgICB6ZXJvOiAwLFxuICAgICAgICBvbmU6IDEsXG4gICAgICAgIHR3bzogMixcbiAgICAgICAgdGhyZWU6IDMsXG4gICAgICAgIGZvdXI6IDQsXG4gICAgICAgIGZpdmU6IDUsXG4gICAgICAgIHNpeDogNixcbiAgICAgICAgc2V2ZW46IDcsXG4gICAgICAgIGVpZ2h0OiA4LFxuICAgICAgICBuaW5lOiA5LFxuICAgICAgICB0ZW46IDEwXG4gICAgICB9XG5cbiAgICAgIC8vIE51bWJlcnMgZ2V0IGVuY29kZWQgYXMgbnVtYmVycyBpbiB0aGUgdG9rZW4gc3RyZWFtLlxuICAgICAgcGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCkge1xuICAgICAgICBsZXQgdG9rZW4gPSB0b2tlbnNbc3RhcnRdO1xuICAgICAgICAvLyBpZiBhIHN0cmluZywgYXR0ZW1wdCB0byBydW4gdGhyb3VnaCBvdXIgTlVNQkVSX05BTUVTXG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW4gPT09IFwic3RyaW5nXCIpIHRva2VuID0gUnVsZS5OdW1iZXIuTlVNQkVSX05BTUVTW3Rva2VuXTtcbiAgICAgICAgaWYgKHR5cGVvZiB0b2tlbiAhPT0gXCJudW1iZXJcIikgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoe1xuICAgICAgICAgIG1hdGNoZWQ6IHRva2VuLFxuICAgICAgICAgIG5leHRTdGFydDogc3RhcnQgKyAxXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBDb252ZXJ0IHRvIG51bWJlciBvbiBzb3VyY2Ugb3V0cHV0LlxuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVkO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBMaXRlcmFsIGB0ZXh0YCBzdHJpbmcsIGNyZWF0ZWQgd2l0aCBjdXN0b20gY29uc3RydWN0b3IgZm9yIGRlYnVnZ2luZy5cbiAgLy8gWW91IGNhbiB1c2UgZWl0aGVyIHNpbmdsZSBvciBkb3VibGUgcXVvdGVzIG9uIHRoZSBvdXRzaWRlIChhbHRob3VnaCBkb3VibGUgcXVvdGVzIGFyZSBwcmVmZXJyZWQpLlxuICAvLyBSZXR1cm5lZCB2YWx1ZSBoYXMgZW5jbG9zaW5nIHF1b3Rlcy5cbiAge1xuICAgIG5hbWU6IFwidGV4dFwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBjYW5vbmljYWw6IFwiVGV4dFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0ZXh0IGV4dGVuZHMgUnVsZSB7XG4gICAgICAvLyBUZXh0IHN0cmluZ3MgZ2V0IGVuY29kZWQgYXMgYHRleHRgIG9iamVjdHMgaW4gdGhlIHRva2VuIHN0cmVhbS5cbiAgICAgIHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDApIHtcbiAgICAgICAgbGV0IHRva2VuID0gdG9rZW5zW3N0YXJ0XTtcbiAgICAgICAgaWYgKCEodG9rZW4gaW5zdGFuY2VvZiBUb2tlbml6ZXIuVGV4dCkpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiB0aGlzLmNsb25lKHtcbiAgICAgICAgICBtYXRjaGVkOiB0b2tlbixcbiAgICAgICAgICBuZXh0U3RhcnQ6IHN0YXJ0ICsgMVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVkLnF1b3RlZFN0cmluZztcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gTGl0ZXJhbCBsaXN0IChhcnJheSksIGVnOiAgYFsxLDIgLCB0cnVlLGZhbHNlIF1gXG4gIHtcbiAgICBuYW1lOiBcImxpdGVyYWxfbGlzdFwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiXFxcXFtbbGlzdDp7ZXhwcmVzc2lvbn0sXT9cXFxcXVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXRlcmFsX2xpc3QgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHsgbGlzdCB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gYFske2xpc3QgPyBsaXN0LmpvaW4oXCIsIFwiKSA6IFwiXCJ9XWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gUGFyZW50aGVzaXplZCBleHByZXNzaW9uXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcInBhcmVudGhlc2l6ZWRfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiXFxcXCh7ZXhwcmVzc2lvbn1cXFxcKVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBwYXJlbnRoZXNpemVkX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIGdldCByZXN1bHRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVkWzFdO1xuICAgICAgfVxuICAgICAgdG9Tb3VyY2UoY29udGV4dCkge1xuICAgICAgICBsZXQgZXhwcmVzc2lvbiA9IHRoaXMucmVzdWx0cy50b1NvdXJjZShjb250ZXh0KTtcbiAgICAgICAgLy8gZG9uJ3QgZG91YmxlIHBhcmVucyBpZiBub3QgbmVjZXNzYXJ5XG4gICAgICAgIGlmICh0eXBlb2YgZXhwcmVzc2lvbiA9PT0gXCJzdHJpbmdcIiAmJiBleHByZXNzaW9uLnN0YXJ0c1dpdGgoXCIoXCIpICYmIGV4cHJlc3Npb24uZW5kc1dpdGgoXCIpXCIpKSByZXR1cm4gZXhwcmVzc2lvbjtcbiAgICAgICAgcmV0dXJuIGAoJHtleHByZXNzaW9ufSlgO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL2NvcmUuanMiLCIvLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfSB9KS5hICE9IDc7XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzXG4vLyBtb2R1bGUgaWQgPSA3MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faGFzLmpzXG4vLyBtb2R1bGUgaWQgPSA3M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4vX2llOC1kb20tZGVmaW5lJyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKTtcbnZhciBkUCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgYW5PYmplY3QoQXR0cmlidXRlcyk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gZFAoTywgUCwgQXR0cmlidXRlcyk7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKSB0aHJvdyBUeXBlRXJyb3IoJ0FjY2Vzc29ycyBub3Qgc3VwcG9ydGVkIScpO1xuICBpZiAoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKSBPW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcbiAgcmV0dXJuIE87XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwLmpzXG4vLyBtb2R1bGUgaWQgPSA3NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxMy1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0UHJvcFR5cGVzU2VjcmV0ID0gcmVxdWlyZSgnLi9saWIvUmVhY3RQcm9wVHlwZXNTZWNyZXQnKTtcblxuZnVuY3Rpb24gZW1wdHlGdW5jdGlvbigpIHt9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIHNoaW0ocHJvcHMsIHByb3BOYW1lLCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgcHJvcEZ1bGxOYW1lLCBzZWNyZXQpIHtcbiAgICBpZiAoc2VjcmV0ID09PSBSZWFjdFByb3BUeXBlc1NlY3JldCkge1xuICAgICAgLy8gSXQgaXMgc3RpbGwgc2FmZSB3aGVuIGNhbGxlZCBmcm9tIFJlYWN0LlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKFxuICAgICAgJ0NhbGxpbmcgUHJvcFR5cGVzIHZhbGlkYXRvcnMgZGlyZWN0bHkgaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgYHByb3AtdHlwZXNgIHBhY2thZ2UuICcgK1xuICAgICAgJ1VzZSBQcm9wVHlwZXMuY2hlY2tQcm9wVHlwZXMoKSB0byBjYWxsIHRoZW0uICcgK1xuICAgICAgJ1JlYWQgbW9yZSBhdCBodHRwOi8vZmIubWUvdXNlLWNoZWNrLXByb3AtdHlwZXMnXG4gICAgKTtcbiAgICBlcnIubmFtZSA9ICdJbnZhcmlhbnQgVmlvbGF0aW9uJztcbiAgICB0aHJvdyBlcnI7XG4gIH07XG4gIHNoaW0uaXNSZXF1aXJlZCA9IHNoaW07XG4gIGZ1bmN0aW9uIGdldFNoaW0oKSB7XG4gICAgcmV0dXJuIHNoaW07XG4gIH07XG4gIC8vIEltcG9ydGFudCFcbiAgLy8gS2VlcCB0aGlzIGxpc3QgaW4gc3luYyB3aXRoIHByb2R1Y3Rpb24gdmVyc2lvbiBpbiBgLi9mYWN0b3J5V2l0aFR5cGVDaGVja2Vycy5qc2AuXG4gIHZhciBSZWFjdFByb3BUeXBlcyA9IHtcbiAgICBhcnJheTogc2hpbSxcbiAgICBib29sOiBzaGltLFxuICAgIGZ1bmM6IHNoaW0sXG4gICAgbnVtYmVyOiBzaGltLFxuICAgIG9iamVjdDogc2hpbSxcbiAgICBzdHJpbmc6IHNoaW0sXG4gICAgc3ltYm9sOiBzaGltLFxuXG4gICAgYW55OiBzaGltLFxuICAgIGFycmF5T2Y6IGdldFNoaW0sXG4gICAgZWxlbWVudDogc2hpbSxcbiAgICBpbnN0YW5jZU9mOiBnZXRTaGltLFxuICAgIG5vZGU6IHNoaW0sXG4gICAgb2JqZWN0T2Y6IGdldFNoaW0sXG4gICAgb25lT2Y6IGdldFNoaW0sXG4gICAgb25lT2ZUeXBlOiBnZXRTaGltLFxuICAgIHNoYXBlOiBnZXRTaGltLFxuICAgIGV4YWN0OiBnZXRTaGltXG4gIH07XG5cbiAgUmVhY3RQcm9wVHlwZXMuY2hlY2tQcm9wVHlwZXMgPSBlbXB0eUZ1bmN0aW9uO1xuICBSZWFjdFByb3BUeXBlcy5Qcm9wVHlwZXMgPSBSZWFjdFByb3BUeXBlcztcblxuICByZXR1cm4gUmVhY3RQcm9wVHlwZXM7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3Byb3AtdHlwZXMvZmFjdG9yeVdpdGhUaHJvd2luZ1NoaW1zLmpzXG4vLyBtb2R1bGUgaWQgPSA3NzBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG4vKipcbiAqIEBtb2R1bGUgY29tcG9uZW50V3JhcHBlclxuICpcbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0ICogYXMgc3RvcmUgZnJvbSAnLi4vc3RvcmUnO1xuaW1wb3J0IHsgb25Nb3VudCwgb25Vbm1vdW50IH0gZnJvbSAnLi4vZXZlbnRfaGFuZGxlcnMnO1xuaW1wb3J0IHsgQUxMX0tFWVMgfSBmcm9tICcuLi9saWIva2V5cyc7XG5cbi8qKlxuICogY29tcG9uZW50V3JhcHBlclxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gV3JhcHBlZENvbXBvbmVudCBSZWFjdCBjb21wb25lbnQgY2xhc3MgdG8gYmUgd3JhcHBlZFxuICogQHBhcmFtIHthcnJheX0gW2tleXNdIFRoZSBrZXkocykgYm91bmQgdG8gdGhlIGNsYXNzXG4gKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBoaWdoZXItb3JkZXIgZnVuY3Rpb24gdGhhdCB3cmFwcyB0aGUgZGVjb3JhdGVkIGNsYXNzXG4gKi9cbmZ1bmN0aW9uIGNvbXBvbmVudFdyYXBwZXIoV3JhcHBlZENvbXBvbmVudCkge1xuICB2YXIga2V5cyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogQUxMX0tFWVM7XG5cbiAgdmFyIEtleUJvYXJkSGVscGVyID0gZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoS2V5Qm9hcmRIZWxwZXIsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gS2V5Qm9hcmRIZWxwZXIocHJvcHMpIHtcbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBLZXlCb2FyZEhlbHBlcik7XG5cbiAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChLZXlCb2FyZEhlbHBlci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKEtleUJvYXJkSGVscGVyKSkuY2FsbCh0aGlzLCBwcm9wcykpO1xuXG4gICAgICBfdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgZXZlbnQ6IG51bGxcbiAgICAgIH07XG4gICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEtleUJvYXJkSGVscGVyLCBbe1xuICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBvbk1vdW50KHRoaXMpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgb25Vbm1vdW50KHRoaXMpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2hhbmRsZUtleURvd24nLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZUtleURvd24oZXZlbnQpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgLy8gdG8gc2ltdWxhdGUgYSBrZXlwcmVzcywgc2V0IHRoZSBldmVudCBhbmQgdGhlbiBjbGVhciBpdCBpbiB0aGUgY2FsbGJhY2tcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGV2ZW50OiBldmVudCB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzMi5zZXRTdGF0ZSh7IGV2ZW50OiBudWxsIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoV3JhcHBlZENvbXBvbmVudCwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHsga2V5ZG93bjogdGhpcy5zdGF0ZSB9KSk7XG4gICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEtleUJvYXJkSGVscGVyO1xuICB9KFJlYWN0LkNvbXBvbmVudCk7XG5cbiAgc3RvcmUuc2V0QmluZGluZyh7IGtleXM6IFtdLmNvbmNhdChrZXlzKSwgZm46IEtleUJvYXJkSGVscGVyLnByb3RvdHlwZS5oYW5kbGVLZXlEb3duLCB0YXJnZXQ6IEtleUJvYXJkSGVscGVyLnByb3RvdHlwZSB9KTtcblxuICByZXR1cm4gS2V5Qm9hcmRIZWxwZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbXBvbmVudFdyYXBwZXI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9jbGFzc19kZWNvcmF0b3IuanNcbi8vIG1vZHVsZSBpZCA9IDg0MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbi8qKlxuICogQG1vZHVsZSBkZWNvcmF0b3JzXG4gKlxuICovXG5pbXBvcnQgY2xhc3NXcmFwcGVyIGZyb20gJy4vY2xhc3NfZGVjb3JhdG9yJztcbmltcG9ydCBtZXRob2RXcmFwcGVyIGZyb20gJy4vbWV0aG9kX2RlY29yYXRvcic7XG5pbXBvcnQgbWV0aG9kV3JhcHBlclNjb3BlZCBmcm9tICcuL21ldGhvZF9kZWNvcmF0b3Jfc2NvcGVkJztcblxuLyoqXG4gKiBub29wRGVjb3JhdG9yXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9IFJldHVybnMgYHVuZGVmaW5lZGAgc28gdGhhdCB0aGUgb3JpZ2luYWwgdW5kZWNvcmF0ZWQgaW5zdGFuY2UvbWV0aG9kIGlzIHVzZWRcbiAqL1xuZnVuY3Rpb24gbm9vcERlY29yYXRvcigpIHtcbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBfZGVjb3JhdG9yXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtZXRob2RGbiBUaGUgbWV0aG9kIHdyYXBwZXIgdG8gZGVsZWdhdGUgdG8sIGJhc2VkIG9uIHdoZXRoZXIgdXNlciBoYXMgc3BlY2lmaWVkIGEgc2NvcGVkIGRlY29yYXRvciBvciBub3RcbiAqIEBwYXJhbSB7QXJyYXl9IC4uLmFyZ3MgUmVtYWluZGVyIG9mIGFyZ3VtZW50cyBwYXNzZWQgaW5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgZGVjb3JhdGVkIGNsYXNzIG9yIG1ldGhvZFxuICovXG5mdW5jdGlvbiBfZGVjb3JhdG9yKG1ldGhvZEZuKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgLy8gY2hlY2sgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHNlZSBpZiBpdCdzIGEgdXNlci1zdXBwbGllZCBrZXljb2RlIG9yIGFycmF5XG4gIC8vIG9mIGtleWNvZGVzLCBvciBpZiBpdCdzIHRoZSB3cmFwcGVkIGNsYXNzIG9yIG1ldGhvZFxuICB2YXIgdGVzdEFyZyA9IGFyZ3NbMF07XG4gIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSh0ZXN0QXJnKTtcblxuICAvLyBpZiB0aGUgdGVzdCBhcmd1bWVudCBpcyBub3QgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uLCBpdCBpcyB1c2VyLXN1cHBsaWVkXG4gIC8vIGtleWNvZGVzLiBlbHNlIHRoZXJlIGFyZSBubyBhcmd1bWVudHMgYW5kIGl0J3MganVzdCB0aGUgd3JhcHBlZCBjbGFzc1xuICBpZiAoaXNBcnJheSB8fCB+WydzdHJpbmcnLCAnbnVtYmVyJywgJ3N5bWJvbCddLmluZGV4T2YodHlwZW9mIHRlc3RBcmcgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKHRlc3RBcmcpKSkge1xuICAgIHZhciBrZXlzID0gaXNBcnJheSA/IHRlc3RBcmcgOiBhcmdzO1xuXG4gICAgLy8gcmV0dXJuIHRoZSBkZWNvcmF0b3IgZnVuY3Rpb24sIHdoaWNoIG9uIHRoZSBuZXh0IGNhbGwgd2lsbCBsb29rIGZvclxuICAgIC8vIHRoZSBwcmVzZW5jZSBvZiBhIG1ldGhvZCBuYW1lIHRvIGRldGVybWluZSBpZiB0aGlzIGlzIGEgd3JhcHBlZCBtZXRob2RcbiAgICAvLyBvciBjb21wb25lbnRcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbWV0aG9kTmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgcmV0dXJuIG1ldGhvZE5hbWUgPyBtZXRob2RGbih7IHRhcmdldDogdGFyZ2V0LCBkZXNjcmlwdG9yOiBkZXNjcmlwdG9yLCBrZXlzOiBrZXlzIH0pIDogY2xhc3NXcmFwcGVyKHRhcmdldCwga2V5cyk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgV3JhcHBlZENvbXBvbmVudCA9IGFyZ3NbMF07XG4gICAgdmFyIG1ldGhvZE5hbWUgPSBhcmdzWzFdO1xuXG4gICAgLy8gbWV0aG9kIGRlY29yYXRvcnMgd2l0aG91dCBrZXljb2RlICh3aGljaCkgYXJndW1lbnRzIGFyZSBub3QgYWxsb3dlZC5cbiAgICBpZiAoV3JhcHBlZENvbXBvbmVudCAmJiAhbWV0aG9kTmFtZSkge1xuICAgICAgcmV0dXJuIGNsYXNzV3JhcHBlci5hcHBseSh1bmRlZmluZWQsIGFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4obWV0aG9kTmFtZSArICc6IE1ldGhvZCBkZWNvcmF0b3JzIG11c3QgaGF2ZSBrZXljb2RlIGFyZ3VtZW50cywgc28gdGhlIGRlY29yYXRvciBmb3IgdGhpcyBtZXRob2Qgd2lsbCBub3QgZG8gYW55dGhpbmcnKTtcbiAgICAgIHJldHVybiBub29wRGVjb3JhdG9yO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIGtleWRvd25TY29wZWRcbiAqXG4gKiBNZXRob2QgZGVjb3JhdG9yIHRoYXQgd2lsbCBsb29rIGZvciBjaGFuZ2VzIHRvIGl0cyB0YXJnZXRlZCBjb21wb25lbnQnc1xuICogYGtleWRvd25gIHByb3BzIHRvIGRlY2lkZSB3aGVuIHRvIHRyaWdnZXIsIHJhdGhlciB0aGFuIHJlc3BvbmRpbmcgZGlyZWN0bHlcbiAqIHRvIGtleWRvd24gZXZlbnRzLiBUaGlzIGxldHMgeW91IHNwZWNpZnkgYSBAa2V5ZG93biBkZWNvcmF0ZWQgY2xhc3MgaGlnaGVyXG4gKiB1cCBpbiB0aGUgdmlldyBoaWVyYXJjaHkgZm9yIGxhcmdlciBzY29waW5nIG9mIGtleWRvd24gZXZlbnRzLCBvciBmb3JcbiAqIHByb2dyYW1tYXRpY2FsbHkgc2VuZGluZyBrZXlkb3duIGV2ZW50cyBhcyBwcm9wcyBpbnRvIHRoZSBjb21wb25lbnRzIGluIG9yZGVyXG4gKiB0byB0cmlnZ2VyIGRlY29yYXRlZCBtZXRob2RzIHdpdGggbWF0Y2hpbmcga2V5cy5cbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtBcnJheX0gLi4uYXJncyAgQWxsIChvciBubykgYXJndW1lbnRzIHBhc3NlZCBpbiBmcm9tIGRlY29yYXRpb25cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgZGVjb3JhdGVkIGNsYXNzIG9yIG1ldGhvZFxuICovXG5mdW5jdGlvbiBrZXlkb3duU2NvcGVkKCkge1xuICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuMiksIF9rZXkyID0gMDsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgIGFyZ3NbX2tleTJdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgfVxuXG4gIHJldHVybiBfZGVjb3JhdG9yLmFwcGx5KHVuZGVmaW5lZCwgW21ldGhvZFdyYXBwZXJTY29wZWRdLmNvbmNhdChhcmdzKSk7XG59XG5cbi8qKlxuICoga2V5ZG93blxuICpcbiAqIFRoZSBtYWluIGRlY29yYXRvciBhbmQgZGVmYXVsdCBleHBvcnQsIGhhbmRsZXMgYm90aCBjbGFzc2VzIGFuZCBtZXRob2RzLlxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge0FycmF5fSAuLi5hcmdzICBBbGwgKG9yIG5vKSBhcmd1bWVudHMgcGFzc2VkIGluIGZyb20gZGVjb3JhdGlvblxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBkZWNvcmF0ZWQgY2xhc3Mgb3IgbWV0aG9kXG4gKi9cbmZ1bmN0aW9uIGtleWRvd24oKSB7XG4gIGZvciAodmFyIF9sZW4zID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4zKSwgX2tleTMgPSAwOyBfa2V5MyA8IF9sZW4zOyBfa2V5MysrKSB7XG4gICAgYXJnc1tfa2V5M10gPSBhcmd1bWVudHNbX2tleTNdO1xuICB9XG5cbiAgcmV0dXJuIF9kZWNvcmF0b3IuYXBwbHkodW5kZWZpbmVkLCBbbWV0aG9kV3JhcHBlcl0uY29uY2F0KGFyZ3MpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQga2V5ZG93bjtcblxuZXhwb3J0IHsga2V5ZG93blNjb3BlZCB9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDg0MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbi8qKlxuICogQG1vZHVsZSBtZXRob2RXcmFwcGVyXG4gKlxuICovXG5pbXBvcnQgKiBhcyBzdG9yZSBmcm9tICcuLi9zdG9yZSc7XG5pbXBvcnQgeyBvbk1vdW50LCBvblVubW91bnQsIF9vbktleURvd24gfSBmcm9tICcuLi9ldmVudF9oYW5kbGVycyc7XG5cbi8qKlxuICogX2lzUmVhY3RLZXlEb3duXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgVGhlIHBvc3NpYmx5IHN5bnRoZXRpYyBldmVudCBwYXNzZWQgYXMgYW4gYXJndW1lbnQgd2l0aFxuICogdGhlIG1ldGhvZCBpbnZvY2F0aW9uLlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gX2lzUmVhY3RLZXlEb3duKGV2ZW50KSB7XG4gIHJldHVybiBldmVudCAmJiAodHlwZW9mIGV2ZW50ID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihldmVudCkpID09PSAnb2JqZWN0JyAmJiBldmVudC5uYXRpdmVFdmVudCBpbnN0YW5jZW9mIHdpbmRvdy5LZXlib2FyZEV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICdrZXlkb3duJztcbn1cblxuLyoqXG4gKiBtZXRob2RXcmFwcGVyXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzIEFsbCBhcmd1bWVudHMgbmVjZXNzYXJ5IGZvciB3cmFwcGluZyBtZXRob2RcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzLnRhcmdldCBUaGUgZGVjb3JhdGVkIGNsYXNzXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncy5kZXNjcmlwdG9yIE1ldGhvZCBkZXNjcmlwdG9yXG4gKiBAcGFyYW0ge2FycmF5fSBhcmdzLmtleXMgVGhlIGFycmF5IG9mIGtleXMgYm91bmQgdG8gdGhlIGdpdmVuIG1ldGhvZFxuICogQHJldHVybiB7b2JqZWN0fSBUaGUgbWV0aG9kIGRlc2NyaXB0b3JcbiAqL1xuZnVuY3Rpb24gbWV0aG9kV3JhcHBlcihfcmVmKSB7XG4gIHZhciB0YXJnZXQgPSBfcmVmLnRhcmdldCxcbiAgICAgIGRlc2NyaXB0b3IgPSBfcmVmLmRlc2NyaXB0b3IsXG4gICAgICBrZXlzID0gX3JlZi5rZXlzO1xuXG5cbiAgdmFyIGZuID0gZGVzY3JpcHRvci52YWx1ZTtcblxuICAvLyBpZiB3ZSBoYXZlbid0IGFscmVhZHkgY3JlYXRlZCBhIGJpbmRpbmcgZm9yIHRoaXMgY2xhc3MgKHZpYSBhbm90aGVyXG4gIC8vIGRlY29yYXRlZCBtZXRob2QpLCB3cmFwIHRoZXNlIGxpZmVjeWNsZSBtZXRob2RzLlxuICBpZiAoIXN0b3JlLmdldEJpbmRpbmcodGFyZ2V0KSkge1xuICAgIHZhciBjb21wb25lbnREaWRNb3VudCA9IHRhcmdldC5jb21wb25lbnREaWRNb3VudCxcbiAgICAgICAgY29tcG9uZW50V2lsbFVubW91bnQgPSB0YXJnZXQuY29tcG9uZW50V2lsbFVubW91bnQ7XG5cblxuICAgIHRhcmdldC5jb21wb25lbnREaWRNb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIG9uTW91bnQodGhpcyk7XG4gICAgICBpZiAoY29tcG9uZW50RGlkTW91bnQpIHJldHVybiBjb21wb25lbnREaWRNb3VudC5jYWxsKHRoaXMpO1xuICAgIH07XG5cbiAgICB0YXJnZXQuY29tcG9uZW50V2lsbFVubW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBvblVubW91bnQodGhpcyk7XG4gICAgICBpZiAoY29tcG9uZW50V2lsbFVubW91bnQpIHJldHVybiBjb21wb25lbnRXaWxsVW5tb3VudC5jYWxsKHRoaXMpO1xuICAgIH07XG4gIH1cblxuICAvLyBhZGQgdGhpcyBiaW5kaW5nIG9mIGtleXMgYW5kIG1ldGhvZCB0byB0aGUgdGFyZ2V0J3MgYmluZGluZ3NcbiAgc3RvcmUuc2V0QmluZGluZyh7IGtleXM6IGtleXMsIHRhcmdldDogdGFyZ2V0LCBmbjogZm4gfSk7XG5cbiAgZGVzY3JpcHRvci52YWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICB2YXIgbWF5YmVFdmVudCA9IGFyZ3NbMF07XG5cbiAgICBpZiAoX2lzUmVhY3RLZXlEb3duKG1heWJlRXZlbnQpKSB7XG4gICAgICAvLyBwcm94eSBtZXRob2QgaW4gb3JkZXIgdG8gdXNlIEBrZXlkb3duIGFzIGZpbHRlciBmb3Iga2V5ZG93biBldmVudHMgY29taW5nXG4gICAgICAvLyBmcm9tIGFuIGFjdHVhbCBvbktleURvd24gYmluZGluZyAoYXMgaWRlbnRpZmllZCBieSByZWFjdCdzIGFkZGl0aW9uIG9mXG4gICAgICAvLyAnbmF0aXZlRXZlbnQnICsgdHlwZSA9PT0gJ2tleWRvd24nKVxuICAgICAgaWYgKCFtYXliZUV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgLy8gd2UgYWxyZWFkeSB3aGl0ZWxpc3Qgc2hvcnRjdXRzIHdpdGggY3RybCBtb2RpZmllcnMgc28gaWYgd2Ugd2VyZSB0b1xuICAgICAgICAvLyBmaXJlIGl0IGFnYWluIGhlcmUgdGhlIG1ldGhvZCB3b3VsZCB0cmlnZ2VyIHR3aWNlLiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2dsb3J0aG8vcmVhY3Qta2V5ZG93bi9pc3N1ZXMvMzhcbiAgICAgICAgcmV0dXJuIF9vbktleURvd24obWF5YmVFdmVudCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghbWF5YmVFdmVudCB8fCAhKG1heWJlRXZlbnQgaW5zdGFuY2VvZiB3aW5kb3cuS2V5Ym9hcmRFdmVudCkgfHwgbWF5YmVFdmVudC50eXBlICE9PSAna2V5ZG93bicpIHtcbiAgICAgIC8vIGlmIG91ciBmaXJzdCBhcmd1bWVudCBpcyBhIGtleWRvd24gZXZlbnQgaXQgaXMgYmVpbmcgaGFuZGxlZCBieSBvdXJcbiAgICAgIC8vIGJpbmRpbmcgc3lzdGVtLiBpZiBpdCdzIGFueXRoaW5nIGVsc2UsIGp1c3QgcGFzcyB0aHJvdWdoLlxuICAgICAgcmV0dXJuIGZuLmNhbGwuYXBwbHkoZm4sIFt0aGlzXS5jb25jYXQoYXJncykpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZGVzY3JpcHRvcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWV0aG9kV3JhcHBlcjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9kZWNvcmF0b3JzL21ldGhvZF9kZWNvcmF0b3IuanNcbi8vIG1vZHVsZSBpZCA9IDg0M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEBtb2R1bGUgbWV0aG9kV3JhcHBlclNjb3BlZFxuICpcbiAqL1xuaW1wb3J0IG1hdGNoS2V5cyBmcm9tICcuLi9saWIvbWF0Y2hfa2V5cyc7XG5pbXBvcnQgcGFyc2VLZXlzIGZyb20gJy4uL2xpYi9wYXJzZV9rZXlzJztcblxuLyoqXG4gKiBtZXRob2RXcmFwcGVyU2NvcGVkXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzIEFsbCBhcmdzIG5lY2Vzc2FyeSBmb3IgZGVjb3JhdGluZyB0aGUgbWV0aG9kXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncy50YXJnZXQgVGhlIGRlY29yYXRlZCBtZXRob2QncyBjbGFzcyBvYmplY3RcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzLmRlc2NyaXB0b3IgVGhlIG1ldGhvZCdzIGRlc2NyaXB0b3Igb2JqZWN0XG4gKiBAcGFyYW0ge2FycmF5fSBhcmdzLmtleXMgVGhlIGtleSBjb2RlcyBib3VuZCB0byB0aGUgZGVjb3JhdGVkIG1ldGhvZFxuICogQHJldHVybiB7b2JqZWN0fSBUaGUgbWV0aG9kJ3MgZGVzY3JpcHRvciBvYmplY3RcbiAqL1xuZnVuY3Rpb24gbWV0aG9kV3JhcHBlclNjb3BlZChfcmVmKSB7XG4gIHZhciB0YXJnZXQgPSBfcmVmLnRhcmdldCxcbiAgICAgIGRlc2NyaXB0b3IgPSBfcmVmLmRlc2NyaXB0b3IsXG4gICAgICBrZXlzID0gX3JlZi5rZXlzO1xuICB2YXIgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IHRhcmdldC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzO1xuXG4gIHZhciBmbiA9IGRlc2NyaXB0b3IudmFsdWU7XG4gIGlmICgha2V5cykge1xuICAgIGNvbnNvbGUud2FybihmbiArICc6IGtleWRvd25TY29wZWQgcmVxdWlyZXMgb25lIG9yIG1vcmUga2V5cycpO1xuICB9IGVsc2Uge1xuXG4gICAgLyoqXG4gICAgICogX3Nob3VsZFRyaWdnZXJcbiAgICAgKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGlzUHJvcHMgRXhzdGluZyBwcm9wcyBmcm9tIHRoZSB3cmFwcGVkIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGlzUHJvcHMua2V5ZG93biBUaGUgbmFtZXNwYWNlZCBzdGF0ZSBmcm9tIHRoZSBoaWdoZXItb3JkZXJcbiAgICAgKiBjb21wb25lbnQgKGNsYXNzX2RlY29yYXRvcilcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbmV4dFByb3BzIFRoZSBpbmNvbWluZyBwcm9wcyBmcm9tIHRoZSB3cmFwcGVkIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBuZXh0UHJvcHMua2V5ZG93biBUaGUgbmFtZXNjYXBlZCBzdGF0ZSBmcm9tIHRoZSBoaWdoZXItb3JkZXJcbiAgICAgKiBjb21wb25lbnQgKGNsYXNzX2RlY29yYXRvcilcbiAgICAgKiBAcGFyYW0ge2FycmF5fSBrZXlzIFRoZSBrZXlzIGJvdW5kIHRvIHRoZSBkZWNvcmF0ZWQgbWV0aG9kXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciBhbGwgdGVzdHMgaGF2ZSBwYXNzZWRcbiAgICAgKi9cbiAgICB2YXIgX3Nob3VsZFRyaWdnZXIgPSBmdW5jdGlvbiBfc2hvdWxkVHJpZ2dlcihrZXlkb3duVGhpcywga2V5ZG93bk5leHQpIHtcbiAgICAgIGlmICghKGtleWRvd25OZXh0ICYmIGtleWRvd25OZXh0LmV2ZW50ICYmICFrZXlkb3duVGhpcy5ldmVudCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgcmV0dXJuIGtleVNldHMuc29tZShmdW5jdGlvbiAoa2V5U2V0KSB7XG4gICAgICAgIHJldHVybiBtYXRjaEtleXMoeyBrZXlTZXQ6IGtleVNldCwgZXZlbnQ6IGtleWRvd25OZXh0LmV2ZW50IH0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIHdyYXAgdGhlIGNvbXBvbmVudCdzIGxpZmVjeWNsZSBtZXRob2QgdG8gaW50ZXJjZXB0IGtleSBjb2RlcyBjb21pbmcgZG93blxuICAgIC8vIGZyb20gdGhlIHdyYXBwZWQvc2NvcGVkIGNvbXBvbmVudCB1cCB0aGUgdmlldyBoaWVyYXJjaHkuIGlmIG5ldyBrZXlkb3duXG4gICAgLy8gZXZlbnQgaGFzIGFycml2ZWQgYW5kIHRoZSBrZXkgY29kZXMgbWF0Y2ggd2hhdCB3YXMgc3BlY2lmaWVkIGluIHRoZVxuICAgIC8vIGRlY29yYXRvciwgY2FsbCB0aGUgd3JhcHBlZCBtZXRob2QuXG5cblxuICAgIHZhciBrZXlTZXRzID0gcGFyc2VLZXlzKGtleXMpO3RhcmdldC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzID0gZnVuY3Rpb24gKG5leHRQcm9wcykge1xuICAgICAgdmFyIGtleWRvd25OZXh0ID0gbmV4dFByb3BzLmtleWRvd247XG4gICAgICB2YXIga2V5ZG93blRoaXMgPSB0aGlzLnByb3BzLmtleWRvd247XG5cblxuICAgICAgaWYgKF9zaG91bGRUcmlnZ2VyKGtleWRvd25UaGlzLCBrZXlkb3duTmV4dCkpIHtcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywga2V5ZG93bk5leHQuZXZlbnQpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgYXJnc1tfa2V5IC0gMV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIGlmIChjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKSByZXR1cm4gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcy5jYWxsLmFwcGx5KGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMsIFt0aGlzLCBuZXh0UHJvcHNdLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBkZXNjcmlwdG9yO1xufVxuXG5leHBvcnQgZGVmYXVsdCBtZXRob2RXcmFwcGVyU2NvcGVkO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvbWV0aG9kX2RlY29yYXRvcl9zY29wZWQuanNcbi8vIG1vZHVsZSBpZCA9IDg0NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBwb2x5ZmlsbCBhcnJheS5mcm9tIChtYWlubHkgZm9yIElFKVxuaW1wb3J0ICcuL2xpYi9hcnJheS5mcm9tJztcblxuLy8gQGtleWRvd24gYW5kIEBrZXlkb3duU2NvcGVkXG5leHBvcnQgeyBkZWZhdWx0LCBrZXlkb3duU2NvcGVkIH0gZnJvbSAnLi9kZWNvcmF0b3JzJztcblxuLy8gc2V0QmluZGluZyAtIG9ubHkgdXNlZnVsIGlmIHlvdSdyZSBub3QgZ29pbmcgdG8gdXNlIGRlY29yYXRvcnNcbmV4cG9ydCB7IHNldEJpbmRpbmcgfSBmcm9tICcuL3N0b3JlJztcblxuLy8gS2V5cyAtIHVzZSB0aGlzIHRvIGZpbmQga2V5IGNvZGVzIGZvciBzdHJpbmdzLiBmb3IgZXhhbXBsZTogS2V5cy5qLCBLZXlzLmVudGVyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEtleXMsIEFMTF9LRVlTLCBBTExfUFJJTlRBQkxFX0tFWVMgfSBmcm9tICcuL2xpYi9rZXlzJztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gODQ1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIFByb2R1Y3Rpb24gc3RlcHMgb2YgRUNNQS0yNjIsIEVkaXRpb24gNiwgMjIuMS4yLjFcbi8vIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9mcm9tXG5pZiAoIUFycmF5LmZyb20pIHtcbiAgQXJyYXkuZnJvbSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuICAgIHZhciBpc0NhbGxhYmxlID0gZnVuY3Rpb24gaXNDYWxsYWJsZShmbikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJyB8fCB0b1N0ci5jYWxsKGZuKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgICB9O1xuICAgIHZhciB0b0ludGVnZXIgPSBmdW5jdGlvbiB0b0ludGVnZXIodmFsdWUpIHtcbiAgICAgIHZhciBudW1iZXIgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgaWYgKGlzTmFOKG51bWJlcikpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgICBpZiAobnVtYmVyID09PSAwIHx8ICFpc0Zpbml0ZShudW1iZXIpKSB7XG4gICAgICAgIHJldHVybiBudW1iZXI7XG4gICAgICB9XG4gICAgICByZXR1cm4gKG51bWJlciA+IDAgPyAxIDogLTEpICogTWF0aC5mbG9vcihNYXRoLmFicyhudW1iZXIpKTtcbiAgICB9O1xuICAgIHZhciBtYXhTYWZlSW50ZWdlciA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gICAgdmFyIHRvTGVuZ3RoID0gZnVuY3Rpb24gdG9MZW5ndGgodmFsdWUpIHtcbiAgICAgIHZhciBsZW4gPSB0b0ludGVnZXIodmFsdWUpO1xuICAgICAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KGxlbiwgMCksIG1heFNhZmVJbnRlZ2VyKTtcbiAgICB9O1xuXG4gICAgLy8gVGhlIGxlbmd0aCBwcm9wZXJ0eSBvZiB0aGUgZnJvbSBtZXRob2QgaXMgMS5cbiAgICByZXR1cm4gZnVuY3Rpb24gZnJvbShhcnJheUxpa2UgLyosIG1hcEZuLCB0aGlzQXJnICovKSB7XG4gICAgICAvLyAxLiBMZXQgQyBiZSB0aGUgdGhpcyB2YWx1ZS5cbiAgICAgIHZhciBDID0gdGhpcztcblxuICAgICAgLy8gMi4gTGV0IGl0ZW1zIGJlIFRvT2JqZWN0KGFycmF5TGlrZSkuXG4gICAgICB2YXIgaXRlbXMgPSBPYmplY3QoYXJyYXlMaWtlKTtcblxuICAgICAgLy8gMy4gUmV0dXJuSWZBYnJ1cHQoaXRlbXMpLlxuICAgICAgaWYgKGFycmF5TGlrZSA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcnJheS5mcm9tIHJlcXVpcmVzIGFuIGFycmF5LWxpa2Ugb2JqZWN0IC0gbm90IG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgfVxuXG4gICAgICAvLyA0LiBJZiBtYXBmbiBpcyB1bmRlZmluZWQsIHRoZW4gbGV0IG1hcHBpbmcgYmUgZmFsc2UuXG4gICAgICB2YXIgbWFwRm4gPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHZvaWQgdW5kZWZpbmVkO1xuICAgICAgdmFyIFQ7XG4gICAgICBpZiAodHlwZW9mIG1hcEZuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAvLyA1LiBlbHNlXG4gICAgICAgIC8vIDUuIGEgSWYgSXNDYWxsYWJsZShtYXBmbikgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgICAgaWYgKCFpc0NhbGxhYmxlKG1hcEZuKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FycmF5LmZyb206IHdoZW4gcHJvdmlkZWQsIHRoZSBzZWNvbmQgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyA1LiBiLiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVCBiZSB1bmRlZmluZWQuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgICAgICAgIFQgPSBhcmd1bWVudHNbMl07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gMTAuIExldCBsZW5WYWx1ZSBiZSBHZXQoaXRlbXMsIFwibGVuZ3RoXCIpLlxuICAgICAgLy8gMTEuIExldCBsZW4gYmUgVG9MZW5ndGgobGVuVmFsdWUpLlxuICAgICAgdmFyIGxlbiA9IHRvTGVuZ3RoKGl0ZW1zLmxlbmd0aCk7XG5cbiAgICAgIC8vIDEzLiBJZiBJc0NvbnN0cnVjdG9yKEMpIGlzIHRydWUsIHRoZW5cbiAgICAgIC8vIDEzLiBhLiBMZXQgQSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbQ29uc3RydWN0XV0gaW50ZXJuYWwgbWV0aG9kIFxuICAgICAgLy8gb2YgQyB3aXRoIGFuIGFyZ3VtZW50IGxpc3QgY29udGFpbmluZyB0aGUgc2luZ2xlIGl0ZW0gbGVuLlxuICAgICAgLy8gMTQuIGEuIEVsc2UsIExldCBBIGJlIEFycmF5Q3JlYXRlKGxlbikuXG4gICAgICB2YXIgQSA9IGlzQ2FsbGFibGUoQykgPyBPYmplY3QobmV3IEMobGVuKSkgOiBuZXcgQXJyYXkobGVuKTtcblxuICAgICAgLy8gMTYuIExldCBrIGJlIDAuXG4gICAgICB2YXIgayA9IDA7XG4gICAgICAvLyAxNy4gUmVwZWF0LCB3aGlsZSBrIDwgbGVu4oCmIChhbHNvIHN0ZXBzIGEgLSBoKVxuICAgICAgdmFyIGtWYWx1ZTtcbiAgICAgIHdoaWxlIChrIDwgbGVuKSB7XG4gICAgICAgIGtWYWx1ZSA9IGl0ZW1zW2tdO1xuICAgICAgICBpZiAobWFwRm4pIHtcbiAgICAgICAgICBBW2tdID0gdHlwZW9mIFQgPT09ICd1bmRlZmluZWQnID8gbWFwRm4oa1ZhbHVlLCBrKSA6IG1hcEZuLmNhbGwoVCwga1ZhbHVlLCBrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBBW2tdID0ga1ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGsgKz0gMTtcbiAgICAgIH1cbiAgICAgIC8vIDE4LiBMZXQgcHV0U3RhdHVzIGJlIFB1dChBLCBcImxlbmd0aFwiLCBsZW4sIHRydWUpLlxuICAgICAgQS5sZW5ndGggPSBsZW47XG4gICAgICAvLyAyMC4gUmV0dXJuIEEuXG4gICAgICByZXR1cm4gQTtcbiAgICB9O1xuICB9KCk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL2FycmF5LmZyb20uanNcbi8vIG1vZHVsZSBpZCA9IDg0NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEBtb2R1bGUgZG9tSGVscGVyc1xuICpcbiAqL1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5cbnZhciBmb2N1c2FibGVTZWxlY3RvciA9ICdhW2hyZWZdLCBidXR0b24sIGlucHV0LCBvYmplY3QsIHNlbGVjdCwgdGV4dGFyZWEsIFt0YWJpbmRleF0nO1xuXG4vKipcbiAqIGJpbmRGb2N1c2FibGVzOiBGaW5kIGFueSBmb2N1c2FibGUgY2hpbGQgZWxlbWVudHMgb2YgdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhbmRcbiAqIGFkZCBhbiBvbkZvY3VzIGhhbmRsZXIgdG8gZm9jdXMgb3VyIGtleWRvd24gaGFuZGxlcnMgb24gdGhlIHBhcmVudCBjb21wb25lbnRcbiAqIHdoZW4gdXNlciBrZXlzIGFwcGxpZXMgZm9jdXMgdG8gdGhlIGVsZW1lbnQuXG4gKlxuICogTk9URTogT25lIGxpbWl0YXRpb24gb2YgdGhpcyByaWdodCBub3cgaXMgdGhhdCBpZiB5b3UgdGFiIG91dCBvZiB0aGVcbiAqIGNvbXBvbmVudCwgX2ZvY3VzZWRJbnN0YW5jZSB3aWxsIHN0aWxsIGJlIHNldCB1bnRpbCBuZXh0IGNsaWNrIG9yIG1vdW50IG9yXG4gKiBjb250cm9sbGVkIGZvY3VzLlxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gaW5zdGFuY2UgVGhlIGtleS1ib3VuZCBjb21wb25lbnQgaW5zdGFuY2VcbiAqIEBwYXJhbSB7Y2FsbGJhY2t9IGFjdGl2YXRlT25Gb2N1cyBUaGUgZm4gdG8gZmlyZSB3aGVuIGVsZW1lbnQgaXMgZm9jdXNlZFxuICovXG5mdW5jdGlvbiBiaW5kRm9jdXNhYmxlcyhpbnN0YW5jZSwgYWN0aXZhdGVPbkZvY3VzKSB7XG4gIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBub2RlID0gUmVhY3RET00uZmluZERPTU5vZGUoaW5zdGFuY2UpO1xuICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgdmFyIGZvY3VzYWJsZXMgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoZm9jdXNhYmxlU2VsZWN0b3IpO1xuICAgICAgICBpZiAoZm9jdXNhYmxlcy5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgb25Gb2N1cyA9IGZ1bmN0aW9uIG9uRm9jdXMoZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIG9uRm9jdXNQcmV2ID0gZWxlbWVudC5vbmZvY3VzO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICBhY3RpdmF0ZU9uRm9jdXMoaW5zdGFuY2UpO1xuICAgICAgICAgICAgICBpZiAob25Gb2N1c1ByZXYpIG9uRm9jdXNQcmV2LmNhbGwoZWxlbWVudCwgZXZlbnQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZvY3VzYWJsZXMpLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50Lm9uZm9jdXMgPSBvbkZvY3VzKGVsZW1lbnQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIG5vb3AsIG1vc3RseSBzdXBwcmVzc2luZyBlcnJvciBoZXJlIGh0dHBzOi8vZ2l0aHViLmNvbS9nbG9ydGhvL3JlYWN0LWtleWRvd24vaXNzdWVzLzc2XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogZmluZENvbnRhaW5lck5vZGVzOiBDYWxsZWQgYnkgb3VyIGNsaWNrIGhhbmRsZXIgdG8gZmluZCBpbnN0YW5jZXMgd2l0aCBub2Rlc1xuICogdGhhdCBhcmUgZXF1YWwgdG8gb3IgdGhhdCBjb250YWluIHRoZSBjbGljayB0YXJnZXQuIEFueSB0aGF0IHBhc3MgdGhpcyB0ZXN0XG4gKiB3aWxsIGJlIHJlY2lwaWVudHMgb2YgdGhlIG5leHQga2V5ZG93biBldmVudC5cbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCBUaGUgY2xpY2sgZXZlbnQudGFyZ2V0IERPTSBlbGVtZW50XG4gKiBAcmV0dXJuIHtmdW5jdGlvbn0gUmVkdWNlciBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBmaW5kQ29udGFpbmVyTm9kZXModGFyZ2V0KSB7XG4gIHJldHVybiBmdW5jdGlvbiAobWVtbywgaW5zdGFuY2UpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIG5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZShpbnN0YW5jZSk7XG4gICAgICBpZiAobm9kZSAmJiAobm9kZSA9PT0gdGFyZ2V0IHx8IG5vZGUuY29udGFpbnModGFyZ2V0KSkpIHtcbiAgICAgICAgbWVtby5wdXNoKHsgaW5zdGFuY2U6IGluc3RhbmNlLCBub2RlOiBub2RlIH0pO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogc29ydEJ5RE9NUG9zaXRpb246IENhbGxlZCBieSBvdXIgY2xpY2sgaGFuZGxlciB0byBzb3J0IGEgbGlzdCBvZiBpbnN0YW5jZXNcbiAqIGFjY29yZGluZyB0byBsZWFzdCAtPiBtb3N0IG5lc3RlZC4gVGhpcyBpcyBzbyB0aGF0IGlmIG11bHRpcGxlIGtleWJvdW5kXG4gKiBpbnN0YW5jZXMgaGF2ZSBub2RlcyB0aGF0IGFyZSBhbmNlc3RvcnMgb2YgdGhlIGNsaWNrIHRhcmdldCwgdGhleSB3aWxsIGJlXG4gKiBzb3J0ZWQgdG8gbGV0IHRoZSBpbnN0YW5jZSBjbG9zZXN0IHRvIHRoZSBjbGljayB0YXJnZXQgZ2V0IGZpcnN0IGRpYnMgb24gdGhlXG4gKiBuZXh0IGtleSBkb3duIGV2ZW50LlxuICovXG5mdW5jdGlvbiBzb3J0QnlET01Qb3NpdGlvbihhLCBiKSB7XG4gIHJldHVybiBhLm5vZGUuY29tcGFyZURvY3VtZW50UG9zaXRpb24oYi5ub2RlKSA9PT0gMTAgPyAxIDogLTE7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHsgYmluZEZvY3VzYWJsZXM6IGJpbmRGb2N1c2FibGVzLCBmaW5kQ29udGFpbmVyTm9kZXM6IGZpbmRDb250YWluZXJOb2Rlcywgc29ydEJ5RE9NUG9zaXRpb246IHNvcnRCeURPTVBvc2l0aW9uIH07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL2RvbV9oZWxwZXJzLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBAbW9kdWxlIExpc3RlbmVyc1xuICpcbiAqL1xuXG4vLyBmbGFnIGZvciB3aGV0aGVyIGNsaWNrIGxpc3RlbmVyIGhhcyBiZWVuIGJvdW5kIHRvIGRvY3VtZW50XG52YXIgX2NsaWNrc0JvdW5kID0gZmFsc2U7XG5cbi8vIGZsYWcgZm9yIHdoZXRoZXIga2V5ZG93biBsaXN0ZW5lciBoYXMgYmVlbiBib3VuZCB0byBkb2N1bWVudFxudmFyIF9rZXlzQm91bmQgPSBmYWxzZTtcblxudmFyIExpc3RlbmVycyA9IHtcbiAgLyoqXG4gICAqIF9iaW5kS2V5c1xuICAgKlxuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKi9cbiAgYmluZEtleXM6IGZ1bmN0aW9uIGJpbmRLZXlzKGNhbGxiYWNrKSB7XG4gICAgaWYgKCFfa2V5c0JvdW5kKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY2FsbGJhY2spO1xuICAgICAgX2tleXNCb3VuZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG5cbiAgLyoqXG4gICAqIHVuYmluZEtleXNcbiAgICpcbiAgICogQGFjY2VzcyBwdWJsaWNcbiAgICovXG4gIHVuYmluZEtleXM6IGZ1bmN0aW9uIHVuYmluZEtleXMoY2FsbGJhY2spIHtcbiAgICBpZiAoX2tleXNCb3VuZCkge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGNhbGxiYWNrKTtcbiAgICAgIF9rZXlzQm91bmQgPSBmYWxzZTtcbiAgICB9XG4gIH0sXG5cblxuICAvKipcbiAgICogYmluZENsaWNrc1xuICAgKlxuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKi9cbiAgYmluZENsaWNrczogZnVuY3Rpb24gYmluZENsaWNrcyhjYWxsYmFjaykge1xuICAgIGlmICghX2NsaWNrc0JvdW5kKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbGxiYWNrLCB0cnVlKTtcbiAgICAgIF9jbGlja3NCb3VuZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG5cbiAgLyoqXG4gICAqIHVuYmluZENsaWNrc1xuICAgKlxuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKi9cbiAgdW5iaW5kQ2xpY2tzOiBmdW5jdGlvbiB1bmJpbmRDbGlja3MoY2FsbGJhY2spIHtcbiAgICBpZiAoX2NsaWNrc0JvdW5kKSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbGxiYWNrLCB0cnVlKTtcbiAgICAgIF9jbGlja3NCb3VuZCA9IGZhbHNlO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgTGlzdGVuZXJzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9saXN0ZW5lcnMuanNcbi8vIG1vZHVsZSBpZCA9IDg0OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBDb3VudGVyIGJlaW5nIGluY3JlbWVudGVkLiBKUyBpcyBzaW5nbGUtdGhyZWFkZWQsIHNvIGl0J2xsIEp1c3QgV29ya+KEoi5cbnZhciBfX2NvdW50ZXIgPSAxO1xuXG4vKipcbiAqIFJldHVybnMgYSBwcm9jZXNzLXdpZGUgdW5pcXVlIGlkZW50aWZpZXIuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHV1aWQoKSB7XG4gIHJldHVybiBcInVpZC1cIiArIF9fY291bnRlcisrO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi91dWlkLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy9cdCMgUGFyc2VyIFJ1bGVzXG4vL1x0UnVsZXMgY2FuIGJlIGFzIHNpbXBsZSBhcyBhIHN0cmluZyBgS2V5d29yZGAgb3IgYSBjb21wbGV4IHNlcXVlbmNlIG9mIChuZXN0ZWQpIHJ1bGVzLlxuLy9cbi8vXHRQYXJzZSBhIHJ1bGUgd2l0aCBgcnVsZS5wYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQsIGVuZClgLCB0aGlzIHdpbGwgZWl0aGVyOlxuLy9cdFx0LSByZXR1cm4gYHVuZGVmaW5lZGAgaWYgdGhlIHJ1bGUgZG9lc24ndCBtYXRjaCB0aGUgaGVhZCBvZiB0aGUgdG9rZW5zLCBvclxuLy9cdFx0LSByZXR1cm4gYSBDTE9ORSBvZiB0aGUgbWF0Y2hlZCBydWxlIHdpdGggYXQgbGVhc3QgdGhlIGZvbGxvd2luZzpcbi8vXHRcdFx0LSBgbWF0Y2hlZGBcdFx0UmVzdWx0cyBvZiB5b3VyIHBhcnNlLlxuLy9cdFx0XHQtIGBuZXh0U3RhcnRgXHRQbGFjZSB3aGVyZSBuZXh0IG1hdGNoIHNob3VsZCBzdGFydCAoZWc6IG9uZSBiZXlvbmQgd2hhdCB5b3UgbWF0Y2hlZCkuXG4vL1xuLy9cdFRoZSBjbG9uZSByZXR1cm5lZCBhYm92ZSBjYW4gYmUgbWFuaXB1bGF0ZWQgd2l0aFxuLy9cdFx0LSBgcnVsZS5yZXN1bHRzYFx0XHRcdFJldHVybiBtYXRjaGVkIGFyZ3VtZW50cyBpbiBhIGZvcm1hdCBzdWl0YWJsZSB0byBkbzpcbi8vXHRcdC0gYHJ1bGUudG9Tb3VyY2UoY29udGV4dClgXHRSZXR1cm4gamF2YXNjcmlwdCBzb3VyY2UgdG8gaW50ZXJwcmV0IHRoZSBydWxlLlxuLy9cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4vUGFyc2VyLmpzXCI7XG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuL1Rva2VuaXplci5qc1wiO1xuXG5pbXBvcnQgZ2xvYmFsIGZyb20gXCIuL3V0aWxzL2dsb2JhbFwiO1xuaW1wb3J0IHsgZ2V0VGFicywgaXNXaGl0ZXNwYWNlIH0gZnJvbSBcIi4vdXRpbHMvc3RyaW5nXCI7XG5cblxuLy8gQWJzdHJhY3QgUnVsZSBjbGFzcy5cbi8vIFRPRE9DXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSdWxlIHtcblx0Y29uc3RydWN0b3IoLi4ucHJvcHMpIHtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIC4uLnByb3BzKTtcblx0fVxuXG5cdC8vIENsb25lIHRoaXMgcnVsZSBhbmQgYWRkIGFueSBgcHJvcHNgIHBhc3NlZCBpbi5cblx0Y2xvbmUocHJvcHMpIHtcblx0XHRyZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcywgcHJvcHMpO1xuXHR9XG5cbi8vXG4vL1x0UGFyc2luZyBwcmltaXRpdmVzIC0tIHlvdSBNVVNUIGltcGxlbWVudCB0aGVzZSBpbiB5b3VyIHN1YmNsYXNzZXMhXG4vL1xuXG5cdC8vIEF0dGVtcHQgdG8gbWF0Y2ggdGhpcyBydWxlIGJldHdlZW4gYHN0YXJ0YCBhbmQgYGVuZGAgb2YgYHRva2Vuc2AuXG5cdC8vIFJldHVybnMgcmVzdWx0cyBvZiB0aGUgcGFyc2Ugb3IgYHVuZGVmaW5lZGAuXG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0Ly8gVGVzdCB0byBzZWUgaWYgYml0cyBvZiBvdXIgcnVsZSBhcmUgZm91bmQgQU5ZV0hFUkUgYmV0d2VlbiBgc3RhcnRgIGFuZCBgZW5kYCBpbiB0aGUgYHRva2Vuc2AuXG5cdC8vIFRoaXMgaXMgdXNlZCBieSBjb21wbGljYXRlZCAoZWc6IGxlZnQgcmVjdXJzaXZlKSBydWxlcyB0byBleGl0IHF1aWNrbHkgaWYgdGhlcmUncyBubyBjaGFuY2UuXG5cdC8vIFJldHVybnM6XG5cdC8vXHQtIGB0cnVlYCBpZiB0aGUgcnVsZSBNSUdIVCBiZSBtYXRjaGVkLlxuXHQvL1x0LSBgZmFsc2VgIGlmIHRoZXJlIGlzIE5PIFdBWSB0aGUgcnVsZSBjYW4gYmUgbWF0Y2hlZC5cblx0Ly9cdC0gYHVuZGVmaW5lZGAgaWYgbm90IGRldGVybWluc3RpYyAoZWc6IG5vIHdheSB0byB0ZWxsIHF1aWNrbHkpLlxuXHR0ZXN0KHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuLy9cbi8vICMjIG91dHB1dCBhcyBzb3VyY2Vcbi8vXG5cblx0Ly8gT3V0cHV0IHZhbHVlIGZvciB0aGlzIElOU1RBTlRJQVRFRCBydWxlIGFzIHNvdXJjZS5cblx0dG9Tb3VyY2UoY29udGV4dCkge1xuXHRcdHJldHVybiB0aGlzLm1hdGNoZWQ7XG5cdH1cblxuXG4vL1xuLy8gIyMgb3V0cHV0IGFzIHN0cnVjdHVyZTpcbi8vXG5cdHRvU3RydWN0dXJlKGNvbnRleHQpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG59XG5cblxuLy8gQWJzdHJhY3QgcnVsZSBmb3Igb25lIG9yIG1vcmUgc2VxdWVudGlhbCBsaXRlcmFsIHZhbHVlcyB0byBtYXRjaC5cbi8vIGBydWxlLmxpdGVyYWxzYCBpcyB0aGUgbGl0ZXJhbCBzdHJpbmcgb3IgYXJyYXkgb2YgbGl0ZXJhbCBzdHJpbmdzIHRvIG1hdGNoLlxuLy8gYHJ1bGUubGl0ZXJhbFNlcGFyYXRvcmAgaXMgdGhlIHN0cmluZyB0byBwdXQgYmV0d2VlbiBtdWx0aXBsZSBsaXRlcmFscyB3aGVuIGpvaW5pbmcuXG4vL1xuLy8gQWZ0ZXIgcGFyc2luZ1xuLy8gIGBydWxlLm1hdGNoZWRgIHdpbGwgYmUgdGhlIHN0cmluZyB3aGljaCB3YXMgbWF0Y2hlZFxuLy8gIGBydWxlLm5leHRTdGFydGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IHN0YXJ0IHRva2VuXG5SdWxlLkxpdGVyYWxzID0gY2xhc3MgbGl0ZXJhbHMgZXh0ZW5kcyBSdWxlIHtcblx0Y29uc3RydWN0b3IoLi4ucHJvcHMpIHtcblx0XHRzdXBlciguLi5wcm9wcyk7XG5cdFx0Ly8gY29lcmNlIHRvIGFuIGFycmF5IChhIGJpdCBzbG93ZXIgYnV0IGNsZWFuZXIpLlxuXHRcdGlmICghQXJyYXkuaXNBcnJheSh0aGlzLmxpdGVyYWxzKSkgdGhpcy5saXRlcmFscyA9IFt0aGlzLmxpdGVyYWxzXTtcblx0fVxuXG5cdC8vIEF0dGVtcHQgdG8gbWF0Y2ggdGhpcyBydWxlIGluIHRoZSBgdG9rZW5zYC5cblx0Ly8gUmV0dXJucyByZXN1bHRzIG9mIHRoZSBwYXJzZSBvciBgdW5kZWZpbmVkYC5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGlmICghdGhpcy5tYXRjaGVzU3RhcnRpbmdBdCh0b2tlbnMsIHN0YXJ0LCBlbmQpKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQ6IHRoaXMubGl0ZXJhbHMuam9pbih0aGlzLmxpdGVyYWxTZXBhcmF0b3IpLFxuXHRcdFx0bmV4dFN0YXJ0OiBzdGFydCArIHRoaXMubGl0ZXJhbHMubGVuZ3RoXG5cdFx0fSk7XG5cdH1cblxuXHQvLyBEb2VzIHRoaXMgbWF0Y2ggYXBwZWFyIEFOWVdIRVJFIGluIHRoZSB0b2tlbnM/XG5cdHRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kID0gdG9rZW5zLmxlbmd0aCkge1xuXHQgIGxldCBmaXJzdCA9IHRoaXMubGl0ZXJhbHNbMF07XG5cdCAgZm9yICh2YXIgaW5kZXggPSBzdGFydDsgaW5kZXggPCBlbmQ7IGluZGV4KyspIHtcblx0ICAgIGlmICh0b2tlbnNbaW5kZXhdICE9PSBmaXJzdCkgY29udGludWU7XG5cdCAgICBpZiAodGhpcy5tYXRjaGVzU3RhcnRpbmdBdCh0b2tlbnMsIGluZGV4LCBlbmQpKSByZXR1cm4gdHJ1ZTtcblx0ICB9XG5cdCAgcmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gTWF0Y2ggb3VyIGBsaXRlcmFsc2AgYmV0d2VlbiBgc3RhcnRgIGFuZCBgZW5kYCBvZiB0b2tlbnMuXG5cdG1hdGNoZXNTdGFydGluZ0F0KHRva2Vucywgc3RhcnQgPSAwLCBlbmQgPSB0b2tlbnMubGVuZ3RoKSB7XG5cdCAgaWYgKHRoaXMubGl0ZXJhbHMubGVuZ3RoID09PSAxKSByZXR1cm4gdG9rZW5zW3N0YXJ0XSA9PT0gdGhpcy5saXRlcmFsc1swXTtcbiAgICByZXR1cm4gdGhpcy5saXRlcmFscy5ldmVyeSgobGl0ZXJhbCwgaSkgPT4gKHN0YXJ0ICsgaSA8IGVuZCkgJiYgKGxpdGVyYWwgPT09IHRva2Vuc1tzdGFydCArIGldKSk7XG5cdH1cblxuXHR0b1N5bnRheCgpIHtcblx0XHRyZXR1cm4gYCR7dGhpcy5saXRlcmFscy5qb2luKHRoaXMubGl0ZXJhbFNlcGFyYXRvciB8fCBcIlwiKX0ke3RoaXMub3B0aW9uYWwgPyAnPycgOiAnJ31gO1xuXHR9XG59XG5cbi8vIE9uZSBvciBtb3JlIGxpdGVyYWwgc3ltYm9sczogYDxgLCBgJWAgZXRjLlxuLy8gU3ltYm9scyBqb2luIFdJVEhPVVQgc3BhY2VzLlxuUnVsZS5TeW1ib2xzID0gY2xhc3Mgc3ltYm9scyBleHRlbmRzIFJ1bGUuTGl0ZXJhbHMge31cblxuXG4vLyBPbmUgb3IgbW9yZSBsaXRlcmFsIGtleXdvcmRzLlxuLy8gS2V5d29yZHMgam9pbiBXSVRIIHNwYWNlcy5cblJ1bGUuS2V5d29yZHMgPSBjbGFzcyBrZXl3b3JkcyBleHRlbmRzIFJ1bGUuTGl0ZXJhbHMge31cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShSdWxlLktleXdvcmRzLnByb3RvdHlwZSwgXCJsaXRlcmFsU2VwYXJhdG9yXCIsIHsgdmFsdWU6IFwiIFwiIH0pO1xuXG5cblxuLy8gUmVnZXggcGF0dGVybiB0byBtYXRjaCBhIFNJTkdMRSB0b2tlbi5cbi8vIGBydWxlLnBhdHRlcm5gIGlzIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gdG8gbWF0Y2guXG4vLyAgICBOb3RlIHRoYXQgeW91IE1VU1Qgc3RhcnQgeW91ciBwYXR0ZXJuIHdpdGggYF5gIGFuZCBlbmQgd2l0aCBgJGAgdG8gbWFrZSBzdXJlIGl0IG1hdGNoZXMgdGhlIGVudGlyZSB0b2tlbi5cbi8vICAgIE5vdGUgdGhhdCB0aGlzIGNhbiBvbmx5IG1hdGNoIGEgc2luZ2xlIHRva2VuIVxuLy8gYHJ1bGUuYmxhY2tsaXN0YCBpcyBhIG1hcCBvZiBgeyBrZXk6IHRydWUgfWAgZm9yIHN0cmluZ3Mgd2hpY2ggd2lsbCBOT1QgYmUgYWNjZXB0ZWQuXG4vL1xuLy8gQWZ0ZXIgcGFyc2luZ1xuLy8gIGBydWxlLm1hdGNoZWRgIHdpbGwgYmUgdGhlIHN0cmluZyB3aGljaCB3YXMgbWF0Y2hlZC5cbi8vICBgcnVsZS5uZXh0U3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGFydCB0b2tlbi5cblJ1bGUuUGF0dGVybiA9IGNsYXNzIHBhdHRlcm4gZXh0ZW5kcyBSdWxlIHtcblx0Ly8gQXR0ZW1wdCB0byBtYXRjaCB0aGlzIHBhdHRlcm4gYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgdG9rZW5zLlxuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0bGV0IHRva2VuID0gdG9rZW5zW3N0YXJ0XTtcblx0XHRpZiAodHlwZW9mIHRva2VuICE9PSBcInN0cmluZ1wiKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG1hdGNoID0gdG9rZW4ubWF0Y2godGhpcy5wYXR0ZXJuKTtcblx0XHRpZiAoIW1hdGNoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gYmFpbCBpZiBwcmVzZW50IGluIGJsYWNrbGlzdFxuXHRcdGxldCBtYXRjaGVkID0gbWF0Y2hbMF07XG5cdFx0aWYgKHRoaXMuYmxhY2tsaXN0ICYmIHRoaXMuYmxhY2tsaXN0W21hdGNoZWRdKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZCxcblx0XHRcdG5leHRTdGFydDogc3RhcnQgKyAxXG5cdFx0fSk7XG5cdH1cblxuXHQvLyBUZXN0IHRvIHNlZSBpZiBhbnkgb2Ygb3VyIHBhdHRlcm4gaXMgZm91bmQgQU5ZV0hFUkUgaW4gdGhlIHRva2Vucy5cblx0dGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRyZXR1cm4gdG9rZW5zLnNsaWNlKHN0YXJ0LCBlbmQpLnNvbWUodG9rZW4gPT4gdHlwZW9mIHRva2VuID09PSBcInN0cmluZ1wiICYmIHBhdHRlcm4udGVzdCh0b2tlbikpO1xuXHR9XG5cblx0dG9TeW50YXgoKSB7XG5cdFx0cmV0dXJuIHRoaXMucGF0dGVybi5zb3VyY2U7XG5cdH1cbn1cblxuXG4vLyBTdWJydWxlIC0tIG5hbWUgb2YgYW5vdGhlciBydWxlIHRvIGJlIGNhbGxlZC5cbi8vIGBydWxlLnN1YnJ1bGVgIGlzIHRoZSBuYW1lIG9mIHRoZSBydWxlIGluIGBwYXJzZXIucnVsZXNgLlxuLy9cbi8vIEFmdGVyIHBhcnNpbmdcbi8vICB3ZSdsbCByZXR1cm4gdGhlIGFjdHVhbCBydWxlIHRoYXQgd2FzIG1hdGNoZWQgKHJhdGhlciB0aGFuIGEgY2xvbmUgb2YgdGhpcyBydWxlKVxuUnVsZS5TdWJydWxlID0gY2xhc3Mgc3VicnVsZSBleHRlbmRzIFJ1bGUge1xuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0bGV0IG1hdGNoZWRSdWxlID0gcGFyc2VyLnBhcnNlTmFtZWRSdWxlKHRoaXMuc3VicnVsZSwgdG9rZW5zLCBzdGFydCwgZW5kLCBzdGFjaywgYHBhcnNlIHN1YnJ1bGUgJyR7dGhpcy5ydWxlfSdgKTtcblx0XHRpZiAoIW1hdGNoZWRSdWxlKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdGlmICh0aGlzLmFyZ3VtZW50KSBtYXRjaGVkUnVsZS5hcmd1bWVudCA9IHRoaXMuYXJndW1lbnQ7XG5cdFx0cmV0dXJuIG1hdGNoZWRSdWxlO1xuXHR9XG5cblx0Ly8gQXNrIHRoZSBzdWJydWxlIHRvIGZpZ3VyZSBvdXQgaWYgYSBtYXRjaCBpcyBwb3NzaWJsZS5cblx0dGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRyZXR1cm4gcGFyc2VyLnRlc3QodGhpcy5zdWJydWxlLCB0b2tlbnMsIHN0YXJ0LCBlbmQpO1xuXHR9XG5cblx0dG9TeW50YXgoKSB7XG5cdFx0cmV0dXJuIGB7JHt0aGlzLmFyZ3VtZW50ID8gdGhpcy5hcmd1bWVudCtcIjpcIiA6IFwiXCJ9JHt0aGlzLnN1YnJ1bGV9fSR7dGhpcy5vcHRpb25hbCA/ICc/JyA6ICcnfWA7XG5cdH1cbn1cblxuXG4vLyBTZXF1ZW5jZSBvZiBydWxlcyB0byBtYXRjaC5cbi8vICBgcnVsZS5ydWxlc2AgaXMgdGhlIGFycmF5IG9mIHJ1bGVzIHRvIG1hdGNoLlxuLy8gIGBydWxlLmxlZnRSZWN1cnNpdmVgIHNob3VsZCBiZSBgdHJ1ZWAgaWYgdGhlIGZpcnN0IG5vbi1vcHRpb25hbCBydWxlIGluIG91ciBgcnVsZXNgXG4vLyAgICBtYXkgZW5kIHVwIGNhbGxpbmcgdXMgYWdhaW4uICBJbiB0aGlzIGNhc2UsIHlvdSBzaG91bGQgcHJvdmlkZSBgcnVsZS50ZXN0UnVsZWAuXG4vL1xuLy8gQWZ0ZXIgcGFyc2luZ1xuLy8gIGBydWxlLm1hdGNoZWRgIHdpbGwgYmUgdGhlIGFycmF5IG9mIHJ1bGVzIHdoaWNoIHdlcmUgbWF0Y2hlZC5cbi8vICBgcnVsZS5uZXh0U3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGFydCB0b2tlbi5cblJ1bGUuU2VxdWVuY2UgPSBjbGFzcyBzZXF1ZW5jZSBleHRlbmRzIFJ1bGUge1xuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0Ly8gSWYgd2UgaGF2ZSBhIGB0ZXN0UnVsZWAgZGVmaW5lZFxuXHRcdGlmICh0aGlzLnRlc3RSdWxlKSB7XG5cdFx0XHQvLyBGb3JnZXQgaXQgaWYgdGhlcmUgaXMgTk8gV0FZIHRoZSBydWxlIGNvdWxkIGJlIG1hdGNoZWQuXG5cdFx0XHRpZiAocGFyc2VyLnRlc3QodGhpcy50ZXN0UnVsZSwgdG9rZW5zLCBzdGFydCkgPT09IGZhbHNlKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdC8vIElmIHdlJ3JlIGEgbGVmdFJlY3Vyc2l2ZSBzZXF1ZW5jZS4uLlxuXHRcdGlmICh0aGlzLmxlZnRSZWN1cnNpdmUpIHtcblx0XHRcdC8vIElmIHRoZSBzdGFjayBhbHJlYWR5IGNvbnRhaW5zIHRoaXMgcnVsZSwgZm9yZ2V0IGl0LlxuXHRcdFx0aWYgKHN0YWNrICYmIHN0YWNrLmluY2x1ZGVzKHRoaXMpKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0XHQvLyBDbG9uZSBzdGFjayBhbmQgYWRkIHRoaXMgcnVsZSBmb3IgcmVjdXJzaW9uLi4uXG5cdFx0XHRzdGFjayA9IHN0YWNrID8gc3RhY2suY29uY2F0KCkgOiBbXTtcblx0XHRcdHN0YWNrLnB1c2godGhpcyk7XG5cblx0XHRcdC8vIFRPRE86IFdlIGNvdWxkIGRpc3Rpbmd1aXNoIGJldHdlZW4gcHJvZHVjdGl2ZSBhbmQgdW5wcm9kdWN0aXZlIHJ1bGVzXG5cdFx0XHQvL1x0XHQgYnkgY2hlY2tpbmcgb25seSBydWxlcyB3aGljaCBvY2N1ciBhdCB0aGUgc2FtZSBgc3RhcnRgLi4uXG5cdFx0XHQvL1x0XHQgVGhpcyB3b3VsZCBwcm9iYWJseSBhbGxvdyBtb3JlIGludGVyZXN0aW5nIHRoaW5ncywgYnV0IGl0J3MgbXVjaCBtdWNoIHNsb3dlci5cblx0XHR9XG5cblx0XHRsZXQgbWF0Y2hlZCA9IFtdO1xuXHRcdGxldCBuZXh0U3RhcnQgPSBzdGFydDtcblx0XHRsZXQgaW5kZXggPSAwLCBydWxlID0gdW5kZWZpbmVkO1xuXHRcdHdoaWxlIChydWxlID0gdGhpcy5ydWxlc1tpbmRleCsrXSkge1xuXHRcdFx0bGV0IG1hdGNoID0gcnVsZS5wYXJzZShwYXJzZXIsIHRva2VucywgbmV4dFN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0XHRcdGlmICghbWF0Y2ggJiYgIXJ1bGUub3B0aW9uYWwpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRpZiAobWF0Y2gpIHtcblx0XHRcdFx0bWF0Y2hlZC5wdXNoKG1hdGNoKTtcblx0XHRcdFx0bmV4dFN0YXJ0ID0gbWF0Y2gubmV4dFN0YXJ0O1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBpZiB3ZSBnZXQgaGVyZSwgd2UgbWF0Y2hlZCBhbGwgdGhlIHJ1bGVzIVxuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQsXG5cdFx0XHRuZXh0U3RhcnRcblx0XHR9KTtcblx0fVxuXG5cbi8vVE9ET0Ncblx0Ly8gXCJnYXRoZXJcIiBhcmd1bWVudHMgaW4gcHJlcGFyYXRpb24gdG8gY2FsbCBgdG9Tb3VyY2UoKWBcblx0Ly8gT25seSBjYWxsYWJsZSBhZnRlciBwYXJzZSBpcyBjb21wbGV0ZWQuXG5cdC8vIFJldHVybnMgYW4gb2JqZWN0IHdpdGggcHJvcGVydGllcyBmcm9tIHRoZSBgbWF0Y2hlZGAgYXJyYXkgaW5kZXhlZCBieVxuXHQvL1x0XHQtIGBtYXRjaC5hcmd1bWVudGA6XHRcdGFyZ3VtZW50IHNldCB3aGVuIHJ1bGUgd2FzIGRlY2xhcmVkLCBlZzogYHt2YWx1ZTpsaXRlcmFsfWAgPT4gYHZhbHVlYFxuXHQvL1x0XHQtIGBtYXRjaC5ydWxlTmFtZWA6XHRcdG5hbWUgb2YgcnVsZSB3aGVuIGRlZmluZWRcblx0Ly9cdFx0LSBgcnVsZSB0eXBlYDpcdFx0XHRuYW1lIG9mIHRoZSBydWxlIHR5cGVcblx0Ly8gTk9URTogbWVtb2l6ZXMgdGhlIHJlc3VsdHMuXG5cdGdldCByZXN1bHRzKCkge1xuXHRcdGlmICghdGhpcy5tYXRjaGVkKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdGxldCByZXN1bHRzID0gdGhpcy5fYWRkUmVzdWx0cyh7fSwgdGhpcy5tYXRjaGVkKTtcblx0XHRpZiAodGhpcy5jb21tZW50KSByZXN1bHRzLmNvbW1lbnQgPSB0aGlzLmNvbW1lbnQ7XG5cdFx0cmV0dXJuIHJlc3VsdHM7XG5cdH1cblxuXHRfYWRkUmVzdWx0cyhyZXN1bHRzLCBtYXRjaGVkKSB7XG5cdFx0bGV0IGluZGV4ID0gMCwgbWF0Y2ggPSB1bmRlZmluZWQ7XG5cdFx0d2hpbGUgKG1hdGNoID0gbWF0Y2hlZFtpbmRleCsrXSkge1xuXHRcdFx0aWYgKG1hdGNoLnByb21vdGUpIHtcblx0XHRcdC8vVE9ETzogdW5jbGVhciB0aGF0IHByb21vdGUgc2hvdWxkIHJldHVybiwgdGhhdCB3aWxsIGlnbm9yZSBzdWJzZXF1ZW50IHN0dWZmLCByaWdodD9cblx0XHRcdFx0cmV0dXJuIHRoaXMuX2FkZFJlc3VsdHMocmVzdWx0cywgbWF0Y2gubWF0Y2hlZCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0bGV0IGFyZ05hbWUgPSBtYXRjaC5hcmd1bWVudCB8fCBtYXRjaC5ncm91cCB8fCBtYXRjaC5jb25zdHJ1Y3Rvci5uYW1lO1xuXHRcdFx0XHQvLyBJZiBhcmcgYWxyZWFkeSBleGlzdHMsIGNvbnZlcnQgdG8gYW4gYXJyYXlcblx0XHRcdFx0aWYgKGFyZ05hbWUgaW4gcmVzdWx0cykge1xuXHRcdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShyZXN1bHRzW2FyZ05hbWVdKSkgcmVzdWx0c1thcmdOYW1lXSA9IFtyZXN1bHRzW2FyZ05hbWVdXTtcblx0XHRcdFx0XHRyZXN1bHRzW2FyZ05hbWVdLnB1c2gobWF0Y2gpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHJlc3VsdHNbYXJnTmFtZV0gPSBtYXRjaDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0cztcblx0fVxuXG5cdC8vIFJldHVybiBgdG9Tb3VyY2UoKWAgZm9yIG91ciBgcmVzdWx0c2AgYXMgYSBtYXAuXG5cdC8vIElmIHlvdSBwYXNzIGBrZXlzYCwgd2UnbGwgcmVzdHJpY3QgdG8ganVzdCB0aG9zZSBrZXlzLlxuXHRnZXRNYXRjaGVkU291cmNlKGNvbnRleHQpIHtcblx0XHRsZXQgcmVzdWx0cyA9IHRoaXMucmVzdWx0cztcblx0XHRsZXQgb3V0cHV0ID0ge307XG5cdFx0T2JqZWN0LmtleXMocmVzdWx0cykuZm9yRWFjaChrZXkgPT4ge1xuXHRcdFx0bGV0IHZhbHVlID0gcmVzdWx0c1trZXldO1xuXHRcdFx0aWYgKHZhbHVlID09IG51bGwpIHJldHVybjtcblx0XHRcdGlmICh2YWx1ZS50b1NvdXJjZSkgb3V0cHV0W2tleV0gPSB2YWx1ZS50b1NvdXJjZShjb250ZXh0KTtcblx0XHRcdGVsc2Ugb3V0cHV0W2tleV0gPSB2YWx1ZTtcblx0XHR9KTtcblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0Ly8gRWNobyB0aGlzIHJ1bGUgYmFjayBvdXQuXG5cdHRvU3ludGF4KCkge1xuXHQgIGNvbnN0IHJ1bGVzID0gdGhpcy5ydWxlcy5tYXAocnVsZSA9PiBydWxlLnRvU3ludGF4KCkpO1xuXHRcdHJldHVybiBgJHt0aGlzLnJ1bGVzLmpvaW4oXCIgXCIpfSR7dGhpcy5vcHRpb25hbCA/ICc/JyA6ICcnfWA7XG5cdH1cblxufVxuXG5cbi8vIEFsdGVybmF0aXZlIHN5bnRheCwgbWF0Y2hpbmcgb25lIG9mIGEgbnVtYmVyIG9mIGRpZmZlcmVudCBydWxlcy5cbi8vIFRoZSByZXN1bHQgb2YgYSBwYXJzZSBpcyB0aGUgbG9uZ2VzdCBydWxlIHRoYXQgYWN0dWFsbHkgbWF0Y2hlZC5cbi8vIE5PVEU6IEN1cnJlbnRseSB0YWtlcyB0aGUgbG9uZ2VzdCB2YWxpZCBtYXRjaC5cbi8vIFRPRE86IG1hdGNoIGFsbCB2YWxpZCBhbHRlcm5hdGl2ZXNcbi8vXG4vLyBBZnRlciBwYXJzaW5nXG4vLyAgd2UnbGwgcmV0dXJuIHRoZSBydWxlIHdoaWNoIGlzIHRoZSBcImJlc3QgbWF0Y2hcIiAocmF0aGVyIHRoYW4gY2xvbmluZyB0aGlzIHJ1bGUpLlxuUnVsZS5BbHRlcm5hdGl2ZXMgPSBjbGFzcyBhbHRlcm5hdGl2ZXMgZXh0ZW5kcyBSdWxlIHtcblx0Y29uc3RydWN0b3IoLi4ucHJvcHMpIHtcblx0XHRzdXBlciguLi5wcm9wcyk7XG5cdFx0aWYgKCF0aGlzLnJ1bGVzKSB0aGlzLnJ1bGVzID0gW107XG5cdH1cblxuXHQvLyBUZXN0IHRvIHNlZSBpZiBhbnkgb2Ygb3VyIGFsdGVybmF0aXZlcyBhcmUgZm91bmQgQU5ZV0hFUkUgaW4gdGhlIHRva2Vucy5cblx0Ly8gTk9URTogdGhpcyBzaG91bGQgb25seSBiZSBjYWxsZWQgaWYgd2UncmUgc3BlY2lmaWVkIGFzIGEgYHRlc3RSdWxlYFxuXHQvL1x0XHQgYW5kIHRoZW4gb25seSBpZiBhbGwgb2Ygb3VyIHJ1bGVzIGFyZSBkZXRlcm1pbmlzdGljLlxuXHR0ZXN0KHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGxldCBpbmRleCA9IDAsIHJ1bGUgPSB1bmRlZmluZWQ7XG5cdFx0d2hpbGUgKHJ1bGUgPSB0aGlzLnJ1bGVzW2luZGV4KytdKSB7XG5cdFx0XHRpZiAocnVsZS50ZXN0KHBhcnNlciwgdG9rZW5zLCBzdGFydCwgZW5kKSkgcmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIEZpbmQgYWxsIHJ1bGVzIHdoaWNoIG1hdGNoIGFuZCBkZWxlZ2F0ZSB0byBgZ2V0QmVzdE1hdGNoKClgIHRvIHBpY2sgdGhlIGJlc3Qgb25lLlxuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0bGV0IG1hdGNoZXMgPSBbXTtcblx0XHRsZXQgaW5kZXggPSAwLCBydWxlID0gdW5kZWZpbmVkO1xuXHRcdHdoaWxlIChydWxlID0gdGhpcy5ydWxlc1tpbmRleCsrXSkge1xuXHRcdFx0bGV0IG1hdGNoID0gcnVsZS5wYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQsIGVuZCwgc3RhY2spO1xuXHRcdFx0aWYgKG1hdGNoKSBtYXRjaGVzLnB1c2gobWF0Y2gpO1xuXHRcdH1cblxuXHRcdGlmICghbWF0Y2hlcy5sZW5ndGgpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyB1bmNvbW1lbnQgdGhlIGJlbG93IHRvIHByaW50IGFsdGVybmF0aXZlc1xuXHRcdC8vIGlmIChtYXRjaGVzLmxlbmd0aCA+IDEpIHtcblx0XHQvL1x0Y29uc29sZS5pbmZvKHRoaXMuYXJndW1lbnQgfHwgdGhpcy5ydWxlTmFtZSwgbWF0Y2hlcywgbWF0Y2hlcy5tYXAobWF0Y2ggPT4gbWF0Y2gubWF0Y2hlZFRleHQpKTtcblx0XHQvLyB9XG5cblx0XHRsZXQgYmVzdE1hdGNoID0gKG1hdGNoZXMubGVuZ3RoID09PSAxID8gbWF0Y2hlc1swXSA6IHRoaXMuZ2V0QmVzdE1hdGNoKG1hdGNoZXMpKTtcblxuXHRcdC8vIGFzc2lnbiBgYXJnTmFtZWAgb3IgYGdyb3VwYCBmb3IgYHJlc3VsdHNgXG5cdFx0aWYgKHRoaXMuYXJndW1lbnQpIGJlc3RNYXRjaC5hcmd1bWVudCA9IHRoaXMuYXJndW1lbnQ7XG5cdFx0ZWxzZSBpZiAodGhpcy5ncm91cCkgYmVzdE1hdGNoLmdyb3VwID0gdGhpcy5ncm91cDtcbi8vVE9ETzogb3RoZXIgdGhpbmdzIHRvIGNvcHkgaGVyZT8/P1xuXG5cdFx0cmV0dXJuIGJlc3RNYXRjaDtcblx0fVxuXG5cdC8vIFJldHVybiB0aGUgXCJiZXN0XCIgbWF0Y2ggZ2l2ZW4gbW9yZSB0aGFuIG9uZSBtYXRjaGVzIGF0IHRoZSBoZWFkIG9mIHRoZSB0b2tlbnMuXG5cdC8vIERlZmF1bHQgaXMgdG8gcmV0dXJuIHRoZSBsb25nZXN0IG1hdGNoLlxuXHQvLyBJbXBsZW1lbnQgc29tZXRoaW5nIGVsc2UgdG8gZG8sIGVnLCBwcmVjZWRlbmNlIHJ1bGVzLlxuXHRnZXRCZXN0TWF0Y2gobWF0Y2hlcykge1xuXHRcdHJldHVybiBtYXRjaGVzLnJlZHVjZShmdW5jdGlvbiAoYmVzdCwgY3VycmVudCkge1xuXHRcdFx0aWYgKGN1cnJlbnQubmV4dFN0YXJ0ID4gYmVzdC5uZXh0U3RhcnQpIHJldHVybiBjdXJyZW50O1xuXHRcdFx0cmV0dXJuIGJlc3Q7XG5cdFx0fSwgbWF0Y2hlc1swXSk7XG5cdH1cblxuXHRhZGRSdWxlKC4uLnJ1bGUpIHtcblx0XHR0aGlzLnJ1bGVzLnB1c2goLi4ucnVsZSk7XG5cdH1cblxuXHR0b1N5bnRheCgpIHtcblx0ICBjb25zdCBydWxlcyA9IHRoaXMucnVsZXMubWFwKHJ1bGUgPT4gcnVsZS50b1N5bnRheCgpKS5qb2luKFwifFwiKTtcblx0XHRyZXR1cm4gYCgke3RoaXMuYXJndW1lbnQgPyB0aGlzLmFyZ3VtZW50K1wiOlwiIDogXCJcIn0ke3J1bGVzfSkke3RoaXMub3B0aW9uYWwgPyAnPycgOiAnJ31gO1xuXHR9XG59O1xuXG5cbi8vIFJlcGVhdGluZyBydWxlLlxuLy9cdGB0aGlzLnJlcGVhdGAgaXMgdGhlIHJ1bGUgdGhhdCByZXBlYXRzLlxuLy8gIGB0aGlzLm9wdGlvbmFsYCBpcyB0cnVlIGlmIHRoZSBwcm9kdXRpb24gaXMgb3B0aW9uYWwuXG4vL1x0Tm90ZTogQXV0b21hdGljYWxseSBjb25zdW1lcyB3aGl0ZXNwYWNlIGJlZm9yZSBydWxlcy5cbi8vXHROb3RlOiBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIHdlIGRvbid0IG1hdGNoIGF0IGxlYXN0IG9uY2UuXG4vL1xuLy8gQWZ0ZXIgbWF0Y2hpbmc6XG4vL1x0YHRoaXMubWF0Y2hlZGAgaXMgYXJyYXkgb2YgbWF0Y2hlZCBydWxlcy5cbi8vICBgcnVsZS5uZXh0U3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGFydCB0b2tlbi5cblJ1bGUuUmVwZWF0ID0gY2xhc3MgcmVwZWF0IGV4dGVuZHMgUnVsZSB7XG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHRsZXQgbWF0Y2hlZCA9IFtdO1xuXHRcdGxldCBuZXh0U3RhcnQgPSBzdGFydDtcblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0bGV0IG1hdGNoID0gdGhpcy5yZXBlYXQucGFyc2UocGFyc2VyLCB0b2tlbnMsIG5leHRTdGFydCwgZW5kLCBzdGFjayk7XG5cdFx0XHRpZiAoIW1hdGNoKSBicmVhaztcblxuXHRcdFx0bWF0Y2hlZC5wdXNoKG1hdGNoKTtcblx0XHRcdG5leHRTdGFydCA9IG1hdGNoLm5leHRTdGFydDtcblx0XHR9XG5cblx0XHRpZiAobWF0Y2hlZC5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkLFxuXHRcdFx0bmV4dFN0YXJ0XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBcImdhdGhlclwiIGFyZ3VtZW50cyBpbiBwcmVwYXJhdGlvbiB0byBjYWxsIGB0b1NvdXJjZSgpYFxuXHQvLyBPbmx5IGNhbGxhYmxlIGFmdGVyIHBhcnNlIGlzIGNvbXBsZXRlZC5cblx0Ly8gUmV0dXJucyBhbiBhcnJheSB3aXRoIGFyZ3VtZW50cyBvZiBhbGwgcmVzdWx0cy5cblx0Z2V0IHJlc3VsdHMoKSB7XG5cdFx0aWYgKCF0aGlzLm1hdGNoZWQpIHJldHVybiBbXTtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkLm1hcCggbWF0Y2ggPT4gKG1hdGNoLnJlc3VsdHMgfHwgbWF0Y2gubWF0Y2hlZCkgKTtcblx0fVxuXG5cdHRvU291cmNlKGNvbnRleHQpIHtcblx0XHRpZiAoIXRoaXMubWF0Y2hlZCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkLm1hcChtYXRjaCA9PiBtYXRjaC50b1NvdXJjZShjb250ZXh0KSk7XG5cdH1cblxuXHR0b1N5bnRheCgpIHtcblx0XHRsZXQgaXNDb21wb3VuZFJ1bGUgPSAodGhpcy5yZXBlYXQgaW5zdGFuY2VvZiBSdWxlLlNlcXVlbmNlKVxuICAgICAgfHwgKHRoaXMucmVwZWF0IGluc3RhbmNlb2YgUnVsZS5MaXRlcmFscyAmJiB0aGlzLnJlcGVhdC5saXRlcmFscy5sZW5ndGggPiAxKTtcbiAgICBjb25zdCByZXBlYXQgPSB0aGlzLnJlcGVhdC50b1N5bnRheCgpO1xuXHRcdGNvbnN0IHJ1bGUgPSBpc0NvbXBvdW5kUnVsZSA/IGAoJHtyZXBlYXR9KWAgOiBgJHtyZXBlYXR9YDtcblx0XHRyZXR1cm4gYCR7cnVsZX0ke3RoaXMub3B0aW9uYWwgPyAnKicgOiAnKyd9YDtcblx0fVxufVxuXG5cbi8vIExpc3QgbWF0Y2ggcnVsZTogICBgWzxpdGVtPjxkZWxpbWl0ZXI+XWAuIGVnXCIgYFt7bnVtYmVyfSxdYCB0byBtYXRjaCBgMSwyLDNgXG4vL1x0YHJ1bGUuaXRlbWAgaXMgdGhlIHJ1bGUgZm9yIGVhY2ggaXRlbSxcbi8vXHRgcnVsZS5kZWxpbWl0ZXJgIGlzIHRoZSBkZWxpbWl0ZXIgYmV0d2VlbiBlYWNoIGl0ZW0sIHdoaWNoIGlzIG9wdGlvbmFsIGF0IHRoZSBlbmQuXG4vL1xuLy8gQWZ0ZXIgbWF0Y2hpbmc6XG4vL1x0YHRoaXMubWF0Y2hlZGAgaXMgYXJyYXkgb2YgbWF0Y2hlZCBydWxlcy5cbi8vICBgcnVsZS5uZXh0U3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGFydCB0b2tlbi5cbi8vXG4vLyBOT1RFOiB3ZSBhc3N1bWUgdGhhdCBhIExpc3QgcnVsZSBpdHNlbGYgd2lsbCBOT1QgcmVwZWF0ICg/Pz8/KVxuUnVsZS5MaXN0ID0gY2xhc3MgbGlzdCBleHRlbmRzIFJ1bGUge1xuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0Ly8gZW5zdXJlIGl0ZW0gYW5kIGRlbGltaXRlciBhcmUgb3B0aW9uYWwgc28gd2UgZG9uJ3QgYmFyZiBpbiBgcGFyc2VSdWxlYFxuLy9UT0RPOiA/Pz9cblx0XHR0aGlzLml0ZW0ub3B0aW9uYWwgPSB0cnVlO1xuXHRcdHRoaXMuZGVsaW1pdGVyLm9wdGlvbmFsID0gdHJ1ZTtcblxuXHRcdGxldCBtYXRjaGVkID0gW107XG5cdFx0bGV0IG5leHRTdGFydCA9IHN0YXJ0O1xuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHQvLyBnZXQgbmV4dCBpdGVtLCBleGl0aW5nIGlmIG5vdCBmb3VuZFxuXHRcdFx0bGV0IGl0ZW0gPSB0aGlzLml0ZW0ucGFyc2UocGFyc2VyLCB0b2tlbnMsIG5leHRTdGFydCwgZW5kLCBzdGFjayk7XG5cdFx0XHRpZiAoIWl0ZW0pIGJyZWFrO1xuXG5cdFx0XHRtYXRjaGVkLnB1c2goaXRlbSk7XG5cdFx0XHRuZXh0U3RhcnQgPSBpdGVtLm5leHRTdGFydDtcblxuXHRcdFx0Ly8gZ2V0IGRlbGltaXRlciwgZXhpdGluZyBpZiBub3QgZm91bmRcblx0XHRcdGxldCBkZWxpbWl0ZXIgPSB0aGlzLmRlbGltaXRlci5wYXJzZShwYXJzZXIsIHRva2VucywgbmV4dFN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0XHRcdGlmICghZGVsaW1pdGVyKSBicmVhaztcblx0XHRcdG5leHRTdGFydCA9IGRlbGltaXRlci5uZXh0U3RhcnQ7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgd2UgZGlkbid0IGdldCBhbnkgbWF0Y2hlcywgZm9yZ2V0IGl0LlxuXHRcdGlmIChtYXRjaGVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQsXG5cdFx0XHRuZXh0U3RhcnRcblx0XHR9KTtcblx0fVxuXG5cdC8vIFJldHVybnMgbGlzdCBvZiB2YWx1ZXMgYXMgc291cmNlLlxuXHR0b1NvdXJjZShjb250ZXh0KSB7XG5cdFx0aWYgKCF0aGlzLm1hdGNoZWQpIHJldHVybiBbXTtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkLm1hcCggbWF0Y2ggPT4gbWF0Y2gudG9Tb3VyY2UoY29udGV4dCkgKTtcblx0fVxuXG5cdHRvU3ludGF4KCkge1xuXHQgIGNvbnN0IGl0ZW0gPSB0aGlzLml0ZW0udG9TeW50YXgoKTtcblx0ICBjb25zdCBkZWxpbWl0ZXIgPSB0aGlzLmRlbGltaXRlci50b1N5bnRheCgpO1xuXHRcdHJldHVybiBgWyR7dGhpcy5hcmd1bWVudCA/IHRoaXMuYXJndW1lbnQrXCI6XCIgOiBcIlwifSR7aXRlbX0gJHtkZWxpbWl0ZXJ9XSR7dGhpcy5vcHRpb25hbCA/ICc/JyA6ICcnfWA7XG5cdH1cbn07XG5cblxuXG4vLyBBIGJsb2NrIGlzIHVzZWQgdG8gcGFyc2UgYSBuZXN0ZWQgYmxvY2sgb2Ygc3RhdGVtZW50cy5cbi8vIEFic3RyYWN0IGNsYXNzLlxuUnVsZS5CbG9jayA9IGNsYXNzIGJsb2NrIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG5cblx0Ly8gUGFyc2UgdGhlIGVudGlyZSBgYmxvY2tgLCByZXR1cm5pbmcgcmVzdWx0cy5cblx0cGFyc2VCbG9jayhwYXJzZXIsIGJsb2NrLCBpbmRlbnQgPSAwKSB7XG5cdFx0bGV0IG1hdGNoZWQgPSBbXTtcbi8vY29uc29sZS53YXJuKFwiYmxvY2s6XCIsIGJsb2NrKTtcblx0XHRibG9jay5jb250ZW50cy5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuXHRcdFx0bGV0IHJlc3VsdDtcblx0XHRcdGlmIChpdGVtLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRtYXRjaGVkLnB1c2gobmV3IFJ1bGUuQmxhbmtMaW5lKCkpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoaXRlbSBpbnN0YW5jZW9mIFRva2VuaXplci5CbG9jaykge1xuXHRcdFx0XHRsZXQgbGFzdCA9IG1hdGNoZWRbbWF0Y2hlZC5sZW5ndGggLSAxXTtcblx0XHRcdFx0aWYgKGxhc3QucGFyc2VCbG9jaykge1xuXHRcdFx0XHRcdGxhc3QucGFyc2VCbG9jayhwYXJzZXIsIGl0ZW0sIGluZGVudCArIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGxldCBibG9jayA9IHRoaXMucGFyc2VCbG9jayhwYXJzZXIsIGl0ZW0sIGluZGVudCArIDEpO1xuXHRcdFx0XHRcdGlmIChibG9jayAhPT0gdW5kZWZpbmVkKSBtYXRjaGVkLnB1c2goYmxvY2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0bWF0Y2hlZCA9IG1hdGNoZWQuY29uY2F0KHRoaXMucGFyc2VTdGF0ZW1lbnQocGFyc2VyLCBpdGVtKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gbmV3IFJ1bGUuQmxvY2soe1xuXHRcdFx0aW5kZW50LFxuXHRcdFx0bWF0Y2hlZFxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gUGFyc2UgYSBzaW5nbGUgc3RhdGVtZW50IChhIGxpbmUncyB3b3J0aCBvZiBgdG9rZW5zYCkuXG5cdC8vIFNraXBzIHdoaXRlc3BhY2UgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZS5cblx0Ly8gQXV0by1tYXRjaGVzIGNvbW1lbnQgaW4gdGhlIG1pZGRsZSBvZiB0aGUgbGluZS5cblx0Ly8gUmV0dXJucyBhcnJheSBvZiByZXN1bHRzLlxuXHRwYXJzZVN0YXRlbWVudChwYXJzZXIsIHRva2Vucykge1xuXHRcdGxldCByZXN1bHRzID0gW107XG5cdFx0bGV0IHN0YXJ0ID0gMCwgZW5kID0gdG9rZW5zLmxlbmd0aDtcblx0XHRsZXQgc3RhdGVtZW50LCBjb21tZW50O1xuXG5cdFx0Ly8gY2hlY2sgZm9yIGFuIGluZGVudCBhdCB0aGUgc3RhcnQgb2YgdGhlIGxpbmVcblx0XHRpZiAodG9rZW5zW3N0YXJ0XSBpbnN0YW5jZW9mIFRva2VuaXplci5XaGl0ZXNwYWNlKSBzdGFydCsrO1xuXG5cdFx0Ly8gY2hlY2sgZm9yIGEgY29tbWVudCBhdCB0aGUgZW5kIG9mIHRoZSB0b2tlbnNcblx0XHRpZiAodG9rZW5zW2VuZC0xXSBpbnN0YW5jZW9mIFRva2VuaXplci5Db21tZW50KSB7XG5cdFx0XHRjb21tZW50ID0gcGFyc2VyLnBhcnNlTmFtZWRSdWxlKFwiY29tbWVudFwiLCB0b2tlbnMsIGVuZC0xLCBlbmQsIHVuZGVmaW5lZCwgXCJwYXJzZVN0YXRlbWVudFwiKTtcblx0XHRcdC8vIGFkZCBjb21tZW50IEZJUlNUIGlmIGZvdW5kXG5cdFx0XHRyZXN1bHRzLnB1c2goY29tbWVudCk7XG5cdFx0XHRlbmQtLTtcblx0XHR9XG5cblx0XHQvLyBwYXJzZSB0aGUgcmVzdCBhcyBhIFwic3RhdGVtZW50XCJcblx0XHRzdGF0ZW1lbnQgPSBwYXJzZXIucGFyc2VOYW1lZFJ1bGUoXCJzdGF0ZW1lbnRcIiwgdG9rZW5zLCBzdGFydCwgZW5kLCB1bmRlZmluZWQsIFwicGFyc2VTdGF0ZW1lbnRcIik7XG5cdFx0Ly8gY29tcGxhaW4gaWYgbm8gc3RhdGVtZW50IGFuZCBubyBjb21tZW50XG5cdFx0aWYgKCFzdGF0ZW1lbnQgJiYgIWNvbW1lbnQpIHtcblx0XHRcdGxldCBlcnJvciA9IG5ldyBSdWxlLlN0YXRlbWVudFBhcnNlRXJyb3Ioe1xuXHRcdFx0XHR1bnBhcnNlZDogdG9rZW5zLnNsaWNlKHN0YXJ0LCBlbmQpLmpvaW4oXCIgXCIpXG5cdFx0XHR9KTtcblx0XHRcdHJlc3VsdHMucHVzaChlcnJvcik7XG5cdFx0fVxuXG5cdFx0Ly8gY29tcGxhaW4gaWYgd2UgY2FuJ3QgcGFyc2UgdGhlIGVudGlyZSBsaW5lIVxuXHRcdGVsc2UgaWYgKHN0YXRlbWVudCAmJiBzdGF0ZW1lbnQubmV4dFN0YXJ0ICE9PSBlbmQpIHtcblx0XHRcdGxldCBlcnJvciA9IG5ldyBSdWxlLlN0YXRlbWVudFBhcnNlRXJyb3Ioe1xuXHRcdFx0XHRwYXJzZWQgOiB0b2tlbnMuc2xpY2Uoc3RhcnQsIHN0YXRlbWVudC5uZXh0U3RhcnQpLmpvaW4oXCIgXCIpLFxuXHRcdFx0XHR1bnBhcnNlZCA6IHRva2Vucy5zbGljZShzdGF0ZW1lbnQubmV4dFN0YXJ0LCBlbmQpLmpvaW4oXCIgXCIpXG5cdFx0XHR9KTtcblx0XHRcdHJlc3VsdHMucHVzaChlcnJvcik7XG5cdFx0fVxuXG5cdFx0Ly8gT3RoZXJ3aXNlIGFkZCB0aGUgc3RhdGVtZW50XG5cdFx0ZWxzZSBpZiAoc3RhdGVtZW50KSB7XG5cdFx0XHRyZXN1bHRzLnB1c2goc3RhdGVtZW50KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0cztcblx0fVxuXG5cdC8vIFJldHVybiBzb3VyY2UgZm9yIHRoaXMgYmxvY2sgYXMgYW4gYXJyYXkgb2YgaW5kZW50ZWQgbGluZXMgV0lUSE9VVCBge2AgT1IgYH1gLlxuXHRibG9ja1RvU291cmNlKGNvbnRleHQsIGJsb2NrID0gdGhpcy5tYXRjaGVkKSB7XG5cdFx0bGV0IHJlc3VsdHMgPSBbXSwgc3RhdGVtZW50O1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBibG9jay5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGV0IG1hdGNoID0gYmxvY2tbaV07XG4gICAgICAvL2NvbnNvbGUuaW5mbyhpLCBtYXRjaCk7XG4gICAgICB0cnkge1xuICAgICAgICAgICAgc3RhdGVtZW50ID0gbWF0Y2gudG9Tb3VyY2UoY29udGV4dCkgfHwgXCJcIjtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgY29uc29sZS53YXJuKFwiRXJyb3IgY29udmVydGluZyBibG9jazogXCIsIGJsb2NrLCBcInN0YXRlbWVudDpcIiwgbWF0Y2gpO1xuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmluZm8oaSwgc3RhdGVtZW50KTtcblx0XHRcdGlmIChpc1doaXRlc3BhY2Uoc3RhdGVtZW50KSkge1xuXHRcdFx0XHRyZXN1bHRzLnB1c2goXCJcIik7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChBcnJheS5pc0FycmF5KHN0YXRlbWVudCkpIHtcblx0XHRcdFx0cmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHN0YXRlbWVudCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2Ygc3RhdGVtZW50ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHN0YXRlbWVudCA9IHN0YXRlbWVudC5zcGxpdChcIlxcblwiKTtcblx0XHRcdFx0cmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHN0YXRlbWVudCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKFwiYmxvY2tUb1NvdXJjZSgpOiBET04nVCBLTk9XIEhPVyBUTyBXT1JLIFdJVEhcXG5cXHRcIiwgc3RhdGVtZW50LCBcIlxcblxcdGZyb20gbWF0Y2hcIiwgbWF0Y2gpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAodGhpcy5pbmRlbnQgIT09IDApIHtcblx0XHRcdHJldHVybiBcIlxcdFwiICsgcmVzdWx0cy5qb2luKFwiXFxuXFx0XCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0cy5qb2luKFwiXFxuXCIpO1xuXHR9XG5cblx0dG9Tb3VyY2UoY29udGV4dCkge1xuXHRcdHJldHVybiBcIiB7XFxuXCIgKyB0aGlzLmJsb2NrVG9Tb3VyY2UoY29udGV4dCkgKyBcIlxcblwiICsgXCJ9XCI7XG5cdH1cblxuXHQvLyBDb252ZXJ0IHRvIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2Ygc3RydWN0dXJlIGJ5IGNvbnZlcnRpbmcgaW5kaXZpZHVhbCBzdGF0ZW1lbnRzIGFuZCBncm91cGluZ1xuXHQvLyBOT1RFOiB5b3Ugc2hvdWxkIG92ZXJyaWRlIHRoaXMgYW5kIGluY2x1ZGUgXCJ0eXBlXCJcblx0dG9TdHJ1Y3R1cmUoY29udGV4dCkge1xuXHRcdGxldCB7IG5hbWUsIHN1cGVyVHlwZSB9ID0gdGhpcy5nZXRNYXRjaGVkU291cmNlKGNvbnRleHQpO1xuXHRcdGxldCBibG9jayA9ICh0aGlzLmJsb2NrICYmIHRoaXMuYmxvY2subWF0Y2hlZCkgfHwgW107XG5cblx0XHRsZXQgbmFtZWQgPSB7fTtcblx0XHRsZXQgcHJvcGVydGllcyA9IFtdO1xuXHRcdGxldCBtZXRob2RzID0gW107XG5cdFx0bGV0IG90aGVyID0gW107XG5cdFx0YmxvY2subWFwKHN0YXRlbWVudCA9PiBzdGF0ZW1lbnQudG9TdHJ1Y3R1cmUoY29udGV4dCkpXG5cdFx0XHQgLmZpbHRlcihCb29sZWFuKVxuXHRcdFx0IC5mb3JFYWNoKGFkZFN0cnVjdHVyZSk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dHlwZTogXCJ1bmtub3duXCIsXG5cdFx0XHRuYW1lLFxuXHRcdFx0c3VwZXJUeXBlLFxuXHRcdFx0bmFtZWQsXG5cdFx0XHRwcm9wZXJ0aWVzLFxuXHRcdFx0bWV0aG9kcyxcblx0XHRcdG90aGVyXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gYWRkU3RydWN0dXJlKHN0cnVjdHVyZSkge1xuXHRcdFx0Ly8gYWRkIGFycmF5cyBhcyBpbmRpdmlkdWFsIGl0ZW1zXG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShzdHJ1Y3R1cmUpKSByZXR1cm4gc3RydWN0dXJlLmZvckVhY2goYWRkU3RydWN0dXJlKTtcblxuXHRcdFx0Ly8gYWRkIHVuZGVyIGBuYW1lZGAgZm9yIHF1aWNrIGhpdCBvZiBhbGwgc2lnbmlmaWNhbnQgYml0cy4uLlxuXHRcdFx0aWYgKHN0cnVjdHVyZS5uYW1lKSBuYW1lZFtzdHJ1Y3R1cmUubmFtZV0gPSBzdHJ1Y3R1cmU7XG5cblx0XHRcdC8vIGFkZCB1bmRlciAnbWV0aG9kcycsICdwcm9wZXJ0aWVzJyBvciAnb3RoZXInXG5cdFx0XHRpZiAoc3RydWN0dXJlLnR5cGUgPT09IFwiZnVuY3Rpb25cIikgbWV0aG9kcy5wdXNoKHN0cnVjdHVyZSk7XG5cdFx0XHRlbHNlIGlmIChzdHJ1Y3R1cmUudHlwZSA9PT0gXCJwcm9wZXJ0eVwiKSBwcm9wZXJ0aWVzLnB1c2goc3RydWN0dXJlKTtcblx0XHRcdGVsc2Ugb3RoZXIucHVzaChzdHJ1Y3R1cmUpO1xuXHRcdH1cblx0fVxuXG5cdC8vIEZvcm1hdCBhcnJheSBvZiBgc3RhdGVtZW50c2AgYXMgYSBKUyBvdXRwdXQgYmxvY2s6XG5cdC8vXHQtIGlmIGBzdGF0ZW1lbnRzYCBpcyBlbXB0eSwgcmV0dXJucyBge31gXG5cdC8vXHQtIGlmIGBzdGF0ZW1lbnRzIGlzIGEgc2luZ2xlIGxpbmUsIHJldHVybnMgYHsgc3RhdGVtZW50IH1gXG5cdC8vXHQtIGVsc2UgcmV0dXJucyBtdWx0aXBsZSBsaW5lc1xuXHRzdGF0aWMgZW5jbG9zZVN0YXRlbWVudHMoLi4uYXJncykge1xuXHRcdHZhciBzdGF0ZW1lbnRzID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgYXJnID0gYXJnc1tpXTtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KGFyZykpIHtcblx0XHRcdFx0c3RhdGVtZW50cyA9IHN0YXRlbWVudHMuY29uY2F0KGFyZyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgYXJnID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHN0YXRlbWVudHMucHVzaChhcmcpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRzdGF0ZW1lbnRzID0gc3RhdGVtZW50cy5qb2luKFwiXFxuXCIpO1xuXG5cdFx0aWYgKCFzdGF0ZW1lbnRzKSByZXR1cm4gXCJ7fVwiO1xuXHRcdGlmICghc3RhdGVtZW50cy5pbmNsdWRlcyhcIlxcblwiKSAmJiBzdGF0ZW1lbnRzLmxlbmd0aCA8IDQwKSB7XG5cdFx0XHRyZXR1cm4gYHsgJHtzdGF0ZW1lbnRzLnRyaW0oKX0gfWA7XG5cdFx0fVxuXHRcdGlmIChzdGF0ZW1lbnRzWzBdICE9PSBcIlxcdFwiKSBzdGF0ZW1lbnRzID0gYFxcdCR7c3RhdGVtZW50c31gO1xuXHRcdHJldHVybiBge1xcbiR7c3RhdGVtZW50c31cXG59YDtcblx0fVxuXG59XG5cblxuLy8gYFN0YXRlbWVudHNgIGFyZSBhIHNwZWNpYWwgY2FzZSBmb3IgYSBibG9jayBvZiBgU3RhdGVtZW50YCBydWxlc1xuLy9cdHRoYXQgdW5kZXJzdGFuZCBuZXN0aW5nIGFuZCBjb21tZW50cy5cbi8vXG4vLyBUaGlzIGlzIGEgdG9wLWxldmVsIGNvbnN0cnVjdCwgZS5nLiB1c2VkIHRvIHBhcnNlIGFuIGVudGlyZSBmaWxlLlxuUnVsZS5TdGF0ZW1lbnRzID0gY2xhc3Mgc3RhdGVtZW50cyBleHRlbmRzIFJ1bGUuQmxvY2sge1xuXG5cdC8vIFNwbGl0IHN0YXRlbWVudHMgdXAgaW50byBibG9ja3MgYW5kIHBhcnNlICdlbS5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kID0gdG9rZW5zLmxlbmd0aCwgc3RhY2spIHtcblx0XHR2YXIgYmxvY2sgPSBUb2tlbml6ZXIuYnJlYWtJbnRvQmxvY2tzKHRva2Vucywgc3RhcnQsIGVuZCk7XG5cblx0XHRsZXQgbWF0Y2hlZCA9IHRoaXMucGFyc2VCbG9jayhwYXJzZXIsIGJsb2NrKTtcblx0XHRpZiAoIW1hdGNoZWQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkLFxuXHRcdFx0bmV4dFN0YXJ0OiBlbmRcblx0XHR9KTtcblx0fVxuXG5cdC8vIE91dHB1dCBzdGF0ZW1lbnRzIFdJVEhPVVQgY3VybHkgYnJhY2VzIGFyb3VuZCB0aGVtLlxuXHR0b1NvdXJjZShjb250ZXh0KSB7XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hlZC5ibG9ja1RvU291cmNlKGNvbnRleHQpO1xuXHR9XG59XG5cblxuLy8gQSBgQmxvY2tTdGF0ZW1lbnRgIChlLmcuIGFuIGBpZmAgb3IgYHJlcGVhdGApOlxuLy9cdC0gaXMgYXNzdW1lZCB0byBoYXZlIGFuIGluaXRpYWwgcGFydGlhbCBgc3RhdGVtZW50YFxuLy9cdC0gTUFZIGhhdmUgYW4gaW5saW5lIGBzdGF0ZW1lbnRgIChvbiB0aGUgc2FtZSBsaW5lLCBwb3NzaWJseSBhZnRlciBhIGA6YClcbi8vXHQtIE1BWSBoYXZlIGNvbnRlbnRzIGFzIGFuIGVtYmVkZGVkIGBibG9ja2Bcbi8vXG4vL1x0SW4geW91ciBgZ2V0TWF0Y2hlZFNvdXJjZSgpYCwgYGJsb2NrYCB3aWxsIGJlIHRoZSByZXN1bHRpbmcgYmxvY2sgb3V0cHV0LCBpZiB0aGVyZSBpcyBvbmUuXG4vL1x0SXQncyB1cCB0byB5b3VyIHJ1bGUgdG8gZG8gc29tZXRoaW5nIHdpdGggaXQuLi5cblJ1bGUuQmxvY2tTdGF0ZW1lbnQgPSBjbGFzcyBibG9ja19zdGF0ZW1lbnQgZXh0ZW5kcyBSdWxlLkJsb2NrIHtcblxuXHQvLyBQYXJzZSBhIGJsb2NrIGFuZCBhZGQgaXQgdG8gYHRoaXMuYmxvY2tgXG5cdHBhcnNlQmxvY2socGFyc2VyLCBibG9jaywgaW5kZW50ID0gMCkge1xuXHRcdHRoaXMuYmxvY2sgPSBzdXBlci5wYXJzZUJsb2NrKC4uLmFyZ3VtZW50cyk7XG5cdH1cblxuXHQvLyBSZXR1cm4gYHRvU291cmNlKClgIGZvciBvdXIgYHJlc3VsdHNgIGFzIGEgbWFwLlxuXHQvLyBJZiB5b3UgcGFzcyBga2V5c2AsIHdlJ2xsIHJlc3RyaWN0IHRvIGp1c3QgdGhvc2Uga2V5cy5cblx0Z2V0TWF0Y2hlZFNvdXJjZShjb250ZXh0LCAuLi5rZXlzKSB7XG5cdFx0bGV0IG91dHB1dCA9IHN1cGVyLmdldE1hdGNoZWRTb3VyY2UoY29udGV4dCwgLi4ua2V5cyk7XG5cdFx0Ly8gYWRkIGBibG9ja2AgdG8gb3V0cHV0IGlmIGRlZmluZWQuXG5cdFx0aWYgKHRoaXMuYmxvY2spIHtcblx0XHRcdG91dHB1dC5ibG9jayA9IHRoaXMuYmxvY2suYmxvY2tUb1NvdXJjZShjb250ZXh0KTtcblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxufVxuXG5cbi8vIEJsYW5rIGxpbmUgcmVwcmVzZW50YXRpb24gaW4gcGFyc2VyIG91dHB1dC5cblJ1bGUuQmxhbmtMaW5lID0gY2xhc3MgYmxhbmtfbGluZSBleHRlbmRzIFJ1bGUge1xuXHR0b1NvdXJjZShjb250ZXh0KSB7XG5cdFx0cmV0dXJuIFwiXFxuXCI7XG5cdH1cbn1cblxuLy8gQ29tbWVudCBydWxlIC0tIG1hdGNoZXMgdG9rZW5zIG9mIHR5cGUgYFRva2VuaXplci5Db21tZW50YC5cblJ1bGUuQ29tbWVudCA9IGNsYXNzIGNvbW1lbnQgZXh0ZW5kcyBSdWxlIHtcblx0Ly8gQ29tbWVudHMgYXJlIHNwZWNpYWwgbm9kZXMgaW4gb3VyIHRva2VuIHN0cmVhbS5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG5cdFx0aWYgKCEodG9rZW4gaW5zdGFuY2VvZiBUb2tlbml6ZXIuQ29tbWVudCkpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZDogdG9rZW4sXG5cdFx0XHRuZXh0U3RhcnQ6IHN0YXJ0ICsgMVxuXHRcdH0pO1xuXHR9XG5cblx0dG9Tb3VyY2UoY29udGV4dCkge1xuXHRcdHJldHVybiBgLy8ke3RoaXMubWF0Y2hlZC53aGl0ZXNwYWNlfSR7dGhpcy5tYXRjaGVkLmNvbW1lbnR9YDtcblx0fVxufVxuXG4vLyBQYXJzZXIgZXJyb3IgcmVwcmVzZW50YXRpb24gaW4gcGFyc2VyIG91dHB1dC5cblJ1bGUuU3RhdGVtZW50UGFyc2VFcnJvciA9IGNsYXNzIHBhcnNlX2Vycm9yIGV4dGVuZHMgUnVsZSB7XG5cdGNvbnN0cnVjdG9yKC4uLnByb3BzKSB7XG5cdFx0c3VwZXIoLi4ucHJvcHMpO1xuXHRcdGlmIChQYXJzZXIuV0FSTikgY29uc29sZS53YXJuKHRoaXMubWVzc2FnZSk7XG5cdH1cblxuXHRnZXQgbWVzc2FnZSgpIHtcblx0XHRpZiAodGhpcy5wYXJzZWQpIHtcblx0XHRcdHJldHVybiBcIkNBTlQgUEFSU0UgRU5USVJFIFNUQVRFTUVOVFxcblwiXG5cdFx0XHRcdCArIFwiUEFSU0VEICAgICAgOiBgXCIrIHRoaXMucGFyc2VkICsgXCJgXFxuXCJcblx0XHRcdFx0ICsgXCJDQU4nVCBQQVJTRSA6IGBcIisgdGhpcy51bnBhcnNlZCArIFwiYFwiO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJDQU4nVCBQQVJTRSBTVEFURU1FTlQ6IGBcIiArIHRoaXMudW5wYXJzZWQgKyBcImBcIjtcblx0fVxuXG5cdHRvU291cmNlKGNvbnRleHQpIHtcblx0XHRyZXR1cm4gXCIvLyBcIiArIHRoaXMubWVzc2FnZS5zcGxpdChcIlxcblwiKS5qb2luKFwiXFxuLy8gXCIpO1xuXHR9XG59XG5cblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1J1bGUuanMiLCJpbXBvcnQgeyBkZWZpbmVNZW1vaXplZCB9IGZyb20gXCIuL21lbW9pemUuanNcIjtcbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4vUGFyc2VyLmpzXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi9SdWxlLmpzXCI7XG5pbXBvcnQgeyBjbG9uZUNsYXNzIH0gZnJvbSBcIi4vdXRpbHMvY2xhc3MuanNcIjtcbmltcG9ydCBnbG9iYWwgZnJvbSBcIi4vdXRpbHMvZ2xvYmFsLmpzXCI7XG5cblxuXG4vL1xuLy9cdCMgUGFyc2luZyBgcnVsZVN5bnRheGAgdG8gY3JlYXRlIHJ1bGVzIGF1dG9tYXRpY2FsbHkuXG4vL1xuLy8gVE9ETzpcdEJldHRlciBuYW1lIGZvciBgcnVsZVN5bnRheGBcbi8vIFRPRE86XHRVc2Uga2V5d29yZHMgaW4gc3ludGF4IHRvIG1ha2UgYSBxdWljayByZWdleC1iYXNlZCBgdGVzdGAgZnVuY3Rpb24gZm9yIHRoZSBlbnRpcmUgcnVsZVxuXG4vL1xuLy8gIyMgZ3JvdXA6IHBhcnNpbmcgc3ludGF4XG4vL1xuXG4vL1RPRE9DXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZVJ1bGUoc3ludGF4LCBjb25zdHJ1Y3Rvcikge1xuICAvLyBJZiB3ZSBnb3QgYW4gYXJyYXkgb2YgcG9zc2libGUgc3ludGF4ZXMuLi5cbiAgaWYgKEFycmF5LmlzQXJyYXkoc3ludGF4KSkge1xuICAgIC8vIHJlY3Vyc2l2ZWx5IHBhcnNlIGVhY2ggc3ludGF4LCB1c2luZyBhIENMT05FIG9mIHRoZSBjb25zdHJ1Y3RvclxuICAgIGNvbnN0IHJ1bGVzID0gc3ludGF4Lm1hcChzeW50YXggPT4gcGFyc2VSdWxlKHN5bnRheCwgY2xvbmVDbGFzcyhjb25zdHJ1Y3RvcikpICk7XG4gICAgLy8gcmV0dXJuIGFuIGFsdGVybmF0aXZlcyB3aXRoIHRoZSBjb3JyZWN0IG5hbWVcbiAgICBjb25zdCBhbHRDbGFzcyA9IGNsb25lQ2xhc3MoUnVsZS5BbHRlcm5hdGl2ZXMsIGNvbnN0cnVjdG9yLm5hbWUpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhbHRDbGFzcy5wcm90b3R5cGUsIFwicnVsZXNcIiwgeyB2YWx1ZTogcnVsZXMgfSk7XG4gICAgcmV0dXJuIG5ldyBhbHRDbGFzcygpO1xuICB9O1xuXG4gIGxldCBydWxlcyA9IHBhcnNlU3ludGF4KHN5bnRheCwgW10pO1xuICBpZiAocnVsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBwYXJzZXIuZGVmaW5lUnVsZSgke25hbWVzWzBdfSwgJHtzeW50YXh9KTogbm8gcnVsZSBwcm9kdWNlZGApO1xuICB9XG5cbiAgLy8gTWFrZSBhbiBpbnN0YW5jZSBvZiB0aGUgcnVsZSBhbmQgYWRkIHJlbGV2YW50IHByb3BlcnRpZXMgdG8gaXRzIHByb3RvdHlwZSBub24tZW51bWVyYWJseVxuICBpZiAoY29uc3RydWN0b3IucHJvdG90eXBlIGluc3RhbmNlb2YgUnVsZS5LZXl3b3Jkc1xuICAgfHwgY29uc3RydWN0b3IucHJvdG90eXBlIGluc3RhbmNlb2YgUnVsZS5TeW1ib2xzXG4gICB8fCBjb25zdHJ1Y3Rvci5wcm90b3R5cGUgaW5zdGFuY2VvZiBSdWxlLkxpc3RcbiAgIHx8IGNvbnN0cnVjdG9yLnByb3RvdHlwZSBpbnN0YW5jZW9mIFJ1bGUuQWx0ZXJuYXRpdmVzXG4gICkge1xuICAgIGZvciAobGV0IHByb3BlcnR5IGluIHJ1bGVzWzBdKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IucHJvdG90eXBlLCBwcm9wZXJ0eSwgeyB2YWx1ZTogcnVsZXNbMF1bcHJvcGVydHldIH0pO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IucHJvdG90eXBlLCBcInJ1bGVzXCIsIHsgdmFsdWU6IHJ1bGVzIH0pO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBjb25zdHJ1Y3RvcigpO1xufVxuXG5mdW5jdGlvbiB0b2tlbmlzZVJ1bGVTeW50YXgoc3ludGF4KSB7XG4gIGNvbnN0IFNZTlRBWF9FWFBSRVNTSU9OID0gLyg/OltcXHdcXC1dK3xcXFxcW1xcW1xcKFxce1xcKVxcfVxcXV18W15cXHNcXHddfFxcfCkvZztcbiAgbGV0IHN5bnRheFN0cmVhbSA9IHN5bnRheC5tYXRjaChTWU5UQVhfRVhQUkVTU0lPTik7XG4gIGlmICghc3ludGF4U3RyZWFtKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYENhbid0IHRva2VuaXplIHBhcnNlIHJ1bGUgc3ludGF4ID4+JHtzeW50YXh9PDxgKTtcbiAgcmV0dXJuIHN5bnRheFN0cmVhbTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU3ludGF4KHN5bnRheCwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwKSB7XG4gIGlmIChzeW50YXggPT0gbnVsbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihcInBhcnNlU3ludGF4KCk6IGBzeW50YXhgIGlzIHJlcXVpcmVkXCIpO1xuICBjb25zdCBzeW50YXhTdHJlYW0gPSB0eXBlb2Ygc3ludGF4ID09PSBcInN0cmluZ1wiXG4gICAgPyB0b2tlbmlzZVJ1bGVTeW50YXgoc3ludGF4KVxuICAgIDogc3ludGF4O1xuXG4gIGxldCBsYXN0SW5kZXggPSBzeW50YXhTdHJlYW0ubGVuZ3RoO1xuICB3aGlsZSAoc3RhcnQgPCBsYXN0SW5kZXgpIHtcbiAgICBsZXQgWyBydWxlLCBlbmQgXSA9IHBhcnNlVG9rZW4oc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuICAgIGlmIChydWxlKSB7XG4gICAgICBsZXQgbGFzdCA9IHJ1bGVzW3J1bGVzLmxlbmd0aC0xXTtcbiAgICAgIC8vIElmIHRoaXMgaXMgYSBgU3ltYm9sYCBhbmQgbGFzdCB3YXMgYSBgU3ltYm9sYCwgbWVyZ2UgdG9nZXRoZXJcbiAgICAgIGlmIChsYXN0ICYmIGxhc3QgaW5zdGFuY2VvZiBSdWxlLlN5bWJvbHMgJiYgcnVsZSBpbnN0YW5jZW9mIFJ1bGUuU3ltYm9scykge1xuICAgICAgICAvLyByZW1vdmUgdGhlIGxhc3QgcnVsZVxuICAgICAgICBydWxlcy5wb3AoKTtcbiAgICAgICAgLy8gYW5kIHJlcGxhY2Ugd2l0aCBhIHJ1bGUgdGhhdCBtZXJnZXMgdGhlIGtleXdvcmRzXG4gICAgICAgIHJ1bGUubGl0ZXJhbHMgPSBsYXN0LmxpdGVyYWxzLmNvbmNhdChydWxlLmxpdGVyYWxzKTtcbiAgICAgIH1cbiAgICAgIHJ1bGVzLnB1c2gocnVsZSk7XG4gICAgfVxuICAgIHN0YXJ0ID0gZW5kICsgMTtcbiAgfVxuICByZXR1cm4gcnVsZXM7XG59XG5cbmNvbnN0IEtFWVdPUkRfUEFUVEVSTiA9IC9bQS1aYS16XVtcXHdfLV0qLztcbmZ1bmN0aW9uIHBhcnNlVG9rZW4oc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDApIHtcbiAgbGV0IHN5bnRheFRva2VuID0gc3ludGF4U3RyZWFtW3N0YXJ0XTtcblxuICAvLyBpZiB3ZSBnb3QgYSBcIlxcXFxcIiAod2hpY2ggYWxzbyBoYXMgdG8gZ28gaW50byB0aGUgc291cmNlIHN0cmluZyBhcyBcIlxcXFxcIilcbiAgLy8gdHJlYXQgdGhlIG5leHQgdG9rZW4gYXMgYSBsaXRlcmFsIHN0cmluZyByYXRoZXIgdGhhbiBhcyBhIHNwZWNpYWwgY2hhcmFjdGVyLlxuICBpZiAoc3ludGF4VG9rZW4gPT09IFwiXFxcXFwiKSB7XG4gICAgcmV0dXJuIHBhcnNlU3ltYm9sKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0ICsgMSk7XG4gIH1cblxuICBzd2l0Y2ggKHN5bnRheFRva2VuKSB7XG4gICAgY2FzZSBcIntcIjpcdHJldHVybiBwYXJzZVN1YnJ1bGUoc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuICAgIGNhc2UgXCIoXCI6XHRyZXR1cm4gcGFyc2VBbHRlcm5hdGl2ZXMoc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuICAgIGNhc2UgXCJbXCI6XHRyZXR1cm4gcGFyc2VMaXN0KHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICBjYXNlIFwiKlwiOlxuICAgIGNhc2UgXCIrXCI6XG4gICAgY2FzZSBcIj9cIjpcdHJldHVybiBwYXJzZVJlcGVhdChzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG5cbiAgICAvLyB0aGUgZm9sbG93aW5nIHNob3VsZCBBTFdBWVMgYmUgY29uc3VtZWQgYnkgdGhlIGFib3ZlXG4gICAgY2FzZSBcIn1cIjpcbiAgICBjYXNlIFwiKVwiOlxuICAgIGNhc2UgXCJdXCI6XG4gICAgY2FzZSBcInxcIjpcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgVW5leHBlY3RlZCAke3N5bnRheFRva2VufSBmb3VuZCBhcyBpdGVtICR7c3RhcnR9IG9mICR7c3ludGF4U3RyZWFtfWApO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGlmIChzeW50YXhUb2tlbi5tYXRjaChLRVlXT1JEX1BBVFRFUk4pKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUtleXdvcmQoc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBwYXJzZVN5bWJvbChzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgICB9XG4gIH1cbn1cblxuXG4vLyBNYXRjaCBga2V5d29yZGAgaW4gc3ludGF4IHJ1bGVzLlxuLy8gSWYgbW9yZSB0aGFuIG9uZSBrZXl3b3JkIGFwcGVhcnMgaW4gYSByb3csIGNvbWJpbmVzIHRoZW0gaW50byBhIHNpbmdsZSBgS2V5d29yZGAgb2JqZWN0LlxuLy8gVGhpcyBpcyBwcmV0dHkgc2FmZSwgdW5sZXNzIHlvdSBoYXZlIGFuIG9wdGlvbmFsIGtleXdvcmQgbGlrZVxuLy9cdFx0YHRoZSB7aWRlbnRpZmllcn0gb2YgdGhlPyB7ZXhwcmVzc2lvbn1gXG4vLyBpbiB3aGljaCBjYXNlIHlvdSBjYW4gcHV0IHRoZSBvcHRpb25hbCBrZXl3b3JkIGluIHBhcmVuc1xuLy9cdFx0YHRoZSB7aWRlbnRpZmllcn0gb2YgKHRoZT8pIHtleHByZXNzaW9ufWBcbi8vXG4vLyBSZXR1cm5zIGBbIHJ1bGUsIGVuZCBdYFxuLy8gVGhyb3dzIGlmIGludmFsaWQuXG5mdW5jdGlvbiBwYXJzZUtleXdvcmQoc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDAsIGNvbnN0cnVjdG9yID0gUnVsZS5LZXl3b3Jkcykge1xuICBsZXQgbGl0ZXJhbHMgPSBbXSwgZW5kO1xuICAvLyBlYXQga2V5d29yZHMgd2hpbGUgdGhleSBsYXN0XG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IHN5bnRheFN0cmVhbS5sZW5ndGg7IGkrKykge1xuICAgIGxldCBuZXh0ID0gc3ludGF4U3RyZWFtW2ldO1xuICAgIGlmICh0eXBlb2YgbmV4dCA9PT0gXCJzdHJpbmdcIiAmJiBuZXh0Lm1hdGNoKEtFWVdPUkRfUEFUVEVSTikpIHtcbiAgICAgIGxpdGVyYWxzLnB1c2gobmV4dCk7XG4gICAgICBlbmQgPSBpO1xuICAgIH1cbiAgICBlbHNlIGJyZWFrO1xuICB9XG5cbiAgbGV0IHJ1bGUgPSBuZXcgY29uc3RydWN0b3IoeyBsaXRlcmFscyB9KTtcbiAgcmV0dXJuIFsgcnVsZSwgZW5kIF07XG59XG5cbi8vIE1hdGNoIGBrZXl3b3JkYCBpbiBzeW50YXggcnVsZXMuXG4vLyBSZXR1cm5zIGBbIHJ1bGUsIGVuZCBdYFxuLy8gVGhyb3dzIGlmIGludmFsaWQuXG5mdW5jdGlvbiBwYXJzZVN5bWJvbChzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCwgY29uc3RydWN0b3IgPSBSdWxlLlN5bWJvbHMpIHtcbiAgbGV0IHN0cmluZyA9IHN5bnRheFN0cmVhbVtzdGFydF07XG4gIGlmICghY29uc3RydWN0b3IpIGNvbnN0cnVjdG9yID0gUnVsZS5TeW1ib2xzO1xuXG4gIC8vIElmIHN0cmluZyBzdGFydHMgd2l0aCBgXFxcXGAsIGl0J3MgYW4gZXNjYXBlZCBsaXRlcmFsIChlZzogYFxcW2AgbmVlZHMgdG8gaW5wdXQgYXMgYFxcXFxbYCkuXG4gIGxldCBpc0VzY2FwZWQgPSBzdHJpbmcuc3RhcnRzV2l0aChcIlxcXFxcIik7XG4gIGxldCBsaXRlcmFscyA9IGlzRXNjYXBlZCA/IHN0cmluZy5zdWJzdHIoMSkgOiBzdHJpbmc7XG5cbiAgbGV0IHJ1bGUgPSBuZXcgY29uc3RydWN0b3IoeyBsaXRlcmFscyB9KTtcblxuICBpZiAoaXNFc2NhcGVkKSB7XG4gICAgcnVsZS50b1N5bnRheCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGBcXFxcJHtsaXRlcmFsc30ke3RoaXMub3B0aW9uYWwgPyAnPycgOiAnJ31gO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbIHJ1bGUsIHN0YXJ0IF07XG59XG5cblxuLy8gTWF0Y2ggZ3JvdXBpbmcgZXhwcmVzc2lvbiBgKC4uLnwuLi4pYCBpbiBzeW50YXggcnVsZXMuXG4vLyBSZXR1cm5zIGBbIHJ1bGUsIGVuZCBdYFxuLy8gWW91IGNhbiBzcGVjaWZ5IGFuIGV4cGxpY2l0IGBydWxlLmFyZ3VtZW50YCB3aXRoOiAgYChzb21lYXJnOi4uLilgXG4vLyBZb3UgY2FuIHNwZWNpZnkgdGhhdCB0aGUgcmVzdWx0cyBzaG91bGQgYmUgYHByb21vdGVkYCB0byBlbmNsb3NpbmcgY29udGV4dCB3aXRoOiBgKD86Li4uKWBcbi8vXG4vLyBOT1RFOiBuZXN0ZWQgcGFyZW5zIG1heSBub3QgaGF2ZSBhbHRlcm5hdGl2ZXMuLi4gOi0oICAgYChhfChifGMpKWAgd29uJ3Qgd29yaz8/P1xuZnVuY3Rpb24gcGFyc2VBbHRlcm5hdGl2ZXMoc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDApIHtcbiAgbGV0IHsgZW5kLCBzbGljZSB9ID0gUGFyc2VyLmZpbmROZXN0ZWRUb2tlbnMoc3ludGF4U3RyZWFtLCBcIihcIiwgXCIpXCIsIHN0YXJ0KTtcblxuICAvLyBwdWxsIG91dCBleHBsaWNpdCBcInByb21vdGVcIiBmbGFnOiBgPzpgXG4gIGxldCBwcm9tb3RlID0gKHNsaWNlWzBdID09PSBcIj9cIiAmJiBzbGljZVsxXSA9PT0gXCI6XCIpO1xuICBpZiAocHJvbW90ZSkgc2xpY2UgPSBzbGljZS5zbGljZSgyKTtcblxuICAvLyBwdWxsIG91dCBleHBsaWNpdCBhcmd1bWVudCBuYW1lXG4gIGxldCBhcmd1bWVudDtcbiAgaWYgKHNsaWNlLmxlbmd0aCA+IDIgJiYgc2xpY2VbMV0gPT09IFwiOlwiKSB7XG4gICAgYXJndW1lbnQgPSBzbGljZVswXTtcbiAgICBzbGljZSA9IHNsaWNlLnNsaWNlKDIpO1xuICB9XG5cbiAgLy8gc3BsaXQgaW50byBncm91cHMsIGluY2x1ZGluZyBuZXN0ZWQgcGFyZW5zXG4gIGxldCBhbHRlcm5hdGl2ZXMgPVxuICAgIGdyb3VwQWx0ZXJuYXRpdmVzKHNsaWNlKVxuICAgIC5tYXAoZnVuY3Rpb24oZ3JvdXApIHtcbiAgICAgIGxldCByZXN1bHRzID0gcGFyc2VTeW50YXgoZ3JvdXAsIFtdKTtcbiAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gcmVzdWx0c1swXTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFJ1bGUuU2VxdWVuY2UoeyBydWxlczogcmVzdWx0cyB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICBsZXQgcnVsZSA9IGFsdGVybmF0aXZlcy5sZW5ndGggPT09IDEgPyBhbHRlcm5hdGl2ZXNbMF0gOiBuZXcgUnVsZS5BbHRlcm5hdGl2ZXMoeyBydWxlczogYWx0ZXJuYXRpdmVzIH0pO1xuICBpZiAoYXJndW1lbnQpIHJ1bGUuYXJndW1lbnQgPSBhcmd1bWVudDtcbiAgaWYgKHByb21vdGUpIHJ1bGUucHJvbW90ZSA9IHRydWU7XG4gIHJldHVybiBbIHJ1bGUsIGVuZCBdO1xuXG4gIGZ1bmN0aW9uIGdyb3VwQWx0ZXJuYXRpdmVzKHRva2Vucykge1xuICAgIGxldCBhbHRlcm5hdGl2ZXMgPSBbXTtcbiAgICBsZXQgY3VycmVudCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwLCB0b2tlbjsgdG9rZW4gPSB0b2tlbnNbaV07IGkrKykge1xuICAgICAgLy8gaGFuZGxlIGFsdGVybmF0ZSBtYXJrZXJcbiAgICAgIGlmICh0b2tlbiA9PT0gXCJ8XCIpIHtcbiAgICAgICAgYWx0ZXJuYXRpdmVzLnB1c2goY3VycmVudCk7XG4gICAgICAgIGN1cnJlbnQgPSBbXTtcbiAgICAgIH1cbiAgICAgIC8vIGhhbmRsZSBuZXN0ZWQgcGFyZW5zXG4gICAgICBlbHNlIGlmICh0b2tlbiA9PT0gXCIoXCIpIHtcbiAgICAgICAgbGV0IHsgZW5kIH0gPSBQYXJzZXIuZmluZE5lc3RlZFRva2Vucyh0b2tlbnMsIFwiKFwiLCBcIilcIiwgaSk7XG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LmNvbmNhdCh0b2tlbnMuc2xpY2UoaSwgZW5kICsgMSkpO1xuICAgICAgICBpID0gZW5kO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGN1cnJlbnQucHVzaCh0b2tlbik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChjdXJyZW50Lmxlbmd0aCkgYWx0ZXJuYXRpdmVzLnB1c2goY3VycmVudCk7XG4gICAgcmV0dXJuIGFsdGVybmF0aXZlcztcbiAgfVxufVxuXG4vLyBNYXRjaCByZXBlYXQgaW5kaWNhdG9yIGA/YCwgYCtgIG9yIGAqYCBieSBhdHRhY2hpbmcgaXQgdG8gdGhlIHByZXZpb3VzIHJ1bGUuXG5mdW5jdGlvbiBwYXJzZVJlcGVhdChzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCkge1xuICBsZXQgc3ltYm9sID0gc3ludGF4U3RyZWFtW3N0YXJ0XTtcbiAgbGV0IHJ1bGUgPSBydWxlc1tydWxlcy5sZW5ndGggLSAxXTtcbiAgaWYgKCFydWxlKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYENhbid0IGF0dGFjaCByZXBlYXQgc3ltYm9sICR7c3ltYm9sfSB0byBlbXB0eSBydWxlIWApO1xuXG4gIC8vIFRyYW5zZm9ybSBsYXN0IHJ1bGUgaW50byBhIHJlcGVhdCBmb3IgYCpgIGFuZCBgK2AuXG4gIGlmIChzeW1ib2wgPT09IFwiKlwiIHx8IHN5bWJvbCA9PT0gXCIrXCIpIHtcbiAgICBsZXQgYXJndW1lbnQgPSBydWxlLmFyZ3VtZW50O1xuICAgIHJ1bGUgPSBuZXcgUnVsZS5SZXBlYXQoeyByZXBlYXQ6IHJ1bGUgfSk7XG4gICAgaWYgKGFyZ3VtZW50KSBydWxlLmFyZ3VtZW50ID0gYXJndW1lbnQ7XG4gICAgLy8gcHVzaCBpbnRvIHJ1bGUgc3RhY2sgaW4gcGxhY2Ugb2Ygb2xkIHJ1bGVcbiAgICBydWxlc1tydWxlcy5sZW5ndGggLSAxXSA9IHJ1bGU7XG4gIH1cblxuICAvLyBSdWxlIGlzIG9wdGlvbmFsIGZvciBgP2AgYW5kIGAqYC5cbiAgaWYgKHN5bWJvbCA9PT0gXCI/XCIgfHwgc3ltYm9sID09PSBcIipcIikge1xuICAgIHJ1bGUub3B0aW9uYWwgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIFsgdW5kZWZpbmVkLCBzdGFydCBdXG59XG5cbi8vIE1hdGNoIGB7PHJ1bGVOYW1lPn1gIGluIHN5bnRheCBydWxlcy5cbi8vIFJldHVybnMgYFsgcnVsZSwgZW5kIF1gXG4vLyBUaHJvd3MgaWYgaW52YWxpZC5cbmZ1bmN0aW9uIHBhcnNlU3VicnVsZShzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCkge1xuICBsZXQgbWF0Y2ggPSBQYXJzZXIuZmluZE5lc3RlZFRva2VucyhzeW50YXhTdHJlYW0sIFwie1wiLCBcIn1cIiwgc3RhcnQpO1xuICBsZXQgYXJndW1lbnQ7XG4gIGlmIChtYXRjaC5zbGljZS5sZW5ndGggPT09IDMgJiYgbWF0Y2guc2xpY2VbMV0gPT09IFwiOlwiKSB7XG4gICAgYXJndW1lbnQgPSBtYXRjaC5zbGljZVswXTtcbiAgICBtYXRjaC5zbGljZSA9IG1hdGNoLnNsaWNlLnNsaWNlKDIpO1xuICB9XG4gIGlmIChtYXRjaC5zbGljZS5sZW5ndGggPiAxKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYENhbid0IHByb2Nlc3MgcnVsZXMgd2l0aCBtb3JlIHRoYW4gb25lIHJ1bGUgbmFtZTogeyR7bWF0Y2guc2xpY2Uuam9pbihcIlwiKX19YCk7XG5cbiAgbGV0IHBhcmFtcyA9IHsgc3VicnVsZTogbWF0Y2guc2xpY2VbMF0gfTtcblxuICAvLyBzZWUgaWYgdGhlcmUncyBhIGBub3RgIHJ1bGUgaW4gdGhlcmVcbiAgbGV0IGJhbmdQb3NpdGlvbiA9IHBhcmFtcy5zdWJydWxlLmluZGV4T2YoXCIhXCIpO1xuICBpZiAoYmFuZ1Bvc2l0aW9uICE9PSAtMSkge1xuICAgIHBhcmFtcy5ub3QgPSBwYXJhbXMuc3VicnVsZS5zdWJzdHIoYmFuZ1Bvc2l0aW9uICsgMSk7XG4gICAgcGFyYW1zLnN1YnJ1bGUgPSBwYXJhbXMuc3VicnVsZS5zdWJzdHIoMCwgYmFuZ1Bvc2l0aW9uKTtcbiAgfVxuXG4gIGxldCBydWxlID0gbmV3IFJ1bGUuU3VicnVsZShwYXJhbXMpO1xuICBpZiAoYXJndW1lbnQpIHJ1bGUuYXJndW1lbnQgPSBhcmd1bWVudDtcbiAgcmV0dXJuIFsgcnVsZSwgbWF0Y2guZW5kIF07XG59XG5cbi8vIE1hdGNoIGxpc3QgZXhwcmVzc2lvbiBgWzxpdGVtPjxkZWxpbWl0ZXI+XWAgb3IgYFs8YXJndW1lbnQ+OjxpdGVtPjxkZWxpbWl0ZXI+XWAgaW4gc3ludGF4IHJ1bGVzLlxuLy8gUmV0dXJucyBgWyBydWxlLCBlbmQgXWBcbi8vIFRocm93cyBpZiBpbnZhbGlkLlxuZnVuY3Rpb24gcGFyc2VMaXN0KHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwLCBjb25zdHJ1Y3RvciA9IFJ1bGUuTGlzdCkge1xuICBsZXQgeyBlbmQsIHNsaWNlIH0gPSBQYXJzZXIuZmluZE5lc3RlZFRva2VucyhzeW50YXhTdHJlYW0sIFwiW1wiLCBcIl1cIiwgc3RhcnQpO1xuXG4gIC8vIGdldCBhcmd1bWVudCBpZiBzdXBwbGllZFxuICBsZXQgYXJndW1lbnQ7XG4gIGlmIChzbGljZS5sZW5ndGggPiAyICYmIHNsaWNlWzFdID09PSBcIjpcIikge1xuICAgIGFyZ3VtZW50ID0gc2xpY2VbMF07XG4gICAgc2xpY2UgPSBzbGljZS5zbGljZSgyKTtcbiAgfVxuXG4gIGxldCByZXN1bHRzID0gcGFyc2VTeW50YXgoc2xpY2UsIFtdKTtcbiAgaWYgKHJlc3VsdHMubGVuZ3RoICE9PSAyKSB7XG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkIHN0dWZmIGF0IGVuZCBvZiBsaXN0OiBbJHtzbGljZS5qb2luKFwiIFwiKX1dYCk7XG4gIH1cbiAgbGV0IFsgaXRlbSwgZGVsaW1pdGVyIF0gPSByZXN1bHRzO1xuXG4gIGxldCBydWxlID0gbmV3IGNvbnN0cnVjdG9yKHsgaXRlbSwgZGVsaW1pdGVyIH0pO1xuICBpZiAoYXJndW1lbnQpIHJ1bGUuYXJndW1lbnQgPSBhcmd1bWVudDtcbiAgcmV0dXJuIFsgcnVsZSwgZW5kIF07XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvUnVsZVN5bnRheC5qcyIsImltcG9ydCB7IGdldFRhYnMgfSBmcm9tIFwiLi91dGlscy9zdHJpbmdcIjtcblxuLy8gR1JSUi4uLiBub2RlIGRvZXNuJ3QgaW5jbHVkZSB0aGlzPz8/XG4vLyBDSEVDSyBESUZGRVJFTlQgTk9ERSBWRVJTSU9OUy4uLlxuaWYgKCEoQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzKSkge1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoQXJyYXkucHJvdG90eXBlLCBcImluY2x1ZGVzXCIsIHtcblx0XHR2YWx1ZTogZnVuY3Rpb24odmFsdWUsIHN0YXJ0KSB7XG5cdFx0XHRsZXQgaW5kZXggPSB0aGlzLmluZGV4T2YodmFsdWUsIHN0YXJ0KTtcblx0XHRcdHJldHVybiAoaW5kZXggIT09IC0xKTtcblx0XHR9XG5cdH0pO1xufVxuXG5cblxuLy8gYHdoaXRlc3BhY2VgIGNsYXNzIGZvciBub3JtYWwgKG5vbi1pbmRlbnQsIG5vbi1uZXdsaW5lKSB3aGl0ZXNwYWNlLlxuY2xhc3Mgd2hpdGVzcGFjZSB7XG5cdGNvbnN0cnVjdG9yKHdoaXRlc3BhY2UpIHtcblx0XHR0aGlzLndoaXRlc3BhY2UgPSB3aGl0ZXNwYWNlO1xuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBcImxlbmd0aFwiIG9mIHRoaXMgd2hpdGVzcGFjZSwgZWcgZm9yIGFuIGluZGVudC5cblx0Z2V0IGxlbmd0aCgpIHtcblx0XHRyZXR1cm4gdGhpcy53aGl0ZXNwYWNlLmxlbmd0aDtcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiB0aGlzLndoaXRlc3BhY2U7XG5cdH1cbn1cblxuXG4vLyBgaW5kZW50YCBjbGFzcy5cbmNsYXNzIGluZGVudCBleHRlbmRzIHdoaXRlc3BhY2Uge31cblxuXG4vLyBOZXdsaW5lIHNpbmdsZXRvbi5cbmNsYXNzIG5ld2xpbmUgZXh0ZW5kcyB3aGl0ZXNwYWNlIHt9XG5cblxuLy9cbi8vXHQjIFRva2VuaXplclxuLy9cdC0gYC50b2tlbml6ZSgpYCBcdFx0QnJlYWtzIHVwIGxvbmcgc3RyaW5nIGludG8gdG9rZW5zLCBpbmNsdWRpbmcgbmV3bGluZXMsIEpTWCBleHByZXNzaW9ucywgZXRjLlxuLy9cdC0gYC50b2tlbml6ZUxpbmVzKClgIFx0VGFrZXMgdGhlIGFib3ZlIGFuZCBicmVha3MgaXQgaW50byBhbiBhcnJheSBvZiBhcnJheXMgZm9yIGVhY2ggbGluZS5cbi8vXG4vLyBUT0RPOiBlcnJvciBjaGVja2luZyAvIHJlcG9ydGluZywgZXNwZWNpYWxseSBpbiBKU1ggZXhwcmVzc2lvbnMuXG4vLyBUT0RPOiBoYXZlIG5vcm1hbCBgdG9rZW5pemVgIHN0aWNrIHdoaXRlc3BhY2UgZWxlbWVudHMgaW4gdGhlIHN0cmVhbSwgdGhlbiBgdG9rZW5pemVMaW5lcygpYCB0YWtlcyB0aGVtIG91dD9cbmNvbnN0IFRva2VuaXplciA9IHtcblxuXHQvLyBTaG91bGQgd2Ugd2FybiBhYm91dCBhbm9tYWxvdXMgY29uZGl0aW9ucz9cblx0V0FSTiA6IGZhbHNlLFxuXG5cdC8vIFdoaXRlc3BhY2UgY29uc3RydWN0b3IuXG5cdFdoaXRlc3BhY2U6IHdoaXRlc3BhY2UsXG5cblx0Ly8gSW5kZW50IGNvbnN0cnVjdG9yXG5cdEluZGVudDogaW5kZW50LFxuXG5cdC8vIE5FV0xJTkUgc2luZ2xldG9uLlxuXHRORVdMSU5FOiBuZXcgbmV3bGluZShcIlxcblwiKSxcblxuXHQvLyBUb2tlbml6ZSB0ZXh0IGJldHdlZW4gYHN0YXJ0YCBhbmQgYGVuZGAgaW50byBhbiBhcnJheSBvZiBgcmVzdWx0c2AsIGFuIGFycmF5IG9mOlxuXHQvL1x0LSBgVG9rZW5pemVyLk5FV0xJTkVgIGZvciBhIG5ld2xpbmUgc3ltYm9sXG5cdC8vXHQtIHN0cmluZ3MgZm9yIGtleXdvcmRzL3N5bWJvbHNcblx0Ly9cdC0gbnVtYmVycyBmb3IgbnVtYmVyIGxpdGVyYWxzXG5cdC8vXHQtIGB7IGluZGVudDogbnVtYmVyIH1gIGZvciBpbmRlbnQgYXQgc3RhcnQgb2YgbGluZVxuXHQvL1x0LSBgeyB0eXBlOiBcInRleHRcIiwgbGl0ZXJhbDogXCInYWJjJ1wiLCB0ZXh0OiBcImFiY1wiIH1cblx0Ly9cdC0gYHsgdHlwZTogXCJpbmRlbnRcIiwgbGV2ZWw6IDcgfWBcblx0Ly9cdC0gYHsgdHlwZTogXCJjb21tZW50XCIsIGNvbW1lbnQ6IFwic3RyaW5nXCIsIGNvbW1lbnRTeW1ib2wsIHdoaXRlc3BhY2UgfWBcbi8vVEVTVE1FXG5cdHRva2VuaXplKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdC8vIHF1aWNrIHJldHVybiBvdXQgb2YgcmFuZ2Ugb3Igb25seSB3aGl0ZXNwYWNlXG5cdFx0aWYgKHN0YXJ0ID49IGVuZCB8fCAhdGV4dC50cmltKCkpIHJldHVybiBbXTtcblxuXHRcdGxldCB0b2tlbnMgPSBbXTtcblx0XHQvLyBQcm9jZXNzIG91ciB0b3AtbGV2ZWwgcnVsZXMuXG5cdFx0bGV0IFtyZXN1bHRzLCBuZXh0U3RhcnRdID0gdGhpcy5lYXRUb2tlbnModGhpcy5tYXRjaFRvcFRva2VucywgdGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0aWYgKHJlc3VsdHMpIHtcblx0XHRcdHRva2VucyA9IHRva2Vucy5jb25jYXQocmVzdWx0cyk7XG5cdFx0XHRzdGFydCA9IG5leHRTdGFydDtcblx0XHR9XG5cdFx0aWYgKHN0YXJ0ICE9PSBlbmQpIHtcblx0XHRcdGlmIChUb2tlbml6ZXIuV0FSTikgY29uc29sZS53YXJuKFwidG9rZW5pemUoKTogZGlkbid0IGNvbnN1bWU6IGBcIiwgdGV4dC5zbGljZShzdGFydCwgZW5kKSArIFwiYFwiKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0cztcblx0fSxcblxuXHQvLyBSZXBlYXRlZGx5IGV4ZWN1dGUgYSBgbWV0aG9kYCAoYm91bmQgdG8gYHRoaXMpIHdoaWNoIHJldHVybnMgYSBgW3Jlc3VsdCwgbmV4dFN0YXJ0XWAgb3IgYHVuZGVmaW5lZGAuXG5cdC8vIFBsYWNlcyBtYXRjaGVkIHJlc3VsdHMgdG9nZXRoZXIgaW4gYHJlc3VsdHNgIGFycmF5IGFuZCByZXR1cm5zIGBbcmVzdWx0cywgbmV4dFN0YXJ0XWAgZm9yIHRoZSBlbnRpcmUgc2V0LlxuXHQvLyBTdG9wcyBpZiBgbWV0aG9kYCBkb2Vzbid0IHJldHVybiBhbnl0aGluZywgb3IgaWYgY2FsbGluZyBgbWV0aG9kYCBpcyB1bnByb2R1Y3RpdmUuXG4vL1RFU1RNRVxuXHRlYXRUb2tlbnMobWV0aG9kLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCwgcmVzdWx0cyA9IFtdKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBwcm9jZXNzIHJ1bGVzIHJlcGVhdGVkbHkgdW50aWwgd2UgZ2V0IHRvIHRoZSBlbmRcblx0XHR3aGlsZSAoc3RhcnQgPCBlbmQpIHtcblx0XHRcdGxldCByZXN1bHQgPSBtZXRob2QuY2FsbCh0aGlzLCB0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRcdGlmICghcmVzdWx0KSBicmVhaztcblxuXHRcdFx0bGV0IFt0b2tlbnMsIG5leHRTdGFydF0gPSByZXN1bHQ7XG5cdFx0XHQvLyBCYWlsIGlmIHdlIGRpZG4ndCBnZXQgYSBwcm9kdWN0aXZlIHJ1bGUhXG5cdFx0XHRpZiAoc3RhcnQgPT09IG5leHRTdGFydCkgYnJlYWs7XG5cblx0XHRcdC8vIGhhbmRsZSBuZXdSZXN1bHRzIGFzIGFuIGFycmF5IG9yIHNpbmdsZSBvYmplY3QuXG5cdFx0XHRpZiAodG9rZW5zICE9PSB1bmRlZmluZWQpIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdCh0b2tlbnMpO1xuXHRcdFx0c3RhcnQgPSBuZXh0U3RhcnQ7XG5cdFx0fVxuXHRcdHJldHVybiBbcmVzdWx0cywgc3RhcnRdO1xuXHR9LFxuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIHRvcC1sZXZlbCB0b2tlbiBhdCBgdGV4dFtzdGFydF1gLlxuLy9URVNUTUVcblx0bWF0Y2hUb3BUb2tlbnModGV4dCwgc3RhcnQsIGVuZCkge1xuXHRcdHJldHVyblx0dGhpcy5tYXRjaFdoaXRlc3BhY2UodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoV29yZCh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0IHx8IHRoaXMubWF0Y2hOdW1iZXIodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoTmV3bGluZSh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0IHx8IHRoaXMubWF0Y2hKU1hFbGVtZW50KHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaFRleHQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoQ29tbWVudCh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0IHx8IHRoaXMubWF0Y2hTeW1ib2wodGV4dCwgc3RhcnQsIGVuZClcblx0XHQ7XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIFN5bWJvbCBjaGFyYWN0ZXJcblx0Ly9cblxuXHQvLyBNYXRjaCB0aGUgc2luZ2xlIFwic3ltYm9sXCIgY2hhcmFjdGVyIGF0IGB0ZXh0W3N0YXJ0XWAuXG5cdC8vIE5PVEU6IFRoaXMgZG9lcyBub3QgZG8gYW55IGNoZWNraW5nLCBpdCBqdXN0IGJsaW5kbHkgdXNlcyB0aGUgY2hhcmFjdGVyIGluIHF1ZXN0aW9uLlxuXHQvL1x0XHQgWW91IHNob3VsZCBtYWtlIHN1cmUgYWxsIG90aGVyIHBvc3NpYmxlIHJ1bGVzIGhhdmUgYmVlbiBleGhhdXN0ZWQgZmlyc3QuXG5cdG1hdGNoU3ltYm9sKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gW3RleHRbc3RhcnRdLCBzdGFydCArIDFdXG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIFdoaXRlc3BhY2Vcblx0Ly9cblxuXHQvLyBSZXR1cm4gdGhlIGZpcnN0IGNoYXIgcG9zaXRpb24gYWZ0ZXIgYHN0YXJ0YCB3aGljaCBpcyBOT1QgYSB3aGl0ZXNwYWNlIGNoYXIgKHNwYWNlIG9yIHRhYiBvbmx5KS5cblx0Ly8gSWYgYHRleHRbc3RhcnRdYCBpcyBub3Qgd2hpdGVzcGFjZSwgcmV0dXJucyBgc3RhcnRgLFxuXHQvL1x0c28geW91IGNhbiBjYWxsIHRoaXMgYXQgYW55IHRpbWUgdG8gc2tpcCB3aGl0ZXNwYWNlIGluIHRoZSBvdXRwdXQuXG5cdGVhdFdoaXRlc3BhY2UodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIGVuZDtcblxuXHRcdGxldCB3aGl0ZVNwYWNlRW5kID0gc3RhcnQ7XG5cdFx0d2hpbGUgKHdoaXRlU3BhY2VFbmQgPCBlbmQgJiYgKHRleHRbd2hpdGVTcGFjZUVuZF0gPT09IFwiIFwiIHx8IHRleHRbd2hpdGVTcGFjZUVuZF0gPT09IFwiXFx0XCIpKSB7XG5cdFx0XHR3aGl0ZVNwYWNlRW5kKys7XG5cdFx0fVxuXHRcdHJldHVybiB3aGl0ZVNwYWNlRW5kO1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBXaGl0ZXNwYWNlXG5cdC8vXHROT1RFOiBXaGl0ZXNwYWNlIGF0IHRoZSBiZWdpbm5pbmcgb2YgYHRleHRgIG9yIHRoZSBiZWdpbm5pbmcgb2YgYSBsaW5lXG5cdC8vXHRcdCAgaXMgY29uc2lkZXJlZCBhbiBcImluZGVudFwiIGFuZCB3aWxsIGhhdmUgYC5pc0luZGVudCA9PT0gdHJ1ZWAuXG5cdC8vXG5cblx0Ly8gQ29udmVydCBhIHJ1biBvZiBzcGFjZXMgYW5kL29yIHRhYnMgaW50byBhIGBUb2tlbml6ZXIuV2hpdGVzcGFjZWAuXG5cdG1hdGNoV2hpdGVzcGFjZSh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHdoaXRlc3BhY2VFbmQgPSB0aGlzLmVhdFdoaXRlc3BhY2UodGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0Ly8gZm9yZ2V0IGl0IGlmIG5vIGZvcndhcmQgbW90aW9uXG5cdFx0aWYgKHdoaXRlc3BhY2VFbmQgPT09IHN0YXJ0KSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHdoaXRlc3BhY2UgPSB0ZXh0LnNsaWNlKHN0YXJ0LCB3aGl0ZXNwYWNlRW5kKTtcblx0XHRsZXQgdG9rZW47XG5cdFx0aWYgKHN0YXJ0ID09PSAwIHx8IHRleHRbc3RhcnQtMV0gPT09IFwiXFxuXCIpXG5cdFx0XHR0b2tlbiA9IG5ldyBUb2tlbml6ZXIuSW5kZW50KHdoaXRlc3BhY2UpO1xuXHRcdGVsc2Vcblx0XHRcdHRva2VuID0gbmV3IFRva2VuaXplci5XaGl0ZXNwYWNlKHdoaXRlc3BhY2UpO1xuXG5cdFx0cmV0dXJuIFt0b2tlbiwgd2hpdGVzcGFjZUVuZF07XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIE5ld2xpbmVcblx0Ly9cblxuXHQvLyBNYXRjaCBhIHNpbmdsZSBuZXdsaW5lIGNoYXJhY3RlciBhdCBgdGV4dFtzdGFydF1gLlxuXHQvLyBSZXR1cm5zIGBbVG9rZW5pemVyLk5FV0xJTkUsIG5leHRTdGFydF1gIG9uIG1hdGNoLlxuXHQvLyBPdGhlcndpc2UgcmV0dXJucyBgdW5kZWZpbmVkYC5cblx0bWF0Y2hOZXdsaW5lKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQgfHwgdGV4dFtzdGFydF0gIT09IFwiXFxuXCIpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gW1Rva2VuaXplci5ORVdMSU5FLCBzdGFydCArIDFdO1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBXb3JkXG5cdC8vXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgYHdvcmRgIGluIGB0ZXh0YCBhdCBjaGFyYWN0ZXIgYHN0YXJ0YC5cblx0Ly8gUmV0dXJucyBgW3dvcmQsIHdvcmRFbmRdYC5cblx0Ly8gUmV0dXJucyBhbiBlbXB0eSBhcnJheSBpZiBjb3VsZG4ndCBtYXRjaCBhIHdvcmQuXG5cdFdPUkRfU1RBUlQ6IC9bQS1aYS16XS8sXG5cdFdPUkRfQ0hBUiA6IC9eW1xcd18tXS8sXG5cdG1hdGNoV29yZCh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0aWYgKCF0aGlzLldPUkRfU1RBUlQudGVzdCh0ZXh0W3N0YXJ0XSkpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgd29yZEVuZCA9IHN0YXJ0ICsgMTtcblx0XHR3aGlsZSAod29yZEVuZCA8IGVuZCAmJiB0aGlzLldPUkRfQ0hBUi50ZXN0KHRleHRbd29yZEVuZF0pKSB7XG5cdFx0XHR3b3JkRW5kKys7XG5cdFx0fVxuXHRcdGlmICh3b3JkRW5kID09PSBzdGFydCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB3b3JkID0gdGV4dC5zbGljZShzdGFydCwgd29yZEVuZCk7XG5cdFx0cmV0dXJuIFt3b3JkLCB3b3JkRW5kXTtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgTnVtYmVyc1xuXHQvL1xuXG5cdC8vIEVhdCBhIHNpbmdsZSBudW1iZXIuXG5cdC8vIFJldHVybnMgYSBgTnVtYmVyYCBpZiBtYXRjaGVkLlxuXHROVU1CRVJfU1RBUlQ6IC9bMC05LS5dLyxcblx0TlVNQkVSIDogL14tPyhbMC05XSpcXC4pP1swLTldKy8sXG5cdG1hdGNoTnVtYmVyKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRpZiAoIXRoaXMuTlVNQkVSX1NUQVJULnRlc3QodGV4dFtzdGFydF0pKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG51bWJlck1hdGNoID0gdGhpcy5tYXRjaEV4cHJlc3Npb25BdEhlYWQodGhpcy5OVU1CRVIsIHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGlmICghbnVtYmVyTWF0Y2gpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbnVtYmVyU3RyID0gbnVtYmVyTWF0Y2hbMF07XG5cdFx0bGV0IG51bWJlciA9IHBhcnNlRmxvYXQobnVtYmVyU3RyLCAxMCk7XG5cdFx0cmV0dXJuIFtudW1iZXIsIHN0YXJ0ICsgbnVtYmVyU3RyLmxlbmd0aF07XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIFRleHQgbGl0ZXJhbFxuXHQvL1xuXG5cdC8vIEVhdCBhIHRleHQgbGl0ZXJhbCAoc3RhcnRzL2VuZHMgd2l0aCBgJ2Agb3IgYFwiYCkuXG5cdC8vIFJldHVybnMgYSBgVG9rZW5pemVyLlRleHRgIGlmIG1hdGNoZWQuXG4vL1RFU1RNRTogIG5vdCBzdXJlIHRoZSBlc2NhcGluZyBsb2dpYyBpcyByZWFsbHkgcmlnaHQuLi5cblx0bWF0Y2hUZXh0KHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgcXVvdGVTeW1ib2wgPSB0ZXh0W3N0YXJ0XTtcblx0XHRpZiAocXVvdGVTeW1ib2wgIT09ICdcIicgJiYgcXVvdGVTeW1ib2wgIT09IFwiJ1wiKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHRleHRFbmQgPSBzdGFydCArIDE7XG5cdFx0d2hpbGUgKHRleHRFbmQgPCBlbmQpIHtcblx0XHRcdGxldCBjaGFyID0gdGV4dFt0ZXh0RW5kXTtcblx0XHRcdGlmIChjaGFyID09PSBxdW90ZVN5bWJvbCkgYnJlYWs7XG5cdFx0XHQvLyBpZiB3ZSBnZXQgYSBiYWNrcXVvdGUsIGlnbm9yZSBxdW90ZSBpbiBuZXh0IGNoYXJcblx0XHRcdGlmIChjaGFyID09PSBcIlxcXFxcIiAmJiB0ZXh0W3RleHRFbmQgKyAxXSA9PT0gcXVvdGVTeW1ib2wpIHRleHRFbmQrKztcblx0XHRcdHRleHRFbmQrKztcblx0XHR9XG5cdFx0Ly8gRm9yZ2V0IGl0IGlmIHdlIGRpZG4ndCBlbmQgd2l0aCB0aGUgcXVvdGUgc3ltYm9sXG5cdFx0aWYgKHRleHRbdGV4dEVuZF0gIT09IHF1b3RlU3ltYm9sKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdC8vIGFkdmFuY2UgcGFzdCBlbmQgcXVvdGVcblx0XHR0ZXh0RW5kKys7XG5cblx0XHRsZXQgcXVvdGVkU3RyaW5nID0gdGV4dC5zbGljZShzdGFydCwgdGV4dEVuZCk7XG5cdFx0bGV0IHRva2VuID0gbmV3IFRva2VuaXplci5UZXh0KHF1b3RlZFN0cmluZyk7XG5cdFx0cmV0dXJuIFt0b2tlbiwgdGV4dEVuZF07XG5cdH0sXG5cblx0Ly8gYFRleHRgIGNsYXNzIGZvciBzdHJpbmcgbGl0ZXJhbHMuXG5cdC8vIFBhc3MgdGhlIGxpdGVyYWwgdmFsdWUsIHVzZSBgLnRleHRgIHRvIGdldCBqdXN0IHRoZSBiaXQgaW5zaWRlIHRoZSBxdW90ZXMuXG5cdFRleHQgOiBjbGFzcyB0ZXh0IHtcblx0XHRjb25zdHJ1Y3RvcihxdW90ZWRTdHJpbmcpIHtcblx0XHRcdHRoaXMucXVvdGVkU3RyaW5nID0gcXVvdGVkU3RyaW5nO1xuXHRcdH1cblx0XHRnZXQgdGV4dCgpIHtcblx0XHRcdGxldCBzdHJpbmcgPSB0aGlzLnF1b3RlZFN0cmluZztcblx0XHRcdC8vIGNhbGN1bGF0ZSBgdGV4dGAgYXMgdGhlIGJpdHMgYmV0d2VlbiB0aGUgcXVvdGVzLlxuXHRcdFx0bGV0IHN0YXJ0ID0gMDtcblx0XHRcdGxldCBlbmQgPSBzdHJpbmcubGVuZ3RoO1xuXHRcdFx0aWYgKHN0cmluZ1tzdGFydF0gPT09ICdcIicgfHwgc3RyaW5nW3N0YXJ0XSA9PT0gXCInXCIpIHN0YXJ0ID0gMTtcblx0XHRcdGlmIChzdHJpbmdbZW5kLTFdID09PSAnXCInIHx8IHN0cmluZ1tlbmQtMV0gPT09IFwiJ1wiKSBlbmQgPSAtMTtcblx0XHRcdHJldHVybiBzdHJpbmcuc2xpY2Uoc3RhcnQsIGVuZCk7XG5cdFx0fVxuXHRcdHRvU3RyaW5nKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMucXVvdGVkU3RyaW5nO1xuXHRcdH1cblx0fSxcblxuXHQvL1xuXHQvL1x0IyMjIENvbW1lbnRzXG5cdC8vXG5cblx0Ly8gRWF0IGEgY29tbWVudCAodW50aWwgdGhlIGVuZCBvZiB0aGUgbGluZSkuXG5cdC8vIFJldHVybnMgYSBgVG9rZW5pemVyLkNvbW1lbnRgIGlmIG1hdGNoZWQuXG5cdENPTU1FTlQgOiAvXigjIyt8LS0rfFxcL1xcLyspKFxccyopKC4qKS8sXG5cdG1hdGNoQ29tbWVudCh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IGNvbW1lbnRTdGFydCA9IHRleHQuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgMik7XG5cdFx0aWYgKGNvbW1lbnRTdGFydCAhPT0gXCItLVwiICYmIGNvbW1lbnRTdGFydCAhPT0gXCJcXC9cXC9cIiAmJiBjb21tZW50U3RhcnQgIT09IFwiIyNcIikgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIGNvbW1lbnQgZWF0cyB1bnRpbCB0aGUgZW5kIG9mIHRoZSBsaW5lXG5cdFx0bGV0IGxpbmUgPSB0aGlzLmdldExpbmVBdEhlYWQodGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0bGV0IGNvbW1lbnRNYXRjaCA9IGxpbmUubWF0Y2godGhpcy5DT01NRU5UKVxuXHRcdGlmICghY29tbWVudE1hdGNoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IFttYXRjaCwgY29tbWVudFN5bWJvbCwgd2hpdGVzcGFjZSwgY29tbWVudF0gPSBjb21tZW50TWF0Y2g7XG5cdFx0bGV0IHRva2VuID0gbmV3IFRva2VuaXplci5Db21tZW50KHsgY29tbWVudFN5bWJvbCwgd2hpdGVzcGFjZSwgY29tbWVudCB9KTtcblx0XHRyZXR1cm4gW3Rva2VuLCBzdGFydCArIGxpbmUubGVuZ3RoXTtcblx0fSxcblxuXHQvLyBDb21tZW50IGNsYXNzXG4vL1RFU1RNRVxuXHRDb21tZW50IDogY2xhc3MgY29tbWVudCB7XG5cdFx0Y29uc3RydWN0b3IgKHByb3BzKSB7XG5cdFx0XHRPYmplY3QuYXNzaWduKHRoaXMsIHByb3BzKTtcblx0XHR9XG5cdFx0dG9TdHJpbmcoKSB7XG5cdFx0XHRyZXR1cm4gYCR7dGhpcy5jb21tZW50U3ltYm9sfSR7dGhpcy53aGl0ZXNwYWNlfSR7dGhpcy5jb21tZW50fWA7XG5cdFx0fVxuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBKU1hcblx0Ly9cblxuXHQvLyBFYXQgYSAobmVzdGVkKSBKU1ggZXhwcmVzc2lvbi5cbi8vVEVTVE1FXG5cdG1hdGNoSlNYRWxlbWVudCh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdID0gdGhpcy5tYXRjaEpTWFN0YXJ0VGFnKHRleHQsIHN0YXJ0LCBlbmQpIHx8IFtdO1xuXHRcdGlmICghanN4RWxlbWVudCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGlmICghanN4RWxlbWVudC5pc1VuYXJ5VGFnKSB7XG5cdFx0XHRsZXQgW2NoaWxkcmVuLCBjaGlsZEVuZF0gPSB0aGlzLm1hdGNoSlNYQ2hpbGRyZW4oanN4RWxlbWVudC50YWdOYW1lLCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0XHRpZiAoY2hpbGRyZW4ubGVuZ3RoKSB7XG5cdFx0XHRcdGpzeEVsZW1lbnQuY2hpbGRyZW4gPSBjaGlsZHJlbjtcblx0XHRcdFx0bmV4dFN0YXJ0ID0gY2hpbGRFbmQ7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdO1xuXHR9LFxuXG5cdC8vIE1hdGNoIEpTWCBzdGFydCB0YWcgYW5kIGludGVybmFsIGVsZW1lbnRzIChidXQgTk9UIGNoaWxkcmVuKS5cblx0Ly8gUmV0dXJucyBgW2pzeEVsZW1lbnQsIG5leHRTdGFydF1gIG9yIGB1bmRlZmluZWRgLlxuXHQvLyBVc2UgYG1hdGNoSlNYRWxlbWVudCgpYCB0byBtYXRjaCBjaGlsZHJlbiwgZW5kIHRhZywgZXRjLlxuXHQvLyBJZ25vcmVzIGxlYWRpbmcgd2hpdGVzcGFjZS5cblx0SlNYX1RBR19TVEFSVCA6IC9ePChbQS1aYS16XVtcXHctXFwuXSopKFxccypcXC8+fFxccyo+fFxccyspLyxcbi8vIFRPRE86IGNsZWFuIHRoaXMgc3R1ZmYgdXAsIG1heWJlIHdpdGggZmluZEZpcnN0QXRIZWFkP1xuXHRtYXRjaEpTWFN0YXJ0VGFnKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbmV4dFN0YXJ0ID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdC8vIE1ha2Ugc3VyZSB3ZSBzdGFydCB3aXRoIGA8YC5cblx0XHRpZiAodGV4dFtuZXh0U3RhcnRdICE9PSBcIjxcIikgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB0YWdNYXRjaCA9IHRoaXMubWF0Y2hFeHByZXNzaW9uQXRIZWFkKHRoaXMuSlNYX1RBR19TVEFSVCwgdGV4dCwgbmV4dFN0YXJ0LCBlbmQpO1xuXHRcdGlmICghdGFnTWF0Y2gpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgWyBtYXRjaFRleHQsIHRhZ05hbWUsIGVuZEJpdCBdID0gdGFnTWF0Y2g7XG5cdFx0bGV0IGpzeEVsZW1lbnQgPSBuZXcgVG9rZW5pemVyLkpTWEVsZW1lbnQodGFnTmFtZSk7XG5cdFx0bmV4dFN0YXJ0ID0gbmV4dFN0YXJ0ICsgbWF0Y2hUZXh0Lmxlbmd0aDtcblxuXHRcdC8vIElmIHVuYXJ5IHRhZywgbWFyayBhcyBzdWNoIGFuZCByZXR1cm4uXG5cdFx0ZW5kQml0ID0gZW5kQml0LnRyaW0oKTtcblx0XHRpZiAoZW5kQml0ID09PSBcIi8+XCIpIHtcblx0XHRcdGpzeEVsZW1lbnQuaXNVbmFyeVRhZyA9IHRydWU7XG5cdFx0XHRyZXR1cm4gW2pzeEVsZW1lbnQsIG5leHRTdGFydF07XG5cdFx0fVxuXG5cdFx0Ly8gSWYgd2UgZGlkbid0IGltbWVkaWF0ZWx5IGdldCBhbiBlbmQgbWFya2VyLCBhdHRlbXB0IHRvIG1hdGNoIGF0dHJpYnV0ZXNcblx0XHRpZiAoZW5kQml0ICE9PSBcIj5cIiAmJiBlbmRCaXQgIT09IFwiLz5cIikge1xuXHRcdFx0bGV0IFsgYXR0cnMsIGF0dHJFbmQgXSA9IHRoaXMuZWF0VG9rZW5zKHRoaXMubWF0Y2hKU1hBdHRyaWJ1dGUsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRcdGpzeEVsZW1lbnQuYXR0cmlidXRlcyA9IGF0dHJzO1xuXHRcdFx0bmV4dFN0YXJ0ID0gYXR0ckVuZDtcblx0XHR9XG5cblx0XHQvLyBhdCB0aGlzIHBvaW50IHdlIHNob3VsZCBnZXQgYW4gYC8+YCBvciBgPmAgKHdpdGggbm8gd2hpdGVzcGFjZSkuXG5cdFx0aWYgKHRleHRbbmV4dFN0YXJ0XSA9PT0gXCIvXCIgJiYgdGV4dFtuZXh0U3RhcnQgKyAxXSA9PT0gXCI+XCIpIHtcblx0XHRcdGVuZEJpdCA9IFwiLz5cIjtcblx0XHRcdG5leHRTdGFydCArPSAyO1xuXHRcdH1cblx0XHRlbHNlIGlmICh0ZXh0W25leHRTdGFydF0gPT09IFwiPlwiKSB7XG5cdFx0XHRlbmRCaXQgPSB0ZXh0W25leHRTdGFydF07XG5cdFx0XHRuZXh0U3RhcnQgKz0gMTtcblx0XHR9XG5cblx0XHQvLyBSZXR1cm4gaW1tZWRpYXRlbHkgZm9yIHVuYXJ5IHRhZ1xuXHRcdGlmIChlbmRCaXQgPT09IFwiLz5cIikge1xuXHRcdFx0anN4RWxlbWVudC5pc1VuYXJ5VGFnID0gdHJ1ZTtcblx0XHRcdHJldHVybiBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XTtcblx0XHR9XG5cblx0XHQvLyBhZHZhbmNlIHBhc3QgYD5gXG5cdFx0aWYgKGVuZEJpdCAhPT0gXCI+XCIpIHtcblx0XHRcdGlmIChUb2tlbml6ZXIuV0FSTikge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oXCJNaXNzaW5nIGV4cGVjdGVkIGVuZCBgPmAgZm9yIGpzeEVsZW1lbnRcIiwganN4RWxlbWVudCwgXCJgXCIrdGV4dC5zbGljZShzdGFydCwgbmV4dFN0YXJ0KStcImBcIik7XG5cdFx0XHR9XG5cdFx0XHRqc3hFbGVtZW50LmVycm9yID0gXCJObyBlbmQgPlwiO1xuXHRcdFx0cmV0dXJuIFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdO1xuXHRcdH1cblxuXHRcdHJldHVybiBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XTtcblx0fSxcblxuXG5cdC8vIEpTWCBlbGVtZW50IGNsYXNzXG5cdEpTWEVsZW1lbnQgOiBjbGFzcyBqc3hFbGVtZW50IHtcblx0XHRjb25zdHJ1Y3Rvcih0YWdOYW1lLCBhdHRyaWJ1dGVzLCBjaGlsZHJlbikge1xuXHRcdFx0dGhpcy50YWdOYW1lID0gdGFnTmFtZTtcblx0XHRcdGlmIChhdHRyaWJ1dGVzKSB0aGlzLmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuXHRcdFx0aWYgKGNoaWxkcmVuKSB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG5cdFx0fVxuXG5cdFx0Ly8gUmV0dXJuIGF0dHJpYnV0ZXMgYXMgYSBtYXAuXG4vL1RFU1RNRVxuXHRcdGdldCBhdHRycygpIHtcblx0XHRcdGxldCBhdHRycyA9IHt9O1xuXHRcdFx0aWYgKHRoaXMuYXR0cmlidXRlcykgdGhpcy5hdHRyaWJ1dGVzLmZvckVhY2goYXR0ciA9PiB7XG5cdFx0XHRcdC8vIGlnbm9yZSB1bm5hbWVkIGF0dHJpYnV0ZXNcblx0XHRcdFx0aWYgKGF0dHIubmFtZSkgYXR0cnNbYXR0ci5uYW1lXSA9IGF0dHIudmFsdWVcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGF0dHJzO1xuXHRcdH1cblxuXHRcdC8vIFJldHVybiBvdXIgYXR0cmlidXRlcyBhcyBhIHN0cmluZ1xuLy9URVNUTUVcblx0XHRnZXQgYXR0cnNBc1N0cmluZygpIHtcblx0XHRcdGlmICghdGhpcy5hdHRyaWJ1dGVzKSByZXR1cm4gXCJcIjtcblx0XHRcdHJldHVybiBcIiBcIiArIHRoaXMuYXR0cmlidXRlcy5tYXAoICh7IG5hbWUsIHZhbHVlIH0pID0+IHtcblx0XHRcdFx0aWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHJldHVybiBuYW1lO1xuXHRcdFx0XHQvLyBjb252ZXJ0IHZhbHVlIGFycmF5ICh0b2tlbnMpIHRvIHN0cmluZ1xuXHRcdFx0XHQvLyBUT0RPOiB0aGlzIHdpbGwgd2FudCB0byBiZSBzbWFydGVyLi4uXG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkgdmFsdWUgPSBgeyR7dmFsdWUuam9pbihcIiBcIil9fWA7XG5cdFx0XHRcdHJldHVybiBgbmFtZT0ke3ZhbHVlfWA7XG5cdFx0XHR9KS5qb2luKFwiIFwiKTtcblx0XHR9XG5cblx0XHQvLyBSZXR1cm4gb3VyIGNoaWxkcmVuIGFzIGEgc3RyaW5nLlxuLy9URVNUTUVcblx0XHRnZXQgY2hpbGRyZW5Bc1N0cmluZygpIHtcblx0XHRcdGlmICghdGhpcy5jaGlsZHJlbikgcmV0dXJuIFwiXCI7XG5cdFx0XHRyZXR1cm4gdGhpcy5jaGlsZHJlbi5tYXAoY2hpbGQgPT4ge1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShjaGlsZCkpIHJldHVybiBgeyR7Y2hpbGQuam9pbihcIiBcIil9fWA7XG5cdFx0XHRcdHJldHVybiBcIlwiICsgY2hpbGQ7XG5cdFx0XHR9KS5qb2luKFwiXCIpO1xuXHRcdH1cblxuXHRcdHRvU3RyaW5nKCkge1xuXHRcdFx0bGV0IGF0dHJzID0gdGhpcy5hdHRyc0FzU3RyaW5nO1xuXHRcdFx0bGV0IGNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbkFzU3RyaW5nO1xuXHRcdFx0aWYgKHRoaXMuaXNVbmFyeVRhZykgcmV0dXJuIGA8JHt0aGlzLnRhZ05hbWV9JHthdHRyc30vPmA7XG5cdFx0XHRyZXR1cm4gYDwke3RoaXMudGFnTmFtZX0ke2F0dHJzfT4ke2NoaWxkcmVufTwvJHt0aGlzLnRhZ05hbWV9PmA7XG5cdFx0fVxuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBKU1ggY2hpbGRyZW5cblx0Ly9cblxuXHQvLyBNYXRjaCBKU1ggZWxlbWVudCBjaGlsZHJlbiBvZiBgPHRhZ05hbWU+YCBhdCBgdGV4dFtzdGFydF1gLlxuXHQvLyBNYXRjaGVzIG5lc3RlZCBjaGlsZHJlbiBhbmQgc3RvcHMgYWZ0ZXIgbWF0Y2hpbmcgZW5kIHRhZzogYDwvdGFnTmFtZT5gLlxuXHQvLyBSZXR1cm5zIGBbY2hpbGRyZW4sIG5leHRTdGFydF1gLlxuLy9URVNUTUVcblx0bWF0Y2hKU1hDaGlsZHJlbih0YWdOYW1lLCB0ZXh0LCBzdGFydCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgY2hpbGRyZW4gPSBbXTtcblx0XHRsZXQgbmVzdGluZyA9IDE7XG5cdFx0bGV0IGVuZFRhZyA9IGA8LyR7dGFnTmFtZX0+YDtcblxuXHRcdGxldCBuZXh0U3RhcnQgPSBzdGFydDtcblx0XHR3aGlsZSh0cnVlKSB7XG5cdFx0XHRsZXQgcmVzdWx0ID0gdGhpcy5tYXRjaEpTWENoaWxkKGVuZFRhZywgdGV4dCwgbmV4dFN0YXJ0LCBlbmQpO1xuXHRcdFx0aWYgKCFyZXN1bHQpIGJyZWFrO1xuXG5cdFx0XHRsZXQgW2NoaWxkLCBjaGlsZEVuZF0gPSByZXN1bHQ7XG5cdFx0XHRuZXh0U3RhcnQgPSBjaGlsZEVuZDtcblx0XHRcdC8vIElmIHdlIGdvdCB0aGUgZW5kVGFnLCB1cGRhdGUgbmVzdGluZyBhbmQgYnJlYWsgb3V0IG9mIGxvb3AgaWYgbmVzdGluZyAhPT0gMFxuXHRcdFx0aWYgKGNoaWxkID09PSBlbmRUYWcpIHtcblx0XHRcdFx0bmVzdGluZyAtLTtcblx0XHRcdFx0aWYgKG5lc3RpbmcgPT09IDApIGJyZWFrO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZiAoY2hpbGQpIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xuXHRcdFx0fVxuXHRcdH1cbi8vIFRPRE86IGhvdyB0byBzdXJmYWNlIHRoaXMgZXJyb3I/Pz9cblx0XHRpZiAobmVzdGluZyAhPT0gMCkge1xuXHRcdFx0aWYgKFRva2VuaXplci5XQVJOKSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihgbWF0Y2hKU1hDaGlsZHJlbigke3RleHQuc2xpY2Uoc3RhcnQsIG5leHRTdGFydCArIDEwKX06IGRpZG4ndCBtYXRjaCBlbmQgY2hpbGQhYCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBbY2hpbGRyZW4sIG5leHRTdGFydF07XG5cdH0sXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgSlNYIGNoaWxkOlxuXHQvL1x0LSBjdXJyZW50IGVuZFRhZ1xuXHQvL1x0LSBgeyBqc3ggZXhwcmVzc2lvbiB9YFxuXHQvL1x0LSBuZXN0ZWQgSlNYIGVsZW1lbnRcblx0Ly9cdC0gKGFueXRoaW5nIGVsc2UpIGFzIGpzeFRleHQgZXhwcmVzc2lvbi5cblx0bWF0Y2hKU1hDaGlsZChlbmRUYWcsIHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hKU1hFbmRUYWcoZW5kVGFnLCB0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0fHwgdGhpcy5tYXRjaEpTWEV4cHJlc3Npb24odGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hKU1hFbGVtZW50KHRleHQsIHN0YXJ0LCBlbmQpXG4vLyBUT0RPOiBuZXdsaW5lIGFuZCBpbmRlbnQ/XG5cdFx0XHR8fCB0aGlzLm1hdGNoSlNYVGV4dCh0ZXh0LCBzdGFydCwgZW5kKTtcblx0fSxcblxuXHQvLyBBdHRlbXB0IHRvIG1hdGNoIGEgc3BlY2lmaWMgZW5kIHRhZy5cblx0Ly8gSWdub3JlcyBsZWFkaW5nIHdoaXRlc3BhY2UuXG5cdG1hdGNoSlNYRW5kVGFnKGVuZFRhZywgdGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBuZXh0U3RhcnQgPSB0aGlzLmVhdFdoaXRlc3BhY2UodGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0aWYgKCF0aGlzLm1hdGNoU3RyaW5nQXRIZWFkKGVuZFRhZywgdGV4dCwgbmV4dFN0YXJ0LCBlbmQpKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdHJldHVybiBbZW5kVGFnLCBuZXh0U3RhcnQgKyBlbmRUYWcubGVuZ3RoXTtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgSlNYIGF0dHJpYnV0ZXNcblx0Ly9cblxuXHQvLyBNYXRjaCBhIHNpbmdsZSBKU1ggZWxlbWVudCBhdHRyaWJ1dGUgYXMgYDxhdHRyPj17PHZhbHVlPn1gXG4vLyBUT0RPOiB7Li4ueHh4fVxuXHRKU1hfQVRUUklCVVRFX1NUQVJUIDogL15cXHMqKFtcXHctXStcXGIpXFxzKig9PylcXHMqLyxcblx0bWF0Y2hKU1hBdHRyaWJ1dGUodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIGF0dHJpYnV0ZXMgbXVzdCBzdGFydCB3aXRoIGEgd29yZCBjaGFyYWN0ZXJcblx0XHRpZiAoIXRoaXMuV09SRF9TVEFSVC50ZXN0KHRleHRbc3RhcnRdKSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIGF0dGVtcHQgdG8gbWF0Y2ggYW4gYXR0cmlidXRlIG5hbWUsIGluY2x1ZGluZyBgPWAgaWYgcHJlc2VudC5cblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5tYXRjaEV4cHJlc3Npb25BdEhlYWQodGhpcy5KU1hfQVRUUklCVVRFX1NUQVJULCB0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRpZiAoIXJlc3VsdCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBbIG1hdGNoLCBuYW1lLCBlcXVhbHMgXSA9IHJlc3VsdDtcblx0XHRsZXQgbmV4dFN0YXJ0ID0gc3RhcnQgKyBtYXRjaC5sZW5ndGg7XG5cdFx0bGV0IGF0dHJpYnV0ZSA9IG5ldyBUb2tlbml6ZXIuSlNYQXR0cmlidXRlKG5hbWUpO1xuXG5cdFx0Ly8gaWYgdGhlcmUgd2FzIGFuIGVxdWFscyBjaGFyLCBwYXJzZSB0aGUgdmFsdWVcblx0XHRpZiAoZXF1YWxzKSB7XG5cdFx0XHRsZXQgW3ZhbHVlLCB2YWx1ZUVuZF0gPSB0aGlzLm1hdGNoSlNYQXR0cmlidXRlVmFsdWUodGV4dCwgbmV4dFN0YXJ0LCBlbmQpIHx8IFtdO1xuXHRcdFx0aWYgKHZhbHVlKSB7XG5cdFx0XHRcdGF0dHJpYnV0ZS52YWx1ZSA9IHZhbHVlO1xuXHRcdFx0XHRuZXh0U3RhcnQgPSB2YWx1ZUVuZDtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gZWF0IHdoaXRlc3BhY2UgYmVmb3JlIHRoZSBuZXh0IGF0dHJpYnV0ZSAvIHRhZyBlbmRcblx0XHRuZXh0U3RhcnQgPSB0aGlzLmVhdFdoaXRlc3BhY2UodGV4dCwgbmV4dFN0YXJ0LCBlbmQpO1xuXHRcdHJldHVybiBbYXR0cmlidXRlLCBuZXh0U3RhcnRdO1xuXHR9LFxuXG5cdC8vIE1hdGNoIGEgdmFsdWUgZXhwcmVzc2lvbiBmb3IgYSBKU1ggZWxlbWVudCBhdHRyaWJ1dGU6XG5cdC8vIE5PVEU6IHdlIHdpbGwgYmUgY2FsbGVkIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBgPWAgKGFuZCBzdWJzZXF1ZW50IHdoaXRlc3BhY2UpLlxuXHRtYXRjaEpTWEF0dHJpYnV0ZVZhbHVlKHRleHQsIHN0YXJ0LCBlbmQpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaFRleHQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hKU1hFeHByZXNzaW9uKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoSlNYRWxlbWVudCh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0fHwgdGhpcy5tYXRjaEpTWEF0dHJpYnV0ZVZhbHVlSWRlbnRpZmllcih0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0fHwgdGhpcy5tYXRjaE51bWJlcih0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdDtcblx0fSxcblxuXHQvLyBNYXRjaCBhIHNpbmdsZSBpZGVudGlmZXIgYXMgYSBKU1ggYXR0cmlidXRlIHZhbHVlLlxuXHQvLyBSZXR1cm5zIGFzIGEgYEpTWEV4cHJlc3Npb25gLlxuXHRtYXRjaEpTWEF0dHJpYnV0ZVZhbHVlSWRlbnRpZmllcih0ZXh0LCBzdGFydCwgZW5kKSB7XG5cdFx0bGV0IHJlc3VsdCA9IHRoaXMubWF0Y2hXb3JkKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGlmICghcmVzdWx0KSByZXR1cm47XG5cblx0XHRsZXQgWyB3b3JkLCBuZXh0U3RhcnQgXSA9IHJlc3VsdDtcblx0XHRsZXQgdG9rZW4gPSBuZXcgVG9rZW5pemVyLkpTWEV4cHJlc3Npb24od29yZCk7XG5cdFx0cmV0dXJuIFt0b2tlbiwgbmV4dFN0YXJ0XTtcblx0fSxcblxuXHQvLyBKU1ggYXR0cmlidXRlIGNsYXNzXG5cdC8vIGBuYW1lYCBpcyB0aGUgbmFtZSBvZiB0aGUgYXR0cmlidXRlLlxuXHQvLyBgdmFsdWVgIGlzIG9uZSBvZjpcblx0Ly9cdFx0LSBgJy4uLidgXHRcdFx0Ly8gVGV4dCAobGl0ZXJhbCBzdHJpbmcpLlxuXHQvL1x0XHQtIGBcIi4uLlwiYFx0XHRcdC8vIFRleHQgKGxpdGVyYWwgc3RyaW5nKS5cblx0Ly9cdFx0LSBgey4uLn1gXHRcdFx0Ly8gRXhwcmVzc2lvbi4gIFJlc3VsdHMgd2lsbCBiZSB0b2tlbml6ZWQgYXJyYXkuXG5cdC8vXHRcdC0gYDwuLi4uPmBcdFx0XHQvLyBKU1ggZWxlbWVudC5cblx0Ly9cdFx0LSBgMWBcdFx0XHRcdC8vIE51bWJlci4gIE5vdGU6IHRoaXMgaXMgYW4gZXh0ZW5zaW9uIHRvIEpTWC5cblxuXHRKU1hBdHRyaWJ1dGUgOiBjbGFzcyBqc3hBdHRyaWJ1dGUge1xuXHRcdGNvbnN0cnVjdG9yKG5hbWUsIHZhbHVlKSB7XG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lO1xuXHRcdFx0aWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHRoaXMudmFsdWUgPSB2YWx1ZTtcblx0XHR9XG5cdFx0dG9TdHJpbmcoKSB7XG5cdFx0XHRpZiAodGhpcy52YWx1ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpcy5uYW1lO1xuXHRcdFx0cmV0dXJuIGAke3RoaXMubmFtZX09eyR7dGhpcy52YWx1ZX19YDtcblx0XHR9XG5cdH0sXG5cblxuXHQvLyBNYXRjaCBhIEpTWCBleHByZXNzaW9uIGVuY2xvc2VkIGluIGN1cmx5IGJyYWNlcywgZWc6ICBgeyAuLi4gfWAuXG5cdC8vICBIYW5kbGVzIG5lc3RlZCBjdXJsaWVzLCBxdW90ZXMsIGV0Yy5cblx0Ly8gUmV0dXJucyBhcnJheSBvZiB0b2tlbnMgb2YgaW50ZXJuYWwgbWF0Y2guXG5cdC8vIElnbm9yZXMgbGVhZGluZyB3aGl0ZXNwYWNlLlxuLy9UT0RPOiBuZXdsaW5lcy9pbmRlbnRzPz8/XG4vL1RPRE86IHsuLi54eHh9XG4vL1RFU1RNRVxuXHRtYXRjaEpTWEV4cHJlc3Npb24odGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBuZXh0U3RhcnQgPSB0aGlzLmVhdFdoaXRlc3BhY2UodGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0bGV0IGVuZEluZGV4ID0gdGhpcy5maW5kTWF0Y2hpbmdBdEhlYWQoXCJ7XCIsIFwifVwiLCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0aWYgKGVuZEluZGV4ID09PSB1bmRlZmluZWQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBHZXQgY29udGVudHMsIGluY2x1ZGluZyBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLlxuXHRcdGxldCBjb250ZW50cyA9IHRleHQuc2xpY2Uoc3RhcnQgKyAxLCBlbmRJbmRleCk7XG5cblx0XHQvLyByZXR1cm4gYSBuZXcgSlNYRXhwcmVzc2lvbiwgYWR2YW5jaW5nIGJleW9uZCB0aGUgZW5kaW5nIGB9YC5cblx0XHRsZXQgZXhwcmVzc2lvbiA9IG5ldyBUb2tlbml6ZXIuSlNYRXhwcmVzc2lvbihjb250ZW50cyk7XG5cdFx0cmV0dXJuIFtleHByZXNzaW9uLCBlbmRJbmRleCArIDFdO1xuXHR9LFxuXG5cdC8vIEpTWCBleHByZXNzaW9uLCBjb21wb3NlZCBvZiBpbmxpbmUgdG9rZW5zIHdoaWNoIHNob3VsZCB5aWVsZCBhbiBgZXhwcmVzc2lvbmAuXG5cdEpTWEV4cHJlc3Npb24gOiBjbGFzcyBqc3hFeHByZXNzaW9uIHtcblx0XHRjb25zdHJ1Y3Rvcihjb250ZW50cykge1xuXHRcdFx0dGhpcy5jb250ZW50cyA9IGNvbnRlbnRzIHx8IFwiXCI7XG5cdFx0fVxuXHRcdC8vIERpdmlkZSBjb250ZW50cyBpbnRvIGB0b2tlbnNgLlxuXHRcdGdldCB0b2tlbnMoKSB7XG5cdFx0XHRyZXR1cm4gVG9rZW5pemVyLnRva2VuaXplKHRoaXMuY29udGVudHMudHJpbSgpKTtcblx0XHR9XG5cdH0sXG5cblx0Ly8gTWF0Y2ggSlNYVGV4dCB1bnRpbCB0aGUgb25lIG9mIGB7YCwgYDxgLCBgPmAgb3IgYH1gLlxuXHQvLyBOT1RFOiBJTkNMVURFUyBsZWFkaW5nIC8gdHJhaWxpbmcgd2hpdGVzcGFjZS5cblx0SlNYX1RFWFRfRU5EX0NIQVJTIDogW1wie1wiLCBcIjxcIiwgXCI+XCIsIFwifVwiXSxcbi8vVEVTVE1FXG5cdG1hdGNoSlNYVGV4dCh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gdGVtcG9yYXJpbHkgYWR2YW5jZSBwYXN0IHdoaXRlc3BhY2UgKHdlJ2xsIGluY2x1ZGUgaXQgaW4gdGhlIG91dHB1dCkuXG5cdFx0bGV0IG5leHRTdGFydCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRsZXQgZW5kSW5kZXggPSB0aGlzLmZpbmRGaXJzdEF0SGVhZCh0aGlzLkpTWF9URVhUX0VORF9DSEFSUywgdGV4dCwgbmV4dFN0YXJ0LCBlbmQpO1xuXHRcdC8vIElmIHRoZSBmaXJzdCBub24td2hpdGVzcGFjZSBjaGFyIGlzIGluIG91ciBFTkRfQ0hBUlMsIGZvcmdldCBpdC5cblx0XHRpZiAoZW5kSW5kZXggPT09IG5leHRTdGFydCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIGlmIG5vIG1hdGNoLCB3ZSd2ZSBnb3Qgc29tZSBzb3J0IG9mIGVycm9yXG5cdFx0aWYgKGVuZEluZGV4ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdGlmIChUb2tlbml6ZXIuV0FSTikge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oXCJtYXRjaEpTWFRleHQoXCIrdGV4dC5zbGljZShzdGFydCwgc3RhcnQgKyA1MCkrXCIpOiBKU1ggc2VlbXMgdG8gYmUgdW5iYWxhbmNlZC5cIik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdC8vIGluY2x1ZGUgbGVhZGluZyB3aGl0ZXNwYWNlIGluIHRoZSBvdXRwdXQuXG5cdFx0bGV0IGpzeFRleHQgPSB0ZXh0LnNsaWNlKHN0YXJ0LCBlbmRJbmRleCk7XG5cdFx0cmV0dXJuIFtqc3hUZXh0LCBlbmRJbmRleF07XG5cdH0sXG5cblxuXG5cblx0Ly9cblx0Ly9cdCMjIFV0aWxpdHkgZnVuY3Rpb25zXG5cdC8vXG5cblx0Ly8gUmV0dXJuIGNoYXJhY3RlcnMgdXAgdG8sIGJ1dCBub3QgaW5jbHVkaW5nLCB0aGUgbmV4dCBuZXdsaW5lIGNoYXIgYWZ0ZXIgYHN0YXJ0YC5cblx0Ly8gSWYgYHN0YXJ0YCBpcyBhIG5ld2xpbmUgY2hhciBvciBzdGFydCA+PSBlbmQsIHJldHVybnMgZW1wdHkgc3RyaW5nLlxuXHQvLyBJZiBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcgKGVnOiBubyBtb3JlIG5ld2xpbmVzKSwgcmV0dXJucyBmcm9tIHN0YXJ0IHRvIGVuZC5cbi8vVEVTVE1FXG5cdGdldExpbmVBdEhlYWQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIFwiXCI7XG5cblx0XHRsZXQgbmV3bGluZSA9IHRleHQuaW5kZXhPZihcIlxcblwiLCBzdGFydCk7XG5cdFx0aWYgKG5ld2xpbmUgPT09IC0xIHx8IG5ld2xpbmUgPiBlbmQpIG5ld2xpbmUgPSBlbmQ7XG5cdFx0cmV0dXJuIHRleHQuc2xpY2Uoc3RhcnQsIG5ld2xpbmUpO1xuXHR9LFxuXG5cdC8vIE1hdGNoIGEgbXVsdGktY2hhciBzdHJpbmcgc3RhcnRpbmcgYXQgYHRleHRbc3RhcnRdYC5cbi8vVEVTVE1FXG5cdG1hdGNoU3RyaW5nQXRIZWFkKHN0cmluZywgdGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBzdHJpbmdFbmQgPSBzdGFydCArIHN0cmluZy5sZW5ndGg7XG5cdFx0aWYgKHN0cmluZ0VuZCA+IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gc3RyaW5nID09PSB0ZXh0LnNsaWNlKHN0YXJ0LCBzdHJpbmdFbmQpO1xuXHR9LFxuXG5cblx0Ly8gTWF0Y2ggYSByZWd1bGFyIGV4cHJlc3Npb24gc3RhcnRpbmcgYXQgYHRleHRbc3RhcnRdYCwgcmV0dXJuaW5nIHRoZSBtYXRjaC5cblx0Ly8gUmV0dXJucyBgbnVsbGAgaWYgbm8gbWF0Y2guXG5cdC8vXG5cdC8vIE5PVEU6IFRoZSBleHByZXNzaW9uIE1VU1Qgc3RhcnQgd2l0aCBgL14uLi4vYFxuLy9URVNUTUVcblx0bWF0Y2hFeHByZXNzaW9uQXRIZWFkKGV4cHJlc3Npb24sIHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgaGVhZCA9IHRleHQuc2xpY2Uoc3RhcnQsIGVuZCk7XG5cdFx0cmV0dXJuIGhlYWQubWF0Y2goZXhwcmVzc2lvbik7XG5cdH0sXG5cblx0Ly8gRmluZCBpbmRleCBvZiB0aGUgbWF0Y2hpbmcgU0lOR0xFIENIQVJBQ1RFUiBgZW5kRGVsaW1pdGVyYCB0byBtYXRjaCBgc3RhcnREZWxpbWl0ZXJgLlxuXHQvLyBNYXRjaGVzIG5lc3RlZCBkZWxpbWl0ZXJzIGFuZCBoYW5kbGVzIGVzY2FwZWQgZGVsaW1pdGVycy5cblx0Ly8gQXNzdW1lcyBgdGV4dFtzdGFydF1gIGlzIHRoZSBzdGFydERlbGltaXRlciFcblx0Ly8gUmV0dXJucyBudW1lcmljIGluZGV4IG9yIGB1bmRlZmluZWRgIGlmIG5vIG1hdGNoIG9yIGlmIGZpcnN0IGNoYXIgaXMgbm90IGBzdGFydERlbGltaXRlcmAuXG5cdC8vXG5cdC8vXHRBbHNvIGhhbmRsZXMgbmVzdGVkIHF1b3RlcyAtLSBpZiB3ZSBlbmNvdW50ZXIgYSBzaW5nbGUgb3IgZG91YmxlIHF1b3RlLFxuXHQvL1x0XHR3ZSdsbCBza2lwIHNjYW5uaW5nIHVudGlsIHdlIGZpbmQgYSBtYXRjaGluZyBxdW90ZS5cblx0Ly9cblx0Ly9cdGVnOiAgYGZpbmRNYXRjaGluZ0F0SGVhZChcIntcIiwgXCJ9XCIsIFwie2Fhe2F9YWF9XCIpYCA9PiA4XG4vL1RFU1RNRVxuXHRmaW5kTWF0Y2hpbmdBdEhlYWQoc3RhcnREZWxpbWl0ZXIsIGVuZERlbGltaXRlciwgdGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGlmICh0ZXh0W3N0YXJ0XSAhPT0gc3RhcnREZWxpbWl0ZXIpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbmVzdGluZyA9IDA7XG5cdFx0bGV0IGN1cnJlbnQgPSBzdGFydDtcblx0XHR3aGlsZSAoY3VycmVudCA8IGVuZCkge1xuXHRcdFx0bGV0IGNoYXIgPSB0ZXh0W2N1cnJlbnRdO1xuXHRcdFx0Ly8gaWYgc3RhcnREZWxpbWl0ZXIsIGluY3JlYXNlIG5lc3Rpbmdcblx0XHRcdGlmIChjaGFyID09PSBzdGFydERlbGltaXRlcikge1xuXHRcdFx0XHRuZXN0aW5nKys7XG5cdFx0XHR9XG5cdFx0XHQvLyBpZiBlbmREZWxpbWl0ZXIsIGRlY3JlYXNlIG5lc3RpbmcgYW5kIHJldHVybiBpZiBuZXN0aW5nIGJhY2sgdG8gMFxuXHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gZW5kRGVsaW1pdGVyKSB7XG5cdFx0XHRcdG5lc3RpbmctLTtcblx0XHRcdFx0aWYgKG5lc3RpbmcgPT09IDApIHJldHVybiBjdXJyZW50O1xuXHRcdFx0fVxuXHRcdFx0Ly8gaWYgYSBzaW5nbGUgb3IgZG91YmxlIHF1b3RlLCBza2lwIHVudGlsIHRoZSBtYXRjaGluZyBxdW90ZVxuXHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gXCInXCIgfHwgY2hhciA9PT0gJ1wiJykge1xuXHRcdFx0XHRsZXQgW3Rva2VuLCBhZnRlclF1b3RlXSA9IHRoaXMubWF0Y2hUZXh0KHRleHQsIGN1cnJlbnQsIGVuZCkgfHwgW107XG5cdFx0XHRcdGN1cnJlbnQgPSBhZnRlclF1b3RlO1xuXHRcdFx0XHRjb250aW51ZTtcdC8vIGNvbnRpbnVlIHNvIHdlIGRvbid0IGFkZCAxIHRvIGN1cmVudCBiZWxvd1xuXHRcdFx0fVxuXHRcdFx0Ly8gSWYgYmFja3NsYXNoLCBza2lwIGFuIGV4dHJhIGNoYXIgaWYgaXQncyBlaXRoZXIgZGVsaW1pdGVyIG9yIGEgcXVvdGVcblx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFwiXFxcXFwiKSB7XG5cdFx0XHRcdGNoYXIgPSB0ZXh0W2N1cnJlbnQgKyAxXTtcblx0XHRcdFx0aWYgKGNoYXIgPT09IHN0YXJ0RGVsaW1pdGVyXG5cdFx0XHRcdCB8fCBjaGFyID09PSBlbmREZWxpbWl0ZXJcblx0XHRcdFx0IHx8IGNoYXIgPT09IFwiJ1wiXG5cdFx0XHRcdCB8fCBjaGFyID09PSAnXCInXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdGN1cnJlbnQrKzs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGN1cnJlbnQrKztcblx0XHR9XG5cdH0sXG5cblxuXHQvLyBSZXR1cm4gdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBOT04tRVNDQVBFRCBjaGFyYWN0ZXIgaW4gYGNoYXJzYCBhZnRlciBgdGV4dFtzdGFydF1gLlxuXHQvLyBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIHdlIGRpZG4ndCBmaW5kIGEgbWF0Y2guXG4vL1RFU1RNRVxuXHRmaW5kRmlyc3RBdEhlYWQoY2hhcnMsIHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHR3aGlsZSAoc3RhcnQgPCBlbmQpIHtcblx0XHRcdGxldCBjaGFyID0gdGV4dFtzdGFydF07XG5cdFx0XHRpZiAoY2hhcnMuaW5jbHVkZXMoY2hhcikpIHJldHVybiBzdGFydDtcblx0XHRcdC8vIGlmIHdlIGdvdCBhbiBlc2NhcGUgY2hhciwgaWdub3JlIHRoZSBuZXh0IGNoYXIgaWYgaXQncyBpbiBgY2hhcnNgXG5cdFx0XHRpZiAoY2hhciA9PT0gXCJcXFxcXCIgJiYgY2hhcnMuaW5jbHVkZXModGV4dFtzdGFydCsxXSkpIHN0YXJ0Kys7XG5cdFx0XHRzdGFydCsrO1xuXHRcdH1cblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdHJldHVybiBzdGFydDtcblx0fSxcblxuXG4vL1xuLy8gIyMjIFV0aWxpdHlcbi8vXG5cblx0Ly8gR2l2ZW4gYSBzZXQgb2YgdG9rZW5zLCBzbGljZSB3aGl0ZXNwYWNlIChpbmRlbnQsIE5FV0xJTkUgb3Igbm9ybWFsIHdoaXRlc3BhY2UpIGZyb20gdGhlIGZyb250LlxuXHRyZW1vdmVMZWFkaW5nV2hpdGVzcGFjZSh0b2tlbnMsIHN0YXJ0ID0gMCkge1xuXHRcdHdoaWxlICh0b2tlbnNbc3RhcnRdIGluc3RhbmNlb2YgVG9rZW5pemVyLldoaXRlc3BhY2UpIHN0YXJ0Kys7XG5cdFx0aWYgKHN0YXJ0ID09PSAwKSByZXR1cm4gdG9rZW5zO1xuXHRcdHJldHVybiB0b2tlbnMuc2xpY2Uoc3RhcnQpO1xuXHR9LFxuXG5cdC8vIEdpdmVuIGEgc2V0IG9mIHRva2VucywgcmVtb3ZlIEFMTCBcIm5vcm1hbFwiIHdoaXRlc3BhY2UgdG9rZW5zIChOT1QgaW5kZW50IG9yIE5FV0xJTkUpLlxuXHRyZW1vdmVOb3JtYWxXaGl0ZXNwYWNlKHRva2Vucykge1xuXHRcdHJldHVybiB0b2tlbnMuZmlsdGVyKHRva2VuID0+ICFUb2tlbml6ZXIuaXNOb3JtYWxXaGl0ZXNwYWNlKHRva2VuKSk7XG5cdH0sXG5cblxuXHQvLyBSZXR1cm4gYHRydWVgIGlmIGB0b2tlbmAgaXMgXCJub3JtYWxcIiB3aGl0ZXNwY2UgKG5vdCBhIG5ld2xpbmUgb3IgaW5kZW50KVxuXHRpc05vcm1hbFdoaXRlc3BhY2UodG9rZW4pIHtcblx0XHRyZXR1cm4gdG9rZW4gaW5zdGFuY2VvZiBUb2tlbml6ZXIuV2hpdGVzcGFjZVxuXHRcdFx0JiYgISh0b2tlbiBpbnN0YW5jZW9mIFRva2VuaXplci5JbmRlbnQpXG5cdFx0XHQmJiAodG9rZW4gIT09IFRva2VuaXplci5ORVdMSU5FKTtcblx0fSxcblxuXG4vL1xuLy8gIyMjIEJsb2NrIC8gaW5kZW50IHByb2Nlc3Npbmdcbi8vXG5cblx0Ly8gU2ltcGxlIGJsb2NrIGNsYXNzIGZvciBgYnJlYWtJbnRvQmxvY2tzYC5cblx0QmxvY2s6IGNsYXNzIGJsb2NrIHtcblx0XHRjb25zdHJ1Y3Rvcihwcm9wcyl7XG5cdFx0XHRPYmplY3QuYXNzaWduKHRoaXMsIHByb3BzKTtcblx0XHRcdGlmICghdGhpcy5jb250ZW50cykgdGhpcy5jb250ZW50cyA9IFtdO1xuXHRcdH1cblxuXHRcdHRvU3RyaW5nKCkge1xuXHRcdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMsIG51bGwsIFwiXFx0XCIpO1xuXHRcdH1cblx0fSxcblxuXHQvLyBCcmVhayB0b2tlbnMgaW50byBhbiBhcnJheSBvZiBhcnJheXMgYnkgYE5FV0xJTkVgcy5cblx0Ly8gUmV0dXJucyBhbiBhcnJheSBvZiBsaW5lcyBXSVRIT1VUIHRoZSBgTkVXTElORWBzLlxuXHQvLyBMaW5lcyB3aGljaCBhcmUgY29tcG9zZWQgc29sZWx5IG9mIHdoaXRlc3BhY2UgYXJlIHRyZWF0ZWQgYXMgYmxhbmsuXG5cdGJyZWFrSW50b0xpbmVzKHRva2Vucykge1xuXHRcdC8vIENvbnZlcnQgdG8gbGluZXMuXG5cdFx0bGV0IGN1cnJlbnRMaW5lID0gW107XG5cdFx0bGV0IGxpbmVzID0gW2N1cnJlbnRMaW5lXTtcblx0XHR0b2tlbnMuZm9yRWFjaCh0b2tlbiA9PiB7XG5cdFx0XHQvLyBhZGQgbmV3IGFycmF5IGZvciBlYWNoIG5ld2xpbmVcblx0XHRcdGlmICh0b2tlbiA9PT0gVG9rZW5pemVyLk5FV0xJTkUpIHtcblx0XHRcdFx0Ly8gY3JlYXRlIGEgbmV3IGxpbmUgYW5kIHB1c2ggaXQgaW5cblx0XHRcdFx0Y3VycmVudExpbmUgPSBbXTtcblx0XHRcdFx0cmV0dXJuIGxpbmVzLnB1c2goY3VycmVudExpbmUpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBvdGhlcndpc2UganVzdCBhZGQgdG8gdGhlIGN1cnJlbnQgbGluZVxuXHRcdFx0Y3VycmVudExpbmUucHVzaCh0b2tlbik7XG5cdFx0fSk7XG5cblx0XHQvLyBDbGVhciBhbnkgbGluZXMgdGhhdCBhcmUgb25seSB3aGl0ZXNwYWNlXG5cdFx0bGluZXMuZm9yRWFjaCgobGluZSwgaW5kZXgpID0+IHtcblx0XHRcdGlmIChsaW5lLmxlbmd0aCA9PT0gMSAmJiBsaW5lWzBdIGluc3RhbmNlb2YgVG9rZW5pemVyLldoaXRlc3BhY2UpIGxpbmVzW2luZGV4XSA9IFtdO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGxpbmVzO1xuXHR9LFxuXG5cdC8vIFJldHVybiBpbmRlbnRzIG9mIHRoZSBzcGVjaWZpZWQgbGluZXMuXG5cdC8vIEluZGVudHMgZW1wdHkgbGluZXMgKE5FV0xJTkVzKSBpbnRvIHRoZSBibG9jayBBRlRFUiB0aGV5IGFwcGVhci5cblx0Z2V0TGluZUluZGVudHMobGluZXMsIGRlZmF1bHRJbmRlbnQgPSAwKSB7XG5cdFx0aWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdO1xuXG5cdFx0Y29uc3QgaW5kZW50cyA9IGxpbmVzLm1hcChUb2tlbml6ZXIuZ2V0TGluZUluZGVudCk7XG5cdFx0Y29uc3QgZW5kID0gaW5kZW50cy5sZW5ndGg7XG5cblx0XHQvLyBmaWd1cmUgb3V0IHRoZSBpbmRlbnQgb2YgdGhlIGZpcnN0IG5vbi1lbXB0eSBsaW5lXG5cdFx0bGV0IHN0YXJ0SW5kZW50ID0gZ2V0TmV4dEluZGVudCgwKTtcblx0XHRpZiAoc3RhcnRJbmRlbnQgPT09IHVuZGVmaW5lZCkgc3RhcnRJbmRlbnQgPSBkZWZhdWx0SW5kZW50O1xuXG5cdFx0Ly8gaW5kZW50IGJsYW5rIGxpbmVzIHRvIHRoZSBpbmRlbnQgQUZURVIgdGhlbVxuXHRcdGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBlbmQ7IGluZGV4KyspIHtcblx0XHRcdGlmIChpbmRlbnRzW2luZGV4XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGluZGVudHNbaW5kZXhdID0gZ2V0TmV4dEluZGVudChpbmRleCArIDEpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gaW5kZW50cztcblxuXHRcdC8vIFJldHVybiB0aGUgdmFsdWUgb2YgdGhlIE5FWFQgbm9uLXVuZGVmaW5lZCBpbmRlbnQuXG5cdFx0ZnVuY3Rpb24gZ2V0TmV4dEluZGVudChpbmRleCkge1xuXHRcdFx0d2hpbGUgKGluZGV4IDwgZW5kKSB7XG5cdFx0XHRcdGlmIChpbmRlbnRzW2luZGV4XSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gaW5kZW50c1tpbmRleF07XG5cdFx0XHRcdGluZGV4Kys7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gc3RhcnRJbmRlbnQ7XG5cdFx0fVxuXHR9LFxuXG5cblx0Ly8gUmV0dXJuIHRoZSBpbmRlbnQgb2YgYSBsaW5lIG9mIHRva2Vucy5cblx0Ly8gUmV0dXJucyBgMGAgaWYgbm90IGluZGVudGVkLlxuXHQvLyBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIGEgYmxhbmsgbGluZS5cblx0Z2V0TGluZUluZGVudChsaW5lKSB7XG5cdFx0aWYgKCFsaW5lIHx8IGxpbmUubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdGlmIChsaW5lWzBdIGluc3RhbmNlb2YgVG9rZW5pemVyLkluZGVudCkgcmV0dXJuIGxpbmVbMF0ubGVuZ3RoO1xuXHRcdHJldHVybiAwO1xuXHR9LFxuXG5cdC8vIEJyZWFrIGB0b2tlbnNgIGJldHdlZW4gYHN0YXJ0YCBhbmQgYGVuZGAgaW50byBhIGBUb2tlbml6ZXIuQmxvY2tgIHdpdGggbmVzdGVkIGBjb250ZW50c2AuXG5cdC8vIFNraXBzIFwibm9ybWFsXCIgd2hpdGVzcGFjZSBhbmQgaW5kZW50cyBpbiB0aGUgcmVzdWx0cy5cblx0YnJlYWtJbnRvQmxvY2tzOiBmdW5jdGlvbih0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kID0gdG9rZW5zLmxlbmd0aCkge1xuXHRcdC8vIHJlc3RyaWN0IHRvIHRva2VucyBvZiBpbnRlcmVzdFxuXHRcdHRva2VucyA9IHRva2Vucy5zbGljZShzdGFydCwgZW5kKTtcblx0XHQvLyByZW1vdmUgXCJub3JtYWxcIiB3aGl0ZXNwYWNlXG4vL1RPRE86IGJldHRlciB0byBsZWF2ZSB0aGlzIHRvIGNvbnN1bWVycz8/P1xuXHRcdHRva2VucyA9IFRva2VuaXplci5yZW1vdmVOb3JtYWxXaGl0ZXNwYWNlKHRva2Vucyk7XG5cblx0XHQvLyBicmVhayBpbnRvIGxpbmVzICYgcmV0dXJuIGVhcmx5IGlmIG5vIGxpbmVzXG5cdFx0bGV0IGxpbmVzID0gVG9rZW5pemVyLmJyZWFrSW50b0xpbmVzKHRva2Vucyk7XG5cdFx0aWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdO1xuXG5cdFx0Ly8gZmlndXJlIG91dCBpbmRlbnRzXG5cdFx0bGV0IGluZGVudHMgPSBUb2tlbml6ZXIuZ2V0TGluZUluZGVudHMobGluZXMpO1xuXG5cdFx0Ly8gRmlyc3QgYmxvY2sgaXMgYXQgdGhlIE1JTklNVU0gaW5kZW50IG9mIGFsbCBsaW5lcyFcblx0XHRsZXQgbWF4SW5kZW50ID0gTWF0aC5taW4uYXBwbHkoTWF0aCwgaW5kZW50cyk7XG5cdFx0bGV0IGJsb2NrID0gbmV3IFRva2VuaXplci5CbG9jayh7IGluZGVudDogbWF4SW5kZW50IH0pO1xuXG5cdFx0Ly8gc3RhY2sgb2YgYmxvY2tzXG5cdFx0bGV0IHN0YWNrID0gW2Jsb2NrXTtcblxuXHRcdGxpbmVzLmZvckVhY2goIChsaW5lLCBpbmRleCkgPT4ge1xuXHRcdFx0Ly8gUmVtb3ZlIGxlYWRpbmcgd2hpdGVzcGFjZSAoZWc6IGluZGVudHMpXG5cdFx0XHRsaW5lID0gVG9rZW5pemVyLnJlbW92ZUxlYWRpbmdXaGl0ZXNwYWNlKGxpbmUpO1xuXG5cdFx0XHRsZXQgbGluZUluZGVudCA9IGluZGVudHNbaW5kZXhdO1xuXHRcdFx0bGV0IHRvcCA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdFx0Ly8gSWYgaW5kZW50aW5nLCBwdXNoIG5ldyBibG9jayhzKVxuXHRcdFx0aWYgKGxpbmVJbmRlbnQgPiB0b3AuaW5kZW50KSB7XG5cdFx0XHRcdHdoaWxlIChsaW5lSW5kZW50ID4gdG9wLmluZGVudCkge1xuXHRcdFx0XHRcdHZhciBuZXdCbG9jayA9IG5ldyBUb2tlbml6ZXIuQmxvY2soeyBpbmRlbnQ6IHRvcC5pbmRlbnQgKyAxIH0pO1xuXHRcdFx0XHRcdHRvcC5jb250ZW50cy5wdXNoKG5ld0Jsb2NrKTtcblx0XHRcdFx0XHRzdGFjay5wdXNoKG5ld0Jsb2NrKTtcblxuXHRcdFx0XHRcdHRvcCA9IG5ld0Jsb2NrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvLyBJZiBvdXRkZW50aW5nOiBwb3AgYmxvY2socylcblx0XHRcdGVsc2UgaWYgKGxpbmVJbmRlbnQgPCB0b3AuaW5kZW50KSB7XG5cdFx0XHRcdHdoaWxlIChsaW5lSW5kZW50IDwgdG9wLmluZGVudCkge1xuXHRcdFx0XHRcdHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRcdHRvcCA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvLyBhZGQgdG8gdG9wIGJsb2NrXG5cdFx0XHR0b3AuY29udGVudHMucHVzaChsaW5lKTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBibG9jaztcblx0fSxcblxuXG5cblxufTtcblxuZXhwb3J0IGRlZmF1bHQgVG9rZW5pemVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1Rva2VuaXplci5qcyIsInZhciBjb3JlID0gbW9kdWxlLmV4cG9ydHMgPSB7IHZlcnNpb246ICcyLjUuNycgfTtcbmlmICh0eXBlb2YgX19lID09ICdudW1iZXInKSBfX2UgPSBjb3JlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19jb3JlLmpzXG4vLyBtb2R1bGUgaWQgPSA5MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdHlwZW9mIGl0ID09PSAnb2JqZWN0JyA/IGl0ICE9PSBudWxsIDogdHlwZW9mIGl0ID09PSAnZnVuY3Rpb24nO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2lzLW9iamVjdC5qc1xuLy8gbW9kdWxlIGlkID0gOTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gdG8gaW5kZXhlZCBvYmplY3QsIHRvT2JqZWN0IHdpdGggZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBzdHJpbmdzXG52YXIgSU9iamVjdCA9IHJlcXVpcmUoJy4vX2lvYmplY3QnKTtcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIElPYmplY3QoZGVmaW5lZChpdCkpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3RvLWlvYmplY3QuanNcbi8vIG1vZHVsZSBpZCA9IDkzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBpZCA9IDA7XG52YXIgcHggPSBNYXRoLnJhbmRvbSgpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiAnU3ltYm9sKCcuY29uY2F0KGtleSA9PT0gdW5kZWZpbmVkID8gJycgOiBrZXksICcpXycsICgrK2lkICsgcHgpLnRvU3RyaW5nKDM2KSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fdWlkLmpzXG4vLyBtb2R1bGUgaWQgPSA5NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcbi8qKlxuICogV2hlbiBzb3VyY2UgbWFwcyBhcmUgZW5hYmxlZCwgYHN0eWxlLWxvYWRlcmAgdXNlcyBhIGxpbmsgZWxlbWVudCB3aXRoIGEgZGF0YS11cmkgdG9cbiAqIGVtYmVkIHRoZSBjc3Mgb24gdGhlIHBhZ2UuIFRoaXMgYnJlYWtzIGFsbCByZWxhdGl2ZSB1cmxzIGJlY2F1c2Ugbm93IHRoZXkgYXJlIHJlbGF0aXZlIHRvIGFcbiAqIGJ1bmRsZSBpbnN0ZWFkIG9mIHRoZSBjdXJyZW50IHBhZ2UuXG4gKlxuICogT25lIHNvbHV0aW9uIGlzIHRvIG9ubHkgdXNlIGZ1bGwgdXJscywgYnV0IHRoYXQgbWF5IGJlIGltcG9zc2libGUuXG4gKlxuICogSW5zdGVhZCwgdGhpcyBmdW5jdGlvbiBcImZpeGVzXCIgdGhlIHJlbGF0aXZlIHVybHMgdG8gYmUgYWJzb2x1dGUgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHBhZ2UgbG9jYXRpb24uXG4gKlxuICogQSBydWRpbWVudGFyeSB0ZXN0IHN1aXRlIGlzIGxvY2F0ZWQgYXQgYHRlc3QvZml4VXJscy5qc2AgYW5kIGNhbiBiZSBydW4gdmlhIHRoZSBgbnBtIHRlc3RgIGNvbW1hbmQuXG4gKlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzcykge1xuICAvLyBnZXQgY3VycmVudCBsb2NhdGlvblxuICB2YXIgbG9jYXRpb24gPSB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvdy5sb2NhdGlvbjtcblxuICBpZiAoIWxvY2F0aW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiZml4VXJscyByZXF1aXJlcyB3aW5kb3cubG9jYXRpb25cIik7XG4gIH1cblxuXHQvLyBibGFuayBvciBudWxsP1xuXHRpZiAoIWNzcyB8fCB0eXBlb2YgY3NzICE9PSBcInN0cmluZ1wiKSB7XG5cdCAgcmV0dXJuIGNzcztcbiAgfVxuXG4gIHZhciBiYXNlVXJsID0gbG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vXCIgKyBsb2NhdGlvbi5ob3N0O1xuICB2YXIgY3VycmVudERpciA9IGJhc2VVcmwgKyBsb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC9bXlxcL10qJC8sIFwiL1wiKTtcblxuXHQvLyBjb252ZXJ0IGVhY2ggdXJsKC4uLilcblx0Lypcblx0VGhpcyByZWd1bGFyIGV4cHJlc3Npb24gaXMganVzdCBhIHdheSB0byByZWN1cnNpdmVseSBtYXRjaCBicmFja2V0cyB3aXRoaW5cblx0YSBzdHJpbmcuXG5cblx0IC91cmxcXHMqXFwoICA9IE1hdGNoIG9uIHRoZSB3b3JkIFwidXJsXCIgd2l0aCBhbnkgd2hpdGVzcGFjZSBhZnRlciBpdCBhbmQgdGhlbiBhIHBhcmVuc1xuXHQgICAoICA9IFN0YXJ0IGEgY2FwdHVyaW5nIGdyb3VwXG5cdCAgICAgKD86ICA9IFN0YXJ0IGEgbm9uLWNhcHR1cmluZyBncm91cFxuXHQgICAgICAgICBbXikoXSAgPSBNYXRjaCBhbnl0aGluZyB0aGF0IGlzbid0IGEgcGFyZW50aGVzZXNcblx0ICAgICAgICAgfCAgPSBPUlxuXHQgICAgICAgICBcXCggID0gTWF0Y2ggYSBzdGFydCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgKD86ICA9IFN0YXJ0IGFub3RoZXIgbm9uLWNhcHR1cmluZyBncm91cHNcblx0ICAgICAgICAgICAgICAgICBbXikoXSsgID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgfCAgPSBPUlxuXHQgICAgICAgICAgICAgICAgIFxcKCAgPSBNYXRjaCBhIHN0YXJ0IHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgICAgIFteKShdKiAgPSBNYXRjaCBhbnl0aGluZyB0aGF0IGlzbid0IGEgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICBcXCkgID0gTWF0Y2ggYSBlbmQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICkgID0gRW5kIEdyb3VwXG4gICAgICAgICAgICAgICpcXCkgPSBNYXRjaCBhbnl0aGluZyBhbmQgdGhlbiBhIGNsb3NlIHBhcmVuc1xuICAgICAgICAgICkgID0gQ2xvc2Ugbm9uLWNhcHR1cmluZyBncm91cFxuICAgICAgICAgICogID0gTWF0Y2ggYW55dGhpbmdcbiAgICAgICApICA9IENsb3NlIGNhcHR1cmluZyBncm91cFxuXHQgXFwpICA9IE1hdGNoIGEgY2xvc2UgcGFyZW5zXG5cblx0IC9naSAgPSBHZXQgYWxsIG1hdGNoZXMsIG5vdCB0aGUgZmlyc3QuICBCZSBjYXNlIGluc2Vuc2l0aXZlLlxuXHQgKi9cblx0dmFyIGZpeGVkQ3NzID0gY3NzLnJlcGxhY2UoL3VybFxccypcXCgoKD86W14pKF18XFwoKD86W14pKF0rfFxcKFteKShdKlxcKSkqXFwpKSopXFwpL2dpLCBmdW5jdGlvbihmdWxsTWF0Y2gsIG9yaWdVcmwpIHtcblx0XHQvLyBzdHJpcCBxdW90ZXMgKGlmIHRoZXkgZXhpc3QpXG5cdFx0dmFyIHVucXVvdGVkT3JpZ1VybCA9IG9yaWdVcmxcblx0XHRcdC50cmltKClcblx0XHRcdC5yZXBsYWNlKC9eXCIoLiopXCIkLywgZnVuY3Rpb24obywgJDEpeyByZXR1cm4gJDE7IH0pXG5cdFx0XHQucmVwbGFjZSgvXicoLiopJyQvLCBmdW5jdGlvbihvLCAkMSl7IHJldHVybiAkMTsgfSk7XG5cblx0XHQvLyBhbHJlYWR5IGEgZnVsbCB1cmw/IG5vIGNoYW5nZVxuXHRcdGlmICgvXigjfGRhdGE6fGh0dHA6XFwvXFwvfGh0dHBzOlxcL1xcL3xmaWxlOlxcL1xcL1xcLykvaS50ZXN0KHVucXVvdGVkT3JpZ1VybCkpIHtcblx0XHQgIHJldHVybiBmdWxsTWF0Y2g7XG5cdFx0fVxuXG5cdFx0Ly8gY29udmVydCB0aGUgdXJsIHRvIGEgZnVsbCB1cmxcblx0XHR2YXIgbmV3VXJsO1xuXG5cdFx0aWYgKHVucXVvdGVkT3JpZ1VybC5pbmRleE9mKFwiLy9cIikgPT09IDApIHtcblx0XHQgIFx0Ly9UT0RPOiBzaG91bGQgd2UgYWRkIHByb3RvY29sP1xuXHRcdFx0bmV3VXJsID0gdW5xdW90ZWRPcmlnVXJsO1xuXHRcdH0gZWxzZSBpZiAodW5xdW90ZWRPcmlnVXJsLmluZGV4T2YoXCIvXCIpID09PSAwKSB7XG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSByZWxhdGl2ZSB0byB0aGUgYmFzZSB1cmxcblx0XHRcdG5ld1VybCA9IGJhc2VVcmwgKyB1bnF1b3RlZE9yaWdVcmw7IC8vIGFscmVhZHkgc3RhcnRzIHdpdGggJy8nXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlIHJlbGF0aXZlIHRvIGN1cnJlbnQgZGlyZWN0b3J5XG5cdFx0XHRuZXdVcmwgPSBjdXJyZW50RGlyICsgdW5xdW90ZWRPcmlnVXJsLnJlcGxhY2UoL15cXC5cXC8vLCBcIlwiKTsgLy8gU3RyaXAgbGVhZGluZyAnLi8nXG5cdFx0fVxuXG5cdFx0Ly8gc2VuZCBiYWNrIHRoZSBmaXhlZCB1cmwoLi4uKVxuXHRcdHJldHVybiBcInVybChcIiArIEpTT04uc3RyaW5naWZ5KG5ld1VybCkgKyBcIilcIjtcblx0fSk7XG5cblx0Ly8gc2VuZCBiYWNrIHRoZSBmaXhlZCBjc3Ncblx0cmV0dXJuIGZpeGVkQ3NzO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9zdHlsZS1sb2FkZXIvZml4VXJscy5qc1xuLy8gbW9kdWxlIGlkID0gOTQzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHN0eWxlLWxvYWRlcjogQWRkcyBzb21lIGNzcyB0byB0aGUgRE9NIGJ5IGFkZGluZyBhIDxzdHlsZT4gdGFnXG5cbi8vIGxvYWQgdGhlIHN0eWxlc1xudmFyIGNvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9TcGFjZXIubGVzc1wiKTtcbmlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuLy8gUHJlcGFyZSBjc3NUcmFuc2Zvcm1hdGlvblxudmFyIHRyYW5zZm9ybTtcblxudmFyIG9wdGlvbnMgPSB7fVxub3B0aW9ucy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm1cbi8vIGFkZCB0aGUgc3R5bGVzIHRvIHRoZSBET01cbnZhciB1cGRhdGUgPSByZXF1aXJlKFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvYWRkU3R5bGVzLmpzXCIpKGNvbnRlbnQsIG9wdGlvbnMpO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG5cdC8vIFdoZW4gdGhlIHN0eWxlcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdGlmKCFjb250ZW50LmxvY2Fscykge1xuXHRcdG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9TcGFjZXIubGVzc1wiLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBuZXdDb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vU3BhY2VyLmxlc3NcIik7XG5cdFx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblx0XHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0XHR9KTtcblx0fVxuXHQvLyBXaGVuIHRoZSBtb2R1bGUgaXMgZGlzcG9zZWQsIHJlbW92ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2FwcC9TcGFjZXIubGVzc1xuLy8gbW9kdWxlIGlkID0gOTQ0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHN0eWxlLWxvYWRlcjogQWRkcyBzb21lIGNzcyB0byB0aGUgRE9NIGJ5IGFkZGluZyBhIDxzdHlsZT4gdGFnXG5cbi8vIGxvYWQgdGhlIHN0eWxlc1xudmFyIGNvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZXMubGVzc1wiKTtcbmlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuLy8gUHJlcGFyZSBjc3NUcmFuc2Zvcm1hdGlvblxudmFyIHRyYW5zZm9ybTtcblxudmFyIG9wdGlvbnMgPSB7fVxub3B0aW9ucy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm1cbi8vIGFkZCB0aGUgc3R5bGVzIHRvIHRoZSBET01cbnZhciB1cGRhdGUgPSByZXF1aXJlKFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvYWRkU3R5bGVzLmpzXCIpKGNvbnRlbnQsIG9wdGlvbnMpO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG5cdC8vIFdoZW4gdGhlIHN0eWxlcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdGlmKCFjb250ZW50LmxvY2Fscykge1xuXHRcdG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZXMubGVzc1wiLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBuZXdDb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGVzLmxlc3NcIik7XG5cdFx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblx0XHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0XHR9KTtcblx0fVxuXHQvLyBXaGVuIHRoZSBtb2R1bGUgaXMgZGlzcG9zZWQsIHJlbW92ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2FwcC9zdHlsZXMubGVzc1xuLy8gbW9kdWxlIGlkID0gOTQ1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vXG4vLyAgIyBDbGFzcyB1dGlsaXRpZXNcbi8vXG5cbi8vIENsb25lIGEgY2xhc3MsIHJlLXVzaW5nIHRoZSBvcmlnaW5hbCBuYW1lLlxuLy8gVE9ETzogbW92ZSB0byB1dGlsaXR5P1xuZXhwb3J0IGZ1bmN0aW9uIGNsb25lQ2xhc3MoY29uc3RydWN0b3IsIG5hbWUgPSBjb25zdHJ1Y3Rvci5uYW1lKSB7XG4gIC8vIENsb25lIHRoZSBjb25zdHJ1Y3Rvciwga2VlcGluZyB0aGUgc2FtZSBuYW1lXG4gIGdsb2JhbC5fX2Nsb25lQ2xhc3NfXyA9IGNvbnN0cnVjdG9yO1xuICBjb25zdCBjbG9uZSA9IG5ldyBGdW5jdGlvbihcIm5hbWVcIiwgYHJldHVybiBjbGFzcyAke25hbWV9IGV4dGVuZHMgX19jbG9uZUNsYXNzX18ge31gKSgpO1xuICBkZWxldGUgZ2xvYmFsLl9fY2xvbmVDbGFzc19fO1xuICByZXR1cm4gY2xvbmU7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdXRpbHMvY2xhc3MuanMiLCJ2YXIgc3RvcmUgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgnd2tzJyk7XG52YXIgdWlkID0gcmVxdWlyZSgnLi9fdWlkJyk7XG52YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuU3ltYm9sO1xudmFyIFVTRV9TWU1CT0wgPSB0eXBlb2YgU3ltYm9sID09ICdmdW5jdGlvbic7XG5cbnZhciAkZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9XG4gICAgVVNFX1NZTUJPTCAmJiBTeW1ib2xbbmFtZV0gfHwgKFVTRV9TWU1CT0wgPyBTeW1ib2wgOiB1aWQpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07XG5cbiRleHBvcnRzLnN0b3JlID0gc3RvcmU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL193a3MuanNcbi8vIG1vZHVsZSBpZCA9IDk1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=