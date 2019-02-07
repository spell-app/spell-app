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


exports.ParseError = ParseError;

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

// Error we'll throw for problems when parsing.
// Uses a specific type so we can check for it in tests.
function ParseError() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	Error.apply(this, args);
	if (Error.captureStackTrace) Error.captureStackTrace(this, ParseError);
}
ParseError.prototype = new Error();

var Parser = (_temp = _class = function () {

	// Constructor.


	// Set to `true` to output timing info.

	// Set to `true` to output debug info while adding rules
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


	// Add to Parser console debugging


	// Should we warn about anomalous conditions?


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
			if (!result) {
				throw new ParseError("parser.parse('" + ruleName + "', '" + text + "'): can't parse text");
			}
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
			if (!rule) throw new ParseError(callingContext + ": rule '" + ruleName + "' not found");
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
			for (var _len2 = arguments.length, imports = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				imports[_key2] = arguments[_key2];
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
			var constructor = _ref.constructor,
			    props = _objectWithoutProperties(_ref, ["constructor"]);

			// throw if required params not provided
			if (!constructor || !props.name) {
				throw new TypeError("parser.define(): You must pass 'constructor' and 'name'");
			}
			// throw if we're re-using a constructor
			if (constructor.prototype.name) {
				throw new TypeError("parser.define(): Attempting to re-use constructor for rule '" + ruleName + "'");
			}

			// If we're a "canonical" rule, set on Rule.
			// Use this if you want to check the type of a rule in a test or something.
			if (props.canonical) _Rule2.default[props.canonical] = constructor;

			// Convert blacklist from list of strings to a map
			if (props.blacklist && Array.isArray(props.blacklist)) {
				var map = {};
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = props.blacklist[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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

				props.blacklist = map;
			}

			// Add props to the contructor protoype non-enumerably and non-writably
			//  so we'll get an error if something tries to overwrite them.
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = Object.keys(props)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var _key3 = _step3.value;

					Object.defineProperty(constructor.prototype, _key3, { value: props[_key3] });
				}

				// Instantiate the rule.
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

			var rule = props.syntax ? (0, _RuleSyntax2.default)(props.syntax, constructor) : new constructor();

			// Combine aliases with the main name
			var names = [props.name].concat(props.alias || []);
			// note if we have tests so we can select this component easily
			if (props.tests) names.push("_testable_");

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

			if (tokens[start] !== startToken) throw new ParseError("Expected '" + startToken + "' at index " + start + " of tokens");
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
			throw new ParseError("Couldn't find matching '" + endToken + "'s starting at item " + start);
		}
	}]);

	return Parser;
}(), _class.DEBUG = false, _class.WARN = false, _class.TIME = false, _class.ParseError = ParseError, _class.REGISTRY = {}, _temp);
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
        var _results = this.results,
            condition = _results.condition,
            statement = _results.statement,
            block = _results.block;
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
        var _results2 = this.results,
            condition = _results2.condition,
            statement = _results2.statement,
            elseStatement = _results2.elseStatement;

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
        var _results3 = this.results,
            condition = _results3.condition,
            statement = _results3.statement,
            block = _results3.block;
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
        var _results4 = this.results,
            statement = _results4.statement,
            block = _results4.block;
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
        var _results = this.results,
            list = _results.list,
            identifier = _results.identifier;
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
        var _results2 = this.results,
            thing = _results2.thing,
            list = _results2.list;

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
        var _results3 = this.results,
            identifier = _results3.identifier,
            position = _results3.position,
            expression = _results3.expression;
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
        var list = this.results.list;

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
        var _results4 = this.results,
            number = _results4.number,
            list = _results4.list;

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
        var _results5 = this.results,
            start = _results5.start,
            end = _results5.end,
            list = _results5.list;

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
        var _results6 = this.results,
            number = _results6.number,
            list = _results6.list;

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
        var _results7 = this.results,
            number = _results7.number,
            list = _results7.list;

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
        var _results8 = this.results,
            thing = _results8.thing,
            list = _results8.list;

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
        var _results9 = this.results,
            identifier = _results9.identifier,
            condition = _results9.condition,
            list = _results9.list;
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
        var _results10 = this.results,
            identifier = _results10.identifier,
            operator = _results10.operator,
            filter = _results10.filter,
            list = _results10.list;

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
        var _results11 = this.results,
            thing = _results11.thing,
            list = _results11.list;

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
        var _results12 = this.results,
            thing = _results12.thing,
            list = _results12.list;

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
        var _results13 = this.results,
            thing = _results13.thing,
            position = _results13.position,
            list = _results13.list;

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
        var _results14 = this.results,
            thing = _results14.thing,
            item = _results14.item,
            list = _results14.list;

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
        var list = this.results.list;

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
        var _results15 = this.results,
            number = _results15.number,
            list = _results15.list;

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
        var _results16 = this.results,
            start = _results16.start,
            end = _results16.end,
            list = _results16.list;

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
        var _results17 = this.results,
            thing = _results17.thing,
            list = _results17.list;

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
        var _results18 = this.results,
            identifier = _results18.identifier,
            condition = _results18.condition,
            list = _results18.list;
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
        var list = this.results.list;

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
        var list = this.results.list;

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
        var _results19 = this.results,
            itemVar = _results19.itemVar,
            positionVar = _results19.positionVar,
            list = _results19.list,
            statement = _results19.statement,
            block = _results19.block;

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
        var _results20 = this.results,
            start = _results20.start,
            end = _results20.end;

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
            _operator = _results._operator;

        return _operator.apply(lhs, rhs);
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
            _operator = _results2._operator;

        return _operator.apply(expression);
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
        var expression = this.results.expression;

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
        var _results = this.results,
            thing = _results.thing,
            value = _results.value;
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
        var value = this.results.value;
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
        var _results2 = this.results,
            message = _results2.message,
            _results2$okButton = _results2.okButton,
            okButton = _results2$okButton === undefined ? "\"OK\"" : _results2$okButton;

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
        var _results3 = this.results,
            message = _results3.message,
            _results3$okButton = _results3.okButton,
            okButton = _results3$okButton === undefined ? "\"OK\"" : _results3$okButton;

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
        var _results4 = this.results,
            message = _results4.message,
            _results4$okButton = _results4.okButton,
            okButton = _results4$okButton === undefined ? "\"OK\"" : _results4$okButton,
            _results4$cancelButto = _results4.cancelButton,
            cancelButton = _results4$cancelButto === undefined ? "\"Cancel\"" : _results4$cancelButto;

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
        var _results = this.results,
            name = _results.name,
            superType = _results.superType,
            block = _results.block;

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
        var _results2 = this.results,
            type = _results2.type,
            _results2$props = _results2.props,
            props = _results2$props === undefined ? "" : _results2$props;
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
        var _results3 = this.results,
            operator = _results3.operator,
            name = _results3.name,
            _results3$args = _results3.args,
            args = _results3$args === undefined ? [] : _results3$args;

        var subType = operator === "to" ? "method" : "event";
        return { type: "function", subType: subType, name: name, args: args };
      }
    }, {
      key: "toSource",
      value: function toSource() {
        var _results4 = this.results,
            name = _results4.name,
            _results4$args = _results4.args,
            args = _results4$args === undefined ? [] : _results4$args,
            statement = _results4.statement,
            block = _results4.block;

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
      key: "toSource",
      value: function toSource() {
        var _results5 = this.results,
            name = _results5.name,
            _results5$args = _results5.args,
            args = _results5$args === undefined ? [] : _results5$args,
            types = _results5.types,
            statement = _results5.statement,
            block = _results5.block;

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
        var _results6 = this.results,
            name = _results6.name,
            args = _results6.args,
            types = _results6.types;

        return { type: "function", subType: "action", name: name, args: args, types: types };
      }
    }, {
      key: "results",

      // Add `name`, `args` and `types` to matched source
      get: function get() {
        var output = _get(declare_action.prototype.__proto__ || Object.getPrototypeOf(declare_action.prototype), "results", this);

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
        var _results7 = this.results,
            name = _results7.name,
            expression = _results7.expression,
            block = _results7.block;
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
        var name = this.results.name;

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
        var _results8 = this.results,
            name = _results8.name,
            _results8$args = _results8.args,
            args = _results8$args === undefined ? [name] : _results8$args,
            statement = _results8.statement,
            block = _results8.block;
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
        var name = this.results.name;

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
        var _results9 = this.results,
            scope = _results9.scope,
            name = _results9.name,
            _results9$value = _results9.value,
            value = _results9$value === undefined ? "" : _results9$value;

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
        var _results10 = this.results,
            scope = _results10.scope,
            name = _results10.name;

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
        var _results11 = this.results,
            name = _results11.name,
            type = _results11.type;

        return "get " + name + "() { return this.__" + name + " }\n" + ("set " + name + "(value) { if (spell.isA(value, " + type + ") this.__" + name + " = value }");
      }

      // Return a logical representation of the data structure

    }, {
      key: "toStructure",
      value: function toStructure() {
        var _results12 = this.results,
            name = _results12.name,
            type = _results12.type;

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
      key: "toSource",
      value: function toSource() {
        var _results13 = this.results,
            name = _results13.name,
            plural = _results13.plural,
            list = _results13.list;

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
        var _results14 = this.results,
            name = _results14.name,
            plural = _results14.plural;

        return [{ type: "property", name: name }, { type: "property", subType: "shared", name: plural }];
      }
    }, {
      key: "results",
      get: function get() {
        var results = _get(declare_property_as_one_of.prototype.__proto__ || Object.getPrototypeOf(declare_property_as_one_of.prototype), "results", this);
        results.plural = (0, _string.pluralize)(results.name);
        return results;
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
      key: "toSource",
      value: function toSource() {
        var _results15 = this.results,
            expression = _results15.expression,
            properties = _results15.properties;

        properties = properties.reverse().join(".");
        return expression + "." + properties;
        // NOTE: the following is safer, but ugly for demo purposes
        //			return `spell.get(${expression}, ['${properties}'])`;
      }
    }, {
      key: "results",
      get: function get() {
        var _results16 = this.results,
            expression = _results16.expression,
            properties_ = _results16.properties_;

        return {
          properties: _properties.matched.map(function (property) {
            return property.results.identifier;
          })
        };
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
        var identifier = this.results.identifier;

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
  syntax: "with [args:{identifier},]",
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
        return this.results._args.matched.map(function (arg) {
          return arg.toSource();
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
  }(_Rule4.default.Pattern),
  tests: [{
    title: "correctly matches words",
    tests: [["abc", "abc"], ["abc-def", "abc_def"], ["abc_def", "abc_def"], ["abc01", "abc01"], ["abc-def_01", "abc_def_01"]]
  }, {
    title: "doesn't match things that aren't words",
    tests: [["$asda", undefined], ["(asda)", undefined] // TODO... ???
    ]
  }]
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
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
  tests: [{
    title: "correctly matches identifiers",
    tests: [["", undefined], ["abc", "abc"], ["abc-def", "abc_def"], ["abc_def", "abc_def"], ["abc01", "abc01"], ["abc-def_01", "abc_def_01"]]
  }, {
    title: "doesn't match things that aren't identifiers",
    tests: [["", undefined], ["$asda", undefined], ["(asda)", undefined], // TODO... ???
    ["Abc", undefined]]
  }, {
    title: "skips items in its blacklist",
    tests: [["yes", undefined]]
  }]
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
  blacklist: ["I"],
  tests: [{
    title: "correctly matches types",
    tests: [["Abc", "Abc"], ["Abc-def", "Abc_def"], ["Abc_Def", "Abc_Def"], ["Abc01", "Abc01"], ["Abc-def_01", "Abc_def_01"]]
  }, {
    title: "doesn't match things that aren't types",
    tests: [["", undefined], ["$Asda", undefined], // TODO... ???
    ["(Asda)", undefined]]
  }, {
    title: "skips items in its blacklist",
    tests: [["I", undefined]]
  }]
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
  }(_Rule4.default.Pattern),
  tests: [{
    title: "correctly matches booleans",
    tests: [["", undefined], ["true", true], ["yes", true], ["ok", true], ["success", true], ["false", false], ["no", false], ["cancel", false], ["failure", false]]
  }, {
    title: "doesn't match in the middle of a longer keyword",
    tests: [["yessir", undefined], ["yes-sir", undefined], ["yes_sir", undefined]]
  }]
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
    ten: 10 }, _temp),
  tests: [{
    title: "correctly matches numbers",
    tests: [["1", 1], ["1000", 1000], ["-1", -1], ["1.1", 1.1], ["000.1", 0.1], ["1.", 1], [".1", 0.1], ["-111.111", -111.111]]
  }, {
    title: "doesn't match things that aren't numbers",
    tests: [["", undefined], [".", undefined]]
  }, {
    title: "requires negative sign to be touching the number",
    tests: [["- 1", undefined]]
  }]
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
  }(_Rule4.default),
  tests: [{
    title: "correctly matches text",
    tests: [['""', '""'], ["''", "''"], ['"a"', '"a"'], ["'a'", "'a'"], ['"abcd"', '"abcd"'], ['"abc def ghi. jkl"', '"abc def ghi. jkl"'], ['"...Can\'t touch this"', '"...Can\'t touch this"']]
  }]
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
        var list = this.results.list;

        return "[" + (list ? list.join(", ") : "") + "]";
      }
    }]);

    return literal_list;
  }(_Rule4.default.Sequence),
  tests: [{
    title: "correctly matches literal lists",
    tests: [["[]", "[]"], ["[1]", "[1]"], ["[1,]", "[1]"], ["[1,2,3]", "[1, 2, 3]"], ["[1, 2, 3]", "[1, 2, 3]"], ["[1,2,3,]", "[1, 2, 3]"], ["[yes,no,'a',1]", "[true, false, 'a', 1]"]]
  }, {
    title: "doesn't match malformed lists ",
    tests: [["", undefined], ["[,1]", undefined]]
  }]
},

// Parenthesized expression
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
        var expression = this.results.expression;
        // don't double parens if not necessary

        if (typeof expression === "string" && expression.startsWith("(") && expression.endsWith(")")) return expression;
        return "(" + expression + ")";
      }
    }]);

    return parenthesized_expression;
  }(_Rule4.default.Sequence),
  tests: [{
    title: "correctly matches parenthesized expressions",
    tests: [["(someVar)", "(someVar)"], ["((someVar))", "(someVar)"], ["(1 and yes)", "(1 && true)"]]
  }, {
    title: "correctly matches multiple parenthesis",
    compileAs: "expression",
    tests: [["(1) and (yes)", "((1) && (true))"], ["((1) and (yes))", "((1) && (true))"], ["((1) and ((yes)))", "((1) && (true))"]]
  }, {
    title: "doesn't match malformed parenthesized expressions",
    tests: [["(foo", undefined], ["(foo(bar)baz", undefined]]
  }]
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
//		- `rule.toSource()`	  Return javascript source to interpret the rule.
//		- `rule.toSyntax()`	  Return ruleSyntax for the rule (mostly for debugging)
//    -
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

		//
		// ## reflection
		//

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
		// Returns an object with properties from the `matched` array indexed by one of the following:
		//		- `match.argument`:		argument set when rule was declared, eg: `{value:literal}` => `value`
		//		- `match.group`:		  name of group rule was added to
		//		- `match.constructor.name`:			name of the rule type

	}, {
		key: "toSyntax",


		// Echo this rule back out.
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
			var results = addResults({}, this.matched);
			if (this.comment) results.comment = this.comment;
			return results;

			function addResults(results, matched) {
				var index = 0,
				    match = undefined;
				while (match = matched[index++]) {
					if (match.promote) {
						addResults(results, match.matched);
					} else {
						var sourceName = match.argument || match.group || match.constructor.name;
						var matchName = "_" + sourceName;
						var source = match.toSource();
						// If arg already exists, convert to an array
						if (matchName in results) {
							if (!Array.isArray(results[matchName])) {
								results[matchName] = [results[matchName]];
								results[sourceName] = [results[sourceName]];
							}
							results[matchName].push(match);
							results[sourceName].push(source);
						} else {
							results[matchName] = match;
							results[sourceName] = source;
						}
					}
				}
				return results;
			}
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
			//	console.info(this.argument || this.group, matches, matches.map(match => match.matchedText));
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
			var _results = this.results,
			    name = _results._name,
			    superType = _results._superType;

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
//	In your `results`, `block` will be the resulting block output, if there is one.
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

		// Add our `block` to the results

	}, {
		key: "results",
		get: function get() {
			var results = _get(block_statement.prototype.__proto__ || Object.getPrototypeOf(block_statement.prototype), "results", this);
			if (results && this.block) {
				results._block = this.block;
				results.block = this.block.toSource();
			}
			return results;
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
  if (promote) {
    slice = slice.slice(2);
  }

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
}

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
            end = _Parser$findNestedTok2.end;

        current = current.concat(tokens.slice(i, end + 1));
        i = end;
      } else {
        current.push(token);
      }
  }
  if (current.length) alternatives.push(current);
  return alternatives;
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

// Match `{<subrule>}` in syntax rules.
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvc3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2ZhaWxzLmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9saWIva2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvc3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY29mLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19saWJyYXJ5LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LXBpZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcG4uanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLWtleS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW50ZWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fd2tzLWV4dC5qcyIsIndlYnBhY2s6Ly8vLi9+L2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL3NyYy9QYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9ldmVudF9oYW5kbGVycy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL21hdGNoX2tleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9wYXJzZV9rZXlzLmpzIiwid2VicGFjazovLy8uL34vc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL1NwZWxsRWRpdG9yLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvcnVsZXMvc3BlbGwvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9FeGFtcGxlU3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL1NwYWNlci5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9UYWJiYWJsZVRleHRBcmVhLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL2luZGV4LmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL3V0aWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21lbW9pemUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL0pTWC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcnVsZXMvc3BlbGwvaWYuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL2xpc3RzLmpzIiwid2VicGFjazovLy8uL3NyYy9ydWxlcy9zcGVsbC9vcGVyYXRvcnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL3N0YXRlbWVudHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL3R5cGVzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9lczYvc3ltYm9sLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY2xhc3NvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY3R4LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faHRtbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faXMtYXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX21ldGEuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1jcmVhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcHMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wbi1leHQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3NldC10by1zdHJpbmctdGFnLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL190by1hYnNvbHV0ZS1pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tbGVuZ3RoLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL193a3MtZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL2VzNi5zeW1ib2wuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9TcGFjZXIubGVzcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL3N0eWxlcy5sZXNzIiwid2VicGFjazovLy8uL3NyYy9ydWxlcy9zcGVsbC9jb3JlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kZXNjcmlwdG9ycy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faGFzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2ZhY3RvcnlXaXRoVGhyb3dpbmdTaGltcy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9jbGFzc19kZWNvcmF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvbWV0aG9kX2RlY29yYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9tZXRob2RfZGVjb3JhdG9yX3Njb3BlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9hcnJheS5mcm9tLmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvZG9tX2hlbHBlcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9saXN0ZW5lcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi91dWlkLmpzIiwid2VicGFjazovLy8uL3NyYy9SdWxlLmpzIiwid2VicGFjazovLy8uL3NyYy9SdWxlU3ludGF4LmpzIiwid2VicGFjazovLy8uL3NyYy9Ub2tlbml6ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2lzLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdWlkLmpzIiwid2VicGFjazovLy8uL34vc3R5bGUtbG9hZGVyL2ZpeFVybHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9TcGFjZXIubGVzcz8wOGRlIiwid2VicGFjazovLy8uL3NyYy9hcHAvc3R5bGVzLmxlc3M/YjdlNyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvY2xhc3MuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3drcy5qcyJdLCJuYW1lcyI6WyJpc1doaXRlc3BhY2UiLCJwbHVyYWxpemUiLCJpc1BsdXJhbCIsInNpbmd1bGFyaXplIiwiaXNTaW5ndWxhciIsImdldFRhYnMiLCJBTExfV0hJVEVTUEFDRSIsInRleHQiLCJ0ZXN0Iiwid29yZCIsInJlcGxhY2UiLCJUQUJTIiwibnVtYmVyIiwic3Vic3RyIiwiYWxsRXhwb3J0cyIsImV4cG9ydHMiLCJnbG9iYWwiLCJTVFJJTkciLCJnbG9iYWxfaWRlbnRpZmllciIsIndpbmRvdyIsInNlbGYiLCJQYXJzZUVycm9yIiwiY29uc29sZSIsImdyb3VwIiwibG9nIiwiZ3JvdXBFbmQiLCJhcmdzIiwiRXJyb3IiLCJhcHBseSIsImNhcHR1cmVTdGFja1RyYWNlIiwicHJvdG90eXBlIiwiUGFyc2VyIiwicHJvcGVydGllcyIsImltcG9ydHMiLCJfcnVsZXMiLCJPYmplY3QiLCJhc3NpZ24iLCJydWxlTmFtZSIsImFyZ3VtZW50cyIsImxlbmd0aCIsIlRJTUUiLCJ0aW1lIiwidG9rZW5zIiwiVG9rZW5pemVyIiwidG9rZW5pemUiLCJmaWx0ZXIiLCJpc05vcm1hbFdoaXRlc3BhY2UiLCJ0b2tlbiIsInRpbWVFbmQiLCJ1bmRlZmluZWQiLCJyZW1vdmVMZWFkaW5nV2hpdGVzcGFjZSIsInJlc3VsdCIsInBhcnNlTmFtZWRSdWxlIiwicGFyc2UiLCJ0b1NvdXJjZSIsInN0YXJ0IiwiZW5kIiwic3RhY2siLCJjYWxsaW5nQ29udGV4dCIsInJ1bGUiLCJydWxlcyIsInJldmVyc2UiLCJjb25jYXQiLCJfX3J1bGVzIiwibWFwIiwiZXhpc3RpbmciLCJSdWxlIiwiQWx0ZXJuYXRpdmVzIiwiYWx0Q29uc3RydWN0b3IiLCJhZGRSdWxlIiwiQXJyYXkiLCJpc0FycmF5IiwiZm9yRWFjaCIsIl9tZXJnZVJ1bGUiLCJyZWR1Y2UiLCJibGFja2xpc3QiLCJkZWZpbmVSdWxlIiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIm5hbWUiLCJUeXBlRXJyb3IiLCJjYW5vbmljYWwiLCJrZXkiLCJrZXlzIiwiZGVmaW5lUHJvcGVydHkiLCJ2YWx1ZSIsInN5bnRheCIsIm5hbWVzIiwiYWxpYXMiLCJ0ZXN0cyIsInB1c2giLCJvdXRwdXQiLCJmb3JOYW1lIiwicGFyc2VyIiwiUkVHSVNUUlkiLCJzdGFydFRva2VuIiwiZW5kVG9rZW4iLCJuZXN0aW5nIiwibmVzdGVkIiwibGFzdEluZGV4Iiwic2xpY2UiLCJERUJVRyIsIldBUk4iLCJTcGVsbEVkaXRvciIsIm9ic2VydmVyIiwiZXhhbXBsZXMiLCJsb2FkIiwic3BlbGxFZGl0b3IiLCJzYXZlIiwicmV2ZXJ0IiwiY29tcGlsZSIsImNyZWF0ZSIsImRlbGV0ZSIsInJlbmFtZSIsImR1cGxpY2F0ZSIsInJlc2V0IiwidGl0bGVzIiwic2VsZWN0ZWQiLCJkaXJ0eSIsImNvZGUiLCJvcHRpb25zIiwidGl0bGUiLCJjb250ZW50Iiwib25DbGljayIsInNlbGVjdCIsImRpcnR5QnV0dG9ucyIsInBvc2l0aW9uIiwicmlnaHQiLCJ0b3AiLCJtYXJnaW4iLCJjb21waWxlQnV0dG9uIiwid2lkdGgiLCJsZWZ0IiwiaGVpZ2h0IiwicGFkZGluZ1RvcCIsImV2ZW50IiwidXBkYXRlIiwidGFyZ2V0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJkZWZhdWx0UHJvcHMiLCJFeGFtcGxlU3RvcmUiLCJpbXBvcnQiLCJiaW5kIiwibG9jYWxTdG9yYWdlIiwic3BlbGxFZGl0b3JFeGFtcGxlcyIsInNwZWxsRWRpdG9yRXhhbXBsZSIsImxvY2F0aW9uIiwicmVsb2FkIiwiSlNPTiIsIl9zYXZlZEV4YW1wbGVzIiwic3RyaW5naWZ5IiwiZXhhbXBsZSIsInNraXBTYXZlIiwic2hvd0NvbmZpcm0iLCJjb25maXJtIiwicHJvbXB0Iiwib2xkTmFtZSIsIm5ld05hbWUiLCJ3YXJuIiwic2V0VGltZW91dCIsImluZm8iLCJvYnNlcnZhYmxlIiwiY29tcHV0ZWQiLCJTcGFjZXIiLCJjbGFzc05hbWUiLCJhcHBlYXJhbmNlIiwic2l6ZSIsImlubGluZSIsImZsdWlkIiwidGlueSIsInNtYWxsIiwibWVkaXVtIiwibGFyZ2UiLCJodWdlIiwibWFzc2l2ZSIsInNwYWNlclByb3BzIiwic3R5bGUiLCJwcm9wVHlwZXMiLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJib29sIiwiVGFiYmFibGVUZXh0QXJlYSIsIm9uS2V5RG93biIsImtleUNvZGUiLCJwcmV2ZW50RGVmYXVsdCIsImVsZW1lbnQiLCJzZWxlY3Rpb25TdGFydCIsInNlbGVjdGlvbkVuZCIsIm5ld1RleHQiLCJzaGlmdEtleSIsImxhc3RJbmRleE9mIiwiaW5kZXhPZiIsImxpbmVzIiwic3BsaXQiLCJsaW5lIiwiam9pbiIsIm9uQ2hhbmdlIiwiVGV4dEFyZWEiLCJSZWFjdERPTSIsInJlbmRlciIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJjbGFzc05hbWVzIiwiYXJnIiwiQm9vbGVhbiIsIm1lbW9pemVkIiwiZGVmaW5lTWVtb2l6ZWQiLCJwcm9wZXJ0eSIsImdldHRlciIsImNvbmZpZ3VyYWJsZSIsImdldCIsImRlZmluZVJ1bGVzIiwiSlNYRWxlbWVudCIsImNsb25lIiwibWF0Y2hlZCIsIm5leHRTdGFydCIsImpzeEVsZW1lbnQiLCJhdHRyaWJ1dGVzIiwiYXR0cnMiLCJKU1hFeHByZXNzaW9uIiwianN4RXhwcmVzc2lvblRvU291cmNlIiwiY2hpbGRyZW4iLCJjaGlsZCIsInRyaW0iLCJjaGlsZFNvdXJjZSIsImpzeEVsZW1lbnRUb1NvdXJjZSIsIlN5bnRheEVycm9yIiwianN4RXhwcmVzc2lvbiIsInRhZ05hbWUiLCJhdHRyc1RvU291cmNlIiwiY2hpbGRyZW5Ub1NvdXJjZSIsInJlc3VsdHMiLCJjb25kaXRpb24iLCJzdGF0ZW1lbnQiLCJibG9jayIsInN0YXRlbWVudHMiLCJCbG9jayIsImVuY2xvc2VTdGF0ZW1lbnRzIiwiQmxvY2tTdGF0ZW1lbnQiLCJsZWZ0UmVjdXJzaXZlIiwidGVzdFJ1bGUiLCJLZXl3b3JkcyIsImxpdGVyYWxzIiwiZWxzZVN0YXRlbWVudCIsIlNlcXVlbmNlIiwibGlzdCIsImlkZW50aWZpZXIiLCJ0aGluZyIsImV4cHJlc3Npb24iLCJhcmd1bWVudCIsIm1hdGNoIiwib3BlcmF0b3IiLCJiYW5nIiwiaXRlbSIsIml0ZW1WYXIiLCJwb3NpdGlvblZhciIsImxocyIsInJocyIsIl9vcGVyYXRvciIsInByZWNlZGVuY2UiLCJhIiwiYiIsInR5cGUiLCJTeW1ib2xzIiwibWVzc2FnZSIsIm9rQnV0dG9uIiwiY2FuY2VsQnV0dG9uIiwic3RydWN0dXJlIiwic3VwZXJUeXBlIiwic3ViVHlwZSIsInR5cGVzIiwiY29uZGl0aW9ucyIsImtleXdvcmRzIiwia2V5d29yZE1hdGNoZXMiLCJrZXl3b3JkIiwiVHlwZSIsImVycm9yIiwiaW5kZXgiLCJ0b0xvd2VyQ2FzZSIsInN0YXJ0c1dpdGgiLCJtYXRjaGVkVGV4dCIsInNjb3BlIiwiZGVjbGFyYXRpb24iLCJkYXRhVHlwZSIsInBsdXJhbCIsInByb3BlcnRpZXNfIiwiX3Byb3BlcnRpZXMiLCJwcm9wIiwiTGlzdCIsIl9hcmdzIiwiU3RhdGVtZW50cyIsIkNvbW1lbnQiLCJwYXR0ZXJuIiwiUGF0dGVybiIsIk51bWJlciIsIk5VTUJFUl9OQU1FUyIsInplcm8iLCJvbmUiLCJ0d28iLCJ0aHJlZSIsImZvdXIiLCJmaXZlIiwic2l4Iiwic2V2ZW4iLCJlaWdodCIsIm5pbmUiLCJ0ZW4iLCJUZXh0IiwicXVvdGVkU3RyaW5nIiwiZW5kc1dpdGgiLCJjb21waWxlQXMiLCJMaXRlcmFscyIsIm1hdGNoZXNTdGFydGluZ0F0IiwibGl0ZXJhbFNlcGFyYXRvciIsImZpcnN0IiwiZXZlcnkiLCJsaXRlcmFsIiwiaSIsIm9wdGlvbmFsIiwic29tZSIsInNvdXJjZSIsIlN1YnJ1bGUiLCJtYXRjaGVkUnVsZSIsInN1YnJ1bGUiLCJpbmNsdWRlcyIsInRvU3ludGF4IiwiYWRkUmVzdWx0cyIsImNvbW1lbnQiLCJwcm9tb3RlIiwic291cmNlTmFtZSIsIm1hdGNoTmFtZSIsIm1hdGNoZXMiLCJiZXN0TWF0Y2giLCJnZXRCZXN0TWF0Y2giLCJiZXN0IiwiY3VycmVudCIsIlJlcGVhdCIsInJlcGVhdCIsImlzQ29tcG91bmRSdWxlIiwiZGVsaW1pdGVyIiwiaW5kZW50IiwiY29udGVudHMiLCJCbGFua0xpbmUiLCJsYXN0IiwicGFyc2VCbG9jayIsInBhcnNlU3RhdGVtZW50IiwiV2hpdGVzcGFjZSIsIlN0YXRlbWVudFBhcnNlRXJyb3IiLCJ1bnBhcnNlZCIsInBhcnNlZCIsImUiLCJibG9ja1RvU291cmNlIiwiX25hbWUiLCJfc3VwZXJUeXBlIiwibmFtZWQiLCJtZXRob2RzIiwib3RoZXIiLCJ0b1N0cnVjdHVyZSIsImFkZFN0cnVjdHVyZSIsImJyZWFrSW50b0Jsb2NrcyIsIl9ibG9jayIsIndoaXRlc3BhY2UiLCJwYXJzZVJ1bGUiLCJwYXJzZVN5bnRheCIsImFsdENsYXNzIiwidG9rZW5pc2VSdWxlU3ludGF4IiwiU1lOVEFYX0VYUFJFU1NJT04iLCJzeW50YXhTdHJlYW0iLCJwYXJzZVRva2VuIiwicG9wIiwiS0VZV09SRF9QQVRURVJOIiwic3ludGF4VG9rZW4iLCJwYXJzZVN5bWJvbCIsInBhcnNlU3VicnVsZSIsInBhcnNlQWx0ZXJuYXRpdmVzIiwicGFyc2VMaXN0IiwicGFyc2VSZXBlYXQiLCJwYXJzZUtleXdvcmQiLCJuZXh0IiwiaXNFc2NhcGVkIiwiZmluZE5lc3RlZFRva2VucyIsImFsdGVybmF0aXZlcyIsImdyb3VwQWx0ZXJuYXRpdmVzIiwic3ltYm9sIiwicGFyYW1zIiwiYmFuZ1Bvc2l0aW9uIiwibm90IiwibmV3bGluZSIsIkluZGVudCIsIk5FV0xJTkUiLCJlYXRUb2tlbnMiLCJtYXRjaFRvcFRva2VucyIsIm1ldGhvZCIsImNhbGwiLCJtYXRjaFdoaXRlc3BhY2UiLCJtYXRjaFdvcmQiLCJtYXRjaE51bWJlciIsIm1hdGNoTmV3bGluZSIsIm1hdGNoSlNYRWxlbWVudCIsIm1hdGNoVGV4dCIsIm1hdGNoQ29tbWVudCIsIm1hdGNoU3ltYm9sIiwiZWF0V2hpdGVzcGFjZSIsIndoaXRlU3BhY2VFbmQiLCJ3aGl0ZXNwYWNlRW5kIiwiV09SRF9TVEFSVCIsIldPUkRfQ0hBUiIsIndvcmRFbmQiLCJOVU1CRVJfU1RBUlQiLCJOVU1CRVIiLCJudW1iZXJNYXRjaCIsIm1hdGNoRXhwcmVzc2lvbkF0SGVhZCIsIm51bWJlclN0ciIsInBhcnNlRmxvYXQiLCJxdW90ZVN5bWJvbCIsInRleHRFbmQiLCJjaGFyIiwiQ09NTUVOVCIsImNvbW1lbnRTdGFydCIsImdldExpbmVBdEhlYWQiLCJjb21tZW50TWF0Y2giLCJjb21tZW50U3ltYm9sIiwibWF0Y2hKU1hTdGFydFRhZyIsImlzVW5hcnlUYWciLCJtYXRjaEpTWENoaWxkcmVuIiwiY2hpbGRFbmQiLCJKU1hfVEFHX1NUQVJUIiwidGFnTWF0Y2giLCJlbmRCaXQiLCJtYXRjaEpTWEF0dHJpYnV0ZSIsImF0dHJFbmQiLCJhdHRyc0FzU3RyaW5nIiwiY2hpbGRyZW5Bc1N0cmluZyIsImF0dHIiLCJlbmRUYWciLCJtYXRjaEpTWENoaWxkIiwibWF0Y2hKU1hFbmRUYWciLCJtYXRjaEpTWEV4cHJlc3Npb24iLCJtYXRjaEpTWFRleHQiLCJtYXRjaFN0cmluZ0F0SGVhZCIsIkpTWF9BVFRSSUJVVEVfU1RBUlQiLCJlcXVhbHMiLCJhdHRyaWJ1dGUiLCJKU1hBdHRyaWJ1dGUiLCJtYXRjaEpTWEF0dHJpYnV0ZVZhbHVlIiwidmFsdWVFbmQiLCJtYXRjaEpTWEF0dHJpYnV0ZVZhbHVlSWRlbnRpZmllciIsImVuZEluZGV4IiwiZmluZE1hdGNoaW5nQXRIZWFkIiwiSlNYX1RFWFRfRU5EX0NIQVJTIiwiZmluZEZpcnN0QXRIZWFkIiwianN4VGV4dCIsInN0cmluZ0VuZCIsImhlYWQiLCJzdGFydERlbGltaXRlciIsImVuZERlbGltaXRlciIsImFmdGVyUXVvdGUiLCJjaGFycyIsInJlbW92ZU5vcm1hbFdoaXRlc3BhY2UiLCJicmVha0ludG9MaW5lcyIsImN1cnJlbnRMaW5lIiwiZ2V0TGluZUluZGVudHMiLCJkZWZhdWx0SW5kZW50IiwiaW5kZW50cyIsImdldExpbmVJbmRlbnQiLCJzdGFydEluZGVudCIsImdldE5leHRJbmRlbnQiLCJtYXhJbmRlbnQiLCJNYXRoIiwibWluIiwibGluZUluZGVudCIsIm5ld0Jsb2NrIiwiY2xvbmVDbGFzcyIsIl9fY2xvbmVDbGFzc19fIiwiRnVuY3Rpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O1FBSWdCQSxZLEdBQUFBLFk7UUFPQUMsUyxHQUFBQSxTO1FB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R0VUO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNYLGVBQUtnTCxRQUF4QztBQUhGLENBckRGLEVBNkRFO0FBQ0VuSyxRQUFNLFNBRFI7QUFFRU8sVUFBUSxRQUZWO0FBR0VUO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNYLGVBQUtnTCxRQUF4QztBQUhGLENBN0RGLEVBcUVFO0FBQ0VuSyxRQUFNLFNBRFI7QUFFRU8sVUFBUSxPQUZWO0FBR0VUO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNYLGVBQUtnTCxRQUF4QztBQUhGLENBckVGLEVBNkVFO0FBQ0VuSyxRQUFNLFNBRFI7QUFFRU8sVUFBUSxPQUZWO0FBR0VUO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNYLGVBQUtnTCxRQUF4QztBQUhGLENBN0VGLEVBcUZFO0FBQ0VuSyxRQUFNLFNBRFI7QUFFRU8sVUFBUSxTQUZWO0FBR0VUO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNYLGVBQUtnTCxRQUF4QztBQUhGLENBckZGLEVBNkZFO0FBQ0VuSyxRQUFNLFNBRFI7QUFFRU8sVUFBUSxRQUZWO0FBR0VUO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEs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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxnQ0FBZ0MsVUFBVSxFQUFFO0FBQzVDLEM7Ozs7Ozs7QUN6QkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsZ0NBQWdDLFVBQVUsRUFBRTtBQUM1QyxDOzs7Ozs7Ozs7Ozs7O1FDbkJnQjhhLFUsR0FBQUEsVTtBQU5oQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNPLFNBQVNBLFVBQVQsQ0FBb0I1WSxXQUFwQixFQUEwRDtBQUFBLE1BQXpCRSxJQUF5Qix1RUFBbEJGLFlBQVlFLElBQU07O0FBQy9EO0FBQ0EvRCxTQUFPMGMsY0FBUCxHQUF3QjdZLFdBQXhCO0FBQ0EsTUFBTXlJLFFBQVEsSUFBSXFRLFFBQUosQ0FBYSxNQUFiLG9CQUFxQzVZLElBQXJDLGtDQUFkO0FBQ0EsU0FBTy9ELE9BQU8wYyxjQUFkO0FBQ0EsU0FBT3BRLEtBQVA7QUFDRCxDOzs7Ozs7OztBQ1pEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBnbG9iYWwgZnJvbSBcIi4vZ2xvYmFsXCI7XG5cbi8vIFJldHVybiB0cnVlIGlmIHRleHQgaXMgYWxsIHdoaXRlc3BhY2UsIGluY2x1ZGluZyBlbXB0eSBzdHJpbmcuXG5sZXQgQUxMX1dISVRFU1BBQ0UgPSAvXlxccyokLztcbmV4cG9ydCBmdW5jdGlvbiBpc1doaXRlc3BhY2UodGV4dCkge1xuXHRyZXR1cm4gQUxMX1dISVRFU1BBQ0UudGVzdCh0ZXh0KVxufVxuXG4vLyBSZXR1cm4gdGhlIHBsdXJhbCBvZiBgd29yZGAuXG4vLyBOT1RFOiB0aGlzIGlzIG5vdCB2ZXJ5IGdvb2QgYXQgYWxsISEhXG4vLyBUT0RPOiBleGNlcHRpb25zLCBldGMuXG5leHBvcnQgZnVuY3Rpb24gcGx1cmFsaXplKHdvcmQpIHtcblx0cmV0dXJuIHdvcmQgKyBcInNcIjtcbn1cblxuLy8gUmV0dXJuIHRydWUgaWYgd29yZCBpcyBhIHBsdXJhbC5cbi8vIE5PVEU6IGZvciB3b3JkcyB3aGljaCBhcmUgQk9USCBzaW5ndWxhciBhbmQgcGx1cmFsLCB0aGlzIHdpbGwgcmV0dXJuIHRydWUuXG5leHBvcnQgZnVuY3Rpb24gaXNQbHVyYWwod29yZCkge1xuXHRyZXR1cm4gd29yZCA9PT0gcGx1cmFsaXplKHdvcmQpO1xufVxuXG5cbi8vIFJldHVybiB0aGUgc2luZ3VsYXIgb2YgYHdvcmRgLlxuLy8gTk9URTogdGhpcyBpcyBub3QgdmVyeSBnb29kIGF0IGFsbCEhIVxuLy8gVE9ETzogZXhjZXB0aW9ucywgZXRjLlxuZXhwb3J0IGZ1bmN0aW9uIHNpbmd1bGFyaXplKHdvcmQpIHtcblx0cmV0dXJuIHdvcmQucmVwbGFjZSgvZT9zJC8sIFwiXCIpO1xufVxuXG4vLyBSZXR1cm4gdHJ1ZSBpZiB3b3JkIGlzIGEgc2luZ3VsYXIuXG4vLyBOT1RFOiBmb3Igd29yZHMgd2hpY2ggYXJlIEJPVEggc2luZ3VsYXIgYW5kIHBsdXJhbCwgdGhpcyB3aWxsIHJldHVybiB0cnVlLlxuZXhwb3J0IGZ1bmN0aW9uIGlzU2luZ3VsYXIod29yZCkge1xuXHRyZXR1cm4gd29yZCA9PT0gc2luZ3VsYXJpemUod29yZCk7XG59XG5cblxuLy8gUmV0dXJuIGEgY2VydGFpbiBgbnVtYmVyYCBvZiB0YWIgY2hhcmFjdGVycy5cbmNvbnN0IFRBQlMgPSBcIlxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFwiO1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRhYnMobnVtYmVyKSB7XG5cdGlmICh0eXBlb2YgbnVtYmVyICE9PSBcIm51bWJlclwiKSByZXR1cm4gXCJcIjtcblx0cmV0dXJuIFRBQlMuc3Vic3RyKDAsIG51bWJlcik7XG59XG5cblxuLy8gRXhwb3J0IGFsbCBhcyBhIGx1bXBcbmxldCBhbGxFeHBvcnRzID0gey4uLmV4cG9ydHN9O1xuZXhwb3J0IGRlZmF1bHQgYWxsRXhwb3J0cztcblxuLy8gREVCVUc6IHB1dCBvbiBnbG9iYWwgZm9yIGRlYnVnZ2luZy5cbmdsb2JhbC5TVFJJTkcgPSBhbGxFeHBvcnRzO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3V0aWxzL3N0cmluZy5qcyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKCFpc09iamVjdChpdCkpIHRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2FuLW9iamVjdC5qc1xuLy8gbW9kdWxlIGlkID0gMTE0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4ZWMpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gISFleGVjKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2ZhaWxzLmpzXG4vLyBtb2R1bGUgaWQgPSAxMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICdjb3JlLWpzL2VzNi9zeW1ib2wnO1xuXG4vLyBUT0RPOiBOZWVkIGJldHRlciwgbW9yZSBjb21wbGV0ZSwgYW5kIG1vcmUgbWV0aG9kaWNhbCBrZXkgZGVmaW5pdGlvbnNcblxudmFyIEtleXMgPSB7XG4gIGJhY2tzcGFjZTogOCxcbiAgZGVsOiA0NixcbiAgZGVsZXRlOiA0NixcbiAgdGFiOiA5LFxuICBlbnRlcjogMTMsXG4gICdyZXR1cm4nOiAxMyxcbiAgZXNjOiAyNyxcbiAgc3BhY2U6IDMyLFxuICBwYWdlVXA6IDMzLFxuICBwYWdlRG93bjogMzQsXG4gIGVuZDogMzUsXG4gIGhvbWU6IDM2LFxuICBsZWZ0OiAzNyxcbiAgdXA6IDM4LFxuICByaWdodDogMzksXG4gIGRvd246IDQwLFxuICAnOyc6IDE4NixcbiAgJz0nOiAxODcsXG4gICcsJzogMTg4LFxuICAnLSc6IDE4OSxcbiAgJy4nOiAxOTAsXG4gICcvJzogMTkxLFxuICAnYCc6IDE5MixcbiAgJ1snOiAyMTksXG4gICdcXFxcJzogMjIwLFxuICAnXSc6IDIyMVxufTtcblxuLy8gQWRkIHVwcGVyY2FzZSB2ZXJzaW9ucyBvZiBrZXlzIGFib3ZlIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuT2JqZWN0LmtleXMoS2V5cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBLZXlzW2tleS50b1VwcGVyQ2FzZSgpXSA9IEtleXNba2V5XTtcbn0pO1xuXG4nMDEyMzQ1Njc4OScuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24gKG51bSwgaW5kZXgpIHtcbiAgcmV0dXJuIEtleXNbbnVtXSA9IGluZGV4ICsgNDg7XG59KTtcblxuJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJy5zcGxpdCgnJykuZm9yRWFjaChmdW5jdGlvbiAobGV0dGVyLCBpbmRleCkge1xuICBLZXlzW2xldHRlcl0gPSBpbmRleCArIDY1O1xuICBLZXlzW2xldHRlci50b0xvd2VyQ2FzZSgpXSA9IGluZGV4ICsgNjU7XG59KTtcblxuLy8gZm4ga2V5c1xuWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTJdLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XG4gIHJldHVybiBLZXlzWydmJyArIGluZGV4XSA9IDExMSArIGluZGV4O1xufSk7XG5cbmV4cG9ydCB2YXIgbW9kaWZpZXJzID0ge1xuICBjb250cm9sOiAnY3RybCcsXG4gIGN0cmw6ICdjdHJsJyxcbiAgc2hpZnQ6ICdzaGlmdCcsXG4gIG1ldGE6ICdtZXRhJyxcbiAgY21kOiAnbWV0YScsXG4gIGNvbW1hbmQ6ICdtZXRhJyxcbiAgb3B0aW9uOiAnYWx0JyxcbiAgYWx0OiAnYWx0J1xufTtcblxuZXhwb3J0IHZhciBBTExfS0VZUyA9IFN5bWJvbCgnQUxMX0tFWVMnKTtcblxuZXhwb3J0IHZhciBBTExfUFJJTlRBQkxFX0tFWVMgPSBTeW1ib2woJ0FMTF9QUklOVEFCTEVfS0VZUycpO1xuXG5leHBvcnQgZGVmYXVsdCBLZXlzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9rZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSAxNDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIF9zbGljZWRUb0FycmF5ID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7IH0gfTsgfSgpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuLyoqXG4gKiBAbW9kdWxlIHN0b3JlXG4gKlxuICovXG5pbXBvcnQgbWF0Y2hLZXlzIGZyb20gJy4vbGliL21hdGNoX2tleXMnO1xuaW1wb3J0IHBhcnNlS2V5cyBmcm9tICcuL2xpYi9wYXJzZV9rZXlzJztcbmltcG9ydCB1dWlkIGZyb20gJy4vbGliL3V1aWQnO1xuXG4vKipcbiAqIHByaXZhdGVcbiAqXG4gKi9cblxuLy8gZGljdCBmb3IgY2xhc3MgcHJvdG90eXBlcyA9PiBiaW5kaW5nc1xudmFyIF9oYW5kbGVycyA9IG5ldyBNYXAoKTtcblxuLy8gYWxsIG1vdW50ZWQgaW5zdGFuY2VzIHRoYXQgaGF2ZSBrZXliaW5kaW5nc1xudmFyIF9pbnN0YW5jZXMgPSBuZXcgU2V0KCk7XG5cbi8vIGZvciB0ZXN0aW5nXG5leHBvcnQgZnVuY3Rpb24gX3Jlc2V0U3RvcmUoKSB7XG4gIF9oYW5kbGVycy5jbGVhcigpO1xuICBfaW5zdGFuY2VzLmNsZWFyKCk7XG59XG5cbi8qKlxuICogYWN0aXZhdGVcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IGluc3RhbmNlIEluc3RhbnRpYXRlZCBjbGFzcyB0aGF0IGV4dGVuZGVkIFJlYWN0LkNvbXBvbmVudCwgdG8gYmUgZm9jdXNlZCB0byByZWNlaXZlIGtleWRvd24gZXZlbnRzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShpbnN0YW5jZXMpIHtcbiAgdmFyIGluc3RhbmNlc0FycmF5ID0gW10uY29uY2F0KGluc3RhbmNlcyk7XG5cbiAgLy8gaWYgbm8gY29tcG9uZW50cyB3ZXJlIGZvdW5kIGFzIGFuY2VzdG9ycyBvZiB0aGUgZXZlbnQgdGFyZ2V0LFxuICAvLyBlZmZlY3RpdmVseSBkZWFjdGl2YXRlIGtleWRvd24gaGFuZGxpbmcgYnkgY2FwcGluZyB0aGUgc2V0IG9mIGluc3RhbmNlc1xuICAvLyB3aXRoIGBudWxsYC5cbiAgaWYgKCFpbnN0YW5jZXNBcnJheS5sZW5ndGgpIHtcbiAgICBfaW5zdGFuY2VzLmFkZChudWxsKTtcbiAgfSBlbHNlIHtcbiAgICBfaW5zdGFuY2VzLmRlbGV0ZShudWxsKTtcblxuICAgIC8vIGRlbGV0aW5nIGFuZCB0aGVuIGFkZGluZyB0aGUgaW5zdGFuY2UocykgaGFzIHRoZSBlZmZlY3Qgb2Ygc29ydGluZyB0aGUgc2V0XG4gICAgLy8gYWNjb3JkaW5nIHRvIGluc3RhbmNlIGFjdGl2YXRpb24gKGFzY2VuZGluZylcbiAgICBpbnN0YW5jZXNBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgICAgX2luc3RhbmNlcy5kZWxldGUoaW5zdGFuY2UpO1xuICAgICAgX2luc3RhbmNlcy5hZGQoaW5zdGFuY2UpO1xuICAgIH0pO1xuICB9XG59O1xuXG4vKipcbiAqIGRlbGV0ZUluc3RhbmNlXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXQgSW5zdGFudGlhdGVkIGNsYXNzIHRoYXQgZXh0ZW5kZWQgUmVhY3QuQ29tcG9uZW50XG4gKiBAcmV0dXJuIHtib29sZWFufSBUaGUgdmFsdWUgc2V0LmhhcyggdGFyZ2V0ICkgd291bGQgaGF2ZSByZXR1cm5lZCBwcmlvciB0byBkZWxldGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlSW5zdGFuY2UodGFyZ2V0KSB7XG4gIF9pbnN0YW5jZXMuZGVsZXRlKHRhcmdldCk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZmluZEJpbmRpbmdGb3JFdmVudChldmVudCkge1xuICBpZiAoIV9pbnN0YW5jZXMuaGFzKG51bGwpKSB7XG4gICAgdmFyIGtleU1hdGNoZXNFdmVudCA9IGZ1bmN0aW9uIGtleU1hdGNoZXNFdmVudChrZXlTZXQpIHtcbiAgICAgIHJldHVybiBtYXRjaEtleXMoeyBrZXlTZXQ6IGtleVNldCwgZXZlbnQ6IGV2ZW50IH0pO1xuICAgIH07XG5cbiAgICAvLyBsb29wIHRocm91Z2ggaW5zdGFuY2VzIGluIHJldmVyc2UgYWN0aXZhdGlvbiBvcmRlciBzbyB0aGF0IG1vc3RcbiAgICAvLyByZWNlbnRseSBhY3RpdmF0ZWQgaW5zdGFuY2UgZ2V0cyBmaXJzdCBkaWJzIG9uIGV2ZW50XG4gICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KF9pbnN0YW5jZXMpKS5yZXZlcnNlKClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICAgIHZhciBiaW5kaW5ncyA9IGdldEJpbmRpbmcoaW5zdGFuY2UuY29uc3RydWN0b3IucHJvdG90eXBlKTtcbiAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMiA9IGZhbHNlO1xuICAgICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IyID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMiA9IGJpbmRpbmdzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICAgICAgICB2YXIgX3N0ZXAyJHZhbHVlID0gX3NsaWNlZFRvQXJyYXkoX3N0ZXAyLnZhbHVlLCAyKSxcbiAgICAgICAgICAgICAgICBrZXlTZXRzID0gX3N0ZXAyJHZhbHVlWzBdLFxuICAgICAgICAgICAgICAgIGZuID0gX3N0ZXAyJHZhbHVlWzFdO1xuXG4gICAgICAgICAgICBpZiAoa2V5U2V0cy5zb21lKGtleU1hdGNoZXNFdmVudCkpIHtcbiAgICAgICAgICAgICAgLy8gcmV0dXJuIHdoZW4gbWF0Y2hpbmcga2V5YmluZGluZyBpcyBmb3VuZCAtIGkuZS4gb25seSBvbmVcbiAgICAgICAgICAgICAgLy8ga2V5Ym91bmQgY29tcG9uZW50IGNhbiByZXNwb25kIHRvIGEgZ2l2ZW4ga2V5IGNvZGUuIHRvIGdldCBhcm91bmQgdGhpcyxcbiAgICAgICAgICAgICAgLy8gc2NvcGUgYSBjb21tb24gYW5jZXN0b3IgY29tcG9uZW50IGNsYXNzIHdpdGggQGtleWRvd24gYW5kIHVzZVxuICAgICAgICAgICAgICAvLyBAa2V5ZG93blNjb3BlZCB0byBiaW5kIHRoZSBkdXBsaWNhdGUga2V5cyBpbiB5b3VyIGNoaWxkIGNvbXBvbmVudHNcbiAgICAgICAgICAgICAgLy8gKG9yIGp1c3QgaW5zcGVjdCBuZXh0UHJvcHMua2V5ZG93bi5ldmVudCkuXG4gICAgICAgICAgICAgIHJldHVybiB7IGZuOiBmbiwgaW5zdGFuY2U6IGluc3RhbmNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjIgPSB0cnVlO1xuICAgICAgICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgICAgfVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG4vKipcbiAqIGdldEJpbmRpbmdcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCBDbGFzcyB1c2VkIGFzIGtleSBpbiBkaWN0IG9mIGtleSBiaW5kaW5nc1xuICogQHJldHVybiB7b2JqZWN0fSBUaGUgb2JqZWN0IGNvbnRhaW5pbmcgYmluZGluZ3MgZm9yIHRoZSBnaXZlbiBjbGFzc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmluZGluZyhfcmVmKSB7XG4gIHZhciBfX3JlYWN0S2V5ZG93blVVSUQgPSBfcmVmLl9fcmVhY3RLZXlkb3duVVVJRDtcblxuICByZXR1cm4gX2hhbmRsZXJzLmdldChfX3JlYWN0S2V5ZG93blVVSUQpO1xufTtcblxuLyoqXG4gKiBnZXRJbnN0YW5jZXNcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHJldHVybiB7c2V0fSBBbGwgc3RvcmVkIGluc3RhbmNlcyAoYWxsIG1vdW50ZWQgY29tcG9uZW50IGluc3RhbmNlcyB3aXRoIGtleWJpbmRpbmdzKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5zdGFuY2VzKCkge1xuICByZXR1cm4gX2luc3RhbmNlcztcbn07XG5cbi8qKlxuICogaXNFbXB0eVxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFNpemUgb2YgdGhlIHNldCBvZiBhbGwgc3RvcmVkIGluc3RhbmNlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eSgpIHtcbiAgcmV0dXJuICFfaW5zdGFuY2VzLnNpemU7XG59O1xuXG4vKipcbiAqIHNldEJpbmRpbmdcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MgQWxsIGFyZ3VtZW50cyBuZWNlc3NhcnkgdG8gc2V0IHRoZSBiaW5kaW5nXG4gKiBAcGFyYW0ge2FycmF5fSBhcmdzLmtleXMgS2V5IGNvZGVzIHRoYXQgc2hvdWxkIHRyaWdnZXIgdGhlIGZuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBhcmdzLmZuIFRoZSBjYWxsYmFjayB0byBiZSB0cmlnZ2VyZWQgd2hlbiBnaXZlbiBrZXlzIGFyZSBwcmVzc2VkXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncy50YXJnZXQgVGhlIGRlY29yYXRlZCBjbGFzc1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0QmluZGluZyhfcmVmMikge1xuICB2YXIga2V5cyA9IF9yZWYyLmtleXMsXG4gICAgICBmbiA9IF9yZWYyLmZuLFxuICAgICAgdGFyZ2V0ID0gX3JlZjIudGFyZ2V0O1xuXG4gIHZhciBrZXlTZXRzID0gcGFyc2VLZXlzKGtleXMpO1xuXG4gIHZhciBfX3JlYWN0S2V5ZG93blVVSUQgPSB0YXJnZXQuX19yZWFjdEtleWRvd25VVUlEO1xuXG4gIGlmICghX19yZWFjdEtleWRvd25VVUlEKSB7XG4gICAgdGFyZ2V0Ll9fcmVhY3RLZXlkb3duVVVJRCA9IHV1aWQoKTtcbiAgICBfaGFuZGxlcnMuc2V0KHRhcmdldC5fX3JlYWN0S2V5ZG93blVVSUQsIG5ldyBNYXAoW1trZXlTZXRzLCBmbl1dKSk7XG4gIH0gZWxzZSB7XG4gICAgX2hhbmRsZXJzLmdldChfX3JlYWN0S2V5ZG93blVVSUQpLnNldChrZXlTZXRzLCBmbik7XG4gIH1cbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvc3RvcmUuanNcbi8vIG1vZHVsZSBpZCA9IDE0OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBNYWtlIHN1cmUgYGdsb2JhbGAgaXMgZGVmaW5lZCBnbG9iYWxseTpcbi8vXHQtIGVpdGhlciBhcyB0aGUgbm9kZWpzIGBnbG9iYWxgLCBvclxuLy9cdC0gYXMgYW4gYWxpYXMgZm9yIGB3aW5kb3dgIGluIGJyb3dzZXJzLCBvclxuLy9cdC0gZm9yIHRoZSBgc2VsZmAgY29udGV4dCBpbiB3ZWIgd29ya2Vycy5cbi8vXG4vLyBOT1RFOiB0aGlzIG1vZGlmaWVzIHRoZSBcImdsb2JhbFwiIGVudmlyb25tZW50IGJ5IG1ha2luZyBzdXJlIFwiZ2xvYmFsXCIgaXMgc2V0LiFcbi8vXG5cbmxldCBnbG9iYWxfaWRlbnRpZmllcjtcbmlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4vL1x0Y29uc29sZS5sb2coXCJSdW5uaW5nIGluIG5vZGVcIik7XG5cdGdsb2JhbF9pZGVudGlmaWVyID0gZ2xvYmFsO1xufVxuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuLy9cdGNvbnNvbGUubG9nKFwiUnVubmluZyBpbiBhIHdlYiBicm93c2VyXCIpO1xuXHR3aW5kb3cuZ2xvYmFsID0gd2luZG93O1xuXHRnbG9iYWxfaWRlbnRpZmllciA9IHdpbmRvdztcbn1cblxuaWYgKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKSB7XG4vL1x0Y29uc29sZS5sb2coXCJSdW5uaW5nIGluIGEgd2ViIHdvcmtlclwiKTtcblx0c2VsZi5nbG9iYWwgPSBzZWxmO1xuXHRnbG9iYWxfaWRlbnRpZmllciA9IHNlbGY7XG59XG5cbi8vIEV4cG9ydCBmb3IgY29uc3VtcHRpb24gYnkgaW1wb3J0LlxuZXhwb3J0IGRlZmF1bHQgZ2xvYmFsX2lkZW50aWZpZXI7XG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91dGlscy9nbG9iYWwuanMiLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19jb2YuanNcbi8vIG1vZHVsZSBpZCA9IDE3OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBJRSA4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgJ2NvbnN0cnVjdG9yLGhhc093blByb3BlcnR5LGlzUHJvdG90eXBlT2YscHJvcGVydHlJc0VudW1lcmFibGUsdG9Mb2NhbGVTdHJpbmcsdG9TdHJpbmcsdmFsdWVPZidcbikuc3BsaXQoJywnKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2VudW0tYnVnLWtleXMuanNcbi8vIG1vZHVsZSBpZCA9IDE4MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICByZXR1cm4gZFAuZihvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzXG4vLyBtb2R1bGUgaWQgPSAxODFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmYWxzZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2xpYnJhcnkuanNcbi8vIG1vZHVsZSBpZCA9IDE4MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyAxOS4xLjIuMTQgLyAxNS4yLjMuMTQgT2JqZWN0LmtleXMoTylcbnZhciAka2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzLWludGVybmFsJyk7XG52YXIgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuL19lbnVtLWJ1Zy1rZXlzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24ga2V5cyhPKSB7XG4gIHJldHVybiAka2V5cyhPLCBlbnVtQnVnS2V5cyk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWtleXMuanNcbi8vIG1vZHVsZSBpZCA9IDE4M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzLmYgPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1waWUuanNcbi8vIG1vZHVsZSBpZCA9IDE4NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChiaXRtYXAsIHZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZTogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGU6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWU6IHZhbHVlXG4gIH07XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qc1xuLy8gbW9kdWxlIGlkID0gMTg1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIFNSQyA9IHJlcXVpcmUoJy4vX3VpZCcpKCdzcmMnKTtcbnZhciBUT19TVFJJTkcgPSAndG9TdHJpbmcnO1xudmFyICR0b1N0cmluZyA9IEZ1bmN0aW9uW1RPX1NUUklOR107XG52YXIgVFBMID0gKCcnICsgJHRvU3RyaW5nKS5zcGxpdChUT19TVFJJTkcpO1xuXG5yZXF1aXJlKCcuL19jb3JlJykuaW5zcGVjdFNvdXJjZSA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gJHRvU3RyaW5nLmNhbGwoaXQpO1xufTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE8sIGtleSwgdmFsLCBzYWZlKSB7XG4gIHZhciBpc0Z1bmN0aW9uID0gdHlwZW9mIHZhbCA9PSAnZnVuY3Rpb24nO1xuICBpZiAoaXNGdW5jdGlvbikgaGFzKHZhbCwgJ25hbWUnKSB8fCBoaWRlKHZhbCwgJ25hbWUnLCBrZXkpO1xuICBpZiAoT1trZXldID09PSB2YWwpIHJldHVybjtcbiAgaWYgKGlzRnVuY3Rpb24pIGhhcyh2YWwsIFNSQykgfHwgaGlkZSh2YWwsIFNSQywgT1trZXldID8gJycgKyBPW2tleV0gOiBUUEwuam9pbihTdHJpbmcoa2V5KSkpO1xuICBpZiAoTyA9PT0gZ2xvYmFsKSB7XG4gICAgT1trZXldID0gdmFsO1xuICB9IGVsc2UgaWYgKCFzYWZlKSB7XG4gICAgZGVsZXRlIE9ba2V5XTtcbiAgICBoaWRlKE8sIGtleSwgdmFsKTtcbiAgfSBlbHNlIGlmIChPW2tleV0pIHtcbiAgICBPW2tleV0gPSB2YWw7XG4gIH0gZWxzZSB7XG4gICAgaGlkZShPLCBrZXksIHZhbCk7XG4gIH1cbi8vIGFkZCBmYWtlIEZ1bmN0aW9uI3RvU3RyaW5nIGZvciBjb3JyZWN0IHdvcmsgd3JhcHBlZCBtZXRob2RzIC8gY29uc3RydWN0b3JzIHdpdGggbWV0aG9kcyBsaWtlIExvRGFzaCBpc05hdGl2ZVxufSkoRnVuY3Rpb24ucHJvdG90eXBlLCBUT19TVFJJTkcsIGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gdHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyAmJiB0aGlzW1NSQ10gfHwgJHRvU3RyaW5nLmNhbGwodGhpcyk7XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3JlZGVmaW5lLmpzXG4vLyBtb2R1bGUgaWQgPSAxODZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXyc7XG52YXIgc3RvcmUgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5cbihtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0gdmFsdWUgIT09IHVuZGVmaW5lZCA/IHZhbHVlIDoge30pO1xufSkoJ3ZlcnNpb25zJywgW10pLnB1c2goe1xuICB2ZXJzaW9uOiBjb3JlLnZlcnNpb24sXG4gIG1vZGU6IHJlcXVpcmUoJy4vX2xpYnJhcnknKSA/ICdwdXJlJyA6ICdnbG9iYWwnLFxuICBjb3B5cmlnaHQ6ICfCqSAyMDE4IERlbmlzIFB1c2hrYXJldiAoemxvaXJvY2sucnUpJ1xufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19zaGFyZWQuanNcbi8vIG1vZHVsZSBpZCA9IDE4N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyA3LjEuMSBUb1ByaW1pdGl2ZShpbnB1dCBbLCBQcmVmZXJyZWRUeXBlXSlcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xuLy8gaW5zdGVhZCBvZiB0aGUgRVM2IHNwZWMgdmVyc2lvbiwgd2UgZGlkbid0IGltcGxlbWVudCBAQHRvUHJpbWl0aXZlIGNhc2Vcbi8vIGFuZCB0aGUgc2Vjb25kIGFyZ3VtZW50IC0gZmxhZyAtIHByZWZlcnJlZCB0eXBlIGlzIGEgc3RyaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgUykge1xuICBpZiAoIWlzT2JqZWN0KGl0KSkgcmV0dXJuIGl0O1xuICB2YXIgZm4sIHZhbDtcbiAgaWYgKFMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIGlmICh0eXBlb2YgKGZuID0gaXQudmFsdWVPZikgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICBpZiAoIVMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNvbnZlcnQgb2JqZWN0IHRvIHByaW1pdGl2ZSB2YWx1ZVwiKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL190by1wcmltaXRpdmUuanNcbi8vIG1vZHVsZSBpZCA9IDE4OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBkb2N1bWVudCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50O1xuLy8gdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCcgaW4gb2xkIElFXG52YXIgaXMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2RvbS1jcmVhdGUuanNcbi8vIG1vZHVsZSBpZCA9IDI3OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpICYmICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2RpdicpLCAnYScsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiA3OyB9IH0pLmEgIT0gNztcbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faWU4LWRvbS1kZWZpbmUuanNcbi8vIG1vZHVsZSBpZCA9IDI4MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyAxOS4xLjIuNyAvIDE1LjIuMy40IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXG52YXIgJGtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cy1pbnRlcm5hbCcpO1xudmFyIGhpZGRlbktleXMgPSByZXF1aXJlKCcuL19lbnVtLWJ1Zy1rZXlzJykuY29uY2F0KCdsZW5ndGgnLCAncHJvdG90eXBlJyk7XG5cbmV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoTykge1xuICByZXR1cm4gJGtleXMoTywgaGlkZGVuS2V5cyk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcG4uanNcbi8vIG1vZHVsZSBpZCA9IDI4MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcHMuanNcbi8vIG1vZHVsZSBpZCA9IDI4MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIGFycmF5SW5kZXhPZiA9IHJlcXVpcmUoJy4vX2FycmF5LWluY2x1ZGVzJykoZmFsc2UpO1xudmFyIElFX1BST1RPID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWVzKSB7XG4gIHZhciBPID0gdG9JT2JqZWN0KG9iamVjdCk7XG4gIHZhciBpID0gMDtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIga2V5O1xuICBmb3IgKGtleSBpbiBPKSBpZiAoa2V5ICE9IElFX1BST1RPKSBoYXMoTywga2V5KSAmJiByZXN1bHQucHVzaChrZXkpO1xuICAvLyBEb24ndCBlbnVtIGJ1ZyAmIGhpZGRlbiBrZXlzXG4gIHdoaWxlIChuYW1lcy5sZW5ndGggPiBpKSBpZiAoaGFzKE8sIGtleSA9IG5hbWVzW2krK10pKSB7XG4gICAgfmFycmF5SW5kZXhPZihyZXN1bHQsIGtleSkgfHwgcmVzdWx0LnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1rZXlzLWludGVybmFsLmpzXG4vLyBtb2R1bGUgaWQgPSAyODNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpKCdrZXlzJyk7XG52YXIgdWlkID0gcmVxdWlyZSgnLi9fdWlkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIHNoYXJlZFtrZXldIHx8IChzaGFyZWRba2V5XSA9IHVpZChrZXkpKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19zaGFyZWQta2V5LmpzXG4vLyBtb2R1bGUgaWQgPSAyODRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gNy4xLjQgVG9JbnRlZ2VyXG52YXIgY2VpbCA9IE1hdGguY2VpbDtcbnZhciBmbG9vciA9IE1hdGguZmxvb3I7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL190by1pbnRlZ2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAyODVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fd2tzJyk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL193a3MtZXh0LmpzXG4vLyBtb2R1bGUgaWQgPSAyODZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbi8vIGNzcyBiYXNlIGNvZGUsIGluamVjdGVkIGJ5IHRoZSBjc3MtbG9hZGVyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVzZVNvdXJjZU1hcCkge1xuXHR2YXIgbGlzdCA9IFtdO1xuXG5cdC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblx0bGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0dmFyIGNvbnRlbnQgPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0sIHVzZVNvdXJjZU1hcCk7XG5cdFx0XHRpZihpdGVtWzJdKSB7XG5cdFx0XHRcdHJldHVybiBcIkBtZWRpYSBcIiArIGl0ZW1bMl0gKyBcIntcIiArIGNvbnRlbnQgKyBcIn1cIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBjb250ZW50O1xuXHRcdFx0fVxuXHRcdH0pLmpvaW4oXCJcIik7XG5cdH07XG5cblx0Ly8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3Rcblx0bGlzdC5pID0gZnVuY3Rpb24obW9kdWxlcywgbWVkaWFRdWVyeSkge1xuXHRcdGlmKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKVxuXHRcdFx0bW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgXCJcIl1dO1xuXHRcdHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpZCA9IHRoaXNbaV1bMF07XG5cdFx0XHRpZih0eXBlb2YgaWQgPT09IFwibnVtYmVyXCIpXG5cdFx0XHRcdGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcblx0XHR9XG5cdFx0Zm9yKGkgPSAwOyBpIDwgbW9kdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGl0ZW0gPSBtb2R1bGVzW2ldO1xuXHRcdFx0Ly8gc2tpcCBhbHJlYWR5IGltcG9ydGVkIG1vZHVsZVxuXHRcdFx0Ly8gdGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBub3QgMTAwJSBwZXJmZWN0IGZvciB3ZWlyZCBtZWRpYSBxdWVyeSBjb21iaW5hdGlvbnNcblx0XHRcdC8vICB3aGVuIGEgbW9kdWxlIGlzIGltcG9ydGVkIG11bHRpcGxlIHRpbWVzIHdpdGggZGlmZmVyZW50IG1lZGlhIHF1ZXJpZXMuXG5cdFx0XHQvLyAgSSBob3BlIHRoaXMgd2lsbCBuZXZlciBvY2N1ciAoSGV5IHRoaXMgd2F5IHdlIGhhdmUgc21hbGxlciBidW5kbGVzKVxuXHRcdFx0aWYodHlwZW9mIGl0ZW1bMF0gIT09IFwibnVtYmVyXCIgfHwgIWFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcblx0XHRcdFx0aWYobWVkaWFRdWVyeSAmJiAhaXRlbVsyXSkge1xuXHRcdFx0XHRcdGl0ZW1bMl0gPSBtZWRpYVF1ZXJ5O1xuXHRcdFx0XHR9IGVsc2UgaWYobWVkaWFRdWVyeSkge1xuXHRcdFx0XHRcdGl0ZW1bMl0gPSBcIihcIiArIGl0ZW1bMl0gKyBcIikgYW5kIChcIiArIG1lZGlhUXVlcnkgKyBcIilcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRsaXN0LnB1c2goaXRlbSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHRyZXR1cm4gbGlzdDtcbn07XG5cbmZ1bmN0aW9uIGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKSB7XG5cdHZhciBjb250ZW50ID0gaXRlbVsxXSB8fCAnJztcblx0dmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXHRpZiAoIWNzc01hcHBpbmcpIHtcblx0XHRyZXR1cm4gY29udGVudDtcblx0fVxuXG5cdGlmICh1c2VTb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcblx0XHR2YXIgc291cmNlTWFwcGluZyA9IHRvQ29tbWVudChjc3NNYXBwaW5nKTtcblx0XHR2YXIgc291cmNlVVJMcyA9IGNzc01hcHBpbmcuc291cmNlcy5tYXAoZnVuY3Rpb24gKHNvdXJjZSkge1xuXHRcdFx0cmV0dXJuICcvKiMgc291cmNlVVJMPScgKyBjc3NNYXBwaW5nLnNvdXJjZVJvb3QgKyBzb3VyY2UgKyAnICovJ1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbignXFxuJyk7XG5cdH1cblxuXHRyZXR1cm4gW2NvbnRlbnRdLmpvaW4oJ1xcbicpO1xufVxuXG4vLyBBZGFwdGVkIGZyb20gY29udmVydC1zb3VyY2UtbWFwIChNSVQpXG5mdW5jdGlvbiB0b0NvbW1lbnQoc291cmNlTWFwKSB7XG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuXHR2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKTtcblx0dmFyIGRhdGEgPSAnc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsJyArIGJhc2U2NDtcblxuXHRyZXR1cm4gJy8qIyAnICsgZGF0YSArICcgKi8nO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXG4vLyBtb2R1bGUgaWQgPSAyODdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gU3BlbGwgXCJwYXJzZXJcIiBjbGFzcy5cbi8vXG5cbi8vIFRPRE86IGRlcGVuZGVuY3ktaW5qZWN0IHRva2VuaXplcj9cbmltcG9ydCBUb2tlbml6ZXIgZnJvbSBcIi4vVG9rZW5pemVyLmpzXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi9SdWxlLmpzXCI7XG5pbXBvcnQgcGFyc2VSdWxlIGZyb20gXCIuL1J1bGVTeW50YXguanNcIjtcbmltcG9ydCB7IGNsb25lQ2xhc3MgfSBmcm9tIFwiLi91dGlscy9jbGFzcy5qc1wiO1xuXG4vLyBHUlJSLi4uIHdpbGwgU09NRU9ORSBvbiB0aGUgbm9kZSB0ZWFtIHBsZWFzZSBpbXBsZW1lbnQgY29uc29sZS5ncm91cCA/Pz9cbmlmICghY29uc29sZS5ncm91cCkgY29uc29sZS5ncm91cCA9IGNvbnNvbGUubG9nO1xuaWYgKCFjb25zb2xlLmdyb3VwRW5kKSBjb25zb2xlLmdyb3VwRW5kID0gY29uc29sZS5sb2c7XG5cbi8vIEVycm9yIHdlJ2xsIHRocm93IGZvciBwcm9ibGVtcyB3aGVuIHBhcnNpbmcuXG4vLyBVc2VzIGEgc3BlY2lmaWMgdHlwZSBzbyB3ZSBjYW4gY2hlY2sgZm9yIGl0IGluIHRlc3RzLlxuZXhwb3J0IGZ1bmN0aW9uIFBhcnNlRXJyb3IoLi4uYXJncykge1xuICBFcnJvci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBQYXJzZUVycm9yKTtcbn1cblBhcnNlRXJyb3IucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlciB7XG5cdC8vIFNldCB0byBgdHJ1ZWAgdG8gb3V0cHV0IGRlYnVnIGluZm8gd2hpbGUgYWRkaW5nIHJ1bGVzXG5cdHN0YXRpYyBERUJVRyA9IGZhbHNlO1xuXG5cdC8vIFNob3VsZCB3ZSB3YXJuIGFib3V0IGFub21hbG91cyBjb25kaXRpb25zP1xuXHRzdGF0aWMgV0FSTiA9IGZhbHNlO1xuXG5cdC8vIFNldCB0byBgdHJ1ZWAgdG8gb3V0cHV0IHRpbWluZyBpbmZvLlxuXHRzdGF0aWMgVElNRSA9IGZhbHNlO1xuXG4gIC8vIEFkZCB0byBQYXJzZXIgY29uc29sZSBkZWJ1Z2dpbmdcbiAgc3RhdGljIFBhcnNlRXJyb3IgPSBQYXJzZUVycm9yO1xuXG5cdC8vIENvbnN0cnVjdG9yLlxuXHRjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzKSB7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBwcm9wZXJ0aWVzKTtcblx0fVxuXG4vL1xuLy8jIyMgUGFyc2luZ1xuLy9cblx0Ly8gUGFyc2UgYHJ1bGVOYW1lYCBydWxlIGF0IGhlYWQgb2YgYHRleHRgLlxuXHQvLyBJZiB5b3UgcGFzcyBvbmx5IG9uZSBhcmd1bWVudCwgd2UnbGwgYXNzdW1lIHRoYXQncyBgdGV4dGAgYW5kIHlvdSB3YW50IHRvIG1hdGNoIGBzdGF0ZW1lbnRzYC5cblx0Ly8gSGFuZGxlcyBvcHRpb25hbCBhbmQgcmVwZWF0aW5nIHJ1bGVzIGFzIHdlbGwgYXMgZWF0aW5nIHdoaXRlc3BhY2UuXG5cdC8vIFJldHVybnMgcmVzdWx0IG9mIHBhcnNlLlxuLy9URVNUTUVcblx0cGFyc2UocnVsZU5hbWUsIHRleHQpIHtcblx0XHQvLyBJZiBvbmx5IG9uZSBhcmd1bWVudCwgYXNzdW1lIHRoYXQncyB0aGUgdGV4dCBhbmQgcGFyc2UgYHN0YXRlbWVudHNgXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHRleHQgPSBydWxlTmFtZTtcblx0XHRcdHJ1bGVOYW1lID0gXCJzdGF0ZW1lbnRzXCI7XG5cdFx0fVxuXG5cdFx0Ly8gQ29udmVydCB0byB0b2tlbnMuXG5cdFx0aWYgKFBhcnNlci5USU1FKSBjb25zb2xlLnRpbWUoXCJ0b2tlbml6ZVwiKTtcblx0XHRsZXQgdG9rZW5zID0gVG9rZW5pemVyLnRva2VuaXplKHRleHQpO1xuXHRcdC8vIGVhdCBub24taW5kZW50IHdoaXRlc3BhY2UgKHNpbmNlIHdlIGlnbm9yZSBpdClcblx0XHR0b2tlbnMgPSB0b2tlbnMuZmlsdGVyKHRva2VuID0+ICFUb2tlbml6ZXIuaXNOb3JtYWxXaGl0ZXNwYWNlKHRva2VuKSk7XG5cdFx0aWYgKFBhcnNlci5USU1FKSBjb25zb2xlLnRpbWVFbmQoXCJ0b2tlbml6ZVwiKTtcblxuXHRcdC8vIEJhaWwgaWYgd2UgZGlkbid0IGdldCBhbnkgdG9rZW5zIGJhY2suXG5cdFx0aWYgKCF0b2tlbnMgfHwgdG9rZW5zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGlmIChQYXJzZXIuVElNRSkgY29uc29sZS50aW1lKFwicGFyc2VcIik7XG5cdFx0Ly8gSWYgd2UncmUgbm90IHBhcnNpbmcgYHN0YXRlbWVudHNgLCBlYXQgd2hpdGVzcGFjZSBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lLlxuXHRcdGlmIChydWxlTmFtZSAhPT0gXCJzdGF0ZW1lbnRzXCIpIHtcblx0XHRcdHRva2VucyA9IFRva2VuaXplci5yZW1vdmVMZWFkaW5nV2hpdGVzcGFjZSh0b2tlbnMpO1xuXHRcdH1cblxuXHRcdC8vIFBhcnNlIHRoZSBydWxlIG9yIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBydWxlIG5vdCBmb3VuZC5cblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5wYXJzZU5hbWVkUnVsZShydWxlTmFtZSwgdG9rZW5zLCAwLCB0b2tlbnMubGVuZ3RoLCB1bmRlZmluZWQsIFwicGFyc2VyLnBhcnNlKClcIik7XG5cdFx0aWYgKFBhcnNlci5USU1FKSBjb25zb2xlLnRpbWVFbmQoXCJwYXJzZVwiKTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblxuXG5cdC8vIFBhcnNlIGB0ZXh0YCBhbmQgcmV0dXJuIHRoZSByZXN1bHRpbmcgc291cmNlIGNvZGUuXG5cdC8vXHQtIGlmIG9uZSBzdHJpbmcgYXJndW1lbnQsIGNvbXBpbGVzIGFzIFwic3RhdGVtZW50c1wiXG5cdC8vIFRocm93cyBpZiBub3QgcGFyc2VhYmxlLlxuLy9URVNUTUVcblx0Y29tcGlsZShydWxlTmFtZSwgdGV4dCkge1xuXHRcdC8vIElmIG9ubHkgb25lIGFyZ3VtZW50LCBhc3N1bWUgdGhhdCdzIHRoZSB0ZXh0IGFuZCBwYXJzZSBgc3RhdGVtZW50c2Bcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0dGV4dCA9IHJ1bGVOYW1lO1xuXHRcdFx0cnVsZU5hbWUgPSBcInN0YXRlbWVudHNcIjtcblx0XHR9XG5cdFx0bGV0IHJlc3VsdCA9IHRoaXMucGFyc2UocnVsZU5hbWUsIHRleHQpO1xuXHRcdGlmICghcmVzdWx0KSB7XG5cdFx0ICB0aHJvdyBuZXcgUGFyc2VFcnJvcihgcGFyc2VyLnBhcnNlKCcke3J1bGVOYW1lfScsICcke3RleHR9Jyk6IGNhbid0IHBhcnNlIHRleHRgKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdC50b1NvdXJjZSh0aGlzKTtcblx0fVxuXG5cblx0Ly8gUGFyc2UgYSBuYW1lZCBydWxlIChkZWZpbmVkIGluIHRoaXMgcGFyc2VyIG9yIGluIGFueSBvZiBvdXIgYGltcG9ydHNgKSwgcmV0dXJuaW5nIHRoZSBcImJlc3RcIiBtYXRjaC5cblx0Ly8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBubyBtYXRjaC5cblx0Ly8gVGhyb3dzIGlmIHJ1bGUgaXMgbm90IGltcGxlbWVudGVkLlxuXHRwYXJzZU5hbWVkUnVsZShydWxlTmFtZSwgdG9rZW5zLCBzdGFydCwgZW5kLCBzdGFjaywgY2FsbGluZ0NvbnRleHQgPSBcInBhcnNlTmFtZWRSdWxlXCIpIHtcbiAgICBjb25zdCBydWxlID0gdGhpcy5ydWxlc1tydWxlTmFtZV07XG5cdFx0aWYgKCFydWxlKSB0aHJvdyBuZXcgUGFyc2VFcnJvcihgJHtjYWxsaW5nQ29udGV4dH06IHJ1bGUgJyR7cnVsZU5hbWV9JyBub3QgZm91bmRgKTtcbiAgICByZXR1cm4gcnVsZS5wYXJzZSh0aGlzLCB0b2tlbnMsIHN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0fVxuXG5cdC8vIFRlc3Qgd2hldGhlciBhIHJ1bGUgKHdoaWNoIG1heSBiZSBzcGVjaWZpZWQgYnkgbmFtZSkgTUlHSFQgYmUgZm91bmQgaW4gaGVhZCBvZiBzdHJlYW0uXG5cdC8vIFJldHVybnM6XG5cdC8vXHQtIGB0cnVlYCBpZiB0aGUgcnVsZSBNSUdIVCBiZSBtYXRjaGVkLlxuXHQvL1x0LSBgZmFsc2VgIGlmIHRoZXJlIGlzIE5PIFdBWSB0aGUgcnVsZSBjYW4gYmUgbWF0Y2hlZC5cblx0Ly9cdC0gYHVuZGVmaW5lZGAgaWYgbm90IGRldGVybWluc3RpYyAoZWc6IG5vIHdheSB0byB0ZWxsIHF1aWNrbHkpLlxuXHR0ZXN0KHJ1bGUsIHRva2Vucywgc3RhcnQsIGVuZCkge1xuXHQgIGlmICh0eXBlb2YgcnVsZSA9PT0gXCJzdHJpbmdcIikge1xuXHQgICAgcnVsZSA9IHRoaXMucnVsZXNbcnVsZV07XG5cdCAgICBpZiAoIXJ1bGUpIHJldHVybiB1bmRlZmluZWQ7ICAgIC8vIFRPRE86IHRocm93P1xuXHQgIH1cblx0ICByZXR1cm4gcnVsZS50ZXN0KHRoaXMsIHRva2Vucywgc3RhcnQsIGVuZCk7XG5cdH1cblxuXG4vL1xuLy8gIyMjIFx0SW1wb3J0c1xuLy9cdFx0UGFyc2VycyBjYW4gZGVwZW5kIG9uIG90aGVyIHBhcnNlcnMgZm9yIGFkZGl0aW9uYWwgYHJ1bGVzYC5cbi8vXHRcdEltcG9ydHMgYXJlIGxhenktYm91bmQgaW50byBgcGFyc2VyLnJ1bGVzYCBhcyBuZWNlc3NhcnkuXG4vLyAgICBXZSBhc3N1bWUgdGhlIHRvcC1sZXZlbCBwYXJzZXIgZm9yIGEgbGFuZ3VhZ2Ugd2lsbCBpbmNsdWRlIGFsbCBuZWNlc3NhcnkgaW1wb3J0cyBhdXRvbWF0aWNhbGx5LlxuLy9cblxuXHQvLyBBZGQgb25lIG9yIG1vcmUgbmFtZWQgaW1wb3J0cyB0byB0aGlzIHBhcnNlci5cblx0Ly8gSW1wb3J0cyBpbmNyZWFzZSBpbiBwcmlvcml0eSB0aGUgbGF0ZXIgdGhleSBhcmUgaW4gdGhlIGxpc3QuXG4gIGltcG9ydHMgPSBbXTtcblx0aW1wb3J0KC4uLmltcG9ydHMpIHtcblx0XHQvLyBSRVZFUlNFIHRoZSBsaXN0IG9mIGltcG9ydHMsIHNvIHRoZSBtb3N0IGdlbmVyYWwgb25lIGlzIExBU1Rcblx0XHQvLyBUaHVzIG1vcmUgc3BlY2lmaWMgaW1wb3J0cyB3aWxsIGJlIEVBUkxJRVIgaW4gdGhlIGBpbXBvcnRzYCBsaXN0LlxuXG5cdFx0Ly8gQ3JlYXRlIG5ldyBhcnJheSBvZiBpbXBvcnRzIGFuZCBhZGQgaW1wb3J0IG5hbWVzIHBhc3NlZCBpbi5cblx0XHR0aGlzLmltcG9ydHMgPSBpbXBvcnRzLnJldmVyc2UoKS5jb25jYXQodGhpcy5pbXBvcnRzKTtcblxuXHRcdC8vIGNsZWFyIGNvbmNhdGVuYXRlZCBsaXN0IG9mIHJ1bGVzIHNvIHdlJ2xsIHJlY2FjdWxhdGUgaW4gYHBhcnNlci5ydWxlc2Bcblx0XHRkZWxldGUgdGhpcy5fX3J1bGVzO1xuXHR9XG5cbi8vXG4vLyAjIyMgUnVsZXNcbi8vICAgIExpc3Qgb2YgYWxsIGtub3duIHJ1bGVzIGZvciB0aGlzIHBhcnNlci5cbi8vICAgIFlvdSBjYW4gYWNjZXNzIG5hbWVkIHJ1bGVzIGFzIGBwYXJzZXIucnVsZXNbXCJydWxlTmFtZVwiXWBcbi8vXG5cdC8vIFN0YXJ0IHdpdGggYW4gZW1wdHkgbWFwIG9mIHJ1bGVzLlxuXHRfcnVsZXMgPSB7fTtcblxuXHQvLyBSZXR1cm4gbWFwIG9mIGFsbCBrbm93biBydWxlcyBieSBydWxlIG5hbWUsIGluY2x1ZGluZyBydWxlcyBkZWZpbmVkIGluIG91ciBpbXBvcnRzLlxuXHQvLyBOT1RFOiBXZSBtZW1vaXplIHRoaXMsIHNvIG1ha2Ugc3VyZSB0byBjbGVhciBgX19ydWxlc2AgaWYgeW91J3JlIG1hbmlwdWxhdGluZyBydWxlcyBvciBpbXBvcnRzIVxuXHRnZXQgcnVsZXMoKSB7XG5cdFx0aWYgKCF0aGlzLl9fcnVsZXMpIHtcblx0XHRcdGNvbnN0IG91dHB1dCA9IHRoaXMuX19ydWxlcyA9IHt9O1xuXHRcdFx0Ly8gR2V0IGFsbCBpbXBvcnRlZCBwYXJzZXJzLCB3aXRoIHVzIGxhc3Rcblx0XHRcdGNvbnN0IGltcG9ydHMgPSBbdGhpc10uY29uY2F0KHRoaXMuaW1wb3J0cy5tYXAoUGFyc2VyLmZvck5hbWUpKTtcblxuXHRcdFx0Ly8gRm9yIGVhY2ggcGFyc2VyXG5cdFx0XHRpbXBvcnRzLmZvckVhY2gocGFyc2VyID0+IHtcblx0XHRcdFx0Zm9yIChjb25zdCBydWxlTmFtZSBpbiBwYXJzZXIuX3J1bGVzKSB7XG5cdFx0XHRcdCAgdGhpcy5fbWVyZ2VSdWxlKG91dHB1dCwgcnVsZU5hbWUsIHBhcnNlci5fcnVsZXNbcnVsZU5hbWVdKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9fcnVsZXM7XG5cdH1cblxuICAvLyBNZXJnZSBgcnVsZWAgaW50byBgbWFwYCBvZiBydWxlcyBieSBgcnVsZU5hbWVgLlxuICAvLyBJZiB3ZSBhbHJlYWR5IGhhdmUgYSBydWxlIHdpdGggdGhhdCBuYW1lLCB3ZSdsbCBhZGQgaXQgYXMgYW4gYWx0ZXJuYXRpdmUuXG4vL1RFU1RNRVxuICBfbWVyZ2VSdWxlKG1hcCwgcnVsZU5hbWUsIHJ1bGUpIHtcbiAgICBsZXQgZXhpc3RpbmcgPSBtYXBbcnVsZU5hbWVdO1xuICAgIGlmICghZXhpc3RpbmcpIHtcbiAgICAgIG1hcFtydWxlTmFtZV0gPSBydWxlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghKGV4aXN0aW5nIGluc3RhbmNlb2YgUnVsZS5BbHRlcm5hdGl2ZXMpIHx8IChleGlzdGluZy5ncm91cCAhPT0gcnVsZU5hbWUpKSB7XG4gICAgICBjb25zdCBhbHRDb25zdHJ1Y3RvciA9IGNsb25lQ2xhc3MoUnVsZS5BbHRlcm5hdGl2ZXMsIHJ1bGVOYW1lKTtcbiAgICAgIGV4aXN0aW5nID0gbWFwW3J1bGVOYW1lXSA9IG5ldyBhbHRDb25zdHJ1Y3Rvcih7XG4gICAgICAgIGdyb3VwOiBydWxlTmFtZSxcbiAgICAgICAgcnVsZXM6IFsgZXhpc3RpbmcgXVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHJ1bGUgaW5zdGFuY2VvZiBSdWxlLkFsdGVybmF0aXZlcyAmJiAocnVsZS5ncm91cCA9PT0gcnVsZU5hbWUpKSB7XG4gICAgICBleGlzdGluZy5hZGRSdWxlKC4uLnJ1bGUucnVsZXMpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGV4aXN0aW5nLmFkZFJ1bGUocnVsZSk7XG4gICAgfVxuICB9XG5cblx0Ly8gQWRkIGEgYHJ1bGVgIHRvIG91ciBsaXN0IG9mIHJ1bGVzIVxuXHQvLyBDb252ZXJ0cyB0byBgYWx0ZXJuYXRpdmVzYCBvbiByZS1kZWZpbmluZyB0aGUgc2FtZSBydWxlLlxuXHRhZGRSdWxlKHJ1bGVOYW1lLCBydWxlKSB7XG5cdFx0Ly8gQ2xlYXIgbWVtb2l6ZWQgYF9fcnVsZXNgIHNvIHdlJ2xsIHJlY2FsY3VsYXRlIGBwYXJzZXIucnVsZXNgIGFzIG5lY2Vzc2FyeVxuXHRcdGRlbGV0ZSB0aGlzLl9fcnVsZXM7XG5cblx0XHQvLyBJZiBwYXNzZWQgYSBmdW5jdGlvbiwgY3JlYXRlIGFuIGluc3RhbmNlIGZvciB0aGUgYWN0dWFsIHJ1bGUuXG5cdFx0Ly8gVGhpcyBpcyBjb21tb25seSBkb25lIHNvIEpTIHdpbGwgZ2l2ZSB1cyBtZWFuaW5nZnVsIGNsYXNzIG5hbWVzIGluIGRlYnVnIG91dHB1dC5cblx0XHRpZiAodHlwZW9mIHJ1bGUgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0cnVsZSA9IG5ldyBydWxlKCk7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgd2UgZ290IGFuIGFycmF5IG9mIGBydWxlTmFtZWBzLCByZWN1cnNpdmVseSBhZGQgdW5kZXIgZWFjaCBuYW1lIHdpdGggdGhlIHNhbWUgYHJ1bGVgLlxuXHRcdGlmIChBcnJheS5pc0FycmF5KHJ1bGVOYW1lKSkge1xuXHRcdFx0cnVsZU5hbWUuZm9yRWFjaChydWxlTmFtZSA9PiB0aGlzLmFkZFJ1bGUocnVsZU5hbWUsIHJ1bGUpICk7XG5cdFx0XHRyZXR1cm4gcnVsZTtcblx0XHR9XG5cblx0XHQvLyBBZGQgdG8gb3VyIGxpc3Qgb2YgX3J1bGVzXG5cdFx0dGhpcy5fbWVyZ2VSdWxlKHRoaXMuX3J1bGVzLCBydWxlTmFtZSwgcnVsZSk7XG5cdFx0cmV0dXJuIHJ1bGU7XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIGNvbmNhdGVuYXRlZCBibGFja2xpc3QgZm9yIGEgZ2l2ZW4gbmFtZWQgcnVsZS5cblx0Z2V0QmxhY2tsaXN0KHJ1bGVOYW1lKSB7XG5cdCAgY29uc3QgcnVsZSA9IHRoaXMucnVsZXNbcnVsZU5hbWVdO1xuXHQgIGNvbnN0IHJ1bGVzID0gcnVsZSBpbnN0YW5jZW9mIFJ1bGUuQWx0ZXJuYXRpdmVzXG4gICAgICAgICAgPyBydWxlLnJ1bGVzXG4gICAgICAgICAgOiBbIHJ1bGUgXTtcblx0XHRyZXR1cm4gcnVsZXMucmVkdWNlKGZ1bmN0aW9uIChibGFja2xpc3QsIHJ1bGUpIHtcblx0XHRcdHJldHVybiBPYmplY3QuYXNzaWduKGJsYWNrbGlzdCwgcnVsZS5ibGFja2xpc3QpO1xuXHRcdH0sIHt9KTtcblx0fVxuXG4gIC8vIERlZmluZSBtdWx0aXBsZSBydWxlcyBhdCBvbmNlIHVzaW5nIHJ1bGVTeW50YXguXG4gIC8vIFNlZSBgUnVsZVN5bnRheC5qczo6ZGVmaW5lUnVsZSgpYFxuICBkZWZpbmVSdWxlcygpIHtcbiAgICBmb3IgKGNvbnN0IHJ1bGUgb2YgYXJndW1lbnRzKSB7XG4gICAgICB0aGlzLmRlZmluZVJ1bGUocnVsZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gRGVmaW5lIGEgcnVsZSB1c2luZyAocnVsZSlgc3ludGF4YCBvciBgcGF0dGVybnNgIHRvIGNyZWF0ZSB0aGUgcnVsZSBpbnN0YW5jZXMuXG4gIC8vICBgbmFtZWAgKGlkZW50aWZpZXIsIHJlcXVpcmVkKSAgQmFzZSBuYW1lIG9mIHRoZSBydWxlLlxuICAvLyAgYGFsaWFzYCAoc3RyaW5nIG9yIFtzdHJpbmddLCBvcHRpbmFsKSBPdGhlciBuYW1lcyB0byBkZWZpbmUgcnVsZSB1bmRlci5cbiAgLy8gIGBjYW5vbmljYWxgIChzdHJpbmcsIG9wdGlvbmFsKSBDYW5vbmljYWwgbmFtZSBmb3IgdGhlIHJ1bGUsIGF2YWlsYWJsZSBvbiBgUnVsZWAgZm9yIGRlYnVnZ2luZy5cbiAgLy8gIGBjb25zdHJ1Y3RvcmAgKGNsYXNzLCByZXF1aXJlZCkgQ2xhc3Mgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIGluc3RhbnRpYXRlIHRoZSBydWxlLlxuICAvLyAgYHN5bnRheGAgKHN0cmluZywgcmVxdWlyZWQpIFJ1bGVTeW50YXggc3RyaW5nIGZvciB0aGlzIHJ1bGUuXG4gIC8vICBgcGF0dGVybmAgKFJlZ0V4cCwgb3B0aW9uYWwpIFJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgYFBhdHRlcm5gIHJ1bGVzXG4gIC8vICBgcHJlY2VkZW5jZWAgKG51bWJlciwgb3B0aW9uYWwpIFByZWNlZGVuY2UgbnVtYmVyIGZvciB0aGUgcnVsZSAoY3VycmVudGx5IGRvZXNuJ3QgZG8gYW55dGhpbmcpXG4gIC8vICBgYmxhY2tsaXN0YCAoW3N0cmluZ10sIG9wdGlvbmFsKSBBcnJheSBvZiBzdHJpbmdzIGFzIGJsYWNrbGlzdCBmb3IgcGF0dGVybiBydWxlcy5cbiAgLy8gIGBsZWZ0UmVjdXJzaXZlJyAoYm9vbGVhbiwgb3B0aW9uYWwpIFNldCB0byBgdHJ1ZWAgaWYgdGhlIHJ1bGUgaXMgbGVmdC1yZWN1cnNpdmUsXG4gIC8vICAgIGkuZS4gaXQgY2FsbHMgaXRzZWxmIGFzIGEgc3VicnVsZSBiZWZvcmUgbWF0Y2hpbmcgYW55IGxpdGVyYWwgdG9rZW5zXG4gIC8vICBgdGVzdFJ1bGVgIChSdWxlIG9yIHN0cmluZywgb3B0aW9uYWwpIFJ1bGUgb3IgcnVsZSBuYW1lIHRvIHVzZSBhcyBhIHRlc3QgcnVsZVxuICAvLyAgICBzcGVjaWZ5aW5nIHRoaXMgY2FuIGxldCB1cyBqdW1wIG91dCBxdWlja2x5IGlmIHRoZXJlIGlzIG5vIHBvc3NpYmxlIG1hdGNoXG4gIC8vXG4gIC8vIE5vdGUgdGhhdCB3ZSBtdW5nZSB0aGUgYGNvbnN0cnVjdG9yYCBwYXNzZWQgaW4gZm9yIGVmZmljaWVuY3kgd2hpbGUgcGFyc2luZy5cbiAgZGVmaW5lUnVsZSh7IGNvbnN0cnVjdG9yLCAuLi5wcm9wcyB9KSB7XG4gICAgLy8gdGhyb3cgaWYgcmVxdWlyZWQgcGFyYW1zIG5vdCBwcm92aWRlZFxuICAgIGlmICghY29uc3RydWN0b3IgfHwgIXByb3BzLm5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYHBhcnNlci5kZWZpbmUoKTogWW91IG11c3QgcGFzcyAnY29uc3RydWN0b3InIGFuZCAnbmFtZSdgKTtcbiAgICB9XG4gICAgLy8gdGhyb3cgaWYgd2UncmUgcmUtdXNpbmcgYSBjb25zdHJ1Y3RvclxuICAgIGlmIChjb25zdHJ1Y3Rvci5wcm90b3R5cGUubmFtZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgcGFyc2VyLmRlZmluZSgpOiBBdHRlbXB0aW5nIHRvIHJlLXVzZSBjb25zdHJ1Y3RvciBmb3IgcnVsZSAnJHtydWxlTmFtZX0nYCk7XG4gICAgfVxuXG4gICAgLy8gSWYgd2UncmUgYSBcImNhbm9uaWNhbFwiIHJ1bGUsIHNldCBvbiBSdWxlLlxuICAgIC8vIFVzZSB0aGlzIGlmIHlvdSB3YW50IHRvIGNoZWNrIHRoZSB0eXBlIG9mIGEgcnVsZSBpbiBhIHRlc3Qgb3Igc29tZXRoaW5nLlxuICAgIGlmIChwcm9wcy5jYW5vbmljYWwpIFJ1bGVbcHJvcHMuY2Fub25pY2FsXSA9IGNvbnN0cnVjdG9yO1xuXG4gICAgLy8gQ29udmVydCBibGFja2xpc3QgZnJvbSBsaXN0IG9mIHN0cmluZ3MgdG8gYSBtYXBcbiAgICBpZiAocHJvcHMuYmxhY2tsaXN0ICYmIEFycmF5LmlzQXJyYXkocHJvcHMuYmxhY2tsaXN0KSkge1xuICAgICAgY29uc3QgbWFwID0ge307XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBwcm9wcy5ibGFja2xpc3QpIG1hcFtrZXldID0gdHJ1ZTtcbiAgICAgIHByb3BzLmJsYWNrbGlzdCA9IG1hcDtcbiAgICB9XG5cbiAgICAvLyBBZGQgcHJvcHMgdG8gdGhlIGNvbnRydWN0b3IgcHJvdG95cGUgbm9uLWVudW1lcmFibHkgYW5kIG5vbi13cml0YWJseVxuICAgIC8vICBzbyB3ZSdsbCBnZXQgYW4gZXJyb3IgaWYgc29tZXRoaW5nIHRyaWVzIHRvIG92ZXJ3cml0ZSB0aGVtLlxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHByb3BzKSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLnByb3RvdHlwZSwga2V5LCB7IHZhbHVlOiBwcm9wc1trZXldIH0pO1xuICAgIH1cblxuICAgIC8vIEluc3RhbnRpYXRlIHRoZSBydWxlLlxuICAgIGNvbnN0IHJ1bGUgPSBwcm9wcy5zeW50YXhcbiAgICAgID8gcGFyc2VSdWxlKHByb3BzLnN5bnRheCwgY29uc3RydWN0b3IpXG4gICAgICA6IG5ldyBjb25zdHJ1Y3RvcigpO1xuXG4gICAgLy8gQ29tYmluZSBhbGlhc2VzIHdpdGggdGhlIG1haW4gbmFtZVxuICAgIGNvbnN0IG5hbWVzID0gW3Byb3BzLm5hbWVdLmNvbmNhdChwcm9wcy5hbGlhcyB8fCBbXSk7XG4gICAgLy8gbm90ZSBpZiB3ZSBoYXZlIHRlc3RzIHNvIHdlIGNhbiBzZWxlY3QgdGhpcyBjb21wb25lbnQgZWFzaWx5XG4gICAgaWYgKHByb3BzLnRlc3RzKSBuYW1lcy5wdXNoKFwiX3Rlc3RhYmxlX1wiKTtcblxuICAgIHRoaXMuYWRkUnVsZShuYW1lcywgcnVsZSk7XG4gIH1cblxuXG4vL1xuLy8gIyMjIFBhcnNlciByZWdpc3RyeS5cbi8vXG5cdHN0YXRpYyBSRUdJU1RSWSA9IHt9O1xuXG5cdC8vIEdldCBhIHBhcnNlciBmb3IgYSBnaXZlbiBgY29udGV4dE5hbWVgLlxuXHQvLyBXaWxsIHJlLXVzZSBleGlzdGluZyBwYXJzZXIsIG9yIGNyZWF0ZSBhIG5ldyBvbmUgaWYgbm90IGFscmVhZHkgZGVmaW5lZC5cblx0c3RhdGljIGZvck5hbWUobmFtZSkge1xuXHRcdGlmICghUGFyc2VyLlJFR0lTVFJZW25hbWVdKSB7XG5cdFx0XHRQYXJzZXIuUkVHSVNUUllbbmFtZV0gPSBuZXcgUGFyc2VyKHsgbmFtZSB9KTtcblx0XHR9XG5cdFx0cmV0dXJuIFBhcnNlci5SRUdJU1RSWVtuYW1lXTtcblx0fVxuXG5cbi8vXG4vLyAjIyBVdGlsaXR5IG1ldGhvZHNcbi8vXG5cblx0Ly8gRmluZCB0aGUgbWF0Y2hpbmcgaW5zdGFuY2Ugb2YgKHBvc3NpYmx5IG5lc3RlZCkgYGVuZFRva2VuYCB0byBiYWxhbmNlIGBzdGFydFRva2VuYFxuXHQvL1x0aW4gYXJyYXkgb2YgYHRva2Vuc2AgKHN0cmluZ3MpLlxuXHQvLyBJZiBzdWNjZXNzZnVsLCByZXR1cm5zIGB7IHN0YXJ0LCBlbmQsIHNsaWNlIH1gXG5cdC8vIFRocm93cyBpZiB1bnN1Y2Vzc2Z1bC5cblx0c3RhdGljIGZpbmROZXN0ZWRUb2tlbnModG9rZW5zLCBzdGFydFRva2VuLCBlbmRUb2tlbiwgc3RhcnQgPSAwKSB7XG5cdFx0aWYgKHRva2Vuc1tzdGFydF0gIT09IHN0YXJ0VG9rZW4pIHRocm93IG5ldyBQYXJzZUVycm9yKGBFeHBlY3RlZCAnJHtzdGFydFRva2VufScgYXQgaW5kZXggJHtzdGFydH0gb2YgdG9rZW5zYCk7XG5cdFx0bGV0IG5lc3RpbmcgPSAwO1xuXHRcdGxldCBuZXN0ZWQgPSBmYWxzZTtcblx0XHRmb3IgKGxldCBlbmQgPSBzdGFydCArIDEsIGxhc3RJbmRleCA9IHRva2Vucy5sZW5ndGg7IGVuZCA8IGxhc3RJbmRleDsgZW5kKyspIHtcblx0XHRcdGxldCB0b2tlbiA9IHRva2Vuc1tlbmRdO1xuXHRcdFx0aWYgKHRva2VuID09PSBzdGFydFRva2VuKSB7XG5cdFx0XHRcdG5lc3RpbmcrKztcblx0XHRcdFx0bmVzdGVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGlmICh0b2tlbiA9PT0gZW5kVG9rZW4pIHtcblx0XHRcdFx0aWYgKG5lc3RpbmcgPT09IDApXG5cdFx0XHRcdFx0cmV0dXJuIHsgc3RhcnQsIGVuZCwgc2xpY2U6IHRva2Vucy5zbGljZShzdGFydCsxLCBlbmQpLCBuZXN0ZWQgfTtcblx0XHRcdFx0bmVzdGluZy0tO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aHJvdyBuZXcgUGFyc2VFcnJvcihgQ291bGRuJ3QgZmluZCBtYXRjaGluZyAnJHtlbmRUb2tlbn0ncyBzdGFydGluZyBhdCBpdGVtICR7c3RhcnR9YCk7XG5cdH1cbn1cblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1BhcnNlci5qcyIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgdmFyIFJFQUNUX0VMRU1FTlRfVFlQRSA9ICh0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmXG4gICAgU3ltYm9sLmZvciAmJlxuICAgIFN5bWJvbC5mb3IoJ3JlYWN0LmVsZW1lbnQnKSkgfHxcbiAgICAweGVhYzc7XG5cbiAgdmFyIGlzVmFsaWRFbGVtZW50ID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICBvYmplY3QgIT09IG51bGwgJiZcbiAgICAgIG9iamVjdC4kJHR5cGVvZiA9PT0gUkVBQ1RfRUxFTUVOVF9UWVBFO1xuICB9O1xuXG4gIC8vIEJ5IGV4cGxpY2l0bHkgdXNpbmcgYHByb3AtdHlwZXNgIHlvdSBhcmUgb3B0aW5nIGludG8gbmV3IGRldmVsb3BtZW50IGJlaGF2aW9yLlxuICAvLyBodHRwOi8vZmIubWUvcHJvcC10eXBlcy1pbi1wcm9kXG4gIHZhciB0aHJvd09uRGlyZWN0QWNjZXNzID0gdHJ1ZTtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2ZhY3RvcnlXaXRoVHlwZUNoZWNrZXJzJykoaXNWYWxpZEVsZW1lbnQsIHRocm93T25EaXJlY3RBY2Nlc3MpO1xufSBlbHNlIHtcbiAgLy8gQnkgZXhwbGljaXRseSB1c2luZyBgcHJvcC10eXBlc2AgeW91IGFyZSBvcHRpbmcgaW50byBuZXcgcHJvZHVjdGlvbiBiZWhhdmlvci5cbiAgLy8gaHR0cDovL2ZiLm1lL3Byb3AtdHlwZXMtaW4tcHJvZFxuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZmFjdG9yeVdpdGhUaHJvd2luZ1NoaW1zJykoKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9wcm9wLXR5cGVzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAzNThcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVzZS1iZWZvcmUtZGVmaW5lICovXG4vKipcbiAqIEBtb2R1bGUgZXZlbnRIYW5kbGVyc1xuICpcbiAqL1xuaW1wb3J0IGRvbUhlbHBlcnMgZnJvbSAnLi9saWIvZG9tX2hlbHBlcnMnO1xuaW1wb3J0IGxpc3RlbmVycyBmcm9tICcuL2xpYi9saXN0ZW5lcnMnO1xuaW1wb3J0ICogYXMgc3RvcmUgZnJvbSAnLi9zdG9yZSc7XG5cbi8qKlxuICogcHJpdmF0ZVxuICpcbiAqL1xuXG4vKipcbiAqIF9vbkNsaWNrXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgVGhlIGNsaWNrIGV2ZW50IG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50LnRhcmdldCBUaGUgRE9NIG5vZGUgZnJvbSB0aGUgY2xpY2sgZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9vbkNsaWNrKF9yZWYpIHtcbiAgdmFyIHRhcmdldCA9IF9yZWYudGFyZ2V0O1xuXG4gIHN0b3JlLmFjdGl2YXRlKFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoc3RvcmUuZ2V0SW5zdGFuY2VzKCkpKS5yZWR1Y2UoZG9tSGVscGVycy5maW5kQ29udGFpbmVyTm9kZXModGFyZ2V0KSwgW10pLnNvcnQoZG9tSGVscGVycy5zb3J0QnlET01Qb3NpdGlvbikubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uaW5zdGFuY2U7XG4gIH0pKTtcbn1cblxuLyoqXG4gKiBfb25LZXlEb3duOiBUaGUga2V5ZG93biBldmVudCBjYWxsYmFja1xuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IFRoZSBrZXlkb3duIGV2ZW50IG9iamVjdFxuICogQHBhcmFtIHtudW1iZXJ9IGV2ZW50LndoaWNoIFRoZSBrZXkgY29kZSAod2hpY2gpIHJlY2VpdmVkIGZyb20gdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9vbktleURvd24oZXZlbnQpIHtcbiAgdmFyIGZvcmNlQ29uc2lkZXIgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuXG4gIGlmIChmb3JjZUNvbnNpZGVyIHx8IF9zaG91bGRDb25zaWRlcihldmVudCkpIHtcbiAgICB2YXIgX3JlZjIgPSBzdG9yZS5maW5kQmluZGluZ0ZvckV2ZW50KGV2ZW50KSB8fCB7fSxcbiAgICAgICAgZm4gPSBfcmVmMi5mbixcbiAgICAgICAgaW5zdGFuY2UgPSBfcmVmMi5pbnN0YW5jZTtcblxuICAgIGlmIChmbikge1xuICAgICAgZm4uY2FsbChpbnN0YW5jZSwgZXZlbnQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBfc2hvdWxkQ29uc2lkZXI6IENvbmRpdGlvbnMgZm9yIHByb2NlZWRpbmcgd2l0aCBrZXkgZXZlbnQgaGFuZGxpbmdcbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCBUaGUga2V5ZG93biBldmVudCBvYmplY3RcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudC50YXJnZXQgVGhlIG5vZGUgb3JpZ2luIG9mIHRoZSBldmVudFxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0byBjb250aW51ZSBwcm9jZXNpbmcgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9zaG91bGRDb25zaWRlcihfcmVmMykge1xuICB2YXIgY3RybEtleSA9IF9yZWYzLmN0cmxLZXksXG4gICAgICB0YXJnZXQgPSBfcmVmMy50YXJnZXQ7XG5cbiAgcmV0dXJuIGN0cmxLZXkgfHwgIX5bJ0lOUFVUJywgJ1NFTEVDVCcsICdURVhUQVJFQSddLmluZGV4T2YodGFyZ2V0LnRhZ05hbWUpICYmICghdGFyZ2V0LmdldEF0dHJpYnV0ZSB8fCB0YXJnZXQuZ2V0QXR0cmlidXRlKCdyb2xlJykgIT09ICd0ZXh0Ym94Jyk7XG59XG5cbi8qKlxuICogcHVibGljXG4gKlxuICovXG5cbi8qKlxuICogb25Nb3VudFxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKi9cbmZ1bmN0aW9uIG9uTW91bnQoaW5zdGFuY2UpIHtcbiAgc3RvcmUuYWN0aXZhdGUoaW5zdGFuY2UpO1xuICBsaXN0ZW5lcnMuYmluZEtleXMoX29uS2V5RG93bik7XG4gIGxpc3RlbmVycy5iaW5kQ2xpY2tzKF9vbkNsaWNrKTtcbiAgZG9tSGVscGVycy5iaW5kRm9jdXNhYmxlcyhpbnN0YW5jZSwgc3RvcmUuYWN0aXZhdGUpO1xufVxuXG4vKipcbiAqIG9uVW5tb3VudFxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKi9cbmZ1bmN0aW9uIG9uVW5tb3VudChpbnN0YW5jZSkge1xuICBzdG9yZS5kZWxldGVJbnN0YW5jZShpbnN0YW5jZSk7XG4gIGlmIChzdG9yZS5pc0VtcHR5KCkpIHtcbiAgICBsaXN0ZW5lcnMudW5iaW5kQ2xpY2tzKF9vbkNsaWNrKTtcbiAgICBsaXN0ZW5lcnMudW5iaW5kS2V5cyhfb25LZXlEb3duKTtcbiAgfVxufVxuXG5leHBvcnQgeyBvbk1vdW50LCBvblVubW91bnQgfTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9ldmVudF9oYW5kbGVycy5qc1xuLy8gbW9kdWxlIGlkID0gMzgxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IG1vZGlmaWVycyBhcyBtb2RpZmllcktleXMsIEFMTF9LRVlTLCBBTExfUFJJTlRBQkxFX0tFWVMgfSBmcm9tICcuL2tleXMnO1xuXG52YXIgUFJJTlRBQkxFX0NIQVJBQ1RFUlMgPSAnMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVp+IUAjJCVeJiooKS1fKz1bXVxcXFx7fXw7XFwnOlwiLC4vPD4/wqMnO1xuXG52YXIgbW9kS2V5cyA9IE9iamVjdC5rZXlzKG1vZGlmaWVyS2V5cyk7XG5cbmZ1bmN0aW9uIG1hdGNoS2V5cyhfcmVmKSB7XG4gIHZhciBrZXlTZXQgPSBfcmVmLmtleVNldCxcbiAgICAgIGV2ZW50ID0gX3JlZi5ldmVudDtcbiAgdmFyIGtleSA9IGtleVNldC5rZXksXG4gICAgICBfa2V5U2V0JG1vZGlmaWVycyA9IGtleVNldC5tb2RpZmllcnMsXG4gICAgICBtb2RpZmllcnMgPSBfa2V5U2V0JG1vZGlmaWVycyA9PT0gdW5kZWZpbmVkID8gW10gOiBfa2V5U2V0JG1vZGlmaWVycztcblxuICB2YXIga2V5c01hdGNoID0gdm9pZCAwO1xuXG4gIGtleXNNYXRjaCA9IGtleSA9PT0gQUxMX0tFWVM7XG5cbiAgaWYgKGtleSA9PT0gQUxMX1BSSU5UQUJMRV9LRVlTKSB7XG4gICAgaWYgKGV2ZW50LmtleSkge1xuICAgICAgLy8gTW9kZXJuIGJyb3dzZXJzIGltcGxlbWVudCBga2V5YCwgc28gaWYgYGtleWAgaXMgbGVuZ3RoIDEsIHdlIGhhdmUgYSBtYXRjaC4gZS5nLiAnYScgZm9yIHRoZVxuICAgICAgLy8gYSBrZXksIG9yICcyJyBmb3IgdGhlIDIga2V5LiBBbGwgb3RoZXIgbm9uLXByaW50YWJsZSBjaGFyYWN0ZXJzIGhhdmUgbmFtZXMsIGUuZy4gJ0VudGVyJyBvciAnQmFja3NwYWNlJy5cbiAgICAgIGtleXNNYXRjaCA9IGV2ZW50LmtleS5sZW5ndGggPT09IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZvciBicm93c2VycyB0aGF0IGRvIG5vIHN1cHBvcnQgYGV2ZW50LmtleWAsIHdlIHRlc3QgYWdhaW5zdCBhIGxpc3Qgb2YgY2hhcmFjdGVyc1xuICAgICAgdmFyIHByZXNzZWRDaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZShldmVudC5jaGFyQ29kZSk7XG4gICAgICBrZXlzTWF0Y2ggPSBQUklOVEFCTEVfQ0hBUkFDVEVSUy5pbmRleE9mKHByZXNzZWRDaGFyKSA+PSAwO1xuICAgIH1cbiAgfVxuXG4gIGlmIChrZXkgPT09IGV2ZW50LndoaWNoKSB7XG4gICAgdmFyIGV2dE1vZEtleXMgPSBtb2RLZXlzLmZpbHRlcihmdW5jdGlvbiAobW9kS2V5KSB7XG4gICAgICByZXR1cm4gZXZlbnRbbW9kS2V5ICsgJ0tleSddO1xuICAgIH0pLnNvcnQoKTtcbiAgICBrZXlzTWF0Y2ggPSBtb2RpZmllcnMubGVuZ3RoID09PSBldnRNb2RLZXlzLmxlbmd0aCAmJiBtb2RpZmllcnMuZXZlcnkoZnVuY3Rpb24gKG1vZEtleSwgaW5kZXgpIHtcbiAgICAgIHJldHVybiBldnRNb2RLZXlzW2luZGV4XSA9PT0gbW9kS2V5O1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGtleXNNYXRjaDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWF0Y2hLZXlzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9tYXRjaF9rZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSAzODJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IEtleXMsIHsgbW9kaWZpZXJzIH0gZnJvbSAnLi9rZXlzJztcblxuZnVuY3Rpb24gcGFyc2VLZXlzKGtleXNBcnJheSkge1xuICByZXR1cm4ga2V5c0FycmF5Lm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGtleVNldCA9IHsga2V5OiBrZXkgfTtcbiAgICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhciBrZXlTdHJpbmcgPSBrZXkudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgICB2YXIgbWF0Y2hlcyA9IGtleVN0cmluZy5zcGxpdCgvXFxzP1xcK1xccz8vKTtcbiAgICAgIGtleVNldCA9IG1hdGNoZXMubGVuZ3RoID09PSAxID8geyBrZXk6IEtleXNba2V5U3RyaW5nXSB9IDoge1xuICAgICAgICBrZXk6IEtleXNbbWF0Y2hlcy5wb3AoKV0sXG4gICAgICAgIG1vZGlmaWVyczogbWF0Y2hlcy5tYXAoZnVuY3Rpb24gKG1vZEtleSkge1xuICAgICAgICAgIHJldHVybiBtb2RpZmllcnNbbW9kS2V5XTtcbiAgICAgICAgfSkuc29ydCgpXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ga2V5U2V0O1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcGFyc2VLZXlzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9wYXJzZV9rZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSAzODNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbnZhciBzdHlsZXNJbkRvbSA9IHt9LFxuXHRtZW1vaXplID0gZnVuY3Rpb24oZm4pIHtcblx0XHR2YXIgbWVtbztcblx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKHR5cGVvZiBtZW1vID09PSBcInVuZGVmaW5lZFwiKSBtZW1vID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdHJldHVybiBtZW1vO1xuXHRcdH07XG5cdH0sXG5cdGlzT2xkSUUgPSBtZW1vaXplKGZ1bmN0aW9uKCkge1xuXHRcdC8vIFRlc3QgZm9yIElFIDw9IDkgYXMgcHJvcG9zZWQgYnkgQnJvd3NlcmhhY2tzXG5cdFx0Ly8gQHNlZSBodHRwOi8vYnJvd3NlcmhhY2tzLmNvbS8jaGFjay1lNzFkODY5MmY2NTMzNDE3M2ZlZTcxNWMyMjJjYjgwNVxuXHRcdC8vIFRlc3RzIGZvciBleGlzdGVuY2Ugb2Ygc3RhbmRhcmQgZ2xvYmFscyBpcyB0byBhbGxvdyBzdHlsZS1sb2FkZXIgXG5cdFx0Ly8gdG8gb3BlcmF0ZSBjb3JyZWN0bHkgaW50byBub24tc3RhbmRhcmQgZW52aXJvbm1lbnRzXG5cdFx0Ly8gQHNlZSBodHRwczovL2dpdGh1Yi5jb20vd2VicGFjay1jb250cmliL3N0eWxlLWxvYWRlci9pc3N1ZXMvMTc3XG5cdFx0cmV0dXJuIHdpbmRvdyAmJiBkb2N1bWVudCAmJiBkb2N1bWVudC5hbGwgJiYgIXdpbmRvdy5hdG9iO1xuXHR9KSxcblx0Z2V0RWxlbWVudCA9IChmdW5jdGlvbihmbikge1xuXHRcdHZhciBtZW1vID0ge307XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG5cdFx0XHRpZiAodHlwZW9mIG1lbW9bc2VsZWN0b3JdID09PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdG1lbW9bc2VsZWN0b3JdID0gZm4uY2FsbCh0aGlzLCBzZWxlY3Rvcik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbWVtb1tzZWxlY3Rvcl1cblx0XHR9O1xuXHR9KShmdW5jdGlvbiAoc3R5bGVUYXJnZXQpIHtcblx0XHRyZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzdHlsZVRhcmdldClcblx0fSksXG5cdHNpbmdsZXRvbkVsZW1lbnQgPSBudWxsLFxuXHRzaW5nbGV0b25Db3VudGVyID0gMCxcblx0c3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AgPSBbXSxcblx0Zml4VXJscyA9IHJlcXVpcmUoXCIuL2ZpeFVybHNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlzdCwgb3B0aW9ucykge1xuXHRpZih0eXBlb2YgREVCVUcgIT09IFwidW5kZWZpbmVkXCIgJiYgREVCVUcpIHtcblx0XHRpZih0eXBlb2YgZG9jdW1lbnQgIT09IFwib2JqZWN0XCIpIHRocm93IG5ldyBFcnJvcihcIlRoZSBzdHlsZS1sb2FkZXIgY2Fubm90IGJlIHVzZWQgaW4gYSBub24tYnJvd3NlciBlbnZpcm9ubWVudFwiKTtcblx0fVxuXG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRvcHRpb25zLmF0dHJzID0gdHlwZW9mIG9wdGlvbnMuYXR0cnMgPT09IFwib2JqZWN0XCIgPyBvcHRpb25zLmF0dHJzIDoge307XG5cblx0Ly8gRm9yY2Ugc2luZ2xlLXRhZyBzb2x1dGlvbiBvbiBJRTYtOSwgd2hpY2ggaGFzIGEgaGFyZCBsaW1pdCBvbiB0aGUgIyBvZiA8c3R5bGU+XG5cdC8vIHRhZ3MgaXQgd2lsbCBhbGxvdyBvbiBhIHBhZ2Vcblx0aWYgKHR5cGVvZiBvcHRpb25zLnNpbmdsZXRvbiA9PT0gXCJ1bmRlZmluZWRcIikgb3B0aW9ucy5zaW5nbGV0b24gPSBpc09sZElFKCk7XG5cblx0Ly8gQnkgZGVmYXVsdCwgYWRkIDxzdHlsZT4gdGFncyB0byB0aGUgPGhlYWQ+IGVsZW1lbnRcblx0aWYgKHR5cGVvZiBvcHRpb25zLmluc2VydEludG8gPT09IFwidW5kZWZpbmVkXCIpIG9wdGlvbnMuaW5zZXJ0SW50byA9IFwiaGVhZFwiO1xuXG5cdC8vIEJ5IGRlZmF1bHQsIGFkZCA8c3R5bGU+IHRhZ3MgdG8gdGhlIGJvdHRvbSBvZiB0aGUgdGFyZ2V0XG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ1bmRlZmluZWRcIikgb3B0aW9ucy5pbnNlcnRBdCA9IFwiYm90dG9tXCI7XG5cblx0dmFyIHN0eWxlcyA9IGxpc3RUb1N0eWxlcyhsaXN0LCBvcHRpb25zKTtcblx0YWRkU3R5bGVzVG9Eb20oc3R5bGVzLCBvcHRpb25zKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcblx0XHR2YXIgbWF5UmVtb3ZlID0gW107XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGl0ZW0gPSBzdHlsZXNbaV07XG5cdFx0XHR2YXIgZG9tU3R5bGUgPSBzdHlsZXNJbkRvbVtpdGVtLmlkXTtcblx0XHRcdGRvbVN0eWxlLnJlZnMtLTtcblx0XHRcdG1heVJlbW92ZS5wdXNoKGRvbVN0eWxlKTtcblx0XHR9XG5cdFx0aWYobmV3TGlzdCkge1xuXHRcdFx0dmFyIG5ld1N0eWxlcyA9IGxpc3RUb1N0eWxlcyhuZXdMaXN0LCBvcHRpb25zKTtcblx0XHRcdGFkZFN0eWxlc1RvRG9tKG5ld1N0eWxlcywgb3B0aW9ucyk7XG5cdFx0fVxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBtYXlSZW1vdmUubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBkb21TdHlsZSA9IG1heVJlbW92ZVtpXTtcblx0XHRcdGlmKGRvbVN0eWxlLnJlZnMgPT09IDApIHtcblx0XHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKVxuXHRcdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKCk7XG5cdFx0XHRcdGRlbGV0ZSBzdHlsZXNJbkRvbVtkb21TdHlsZS5pZF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufTtcblxuZnVuY3Rpb24gYWRkU3R5bGVzVG9Eb20oc3R5bGVzLCBvcHRpb25zKSB7XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgaXRlbSA9IHN0eWxlc1tpXTtcblx0XHR2YXIgZG9tU3R5bGUgPSBzdHlsZXNJbkRvbVtpdGVtLmlkXTtcblx0XHRpZihkb21TdHlsZSkge1xuXHRcdFx0ZG9tU3R5bGUucmVmcysrO1xuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKGl0ZW0ucGFydHNbal0pO1xuXHRcdFx0fVxuXHRcdFx0Zm9yKDsgaiA8IGl0ZW0ucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0ZG9tU3R5bGUucGFydHMucHVzaChhZGRTdHlsZShpdGVtLnBhcnRzW2pdLCBvcHRpb25zKSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBwYXJ0cyA9IFtdO1xuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGl0ZW0ucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0cGFydHMucHVzaChhZGRTdHlsZShpdGVtLnBhcnRzW2pdLCBvcHRpb25zKSk7XG5cdFx0XHR9XG5cdFx0XHRzdHlsZXNJbkRvbVtpdGVtLmlkXSA9IHtpZDogaXRlbS5pZCwgcmVmczogMSwgcGFydHM6IHBhcnRzfTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gbGlzdFRvU3R5bGVzKGxpc3QsIG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlcyA9IFtdO1xuXHR2YXIgbmV3U3R5bGVzID0ge307XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGl0ZW0gPSBsaXN0W2ldO1xuXHRcdHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuXHRcdHZhciBjc3MgPSBpdGVtWzFdO1xuXHRcdHZhciBtZWRpYSA9IGl0ZW1bMl07XG5cdFx0dmFyIHNvdXJjZU1hcCA9IGl0ZW1bM107XG5cdFx0dmFyIHBhcnQgPSB7Y3NzOiBjc3MsIG1lZGlhOiBtZWRpYSwgc291cmNlTWFwOiBzb3VyY2VNYXB9O1xuXHRcdGlmKCFuZXdTdHlsZXNbaWRdKVxuXHRcdFx0c3R5bGVzLnB1c2gobmV3U3R5bGVzW2lkXSA9IHtpZDogaWQsIHBhcnRzOiBbcGFydF19KTtcblx0XHRlbHNlXG5cdFx0XHRuZXdTdHlsZXNbaWRdLnBhcnRzLnB1c2gocGFydCk7XG5cdH1cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIHN0eWxlRWxlbWVudCkge1xuXHR2YXIgc3R5bGVUYXJnZXQgPSBnZXRFbGVtZW50KG9wdGlvbnMuaW5zZXJ0SW50bylcblx0aWYgKCFzdHlsZVRhcmdldCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0SW50bycgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuXHR9XG5cdHZhciBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCA9IHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wW3N0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLmxlbmd0aCAtIDFdO1xuXHRpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ0b3BcIikge1xuXHRcdGlmKCFsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCkge1xuXHRcdFx0c3R5bGVUYXJnZXQuaW5zZXJ0QmVmb3JlKHN0eWxlRWxlbWVudCwgc3R5bGVUYXJnZXQuZmlyc3RDaGlsZCk7XG5cdFx0fSBlbHNlIGlmKGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKSB7XG5cdFx0XHRzdHlsZVRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGVFbGVtZW50LCBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcC5uZXh0U2libGluZyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0eWxlVGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlRWxlbWVudCk7XG5cdFx0fVxuXHRcdHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLnB1c2goc3R5bGVFbGVtZW50KTtcblx0fSBlbHNlIGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcImJvdHRvbVwiKSB7XG5cdFx0c3R5bGVUYXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGVFbGVtZW50KTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHZhbHVlIGZvciBwYXJhbWV0ZXIgJ2luc2VydEF0Jy4gTXVzdCBiZSAndG9wJyBvciAnYm90dG9tJy5cIik7XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuXHRzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xuXHR2YXIgaWR4ID0gc3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AuaW5kZXhPZihzdHlsZUVsZW1lbnQpO1xuXHRpZihpZHggPj0gMCkge1xuXHRcdHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLnNwbGljZShpZHgsIDEpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKSB7XG5cdHZhciBzdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG5cdG9wdGlvbnMuYXR0cnMudHlwZSA9IFwidGV4dC9jc3NcIjtcblxuXHRhdHRhY2hUYWdBdHRycyhzdHlsZUVsZW1lbnQsIG9wdGlvbnMuYXR0cnMpO1xuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgc3R5bGVFbGVtZW50KTtcblx0cmV0dXJuIHN0eWxlRWxlbWVudDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTGlua0VsZW1lbnQob3B0aW9ucykge1xuXHR2YXIgbGlua0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcblx0b3B0aW9ucy5hdHRycy50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuXHRvcHRpb25zLmF0dHJzLnJlbCA9IFwic3R5bGVzaGVldFwiO1xuXG5cdGF0dGFjaFRhZ0F0dHJzKGxpbmtFbGVtZW50LCBvcHRpb25zLmF0dHJzKTtcblx0aW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIGxpbmtFbGVtZW50KTtcblx0cmV0dXJuIGxpbmtFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBhdHRhY2hUYWdBdHRycyhlbGVtZW50LCBhdHRycykge1xuXHRPYmplY3Qua2V5cyhhdHRycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGFkZFN0eWxlKG9iaiwgb3B0aW9ucykge1xuXHR2YXIgc3R5bGVFbGVtZW50LCB1cGRhdGUsIHJlbW92ZSwgdHJhbnNmb3JtUmVzdWx0O1xuXG5cdC8vIElmIGEgdHJhbnNmb3JtIGZ1bmN0aW9uIHdhcyBkZWZpbmVkLCBydW4gaXQgb24gdGhlIGNzc1xuXHRpZiAob3B0aW9ucy50cmFuc2Zvcm0gJiYgb2JqLmNzcykge1xuXHQgICAgdHJhbnNmb3JtUmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm0ob2JqLmNzcyk7XG5cdCAgICBcblx0ICAgIGlmICh0cmFuc2Zvcm1SZXN1bHQpIHtcblx0ICAgIFx0Ly8gSWYgdHJhbnNmb3JtIHJldHVybnMgYSB2YWx1ZSwgdXNlIHRoYXQgaW5zdGVhZCBvZiB0aGUgb3JpZ2luYWwgY3NzLlxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBydW5uaW5nIHJ1bnRpbWUgdHJhbnNmb3JtYXRpb25zIG9uIHRoZSBjc3MuXG5cdCAgICBcdG9iai5jc3MgPSB0cmFuc2Zvcm1SZXN1bHQ7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgXHQvLyBJZiB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIHJldHVybnMgYSBmYWxzeSB2YWx1ZSwgZG9uJ3QgYWRkIHRoaXMgY3NzLiBcblx0ICAgIFx0Ly8gVGhpcyBhbGxvd3MgY29uZGl0aW9uYWwgbG9hZGluZyBvZiBjc3Ncblx0ICAgIFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHQgICAgXHRcdC8vIG5vb3Bcblx0ICAgIFx0fTtcblx0ICAgIH1cblx0fVxuXG5cdGlmIChvcHRpb25zLnNpbmdsZXRvbikge1xuXHRcdHZhciBzdHlsZUluZGV4ID0gc2luZ2xldG9uQ291bnRlcisrO1xuXHRcdHN0eWxlRWxlbWVudCA9IHNpbmdsZXRvbkVsZW1lbnQgfHwgKHNpbmdsZXRvbkVsZW1lbnQgPSBjcmVhdGVTdHlsZUVsZW1lbnQob3B0aW9ucykpO1xuXHRcdHVwZGF0ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZUVsZW1lbnQsIHN0eWxlSW5kZXgsIGZhbHNlKTtcblx0XHRyZW1vdmUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50LCBzdHlsZUluZGV4LCB0cnVlKTtcblx0fSBlbHNlIGlmKG9iai5zb3VyY2VNYXAgJiZcblx0XHR0eXBlb2YgVVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgVVJMLmNyZWF0ZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIFVSTC5yZXZva2VPYmplY3RVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBCbG9iID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0c3R5bGVFbGVtZW50ID0gY3JlYXRlTGlua0VsZW1lbnQob3B0aW9ucyk7XG5cdFx0dXBkYXRlID0gdXBkYXRlTGluay5iaW5kKG51bGwsIHN0eWxlRWxlbWVudCwgb3B0aW9ucyk7XG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcblx0XHRcdGlmKHN0eWxlRWxlbWVudC5ocmVmKVxuXHRcdFx0XHRVUkwucmV2b2tlT2JqZWN0VVJMKHN0eWxlRWxlbWVudC5ocmVmKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHN0eWxlRWxlbWVudCA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKTtcblx0XHR1cGRhdGUgPSBhcHBseVRvVGFnLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50KTtcblx0XHRyZW1vdmUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuXHRcdH07XG5cdH1cblxuXHR1cGRhdGUob2JqKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlU3R5bGUobmV3T2JqKSB7XG5cdFx0aWYobmV3T2JqKSB7XG5cdFx0XHRpZihuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXApXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdHVwZGF0ZShvYmogPSBuZXdPYmopO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZW1vdmUoKTtcblx0XHR9XG5cdH07XG59XG5cbnZhciByZXBsYWNlVGV4dCA9IChmdW5jdGlvbiAoKSB7XG5cdHZhciB0ZXh0U3RvcmUgPSBbXTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gKGluZGV4LCByZXBsYWNlbWVudCkge1xuXHRcdHRleHRTdG9yZVtpbmRleF0gPSByZXBsYWNlbWVudDtcblx0XHRyZXR1cm4gdGV4dFN0b3JlLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG4nKTtcblx0fTtcbn0pKCk7XG5cbmZ1bmN0aW9uIGFwcGx5VG9TaW5nbGV0b25UYWcoc3R5bGVFbGVtZW50LCBpbmRleCwgcmVtb3ZlLCBvYmopIHtcblx0dmFyIGNzcyA9IHJlbW92ZSA/IFwiXCIgOiBvYmouY3NzO1xuXG5cdGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSByZXBsYWNlVGV4dChpbmRleCwgY3NzKTtcblx0fSBlbHNlIHtcblx0XHR2YXIgY3NzTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcyk7XG5cdFx0dmFyIGNoaWxkTm9kZXMgPSBzdHlsZUVsZW1lbnQuY2hpbGROb2Rlcztcblx0XHRpZiAoY2hpbGROb2Rlc1tpbmRleF0pIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChjaGlsZE5vZGVzW2luZGV4XSk7XG5cdFx0aWYgKGNoaWxkTm9kZXMubGVuZ3RoKSB7XG5cdFx0XHRzdHlsZUVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNzc05vZGUsIGNoaWxkTm9kZXNbaW5kZXhdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGNzc05vZGUpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBhcHBseVRvVGFnKHN0eWxlRWxlbWVudCwgb2JqKSB7XG5cdHZhciBjc3MgPSBvYmouY3NzO1xuXHR2YXIgbWVkaWEgPSBvYmoubWVkaWE7XG5cblx0aWYobWVkaWEpIHtcblx0XHRzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibWVkaWFcIiwgbWVkaWEpXG5cdH1cblxuXHRpZihzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG5cdH0gZWxzZSB7XG5cdFx0d2hpbGUoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcblx0XHRcdHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG5cdFx0fVxuXHRcdHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcblx0fVxufVxuXG5mdW5jdGlvbiB1cGRhdGVMaW5rKGxpbmtFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuXG5cdC8qIElmIGNvbnZlcnRUb0Fic29sdXRlVXJscyBpc24ndCBkZWZpbmVkLCBidXQgc291cmNlbWFwcyBhcmUgZW5hYmxlZFxuXHRhbmQgdGhlcmUgaXMgbm8gcHVibGljUGF0aCBkZWZpbmVkIHRoZW4gbGV0cyB0dXJuIGNvbnZlcnRUb0Fic29sdXRlVXJsc1xuXHRvbiBieSBkZWZhdWx0LiAgT3RoZXJ3aXNlIGRlZmF1bHQgdG8gdGhlIGNvbnZlcnRUb0Fic29sdXRlVXJscyBvcHRpb25cblx0ZGlyZWN0bHlcblx0Ki9cblx0dmFyIGF1dG9GaXhVcmxzID0gb3B0aW9ucy5jb252ZXJ0VG9BYnNvbHV0ZVVybHMgPT09IHVuZGVmaW5lZCAmJiBzb3VyY2VNYXA7XG5cblx0aWYgKG9wdGlvbnMuY29udmVydFRvQWJzb2x1dGVVcmxzIHx8IGF1dG9GaXhVcmxzKXtcblx0XHRjc3MgPSBmaXhVcmxzKGNzcyk7XG5cdH1cblxuXHRpZihzb3VyY2VNYXApIHtcblx0XHQvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNjYwMzg3NVxuXHRcdGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIgKyBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpICsgXCIgKi9cIjtcblx0fVxuXG5cdHZhciBibG9iID0gbmV3IEJsb2IoW2Nzc10sIHsgdHlwZTogXCJ0ZXh0L2Nzc1wiIH0pO1xuXG5cdHZhciBvbGRTcmMgPSBsaW5rRWxlbWVudC5ocmVmO1xuXG5cdGxpbmtFbGVtZW50LmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXG5cdGlmKG9sZFNyYylcblx0XHRVUkwucmV2b2tlT2JqZWN0VVJMKG9sZFNyYyk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qc1xuLy8gbW9kdWxlIGlkID0gNDc2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IG9ic2VydmVyIH0gZnJvbSBcIm1vYngtcmVhY3RcIjtcbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBrZXlkb3duIGZyb20gXCJyZWFjdC1rZXlkb3duXCI7XG5pbXBvcnQgeyBCdXR0b24sIERyb3Bkb3duLCBHcmlkLCBNZW51LCBTZWdtZW50LCBUZXh0QXJlYSB9IGZyb20gJ3NlbWFudGljLXVpLXJlYWN0J1xuXG5pbXBvcnQgRXhhbXBsZVN0b3JlIGZyb20gXCIuL0V4YW1wbGVTdG9yZVwiO1xuaW1wb3J0IFNwYWNlciBmcm9tIFwiLi9TcGFjZXIuanN4XCI7XG5pbXBvcnQgXCIuL3N0eWxlcy5sZXNzXCI7XG5pbXBvcnQgVGFiYmFibGVUZXh0QXJlYSBmcm9tIFwiLi9UYWJiYWJsZVRleHRBcmVhLmpzeFwiO1xuXG5Ab2JzZXJ2ZXJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwZWxsRWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0c3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcblx0XHRleGFtcGxlczogbmV3IEV4YW1wbGVTdG9yZSgpXG5cdH07XG5cblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcyk7XG53aW5kb3cuZXhhbXBsZXMgPSBwcm9wcy5leGFtcGxlcztcblx0XHR0aGlzLnByb3BzLmV4YW1wbGVzLmxvYWQoKTtcblxuXHRcdC8vREVCVUdcblx0XHR3aW5kb3cuc3BlbGxFZGl0b3IgPSB0aGlzO1xuXHRcdHdpbmRvdy5leGFtcGxlcyA9IHRoaXMucHJvcHMuZXhhbXBsZXM7XG5cdH1cblxuXHRAa2V5ZG93bihcImN0cmwrc1wiKVxuXHRzYXZlKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLnNhdmUoKTsgfVxuXG5cdEBrZXlkb3duKFwiY3RybCtyXCIpXG5cdHJldmVydCgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5yZXZlcnQoKTsgfVxuXG5cdEBrZXlkb3duKFwiY3RybCtjXCIpXG5cdGNvbXBpbGUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuY29tcGlsZSgpOyB9XG5cblx0QGtleWRvd24oXCJjdHJsK25cIilcblx0Y3JlYXRlKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLmNyZWF0ZSgpOyB9XG5cblx0QGtleWRvd24oXCJjdHJsK2RcIilcblx0ZGVsZXRlKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLmRlbGV0ZSh1bmRlZmluZWQsIFwiQ09ORklSTVwiKTsgfVxuXG5cdHJlbmFtZSgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5yZW5hbWUoKTsgfVxuXHRkdXBsaWNhdGUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuZHVwbGljYXRlKCk7IH1cblx0bG9hZCgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5sb2FkKCk7IH1cblx0cmVzZXQoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMucmVzZXQoKTsgfVxuXG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCB7IGV4YW1wbGVzIH0gPSB0aGlzLnByb3BzO1xuXHRcdGxldCB7IHRpdGxlcywgc2VsZWN0ZWQsIGRpcnR5LCBjb2RlLCBvdXRwdXQgfSA9IGV4YW1wbGVzO1xuXG5cdFx0Ly8gQ3JlYXRlIG1lbnVpdGVtcyBmcm9tIHRoZSBleGFtcGxlc1xuXHRcdGxldCBvcHRpb25zID0gdGl0bGVzLm1hcCggdGl0bGUgPT5cblx0XHRcdCh7XG5cdFx0XHRcdHZhbHVlOiB0aXRsZSxcblx0XHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0XHR0ZXh0OiB0aXRsZSxcblx0XHRcdFx0Y29udGVudDogdGl0bGUsXG5cdFx0XHRcdG9uQ2xpY2s6ICgpID0+IGV4YW1wbGVzLnNlbGVjdCh0aXRsZSlcblx0XHRcdH0pKTtcblxuXHRcdGxldCBkaXJ0eUJ1dHRvbnMgPSAoKSA9PiB7XG5cdFx0XHRpZiAoIWRpcnR5KSByZXR1cm47XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8TWVudSBzZWNvbmRhcnkgc3R5bGU9e3sgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgcmlnaHQ6IFwiMXJlbVwiLCB0b3A6IFwiM3B4XCIsIG1hcmdpbjogMCB9fT5cblx0XHRcdFx0XHQ8QnV0dG9uIG5lZ2F0aXZlIG9uQ2xpY2s9eygpID0+IHRoaXMucmV2ZXJ0KCl9Pjx1PlI8L3U+ZXZlcnQ8L0J1dHRvbj5cblx0XHRcdFx0XHQ8QnV0dG9uIHBvc2l0aXZlIG9uQ2xpY2s9eygpID0+IHRoaXMuc2F2ZSgpfT48dT5TPC91PmF2ZTwvQnV0dG9uPlxuXHRcdFx0XHQ8L01lbnU+XG5cdFx0XHQpO1xuXHRcdH07XG5cblx0XHRsZXQgY29tcGlsZUJ1dHRvbiA9ICgpID0+IHtcblx0XHRcdGlmIChvdXRwdXQpIHJldHVybjtcblx0XHRcdHJldHVybiA8QnV0dG9uXG5cdFx0XHRcdFx0c3R5bGU9e3sgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgIHdpZHRoOiBcIjRlbVwiLCBsZWZ0OiBcImNhbGMoNTAlIC0gMmVtKVwiLCB0b3A6IFwiNTAlXCIgfX1cblx0XHRcdFx0XHRvbkNsaWNrPXsoKSA9PiB0aGlzLmNvbXBpbGUoKX1cblx0XHRcdFx0XHRpY29uPVwicmlnaHQgY2hldnJvblwiLz47XG5cdFx0fTtcblxuXHRcdHJldHVybiAoXG5cdFx0PEdyaWQgc3RyZXRjaGVkIHBhZGRlZCBjbGFzc05hbWU9XCJmdWxsSGVpZ2h0XCI+XG5cdFx0XHQ8R3JpZC5Sb3cgc3R5bGU9e3sgaGVpZ2h0OiBcIjJyZW1cIiwgcGFkZGluZ1RvcDogXCIwcmVtXCIgfX0gY2xhc3NOYW1lPVwidWkgaW52ZXJ0ZWQgYXR0YWNoZWQgbWVudVwiPlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezd9PlxuXHRcdFx0XHRcdDxNZW51IGludmVydGVkIGF0dGFjaGVkIGZsdWlkPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbT5FeGFtcGxlOjwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdFx0PERyb3Bkb3duIGl0ZW0gc2VsZWN0aW9uIG9wdGlvbnM9e29wdGlvbnN9IHZhbHVlPXtzZWxlY3RlZH0gc3R5bGU9e3sgd2lkdGg6IFwiMjBlbVwiIH19Lz5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0gb25DbGljaz17KCkgPT4gdGhpcy5kZWxldGUoKX0+PHU+RDwvdT5lbGV0ZTwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbSBvbkNsaWNrPXsoKSA9PiB0aGlzLnJlbmFtZSgpfT5SZW5hbWU8L01lbnUuSXRlbT5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0gb25DbGljaz17KCkgPT4gdGhpcy5kdXBsaWNhdGUoKX0+RHVwbGljYXRlPC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0PC9NZW51PlxuXHRcdFx0XHQ8L0dyaWQuQ29sdW1uPlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezJ9PlxuXHRcdFx0XHRcdDxNZW51IGludmVydGVkIGF0dGFjaGVkIGZsdWlkPlxuXHRcdFx0XHRcdFx0PFNwYWNlciBmbHVpZC8+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtIG9uQ2xpY2s9eygpID0+IHRoaXMuY3JlYXRlKCl9Pjx1Pk48L3U+ZXc8L01lbnUuSXRlbT5cblx0XHRcdFx0XHRcdDxTcGFjZXIgZmx1aWQvPlxuXHRcdFx0XHRcdDwvTWVudT5cblx0XHRcdFx0PC9HcmlkLkNvbHVtbj5cblx0XHRcdFx0PEdyaWQuQ29sdW1uIHdpZHRoPXs3fT5cblx0XHRcdFx0XHQ8TWVudSBpbnZlcnRlZCBhdHRhY2hlZCBmbHVpZD5cblx0XHRcdFx0XHRcdDxTcGFjZXIgZmx1aWQvPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbSBvbkNsaWNrPXsoKSA9PiB0aGlzLmxvYWQoKX0+UmVsb2FkPC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtIG9uQ2xpY2s9eygpID0+IHRoaXMucmVzZXQoKX0+UmVzZXQ8L01lbnUuSXRlbT5cblx0XHRcdFx0XHQ8L01lbnU+XG5cdFx0XHRcdDwvR3JpZC5Db2x1bW4+XG5cdFx0XHQ8L0dyaWQuUm93PlxuXHRcdFx0PEdyaWQuUm93IHN0eWxlPXt7IGhlaWdodDogXCJjYWxjKDEwMCUgLSAzcmVtKVwiIH19PlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezh9PlxuXHRcdFx0XHRcdDxUYWJiYWJsZVRleHRBcmVhXG5cdFx0XHRcdFx0XHRjbGFzc05hbWU9XCJ1aSBzZWdtZW50XCJcblx0XHRcdFx0XHRcdHZhbHVlPXtjb2RlfVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyhldmVudCkgPT4gZXhhbXBsZXMudXBkYXRlKGV4YW1wbGVzLnNlbGVjdGVkLCBldmVudC50YXJnZXQudmFsdWUsIFwiU0tJUF9TQVZFXCIpfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0e2RpcnR5QnV0dG9ucygpfVxuXHRcdFx0XHQ8L0dyaWQuQ29sdW1uPlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezh9PlxuXHRcdFx0XHRcdDxUZXh0QXJlYSBjbGFzc05hbWU9XCJ1aSBzZWdtZW50XCIgdmFsdWU9e291dHB1dH0vPlxuXHRcdFx0XHQ8L0dyaWQuQ29sdW1uPlxuXHRcdFx0XHR7Y29tcGlsZUJ1dHRvbigpfVxuXHRcdFx0PC9HcmlkLlJvdz5cblx0XHQ8L0dyaWQ+XG5cdCk7fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC9TcGVsbEVkaXRvci5qc3giLCIvLyBFeHBvcnQgYWxsIHN0YW5kYXJkIFwic3BlbGxcIiBydWxlcy5cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4uLy4uL1BhcnNlclwiO1xuaW1wb3J0IFRva2VuaXplciBmcm9tIFwiLi4vLi4vVG9rZW5pemVyLmpzXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZS5qc1wiO1xuXG4vLyBMb2FkIGFsbCBzdGFuZGFyZCBydWxlcyBmaWxlcy5cbmltcG9ydCBcIi4vY29yZVwiO1xuaW1wb3J0IFwiLi9saXN0c1wiO1xuaW1wb3J0IFwiLi9vcGVyYXRvcnNcIjtcbmltcG9ydCBcIi4vaWZcIjtcbmltcG9ydCBcIi4vc3RhdGVtZW50c1wiO1xuaW1wb3J0IFwiLi90eXBlc1wiO1xuaW1wb3J0IFwiLi9KU1hcIjtcblxuLy8gQ3JlYXRlIHBhcnNlciB3aGljaCBjb21iaW5lcyBhbGwgb2YgdGhlIGFib3ZlLi4uXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTmFtZShcInNwZWxsXCIpO1xuLy8gLi4ud2hpY2ggZGVwZW5kcyBvbiBydWxlcyBsb2FkZWQgYWJvdmUuLi5cbnBhcnNlci5pbXBvcnQoXCJjb3JlXCIsIFwibGlzdHNcIiwgXCJvcGVyYXRvcnNcIiwgXCJpZlwiLCBcInN0YXRlbWVudHNcIiwgXCJ0eXBlc1wiLCBcIkpTWFwiKTtcbi8vIC4uLmFzIHRoZSBkZWZhdWx0IGV4cG9ydFxuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG4vLyBTdGljayBvdGhlciBzdHVmZiBvbiBgd2luZG93YCBmb3IgcmVmbGVjdGlvbiBhbmQgYWQtaG9jIHRlc3RpbmcuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRPYmplY3QuYXNzaWduKHdpbmRvdywge1xuXHRcdFRva2VuaXplcixcblx0XHRSdWxlLFxuXHRcdFBhcnNlcixcblxuXHRcdHRva2VuaXplOiBUb2tlbml6ZXIudG9rZW5pemUuYmluZChleHBvcnRzLlRva2VuaXplciksXG5cdFx0cGFyc2VyLFxuXHRcdHBhcnNlOiBwYXJzZXIucGFyc2UuYmluZChwYXJzZXIpLFxuXHRcdGNvbXBpbGU6IHBhcnNlci5jb21waWxlLmJpbmQocGFyc2VyKSxcblx0fSk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvaW5kZXguanMiLCIvKiBTdG9yZSBvZiBleGFtcGxlIHNwZWxsIGNvZGUgZnJhZ21lbnRzLiAqL1xuaW1wb3J0IG1vYngsIHsgb2JzZXJ2YWJsZSwgY29tcHV0ZWQgfSBmcm9tIFwibW9ieFwiO1xuXG4vLyBNYWtlIFBhcnNlciBhbmQgVG9rZW5pemVyIFdBUk4gYXMgd2UgcnVuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi9QYXJzZXJcIjtcblBhcnNlci5XQVJOID0gdHJ1ZTtcblBhcnNlci5ERUJVRyA9IHRydWU7XG5QYXJzZXIuVElNRSA9IHRydWU7XG5cbmltcG9ydCBUb2tlbml6ZXIgZnJvbSBcIi4uL1Rva2VuaXplclwiO1xuVG9rZW5pemVyLldBUk4gPSB0cnVlO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4YW1wbGVTdG9yZSB7XG5cdC8vIENVUlJFTlQgZXhhbXBsZXNcblx0QG9ic2VydmFibGUgZXhhbXBsZXMgPSB7fTtcblx0Ly8gRXhhbXBsZXMgYXMgb2YgbGFzdCBzYXZlIChmb3IgcmV2ZXIpXG5cdEBvYnNlcnZhYmxlIF9zYXZlZEV4YW1wbGVzID0ge307XG5cdC8vIFNlbGVjdGVkIGV4YW1wbGUga2V5LlxuXHRAb2JzZXJ2YWJsZSBzZWxlY3RlZCA9IFwiXCI7XG5cdC8vIENvbXBpbGVkIG91dHB1dC5cblx0QG9ic2VydmFibGUgb3V0cHV0ID0gXCJcIjtcblxuXHQvLyBSZXR1cm4ganVzdCB0aGUgdGl0bGVzIG9mIHRoZSBleGFtcGxlcy5cblx0QGNvbXB1dGVkIGdldCB0aXRsZXMoKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuZXhhbXBsZXMpO1xuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBjb2RlIGZvciB0aGUgY3VycmVudCBleGFtcGxlXG5cdEBjb21wdXRlZCBnZXQgY29kZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5leGFtcGxlc1t0aGlzLnNlbGVjdGVkXTtcblx0fVxuXG5cdC8vIElzIEFOWVRISU5HIGRpcnR5P1xuXHRAY29tcHV0ZWQgZ2V0IGRpcnR5KCkge1xuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLl9zYXZlZEV4YW1wbGVzKSAhPT0gSlNPTi5zdHJpbmdpZnkodGhpcy5leGFtcGxlcyk7XG5cdH1cblxuXHQvLyBSZXNldCBhbGwgZXhhbXBsZXMgZnJvbSBsb2NhbFN0b3JhZ2UuXG5cdHJlc2V0KCkge1xuXHRcdGRlbGV0ZSBsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlcztcblx0XHRkZWxldGUgbG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZTtcblx0XHR3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG5cdH1cblxuXHQvLyBMb2FkIGV4YW1wbGVzXG5cdGxvYWQoKSB7XG5cdFx0Ly8gTG9hZCBleGFtcGxlcyBmcm9tIGxvY2FsU3RvcmFnZVxuXHRcdHRoaXMuZXhhbXBsZXMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5zcGVsbEVkaXRvckV4YW1wbGVzXG5cdFx0XHR8fCAne1wiRm9vXCI6XCJkZWZpbmUgdHlwZSBGb29cIiwgXCJCYXJcIjpcImRlZmluZSB0eXBlIEJhclwifScpO1xuXG5cdFx0Ly8gU2F2ZSBhIGNvcHkgb2YgZXhhbXBsZXMgZm9yIHJldmVydFxuXHRcdHRoaXMuX3NhdmVkRXhhbXBsZXMgPSB0aGlzLmV4YW1wbGVzO1xuXG5cdFx0Ly8gTG9hZCBzZWxlY3RlZCBleGFtcGxlIG5hbWVcblx0XHR0aGlzLnNlbGVjdChsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlKTtcblx0fVxuXG5cdC8vIFNhdmUgY3VycmVudCBleGFtcGxlcy5cblx0c2F2ZSgpIHtcblx0XHRsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlcyA9IEpTT04uc3RyaW5naWZ5KHRoaXMuZXhhbXBsZXMpO1xuXG5cdFx0Ly8gU2F2ZSBhIGNvcHkgb2YgZXhhbXBsZXMgZm9yIHJldmVydFxuXHRcdHRoaXMuX3NhdmVkRXhhbXBsZXMgPSB0aGlzLmV4YW1wbGVzO1xuXHR9XG5cblx0Ly8gUmV2ZXJ0IHRoZSBjdXJyZW50IGV4YW1wbGVcblx0cmV2ZXJ0KGV4YW1wbGUgPSB0aGlzLnNlbGVjdGVkKSB7XG5cdFx0dGhpcy51cGRhdGUoZXhhbXBsZSwgdGhpcy5fc2F2ZWRFeGFtcGxlc1tleGFtcGxlXSk7XG5cdH1cblxuXHQvLyBTZWxlY3QgYSBkaWZmZXJlbnQgZXhhbXBsZS5cblx0c2VsZWN0KGV4YW1wbGUpIHtcblx0XHRpZiAoIWV4YW1wbGUgfHwgdGhpcy5leGFtcGxlc1tleGFtcGxlXSA9PSBudWxsKSBleGFtcGxlID0gT2JqZWN0LmtleXModGhpcy5leGFtcGxlcylbMF0gfHwgXCJcIjtcblx0XHR0aGlzLnNlbGVjdGVkID0gbG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZSA9IGV4YW1wbGU7XG5cdFx0dGhpcy5vdXRwdXQgPSBcIlwiO1xuXHR9XG5cblx0Ly8gQ3JlYXRlIGEgbmV3IGV4YW1wbGUuXG5cdC8vIFNhdmVzIGFuZCBzZWxlY3RzIHRoZSBleGFtcGxlIGF1dG9tYXRpY2FsbHkuXG5cdHVwZGF0ZShuYW1lLCBjb2RlLCBza2lwU2F2ZSkge1xuXHRcdHRoaXMuZXhhbXBsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmV4YW1wbGVzLCB7IFsgbmFtZSBdOiBjb2RlIH0pO1xuXHRcdHRoaXMuc2VsZWN0KG5hbWUpO1xuXHRcdHRoaXMub3V0cHV0ID0gXCJcIjtcblx0XHRpZiAoIXNraXBTYXZlKSB0aGlzLnNhdmUoKTtcblx0fVxuXG5cdC8vIERlbGV0ZSBhbiBleGFtcGxlLlxuXHQvLyBTYXZlcyBhbmQgc2VsZWN0cyBhbm90aGVyIGV4YW1wbGUgYXV0b21hdGljYWxseS5cblx0ZGVsZXRlKG5hbWUgPSB0aGlzLnNlbGVjdGVkLCBzaG93Q29uZmlybSkge1xuXHRcdGlmIChzaG93Q29uZmlybSAmJiAhY29uZmlybShgUmVhbGx5IGRlbGV0ZSBleGFtcGxlICR7bmFtZX0/YCkpIHJldHVybjtcblx0XHRsZXQgZXhhbXBsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmV4YW1wbGVzKTtcblx0XHRkZWxldGUgZXhhbXBsZXNbbmFtZV07XG5cdFx0dGhpcy5leGFtcGxlcyA9IGV4YW1wbGVzO1xuXHRcdHRoaXMuc2F2ZSgpO1xuXHRcdHRoaXMuc2VsZWN0KCk7XG5cdH1cblxuXHQvLyBDcmVhdGUgYSBuZXcgZXhhbXBsZS5cblx0Y3JlYXRlKG5hbWUsIGNvZGUgPSBcIlwiKSB7XG5cdFx0Ly8gSWYgbm8gbmFtZSwgcHJvbXB0LlxuXHRcdGlmICghbmFtZSkgbmFtZSA9IHByb21wdChcIk5hbWUgZm9yIHRoaXMgZXhhbXBsZT9cIik7XG5cdFx0Ly8gRm9yZ2V0IGl0IGlmIG5vIG5hbWUuXG5cdFx0aWYgKCFuYW1lKSByZXR1cm47XG5cblx0XHR0aGlzLnVwZGF0ZShuYW1lLCBjb2RlKTtcblx0fVxuXG5cdC8vIFJlbmFtZSBhbiBleGFtcGxlLlxuXHQvLyBTZWxlY3RzIGFuZCBzYXZlcyBhdXRvbWF0aWNhbGx5LlxuXHRyZW5hbWUob2xkTmFtZSA9IHRoaXMuc2VsZWN0ZWQsIG5ld05hbWUpIHtcblx0XHQvLyBJZiBubyBuZXcgbmFtZSwgcHJvbXB0LlxuXHRcdGlmICghbmV3TmFtZSkgbmV3TmFtZSA9IHByb21wdChcIk5ldyBuYW1lIGZvciB0aGlzIGV4YW1wbGU/XCIsIG9sZE5hbWUpO1xuXG5cdFx0Ly8gRm9yZ2V0IGl0IGlmIG5vIG5hbWUgc3VwcGxpZWQgb3IgbmFtZSBpcyB0aGUgc2FtZVxuXHRcdGlmICghbmV3TmFtZSB8fCBuZXdOYW1lID09PSBvbGROYW1lKSByZXR1cm47XG5cdFx0aWYgKHRoaXMuZXhhbXBsZXNbbmV3TmFtZV0pIHJldHVybiBjb25zb2xlLndhcm4oYGV4YW1wbGVzLnJlbmFtZShcIiR7bmV3TmFtZX1cIik6IG5hbWUgYWxyZWFkeSBpbiB1c2VgKTtcblxuXHRcdGxldCBjb2RlID0gdGhpcy5leGFtcGxlc1tvbGROYW1lXTtcblx0XHR0aGlzLmRlbGV0ZShvbGROYW1lKTtcblx0XHR0aGlzLnVwZGF0ZShuZXdOYW1lLCBjb2RlKTtcblx0fVxuXG5cdC8vIER1cGxpY2F0ZSBhbiBleGFtcGxlLlxuXHRkdXBsaWNhdGUob2xkTmFtZSA9IHRoaXMuc2VsZWN0ZWQsIG5ld05hbWUpIHtcblx0XHQvLyBJZiBubyBuZXcgbmFtZSwgcHJvbXB0LlxuXHRcdGlmICghbmV3TmFtZSkgbmV3TmFtZSA9IHByb21wdChcIk5ldyBuYW1lIGZvciBkdXBsaWNhdGUgZXhhbXBsZT9cIiwgb2xkTmFtZSk7XG5cdFx0Ly8gRm9yZ2V0IGl0IGlmIG5vIG5hbWUgc3VwcGxpZWQgb3IgbmFtZSBpcyB0aGUgc2FtZVxuXHRcdGlmICghbmV3TmFtZSB8fCBuZXdOYW1lID09PSBvbGROYW1lKSByZXR1cm47XG5cdFx0aWYgKHRoaXMuZXhhbXBsZXNbbmV3TmFtZV0pIHJldHVybiBjb25zb2xlLndhcm4oYGV4YW1wbGVzLnJlbmFtZShcIiR7bmV3TmFtZX1cIik6IG5hbWUgYWxyZWFkeSBpbiB1c2VgKTtcblxuXHRcdHRoaXMudXBkYXRlKG5ld05hbWUsIHRoaXMuY29kZSk7XG5cdH1cblxuXHQvLyBDb21waWxlIHRoZSBjdXJyZW50IGV4YW1wbGUsIHBsYWNpbmcgaXQgaW4gb3VyIGBvdXRwdXRgLlxuLy9UT0RPOiBzb21lIHdheSB0byBkbyB0aGlzIGF1dG9tYXRpY2FsbHkgdy8gXCJvdXRwdXRcIiA/XG5cdGNvbXBpbGUoKSB7XG5cdFx0dGhpcy5vdXRwdXQgPSBcIi4uLmNvbXBpbGluZy4uLlwiO1xuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0bGV0IHJlc3VsdCA9IHBhcnNlci5wYXJzZShcInN0YXRlbWVudHNcIiwgdGhpcy5jb2RlKTtcblx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihcIkNhbid0IHBhcnNlIVwiKTtcblx0XHRcdFx0dGhpcy5vdXRwdXQgPSBcIkNhbid0IHBhcnNlIHN0YXRlbWVudHNcIjtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmluZm8oXCJSZXN1bHRcIiwgcmVzdWx0KTtcblx0XHRcdFx0dGhpcy5vdXRwdXQgPSByZXN1bHQudG9Tb3VyY2UocGFyc2VyKTtcblx0XHRcdH1cblx0XHR9LCAxMDApO1xuXHR9XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hcHAvRXhhbXBsZVN0b3JlLmpzIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0xMTU3NTkwMjhcbnZhciBnbG9iYWwgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lk1hdGggPT0gTWF0aFxuICA/IHdpbmRvdyA6IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnICYmIHNlbGYuTWF0aCA9PSBNYXRoID8gc2VsZlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3LWZ1bmNcbiAgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuaWYgKHR5cGVvZiBfX2cgPT0gJ251bWJlcicpIF9fZyA9IGdsb2JhbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZ2xvYmFsLmpzXG4vLyBtb2R1bGUgaWQgPSA0OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vXG4vLyAgPFNwYWNlcj4gY29tcG9uZW50IGZvciB1c2Ugd2l0aCBvYWsuXG4vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSBcInByb3AtdHlwZXNcIjtcbmltcG9ydCB7IGNsYXNzTmFtZXMgfSBmcm9tIFwiLi91dGlsXCI7XG5cbmltcG9ydCBcIi4vU3BhY2VyLmxlc3NcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU3BhY2VyKHByb3BzKSB7XG4gIGNvbnN0IHtcbiAgICBjbGFzc05hbWUsXG4gICAgYXBwZWFyYW5jZSwgc2l6ZSwgd2lkdGgsIGhlaWdodCxcbiAgICBpbmxpbmUsIGZsdWlkLCB0aW55LCBzbWFsbCwgbWVkaXVtLCBsYXJnZSwgaHVnZSwgbWFzc2l2ZVxuICB9ID0gcHJvcHM7XG5cbiAgY29uc3Qgc3BhY2VyUHJvcHMgPSB7XG4gICAgY2xhc3NOYW1lOiBjbGFzc05hbWVzKGNsYXNzTmFtZSwgXCJvYWtcIiwgc2l6ZSwgYXBwZWFyYW5jZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgeyBpbmxpbmUsIGZsdWlkIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3BhY2VyXCIpLFxuICAgIHN0eWxlOiB7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICB9XG4gIH1cblxuICByZXR1cm4gPGRpdiB7Li4uc3BhY2VyUHJvcHN9Lz47XG59XG5cblNwYWNlci5wcm9wVHlwZXMgPSB7XG4gIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgYXBwZWFyYW5jZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgc2l6ZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIsXG4gIGhlaWdodDogUHJvcFR5cGVzLm51bWJlcixcblxuICBpbmxpbmU6IFByb3BUeXBlcy5ib29sLFxuICBmbHVpZDogUHJvcFR5cGVzLmJvb2wsXG5cbn07XG5cblNwYWNlci5kZWZhdWx0UHJvcHMgPSB7XG4gIHNpemU6IFwibWVkaXVtXCJcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hcHAvU3BhY2VyLmpzeCIsImltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBwcm9wVHlwZXMgZnJvbSBcInByb3AtdHlwZXNcIjtcbmltcG9ydCB7IFRleHRBcmVhIH0gZnJvbSAnc2VtYW50aWMtdWktcmVhY3QnXG5cbi8vXG4vL1x0IyA8VGFiYmFibGVUZXh0QXJlYT4gLS0gPFNVSS5UZXh0QXJlYT4gaW4gd2hpY2ggeW91IGNhbiB0eXBlIGEgdGFiIGNoYXJhY3Rlcjpcbi8vXHQtIElmIG5vdGhpbmcgaXMgc2VsZWN0ZWQsIGluc2VydHMgYSB0YWIgY2hhcmFjdGVyXG4vL1x0LSBJZiBhbnl0aGluZyBpcyBzZWxlY3RlZCwgaW5zZXJ0cyB0YWIgY2hhcmFjdGVycyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lKHMpXG4vL1x0LSBJZiBzaGlmdCBrZXkgaXMgZG93biwgaW5zZXJ0cyB0YWIgY2hhcmFjdGVycyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lKHMpLlxuLy9cbi8vXHQjIyMgUHJvcGVydGllc1xuLy9cdC0gYHNhdmVgIChyZXF1aXJlZCkgLS0gZnVuY3Rpb24gdXNlZCB0byBzYXZlIHRoZSByZXN1bHRzIG9uIGtleXByZXNzXG4vL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFiYmFibGVUZXh0QXJlYSBleHRlbmRzIFRleHRBcmVhIHtcblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiA8VGV4dEFyZWEgey4uLnRoaXMucHJvcHN9IG9uS2V5RG93bj17dGhpcy5vbktleURvd259IC8+O1xuXHR9XG5cblx0Ly8gRG8gTk9UIGV4aXQgb24gdGFiIC0tIGluc2VydCBvciByZW1vdmUgdGFiKHMpIHZhbHVlIGluc3RlYWQuXG5cdG9uS2V5RG93biA9IChldmVudCkgPT4ge1xuXG4vL1RPRE8gZmlyZSBgdGhpcy5wcm9wcy5vbktleURvd25gIGlmIGRlZmluZWQuLi5cblx0XHQvLyBGb3JnZXQgaXQgaWYgbm90IGEgdGFiXG5cdFx0aWYgKGV2ZW50LmtleUNvZGUgIT09IDkpIHJldHVybjtcblxuXHRcdC8vIHByZXZlbnQgZGVmYXVsdCBzbyB3ZSBkb24ndCBleGl0IHRoZSBmaWVsZFxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHQvLyBmaWd1cmUgb3V0IHRoZSB0ZXh0IHJhbmdlXG5cdFx0dmFyIGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG5cdFx0dmFyIHRleHQgPSBlbGVtZW50LnZhbHVlO1xuXHRcdHZhciBzdGFydCA9IGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7XG5cdFx0dmFyIGVuZCA9IGVsZW1lbnQuc2VsZWN0aW9uRW5kO1xuXG5cdFx0Ly8gUmVwbGFjZW1lbnQgdGV4dFxuXHRcdGxldCBuZXdUZXh0ID0gXCJcIiwgc2VsZWN0aW9uU3RhcnQgPSBzdGFydCwgc2VsZWN0aW9uRW5kID0gZW5kO1xuXG5cdFx0Ly8gSWYgc2VsZWN0aW9uIGlzIGVtcHR5LFxuXHRcdGlmIChzdGFydCA9PT0gZW5kICYmICFldmVudC5zaGlmdEtleSkge1xuXHRcdFx0bmV3VGV4dCA9IFwiXFx0XCI7XG5cdFx0XHRzZWxlY3Rpb25TdGFydCA9IHNlbGVjdGlvbkVuZCA9IGVuZCArIDE7XG5cdFx0fVxuXHRcdC8vIG90aGVyd2lzZSBpbmRlbnQvZGUtaW5kZW50IGFsbCBvZiB0aGUgbGluZXNcblx0XHRlbHNlIHtcblx0XHQvLyB1c2Ugc3RhcnQgYW5kIGVuZCBvZiBsaW5lKHMpXG4vL2NvbnNvbGUuaW5mbyhgc3RhcnQ6ICR7c3RhcnR9IDoke3RleHRbc3RhcnRdfTogICBlbmQ6ICR7ZW5kfSA6ICR7dGV4dFtlbmRdfTpgKTtcblx0XHRcdGlmICh0ZXh0W3N0YXJ0XSAhPT0gXCJcXG5cIikgc3RhcnQgPSB0ZXh0Lmxhc3RJbmRleE9mKFwiXFxuXCIsIHN0YXJ0KSArIDE7XG5cdFx0XHRpZiAodGV4dFtlbmQtMV0gPT09IFwiXFxuXCIpIGVuZC0tO1xuXHRcdFx0ZWxzZSBpZiAodGV4dFtlbmQrMV0gIT09IFwiXFxuXCIpIGVuZCA9IHRleHQuaW5kZXhPZihcIlxcblwiLCBlbmQpIC0gMTtcbi8vY29uc29sZS5pbmZvKGBzdGFydDogJHtzdGFydH0gOiR7dGV4dFtzdGFydF19OiAgIGVuZDogJHtlbmR9IDogJHt0ZXh0W2VuZF19OmApO1xuXG5cdFx0XHRsZXQgbGluZXMgPSB0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpLnNwbGl0KFwiXFxuXCIpO1xuXHRcdFx0Ly8gaWYgc2hpZnQga2V5IGlzIGRvd24sIFJFTU9WRSBhIHRhYiBmcm9tIGVhY2ggbGluZVxuXHRcdFx0aWYgKGV2ZW50LnNoaWZ0S2V5KSB7XG5cdFx0XHRcdGxpbmVzID0gbGluZXMubWFwKGxpbmUgPT4gbGluZVswXSA9PT0gXCJcXHRcIiA/IGxpbmUuc3Vic3RyKDEpIDogbGluZSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBvdGhlcndpc2UgQUREIGEgdGFiIHRvIGVhY2ggbGluZVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGxpbmVzID0gbGluZXMubWFwKGxpbmUgPT4gXCJcXHRcIiArIGxpbmUpO1xuXHRcdFx0fVxuXHRcdFx0c2VsZWN0aW9uU3RhcnQgPSBzdGFydDtcblx0XHRcdG5ld1RleHQgPSBsaW5lcy5qb2luKFwiXFxuXCIpO1xuXHRcdFx0c2VsZWN0aW9uRW5kID0gc2VsZWN0aW9uU3RhcnQgKyBuZXdUZXh0Lmxlbmd0aCArIDE7XG5cdFx0fVxuXG5cdFx0Ly8gVXBkYXRlIGlucHV0IHZhbHVlLlxuXHRcdGVsZW1lbnQudmFsdWUgXHQ9IHRleHQuc3Vic3RyKDAsIHN0YXJ0KVxuXHRcdFx0XHRcdFx0KyBuZXdUZXh0XG5cdFx0XHRcdFx0XHQrIHRleHQuc3Vic3RyKGVuZCk7XG5cblx0XHQvLyBVcGRhdGUgdGhlIHNlbGVjdGlvblxuXHRcdGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPSBzZWxlY3Rpb25TdGFydDtcblx0XHRlbGVtZW50LnNlbGVjdGlvbkVuZCA9IHNlbGVjdGlvbkVuZDtcblxuXHRcdC8vIERlbGVnYXRlIHRvIGBwcm9wcy5vbkNoYW5nZWAgdG8gc2F2ZSB0aGUgdmFsdWUgb3V0c2lkZSBvZiB0aGUgY29udHJvbFxuXHRcdGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB0aGlzLnByb3BzLm9uQ2hhbmdlKGV2ZW50KTtcblx0fVxuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL1RhYmJhYmxlVGV4dEFyZWEuanN4IiwiLy8gQ29tbW9uIGltcG9ydHNcbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuXG4vLyBQYXJzZXJcbmltcG9ydCBwYXJzZXIgZnJvbSBcIi4uL3J1bGVzL3NwZWxsL2luZGV4LmpzXCI7XG5cbi8vIEFwcC1zcGVjaWZpYyBpbXBvcnRzXG5pbXBvcnQgU3BlbGxFZGl0b3IgZnJvbSBcIi4vU3BlbGxFZGl0b3IuanN4XCI7XG5cbi8vIEtpY2sgb2ZmIG91ciB0b3AtbGV2ZWwgZWxlbWVudFxuUmVhY3RET00ucmVuZGVyKFxuICA8U3BlbGxFZGl0b3IgLz4sXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdC1yb290Jylcbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL2luZGV4LmpzeCIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gIFJlYWN0IFV0aWxpdHkgZnVuY3Rpb25zXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gYGNsYXNzTmFtZXNgLCBjb25jZXB0IHN0b2xlbiBmcm9tOiAgaHR0cDovL2plZHdhdHNvbi5naXRodWIuaW8vY2xhc3NuYW1lc1xuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzTmFtZXMgKC4uLmFyZ3MpIHtcbiAgcmV0dXJuIGFyZ3MubWFwKCBhcmcgPT4ge1xuICAgIGlmICghYXJnKSByZXR1cm4gXCJcIjtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSByZXR1cm4gY2xhc3NOYW1lcyguLi5hcmcpO1xuICAgIHN3aXRjaCAodHlwZW9mIGFyZykge1xuICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgY2FzZSBcInN0cmluZ1wiOiAgcmV0dXJuIGFyZztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhhcmcpLm1hcCgga2V5ID0+IGFyZ1trZXldID8ga2V5IDogXCJcIilcbiAgICAgICAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICAgICAgICAgICAgLmpvaW4oXCIgXCIpO1xuICAgIH1cbiAgfSkuZmlsdGVyKEJvb2xlYW4pXG4gICAgLmpvaW4oXCIgXCIpO1xufVxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL3V0aWwuanMiLCIvLyBNZW1vaXplL2ZvcmdldCBzZW1hbnRpY3MuXG5cbi8vIFJldHVybiBhIG1lbW9pemluZyBnZXR0ZXIgZnVuY3Rpb24uXG4vLyBURVNUTUVcbmV4cG9ydCBmdW5jdGlvbiBtZW1vaXplZChwcm9wZXJ0eSwgZ2V0dGVyKSB7XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRpZiAodGhpc1twcm9wZXJ0eV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dmFyIHZhbHVlID0gZ2V0dGVyLmFwcGx5KHRoaXMpO1xuXHRcdFx0aWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Ly8gRGVmaW5lIHNvIHRoYXQgd2UgY2FuIGJlIGRlbGV0ZWQgYW5kIHJlLWRlZmluZWQsIGJ1dCBub3Qgc2V0IG9yIGVudW1lcmF0ZWQuXG5cdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBwcm9wZXJ0eSwgeyB2YWx1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdGhpc1twcm9wZXJ0eV07XG5cdH1cbn1cblxuXG4vLyBSZXR1cm4gYSBtZW1vaXplIGZ1bmN0aW9uIGZvciB1c2UgYXMgYSBnZXR0ZXIgaW4gYSBgT2JqZWN0LmRlZmluZVByb3BlcnR5KClgXG4vLyBURVNUTUVcbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVNZW1vaXplZChwcm9wZXJ0eSwgZ2V0dGVyKSB7XG5cdHJldHVybiB7XG5cdFx0Z2V0IDogbWVtb2l6ZWQocHJvcGVydHksIGdldHRlcilcblx0fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21lbW9pemUuanMiLCIvL1xuLy9cdCMgUnVsZXMgcGFyc2luZyBqc3hcbi8vXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBUb2tlbml6ZXIgZnJvbSBcIi4uLy4uL1Rva2VuaXplclwiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVcIjtcblxuLy8gQ3JlYXRlIFwiSlNYXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck5hbWUoXCJKU1hcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwianN4XCIsXG4gICAgYWxpYXM6IFsgXCJleHByZXNzaW9uXCIsIFwic3RhdGVtZW50XCIgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MganN4RWxlbWVudCBleHRlbmRzIFJ1bGUge1xuICAgICAgLy8gVGV4dCBzdHJpbmdzIGdldCBlbmNvZGVkIGFzIGB0ZXh0YCBvYmplY3RzIGluIHRoZSB0b2tlbiBzdHJlYW0uXG4gICAgICBwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQgPSB0b2tlbnMubGVuZ3RoKSB7XG4gICAgICAgIGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG4gICAgICAgIGlmICghKHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEVsZW1lbnQpKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSh7XG4gICAgICAgICAgbWF0Y2hlZDogdG9rZW4sXG4gICAgICAgICAgbmV4dFN0YXJ0OiBzdGFydCArIDFcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgb3VyIGF0dHJpYnV0ZXMgdG8gc291cmNlLlxuICAgICAgLy8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBubyBhdHRyaWJ1dGVzLlxuICAgICAgYXR0cnNUb1NvdXJjZShqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIGxldCBhdHRyaWJ1dGVzID0ganN4RWxlbWVudC5hdHRyaWJ1dGVzO1xuICAgICAgICBpZiAoIWF0dHJpYnV0ZXMgfHwgIWF0dHJpYnV0ZXMubGVuZ3RoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgICAgIGxldCBhdHRycyA9IGF0dHJpYnV0ZXMubWFwKCAoeyBuYW1lLCB2YWx1ZSB9KSA9PiB7XG4gICAgICAgICAgLy8gaWYgTk8gdmFsdWUsIGFzc3VtZSBpdCdzIGEgdmFyaWFibGUgb2YgdGhlIHNhbWUgbmFtZVxuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB2YWx1ZSA9IG5hbWU7XG4gICAgICAgICAgLy8gaWYgaXQncyBhbiBhcnJheSwgaXQncyBhIHNwZWxsIGV4cHJlc3Npb24sIHBvc3NpYmx5IHdpdGggbmVzdGVkIEpTWCBlbGVtZW50cy4uLlxuICAgICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5qc3hFeHByZXNzaW9uVG9Tb3VyY2UodmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBlbHNlIGlmIGEgSlNYIGVsZW1lbnQsIHJlY3Vyc2VcbiAgICAvL1RPRE86IGluZGVudC4uLlxuICAgICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9Tb3VyY2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGlmIGEgbnVtYmVyIG9yIFRleHQgbGl0ZXJhbCwganVzdCB1c2UgaXRcblxuICAgICAgICAgIC8vIHNwZWNpYWwgY2FzZSBgY2xhc3NgIHRvIGBjbGFzc05hbWVgIGJlY2F1c2UgUmVhY3QgaXMgZWZmaW5nIHBlcnNuaWNrZXR5LlxuICAgICAgICAgIGlmIChuYW1lID09PSBcImNsYXNzXCIpIG5hbWUgPSBcImNsYXNzTmFtZVwiO1xuICAgIC8vVE9ETzogZXNjYXBlIG5hbWVzIHdoaWNoIGFyZSBpbnZhbGlkIEpTIGlkZW50aWZpZXJzXG4gICAgICAgICAgcmV0dXJuIGAke25hbWV9OiAke3ZhbHVlfWA7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBgeyAke2F0dHJzLmpvaW4oXCIsIFwiKX0gfWA7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhbiBhcnJheSB3aXRoIHNvdXJjZSBmb3IgZWFjaCBvZiBvdXIgY2hpbGRyZW4uXG4gICAgICAvLyBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIHdlIGRvbid0IGhhdmUgYW55IGNoaWxkcmVuLlxuICAgICAgY2hpbGRyZW5Ub1NvdXJjZShqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIGxldCBjaGlsZHJlbiA9IGpzeEVsZW1lbnQuY2hpbGRyZW47XG4gICAgICAgIGlmICghY2hpbGRyZW4gfHwgY2hpbGRyZW4ubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcbiAgICAvL1RPRE86IGVzY2FwZSBpbm5lciBxdW90ZXMuLi5cbiAgICAgICAgICBpZiAodHlwZW9mIGNoaWxkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAvL2ZvcmdldCBpdCBpZiB3aGl0ZXNwYWNlIG9ubHkuLi4gPz8/XG4gICAgICAgICAgICBsZXQgdGV4dCA9IGNoaWxkLnRyaW0oKTtcbiAgICAgICAgICAgIGlmICghdGV4dCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJldHVybiBgXCIke3RleHR9XCJgO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBUb2tlbml6ZXIuSlNYRWxlbWVudCkge1xuICAgICAgICAgICAgbGV0IGNoaWxkU291cmNlID0gdGhpcy5qc3hFbGVtZW50VG9Tb3VyY2UoY2hpbGQpO1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkU291cmNlLnNwbGl0KFwiXFxuXCIpLmpvaW4oXCJcXG5cXHRcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIFRva2VuaXplci5KU1hFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5qc3hFeHByZXNzaW9uVG9Tb3VyY2UoY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJjaGlsZHJlblRvU291cmNlKCk6IGRvbid0IHVuZGVyc3RhbmQgY2hpbGRcIiArICBjaGlsZCk7XG4gICAgICAgIH0pXG4gICAgICAgIC8vIHJlbW92ZSB1bmRlZmluZWQvZW1wdHkgc3RyaW5nIHJ1bGVzXG4gICAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgSlNYIGV4cHJlc3Npb24gKCBgey4uLn1gICkgdG8gSlMgc291cmNlLlxuICAgICAganN4RXhwcmVzc2lvblRvU291cmNlKGpzeEV4cHJlc3Npb24pIHtcbiAgICAgICAgbGV0IHRva2VucyA9IGpzeEV4cHJlc3Npb24udG9rZW5zO1xuICAgIGNvbnNvbGUuaW5mbyhqc3hFeHByZXNzaW9uLCB0b2tlbnMpO1xuICAgICAgICByZXR1cm4gXCIvXCIgKyBgKlRPRE86ICR7dG9rZW5zLmpvaW4oXCIgXCIpfSpgICsgXCIvXCI7XG4gICAgICB9XG5cbiAgICAgIGpzeEVsZW1lbnRUb1NvdXJjZShqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIC8vIGdldCB0aGUgYml0cyBvZiB0aGUgb3V0cHV0XG4gICAgICAgIGxldCB0YWdOYW1lID0gYFwiJHtqc3hFbGVtZW50LnRhZ05hbWV9XCJgO1xuICAgICAgICBsZXQgYXR0cnMgPSB0aGlzLmF0dHJzVG9Tb3VyY2UoanN4RWxlbWVudCk7XG4gICAgICAgIGxldCBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW5Ub1NvdXJjZShqc3hFbGVtZW50KTtcblxuICAgICAgICBsZXQgb3V0cHV0ID0gYGNyZWF0ZUVsZW1lbnQoJHt0YWdOYW1lfWA7XG4gICAgICAgIGlmICghYXR0cnMgJiYgY2hpbGRyZW4pIGF0dHJzID0gXCJudWxsXCI7XG5cbiAgICAgICAgaWYgKGF0dHJzKSBvdXRwdXQgKz0gYCwgJHthdHRyc31gO1xuICAgICAgICBpZiAoY2hpbGRyZW4pIHtcbiAgICAgICAgICBvdXRwdXQgKz0gXCIsXFxuXFx0XCIgKyBjaGlsZHJlbi5qb2luKFwiLFxcblxcdFwiKSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0ICs9IFwiKVwiXG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5qc3hFbGVtZW50VG9Tb3VyY2UodGhpcy5tYXRjaGVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvSlNYLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBpZiBzdGF0ZW1lbnRzLlxuLy9cblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG4vLyBDcmVhdGUgXCJpZlwiIHBhcnNlci5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JOYW1lKFwiaWZcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwiaWZcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiaWYge2NvbmRpdGlvbjpleHByZXNzaW9ufSAodGhlbnw6KT8ge3N0YXRlbWVudH0/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlmXyBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGNvbmRpdGlvbiwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuICAvL1x0XHRcdGlmIChzdGF0ZW1lbnQgJiYgYmxvY2spIHRocm93IG5ldyBTeW50YXhFcnJvcihcImlmIG1heSBvbmx5IGhhdmUgaW5saW5lIHN0YXRlbWVudCBPUiBibG9ja1wiKTtcbiAgICAgICAgbGV0IHN0YXRlbWVudHMgPSBSdWxlLkJsb2NrLmVuY2xvc2VTdGF0ZW1lbnRzKHN0YXRlbWVudCwgYmxvY2spO1xuICAgICAgICByZXR1cm4gYGlmICgke2NvbmRpdGlvbn0pICR7c3RhdGVtZW50c31gO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBOT1RFOiB0aGlzIGlzIE5PVCBhIGJsb2NrIHN0YXRlbWVudC4uLiA/Pz9cbiAge1xuICAgIG5hbWU6IFwiYmFja3dhcmRzX2lmXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIntzdGF0ZW1lbnR9IGlmIHtjb25kaXRpb246ZXhwcmVzc2lvbn0gKD86KGVsc2V8b3RoZXJ3aXNlKSB7ZWxzZVN0YXRlbWVudDpzdGF0ZW1lbnR9KT9cIixcbiAgICBsZWZ0UmVjdXJzaXZlOiB0cnVlLFxuICAgIHRlc3RSdWxlOiBuZXcgUnVsZS5LZXl3b3Jkcyh7IGxpdGVyYWxzOiBbIFwiaWZcIiBdIH0pLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBiYWNrd2FyZHNfaWYgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBjb25kaXRpb24sIHN0YXRlbWVudCwgZWxzZVN0YXRlbWVudCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBsZXQgb3V0cHV0ID0gYGlmICgke2NvbmRpdGlvbn0pIHsgJHtzdGF0ZW1lbnR9IH1gO1xuICAgICAgICBpZiAoZWxzZVN0YXRlbWVudCkgb3V0cHV0ICs9IGBcXG5lbHNlIHsgJHtlbHNlU3RhdGVtZW50fSB9YFxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJlbHNlX2lmXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIihlbHNlfG90aGVyd2lzZSkgaWYge2NvbmRpdGlvbjpleHByZXNzaW9ufSAodGhlbnw6KSB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZWxzZV9pZiBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGNvbmRpdGlvbiwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuICAvL1x0XHRcdGlmIChzdGF0ZW1lbnQgJiYgYmxvY2spIHRocm93IG5ldyBTeW50YXhFcnJvcihcImVsc2UgaWYgbWF5IG9ubHkgaGF2ZSBpbmxpbmUgc3RhdGVtZW50IE9SIGJsb2NrXCIpO1xuICAgICAgICBsZXQgc3RhdGVtZW50cyA9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoc3RhdGVtZW50LCBibG9jayk7XG4gICAgICAgIHJldHVybiBgZWxzZSBpZiAoJHtjb25kaXRpb259KSAke3N0YXRlbWVudHN9YFxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJlbHNlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIihlbHNlfG90aGVyd2lzZSkgKDopPyB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZWxzZV8gZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBzdGF0ZW1lbnQsIGJsb2NrIH0gPSB0aGlzLnJlc3VsdHM7XG4gIC8vXHRcdFx0aWYgKHN0YXRlbWVudCAmJiBibG9jaykgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiZWxzZSBpZiBtYXkgb25seSBoYXZlIGlubGluZSBzdGF0ZW1lbnQgT1IgYmxvY2tcIik7XG4gICAgICAgIGxldCBzdGF0ZW1lbnRzID0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhzdGF0ZW1lbnQsIGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIGBlbHNlICR7c3RhdGVtZW50c31gXG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL2lmLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBkZWFsaW5nIHdpdGggbGlzdHNcbi8vXG5cbi8vIFRPRE86IGNvbmZpcm0gaWRlbnRpZmllcnMgYXJlIHBsdXJhbCBpbiBzb21lIG9mIHRoZSBiZWxvdz9cbi8vIFRPRE86IGBsaXN0LmNsb25lKClgIHRvIHJldHVybiBuZXcgbGlzdCBvZiBzYW1lIHR5cGUuXG5cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4uLy4uL1BhcnNlclwiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVcIjtcblxuaW1wb3J0IHsgaXNQbHVyYWwsIHNpbmd1bGFyaXplIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3N0cmluZ1wiO1xuXG4vLyBDcmVhdGUgXCJsaXN0c1wiIHBhcnNlci5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JOYW1lKFwibGlzdHNcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cblxuLy8gV09SS0lORyBGUk9NIE9USEVSIFJVTEVTICh0ZXN0bWUpXG4vL1x0YHRoZSBsZW5ndGggb2YgPGxpc3Q+YFxuLy9cdGA8dGhpbmc+IGlzIG5vdD8gaW4gPGxpc3Q+YFxuLy9cdGA8bGlzdD4gaXMgbm90PyBlbXB0eWBcbi8vXHRgc2V0IGl0ZW0gMSBvZiBteUxpc3QgdG8gJ2EnYFxuXG5cbi8vIFRPRE86IFx0YGNyZWF0ZSBsaXN0IHdpdGggPGV4cD4sIDxleHA+LCA8ZXhwPmBcbi8vIFRPRE86XHRgZHVwbGljYXRlIGxpc3RgXG4vLyBUT0RPOlx0YGR1cGxpY2F0ZSBsaXN0IHdpdGggPGV4cD4sIDxleHA+LCA8ZXhwPmAgPz8/XG4vLyBUT0RPOlx0YHRoZSBzaXplIG9mIDxsaXN0PmAgPT4gd2lsbCBtYXAgdG8gYGxpc3Quc2l6ZWAuLi5cbi8vXHRcdFx0XHQtIGluc3RhbGwgYHNpemVgIGFzIGFuIGFsaWFzIHRvIGBsZW5ndGhgP1xuLy8gVE9ETzpcdGBtb3ZlIDx0aGluZz4gdG8gZW5kIG9mIDxsaXN0PmAgPz8/XG4vLyBUT0RPOlx0YFNldGAgZm9yIGEgdW5pcXVlIGxpc3Q/XG4vLyBUT0RPOlx0dHlwZWQgbGlzdD9cbi8vIFRPRE86XHRsaXN0IHdoaWNoIHdvbid0IHRha2UgbnVsbC91bmRlZmluZWRcblxuXG5wYXJzZXIuZGVmaW5lUnVsZXMoXG4gIC8vIFJldHVybiB0aGUgbGVuZ3RoIG9mIHRoZSBsaXN0LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2xlbmd0aFwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwidGhlPyBudW1iZXIgb2Yge2lkZW50aWZpZXJ9IGluIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfbGVuZ3RoIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCwgaWRlbnRpZmllciB9ID0gdGhpcy5yZXN1bHRzO1xuICAvLyBUT0RPOiBzcGVjaWFsIGNhc2UgJ3dvcmRzJywgJ2xpbmVzJywgZXRjXG4gICAgICAgIHJldHVybiBgJHtsaXN0fS5sZW5ndGhgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBSZXR1cm4gdGhlIGZpcnN0IHBvc2l0aW9uIG9mIHNwZWNpZmllZCBpdGVtIGluIHRoZSBsaXN0IGFzIGFuIGFycmF5LlxuICAvLyBJZiBpdGVtIGlzIG5vdCBmb3VuZCwgcmV0dXJucyBgdW5kZWZpbmVkYC5cbiAgLy8gTk9URTogdGhpcyBwb3NpdGlvbiByZXR1cm5lZCBpcyAqKjEtYmFzZWQqKi5cbiAgLy9URVNUTUVcbiAgLy8gVE9ETzogYHBvc2l0aW9uc2AsIGBsYXN0IHBvc2l0aW9uYCwgYGFmdGVyLi4uYFxuICB7XG4gICAgbmFtZTogXCJsaXN0X3Bvc2l0aW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ0aGU/IHBvc2l0aW9uIG9mIHt0aGluZzpleHByZXNzaW9ufSBpbiB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3Bvc2l0aW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5wb3NpdGlvbk9mKCR7dGhpbmd9LCAke2xpc3R9KWBcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy9cbiAgLy9cdE9yZGluYWwgbnVtYmVycyAoZmlyc3QsIHNlY29uZCwgbGFzdCwgZXRjKS5cbiAgLy8gVE9ETzogc2l4dHktZmlmdGgsIHR3byBodW5kcmVkIGZvcnR5IG5pbnRoLi4uXG4gIC8vXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiZmlyc3RcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDEgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInNlY29uZFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gMiB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwidGhpcmRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDMgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImZvdXJ0aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gNCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiZmlmdGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDUgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInNpeHRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiA2IH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJzZXZlbnRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiA3IH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJlaWdodGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDggfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcIm5pbnRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiA5IH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJ0ZW50aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gMTAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInBlbnVsdGltYXRlXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAtMiB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiZmluYWxcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIC0xIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJsYXN0XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAtMSB9XG4gICAgfVxuICB9LFxuXG5cblxuICAvLyB0cmVhdCBsaXN0IGFzIGEgc3RhY2sgb3IgcXVldWVcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJ0b3BcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDEgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImJvdHRvbVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gLTEgfVxuICAgIH1cbiAgfSxcblxuXG5cbiAgLy8gSW5kZXggZXhwcmVzc2lvbjogbnVtZXJpYyBwb3NpdGlvbiBpbiBzb21lIGxpc3QuXG4gIC8vXHRlLmcuXHRgY2FyZCAxIG9mIHRoZSBwaWxlYFxuICAvL1x0XHRcdGBjYXJkICMyIG9mIHRoZSBwaWxlYFxuICAvL1x0XHRcdGB0aGUgZmlyc3QgY2FyZCBvZiB0aGUgcGlsZWBcbiAgLy9cbiAgLy8gTk9URTogTmVnYXRpdmUgbnVtZXJpYyBwb3NpdGlvbnMgY29tZSBmcm9tIHRoZSBFTkQgb2YgdGhlIGxpc3QuXG4gIC8vXHRlLmcuXHRgY2FyZCAtMSBvZiB0aGUgcGlsZWBcbiAgLy9cbiAgLy8gTk9URTogT3VyIHBvc2l0aW9ucyBhcmUgKioxLWJhc2VkKiogYW5kIEphdmFzY3JpcHQgaXMgKiowLWJhc2VkKiouXG4gIC8vXHRcdCBlLmcuIGBpdGVtIDEgb2YgdGhlIGFycmF5YCAgPSBgYXJyYXlbMF1gXG4gIC8vXG4gIC8vIFRPRE86IGlmIGBpZGVudGlmaWVyYCBpcyBcIndvcmRcIiwgb3V0cHV0IGBnZXRXb3JkKClgIGV0Y1xuICAvLyBUT0RPOiBzcGVjaWFsIGNhc2UgJ3dvcmRzJywgJ2xpbmVzJywgZXRjID9cbiAge1xuICAgIG5hbWU6IFwicG9zaXRpb25fZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFtcbiAgICAgIFwie2lkZW50aWZpZXJ9IHtwb3NpdGlvbjpleHByZXNzaW9ufSBvZiAodGhlPykge2V4cHJlc3Npb259XCIsXG4gICAgICBcInRoZSB7cG9zaXRpb246b3JkaW5hbH0ge2lkZW50aWZpZXJ9IG9mICh0aGU/KSB7ZXhwcmVzc2lvbn1cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHBvc2l0aW9uX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNle1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGlkZW50aWZpZXIsIHBvc2l0aW9uLCBleHByZXNzaW9uIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIC8vIElmIHdlIGdvdCBhIHBvc2l0aXZlIG51bWJlciBsaXRlcmFsLCBjb21wZW5zYXRlIGZvciBKUyAwLWJhc2VkIGFycmF5cyBub3csIGZvciBuaWNlciBvdXRwdXQuXG4gICAgICAgIGlmICh0eXBlb2YgcG9zaXRpb24gPT09IFwibnVtYmVyXCIgJiYgcG9zaXRpb24gPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIGAke2V4cHJlc3Npb259WyR7cG9zaXRpb24gLSAxfV1gO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0SXRlbSgke2V4cHJlc3Npb259LCAke3Bvc2l0aW9ufSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFBpY2sgYSBTSU5HTEUgcmFuZG9tIGl0ZW0gZnJvbSB0aGUgbGlzdC5cbiAgLy8gVE9ETzogY29uZmlybSBpZGVudGlmaWVyIGlzIHBsdXJhbD9cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmFuZG9tX3Bvc2l0aW9uX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcImEgcmFuZG9tIHtpZGVudGlmaWVyfSAob2Z8ZnJvbXxpbikgKHRoZSk/IHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJhbmRvbV9wb3NpdGlvbl9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldFJhbmRvbUl0ZW1PZigke2xpc3R9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFBpY2sgYSB1bmlxdWUgc2V0IG9mIHJhbmRvbSBpdGVtcyBmcm9tIHRoZSBsaXN0LCByZXR1cm5pbmcgYW4gYXJyYXkuXG4gIC8vIFRPRE86IGB0d28gcmFuZG9tIGl0ZW1zLi4uYFxuICAvLyBUT0RPOiBjb25maXJtIGlkZW50aWZpZXIgaXMgcGx1cmFsP1xuICAvLyBUT0RPOiBgbGlzdC5jbG9uZSgpYCB0byByZXR1cm4gbmV3IGxpc3Qgb2Ygc2FtZSB0eXBlLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJyYW5kb21fcG9zaXRpb25zX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIntudW1iZXJ9IHJhbmRvbSB7aWRlbnRpZmllcn0gKG9mfGZyb218aW4pICh0aGUpPyB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5kb21fcG9zaXRpb25zX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBudW1iZXIsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5kb21JdGVtc09mKCR7bGlzdH0sICR7bnVtYmVyfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFJhbmdlIGV4cHJlc3Npb24uXG4gIC8vIFJldHVybnMgYSBuZXcgbGlzdC5cbiAgLy8gTk9URTogYHN0YXJ0YCBpcyAqKjEtYmFzZWQqKi5cbiAgLy8gTk9URTogYGVuZGAgaXMgaW5jbHVzaXZlIVxuICAvLyBUT0RPOiBjb25maXJtIGlkZW50aWZpZXIgaXMgcGx1cmFsP1xuICAvLyBUT0RPOiBgbGlzdC5jbG9uZSgpYCB0byByZXR1cm4gbmV3IGxpc3Qgb2Ygc2FtZSB0eXBlLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJyYW5nZV9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7aWRlbnRpZmllcn0ge3N0YXJ0OmV4cHJlc3Npb259IHRvIHtlbmQ6ZXhwcmVzc2lvbn0gb2Yge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHN0YXJ0LCBlbmQsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5nZSgke2xpc3R9LCAke3N0YXJ0fSwgJHtlbmR9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFN0YXJ0aW5nIHJhbmdlIGV4cHJlc3Npb24uXG4gIC8vIFJldHVybnMgYSBuZXcgbGlzdC5cbiAgLy8gZS5nLlx0YGZpcnN0IDQgaXRlbXMgb2YgbGlzdGBcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwiZmlyc3RfaW5fcmFuZ2VcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcImZpcnN0IHtudW1iZXI6ZXhwcmVzc2lvbn0ge2lkZW50aWZpZXJ9IChpbnxvZikge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG51bWJlciwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldFJhbmdlKCR7bGlzdH0sIDEsICR7bnVtYmVyfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBFbmRpbmcgcmFuZ2UgZXhwcmVzc2lvbi5cbiAgLy8gUmV0dXJucyBhIG5ldyBsaXN0LlxuICAvLyBlLmcuXHRgbGFzdCA0IGl0ZW1zIG9mIGxpc3RgXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxhc3RfaW5fcmFuZ2VcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcImxhc3Qge251bWJlcjpleHByZXNzaW9ufSB7aWRlbnRpZmllcn0gKGlufG9mKSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5nZV9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbnVtYmVyLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0RW5kUmFuZ2UoJHtsaXN0fSwgMSwgJHtudW1iZXJ9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gUmFuZ2UgZXhwcmVzc2lvbiBzdGFydGluZyBhdCBzb21lIGl0ZW0gaW4gdGhlIGxpc3QuXG4gIC8vIFJldHVybnMgYSBuZXcgbGlzdC5cbiAgLy8gSWYgaXRlbSBpcyBub3QgZm91bmQsIHJldHVybnMgYW4gZW1wdHkgbGlzdC4gKD8/PylcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmFuZ2VfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2lkZW50aWZpZXJ9IChpbnxvZikge2xpc3Q6ZXhwcmVzc2lvbn0gc3RhcnRpbmcgd2l0aCB7dGhpbmc6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0UmFuZ2UoJHtsaXN0fSwgc3BlbGwucG9zaXRpb25PZigke3RoaW5nfSwgJHtsaXN0fSkpYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBMaXN0IGZpbHRlci5cbiAgLy8gTk9URTogd2Ugd2lsbCBzaW5ndWxhcml6ZSBgaWRlbnRpZmllcmAgYW5kIHVzZSB0aGF0IGFzIHRoZSBhcmd1bWVudCB0byBgZXhwcmVzc2lvbmAuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfZmlsdGVyXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7aWRlbnRpZmllcn0gKGlufG9mKSB7bGlzdDpleHByZXNzaW9ufSB3aGVyZSB7Y29uZGl0aW9uOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfZmlsdGVyIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgaWRlbnRpZmllciwgY29uZGl0aW9uLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIC8vIHVzZSBzaW5ndWxhciBvZiBpZGVudGlmaWVyIGZvciBtZXRob2QgYXJndW1lbnRcbiAgICAgICAgbGV0IGFyZ3VtZW50ID0gc2luZ3VsYXJpemUoaWRlbnRpZmllci50b1NvdXJjZSgpKTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5maWx0ZXIoJHtsaXN0fSwgJHthcmd1bWVudH0gPT4gJHtjb25kaXRpb259KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gU2V0IG1lbWJlcnNoaXAgKGxlZnQgcmVjdXJzaXZlKS5cbiAgLy8gTk9URTogd2Ugd2lsbCBzaW5ndWxhcml6ZSBgaWRlbnRpZmllcmAgYW5kIHVzZSB0aGF0IGFzIHRoZSBhcmd1bWVudCB0byBgZXhwcmVzc2lvbmAuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfbWVtYmVyc2hpcF90ZXN0XCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7bGlzdDpleHByZXNzaW9ufSAob3BlcmF0b3I6aGFzfGhhcyBub3xkb2VzbnQgaGF2ZXxkb2VzIG5vdCBoYXZlKSB7aWRlbnRpZmllcn0gd2hlcmUge2ZpbHRlcjpleHByZXNzaW9ufVwiLFxuICAgIGxlZnRSZWN1cnNpdmU6IHRydWUsXG4gICAgdGVzdFJ1bGU6IG5ldyBSdWxlLktleXdvcmRzKHsgbWF0Y2g6IFwid2hlcmVcIiB9KSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9tZW1iZXJzaGlwX3Rlc3QgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyLCBvcGVyYXRvciwgZmlsdGVyLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIGxldCBiYW5nID0gb3BlcmF0b3IgPT09IFwiaGFzXCIgPyBcIlwiIDogXCIhXCI7XG4gICAgICAgIC8vIHVzZSBzaW5ndWxhciBvZiBpZGVudGlmaWVyIGZvciBtZXRob2QgYXJndW1lbnRcbiAgICAgICAgbGV0IGFyZ3VtZW50ID0gc2luZ3VsYXJpemUoaWRlbnRpZmllci50b1NvdXJjZSgpKTtcbiAgICAgICAgcmV0dXJuIGAke2Jhbmd9c3BlbGwuYW55KCR7bGlzdH0sICR7YXJndW1lbnR9ID0+ICR7ZmlsdGVyfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvL1xuICAvL1x0QWRkaW5nIHRvIGxpc3QgKGluLXBsYWNlKVxuICAvL1xuXG4gIC8vIEFkZCB0byBlbmQgb2YgbGlzdC5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9hcHBlbmRcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiYXBwZW5kIHt0aGluZzpleHByZXNzaW9ufSB0byB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgICAgXCJhZGQge3RoaW5nOmV4cHJlc3Npb259IHRvICgodGhlPykgZW5kIG9mKT8ge2xpc3Q6ZXhwcmVzc2lvbn1cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfYXBwZW5kIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5hcHBlbmQoJHtsaXN0fSwgJHt0aGluZ30pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gQWRkIHRvIGJlZ2lubmluZyBvZiBsaXN0LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3ByZXBlbmRcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFtcbiAgICAgIFwicHJlcGVuZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwiYWRkIHt0aGluZzpleHByZXNzaW9ufSB0byB0aGUgKHN0YXJ0fGZyb250fHRvcCkgb2Yge2xpc3Q6ZXhwcmVzc2lvbn1cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcHJlcGVuZCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwucHJlcGVuZCgke2xpc3R9LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBBZGQgdG8gbWlkZGxlIG9mIGxpc3QsIHB1c2hpbmcgZXhpc3RpbmcgaXRlbXMgb3V0IG9mIHRoZSB3YXkuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfYWRkX2F0XCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn0gYXQgcG9zaXRpb24ge3Bvc2l0aW9uOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3Rfc3BsaWNlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIHBvc2l0aW9uLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuc3BsaWNlKCR7bGlzdH0sICR7cG9zaXRpb259LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFRPRE86ICBcdFwiYWRkIHt0aGluZzpleHByZXNzaW9ufSB0byB7bGlzdDpleHByZXNzaW9ufSBiZWZvcmUge2l0ZW06ZXhwcmVzc2lvbn1cIixcblxuICAvLyBBZGQgdG8gbWlkZGxlIG9mIGxpc3QsIHB1c2hpbmcgZXhpc3RpbmcgaXRlbXMgb3V0IG9mIHRoZSB3YXkuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfYWRkX2FmdGVyXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn0gYWZ0ZXIge2l0ZW06ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9hZGRfYWZ0ZXIgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgaXRlbSwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnNwbGljZSgke2xpc3R9LCBzcGVsbC5wb3NpdGlvbk9mKCR7bGlzdH0sICR7aXRlbX0pLCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvL1xuICAvL1x0UmVtb3ZpbmcgZnJvbSBsaXN0IChpbi1wbGFjZSlcbiAgLy9cblxuICAvLyBFbXB0eSBsaXN0LlxuICAvL1RPRE86IG1ha2UgYGVtcHR5YCBhbmQvb3IgYGNsZWFyYCBhIGdlbmVyaWMgc3RhdGVtZW50Pz8/XG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfZW1wdHlcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiKGVtcHR5fGNsZWFyKSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X2VtcHR5IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmNsZWFyKCR7bGlzdH0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gUmVtb3ZlIG9uZSBpdGVtIGZyb20gbGlzdCBieSBwb3NpdGlvbi5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9yZW1vdmVfcG9zaXRpb25cIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwicmVtb3ZlIHtpZGVudGlmaWVyfSB7bnVtYmVyOmV4cHJlc3Npb259IG9mIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcmVtb3ZlX3Bvc2l0aW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbnVtYmVyLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwucmVtb3ZlSXRlbSgke2xpc3R9LCAke251bWJlcn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gUmVtb3ZlIHJhbmdlIG9mIHRoaW5ncyBmcm9tIGxpc3QuXG4gIC8vIE5PVEU6IGBzdGFydGAgaXMgKioxLWJhc2VkKiouXG4gIC8vIE5PVEU6IGBlbmRgIGlzIGluY2x1c2l2ZSFcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9yZW1vdmVfcmFuZ2VcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwicmVtb3ZlIHtpZGVudGlmaWVyfSB7c3RhcnQ6ZXhwcmVzc2lvbn0gdG8ge2VuZDpleHByZXNzaW9ufSBvZiB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3JlbW92ZV9wb3NpdGlvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHN0YXJ0LCBlbmQsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5yZW1vdmVSYW5nZSgke2xpc3R9LCAke3N0YXJ0fSwgJHtlbmR9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gUmVtb3ZlIGFsbCBpbnN0YW5jZXMgb2Ygc29tZXRoaW5nIGZyb20gYSBsaXN0LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3JlbW92ZVwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJyZW1vdmUge3RoaW5nOmV4cHJlc3Npb259IGZyb20ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9yZW1vdmUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnJlbW92ZSgke2xpc3R9LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBSZW1vdmUgYWxsIGl0ZW1zIGZyb20gbGlzdCB3aGVyZSBjb25kaXRpb24gaXMgdHJ1ZS5cbiAgLy8gTk9URTogd2Ugd2lsbCBzaW5ndWxhcml6ZSBgaWRlbnRpZmllcmAgYW5kIHVzZSB0aGF0IGFzIHRoZSBhcmd1bWVudCB0byBgZXhwcmVzc2lvbmAuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcmVtb3ZlX3doZXJlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJlbW92ZSB7aWRlbnRpZmllcn0gKGlufG9mfGZyb20pIHtsaXN0OmV4cHJlc3Npb259IHdoZXJlIHtjb25kaXRpb246ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9yZW1vdmVfd2hlcmUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyLCBjb25kaXRpb24sIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgLy8gdXNlIHNpbmd1bGFyIG9mIGlkZW50aWZpZXIgZm9yIG1ldGhvZCBhcmd1bWVudFxuICAgICAgICBsZXQgYXJndW1lbnQgPSBzaW5ndWxhcml6ZShpZGVudGlmaWVyLnRvU291cmNlKCkpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnJlbW92ZVdoZXJlKCR7bGlzdH0sICR7YXJndW1lbnR9ID0+ICR7Y29uZGl0aW9ufSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vXG4gIC8vXHRSYW5kb20gKGluLXBsYWNlKSBsaXN0IG1hbmlwdWxhdGlvbi5cbiAgLy9cblxuICAvLyBSZXZlcnNlIGxpc3QgaW4tcGxhY2UuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcmV2ZXJzZVwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJyZXZlcnNlIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcmV2ZXJzZSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5yZXZlcnNlKCR7bGlzdH0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gU2h1ZmZsZSBsaXN0IGluLXBsYWNlLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3NodWZmbGVcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiKHJhbmRvbWl6ZXxzaHVmZmxlKSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3NodWZmbGUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuc2h1ZmZsZSgke2xpc3R9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gSXRlcmF0aW9uXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfaXRlcmF0aW9uXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImZvciAoZWFjaCk/IHtpdGVtVmFyOmlkZW50aWZpZXJ9IGluIHtsaXN0OmV4cHJlc3Npb259Oj8ge3N0YXRlbWVudH0/XCIsXG4gICAgICBcImZvciAoZWFjaCk/IHtpdGVtVmFyOmlkZW50aWZpZXJ9IChhbmR8LCkge3Bvc2l0aW9uVmFyOmlkZW50aWZpZXJ9IGluIHtsaXN0OmV4cHJlc3Npb259Oj8ge3N0YXRlbWVudH0/XCIsXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9pdGVyYXRpb24gZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpdGVtVmFyLCBwb3NpdGlvblZhciwgbGlzdCwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBsZXQgb3V0cHV0O1xuICAgICAgICBpZiAocG9zaXRpb25WYXIpIHtcbiAgICAgICAgICBvdXRwdXQgPSBgZm9yIChsZXQgJHtwb3NpdGlvblZhcn0gPSAxLCBiYXI7ICR7aXRlbVZhcn0gPSAke2xpc3R9WyR7cG9zaXRpb25WYXJ9LTFdLCAke3Bvc2l0aW9uVmFyfSA8PSAke2xpc3R9Lmxlbmd0aDsgJHtwb3NpdGlvblZhcn0rKykgYFxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIE5PVEU6IHRoaXMgaXMgcmVsYXRpdmVseSBzbG93Li4uICBwcm9iYWJseSBkb2Vzbid0IG1hdHRlci4uLlxuICAgICAgICAgIG91dHB1dCA9IGBmb3IgKGxldCAke2l0ZW1WYXJ9IG9mICR7bGlzdH0pIGA7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0ICs9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoc3RhdGVtZW50LCBibG9jayk7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gUmFuZ2VcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmFuZ2VfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwicmFuZ2Uge3N0YXJ0OmV4cHJlc3Npb259IHRvIHtlbmQ6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHN0YXJ0LCBlbmQgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5nZSgke3N0YXJ0fSwgJHtlbmR9KWA7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL2xpc3RzLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBpbmZpeCBhbmQgcHJlZml4IG9wZXJhdG9ycy5cbi8vXG5cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4uLy4uL1BhcnNlclwiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVcIjtcblxuLy8gQ3JlYXRlIFwib3BlcmF0b3JzXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck5hbWUoXCJvcGVyYXRvcnNcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAgLy8gVE9ETzpcbiAgLy8gXHQvLyBGaW5kIGJlc3QgbWF0Y2ggYWNjb3JkaW5nIHRvIG9wZXJhdG9yIHByZWNlZGVuY2UgYXMgZGVmaW5lZCBiZWxvdy5cbiAgLy8gXHRnZXRCZXN0TWF0Y2gobWF0Y2hlcykge1xuICAvLyBcdFx0Y29uc29sZS53YXJuKFwiR0JNXCIsIG1hdGNoZXMsIG1hdGNoZXMubWFwKG1hdGNoID0+IG1hdGNoLnByZWNlZGVuY2UpLCBtYXRjaGVzLm1hcChtYXRjaCA9PiBtYXRjaC5tYXRjaGVkVGV4dCkpO1xuICAvLyBcdFx0cmV0dXJuIG1hdGNoZXMucmVkdWNlKGZ1bmN0aW9uIChiZXN0LCBuZXh0KSB7XG4gIC8vIFx0XHRcdC8vIHRha2UgaGlnaGVzdCBwcmVjZWRlbmNlIG1hdGNoIGZpcnN0XG4gIC8vIFx0XHRcdGlmIChuZXh0LnByZWNlZGVuY2UgPiBiZXN0LnByZWNlZGVuY2UpIHJldHVybiBuZXh0O1xuICAvLyBcdFx0XHQvLyB0YWtlIGxvbmdlc3QgbWF0Y2ggaWYgc2FtZSBwcmVjZWRlbmNlXG4gIC8vIFx0XHRcdGlmIChuZXh0LnByZWNlZGVuY2UgPT09IGJlc3QucHJlY2VkZW5jZSkge1xuICAvLyBcdFx0XHRcdGlmIChuZXh0LmVuZEluZGV4ID4gYmVzdC5lbmRJbmRleCkgcmV0dXJuIG5leHQ7XG4gIC8vIFx0XHRcdH1cbiAgLy8gXHRcdFx0cmV0dXJuIGJlc3Q7XG4gIC8vIFx0XHR9LCBtYXRjaGVzWzBdKTtcbiAgLy8gXHR9XG5cblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvcl9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7bGhzOmV4cHJlc3Npb259IHtvcGVyYXRvcjppbmZpeF9vcGVyYXRvcn0ge3JoczpleHByZXNzaW9ufVwiLFxuICAgIGxlZnRSZWN1cnNpdmU6IHRydWUsXG4gICAgdGVzdFJ1bGU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaW5maXhfb3BlcmF0b3JfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxocywgcmhzLCBfb3BlcmF0b3IgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIF9vcGVyYXRvci5hcHBseShsaHMsIHJocyk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIyMgSW5maXggb3BlcmF0b3JzOiAgIGB7bGhzfSA8b3BlcmF0b3I+IHtyaHN9YCwgZWc6IGBhIGlzIDFgXG4gIC8vIE5PVEU6IGBvcGVyYXRvci5hcHBseWAgTVVTVCByZXR1cm4gYSBmdW5jdGlvbiB3aGljaCB0cmFuc2Zvcm1zIHR3byBhcmd1bWVudHMgKGBsaHNgIGFuZCBgcmhzYCkgaW50byBvdXRwdXQuXG4gIC8vIE5PVEU6IGBwcmVjZWRlbmNlYCBudW1iZXJzIGNvbWUgZnJvbSBKYXZhc2NyaXB0IGVxdWl2YWxlbnRzXG4gIC8vXHRcdCBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9PcGVyYXRvcnMvT3BlcmF0b3JfUHJlY2VkZW5jZVxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDYsXG4gICAgc3ludGF4OiBcImFuZFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBhbmQgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm4gYCgke2F9ICYmICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogNSxcbiAgICBzeW50YXg6IFwib3JcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3IgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm4gYCgke2F9IHx8ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTAsXG4gICAgc3ludGF4OiBcImlzXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuIGAoJHthfSA9PSAke2J9KWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEwLFxuICAgIHN5bnRheDogXCJpcyBub3RcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuIGAoJHthfSAhPSAke2J9KWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEwLFxuICAgIHN5bnRheDogXCJpcyBleGFjdGx5XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2V4YWN0bHkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm4gYCgke2F9ID09PSAke2J9KWAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMCxcbiAgICBzeW50YXg6IFwiaXMgbm90IGV4YWN0bHlcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2V4YWN0bHkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm4gYCgke2F9ICE9PSAke2J9KWAgfVxuICAgIH1cbiAgfSxcblxuICAvL1RPRE86IGBzcGVsbC5pc09mVHlwZSh0aGluZywgdHlwZSlgXG4gIC8vVE9ETzogYGlzIHNhbWUgdHlwZSBhc2AgP1xuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpcyBhXCIsXG4gICAgICBcImlzIGFuXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19hIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseSh0aGluZywgdHlwZSkgeyByZXR1cm4gYHNwZWxsLmlzT2ZUeXBlKCR7dGhpbmd9LCAnJHt0eXBlfScpYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImlzIG5vdCBhXCIsXG4gICAgICBcImlzIG5vdCBhblwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2EgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KHRoaW5nLCB0eXBlKSB7IHJldHVybiBgIXNwZWxsLmlzT2ZUeXBlKCR7dGhpbmd9LCAnJHt0eXBlfScpYCB9XG4gICAgfVxuICB9LFxuXG4gIC8vVE9ETzogYHNwZWxsLmNvbnRhaW5zKGNvbGxlY3Rpb24sIHRoaW5nKWBcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgaW5cIixcbiAgICAgIFwiaXMgb25lIG9mXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19pbiBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkodGhpbmcsIGxpc3QpIHsgcmV0dXJuIGAke2xpc3R9LmluY2x1ZGVzKCR7dGhpbmd9KWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpcyBub3QgaW5cIixcbiAgICAgIFwiaXMgbm90IG9uZSBvZlwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2luIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseSh0aGluZywgbGlzdCkgeyByZXR1cm4gYCEke2xpc3R9LmluY2x1ZGVzKCR7dGhpbmd9KWAgfVxuICAgIH1cbiAgfSxcblxuXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaW5jbHVkZXNcIixcbiAgICAgIFwiY29udGFpbnNcIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGluY2x1ZGVzIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShsaXN0LCB0aGluZykgeyByZXR1cm4gYCR7bGlzdH0uaW5jbHVkZXMoJHt0aGluZ30pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImRvZXMgbm90IGluY2x1ZGVcIixcbiAgICAgIFwiZG9lcyBub3QgY29udGFpblwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZG9lc19ub3RfaW5jbHVkZSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkobGlzdCwgdGhpbmcpIHsgcmV0dXJuIGAhJHtsaXN0fS5pbmNsdWRlcygke3RoaW5nfSlgIH1cbiAgICB9XG4gIH0sXG5cblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCI+XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGd0IGV4dGVuZHMgUnVsZS5TeW1ib2xzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gKCR7YX0gPiAke2J9KWAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiaXMgZ3JlYXRlciB0aGFuXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2d0IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9ID4gJHtifSlgIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiPj1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZ3RlIGV4dGVuZHMgUnVsZS5TeW1ib2xzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gKCR7YX0gPj0gJHtifSlgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcImlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0b1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19ndGUgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gKCR7YX0gPj0gJHtifSlgIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiPFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsdCBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9IDwgJHtifSlgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcImlzIGxlc3MgdGhhblwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19sdCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAoJHthfSA8ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcIjw9XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGx0ZSBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9IDw9ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCJpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbHRlIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9IDw9ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMyxcbiAgICBzeW50YXg6IFwiXFxcXCtcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcGx1cyBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gKyAke2J9YCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEzLFxuICAgIHN5bnRheDogXCJwbHVzXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHBsdXMgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gJHthfSArICR7Yn1gIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMyxcbiAgICBzeW50YXg6IFwiLVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBtaW51cyBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gLSAke2J9YCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEzLFxuICAgIHN5bnRheDogXCJtaW51c1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBtaW51cyBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAke2F9IC0gJHtifWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDE0LFxuICAgIHN5bnRheDogXCJcXFxcKlwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0aW1lcyBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gKiAke2J9YCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDE0LFxuICAgIHN5bnRheDogXCJ0aW1lc1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0aW1lcyBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAke2F9ICogJHtifWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDE0LFxuICAgIHN5bnRheDogXCIvXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRpdmlkZWRfYnkgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAke2F9IC8gJHtifWAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxNCxcbiAgICBzeW50YXg6IFwiZGl2aWRlZCBieVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkaXZpZGVkX2J5IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gLyAke2J9YCB9XG4gICAgfVxuICB9LFxuXG4gIC8vVE9ETzogIGArPWAgZXRjPyAgb3RoZXIgbWF0aCBmdW5jdGlvbnM/XG5cblxuICAvL1xuICAvL1xuICAvLyMjIFBvc3RpZnggb3BlcmF0b3JzOiAgIGB7bGhzfSA8b3BlcmF0b3I+YCwgZS5nLiBgYSBpcyBkZWZpbmVkYFxuICAvLyBOT1RFOiBgb3BlcmF0b3IuYXBwbHlgIE1VU1QgcmV0dXJuIGEgZnVuY3Rpb24gd2hpY2ggdHJhbnNmb3JtcyBhcmd1bWVudCAoYGxoc2ApIGludG8gSlMgb3V0cHV0LlxuXG4gIHtcbiAgICBuYW1lOiBcInBvc3RmaXhfb3BlcmF0b3JfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2V4cHJlc3Npb259IHtvcGVyYXRvcjpwb3N0Zml4X29wZXJhdG9yfVwiLFxuICAgIGxlZnRSZWN1cnNpdmU6IHRydWUsXG4gICAgdGVzdFJ1bGU6IFwicG9zdGZpeF9vcGVyYXRvclwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBwb3N0Zml4X29wZXJhdG9yX2V4cHJlc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGV4cHJlc3Npb24sIF9vcGVyYXRvciB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gX29wZXJhdG9yLmFwcGx5KGV4cHJlc3Npb24pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgc3ludGF4OiBcImlzIGRlZmluZWRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfZGVmaW5lZCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkodGhpbmcpIHsgcmV0dXJuIGAodHlwZW9mICR7dGhpbmd9ICE9PSAndW5kZWZpbmVkJylgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcInBvc3RmaXhfb3BlcmF0b3JcIixcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgdW5kZWZpbmVkXCIsXG4gICAgICBcImlzIG5vdCBkZWZpbmVkXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc191bmRlZmluZWQgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KHRoaW5nKSB7IHJldHVybiBgKHR5cGVvZiAke3RoaW5nfSA9PT0gJ3VuZGVmaW5lZCcpYCB9XG4gICAgfVxuICB9LFxuXG4gIC8vVE9ETzogYHNwZWxsLmlzRW1wdHkodGhpbmcpYFxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgc3ludGF4OiBcImlzIGVtcHR5XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2VtcHR5IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseSh0aGluZykgeyByZXR1cm4gYHNwZWxsLmlzRW1wdHkoJHt0aGluZ30pYCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgc3ludGF4OiBcImlzIG5vdCBlbXB0eVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19ub3RfZW1wdHkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KHRoaW5nKSB7IHJldHVybiBgIXNwZWxsLmlzRW1wdHkoJHt0aGluZ30pYCB9XG4gICAgfVxuICB9LFxuXG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL29wZXJhdG9ycy5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgY3JlYXRpbmcgdmFyaWFibGVzLCBwcm9wZXJ0eSBhY2Nlc3MsIGV0Y1xuLy9cblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG4vLyBDcmVhdGUgXCJzdGF0ZW1lbnRzXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck5hbWUoXCJzdGF0ZW1lbnRzXCIpO1xuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG5wYXJzZXIuZGVmaW5lUnVsZXMoXG4gIC8vXG4gIC8vXHQjIyBSZXR1cm5zXG4gIC8vXG5cbiAgLy8gUmV0dXJuIGEgdmFsdWVcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmV0dXJuX3N0YXRlbWVudFwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJyZXR1cm4ge2V4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJldHVybl9zdGF0ZW1lbnQgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBleHByZXNzaW9uIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgcmV0dXJuICR7ZXhwcmVzc2lvbn1gO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvL1xuICAvL1x0IyMgQXNzaWdubWVudFxuICAvL1xuXG4gIC8vVEVTVE1FXG4gIC8vVE9ETzogZGlzdGluZ3Vpc2ggYmV0d2VlbiBgbmV3X2lkZW50aWZpZXJgIGFuZCBgc2NvcGVkX2lkZW50aWZpZXJgXG4gIHtcbiAgICBuYW1lOiBcImFzc2lnbm1lbnRcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJ7dGhpbmc6ZXhwcmVzc2lvbn0gPSB7dmFsdWU6ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwic2V0IHt0aGluZzpleHByZXNzaW9ufSB0byB7dmFsdWU6ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwicHV0IHt2YWx1ZTpleHByZXNzaW9ufSBpbnRvIHt0aGluZzpleHByZXNzaW9ufVwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgYXNzaWdubWVudCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCB2YWx1ZSB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICAvLyBUT0RPOiBkZWNsYXJlIGlkZW50aWZpZXIgaWYgbm90IGluIHNjb3BlLCBldGNcbiAgICAgICAgcmV0dXJuIGAke3RoaW5nfSA9ICR7dmFsdWV9YDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy9URVNUTUVcbiAgLy8gVE9ETzogYGl0YCBtYXkgbm90IGFscmVhZHkgYmUgZGVmaW5lZC4uLiA/Pz9cbiAge1xuICAgIG5hbWU6IFwiZ2V0X3ZhbHVlXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwiZ2V0IHt2YWx1ZTpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBnZXRfdmFsdWUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB2YWx1ZSB9ID0gdGhpcy5yZXN1bHRzOztcbiAgICAgICAgcmV0dXJuIGBpdCA9ICR7dmFsdWV9YFxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG5cbiAgLy9cbiAgLy9cdCMjIFVzZXIgaW50ZXJhY3Rpb25cbiAgLy8gVE9ETzogbW92ZSBpbnRvIGFub3RoZXIgZmlsZVxuICAvL1xuXG4gIC8vIEFsZXJ0IGEgbWVzc2FnZS5cbiAgLy8gVE9ETzogbmVlZCBzb21lIGZhbmN5IHByb21pc2UganVqdSBoZXJlP1xuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJhbGVydFwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJhbGVydCB7bWVzc2FnZTpleHByZXNzaW9ufSAoPzp3aXRoIHtva0J1dHRvbjp0ZXh0fSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGFsZXJ0IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbWVzc2FnZSwgb2tCdXR0b24gPSBgXCJPS1wiYCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYGF3YWl0IHNwZWxsLmFsZXJ0KCR7bWVzc2FnZX0sICR7b2tCdXR0b259KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFdhcm5pbmcgbWVzc2FnZSAtLSBsaWtlIGFsZXJ0IGJ1dCBmYW5jaWVyLlxuICAvLyBUT0RPOiBuZWVkIHNvbWUgZmFuY3kgcHJvbWlzZSBqdWp1IGhlcmU/XG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcIndhcm5cIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwid2FybiB7ZXhwcmVzc2lvbjpleHByZXNzaW9ufSAoPzp3aXRoIHtva0J1dHRvbjp0ZXh0fSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHdhcm4gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBtZXNzYWdlLCBva0J1dHRvbiA9IGBcIk9LXCJgIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgYXdhaXQgc3BlbGwud2Fybigke21lc3NhZ2V9LCAke29rQnV0dG9ufSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIENvbmZpcm0gbWVzc2FnZSAtLSBwcmVzZW50IGEgcXVlc3Rpb24gd2l0aCB0d28gYW5zd2Vycy5cbiAgLy8gVE9ETzogbmVlZCBzb21lIGZhbmN5IHByb21pc2UganVqdSBoZXJlP1xuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJjb25maXJtXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcImNvbmZpcm0ge21lc3NhZ2U6ZXhwcmVzc2lvbn0gKD86d2l0aCB7b2tCdXR0b246dGV4dH0gKD86IChhbmR8b3IpIHtjYW5jZWxCdXR0b246dGV4dH0pPyApP1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBjb25maXJtIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbWVzc2FnZSwgb2tCdXR0b24gPSBgXCJPS1wiYCwgY2FuY2VsQnV0dG9uID0gYFwiQ2FuY2VsXCJgIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgYXdhaXQgc3BlbGwuY29uZmlybSgke21lc3NhZ2V9LCAke29rQnV0dG9ufSwgJHtjYW5jZWxCdXR0b259KWA7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL3N0YXRlbWVudHMuanMiLCIvL1xuLy9cdCMgUnVsZXMgZm9yIGRlZmluaW5nIGNsYXNzZXMgKGtub3duIGFzIGB0eXBlc2ApXG4vL1xuXG4vL1RPRE86IGNvbnN0cnVjdG9yXG4vLyBUT0RPOiBtaXhpbnMgLyB0cmFpdHMgLyBjb21wb3NlZCBjbGFzc2VzIC8gYW5ub3RhdGlvbnNcblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG5pbXBvcnQgZ2xvYmFsIGZyb20gXCIuLi8uLi91dGlscy9nbG9iYWxcIjtcbmltcG9ydCB7IHBsdXJhbGl6ZSB9IGZyb20gXCIuLi8uLi91dGlscy9zdHJpbmdcIjtcblxuZXhwb3J0IGRlZmF1bHQgUGFyc2VyLmZvck5hbWUoXCJ0eXBlc1wiKS5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwiZGVmaW5lX3R5cGVcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJkZWZpbmUgdHlwZSB7bmFtZTp0eXBlfSAoPzphcyAoYXxhbikge3N1cGVyVHlwZTp0eXBlfSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRlZmluZV90eXBlIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCBzdHJ1Y3R1cmUgPSBzdXBlci50b1N0cnVjdHVyZSgpO1xuICAgICAgICBzdHJ1Y3R1cmUudHlwZSA9IFwiY2xhc3NcIjtcbiAgICAgICAgcmV0dXJuIHN0cnVjdHVyZTtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHN1cGVyVHlwZSwgYmxvY2sgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgbGV0IG91dHB1dCA9IGBjbGFzcyAke25hbWV9YDtcbiAgICAgICAgaWYgKHN1cGVyVHlwZSkgb3V0cHV0ICs9IGAgZXh0ZW5kcyAke3N1cGVyVHlwZX1gO1xuICAgICAgICBvdXRwdXQgKz0gXCIgXCIgKyBSdWxlLkJsb2NrLmVuY2xvc2VTdGF0ZW1lbnRzKGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gYG5ld2Agb3IgYGNyZWF0ZWBcbiAgLy8gVGhpcyB3b3JrcyBhcyBhbiBleHByZXNzaW9uIE9SIGEgc3RhdGVtZW50LlxuICAvLyBOT1RFOiB3ZSBhc3N1bWUgdGhhdCBhbGwgdHlwZXMgdGFrZSBhbiBvYmplY3Qgb2YgcHJvcGVydGllcz8/Pz9cbiAge1xuICAgIG5hbWU6IFwibmV3X3RoaW5nXCIsXG4gICAgYWxpYXM6IFtcImV4cHJlc3Npb25cIiwgXCJzdGF0ZW1lbnRcIl0sXG4gICAgc3ludGF4OiBcIihjcmVhdGV8bmV3KSB7dHlwZX0gKD86d2l0aCB7cHJvcHM6b2JqZWN0X2xpdGVyYWxfcHJvcGVydGllc30pP1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBuZXdfdGhpbmcgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0eXBlLCBwcm9wcyA9IFwiXCIgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgLy8gU3BlY2lhbCBjYXNlIGZvciBvYmplY3QsIHdoaWNoIHdlJ2xsIGNyZWF0ZSB3aXRoIGFuIG9iamVjdCBsaXRlcmFsLlxuICAgICAgICBpZiAodHlwZSA9PT0gXCJPYmplY3RcIikge1xuICAgICAgICAgIGlmICghcHJvcHMpIHJldHVybiBcInt9XCI7XG4gICAgICAgICAgcmV0dXJuIHByb3BzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBuZXcgJHt0eXBlfSgke3Byb3BzfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBEZWNsYXJlIGluc3RhbmNlIG1ldGhvZCBvciBub3JtYWwgZnVuY3Rpb24uXG4gIHtcbiAgICBuYW1lOiBcImRlY2xhcmVfbWV0aG9kXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwiKG9wZXJhdG9yOnRvfG9uKSB7bmFtZTppZGVudGlmaWVyfSB7YXJnc30/IChcXFxcOik/IHtzdGF0ZW1lbnR9P1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkZWNsYXJlX21ldGhvZCBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBvcGVyYXRvciwgbmFtZSwgYXJncyA9IFtdfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgbGV0IHN1YlR5cGUgPSAob3BlcmF0b3IgPT09IFwidG9cIiA/IFwibWV0aG9kXCIgOiBcImV2ZW50XCIpO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcImZ1bmN0aW9uXCIsIHN1YlR5cGUsIG5hbWUsIGFyZ3MgfTtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIGFyZ3MgPSBbXSwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBsZXQgb3V0cHV0ID0gYCR7bmFtZX0oJHthcmdzLmpvaW4oXCIsIFwiKX0pIGA7XG4gICAgICAgIG91dHB1dCArPSBSdWxlLkJsb2NrLmVuY2xvc2VTdGF0ZW1lbnRzKHN0YXRlbWVudCwgYmxvY2spO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBEZWNsYXJlIFwiYWN0aW9uXCIsIHdoaWNoIGNhbiBiZSBjYWxsZWQgZ2xvYmFsbHkgYW5kIGFmZmVjdHMgdGhlIHBhcnNlci5cbiAgLy8gVE9ETzogYHdpdGhgIGNsYXVzZSAod2lsbCBjb25mbGljdCB3aXRoIGB3b3JkYClcbiAgLy8gVE9ETzogaW5zdGFsbCBpbiBwYXJzZXIgc29tZWhvd1xuICAvLyBUT0RPOiBjcmVhdGUgaW5zdGFuY2UgZnVuY3Rpb24/ICBvciBtYXliZSB3ZSBkb24ndCBuZWVkIGl0OlxuICAvL1x0XHRcdGBhY3Rpb24gdHVybiBDYXJkIG92ZXJgIGZvciBhbiBpbnN0YW5jZSBpcyBqdXN0IGB0dXJuIG1lIG92ZXJgXG4gIC8vXHRcdFx0YGFjdGlvbiBhZGQgY2FyZCB0byBkZWNrYCA9PiBgYWRkIG1lIHRvIGRlY2tgXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImRlY2xhcmVfYWN0aW9uXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwiYWN0aW9uIChrZXl3b3Jkczp7d29yZH18e3R5cGV9KSsgKFxcXFw6KT8ge3N0YXRlbWVudH0/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRlY2xhcmVfYWN0aW9uIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICAvLyBBZGQgYG5hbWVgLCBgYXJnc2AgYW5kIGB0eXBlc2AgdG8gbWF0Y2hlZCBzb3VyY2VcbiAgICAgIGdldCByZXN1bHRzKCkge1xuICAgICAgICBsZXQgb3V0cHV0ID0gc3VwZXIucmVzdWx0cztcblxuICAgICAgICAvLyBpZiB0aGVyZSdzIG9ubHkgb25lIGtleXdvcmQsIGl0IGNhbid0IGJlIGEgYmxhY2tsaXN0ZWQgaWRlbnRpZmllciBvciBhIHR5cGVcbiAgICAgICAgbGV0IHsga2V5d29yZHMgfSA9IG91dHB1dDtcbiAgICAgICAgbGV0IGtleXdvcmRNYXRjaGVzID0gdGhpcy5yZXN1bHRzLmtleXdvcmRzLm1hdGNoZWQ7XG4gICAgICAgIGlmIChrZXl3b3Jkcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICBsZXQga2V5d29yZCA9IGtleXdvcmRzWzBdO1xuICAgICAgICAgIGlmIChrZXl3b3JkTWF0Y2hlc1swXSBpbnN0YW5jZW9mIFJ1bGUuVHlwZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgcGFyc2UoJ2RlY2xhcmVfYWN0aW9uJyk6IG9uZS13b3JkIGFjdGlvbnMgbWF5IG5vdCBiZSB0eXBlczogJHtrZXl3b3JkfWApO1xuICAgICAgICAgIH1cblxuICAvLyBIQUNLOiBgZ2xvYmFsLnBhcnNlcmAgaXMgYSBoYWNrIGhlcmUgZm9yIGNvbnZlbmllbmNlIGluIHRlc3RpbmcuLi5cbi8vICAgICAgICAgICBsZXQgcGFyc2VyID0gKGNvbnRleHQgJiYgY29udGV4dC5wYXJzZXIpIHx8IGdsb2JhbC5wYXJzZXI7XG4vLyAgICAgICAgICAgbGV0IGJsYWNrbGlzdCA9IHBhcnNlci5nZXRCbGFja2xpc3QoXCJpZGVudGlmaWVyXCIpO1xuLy8gICAgICAgICAgIGlmIChibGFja2xpc3Rba2V5d29yZF0pIHtcbi8vICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHBhcnNlKCdkZWNsYXJlX2FjdGlvbicpOiBvbmUtd29yZCBhY3Rpb25zIG1heSBub3QgYmUgYmxhY2tsaXN0ZWQgaWRlbnRpZmllcnNcIjogJHtrZXl3b3JkfWApO1xuLy8gICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZpZ3VyZSBvdXQgYXJndW1lbnRzIGFuZC9vciB0eXBlc1xuICAgICAgICBvdXRwdXQuYXJncyA9IFtdO1xuICAgICAgICBvdXRwdXQudHlwZXMgPSB7fTtcblxuICAgICAgICAvLyBpZiBhbnkgb2YgdGhlIHdvcmRzIGFyZSB0eXBlcyAoY2FwaXRhbCBsZXR0ZXIpIG1ha2UgdGhhdCBhbiBhcmd1bWVudCBvZiB0aGUgc2FtZSBuYW1lLlxuICAgICAgICBrZXl3b3JkTWF0Y2hlcy5tYXAoIChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgUnVsZS5UeXBlKSB7XG4gICAgICAgICAgICBsZXQgVHlwZSA9IGtleXdvcmRzW2luZGV4XTtcbiAgICAgICAgICAgIGxldCB0eXBlID0gVHlwZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICBvdXRwdXQudHlwZXNbdHlwZV0gPSBUeXBlO1xuICAgICAgICAgICAgb3V0cHV0LmFyZ3MucHVzaCh0eXBlKTtcblxuICAgICAgICAgICAgLy8gcmVwbGFjZSB3aXRoIGxvd2VyY2FzZSBpbiBtZXRob2QgbmFtZVxuICAgICAgICAgICAga2V5d29yZHNbaW5kZXhdID0gdHlwZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBnZXQgc3RhdGljIG1ldGhvZCBuYW1lIGFuZCBhcmd1bWVudHMgZm9yIG91dHB1dFxuICAgICAgICBvdXRwdXQubmFtZSA9IGtleXdvcmRzLmpvaW4oXCJfXCIpO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgYXJncyA9IFtdLCB0eXBlcywgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuXG4gICAgICAgIC8vIGZpZ3VyZSBvdXQgaWYgdGhlcmUgYXJlIGFueSBjb25kaXRpb25zIGR1ZSB0byBrbm93biBhcmd1bWVudCB0eXBlc1xuICAgICAgICBsZXQgY29uZGl0aW9ucyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBhcmcgaW4gdHlwZXMpIHtcbiAgICAgICAgICBjb25kaXRpb25zLnB1c2goYFxcdGlmICghc3BlbGwuaXNBKCR7YXJnfSwgJHt0eXBlc1thcmddfSkpIHJldHVybiB1bmRlZmluZWRgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzdGF0ZW1lbnRzID0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhjb25kaXRpb25zLCBzdGF0ZW1lbnQsIGJsb2NrKTtcblxuICAgICAgICAvLyBDcmVhdGUgYXMgYSBTVEFUSUMgZnVuY3Rpb25cbiAgICAvL1RPRE86IGNyZWF0ZSBhcyBhbiBpbnN0YW5jZSBmdW5jdGlvbiB3ZSBjYW4gY2FsbCBvbiBvdXJzZWxmIVxuICAgICAgICByZXR1cm4gYHN0YXRpYyAke25hbWV9KCR7YXJncy5qb2luKFwiLCBcIil9KSAke3N0YXRlbWVudHN9YDtcbiAgICAgIH1cblxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIGFyZ3MsIHR5cGVzIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IFwiZnVuY3Rpb25cIiwgc3ViVHlwZTogXCJhY3Rpb25cIiwgbmFtZSwgYXJncywgdHlwZXMgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIEdldHRlciBlaXRoZXIgd2l0aCBvciB3aXRob3V0IGFyZ3VtZW50cy5cbiAgLy8gSWYgeW91IHNwZWNpZnkgYXJndW1lbnRzLCB5aWVsZHMgYSBub3JtYWwgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHZhbHVlLlxuICAvLyBUT0RPOiBgdG8gZ2V0Li4uYCA/XG4gIHtcbiAgICBuYW1lOiBcImdldHRlclwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcImdldCB7bmFtZTppZGVudGlmaWVyfVxcXFw6IHtleHByZXNzaW9ufT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZ2V0dGVyIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgZXhwcmVzc2lvbiwgYmxvY2sgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgLy8gSWYgdGhleSBzcGVjaWZpZWQgYW4gaW5saW5lLWV4cHJlc3Npb24sIHByZXBlbmQgcmV0dXJuXG4gICAgICAgIGlmIChleHByZXNzaW9uICYmICFleHByZXNzaW9uLnN0YXJ0c1dpdGgoXCJyZXR1cm4gXCIpKSBleHByZXNzaW9uID0gYHJldHVybiAoJHtleHByZXNzaW9ufSlgO1xuICAgICAgICBsZXQgb3V0cHV0ID0gYGdldCAke25hbWV9KCkgYDtcbiAgICAgICAgb3V0cHV0ICs9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoZXhwcmVzc2lvbiwgYmxvY2spO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IG5hbWUgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBzdWJUeXBlOiBcImdldHRlclwiLCBuYW1lIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gU2V0dGVyLlxuICAvLyBDb21wbGFpbnMgaWYgeW91IHNwZWNpZnkgbW9yZSB0aGFuIG9uZSBhcmd1bWVudC5cbiAgLy8gSWYgeW91IGRvbid0IHBhc3MgYW4gZXhwbGljaXQgYXJndW1lbnQsIHdlJ2xsIGFzc3VtZSBpdCdzIHRoZSBzYW1lIGFzIHRoZSBpZGVudGlmaWVyLlxuICAvLyBlZztcdGBzZXQgY29sb3I6IHNldCB0aGUgY29sb3Igb2YgbXkgdGV4dCB0byBjb2xvcmBcbiAgLy9cbiAgLy8gVE9ETzogaW50ZXJuYWwgZ2V0dGVyL3NldHRlciBzZW1hbnRpY3MgYWxhIG9iamVjdGl2ZSBDXG4gIC8vXHRcdFx0YHNldCBjb2xvcjogaWYgY29sb3IgaXMgaW4gW1wicmVkXCIsIFwiYmx1ZVwiXSB0aGVuIHNldCBteSBjb2xvciB0byBjb2xvcmBcbiAgLy9cdFx0ID0+IGBteSBjb2xvcmAgd2l0aGluIHNldHRlciBzaG91bGQgYXV0b21hdGljYWxseSB0cmFuc2xhdGUgdG8gYHRoaXMuX2NvbG9yYCA/Pz9cbiAgLy8gVE9ETzogYHRvIHNldC4uLmAgP1xuICB7XG4gICAgbmFtZTogXCJzZXR0ZXJcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJzZXQge25hbWU6aWRlbnRpZmllcn0ge2FyZ3N9PyAoXFxcXDopPyB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgc2V0dGVyIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgLy8gZGVmYXVsdCBhcmdzIHRvIHRoZSBzZXR0ZXIgbmFtZVxuICAgICAgICBsZXQgeyBuYW1lLCBhcmdzID0gW25hbWVdLCBzdGF0ZW1lbnQsIGJsb2NrIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIC8vIENvbXBsYWluIGlmIG1vcmUgdGhhbiBvbmUgYXJndW1lbnRcbiAgICAgICAgaWYgKGFyZ3MgJiYgYXJncy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwicGFyc2UoJ3NldHRlcicpOiBvbmx5IG9uZSBhcmd1bWVudCBhbGxvd2VkIGluIHNldHRlcjogIFwiLCB0aGlzLm1hdGNoZWRUZXh0KTtcbiAgICAgICAgICBhcmdzID0gWyBhcmdzWzBdIF07XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG91dHB1dCA9IGBzZXQgJHtuYW1lfSgke2FyZ3N9KSBgO1xuICAgICAgICBvdXRwdXQgKz0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhzdGF0ZW1lbnQsIGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBuYW1lIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IFwicHJvcGVydHlcIiwgc3ViVHlwZTogXCJzZXR0ZXJcIiwgbmFtZSB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy9cbiAgLy9cdGRlY2xhcmUgcHJvcGVydGllc1xuICAvL1xuXG4gIC8vVE9ETzogYW5vdGhlciBuYW1lIGZvciBgY29uc3RhbnRgID9cbiAge1xuICAgIG5hbWU6IFwiZGVjbGFyZV9wcm9wZXJ0eVwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcIihzY29wZTpwcm9wZXJ0eXxjb25zdGFudHxzaGFyZWQgcHJvcGVydHkpIHtuYW1lOmlkZW50aWZpZXJ9ICg/Oj0ge3ZhbHVlOmV4cHJlc3Npb259KT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVjbGFyZV9wcm9wZXJ0eSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHNjb3BlLCBuYW1lLCB2YWx1ZSA9IFwiXCIgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgaWYgKHZhbHVlKSB2YWx1ZSA9IGAgPSAke3ZhbHVlfWA7XG5cbiAgICAgICAgbGV0IGRlY2xhcmF0aW9uID0gYCR7bmFtZX0ke3ZhbHVlfWA7XG4gICAgICAgIHN3aXRjaCAoc2NvcGUpIHtcbiAgICAgICAgICBjYXNlIFwiY29uc3RhbnRcIjpcbi8vICAgICAgICAgICAgaWYgKCF2YWx1ZSkgY29uc29sZS53YXJuKFwicGFyc2UoJ2RlY2xhcmVfcHJvcGVydHknKTogY29uc3RhbnQgcHJvcGVydGllcyBtdXN0IGRlY2xhcmUgYSB2YWx1ZTogIFwiLCB0aGlzLm1hdGNoZWRUZXh0KTtcbiAgICAgICAgICAgIHJldHVybiBgY29uc3QgJHtkZWNsYXJhdGlvbn1gO1xuXG4gICAgICAgICAgY2FzZSBcInNoYXJlZCBwcm9wZXJ0eVwiOlxuICAgICAgICAgICAgcmV0dXJuIGBAcHJvdG8gJHtkZWNsYXJhdGlvbn1gO1xuXG4gICAgICAgICAgY2FzZSBcInByb3BlcnR5XCI6XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBkZWNsYXJhdGlvbjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IHNjb3BlLCBuYW1lIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IFwicHJvcGVydHlcIiwgbmFtZSwgc2NvcGUgfTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gVE9ETzogc2NvcGVfbW9kaWZpZXI/Pz9cbiAgLy8gVE9ETzogaW5pdGlhbCB2YWx1ZVxuICB7XG4gICAgbmFtZTogXCJkZWNsYXJlX3Byb3BlcnR5X29mX3R5cGVcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJwcm9wZXJ0eSB7bmFtZTppZGVudGlmaWVyfSBhcyAoYXxhbik/IHt0eXBlfVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkZWNsYXJlX3Byb3BlcnR5X29mX3R5cGUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBuYW1lLCB0eXBlIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgZ2V0ICR7bmFtZX0oKSB7IHJldHVybiB0aGlzLl9fJHtuYW1lfSB9XFxuYFxuICAgICAgICAgICArIGBzZXQgJHtuYW1lfSh2YWx1ZSkgeyBpZiAoc3BlbGwuaXNBKHZhbHVlLCAke3R5cGV9KSB0aGlzLl9fJHtuYW1lfSA9IHZhbHVlIH1gO1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHR5cGUgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBzdWJUeXBlOiBcInNldHRlclwiLCBuYW1lLCBkYXRhVHlwZTogdHlwZSB9O1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFRPRE86IHdhcm4gb24gaW52YWxpZCBzZXQ/ICBzaGFyZWQ/ICB1bmRlZmluZWQ/IHNvbWV0aGluZyBvdGhlciB0aGFuIHRoZSBmaXJzdCB2YWx1ZSBhcyBkZWZhdWx0P1xuICB7XG4gICAgbmFtZTogXCJkZWNsYXJlX3Byb3BlcnR5X2FzX29uZV9vZlwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcInByb3BlcnR5IHtuYW1lOmlkZW50aWZpZXJ9IGFzIG9uZSBvZiB7bGlzdDpsaXRlcmFsX2xpc3R9XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRlY2xhcmVfcHJvcGVydHlfYXNfb25lX29mIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICBnZXQgcmVzdWx0cygpIHtcbiAgICAgICAgbGV0IHJlc3VsdHMgPSBzdXBlci5yZXN1bHRzO1xuICAgICAgICByZXN1bHRzLnBsdXJhbCA9IHBsdXJhbGl6ZShyZXN1bHRzLm5hbWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHBsdXJhbCwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYEBwcm90byAke3BsdXJhbH0gPSAke2xpc3R9XFxuYFxuICAgICAgICAgICArIGBnZXQgJHtuYW1lfSgpIHsgcmV0dXJuIHRoaXMuX18ke25hbWV9ID09PSB1bmRlZmluZWQgPyB0aGlzLiR7cGx1cmFsfVswXSA6IHRoaXMuX18ke25hbWV9IH1cXG5gXG4gICAgICAgICAgICsgYHNldCAke25hbWV9KHZhbHVlKSB7IGlmICh0aGlzLiR7cGx1cmFsfS5pbmNsdWRlcyh2YWx1ZSkpIHRoaXMuX18ke25hbWV9ID0gdmFsdWUgfWA7XG5cbiAgLy8gTU9SRSBFRkZJQ0lFTlQgQlVUIFVHTElFUlxuICAvLyBcdFx0XHRyZXR1cm4gYHN0YXRpYyAke3BsdXJhbH0gPSAke2xpc3R9O1xcbmBcbiAgLy8gXHRcdFx0XHQgKyBgZ2V0ICR7bmFtZX0geyByZXR1cm4gKFwiX18ke25hbWV9XCIgaW4gdGhpcyA/IHRoaXMuX18ke25hbWV9IDogJHtmaXJzdFZhbHVlfSkgfVxcbmBcbiAgLy8gXHRcdFx0XHQgKyBgc2V0ICR7bmFtZX0odmFsdWUpIHsgaWYgKHRoaXMuY29uc3RydWN0b3IuJHtwbHVyYWx9LmluY2x1ZGVzKHZhbHVlKSkgdGhpcy5fXyR7bmFtZX0gPSB2YWx1ZSB9YDtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBuYW1lLCBwbHVyYWwgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICB7IHR5cGU6IFwicHJvcGVydHlcIiwgbmFtZSB9LFxuICAgICAgICAgIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBzdWJUeXBlOiBcInNoYXJlZFwiLCBuYW1lOiBwbHVyYWwgfVxuICAgICAgICBdO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vXG4gIC8vXHRTZWxmLXJlZmVyZW5jZVxuICAvL1xuICB7XG4gICAgbmFtZTogXCJtZVwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwibWVcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbWUgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gXCJ0aGlzXCI7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFRPRE86IHRoaXMgcmVhbGx5IG1ha2VzIG1lIHdhbnQgdG8gbWFrZSBgSSBhbSBlbXB0eWAgZXRjIHdvcmsuLi5cbiAge1xuICAgIG5hbWU6IFwiSVwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiSVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBJIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIFwidGhpc1wiO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vXG4gIC8vXHRQcm9wZXJ0eSBhY2Nlc3NcbiAgLy9cblxuICB7XG4gICAgbmFtZTogXCJwcm9wZXJ0eV9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCIocHJvcGVydGllczp0aGUge2lkZW50aWZpZXJ9IG9mKSsgdGhlPyB7ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcHJvcGVydHlfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgZ2V0IHJlc3VsdHMoKSB7XG4gICAgICAgIGxldCB7IGV4cHJlc3Npb24sIHByb3BlcnRpZXNfLCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHByb3BlcnRpZXM6IF9wcm9wZXJ0aWVzLm1hdGNoZWQubWFwKCBwcm9wZXJ0eSA9PiBwcm9wZXJ0eS5yZXN1bHRzLmlkZW50aWZpZXIgKVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgZXhwcmVzc2lvbiwgcHJvcGVydGllcyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBwcm9wZXJ0aWVzID0gcHJvcGVydGllcy5yZXZlcnNlKCkuam9pbihcIi5cIik7XG4gICAgICAgIHJldHVybiBgJHtleHByZXNzaW9ufS4ke3Byb3BlcnRpZXN9YDtcbiAgLy8gTk9URTogdGhlIGZvbGxvd2luZyBpcyBzYWZlciwgYnV0IHVnbHkgZm9yIGRlbW8gcHVycG9zZXNcbiAgLy9cdFx0XHRyZXR1cm4gYHNwZWxsLmdldCgke2V4cHJlc3Npb259LCBbJyR7cHJvcGVydGllc30nXSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJteV9wcm9wZXJ0eV9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCIobXl8dGhpcykge2lkZW50aWZpZXJ9XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG15X3Byb3BlcnR5X2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgdGhpcy4ke2lkZW50aWZpZXJ9YDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvL1xuICAvL1x0VXRpbGl0eVxuICAvL1xuXG5cbiAgLy8gUHJvcGVydGllcyBjbGF1c2U6IGNyZWF0ZXMgYW4gb2JqZWN0IHdpdGggb25lIG9yIG1vcmUgcHJvcGVydHkgdmFsdWVzLlxuICAvL1x0YGZvbyA9IDEsIGJhciA9IDJgXG4gIC8vVE9ETzogd291bGQgbGlrZSB0byB1c2UgYGFuZGAgYnV0IHRoYXQgd2lsbCBiYXJmIG9uIGV4cHJlc3Npb25zLi4uXG4gIC8vVE9ETzogaG93IHRvIGRvIHByb3BlcnRpZXMgb24gbXVsdGlwbGUgbGluZXM/XG4gIHtcbiAgICBuYW1lOiBcIm9iamVjdF9saXRlcmFsX3Byb3BlcnRpZXNcIixcbiAgICBzeW50YXg6IFwiWyh7a2V5OmlkZW50aWZpZXJ9KD86PSB7dmFsdWU6ZXhwcmVzc2lvbn0pPykgLF1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb2JqZWN0X2xpdGVyYWxfcHJvcGVydGllcyBleHRlbmRzIFJ1bGUuTGlzdCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHByb3BzID0gdGhpcy5yZXN1bHRzLm1hdGNoZWQubWFwKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgICAgICBsZXQgeyBrZXksIHZhbHVlIH0gPSBwcm9wLnJlc3VsdHM7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHJldHVybiBgXCIke2tleX1cIjogJHt2YWx1ZX1gXG4gICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYHsgJHtwcm9wcy5qb2luKFwiLCBcIil9IH1gO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vTU9WRSBUTyBgZnVuY3Rpb25zYD9cbiAgLy8gQXJndW1lbnRzIGNsYXVzZSBmb3IgbWV0aG9kc1xuICAvL1x0YHdpdGggZm9vYCBvciBgd2l0aCBmb28gYW5kIGJhciBhbmQgYmF6YFxuICAvL1RPRE86IHtpZGVudGlmaWVyfSA9IHtleHByZXNzaW9ufVx0PT4gcmVxdWlyZXMgYCxgIGluc3RlYWQgb2YgYGFuZGBcbiAgLy9UT0RPOiBgd2l0aCBmb28gYXMgVHlwZWBcbiAgLy9UT0RPOlx0YHdpdGggZm9vLi4uYCBmb3Igc3BsYXQ/XG4gIHtcbiAgICBuYW1lOiBcImFyZ3NcIixcbiAgICBzeW50YXg6IFwid2l0aCBbYXJnczp7aWRlbnRpZmllcn0sXVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBhcmdzIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICAvLyBSZXR1cm5zIGFuIGFycmF5IG9mIGFyZ3VtZW50IHZhbHVlc1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdHMuX2FyZ3MubWF0Y2hlZC5tYXAoYXJnID0+IGFyZy50b1NvdXJjZSgpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvdHlwZXMuanMiLCJyZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zeW1ib2wnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9fY29yZScpLlN5bWJvbDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL2VzNi9zeW1ib2wuanNcbi8vIG1vZHVsZSBpZCA9IDUwMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpIHRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGEgZnVuY3Rpb24hJyk7XG4gIHJldHVybiBpdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzXG4vLyBtb2R1bGUgaWQgPSA1NDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gZmFsc2UgLT4gQXJyYXkjaW5kZXhPZlxuLy8gdHJ1ZSAgLT4gQXJyYXkjaW5jbHVkZXNcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuL190by1sZW5ndGgnKTtcbnZhciB0b0Fic29sdXRlSW5kZXggPSByZXF1aXJlKCcuL190by1hYnNvbHV0ZS1pbmRleCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoSVNfSU5DTFVERVMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcywgZWwsIGZyb21JbmRleCkge1xuICAgIHZhciBPID0gdG9JT2JqZWN0KCR0aGlzKTtcbiAgICB2YXIgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpO1xuICAgIHZhciBpbmRleCA9IHRvQWJzb2x1dGVJbmRleChmcm9tSW5kZXgsIGxlbmd0aCk7XG4gICAgdmFyIHZhbHVlO1xuICAgIC8vIEFycmF5I2luY2x1ZGVzIHVzZXMgU2FtZVZhbHVlWmVybyBlcXVhbGl0eSBhbGdvcml0aG1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgaWYgKElTX0lOQ0xVREVTICYmIGVsICE9IGVsKSB3aGlsZSAobGVuZ3RoID4gaW5kZXgpIHtcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgIGlmICh2YWx1ZSAhPSB2YWx1ZSkgcmV0dXJuIHRydWU7XG4gICAgLy8gQXJyYXkjaW5kZXhPZiBpZ25vcmVzIGhvbGVzLCBBcnJheSNpbmNsdWRlcyAtIG5vdFxuICAgIH0gZWxzZSBmb3IgKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKykgaWYgKElTX0lOQ0xVREVTIHx8IGluZGV4IGluIE8pIHtcbiAgICAgIGlmIChPW2luZGV4XSA9PT0gZWwpIHJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleCB8fCAwO1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qc1xuLy8gbW9kdWxlIGlkID0gNTQ4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGdldHRpbmcgdGFnIGZyb20gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG52YXIgVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyk7XG4vLyBFUzMgd3JvbmcgaGVyZVxudmFyIEFSRyA9IGNvZihmdW5jdGlvbiAoKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ0FyZ3VtZW50cyc7XG5cbi8vIGZhbGxiYWNrIGZvciBJRTExIFNjcmlwdCBBY2Nlc3MgRGVuaWVkIGVycm9yXG52YXIgdHJ5R2V0ID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gaXRba2V5XTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgTywgVCwgQjtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IGl0ID09PSBudWxsID8gJ051bGwnXG4gICAgLy8gQEB0b1N0cmluZ1RhZyBjYXNlXG4gICAgOiB0eXBlb2YgKFQgPSB0cnlHZXQoTyA9IE9iamVjdChpdCksIFRBRykpID09ICdzdHJpbmcnID8gVFxuICAgIC8vIGJ1aWx0aW5UYWcgY2FzZVxuICAgIDogQVJHID8gY29mKE8pXG4gICAgLy8gRVMzIGFyZ3VtZW50cyBmYWxsYmFja1xuICAgIDogKEIgPSBjb2YoTykpID09ICdPYmplY3QnICYmIHR5cGVvZiBPLmNhbGxlZSA9PSAnZnVuY3Rpb24nID8gJ0FyZ3VtZW50cycgOiBCO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2NsYXNzb2YuanNcbi8vIG1vZHVsZSBpZCA9IDU0OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBvcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuL19hLWZ1bmN0aW9uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbiwgdGhhdCwgbGVuZ3RoKSB7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmICh0aGF0ID09PSB1bmRlZmluZWQpIHJldHVybiBmbjtcbiAgc3dpdGNoIChsZW5ndGgpIHtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbiAoYSkge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKC8qIC4uLmFyZ3MgKi8pIHtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19jdHguanNcbi8vIG1vZHVsZSBpZCA9IDU1MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyA3LjIuMSBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ID09IHVuZGVmaW5lZCkgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZGVmaW5lZC5qc1xuLy8gbW9kdWxlIGlkID0gNTUxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGFsbCBlbnVtZXJhYmxlIG9iamVjdCBrZXlzLCBpbmNsdWRlcyBzeW1ib2xzXG52YXIgZ2V0S2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJyk7XG52YXIgZ09QUyA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BzJyk7XG52YXIgcElFID0gcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdmFyIHJlc3VsdCA9IGdldEtleXMoaXQpO1xuICB2YXIgZ2V0U3ltYm9scyA9IGdPUFMuZjtcbiAgaWYgKGdldFN5bWJvbHMpIHtcbiAgICB2YXIgc3ltYm9scyA9IGdldFN5bWJvbHMoaXQpO1xuICAgIHZhciBpc0VudW0gPSBwSUUuZjtcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGtleTtcbiAgICB3aGlsZSAoc3ltYm9scy5sZW5ndGggPiBpKSBpZiAoaXNFbnVtLmNhbGwoaXQsIGtleSA9IHN5bWJvbHNbaSsrXSkpIHJlc3VsdC5wdXNoKGtleSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWtleXMuanNcbi8vIG1vZHVsZSBpZCA9IDU1MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxudmFyICRleHBvcnQgPSBmdW5jdGlvbiAodHlwZSwgbmFtZSwgc291cmNlKSB7XG4gIHZhciBJU19GT1JDRUQgPSB0eXBlICYgJGV4cG9ydC5GO1xuICB2YXIgSVNfR0xPQkFMID0gdHlwZSAmICRleHBvcnQuRztcbiAgdmFyIElTX1NUQVRJQyA9IHR5cGUgJiAkZXhwb3J0LlM7XG4gIHZhciBJU19QUk9UTyA9IHR5cGUgJiAkZXhwb3J0LlA7XG4gIHZhciBJU19CSU5EID0gdHlwZSAmICRleHBvcnQuQjtcbiAgdmFyIHRhcmdldCA9IElTX0dMT0JBTCA/IGdsb2JhbCA6IElTX1NUQVRJQyA/IGdsb2JhbFtuYW1lXSB8fCAoZ2xvYmFsW25hbWVdID0ge30pIDogKGdsb2JhbFtuYW1lXSB8fCB7fSlbUFJPVE9UWVBFXTtcbiAgdmFyIGV4cG9ydHMgPSBJU19HTE9CQUwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KTtcbiAgdmFyIGV4cFByb3RvID0gZXhwb3J0c1tQUk9UT1RZUEVdIHx8IChleHBvcnRzW1BST1RPVFlQRV0gPSB7fSk7XG4gIHZhciBrZXksIG93biwgb3V0LCBleHA7XG4gIGlmIChJU19HTE9CQUwpIHNvdXJjZSA9IG5hbWU7XG4gIGZvciAoa2V5IGluIHNvdXJjZSkge1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIHRhcmdldFtrZXldICE9PSB1bmRlZmluZWQ7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSAob3duID8gdGFyZ2V0IDogc291cmNlKVtrZXldO1xuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XG4gICAgZXhwID0gSVNfQklORCAmJiBvd24gPyBjdHgob3V0LCBnbG9iYWwpIDogSVNfUFJPVE8gJiYgdHlwZW9mIG91dCA9PSAnZnVuY3Rpb24nID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgLy8gZXh0ZW5kIGdsb2JhbFxuICAgIGlmICh0YXJnZXQpIHJlZGVmaW5lKHRhcmdldCwga2V5LCBvdXQsIHR5cGUgJiAkZXhwb3J0LlUpO1xuICAgIC8vIGV4cG9ydFxuICAgIGlmIChleHBvcnRzW2tleV0gIT0gb3V0KSBoaWRlKGV4cG9ydHMsIGtleSwgZXhwKTtcbiAgICBpZiAoSVNfUFJPVE8gJiYgZXhwUHJvdG9ba2V5XSAhPSBvdXQpIGV4cFByb3RvW2tleV0gPSBvdXQ7XG4gIH1cbn07XG5nbG9iYWwuY29yZSA9IGNvcmU7XG4vLyB0eXBlIGJpdG1hcFxuJGV4cG9ydC5GID0gMTsgICAvLyBmb3JjZWRcbiRleHBvcnQuRyA9IDI7ICAgLy8gZ2xvYmFsXG4kZXhwb3J0LlMgPSA0OyAgIC8vIHN0YXRpY1xuJGV4cG9ydC5QID0gODsgICAvLyBwcm90b1xuJGV4cG9ydC5CID0gMTY7ICAvLyBiaW5kXG4kZXhwb3J0LlcgPSAzMjsgIC8vIHdyYXBcbiRleHBvcnQuVSA9IDY0OyAgLy8gc2FmZVxuJGV4cG9ydC5SID0gMTI4OyAvLyByZWFsIHByb3RvIG1ldGhvZCBmb3IgYGxpYnJhcnlgXG5tb2R1bGUuZXhwb3J0cyA9ICRleHBvcnQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19leHBvcnQuanNcbi8vIG1vZHVsZSBpZCA9IDU1M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudDtcbm1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faHRtbC5qc1xuLy8gbW9kdWxlIGlkID0gNTU0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApID8gT2JqZWN0IDogZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19pb2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSA1NTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gNy4yLjIgSXNBcnJheShhcmd1bWVudClcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiBpc0FycmF5KGFyZykge1xuICByZXR1cm4gY29mKGFyZykgPT0gJ0FycmF5Jztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19pcy1hcnJheS5qc1xuLy8gbW9kdWxlIGlkID0gNTU2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBNRVRBID0gcmVxdWlyZSgnLi9fdWlkJykoJ21ldGEnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIHNldERlc2MgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mO1xudmFyIGlkID0gMDtcbnZhciBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRydWU7XG59O1xudmFyIEZSRUVaRSA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGlzRXh0ZW5zaWJsZShPYmplY3QucHJldmVudEV4dGVuc2lvbnMoe30pKTtcbn0pO1xudmFyIHNldE1ldGEgPSBmdW5jdGlvbiAoaXQpIHtcbiAgc2V0RGVzYyhpdCwgTUVUQSwgeyB2YWx1ZToge1xuICAgIGk6ICdPJyArICsraWQsIC8vIG9iamVjdCBJRFxuICAgIHc6IHt9ICAgICAgICAgIC8vIHdlYWsgY29sbGVjdGlvbnMgSURzXG4gIH0gfSk7XG59O1xudmFyIGZhc3RLZXkgPSBmdW5jdGlvbiAoaXQsIGNyZWF0ZSkge1xuICAvLyByZXR1cm4gcHJpbWl0aXZlIHdpdGggcHJlZml4XG4gIGlmICghaXNPYmplY3QoaXQpKSByZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnID8gaXQgOiAodHlwZW9mIGl0ID09ICdzdHJpbmcnID8gJ1MnIDogJ1AnKSArIGl0O1xuICBpZiAoIWhhcyhpdCwgTUVUQSkpIHtcbiAgICAvLyBjYW4ndCBzZXQgbWV0YWRhdGEgdG8gdW5jYXVnaHQgZnJvemVuIG9iamVjdFxuICAgIGlmICghaXNFeHRlbnNpYmxlKGl0KSkgcmV0dXJuICdGJztcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBtZXRhZGF0YVxuICAgIGlmICghY3JlYXRlKSByZXR1cm4gJ0UnO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBvYmplY3QgSURcbiAgfSByZXR1cm4gaXRbTUVUQV0uaTtcbn07XG52YXIgZ2V0V2VhayA9IGZ1bmN0aW9uIChpdCwgY3JlYXRlKSB7XG4gIGlmICghaGFzKGl0LCBNRVRBKSkge1xuICAgIC8vIGNhbid0IHNldCBtZXRhZGF0YSB0byB1bmNhdWdodCBmcm96ZW4gb2JqZWN0XG4gICAgaWYgKCFpc0V4dGVuc2libGUoaXQpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBtZXRhZGF0YVxuICAgIGlmICghY3JlYXRlKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gYWRkIG1pc3NpbmcgbWV0YWRhdGFcbiAgICBzZXRNZXRhKGl0KTtcbiAgLy8gcmV0dXJuIGhhc2ggd2VhayBjb2xsZWN0aW9ucyBJRHNcbiAgfSByZXR1cm4gaXRbTUVUQV0udztcbn07XG4vLyBhZGQgbWV0YWRhdGEgb24gZnJlZXplLWZhbWlseSBtZXRob2RzIGNhbGxpbmdcbnZhciBvbkZyZWV6ZSA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoRlJFRVpFICYmIG1ldGEuTkVFRCAmJiBpc0V4dGVuc2libGUoaXQpICYmICFoYXMoaXQsIE1FVEEpKSBzZXRNZXRhKGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcbnZhciBtZXRhID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIEtFWTogTUVUQSxcbiAgTkVFRDogZmFsc2UsXG4gIGZhc3RLZXk6IGZhc3RLZXksXG4gIGdldFdlYWs6IGdldFdlYWssXG4gIG9uRnJlZXplOiBvbkZyZWV6ZVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX21ldGEuanNcbi8vIG1vZHVsZSBpZCA9IDU1N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyAxOS4xLjIuMiAvIDE1LjIuMy41IE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGRQcyA9IHJlcXVpcmUoJy4vX29iamVjdC1kcHMnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKTtcbnZhciBJRV9QUk9UTyA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKTtcbnZhciBFbXB0eSA9IGZ1bmN0aW9uICgpIHsgLyogZW1wdHkgKi8gfTtcbnZhciBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxuLy8gQ3JlYXRlIG9iamVjdCB3aXRoIGZha2UgYG51bGxgIHByb3RvdHlwZTogdXNlIGlmcmFtZSBPYmplY3Qgd2l0aCBjbGVhcmVkIHByb3RvdHlwZVxudmFyIGNyZWF0ZURpY3QgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIFRocmFzaCwgd2FzdGUgYW5kIHNvZG9teTogSUUgR0MgYnVnXG4gIHZhciBpZnJhbWUgPSByZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2lmcmFtZScpO1xuICB2YXIgaSA9IGVudW1CdWdLZXlzLmxlbmd0aDtcbiAgdmFyIGx0ID0gJzwnO1xuICB2YXIgZ3QgPSAnPic7XG4gIHZhciBpZnJhbWVEb2N1bWVudDtcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIHJlcXVpcmUoJy4vX2h0bWwnKS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICBpZnJhbWUuc3JjID0gJ2phdmFzY3JpcHQ6JzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zY3JpcHQtdXJsXG4gIC8vIGNyZWF0ZURpY3QgPSBpZnJhbWUuY29udGVudFdpbmRvdy5PYmplY3Q7XG4gIC8vIGh0bWwucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcbiAgaWZyYW1lRG9jdW1lbnQgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgaWZyYW1lRG9jdW1lbnQub3BlbigpO1xuICBpZnJhbWVEb2N1bWVudC53cml0ZShsdCArICdzY3JpcHQnICsgZ3QgKyAnZG9jdW1lbnQuRj1PYmplY3QnICsgbHQgKyAnL3NjcmlwdCcgKyBndCk7XG4gIGlmcmFtZURvY3VtZW50LmNsb3NlKCk7XG4gIGNyZWF0ZURpY3QgPSBpZnJhbWVEb2N1bWVudC5GO1xuICB3aGlsZSAoaS0tKSBkZWxldGUgY3JlYXRlRGljdFtQUk9UT1RZUEVdW2VudW1CdWdLZXlzW2ldXTtcbiAgcmV0dXJuIGNyZWF0ZURpY3QoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiBjcmVhdGUoTywgUHJvcGVydGllcykge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoTyAhPT0gbnVsbCkge1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBhbk9iamVjdChPKTtcbiAgICByZXN1bHQgPSBuZXcgRW1wdHkoKTtcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gbnVsbDtcbiAgICAvLyBhZGQgXCJfX3Byb3RvX19cIiBmb3IgT2JqZWN0LmdldFByb3RvdHlwZU9mIHBvbHlmaWxsXG4gICAgcmVzdWx0W0lFX1BST1RPXSA9IE87XG4gIH0gZWxzZSByZXN1bHQgPSBjcmVhdGVEaWN0KCk7XG4gIHJldHVybiBQcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiBkUHMocmVzdWx0LCBQcm9wZXJ0aWVzKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtY3JlYXRlLmpzXG4vLyBtb2R1bGUgaWQgPSA1NThcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBnZXRLZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIHZhciBrZXlzID0gZ2V0S2V5cyhQcm9wZXJ0aWVzKTtcbiAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICB2YXIgaSA9IDA7XG4gIHZhciBQO1xuICB3aGlsZSAobGVuZ3RoID4gaSkgZFAuZihPLCBQID0ga2V5c1tpKytdLCBQcm9wZXJ0aWVzW1BdKTtcbiAgcmV0dXJuIE87XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwcy5qc1xuLy8gbW9kdWxlIGlkID0gNTU5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBwSUUgPSByZXF1aXJlKCcuL19vYmplY3QtcGllJyk7XG52YXIgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4vX2llOC1kb20tZGVmaW5lJyk7XG52YXIgZ09QRCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG5cbmV4cG9ydHMuZiA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBnT1BEIDogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApIHtcbiAgTyA9IHRvSU9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBpZiAoSUU4X0RPTV9ERUZJTkUpIHRyeSB7XG4gICAgcmV0dXJuIGdPUEQoTywgUCk7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoaGFzKE8sIFApKSByZXR1cm4gY3JlYXRlRGVzYyghcElFLmYuY2FsbChPLCBQKSwgT1tQXSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcGQuanNcbi8vIG1vZHVsZSBpZCA9IDU2MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBmYWxsYmFjayBmb3IgSUUxMSBidWdneSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB3aXRoIGlmcmFtZSBhbmQgd2luZG93XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIGdPUE4gPSByZXF1aXJlKCcuL19vYmplY3QtZ29wbicpLmY7XG52YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxudmFyIHdpbmRvd05hbWVzID0gdHlwZW9mIHdpbmRvdyA9PSAnb2JqZWN0JyAmJiB3aW5kb3cgJiYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXNcbiAgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh3aW5kb3cpIDogW107XG5cbnZhciBnZXRXaW5kb3dOYW1lcyA9IGZ1bmN0aW9uIChpdCkge1xuICB0cnkge1xuICAgIHJldHVybiBnT1BOKGl0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB3aW5kb3dOYW1lcy5zbGljZSgpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5mID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCkge1xuICByZXR1cm4gd2luZG93TmFtZXMgJiYgdG9TdHJpbmcuY2FsbChpdCkgPT0gJ1tvYmplY3QgV2luZG93XScgPyBnZXRXaW5kb3dOYW1lcyhpdCkgOiBnT1BOKHRvSU9iamVjdChpdCkpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BuLWV4dC5qc1xuLy8gbW9kdWxlIGlkID0gNTYxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkZWYgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIFRBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgdGFnLCBzdGF0KSB7XG4gIGlmIChpdCAmJiAhaGFzKGl0ID0gc3RhdCA/IGl0IDogaXQucHJvdG90eXBlLCBUQUcpKSBkZWYoaXQsIFRBRywgeyBjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiB0YWcgfSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fc2V0LXRvLXN0cmluZy10YWcuanNcbi8vIG1vZHVsZSBpZCA9IDU2MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIG1heCA9IE1hdGgubWF4O1xudmFyIG1pbiA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW5kZXgsIGxlbmd0aCkge1xuICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XG4gIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3RvLWFic29sdXRlLWluZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA1NjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gNy4xLjE1IFRvTGVuZ3RoXG52YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIG1pbiA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCAweDFmZmZmZmZmZmZmZmZmKSA6IDA7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL190by1sZW5ndGguanNcbi8vIG1vZHVsZSBpZCA9IDU2NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBMSUJSQVJZID0gcmVxdWlyZSgnLi9fbGlicmFyeScpO1xudmFyIHdrc0V4dCA9IHJlcXVpcmUoJy4vX3drcy1leHQnKTtcbnZhciBkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmY7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHZhciAkU3ltYm9sID0gY29yZS5TeW1ib2wgfHwgKGNvcmUuU3ltYm9sID0gTElCUkFSWSA/IHt9IDogZ2xvYmFsLlN5bWJvbCB8fCB7fSk7XG4gIGlmIChuYW1lLmNoYXJBdCgwKSAhPSAnXycgJiYgIShuYW1lIGluICRTeW1ib2wpKSBkZWZpbmVQcm9wZXJ0eSgkU3ltYm9sLCBuYW1lLCB7IHZhbHVlOiB3a3NFeHQuZihuYW1lKSB9KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL193a3MtZGVmaW5lLmpzXG4vLyBtb2R1bGUgaWQgPSA1NjVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuLy8gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4vX2NsYXNzb2YnKTtcbnZhciB0ZXN0ID0ge307XG50ZXN0W3JlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpXSA9ICd6JztcbmlmICh0ZXN0ICsgJycgIT0gJ1tvYmplY3Qgel0nKSB7XG4gIHJlcXVpcmUoJy4vX3JlZGVmaW5lJykoT2JqZWN0LnByb3RvdHlwZSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuICdbb2JqZWN0ICcgKyBjbGFzc29mKHRoaXMpICsgJ10nO1xuICB9LCB0cnVlKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcuanNcbi8vIG1vZHVsZSBpZCA9IDU2NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG4vLyBFQ01BU2NyaXB0IDYgc3ltYm9scyBzaGltXG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpO1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJyk7XG52YXIgTUVUQSA9IHJlcXVpcmUoJy4vX21ldGEnKS5LRVk7XG52YXIgJGZhaWxzID0gcmVxdWlyZSgnLi9fZmFpbHMnKTtcbnZhciBzaGFyZWQgPSByZXF1aXJlKCcuL19zaGFyZWQnKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJyk7XG52YXIgdWlkID0gcmVxdWlyZSgnLi9fdWlkJyk7XG52YXIgd2tzID0gcmVxdWlyZSgnLi9fd2tzJyk7XG52YXIgd2tzRXh0ID0gcmVxdWlyZSgnLi9fd2tzLWV4dCcpO1xudmFyIHdrc0RlZmluZSA9IHJlcXVpcmUoJy4vX3drcy1kZWZpbmUnKTtcbnZhciBlbnVtS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0ta2V5cycpO1xudmFyIGlzQXJyYXkgPSByZXF1aXJlKCcuL19pcy1hcnJheScpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKTtcbnZhciBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xudmFyIF9jcmVhdGUgPSByZXF1aXJlKCcuL19vYmplY3QtY3JlYXRlJyk7XG52YXIgZ09QTkV4dCA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BuLWV4dCcpO1xudmFyICRHT1BEID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcGQnKTtcbnZhciAkRFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciAka2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJyk7XG52YXIgZ09QRCA9ICRHT1BELmY7XG52YXIgZFAgPSAkRFAuZjtcbnZhciBnT1BOID0gZ09QTkV4dC5mO1xudmFyICRTeW1ib2wgPSBnbG9iYWwuU3ltYm9sO1xudmFyICRKU09OID0gZ2xvYmFsLkpTT047XG52YXIgX3N0cmluZ2lmeSA9ICRKU09OICYmICRKU09OLnN0cmluZ2lmeTtcbnZhciBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcbnZhciBISURERU4gPSB3a3MoJ19oaWRkZW4nKTtcbnZhciBUT19QUklNSVRJVkUgPSB3a3MoJ3RvUHJpbWl0aXZlJyk7XG52YXIgaXNFbnVtID0ge30ucHJvcGVydHlJc0VudW1lcmFibGU7XG52YXIgU3ltYm9sUmVnaXN0cnkgPSBzaGFyZWQoJ3N5bWJvbC1yZWdpc3RyeScpO1xudmFyIEFsbFN5bWJvbHMgPSBzaGFyZWQoJ3N5bWJvbHMnKTtcbnZhciBPUFN5bWJvbHMgPSBzaGFyZWQoJ29wLXN5bWJvbHMnKTtcbnZhciBPYmplY3RQcm90byA9IE9iamVjdFtQUk9UT1RZUEVdO1xudmFyIFVTRV9OQVRJVkUgPSB0eXBlb2YgJFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xudmFyIFFPYmplY3QgPSBnbG9iYWwuUU9iamVjdDtcbi8vIERvbid0IHVzZSBzZXR0ZXJzIGluIFF0IFNjcmlwdCwgaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzE3M1xudmFyIHNldHRlciA9ICFRT2JqZWN0IHx8ICFRT2JqZWN0W1BST1RPVFlQRV0gfHwgIVFPYmplY3RbUFJPVE9UWVBFXS5maW5kQ2hpbGQ7XG5cbi8vIGZhbGxiYWNrIGZvciBvbGQgQW5kcm9pZCwgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTY4N1xudmFyIHNldFN5bWJvbERlc2MgPSBERVNDUklQVE9SUyAmJiAkZmFpbHMoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gX2NyZWF0ZShkUCh7fSwgJ2EnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBkUCh0aGlzLCAnYScsIHsgdmFsdWU6IDcgfSkuYTsgfVxuICB9KSkuYSAhPSA3O1xufSkgPyBmdW5jdGlvbiAoaXQsIGtleSwgRCkge1xuICB2YXIgcHJvdG9EZXNjID0gZ09QRChPYmplY3RQcm90bywga2V5KTtcbiAgaWYgKHByb3RvRGVzYykgZGVsZXRlIE9iamVjdFByb3RvW2tleV07XG4gIGRQKGl0LCBrZXksIEQpO1xuICBpZiAocHJvdG9EZXNjICYmIGl0ICE9PSBPYmplY3RQcm90bykgZFAoT2JqZWN0UHJvdG8sIGtleSwgcHJvdG9EZXNjKTtcbn0gOiBkUDtcblxudmFyIHdyYXAgPSBmdW5jdGlvbiAodGFnKSB7XG4gIHZhciBzeW0gPSBBbGxTeW1ib2xzW3RhZ10gPSBfY3JlYXRlKCRTeW1ib2xbUFJPVE9UWVBFXSk7XG4gIHN5bS5fayA9IHRhZztcbiAgcmV0dXJuIHN5bTtcbn07XG5cbnZhciBpc1N5bWJvbCA9IFVTRV9OQVRJVkUgJiYgdHlwZW9mICRTeW1ib2wuaXRlcmF0b3IgPT0gJ3N5bWJvbCcgPyBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJztcbn0gOiBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0IGluc3RhbmNlb2YgJFN5bWJvbDtcbn07XG5cbnZhciAkZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBEKSB7XG4gIGlmIChpdCA9PT0gT2JqZWN0UHJvdG8pICRkZWZpbmVQcm9wZXJ0eShPUFN5bWJvbHMsIGtleSwgRCk7XG4gIGFuT2JqZWN0KGl0KTtcbiAga2V5ID0gdG9QcmltaXRpdmUoa2V5LCB0cnVlKTtcbiAgYW5PYmplY3QoRCk7XG4gIGlmIChoYXMoQWxsU3ltYm9scywga2V5KSkge1xuICAgIGlmICghRC5lbnVtZXJhYmxlKSB7XG4gICAgICBpZiAoIWhhcyhpdCwgSElEREVOKSkgZFAoaXQsIEhJRERFTiwgY3JlYXRlRGVzYygxLCB7fSkpO1xuICAgICAgaXRbSElEREVOXVtrZXldID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0pIGl0W0hJRERFTl1ba2V5XSA9IGZhbHNlO1xuICAgICAgRCA9IF9jcmVhdGUoRCwgeyBlbnVtZXJhYmxlOiBjcmVhdGVEZXNjKDAsIGZhbHNlKSB9KTtcbiAgICB9IHJldHVybiBzZXRTeW1ib2xEZXNjKGl0LCBrZXksIEQpO1xuICB9IHJldHVybiBkUChpdCwga2V5LCBEKTtcbn07XG52YXIgJGRlZmluZVByb3BlcnRpZXMgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKGl0LCBQKSB7XG4gIGFuT2JqZWN0KGl0KTtcbiAgdmFyIGtleXMgPSBlbnVtS2V5cyhQID0gdG9JT2JqZWN0KFApKTtcbiAgdmFyIGkgPSAwO1xuICB2YXIgbCA9IGtleXMubGVuZ3RoO1xuICB2YXIga2V5O1xuICB3aGlsZSAobCA+IGkpICRkZWZpbmVQcm9wZXJ0eShpdCwga2V5ID0ga2V5c1tpKytdLCBQW2tleV0pO1xuICByZXR1cm4gaXQ7XG59O1xudmFyICRjcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaXQsIFApIHtcbiAgcmV0dXJuIFAgPT09IHVuZGVmaW5lZCA/IF9jcmVhdGUoaXQpIDogJGRlZmluZVByb3BlcnRpZXMoX2NyZWF0ZShpdCksIFApO1xufTtcbnZhciAkcHJvcGVydHlJc0VudW1lcmFibGUgPSBmdW5jdGlvbiBwcm9wZXJ0eUlzRW51bWVyYWJsZShrZXkpIHtcbiAgdmFyIEUgPSBpc0VudW0uY2FsbCh0aGlzLCBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpKTtcbiAgaWYgKHRoaXMgPT09IE9iamVjdFByb3RvICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICFoYXMoT1BTeW1ib2xzLCBrZXkpKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiBFIHx8ICFoYXModGhpcywga2V5KSB8fCAhaGFzKEFsbFN5bWJvbHMsIGtleSkgfHwgaGFzKHRoaXMsIEhJRERFTikgJiYgdGhpc1tISURERU5dW2tleV0gPyBFIDogdHJ1ZTtcbn07XG52YXIgJGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KSB7XG4gIGl0ID0gdG9JT2JqZWN0KGl0KTtcbiAga2V5ID0gdG9QcmltaXRpdmUoa2V5LCB0cnVlKTtcbiAgaWYgKGl0ID09PSBPYmplY3RQcm90byAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhaGFzKE9QU3ltYm9scywga2V5KSkgcmV0dXJuO1xuICB2YXIgRCA9IGdPUEQoaXQsIGtleSk7XG4gIGlmIChEICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICEoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSkpIEQuZW51bWVyYWJsZSA9IHRydWU7XG4gIHJldHVybiBEO1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlOYW1lcyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpIHtcbiAgdmFyIG5hbWVzID0gZ09QTih0b0lPYmplY3QoaXQpKTtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIgaSA9IDA7XG4gIHZhciBrZXk7XG4gIHdoaWxlIChuYW1lcy5sZW5ndGggPiBpKSB7XG4gICAgaWYgKCFoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkgJiYga2V5ICE9IEhJRERFTiAmJiBrZXkgIT0gTUVUQSkgcmVzdWx0LnB1c2goa2V5KTtcbiAgfSByZXR1cm4gcmVzdWx0O1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlTeW1ib2xzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGl0KSB7XG4gIHZhciBJU19PUCA9IGl0ID09PSBPYmplY3RQcm90bztcbiAgdmFyIG5hbWVzID0gZ09QTihJU19PUCA/IE9QU3ltYm9scyA6IHRvSU9iamVjdChpdCkpO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBpID0gMDtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIHtcbiAgICBpZiAoaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pICYmIChJU19PUCA/IGhhcyhPYmplY3RQcm90bywga2V5KSA6IHRydWUpKSByZXN1bHQucHVzaChBbGxTeW1ib2xzW2tleV0pO1xuICB9IHJldHVybiByZXN1bHQ7XG59O1xuXG4vLyAxOS40LjEuMSBTeW1ib2woW2Rlc2NyaXB0aW9uXSlcbmlmICghVVNFX05BVElWRSkge1xuICAkU3ltYm9sID0gZnVuY3Rpb24gU3ltYm9sKCkge1xuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgJFN5bWJvbCkgdGhyb3cgVHlwZUVycm9yKCdTeW1ib2wgaXMgbm90IGEgY29uc3RydWN0b3IhJyk7XG4gICAgdmFyIHRhZyA9IHVpZChhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZCk7XG4gICAgdmFyICRzZXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh0aGlzID09PSBPYmplY3RQcm90bykgJHNldC5jYWxsKE9QU3ltYm9scywgdmFsdWUpO1xuICAgICAgaWYgKGhhcyh0aGlzLCBISURERU4pICYmIGhhcyh0aGlzW0hJRERFTl0sIHRhZykpIHRoaXNbSElEREVOXVt0YWddID0gZmFsc2U7XG4gICAgICBzZXRTeW1ib2xEZXNjKHRoaXMsIHRhZywgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xuICAgIH07XG4gICAgaWYgKERFU0NSSVBUT1JTICYmIHNldHRlcikgc2V0U3ltYm9sRGVzYyhPYmplY3RQcm90bywgdGFnLCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgc2V0OiAkc2V0IH0pO1xuICAgIHJldHVybiB3cmFwKHRhZyk7XG4gIH07XG4gIHJlZGVmaW5lKCRTeW1ib2xbUFJPVE9UWVBFXSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2s7XG4gIH0pO1xuXG4gICRHT1BELmYgPSAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuICAkRFAuZiA9ICRkZWZpbmVQcm9wZXJ0eTtcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LWdvcG4nKS5mID0gZ09QTkV4dC5mID0gJGdldE93blByb3BlcnR5TmFtZXM7XG4gIHJlcXVpcmUoJy4vX29iamVjdC1waWUnKS5mID0gJHByb3BlcnR5SXNFbnVtZXJhYmxlO1xuICByZXF1aXJlKCcuL19vYmplY3QtZ29wcycpLmYgPSAkZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG4gIGlmIChERVNDUklQVE9SUyAmJiAhcmVxdWlyZSgnLi9fbGlicmFyeScpKSB7XG4gICAgcmVkZWZpbmUoT2JqZWN0UHJvdG8sICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsICRwcm9wZXJ0eUlzRW51bWVyYWJsZSwgdHJ1ZSk7XG4gIH1cblxuICB3a3NFeHQuZiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIHdyYXAod2tzKG5hbWUpKTtcbiAgfTtcbn1cblxuJGV4cG9ydCgkZXhwb3J0LkcgKyAkZXhwb3J0LlcgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgeyBTeW1ib2w6ICRTeW1ib2wgfSk7XG5cbmZvciAodmFyIGVzNlN5bWJvbHMgPSAoXG4gIC8vIDE5LjQuMi4yLCAxOS40LjIuMywgMTkuNC4yLjQsIDE5LjQuMi42LCAxOS40LjIuOCwgMTkuNC4yLjksIDE5LjQuMi4xMCwgMTkuNC4yLjExLCAxOS40LjIuMTIsIDE5LjQuMi4xMywgMTkuNC4yLjE0XG4gICdoYXNJbnN0YW5jZSxpc0NvbmNhdFNwcmVhZGFibGUsaXRlcmF0b3IsbWF0Y2gscmVwbGFjZSxzZWFyY2gsc3BlY2llcyxzcGxpdCx0b1ByaW1pdGl2ZSx0b1N0cmluZ1RhZyx1bnNjb3BhYmxlcydcbikuc3BsaXQoJywnKSwgaiA9IDA7IGVzNlN5bWJvbHMubGVuZ3RoID4gajspd2tzKGVzNlN5bWJvbHNbaisrXSk7XG5cbmZvciAodmFyIHdlbGxLbm93blN5bWJvbHMgPSAka2V5cyh3a3Muc3RvcmUpLCBrID0gMDsgd2VsbEtub3duU3ltYm9scy5sZW5ndGggPiBrOykgd2tzRGVmaW5lKHdlbGxLbm93blN5bWJvbHNbaysrXSk7XG5cbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsICdTeW1ib2wnLCB7XG4gIC8vIDE5LjQuMi4xIFN5bWJvbC5mb3Ioa2V5KVxuICAnZm9yJzogZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBoYXMoU3ltYm9sUmVnaXN0cnksIGtleSArPSAnJylcbiAgICAgID8gU3ltYm9sUmVnaXN0cnlba2V5XVxuICAgICAgOiBTeW1ib2xSZWdpc3RyeVtrZXldID0gJFN5bWJvbChrZXkpO1xuICB9LFxuICAvLyAxOS40LjIuNSBTeW1ib2wua2V5Rm9yKHN5bSlcbiAga2V5Rm9yOiBmdW5jdGlvbiBrZXlGb3Ioc3ltKSB7XG4gICAgaWYgKCFpc1N5bWJvbChzeW0pKSB0aHJvdyBUeXBlRXJyb3Ioc3ltICsgJyBpcyBub3QgYSBzeW1ib2whJyk7XG4gICAgZm9yICh2YXIga2V5IGluIFN5bWJvbFJlZ2lzdHJ5KSBpZiAoU3ltYm9sUmVnaXN0cnlba2V5XSA9PT0gc3ltKSByZXR1cm4ga2V5O1xuICB9LFxuICB1c2VTZXR0ZXI6IGZ1bmN0aW9uICgpIHsgc2V0dGVyID0gdHJ1ZTsgfSxcbiAgdXNlU2ltcGxlOiBmdW5jdGlvbiAoKSB7IHNldHRlciA9IGZhbHNlOyB9XG59KTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgJ09iamVjdCcsIHtcbiAgLy8gMTkuMS4yLjIgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxuICBjcmVhdGU6ICRjcmVhdGUsXG4gIC8vIDE5LjEuMi40IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKVxuICBkZWZpbmVQcm9wZXJ0eTogJGRlZmluZVByb3BlcnR5LFxuICAvLyAxOS4xLjIuMyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKVxuICBkZWZpbmVQcm9wZXJ0aWVzOiAkZGVmaW5lUHJvcGVydGllcyxcbiAgLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIC8vIDE5LjEuMi43IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXG4gIGdldE93blByb3BlcnR5TmFtZXM6ICRnZXRPd25Qcm9wZXJ0eU5hbWVzLFxuICAvLyAxOS4xLjIuOCBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKE8pXG4gIGdldE93blByb3BlcnR5U3ltYm9sczogJGdldE93blByb3BlcnR5U3ltYm9sc1xufSk7XG5cbi8vIDI0LjMuMiBKU09OLnN0cmluZ2lmeSh2YWx1ZSBbLCByZXBsYWNlciBbLCBzcGFjZV1dKVxuJEpTT04gJiYgJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAoIVVTRV9OQVRJVkUgfHwgJGZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgdmFyIFMgPSAkU3ltYm9sKCk7XG4gIC8vIE1TIEVkZ2UgY29udmVydHMgc3ltYm9sIHZhbHVlcyB0byBKU09OIGFzIHt9XG4gIC8vIFdlYktpdCBjb252ZXJ0cyBzeW1ib2wgdmFsdWVzIHRvIEpTT04gYXMgbnVsbFxuICAvLyBWOCB0aHJvd3Mgb24gYm94ZWQgc3ltYm9sc1xuICByZXR1cm4gX3N0cmluZ2lmeShbU10pICE9ICdbbnVsbF0nIHx8IF9zdHJpbmdpZnkoeyBhOiBTIH0pICE9ICd7fScgfHwgX3N0cmluZ2lmeShPYmplY3QoUykpICE9ICd7fSc7XG59KSksICdKU09OJywge1xuICBzdHJpbmdpZnk6IGZ1bmN0aW9uIHN0cmluZ2lmeShpdCkge1xuICAgIHZhciBhcmdzID0gW2l0XTtcbiAgICB2YXIgaSA9IDE7XG4gICAgdmFyIHJlcGxhY2VyLCAkcmVwbGFjZXI7XG4gICAgd2hpbGUgKGFyZ3VtZW50cy5sZW5ndGggPiBpKSBhcmdzLnB1c2goYXJndW1lbnRzW2krK10pO1xuICAgICRyZXBsYWNlciA9IHJlcGxhY2VyID0gYXJnc1sxXTtcbiAgICBpZiAoIWlzT2JqZWN0KHJlcGxhY2VyKSAmJiBpdCA9PT0gdW5kZWZpbmVkIHx8IGlzU3ltYm9sKGl0KSkgcmV0dXJuOyAvLyBJRTggcmV0dXJucyBzdHJpbmcgb24gdW5kZWZpbmVkXG4gICAgaWYgKCFpc0FycmF5KHJlcGxhY2VyKSkgcmVwbGFjZXIgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgaWYgKHR5cGVvZiAkcmVwbGFjZXIgPT0gJ2Z1bmN0aW9uJykgdmFsdWUgPSAkcmVwbGFjZXIuY2FsbCh0aGlzLCBrZXksIHZhbHVlKTtcbiAgICAgIGlmICghaXNTeW1ib2wodmFsdWUpKSByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgICBhcmdzWzFdID0gcmVwbGFjZXI7XG4gICAgcmV0dXJuIF9zdHJpbmdpZnkuYXBwbHkoJEpTT04sIGFyZ3MpO1xuICB9XG59KTtcblxuLy8gMTkuNC4zLjQgU3ltYm9sLnByb3RvdHlwZVtAQHRvUHJpbWl0aXZlXShoaW50KVxuJFN5bWJvbFtQUk9UT1RZUEVdW1RPX1BSSU1JVElWRV0gfHwgcmVxdWlyZSgnLi9faGlkZScpKCRTeW1ib2xbUFJPVE9UWVBFXSwgVE9fUFJJTUlUSVZFLCAkU3ltYm9sW1BST1RPVFlQRV0udmFsdWVPZik7XG4vLyAxOS40LjMuNSBTeW1ib2wucHJvdG90eXBlW0BAdG9TdHJpbmdUYWddXG5zZXRUb1N0cmluZ1RhZygkU3ltYm9sLCAnU3ltYm9sJyk7XG4vLyAyMC4yLjEuOSBNYXRoW0BAdG9TdHJpbmdUYWddXG5zZXRUb1N0cmluZ1RhZyhNYXRoLCAnTWF0aCcsIHRydWUpO1xuLy8gMjQuMy4zIEpTT05bQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKGdsb2JhbC5KU09OLCAnSlNPTicsIHRydWUpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9lczYuc3ltYm9sLmpzXG4vLyBtb2R1bGUgaWQgPSA1Njdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKShmYWxzZSk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIub2FrLnNwYWNlciB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBkaXNwbGF5OiBibG9jaztcXG59XFxuLm9hay5zcGFjZXIuaW5saW5lIHtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTtcXG59XFxuLm9hay5zcGFjZXIuZmx1aWQge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBmbGV4OiAxIDEgMTAwJTtcXG59XFxuLm9hay5zcGFjZXIudGlueSB7XFxuICB3aWR0aDogMnB4O1xcbiAgaGVpZ2h0OiAycHg7XFxufVxcbi5vYWsuc3BhY2VyLnNtYWxsIHtcXG4gIHdpZHRoOiA0cHg7XFxuICBoZWlnaHQ6IDRweDtcXG59XFxuLm9hay5zcGFjZXIubWVkaXVtIHtcXG4gIHdpZHRoOiAxMHB4O1xcbiAgaGVpZ2h0OiAxMHB4O1xcbn1cXG4ub2FrLnNwYWNlci5sYXJnZSB7XFxuICB3aWR0aDogMjBweDtcXG4gIGhlaWdodDogMjBweDtcXG59XFxuLm9hay5zcGFjZXIuaHVnZSB7XFxuICB3aWR0aDogMzBweDtcXG4gIGhlaWdodDogMzBweDtcXG59XFxuLm9hay5zcGFjZXIubWFzc2l2ZSB7XFxuICB3aWR0aDogNTBweDtcXG4gIGhlaWdodDogNTBweDtcXG59XFxuXCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2Nzcy1sb2FkZXIhLi9+L2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3JjL2FwcC9TcGFjZXIubGVzc1xuLy8gbW9kdWxlIGlkID0gNTY5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcIikoZmFsc2UpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiLmZ1bGxXaWR0aCB7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuLmZ1bGxIZWlnaHQge1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG4uZnVsbFNpemUge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcblwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jc3MtbG9hZGVyIS4vfi9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3NyYy9hcHAvc3R5bGVzLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDU3MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvL1xuLy9cdCMgQ29yZSBgcnVsZXNgIC0tIHNpbXBsZSBkYXRhdHlwZXMsIGV0Yy5cbi8vXG4vLyBOT1RFOiBtYW55IG9mIHRoZSBiZWxvdyBhcmUgY3JlYXRlZCBhcyBjdXN0b20gUGF0dGVybiBzdWJjbGFzc2VzIGZvciBkZWJ1Z2dpbmcuXG4vL1xuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuaW1wb3J0IFRva2VuaXplciBmcm9tIFwiLi4vLi4vVG9rZW5pemVyXCI7XG5cbi8vIENyZWF0ZSBgY29yZWAgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck5hbWUoXCJjb3JlXCIpO1xuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG5wYXJzZXIuZGVmaW5lUnVsZXMoXG4gIHtcbiAgICBuYW1lOiBcInN0YXRlbWVudHNcIixcbiAgICBjb25zdHJ1Y3RvcjogUnVsZS5TdGF0ZW1lbnRzXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiY29tbWVudFwiLFxuICAgIGNvbnN0cnVjdG9yOiBSdWxlLkNvbW1lbnRcbiAgfSxcblxuICAvLyBgd29yZGAgPSBpcyBhIHNpbmdsZSBhbHBoYW51bWVyaWMgd29yZC5cbiAgLy8gTVVTVCBzdGFydCB3aXRoIGEgbG93ZXItY2FzZSBsZXR0ZXIgKD8pXG4gIHtcbiAgICBuYW1lOiBcIndvcmRcIixcbiAgICBwYXR0ZXJuOiAvXlthLXpdW1xcd1xcLV0qJC8sXG4gICAgY2Fub25pY2FsOiBcIldvcmRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgd29yZCBleHRlbmRzIFJ1bGUuUGF0dGVybiB7XG4gICAgICAvLyBDb252ZXJ0IFwiLVwiIHRvIFwiX1wiIGluIHNvdXJjZSBvdXRwdXQuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0Y2hlZC5yZXBsYWNlKC9cXC0vZywgXCJfXCIpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgd29yZHNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhYmNcIiwgXCJhYmNcIl0sXG4gICAgICAgICAgW1wiYWJjLWRlZlwiLCBcImFiY19kZWZcIl0sXG4gICAgICAgICAgW1wiYWJjX2RlZlwiLCBcImFiY19kZWZcIl0sXG4gICAgICAgICAgW1wiYWJjMDFcIiwgXCJhYmMwMVwiXSxcbiAgICAgICAgICBbXCJhYmMtZGVmXzAxXCIsIFwiYWJjX2RlZl8wMVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiZG9lc24ndCBtYXRjaCB0aGluZ3MgdGhhdCBhcmVuJ3Qgd29yZHNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCIkYXNkYVwiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcIihhc2RhKVwiLCB1bmRlZmluZWRdICAgICAvLyBUT0RPLi4uID8/P1xuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICAvLyBgaWRlbnRpZmllcmAgPSB2YXJpYWJsZXMgb3IgcHJvcGVydHkgbmFtZS5cbiAgLy8gTVVTVCBzdGFydCB3aXRoIGEgbG93ZXItY2FzZSBsZXR0ZXIgKD8pXG4gIC8vIE5PVEU6IFdlIGJsYWNrbGlzdCBhIGxvdCBvZiB3b3JkcyBhcyBpZGVudGlmaWVycy5cbiAge1xuICAgIG5hbWU6IFwiaWRlbnRpZmllclwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBjYW5vbmljYWw6IFwiSWRlbmZpZmllclwiLFxuICAgIHBhdHRlcm46IC9eW2Etel1bXFx3XFwtXSokLyxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaWRlbnRpZmllciBleHRlbmRzIFJ1bGUuUGF0dGVybiB7XG4gICAgICAvLyBDb252ZXJ0IFwiLVwiIHRvIFwiX1wiIGluIHNvdXJjZSBvdXRwdXQuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0Y2hlZC5yZXBsYWNlKC9cXC0vZywgXCJfXCIpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYmxhY2tsaXN0OiBbXG4gICAgICAvLyBBZGQgRW5nbGlzaCBwcmVwb3NpdGlvbnMgdG8gaWRlbnRpZmllciBibGFja2xpc3QuXG4gICAgICAvL1xuICAgICAgLy8gV2lraXBlZGlhIFwiUHJlcG9zaXRpb25cIjpcbiAgICAgIC8vXHRcIlByZXBvc2l0aW9ucy4uLmFyZSBhIGNsYXNzIG9mIHdvcmRzIHRoYXRcbiAgICAgIC8vXHRleHByZXNzIHNwYXRpYWwgb3IgdGVtcG9yYWwgcmVsYXRpb25zICAoaW4sIHVuZGVyLCB0b3dhcmRzLCBiZWZvcmUpXG4gICAgICAvL1x0b3IgbWFyayB2YXJpb3VzIHNlbWFudGljIHJvbGVzIChvZiwgZm9yKS5cbiAgICAgIC8vIFRFU1RNRVxuICAgICAgXCJhYm91dFwiLCBcImFib3ZlXCIsIFwiYWZ0ZXJcIiwgXCJhbmRcIiwgXCJhc1wiLCBcImF0XCIsXG4gICAgICBcImJlZm9yZVwiLCBcImJlaGluZFwiLCBcImJlbG93XCIsIFwiYmVuZWF0aFwiLCBcImJlc2lkZVwiLCBcImJldHdlZW5cIiwgXCJiZXlvbmRcIiwgXCJieVwiLFxuICAgICAgXCJkZWZpbmVkXCIsIFwiZG93blwiLCBcImR1cmluZ1wiLFxuICAgICAgXCJlYWNoXCIsIFwiZW1wdHlcIiwgXCJleGFjdGx5XCIsIFwiZXhjZXB0XCIsXG4gICAgICBcImZvclwiLCBcImZyb21cIixcbiAgICAgIFwiZ3JlYXRlclwiLFxuICAgICAgXCJJXCIsIFwiaW5cIiwgXCJpbnRvXCIsXG4gICAgICBcImxlc3NcIiwgXCJsb25nXCIsXG4gICAgICBcIm1lXCIsIFwibWludXNcIiwgXCJtb3JlXCIsXG4gICAgICBcIm5lYXJcIiwgXCJub3RcIixcbiAgICAgIFwib2ZcIiwgXCJvZmZcIiwgXCJvblwiLCBcIm9udG9cIiwgXCJvcHBvc2l0ZVwiLCBcIm9yXCIsIFwib3V0XCIsIFwib3V0c2lkZVwiLCBcIm92ZXJcIixcbiAgICAgIFwic2hvcnRcIiwgXCJzaW5jZVwiLFxuICAgICAgXCJ0aGFuXCIsIFwidGhlXCIsIFwidGhlblwiLCBcInRocm91Z2hcIiwgXCJ0aHJ1XCIsIFwidG9cIiwgXCJ0b3dhcmRcIiwgXCJ0b3dhcmRzXCIsXG4gICAgICBcInVuZGVmaW5lZFwiLCBcInVuZGVyXCIsIFwidW5kZXJuZWF0aFwiLCBcInVuaXF1ZVwiLCBcInVudGlsXCIsIFwidXBcIiwgXCJ1cG9uXCIsIFwidXBzaWRlXCIsXG4gICAgICBcInZlcnN1c1wiLCBcInZzXCIsXG4gICAgICBcIndoZXJlXCIsIFwid2l0aFwiLCBcIndpdGhpblwiLCBcIndpdGhvdXRcIixcblxuICAgICAgLy8gQWRkIGNvbW1vbiBlbmdsaXNoIHZlcmJzIHRvIGlkZW50aWZpZXIgYmxhY2tsaXN0LlxuICAgICAgXCJhcmVcIixcbiAgICAgIFwiZG9cIiwgXCJkb2VzXCIsXG4gICAgICBcImNvbnRhaW5zXCIsXG4gICAgICBcImhhc1wiLCBcImhhdmVcIixcbiAgICAgIFwiaXNcIixcbiAgICAgIFwicmVwZWF0XCIsXG4gICAgICBcIndhc1wiLCBcIndlcmVcIixcblxuICAgICAgLy8gQWRkIHNwZWNpYWwgY29udHJvbCBrZXl3b3JkcyB0byBpZGVudGlmaWVyIGJsYWNrbGlzdC5cbiAgICAgIFwiZWxzZVwiLFxuICAgICAgXCJpZlwiLFxuICAgICAgXCJvdGhlcndpc2VcIixcbiAgICAgIFwid2hpbGVcIixcblxuICAgICAgLy8gQWRkIGJvb2xlYW4gdG9rZW5zIHRvIGlkZW50aWZpZXIgYmxhY2tsaXN0LlxuICAgICAgXCJ0cnVlXCIsIFwiZmFsc2VcIixcbiAgICAgIFwieWVzXCIsIFwibm9cIixcbiAgICAgIFwib2tcIiwgXCJjYW5jZWxcIixcbiAgICAgIFwic3VjY2Vzc1wiLCBcImZhaWx1cmVcIixcblxuICAgICAgLy8gQWRkIG51bWJlciB3b3JkcyB0byBpZGVudGlmaWVyIGJsYWNrbGlzdC5cbiAgICAgIC8vIFRFU1RNRVxuICAgICAgXCJvbmVcIiwgXCJ0d29cIiwgXCJ0aHJlZVwiLCBcImZvdXJcIiwgXCJmaXZlXCIsXG4gICAgICBcInNpeFwiLCBcInNldmVuXCIsIFwiZWlnaHRcIiwgXCJuaW5lXCIsIFwidGVuXCIsXG4gICAgXSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBpZGVudGlmaWVyc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIlwiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcImFiY1wiLCBcImFiY1wiXSxcbiAgICAgICAgICBbXCJhYmMtZGVmXCIsIFwiYWJjX2RlZlwiXSxcbiAgICAgICAgICBbXCJhYmNfZGVmXCIsIFwiYWJjX2RlZlwiXSxcbiAgICAgICAgICBbXCJhYmMwMVwiLCBcImFiYzAxXCJdLFxuICAgICAgICAgIFtcImFiYy1kZWZfMDFcIiwgXCJhYmNfZGVmXzAxXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJkb2Vzbid0IG1hdGNoIHRoaW5ncyB0aGF0IGFyZW4ndCBpZGVudGlmaWVyc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIlwiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcIiRhc2RhXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wiKGFzZGEpXCIsIHVuZGVmaW5lZF0sICAgICAvLyBUT0RPLi4uID8/P1xuICAgICAgICAgIFtcIkFiY1wiLCB1bmRlZmluZWRdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJza2lwcyBpdGVtcyBpbiBpdHMgYmxhY2tsaXN0XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wieWVzXCIsIHVuZGVmaW5lZF1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfSxcblxuICAvLyBgVHlwZWAgPSB0eXBlIG5hbWUuXG4gIC8vIE1VU1Qgc3RhcnQgd2l0aCBhbiB1cHBlci1jYXNlIGxldHRlciAoPylcbiAge1xuICAgIG5hbWU6IFwidHlwZVwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBjYW5vbmljYWw6IFwiVHlwZVwiLFxuICAgIHBhdHRlcm46IC9eKFtBLVpdW1xcd1xcLV0qfGxpc3R8dGV4dHxudW1iZXJ8aW50ZWdlcnxkZWNpbWFsfGNoYXJhY3Rlcnxib29sZWFufG9iamVjdCkkLyxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgdHlwZSBleHRlbmRzIFJ1bGUuUGF0dGVybiB7XG4gICAgICAvLyBDb252ZXJ0IFwiLVwiIHRvIFwiX1wiIGluIHNvdXJjZSBvdXRwdXQuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHR5cGUgPSB0aGlzLm1hdGNoZWQ7XG4gICAgICAgIHN3aXRjaCh0eXBlKSB7XG4gICAgICAgICAgLy8gQWxpYXMgYExpc3RgIHRvIGBBcnJheWBcbiAgICAgICAgICBjYXNlIFwiTGlzdFwiOlx0XHRyZXR1cm4gXCJBcnJheVwiO1xuXG4gICAgICAgICAgLy8gc3BlY2lhbCBjYXNlIHRvIHRha2UgdGhlIGZvbGxvd2luZyBhcyBsb3dlcmNhc2VcbiAgICAgICAgICBjYXNlIFwibGlzdFwiOlx0XHRyZXR1cm4gXCJBcnJheVwiO1xuICAgICAgICAgIGNhc2UgXCJ0ZXh0XCI6XHRcdHJldHVybiBcIlN0cmluZ1wiO1xuICAgICAgICAgIGNhc2UgXCJjaGFyYWN0ZXJcIjpcdHJldHVybiBcIkNoYXJhY3RlclwiO1xuICAgICAgICAgIGNhc2UgXCJudW1iZXJcIjpcdFx0cmV0dXJuIFwiTnVtYmVyXCI7XG4gICAgICAgICAgY2FzZSBcImludGVnZXJcIjpcdFx0cmV0dXJuIFwiSW50ZWdlclwiO1xuICAgICAgICAgIGNhc2UgXCJkZWNpbWFsXCI6XHRcdHJldHVybiBcIkRlY2ltYWxcIjtcbiAgICAgICAgICBjYXNlIFwiYm9vbGVhblwiOlx0XHRyZXR1cm4gXCJCb29sZWFuXCI7XG4gICAgICAgICAgY2FzZSBcIm9iamVjdFwiOlx0XHRyZXR1cm4gXCJPYmplY3RcIjtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHR5cGUucmVwbGFjZSgvXFwtL2csIFwiX1wiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgYmxhY2tsaXN0OiBbIFwiSVwiIF0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgdHlwZXNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJBYmNcIiwgXCJBYmNcIl0sXG4gICAgICAgICAgW1wiQWJjLWRlZlwiLCBcIkFiY19kZWZcIl0sXG4gICAgICAgICAgW1wiQWJjX0RlZlwiLCBcIkFiY19EZWZcIl0sXG4gICAgICAgICAgW1wiQWJjMDFcIiwgXCJBYmMwMVwiXSxcbiAgICAgICAgICBbXCJBYmMtZGVmXzAxXCIsIFwiQWJjX2RlZl8wMVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiZG9lc24ndCBtYXRjaCB0aGluZ3MgdGhhdCBhcmVuJ3QgdHlwZXNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCIkQXNkYVwiLCB1bmRlZmluZWRdLCAgICAgLy8gVE9ETy4uLiA/Pz9cbiAgICAgICAgICBbXCIoQXNkYSlcIiwgdW5kZWZpbmVkXSwgICAgLy8gVE9ETy4uLiA/Pz9cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwic2tpcHMgaXRlbXMgaW4gaXRzIGJsYWNrbGlzdFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIklcIiwgdW5kZWZpbmVkXVxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICB9LFxuXG5cblxuICAvLyBCb29sZWFuIGxpdGVyYWwsIGNyZWF0ZWQgd2l0aCBjdXN0b20gY29uc3RydWN0b3IgZm9yIGRlYnVnZ2luZy5cbiAgLy8gVE9ETzogYmV0dGVyIG5hbWUgZm9yIHRoaXM/Pz9cbiAge1xuICAgIG5hbWU6IFwiYm9vbGVhblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBjYW5vbmljYWw6IFwiQm9vbGVhblwiLFxuICAgIHBhdHRlcm46IC9eKHRydWV8ZmFsc2V8eWVzfG5vfG9rfGNhbmNlbHxzdWNjZXNzfGZhaWx1cmUpJC8sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGJvb2xlYW4gZXh0ZW5kcyBSdWxlLlBhdHRlcm4ge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5tYXRjaGVkKSB7XG4gICAgICAgICAgY2FzZSBcInRydWVcIjpcbiAgICAgICAgICBjYXNlIFwieWVzXCI6XG4gICAgICAgICAgY2FzZSBcIm9rXCI6XG4gICAgICAgICAgY2FzZSBcInN1Y2Nlc3NcIjpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgYm9vbGVhbnNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCJ0cnVlXCIsIHRydWVdLFxuICAgICAgICAgIFtcInllc1wiLCB0cnVlXSxcbiAgICAgICAgICBbXCJva1wiLCB0cnVlXSxcbiAgICAgICAgICBbXCJzdWNjZXNzXCIsIHRydWVdLFxuICAgICAgICAgIFtcImZhbHNlXCIsIGZhbHNlXSxcbiAgICAgICAgICBbXCJub1wiLCBmYWxzZV0sXG4gICAgICAgICAgW1wiY2FuY2VsXCIsIGZhbHNlXSxcbiAgICAgICAgICBbXCJmYWlsdXJlXCIsIGZhbHNlXVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJkb2Vzbid0IG1hdGNoIGluIHRoZSBtaWRkbGUgb2YgYSBsb25nZXIga2V5d29yZFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcInllc3NpclwiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcInllcy1zaXJcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCJ5ZXNfc2lyXCIsIHVuZGVmaW5lZF1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAgLy8gYG51bWJlcmAgYXMgZWl0aGVyIGZsb2F0IG9yIGludGVnZXIsIGNyZWF0ZWQgd2l0aCBjdXN0b20gY29uc3RydWN0b3IgZm9yIGRlYnVnZ2luZy5cbiAgLy8gTk9URTogeW91IGNhbiBhbHNvIHVzZSBgb25lYC4uLmB0ZW5gIGFzIHN0cmluZ3MuJ1xuICAvLyBUT0RPOiAgYGludGVnZXJgIGFuZCBgZGVjaW1hbGA/ICB0b28gdGVjaHk/XG4gIHtcbiAgICBuYW1lOiBcIm51bWJlclwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBjYW5vbmljYWw6IFwiTnVtYmVyXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG51bWJlciBleHRlbmRzIFJ1bGUge1xuICAgICAgLy8gU3BlY2lhbCB3b3JkcyB5b3UgY2FuIHVzZSBhcyBudW1iZXJzLi4uXG4gICAgICBzdGF0aWMgTlVNQkVSX05BTUVTID0ge1xuICAgICAgICB6ZXJvOiAwLFxuICAgICAgICBvbmU6IDEsXG4gICAgICAgIHR3bzogMixcbiAgICAgICAgdGhyZWU6IDMsXG4gICAgICAgIGZvdXI6IDQsXG4gICAgICAgIGZpdmU6IDUsXG4gICAgICAgIHNpeDogNixcbiAgICAgICAgc2V2ZW46IDcsXG4gICAgICAgIGVpZ2h0OiA4LFxuICAgICAgICBuaW5lOiA5LFxuICAgICAgICB0ZW46IDEwXG4gICAgICB9XG5cbiAgICAgIC8vIE51bWJlcnMgZ2V0IGVuY29kZWQgYXMgbnVtYmVycyBpbiB0aGUgdG9rZW4gc3RyZWFtLlxuICAgICAgcGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCkge1xuICAgICAgICBsZXQgdG9rZW4gPSB0b2tlbnNbc3RhcnRdO1xuICAgICAgICAvLyBpZiBhIHN0cmluZywgYXR0ZW1wdCB0byBydW4gdGhyb3VnaCBvdXIgTlVNQkVSX05BTUVTXG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW4gPT09IFwic3RyaW5nXCIpIHRva2VuID0gUnVsZS5OdW1iZXIuTlVNQkVSX05BTUVTW3Rva2VuXTtcbiAgICAgICAgaWYgKHR5cGVvZiB0b2tlbiAhPT0gXCJudW1iZXJcIikgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoe1xuICAgICAgICAgIG1hdGNoZWQ6IHRva2VuLFxuICAgICAgICAgIG5leHRTdGFydDogc3RhcnQgKyAxXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBDb252ZXJ0IHRvIG51bWJlciBvbiBzb3VyY2Ugb3V0cHV0LlxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoZWQ7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBudW1iZXJzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiMVwiLCAxXSxcbiAgICAgICAgICBbXCIxMDAwXCIsIDEwMDBdLFxuICAgICAgICAgIFtcIi0xXCIsIC0xXSxcbiAgICAgICAgICBbXCIxLjFcIiwgMS4xXSxcbiAgICAgICAgICBbXCIwMDAuMVwiLCAwLjFdLFxuICAgICAgICAgIFtcIjEuXCIsIDFdLFxuICAgICAgICAgIFtcIi4xXCIsIDAuMV0sXG4gICAgICAgICAgW1wiLTExMS4xMTFcIiwgLTExMS4xMTFdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJkb2Vzbid0IG1hdGNoIHRoaW5ncyB0aGF0IGFyZW4ndCBudW1iZXJzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wiLlwiLCB1bmRlZmluZWRdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJyZXF1aXJlcyBuZWdhdGl2ZSBzaWduIHRvIGJlIHRvdWNoaW5nIHRoZSBudW1iZXJcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCItIDFcIiwgdW5kZWZpbmVkXVxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICAvLyBMaXRlcmFsIGB0ZXh0YCBzdHJpbmcsIGNyZWF0ZWQgd2l0aCBjdXN0b20gY29uc3RydWN0b3IgZm9yIGRlYnVnZ2luZy5cbiAgLy8gWW91IGNhbiB1c2UgZWl0aGVyIHNpbmdsZSBvciBkb3VibGUgcXVvdGVzIG9uIHRoZSBvdXRzaWRlIChhbHRob3VnaCBkb3VibGUgcXVvdGVzIGFyZSBwcmVmZXJyZWQpLlxuICAvLyBSZXR1cm5lZCB2YWx1ZSBoYXMgZW5jbG9zaW5nIHF1b3Rlcy5cbiAge1xuICAgIG5hbWU6IFwidGV4dFwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBjYW5vbmljYWw6IFwiVGV4dFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0ZXh0IGV4dGVuZHMgUnVsZSB7XG4gICAgICAvLyBUZXh0IHN0cmluZ3MgZ2V0IGVuY29kZWQgYXMgYHRleHRgIG9iamVjdHMgaW4gdGhlIHRva2VuIHN0cmVhbS5cbiAgICAgIHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDApIHtcbiAgICAgICAgbGV0IHRva2VuID0gdG9rZW5zW3N0YXJ0XTtcbiAgICAgICAgaWYgKCEodG9rZW4gaW5zdGFuY2VvZiBUb2tlbml6ZXIuVGV4dCkpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiB0aGlzLmNsb25lKHtcbiAgICAgICAgICBtYXRjaGVkOiB0b2tlbi5xdW90ZWRTdHJpbmcsXG4gICAgICAgICAgbmV4dFN0YXJ0OiBzdGFydCArIDFcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVkO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgdGV4dFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFsnXCJcIicsICdcIlwiJ10sXG4gICAgICAgICAgW1wiJydcIiwgXCInJ1wiXSxcbiAgICAgICAgICBbJ1wiYVwiJywgJ1wiYVwiJ10sXG4gICAgICAgICAgW1wiJ2EnXCIsIFwiJ2EnXCJdLFxuICAgICAgICAgIFsnXCJhYmNkXCInLCAnXCJhYmNkXCInXSxcbiAgICAgICAgICBbJ1wiYWJjIGRlZiBnaGkuIGprbFwiJywgJ1wiYWJjIGRlZiBnaGkuIGprbFwiJ10sXG4gICAgICAgICAgWydcIi4uLkNhblxcJ3QgdG91Y2ggdGhpc1wiJywgJ1wiLi4uQ2FuXFwndCB0b3VjaCB0aGlzXCInXSxcbi8vRklYTUUgICAgICAgICAgW1wiJ1xcXCJHYWR6b29rcyEgSSBjYW5cXFxcJ3QgYmVsaWV2ZSBpdCFcXFwiIGhlIHNhaWQnXCIsIFwiJ1xcXCJHYWR6b29rcyEgSSBjYW5cXCd0IGJlbGlldmUgaXQhXFxcIiBoZSBzYWlkJ1wiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAgLy8gTGl0ZXJhbCBsaXN0IChhcnJheSksIGVnOiAgYFsxLDIgLCB0cnVlLGZhbHNlIF1gXG4gIHtcbiAgICBuYW1lOiBcImxpdGVyYWxfbGlzdFwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiXFxcXFtbbGlzdDp7ZXhwcmVzc2lvbn0sXT9cXFxcXVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXRlcmFsX2xpc3QgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgWyR7bGlzdCA/IGxpc3Quam9pbihcIiwgXCIpIDogXCJcIn1dYDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIGxpdGVyYWwgbGlzdHNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJbXVwiLCBcIltdXCJdLFxuICAgICAgICAgIFtcIlsxXVwiLCBcIlsxXVwiXSxcbiAgICAgICAgICBbXCJbMSxdXCIsIFwiWzFdXCJdLFxuICAgICAgICAgIFtcIlsxLDIsM11cIiwgXCJbMSwgMiwgM11cIl0sXG4gICAgICAgICAgW1wiWzEsIDIsIDNdXCIsIFwiWzEsIDIsIDNdXCJdLFxuICAgICAgICAgIFtcIlsxLDIsMyxdXCIsIFwiWzEsIDIsIDNdXCJdLFxuICAgICAgICAgIFtcIlt5ZXMsbm8sJ2EnLDFdXCIsIFwiW3RydWUsIGZhbHNlLCAnYScsIDFdXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJkb2Vzbid0IG1hdGNoIG1hbGZvcm1lZCBsaXN0cyBcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCJbLDFdXCIsIHVuZGVmaW5lZF1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cblxuICAvLyBQYXJlbnRoZXNpemVkIGV4cHJlc3Npb25cbiAge1xuICAgIG5hbWU6IFwicGFyZW50aGVzaXplZF9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJcXFxcKHtleHByZXNzaW9ufVxcXFwpXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHBhcmVudGhlc2l6ZWRfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGV4cHJlc3Npb24gfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgLy8gZG9uJ3QgZG91YmxlIHBhcmVucyBpZiBub3QgbmVjZXNzYXJ5XG4gICAgICAgIGlmICh0eXBlb2YgZXhwcmVzc2lvbiA9PT0gXCJzdHJpbmdcIiAmJiBleHByZXNzaW9uLnN0YXJ0c1dpdGgoXCIoXCIpICYmIGV4cHJlc3Npb24uZW5kc1dpdGgoXCIpXCIpKSByZXR1cm4gZXhwcmVzc2lvbjtcbiAgICAgICAgcmV0dXJuIFwiKFwiICsgZXhwcmVzc2lvbiArIFwiKVwiO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgcGFyZW50aGVzaXplZCBleHByZXNzaW9uc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIihzb21lVmFyKVwiLCBcIihzb21lVmFyKVwiXSxcbiAgICAgICAgICBbXCIoKHNvbWVWYXIpKVwiLCBcIihzb21lVmFyKVwiXSxcbiAgICAgICAgICBbXCIoMSBhbmQgeWVzKVwiLCBcIigxICYmIHRydWUpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBtdWx0aXBsZSBwYXJlbnRoZXNpc1wiLFxuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIigxKSBhbmQgKHllcylcIiwgXCIoKDEpICYmICh0cnVlKSlcIl0sXG4gICAgICAgICAgW1wiKCgxKSBhbmQgKHllcykpXCIsIFwiKCgxKSAmJiAodHJ1ZSkpXCJdLFxuICAgICAgICAgIFtcIigoMSkgYW5kICgoeWVzKSkpXCIsIFwiKCgxKSAmJiAodHJ1ZSkpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJkb2Vzbid0IG1hdGNoIG1hbGZvcm1lZCBwYXJlbnRoZXNpemVkIGV4cHJlc3Npb25zXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiKGZvb1wiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcIihmb28oYmFyKWJhelwiLCB1bmRlZmluZWRdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfVxuXG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL2NvcmUuanMiLCIvLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfSB9KS5hICE9IDc7XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzXG4vLyBtb2R1bGUgaWQgPSA3MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faGFzLmpzXG4vLyBtb2R1bGUgaWQgPSA3M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4vX2llOC1kb20tZGVmaW5lJyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKTtcbnZhciBkUCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgYW5PYmplY3QoQXR0cmlidXRlcyk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gZFAoTywgUCwgQXR0cmlidXRlcyk7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKSB0aHJvdyBUeXBlRXJyb3IoJ0FjY2Vzc29ycyBub3Qgc3VwcG9ydGVkIScpO1xuICBpZiAoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKSBPW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcbiAgcmV0dXJuIE87XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwLmpzXG4vLyBtb2R1bGUgaWQgPSA3NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxMy1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0UHJvcFR5cGVzU2VjcmV0ID0gcmVxdWlyZSgnLi9saWIvUmVhY3RQcm9wVHlwZXNTZWNyZXQnKTtcblxuZnVuY3Rpb24gZW1wdHlGdW5jdGlvbigpIHt9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIHNoaW0ocHJvcHMsIHByb3BOYW1lLCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgcHJvcEZ1bGxOYW1lLCBzZWNyZXQpIHtcbiAgICBpZiAoc2VjcmV0ID09PSBSZWFjdFByb3BUeXBlc1NlY3JldCkge1xuICAgICAgLy8gSXQgaXMgc3RpbGwgc2FmZSB3aGVuIGNhbGxlZCBmcm9tIFJlYWN0LlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKFxuICAgICAgJ0NhbGxpbmcgUHJvcFR5cGVzIHZhbGlkYXRvcnMgZGlyZWN0bHkgaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgYHByb3AtdHlwZXNgIHBhY2thZ2UuICcgK1xuICAgICAgJ1VzZSBQcm9wVHlwZXMuY2hlY2tQcm9wVHlwZXMoKSB0byBjYWxsIHRoZW0uICcgK1xuICAgICAgJ1JlYWQgbW9yZSBhdCBodHRwOi8vZmIubWUvdXNlLWNoZWNrLXByb3AtdHlwZXMnXG4gICAgKTtcbiAgICBlcnIubmFtZSA9ICdJbnZhcmlhbnQgVmlvbGF0aW9uJztcbiAgICB0aHJvdyBlcnI7XG4gIH07XG4gIHNoaW0uaXNSZXF1aXJlZCA9IHNoaW07XG4gIGZ1bmN0aW9uIGdldFNoaW0oKSB7XG4gICAgcmV0dXJuIHNoaW07XG4gIH07XG4gIC8vIEltcG9ydGFudCFcbiAgLy8gS2VlcCB0aGlzIGxpc3QgaW4gc3luYyB3aXRoIHByb2R1Y3Rpb24gdmVyc2lvbiBpbiBgLi9mYWN0b3J5V2l0aFR5cGVDaGVja2Vycy5qc2AuXG4gIHZhciBSZWFjdFByb3BUeXBlcyA9IHtcbiAgICBhcnJheTogc2hpbSxcbiAgICBib29sOiBzaGltLFxuICAgIGZ1bmM6IHNoaW0sXG4gICAgbnVtYmVyOiBzaGltLFxuICAgIG9iamVjdDogc2hpbSxcbiAgICBzdHJpbmc6IHNoaW0sXG4gICAgc3ltYm9sOiBzaGltLFxuXG4gICAgYW55OiBzaGltLFxuICAgIGFycmF5T2Y6IGdldFNoaW0sXG4gICAgZWxlbWVudDogc2hpbSxcbiAgICBpbnN0YW5jZU9mOiBnZXRTaGltLFxuICAgIG5vZGU6IHNoaW0sXG4gICAgb2JqZWN0T2Y6IGdldFNoaW0sXG4gICAgb25lT2Y6IGdldFNoaW0sXG4gICAgb25lT2ZUeXBlOiBnZXRTaGltLFxuICAgIHNoYXBlOiBnZXRTaGltLFxuICAgIGV4YWN0OiBnZXRTaGltXG4gIH07XG5cbiAgUmVhY3RQcm9wVHlwZXMuY2hlY2tQcm9wVHlwZXMgPSBlbXB0eUZ1bmN0aW9uO1xuICBSZWFjdFByb3BUeXBlcy5Qcm9wVHlwZXMgPSBSZWFjdFByb3BUeXBlcztcblxuICByZXR1cm4gUmVhY3RQcm9wVHlwZXM7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3Byb3AtdHlwZXMvZmFjdG9yeVdpdGhUaHJvd2luZ1NoaW1zLmpzXG4vLyBtb2R1bGUgaWQgPSA3NzBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG4vKipcbiAqIEBtb2R1bGUgY29tcG9uZW50V3JhcHBlclxuICpcbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0ICogYXMgc3RvcmUgZnJvbSAnLi4vc3RvcmUnO1xuaW1wb3J0IHsgb25Nb3VudCwgb25Vbm1vdW50IH0gZnJvbSAnLi4vZXZlbnRfaGFuZGxlcnMnO1xuaW1wb3J0IHsgQUxMX0tFWVMgfSBmcm9tICcuLi9saWIva2V5cyc7XG5cbi8qKlxuICogY29tcG9uZW50V3JhcHBlclxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gV3JhcHBlZENvbXBvbmVudCBSZWFjdCBjb21wb25lbnQgY2xhc3MgdG8gYmUgd3JhcHBlZFxuICogQHBhcmFtIHthcnJheX0gW2tleXNdIFRoZSBrZXkocykgYm91bmQgdG8gdGhlIGNsYXNzXG4gKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBoaWdoZXItb3JkZXIgZnVuY3Rpb24gdGhhdCB3cmFwcyB0aGUgZGVjb3JhdGVkIGNsYXNzXG4gKi9cbmZ1bmN0aW9uIGNvbXBvbmVudFdyYXBwZXIoV3JhcHBlZENvbXBvbmVudCkge1xuICB2YXIga2V5cyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogQUxMX0tFWVM7XG5cbiAgdmFyIEtleUJvYXJkSGVscGVyID0gZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoS2V5Qm9hcmRIZWxwZXIsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gS2V5Qm9hcmRIZWxwZXIocHJvcHMpIHtcbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBLZXlCb2FyZEhlbHBlcik7XG5cbiAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChLZXlCb2FyZEhlbHBlci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKEtleUJvYXJkSGVscGVyKSkuY2FsbCh0aGlzLCBwcm9wcykpO1xuXG4gICAgICBfdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgZXZlbnQ6IG51bGxcbiAgICAgIH07XG4gICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEtleUJvYXJkSGVscGVyLCBbe1xuICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBvbk1vdW50KHRoaXMpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgb25Vbm1vdW50KHRoaXMpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2hhbmRsZUtleURvd24nLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZUtleURvd24oZXZlbnQpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgLy8gdG8gc2ltdWxhdGUgYSBrZXlwcmVzcywgc2V0IHRoZSBldmVudCBhbmQgdGhlbiBjbGVhciBpdCBpbiB0aGUgY2FsbGJhY2tcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGV2ZW50OiBldmVudCB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzMi5zZXRTdGF0ZSh7IGV2ZW50OiBudWxsIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoV3JhcHBlZENvbXBvbmVudCwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHsga2V5ZG93bjogdGhpcy5zdGF0ZSB9KSk7XG4gICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEtleUJvYXJkSGVscGVyO1xuICB9KFJlYWN0LkNvbXBvbmVudCk7XG5cbiAgc3RvcmUuc2V0QmluZGluZyh7IGtleXM6IFtdLmNvbmNhdChrZXlzKSwgZm46IEtleUJvYXJkSGVscGVyLnByb3RvdHlwZS5oYW5kbGVLZXlEb3duLCB0YXJnZXQ6IEtleUJvYXJkSGVscGVyLnByb3RvdHlwZSB9KTtcblxuICByZXR1cm4gS2V5Qm9hcmRIZWxwZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbXBvbmVudFdyYXBwZXI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9jbGFzc19kZWNvcmF0b3IuanNcbi8vIG1vZHVsZSBpZCA9IDg0MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbi8qKlxuICogQG1vZHVsZSBkZWNvcmF0b3JzXG4gKlxuICovXG5pbXBvcnQgY2xhc3NXcmFwcGVyIGZyb20gJy4vY2xhc3NfZGVjb3JhdG9yJztcbmltcG9ydCBtZXRob2RXcmFwcGVyIGZyb20gJy4vbWV0aG9kX2RlY29yYXRvcic7XG5pbXBvcnQgbWV0aG9kV3JhcHBlclNjb3BlZCBmcm9tICcuL21ldGhvZF9kZWNvcmF0b3Jfc2NvcGVkJztcblxuLyoqXG4gKiBub29wRGVjb3JhdG9yXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9IFJldHVybnMgYHVuZGVmaW5lZGAgc28gdGhhdCB0aGUgb3JpZ2luYWwgdW5kZWNvcmF0ZWQgaW5zdGFuY2UvbWV0aG9kIGlzIHVzZWRcbiAqL1xuZnVuY3Rpb24gbm9vcERlY29yYXRvcigpIHtcbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBfZGVjb3JhdG9yXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtZXRob2RGbiBUaGUgbWV0aG9kIHdyYXBwZXIgdG8gZGVsZWdhdGUgdG8sIGJhc2VkIG9uIHdoZXRoZXIgdXNlciBoYXMgc3BlY2lmaWVkIGEgc2NvcGVkIGRlY29yYXRvciBvciBub3RcbiAqIEBwYXJhbSB7QXJyYXl9IC4uLmFyZ3MgUmVtYWluZGVyIG9mIGFyZ3VtZW50cyBwYXNzZWQgaW5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgZGVjb3JhdGVkIGNsYXNzIG9yIG1ldGhvZFxuICovXG5mdW5jdGlvbiBfZGVjb3JhdG9yKG1ldGhvZEZuKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgLy8gY2hlY2sgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHNlZSBpZiBpdCdzIGEgdXNlci1zdXBwbGllZCBrZXljb2RlIG9yIGFycmF5XG4gIC8vIG9mIGtleWNvZGVzLCBvciBpZiBpdCdzIHRoZSB3cmFwcGVkIGNsYXNzIG9yIG1ldGhvZFxuICB2YXIgdGVzdEFyZyA9IGFyZ3NbMF07XG4gIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSh0ZXN0QXJnKTtcblxuICAvLyBpZiB0aGUgdGVzdCBhcmd1bWVudCBpcyBub3QgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uLCBpdCBpcyB1c2VyLXN1cHBsaWVkXG4gIC8vIGtleWNvZGVzLiBlbHNlIHRoZXJlIGFyZSBubyBhcmd1bWVudHMgYW5kIGl0J3MganVzdCB0aGUgd3JhcHBlZCBjbGFzc1xuICBpZiAoaXNBcnJheSB8fCB+WydzdHJpbmcnLCAnbnVtYmVyJywgJ3N5bWJvbCddLmluZGV4T2YodHlwZW9mIHRlc3RBcmcgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKHRlc3RBcmcpKSkge1xuICAgIHZhciBrZXlzID0gaXNBcnJheSA/IHRlc3RBcmcgOiBhcmdzO1xuXG4gICAgLy8gcmV0dXJuIHRoZSBkZWNvcmF0b3IgZnVuY3Rpb24sIHdoaWNoIG9uIHRoZSBuZXh0IGNhbGwgd2lsbCBsb29rIGZvclxuICAgIC8vIHRoZSBwcmVzZW5jZSBvZiBhIG1ldGhvZCBuYW1lIHRvIGRldGVybWluZSBpZiB0aGlzIGlzIGEgd3JhcHBlZCBtZXRob2RcbiAgICAvLyBvciBjb21wb25lbnRcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbWV0aG9kTmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgcmV0dXJuIG1ldGhvZE5hbWUgPyBtZXRob2RGbih7IHRhcmdldDogdGFyZ2V0LCBkZXNjcmlwdG9yOiBkZXNjcmlwdG9yLCBrZXlzOiBrZXlzIH0pIDogY2xhc3NXcmFwcGVyKHRhcmdldCwga2V5cyk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgV3JhcHBlZENvbXBvbmVudCA9IGFyZ3NbMF07XG4gICAgdmFyIG1ldGhvZE5hbWUgPSBhcmdzWzFdO1xuXG4gICAgLy8gbWV0aG9kIGRlY29yYXRvcnMgd2l0aG91dCBrZXljb2RlICh3aGljaCkgYXJndW1lbnRzIGFyZSBub3QgYWxsb3dlZC5cbiAgICBpZiAoV3JhcHBlZENvbXBvbmVudCAmJiAhbWV0aG9kTmFtZSkge1xuICAgICAgcmV0dXJuIGNsYXNzV3JhcHBlci5hcHBseSh1bmRlZmluZWQsIGFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4obWV0aG9kTmFtZSArICc6IE1ldGhvZCBkZWNvcmF0b3JzIG11c3QgaGF2ZSBrZXljb2RlIGFyZ3VtZW50cywgc28gdGhlIGRlY29yYXRvciBmb3IgdGhpcyBtZXRob2Qgd2lsbCBub3QgZG8gYW55dGhpbmcnKTtcbiAgICAgIHJldHVybiBub29wRGVjb3JhdG9yO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIGtleWRvd25TY29wZWRcbiAqXG4gKiBNZXRob2QgZGVjb3JhdG9yIHRoYXQgd2lsbCBsb29rIGZvciBjaGFuZ2VzIHRvIGl0cyB0YXJnZXRlZCBjb21wb25lbnQnc1xuICogYGtleWRvd25gIHByb3BzIHRvIGRlY2lkZSB3aGVuIHRvIHRyaWdnZXIsIHJhdGhlciB0aGFuIHJlc3BvbmRpbmcgZGlyZWN0bHlcbiAqIHRvIGtleWRvd24gZXZlbnRzLiBUaGlzIGxldHMgeW91IHNwZWNpZnkgYSBAa2V5ZG93biBkZWNvcmF0ZWQgY2xhc3MgaGlnaGVyXG4gKiB1cCBpbiB0aGUgdmlldyBoaWVyYXJjaHkgZm9yIGxhcmdlciBzY29waW5nIG9mIGtleWRvd24gZXZlbnRzLCBvciBmb3JcbiAqIHByb2dyYW1tYXRpY2FsbHkgc2VuZGluZyBrZXlkb3duIGV2ZW50cyBhcyBwcm9wcyBpbnRvIHRoZSBjb21wb25lbnRzIGluIG9yZGVyXG4gKiB0byB0cmlnZ2VyIGRlY29yYXRlZCBtZXRob2RzIHdpdGggbWF0Y2hpbmcga2V5cy5cbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtBcnJheX0gLi4uYXJncyAgQWxsIChvciBubykgYXJndW1lbnRzIHBhc3NlZCBpbiBmcm9tIGRlY29yYXRpb25cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgZGVjb3JhdGVkIGNsYXNzIG9yIG1ldGhvZFxuICovXG5mdW5jdGlvbiBrZXlkb3duU2NvcGVkKCkge1xuICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuMiksIF9rZXkyID0gMDsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgIGFyZ3NbX2tleTJdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgfVxuXG4gIHJldHVybiBfZGVjb3JhdG9yLmFwcGx5KHVuZGVmaW5lZCwgW21ldGhvZFdyYXBwZXJTY29wZWRdLmNvbmNhdChhcmdzKSk7XG59XG5cbi8qKlxuICoga2V5ZG93blxuICpcbiAqIFRoZSBtYWluIGRlY29yYXRvciBhbmQgZGVmYXVsdCBleHBvcnQsIGhhbmRsZXMgYm90aCBjbGFzc2VzIGFuZCBtZXRob2RzLlxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge0FycmF5fSAuLi5hcmdzICBBbGwgKG9yIG5vKSBhcmd1bWVudHMgcGFzc2VkIGluIGZyb20gZGVjb3JhdGlvblxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBkZWNvcmF0ZWQgY2xhc3Mgb3IgbWV0aG9kXG4gKi9cbmZ1bmN0aW9uIGtleWRvd24oKSB7XG4gIGZvciAodmFyIF9sZW4zID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4zKSwgX2tleTMgPSAwOyBfa2V5MyA8IF9sZW4zOyBfa2V5MysrKSB7XG4gICAgYXJnc1tfa2V5M10gPSBhcmd1bWVudHNbX2tleTNdO1xuICB9XG5cbiAgcmV0dXJuIF9kZWNvcmF0b3IuYXBwbHkodW5kZWZpbmVkLCBbbWV0aG9kV3JhcHBlcl0uY29uY2F0KGFyZ3MpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQga2V5ZG93bjtcblxuZXhwb3J0IHsga2V5ZG93blNjb3BlZCB9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDg0MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbi8qKlxuICogQG1vZHVsZSBtZXRob2RXcmFwcGVyXG4gKlxuICovXG5pbXBvcnQgKiBhcyBzdG9yZSBmcm9tICcuLi9zdG9yZSc7XG5pbXBvcnQgeyBvbk1vdW50LCBvblVubW91bnQsIF9vbktleURvd24gfSBmcm9tICcuLi9ldmVudF9oYW5kbGVycyc7XG5cbi8qKlxuICogX2lzUmVhY3RLZXlEb3duXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgVGhlIHBvc3NpYmx5IHN5bnRoZXRpYyBldmVudCBwYXNzZWQgYXMgYW4gYXJndW1lbnQgd2l0aFxuICogdGhlIG1ldGhvZCBpbnZvY2F0aW9uLlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gX2lzUmVhY3RLZXlEb3duKGV2ZW50KSB7XG4gIHJldHVybiBldmVudCAmJiAodHlwZW9mIGV2ZW50ID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihldmVudCkpID09PSAnb2JqZWN0JyAmJiBldmVudC5uYXRpdmVFdmVudCBpbnN0YW5jZW9mIHdpbmRvdy5LZXlib2FyZEV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICdrZXlkb3duJztcbn1cblxuLyoqXG4gKiBtZXRob2RXcmFwcGVyXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzIEFsbCBhcmd1bWVudHMgbmVjZXNzYXJ5IGZvciB3cmFwcGluZyBtZXRob2RcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzLnRhcmdldCBUaGUgZGVjb3JhdGVkIGNsYXNzXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncy5kZXNjcmlwdG9yIE1ldGhvZCBkZXNjcmlwdG9yXG4gKiBAcGFyYW0ge2FycmF5fSBhcmdzLmtleXMgVGhlIGFycmF5IG9mIGtleXMgYm91bmQgdG8gdGhlIGdpdmVuIG1ldGhvZFxuICogQHJldHVybiB7b2JqZWN0fSBUaGUgbWV0aG9kIGRlc2NyaXB0b3JcbiAqL1xuZnVuY3Rpb24gbWV0aG9kV3JhcHBlcihfcmVmKSB7XG4gIHZhciB0YXJnZXQgPSBfcmVmLnRhcmdldCxcbiAgICAgIGRlc2NyaXB0b3IgPSBfcmVmLmRlc2NyaXB0b3IsXG4gICAgICBrZXlzID0gX3JlZi5rZXlzO1xuXG5cbiAgdmFyIGZuID0gZGVzY3JpcHRvci52YWx1ZTtcblxuICAvLyBpZiB3ZSBoYXZlbid0IGFscmVhZHkgY3JlYXRlZCBhIGJpbmRpbmcgZm9yIHRoaXMgY2xhc3MgKHZpYSBhbm90aGVyXG4gIC8vIGRlY29yYXRlZCBtZXRob2QpLCB3cmFwIHRoZXNlIGxpZmVjeWNsZSBtZXRob2RzLlxuICBpZiAoIXN0b3JlLmdldEJpbmRpbmcodGFyZ2V0KSkge1xuICAgIHZhciBjb21wb25lbnREaWRNb3VudCA9IHRhcmdldC5jb21wb25lbnREaWRNb3VudCxcbiAgICAgICAgY29tcG9uZW50V2lsbFVubW91bnQgPSB0YXJnZXQuY29tcG9uZW50V2lsbFVubW91bnQ7XG5cblxuICAgIHRhcmdldC5jb21wb25lbnREaWRNb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIG9uTW91bnQodGhpcyk7XG4gICAgICBpZiAoY29tcG9uZW50RGlkTW91bnQpIHJldHVybiBjb21wb25lbnREaWRNb3VudC5jYWxsKHRoaXMpO1xuICAgIH07XG5cbiAgICB0YXJnZXQuY29tcG9uZW50V2lsbFVubW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBvblVubW91bnQodGhpcyk7XG4gICAgICBpZiAoY29tcG9uZW50V2lsbFVubW91bnQpIHJldHVybiBjb21wb25lbnRXaWxsVW5tb3VudC5jYWxsKHRoaXMpO1xuICAgIH07XG4gIH1cblxuICAvLyBhZGQgdGhpcyBiaW5kaW5nIG9mIGtleXMgYW5kIG1ldGhvZCB0byB0aGUgdGFyZ2V0J3MgYmluZGluZ3NcbiAgc3RvcmUuc2V0QmluZGluZyh7IGtleXM6IGtleXMsIHRhcmdldDogdGFyZ2V0LCBmbjogZm4gfSk7XG5cbiAgZGVzY3JpcHRvci52YWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICB2YXIgbWF5YmVFdmVudCA9IGFyZ3NbMF07XG5cbiAgICBpZiAoX2lzUmVhY3RLZXlEb3duKG1heWJlRXZlbnQpKSB7XG4gICAgICAvLyBwcm94eSBtZXRob2QgaW4gb3JkZXIgdG8gdXNlIEBrZXlkb3duIGFzIGZpbHRlciBmb3Iga2V5ZG93biBldmVudHMgY29taW5nXG4gICAgICAvLyBmcm9tIGFuIGFjdHVhbCBvbktleURvd24gYmluZGluZyAoYXMgaWRlbnRpZmllZCBieSByZWFjdCdzIGFkZGl0aW9uIG9mXG4gICAgICAvLyAnbmF0aXZlRXZlbnQnICsgdHlwZSA9PT0gJ2tleWRvd24nKVxuICAgICAgaWYgKCFtYXliZUV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgLy8gd2UgYWxyZWFkeSB3aGl0ZWxpc3Qgc2hvcnRjdXRzIHdpdGggY3RybCBtb2RpZmllcnMgc28gaWYgd2Ugd2VyZSB0b1xuICAgICAgICAvLyBmaXJlIGl0IGFnYWluIGhlcmUgdGhlIG1ldGhvZCB3b3VsZCB0cmlnZ2VyIHR3aWNlLiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2dsb3J0aG8vcmVhY3Qta2V5ZG93bi9pc3N1ZXMvMzhcbiAgICAgICAgcmV0dXJuIF9vbktleURvd24obWF5YmVFdmVudCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghbWF5YmVFdmVudCB8fCAhKG1heWJlRXZlbnQgaW5zdGFuY2VvZiB3aW5kb3cuS2V5Ym9hcmRFdmVudCkgfHwgbWF5YmVFdmVudC50eXBlICE9PSAna2V5ZG93bicpIHtcbiAgICAgIC8vIGlmIG91ciBmaXJzdCBhcmd1bWVudCBpcyBhIGtleWRvd24gZXZlbnQgaXQgaXMgYmVpbmcgaGFuZGxlZCBieSBvdXJcbiAgICAgIC8vIGJpbmRpbmcgc3lzdGVtLiBpZiBpdCdzIGFueXRoaW5nIGVsc2UsIGp1c3QgcGFzcyB0aHJvdWdoLlxuICAgICAgcmV0dXJuIGZuLmNhbGwuYXBwbHkoZm4sIFt0aGlzXS5jb25jYXQoYXJncykpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZGVzY3JpcHRvcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWV0aG9kV3JhcHBlcjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9kZWNvcmF0b3JzL21ldGhvZF9kZWNvcmF0b3IuanNcbi8vIG1vZHVsZSBpZCA9IDg0M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEBtb2R1bGUgbWV0aG9kV3JhcHBlclNjb3BlZFxuICpcbiAqL1xuaW1wb3J0IG1hdGNoS2V5cyBmcm9tICcuLi9saWIvbWF0Y2hfa2V5cyc7XG5pbXBvcnQgcGFyc2VLZXlzIGZyb20gJy4uL2xpYi9wYXJzZV9rZXlzJztcblxuLyoqXG4gKiBtZXRob2RXcmFwcGVyU2NvcGVkXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzIEFsbCBhcmdzIG5lY2Vzc2FyeSBmb3IgZGVjb3JhdGluZyB0aGUgbWV0aG9kXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncy50YXJnZXQgVGhlIGRlY29yYXRlZCBtZXRob2QncyBjbGFzcyBvYmplY3RcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzLmRlc2NyaXB0b3IgVGhlIG1ldGhvZCdzIGRlc2NyaXB0b3Igb2JqZWN0XG4gKiBAcGFyYW0ge2FycmF5fSBhcmdzLmtleXMgVGhlIGtleSBjb2RlcyBib3VuZCB0byB0aGUgZGVjb3JhdGVkIG1ldGhvZFxuICogQHJldHVybiB7b2JqZWN0fSBUaGUgbWV0aG9kJ3MgZGVzY3JpcHRvciBvYmplY3RcbiAqL1xuZnVuY3Rpb24gbWV0aG9kV3JhcHBlclNjb3BlZChfcmVmKSB7XG4gIHZhciB0YXJnZXQgPSBfcmVmLnRhcmdldCxcbiAgICAgIGRlc2NyaXB0b3IgPSBfcmVmLmRlc2NyaXB0b3IsXG4gICAgICBrZXlzID0gX3JlZi5rZXlzO1xuICB2YXIgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IHRhcmdldC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzO1xuXG4gIHZhciBmbiA9IGRlc2NyaXB0b3IudmFsdWU7XG4gIGlmICgha2V5cykge1xuICAgIGNvbnNvbGUud2FybihmbiArICc6IGtleWRvd25TY29wZWQgcmVxdWlyZXMgb25lIG9yIG1vcmUga2V5cycpO1xuICB9IGVsc2Uge1xuXG4gICAgLyoqXG4gICAgICogX3Nob3VsZFRyaWdnZXJcbiAgICAgKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGlzUHJvcHMgRXhzdGluZyBwcm9wcyBmcm9tIHRoZSB3cmFwcGVkIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGlzUHJvcHMua2V5ZG93biBUaGUgbmFtZXNwYWNlZCBzdGF0ZSBmcm9tIHRoZSBoaWdoZXItb3JkZXJcbiAgICAgKiBjb21wb25lbnQgKGNsYXNzX2RlY29yYXRvcilcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbmV4dFByb3BzIFRoZSBpbmNvbWluZyBwcm9wcyBmcm9tIHRoZSB3cmFwcGVkIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBuZXh0UHJvcHMua2V5ZG93biBUaGUgbmFtZXNjYXBlZCBzdGF0ZSBmcm9tIHRoZSBoaWdoZXItb3JkZXJcbiAgICAgKiBjb21wb25lbnQgKGNsYXNzX2RlY29yYXRvcilcbiAgICAgKiBAcGFyYW0ge2FycmF5fSBrZXlzIFRoZSBrZXlzIGJvdW5kIHRvIHRoZSBkZWNvcmF0ZWQgbWV0aG9kXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciBhbGwgdGVzdHMgaGF2ZSBwYXNzZWRcbiAgICAgKi9cbiAgICB2YXIgX3Nob3VsZFRyaWdnZXIgPSBmdW5jdGlvbiBfc2hvdWxkVHJpZ2dlcihrZXlkb3duVGhpcywga2V5ZG93bk5leHQpIHtcbiAgICAgIGlmICghKGtleWRvd25OZXh0ICYmIGtleWRvd25OZXh0LmV2ZW50ICYmICFrZXlkb3duVGhpcy5ldmVudCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgcmV0dXJuIGtleVNldHMuc29tZShmdW5jdGlvbiAoa2V5U2V0KSB7XG4gICAgICAgIHJldHVybiBtYXRjaEtleXMoeyBrZXlTZXQ6IGtleVNldCwgZXZlbnQ6IGtleWRvd25OZXh0LmV2ZW50IH0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIHdyYXAgdGhlIGNvbXBvbmVudCdzIGxpZmVjeWNsZSBtZXRob2QgdG8gaW50ZXJjZXB0IGtleSBjb2RlcyBjb21pbmcgZG93blxuICAgIC8vIGZyb20gdGhlIHdyYXBwZWQvc2NvcGVkIGNvbXBvbmVudCB1cCB0aGUgdmlldyBoaWVyYXJjaHkuIGlmIG5ldyBrZXlkb3duXG4gICAgLy8gZXZlbnQgaGFzIGFycml2ZWQgYW5kIHRoZSBrZXkgY29kZXMgbWF0Y2ggd2hhdCB3YXMgc3BlY2lmaWVkIGluIHRoZVxuICAgIC8vIGRlY29yYXRvciwgY2FsbCB0aGUgd3JhcHBlZCBtZXRob2QuXG5cblxuICAgIHZhciBrZXlTZXRzID0gcGFyc2VLZXlzKGtleXMpO3RhcmdldC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzID0gZnVuY3Rpb24gKG5leHRQcm9wcykge1xuICAgICAgdmFyIGtleWRvd25OZXh0ID0gbmV4dFByb3BzLmtleWRvd247XG4gICAgICB2YXIga2V5ZG93blRoaXMgPSB0aGlzLnByb3BzLmtleWRvd247XG5cblxuICAgICAgaWYgKF9zaG91bGRUcmlnZ2VyKGtleWRvd25UaGlzLCBrZXlkb3duTmV4dCkpIHtcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywga2V5ZG93bk5leHQuZXZlbnQpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgYXJnc1tfa2V5IC0gMV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIGlmIChjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKSByZXR1cm4gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcy5jYWxsLmFwcGx5KGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMsIFt0aGlzLCBuZXh0UHJvcHNdLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBkZXNjcmlwdG9yO1xufVxuXG5leHBvcnQgZGVmYXVsdCBtZXRob2RXcmFwcGVyU2NvcGVkO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvbWV0aG9kX2RlY29yYXRvcl9zY29wZWQuanNcbi8vIG1vZHVsZSBpZCA9IDg0NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBwb2x5ZmlsbCBhcnJheS5mcm9tIChtYWlubHkgZm9yIElFKVxuaW1wb3J0ICcuL2xpYi9hcnJheS5mcm9tJztcblxuLy8gQGtleWRvd24gYW5kIEBrZXlkb3duU2NvcGVkXG5leHBvcnQgeyBkZWZhdWx0LCBrZXlkb3duU2NvcGVkIH0gZnJvbSAnLi9kZWNvcmF0b3JzJztcblxuLy8gc2V0QmluZGluZyAtIG9ubHkgdXNlZnVsIGlmIHlvdSdyZSBub3QgZ29pbmcgdG8gdXNlIGRlY29yYXRvcnNcbmV4cG9ydCB7IHNldEJpbmRpbmcgfSBmcm9tICcuL3N0b3JlJztcblxuLy8gS2V5cyAtIHVzZSB0aGlzIHRvIGZpbmQga2V5IGNvZGVzIGZvciBzdHJpbmdzLiBmb3IgZXhhbXBsZTogS2V5cy5qLCBLZXlzLmVudGVyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEtleXMsIEFMTF9LRVlTLCBBTExfUFJJTlRBQkxFX0tFWVMgfSBmcm9tICcuL2xpYi9rZXlzJztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gODQ1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIFByb2R1Y3Rpb24gc3RlcHMgb2YgRUNNQS0yNjIsIEVkaXRpb24gNiwgMjIuMS4yLjFcbi8vIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9mcm9tXG5pZiAoIUFycmF5LmZyb20pIHtcbiAgQXJyYXkuZnJvbSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuICAgIHZhciBpc0NhbGxhYmxlID0gZnVuY3Rpb24gaXNDYWxsYWJsZShmbikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJyB8fCB0b1N0ci5jYWxsKGZuKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgICB9O1xuICAgIHZhciB0b0ludGVnZXIgPSBmdW5jdGlvbiB0b0ludGVnZXIodmFsdWUpIHtcbiAgICAgIHZhciBudW1iZXIgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgaWYgKGlzTmFOKG51bWJlcikpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgICBpZiAobnVtYmVyID09PSAwIHx8ICFpc0Zpbml0ZShudW1iZXIpKSB7XG4gICAgICAgIHJldHVybiBudW1iZXI7XG4gICAgICB9XG4gICAgICByZXR1cm4gKG51bWJlciA+IDAgPyAxIDogLTEpICogTWF0aC5mbG9vcihNYXRoLmFicyhudW1iZXIpKTtcbiAgICB9O1xuICAgIHZhciBtYXhTYWZlSW50ZWdlciA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gICAgdmFyIHRvTGVuZ3RoID0gZnVuY3Rpb24gdG9MZW5ndGgodmFsdWUpIHtcbiAgICAgIHZhciBsZW4gPSB0b0ludGVnZXIodmFsdWUpO1xuICAgICAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KGxlbiwgMCksIG1heFNhZmVJbnRlZ2VyKTtcbiAgICB9O1xuXG4gICAgLy8gVGhlIGxlbmd0aCBwcm9wZXJ0eSBvZiB0aGUgZnJvbSBtZXRob2QgaXMgMS5cbiAgICByZXR1cm4gZnVuY3Rpb24gZnJvbShhcnJheUxpa2UgLyosIG1hcEZuLCB0aGlzQXJnICovKSB7XG4gICAgICAvLyAxLiBMZXQgQyBiZSB0aGUgdGhpcyB2YWx1ZS5cbiAgICAgIHZhciBDID0gdGhpcztcblxuICAgICAgLy8gMi4gTGV0IGl0ZW1zIGJlIFRvT2JqZWN0KGFycmF5TGlrZSkuXG4gICAgICB2YXIgaXRlbXMgPSBPYmplY3QoYXJyYXlMaWtlKTtcblxuICAgICAgLy8gMy4gUmV0dXJuSWZBYnJ1cHQoaXRlbXMpLlxuICAgICAgaWYgKGFycmF5TGlrZSA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcnJheS5mcm9tIHJlcXVpcmVzIGFuIGFycmF5LWxpa2Ugb2JqZWN0IC0gbm90IG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgfVxuXG4gICAgICAvLyA0LiBJZiBtYXBmbiBpcyB1bmRlZmluZWQsIHRoZW4gbGV0IG1hcHBpbmcgYmUgZmFsc2UuXG4gICAgICB2YXIgbWFwRm4gPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHZvaWQgdW5kZWZpbmVkO1xuICAgICAgdmFyIFQ7XG4gICAgICBpZiAodHlwZW9mIG1hcEZuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAvLyA1LiBlbHNlXG4gICAgICAgIC8vIDUuIGEgSWYgSXNDYWxsYWJsZShtYXBmbikgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgICAgaWYgKCFpc0NhbGxhYmxlKG1hcEZuKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FycmF5LmZyb206IHdoZW4gcHJvdmlkZWQsIHRoZSBzZWNvbmQgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyA1LiBiLiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVCBiZSB1bmRlZmluZWQuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgICAgICAgIFQgPSBhcmd1bWVudHNbMl07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gMTAuIExldCBsZW5WYWx1ZSBiZSBHZXQoaXRlbXMsIFwibGVuZ3RoXCIpLlxuICAgICAgLy8gMTEuIExldCBsZW4gYmUgVG9MZW5ndGgobGVuVmFsdWUpLlxuICAgICAgdmFyIGxlbiA9IHRvTGVuZ3RoKGl0ZW1zLmxlbmd0aCk7XG5cbiAgICAgIC8vIDEzLiBJZiBJc0NvbnN0cnVjdG9yKEMpIGlzIHRydWUsIHRoZW5cbiAgICAgIC8vIDEzLiBhLiBMZXQgQSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbQ29uc3RydWN0XV0gaW50ZXJuYWwgbWV0aG9kIFxuICAgICAgLy8gb2YgQyB3aXRoIGFuIGFyZ3VtZW50IGxpc3QgY29udGFpbmluZyB0aGUgc2luZ2xlIGl0ZW0gbGVuLlxuICAgICAgLy8gMTQuIGEuIEVsc2UsIExldCBBIGJlIEFycmF5Q3JlYXRlKGxlbikuXG4gICAgICB2YXIgQSA9IGlzQ2FsbGFibGUoQykgPyBPYmplY3QobmV3IEMobGVuKSkgOiBuZXcgQXJyYXkobGVuKTtcblxuICAgICAgLy8gMTYuIExldCBrIGJlIDAuXG4gICAgICB2YXIgayA9IDA7XG4gICAgICAvLyAxNy4gUmVwZWF0LCB3aGlsZSBrIDwgbGVu4oCmIChhbHNvIHN0ZXBzIGEgLSBoKVxuICAgICAgdmFyIGtWYWx1ZTtcbiAgICAgIHdoaWxlIChrIDwgbGVuKSB7XG4gICAgICAgIGtWYWx1ZSA9IGl0ZW1zW2tdO1xuICAgICAgICBpZiAobWFwRm4pIHtcbiAgICAgICAgICBBW2tdID0gdHlwZW9mIFQgPT09ICd1bmRlZmluZWQnID8gbWFwRm4oa1ZhbHVlLCBrKSA6IG1hcEZuLmNhbGwoVCwga1ZhbHVlLCBrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBBW2tdID0ga1ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGsgKz0gMTtcbiAgICAgIH1cbiAgICAgIC8vIDE4LiBMZXQgcHV0U3RhdHVzIGJlIFB1dChBLCBcImxlbmd0aFwiLCBsZW4sIHRydWUpLlxuICAgICAgQS5sZW5ndGggPSBsZW47XG4gICAgICAvLyAyMC4gUmV0dXJuIEEuXG4gICAgICByZXR1cm4gQTtcbiAgICB9O1xuICB9KCk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL2FycmF5LmZyb20uanNcbi8vIG1vZHVsZSBpZCA9IDg0NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEBtb2R1bGUgZG9tSGVscGVyc1xuICpcbiAqL1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5cbnZhciBmb2N1c2FibGVTZWxlY3RvciA9ICdhW2hyZWZdLCBidXR0b24sIGlucHV0LCBvYmplY3QsIHNlbGVjdCwgdGV4dGFyZWEsIFt0YWJpbmRleF0nO1xuXG4vKipcbiAqIGJpbmRGb2N1c2FibGVzOiBGaW5kIGFueSBmb2N1c2FibGUgY2hpbGQgZWxlbWVudHMgb2YgdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhbmRcbiAqIGFkZCBhbiBvbkZvY3VzIGhhbmRsZXIgdG8gZm9jdXMgb3VyIGtleWRvd24gaGFuZGxlcnMgb24gdGhlIHBhcmVudCBjb21wb25lbnRcbiAqIHdoZW4gdXNlciBrZXlzIGFwcGxpZXMgZm9jdXMgdG8gdGhlIGVsZW1lbnQuXG4gKlxuICogTk9URTogT25lIGxpbWl0YXRpb24gb2YgdGhpcyByaWdodCBub3cgaXMgdGhhdCBpZiB5b3UgdGFiIG91dCBvZiB0aGVcbiAqIGNvbXBvbmVudCwgX2ZvY3VzZWRJbnN0YW5jZSB3aWxsIHN0aWxsIGJlIHNldCB1bnRpbCBuZXh0IGNsaWNrIG9yIG1vdW50IG9yXG4gKiBjb250cm9sbGVkIGZvY3VzLlxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gaW5zdGFuY2UgVGhlIGtleS1ib3VuZCBjb21wb25lbnQgaW5zdGFuY2VcbiAqIEBwYXJhbSB7Y2FsbGJhY2t9IGFjdGl2YXRlT25Gb2N1cyBUaGUgZm4gdG8gZmlyZSB3aGVuIGVsZW1lbnQgaXMgZm9jdXNlZFxuICovXG5mdW5jdGlvbiBiaW5kRm9jdXNhYmxlcyhpbnN0YW5jZSwgYWN0aXZhdGVPbkZvY3VzKSB7XG4gIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBub2RlID0gUmVhY3RET00uZmluZERPTU5vZGUoaW5zdGFuY2UpO1xuICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgdmFyIGZvY3VzYWJsZXMgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoZm9jdXNhYmxlU2VsZWN0b3IpO1xuICAgICAgICBpZiAoZm9jdXNhYmxlcy5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgb25Gb2N1cyA9IGZ1bmN0aW9uIG9uRm9jdXMoZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIG9uRm9jdXNQcmV2ID0gZWxlbWVudC5vbmZvY3VzO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICBhY3RpdmF0ZU9uRm9jdXMoaW5zdGFuY2UpO1xuICAgICAgICAgICAgICBpZiAob25Gb2N1c1ByZXYpIG9uRm9jdXNQcmV2LmNhbGwoZWxlbWVudCwgZXZlbnQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZvY3VzYWJsZXMpLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50Lm9uZm9jdXMgPSBvbkZvY3VzKGVsZW1lbnQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIG5vb3AsIG1vc3RseSBzdXBwcmVzc2luZyBlcnJvciBoZXJlIGh0dHBzOi8vZ2l0aHViLmNvbS9nbG9ydGhvL3JlYWN0LWtleWRvd24vaXNzdWVzLzc2XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogZmluZENvbnRhaW5lck5vZGVzOiBDYWxsZWQgYnkgb3VyIGNsaWNrIGhhbmRsZXIgdG8gZmluZCBpbnN0YW5jZXMgd2l0aCBub2Rlc1xuICogdGhhdCBhcmUgZXF1YWwgdG8gb3IgdGhhdCBjb250YWluIHRoZSBjbGljayB0YXJnZXQuIEFueSB0aGF0IHBhc3MgdGhpcyB0ZXN0XG4gKiB3aWxsIGJlIHJlY2lwaWVudHMgb2YgdGhlIG5leHQga2V5ZG93biBldmVudC5cbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCBUaGUgY2xpY2sgZXZlbnQudGFyZ2V0IERPTSBlbGVtZW50XG4gKiBAcmV0dXJuIHtmdW5jdGlvbn0gUmVkdWNlciBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBmaW5kQ29udGFpbmVyTm9kZXModGFyZ2V0KSB7XG4gIHJldHVybiBmdW5jdGlvbiAobWVtbywgaW5zdGFuY2UpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIG5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZShpbnN0YW5jZSk7XG4gICAgICBpZiAobm9kZSAmJiAobm9kZSA9PT0gdGFyZ2V0IHx8IG5vZGUuY29udGFpbnModGFyZ2V0KSkpIHtcbiAgICAgICAgbWVtby5wdXNoKHsgaW5zdGFuY2U6IGluc3RhbmNlLCBub2RlOiBub2RlIH0pO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogc29ydEJ5RE9NUG9zaXRpb246IENhbGxlZCBieSBvdXIgY2xpY2sgaGFuZGxlciB0byBzb3J0IGEgbGlzdCBvZiBpbnN0YW5jZXNcbiAqIGFjY29yZGluZyB0byBsZWFzdCAtPiBtb3N0IG5lc3RlZC4gVGhpcyBpcyBzbyB0aGF0IGlmIG11bHRpcGxlIGtleWJvdW5kXG4gKiBpbnN0YW5jZXMgaGF2ZSBub2RlcyB0aGF0IGFyZSBhbmNlc3RvcnMgb2YgdGhlIGNsaWNrIHRhcmdldCwgdGhleSB3aWxsIGJlXG4gKiBzb3J0ZWQgdG8gbGV0IHRoZSBpbnN0YW5jZSBjbG9zZXN0IHRvIHRoZSBjbGljayB0YXJnZXQgZ2V0IGZpcnN0IGRpYnMgb24gdGhlXG4gKiBuZXh0IGtleSBkb3duIGV2ZW50LlxuICovXG5mdW5jdGlvbiBzb3J0QnlET01Qb3NpdGlvbihhLCBiKSB7XG4gIHJldHVybiBhLm5vZGUuY29tcGFyZURvY3VtZW50UG9zaXRpb24oYi5ub2RlKSA9PT0gMTAgPyAxIDogLTE7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHsgYmluZEZvY3VzYWJsZXM6IGJpbmRGb2N1c2FibGVzLCBmaW5kQ29udGFpbmVyTm9kZXM6IGZpbmRDb250YWluZXJOb2Rlcywgc29ydEJ5RE9NUG9zaXRpb246IHNvcnRCeURPTVBvc2l0aW9uIH07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL2RvbV9oZWxwZXJzLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBAbW9kdWxlIExpc3RlbmVyc1xuICpcbiAqL1xuXG4vLyBmbGFnIGZvciB3aGV0aGVyIGNsaWNrIGxpc3RlbmVyIGhhcyBiZWVuIGJvdW5kIHRvIGRvY3VtZW50XG52YXIgX2NsaWNrc0JvdW5kID0gZmFsc2U7XG5cbi8vIGZsYWcgZm9yIHdoZXRoZXIga2V5ZG93biBsaXN0ZW5lciBoYXMgYmVlbiBib3VuZCB0byBkb2N1bWVudFxudmFyIF9rZXlzQm91bmQgPSBmYWxzZTtcblxudmFyIExpc3RlbmVycyA9IHtcbiAgLyoqXG4gICAqIF9iaW5kS2V5c1xuICAgKlxuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKi9cbiAgYmluZEtleXM6IGZ1bmN0aW9uIGJpbmRLZXlzKGNhbGxiYWNrKSB7XG4gICAgaWYgKCFfa2V5c0JvdW5kKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY2FsbGJhY2spO1xuICAgICAgX2tleXNCb3VuZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG5cbiAgLyoqXG4gICAqIHVuYmluZEtleXNcbiAgICpcbiAgICogQGFjY2VzcyBwdWJsaWNcbiAgICovXG4gIHVuYmluZEtleXM6IGZ1bmN0aW9uIHVuYmluZEtleXMoY2FsbGJhY2spIHtcbiAgICBpZiAoX2tleXNCb3VuZCkge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGNhbGxiYWNrKTtcbiAgICAgIF9rZXlzQm91bmQgPSBmYWxzZTtcbiAgICB9XG4gIH0sXG5cblxuICAvKipcbiAgICogYmluZENsaWNrc1xuICAgKlxuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKi9cbiAgYmluZENsaWNrczogZnVuY3Rpb24gYmluZENsaWNrcyhjYWxsYmFjaykge1xuICAgIGlmICghX2NsaWNrc0JvdW5kKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbGxiYWNrLCB0cnVlKTtcbiAgICAgIF9jbGlja3NCb3VuZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG5cbiAgLyoqXG4gICAqIHVuYmluZENsaWNrc1xuICAgKlxuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKi9cbiAgdW5iaW5kQ2xpY2tzOiBmdW5jdGlvbiB1bmJpbmRDbGlja3MoY2FsbGJhY2spIHtcbiAgICBpZiAoX2NsaWNrc0JvdW5kKSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbGxiYWNrLCB0cnVlKTtcbiAgICAgIF9jbGlja3NCb3VuZCA9IGZhbHNlO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgTGlzdGVuZXJzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9saXN0ZW5lcnMuanNcbi8vIG1vZHVsZSBpZCA9IDg0OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBDb3VudGVyIGJlaW5nIGluY3JlbWVudGVkLiBKUyBpcyBzaW5nbGUtdGhyZWFkZWQsIHNvIGl0J2xsIEp1c3QgV29ya+KEoi5cbnZhciBfX2NvdW50ZXIgPSAxO1xuXG4vKipcbiAqIFJldHVybnMgYSBwcm9jZXNzLXdpZGUgdW5pcXVlIGlkZW50aWZpZXIuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHV1aWQoKSB7XG4gIHJldHVybiBcInVpZC1cIiArIF9fY291bnRlcisrO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi91dWlkLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy9cdCMgUGFyc2VyIFJ1bGVzXG4vL1x0UnVsZXMgY2FuIGJlIGFzIHNpbXBsZSBhcyBhIHN0cmluZyBgS2V5d29yZGAgb3IgYSBjb21wbGV4IHNlcXVlbmNlIG9mIChuZXN0ZWQpIHJ1bGVzLlxuLy9cbi8vXHRQYXJzZSBhIHJ1bGUgd2l0aCBgcnVsZS5wYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQsIGVuZClgLCB0aGlzIHdpbGwgZWl0aGVyOlxuLy9cdFx0LSByZXR1cm4gYHVuZGVmaW5lZGAgaWYgdGhlIHJ1bGUgZG9lc24ndCBtYXRjaCB0aGUgaGVhZCBvZiB0aGUgdG9rZW5zLCBvclxuLy9cdFx0LSByZXR1cm4gYSBDTE9ORSBvZiB0aGUgbWF0Y2hlZCBydWxlIHdpdGggYXQgbGVhc3QgdGhlIGZvbGxvd2luZzpcbi8vXHRcdFx0LSBgbWF0Y2hlZGBcdFx0UmVzdWx0cyBvZiB5b3VyIHBhcnNlLlxuLy9cdFx0XHQtIGBuZXh0U3RhcnRgXHRQbGFjZSB3aGVyZSBuZXh0IG1hdGNoIHNob3VsZCBzdGFydCAoZWc6IG9uZSBiZXlvbmQgd2hhdCB5b3UgbWF0Y2hlZCkuXG4vL1xuLy9cdFRoZSBjbG9uZSByZXR1cm5lZCBhYm92ZSBjYW4gYmUgbWFuaXB1bGF0ZWQgd2l0aFxuLy9cdFx0LSBgcnVsZS50b1NvdXJjZSgpYFx0ICBSZXR1cm4gamF2YXNjcmlwdCBzb3VyY2UgdG8gaW50ZXJwcmV0IHRoZSBydWxlLlxuLy9cdFx0LSBgcnVsZS50b1N5bnRheCgpYFx0ICBSZXR1cm4gcnVsZVN5bnRheCBmb3IgdGhlIHJ1bGUgKG1vc3RseSBmb3IgZGVidWdnaW5nKVxuLy8gICAgLVxuLy9cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4vUGFyc2VyLmpzXCI7XG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuL1Rva2VuaXplci5qc1wiO1xuXG5pbXBvcnQgZ2xvYmFsIGZyb20gXCIuL3V0aWxzL2dsb2JhbFwiO1xuaW1wb3J0IHsgaXNXaGl0ZXNwYWNlIH0gZnJvbSBcIi4vdXRpbHMvc3RyaW5nXCI7XG5cblxuLy8gQWJzdHJhY3QgUnVsZSBjbGFzcy5cbi8vIFRPRE9DXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSdWxlIHtcblx0Y29uc3RydWN0b3IoLi4ucHJvcHMpIHtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIC4uLnByb3BzKTtcblx0fVxuXG5cdC8vIENsb25lIHRoaXMgcnVsZSBhbmQgYWRkIGFueSBgcHJvcHNgIHBhc3NlZCBpbi5cblx0Y2xvbmUocHJvcHMpIHtcblx0XHRyZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcywgcHJvcHMpO1xuXHR9XG5cbi8vXG4vL1x0UGFyc2luZyBwcmltaXRpdmVzIC0tIHlvdSBNVVNUIGltcGxlbWVudCB0aGVzZSBpbiB5b3VyIHN1YmNsYXNzZXMhXG4vL1xuXG5cdC8vIEF0dGVtcHQgdG8gbWF0Y2ggdGhpcyBydWxlIGJldHdlZW4gYHN0YXJ0YCBhbmQgYGVuZGAgb2YgYHRva2Vuc2AuXG5cdC8vIFJldHVybnMgcmVzdWx0cyBvZiB0aGUgcGFyc2Ugb3IgYHVuZGVmaW5lZGAuXG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0Ly8gVGVzdCB0byBzZWUgaWYgYml0cyBvZiBvdXIgcnVsZSBhcmUgZm91bmQgQU5ZV0hFUkUgYmV0d2VlbiBgc3RhcnRgIGFuZCBgZW5kYCBpbiB0aGUgYHRva2Vuc2AuXG5cdC8vIFRoaXMgaXMgdXNlZCBieSBjb21wbGljYXRlZCAoZWc6IGxlZnQgcmVjdXJzaXZlKSBydWxlcyB0byBleGl0IHF1aWNrbHkgaWYgdGhlcmUncyBubyBjaGFuY2UuXG5cdC8vIFJldHVybnM6XG5cdC8vXHQtIGB0cnVlYCBpZiB0aGUgcnVsZSBNSUdIVCBiZSBtYXRjaGVkLlxuXHQvL1x0LSBgZmFsc2VgIGlmIHRoZXJlIGlzIE5PIFdBWSB0aGUgcnVsZSBjYW4gYmUgbWF0Y2hlZC5cblx0Ly9cdC0gYHVuZGVmaW5lZGAgaWYgbm90IGRldGVybWluc3RpYyAoZWc6IG5vIHdheSB0byB0ZWxsIHF1aWNrbHkpLlxuXHR0ZXN0KHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuLy9cbi8vICMjIG91dHB1dCBhcyBzb3VyY2Vcbi8vXG5cblx0Ly8gT3V0cHV0IHZhbHVlIGZvciB0aGlzIElOU1RBTlRJQVRFRCBydWxlIGFzIHNvdXJjZS5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hlZDtcblx0fVxuXG5cbi8vXG4vLyAjIyBvdXRwdXQgYXMgc3RydWN0dXJlOlxuLy9cblx0dG9TdHJ1Y3R1cmUoKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG4vL1xuLy8gIyMgcmVmbGVjdGlvblxuLy9cblxufVxuXG5cbi8vIEFic3RyYWN0IHJ1bGUgZm9yIG9uZSBvciBtb3JlIHNlcXVlbnRpYWwgbGl0ZXJhbCB2YWx1ZXMgdG8gbWF0Y2guXG4vLyBgcnVsZS5saXRlcmFsc2AgaXMgdGhlIGxpdGVyYWwgc3RyaW5nIG9yIGFycmF5IG9mIGxpdGVyYWwgc3RyaW5ncyB0byBtYXRjaC5cbi8vIGBydWxlLmxpdGVyYWxTZXBhcmF0b3JgIGlzIHRoZSBzdHJpbmcgdG8gcHV0IGJldHdlZW4gbXVsdGlwbGUgbGl0ZXJhbHMgd2hlbiBqb2luaW5nLlxuLy9cbi8vIEFmdGVyIHBhcnNpbmdcbi8vICBgcnVsZS5tYXRjaGVkYCB3aWxsIGJlIHRoZSBzdHJpbmcgd2hpY2ggd2FzIG1hdGNoZWRcbi8vICBgcnVsZS5uZXh0U3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGFydCB0b2tlblxuUnVsZS5MaXRlcmFscyA9IGNsYXNzIGxpdGVyYWxzIGV4dGVuZHMgUnVsZSB7XG5cdGNvbnN0cnVjdG9yKC4uLnByb3BzKSB7XG5cdFx0c3VwZXIoLi4ucHJvcHMpO1xuXHRcdC8vIGNvZXJjZSB0byBhbiBhcnJheSAoYSBiaXQgc2xvd2VyIGJ1dCBjbGVhbmVyKS5cblx0XHRpZiAoIUFycmF5LmlzQXJyYXkodGhpcy5saXRlcmFscykpIHRoaXMubGl0ZXJhbHMgPSBbdGhpcy5saXRlcmFsc107XG5cdH1cblxuXHQvLyBBdHRlbXB0IHRvIG1hdGNoIHRoaXMgcnVsZSBpbiB0aGUgYHRva2Vuc2AuXG5cdC8vIFJldHVybnMgcmVzdWx0cyBvZiB0aGUgcGFyc2Ugb3IgYHVuZGVmaW5lZGAuXG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHRpZiAoIXRoaXMubWF0Y2hlc1N0YXJ0aW5nQXQodG9rZW5zLCBzdGFydCwgZW5kKSkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkOiB0aGlzLmxpdGVyYWxzLmpvaW4odGhpcy5saXRlcmFsU2VwYXJhdG9yKSxcblx0XHRcdG5leHRTdGFydDogc3RhcnQgKyB0aGlzLmxpdGVyYWxzLmxlbmd0aFxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gRG9lcyB0aGlzIG1hdGNoIGFwcGVhciBBTllXSEVSRSBpbiB0aGUgdG9rZW5zP1xuXHR0ZXN0KHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGgpIHtcblx0ICBsZXQgZmlyc3QgPSB0aGlzLmxpdGVyYWxzWzBdO1xuXHQgIGZvciAodmFyIGluZGV4ID0gc3RhcnQ7IGluZGV4IDwgZW5kOyBpbmRleCsrKSB7XG5cdCAgICBpZiAodG9rZW5zW2luZGV4XSAhPT0gZmlyc3QpIGNvbnRpbnVlO1xuXHQgICAgaWYgKHRoaXMubWF0Y2hlc1N0YXJ0aW5nQXQodG9rZW5zLCBpbmRleCwgZW5kKSkgcmV0dXJuIHRydWU7XG5cdCAgfVxuXHQgIHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIE1hdGNoIG91ciBgbGl0ZXJhbHNgIGJldHdlZW4gYHN0YXJ0YCBhbmQgYGVuZGAgb2YgdG9rZW5zLlxuXHRtYXRjaGVzU3RhcnRpbmdBdCh0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kID0gdG9rZW5zLmxlbmd0aCkge1xuXHQgIGlmICh0aGlzLmxpdGVyYWxzLmxlbmd0aCA9PT0gMSkgcmV0dXJuIHRva2Vuc1tzdGFydF0gPT09IHRoaXMubGl0ZXJhbHNbMF07XG4gICAgcmV0dXJuIHRoaXMubGl0ZXJhbHMuZXZlcnkoKGxpdGVyYWwsIGkpID0+IChzdGFydCArIGkgPCBlbmQpICYmIChsaXRlcmFsID09PSB0b2tlbnNbc3RhcnQgKyBpXSkpO1xuXHR9XG5cbiAgdG9Tb3VyY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2hlZDtcbiAgfVxuXG5cdHRvU3ludGF4KCkge1xuXHRcdHJldHVybiBgJHt0aGlzLmxpdGVyYWxzLmpvaW4odGhpcy5saXRlcmFsU2VwYXJhdG9yIHx8IFwiXCIpfSR7dGhpcy5vcHRpb25hbCA/ICc/JyA6ICcnfWA7XG5cdH1cbn1cblxuLy8gT25lIG9yIG1vcmUgbGl0ZXJhbCBzeW1ib2xzOiBgPGAsIGAlYCBldGMuXG4vLyBTeW1ib2xzIGpvaW4gV0lUSE9VVCBzcGFjZXMuXG5SdWxlLlN5bWJvbHMgPSBjbGFzcyBzeW1ib2xzIGV4dGVuZHMgUnVsZS5MaXRlcmFscyB7fVxuXG5cbi8vIE9uZSBvciBtb3JlIGxpdGVyYWwga2V5d29yZHMuXG4vLyBLZXl3b3JkcyBqb2luIFdJVEggc3BhY2VzLlxuUnVsZS5LZXl3b3JkcyA9IGNsYXNzIGtleXdvcmRzIGV4dGVuZHMgUnVsZS5MaXRlcmFscyB7fVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFJ1bGUuS2V5d29yZHMucHJvdG90eXBlLCBcImxpdGVyYWxTZXBhcmF0b3JcIiwgeyB2YWx1ZTogXCIgXCIgfSk7XG5cblxuXG4vLyBSZWdleCBwYXR0ZXJuIHRvIG1hdGNoIGEgU0lOR0xFIHRva2VuLlxuLy8gYHJ1bGUucGF0dGVybmAgaXMgdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byBtYXRjaC5cbi8vICAgIE5vdGUgdGhhdCB5b3UgTVVTVCBzdGFydCB5b3VyIHBhdHRlcm4gd2l0aCBgXmAgYW5kIGVuZCB3aXRoIGAkYCB0byBtYWtlIHN1cmUgaXQgbWF0Y2hlcyB0aGUgZW50aXJlIHRva2VuLlxuLy8gICAgTm90ZSB0aGF0IHRoaXMgY2FuIG9ubHkgbWF0Y2ggYSBzaW5nbGUgdG9rZW4hXG4vLyBgcnVsZS5ibGFja2xpc3RgIGlzIGEgbWFwIG9mIGB7IGtleTogdHJ1ZSB9YCBmb3Igc3RyaW5ncyB3aGljaCB3aWxsIE5PVCBiZSBhY2NlcHRlZC5cbi8vXG4vLyBBZnRlciBwYXJzaW5nXG4vLyAgYHJ1bGUubWF0Y2hlZGAgd2lsbCBiZSB0aGUgc3RyaW5nIHdoaWNoIHdhcyBtYXRjaGVkLlxuLy8gIGBydWxlLm5leHRTdGFydGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IHN0YXJ0IHRva2VuLlxuUnVsZS5QYXR0ZXJuID0gY2xhc3MgcGF0dGVybiBleHRlbmRzIFJ1bGUge1xuXHQvLyBBdHRlbXB0IHRvIG1hdGNoIHRoaXMgcGF0dGVybiBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSB0b2tlbnMuXG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHRsZXQgdG9rZW4gPSB0b2tlbnNbc3RhcnRdO1xuXHRcdGlmICh0eXBlb2YgdG9rZW4gIT09IFwic3RyaW5nXCIpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbWF0Y2ggPSB0b2tlbi5tYXRjaCh0aGlzLnBhdHRlcm4pO1xuXHRcdGlmICghbWF0Y2gpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBiYWlsIGlmIHByZXNlbnQgaW4gYmxhY2tsaXN0XG5cdFx0bGV0IG1hdGNoZWQgPSBtYXRjaFswXTtcblx0XHRpZiAodGhpcy5ibGFja2xpc3QgJiYgdGhpcy5ibGFja2xpc3RbbWF0Y2hlZF0pIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkLFxuXHRcdFx0bmV4dFN0YXJ0OiBzdGFydCArIDFcblx0XHR9KTtcblx0fVxuXG5cdC8vIFRlc3QgdG8gc2VlIGlmIGFueSBvZiBvdXIgcGF0dGVybiBpcyBmb3VuZCBBTllXSEVSRSBpbiB0aGUgdG9rZW5zLlxuXHR0ZXN0KHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdHJldHVybiB0b2tlbnMuc2xpY2Uoc3RhcnQsIGVuZCkuc29tZSh0b2tlbiA9PiB0eXBlb2YgdG9rZW4gPT09IFwic3RyaW5nXCIgJiYgcGF0dGVybi50ZXN0KHRva2VuKSk7XG5cdH1cblxuXHR0b1N5bnRheCgpIHtcblx0XHRyZXR1cm4gdGhpcy5wYXR0ZXJuLnNvdXJjZTtcblx0fVxufVxuXG5cbi8vIFN1YnJ1bGUgLS0gbmFtZSBvZiBhbm90aGVyIHJ1bGUgdG8gYmUgY2FsbGVkLlxuLy8gYHJ1bGUuc3VicnVsZWAgaXMgdGhlIG5hbWUgb2YgdGhlIHJ1bGUgaW4gYHBhcnNlci5ydWxlc2AuXG4vL1xuLy8gQWZ0ZXIgcGFyc2luZ1xuLy8gIHdlJ2xsIHJldHVybiB0aGUgYWN0dWFsIHJ1bGUgdGhhdCB3YXMgbWF0Y2hlZCAocmF0aGVyIHRoYW4gYSBjbG9uZSBvZiB0aGlzIHJ1bGUpXG5SdWxlLlN1YnJ1bGUgPSBjbGFzcyBzdWJydWxlIGV4dGVuZHMgUnVsZSB7XG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHRsZXQgbWF0Y2hlZFJ1bGUgPSBwYXJzZXIucGFyc2VOYW1lZFJ1bGUodGhpcy5zdWJydWxlLCB0b2tlbnMsIHN0YXJ0LCBlbmQsIHN0YWNrLCBgcGFyc2Ugc3VicnVsZSAnJHt0aGlzLnJ1bGV9J2ApO1xuXHRcdGlmICghbWF0Y2hlZFJ1bGUpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0aWYgKHRoaXMuYXJndW1lbnQpIG1hdGNoZWRSdWxlLmFyZ3VtZW50ID0gdGhpcy5hcmd1bWVudDtcblx0XHRyZXR1cm4gbWF0Y2hlZFJ1bGU7XG5cdH1cblxuXHQvLyBBc2sgdGhlIHN1YnJ1bGUgdG8gZmlndXJlIG91dCBpZiBhIG1hdGNoIGlzIHBvc3NpYmxlLlxuXHR0ZXN0KHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdHJldHVybiBwYXJzZXIudGVzdCh0aGlzLnN1YnJ1bGUsIHRva2Vucywgc3RhcnQsIGVuZCk7XG5cdH1cblxuXHR0b1N5bnRheCgpIHtcblx0XHRyZXR1cm4gYHske3RoaXMuYXJndW1lbnQgPyB0aGlzLmFyZ3VtZW50K1wiOlwiIDogXCJcIn0ke3RoaXMuc3VicnVsZX19JHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcblx0fVxufVxuXG5cbi8vIFNlcXVlbmNlIG9mIHJ1bGVzIHRvIG1hdGNoLlxuLy8gIGBydWxlLnJ1bGVzYCBpcyB0aGUgYXJyYXkgb2YgcnVsZXMgdG8gbWF0Y2guXG4vLyAgYHJ1bGUubGVmdFJlY3Vyc2l2ZWAgc2hvdWxkIGJlIGB0cnVlYCBpZiB0aGUgZmlyc3Qgbm9uLW9wdGlvbmFsIHJ1bGUgaW4gb3VyIGBydWxlc2Bcbi8vICAgIG1heSBlbmQgdXAgY2FsbGluZyB1cyBhZ2Fpbi4gIEluIHRoaXMgY2FzZSwgeW91IHNob3VsZCBwcm92aWRlIGBydWxlLnRlc3RSdWxlYC5cbi8vXG4vLyBBZnRlciBwYXJzaW5nXG4vLyAgYHJ1bGUubWF0Y2hlZGAgd2lsbCBiZSB0aGUgYXJyYXkgb2YgcnVsZXMgd2hpY2ggd2VyZSBtYXRjaGVkLlxuLy8gIGBydWxlLm5leHRTdGFydGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IHN0YXJ0IHRva2VuLlxuUnVsZS5TZXF1ZW5jZSA9IGNsYXNzIHNlcXVlbmNlIGV4dGVuZHMgUnVsZSB7XG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHQvLyBJZiB3ZSBoYXZlIGEgYHRlc3RSdWxlYCBkZWZpbmVkXG5cdFx0aWYgKHRoaXMudGVzdFJ1bGUpIHtcblx0XHRcdC8vIEZvcmdldCBpdCBpZiB0aGVyZSBpcyBOTyBXQVkgdGhlIHJ1bGUgY291bGQgYmUgbWF0Y2hlZC5cblx0XHRcdGlmIChwYXJzZXIudGVzdCh0aGlzLnRlc3RSdWxlLCB0b2tlbnMsIHN0YXJ0KSA9PT0gZmFsc2UpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgd2UncmUgYSBsZWZ0UmVjdXJzaXZlIHNlcXVlbmNlLi4uXG5cdFx0aWYgKHRoaXMubGVmdFJlY3Vyc2l2ZSkge1xuXHRcdFx0Ly8gSWYgdGhlIHN0YWNrIGFscmVhZHkgY29udGFpbnMgdGhpcyBydWxlLCBmb3JnZXQgaXQuXG5cdFx0XHRpZiAoc3RhY2sgJiYgc3RhY2suaW5jbHVkZXModGhpcykpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRcdC8vIENsb25lIHN0YWNrIGFuZCBhZGQgdGhpcyBydWxlIGZvciByZWN1cnNpb24uLi5cblx0XHRcdHN0YWNrID0gc3RhY2sgPyBzdGFjay5jb25jYXQoKSA6IFtdO1xuXHRcdFx0c3RhY2sucHVzaCh0aGlzKTtcblxuXHRcdFx0Ly8gVE9ETzogV2UgY291bGQgZGlzdGluZ3Vpc2ggYmV0d2VlbiBwcm9kdWN0aXZlIGFuZCB1bnByb2R1Y3RpdmUgcnVsZXNcblx0XHRcdC8vXHRcdCBieSBjaGVja2luZyBvbmx5IHJ1bGVzIHdoaWNoIG9jY3VyIGF0IHRoZSBzYW1lIGBzdGFydGAuLi5cblx0XHRcdC8vXHRcdCBUaGlzIHdvdWxkIHByb2JhYmx5IGFsbG93IG1vcmUgaW50ZXJlc3RpbmcgdGhpbmdzLCBidXQgaXQncyBtdWNoIG11Y2ggc2xvd2VyLlxuXHRcdH1cblxuXHRcdGxldCBtYXRjaGVkID0gW107XG5cdFx0bGV0IG5leHRTdGFydCA9IHN0YXJ0O1xuXHRcdGxldCBpbmRleCA9IDAsIHJ1bGUgPSB1bmRlZmluZWQ7XG5cdFx0d2hpbGUgKHJ1bGUgPSB0aGlzLnJ1bGVzW2luZGV4KytdKSB7XG5cdFx0XHRsZXQgbWF0Y2ggPSBydWxlLnBhcnNlKHBhcnNlciwgdG9rZW5zLCBuZXh0U3RhcnQsIGVuZCwgc3RhY2spO1xuXHRcdFx0aWYgKCFtYXRjaCAmJiAhcnVsZS5vcHRpb25hbCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdGlmIChtYXRjaCkge1xuXHRcdFx0XHRtYXRjaGVkLnB1c2gobWF0Y2gpO1xuXHRcdFx0XHRuZXh0U3RhcnQgPSBtYXRjaC5uZXh0U3RhcnQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGlmIHdlIGdldCBoZXJlLCB3ZSBtYXRjaGVkIGFsbCB0aGUgcnVsZXMhXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZCxcblx0XHRcdG5leHRTdGFydFxuXHRcdH0pO1xuXHR9XG5cblxuLy9UT0RPQ1xuXHQvLyBcImdhdGhlclwiIGFyZ3VtZW50cyBpbiBwcmVwYXJhdGlvbiB0byBjYWxsIGB0b1NvdXJjZSgpYFxuXHQvLyBPbmx5IGNhbGxhYmxlIGFmdGVyIHBhcnNlIGlzIGNvbXBsZXRlZC5cblx0Ly8gUmV0dXJucyBhbiBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIGZyb20gdGhlIGBtYXRjaGVkYCBhcnJheSBpbmRleGVkIGJ5IG9uZSBvZiB0aGUgZm9sbG93aW5nOlxuXHQvL1x0XHQtIGBtYXRjaC5hcmd1bWVudGA6XHRcdGFyZ3VtZW50IHNldCB3aGVuIHJ1bGUgd2FzIGRlY2xhcmVkLCBlZzogYHt2YWx1ZTpsaXRlcmFsfWAgPT4gYHZhbHVlYFxuXHQvL1x0XHQtIGBtYXRjaC5ncm91cGA6XHRcdCAgbmFtZSBvZiBncm91cCBydWxlIHdhcyBhZGRlZCB0b1xuXHQvL1x0XHQtIGBtYXRjaC5jb25zdHJ1Y3Rvci5uYW1lYDpcdFx0XHRuYW1lIG9mIHRoZSBydWxlIHR5cGVcblx0Z2V0IHJlc3VsdHMoKSB7XG5cdFx0aWYgKCF0aGlzLm1hdGNoZWQpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0bGV0IHJlc3VsdHMgPSBhZGRSZXN1bHRzKHt9LCB0aGlzLm1hdGNoZWQpO1xuXHRcdGlmICh0aGlzLmNvbW1lbnQpIHJlc3VsdHMuY29tbWVudCA9IHRoaXMuY29tbWVudDtcblx0XHRyZXR1cm4gcmVzdWx0cztcblxuICAgIGZ1bmN0aW9uIGFkZFJlc3VsdHMocmVzdWx0cywgbWF0Y2hlZCkge1xuICAgICAgbGV0IGluZGV4ID0gMCwgbWF0Y2ggPSB1bmRlZmluZWQ7XG4gICAgICB3aGlsZSAobWF0Y2ggPSBtYXRjaGVkW2luZGV4KytdKSB7XG4gICAgICAgIGlmIChtYXRjaC5wcm9tb3RlKSB7XG4gICAgICAgICAgYWRkUmVzdWx0cyhyZXN1bHRzLCBtYXRjaC5tYXRjaGVkKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBjb25zdCBzb3VyY2VOYW1lID0gbWF0Y2guYXJndW1lbnQgfHwgbWF0Y2guZ3JvdXAgfHwgbWF0Y2guY29uc3RydWN0b3IubmFtZTtcbiAgICAgICAgICBjb25zdCBtYXRjaE5hbWUgPSBcIl9cIiArIHNvdXJjZU5hbWU7XG4gICAgICAgICAgY29uc3Qgc291cmNlID0gbWF0Y2gudG9Tb3VyY2UoKTtcbiAgICAgICAgICAvLyBJZiBhcmcgYWxyZWFkeSBleGlzdHMsIGNvbnZlcnQgdG8gYW4gYXJyYXlcbiAgICAgICAgICBpZiAobWF0Y2hOYW1lIGluIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShyZXN1bHRzW21hdGNoTmFtZV0pKSB7XG4gICAgICAgICAgICAgIHJlc3VsdHNbbWF0Y2hOYW1lXSA9IFtyZXN1bHRzW21hdGNoTmFtZV1dO1xuICAgICAgICAgICAgICByZXN1bHRzW3NvdXJjZU5hbWVdID0gW3Jlc3VsdHNbc291cmNlTmFtZV1dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0c1ttYXRjaE5hbWVdLnB1c2gobWF0Y2gpO1xuICAgICAgICAgICAgcmVzdWx0c1tzb3VyY2VOYW1lXS5wdXNoKHNvdXJjZSlcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHRzW21hdGNoTmFtZV0gPSBtYXRjaDtcbiAgICAgICAgICAgIHJlc3VsdHNbc291cmNlTmFtZV0gPSBzb3VyY2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cdH1cblxuXHQvLyBFY2hvIHRoaXMgcnVsZSBiYWNrIG91dC5cblx0dG9TeW50YXgoKSB7XG5cdCAgY29uc3QgcnVsZXMgPSB0aGlzLnJ1bGVzLm1hcChydWxlID0+IHJ1bGUudG9TeW50YXgoKSk7XG5cdFx0cmV0dXJuIGAke3RoaXMucnVsZXMuam9pbihcIiBcIil9JHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcblx0fVxuXG59XG5cblxuLy8gQWx0ZXJuYXRpdmUgc3ludGF4LCBtYXRjaGluZyBvbmUgb2YgYSBudW1iZXIgb2YgZGlmZmVyZW50IHJ1bGVzLlxuLy8gVGhlIHJlc3VsdCBvZiBhIHBhcnNlIGlzIHRoZSBsb25nZXN0IHJ1bGUgdGhhdCBhY3R1YWxseSBtYXRjaGVkLlxuLy8gTk9URTogQ3VycmVudGx5IHRha2VzIHRoZSBsb25nZXN0IHZhbGlkIG1hdGNoLlxuLy8gVE9ETzogbWF0Y2ggYWxsIHZhbGlkIGFsdGVybmF0aXZlc1xuLy9cbi8vIEFmdGVyIHBhcnNpbmdcbi8vICB3ZSdsbCByZXR1cm4gdGhlIHJ1bGUgd2hpY2ggaXMgdGhlIFwiYmVzdCBtYXRjaFwiIChyYXRoZXIgdGhhbiBjbG9uaW5nIHRoaXMgcnVsZSkuXG5SdWxlLkFsdGVybmF0aXZlcyA9IGNsYXNzIGFsdGVybmF0aXZlcyBleHRlbmRzIFJ1bGUge1xuXHRjb25zdHJ1Y3RvciguLi5wcm9wcykge1xuXHRcdHN1cGVyKC4uLnByb3BzKTtcblx0XHRpZiAoIXRoaXMucnVsZXMpIHRoaXMucnVsZXMgPSBbXTtcblx0fVxuXG5cdC8vIFRlc3QgdG8gc2VlIGlmIGFueSBvZiBvdXIgYWx0ZXJuYXRpdmVzIGFyZSBmb3VuZCBBTllXSEVSRSBpbiB0aGUgdG9rZW5zLlxuXHQvLyBOT1RFOiB0aGlzIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBpZiB3ZSdyZSBzcGVjaWZpZWQgYXMgYSBgdGVzdFJ1bGVgXG5cdC8vXHRcdCBhbmQgdGhlbiBvbmx5IGlmIGFsbCBvZiBvdXIgcnVsZXMgYXJlIGRldGVybWluaXN0aWMuXG5cdHRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0bGV0IGluZGV4ID0gMCwgcnVsZSA9IHVuZGVmaW5lZDtcblx0XHR3aGlsZSAocnVsZSA9IHRoaXMucnVsZXNbaW5kZXgrK10pIHtcblx0XHRcdGlmIChydWxlLnRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0LCBlbmQpKSByZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gRmluZCBhbGwgcnVsZXMgd2hpY2ggbWF0Y2ggYW5kIGRlbGVnYXRlIHRvIGBnZXRCZXN0TWF0Y2goKWAgdG8gcGljayB0aGUgYmVzdCBvbmUuXG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHRsZXQgbWF0Y2hlcyA9IFtdO1xuXHRcdGxldCBpbmRleCA9IDAsIHJ1bGUgPSB1bmRlZmluZWQ7XG5cdFx0d2hpbGUgKHJ1bGUgPSB0aGlzLnJ1bGVzW2luZGV4KytdKSB7XG5cdFx0XHRsZXQgbWF0Y2ggPSBydWxlLnBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCwgZW5kLCBzdGFjayk7XG5cdFx0XHRpZiAobWF0Y2gpIG1hdGNoZXMucHVzaChtYXRjaCk7XG5cdFx0fVxuXG5cdFx0aWYgKCFtYXRjaGVzLmxlbmd0aCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIHVuY29tbWVudCB0aGUgYmVsb3cgdG8gcHJpbnQgYWx0ZXJuYXRpdmVzXG5cdFx0Ly8gaWYgKG1hdGNoZXMubGVuZ3RoID4gMSkge1xuXHRcdC8vXHRjb25zb2xlLmluZm8odGhpcy5hcmd1bWVudCB8fCB0aGlzLmdyb3VwLCBtYXRjaGVzLCBtYXRjaGVzLm1hcChtYXRjaCA9PiBtYXRjaC5tYXRjaGVkVGV4dCkpO1xuXHRcdC8vIH1cblxuXHRcdGxldCBiZXN0TWF0Y2ggPSAobWF0Y2hlcy5sZW5ndGggPT09IDEgPyBtYXRjaGVzWzBdIDogdGhpcy5nZXRCZXN0TWF0Y2gobWF0Y2hlcykpO1xuXG5cdFx0Ly8gYXNzaWduIGBhcmdOYW1lYCBvciBgZ3JvdXBgIGZvciBgcmVzdWx0c2Bcblx0XHRpZiAodGhpcy5hcmd1bWVudCkgYmVzdE1hdGNoLmFyZ3VtZW50ID0gdGhpcy5hcmd1bWVudDtcblx0XHRlbHNlIGlmICh0aGlzLmdyb3VwKSBiZXN0TWF0Y2guZ3JvdXAgPSB0aGlzLmdyb3VwO1xuLy9UT0RPOiBvdGhlciB0aGluZ3MgdG8gY29weSBoZXJlPz8/XG5cblx0XHRyZXR1cm4gYmVzdE1hdGNoO1xuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBcImJlc3RcIiBtYXRjaCBnaXZlbiBtb3JlIHRoYW4gb25lIG1hdGNoZXMgYXQgdGhlIGhlYWQgb2YgdGhlIHRva2Vucy5cblx0Ly8gRGVmYXVsdCBpcyB0byByZXR1cm4gdGhlIGxvbmdlc3QgbWF0Y2guXG5cdC8vIEltcGxlbWVudCBzb21ldGhpbmcgZWxzZSB0byBkbywgZWcsIHByZWNlZGVuY2UgcnVsZXMuXG5cdGdldEJlc3RNYXRjaChtYXRjaGVzKSB7XG5cdFx0cmV0dXJuIG1hdGNoZXMucmVkdWNlKGZ1bmN0aW9uIChiZXN0LCBjdXJyZW50KSB7XG5cdFx0XHRpZiAoY3VycmVudC5uZXh0U3RhcnQgPiBiZXN0Lm5leHRTdGFydCkgcmV0dXJuIGN1cnJlbnQ7XG5cdFx0XHRyZXR1cm4gYmVzdDtcblx0XHR9LCBtYXRjaGVzWzBdKTtcblx0fVxuXG5cdGFkZFJ1bGUoLi4ucnVsZSkge1xuXHRcdHRoaXMucnVsZXMucHVzaCguLi5ydWxlKTtcblx0fVxuXG5cdHRvU3ludGF4KCkge1xuXHQgIGNvbnN0IHJ1bGVzID0gdGhpcy5ydWxlcy5tYXAocnVsZSA9PiBydWxlLnRvU3ludGF4KCkpLmpvaW4oXCJ8XCIpO1xuXHRcdHJldHVybiBgKCR7dGhpcy5hcmd1bWVudCA/IHRoaXMuYXJndW1lbnQrXCI6XCIgOiBcIlwifSR7cnVsZXN9KSR7dGhpcy5vcHRpb25hbCA/ICc/JyA6ICcnfWA7XG5cdH1cbn07XG5cblxuLy8gUmVwZWF0aW5nIHJ1bGUuXG4vL1x0YHRoaXMucmVwZWF0YCBpcyB0aGUgcnVsZSB0aGF0IHJlcGVhdHMuXG4vLyAgYHRoaXMub3B0aW9uYWxgIGlzIHRydWUgaWYgdGhlIHByb2R1dGlvbiBpcyBvcHRpb25hbC5cbi8vXHROb3RlOiBBdXRvbWF0aWNhbGx5IGNvbnN1bWVzIHdoaXRlc3BhY2UgYmVmb3JlIHJ1bGVzLlxuLy9cdE5vdGU6IFJldHVybnMgYHVuZGVmaW5lZGAgaWYgd2UgZG9uJ3QgbWF0Y2ggYXQgbGVhc3Qgb25jZS5cbi8vXG4vLyBBZnRlciBtYXRjaGluZzpcbi8vXHRgdGhpcy5tYXRjaGVkYCBpcyBhcnJheSBvZiBtYXRjaGVkIHJ1bGVzLlxuLy8gIGBydWxlLm5leHRTdGFydGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IHN0YXJ0IHRva2VuLlxuUnVsZS5SZXBlYXQgPSBjbGFzcyByZXBlYXQgZXh0ZW5kcyBSdWxlIHtcblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGxldCBtYXRjaGVkID0gW107XG5cdFx0bGV0IG5leHRTdGFydCA9IHN0YXJ0O1xuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRsZXQgbWF0Y2ggPSB0aGlzLnJlcGVhdC5wYXJzZShwYXJzZXIsIHRva2VucywgbmV4dFN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0XHRcdGlmICghbWF0Y2gpIGJyZWFrO1xuXG5cdFx0XHRtYXRjaGVkLnB1c2gobWF0Y2gpO1xuXHRcdFx0bmV4dFN0YXJ0ID0gbWF0Y2gubmV4dFN0YXJ0O1xuXHRcdH1cblxuXHRcdGlmIChtYXRjaGVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQsXG5cdFx0XHRuZXh0U3RhcnRcblx0XHR9KTtcblx0fVxuXG5cdHRvU291cmNlKCkge1xuXHRcdGlmICghdGhpcy5tYXRjaGVkKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdHJldHVybiB0aGlzLm1hdGNoZWQubWFwKG1hdGNoID0+IG1hdGNoLnRvU291cmNlKCkpO1xuXHR9XG5cblx0dG9TeW50YXgoKSB7XG5cdFx0bGV0IGlzQ29tcG91bmRSdWxlID0gKHRoaXMucmVwZWF0IGluc3RhbmNlb2YgUnVsZS5TZXF1ZW5jZSlcbiAgICAgIHx8ICh0aGlzLnJlcGVhdCBpbnN0YW5jZW9mIFJ1bGUuTGl0ZXJhbHMgJiYgdGhpcy5yZXBlYXQubGl0ZXJhbHMubGVuZ3RoID4gMSk7XG4gICAgY29uc3QgcmVwZWF0ID0gdGhpcy5yZXBlYXQudG9TeW50YXgoKTtcblx0XHRjb25zdCBydWxlID0gaXNDb21wb3VuZFJ1bGUgPyBgKCR7cmVwZWF0fSlgIDogYCR7cmVwZWF0fWA7XG5cdFx0cmV0dXJuIGAke3J1bGV9JHt0aGlzLm9wdGlvbmFsID8gJyonIDogJysnfWA7XG5cdH1cbn1cblxuXG4vLyBMaXN0IG1hdGNoIHJ1bGU6ICAgYFs8aXRlbT48ZGVsaW1pdGVyPl1gLiBlZ1wiIGBbe251bWJlcn0sXWAgdG8gbWF0Y2ggYDEsMiwzYFxuLy9cdGBydWxlLml0ZW1gIGlzIHRoZSBydWxlIGZvciBlYWNoIGl0ZW0sXG4vL1x0YHJ1bGUuZGVsaW1pdGVyYCBpcyB0aGUgZGVsaW1pdGVyIGJldHdlZW4gZWFjaCBpdGVtLCB3aGljaCBpcyBvcHRpb25hbCBhdCB0aGUgZW5kLlxuLy9cbi8vIEFmdGVyIG1hdGNoaW5nOlxuLy9cdGB0aGlzLm1hdGNoZWRgIGlzIGFycmF5IG9mIG1hdGNoZWQgcnVsZXMuXG4vLyAgYHJ1bGUubmV4dFN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RhcnQgdG9rZW4uXG4vL1xuLy8gTk9URTogd2UgYXNzdW1lIHRoYXQgYSBMaXN0IHJ1bGUgaXRzZWxmIHdpbGwgTk9UIHJlcGVhdCAoPz8/PylcblJ1bGUuTGlzdCA9IGNsYXNzIGxpc3QgZXh0ZW5kcyBSdWxlIHtcblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdC8vIGVuc3VyZSBpdGVtIGFuZCBkZWxpbWl0ZXIgYXJlIG9wdGlvbmFsIHNvIHdlIGRvbid0IGJhcmYgaW4gYHBhcnNlUnVsZWBcbi8vVE9ETzogPz8/XG5cdFx0dGhpcy5pdGVtLm9wdGlvbmFsID0gdHJ1ZTtcblx0XHR0aGlzLmRlbGltaXRlci5vcHRpb25hbCA9IHRydWU7XG5cblx0XHRsZXQgbWF0Y2hlZCA9IFtdO1xuXHRcdGxldCBuZXh0U3RhcnQgPSBzdGFydDtcblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0Ly8gZ2V0IG5leHQgaXRlbSwgZXhpdGluZyBpZiBub3QgZm91bmRcblx0XHRcdGxldCBpdGVtID0gdGhpcy5pdGVtLnBhcnNlKHBhcnNlciwgdG9rZW5zLCBuZXh0U3RhcnQsIGVuZCwgc3RhY2spO1xuXHRcdFx0aWYgKCFpdGVtKSBicmVhaztcblxuXHRcdFx0bWF0Y2hlZC5wdXNoKGl0ZW0pO1xuXHRcdFx0bmV4dFN0YXJ0ID0gaXRlbS5uZXh0U3RhcnQ7XG5cblx0XHRcdC8vIGdldCBkZWxpbWl0ZXIsIGV4aXRpbmcgaWYgbm90IGZvdW5kXG5cdFx0XHRsZXQgZGVsaW1pdGVyID0gdGhpcy5kZWxpbWl0ZXIucGFyc2UocGFyc2VyLCB0b2tlbnMsIG5leHRTdGFydCwgZW5kLCBzdGFjayk7XG5cdFx0XHRpZiAoIWRlbGltaXRlcikgYnJlYWs7XG5cdFx0XHRuZXh0U3RhcnQgPSBkZWxpbWl0ZXIubmV4dFN0YXJ0O1xuXHRcdH1cblxuXHRcdC8vIElmIHdlIGRpZG4ndCBnZXQgYW55IG1hdGNoZXMsIGZvcmdldCBpdC5cblx0XHRpZiAobWF0Y2hlZC5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkLFxuXHRcdFx0bmV4dFN0YXJ0XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBSZXR1cm5zIGxpc3Qgb2YgdmFsdWVzIGFzIHNvdXJjZS5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0aWYgKCF0aGlzLm1hdGNoZWQpIHJldHVybiBbXTtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkLm1hcCggbWF0Y2ggPT4gbWF0Y2gudG9Tb3VyY2UoKSApO1xuXHR9XG5cblx0dG9TeW50YXgoKSB7XG5cdCAgY29uc3QgaXRlbSA9IHRoaXMuaXRlbS50b1N5bnRheCgpO1xuXHQgIGNvbnN0IGRlbGltaXRlciA9IHRoaXMuZGVsaW1pdGVyLnRvU3ludGF4KCk7XG5cdFx0cmV0dXJuIGBbJHt0aGlzLmFyZ3VtZW50ID8gdGhpcy5hcmd1bWVudCtcIjpcIiA6IFwiXCJ9JHtpdGVtfSAke2RlbGltaXRlcn1dJHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcblx0fVxufTtcblxuXG5cbi8vIEEgYmxvY2sgaXMgdXNlZCB0byBwYXJzZSBhIG5lc3RlZCBibG9jayBvZiBzdGF0ZW1lbnRzLlxuLy8gQWJzdHJhY3QgY2xhc3MuXG5SdWxlLkJsb2NrID0gY2xhc3MgYmxvY2sgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcblxuXHQvLyBQYXJzZSB0aGUgZW50aXJlIGBibG9ja2AsIHJldHVybmluZyByZXN1bHRzLlxuXHRwYXJzZUJsb2NrKHBhcnNlciwgYmxvY2ssIGluZGVudCA9IDApIHtcblx0XHRsZXQgbWF0Y2hlZCA9IFtdO1xuLy9jb25zb2xlLndhcm4oXCJibG9jazpcIiwgYmxvY2spO1xuXHRcdGJsb2NrLmNvbnRlbnRzLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG5cdFx0XHRsZXQgcmVzdWx0O1xuXHRcdFx0aWYgKGl0ZW0ubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdG1hdGNoZWQucHVzaChuZXcgUnVsZS5CbGFua0xpbmUoKSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChpdGVtIGluc3RhbmNlb2YgVG9rZW5pemVyLkJsb2NrKSB7XG5cdFx0XHRcdGxldCBsYXN0ID0gbWF0Y2hlZFttYXRjaGVkLmxlbmd0aCAtIDFdO1xuXHRcdFx0XHRpZiAobGFzdC5wYXJzZUJsb2NrKSB7XG5cdFx0XHRcdFx0bGFzdC5wYXJzZUJsb2NrKHBhcnNlciwgaXRlbSwgaW5kZW50ICsgMSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0bGV0IGJsb2NrID0gdGhpcy5wYXJzZUJsb2NrKHBhcnNlciwgaXRlbSwgaW5kZW50ICsgMSk7XG5cdFx0XHRcdFx0aWYgKGJsb2NrICE9PSB1bmRlZmluZWQpIG1hdGNoZWQucHVzaChibG9jayk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRtYXRjaGVkID0gbWF0Y2hlZC5jb25jYXQodGhpcy5wYXJzZVN0YXRlbWVudChwYXJzZXIsIGl0ZW0pKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBuZXcgUnVsZS5CbG9jayh7XG5cdFx0XHRpbmRlbnQsXG5cdFx0XHRtYXRjaGVkXG5cdFx0fSk7XG5cdH1cblxuXHQvLyBQYXJzZSBhIHNpbmdsZSBzdGF0ZW1lbnQgKGEgbGluZSdzIHdvcnRoIG9mIGB0b2tlbnNgKS5cblx0Ly8gU2tpcHMgd2hpdGVzcGFjZSBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lLlxuXHQvLyBBdXRvLW1hdGNoZXMgY29tbWVudCBpbiB0aGUgbWlkZGxlIG9mIHRoZSBsaW5lLlxuXHQvLyBSZXR1cm5zIGFycmF5IG9mIHJlc3VsdHMuXG5cdHBhcnNlU3RhdGVtZW50KHBhcnNlciwgdG9rZW5zKSB7XG5cdFx0bGV0IHJlc3VsdHMgPSBbXTtcblx0XHRsZXQgc3RhcnQgPSAwLCBlbmQgPSB0b2tlbnMubGVuZ3RoO1xuXHRcdGxldCBzdGF0ZW1lbnQsIGNvbW1lbnQ7XG5cblx0XHQvLyBjaGVjayBmb3IgYW4gaW5kZW50IGF0IHRoZSBzdGFydCBvZiB0aGUgbGluZVxuXHRcdGlmICh0b2tlbnNbc3RhcnRdIGluc3RhbmNlb2YgVG9rZW5pemVyLldoaXRlc3BhY2UpIHN0YXJ0Kys7XG5cblx0XHQvLyBjaGVjayBmb3IgYSBjb21tZW50IGF0IHRoZSBlbmQgb2YgdGhlIHRva2Vuc1xuXHRcdGlmICh0b2tlbnNbZW5kLTFdIGluc3RhbmNlb2YgVG9rZW5pemVyLkNvbW1lbnQpIHtcblx0XHRcdGNvbW1lbnQgPSBwYXJzZXIucGFyc2VOYW1lZFJ1bGUoXCJjb21tZW50XCIsIHRva2VucywgZW5kLTEsIGVuZCwgdW5kZWZpbmVkLCBcInBhcnNlU3RhdGVtZW50XCIpO1xuXHRcdFx0Ly8gYWRkIGNvbW1lbnQgRklSU1QgaWYgZm91bmRcblx0XHRcdHJlc3VsdHMucHVzaChjb21tZW50KTtcblx0XHRcdGVuZC0tO1xuXHRcdH1cblxuXHRcdC8vIHBhcnNlIHRoZSByZXN0IGFzIGEgXCJzdGF0ZW1lbnRcIlxuXHRcdHN0YXRlbWVudCA9IHBhcnNlci5wYXJzZU5hbWVkUnVsZShcInN0YXRlbWVudFwiLCB0b2tlbnMsIHN0YXJ0LCBlbmQsIHVuZGVmaW5lZCwgXCJwYXJzZVN0YXRlbWVudFwiKTtcblx0XHQvLyBjb21wbGFpbiBpZiBubyBzdGF0ZW1lbnQgYW5kIG5vIGNvbW1lbnRcblx0XHRpZiAoIXN0YXRlbWVudCAmJiAhY29tbWVudCkge1xuXHRcdFx0bGV0IGVycm9yID0gbmV3IFJ1bGUuU3RhdGVtZW50UGFyc2VFcnJvcih7XG5cdFx0XHRcdHVucGFyc2VkOiB0b2tlbnMuc2xpY2Uoc3RhcnQsIGVuZCkuam9pbihcIiBcIilcblx0XHRcdH0pO1xuXHRcdFx0cmVzdWx0cy5wdXNoKGVycm9yKTtcblx0XHR9XG5cblx0XHQvLyBjb21wbGFpbiBpZiB3ZSBjYW4ndCBwYXJzZSB0aGUgZW50aXJlIGxpbmUhXG5cdFx0ZWxzZSBpZiAoc3RhdGVtZW50ICYmIHN0YXRlbWVudC5uZXh0U3RhcnQgIT09IGVuZCkge1xuXHRcdFx0bGV0IGVycm9yID0gbmV3IFJ1bGUuU3RhdGVtZW50UGFyc2VFcnJvcih7XG5cdFx0XHRcdHBhcnNlZCA6IHRva2Vucy5zbGljZShzdGFydCwgc3RhdGVtZW50Lm5leHRTdGFydCkuam9pbihcIiBcIiksXG5cdFx0XHRcdHVucGFyc2VkIDogdG9rZW5zLnNsaWNlKHN0YXRlbWVudC5uZXh0U3RhcnQsIGVuZCkuam9pbihcIiBcIilcblx0XHRcdH0pO1xuXHRcdFx0cmVzdWx0cy5wdXNoKGVycm9yKTtcblx0XHR9XG5cblx0XHQvLyBPdGhlcndpc2UgYWRkIHRoZSBzdGF0ZW1lbnRcblx0XHRlbHNlIGlmIChzdGF0ZW1lbnQpIHtcblx0XHRcdHJlc3VsdHMucHVzaChzdGF0ZW1lbnQpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHRzO1xuXHR9XG5cblx0Ly8gUmV0dXJuIHNvdXJjZSBmb3IgdGhpcyBibG9jayBhcyBhbiBhcnJheSBvZiBpbmRlbnRlZCBsaW5lcyBXSVRIT1VUIGB7YCBPUiBgfWAuXG5cdGJsb2NrVG9Tb3VyY2UoYmxvY2sgPSB0aGlzLm1hdGNoZWQpIHtcblx0XHRsZXQgcmVzdWx0cyA9IFtdLCBzdGF0ZW1lbnQ7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGJsb2NrLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgbWF0Y2ggPSBibG9ja1tpXTtcbiAgICAgIC8vY29uc29sZS5pbmZvKGksIG1hdGNoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgICAgICBzdGF0ZW1lbnQgPSBtYXRjaC50b1NvdXJjZSgpIHx8IFwiXCI7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgIGNvbnNvbGUud2FybihcIkVycm9yIGNvbnZlcnRpbmcgYmxvY2s6IFwiLCBibG9jaywgXCJzdGF0ZW1lbnQ6XCIsIG1hdGNoKTtcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5pbmZvKGksIHN0YXRlbWVudCk7XG5cdFx0XHRpZiAoaXNXaGl0ZXNwYWNlKHN0YXRlbWVudCkpIHtcblx0XHRcdFx0cmVzdWx0cy5wdXNoKFwiXCIpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoQXJyYXkuaXNBcnJheShzdGF0ZW1lbnQpKSB7XG5cdFx0XHRcdHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdChzdGF0ZW1lbnQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodHlwZW9mIHN0YXRlbWVudCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRzdGF0ZW1lbnQgPSBzdGF0ZW1lbnQuc3BsaXQoXCJcXG5cIik7XG5cdFx0XHRcdHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdChzdGF0ZW1lbnQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihcImJsb2NrVG9Tb3VyY2UoKTogRE9OJ1QgS05PVyBIT1cgVE8gV09SSyBXSVRIXFxuXFx0XCIsIHN0YXRlbWVudCwgXCJcXG5cXHRmcm9tIG1hdGNoXCIsIG1hdGNoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHRoaXMuaW5kZW50ICE9PSAwKSB7XG5cdFx0XHRyZXR1cm4gXCJcXHRcIiArIHJlc3VsdHMuam9pbihcIlxcblxcdFwiKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdHMuam9pbihcIlxcblwiKTtcblx0fVxuXG5cdHRvU291cmNlKCkge1xuXHRcdHJldHVybiBcIiB7XFxuXCIgKyB0aGlzLmJsb2NrVG9Tb3VyY2UoKSArIFwiXFxuXCIgKyBcIn1cIjtcblx0fVxuXG5cdC8vIENvbnZlcnQgdG8gbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiBzdHJ1Y3R1cmUgYnkgY29udmVydGluZyBpbmRpdmlkdWFsIHN0YXRlbWVudHMgYW5kIGdyb3VwaW5nXG5cdC8vIE5PVEU6IHlvdSBzaG91bGQgb3ZlcnJpZGUgdGhpcyBhbmQgaW5jbHVkZSBcInR5cGVcIlxuXHR0b1N0cnVjdHVyZSgpIHtcblx0XHRsZXQgeyBfbmFtZTogbmFtZSwgX3N1cGVyVHlwZTogc3VwZXJUeXBlIH0gPSB0aGlzLnJlc3VsdHM7XG5cdFx0bGV0IGJsb2NrID0gKHRoaXMuYmxvY2sgJiYgdGhpcy5ibG9jay5tYXRjaGVkKSB8fCBbXTtcblxuXHRcdGxldCBuYW1lZCA9IHt9O1xuXHRcdGxldCBwcm9wZXJ0aWVzID0gW107XG5cdFx0bGV0IG1ldGhvZHMgPSBbXTtcblx0XHRsZXQgb3RoZXIgPSBbXTtcblx0XHRibG9jay5tYXAoc3RhdGVtZW50ID0+IHN0YXRlbWVudC50b1N0cnVjdHVyZSgpKVxuXHRcdFx0IC5maWx0ZXIoQm9vbGVhbilcblx0XHRcdCAuZm9yRWFjaChhZGRTdHJ1Y3R1cmUpO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHR5cGU6IFwidW5rbm93blwiLFxuXHRcdFx0bmFtZSxcblx0XHRcdHN1cGVyVHlwZSxcblx0XHRcdG5hbWVkLFxuXHRcdFx0cHJvcGVydGllcyxcblx0XHRcdG1ldGhvZHMsXG5cdFx0XHRvdGhlclxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGFkZFN0cnVjdHVyZShzdHJ1Y3R1cmUpIHtcblx0XHRcdC8vIGFkZCBhcnJheXMgYXMgaW5kaXZpZHVhbCBpdGVtc1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoc3RydWN0dXJlKSkgcmV0dXJuIHN0cnVjdHVyZS5mb3JFYWNoKGFkZFN0cnVjdHVyZSk7XG5cblx0XHRcdC8vIGFkZCB1bmRlciBgbmFtZWRgIGZvciBxdWljayBoaXQgb2YgYWxsIHNpZ25pZmljYW50IGJpdHMuLi5cblx0XHRcdGlmIChzdHJ1Y3R1cmUubmFtZSkgbmFtZWRbc3RydWN0dXJlLm5hbWVdID0gc3RydWN0dXJlO1xuXG5cdFx0XHQvLyBhZGQgdW5kZXIgJ21ldGhvZHMnLCAncHJvcGVydGllcycgb3IgJ290aGVyJ1xuXHRcdFx0aWYgKHN0cnVjdHVyZS50eXBlID09PSBcImZ1bmN0aW9uXCIpIG1ldGhvZHMucHVzaChzdHJ1Y3R1cmUpO1xuXHRcdFx0ZWxzZSBpZiAoc3RydWN0dXJlLnR5cGUgPT09IFwicHJvcGVydHlcIikgcHJvcGVydGllcy5wdXNoKHN0cnVjdHVyZSk7XG5cdFx0XHRlbHNlIG90aGVyLnB1c2goc3RydWN0dXJlKTtcblx0XHR9XG5cdH1cblxuXHQvLyBGb3JtYXQgYXJyYXkgb2YgYHN0YXRlbWVudHNgIGFzIGEgSlMgb3V0cHV0IGJsb2NrOlxuXHQvL1x0LSBpZiBgc3RhdGVtZW50c2AgaXMgZW1wdHksIHJldHVybnMgYHt9YFxuXHQvL1x0LSBpZiBgc3RhdGVtZW50cyBpcyBhIHNpbmdsZSBsaW5lLCByZXR1cm5zIGB7IHN0YXRlbWVudCB9YFxuXHQvL1x0LSBlbHNlIHJldHVybnMgbXVsdGlwbGUgbGluZXNcblx0c3RhdGljIGVuY2xvc2VTdGF0ZW1lbnRzKC4uLmFyZ3MpIHtcblx0XHR2YXIgc3RhdGVtZW50cyA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGV0IGFyZyA9IGFyZ3NbaV07XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XG5cdFx0XHRcdHN0YXRlbWVudHMgPSBzdGF0ZW1lbnRzLmNvbmNhdChhcmcpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodHlwZW9mIGFyZyA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRzdGF0ZW1lbnRzLnB1c2goYXJnKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0c3RhdGVtZW50cyA9IHN0YXRlbWVudHMuam9pbihcIlxcblwiKTtcblxuXHRcdGlmICghc3RhdGVtZW50cykgcmV0dXJuIFwie31cIjtcblx0XHRpZiAoIXN0YXRlbWVudHMuaW5jbHVkZXMoXCJcXG5cIikgJiYgc3RhdGVtZW50cy5sZW5ndGggPCA0MCkge1xuXHRcdFx0cmV0dXJuIGB7ICR7c3RhdGVtZW50cy50cmltKCl9IH1gO1xuXHRcdH1cblx0XHRpZiAoc3RhdGVtZW50c1swXSAhPT0gXCJcXHRcIikgc3RhdGVtZW50cyA9IGBcXHQke3N0YXRlbWVudHN9YDtcblx0XHRyZXR1cm4gYHtcXG4ke3N0YXRlbWVudHN9XFxufWA7XG5cdH1cblxufVxuXG5cbi8vIGBTdGF0ZW1lbnRzYCBhcmUgYSBzcGVjaWFsIGNhc2UgZm9yIGEgYmxvY2sgb2YgYFN0YXRlbWVudGAgcnVsZXNcbi8vXHR0aGF0IHVuZGVyc3RhbmQgbmVzdGluZyBhbmQgY29tbWVudHMuXG4vL1xuLy8gVGhpcyBpcyBhIHRvcC1sZXZlbCBjb25zdHJ1Y3QsIGUuZy4gdXNlZCB0byBwYXJzZSBhbiBlbnRpcmUgZmlsZS5cblJ1bGUuU3RhdGVtZW50cyA9IGNsYXNzIHN0YXRlbWVudHMgZXh0ZW5kcyBSdWxlLkJsb2NrIHtcblxuXHQvLyBTcGxpdCBzdGF0ZW1lbnRzIHVwIGludG8gYmxvY2tzIGFuZCBwYXJzZSAnZW0uXG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGgsIHN0YWNrKSB7XG5cdFx0dmFyIGJsb2NrID0gVG9rZW5pemVyLmJyZWFrSW50b0Jsb2Nrcyh0b2tlbnMsIHN0YXJ0LCBlbmQpO1xuXG5cdFx0bGV0IG1hdGNoZWQgPSB0aGlzLnBhcnNlQmxvY2socGFyc2VyLCBibG9jayk7XG5cdFx0aWYgKCFtYXRjaGVkKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZCxcblx0XHRcdG5leHRTdGFydDogZW5kXG5cdFx0fSk7XG5cdH1cblxuXHQvLyBPdXRwdXQgc3RhdGVtZW50cyBXSVRIT1VUIGN1cmx5IGJyYWNlcyBhcm91bmQgdGhlbS5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hlZC5ibG9ja1RvU291cmNlKCk7XG5cdH1cbn1cblxuXG4vLyBBIGBCbG9ja1N0YXRlbWVudGAgKGUuZy4gYW4gYGlmYCBvciBgcmVwZWF0YCk6XG4vL1x0LSBpcyBhc3N1bWVkIHRvIGhhdmUgYW4gaW5pdGlhbCBwYXJ0aWFsIGBzdGF0ZW1lbnRgXG4vL1x0LSBNQVkgaGF2ZSBhbiBpbmxpbmUgYHN0YXRlbWVudGAgKG9uIHRoZSBzYW1lIGxpbmUsIHBvc3NpYmx5IGFmdGVyIGEgYDpgKVxuLy9cdC0gTUFZIGhhdmUgY29udGVudHMgYXMgYW4gZW1iZWRkZWQgYGJsb2NrYFxuLy9cbi8vXHRJbiB5b3VyIGByZXN1bHRzYCwgYGJsb2NrYCB3aWxsIGJlIHRoZSByZXN1bHRpbmcgYmxvY2sgb3V0cHV0LCBpZiB0aGVyZSBpcyBvbmUuXG4vL1x0SXQncyB1cCB0byB5b3VyIHJ1bGUgdG8gZG8gc29tZXRoaW5nIHdpdGggaXQuLi5cblJ1bGUuQmxvY2tTdGF0ZW1lbnQgPSBjbGFzcyBibG9ja19zdGF0ZW1lbnQgZXh0ZW5kcyBSdWxlLkJsb2NrIHtcblxuXHQvLyBQYXJzZSBhIGJsb2NrIGFuZCBhZGQgaXQgdG8gYHRoaXMuYmxvY2tgXG5cdHBhcnNlQmxvY2socGFyc2VyLCBibG9jaywgaW5kZW50ID0gMCkge1xuXHRcdHRoaXMuYmxvY2sgPSBzdXBlci5wYXJzZUJsb2NrKC4uLmFyZ3VtZW50cyk7XG5cdH1cblxuICAvLyBBZGQgb3VyIGBibG9ja2AgdG8gdGhlIHJlc3VsdHNcbiAgZ2V0IHJlc3VsdHMoKSB7XG4gICAgbGV0IHJlc3VsdHMgPSBzdXBlci5yZXN1bHRzO1xuICAgIGlmIChyZXN1bHRzICYmIHRoaXMuYmxvY2spIHtcbiAgICAgIHJlc3VsdHMuX2Jsb2NrID0gdGhpcy5ibG9jaztcbiAgICAgIHJlc3VsdHMuYmxvY2sgPSB0aGlzLmJsb2NrLnRvU291cmNlKCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59XG5cblxuLy8gQmxhbmsgbGluZSByZXByZXNlbnRhdGlvbiBpbiBwYXJzZXIgb3V0cHV0LlxuUnVsZS5CbGFua0xpbmUgPSBjbGFzcyBibGFua19saW5lIGV4dGVuZHMgUnVsZSB7XG5cdHRvU291cmNlKCkge1xuXHRcdHJldHVybiBcIlxcblwiO1xuXHR9XG59XG5cbi8vIENvbW1lbnQgcnVsZSAtLSBtYXRjaGVzIHRva2VucyBvZiB0eXBlIGBUb2tlbml6ZXIuQ29tbWVudGAuXG5SdWxlLkNvbW1lbnQgPSBjbGFzcyBjb21tZW50IGV4dGVuZHMgUnVsZSB7XG5cdC8vIENvbW1lbnRzIGFyZSBzcGVjaWFsIG5vZGVzIGluIG91ciB0b2tlbiBzdHJlYW0uXG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHRsZXQgdG9rZW4gPSB0b2tlbnNbc3RhcnRdO1xuXHRcdGlmICghKHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLkNvbW1lbnQpKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQ6IHRva2VuLFxuXHRcdFx0bmV4dFN0YXJ0OiBzdGFydCArIDFcblx0XHR9KTtcblx0fVxuXG5cdHRvU291cmNlKCkge1xuXHRcdHJldHVybiBgLy8ke3RoaXMubWF0Y2hlZC53aGl0ZXNwYWNlfSR7dGhpcy5tYXRjaGVkLmNvbW1lbnR9YDtcblx0fVxufVxuXG4vLyBQYXJzZXIgZXJyb3IgcmVwcmVzZW50YXRpb24gaW4gcGFyc2VyIG91dHB1dC5cblJ1bGUuU3RhdGVtZW50UGFyc2VFcnJvciA9IGNsYXNzIHBhcnNlX2Vycm9yIGV4dGVuZHMgUnVsZSB7XG5cdGNvbnN0cnVjdG9yKC4uLnByb3BzKSB7XG5cdFx0c3VwZXIoLi4ucHJvcHMpO1xuXHRcdGlmIChQYXJzZXIuV0FSTikgY29uc29sZS53YXJuKHRoaXMubWVzc2FnZSk7XG5cdH1cblxuXHRnZXQgbWVzc2FnZSgpIHtcblx0XHRpZiAodGhpcy5wYXJzZWQpIHtcblx0XHRcdHJldHVybiBcIkNBTlQgUEFSU0UgRU5USVJFIFNUQVRFTUVOVFxcblwiXG5cdFx0XHRcdCArIFwiUEFSU0VEICAgICAgOiBgXCIrIHRoaXMucGFyc2VkICsgXCJgXFxuXCJcblx0XHRcdFx0ICsgXCJDQU4nVCBQQVJTRSA6IGBcIisgdGhpcy51bnBhcnNlZCArIFwiYFwiO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJDQU4nVCBQQVJTRSBTVEFURU1FTlQ6IGBcIiArIHRoaXMudW5wYXJzZWQgKyBcImBcIjtcblx0fVxuXG5cdHRvU291cmNlKCkge1xuXHRcdHJldHVybiBcIi8vIFwiICsgdGhpcy5tZXNzYWdlLnNwbGl0KFwiXFxuXCIpLmpvaW4oXCJcXG4vLyBcIik7XG5cdH1cbn1cblxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvUnVsZS5qcyIsImltcG9ydCB7IGRlZmluZU1lbW9pemVkIH0gZnJvbSBcIi4vbWVtb2l6ZS5qc1wiO1xuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi9QYXJzZXIuanNcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuL1J1bGUuanNcIjtcbmltcG9ydCB7IGNsb25lQ2xhc3MgfSBmcm9tIFwiLi91dGlscy9jbGFzcy5qc1wiO1xuaW1wb3J0IGdsb2JhbCBmcm9tIFwiLi91dGlscy9nbG9iYWwuanNcIjtcblxuXG5cbi8vXG4vL1x0IyBQYXJzaW5nIGBydWxlU3ludGF4YCB0byBjcmVhdGUgcnVsZXMgYXV0b21hdGljYWxseS5cbi8vXG4vLyBUT0RPOlx0QmV0dGVyIG5hbWUgZm9yIGBydWxlU3ludGF4YFxuLy8gVE9ETzpcdFVzZSBrZXl3b3JkcyBpbiBzeW50YXggdG8gbWFrZSBhIHF1aWNrIHJlZ2V4LWJhc2VkIGB0ZXN0YCBmdW5jdGlvbiBmb3IgdGhlIGVudGlyZSBydWxlXG5cbi8vXG4vLyAjIyBncm91cDogcGFyc2luZyBzeW50YXhcbi8vXG5cbi8vVE9ET0NcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlUnVsZShzeW50YXgsIGNvbnN0cnVjdG9yKSB7XG4gIC8vIElmIHdlIGdvdCBhbiBhcnJheSBvZiBwb3NzaWJsZSBzeW50YXhlcy4uLlxuICBpZiAoQXJyYXkuaXNBcnJheShzeW50YXgpKSB7XG4gICAgLy8gcmVjdXJzaXZlbHkgcGFyc2UgZWFjaCBzeW50YXgsIHVzaW5nIGEgQ0xPTkUgb2YgdGhlIGNvbnN0cnVjdG9yXG4gICAgY29uc3QgcnVsZXMgPSBzeW50YXgubWFwKHN5bnRheCA9PiBwYXJzZVJ1bGUoc3ludGF4LCBjbG9uZUNsYXNzKGNvbnN0cnVjdG9yKSkgKTtcbiAgICAvLyByZXR1cm4gYW4gYWx0ZXJuYXRpdmVzIHdpdGggdGhlIGNvcnJlY3QgbmFtZVxuICAgIGNvbnN0IGFsdENsYXNzID0gY2xvbmVDbGFzcyhSdWxlLkFsdGVybmF0aXZlcywgY29uc3RydWN0b3IubmFtZSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGFsdENsYXNzLnByb3RvdHlwZSwgXCJydWxlc1wiLCB7IHZhbHVlOiBydWxlcyB9KTtcbiAgICByZXR1cm4gbmV3IGFsdENsYXNzKCk7XG4gIH07XG5cbiAgbGV0IHJ1bGVzID0gcGFyc2VTeW50YXgoc3ludGF4LCBbXSk7XG4gIGlmIChydWxlcy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYHBhcnNlci5kZWZpbmVSdWxlKCR7bmFtZXNbMF19LCAke3N5bnRheH0pOiBubyBydWxlIHByb2R1Y2VkYCk7XG4gIH1cblxuICAvLyBNYWtlIGFuIGluc3RhbmNlIG9mIHRoZSBydWxlIGFuZCBhZGQgcmVsZXZhbnQgcHJvcGVydGllcyB0byBpdHMgcHJvdG90eXBlIG5vbi1lbnVtZXJhYmx5XG4gIGlmIChjb25zdHJ1Y3Rvci5wcm90b3R5cGUgaW5zdGFuY2VvZiBSdWxlLktleXdvcmRzXG4gICB8fCBjb25zdHJ1Y3Rvci5wcm90b3R5cGUgaW5zdGFuY2VvZiBSdWxlLlN5bWJvbHNcbiAgIHx8IGNvbnN0cnVjdG9yLnByb3RvdHlwZSBpbnN0YW5jZW9mIFJ1bGUuTGlzdFxuICAgfHwgY29uc3RydWN0b3IucHJvdG90eXBlIGluc3RhbmNlb2YgUnVsZS5BbHRlcm5hdGl2ZXNcbiAgKSB7XG4gICAgZm9yIChsZXQgcHJvcGVydHkgaW4gcnVsZXNbMF0pIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3BlcnR5LCB7IHZhbHVlOiBydWxlc1swXVtwcm9wZXJ0eV0gfSk7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb25zdHJ1Y3Rvci5wcm90b3R5cGUsIFwicnVsZXNcIiwgeyB2YWx1ZTogcnVsZXMgfSk7XG4gIH1cblxuICByZXR1cm4gbmV3IGNvbnN0cnVjdG9yKCk7XG59XG5cbmZ1bmN0aW9uIHRva2VuaXNlUnVsZVN5bnRheChzeW50YXgpIHtcbiAgY29uc3QgU1lOVEFYX0VYUFJFU1NJT04gPSAvKD86W1xcd1xcLV0rfFxcXFxbXFxbXFwoXFx7XFwpXFx9XFxdXXxbXlxcc1xcd118XFx8KS9nO1xuICBsZXQgc3ludGF4U3RyZWFtID0gc3ludGF4Lm1hdGNoKFNZTlRBWF9FWFBSRVNTSU9OKTtcbiAgaWYgKCFzeW50YXhTdHJlYW0pIHRocm93IG5ldyBTeW50YXhFcnJvcihgQ2FuJ3QgdG9rZW5pemUgcGFyc2UgcnVsZSBzeW50YXggPj4ke3N5bnRheH08PGApO1xuICByZXR1cm4gc3ludGF4U3RyZWFtO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTeW50YXgoc3ludGF4LCBydWxlcyA9IFtdLCBzdGFydCA9IDApIHtcbiAgaWYgKHN5bnRheCA9PSBudWxsKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwicGFyc2VTeW50YXgoKTogYHN5bnRheGAgaXMgcmVxdWlyZWRcIik7XG4gIGNvbnN0IHN5bnRheFN0cmVhbSA9IHR5cGVvZiBzeW50YXggPT09IFwic3RyaW5nXCJcbiAgICA/IHRva2VuaXNlUnVsZVN5bnRheChzeW50YXgpXG4gICAgOiBzeW50YXg7XG5cbiAgbGV0IGxhc3RJbmRleCA9IHN5bnRheFN0cmVhbS5sZW5ndGg7XG4gIHdoaWxlIChzdGFydCA8IGxhc3RJbmRleCkge1xuICAgIGxldCBbIHJ1bGUsIGVuZCBdID0gcGFyc2VUb2tlbihzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgaWYgKHJ1bGUpIHtcbiAgICAgIGxldCBsYXN0ID0gcnVsZXNbcnVsZXMubGVuZ3RoLTFdO1xuICAgICAgLy8gSWYgdGhpcyBpcyBhIGBTeW1ib2xgIGFuZCBsYXN0IHdhcyBhIGBTeW1ib2xgLCBtZXJnZSB0b2dldGhlclxuICAgICAgaWYgKGxhc3QgJiYgbGFzdCBpbnN0YW5jZW9mIFJ1bGUuU3ltYm9scyAmJiBydWxlIGluc3RhbmNlb2YgUnVsZS5TeW1ib2xzKSB7XG4gICAgICAgIC8vIHJlbW92ZSB0aGUgbGFzdCBydWxlXG4gICAgICAgIHJ1bGVzLnBvcCgpO1xuICAgICAgICAvLyBhbmQgcmVwbGFjZSB3aXRoIGEgcnVsZSB0aGF0IG1lcmdlcyB0aGUga2V5d29yZHNcbiAgICAgICAgcnVsZS5saXRlcmFscyA9IGxhc3QubGl0ZXJhbHMuY29uY2F0KHJ1bGUubGl0ZXJhbHMpO1xuICAgICAgfVxuICAgICAgcnVsZXMucHVzaChydWxlKTtcbiAgICB9XG4gICAgc3RhcnQgPSBlbmQgKyAxO1xuICB9XG4gIHJldHVybiBydWxlcztcbn1cblxuY29uc3QgS0VZV09SRF9QQVRURVJOID0gL1tBLVphLXpdW1xcd18tXSovO1xuZnVuY3Rpb24gcGFyc2VUb2tlbihzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCkge1xuICBsZXQgc3ludGF4VG9rZW4gPSBzeW50YXhTdHJlYW1bc3RhcnRdO1xuXG4gIC8vIGlmIHdlIGdvdCBhIFwiXFxcXFwiICh3aGljaCBhbHNvIGhhcyB0byBnbyBpbnRvIHRoZSBzb3VyY2Ugc3RyaW5nIGFzIFwiXFxcXFwiKVxuICAvLyB0cmVhdCB0aGUgbmV4dCB0b2tlbiBhcyBhIGxpdGVyYWwgc3RyaW5nIHJhdGhlciB0aGFuIGFzIGEgc3BlY2lhbCBjaGFyYWN0ZXIuXG4gIGlmIChzeW50YXhUb2tlbiA9PT0gXCJcXFxcXCIpIHtcbiAgICByZXR1cm4gcGFyc2VTeW1ib2woc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQgKyAxKTtcbiAgfVxuXG4gIHN3aXRjaCAoc3ludGF4VG9rZW4pIHtcbiAgICBjYXNlIFwie1wiOlx0cmV0dXJuIHBhcnNlU3VicnVsZShzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgY2FzZSBcIihcIjpcdHJldHVybiBwYXJzZUFsdGVybmF0aXZlcyhzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgY2FzZSBcIltcIjpcdHJldHVybiBwYXJzZUxpc3Qoc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuICAgIGNhc2UgXCIqXCI6XG4gICAgY2FzZSBcIitcIjpcbiAgICBjYXNlIFwiP1wiOlx0cmV0dXJuIHBhcnNlUmVwZWF0KHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcblxuICAgIC8vIHRoZSBmb2xsb3dpbmcgc2hvdWxkIEFMV0FZUyBiZSBjb25zdW1lZCBieSB0aGUgYWJvdmVcbiAgICBjYXNlIFwifVwiOlxuICAgIGNhc2UgXCIpXCI6XG4gICAgY2FzZSBcIl1cIjpcbiAgICBjYXNlIFwifFwiOlxuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkICR7c3ludGF4VG9rZW59IGZvdW5kIGFzIGl0ZW0gJHtzdGFydH0gb2YgJHtzeW50YXhTdHJlYW19YCk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgaWYgKHN5bnRheFRva2VuLm1hdGNoKEtFWVdPUkRfUEFUVEVSTikpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlS2V5d29yZChzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlU3ltYm9sKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICAgIH1cbiAgfVxufVxuXG5cbi8vIE1hdGNoIGBrZXl3b3JkYCBpbiBzeW50YXggcnVsZXMuXG4vLyBJZiBtb3JlIHRoYW4gb25lIGtleXdvcmQgYXBwZWFycyBpbiBhIHJvdywgY29tYmluZXMgdGhlbSBpbnRvIGEgc2luZ2xlIGBLZXl3b3JkYCBvYmplY3QuXG4vLyBUaGlzIGlzIHByZXR0eSBzYWZlLCB1bmxlc3MgeW91IGhhdmUgYW4gb3B0aW9uYWwga2V5d29yZCBsaWtlXG4vL1x0XHRgdGhlIHtpZGVudGlmaWVyfSBvZiB0aGU/IHtleHByZXNzaW9ufWBcbi8vIGluIHdoaWNoIGNhc2UgeW91IGNhbiBwdXQgdGhlIG9wdGlvbmFsIGtleXdvcmQgaW4gcGFyZW5zXG4vL1x0XHRgdGhlIHtpZGVudGlmaWVyfSBvZiAodGhlPykge2V4cHJlc3Npb259YFxuLy9cbi8vIFJldHVybnMgYFsgcnVsZSwgZW5kIF1gXG4vLyBUaHJvd3MgaWYgaW52YWxpZC5cbmZ1bmN0aW9uIHBhcnNlS2V5d29yZChzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCwgY29uc3RydWN0b3IgPSBSdWxlLktleXdvcmRzKSB7XG4gIGxldCBsaXRlcmFscyA9IFtdLCBlbmQ7XG4gIC8vIGVhdCBrZXl3b3JkcyB3aGlsZSB0aGV5IGxhc3RcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgc3ludGF4U3RyZWFtLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IG5leHQgPSBzeW50YXhTdHJlYW1baV07XG4gICAgaWYgKHR5cGVvZiBuZXh0ID09PSBcInN0cmluZ1wiICYmIG5leHQubWF0Y2goS0VZV09SRF9QQVRURVJOKSkge1xuICAgICAgbGl0ZXJhbHMucHVzaChuZXh0KTtcbiAgICAgIGVuZCA9IGk7XG4gICAgfVxuICAgIGVsc2UgYnJlYWs7XG4gIH1cblxuICBsZXQgcnVsZSA9IG5ldyBjb25zdHJ1Y3Rvcih7IGxpdGVyYWxzIH0pO1xuICByZXR1cm4gWyBydWxlLCBlbmQgXTtcbn1cblxuLy8gTWF0Y2ggYGtleXdvcmRgIGluIHN5bnRheCBydWxlcy5cbi8vIFJldHVybnMgYFsgcnVsZSwgZW5kIF1gXG4vLyBUaHJvd3MgaWYgaW52YWxpZC5cbmZ1bmN0aW9uIHBhcnNlU3ltYm9sKHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwLCBjb25zdHJ1Y3RvciA9IFJ1bGUuU3ltYm9scykge1xuICBsZXQgc3RyaW5nID0gc3ludGF4U3RyZWFtW3N0YXJ0XTtcbiAgaWYgKCFjb25zdHJ1Y3RvcikgY29uc3RydWN0b3IgPSBSdWxlLlN5bWJvbHM7XG5cbiAgLy8gSWYgc3RyaW5nIHN0YXJ0cyB3aXRoIGBcXFxcYCwgaXQncyBhbiBlc2NhcGVkIGxpdGVyYWwgKGVnOiBgXFxbYCBuZWVkcyB0byBpbnB1dCBhcyBgXFxcXFtgKS5cbiAgbGV0IGlzRXNjYXBlZCA9IHN0cmluZy5zdGFydHNXaXRoKFwiXFxcXFwiKTtcbiAgbGV0IGxpdGVyYWxzID0gaXNFc2NhcGVkID8gc3RyaW5nLnN1YnN0cigxKSA6IHN0cmluZztcblxuICBsZXQgcnVsZSA9IG5ldyBjb25zdHJ1Y3Rvcih7IGxpdGVyYWxzIH0pO1xuXG4gIGlmIChpc0VzY2FwZWQpIHtcbiAgICBydWxlLnRvU3ludGF4ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYFxcXFwke2xpdGVyYWxzfSR7dGhpcy5vcHRpb25hbCA/ICc/JyA6ICcnfWA7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFsgcnVsZSwgc3RhcnQgXTtcbn1cblxuXG4vLyBNYXRjaCBncm91cGluZyBleHByZXNzaW9uIGAoLi4ufC4uLilgIGluIHN5bnRheCBydWxlcy5cbi8vIFJldHVybnMgYFsgcnVsZSwgZW5kIF1gXG4vLyBZb3UgY2FuIHNwZWNpZnkgYW4gZXhwbGljaXQgYHJ1bGUuYXJndW1lbnRgIHdpdGg6ICBgKHNvbWVhcmc6Li4uKWBcbi8vIFlvdSBjYW4gc3BlY2lmeSB0aGF0IHRoZSByZXN1bHRzIHNob3VsZCBiZSBgcHJvbW90ZWRgIHRvIGVuY2xvc2luZyBydWxlIHdpdGg6IGAoPzouLi4pYFxuLy9cbi8vIE5PVEU6IG5lc3RlZCBwYXJlbnMgbWF5IG5vdCBoYXZlIGFsdGVybmF0aXZlcy4uLiA6LSggICBgKGF8KGJ8YykpYCB3b24ndCB3b3JrPz8/XG5mdW5jdGlvbiBwYXJzZUFsdGVybmF0aXZlcyhzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCkge1xuICBsZXQgeyBlbmQsIHNsaWNlIH0gPSBQYXJzZXIuZmluZE5lc3RlZFRva2VucyhzeW50YXhTdHJlYW0sIFwiKFwiLCBcIilcIiwgc3RhcnQpO1xuXG4gIC8vIHB1bGwgb3V0IGV4cGxpY2l0IFwicHJvbW90ZVwiIGZsYWc6IGA/OmBcbiAgbGV0IHByb21vdGUgPSAoc2xpY2VbMF0gPT09IFwiP1wiICYmIHNsaWNlWzFdID09PSBcIjpcIik7XG4gIGlmIChwcm9tb3RlKSB7XG4gICAgc2xpY2UgPSBzbGljZS5zbGljZSgyKTtcbiAgfVxuXG4gIC8vIHB1bGwgb3V0IGV4cGxpY2l0IGFyZ3VtZW50IG5hbWVcbiAgbGV0IGFyZ3VtZW50O1xuICBpZiAoc2xpY2UubGVuZ3RoID4gMiAmJiBzbGljZVsxXSA9PT0gXCI6XCIpIHtcbiAgICBhcmd1bWVudCA9IHNsaWNlWzBdO1xuICAgIHNsaWNlID0gc2xpY2Uuc2xpY2UoMik7XG4gIH1cblxuICAvLyBzcGxpdCBpbnRvIGdyb3VwcywgaW5jbHVkaW5nIG5lc3RlZCBwYXJlbnNcbiAgbGV0IGFsdGVybmF0aXZlcyA9XG4gICAgZ3JvdXBBbHRlcm5hdGl2ZXMoc2xpY2UpXG4gICAgLm1hcChmdW5jdGlvbihncm91cCkge1xuICAgICAgbGV0IHJlc3VsdHMgPSBwYXJzZVN5bnRheChncm91cCwgW10pO1xuICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiByZXN1bHRzWzBdO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgUnVsZS5TZXF1ZW5jZSh7IHJ1bGVzOiByZXN1bHRzIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIGxldCBydWxlID0gYWx0ZXJuYXRpdmVzLmxlbmd0aCA9PT0gMSA/IGFsdGVybmF0aXZlc1swXSA6IG5ldyBSdWxlLkFsdGVybmF0aXZlcyh7IHJ1bGVzOiBhbHRlcm5hdGl2ZXMgfSk7XG4gIGlmIChhcmd1bWVudCkgcnVsZS5hcmd1bWVudCA9IGFyZ3VtZW50O1xuICBpZiAocHJvbW90ZSkgcnVsZS5wcm9tb3RlID0gdHJ1ZTtcbiAgcmV0dXJuIFsgcnVsZSwgZW5kIF07XG59XG5cbmZ1bmN0aW9uIGdyb3VwQWx0ZXJuYXRpdmVzKHRva2Vucykge1xuICBsZXQgYWx0ZXJuYXRpdmVzID0gW107XG4gIGxldCBjdXJyZW50ID0gW107XG4gIGZvciAobGV0IGkgPSAwLCB0b2tlbjsgdG9rZW4gPSB0b2tlbnNbaV07IGkrKykge1xuICAgIC8vIGhhbmRsZSBhbHRlcm5hdGUgbWFya2VyXG4gICAgaWYgKHRva2VuID09PSBcInxcIikge1xuICAgICAgYWx0ZXJuYXRpdmVzLnB1c2goY3VycmVudCk7XG4gICAgICBjdXJyZW50ID0gW107XG4gICAgfVxuICAgIC8vIGhhbmRsZSBuZXN0ZWQgcGFyZW5zXG4gICAgZWxzZSBpZiAodG9rZW4gPT09IFwiKFwiKSB7XG4gICAgICBsZXQgeyBlbmQgfSA9IFBhcnNlci5maW5kTmVzdGVkVG9rZW5zKHRva2VucywgXCIoXCIsIFwiKVwiLCBpKTtcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50LmNvbmNhdCh0b2tlbnMuc2xpY2UoaSwgZW5kICsgMSkpO1xuICAgICAgaSA9IGVuZDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjdXJyZW50LnB1c2godG9rZW4pO1xuICAgIH1cbiAgfVxuICBpZiAoY3VycmVudC5sZW5ndGgpIGFsdGVybmF0aXZlcy5wdXNoKGN1cnJlbnQpO1xuICByZXR1cm4gYWx0ZXJuYXRpdmVzO1xufVxuXG4vLyBNYXRjaCByZXBlYXQgaW5kaWNhdG9yIGA/YCwgYCtgIG9yIGAqYCBieSBhdHRhY2hpbmcgaXQgdG8gdGhlIHByZXZpb3VzIHJ1bGUuXG5mdW5jdGlvbiBwYXJzZVJlcGVhdChzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCkge1xuICBsZXQgc3ltYm9sID0gc3ludGF4U3RyZWFtW3N0YXJ0XTtcbiAgbGV0IHJ1bGUgPSBydWxlc1tydWxlcy5sZW5ndGggLSAxXTtcbiAgaWYgKCFydWxlKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYENhbid0IGF0dGFjaCByZXBlYXQgc3ltYm9sICR7c3ltYm9sfSB0byBlbXB0eSBydWxlIWApO1xuXG4gIC8vIFRyYW5zZm9ybSBsYXN0IHJ1bGUgaW50byBhIHJlcGVhdCBmb3IgYCpgIGFuZCBgK2AuXG4gIGlmIChzeW1ib2wgPT09IFwiKlwiIHx8IHN5bWJvbCA9PT0gXCIrXCIpIHtcbiAgICBsZXQgYXJndW1lbnQgPSBydWxlLmFyZ3VtZW50O1xuICAgIHJ1bGUgPSBuZXcgUnVsZS5SZXBlYXQoeyByZXBlYXQ6IHJ1bGUgfSk7XG4gICAgaWYgKGFyZ3VtZW50KSBydWxlLmFyZ3VtZW50ID0gYXJndW1lbnQ7XG4gICAgLy8gcHVzaCBpbnRvIHJ1bGUgc3RhY2sgaW4gcGxhY2Ugb2Ygb2xkIHJ1bGVcbiAgICBydWxlc1tydWxlcy5sZW5ndGggLSAxXSA9IHJ1bGU7XG4gIH1cblxuICAvLyBSdWxlIGlzIG9wdGlvbmFsIGZvciBgP2AgYW5kIGAqYC5cbiAgaWYgKHN5bWJvbCA9PT0gXCI/XCIgfHwgc3ltYm9sID09PSBcIipcIikge1xuICAgIHJ1bGUub3B0aW9uYWwgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIFsgdW5kZWZpbmVkLCBzdGFydCBdXG59XG5cbi8vIE1hdGNoIGB7PHN1YnJ1bGU+fWAgaW4gc3ludGF4IHJ1bGVzLlxuLy8gUmV0dXJucyBgWyBydWxlLCBlbmQgXWBcbi8vIFRocm93cyBpZiBpbnZhbGlkLlxuZnVuY3Rpb24gcGFyc2VTdWJydWxlKHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwKSB7XG4gIGxldCBtYXRjaCA9IFBhcnNlci5maW5kTmVzdGVkVG9rZW5zKHN5bnRheFN0cmVhbSwgXCJ7XCIsIFwifVwiLCBzdGFydCk7XG4gIGxldCBhcmd1bWVudDtcbiAgaWYgKG1hdGNoLnNsaWNlLmxlbmd0aCA9PT0gMyAmJiBtYXRjaC5zbGljZVsxXSA9PT0gXCI6XCIpIHtcbiAgICBhcmd1bWVudCA9IG1hdGNoLnNsaWNlWzBdO1xuICAgIG1hdGNoLnNsaWNlID0gbWF0Y2guc2xpY2Uuc2xpY2UoMik7XG4gIH1cbiAgaWYgKG1hdGNoLnNsaWNlLmxlbmd0aCA+IDEpIHRocm93IG5ldyBTeW50YXhFcnJvcihgQ2FuJ3QgcHJvY2VzcyBydWxlcyB3aXRoIG1vcmUgdGhhbiBvbmUgcnVsZSBuYW1lOiB7JHttYXRjaC5zbGljZS5qb2luKFwiXCIpfX1gKTtcblxuICBsZXQgcGFyYW1zID0geyBzdWJydWxlOiBtYXRjaC5zbGljZVswXSB9O1xuXG4gIC8vIHNlZSBpZiB0aGVyZSdzIGEgYG5vdGAgcnVsZSBpbiB0aGVyZVxuICBsZXQgYmFuZ1Bvc2l0aW9uID0gcGFyYW1zLnN1YnJ1bGUuaW5kZXhPZihcIiFcIik7XG4gIGlmIChiYW5nUG9zaXRpb24gIT09IC0xKSB7XG4gICAgcGFyYW1zLm5vdCA9IHBhcmFtcy5zdWJydWxlLnN1YnN0cihiYW5nUG9zaXRpb24gKyAxKTtcbiAgICBwYXJhbXMuc3VicnVsZSA9IHBhcmFtcy5zdWJydWxlLnN1YnN0cigwLCBiYW5nUG9zaXRpb24pO1xuICB9XG5cbiAgbGV0IHJ1bGUgPSBuZXcgUnVsZS5TdWJydWxlKHBhcmFtcyk7XG4gIGlmIChhcmd1bWVudCkgcnVsZS5hcmd1bWVudCA9IGFyZ3VtZW50O1xuICByZXR1cm4gWyBydWxlLCBtYXRjaC5lbmQgXTtcbn1cblxuLy8gTWF0Y2ggbGlzdCBleHByZXNzaW9uIGBbPGl0ZW0+PGRlbGltaXRlcj5dYCBvciBgWzxhcmd1bWVudD46PGl0ZW0+PGRlbGltaXRlcj5dYCBpbiBzeW50YXggcnVsZXMuXG4vLyBSZXR1cm5zIGBbIHJ1bGUsIGVuZCBdYFxuLy8gVGhyb3dzIGlmIGludmFsaWQuXG5mdW5jdGlvbiBwYXJzZUxpc3Qoc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDAsIGNvbnN0cnVjdG9yID0gUnVsZS5MaXN0KSB7XG4gIGxldCB7IGVuZCwgc2xpY2UgfSA9IFBhcnNlci5maW5kTmVzdGVkVG9rZW5zKHN5bnRheFN0cmVhbSwgXCJbXCIsIFwiXVwiLCBzdGFydCk7XG5cbiAgLy8gZ2V0IGFyZ3VtZW50IGlmIHN1cHBsaWVkXG4gIGxldCBhcmd1bWVudDtcbiAgaWYgKHNsaWNlLmxlbmd0aCA+IDIgJiYgc2xpY2VbMV0gPT09IFwiOlwiKSB7XG4gICAgYXJndW1lbnQgPSBzbGljZVswXTtcbiAgICBzbGljZSA9IHNsaWNlLnNsaWNlKDIpO1xuICB9XG5cbiAgbGV0IHJlc3VsdHMgPSBwYXJzZVN5bnRheChzbGljZSwgW10pO1xuICBpZiAocmVzdWx0cy5sZW5ndGggIT09IDIpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFVuZXhwZWN0ZWQgc3R1ZmYgYXQgZW5kIG9mIGxpc3Q6IFske3NsaWNlLmpvaW4oXCIgXCIpfV1gKTtcbiAgfVxuICBsZXQgWyBpdGVtLCBkZWxpbWl0ZXIgXSA9IHJlc3VsdHM7XG5cbiAgbGV0IHJ1bGUgPSBuZXcgY29uc3RydWN0b3IoeyBpdGVtLCBkZWxpbWl0ZXIgfSk7XG4gIGlmIChhcmd1bWVudCkgcnVsZS5hcmd1bWVudCA9IGFyZ3VtZW50O1xuICByZXR1cm4gWyBydWxlLCBlbmQgXTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9SdWxlU3ludGF4LmpzIiwiaW1wb3J0IHsgZ2V0VGFicyB9IGZyb20gXCIuL3V0aWxzL3N0cmluZ1wiO1xuXG4vLyBHUlJSLi4uIG5vZGUgZG9lc24ndCBpbmNsdWRlIHRoaXM/Pz9cbi8vIENIRUNLIERJRkZFUkVOVCBOT0RFIFZFUlNJT05TLi4uXG5pZiAoIShBcnJheS5wcm90b3R5cGUuaW5jbHVkZXMpKSB7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsIFwiaW5jbHVkZXNcIiwge1xuXHRcdHZhbHVlOiBmdW5jdGlvbih2YWx1ZSwgc3RhcnQpIHtcblx0XHRcdGxldCBpbmRleCA9IHRoaXMuaW5kZXhPZih2YWx1ZSwgc3RhcnQpO1xuXHRcdFx0cmV0dXJuIChpbmRleCAhPT0gLTEpO1xuXHRcdH1cblx0fSk7XG59XG5cblxuXG4vLyBgd2hpdGVzcGFjZWAgY2xhc3MgZm9yIG5vcm1hbCAobm9uLWluZGVudCwgbm9uLW5ld2xpbmUpIHdoaXRlc3BhY2UuXG5jbGFzcyB3aGl0ZXNwYWNlIHtcblx0Y29uc3RydWN0b3Iod2hpdGVzcGFjZSkge1xuXHRcdHRoaXMud2hpdGVzcGFjZSA9IHdoaXRlc3BhY2U7XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIFwibGVuZ3RoXCIgb2YgdGhpcyB3aGl0ZXNwYWNlLCBlZyBmb3IgYW4gaW5kZW50LlxuXHRnZXQgbGVuZ3RoKCkge1xuXHRcdHJldHVybiB0aGlzLndoaXRlc3BhY2UubGVuZ3RoO1xuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIHRoaXMud2hpdGVzcGFjZTtcblx0fVxufVxuXG5cbi8vIGBpbmRlbnRgIGNsYXNzLlxuY2xhc3MgaW5kZW50IGV4dGVuZHMgd2hpdGVzcGFjZSB7fVxuXG5cbi8vIE5ld2xpbmUgc2luZ2xldG9uLlxuY2xhc3MgbmV3bGluZSBleHRlbmRzIHdoaXRlc3BhY2Uge31cblxuXG4vL1xuLy9cdCMgVG9rZW5pemVyXG4vL1x0LSBgLnRva2VuaXplKClgIFx0XHRCcmVha3MgdXAgbG9uZyBzdHJpbmcgaW50byB0b2tlbnMsIGluY2x1ZGluZyBuZXdsaW5lcywgSlNYIGV4cHJlc3Npb25zLCBldGMuXG4vL1x0LSBgLnRva2VuaXplTGluZXMoKWAgXHRUYWtlcyB0aGUgYWJvdmUgYW5kIGJyZWFrcyBpdCBpbnRvIGFuIGFycmF5IG9mIGFycmF5cyBmb3IgZWFjaCBsaW5lLlxuLy9cbi8vIFRPRE86IGVycm9yIGNoZWNraW5nIC8gcmVwb3J0aW5nLCBlc3BlY2lhbGx5IGluIEpTWCBleHByZXNzaW9ucy5cbi8vIFRPRE86IGhhdmUgbm9ybWFsIGB0b2tlbml6ZWAgc3RpY2sgd2hpdGVzcGFjZSBlbGVtZW50cyBpbiB0aGUgc3RyZWFtLCB0aGVuIGB0b2tlbml6ZUxpbmVzKClgIHRha2VzIHRoZW0gb3V0P1xuY29uc3QgVG9rZW5pemVyID0ge1xuXG5cdC8vIFNob3VsZCB3ZSB3YXJuIGFib3V0IGFub21hbG91cyBjb25kaXRpb25zP1xuXHRXQVJOIDogZmFsc2UsXG5cblx0Ly8gV2hpdGVzcGFjZSBjb25zdHJ1Y3Rvci5cblx0V2hpdGVzcGFjZTogd2hpdGVzcGFjZSxcblxuXHQvLyBJbmRlbnQgY29uc3RydWN0b3Jcblx0SW5kZW50OiBpbmRlbnQsXG5cblx0Ly8gTkVXTElORSBzaW5nbGV0b24uXG5cdE5FV0xJTkU6IG5ldyBuZXdsaW5lKFwiXFxuXCIpLFxuXG5cdC8vIFRva2VuaXplIHRleHQgYmV0d2VlbiBgc3RhcnRgIGFuZCBgZW5kYCBpbnRvIGFuIGFycmF5IG9mIGByZXN1bHRzYCwgYW4gYXJyYXkgb2Y6XG5cdC8vXHQtIGBUb2tlbml6ZXIuTkVXTElORWAgZm9yIGEgbmV3bGluZSBzeW1ib2xcblx0Ly9cdC0gc3RyaW5ncyBmb3Iga2V5d29yZHMvc3ltYm9sc1xuXHQvL1x0LSBudW1iZXJzIGZvciBudW1iZXIgbGl0ZXJhbHNcblx0Ly9cdC0gYHsgaW5kZW50OiBudW1iZXIgfWAgZm9yIGluZGVudCBhdCBzdGFydCBvZiBsaW5lXG5cdC8vXHQtIGB7IHR5cGU6IFwidGV4dFwiLCBsaXRlcmFsOiBcIidhYmMnXCIsIHRleHQ6IFwiYWJjXCIgfVxuXHQvL1x0LSBgeyB0eXBlOiBcImluZGVudFwiLCBsZXZlbDogNyB9YFxuXHQvL1x0LSBgeyB0eXBlOiBcImNvbW1lbnRcIiwgY29tbWVudDogXCJzdHJpbmdcIiwgY29tbWVudFN5bWJvbCwgd2hpdGVzcGFjZSB9YFxuLy9URVNUTUVcblx0dG9rZW5pemUodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0Ly8gcXVpY2sgcmV0dXJuIG91dCBvZiByYW5nZSBvciBvbmx5IHdoaXRlc3BhY2Vcblx0XHRpZiAoc3RhcnQgPj0gZW5kIHx8ICF0ZXh0LnRyaW0oKSkgcmV0dXJuIFtdO1xuXG5cdFx0bGV0IHRva2VucyA9IFtdO1xuXHRcdC8vIFByb2Nlc3Mgb3VyIHRvcC1sZXZlbCBydWxlcy5cblx0XHRsZXQgW3Jlc3VsdHMsIG5leHRTdGFydF0gPSB0aGlzLmVhdFRva2Vucyh0aGlzLm1hdGNoVG9wVG9rZW5zLCB0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRpZiAocmVzdWx0cykge1xuXHRcdFx0dG9rZW5zID0gdG9rZW5zLmNvbmNhdChyZXN1bHRzKTtcblx0XHRcdHN0YXJ0ID0gbmV4dFN0YXJ0O1xuXHRcdH1cblx0XHRpZiAoc3RhcnQgIT09IGVuZCkge1xuXHRcdFx0aWYgKFRva2VuaXplci5XQVJOKSBjb25zb2xlLndhcm4oXCJ0b2tlbml6ZSgpOiBkaWRuJ3QgY29uc3VtZTogYFwiLCB0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpICsgXCJgXCIpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHRzO1xuXHR9LFxuXG5cdC8vIFJlcGVhdGVkbHkgZXhlY3V0ZSBhIGBtZXRob2RgIChib3VuZCB0byBgdGhpcykgd2hpY2ggcmV0dXJucyBhIGBbcmVzdWx0LCBuZXh0U3RhcnRdYCBvciBgdW5kZWZpbmVkYC5cblx0Ly8gUGxhY2VzIG1hdGNoZWQgcmVzdWx0cyB0b2dldGhlciBpbiBgcmVzdWx0c2AgYXJyYXkgYW5kIHJldHVybnMgYFtyZXN1bHRzLCBuZXh0U3RhcnRdYCBmb3IgdGhlIGVudGlyZSBzZXQuXG5cdC8vIFN0b3BzIGlmIGBtZXRob2RgIGRvZXNuJ3QgcmV0dXJuIGFueXRoaW5nLCBvciBpZiBjYWxsaW5nIGBtZXRob2RgIGlzIHVucHJvZHVjdGl2ZS5cbi8vVEVTVE1FXG5cdGVhdFRva2VucyhtZXRob2QsIHRleHQsIHN0YXJ0ID0gMCwgZW5kLCByZXN1bHRzID0gW10pIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIHByb2Nlc3MgcnVsZXMgcmVwZWF0ZWRseSB1bnRpbCB3ZSBnZXQgdG8gdGhlIGVuZFxuXHRcdHdoaWxlIChzdGFydCA8IGVuZCkge1xuXHRcdFx0bGV0IHJlc3VsdCA9IG1ldGhvZC5jYWxsKHRoaXMsIHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdFx0aWYgKCFyZXN1bHQpIGJyZWFrO1xuXG5cdFx0XHRsZXQgW3Rva2VucywgbmV4dFN0YXJ0XSA9IHJlc3VsdDtcblx0XHRcdC8vIEJhaWwgaWYgd2UgZGlkbid0IGdldCBhIHByb2R1Y3RpdmUgcnVsZSFcblx0XHRcdGlmIChzdGFydCA9PT0gbmV4dFN0YXJ0KSBicmVhaztcblxuXHRcdFx0Ly8gaGFuZGxlIG5ld1Jlc3VsdHMgYXMgYW4gYXJyYXkgb3Igc2luZ2xlIG9iamVjdC5cblx0XHRcdGlmICh0b2tlbnMgIT09IHVuZGVmaW5lZCkgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHRva2Vucyk7XG5cdFx0XHRzdGFydCA9IG5leHRTdGFydDtcblx0XHR9XG5cdFx0cmV0dXJuIFtyZXN1bHRzLCBzdGFydF07XG5cdH0sXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgdG9wLWxldmVsIHRva2VuIGF0IGB0ZXh0W3N0YXJ0XWAuXG4vL1RFU1RNRVxuXHRtYXRjaFRvcFRva2Vucyh0ZXh0LCBzdGFydCwgZW5kKSB7XG5cdFx0cmV0dXJuXHR0aGlzLm1hdGNoV2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0IHx8IHRoaXMubWF0Y2hXb3JkKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaE51bWJlcih0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0IHx8IHRoaXMubWF0Y2hOZXdsaW5lKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaEpTWEVsZW1lbnQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoVGV4dCh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0IHx8IHRoaXMubWF0Y2hDb21tZW50KHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaFN5bWJvbCh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdDtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgU3ltYm9sIGNoYXJhY3RlclxuXHQvL1xuXG5cdC8vIE1hdGNoIHRoZSBzaW5nbGUgXCJzeW1ib2xcIiBjaGFyYWN0ZXIgYXQgYHRleHRbc3RhcnRdYC5cblx0Ly8gTk9URTogVGhpcyBkb2VzIG5vdCBkbyBhbnkgY2hlY2tpbmcsIGl0IGp1c3QgYmxpbmRseSB1c2VzIHRoZSBjaGFyYWN0ZXIgaW4gcXVlc3Rpb24uXG5cdC8vXHRcdCBZb3Ugc2hvdWxkIG1ha2Ugc3VyZSBhbGwgb3RoZXIgcG9zc2libGUgcnVsZXMgaGF2ZSBiZWVuIGV4aGF1c3RlZCBmaXJzdC5cblx0bWF0Y2hTeW1ib2wodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiBbdGV4dFtzdGFydF0sIHN0YXJ0ICsgMV1cblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgV2hpdGVzcGFjZVxuXHQvL1xuXG5cdC8vIFJldHVybiB0aGUgZmlyc3QgY2hhciBwb3NpdGlvbiBhZnRlciBgc3RhcnRgIHdoaWNoIGlzIE5PVCBhIHdoaXRlc3BhY2UgY2hhciAoc3BhY2Ugb3IgdGFiIG9ubHkpLlxuXHQvLyBJZiBgdGV4dFtzdGFydF1gIGlzIG5vdCB3aGl0ZXNwYWNlLCByZXR1cm5zIGBzdGFydGAsXG5cdC8vXHRzbyB5b3UgY2FuIGNhbGwgdGhpcyBhdCBhbnkgdGltZSB0byBza2lwIHdoaXRlc3BhY2UgaW4gdGhlIG91dHB1dC5cblx0ZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gZW5kO1xuXG5cdFx0bGV0IHdoaXRlU3BhY2VFbmQgPSBzdGFydDtcblx0XHR3aGlsZSAod2hpdGVTcGFjZUVuZCA8IGVuZCAmJiAodGV4dFt3aGl0ZVNwYWNlRW5kXSA9PT0gXCIgXCIgfHwgdGV4dFt3aGl0ZVNwYWNlRW5kXSA9PT0gXCJcXHRcIikpIHtcblx0XHRcdHdoaXRlU3BhY2VFbmQrKztcblx0XHR9XG5cdFx0cmV0dXJuIHdoaXRlU3BhY2VFbmQ7XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIFdoaXRlc3BhY2Vcblx0Ly9cdE5PVEU6IFdoaXRlc3BhY2UgYXQgdGhlIGJlZ2lubmluZyBvZiBgdGV4dGAgb3IgdGhlIGJlZ2lubmluZyBvZiBhIGxpbmVcblx0Ly9cdFx0ICBpcyBjb25zaWRlcmVkIGFuIFwiaW5kZW50XCIgYW5kIHdpbGwgaGF2ZSBgLmlzSW5kZW50ID09PSB0cnVlYC5cblx0Ly9cblxuXHQvLyBDb252ZXJ0IGEgcnVuIG9mIHNwYWNlcyBhbmQvb3IgdGFicyBpbnRvIGEgYFRva2VuaXplci5XaGl0ZXNwYWNlYC5cblx0bWF0Y2hXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgd2hpdGVzcGFjZUVuZCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHQvLyBmb3JnZXQgaXQgaWYgbm8gZm9yd2FyZCBtb3Rpb25cblx0XHRpZiAod2hpdGVzcGFjZUVuZCA9PT0gc3RhcnQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgd2hpdGVzcGFjZSA9IHRleHQuc2xpY2Uoc3RhcnQsIHdoaXRlc3BhY2VFbmQpO1xuXHRcdGxldCB0b2tlbjtcblx0XHRpZiAoc3RhcnQgPT09IDAgfHwgdGV4dFtzdGFydC0xXSA9PT0gXCJcXG5cIilcblx0XHRcdHRva2VuID0gbmV3IFRva2VuaXplci5JbmRlbnQod2hpdGVzcGFjZSk7XG5cdFx0ZWxzZVxuXHRcdFx0dG9rZW4gPSBuZXcgVG9rZW5pemVyLldoaXRlc3BhY2Uod2hpdGVzcGFjZSk7XG5cblx0XHRyZXR1cm4gW3Rva2VuLCB3aGl0ZXNwYWNlRW5kXTtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgTmV3bGluZVxuXHQvL1xuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIG5ld2xpbmUgY2hhcmFjdGVyIGF0IGB0ZXh0W3N0YXJ0XWAuXG5cdC8vIFJldHVybnMgYFtUb2tlbml6ZXIuTkVXTElORSwgbmV4dFN0YXJ0XWAgb24gbWF0Y2guXG5cdC8vIE90aGVyd2lzZSByZXR1cm5zIGB1bmRlZmluZWRgLlxuXHRtYXRjaE5ld2xpbmUodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCB8fCB0ZXh0W3N0YXJ0XSAhPT0gXCJcXG5cIikgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiBbVG9rZW5pemVyLk5FV0xJTkUsIHN0YXJ0ICsgMV07XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIFdvcmRcblx0Ly9cblxuXHQvLyBNYXRjaCBhIHNpbmdsZSBgd29yZGAgaW4gYHRleHRgIGF0IGNoYXJhY3RlciBgc3RhcnRgLlxuXHQvLyBSZXR1cm5zIGBbd29yZCwgd29yZEVuZF1gLlxuXHQvLyBSZXR1cm5zIGFuIGVtcHR5IGFycmF5IGlmIGNvdWxkbid0IG1hdGNoIGEgd29yZC5cblx0V09SRF9TVEFSVDogL1tBLVphLXpdLyxcblx0V09SRF9DSEFSIDogL15bXFx3Xy1dLyxcblx0bWF0Y2hXb3JkKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRpZiAoIXRoaXMuV09SRF9TVEFSVC50ZXN0KHRleHRbc3RhcnRdKSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB3b3JkRW5kID0gc3RhcnQgKyAxO1xuXHRcdHdoaWxlICh3b3JkRW5kIDwgZW5kICYmIHRoaXMuV09SRF9DSEFSLnRlc3QodGV4dFt3b3JkRW5kXSkpIHtcblx0XHRcdHdvcmRFbmQrKztcblx0XHR9XG5cdFx0aWYgKHdvcmRFbmQgPT09IHN0YXJ0KSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHdvcmQgPSB0ZXh0LnNsaWNlKHN0YXJ0LCB3b3JkRW5kKTtcblx0XHRyZXR1cm4gW3dvcmQsIHdvcmRFbmRdO1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBOdW1iZXJzXG5cdC8vXG5cblx0Ly8gRWF0IGEgc2luZ2xlIG51bWJlci5cblx0Ly8gUmV0dXJucyBhIGBOdW1iZXJgIGlmIG1hdGNoZWQuXG5cdE5VTUJFUl9TVEFSVDogL1swLTktLl0vLFxuXHROVU1CRVIgOiAvXi0/KFswLTldKlxcLik/WzAtOV0rLyxcblx0bWF0Y2hOdW1iZXIodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGlmICghdGhpcy5OVU1CRVJfU1RBUlQudGVzdCh0ZXh0W3N0YXJ0XSkpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbnVtYmVyTWF0Y2ggPSB0aGlzLm1hdGNoRXhwcmVzc2lvbkF0SGVhZCh0aGlzLk5VTUJFUiwgdGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0aWYgKCFudW1iZXJNYXRjaCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBudW1iZXJTdHIgPSBudW1iZXJNYXRjaFswXTtcblx0XHRsZXQgbnVtYmVyID0gcGFyc2VGbG9hdChudW1iZXJTdHIsIDEwKTtcblx0XHRyZXR1cm4gW251bWJlciwgc3RhcnQgKyBudW1iZXJTdHIubGVuZ3RoXTtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgVGV4dCBsaXRlcmFsXG5cdC8vXG5cblx0Ly8gRWF0IGEgdGV4dCBsaXRlcmFsIChzdGFydHMvZW5kcyB3aXRoIGAnYCBvciBgXCJgKS5cblx0Ly8gUmV0dXJucyBhIGBUb2tlbml6ZXIuVGV4dGAgaWYgbWF0Y2hlZC5cbi8vVEVTVE1FOiAgbm90IHN1cmUgdGhlIGVzY2FwaW5nIGxvZ2ljIGlzIHJlYWxseSByaWdodC4uLlxuXHRtYXRjaFRleHQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBxdW90ZVN5bWJvbCA9IHRleHRbc3RhcnRdO1xuXHRcdGlmIChxdW90ZVN5bWJvbCAhPT0gJ1wiJyAmJiBxdW90ZVN5bWJvbCAhPT0gXCInXCIpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgdGV4dEVuZCA9IHN0YXJ0ICsgMTtcblx0XHR3aGlsZSAodGV4dEVuZCA8IGVuZCkge1xuXHRcdFx0bGV0IGNoYXIgPSB0ZXh0W3RleHRFbmRdO1xuXHRcdFx0aWYgKGNoYXIgPT09IHF1b3RlU3ltYm9sKSBicmVhaztcblx0XHRcdC8vIGlmIHdlIGdldCBhIGJhY2txdW90ZSwgaWdub3JlIHF1b3RlIGluIG5leHQgY2hhclxuXHRcdFx0aWYgKGNoYXIgPT09IFwiXFxcXFwiICYmIHRleHRbdGV4dEVuZCArIDFdID09PSBxdW90ZVN5bWJvbCkgdGV4dEVuZCsrO1xuXHRcdFx0dGV4dEVuZCsrO1xuXHRcdH1cblx0XHQvLyBGb3JnZXQgaXQgaWYgd2UgZGlkbid0IGVuZCB3aXRoIHRoZSBxdW90ZSBzeW1ib2xcblx0XHRpZiAodGV4dFt0ZXh0RW5kXSAhPT0gcXVvdGVTeW1ib2wpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0Ly8gYWR2YW5jZSBwYXN0IGVuZCBxdW90ZVxuXHRcdHRleHRFbmQrKztcblxuXHRcdGxldCBxdW90ZWRTdHJpbmcgPSB0ZXh0LnNsaWNlKHN0YXJ0LCB0ZXh0RW5kKTtcblx0XHRsZXQgdG9rZW4gPSBuZXcgVG9rZW5pemVyLlRleHQocXVvdGVkU3RyaW5nKTtcblx0XHRyZXR1cm4gW3Rva2VuLCB0ZXh0RW5kXTtcblx0fSxcblxuXHQvLyBgVGV4dGAgY2xhc3MgZm9yIHN0cmluZyBsaXRlcmFscy5cblx0Ly8gUGFzcyB0aGUgbGl0ZXJhbCB2YWx1ZSwgdXNlIGAudGV4dGAgdG8gZ2V0IGp1c3QgdGhlIGJpdCBpbnNpZGUgdGhlIHF1b3Rlcy5cblx0VGV4dCA6IGNsYXNzIHRleHQge1xuXHRcdGNvbnN0cnVjdG9yKHF1b3RlZFN0cmluZykge1xuXHRcdFx0dGhpcy5xdW90ZWRTdHJpbmcgPSBxdW90ZWRTdHJpbmc7XG5cdFx0fVxuXHRcdGdldCB0ZXh0KCkge1xuXHRcdFx0bGV0IHN0cmluZyA9IHRoaXMucXVvdGVkU3RyaW5nO1xuXHRcdFx0Ly8gY2FsY3VsYXRlIGB0ZXh0YCBhcyB0aGUgYml0cyBiZXR3ZWVuIHRoZSBxdW90ZXMuXG5cdFx0XHRsZXQgc3RhcnQgPSAwO1xuXHRcdFx0bGV0IGVuZCA9IHN0cmluZy5sZW5ndGg7XG5cdFx0XHRpZiAoc3RyaW5nW3N0YXJ0XSA9PT0gJ1wiJyB8fCBzdHJpbmdbc3RhcnRdID09PSBcIidcIikgc3RhcnQgPSAxO1xuXHRcdFx0aWYgKHN0cmluZ1tlbmQtMV0gPT09ICdcIicgfHwgc3RyaW5nW2VuZC0xXSA9PT0gXCInXCIpIGVuZCA9IC0xO1xuXHRcdFx0cmV0dXJuIHN0cmluZy5zbGljZShzdGFydCwgZW5kKTtcblx0XHR9XG5cdFx0dG9TdHJpbmcoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5xdW90ZWRTdHJpbmc7XG5cdFx0fVxuXHR9LFxuXG5cdC8vXG5cdC8vXHQjIyMgQ29tbWVudHNcblx0Ly9cblxuXHQvLyBFYXQgYSBjb21tZW50ICh1bnRpbCB0aGUgZW5kIG9mIHRoZSBsaW5lKS5cblx0Ly8gUmV0dXJucyBhIGBUb2tlbml6ZXIuQ29tbWVudGAgaWYgbWF0Y2hlZC5cblx0Q09NTUVOVCA6IC9eKCMjK3wtLSt8XFwvXFwvKykoXFxzKikoLiopLyxcblx0bWF0Y2hDb21tZW50KHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgY29tbWVudFN0YXJ0ID0gdGV4dC5zbGljZShzdGFydCwgc3RhcnQgKyAyKTtcblx0XHRpZiAoY29tbWVudFN0YXJ0ICE9PSBcIi0tXCIgJiYgY29tbWVudFN0YXJ0ICE9PSBcIlxcL1xcL1wiICYmIGNvbW1lbnRTdGFydCAhPT0gXCIjI1wiKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gY29tbWVudCBlYXRzIHVudGlsIHRoZSBlbmQgb2YgdGhlIGxpbmVcblx0XHRsZXQgbGluZSA9IHRoaXMuZ2V0TGluZUF0SGVhZCh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRsZXQgY29tbWVudE1hdGNoID0gbGluZS5tYXRjaCh0aGlzLkNPTU1FTlQpXG5cdFx0aWYgKCFjb21tZW50TWF0Y2gpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgW21hdGNoLCBjb21tZW50U3ltYm9sLCB3aGl0ZXNwYWNlLCBjb21tZW50XSA9IGNvbW1lbnRNYXRjaDtcblx0XHRsZXQgdG9rZW4gPSBuZXcgVG9rZW5pemVyLkNvbW1lbnQoeyBjb21tZW50U3ltYm9sLCB3aGl0ZXNwYWNlLCBjb21tZW50IH0pO1xuXHRcdHJldHVybiBbdG9rZW4sIHN0YXJ0ICsgbGluZS5sZW5ndGhdO1xuXHR9LFxuXG5cdC8vIENvbW1lbnQgY2xhc3Ncbi8vVEVTVE1FXG5cdENvbW1lbnQgOiBjbGFzcyBjb21tZW50IHtcblx0XHRjb25zdHJ1Y3RvciAocHJvcHMpIHtcblx0XHRcdE9iamVjdC5hc3NpZ24odGhpcywgcHJvcHMpO1xuXHRcdH1cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdHJldHVybiBgJHt0aGlzLmNvbW1lbnRTeW1ib2x9JHt0aGlzLndoaXRlc3BhY2V9JHt0aGlzLmNvbW1lbnR9YDtcblx0XHR9XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIEpTWFxuXHQvL1xuXG5cdC8vIEVhdCBhIChuZXN0ZWQpIEpTWCBleHByZXNzaW9uLlxuLy9URVNUTUVcblx0bWF0Y2hKU1hFbGVtZW50KHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgW2pzeEVsZW1lbnQsIG5leHRTdGFydF0gPSB0aGlzLm1hdGNoSlNYU3RhcnRUYWcodGV4dCwgc3RhcnQsIGVuZCkgfHwgW107XG5cdFx0aWYgKCFqc3hFbGVtZW50KSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0aWYgKCFqc3hFbGVtZW50LmlzVW5hcnlUYWcpIHtcblx0XHRcdGxldCBbY2hpbGRyZW4sIGNoaWxkRW5kXSA9IHRoaXMubWF0Y2hKU1hDaGlsZHJlbihqc3hFbGVtZW50LnRhZ05hbWUsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRcdGlmIChjaGlsZHJlbi5sZW5ndGgpIHtcblx0XHRcdFx0anN4RWxlbWVudC5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuXHRcdFx0XHRuZXh0U3RhcnQgPSBjaGlsZEVuZDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gW2pzeEVsZW1lbnQsIG5leHRTdGFydF07XG5cdH0sXG5cblx0Ly8gTWF0Y2ggSlNYIHN0YXJ0IHRhZyBhbmQgaW50ZXJuYWwgZWxlbWVudHMgKGJ1dCBOT1QgY2hpbGRyZW4pLlxuXHQvLyBSZXR1cm5zIGBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XWAgb3IgYHVuZGVmaW5lZGAuXG5cdC8vIFVzZSBgbWF0Y2hKU1hFbGVtZW50KClgIHRvIG1hdGNoIGNoaWxkcmVuLCBlbmQgdGFnLCBldGMuXG5cdC8vIElnbm9yZXMgbGVhZGluZyB3aGl0ZXNwYWNlLlxuXHRKU1hfVEFHX1NUQVJUIDogL148KFtBLVphLXpdW1xcdy1cXC5dKikoXFxzKlxcLz58XFxzKj58XFxzKykvLFxuLy8gVE9ETzogY2xlYW4gdGhpcyBzdHVmZiB1cCwgbWF5YmUgd2l0aCBmaW5kRmlyc3RBdEhlYWQ/XG5cdG1hdGNoSlNYU3RhcnRUYWcodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBuZXh0U3RhcnQgPSB0aGlzLmVhdFdoaXRlc3BhY2UodGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0Ly8gTWFrZSBzdXJlIHdlIHN0YXJ0IHdpdGggYDxgLlxuXHRcdGlmICh0ZXh0W25leHRTdGFydF0gIT09IFwiPFwiKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHRhZ01hdGNoID0gdGhpcy5tYXRjaEV4cHJlc3Npb25BdEhlYWQodGhpcy5KU1hfVEFHX1NUQVJULCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0aWYgKCF0YWdNYXRjaCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBbIG1hdGNoVGV4dCwgdGFnTmFtZSwgZW5kQml0IF0gPSB0YWdNYXRjaDtcblx0XHRsZXQganN4RWxlbWVudCA9IG5ldyBUb2tlbml6ZXIuSlNYRWxlbWVudCh0YWdOYW1lKTtcblx0XHRuZXh0U3RhcnQgPSBuZXh0U3RhcnQgKyBtYXRjaFRleHQubGVuZ3RoO1xuXG5cdFx0Ly8gSWYgdW5hcnkgdGFnLCBtYXJrIGFzIHN1Y2ggYW5kIHJldHVybi5cblx0XHRlbmRCaXQgPSBlbmRCaXQudHJpbSgpO1xuXHRcdGlmIChlbmRCaXQgPT09IFwiLz5cIikge1xuXHRcdFx0anN4RWxlbWVudC5pc1VuYXJ5VGFnID0gdHJ1ZTtcblx0XHRcdHJldHVybiBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XTtcblx0XHR9XG5cblx0XHQvLyBJZiB3ZSBkaWRuJ3QgaW1tZWRpYXRlbHkgZ2V0IGFuIGVuZCBtYXJrZXIsIGF0dGVtcHQgdG8gbWF0Y2ggYXR0cmlidXRlc1xuXHRcdGlmIChlbmRCaXQgIT09IFwiPlwiICYmIGVuZEJpdCAhPT0gXCIvPlwiKSB7XG5cdFx0XHRsZXQgWyBhdHRycywgYXR0ckVuZCBdID0gdGhpcy5lYXRUb2tlbnModGhpcy5tYXRjaEpTWEF0dHJpYnV0ZSwgdGV4dCwgbmV4dFN0YXJ0LCBlbmQpO1xuXHRcdFx0anN4RWxlbWVudC5hdHRyaWJ1dGVzID0gYXR0cnM7XG5cdFx0XHRuZXh0U3RhcnQgPSBhdHRyRW5kO1xuXHRcdH1cblxuXHRcdC8vIGF0IHRoaXMgcG9pbnQgd2Ugc2hvdWxkIGdldCBhbiBgLz5gIG9yIGA+YCAod2l0aCBubyB3aGl0ZXNwYWNlKS5cblx0XHRpZiAodGV4dFtuZXh0U3RhcnRdID09PSBcIi9cIiAmJiB0ZXh0W25leHRTdGFydCArIDFdID09PSBcIj5cIikge1xuXHRcdFx0ZW5kQml0ID0gXCIvPlwiO1xuXHRcdFx0bmV4dFN0YXJ0ICs9IDI7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKHRleHRbbmV4dFN0YXJ0XSA9PT0gXCI+XCIpIHtcblx0XHRcdGVuZEJpdCA9IHRleHRbbmV4dFN0YXJ0XTtcblx0XHRcdG5leHRTdGFydCArPSAxO1xuXHRcdH1cblxuXHRcdC8vIFJldHVybiBpbW1lZGlhdGVseSBmb3IgdW5hcnkgdGFnXG5cdFx0aWYgKGVuZEJpdCA9PT0gXCIvPlwiKSB7XG5cdFx0XHRqc3hFbGVtZW50LmlzVW5hcnlUYWcgPSB0cnVlO1xuXHRcdFx0cmV0dXJuIFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdO1xuXHRcdH1cblxuXHRcdC8vIGFkdmFuY2UgcGFzdCBgPmBcblx0XHRpZiAoZW5kQml0ICE9PSBcIj5cIikge1xuXHRcdFx0aWYgKFRva2VuaXplci5XQVJOKSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihcIk1pc3NpbmcgZXhwZWN0ZWQgZW5kIGA+YCBmb3IganN4RWxlbWVudFwiLCBqc3hFbGVtZW50LCBcImBcIit0ZXh0LnNsaWNlKHN0YXJ0LCBuZXh0U3RhcnQpK1wiYFwiKTtcblx0XHRcdH1cblx0XHRcdGpzeEVsZW1lbnQuZXJyb3IgPSBcIk5vIGVuZCA+XCI7XG5cdFx0XHRyZXR1cm4gW2pzeEVsZW1lbnQsIG5leHRTdGFydF07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdO1xuXHR9LFxuXG5cblx0Ly8gSlNYIGVsZW1lbnQgY2xhc3Ncblx0SlNYRWxlbWVudCA6IGNsYXNzIGpzeEVsZW1lbnQge1xuXHRcdGNvbnN0cnVjdG9yKHRhZ05hbWUsIGF0dHJpYnV0ZXMsIGNoaWxkcmVuKSB7XG5cdFx0XHR0aGlzLnRhZ05hbWUgPSB0YWdOYW1lO1xuXHRcdFx0aWYgKGF0dHJpYnV0ZXMpIHRoaXMuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG5cdFx0XHRpZiAoY2hpbGRyZW4pIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcblx0XHR9XG5cblx0XHQvLyBSZXR1cm4gYXR0cmlidXRlcyBhcyBhIG1hcC5cbi8vVEVTVE1FXG5cdFx0Z2V0IGF0dHJzKCkge1xuXHRcdFx0bGV0IGF0dHJzID0ge307XG5cdFx0XHRpZiAodGhpcy5hdHRyaWJ1dGVzKSB0aGlzLmF0dHJpYnV0ZXMuZm9yRWFjaChhdHRyID0+IHtcblx0XHRcdFx0Ly8gaWdub3JlIHVubmFtZWQgYXR0cmlidXRlc1xuXHRcdFx0XHRpZiAoYXR0ci5uYW1lKSBhdHRyc1thdHRyLm5hbWVdID0gYXR0ci52YWx1ZVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gYXR0cnM7XG5cdFx0fVxuXG5cdFx0Ly8gUmV0dXJuIG91ciBhdHRyaWJ1dGVzIGFzIGEgc3RyaW5nXG4vL1RFU1RNRVxuXHRcdGdldCBhdHRyc0FzU3RyaW5nKCkge1xuXHRcdFx0aWYgKCF0aGlzLmF0dHJpYnV0ZXMpIHJldHVybiBcIlwiO1xuXHRcdFx0cmV0dXJuIFwiIFwiICsgdGhpcy5hdHRyaWJ1dGVzLm1hcCggKHsgbmFtZSwgdmFsdWUgfSkgPT4ge1xuXHRcdFx0XHRpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuIG5hbWU7XG5cdFx0XHRcdC8vIGNvbnZlcnQgdmFsdWUgYXJyYXkgKHRva2VucykgdG8gc3RyaW5nXG5cdFx0XHRcdC8vIFRPRE86IHRoaXMgd2lsbCB3YW50IHRvIGJlIHNtYXJ0ZXIuLi5cblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB2YWx1ZSA9IGB7JHt2YWx1ZS5qb2luKFwiIFwiKX19YDtcblx0XHRcdFx0cmV0dXJuIGBuYW1lPSR7dmFsdWV9YDtcblx0XHRcdH0pLmpvaW4oXCIgXCIpO1xuXHRcdH1cblxuXHRcdC8vIFJldHVybiBvdXIgY2hpbGRyZW4gYXMgYSBzdHJpbmcuXG4vL1RFU1RNRVxuXHRcdGdldCBjaGlsZHJlbkFzU3RyaW5nKCkge1xuXHRcdFx0aWYgKCF0aGlzLmNoaWxkcmVuKSByZXR1cm4gXCJcIjtcblx0XHRcdHJldHVybiB0aGlzLmNoaWxkcmVuLm1hcChjaGlsZCA9PiB7XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KGNoaWxkKSkgcmV0dXJuIGB7JHtjaGlsZC5qb2luKFwiIFwiKX19YDtcblx0XHRcdFx0cmV0dXJuIFwiXCIgKyBjaGlsZDtcblx0XHRcdH0pLmpvaW4oXCJcIik7XG5cdFx0fVxuXG5cdFx0dG9TdHJpbmcoKSB7XG5cdFx0XHRsZXQgYXR0cnMgPSB0aGlzLmF0dHJzQXNTdHJpbmc7XG5cdFx0XHRsZXQgY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuQXNTdHJpbmc7XG5cdFx0XHRpZiAodGhpcy5pc1VuYXJ5VGFnKSByZXR1cm4gYDwke3RoaXMudGFnTmFtZX0ke2F0dHJzfS8+YDtcblx0XHRcdHJldHVybiBgPCR7dGhpcy50YWdOYW1lfSR7YXR0cnN9PiR7Y2hpbGRyZW59PC8ke3RoaXMudGFnTmFtZX0+YDtcblx0XHR9XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIEpTWCBjaGlsZHJlblxuXHQvL1xuXG5cdC8vIE1hdGNoIEpTWCBlbGVtZW50IGNoaWxkcmVuIG9mIGA8dGFnTmFtZT5gIGF0IGB0ZXh0W3N0YXJ0XWAuXG5cdC8vIE1hdGNoZXMgbmVzdGVkIGNoaWxkcmVuIGFuZCBzdG9wcyBhZnRlciBtYXRjaGluZyBlbmQgdGFnOiBgPC90YWdOYW1lPmAuXG5cdC8vIFJldHVybnMgYFtjaGlsZHJlbiwgbmV4dFN0YXJ0XWAuXG4vL1RFU1RNRVxuXHRtYXRjaEpTWENoaWxkcmVuKHRhZ05hbWUsIHRleHQsIHN0YXJ0LCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBjaGlsZHJlbiA9IFtdO1xuXHRcdGxldCBuZXN0aW5nID0gMTtcblx0XHRsZXQgZW5kVGFnID0gYDwvJHt0YWdOYW1lfT5gO1xuXG5cdFx0bGV0IG5leHRTdGFydCA9IHN0YXJ0O1xuXHRcdHdoaWxlKHRydWUpIHtcblx0XHRcdGxldCByZXN1bHQgPSB0aGlzLm1hdGNoSlNYQ2hpbGQoZW5kVGFnLCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0XHRpZiAoIXJlc3VsdCkgYnJlYWs7XG5cblx0XHRcdGxldCBbY2hpbGQsIGNoaWxkRW5kXSA9IHJlc3VsdDtcblx0XHRcdG5leHRTdGFydCA9IGNoaWxkRW5kO1xuXHRcdFx0Ly8gSWYgd2UgZ290IHRoZSBlbmRUYWcsIHVwZGF0ZSBuZXN0aW5nIGFuZCBicmVhayBvdXQgb2YgbG9vcCBpZiBuZXN0aW5nICE9PSAwXG5cdFx0XHRpZiAoY2hpbGQgPT09IGVuZFRhZykge1xuXHRcdFx0XHRuZXN0aW5nIC0tO1xuXHRcdFx0XHRpZiAobmVzdGluZyA9PT0gMCkgYnJlYWs7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmIChjaGlsZCkgY2hpbGRyZW4ucHVzaChjaGlsZCk7XG5cdFx0XHR9XG5cdFx0fVxuLy8gVE9ETzogaG93IHRvIHN1cmZhY2UgdGhpcyBlcnJvcj8/P1xuXHRcdGlmIChuZXN0aW5nICE9PSAwKSB7XG5cdFx0XHRpZiAoVG9rZW5pemVyLldBUk4pIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKGBtYXRjaEpTWENoaWxkcmVuKCR7dGV4dC5zbGljZShzdGFydCwgbmV4dFN0YXJ0ICsgMTApfTogZGlkbid0IG1hdGNoIGVuZCBjaGlsZCFgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIFtjaGlsZHJlbiwgbmV4dFN0YXJ0XTtcblx0fSxcblxuXHQvLyBNYXRjaCBhIHNpbmdsZSBKU1ggY2hpbGQ6XG5cdC8vXHQtIGN1cnJlbnQgZW5kVGFnXG5cdC8vXHQtIGB7IGpzeCBleHByZXNzaW9uIH1gXG5cdC8vXHQtIG5lc3RlZCBKU1ggZWxlbWVudFxuXHQvL1x0LSAoYW55dGhpbmcgZWxzZSkgYXMganN4VGV4dCBleHByZXNzaW9uLlxuXHRtYXRjaEpTWENoaWxkKGVuZFRhZywgdGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaEpTWEVuZFRhZyhlbmRUYWcsIHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoSlNYRXhwcmVzc2lvbih0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0fHwgdGhpcy5tYXRjaEpTWEVsZW1lbnQodGV4dCwgc3RhcnQsIGVuZClcbi8vIFRPRE86IG5ld2xpbmUgYW5kIGluZGVudD9cblx0XHRcdHx8IHRoaXMubWF0Y2hKU1hUZXh0KHRleHQsIHN0YXJ0LCBlbmQpO1xuXHR9LFxuXG5cdC8vIEF0dGVtcHQgdG8gbWF0Y2ggYSBzcGVjaWZpYyBlbmQgdGFnLlxuXHQvLyBJZ25vcmVzIGxlYWRpbmcgd2hpdGVzcGFjZS5cblx0bWF0Y2hKU1hFbmRUYWcoZW5kVGFnLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG5leHRTdGFydCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRpZiAoIXRoaXMubWF0Y2hTdHJpbmdBdEhlYWQoZW5kVGFnLCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCkpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIFtlbmRUYWcsIG5leHRTdGFydCArIGVuZFRhZy5sZW5ndGhdO1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBKU1ggYXR0cmlidXRlc1xuXHQvL1xuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIEpTWCBlbGVtZW50IGF0dHJpYnV0ZSBhcyBgPGF0dHI+PXs8dmFsdWU+fWBcbi8vIFRPRE86IHsuLi54eHh9XG5cdEpTWF9BVFRSSUJVVEVfU1RBUlQgOiAvXlxccyooW1xcdy1dK1xcYilcXHMqKD0/KVxccyovLFxuXHRtYXRjaEpTWEF0dHJpYnV0ZSh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gYXR0cmlidXRlcyBtdXN0IHN0YXJ0IHdpdGggYSB3b3JkIGNoYXJhY3RlclxuXHRcdGlmICghdGhpcy5XT1JEX1NUQVJULnRlc3QodGV4dFtzdGFydF0pKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gYXR0ZW1wdCB0byBtYXRjaCBhbiBhdHRyaWJ1dGUgbmFtZSwgaW5jbHVkaW5nIGA9YCBpZiBwcmVzZW50LlxuXHRcdGxldCByZXN1bHQgPSB0aGlzLm1hdGNoRXhwcmVzc2lvbkF0SGVhZCh0aGlzLkpTWF9BVFRSSUJVVEVfU1RBUlQsIHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGlmICghcmVzdWx0KSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IFsgbWF0Y2gsIG5hbWUsIGVxdWFscyBdID0gcmVzdWx0O1xuXHRcdGxldCBuZXh0U3RhcnQgPSBzdGFydCArIG1hdGNoLmxlbmd0aDtcblx0XHRsZXQgYXR0cmlidXRlID0gbmV3IFRva2VuaXplci5KU1hBdHRyaWJ1dGUobmFtZSk7XG5cblx0XHQvLyBpZiB0aGVyZSB3YXMgYW4gZXF1YWxzIGNoYXIsIHBhcnNlIHRoZSB2YWx1ZVxuXHRcdGlmIChlcXVhbHMpIHtcblx0XHRcdGxldCBbdmFsdWUsIHZhbHVlRW5kXSA9IHRoaXMubWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZSh0ZXh0LCBuZXh0U3RhcnQsIGVuZCkgfHwgW107XG5cdFx0XHRpZiAodmFsdWUpIHtcblx0XHRcdFx0YXR0cmlidXRlLnZhbHVlID0gdmFsdWU7XG5cdFx0XHRcdG5leHRTdGFydCA9IHZhbHVlRW5kO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBlYXQgd2hpdGVzcGFjZSBiZWZvcmUgdGhlIG5leHQgYXR0cmlidXRlIC8gdGFnIGVuZFxuXHRcdG5leHRTdGFydCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0cmV0dXJuIFthdHRyaWJ1dGUsIG5leHRTdGFydF07XG5cdH0sXG5cblx0Ly8gTWF0Y2ggYSB2YWx1ZSBleHByZXNzaW9uIGZvciBhIEpTWCBlbGVtZW50IGF0dHJpYnV0ZTpcblx0Ly8gTk9URTogd2Ugd2lsbCBiZSBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGA9YCAoYW5kIHN1YnNlcXVlbnQgd2hpdGVzcGFjZSkuXG5cdG1hdGNoSlNYQXR0cmlidXRlVmFsdWUodGV4dCwgc3RhcnQsIGVuZCkge1xuXHRcdHJldHVybiB0aGlzLm1hdGNoVGV4dCh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0fHwgdGhpcy5tYXRjaEpTWEV4cHJlc3Npb24odGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hKU1hFbGVtZW50KHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoSlNYQXR0cmlidXRlVmFsdWVJZGVudGlmaWVyKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoTnVtYmVyKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0O1xuXHR9LFxuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIGlkZW50aWZlciBhcyBhIEpTWCBhdHRyaWJ1dGUgdmFsdWUuXG5cdC8vIFJldHVybnMgYXMgYSBgSlNYRXhwcmVzc2lvbmAuXG5cdG1hdGNoSlNYQXR0cmlidXRlVmFsdWVJZGVudGlmaWVyKHRleHQsIHN0YXJ0LCBlbmQpIHtcblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5tYXRjaFdvcmQodGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0aWYgKCFyZXN1bHQpIHJldHVybjtcblxuXHRcdGxldCBbIHdvcmQsIG5leHRTdGFydCBdID0gcmVzdWx0O1xuXHRcdGxldCB0b2tlbiA9IG5ldyBUb2tlbml6ZXIuSlNYRXhwcmVzc2lvbih3b3JkKTtcblx0XHRyZXR1cm4gW3Rva2VuLCBuZXh0U3RhcnRdO1xuXHR9LFxuXG5cdC8vIEpTWCBhdHRyaWJ1dGUgY2xhc3Ncblx0Ly8gYG5hbWVgIGlzIHRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUuXG5cdC8vIGB2YWx1ZWAgaXMgb25lIG9mOlxuXHQvL1x0XHQtIGAnLi4uJ2BcdFx0XHQvLyBUZXh0IChsaXRlcmFsIHN0cmluZykuXG5cdC8vXHRcdC0gYFwiLi4uXCJgXHRcdFx0Ly8gVGV4dCAobGl0ZXJhbCBzdHJpbmcpLlxuXHQvL1x0XHQtIGB7Li4ufWBcdFx0XHQvLyBFeHByZXNzaW9uLiAgUmVzdWx0cyB3aWxsIGJlIHRva2VuaXplZCBhcnJheS5cblx0Ly9cdFx0LSBgPC4uLi4+YFx0XHRcdC8vIEpTWCBlbGVtZW50LlxuXHQvL1x0XHQtIGAxYFx0XHRcdFx0Ly8gTnVtYmVyLiAgTm90ZTogdGhpcyBpcyBhbiBleHRlbnNpb24gdG8gSlNYLlxuXG5cdEpTWEF0dHJpYnV0ZSA6IGNsYXNzIGpzeEF0dHJpYnV0ZSB7XG5cdFx0Y29uc3RydWN0b3IobmFtZSwgdmFsdWUpIHtcblx0XHRcdHRoaXMubmFtZSA9IG5hbWU7XG5cdFx0XHRpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkgdGhpcy52YWx1ZSA9IHZhbHVlO1xuXHRcdH1cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdGlmICh0aGlzLnZhbHVlID09PSB1bmRlZmluZWQpIHJldHVybiB0aGlzLm5hbWU7XG5cdFx0XHRyZXR1cm4gYCR7dGhpcy5uYW1lfT17JHt0aGlzLnZhbHVlfX1gO1xuXHRcdH1cblx0fSxcblxuXG5cdC8vIE1hdGNoIGEgSlNYIGV4cHJlc3Npb24gZW5jbG9zZWQgaW4gY3VybHkgYnJhY2VzLCBlZzogIGB7IC4uLiB9YC5cblx0Ly8gIEhhbmRsZXMgbmVzdGVkIGN1cmxpZXMsIHF1b3RlcywgZXRjLlxuXHQvLyBSZXR1cm5zIGFycmF5IG9mIHRva2VucyBvZiBpbnRlcm5hbCBtYXRjaC5cblx0Ly8gSWdub3JlcyBsZWFkaW5nIHdoaXRlc3BhY2UuXG4vL1RPRE86IG5ld2xpbmVzL2luZGVudHM/Pz9cbi8vVE9ETzogey4uLnh4eH1cbi8vVEVTVE1FXG5cdG1hdGNoSlNYRXhwcmVzc2lvbih0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG5leHRTdGFydCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRsZXQgZW5kSW5kZXggPSB0aGlzLmZpbmRNYXRjaGluZ0F0SGVhZChcIntcIiwgXCJ9XCIsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRpZiAoZW5kSW5kZXggPT09IHVuZGVmaW5lZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIEdldCBjb250ZW50cywgaW5jbHVkaW5nIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UuXG5cdFx0bGV0IGNvbnRlbnRzID0gdGV4dC5zbGljZShzdGFydCArIDEsIGVuZEluZGV4KTtcblxuXHRcdC8vIHJldHVybiBhIG5ldyBKU1hFeHByZXNzaW9uLCBhZHZhbmNpbmcgYmV5b25kIHRoZSBlbmRpbmcgYH1gLlxuXHRcdGxldCBleHByZXNzaW9uID0gbmV3IFRva2VuaXplci5KU1hFeHByZXNzaW9uKGNvbnRlbnRzKTtcblx0XHRyZXR1cm4gW2V4cHJlc3Npb24sIGVuZEluZGV4ICsgMV07XG5cdH0sXG5cblx0Ly8gSlNYIGV4cHJlc3Npb24sIGNvbXBvc2VkIG9mIGlubGluZSB0b2tlbnMgd2hpY2ggc2hvdWxkIHlpZWxkIGFuIGBleHByZXNzaW9uYC5cblx0SlNYRXhwcmVzc2lvbiA6IGNsYXNzIGpzeEV4cHJlc3Npb24ge1xuXHRcdGNvbnN0cnVjdG9yKGNvbnRlbnRzKSB7XG5cdFx0XHR0aGlzLmNvbnRlbnRzID0gY29udGVudHMgfHwgXCJcIjtcblx0XHR9XG5cdFx0Ly8gRGl2aWRlIGNvbnRlbnRzIGludG8gYHRva2Vuc2AuXG5cdFx0Z2V0IHRva2VucygpIHtcblx0XHRcdHJldHVybiBUb2tlbml6ZXIudG9rZW5pemUodGhpcy5jb250ZW50cy50cmltKCkpO1xuXHRcdH1cblx0fSxcblxuXHQvLyBNYXRjaCBKU1hUZXh0IHVudGlsIHRoZSBvbmUgb2YgYHtgLCBgPGAsIGA+YCBvciBgfWAuXG5cdC8vIE5PVEU6IElOQ0xVREVTIGxlYWRpbmcgLyB0cmFpbGluZyB3aGl0ZXNwYWNlLlxuXHRKU1hfVEVYVF9FTkRfQ0hBUlMgOiBbXCJ7XCIsIFwiPFwiLCBcIj5cIiwgXCJ9XCJdLFxuLy9URVNUTUVcblx0bWF0Y2hKU1hUZXh0KHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyB0ZW1wb3JhcmlseSBhZHZhbmNlIHBhc3Qgd2hpdGVzcGFjZSAod2UnbGwgaW5jbHVkZSBpdCBpbiB0aGUgb3V0cHV0KS5cblx0XHRsZXQgbmV4dFN0YXJ0ID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGxldCBlbmRJbmRleCA9IHRoaXMuZmluZEZpcnN0QXRIZWFkKHRoaXMuSlNYX1RFWFRfRU5EX0NIQVJTLCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0Ly8gSWYgdGhlIGZpcnN0IG5vbi13aGl0ZXNwYWNlIGNoYXIgaXMgaW4gb3VyIEVORF9DSEFSUywgZm9yZ2V0IGl0LlxuXHRcdGlmIChlbmRJbmRleCA9PT0gbmV4dFN0YXJ0KSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gaWYgbm8gbWF0Y2gsIHdlJ3ZlIGdvdCBzb21lIHNvcnQgb2YgZXJyb3Jcblx0XHRpZiAoZW5kSW5kZXggPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYgKFRva2VuaXplci5XQVJOKSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihcIm1hdGNoSlNYVGV4dChcIit0ZXh0LnNsaWNlKHN0YXJ0LCBzdGFydCArIDUwKStcIik6IEpTWCBzZWVtcyB0byBiZSB1bmJhbGFuY2VkLlwiKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Ly8gaW5jbHVkZSBsZWFkaW5nIHdoaXRlc3BhY2UgaW4gdGhlIG91dHB1dC5cblx0XHRsZXQganN4VGV4dCA9IHRleHQuc2xpY2Uoc3RhcnQsIGVuZEluZGV4KTtcblx0XHRyZXR1cm4gW2pzeFRleHQsIGVuZEluZGV4XTtcblx0fSxcblxuXG5cblxuXHQvL1xuXHQvL1x0IyMgVXRpbGl0eSBmdW5jdGlvbnNcblx0Ly9cblxuXHQvLyBSZXR1cm4gY2hhcmFjdGVycyB1cCB0bywgYnV0IG5vdCBpbmNsdWRpbmcsIHRoZSBuZXh0IG5ld2xpbmUgY2hhciBhZnRlciBgc3RhcnRgLlxuXHQvLyBJZiBgc3RhcnRgIGlzIGEgbmV3bGluZSBjaGFyIG9yIHN0YXJ0ID49IGVuZCwgcmV0dXJucyBlbXB0eSBzdHJpbmcuXG5cdC8vIElmIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZyAoZWc6IG5vIG1vcmUgbmV3bGluZXMpLCByZXR1cm5zIGZyb20gc3RhcnQgdG8gZW5kLlxuLy9URVNUTUVcblx0Z2V0TGluZUF0SGVhZCh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gXCJcIjtcblxuXHRcdGxldCBuZXdsaW5lID0gdGV4dC5pbmRleE9mKFwiXFxuXCIsIHN0YXJ0KTtcblx0XHRpZiAobmV3bGluZSA9PT0gLTEgfHwgbmV3bGluZSA+IGVuZCkgbmV3bGluZSA9IGVuZDtcblx0XHRyZXR1cm4gdGV4dC5zbGljZShzdGFydCwgbmV3bGluZSk7XG5cdH0sXG5cblx0Ly8gTWF0Y2ggYSBtdWx0aS1jaGFyIHN0cmluZyBzdGFydGluZyBhdCBgdGV4dFtzdGFydF1gLlxuLy9URVNUTUVcblx0bWF0Y2hTdHJpbmdBdEhlYWQoc3RyaW5nLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHN0cmluZ0VuZCA9IHN0YXJ0ICsgc3RyaW5nLmxlbmd0aDtcblx0XHRpZiAoc3RyaW5nRW5kID4gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdHJldHVybiBzdHJpbmcgPT09IHRleHQuc2xpY2Uoc3RhcnQsIHN0cmluZ0VuZCk7XG5cdH0sXG5cblxuXHQvLyBNYXRjaCBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBzdGFydGluZyBhdCBgdGV4dFtzdGFydF1gLCByZXR1cm5pbmcgdGhlIG1hdGNoLlxuXHQvLyBSZXR1cm5zIGBudWxsYCBpZiBubyBtYXRjaC5cblx0Ly9cblx0Ly8gTk9URTogVGhlIGV4cHJlc3Npb24gTVVTVCBzdGFydCB3aXRoIGAvXi4uLi9gXG4vL1RFU1RNRVxuXHRtYXRjaEV4cHJlc3Npb25BdEhlYWQoZXhwcmVzc2lvbiwgdGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBoZWFkID0gdGV4dC5zbGljZShzdGFydCwgZW5kKTtcblx0XHRyZXR1cm4gaGVhZC5tYXRjaChleHByZXNzaW9uKTtcblx0fSxcblxuXHQvLyBGaW5kIGluZGV4IG9mIHRoZSBtYXRjaGluZyBTSU5HTEUgQ0hBUkFDVEVSIGBlbmREZWxpbWl0ZXJgIHRvIG1hdGNoIGBzdGFydERlbGltaXRlcmAuXG5cdC8vIE1hdGNoZXMgbmVzdGVkIGRlbGltaXRlcnMgYW5kIGhhbmRsZXMgZXNjYXBlZCBkZWxpbWl0ZXJzLlxuXHQvLyBBc3N1bWVzIGB0ZXh0W3N0YXJ0XWAgaXMgdGhlIHN0YXJ0RGVsaW1pdGVyIVxuXHQvLyBSZXR1cm5zIG51bWVyaWMgaW5kZXggb3IgYHVuZGVmaW5lZGAgaWYgbm8gbWF0Y2ggb3IgaWYgZmlyc3QgY2hhciBpcyBub3QgYHN0YXJ0RGVsaW1pdGVyYC5cblx0Ly9cblx0Ly9cdEFsc28gaGFuZGxlcyBuZXN0ZWQgcXVvdGVzIC0tIGlmIHdlIGVuY291bnRlciBhIHNpbmdsZSBvciBkb3VibGUgcXVvdGUsXG5cdC8vXHRcdHdlJ2xsIHNraXAgc2Nhbm5pbmcgdW50aWwgd2UgZmluZCBhIG1hdGNoaW5nIHF1b3RlLlxuXHQvL1xuXHQvL1x0ZWc6ICBgZmluZE1hdGNoaW5nQXRIZWFkKFwie1wiLCBcIn1cIiwgXCJ7YWF7YX1hYX1cIilgID0+IDhcbi8vVEVTVE1FXG5cdGZpbmRNYXRjaGluZ0F0SGVhZChzdGFydERlbGltaXRlciwgZW5kRGVsaW1pdGVyLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0aWYgKHRleHRbc3RhcnRdICE9PSBzdGFydERlbGltaXRlcikgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBuZXN0aW5nID0gMDtcblx0XHRsZXQgY3VycmVudCA9IHN0YXJ0O1xuXHRcdHdoaWxlIChjdXJyZW50IDwgZW5kKSB7XG5cdFx0XHRsZXQgY2hhciA9IHRleHRbY3VycmVudF07XG5cdFx0XHQvLyBpZiBzdGFydERlbGltaXRlciwgaW5jcmVhc2UgbmVzdGluZ1xuXHRcdFx0aWYgKGNoYXIgPT09IHN0YXJ0RGVsaW1pdGVyKSB7XG5cdFx0XHRcdG5lc3RpbmcrKztcblx0XHRcdH1cblx0XHRcdC8vIGlmIGVuZERlbGltaXRlciwgZGVjcmVhc2UgbmVzdGluZyBhbmQgcmV0dXJuIGlmIG5lc3RpbmcgYmFjayB0byAwXG5cdFx0XHRlbHNlIGlmIChjaGFyID09PSBlbmREZWxpbWl0ZXIpIHtcblx0XHRcdFx0bmVzdGluZy0tO1xuXHRcdFx0XHRpZiAobmVzdGluZyA9PT0gMCkgcmV0dXJuIGN1cnJlbnQ7XG5cdFx0XHR9XG5cdFx0XHQvLyBpZiBhIHNpbmdsZSBvciBkb3VibGUgcXVvdGUsIHNraXAgdW50aWwgdGhlIG1hdGNoaW5nIHF1b3RlXG5cdFx0XHRlbHNlIGlmIChjaGFyID09PSBcIidcIiB8fCBjaGFyID09PSAnXCInKSB7XG5cdFx0XHRcdGxldCBbdG9rZW4sIGFmdGVyUXVvdGVdID0gdGhpcy5tYXRjaFRleHQodGV4dCwgY3VycmVudCwgZW5kKSB8fCBbXTtcblx0XHRcdFx0Y3VycmVudCA9IGFmdGVyUXVvdGU7XG5cdFx0XHRcdGNvbnRpbnVlO1x0Ly8gY29udGludWUgc28gd2UgZG9uJ3QgYWRkIDEgdG8gY3VyZW50IGJlbG93XG5cdFx0XHR9XG5cdFx0XHQvLyBJZiBiYWNrc2xhc2gsIHNraXAgYW4gZXh0cmEgY2hhciBpZiBpdCdzIGVpdGhlciBkZWxpbWl0ZXIgb3IgYSBxdW90ZVxuXHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gXCJcXFxcXCIpIHtcblx0XHRcdFx0Y2hhciA9IHRleHRbY3VycmVudCArIDFdO1xuXHRcdFx0XHRpZiAoY2hhciA9PT0gc3RhcnREZWxpbWl0ZXJcblx0XHRcdFx0IHx8IGNoYXIgPT09IGVuZERlbGltaXRlclxuXHRcdFx0XHQgfHwgY2hhciA9PT0gXCInXCJcblx0XHRcdFx0IHx8IGNoYXIgPT09ICdcIidcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0Y3VycmVudCsrOztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y3VycmVudCsrO1xuXHRcdH1cblx0fSxcblxuXG5cdC8vIFJldHVybiB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IE5PTi1FU0NBUEVEIGNoYXJhY3RlciBpbiBgY2hhcnNgIGFmdGVyIGB0ZXh0W3N0YXJ0XWAuXG5cdC8vIFJldHVybnMgYHVuZGVmaW5lZGAgaWYgd2UgZGlkbid0IGZpbmQgYSBtYXRjaC5cbi8vVEVTVE1FXG5cdGZpbmRGaXJzdEF0SGVhZChjaGFycywgdGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHdoaWxlIChzdGFydCA8IGVuZCkge1xuXHRcdFx0bGV0IGNoYXIgPSB0ZXh0W3N0YXJ0XTtcblx0XHRcdGlmIChjaGFycy5pbmNsdWRlcyhjaGFyKSkgcmV0dXJuIHN0YXJ0O1xuXHRcdFx0Ly8gaWYgd2UgZ290IGFuIGVzY2FwZSBjaGFyLCBpZ25vcmUgdGhlIG5leHQgY2hhciBpZiBpdCdzIGluIGBjaGFyc2Bcblx0XHRcdGlmIChjaGFyID09PSBcIlxcXFxcIiAmJiBjaGFycy5pbmNsdWRlcyh0ZXh0W3N0YXJ0KzFdKSkgc3RhcnQrKztcblx0XHRcdHN0YXJ0Kys7XG5cdFx0fVxuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHN0YXJ0O1xuXHR9LFxuXG5cbi8vXG4vLyAjIyMgVXRpbGl0eVxuLy9cblxuXHQvLyBHaXZlbiBhIHNldCBvZiB0b2tlbnMsIHNsaWNlIHdoaXRlc3BhY2UgKGluZGVudCwgTkVXTElORSBvciBub3JtYWwgd2hpdGVzcGFjZSkgZnJvbSB0aGUgZnJvbnQuXG5cdHJlbW92ZUxlYWRpbmdXaGl0ZXNwYWNlKHRva2Vucywgc3RhcnQgPSAwKSB7XG5cdFx0d2hpbGUgKHRva2Vuc1tzdGFydF0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuV2hpdGVzcGFjZSkgc3RhcnQrKztcblx0XHRpZiAoc3RhcnQgPT09IDApIHJldHVybiB0b2tlbnM7XG5cdFx0cmV0dXJuIHRva2Vucy5zbGljZShzdGFydCk7XG5cdH0sXG5cblx0Ly8gR2l2ZW4gYSBzZXQgb2YgdG9rZW5zLCByZW1vdmUgQUxMIFwibm9ybWFsXCIgd2hpdGVzcGFjZSB0b2tlbnMgKE5PVCBpbmRlbnQgb3IgTkVXTElORSkuXG5cdHJlbW92ZU5vcm1hbFdoaXRlc3BhY2UodG9rZW5zKSB7XG5cdFx0cmV0dXJuIHRva2Vucy5maWx0ZXIodG9rZW4gPT4gIVRva2VuaXplci5pc05vcm1hbFdoaXRlc3BhY2UodG9rZW4pKTtcblx0fSxcblxuXG5cdC8vIFJldHVybiBgdHJ1ZWAgaWYgYHRva2VuYCBpcyBcIm5vcm1hbFwiIHdoaXRlc3BjZSAobm90IGEgbmV3bGluZSBvciBpbmRlbnQpXG5cdGlzTm9ybWFsV2hpdGVzcGFjZSh0b2tlbikge1xuXHRcdHJldHVybiB0b2tlbiBpbnN0YW5jZW9mIFRva2VuaXplci5XaGl0ZXNwYWNlXG5cdFx0XHQmJiAhKHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLkluZGVudClcblx0XHRcdCYmICh0b2tlbiAhPT0gVG9rZW5pemVyLk5FV0xJTkUpO1xuXHR9LFxuXG5cbi8vXG4vLyAjIyMgQmxvY2sgLyBpbmRlbnQgcHJvY2Vzc2luZ1xuLy9cblxuXHQvLyBTaW1wbGUgYmxvY2sgY2xhc3MgZm9yIGBicmVha0ludG9CbG9ja3NgLlxuXHRCbG9jazogY2xhc3MgYmxvY2sge1xuXHRcdGNvbnN0cnVjdG9yKHByb3BzKXtcblx0XHRcdE9iamVjdC5hc3NpZ24odGhpcywgcHJvcHMpO1xuXHRcdFx0aWYgKCF0aGlzLmNvbnRlbnRzKSB0aGlzLmNvbnRlbnRzID0gW107XG5cdFx0fVxuXG5cdFx0dG9TdHJpbmcoKSB7XG5cdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcywgbnVsbCwgXCJcXHRcIik7XG5cdFx0fVxuXHR9LFxuXG5cdC8vIEJyZWFrIHRva2VucyBpbnRvIGFuIGFycmF5IG9mIGFycmF5cyBieSBgTkVXTElORWBzLlxuXHQvLyBSZXR1cm5zIGFuIGFycmF5IG9mIGxpbmVzIFdJVEhPVVQgdGhlIGBORVdMSU5FYHMuXG5cdC8vIExpbmVzIHdoaWNoIGFyZSBjb21wb3NlZCBzb2xlbHkgb2Ygd2hpdGVzcGFjZSBhcmUgdHJlYXRlZCBhcyBibGFuay5cblx0YnJlYWtJbnRvTGluZXModG9rZW5zKSB7XG5cdFx0Ly8gQ29udmVydCB0byBsaW5lcy5cblx0XHRsZXQgY3VycmVudExpbmUgPSBbXTtcblx0XHRsZXQgbGluZXMgPSBbY3VycmVudExpbmVdO1xuXHRcdHRva2Vucy5mb3JFYWNoKHRva2VuID0+IHtcblx0XHRcdC8vIGFkZCBuZXcgYXJyYXkgZm9yIGVhY2ggbmV3bGluZVxuXHRcdFx0aWYgKHRva2VuID09PSBUb2tlbml6ZXIuTkVXTElORSkge1xuXHRcdFx0XHQvLyBjcmVhdGUgYSBuZXcgbGluZSBhbmQgcHVzaCBpdCBpblxuXHRcdFx0XHRjdXJyZW50TGluZSA9IFtdO1xuXHRcdFx0XHRyZXR1cm4gbGluZXMucHVzaChjdXJyZW50TGluZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIG90aGVyd2lzZSBqdXN0IGFkZCB0byB0aGUgY3VycmVudCBsaW5lXG5cdFx0XHRjdXJyZW50TGluZS5wdXNoKHRva2VuKTtcblx0XHR9KTtcblxuXHRcdC8vIENsZWFyIGFueSBsaW5lcyB0aGF0IGFyZSBvbmx5IHdoaXRlc3BhY2Vcblx0XHRsaW5lcy5mb3JFYWNoKChsaW5lLCBpbmRleCkgPT4ge1xuXHRcdFx0aWYgKGxpbmUubGVuZ3RoID09PSAxICYmIGxpbmVbMF0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuV2hpdGVzcGFjZSkgbGluZXNbaW5kZXhdID0gW107XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gbGluZXM7XG5cdH0sXG5cblx0Ly8gUmV0dXJuIGluZGVudHMgb2YgdGhlIHNwZWNpZmllZCBsaW5lcy5cblx0Ly8gSW5kZW50cyBlbXB0eSBsaW5lcyAoTkVXTElORXMpIGludG8gdGhlIGJsb2NrIEFGVEVSIHRoZXkgYXBwZWFyLlxuXHRnZXRMaW5lSW5kZW50cyhsaW5lcywgZGVmYXVsdEluZGVudCA9IDApIHtcblx0XHRpZiAobGluZXMubGVuZ3RoID09PSAwKSByZXR1cm4gW107XG5cblx0XHRjb25zdCBpbmRlbnRzID0gbGluZXMubWFwKFRva2VuaXplci5nZXRMaW5lSW5kZW50KTtcblx0XHRjb25zdCBlbmQgPSBpbmRlbnRzLmxlbmd0aDtcblxuXHRcdC8vIGZpZ3VyZSBvdXQgdGhlIGluZGVudCBvZiB0aGUgZmlyc3Qgbm9uLWVtcHR5IGxpbmVcblx0XHRsZXQgc3RhcnRJbmRlbnQgPSBnZXROZXh0SW5kZW50KDApO1xuXHRcdGlmIChzdGFydEluZGVudCA9PT0gdW5kZWZpbmVkKSBzdGFydEluZGVudCA9IGRlZmF1bHRJbmRlbnQ7XG5cblx0XHQvLyBpbmRlbnQgYmxhbmsgbGluZXMgdG8gdGhlIGluZGVudCBBRlRFUiB0aGVtXG5cdFx0Zm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGVuZDsgaW5kZXgrKykge1xuXHRcdFx0aWYgKGluZGVudHNbaW5kZXhdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0aW5kZW50c1tpbmRleF0gPSBnZXROZXh0SW5kZW50KGluZGV4ICsgMSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBpbmRlbnRzO1xuXG5cdFx0Ly8gUmV0dXJuIHRoZSB2YWx1ZSBvZiB0aGUgTkVYVCBub24tdW5kZWZpbmVkIGluZGVudC5cblx0XHRmdW5jdGlvbiBnZXROZXh0SW5kZW50KGluZGV4KSB7XG5cdFx0XHR3aGlsZSAoaW5kZXggPCBlbmQpIHtcblx0XHRcdFx0aWYgKGluZGVudHNbaW5kZXhdICE9PSB1bmRlZmluZWQpIHJldHVybiBpbmRlbnRzW2luZGV4XTtcblx0XHRcdFx0aW5kZXgrKztcblx0XHRcdH1cblx0XHRcdHJldHVybiBzdGFydEluZGVudDtcblx0XHR9XG5cdH0sXG5cblxuXHQvLyBSZXR1cm4gdGhlIGluZGVudCBvZiBhIGxpbmUgb2YgdG9rZW5zLlxuXHQvLyBSZXR1cm5zIGAwYCBpZiBub3QgaW5kZW50ZWQuXG5cdC8vIFJldHVybnMgYHVuZGVmaW5lZGAgaWYgYSBibGFuayBsaW5lLlxuXHRnZXRMaW5lSW5kZW50KGxpbmUpIHtcblx0XHRpZiAoIWxpbmUgfHwgbGluZS5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0aWYgKGxpbmVbMF0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuSW5kZW50KSByZXR1cm4gbGluZVswXS5sZW5ndGg7XG5cdFx0cmV0dXJuIDA7XG5cdH0sXG5cblx0Ly8gQnJlYWsgYHRva2Vuc2AgYmV0d2VlbiBgc3RhcnRgIGFuZCBgZW5kYCBpbnRvIGEgYFRva2VuaXplci5CbG9ja2Agd2l0aCBuZXN0ZWQgYGNvbnRlbnRzYC5cblx0Ly8gU2tpcHMgXCJub3JtYWxcIiB3aGl0ZXNwYWNlIGFuZCBpbmRlbnRzIGluIHRoZSByZXN1bHRzLlxuXHRicmVha0ludG9CbG9ja3M6IGZ1bmN0aW9uKHRva2Vucywgc3RhcnQgPSAwLCBlbmQgPSB0b2tlbnMubGVuZ3RoKSB7XG5cdFx0Ly8gcmVzdHJpY3QgdG8gdG9rZW5zIG9mIGludGVyZXN0XG5cdFx0dG9rZW5zID0gdG9rZW5zLnNsaWNlKHN0YXJ0LCBlbmQpO1xuXHRcdC8vIHJlbW92ZSBcIm5vcm1hbFwiIHdoaXRlc3BhY2Vcbi8vVE9ETzogYmV0dGVyIHRvIGxlYXZlIHRoaXMgdG8gY29uc3VtZXJzPz8/XG5cdFx0dG9rZW5zID0gVG9rZW5pemVyLnJlbW92ZU5vcm1hbFdoaXRlc3BhY2UodG9rZW5zKTtcblxuXHRcdC8vIGJyZWFrIGludG8gbGluZXMgJiByZXR1cm4gZWFybHkgaWYgbm8gbGluZXNcblx0XHRsZXQgbGluZXMgPSBUb2tlbml6ZXIuYnJlYWtJbnRvTGluZXModG9rZW5zKTtcblx0XHRpZiAobGluZXMubGVuZ3RoID09PSAwKSByZXR1cm4gW107XG5cblx0XHQvLyBmaWd1cmUgb3V0IGluZGVudHNcblx0XHRsZXQgaW5kZW50cyA9IFRva2VuaXplci5nZXRMaW5lSW5kZW50cyhsaW5lcyk7XG5cblx0XHQvLyBGaXJzdCBibG9jayBpcyBhdCB0aGUgTUlOSU1VTSBpbmRlbnQgb2YgYWxsIGxpbmVzIVxuXHRcdGxldCBtYXhJbmRlbnQgPSBNYXRoLm1pbi5hcHBseShNYXRoLCBpbmRlbnRzKTtcblx0XHRsZXQgYmxvY2sgPSBuZXcgVG9rZW5pemVyLkJsb2NrKHsgaW5kZW50OiBtYXhJbmRlbnQgfSk7XG5cblx0XHQvLyBzdGFjayBvZiBibG9ja3Ncblx0XHRsZXQgc3RhY2sgPSBbYmxvY2tdO1xuXG5cdFx0bGluZXMuZm9yRWFjaCggKGxpbmUsIGluZGV4KSA9PiB7XG5cdFx0XHQvLyBSZW1vdmUgbGVhZGluZyB3aGl0ZXNwYWNlIChlZzogaW5kZW50cylcblx0XHRcdGxpbmUgPSBUb2tlbml6ZXIucmVtb3ZlTGVhZGluZ1doaXRlc3BhY2UobGluZSk7XG5cblx0XHRcdGxldCBsaW5lSW5kZW50ID0gaW5kZW50c1tpbmRleF07XG5cdFx0XHRsZXQgdG9wID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG5cdFx0XHQvLyBJZiBpbmRlbnRpbmcsIHB1c2ggbmV3IGJsb2NrKHMpXG5cdFx0XHRpZiAobGluZUluZGVudCA+IHRvcC5pbmRlbnQpIHtcblx0XHRcdFx0d2hpbGUgKGxpbmVJbmRlbnQgPiB0b3AuaW5kZW50KSB7XG5cdFx0XHRcdFx0dmFyIG5ld0Jsb2NrID0gbmV3IFRva2VuaXplci5CbG9jayh7IGluZGVudDogdG9wLmluZGVudCArIDEgfSk7XG5cdFx0XHRcdFx0dG9wLmNvbnRlbnRzLnB1c2gobmV3QmxvY2spO1xuXHRcdFx0XHRcdHN0YWNrLnB1c2gobmV3QmxvY2spO1xuXG5cdFx0XHRcdFx0dG9wID0gbmV3QmxvY2s7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIElmIG91dGRlbnRpbmc6IHBvcCBibG9jayhzKVxuXHRcdFx0ZWxzZSBpZiAobGluZUluZGVudCA8IHRvcC5pbmRlbnQpIHtcblx0XHRcdFx0d2hpbGUgKGxpbmVJbmRlbnQgPCB0b3AuaW5kZW50KSB7XG5cdFx0XHRcdFx0c3RhY2sucG9wKCk7XG5cdFx0XHRcdFx0dG9wID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIGFkZCB0byB0b3AgYmxvY2tcblx0XHRcdHRvcC5jb250ZW50cy5wdXNoKGxpbmUpO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGJsb2NrO1xuXHR9LFxuXG5cblxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBUb2tlbml6ZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvVG9rZW5pemVyLmpzIiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHsgdmVyc2lvbjogJzIuNS43JyB9O1xuaWYgKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpIF9fZSA9IGNvcmU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanNcbi8vIG1vZHVsZSBpZCA9IDkxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faXMtb2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSA5MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyB0byBpbmRleGVkIG9iamVjdCwgdG9PYmplY3Qgd2l0aCBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIHN0cmluZ3NcbnZhciBJT2JqZWN0ID0gcmVxdWlyZSgnLi9faW9iamVjdCcpO1xudmFyIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gSU9iamVjdChkZWZpbmVkKGl0KSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qc1xuLy8gbW9kdWxlIGlkID0gOTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGlkID0gMDtcbnZhciBweCA9IE1hdGgucmFuZG9tKCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL191aWQuanNcbi8vIG1vZHVsZSBpZCA9IDk0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlxuLyoqXG4gKiBXaGVuIHNvdXJjZSBtYXBzIGFyZSBlbmFibGVkLCBgc3R5bGUtbG9hZGVyYCB1c2VzIGEgbGluayBlbGVtZW50IHdpdGggYSBkYXRhLXVyaSB0b1xuICogZW1iZWQgdGhlIGNzcyBvbiB0aGUgcGFnZS4gVGhpcyBicmVha3MgYWxsIHJlbGF0aXZlIHVybHMgYmVjYXVzZSBub3cgdGhleSBhcmUgcmVsYXRpdmUgdG8gYVxuICogYnVuZGxlIGluc3RlYWQgb2YgdGhlIGN1cnJlbnQgcGFnZS5cbiAqXG4gKiBPbmUgc29sdXRpb24gaXMgdG8gb25seSB1c2UgZnVsbCB1cmxzLCBidXQgdGhhdCBtYXkgYmUgaW1wb3NzaWJsZS5cbiAqXG4gKiBJbnN0ZWFkLCB0aGlzIGZ1bmN0aW9uIFwiZml4ZXNcIiB0aGUgcmVsYXRpdmUgdXJscyB0byBiZSBhYnNvbHV0ZSBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgcGFnZSBsb2NhdGlvbi5cbiAqXG4gKiBBIHJ1ZGltZW50YXJ5IHRlc3Qgc3VpdGUgaXMgbG9jYXRlZCBhdCBgdGVzdC9maXhVcmxzLmpzYCBhbmQgY2FuIGJlIHJ1biB2aWEgdGhlIGBucG0gdGVzdGAgY29tbWFuZC5cbiAqXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzKSB7XG4gIC8vIGdldCBjdXJyZW50IGxvY2F0aW9uXG4gIHZhciBsb2NhdGlvbiA9IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93LmxvY2F0aW9uO1xuXG4gIGlmICghbG9jYXRpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJmaXhVcmxzIHJlcXVpcmVzIHdpbmRvdy5sb2NhdGlvblwiKTtcbiAgfVxuXG5cdC8vIGJsYW5rIG9yIG51bGw/XG5cdGlmICghY3NzIHx8IHR5cGVvZiBjc3MgIT09IFwic3RyaW5nXCIpIHtcblx0ICByZXR1cm4gY3NzO1xuICB9XG5cbiAgdmFyIGJhc2VVcmwgPSBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIGxvY2F0aW9uLmhvc3Q7XG4gIHZhciBjdXJyZW50RGlyID0gYmFzZVVybCArIGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcL1teXFwvXSokLywgXCIvXCIpO1xuXG5cdC8vIGNvbnZlcnQgZWFjaCB1cmwoLi4uKVxuXHQvKlxuXHRUaGlzIHJlZ3VsYXIgZXhwcmVzc2lvbiBpcyBqdXN0IGEgd2F5IHRvIHJlY3Vyc2l2ZWx5IG1hdGNoIGJyYWNrZXRzIHdpdGhpblxuXHRhIHN0cmluZy5cblxuXHQgL3VybFxccypcXCggID0gTWF0Y2ggb24gdGhlIHdvcmQgXCJ1cmxcIiB3aXRoIGFueSB3aGl0ZXNwYWNlIGFmdGVyIGl0IGFuZCB0aGVuIGEgcGFyZW5zXG5cdCAgICggID0gU3RhcnQgYSBjYXB0dXJpbmcgZ3JvdXBcblx0ICAgICAoPzogID0gU3RhcnQgYSBub24tY2FwdHVyaW5nIGdyb3VwXG5cdCAgICAgICAgIFteKShdICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICB8ICA9IE9SXG5cdCAgICAgICAgIFxcKCAgPSBNYXRjaCBhIHN0YXJ0IHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAoPzogID0gU3RhcnQgYW5vdGhlciBub24tY2FwdHVyaW5nIGdyb3Vwc1xuXHQgICAgICAgICAgICAgICAgIFteKShdKyAgPSBNYXRjaCBhbnl0aGluZyB0aGF0IGlzbid0IGEgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICB8ICA9IE9SXG5cdCAgICAgICAgICAgICAgICAgXFwoICA9IE1hdGNoIGEgc3RhcnQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICAgICAgW14pKF0qICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgIFxcKSAgPSBNYXRjaCBhIGVuZCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgKSAgPSBFbmQgR3JvdXBcbiAgICAgICAgICAgICAgKlxcKSA9IE1hdGNoIGFueXRoaW5nIGFuZCB0aGVuIGEgY2xvc2UgcGFyZW5zXG4gICAgICAgICAgKSAgPSBDbG9zZSBub24tY2FwdHVyaW5nIGdyb3VwXG4gICAgICAgICAgKiAgPSBNYXRjaCBhbnl0aGluZ1xuICAgICAgICkgID0gQ2xvc2UgY2FwdHVyaW5nIGdyb3VwXG5cdCBcXCkgID0gTWF0Y2ggYSBjbG9zZSBwYXJlbnNcblxuXHQgL2dpICA9IEdldCBhbGwgbWF0Y2hlcywgbm90IHRoZSBmaXJzdC4gIEJlIGNhc2UgaW5zZW5zaXRpdmUuXG5cdCAqL1xuXHR2YXIgZml4ZWRDc3MgPSBjc3MucmVwbGFjZSgvdXJsXFxzKlxcKCgoPzpbXikoXXxcXCgoPzpbXikoXSt8XFwoW14pKF0qXFwpKSpcXCkpKilcXCkvZ2ksIGZ1bmN0aW9uKGZ1bGxNYXRjaCwgb3JpZ1VybCkge1xuXHRcdC8vIHN0cmlwIHF1b3RlcyAoaWYgdGhleSBleGlzdClcblx0XHR2YXIgdW5xdW90ZWRPcmlnVXJsID0gb3JpZ1VybFxuXHRcdFx0LnRyaW0oKVxuXHRcdFx0LnJlcGxhY2UoL15cIiguKilcIiQvLCBmdW5jdGlvbihvLCAkMSl7IHJldHVybiAkMTsgfSlcblx0XHRcdC5yZXBsYWNlKC9eJyguKiknJC8sIGZ1bmN0aW9uKG8sICQxKXsgcmV0dXJuICQxOyB9KTtcblxuXHRcdC8vIGFscmVhZHkgYSBmdWxsIHVybD8gbm8gY2hhbmdlXG5cdFx0aWYgKC9eKCN8ZGF0YTp8aHR0cDpcXC9cXC98aHR0cHM6XFwvXFwvfGZpbGU6XFwvXFwvXFwvKS9pLnRlc3QodW5xdW90ZWRPcmlnVXJsKSkge1xuXHRcdCAgcmV0dXJuIGZ1bGxNYXRjaDtcblx0XHR9XG5cblx0XHQvLyBjb252ZXJ0IHRoZSB1cmwgdG8gYSBmdWxsIHVybFxuXHRcdHZhciBuZXdVcmw7XG5cblx0XHRpZiAodW5xdW90ZWRPcmlnVXJsLmluZGV4T2YoXCIvL1wiKSA9PT0gMCkge1xuXHRcdCAgXHQvL1RPRE86IHNob3VsZCB3ZSBhZGQgcHJvdG9jb2w/XG5cdFx0XHRuZXdVcmwgPSB1bnF1b3RlZE9yaWdVcmw7XG5cdFx0fSBlbHNlIGlmICh1bnF1b3RlZE9yaWdVcmwuaW5kZXhPZihcIi9cIikgPT09IDApIHtcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlIHJlbGF0aXZlIHRvIHRoZSBiYXNlIHVybFxuXHRcdFx0bmV3VXJsID0gYmFzZVVybCArIHVucXVvdGVkT3JpZ1VybDsgLy8gYWxyZWFkeSBzdGFydHMgd2l0aCAnLydcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgcmVsYXRpdmUgdG8gY3VycmVudCBkaXJlY3Rvcnlcblx0XHRcdG5ld1VybCA9IGN1cnJlbnREaXIgKyB1bnF1b3RlZE9yaWdVcmwucmVwbGFjZSgvXlxcLlxcLy8sIFwiXCIpOyAvLyBTdHJpcCBsZWFkaW5nICcuLydcblx0XHR9XG5cblx0XHQvLyBzZW5kIGJhY2sgdGhlIGZpeGVkIHVybCguLi4pXG5cdFx0cmV0dXJuIFwidXJsKFwiICsgSlNPTi5zdHJpbmdpZnkobmV3VXJsKSArIFwiKVwiO1xuXHR9KTtcblxuXHQvLyBzZW5kIGJhY2sgdGhlIGZpeGVkIGNzc1xuXHRyZXR1cm4gZml4ZWRDc3M7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3N0eWxlLWxvYWRlci9maXhVcmxzLmpzXG4vLyBtb2R1bGUgaWQgPSA5NDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL1NwYWNlci5sZXNzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHt9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9hZGRTdHlsZXMuanNcIikoY29udGVudCwgb3B0aW9ucyk7XG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2Fscztcbi8vIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnRcbmlmKG1vZHVsZS5ob3QpIHtcblx0Ly8gV2hlbiB0aGUgc3R5bGVzIGNoYW5nZSwgdXBkYXRlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0aWYoIWNvbnRlbnQubG9jYWxzKSB7XG5cdFx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL1NwYWNlci5sZXNzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9TcGFjZXIubGVzc1wiKTtcblx0XHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXHRcdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHRcdH0pO1xuXHR9XG5cdC8vIFdoZW4gdGhlIG1vZHVsZSBpcyBkaXNwb3NlZCwgcmVtb3ZlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvYXBwL1NwYWNlci5sZXNzXG4vLyBtb2R1bGUgaWQgPSA5NDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlcy5sZXNzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHt9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9hZGRTdHlsZXMuanNcIikoY29udGVudCwgb3B0aW9ucyk7XG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2Fscztcbi8vIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnRcbmlmKG1vZHVsZS5ob3QpIHtcblx0Ly8gV2hlbiB0aGUgc3R5bGVzIGNoYW5nZSwgdXBkYXRlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0aWYoIWNvbnRlbnQubG9jYWxzKSB7XG5cdFx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlcy5sZXNzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZXMubGVzc1wiKTtcblx0XHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXHRcdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHRcdH0pO1xuXHR9XG5cdC8vIFdoZW4gdGhlIG1vZHVsZSBpcyBkaXNwb3NlZCwgcmVtb3ZlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvYXBwL3N0eWxlcy5sZXNzXG4vLyBtb2R1bGUgaWQgPSA5NDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy9cbi8vICAjIENsYXNzIHV0aWxpdGllc1xuLy9cblxuLy8gQ2xvbmUgYSBjbGFzcywgcmUtdXNpbmcgdGhlIG9yaWdpbmFsIG5hbWUuXG4vLyBUT0RPOiBtb3ZlIHRvIHV0aWxpdHk/XG5leHBvcnQgZnVuY3Rpb24gY2xvbmVDbGFzcyhjb25zdHJ1Y3RvciwgbmFtZSA9IGNvbnN0cnVjdG9yLm5hbWUpIHtcbiAgLy8gQ2xvbmUgdGhlIGNvbnN0cnVjdG9yLCBrZWVwaW5nIHRoZSBzYW1lIG5hbWVcbiAgZ2xvYmFsLl9fY2xvbmVDbGFzc19fID0gY29uc3RydWN0b3I7XG4gIGNvbnN0IGNsb25lID0gbmV3IEZ1bmN0aW9uKFwibmFtZVwiLCBgcmV0dXJuIGNsYXNzICR7bmFtZX0gZXh0ZW5kcyBfX2Nsb25lQ2xhc3NfXyB7fWApKCk7XG4gIGRlbGV0ZSBnbG9iYWwuX19jbG9uZUNsYXNzX187XG4gIHJldHVybiBjbG9uZTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91dGlscy9jbGFzcy5qcyIsInZhciBzdG9yZSA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpKCd3a3MnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuL191aWQnKTtcbnZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5TeW1ib2w7XG52YXIgVVNFX1NZTUJPTCA9IHR5cGVvZiBTeW1ib2wgPT0gJ2Z1bmN0aW9uJztcblxudmFyICRleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID1cbiAgICBVU0VfU1lNQk9MICYmIFN5bWJvbFtuYW1lXSB8fCAoVVNFX1NZTUJPTCA/IFN5bWJvbCA6IHVpZCkoJ1N5bWJvbC4nICsgbmFtZSkpO1xufTtcblxuJGV4cG9ydHMuc3RvcmUgPSBzdG9yZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3drcy5qc1xuLy8gbW9kdWxlIGlkID0gOTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==