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

			// Note the module that the rule was defined in
			if (this.module) props.module = this.module;

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
				var _imports = [this].concat(this.imports.map(Parser.forModule));

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
		key: "forModule",


		// Get a parser for a given `contextName`.
		// Will re-use existing parser, or create a new one if not already defined.
		value: function forModule(module) {
			if (!Parser.REGISTRY[module]) {
				Parser.REGISTRY[module] = new Parser({ module: module });
			}
			return Parser.REGISTRY[module];
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
var parser = _Parser2.default.forModule("spell");
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
var parser = _Parser2.default.forModule("JSX");
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
var parser = _Parser2.default.forModule("if");
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
var parser = _Parser2.default.forModule("lists");
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
var parser = _Parser2.default.forModule("operators");
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
var parser = _Parser2.default.forModule("statements");
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

var parser = _Parser2.default.forModule("types");
exports.default = parser;


parser.defineRules({
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
var parser = _Parser2.default.forModule("core");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvc3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2ZhaWxzLmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9saWIva2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvc3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY29mLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19saWJyYXJ5LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LXBpZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcG4uanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLWtleS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW50ZWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fd2tzLWV4dC5qcyIsIndlYnBhY2s6Ly8vLi9+L2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL3NyYy9QYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9ldmVudF9oYW5kbGVycy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL21hdGNoX2tleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9wYXJzZV9rZXlzLmpzIiwid2VicGFjazovLy8uL34vc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL1NwZWxsRWRpdG9yLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvcnVsZXMvc3BlbGwvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9FeGFtcGxlU3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL1NwYWNlci5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9UYWJiYWJsZVRleHRBcmVhLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL2luZGV4LmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL3V0aWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21lbW9pemUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL0pTWC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcnVsZXMvc3BlbGwvaWYuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL2xpc3RzLmpzIiwid2VicGFjazovLy8uL3NyYy9ydWxlcy9zcGVsbC9vcGVyYXRvcnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL3N0YXRlbWVudHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL3R5cGVzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9lczYvc3ltYm9sLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY2xhc3NvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY3R4LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faHRtbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faXMtYXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX21ldGEuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1jcmVhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcHMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wbi1leHQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3NldC10by1zdHJpbmctdGFnLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL190by1hYnNvbHV0ZS1pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tbGVuZ3RoLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL193a3MtZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL2VzNi5zeW1ib2wuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9TcGFjZXIubGVzcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL3N0eWxlcy5sZXNzIiwid2VicGFjazovLy8uL3NyYy9ydWxlcy9zcGVsbC9jb3JlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kZXNjcmlwdG9ycy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faGFzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2ZhY3RvcnlXaXRoVGhyb3dpbmdTaGltcy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9jbGFzc19kZWNvcmF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvbWV0aG9kX2RlY29yYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9tZXRob2RfZGVjb3JhdG9yX3Njb3BlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9hcnJheS5mcm9tLmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvZG9tX2hlbHBlcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9saXN0ZW5lcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi91dWlkLmpzIiwid2VicGFjazovLy8uL3NyYy9SdWxlLmpzIiwid2VicGFjazovLy8uL3NyYy9SdWxlU3ludGF4LmpzIiwid2VicGFjazovLy8uL3NyYy9Ub2tlbml6ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2lzLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdWlkLmpzIiwid2VicGFjazovLy8uL34vc3R5bGUtbG9hZGVyL2ZpeFVybHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9TcGFjZXIubGVzcz8wOGRlIiwid2VicGFjazovLy8uL3NyYy9hcHAvc3R5bGVzLmxlc3M/YjdlNyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvY2xhc3MuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3drcy5qcyJdLCJuYW1lcyI6WyJpc1doaXRlc3BhY2UiLCJwbHVyYWxpemUiLCJpc1BsdXJhbCIsInNpbmd1bGFyaXplIiwiaXNTaW5ndWxhciIsImdldFRhYnMiLCJBTExfV0hJVEVTUEFDRSIsInRleHQiLCJ0ZXN0Iiwid29yZCIsInJlcGxhY2UiLCJUQUJTIiwibnVtYmVyIiwic3Vic3RyIiwiYWxsRXhwb3J0cyIsImV4cG9ydHMiLCJnbG9iYWwiLCJTVFJJTkciLCJnbG9iYWxfaWRlbnRpZmllciIsIndpbmRvdyIsInNlbGYiLCJQYXJzZUVycm9yIiwiY29uc29sZSIsImdyb3VwIiwibG9nIiwiZ3JvdXBFbmQiLCJhcmdzIiwiRXJyb3IiLCJhcHBseSIsImNhcHR1cmVTdGFja1RyYWNlIiwicHJvdG90eXBlIiwiUGFyc2VyIiwicHJvcGVydGllcyIsImltcG9ydHMiLCJfcnVsZXMiLCJPYmplY3QiLCJhc3NpZ24iLCJydWxlTmFtZSIsImFyZ3VtZW50cyIsImxlbmd0aCIsIlRJTUUiLCJ0aW1lIiwidG9rZW5zIiwiVG9rZW5pemVyIiwidG9rZW5pemUiLCJmaWx0ZXIiLCJpc05vcm1hbFdoaXRlc3BhY2UiLCJ0b2tlbiIsInRpbWVFbmQiLCJ1bmRlZmluZWQiLCJyZW1vdmVMZWFkaW5nV2hpdGVzcGFjZSIsInJlc3VsdCIsInBhcnNlTmFtZWRSdWxlIiwicGFyc2UiLCJ0b1NvdXJjZSIsInN0YXJ0IiwiZW5kIiwic3RhY2siLCJjYWxsaW5nQ29udGV4dCIsInJ1bGUiLCJydWxlcyIsInJldmVyc2UiLCJjb25jYXQiLCJfX3J1bGVzIiwibWFwIiwiZXhpc3RpbmciLCJSdWxlIiwiQWx0ZXJuYXRpdmVzIiwiYWx0Q29uc3RydWN0b3IiLCJhZGRSdWxlIiwiQXJyYXkiLCJpc0FycmF5IiwiZm9yRWFjaCIsIl9tZXJnZVJ1bGUiLCJyZWR1Y2UiLCJibGFja2xpc3QiLCJkZWZpbmVSdWxlIiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIm5hbWUiLCJUeXBlRXJyb3IiLCJtb2R1bGUiLCJjYW5vbmljYWwiLCJrZXkiLCJrZXlzIiwiZGVmaW5lUHJvcGVydHkiLCJ2YWx1ZSIsInN5bnRheCIsIm5hbWVzIiwiYWxpYXMiLCJ0ZXN0cyIsInB1c2giLCJvdXRwdXQiLCJmb3JNb2R1bGUiLCJwYXJzZXIiLCJSRUdJU1RSWSIsInN0YXJ0VG9rZW4iLCJlbmRUb2tlbiIsIm5lc3RpbmciLCJuZXN0ZWQiLCJsYXN0SW5kZXgiLCJzbGljZSIsIkRFQlVHIiwiV0FSTiIsIlNwZWxsRWRpdG9yIiwib2JzZXJ2ZXIiLCJleGFtcGxlcyIsImxvYWQiLCJzcGVsbEVkaXRvciIsInNhdmUiLCJyZXZlcnQiLCJjb21waWxlIiwiY3JlYXRlIiwiZGVsZXRlIiwicmVuYW1lIiwiZHVwbGljYXRlIiwicmVzZXQiLCJ0aXRsZXMiLCJzZWxlY3RlZCIsImRpcnR5IiwiY29kZSIsIm9wdGlvbnMiLCJ0aXRsZSIsImNvbnRlbnQiLCJvbkNsaWNrIiwic2VsZWN0IiwiZGlydHlCdXR0b25zIiwicG9zaXRpb24iLCJyaWdodCIsInRvcCIsIm1hcmdpbiIsImNvbXBpbGVCdXR0b24iLCJ3aWR0aCIsImxlZnQiLCJoZWlnaHQiLCJwYWRkaW5nVG9wIiwiZXZlbnQiLCJ1cGRhdGUiLCJ0YXJnZXQiLCJSZWFjdCIsIkNvbXBvbmVudCIsImRlZmF1bHRQcm9wcyIsIkV4YW1wbGVTdG9yZSIsImltcG9ydCIsImJpbmQiLCJsb2NhbFN0b3JhZ2UiLCJzcGVsbEVkaXRvckV4YW1wbGVzIiwic3BlbGxFZGl0b3JFeGFtcGxlIiwibG9jYXRpb24iLCJyZWxvYWQiLCJKU09OIiwiX3NhdmVkRXhhbXBsZXMiLCJzdHJpbmdpZnkiLCJleGFtcGxlIiwic2tpcFNhdmUiLCJzaG93Q29uZmlybSIsImNvbmZpcm0iLCJwcm9tcHQiLCJvbGROYW1lIiwibmV3TmFtZSIsIndhcm4iLCJzZXRUaW1lb3V0IiwiaW5mbyIsIm9ic2VydmFibGUiLCJjb21wdXRlZCIsIlNwYWNlciIsImNsYXNzTmFtZSIsImFwcGVhcmFuY2UiLCJzaXplIiwiaW5saW5lIiwiZmx1aWQiLCJ0aW55Iiwic21hbGwiLCJtZWRpdW0iLCJsYXJnZSIsImh1Z2UiLCJtYXNzaXZlIiwic3BhY2VyUHJvcHMiLCJzdHlsZSIsInByb3BUeXBlcyIsIlByb3BUeXBlcyIsInN0cmluZyIsImJvb2wiLCJUYWJiYWJsZVRleHRBcmVhIiwib25LZXlEb3duIiwia2V5Q29kZSIsInByZXZlbnREZWZhdWx0IiwiZWxlbWVudCIsInNlbGVjdGlvblN0YXJ0Iiwic2VsZWN0aW9uRW5kIiwibmV3VGV4dCIsInNoaWZ0S2V5IiwibGFzdEluZGV4T2YiLCJpbmRleE9mIiwibGluZXMiLCJzcGxpdCIsImxpbmUiLCJqb2luIiwib25DaGFuZ2UiLCJUZXh0QXJlYSIsIlJlYWN0RE9NIiwicmVuZGVyIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImNsYXNzTmFtZXMiLCJhcmciLCJCb29sZWFuIiwibWVtb2l6ZWQiLCJkZWZpbmVNZW1vaXplZCIsInByb3BlcnR5IiwiZ2V0dGVyIiwiY29uZmlndXJhYmxlIiwiZ2V0IiwiZGVmaW5lUnVsZXMiLCJKU1hFbGVtZW50IiwiY2xvbmUiLCJtYXRjaGVkIiwibmV4dFN0YXJ0IiwianN4RWxlbWVudCIsImF0dHJpYnV0ZXMiLCJhdHRycyIsIkpTWEV4cHJlc3Npb24iLCJqc3hFeHByZXNzaW9uVG9Tb3VyY2UiLCJjaGlsZHJlbiIsImNoaWxkIiwidHJpbSIsImNoaWxkU291cmNlIiwianN4RWxlbWVudFRvU291cmNlIiwiU3ludGF4RXJyb3IiLCJqc3hFeHByZXNzaW9uIiwidGFnTmFtZSIsImF0dHJzVG9Tb3VyY2UiLCJjaGlsZHJlblRvU291cmNlIiwicmVzdWx0cyIsImNvbmRpdGlvbiIsInN0YXRlbWVudCIsImJsb2NrIiwic3RhdGVtZW50cyIsIkJsb2NrIiwiZW5jbG9zZVN0YXRlbWVudHMiLCJCbG9ja1N0YXRlbWVudCIsImxlZnRSZWN1cnNpdmUiLCJ0ZXN0UnVsZSIsIktleXdvcmRzIiwibGl0ZXJhbHMiLCJlbHNlU3RhdGVtZW50IiwiU2VxdWVuY2UiLCJsaXN0IiwiaWRlbnRpZmllciIsInRoaW5nIiwiZXhwcmVzc2lvbiIsImFyZ3VtZW50IiwibWF0Y2giLCJvcGVyYXRvciIsImJhbmciLCJpdGVtIiwiaXRlbVZhciIsInBvc2l0aW9uVmFyIiwibGhzIiwicmhzIiwiX29wZXJhdG9yIiwicHJlY2VkZW5jZSIsImEiLCJiIiwidHlwZSIsIlN5bWJvbHMiLCJtZXNzYWdlIiwib2tCdXR0b24iLCJjYW5jZWxCdXR0b24iLCJzdHJ1Y3R1cmUiLCJzdXBlclR5cGUiLCJzdWJUeXBlIiwidHlwZXMiLCJjb25kaXRpb25zIiwia2V5d29yZHMiLCJrZXl3b3JkTWF0Y2hlcyIsImtleXdvcmQiLCJUeXBlIiwiZXJyb3IiLCJpbmRleCIsInRvTG93ZXJDYXNlIiwic3RhcnRzV2l0aCIsIm1hdGNoZWRUZXh0Iiwic2NvcGUiLCJkZWNsYXJhdGlvbiIsImRhdGFUeXBlIiwicGx1cmFsIiwicHJvcGVydGllc18iLCJfcHJvcGVydGllcyIsInByb3AiLCJMaXN0IiwiX2FyZ3MiLCJTdGF0ZW1lbnRzIiwiQ29tbWVudCIsInBhdHRlcm4iLCJQYXR0ZXJuIiwiTnVtYmVyIiwiTlVNQkVSX05BTUVTIiwiemVybyIsIm9uZSIsInR3byIsInRocmVlIiwiZm91ciIsImZpdmUiLCJzaXgiLCJzZXZlbiIsImVpZ2h0IiwibmluZSIsInRlbiIsIlRleHQiLCJxdW90ZWRTdHJpbmciLCJlbmRzV2l0aCIsImNvbXBpbGVBcyIsIkxpdGVyYWxzIiwibWF0Y2hlc1N0YXJ0aW5nQXQiLCJsaXRlcmFsU2VwYXJhdG9yIiwiZmlyc3QiLCJldmVyeSIsImxpdGVyYWwiLCJpIiwib3B0aW9uYWwiLCJzb21lIiwic291cmNlIiwiU3VicnVsZSIsIm1hdGNoZWRSdWxlIiwic3VicnVsZSIsImluY2x1ZGVzIiwidG9TeW50YXgiLCJhZGRSZXN1bHRzIiwiY29tbWVudCIsInByb21vdGUiLCJzb3VyY2VOYW1lIiwibWF0Y2hOYW1lIiwibWF0Y2hlcyIsImJlc3RNYXRjaCIsImdldEJlc3RNYXRjaCIsImJlc3QiLCJjdXJyZW50IiwiUmVwZWF0IiwicmVwZWF0IiwiaXNDb21wb3VuZFJ1bGUiLCJkZWxpbWl0ZXIiLCJpbmRlbnQiLCJjb250ZW50cyIsIkJsYW5rTGluZSIsImxhc3QiLCJwYXJzZUJsb2NrIiwicGFyc2VTdGF0ZW1lbnQiLCJXaGl0ZXNwYWNlIiwiU3RhdGVtZW50UGFyc2VFcnJvciIsInVucGFyc2VkIiwicGFyc2VkIiwiZSIsImJsb2NrVG9Tb3VyY2UiLCJfbmFtZSIsIl9zdXBlclR5cGUiLCJuYW1lZCIsIm1ldGhvZHMiLCJvdGhlciIsInRvU3RydWN0dXJlIiwiYWRkU3RydWN0dXJlIiwiYnJlYWtJbnRvQmxvY2tzIiwiX2Jsb2NrIiwid2hpdGVzcGFjZSIsInBhcnNlUnVsZSIsInBhcnNlU3ludGF4IiwiYWx0Q2xhc3MiLCJ0b2tlbmlzZVJ1bGVTeW50YXgiLCJTWU5UQVhfRVhQUkVTU0lPTiIsInN5bnRheFN0cmVhbSIsInBhcnNlVG9rZW4iLCJwb3AiLCJLRVlXT1JEX1BBVFRFUk4iLCJzeW50YXhUb2tlbiIsInBhcnNlU3ltYm9sIiwicGFyc2VTdWJydWxlIiwicGFyc2VBbHRlcm5hdGl2ZXMiLCJwYXJzZUxpc3QiLCJwYXJzZVJlcGVhdCIsInBhcnNlS2V5d29yZCIsIm5leHQiLCJpc0VzY2FwZWQiLCJmaW5kTmVzdGVkVG9rZW5zIiwiYWx0ZXJuYXRpdmVzIiwiZ3JvdXBBbHRlcm5hdGl2ZXMiLCJzeW1ib2wiLCJwYXJhbXMiLCJiYW5nUG9zaXRpb24iLCJub3QiLCJuZXdsaW5lIiwiSW5kZW50IiwiTkVXTElORSIsImVhdFRva2VucyIsIm1hdGNoVG9wVG9rZW5zIiwibWV0aG9kIiwiY2FsbCIsIm1hdGNoV2hpdGVzcGFjZSIsIm1hdGNoV29yZCIsIm1hdGNoTnVtYmVyIiwibWF0Y2hOZXdsaW5lIiwibWF0Y2hKU1hFbGVtZW50IiwibWF0Y2hUZXh0IiwibWF0Y2hDb21tZW50IiwibWF0Y2hTeW1ib2wiLCJlYXRXaGl0ZXNwYWNlIiwid2hpdGVTcGFjZUVuZCIsIndoaXRlc3BhY2VFbmQiLCJXT1JEX1NUQVJUIiwiV09SRF9DSEFSIiwid29yZEVuZCIsIk5VTUJFUl9TVEFSVCIsIk5VTUJFUiIsIm51bWJlck1hdGNoIiwibWF0Y2hFeHByZXNzaW9uQXRIZWFkIiwibnVtYmVyU3RyIiwicGFyc2VGbG9hdCIsInF1b3RlU3ltYm9sIiwidGV4dEVuZCIsImNoYXIiLCJDT01NRU5UIiwiY29tbWVudFN0YXJ0IiwiZ2V0TGluZUF0SGVhZCIsImNvbW1lbnRNYXRjaCIsImNvbW1lbnRTeW1ib2wiLCJtYXRjaEpTWFN0YXJ0VGFnIiwiaXNVbmFyeVRhZyIsIm1hdGNoSlNYQ2hpbGRyZW4iLCJjaGlsZEVuZCIsIkpTWF9UQUdfU1RBUlQiLCJ0YWdNYXRjaCIsImVuZEJpdCIsIm1hdGNoSlNYQXR0cmlidXRlIiwiYXR0ckVuZCIsImF0dHJzQXNTdHJpbmciLCJjaGlsZHJlbkFzU3RyaW5nIiwiYXR0ciIsImVuZFRhZyIsIm1hdGNoSlNYQ2hpbGQiLCJtYXRjaEpTWEVuZFRhZyIsIm1hdGNoSlNYRXhwcmVzc2lvbiIsIm1hdGNoSlNYVGV4dCIsIm1hdGNoU3RyaW5nQXRIZWFkIiwiSlNYX0FUVFJJQlVURV9TVEFSVCIsImVxdWFscyIsImF0dHJpYnV0ZSIsIkpTWEF0dHJpYnV0ZSIsIm1hdGNoSlNYQXR0cmlidXRlVmFsdWUiLCJ2YWx1ZUVuZCIsIm1hdGNoSlNYQXR0cmlidXRlVmFsdWVJZGVudGlmaWVyIiwiZW5kSW5kZXgiLCJmaW5kTWF0Y2hpbmdBdEhlYWQiLCJKU1hfVEVYVF9FTkRfQ0hBUlMiLCJmaW5kRmlyc3RBdEhlYWQiLCJqc3hUZXh0Iiwic3RyaW5nRW5kIiwiaGVhZCIsInN0YXJ0RGVsaW1pdGVyIiwiZW5kRGVsaW1pdGVyIiwiYWZ0ZXJRdW90ZSIsImNoYXJzIiwicmVtb3ZlTm9ybWFsV2hpdGVzcGFjZSIsImJyZWFrSW50b0xpbmVzIiwiY3VycmVudExpbmUiLCJnZXRMaW5lSW5kZW50cyIsImRlZmF1bHRJbmRlbnQiLCJpbmRlbnRzIiwiZ2V0TGluZUluZGVudCIsInN0YXJ0SW5kZW50IiwiZ2V0TmV4dEluZGVudCIsIm1heEluZGVudCIsIk1hdGgiLCJtaW4iLCJsaW5lSW5kZW50IiwibmV3QmxvY2siLCJjbG9uZUNsYXNzIiwiX19jbG9uZUNsYXNzX18iLCJGdW5jdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7UUFJZ0JBLFksR0FBQUEsWTtRQU9BQyxT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OztBQUFBO0FBQUEsSUFBbUNYLGVBQUtpTCxRQUF4QztBQUhGLENBN0NGLEVBcURFO0FBQ0VwSyxRQUFNLFNBRFI7QUFFRVEsVUFBUSxPQUZWO0FBR0VWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNYLGVBQUtpTCxRQUF4QztBQUhGLENBckRGLEVBNkRFO0FBQ0VwSyxRQUFNLFNBRFI7QUFFRVEsVUFBUSxRQUZWO0FBR0VWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNYLGVBQUtpTCxRQUF4QztBQUhGLENBN0RGLEVBcUVFO0FBQ0VwSyxRQUFNLFNBRFI7QUFFRVEsVUFBUSxPQUZWO0FBR0VWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNYLGVBQUtpTCxRQUF4QztBQUhGLENBckVGLEVBNkVFO0FBQ0VwSyxRQUFNLFNBRFI7QUFFRVEsVUFBUSxPQUZWO0FBR0VWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNYLGVBQUtpTCxRQUF4QztBQUhGLENBN0VGLEVBcUZFO0FBQ0VwSyxRQUFNLFNBRFI7QUFFRVEsVUFBUSxTQUZWO0FBR0VWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNYLGVBQUtpTCxRQUF4QztBQUhGLENBckZGLEVBNkZFO0FBQ0VwSyxRQUFNLFNBRFI7QUFFRVEsVUFBUSxRQUZWO0FBR0VWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNYLGVBQUtpTCxRQUF4QztBQUhGLENBN0ZGLEVBcUdFO0FBQ0VwSyxRQUFNLFNBRFI7QUFFRVEsVUFBUSxPQUZWO0FBR0VWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNYLGVBQUtpTCxRQUF4QztBQUhGLENBckdGLEVBNkdFO0FBQ0VwSyxRQUFNLFNBRFI7QUFFRVEsVUFBUSxPQUZWO0FBR0VWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sRUFBUDtBQUFXO0FBRDFCOztBQUFBO0FBQUEsSUFBbUNYLGVBQUtpTCxRQUF4QztBQUhGLENBN0dGLEVBcUhFO0FBQ0VwSyxRQUFNLFNBRFI7QUFFRVEsVUFBUSxhQUZWO0FBR0VWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBQyxDQUFSO0FBQVc7QUFEMUI7O0FBQUE7QUFBQSxJQUFtQ1gsZUFBS2lMLFFBQXhDO0FBSEYsQ0FySEYsRUE2SEU7QUFDRXBLLFFBQU0sU0FEUjtBQUVFUSxVQUFRLE9BRlY7QUFHRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUUsZUFBTyxDQUFDLENBQVI7QUFBVztBQUQxQjs7QUFBQTtBQUFBLElBQW1DWCxlQUFLaUwsUUFBeEM7QUFIRixDQTdIRixFQXFJRTtBQUNFcEssUUFBTSxTQURSO0FBRUVRLFVBQVEsTUFGVjtBQUdFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBRSxlQUFPLENBQUMsQ0FBUjtBQUFXO0FBRDFCOztBQUFBO0FBQUEsSUFBbUNYLGVBQUtpTCxRQUF4QztBQUhGLENBcklGOztBQStJRTtBQUNBO0FBQ0E7QUFDRXBLLFFBQU0sU0FEUjtBQUVFUSxVQUFRLEtBRlY7QUFHRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUUsZUFBTyxDQUFQO0FBQVU7QUFEekI7O0FBQUE7QUFBQSxJQUFtQ1gsZUFBS2lMLFFBQXhDO0FBSEYsQ0FqSkYsRUF5SkU7QUFDRXBLLFFBQU0sU0FEUjtBQUVFUSxVQUFRLFFBRlY7QUFHRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUUsZUFBTyxDQUFDLENBQVI7QUFBVztBQUQxQjs7QUFBQTtBQUFBLElBQW1DWCxlQUFLaUwsUUFBeEM7QUFIRixDQXpKRjs7QUFtS0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFcEssUUFBTSxxQkFEUjtBQUVFVSxTQUFPLFlBRlQ7QUFHRUYsVUFBUSxDQUNOLDJEQURNLEVBRU4sNERBRk0sQ0FIVjtBQU9FVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx3QkFDa0MsS0FBSzRKLE9BRHZDO0FBQUEsWUFDSGUsVUFERyxhQUNIQSxVQURHO0FBQUEsWUFDU3pILFFBRFQsYUFDU0EsUUFEVDtBQUFBLFlBQ21CMkgsVUFEbkIsYUFDbUJBLFVBRG5CO0FBRVQ7O0FBQ0EsWUFBSSxPQUFPM0gsUUFBUCxLQUFvQixRQUFwQixJQUFnQ0EsV0FBVyxDQUEvQyxFQUFrRDtBQUNoRCxpQkFBVTJILFVBQVYsVUFBd0IzSCxXQUFXLENBQW5DO0FBQ0Q7QUFDRCxrQ0FBd0IySCxVQUF4QixVQUF1QzNILFFBQXZDO0FBQ0Q7QUFSSDs7QUFBQTtBQUFBLElBQStDN0QsZUFBS29MLFFBQXBEO0FBUEYsQ0FoTEY7O0FBb01FO0FBQ0E7QUFDQTtBQUNBO0FBQ0V2SyxRQUFNLDRCQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFRixVQUFRLDZEQUhWO0FBSUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLFlBQ0gwSyxJQURHLEdBQ00sS0FBS2QsT0FEWCxDQUNIYyxJQURHOztBQUVULDBDQUFnQ0EsSUFBaEM7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBc0RyTCxlQUFLb0wsUUFBM0Q7QUFKRixDQXZNRjs7QUFtTkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0V2SyxRQUFNLDZCQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFRixVQUFRLG9FQUhWO0FBSUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHdCQUNjLEtBQUs0SixPQURuQjtBQUFBLFlBQ0g3TixNQURHLGFBQ0hBLE1BREc7QUFBQSxZQUNLMk8sSUFETCxhQUNLQSxJQURMOztBQUVULDJDQUFpQ0EsSUFBakMsVUFBMEMzTyxNQUExQztBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUF1RHNELGVBQUtvTCxRQUE1RDtBQUpGLENBeE5GOztBQXFPRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0V2SyxRQUFNLGtCQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFRixVQUFRLDBFQUhWO0FBSUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHdCQUNrQixLQUFLNEosT0FEdkI7QUFBQSxZQUNIbEwsS0FERyxhQUNIQSxLQURHO0FBQUEsWUFDSUMsR0FESixhQUNJQSxHQURKO0FBQUEsWUFDUytMLElBRFQsYUFDU0EsSUFEVDs7QUFFVCxtQ0FBeUJBLElBQXpCLFVBQWtDaE0sS0FBbEMsVUFBNENDLEdBQTVDO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQTRDVSxlQUFLb0wsUUFBakQ7QUFKRixDQTVPRjs7QUF3UEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxnQkFEUjtBQUVFVSxTQUFPLFlBRlQ7QUFHRUYsVUFBUSxrRUFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx3QkFDYyxLQUFLNEosT0FEbkI7QUFBQSxZQUNIN04sTUFERyxhQUNIQSxNQURHO0FBQUEsWUFDSzJPLElBREwsYUFDS0EsSUFETDs7QUFFVCxtQ0FBeUJBLElBQXpCLGFBQXFDM08sTUFBckM7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBNENzRCxlQUFLb0wsUUFBakQ7QUFKRixDQTVQRjs7QUF3UUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxlQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFRixVQUFRLGlFQUhWO0FBSUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHdCQUNjLEtBQUs0SixPQURuQjtBQUFBLFlBQ0g3TixNQURHLGFBQ0hBLE1BREc7QUFBQSxZQUNLMk8sSUFETCxhQUNLQSxJQURMOztBQUVULHNDQUE0QkEsSUFBNUIsYUFBd0MzTyxNQUF4QztBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUE0Q3NELGVBQUtvTCxRQUFqRDtBQUpGLENBNVFGOztBQXlSRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0V2SyxRQUFNLGtCQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFRixVQUFRLHlFQUhWO0FBSUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHdCQUNhLEtBQUs0SixPQURsQjtBQUFBLFlBQ0hnQixLQURHLGFBQ0hBLEtBREc7QUFBQSxZQUNJRixJQURKLGFBQ0lBLElBREo7O0FBRVQsbUNBQXlCQSxJQUF6QiwyQkFBbURFLEtBQW5ELFVBQTZERixJQUE3RDtBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUE0Q3JMLGVBQUtvTCxRQUFqRDtBQUpGLENBN1JGOztBQTBTRTtBQUNBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxhQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFRixVQUFRLHFFQUhWO0FBSUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHdCQUM2QixLQUFLNEosT0FEbEM7QUFBQSxZQUNIZSxVQURHLGFBQ0hBLFVBREc7QUFBQSxZQUNTZCxTQURULGFBQ1NBLFNBRFQ7QUFBQSxZQUNvQmEsSUFEcEIsYUFDb0JBLElBRHBCO0FBRVQ7O0FBQ0EsWUFBSUksV0FBVyx5QkFBWUgsV0FBV2xNLFFBQVgsRUFBWixDQUFmO0FBQ0EsaUNBQXVCaU0sSUFBdkIsVUFBZ0NJLFFBQWhDLFlBQStDakIsU0FBL0M7QUFDRDtBQU5IOztBQUFBO0FBQUEsSUFBdUN4SyxlQUFLb0wsUUFBNUM7QUFKRixDQTdTRjs7QUE0VEU7QUFDQTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sc0JBRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VGLFVBQVEsMEdBSFY7QUFJRTBKLGlCQUFlLElBSmpCO0FBS0VDLFlBQVUsSUFBSWhMLGVBQUtpTCxRQUFULENBQWtCLEVBQUVTLE9BQU8sT0FBVCxFQUFsQixDQUxaO0FBTUUvSztBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx5QkFDb0MsS0FBSzRKLE9BRHpDO0FBQUEsWUFDSGUsVUFERyxjQUNIQSxVQURHO0FBQUEsWUFDU0ssUUFEVCxjQUNTQSxRQURUO0FBQUEsWUFDbUJoTixNQURuQixjQUNtQkEsTUFEbkI7QUFBQSxZQUMyQjBNLElBRDNCLGNBQzJCQSxJQUQzQjs7QUFFVCxZQUFJTyxPQUFPRCxhQUFhLEtBQWIsR0FBcUIsRUFBckIsR0FBMEIsR0FBckM7QUFDQTtBQUNBLFlBQUlGLFdBQVcseUJBQVlILFdBQVdsTSxRQUFYLEVBQVosQ0FBZjtBQUNBLGVBQVV3TSxJQUFWLGtCQUEyQlAsSUFBM0IsVUFBb0NJLFFBQXBDLFlBQW1EOU0sTUFBbkQ7QUFDRDtBQVBIOztBQUFBO0FBQUEsSUFBZ0RxQixlQUFLb0wsUUFBckQ7QUFORixDQS9URjs7QUFnVkU7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxhQURSO0FBRUVVLFNBQU8sV0FGVDtBQUdFRixVQUFRLENBQ04sZ0RBRE0sRUFFTiw4REFGTSxDQUhWO0FBT0VWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHlCQUNhLEtBQUs0SixPQURsQjtBQUFBLFlBQ0hnQixLQURHLGNBQ0hBLEtBREc7QUFBQSxZQUNJRixJQURKLGNBQ0lBLElBREo7O0FBRVQsaUNBQXVCQSxJQUF2QixVQUFnQ0UsS0FBaEM7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBdUN2TCxlQUFLb0wsUUFBNUM7QUFQRixDQXRWRjs7QUFxV0U7QUFDQTtBQUNBO0FBQ0V2SyxRQUFNLGNBRFI7QUFFRVUsU0FBTyxXQUZUO0FBR0VGLFVBQVEsQ0FDTixpREFETSxFQUVOLHNFQUZNLENBSFY7QUFPRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEseUJBQ2EsS0FBSzRKLE9BRGxCO0FBQUEsWUFDSGdCLEtBREcsY0FDSEEsS0FERztBQUFBLFlBQ0lGLElBREosY0FDSUEsSUFESjs7QUFFVCxrQ0FBd0JBLElBQXhCLFVBQWlDRSxLQUFqQztBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUF3Q3ZMLGVBQUtvTCxRQUE3QztBQVBGLENBdldGOztBQXNYRTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sYUFEUjtBQUVFVSxTQUFPLFdBRlQ7QUFHRUYsVUFBUSwrRUFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx5QkFDdUIsS0FBSzRKLE9BRDVCO0FBQUEsWUFDSGdCLEtBREcsY0FDSEEsS0FERztBQUFBLFlBQ0kxSCxRQURKLGNBQ0lBLFFBREo7QUFBQSxZQUNjd0gsSUFEZCxjQUNjQSxJQURkOztBQUVULGlDQUF1QkEsSUFBdkIsVUFBZ0N4SCxRQUFoQyxVQUE2QzBILEtBQTdDO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQXVDdkwsZUFBS29MLFFBQTVDO0FBSkYsQ0F4WEY7O0FBcVlFOztBQUVBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxnQkFEUjtBQUVFVSxTQUFPLFdBRlQ7QUFHRUYsVUFBUSxxRUFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx5QkFDbUIsS0FBSzRKLE9BRHhCO0FBQUEsWUFDSGdCLEtBREcsY0FDSEEsS0FERztBQUFBLFlBQ0lNLElBREosY0FDSUEsSUFESjtBQUFBLFlBQ1VSLElBRFYsY0FDVUEsSUFEVjs7QUFFVCxpQ0FBdUJBLElBQXZCLDJCQUFpREEsSUFBakQsVUFBMERRLElBQTFELFdBQW9FTixLQUFwRTtBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUEwQ3ZMLGVBQUtvTCxRQUEvQztBQUpGLENBellGOztBQXFaRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sWUFEUjtBQUVFVSxTQUFPLFdBRlQ7QUFHRUYsVUFBUSxpQ0FIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSxZQUNIMEssSUFERyxHQUNNLEtBQUtkLE9BRFgsQ0FDSGMsSUFERzs7QUFFVCxnQ0FBc0JBLElBQXRCO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQXNDckwsZUFBS29MLFFBQTNDO0FBSkYsQ0E1WkY7O0FBd2FFO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxzQkFEUjtBQUVFVSxTQUFPLFdBRlQ7QUFHRUYsVUFBUSw4REFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx5QkFDYyxLQUFLNEosT0FEbkI7QUFBQSxZQUNIN04sTUFERyxjQUNIQSxNQURHO0FBQUEsWUFDSzJPLElBREwsY0FDS0EsSUFETDs7QUFFVCxxQ0FBMkJBLElBQTNCLFVBQW9DM08sTUFBcEM7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBZ0RzRCxlQUFLb0wsUUFBckQ7QUFKRixDQTFhRjs7QUFzYkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxtQkFEUjtBQUVFVSxTQUFPLFdBRlQ7QUFHRUYsVUFBUSxpRkFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx5QkFDa0IsS0FBSzRKLE9BRHZCO0FBQUEsWUFDSGxMLEtBREcsY0FDSEEsS0FERztBQUFBLFlBQ0lDLEdBREosY0FDSUEsR0FESjtBQUFBLFlBQ1MrTCxJQURULGNBQ1NBLElBRFQ7O0FBRVQsc0NBQTRCQSxJQUE1QixVQUFxQ2hNLEtBQXJDLFVBQStDQyxHQUEvQztBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUFnRFUsZUFBS29MLFFBQXJEO0FBSkYsQ0ExYkY7O0FBdWNFO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxhQURSO0FBRUVVLFNBQU8sV0FGVDtBQUdFRixVQUFRLGtEQUhWO0FBSUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHlCQUNhLEtBQUs0SixPQURsQjtBQUFBLFlBQ0hnQixLQURHLGNBQ0hBLEtBREc7QUFBQSxZQUNJRixJQURKLGNBQ0lBLElBREo7O0FBRVQsaUNBQXVCQSxJQUF2QixVQUFnQ0UsS0FBaEM7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBdUN2TCxlQUFLb0wsUUFBNUM7QUFKRixDQXpjRjs7QUFxZEU7QUFDQTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sbUJBRFI7QUFFRVUsU0FBTyxXQUZUO0FBR0VGLFVBQVEsaUZBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEseUJBQzZCLEtBQUs0SixPQURsQztBQUFBLFlBQ0hlLFVBREcsY0FDSEEsVUFERztBQUFBLFlBQ1NkLFNBRFQsY0FDU0EsU0FEVDtBQUFBLFlBQ29CYSxJQURwQixjQUNvQkEsSUFEcEI7QUFFVDs7QUFDQSxZQUFJSSxXQUFXLHlCQUFZSCxXQUFXbE0sUUFBWCxFQUFaLENBQWY7QUFDQSxzQ0FBNEJpTSxJQUE1QixVQUFxQ0ksUUFBckMsWUFBb0RqQixTQUFwRDtBQUNEO0FBTkg7O0FBQUE7QUFBQSxJQUE2Q3hLLGVBQUtvTCxRQUFsRDtBQUpGLENBeGRGOztBQXVlRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0V2SyxRQUFNLGNBRFI7QUFFRVUsU0FBTyxXQUZUO0FBR0VGLFVBQVEsMkJBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsWUFDSDBLLElBREcsR0FDTSxLQUFLZCxPQURYLENBQ0hjLElBREc7O0FBRVQsa0NBQXdCQSxJQUF4QjtBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUF3Q3JMLGVBQUtvTCxRQUE3QztBQUpGLENBN2VGOztBQXlmRTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sY0FEUjtBQUVFVSxTQUFPLFdBRlQ7QUFHRUYsVUFBUSx1Q0FIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSxZQUNIMEssSUFERyxHQUNNLEtBQUtkLE9BRFgsQ0FDSGMsSUFERzs7QUFFVCxrQ0FBd0JBLElBQXhCO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQXdDckwsZUFBS29MLFFBQTdDO0FBSkYsQ0EzZkY7O0FBd2dCRTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sZ0JBRFI7QUFFRVUsU0FBTyxXQUZUO0FBR0VGLFVBQVEsQ0FDTixzRUFETSxFQUVOLHVHQUZNLENBSFY7QUFPRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEseUJBQzhDLEtBQUs0SixPQURuRDtBQUFBLFlBQ0h1QixPQURHLGNBQ0hBLE9BREc7QUFBQSxZQUNNQyxXQUROLGNBQ01BLFdBRE47QUFBQSxZQUNtQlYsSUFEbkIsY0FDbUJBLElBRG5CO0FBQUEsWUFDeUJaLFNBRHpCLGNBQ3lCQSxTQUR6QjtBQUFBLFlBQ29DQyxLQURwQyxjQUNvQ0EsS0FEcEM7O0FBRVQsWUFBSWhKLGVBQUo7QUFDQSxZQUFJcUssV0FBSixFQUFpQjtBQUNmckssaUNBQXFCcUssV0FBckIsbUJBQThDRCxPQUE5QyxXQUEyRFQsSUFBM0QsU0FBbUVVLFdBQW5FLGFBQXNGQSxXQUF0RixZQUF3R1YsSUFBeEcsaUJBQXdIVSxXQUF4SDtBQUNELFNBRkQsTUFHSztBQUNIO0FBQ0FySyxpQ0FBcUJvSyxPQUFyQixZQUFtQ1QsSUFBbkM7QUFDRDtBQUNEM0osa0JBQVUxQixlQUFLNEssS0FBTCxDQUFXQyxpQkFBWCxDQUE2QkosU0FBN0IsRUFBd0NDLEtBQXhDLENBQVY7QUFDQSxlQUFPaEosTUFBUDtBQUNEO0FBYkg7O0FBQUE7QUFBQSxJQUEwQzFCLGVBQUs4SyxjQUEvQztBQVBGLENBMWdCRjs7QUFtaUJFO0FBQ0E7QUFDQTtBQUNFakssUUFBTSxrQkFEUjtBQUVFVSxTQUFPLFlBRlQ7QUFHRUYsVUFBUSw4Q0FIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx5QkFDWSxLQUFLNEosT0FEakI7QUFBQSxZQUNIbEwsS0FERyxjQUNIQSxLQURHO0FBQUEsWUFDSUMsR0FESixjQUNJQSxHQURKOztBQUVULG1DQUF5QkQsS0FBekIsVUFBbUNDLEdBQW5DO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQTRDVSxlQUFLb0wsUUFBakQ7QUFKRixDQXJpQkYsRTs7Ozs7Ozs7Ozs7Ozs7OztBQy9CQTs7OztBQUNBOzs7Ozs7Ozs7OytlQUxBO0FBQ0E7QUFDQTs7QUFLQTtBQUNBLElBQU14SixTQUFTL0QsaUJBQU84RCxTQUFQLENBQWlCLFdBQWpCLENBQWY7a0JBQ2VDLE07OztBQUVmQSxPQUFPdUgsV0FBUDtBQUNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0V0SSxRQUFNLDJCQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFRixVQUFRLDZEQUhWO0FBSUUwSixpQkFBZSxJQUpqQjtBQUtFQyxZQUFVLGdCQUxaO0FBTUVySztBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx1QkFDcUIsS0FBSzRKLE9BRDFCO0FBQUEsWUFDSHlCLEdBREcsWUFDSEEsR0FERztBQUFBLFlBQ0VDLEdBREYsWUFDRUEsR0FERjtBQUFBLFlBQ09DLFNBRFAsWUFDT0EsU0FEUDs7QUFFVCxlQUFPQSxVQUFVeE8sS0FBVixDQUFnQnNPLEdBQWhCLEVBQXFCQyxHQUFyQixDQUFQO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQXFEak0sZUFBS29MLFFBQTFEO0FBTkYsQ0FqQkY7O0FBK0JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sZ0JBRFI7QUFFRXNMLGNBQVksQ0FGZDtBQUdFOUssVUFBUSxLQUhWO0FBSUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSw0QkFDUXlMLENBRFIsRUFDVUMsQ0FEVixFQUNhO0FBQUUscUJBQVdELENBQVgsWUFBbUJDLENBQW5CO0FBQXlCO0FBRHhDOztBQUFBO0FBQUEsSUFBK0JyTSxlQUFLaUwsUUFBcEM7QUFKRixDQW5DRixFQTRDRTtBQUNFcEssUUFBTSxnQkFEUjtBQUVFc0wsY0FBWSxDQUZkO0FBR0U5SyxVQUFRLElBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLDRCQUNReUwsQ0FEUixFQUNVQyxDQURWLEVBQ2E7QUFBRSxxQkFBV0QsQ0FBWCxZQUFtQkMsQ0FBbkI7QUFBeUI7QUFEeEM7O0FBQUE7QUFBQSxJQUE4QnJNLGVBQUtpTCxRQUFuQztBQUpGLENBNUNGLEVBcURFO0FBQ0VwSyxRQUFNLGdCQURSO0FBRUVzTCxjQUFZLEVBRmQ7QUFHRTlLLFVBQVEsSUFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsNEJBQ1F5TCxDQURSLEVBQ1VDLENBRFYsRUFDYTtBQUFFLHFCQUFXRCxDQUFYLFlBQW1CQyxDQUFuQjtBQUF5QjtBQUR4Qzs7QUFBQTtBQUFBLElBQThCck0sZUFBS2lMLFFBQW5DO0FBSkYsQ0FyREYsRUE4REU7QUFDRXBLLFFBQU0sZ0JBRFI7QUFFRXNMLGNBQVksRUFGZDtBQUdFOUssVUFBUSxRQUhWO0FBSUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSw0QkFDUXlMLENBRFIsRUFDVUMsQ0FEVixFQUNhO0FBQUUscUJBQVdELENBQVgsWUFBbUJDLENBQW5CO0FBQXlCO0FBRHhDOztBQUFBO0FBQUEsSUFBa0NyTSxlQUFLaUwsUUFBdkM7QUFKRixDQTlERixFQXVFRTtBQUNFcEssUUFBTSxnQkFEUjtBQUVFc0wsY0FBWSxFQUZkO0FBR0U5SyxVQUFRLFlBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLDRCQUNReUwsQ0FEUixFQUNVQyxDQURWLEVBQ2E7QUFBRSxxQkFBV0QsQ0FBWCxhQUFvQkMsQ0FBcEI7QUFBMEI7QUFEekM7O0FBQUE7QUFBQSxJQUFzQ3JNLGVBQUtpTCxRQUEzQztBQUpGLENBdkVGLEVBK0VFO0FBQ0VwSyxRQUFNLGdCQURSO0FBRUVzTCxjQUFZLEVBRmQ7QUFHRTlLLFVBQVEsZ0JBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLDRCQUNReUwsQ0FEUixFQUNVQyxDQURWLEVBQ2E7QUFBRSxxQkFBV0QsQ0FBWCxhQUFvQkMsQ0FBcEI7QUFBMEI7QUFEekM7O0FBQUE7QUFBQSxJQUEwQ3JNLGVBQUtpTCxRQUEvQztBQUpGLENBL0VGOztBQXdGRTtBQUNBO0FBQ0E7QUFDRXBLLFFBQU0sZ0JBRFI7QUFFRXNMLGNBQVksRUFGZDtBQUdFOUssVUFBUSxDQUNOLE1BRE0sRUFFTixPQUZNLENBSFY7QUFPRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLDRCQUNRNEssS0FEUixFQUNlZSxJQURmLEVBQ3FCO0FBQUUsbUNBQXlCZixLQUF6QixXQUFvQ2UsSUFBcEM7QUFBOEM7QUFEckU7O0FBQUE7QUFBQSxJQUFnQ3RNLGVBQUtpTCxRQUFyQztBQVBGLENBMUZGLEVBc0dFO0FBQ0VwSyxRQUFNLGdCQURSO0FBRUVzTCxjQUFZLEVBRmQ7QUFHRTlLLFVBQVEsQ0FDTixVQURNLEVBRU4sV0FGTSxDQUhWO0FBT0VWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSw0QkFDUTRLLEtBRFIsRUFDZWUsSUFEZixFQUNxQjtBQUFFLG9DQUEwQmYsS0FBMUIsV0FBcUNlLElBQXJDO0FBQStDO0FBRHRFOztBQUFBO0FBQUEsSUFBb0N0TSxlQUFLaUwsUUFBekM7QUFQRixDQXRHRjs7QUFrSEU7QUFDQTtBQUNFcEssUUFBTSxnQkFEUjtBQUVFc0wsY0FBWSxFQUZkO0FBR0U5SyxVQUFRLENBQ04sT0FETSxFQUVOLFdBRk0sQ0FIVjtBQU9FVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsNEJBQ1E0SyxLQURSLEVBQ2VGLElBRGYsRUFDcUI7QUFBRSxlQUFVQSxJQUFWLGtCQUEyQkUsS0FBM0I7QUFBcUM7QUFENUQ7O0FBQUE7QUFBQSxJQUFpQ3ZMLGVBQUtpTCxRQUF0QztBQVBGLENBbkhGLEVBK0hFO0FBQ0VwSyxRQUFNLGdCQURSO0FBRUVzTCxjQUFZLEVBRmQ7QUFHRTlLLFVBQVEsQ0FDTixXQURNLEVBRU4sZUFGTSxDQUhWO0FBT0VWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSw0QkFDUTRLLEtBRFIsRUFDZUYsSUFEZixFQUNxQjtBQUFFLHFCQUFXQSxJQUFYLGtCQUE0QkUsS0FBNUI7QUFBc0M7QUFEN0Q7O0FBQUE7QUFBQSxJQUFxQ3ZMLGVBQUtpTCxRQUExQztBQVBGLENBL0hGLEVBNklFO0FBQ0VwSyxRQUFNLGdCQURSO0FBRUVzTCxjQUFZLEVBRmQ7QUFHRTlLLFVBQVEsQ0FDTixVQURNLEVBRU4sVUFGTSxDQUhWO0FBT0VWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSw0QkFDUTBLLElBRFIsRUFDY0UsS0FEZCxFQUNxQjtBQUFFLGVBQVVGLElBQVYsa0JBQTJCRSxLQUEzQjtBQUFxQztBQUQ1RDs7QUFBQTtBQUFBLElBQW9DdkwsZUFBS2lMLFFBQXpDO0FBUEYsQ0E3SUYsRUF5SkU7QUFDRXBLLFFBQU0sZ0JBRFI7QUFFRXNMLGNBQVksRUFGZDtBQUdFOUssVUFBUSxDQUNOLGtCQURNLEVBRU4sa0JBRk0sQ0FIVjtBQU9FVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsNEJBQ1EwSyxJQURSLEVBQ2NFLEtBRGQsRUFDcUI7QUFBRSxxQkFBV0YsSUFBWCxrQkFBNEJFLEtBQTVCO0FBQXNDO0FBRDdEOztBQUFBO0FBQUEsSUFBNEN2TCxlQUFLaUwsUUFBakQ7QUFQRixDQXpKRixFQXNLRTtBQUNFcEssUUFBTSxnQkFEUjtBQUVFc0wsY0FBWSxFQUZkO0FBR0U5SyxVQUFRLEdBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLDRCQUNReUwsQ0FEUixFQUNVQyxDQURWLEVBQ2E7QUFBRSxxQkFBVUQsQ0FBVixXQUFpQkMsQ0FBakI7QUFBdUI7QUFEdEM7O0FBQUE7QUFBQSxJQUE4QnJNLGVBQUt1TSxPQUFuQztBQUpGLENBdEtGLEVBOEtFO0FBQ0UxTCxRQUFNLGdCQURSO0FBRUVzTCxjQUFZLEVBRmQ7QUFHRTlLLFVBQVEsaUJBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLDRCQUNReUwsQ0FEUixFQUNVQyxDQURWLEVBQ2E7QUFBRSxxQkFBVUQsQ0FBVixXQUFpQkMsQ0FBakI7QUFBdUI7QUFEdEM7O0FBQUE7QUFBQSxJQUFpQ3JNLGVBQUtpTCxRQUF0QztBQUpGLENBOUtGLEVBdUxFO0FBQ0VwSyxRQUFNLGdCQURSO0FBRUVzTCxjQUFZLEVBRmQ7QUFHRTlLLFVBQVEsSUFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsNEJBQ1F5TCxDQURSLEVBQ1VDLENBRFYsRUFDYTtBQUFFLHFCQUFVRCxDQUFWLFlBQWtCQyxDQUFsQjtBQUF3QjtBQUR2Qzs7QUFBQTtBQUFBLElBQStCck0sZUFBS3VNLE9BQXBDO0FBSkYsQ0F2TEYsRUErTEU7QUFDRTFMLFFBQU0sZ0JBRFI7QUFFRXNMLGNBQVksRUFGZDtBQUdFOUssVUFBUSw2QkFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsNEJBQ1F5TCxDQURSLEVBQ1VDLENBRFYsRUFDYTtBQUFFLHFCQUFVRCxDQUFWLFlBQWtCQyxDQUFsQjtBQUF3QjtBQUR2Qzs7QUFBQTtBQUFBLElBQWtDck0sZUFBS2lMLFFBQXZDO0FBSkYsQ0EvTEYsRUF3TUU7QUFDRXBLLFFBQU0sZ0JBRFI7QUFFRXNMLGNBQVksRUFGZDtBQUdFOUssVUFBUSxHQUhWO0FBSUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSw0QkFDUXlMLENBRFIsRUFDVUMsQ0FEVixFQUNhO0FBQUUscUJBQVVELENBQVYsV0FBaUJDLENBQWpCO0FBQXVCO0FBRHRDOztBQUFBO0FBQUEsSUFBOEJyTSxlQUFLdU0sT0FBbkM7QUFKRixDQXhNRixFQWdORTtBQUNFMUwsUUFBTSxnQkFEUjtBQUVFc0wsY0FBWSxFQUZkO0FBR0U5SyxVQUFRLGNBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLDRCQUNReUwsQ0FEUixFQUNVQyxDQURWLEVBQ2E7QUFBRSxxQkFBVUQsQ0FBVixXQUFpQkMsQ0FBakI7QUFBdUI7QUFEdEM7O0FBQUE7QUFBQSxJQUFpQ3JNLGVBQUtpTCxRQUF0QztBQUpGLENBaE5GLEVBeU5FO0FBQ0VwSyxRQUFNLGdCQURSO0FBRUVzTCxjQUFZLEVBRmQ7QUFHRTlLLFVBQVEsSUFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsNEJBQ1F5TCxDQURSLEVBQ1VDLENBRFYsRUFDYTtBQUFFLHFCQUFVRCxDQUFWLFlBQWtCQyxDQUFsQjtBQUF3QjtBQUR2Qzs7QUFBQTtBQUFBLElBQStCck0sZUFBS3VNLE9BQXBDO0FBSkYsQ0F6TkYsRUFpT0U7QUFDRTFMLFFBQU0sZ0JBRFI7QUFFRXNMLGNBQVksRUFGZDtBQUdFOUssVUFBUSwwQkFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsNEJBQ1F5TCxDQURSLEVBQ1VDLENBRFYsRUFDYTtBQUFFLHFCQUFVRCxDQUFWLFlBQWtCQyxDQUFsQjtBQUF3QjtBQUR2Qzs7QUFBQTtBQUFBLElBQWtDck0sZUFBS2lMLFFBQXZDO0FBSkYsQ0FqT0YsRUEyT0U7QUFDRXBLLFFBQU0sZ0JBRFI7QUFFRXNMLGNBQVksRUFGZDtBQUdFOUssVUFBUSxLQUhWO0FBSUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSw0QkFDUXlMLENBRFIsRUFDVUMsQ0FEVixFQUNhO0FBQUUsZUFBU0QsQ0FBVCxXQUFnQkMsQ0FBaEI7QUFBcUI7QUFEcEM7O0FBQUE7QUFBQSxJQUFnQ3JNLGVBQUt1TSxPQUFyQztBQUpGLENBM09GLEVBbVBFO0FBQ0UxTCxRQUFNLGdCQURSO0FBRUVzTCxjQUFZLEVBRmQ7QUFHRTlLLFVBQVEsTUFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsNEJBQ1F5TCxDQURSLEVBQ1VDLENBRFYsRUFDYTtBQUFFLGVBQVNELENBQVQsV0FBZ0JDLENBQWhCO0FBQXFCO0FBRHBDOztBQUFBO0FBQUEsSUFBZ0NyTSxlQUFLaUwsUUFBckM7QUFKRixDQW5QRixFQTRQRTtBQUNFcEssUUFBTSxnQkFEUjtBQUVFc0wsY0FBWSxFQUZkO0FBR0U5SyxVQUFRLEdBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLDRCQUNReUwsQ0FEUixFQUNVQyxDQURWLEVBQ2E7QUFBRSxlQUFTRCxDQUFULFdBQWdCQyxDQUFoQjtBQUFxQjtBQURwQzs7QUFBQTtBQUFBLElBQWlDck0sZUFBS3VNLE9BQXRDO0FBSkYsQ0E1UEYsRUFvUUU7QUFDRTFMLFFBQU0sZ0JBRFI7QUFFRXNMLGNBQVksRUFGZDtBQUdFOUssVUFBUSxPQUhWO0FBSUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSw0QkFDUXlMLENBRFIsRUFDVUMsQ0FEVixFQUNhO0FBQUUsZUFBU0QsQ0FBVCxXQUFnQkMsQ0FBaEI7QUFBcUI7QUFEcEM7O0FBQUE7QUFBQSxJQUFpQ3JNLGVBQUtpTCxRQUF0QztBQUpGLENBcFFGLEVBNlFFO0FBQ0VwSyxRQUFNLGdCQURSO0FBRUVzTCxjQUFZLEVBRmQ7QUFHRTlLLFVBQVEsS0FIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsNEJBQ1F5TCxDQURSLEVBQ1VDLENBRFYsRUFDYTtBQUFFLGVBQVNELENBQVQsV0FBZ0JDLENBQWhCO0FBQXFCO0FBRHBDOztBQUFBO0FBQUEsSUFBaUNyTSxlQUFLdU0sT0FBdEM7QUFKRixDQTdRRixFQXFSRTtBQUNFMUwsUUFBTSxnQkFEUjtBQUVFc0wsY0FBWSxFQUZkO0FBR0U5SyxVQUFRLE9BSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLDRCQUNReUwsQ0FEUixFQUNVQyxDQURWLEVBQ2E7QUFBRSxlQUFTRCxDQUFULFdBQWdCQyxDQUFoQjtBQUFxQjtBQURwQzs7QUFBQTtBQUFBLElBQWlDck0sZUFBS2lMLFFBQXRDO0FBSkYsQ0FyUkYsRUE4UkU7QUFDRXBLLFFBQU0sZ0JBRFI7QUFFRXNMLGNBQVksRUFGZDtBQUdFOUssVUFBUSxHQUhWO0FBSUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSw0QkFDUXlMLENBRFIsRUFDVUMsQ0FEVixFQUNhO0FBQUUsZUFBU0QsQ0FBVCxXQUFnQkMsQ0FBaEI7QUFBcUI7QUFEcEM7O0FBQUE7QUFBQSxJQUFzQ3JNLGVBQUt1TSxPQUEzQztBQUpGLENBOVJGLEVBc1NFO0FBQ0UxTCxRQUFNLGdCQURSO0FBRUVzTCxjQUFZLEVBRmQ7QUFHRTlLLFVBQVEsWUFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsNEJBQ1F5TCxDQURSLEVBQ1VDLENBRFYsRUFDYTtBQUFFLGVBQVNELENBQVQsV0FBZ0JDLENBQWhCO0FBQXFCO0FBRHBDOztBQUFBO0FBQUEsSUFBc0NyTSxlQUFLaUwsUUFBM0M7QUFKRixDQXRTRjs7QUErU0U7OztBQUdBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0VwSyxRQUFNLDZCQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFRixVQUFRLDBDQUhWO0FBSUUwSixpQkFBZSxJQUpqQjtBQUtFQyxZQUFVLGtCQUxaO0FBTUVySztBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx3QkFDdUIsS0FBSzRKLE9BRDVCO0FBQUEsWUFDSGlCLFVBREcsYUFDSEEsVUFERztBQUFBLFlBQ1NVLFNBRFQsYUFDU0EsU0FEVDs7QUFFVCxlQUFPQSxVQUFVeE8sS0FBVixDQUFnQjhOLFVBQWhCLENBQVA7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBc0R4TCxlQUFLb0wsUUFBM0Q7QUFORixDQXZURixFQXFVRTtBQUNFdkssUUFBTSxrQkFEUjtBQUVFUSxVQUFRLFlBRlY7QUFHRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLDRCQUNRNEssS0FEUixFQUNlO0FBQUUsNEJBQWtCQSxLQUFsQjtBQUE0QztBQUQ3RDs7QUFBQTtBQUFBLElBQXNDdkwsZUFBS2lMLFFBQTNDO0FBSEYsQ0FyVUYsRUE0VUU7QUFDRXBLLFFBQU0sa0JBRFI7QUFFRVEsVUFBUSxDQUNOLGNBRE0sRUFFTixnQkFGTSxDQUZWO0FBTUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSw0QkFDUTRLLEtBRFIsRUFDZTtBQUFFLDRCQUFrQkEsS0FBbEI7QUFBNEM7QUFEN0Q7O0FBQUE7QUFBQSxJQUF3Q3ZMLGVBQUtpTCxRQUE3QztBQU5GLENBNVVGOztBQXVWRTtBQUNBO0FBQ0VwSyxRQUFNLGtCQURSO0FBRUVRLFVBQVEsVUFGVjtBQUdFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsNEJBQ1E0SyxLQURSLEVBQ2U7QUFBRSxrQ0FBd0JBLEtBQXhCO0FBQWtDO0FBRG5EOztBQUFBO0FBQUEsSUFBb0N2TCxlQUFLaUwsUUFBekM7QUFIRixDQXhWRixFQStWRTtBQUNFcEssUUFBTSxrQkFEUjtBQUVFUSxVQUFRLGNBRlY7QUFHRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLDRCQUNRNEssS0FEUixFQUNlO0FBQUUsbUNBQXlCQSxLQUF6QjtBQUFtQztBQURwRDs7QUFBQTtBQUFBLElBQXdDdkwsZUFBS2lMLFFBQTdDO0FBSEYsQ0EvVkYsRTs7Ozs7Ozs7Ozs7Ozs7OztBQ1BBOzs7O0FBQ0E7Ozs7Ozs7Ozs7K2VBTEE7QUFDQTtBQUNBOztBQUtBO0FBQ0EsSUFBTXJKLFNBQVMvRCxpQkFBTzhELFNBQVAsQ0FBaUIsWUFBakIsQ0FBZjtrQkFDZUMsTTs7O0FBRWZBLE9BQU91SCxXQUFQO0FBQ0U7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNFdEksUUFBTSxrQkFEUjtBQUVFVSxTQUFPLFdBRlQ7QUFHRUYsVUFBUSxxQkFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSxZQUNINkssVUFERyxHQUNZLEtBQUtqQixPQURqQixDQUNIaUIsVUFERzs7QUFFVCwyQkFBaUJBLFVBQWpCO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQTRDeEwsZUFBS29MLFFBQWpEO0FBSkYsQ0FQRjs7QUFtQkU7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxZQURSO0FBRUVVLFNBQU8sQ0FBQyxXQUFELEVBQWMsY0FBZCxDQUZUO0FBR0VGLFVBQVEsQ0FDTix5Q0FETSxFQUVOLDhDQUZNLEVBR04sZ0RBSE0sQ0FIVjtBQVFFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx1QkFDYyxLQUFLNEosT0FEbkI7QUFBQSxZQUNIZ0IsS0FERyxZQUNIQSxLQURHO0FBQUEsWUFDSW5LLEtBREosWUFDSUEsS0FESjtBQUVUOztBQUNBLGVBQVVtSyxLQUFWLFdBQXFCbkssS0FBckI7QUFDRDtBQUxIOztBQUFBO0FBQUEsSUFBc0NwQixlQUFLb0wsUUFBM0M7QUFSRixDQXpCRjs7QUEwQ0U7QUFDQTtBQUNBO0FBQ0V2SyxRQUFNLFdBRFI7QUFFRVUsU0FBTyxDQUFDLFdBQUQsRUFBYyxjQUFkLENBRlQ7QUFHRUYsVUFBUSx3QkFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSxZQUNIUyxLQURHLEdBQ08sS0FBS21KLE9BRFosQ0FDSG5KLEtBREc7QUFDb0I7QUFDN0IseUJBQWVBLEtBQWY7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBcUNwQixlQUFLb0wsUUFBMUM7QUFKRixDQTVDRjs7QUEwREU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sT0FEUjtBQUVFVSxTQUFPLFdBRlQ7QUFHRUYsVUFBUSxzREFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx3QkFDNEIsS0FBSzRKLE9BRGpDO0FBQUEsWUFDSGlDLE9BREcsYUFDSEEsT0FERztBQUFBLDJDQUNNQyxRQUROO0FBQUEsWUFDTUEsUUFETjs7QUFFVCxzQ0FBNEJELE9BQTVCLFVBQXdDQyxRQUF4QztBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUFpQ3pNLGVBQUtvTCxRQUF0QztBQUpGLENBbEVGOztBQThFRTtBQUNBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxNQURSO0FBRUVVLFNBQU8sV0FGVDtBQUdFRixVQUFRLHdEQUhWO0FBSUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHdCQUM0QixLQUFLNEosT0FEakM7QUFBQSxZQUNIaUMsT0FERyxhQUNIQSxPQURHO0FBQUEsMkNBQ01DLFFBRE47QUFBQSxZQUNNQSxRQUROOztBQUVULHFDQUEyQkQsT0FBM0IsVUFBdUNDLFFBQXZDO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQWdDek0sZUFBS29MLFFBQXJDO0FBSkYsQ0FqRkY7O0FBOEZFO0FBQ0E7QUFDQTtBQUNBO0FBQ0V2SyxRQUFNLFNBRFI7QUFFRVUsU0FBTyxXQUZUO0FBR0VGLFVBQVEsNEZBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsd0JBQ3VELEtBQUs0SixPQUQ1RDtBQUFBLFlBQ0hpQyxPQURHLGFBQ0hBLE9BREc7QUFBQSwyQ0FDTUMsUUFETjtBQUFBLFlBQ01BLFFBRE47QUFBQSw4Q0FDeUJDLFlBRHpCO0FBQUEsWUFDeUJBLFlBRHpCOztBQUVULHdDQUE4QkYsT0FBOUIsVUFBMENDLFFBQTFDLFVBQXVEQyxZQUF2RDtBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUFtQzFNLGVBQUtvTCxRQUF4QztBQUpGLENBakdGLEU7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0pBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7OzsrZUFYQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFRQSxJQUFNeEosU0FBUy9ELGlCQUFPOEQsU0FBUCxDQUFpQixPQUFqQixDQUFmO2tCQUNlQyxNOzs7QUFFZkEsT0FBT3VILFdBQVAsQ0FDRTtBQUNFdEksUUFBTSxhQURSO0FBRUVVLFNBQU8sQ0FBQyxXQUFELEVBQWMsY0FBZCxDQUZUO0FBR0VGLFVBQVEseURBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFDRTtBQURGLG9DQUVnQjtBQUNaLFlBQUlnTSxpSUFBSjtBQUNBQSxrQkFBVUwsSUFBVixHQUFpQixPQUFqQjtBQUNBLGVBQU9LLFNBQVA7QUFDRDtBQU5IO0FBQUE7QUFBQSxpQ0FRYTtBQUFBLHVCQUN3QixLQUFLcEMsT0FEN0I7QUFBQSxZQUNIMUosSUFERyxZQUNIQSxJQURHO0FBQUEsWUFDRytMLFNBREgsWUFDR0EsU0FESDtBQUFBLFlBQ2NsQyxLQURkLFlBQ2NBLEtBRGQ7O0FBRVQsWUFBSWhKLG9CQUFrQmIsSUFBdEI7QUFDQSxZQUFJK0wsU0FBSixFQUFlbEwsd0JBQXNCa0wsU0FBdEI7QUFDZmxMLGtCQUFVLE1BQU0xQixlQUFLNEssS0FBTCxDQUFXQyxpQkFBWCxDQUE2QkgsS0FBN0IsQ0FBaEI7QUFDQSxlQUFPaEosTUFBUDtBQUNEO0FBZEg7O0FBQUE7QUFBQSxJQUF1QzFCLGVBQUs4SyxjQUE1QztBQUpGLENBREY7O0FBdUJFO0FBQ0E7QUFDQTtBQUNBO0FBQ0VqSyxRQUFNLFdBRFI7QUFFRVUsU0FBTyxDQUFDLFlBQUQsRUFBZSxXQUFmLENBRlQ7QUFHRUYsVUFBUSxpRUFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx3QkFDa0IsS0FBSzRKLE9BRHZCO0FBQUEsWUFDSCtCLElBREcsYUFDSEEsSUFERztBQUFBLHdDQUNHMUwsS0FESDtBQUFBLFlBQ0dBLEtBREgsbUNBQ1csRUFEWDtBQUVUOztBQUNBLFlBQUkwTCxTQUFTLFFBQWIsRUFBdUI7QUFDckIsY0FBSSxDQUFDMUwsS0FBTCxFQUFZLE9BQU8sSUFBUDtBQUNaLGlCQUFPQSxLQUFQO0FBQ0Q7O0FBRUQsd0JBQWMwTCxJQUFkLFNBQXNCMUwsS0FBdEI7QUFDRDtBQVZIOztBQUFBO0FBQUEsSUFBcUNaLGVBQUtvTCxRQUExQztBQUpGLENBMUJGOztBQTRDRTtBQUNBO0FBQ0V2SyxRQUFNLGdCQURSO0FBRUVVLFNBQU8sQ0FBQyxXQUFELEVBQWMsY0FBZCxDQUZUO0FBR0VGLFVBQVEsZ0VBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFDRTtBQURGLG9DQUVnQjtBQUFBLHdCQUN1QixLQUFLNEosT0FENUI7QUFBQSxZQUNOb0IsUUFETSxhQUNOQSxRQURNO0FBQUEsWUFDSTlLLElBREosYUFDSUEsSUFESjtBQUFBLHVDQUNVckQsSUFEVjtBQUFBLFlBQ1VBLElBRFYsa0NBQ2lCLEVBRGpCOztBQUVaLFlBQUlxUCxVQUFXbEIsYUFBYSxJQUFiLEdBQW9CLFFBQXBCLEdBQStCLE9BQTlDO0FBQ0EsZUFBTyxFQUFFVyxNQUFNLFVBQVIsRUFBb0JPLGdCQUFwQixFQUE2QmhNLFVBQTdCLEVBQW1DckQsVUFBbkMsRUFBUDtBQUNEO0FBTkg7QUFBQTtBQUFBLGlDQVFhO0FBQUEsd0JBQ21DLEtBQUsrTSxPQUR4QztBQUFBLFlBQ0gxSixJQURHLGFBQ0hBLElBREc7QUFBQSx1Q0FDR3JELElBREg7QUFBQSxZQUNHQSxJQURILGtDQUNVLEVBRFY7QUFBQSxZQUNjaU4sU0FEZCxhQUNjQSxTQURkO0FBQUEsWUFDeUJDLEtBRHpCLGFBQ3lCQSxLQUR6Qjs7QUFFVCxZQUFJaEosU0FBWWIsSUFBWixTQUFvQnJELEtBQUsySyxJQUFMLENBQVUsSUFBVixDQUFwQixPQUFKO0FBQ0F6RyxrQkFBVTFCLGVBQUs0SyxLQUFMLENBQVdDLGlCQUFYLENBQTZCSixTQUE3QixFQUF3Q0MsS0FBeEMsQ0FBVjtBQUNBLGVBQU9oSixNQUFQO0FBQ0Q7QUFiSDs7QUFBQTtBQUFBLElBQTBDMUIsZUFBSzhLLGNBQS9DO0FBSkYsQ0E3Q0Y7O0FBa0VFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRWpLLFFBQU0sZ0JBRFI7QUFFRVUsU0FBTyxDQUFDLFdBQUQsRUFBYyxjQUFkLENBRlQ7QUFHRUYsVUFBUSxzREFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBNENhO0FBQUEsd0JBQzBDLEtBQUs0SixPQUQvQztBQUFBLFlBQ0gxSixJQURHLGFBQ0hBLElBREc7QUFBQSx1Q0FDR3JELElBREg7QUFBQSxZQUNHQSxJQURILGtDQUNVLEVBRFY7QUFBQSxZQUNjc1AsS0FEZCxhQUNjQSxLQURkO0FBQUEsWUFDcUJyQyxTQURyQixhQUNxQkEsU0FEckI7QUFBQSxZQUNnQ0MsS0FEaEMsYUFDZ0NBLEtBRGhDOztBQUdUOztBQUNBLFlBQUlxQyxhQUFhLEVBQWpCO0FBQ0EsYUFBSyxJQUFJcEUsR0FBVCxJQUFnQm1FLEtBQWhCLEVBQXVCO0FBQ3JCQyxxQkFBV3RMLElBQVgsdUJBQW9Da0gsR0FBcEMsVUFBNENtRSxNQUFNbkUsR0FBTixDQUE1QztBQUNEOztBQUVELFlBQUlnQyxhQUFhM0ssZUFBSzRLLEtBQUwsQ0FBV0MsaUJBQVgsQ0FBNkJrQyxVQUE3QixFQUF5Q3RDLFNBQXpDLEVBQW9EQyxLQUFwRCxDQUFqQjs7QUFFQTtBQUNKO0FBQ0ksMkJBQWlCN0osSUFBakIsU0FBeUJyRCxLQUFLMkssSUFBTCxDQUFVLElBQVYsQ0FBekIsVUFBNkN3QyxVQUE3QztBQUNEO0FBMURIO0FBQUE7QUFBQSxvQ0E0RGdCO0FBQUEsd0JBQ2dCLEtBQUtKLE9BRHJCO0FBQUEsWUFDTjFKLElBRE0sYUFDTkEsSUFETTtBQUFBLFlBQ0FyRCxJQURBLGFBQ0FBLElBREE7QUFBQSxZQUNNc1AsS0FETixhQUNNQSxLQUROOztBQUVaLGVBQU8sRUFBRVIsTUFBTSxVQUFSLEVBQW9CTyxTQUFTLFFBQTdCLEVBQXVDaE0sVUFBdkMsRUFBNkNyRCxVQUE3QyxFQUFtRHNQLFlBQW5ELEVBQVA7QUFDRDtBQS9ESDtBQUFBOztBQUNFO0FBREYsMEJBRWdCO0FBQ1osWUFBSXBMLHFIQUFKOztBQUVBO0FBSFksWUFJTnNMLFFBSk0sR0FJT3RMLE1BSlAsQ0FJTnNMLFFBSk07O0FBS1osWUFBSUMsaUJBQWlCLEtBQUsxQyxPQUFMLENBQWF5QyxRQUFiLENBQXNCMUQsT0FBM0M7QUFDQSxZQUFJMEQsU0FBUzNPLE1BQVQsS0FBb0IsQ0FBeEIsRUFBMkI7QUFDekIsY0FBSTZPLFVBQVVGLFNBQVMsQ0FBVCxDQUFkO0FBQ0EsY0FBSUMsZUFBZSxDQUFmLGFBQTZCak4sZUFBS21OLElBQXRDLEVBQTRDO0FBQzFDL1Asb0JBQVFnUSxLQUFSLGtFQUE2RUYsT0FBN0U7QUFDRDs7QUFFVDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDUzs7QUFFRDtBQUNBeEwsZUFBT2xFLElBQVAsR0FBYyxFQUFkO0FBQ0FrRSxlQUFPb0wsS0FBUCxHQUFlLEVBQWY7O0FBRUE7QUFDQUcsdUJBQWVuTixHQUFmLENBQW9CLFVBQUMrTCxJQUFELEVBQU93QixLQUFQLEVBQWlCO0FBQ25DLGNBQUl4QixnQkFBZ0I3TCxlQUFLbU4sSUFBekIsRUFBK0I7QUFDN0IsZ0JBQUlBLE9BQU9ILFNBQVNLLEtBQVQsQ0FBWDtBQUNBLGdCQUFJZixPQUFPYSxLQUFLRyxXQUFMLEVBQVg7O0FBRUE1TCxtQkFBT29MLEtBQVAsQ0FBYVIsSUFBYixJQUFxQmEsSUFBckI7QUFDQXpMLG1CQUFPbEUsSUFBUCxDQUFZaUUsSUFBWixDQUFpQjZLLElBQWpCOztBQUVBO0FBQ0FVLHFCQUFTSyxLQUFULElBQWtCZixJQUFsQjtBQUNEO0FBQ0YsU0FYRDtBQVlBO0FBQ0E1SyxlQUFPYixJQUFQLEdBQWNtTSxTQUFTN0UsSUFBVCxDQUFjLEdBQWQsQ0FBZDtBQUNBLGVBQU96RyxNQUFQO0FBQ0Q7QUExQ0g7O0FBQUE7QUFBQSxJQUEwQzFCLGVBQUs4SyxjQUEvQztBQUpGLENBekVGOztBQWlKRTtBQUNBO0FBQ0E7QUFDQTtBQUNFakssUUFBTSxRQURSO0FBRUVVLFNBQU8sQ0FBQyxXQUFELEVBQWMsY0FBZCxDQUZUO0FBR0VGLFVBQVEsd0NBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsd0JBQ3lCLEtBQUs0SixPQUQ5QjtBQUFBLFlBQ0gxSixJQURHLGFBQ0hBLElBREc7QUFBQSxZQUNHMkssVUFESCxhQUNHQSxVQURIO0FBQUEsWUFDZWQsS0FEZixhQUNlQSxLQURmO0FBRVQ7O0FBQ0EsWUFBSWMsY0FBYyxDQUFDQSxXQUFXK0IsVUFBWCxDQUFzQixTQUF0QixDQUFuQixFQUFxRC9CLDBCQUF3QkEsVUFBeEI7QUFDckQsWUFBSTlKLGtCQUFnQmIsSUFBaEIsUUFBSjtBQUNBYSxrQkFBVTFCLGVBQUs0SyxLQUFMLENBQVdDLGlCQUFYLENBQTZCVyxVQUE3QixFQUF5Q2QsS0FBekMsQ0FBVjtBQUNBLGVBQU9oSixNQUFQO0FBQ0Q7O0FBRUQ7O0FBVkY7QUFBQTtBQUFBLG9DQVdnQjtBQUFBLFlBQ05iLElBRE0sR0FDRyxLQUFLMEosT0FEUixDQUNOMUosSUFETTs7QUFFWixlQUFPLEVBQUV5TCxNQUFNLFVBQVIsRUFBb0JPLFNBQVMsUUFBN0IsRUFBdUNoTSxVQUF2QyxFQUFQO0FBQ0Q7QUFkSDs7QUFBQTtBQUFBLElBQWtDYixlQUFLOEssY0FBdkM7QUFKRixDQXBKRjs7QUEwS0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRWpLLFFBQU0sUUFEUjtBQUVFVSxTQUFPLENBQUMsV0FBRCxFQUFjLGNBQWQsQ0FGVDtBQUdFRixVQUFRLG1EQUhWO0FBSUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUNUO0FBRFMsd0JBRXVDLEtBQUs0SixPQUY1QztBQUFBLFlBRUgxSixJQUZHLGFBRUhBLElBRkc7QUFBQSx1Q0FFR3JELElBRkg7QUFBQSxZQUVHQSxJQUZILGtDQUVVLENBQUNxRCxJQUFELENBRlY7QUFBQSxZQUVrQjRKLFNBRmxCLGFBRWtCQSxTQUZsQjtBQUFBLFlBRTZCQyxLQUY3QixhQUU2QkEsS0FGN0I7QUFHVDs7QUFDQSxZQUFJbE4sUUFBUUEsS0FBS2EsTUFBTCxHQUFjLENBQTFCLEVBQTZCO0FBQzNCakIsa0JBQVEwSSxJQUFSLENBQWEseURBQWIsRUFBd0UsS0FBSzBILFdBQTdFO0FBQ0FoUSxpQkFBTyxDQUFFQSxLQUFLLENBQUwsQ0FBRixDQUFQO0FBQ0Q7QUFDRCxZQUFJa0Usa0JBQWdCYixJQUFoQixTQUF3QnJELElBQXhCLE9BQUo7QUFDQWtFLGtCQUFVMUIsZUFBSzRLLEtBQUwsQ0FBV0MsaUJBQVgsQ0FBNkJKLFNBQTdCLEVBQXdDQyxLQUF4QyxDQUFWO0FBQ0EsZUFBT2hKLE1BQVA7QUFDRDs7QUFFRDs7QUFkRjtBQUFBO0FBQUEsb0NBZWdCO0FBQUEsWUFDTmIsSUFETSxHQUNHLEtBQUswSixPQURSLENBQ04xSixJQURNOztBQUVaLGVBQU8sRUFBRXlMLE1BQU0sVUFBUixFQUFvQk8sU0FBUyxRQUE3QixFQUF1Q2hNLFVBQXZDLEVBQVA7QUFDRDtBQWxCSDs7QUFBQTtBQUFBLElBQWtDYixlQUFLOEssY0FBdkM7QUFKRixDQW5MRjs7QUE4TUU7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDRWpLLFFBQU0sa0JBRFI7QUFFRVUsU0FBTyxDQUFDLFdBQUQsRUFBYyxjQUFkLENBRlQ7QUFHRUYsVUFBUSx1RkFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx3QkFDeUIsS0FBSzRKLE9BRDlCO0FBQUEsWUFDSGtELEtBREcsYUFDSEEsS0FERztBQUFBLFlBQ0k1TSxJQURKLGFBQ0lBLElBREo7QUFBQSx3Q0FDVU8sS0FEVjtBQUFBLFlBQ1VBLEtBRFYsbUNBQ2tCLEVBRGxCOztBQUVULFlBQUlBLEtBQUosRUFBV0EsZ0JBQWNBLEtBQWQ7O0FBRVgsWUFBSXNNLG1CQUFpQjdNLElBQWpCLEdBQXdCTyxLQUE1QjtBQUNBLGdCQUFRcU0sS0FBUjtBQUNFLGVBQUssVUFBTDtBQUNWO0FBQ1ksOEJBQWdCQyxXQUFoQjs7QUFFRixlQUFLLGlCQUFMO0FBQ0UsK0JBQWlCQSxXQUFqQjs7QUFFRixlQUFLLFVBQUw7QUFDQTtBQUNFLG1CQUFPQSxXQUFQO0FBVko7QUFZRDs7QUFFRDs7QUFwQkY7QUFBQTtBQUFBLG9DQXFCZ0I7QUFBQSx5QkFDVSxLQUFLbkQsT0FEZjtBQUFBLFlBQ05rRCxLQURNLGNBQ05BLEtBRE07QUFBQSxZQUNDNU0sSUFERCxjQUNDQSxJQUREOztBQUVaLGVBQU8sRUFBRXlMLE1BQU0sVUFBUixFQUFvQnpMLFVBQXBCLEVBQTBCNE0sWUFBMUIsRUFBUDtBQUNEO0FBeEJIOztBQUFBO0FBQUEsSUFBNEN6TixlQUFLb0wsUUFBakQ7QUFKRixDQW5ORjs7QUFtUEU7QUFDQTtBQUNBO0FBQ0V2SyxRQUFNLDBCQURSO0FBRUVVLFNBQU8sQ0FBQyxXQUFELEVBQWMsY0FBZCxDQUZUO0FBR0VGLFVBQVEsOENBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEseUJBQ1ksS0FBSzRKLE9BRGpCO0FBQUEsWUFDSDFKLElBREcsY0FDSEEsSUFERztBQUFBLFlBQ0d5TCxJQURILGNBQ0dBLElBREg7O0FBRVQsZUFBTyxTQUFPekwsSUFBUCwyQkFBaUNBLElBQWpDLHNCQUNLQSxJQURMLHVDQUMyQ3lMLElBRDNDLGlCQUMyRHpMLElBRDNELGdCQUFQO0FBRUQ7O0FBRUQ7O0FBUEY7QUFBQTtBQUFBLG9DQVFnQjtBQUFBLHlCQUNTLEtBQUswSixPQURkO0FBQUEsWUFDTjFKLElBRE0sY0FDTkEsSUFETTtBQUFBLFlBQ0F5TCxJQURBLGNBQ0FBLElBREE7O0FBRVosZUFBTyxFQUFFQSxNQUFNLFVBQVIsRUFBb0JPLFNBQVMsUUFBN0IsRUFBdUNoTSxVQUF2QyxFQUE2QzhNLFVBQVVyQixJQUF2RCxFQUFQO0FBQ0Q7QUFYSDs7QUFBQTtBQUFBLElBQW9EdE0sZUFBS29MLFFBQXpEO0FBSkYsQ0FyUEY7O0FBeVFFO0FBQ0E7QUFDRXZLLFFBQU0sNEJBRFI7QUFFRVUsU0FBTyxDQUFDLFdBQUQsRUFBYyxjQUFkLENBRlQ7QUFHRUYsVUFBUSwwREFIVjtBQUlFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBT2E7QUFBQSx5QkFDb0IsS0FBSzRKLE9BRHpCO0FBQUEsWUFDSDFKLElBREcsY0FDSEEsSUFERztBQUFBLFlBQ0crTSxNQURILGNBQ0dBLE1BREg7QUFBQSxZQUNXdkMsSUFEWCxjQUNXQSxJQURYOztBQUVULGVBQU8sWUFBVXVDLE1BQVYsV0FBc0J2QyxJQUF0QixvQkFDS3hLLElBREwsMkJBQytCQSxJQUQvQiw4QkFDNEQrTSxNQUQ1RCxxQkFDa0YvTSxJQURsRix1QkFFS0EsSUFGTCwyQkFFK0IrTSxNQUYvQixpQ0FFaUUvTSxJQUZqRSxnQkFBUDs7QUFJTjtBQUNBO0FBQ0E7QUFDQTtBQUNLOztBQUVEOztBQW5CRjtBQUFBO0FBQUEsb0NBb0JnQjtBQUFBLHlCQUNXLEtBQUswSixPQURoQjtBQUFBLFlBQ04xSixJQURNLGNBQ05BLElBRE07QUFBQSxZQUNBK00sTUFEQSxjQUNBQSxNQURBOztBQUVaLGVBQU8sQ0FDTCxFQUFFdEIsTUFBTSxVQUFSLEVBQW9CekwsVUFBcEIsRUFESyxFQUVMLEVBQUV5TCxNQUFNLFVBQVIsRUFBb0JPLFNBQVMsUUFBN0IsRUFBdUNoTSxNQUFNK00sTUFBN0MsRUFGSyxDQUFQO0FBSUQ7QUExQkg7QUFBQTtBQUFBLDBCQUNnQjtBQUNaLFlBQUlyRCw4SUFBSjtBQUNBQSxnQkFBUXFELE1BQVIsR0FBaUIsdUJBQVVyRCxRQUFRMUosSUFBbEIsQ0FBakI7QUFDQSxlQUFPMEosT0FBUDtBQUNEO0FBTEg7O0FBQUE7QUFBQSxJQUFzRHZLLGVBQUtvTCxRQUEzRDtBQUpGLENBMVFGOztBQTZTRTtBQUNBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxJQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFRixVQUFRLElBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQ1QsZUFBTyxNQUFQO0FBQ0Q7QUFISDs7QUFBQTtBQUFBLElBQThCWCxlQUFLaUwsUUFBbkM7QUFKRixDQWhURjs7QUEyVEU7QUFDQTtBQUNFcEssUUFBTSxHQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFRixVQUFRLEdBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQ1QsZUFBTyxNQUFQO0FBQ0Q7QUFISDs7QUFBQTtBQUFBLElBQTZCWCxlQUFLaUwsUUFBbEM7QUFKRixDQTVURjs7QUF3VUU7QUFDQTtBQUNBOztBQUVBO0FBQ0VwSyxRQUFNLHFCQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFRixVQUFRLHFEQUhWO0FBSUVWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FRYTtBQUFBLHlCQUN3QixLQUFLNEosT0FEN0I7QUFBQSxZQUNIaUIsVUFERyxjQUNIQSxVQURHO0FBQUEsWUFDUzFOLFVBRFQsY0FDU0EsVUFEVDs7QUFFVEEscUJBQWFBLFdBQVc2QixPQUFYLEdBQXFCd0ksSUFBckIsQ0FBMEIsR0FBMUIsQ0FBYjtBQUNBLGVBQVVxRCxVQUFWLFNBQXdCMU4sVUFBeEI7QUFDTjtBQUNBO0FBQ0s7QUFkSDtBQUFBO0FBQUEsMEJBQ2dCO0FBQUEseUJBQ3VCLEtBQUt5TSxPQUQ1QjtBQUFBLFlBQ05pQixVQURNLGNBQ05BLFVBRE07QUFBQSxZQUNNcUMsV0FETixjQUNNQSxXQUROOztBQUVaLGVBQU87QUFDTC9QLHNCQUFZZ1EsWUFBWXhFLE9BQVosQ0FBb0J4SixHQUFwQixDQUF5QjtBQUFBLG1CQUFZaUosU0FBU3dCLE9BQVQsQ0FBaUJlLFVBQTdCO0FBQUEsV0FBekI7QUFEUCxTQUFQO0FBR0Q7QUFOSDs7QUFBQTtBQUFBLElBQStDdEwsZUFBS29MLFFBQXBEO0FBSkYsQ0E1VUYsRUFrV0U7QUFDRXZLLFFBQU0sd0JBRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VGLFVBQVEsd0JBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsWUFDSDJLLFVBREcsR0FDWSxLQUFLZixPQURqQixDQUNIZSxVQURHOztBQUVULHlCQUFlQSxVQUFmO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQWtEdEwsZUFBS29MLFFBQXZEO0FBSkYsQ0FsV0Y7O0FBK1dFO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSwyQkFEUjtBQUVFUSxVQUFRLGlEQUZWO0FBR0VWO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUNULFlBQUlDLFFBQVEsS0FBSzJKLE9BQUwsQ0FBYWpCLE9BQWIsQ0FBcUJ4SixHQUFyQixDQUF5QixVQUFVaU8sSUFBVixFQUFnQjtBQUFBLDhCQUM1QkEsS0FBS3hELE9BRHVCO0FBQUEsY0FDM0N0SixHQUQyQyxpQkFDM0NBLEdBRDJDO0FBQUEsY0FDdENHLEtBRHNDLGlCQUN0Q0EsS0FEc0M7O0FBRWpELGNBQUlBLEtBQUosRUFBVyxjQUFXSCxHQUFYLFlBQW9CRyxLQUFwQjtBQUNYLGlCQUFPSCxHQUFQO0FBQ0QsU0FKUyxDQUFaO0FBS0Esc0JBQVlMLE1BQU11SCxJQUFOLENBQVcsSUFBWCxDQUFaO0FBQ0Q7QUFSSDs7QUFBQTtBQUFBLElBQXFEbkksZUFBS2dPLElBQTFEO0FBSEYsQ0F4WEY7O0FBd1lFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0VuTixRQUFNLE1BRFI7QUFFRVEsVUFBUSwyQkFGVjtBQUdFVjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUNFO0FBREYsaUNBRWE7QUFDVCxlQUFPLEtBQUs0SixPQUFMLENBQWEwRCxLQUFiLENBQW1CM0UsT0FBbkIsQ0FBMkJ4SixHQUEzQixDQUErQjtBQUFBLGlCQUFPNkksSUFBSXZKLFFBQUosRUFBUDtBQUFBLFNBQS9CLENBQVA7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBZ0NZLGVBQUtvTCxRQUFyQztBQUhGLENBOVlGLEU7Ozs7Ozs7QUNoQkE7QUFDQTtBQUNBOzs7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUssWUFBWSxlQUFlO0FBQ2hDO0FBQ0EsS0FBSztBQUNMO0FBQ0E7Ozs7Ozs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLGtCQUFrQixFQUFFOztBQUUvQztBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUcsWUFBWTtBQUNmOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7Ozs7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrRkFBa0YsdUJBQXVCO0FBQ3pHLGlFQUFpRTtBQUNqRSwrREFBK0Q7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkLGNBQWM7QUFDZCxjQUFjO0FBQ2QsY0FBYztBQUNkLGVBQWU7QUFDZixlQUFlO0FBQ2YsZUFBZTtBQUNmLGdCQUFnQjtBQUNoQjs7Ozs7Ozs7QUMxQ0E7QUFDQTs7Ozs7Ozs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpREFBaUQ7QUFDakQsQ0FBQztBQUNEO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0EsU0FBUztBQUNULEdBQUcsRUFBRTtBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7Ozs7Ozs7O0FDeENBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUcsWUFBWTtBQUNmO0FBQ0E7Ozs7Ozs7O0FDZkE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCOztBQUVqQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7OztBQ2xCQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxvRUFBb0UsaUNBQWlDO0FBQ3JHOzs7Ozs7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkRBQTJEO0FBQzNEOzs7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBEQUEwRCxzQkFBc0I7QUFDaEYsa0ZBQWtGLHdCQUF3QjtBQUMxRzs7Ozs7Ozs7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7Ozs7Ozs7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QixzQkFBc0IsdUJBQXVCLFdBQVcsSUFBSTtBQUM1RCxHQUFHO0FBQ0gsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJEQUEyRDtBQUMzRDtBQUNBLEtBQUs7QUFDTDtBQUNBLHNCQUFzQixtQ0FBbUM7QUFDekQsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0VBQWdFLGdDQUFnQztBQUNoRztBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMERBQTBELGtCQUFrQjs7QUFFNUU7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLHVCQUF1Qjs7QUFFM0Msb0RBQW9ELDZCQUE2Qjs7QUFFakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNILDBCQUEwQixlQUFlLEVBQUU7QUFDM0MsMEJBQTBCLGdCQUFnQjtBQUMxQyxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvREFBb0QsT0FBTyxRQUFRLGlDQUFpQztBQUNwRyxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0VBQXdFO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ3pPQTtBQUNBOzs7QUFHQTtBQUNBLHNDQUF1Qyx1QkFBdUIsbUJBQW1CLEdBQUcsc0JBQXNCLDBCQUEwQiw2QkFBNkIsR0FBRyxxQkFBcUIsZ0JBQWdCLG1CQUFtQixHQUFHLG9CQUFvQixlQUFlLGdCQUFnQixHQUFHLHFCQUFxQixlQUFlLGdCQUFnQixHQUFHLHNCQUFzQixnQkFBZ0IsaUJBQWlCLEdBQUcscUJBQXFCLGdCQUFnQixpQkFBaUIsR0FBRyxvQkFBb0IsZ0JBQWdCLGlCQUFpQixHQUFHLHVCQUF1QixnQkFBZ0IsaUJBQWlCLEdBQUc7O0FBRWxqQjs7Ozs7Ozs7QUNQQTtBQUNBOzs7QUFHQTtBQUNBLHFDQUFzQyxnQkFBZ0IsR0FBRyxlQUFlLGlCQUFpQixHQUFHLGFBQWEsZ0JBQWdCLGlCQUFpQixHQUFHOztBQUU3STs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0ZBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7OzsrZUFQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFLQTtBQUNBLElBQU14SixTQUFTL0QsaUJBQU84RCxTQUFQLENBQWlCLE1BQWpCLENBQWY7a0JBQ2VDLE07OztBQUVmQSxPQUFPdUgsV0FBUCxDQUNFO0FBQ0V0SSxRQUFNLFlBRFI7QUFFRUYsZUFBYVgsZUFBS2tPO0FBRnBCLENBREYsRUFNRTtBQUNFck4sUUFBTSxTQURSO0FBRUVGLGVBQWFYLGVBQUttTztBQUZwQixDQU5GOztBQVdFO0FBQ0E7QUFDQTtBQUNFdE4sUUFBTSxNQURSO0FBRUV1TixXQUFTLGdCQUZYO0FBR0VwTixhQUFXLE1BSGI7QUFJRUw7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFDRTtBQURGLGlDQUVhO0FBQ1QsZUFBTyxLQUFLMkksT0FBTCxDQUFhOU0sT0FBYixDQUFxQixLQUFyQixFQUE0QixHQUE1QixDQUFQO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQWdDd0QsZUFBS3FPLE9BQXJDLENBSkY7QUFVRTdNLFNBQU8sQ0FDTDtBQUNFZ0MsV0FBTyx5QkFEVDtBQUVFaEMsV0FBTyxDQUNMLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FESyxFQUVMLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FGSyxFQUdMLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FISyxFQUlMLENBQUMsT0FBRCxFQUFVLE9BQVYsQ0FKSyxFQUtMLENBQUMsWUFBRCxFQUFlLFlBQWYsQ0FMSztBQUZULEdBREssRUFXTDtBQUNFZ0MsV0FBTyx3Q0FEVDtBQUVFaEMsV0FBTyxDQUNMLENBQUMsT0FBRCxFQUFVekMsU0FBVixDQURLLEVBRUwsQ0FBQyxRQUFELEVBQVdBLFNBQVgsQ0FGSyxDQUVxQjtBQUZyQjtBQUZULEdBWEs7QUFWVCxDQWJGOztBQTRDRTtBQUNBO0FBQ0E7QUFDQTtBQUNFOEIsUUFBTSxZQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFUCxhQUFXLFlBSGI7QUFJRW9OLFdBQVMsZ0JBSlg7QUFLRXpOO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQ0U7QUFERixpQ0FFYTtBQUNULGVBQU8sS0FBSzJJLE9BQUwsQ0FBYTlNLE9BQWIsQ0FBcUIsS0FBckIsRUFBNEIsR0FBNUIsQ0FBUDtBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUFzQ3dELGVBQUtxTyxPQUEzQyxDQUxGO0FBV0U1TixhQUFXO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQVJTLEVBUUEsT0FSQSxFQVFTLE9BUlQsRUFRa0IsS0FSbEIsRUFReUIsSUFSekIsRUFRK0IsSUFSL0IsRUFTVCxRQVRTLEVBU0MsUUFURCxFQVNXLE9BVFgsRUFTb0IsU0FUcEIsRUFTK0IsUUFUL0IsRUFTeUMsU0FUekMsRUFTb0QsUUFUcEQsRUFTOEQsSUFUOUQsRUFVVCxTQVZTLEVBVUUsTUFWRixFQVVVLFFBVlYsRUFXVCxNQVhTLEVBV0QsT0FYQyxFQVdRLFNBWFIsRUFXbUIsUUFYbkIsRUFZVCxLQVpTLEVBWUYsTUFaRSxFQWFULFNBYlMsRUFjVCxHQWRTLEVBY0osSUFkSSxFQWNFLE1BZEYsRUFlVCxNQWZTLEVBZUQsTUFmQyxFQWdCVCxJQWhCUyxFQWdCSCxPQWhCRyxFQWdCTSxNQWhCTixFQWlCVCxNQWpCUyxFQWlCRCxLQWpCQyxFQWtCVCxJQWxCUyxFQWtCSCxLQWxCRyxFQWtCSSxJQWxCSixFQWtCVSxNQWxCVixFQWtCa0IsVUFsQmxCLEVBa0I4QixJQWxCOUIsRUFrQm9DLEtBbEJwQyxFQWtCMkMsU0FsQjNDLEVBa0JzRCxNQWxCdEQsRUFtQlQsT0FuQlMsRUFtQkEsT0FuQkEsRUFvQlQsTUFwQlMsRUFvQkQsS0FwQkMsRUFvQk0sTUFwQk4sRUFvQmMsU0FwQmQsRUFvQnlCLE1BcEJ6QixFQW9CaUMsSUFwQmpDLEVBb0J1QyxRQXBCdkMsRUFvQmlELFNBcEJqRCxFQXFCVCxXQXJCUyxFQXFCSSxPQXJCSixFQXFCYSxZQXJCYixFQXFCMkIsUUFyQjNCLEVBcUJxQyxPQXJCckMsRUFxQjhDLElBckI5QyxFQXFCb0QsTUFyQnBELEVBcUI0RCxRQXJCNUQsRUFzQlQsUUF0QlMsRUFzQkMsSUF0QkQsRUF1QlQsT0F2QlMsRUF1QkEsTUF2QkEsRUF1QlEsUUF2QlIsRUF1QmtCLFNBdkJsQjs7QUF5QlQ7QUFDQSxPQTFCUyxFQTJCVCxJQTNCUyxFQTJCSCxNQTNCRyxFQTRCVCxVQTVCUyxFQTZCVCxLQTdCUyxFQTZCRixNQTdCRSxFQThCVCxJQTlCUyxFQStCVCxRQS9CUyxFQWdDVCxLQWhDUyxFQWdDRixNQWhDRTs7QUFrQ1Q7QUFDQSxRQW5DUyxFQW9DVCxJQXBDUyxFQXFDVCxXQXJDUyxFQXNDVCxPQXRDUzs7QUF3Q1Q7QUFDQSxRQXpDUyxFQXlDRCxPQXpDQyxFQTBDVCxLQTFDUyxFQTBDRixJQTFDRSxFQTJDVCxJQTNDUyxFQTJDSCxRQTNDRyxFQTRDVCxTQTVDUyxFQTRDRSxTQTVDRjs7QUE4Q1Q7QUFDQTtBQUNBLE9BaERTLEVBZ0RGLEtBaERFLEVBZ0RLLE9BaERMLEVBZ0RjLE1BaERkLEVBZ0RzQixNQWhEdEIsRUFpRFQsS0FqRFMsRUFpREYsT0FqREUsRUFpRE8sT0FqRFAsRUFpRGdCLE1BakRoQixFQWlEd0IsS0FqRHhCLENBWGI7QUE4REVlLFNBQU8sQ0FDTDtBQUNFZ0MsV0FBTywrQkFEVDtBQUVFaEMsV0FBTyxDQUNMLENBQUMsRUFBRCxFQUFLekMsU0FBTCxDQURLLEVBRUwsQ0FBQyxLQUFELEVBQVEsS0FBUixDQUZLLEVBR0wsQ0FBQyxTQUFELEVBQVksU0FBWixDQUhLLEVBSUwsQ0FBQyxTQUFELEVBQVksU0FBWixDQUpLLEVBS0wsQ0FBQyxPQUFELEVBQVUsT0FBVixDQUxLLEVBTUwsQ0FBQyxZQUFELEVBQWUsWUFBZixDQU5LO0FBRlQsR0FESyxFQVlMO0FBQ0V5RSxXQUFPLDhDQURUO0FBRUVoQyxXQUFPLENBQ0wsQ0FBQyxFQUFELEVBQUt6QyxTQUFMLENBREssRUFFTCxDQUFDLE9BQUQsRUFBVUEsU0FBVixDQUZLLEVBR0wsQ0FBQyxRQUFELEVBQVdBLFNBQVgsQ0FISyxFQUdzQjtBQUMzQixLQUFDLEtBQUQsRUFBUUEsU0FBUixDQUpLO0FBRlQsR0FaSyxFQXFCTDtBQUNFeUUsV0FBTyw4QkFEVDtBQUVFaEMsV0FBTyxDQUNMLENBQUMsS0FBRCxFQUFRekMsU0FBUixDQURLO0FBRlQsR0FyQks7QUE5RFQsQ0EvQ0Y7O0FBMklFO0FBQ0E7QUFDQTtBQUNFOEIsUUFBTSxNQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFUCxhQUFXLE1BSGI7QUFJRW9OLFdBQVMsNEVBSlg7QUFLRXpOO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQ0U7QUFERixpQ0FFYTtBQUNULFlBQUkyTCxPQUFPLEtBQUtoRCxPQUFoQjtBQUNBLGdCQUFPZ0QsSUFBUDtBQUNFO0FBQ0EsZUFBSyxNQUFMO0FBQWMsbUJBQU8sT0FBUDs7QUFFZDtBQUNBLGVBQUssTUFBTDtBQUFjLG1CQUFPLE9BQVA7QUFDZCxlQUFLLE1BQUw7QUFBYyxtQkFBTyxRQUFQO0FBQ2QsZUFBSyxXQUFMO0FBQWtCLG1CQUFPLFdBQVA7QUFDbEIsZUFBSyxRQUFMO0FBQWdCLG1CQUFPLFFBQVA7QUFDaEIsZUFBSyxTQUFMO0FBQWlCLG1CQUFPLFNBQVA7QUFDakIsZUFBSyxTQUFMO0FBQWlCLG1CQUFPLFNBQVA7QUFDakIsZUFBSyxTQUFMO0FBQWlCLG1CQUFPLFNBQVA7QUFDakIsZUFBSyxRQUFMO0FBQWdCLG1CQUFPLFFBQVA7QUFDaEI7QUFDRSxtQkFBT0EsS0FBSzlQLE9BQUwsQ0FBYSxLQUFiLEVBQW9CLEdBQXBCLENBQVA7QUFkSjtBQWdCRDtBQXBCSDs7QUFBQTtBQUFBLElBQWdDd0QsZUFBS3FPLE9BQXJDLENBTEY7QUEyQkU1TixhQUFXLENBQUUsR0FBRixDQTNCYjtBQTRCRWUsU0FBTyxDQUNMO0FBQ0VnQyxXQUFPLHlCQURUO0FBRUVoQyxXQUFPLENBQ0wsQ0FBQyxLQUFELEVBQVEsS0FBUixDQURLLEVBRUwsQ0FBQyxTQUFELEVBQVksU0FBWixDQUZLLEVBR0wsQ0FBQyxTQUFELEVBQVksU0FBWixDQUhLLEVBSUwsQ0FBQyxPQUFELEVBQVUsT0FBVixDQUpLLEVBS0wsQ0FBQyxZQUFELEVBQWUsWUFBZixDQUxLO0FBRlQsR0FESyxFQVdMO0FBQ0VnQyxXQUFPLHdDQURUO0FBRUVoQyxXQUFPLENBQ0wsQ0FBQyxFQUFELEVBQUt6QyxTQUFMLENBREssRUFFTCxDQUFDLE9BQUQsRUFBVUEsU0FBVixDQUZLLEVBRXFCO0FBQzFCLEtBQUMsUUFBRCxFQUFXQSxTQUFYLENBSEs7QUFGVCxHQVhLLEVBbUJMO0FBQ0V5RSxXQUFPLDhCQURUO0FBRUVoQyxXQUFPLENBQ0wsQ0FBQyxHQUFELEVBQU16QyxTQUFOLENBREs7QUFGVCxHQW5CSztBQTVCVCxDQTdJRjs7QUF1TUU7QUFDQTtBQUNBO0FBQ0U4QixRQUFNLFNBRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VQLGFBQVcsU0FIYjtBQUlFb04sV0FBUyxpREFKWDtBQUtFek47QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQ1QsZ0JBQVEsS0FBSzJJLE9BQWI7QUFDRSxlQUFLLE1BQUw7QUFDQSxlQUFLLEtBQUw7QUFDQSxlQUFLLElBQUw7QUFDQSxlQUFLLFNBQUw7QUFDRSxtQkFBTyxJQUFQOztBQUVGO0FBQ0UsbUJBQU8sS0FBUDtBQVJKO0FBVUQ7QUFaSDs7QUFBQTtBQUFBLElBQW1DdEosZUFBS3FPLE9BQXhDLENBTEY7QUFtQkU3TSxTQUFPLENBQ0w7QUFDRWdDLFdBQU8sNEJBRFQ7QUFFRWhDLFdBQU8sQ0FDTCxDQUFDLEVBQUQsRUFBS3pDLFNBQUwsQ0FESyxFQUVMLENBQUMsTUFBRCxFQUFTLElBQVQsQ0FGSyxFQUdMLENBQUMsS0FBRCxFQUFRLElBQVIsQ0FISyxFQUlMLENBQUMsSUFBRCxFQUFPLElBQVAsQ0FKSyxFQUtMLENBQUMsU0FBRCxFQUFZLElBQVosQ0FMSyxFQU1MLENBQUMsT0FBRCxFQUFVLEtBQVYsQ0FOSyxFQU9MLENBQUMsSUFBRCxFQUFPLEtBQVAsQ0FQSyxFQVFMLENBQUMsUUFBRCxFQUFXLEtBQVgsQ0FSSyxFQVNMLENBQUMsU0FBRCxFQUFZLEtBQVosQ0FUSztBQUZULEdBREssRUFlTDtBQUNFeUUsV0FBTyxpREFEVDtBQUVFaEMsV0FBTyxDQUNMLENBQUMsUUFBRCxFQUFXekMsU0FBWCxDQURLLEVBRUwsQ0FBQyxTQUFELEVBQVlBLFNBQVosQ0FGSyxFQUdMLENBQUMsU0FBRCxFQUFZQSxTQUFaLENBSEs7QUFGVCxHQWZLO0FBbkJULENBek1GOztBQXNQRTtBQUNBO0FBQ0E7QUFDQTtBQUNFOEIsUUFBTSxRQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFUCxhQUFXLFFBSGI7QUFJRUw7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7O0FBZ0JFO0FBaEJGLDRCQWlCUWlCLE1BakJSLEVBaUJnQnBELE1BakJoQixFQWlCbUM7QUFBQSxZQUFYYSxLQUFXLHVFQUFILENBQUc7O0FBQy9CLFlBQUlSLFFBQVFMLE9BQU9hLEtBQVAsQ0FBWjtBQUNBO0FBQ0EsWUFBSSxPQUFPUixLQUFQLEtBQWlCLFFBQXJCLEVBQStCQSxRQUFRbUIsZUFBS3NPLE1BQUwsQ0FBWUMsWUFBWixDQUF5QjFQLEtBQXpCLENBQVI7QUFDL0IsWUFBSSxPQUFPQSxLQUFQLEtBQWlCLFFBQXJCLEVBQStCLE9BQU9FLFNBQVA7QUFDL0IsZUFBTyxLQUFLc0ssS0FBTCxDQUFXO0FBQ2hCQyxtQkFBU3pLLEtBRE87QUFFaEIwSyxxQkFBV2xLLFFBQVE7QUFGSCxTQUFYLENBQVA7QUFJRDs7QUFFRDs7QUEzQkE7O0FBREY7QUFBQTtBQUFBLGlDQTZCYTtBQUNULGVBQU8sS0FBS2lLLE9BQVo7QUFDRDtBQS9CSDs7QUFBQTtBQUFBLElBQWtDdEosY0FBbEMsVUFFU3VPLFlBRlQsR0FFd0I7QUFDcEJDLFVBQU0sQ0FEYztBQUVwQkMsU0FBSyxDQUZlO0FBR3BCQyxTQUFLLENBSGU7QUFJcEJDLFdBQU8sQ0FKYTtBQUtwQkMsVUFBTSxDQUxjO0FBTXBCQyxVQUFNLENBTmM7QUFPcEJDLFNBQUssQ0FQZTtBQVFwQkMsV0FBTyxDQVJhO0FBU3BCQyxXQUFPLENBVGE7QUFVcEJDLFVBQU0sQ0FWYztBQVdwQkMsU0FBSyxFQVhlLEVBRnhCLFFBSkY7QUFxQ0UxTixTQUFPLENBQ0w7QUFDRWdDLFdBQU8sMkJBRFQ7QUFFRWhDLFdBQU8sQ0FDTCxDQUFDLEdBQUQsRUFBTSxDQUFOLENBREssRUFFTCxDQUFDLE1BQUQsRUFBUyxJQUFULENBRkssRUFHTCxDQUFDLElBQUQsRUFBTyxDQUFDLENBQVIsQ0FISyxFQUlMLENBQUMsS0FBRCxFQUFRLEdBQVIsQ0FKSyxFQUtMLENBQUMsT0FBRCxFQUFVLEdBQVYsQ0FMSyxFQU1MLENBQUMsSUFBRCxFQUFPLENBQVAsQ0FOSyxFQU9MLENBQUMsSUFBRCxFQUFPLEdBQVAsQ0FQSyxFQVFMLENBQUMsVUFBRCxFQUFhLENBQUMsT0FBZCxDQVJLO0FBRlQsR0FESyxFQWNMO0FBQ0VnQyxXQUFPLDBDQURUO0FBRUVoQyxXQUFPLENBQ0wsQ0FBQyxFQUFELEVBQUt6QyxTQUFMLENBREssRUFFTCxDQUFDLEdBQUQsRUFBTUEsU0FBTixDQUZLO0FBRlQsR0FkSyxFQXFCTDtBQUNFeUUsV0FBTyxrREFEVDtBQUVFaEMsV0FBTyxDQUNMLENBQUMsS0FBRCxFQUFRekMsU0FBUixDQURLO0FBRlQsR0FyQks7QUFyQ1QsQ0F6UEY7O0FBNFRFO0FBQ0E7QUFDQTtBQUNBO0FBQ0U4QixRQUFNLE1BRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VQLGFBQVcsTUFIYjtBQUlFTDtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUNFO0FBREYsNEJBRVFpQixNQUZSLEVBRWdCcEQsTUFGaEIsRUFFbUM7QUFBQSxZQUFYYSxLQUFXLHVFQUFILENBQUc7O0FBQy9CLFlBQUlSLFFBQVFMLE9BQU9hLEtBQVAsQ0FBWjtBQUNBLFlBQUksRUFBRVIsaUJBQWlCSixvQkFBVTBRLElBQTdCLENBQUosRUFBd0MsT0FBT3BRLFNBQVA7QUFDeEMsZUFBTyxLQUFLc0ssS0FBTCxDQUFXO0FBQ2hCQyxtQkFBU3pLLE1BQU11USxZQURDO0FBRWhCN0YscUJBQVdsSyxRQUFRO0FBRkgsU0FBWCxDQUFQO0FBSUQ7QUFUSDtBQUFBO0FBQUEsaUNBV2E7QUFDVCxlQUFPLEtBQUtpSyxPQUFaO0FBQ0Q7QUFiSDs7QUFBQTtBQUFBLElBQWdDdEosY0FBaEMsQ0FKRjtBQW1CRXdCLFNBQU8sQ0FDTDtBQUNFZ0MsV0FBTyx3QkFEVDtBQUVFaEMsV0FBTyxDQUNMLENBQUMsSUFBRCxFQUFPLElBQVAsQ0FESyxFQUVMLENBQUMsSUFBRCxFQUFPLElBQVAsQ0FGSyxFQUdMLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FISyxFQUlMLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FKSyxFQUtMLENBQUMsUUFBRCxFQUFXLFFBQVgsQ0FMSyxFQU1MLENBQUMsb0JBQUQsRUFBdUIsb0JBQXZCLENBTkssRUFPTCxDQUFDLHdCQUFELEVBQTJCLHdCQUEzQixDQVBLO0FBRlQsR0FESztBQW5CVCxDQS9URjs7QUFtV0U7QUFDQTtBQUNFWCxRQUFNLGNBRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VGLFVBQVEsNkJBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsWUFDSDBLLElBREcsR0FDTSxLQUFLZCxPQURYLENBQ0hjLElBREc7O0FBRVQsc0JBQVdBLE9BQU9BLEtBQUtsRCxJQUFMLENBQVUsSUFBVixDQUFQLEdBQXlCLEVBQXBDO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQXdDbkksZUFBS29MLFFBQTdDLENBSkY7QUFVRTVKLFNBQU8sQ0FDTDtBQUNFZ0MsV0FBTyxpQ0FEVDtBQUVFaEMsV0FBTyxDQUNMLENBQUMsSUFBRCxFQUFPLElBQVAsQ0FESyxFQUVMLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FGSyxFQUdMLENBQUMsTUFBRCxFQUFTLEtBQVQsQ0FISyxFQUlMLENBQUMsU0FBRCxFQUFZLFdBQVosQ0FKSyxFQUtMLENBQUMsV0FBRCxFQUFjLFdBQWQsQ0FMSyxFQU1MLENBQUMsVUFBRCxFQUFhLFdBQWIsQ0FOSyxFQU9MLENBQUMsZ0JBQUQsRUFBbUIsdUJBQW5CLENBUEs7QUFGVCxHQURLLEVBYUw7QUFDRWdDLFdBQU8sZ0NBRFQ7QUFFRWhDLFdBQU8sQ0FDTCxDQUFDLEVBQUQsRUFBS3pDLFNBQUwsQ0FESyxFQUVMLENBQUMsTUFBRCxFQUFTQSxTQUFULENBRks7QUFGVCxHQWJLO0FBVlQsQ0FwV0Y7O0FBc1lFO0FBQ0E7QUFDRThCLFFBQU0sMEJBRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VGLFVBQVEsb0JBSFY7QUFJRVY7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsWUFDSDZLLFVBREcsR0FDWSxLQUFLakIsT0FEakIsQ0FDSGlCLFVBREc7QUFFVDs7QUFDQSxZQUFJLE9BQU9BLFVBQVAsS0FBc0IsUUFBdEIsSUFBa0NBLFdBQVcrQixVQUFYLENBQXNCLEdBQXRCLENBQWxDLElBQWdFL0IsV0FBVzZELFFBQVgsQ0FBb0IsR0FBcEIsQ0FBcEUsRUFBOEYsT0FBTzdELFVBQVA7QUFDOUYsZUFBTyxNQUFNQSxVQUFOLEdBQW1CLEdBQTFCO0FBQ0Q7QUFOSDs7QUFBQTtBQUFBLElBQW9EeEwsZUFBS29MLFFBQXpELENBSkY7QUFZRTVKLFNBQU8sQ0FDTDtBQUNFZ0MsV0FBTyw2Q0FEVDtBQUVFaEMsV0FBTyxDQUNMLENBQUMsV0FBRCxFQUFjLFdBQWQsQ0FESyxFQUVMLENBQUMsYUFBRCxFQUFnQixXQUFoQixDQUZLLEVBR0wsQ0FBQyxhQUFELEVBQWdCLGFBQWhCLENBSEs7QUFGVCxHQURLLEVBU0w7QUFDRWdDLFdBQU8sd0NBRFQ7QUFFRThMLGVBQVcsWUFGYjtBQUdFOU4sV0FBTyxDQUNMLENBQUMsZUFBRCxFQUFrQixpQkFBbEIsQ0FESyxFQUVMLENBQUMsaUJBQUQsRUFBb0IsaUJBQXBCLENBRkssRUFHTCxDQUFDLG1CQUFELEVBQXNCLGlCQUF0QixDQUhLO0FBSFQsR0FUSyxFQWtCTDtBQUNFZ0MsV0FBTyxtREFEVDtBQUVFaEMsV0FBTyxDQUNMLENBQUMsTUFBRCxFQUFTekMsU0FBVCxDQURLLEVBRUwsQ0FBQyxjQUFELEVBQWlCQSxTQUFqQixDQUZLO0FBRlQsR0FsQks7QUFaVCxDQXZZRixFOzs7Ozs7O0FDYkE7QUFDQTtBQUNBLGlDQUFpQyxRQUFRLG1CQUFtQixVQUFVLEVBQUUsRUFBRTtBQUMxRSxDQUFDOzs7Ozs7OztBQ0hELHVCQUF1QjtBQUN2QjtBQUNBO0FBQ0E7Ozs7Ozs7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRyxZQUFZO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQzFEQTtBQUFBLG1EQUFtRCxnQkFBZ0Isc0JBQXNCLE9BQU8sMkJBQTJCLDBCQUEwQix5REFBeUQsMkJBQTJCLEVBQUUsRUFBRSxFQUFFLGVBQWU7O0FBRTlQLGdDQUFnQywyQ0FBMkMsZ0JBQWdCLGtCQUFrQixPQUFPLDJCQUEyQix3REFBd0QsZ0NBQWdDLHVEQUF1RCwyREFBMkQsRUFBRSxFQUFFLHlEQUF5RCxxRUFBcUUsNkRBQTZELG9CQUFvQixHQUFHLEVBQUU7O0FBRWpqQixpREFBaUQsMENBQTBDLDBEQUEwRCxFQUFFOztBQUV2SixpREFBaUQsYUFBYSx1RkFBdUYsRUFBRSx1RkFBdUY7O0FBRTlPLDBDQUEwQywrREFBK0QscUdBQXFHLEVBQUUseUVBQXlFLGVBQWUseUVBQXlFLEVBQUUsRUFBRSx1SEFBdUg7O0FBRTVlO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDNkI7QUFDVjs7QUFFbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxNQUFNO0FBQ2pCLFlBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx1QkFBdUIsZUFBZTtBQUN0QyxrQ0FBa0MsY0FBYztBQUNoRCxTQUFTO0FBQ1Q7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLHdHQUFnRSxlQUFlLHNCQUFzQjtBQUNyRztBQUNBLEtBQUs7O0FBRUw7QUFDQSxHQUFHOztBQUVILDhEQUFvQixzR0FBc0c7O0FBRTFIO0FBQ0E7O0FBRUEsMkU7Ozs7Ozs7Ozs7O0FDaEZBO0FBQUEsb0dBQW9HLG1CQUFtQixFQUFFLG1CQUFtQiw4SEFBOEg7O0FBRTFRO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxVQUFVO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCLFdBQVcsTUFBTTtBQUNqQixZQUFZLFNBQVM7QUFDckI7QUFDQTtBQUNBLG9GQUFvRixhQUFhO0FBQ2pHO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MscURBQXFEO0FBQ3pGO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsTUFBTTtBQUNqQixZQUFZLFNBQVM7QUFDckI7QUFDQTtBQUNBLG9FQUFvRSxlQUFlO0FBQ25GO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE1BQU07QUFDakIsWUFBWSxTQUFTO0FBQ3JCO0FBQ0E7QUFDQSxvRUFBb0UsZUFBZTtBQUNuRjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7O0FDdEdBO0FBQUEsb0dBQW9HLG1CQUFtQixFQUFFLG1CQUFtQiw4SEFBOEg7O0FBRTFRO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDeUM7O0FBRXpDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsV0FBVyxNQUFNO0FBQ2pCLFlBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQW9CLHFDQUFxQzs7QUFFekQ7QUFDQSxtRUFBbUUsYUFBYTtBQUNoRjtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsd0U7Ozs7Ozs7OztBQ3RGQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsTUFBTTtBQUNqQixZQUFZLE9BQU87QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsZUFBZSxPQUFPO0FBQ3RCO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGVBQWUsT0FBTztBQUN0QjtBQUNBLGVBQWUsTUFBTTtBQUNyQixnQkFBZ0IsUUFBUTtBQUN4QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx3R0FBMEIsMkNBQTJDO0FBQ3JFLE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0EsZ0hBQWtDO0FBQ2xDO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTs7QUFFQSx3RkFBd0YsYUFBYTtBQUNyRztBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLDhFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDM0VBO0FBQUE7QUFDQTs7QUFFQTtBQUNpQzs7QUFFakM7QUFDcUI7O0FBRXJCOzs7Ozs7OztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMkRBQTJEO0FBQzNEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNILEM7Ozs7Ozs7O0FDbEZBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsU0FBUztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFlBQVksU0FBUztBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsaUNBQWlDO0FBQ3BEO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDBEQUFnQixpSDs7Ozs7Ozs7QUMvRWhCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7O0FBR0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOzs7QUFHSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7OztBQUdIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxvRTs7Ozs7Ozs7QUNoRUE7QUFBQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDOzs7Ozs7Ozs7Ozs7Ozs7OztxakJDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7Ozs7Ozs7Ozs7QUFHQTtBQUNBO0lBQ3FCaUIsSTtBQUNwQixpQkFBc0I7QUFBQTs7QUFBQSxvQ0FBUFksS0FBTztBQUFQQSxRQUFPO0FBQUE7O0FBQ3JCM0MsU0FBT0MsTUFBUCxnQkFBYyxJQUFkLFNBQXVCMEMsS0FBdkI7QUFDQTs7QUFFRDs7Ozs7d0JBQ01BLEssRUFBTztBQUNaLFVBQU8sSUFBSSxLQUFLRCxXQUFULENBQXFCLElBQXJCLEVBQTJCQyxLQUEzQixDQUFQO0FBQ0E7O0FBRUY7QUFDQTtBQUNBOztBQUVDO0FBQ0E7Ozs7d0JBQ01nQixNLEVBQVFwRCxNLEVBQStCO0FBQUEsT0FBdkJhLEtBQXVCLHVFQUFmLENBQWU7QUFBQSxPQUFaQyxHQUFZO0FBQUEsT0FBUEMsS0FBTzs7QUFDNUMsVUFBT1IsU0FBUDtBQUNBOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozt1QkFDSzZDLE0sRUFBUXBELE0sRUFBd0I7QUFBQSxPQUFoQmEsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE9BQUxDLEdBQUs7O0FBQ3BDLFVBQU9QLFNBQVA7QUFDQTs7QUFFRjtBQUNBO0FBQ0E7O0FBRUM7Ozs7NkJBQ1c7QUFDVixVQUFPLEtBQUt1SyxPQUFaO0FBQ0E7O0FBR0Y7QUFDQTtBQUNBOzs7O2dDQUNlO0FBQ2IsVUFBT3ZLLFNBQVA7QUFDQTs7QUFFRjtBQUNBO0FBQ0E7Ozs7Ozs7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O2tCQTVEcUJpQixJO0FBNkRyQkEsS0FBS3VQLFFBQUw7QUFBQTs7QUFDQyxxQkFBc0I7QUFBQTs7QUFBQTs7QUFBQSxxQ0FBUDNPLEtBQU87QUFBUEEsUUFBTztBQUFBOztBQUVyQjtBQUZxQiw2SUFDWkEsS0FEWTs7QUFHckIsTUFBSSxDQUFDUixNQUFNQyxPQUFOLENBQWMsTUFBSzZLLFFBQW5CLENBQUwsRUFBbUMsTUFBS0EsUUFBTCxHQUFnQixDQUFDLE1BQUtBLFFBQU4sQ0FBaEI7QUFIZDtBQUlyQjs7QUFFRDtBQUNBOzs7QUFSRDtBQUFBO0FBQUEsd0JBU090SixNQVRQLEVBU2VwRCxNQVRmLEVBUzhDO0FBQUEsT0FBdkJhLEtBQXVCLHVFQUFmLENBQWU7QUFBQSxPQUFaQyxHQUFZO0FBQUEsT0FBUEMsS0FBTzs7QUFDNUMsT0FBSSxDQUFDLEtBQUtpUSxpQkFBTCxDQUF1QmhSLE1BQXZCLEVBQStCYSxLQUEvQixFQUFzQ0MsR0FBdEMsQ0FBTCxFQUFpRCxPQUFPUCxTQUFQO0FBQ2pELFVBQU8sS0FBS3NLLEtBQUwsQ0FBVztBQUNqQkMsYUFBUyxLQUFLNEIsUUFBTCxDQUFjL0MsSUFBZCxDQUFtQixLQUFLc0gsZ0JBQXhCLENBRFE7QUFFakJsRyxlQUFXbEssUUFBUSxLQUFLNkwsUUFBTCxDQUFjN007QUFGaEIsSUFBWCxDQUFQO0FBSUE7O0FBRUQ7O0FBakJEO0FBQUE7QUFBQSx1QkFrQk11RCxNQWxCTixFQWtCY3BELE1BbEJkLEVBa0JzRDtBQUFBLE9BQWhDYSxLQUFnQyx1RUFBeEIsQ0FBd0I7QUFBQSxPQUFyQkMsR0FBcUIsdUVBQWZkLE9BQU9ILE1BQVE7O0FBQ25ELE9BQUlxUixRQUFRLEtBQUt4RSxRQUFMLENBQWMsQ0FBZCxDQUFaO0FBQ0EsUUFBSyxJQUFJbUMsUUFBUWhPLEtBQWpCLEVBQXdCZ08sUUFBUS9OLEdBQWhDLEVBQXFDK04sT0FBckMsRUFBOEM7QUFDNUMsUUFBSTdPLE9BQU82TyxLQUFQLE1BQWtCcUMsS0FBdEIsRUFBNkI7QUFDN0IsUUFBSSxLQUFLRixpQkFBTCxDQUF1QmhSLE1BQXZCLEVBQStCNk8sS0FBL0IsRUFBc0MvTixHQUF0QyxDQUFKLEVBQWdELE9BQU8sSUFBUDtBQUNqRDtBQUNELFVBQU8sS0FBUDtBQUNEOztBQUVEOztBQTNCRDtBQUFBO0FBQUEsb0NBNEJtQmQsTUE1Qm5CLEVBNEIyRDtBQUFBLE9BQWhDYSxLQUFnQyx1RUFBeEIsQ0FBd0I7QUFBQSxPQUFyQkMsR0FBcUIsdUVBQWZkLE9BQU9ILE1BQVE7O0FBQ3hELE9BQUksS0FBSzZNLFFBQUwsQ0FBYzdNLE1BQWQsS0FBeUIsQ0FBN0IsRUFBZ0MsT0FBT0csT0FBT2EsS0FBUCxNQUFrQixLQUFLNkwsUUFBTCxDQUFjLENBQWQsQ0FBekI7QUFDL0IsVUFBTyxLQUFLQSxRQUFMLENBQWN5RSxLQUFkLENBQW9CLFVBQUNDLE9BQUQsRUFBVUMsQ0FBVjtBQUFBLFdBQWlCeFEsUUFBUXdRLENBQVIsR0FBWXZRLEdBQWIsSUFBc0JzUSxZQUFZcFIsT0FBT2EsUUFBUXdRLENBQWYsQ0FBbEQ7QUFBQSxJQUFwQixDQUFQO0FBQ0Y7QUEvQkY7QUFBQTtBQUFBLDZCQWlDYTtBQUNULFVBQU8sS0FBS3ZHLE9BQVo7QUFDRDtBQW5DSDtBQUFBO0FBQUEsNkJBcUNZO0FBQ1YsZUFBVSxLQUFLNEIsUUFBTCxDQUFjL0MsSUFBZCxDQUFtQixLQUFLc0gsZ0JBQUwsSUFBeUIsRUFBNUMsQ0FBVixJQUE0RCxLQUFLSyxRQUFMLEdBQWdCLEdBQWhCLEdBQXNCLEVBQWxGO0FBQ0E7QUF2Q0Y7O0FBQUE7QUFBQSxFQUF1QzlQLElBQXZDOztBQTBDQTtBQUNBO0FBQ0FBLEtBQUt1TSxPQUFMO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUEsRUFBcUN2TSxLQUFLdVAsUUFBMUM7O0FBR0E7QUFDQTtBQUNBdlAsS0FBS2lMLFFBQUw7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQSxFQUF1Q2pMLEtBQUt1UCxRQUE1QztBQUNBdFIsT0FBT2tELGNBQVAsQ0FBc0JuQixLQUFLaUwsUUFBTCxDQUFjck4sU0FBcEMsRUFBK0Msa0JBQS9DLEVBQW1FLEVBQUV3RCxPQUFPLEdBQVQsRUFBbkU7O0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FwQixLQUFLcU8sT0FBTDtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUNDO0FBREQsd0JBRU96TSxNQUZQLEVBRWVwRCxNQUZmLEVBRThDO0FBQUEsT0FBdkJhLEtBQXVCLHVFQUFmLENBQWU7QUFBQSxPQUFaQyxHQUFZO0FBQUEsT0FBUEMsS0FBTzs7QUFDNUMsT0FBSVYsUUFBUUwsT0FBT2EsS0FBUCxDQUFaO0FBQ0EsT0FBSSxPQUFPUixLQUFQLEtBQWlCLFFBQXJCLEVBQStCLE9BQU9FLFNBQVA7O0FBRS9CLE9BQUkyTSxRQUFRN00sTUFBTTZNLEtBQU4sQ0FBWSxLQUFLMEMsT0FBakIsQ0FBWjtBQUNBLE9BQUksQ0FBQzFDLEtBQUwsRUFBWSxPQUFPM00sU0FBUDs7QUFFWjtBQUNBLE9BQUl1SyxVQUFVb0MsTUFBTSxDQUFOLENBQWQ7QUFDQSxPQUFJLEtBQUtqTCxTQUFMLElBQWtCLEtBQUtBLFNBQUwsQ0FBZTZJLE9BQWYsQ0FBdEIsRUFBK0MsT0FBT3ZLLFNBQVA7O0FBRS9DLFVBQU8sS0FBS3NLLEtBQUwsQ0FBVztBQUNqQkMsb0JBRGlCO0FBRWpCQyxlQUFXbEssUUFBUTtBQUZGLElBQVgsQ0FBUDtBQUlBOztBQUVEOztBQW5CRDtBQUFBO0FBQUEsdUJBb0JNdUMsTUFwQk4sRUFvQmNwRCxNQXBCZCxFQW9Cc0M7QUFBQSxPQUFoQmEsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE9BQUxDLEdBQUs7O0FBQ3BDLFVBQU9kLE9BQU8yRCxLQUFQLENBQWE5QyxLQUFiLEVBQW9CQyxHQUFwQixFQUF5QnlRLElBQXpCLENBQThCO0FBQUEsV0FBUyxPQUFPbFIsS0FBUCxLQUFpQixRQUFqQixJQUE2QnVQLFFBQVE5UixJQUFSLENBQWF1QyxLQUFiLENBQXRDO0FBQUEsSUFBOUIsQ0FBUDtBQUNBO0FBdEJGO0FBQUE7QUFBQSw2QkF3Qlk7QUFDVixVQUFPLEtBQUt1UCxPQUFMLENBQWE0QixNQUFwQjtBQUNBO0FBMUJGOztBQUFBO0FBQUEsRUFBcUNoUSxJQUFyQzs7QUE4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBQSxLQUFLaVEsT0FBTDtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsd0JBQ09yTyxNQURQLEVBQ2VwRCxNQURmLEVBQzhDO0FBQUEsT0FBdkJhLEtBQXVCLHVFQUFmLENBQWU7QUFBQSxPQUFaQyxHQUFZO0FBQUEsT0FBUEMsS0FBTzs7QUFDNUMsT0FBSTJRLGNBQWN0TyxPQUFPMUMsY0FBUCxDQUFzQixLQUFLaVIsT0FBM0IsRUFBb0MzUixNQUFwQyxFQUE0Q2EsS0FBNUMsRUFBbURDLEdBQW5ELEVBQXdEQyxLQUF4RCxzQkFBaUYsS0FBS0UsSUFBdEYsT0FBbEI7QUFDQSxPQUFJLENBQUN5USxXQUFMLEVBQWtCLE9BQU9uUixTQUFQO0FBQ2xCLE9BQUksS0FBSzBNLFFBQVQsRUFBbUJ5RSxZQUFZekUsUUFBWixHQUF1QixLQUFLQSxRQUE1QjtBQUNuQixVQUFPeUUsV0FBUDtBQUNBOztBQUVEOztBQVJEO0FBQUE7QUFBQSx1QkFTTXRPLE1BVE4sRUFTY3BELE1BVGQsRUFTc0M7QUFBQSxPQUFoQmEsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE9BQUxDLEdBQUs7O0FBQ3BDLFVBQU9zQyxPQUFPdEYsSUFBUCxDQUFZLEtBQUs2VCxPQUFqQixFQUEwQjNSLE1BQTFCLEVBQWtDYSxLQUFsQyxFQUF5Q0MsR0FBekMsQ0FBUDtBQUNBO0FBWEY7QUFBQTtBQUFBLDZCQWFZO0FBQ1YsaUJBQVcsS0FBS21NLFFBQUwsR0FBZ0IsS0FBS0EsUUFBTCxHQUFjLEdBQTlCLEdBQW9DLEVBQS9DLElBQW9ELEtBQUswRSxPQUF6RCxVQUFvRSxLQUFLTCxRQUFMLEdBQWdCLEdBQWhCLEdBQXNCLEVBQTFGO0FBQ0E7QUFmRjs7QUFBQTtBQUFBLEVBQXFDOVAsSUFBckM7O0FBbUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUEsS0FBS29MLFFBQUw7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLHdCQUNPeEosTUFEUCxFQUNlcEQsTUFEZixFQUM4QztBQUFBLE9BQXZCYSxLQUF1Qix1RUFBZixDQUFlO0FBQUEsT0FBWkMsR0FBWTtBQUFBLE9BQVBDLEtBQU87O0FBQzVDO0FBQ0EsT0FBSSxLQUFLeUwsUUFBVCxFQUFtQjtBQUNsQjtBQUNBLFFBQUlwSixPQUFPdEYsSUFBUCxDQUFZLEtBQUswTyxRQUFqQixFQUEyQnhNLE1BQTNCLEVBQW1DYSxLQUFuQyxNQUE4QyxLQUFsRCxFQUF5RCxPQUFPTixTQUFQO0FBQ3pEOztBQUVEO0FBQ0EsT0FBSSxLQUFLZ00sYUFBVCxFQUF3QjtBQUN2QjtBQUNBLFFBQUl4TCxTQUFTQSxNQUFNNlEsUUFBTixDQUFlLElBQWYsQ0FBYixFQUFtQyxPQUFPclIsU0FBUDs7QUFFbkM7QUFDQVEsWUFBUUEsUUFBUUEsTUFBTUssTUFBTixFQUFSLEdBQXlCLEVBQWpDO0FBQ0FMLFVBQU1rQyxJQUFOLENBQVcsSUFBWDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFRCxPQUFJNkgsVUFBVSxFQUFkO0FBQ0EsT0FBSUMsWUFBWWxLLEtBQWhCO0FBQ0EsT0FBSWdPLFFBQVEsQ0FBWjtBQUFBLE9BQWU1TixPQUFPVixTQUF0QjtBQUNBLFVBQU9VLE9BQU8sS0FBS0MsS0FBTCxDQUFXMk4sT0FBWCxDQUFkLEVBQW1DO0FBQ2xDLFFBQUkzQixRQUFRak0sS0FBS04sS0FBTCxDQUFXeUMsTUFBWCxFQUFtQnBELE1BQW5CLEVBQTJCK0ssU0FBM0IsRUFBc0NqSyxHQUF0QyxFQUEyQ0MsS0FBM0MsQ0FBWjtBQUNBLFFBQUksQ0FBQ21NLEtBQUQsSUFBVSxDQUFDak0sS0FBS3FRLFFBQXBCLEVBQThCLE9BQU8vUSxTQUFQO0FBQzlCLFFBQUkyTSxLQUFKLEVBQVc7QUFDVnBDLGFBQVE3SCxJQUFSLENBQWFpSyxLQUFiO0FBQ0FuQyxpQkFBWW1DLE1BQU1uQyxTQUFsQjtBQUNBO0FBQ0Q7QUFDRDtBQUNBLFVBQU8sS0FBS0YsS0FBTCxDQUFXO0FBQ2pCQyxvQkFEaUI7QUFFakJDO0FBRmlCLElBQVgsQ0FBUDtBQUlBOztBQUdGO0FBQ0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQS9DRDtBQUFBOzs7QUFtRkM7QUFuRkQsNkJBb0ZZO0FBQ1QsT0FBTTdKLFFBQVEsS0FBS0EsS0FBTCxDQUFXSSxHQUFYLENBQWU7QUFBQSxXQUFRTCxLQUFLNFEsUUFBTCxFQUFSO0FBQUEsSUFBZixDQUFkO0FBQ0QsZUFBVSxLQUFLM1EsS0FBTCxDQUFXeUksSUFBWCxDQUFnQixHQUFoQixDQUFWLElBQWlDLEtBQUsySCxRQUFMLEdBQWdCLEdBQWhCLEdBQXNCLEVBQXZEO0FBQ0E7QUF2RkY7QUFBQTtBQUFBLHNCQWdEZTtBQUNiLE9BQUksQ0FBQyxLQUFLeEcsT0FBVixFQUFtQixPQUFPdkssU0FBUDtBQUNuQixPQUFJd0wsVUFBVStGLFdBQVcsRUFBWCxFQUFlLEtBQUtoSCxPQUFwQixDQUFkO0FBQ0EsT0FBSSxLQUFLaUgsT0FBVCxFQUFrQmhHLFFBQVFnRyxPQUFSLEdBQWtCLEtBQUtBLE9BQXZCO0FBQ2xCLFVBQU9oRyxPQUFQOztBQUVFLFlBQVMrRixVQUFULENBQW9CL0YsT0FBcEIsRUFBNkJqQixPQUE3QixFQUFzQztBQUNwQyxRQUFJK0QsUUFBUSxDQUFaO0FBQUEsUUFBZTNCLFFBQVEzTSxTQUF2QjtBQUNBLFdBQU8yTSxRQUFRcEMsUUFBUStELE9BQVIsQ0FBZixFQUFpQztBQUMvQixTQUFJM0IsTUFBTThFLE9BQVYsRUFBbUI7QUFDakJGLGlCQUFXL0YsT0FBWCxFQUFvQm1CLE1BQU1wQyxPQUExQjtBQUNELE1BRkQsTUFHSztBQUNILFVBQU1tSCxhQUFhL0UsTUFBTUQsUUFBTixJQUFrQkMsTUFBTXJPLEtBQXhCLElBQWlDcU8sTUFBTS9LLFdBQU4sQ0FBa0JFLElBQXRFO0FBQ0EsVUFBTTZQLFlBQVksTUFBTUQsVUFBeEI7QUFDQSxVQUFNVCxTQUFTdEUsTUFBTXRNLFFBQU4sRUFBZjtBQUNBO0FBQ0EsVUFBSXNSLGFBQWFuRyxPQUFqQixFQUEwQjtBQUN4QixXQUFJLENBQUNuSyxNQUFNQyxPQUFOLENBQWNrSyxRQUFRbUcsU0FBUixDQUFkLENBQUwsRUFBd0M7QUFDdENuRyxnQkFBUW1HLFNBQVIsSUFBcUIsQ0FBQ25HLFFBQVFtRyxTQUFSLENBQUQsQ0FBckI7QUFDQW5HLGdCQUFRa0csVUFBUixJQUFzQixDQUFDbEcsUUFBUWtHLFVBQVIsQ0FBRCxDQUF0QjtBQUNEO0FBQ0RsRyxlQUFRbUcsU0FBUixFQUFtQmpQLElBQW5CLENBQXdCaUssS0FBeEI7QUFDQW5CLGVBQVFrRyxVQUFSLEVBQW9CaFAsSUFBcEIsQ0FBeUJ1TyxNQUF6QjtBQUNELE9BUEQsTUFRSztBQUNIekYsZUFBUW1HLFNBQVIsSUFBcUJoRixLQUFyQjtBQUNBbkIsZUFBUWtHLFVBQVIsSUFBc0JULE1BQXRCO0FBQ0Q7QUFDRjtBQUNGO0FBQ0QsV0FBT3pGLE9BQVA7QUFDRDtBQUNIO0FBakZGOztBQUFBO0FBQUEsRUFBdUN2SyxJQUF2Qzs7QUE0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUEsS0FBS0MsWUFBTDtBQUFBOztBQUNDLHlCQUFzQjtBQUFBOztBQUFBOztBQUFBLHFDQUFQVyxLQUFPO0FBQVBBLFFBQU87QUFBQTs7QUFBQSx3SkFDWkEsS0FEWTs7QUFFckIsTUFBSSxDQUFDLE9BQUtsQixLQUFWLEVBQWlCLE9BQUtBLEtBQUwsR0FBYSxFQUFiO0FBRkk7QUFHckI7O0FBRUQ7QUFDQTtBQUNBOzs7QUFSRDtBQUFBO0FBQUEsdUJBU01rQyxNQVROLEVBU2NwRCxNQVRkLEVBU3NDO0FBQUEsT0FBaEJhLEtBQWdCLHVFQUFSLENBQVE7QUFBQSxPQUFMQyxHQUFLOztBQUNwQyxPQUFJK04sUUFBUSxDQUFaO0FBQUEsT0FBZTVOLE9BQU9WLFNBQXRCO0FBQ0EsVUFBT1UsT0FBTyxLQUFLQyxLQUFMLENBQVcyTixPQUFYLENBQWQsRUFBbUM7QUFDbEMsUUFBSTVOLEtBQUtuRCxJQUFMLENBQVVzRixNQUFWLEVBQWtCcEQsTUFBbEIsRUFBMEJhLEtBQTFCLEVBQWlDQyxHQUFqQyxDQUFKLEVBQTJDLE9BQU8sSUFBUDtBQUMzQztBQUNELFVBQU8sS0FBUDtBQUNBOztBQUVEOztBQWpCRDtBQUFBO0FBQUEsd0JBa0JPc0MsTUFsQlAsRUFrQmVwRCxNQWxCZixFQWtCOEM7QUFBQSxPQUF2QmEsS0FBdUIsdUVBQWYsQ0FBZTtBQUFBLE9BQVpDLEdBQVk7QUFBQSxPQUFQQyxLQUFPOztBQUM1QyxPQUFJb1IsVUFBVSxFQUFkO0FBQ0EsT0FBSXRELFFBQVEsQ0FBWjtBQUFBLE9BQWU1TixPQUFPVixTQUF0QjtBQUNBLFVBQU9VLE9BQU8sS0FBS0MsS0FBTCxDQUFXMk4sT0FBWCxDQUFkLEVBQW1DO0FBQ2xDLFFBQUkzQixRQUFRak0sS0FBS04sS0FBTCxDQUFXeUMsTUFBWCxFQUFtQnBELE1BQW5CLEVBQTJCYSxLQUEzQixFQUFrQ0MsR0FBbEMsRUFBdUNDLEtBQXZDLENBQVo7QUFDQSxRQUFJbU0sS0FBSixFQUFXaUYsUUFBUWxQLElBQVIsQ0FBYWlLLEtBQWI7QUFDWDs7QUFFRCxPQUFJLENBQUNpRixRQUFRdFMsTUFBYixFQUFxQixPQUFPVSxTQUFQOztBQUVyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFJNlIsWUFBYUQsUUFBUXRTLE1BQVIsS0FBbUIsQ0FBbkIsR0FBdUJzUyxRQUFRLENBQVIsQ0FBdkIsR0FBb0MsS0FBS0UsWUFBTCxDQUFrQkYsT0FBbEIsQ0FBckQ7O0FBRUE7QUFDQSxPQUFJLEtBQUtsRixRQUFULEVBQW1CbUYsVUFBVW5GLFFBQVYsR0FBcUIsS0FBS0EsUUFBMUIsQ0FBbkIsS0FDSyxJQUFJLEtBQUtwTyxLQUFULEVBQWdCdVQsVUFBVXZULEtBQVYsR0FBa0IsS0FBS0EsS0FBdkI7QUFDdkI7O0FBRUUsVUFBT3VULFNBQVA7QUFDQTs7QUFFRDtBQUNBO0FBQ0E7O0FBN0NEO0FBQUE7QUFBQSwrQkE4Q2NELE9BOUNkLEVBOEN1QjtBQUNyQixVQUFPQSxRQUFRblEsTUFBUixDQUFlLFVBQVVzUSxJQUFWLEVBQWdCQyxPQUFoQixFQUF5QjtBQUM5QyxRQUFJQSxRQUFReEgsU0FBUixHQUFvQnVILEtBQUt2SCxTQUE3QixFQUF3QyxPQUFPd0gsT0FBUDtBQUN4QyxXQUFPRCxJQUFQO0FBQ0EsSUFITSxFQUdKSCxRQUFRLENBQVIsQ0FISSxDQUFQO0FBSUE7QUFuREY7QUFBQTtBQUFBLDRCQXFEa0I7QUFBQTs7QUFDaEIsa0JBQUtqUixLQUFMLEVBQVcrQixJQUFYO0FBQ0E7QUF2REY7QUFBQTtBQUFBLDZCQXlEWTtBQUNULE9BQU0vQixRQUFRLEtBQUtBLEtBQUwsQ0FBV0ksR0FBWCxDQUFlO0FBQUEsV0FBUUwsS0FBSzRRLFFBQUwsRUFBUjtBQUFBLElBQWYsRUFBd0NsSSxJQUF4QyxDQUE2QyxHQUE3QyxDQUFkO0FBQ0QsaUJBQVcsS0FBS3NELFFBQUwsR0FBZ0IsS0FBS0EsUUFBTCxHQUFjLEdBQTlCLEdBQW9DLEVBQS9DLElBQW9EL0wsS0FBcEQsVUFBNkQsS0FBS29RLFFBQUwsR0FBZ0IsR0FBaEIsR0FBc0IsRUFBbkY7QUFDQTtBQTVERjs7QUFBQTtBQUFBLEVBQStDOVAsSUFBL0M7O0FBZ0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBQSxLQUFLZ1IsTUFBTDtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsd0JBQ09wUCxNQURQLEVBQ2VwRCxNQURmLEVBQzhDO0FBQUEsT0FBdkJhLEtBQXVCLHVFQUFmLENBQWU7QUFBQSxPQUFaQyxHQUFZO0FBQUEsT0FBUEMsS0FBTzs7QUFDNUMsT0FBSStKLFVBQVUsRUFBZDtBQUNBLE9BQUlDLFlBQVlsSyxLQUFoQjtBQUNBLFVBQU8sSUFBUCxFQUFhO0FBQ1osUUFBSXFNLFFBQVEsS0FBS3VGLE1BQUwsQ0FBWTlSLEtBQVosQ0FBa0J5QyxNQUFsQixFQUEwQnBELE1BQTFCLEVBQWtDK0ssU0FBbEMsRUFBNkNqSyxHQUE3QyxFQUFrREMsS0FBbEQsQ0FBWjtBQUNBLFFBQUksQ0FBQ21NLEtBQUwsRUFBWTs7QUFFWnBDLFlBQVE3SCxJQUFSLENBQWFpSyxLQUFiO0FBQ0FuQyxnQkFBWW1DLE1BQU1uQyxTQUFsQjtBQUNBOztBQUVELE9BQUlELFFBQVFqTCxNQUFSLEtBQW1CLENBQXZCLEVBQTBCLE9BQU9VLFNBQVA7O0FBRTFCLFVBQU8sS0FBS3NLLEtBQUwsQ0FBVztBQUNqQkMsb0JBRGlCO0FBRWpCQztBQUZpQixJQUFYLENBQVA7QUFJQTtBQWxCRjtBQUFBO0FBQUEsNkJBb0JZO0FBQ1YsT0FBSSxDQUFDLEtBQUtELE9BQVYsRUFBbUIsT0FBT3ZLLFNBQVA7QUFDbkIsVUFBTyxLQUFLdUssT0FBTCxDQUFheEosR0FBYixDQUFpQjtBQUFBLFdBQVM0TCxNQUFNdE0sUUFBTixFQUFUO0FBQUEsSUFBakIsQ0FBUDtBQUNBO0FBdkJGO0FBQUE7QUFBQSw2QkF5Qlk7QUFDVixPQUFJOFIsaUJBQWtCLEtBQUtELE1BQUwsWUFBdUJqUixLQUFLb0wsUUFBN0IsSUFDYixLQUFLNkYsTUFBTCxZQUF1QmpSLEtBQUt1UCxRQUE1QixJQUF3QyxLQUFLMEIsTUFBTCxDQUFZL0YsUUFBWixDQUFxQjdNLE1BQXJCLEdBQThCLENBRDlFO0FBRUUsT0FBTTRTLFNBQVMsS0FBS0EsTUFBTCxDQUFZWixRQUFaLEVBQWY7QUFDRixPQUFNNVEsT0FBT3lSLHVCQUFxQkQsTUFBckIsY0FBb0NBLE1BQWpEO0FBQ0EsZUFBVXhSLElBQVYsSUFBaUIsS0FBS3FRLFFBQUwsR0FBZ0IsR0FBaEIsR0FBc0IsR0FBdkM7QUFDQTtBQS9CRjs7QUFBQTtBQUFBLEVBQW1DOVAsSUFBbkM7O0FBbUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBQSxLQUFLZ08sSUFBTDtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsd0JBQ09wTSxNQURQLEVBQ2VwRCxNQURmLEVBQzhDO0FBQUEsT0FBdkJhLEtBQXVCLHVFQUFmLENBQWU7QUFBQSxPQUFaQyxHQUFZO0FBQUEsT0FBUEMsS0FBTzs7QUFDNUM7QUFDRjtBQUNFLFFBQUtzTSxJQUFMLENBQVVpRSxRQUFWLEdBQXFCLElBQXJCO0FBQ0EsUUFBS3FCLFNBQUwsQ0FBZXJCLFFBQWYsR0FBMEIsSUFBMUI7O0FBRUEsT0FBSXhHLFVBQVUsRUFBZDtBQUNBLE9BQUlDLFlBQVlsSyxLQUFoQjtBQUNBLFVBQU8sSUFBUCxFQUFhO0FBQ1o7QUFDQSxRQUFJd00sT0FBTyxLQUFLQSxJQUFMLENBQVUxTSxLQUFWLENBQWdCeUMsTUFBaEIsRUFBd0JwRCxNQUF4QixFQUFnQytLLFNBQWhDLEVBQTJDakssR0FBM0MsRUFBZ0RDLEtBQWhELENBQVg7QUFDQSxRQUFJLENBQUNzTSxJQUFMLEVBQVc7O0FBRVh2QyxZQUFRN0gsSUFBUixDQUFhb0ssSUFBYjtBQUNBdEMsZ0JBQVlzQyxLQUFLdEMsU0FBakI7O0FBRUE7QUFDQSxRQUFJNEgsWUFBWSxLQUFLQSxTQUFMLENBQWVoUyxLQUFmLENBQXFCeUMsTUFBckIsRUFBNkJwRCxNQUE3QixFQUFxQytLLFNBQXJDLEVBQWdEakssR0FBaEQsRUFBcURDLEtBQXJELENBQWhCO0FBQ0EsUUFBSSxDQUFDNFIsU0FBTCxFQUFnQjtBQUNoQjVILGdCQUFZNEgsVUFBVTVILFNBQXRCO0FBQ0E7O0FBRUQ7QUFDQSxPQUFJRCxRQUFRakwsTUFBUixLQUFtQixDQUF2QixFQUEwQixPQUFPVSxTQUFQOztBQUUxQixVQUFPLEtBQUtzSyxLQUFMLENBQVc7QUFDakJDLG9CQURpQjtBQUVqQkM7QUFGaUIsSUFBWCxDQUFQO0FBSUE7O0FBRUQ7O0FBaENEO0FBQUE7QUFBQSw2QkFpQ1k7QUFDVixPQUFJLENBQUMsS0FBS0QsT0FBVixFQUFtQixPQUFPLEVBQVA7QUFDbkIsVUFBTyxLQUFLQSxPQUFMLENBQWF4SixHQUFiLENBQWtCO0FBQUEsV0FBUzRMLE1BQU10TSxRQUFOLEVBQVQ7QUFBQSxJQUFsQixDQUFQO0FBQ0E7QUFwQ0Y7QUFBQTtBQUFBLDZCQXNDWTtBQUNULE9BQU15TSxPQUFPLEtBQUtBLElBQUwsQ0FBVXdFLFFBQVYsRUFBYjtBQUNBLE9BQU1jLFlBQVksS0FBS0EsU0FBTCxDQUFlZCxRQUFmLEVBQWxCO0FBQ0QsaUJBQVcsS0FBSzVFLFFBQUwsR0FBZ0IsS0FBS0EsUUFBTCxHQUFjLEdBQTlCLEdBQW9DLEVBQS9DLElBQW9ESSxJQUFwRCxTQUE0RHNGLFNBQTVELFVBQXlFLEtBQUtyQixRQUFMLEdBQWdCLEdBQWhCLEdBQXNCLEVBQS9GO0FBQ0E7QUExQ0Y7O0FBQUE7QUFBQSxFQUErQjlQLElBQS9COztBQStDQTtBQUNBO0FBQ0FBLEtBQUs0SyxLQUFMO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7OztBQUVDO0FBRkQsNkJBR1loSixNQUhaLEVBR29COEksS0FIcEIsRUFHdUM7QUFBQTs7QUFBQSxPQUFaMEcsTUFBWSx1RUFBSCxDQUFHOztBQUNyQyxPQUFJOUgsVUFBVSxFQUFkO0FBQ0Y7QUFDRW9CLFNBQU0yRyxRQUFOLENBQWUvUSxPQUFmLENBQXVCLFVBQUN1TCxJQUFELEVBQU93QixLQUFQLEVBQWlCO0FBQ3ZDLFFBQUlwTyxlQUFKO0FBQ0EsUUFBSTRNLEtBQUt4TixNQUFMLEtBQWdCLENBQXBCLEVBQXVCO0FBQ3RCaUwsYUFBUTdILElBQVIsQ0FBYSxJQUFJekIsS0FBS3NSLFNBQVQsRUFBYjtBQUNBLEtBRkQsTUFHSyxJQUFJekYsZ0JBQWdCcE4sb0JBQVVtTSxLQUE5QixFQUFxQztBQUN6QyxTQUFJMkcsT0FBT2pJLFFBQVFBLFFBQVFqTCxNQUFSLEdBQWlCLENBQXpCLENBQVg7QUFDQSxTQUFJa1QsS0FBS0MsVUFBVCxFQUFxQjtBQUNwQkQsV0FBS0MsVUFBTCxDQUFnQjVQLE1BQWhCLEVBQXdCaUssSUFBeEIsRUFBOEJ1RixTQUFTLENBQXZDO0FBQ0EsTUFGRCxNQUdLO0FBQ0osVUFBSTFHLFNBQVEsUUFBSzhHLFVBQUwsQ0FBZ0I1UCxNQUFoQixFQUF3QmlLLElBQXhCLEVBQThCdUYsU0FBUyxDQUF2QyxDQUFaO0FBQ0EsVUFBSTFHLFdBQVUzTCxTQUFkLEVBQXlCdUssUUFBUTdILElBQVIsQ0FBYWlKLE1BQWI7QUFDekI7QUFDRCxLQVRJLE1BVUE7QUFDSnBCLGVBQVVBLFFBQVExSixNQUFSLENBQWUsUUFBSzZSLGNBQUwsQ0FBb0I3UCxNQUFwQixFQUE0QmlLLElBQTVCLENBQWYsQ0FBVjtBQUNBO0FBQ0QsSUFsQkQ7O0FBb0JBLFVBQU8sSUFBSTdMLEtBQUs0SyxLQUFULENBQWU7QUFDckJ3RyxrQkFEcUI7QUFFckI5SDtBQUZxQixJQUFmLENBQVA7QUFJQTs7QUFFRDtBQUNBO0FBQ0E7QUFDQTs7QUFuQ0Q7QUFBQTtBQUFBLGlDQW9DZ0IxSCxNQXBDaEIsRUFvQ3dCcEQsTUFwQ3hCLEVBb0NnQztBQUM5QixPQUFJK0wsVUFBVSxFQUFkO0FBQ0EsT0FBSWxMLFFBQVEsQ0FBWjtBQUFBLE9BQWVDLE1BQU1kLE9BQU9ILE1BQTVCO0FBQ0EsT0FBSW9NLGtCQUFKO0FBQUEsT0FBZThGLGdCQUFmOztBQUVBO0FBQ0EsT0FBSS9SLE9BQU9hLEtBQVAsYUFBeUJaLG9CQUFVaVQsVUFBdkMsRUFBbURyUzs7QUFFbkQ7QUFDQSxPQUFJYixPQUFPYyxNQUFJLENBQVgsYUFBeUJiLG9CQUFVMFAsT0FBdkMsRUFBZ0Q7QUFDL0NvQyxjQUFVM08sT0FBTzFDLGNBQVAsQ0FBc0IsU0FBdEIsRUFBaUNWLE1BQWpDLEVBQXlDYyxNQUFJLENBQTdDLEVBQWdEQSxHQUFoRCxFQUFxRFAsU0FBckQsRUFBZ0UsZ0JBQWhFLENBQVY7QUFDQTtBQUNBd0wsWUFBUTlJLElBQVIsQ0FBYThPLE9BQWI7QUFDQWpSO0FBQ0E7O0FBRUQ7QUFDQW1MLGVBQVk3SSxPQUFPMUMsY0FBUCxDQUFzQixXQUF0QixFQUFtQ1YsTUFBbkMsRUFBMkNhLEtBQTNDLEVBQWtEQyxHQUFsRCxFQUF1RFAsU0FBdkQsRUFBa0UsZ0JBQWxFLENBQVo7QUFDQTtBQUNBLE9BQUksQ0FBQzBMLFNBQUQsSUFBYyxDQUFDOEYsT0FBbkIsRUFBNEI7QUFDM0IsUUFBSW5ELFFBQVEsSUFBSXBOLEtBQUsyUixtQkFBVCxDQUE2QjtBQUN4Q0MsZUFBVXBULE9BQU8yRCxLQUFQLENBQWE5QyxLQUFiLEVBQW9CQyxHQUFwQixFQUF5QjZJLElBQXpCLENBQThCLEdBQTlCO0FBRDhCLEtBQTdCLENBQVo7QUFHQW9DLFlBQVE5SSxJQUFSLENBQWEyTCxLQUFiO0FBQ0E7O0FBRUQ7QUFQQSxRQVFLLElBQUkzQyxhQUFhQSxVQUFVbEIsU0FBVixLQUF3QmpLLEdBQXpDLEVBQThDO0FBQ2xELFNBQUk4TixTQUFRLElBQUlwTixLQUFLMlIsbUJBQVQsQ0FBNkI7QUFDeENFLGNBQVNyVCxPQUFPMkQsS0FBUCxDQUFhOUMsS0FBYixFQUFvQm9MLFVBQVVsQixTQUE5QixFQUF5Q3BCLElBQXpDLENBQThDLEdBQTlDLENBRCtCO0FBRXhDeUosZ0JBQVdwVCxPQUFPMkQsS0FBUCxDQUFhc0ksVUFBVWxCLFNBQXZCLEVBQWtDakssR0FBbEMsRUFBdUM2SSxJQUF2QyxDQUE0QyxHQUE1QztBQUY2QixNQUE3QixDQUFaO0FBSUFvQyxhQUFROUksSUFBUixDQUFhMkwsTUFBYjtBQUNBOztBQUVEO0FBUkssU0FTQSxJQUFJM0MsU0FBSixFQUFlO0FBQ25CRixjQUFROUksSUFBUixDQUFhZ0osU0FBYjtBQUNBOztBQUVELFVBQU9GLE9BQVA7QUFDQTs7QUFFRDs7QUEvRUQ7QUFBQTtBQUFBLGtDQWdGcUM7QUFBQSxPQUF0QkcsS0FBc0IsdUVBQWQsS0FBS3BCLE9BQVM7O0FBQ25DLE9BQUlpQixVQUFVLEVBQWQ7QUFBQSxPQUFrQkUsa0JBQWxCOztBQUVBLFFBQUssSUFBSW9GLElBQUksQ0FBYixFQUFnQkEsSUFBSW5GLE1BQU1yTSxNQUExQixFQUFrQ3dSLEdBQWxDLEVBQXVDO0FBQ3RDLFFBQUluRSxRQUFRaEIsTUFBTW1GLENBQU4sQ0FBWjtBQUNHO0FBQ0EsUUFBSTtBQUNFcEYsaUJBQVlpQixNQUFNdE0sUUFBTixNQUFvQixFQUFoQztBQUNMLEtBRkQsQ0FFRSxPQUFPMFMsQ0FBUCxFQUFVO0FBQ1YxVSxhQUFRZ1EsS0FBUixDQUFjMEUsQ0FBZDtBQUNBMVUsYUFBUTBJLElBQVIsQ0FBYSwwQkFBYixFQUF5QzRFLEtBQXpDLEVBQWdELFlBQWhELEVBQThEZ0IsS0FBOUQ7QUFDRDtBQUNEO0FBQ0gsUUFBSSwwQkFBYWpCLFNBQWIsQ0FBSixFQUE2QjtBQUM1QkYsYUFBUTlJLElBQVIsQ0FBYSxFQUFiO0FBQ0EsS0FGRCxNQUdLLElBQUlyQixNQUFNQyxPQUFOLENBQWNvSyxTQUFkLENBQUosRUFBOEI7QUFDbENGLGVBQVVBLFFBQVEzSyxNQUFSLENBQWU2SyxTQUFmLENBQVY7QUFDQSxLQUZJLE1BR0EsSUFBSSxPQUFPQSxTQUFQLEtBQXFCLFFBQXpCLEVBQW1DO0FBQ3ZDQSxpQkFBWUEsVUFBVXhDLEtBQVYsQ0FBZ0IsSUFBaEIsQ0FBWjtBQUNBc0MsZUFBVUEsUUFBUTNLLE1BQVIsQ0FBZTZLLFNBQWYsQ0FBVjtBQUNBLEtBSEksTUFJQTtBQUNKck4sYUFBUTBJLElBQVIsQ0FBYSxrREFBYixFQUFpRTJFLFNBQWpFLEVBQTRFLGdCQUE1RSxFQUE4RmlCLEtBQTlGO0FBQ0E7QUFDRDtBQUNELE9BQUksS0FBSzBGLE1BQUwsS0FBZ0IsQ0FBcEIsRUFBdUI7QUFDdEIsV0FBTyxPQUFPN0csUUFBUXBDLElBQVIsQ0FBYSxNQUFiLENBQWQ7QUFDQTtBQUNELFVBQU9vQyxRQUFRcEMsSUFBUixDQUFhLElBQWIsQ0FBUDtBQUNBO0FBL0dGO0FBQUE7QUFBQSw2QkFpSFk7QUFDVixVQUFPLFNBQVMsS0FBSzRKLGFBQUwsRUFBVCxHQUFnQyxJQUFoQyxHQUF1QyxHQUE5QztBQUNBOztBQUVEO0FBQ0E7O0FBdEhEO0FBQUE7QUFBQSxnQ0F1SGU7QUFBQSxrQkFDZ0MsS0FBS3hILE9BRHJDO0FBQUEsT0FDQTFKLElBREEsWUFDUG1SLEtBRE87QUFBQSxPQUNrQnBGLFNBRGxCLFlBQ01xRixVQUROOztBQUViLE9BQUl2SCxRQUFTLEtBQUtBLEtBQUwsSUFBYyxLQUFLQSxLQUFMLENBQVdwQixPQUExQixJQUFzQyxFQUFsRDs7QUFFQSxPQUFJNEksUUFBUSxFQUFaO0FBQ0EsT0FBSXBVLGFBQWEsRUFBakI7QUFDQSxPQUFJcVUsVUFBVSxFQUFkO0FBQ0EsT0FBSUMsUUFBUSxFQUFaO0FBQ0ExSCxTQUFNNUssR0FBTixDQUFVO0FBQUEsV0FBYTJLLFVBQVU0SCxXQUFWLEVBQWI7QUFBQSxJQUFWLEVBQ0cxVCxNQURILENBQ1VpSyxPQURWLEVBRUd0SSxPQUZILENBRVdnUyxZQUZYOztBQUlBLFVBQU87QUFDTmhHLFVBQU0sU0FEQTtBQUVOekwsY0FGTTtBQUdOK0wsd0JBSE07QUFJTnNGLGdCQUpNO0FBS05wVSwwQkFMTTtBQU1OcVUsb0JBTk07QUFPTkM7QUFQTSxJQUFQOztBQVVBLFlBQVNFLFlBQVQsQ0FBc0IzRixTQUF0QixFQUFpQztBQUNoQztBQUNBLFFBQUl2TSxNQUFNQyxPQUFOLENBQWNzTSxTQUFkLENBQUosRUFBOEIsT0FBT0EsVUFBVXJNLE9BQVYsQ0FBa0JnUyxZQUFsQixDQUFQOztBQUU5QjtBQUNBLFFBQUkzRixVQUFVOUwsSUFBZCxFQUFvQnFSLE1BQU12RixVQUFVOUwsSUFBaEIsSUFBd0I4TCxTQUF4Qjs7QUFFcEI7QUFDQSxRQUFJQSxVQUFVTCxJQUFWLEtBQW1CLFVBQXZCLEVBQW1DNkYsUUFBUTFRLElBQVIsQ0FBYWtMLFNBQWIsRUFBbkMsS0FDSyxJQUFJQSxVQUFVTCxJQUFWLEtBQW1CLFVBQXZCLEVBQW1DeE8sV0FBVzJELElBQVgsQ0FBZ0JrTCxTQUFoQixFQUFuQyxLQUNBeUYsTUFBTTNRLElBQU4sQ0FBV2tMLFNBQVg7QUFDTDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBOztBQTlKRDtBQUFBO0FBQUEsc0NBK0ptQztBQUNqQyxPQUFJaEMsYUFBYSxFQUFqQjs7QUFEaUMsc0NBQU5uTixJQUFNO0FBQU5BLFFBQU07QUFBQTs7QUFFakMsUUFBSyxJQUFJcVMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJclMsS0FBS2EsTUFBekIsRUFBaUN3UixHQUFqQyxFQUFzQztBQUNyQyxRQUFJbEgsTUFBTW5MLEtBQUtxUyxDQUFMLENBQVY7QUFDQSxRQUFJelAsTUFBTUMsT0FBTixDQUFjc0ksR0FBZCxDQUFKLEVBQXdCO0FBQ3ZCZ0Msa0JBQWFBLFdBQVcvSyxNQUFYLENBQWtCK0ksR0FBbEIsQ0FBYjtBQUNBLEtBRkQsTUFHSyxJQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFuQixFQUE2QjtBQUNqQ2dDLGdCQUFXbEosSUFBWCxDQUFnQmtILEdBQWhCO0FBQ0E7QUFDRDtBQUNEZ0MsZ0JBQWFBLFdBQVd4QyxJQUFYLENBQWdCLElBQWhCLENBQWI7O0FBRUEsT0FBSSxDQUFDd0MsVUFBTCxFQUFpQixPQUFPLElBQVA7QUFDakIsT0FBSSxDQUFDQSxXQUFXeUYsUUFBWCxDQUFvQixJQUFwQixDQUFELElBQThCekYsV0FBV3RNLE1BQVgsR0FBb0IsRUFBdEQsRUFBMEQ7QUFDekQsa0JBQVlzTSxXQUFXWixJQUFYLEVBQVo7QUFDQTtBQUNELE9BQUlZLFdBQVcsQ0FBWCxNQUFrQixJQUF0QixFQUE0QkEsb0JBQWtCQSxVQUFsQjtBQUM1QixrQkFBYUEsVUFBYjtBQUNBO0FBbExGOztBQUFBO0FBQUEsRUFBaUMzSyxLQUFLb0wsUUFBdEM7O0FBdUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FwTCxLQUFLa08sVUFBTDtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOzs7QUFFQztBQUZELHdCQUdPdE0sTUFIUCxFQUdlcEQsTUFIZixFQUc4RDtBQUFBLE9BQXZDYSxLQUF1Qyx1RUFBL0IsQ0FBK0I7QUFBQSxPQUE1QkMsR0FBNEIsdUVBQXRCZCxPQUFPSCxNQUFlO0FBQUEsT0FBUGtCLEtBQU87O0FBQzVELE9BQUltTCxRQUFRak0sb0JBQVU4VCxlQUFWLENBQTBCL1QsTUFBMUIsRUFBa0NhLEtBQWxDLEVBQXlDQyxHQUF6QyxDQUFaOztBQUVBLE9BQUlnSyxVQUFVLEtBQUtrSSxVQUFMLENBQWdCNVAsTUFBaEIsRUFBd0I4SSxLQUF4QixDQUFkO0FBQ0EsT0FBSSxDQUFDcEIsT0FBTCxFQUFjLE9BQU92SyxTQUFQOztBQUVkLFVBQU8sS0FBS3NLLEtBQUwsQ0FBVztBQUNqQkMsb0JBRGlCO0FBRWpCQyxlQUFXaks7QUFGTSxJQUFYLENBQVA7QUFJQTs7QUFFRDs7QUFmRDtBQUFBO0FBQUEsNkJBZ0JZO0FBQ1YsVUFBTyxLQUFLZ0ssT0FBTCxDQUFheUksYUFBYixFQUFQO0FBQ0E7QUFsQkY7O0FBQUE7QUFBQSxFQUEyQy9SLEtBQUs0SyxLQUFoRDs7QUFzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTVLLEtBQUs4SyxjQUFMO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7OztBQUVDO0FBRkQsNkJBR1lsSixNQUhaLEVBR29COEksS0FIcEIsRUFHdUM7QUFBQSxPQUFaMEcsTUFBWSx1RUFBSCxDQUFHOztBQUNyQyxRQUFLMUcsS0FBTCxpSUFBaUN0TSxTQUFqQztBQUNBOztBQUVBOztBQVBGO0FBQUE7QUFBQSxzQkFRZ0I7QUFDWixPQUFJbU0sd0hBQUo7QUFDQSxPQUFJQSxXQUFXLEtBQUtHLEtBQXBCLEVBQTJCO0FBQ3pCSCxZQUFRaUksTUFBUixHQUFpQixLQUFLOUgsS0FBdEI7QUFDQUgsWUFBUUcsS0FBUixHQUFnQixLQUFLQSxLQUFMLENBQVd0TCxRQUFYLEVBQWhCO0FBQ0Q7QUFDRCxVQUFPbUwsT0FBUDtBQUNEO0FBZkg7O0FBQUE7QUFBQSxFQUFvRHZLLEtBQUs0SyxLQUF6RDs7QUFtQkE7QUFDQTVLLEtBQUtzUixTQUFMO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSw2QkFDWTtBQUNWLFVBQU8sSUFBUDtBQUNBO0FBSEY7O0FBQUE7QUFBQSxFQUEwQ3RSLElBQTFDOztBQU1BO0FBQ0FBLEtBQUttTyxPQUFMO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQ0M7QUFERCx3QkFFT3ZNLE1BRlAsRUFFZXBELE1BRmYsRUFFOEM7QUFBQSxPQUF2QmEsS0FBdUIsdUVBQWYsQ0FBZTtBQUFBLE9BQVpDLEdBQVk7QUFBQSxPQUFQQyxLQUFPOztBQUM1QyxPQUFJVixRQUFRTCxPQUFPYSxLQUFQLENBQVo7QUFDQSxPQUFJLEVBQUVSLGlCQUFpQkosb0JBQVUwUCxPQUE3QixDQUFKLEVBQTJDLE9BQU9wUCxTQUFQO0FBQzNDLFVBQU8sS0FBS3NLLEtBQUwsQ0FBVztBQUNqQkMsYUFBU3pLLEtBRFE7QUFFakIwSyxlQUFXbEssUUFBUTtBQUZGLElBQVgsQ0FBUDtBQUlBO0FBVEY7QUFBQTtBQUFBLDZCQVdZO0FBQ1YsaUJBQVksS0FBS2lLLE9BQUwsQ0FBYW1KLFVBQXpCLEdBQXNDLEtBQUtuSixPQUFMLENBQWFpSCxPQUFuRDtBQUNBO0FBYkY7O0FBQUE7QUFBQSxFQUFxQ3ZRLElBQXJDOztBQWdCQTtBQUNBQSxLQUFLMlIsbUJBQUw7QUFBQTs7QUFDQyx3QkFBc0I7QUFBQTs7QUFBQTs7QUFBQSxxQ0FBUC9RLEtBQU87QUFBUEEsUUFBTztBQUFBOztBQUFBLHVKQUNaQSxLQURZOztBQUVyQixNQUFJL0MsaUJBQU93RSxJQUFYLEVBQWlCakYsUUFBUTBJLElBQVIsQ0FBYSxRQUFLMEcsT0FBbEI7QUFGSTtBQUdyQjs7QUFKRjtBQUFBO0FBQUEsNkJBZVk7QUFDVixVQUFPLFFBQVEsS0FBS0EsT0FBTCxDQUFhdkUsS0FBYixDQUFtQixJQUFuQixFQUF5QkUsSUFBekIsQ0FBOEIsT0FBOUIsQ0FBZjtBQUNBO0FBakJGO0FBQUE7QUFBQSxzQkFNZTtBQUNiLE9BQUksS0FBSzBKLE1BQVQsRUFBaUI7QUFDaEIsV0FBTyxrQ0FDSCxpQkFERyxHQUNnQixLQUFLQSxNQURyQixHQUM4QixLQUQ5QixHQUVILGlCQUZHLEdBRWdCLEtBQUtELFFBRnJCLEdBRWdDLEdBRnZDO0FBR0E7QUFDRCxVQUFPLDZCQUE2QixLQUFLQSxRQUFsQyxHQUE2QyxHQUFwRDtBQUNBO0FBYkY7O0FBQUE7QUFBQSxFQUFxRDVSLElBQXJELEU7Ozs7Ozs7Ozs7Ozs7Ozs7a0JDM3NCd0IwUyxTO1FBd0NSQyxXLEdBQUFBLFc7O0FBM0RoQjs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7OztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ2UsU0FBU0QsU0FBVCxDQUFtQnJSLE1BQW5CLEVBQTJCVixXQUEzQixFQUF3QztBQUNyRDtBQUNBLE1BQUlQLE1BQU1DLE9BQU4sQ0FBY2dCLE1BQWQsQ0FBSixFQUEyQjtBQUN6QjtBQUNBLFFBQU0zQixTQUFRMkIsT0FBT3ZCLEdBQVAsQ0FBVztBQUFBLGFBQVU0UyxVQUFVclIsTUFBVixFQUFrQix1QkFBV1YsV0FBWCxDQUFsQixDQUFWO0FBQUEsS0FBWCxDQUFkO0FBQ0E7QUFDQSxRQUFNaVMsV0FBVyx1QkFBVzVTLGVBQUtDLFlBQWhCLEVBQThCVSxZQUFZRSxJQUExQyxDQUFqQjtBQUNBNUMsV0FBT2tELGNBQVAsQ0FBc0J5UixTQUFTaFYsU0FBL0IsRUFBMEMsT0FBMUMsRUFBbUQsRUFBRXdELE9BQU8xQixNQUFULEVBQW5EO0FBQ0EsV0FBTyxJQUFJa1QsUUFBSixFQUFQO0FBQ0Q7O0FBRUQsTUFBSWxULFFBQVFpVCxZQUFZdFIsTUFBWixFQUFvQixFQUFwQixDQUFaO0FBQ0EsTUFBSTNCLE1BQU1yQixNQUFOLEtBQWlCLENBQXJCLEVBQXdCO0FBQ3RCLFVBQU0sSUFBSTZMLFdBQUosd0JBQXFDNUksTUFBTSxDQUFOLENBQXJDLFVBQWtERCxNQUFsRCx5QkFBTjtBQUNEOztBQUVEO0FBQ0EsTUFBSVYsWUFBWS9DLFNBQVosWUFBaUNvQyxlQUFLaUwsUUFBdEMsSUFDQXRLLFlBQVkvQyxTQUFaLFlBQWlDb0MsZUFBS3VNLE9BRHRDLElBRUE1TCxZQUFZL0MsU0FBWixZQUFpQ29DLGVBQUtnTyxJQUZ0QyxJQUdBck4sWUFBWS9DLFNBQVosWUFBaUNvQyxlQUFLQyxZQUgxQyxFQUlFO0FBQ0EsU0FBSyxJQUFJOEksUUFBVCxJQUFxQnJKLE1BQU0sQ0FBTixDQUFyQixFQUErQjtBQUM3QnpCLGFBQU9rRCxjQUFQLENBQXNCUixZQUFZL0MsU0FBbEMsRUFBNkNtTCxRQUE3QyxFQUF1RCxFQUFFM0gsT0FBTzFCLE1BQU0sQ0FBTixFQUFTcUosUUFBVCxDQUFULEVBQXZEO0FBQ0Q7QUFDRixHQVJELE1BU0s7QUFDSDlLLFdBQU9rRCxjQUFQLENBQXNCUixZQUFZL0MsU0FBbEMsRUFBNkMsT0FBN0MsRUFBc0QsRUFBRXdELE9BQU8xQixLQUFULEVBQXREO0FBQ0Q7O0FBRUQsU0FBTyxJQUFJaUIsV0FBSixFQUFQO0FBQ0Q7O0FBRUQsU0FBU2tTLGtCQUFULENBQTRCeFIsTUFBNUIsRUFBb0M7QUFDbEMsTUFBTXlSLG9CQUFvQiwwQ0FBMUI7QUFDQSxNQUFJQyxlQUFlMVIsT0FBT3FLLEtBQVAsQ0FBYW9ILGlCQUFiLENBQW5CO0FBQ0EsTUFBSSxDQUFDQyxZQUFMLEVBQW1CLE1BQU0sSUFBSTdJLFdBQUoseUNBQXNEN0ksTUFBdEQsUUFBTjtBQUNuQixTQUFPMFIsWUFBUDtBQUNEOztBQUVNLFNBQVNKLFdBQVQsQ0FBcUJ0UixNQUFyQixFQUFvRDtBQUFBLE1BQXZCM0IsS0FBdUIsdUVBQWYsRUFBZTtBQUFBLE1BQVhMLEtBQVcsdUVBQUgsQ0FBRzs7QUFDekQsTUFBSWdDLFVBQVUsSUFBZCxFQUFvQixNQUFNLElBQUlQLFNBQUosQ0FBYyxxQ0FBZCxDQUFOO0FBQ3BCLE1BQU1pUyxlQUFlLE9BQU8xUixNQUFQLEtBQWtCLFFBQWxCLEdBQ2pCd1IsbUJBQW1CeFIsTUFBbkIsQ0FEaUIsR0FFakJBLE1BRko7O0FBSUEsTUFBSWEsWUFBWTZRLGFBQWExVSxNQUE3QjtBQUNBLFNBQU9nQixRQUFRNkMsU0FBZixFQUEwQjtBQUFBLHNCQUNKOFEsV0FBV0QsWUFBWCxFQUF5QnJULEtBQXpCLEVBQWdDTCxLQUFoQyxDQURJO0FBQUE7QUFBQSxRQUNsQkksSUFEa0I7QUFBQSxRQUNaSCxHQURZOztBQUV4QixRQUFJRyxJQUFKLEVBQVU7QUFDUixVQUFJOFIsT0FBTzdSLE1BQU1BLE1BQU1yQixNQUFOLEdBQWEsQ0FBbkIsQ0FBWDtBQUNBO0FBQ0EsVUFBSWtULFFBQVFBLGdCQUFnQnZSLGVBQUt1TSxPQUE3QixJQUF3QzlNLGdCQUFnQk8sZUFBS3VNLE9BQWpFLEVBQTBFO0FBQ3hFO0FBQ0E3TSxjQUFNdVQsR0FBTjtBQUNBO0FBQ0F4VCxhQUFLeUwsUUFBTCxHQUFnQnFHLEtBQUtyRyxRQUFMLENBQWN0TCxNQUFkLENBQXFCSCxLQUFLeUwsUUFBMUIsQ0FBaEI7QUFDRDtBQUNEeEwsWUFBTStCLElBQU4sQ0FBV2hDLElBQVg7QUFDRDtBQUNESixZQUFRQyxNQUFNLENBQWQ7QUFDRDtBQUNELFNBQU9JLEtBQVA7QUFDRDs7QUFFRCxJQUFNd1Qsa0JBQWtCLGlCQUF4QjtBQUNBLFNBQVNGLFVBQVQsQ0FBb0JELFlBQXBCLEVBQXlEO0FBQUEsTUFBdkJyVCxLQUF1Qix1RUFBZixFQUFlO0FBQUEsTUFBWEwsS0FBVyx1RUFBSCxDQUFHOztBQUN2RCxNQUFJOFQsY0FBY0osYUFBYTFULEtBQWIsQ0FBbEI7O0FBRUE7QUFDQTtBQUNBLE1BQUk4VCxnQkFBZ0IsSUFBcEIsRUFBMEI7QUFDeEIsV0FBT0MsWUFBWUwsWUFBWixFQUEwQnJULEtBQTFCLEVBQWlDTCxRQUFRLENBQXpDLENBQVA7QUFDRDs7QUFFRCxVQUFROFQsV0FBUjtBQUNFLFNBQUssR0FBTDtBQUFVLGFBQU9FLGFBQWFOLFlBQWIsRUFBMkJyVCxLQUEzQixFQUFrQ0wsS0FBbEMsQ0FBUDtBQUNWLFNBQUssR0FBTDtBQUFVLGFBQU9pVSxrQkFBa0JQLFlBQWxCLEVBQWdDclQsS0FBaEMsRUFBdUNMLEtBQXZDLENBQVA7QUFDVixTQUFLLEdBQUw7QUFBVSxhQUFPa1UsVUFBVVIsWUFBVixFQUF3QnJULEtBQXhCLEVBQStCTCxLQUEvQixDQUFQO0FBQ1YsU0FBSyxHQUFMO0FBQ0EsU0FBSyxHQUFMO0FBQ0EsU0FBSyxHQUFMO0FBQVUsYUFBT21VLFlBQVlULFlBQVosRUFBMEJyVCxLQUExQixFQUFpQ0wsS0FBakMsQ0FBUDs7QUFFVjtBQUNBLFNBQUssR0FBTDtBQUNBLFNBQUssR0FBTDtBQUNBLFNBQUssR0FBTDtBQUNBLFNBQUssR0FBTDtBQUNFLFlBQU0sSUFBSTZLLFdBQUosaUJBQThCaUosV0FBOUIsdUJBQTJEOVQsS0FBM0QsWUFBdUUwVCxZQUF2RSxDQUFOOztBQUVGO0FBQ0UsVUFBSUksWUFBWXpILEtBQVosQ0FBa0J3SCxlQUFsQixDQUFKLEVBQXdDO0FBQ3RDLGVBQU9PLGFBQWFWLFlBQWIsRUFBMkJyVCxLQUEzQixFQUFrQ0wsS0FBbEMsQ0FBUDtBQUNELE9BRkQsTUFHSztBQUNILGVBQU8rVCxZQUFZTCxZQUFaLEVBQTBCclQsS0FBMUIsRUFBaUNMLEtBQWpDLENBQVA7QUFDRDtBQXJCTDtBQXVCRDs7QUFHRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTb1UsWUFBVCxDQUFzQlYsWUFBdEIsRUFBd0Y7QUFBQSxNQUFwRHJULEtBQW9ELHVFQUE1QyxFQUE0QztBQUFBLE1BQXhDTCxLQUF3Qyx1RUFBaEMsQ0FBZ0M7QUFBQSxNQUE3QnNCLFdBQTZCLHVFQUFmWCxlQUFLaUwsUUFBVTs7QUFDdEYsTUFBSUMsV0FBVyxFQUFmO0FBQUEsTUFBbUI1TCxZQUFuQjtBQUNBO0FBQ0EsT0FBSyxJQUFJdVEsSUFBSXhRLEtBQWIsRUFBb0J3USxJQUFJa0QsYUFBYTFVLE1BQXJDLEVBQTZDd1IsR0FBN0MsRUFBa0Q7QUFDaEQsUUFBSTZELE9BQU9YLGFBQWFsRCxDQUFiLENBQVg7QUFDQSxRQUFJLE9BQU82RCxJQUFQLEtBQWdCLFFBQWhCLElBQTRCQSxLQUFLaEksS0FBTCxDQUFXd0gsZUFBWCxDQUFoQyxFQUE2RDtBQUMzRGhJLGVBQVN6SixJQUFULENBQWNpUyxJQUFkO0FBQ0FwVSxZQUFNdVEsQ0FBTjtBQUNELEtBSEQsTUFJSztBQUNOOztBQUVELE1BQUlwUSxPQUFPLElBQUlrQixXQUFKLENBQWdCLEVBQUV1SyxrQkFBRixFQUFoQixDQUFYO0FBQ0EsU0FBTyxDQUFFekwsSUFBRixFQUFRSCxHQUFSLENBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxTQUFTOFQsV0FBVCxDQUFxQkwsWUFBckIsRUFBc0Y7QUFBQSxNQUFuRHJULEtBQW1ELHVFQUEzQyxFQUEyQztBQUFBLE1BQXZDTCxLQUF1Qyx1RUFBL0IsQ0FBK0I7QUFBQSxNQUE1QnNCLFdBQTRCLHVFQUFkWCxlQUFLdU0sT0FBUzs7QUFDcEYsTUFBSXBGLFNBQVM0TCxhQUFhMVQsS0FBYixDQUFiO0FBQ0EsTUFBSSxDQUFDc0IsV0FBTCxFQUFrQkEsY0FBY1gsZUFBS3VNLE9BQW5COztBQUVsQjtBQUNBLE1BQUlvSCxZQUFZeE0sT0FBT29HLFVBQVAsQ0FBa0IsSUFBbEIsQ0FBaEI7QUFDQSxNQUFJckMsV0FBV3lJLFlBQVl4TSxPQUFPeEssTUFBUCxDQUFjLENBQWQsQ0FBWixHQUErQndLLE1BQTlDOztBQUVBLE1BQUkxSCxPQUFPLElBQUlrQixXQUFKLENBQWdCLEVBQUV1SyxrQkFBRixFQUFoQixDQUFYOztBQUVBLE1BQUl5SSxTQUFKLEVBQWU7QUFDYmxVLFNBQUs0USxRQUFMLEdBQWdCLFlBQVc7QUFDekIsb0JBQVluRixRQUFaLElBQXVCLEtBQUs0RSxRQUFMLEdBQWdCLEdBQWhCLEdBQXNCLEVBQTdDO0FBQ0QsS0FGRDtBQUdEOztBQUVELFNBQU8sQ0FBRXJRLElBQUYsRUFBUUosS0FBUixDQUFQO0FBQ0Q7O0FBR0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU2lVLGlCQUFULENBQTJCUCxZQUEzQixFQUFnRTtBQUFBLE1BQXZCclQsS0FBdUIsdUVBQWYsRUFBZTtBQUFBLE1BQVhMLEtBQVcsdUVBQUgsQ0FBRzs7QUFBQSw4QkFDekN4QixpQkFBTytWLGdCQUFQLENBQXdCYixZQUF4QixFQUFzQyxHQUF0QyxFQUEyQyxHQUEzQyxFQUFnRDFULEtBQWhELENBRHlDO0FBQUEsTUFDeERDLEdBRHdELHlCQUN4REEsR0FEd0Q7QUFBQSxNQUNuRDZDLEtBRG1ELHlCQUNuREEsS0FEbUQ7O0FBRzlEOzs7QUFDQSxNQUFJcU8sVUFBV3JPLE1BQU0sQ0FBTixNQUFhLEdBQWIsSUFBb0JBLE1BQU0sQ0FBTixNQUFhLEdBQWhEO0FBQ0EsTUFBSXFPLE9BQUosRUFBYTtBQUNYck8sWUFBUUEsTUFBTUEsS0FBTixDQUFZLENBQVosQ0FBUjtBQUNEOztBQUVEO0FBQ0EsTUFBSXNKLGlCQUFKO0FBQ0EsTUFBSXRKLE1BQU05RCxNQUFOLEdBQWUsQ0FBZixJQUFvQjhELE1BQU0sQ0FBTixNQUFhLEdBQXJDLEVBQTBDO0FBQ3hDc0osZUFBV3RKLE1BQU0sQ0FBTixDQUFYO0FBQ0FBLFlBQVFBLE1BQU1BLEtBQU4sQ0FBWSxDQUFaLENBQVI7QUFDRDs7QUFFRDtBQUNBLE1BQUkwUixlQUNGQyxrQkFBa0IzUixLQUFsQixFQUNDckMsR0FERCxDQUNLLFVBQVN6QyxLQUFULEVBQWdCO0FBQ25CLFFBQUlrTixVQUFVb0ksWUFBWXRWLEtBQVosRUFBbUIsRUFBbkIsQ0FBZDtBQUNBLFFBQUlrTixRQUFRbE0sTUFBUixLQUFtQixDQUF2QixFQUEwQjtBQUN4QixhQUFPa00sUUFBUSxDQUFSLENBQVA7QUFDRCxLQUZELE1BR0s7QUFDSCxhQUFPLElBQUl2SyxlQUFLb0wsUUFBVCxDQUFrQixFQUFFMUwsT0FBTzZLLE9BQVQsRUFBbEIsQ0FBUDtBQUNEO0FBQ0YsR0FURCxDQURGOztBQVlBLE1BQUk5SyxPQUFPb1UsYUFBYXhWLE1BQWIsS0FBd0IsQ0FBeEIsR0FBNEJ3VixhQUFhLENBQWIsQ0FBNUIsR0FBOEMsSUFBSTdULGVBQUtDLFlBQVQsQ0FBc0IsRUFBRVAsT0FBT21VLFlBQVQsRUFBdEIsQ0FBekQ7QUFDQSxNQUFJcEksUUFBSixFQUFjaE0sS0FBS2dNLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ2QsTUFBSStFLE9BQUosRUFBYS9RLEtBQUsrUSxPQUFMLEdBQWUsSUFBZjtBQUNiLFNBQU8sQ0FBRS9RLElBQUYsRUFBUUgsR0FBUixDQUFQO0FBQ0Q7O0FBRUQsU0FBU3dVLGlCQUFULENBQTJCdFYsTUFBM0IsRUFBbUM7QUFDakMsTUFBSXFWLGVBQWUsRUFBbkI7QUFDQSxNQUFJOUMsVUFBVSxFQUFkO0FBQ0EsT0FBSyxJQUFJbEIsSUFBSSxDQUFSLEVBQVdoUixLQUFoQixFQUF1QkEsUUFBUUwsT0FBT3FSLENBQVAsQ0FBL0IsRUFBMENBLEdBQTFDLEVBQStDO0FBQzdDO0FBQ0EsUUFBSWhSLFVBQVUsR0FBZCxFQUFtQjtBQUNqQmdWLG1CQUFhcFMsSUFBYixDQUFrQnNQLE9BQWxCO0FBQ0FBLGdCQUFVLEVBQVY7QUFDRDtBQUNEO0FBSkEsU0FLSyxJQUFJbFMsVUFBVSxHQUFkLEVBQW1CO0FBQUEscUNBQ1JoQixpQkFBTytWLGdCQUFQLENBQXdCcFYsTUFBeEIsRUFBZ0MsR0FBaEMsRUFBcUMsR0FBckMsRUFBMENxUixDQUExQyxDQURRO0FBQUEsWUFDaEJ2USxHQURnQiwwQkFDaEJBLEdBRGdCOztBQUV0QnlSLGtCQUFVQSxRQUFRblIsTUFBUixDQUFlcEIsT0FBTzJELEtBQVAsQ0FBYTBOLENBQWIsRUFBZ0J2USxNQUFNLENBQXRCLENBQWYsQ0FBVjtBQUNBdVEsWUFBSXZRLEdBQUo7QUFDRCxPQUpJLE1BS0E7QUFDSHlSLGdCQUFRdFAsSUFBUixDQUFhNUMsS0FBYjtBQUNEO0FBQ0Y7QUFDRCxNQUFJa1MsUUFBUTFTLE1BQVosRUFBb0J3VixhQUFhcFMsSUFBYixDQUFrQnNQLE9BQWxCO0FBQ3BCLFNBQU84QyxZQUFQO0FBQ0Q7O0FBRUQ7QUFDQSxTQUFTTCxXQUFULENBQXFCVCxZQUFyQixFQUEwRDtBQUFBLE1BQXZCclQsS0FBdUIsdUVBQWYsRUFBZTtBQUFBLE1BQVhMLEtBQVcsdUVBQUgsQ0FBRzs7QUFDeEQsTUFBSTBVLFNBQVNoQixhQUFhMVQsS0FBYixDQUFiO0FBQ0EsTUFBSUksT0FBT0MsTUFBTUEsTUFBTXJCLE1BQU4sR0FBZSxDQUFyQixDQUFYO0FBQ0EsTUFBSSxDQUFDb0IsSUFBTCxFQUFXLE1BQU0sSUFBSXlLLFdBQUosaUNBQThDNkosTUFBOUMscUJBQU47O0FBRVg7QUFDQSxNQUFJQSxXQUFXLEdBQVgsSUFBa0JBLFdBQVcsR0FBakMsRUFBc0M7QUFDcEMsUUFBSXRJLFdBQVdoTSxLQUFLZ00sUUFBcEI7QUFDQWhNLFdBQU8sSUFBSU8sZUFBS2dSLE1BQVQsQ0FBZ0IsRUFBRUMsUUFBUXhSLElBQVYsRUFBaEIsQ0FBUDtBQUNBLFFBQUlnTSxRQUFKLEVBQWNoTSxLQUFLZ00sUUFBTCxHQUFnQkEsUUFBaEI7QUFDZDtBQUNBL0wsVUFBTUEsTUFBTXJCLE1BQU4sR0FBZSxDQUFyQixJQUEwQm9CLElBQTFCO0FBQ0Q7O0FBRUQ7QUFDQSxNQUFJc1UsV0FBVyxHQUFYLElBQWtCQSxXQUFXLEdBQWpDLEVBQXNDO0FBQ3BDdFUsU0FBS3FRLFFBQUwsR0FBZ0IsSUFBaEI7QUFDRDs7QUFFRCxTQUFPLENBQUUvUSxTQUFGLEVBQWFNLEtBQWIsQ0FBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBLFNBQVNnVSxZQUFULENBQXNCTixZQUF0QixFQUEyRDtBQUFBLE1BQXZCclQsS0FBdUIsdUVBQWYsRUFBZTtBQUFBLE1BQVhMLEtBQVcsdUVBQUgsQ0FBRzs7QUFDekQsTUFBSXFNLFFBQVE3TixpQkFBTytWLGdCQUFQLENBQXdCYixZQUF4QixFQUFzQyxHQUF0QyxFQUEyQyxHQUEzQyxFQUFnRDFULEtBQWhELENBQVo7QUFDQSxNQUFJb00saUJBQUo7QUFDQSxNQUFJQyxNQUFNdkosS0FBTixDQUFZOUQsTUFBWixLQUF1QixDQUF2QixJQUE0QnFOLE1BQU12SixLQUFOLENBQVksQ0FBWixNQUFtQixHQUFuRCxFQUF3RDtBQUN0RHNKLGVBQVdDLE1BQU12SixLQUFOLENBQVksQ0FBWixDQUFYO0FBQ0F1SixVQUFNdkosS0FBTixHQUFjdUosTUFBTXZKLEtBQU4sQ0FBWUEsS0FBWixDQUFrQixDQUFsQixDQUFkO0FBQ0Q7QUFDRCxNQUFJdUosTUFBTXZKLEtBQU4sQ0FBWTlELE1BQVosR0FBcUIsQ0FBekIsRUFBNEIsTUFBTSxJQUFJNkwsV0FBSix5REFBc0V3QixNQUFNdkosS0FBTixDQUFZZ0csSUFBWixDQUFpQixFQUFqQixDQUF0RSxPQUFOOztBQUU1QixNQUFJNkwsU0FBUyxFQUFFN0QsU0FBU3pFLE1BQU12SixLQUFOLENBQVksQ0FBWixDQUFYLEVBQWI7O0FBRUE7QUFDQSxNQUFJOFIsZUFBZUQsT0FBTzdELE9BQVAsQ0FBZXBJLE9BQWYsQ0FBdUIsR0FBdkIsQ0FBbkI7QUFDQSxNQUFJa00saUJBQWlCLENBQUMsQ0FBdEIsRUFBeUI7QUFDdkJELFdBQU9FLEdBQVAsR0FBYUYsT0FBTzdELE9BQVAsQ0FBZXhULE1BQWYsQ0FBc0JzWCxlQUFlLENBQXJDLENBQWI7QUFDQUQsV0FBTzdELE9BQVAsR0FBaUI2RCxPQUFPN0QsT0FBUCxDQUFleFQsTUFBZixDQUFzQixDQUF0QixFQUF5QnNYLFlBQXpCLENBQWpCO0FBQ0Q7O0FBRUQsTUFBSXhVLE9BQU8sSUFBSU8sZUFBS2lRLE9BQVQsQ0FBaUIrRCxNQUFqQixDQUFYO0FBQ0EsTUFBSXZJLFFBQUosRUFBY2hNLEtBQUtnTSxRQUFMLEdBQWdCQSxRQUFoQjtBQUNkLFNBQU8sQ0FBRWhNLElBQUYsRUFBUWlNLE1BQU1wTSxHQUFkLENBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxTQUFTaVUsU0FBVCxDQUFtQlIsWUFBbkIsRUFBaUY7QUFBQSxNQUFoRHJULEtBQWdELHVFQUF4QyxFQUF3QztBQUFBLE1BQXBDTCxLQUFvQyx1RUFBNUIsQ0FBNEI7QUFBQSxNQUF6QnNCLFdBQXlCLHVFQUFYWCxlQUFLZ08sSUFBTTs7QUFBQSwrQkFDMURuUSxpQkFBTytWLGdCQUFQLENBQXdCYixZQUF4QixFQUFzQyxHQUF0QyxFQUEyQyxHQUEzQyxFQUFnRDFULEtBQWhELENBRDBEO0FBQUEsTUFDekVDLEdBRHlFLDBCQUN6RUEsR0FEeUU7QUFBQSxNQUNwRTZDLEtBRG9FLDBCQUNwRUEsS0FEb0U7O0FBRy9FOzs7QUFDQSxNQUFJc0osaUJBQUo7QUFDQSxNQUFJdEosTUFBTTlELE1BQU4sR0FBZSxDQUFmLElBQW9COEQsTUFBTSxDQUFOLE1BQWEsR0FBckMsRUFBMEM7QUFDeENzSixlQUFXdEosTUFBTSxDQUFOLENBQVg7QUFDQUEsWUFBUUEsTUFBTUEsS0FBTixDQUFZLENBQVosQ0FBUjtBQUNEOztBQUVELE1BQUlvSSxVQUFVb0ksWUFBWXhRLEtBQVosRUFBbUIsRUFBbkIsQ0FBZDtBQUNBLE1BQUlvSSxRQUFRbE0sTUFBUixLQUFtQixDQUF2QixFQUEwQjtBQUN4QixVQUFNLElBQUk2TCxXQUFKLHdDQUFxRC9ILE1BQU1nRyxJQUFOLENBQVcsR0FBWCxDQUFyRCxPQUFOO0FBQ0Q7O0FBYjhFLGdDQWNyRG9DLE9BZHFEO0FBQUEsTUFjekVzQixJQWR5RTtBQUFBLE1BY25Fc0YsU0FkbUU7O0FBZ0IvRSxNQUFJMVIsT0FBTyxJQUFJa0IsV0FBSixDQUFnQixFQUFFa0wsVUFBRixFQUFRc0Ysb0JBQVIsRUFBaEIsQ0FBWDtBQUNBLE1BQUkxRixRQUFKLEVBQWNoTSxLQUFLZ00sUUFBTCxHQUFnQkEsUUFBaEI7QUFDZCxTQUFPLENBQUVoTSxJQUFGLEVBQVFILEdBQVIsQ0FBUDtBQUNELEM7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQy9TRDs7Ozs7Ozs7QUFFQTtBQUNBO0FBQ0EsSUFBSSxDQUFFYyxNQUFNeEMsU0FBTixDQUFnQndTLFFBQXRCLEVBQWlDO0FBQ2hDblMsUUFBT2tELGNBQVAsQ0FBc0JmLE1BQU14QyxTQUE1QixFQUF1QyxVQUF2QyxFQUFtRDtBQUNsRHdELFNBQU8sZUFBU0EsTUFBVCxFQUFnQi9CLEtBQWhCLEVBQXVCO0FBQzdCLE9BQUlnTyxRQUFRLEtBQUt0RixPQUFMLENBQWEzRyxNQUFiLEVBQW9CL0IsS0FBcEIsQ0FBWjtBQUNBLFVBQVFnTyxVQUFVLENBQUMsQ0FBbkI7QUFDQTtBQUppRCxFQUFuRDtBQU1BOztBQUlEOztJQUNNb0YsVTtBQUNMLHFCQUFZQSxXQUFaLEVBQXdCO0FBQUE7O0FBQ3ZCLE9BQUtBLFVBQUwsR0FBa0JBLFdBQWxCO0FBQ0E7O0FBRUQ7Ozs7OzZCQUtXO0FBQ1YsVUFBTyxLQUFLQSxVQUFaO0FBQ0E7OztzQkFOWTtBQUNaLFVBQU8sS0FBS0EsVUFBTCxDQUFnQnBVLE1BQXZCO0FBQ0E7Ozs7OztBQVFGOzs7SUFDTStTLE07Ozs7Ozs7Ozs7RUFBZXFCLFU7O0FBR3JCOzs7SUFDTTBCLE87Ozs7Ozs7Ozs7RUFBZ0IxQixVOztBQUd0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0EsSUFBTWhVLFlBQVk7O0FBRWpCO0FBQ0E0RCxPQUFPLEtBSFU7O0FBS2pCO0FBQ0FxUCxhQUFZZSxVQU5LOztBQVFqQjtBQUNBMkIsU0FBUWhELE1BVFM7O0FBV2pCO0FBQ0FpRCxVQUFTLElBQUlGLE9BQUosQ0FBWSxJQUFaLENBWlE7O0FBY2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRDtBQUNDelYsU0F2QmlCLG9CQXVCUnJDLElBdkJRLEVBdUJjO0FBQUEsTUFBaEJnRCxLQUFnQix1RUFBUixDQUFRO0FBQUEsTUFBTEMsR0FBSzs7QUFDOUIsTUFBSSxPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsTUFBTWpELEtBQUtnQyxNQUExQyxFQUFrRGlCLE1BQU1qRCxLQUFLZ0MsTUFBWDtBQUNsRDtBQUNBLE1BQUlnQixTQUFTQyxHQUFULElBQWdCLENBQUNqRCxLQUFLME4sSUFBTCxFQUFyQixFQUFrQyxPQUFPLEVBQVA7O0FBRWxDLE1BQUl2TCxTQUFTLEVBQWI7QUFDQTs7QUFOOEIsbUJBT0gsS0FBSzhWLFNBQUwsQ0FBZSxLQUFLQyxjQUFwQixFQUFvQ2xZLElBQXBDLEVBQTBDZ0QsS0FBMUMsRUFBaURDLEdBQWpELENBUEc7QUFBQTtBQUFBLE1BT3pCaUwsT0FQeUI7QUFBQSxNQU9oQmhCLFNBUGdCOztBQVE5QixNQUFJZ0IsT0FBSixFQUFhO0FBQ1ovTCxZQUFTQSxPQUFPb0IsTUFBUCxDQUFjMkssT0FBZCxDQUFUO0FBQ0FsTCxXQUFRa0ssU0FBUjtBQUNBO0FBQ0QsTUFBSWxLLFVBQVVDLEdBQWQsRUFBbUI7QUFDbEIsT0FBSWIsVUFBVTRELElBQWQsRUFBb0JqRixRQUFRMEksSUFBUixDQUFhLCtCQUFiLEVBQThDekosS0FBSzhGLEtBQUwsQ0FBVzlDLEtBQVgsRUFBa0JDLEdBQWxCLElBQXlCLEdBQXZFO0FBQ3BCOztBQUVELFNBQU9pTCxPQUFQO0FBQ0EsRUF4Q2dCOzs7QUEwQ2pCO0FBQ0E7QUFDQTtBQUNEO0FBQ0MrSixVQTlDaUIscUJBOENQRSxNQTlDTyxFQThDQ25ZLElBOUNELEVBOENxQztBQUFBLE1BQTlCZ0QsS0FBOEIsdUVBQXRCLENBQXNCO0FBQUEsTUFBbkJDLEdBQW1CO0FBQUEsTUFBZGlMLE9BQWMsdUVBQUosRUFBSTs7QUFDckQsTUFBSSxPQUFPakwsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1qRCxLQUFLZ0MsTUFBMUMsRUFBa0RpQixNQUFNakQsS0FBS2dDLE1BQVg7QUFDbEQsTUFBSWdCLFNBQVNDLEdBQWIsRUFBa0IsT0FBT1AsU0FBUDs7QUFFbEI7QUFDQSxTQUFPTSxRQUFRQyxHQUFmLEVBQW9CO0FBQ25CLE9BQUlMLFNBQVN1VixPQUFPQyxJQUFQLENBQVksSUFBWixFQUFrQnBZLElBQWxCLEVBQXdCZ0QsS0FBeEIsRUFBK0JDLEdBQS9CLENBQWI7QUFDQSxPQUFJLENBQUNMLE1BQUwsRUFBYTs7QUFGTSxnQ0FJT0EsTUFKUDtBQUFBLE9BSWRULE1BSmM7QUFBQSxPQUlOK0ssU0FKTTtBQUtuQjs7O0FBQ0EsT0FBSWxLLFVBQVVrSyxTQUFkLEVBQXlCOztBQUV6QjtBQUNBLE9BQUkvSyxXQUFXTyxTQUFmLEVBQTBCd0wsVUFBVUEsUUFBUTNLLE1BQVIsQ0FBZXBCLE1BQWYsQ0FBVjtBQUMxQmEsV0FBUWtLLFNBQVI7QUFDQTtBQUNELFNBQU8sQ0FBQ2dCLE9BQUQsRUFBVWxMLEtBQVYsQ0FBUDtBQUNBLEVBaEVnQjs7O0FBa0VqQjtBQUNEO0FBQ0NrVixlQXBFaUIsMEJBb0VGbFksSUFwRUUsRUFvRUlnRCxLQXBFSixFQW9FV0MsR0FwRVgsRUFvRWdCO0FBQ2hDLFNBQU8sS0FBS29WLGVBQUwsQ0FBcUJyWSxJQUFyQixFQUEyQmdELEtBQTNCLEVBQWtDQyxHQUFsQyxLQUNGLEtBQUtxVixTQUFMLENBQWV0WSxJQUFmLEVBQXFCZ0QsS0FBckIsRUFBNEJDLEdBQTVCLENBREUsSUFFRixLQUFLc1YsV0FBTCxDQUFpQnZZLElBQWpCLEVBQXVCZ0QsS0FBdkIsRUFBOEJDLEdBQTlCLENBRkUsSUFHRixLQUFLdVYsWUFBTCxDQUFrQnhZLElBQWxCLEVBQXdCZ0QsS0FBeEIsRUFBK0JDLEdBQS9CLENBSEUsSUFJRixLQUFLd1YsZUFBTCxDQUFxQnpZLElBQXJCLEVBQTJCZ0QsS0FBM0IsRUFBa0NDLEdBQWxDLENBSkUsSUFLRixLQUFLeVYsU0FBTCxDQUFlMVksSUFBZixFQUFxQmdELEtBQXJCLEVBQTRCQyxHQUE1QixDQUxFLElBTUYsS0FBSzBWLFlBQUwsQ0FBa0IzWSxJQUFsQixFQUF3QmdELEtBQXhCLEVBQStCQyxHQUEvQixDQU5FLElBT0YsS0FBSzJWLFdBQUwsQ0FBaUI1WSxJQUFqQixFQUF1QmdELEtBQXZCLEVBQThCQyxHQUE5QixDQVBMO0FBU0EsRUE5RWdCOzs7QUFpRmpCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTJWLFlBeEZpQix1QkF3Rkw1WSxJQXhGSyxFQXdGaUI7QUFBQSxNQUFoQmdELEtBQWdCLHVFQUFSLENBQVE7QUFBQSxNQUFMQyxHQUFLOztBQUNqQyxNQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxNQUFNakQsS0FBS2dDLE1BQTFDLEVBQWtEaUIsTUFBTWpELEtBQUtnQyxNQUFYO0FBQ2xELE1BQUlnQixTQUFTQyxHQUFiLEVBQWtCLE9BQU9QLFNBQVA7O0FBRWxCLFNBQU8sQ0FBQzFDLEtBQUtnRCxLQUFMLENBQUQsRUFBY0EsUUFBUSxDQUF0QixDQUFQO0FBQ0EsRUE3RmdCOzs7QUFnR2pCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTZWLGNBdkdpQix5QkF1R0g3WSxJQXZHRyxFQXVHbUI7QUFBQSxNQUFoQmdELEtBQWdCLHVFQUFSLENBQVE7QUFBQSxNQUFMQyxHQUFLOztBQUNuQyxNQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxNQUFNakQsS0FBS2dDLE1BQTFDLEVBQWtEaUIsTUFBTWpELEtBQUtnQyxNQUFYO0FBQ2xELE1BQUlnQixTQUFTQyxHQUFiLEVBQWtCLE9BQU9BLEdBQVA7O0FBRWxCLE1BQUk2VixnQkFBZ0I5VixLQUFwQjtBQUNBLFNBQU84VixnQkFBZ0I3VixHQUFoQixLQUF3QmpELEtBQUs4WSxhQUFMLE1BQXdCLEdBQXhCLElBQStCOVksS0FBSzhZLGFBQUwsTUFBd0IsSUFBL0UsQ0FBUCxFQUE2RjtBQUM1RkE7QUFDQTtBQUNELFNBQU9BLGFBQVA7QUFDQSxFQWhIZ0I7OztBQW1IakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBVCxnQkExSGlCLDJCQTBIRHJZLElBMUhDLEVBMEhxQjtBQUFBLE1BQWhCZ0QsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQ3JDLE1BQUksT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1qRCxLQUFLZ0MsTUFBMUMsRUFBa0RpQixNQUFNakQsS0FBS2dDLE1BQVg7QUFDbEQsTUFBSWdCLFNBQVNDLEdBQWIsRUFBa0IsT0FBT1AsU0FBUDs7QUFFbEIsTUFBSXFXLGdCQUFnQixLQUFLRixhQUFMLENBQW1CN1ksSUFBbkIsRUFBeUJnRCxLQUF6QixFQUFnQ0MsR0FBaEMsQ0FBcEI7QUFDQTtBQUNBLE1BQUk4VixrQkFBa0IvVixLQUF0QixFQUE2QixPQUFPTixTQUFQOztBQUU3QixNQUFJMFQsYUFBYXBXLEtBQUs4RixLQUFMLENBQVc5QyxLQUFYLEVBQWtCK1YsYUFBbEIsQ0FBakI7QUFDQSxNQUFJdlcsY0FBSjtBQUNBLE1BQUlRLFVBQVUsQ0FBVixJQUFlaEQsS0FBS2dELFFBQU0sQ0FBWCxNQUFrQixJQUFyQyxFQUNDUixRQUFRLElBQUlKLFVBQVUyVixNQUFkLENBQXFCM0IsVUFBckIsQ0FBUixDQURELEtBR0M1VCxRQUFRLElBQUlKLFVBQVVpVCxVQUFkLENBQXlCZSxVQUF6QixDQUFSOztBQUVELFNBQU8sQ0FBQzVULEtBQUQsRUFBUXVXLGFBQVIsQ0FBUDtBQUNBLEVBMUlnQjs7O0FBNklqQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0FQLGFBcEppQix3QkFvSkp4WSxJQXBKSSxFQW9Ka0I7QUFBQSxNQUFoQmdELEtBQWdCLHVFQUFSLENBQVE7QUFBQSxNQUFMQyxHQUFLOztBQUNsQyxNQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxNQUFNakQsS0FBS2dDLE1BQTFDLEVBQWtEaUIsTUFBTWpELEtBQUtnQyxNQUFYO0FBQ2xELE1BQUlnQixTQUFTQyxHQUFULElBQWdCakQsS0FBS2dELEtBQUwsTUFBZ0IsSUFBcEMsRUFBMEMsT0FBT04sU0FBUDs7QUFFMUMsU0FBTyxDQUFDTixVQUFVNFYsT0FBWCxFQUFvQmhWLFFBQVEsQ0FBNUIsQ0FBUDtBQUNBLEVBekpnQjs7O0FBNEpqQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0FnVyxhQUFZLFVBbktLO0FBb0tqQkMsWUFBWSxTQXBLSztBQXFLakJYLFVBcktpQixxQkFxS1B0WSxJQXJLTyxFQXFLZTtBQUFBLE1BQWhCZ0QsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQy9CLE1BQUksT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1qRCxLQUFLZ0MsTUFBMUMsRUFBa0RpQixNQUFNakQsS0FBS2dDLE1BQVg7QUFDbEQsTUFBSWdCLFNBQVNDLEdBQWIsRUFBa0IsT0FBT1AsU0FBUDs7QUFFbEIsTUFBSSxDQUFDLEtBQUtzVyxVQUFMLENBQWdCL1ksSUFBaEIsQ0FBcUJELEtBQUtnRCxLQUFMLENBQXJCLENBQUwsRUFBd0MsT0FBT04sU0FBUDs7QUFFeEMsTUFBSXdXLFVBQVVsVyxRQUFRLENBQXRCO0FBQ0EsU0FBT2tXLFVBQVVqVyxHQUFWLElBQWlCLEtBQUtnVyxTQUFMLENBQWVoWixJQUFmLENBQW9CRCxLQUFLa1osT0FBTCxDQUFwQixDQUF4QixFQUE0RDtBQUMzREE7QUFDQTtBQUNELE1BQUlBLFlBQVlsVyxLQUFoQixFQUF1QixPQUFPTixTQUFQOztBQUV2QixNQUFJeEMsT0FBT0YsS0FBSzhGLEtBQUwsQ0FBVzlDLEtBQVgsRUFBa0JrVyxPQUFsQixDQUFYO0FBQ0EsU0FBTyxDQUFDaFosSUFBRCxFQUFPZ1osT0FBUCxDQUFQO0FBQ0EsRUFuTGdCOzs7QUFzTGpCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0FDLGVBQWMsU0E1TEc7QUE2TGpCQyxTQUFTLHNCQTdMUTtBQThMakJiLFlBOUxpQix1QkE4TEx2WSxJQTlMSyxFQThMaUI7QUFBQSxNQUFoQmdELEtBQWdCLHVFQUFSLENBQVE7QUFBQSxNQUFMQyxHQUFLOztBQUNqQyxNQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxNQUFNakQsS0FBS2dDLE1BQTFDLEVBQWtEaUIsTUFBTWpELEtBQUtnQyxNQUFYO0FBQ2xELE1BQUlnQixTQUFTQyxHQUFiLEVBQWtCLE9BQU9QLFNBQVA7O0FBRWxCLE1BQUksQ0FBQyxLQUFLeVcsWUFBTCxDQUFrQmxaLElBQWxCLENBQXVCRCxLQUFLZ0QsS0FBTCxDQUF2QixDQUFMLEVBQTBDLE9BQU9OLFNBQVA7O0FBRTFDLE1BQUkyVyxjQUFjLEtBQUtDLHFCQUFMLENBQTJCLEtBQUtGLE1BQWhDLEVBQXdDcFosSUFBeEMsRUFBOENnRCxLQUE5QyxFQUFxREMsR0FBckQsQ0FBbEI7QUFDQSxNQUFJLENBQUNvVyxXQUFMLEVBQWtCLE9BQU8zVyxTQUFQOztBQUVsQixNQUFJNlcsWUFBWUYsWUFBWSxDQUFaLENBQWhCO0FBQ0EsTUFBSWhaLFNBQVNtWixXQUFXRCxTQUFYLEVBQXNCLEVBQXRCLENBQWI7QUFDQSxTQUFPLENBQUNsWixNQUFELEVBQVMyQyxRQUFRdVcsVUFBVXZYLE1BQTNCLENBQVA7QUFDQSxFQTFNZ0I7OztBQTZNakI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDRDtBQUNDMFcsVUFwTmlCLHFCQW9OUDFZLElBcE5PLEVBb05lO0FBQUEsTUFBaEJnRCxLQUFnQix1RUFBUixDQUFRO0FBQUEsTUFBTEMsR0FBSzs7QUFDL0IsTUFBSSxPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsTUFBTWpELEtBQUtnQyxNQUExQyxFQUFrRGlCLE1BQU1qRCxLQUFLZ0MsTUFBWDtBQUNsRCxNQUFJZ0IsU0FBU0MsR0FBYixFQUFrQixPQUFPUCxTQUFQOztBQUVsQixNQUFJK1csY0FBY3paLEtBQUtnRCxLQUFMLENBQWxCO0FBQ0EsTUFBSXlXLGdCQUFnQixHQUFoQixJQUF1QkEsZ0JBQWdCLEdBQTNDLEVBQWdELE9BQU8vVyxTQUFQOztBQUVoRCxNQUFJZ1gsVUFBVTFXLFFBQVEsQ0FBdEI7QUFDQSxTQUFPMFcsVUFBVXpXLEdBQWpCLEVBQXNCO0FBQ3JCLE9BQUkwVyxPQUFPM1osS0FBSzBaLE9BQUwsQ0FBWDtBQUNBLE9BQUlDLFNBQVNGLFdBQWIsRUFBMEI7QUFDMUI7QUFDQSxPQUFJRSxTQUFTLElBQVQsSUFBaUIzWixLQUFLMFosVUFBVSxDQUFmLE1BQXNCRCxXQUEzQyxFQUF3REM7QUFDeERBO0FBQ0E7QUFDRDtBQUNBLE1BQUkxWixLQUFLMFosT0FBTCxNQUFrQkQsV0FBdEIsRUFBbUMsT0FBTy9XLFNBQVA7QUFDbkM7QUFDQWdYOztBQUVBLE1BQUkzRyxlQUFlL1MsS0FBSzhGLEtBQUwsQ0FBVzlDLEtBQVgsRUFBa0IwVyxPQUFsQixDQUFuQjtBQUNBLE1BQUlsWCxRQUFRLElBQUlKLFVBQVUwUSxJQUFkLENBQW1CQyxZQUFuQixDQUFaO0FBQ0EsU0FBTyxDQUFDdlEsS0FBRCxFQUFRa1gsT0FBUixDQUFQO0FBQ0EsRUEzT2dCOzs7QUE2T2pCO0FBQ0E7QUFDQTVHO0FBQ0MsZ0JBQVlDLFlBQVosRUFBMEI7QUFBQTs7QUFDekIsUUFBS0EsWUFBTCxHQUFvQkEsWUFBcEI7QUFDQTs7QUFIRjtBQUFBO0FBQUEsOEJBYVk7QUFDVixXQUFPLEtBQUtBLFlBQVo7QUFDQTtBQWZGO0FBQUE7QUFBQSx1QkFJWTtBQUNWLFFBQUlqSSxTQUFTLEtBQUtpSSxZQUFsQjtBQUNBO0FBQ0EsUUFBSS9QLFFBQVEsQ0FBWjtBQUNBLFFBQUlDLE1BQU02SCxPQUFPOUksTUFBakI7QUFDQSxRQUFJOEksT0FBTzlILEtBQVAsTUFBa0IsR0FBbEIsSUFBeUI4SCxPQUFPOUgsS0FBUCxNQUFrQixHQUEvQyxFQUFvREEsUUFBUSxDQUFSO0FBQ3BELFFBQUk4SCxPQUFPN0gsTUFBSSxDQUFYLE1BQWtCLEdBQWxCLElBQXlCNkgsT0FBTzdILE1BQUksQ0FBWCxNQUFrQixHQUEvQyxFQUFvREEsTUFBTSxDQUFDLENBQVA7QUFDcEQsV0FBTzZILE9BQU9oRixLQUFQLENBQWE5QyxLQUFiLEVBQW9CQyxHQUFwQixDQUFQO0FBQ0E7QUFaRjs7QUFBQTtBQUFBLElBL09pQjs7QUFpUWpCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EyVyxVQUFVLDJCQXZRTztBQXdRakJqQixhQXhRaUIsd0JBd1FKM1ksSUF4UUksRUF3UWtCO0FBQUEsTUFBaEJnRCxLQUFnQix1RUFBUixDQUFRO0FBQUEsTUFBTEMsR0FBSzs7QUFDbEMsTUFBSSxPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsTUFBTWpELEtBQUtnQyxNQUExQyxFQUFrRGlCLE1BQU1qRCxLQUFLZ0MsTUFBWDtBQUNsRCxNQUFJZ0IsU0FBU0MsR0FBYixFQUFrQixPQUFPUCxTQUFQOztBQUVsQixNQUFJbVgsZUFBZTdaLEtBQUs4RixLQUFMLENBQVc5QyxLQUFYLEVBQWtCQSxRQUFRLENBQTFCLENBQW5CO0FBQ0EsTUFBSTZXLGlCQUFpQixJQUFqQixJQUF5QkEsaUJBQWlCLE1BQTFDLElBQW9EQSxpQkFBaUIsSUFBekUsRUFBK0UsT0FBT25YLFNBQVA7O0FBRS9FO0FBQ0EsTUFBSW1KLE9BQU8sS0FBS2lPLGFBQUwsQ0FBbUI5WixJQUFuQixFQUF5QmdELEtBQXpCLEVBQWdDQyxHQUFoQyxDQUFYO0FBQ0EsTUFBSThXLGVBQWVsTyxLQUFLd0QsS0FBTCxDQUFXLEtBQUt1SyxPQUFoQixDQUFuQjtBQUNBLE1BQUksQ0FBQ0csWUFBTCxFQUFtQixPQUFPclgsU0FBUDs7QUFWZSxxQ0FZZ0JxWCxZQVpoQjtBQUFBLE1BWTdCMUssS0FaNkI7QUFBQSxNQVl0QjJLLGFBWnNCO0FBQUEsTUFZUDVELFVBWk87QUFBQSxNQVlLbEMsT0FaTDs7QUFhbEMsTUFBSTFSLFFBQVEsSUFBSUosVUFBVTBQLE9BQWQsQ0FBc0IsRUFBRWtJLDRCQUFGLEVBQWlCNUQsc0JBQWpCLEVBQTZCbEMsZ0JBQTdCLEVBQXRCLENBQVo7QUFDQSxTQUFPLENBQUMxUixLQUFELEVBQVFRLFFBQVE2SSxLQUFLN0osTUFBckIsQ0FBUDtBQUNBLEVBdlJnQjs7O0FBeVJqQjtBQUNEO0FBQ0M4UDtBQUNDLG1CQUFhdk4sS0FBYixFQUFvQjtBQUFBOztBQUNuQjNDLFVBQU9DLE1BQVAsQ0FBYyxJQUFkLEVBQW9CMEMsS0FBcEI7QUFDQTs7QUFIRjtBQUFBO0FBQUEsOEJBSVk7QUFDVixnQkFBVSxLQUFLeVYsYUFBZixHQUErQixLQUFLNUQsVUFBcEMsR0FBaUQsS0FBS2xDLE9BQXREO0FBQ0E7QUFORjs7QUFBQTtBQUFBLElBM1JpQjs7QUFxU2pCO0FBQ0E7QUFDQTs7QUFFQTtBQUNEO0FBQ0N1RSxnQkEzU2lCLDJCQTJTRHpZLElBM1NDLEVBMlNxQjtBQUFBLE1BQWhCZ0QsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQ3JDLE1BQUksT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1qRCxLQUFLZ0MsTUFBMUMsRUFBa0RpQixNQUFNakQsS0FBS2dDLE1BQVg7QUFDbEQsTUFBSWdCLFNBQVNDLEdBQWIsRUFBa0IsT0FBT1AsU0FBUDs7QUFGbUIsYUFJUCxLQUFLdVgsZ0JBQUwsQ0FBc0JqYSxJQUF0QixFQUE0QmdELEtBQTVCLEVBQW1DQyxHQUFuQyxLQUEyQyxFQUpwQztBQUFBO0FBQUEsTUFJaENrSyxVQUpnQztBQUFBLE1BSXBCRCxTQUpvQjs7QUFLckMsTUFBSSxDQUFDQyxVQUFMLEVBQWlCLE9BQU96SyxTQUFQOztBQUVqQixNQUFJLENBQUN5SyxXQUFXK00sVUFBaEIsRUFBNEI7QUFBQSwyQkFDQSxLQUFLQyxnQkFBTCxDQUFzQmhOLFdBQVdZLE9BQWpDLEVBQTBDL04sSUFBMUMsRUFBZ0RrTixTQUFoRCxFQUEyRGpLLEdBQTNELENBREE7QUFBQTtBQUFBLE9BQ3RCdUssUUFEc0I7QUFBQSxPQUNaNE0sUUFEWTs7QUFFM0IsT0FBSTVNLFNBQVN4TCxNQUFiLEVBQXFCO0FBQ3BCbUwsZUFBV0ssUUFBWCxHQUFzQkEsUUFBdEI7QUFDQU4sZ0JBQVlrTixRQUFaO0FBQ0E7QUFDRDs7QUFFRCxTQUFPLENBQUNqTixVQUFELEVBQWFELFNBQWIsQ0FBUDtBQUNBLEVBM1RnQjs7O0FBNlRqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBbU4sZ0JBQWdCLHVDQWpVQztBQWtVbEI7QUFDQ0osaUJBblVpQiw0QkFtVUFqYSxJQW5VQSxFQW1Vc0I7QUFBQSxNQUFoQmdELEtBQWdCLHVFQUFSLENBQVE7QUFBQSxNQUFMQyxHQUFLOztBQUN0QyxNQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxNQUFNakQsS0FBS2dDLE1BQTFDLEVBQWtEaUIsTUFBTWpELEtBQUtnQyxNQUFYO0FBQ2xELE1BQUlnQixTQUFTQyxHQUFiLEVBQWtCLE9BQU9QLFNBQVA7O0FBRWxCLE1BQUl3SyxZQUFZLEtBQUsyTCxhQUFMLENBQW1CN1ksSUFBbkIsRUFBeUJnRCxLQUF6QixFQUFnQ0MsR0FBaEMsQ0FBaEI7QUFDQTtBQUNBLE1BQUlqRCxLQUFLa04sU0FBTCxNQUFvQixHQUF4QixFQUE2QixPQUFPeEssU0FBUDs7QUFFN0IsTUFBSTRYLFdBQVcsS0FBS2hCLHFCQUFMLENBQTJCLEtBQUtlLGFBQWhDLEVBQStDcmEsSUFBL0MsRUFBcURrTixTQUFyRCxFQUFnRWpLLEdBQWhFLENBQWY7QUFDQSxNQUFJLENBQUNxWCxRQUFMLEVBQWUsT0FBTzVYLFNBQVA7O0FBVHVCLGlDQVdENFgsUUFYQztBQUFBLE1BV2hDNUIsU0FYZ0M7QUFBQSxNQVdyQjNLLE9BWHFCO0FBQUEsTUFXWndNLE1BWFk7O0FBWXRDLE1BQUlwTixhQUFhLElBQUkvSyxVQUFVMkssVUFBZCxDQUF5QmdCLE9BQXpCLENBQWpCO0FBQ0FiLGNBQVlBLFlBQVl3TCxVQUFVMVcsTUFBbEM7O0FBRUE7QUFDQXVZLFdBQVNBLE9BQU83TSxJQUFQLEVBQVQ7QUFDQSxNQUFJNk0sV0FBVyxJQUFmLEVBQXFCO0FBQ3BCcE4sY0FBVytNLFVBQVgsR0FBd0IsSUFBeEI7QUFDQSxVQUFPLENBQUMvTSxVQUFELEVBQWFELFNBQWIsQ0FBUDtBQUNBOztBQUVEO0FBQ0EsTUFBSXFOLFdBQVcsR0FBWCxJQUFrQkEsV0FBVyxJQUFqQyxFQUF1QztBQUFBLHFCQUNiLEtBQUt0QyxTQUFMLENBQWUsS0FBS3VDLGlCQUFwQixFQUF1Q3hhLElBQXZDLEVBQTZDa04sU0FBN0MsRUFBd0RqSyxHQUF4RCxDQURhO0FBQUE7QUFBQSxPQUNoQ29LLEtBRGdDO0FBQUEsT0FDekJvTixPQUR5Qjs7QUFFdEN0TixjQUFXQyxVQUFYLEdBQXdCQyxLQUF4QjtBQUNBSCxlQUFZdU4sT0FBWjtBQUNBOztBQUVEO0FBQ0EsTUFBSXphLEtBQUtrTixTQUFMLE1BQW9CLEdBQXBCLElBQTJCbE4sS0FBS2tOLFlBQVksQ0FBakIsTUFBd0IsR0FBdkQsRUFBNEQ7QUFDM0RxTixZQUFTLElBQVQ7QUFDQXJOLGdCQUFhLENBQWI7QUFDQSxHQUhELE1BSUssSUFBSWxOLEtBQUtrTixTQUFMLE1BQW9CLEdBQXhCLEVBQTZCO0FBQ2pDcU4sWUFBU3ZhLEtBQUtrTixTQUFMLENBQVQ7QUFDQUEsZ0JBQWEsQ0FBYjtBQUNBOztBQUVEO0FBQ0EsTUFBSXFOLFdBQVcsSUFBZixFQUFxQjtBQUNwQnBOLGNBQVcrTSxVQUFYLEdBQXdCLElBQXhCO0FBQ0EsVUFBTyxDQUFDL00sVUFBRCxFQUFhRCxTQUFiLENBQVA7QUFDQTs7QUFFRDtBQUNBLE1BQUlxTixXQUFXLEdBQWYsRUFBb0I7QUFDbkIsT0FBSW5ZLFVBQVU0RCxJQUFkLEVBQW9CO0FBQ25CakYsWUFBUTBJLElBQVIsQ0FBYSx5Q0FBYixFQUF3RDBELFVBQXhELEVBQW9FLE1BQUluTixLQUFLOEYsS0FBTCxDQUFXOUMsS0FBWCxFQUFrQmtLLFNBQWxCLENBQUosR0FBaUMsR0FBckc7QUFDQTtBQUNEQyxjQUFXNEQsS0FBWCxHQUFtQixVQUFuQjtBQUNBLFVBQU8sQ0FBQzVELFVBQUQsRUFBYUQsU0FBYixDQUFQO0FBQ0E7O0FBRUQsU0FBTyxDQUFDQyxVQUFELEVBQWFELFNBQWIsQ0FBUDtBQUNBLEVBMVhnQjs7O0FBNlhqQjtBQUNBSDtBQUNDLHNCQUFZZ0IsT0FBWixFQUFxQlgsVUFBckIsRUFBaUNJLFFBQWpDLEVBQTJDO0FBQUE7O0FBQzFDLFFBQUtPLE9BQUwsR0FBZUEsT0FBZjtBQUNBLE9BQUlYLFVBQUosRUFBZ0IsS0FBS0EsVUFBTCxHQUFrQkEsVUFBbEI7QUFDaEIsT0FBSUksUUFBSixFQUFjLEtBQUtBLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ2Q7O0FBRUQ7QUFDRjs7O0FBUkM7QUFBQTtBQUFBLDhCQXlDWTtBQUNWLFFBQUlILFFBQVEsS0FBS3FOLGFBQWpCO0FBQ0EsUUFBSWxOLFdBQVcsS0FBS21OLGdCQUFwQjtBQUNBLFFBQUksS0FBS1QsVUFBVCxFQUFxQixhQUFXLEtBQUtuTSxPQUFoQixHQUEwQlYsS0FBMUI7QUFDckIsaUJBQVcsS0FBS1UsT0FBaEIsR0FBMEJWLEtBQTFCLFNBQW1DRyxRQUFuQyxVQUFnRCxLQUFLTyxPQUFyRDtBQUNBO0FBOUNGO0FBQUE7QUFBQSx1QkFTYTtBQUNYLFFBQUlWLFFBQVEsRUFBWjtBQUNBLFFBQUksS0FBS0QsVUFBVCxFQUFxQixLQUFLQSxVQUFMLENBQWdCbkosT0FBaEIsQ0FBd0IsZ0JBQVE7QUFDcEQ7QUFDQSxTQUFJMlcsS0FBS3BXLElBQVQsRUFBZTZJLE1BQU11TixLQUFLcFcsSUFBWCxJQUFtQm9XLEtBQUs3VixLQUF4QjtBQUNmLEtBSG9CO0FBSXJCLFdBQU9zSSxLQUFQO0FBQ0E7O0FBRUQ7QUFDRjs7QUFuQkM7QUFBQTtBQUFBLHVCQW9CcUI7QUFDbkIsUUFBSSxDQUFDLEtBQUtELFVBQVYsRUFBc0IsT0FBTyxFQUFQO0FBQ3RCLFdBQU8sTUFBTSxLQUFLQSxVQUFMLENBQWdCM0osR0FBaEIsQ0FBcUIsaUJBQXFCO0FBQUEsU0FBbEJlLElBQWtCLFNBQWxCQSxJQUFrQjtBQUFBLFNBQVpPLEtBQVksU0FBWkEsS0FBWTs7QUFDdEQsU0FBSUEsVUFBVXJDLFNBQWQsRUFBeUIsT0FBTzhCLElBQVA7QUFDekI7QUFDQTtBQUNBLFNBQUlULE1BQU1DLE9BQU4sQ0FBY2UsS0FBZCxDQUFKLEVBQTBCQSxjQUFZQSxNQUFNK0csSUFBTixDQUFXLEdBQVgsQ0FBWjtBQUMxQixzQkFBZS9HLEtBQWY7QUFDQSxLQU5ZLEVBTVYrRyxJQU5VLENBTUwsR0FOSyxDQUFiO0FBT0E7O0FBRUQ7QUFDRjs7QUFoQ0M7QUFBQTtBQUFBLHVCQWlDd0I7QUFDdEIsUUFBSSxDQUFDLEtBQUswQixRQUFWLEVBQW9CLE9BQU8sRUFBUDtBQUNwQixXQUFPLEtBQUtBLFFBQUwsQ0FBYy9KLEdBQWQsQ0FBa0IsaUJBQVM7QUFDakMsU0FBSU0sTUFBTUMsT0FBTixDQUFjeUosS0FBZCxDQUFKLEVBQTBCLGFBQVdBLE1BQU0zQixJQUFOLENBQVcsR0FBWCxDQUFYO0FBQzFCLFlBQU8sS0FBSzJCLEtBQVo7QUFDQSxLQUhNLEVBR0ozQixJQUhJLENBR0MsRUFIRCxDQUFQO0FBSUE7QUF2Q0Y7O0FBQUE7QUFBQSxJQTlYaUI7O0FBZ2JqQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Q7QUFDQ3FPLGlCQXhiaUIsNEJBd2JBcE0sT0F4YkEsRUF3YlMvTixJQXhiVCxFQXdiZWdELEtBeGJmLEVBd2JzQkMsR0F4YnRCLEVBd2IyQjtBQUMzQyxNQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxNQUFNakQsS0FBS2dDLE1BQTFDLEVBQWtEaUIsTUFBTWpELEtBQUtnQyxNQUFYO0FBQ2xELE1BQUlnQixTQUFTQyxHQUFiLEVBQWtCLE9BQU9QLFNBQVA7O0FBRWxCLE1BQUk4SyxXQUFXLEVBQWY7QUFDQSxNQUFJN0gsVUFBVSxDQUFkO0FBQ0EsTUFBSWtWLGdCQUFjOU0sT0FBZCxNQUFKOztBQUVBLE1BQUliLFlBQVlsSyxLQUFoQjtBQUNBLFNBQU0sSUFBTixFQUFZO0FBQ1gsT0FBSUosU0FBUyxLQUFLa1ksYUFBTCxDQUFtQkQsTUFBbkIsRUFBMkI3YSxJQUEzQixFQUFpQ2tOLFNBQWpDLEVBQTRDakssR0FBNUMsQ0FBYjtBQUNBLE9BQUksQ0FBQ0wsTUFBTCxFQUFhOztBQUZGLGlDQUlhQSxNQUpiO0FBQUEsT0FJTjZLLEtBSk07QUFBQSxPQUlDMk0sUUFKRDs7QUFLWGxOLGVBQVlrTixRQUFaO0FBQ0E7QUFDQSxPQUFJM00sVUFBVW9OLE1BQWQsRUFBc0I7QUFDckJsVjtBQUNBLFFBQUlBLFlBQVksQ0FBaEIsRUFBbUI7QUFDbkI7QUFDQSxJQUpELE1BS0s7QUFDSixRQUFJOEgsS0FBSixFQUFXRCxTQUFTcEksSUFBVCxDQUFjcUksS0FBZDtBQUNYO0FBQ0Q7QUFDSDtBQUNFLE1BQUk5SCxZQUFZLENBQWhCLEVBQW1CO0FBQ2xCLE9BQUl2RCxVQUFVNEQsSUFBZCxFQUFvQjtBQUNuQmpGLFlBQVEwSSxJQUFSLHVCQUFpQ3pKLEtBQUs4RixLQUFMLENBQVc5QyxLQUFYLEVBQWtCa0ssWUFBWSxFQUE5QixDQUFqQztBQUNBO0FBQ0Q7QUFDRCxTQUFPLENBQUNNLFFBQUQsRUFBV04sU0FBWCxDQUFQO0FBQ0EsRUF4ZGdCOzs7QUEwZGpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTROLGNBL2RpQix5QkErZEhELE1BL2RHLEVBK2RLN2EsSUEvZEwsRUErZDJCO0FBQUEsTUFBaEJnRCxLQUFnQix1RUFBUixDQUFRO0FBQUEsTUFBTEMsR0FBSzs7QUFDM0MsU0FBTyxLQUFLOFgsY0FBTCxDQUFvQkYsTUFBcEIsRUFBNEI3YSxJQUE1QixFQUFrQ2dELEtBQWxDLEVBQXlDQyxHQUF6QyxLQUNILEtBQUsrWCxrQkFBTCxDQUF3QmhiLElBQXhCLEVBQThCZ0QsS0FBOUIsRUFBcUNDLEdBQXJDLENBREcsSUFFSCxLQUFLd1YsZUFBTCxDQUFxQnpZLElBQXJCLEVBQTJCZ0QsS0FBM0IsRUFBa0NDLEdBQWxDO0FBQ047QUFIUyxLQUlILEtBQUtnWSxZQUFMLENBQWtCamIsSUFBbEIsRUFBd0JnRCxLQUF4QixFQUErQkMsR0FBL0IsQ0FKSjtBQUtBLEVBcmVnQjs7O0FBdWVqQjtBQUNBO0FBQ0E4WCxlQXplaUIsMEJBeWVGRixNQXplRSxFQXllTTdhLElBemVOLEVBeWU0QjtBQUFBLE1BQWhCZ0QsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQzVDLE1BQUksT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1qRCxLQUFLZ0MsTUFBMUMsRUFBa0RpQixNQUFNakQsS0FBS2dDLE1BQVg7QUFDbEQsTUFBSWdCLFNBQVNDLEdBQWIsRUFBa0IsT0FBT1AsU0FBUDs7QUFFbEIsTUFBSXdLLFlBQVksS0FBSzJMLGFBQUwsQ0FBbUI3WSxJQUFuQixFQUF5QmdELEtBQXpCLEVBQWdDQyxHQUFoQyxDQUFoQjtBQUNBLE1BQUksQ0FBQyxLQUFLaVksaUJBQUwsQ0FBdUJMLE1BQXZCLEVBQStCN2EsSUFBL0IsRUFBcUNrTixTQUFyQyxFQUFnRGpLLEdBQWhELENBQUwsRUFBMkQsT0FBT1AsU0FBUDtBQUMzRCxTQUFPLENBQUNtWSxNQUFELEVBQVMzTixZQUFZMk4sT0FBTzdZLE1BQTVCLENBQVA7QUFDQSxFQWhmZ0I7OztBQW1makI7QUFDQTtBQUNBOztBQUVBO0FBQ0Q7QUFDQ21aLHNCQUFzQiwwQkF6Zkw7QUEwZmpCWCxrQkExZmlCLDZCQTBmQ3hhLElBMWZELEVBMGZ1QjtBQUFBLE1BQWhCZ0QsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQ3ZDLE1BQUksT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1qRCxLQUFLZ0MsTUFBMUMsRUFBa0RpQixNQUFNakQsS0FBS2dDLE1BQVg7QUFDbEQsTUFBSWdCLFNBQVNDLEdBQWIsRUFBa0IsT0FBT1AsU0FBUDs7QUFFbEI7QUFDQSxNQUFJLENBQUMsS0FBS3NXLFVBQUwsQ0FBZ0IvWSxJQUFoQixDQUFxQkQsS0FBS2dELEtBQUwsQ0FBckIsQ0FBTCxFQUF3QyxPQUFPTixTQUFQOztBQUV4QztBQUNBLE1BQUlFLFNBQVMsS0FBSzBXLHFCQUFMLENBQTJCLEtBQUs2QixtQkFBaEMsRUFBcURuYixJQUFyRCxFQUEyRGdELEtBQTNELEVBQWtFQyxHQUFsRSxDQUFiO0FBQ0EsTUFBSSxDQUFDTCxNQUFMLEVBQWEsT0FBT0YsU0FBUDs7QUFUMEIsZ0NBV1RFLE1BWFM7QUFBQSxNQVdqQ3lNLEtBWGlDO0FBQUEsTUFXMUI3SyxJQVgwQjtBQUFBLE1BV3BCNFcsTUFYb0I7O0FBWXZDLE1BQUlsTyxZQUFZbEssUUFBUXFNLE1BQU1yTixNQUE5QjtBQUNBLE1BQUlxWixZQUFZLElBQUlqWixVQUFVa1osWUFBZCxDQUEyQjlXLElBQTNCLENBQWhCOztBQUVBO0FBQ0EsTUFBSTRXLE1BQUosRUFBWTtBQUFBLGVBQ2EsS0FBS0csc0JBQUwsQ0FBNEJ2YixJQUE1QixFQUFrQ2tOLFNBQWxDLEVBQTZDakssR0FBN0MsS0FBcUQsRUFEbEU7QUFBQTtBQUFBLE9BQ044QixLQURNO0FBQUEsT0FDQ3lXLFFBREQ7O0FBRVgsT0FBSXpXLEtBQUosRUFBVztBQUNWc1csY0FBVXRXLEtBQVYsR0FBa0JBLEtBQWxCO0FBQ0FtSSxnQkFBWXNPLFFBQVo7QUFDQTtBQUNEO0FBQ0Q7QUFDQXRPLGNBQVksS0FBSzJMLGFBQUwsQ0FBbUI3WSxJQUFuQixFQUF5QmtOLFNBQXpCLEVBQW9DakssR0FBcEMsQ0FBWjtBQUNBLFNBQU8sQ0FBQ29ZLFNBQUQsRUFBWW5PLFNBQVosQ0FBUDtBQUNBLEVBcGhCZ0I7OztBQXNoQmpCO0FBQ0E7QUFDQXFPLHVCQXhoQmlCLGtDQXdoQk12YixJQXhoQk4sRUF3aEJZZ0QsS0F4aEJaLEVBd2hCbUJDLEdBeGhCbkIsRUF3aEJ3QjtBQUN4QyxTQUFPLEtBQUt5VixTQUFMLENBQWUxWSxJQUFmLEVBQXFCZ0QsS0FBckIsRUFBNEJDLEdBQTVCLEtBQ0gsS0FBSytYLGtCQUFMLENBQXdCaGIsSUFBeEIsRUFBOEJnRCxLQUE5QixFQUFxQ0MsR0FBckMsQ0FERyxJQUVILEtBQUt3VixlQUFMLENBQXFCelksSUFBckIsRUFBMkJnRCxLQUEzQixFQUFrQ0MsR0FBbEMsQ0FGRyxJQUdILEtBQUt3WSxnQ0FBTCxDQUFzQ3piLElBQXRDLEVBQTRDZ0QsS0FBNUMsRUFBbURDLEdBQW5ELENBSEcsSUFJSCxLQUFLc1YsV0FBTCxDQUFpQnZZLElBQWpCLEVBQXVCZ0QsS0FBdkIsRUFBOEJDLEdBQTlCLENBSko7QUFNQSxFQS9oQmdCOzs7QUFpaUJqQjtBQUNBO0FBQ0F3WSxpQ0FuaUJpQiw0Q0FtaUJnQnpiLElBbmlCaEIsRUFtaUJzQmdELEtBbmlCdEIsRUFtaUI2QkMsR0FuaUI3QixFQW1pQmtDO0FBQ2xELE1BQUlMLFNBQVMsS0FBSzBWLFNBQUwsQ0FBZXRZLElBQWYsRUFBcUJnRCxLQUFyQixFQUE0QkMsR0FBNUIsQ0FBYjtBQUNBLE1BQUksQ0FBQ0wsTUFBTCxFQUFhOztBQUZxQyxnQ0FJeEJBLE1BSndCO0FBQUEsTUFJNUMxQyxJQUo0QztBQUFBLE1BSXRDZ04sU0FKc0M7O0FBS2xELE1BQUkxSyxRQUFRLElBQUlKLFVBQVVrTCxhQUFkLENBQTRCcE4sSUFBNUIsQ0FBWjtBQUNBLFNBQU8sQ0FBQ3NDLEtBQUQsRUFBUTBLLFNBQVIsQ0FBUDtBQUNBLEVBMWlCZ0I7OztBQTRpQmpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUFvTztBQUNDLHdCQUFZOVcsSUFBWixFQUFrQk8sS0FBbEIsRUFBeUI7QUFBQTs7QUFDeEIsUUFBS1AsSUFBTCxHQUFZQSxJQUFaO0FBQ0EsT0FBSU8sVUFBVXJDLFNBQWQsRUFBeUIsS0FBS3FDLEtBQUwsR0FBYUEsS0FBYjtBQUN6Qjs7QUFKRjtBQUFBO0FBQUEsOEJBS1k7QUFDVixRQUFJLEtBQUtBLEtBQUwsS0FBZXJDLFNBQW5CLEVBQThCLE9BQU8sS0FBSzhCLElBQVo7QUFDOUIsV0FBVSxLQUFLQSxJQUFmLFVBQXdCLEtBQUtPLEtBQTdCO0FBQ0E7QUFSRjs7QUFBQTtBQUFBLElBcmpCaUI7O0FBaWtCakI7QUFDQTtBQUNBO0FBQ0E7QUFDRDtBQUNBO0FBQ0E7QUFDQ2lXLG1CQXhrQmlCLDhCQXdrQkVoYixJQXhrQkYsRUF3a0J3QjtBQUFBLE1BQWhCZ0QsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQ3hDLE1BQUksT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1qRCxLQUFLZ0MsTUFBMUMsRUFBa0RpQixNQUFNakQsS0FBS2dDLE1BQVg7QUFDbEQsTUFBSWdCLFNBQVNDLEdBQWIsRUFBa0IsT0FBT1AsU0FBUDs7QUFFbEIsTUFBSXdLLFlBQVksS0FBSzJMLGFBQUwsQ0FBbUI3WSxJQUFuQixFQUF5QmdELEtBQXpCLEVBQWdDQyxHQUFoQyxDQUFoQjtBQUNBLE1BQUl5WSxXQUFXLEtBQUtDLGtCQUFMLENBQXdCLEdBQXhCLEVBQTZCLEdBQTdCLEVBQWtDM2IsSUFBbEMsRUFBd0NrTixTQUF4QyxFQUFtRGpLLEdBQW5ELENBQWY7QUFDQSxNQUFJeVksYUFBYWhaLFNBQWpCLEVBQTRCLE9BQU9BLFNBQVA7O0FBRTVCO0FBQ0EsTUFBSXNTLFdBQVdoVixLQUFLOEYsS0FBTCxDQUFXOUMsUUFBUSxDQUFuQixFQUFzQjBZLFFBQXRCLENBQWY7O0FBRUE7QUFDQSxNQUFJdk0sYUFBYSxJQUFJL00sVUFBVWtMLGFBQWQsQ0FBNEIwSCxRQUE1QixDQUFqQjtBQUNBLFNBQU8sQ0FBQzdGLFVBQUQsRUFBYXVNLFdBQVcsQ0FBeEIsQ0FBUDtBQUNBLEVBdGxCZ0I7OztBQXdsQmpCO0FBQ0FwTztBQUNDLHlCQUFZMEgsUUFBWixFQUFzQjtBQUFBOztBQUNyQixRQUFLQSxRQUFMLEdBQWdCQSxZQUFZLEVBQTVCO0FBQ0E7QUFDRDs7O0FBSkQ7QUFBQTtBQUFBLHVCQUtjO0FBQ1osV0FBTzVTLFVBQVVDLFFBQVYsQ0FBbUIsS0FBSzJTLFFBQUwsQ0FBY3RILElBQWQsRUFBbkIsQ0FBUDtBQUNBO0FBUEY7O0FBQUE7QUFBQSxJQXpsQmlCOztBQW1tQmpCO0FBQ0E7QUFDQWtPLHFCQUFxQixDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixDQXJtQko7QUFzbUJsQjtBQUNDWCxhQXZtQmlCLHdCQXVtQkpqYixJQXZtQkksRUF1bUJrQjtBQUFBLE1BQWhCZ0QsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQ2xDLE1BQUksT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1qRCxLQUFLZ0MsTUFBMUMsRUFBa0RpQixNQUFNakQsS0FBS2dDLE1BQVg7QUFDbEQsTUFBSWdCLFNBQVNDLEdBQWIsRUFBa0IsT0FBT1AsU0FBUDs7QUFFbEI7QUFDQSxNQUFJd0ssWUFBWSxLQUFLMkwsYUFBTCxDQUFtQjdZLElBQW5CLEVBQXlCZ0QsS0FBekIsRUFBZ0NDLEdBQWhDLENBQWhCO0FBQ0EsTUFBSXlZLFdBQVcsS0FBS0csZUFBTCxDQUFxQixLQUFLRCxrQkFBMUIsRUFBOEM1YixJQUE5QyxFQUFvRGtOLFNBQXBELEVBQStEakssR0FBL0QsQ0FBZjtBQUNBO0FBQ0EsTUFBSXlZLGFBQWF4TyxTQUFqQixFQUE0QixPQUFPeEssU0FBUDs7QUFFNUI7QUFDQSxNQUFJZ1osYUFBYWhaLFNBQWpCLEVBQTRCO0FBQzNCLE9BQUlOLFVBQVU0RCxJQUFkLEVBQW9CO0FBQ25CakYsWUFBUTBJLElBQVIsQ0FBYSxrQkFBZ0J6SixLQUFLOEYsS0FBTCxDQUFXOUMsS0FBWCxFQUFrQkEsUUFBUSxFQUExQixDQUFoQixHQUE4QyxnQ0FBM0Q7QUFDQTtBQUNELFVBQU9OLFNBQVA7QUFDQTs7QUFFRDtBQUNBLE1BQUlvWixVQUFVOWIsS0FBSzhGLEtBQUwsQ0FBVzlDLEtBQVgsRUFBa0IwWSxRQUFsQixDQUFkO0FBQ0EsU0FBTyxDQUFDSSxPQUFELEVBQVVKLFFBQVYsQ0FBUDtBQUNBLEVBNW5CZ0I7OztBQWlvQmpCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDRDtBQUNDNUIsY0F6b0JpQix5QkF5b0JIOVosSUF6b0JHLEVBeW9CbUI7QUFBQSxNQUFoQmdELEtBQWdCLHVFQUFSLENBQVE7QUFBQSxNQUFMQyxHQUFLOztBQUNuQyxNQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxNQUFNakQsS0FBS2dDLE1BQTFDLEVBQWtEaUIsTUFBTWpELEtBQUtnQyxNQUFYO0FBQ2xELE1BQUlnQixTQUFTQyxHQUFiLEVBQWtCLE9BQU8sRUFBUDs7QUFFbEIsTUFBSTZVLFVBQVU5WCxLQUFLMEwsT0FBTCxDQUFhLElBQWIsRUFBbUIxSSxLQUFuQixDQUFkO0FBQ0EsTUFBSThVLFlBQVksQ0FBQyxDQUFiLElBQWtCQSxVQUFVN1UsR0FBaEMsRUFBcUM2VSxVQUFVN1UsR0FBVjtBQUNyQyxTQUFPakQsS0FBSzhGLEtBQUwsQ0FBVzlDLEtBQVgsRUFBa0I4VSxPQUFsQixDQUFQO0FBQ0EsRUFocEJnQjs7O0FBa3BCakI7QUFDRDtBQUNDb0Qsa0JBcHBCaUIsNkJBb3BCQ3BRLE1BcHBCRCxFQW9wQlM5SyxJQXBwQlQsRUFvcEIrQjtBQUFBLE1BQWhCZ0QsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQy9DLE1BQUksT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1qRCxLQUFLZ0MsTUFBMUMsRUFBa0RpQixNQUFNakQsS0FBS2dDLE1BQVg7QUFDbEQsTUFBSWdCLFNBQVNDLEdBQWIsRUFBa0IsT0FBT1AsU0FBUDs7QUFFbEIsTUFBSXFaLFlBQVkvWSxRQUFROEgsT0FBTzlJLE1BQS9CO0FBQ0EsTUFBSStaLFlBQVk5WSxHQUFoQixFQUFxQixPQUFPUCxTQUFQO0FBQ3JCLFNBQU9vSSxXQUFXOUssS0FBSzhGLEtBQUwsQ0FBVzlDLEtBQVgsRUFBa0IrWSxTQUFsQixDQUFsQjtBQUNBLEVBM3BCZ0I7OztBQThwQmpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0Q7QUFDQ3pDLHNCQW5xQmlCLGlDQW1xQktuSyxVQW5xQkwsRUFtcUJpQm5QLElBbnFCakIsRUFtcUJ1QztBQUFBLE1BQWhCZ0QsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQ3ZELE1BQUksT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1qRCxLQUFLZ0MsTUFBMUMsRUFBa0RpQixNQUFNakQsS0FBS2dDLE1BQVg7QUFDbEQsTUFBSWdCLFNBQVNDLEdBQWIsRUFBa0IsT0FBT1AsU0FBUDs7QUFFbEIsTUFBSXNaLE9BQU9oYyxLQUFLOEYsS0FBTCxDQUFXOUMsS0FBWCxFQUFrQkMsR0FBbEIsQ0FBWDtBQUNBLFNBQU8rWSxLQUFLM00sS0FBTCxDQUFXRixVQUFYLENBQVA7QUFDQSxFQXpxQmdCOzs7QUEycUJqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRDtBQUNDd00sbUJBcnJCaUIsOEJBcXJCRU0sY0FyckJGLEVBcXJCa0JDLFlBcnJCbEIsRUFxckJnQ2xjLElBcnJCaEMsRUFxckJzRDtBQUFBLE1BQWhCZ0QsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQ3RFLE1BQUksT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1qRCxLQUFLZ0MsTUFBMUMsRUFBa0RpQixNQUFNakQsS0FBS2dDLE1BQVg7QUFDbEQsTUFBSWdCLFNBQVNDLEdBQWIsRUFBa0IsT0FBT1AsU0FBUDs7QUFFbEIsTUFBSTFDLEtBQUtnRCxLQUFMLE1BQWdCaVosY0FBcEIsRUFBb0MsT0FBT3ZaLFNBQVA7O0FBRXBDLE1BQUlpRCxVQUFVLENBQWQ7QUFDQSxNQUFJK08sVUFBVTFSLEtBQWQ7QUFDQSxTQUFPMFIsVUFBVXpSLEdBQWpCLEVBQXNCO0FBQ3JCLE9BQUkwVyxPQUFPM1osS0FBSzBVLE9BQUwsQ0FBWDtBQUNBO0FBQ0EsT0FBSWlGLFNBQVNzQyxjQUFiLEVBQTZCO0FBQzVCdFc7QUFDQTtBQUNEO0FBSEEsUUFJSyxJQUFJZ1UsU0FBU3VDLFlBQWIsRUFBMkI7QUFDL0J2VztBQUNBLFNBQUlBLFlBQVksQ0FBaEIsRUFBbUIsT0FBTytPLE9BQVA7QUFDbkI7QUFDRDtBQUpLLFNBS0EsSUFBSWlGLFNBQVMsR0FBVCxJQUFnQkEsU0FBUyxHQUE3QixFQUFrQztBQUFBLGtCQUNaLEtBQUtqQixTQUFMLENBQWUxWSxJQUFmLEVBQXFCMFUsT0FBckIsRUFBOEJ6UixHQUE5QixLQUFzQyxFQUQxQjtBQUFBO0FBQUEsVUFDakNULEtBRGlDO0FBQUEsVUFDMUIyWixVQUQwQjs7QUFFdEN6SCxnQkFBVXlILFVBQVY7QUFDQSxlQUhzQyxDQUc1QjtBQUNWO0FBQ0Q7QUFMSyxVQU1BLElBQUl4QyxTQUFTLElBQWIsRUFBbUI7QUFDdkJBLGNBQU8zWixLQUFLMFUsVUFBVSxDQUFmLENBQVA7QUFDQSxXQUFJaUYsU0FBU3NDLGNBQVQsSUFDQXRDLFNBQVN1QyxZQURULElBRUF2QyxTQUFTLEdBRlQsSUFHQUEsU0FBUyxHQUhiLEVBSUU7QUFDRGpGLGtCQUFVO0FBQ1Y7QUFDRDtBQUNEQTtBQUNBO0FBQ0QsRUEzdEJnQjs7O0FBOHRCakI7QUFDQTtBQUNEO0FBQ0NtSCxnQkFqdUJpQiwyQkFpdUJETyxLQWp1QkMsRUFpdUJNcGMsSUFqdUJOLEVBaXVCNEI7QUFBQSxNQUFoQmdELEtBQWdCLHVFQUFSLENBQVE7QUFBQSxNQUFMQyxHQUFLOztBQUM1QyxNQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxNQUFNakQsS0FBS2dDLE1BQTFDLEVBQWtEaUIsTUFBTWpELEtBQUtnQyxNQUFYO0FBQ2xELE1BQUlnQixTQUFTQyxHQUFiLEVBQWtCLE9BQU9QLFNBQVA7O0FBRWxCLFNBQU9NLFFBQVFDLEdBQWYsRUFBb0I7QUFDbkIsT0FBSTBXLE9BQU8zWixLQUFLZ0QsS0FBTCxDQUFYO0FBQ0EsT0FBSW9aLE1BQU1ySSxRQUFOLENBQWU0RixJQUFmLENBQUosRUFBMEIsT0FBTzNXLEtBQVA7QUFDMUI7QUFDQSxPQUFJMlcsU0FBUyxJQUFULElBQWlCeUMsTUFBTXJJLFFBQU4sQ0FBZS9ULEtBQUtnRCxRQUFNLENBQVgsQ0FBZixDQUFyQixFQUFvREE7QUFDcERBO0FBQ0E7QUFDRCxNQUFJQSxTQUFTQyxHQUFiLEVBQWtCLE9BQU9QLFNBQVA7QUFDbEIsU0FBT00sS0FBUDtBQUNBLEVBOXVCZ0I7OztBQWl2QmxCO0FBQ0E7QUFDQTs7QUFFQztBQUNBTCx3QkF0dkJpQixtQ0FzdkJPUixNQXR2QlAsRUFzdkIwQjtBQUFBLE1BQVhhLEtBQVcsdUVBQUgsQ0FBRzs7QUFDMUMsU0FBT2IsT0FBT2EsS0FBUCxhQUF5QlosVUFBVWlULFVBQTFDO0FBQXNEclM7QUFBdEQsR0FDQSxJQUFJQSxVQUFVLENBQWQsRUFBaUIsT0FBT2IsTUFBUDtBQUNqQixTQUFPQSxPQUFPMkQsS0FBUCxDQUFhOUMsS0FBYixDQUFQO0FBQ0EsRUExdkJnQjs7O0FBNHZCakI7QUFDQXFaLHVCQTd2QmlCLGtDQTZ2Qk1sYSxNQTd2Qk4sRUE2dkJjO0FBQzlCLFNBQU9BLE9BQU9HLE1BQVAsQ0FBYztBQUFBLFVBQVMsQ0FBQ0YsVUFBVUcsa0JBQVYsQ0FBNkJDLEtBQTdCLENBQVY7QUFBQSxHQUFkLENBQVA7QUFDQSxFQS92QmdCOzs7QUFrd0JqQjtBQUNBRCxtQkFud0JpQiw4QkFtd0JFQyxLQW53QkYsRUFtd0JTO0FBQ3pCLFNBQU9BLGlCQUFpQkosVUFBVWlULFVBQTNCLElBQ0gsRUFBRTdTLGlCQUFpQkosVUFBVTJWLE1BQTdCLENBREcsSUFFRnZWLFVBQVVKLFVBQVU0VixPQUZ6QjtBQUdBLEVBdndCZ0I7OztBQTB3QmxCO0FBQ0E7QUFDQTs7QUFFQztBQUNBeko7QUFDQyxpQkFBWWhLLEtBQVosRUFBa0I7QUFBQTs7QUFDakIzQyxVQUFPQyxNQUFQLENBQWMsSUFBZCxFQUFvQjBDLEtBQXBCO0FBQ0EsT0FBSSxDQUFDLEtBQUt5USxRQUFWLEVBQW9CLEtBQUtBLFFBQUwsR0FBZ0IsRUFBaEI7QUFDcEI7O0FBSkY7QUFBQTtBQUFBLDhCQU1ZO0FBQ1YsV0FBT2pNLEtBQUtFLFNBQUwsQ0FBZSxJQUFmLEVBQXFCLElBQXJCLEVBQTJCLElBQTNCLENBQVA7QUFDQTtBQVJGOztBQUFBO0FBQUEsSUEvd0JpQjs7QUEweEJqQjtBQUNBO0FBQ0E7QUFDQXFULGVBN3hCaUIsMEJBNnhCRm5hLE1BN3hCRSxFQTZ4Qk07QUFDdEI7QUFDQSxNQUFJb2EsY0FBYyxFQUFsQjtBQUNBLE1BQUk1USxRQUFRLENBQUM0USxXQUFELENBQVo7QUFDQXBhLFNBQU84QixPQUFQLENBQWUsaUJBQVM7QUFDdkI7QUFDQSxPQUFJekIsVUFBVUosVUFBVTRWLE9BQXhCLEVBQWlDO0FBQ2hDO0FBQ0F1RSxrQkFBYyxFQUFkO0FBQ0EsV0FBTzVRLE1BQU12RyxJQUFOLENBQVdtWCxXQUFYLENBQVA7QUFDQTs7QUFFRDtBQUNBQSxlQUFZblgsSUFBWixDQUFpQjVDLEtBQWpCO0FBQ0EsR0FWRDs7QUFZQTtBQUNBbUosUUFBTTFILE9BQU4sQ0FBYyxVQUFDNEgsSUFBRCxFQUFPbUYsS0FBUCxFQUFpQjtBQUM5QixPQUFJbkYsS0FBSzdKLE1BQUwsS0FBZ0IsQ0FBaEIsSUFBcUI2SixLQUFLLENBQUwsYUFBbUJ6SixVQUFVaVQsVUFBdEQsRUFBa0UxSixNQUFNcUYsS0FBTixJQUFlLEVBQWY7QUFDbEUsR0FGRDs7QUFJQSxTQUFPckYsS0FBUDtBQUNBLEVBbnpCZ0I7OztBQXF6QmpCO0FBQ0E7QUFDQTZRLGVBdnpCaUIsMEJBdXpCRjdRLEtBdnpCRSxFQXV6QndCO0FBQUEsTUFBbkI4USxhQUFtQix1RUFBSCxDQUFHOztBQUN4QyxNQUFJOVEsTUFBTTNKLE1BQU4sS0FBaUIsQ0FBckIsRUFBd0IsT0FBTyxFQUFQOztBQUV4QixNQUFNMGEsVUFBVS9RLE1BQU1sSSxHQUFOLENBQVVyQixVQUFVdWEsYUFBcEIsQ0FBaEI7QUFDQSxNQUFNMVosTUFBTXlaLFFBQVExYSxNQUFwQjs7QUFFQTtBQUNBLE1BQUk0YSxjQUFjQyxjQUFjLENBQWQsQ0FBbEI7QUFDQSxNQUFJRCxnQkFBZ0JsYSxTQUFwQixFQUErQmthLGNBQWNILGFBQWQ7O0FBRS9CO0FBQ0EsT0FBSyxJQUFJekwsUUFBUSxDQUFqQixFQUFvQkEsUUFBUS9OLEdBQTVCLEVBQWlDK04sT0FBakMsRUFBMEM7QUFDekMsT0FBSTBMLFFBQVExTCxLQUFSLE1BQW1CdE8sU0FBdkIsRUFBa0M7QUFDakNnYSxZQUFRMUwsS0FBUixJQUFpQjZMLGNBQWM3TCxRQUFRLENBQXRCLENBQWpCO0FBQ0E7QUFDRDtBQUNELFNBQU8wTCxPQUFQOztBQUVBO0FBQ0EsV0FBU0csYUFBVCxDQUF1QjdMLEtBQXZCLEVBQThCO0FBQzdCLFVBQU9BLFFBQVEvTixHQUFmLEVBQW9CO0FBQ25CLFFBQUl5WixRQUFRMUwsS0FBUixNQUFtQnRPLFNBQXZCLEVBQWtDLE9BQU9nYSxRQUFRMUwsS0FBUixDQUFQO0FBQ2xDQTtBQUNBO0FBQ0QsVUFBTzRMLFdBQVA7QUFDQTtBQUNELEVBajFCZ0I7OztBQW8xQmpCO0FBQ0E7QUFDQTtBQUNBRCxjQXYxQmlCLHlCQXUxQkg5USxJQXYxQkcsRUF1MUJHO0FBQ25CLE1BQUksQ0FBQ0EsSUFBRCxJQUFTQSxLQUFLN0osTUFBTCxLQUFnQixDQUE3QixFQUFnQyxPQUFPVSxTQUFQO0FBQ2hDLE1BQUltSixLQUFLLENBQUwsYUFBbUJ6SixVQUFVMlYsTUFBakMsRUFBeUMsT0FBT2xNLEtBQUssQ0FBTCxFQUFRN0osTUFBZjtBQUN6QyxTQUFPLENBQVA7QUFDQSxFQTMxQmdCOzs7QUE2MUJqQjtBQUNBO0FBQ0FrVSxrQkFBaUIseUJBQVMvVCxNQUFULEVBQWlEO0FBQUEsTUFBaENhLEtBQWdDLHVFQUF4QixDQUF3QjtBQUFBLE1BQXJCQyxHQUFxQix1RUFBZmQsT0FBT0gsTUFBUTs7QUFDakU7QUFDQUcsV0FBU0EsT0FBTzJELEtBQVAsQ0FBYTlDLEtBQWIsRUFBb0JDLEdBQXBCLENBQVQ7QUFDQTtBQUNGO0FBQ0VkLFdBQVNDLFVBQVVpYSxzQkFBVixDQUFpQ2xhLE1BQWpDLENBQVQ7O0FBRUE7QUFDQSxNQUFJd0osUUFBUXZKLFVBQVVrYSxjQUFWLENBQXlCbmEsTUFBekIsQ0FBWjtBQUNBLE1BQUl3SixNQUFNM0osTUFBTixLQUFpQixDQUFyQixFQUF3QixPQUFPLEVBQVA7O0FBRXhCO0FBQ0EsTUFBSTBhLFVBQVV0YSxVQUFVb2EsY0FBVixDQUF5QjdRLEtBQXpCLENBQWQ7O0FBRUE7QUFDQSxNQUFJbVIsWUFBWUMsS0FBS0MsR0FBTCxDQUFTM2IsS0FBVCxDQUFlMGIsSUFBZixFQUFxQkwsT0FBckIsQ0FBaEI7QUFDQSxNQUFJck8sUUFBUSxJQUFJak0sVUFBVW1NLEtBQWQsQ0FBb0IsRUFBRXdHLFFBQVErSCxTQUFWLEVBQXBCLENBQVo7O0FBRUE7QUFDQSxNQUFJNVosUUFBUSxDQUFDbUwsS0FBRCxDQUFaOztBQUVBMUMsUUFBTTFILE9BQU4sQ0FBZSxVQUFDNEgsSUFBRCxFQUFPbUYsS0FBUCxFQUFpQjtBQUMvQjtBQUNBbkYsVUFBT3pKLFVBQVVPLHVCQUFWLENBQWtDa0osSUFBbEMsQ0FBUDs7QUFFQSxPQUFJb1IsYUFBYVAsUUFBUTFMLEtBQVIsQ0FBakI7QUFDQSxPQUFJdEosTUFBTXhFLE1BQU1BLE1BQU1sQixNQUFOLEdBQWUsQ0FBckIsQ0FBVjtBQUNBO0FBQ0EsT0FBSWliLGFBQWF2VixJQUFJcU4sTUFBckIsRUFBNkI7QUFDNUIsV0FBT2tJLGFBQWF2VixJQUFJcU4sTUFBeEIsRUFBZ0M7QUFDL0IsU0FBSW1JLFdBQVcsSUFBSTlhLFVBQVVtTSxLQUFkLENBQW9CLEVBQUV3RyxRQUFRck4sSUFBSXFOLE1BQUosR0FBYSxDQUF2QixFQUFwQixDQUFmO0FBQ0FyTixTQUFJc04sUUFBSixDQUFhNVAsSUFBYixDQUFrQjhYLFFBQWxCO0FBQ0FoYSxXQUFNa0MsSUFBTixDQUFXOFgsUUFBWDs7QUFFQXhWLFdBQU13VixRQUFOO0FBQ0E7QUFDRDtBQUNEO0FBVEEsUUFVSyxJQUFJRCxhQUFhdlYsSUFBSXFOLE1BQXJCLEVBQTZCO0FBQ2pDLFlBQU9rSSxhQUFhdlYsSUFBSXFOLE1BQXhCLEVBQWdDO0FBQy9CN1IsWUFBTTBULEdBQU47QUFDQWxQLFlBQU14RSxNQUFNQSxNQUFNbEIsTUFBTixHQUFlLENBQXJCLENBQU47QUFDQTtBQUNEO0FBQ0Q7QUFDQTBGLE9BQUlzTixRQUFKLENBQWE1UCxJQUFiLENBQWtCeUcsSUFBbEI7QUFDQSxHQXpCRDs7QUEyQkEsU0FBT3dDLEtBQVA7QUFDQTs7QUFoNUJnQixDQUFsQjs7a0JBdTVCZWpNLFM7Ozs7Ozs7QUN0OEJmLDZCQUE2QjtBQUM3Qix1Q0FBdUM7Ozs7Ozs7O0FDRHZDO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLFdBQVcsRUFBRTtBQUNyRCx3Q0FBd0MsV0FBVyxFQUFFOztBQUVyRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLHNDQUFzQztBQUN0QyxHQUFHO0FBQ0g7QUFDQSw4REFBOEQ7QUFDOUQ7O0FBRUE7QUFDQTtBQUNBLEVBQUU7O0FBRUY7QUFDQTtBQUNBOzs7Ozs7OztBQ3hGQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxnQ0FBZ0MsVUFBVSxFQUFFO0FBQzVDLEM7Ozs7Ozs7QUN6QkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsZ0NBQWdDLFVBQVUsRUFBRTtBQUM1QyxDOzs7Ozs7Ozs7Ozs7O1FDbkJnQithLFUsR0FBQUEsVTtBQU5oQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNPLFNBQVNBLFVBQVQsQ0FBb0I3WSxXQUFwQixFQUEwRDtBQUFBLE1BQXpCRSxJQUF5Qix1RUFBbEJGLFlBQVlFLElBQU07O0FBQy9EO0FBQ0EvRCxTQUFPMmMsY0FBUCxHQUF3QjlZLFdBQXhCO0FBQ0EsTUFBTTBJLFFBQVEsSUFBSXFRLFFBQUosQ0FBYSxNQUFiLG9CQUFxQzdZLElBQXJDLGtDQUFkO0FBQ0EsU0FBTy9ELE9BQU8yYyxjQUFkO0FBQ0EsU0FBT3BRLEtBQVA7QUFDRCxDOzs7Ozs7OztBQ1pEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBnbG9iYWwgZnJvbSBcIi4vZ2xvYmFsXCI7XG5cbi8vIFJldHVybiB0cnVlIGlmIHRleHQgaXMgYWxsIHdoaXRlc3BhY2UsIGluY2x1ZGluZyBlbXB0eSBzdHJpbmcuXG5sZXQgQUxMX1dISVRFU1BBQ0UgPSAvXlxccyokLztcbmV4cG9ydCBmdW5jdGlvbiBpc1doaXRlc3BhY2UodGV4dCkge1xuXHRyZXR1cm4gQUxMX1dISVRFU1BBQ0UudGVzdCh0ZXh0KVxufVxuXG4vLyBSZXR1cm4gdGhlIHBsdXJhbCBvZiBgd29yZGAuXG4vLyBOT1RFOiB0aGlzIGlzIG5vdCB2ZXJ5IGdvb2QgYXQgYWxsISEhXG4vLyBUT0RPOiBleGNlcHRpb25zLCBldGMuXG5leHBvcnQgZnVuY3Rpb24gcGx1cmFsaXplKHdvcmQpIHtcblx0cmV0dXJuIHdvcmQgKyBcInNcIjtcbn1cblxuLy8gUmV0dXJuIHRydWUgaWYgd29yZCBpcyBhIHBsdXJhbC5cbi8vIE5PVEU6IGZvciB3b3JkcyB3aGljaCBhcmUgQk9USCBzaW5ndWxhciBhbmQgcGx1cmFsLCB0aGlzIHdpbGwgcmV0dXJuIHRydWUuXG5leHBvcnQgZnVuY3Rpb24gaXNQbHVyYWwod29yZCkge1xuXHRyZXR1cm4gd29yZCA9PT0gcGx1cmFsaXplKHdvcmQpO1xufVxuXG5cbi8vIFJldHVybiB0aGUgc2luZ3VsYXIgb2YgYHdvcmRgLlxuLy8gTk9URTogdGhpcyBpcyBub3QgdmVyeSBnb29kIGF0IGFsbCEhIVxuLy8gVE9ETzogZXhjZXB0aW9ucywgZXRjLlxuZXhwb3J0IGZ1bmN0aW9uIHNpbmd1bGFyaXplKHdvcmQpIHtcblx0cmV0dXJuIHdvcmQucmVwbGFjZSgvZT9zJC8sIFwiXCIpO1xufVxuXG4vLyBSZXR1cm4gdHJ1ZSBpZiB3b3JkIGlzIGEgc2luZ3VsYXIuXG4vLyBOT1RFOiBmb3Igd29yZHMgd2hpY2ggYXJlIEJPVEggc2luZ3VsYXIgYW5kIHBsdXJhbCwgdGhpcyB3aWxsIHJldHVybiB0cnVlLlxuZXhwb3J0IGZ1bmN0aW9uIGlzU2luZ3VsYXIod29yZCkge1xuXHRyZXR1cm4gd29yZCA9PT0gc2luZ3VsYXJpemUod29yZCk7XG59XG5cblxuLy8gUmV0dXJuIGEgY2VydGFpbiBgbnVtYmVyYCBvZiB0YWIgY2hhcmFjdGVycy5cbmNvbnN0IFRBQlMgPSBcIlxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFwiO1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRhYnMobnVtYmVyKSB7XG5cdGlmICh0eXBlb2YgbnVtYmVyICE9PSBcIm51bWJlclwiKSByZXR1cm4gXCJcIjtcblx0cmV0dXJuIFRBQlMuc3Vic3RyKDAsIG51bWJlcik7XG59XG5cblxuLy8gRXhwb3J0IGFsbCBhcyBhIGx1bXBcbmxldCBhbGxFeHBvcnRzID0gey4uLmV4cG9ydHN9O1xuZXhwb3J0IGRlZmF1bHQgYWxsRXhwb3J0cztcblxuLy8gREVCVUc6IHB1dCBvbiBnbG9iYWwgZm9yIGRlYnVnZ2luZy5cbmdsb2JhbC5TVFJJTkcgPSBhbGxFeHBvcnRzO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3V0aWxzL3N0cmluZy5qcyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKCFpc09iamVjdChpdCkpIHRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2FuLW9iamVjdC5qc1xuLy8gbW9kdWxlIGlkID0gMTE0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4ZWMpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gISFleGVjKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2ZhaWxzLmpzXG4vLyBtb2R1bGUgaWQgPSAxMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICdjb3JlLWpzL2VzNi9zeW1ib2wnO1xuXG4vLyBUT0RPOiBOZWVkIGJldHRlciwgbW9yZSBjb21wbGV0ZSwgYW5kIG1vcmUgbWV0aG9kaWNhbCBrZXkgZGVmaW5pdGlvbnNcblxudmFyIEtleXMgPSB7XG4gIGJhY2tzcGFjZTogOCxcbiAgZGVsOiA0NixcbiAgZGVsZXRlOiA0NixcbiAgdGFiOiA5LFxuICBlbnRlcjogMTMsXG4gICdyZXR1cm4nOiAxMyxcbiAgZXNjOiAyNyxcbiAgc3BhY2U6IDMyLFxuICBwYWdlVXA6IDMzLFxuICBwYWdlRG93bjogMzQsXG4gIGVuZDogMzUsXG4gIGhvbWU6IDM2LFxuICBsZWZ0OiAzNyxcbiAgdXA6IDM4LFxuICByaWdodDogMzksXG4gIGRvd246IDQwLFxuICAnOyc6IDE4NixcbiAgJz0nOiAxODcsXG4gICcsJzogMTg4LFxuICAnLSc6IDE4OSxcbiAgJy4nOiAxOTAsXG4gICcvJzogMTkxLFxuICAnYCc6IDE5MixcbiAgJ1snOiAyMTksXG4gICdcXFxcJzogMjIwLFxuICAnXSc6IDIyMVxufTtcblxuLy8gQWRkIHVwcGVyY2FzZSB2ZXJzaW9ucyBvZiBrZXlzIGFib3ZlIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuT2JqZWN0LmtleXMoS2V5cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBLZXlzW2tleS50b1VwcGVyQ2FzZSgpXSA9IEtleXNba2V5XTtcbn0pO1xuXG4nMDEyMzQ1Njc4OScuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24gKG51bSwgaW5kZXgpIHtcbiAgcmV0dXJuIEtleXNbbnVtXSA9IGluZGV4ICsgNDg7XG59KTtcblxuJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJy5zcGxpdCgnJykuZm9yRWFjaChmdW5jdGlvbiAobGV0dGVyLCBpbmRleCkge1xuICBLZXlzW2xldHRlcl0gPSBpbmRleCArIDY1O1xuICBLZXlzW2xldHRlci50b0xvd2VyQ2FzZSgpXSA9IGluZGV4ICsgNjU7XG59KTtcblxuLy8gZm4ga2V5c1xuWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTJdLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XG4gIHJldHVybiBLZXlzWydmJyArIGluZGV4XSA9IDExMSArIGluZGV4O1xufSk7XG5cbmV4cG9ydCB2YXIgbW9kaWZpZXJzID0ge1xuICBjb250cm9sOiAnY3RybCcsXG4gIGN0cmw6ICdjdHJsJyxcbiAgc2hpZnQ6ICdzaGlmdCcsXG4gIG1ldGE6ICdtZXRhJyxcbiAgY21kOiAnbWV0YScsXG4gIGNvbW1hbmQ6ICdtZXRhJyxcbiAgb3B0aW9uOiAnYWx0JyxcbiAgYWx0OiAnYWx0J1xufTtcblxuZXhwb3J0IHZhciBBTExfS0VZUyA9IFN5bWJvbCgnQUxMX0tFWVMnKTtcblxuZXhwb3J0IHZhciBBTExfUFJJTlRBQkxFX0tFWVMgPSBTeW1ib2woJ0FMTF9QUklOVEFCTEVfS0VZUycpO1xuXG5leHBvcnQgZGVmYXVsdCBLZXlzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9rZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSAxNDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIF9zbGljZWRUb0FycmF5ID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7IH0gfTsgfSgpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuLyoqXG4gKiBAbW9kdWxlIHN0b3JlXG4gKlxuICovXG5pbXBvcnQgbWF0Y2hLZXlzIGZyb20gJy4vbGliL21hdGNoX2tleXMnO1xuaW1wb3J0IHBhcnNlS2V5cyBmcm9tICcuL2xpYi9wYXJzZV9rZXlzJztcbmltcG9ydCB1dWlkIGZyb20gJy4vbGliL3V1aWQnO1xuXG4vKipcbiAqIHByaXZhdGVcbiAqXG4gKi9cblxuLy8gZGljdCBmb3IgY2xhc3MgcHJvdG90eXBlcyA9PiBiaW5kaW5nc1xudmFyIF9oYW5kbGVycyA9IG5ldyBNYXAoKTtcblxuLy8gYWxsIG1vdW50ZWQgaW5zdGFuY2VzIHRoYXQgaGF2ZSBrZXliaW5kaW5nc1xudmFyIF9pbnN0YW5jZXMgPSBuZXcgU2V0KCk7XG5cbi8vIGZvciB0ZXN0aW5nXG5leHBvcnQgZnVuY3Rpb24gX3Jlc2V0U3RvcmUoKSB7XG4gIF9oYW5kbGVycy5jbGVhcigpO1xuICBfaW5zdGFuY2VzLmNsZWFyKCk7XG59XG5cbi8qKlxuICogYWN0aXZhdGVcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IGluc3RhbmNlIEluc3RhbnRpYXRlZCBjbGFzcyB0aGF0IGV4dGVuZGVkIFJlYWN0LkNvbXBvbmVudCwgdG8gYmUgZm9jdXNlZCB0byByZWNlaXZlIGtleWRvd24gZXZlbnRzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShpbnN0YW5jZXMpIHtcbiAgdmFyIGluc3RhbmNlc0FycmF5ID0gW10uY29uY2F0KGluc3RhbmNlcyk7XG5cbiAgLy8gaWYgbm8gY29tcG9uZW50cyB3ZXJlIGZvdW5kIGFzIGFuY2VzdG9ycyBvZiB0aGUgZXZlbnQgdGFyZ2V0LFxuICAvLyBlZmZlY3RpdmVseSBkZWFjdGl2YXRlIGtleWRvd24gaGFuZGxpbmcgYnkgY2FwcGluZyB0aGUgc2V0IG9mIGluc3RhbmNlc1xuICAvLyB3aXRoIGBudWxsYC5cbiAgaWYgKCFpbnN0YW5jZXNBcnJheS5sZW5ndGgpIHtcbiAgICBfaW5zdGFuY2VzLmFkZChudWxsKTtcbiAgfSBlbHNlIHtcbiAgICBfaW5zdGFuY2VzLmRlbGV0ZShudWxsKTtcblxuICAgIC8vIGRlbGV0aW5nIGFuZCB0aGVuIGFkZGluZyB0aGUgaW5zdGFuY2UocykgaGFzIHRoZSBlZmZlY3Qgb2Ygc29ydGluZyB0aGUgc2V0XG4gICAgLy8gYWNjb3JkaW5nIHRvIGluc3RhbmNlIGFjdGl2YXRpb24gKGFzY2VuZGluZylcbiAgICBpbnN0YW5jZXNBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgICAgX2luc3RhbmNlcy5kZWxldGUoaW5zdGFuY2UpO1xuICAgICAgX2luc3RhbmNlcy5hZGQoaW5zdGFuY2UpO1xuICAgIH0pO1xuICB9XG59O1xuXG4vKipcbiAqIGRlbGV0ZUluc3RhbmNlXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXQgSW5zdGFudGlhdGVkIGNsYXNzIHRoYXQgZXh0ZW5kZWQgUmVhY3QuQ29tcG9uZW50XG4gKiBAcmV0dXJuIHtib29sZWFufSBUaGUgdmFsdWUgc2V0LmhhcyggdGFyZ2V0ICkgd291bGQgaGF2ZSByZXR1cm5lZCBwcmlvciB0byBkZWxldGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlSW5zdGFuY2UodGFyZ2V0KSB7XG4gIF9pbnN0YW5jZXMuZGVsZXRlKHRhcmdldCk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZmluZEJpbmRpbmdGb3JFdmVudChldmVudCkge1xuICBpZiAoIV9pbnN0YW5jZXMuaGFzKG51bGwpKSB7XG4gICAgdmFyIGtleU1hdGNoZXNFdmVudCA9IGZ1bmN0aW9uIGtleU1hdGNoZXNFdmVudChrZXlTZXQpIHtcbiAgICAgIHJldHVybiBtYXRjaEtleXMoeyBrZXlTZXQ6IGtleVNldCwgZXZlbnQ6IGV2ZW50IH0pO1xuICAgIH07XG5cbiAgICAvLyBsb29wIHRocm91Z2ggaW5zdGFuY2VzIGluIHJldmVyc2UgYWN0aXZhdGlvbiBvcmRlciBzbyB0aGF0IG1vc3RcbiAgICAvLyByZWNlbnRseSBhY3RpdmF0ZWQgaW5zdGFuY2UgZ2V0cyBmaXJzdCBkaWJzIG9uIGV2ZW50XG4gICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KF9pbnN0YW5jZXMpKS5yZXZlcnNlKClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICAgIHZhciBiaW5kaW5ncyA9IGdldEJpbmRpbmcoaW5zdGFuY2UuY29uc3RydWN0b3IucHJvdG90eXBlKTtcbiAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMiA9IGZhbHNlO1xuICAgICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IyID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMiA9IGJpbmRpbmdzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICAgICAgICB2YXIgX3N0ZXAyJHZhbHVlID0gX3NsaWNlZFRvQXJyYXkoX3N0ZXAyLnZhbHVlLCAyKSxcbiAgICAgICAgICAgICAgICBrZXlTZXRzID0gX3N0ZXAyJHZhbHVlWzBdLFxuICAgICAgICAgICAgICAgIGZuID0gX3N0ZXAyJHZhbHVlWzFdO1xuXG4gICAgICAgICAgICBpZiAoa2V5U2V0cy5zb21lKGtleU1hdGNoZXNFdmVudCkpIHtcbiAgICAgICAgICAgICAgLy8gcmV0dXJuIHdoZW4gbWF0Y2hpbmcga2V5YmluZGluZyBpcyBmb3VuZCAtIGkuZS4gb25seSBvbmVcbiAgICAgICAgICAgICAgLy8ga2V5Ym91bmQgY29tcG9uZW50IGNhbiByZXNwb25kIHRvIGEgZ2l2ZW4ga2V5IGNvZGUuIHRvIGdldCBhcm91bmQgdGhpcyxcbiAgICAgICAgICAgICAgLy8gc2NvcGUgYSBjb21tb24gYW5jZXN0b3IgY29tcG9uZW50IGNsYXNzIHdpdGggQGtleWRvd24gYW5kIHVzZVxuICAgICAgICAgICAgICAvLyBAa2V5ZG93blNjb3BlZCB0byBiaW5kIHRoZSBkdXBsaWNhdGUga2V5cyBpbiB5b3VyIGNoaWxkIGNvbXBvbmVudHNcbiAgICAgICAgICAgICAgLy8gKG9yIGp1c3QgaW5zcGVjdCBuZXh0UHJvcHMua2V5ZG93bi5ldmVudCkuXG4gICAgICAgICAgICAgIHJldHVybiB7IGZuOiBmbiwgaW5zdGFuY2U6IGluc3RhbmNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjIgPSB0cnVlO1xuICAgICAgICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgICAgfVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG4vKipcbiAqIGdldEJpbmRpbmdcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCBDbGFzcyB1c2VkIGFzIGtleSBpbiBkaWN0IG9mIGtleSBiaW5kaW5nc1xuICogQHJldHVybiB7b2JqZWN0fSBUaGUgb2JqZWN0IGNvbnRhaW5pbmcgYmluZGluZ3MgZm9yIHRoZSBnaXZlbiBjbGFzc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmluZGluZyhfcmVmKSB7XG4gIHZhciBfX3JlYWN0S2V5ZG93blVVSUQgPSBfcmVmLl9fcmVhY3RLZXlkb3duVVVJRDtcblxuICByZXR1cm4gX2hhbmRsZXJzLmdldChfX3JlYWN0S2V5ZG93blVVSUQpO1xufTtcblxuLyoqXG4gKiBnZXRJbnN0YW5jZXNcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHJldHVybiB7c2V0fSBBbGwgc3RvcmVkIGluc3RhbmNlcyAoYWxsIG1vdW50ZWQgY29tcG9uZW50IGluc3RhbmNlcyB3aXRoIGtleWJpbmRpbmdzKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5zdGFuY2VzKCkge1xuICByZXR1cm4gX2luc3RhbmNlcztcbn07XG5cbi8qKlxuICogaXNFbXB0eVxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFNpemUgb2YgdGhlIHNldCBvZiBhbGwgc3RvcmVkIGluc3RhbmNlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eSgpIHtcbiAgcmV0dXJuICFfaW5zdGFuY2VzLnNpemU7XG59O1xuXG4vKipcbiAqIHNldEJpbmRpbmdcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MgQWxsIGFyZ3VtZW50cyBuZWNlc3NhcnkgdG8gc2V0IHRoZSBiaW5kaW5nXG4gKiBAcGFyYW0ge2FycmF5fSBhcmdzLmtleXMgS2V5IGNvZGVzIHRoYXQgc2hvdWxkIHRyaWdnZXIgdGhlIGZuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBhcmdzLmZuIFRoZSBjYWxsYmFjayB0byBiZSB0cmlnZ2VyZWQgd2hlbiBnaXZlbiBrZXlzIGFyZSBwcmVzc2VkXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncy50YXJnZXQgVGhlIGRlY29yYXRlZCBjbGFzc1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0QmluZGluZyhfcmVmMikge1xuICB2YXIga2V5cyA9IF9yZWYyLmtleXMsXG4gICAgICBmbiA9IF9yZWYyLmZuLFxuICAgICAgdGFyZ2V0ID0gX3JlZjIudGFyZ2V0O1xuXG4gIHZhciBrZXlTZXRzID0gcGFyc2VLZXlzKGtleXMpO1xuXG4gIHZhciBfX3JlYWN0S2V5ZG93blVVSUQgPSB0YXJnZXQuX19yZWFjdEtleWRvd25VVUlEO1xuXG4gIGlmICghX19yZWFjdEtleWRvd25VVUlEKSB7XG4gICAgdGFyZ2V0Ll9fcmVhY3RLZXlkb3duVVVJRCA9IHV1aWQoKTtcbiAgICBfaGFuZGxlcnMuc2V0KHRhcmdldC5fX3JlYWN0S2V5ZG93blVVSUQsIG5ldyBNYXAoW1trZXlTZXRzLCBmbl1dKSk7XG4gIH0gZWxzZSB7XG4gICAgX2hhbmRsZXJzLmdldChfX3JlYWN0S2V5ZG93blVVSUQpLnNldChrZXlTZXRzLCBmbik7XG4gIH1cbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvc3RvcmUuanNcbi8vIG1vZHVsZSBpZCA9IDE0OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBNYWtlIHN1cmUgYGdsb2JhbGAgaXMgZGVmaW5lZCBnbG9iYWxseTpcbi8vXHQtIGVpdGhlciBhcyB0aGUgbm9kZWpzIGBnbG9iYWxgLCBvclxuLy9cdC0gYXMgYW4gYWxpYXMgZm9yIGB3aW5kb3dgIGluIGJyb3dzZXJzLCBvclxuLy9cdC0gZm9yIHRoZSBgc2VsZmAgY29udGV4dCBpbiB3ZWIgd29ya2Vycy5cbi8vXG4vLyBOT1RFOiB0aGlzIG1vZGlmaWVzIHRoZSBcImdsb2JhbFwiIGVudmlyb25tZW50IGJ5IG1ha2luZyBzdXJlIFwiZ2xvYmFsXCIgaXMgc2V0LiFcbi8vXG5cbmxldCBnbG9iYWxfaWRlbnRpZmllcjtcbmlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4vL1x0Y29uc29sZS5sb2coXCJSdW5uaW5nIGluIG5vZGVcIik7XG5cdGdsb2JhbF9pZGVudGlmaWVyID0gZ2xvYmFsO1xufVxuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuLy9cdGNvbnNvbGUubG9nKFwiUnVubmluZyBpbiBhIHdlYiBicm93c2VyXCIpO1xuXHR3aW5kb3cuZ2xvYmFsID0gd2luZG93O1xuXHRnbG9iYWxfaWRlbnRpZmllciA9IHdpbmRvdztcbn1cblxuaWYgKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKSB7XG4vL1x0Y29uc29sZS5sb2coXCJSdW5uaW5nIGluIGEgd2ViIHdvcmtlclwiKTtcblx0c2VsZi5nbG9iYWwgPSBzZWxmO1xuXHRnbG9iYWxfaWRlbnRpZmllciA9IHNlbGY7XG59XG5cbi8vIEV4cG9ydCBmb3IgY29uc3VtcHRpb24gYnkgaW1wb3J0LlxuZXhwb3J0IGRlZmF1bHQgZ2xvYmFsX2lkZW50aWZpZXI7XG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91dGlscy9nbG9iYWwuanMiLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19jb2YuanNcbi8vIG1vZHVsZSBpZCA9IDE3OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBJRSA4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgJ2NvbnN0cnVjdG9yLGhhc093blByb3BlcnR5LGlzUHJvdG90eXBlT2YscHJvcGVydHlJc0VudW1lcmFibGUsdG9Mb2NhbGVTdHJpbmcsdG9TdHJpbmcsdmFsdWVPZidcbikuc3BsaXQoJywnKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2VudW0tYnVnLWtleXMuanNcbi8vIG1vZHVsZSBpZCA9IDE4MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICByZXR1cm4gZFAuZihvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzXG4vLyBtb2R1bGUgaWQgPSAxODFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmYWxzZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2xpYnJhcnkuanNcbi8vIG1vZHVsZSBpZCA9IDE4MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyAxOS4xLjIuMTQgLyAxNS4yLjMuMTQgT2JqZWN0LmtleXMoTylcbnZhciAka2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzLWludGVybmFsJyk7XG52YXIgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuL19lbnVtLWJ1Zy1rZXlzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24ga2V5cyhPKSB7XG4gIHJldHVybiAka2V5cyhPLCBlbnVtQnVnS2V5cyk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWtleXMuanNcbi8vIG1vZHVsZSBpZCA9IDE4M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzLmYgPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1waWUuanNcbi8vIG1vZHVsZSBpZCA9IDE4NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChiaXRtYXAsIHZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZTogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGU6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWU6IHZhbHVlXG4gIH07XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qc1xuLy8gbW9kdWxlIGlkID0gMTg1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIFNSQyA9IHJlcXVpcmUoJy4vX3VpZCcpKCdzcmMnKTtcbnZhciBUT19TVFJJTkcgPSAndG9TdHJpbmcnO1xudmFyICR0b1N0cmluZyA9IEZ1bmN0aW9uW1RPX1NUUklOR107XG52YXIgVFBMID0gKCcnICsgJHRvU3RyaW5nKS5zcGxpdChUT19TVFJJTkcpO1xuXG5yZXF1aXJlKCcuL19jb3JlJykuaW5zcGVjdFNvdXJjZSA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gJHRvU3RyaW5nLmNhbGwoaXQpO1xufTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE8sIGtleSwgdmFsLCBzYWZlKSB7XG4gIHZhciBpc0Z1bmN0aW9uID0gdHlwZW9mIHZhbCA9PSAnZnVuY3Rpb24nO1xuICBpZiAoaXNGdW5jdGlvbikgaGFzKHZhbCwgJ25hbWUnKSB8fCBoaWRlKHZhbCwgJ25hbWUnLCBrZXkpO1xuICBpZiAoT1trZXldID09PSB2YWwpIHJldHVybjtcbiAgaWYgKGlzRnVuY3Rpb24pIGhhcyh2YWwsIFNSQykgfHwgaGlkZSh2YWwsIFNSQywgT1trZXldID8gJycgKyBPW2tleV0gOiBUUEwuam9pbihTdHJpbmcoa2V5KSkpO1xuICBpZiAoTyA9PT0gZ2xvYmFsKSB7XG4gICAgT1trZXldID0gdmFsO1xuICB9IGVsc2UgaWYgKCFzYWZlKSB7XG4gICAgZGVsZXRlIE9ba2V5XTtcbiAgICBoaWRlKE8sIGtleSwgdmFsKTtcbiAgfSBlbHNlIGlmIChPW2tleV0pIHtcbiAgICBPW2tleV0gPSB2YWw7XG4gIH0gZWxzZSB7XG4gICAgaGlkZShPLCBrZXksIHZhbCk7XG4gIH1cbi8vIGFkZCBmYWtlIEZ1bmN0aW9uI3RvU3RyaW5nIGZvciBjb3JyZWN0IHdvcmsgd3JhcHBlZCBtZXRob2RzIC8gY29uc3RydWN0b3JzIHdpdGggbWV0aG9kcyBsaWtlIExvRGFzaCBpc05hdGl2ZVxufSkoRnVuY3Rpb24ucHJvdG90eXBlLCBUT19TVFJJTkcsIGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gdHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyAmJiB0aGlzW1NSQ10gfHwgJHRvU3RyaW5nLmNhbGwodGhpcyk7XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3JlZGVmaW5lLmpzXG4vLyBtb2R1bGUgaWQgPSAxODZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXyc7XG52YXIgc3RvcmUgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5cbihtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0gdmFsdWUgIT09IHVuZGVmaW5lZCA/IHZhbHVlIDoge30pO1xufSkoJ3ZlcnNpb25zJywgW10pLnB1c2goe1xuICB2ZXJzaW9uOiBjb3JlLnZlcnNpb24sXG4gIG1vZGU6IHJlcXVpcmUoJy4vX2xpYnJhcnknKSA/ICdwdXJlJyA6ICdnbG9iYWwnLFxuICBjb3B5cmlnaHQ6ICfCqSAyMDE4IERlbmlzIFB1c2hrYXJldiAoemxvaXJvY2sucnUpJ1xufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19zaGFyZWQuanNcbi8vIG1vZHVsZSBpZCA9IDE4N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyA3LjEuMSBUb1ByaW1pdGl2ZShpbnB1dCBbLCBQcmVmZXJyZWRUeXBlXSlcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xuLy8gaW5zdGVhZCBvZiB0aGUgRVM2IHNwZWMgdmVyc2lvbiwgd2UgZGlkbid0IGltcGxlbWVudCBAQHRvUHJpbWl0aXZlIGNhc2Vcbi8vIGFuZCB0aGUgc2Vjb25kIGFyZ3VtZW50IC0gZmxhZyAtIHByZWZlcnJlZCB0eXBlIGlzIGEgc3RyaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgUykge1xuICBpZiAoIWlzT2JqZWN0KGl0KSkgcmV0dXJuIGl0O1xuICB2YXIgZm4sIHZhbDtcbiAgaWYgKFMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIGlmICh0eXBlb2YgKGZuID0gaXQudmFsdWVPZikgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICBpZiAoIVMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNvbnZlcnQgb2JqZWN0IHRvIHByaW1pdGl2ZSB2YWx1ZVwiKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL190by1wcmltaXRpdmUuanNcbi8vIG1vZHVsZSBpZCA9IDE4OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBkb2N1bWVudCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50O1xuLy8gdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCcgaW4gb2xkIElFXG52YXIgaXMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2RvbS1jcmVhdGUuanNcbi8vIG1vZHVsZSBpZCA9IDI3OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpICYmICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2RpdicpLCAnYScsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiA3OyB9IH0pLmEgIT0gNztcbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faWU4LWRvbS1kZWZpbmUuanNcbi8vIG1vZHVsZSBpZCA9IDI4MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyAxOS4xLjIuNyAvIDE1LjIuMy40IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXG52YXIgJGtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cy1pbnRlcm5hbCcpO1xudmFyIGhpZGRlbktleXMgPSByZXF1aXJlKCcuL19lbnVtLWJ1Zy1rZXlzJykuY29uY2F0KCdsZW5ndGgnLCAncHJvdG90eXBlJyk7XG5cbmV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoTykge1xuICByZXR1cm4gJGtleXMoTywgaGlkZGVuS2V5cyk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcG4uanNcbi8vIG1vZHVsZSBpZCA9IDI4MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcHMuanNcbi8vIG1vZHVsZSBpZCA9IDI4MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIGFycmF5SW5kZXhPZiA9IHJlcXVpcmUoJy4vX2FycmF5LWluY2x1ZGVzJykoZmFsc2UpO1xudmFyIElFX1BST1RPID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWVzKSB7XG4gIHZhciBPID0gdG9JT2JqZWN0KG9iamVjdCk7XG4gIHZhciBpID0gMDtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIga2V5O1xuICBmb3IgKGtleSBpbiBPKSBpZiAoa2V5ICE9IElFX1BST1RPKSBoYXMoTywga2V5KSAmJiByZXN1bHQucHVzaChrZXkpO1xuICAvLyBEb24ndCBlbnVtIGJ1ZyAmIGhpZGRlbiBrZXlzXG4gIHdoaWxlIChuYW1lcy5sZW5ndGggPiBpKSBpZiAoaGFzKE8sIGtleSA9IG5hbWVzW2krK10pKSB7XG4gICAgfmFycmF5SW5kZXhPZihyZXN1bHQsIGtleSkgfHwgcmVzdWx0LnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1rZXlzLWludGVybmFsLmpzXG4vLyBtb2R1bGUgaWQgPSAyODNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpKCdrZXlzJyk7XG52YXIgdWlkID0gcmVxdWlyZSgnLi9fdWlkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIHNoYXJlZFtrZXldIHx8IChzaGFyZWRba2V5XSA9IHVpZChrZXkpKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19zaGFyZWQta2V5LmpzXG4vLyBtb2R1bGUgaWQgPSAyODRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gNy4xLjQgVG9JbnRlZ2VyXG52YXIgY2VpbCA9IE1hdGguY2VpbDtcbnZhciBmbG9vciA9IE1hdGguZmxvb3I7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL190by1pbnRlZ2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAyODVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fd2tzJyk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL193a3MtZXh0LmpzXG4vLyBtb2R1bGUgaWQgPSAyODZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbi8vIGNzcyBiYXNlIGNvZGUsIGluamVjdGVkIGJ5IHRoZSBjc3MtbG9hZGVyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVzZVNvdXJjZU1hcCkge1xuXHR2YXIgbGlzdCA9IFtdO1xuXG5cdC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblx0bGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0dmFyIGNvbnRlbnQgPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0sIHVzZVNvdXJjZU1hcCk7XG5cdFx0XHRpZihpdGVtWzJdKSB7XG5cdFx0XHRcdHJldHVybiBcIkBtZWRpYSBcIiArIGl0ZW1bMl0gKyBcIntcIiArIGNvbnRlbnQgKyBcIn1cIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBjb250ZW50O1xuXHRcdFx0fVxuXHRcdH0pLmpvaW4oXCJcIik7XG5cdH07XG5cblx0Ly8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3Rcblx0bGlzdC5pID0gZnVuY3Rpb24obW9kdWxlcywgbWVkaWFRdWVyeSkge1xuXHRcdGlmKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKVxuXHRcdFx0bW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgXCJcIl1dO1xuXHRcdHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpZCA9IHRoaXNbaV1bMF07XG5cdFx0XHRpZih0eXBlb2YgaWQgPT09IFwibnVtYmVyXCIpXG5cdFx0XHRcdGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcblx0XHR9XG5cdFx0Zm9yKGkgPSAwOyBpIDwgbW9kdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGl0ZW0gPSBtb2R1bGVzW2ldO1xuXHRcdFx0Ly8gc2tpcCBhbHJlYWR5IGltcG9ydGVkIG1vZHVsZVxuXHRcdFx0Ly8gdGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBub3QgMTAwJSBwZXJmZWN0IGZvciB3ZWlyZCBtZWRpYSBxdWVyeSBjb21iaW5hdGlvbnNcblx0XHRcdC8vICB3aGVuIGEgbW9kdWxlIGlzIGltcG9ydGVkIG11bHRpcGxlIHRpbWVzIHdpdGggZGlmZmVyZW50IG1lZGlhIHF1ZXJpZXMuXG5cdFx0XHQvLyAgSSBob3BlIHRoaXMgd2lsbCBuZXZlciBvY2N1ciAoSGV5IHRoaXMgd2F5IHdlIGhhdmUgc21hbGxlciBidW5kbGVzKVxuXHRcdFx0aWYodHlwZW9mIGl0ZW1bMF0gIT09IFwibnVtYmVyXCIgfHwgIWFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcblx0XHRcdFx0aWYobWVkaWFRdWVyeSAmJiAhaXRlbVsyXSkge1xuXHRcdFx0XHRcdGl0ZW1bMl0gPSBtZWRpYVF1ZXJ5O1xuXHRcdFx0XHR9IGVsc2UgaWYobWVkaWFRdWVyeSkge1xuXHRcdFx0XHRcdGl0ZW1bMl0gPSBcIihcIiArIGl0ZW1bMl0gKyBcIikgYW5kIChcIiArIG1lZGlhUXVlcnkgKyBcIilcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRsaXN0LnB1c2goaXRlbSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHRyZXR1cm4gbGlzdDtcbn07XG5cbmZ1bmN0aW9uIGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKSB7XG5cdHZhciBjb250ZW50ID0gaXRlbVsxXSB8fCAnJztcblx0dmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXHRpZiAoIWNzc01hcHBpbmcpIHtcblx0XHRyZXR1cm4gY29udGVudDtcblx0fVxuXG5cdGlmICh1c2VTb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcblx0XHR2YXIgc291cmNlTWFwcGluZyA9IHRvQ29tbWVudChjc3NNYXBwaW5nKTtcblx0XHR2YXIgc291cmNlVVJMcyA9IGNzc01hcHBpbmcuc291cmNlcy5tYXAoZnVuY3Rpb24gKHNvdXJjZSkge1xuXHRcdFx0cmV0dXJuICcvKiMgc291cmNlVVJMPScgKyBjc3NNYXBwaW5nLnNvdXJjZVJvb3QgKyBzb3VyY2UgKyAnICovJ1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbignXFxuJyk7XG5cdH1cblxuXHRyZXR1cm4gW2NvbnRlbnRdLmpvaW4oJ1xcbicpO1xufVxuXG4vLyBBZGFwdGVkIGZyb20gY29udmVydC1zb3VyY2UtbWFwIChNSVQpXG5mdW5jdGlvbiB0b0NvbW1lbnQoc291cmNlTWFwKSB7XG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuXHR2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKTtcblx0dmFyIGRhdGEgPSAnc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsJyArIGJhc2U2NDtcblxuXHRyZXR1cm4gJy8qIyAnICsgZGF0YSArICcgKi8nO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXG4vLyBtb2R1bGUgaWQgPSAyODdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gU3BlbGwgXCJwYXJzZXJcIiBjbGFzcy5cbi8vXG5cbi8vIFRPRE86IGRlcGVuZGVuY3ktaW5qZWN0IHRva2VuaXplcj9cbmltcG9ydCBUb2tlbml6ZXIgZnJvbSBcIi4vVG9rZW5pemVyLmpzXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi9SdWxlLmpzXCI7XG5pbXBvcnQgcGFyc2VSdWxlIGZyb20gXCIuL1J1bGVTeW50YXguanNcIjtcbmltcG9ydCB7IGNsb25lQ2xhc3MgfSBmcm9tIFwiLi91dGlscy9jbGFzcy5qc1wiO1xuXG4vLyBHUlJSLi4uIHdpbGwgU09NRU9ORSBvbiB0aGUgbm9kZSB0ZWFtIHBsZWFzZSBpbXBsZW1lbnQgY29uc29sZS5ncm91cCA/Pz9cbmlmICghY29uc29sZS5ncm91cCkgY29uc29sZS5ncm91cCA9IGNvbnNvbGUubG9nO1xuaWYgKCFjb25zb2xlLmdyb3VwRW5kKSBjb25zb2xlLmdyb3VwRW5kID0gY29uc29sZS5sb2c7XG5cbi8vIEVycm9yIHdlJ2xsIHRocm93IGZvciBwcm9ibGVtcyB3aGVuIHBhcnNpbmcuXG4vLyBVc2VzIGEgc3BlY2lmaWMgdHlwZSBzbyB3ZSBjYW4gY2hlY2sgZm9yIGl0IGluIHRlc3RzLlxuZXhwb3J0IGZ1bmN0aW9uIFBhcnNlRXJyb3IoLi4uYXJncykge1xuICBFcnJvci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBQYXJzZUVycm9yKTtcbn1cblBhcnNlRXJyb3IucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlciB7XG5cdC8vIFNldCB0byBgdHJ1ZWAgdG8gb3V0cHV0IGRlYnVnIGluZm8gd2hpbGUgYWRkaW5nIHJ1bGVzXG5cdHN0YXRpYyBERUJVRyA9IGZhbHNlO1xuXG5cdC8vIFNob3VsZCB3ZSB3YXJuIGFib3V0IGFub21hbG91cyBjb25kaXRpb25zP1xuXHRzdGF0aWMgV0FSTiA9IGZhbHNlO1xuXG5cdC8vIFNldCB0byBgdHJ1ZWAgdG8gb3V0cHV0IHRpbWluZyBpbmZvLlxuXHRzdGF0aWMgVElNRSA9IGZhbHNlO1xuXG4gIC8vIEFkZCB0byBQYXJzZXIgY29uc29sZSBkZWJ1Z2dpbmdcbiAgc3RhdGljIFBhcnNlRXJyb3IgPSBQYXJzZUVycm9yO1xuXG5cdC8vIENvbnN0cnVjdG9yLlxuXHRjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzKSB7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBwcm9wZXJ0aWVzKTtcblx0fVxuXG4vL1xuLy8jIyMgUGFyc2luZ1xuLy9cblx0Ly8gUGFyc2UgYHJ1bGVOYW1lYCBydWxlIGF0IGhlYWQgb2YgYHRleHRgLlxuXHQvLyBJZiB5b3UgcGFzcyBvbmx5IG9uZSBhcmd1bWVudCwgd2UnbGwgYXNzdW1lIHRoYXQncyBgdGV4dGAgYW5kIHlvdSB3YW50IHRvIG1hdGNoIGBzdGF0ZW1lbnRzYC5cblx0Ly8gSGFuZGxlcyBvcHRpb25hbCBhbmQgcmVwZWF0aW5nIHJ1bGVzIGFzIHdlbGwgYXMgZWF0aW5nIHdoaXRlc3BhY2UuXG5cdC8vIFJldHVybnMgcmVzdWx0IG9mIHBhcnNlLlxuLy9URVNUTUVcblx0cGFyc2UocnVsZU5hbWUsIHRleHQpIHtcblx0XHQvLyBJZiBvbmx5IG9uZSBhcmd1bWVudCwgYXNzdW1lIHRoYXQncyB0aGUgdGV4dCBhbmQgcGFyc2UgYHN0YXRlbWVudHNgXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHRleHQgPSBydWxlTmFtZTtcblx0XHRcdHJ1bGVOYW1lID0gXCJzdGF0ZW1lbnRzXCI7XG5cdFx0fVxuXG5cdFx0Ly8gQ29udmVydCB0byB0b2tlbnMuXG5cdFx0aWYgKFBhcnNlci5USU1FKSBjb25zb2xlLnRpbWUoXCJ0b2tlbml6ZVwiKTtcblx0XHRsZXQgdG9rZW5zID0gVG9rZW5pemVyLnRva2VuaXplKHRleHQpO1xuXHRcdC8vIGVhdCBub24taW5kZW50IHdoaXRlc3BhY2UgKHNpbmNlIHdlIGlnbm9yZSBpdClcblx0XHR0b2tlbnMgPSB0b2tlbnMuZmlsdGVyKHRva2VuID0+ICFUb2tlbml6ZXIuaXNOb3JtYWxXaGl0ZXNwYWNlKHRva2VuKSk7XG5cdFx0aWYgKFBhcnNlci5USU1FKSBjb25zb2xlLnRpbWVFbmQoXCJ0b2tlbml6ZVwiKTtcblxuXHRcdC8vIEJhaWwgaWYgd2UgZGlkbid0IGdldCBhbnkgdG9rZW5zIGJhY2suXG5cdFx0aWYgKCF0b2tlbnMgfHwgdG9rZW5zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGlmIChQYXJzZXIuVElNRSkgY29uc29sZS50aW1lKFwicGFyc2VcIik7XG5cdFx0Ly8gSWYgd2UncmUgbm90IHBhcnNpbmcgYHN0YXRlbWVudHNgLCBlYXQgd2hpdGVzcGFjZSBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lLlxuXHRcdGlmIChydWxlTmFtZSAhPT0gXCJzdGF0ZW1lbnRzXCIpIHtcblx0XHRcdHRva2VucyA9IFRva2VuaXplci5yZW1vdmVMZWFkaW5nV2hpdGVzcGFjZSh0b2tlbnMpO1xuXHRcdH1cblxuXHRcdC8vIFBhcnNlIHRoZSBydWxlIG9yIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBydWxlIG5vdCBmb3VuZC5cblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5wYXJzZU5hbWVkUnVsZShydWxlTmFtZSwgdG9rZW5zLCAwLCB0b2tlbnMubGVuZ3RoLCB1bmRlZmluZWQsIFwicGFyc2VyLnBhcnNlKClcIik7XG5cdFx0aWYgKFBhcnNlci5USU1FKSBjb25zb2xlLnRpbWVFbmQoXCJwYXJzZVwiKTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblxuXG5cdC8vIFBhcnNlIGB0ZXh0YCBhbmQgcmV0dXJuIHRoZSByZXN1bHRpbmcgc291cmNlIGNvZGUuXG5cdC8vXHQtIGlmIG9uZSBzdHJpbmcgYXJndW1lbnQsIGNvbXBpbGVzIGFzIFwic3RhdGVtZW50c1wiXG5cdC8vIFRocm93cyBpZiBub3QgcGFyc2VhYmxlLlxuLy9URVNUTUVcblx0Y29tcGlsZShydWxlTmFtZSwgdGV4dCkge1xuXHRcdC8vIElmIG9ubHkgb25lIGFyZ3VtZW50LCBhc3N1bWUgdGhhdCdzIHRoZSB0ZXh0IGFuZCBwYXJzZSBgc3RhdGVtZW50c2Bcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0dGV4dCA9IHJ1bGVOYW1lO1xuXHRcdFx0cnVsZU5hbWUgPSBcInN0YXRlbWVudHNcIjtcblx0XHR9XG5cdFx0bGV0IHJlc3VsdCA9IHRoaXMucGFyc2UocnVsZU5hbWUsIHRleHQpO1xuXHRcdGlmICghcmVzdWx0KSB7XG5cdFx0ICB0aHJvdyBuZXcgUGFyc2VFcnJvcihgcGFyc2VyLnBhcnNlKCcke3J1bGVOYW1lfScsICcke3RleHR9Jyk6IGNhbid0IHBhcnNlIHRleHRgKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdC50b1NvdXJjZSh0aGlzKTtcblx0fVxuXG5cblx0Ly8gUGFyc2UgYSBuYW1lZCBydWxlIChkZWZpbmVkIGluIHRoaXMgcGFyc2VyIG9yIGluIGFueSBvZiBvdXIgYGltcG9ydHNgKSwgcmV0dXJuaW5nIHRoZSBcImJlc3RcIiBtYXRjaC5cblx0Ly8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBubyBtYXRjaC5cblx0Ly8gVGhyb3dzIGlmIHJ1bGUgaXMgbm90IGltcGxlbWVudGVkLlxuXHRwYXJzZU5hbWVkUnVsZShydWxlTmFtZSwgdG9rZW5zLCBzdGFydCwgZW5kLCBzdGFjaywgY2FsbGluZ0NvbnRleHQgPSBcInBhcnNlTmFtZWRSdWxlXCIpIHtcbiAgICBjb25zdCBydWxlID0gdGhpcy5ydWxlc1tydWxlTmFtZV07XG5cdFx0aWYgKCFydWxlKSB0aHJvdyBuZXcgUGFyc2VFcnJvcihgJHtjYWxsaW5nQ29udGV4dH06IHJ1bGUgJyR7cnVsZU5hbWV9JyBub3QgZm91bmRgKTtcbiAgICByZXR1cm4gcnVsZS5wYXJzZSh0aGlzLCB0b2tlbnMsIHN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0fVxuXG5cdC8vIFRlc3Qgd2hldGhlciBhIHJ1bGUgKHdoaWNoIG1heSBiZSBzcGVjaWZpZWQgYnkgbmFtZSkgTUlHSFQgYmUgZm91bmQgaW4gaGVhZCBvZiBzdHJlYW0uXG5cdC8vIFJldHVybnM6XG5cdC8vXHQtIGB0cnVlYCBpZiB0aGUgcnVsZSBNSUdIVCBiZSBtYXRjaGVkLlxuXHQvL1x0LSBgZmFsc2VgIGlmIHRoZXJlIGlzIE5PIFdBWSB0aGUgcnVsZSBjYW4gYmUgbWF0Y2hlZC5cblx0Ly9cdC0gYHVuZGVmaW5lZGAgaWYgbm90IGRldGVybWluc3RpYyAoZWc6IG5vIHdheSB0byB0ZWxsIHF1aWNrbHkpLlxuXHR0ZXN0KHJ1bGUsIHRva2Vucywgc3RhcnQsIGVuZCkge1xuXHQgIGlmICh0eXBlb2YgcnVsZSA9PT0gXCJzdHJpbmdcIikge1xuXHQgICAgcnVsZSA9IHRoaXMucnVsZXNbcnVsZV07XG5cdCAgICBpZiAoIXJ1bGUpIHJldHVybiB1bmRlZmluZWQ7ICAgIC8vIFRPRE86IHRocm93P1xuXHQgIH1cblx0ICByZXR1cm4gcnVsZS50ZXN0KHRoaXMsIHRva2Vucywgc3RhcnQsIGVuZCk7XG5cdH1cblxuXG4vL1xuLy8gIyMjIFx0SW1wb3J0c1xuLy9cdFx0UGFyc2VycyBjYW4gZGVwZW5kIG9uIG90aGVyIHBhcnNlcnMgZm9yIGFkZGl0aW9uYWwgYHJ1bGVzYC5cbi8vXHRcdEltcG9ydHMgYXJlIGxhenktYm91bmQgaW50byBgcGFyc2VyLnJ1bGVzYCBhcyBuZWNlc3NhcnkuXG4vLyAgICBXZSBhc3N1bWUgdGhlIHRvcC1sZXZlbCBwYXJzZXIgZm9yIGEgbGFuZ3VhZ2Ugd2lsbCBpbmNsdWRlIGFsbCBuZWNlc3NhcnkgaW1wb3J0cyBhdXRvbWF0aWNhbGx5LlxuLy9cblxuXHQvLyBBZGQgb25lIG9yIG1vcmUgbmFtZWQgaW1wb3J0cyB0byB0aGlzIHBhcnNlci5cblx0Ly8gSW1wb3J0cyBpbmNyZWFzZSBpbiBwcmlvcml0eSB0aGUgbGF0ZXIgdGhleSBhcmUgaW4gdGhlIGxpc3QuXG4gIGltcG9ydHMgPSBbXTtcblx0aW1wb3J0KC4uLmltcG9ydHMpIHtcblx0XHQvLyBSRVZFUlNFIHRoZSBsaXN0IG9mIGltcG9ydHMsIHNvIHRoZSBtb3N0IGdlbmVyYWwgb25lIGlzIExBU1Rcblx0XHQvLyBUaHVzIG1vcmUgc3BlY2lmaWMgaW1wb3J0cyB3aWxsIGJlIEVBUkxJRVIgaW4gdGhlIGBpbXBvcnRzYCBsaXN0LlxuXG5cdFx0Ly8gQ3JlYXRlIG5ldyBhcnJheSBvZiBpbXBvcnRzIGFuZCBhZGQgaW1wb3J0IG5hbWVzIHBhc3NlZCBpbi5cblx0XHR0aGlzLmltcG9ydHMgPSBpbXBvcnRzLnJldmVyc2UoKS5jb25jYXQodGhpcy5pbXBvcnRzKTtcblxuXHRcdC8vIGNsZWFyIGNvbmNhdGVuYXRlZCBsaXN0IG9mIHJ1bGVzIHNvIHdlJ2xsIHJlY2FjdWxhdGUgaW4gYHBhcnNlci5ydWxlc2Bcblx0XHRkZWxldGUgdGhpcy5fX3J1bGVzO1xuXHR9XG5cbi8vXG4vLyAjIyMgUnVsZXNcbi8vICAgIExpc3Qgb2YgYWxsIGtub3duIHJ1bGVzIGZvciB0aGlzIHBhcnNlci5cbi8vICAgIFlvdSBjYW4gYWNjZXNzIG5hbWVkIHJ1bGVzIGFzIGBwYXJzZXIucnVsZXNbXCJydWxlTmFtZVwiXWBcbi8vXG5cdC8vIFN0YXJ0IHdpdGggYW4gZW1wdHkgbWFwIG9mIHJ1bGVzLlxuXHRfcnVsZXMgPSB7fTtcblxuXHQvLyBSZXR1cm4gbWFwIG9mIGFsbCBrbm93biBydWxlcyBieSBydWxlIG5hbWUsIGluY2x1ZGluZyBydWxlcyBkZWZpbmVkIGluIG91ciBpbXBvcnRzLlxuXHQvLyBOT1RFOiBXZSBtZW1vaXplIHRoaXMsIHNvIG1ha2Ugc3VyZSB0byBjbGVhciBgX19ydWxlc2AgaWYgeW91J3JlIG1hbmlwdWxhdGluZyBydWxlcyBvciBpbXBvcnRzIVxuXHRnZXQgcnVsZXMoKSB7XG5cdFx0aWYgKCF0aGlzLl9fcnVsZXMpIHtcblx0XHRcdGNvbnN0IG91dHB1dCA9IHRoaXMuX19ydWxlcyA9IHt9O1xuXHRcdFx0Ly8gR2V0IGFsbCBpbXBvcnRlZCBwYXJzZXJzLCB3aXRoIHVzIGxhc3Rcblx0XHRcdGNvbnN0IGltcG9ydHMgPSBbdGhpc10uY29uY2F0KHRoaXMuaW1wb3J0cy5tYXAoUGFyc2VyLmZvck1vZHVsZSkpO1xuXG5cdFx0XHQvLyBGb3IgZWFjaCBwYXJzZXJcblx0XHRcdGltcG9ydHMuZm9yRWFjaChwYXJzZXIgPT4ge1xuXHRcdFx0XHRmb3IgKGNvbnN0IHJ1bGVOYW1lIGluIHBhcnNlci5fcnVsZXMpIHtcblx0XHRcdFx0ICB0aGlzLl9tZXJnZVJ1bGUob3V0cHV0LCBydWxlTmFtZSwgcGFyc2VyLl9ydWxlc1tydWxlTmFtZV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX19ydWxlcztcblx0fVxuXG4gIC8vIE1lcmdlIGBydWxlYCBpbnRvIGBtYXBgIG9mIHJ1bGVzIGJ5IGBydWxlTmFtZWAuXG4gIC8vIElmIHdlIGFscmVhZHkgaGF2ZSBhIHJ1bGUgd2l0aCB0aGF0IG5hbWUsIHdlJ2xsIGFkZCBpdCBhcyBhbiBhbHRlcm5hdGl2ZS5cbi8vVEVTVE1FXG4gIF9tZXJnZVJ1bGUobWFwLCBydWxlTmFtZSwgcnVsZSkge1xuICAgIGxldCBleGlzdGluZyA9IG1hcFtydWxlTmFtZV07XG4gICAgaWYgKCFleGlzdGluZykge1xuICAgICAgbWFwW3J1bGVOYW1lXSA9IHJ1bGU7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCEoZXhpc3RpbmcgaW5zdGFuY2VvZiBSdWxlLkFsdGVybmF0aXZlcykgfHwgKGV4aXN0aW5nLmdyb3VwICE9PSBydWxlTmFtZSkpIHtcbiAgICAgIGNvbnN0IGFsdENvbnN0cnVjdG9yID0gY2xvbmVDbGFzcyhSdWxlLkFsdGVybmF0aXZlcywgcnVsZU5hbWUpO1xuICAgICAgZXhpc3RpbmcgPSBtYXBbcnVsZU5hbWVdID0gbmV3IGFsdENvbnN0cnVjdG9yKHtcbiAgICAgICAgZ3JvdXA6IHJ1bGVOYW1lLFxuICAgICAgICBydWxlczogWyBleGlzdGluZyBdXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAocnVsZSBpbnN0YW5jZW9mIFJ1bGUuQWx0ZXJuYXRpdmVzICYmIChydWxlLmdyb3VwID09PSBydWxlTmFtZSkpIHtcbiAgICAgIGV4aXN0aW5nLmFkZFJ1bGUoLi4ucnVsZS5ydWxlcyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZXhpc3RpbmcuYWRkUnVsZShydWxlKTtcbiAgICB9XG4gIH1cblxuXHQvLyBBZGQgYSBgcnVsZWAgdG8gb3VyIGxpc3Qgb2YgcnVsZXMhXG5cdC8vIENvbnZlcnRzIHRvIGBhbHRlcm5hdGl2ZXNgIG9uIHJlLWRlZmluaW5nIHRoZSBzYW1lIHJ1bGUuXG5cdGFkZFJ1bGUocnVsZU5hbWUsIHJ1bGUpIHtcblx0XHQvLyBDbGVhciBtZW1vaXplZCBgX19ydWxlc2Agc28gd2UnbGwgcmVjYWxjdWxhdGUgYHBhcnNlci5ydWxlc2AgYXMgbmVjZXNzYXJ5XG5cdFx0ZGVsZXRlIHRoaXMuX19ydWxlcztcblxuXHRcdC8vIElmIHBhc3NlZCBhIGZ1bmN0aW9uLCBjcmVhdGUgYW4gaW5zdGFuY2UgZm9yIHRoZSBhY3R1YWwgcnVsZS5cblx0XHQvLyBUaGlzIGlzIGNvbW1vbmx5IGRvbmUgc28gSlMgd2lsbCBnaXZlIHVzIG1lYW5pbmdmdWwgY2xhc3MgbmFtZXMgaW4gZGVidWcgb3V0cHV0LlxuXHRcdGlmICh0eXBlb2YgcnVsZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRydWxlID0gbmV3IHJ1bGUoKTtcblx0XHR9XG5cblx0XHQvLyBJZiB3ZSBnb3QgYW4gYXJyYXkgb2YgYHJ1bGVOYW1lYHMsIHJlY3Vyc2l2ZWx5IGFkZCB1bmRlciBlYWNoIG5hbWUgd2l0aCB0aGUgc2FtZSBgcnVsZWAuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkocnVsZU5hbWUpKSB7XG5cdFx0XHRydWxlTmFtZS5mb3JFYWNoKHJ1bGVOYW1lID0+IHRoaXMuYWRkUnVsZShydWxlTmFtZSwgcnVsZSkgKTtcblx0XHRcdHJldHVybiBydWxlO1xuXHRcdH1cblxuXHRcdC8vIEFkZCB0byBvdXIgbGlzdCBvZiBfcnVsZXNcblx0XHR0aGlzLl9tZXJnZVJ1bGUodGhpcy5fcnVsZXMsIHJ1bGVOYW1lLCBydWxlKTtcblx0XHRyZXR1cm4gcnVsZTtcblx0fVxuXG5cdC8vIFJldHVybiB0aGUgY29uY2F0ZW5hdGVkIGJsYWNrbGlzdCBmb3IgYSBnaXZlbiBuYW1lZCBydWxlLlxuXHRnZXRCbGFja2xpc3QocnVsZU5hbWUpIHtcblx0ICBjb25zdCBydWxlID0gdGhpcy5ydWxlc1tydWxlTmFtZV07XG5cdCAgY29uc3QgcnVsZXMgPSBydWxlIGluc3RhbmNlb2YgUnVsZS5BbHRlcm5hdGl2ZXNcbiAgICAgICAgICA/IHJ1bGUucnVsZXNcbiAgICAgICAgICA6IFsgcnVsZSBdO1xuXHRcdHJldHVybiBydWxlcy5yZWR1Y2UoZnVuY3Rpb24gKGJsYWNrbGlzdCwgcnVsZSkge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oYmxhY2tsaXN0LCBydWxlLmJsYWNrbGlzdCk7XG5cdFx0fSwge30pO1xuXHR9XG5cbiAgLy8gRGVmaW5lIG11bHRpcGxlIHJ1bGVzIGF0IG9uY2UgdXNpbmcgcnVsZVN5bnRheC5cbiAgLy8gU2VlIGBSdWxlU3ludGF4LmpzOjpkZWZpbmVSdWxlKClgXG4gIGRlZmluZVJ1bGVzKCkge1xuICAgIGZvciAoY29uc3QgcnVsZSBvZiBhcmd1bWVudHMpIHtcbiAgICAgIHRoaXMuZGVmaW5lUnVsZShydWxlKTtcbiAgICB9XG4gIH1cblxuICAvLyBEZWZpbmUgYSBydWxlIHVzaW5nIChydWxlKWBzeW50YXhgIG9yIGBwYXR0ZXJuc2AgdG8gY3JlYXRlIHRoZSBydWxlIGluc3RhbmNlcy5cbiAgLy8gIGBuYW1lYCAoaWRlbnRpZmllciwgcmVxdWlyZWQpICBCYXNlIG5hbWUgb2YgdGhlIHJ1bGUuXG4gIC8vICBgYWxpYXNgIChzdHJpbmcgb3IgW3N0cmluZ10sIG9wdGluYWwpIE90aGVyIG5hbWVzIHRvIGRlZmluZSBydWxlIHVuZGVyLlxuICAvLyAgYGNhbm9uaWNhbGAgKHN0cmluZywgb3B0aW9uYWwpIENhbm9uaWNhbCBuYW1lIGZvciB0aGUgcnVsZSwgYXZhaWxhYmxlIG9uIGBSdWxlYCBmb3IgZGVidWdnaW5nLlxuICAvLyAgYGNvbnN0cnVjdG9yYCAoY2xhc3MsIHJlcXVpcmVkKSBDbGFzcyB3aGljaCB3aWxsIGJlIHVzZWQgdG8gaW5zdGFudGlhdGUgdGhlIHJ1bGUuXG4gIC8vICBgc3ludGF4YCAoc3RyaW5nLCByZXF1aXJlZCkgUnVsZVN5bnRheCBzdHJpbmcgZm9yIHRoaXMgcnVsZS5cbiAgLy8gIGBwYXR0ZXJuYCAoUmVnRXhwLCBvcHRpb25hbCkgUmVndWxhciBleHByZXNzaW9uIGZvciBgUGF0dGVybmAgcnVsZXNcbiAgLy8gIGBwcmVjZWRlbmNlYCAobnVtYmVyLCBvcHRpb25hbCkgUHJlY2VkZW5jZSBudW1iZXIgZm9yIHRoZSBydWxlIChjdXJyZW50bHkgZG9lc24ndCBkbyBhbnl0aGluZylcbiAgLy8gIGBibGFja2xpc3RgIChbc3RyaW5nXSwgb3B0aW9uYWwpIEFycmF5IG9mIHN0cmluZ3MgYXMgYmxhY2tsaXN0IGZvciBwYXR0ZXJuIHJ1bGVzLlxuICAvLyAgYGxlZnRSZWN1cnNpdmUnIChib29sZWFuLCBvcHRpb25hbCkgU2V0IHRvIGB0cnVlYCBpZiB0aGUgcnVsZSBpcyBsZWZ0LXJlY3Vyc2l2ZSxcbiAgLy8gICAgaS5lLiBpdCBjYWxscyBpdHNlbGYgYXMgYSBzdWJydWxlIGJlZm9yZSBtYXRjaGluZyBhbnkgbGl0ZXJhbCB0b2tlbnNcbiAgLy8gIGB0ZXN0UnVsZWAgKFJ1bGUgb3Igc3RyaW5nLCBvcHRpb25hbCkgUnVsZSBvciBydWxlIG5hbWUgdG8gdXNlIGFzIGEgdGVzdCBydWxlXG4gIC8vICAgIHNwZWNpZnlpbmcgdGhpcyBjYW4gbGV0IHVzIGp1bXAgb3V0IHF1aWNrbHkgaWYgdGhlcmUgaXMgbm8gcG9zc2libGUgbWF0Y2hcbiAgLy9cbiAgLy8gTm90ZSB0aGF0IHdlIG11bmdlIHRoZSBgY29uc3RydWN0b3JgIHBhc3NlZCBpbiBmb3IgZWZmaWNpZW5jeSB3aGlsZSBwYXJzaW5nLlxuICBkZWZpbmVSdWxlKHsgY29uc3RydWN0b3IsIC4uLnByb3BzIH0pIHtcbiAgICAvLyB0aHJvdyBpZiByZXF1aXJlZCBwYXJhbXMgbm90IHByb3ZpZGVkXG4gICAgaWYgKCFjb25zdHJ1Y3RvciB8fCAhcHJvcHMubmFtZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgcGFyc2VyLmRlZmluZSgpOiBZb3UgbXVzdCBwYXNzICdjb25zdHJ1Y3RvcicgYW5kICduYW1lJ2ApO1xuICAgIH1cbiAgICAvLyB0aHJvdyBpZiB3ZSdyZSByZS11c2luZyBhIGNvbnN0cnVjdG9yXG4gICAgaWYgKGNvbnN0cnVjdG9yLnByb3RvdHlwZS5uYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBwYXJzZXIuZGVmaW5lKCk6IEF0dGVtcHRpbmcgdG8gcmUtdXNlIGNvbnN0cnVjdG9yIGZvciBydWxlICcke3J1bGVOYW1lfSdgKTtcbiAgICB9XG5cbiAgICAvLyBOb3RlIHRoZSBtb2R1bGUgdGhhdCB0aGUgcnVsZSB3YXMgZGVmaW5lZCBpblxuICAgIGlmICh0aGlzLm1vZHVsZSkgcHJvcHMubW9kdWxlID0gdGhpcy5tb2R1bGU7XG5cbiAgICAvLyBJZiB3ZSdyZSBhIFwiY2Fub25pY2FsXCIgcnVsZSwgc2V0IG9uIFJ1bGUuXG4gICAgLy8gVXNlIHRoaXMgaWYgeW91IHdhbnQgdG8gY2hlY2sgdGhlIHR5cGUgb2YgYSBydWxlIGluIGEgdGVzdCBvciBzb21ldGhpbmcuXG4gICAgaWYgKHByb3BzLmNhbm9uaWNhbCkgUnVsZVtwcm9wcy5jYW5vbmljYWxdID0gY29uc3RydWN0b3I7XG5cbiAgICAvLyBDb252ZXJ0IGJsYWNrbGlzdCBmcm9tIGxpc3Qgb2Ygc3RyaW5ncyB0byBhIG1hcFxuICAgIGlmIChwcm9wcy5ibGFja2xpc3QgJiYgQXJyYXkuaXNBcnJheShwcm9wcy5ibGFja2xpc3QpKSB7XG4gICAgICBjb25zdCBtYXAgPSB7fTtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIHByb3BzLmJsYWNrbGlzdCkgbWFwW2tleV0gPSB0cnVlO1xuICAgICAgcHJvcHMuYmxhY2tsaXN0ID0gbWFwO1xuICAgIH1cblxuICAgIC8vIEFkZCBwcm9wcyB0byB0aGUgY29udHJ1Y3RvciBwcm90b3lwZSBub24tZW51bWVyYWJseSBhbmQgbm9uLXdyaXRhYmx5XG4gICAgLy8gIHNvIHdlJ2xsIGdldCBhbiBlcnJvciBpZiBzb21ldGhpbmcgdHJpZXMgdG8gb3ZlcndyaXRlIHRoZW0uXG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMocHJvcHMpKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IucHJvdG90eXBlLCBrZXksIHsgdmFsdWU6IHByb3BzW2tleV0gfSk7XG4gICAgfVxuXG4gICAgLy8gSW5zdGFudGlhdGUgdGhlIHJ1bGUuXG4gICAgY29uc3QgcnVsZSA9IHByb3BzLnN5bnRheFxuICAgICAgPyBwYXJzZVJ1bGUocHJvcHMuc3ludGF4LCBjb25zdHJ1Y3RvcilcbiAgICAgIDogbmV3IGNvbnN0cnVjdG9yKCk7XG5cbiAgICAvLyBDb21iaW5lIGFsaWFzZXMgd2l0aCB0aGUgbWFpbiBuYW1lXG4gICAgY29uc3QgbmFtZXMgPSBbcHJvcHMubmFtZV0uY29uY2F0KHByb3BzLmFsaWFzIHx8IFtdKTtcbiAgICAvLyBub3RlIGlmIHdlIGhhdmUgdGVzdHMgc28gd2UgY2FuIHNlbGVjdCB0aGlzIGNvbXBvbmVudCBlYXNpbHlcbiAgICBpZiAocHJvcHMudGVzdHMpIG5hbWVzLnB1c2goXCJfdGVzdGFibGVfXCIpO1xuXG4gICAgdGhpcy5hZGRSdWxlKG5hbWVzLCBydWxlKTtcbiAgfVxuXG5cbi8vXG4vLyAjIyMgUGFyc2VyIHJlZ2lzdHJ5LlxuLy9cblx0c3RhdGljIFJFR0lTVFJZID0ge307XG5cblx0Ly8gR2V0IGEgcGFyc2VyIGZvciBhIGdpdmVuIGBjb250ZXh0TmFtZWAuXG5cdC8vIFdpbGwgcmUtdXNlIGV4aXN0aW5nIHBhcnNlciwgb3IgY3JlYXRlIGEgbmV3IG9uZSBpZiBub3QgYWxyZWFkeSBkZWZpbmVkLlxuXHRzdGF0aWMgZm9yTW9kdWxlKG1vZHVsZSkge1xuXHRcdGlmICghUGFyc2VyLlJFR0lTVFJZW21vZHVsZV0pIHtcblx0XHRcdFBhcnNlci5SRUdJU1RSWVttb2R1bGVdID0gbmV3IFBhcnNlcih7IG1vZHVsZSB9KTtcblx0XHR9XG5cdFx0cmV0dXJuIFBhcnNlci5SRUdJU1RSWVttb2R1bGVdO1xuXHR9XG5cblxuLy9cbi8vICMjIFV0aWxpdHkgbWV0aG9kc1xuLy9cblxuXHQvLyBGaW5kIHRoZSBtYXRjaGluZyBpbnN0YW5jZSBvZiAocG9zc2libHkgbmVzdGVkKSBgZW5kVG9rZW5gIHRvIGJhbGFuY2UgYHN0YXJ0VG9rZW5gXG5cdC8vXHRpbiBhcnJheSBvZiBgdG9rZW5zYCAoc3RyaW5ncykuXG5cdC8vIElmIHN1Y2Nlc3NmdWwsIHJldHVybnMgYHsgc3RhcnQsIGVuZCwgc2xpY2UgfWBcblx0Ly8gVGhyb3dzIGlmIHVuc3VjZXNzZnVsLlxuXHRzdGF0aWMgZmluZE5lc3RlZFRva2Vucyh0b2tlbnMsIHN0YXJ0VG9rZW4sIGVuZFRva2VuLCBzdGFydCA9IDApIHtcblx0XHRpZiAodG9rZW5zW3N0YXJ0XSAhPT0gc3RhcnRUb2tlbikgdGhyb3cgbmV3IFBhcnNlRXJyb3IoYEV4cGVjdGVkICcke3N0YXJ0VG9rZW59JyBhdCBpbmRleCAke3N0YXJ0fSBvZiB0b2tlbnNgKTtcblx0XHRsZXQgbmVzdGluZyA9IDA7XG5cdFx0bGV0IG5lc3RlZCA9IGZhbHNlO1xuXHRcdGZvciAobGV0IGVuZCA9IHN0YXJ0ICsgMSwgbGFzdEluZGV4ID0gdG9rZW5zLmxlbmd0aDsgZW5kIDwgbGFzdEluZGV4OyBlbmQrKykge1xuXHRcdFx0bGV0IHRva2VuID0gdG9rZW5zW2VuZF07XG5cdFx0XHRpZiAodG9rZW4gPT09IHN0YXJ0VG9rZW4pIHtcblx0XHRcdFx0bmVzdGluZysrO1xuXHRcdFx0XHRuZXN0ZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRva2VuID09PSBlbmRUb2tlbikge1xuXHRcdFx0XHRpZiAobmVzdGluZyA9PT0gMClcblx0XHRcdFx0XHRyZXR1cm4geyBzdGFydCwgZW5kLCBzbGljZTogdG9rZW5zLnNsaWNlKHN0YXJ0KzEsIGVuZCksIG5lc3RlZCB9O1xuXHRcdFx0XHRuZXN0aW5nLS07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRocm93IG5ldyBQYXJzZUVycm9yKGBDb3VsZG4ndCBmaW5kIG1hdGNoaW5nICcke2VuZFRva2VufSdzIHN0YXJ0aW5nIGF0IGl0ZW0gJHtzdGFydH1gKTtcblx0fVxufVxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvUGFyc2VyLmpzIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICB2YXIgUkVBQ1RfRUxFTUVOVF9UWVBFID0gKHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiZcbiAgICBTeW1ib2wuZm9yICYmXG4gICAgU3ltYm9sLmZvcigncmVhY3QuZWxlbWVudCcpKSB8fFxuICAgIDB4ZWFjNztcblxuICB2YXIgaXNWYWxpZEVsZW1lbnQgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIG9iamVjdCAhPT0gbnVsbCAmJlxuICAgICAgb2JqZWN0LiQkdHlwZW9mID09PSBSRUFDVF9FTEVNRU5UX1RZUEU7XG4gIH07XG5cbiAgLy8gQnkgZXhwbGljaXRseSB1c2luZyBgcHJvcC10eXBlc2AgeW91IGFyZSBvcHRpbmcgaW50byBuZXcgZGV2ZWxvcG1lbnQgYmVoYXZpb3IuXG4gIC8vIGh0dHA6Ly9mYi5tZS9wcm9wLXR5cGVzLWluLXByb2RcbiAgdmFyIHRocm93T25EaXJlY3RBY2Nlc3MgPSB0cnVlO1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZmFjdG9yeVdpdGhUeXBlQ2hlY2tlcnMnKShpc1ZhbGlkRWxlbWVudCwgdGhyb3dPbkRpcmVjdEFjY2Vzcyk7XG59IGVsc2Uge1xuICAvLyBCeSBleHBsaWNpdGx5IHVzaW5nIGBwcm9wLXR5cGVzYCB5b3UgYXJlIG9wdGluZyBpbnRvIG5ldyBwcm9kdWN0aW9uIGJlaGF2aW9yLlxuICAvLyBodHRwOi8vZmIubWUvcHJvcC10eXBlcy1pbi1wcm9kXG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9mYWN0b3J5V2l0aFRocm93aW5nU2hpbXMnKSgpO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3Byb3AtdHlwZXMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDM1OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJmdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuLyogZXNsaW50LWRpc2FibGUgbm8tdXNlLWJlZm9yZS1kZWZpbmUgKi9cbi8qKlxuICogQG1vZHVsZSBldmVudEhhbmRsZXJzXG4gKlxuICovXG5pbXBvcnQgZG9tSGVscGVycyBmcm9tICcuL2xpYi9kb21faGVscGVycyc7XG5pbXBvcnQgbGlzdGVuZXJzIGZyb20gJy4vbGliL2xpc3RlbmVycyc7XG5pbXBvcnQgKiBhcyBzdG9yZSBmcm9tICcuL3N0b3JlJztcblxuLyoqXG4gKiBwcml2YXRlXG4gKlxuICovXG5cbi8qKlxuICogX29uQ2xpY2tcbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCBUaGUgY2xpY2sgZXZlbnQgb2JqZWN0XG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnQudGFyZ2V0IFRoZSBET00gbm9kZSBmcm9tIHRoZSBjbGljayBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gX29uQ2xpY2soX3JlZikge1xuICB2YXIgdGFyZ2V0ID0gX3JlZi50YXJnZXQ7XG5cbiAgc3RvcmUuYWN0aXZhdGUoW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShzdG9yZS5nZXRJbnN0YW5jZXMoKSkpLnJlZHVjZShkb21IZWxwZXJzLmZpbmRDb250YWluZXJOb2Rlcyh0YXJnZXQpLCBbXSkuc29ydChkb21IZWxwZXJzLnNvcnRCeURPTVBvc2l0aW9uKS5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5pbnN0YW5jZTtcbiAgfSkpO1xufVxuXG4vKipcbiAqIF9vbktleURvd246IFRoZSBrZXlkb3duIGV2ZW50IGNhbGxiYWNrXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgVGhlIGtleWRvd24gZXZlbnQgb2JqZWN0XG4gKiBAcGFyYW0ge251bWJlcn0gZXZlbnQud2hpY2ggVGhlIGtleSBjb2RlICh3aGljaCkgcmVjZWl2ZWQgZnJvbSB0aGUga2V5ZG93biBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gX29uS2V5RG93bihldmVudCkge1xuICB2YXIgZm9yY2VDb25zaWRlciA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG5cbiAgaWYgKGZvcmNlQ29uc2lkZXIgfHwgX3Nob3VsZENvbnNpZGVyKGV2ZW50KSkge1xuICAgIHZhciBfcmVmMiA9IHN0b3JlLmZpbmRCaW5kaW5nRm9yRXZlbnQoZXZlbnQpIHx8IHt9LFxuICAgICAgICBmbiA9IF9yZWYyLmZuLFxuICAgICAgICBpbnN0YW5jZSA9IF9yZWYyLmluc3RhbmNlO1xuXG4gICAgaWYgKGZuKSB7XG4gICAgICBmbi5jYWxsKGluc3RhbmNlLCBldmVudCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIF9zaG91bGRDb25zaWRlcjogQ29uZGl0aW9ucyBmb3IgcHJvY2VlZGluZyB3aXRoIGtleSBldmVudCBoYW5kbGluZ1xuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IFRoZSBrZXlkb3duIGV2ZW50IG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50LnRhcmdldCBUaGUgbm9kZSBvcmlnaW4gb2YgdGhlIGV2ZW50XG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHRvIGNvbnRpbnVlIHByb2Nlc2luZyB0aGUga2V5ZG93biBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gX3Nob3VsZENvbnNpZGVyKF9yZWYzKSB7XG4gIHZhciBjdHJsS2V5ID0gX3JlZjMuY3RybEtleSxcbiAgICAgIHRhcmdldCA9IF9yZWYzLnRhcmdldDtcblxuICByZXR1cm4gY3RybEtleSB8fCAhflsnSU5QVVQnLCAnU0VMRUNUJywgJ1RFWFRBUkVBJ10uaW5kZXhPZih0YXJnZXQudGFnTmFtZSkgJiYgKCF0YXJnZXQuZ2V0QXR0cmlidXRlIHx8IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ3JvbGUnKSAhPT0gJ3RleHRib3gnKTtcbn1cblxuLyoqXG4gKiBwdWJsaWNcbiAqXG4gKi9cblxuLyoqXG4gKiBvbk1vdW50XG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gb25Nb3VudChpbnN0YW5jZSkge1xuICBzdG9yZS5hY3RpdmF0ZShpbnN0YW5jZSk7XG4gIGxpc3RlbmVycy5iaW5kS2V5cyhfb25LZXlEb3duKTtcbiAgbGlzdGVuZXJzLmJpbmRDbGlja3MoX29uQ2xpY2spO1xuICBkb21IZWxwZXJzLmJpbmRGb2N1c2FibGVzKGluc3RhbmNlLCBzdG9yZS5hY3RpdmF0ZSk7XG59XG5cbi8qKlxuICogb25Vbm1vdW50XG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gb25Vbm1vdW50KGluc3RhbmNlKSB7XG4gIHN0b3JlLmRlbGV0ZUluc3RhbmNlKGluc3RhbmNlKTtcbiAgaWYgKHN0b3JlLmlzRW1wdHkoKSkge1xuICAgIGxpc3RlbmVycy51bmJpbmRDbGlja3MoX29uQ2xpY2spO1xuICAgIGxpc3RlbmVycy51bmJpbmRLZXlzKF9vbktleURvd24pO1xuICB9XG59XG5cbmV4cG9ydCB7IG9uTW91bnQsIG9uVW5tb3VudCB9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2V2ZW50X2hhbmRsZXJzLmpzXG4vLyBtb2R1bGUgaWQgPSAzODFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgbW9kaWZpZXJzIGFzIG1vZGlmaWVyS2V5cywgQUxMX0tFWVMsIEFMTF9QUklOVEFCTEVfS0VZUyB9IGZyb20gJy4va2V5cyc7XG5cbnZhciBQUklOVEFCTEVfQ0hBUkFDVEVSUyA9ICcwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWn4hQCMkJV4mKigpLV8rPVtdXFxcXHt9fDtcXCc6XCIsLi88Pj/Coyc7XG5cbnZhciBtb2RLZXlzID0gT2JqZWN0LmtleXMobW9kaWZpZXJLZXlzKTtcblxuZnVuY3Rpb24gbWF0Y2hLZXlzKF9yZWYpIHtcbiAgdmFyIGtleVNldCA9IF9yZWYua2V5U2V0LFxuICAgICAgZXZlbnQgPSBfcmVmLmV2ZW50O1xuICB2YXIga2V5ID0ga2V5U2V0LmtleSxcbiAgICAgIF9rZXlTZXQkbW9kaWZpZXJzID0ga2V5U2V0Lm1vZGlmaWVycyxcbiAgICAgIG1vZGlmaWVycyA9IF9rZXlTZXQkbW9kaWZpZXJzID09PSB1bmRlZmluZWQgPyBbXSA6IF9rZXlTZXQkbW9kaWZpZXJzO1xuXG4gIHZhciBrZXlzTWF0Y2ggPSB2b2lkIDA7XG5cbiAga2V5c01hdGNoID0ga2V5ID09PSBBTExfS0VZUztcblxuICBpZiAoa2V5ID09PSBBTExfUFJJTlRBQkxFX0tFWVMpIHtcbiAgICBpZiAoZXZlbnQua2V5KSB7XG4gICAgICAvLyBNb2Rlcm4gYnJvd3NlcnMgaW1wbGVtZW50IGBrZXlgLCBzbyBpZiBga2V5YCBpcyBsZW5ndGggMSwgd2UgaGF2ZSBhIG1hdGNoLiBlLmcuICdhJyBmb3IgdGhlXG4gICAgICAvLyBhIGtleSwgb3IgJzInIGZvciB0aGUgMiBrZXkuIEFsbCBvdGhlciBub24tcHJpbnRhYmxlIGNoYXJhY3RlcnMgaGF2ZSBuYW1lcywgZS5nLiAnRW50ZXInIG9yICdCYWNrc3BhY2UnLlxuICAgICAga2V5c01hdGNoID0gZXZlbnQua2V5Lmxlbmd0aCA9PT0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgZG8gbm8gc3VwcG9ydCBgZXZlbnQua2V5YCwgd2UgdGVzdCBhZ2FpbnN0IGEgbGlzdCBvZiBjaGFyYWN0ZXJzXG4gICAgICB2YXIgcHJlc3NlZENoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LmNoYXJDb2RlKTtcbiAgICAgIGtleXNNYXRjaCA9IFBSSU5UQUJMRV9DSEFSQUNURVJTLmluZGV4T2YocHJlc3NlZENoYXIpID49IDA7XG4gICAgfVxuICB9XG5cbiAgaWYgKGtleSA9PT0gZXZlbnQud2hpY2gpIHtcbiAgICB2YXIgZXZ0TW9kS2V5cyA9IG1vZEtleXMuZmlsdGVyKGZ1bmN0aW9uIChtb2RLZXkpIHtcbiAgICAgIHJldHVybiBldmVudFttb2RLZXkgKyAnS2V5J107XG4gICAgfSkuc29ydCgpO1xuICAgIGtleXNNYXRjaCA9IG1vZGlmaWVycy5sZW5ndGggPT09IGV2dE1vZEtleXMubGVuZ3RoICYmIG1vZGlmaWVycy5ldmVyeShmdW5jdGlvbiAobW9kS2V5LCBpbmRleCkge1xuICAgICAgcmV0dXJuIGV2dE1vZEtleXNbaW5kZXhdID09PSBtb2RLZXk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4ga2V5c01hdGNoO1xufVxuXG5leHBvcnQgZGVmYXVsdCBtYXRjaEtleXM7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL21hdGNoX2tleXMuanNcbi8vIG1vZHVsZSBpZCA9IDM4MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgS2V5cywgeyBtb2RpZmllcnMgfSBmcm9tICcuL2tleXMnO1xuXG5mdW5jdGlvbiBwYXJzZUtleXMoa2V5c0FycmF5KSB7XG4gIHJldHVybiBrZXlzQXJyYXkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIga2V5U2V0ID0geyBrZXk6IGtleSB9O1xuICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgdmFyIGtleVN0cmluZyA9IGtleS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICAgIHZhciBtYXRjaGVzID0ga2V5U3RyaW5nLnNwbGl0KC9cXHM/XFwrXFxzPy8pO1xuICAgICAga2V5U2V0ID0gbWF0Y2hlcy5sZW5ndGggPT09IDEgPyB7IGtleTogS2V5c1trZXlTdHJpbmddIH0gOiB7XG4gICAgICAgIGtleTogS2V5c1ttYXRjaGVzLnBvcCgpXSxcbiAgICAgICAgbW9kaWZpZXJzOiBtYXRjaGVzLm1hcChmdW5jdGlvbiAobW9kS2V5KSB7XG4gICAgICAgICAgcmV0dXJuIG1vZGlmaWVyc1ttb2RLZXldO1xuICAgICAgICB9KS5zb3J0KClcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBrZXlTZXQ7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBwYXJzZUtleXM7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL3BhcnNlX2tleXMuanNcbi8vIG1vZHVsZSBpZCA9IDM4M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuXHRNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xudmFyIHN0eWxlc0luRG9tID0ge30sXG5cdG1lbW9pemUgPSBmdW5jdGlvbihmbikge1xuXHRcdHZhciBtZW1vO1xuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAodHlwZW9mIG1lbW8gPT09IFwidW5kZWZpbmVkXCIpIG1lbW8gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0cmV0dXJuIG1lbW87XG5cdFx0fTtcblx0fSxcblx0aXNPbGRJRSA9IG1lbW9pemUoZnVuY3Rpb24oKSB7XG5cdFx0Ly8gVGVzdCBmb3IgSUUgPD0gOSBhcyBwcm9wb3NlZCBieSBCcm93c2VyaGFja3Ncblx0XHQvLyBAc2VlIGh0dHA6Ly9icm93c2VyaGFja3MuY29tLyNoYWNrLWU3MWQ4NjkyZjY1MzM0MTczZmVlNzE1YzIyMmNiODA1XG5cdFx0Ly8gVGVzdHMgZm9yIGV4aXN0ZW5jZSBvZiBzdGFuZGFyZCBnbG9iYWxzIGlzIHRvIGFsbG93IHN0eWxlLWxvYWRlciBcblx0XHQvLyB0byBvcGVyYXRlIGNvcnJlY3RseSBpbnRvIG5vbi1zdGFuZGFyZCBlbnZpcm9ubWVudHNcblx0XHQvLyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJwYWNrLWNvbnRyaWIvc3R5bGUtbG9hZGVyL2lzc3Vlcy8xNzdcblx0XHRyZXR1cm4gd2luZG93ICYmIGRvY3VtZW50ICYmIGRvY3VtZW50LmFsbCAmJiAhd2luZG93LmF0b2I7XG5cdH0pLFxuXHRnZXRFbGVtZW50ID0gKGZ1bmN0aW9uKGZuKSB7XG5cdFx0dmFyIG1lbW8gPSB7fTtcblx0XHRyZXR1cm4gZnVuY3Rpb24oc2VsZWN0b3IpIHtcblx0XHRcdGlmICh0eXBlb2YgbWVtb1tzZWxlY3Rvcl0gPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0bWVtb1tzZWxlY3Rvcl0gPSBmbi5jYWxsKHRoaXMsIHNlbGVjdG9yKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBtZW1vW3NlbGVjdG9yXVxuXHRcdH07XG5cdH0pKGZ1bmN0aW9uIChzdHlsZVRhcmdldCkge1xuXHRcdHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHN0eWxlVGFyZ2V0KVxuXHR9KSxcblx0c2luZ2xldG9uRWxlbWVudCA9IG51bGwsXG5cdHNpbmdsZXRvbkNvdW50ZXIgPSAwLFxuXHRzdHlsZUVsZW1lbnRzSW5zZXJ0ZWRBdFRvcCA9IFtdLFxuXHRmaXhVcmxzID0gcmVxdWlyZShcIi4vZml4VXJsc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsaXN0LCBvcHRpb25zKSB7XG5cdGlmKHR5cGVvZiBERUJVRyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBERUJVRykge1xuXHRcdGlmKHR5cGVvZiBkb2N1bWVudCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHN0eWxlLWxvYWRlciBjYW5ub3QgYmUgdXNlZCBpbiBhIG5vbi1icm93c2VyIGVudmlyb25tZW50XCIpO1xuXHR9XG5cblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdG9wdGlvbnMuYXR0cnMgPSB0eXBlb2Ygb3B0aW9ucy5hdHRycyA9PT0gXCJvYmplY3RcIiA/IG9wdGlvbnMuYXR0cnMgOiB7fTtcblxuXHQvLyBGb3JjZSBzaW5nbGUtdGFnIHNvbHV0aW9uIG9uIElFNi05LCB3aGljaCBoYXMgYSBoYXJkIGxpbWl0IG9uIHRoZSAjIG9mIDxzdHlsZT5cblx0Ly8gdGFncyBpdCB3aWxsIGFsbG93IG9uIGEgcGFnZVxuXHRpZiAodHlwZW9mIG9wdGlvbnMuc2luZ2xldG9uID09PSBcInVuZGVmaW5lZFwiKSBvcHRpb25zLnNpbmdsZXRvbiA9IGlzT2xkSUUoKTtcblxuXHQvLyBCeSBkZWZhdWx0LCBhZGQgPHN0eWxlPiB0YWdzIHRvIHRoZSA8aGVhZD4gZWxlbWVudFxuXHRpZiAodHlwZW9mIG9wdGlvbnMuaW5zZXJ0SW50byA9PT0gXCJ1bmRlZmluZWRcIikgb3B0aW9ucy5pbnNlcnRJbnRvID0gXCJoZWFkXCI7XG5cblx0Ly8gQnkgZGVmYXVsdCwgYWRkIDxzdHlsZT4gdGFncyB0byB0aGUgYm90dG9tIG9mIHRoZSB0YXJnZXRcblx0aWYgKHR5cGVvZiBvcHRpb25zLmluc2VydEF0ID09PSBcInVuZGVmaW5lZFwiKSBvcHRpb25zLmluc2VydEF0ID0gXCJib3R0b21cIjtcblxuXHR2YXIgc3R5bGVzID0gbGlzdFRvU3R5bGVzKGxpc3QsIG9wdGlvbnMpO1xuXHRhZGRTdHlsZXNUb0RvbShzdHlsZXMsIG9wdGlvbnMpO1xuXG5cdHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuXHRcdHZhciBtYXlSZW1vdmUgPSBbXTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IHN0eWxlc1tpXTtcblx0XHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXHRcdFx0ZG9tU3R5bGUucmVmcy0tO1xuXHRcdFx0bWF5UmVtb3ZlLnB1c2goZG9tU3R5bGUpO1xuXHRcdH1cblx0XHRpZihuZXdMaXN0KSB7XG5cdFx0XHR2YXIgbmV3U3R5bGVzID0gbGlzdFRvU3R5bGVzKG5ld0xpc3QsIG9wdGlvbnMpO1xuXHRcdFx0YWRkU3R5bGVzVG9Eb20obmV3U3R5bGVzLCBvcHRpb25zKTtcblx0XHR9XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IG1heVJlbW92ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGRvbVN0eWxlID0gbWF5UmVtb3ZlW2ldO1xuXHRcdFx0aWYoZG9tU3R5bGUucmVmcyA9PT0gMCkge1xuXHRcdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgZG9tU3R5bGUucGFydHMubGVuZ3RoOyBqKyspXG5cdFx0XHRcdFx0ZG9tU3R5bGUucGFydHNbal0oKTtcblx0XHRcdFx0ZGVsZXRlIHN0eWxlc0luRG9tW2RvbVN0eWxlLmlkXTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59O1xuXG5mdW5jdGlvbiBhZGRTdHlsZXNUb0RvbShzdHlsZXMsIG9wdGlvbnMpIHtcblx0Zm9yKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xuXHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXHRcdGlmKGRvbVN0eWxlKSB7XG5cdFx0XHRkb21TdHlsZS5yZWZzKys7XG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgZG9tU3R5bGUucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0ZG9tU3R5bGUucGFydHNbal0oaXRlbS5wYXJ0c1tqXSk7XG5cdFx0XHR9XG5cdFx0XHRmb3IoOyBqIDwgaXRlbS5wYXJ0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRkb21TdHlsZS5wYXJ0cy5wdXNoKGFkZFN0eWxlKGl0ZW0ucGFydHNbal0sIG9wdGlvbnMpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHBhcnRzID0gW107XG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgaXRlbS5wYXJ0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRwYXJ0cy5wdXNoKGFkZFN0eWxlKGl0ZW0ucGFydHNbal0sIG9wdGlvbnMpKTtcblx0XHRcdH1cblx0XHRcdHN0eWxlc0luRG9tW2l0ZW0uaWRdID0ge2lkOiBpdGVtLmlkLCByZWZzOiAxLCBwYXJ0czogcGFydHN9O1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBsaXN0VG9TdHlsZXMobGlzdCwgb3B0aW9ucykge1xuXHR2YXIgc3R5bGVzID0gW107XG5cdHZhciBuZXdTdHlsZXMgPSB7fTtcblx0Zm9yKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgaXRlbSA9IGxpc3RbaV07XG5cdFx0dmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG5cdFx0dmFyIGNzcyA9IGl0ZW1bMV07XG5cdFx0dmFyIG1lZGlhID0gaXRlbVsyXTtcblx0XHR2YXIgc291cmNlTWFwID0gaXRlbVszXTtcblx0XHR2YXIgcGFydCA9IHtjc3M6IGNzcywgbWVkaWE6IG1lZGlhLCBzb3VyY2VNYXA6IHNvdXJjZU1hcH07XG5cdFx0aWYoIW5ld1N0eWxlc1tpZF0pXG5cdFx0XHRzdHlsZXMucHVzaChuZXdTdHlsZXNbaWRdID0ge2lkOiBpZCwgcGFydHM6IFtwYXJ0XX0pO1xuXHRcdGVsc2Vcblx0XHRcdG5ld1N0eWxlc1tpZF0ucGFydHMucHVzaChwYXJ0KTtcblx0fVxuXHRyZXR1cm4gc3R5bGVzO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgc3R5bGVFbGVtZW50KSB7XG5cdHZhciBzdHlsZVRhcmdldCA9IGdldEVsZW1lbnQob3B0aW9ucy5pbnNlcnRJbnRvKVxuXHRpZiAoIXN0eWxlVGFyZ2V0KSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnRJbnRvJyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG5cdH1cblx0dmFyIGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wID0gc3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3Bbc3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AubGVuZ3RoIC0gMV07XG5cdGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcInRvcFwiKSB7XG5cdFx0aWYoIWxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wKSB7XG5cdFx0XHRzdHlsZVRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGVFbGVtZW50LCBzdHlsZVRhcmdldC5maXJzdENoaWxkKTtcblx0XHR9IGVsc2UgaWYobGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3AubmV4dFNpYmxpbmcpIHtcblx0XHRcdHN0eWxlVGFyZ2V0Lmluc2VydEJlZm9yZShzdHlsZUVsZW1lbnQsIGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3R5bGVUYXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGVFbGVtZW50KTtcblx0XHR9XG5cdFx0c3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AucHVzaChzdHlsZUVsZW1lbnQpO1xuXHR9IGVsc2UgaWYgKG9wdGlvbnMuaW5zZXJ0QXQgPT09IFwiYm90dG9tXCIpIHtcblx0XHRzdHlsZVRhcmdldC5hcHBlbmRDaGlsZChzdHlsZUVsZW1lbnQpO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdmFsdWUgZm9yIHBhcmFtZXRlciAnaW5zZXJ0QXQnLiBNdXN0IGJlICd0b3AnIG9yICdib3R0b20nLlwiKTtcblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG5cdHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG5cdHZhciBpZHggPSBzdHlsZUVsZW1lbnRzSW5zZXJ0ZWRBdFRvcC5pbmRleE9mKHN0eWxlRWxlbWVudCk7XG5cdGlmKGlkeCA+PSAwKSB7XG5cdFx0c3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3Auc3BsaWNlKGlkeCwgMSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcblx0b3B0aW9ucy5hdHRycy50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuXG5cdGF0dGFjaFRhZ0F0dHJzKHN0eWxlRWxlbWVudCwgb3B0aW9ucy5hdHRycyk7XG5cdGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zLCBzdHlsZUVsZW1lbnQpO1xuXHRyZXR1cm4gc3R5bGVFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVMaW5rRWxlbWVudChvcHRpb25zKSB7XG5cdHZhciBsaW5rRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xuXHRvcHRpb25zLmF0dHJzLnR5cGUgPSBcInRleHQvY3NzXCI7XG5cdG9wdGlvbnMuYXR0cnMucmVsID0gXCJzdHlsZXNoZWV0XCI7XG5cblx0YXR0YWNoVGFnQXR0cnMobGlua0VsZW1lbnQsIG9wdGlvbnMuYXR0cnMpO1xuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgbGlua0VsZW1lbnQpO1xuXHRyZXR1cm4gbGlua0VsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGF0dGFjaFRhZ0F0dHJzKGVsZW1lbnQsIGF0dHJzKSB7XG5cdE9iamVjdC5rZXlzKGF0dHJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gYWRkU3R5bGUob2JqLCBvcHRpb25zKSB7XG5cdHZhciBzdHlsZUVsZW1lbnQsIHVwZGF0ZSwgcmVtb3ZlLCB0cmFuc2Zvcm1SZXN1bHQ7XG5cblx0Ly8gSWYgYSB0cmFuc2Zvcm0gZnVuY3Rpb24gd2FzIGRlZmluZWQsIHJ1biBpdCBvbiB0aGUgY3NzXG5cdGlmIChvcHRpb25zLnRyYW5zZm9ybSAmJiBvYmouY3NzKSB7XG5cdCAgICB0cmFuc2Zvcm1SZXN1bHQgPSBvcHRpb25zLnRyYW5zZm9ybShvYmouY3NzKTtcblx0ICAgIFxuXHQgICAgaWYgKHRyYW5zZm9ybVJlc3VsdCkge1xuXHQgICAgXHQvLyBJZiB0cmFuc2Zvcm0gcmV0dXJucyBhIHZhbHVlLCB1c2UgdGhhdCBpbnN0ZWFkIG9mIHRoZSBvcmlnaW5hbCBjc3MuXG5cdCAgICBcdC8vIFRoaXMgYWxsb3dzIHJ1bm5pbmcgcnVudGltZSB0cmFuc2Zvcm1hdGlvbnMgb24gdGhlIGNzcy5cblx0ICAgIFx0b2JqLmNzcyA9IHRyYW5zZm9ybVJlc3VsdDtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICBcdC8vIElmIHRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24gcmV0dXJucyBhIGZhbHN5IHZhbHVlLCBkb24ndCBhZGQgdGhpcyBjc3MuIFxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBjb25kaXRpb25hbCBsb2FkaW5nIG9mIGNzc1xuXHQgICAgXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgICBcdFx0Ly8gbm9vcFxuXHQgICAgXHR9O1xuXHQgICAgfVxuXHR9XG5cblx0aWYgKG9wdGlvbnMuc2luZ2xldG9uKSB7XG5cdFx0dmFyIHN0eWxlSW5kZXggPSBzaW5nbGV0b25Db3VudGVyKys7XG5cdFx0c3R5bGVFbGVtZW50ID0gc2luZ2xldG9uRWxlbWVudCB8fCAoc2luZ2xldG9uRWxlbWVudCA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKSk7XG5cdFx0dXBkYXRlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlRWxlbWVudCwgc3R5bGVJbmRleCwgZmFsc2UpO1xuXHRcdHJlbW92ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZUVsZW1lbnQsIHN0eWxlSW5kZXgsIHRydWUpO1xuXHR9IGVsc2UgaWYob2JqLnNvdXJjZU1hcCAmJlxuXHRcdHR5cGVvZiBVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBVUkwuY3JlYXRlT2JqZWN0VVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgVVJMLnJldm9rZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIEJsb2IgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRzdHlsZUVsZW1lbnQgPSBjcmVhdGVMaW5rRWxlbWVudChvcHRpb25zKTtcblx0XHR1cGRhdGUgPSB1cGRhdGVMaW5rLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50LCBvcHRpb25zKTtcblx0XHRyZW1vdmUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuXHRcdFx0aWYoc3R5bGVFbGVtZW50LmhyZWYpXG5cdFx0XHRcdFVSTC5yZXZva2VPYmplY3RVUkwoc3R5bGVFbGVtZW50LmhyZWYpO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0c3R5bGVFbGVtZW50ID0gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuXHRcdHVwZGF0ZSA9IGFwcGx5VG9UYWcuYmluZChudWxsLCBzdHlsZUVsZW1lbnQpO1xuXHRcdHJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG5cdFx0fTtcblx0fVxuXG5cdHVwZGF0ZShvYmopO1xuXG5cdHJldHVybiBmdW5jdGlvbiB1cGRhdGVTdHlsZShuZXdPYmopIHtcblx0XHRpZihuZXdPYmopIHtcblx0XHRcdGlmKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcClcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0dXBkYXRlKG9iaiA9IG5ld09iaik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlbW92ZSgpO1xuXHRcdH1cblx0fTtcbn1cblxudmFyIHJlcGxhY2VUZXh0ID0gKGZ1bmN0aW9uICgpIHtcblx0dmFyIHRleHRTdG9yZSA9IFtdO1xuXG5cdHJldHVybiBmdW5jdGlvbiAoaW5kZXgsIHJlcGxhY2VtZW50KSB7XG5cdFx0dGV4dFN0b3JlW2luZGV4XSA9IHJlcGxhY2VtZW50O1xuXHRcdHJldHVybiB0ZXh0U3RvcmUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuXHR9O1xufSkoKTtcblxuZnVuY3Rpb24gYXBwbHlUb1NpbmdsZXRvblRhZyhzdHlsZUVsZW1lbnQsIGluZGV4LCByZW1vdmUsIG9iaikge1xuXHR2YXIgY3NzID0gcmVtb3ZlID8gXCJcIiA6IG9iai5jc3M7XG5cblx0aWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG5cdFx0c3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IHJlcGxhY2VUZXh0KGluZGV4LCBjc3MpO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBjc3NOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKTtcblx0XHR2YXIgY2hpbGROb2RlcyA9IHN0eWxlRWxlbWVudC5jaGlsZE5vZGVzO1xuXHRcdGlmIChjaGlsZE5vZGVzW2luZGV4XSkgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKGNoaWxkTm9kZXNbaW5kZXhdKTtcblx0XHRpZiAoY2hpbGROb2Rlcy5sZW5ndGgpIHtcblx0XHRcdHN0eWxlRWxlbWVudC5pbnNlcnRCZWZvcmUoY3NzTm9kZSwgY2hpbGROb2Rlc1tpbmRleF0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoY3NzTm9kZSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGFwcGx5VG9UYWcoc3R5bGVFbGVtZW50LCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBtZWRpYSA9IG9iai5tZWRpYTtcblxuXHRpZihtZWRpYSkge1xuXHRcdHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJtZWRpYVwiLCBtZWRpYSlcblx0fVxuXG5cdGlmKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG5cdFx0c3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcblx0fSBlbHNlIHtcblx0XHR3aGlsZShzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuXHRcdFx0c3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcblx0XHR9XG5cdFx0c3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUxpbmsobGlua0VsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuXHR2YXIgY3NzID0gb2JqLmNzcztcblx0dmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cblx0LyogSWYgY29udmVydFRvQWJzb2x1dGVVcmxzIGlzbid0IGRlZmluZWQsIGJ1dCBzb3VyY2VtYXBzIGFyZSBlbmFibGVkXG5cdGFuZCB0aGVyZSBpcyBubyBwdWJsaWNQYXRoIGRlZmluZWQgdGhlbiBsZXRzIHR1cm4gY29udmVydFRvQWJzb2x1dGVVcmxzXG5cdG9uIGJ5IGRlZmF1bHQuICBPdGhlcndpc2UgZGVmYXVsdCB0byB0aGUgY29udmVydFRvQWJzb2x1dGVVcmxzIG9wdGlvblxuXHRkaXJlY3RseVxuXHQqL1xuXHR2YXIgYXV0b0ZpeFVybHMgPSBvcHRpb25zLmNvbnZlcnRUb0Fic29sdXRlVXJscyA9PT0gdW5kZWZpbmVkICYmIHNvdXJjZU1hcDtcblxuXHRpZiAob3B0aW9ucy5jb252ZXJ0VG9BYnNvbHV0ZVVybHMgfHwgYXV0b0ZpeFVybHMpe1xuXHRcdGNzcyA9IGZpeFVybHMoY3NzKTtcblx0fVxuXG5cdGlmKHNvdXJjZU1hcCkge1xuXHRcdC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI2NjAzODc1XG5cdFx0Y3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIiArIGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSkgKyBcIiAqL1wiO1xuXHR9XG5cblx0dmFyIGJsb2IgPSBuZXcgQmxvYihbY3NzXSwgeyB0eXBlOiBcInRleHQvY3NzXCIgfSk7XG5cblx0dmFyIG9sZFNyYyA9IGxpbmtFbGVtZW50LmhyZWY7XG5cblx0bGlua0VsZW1lbnQuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cblx0aWYob2xkU3JjKVxuXHRcdFVSTC5yZXZva2VPYmplY3RVUkwob2xkU3JjKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9zdHlsZS1sb2FkZXIvYWRkU3R5bGVzLmpzXG4vLyBtb2R1bGUgaWQgPSA0NzZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tIFwibW9ieC1yZWFjdFwiO1xuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IGtleWRvd24gZnJvbSBcInJlYWN0LWtleWRvd25cIjtcbmltcG9ydCB7IEJ1dHRvbiwgRHJvcGRvd24sIEdyaWQsIE1lbnUsIFNlZ21lbnQsIFRleHRBcmVhIH0gZnJvbSAnc2VtYW50aWMtdWktcmVhY3QnXG5cbmltcG9ydCBFeGFtcGxlU3RvcmUgZnJvbSBcIi4vRXhhbXBsZVN0b3JlXCI7XG5pbXBvcnQgU3BhY2VyIGZyb20gXCIuL1NwYWNlci5qc3hcIjtcbmltcG9ydCBcIi4vc3R5bGVzLmxlc3NcIjtcbmltcG9ydCBUYWJiYWJsZVRleHRBcmVhIGZyb20gXCIuL1RhYmJhYmxlVGV4dEFyZWEuanN4XCI7XG5cbkBvYnNlcnZlclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BlbGxFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuXHRcdGV4YW1wbGVzOiBuZXcgRXhhbXBsZVN0b3JlKClcblx0fTtcblxuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHN1cGVyKHByb3BzKTtcbndpbmRvdy5leGFtcGxlcyA9IHByb3BzLmV4YW1wbGVzO1xuXHRcdHRoaXMucHJvcHMuZXhhbXBsZXMubG9hZCgpO1xuXG5cdFx0Ly9ERUJVR1xuXHRcdHdpbmRvdy5zcGVsbEVkaXRvciA9IHRoaXM7XG5cdFx0d2luZG93LmV4YW1wbGVzID0gdGhpcy5wcm9wcy5leGFtcGxlcztcblx0fVxuXG5cdEBrZXlkb3duKFwiY3RybCtzXCIpXG5cdHNhdmUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuc2F2ZSgpOyB9XG5cblx0QGtleWRvd24oXCJjdHJsK3JcIilcblx0cmV2ZXJ0KCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLnJldmVydCgpOyB9XG5cblx0QGtleWRvd24oXCJjdHJsK2NcIilcblx0Y29tcGlsZSgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5jb21waWxlKCk7IH1cblxuXHRAa2V5ZG93bihcImN0cmwrblwiKVxuXHRjcmVhdGUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuY3JlYXRlKCk7IH1cblxuXHRAa2V5ZG93bihcImN0cmwrZFwiKVxuXHRkZWxldGUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuZGVsZXRlKHVuZGVmaW5lZCwgXCJDT05GSVJNXCIpOyB9XG5cblx0cmVuYW1lKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLnJlbmFtZSgpOyB9XG5cdGR1cGxpY2F0ZSgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5kdXBsaWNhdGUoKTsgfVxuXHRsb2FkKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLmxvYWQoKTsgfVxuXHRyZXNldCgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5yZXNldCgpOyB9XG5cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IHsgZXhhbXBsZXMgfSA9IHRoaXMucHJvcHM7XG5cdFx0bGV0IHsgdGl0bGVzLCBzZWxlY3RlZCwgZGlydHksIGNvZGUsIG91dHB1dCB9ID0gZXhhbXBsZXM7XG5cblx0XHQvLyBDcmVhdGUgbWVudWl0ZW1zIGZyb20gdGhlIGV4YW1wbGVzXG5cdFx0bGV0IG9wdGlvbnMgPSB0aXRsZXMubWFwKCB0aXRsZSA9PlxuXHRcdFx0KHtcblx0XHRcdFx0dmFsdWU6IHRpdGxlLFxuXHRcdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRcdHRleHQ6IHRpdGxlLFxuXHRcdFx0XHRjb250ZW50OiB0aXRsZSxcblx0XHRcdFx0b25DbGljazogKCkgPT4gZXhhbXBsZXMuc2VsZWN0KHRpdGxlKVxuXHRcdFx0fSkpO1xuXG5cdFx0bGV0IGRpcnR5QnV0dG9ucyA9ICgpID0+IHtcblx0XHRcdGlmICghZGlydHkpIHJldHVybjtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxNZW51IHNlY29uZGFyeSBzdHlsZT17eyBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLCByaWdodDogXCIxcmVtXCIsIHRvcDogXCIzcHhcIiwgbWFyZ2luOiAwIH19PlxuXHRcdFx0XHRcdDxCdXR0b24gbmVnYXRpdmUgb25DbGljaz17KCkgPT4gdGhpcy5yZXZlcnQoKX0+PHU+UjwvdT5ldmVydDwvQnV0dG9uPlxuXHRcdFx0XHRcdDxCdXR0b24gcG9zaXRpdmUgb25DbGljaz17KCkgPT4gdGhpcy5zYXZlKCl9Pjx1PlM8L3U+YXZlPC9CdXR0b24+XG5cdFx0XHRcdDwvTWVudT5cblx0XHRcdCk7XG5cdFx0fTtcblxuXHRcdGxldCBjb21waWxlQnV0dG9uID0gKCkgPT4ge1xuXHRcdFx0aWYgKG91dHB1dCkgcmV0dXJuO1xuXHRcdFx0cmV0dXJuIDxCdXR0b25cblx0XHRcdFx0XHRzdHlsZT17eyBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLCAgd2lkdGg6IFwiNGVtXCIsIGxlZnQ6IFwiY2FsYyg1MCUgLSAyZW0pXCIsIHRvcDogXCI1MCVcIiB9fVxuXHRcdFx0XHRcdG9uQ2xpY2s9eygpID0+IHRoaXMuY29tcGlsZSgpfVxuXHRcdFx0XHRcdGljb249XCJyaWdodCBjaGV2cm9uXCIvPjtcblx0XHR9O1xuXG5cdFx0cmV0dXJuIChcblx0XHQ8R3JpZCBzdHJldGNoZWQgcGFkZGVkIGNsYXNzTmFtZT1cImZ1bGxIZWlnaHRcIj5cblx0XHRcdDxHcmlkLlJvdyBzdHlsZT17eyBoZWlnaHQ6IFwiMnJlbVwiLCBwYWRkaW5nVG9wOiBcIjByZW1cIiB9fSBjbGFzc05hbWU9XCJ1aSBpbnZlcnRlZCBhdHRhY2hlZCBtZW51XCI+XG5cdFx0XHRcdDxHcmlkLkNvbHVtbiB3aWR0aD17N30+XG5cdFx0XHRcdFx0PE1lbnUgaW52ZXJ0ZWQgYXR0YWNoZWQgZmx1aWQ+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtPkV4YW1wbGU6PC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0XHQ8RHJvcGRvd24gaXRlbSBzZWxlY3Rpb24gb3B0aW9ucz17b3B0aW9uc30gdmFsdWU9e3NlbGVjdGVkfSBzdHlsZT17eyB3aWR0aDogXCIyMGVtXCIgfX0vPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbSBvbkNsaWNrPXsoKSA9PiB0aGlzLmRlbGV0ZSgpfT48dT5EPC91PmVsZXRlPC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtIG9uQ2xpY2s9eygpID0+IHRoaXMucmVuYW1lKCl9PlJlbmFtZTwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbSBvbkNsaWNrPXsoKSA9PiB0aGlzLmR1cGxpY2F0ZSgpfT5EdXBsaWNhdGU8L01lbnUuSXRlbT5cblx0XHRcdFx0XHQ8L01lbnU+XG5cdFx0XHRcdDwvR3JpZC5Db2x1bW4+XG5cdFx0XHRcdDxHcmlkLkNvbHVtbiB3aWR0aD17Mn0+XG5cdFx0XHRcdFx0PE1lbnUgaW52ZXJ0ZWQgYXR0YWNoZWQgZmx1aWQ+XG5cdFx0XHRcdFx0XHQ8U3BhY2VyIGZsdWlkLz5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0gb25DbGljaz17KCkgPT4gdGhpcy5jcmVhdGUoKX0+PHU+TjwvdT5ldzwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdFx0PFNwYWNlciBmbHVpZC8+XG5cdFx0XHRcdFx0PC9NZW51PlxuXHRcdFx0XHQ8L0dyaWQuQ29sdW1uPlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezd9PlxuXHRcdFx0XHRcdDxNZW51IGludmVydGVkIGF0dGFjaGVkIGZsdWlkPlxuXHRcdFx0XHRcdFx0PFNwYWNlciBmbHVpZC8+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtIG9uQ2xpY2s9eygpID0+IHRoaXMubG9hZCgpfT5SZWxvYWQ8L01lbnUuSXRlbT5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0gb25DbGljaz17KCkgPT4gdGhpcy5yZXNldCgpfT5SZXNldDwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdDwvTWVudT5cblx0XHRcdFx0PC9HcmlkLkNvbHVtbj5cblx0XHRcdDwvR3JpZC5Sb3c+XG5cdFx0XHQ8R3JpZC5Sb3cgc3R5bGU9e3sgaGVpZ2h0OiBcImNhbGMoMTAwJSAtIDNyZW0pXCIgfX0+XG5cdFx0XHRcdDxHcmlkLkNvbHVtbiB3aWR0aD17OH0+XG5cdFx0XHRcdFx0PFRhYmJhYmxlVGV4dEFyZWFcblx0XHRcdFx0XHRcdGNsYXNzTmFtZT1cInVpIHNlZ21lbnRcIlxuXHRcdFx0XHRcdFx0dmFsdWU9e2NvZGV9XG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17KGV2ZW50KSA9PiBleGFtcGxlcy51cGRhdGUoZXhhbXBsZXMuc2VsZWN0ZWQsIGV2ZW50LnRhcmdldC52YWx1ZSwgXCJTS0lQX1NBVkVcIil9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHR7ZGlydHlCdXR0b25zKCl9XG5cdFx0XHRcdDwvR3JpZC5Db2x1bW4+XG5cdFx0XHRcdDxHcmlkLkNvbHVtbiB3aWR0aD17OH0+XG5cdFx0XHRcdFx0PFRleHRBcmVhIGNsYXNzTmFtZT1cInVpIHNlZ21lbnRcIiB2YWx1ZT17b3V0cHV0fS8+XG5cdFx0XHRcdDwvR3JpZC5Db2x1bW4+XG5cdFx0XHRcdHtjb21waWxlQnV0dG9uKCl9XG5cdFx0XHQ8L0dyaWQuUm93PlxuXHRcdDwvR3JpZD5cblx0KTt9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL1NwZWxsRWRpdG9yLmpzeCIsIi8vIEV4cG9ydCBhbGwgc3RhbmRhcmQgXCJzcGVsbFwiIHJ1bGVzLlxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuLi8uLi9Ub2tlbml6ZXIuanNcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlLmpzXCI7XG5cbi8vIExvYWQgYWxsIHN0YW5kYXJkIHJ1bGVzIGZpbGVzLlxuaW1wb3J0IFwiLi9jb3JlXCI7XG5pbXBvcnQgXCIuL2xpc3RzXCI7XG5pbXBvcnQgXCIuL29wZXJhdG9yc1wiO1xuaW1wb3J0IFwiLi9pZlwiO1xuaW1wb3J0IFwiLi9zdGF0ZW1lbnRzXCI7XG5pbXBvcnQgXCIuL3R5cGVzXCI7XG5pbXBvcnQgXCIuL0pTWFwiO1xuXG4vLyBDcmVhdGUgcGFyc2VyIHdoaWNoIGNvbWJpbmVzIGFsbCBvZiB0aGUgYWJvdmUuLi5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JNb2R1bGUoXCJzcGVsbFwiKTtcbi8vIC4uLndoaWNoIGRlcGVuZHMgb24gcnVsZXMgbG9hZGVkIGFib3ZlLi4uXG5wYXJzZXIuaW1wb3J0KFwiY29yZVwiLCBcImxpc3RzXCIsIFwib3BlcmF0b3JzXCIsIFwiaWZcIiwgXCJzdGF0ZW1lbnRzXCIsIFwidHlwZXNcIiwgXCJKU1hcIik7XG4vLyAuLi5hcyB0aGUgZGVmYXVsdCBleHBvcnRcbmV4cG9ydCBkZWZhdWx0IHBhcnNlcjtcblxuLy8gU3RpY2sgb3RoZXIgc3R1ZmYgb24gYHdpbmRvd2AgZm9yIHJlZmxlY3Rpb24gYW5kIGFkLWhvYyB0ZXN0aW5nLlxuaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0T2JqZWN0LmFzc2lnbih3aW5kb3csIHtcblx0XHRUb2tlbml6ZXIsXG5cdFx0UnVsZSxcblx0XHRQYXJzZXIsXG5cblx0XHR0b2tlbml6ZTogVG9rZW5pemVyLnRva2VuaXplLmJpbmQoZXhwb3J0cy5Ub2tlbml6ZXIpLFxuXHRcdHBhcnNlcixcblx0XHRwYXJzZTogcGFyc2VyLnBhcnNlLmJpbmQocGFyc2VyKSxcblx0XHRjb21waWxlOiBwYXJzZXIuY29tcGlsZS5iaW5kKHBhcnNlciksXG5cdH0pO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL2luZGV4LmpzIiwiLyogU3RvcmUgb2YgZXhhbXBsZSBzcGVsbCBjb2RlIGZyYWdtZW50cy4gKi9cbmltcG9ydCBtb2J4LCB7IG9ic2VydmFibGUsIGNvbXB1dGVkIH0gZnJvbSBcIm1vYnhcIjtcblxuLy8gTWFrZSBQYXJzZXIgYW5kIFRva2VuaXplciBXQVJOIGFzIHdlIHJ1blxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vUGFyc2VyXCI7XG5QYXJzZXIuV0FSTiA9IHRydWU7XG5QYXJzZXIuREVCVUcgPSB0cnVlO1xuUGFyc2VyLlRJTUUgPSB0cnVlO1xuXG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuLi9Ub2tlbml6ZXJcIjtcblRva2VuaXplci5XQVJOID0gdHJ1ZTtcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeGFtcGxlU3RvcmUge1xuXHQvLyBDVVJSRU5UIGV4YW1wbGVzXG5cdEBvYnNlcnZhYmxlIGV4YW1wbGVzID0ge307XG5cdC8vIEV4YW1wbGVzIGFzIG9mIGxhc3Qgc2F2ZSAoZm9yIHJldmVyKVxuXHRAb2JzZXJ2YWJsZSBfc2F2ZWRFeGFtcGxlcyA9IHt9O1xuXHQvLyBTZWxlY3RlZCBleGFtcGxlIGtleS5cblx0QG9ic2VydmFibGUgc2VsZWN0ZWQgPSBcIlwiO1xuXHQvLyBDb21waWxlZCBvdXRwdXQuXG5cdEBvYnNlcnZhYmxlIG91dHB1dCA9IFwiXCI7XG5cblx0Ly8gUmV0dXJuIGp1c3QgdGhlIHRpdGxlcyBvZiB0aGUgZXhhbXBsZXMuXG5cdEBjb21wdXRlZCBnZXQgdGl0bGVzKCkge1xuXHRcdHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmV4YW1wbGVzKTtcblx0fVxuXG5cdC8vIFJldHVybiB0aGUgY29kZSBmb3IgdGhlIGN1cnJlbnQgZXhhbXBsZVxuXHRAY29tcHV0ZWQgZ2V0IGNvZGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZXhhbXBsZXNbdGhpcy5zZWxlY3RlZF07XG5cdH1cblxuXHQvLyBJcyBBTllUSElORyBkaXJ0eT9cblx0QGNvbXB1dGVkIGdldCBkaXJ0eSgpIHtcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5fc2F2ZWRFeGFtcGxlcykgIT09IEpTT04uc3RyaW5naWZ5KHRoaXMuZXhhbXBsZXMpO1xuXHR9XG5cblx0Ly8gUmVzZXQgYWxsIGV4YW1wbGVzIGZyb20gbG9jYWxTdG9yYWdlLlxuXHRyZXNldCgpIHtcblx0XHRkZWxldGUgbG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZXM7XG5cdFx0ZGVsZXRlIGxvY2FsU3RvcmFnZS5zcGVsbEVkaXRvckV4YW1wbGU7XG5cdFx0d2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuXHR9XG5cblx0Ly8gTG9hZCBleGFtcGxlc1xuXHRsb2FkKCkge1xuXHRcdC8vIExvYWQgZXhhbXBsZXMgZnJvbSBsb2NhbFN0b3JhZ2Vcblx0XHR0aGlzLmV4YW1wbGVzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlc1xuXHRcdFx0fHwgJ3tcIkZvb1wiOlwiZGVmaW5lIHR5cGUgRm9vXCIsIFwiQmFyXCI6XCJkZWZpbmUgdHlwZSBCYXJcIn0nKTtcblxuXHRcdC8vIFNhdmUgYSBjb3B5IG9mIGV4YW1wbGVzIGZvciByZXZlcnRcblx0XHR0aGlzLl9zYXZlZEV4YW1wbGVzID0gdGhpcy5leGFtcGxlcztcblxuXHRcdC8vIExvYWQgc2VsZWN0ZWQgZXhhbXBsZSBuYW1lXG5cdFx0dGhpcy5zZWxlY3QobG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZSk7XG5cdH1cblxuXHQvLyBTYXZlIGN1cnJlbnQgZXhhbXBsZXMuXG5cdHNhdmUoKSB7XG5cdFx0bG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZXMgPSBKU09OLnN0cmluZ2lmeSh0aGlzLmV4YW1wbGVzKTtcblxuXHRcdC8vIFNhdmUgYSBjb3B5IG9mIGV4YW1wbGVzIGZvciByZXZlcnRcblx0XHR0aGlzLl9zYXZlZEV4YW1wbGVzID0gdGhpcy5leGFtcGxlcztcblx0fVxuXG5cdC8vIFJldmVydCB0aGUgY3VycmVudCBleGFtcGxlXG5cdHJldmVydChleGFtcGxlID0gdGhpcy5zZWxlY3RlZCkge1xuXHRcdHRoaXMudXBkYXRlKGV4YW1wbGUsIHRoaXMuX3NhdmVkRXhhbXBsZXNbZXhhbXBsZV0pO1xuXHR9XG5cblx0Ly8gU2VsZWN0IGEgZGlmZmVyZW50IGV4YW1wbGUuXG5cdHNlbGVjdChleGFtcGxlKSB7XG5cdFx0aWYgKCFleGFtcGxlIHx8IHRoaXMuZXhhbXBsZXNbZXhhbXBsZV0gPT0gbnVsbCkgZXhhbXBsZSA9IE9iamVjdC5rZXlzKHRoaXMuZXhhbXBsZXMpWzBdIHx8IFwiXCI7XG5cdFx0dGhpcy5zZWxlY3RlZCA9IGxvY2FsU3RvcmFnZS5zcGVsbEVkaXRvckV4YW1wbGUgPSBleGFtcGxlO1xuXHRcdHRoaXMub3V0cHV0ID0gXCJcIjtcblx0fVxuXG5cdC8vIENyZWF0ZSBhIG5ldyBleGFtcGxlLlxuXHQvLyBTYXZlcyBhbmQgc2VsZWN0cyB0aGUgZXhhbXBsZSBhdXRvbWF0aWNhbGx5LlxuXHR1cGRhdGUobmFtZSwgY29kZSwgc2tpcFNhdmUpIHtcblx0XHR0aGlzLmV4YW1wbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5leGFtcGxlcywgeyBbIG5hbWUgXTogY29kZSB9KTtcblx0XHR0aGlzLnNlbGVjdChuYW1lKTtcblx0XHR0aGlzLm91dHB1dCA9IFwiXCI7XG5cdFx0aWYgKCFza2lwU2F2ZSkgdGhpcy5zYXZlKCk7XG5cdH1cblxuXHQvLyBEZWxldGUgYW4gZXhhbXBsZS5cblx0Ly8gU2F2ZXMgYW5kIHNlbGVjdHMgYW5vdGhlciBleGFtcGxlIGF1dG9tYXRpY2FsbHkuXG5cdGRlbGV0ZShuYW1lID0gdGhpcy5zZWxlY3RlZCwgc2hvd0NvbmZpcm0pIHtcblx0XHRpZiAoc2hvd0NvbmZpcm0gJiYgIWNvbmZpcm0oYFJlYWxseSBkZWxldGUgZXhhbXBsZSAke25hbWV9P2ApKSByZXR1cm47XG5cdFx0bGV0IGV4YW1wbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5leGFtcGxlcyk7XG5cdFx0ZGVsZXRlIGV4YW1wbGVzW25hbWVdO1xuXHRcdHRoaXMuZXhhbXBsZXMgPSBleGFtcGxlcztcblx0XHR0aGlzLnNhdmUoKTtcblx0XHR0aGlzLnNlbGVjdCgpO1xuXHR9XG5cblx0Ly8gQ3JlYXRlIGEgbmV3IGV4YW1wbGUuXG5cdGNyZWF0ZShuYW1lLCBjb2RlID0gXCJcIikge1xuXHRcdC8vIElmIG5vIG5hbWUsIHByb21wdC5cblx0XHRpZiAoIW5hbWUpIG5hbWUgPSBwcm9tcHQoXCJOYW1lIGZvciB0aGlzIGV4YW1wbGU/XCIpO1xuXHRcdC8vIEZvcmdldCBpdCBpZiBubyBuYW1lLlxuXHRcdGlmICghbmFtZSkgcmV0dXJuO1xuXG5cdFx0dGhpcy51cGRhdGUobmFtZSwgY29kZSk7XG5cdH1cblxuXHQvLyBSZW5hbWUgYW4gZXhhbXBsZS5cblx0Ly8gU2VsZWN0cyBhbmQgc2F2ZXMgYXV0b21hdGljYWxseS5cblx0cmVuYW1lKG9sZE5hbWUgPSB0aGlzLnNlbGVjdGVkLCBuZXdOYW1lKSB7XG5cdFx0Ly8gSWYgbm8gbmV3IG5hbWUsIHByb21wdC5cblx0XHRpZiAoIW5ld05hbWUpIG5ld05hbWUgPSBwcm9tcHQoXCJOZXcgbmFtZSBmb3IgdGhpcyBleGFtcGxlP1wiLCBvbGROYW1lKTtcblxuXHRcdC8vIEZvcmdldCBpdCBpZiBubyBuYW1lIHN1cHBsaWVkIG9yIG5hbWUgaXMgdGhlIHNhbWVcblx0XHRpZiAoIW5ld05hbWUgfHwgbmV3TmFtZSA9PT0gb2xkTmFtZSkgcmV0dXJuO1xuXHRcdGlmICh0aGlzLmV4YW1wbGVzW25ld05hbWVdKSByZXR1cm4gY29uc29sZS53YXJuKGBleGFtcGxlcy5yZW5hbWUoXCIke25ld05hbWV9XCIpOiBuYW1lIGFscmVhZHkgaW4gdXNlYCk7XG5cblx0XHRsZXQgY29kZSA9IHRoaXMuZXhhbXBsZXNbb2xkTmFtZV07XG5cdFx0dGhpcy5kZWxldGUob2xkTmFtZSk7XG5cdFx0dGhpcy51cGRhdGUobmV3TmFtZSwgY29kZSk7XG5cdH1cblxuXHQvLyBEdXBsaWNhdGUgYW4gZXhhbXBsZS5cblx0ZHVwbGljYXRlKG9sZE5hbWUgPSB0aGlzLnNlbGVjdGVkLCBuZXdOYW1lKSB7XG5cdFx0Ly8gSWYgbm8gbmV3IG5hbWUsIHByb21wdC5cblx0XHRpZiAoIW5ld05hbWUpIG5ld05hbWUgPSBwcm9tcHQoXCJOZXcgbmFtZSBmb3IgZHVwbGljYXRlIGV4YW1wbGU/XCIsIG9sZE5hbWUpO1xuXHRcdC8vIEZvcmdldCBpdCBpZiBubyBuYW1lIHN1cHBsaWVkIG9yIG5hbWUgaXMgdGhlIHNhbWVcblx0XHRpZiAoIW5ld05hbWUgfHwgbmV3TmFtZSA9PT0gb2xkTmFtZSkgcmV0dXJuO1xuXHRcdGlmICh0aGlzLmV4YW1wbGVzW25ld05hbWVdKSByZXR1cm4gY29uc29sZS53YXJuKGBleGFtcGxlcy5yZW5hbWUoXCIke25ld05hbWV9XCIpOiBuYW1lIGFscmVhZHkgaW4gdXNlYCk7XG5cblx0XHR0aGlzLnVwZGF0ZShuZXdOYW1lLCB0aGlzLmNvZGUpO1xuXHR9XG5cblx0Ly8gQ29tcGlsZSB0aGUgY3VycmVudCBleGFtcGxlLCBwbGFjaW5nIGl0IGluIG91ciBgb3V0cHV0YC5cbi8vVE9ETzogc29tZSB3YXkgdG8gZG8gdGhpcyBhdXRvbWF0aWNhbGx5IHcvIFwib3V0cHV0XCIgP1xuXHRjb21waWxlKCkge1xuXHRcdHRoaXMub3V0cHV0ID0gXCIuLi5jb21waWxpbmcuLi5cIjtcblx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdGxldCByZXN1bHQgPSBwYXJzZXIucGFyc2UoXCJzdGF0ZW1lbnRzXCIsIHRoaXMuY29kZSk7XG5cdFx0XHRpZiAoIXJlc3VsdCkge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oXCJDYW4ndCBwYXJzZSFcIik7XG5cdFx0XHRcdHRoaXMub3V0cHV0ID0gXCJDYW4ndCBwYXJzZSBzdGF0ZW1lbnRzXCI7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5pbmZvKFwiUmVzdWx0XCIsIHJlc3VsdCk7XG5cdFx0XHRcdHRoaXMub3V0cHV0ID0gcmVzdWx0LnRvU291cmNlKHBhcnNlcik7XG5cdFx0XHR9XG5cdFx0fSwgMTAwKTtcblx0fVxuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL0V4YW1wbGVTdG9yZS5qcyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGZcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW5ldy1mdW5jXG4gIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbmlmICh0eXBlb2YgX19nID09ICdudW1iZXInKSBfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qc1xuLy8gbW9kdWxlIGlkID0gNDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vL1xuLy8gIDxTcGFjZXI+IGNvbXBvbmVudCBmb3IgdXNlIHdpdGggb2FrLlxuLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gXCJwcm9wLXR5cGVzXCI7XG5pbXBvcnQgeyBjbGFzc05hbWVzIH0gZnJvbSBcIi4vdXRpbFwiO1xuXG5pbXBvcnQgXCIuL1NwYWNlci5sZXNzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNwYWNlcihwcm9wcykge1xuICBjb25zdCB7XG4gICAgY2xhc3NOYW1lLFxuICAgIGFwcGVhcmFuY2UsIHNpemUsIHdpZHRoLCBoZWlnaHQsXG4gICAgaW5saW5lLCBmbHVpZCwgdGlueSwgc21hbGwsIG1lZGl1bSwgbGFyZ2UsIGh1Z2UsIG1hc3NpdmVcbiAgfSA9IHByb3BzO1xuXG4gIGNvbnN0IHNwYWNlclByb3BzID0ge1xuICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lcyhjbGFzc05hbWUsIFwib2FrXCIsIHNpemUsIGFwcGVhcmFuY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHsgaW5saW5lLCBmbHVpZCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInNwYWNlclwiKSxcbiAgICBzdHlsZToge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIDxkaXYgey4uLnNwYWNlclByb3BzfS8+O1xufVxuXG5TcGFjZXIucHJvcFR5cGVzID0ge1xuICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIGFwcGVhcmFuY2U6IFByb3BUeXBlcy5zdHJpbmcsXG4gIHNpemU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLFxuICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIsXG5cbiAgaW5saW5lOiBQcm9wVHlwZXMuYm9vbCxcbiAgZmx1aWQ6IFByb3BUeXBlcy5ib29sLFxuXG59O1xuXG5TcGFjZXIuZGVmYXVsdFByb3BzID0ge1xuICBzaXplOiBcIm1lZGl1bVwiXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL1NwYWNlci5qc3giLCJpbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgcHJvcFR5cGVzIGZyb20gXCJwcm9wLXR5cGVzXCI7XG5pbXBvcnQgeyBUZXh0QXJlYSB9IGZyb20gJ3NlbWFudGljLXVpLXJlYWN0J1xuXG4vL1xuLy9cdCMgPFRhYmJhYmxlVGV4dEFyZWE+IC0tIDxTVUkuVGV4dEFyZWE+IGluIHdoaWNoIHlvdSBjYW4gdHlwZSBhIHRhYiBjaGFyYWN0ZXI6XG4vL1x0LSBJZiBub3RoaW5nIGlzIHNlbGVjdGVkLCBpbnNlcnRzIGEgdGFiIGNoYXJhY3RlclxuLy9cdC0gSWYgYW55dGhpbmcgaXMgc2VsZWN0ZWQsIGluc2VydHMgdGFiIGNoYXJhY3RlcnMgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZShzKVxuLy9cdC0gSWYgc2hpZnQga2V5IGlzIGRvd24sIGluc2VydHMgdGFiIGNoYXJhY3RlcnMgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZShzKS5cbi8vXG4vL1x0IyMjIFByb3BlcnRpZXNcbi8vXHQtIGBzYXZlYCAocmVxdWlyZWQpIC0tIGZ1bmN0aW9uIHVzZWQgdG8gc2F2ZSB0aGUgcmVzdWx0cyBvbiBrZXlwcmVzc1xuLy9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhYmJhYmxlVGV4dEFyZWEgZXh0ZW5kcyBUZXh0QXJlYSB7XG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gPFRleHRBcmVhIHsuLi50aGlzLnByb3BzfSBvbktleURvd249e3RoaXMub25LZXlEb3dufSAvPjtcblx0fVxuXG5cdC8vIERvIE5PVCBleGl0IG9uIHRhYiAtLSBpbnNlcnQgb3IgcmVtb3ZlIHRhYihzKSB2YWx1ZSBpbnN0ZWFkLlxuXHRvbktleURvd24gPSAoZXZlbnQpID0+IHtcblxuLy9UT0RPIGZpcmUgYHRoaXMucHJvcHMub25LZXlEb3duYCBpZiBkZWZpbmVkLi4uXG5cdFx0Ly8gRm9yZ2V0IGl0IGlmIG5vdCBhIHRhYlxuXHRcdGlmIChldmVudC5rZXlDb2RlICE9PSA5KSByZXR1cm47XG5cblx0XHQvLyBwcmV2ZW50IGRlZmF1bHQgc28gd2UgZG9uJ3QgZXhpdCB0aGUgZmllbGRcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0Ly8gZmlndXJlIG91dCB0aGUgdGV4dCByYW5nZVxuXHRcdHZhciBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuXHRcdHZhciB0ZXh0ID0gZWxlbWVudC52YWx1ZTtcblx0XHR2YXIgc3RhcnQgPSBlbGVtZW50LnNlbGVjdGlvblN0YXJ0O1xuXHRcdHZhciBlbmQgPSBlbGVtZW50LnNlbGVjdGlvbkVuZDtcblxuXHRcdC8vIFJlcGxhY2VtZW50IHRleHRcblx0XHRsZXQgbmV3VGV4dCA9IFwiXCIsIHNlbGVjdGlvblN0YXJ0ID0gc3RhcnQsIHNlbGVjdGlvbkVuZCA9IGVuZDtcblxuXHRcdC8vIElmIHNlbGVjdGlvbiBpcyBlbXB0eSxcblx0XHRpZiAoc3RhcnQgPT09IGVuZCAmJiAhZXZlbnQuc2hpZnRLZXkpIHtcblx0XHRcdG5ld1RleHQgPSBcIlxcdFwiO1xuXHRcdFx0c2VsZWN0aW9uU3RhcnQgPSBzZWxlY3Rpb25FbmQgPSBlbmQgKyAxO1xuXHRcdH1cblx0XHQvLyBvdGhlcndpc2UgaW5kZW50L2RlLWluZGVudCBhbGwgb2YgdGhlIGxpbmVzXG5cdFx0ZWxzZSB7XG5cdFx0Ly8gdXNlIHN0YXJ0IGFuZCBlbmQgb2YgbGluZShzKVxuLy9jb25zb2xlLmluZm8oYHN0YXJ0OiAke3N0YXJ0fSA6JHt0ZXh0W3N0YXJ0XX06ICAgZW5kOiAke2VuZH0gOiAke3RleHRbZW5kXX06YCk7XG5cdFx0XHRpZiAodGV4dFtzdGFydF0gIT09IFwiXFxuXCIpIHN0YXJ0ID0gdGV4dC5sYXN0SW5kZXhPZihcIlxcblwiLCBzdGFydCkgKyAxO1xuXHRcdFx0aWYgKHRleHRbZW5kLTFdID09PSBcIlxcblwiKSBlbmQtLTtcblx0XHRcdGVsc2UgaWYgKHRleHRbZW5kKzFdICE9PSBcIlxcblwiKSBlbmQgPSB0ZXh0LmluZGV4T2YoXCJcXG5cIiwgZW5kKSAtIDE7XG4vL2NvbnNvbGUuaW5mbyhgc3RhcnQ6ICR7c3RhcnR9IDoke3RleHRbc3RhcnRdfTogICBlbmQ6ICR7ZW5kfSA6ICR7dGV4dFtlbmRdfTpgKTtcblxuXHRcdFx0bGV0IGxpbmVzID0gdGV4dC5zbGljZShzdGFydCwgZW5kKS5zcGxpdChcIlxcblwiKTtcblx0XHRcdC8vIGlmIHNoaWZ0IGtleSBpcyBkb3duLCBSRU1PVkUgYSB0YWIgZnJvbSBlYWNoIGxpbmVcblx0XHRcdGlmIChldmVudC5zaGlmdEtleSkge1xuXHRcdFx0XHRsaW5lcyA9IGxpbmVzLm1hcChsaW5lID0+IGxpbmVbMF0gPT09IFwiXFx0XCIgPyBsaW5lLnN1YnN0cigxKSA6IGxpbmUpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gb3RoZXJ3aXNlIEFERCBhIHRhYiB0byBlYWNoIGxpbmVcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRsaW5lcyA9IGxpbmVzLm1hcChsaW5lID0+IFwiXFx0XCIgKyBsaW5lKTtcblx0XHRcdH1cblx0XHRcdHNlbGVjdGlvblN0YXJ0ID0gc3RhcnQ7XG5cdFx0XHRuZXdUZXh0ID0gbGluZXMuam9pbihcIlxcblwiKTtcblx0XHRcdHNlbGVjdGlvbkVuZCA9IHNlbGVjdGlvblN0YXJ0ICsgbmV3VGV4dC5sZW5ndGggKyAxO1xuXHRcdH1cblxuXHRcdC8vIFVwZGF0ZSBpbnB1dCB2YWx1ZS5cblx0XHRlbGVtZW50LnZhbHVlIFx0PSB0ZXh0LnN1YnN0cigwLCBzdGFydClcblx0XHRcdFx0XHRcdCsgbmV3VGV4dFxuXHRcdFx0XHRcdFx0KyB0ZXh0LnN1YnN0cihlbmQpO1xuXG5cdFx0Ly8gVXBkYXRlIHRoZSBzZWxlY3Rpb25cblx0XHRlbGVtZW50LnNlbGVjdGlvblN0YXJ0ID0gc2VsZWN0aW9uU3RhcnQ7XG5cdFx0ZWxlbWVudC5zZWxlY3Rpb25FbmQgPSBzZWxlY3Rpb25FbmQ7XG5cblx0XHQvLyBEZWxlZ2F0ZSB0byBgcHJvcHMub25DaGFuZ2VgIHRvIHNhdmUgdGhlIHZhbHVlIG91dHNpZGUgb2YgdGhlIGNvbnRyb2xcblx0XHRpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkgdGhpcy5wcm9wcy5vbkNoYW5nZShldmVudCk7XG5cdH1cblxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC9UYWJiYWJsZVRleHRBcmVhLmpzeCIsIi8vIENvbW1vbiBpbXBvcnRzXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcblxuLy8gUGFyc2VyXG5pbXBvcnQgcGFyc2VyIGZyb20gXCIuLi9ydWxlcy9zcGVsbC9pbmRleC5qc1wiO1xuXG4vLyBBcHAtc3BlY2lmaWMgaW1wb3J0c1xuaW1wb3J0IFNwZWxsRWRpdG9yIGZyb20gXCIuL1NwZWxsRWRpdG9yLmpzeFwiO1xuXG4vLyBLaWNrIG9mZiBvdXIgdG9wLWxldmVsIGVsZW1lbnRcblJlYWN0RE9NLnJlbmRlcihcbiAgPFNwZWxsRWRpdG9yIC8+LFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVhY3Qtcm9vdCcpXG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC9pbmRleC5qc3giLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICBSZWFjdCBVdGlsaXR5IGZ1bmN0aW9uc1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIGBjbGFzc05hbWVzYCwgY29uY2VwdCBzdG9sZW4gZnJvbTogIGh0dHA6Ly9qZWR3YXRzb24uZ2l0aHViLmlvL2NsYXNzbmFtZXNcbmV4cG9ydCBmdW5jdGlvbiBjbGFzc05hbWVzICguLi5hcmdzKSB7XG4gIHJldHVybiBhcmdzLm1hcCggYXJnID0+IHtcbiAgICBpZiAoIWFyZykgcmV0dXJuIFwiXCI7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYXJnKSkgcmV0dXJuIGNsYXNzTmFtZXMoLi4uYXJnKTtcbiAgICBzd2l0Y2ggKHR5cGVvZiBhcmcpIHtcbiAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgIGNhc2UgXCJzdHJpbmdcIjogIHJldHVybiBhcmc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoYXJnKS5tYXAoIGtleSA9PiBhcmdba2V5XSA/IGtleSA6IFwiXCIpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihCb29sZWFuKVxuICAgICAgICAgICAgICAgIC5qb2luKFwiIFwiKTtcbiAgICB9XG4gIH0pLmZpbHRlcihCb29sZWFuKVxuICAgIC5qb2luKFwiIFwiKTtcbn1cblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC91dGlsLmpzIiwiLy8gTWVtb2l6ZS9mb3JnZXQgc2VtYW50aWNzLlxuXG4vLyBSZXR1cm4gYSBtZW1vaXppbmcgZ2V0dGVyIGZ1bmN0aW9uLlxuLy8gVEVTVE1FXG5leHBvcnQgZnVuY3Rpb24gbWVtb2l6ZWQocHJvcGVydHksIGdldHRlcikge1xuXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHRoaXNbcHJvcGVydHldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHZhciB2YWx1ZSA9IGdldHRlci5hcHBseSh0aGlzKTtcblx0XHRcdGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdC8vIERlZmluZSBzbyB0aGF0IHdlIGNhbiBiZSBkZWxldGVkIGFuZCByZS1kZWZpbmVkLCBidXQgbm90IHNldCBvciBlbnVtZXJhdGVkLlxuXHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcGVydHksIHsgdmFsdWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRoaXNbcHJvcGVydHldO1xuXHR9XG59XG5cblxuLy8gUmV0dXJuIGEgbWVtb2l6ZSBmdW5jdGlvbiBmb3IgdXNlIGFzIGEgZ2V0dGVyIGluIGEgYE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgpYFxuLy8gVEVTVE1FXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lTWVtb2l6ZWQocHJvcGVydHksIGdldHRlcikge1xuXHRyZXR1cm4ge1xuXHRcdGdldCA6IG1lbW9pemVkKHByb3BlcnR5LCBnZXR0ZXIpXG5cdH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9tZW1vaXplLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIHBhcnNpbmcganN4XG4vL1xuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuLi8uLi9Ub2tlbml6ZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5cbi8vIENyZWF0ZSBcIkpTWFwiIHBhcnNlci5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JNb2R1bGUoXCJKU1hcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwianN4XCIsXG4gICAgYWxpYXM6IFsgXCJleHByZXNzaW9uXCIsIFwic3RhdGVtZW50XCIgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MganN4RWxlbWVudCBleHRlbmRzIFJ1bGUge1xuICAgICAgLy8gVGV4dCBzdHJpbmdzIGdldCBlbmNvZGVkIGFzIGB0ZXh0YCBvYmplY3RzIGluIHRoZSB0b2tlbiBzdHJlYW0uXG4gICAgICBwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQgPSB0b2tlbnMubGVuZ3RoKSB7XG4gICAgICAgIGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG4gICAgICAgIGlmICghKHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEVsZW1lbnQpKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSh7XG4gICAgICAgICAgbWF0Y2hlZDogdG9rZW4sXG4gICAgICAgICAgbmV4dFN0YXJ0OiBzdGFydCArIDFcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgb3VyIGF0dHJpYnV0ZXMgdG8gc291cmNlLlxuICAgICAgLy8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBubyBhdHRyaWJ1dGVzLlxuICAgICAgYXR0cnNUb1NvdXJjZShqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIGxldCBhdHRyaWJ1dGVzID0ganN4RWxlbWVudC5hdHRyaWJ1dGVzO1xuICAgICAgICBpZiAoIWF0dHJpYnV0ZXMgfHwgIWF0dHJpYnV0ZXMubGVuZ3RoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgICAgIGxldCBhdHRycyA9IGF0dHJpYnV0ZXMubWFwKCAoeyBuYW1lLCB2YWx1ZSB9KSA9PiB7XG4gICAgICAgICAgLy8gaWYgTk8gdmFsdWUsIGFzc3VtZSBpdCdzIGEgdmFyaWFibGUgb2YgdGhlIHNhbWUgbmFtZVxuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB2YWx1ZSA9IG5hbWU7XG4gICAgICAgICAgLy8gaWYgaXQncyBhbiBhcnJheSwgaXQncyBhIHNwZWxsIGV4cHJlc3Npb24sIHBvc3NpYmx5IHdpdGggbmVzdGVkIEpTWCBlbGVtZW50cy4uLlxuICAgICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5qc3hFeHByZXNzaW9uVG9Tb3VyY2UodmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBlbHNlIGlmIGEgSlNYIGVsZW1lbnQsIHJlY3Vyc2VcbiAgICAvL1RPRE86IGluZGVudC4uLlxuICAgICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9Tb3VyY2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGlmIGEgbnVtYmVyIG9yIFRleHQgbGl0ZXJhbCwganVzdCB1c2UgaXRcblxuICAgICAgICAgIC8vIHNwZWNpYWwgY2FzZSBgY2xhc3NgIHRvIGBjbGFzc05hbWVgIGJlY2F1c2UgUmVhY3QgaXMgZWZmaW5nIHBlcnNuaWNrZXR5LlxuICAgICAgICAgIGlmIChuYW1lID09PSBcImNsYXNzXCIpIG5hbWUgPSBcImNsYXNzTmFtZVwiO1xuICAgIC8vVE9ETzogZXNjYXBlIG5hbWVzIHdoaWNoIGFyZSBpbnZhbGlkIEpTIGlkZW50aWZpZXJzXG4gICAgICAgICAgcmV0dXJuIGAke25hbWV9OiAke3ZhbHVlfWA7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBgeyAke2F0dHJzLmpvaW4oXCIsIFwiKX0gfWA7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhbiBhcnJheSB3aXRoIHNvdXJjZSBmb3IgZWFjaCBvZiBvdXIgY2hpbGRyZW4uXG4gICAgICAvLyBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIHdlIGRvbid0IGhhdmUgYW55IGNoaWxkcmVuLlxuICAgICAgY2hpbGRyZW5Ub1NvdXJjZShqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIGxldCBjaGlsZHJlbiA9IGpzeEVsZW1lbnQuY2hpbGRyZW47XG4gICAgICAgIGlmICghY2hpbGRyZW4gfHwgY2hpbGRyZW4ubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcbiAgICAvL1RPRE86IGVzY2FwZSBpbm5lciBxdW90ZXMuLi5cbiAgICAgICAgICBpZiAodHlwZW9mIGNoaWxkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAvL2ZvcmdldCBpdCBpZiB3aGl0ZXNwYWNlIG9ubHkuLi4gPz8/XG4gICAgICAgICAgICBsZXQgdGV4dCA9IGNoaWxkLnRyaW0oKTtcbiAgICAgICAgICAgIGlmICghdGV4dCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJldHVybiBgXCIke3RleHR9XCJgO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBUb2tlbml6ZXIuSlNYRWxlbWVudCkge1xuICAgICAgICAgICAgbGV0IGNoaWxkU291cmNlID0gdGhpcy5qc3hFbGVtZW50VG9Tb3VyY2UoY2hpbGQpO1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkU291cmNlLnNwbGl0KFwiXFxuXCIpLmpvaW4oXCJcXG5cXHRcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIFRva2VuaXplci5KU1hFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5qc3hFeHByZXNzaW9uVG9Tb3VyY2UoY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJjaGlsZHJlblRvU291cmNlKCk6IGRvbid0IHVuZGVyc3RhbmQgY2hpbGRcIiArICBjaGlsZCk7XG4gICAgICAgIH0pXG4gICAgICAgIC8vIHJlbW92ZSB1bmRlZmluZWQvZW1wdHkgc3RyaW5nIHJ1bGVzXG4gICAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgSlNYIGV4cHJlc3Npb24gKCBgey4uLn1gICkgdG8gSlMgc291cmNlLlxuICAgICAganN4RXhwcmVzc2lvblRvU291cmNlKGpzeEV4cHJlc3Npb24pIHtcbiAgICAgICAgbGV0IHRva2VucyA9IGpzeEV4cHJlc3Npb24udG9rZW5zO1xuICAgIGNvbnNvbGUuaW5mbyhqc3hFeHByZXNzaW9uLCB0b2tlbnMpO1xuICAgICAgICByZXR1cm4gXCIvXCIgKyBgKlRPRE86ICR7dG9rZW5zLmpvaW4oXCIgXCIpfSpgICsgXCIvXCI7XG4gICAgICB9XG5cbiAgICAgIGpzeEVsZW1lbnRUb1NvdXJjZShqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIC8vIGdldCB0aGUgYml0cyBvZiB0aGUgb3V0cHV0XG4gICAgICAgIGxldCB0YWdOYW1lID0gYFwiJHtqc3hFbGVtZW50LnRhZ05hbWV9XCJgO1xuICAgICAgICBsZXQgYXR0cnMgPSB0aGlzLmF0dHJzVG9Tb3VyY2UoanN4RWxlbWVudCk7XG4gICAgICAgIGxldCBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW5Ub1NvdXJjZShqc3hFbGVtZW50KTtcblxuICAgICAgICBsZXQgb3V0cHV0ID0gYGNyZWF0ZUVsZW1lbnQoJHt0YWdOYW1lfWA7XG4gICAgICAgIGlmICghYXR0cnMgJiYgY2hpbGRyZW4pIGF0dHJzID0gXCJudWxsXCI7XG5cbiAgICAgICAgaWYgKGF0dHJzKSBvdXRwdXQgKz0gYCwgJHthdHRyc31gO1xuICAgICAgICBpZiAoY2hpbGRyZW4pIHtcbiAgICAgICAgICBvdXRwdXQgKz0gXCIsXFxuXFx0XCIgKyBjaGlsZHJlbi5qb2luKFwiLFxcblxcdFwiKSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0ICs9IFwiKVwiXG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5qc3hFbGVtZW50VG9Tb3VyY2UodGhpcy5tYXRjaGVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvSlNYLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBpZiBzdGF0ZW1lbnRzLlxuLy9cblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG4vLyBDcmVhdGUgXCJpZlwiIHBhcnNlci5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JNb2R1bGUoXCJpZlwiKTtcbmV4cG9ydCBkZWZhdWx0IHBhcnNlcjtcblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICB7XG4gICAgbmFtZTogXCJpZlwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJpZiB7Y29uZGl0aW9uOmV4cHJlc3Npb259ICh0aGVufDopPyB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaWZfIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgY29uZGl0aW9uLCBzdGF0ZW1lbnQsIGJsb2NrIH0gPSB0aGlzLnJlc3VsdHM7XG4gIC8vXHRcdFx0aWYgKHN0YXRlbWVudCAmJiBibG9jaykgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiaWYgbWF5IG9ubHkgaGF2ZSBpbmxpbmUgc3RhdGVtZW50IE9SIGJsb2NrXCIpO1xuICAgICAgICBsZXQgc3RhdGVtZW50cyA9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoc3RhdGVtZW50LCBibG9jayk7XG4gICAgICAgIHJldHVybiBgaWYgKCR7Y29uZGl0aW9ufSkgJHtzdGF0ZW1lbnRzfWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIE5PVEU6IHRoaXMgaXMgTk9UIGEgYmxvY2sgc3RhdGVtZW50Li4uID8/P1xuICB7XG4gICAgbmFtZTogXCJiYWNrd2FyZHNfaWZcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwie3N0YXRlbWVudH0gaWYge2NvbmRpdGlvbjpleHByZXNzaW9ufSAoPzooZWxzZXxvdGhlcndpc2UpIHtlbHNlU3RhdGVtZW50OnN0YXRlbWVudH0pP1wiLFxuICAgIGxlZnRSZWN1cnNpdmU6IHRydWUsXG4gICAgdGVzdFJ1bGU6IG5ldyBSdWxlLktleXdvcmRzKHsgbGl0ZXJhbHM6IFsgXCJpZlwiIF0gfSksXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGJhY2t3YXJkc19pZiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGNvbmRpdGlvbiwgc3RhdGVtZW50LCBlbHNlU3RhdGVtZW50IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIGxldCBvdXRwdXQgPSBgaWYgKCR7Y29uZGl0aW9ufSkgeyAke3N0YXRlbWVudH0gfWA7XG4gICAgICAgIGlmIChlbHNlU3RhdGVtZW50KSBvdXRwdXQgKz0gYFxcbmVsc2UgeyAke2Vsc2VTdGF0ZW1lbnR9IH1gXG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImVsc2VfaWZcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiKGVsc2V8b3RoZXJ3aXNlKSBpZiB7Y29uZGl0aW9uOmV4cHJlc3Npb259ICh0aGVufDopIHtzdGF0ZW1lbnR9P1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBlbHNlX2lmIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgY29uZGl0aW9uLCBzdGF0ZW1lbnQsIGJsb2NrIH0gPSB0aGlzLnJlc3VsdHM7XG4gIC8vXHRcdFx0aWYgKHN0YXRlbWVudCAmJiBibG9jaykgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiZWxzZSBpZiBtYXkgb25seSBoYXZlIGlubGluZSBzdGF0ZW1lbnQgT1IgYmxvY2tcIik7XG4gICAgICAgIGxldCBzdGF0ZW1lbnRzID0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhzdGF0ZW1lbnQsIGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIGBlbHNlIGlmICgke2NvbmRpdGlvbn0pICR7c3RhdGVtZW50c31gXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImVsc2VcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiKGVsc2V8b3RoZXJ3aXNlKSAoOik/IHtzdGF0ZW1lbnR9P1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBlbHNlXyBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHN0YXRlbWVudCwgYmxvY2sgfSA9IHRoaXMucmVzdWx0cztcbiAgLy9cdFx0XHRpZiAoc3RhdGVtZW50ICYmIGJsb2NrKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJlbHNlIGlmIG1heSBvbmx5IGhhdmUgaW5saW5lIHN0YXRlbWVudCBPUiBibG9ja1wiKTtcbiAgICAgICAgbGV0IHN0YXRlbWVudHMgPSBSdWxlLkJsb2NrLmVuY2xvc2VTdGF0ZW1lbnRzKHN0YXRlbWVudCwgYmxvY2spO1xuICAgICAgICByZXR1cm4gYGVsc2UgJHtzdGF0ZW1lbnRzfWBcbiAgICAgIH1cbiAgICB9XG4gIH1cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvaWYuanMiLCIvL1xuLy9cdCMgUnVsZXMgZm9yIGRlYWxpbmcgd2l0aCBsaXN0c1xuLy9cblxuLy8gVE9ETzogY29uZmlybSBpZGVudGlmaWVycyBhcmUgcGx1cmFsIGluIHNvbWUgb2YgdGhlIGJlbG93P1xuLy8gVE9ETzogYGxpc3QuY2xvbmUoKWAgdG8gcmV0dXJuIG5ldyBsaXN0IG9mIHNhbWUgdHlwZS5cblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG5pbXBvcnQgeyBpc1BsdXJhbCwgc2luZ3VsYXJpemUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc3RyaW5nXCI7XG5cbi8vIENyZWF0ZSBcImxpc3RzXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck1vZHVsZShcImxpc3RzXCIpO1xuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG5cbi8vIFdPUktJTkcgRlJPTSBPVEhFUiBSVUxFUyAodGVzdG1lKVxuLy9cdGB0aGUgbGVuZ3RoIG9mIDxsaXN0PmBcbi8vXHRgPHRoaW5nPiBpcyBub3Q/IGluIDxsaXN0PmBcbi8vXHRgPGxpc3Q+IGlzIG5vdD8gZW1wdHlgXG4vL1x0YHNldCBpdGVtIDEgb2YgbXlMaXN0IHRvICdhJ2BcblxuXG4vLyBUT0RPOiBcdGBjcmVhdGUgbGlzdCB3aXRoIDxleHA+LCA8ZXhwPiwgPGV4cD5gXG4vLyBUT0RPOlx0YGR1cGxpY2F0ZSBsaXN0YFxuLy8gVE9ETzpcdGBkdXBsaWNhdGUgbGlzdCB3aXRoIDxleHA+LCA8ZXhwPiwgPGV4cD5gID8/P1xuLy8gVE9ETzpcdGB0aGUgc2l6ZSBvZiA8bGlzdD5gID0+IHdpbGwgbWFwIHRvIGBsaXN0LnNpemVgLi4uXG4vL1x0XHRcdFx0LSBpbnN0YWxsIGBzaXplYCBhcyBhbiBhbGlhcyB0byBgbGVuZ3RoYD9cbi8vIFRPRE86XHRgbW92ZSA8dGhpbmc+IHRvIGVuZCBvZiA8bGlzdD5gID8/P1xuLy8gVE9ETzpcdGBTZXRgIGZvciBhIHVuaXF1ZSBsaXN0P1xuLy8gVE9ETzpcdHR5cGVkIGxpc3Q/XG4vLyBUT0RPOlx0bGlzdCB3aGljaCB3b24ndCB0YWtlIG51bGwvdW5kZWZpbmVkXG5cblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICAvLyBSZXR1cm4gdGhlIGxlbmd0aCBvZiB0aGUgbGlzdC5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9sZW5ndGhcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcInRoZT8gbnVtYmVyIG9mIHtpZGVudGlmaWVyfSBpbiB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X2xlbmd0aCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxpc3QsIGlkZW50aWZpZXIgfSA9IHRoaXMucmVzdWx0cztcbiAgLy8gVE9ETzogc3BlY2lhbCBjYXNlICd3b3JkcycsICdsaW5lcycsIGV0Y1xuICAgICAgICByZXR1cm4gYCR7bGlzdH0ubGVuZ3RoYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gUmV0dXJuIHRoZSBmaXJzdCBwb3NpdGlvbiBvZiBzcGVjaWZpZWQgaXRlbSBpbiB0aGUgbGlzdCBhcyBhbiBhcnJheS5cbiAgLy8gSWYgaXRlbSBpcyBub3QgZm91bmQsIHJldHVybnMgYHVuZGVmaW5lZGAuXG4gIC8vIE5PVEU6IHRoaXMgcG9zaXRpb24gcmV0dXJuZWQgaXMgKioxLWJhc2VkKiouXG4gIC8vVEVTVE1FXG4gIC8vIFRPRE86IGBwb3NpdGlvbnNgLCBgbGFzdCBwb3NpdGlvbmAsIGBhZnRlci4uLmBcbiAge1xuICAgIG5hbWU6IFwibGlzdF9wb3NpdGlvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwidGhlPyBwb3NpdGlvbiBvZiB7dGhpbmc6ZXhwcmVzc2lvbn0gaW4ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9wb3NpdGlvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwucG9zaXRpb25PZigke3RoaW5nfSwgJHtsaXN0fSlgXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vXG4gIC8vXHRPcmRpbmFsIG51bWJlcnMgKGZpcnN0LCBzZWNvbmQsIGxhc3QsIGV0YykuXG4gIC8vIFRPRE86IHNpeHR5LWZpZnRoLCB0d28gaHVuZHJlZCBmb3J0eSBuaW50aC4uLlxuICAvL1xuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImZpcnN0XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAxIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJzZWNvbmRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDIgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInRoaXJkXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAzIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJmb3VydGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDQgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImZpZnRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiA1IH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJzaXh0aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gNiB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwic2V2ZW50aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gNyB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiZWlnaHRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiA4IH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJuaW50aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gOSB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwidGVudGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDEwIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJwZW51bHRpbWF0ZVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gLTIgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImZpbmFsXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAtMSB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwibGFzdFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gLTEgfVxuICAgIH1cbiAgfSxcblxuXG5cbiAgLy8gdHJlYXQgbGlzdCBhcyBhIHN0YWNrIG9yIHF1ZXVlXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwidG9wXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAxIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJib3R0b21cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIC0xIH1cbiAgICB9XG4gIH0sXG5cblxuXG4gIC8vIEluZGV4IGV4cHJlc3Npb246IG51bWVyaWMgcG9zaXRpb24gaW4gc29tZSBsaXN0LlxuICAvL1x0ZS5nLlx0YGNhcmQgMSBvZiB0aGUgcGlsZWBcbiAgLy9cdFx0XHRgY2FyZCAjMiBvZiB0aGUgcGlsZWBcbiAgLy9cdFx0XHRgdGhlIGZpcnN0IGNhcmQgb2YgdGhlIHBpbGVgXG4gIC8vXG4gIC8vIE5PVEU6IE5lZ2F0aXZlIG51bWVyaWMgcG9zaXRpb25zIGNvbWUgZnJvbSB0aGUgRU5EIG9mIHRoZSBsaXN0LlxuICAvL1x0ZS5nLlx0YGNhcmQgLTEgb2YgdGhlIHBpbGVgXG4gIC8vXG4gIC8vIE5PVEU6IE91ciBwb3NpdGlvbnMgYXJlICoqMS1iYXNlZCoqIGFuZCBKYXZhc2NyaXB0IGlzICoqMC1iYXNlZCoqLlxuICAvL1x0XHQgZS5nLiBgaXRlbSAxIG9mIHRoZSBhcnJheWAgID0gYGFycmF5WzBdYFxuICAvL1xuICAvLyBUT0RPOiBpZiBgaWRlbnRpZmllcmAgaXMgXCJ3b3JkXCIsIG91dHB1dCBgZ2V0V29yZCgpYCBldGNcbiAgLy8gVE9ETzogc3BlY2lhbCBjYXNlICd3b3JkcycsICdsaW5lcycsIGV0YyA/XG4gIHtcbiAgICBuYW1lOiBcInBvc2l0aW9uX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBbXG4gICAgICBcIntpZGVudGlmaWVyfSB7cG9zaXRpb246ZXhwcmVzc2lvbn0gb2YgKHRoZT8pIHtleHByZXNzaW9ufVwiLFxuICAgICAgXCJ0aGUge3Bvc2l0aW9uOm9yZGluYWx9IHtpZGVudGlmaWVyfSBvZiAodGhlPykge2V4cHJlc3Npb259XCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBwb3NpdGlvbl9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZXtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyLCBwb3NpdGlvbiwgZXhwcmVzc2lvbiB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICAvLyBJZiB3ZSBnb3QgYSBwb3NpdGl2ZSBudW1iZXIgbGl0ZXJhbCwgY29tcGVuc2F0ZSBmb3IgSlMgMC1iYXNlZCBhcnJheXMgbm93LCBmb3IgbmljZXIgb3V0cHV0LlxuICAgICAgICBpZiAodHlwZW9mIHBvc2l0aW9uID09PSBcIm51bWJlclwiICYmIHBvc2l0aW9uID4gMCkge1xuICAgICAgICAgIHJldHVybiBgJHtleHByZXNzaW9ufVske3Bvc2l0aW9uIC0gMX1dYDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYHNwZWxsLmdldEl0ZW0oJHtleHByZXNzaW9ufSwgJHtwb3NpdGlvbn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBQaWNrIGEgU0lOR0xFIHJhbmRvbSBpdGVtIGZyb20gdGhlIGxpc3QuXG4gIC8vIFRPRE86IGNvbmZpcm0gaWRlbnRpZmllciBpcyBwbHVyYWw/XG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcInJhbmRvbV9wb3NpdGlvbl9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJhIHJhbmRvbSB7aWRlbnRpZmllcn0gKG9mfGZyb218aW4pICh0aGUpPyB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5kb21fcG9zaXRpb25fZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5kb21JdGVtT2YoJHtsaXN0fSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBQaWNrIGEgdW5pcXVlIHNldCBvZiByYW5kb20gaXRlbXMgZnJvbSB0aGUgbGlzdCwgcmV0dXJuaW5nIGFuIGFycmF5LlxuICAvLyBUT0RPOiBgdHdvIHJhbmRvbSBpdGVtcy4uLmBcbiAgLy8gVE9ETzogY29uZmlybSBpZGVudGlmaWVyIGlzIHBsdXJhbD9cbiAgLy8gVE9ETzogYGxpc3QuY2xvbmUoKWAgdG8gcmV0dXJuIG5ldyBsaXN0IG9mIHNhbWUgdHlwZS5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmFuZG9tX3Bvc2l0aW9uc19leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7bnVtYmVyfSByYW5kb20ge2lkZW50aWZpZXJ9IChvZnxmcm9tfGluKSAodGhlKT8ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZG9tX3Bvc2l0aW9uc19leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbnVtYmVyLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0UmFuZG9tSXRlbXNPZigke2xpc3R9LCAke251bWJlcn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBSYW5nZSBleHByZXNzaW9uLlxuICAvLyBSZXR1cm5zIGEgbmV3IGxpc3QuXG4gIC8vIE5PVEU6IGBzdGFydGAgaXMgKioxLWJhc2VkKiouXG4gIC8vIE5PVEU6IGBlbmRgIGlzIGluY2x1c2l2ZSFcbiAgLy8gVE9ETzogY29uZmlybSBpZGVudGlmaWVyIGlzIHBsdXJhbD9cbiAgLy8gVE9ETzogYGxpc3QuY2xvbmUoKWAgdG8gcmV0dXJuIG5ldyBsaXN0IG9mIHNhbWUgdHlwZS5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmFuZ2VfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2lkZW50aWZpZXJ9IHtzdGFydDpleHByZXNzaW9ufSB0byB7ZW5kOmV4cHJlc3Npb259IG9mIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJhbmdlX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBzdGFydCwgZW5kLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0UmFuZ2UoJHtsaXN0fSwgJHtzdGFydH0sICR7ZW5kfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBTdGFydGluZyByYW5nZSBleHByZXNzaW9uLlxuICAvLyBSZXR1cm5zIGEgbmV3IGxpc3QuXG4gIC8vIGUuZy5cdGBmaXJzdCA0IGl0ZW1zIG9mIGxpc3RgXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImZpcnN0X2luX3JhbmdlXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJmaXJzdCB7bnVtYmVyOmV4cHJlc3Npb259IHtpZGVudGlmaWVyfSAoaW58b2YpIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJhbmdlX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBudW1iZXIsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5nZSgke2xpc3R9LCAxLCAke251bWJlcn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gRW5kaW5nIHJhbmdlIGV4cHJlc3Npb24uXG4gIC8vIFJldHVybnMgYSBuZXcgbGlzdC5cbiAgLy8gZS5nLlx0YGxhc3QgNCBpdGVtcyBvZiBsaXN0YFxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsYXN0X2luX3JhbmdlXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJsYXN0IHtudW1iZXI6ZXhwcmVzc2lvbn0ge2lkZW50aWZpZXJ9IChpbnxvZikge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG51bWJlciwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldEVuZFJhbmdlKCR7bGlzdH0sIDEsICR7bnVtYmVyfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFJhbmdlIGV4cHJlc3Npb24gc3RhcnRpbmcgYXQgc29tZSBpdGVtIGluIHRoZSBsaXN0LlxuICAvLyBSZXR1cm5zIGEgbmV3IGxpc3QuXG4gIC8vIElmIGl0ZW0gaXMgbm90IGZvdW5kLCByZXR1cm5zIGFuIGVtcHR5IGxpc3QuICg/Pz8pXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcInJhbmdlX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIntpZGVudGlmaWVyfSAoaW58b2YpIHtsaXN0OmV4cHJlc3Npb259IHN0YXJ0aW5nIHdpdGgge3RoaW5nOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJhbmdlX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldFJhbmdlKCR7bGlzdH0sIHNwZWxsLnBvc2l0aW9uT2YoJHt0aGluZ30sICR7bGlzdH0pKWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gTGlzdCBmaWx0ZXIuXG4gIC8vIE5PVEU6IHdlIHdpbGwgc2luZ3VsYXJpemUgYGlkZW50aWZpZXJgIGFuZCB1c2UgdGhhdCBhcyB0aGUgYXJndW1lbnQgdG8gYGV4cHJlc3Npb25gLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2ZpbHRlclwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2lkZW50aWZpZXJ9IChpbnxvZikge2xpc3Q6ZXhwcmVzc2lvbn0gd2hlcmUge2NvbmRpdGlvbjpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X2ZpbHRlciBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGlkZW50aWZpZXIsIGNvbmRpdGlvbiwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICAvLyB1c2Ugc2luZ3VsYXIgb2YgaWRlbnRpZmllciBmb3IgbWV0aG9kIGFyZ3VtZW50XG4gICAgICAgIGxldCBhcmd1bWVudCA9IHNpbmd1bGFyaXplKGlkZW50aWZpZXIudG9Tb3VyY2UoKSk7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZmlsdGVyKCR7bGlzdH0sICR7YXJndW1lbnR9ID0+ICR7Y29uZGl0aW9ufSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFNldCBtZW1iZXJzaGlwIChsZWZ0IHJlY3Vyc2l2ZSkuXG4gIC8vIE5PVEU6IHdlIHdpbGwgc2luZ3VsYXJpemUgYGlkZW50aWZpZXJgIGFuZCB1c2UgdGhhdCBhcyB0aGUgYXJndW1lbnQgdG8gYGV4cHJlc3Npb25gLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X21lbWJlcnNoaXBfdGVzdFwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2xpc3Q6ZXhwcmVzc2lvbn0gKG9wZXJhdG9yOmhhc3xoYXMgbm98ZG9lc250IGhhdmV8ZG9lcyBub3QgaGF2ZSkge2lkZW50aWZpZXJ9IHdoZXJlIHtmaWx0ZXI6ZXhwcmVzc2lvbn1cIixcbiAgICBsZWZ0UmVjdXJzaXZlOiB0cnVlLFxuICAgIHRlc3RSdWxlOiBuZXcgUnVsZS5LZXl3b3Jkcyh7IG1hdGNoOiBcIndoZXJlXCIgfSksXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfbWVtYmVyc2hpcF90ZXN0IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgaWRlbnRpZmllciwgb3BlcmF0b3IsIGZpbHRlciwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBsZXQgYmFuZyA9IG9wZXJhdG9yID09PSBcImhhc1wiID8gXCJcIiA6IFwiIVwiO1xuICAgICAgICAvLyB1c2Ugc2luZ3VsYXIgb2YgaWRlbnRpZmllciBmb3IgbWV0aG9kIGFyZ3VtZW50XG4gICAgICAgIGxldCBhcmd1bWVudCA9IHNpbmd1bGFyaXplKGlkZW50aWZpZXIudG9Tb3VyY2UoKSk7XG4gICAgICAgIHJldHVybiBgJHtiYW5nfXNwZWxsLmFueSgke2xpc3R9LCAke2FyZ3VtZW50fSA9PiAke2ZpbHRlcn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy9cbiAgLy9cdEFkZGluZyB0byBsaXN0IChpbi1wbGFjZSlcbiAgLy9cblxuICAvLyBBZGQgdG8gZW5kIG9mIGxpc3QuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfYXBwZW5kXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImFwcGVuZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwiYWRkIHt0aGluZzpleHByZXNzaW9ufSB0byAoKHRoZT8pIGVuZCBvZik/IHtsaXN0OmV4cHJlc3Npb259XCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X2FwcGVuZCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuYXBwZW5kKCR7bGlzdH0sICR7dGhpbmd9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIEFkZCB0byBiZWdpbm5pbmcgb2YgbGlzdC5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9wcmVwZW5kXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBbXG4gICAgICBcInByZXBlbmQge3RoaW5nOmV4cHJlc3Npb259IHRvIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgICBcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8gdGhlIChzdGFydHxmcm9udHx0b3ApIG9mIHtsaXN0OmV4cHJlc3Npb259XCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3ByZXBlbmQgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnByZXBlbmQoJHtsaXN0fSwgJHt0aGluZ30pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gQWRkIHRvIG1pZGRsZSBvZiBsaXN0LCBwdXNoaW5nIGV4aXN0aW5nIGl0ZW1zIG91dCBvZiB0aGUgd2F5LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2FkZF9hdFwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJhZGQge3RoaW5nOmV4cHJlc3Npb259IHRvIHtsaXN0OmV4cHJlc3Npb259IGF0IHBvc2l0aW9uIHtwb3NpdGlvbjpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3NwbGljZSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBwb3NpdGlvbiwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnNwbGljZSgke2xpc3R9LCAke3Bvc2l0aW9ufSwgJHt0aGluZ30pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBUT0RPOiAgXHRcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn0gYmVmb3JlIHtpdGVtOmV4cHJlc3Npb259XCIsXG5cbiAgLy8gQWRkIHRvIG1pZGRsZSBvZiBsaXN0LCBwdXNoaW5nIGV4aXN0aW5nIGl0ZW1zIG91dCBvZiB0aGUgd2F5LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2FkZF9hZnRlclwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJhZGQge3RoaW5nOmV4cHJlc3Npb259IHRvIHtsaXN0OmV4cHJlc3Npb259IGFmdGVyIHtpdGVtOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfYWRkX2FmdGVyIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIGl0ZW0sIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5zcGxpY2UoJHtsaXN0fSwgc3BlbGwucG9zaXRpb25PZigke2xpc3R9LCAke2l0ZW19KSwgJHt0aGluZ30pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy9cbiAgLy9cdFJlbW92aW5nIGZyb20gbGlzdCAoaW4tcGxhY2UpXG4gIC8vXG5cbiAgLy8gRW1wdHkgbGlzdC5cbiAgLy9UT0RPOiBtYWtlIGBlbXB0eWAgYW5kL29yIGBjbGVhcmAgYSBnZW5lcmljIHN0YXRlbWVudD8/P1xuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2VtcHR5XCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIihlbXB0eXxjbGVhcikge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9lbXB0eSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5jbGVhcigke2xpc3R9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFJlbW92ZSBvbmUgaXRlbSBmcm9tIGxpc3QgYnkgcG9zaXRpb24uXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcmVtb3ZlX3Bvc2l0aW9uXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJlbW92ZSB7aWRlbnRpZmllcn0ge251bWJlcjpleHByZXNzaW9ufSBvZiB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3JlbW92ZV9wb3NpdGlvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG51bWJlciwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnJlbW92ZUl0ZW0oJHtsaXN0fSwgJHtudW1iZXJ9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFJlbW92ZSByYW5nZSBvZiB0aGluZ3MgZnJvbSBsaXN0LlxuICAvLyBOT1RFOiBgc3RhcnRgIGlzICoqMS1iYXNlZCoqLlxuICAvLyBOT1RFOiBgZW5kYCBpcyBpbmNsdXNpdmUhXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcmVtb3ZlX3JhbmdlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJlbW92ZSB7aWRlbnRpZmllcn0ge3N0YXJ0OmV4cHJlc3Npb259IHRvIHtlbmQ6ZXhwcmVzc2lvbn0gb2Yge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9yZW1vdmVfcG9zaXRpb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBzdGFydCwgZW5kLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwucmVtb3ZlUmFuZ2UoJHtsaXN0fSwgJHtzdGFydH0sICR7ZW5kfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFJlbW92ZSBhbGwgaW5zdGFuY2VzIG9mIHNvbWV0aGluZyBmcm9tIGEgbGlzdC5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9yZW1vdmVcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwicmVtb3ZlIHt0aGluZzpleHByZXNzaW9ufSBmcm9tIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcmVtb3ZlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5yZW1vdmUoJHtsaXN0fSwgJHt0aGluZ30pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gUmVtb3ZlIGFsbCBpdGVtcyBmcm9tIGxpc3Qgd2hlcmUgY29uZGl0aW9uIGlzIHRydWUuXG4gIC8vIE5PVEU6IHdlIHdpbGwgc2luZ3VsYXJpemUgYGlkZW50aWZpZXJgIGFuZCB1c2UgdGhhdCBhcyB0aGUgYXJndW1lbnQgdG8gYGV4cHJlc3Npb25gLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3JlbW92ZV93aGVyZVwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJyZW1vdmUge2lkZW50aWZpZXJ9IChpbnxvZnxmcm9tKSB7bGlzdDpleHByZXNzaW9ufSB3aGVyZSB7Y29uZGl0aW9uOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcmVtb3ZlX3doZXJlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgaWRlbnRpZmllciwgY29uZGl0aW9uLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIC8vIHVzZSBzaW5ndWxhciBvZiBpZGVudGlmaWVyIGZvciBtZXRob2QgYXJndW1lbnRcbiAgICAgICAgbGV0IGFyZ3VtZW50ID0gc2luZ3VsYXJpemUoaWRlbnRpZmllci50b1NvdXJjZSgpKTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5yZW1vdmVXaGVyZSgke2xpc3R9LCAke2FyZ3VtZW50fSA9PiAke2NvbmRpdGlvbn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvL1xuICAvL1x0UmFuZG9tIChpbi1wbGFjZSkgbGlzdCBtYW5pcHVsYXRpb24uXG4gIC8vXG5cbiAgLy8gUmV2ZXJzZSBsaXN0IGluLXBsYWNlLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3JldmVyc2VcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwicmV2ZXJzZSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3JldmVyc2UgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwucmV2ZXJzZSgke2xpc3R9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFNodWZmbGUgbGlzdCBpbi1wbGFjZS5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9zaHVmZmxlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIihyYW5kb21pemV8c2h1ZmZsZSkge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9zaHVmZmxlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnNodWZmbGUoJHtsaXN0fSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIEl0ZXJhdGlvblxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2l0ZXJhdGlvblwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJmb3IgKGVhY2gpPyB7aXRlbVZhcjppZGVudGlmaWVyfSBpbiB7bGlzdDpleHByZXNzaW9ufTo/IHtzdGF0ZW1lbnR9P1wiLFxuICAgICAgXCJmb3IgKGVhY2gpPyB7aXRlbVZhcjppZGVudGlmaWVyfSAoYW5kfCwpIHtwb3NpdGlvblZhcjppZGVudGlmaWVyfSBpbiB7bGlzdDpleHByZXNzaW9ufTo/IHtzdGF0ZW1lbnR9P1wiLFxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfaXRlcmF0aW9uIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgaXRlbVZhciwgcG9zaXRpb25WYXIsIGxpc3QsIHN0YXRlbWVudCwgYmxvY2sgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgbGV0IG91dHB1dDtcbiAgICAgICAgaWYgKHBvc2l0aW9uVmFyKSB7XG4gICAgICAgICAgb3V0cHV0ID0gYGZvciAobGV0ICR7cG9zaXRpb25WYXJ9ID0gMSwgYmFyOyAke2l0ZW1WYXJ9ID0gJHtsaXN0fVske3Bvc2l0aW9uVmFyfS0xXSwgJHtwb3NpdGlvblZhcn0gPD0gJHtsaXN0fS5sZW5ndGg7ICR7cG9zaXRpb25WYXJ9KyspIGBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBOT1RFOiB0aGlzIGlzIHJlbGF0aXZlbHkgc2xvdy4uLiAgcHJvYmFibHkgZG9lc24ndCBtYXR0ZXIuLi5cbiAgICAgICAgICBvdXRwdXQgPSBgZm9yIChsZXQgJHtpdGVtVmFyfSBvZiAke2xpc3R9KSBgO1xuICAgICAgICB9XG4gICAgICAgIG91dHB1dCArPSBSdWxlLkJsb2NrLmVuY2xvc2VTdGF0ZW1lbnRzKHN0YXRlbWVudCwgYmxvY2spO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFJhbmdlXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcInJhbmdlX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcInJhbmdlIHtzdGFydDpleHByZXNzaW9ufSB0byB7ZW5kOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJhbmdlX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBzdGFydCwgZW5kIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0UmFuZ2UoJHtzdGFydH0sICR7ZW5kfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfVxuKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ydWxlcy9zcGVsbC9saXN0cy5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgaW5maXggYW5kIHByZWZpeCBvcGVyYXRvcnMuXG4vL1xuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5cbi8vIENyZWF0ZSBcIm9wZXJhdG9yc1wiIHBhcnNlci5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JNb2R1bGUoXCJvcGVyYXRvcnNcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAgLy8gVE9ETzpcbiAgLy8gXHQvLyBGaW5kIGJlc3QgbWF0Y2ggYWNjb3JkaW5nIHRvIG9wZXJhdG9yIHByZWNlZGVuY2UgYXMgZGVmaW5lZCBiZWxvdy5cbiAgLy8gXHRnZXRCZXN0TWF0Y2gobWF0Y2hlcykge1xuICAvLyBcdFx0Y29uc29sZS53YXJuKFwiR0JNXCIsIG1hdGNoZXMsIG1hdGNoZXMubWFwKG1hdGNoID0+IG1hdGNoLnByZWNlZGVuY2UpLCBtYXRjaGVzLm1hcChtYXRjaCA9PiBtYXRjaC5tYXRjaGVkVGV4dCkpO1xuICAvLyBcdFx0cmV0dXJuIG1hdGNoZXMucmVkdWNlKGZ1bmN0aW9uIChiZXN0LCBuZXh0KSB7XG4gIC8vIFx0XHRcdC8vIHRha2UgaGlnaGVzdCBwcmVjZWRlbmNlIG1hdGNoIGZpcnN0XG4gIC8vIFx0XHRcdGlmIChuZXh0LnByZWNlZGVuY2UgPiBiZXN0LnByZWNlZGVuY2UpIHJldHVybiBuZXh0O1xuICAvLyBcdFx0XHQvLyB0YWtlIGxvbmdlc3QgbWF0Y2ggaWYgc2FtZSBwcmVjZWRlbmNlXG4gIC8vIFx0XHRcdGlmIChuZXh0LnByZWNlZGVuY2UgPT09IGJlc3QucHJlY2VkZW5jZSkge1xuICAvLyBcdFx0XHRcdGlmIChuZXh0LmVuZEluZGV4ID4gYmVzdC5lbmRJbmRleCkgcmV0dXJuIG5leHQ7XG4gIC8vIFx0XHRcdH1cbiAgLy8gXHRcdFx0cmV0dXJuIGJlc3Q7XG4gIC8vIFx0XHR9LCBtYXRjaGVzWzBdKTtcbiAgLy8gXHR9XG5cblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvcl9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7bGhzOmV4cHJlc3Npb259IHtvcGVyYXRvcjppbmZpeF9vcGVyYXRvcn0ge3JoczpleHByZXNzaW9ufVwiLFxuICAgIGxlZnRSZWN1cnNpdmU6IHRydWUsXG4gICAgdGVzdFJ1bGU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaW5maXhfb3BlcmF0b3JfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxocywgcmhzLCBfb3BlcmF0b3IgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIF9vcGVyYXRvci5hcHBseShsaHMsIHJocyk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIyMgSW5maXggb3BlcmF0b3JzOiAgIGB7bGhzfSA8b3BlcmF0b3I+IHtyaHN9YCwgZWc6IGBhIGlzIDFgXG4gIC8vIE5PVEU6IGBvcGVyYXRvci5hcHBseWAgTVVTVCByZXR1cm4gYSBmdW5jdGlvbiB3aGljaCB0cmFuc2Zvcm1zIHR3byBhcmd1bWVudHMgKGBsaHNgIGFuZCBgcmhzYCkgaW50byBvdXRwdXQuXG4gIC8vIE5PVEU6IGBwcmVjZWRlbmNlYCBudW1iZXJzIGNvbWUgZnJvbSBKYXZhc2NyaXB0IGVxdWl2YWxlbnRzXG4gIC8vXHRcdCBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9PcGVyYXRvcnMvT3BlcmF0b3JfUHJlY2VkZW5jZVxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDYsXG4gICAgc3ludGF4OiBcImFuZFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBhbmQgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm4gYCgke2F9ICYmICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogNSxcbiAgICBzeW50YXg6IFwib3JcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3IgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm4gYCgke2F9IHx8ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTAsXG4gICAgc3ludGF4OiBcImlzXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuIGAoJHthfSA9PSAke2J9KWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEwLFxuICAgIHN5bnRheDogXCJpcyBub3RcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuIGAoJHthfSAhPSAke2J9KWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEwLFxuICAgIHN5bnRheDogXCJpcyBleGFjdGx5XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2V4YWN0bHkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm4gYCgke2F9ID09PSAke2J9KWAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMCxcbiAgICBzeW50YXg6IFwiaXMgbm90IGV4YWN0bHlcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2V4YWN0bHkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm4gYCgke2F9ICE9PSAke2J9KWAgfVxuICAgIH1cbiAgfSxcblxuICAvL1RPRE86IGBzcGVsbC5pc09mVHlwZSh0aGluZywgdHlwZSlgXG4gIC8vVE9ETzogYGlzIHNhbWUgdHlwZSBhc2AgP1xuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpcyBhXCIsXG4gICAgICBcImlzIGFuXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19hIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseSh0aGluZywgdHlwZSkgeyByZXR1cm4gYHNwZWxsLmlzT2ZUeXBlKCR7dGhpbmd9LCAnJHt0eXBlfScpYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImlzIG5vdCBhXCIsXG4gICAgICBcImlzIG5vdCBhblwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2EgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KHRoaW5nLCB0eXBlKSB7IHJldHVybiBgIXNwZWxsLmlzT2ZUeXBlKCR7dGhpbmd9LCAnJHt0eXBlfScpYCB9XG4gICAgfVxuICB9LFxuXG4gIC8vVE9ETzogYHNwZWxsLmNvbnRhaW5zKGNvbGxlY3Rpb24sIHRoaW5nKWBcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgaW5cIixcbiAgICAgIFwiaXMgb25lIG9mXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19pbiBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkodGhpbmcsIGxpc3QpIHsgcmV0dXJuIGAke2xpc3R9LmluY2x1ZGVzKCR7dGhpbmd9KWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpcyBub3QgaW5cIixcbiAgICAgIFwiaXMgbm90IG9uZSBvZlwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2luIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseSh0aGluZywgbGlzdCkgeyByZXR1cm4gYCEke2xpc3R9LmluY2x1ZGVzKCR7dGhpbmd9KWAgfVxuICAgIH1cbiAgfSxcblxuXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaW5jbHVkZXNcIixcbiAgICAgIFwiY29udGFpbnNcIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGluY2x1ZGVzIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShsaXN0LCB0aGluZykgeyByZXR1cm4gYCR7bGlzdH0uaW5jbHVkZXMoJHt0aGluZ30pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImRvZXMgbm90IGluY2x1ZGVcIixcbiAgICAgIFwiZG9lcyBub3QgY29udGFpblwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZG9lc19ub3RfaW5jbHVkZSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkobGlzdCwgdGhpbmcpIHsgcmV0dXJuIGAhJHtsaXN0fS5pbmNsdWRlcygke3RoaW5nfSlgIH1cbiAgICB9XG4gIH0sXG5cblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCI+XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGd0IGV4dGVuZHMgUnVsZS5TeW1ib2xzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gKCR7YX0gPiAke2J9KWAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiaXMgZ3JlYXRlciB0aGFuXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2d0IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9ID4gJHtifSlgIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiPj1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZ3RlIGV4dGVuZHMgUnVsZS5TeW1ib2xzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gKCR7YX0gPj0gJHtifSlgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcImlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0b1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19ndGUgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gKCR7YX0gPj0gJHtifSlgIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiPFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsdCBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9IDwgJHtifSlgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcImlzIGxlc3MgdGhhblwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19sdCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAoJHthfSA8ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcIjw9XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGx0ZSBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9IDw9ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCJpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbHRlIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9IDw9ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMyxcbiAgICBzeW50YXg6IFwiXFxcXCtcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcGx1cyBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gKyAke2J9YCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEzLFxuICAgIHN5bnRheDogXCJwbHVzXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHBsdXMgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gJHthfSArICR7Yn1gIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMyxcbiAgICBzeW50YXg6IFwiLVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBtaW51cyBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gLSAke2J9YCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEzLFxuICAgIHN5bnRheDogXCJtaW51c1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBtaW51cyBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAke2F9IC0gJHtifWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDE0LFxuICAgIHN5bnRheDogXCJcXFxcKlwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0aW1lcyBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gKiAke2J9YCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDE0LFxuICAgIHN5bnRheDogXCJ0aW1lc1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0aW1lcyBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAke2F9ICogJHtifWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDE0LFxuICAgIHN5bnRheDogXCIvXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRpdmlkZWRfYnkgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAke2F9IC8gJHtifWAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxNCxcbiAgICBzeW50YXg6IFwiZGl2aWRlZCBieVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkaXZpZGVkX2J5IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gLyAke2J9YCB9XG4gICAgfVxuICB9LFxuXG4gIC8vVE9ETzogIGArPWAgZXRjPyAgb3RoZXIgbWF0aCBmdW5jdGlvbnM/XG5cblxuICAvL1xuICAvL1xuICAvLyMjIFBvc3RpZnggb3BlcmF0b3JzOiAgIGB7bGhzfSA8b3BlcmF0b3I+YCwgZS5nLiBgYSBpcyBkZWZpbmVkYFxuICAvLyBOT1RFOiBgb3BlcmF0b3IuYXBwbHlgIE1VU1QgcmV0dXJuIGEgZnVuY3Rpb24gd2hpY2ggdHJhbnNmb3JtcyBhcmd1bWVudCAoYGxoc2ApIGludG8gSlMgb3V0cHV0LlxuXG4gIHtcbiAgICBuYW1lOiBcInBvc3RmaXhfb3BlcmF0b3JfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2V4cHJlc3Npb259IHtvcGVyYXRvcjpwb3N0Zml4X29wZXJhdG9yfVwiLFxuICAgIGxlZnRSZWN1cnNpdmU6IHRydWUsXG4gICAgdGVzdFJ1bGU6IFwicG9zdGZpeF9vcGVyYXRvclwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBwb3N0Zml4X29wZXJhdG9yX2V4cHJlc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGV4cHJlc3Npb24sIF9vcGVyYXRvciB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gX29wZXJhdG9yLmFwcGx5KGV4cHJlc3Npb24pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgc3ludGF4OiBcImlzIGRlZmluZWRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfZGVmaW5lZCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkodGhpbmcpIHsgcmV0dXJuIGAodHlwZW9mICR7dGhpbmd9ICE9PSAndW5kZWZpbmVkJylgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcInBvc3RmaXhfb3BlcmF0b3JcIixcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgdW5kZWZpbmVkXCIsXG4gICAgICBcImlzIG5vdCBkZWZpbmVkXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc191bmRlZmluZWQgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KHRoaW5nKSB7IHJldHVybiBgKHR5cGVvZiAke3RoaW5nfSA9PT0gJ3VuZGVmaW5lZCcpYCB9XG4gICAgfVxuICB9LFxuXG4gIC8vVE9ETzogYHNwZWxsLmlzRW1wdHkodGhpbmcpYFxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgc3ludGF4OiBcImlzIGVtcHR5XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2VtcHR5IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseSh0aGluZykgeyByZXR1cm4gYHNwZWxsLmlzRW1wdHkoJHt0aGluZ30pYCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgc3ludGF4OiBcImlzIG5vdCBlbXB0eVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19ub3RfZW1wdHkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KHRoaW5nKSB7IHJldHVybiBgIXNwZWxsLmlzRW1wdHkoJHt0aGluZ30pYCB9XG4gICAgfVxuICB9LFxuXG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL29wZXJhdG9ycy5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgY3JlYXRpbmcgdmFyaWFibGVzLCBwcm9wZXJ0eSBhY2Nlc3MsIGV0Y1xuLy9cblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG4vLyBDcmVhdGUgXCJzdGF0ZW1lbnRzXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck1vZHVsZShcInN0YXRlbWVudHNcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAgLy9cbiAgLy9cdCMjIFJldHVybnNcbiAgLy9cblxuICAvLyBSZXR1cm4gYSB2YWx1ZVxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJyZXR1cm5fc3RhdGVtZW50XCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJldHVybiB7ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmV0dXJuX3N0YXRlbWVudCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGV4cHJlc3Npb24gfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGByZXR1cm4gJHtleHByZXNzaW9ufWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vXG4gIC8vXHQjIyBBc3NpZ25tZW50XG4gIC8vXG5cbiAgLy9URVNUTUVcbiAgLy9UT0RPOiBkaXN0aW5ndWlzaCBiZXR3ZWVuIGBuZXdfaWRlbnRpZmllcmAgYW5kIGBzY29wZWRfaWRlbnRpZmllcmBcbiAge1xuICAgIG5hbWU6IFwiYXNzaWdubWVudFwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBbXG4gICAgICBcInt0aGluZzpleHByZXNzaW9ufSA9IHt2YWx1ZTpleHByZXNzaW9ufVwiLFxuICAgICAgXCJzZXQge3RoaW5nOmV4cHJlc3Npb259IHRvIHt2YWx1ZTpleHByZXNzaW9ufVwiLFxuICAgICAgXCJwdXQge3ZhbHVlOmV4cHJlc3Npb259IGludG8ge3RoaW5nOmV4cHJlc3Npb259XCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBhc3NpZ25tZW50IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIHZhbHVlIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIC8vIFRPRE86IGRlY2xhcmUgaWRlbnRpZmllciBpZiBub3QgaW4gc2NvcGUsIGV0Y1xuICAgICAgICByZXR1cm4gYCR7dGhpbmd9ID0gJHt2YWx1ZX1gO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvL1RFU1RNRVxuICAvLyBUT0RPOiBgaXRgIG1heSBub3QgYWxyZWFkeSBiZSBkZWZpbmVkLi4uID8/P1xuICB7XG4gICAgbmFtZTogXCJnZXRfdmFsdWVcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJnZXQge3ZhbHVlOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGdldF92YWx1ZSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHZhbHVlIH0gPSB0aGlzLnJlc3VsdHM7O1xuICAgICAgICByZXR1cm4gYGl0ID0gJHt2YWx1ZX1gXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cblxuICAvL1xuICAvL1x0IyMgVXNlciBpbnRlcmFjdGlvblxuICAvLyBUT0RPOiBtb3ZlIGludG8gYW5vdGhlciBmaWxlXG4gIC8vXG5cbiAgLy8gQWxlcnQgYSBtZXNzYWdlLlxuICAvLyBUT0RPOiBuZWVkIHNvbWUgZmFuY3kgcHJvbWlzZSBqdWp1IGhlcmU/XG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImFsZXJ0XCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcImFsZXJ0IHttZXNzYWdlOmV4cHJlc3Npb259ICg/OndpdGgge29rQnV0dG9uOnRleHR9KT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgYWxlcnQgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBtZXNzYWdlLCBva0J1dHRvbiA9IGBcIk9LXCJgIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgYXdhaXQgc3BlbGwuYWxlcnQoJHttZXNzYWdlfSwgJHtva0J1dHRvbn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gV2FybmluZyBtZXNzYWdlIC0tIGxpa2UgYWxlcnQgYnV0IGZhbmNpZXIuXG4gIC8vIFRPRE86IG5lZWQgc29tZSBmYW5jeSBwcm9taXNlIGp1anUgaGVyZT9cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwid2FyblwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJ3YXJuIHtleHByZXNzaW9uOmV4cHJlc3Npb259ICg/OndpdGgge29rQnV0dG9uOnRleHR9KT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgd2FybiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG1lc3NhZ2UsIG9rQnV0dG9uID0gYFwiT0tcImAgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBhd2FpdCBzcGVsbC53YXJuKCR7bWVzc2FnZX0sICR7b2tCdXR0b259KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gQ29uZmlybSBtZXNzYWdlIC0tIHByZXNlbnQgYSBxdWVzdGlvbiB3aXRoIHR3byBhbnN3ZXJzLlxuICAvLyBUT0RPOiBuZWVkIHNvbWUgZmFuY3kgcHJvbWlzZSBqdWp1IGhlcmU/XG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImNvbmZpcm1cIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiY29uZmlybSB7bWVzc2FnZTpleHByZXNzaW9ufSAoPzp3aXRoIHtva0J1dHRvbjp0ZXh0fSAoPzogKGFuZHxvcikge2NhbmNlbEJ1dHRvbjp0ZXh0fSk/ICk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGNvbmZpcm0gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBtZXNzYWdlLCBva0J1dHRvbiA9IGBcIk9LXCJgLCBjYW5jZWxCdXR0b24gPSBgXCJDYW5jZWxcImAgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBhd2FpdCBzcGVsbC5jb25maXJtKCR7bWVzc2FnZX0sICR7b2tCdXR0b259LCAke2NhbmNlbEJ1dHRvbn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvc3RhdGVtZW50cy5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgZGVmaW5pbmcgY2xhc3NlcyAoa25vd24gYXMgYHR5cGVzYClcbi8vXG5cbi8vVE9ETzogY29uc3RydWN0b3Jcbi8vIFRPRE86IG1peGlucyAvIHRyYWl0cyAvIGNvbXBvc2VkIGNsYXNzZXMgLyBhbm5vdGF0aW9uc1xuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5cbmltcG9ydCBnbG9iYWwgZnJvbSBcIi4uLy4uL3V0aWxzL2dsb2JhbFwiO1xuaW1wb3J0IHsgcGx1cmFsaXplIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3N0cmluZ1wiO1xuXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTW9kdWxlKFwidHlwZXNcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwiZGVmaW5lX3R5cGVcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJkZWZpbmUgdHlwZSB7bmFtZTp0eXBlfSAoPzphcyAoYXxhbikge3N1cGVyVHlwZTp0eXBlfSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRlZmluZV90eXBlIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCBzdHJ1Y3R1cmUgPSBzdXBlci50b1N0cnVjdHVyZSgpO1xuICAgICAgICBzdHJ1Y3R1cmUudHlwZSA9IFwiY2xhc3NcIjtcbiAgICAgICAgcmV0dXJuIHN0cnVjdHVyZTtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHN1cGVyVHlwZSwgYmxvY2sgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgbGV0IG91dHB1dCA9IGBjbGFzcyAke25hbWV9YDtcbiAgICAgICAgaWYgKHN1cGVyVHlwZSkgb3V0cHV0ICs9IGAgZXh0ZW5kcyAke3N1cGVyVHlwZX1gO1xuICAgICAgICBvdXRwdXQgKz0gXCIgXCIgKyBSdWxlLkJsb2NrLmVuY2xvc2VTdGF0ZW1lbnRzKGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gYG5ld2Agb3IgYGNyZWF0ZWBcbiAgLy8gVGhpcyB3b3JrcyBhcyBhbiBleHByZXNzaW9uIE9SIGEgc3RhdGVtZW50LlxuICAvLyBOT1RFOiB3ZSBhc3N1bWUgdGhhdCBhbGwgdHlwZXMgdGFrZSBhbiBvYmplY3Qgb2YgcHJvcGVydGllcz8/Pz9cbiAge1xuICAgIG5hbWU6IFwibmV3X3RoaW5nXCIsXG4gICAgYWxpYXM6IFtcImV4cHJlc3Npb25cIiwgXCJzdGF0ZW1lbnRcIl0sXG4gICAgc3ludGF4OiBcIihjcmVhdGV8bmV3KSB7dHlwZX0gKD86d2l0aCB7cHJvcHM6b2JqZWN0X2xpdGVyYWxfcHJvcGVydGllc30pP1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBuZXdfdGhpbmcgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0eXBlLCBwcm9wcyA9IFwiXCIgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgLy8gU3BlY2lhbCBjYXNlIGZvciBvYmplY3QsIHdoaWNoIHdlJ2xsIGNyZWF0ZSB3aXRoIGFuIG9iamVjdCBsaXRlcmFsLlxuICAgICAgICBpZiAodHlwZSA9PT0gXCJPYmplY3RcIikge1xuICAgICAgICAgIGlmICghcHJvcHMpIHJldHVybiBcInt9XCI7XG4gICAgICAgICAgcmV0dXJuIHByb3BzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBuZXcgJHt0eXBlfSgke3Byb3BzfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBEZWNsYXJlIGluc3RhbmNlIG1ldGhvZCBvciBub3JtYWwgZnVuY3Rpb24uXG4gIHtcbiAgICBuYW1lOiBcImRlY2xhcmVfbWV0aG9kXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwiKG9wZXJhdG9yOnRvfG9uKSB7bmFtZTppZGVudGlmaWVyfSB7YXJnc30/IChcXFxcOik/IHtzdGF0ZW1lbnR9P1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkZWNsYXJlX21ldGhvZCBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBvcGVyYXRvciwgbmFtZSwgYXJncyA9IFtdfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgbGV0IHN1YlR5cGUgPSAob3BlcmF0b3IgPT09IFwidG9cIiA/IFwibWV0aG9kXCIgOiBcImV2ZW50XCIpO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcImZ1bmN0aW9uXCIsIHN1YlR5cGUsIG5hbWUsIGFyZ3MgfTtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIGFyZ3MgPSBbXSwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBsZXQgb3V0cHV0ID0gYCR7bmFtZX0oJHthcmdzLmpvaW4oXCIsIFwiKX0pIGA7XG4gICAgICAgIG91dHB1dCArPSBSdWxlLkJsb2NrLmVuY2xvc2VTdGF0ZW1lbnRzKHN0YXRlbWVudCwgYmxvY2spO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBEZWNsYXJlIFwiYWN0aW9uXCIsIHdoaWNoIGNhbiBiZSBjYWxsZWQgZ2xvYmFsbHkgYW5kIGFmZmVjdHMgdGhlIHBhcnNlci5cbiAgLy8gVE9ETzogYHdpdGhgIGNsYXVzZSAod2lsbCBjb25mbGljdCB3aXRoIGB3b3JkYClcbiAgLy8gVE9ETzogaW5zdGFsbCBpbiBwYXJzZXIgc29tZWhvd1xuICAvLyBUT0RPOiBjcmVhdGUgaW5zdGFuY2UgZnVuY3Rpb24/ICBvciBtYXliZSB3ZSBkb24ndCBuZWVkIGl0OlxuICAvL1x0XHRcdGBhY3Rpb24gdHVybiBDYXJkIG92ZXJgIGZvciBhbiBpbnN0YW5jZSBpcyBqdXN0IGB0dXJuIG1lIG92ZXJgXG4gIC8vXHRcdFx0YGFjdGlvbiBhZGQgY2FyZCB0byBkZWNrYCA9PiBgYWRkIG1lIHRvIGRlY2tgXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImRlY2xhcmVfYWN0aW9uXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwiYWN0aW9uIChrZXl3b3Jkczp7d29yZH18e3R5cGV9KSsgKFxcXFw6KT8ge3N0YXRlbWVudH0/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRlY2xhcmVfYWN0aW9uIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICAvLyBBZGQgYG5hbWVgLCBgYXJnc2AgYW5kIGB0eXBlc2AgdG8gbWF0Y2hlZCBzb3VyY2VcbiAgICAgIGdldCByZXN1bHRzKCkge1xuICAgICAgICBsZXQgb3V0cHV0ID0gc3VwZXIucmVzdWx0cztcblxuICAgICAgICAvLyBpZiB0aGVyZSdzIG9ubHkgb25lIGtleXdvcmQsIGl0IGNhbid0IGJlIGEgYmxhY2tsaXN0ZWQgaWRlbnRpZmllciBvciBhIHR5cGVcbiAgICAgICAgbGV0IHsga2V5d29yZHMgfSA9IG91dHB1dDtcbiAgICAgICAgbGV0IGtleXdvcmRNYXRjaGVzID0gdGhpcy5yZXN1bHRzLmtleXdvcmRzLm1hdGNoZWQ7XG4gICAgICAgIGlmIChrZXl3b3Jkcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICBsZXQga2V5d29yZCA9IGtleXdvcmRzWzBdO1xuICAgICAgICAgIGlmIChrZXl3b3JkTWF0Y2hlc1swXSBpbnN0YW5jZW9mIFJ1bGUuVHlwZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgcGFyc2UoJ2RlY2xhcmVfYWN0aW9uJyk6IG9uZS13b3JkIGFjdGlvbnMgbWF5IG5vdCBiZSB0eXBlczogJHtrZXl3b3JkfWApO1xuICAgICAgICAgIH1cblxuICAvLyBIQUNLOiBgZ2xvYmFsLnBhcnNlcmAgaXMgYSBoYWNrIGhlcmUgZm9yIGNvbnZlbmllbmNlIGluIHRlc3RpbmcuLi5cbi8vICAgICAgICAgICBsZXQgcGFyc2VyID0gKGNvbnRleHQgJiYgY29udGV4dC5wYXJzZXIpIHx8IGdsb2JhbC5wYXJzZXI7XG4vLyAgICAgICAgICAgbGV0IGJsYWNrbGlzdCA9IHBhcnNlci5nZXRCbGFja2xpc3QoXCJpZGVudGlmaWVyXCIpO1xuLy8gICAgICAgICAgIGlmIChibGFja2xpc3Rba2V5d29yZF0pIHtcbi8vICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHBhcnNlKCdkZWNsYXJlX2FjdGlvbicpOiBvbmUtd29yZCBhY3Rpb25zIG1heSBub3QgYmUgYmxhY2tsaXN0ZWQgaWRlbnRpZmllcnNcIjogJHtrZXl3b3JkfWApO1xuLy8gICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZpZ3VyZSBvdXQgYXJndW1lbnRzIGFuZC9vciB0eXBlc1xuICAgICAgICBvdXRwdXQuYXJncyA9IFtdO1xuICAgICAgICBvdXRwdXQudHlwZXMgPSB7fTtcblxuICAgICAgICAvLyBpZiBhbnkgb2YgdGhlIHdvcmRzIGFyZSB0eXBlcyAoY2FwaXRhbCBsZXR0ZXIpIG1ha2UgdGhhdCBhbiBhcmd1bWVudCBvZiB0aGUgc2FtZSBuYW1lLlxuICAgICAgICBrZXl3b3JkTWF0Y2hlcy5tYXAoIChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgUnVsZS5UeXBlKSB7XG4gICAgICAgICAgICBsZXQgVHlwZSA9IGtleXdvcmRzW2luZGV4XTtcbiAgICAgICAgICAgIGxldCB0eXBlID0gVHlwZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICBvdXRwdXQudHlwZXNbdHlwZV0gPSBUeXBlO1xuICAgICAgICAgICAgb3V0cHV0LmFyZ3MucHVzaCh0eXBlKTtcblxuICAgICAgICAgICAgLy8gcmVwbGFjZSB3aXRoIGxvd2VyY2FzZSBpbiBtZXRob2QgbmFtZVxuICAgICAgICAgICAga2V5d29yZHNbaW5kZXhdID0gdHlwZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBnZXQgc3RhdGljIG1ldGhvZCBuYW1lIGFuZCBhcmd1bWVudHMgZm9yIG91dHB1dFxuICAgICAgICBvdXRwdXQubmFtZSA9IGtleXdvcmRzLmpvaW4oXCJfXCIpO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgYXJncyA9IFtdLCB0eXBlcywgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuXG4gICAgICAgIC8vIGZpZ3VyZSBvdXQgaWYgdGhlcmUgYXJlIGFueSBjb25kaXRpb25zIGR1ZSB0byBrbm93biBhcmd1bWVudCB0eXBlc1xuICAgICAgICBsZXQgY29uZGl0aW9ucyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBhcmcgaW4gdHlwZXMpIHtcbiAgICAgICAgICBjb25kaXRpb25zLnB1c2goYFxcdGlmICghc3BlbGwuaXNBKCR7YXJnfSwgJHt0eXBlc1thcmddfSkpIHJldHVybiB1bmRlZmluZWRgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzdGF0ZW1lbnRzID0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhjb25kaXRpb25zLCBzdGF0ZW1lbnQsIGJsb2NrKTtcblxuICAgICAgICAvLyBDcmVhdGUgYXMgYSBTVEFUSUMgZnVuY3Rpb25cbiAgICAvL1RPRE86IGNyZWF0ZSBhcyBhbiBpbnN0YW5jZSBmdW5jdGlvbiB3ZSBjYW4gY2FsbCBvbiBvdXJzZWxmIVxuICAgICAgICByZXR1cm4gYHN0YXRpYyAke25hbWV9KCR7YXJncy5qb2luKFwiLCBcIil9KSAke3N0YXRlbWVudHN9YDtcbiAgICAgIH1cblxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIGFyZ3MsIHR5cGVzIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IFwiZnVuY3Rpb25cIiwgc3ViVHlwZTogXCJhY3Rpb25cIiwgbmFtZSwgYXJncywgdHlwZXMgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIEdldHRlciBlaXRoZXIgd2l0aCBvciB3aXRob3V0IGFyZ3VtZW50cy5cbiAgLy8gSWYgeW91IHNwZWNpZnkgYXJndW1lbnRzLCB5aWVsZHMgYSBub3JtYWwgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHZhbHVlLlxuICAvLyBUT0RPOiBgdG8gZ2V0Li4uYCA/XG4gIHtcbiAgICBuYW1lOiBcImdldHRlclwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcImdldCB7bmFtZTppZGVudGlmaWVyfVxcXFw6IHtleHByZXNzaW9ufT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZ2V0dGVyIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgZXhwcmVzc2lvbiwgYmxvY2sgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgLy8gSWYgdGhleSBzcGVjaWZpZWQgYW4gaW5saW5lLWV4cHJlc3Npb24sIHByZXBlbmQgcmV0dXJuXG4gICAgICAgIGlmIChleHByZXNzaW9uICYmICFleHByZXNzaW9uLnN0YXJ0c1dpdGgoXCJyZXR1cm4gXCIpKSBleHByZXNzaW9uID0gYHJldHVybiAoJHtleHByZXNzaW9ufSlgO1xuICAgICAgICBsZXQgb3V0cHV0ID0gYGdldCAke25hbWV9KCkgYDtcbiAgICAgICAgb3V0cHV0ICs9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoZXhwcmVzc2lvbiwgYmxvY2spO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IG5hbWUgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBzdWJUeXBlOiBcImdldHRlclwiLCBuYW1lIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gU2V0dGVyLlxuICAvLyBDb21wbGFpbnMgaWYgeW91IHNwZWNpZnkgbW9yZSB0aGFuIG9uZSBhcmd1bWVudC5cbiAgLy8gSWYgeW91IGRvbid0IHBhc3MgYW4gZXhwbGljaXQgYXJndW1lbnQsIHdlJ2xsIGFzc3VtZSBpdCdzIHRoZSBzYW1lIGFzIHRoZSBpZGVudGlmaWVyLlxuICAvLyBlZztcdGBzZXQgY29sb3I6IHNldCB0aGUgY29sb3Igb2YgbXkgdGV4dCB0byBjb2xvcmBcbiAgLy9cbiAgLy8gVE9ETzogaW50ZXJuYWwgZ2V0dGVyL3NldHRlciBzZW1hbnRpY3MgYWxhIG9iamVjdGl2ZSBDXG4gIC8vXHRcdFx0YHNldCBjb2xvcjogaWYgY29sb3IgaXMgaW4gW1wicmVkXCIsIFwiYmx1ZVwiXSB0aGVuIHNldCBteSBjb2xvciB0byBjb2xvcmBcbiAgLy9cdFx0ID0+IGBteSBjb2xvcmAgd2l0aGluIHNldHRlciBzaG91bGQgYXV0b21hdGljYWxseSB0cmFuc2xhdGUgdG8gYHRoaXMuX2NvbG9yYCA/Pz9cbiAgLy8gVE9ETzogYHRvIHNldC4uLmAgP1xuICB7XG4gICAgbmFtZTogXCJzZXR0ZXJcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJzZXQge25hbWU6aWRlbnRpZmllcn0ge2FyZ3N9PyAoXFxcXDopPyB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgc2V0dGVyIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgLy8gZGVmYXVsdCBhcmdzIHRvIHRoZSBzZXR0ZXIgbmFtZVxuICAgICAgICBsZXQgeyBuYW1lLCBhcmdzID0gW25hbWVdLCBzdGF0ZW1lbnQsIGJsb2NrIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIC8vIENvbXBsYWluIGlmIG1vcmUgdGhhbiBvbmUgYXJndW1lbnRcbiAgICAgICAgaWYgKGFyZ3MgJiYgYXJncy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwicGFyc2UoJ3NldHRlcicpOiBvbmx5IG9uZSBhcmd1bWVudCBhbGxvd2VkIGluIHNldHRlcjogIFwiLCB0aGlzLm1hdGNoZWRUZXh0KTtcbiAgICAgICAgICBhcmdzID0gWyBhcmdzWzBdIF07XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG91dHB1dCA9IGBzZXQgJHtuYW1lfSgke2FyZ3N9KSBgO1xuICAgICAgICBvdXRwdXQgKz0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhzdGF0ZW1lbnQsIGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBuYW1lIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IFwicHJvcGVydHlcIiwgc3ViVHlwZTogXCJzZXR0ZXJcIiwgbmFtZSB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy9cbiAgLy9cdGRlY2xhcmUgcHJvcGVydGllc1xuICAvL1xuXG4gIC8vVE9ETzogYW5vdGhlciBuYW1lIGZvciBgY29uc3RhbnRgID9cbiAge1xuICAgIG5hbWU6IFwiZGVjbGFyZV9wcm9wZXJ0eVwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcIihzY29wZTpwcm9wZXJ0eXxjb25zdGFudHxzaGFyZWQgcHJvcGVydHkpIHtuYW1lOmlkZW50aWZpZXJ9ICg/Oj0ge3ZhbHVlOmV4cHJlc3Npb259KT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVjbGFyZV9wcm9wZXJ0eSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHNjb3BlLCBuYW1lLCB2YWx1ZSA9IFwiXCIgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgaWYgKHZhbHVlKSB2YWx1ZSA9IGAgPSAke3ZhbHVlfWA7XG5cbiAgICAgICAgbGV0IGRlY2xhcmF0aW9uID0gYCR7bmFtZX0ke3ZhbHVlfWA7XG4gICAgICAgIHN3aXRjaCAoc2NvcGUpIHtcbiAgICAgICAgICBjYXNlIFwiY29uc3RhbnRcIjpcbi8vICAgICAgICAgICAgaWYgKCF2YWx1ZSkgY29uc29sZS53YXJuKFwicGFyc2UoJ2RlY2xhcmVfcHJvcGVydHknKTogY29uc3RhbnQgcHJvcGVydGllcyBtdXN0IGRlY2xhcmUgYSB2YWx1ZTogIFwiLCB0aGlzLm1hdGNoZWRUZXh0KTtcbiAgICAgICAgICAgIHJldHVybiBgY29uc3QgJHtkZWNsYXJhdGlvbn1gO1xuXG4gICAgICAgICAgY2FzZSBcInNoYXJlZCBwcm9wZXJ0eVwiOlxuICAgICAgICAgICAgcmV0dXJuIGBAcHJvdG8gJHtkZWNsYXJhdGlvbn1gO1xuXG4gICAgICAgICAgY2FzZSBcInByb3BlcnR5XCI6XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBkZWNsYXJhdGlvbjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IHNjb3BlLCBuYW1lIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IFwicHJvcGVydHlcIiwgbmFtZSwgc2NvcGUgfTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gVE9ETzogc2NvcGVfbW9kaWZpZXI/Pz9cbiAgLy8gVE9ETzogaW5pdGlhbCB2YWx1ZVxuICB7XG4gICAgbmFtZTogXCJkZWNsYXJlX3Byb3BlcnR5X29mX3R5cGVcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJwcm9wZXJ0eSB7bmFtZTppZGVudGlmaWVyfSBhcyAoYXxhbik/IHt0eXBlfVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkZWNsYXJlX3Byb3BlcnR5X29mX3R5cGUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBuYW1lLCB0eXBlIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgZ2V0ICR7bmFtZX0oKSB7IHJldHVybiB0aGlzLl9fJHtuYW1lfSB9XFxuYFxuICAgICAgICAgICArIGBzZXQgJHtuYW1lfSh2YWx1ZSkgeyBpZiAoc3BlbGwuaXNBKHZhbHVlLCAke3R5cGV9KSB0aGlzLl9fJHtuYW1lfSA9IHZhbHVlIH1gO1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHR5cGUgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBzdWJUeXBlOiBcInNldHRlclwiLCBuYW1lLCBkYXRhVHlwZTogdHlwZSB9O1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFRPRE86IHdhcm4gb24gaW52YWxpZCBzZXQ/ICBzaGFyZWQ/ICB1bmRlZmluZWQ/IHNvbWV0aGluZyBvdGhlciB0aGFuIHRoZSBmaXJzdCB2YWx1ZSBhcyBkZWZhdWx0P1xuICB7XG4gICAgbmFtZTogXCJkZWNsYXJlX3Byb3BlcnR5X2FzX29uZV9vZlwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcInByb3BlcnR5IHtuYW1lOmlkZW50aWZpZXJ9IGFzIG9uZSBvZiB7bGlzdDpsaXRlcmFsX2xpc3R9XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRlY2xhcmVfcHJvcGVydHlfYXNfb25lX29mIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICBnZXQgcmVzdWx0cygpIHtcbiAgICAgICAgbGV0IHJlc3VsdHMgPSBzdXBlci5yZXN1bHRzO1xuICAgICAgICByZXN1bHRzLnBsdXJhbCA9IHBsdXJhbGl6ZShyZXN1bHRzLm5hbWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHBsdXJhbCwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYEBwcm90byAke3BsdXJhbH0gPSAke2xpc3R9XFxuYFxuICAgICAgICAgICArIGBnZXQgJHtuYW1lfSgpIHsgcmV0dXJuIHRoaXMuX18ke25hbWV9ID09PSB1bmRlZmluZWQgPyB0aGlzLiR7cGx1cmFsfVswXSA6IHRoaXMuX18ke25hbWV9IH1cXG5gXG4gICAgICAgICAgICsgYHNldCAke25hbWV9KHZhbHVlKSB7IGlmICh0aGlzLiR7cGx1cmFsfS5pbmNsdWRlcyh2YWx1ZSkpIHRoaXMuX18ke25hbWV9ID0gdmFsdWUgfWA7XG5cbiAgLy8gTU9SRSBFRkZJQ0lFTlQgQlVUIFVHTElFUlxuICAvLyBcdFx0XHRyZXR1cm4gYHN0YXRpYyAke3BsdXJhbH0gPSAke2xpc3R9O1xcbmBcbiAgLy8gXHRcdFx0XHQgKyBgZ2V0ICR7bmFtZX0geyByZXR1cm4gKFwiX18ke25hbWV9XCIgaW4gdGhpcyA/IHRoaXMuX18ke25hbWV9IDogJHtmaXJzdFZhbHVlfSkgfVxcbmBcbiAgLy8gXHRcdFx0XHQgKyBgc2V0ICR7bmFtZX0odmFsdWUpIHsgaWYgKHRoaXMuY29uc3RydWN0b3IuJHtwbHVyYWx9LmluY2x1ZGVzKHZhbHVlKSkgdGhpcy5fXyR7bmFtZX0gPSB2YWx1ZSB9YDtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBuYW1lLCBwbHVyYWwgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICB7IHR5cGU6IFwicHJvcGVydHlcIiwgbmFtZSB9LFxuICAgICAgICAgIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBzdWJUeXBlOiBcInNoYXJlZFwiLCBuYW1lOiBwbHVyYWwgfVxuICAgICAgICBdO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vXG4gIC8vXHRTZWxmLXJlZmVyZW5jZVxuICAvL1xuICB7XG4gICAgbmFtZTogXCJtZVwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwibWVcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbWUgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gXCJ0aGlzXCI7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFRPRE86IHRoaXMgcmVhbGx5IG1ha2VzIG1lIHdhbnQgdG8gbWFrZSBgSSBhbSBlbXB0eWAgZXRjIHdvcmsuLi5cbiAge1xuICAgIG5hbWU6IFwiSVwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiSVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBJIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIFwidGhpc1wiO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vXG4gIC8vXHRQcm9wZXJ0eSBhY2Nlc3NcbiAgLy9cblxuICB7XG4gICAgbmFtZTogXCJwcm9wZXJ0eV9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCIocHJvcGVydGllczp0aGUge2lkZW50aWZpZXJ9IG9mKSsgdGhlPyB7ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcHJvcGVydHlfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgZ2V0IHJlc3VsdHMoKSB7XG4gICAgICAgIGxldCB7IGV4cHJlc3Npb24sIHByb3BlcnRpZXNfLCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHByb3BlcnRpZXM6IF9wcm9wZXJ0aWVzLm1hdGNoZWQubWFwKCBwcm9wZXJ0eSA9PiBwcm9wZXJ0eS5yZXN1bHRzLmlkZW50aWZpZXIgKVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgZXhwcmVzc2lvbiwgcHJvcGVydGllcyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBwcm9wZXJ0aWVzID0gcHJvcGVydGllcy5yZXZlcnNlKCkuam9pbihcIi5cIik7XG4gICAgICAgIHJldHVybiBgJHtleHByZXNzaW9ufS4ke3Byb3BlcnRpZXN9YDtcbiAgLy8gTk9URTogdGhlIGZvbGxvd2luZyBpcyBzYWZlciwgYnV0IHVnbHkgZm9yIGRlbW8gcHVycG9zZXNcbiAgLy9cdFx0XHRyZXR1cm4gYHNwZWxsLmdldCgke2V4cHJlc3Npb259LCBbJyR7cHJvcGVydGllc30nXSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJteV9wcm9wZXJ0eV9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCIobXl8dGhpcykge2lkZW50aWZpZXJ9XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG15X3Byb3BlcnR5X2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgdGhpcy4ke2lkZW50aWZpZXJ9YDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvL1xuICAvL1x0VXRpbGl0eVxuICAvL1xuXG5cbiAgLy8gUHJvcGVydGllcyBjbGF1c2U6IGNyZWF0ZXMgYW4gb2JqZWN0IHdpdGggb25lIG9yIG1vcmUgcHJvcGVydHkgdmFsdWVzLlxuICAvL1x0YGZvbyA9IDEsIGJhciA9IDJgXG4gIC8vVE9ETzogd291bGQgbGlrZSB0byB1c2UgYGFuZGAgYnV0IHRoYXQgd2lsbCBiYXJmIG9uIGV4cHJlc3Npb25zLi4uXG4gIC8vVE9ETzogaG93IHRvIGRvIHByb3BlcnRpZXMgb24gbXVsdGlwbGUgbGluZXM/XG4gIHtcbiAgICBuYW1lOiBcIm9iamVjdF9saXRlcmFsX3Byb3BlcnRpZXNcIixcbiAgICBzeW50YXg6IFwiWyh7a2V5OmlkZW50aWZpZXJ9KD86PSB7dmFsdWU6ZXhwcmVzc2lvbn0pPykgLF1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb2JqZWN0X2xpdGVyYWxfcHJvcGVydGllcyBleHRlbmRzIFJ1bGUuTGlzdCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHByb3BzID0gdGhpcy5yZXN1bHRzLm1hdGNoZWQubWFwKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgICAgICBsZXQgeyBrZXksIHZhbHVlIH0gPSBwcm9wLnJlc3VsdHM7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHJldHVybiBgXCIke2tleX1cIjogJHt2YWx1ZX1gXG4gICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYHsgJHtwcm9wcy5qb2luKFwiLCBcIil9IH1gO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vTU9WRSBUTyBgZnVuY3Rpb25zYD9cbiAgLy8gQXJndW1lbnRzIGNsYXVzZSBmb3IgbWV0aG9kc1xuICAvL1x0YHdpdGggZm9vYCBvciBgd2l0aCBmb28gYW5kIGJhciBhbmQgYmF6YFxuICAvL1RPRE86IHtpZGVudGlmaWVyfSA9IHtleHByZXNzaW9ufVx0PT4gcmVxdWlyZXMgYCxgIGluc3RlYWQgb2YgYGFuZGBcbiAgLy9UT0RPOiBgd2l0aCBmb28gYXMgVHlwZWBcbiAgLy9UT0RPOlx0YHdpdGggZm9vLi4uYCBmb3Igc3BsYXQ/XG4gIHtcbiAgICBuYW1lOiBcImFyZ3NcIixcbiAgICBzeW50YXg6IFwid2l0aCBbYXJnczp7aWRlbnRpZmllcn0sXVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBhcmdzIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICAvLyBSZXR1cm5zIGFuIGFycmF5IG9mIGFyZ3VtZW50IHZhbHVlc1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdHMuX2FyZ3MubWF0Y2hlZC5tYXAoYXJnID0+IGFyZy50b1NvdXJjZSgpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvdHlwZXMuanMiLCJyZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zeW1ib2wnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9fY29yZScpLlN5bWJvbDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL2VzNi9zeW1ib2wuanNcbi8vIG1vZHVsZSBpZCA9IDUwMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpIHRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGEgZnVuY3Rpb24hJyk7XG4gIHJldHVybiBpdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzXG4vLyBtb2R1bGUgaWQgPSA1NDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gZmFsc2UgLT4gQXJyYXkjaW5kZXhPZlxuLy8gdHJ1ZSAgLT4gQXJyYXkjaW5jbHVkZXNcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuL190by1sZW5ndGgnKTtcbnZhciB0b0Fic29sdXRlSW5kZXggPSByZXF1aXJlKCcuL190by1hYnNvbHV0ZS1pbmRleCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoSVNfSU5DTFVERVMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcywgZWwsIGZyb21JbmRleCkge1xuICAgIHZhciBPID0gdG9JT2JqZWN0KCR0aGlzKTtcbiAgICB2YXIgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpO1xuICAgIHZhciBpbmRleCA9IHRvQWJzb2x1dGVJbmRleChmcm9tSW5kZXgsIGxlbmd0aCk7XG4gICAgdmFyIHZhbHVlO1xuICAgIC8vIEFycmF5I2luY2x1ZGVzIHVzZXMgU2FtZVZhbHVlWmVybyBlcXVhbGl0eSBhbGdvcml0aG1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgaWYgKElTX0lOQ0xVREVTICYmIGVsICE9IGVsKSB3aGlsZSAobGVuZ3RoID4gaW5kZXgpIHtcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgIGlmICh2YWx1ZSAhPSB2YWx1ZSkgcmV0dXJuIHRydWU7XG4gICAgLy8gQXJyYXkjaW5kZXhPZiBpZ25vcmVzIGhvbGVzLCBBcnJheSNpbmNsdWRlcyAtIG5vdFxuICAgIH0gZWxzZSBmb3IgKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKykgaWYgKElTX0lOQ0xVREVTIHx8IGluZGV4IGluIE8pIHtcbiAgICAgIGlmIChPW2luZGV4XSA9PT0gZWwpIHJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleCB8fCAwO1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qc1xuLy8gbW9kdWxlIGlkID0gNTQ4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGdldHRpbmcgdGFnIGZyb20gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG52YXIgVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyk7XG4vLyBFUzMgd3JvbmcgaGVyZVxudmFyIEFSRyA9IGNvZihmdW5jdGlvbiAoKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ0FyZ3VtZW50cyc7XG5cbi8vIGZhbGxiYWNrIGZvciBJRTExIFNjcmlwdCBBY2Nlc3MgRGVuaWVkIGVycm9yXG52YXIgdHJ5R2V0ID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gaXRba2V5XTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgTywgVCwgQjtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IGl0ID09PSBudWxsID8gJ051bGwnXG4gICAgLy8gQEB0b1N0cmluZ1RhZyBjYXNlXG4gICAgOiB0eXBlb2YgKFQgPSB0cnlHZXQoTyA9IE9iamVjdChpdCksIFRBRykpID09ICdzdHJpbmcnID8gVFxuICAgIC8vIGJ1aWx0aW5UYWcgY2FzZVxuICAgIDogQVJHID8gY29mKE8pXG4gICAgLy8gRVMzIGFyZ3VtZW50cyBmYWxsYmFja1xuICAgIDogKEIgPSBjb2YoTykpID09ICdPYmplY3QnICYmIHR5cGVvZiBPLmNhbGxlZSA9PSAnZnVuY3Rpb24nID8gJ0FyZ3VtZW50cycgOiBCO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2NsYXNzb2YuanNcbi8vIG1vZHVsZSBpZCA9IDU0OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBvcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuL19hLWZ1bmN0aW9uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbiwgdGhhdCwgbGVuZ3RoKSB7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmICh0aGF0ID09PSB1bmRlZmluZWQpIHJldHVybiBmbjtcbiAgc3dpdGNoIChsZW5ndGgpIHtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbiAoYSkge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKC8qIC4uLmFyZ3MgKi8pIHtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19jdHguanNcbi8vIG1vZHVsZSBpZCA9IDU1MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyA3LjIuMSBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ID09IHVuZGVmaW5lZCkgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZGVmaW5lZC5qc1xuLy8gbW9kdWxlIGlkID0gNTUxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGFsbCBlbnVtZXJhYmxlIG9iamVjdCBrZXlzLCBpbmNsdWRlcyBzeW1ib2xzXG52YXIgZ2V0S2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJyk7XG52YXIgZ09QUyA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BzJyk7XG52YXIgcElFID0gcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdmFyIHJlc3VsdCA9IGdldEtleXMoaXQpO1xuICB2YXIgZ2V0U3ltYm9scyA9IGdPUFMuZjtcbiAgaWYgKGdldFN5bWJvbHMpIHtcbiAgICB2YXIgc3ltYm9scyA9IGdldFN5bWJvbHMoaXQpO1xuICAgIHZhciBpc0VudW0gPSBwSUUuZjtcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGtleTtcbiAgICB3aGlsZSAoc3ltYm9scy5sZW5ndGggPiBpKSBpZiAoaXNFbnVtLmNhbGwoaXQsIGtleSA9IHN5bWJvbHNbaSsrXSkpIHJlc3VsdC5wdXNoKGtleSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWtleXMuanNcbi8vIG1vZHVsZSBpZCA9IDU1MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxudmFyICRleHBvcnQgPSBmdW5jdGlvbiAodHlwZSwgbmFtZSwgc291cmNlKSB7XG4gIHZhciBJU19GT1JDRUQgPSB0eXBlICYgJGV4cG9ydC5GO1xuICB2YXIgSVNfR0xPQkFMID0gdHlwZSAmICRleHBvcnQuRztcbiAgdmFyIElTX1NUQVRJQyA9IHR5cGUgJiAkZXhwb3J0LlM7XG4gIHZhciBJU19QUk9UTyA9IHR5cGUgJiAkZXhwb3J0LlA7XG4gIHZhciBJU19CSU5EID0gdHlwZSAmICRleHBvcnQuQjtcbiAgdmFyIHRhcmdldCA9IElTX0dMT0JBTCA/IGdsb2JhbCA6IElTX1NUQVRJQyA/IGdsb2JhbFtuYW1lXSB8fCAoZ2xvYmFsW25hbWVdID0ge30pIDogKGdsb2JhbFtuYW1lXSB8fCB7fSlbUFJPVE9UWVBFXTtcbiAgdmFyIGV4cG9ydHMgPSBJU19HTE9CQUwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KTtcbiAgdmFyIGV4cFByb3RvID0gZXhwb3J0c1tQUk9UT1RZUEVdIHx8IChleHBvcnRzW1BST1RPVFlQRV0gPSB7fSk7XG4gIHZhciBrZXksIG93biwgb3V0LCBleHA7XG4gIGlmIChJU19HTE9CQUwpIHNvdXJjZSA9IG5hbWU7XG4gIGZvciAoa2V5IGluIHNvdXJjZSkge1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIHRhcmdldFtrZXldICE9PSB1bmRlZmluZWQ7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSAob3duID8gdGFyZ2V0IDogc291cmNlKVtrZXldO1xuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XG4gICAgZXhwID0gSVNfQklORCAmJiBvd24gPyBjdHgob3V0LCBnbG9iYWwpIDogSVNfUFJPVE8gJiYgdHlwZW9mIG91dCA9PSAnZnVuY3Rpb24nID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgLy8gZXh0ZW5kIGdsb2JhbFxuICAgIGlmICh0YXJnZXQpIHJlZGVmaW5lKHRhcmdldCwga2V5LCBvdXQsIHR5cGUgJiAkZXhwb3J0LlUpO1xuICAgIC8vIGV4cG9ydFxuICAgIGlmIChleHBvcnRzW2tleV0gIT0gb3V0KSBoaWRlKGV4cG9ydHMsIGtleSwgZXhwKTtcbiAgICBpZiAoSVNfUFJPVE8gJiYgZXhwUHJvdG9ba2V5XSAhPSBvdXQpIGV4cFByb3RvW2tleV0gPSBvdXQ7XG4gIH1cbn07XG5nbG9iYWwuY29yZSA9IGNvcmU7XG4vLyB0eXBlIGJpdG1hcFxuJGV4cG9ydC5GID0gMTsgICAvLyBmb3JjZWRcbiRleHBvcnQuRyA9IDI7ICAgLy8gZ2xvYmFsXG4kZXhwb3J0LlMgPSA0OyAgIC8vIHN0YXRpY1xuJGV4cG9ydC5QID0gODsgICAvLyBwcm90b1xuJGV4cG9ydC5CID0gMTY7ICAvLyBiaW5kXG4kZXhwb3J0LlcgPSAzMjsgIC8vIHdyYXBcbiRleHBvcnQuVSA9IDY0OyAgLy8gc2FmZVxuJGV4cG9ydC5SID0gMTI4OyAvLyByZWFsIHByb3RvIG1ldGhvZCBmb3IgYGxpYnJhcnlgXG5tb2R1bGUuZXhwb3J0cyA9ICRleHBvcnQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19leHBvcnQuanNcbi8vIG1vZHVsZSBpZCA9IDU1M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudDtcbm1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faHRtbC5qc1xuLy8gbW9kdWxlIGlkID0gNTU0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApID8gT2JqZWN0IDogZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19pb2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSA1NTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gNy4yLjIgSXNBcnJheShhcmd1bWVudClcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiBpc0FycmF5KGFyZykge1xuICByZXR1cm4gY29mKGFyZykgPT0gJ0FycmF5Jztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19pcy1hcnJheS5qc1xuLy8gbW9kdWxlIGlkID0gNTU2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBNRVRBID0gcmVxdWlyZSgnLi9fdWlkJykoJ21ldGEnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIHNldERlc2MgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mO1xudmFyIGlkID0gMDtcbnZhciBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRydWU7XG59O1xudmFyIEZSRUVaRSA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGlzRXh0ZW5zaWJsZShPYmplY3QucHJldmVudEV4dGVuc2lvbnMoe30pKTtcbn0pO1xudmFyIHNldE1ldGEgPSBmdW5jdGlvbiAoaXQpIHtcbiAgc2V0RGVzYyhpdCwgTUVUQSwgeyB2YWx1ZToge1xuICAgIGk6ICdPJyArICsraWQsIC8vIG9iamVjdCBJRFxuICAgIHc6IHt9ICAgICAgICAgIC8vIHdlYWsgY29sbGVjdGlvbnMgSURzXG4gIH0gfSk7XG59O1xudmFyIGZhc3RLZXkgPSBmdW5jdGlvbiAoaXQsIGNyZWF0ZSkge1xuICAvLyByZXR1cm4gcHJpbWl0aXZlIHdpdGggcHJlZml4XG4gIGlmICghaXNPYmplY3QoaXQpKSByZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnID8gaXQgOiAodHlwZW9mIGl0ID09ICdzdHJpbmcnID8gJ1MnIDogJ1AnKSArIGl0O1xuICBpZiAoIWhhcyhpdCwgTUVUQSkpIHtcbiAgICAvLyBjYW4ndCBzZXQgbWV0YWRhdGEgdG8gdW5jYXVnaHQgZnJvemVuIG9iamVjdFxuICAgIGlmICghaXNFeHRlbnNpYmxlKGl0KSkgcmV0dXJuICdGJztcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBtZXRhZGF0YVxuICAgIGlmICghY3JlYXRlKSByZXR1cm4gJ0UnO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBvYmplY3QgSURcbiAgfSByZXR1cm4gaXRbTUVUQV0uaTtcbn07XG52YXIgZ2V0V2VhayA9IGZ1bmN0aW9uIChpdCwgY3JlYXRlKSB7XG4gIGlmICghaGFzKGl0LCBNRVRBKSkge1xuICAgIC8vIGNhbid0IHNldCBtZXRhZGF0YSB0byB1bmNhdWdodCBmcm96ZW4gb2JqZWN0XG4gICAgaWYgKCFpc0V4dGVuc2libGUoaXQpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBtZXRhZGF0YVxuICAgIGlmICghY3JlYXRlKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gYWRkIG1pc3NpbmcgbWV0YWRhdGFcbiAgICBzZXRNZXRhKGl0KTtcbiAgLy8gcmV0dXJuIGhhc2ggd2VhayBjb2xsZWN0aW9ucyBJRHNcbiAgfSByZXR1cm4gaXRbTUVUQV0udztcbn07XG4vLyBhZGQgbWV0YWRhdGEgb24gZnJlZXplLWZhbWlseSBtZXRob2RzIGNhbGxpbmdcbnZhciBvbkZyZWV6ZSA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoRlJFRVpFICYmIG1ldGEuTkVFRCAmJiBpc0V4dGVuc2libGUoaXQpICYmICFoYXMoaXQsIE1FVEEpKSBzZXRNZXRhKGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcbnZhciBtZXRhID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIEtFWTogTUVUQSxcbiAgTkVFRDogZmFsc2UsXG4gIGZhc3RLZXk6IGZhc3RLZXksXG4gIGdldFdlYWs6IGdldFdlYWssXG4gIG9uRnJlZXplOiBvbkZyZWV6ZVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX21ldGEuanNcbi8vIG1vZHVsZSBpZCA9IDU1N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyAxOS4xLjIuMiAvIDE1LjIuMy41IE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGRQcyA9IHJlcXVpcmUoJy4vX29iamVjdC1kcHMnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKTtcbnZhciBJRV9QUk9UTyA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKTtcbnZhciBFbXB0eSA9IGZ1bmN0aW9uICgpIHsgLyogZW1wdHkgKi8gfTtcbnZhciBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxuLy8gQ3JlYXRlIG9iamVjdCB3aXRoIGZha2UgYG51bGxgIHByb3RvdHlwZTogdXNlIGlmcmFtZSBPYmplY3Qgd2l0aCBjbGVhcmVkIHByb3RvdHlwZVxudmFyIGNyZWF0ZURpY3QgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIFRocmFzaCwgd2FzdGUgYW5kIHNvZG9teTogSUUgR0MgYnVnXG4gIHZhciBpZnJhbWUgPSByZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2lmcmFtZScpO1xuICB2YXIgaSA9IGVudW1CdWdLZXlzLmxlbmd0aDtcbiAgdmFyIGx0ID0gJzwnO1xuICB2YXIgZ3QgPSAnPic7XG4gIHZhciBpZnJhbWVEb2N1bWVudDtcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIHJlcXVpcmUoJy4vX2h0bWwnKS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICBpZnJhbWUuc3JjID0gJ2phdmFzY3JpcHQ6JzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zY3JpcHQtdXJsXG4gIC8vIGNyZWF0ZURpY3QgPSBpZnJhbWUuY29udGVudFdpbmRvdy5PYmplY3Q7XG4gIC8vIGh0bWwucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcbiAgaWZyYW1lRG9jdW1lbnQgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgaWZyYW1lRG9jdW1lbnQub3BlbigpO1xuICBpZnJhbWVEb2N1bWVudC53cml0ZShsdCArICdzY3JpcHQnICsgZ3QgKyAnZG9jdW1lbnQuRj1PYmplY3QnICsgbHQgKyAnL3NjcmlwdCcgKyBndCk7XG4gIGlmcmFtZURvY3VtZW50LmNsb3NlKCk7XG4gIGNyZWF0ZURpY3QgPSBpZnJhbWVEb2N1bWVudC5GO1xuICB3aGlsZSAoaS0tKSBkZWxldGUgY3JlYXRlRGljdFtQUk9UT1RZUEVdW2VudW1CdWdLZXlzW2ldXTtcbiAgcmV0dXJuIGNyZWF0ZURpY3QoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiBjcmVhdGUoTywgUHJvcGVydGllcykge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoTyAhPT0gbnVsbCkge1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBhbk9iamVjdChPKTtcbiAgICByZXN1bHQgPSBuZXcgRW1wdHkoKTtcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gbnVsbDtcbiAgICAvLyBhZGQgXCJfX3Byb3RvX19cIiBmb3IgT2JqZWN0LmdldFByb3RvdHlwZU9mIHBvbHlmaWxsXG4gICAgcmVzdWx0W0lFX1BST1RPXSA9IE87XG4gIH0gZWxzZSByZXN1bHQgPSBjcmVhdGVEaWN0KCk7XG4gIHJldHVybiBQcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiBkUHMocmVzdWx0LCBQcm9wZXJ0aWVzKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtY3JlYXRlLmpzXG4vLyBtb2R1bGUgaWQgPSA1NThcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBnZXRLZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIHZhciBrZXlzID0gZ2V0S2V5cyhQcm9wZXJ0aWVzKTtcbiAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICB2YXIgaSA9IDA7XG4gIHZhciBQO1xuICB3aGlsZSAobGVuZ3RoID4gaSkgZFAuZihPLCBQID0ga2V5c1tpKytdLCBQcm9wZXJ0aWVzW1BdKTtcbiAgcmV0dXJuIE87XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwcy5qc1xuLy8gbW9kdWxlIGlkID0gNTU5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBwSUUgPSByZXF1aXJlKCcuL19vYmplY3QtcGllJyk7XG52YXIgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4vX2llOC1kb20tZGVmaW5lJyk7XG52YXIgZ09QRCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG5cbmV4cG9ydHMuZiA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBnT1BEIDogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApIHtcbiAgTyA9IHRvSU9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBpZiAoSUU4X0RPTV9ERUZJTkUpIHRyeSB7XG4gICAgcmV0dXJuIGdPUEQoTywgUCk7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoaGFzKE8sIFApKSByZXR1cm4gY3JlYXRlRGVzYyghcElFLmYuY2FsbChPLCBQKSwgT1tQXSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcGQuanNcbi8vIG1vZHVsZSBpZCA9IDU2MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBmYWxsYmFjayBmb3IgSUUxMSBidWdneSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB3aXRoIGlmcmFtZSBhbmQgd2luZG93XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIGdPUE4gPSByZXF1aXJlKCcuL19vYmplY3QtZ29wbicpLmY7XG52YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxudmFyIHdpbmRvd05hbWVzID0gdHlwZW9mIHdpbmRvdyA9PSAnb2JqZWN0JyAmJiB3aW5kb3cgJiYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXNcbiAgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh3aW5kb3cpIDogW107XG5cbnZhciBnZXRXaW5kb3dOYW1lcyA9IGZ1bmN0aW9uIChpdCkge1xuICB0cnkge1xuICAgIHJldHVybiBnT1BOKGl0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB3aW5kb3dOYW1lcy5zbGljZSgpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5mID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCkge1xuICByZXR1cm4gd2luZG93TmFtZXMgJiYgdG9TdHJpbmcuY2FsbChpdCkgPT0gJ1tvYmplY3QgV2luZG93XScgPyBnZXRXaW5kb3dOYW1lcyhpdCkgOiBnT1BOKHRvSU9iamVjdChpdCkpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BuLWV4dC5qc1xuLy8gbW9kdWxlIGlkID0gNTYxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkZWYgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIFRBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgdGFnLCBzdGF0KSB7XG4gIGlmIChpdCAmJiAhaGFzKGl0ID0gc3RhdCA/IGl0IDogaXQucHJvdG90eXBlLCBUQUcpKSBkZWYoaXQsIFRBRywgeyBjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiB0YWcgfSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fc2V0LXRvLXN0cmluZy10YWcuanNcbi8vIG1vZHVsZSBpZCA9IDU2MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIG1heCA9IE1hdGgubWF4O1xudmFyIG1pbiA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW5kZXgsIGxlbmd0aCkge1xuICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XG4gIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3RvLWFic29sdXRlLWluZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA1NjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gNy4xLjE1IFRvTGVuZ3RoXG52YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIG1pbiA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCAweDFmZmZmZmZmZmZmZmZmKSA6IDA7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL190by1sZW5ndGguanNcbi8vIG1vZHVsZSBpZCA9IDU2NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBMSUJSQVJZID0gcmVxdWlyZSgnLi9fbGlicmFyeScpO1xudmFyIHdrc0V4dCA9IHJlcXVpcmUoJy4vX3drcy1leHQnKTtcbnZhciBkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmY7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHZhciAkU3ltYm9sID0gY29yZS5TeW1ib2wgfHwgKGNvcmUuU3ltYm9sID0gTElCUkFSWSA/IHt9IDogZ2xvYmFsLlN5bWJvbCB8fCB7fSk7XG4gIGlmIChuYW1lLmNoYXJBdCgwKSAhPSAnXycgJiYgIShuYW1lIGluICRTeW1ib2wpKSBkZWZpbmVQcm9wZXJ0eSgkU3ltYm9sLCBuYW1lLCB7IHZhbHVlOiB3a3NFeHQuZihuYW1lKSB9KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL193a3MtZGVmaW5lLmpzXG4vLyBtb2R1bGUgaWQgPSA1NjVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuLy8gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4vX2NsYXNzb2YnKTtcbnZhciB0ZXN0ID0ge307XG50ZXN0W3JlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpXSA9ICd6JztcbmlmICh0ZXN0ICsgJycgIT0gJ1tvYmplY3Qgel0nKSB7XG4gIHJlcXVpcmUoJy4vX3JlZGVmaW5lJykoT2JqZWN0LnByb3RvdHlwZSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuICdbb2JqZWN0ICcgKyBjbGFzc29mKHRoaXMpICsgJ10nO1xuICB9LCB0cnVlKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcuanNcbi8vIG1vZHVsZSBpZCA9IDU2NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG4vLyBFQ01BU2NyaXB0IDYgc3ltYm9scyBzaGltXG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpO1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJyk7XG52YXIgTUVUQSA9IHJlcXVpcmUoJy4vX21ldGEnKS5LRVk7XG52YXIgJGZhaWxzID0gcmVxdWlyZSgnLi9fZmFpbHMnKTtcbnZhciBzaGFyZWQgPSByZXF1aXJlKCcuL19zaGFyZWQnKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJyk7XG52YXIgdWlkID0gcmVxdWlyZSgnLi9fdWlkJyk7XG52YXIgd2tzID0gcmVxdWlyZSgnLi9fd2tzJyk7XG52YXIgd2tzRXh0ID0gcmVxdWlyZSgnLi9fd2tzLWV4dCcpO1xudmFyIHdrc0RlZmluZSA9IHJlcXVpcmUoJy4vX3drcy1kZWZpbmUnKTtcbnZhciBlbnVtS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0ta2V5cycpO1xudmFyIGlzQXJyYXkgPSByZXF1aXJlKCcuL19pcy1hcnJheScpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKTtcbnZhciBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xudmFyIF9jcmVhdGUgPSByZXF1aXJlKCcuL19vYmplY3QtY3JlYXRlJyk7XG52YXIgZ09QTkV4dCA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BuLWV4dCcpO1xudmFyICRHT1BEID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcGQnKTtcbnZhciAkRFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciAka2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJyk7XG52YXIgZ09QRCA9ICRHT1BELmY7XG52YXIgZFAgPSAkRFAuZjtcbnZhciBnT1BOID0gZ09QTkV4dC5mO1xudmFyICRTeW1ib2wgPSBnbG9iYWwuU3ltYm9sO1xudmFyICRKU09OID0gZ2xvYmFsLkpTT047XG52YXIgX3N0cmluZ2lmeSA9ICRKU09OICYmICRKU09OLnN0cmluZ2lmeTtcbnZhciBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcbnZhciBISURERU4gPSB3a3MoJ19oaWRkZW4nKTtcbnZhciBUT19QUklNSVRJVkUgPSB3a3MoJ3RvUHJpbWl0aXZlJyk7XG52YXIgaXNFbnVtID0ge30ucHJvcGVydHlJc0VudW1lcmFibGU7XG52YXIgU3ltYm9sUmVnaXN0cnkgPSBzaGFyZWQoJ3N5bWJvbC1yZWdpc3RyeScpO1xudmFyIEFsbFN5bWJvbHMgPSBzaGFyZWQoJ3N5bWJvbHMnKTtcbnZhciBPUFN5bWJvbHMgPSBzaGFyZWQoJ29wLXN5bWJvbHMnKTtcbnZhciBPYmplY3RQcm90byA9IE9iamVjdFtQUk9UT1RZUEVdO1xudmFyIFVTRV9OQVRJVkUgPSB0eXBlb2YgJFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xudmFyIFFPYmplY3QgPSBnbG9iYWwuUU9iamVjdDtcbi8vIERvbid0IHVzZSBzZXR0ZXJzIGluIFF0IFNjcmlwdCwgaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzE3M1xudmFyIHNldHRlciA9ICFRT2JqZWN0IHx8ICFRT2JqZWN0W1BST1RPVFlQRV0gfHwgIVFPYmplY3RbUFJPVE9UWVBFXS5maW5kQ2hpbGQ7XG5cbi8vIGZhbGxiYWNrIGZvciBvbGQgQW5kcm9pZCwgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTY4N1xudmFyIHNldFN5bWJvbERlc2MgPSBERVNDUklQVE9SUyAmJiAkZmFpbHMoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gX2NyZWF0ZShkUCh7fSwgJ2EnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBkUCh0aGlzLCAnYScsIHsgdmFsdWU6IDcgfSkuYTsgfVxuICB9KSkuYSAhPSA3O1xufSkgPyBmdW5jdGlvbiAoaXQsIGtleSwgRCkge1xuICB2YXIgcHJvdG9EZXNjID0gZ09QRChPYmplY3RQcm90bywga2V5KTtcbiAgaWYgKHByb3RvRGVzYykgZGVsZXRlIE9iamVjdFByb3RvW2tleV07XG4gIGRQKGl0LCBrZXksIEQpO1xuICBpZiAocHJvdG9EZXNjICYmIGl0ICE9PSBPYmplY3RQcm90bykgZFAoT2JqZWN0UHJvdG8sIGtleSwgcHJvdG9EZXNjKTtcbn0gOiBkUDtcblxudmFyIHdyYXAgPSBmdW5jdGlvbiAodGFnKSB7XG4gIHZhciBzeW0gPSBBbGxTeW1ib2xzW3RhZ10gPSBfY3JlYXRlKCRTeW1ib2xbUFJPVE9UWVBFXSk7XG4gIHN5bS5fayA9IHRhZztcbiAgcmV0dXJuIHN5bTtcbn07XG5cbnZhciBpc1N5bWJvbCA9IFVTRV9OQVRJVkUgJiYgdHlwZW9mICRTeW1ib2wuaXRlcmF0b3IgPT0gJ3N5bWJvbCcgPyBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJztcbn0gOiBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0IGluc3RhbmNlb2YgJFN5bWJvbDtcbn07XG5cbnZhciAkZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBEKSB7XG4gIGlmIChpdCA9PT0gT2JqZWN0UHJvdG8pICRkZWZpbmVQcm9wZXJ0eShPUFN5bWJvbHMsIGtleSwgRCk7XG4gIGFuT2JqZWN0KGl0KTtcbiAga2V5ID0gdG9QcmltaXRpdmUoa2V5LCB0cnVlKTtcbiAgYW5PYmplY3QoRCk7XG4gIGlmIChoYXMoQWxsU3ltYm9scywga2V5KSkge1xuICAgIGlmICghRC5lbnVtZXJhYmxlKSB7XG4gICAgICBpZiAoIWhhcyhpdCwgSElEREVOKSkgZFAoaXQsIEhJRERFTiwgY3JlYXRlRGVzYygxLCB7fSkpO1xuICAgICAgaXRbSElEREVOXVtrZXldID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0pIGl0W0hJRERFTl1ba2V5XSA9IGZhbHNlO1xuICAgICAgRCA9IF9jcmVhdGUoRCwgeyBlbnVtZXJhYmxlOiBjcmVhdGVEZXNjKDAsIGZhbHNlKSB9KTtcbiAgICB9IHJldHVybiBzZXRTeW1ib2xEZXNjKGl0LCBrZXksIEQpO1xuICB9IHJldHVybiBkUChpdCwga2V5LCBEKTtcbn07XG52YXIgJGRlZmluZVByb3BlcnRpZXMgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKGl0LCBQKSB7XG4gIGFuT2JqZWN0KGl0KTtcbiAgdmFyIGtleXMgPSBlbnVtS2V5cyhQID0gdG9JT2JqZWN0KFApKTtcbiAgdmFyIGkgPSAwO1xuICB2YXIgbCA9IGtleXMubGVuZ3RoO1xuICB2YXIga2V5O1xuICB3aGlsZSAobCA+IGkpICRkZWZpbmVQcm9wZXJ0eShpdCwga2V5ID0ga2V5c1tpKytdLCBQW2tleV0pO1xuICByZXR1cm4gaXQ7XG59O1xudmFyICRjcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaXQsIFApIHtcbiAgcmV0dXJuIFAgPT09IHVuZGVmaW5lZCA/IF9jcmVhdGUoaXQpIDogJGRlZmluZVByb3BlcnRpZXMoX2NyZWF0ZShpdCksIFApO1xufTtcbnZhciAkcHJvcGVydHlJc0VudW1lcmFibGUgPSBmdW5jdGlvbiBwcm9wZXJ0eUlzRW51bWVyYWJsZShrZXkpIHtcbiAgdmFyIEUgPSBpc0VudW0uY2FsbCh0aGlzLCBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpKTtcbiAgaWYgKHRoaXMgPT09IE9iamVjdFByb3RvICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICFoYXMoT1BTeW1ib2xzLCBrZXkpKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiBFIHx8ICFoYXModGhpcywga2V5KSB8fCAhaGFzKEFsbFN5bWJvbHMsIGtleSkgfHwgaGFzKHRoaXMsIEhJRERFTikgJiYgdGhpc1tISURERU5dW2tleV0gPyBFIDogdHJ1ZTtcbn07XG52YXIgJGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KSB7XG4gIGl0ID0gdG9JT2JqZWN0KGl0KTtcbiAga2V5ID0gdG9QcmltaXRpdmUoa2V5LCB0cnVlKTtcbiAgaWYgKGl0ID09PSBPYmplY3RQcm90byAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhaGFzKE9QU3ltYm9scywga2V5KSkgcmV0dXJuO1xuICB2YXIgRCA9IGdPUEQoaXQsIGtleSk7XG4gIGlmIChEICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICEoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSkpIEQuZW51bWVyYWJsZSA9IHRydWU7XG4gIHJldHVybiBEO1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlOYW1lcyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpIHtcbiAgdmFyIG5hbWVzID0gZ09QTih0b0lPYmplY3QoaXQpKTtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIgaSA9IDA7XG4gIHZhciBrZXk7XG4gIHdoaWxlIChuYW1lcy5sZW5ndGggPiBpKSB7XG4gICAgaWYgKCFoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkgJiYga2V5ICE9IEhJRERFTiAmJiBrZXkgIT0gTUVUQSkgcmVzdWx0LnB1c2goa2V5KTtcbiAgfSByZXR1cm4gcmVzdWx0O1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlTeW1ib2xzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGl0KSB7XG4gIHZhciBJU19PUCA9IGl0ID09PSBPYmplY3RQcm90bztcbiAgdmFyIG5hbWVzID0gZ09QTihJU19PUCA/IE9QU3ltYm9scyA6IHRvSU9iamVjdChpdCkpO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBpID0gMDtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIHtcbiAgICBpZiAoaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pICYmIChJU19PUCA/IGhhcyhPYmplY3RQcm90bywga2V5KSA6IHRydWUpKSByZXN1bHQucHVzaChBbGxTeW1ib2xzW2tleV0pO1xuICB9IHJldHVybiByZXN1bHQ7XG59O1xuXG4vLyAxOS40LjEuMSBTeW1ib2woW2Rlc2NyaXB0aW9uXSlcbmlmICghVVNFX05BVElWRSkge1xuICAkU3ltYm9sID0gZnVuY3Rpb24gU3ltYm9sKCkge1xuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgJFN5bWJvbCkgdGhyb3cgVHlwZUVycm9yKCdTeW1ib2wgaXMgbm90IGEgY29uc3RydWN0b3IhJyk7XG4gICAgdmFyIHRhZyA9IHVpZChhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZCk7XG4gICAgdmFyICRzZXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh0aGlzID09PSBPYmplY3RQcm90bykgJHNldC5jYWxsKE9QU3ltYm9scywgdmFsdWUpO1xuICAgICAgaWYgKGhhcyh0aGlzLCBISURERU4pICYmIGhhcyh0aGlzW0hJRERFTl0sIHRhZykpIHRoaXNbSElEREVOXVt0YWddID0gZmFsc2U7XG4gICAgICBzZXRTeW1ib2xEZXNjKHRoaXMsIHRhZywgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xuICAgIH07XG4gICAgaWYgKERFU0NSSVBUT1JTICYmIHNldHRlcikgc2V0U3ltYm9sRGVzYyhPYmplY3RQcm90bywgdGFnLCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgc2V0OiAkc2V0IH0pO1xuICAgIHJldHVybiB3cmFwKHRhZyk7XG4gIH07XG4gIHJlZGVmaW5lKCRTeW1ib2xbUFJPVE9UWVBFXSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2s7XG4gIH0pO1xuXG4gICRHT1BELmYgPSAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuICAkRFAuZiA9ICRkZWZpbmVQcm9wZXJ0eTtcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LWdvcG4nKS5mID0gZ09QTkV4dC5mID0gJGdldE93blByb3BlcnR5TmFtZXM7XG4gIHJlcXVpcmUoJy4vX29iamVjdC1waWUnKS5mID0gJHByb3BlcnR5SXNFbnVtZXJhYmxlO1xuICByZXF1aXJlKCcuL19vYmplY3QtZ29wcycpLmYgPSAkZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG4gIGlmIChERVNDUklQVE9SUyAmJiAhcmVxdWlyZSgnLi9fbGlicmFyeScpKSB7XG4gICAgcmVkZWZpbmUoT2JqZWN0UHJvdG8sICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsICRwcm9wZXJ0eUlzRW51bWVyYWJsZSwgdHJ1ZSk7XG4gIH1cblxuICB3a3NFeHQuZiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIHdyYXAod2tzKG5hbWUpKTtcbiAgfTtcbn1cblxuJGV4cG9ydCgkZXhwb3J0LkcgKyAkZXhwb3J0LlcgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgeyBTeW1ib2w6ICRTeW1ib2wgfSk7XG5cbmZvciAodmFyIGVzNlN5bWJvbHMgPSAoXG4gIC8vIDE5LjQuMi4yLCAxOS40LjIuMywgMTkuNC4yLjQsIDE5LjQuMi42LCAxOS40LjIuOCwgMTkuNC4yLjksIDE5LjQuMi4xMCwgMTkuNC4yLjExLCAxOS40LjIuMTIsIDE5LjQuMi4xMywgMTkuNC4yLjE0XG4gICdoYXNJbnN0YW5jZSxpc0NvbmNhdFNwcmVhZGFibGUsaXRlcmF0b3IsbWF0Y2gscmVwbGFjZSxzZWFyY2gsc3BlY2llcyxzcGxpdCx0b1ByaW1pdGl2ZSx0b1N0cmluZ1RhZyx1bnNjb3BhYmxlcydcbikuc3BsaXQoJywnKSwgaiA9IDA7IGVzNlN5bWJvbHMubGVuZ3RoID4gajspd2tzKGVzNlN5bWJvbHNbaisrXSk7XG5cbmZvciAodmFyIHdlbGxLbm93blN5bWJvbHMgPSAka2V5cyh3a3Muc3RvcmUpLCBrID0gMDsgd2VsbEtub3duU3ltYm9scy5sZW5ndGggPiBrOykgd2tzRGVmaW5lKHdlbGxLbm93blN5bWJvbHNbaysrXSk7XG5cbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsICdTeW1ib2wnLCB7XG4gIC8vIDE5LjQuMi4xIFN5bWJvbC5mb3Ioa2V5KVxuICAnZm9yJzogZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBoYXMoU3ltYm9sUmVnaXN0cnksIGtleSArPSAnJylcbiAgICAgID8gU3ltYm9sUmVnaXN0cnlba2V5XVxuICAgICAgOiBTeW1ib2xSZWdpc3RyeVtrZXldID0gJFN5bWJvbChrZXkpO1xuICB9LFxuICAvLyAxOS40LjIuNSBTeW1ib2wua2V5Rm9yKHN5bSlcbiAga2V5Rm9yOiBmdW5jdGlvbiBrZXlGb3Ioc3ltKSB7XG4gICAgaWYgKCFpc1N5bWJvbChzeW0pKSB0aHJvdyBUeXBlRXJyb3Ioc3ltICsgJyBpcyBub3QgYSBzeW1ib2whJyk7XG4gICAgZm9yICh2YXIga2V5IGluIFN5bWJvbFJlZ2lzdHJ5KSBpZiAoU3ltYm9sUmVnaXN0cnlba2V5XSA9PT0gc3ltKSByZXR1cm4ga2V5O1xuICB9LFxuICB1c2VTZXR0ZXI6IGZ1bmN0aW9uICgpIHsgc2V0dGVyID0gdHJ1ZTsgfSxcbiAgdXNlU2ltcGxlOiBmdW5jdGlvbiAoKSB7IHNldHRlciA9IGZhbHNlOyB9XG59KTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgJ09iamVjdCcsIHtcbiAgLy8gMTkuMS4yLjIgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxuICBjcmVhdGU6ICRjcmVhdGUsXG4gIC8vIDE5LjEuMi40IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKVxuICBkZWZpbmVQcm9wZXJ0eTogJGRlZmluZVByb3BlcnR5LFxuICAvLyAxOS4xLjIuMyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKVxuICBkZWZpbmVQcm9wZXJ0aWVzOiAkZGVmaW5lUHJvcGVydGllcyxcbiAgLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIC8vIDE5LjEuMi43IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXG4gIGdldE93blByb3BlcnR5TmFtZXM6ICRnZXRPd25Qcm9wZXJ0eU5hbWVzLFxuICAvLyAxOS4xLjIuOCBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKE8pXG4gIGdldE93blByb3BlcnR5U3ltYm9sczogJGdldE93blByb3BlcnR5U3ltYm9sc1xufSk7XG5cbi8vIDI0LjMuMiBKU09OLnN0cmluZ2lmeSh2YWx1ZSBbLCByZXBsYWNlciBbLCBzcGFjZV1dKVxuJEpTT04gJiYgJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAoIVVTRV9OQVRJVkUgfHwgJGZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgdmFyIFMgPSAkU3ltYm9sKCk7XG4gIC8vIE1TIEVkZ2UgY29udmVydHMgc3ltYm9sIHZhbHVlcyB0byBKU09OIGFzIHt9XG4gIC8vIFdlYktpdCBjb252ZXJ0cyBzeW1ib2wgdmFsdWVzIHRvIEpTT04gYXMgbnVsbFxuICAvLyBWOCB0aHJvd3Mgb24gYm94ZWQgc3ltYm9sc1xuICByZXR1cm4gX3N0cmluZ2lmeShbU10pICE9ICdbbnVsbF0nIHx8IF9zdHJpbmdpZnkoeyBhOiBTIH0pICE9ICd7fScgfHwgX3N0cmluZ2lmeShPYmplY3QoUykpICE9ICd7fSc7XG59KSksICdKU09OJywge1xuICBzdHJpbmdpZnk6IGZ1bmN0aW9uIHN0cmluZ2lmeShpdCkge1xuICAgIHZhciBhcmdzID0gW2l0XTtcbiAgICB2YXIgaSA9IDE7XG4gICAgdmFyIHJlcGxhY2VyLCAkcmVwbGFjZXI7XG4gICAgd2hpbGUgKGFyZ3VtZW50cy5sZW5ndGggPiBpKSBhcmdzLnB1c2goYXJndW1lbnRzW2krK10pO1xuICAgICRyZXBsYWNlciA9IHJlcGxhY2VyID0gYXJnc1sxXTtcbiAgICBpZiAoIWlzT2JqZWN0KHJlcGxhY2VyKSAmJiBpdCA9PT0gdW5kZWZpbmVkIHx8IGlzU3ltYm9sKGl0KSkgcmV0dXJuOyAvLyBJRTggcmV0dXJucyBzdHJpbmcgb24gdW5kZWZpbmVkXG4gICAgaWYgKCFpc0FycmF5KHJlcGxhY2VyKSkgcmVwbGFjZXIgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgaWYgKHR5cGVvZiAkcmVwbGFjZXIgPT0gJ2Z1bmN0aW9uJykgdmFsdWUgPSAkcmVwbGFjZXIuY2FsbCh0aGlzLCBrZXksIHZhbHVlKTtcbiAgICAgIGlmICghaXNTeW1ib2wodmFsdWUpKSByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgICBhcmdzWzFdID0gcmVwbGFjZXI7XG4gICAgcmV0dXJuIF9zdHJpbmdpZnkuYXBwbHkoJEpTT04sIGFyZ3MpO1xuICB9XG59KTtcblxuLy8gMTkuNC4zLjQgU3ltYm9sLnByb3RvdHlwZVtAQHRvUHJpbWl0aXZlXShoaW50KVxuJFN5bWJvbFtQUk9UT1RZUEVdW1RPX1BSSU1JVElWRV0gfHwgcmVxdWlyZSgnLi9faGlkZScpKCRTeW1ib2xbUFJPVE9UWVBFXSwgVE9fUFJJTUlUSVZFLCAkU3ltYm9sW1BST1RPVFlQRV0udmFsdWVPZik7XG4vLyAxOS40LjMuNSBTeW1ib2wucHJvdG90eXBlW0BAdG9TdHJpbmdUYWddXG5zZXRUb1N0cmluZ1RhZygkU3ltYm9sLCAnU3ltYm9sJyk7XG4vLyAyMC4yLjEuOSBNYXRoW0BAdG9TdHJpbmdUYWddXG5zZXRUb1N0cmluZ1RhZyhNYXRoLCAnTWF0aCcsIHRydWUpO1xuLy8gMjQuMy4zIEpTT05bQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKGdsb2JhbC5KU09OLCAnSlNPTicsIHRydWUpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9lczYuc3ltYm9sLmpzXG4vLyBtb2R1bGUgaWQgPSA1Njdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKShmYWxzZSk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIub2FrLnNwYWNlciB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBkaXNwbGF5OiBibG9jaztcXG59XFxuLm9hay5zcGFjZXIuaW5saW5lIHtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTtcXG59XFxuLm9hay5zcGFjZXIuZmx1aWQge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBmbGV4OiAxIDEgMTAwJTtcXG59XFxuLm9hay5zcGFjZXIudGlueSB7XFxuICB3aWR0aDogMnB4O1xcbiAgaGVpZ2h0OiAycHg7XFxufVxcbi5vYWsuc3BhY2VyLnNtYWxsIHtcXG4gIHdpZHRoOiA0cHg7XFxuICBoZWlnaHQ6IDRweDtcXG59XFxuLm9hay5zcGFjZXIubWVkaXVtIHtcXG4gIHdpZHRoOiAxMHB4O1xcbiAgaGVpZ2h0OiAxMHB4O1xcbn1cXG4ub2FrLnNwYWNlci5sYXJnZSB7XFxuICB3aWR0aDogMjBweDtcXG4gIGhlaWdodDogMjBweDtcXG59XFxuLm9hay5zcGFjZXIuaHVnZSB7XFxuICB3aWR0aDogMzBweDtcXG4gIGhlaWdodDogMzBweDtcXG59XFxuLm9hay5zcGFjZXIubWFzc2l2ZSB7XFxuICB3aWR0aDogNTBweDtcXG4gIGhlaWdodDogNTBweDtcXG59XFxuXCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2Nzcy1sb2FkZXIhLi9+L2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3JjL2FwcC9TcGFjZXIubGVzc1xuLy8gbW9kdWxlIGlkID0gNTY5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcIikoZmFsc2UpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiLmZ1bGxXaWR0aCB7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuLmZ1bGxIZWlnaHQge1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG4uZnVsbFNpemUge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcblwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jc3MtbG9hZGVyIS4vfi9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3NyYy9hcHAvc3R5bGVzLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDU3MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvL1xuLy9cdCMgQ29yZSBgcnVsZXNgIC0tIHNpbXBsZSBkYXRhdHlwZXMsIGV0Yy5cbi8vXG4vLyBOT1RFOiBtYW55IG9mIHRoZSBiZWxvdyBhcmUgY3JlYXRlZCBhcyBjdXN0b20gUGF0dGVybiBzdWJjbGFzc2VzIGZvciBkZWJ1Z2dpbmcuXG4vL1xuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuaW1wb3J0IFRva2VuaXplciBmcm9tIFwiLi4vLi4vVG9rZW5pemVyXCI7XG5cbi8vIENyZWF0ZSBgY29yZWAgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck1vZHVsZShcImNvcmVcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwic3RhdGVtZW50c1wiLFxuICAgIGNvbnN0cnVjdG9yOiBSdWxlLlN0YXRlbWVudHNcbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJjb21tZW50XCIsXG4gICAgY29uc3RydWN0b3I6IFJ1bGUuQ29tbWVudFxuICB9LFxuXG4gIC8vIGB3b3JkYCA9IGlzIGEgc2luZ2xlIGFscGhhbnVtZXJpYyB3b3JkLlxuICAvLyBNVVNUIHN0YXJ0IHdpdGggYSBsb3dlci1jYXNlIGxldHRlciAoPylcbiAge1xuICAgIG5hbWU6IFwid29yZFwiLFxuICAgIHBhdHRlcm46IC9eW2Etel1bXFx3XFwtXSokLyxcbiAgICBjYW5vbmljYWw6IFwiV29yZFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB3b3JkIGV4dGVuZHMgUnVsZS5QYXR0ZXJuIHtcbiAgICAgIC8vIENvbnZlcnQgXCItXCIgdG8gXCJfXCIgaW4gc291cmNlIG91dHB1dC5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVkLnJlcGxhY2UoL1xcLS9nLCBcIl9cIik7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyB3b3Jkc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImFiY1wiLCBcImFiY1wiXSxcbiAgICAgICAgICBbXCJhYmMtZGVmXCIsIFwiYWJjX2RlZlwiXSxcbiAgICAgICAgICBbXCJhYmNfZGVmXCIsIFwiYWJjX2RlZlwiXSxcbiAgICAgICAgICBbXCJhYmMwMVwiLCBcImFiYzAxXCJdLFxuICAgICAgICAgIFtcImFiYy1kZWZfMDFcIiwgXCJhYmNfZGVmXzAxXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJkb2Vzbid0IG1hdGNoIHRoaW5ncyB0aGF0IGFyZW4ndCB3b3Jkc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIiRhc2RhXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wiKGFzZGEpXCIsIHVuZGVmaW5lZF0gICAgIC8vIFRPRE8uLi4gPz8/XG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIC8vIGBpZGVudGlmaWVyYCA9IHZhcmlhYmxlcyBvciBwcm9wZXJ0eSBuYW1lLlxuICAvLyBNVVNUIHN0YXJ0IHdpdGggYSBsb3dlci1jYXNlIGxldHRlciAoPylcbiAgLy8gTk9URTogV2UgYmxhY2tsaXN0IGEgbG90IG9mIHdvcmRzIGFzIGlkZW50aWZpZXJzLlxuICB7XG4gICAgbmFtZTogXCJpZGVudGlmaWVyXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIGNhbm9uaWNhbDogXCJJZGVuZmlmaWVyXCIsXG4gICAgcGF0dGVybjogL15bYS16XVtcXHdcXC1dKiQvLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpZGVudGlmaWVyIGV4dGVuZHMgUnVsZS5QYXR0ZXJuIHtcbiAgICAgIC8vIENvbnZlcnQgXCItXCIgdG8gXCJfXCIgaW4gc291cmNlIG91dHB1dC5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVkLnJlcGxhY2UoL1xcLS9nLCBcIl9cIik7XG4gICAgICB9XG4gICAgfSxcbiAgICBibGFja2xpc3Q6IFtcbiAgICAgIC8vIEFkZCBFbmdsaXNoIHByZXBvc2l0aW9ucyB0byBpZGVudGlmaWVyIGJsYWNrbGlzdC5cbiAgICAgIC8vXG4gICAgICAvLyBXaWtpcGVkaWEgXCJQcmVwb3NpdGlvblwiOlxuICAgICAgLy9cdFwiUHJlcG9zaXRpb25zLi4uYXJlIGEgY2xhc3Mgb2Ygd29yZHMgdGhhdFxuICAgICAgLy9cdGV4cHJlc3Mgc3BhdGlhbCBvciB0ZW1wb3JhbCByZWxhdGlvbnMgIChpbiwgdW5kZXIsIHRvd2FyZHMsIGJlZm9yZSlcbiAgICAgIC8vXHRvciBtYXJrIHZhcmlvdXMgc2VtYW50aWMgcm9sZXMgKG9mLCBmb3IpLlxuICAgICAgLy8gVEVTVE1FXG4gICAgICBcImFib3V0XCIsIFwiYWJvdmVcIiwgXCJhZnRlclwiLCBcImFuZFwiLCBcImFzXCIsIFwiYXRcIixcbiAgICAgIFwiYmVmb3JlXCIsIFwiYmVoaW5kXCIsIFwiYmVsb3dcIiwgXCJiZW5lYXRoXCIsIFwiYmVzaWRlXCIsIFwiYmV0d2VlblwiLCBcImJleW9uZFwiLCBcImJ5XCIsXG4gICAgICBcImRlZmluZWRcIiwgXCJkb3duXCIsIFwiZHVyaW5nXCIsXG4gICAgICBcImVhY2hcIiwgXCJlbXB0eVwiLCBcImV4YWN0bHlcIiwgXCJleGNlcHRcIixcbiAgICAgIFwiZm9yXCIsIFwiZnJvbVwiLFxuICAgICAgXCJncmVhdGVyXCIsXG4gICAgICBcIklcIiwgXCJpblwiLCBcImludG9cIixcbiAgICAgIFwibGVzc1wiLCBcImxvbmdcIixcbiAgICAgIFwibWVcIiwgXCJtaW51c1wiLCBcIm1vcmVcIixcbiAgICAgIFwibmVhclwiLCBcIm5vdFwiLFxuICAgICAgXCJvZlwiLCBcIm9mZlwiLCBcIm9uXCIsIFwib250b1wiLCBcIm9wcG9zaXRlXCIsIFwib3JcIiwgXCJvdXRcIiwgXCJvdXRzaWRlXCIsIFwib3ZlclwiLFxuICAgICAgXCJzaG9ydFwiLCBcInNpbmNlXCIsXG4gICAgICBcInRoYW5cIiwgXCJ0aGVcIiwgXCJ0aGVuXCIsIFwidGhyb3VnaFwiLCBcInRocnVcIiwgXCJ0b1wiLCBcInRvd2FyZFwiLCBcInRvd2FyZHNcIixcbiAgICAgIFwidW5kZWZpbmVkXCIsIFwidW5kZXJcIiwgXCJ1bmRlcm5lYXRoXCIsIFwidW5pcXVlXCIsIFwidW50aWxcIiwgXCJ1cFwiLCBcInVwb25cIiwgXCJ1cHNpZGVcIixcbiAgICAgIFwidmVyc3VzXCIsIFwidnNcIixcbiAgICAgIFwid2hlcmVcIiwgXCJ3aXRoXCIsIFwid2l0aGluXCIsIFwid2l0aG91dFwiLFxuXG4gICAgICAvLyBBZGQgY29tbW9uIGVuZ2xpc2ggdmVyYnMgdG8gaWRlbnRpZmllciBibGFja2xpc3QuXG4gICAgICBcImFyZVwiLFxuICAgICAgXCJkb1wiLCBcImRvZXNcIixcbiAgICAgIFwiY29udGFpbnNcIixcbiAgICAgIFwiaGFzXCIsIFwiaGF2ZVwiLFxuICAgICAgXCJpc1wiLFxuICAgICAgXCJyZXBlYXRcIixcbiAgICAgIFwid2FzXCIsIFwid2VyZVwiLFxuXG4gICAgICAvLyBBZGQgc3BlY2lhbCBjb250cm9sIGtleXdvcmRzIHRvIGlkZW50aWZpZXIgYmxhY2tsaXN0LlxuICAgICAgXCJlbHNlXCIsXG4gICAgICBcImlmXCIsXG4gICAgICBcIm90aGVyd2lzZVwiLFxuICAgICAgXCJ3aGlsZVwiLFxuXG4gICAgICAvLyBBZGQgYm9vbGVhbiB0b2tlbnMgdG8gaWRlbnRpZmllciBibGFja2xpc3QuXG4gICAgICBcInRydWVcIiwgXCJmYWxzZVwiLFxuICAgICAgXCJ5ZXNcIiwgXCJub1wiLFxuICAgICAgXCJva1wiLCBcImNhbmNlbFwiLFxuICAgICAgXCJzdWNjZXNzXCIsIFwiZmFpbHVyZVwiLFxuXG4gICAgICAvLyBBZGQgbnVtYmVyIHdvcmRzIHRvIGlkZW50aWZpZXIgYmxhY2tsaXN0LlxuICAgICAgLy8gVEVTVE1FXG4gICAgICBcIm9uZVwiLCBcInR3b1wiLCBcInRocmVlXCIsIFwiZm91clwiLCBcImZpdmVcIixcbiAgICAgIFwic2l4XCIsIFwic2V2ZW5cIiwgXCJlaWdodFwiLCBcIm5pbmVcIiwgXCJ0ZW5cIixcbiAgICBdLFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIGlkZW50aWZpZXJzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wiYWJjXCIsIFwiYWJjXCJdLFxuICAgICAgICAgIFtcImFiYy1kZWZcIiwgXCJhYmNfZGVmXCJdLFxuICAgICAgICAgIFtcImFiY19kZWZcIiwgXCJhYmNfZGVmXCJdLFxuICAgICAgICAgIFtcImFiYzAxXCIsIFwiYWJjMDFcIl0sXG4gICAgICAgICAgW1wiYWJjLWRlZl8wMVwiLCBcImFiY19kZWZfMDFcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImRvZXNuJ3QgbWF0Y2ggdGhpbmdzIHRoYXQgYXJlbid0IGlkZW50aWZpZXJzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wiJGFzZGFcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCIoYXNkYSlcIiwgdW5kZWZpbmVkXSwgICAgIC8vIFRPRE8uLi4gPz8/XG4gICAgICAgICAgW1wiQWJjXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcInNraXBzIGl0ZW1zIGluIGl0cyBibGFja2xpc3RcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJ5ZXNcIiwgdW5kZWZpbmVkXVxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICB9LFxuXG4gIC8vIGBUeXBlYCA9IHR5cGUgbmFtZS5cbiAgLy8gTVVTVCBzdGFydCB3aXRoIGFuIHVwcGVyLWNhc2UgbGV0dGVyICg/KVxuICB7XG4gICAgbmFtZTogXCJ0eXBlXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIGNhbm9uaWNhbDogXCJUeXBlXCIsXG4gICAgcGF0dGVybjogL14oW0EtWl1bXFx3XFwtXSp8bGlzdHx0ZXh0fG51bWJlcnxpbnRlZ2VyfGRlY2ltYWx8Y2hhcmFjdGVyfGJvb2xlYW58b2JqZWN0KSQvLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0eXBlIGV4dGVuZHMgUnVsZS5QYXR0ZXJuIHtcbiAgICAgIC8vIENvbnZlcnQgXCItXCIgdG8gXCJfXCIgaW4gc291cmNlIG91dHB1dC5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgdHlwZSA9IHRoaXMubWF0Y2hlZDtcbiAgICAgICAgc3dpdGNoKHR5cGUpIHtcbiAgICAgICAgICAvLyBBbGlhcyBgTGlzdGAgdG8gYEFycmF5YFxuICAgICAgICAgIGNhc2UgXCJMaXN0XCI6XHRcdHJldHVybiBcIkFycmF5XCI7XG5cbiAgICAgICAgICAvLyBzcGVjaWFsIGNhc2UgdG8gdGFrZSB0aGUgZm9sbG93aW5nIGFzIGxvd2VyY2FzZVxuICAgICAgICAgIGNhc2UgXCJsaXN0XCI6XHRcdHJldHVybiBcIkFycmF5XCI7XG4gICAgICAgICAgY2FzZSBcInRleHRcIjpcdFx0cmV0dXJuIFwiU3RyaW5nXCI7XG4gICAgICAgICAgY2FzZSBcImNoYXJhY3RlclwiOlx0cmV0dXJuIFwiQ2hhcmFjdGVyXCI7XG4gICAgICAgICAgY2FzZSBcIm51bWJlclwiOlx0XHRyZXR1cm4gXCJOdW1iZXJcIjtcbiAgICAgICAgICBjYXNlIFwiaW50ZWdlclwiOlx0XHRyZXR1cm4gXCJJbnRlZ2VyXCI7XG4gICAgICAgICAgY2FzZSBcImRlY2ltYWxcIjpcdFx0cmV0dXJuIFwiRGVjaW1hbFwiO1xuICAgICAgICAgIGNhc2UgXCJib29sZWFuXCI6XHRcdHJldHVybiBcIkJvb2xlYW5cIjtcbiAgICAgICAgICBjYXNlIFwib2JqZWN0XCI6XHRcdHJldHVybiBcIk9iamVjdFwiO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gdHlwZS5yZXBsYWNlKC9cXC0vZywgXCJfXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBibGFja2xpc3Q6IFsgXCJJXCIgXSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyB0eXBlc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIkFiY1wiLCBcIkFiY1wiXSxcbiAgICAgICAgICBbXCJBYmMtZGVmXCIsIFwiQWJjX2RlZlwiXSxcbiAgICAgICAgICBbXCJBYmNfRGVmXCIsIFwiQWJjX0RlZlwiXSxcbiAgICAgICAgICBbXCJBYmMwMVwiLCBcIkFiYzAxXCJdLFxuICAgICAgICAgIFtcIkFiYy1kZWZfMDFcIiwgXCJBYmNfZGVmXzAxXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJkb2Vzbid0IG1hdGNoIHRoaW5ncyB0aGF0IGFyZW4ndCB0eXBlc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIlwiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcIiRBc2RhXCIsIHVuZGVmaW5lZF0sICAgICAvLyBUT0RPLi4uID8/P1xuICAgICAgICAgIFtcIihBc2RhKVwiLCB1bmRlZmluZWRdLCAgICAvLyBUT0RPLi4uID8/P1xuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJza2lwcyBpdGVtcyBpbiBpdHMgYmxhY2tsaXN0XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiSVwiLCB1bmRlZmluZWRdXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICBdXG4gIH0sXG5cblxuXG4gIC8vIEJvb2xlYW4gbGl0ZXJhbCwgY3JlYXRlZCB3aXRoIGN1c3RvbSBjb25zdHJ1Y3RvciBmb3IgZGVidWdnaW5nLlxuICAvLyBUT0RPOiBiZXR0ZXIgbmFtZSBmb3IgdGhpcz8/P1xuICB7XG4gICAgbmFtZTogXCJib29sZWFuXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIGNhbm9uaWNhbDogXCJCb29sZWFuXCIsXG4gICAgcGF0dGVybjogL14odHJ1ZXxmYWxzZXx5ZXN8bm98b2t8Y2FuY2VsfHN1Y2Nlc3N8ZmFpbHVyZSkkLyxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgYm9vbGVhbiBleHRlbmRzIFJ1bGUuUGF0dGVybiB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLm1hdGNoZWQpIHtcbiAgICAgICAgICBjYXNlIFwidHJ1ZVwiOlxuICAgICAgICAgIGNhc2UgXCJ5ZXNcIjpcbiAgICAgICAgICBjYXNlIFwib2tcIjpcbiAgICAgICAgICBjYXNlIFwic3VjY2Vzc1wiOlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBib29sZWFuc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIlwiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcInRydWVcIiwgdHJ1ZV0sXG4gICAgICAgICAgW1wieWVzXCIsIHRydWVdLFxuICAgICAgICAgIFtcIm9rXCIsIHRydWVdLFxuICAgICAgICAgIFtcInN1Y2Nlc3NcIiwgdHJ1ZV0sXG4gICAgICAgICAgW1wiZmFsc2VcIiwgZmFsc2VdLFxuICAgICAgICAgIFtcIm5vXCIsIGZhbHNlXSxcbiAgICAgICAgICBbXCJjYW5jZWxcIiwgZmFsc2VdLFxuICAgICAgICAgIFtcImZhaWx1cmVcIiwgZmFsc2VdXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImRvZXNuJ3QgbWF0Y2ggaW4gdGhlIG1pZGRsZSBvZiBhIGxvbmdlciBrZXl3b3JkXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wieWVzc2lyXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wieWVzLXNpclwiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcInllc19zaXJcIiwgdW5kZWZpbmVkXVxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICAvLyBgbnVtYmVyYCBhcyBlaXRoZXIgZmxvYXQgb3IgaW50ZWdlciwgY3JlYXRlZCB3aXRoIGN1c3RvbSBjb25zdHJ1Y3RvciBmb3IgZGVidWdnaW5nLlxuICAvLyBOT1RFOiB5b3UgY2FuIGFsc28gdXNlIGBvbmVgLi4uYHRlbmAgYXMgc3RyaW5ncy4nXG4gIC8vIFRPRE86ICBgaW50ZWdlcmAgYW5kIGBkZWNpbWFsYD8gIHRvbyB0ZWNoeT9cbiAge1xuICAgIG5hbWU6IFwibnVtYmVyXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIGNhbm9uaWNhbDogXCJOdW1iZXJcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbnVtYmVyIGV4dGVuZHMgUnVsZSB7XG4gICAgICAvLyBTcGVjaWFsIHdvcmRzIHlvdSBjYW4gdXNlIGFzIG51bWJlcnMuLi5cbiAgICAgIHN0YXRpYyBOVU1CRVJfTkFNRVMgPSB7XG4gICAgICAgIHplcm86IDAsXG4gICAgICAgIG9uZTogMSxcbiAgICAgICAgdHdvOiAyLFxuICAgICAgICB0aHJlZTogMyxcbiAgICAgICAgZm91cjogNCxcbiAgICAgICAgZml2ZTogNSxcbiAgICAgICAgc2l4OiA2LFxuICAgICAgICBzZXZlbjogNyxcbiAgICAgICAgZWlnaHQ6IDgsXG4gICAgICAgIG5pbmU6IDksXG4gICAgICAgIHRlbjogMTBcbiAgICAgIH1cblxuICAgICAgLy8gTnVtYmVycyBnZXQgZW5jb2RlZCBhcyBudW1iZXJzIGluIHRoZSB0b2tlbiBzdHJlYW0uXG4gICAgICBwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwKSB7XG4gICAgICAgIGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG4gICAgICAgIC8vIGlmIGEgc3RyaW5nLCBhdHRlbXB0IHRvIHJ1biB0aHJvdWdoIG91ciBOVU1CRVJfTkFNRVNcbiAgICAgICAgaWYgKHR5cGVvZiB0b2tlbiA9PT0gXCJzdHJpbmdcIikgdG9rZW4gPSBSdWxlLk51bWJlci5OVU1CRVJfTkFNRVNbdG9rZW5dO1xuICAgICAgICBpZiAodHlwZW9mIHRva2VuICE9PSBcIm51bWJlclwiKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSh7XG4gICAgICAgICAgbWF0Y2hlZDogdG9rZW4sXG4gICAgICAgICAgbmV4dFN0YXJ0OiBzdGFydCArIDFcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgdG8gbnVtYmVyIG9uIHNvdXJjZSBvdXRwdXQuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0Y2hlZDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIG51bWJlcnNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCIxXCIsIDFdLFxuICAgICAgICAgIFtcIjEwMDBcIiwgMTAwMF0sXG4gICAgICAgICAgW1wiLTFcIiwgLTFdLFxuICAgICAgICAgIFtcIjEuMVwiLCAxLjFdLFxuICAgICAgICAgIFtcIjAwMC4xXCIsIDAuMV0sXG4gICAgICAgICAgW1wiMS5cIiwgMV0sXG4gICAgICAgICAgW1wiLjFcIiwgMC4xXSxcbiAgICAgICAgICBbXCItMTExLjExMVwiLCAtMTExLjExMV0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImRvZXNuJ3QgbWF0Y2ggdGhpbmdzIHRoYXQgYXJlbid0IG51bWJlcnNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCIuXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcInJlcXVpcmVzIG5lZ2F0aXZlIHNpZ24gdG8gYmUgdG91Y2hpbmcgdGhlIG51bWJlclwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIi0gMVwiLCB1bmRlZmluZWRdXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIC8vIExpdGVyYWwgYHRleHRgIHN0cmluZywgY3JlYXRlZCB3aXRoIGN1c3RvbSBjb25zdHJ1Y3RvciBmb3IgZGVidWdnaW5nLlxuICAvLyBZb3UgY2FuIHVzZSBlaXRoZXIgc2luZ2xlIG9yIGRvdWJsZSBxdW90ZXMgb24gdGhlIG91dHNpZGUgKGFsdGhvdWdoIGRvdWJsZSBxdW90ZXMgYXJlIHByZWZlcnJlZCkuXG4gIC8vIFJldHVybmVkIHZhbHVlIGhhcyBlbmNsb3NpbmcgcXVvdGVzLlxuICB7XG4gICAgbmFtZTogXCJ0ZXh0XCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIGNhbm9uaWNhbDogXCJUZXh0XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHRleHQgZXh0ZW5kcyBSdWxlIHtcbiAgICAgIC8vIFRleHQgc3RyaW5ncyBnZXQgZW5jb2RlZCBhcyBgdGV4dGAgb2JqZWN0cyBpbiB0aGUgdG9rZW4gc3RyZWFtLlxuICAgICAgcGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCkge1xuICAgICAgICBsZXQgdG9rZW4gPSB0b2tlbnNbc3RhcnRdO1xuICAgICAgICBpZiAoISh0b2tlbiBpbnN0YW5jZW9mIFRva2VuaXplci5UZXh0KSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoe1xuICAgICAgICAgIG1hdGNoZWQ6IHRva2VuLnF1b3RlZFN0cmluZyxcbiAgICAgICAgICBuZXh0U3RhcnQ6IHN0YXJ0ICsgMVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoZWQ7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyB0ZXh0XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgWydcIlwiJywgJ1wiXCInXSxcbiAgICAgICAgICBbXCInJ1wiLCBcIicnXCJdLFxuICAgICAgICAgIFsnXCJhXCInLCAnXCJhXCInXSxcbiAgICAgICAgICBbXCInYSdcIiwgXCInYSdcIl0sXG4gICAgICAgICAgWydcImFiY2RcIicsICdcImFiY2RcIiddLFxuICAgICAgICAgIFsnXCJhYmMgZGVmIGdoaS4gamtsXCInLCAnXCJhYmMgZGVmIGdoaS4gamtsXCInXSxcbiAgICAgICAgICBbJ1wiLi4uQ2FuXFwndCB0b3VjaCB0aGlzXCInLCAnXCIuLi5DYW5cXCd0IHRvdWNoIHRoaXNcIiddLFxuLy9GSVhNRSAgICAgICAgICBbXCInXFxcIkdhZHpvb2tzISBJIGNhblxcXFwndCBiZWxpZXZlIGl0IVxcXCIgaGUgc2FpZCdcIiwgXCInXFxcIkdhZHpvb2tzISBJIGNhblxcJ3QgYmVsaWV2ZSBpdCFcXFwiIGhlIHNhaWQnXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICAvLyBMaXRlcmFsIGxpc3QgKGFycmF5KSwgZWc6ICBgWzEsMiAsIHRydWUsZmFsc2UgXWBcbiAge1xuICAgIG5hbWU6IFwibGl0ZXJhbF9saXN0XCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJcXFxcW1tsaXN0OntleHByZXNzaW9ufSxdP1xcXFxdXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpdGVyYWxfbGlzdCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBbJHtsaXN0ID8gbGlzdC5qb2luKFwiLCBcIikgOiBcIlwifV1gO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgbGl0ZXJhbCBsaXN0c1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIltdXCIsIFwiW11cIl0sXG4gICAgICAgICAgW1wiWzFdXCIsIFwiWzFdXCJdLFxuICAgICAgICAgIFtcIlsxLF1cIiwgXCJbMV1cIl0sXG4gICAgICAgICAgW1wiWzEsMiwzXVwiLCBcIlsxLCAyLCAzXVwiXSxcbiAgICAgICAgICBbXCJbMSwgMiwgM11cIiwgXCJbMSwgMiwgM11cIl0sXG4gICAgICAgICAgW1wiWzEsMiwzLF1cIiwgXCJbMSwgMiwgM11cIl0sXG4gICAgICAgICAgW1wiW3llcyxubywnYScsMV1cIiwgXCJbdHJ1ZSwgZmFsc2UsICdhJywgMV1cIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImRvZXNuJ3QgbWF0Y2ggbWFsZm9ybWVkIGxpc3RzIFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIlwiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcIlssMV1cIiwgdW5kZWZpbmVkXVxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuXG4gIC8vIFBhcmVudGhlc2l6ZWQgZXhwcmVzc2lvblxuICB7XG4gICAgbmFtZTogXCJwYXJlbnRoZXNpemVkX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIlxcXFwoe2V4cHJlc3Npb259XFxcXClcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcGFyZW50aGVzaXplZF9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgZXhwcmVzc2lvbiB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICAvLyBkb24ndCBkb3VibGUgcGFyZW5zIGlmIG5vdCBuZWNlc3NhcnlcbiAgICAgICAgaWYgKHR5cGVvZiBleHByZXNzaW9uID09PSBcInN0cmluZ1wiICYmIGV4cHJlc3Npb24uc3RhcnRzV2l0aChcIihcIikgJiYgZXhwcmVzc2lvbi5lbmRzV2l0aChcIilcIikpIHJldHVybiBleHByZXNzaW9uO1xuICAgICAgICByZXR1cm4gXCIoXCIgKyBleHByZXNzaW9uICsgXCIpXCI7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBwYXJlbnRoZXNpemVkIGV4cHJlc3Npb25zXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiKHNvbWVWYXIpXCIsIFwiKHNvbWVWYXIpXCJdLFxuICAgICAgICAgIFtcIigoc29tZVZhcikpXCIsIFwiKHNvbWVWYXIpXCJdLFxuICAgICAgICAgIFtcIigxIGFuZCB5ZXMpXCIsIFwiKDEgJiYgdHJ1ZSlcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIG11bHRpcGxlIHBhcmVudGhlc2lzXCIsXG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiKDEpIGFuZCAoeWVzKVwiLCBcIigoMSkgJiYgKHRydWUpKVwiXSxcbiAgICAgICAgICBbXCIoKDEpIGFuZCAoeWVzKSlcIiwgXCIoKDEpICYmICh0cnVlKSlcIl0sXG4gICAgICAgICAgW1wiKCgxKSBhbmQgKCh5ZXMpKSlcIiwgXCIoKDEpICYmICh0cnVlKSlcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImRvZXNuJ3QgbWF0Y2ggbWFsZm9ybWVkIHBhcmVudGhlc2l6ZWQgZXhwcmVzc2lvbnNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCIoZm9vXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wiKGZvbyhiYXIpYmF6XCIsIHVuZGVmaW5lZF0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9XG5cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvY29yZS5qcyIsIi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiA3OyB9IH0pLmEgIT0gNztcbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZGVzY3JpcHRvcnMuanNcbi8vIG1vZHVsZSBpZCA9IDcyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19oYXMuanNcbi8vIG1vZHVsZSBpZCA9IDczXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGRQID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcykge1xuICBhbk9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBhbk9iamVjdChBdHRyaWJ1dGVzKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBkUChPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG4gIGlmICgnZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpIHRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XG4gIGlmICgndmFsdWUnIGluIEF0dHJpYnV0ZXMpIE9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanNcbi8vIG1vZHVsZSBpZCA9IDc0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3RQcm9wVHlwZXNTZWNyZXQgPSByZXF1aXJlKCcuL2xpYi9SZWFjdFByb3BUeXBlc1NlY3JldCcpO1xuXG5mdW5jdGlvbiBlbXB0eUZ1bmN0aW9uKCkge31cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gc2hpbShwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUsIHNlY3JldCkge1xuICAgIGlmIChzZWNyZXQgPT09IFJlYWN0UHJvcFR5cGVzU2VjcmV0KSB7XG4gICAgICAvLyBJdCBpcyBzdGlsbCBzYWZlIHdoZW4gY2FsbGVkIGZyb20gUmVhY3QuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoXG4gICAgICAnQ2FsbGluZyBQcm9wVHlwZXMgdmFsaWRhdG9ycyBkaXJlY3RseSBpcyBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBgcHJvcC10eXBlc2AgcGFja2FnZS4gJyArXG4gICAgICAnVXNlIFByb3BUeXBlcy5jaGVja1Byb3BUeXBlcygpIHRvIGNhbGwgdGhlbS4gJyArXG4gICAgICAnUmVhZCBtb3JlIGF0IGh0dHA6Ly9mYi5tZS91c2UtY2hlY2stcHJvcC10eXBlcydcbiAgICApO1xuICAgIGVyci5uYW1lID0gJ0ludmFyaWFudCBWaW9sYXRpb24nO1xuICAgIHRocm93IGVycjtcbiAgfTtcbiAgc2hpbS5pc1JlcXVpcmVkID0gc2hpbTtcbiAgZnVuY3Rpb24gZ2V0U2hpbSgpIHtcbiAgICByZXR1cm4gc2hpbTtcbiAgfTtcbiAgLy8gSW1wb3J0YW50IVxuICAvLyBLZWVwIHRoaXMgbGlzdCBpbiBzeW5jIHdpdGggcHJvZHVjdGlvbiB2ZXJzaW9uIGluIGAuL2ZhY3RvcnlXaXRoVHlwZUNoZWNrZXJzLmpzYC5cbiAgdmFyIFJlYWN0UHJvcFR5cGVzID0ge1xuICAgIGFycmF5OiBzaGltLFxuICAgIGJvb2w6IHNoaW0sXG4gICAgZnVuYzogc2hpbSxcbiAgICBudW1iZXI6IHNoaW0sXG4gICAgb2JqZWN0OiBzaGltLFxuICAgIHN0cmluZzogc2hpbSxcbiAgICBzeW1ib2w6IHNoaW0sXG5cbiAgICBhbnk6IHNoaW0sXG4gICAgYXJyYXlPZjogZ2V0U2hpbSxcbiAgICBlbGVtZW50OiBzaGltLFxuICAgIGluc3RhbmNlT2Y6IGdldFNoaW0sXG4gICAgbm9kZTogc2hpbSxcbiAgICBvYmplY3RPZjogZ2V0U2hpbSxcbiAgICBvbmVPZjogZ2V0U2hpbSxcbiAgICBvbmVPZlR5cGU6IGdldFNoaW0sXG4gICAgc2hhcGU6IGdldFNoaW0sXG4gICAgZXhhY3Q6IGdldFNoaW1cbiAgfTtcblxuICBSZWFjdFByb3BUeXBlcy5jaGVja1Byb3BUeXBlcyA9IGVtcHR5RnVuY3Rpb247XG4gIFJlYWN0UHJvcFR5cGVzLlByb3BUeXBlcyA9IFJlYWN0UHJvcFR5cGVzO1xuXG4gIHJldHVybiBSZWFjdFByb3BUeXBlcztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcHJvcC10eXBlcy9mYWN0b3J5V2l0aFRocm93aW5nU2hpbXMuanNcbi8vIG1vZHVsZSBpZCA9IDc3MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbi8qKlxuICogQG1vZHVsZSBjb21wb25lbnRXcmFwcGVyXG4gKlxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgKiBhcyBzdG9yZSBmcm9tICcuLi9zdG9yZSc7XG5pbXBvcnQgeyBvbk1vdW50LCBvblVubW91bnQgfSBmcm9tICcuLi9ldmVudF9oYW5kbGVycyc7XG5pbXBvcnQgeyBBTExfS0VZUyB9IGZyb20gJy4uL2xpYi9rZXlzJztcblxuLyoqXG4gKiBjb21wb25lbnRXcmFwcGVyXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSBXcmFwcGVkQ29tcG9uZW50IFJlYWN0IGNvbXBvbmVudCBjbGFzcyB0byBiZSB3cmFwcGVkXG4gKiBAcGFyYW0ge2FycmF5fSBba2V5c10gVGhlIGtleShzKSBib3VuZCB0byB0aGUgY2xhc3NcbiAqIEByZXR1cm4ge29iamVjdH0gVGhlIGhpZ2hlci1vcmRlciBmdW5jdGlvbiB0aGF0IHdyYXBzIHRoZSBkZWNvcmF0ZWQgY2xhc3NcbiAqL1xuZnVuY3Rpb24gY29tcG9uZW50V3JhcHBlcihXcmFwcGVkQ29tcG9uZW50KSB7XG4gIHZhciBrZXlzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBBTExfS0VZUztcblxuICB2YXIgS2V5Qm9hcmRIZWxwZXIgPSBmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhLZXlCb2FyZEhlbHBlciwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBLZXlCb2FyZEhlbHBlcihwcm9wcykge1xuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEtleUJvYXJkSGVscGVyKTtcblxuICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKEtleUJvYXJkSGVscGVyLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoS2V5Qm9hcmRIZWxwZXIpKS5jYWxsKHRoaXMsIHByb3BzKSk7XG5cbiAgICAgIF90aGlzLnN0YXRlID0ge1xuICAgICAgICBldmVudDogbnVsbFxuICAgICAgfTtcbiAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoS2V5Qm9hcmRIZWxwZXIsIFt7XG4gICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIG9uTW91bnQodGhpcyk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBvblVubW91bnQodGhpcyk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnaGFuZGxlS2V5RG93bicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaGFuZGxlS2V5RG93bihldmVudCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAvLyB0byBzaW11bGF0ZSBhIGtleXByZXNzLCBzZXQgdGhlIGV2ZW50IGFuZCB0aGVuIGNsZWFyIGl0IGluIHRoZSBjYWxsYmFja1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXZlbnQ6IGV2ZW50IH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMyLnNldFN0YXRlKHsgZXZlbnQ6IG51bGwgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChXcmFwcGVkQ29tcG9uZW50LCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywgeyBrZXlkb3duOiB0aGlzLnN0YXRlIH0pKTtcbiAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gS2V5Qm9hcmRIZWxwZXI7XG4gIH0oUmVhY3QuQ29tcG9uZW50KTtcblxuICBzdG9yZS5zZXRCaW5kaW5nKHsga2V5czogW10uY29uY2F0KGtleXMpLCBmbjogS2V5Qm9hcmRIZWxwZXIucHJvdG90eXBlLmhhbmRsZUtleURvd24sIHRhcmdldDogS2V5Qm9hcmRIZWxwZXIucHJvdG90eXBlIH0pO1xuXG4gIHJldHVybiBLZXlCb2FyZEhlbHBlcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY29tcG9uZW50V3JhcHBlcjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9kZWNvcmF0b3JzL2NsYXNzX2RlY29yYXRvci5qc1xuLy8gbW9kdWxlIGlkID0gODQxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxuLyoqXG4gKiBAbW9kdWxlIGRlY29yYXRvcnNcbiAqXG4gKi9cbmltcG9ydCBjbGFzc1dyYXBwZXIgZnJvbSAnLi9jbGFzc19kZWNvcmF0b3InO1xuaW1wb3J0IG1ldGhvZFdyYXBwZXIgZnJvbSAnLi9tZXRob2RfZGVjb3JhdG9yJztcbmltcG9ydCBtZXRob2RXcmFwcGVyU2NvcGVkIGZyb20gJy4vbWV0aG9kX2RlY29yYXRvcl9zY29wZWQnO1xuXG4vKipcbiAqIG5vb3BEZWNvcmF0b3JcbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEByZXR1cm4ge3VuZGVmaW5lZH0gUmV0dXJucyBgdW5kZWZpbmVkYCBzbyB0aGF0IHRoZSBvcmlnaW5hbCB1bmRlY29yYXRlZCBpbnN0YW5jZS9tZXRob2QgaXMgdXNlZFxuICovXG5mdW5jdGlvbiBub29wRGVjb3JhdG9yKCkge1xuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIF9kZWNvcmF0b3JcbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1ldGhvZEZuIFRoZSBtZXRob2Qgd3JhcHBlciB0byBkZWxlZ2F0ZSB0bywgYmFzZWQgb24gd2hldGhlciB1c2VyIGhhcyBzcGVjaWZpZWQgYSBzY29wZWQgZGVjb3JhdG9yIG9yIG5vdFxuICogQHBhcmFtIHtBcnJheX0gLi4uYXJncyBSZW1haW5kZXIgb2YgYXJndW1lbnRzIHBhc3NlZCBpblxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBkZWNvcmF0ZWQgY2xhc3Mgb3IgbWV0aG9kXG4gKi9cbmZ1bmN0aW9uIF9kZWNvcmF0b3IobWV0aG9kRm4pIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuID4gMSA/IF9sZW4gLSAxIDogMCksIF9rZXkgPSAxOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgYXJnc1tfa2V5IC0gMV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICAvLyBjaGVjayB0aGUgZmlyc3QgYXJndW1lbnQgdG8gc2VlIGlmIGl0J3MgYSB1c2VyLXN1cHBsaWVkIGtleWNvZGUgb3IgYXJyYXlcbiAgLy8gb2Yga2V5Y29kZXMsIG9yIGlmIGl0J3MgdGhlIHdyYXBwZWQgY2xhc3Mgb3IgbWV0aG9kXG4gIHZhciB0ZXN0QXJnID0gYXJnc1swXTtcbiAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5KHRlc3RBcmcpO1xuXG4gIC8vIGlmIHRoZSB0ZXN0IGFyZ3VtZW50IGlzIG5vdCBhbiBvYmplY3Qgb3IgZnVuY3Rpb24sIGl0IGlzIHVzZXItc3VwcGxpZWRcbiAgLy8ga2V5Y29kZXMuIGVsc2UgdGhlcmUgYXJlIG5vIGFyZ3VtZW50cyBhbmQgaXQncyBqdXN0IHRoZSB3cmFwcGVkIGNsYXNzXG4gIGlmIChpc0FycmF5IHx8IH5bJ3N0cmluZycsICdudW1iZXInLCAnc3ltYm9sJ10uaW5kZXhPZih0eXBlb2YgdGVzdEFyZyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YodGVzdEFyZykpKSB7XG4gICAgdmFyIGtleXMgPSBpc0FycmF5ID8gdGVzdEFyZyA6IGFyZ3M7XG5cbiAgICAvLyByZXR1cm4gdGhlIGRlY29yYXRvciBmdW5jdGlvbiwgd2hpY2ggb24gdGhlIG5leHQgY2FsbCB3aWxsIGxvb2sgZm9yXG4gICAgLy8gdGhlIHByZXNlbmNlIG9mIGEgbWV0aG9kIG5hbWUgdG8gZGV0ZXJtaW5lIGlmIHRoaXMgaXMgYSB3cmFwcGVkIG1ldGhvZFxuICAgIC8vIG9yIGNvbXBvbmVudFxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBtZXRob2ROYW1lLCBkZXNjcmlwdG9yKSB7XG4gICAgICByZXR1cm4gbWV0aG9kTmFtZSA/IG1ldGhvZEZuKHsgdGFyZ2V0OiB0YXJnZXQsIGRlc2NyaXB0b3I6IGRlc2NyaXB0b3IsIGtleXM6IGtleXMgfSkgOiBjbGFzc1dyYXBwZXIodGFyZ2V0LCBrZXlzKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHZhciBXcmFwcGVkQ29tcG9uZW50ID0gYXJnc1swXTtcbiAgICB2YXIgbWV0aG9kTmFtZSA9IGFyZ3NbMV07XG5cbiAgICAvLyBtZXRob2QgZGVjb3JhdG9ycyB3aXRob3V0IGtleWNvZGUgKHdoaWNoKSBhcmd1bWVudHMgYXJlIG5vdCBhbGxvd2VkLlxuICAgIGlmIChXcmFwcGVkQ29tcG9uZW50ICYmICFtZXRob2ROYW1lKSB7XG4gICAgICByZXR1cm4gY2xhc3NXcmFwcGVyLmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihtZXRob2ROYW1lICsgJzogTWV0aG9kIGRlY29yYXRvcnMgbXVzdCBoYXZlIGtleWNvZGUgYXJndW1lbnRzLCBzbyB0aGUgZGVjb3JhdG9yIGZvciB0aGlzIG1ldGhvZCB3aWxsIG5vdCBkbyBhbnl0aGluZycpO1xuICAgICAgcmV0dXJuIG5vb3BEZWNvcmF0b3I7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICoga2V5ZG93blNjb3BlZFxuICpcbiAqIE1ldGhvZCBkZWNvcmF0b3IgdGhhdCB3aWxsIGxvb2sgZm9yIGNoYW5nZXMgdG8gaXRzIHRhcmdldGVkIGNvbXBvbmVudCdzXG4gKiBga2V5ZG93bmAgcHJvcHMgdG8gZGVjaWRlIHdoZW4gdG8gdHJpZ2dlciwgcmF0aGVyIHRoYW4gcmVzcG9uZGluZyBkaXJlY3RseVxuICogdG8ga2V5ZG93biBldmVudHMuIFRoaXMgbGV0cyB5b3Ugc3BlY2lmeSBhIEBrZXlkb3duIGRlY29yYXRlZCBjbGFzcyBoaWdoZXJcbiAqIHVwIGluIHRoZSB2aWV3IGhpZXJhcmNoeSBmb3IgbGFyZ2VyIHNjb3Bpbmcgb2Yga2V5ZG93biBldmVudHMsIG9yIGZvclxuICogcHJvZ3JhbW1hdGljYWxseSBzZW5kaW5nIGtleWRvd24gZXZlbnRzIGFzIHByb3BzIGludG8gdGhlIGNvbXBvbmVudHMgaW4gb3JkZXJcbiAqIHRvIHRyaWdnZXIgZGVjb3JhdGVkIG1ldGhvZHMgd2l0aCBtYXRjaGluZyBrZXlzLlxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge0FycmF5fSAuLi5hcmdzICBBbGwgKG9yIG5vKSBhcmd1bWVudHMgcGFzc2VkIGluIGZyb20gZGVjb3JhdGlvblxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBkZWNvcmF0ZWQgY2xhc3Mgb3IgbWV0aG9kXG4gKi9cbmZ1bmN0aW9uIGtleWRvd25TY29wZWQoKSB7XG4gIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4yKSwgX2tleTIgPSAwOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgYXJnc1tfa2V5Ml0gPSBhcmd1bWVudHNbX2tleTJdO1xuICB9XG5cbiAgcmV0dXJuIF9kZWNvcmF0b3IuYXBwbHkodW5kZWZpbmVkLCBbbWV0aG9kV3JhcHBlclNjb3BlZF0uY29uY2F0KGFyZ3MpKTtcbn1cblxuLyoqXG4gKiBrZXlkb3duXG4gKlxuICogVGhlIG1haW4gZGVjb3JhdG9yIGFuZCBkZWZhdWx0IGV4cG9ydCwgaGFuZGxlcyBib3RoIGNsYXNzZXMgYW5kIG1ldGhvZHMuXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7QXJyYXl9IC4uLmFyZ3MgIEFsbCAob3Igbm8pIGFyZ3VtZW50cyBwYXNzZWQgaW4gZnJvbSBkZWNvcmF0aW9uXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIGRlY29yYXRlZCBjbGFzcyBvciBtZXRob2RcbiAqL1xuZnVuY3Rpb24ga2V5ZG93bigpIHtcbiAgZm9yICh2YXIgX2xlbjMgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbjMpLCBfa2V5MyA9IDA7IF9rZXkzIDwgX2xlbjM7IF9rZXkzKyspIHtcbiAgICBhcmdzW19rZXkzXSA9IGFyZ3VtZW50c1tfa2V5M107XG4gIH1cblxuICByZXR1cm4gX2RlY29yYXRvci5hcHBseSh1bmRlZmluZWQsIFttZXRob2RXcmFwcGVyXS5jb25jYXQoYXJncykpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBrZXlkb3duO1xuXG5leHBvcnQgeyBrZXlkb3duU2NvcGVkIH07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gODQyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxuLyoqXG4gKiBAbW9kdWxlIG1ldGhvZFdyYXBwZXJcbiAqXG4gKi9cbmltcG9ydCAqIGFzIHN0b3JlIGZyb20gJy4uL3N0b3JlJztcbmltcG9ydCB7IG9uTW91bnQsIG9uVW5tb3VudCwgX29uS2V5RG93biB9IGZyb20gJy4uL2V2ZW50X2hhbmRsZXJzJztcblxuLyoqXG4gKiBfaXNSZWFjdEtleURvd25cbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCBUaGUgcG9zc2libHkgc3ludGhldGljIGV2ZW50IHBhc3NlZCBhcyBhbiBhcmd1bWVudCB3aXRoXG4gKiB0aGUgbWV0aG9kIGludm9jYXRpb24uXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBfaXNSZWFjdEtleURvd24oZXZlbnQpIHtcbiAgcmV0dXJuIGV2ZW50ICYmICh0eXBlb2YgZXZlbnQgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKGV2ZW50KSkgPT09ICdvYmplY3QnICYmIGV2ZW50Lm5hdGl2ZUV2ZW50IGluc3RhbmNlb2Ygd2luZG93LktleWJvYXJkRXZlbnQgJiYgZXZlbnQudHlwZSA9PT0gJ2tleWRvd24nO1xufVxuXG4vKipcbiAqIG1ldGhvZFdyYXBwZXJcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MgQWxsIGFyZ3VtZW50cyBuZWNlc3NhcnkgZm9yIHdyYXBwaW5nIG1ldGhvZFxuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MudGFyZ2V0IFRoZSBkZWNvcmF0ZWQgY2xhc3NcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzLmRlc2NyaXB0b3IgTWV0aG9kIGRlc2NyaXB0b3JcbiAqIEBwYXJhbSB7YXJyYXl9IGFyZ3Mua2V5cyBUaGUgYXJyYXkgb2Yga2V5cyBib3VuZCB0byB0aGUgZ2l2ZW4gbWV0aG9kXG4gKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBtZXRob2QgZGVzY3JpcHRvclxuICovXG5mdW5jdGlvbiBtZXRob2RXcmFwcGVyKF9yZWYpIHtcbiAgdmFyIHRhcmdldCA9IF9yZWYudGFyZ2V0LFxuICAgICAgZGVzY3JpcHRvciA9IF9yZWYuZGVzY3JpcHRvcixcbiAgICAgIGtleXMgPSBfcmVmLmtleXM7XG5cblxuICB2YXIgZm4gPSBkZXNjcmlwdG9yLnZhbHVlO1xuXG4gIC8vIGlmIHdlIGhhdmVuJ3QgYWxyZWFkeSBjcmVhdGVkIGEgYmluZGluZyBmb3IgdGhpcyBjbGFzcyAodmlhIGFub3RoZXJcbiAgLy8gZGVjb3JhdGVkIG1ldGhvZCksIHdyYXAgdGhlc2UgbGlmZWN5Y2xlIG1ldGhvZHMuXG4gIGlmICghc3RvcmUuZ2V0QmluZGluZyh0YXJnZXQpKSB7XG4gICAgdmFyIGNvbXBvbmVudERpZE1vdW50ID0gdGFyZ2V0LmNvbXBvbmVudERpZE1vdW50LFxuICAgICAgICBjb21wb25lbnRXaWxsVW5tb3VudCA9IHRhcmdldC5jb21wb25lbnRXaWxsVW5tb3VudDtcblxuXG4gICAgdGFyZ2V0LmNvbXBvbmVudERpZE1vdW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgb25Nb3VudCh0aGlzKTtcbiAgICAgIGlmIChjb21wb25lbnREaWRNb3VudCkgcmV0dXJuIGNvbXBvbmVudERpZE1vdW50LmNhbGwodGhpcyk7XG4gICAgfTtcblxuICAgIHRhcmdldC5jb21wb25lbnRXaWxsVW5tb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIG9uVW5tb3VudCh0aGlzKTtcbiAgICAgIGlmIChjb21wb25lbnRXaWxsVW5tb3VudCkgcmV0dXJuIGNvbXBvbmVudFdpbGxVbm1vdW50LmNhbGwodGhpcyk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIGFkZCB0aGlzIGJpbmRpbmcgb2Yga2V5cyBhbmQgbWV0aG9kIHRvIHRoZSB0YXJnZXQncyBiaW5kaW5nc1xuICBzdG9yZS5zZXRCaW5kaW5nKHsga2V5czoga2V5cywgdGFyZ2V0OiB0YXJnZXQsIGZuOiBmbiB9KTtcblxuICBkZXNjcmlwdG9yLnZhbHVlID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgIH1cblxuICAgIHZhciBtYXliZUV2ZW50ID0gYXJnc1swXTtcblxuICAgIGlmIChfaXNSZWFjdEtleURvd24obWF5YmVFdmVudCkpIHtcbiAgICAgIC8vIHByb3h5IG1ldGhvZCBpbiBvcmRlciB0byB1c2UgQGtleWRvd24gYXMgZmlsdGVyIGZvciBrZXlkb3duIGV2ZW50cyBjb21pbmdcbiAgICAgIC8vIGZyb20gYW4gYWN0dWFsIG9uS2V5RG93biBiaW5kaW5nIChhcyBpZGVudGlmaWVkIGJ5IHJlYWN0J3MgYWRkaXRpb24gb2ZcbiAgICAgIC8vICduYXRpdmVFdmVudCcgKyB0eXBlID09PSAna2V5ZG93bicpXG4gICAgICBpZiAoIW1heWJlRXZlbnQuY3RybEtleSkge1xuICAgICAgICAvLyB3ZSBhbHJlYWR5IHdoaXRlbGlzdCBzaG9ydGN1dHMgd2l0aCBjdHJsIG1vZGlmaWVycyBzbyBpZiB3ZSB3ZXJlIHRvXG4gICAgICAgIC8vIGZpcmUgaXQgYWdhaW4gaGVyZSB0aGUgbWV0aG9kIHdvdWxkIHRyaWdnZXIgdHdpY2UuIHNlZSBodHRwczovL2dpdGh1Yi5jb20vZ2xvcnRoby9yZWFjdC1rZXlkb3duL2lzc3Vlcy8zOFxuICAgICAgICByZXR1cm4gX29uS2V5RG93bihtYXliZUV2ZW50LCB0cnVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFtYXliZUV2ZW50IHx8ICEobWF5YmVFdmVudCBpbnN0YW5jZW9mIHdpbmRvdy5LZXlib2FyZEV2ZW50KSB8fCBtYXliZUV2ZW50LnR5cGUgIT09ICdrZXlkb3duJykge1xuICAgICAgLy8gaWYgb3VyIGZpcnN0IGFyZ3VtZW50IGlzIGEga2V5ZG93biBldmVudCBpdCBpcyBiZWluZyBoYW5kbGVkIGJ5IG91clxuICAgICAgLy8gYmluZGluZyBzeXN0ZW0uIGlmIGl0J3MgYW55dGhpbmcgZWxzZSwganVzdCBwYXNzIHRocm91Z2guXG4gICAgICByZXR1cm4gZm4uY2FsbC5hcHBseShmbiwgW3RoaXNdLmNvbmNhdChhcmdzKSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBkZXNjcmlwdG9yO1xufVxuXG5leHBvcnQgZGVmYXVsdCBtZXRob2RXcmFwcGVyO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvbWV0aG9kX2RlY29yYXRvci5qc1xuLy8gbW9kdWxlIGlkID0gODQzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogQG1vZHVsZSBtZXRob2RXcmFwcGVyU2NvcGVkXG4gKlxuICovXG5pbXBvcnQgbWF0Y2hLZXlzIGZyb20gJy4uL2xpYi9tYXRjaF9rZXlzJztcbmltcG9ydCBwYXJzZUtleXMgZnJvbSAnLi4vbGliL3BhcnNlX2tleXMnO1xuXG4vKipcbiAqIG1ldGhvZFdyYXBwZXJTY29wZWRcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MgQWxsIGFyZ3MgbmVjZXNzYXJ5IGZvciBkZWNvcmF0aW5nIHRoZSBtZXRob2RcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzLnRhcmdldCBUaGUgZGVjb3JhdGVkIG1ldGhvZCdzIGNsYXNzIG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MuZGVzY3JpcHRvciBUaGUgbWV0aG9kJ3MgZGVzY3JpcHRvciBvYmplY3RcbiAqIEBwYXJhbSB7YXJyYXl9IGFyZ3Mua2V5cyBUaGUga2V5IGNvZGVzIGJvdW5kIHRvIHRoZSBkZWNvcmF0ZWQgbWV0aG9kXG4gKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBtZXRob2QncyBkZXNjcmlwdG9yIG9iamVjdFxuICovXG5mdW5jdGlvbiBtZXRob2RXcmFwcGVyU2NvcGVkKF9yZWYpIHtcbiAgdmFyIHRhcmdldCA9IF9yZWYudGFyZ2V0LFxuICAgICAgZGVzY3JpcHRvciA9IF9yZWYuZGVzY3JpcHRvcixcbiAgICAgIGtleXMgPSBfcmVmLmtleXM7XG4gIHZhciBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzID0gdGFyZ2V0LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM7XG5cbiAgdmFyIGZuID0gZGVzY3JpcHRvci52YWx1ZTtcbiAgaWYgKCFrZXlzKSB7XG4gICAgY29uc29sZS53YXJuKGZuICsgJzoga2V5ZG93blNjb3BlZCByZXF1aXJlcyBvbmUgb3IgbW9yZSBrZXlzJyk7XG4gIH0gZWxzZSB7XG5cbiAgICAvKipcbiAgICAgKiBfc2hvdWxkVHJpZ2dlclxuICAgICAqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoaXNQcm9wcyBFeHN0aW5nIHByb3BzIGZyb20gdGhlIHdyYXBwZWQgY29tcG9uZW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoaXNQcm9wcy5rZXlkb3duIFRoZSBuYW1lc3BhY2VkIHN0YXRlIGZyb20gdGhlIGhpZ2hlci1vcmRlclxuICAgICAqIGNvbXBvbmVudCAoY2xhc3NfZGVjb3JhdG9yKVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBuZXh0UHJvcHMgVGhlIGluY29taW5nIHByb3BzIGZyb20gdGhlIHdyYXBwZWQgY29tcG9uZW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IG5leHRQcm9wcy5rZXlkb3duIFRoZSBuYW1lc2NhcGVkIHN0YXRlIGZyb20gdGhlIGhpZ2hlci1vcmRlclxuICAgICAqIGNvbXBvbmVudCAoY2xhc3NfZGVjb3JhdG9yKVxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGtleXMgVGhlIGtleXMgYm91bmQgdG8gdGhlIGRlY29yYXRlZCBtZXRob2RcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIGFsbCB0ZXN0cyBoYXZlIHBhc3NlZFxuICAgICAqL1xuICAgIHZhciBfc2hvdWxkVHJpZ2dlciA9IGZ1bmN0aW9uIF9zaG91bGRUcmlnZ2VyKGtleWRvd25UaGlzLCBrZXlkb3duTmV4dCkge1xuICAgICAgaWYgKCEoa2V5ZG93bk5leHQgJiYga2V5ZG93bk5leHQuZXZlbnQgJiYgIWtleWRvd25UaGlzLmV2ZW50KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICByZXR1cm4ga2V5U2V0cy5zb21lKGZ1bmN0aW9uIChrZXlTZXQpIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoS2V5cyh7IGtleVNldDoga2V5U2V0LCBldmVudDoga2V5ZG93bk5leHQuZXZlbnQgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gd3JhcCB0aGUgY29tcG9uZW50J3MgbGlmZWN5Y2xlIG1ldGhvZCB0byBpbnRlcmNlcHQga2V5IGNvZGVzIGNvbWluZyBkb3duXG4gICAgLy8gZnJvbSB0aGUgd3JhcHBlZC9zY29wZWQgY29tcG9uZW50IHVwIHRoZSB2aWV3IGhpZXJhcmNoeS4gaWYgbmV3IGtleWRvd25cbiAgICAvLyBldmVudCBoYXMgYXJyaXZlZCBhbmQgdGhlIGtleSBjb2RlcyBtYXRjaCB3aGF0IHdhcyBzcGVjaWZpZWQgaW4gdGhlXG4gICAgLy8gZGVjb3JhdG9yLCBjYWxsIHRoZSB3cmFwcGVkIG1ldGhvZC5cblxuXG4gICAgdmFyIGtleVNldHMgPSBwYXJzZUtleXMoa2V5cyk7dGFyZ2V0LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgPSBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgICB2YXIga2V5ZG93bk5leHQgPSBuZXh0UHJvcHMua2V5ZG93bjtcbiAgICAgIHZhciBrZXlkb3duVGhpcyA9IHRoaXMucHJvcHMua2V5ZG93bjtcblxuXG4gICAgICBpZiAoX3Nob3VsZFRyaWdnZXIoa2V5ZG93blRoaXMsIGtleWRvd25OZXh0KSkge1xuICAgICAgICByZXR1cm4gZm4uY2FsbCh0aGlzLCBrZXlkb3duTmV4dC5ldmVudCk7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBhcmdzW19rZXkgLSAxXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMpIHJldHVybiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzLmNhbGwuYXBwbHkoY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcywgW3RoaXMsIG5leHRQcm9wc10uY29uY2F0KGFyZ3MpKTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGRlc2NyaXB0b3I7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1ldGhvZFdyYXBwZXJTY29wZWQ7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9tZXRob2RfZGVjb3JhdG9yX3Njb3BlZC5qc1xuLy8gbW9kdWxlIGlkID0gODQ0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHBvbHlmaWxsIGFycmF5LmZyb20gKG1haW5seSBmb3IgSUUpXG5pbXBvcnQgJy4vbGliL2FycmF5LmZyb20nO1xuXG4vLyBAa2V5ZG93biBhbmQgQGtleWRvd25TY29wZWRcbmV4cG9ydCB7IGRlZmF1bHQsIGtleWRvd25TY29wZWQgfSBmcm9tICcuL2RlY29yYXRvcnMnO1xuXG4vLyBzZXRCaW5kaW5nIC0gb25seSB1c2VmdWwgaWYgeW91J3JlIG5vdCBnb2luZyB0byB1c2UgZGVjb3JhdG9yc1xuZXhwb3J0IHsgc2V0QmluZGluZyB9IGZyb20gJy4vc3RvcmUnO1xuXG4vLyBLZXlzIC0gdXNlIHRoaXMgdG8gZmluZCBrZXkgY29kZXMgZm9yIHN0cmluZ3MuIGZvciBleGFtcGxlOiBLZXlzLmosIEtleXMuZW50ZXJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgS2V5cywgQUxMX0tFWVMsIEFMTF9QUklOVEFCTEVfS0VZUyB9IGZyb20gJy4vbGliL2tleXMnO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA4NDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gUHJvZHVjdGlvbiBzdGVwcyBvZiBFQ01BLTI2MiwgRWRpdGlvbiA2LCAyMi4xLjIuMVxuLy8gU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2Zyb21cbmlmICghQXJyYXkuZnJvbSkge1xuICBBcnJheS5mcm9tID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG4gICAgdmFyIGlzQ2FsbGFibGUgPSBmdW5jdGlvbiBpc0NhbGxhYmxlKGZuKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nIHx8IHRvU3RyLmNhbGwoZm4pID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICAgIH07XG4gICAgdmFyIHRvSW50ZWdlciA9IGZ1bmN0aW9uIHRvSW50ZWdlcih2YWx1ZSkge1xuICAgICAgdmFyIG51bWJlciA9IE51bWJlcih2YWx1ZSk7XG4gICAgICBpZiAoaXNOYU4obnVtYmVyKSkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICAgIGlmIChudW1iZXIgPT09IDAgfHwgIWlzRmluaXRlKG51bWJlcikpIHtcbiAgICAgICAgcmV0dXJuIG51bWJlcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiAobnVtYmVyID4gMCA/IDEgOiAtMSkgKiBNYXRoLmZsb29yKE1hdGguYWJzKG51bWJlcikpO1xuICAgIH07XG4gICAgdmFyIG1heFNhZmVJbnRlZ2VyID0gTWF0aC5wb3coMiwgNTMpIC0gMTtcbiAgICB2YXIgdG9MZW5ndGggPSBmdW5jdGlvbiB0b0xlbmd0aCh2YWx1ZSkge1xuICAgICAgdmFyIGxlbiA9IHRvSW50ZWdlcih2YWx1ZSk7XG4gICAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobGVuLCAwKSwgbWF4U2FmZUludGVnZXIpO1xuICAgIH07XG5cbiAgICAvLyBUaGUgbGVuZ3RoIHByb3BlcnR5IG9mIHRoZSBmcm9tIG1ldGhvZCBpcyAxLlxuICAgIHJldHVybiBmdW5jdGlvbiBmcm9tKGFycmF5TGlrZSAvKiwgbWFwRm4sIHRoaXNBcmcgKi8pIHtcbiAgICAgIC8vIDEuIExldCBDIGJlIHRoZSB0aGlzIHZhbHVlLlxuICAgICAgdmFyIEMgPSB0aGlzO1xuXG4gICAgICAvLyAyLiBMZXQgaXRlbXMgYmUgVG9PYmplY3QoYXJyYXlMaWtlKS5cbiAgICAgIHZhciBpdGVtcyA9IE9iamVjdChhcnJheUxpa2UpO1xuXG4gICAgICAvLyAzLiBSZXR1cm5JZkFicnVwdChpdGVtcykuXG4gICAgICBpZiAoYXJyYXlMaWtlID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFycmF5LmZyb20gcmVxdWlyZXMgYW4gYXJyYXktbGlrZSBvYmplY3QgLSBub3QgbnVsbCBvciB1bmRlZmluZWRcIik7XG4gICAgICB9XG5cbiAgICAgIC8vIDQuIElmIG1hcGZuIGlzIHVuZGVmaW5lZCwgdGhlbiBsZXQgbWFwcGluZyBiZSBmYWxzZS5cbiAgICAgIHZhciBtYXBGbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdm9pZCB1bmRlZmluZWQ7XG4gICAgICB2YXIgVDtcbiAgICAgIGlmICh0eXBlb2YgbWFwRm4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIC8vIDUuIGVsc2VcbiAgICAgICAgLy8gNS4gYSBJZiBJc0NhbGxhYmxlKG1hcGZuKSBpcyBmYWxzZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgICAgICBpZiAoIWlzQ2FsbGFibGUobWFwRm4pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJyYXkuZnJvbTogd2hlbiBwcm92aWRlZCwgdGhlIHNlY29uZCBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDUuIGIuIElmIHRoaXNBcmcgd2FzIHN1cHBsaWVkLCBsZXQgVCBiZSB0aGlzQXJnOyBlbHNlIGxldCBUIGJlIHVuZGVmaW5lZC5cbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgVCA9IGFyZ3VtZW50c1syXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyAxMC4gTGV0IGxlblZhbHVlIGJlIEdldChpdGVtcywgXCJsZW5ndGhcIikuXG4gICAgICAvLyAxMS4gTGV0IGxlbiBiZSBUb0xlbmd0aChsZW5WYWx1ZSkuXG4gICAgICB2YXIgbGVuID0gdG9MZW5ndGgoaXRlbXMubGVuZ3RoKTtcblxuICAgICAgLy8gMTMuIElmIElzQ29uc3RydWN0b3IoQykgaXMgdHJ1ZSwgdGhlblxuICAgICAgLy8gMTMuIGEuIExldCBBIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tDb25zdHJ1Y3RdXSBpbnRlcm5hbCBtZXRob2QgXG4gICAgICAvLyBvZiBDIHdpdGggYW4gYXJndW1lbnQgbGlzdCBjb250YWluaW5nIHRoZSBzaW5nbGUgaXRlbSBsZW4uXG4gICAgICAvLyAxNC4gYS4gRWxzZSwgTGV0IEEgYmUgQXJyYXlDcmVhdGUobGVuKS5cbiAgICAgIHZhciBBID0gaXNDYWxsYWJsZShDKSA/IE9iamVjdChuZXcgQyhsZW4pKSA6IG5ldyBBcnJheShsZW4pO1xuXG4gICAgICAvLyAxNi4gTGV0IGsgYmUgMC5cbiAgICAgIHZhciBrID0gMDtcbiAgICAgIC8vIDE3LiBSZXBlYXQsIHdoaWxlIGsgPCBsZW7igKYgKGFsc28gc3RlcHMgYSAtIGgpXG4gICAgICB2YXIga1ZhbHVlO1xuICAgICAgd2hpbGUgKGsgPCBsZW4pIHtcbiAgICAgICAga1ZhbHVlID0gaXRlbXNba107XG4gICAgICAgIGlmIChtYXBGbikge1xuICAgICAgICAgIEFba10gPSB0eXBlb2YgVCA9PT0gJ3VuZGVmaW5lZCcgPyBtYXBGbihrVmFsdWUsIGspIDogbWFwRm4uY2FsbChULCBrVmFsdWUsIGspO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIEFba10gPSBrVmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgayArPSAxO1xuICAgICAgfVxuICAgICAgLy8gMTguIExldCBwdXRTdGF0dXMgYmUgUHV0KEEsIFwibGVuZ3RoXCIsIGxlbiwgdHJ1ZSkuXG4gICAgICBBLmxlbmd0aCA9IGxlbjtcbiAgICAgIC8vIDIwLiBSZXR1cm4gQS5cbiAgICAgIHJldHVybiBBO1xuICAgIH07XG4gIH0oKTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvYXJyYXkuZnJvbS5qc1xuLy8gbW9kdWxlIGlkID0gODQ2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogQG1vZHVsZSBkb21IZWxwZXJzXG4gKlxuICovXG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcblxudmFyIGZvY3VzYWJsZVNlbGVjdG9yID0gJ2FbaHJlZl0sIGJ1dHRvbiwgaW5wdXQsIG9iamVjdCwgc2VsZWN0LCB0ZXh0YXJlYSwgW3RhYmluZGV4XSc7XG5cbi8qKlxuICogYmluZEZvY3VzYWJsZXM6IEZpbmQgYW55IGZvY3VzYWJsZSBjaGlsZCBlbGVtZW50cyBvZiB0aGUgY29tcG9uZW50IGluc3RhbmNlIGFuZFxuICogYWRkIGFuIG9uRm9jdXMgaGFuZGxlciB0byBmb2N1cyBvdXIga2V5ZG93biBoYW5kbGVycyBvbiB0aGUgcGFyZW50IGNvbXBvbmVudFxuICogd2hlbiB1c2VyIGtleXMgYXBwbGllcyBmb2N1cyB0byB0aGUgZWxlbWVudC5cbiAqXG4gKiBOT1RFOiBPbmUgbGltaXRhdGlvbiBvZiB0aGlzIHJpZ2h0IG5vdyBpcyB0aGF0IGlmIHlvdSB0YWIgb3V0IG9mIHRoZVxuICogY29tcG9uZW50LCBfZm9jdXNlZEluc3RhbmNlIHdpbGwgc3RpbGwgYmUgc2V0IHVudGlsIG5leHQgY2xpY2sgb3IgbW91bnQgb3JcbiAqIGNvbnRyb2xsZWQgZm9jdXMuXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSBpbnN0YW5jZSBUaGUga2V5LWJvdW5kIGNvbXBvbmVudCBpbnN0YW5jZVxuICogQHBhcmFtIHtjYWxsYmFja30gYWN0aXZhdGVPbkZvY3VzIFRoZSBmbiB0byBmaXJlIHdoZW4gZWxlbWVudCBpcyBmb2N1c2VkXG4gKi9cbmZ1bmN0aW9uIGJpbmRGb2N1c2FibGVzKGluc3RhbmNlLCBhY3RpdmF0ZU9uRm9jdXMpIHtcbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIG5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZShpbnN0YW5jZSk7XG4gICAgICBpZiAobm9kZSkge1xuICAgICAgICB2YXIgZm9jdXNhYmxlcyA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChmb2N1c2FibGVTZWxlY3Rvcik7XG4gICAgICAgIGlmIChmb2N1c2FibGVzLmxlbmd0aCkge1xuICAgICAgICAgIHZhciBvbkZvY3VzID0gZnVuY3Rpb24gb25Gb2N1cyhlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgb25Gb2N1c1ByZXYgPSBlbGVtZW50Lm9uZm9jdXM7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgIGFjdGl2YXRlT25Gb2N1cyhpbnN0YW5jZSk7XG4gICAgICAgICAgICAgIGlmIChvbkZvY3VzUHJldikgb25Gb2N1c1ByZXYuY2FsbChlbGVtZW50LCBldmVudCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH07XG4gICAgICAgICAgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZm9jdXNhYmxlcykuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQub25mb2N1cyA9IG9uRm9jdXMoZWxlbWVudCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gbm9vcCwgbW9zdGx5IHN1cHByZXNzaW5nIGVycm9yIGhlcmUgaHR0cHM6Ly9naXRodWIuY29tL2dsb3J0aG8vcmVhY3Qta2V5ZG93bi9pc3N1ZXMvNzZcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBmaW5kQ29udGFpbmVyTm9kZXM6IENhbGxlZCBieSBvdXIgY2xpY2sgaGFuZGxlciB0byBmaW5kIGluc3RhbmNlcyB3aXRoIG5vZGVzXG4gKiB0aGF0IGFyZSBlcXVhbCB0byBvciB0aGF0IGNvbnRhaW4gdGhlIGNsaWNrIHRhcmdldC4gQW55IHRoYXQgcGFzcyB0aGlzIHRlc3RcbiAqIHdpbGwgYmUgcmVjaXBpZW50cyBvZiB0aGUgbmV4dCBrZXlkb3duIGV2ZW50LlxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IFRoZSBjbGljayBldmVudC50YXJnZXQgRE9NIGVsZW1lbnRcbiAqIEByZXR1cm4ge2Z1bmN0aW9ufSBSZWR1Y2VyIGZ1bmN0aW9uXG4gKi9cbmZ1bmN0aW9uIGZpbmRDb250YWluZXJOb2Rlcyh0YXJnZXQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChtZW1vLCBpbnN0YW5jZSkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKGluc3RhbmNlKTtcbiAgICAgIGlmIChub2RlICYmIChub2RlID09PSB0YXJnZXQgfHwgbm9kZS5jb250YWlucyh0YXJnZXQpKSkge1xuICAgICAgICBtZW1vLnB1c2goeyBpbnN0YW5jZTogaW5zdGFuY2UsIG5vZGU6IG5vZGUgfSk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBzb3J0QnlET01Qb3NpdGlvbjogQ2FsbGVkIGJ5IG91ciBjbGljayBoYW5kbGVyIHRvIHNvcnQgYSBsaXN0IG9mIGluc3RhbmNlc1xuICogYWNjb3JkaW5nIHRvIGxlYXN0IC0+IG1vc3QgbmVzdGVkLiBUaGlzIGlzIHNvIHRoYXQgaWYgbXVsdGlwbGUga2V5Ym91bmRcbiAqIGluc3RhbmNlcyBoYXZlIG5vZGVzIHRoYXQgYXJlIGFuY2VzdG9ycyBvZiB0aGUgY2xpY2sgdGFyZ2V0LCB0aGV5IHdpbGwgYmVcbiAqIHNvcnRlZCB0byBsZXQgdGhlIGluc3RhbmNlIGNsb3Nlc3QgdG8gdGhlIGNsaWNrIHRhcmdldCBnZXQgZmlyc3QgZGlicyBvbiB0aGVcbiAqIG5leHQga2V5IGRvd24gZXZlbnQuXG4gKi9cbmZ1bmN0aW9uIHNvcnRCeURPTVBvc2l0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGEubm9kZS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihiLm5vZGUpID09PSAxMCA/IDEgOiAtMTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgeyBiaW5kRm9jdXNhYmxlczogYmluZEZvY3VzYWJsZXMsIGZpbmRDb250YWluZXJOb2RlczogZmluZENvbnRhaW5lck5vZGVzLCBzb3J0QnlET01Qb3NpdGlvbjogc29ydEJ5RE9NUG9zaXRpb24gfTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvZG9tX2hlbHBlcnMuanNcbi8vIG1vZHVsZSBpZCA9IDg0N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEBtb2R1bGUgTGlzdGVuZXJzXG4gKlxuICovXG5cbi8vIGZsYWcgZm9yIHdoZXRoZXIgY2xpY2sgbGlzdGVuZXIgaGFzIGJlZW4gYm91bmQgdG8gZG9jdW1lbnRcbnZhciBfY2xpY2tzQm91bmQgPSBmYWxzZTtcblxuLy8gZmxhZyBmb3Igd2hldGhlciBrZXlkb3duIGxpc3RlbmVyIGhhcyBiZWVuIGJvdW5kIHRvIGRvY3VtZW50XG52YXIgX2tleXNCb3VuZCA9IGZhbHNlO1xuXG52YXIgTGlzdGVuZXJzID0ge1xuICAvKipcbiAgICogX2JpbmRLZXlzXG4gICAqXG4gICAqIEBhY2Nlc3MgcHVibGljXG4gICAqL1xuICBiaW5kS2V5czogZnVuY3Rpb24gYmluZEtleXMoY2FsbGJhY2spIHtcbiAgICBpZiAoIV9rZXlzQm91bmQpIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBjYWxsYmFjayk7XG4gICAgICBfa2V5c0JvdW5kID0gdHJ1ZTtcbiAgICB9XG4gIH0sXG5cblxuICAvKipcbiAgICogdW5iaW5kS2V5c1xuICAgKlxuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKi9cbiAgdW5iaW5kS2V5czogZnVuY3Rpb24gdW5iaW5kS2V5cyhjYWxsYmFjaykge1xuICAgIGlmIChfa2V5c0JvdW5kKSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY2FsbGJhY2spO1xuICAgICAgX2tleXNCb3VuZCA9IGZhbHNlO1xuICAgIH1cbiAgfSxcblxuXG4gIC8qKlxuICAgKiBiaW5kQ2xpY2tzXG4gICAqXG4gICAqIEBhY2Nlc3MgcHVibGljXG4gICAqL1xuICBiaW5kQ2xpY2tzOiBmdW5jdGlvbiBiaW5kQ2xpY2tzKGNhbGxiYWNrKSB7XG4gICAgaWYgKCFfY2xpY2tzQm91bmQpIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FsbGJhY2ssIHRydWUpO1xuICAgICAgX2NsaWNrc0JvdW5kID0gdHJ1ZTtcbiAgICB9XG4gIH0sXG5cblxuICAvKipcbiAgICogdW5iaW5kQ2xpY2tzXG4gICAqXG4gICAqIEBhY2Nlc3MgcHVibGljXG4gICAqL1xuICB1bmJpbmRDbGlja3M6IGZ1bmN0aW9uIHVuYmluZENsaWNrcyhjYWxsYmFjaykge1xuICAgIGlmIChfY2xpY2tzQm91bmQpIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FsbGJhY2ssIHRydWUpO1xuICAgICAgX2NsaWNrc0JvdW5kID0gZmFsc2U7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBMaXN0ZW5lcnM7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL2xpc3RlbmVycy5qc1xuLy8gbW9kdWxlIGlkID0gODQ4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIENvdW50ZXIgYmVpbmcgaW5jcmVtZW50ZWQuIEpTIGlzIHNpbmdsZS10aHJlYWRlZCwgc28gaXQnbGwgSnVzdCBXb3Jr4oSiLlxudmFyIF9fY291bnRlciA9IDE7XG5cbi8qKlxuICogUmV0dXJucyBhIHByb2Nlc3Mtd2lkZSB1bmlxdWUgaWRlbnRpZmllci5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdXVpZCgpIHtcbiAgcmV0dXJuIFwidWlkLVwiICsgX19jb3VudGVyKys7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL3V1aWQuanNcbi8vIG1vZHVsZSBpZCA9IDg0OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvL1x0IyBQYXJzZXIgUnVsZXNcbi8vXHRSdWxlcyBjYW4gYmUgYXMgc2ltcGxlIGFzIGEgc3RyaW5nIGBLZXl3b3JkYCBvciBhIGNvbXBsZXggc2VxdWVuY2Ugb2YgKG5lc3RlZCkgcnVsZXMuXG4vL1xuLy9cdFBhcnNlIGEgcnVsZSB3aXRoIGBydWxlLnBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCwgZW5kKWAsIHRoaXMgd2lsbCBlaXRoZXI6XG4vL1x0XHQtIHJldHVybiBgdW5kZWZpbmVkYCBpZiB0aGUgcnVsZSBkb2Vzbid0IG1hdGNoIHRoZSBoZWFkIG9mIHRoZSB0b2tlbnMsIG9yXG4vL1x0XHQtIHJldHVybiBhIENMT05FIG9mIHRoZSBtYXRjaGVkIHJ1bGUgd2l0aCBhdCBsZWFzdCB0aGUgZm9sbG93aW5nOlxuLy9cdFx0XHQtIGBtYXRjaGVkYFx0XHRSZXN1bHRzIG9mIHlvdXIgcGFyc2UuXG4vL1x0XHRcdC0gYG5leHRTdGFydGBcdFBsYWNlIHdoZXJlIG5leHQgbWF0Y2ggc2hvdWxkIHN0YXJ0IChlZzogb25lIGJleW9uZCB3aGF0IHlvdSBtYXRjaGVkKS5cbi8vXG4vL1x0VGhlIGNsb25lIHJldHVybmVkIGFib3ZlIGNhbiBiZSBtYW5pcHVsYXRlZCB3aXRoXG4vL1x0XHQtIGBydWxlLnRvU291cmNlKClgXHQgIFJldHVybiBqYXZhc2NyaXB0IHNvdXJjZSB0byBpbnRlcnByZXQgdGhlIHJ1bGUuXG4vL1x0XHQtIGBydWxlLnRvU3ludGF4KClgXHQgIFJldHVybiBydWxlU3ludGF4IGZvciB0aGUgcnVsZSAobW9zdGx5IGZvciBkZWJ1Z2dpbmcpXG4vLyAgICAtXG4vL1xuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi9QYXJzZXIuanNcIjtcbmltcG9ydCBUb2tlbml6ZXIgZnJvbSBcIi4vVG9rZW5pemVyLmpzXCI7XG5cbmltcG9ydCBnbG9iYWwgZnJvbSBcIi4vdXRpbHMvZ2xvYmFsXCI7XG5pbXBvcnQgeyBpc1doaXRlc3BhY2UgfSBmcm9tIFwiLi91dGlscy9zdHJpbmdcIjtcblxuXG4vLyBBYnN0cmFjdCBSdWxlIGNsYXNzLlxuLy8gVE9ET0NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJ1bGUge1xuXHRjb25zdHJ1Y3RvciguLi5wcm9wcykge1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywgLi4ucHJvcHMpO1xuXHR9XG5cblx0Ly8gQ2xvbmUgdGhpcyBydWxlIGFuZCBhZGQgYW55IGBwcm9wc2AgcGFzc2VkIGluLlxuXHRjbG9uZShwcm9wcykge1xuXHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzLCBwcm9wcyk7XG5cdH1cblxuLy9cbi8vXHRQYXJzaW5nIHByaW1pdGl2ZXMgLS0geW91IE1VU1QgaW1wbGVtZW50IHRoZXNlIGluIHlvdXIgc3ViY2xhc3NlcyFcbi8vXG5cblx0Ly8gQXR0ZW1wdCB0byBtYXRjaCB0aGlzIHJ1bGUgYmV0d2VlbiBgc3RhcnRgIGFuZCBgZW5kYCBvZiBgdG9rZW5zYC5cblx0Ly8gUmV0dXJucyByZXN1bHRzIG9mIHRoZSBwYXJzZSBvciBgdW5kZWZpbmVkYC5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvLyBUZXN0IHRvIHNlZSBpZiBiaXRzIG9mIG91ciBydWxlIGFyZSBmb3VuZCBBTllXSEVSRSBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgIGluIHRoZSBgdG9rZW5zYC5cblx0Ly8gVGhpcyBpcyB1c2VkIGJ5IGNvbXBsaWNhdGVkIChlZzogbGVmdCByZWN1cnNpdmUpIHJ1bGVzIHRvIGV4aXQgcXVpY2tseSBpZiB0aGVyZSdzIG5vIGNoYW5jZS5cblx0Ly8gUmV0dXJuczpcblx0Ly9cdC0gYHRydWVgIGlmIHRoZSBydWxlIE1JR0hUIGJlIG1hdGNoZWQuXG5cdC8vXHQtIGBmYWxzZWAgaWYgdGhlcmUgaXMgTk8gV0FZIHRoZSBydWxlIGNhbiBiZSBtYXRjaGVkLlxuXHQvL1x0LSBgdW5kZWZpbmVkYCBpZiBub3QgZGV0ZXJtaW5zdGljIChlZzogbm8gd2F5IHRvIHRlbGwgcXVpY2tseSkuXG5cdHRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG4vL1xuLy8gIyMgb3V0cHV0IGFzIHNvdXJjZVxuLy9cblxuXHQvLyBPdXRwdXQgdmFsdWUgZm9yIHRoaXMgSU5TVEFOVElBVEVEIHJ1bGUgYXMgc291cmNlLlxuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkO1xuXHR9XG5cblxuLy9cbi8vICMjIG91dHB1dCBhcyBzdHJ1Y3R1cmU6XG4vL1xuXHR0b1N0cnVjdHVyZSgpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cbi8vXG4vLyAjIyByZWZsZWN0aW9uXG4vL1xuXG59XG5cblxuLy8gQWJzdHJhY3QgcnVsZSBmb3Igb25lIG9yIG1vcmUgc2VxdWVudGlhbCBsaXRlcmFsIHZhbHVlcyB0byBtYXRjaC5cbi8vIGBydWxlLmxpdGVyYWxzYCBpcyB0aGUgbGl0ZXJhbCBzdHJpbmcgb3IgYXJyYXkgb2YgbGl0ZXJhbCBzdHJpbmdzIHRvIG1hdGNoLlxuLy8gYHJ1bGUubGl0ZXJhbFNlcGFyYXRvcmAgaXMgdGhlIHN0cmluZyB0byBwdXQgYmV0d2VlbiBtdWx0aXBsZSBsaXRlcmFscyB3aGVuIGpvaW5pbmcuXG4vL1xuLy8gQWZ0ZXIgcGFyc2luZ1xuLy8gIGBydWxlLm1hdGNoZWRgIHdpbGwgYmUgdGhlIHN0cmluZyB3aGljaCB3YXMgbWF0Y2hlZFxuLy8gIGBydWxlLm5leHRTdGFydGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IHN0YXJ0IHRva2VuXG5SdWxlLkxpdGVyYWxzID0gY2xhc3MgbGl0ZXJhbHMgZXh0ZW5kcyBSdWxlIHtcblx0Y29uc3RydWN0b3IoLi4ucHJvcHMpIHtcblx0XHRzdXBlciguLi5wcm9wcyk7XG5cdFx0Ly8gY29lcmNlIHRvIGFuIGFycmF5IChhIGJpdCBzbG93ZXIgYnV0IGNsZWFuZXIpLlxuXHRcdGlmICghQXJyYXkuaXNBcnJheSh0aGlzLmxpdGVyYWxzKSkgdGhpcy5saXRlcmFscyA9IFt0aGlzLmxpdGVyYWxzXTtcblx0fVxuXG5cdC8vIEF0dGVtcHQgdG8gbWF0Y2ggdGhpcyBydWxlIGluIHRoZSBgdG9rZW5zYC5cblx0Ly8gUmV0dXJucyByZXN1bHRzIG9mIHRoZSBwYXJzZSBvciBgdW5kZWZpbmVkYC5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGlmICghdGhpcy5tYXRjaGVzU3RhcnRpbmdBdCh0b2tlbnMsIHN0YXJ0LCBlbmQpKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQ6IHRoaXMubGl0ZXJhbHMuam9pbih0aGlzLmxpdGVyYWxTZXBhcmF0b3IpLFxuXHRcdFx0bmV4dFN0YXJ0OiBzdGFydCArIHRoaXMubGl0ZXJhbHMubGVuZ3RoXG5cdFx0fSk7XG5cdH1cblxuXHQvLyBEb2VzIHRoaXMgbWF0Y2ggYXBwZWFyIEFOWVdIRVJFIGluIHRoZSB0b2tlbnM/XG5cdHRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kID0gdG9rZW5zLmxlbmd0aCkge1xuXHQgIGxldCBmaXJzdCA9IHRoaXMubGl0ZXJhbHNbMF07XG5cdCAgZm9yICh2YXIgaW5kZXggPSBzdGFydDsgaW5kZXggPCBlbmQ7IGluZGV4KyspIHtcblx0ICAgIGlmICh0b2tlbnNbaW5kZXhdICE9PSBmaXJzdCkgY29udGludWU7XG5cdCAgICBpZiAodGhpcy5tYXRjaGVzU3RhcnRpbmdBdCh0b2tlbnMsIGluZGV4LCBlbmQpKSByZXR1cm4gdHJ1ZTtcblx0ICB9XG5cdCAgcmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gTWF0Y2ggb3VyIGBsaXRlcmFsc2AgYmV0d2VlbiBgc3RhcnRgIGFuZCBgZW5kYCBvZiB0b2tlbnMuXG5cdG1hdGNoZXNTdGFydGluZ0F0KHRva2Vucywgc3RhcnQgPSAwLCBlbmQgPSB0b2tlbnMubGVuZ3RoKSB7XG5cdCAgaWYgKHRoaXMubGl0ZXJhbHMubGVuZ3RoID09PSAxKSByZXR1cm4gdG9rZW5zW3N0YXJ0XSA9PT0gdGhpcy5saXRlcmFsc1swXTtcbiAgICByZXR1cm4gdGhpcy5saXRlcmFscy5ldmVyeSgobGl0ZXJhbCwgaSkgPT4gKHN0YXJ0ICsgaSA8IGVuZCkgJiYgKGxpdGVyYWwgPT09IHRva2Vuc1tzdGFydCArIGldKSk7XG5cdH1cblxuICB0b1NvdXJjZSgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaGVkO1xuICB9XG5cblx0dG9TeW50YXgoKSB7XG5cdFx0cmV0dXJuIGAke3RoaXMubGl0ZXJhbHMuam9pbih0aGlzLmxpdGVyYWxTZXBhcmF0b3IgfHwgXCJcIil9JHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcblx0fVxufVxuXG4vLyBPbmUgb3IgbW9yZSBsaXRlcmFsIHN5bWJvbHM6IGA8YCwgYCVgIGV0Yy5cbi8vIFN5bWJvbHMgam9pbiBXSVRIT1VUIHNwYWNlcy5cblJ1bGUuU3ltYm9scyA9IGNsYXNzIHN5bWJvbHMgZXh0ZW5kcyBSdWxlLkxpdGVyYWxzIHt9XG5cblxuLy8gT25lIG9yIG1vcmUgbGl0ZXJhbCBrZXl3b3Jkcy5cbi8vIEtleXdvcmRzIGpvaW4gV0lUSCBzcGFjZXMuXG5SdWxlLktleXdvcmRzID0gY2xhc3Mga2V5d29yZHMgZXh0ZW5kcyBSdWxlLkxpdGVyYWxzIHt9XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoUnVsZS5LZXl3b3Jkcy5wcm90b3R5cGUsIFwibGl0ZXJhbFNlcGFyYXRvclwiLCB7IHZhbHVlOiBcIiBcIiB9KTtcblxuXG5cbi8vIFJlZ2V4IHBhdHRlcm4gdG8gbWF0Y2ggYSBTSU5HTEUgdG9rZW4uXG4vLyBgcnVsZS5wYXR0ZXJuYCBpcyB0aGUgcmVndWxhciBleHByZXNzaW9uIHRvIG1hdGNoLlxuLy8gICAgTm90ZSB0aGF0IHlvdSBNVVNUIHN0YXJ0IHlvdXIgcGF0dGVybiB3aXRoIGBeYCBhbmQgZW5kIHdpdGggYCRgIHRvIG1ha2Ugc3VyZSBpdCBtYXRjaGVzIHRoZSBlbnRpcmUgdG9rZW4uXG4vLyAgICBOb3RlIHRoYXQgdGhpcyBjYW4gb25seSBtYXRjaCBhIHNpbmdsZSB0b2tlbiFcbi8vIGBydWxlLmJsYWNrbGlzdGAgaXMgYSBtYXAgb2YgYHsga2V5OiB0cnVlIH1gIGZvciBzdHJpbmdzIHdoaWNoIHdpbGwgTk9UIGJlIGFjY2VwdGVkLlxuLy9cbi8vIEFmdGVyIHBhcnNpbmdcbi8vICBgcnVsZS5tYXRjaGVkYCB3aWxsIGJlIHRoZSBzdHJpbmcgd2hpY2ggd2FzIG1hdGNoZWQuXG4vLyAgYHJ1bGUubmV4dFN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RhcnQgdG9rZW4uXG5SdWxlLlBhdHRlcm4gPSBjbGFzcyBwYXR0ZXJuIGV4dGVuZHMgUnVsZSB7XG5cdC8vIEF0dGVtcHQgdG8gbWF0Y2ggdGhpcyBwYXR0ZXJuIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHRva2Vucy5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG5cdFx0aWYgKHR5cGVvZiB0b2tlbiAhPT0gXCJzdHJpbmdcIikgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBtYXRjaCA9IHRva2VuLm1hdGNoKHRoaXMucGF0dGVybik7XG5cdFx0aWYgKCFtYXRjaCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIGJhaWwgaWYgcHJlc2VudCBpbiBibGFja2xpc3Rcblx0XHRsZXQgbWF0Y2hlZCA9IG1hdGNoWzBdO1xuXHRcdGlmICh0aGlzLmJsYWNrbGlzdCAmJiB0aGlzLmJsYWNrbGlzdFttYXRjaGVkXSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQsXG5cdFx0XHRuZXh0U3RhcnQ6IHN0YXJ0ICsgMVxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gVGVzdCB0byBzZWUgaWYgYW55IG9mIG91ciBwYXR0ZXJuIGlzIGZvdW5kIEFOWVdIRVJFIGluIHRoZSB0b2tlbnMuXG5cdHRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0cmV0dXJuIHRva2Vucy5zbGljZShzdGFydCwgZW5kKS5zb21lKHRva2VuID0+IHR5cGVvZiB0b2tlbiA9PT0gXCJzdHJpbmdcIiAmJiBwYXR0ZXJuLnRlc3QodG9rZW4pKTtcblx0fVxuXG5cdHRvU3ludGF4KCkge1xuXHRcdHJldHVybiB0aGlzLnBhdHRlcm4uc291cmNlO1xuXHR9XG59XG5cblxuLy8gU3VicnVsZSAtLSBuYW1lIG9mIGFub3RoZXIgcnVsZSB0byBiZSBjYWxsZWQuXG4vLyBgcnVsZS5zdWJydWxlYCBpcyB0aGUgbmFtZSBvZiB0aGUgcnVsZSBpbiBgcGFyc2VyLnJ1bGVzYC5cbi8vXG4vLyBBZnRlciBwYXJzaW5nXG4vLyAgd2UnbGwgcmV0dXJuIHRoZSBhY3R1YWwgcnVsZSB0aGF0IHdhcyBtYXRjaGVkIChyYXRoZXIgdGhhbiBhIGNsb25lIG9mIHRoaXMgcnVsZSlcblJ1bGUuU3VicnVsZSA9IGNsYXNzIHN1YnJ1bGUgZXh0ZW5kcyBSdWxlIHtcblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGxldCBtYXRjaGVkUnVsZSA9IHBhcnNlci5wYXJzZU5hbWVkUnVsZSh0aGlzLnN1YnJ1bGUsIHRva2Vucywgc3RhcnQsIGVuZCwgc3RhY2ssIGBwYXJzZSBzdWJydWxlICcke3RoaXMucnVsZX0nYCk7XG5cdFx0aWYgKCFtYXRjaGVkUnVsZSkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRpZiAodGhpcy5hcmd1bWVudCkgbWF0Y2hlZFJ1bGUuYXJndW1lbnQgPSB0aGlzLmFyZ3VtZW50O1xuXHRcdHJldHVybiBtYXRjaGVkUnVsZTtcblx0fVxuXG5cdC8vIEFzayB0aGUgc3VicnVsZSB0byBmaWd1cmUgb3V0IGlmIGEgbWF0Y2ggaXMgcG9zc2libGUuXG5cdHRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0cmV0dXJuIHBhcnNlci50ZXN0KHRoaXMuc3VicnVsZSwgdG9rZW5zLCBzdGFydCwgZW5kKTtcblx0fVxuXG5cdHRvU3ludGF4KCkge1xuXHRcdHJldHVybiBgeyR7dGhpcy5hcmd1bWVudCA/IHRoaXMuYXJndW1lbnQrXCI6XCIgOiBcIlwifSR7dGhpcy5zdWJydWxlfX0ke3RoaXMub3B0aW9uYWwgPyAnPycgOiAnJ31gO1xuXHR9XG59XG5cblxuLy8gU2VxdWVuY2Ugb2YgcnVsZXMgdG8gbWF0Y2guXG4vLyAgYHJ1bGUucnVsZXNgIGlzIHRoZSBhcnJheSBvZiBydWxlcyB0byBtYXRjaC5cbi8vICBgcnVsZS5sZWZ0UmVjdXJzaXZlYCBzaG91bGQgYmUgYHRydWVgIGlmIHRoZSBmaXJzdCBub24tb3B0aW9uYWwgcnVsZSBpbiBvdXIgYHJ1bGVzYFxuLy8gICAgbWF5IGVuZCB1cCBjYWxsaW5nIHVzIGFnYWluLiAgSW4gdGhpcyBjYXNlLCB5b3Ugc2hvdWxkIHByb3ZpZGUgYHJ1bGUudGVzdFJ1bGVgLlxuLy9cbi8vIEFmdGVyIHBhcnNpbmdcbi8vICBgcnVsZS5tYXRjaGVkYCB3aWxsIGJlIHRoZSBhcnJheSBvZiBydWxlcyB3aGljaCB3ZXJlIG1hdGNoZWQuXG4vLyAgYHJ1bGUubmV4dFN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RhcnQgdG9rZW4uXG5SdWxlLlNlcXVlbmNlID0gY2xhc3Mgc2VxdWVuY2UgZXh0ZW5kcyBSdWxlIHtcblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdC8vIElmIHdlIGhhdmUgYSBgdGVzdFJ1bGVgIGRlZmluZWRcblx0XHRpZiAodGhpcy50ZXN0UnVsZSkge1xuXHRcdFx0Ly8gRm9yZ2V0IGl0IGlmIHRoZXJlIGlzIE5PIFdBWSB0aGUgcnVsZSBjb3VsZCBiZSBtYXRjaGVkLlxuXHRcdFx0aWYgKHBhcnNlci50ZXN0KHRoaXMudGVzdFJ1bGUsIHRva2Vucywgc3RhcnQpID09PSBmYWxzZSkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHQvLyBJZiB3ZSdyZSBhIGxlZnRSZWN1cnNpdmUgc2VxdWVuY2UuLi5cblx0XHRpZiAodGhpcy5sZWZ0UmVjdXJzaXZlKSB7XG5cdFx0XHQvLyBJZiB0aGUgc3RhY2sgYWxyZWFkeSBjb250YWlucyB0aGlzIHJ1bGUsIGZvcmdldCBpdC5cblx0XHRcdGlmIChzdGFjayAmJiBzdGFjay5pbmNsdWRlcyh0aGlzKSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdFx0Ly8gQ2xvbmUgc3RhY2sgYW5kIGFkZCB0aGlzIHJ1bGUgZm9yIHJlY3Vyc2lvbi4uLlxuXHRcdFx0c3RhY2sgPSBzdGFjayA/IHN0YWNrLmNvbmNhdCgpIDogW107XG5cdFx0XHRzdGFjay5wdXNoKHRoaXMpO1xuXG5cdFx0XHQvLyBUT0RPOiBXZSBjb3VsZCBkaXN0aW5ndWlzaCBiZXR3ZWVuIHByb2R1Y3RpdmUgYW5kIHVucHJvZHVjdGl2ZSBydWxlc1xuXHRcdFx0Ly9cdFx0IGJ5IGNoZWNraW5nIG9ubHkgcnVsZXMgd2hpY2ggb2NjdXIgYXQgdGhlIHNhbWUgYHN0YXJ0YC4uLlxuXHRcdFx0Ly9cdFx0IFRoaXMgd291bGQgcHJvYmFibHkgYWxsb3cgbW9yZSBpbnRlcmVzdGluZyB0aGluZ3MsIGJ1dCBpdCdzIG11Y2ggbXVjaCBzbG93ZXIuXG5cdFx0fVxuXG5cdFx0bGV0IG1hdGNoZWQgPSBbXTtcblx0XHRsZXQgbmV4dFN0YXJ0ID0gc3RhcnQ7XG5cdFx0bGV0IGluZGV4ID0gMCwgcnVsZSA9IHVuZGVmaW5lZDtcblx0XHR3aGlsZSAocnVsZSA9IHRoaXMucnVsZXNbaW5kZXgrK10pIHtcblx0XHRcdGxldCBtYXRjaCA9IHJ1bGUucGFyc2UocGFyc2VyLCB0b2tlbnMsIG5leHRTdGFydCwgZW5kLCBzdGFjayk7XG5cdFx0XHRpZiAoIW1hdGNoICYmICFydWxlLm9wdGlvbmFsKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0aWYgKG1hdGNoKSB7XG5cdFx0XHRcdG1hdGNoZWQucHVzaChtYXRjaCk7XG5cdFx0XHRcdG5leHRTdGFydCA9IG1hdGNoLm5leHRTdGFydDtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gaWYgd2UgZ2V0IGhlcmUsIHdlIG1hdGNoZWQgYWxsIHRoZSBydWxlcyFcblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkLFxuXHRcdFx0bmV4dFN0YXJ0XG5cdFx0fSk7XG5cdH1cblxuXG4vL1RPRE9DXG5cdC8vIFwiZ2F0aGVyXCIgYXJndW1lbnRzIGluIHByZXBhcmF0aW9uIHRvIGNhbGwgYHRvU291cmNlKClgXG5cdC8vIE9ubHkgY2FsbGFibGUgYWZ0ZXIgcGFyc2UgaXMgY29tcGxldGVkLlxuXHQvLyBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHByb3BlcnRpZXMgZnJvbSB0aGUgYG1hdGNoZWRgIGFycmF5IGluZGV4ZWQgYnkgb25lIG9mIHRoZSBmb2xsb3dpbmc6XG5cdC8vXHRcdC0gYG1hdGNoLmFyZ3VtZW50YDpcdFx0YXJndW1lbnQgc2V0IHdoZW4gcnVsZSB3YXMgZGVjbGFyZWQsIGVnOiBge3ZhbHVlOmxpdGVyYWx9YCA9PiBgdmFsdWVgXG5cdC8vXHRcdC0gYG1hdGNoLmdyb3VwYDpcdFx0ICBuYW1lIG9mIGdyb3VwIHJ1bGUgd2FzIGFkZGVkIHRvXG5cdC8vXHRcdC0gYG1hdGNoLmNvbnN0cnVjdG9yLm5hbWVgOlx0XHRcdG5hbWUgb2YgdGhlIHJ1bGUgdHlwZVxuXHRnZXQgcmVzdWx0cygpIHtcblx0XHRpZiAoIXRoaXMubWF0Y2hlZCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRsZXQgcmVzdWx0cyA9IGFkZFJlc3VsdHMoe30sIHRoaXMubWF0Y2hlZCk7XG5cdFx0aWYgKHRoaXMuY29tbWVudCkgcmVzdWx0cy5jb21tZW50ID0gdGhpcy5jb21tZW50O1xuXHRcdHJldHVybiByZXN1bHRzO1xuXG4gICAgZnVuY3Rpb24gYWRkUmVzdWx0cyhyZXN1bHRzLCBtYXRjaGVkKSB7XG4gICAgICBsZXQgaW5kZXggPSAwLCBtYXRjaCA9IHVuZGVmaW5lZDtcbiAgICAgIHdoaWxlIChtYXRjaCA9IG1hdGNoZWRbaW5kZXgrK10pIHtcbiAgICAgICAgaWYgKG1hdGNoLnByb21vdGUpIHtcbiAgICAgICAgICBhZGRSZXN1bHRzKHJlc3VsdHMsIG1hdGNoLm1hdGNoZWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHNvdXJjZU5hbWUgPSBtYXRjaC5hcmd1bWVudCB8fCBtYXRjaC5ncm91cCB8fCBtYXRjaC5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgICAgICAgIGNvbnN0IG1hdGNoTmFtZSA9IFwiX1wiICsgc291cmNlTmFtZTtcbiAgICAgICAgICBjb25zdCBzb3VyY2UgPSBtYXRjaC50b1NvdXJjZSgpO1xuICAgICAgICAgIC8vIElmIGFyZyBhbHJlYWR5IGV4aXN0cywgY29udmVydCB0byBhbiBhcnJheVxuICAgICAgICAgIGlmIChtYXRjaE5hbWUgaW4gcmVzdWx0cykge1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHJlc3VsdHNbbWF0Y2hOYW1lXSkpIHtcbiAgICAgICAgICAgICAgcmVzdWx0c1ttYXRjaE5hbWVdID0gW3Jlc3VsdHNbbWF0Y2hOYW1lXV07XG4gICAgICAgICAgICAgIHJlc3VsdHNbc291cmNlTmFtZV0gPSBbcmVzdWx0c1tzb3VyY2VOYW1lXV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRzW21hdGNoTmFtZV0ucHVzaChtYXRjaCk7XG4gICAgICAgICAgICByZXN1bHRzW3NvdXJjZU5hbWVdLnB1c2goc291cmNlKVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdHNbbWF0Y2hOYW1lXSA9IG1hdGNoO1xuICAgICAgICAgICAgcmVzdWx0c1tzb3VyY2VOYW1lXSA9IHNvdXJjZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblx0fVxuXG5cdC8vIEVjaG8gdGhpcyBydWxlIGJhY2sgb3V0LlxuXHR0b1N5bnRheCgpIHtcblx0ICBjb25zdCBydWxlcyA9IHRoaXMucnVsZXMubWFwKHJ1bGUgPT4gcnVsZS50b1N5bnRheCgpKTtcblx0XHRyZXR1cm4gYCR7dGhpcy5ydWxlcy5qb2luKFwiIFwiKX0ke3RoaXMub3B0aW9uYWwgPyAnPycgOiAnJ31gO1xuXHR9XG5cbn1cblxuXG4vLyBBbHRlcm5hdGl2ZSBzeW50YXgsIG1hdGNoaW5nIG9uZSBvZiBhIG51bWJlciBvZiBkaWZmZXJlbnQgcnVsZXMuXG4vLyBUaGUgcmVzdWx0IG9mIGEgcGFyc2UgaXMgdGhlIGxvbmdlc3QgcnVsZSB0aGF0IGFjdHVhbGx5IG1hdGNoZWQuXG4vLyBOT1RFOiBDdXJyZW50bHkgdGFrZXMgdGhlIGxvbmdlc3QgdmFsaWQgbWF0Y2guXG4vLyBUT0RPOiBtYXRjaCBhbGwgdmFsaWQgYWx0ZXJuYXRpdmVzXG4vL1xuLy8gQWZ0ZXIgcGFyc2luZ1xuLy8gIHdlJ2xsIHJldHVybiB0aGUgcnVsZSB3aGljaCBpcyB0aGUgXCJiZXN0IG1hdGNoXCIgKHJhdGhlciB0aGFuIGNsb25pbmcgdGhpcyBydWxlKS5cblJ1bGUuQWx0ZXJuYXRpdmVzID0gY2xhc3MgYWx0ZXJuYXRpdmVzIGV4dGVuZHMgUnVsZSB7XG5cdGNvbnN0cnVjdG9yKC4uLnByb3BzKSB7XG5cdFx0c3VwZXIoLi4ucHJvcHMpO1xuXHRcdGlmICghdGhpcy5ydWxlcykgdGhpcy5ydWxlcyA9IFtdO1xuXHR9XG5cblx0Ly8gVGVzdCB0byBzZWUgaWYgYW55IG9mIG91ciBhbHRlcm5hdGl2ZXMgYXJlIGZvdW5kIEFOWVdIRVJFIGluIHRoZSB0b2tlbnMuXG5cdC8vIE5PVEU6IHRoaXMgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGlmIHdlJ3JlIHNwZWNpZmllZCBhcyBhIGB0ZXN0UnVsZWBcblx0Ly9cdFx0IGFuZCB0aGVuIG9ubHkgaWYgYWxsIG9mIG91ciBydWxlcyBhcmUgZGV0ZXJtaW5pc3RpYy5cblx0dGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRsZXQgaW5kZXggPSAwLCBydWxlID0gdW5kZWZpbmVkO1xuXHRcdHdoaWxlIChydWxlID0gdGhpcy5ydWxlc1tpbmRleCsrXSkge1xuXHRcdFx0aWYgKHJ1bGUudGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQsIGVuZCkpIHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBGaW5kIGFsbCBydWxlcyB3aGljaCBtYXRjaCBhbmQgZGVsZWdhdGUgdG8gYGdldEJlc3RNYXRjaCgpYCB0byBwaWNrIHRoZSBiZXN0IG9uZS5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGxldCBtYXRjaGVzID0gW107XG5cdFx0bGV0IGluZGV4ID0gMCwgcnVsZSA9IHVuZGVmaW5lZDtcblx0XHR3aGlsZSAocnVsZSA9IHRoaXMucnVsZXNbaW5kZXgrK10pIHtcblx0XHRcdGxldCBtYXRjaCA9IHJ1bGUucGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0XHRcdGlmIChtYXRjaCkgbWF0Y2hlcy5wdXNoKG1hdGNoKTtcblx0XHR9XG5cblx0XHRpZiAoIW1hdGNoZXMubGVuZ3RoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gdW5jb21tZW50IHRoZSBiZWxvdyB0byBwcmludCBhbHRlcm5hdGl2ZXNcblx0XHQvLyBpZiAobWF0Y2hlcy5sZW5ndGggPiAxKSB7XG5cdFx0Ly9cdGNvbnNvbGUuaW5mbyh0aGlzLmFyZ3VtZW50IHx8IHRoaXMuZ3JvdXAsIG1hdGNoZXMsIG1hdGNoZXMubWFwKG1hdGNoID0+IG1hdGNoLm1hdGNoZWRUZXh0KSk7XG5cdFx0Ly8gfVxuXG5cdFx0bGV0IGJlc3RNYXRjaCA9IChtYXRjaGVzLmxlbmd0aCA9PT0gMSA/IG1hdGNoZXNbMF0gOiB0aGlzLmdldEJlc3RNYXRjaChtYXRjaGVzKSk7XG5cblx0XHQvLyBhc3NpZ24gYGFyZ05hbWVgIG9yIGBncm91cGAgZm9yIGByZXN1bHRzYFxuXHRcdGlmICh0aGlzLmFyZ3VtZW50KSBiZXN0TWF0Y2guYXJndW1lbnQgPSB0aGlzLmFyZ3VtZW50O1xuXHRcdGVsc2UgaWYgKHRoaXMuZ3JvdXApIGJlc3RNYXRjaC5ncm91cCA9IHRoaXMuZ3JvdXA7XG4vL1RPRE86IG90aGVyIHRoaW5ncyB0byBjb3B5IGhlcmU/Pz9cblxuXHRcdHJldHVybiBiZXN0TWF0Y2g7XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIFwiYmVzdFwiIG1hdGNoIGdpdmVuIG1vcmUgdGhhbiBvbmUgbWF0Y2hlcyBhdCB0aGUgaGVhZCBvZiB0aGUgdG9rZW5zLlxuXHQvLyBEZWZhdWx0IGlzIHRvIHJldHVybiB0aGUgbG9uZ2VzdCBtYXRjaC5cblx0Ly8gSW1wbGVtZW50IHNvbWV0aGluZyBlbHNlIHRvIGRvLCBlZywgcHJlY2VkZW5jZSBydWxlcy5cblx0Z2V0QmVzdE1hdGNoKG1hdGNoZXMpIHtcblx0XHRyZXR1cm4gbWF0Y2hlcy5yZWR1Y2UoZnVuY3Rpb24gKGJlc3QsIGN1cnJlbnQpIHtcblx0XHRcdGlmIChjdXJyZW50Lm5leHRTdGFydCA+IGJlc3QubmV4dFN0YXJ0KSByZXR1cm4gY3VycmVudDtcblx0XHRcdHJldHVybiBiZXN0O1xuXHRcdH0sIG1hdGNoZXNbMF0pO1xuXHR9XG5cblx0YWRkUnVsZSguLi5ydWxlKSB7XG5cdFx0dGhpcy5ydWxlcy5wdXNoKC4uLnJ1bGUpO1xuXHR9XG5cblx0dG9TeW50YXgoKSB7XG5cdCAgY29uc3QgcnVsZXMgPSB0aGlzLnJ1bGVzLm1hcChydWxlID0+IHJ1bGUudG9TeW50YXgoKSkuam9pbihcInxcIik7XG5cdFx0cmV0dXJuIGAoJHt0aGlzLmFyZ3VtZW50ID8gdGhpcy5hcmd1bWVudCtcIjpcIiA6IFwiXCJ9JHtydWxlc30pJHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcblx0fVxufTtcblxuXG4vLyBSZXBlYXRpbmcgcnVsZS5cbi8vXHRgdGhpcy5yZXBlYXRgIGlzIHRoZSBydWxlIHRoYXQgcmVwZWF0cy5cbi8vICBgdGhpcy5vcHRpb25hbGAgaXMgdHJ1ZSBpZiB0aGUgcHJvZHV0aW9uIGlzIG9wdGlvbmFsLlxuLy9cdE5vdGU6IEF1dG9tYXRpY2FsbHkgY29uc3VtZXMgd2hpdGVzcGFjZSBiZWZvcmUgcnVsZXMuXG4vL1x0Tm90ZTogUmV0dXJucyBgdW5kZWZpbmVkYCBpZiB3ZSBkb24ndCBtYXRjaCBhdCBsZWFzdCBvbmNlLlxuLy9cbi8vIEFmdGVyIG1hdGNoaW5nOlxuLy9cdGB0aGlzLm1hdGNoZWRgIGlzIGFycmF5IG9mIG1hdGNoZWQgcnVsZXMuXG4vLyAgYHJ1bGUubmV4dFN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RhcnQgdG9rZW4uXG5SdWxlLlJlcGVhdCA9IGNsYXNzIHJlcGVhdCBleHRlbmRzIFJ1bGUge1xuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0bGV0IG1hdGNoZWQgPSBbXTtcblx0XHRsZXQgbmV4dFN0YXJ0ID0gc3RhcnQ7XG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdGxldCBtYXRjaCA9IHRoaXMucmVwZWF0LnBhcnNlKHBhcnNlciwgdG9rZW5zLCBuZXh0U3RhcnQsIGVuZCwgc3RhY2spO1xuXHRcdFx0aWYgKCFtYXRjaCkgYnJlYWs7XG5cblx0XHRcdG1hdGNoZWQucHVzaChtYXRjaCk7XG5cdFx0XHRuZXh0U3RhcnQgPSBtYXRjaC5uZXh0U3RhcnQ7XG5cdFx0fVxuXG5cdFx0aWYgKG1hdGNoZWQubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZCxcblx0XHRcdG5leHRTdGFydFxuXHRcdH0pO1xuXHR9XG5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0aWYgKCF0aGlzLm1hdGNoZWQpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hlZC5tYXAobWF0Y2ggPT4gbWF0Y2gudG9Tb3VyY2UoKSk7XG5cdH1cblxuXHR0b1N5bnRheCgpIHtcblx0XHRsZXQgaXNDb21wb3VuZFJ1bGUgPSAodGhpcy5yZXBlYXQgaW5zdGFuY2VvZiBSdWxlLlNlcXVlbmNlKVxuICAgICAgfHwgKHRoaXMucmVwZWF0IGluc3RhbmNlb2YgUnVsZS5MaXRlcmFscyAmJiB0aGlzLnJlcGVhdC5saXRlcmFscy5sZW5ndGggPiAxKTtcbiAgICBjb25zdCByZXBlYXQgPSB0aGlzLnJlcGVhdC50b1N5bnRheCgpO1xuXHRcdGNvbnN0IHJ1bGUgPSBpc0NvbXBvdW5kUnVsZSA/IGAoJHtyZXBlYXR9KWAgOiBgJHtyZXBlYXR9YDtcblx0XHRyZXR1cm4gYCR7cnVsZX0ke3RoaXMub3B0aW9uYWwgPyAnKicgOiAnKyd9YDtcblx0fVxufVxuXG5cbi8vIExpc3QgbWF0Y2ggcnVsZTogICBgWzxpdGVtPjxkZWxpbWl0ZXI+XWAuIGVnXCIgYFt7bnVtYmVyfSxdYCB0byBtYXRjaCBgMSwyLDNgXG4vL1x0YHJ1bGUuaXRlbWAgaXMgdGhlIHJ1bGUgZm9yIGVhY2ggaXRlbSxcbi8vXHRgcnVsZS5kZWxpbWl0ZXJgIGlzIHRoZSBkZWxpbWl0ZXIgYmV0d2VlbiBlYWNoIGl0ZW0sIHdoaWNoIGlzIG9wdGlvbmFsIGF0IHRoZSBlbmQuXG4vL1xuLy8gQWZ0ZXIgbWF0Y2hpbmc6XG4vL1x0YHRoaXMubWF0Y2hlZGAgaXMgYXJyYXkgb2YgbWF0Y2hlZCBydWxlcy5cbi8vICBgcnVsZS5uZXh0U3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGFydCB0b2tlbi5cbi8vXG4vLyBOT1RFOiB3ZSBhc3N1bWUgdGhhdCBhIExpc3QgcnVsZSBpdHNlbGYgd2lsbCBOT1QgcmVwZWF0ICg/Pz8/KVxuUnVsZS5MaXN0ID0gY2xhc3MgbGlzdCBleHRlbmRzIFJ1bGUge1xuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0Ly8gZW5zdXJlIGl0ZW0gYW5kIGRlbGltaXRlciBhcmUgb3B0aW9uYWwgc28gd2UgZG9uJ3QgYmFyZiBpbiBgcGFyc2VSdWxlYFxuLy9UT0RPOiA/Pz9cblx0XHR0aGlzLml0ZW0ub3B0aW9uYWwgPSB0cnVlO1xuXHRcdHRoaXMuZGVsaW1pdGVyLm9wdGlvbmFsID0gdHJ1ZTtcblxuXHRcdGxldCBtYXRjaGVkID0gW107XG5cdFx0bGV0IG5leHRTdGFydCA9IHN0YXJ0O1xuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHQvLyBnZXQgbmV4dCBpdGVtLCBleGl0aW5nIGlmIG5vdCBmb3VuZFxuXHRcdFx0bGV0IGl0ZW0gPSB0aGlzLml0ZW0ucGFyc2UocGFyc2VyLCB0b2tlbnMsIG5leHRTdGFydCwgZW5kLCBzdGFjayk7XG5cdFx0XHRpZiAoIWl0ZW0pIGJyZWFrO1xuXG5cdFx0XHRtYXRjaGVkLnB1c2goaXRlbSk7XG5cdFx0XHRuZXh0U3RhcnQgPSBpdGVtLm5leHRTdGFydDtcblxuXHRcdFx0Ly8gZ2V0IGRlbGltaXRlciwgZXhpdGluZyBpZiBub3QgZm91bmRcblx0XHRcdGxldCBkZWxpbWl0ZXIgPSB0aGlzLmRlbGltaXRlci5wYXJzZShwYXJzZXIsIHRva2VucywgbmV4dFN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0XHRcdGlmICghZGVsaW1pdGVyKSBicmVhaztcblx0XHRcdG5leHRTdGFydCA9IGRlbGltaXRlci5uZXh0U3RhcnQ7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgd2UgZGlkbid0IGdldCBhbnkgbWF0Y2hlcywgZm9yZ2V0IGl0LlxuXHRcdGlmIChtYXRjaGVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQsXG5cdFx0XHRuZXh0U3RhcnRcblx0XHR9KTtcblx0fVxuXG5cdC8vIFJldHVybnMgbGlzdCBvZiB2YWx1ZXMgYXMgc291cmNlLlxuXHR0b1NvdXJjZSgpIHtcblx0XHRpZiAoIXRoaXMubWF0Y2hlZCkgcmV0dXJuIFtdO1xuXHRcdHJldHVybiB0aGlzLm1hdGNoZWQubWFwKCBtYXRjaCA9PiBtYXRjaC50b1NvdXJjZSgpICk7XG5cdH1cblxuXHR0b1N5bnRheCgpIHtcblx0ICBjb25zdCBpdGVtID0gdGhpcy5pdGVtLnRvU3ludGF4KCk7XG5cdCAgY29uc3QgZGVsaW1pdGVyID0gdGhpcy5kZWxpbWl0ZXIudG9TeW50YXgoKTtcblx0XHRyZXR1cm4gYFske3RoaXMuYXJndW1lbnQgPyB0aGlzLmFyZ3VtZW50K1wiOlwiIDogXCJcIn0ke2l0ZW19ICR7ZGVsaW1pdGVyfV0ke3RoaXMub3B0aW9uYWwgPyAnPycgOiAnJ31gO1xuXHR9XG59O1xuXG5cblxuLy8gQSBibG9jayBpcyB1c2VkIHRvIHBhcnNlIGEgbmVzdGVkIGJsb2NrIG9mIHN0YXRlbWVudHMuXG4vLyBBYnN0cmFjdCBjbGFzcy5cblJ1bGUuQmxvY2sgPSBjbGFzcyBibG9jayBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuXG5cdC8vIFBhcnNlIHRoZSBlbnRpcmUgYGJsb2NrYCwgcmV0dXJuaW5nIHJlc3VsdHMuXG5cdHBhcnNlQmxvY2socGFyc2VyLCBibG9jaywgaW5kZW50ID0gMCkge1xuXHRcdGxldCBtYXRjaGVkID0gW107XG4vL2NvbnNvbGUud2FybihcImJsb2NrOlwiLCBibG9jayk7XG5cdFx0YmxvY2suY29udGVudHMuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcblx0XHRcdGxldCByZXN1bHQ7XG5cdFx0XHRpZiAoaXRlbS5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0bWF0Y2hlZC5wdXNoKG5ldyBSdWxlLkJsYW5rTGluZSgpKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGl0ZW0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuQmxvY2spIHtcblx0XHRcdFx0bGV0IGxhc3QgPSBtYXRjaGVkW21hdGNoZWQubGVuZ3RoIC0gMV07XG5cdFx0XHRcdGlmIChsYXN0LnBhcnNlQmxvY2spIHtcblx0XHRcdFx0XHRsYXN0LnBhcnNlQmxvY2socGFyc2VyLCBpdGVtLCBpbmRlbnQgKyAxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRsZXQgYmxvY2sgPSB0aGlzLnBhcnNlQmxvY2socGFyc2VyLCBpdGVtLCBpbmRlbnQgKyAxKTtcblx0XHRcdFx0XHRpZiAoYmxvY2sgIT09IHVuZGVmaW5lZCkgbWF0Y2hlZC5wdXNoKGJsb2NrKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdG1hdGNoZWQgPSBtYXRjaGVkLmNvbmNhdCh0aGlzLnBhcnNlU3RhdGVtZW50KHBhcnNlciwgaXRlbSkpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIG5ldyBSdWxlLkJsb2NrKHtcblx0XHRcdGluZGVudCxcblx0XHRcdG1hdGNoZWRcblx0XHR9KTtcblx0fVxuXG5cdC8vIFBhcnNlIGEgc2luZ2xlIHN0YXRlbWVudCAoYSBsaW5lJ3Mgd29ydGggb2YgYHRva2Vuc2ApLlxuXHQvLyBTa2lwcyB3aGl0ZXNwYWNlIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmUuXG5cdC8vIEF1dG8tbWF0Y2hlcyBjb21tZW50IGluIHRoZSBtaWRkbGUgb2YgdGhlIGxpbmUuXG5cdC8vIFJldHVybnMgYXJyYXkgb2YgcmVzdWx0cy5cblx0cGFyc2VTdGF0ZW1lbnQocGFyc2VyLCB0b2tlbnMpIHtcblx0XHRsZXQgcmVzdWx0cyA9IFtdO1xuXHRcdGxldCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGg7XG5cdFx0bGV0IHN0YXRlbWVudCwgY29tbWVudDtcblxuXHRcdC8vIGNoZWNrIGZvciBhbiBpbmRlbnQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBsaW5lXG5cdFx0aWYgKHRva2Vuc1tzdGFydF0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuV2hpdGVzcGFjZSkgc3RhcnQrKztcblxuXHRcdC8vIGNoZWNrIGZvciBhIGNvbW1lbnQgYXQgdGhlIGVuZCBvZiB0aGUgdG9rZW5zXG5cdFx0aWYgKHRva2Vuc1tlbmQtMV0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuQ29tbWVudCkge1xuXHRcdFx0Y29tbWVudCA9IHBhcnNlci5wYXJzZU5hbWVkUnVsZShcImNvbW1lbnRcIiwgdG9rZW5zLCBlbmQtMSwgZW5kLCB1bmRlZmluZWQsIFwicGFyc2VTdGF0ZW1lbnRcIik7XG5cdFx0XHQvLyBhZGQgY29tbWVudCBGSVJTVCBpZiBmb3VuZFxuXHRcdFx0cmVzdWx0cy5wdXNoKGNvbW1lbnQpO1xuXHRcdFx0ZW5kLS07XG5cdFx0fVxuXG5cdFx0Ly8gcGFyc2UgdGhlIHJlc3QgYXMgYSBcInN0YXRlbWVudFwiXG5cdFx0c3RhdGVtZW50ID0gcGFyc2VyLnBhcnNlTmFtZWRSdWxlKFwic3RhdGVtZW50XCIsIHRva2Vucywgc3RhcnQsIGVuZCwgdW5kZWZpbmVkLCBcInBhcnNlU3RhdGVtZW50XCIpO1xuXHRcdC8vIGNvbXBsYWluIGlmIG5vIHN0YXRlbWVudCBhbmQgbm8gY29tbWVudFxuXHRcdGlmICghc3RhdGVtZW50ICYmICFjb21tZW50KSB7XG5cdFx0XHRsZXQgZXJyb3IgPSBuZXcgUnVsZS5TdGF0ZW1lbnRQYXJzZUVycm9yKHtcblx0XHRcdFx0dW5wYXJzZWQ6IHRva2Vucy5zbGljZShzdGFydCwgZW5kKS5qb2luKFwiIFwiKVxuXHRcdFx0fSk7XG5cdFx0XHRyZXN1bHRzLnB1c2goZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8vIGNvbXBsYWluIGlmIHdlIGNhbid0IHBhcnNlIHRoZSBlbnRpcmUgbGluZSFcblx0XHRlbHNlIGlmIChzdGF0ZW1lbnQgJiYgc3RhdGVtZW50Lm5leHRTdGFydCAhPT0gZW5kKSB7XG5cdFx0XHRsZXQgZXJyb3IgPSBuZXcgUnVsZS5TdGF0ZW1lbnRQYXJzZUVycm9yKHtcblx0XHRcdFx0cGFyc2VkIDogdG9rZW5zLnNsaWNlKHN0YXJ0LCBzdGF0ZW1lbnQubmV4dFN0YXJ0KS5qb2luKFwiIFwiKSxcblx0XHRcdFx0dW5wYXJzZWQgOiB0b2tlbnMuc2xpY2Uoc3RhdGVtZW50Lm5leHRTdGFydCwgZW5kKS5qb2luKFwiIFwiKVxuXHRcdFx0fSk7XG5cdFx0XHRyZXN1bHRzLnB1c2goZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8vIE90aGVyd2lzZSBhZGQgdGhlIHN0YXRlbWVudFxuXHRcdGVsc2UgaWYgKHN0YXRlbWVudCkge1xuXHRcdFx0cmVzdWx0cy5wdXNoKHN0YXRlbWVudCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdHM7XG5cdH1cblxuXHQvLyBSZXR1cm4gc291cmNlIGZvciB0aGlzIGJsb2NrIGFzIGFuIGFycmF5IG9mIGluZGVudGVkIGxpbmVzIFdJVEhPVVQgYHtgIE9SIGB9YC5cblx0YmxvY2tUb1NvdXJjZShibG9jayA9IHRoaXMubWF0Y2hlZCkge1xuXHRcdGxldCByZXN1bHRzID0gW10sIHN0YXRlbWVudDtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYmxvY2subGVuZ3RoOyBpKyspIHtcblx0XHRcdGxldCBtYXRjaCA9IGJsb2NrW2ldO1xuICAgICAgLy9jb25zb2xlLmluZm8oaSwgbWF0Y2gpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHN0YXRlbWVudCA9IG1hdGNoLnRvU291cmNlKCkgfHwgXCJcIjtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgY29uc29sZS53YXJuKFwiRXJyb3IgY29udmVydGluZyBibG9jazogXCIsIGJsb2NrLCBcInN0YXRlbWVudDpcIiwgbWF0Y2gpO1xuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmluZm8oaSwgc3RhdGVtZW50KTtcblx0XHRcdGlmIChpc1doaXRlc3BhY2Uoc3RhdGVtZW50KSkge1xuXHRcdFx0XHRyZXN1bHRzLnB1c2goXCJcIik7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChBcnJheS5pc0FycmF5KHN0YXRlbWVudCkpIHtcblx0XHRcdFx0cmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHN0YXRlbWVudCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2Ygc3RhdGVtZW50ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHN0YXRlbWVudCA9IHN0YXRlbWVudC5zcGxpdChcIlxcblwiKTtcblx0XHRcdFx0cmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHN0YXRlbWVudCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKFwiYmxvY2tUb1NvdXJjZSgpOiBET04nVCBLTk9XIEhPVyBUTyBXT1JLIFdJVEhcXG5cXHRcIiwgc3RhdGVtZW50LCBcIlxcblxcdGZyb20gbWF0Y2hcIiwgbWF0Y2gpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAodGhpcy5pbmRlbnQgIT09IDApIHtcblx0XHRcdHJldHVybiBcIlxcdFwiICsgcmVzdWx0cy5qb2luKFwiXFxuXFx0XCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0cy5qb2luKFwiXFxuXCIpO1xuXHR9XG5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0cmV0dXJuIFwiIHtcXG5cIiArIHRoaXMuYmxvY2tUb1NvdXJjZSgpICsgXCJcXG5cIiArIFwifVwiO1xuXHR9XG5cblx0Ly8gQ29udmVydCB0byBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHN0cnVjdHVyZSBieSBjb252ZXJ0aW5nIGluZGl2aWR1YWwgc3RhdGVtZW50cyBhbmQgZ3JvdXBpbmdcblx0Ly8gTk9URTogeW91IHNob3VsZCBvdmVycmlkZSB0aGlzIGFuZCBpbmNsdWRlIFwidHlwZVwiXG5cdHRvU3RydWN0dXJlKCkge1xuXHRcdGxldCB7IF9uYW1lOiBuYW1lLCBfc3VwZXJUeXBlOiBzdXBlclR5cGUgfSA9IHRoaXMucmVzdWx0cztcblx0XHRsZXQgYmxvY2sgPSAodGhpcy5ibG9jayAmJiB0aGlzLmJsb2NrLm1hdGNoZWQpIHx8IFtdO1xuXG5cdFx0bGV0IG5hbWVkID0ge307XG5cdFx0bGV0IHByb3BlcnRpZXMgPSBbXTtcblx0XHRsZXQgbWV0aG9kcyA9IFtdO1xuXHRcdGxldCBvdGhlciA9IFtdO1xuXHRcdGJsb2NrLm1hcChzdGF0ZW1lbnQgPT4gc3RhdGVtZW50LnRvU3RydWN0dXJlKCkpXG5cdFx0XHQgLmZpbHRlcihCb29sZWFuKVxuXHRcdFx0IC5mb3JFYWNoKGFkZFN0cnVjdHVyZSk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dHlwZTogXCJ1bmtub3duXCIsXG5cdFx0XHRuYW1lLFxuXHRcdFx0c3VwZXJUeXBlLFxuXHRcdFx0bmFtZWQsXG5cdFx0XHRwcm9wZXJ0aWVzLFxuXHRcdFx0bWV0aG9kcyxcblx0XHRcdG90aGVyXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gYWRkU3RydWN0dXJlKHN0cnVjdHVyZSkge1xuXHRcdFx0Ly8gYWRkIGFycmF5cyBhcyBpbmRpdmlkdWFsIGl0ZW1zXG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShzdHJ1Y3R1cmUpKSByZXR1cm4gc3RydWN0dXJlLmZvckVhY2goYWRkU3RydWN0dXJlKTtcblxuXHRcdFx0Ly8gYWRkIHVuZGVyIGBuYW1lZGAgZm9yIHF1aWNrIGhpdCBvZiBhbGwgc2lnbmlmaWNhbnQgYml0cy4uLlxuXHRcdFx0aWYgKHN0cnVjdHVyZS5uYW1lKSBuYW1lZFtzdHJ1Y3R1cmUubmFtZV0gPSBzdHJ1Y3R1cmU7XG5cblx0XHRcdC8vIGFkZCB1bmRlciAnbWV0aG9kcycsICdwcm9wZXJ0aWVzJyBvciAnb3RoZXInXG5cdFx0XHRpZiAoc3RydWN0dXJlLnR5cGUgPT09IFwiZnVuY3Rpb25cIikgbWV0aG9kcy5wdXNoKHN0cnVjdHVyZSk7XG5cdFx0XHRlbHNlIGlmIChzdHJ1Y3R1cmUudHlwZSA9PT0gXCJwcm9wZXJ0eVwiKSBwcm9wZXJ0aWVzLnB1c2goc3RydWN0dXJlKTtcblx0XHRcdGVsc2Ugb3RoZXIucHVzaChzdHJ1Y3R1cmUpO1xuXHRcdH1cblx0fVxuXG5cdC8vIEZvcm1hdCBhcnJheSBvZiBgc3RhdGVtZW50c2AgYXMgYSBKUyBvdXRwdXQgYmxvY2s6XG5cdC8vXHQtIGlmIGBzdGF0ZW1lbnRzYCBpcyBlbXB0eSwgcmV0dXJucyBge31gXG5cdC8vXHQtIGlmIGBzdGF0ZW1lbnRzIGlzIGEgc2luZ2xlIGxpbmUsIHJldHVybnMgYHsgc3RhdGVtZW50IH1gXG5cdC8vXHQtIGVsc2UgcmV0dXJucyBtdWx0aXBsZSBsaW5lc1xuXHRzdGF0aWMgZW5jbG9zZVN0YXRlbWVudHMoLi4uYXJncykge1xuXHRcdHZhciBzdGF0ZW1lbnRzID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgYXJnID0gYXJnc1tpXTtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KGFyZykpIHtcblx0XHRcdFx0c3RhdGVtZW50cyA9IHN0YXRlbWVudHMuY29uY2F0KGFyZyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgYXJnID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHN0YXRlbWVudHMucHVzaChhcmcpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRzdGF0ZW1lbnRzID0gc3RhdGVtZW50cy5qb2luKFwiXFxuXCIpO1xuXG5cdFx0aWYgKCFzdGF0ZW1lbnRzKSByZXR1cm4gXCJ7fVwiO1xuXHRcdGlmICghc3RhdGVtZW50cy5pbmNsdWRlcyhcIlxcblwiKSAmJiBzdGF0ZW1lbnRzLmxlbmd0aCA8IDQwKSB7XG5cdFx0XHRyZXR1cm4gYHsgJHtzdGF0ZW1lbnRzLnRyaW0oKX0gfWA7XG5cdFx0fVxuXHRcdGlmIChzdGF0ZW1lbnRzWzBdICE9PSBcIlxcdFwiKSBzdGF0ZW1lbnRzID0gYFxcdCR7c3RhdGVtZW50c31gO1xuXHRcdHJldHVybiBge1xcbiR7c3RhdGVtZW50c31cXG59YDtcblx0fVxuXG59XG5cblxuLy8gYFN0YXRlbWVudHNgIGFyZSBhIHNwZWNpYWwgY2FzZSBmb3IgYSBibG9jayBvZiBgU3RhdGVtZW50YCBydWxlc1xuLy9cdHRoYXQgdW5kZXJzdGFuZCBuZXN0aW5nIGFuZCBjb21tZW50cy5cbi8vXG4vLyBUaGlzIGlzIGEgdG9wLWxldmVsIGNvbnN0cnVjdCwgZS5nLiB1c2VkIHRvIHBhcnNlIGFuIGVudGlyZSBmaWxlLlxuUnVsZS5TdGF0ZW1lbnRzID0gY2xhc3Mgc3RhdGVtZW50cyBleHRlbmRzIFJ1bGUuQmxvY2sge1xuXG5cdC8vIFNwbGl0IHN0YXRlbWVudHMgdXAgaW50byBibG9ja3MgYW5kIHBhcnNlICdlbS5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kID0gdG9rZW5zLmxlbmd0aCwgc3RhY2spIHtcblx0XHR2YXIgYmxvY2sgPSBUb2tlbml6ZXIuYnJlYWtJbnRvQmxvY2tzKHRva2Vucywgc3RhcnQsIGVuZCk7XG5cblx0XHRsZXQgbWF0Y2hlZCA9IHRoaXMucGFyc2VCbG9jayhwYXJzZXIsIGJsb2NrKTtcblx0XHRpZiAoIW1hdGNoZWQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkLFxuXHRcdFx0bmV4dFN0YXJ0OiBlbmRcblx0XHR9KTtcblx0fVxuXG5cdC8vIE91dHB1dCBzdGF0ZW1lbnRzIFdJVEhPVVQgY3VybHkgYnJhY2VzIGFyb3VuZCB0aGVtLlxuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkLmJsb2NrVG9Tb3VyY2UoKTtcblx0fVxufVxuXG5cbi8vIEEgYEJsb2NrU3RhdGVtZW50YCAoZS5nLiBhbiBgaWZgIG9yIGByZXBlYXRgKTpcbi8vXHQtIGlzIGFzc3VtZWQgdG8gaGF2ZSBhbiBpbml0aWFsIHBhcnRpYWwgYHN0YXRlbWVudGBcbi8vXHQtIE1BWSBoYXZlIGFuIGlubGluZSBgc3RhdGVtZW50YCAob24gdGhlIHNhbWUgbGluZSwgcG9zc2libHkgYWZ0ZXIgYSBgOmApXG4vL1x0LSBNQVkgaGF2ZSBjb250ZW50cyBhcyBhbiBlbWJlZGRlZCBgYmxvY2tgXG4vL1xuLy9cdEluIHlvdXIgYHJlc3VsdHNgLCBgYmxvY2tgIHdpbGwgYmUgdGhlIHJlc3VsdGluZyBibG9jayBvdXRwdXQsIGlmIHRoZXJlIGlzIG9uZS5cbi8vXHRJdCdzIHVwIHRvIHlvdXIgcnVsZSB0byBkbyBzb21ldGhpbmcgd2l0aCBpdC4uLlxuUnVsZS5CbG9ja1N0YXRlbWVudCA9IGNsYXNzIGJsb2NrX3N0YXRlbWVudCBleHRlbmRzIFJ1bGUuQmxvY2sge1xuXG5cdC8vIFBhcnNlIGEgYmxvY2sgYW5kIGFkZCBpdCB0byBgdGhpcy5ibG9ja2Bcblx0cGFyc2VCbG9jayhwYXJzZXIsIGJsb2NrLCBpbmRlbnQgPSAwKSB7XG5cdFx0dGhpcy5ibG9jayA9IHN1cGVyLnBhcnNlQmxvY2soLi4uYXJndW1lbnRzKTtcblx0fVxuXG4gIC8vIEFkZCBvdXIgYGJsb2NrYCB0byB0aGUgcmVzdWx0c1xuICBnZXQgcmVzdWx0cygpIHtcbiAgICBsZXQgcmVzdWx0cyA9IHN1cGVyLnJlc3VsdHM7XG4gICAgaWYgKHJlc3VsdHMgJiYgdGhpcy5ibG9jaykge1xuICAgICAgcmVzdWx0cy5fYmxvY2sgPSB0aGlzLmJsb2NrO1xuICAgICAgcmVzdWx0cy5ibG9jayA9IHRoaXMuYmxvY2sudG9Tb3VyY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cbn1cblxuXG4vLyBCbGFuayBsaW5lIHJlcHJlc2VudGF0aW9uIGluIHBhcnNlciBvdXRwdXQuXG5SdWxlLkJsYW5rTGluZSA9IGNsYXNzIGJsYW5rX2xpbmUgZXh0ZW5kcyBSdWxlIHtcblx0dG9Tb3VyY2UoKSB7XG5cdFx0cmV0dXJuIFwiXFxuXCI7XG5cdH1cbn1cblxuLy8gQ29tbWVudCBydWxlIC0tIG1hdGNoZXMgdG9rZW5zIG9mIHR5cGUgYFRva2VuaXplci5Db21tZW50YC5cblJ1bGUuQ29tbWVudCA9IGNsYXNzIGNvbW1lbnQgZXh0ZW5kcyBSdWxlIHtcblx0Ly8gQ29tbWVudHMgYXJlIHNwZWNpYWwgbm9kZXMgaW4gb3VyIHRva2VuIHN0cmVhbS5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG5cdFx0aWYgKCEodG9rZW4gaW5zdGFuY2VvZiBUb2tlbml6ZXIuQ29tbWVudCkpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZDogdG9rZW4sXG5cdFx0XHRuZXh0U3RhcnQ6IHN0YXJ0ICsgMVxuXHRcdH0pO1xuXHR9XG5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0cmV0dXJuIGAvLyR7dGhpcy5tYXRjaGVkLndoaXRlc3BhY2V9JHt0aGlzLm1hdGNoZWQuY29tbWVudH1gO1xuXHR9XG59XG5cbi8vIFBhcnNlciBlcnJvciByZXByZXNlbnRhdGlvbiBpbiBwYXJzZXIgb3V0cHV0LlxuUnVsZS5TdGF0ZW1lbnRQYXJzZUVycm9yID0gY2xhc3MgcGFyc2VfZXJyb3IgZXh0ZW5kcyBSdWxlIHtcblx0Y29uc3RydWN0b3IoLi4ucHJvcHMpIHtcblx0XHRzdXBlciguLi5wcm9wcyk7XG5cdFx0aWYgKFBhcnNlci5XQVJOKSBjb25zb2xlLndhcm4odGhpcy5tZXNzYWdlKTtcblx0fVxuXG5cdGdldCBtZXNzYWdlKCkge1xuXHRcdGlmICh0aGlzLnBhcnNlZCkge1xuXHRcdFx0cmV0dXJuIFwiQ0FOVCBQQVJTRSBFTlRJUkUgU1RBVEVNRU5UXFxuXCJcblx0XHRcdFx0ICsgXCJQQVJTRUQgICAgICA6IGBcIisgdGhpcy5wYXJzZWQgKyBcImBcXG5cIlxuXHRcdFx0XHQgKyBcIkNBTidUIFBBUlNFIDogYFwiKyB0aGlzLnVucGFyc2VkICsgXCJgXCI7XG5cdFx0fVxuXHRcdHJldHVybiBcIkNBTidUIFBBUlNFIFNUQVRFTUVOVDogYFwiICsgdGhpcy51bnBhcnNlZCArIFwiYFwiO1xuXHR9XG5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0cmV0dXJuIFwiLy8gXCIgKyB0aGlzLm1lc3NhZ2Uuc3BsaXQoXCJcXG5cIikuam9pbihcIlxcbi8vIFwiKTtcblx0fVxufVxuXG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9SdWxlLmpzIiwiaW1wb3J0IHsgZGVmaW5lTWVtb2l6ZWQgfSBmcm9tIFwiLi9tZW1vaXplLmpzXCI7XG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuL1BhcnNlci5qc1wiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4vUnVsZS5qc1wiO1xuaW1wb3J0IHsgY2xvbmVDbGFzcyB9IGZyb20gXCIuL3V0aWxzL2NsYXNzLmpzXCI7XG5pbXBvcnQgZ2xvYmFsIGZyb20gXCIuL3V0aWxzL2dsb2JhbC5qc1wiO1xuXG5cblxuLy9cbi8vXHQjIFBhcnNpbmcgYHJ1bGVTeW50YXhgIHRvIGNyZWF0ZSBydWxlcyBhdXRvbWF0aWNhbGx5LlxuLy9cbi8vIFRPRE86XHRCZXR0ZXIgbmFtZSBmb3IgYHJ1bGVTeW50YXhgXG4vLyBUT0RPOlx0VXNlIGtleXdvcmRzIGluIHN5bnRheCB0byBtYWtlIGEgcXVpY2sgcmVnZXgtYmFzZWQgYHRlc3RgIGZ1bmN0aW9uIGZvciB0aGUgZW50aXJlIHJ1bGVcblxuLy9cbi8vICMjIGdyb3VwOiBwYXJzaW5nIHN5bnRheFxuLy9cblxuLy9UT0RPQ1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VSdWxlKHN5bnRheCwgY29uc3RydWN0b3IpIHtcbiAgLy8gSWYgd2UgZ290IGFuIGFycmF5IG9mIHBvc3NpYmxlIHN5bnRheGVzLi4uXG4gIGlmIChBcnJheS5pc0FycmF5KHN5bnRheCkpIHtcbiAgICAvLyByZWN1cnNpdmVseSBwYXJzZSBlYWNoIHN5bnRheCwgdXNpbmcgYSBDTE9ORSBvZiB0aGUgY29uc3RydWN0b3JcbiAgICBjb25zdCBydWxlcyA9IHN5bnRheC5tYXAoc3ludGF4ID0+IHBhcnNlUnVsZShzeW50YXgsIGNsb25lQ2xhc3MoY29uc3RydWN0b3IpKSApO1xuICAgIC8vIHJldHVybiBhbiBhbHRlcm5hdGl2ZXMgd2l0aCB0aGUgY29ycmVjdCBuYW1lXG4gICAgY29uc3QgYWx0Q2xhc3MgPSBjbG9uZUNsYXNzKFJ1bGUuQWx0ZXJuYXRpdmVzLCBjb25zdHJ1Y3Rvci5uYW1lKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYWx0Q2xhc3MucHJvdG90eXBlLCBcInJ1bGVzXCIsIHsgdmFsdWU6IHJ1bGVzIH0pO1xuICAgIHJldHVybiBuZXcgYWx0Q2xhc3MoKTtcbiAgfTtcblxuICBsZXQgcnVsZXMgPSBwYXJzZVN5bnRheChzeW50YXgsIFtdKTtcbiAgaWYgKHJ1bGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgcGFyc2VyLmRlZmluZVJ1bGUoJHtuYW1lc1swXX0sICR7c3ludGF4fSk6IG5vIHJ1bGUgcHJvZHVjZWRgKTtcbiAgfVxuXG4gIC8vIE1ha2UgYW4gaW5zdGFuY2Ugb2YgdGhlIHJ1bGUgYW5kIGFkZCByZWxldmFudCBwcm9wZXJ0aWVzIHRvIGl0cyBwcm90b3R5cGUgbm9uLWVudW1lcmFibHlcbiAgaWYgKGNvbnN0cnVjdG9yLnByb3RvdHlwZSBpbnN0YW5jZW9mIFJ1bGUuS2V5d29yZHNcbiAgIHx8IGNvbnN0cnVjdG9yLnByb3RvdHlwZSBpbnN0YW5jZW9mIFJ1bGUuU3ltYm9sc1xuICAgfHwgY29uc3RydWN0b3IucHJvdG90eXBlIGluc3RhbmNlb2YgUnVsZS5MaXN0XG4gICB8fCBjb25zdHJ1Y3Rvci5wcm90b3R5cGUgaW5zdGFuY2VvZiBSdWxlLkFsdGVybmF0aXZlc1xuICApIHtcbiAgICBmb3IgKGxldCBwcm9wZXJ0eSBpbiBydWxlc1swXSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvcGVydHksIHsgdmFsdWU6IHJ1bGVzWzBdW3Byb3BlcnR5XSB9KTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLnByb3RvdHlwZSwgXCJydWxlc1wiLCB7IHZhbHVlOiBydWxlcyB9KTtcbiAgfVxuXG4gIHJldHVybiBuZXcgY29uc3RydWN0b3IoKTtcbn1cblxuZnVuY3Rpb24gdG9rZW5pc2VSdWxlU3ludGF4KHN5bnRheCkge1xuICBjb25zdCBTWU5UQVhfRVhQUkVTU0lPTiA9IC8oPzpbXFx3XFwtXSt8XFxcXFtcXFtcXChcXHtcXClcXH1cXF1dfFteXFxzXFx3XXxcXHwpL2c7XG4gIGxldCBzeW50YXhTdHJlYW0gPSBzeW50YXgubWF0Y2goU1lOVEFYX0VYUFJFU1NJT04pO1xuICBpZiAoIXN5bnRheFN0cmVhbSkgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBDYW4ndCB0b2tlbml6ZSBwYXJzZSBydWxlIHN5bnRheCA+PiR7c3ludGF4fTw8YCk7XG4gIHJldHVybiBzeW50YXhTdHJlYW07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVN5bnRheChzeW50YXgsIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCkge1xuICBpZiAoc3ludGF4ID09IG51bGwpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJwYXJzZVN5bnRheCgpOiBgc3ludGF4YCBpcyByZXF1aXJlZFwiKTtcbiAgY29uc3Qgc3ludGF4U3RyZWFtID0gdHlwZW9mIHN5bnRheCA9PT0gXCJzdHJpbmdcIlxuICAgID8gdG9rZW5pc2VSdWxlU3ludGF4KHN5bnRheClcbiAgICA6IHN5bnRheDtcblxuICBsZXQgbGFzdEluZGV4ID0gc3ludGF4U3RyZWFtLmxlbmd0aDtcbiAgd2hpbGUgKHN0YXJ0IDwgbGFzdEluZGV4KSB7XG4gICAgbGV0IFsgcnVsZSwgZW5kIF0gPSBwYXJzZVRva2VuKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICBpZiAocnVsZSkge1xuICAgICAgbGV0IGxhc3QgPSBydWxlc1tydWxlcy5sZW5ndGgtMV07XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgYFN5bWJvbGAgYW5kIGxhc3Qgd2FzIGEgYFN5bWJvbGAsIG1lcmdlIHRvZ2V0aGVyXG4gICAgICBpZiAobGFzdCAmJiBsYXN0IGluc3RhbmNlb2YgUnVsZS5TeW1ib2xzICYmIHJ1bGUgaW5zdGFuY2VvZiBSdWxlLlN5bWJvbHMpIHtcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBsYXN0IHJ1bGVcbiAgICAgICAgcnVsZXMucG9wKCk7XG4gICAgICAgIC8vIGFuZCByZXBsYWNlIHdpdGggYSBydWxlIHRoYXQgbWVyZ2VzIHRoZSBrZXl3b3Jkc1xuICAgICAgICBydWxlLmxpdGVyYWxzID0gbGFzdC5saXRlcmFscy5jb25jYXQocnVsZS5saXRlcmFscyk7XG4gICAgICB9XG4gICAgICBydWxlcy5wdXNoKHJ1bGUpO1xuICAgIH1cbiAgICBzdGFydCA9IGVuZCArIDE7XG4gIH1cbiAgcmV0dXJuIHJ1bGVzO1xufVxuXG5jb25zdCBLRVlXT1JEX1BBVFRFUk4gPSAvW0EtWmEtel1bXFx3Xy1dKi87XG5mdW5jdGlvbiBwYXJzZVRva2VuKHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwKSB7XG4gIGxldCBzeW50YXhUb2tlbiA9IHN5bnRheFN0cmVhbVtzdGFydF07XG5cbiAgLy8gaWYgd2UgZ290IGEgXCJcXFxcXCIgKHdoaWNoIGFsc28gaGFzIHRvIGdvIGludG8gdGhlIHNvdXJjZSBzdHJpbmcgYXMgXCJcXFxcXCIpXG4gIC8vIHRyZWF0IHRoZSBuZXh0IHRva2VuIGFzIGEgbGl0ZXJhbCBzdHJpbmcgcmF0aGVyIHRoYW4gYXMgYSBzcGVjaWFsIGNoYXJhY3Rlci5cbiAgaWYgKHN5bnRheFRva2VuID09PSBcIlxcXFxcIikge1xuICAgIHJldHVybiBwYXJzZVN5bWJvbChzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCArIDEpO1xuICB9XG5cbiAgc3dpdGNoIChzeW50YXhUb2tlbikge1xuICAgIGNhc2UgXCJ7XCI6XHRyZXR1cm4gcGFyc2VTdWJydWxlKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICBjYXNlIFwiKFwiOlx0cmV0dXJuIHBhcnNlQWx0ZXJuYXRpdmVzKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICBjYXNlIFwiW1wiOlx0cmV0dXJuIHBhcnNlTGlzdChzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgY2FzZSBcIipcIjpcbiAgICBjYXNlIFwiK1wiOlxuICAgIGNhc2UgXCI/XCI6XHRyZXR1cm4gcGFyc2VSZXBlYXQoc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuXG4gICAgLy8gdGhlIGZvbGxvd2luZyBzaG91bGQgQUxXQVlTIGJlIGNvbnN1bWVkIGJ5IHRoZSBhYm92ZVxuICAgIGNhc2UgXCJ9XCI6XG4gICAgY2FzZSBcIilcIjpcbiAgICBjYXNlIFwiXVwiOlxuICAgIGNhc2UgXCJ8XCI6XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFVuZXhwZWN0ZWQgJHtzeW50YXhUb2tlbn0gZm91bmQgYXMgaXRlbSAke3N0YXJ0fSBvZiAke3N5bnRheFN0cmVhbX1gKTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICBpZiAoc3ludGF4VG9rZW4ubWF0Y2goS0VZV09SRF9QQVRURVJOKSkge1xuICAgICAgICByZXR1cm4gcGFyc2VLZXl3b3JkKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gcGFyc2VTeW1ib2woc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuICAgICAgfVxuICB9XG59XG5cblxuLy8gTWF0Y2ggYGtleXdvcmRgIGluIHN5bnRheCBydWxlcy5cbi8vIElmIG1vcmUgdGhhbiBvbmUga2V5d29yZCBhcHBlYXJzIGluIGEgcm93LCBjb21iaW5lcyB0aGVtIGludG8gYSBzaW5nbGUgYEtleXdvcmRgIG9iamVjdC5cbi8vIFRoaXMgaXMgcHJldHR5IHNhZmUsIHVubGVzcyB5b3UgaGF2ZSBhbiBvcHRpb25hbCBrZXl3b3JkIGxpa2Vcbi8vXHRcdGB0aGUge2lkZW50aWZpZXJ9IG9mIHRoZT8ge2V4cHJlc3Npb259YFxuLy8gaW4gd2hpY2ggY2FzZSB5b3UgY2FuIHB1dCB0aGUgb3B0aW9uYWwga2V5d29yZCBpbiBwYXJlbnNcbi8vXHRcdGB0aGUge2lkZW50aWZpZXJ9IG9mICh0aGU/KSB7ZXhwcmVzc2lvbn1gXG4vL1xuLy8gUmV0dXJucyBgWyBydWxlLCBlbmQgXWBcbi8vIFRocm93cyBpZiBpbnZhbGlkLlxuZnVuY3Rpb24gcGFyc2VLZXl3b3JkKHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwLCBjb25zdHJ1Y3RvciA9IFJ1bGUuS2V5d29yZHMpIHtcbiAgbGV0IGxpdGVyYWxzID0gW10sIGVuZDtcbiAgLy8gZWF0IGtleXdvcmRzIHdoaWxlIHRoZXkgbGFzdFxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBzeW50YXhTdHJlYW0ubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgbmV4dCA9IHN5bnRheFN0cmVhbVtpXTtcbiAgICBpZiAodHlwZW9mIG5leHQgPT09IFwic3RyaW5nXCIgJiYgbmV4dC5tYXRjaChLRVlXT1JEX1BBVFRFUk4pKSB7XG4gICAgICBsaXRlcmFscy5wdXNoKG5leHQpO1xuICAgICAgZW5kID0gaTtcbiAgICB9XG4gICAgZWxzZSBicmVhaztcbiAgfVxuXG4gIGxldCBydWxlID0gbmV3IGNvbnN0cnVjdG9yKHsgbGl0ZXJhbHMgfSk7XG4gIHJldHVybiBbIHJ1bGUsIGVuZCBdO1xufVxuXG4vLyBNYXRjaCBga2V5d29yZGAgaW4gc3ludGF4IHJ1bGVzLlxuLy8gUmV0dXJucyBgWyBydWxlLCBlbmQgXWBcbi8vIFRocm93cyBpZiBpbnZhbGlkLlxuZnVuY3Rpb24gcGFyc2VTeW1ib2woc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDAsIGNvbnN0cnVjdG9yID0gUnVsZS5TeW1ib2xzKSB7XG4gIGxldCBzdHJpbmcgPSBzeW50YXhTdHJlYW1bc3RhcnRdO1xuICBpZiAoIWNvbnN0cnVjdG9yKSBjb25zdHJ1Y3RvciA9IFJ1bGUuU3ltYm9scztcblxuICAvLyBJZiBzdHJpbmcgc3RhcnRzIHdpdGggYFxcXFxgLCBpdCdzIGFuIGVzY2FwZWQgbGl0ZXJhbCAoZWc6IGBcXFtgIG5lZWRzIHRvIGlucHV0IGFzIGBcXFxcW2ApLlxuICBsZXQgaXNFc2NhcGVkID0gc3RyaW5nLnN0YXJ0c1dpdGgoXCJcXFxcXCIpO1xuICBsZXQgbGl0ZXJhbHMgPSBpc0VzY2FwZWQgPyBzdHJpbmcuc3Vic3RyKDEpIDogc3RyaW5nO1xuXG4gIGxldCBydWxlID0gbmV3IGNvbnN0cnVjdG9yKHsgbGl0ZXJhbHMgfSk7XG5cbiAgaWYgKGlzRXNjYXBlZCkge1xuICAgIHJ1bGUudG9TeW50YXggPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBgXFxcXCR7bGl0ZXJhbHN9JHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gWyBydWxlLCBzdGFydCBdO1xufVxuXG5cbi8vIE1hdGNoIGdyb3VwaW5nIGV4cHJlc3Npb24gYCguLi58Li4uKWAgaW4gc3ludGF4IHJ1bGVzLlxuLy8gUmV0dXJucyBgWyBydWxlLCBlbmQgXWBcbi8vIFlvdSBjYW4gc3BlY2lmeSBhbiBleHBsaWNpdCBgcnVsZS5hcmd1bWVudGAgd2l0aDogIGAoc29tZWFyZzouLi4pYFxuLy8gWW91IGNhbiBzcGVjaWZ5IHRoYXQgdGhlIHJlc3VsdHMgc2hvdWxkIGJlIGBwcm9tb3RlZGAgdG8gZW5jbG9zaW5nIHJ1bGUgd2l0aDogYCg/Oi4uLilgXG4vL1xuLy8gTk9URTogbmVzdGVkIHBhcmVucyBtYXkgbm90IGhhdmUgYWx0ZXJuYXRpdmVzLi4uIDotKCAgIGAoYXwoYnxjKSlgIHdvbid0IHdvcms/Pz9cbmZ1bmN0aW9uIHBhcnNlQWx0ZXJuYXRpdmVzKHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwKSB7XG4gIGxldCB7IGVuZCwgc2xpY2UgfSA9IFBhcnNlci5maW5kTmVzdGVkVG9rZW5zKHN5bnRheFN0cmVhbSwgXCIoXCIsIFwiKVwiLCBzdGFydCk7XG5cbiAgLy8gcHVsbCBvdXQgZXhwbGljaXQgXCJwcm9tb3RlXCIgZmxhZzogYD86YFxuICBsZXQgcHJvbW90ZSA9IChzbGljZVswXSA9PT0gXCI/XCIgJiYgc2xpY2VbMV0gPT09IFwiOlwiKTtcbiAgaWYgKHByb21vdGUpIHtcbiAgICBzbGljZSA9IHNsaWNlLnNsaWNlKDIpO1xuICB9XG5cbiAgLy8gcHVsbCBvdXQgZXhwbGljaXQgYXJndW1lbnQgbmFtZVxuICBsZXQgYXJndW1lbnQ7XG4gIGlmIChzbGljZS5sZW5ndGggPiAyICYmIHNsaWNlWzFdID09PSBcIjpcIikge1xuICAgIGFyZ3VtZW50ID0gc2xpY2VbMF07XG4gICAgc2xpY2UgPSBzbGljZS5zbGljZSgyKTtcbiAgfVxuXG4gIC8vIHNwbGl0IGludG8gZ3JvdXBzLCBpbmNsdWRpbmcgbmVzdGVkIHBhcmVuc1xuICBsZXQgYWx0ZXJuYXRpdmVzID1cbiAgICBncm91cEFsdGVybmF0aXZlcyhzbGljZSlcbiAgICAubWFwKGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICBsZXQgcmVzdWx0cyA9IHBhcnNlU3ludGF4KGdyb3VwLCBbXSk7XG4gICAgICBpZiAocmVzdWx0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNbMF07XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSdWxlLlNlcXVlbmNlKHsgcnVsZXM6IHJlc3VsdHMgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgbGV0IHJ1bGUgPSBhbHRlcm5hdGl2ZXMubGVuZ3RoID09PSAxID8gYWx0ZXJuYXRpdmVzWzBdIDogbmV3IFJ1bGUuQWx0ZXJuYXRpdmVzKHsgcnVsZXM6IGFsdGVybmF0aXZlcyB9KTtcbiAgaWYgKGFyZ3VtZW50KSBydWxlLmFyZ3VtZW50ID0gYXJndW1lbnQ7XG4gIGlmIChwcm9tb3RlKSBydWxlLnByb21vdGUgPSB0cnVlO1xuICByZXR1cm4gWyBydWxlLCBlbmQgXTtcbn1cblxuZnVuY3Rpb24gZ3JvdXBBbHRlcm5hdGl2ZXModG9rZW5zKSB7XG4gIGxldCBhbHRlcm5hdGl2ZXMgPSBbXTtcbiAgbGV0IGN1cnJlbnQgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDAsIHRva2VuOyB0b2tlbiA9IHRva2Vuc1tpXTsgaSsrKSB7XG4gICAgLy8gaGFuZGxlIGFsdGVybmF0ZSBtYXJrZXJcbiAgICBpZiAodG9rZW4gPT09IFwifFwiKSB7XG4gICAgICBhbHRlcm5hdGl2ZXMucHVzaChjdXJyZW50KTtcbiAgICAgIGN1cnJlbnQgPSBbXTtcbiAgICB9XG4gICAgLy8gaGFuZGxlIG5lc3RlZCBwYXJlbnNcbiAgICBlbHNlIGlmICh0b2tlbiA9PT0gXCIoXCIpIHtcbiAgICAgIGxldCB7IGVuZCB9ID0gUGFyc2VyLmZpbmROZXN0ZWRUb2tlbnModG9rZW5zLCBcIihcIiwgXCIpXCIsIGkpO1xuICAgICAgY3VycmVudCA9IGN1cnJlbnQuY29uY2F0KHRva2Vucy5zbGljZShpLCBlbmQgKyAxKSk7XG4gICAgICBpID0gZW5kO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGN1cnJlbnQucHVzaCh0b2tlbik7XG4gICAgfVxuICB9XG4gIGlmIChjdXJyZW50Lmxlbmd0aCkgYWx0ZXJuYXRpdmVzLnB1c2goY3VycmVudCk7XG4gIHJldHVybiBhbHRlcm5hdGl2ZXM7XG59XG5cbi8vIE1hdGNoIHJlcGVhdCBpbmRpY2F0b3IgYD9gLCBgK2Agb3IgYCpgIGJ5IGF0dGFjaGluZyBpdCB0byB0aGUgcHJldmlvdXMgcnVsZS5cbmZ1bmN0aW9uIHBhcnNlUmVwZWF0KHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwKSB7XG4gIGxldCBzeW1ib2wgPSBzeW50YXhTdHJlYW1bc3RhcnRdO1xuICBsZXQgcnVsZSA9IHJ1bGVzW3J1bGVzLmxlbmd0aCAtIDFdO1xuICBpZiAoIXJ1bGUpIHRocm93IG5ldyBTeW50YXhFcnJvcihgQ2FuJ3QgYXR0YWNoIHJlcGVhdCBzeW1ib2wgJHtzeW1ib2x9IHRvIGVtcHR5IHJ1bGUhYCk7XG5cbiAgLy8gVHJhbnNmb3JtIGxhc3QgcnVsZSBpbnRvIGEgcmVwZWF0IGZvciBgKmAgYW5kIGArYC5cbiAgaWYgKHN5bWJvbCA9PT0gXCIqXCIgfHwgc3ltYm9sID09PSBcIitcIikge1xuICAgIGxldCBhcmd1bWVudCA9IHJ1bGUuYXJndW1lbnQ7XG4gICAgcnVsZSA9IG5ldyBSdWxlLlJlcGVhdCh7IHJlcGVhdDogcnVsZSB9KTtcbiAgICBpZiAoYXJndW1lbnQpIHJ1bGUuYXJndW1lbnQgPSBhcmd1bWVudDtcbiAgICAvLyBwdXNoIGludG8gcnVsZSBzdGFjayBpbiBwbGFjZSBvZiBvbGQgcnVsZVxuICAgIHJ1bGVzW3J1bGVzLmxlbmd0aCAtIDFdID0gcnVsZTtcbiAgfVxuXG4gIC8vIFJ1bGUgaXMgb3B0aW9uYWwgZm9yIGA/YCBhbmQgYCpgLlxuICBpZiAoc3ltYm9sID09PSBcIj9cIiB8fCBzeW1ib2wgPT09IFwiKlwiKSB7XG4gICAgcnVsZS5vcHRpb25hbCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gWyB1bmRlZmluZWQsIHN0YXJ0IF1cbn1cblxuLy8gTWF0Y2ggYHs8c3VicnVsZT59YCBpbiBzeW50YXggcnVsZXMuXG4vLyBSZXR1cm5zIGBbIHJ1bGUsIGVuZCBdYFxuLy8gVGhyb3dzIGlmIGludmFsaWQuXG5mdW5jdGlvbiBwYXJzZVN1YnJ1bGUoc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDApIHtcbiAgbGV0IG1hdGNoID0gUGFyc2VyLmZpbmROZXN0ZWRUb2tlbnMoc3ludGF4U3RyZWFtLCBcIntcIiwgXCJ9XCIsIHN0YXJ0KTtcbiAgbGV0IGFyZ3VtZW50O1xuICBpZiAobWF0Y2guc2xpY2UubGVuZ3RoID09PSAzICYmIG1hdGNoLnNsaWNlWzFdID09PSBcIjpcIikge1xuICAgIGFyZ3VtZW50ID0gbWF0Y2guc2xpY2VbMF07XG4gICAgbWF0Y2guc2xpY2UgPSBtYXRjaC5zbGljZS5zbGljZSgyKTtcbiAgfVxuICBpZiAobWF0Y2guc2xpY2UubGVuZ3RoID4gMSkgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBDYW4ndCBwcm9jZXNzIHJ1bGVzIHdpdGggbW9yZSB0aGFuIG9uZSBydWxlIG5hbWU6IHske21hdGNoLnNsaWNlLmpvaW4oXCJcIil9fWApO1xuXG4gIGxldCBwYXJhbXMgPSB7IHN1YnJ1bGU6IG1hdGNoLnNsaWNlWzBdIH07XG5cbiAgLy8gc2VlIGlmIHRoZXJlJ3MgYSBgbm90YCBydWxlIGluIHRoZXJlXG4gIGxldCBiYW5nUG9zaXRpb24gPSBwYXJhbXMuc3VicnVsZS5pbmRleE9mKFwiIVwiKTtcbiAgaWYgKGJhbmdQb3NpdGlvbiAhPT0gLTEpIHtcbiAgICBwYXJhbXMubm90ID0gcGFyYW1zLnN1YnJ1bGUuc3Vic3RyKGJhbmdQb3NpdGlvbiArIDEpO1xuICAgIHBhcmFtcy5zdWJydWxlID0gcGFyYW1zLnN1YnJ1bGUuc3Vic3RyKDAsIGJhbmdQb3NpdGlvbik7XG4gIH1cblxuICBsZXQgcnVsZSA9IG5ldyBSdWxlLlN1YnJ1bGUocGFyYW1zKTtcbiAgaWYgKGFyZ3VtZW50KSBydWxlLmFyZ3VtZW50ID0gYXJndW1lbnQ7XG4gIHJldHVybiBbIHJ1bGUsIG1hdGNoLmVuZCBdO1xufVxuXG4vLyBNYXRjaCBsaXN0IGV4cHJlc3Npb24gYFs8aXRlbT48ZGVsaW1pdGVyPl1gIG9yIGBbPGFyZ3VtZW50Pjo8aXRlbT48ZGVsaW1pdGVyPl1gIGluIHN5bnRheCBydWxlcy5cbi8vIFJldHVybnMgYFsgcnVsZSwgZW5kIF1gXG4vLyBUaHJvd3MgaWYgaW52YWxpZC5cbmZ1bmN0aW9uIHBhcnNlTGlzdChzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCwgY29uc3RydWN0b3IgPSBSdWxlLkxpc3QpIHtcbiAgbGV0IHsgZW5kLCBzbGljZSB9ID0gUGFyc2VyLmZpbmROZXN0ZWRUb2tlbnMoc3ludGF4U3RyZWFtLCBcIltcIiwgXCJdXCIsIHN0YXJ0KTtcblxuICAvLyBnZXQgYXJndW1lbnQgaWYgc3VwcGxpZWRcbiAgbGV0IGFyZ3VtZW50O1xuICBpZiAoc2xpY2UubGVuZ3RoID4gMiAmJiBzbGljZVsxXSA9PT0gXCI6XCIpIHtcbiAgICBhcmd1bWVudCA9IHNsaWNlWzBdO1xuICAgIHNsaWNlID0gc2xpY2Uuc2xpY2UoMik7XG4gIH1cblxuICBsZXQgcmVzdWx0cyA9IHBhcnNlU3ludGF4KHNsaWNlLCBbXSk7XG4gIGlmIChyZXN1bHRzLmxlbmd0aCAhPT0gMikge1xuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgVW5leHBlY3RlZCBzdHVmZiBhdCBlbmQgb2YgbGlzdDogWyR7c2xpY2Uuam9pbihcIiBcIil9XWApO1xuICB9XG4gIGxldCBbIGl0ZW0sIGRlbGltaXRlciBdID0gcmVzdWx0cztcblxuICBsZXQgcnVsZSA9IG5ldyBjb25zdHJ1Y3Rvcih7IGl0ZW0sIGRlbGltaXRlciB9KTtcbiAgaWYgKGFyZ3VtZW50KSBydWxlLmFyZ3VtZW50ID0gYXJndW1lbnQ7XG4gIHJldHVybiBbIHJ1bGUsIGVuZCBdO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1J1bGVTeW50YXguanMiLCJpbXBvcnQgeyBnZXRUYWJzIH0gZnJvbSBcIi4vdXRpbHMvc3RyaW5nXCI7XG5cbi8vIEdSUlIuLi4gbm9kZSBkb2Vzbid0IGluY2x1ZGUgdGhpcz8/P1xuLy8gQ0hFQ0sgRElGRkVSRU5UIE5PREUgVkVSU0lPTlMuLi5cbmlmICghKEFycmF5LnByb3RvdHlwZS5pbmNsdWRlcykpIHtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KEFycmF5LnByb3RvdHlwZSwgXCJpbmNsdWRlc1wiLCB7XG5cdFx0dmFsdWU6IGZ1bmN0aW9uKHZhbHVlLCBzdGFydCkge1xuXHRcdFx0bGV0IGluZGV4ID0gdGhpcy5pbmRleE9mKHZhbHVlLCBzdGFydCk7XG5cdFx0XHRyZXR1cm4gKGluZGV4ICE9PSAtMSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuXG5cbi8vIGB3aGl0ZXNwYWNlYCBjbGFzcyBmb3Igbm9ybWFsIChub24taW5kZW50LCBub24tbmV3bGluZSkgd2hpdGVzcGFjZS5cbmNsYXNzIHdoaXRlc3BhY2Uge1xuXHRjb25zdHJ1Y3Rvcih3aGl0ZXNwYWNlKSB7XG5cdFx0dGhpcy53aGl0ZXNwYWNlID0gd2hpdGVzcGFjZTtcblx0fVxuXG5cdC8vIFJldHVybiB0aGUgXCJsZW5ndGhcIiBvZiB0aGlzIHdoaXRlc3BhY2UsIGVnIGZvciBhbiBpbmRlbnQuXG5cdGdldCBsZW5ndGgoKSB7XG5cdFx0cmV0dXJuIHRoaXMud2hpdGVzcGFjZS5sZW5ndGg7XG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gdGhpcy53aGl0ZXNwYWNlO1xuXHR9XG59XG5cblxuLy8gYGluZGVudGAgY2xhc3MuXG5jbGFzcyBpbmRlbnQgZXh0ZW5kcyB3aGl0ZXNwYWNlIHt9XG5cblxuLy8gTmV3bGluZSBzaW5nbGV0b24uXG5jbGFzcyBuZXdsaW5lIGV4dGVuZHMgd2hpdGVzcGFjZSB7fVxuXG5cbi8vXG4vL1x0IyBUb2tlbml6ZXJcbi8vXHQtIGAudG9rZW5pemUoKWAgXHRcdEJyZWFrcyB1cCBsb25nIHN0cmluZyBpbnRvIHRva2VucywgaW5jbHVkaW5nIG5ld2xpbmVzLCBKU1ggZXhwcmVzc2lvbnMsIGV0Yy5cbi8vXHQtIGAudG9rZW5pemVMaW5lcygpYCBcdFRha2VzIHRoZSBhYm92ZSBhbmQgYnJlYWtzIGl0IGludG8gYW4gYXJyYXkgb2YgYXJyYXlzIGZvciBlYWNoIGxpbmUuXG4vL1xuLy8gVE9ETzogZXJyb3IgY2hlY2tpbmcgLyByZXBvcnRpbmcsIGVzcGVjaWFsbHkgaW4gSlNYIGV4cHJlc3Npb25zLlxuLy8gVE9ETzogaGF2ZSBub3JtYWwgYHRva2VuaXplYCBzdGljayB3aGl0ZXNwYWNlIGVsZW1lbnRzIGluIHRoZSBzdHJlYW0sIHRoZW4gYHRva2VuaXplTGluZXMoKWAgdGFrZXMgdGhlbSBvdXQ/XG5jb25zdCBUb2tlbml6ZXIgPSB7XG5cblx0Ly8gU2hvdWxkIHdlIHdhcm4gYWJvdXQgYW5vbWFsb3VzIGNvbmRpdGlvbnM/XG5cdFdBUk4gOiBmYWxzZSxcblxuXHQvLyBXaGl0ZXNwYWNlIGNvbnN0cnVjdG9yLlxuXHRXaGl0ZXNwYWNlOiB3aGl0ZXNwYWNlLFxuXG5cdC8vIEluZGVudCBjb25zdHJ1Y3RvclxuXHRJbmRlbnQ6IGluZGVudCxcblxuXHQvLyBORVdMSU5FIHNpbmdsZXRvbi5cblx0TkVXTElORTogbmV3IG5ld2xpbmUoXCJcXG5cIiksXG5cblx0Ly8gVG9rZW5pemUgdGV4dCBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgIGludG8gYW4gYXJyYXkgb2YgYHJlc3VsdHNgLCBhbiBhcnJheSBvZjpcblx0Ly9cdC0gYFRva2VuaXplci5ORVdMSU5FYCBmb3IgYSBuZXdsaW5lIHN5bWJvbFxuXHQvL1x0LSBzdHJpbmdzIGZvciBrZXl3b3Jkcy9zeW1ib2xzXG5cdC8vXHQtIG51bWJlcnMgZm9yIG51bWJlciBsaXRlcmFsc1xuXHQvL1x0LSBgeyBpbmRlbnQ6IG51bWJlciB9YCBmb3IgaW5kZW50IGF0IHN0YXJ0IG9mIGxpbmVcblx0Ly9cdC0gYHsgdHlwZTogXCJ0ZXh0XCIsIGxpdGVyYWw6IFwiJ2FiYydcIiwgdGV4dDogXCJhYmNcIiB9XG5cdC8vXHQtIGB7IHR5cGU6IFwiaW5kZW50XCIsIGxldmVsOiA3IH1gXG5cdC8vXHQtIGB7IHR5cGU6IFwiY29tbWVudFwiLCBjb21tZW50OiBcInN0cmluZ1wiLCBjb21tZW50U3ltYm9sLCB3aGl0ZXNwYWNlIH1gXG4vL1RFU1RNRVxuXHR0b2tlbml6ZSh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHQvLyBxdWljayByZXR1cm4gb3V0IG9mIHJhbmdlIG9yIG9ubHkgd2hpdGVzcGFjZVxuXHRcdGlmIChzdGFydCA+PSBlbmQgfHwgIXRleHQudHJpbSgpKSByZXR1cm4gW107XG5cblx0XHRsZXQgdG9rZW5zID0gW107XG5cdFx0Ly8gUHJvY2VzcyBvdXIgdG9wLWxldmVsIHJ1bGVzLlxuXHRcdGxldCBbcmVzdWx0cywgbmV4dFN0YXJ0XSA9IHRoaXMuZWF0VG9rZW5zKHRoaXMubWF0Y2hUb3BUb2tlbnMsIHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGlmIChyZXN1bHRzKSB7XG5cdFx0XHR0b2tlbnMgPSB0b2tlbnMuY29uY2F0KHJlc3VsdHMpO1xuXHRcdFx0c3RhcnQgPSBuZXh0U3RhcnQ7XG5cdFx0fVxuXHRcdGlmIChzdGFydCAhPT0gZW5kKSB7XG5cdFx0XHRpZiAoVG9rZW5pemVyLldBUk4pIGNvbnNvbGUud2FybihcInRva2VuaXplKCk6IGRpZG4ndCBjb25zdW1lOiBgXCIsIHRleHQuc2xpY2Uoc3RhcnQsIGVuZCkgKyBcImBcIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdHM7XG5cdH0sXG5cblx0Ly8gUmVwZWF0ZWRseSBleGVjdXRlIGEgYG1ldGhvZGAgKGJvdW5kIHRvIGB0aGlzKSB3aGljaCByZXR1cm5zIGEgYFtyZXN1bHQsIG5leHRTdGFydF1gIG9yIGB1bmRlZmluZWRgLlxuXHQvLyBQbGFjZXMgbWF0Y2hlZCByZXN1bHRzIHRvZ2V0aGVyIGluIGByZXN1bHRzYCBhcnJheSBhbmQgcmV0dXJucyBgW3Jlc3VsdHMsIG5leHRTdGFydF1gIGZvciB0aGUgZW50aXJlIHNldC5cblx0Ly8gU3RvcHMgaWYgYG1ldGhvZGAgZG9lc24ndCByZXR1cm4gYW55dGhpbmcsIG9yIGlmIGNhbGxpbmcgYG1ldGhvZGAgaXMgdW5wcm9kdWN0aXZlLlxuLy9URVNUTUVcblx0ZWF0VG9rZW5zKG1ldGhvZCwgdGV4dCwgc3RhcnQgPSAwLCBlbmQsIHJlc3VsdHMgPSBbXSkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gcHJvY2VzcyBydWxlcyByZXBlYXRlZGx5IHVudGlsIHdlIGdldCB0byB0aGUgZW5kXG5cdFx0d2hpbGUgKHN0YXJ0IDwgZW5kKSB7XG5cdFx0XHRsZXQgcmVzdWx0ID0gbWV0aG9kLmNhbGwodGhpcywgdGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0XHRpZiAoIXJlc3VsdCkgYnJlYWs7XG5cblx0XHRcdGxldCBbdG9rZW5zLCBuZXh0U3RhcnRdID0gcmVzdWx0O1xuXHRcdFx0Ly8gQmFpbCBpZiB3ZSBkaWRuJ3QgZ2V0IGEgcHJvZHVjdGl2ZSBydWxlIVxuXHRcdFx0aWYgKHN0YXJ0ID09PSBuZXh0U3RhcnQpIGJyZWFrO1xuXG5cdFx0XHQvLyBoYW5kbGUgbmV3UmVzdWx0cyBhcyBhbiBhcnJheSBvciBzaW5nbGUgb2JqZWN0LlxuXHRcdFx0aWYgKHRva2VucyAhPT0gdW5kZWZpbmVkKSByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQodG9rZW5zKTtcblx0XHRcdHN0YXJ0ID0gbmV4dFN0YXJ0O1xuXHRcdH1cblx0XHRyZXR1cm4gW3Jlc3VsdHMsIHN0YXJ0XTtcblx0fSxcblxuXHQvLyBNYXRjaCBhIHNpbmdsZSB0b3AtbGV2ZWwgdG9rZW4gYXQgYHRleHRbc3RhcnRdYC5cbi8vVEVTVE1FXG5cdG1hdGNoVG9wVG9rZW5zKHRleHQsIHN0YXJ0LCBlbmQpIHtcblx0XHRyZXR1cm5cdHRoaXMubWF0Y2hXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaFdvcmQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoTnVtYmVyKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaE5ld2xpbmUodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoSlNYRWxlbWVudCh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0IHx8IHRoaXMubWF0Y2hUZXh0KHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaENvbW1lbnQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoU3ltYm9sKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0O1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBTeW1ib2wgY2hhcmFjdGVyXG5cdC8vXG5cblx0Ly8gTWF0Y2ggdGhlIHNpbmdsZSBcInN5bWJvbFwiIGNoYXJhY3RlciBhdCBgdGV4dFtzdGFydF1gLlxuXHQvLyBOT1RFOiBUaGlzIGRvZXMgbm90IGRvIGFueSBjaGVja2luZywgaXQganVzdCBibGluZGx5IHVzZXMgdGhlIGNoYXJhY3RlciBpbiBxdWVzdGlvbi5cblx0Ly9cdFx0IFlvdSBzaG91bGQgbWFrZSBzdXJlIGFsbCBvdGhlciBwb3NzaWJsZSBydWxlcyBoYXZlIGJlZW4gZXhoYXVzdGVkIGZpcnN0LlxuXHRtYXRjaFN5bWJvbCh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIFt0ZXh0W3N0YXJ0XSwgc3RhcnQgKyAxXVxuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBXaGl0ZXNwYWNlXG5cdC8vXG5cblx0Ly8gUmV0dXJuIHRoZSBmaXJzdCBjaGFyIHBvc2l0aW9uIGFmdGVyIGBzdGFydGAgd2hpY2ggaXMgTk9UIGEgd2hpdGVzcGFjZSBjaGFyIChzcGFjZSBvciB0YWIgb25seSkuXG5cdC8vIElmIGB0ZXh0W3N0YXJ0XWAgaXMgbm90IHdoaXRlc3BhY2UsIHJldHVybnMgYHN0YXJ0YCxcblx0Ly9cdHNvIHlvdSBjYW4gY2FsbCB0aGlzIGF0IGFueSB0aW1lIHRvIHNraXAgd2hpdGVzcGFjZSBpbiB0aGUgb3V0cHV0LlxuXHRlYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiBlbmQ7XG5cblx0XHRsZXQgd2hpdGVTcGFjZUVuZCA9IHN0YXJ0O1xuXHRcdHdoaWxlICh3aGl0ZVNwYWNlRW5kIDwgZW5kICYmICh0ZXh0W3doaXRlU3BhY2VFbmRdID09PSBcIiBcIiB8fCB0ZXh0W3doaXRlU3BhY2VFbmRdID09PSBcIlxcdFwiKSkge1xuXHRcdFx0d2hpdGVTcGFjZUVuZCsrO1xuXHRcdH1cblx0XHRyZXR1cm4gd2hpdGVTcGFjZUVuZDtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgV2hpdGVzcGFjZVxuXHQvL1x0Tk9URTogV2hpdGVzcGFjZSBhdCB0aGUgYmVnaW5uaW5nIG9mIGB0ZXh0YCBvciB0aGUgYmVnaW5uaW5nIG9mIGEgbGluZVxuXHQvL1x0XHQgIGlzIGNvbnNpZGVyZWQgYW4gXCJpbmRlbnRcIiBhbmQgd2lsbCBoYXZlIGAuaXNJbmRlbnQgPT09IHRydWVgLlxuXHQvL1xuXG5cdC8vIENvbnZlcnQgYSBydW4gb2Ygc3BhY2VzIGFuZC9vciB0YWJzIGludG8gYSBgVG9rZW5pemVyLldoaXRlc3BhY2VgLlxuXHRtYXRjaFdoaXRlc3BhY2UodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB3aGl0ZXNwYWNlRW5kID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdC8vIGZvcmdldCBpdCBpZiBubyBmb3J3YXJkIG1vdGlvblxuXHRcdGlmICh3aGl0ZXNwYWNlRW5kID09PSBzdGFydCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB3aGl0ZXNwYWNlID0gdGV4dC5zbGljZShzdGFydCwgd2hpdGVzcGFjZUVuZCk7XG5cdFx0bGV0IHRva2VuO1xuXHRcdGlmIChzdGFydCA9PT0gMCB8fCB0ZXh0W3N0YXJ0LTFdID09PSBcIlxcblwiKVxuXHRcdFx0dG9rZW4gPSBuZXcgVG9rZW5pemVyLkluZGVudCh3aGl0ZXNwYWNlKTtcblx0XHRlbHNlXG5cdFx0XHR0b2tlbiA9IG5ldyBUb2tlbml6ZXIuV2hpdGVzcGFjZSh3aGl0ZXNwYWNlKTtcblxuXHRcdHJldHVybiBbdG9rZW4sIHdoaXRlc3BhY2VFbmRdO1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBOZXdsaW5lXG5cdC8vXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgbmV3bGluZSBjaGFyYWN0ZXIgYXQgYHRleHRbc3RhcnRdYC5cblx0Ly8gUmV0dXJucyBgW1Rva2VuaXplci5ORVdMSU5FLCBuZXh0U3RhcnRdYCBvbiBtYXRjaC5cblx0Ly8gT3RoZXJ3aXNlIHJldHVybnMgYHVuZGVmaW5lZGAuXG5cdG1hdGNoTmV3bGluZSh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kIHx8IHRleHRbc3RhcnRdICE9PSBcIlxcblwiKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIFtUb2tlbml6ZXIuTkVXTElORSwgc3RhcnQgKyAxXTtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgV29yZFxuXHQvL1xuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIGB3b3JkYCBpbiBgdGV4dGAgYXQgY2hhcmFjdGVyIGBzdGFydGAuXG5cdC8vIFJldHVybnMgYFt3b3JkLCB3b3JkRW5kXWAuXG5cdC8vIFJldHVybnMgYW4gZW1wdHkgYXJyYXkgaWYgY291bGRuJ3QgbWF0Y2ggYSB3b3JkLlxuXHRXT1JEX1NUQVJUOiAvW0EtWmEtel0vLFxuXHRXT1JEX0NIQVIgOiAvXltcXHdfLV0vLFxuXHRtYXRjaFdvcmQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGlmICghdGhpcy5XT1JEX1NUQVJULnRlc3QodGV4dFtzdGFydF0pKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHdvcmRFbmQgPSBzdGFydCArIDE7XG5cdFx0d2hpbGUgKHdvcmRFbmQgPCBlbmQgJiYgdGhpcy5XT1JEX0NIQVIudGVzdCh0ZXh0W3dvcmRFbmRdKSkge1xuXHRcdFx0d29yZEVuZCsrO1xuXHRcdH1cblx0XHRpZiAod29yZEVuZCA9PT0gc3RhcnQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgd29yZCA9IHRleHQuc2xpY2Uoc3RhcnQsIHdvcmRFbmQpO1xuXHRcdHJldHVybiBbd29yZCwgd29yZEVuZF07XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIE51bWJlcnNcblx0Ly9cblxuXHQvLyBFYXQgYSBzaW5nbGUgbnVtYmVyLlxuXHQvLyBSZXR1cm5zIGEgYE51bWJlcmAgaWYgbWF0Y2hlZC5cblx0TlVNQkVSX1NUQVJUOiAvWzAtOS0uXS8sXG5cdE5VTUJFUiA6IC9eLT8oWzAtOV0qXFwuKT9bMC05XSsvLFxuXHRtYXRjaE51bWJlcih0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0aWYgKCF0aGlzLk5VTUJFUl9TVEFSVC50ZXN0KHRleHRbc3RhcnRdKSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBudW1iZXJNYXRjaCA9IHRoaXMubWF0Y2hFeHByZXNzaW9uQXRIZWFkKHRoaXMuTlVNQkVSLCB0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRpZiAoIW51bWJlck1hdGNoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG51bWJlclN0ciA9IG51bWJlck1hdGNoWzBdO1xuXHRcdGxldCBudW1iZXIgPSBwYXJzZUZsb2F0KG51bWJlclN0ciwgMTApO1xuXHRcdHJldHVybiBbbnVtYmVyLCBzdGFydCArIG51bWJlclN0ci5sZW5ndGhdO1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBUZXh0IGxpdGVyYWxcblx0Ly9cblxuXHQvLyBFYXQgYSB0ZXh0IGxpdGVyYWwgKHN0YXJ0cy9lbmRzIHdpdGggYCdgIG9yIGBcImApLlxuXHQvLyBSZXR1cm5zIGEgYFRva2VuaXplci5UZXh0YCBpZiBtYXRjaGVkLlxuLy9URVNUTUU6ICBub3Qgc3VyZSB0aGUgZXNjYXBpbmcgbG9naWMgaXMgcmVhbGx5IHJpZ2h0Li4uXG5cdG1hdGNoVGV4dCh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHF1b3RlU3ltYm9sID0gdGV4dFtzdGFydF07XG5cdFx0aWYgKHF1b3RlU3ltYm9sICE9PSAnXCInICYmIHF1b3RlU3ltYm9sICE9PSBcIidcIikgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB0ZXh0RW5kID0gc3RhcnQgKyAxO1xuXHRcdHdoaWxlICh0ZXh0RW5kIDwgZW5kKSB7XG5cdFx0XHRsZXQgY2hhciA9IHRleHRbdGV4dEVuZF07XG5cdFx0XHRpZiAoY2hhciA9PT0gcXVvdGVTeW1ib2wpIGJyZWFrO1xuXHRcdFx0Ly8gaWYgd2UgZ2V0IGEgYmFja3F1b3RlLCBpZ25vcmUgcXVvdGUgaW4gbmV4dCBjaGFyXG5cdFx0XHRpZiAoY2hhciA9PT0gXCJcXFxcXCIgJiYgdGV4dFt0ZXh0RW5kICsgMV0gPT09IHF1b3RlU3ltYm9sKSB0ZXh0RW5kKys7XG5cdFx0XHR0ZXh0RW5kKys7XG5cdFx0fVxuXHRcdC8vIEZvcmdldCBpdCBpZiB3ZSBkaWRuJ3QgZW5kIHdpdGggdGhlIHF1b3RlIHN5bWJvbFxuXHRcdGlmICh0ZXh0W3RleHRFbmRdICE9PSBxdW90ZVN5bWJvbCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHQvLyBhZHZhbmNlIHBhc3QgZW5kIHF1b3RlXG5cdFx0dGV4dEVuZCsrO1xuXG5cdFx0bGV0IHF1b3RlZFN0cmluZyA9IHRleHQuc2xpY2Uoc3RhcnQsIHRleHRFbmQpO1xuXHRcdGxldCB0b2tlbiA9IG5ldyBUb2tlbml6ZXIuVGV4dChxdW90ZWRTdHJpbmcpO1xuXHRcdHJldHVybiBbdG9rZW4sIHRleHRFbmRdO1xuXHR9LFxuXG5cdC8vIGBUZXh0YCBjbGFzcyBmb3Igc3RyaW5nIGxpdGVyYWxzLlxuXHQvLyBQYXNzIHRoZSBsaXRlcmFsIHZhbHVlLCB1c2UgYC50ZXh0YCB0byBnZXQganVzdCB0aGUgYml0IGluc2lkZSB0aGUgcXVvdGVzLlxuXHRUZXh0IDogY2xhc3MgdGV4dCB7XG5cdFx0Y29uc3RydWN0b3IocXVvdGVkU3RyaW5nKSB7XG5cdFx0XHR0aGlzLnF1b3RlZFN0cmluZyA9IHF1b3RlZFN0cmluZztcblx0XHR9XG5cdFx0Z2V0IHRleHQoKSB7XG5cdFx0XHRsZXQgc3RyaW5nID0gdGhpcy5xdW90ZWRTdHJpbmc7XG5cdFx0XHQvLyBjYWxjdWxhdGUgYHRleHRgIGFzIHRoZSBiaXRzIGJldHdlZW4gdGhlIHF1b3Rlcy5cblx0XHRcdGxldCBzdGFydCA9IDA7XG5cdFx0XHRsZXQgZW5kID0gc3RyaW5nLmxlbmd0aDtcblx0XHRcdGlmIChzdHJpbmdbc3RhcnRdID09PSAnXCInIHx8IHN0cmluZ1tzdGFydF0gPT09IFwiJ1wiKSBzdGFydCA9IDE7XG5cdFx0XHRpZiAoc3RyaW5nW2VuZC0xXSA9PT0gJ1wiJyB8fCBzdHJpbmdbZW5kLTFdID09PSBcIidcIikgZW5kID0gLTE7XG5cdFx0XHRyZXR1cm4gc3RyaW5nLnNsaWNlKHN0YXJ0LCBlbmQpO1xuXHRcdH1cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdHJldHVybiB0aGlzLnF1b3RlZFN0cmluZztcblx0XHR9XG5cdH0sXG5cblx0Ly9cblx0Ly9cdCMjIyBDb21tZW50c1xuXHQvL1xuXG5cdC8vIEVhdCBhIGNvbW1lbnQgKHVudGlsIHRoZSBlbmQgb2YgdGhlIGxpbmUpLlxuXHQvLyBSZXR1cm5zIGEgYFRva2VuaXplci5Db21tZW50YCBpZiBtYXRjaGVkLlxuXHRDT01NRU5UIDogL14oIyMrfC0tK3xcXC9cXC8rKShcXHMqKSguKikvLFxuXHRtYXRjaENvbW1lbnQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBjb21tZW50U3RhcnQgPSB0ZXh0LnNsaWNlKHN0YXJ0LCBzdGFydCArIDIpO1xuXHRcdGlmIChjb21tZW50U3RhcnQgIT09IFwiLS1cIiAmJiBjb21tZW50U3RhcnQgIT09IFwiXFwvXFwvXCIgJiYgY29tbWVudFN0YXJ0ICE9PSBcIiMjXCIpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBjb21tZW50IGVhdHMgdW50aWwgdGhlIGVuZCBvZiB0aGUgbGluZVxuXHRcdGxldCBsaW5lID0gdGhpcy5nZXRMaW5lQXRIZWFkKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGxldCBjb21tZW50TWF0Y2ggPSBsaW5lLm1hdGNoKHRoaXMuQ09NTUVOVClcblx0XHRpZiAoIWNvbW1lbnRNYXRjaCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBbbWF0Y2gsIGNvbW1lbnRTeW1ib2wsIHdoaXRlc3BhY2UsIGNvbW1lbnRdID0gY29tbWVudE1hdGNoO1xuXHRcdGxldCB0b2tlbiA9IG5ldyBUb2tlbml6ZXIuQ29tbWVudCh7IGNvbW1lbnRTeW1ib2wsIHdoaXRlc3BhY2UsIGNvbW1lbnQgfSk7XG5cdFx0cmV0dXJuIFt0b2tlbiwgc3RhcnQgKyBsaW5lLmxlbmd0aF07XG5cdH0sXG5cblx0Ly8gQ29tbWVudCBjbGFzc1xuLy9URVNUTUVcblx0Q29tbWVudCA6IGNsYXNzIGNvbW1lbnQge1xuXHRcdGNvbnN0cnVjdG9yIChwcm9wcykge1xuXHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBwcm9wcyk7XG5cdFx0fVxuXHRcdHRvU3RyaW5nKCkge1xuXHRcdFx0cmV0dXJuIGAke3RoaXMuY29tbWVudFN5bWJvbH0ke3RoaXMud2hpdGVzcGFjZX0ke3RoaXMuY29tbWVudH1gO1xuXHRcdH1cblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgSlNYXG5cdC8vXG5cblx0Ly8gRWF0IGEgKG5lc3RlZCkgSlNYIGV4cHJlc3Npb24uXG4vL1RFU1RNRVxuXHRtYXRjaEpTWEVsZW1lbnQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XSA9IHRoaXMubWF0Y2hKU1hTdGFydFRhZyh0ZXh0LCBzdGFydCwgZW5kKSB8fCBbXTtcblx0XHRpZiAoIWpzeEVsZW1lbnQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRpZiAoIWpzeEVsZW1lbnQuaXNVbmFyeVRhZykge1xuXHRcdFx0bGV0IFtjaGlsZHJlbiwgY2hpbGRFbmRdID0gdGhpcy5tYXRjaEpTWENoaWxkcmVuKGpzeEVsZW1lbnQudGFnTmFtZSwgdGV4dCwgbmV4dFN0YXJ0LCBlbmQpO1xuXHRcdFx0aWYgKGNoaWxkcmVuLmxlbmd0aCkge1xuXHRcdFx0XHRqc3hFbGVtZW50LmNoaWxkcmVuID0gY2hpbGRyZW47XG5cdFx0XHRcdG5leHRTdGFydCA9IGNoaWxkRW5kO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XTtcblx0fSxcblxuXHQvLyBNYXRjaCBKU1ggc3RhcnQgdGFnIGFuZCBpbnRlcm5hbCBlbGVtZW50cyAoYnV0IE5PVCBjaGlsZHJlbikuXG5cdC8vIFJldHVybnMgYFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdYCBvciBgdW5kZWZpbmVkYC5cblx0Ly8gVXNlIGBtYXRjaEpTWEVsZW1lbnQoKWAgdG8gbWF0Y2ggY2hpbGRyZW4sIGVuZCB0YWcsIGV0Yy5cblx0Ly8gSWdub3JlcyBsZWFkaW5nIHdoaXRlc3BhY2UuXG5cdEpTWF9UQUdfU1RBUlQgOiAvXjwoW0EtWmEtel1bXFx3LVxcLl0qKShcXHMqXFwvPnxcXHMqPnxcXHMrKS8sXG4vLyBUT0RPOiBjbGVhbiB0aGlzIHN0dWZmIHVwLCBtYXliZSB3aXRoIGZpbmRGaXJzdEF0SGVhZD9cblx0bWF0Y2hKU1hTdGFydFRhZyh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG5leHRTdGFydCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHQvLyBNYWtlIHN1cmUgd2Ugc3RhcnQgd2l0aCBgPGAuXG5cdFx0aWYgKHRleHRbbmV4dFN0YXJ0XSAhPT0gXCI8XCIpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgdGFnTWF0Y2ggPSB0aGlzLm1hdGNoRXhwcmVzc2lvbkF0SGVhZCh0aGlzLkpTWF9UQUdfU1RBUlQsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRpZiAoIXRhZ01hdGNoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IFsgbWF0Y2hUZXh0LCB0YWdOYW1lLCBlbmRCaXQgXSA9IHRhZ01hdGNoO1xuXHRcdGxldCBqc3hFbGVtZW50ID0gbmV3IFRva2VuaXplci5KU1hFbGVtZW50KHRhZ05hbWUpO1xuXHRcdG5leHRTdGFydCA9IG5leHRTdGFydCArIG1hdGNoVGV4dC5sZW5ndGg7XG5cblx0XHQvLyBJZiB1bmFyeSB0YWcsIG1hcmsgYXMgc3VjaCBhbmQgcmV0dXJuLlxuXHRcdGVuZEJpdCA9IGVuZEJpdC50cmltKCk7XG5cdFx0aWYgKGVuZEJpdCA9PT0gXCIvPlwiKSB7XG5cdFx0XHRqc3hFbGVtZW50LmlzVW5hcnlUYWcgPSB0cnVlO1xuXHRcdFx0cmV0dXJuIFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdO1xuXHRcdH1cblxuXHRcdC8vIElmIHdlIGRpZG4ndCBpbW1lZGlhdGVseSBnZXQgYW4gZW5kIG1hcmtlciwgYXR0ZW1wdCB0byBtYXRjaCBhdHRyaWJ1dGVzXG5cdFx0aWYgKGVuZEJpdCAhPT0gXCI+XCIgJiYgZW5kQml0ICE9PSBcIi8+XCIpIHtcblx0XHRcdGxldCBbIGF0dHJzLCBhdHRyRW5kIF0gPSB0aGlzLmVhdFRva2Vucyh0aGlzLm1hdGNoSlNYQXR0cmlidXRlLCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0XHRqc3hFbGVtZW50LmF0dHJpYnV0ZXMgPSBhdHRycztcblx0XHRcdG5leHRTdGFydCA9IGF0dHJFbmQ7XG5cdFx0fVxuXG5cdFx0Ly8gYXQgdGhpcyBwb2ludCB3ZSBzaG91bGQgZ2V0IGFuIGAvPmAgb3IgYD5gICh3aXRoIG5vIHdoaXRlc3BhY2UpLlxuXHRcdGlmICh0ZXh0W25leHRTdGFydF0gPT09IFwiL1wiICYmIHRleHRbbmV4dFN0YXJ0ICsgMV0gPT09IFwiPlwiKSB7XG5cdFx0XHRlbmRCaXQgPSBcIi8+XCI7XG5cdFx0XHRuZXh0U3RhcnQgKz0gMjtcblx0XHR9XG5cdFx0ZWxzZSBpZiAodGV4dFtuZXh0U3RhcnRdID09PSBcIj5cIikge1xuXHRcdFx0ZW5kQml0ID0gdGV4dFtuZXh0U3RhcnRdO1xuXHRcdFx0bmV4dFN0YXJ0ICs9IDE7XG5cdFx0fVxuXG5cdFx0Ly8gUmV0dXJuIGltbWVkaWF0ZWx5IGZvciB1bmFyeSB0YWdcblx0XHRpZiAoZW5kQml0ID09PSBcIi8+XCIpIHtcblx0XHRcdGpzeEVsZW1lbnQuaXNVbmFyeVRhZyA9IHRydWU7XG5cdFx0XHRyZXR1cm4gW2pzeEVsZW1lbnQsIG5leHRTdGFydF07XG5cdFx0fVxuXG5cdFx0Ly8gYWR2YW5jZSBwYXN0IGA+YFxuXHRcdGlmIChlbmRCaXQgIT09IFwiPlwiKSB7XG5cdFx0XHRpZiAoVG9rZW5pemVyLldBUk4pIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKFwiTWlzc2luZyBleHBlY3RlZCBlbmQgYD5gIGZvciBqc3hFbGVtZW50XCIsIGpzeEVsZW1lbnQsIFwiYFwiK3RleHQuc2xpY2Uoc3RhcnQsIG5leHRTdGFydCkrXCJgXCIpO1xuXHRcdFx0fVxuXHRcdFx0anN4RWxlbWVudC5lcnJvciA9IFwiTm8gZW5kID5cIjtcblx0XHRcdHJldHVybiBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XTtcblx0XHR9XG5cblx0XHRyZXR1cm4gW2pzeEVsZW1lbnQsIG5leHRTdGFydF07XG5cdH0sXG5cblxuXHQvLyBKU1ggZWxlbWVudCBjbGFzc1xuXHRKU1hFbGVtZW50IDogY2xhc3MganN4RWxlbWVudCB7XG5cdFx0Y29uc3RydWN0b3IodGFnTmFtZSwgYXR0cmlidXRlcywgY2hpbGRyZW4pIHtcblx0XHRcdHRoaXMudGFnTmFtZSA9IHRhZ05hbWU7XG5cdFx0XHRpZiAoYXR0cmlidXRlcykgdGhpcy5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcblx0XHRcdGlmIChjaGlsZHJlbikgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuXHRcdH1cblxuXHRcdC8vIFJldHVybiBhdHRyaWJ1dGVzIGFzIGEgbWFwLlxuLy9URVNUTUVcblx0XHRnZXQgYXR0cnMoKSB7XG5cdFx0XHRsZXQgYXR0cnMgPSB7fTtcblx0XHRcdGlmICh0aGlzLmF0dHJpYnV0ZXMpIHRoaXMuYXR0cmlidXRlcy5mb3JFYWNoKGF0dHIgPT4ge1xuXHRcdFx0XHQvLyBpZ25vcmUgdW5uYW1lZCBhdHRyaWJ1dGVzXG5cdFx0XHRcdGlmIChhdHRyLm5hbWUpIGF0dHJzW2F0dHIubmFtZV0gPSBhdHRyLnZhbHVlXG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBhdHRycztcblx0XHR9XG5cblx0XHQvLyBSZXR1cm4gb3VyIGF0dHJpYnV0ZXMgYXMgYSBzdHJpbmdcbi8vVEVTVE1FXG5cdFx0Z2V0IGF0dHJzQXNTdHJpbmcoKSB7XG5cdFx0XHRpZiAoIXRoaXMuYXR0cmlidXRlcykgcmV0dXJuIFwiXCI7XG5cdFx0XHRyZXR1cm4gXCIgXCIgKyB0aGlzLmF0dHJpYnV0ZXMubWFwKCAoeyBuYW1lLCB2YWx1ZSB9KSA9PiB7XG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gbmFtZTtcblx0XHRcdFx0Ly8gY29udmVydCB2YWx1ZSBhcnJheSAodG9rZW5zKSB0byBzdHJpbmdcblx0XHRcdFx0Ly8gVE9ETzogdGhpcyB3aWxsIHdhbnQgdG8gYmUgc21hcnRlci4uLlxuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHZhbHVlID0gYHske3ZhbHVlLmpvaW4oXCIgXCIpfX1gO1xuXHRcdFx0XHRyZXR1cm4gYG5hbWU9JHt2YWx1ZX1gO1xuXHRcdFx0fSkuam9pbihcIiBcIik7XG5cdFx0fVxuXG5cdFx0Ly8gUmV0dXJuIG91ciBjaGlsZHJlbiBhcyBhIHN0cmluZy5cbi8vVEVTVE1FXG5cdFx0Z2V0IGNoaWxkcmVuQXNTdHJpbmcoKSB7XG5cdFx0XHRpZiAoIXRoaXMuY2hpbGRyZW4pIHJldHVybiBcIlwiO1xuXHRcdFx0cmV0dXJuIHRoaXMuY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY2hpbGQpKSByZXR1cm4gYHske2NoaWxkLmpvaW4oXCIgXCIpfX1gO1xuXHRcdFx0XHRyZXR1cm4gXCJcIiArIGNoaWxkO1xuXHRcdFx0fSkuam9pbihcIlwiKTtcblx0XHR9XG5cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdGxldCBhdHRycyA9IHRoaXMuYXR0cnNBc1N0cmluZztcblx0XHRcdGxldCBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW5Bc1N0cmluZztcblx0XHRcdGlmICh0aGlzLmlzVW5hcnlUYWcpIHJldHVybiBgPCR7dGhpcy50YWdOYW1lfSR7YXR0cnN9Lz5gO1xuXHRcdFx0cmV0dXJuIGA8JHt0aGlzLnRhZ05hbWV9JHthdHRyc30+JHtjaGlsZHJlbn08LyR7dGhpcy50YWdOYW1lfT5gO1xuXHRcdH1cblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgSlNYIGNoaWxkcmVuXG5cdC8vXG5cblx0Ly8gTWF0Y2ggSlNYIGVsZW1lbnQgY2hpbGRyZW4gb2YgYDx0YWdOYW1lPmAgYXQgYHRleHRbc3RhcnRdYC5cblx0Ly8gTWF0Y2hlcyBuZXN0ZWQgY2hpbGRyZW4gYW5kIHN0b3BzIGFmdGVyIG1hdGNoaW5nIGVuZCB0YWc6IGA8L3RhZ05hbWU+YC5cblx0Ly8gUmV0dXJucyBgW2NoaWxkcmVuLCBuZXh0U3RhcnRdYC5cbi8vVEVTVE1FXG5cdG1hdGNoSlNYQ2hpbGRyZW4odGFnTmFtZSwgdGV4dCwgc3RhcnQsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IGNoaWxkcmVuID0gW107XG5cdFx0bGV0IG5lc3RpbmcgPSAxO1xuXHRcdGxldCBlbmRUYWcgPSBgPC8ke3RhZ05hbWV9PmA7XG5cblx0XHRsZXQgbmV4dFN0YXJ0ID0gc3RhcnQ7XG5cdFx0d2hpbGUodHJ1ZSkge1xuXHRcdFx0bGV0IHJlc3VsdCA9IHRoaXMubWF0Y2hKU1hDaGlsZChlbmRUYWcsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRcdGlmICghcmVzdWx0KSBicmVhaztcblxuXHRcdFx0bGV0IFtjaGlsZCwgY2hpbGRFbmRdID0gcmVzdWx0O1xuXHRcdFx0bmV4dFN0YXJ0ID0gY2hpbGRFbmQ7XG5cdFx0XHQvLyBJZiB3ZSBnb3QgdGhlIGVuZFRhZywgdXBkYXRlIG5lc3RpbmcgYW5kIGJyZWFrIG91dCBvZiBsb29wIGlmIG5lc3RpbmcgIT09IDBcblx0XHRcdGlmIChjaGlsZCA9PT0gZW5kVGFnKSB7XG5cdFx0XHRcdG5lc3RpbmcgLS07XG5cdFx0XHRcdGlmIChuZXN0aW5nID09PSAwKSBicmVhaztcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYgKGNoaWxkKSBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcblx0XHRcdH1cblx0XHR9XG4vLyBUT0RPOiBob3cgdG8gc3VyZmFjZSB0aGlzIGVycm9yPz8/XG5cdFx0aWYgKG5lc3RpbmcgIT09IDApIHtcblx0XHRcdGlmIChUb2tlbml6ZXIuV0FSTikge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oYG1hdGNoSlNYQ2hpbGRyZW4oJHt0ZXh0LnNsaWNlKHN0YXJ0LCBuZXh0U3RhcnQgKyAxMCl9OiBkaWRuJ3QgbWF0Y2ggZW5kIGNoaWxkIWApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gW2NoaWxkcmVuLCBuZXh0U3RhcnRdO1xuXHR9LFxuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIEpTWCBjaGlsZDpcblx0Ly9cdC0gY3VycmVudCBlbmRUYWdcblx0Ly9cdC0gYHsganN4IGV4cHJlc3Npb24gfWBcblx0Ly9cdC0gbmVzdGVkIEpTWCBlbGVtZW50XG5cdC8vXHQtIChhbnl0aGluZyBlbHNlKSBhcyBqc3hUZXh0IGV4cHJlc3Npb24uXG5cdG1hdGNoSlNYQ2hpbGQoZW5kVGFnLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdHJldHVybiB0aGlzLm1hdGNoSlNYRW5kVGFnKGVuZFRhZywgdGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hKU1hFeHByZXNzaW9uKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoSlNYRWxlbWVudCh0ZXh0LCBzdGFydCwgZW5kKVxuLy8gVE9ETzogbmV3bGluZSBhbmQgaW5kZW50P1xuXHRcdFx0fHwgdGhpcy5tYXRjaEpTWFRleHQodGV4dCwgc3RhcnQsIGVuZCk7XG5cdH0sXG5cblx0Ly8gQXR0ZW1wdCB0byBtYXRjaCBhIHNwZWNpZmljIGVuZCB0YWcuXG5cdC8vIElnbm9yZXMgbGVhZGluZyB3aGl0ZXNwYWNlLlxuXHRtYXRjaEpTWEVuZFRhZyhlbmRUYWcsIHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbmV4dFN0YXJ0ID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGlmICghdGhpcy5tYXRjaFN0cmluZ0F0SGVhZChlbmRUYWcsIHRleHQsIG5leHRTdGFydCwgZW5kKSkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gW2VuZFRhZywgbmV4dFN0YXJ0ICsgZW5kVGFnLmxlbmd0aF07XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIEpTWCBhdHRyaWJ1dGVzXG5cdC8vXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgSlNYIGVsZW1lbnQgYXR0cmlidXRlIGFzIGA8YXR0cj49ezx2YWx1ZT59YFxuLy8gVE9ETzogey4uLnh4eH1cblx0SlNYX0FUVFJJQlVURV9TVEFSVCA6IC9eXFxzKihbXFx3LV0rXFxiKVxccyooPT8pXFxzKi8sXG5cdG1hdGNoSlNYQXR0cmlidXRlKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBhdHRyaWJ1dGVzIG11c3Qgc3RhcnQgd2l0aCBhIHdvcmQgY2hhcmFjdGVyXG5cdFx0aWYgKCF0aGlzLldPUkRfU1RBUlQudGVzdCh0ZXh0W3N0YXJ0XSkpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBhdHRlbXB0IHRvIG1hdGNoIGFuIGF0dHJpYnV0ZSBuYW1lLCBpbmNsdWRpbmcgYD1gIGlmIHByZXNlbnQuXG5cdFx0bGV0IHJlc3VsdCA9IHRoaXMubWF0Y2hFeHByZXNzaW9uQXRIZWFkKHRoaXMuSlNYX0FUVFJJQlVURV9TVEFSVCwgdGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0aWYgKCFyZXN1bHQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgWyBtYXRjaCwgbmFtZSwgZXF1YWxzIF0gPSByZXN1bHQ7XG5cdFx0bGV0IG5leHRTdGFydCA9IHN0YXJ0ICsgbWF0Y2gubGVuZ3RoO1xuXHRcdGxldCBhdHRyaWJ1dGUgPSBuZXcgVG9rZW5pemVyLkpTWEF0dHJpYnV0ZShuYW1lKTtcblxuXHRcdC8vIGlmIHRoZXJlIHdhcyBhbiBlcXVhbHMgY2hhciwgcGFyc2UgdGhlIHZhbHVlXG5cdFx0aWYgKGVxdWFscykge1xuXHRcdFx0bGV0IFt2YWx1ZSwgdmFsdWVFbmRdID0gdGhpcy5tYXRjaEpTWEF0dHJpYnV0ZVZhbHVlKHRleHQsIG5leHRTdGFydCwgZW5kKSB8fCBbXTtcblx0XHRcdGlmICh2YWx1ZSkge1xuXHRcdFx0XHRhdHRyaWJ1dGUudmFsdWUgPSB2YWx1ZTtcblx0XHRcdFx0bmV4dFN0YXJ0ID0gdmFsdWVFbmQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGVhdCB3aGl0ZXNwYWNlIGJlZm9yZSB0aGUgbmV4dCBhdHRyaWJ1dGUgLyB0YWcgZW5kXG5cdFx0bmV4dFN0YXJ0ID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRyZXR1cm4gW2F0dHJpYnV0ZSwgbmV4dFN0YXJ0XTtcblx0fSxcblxuXHQvLyBNYXRjaCBhIHZhbHVlIGV4cHJlc3Npb24gZm9yIGEgSlNYIGVsZW1lbnQgYXR0cmlidXRlOlxuXHQvLyBOT1RFOiB3ZSB3aWxsIGJlIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlciB0aGUgYD1gIChhbmQgc3Vic2VxdWVudCB3aGl0ZXNwYWNlKS5cblx0bWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZSh0ZXh0LCBzdGFydCwgZW5kKSB7XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hUZXh0KHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoSlNYRXhwcmVzc2lvbih0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0fHwgdGhpcy5tYXRjaEpTWEVsZW1lbnQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZUlkZW50aWZpZXIodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hOdW1iZXIodGV4dCwgc3RhcnQsIGVuZClcblx0XHQ7XG5cdH0sXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgaWRlbnRpZmVyIGFzIGEgSlNYIGF0dHJpYnV0ZSB2YWx1ZS5cblx0Ly8gUmV0dXJucyBhcyBhIGBKU1hFeHByZXNzaW9uYC5cblx0bWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZUlkZW50aWZpZXIodGV4dCwgc3RhcnQsIGVuZCkge1xuXHRcdGxldCByZXN1bHQgPSB0aGlzLm1hdGNoV29yZCh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRpZiAoIXJlc3VsdCkgcmV0dXJuO1xuXG5cdFx0bGV0IFsgd29yZCwgbmV4dFN0YXJ0IF0gPSByZXN1bHQ7XG5cdFx0bGV0IHRva2VuID0gbmV3IFRva2VuaXplci5KU1hFeHByZXNzaW9uKHdvcmQpO1xuXHRcdHJldHVybiBbdG9rZW4sIG5leHRTdGFydF07XG5cdH0sXG5cblx0Ly8gSlNYIGF0dHJpYnV0ZSBjbGFzc1xuXHQvLyBgbmFtZWAgaXMgdGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZS5cblx0Ly8gYHZhbHVlYCBpcyBvbmUgb2Y6XG5cdC8vXHRcdC0gYCcuLi4nYFx0XHRcdC8vIFRleHQgKGxpdGVyYWwgc3RyaW5nKS5cblx0Ly9cdFx0LSBgXCIuLi5cImBcdFx0XHQvLyBUZXh0IChsaXRlcmFsIHN0cmluZykuXG5cdC8vXHRcdC0gYHsuLi59YFx0XHRcdC8vIEV4cHJlc3Npb24uICBSZXN1bHRzIHdpbGwgYmUgdG9rZW5pemVkIGFycmF5LlxuXHQvL1x0XHQtIGA8Li4uLj5gXHRcdFx0Ly8gSlNYIGVsZW1lbnQuXG5cdC8vXHRcdC0gYDFgXHRcdFx0XHQvLyBOdW1iZXIuICBOb3RlOiB0aGlzIGlzIGFuIGV4dGVuc2lvbiB0byBKU1guXG5cblx0SlNYQXR0cmlidXRlIDogY2xhc3MganN4QXR0cmlidXRlIHtcblx0XHRjb25zdHJ1Y3RvcihuYW1lLCB2YWx1ZSkge1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZTtcblx0XHRcdGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB0aGlzLnZhbHVlID0gdmFsdWU7XG5cdFx0fVxuXHRcdHRvU3RyaW5nKCkge1xuXHRcdFx0aWYgKHRoaXMudmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHRoaXMubmFtZTtcblx0XHRcdHJldHVybiBgJHt0aGlzLm5hbWV9PXske3RoaXMudmFsdWV9fWA7XG5cdFx0fVxuXHR9LFxuXG5cblx0Ly8gTWF0Y2ggYSBKU1ggZXhwcmVzc2lvbiBlbmNsb3NlZCBpbiBjdXJseSBicmFjZXMsIGVnOiAgYHsgLi4uIH1gLlxuXHQvLyAgSGFuZGxlcyBuZXN0ZWQgY3VybGllcywgcXVvdGVzLCBldGMuXG5cdC8vIFJldHVybnMgYXJyYXkgb2YgdG9rZW5zIG9mIGludGVybmFsIG1hdGNoLlxuXHQvLyBJZ25vcmVzIGxlYWRpbmcgd2hpdGVzcGFjZS5cbi8vVE9ETzogbmV3bGluZXMvaW5kZW50cz8/P1xuLy9UT0RPOiB7Li4ueHh4fVxuLy9URVNUTUVcblx0bWF0Y2hKU1hFeHByZXNzaW9uKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbmV4dFN0YXJ0ID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGxldCBlbmRJbmRleCA9IHRoaXMuZmluZE1hdGNoaW5nQXRIZWFkKFwie1wiLCBcIn1cIiwgdGV4dCwgbmV4dFN0YXJ0LCBlbmQpO1xuXHRcdGlmIChlbmRJbmRleCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gR2V0IGNvbnRlbnRzLCBpbmNsdWRpbmcgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZS5cblx0XHRsZXQgY29udGVudHMgPSB0ZXh0LnNsaWNlKHN0YXJ0ICsgMSwgZW5kSW5kZXgpO1xuXG5cdFx0Ly8gcmV0dXJuIGEgbmV3IEpTWEV4cHJlc3Npb24sIGFkdmFuY2luZyBiZXlvbmQgdGhlIGVuZGluZyBgfWAuXG5cdFx0bGV0IGV4cHJlc3Npb24gPSBuZXcgVG9rZW5pemVyLkpTWEV4cHJlc3Npb24oY29udGVudHMpO1xuXHRcdHJldHVybiBbZXhwcmVzc2lvbiwgZW5kSW5kZXggKyAxXTtcblx0fSxcblxuXHQvLyBKU1ggZXhwcmVzc2lvbiwgY29tcG9zZWQgb2YgaW5saW5lIHRva2VucyB3aGljaCBzaG91bGQgeWllbGQgYW4gYGV4cHJlc3Npb25gLlxuXHRKU1hFeHByZXNzaW9uIDogY2xhc3MganN4RXhwcmVzc2lvbiB7XG5cdFx0Y29uc3RydWN0b3IoY29udGVudHMpIHtcblx0XHRcdHRoaXMuY29udGVudHMgPSBjb250ZW50cyB8fCBcIlwiO1xuXHRcdH1cblx0XHQvLyBEaXZpZGUgY29udGVudHMgaW50byBgdG9rZW5zYC5cblx0XHRnZXQgdG9rZW5zKCkge1xuXHRcdFx0cmV0dXJuIFRva2VuaXplci50b2tlbml6ZSh0aGlzLmNvbnRlbnRzLnRyaW0oKSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8vIE1hdGNoIEpTWFRleHQgdW50aWwgdGhlIG9uZSBvZiBge2AsIGA8YCwgYD5gIG9yIGB9YC5cblx0Ly8gTk9URTogSU5DTFVERVMgbGVhZGluZyAvIHRyYWlsaW5nIHdoaXRlc3BhY2UuXG5cdEpTWF9URVhUX0VORF9DSEFSUyA6IFtcIntcIiwgXCI8XCIsIFwiPlwiLCBcIn1cIl0sXG4vL1RFU1RNRVxuXHRtYXRjaEpTWFRleHQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIHRlbXBvcmFyaWx5IGFkdmFuY2UgcGFzdCB3aGl0ZXNwYWNlICh3ZSdsbCBpbmNsdWRlIGl0IGluIHRoZSBvdXRwdXQpLlxuXHRcdGxldCBuZXh0U3RhcnQgPSB0aGlzLmVhdFdoaXRlc3BhY2UodGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0bGV0IGVuZEluZGV4ID0gdGhpcy5maW5kRmlyc3RBdEhlYWQodGhpcy5KU1hfVEVYVF9FTkRfQ0hBUlMsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHQvLyBJZiB0aGUgZmlyc3Qgbm9uLXdoaXRlc3BhY2UgY2hhciBpcyBpbiBvdXIgRU5EX0NIQVJTLCBmb3JnZXQgaXQuXG5cdFx0aWYgKGVuZEluZGV4ID09PSBuZXh0U3RhcnQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBpZiBubyBtYXRjaCwgd2UndmUgZ290IHNvbWUgc29ydCBvZiBlcnJvclxuXHRcdGlmIChlbmRJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZiAoVG9rZW5pemVyLldBUk4pIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKFwibWF0Y2hKU1hUZXh0KFwiK3RleHQuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgNTApK1wiKTogSlNYIHNlZW1zIHRvIGJlIHVuYmFsYW5jZWQuXCIpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHQvLyBpbmNsdWRlIGxlYWRpbmcgd2hpdGVzcGFjZSBpbiB0aGUgb3V0cHV0LlxuXHRcdGxldCBqc3hUZXh0ID0gdGV4dC5zbGljZShzdGFydCwgZW5kSW5kZXgpO1xuXHRcdHJldHVybiBbanN4VGV4dCwgZW5kSW5kZXhdO1xuXHR9LFxuXG5cblxuXG5cdC8vXG5cdC8vXHQjIyBVdGlsaXR5IGZ1bmN0aW9uc1xuXHQvL1xuXG5cdC8vIFJldHVybiBjaGFyYWN0ZXJzIHVwIHRvLCBidXQgbm90IGluY2x1ZGluZywgdGhlIG5leHQgbmV3bGluZSBjaGFyIGFmdGVyIGBzdGFydGAuXG5cdC8vIElmIGBzdGFydGAgaXMgYSBuZXdsaW5lIGNoYXIgb3Igc3RhcnQgPj0gZW5kLCByZXR1cm5zIGVtcHR5IHN0cmluZy5cblx0Ly8gSWYgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nIChlZzogbm8gbW9yZSBuZXdsaW5lcyksIHJldHVybnMgZnJvbSBzdGFydCB0byBlbmQuXG4vL1RFU1RNRVxuXHRnZXRMaW5lQXRIZWFkKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiBcIlwiO1xuXG5cdFx0bGV0IG5ld2xpbmUgPSB0ZXh0LmluZGV4T2YoXCJcXG5cIiwgc3RhcnQpO1xuXHRcdGlmIChuZXdsaW5lID09PSAtMSB8fCBuZXdsaW5lID4gZW5kKSBuZXdsaW5lID0gZW5kO1xuXHRcdHJldHVybiB0ZXh0LnNsaWNlKHN0YXJ0LCBuZXdsaW5lKTtcblx0fSxcblxuXHQvLyBNYXRjaCBhIG11bHRpLWNoYXIgc3RyaW5nIHN0YXJ0aW5nIGF0IGB0ZXh0W3N0YXJ0XWAuXG4vL1RFU1RNRVxuXHRtYXRjaFN0cmluZ0F0SGVhZChzdHJpbmcsIHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgc3RyaW5nRW5kID0gc3RhcnQgKyBzdHJpbmcubGVuZ3RoO1xuXHRcdGlmIChzdHJpbmdFbmQgPiBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHN0cmluZyA9PT0gdGV4dC5zbGljZShzdGFydCwgc3RyaW5nRW5kKTtcblx0fSxcblxuXG5cdC8vIE1hdGNoIGEgcmVndWxhciBleHByZXNzaW9uIHN0YXJ0aW5nIGF0IGB0ZXh0W3N0YXJ0XWAsIHJldHVybmluZyB0aGUgbWF0Y2guXG5cdC8vIFJldHVybnMgYG51bGxgIGlmIG5vIG1hdGNoLlxuXHQvL1xuXHQvLyBOT1RFOiBUaGUgZXhwcmVzc2lvbiBNVVNUIHN0YXJ0IHdpdGggYC9eLi4uL2Bcbi8vVEVTVE1FXG5cdG1hdGNoRXhwcmVzc2lvbkF0SGVhZChleHByZXNzaW9uLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IGhlYWQgPSB0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpO1xuXHRcdHJldHVybiBoZWFkLm1hdGNoKGV4cHJlc3Npb24pO1xuXHR9LFxuXG5cdC8vIEZpbmQgaW5kZXggb2YgdGhlIG1hdGNoaW5nIFNJTkdMRSBDSEFSQUNURVIgYGVuZERlbGltaXRlcmAgdG8gbWF0Y2ggYHN0YXJ0RGVsaW1pdGVyYC5cblx0Ly8gTWF0Y2hlcyBuZXN0ZWQgZGVsaW1pdGVycyBhbmQgaGFuZGxlcyBlc2NhcGVkIGRlbGltaXRlcnMuXG5cdC8vIEFzc3VtZXMgYHRleHRbc3RhcnRdYCBpcyB0aGUgc3RhcnREZWxpbWl0ZXIhXG5cdC8vIFJldHVybnMgbnVtZXJpYyBpbmRleCBvciBgdW5kZWZpbmVkYCBpZiBubyBtYXRjaCBvciBpZiBmaXJzdCBjaGFyIGlzIG5vdCBgc3RhcnREZWxpbWl0ZXJgLlxuXHQvL1xuXHQvL1x0QWxzbyBoYW5kbGVzIG5lc3RlZCBxdW90ZXMgLS0gaWYgd2UgZW5jb3VudGVyIGEgc2luZ2xlIG9yIGRvdWJsZSBxdW90ZSxcblx0Ly9cdFx0d2UnbGwgc2tpcCBzY2FubmluZyB1bnRpbCB3ZSBmaW5kIGEgbWF0Y2hpbmcgcXVvdGUuXG5cdC8vXG5cdC8vXHRlZzogIGBmaW5kTWF0Y2hpbmdBdEhlYWQoXCJ7XCIsIFwifVwiLCBcInthYXthfWFhfVwiKWAgPT4gOFxuLy9URVNUTUVcblx0ZmluZE1hdGNoaW5nQXRIZWFkKHN0YXJ0RGVsaW1pdGVyLCBlbmREZWxpbWl0ZXIsIHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRpZiAodGV4dFtzdGFydF0gIT09IHN0YXJ0RGVsaW1pdGVyKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG5lc3RpbmcgPSAwO1xuXHRcdGxldCBjdXJyZW50ID0gc3RhcnQ7XG5cdFx0d2hpbGUgKGN1cnJlbnQgPCBlbmQpIHtcblx0XHRcdGxldCBjaGFyID0gdGV4dFtjdXJyZW50XTtcblx0XHRcdC8vIGlmIHN0YXJ0RGVsaW1pdGVyLCBpbmNyZWFzZSBuZXN0aW5nXG5cdFx0XHRpZiAoY2hhciA9PT0gc3RhcnREZWxpbWl0ZXIpIHtcblx0XHRcdFx0bmVzdGluZysrO1xuXHRcdFx0fVxuXHRcdFx0Ly8gaWYgZW5kRGVsaW1pdGVyLCBkZWNyZWFzZSBuZXN0aW5nIGFuZCByZXR1cm4gaWYgbmVzdGluZyBiYWNrIHRvIDBcblx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IGVuZERlbGltaXRlcikge1xuXHRcdFx0XHRuZXN0aW5nLS07XG5cdFx0XHRcdGlmIChuZXN0aW5nID09PSAwKSByZXR1cm4gY3VycmVudDtcblx0XHRcdH1cblx0XHRcdC8vIGlmIGEgc2luZ2xlIG9yIGRvdWJsZSBxdW90ZSwgc2tpcCB1bnRpbCB0aGUgbWF0Y2hpbmcgcXVvdGVcblx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFwiJ1wiIHx8IGNoYXIgPT09ICdcIicpIHtcblx0XHRcdFx0bGV0IFt0b2tlbiwgYWZ0ZXJRdW90ZV0gPSB0aGlzLm1hdGNoVGV4dCh0ZXh0LCBjdXJyZW50LCBlbmQpIHx8IFtdO1xuXHRcdFx0XHRjdXJyZW50ID0gYWZ0ZXJRdW90ZTtcblx0XHRcdFx0Y29udGludWU7XHQvLyBjb250aW51ZSBzbyB3ZSBkb24ndCBhZGQgMSB0byBjdXJlbnQgYmVsb3dcblx0XHRcdH1cblx0XHRcdC8vIElmIGJhY2tzbGFzaCwgc2tpcCBhbiBleHRyYSBjaGFyIGlmIGl0J3MgZWl0aGVyIGRlbGltaXRlciBvciBhIHF1b3RlXG5cdFx0XHRlbHNlIGlmIChjaGFyID09PSBcIlxcXFxcIikge1xuXHRcdFx0XHRjaGFyID0gdGV4dFtjdXJyZW50ICsgMV07XG5cdFx0XHRcdGlmIChjaGFyID09PSBzdGFydERlbGltaXRlclxuXHRcdFx0XHQgfHwgY2hhciA9PT0gZW5kRGVsaW1pdGVyXG5cdFx0XHRcdCB8fCBjaGFyID09PSBcIidcIlxuXHRcdFx0XHQgfHwgY2hhciA9PT0gJ1wiJ1xuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRjdXJyZW50Kys7O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjdXJyZW50Kys7XG5cdFx0fVxuXHR9LFxuXG5cblx0Ly8gUmV0dXJuIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgTk9OLUVTQ0FQRUQgY2hhcmFjdGVyIGluIGBjaGFyc2AgYWZ0ZXIgYHRleHRbc3RhcnRdYC5cblx0Ly8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiB3ZSBkaWRuJ3QgZmluZCBhIG1hdGNoLlxuLy9URVNUTUVcblx0ZmluZEZpcnN0QXRIZWFkKGNoYXJzLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0d2hpbGUgKHN0YXJ0IDwgZW5kKSB7XG5cdFx0XHRsZXQgY2hhciA9IHRleHRbc3RhcnRdO1xuXHRcdFx0aWYgKGNoYXJzLmluY2x1ZGVzKGNoYXIpKSByZXR1cm4gc3RhcnQ7XG5cdFx0XHQvLyBpZiB3ZSBnb3QgYW4gZXNjYXBlIGNoYXIsIGlnbm9yZSB0aGUgbmV4dCBjaGFyIGlmIGl0J3MgaW4gYGNoYXJzYFxuXHRcdFx0aWYgKGNoYXIgPT09IFwiXFxcXFwiICYmIGNoYXJzLmluY2x1ZGVzKHRleHRbc3RhcnQrMV0pKSBzdGFydCsrO1xuXHRcdFx0c3RhcnQrKztcblx0XHR9XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gc3RhcnQ7XG5cdH0sXG5cblxuLy9cbi8vICMjIyBVdGlsaXR5XG4vL1xuXG5cdC8vIEdpdmVuIGEgc2V0IG9mIHRva2Vucywgc2xpY2Ugd2hpdGVzcGFjZSAoaW5kZW50LCBORVdMSU5FIG9yIG5vcm1hbCB3aGl0ZXNwYWNlKSBmcm9tIHRoZSBmcm9udC5cblx0cmVtb3ZlTGVhZGluZ1doaXRlc3BhY2UodG9rZW5zLCBzdGFydCA9IDApIHtcblx0XHR3aGlsZSAodG9rZW5zW3N0YXJ0XSBpbnN0YW5jZW9mIFRva2VuaXplci5XaGl0ZXNwYWNlKSBzdGFydCsrO1xuXHRcdGlmIChzdGFydCA9PT0gMCkgcmV0dXJuIHRva2Vucztcblx0XHRyZXR1cm4gdG9rZW5zLnNsaWNlKHN0YXJ0KTtcblx0fSxcblxuXHQvLyBHaXZlbiBhIHNldCBvZiB0b2tlbnMsIHJlbW92ZSBBTEwgXCJub3JtYWxcIiB3aGl0ZXNwYWNlIHRva2VucyAoTk9UIGluZGVudCBvciBORVdMSU5FKS5cblx0cmVtb3ZlTm9ybWFsV2hpdGVzcGFjZSh0b2tlbnMpIHtcblx0XHRyZXR1cm4gdG9rZW5zLmZpbHRlcih0b2tlbiA9PiAhVG9rZW5pemVyLmlzTm9ybWFsV2hpdGVzcGFjZSh0b2tlbikpO1xuXHR9LFxuXG5cblx0Ly8gUmV0dXJuIGB0cnVlYCBpZiBgdG9rZW5gIGlzIFwibm9ybWFsXCIgd2hpdGVzcGNlIChub3QgYSBuZXdsaW5lIG9yIGluZGVudClcblx0aXNOb3JtYWxXaGl0ZXNwYWNlKHRva2VuKSB7XG5cdFx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLldoaXRlc3BhY2Vcblx0XHRcdCYmICEodG9rZW4gaW5zdGFuY2VvZiBUb2tlbml6ZXIuSW5kZW50KVxuXHRcdFx0JiYgKHRva2VuICE9PSBUb2tlbml6ZXIuTkVXTElORSk7XG5cdH0sXG5cblxuLy9cbi8vICMjIyBCbG9jayAvIGluZGVudCBwcm9jZXNzaW5nXG4vL1xuXG5cdC8vIFNpbXBsZSBibG9jayBjbGFzcyBmb3IgYGJyZWFrSW50b0Jsb2Nrc2AuXG5cdEJsb2NrOiBjbGFzcyBibG9jayB7XG5cdFx0Y29uc3RydWN0b3IocHJvcHMpe1xuXHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBwcm9wcyk7XG5cdFx0XHRpZiAoIXRoaXMuY29udGVudHMpIHRoaXMuY29udGVudHMgPSBbXTtcblx0XHR9XG5cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLCBudWxsLCBcIlxcdFwiKTtcblx0XHR9XG5cdH0sXG5cblx0Ly8gQnJlYWsgdG9rZW5zIGludG8gYW4gYXJyYXkgb2YgYXJyYXlzIGJ5IGBORVdMSU5FYHMuXG5cdC8vIFJldHVybnMgYW4gYXJyYXkgb2YgbGluZXMgV0lUSE9VVCB0aGUgYE5FV0xJTkVgcy5cblx0Ly8gTGluZXMgd2hpY2ggYXJlIGNvbXBvc2VkIHNvbGVseSBvZiB3aGl0ZXNwYWNlIGFyZSB0cmVhdGVkIGFzIGJsYW5rLlxuXHRicmVha0ludG9MaW5lcyh0b2tlbnMpIHtcblx0XHQvLyBDb252ZXJ0IHRvIGxpbmVzLlxuXHRcdGxldCBjdXJyZW50TGluZSA9IFtdO1xuXHRcdGxldCBsaW5lcyA9IFtjdXJyZW50TGluZV07XG5cdFx0dG9rZW5zLmZvckVhY2godG9rZW4gPT4ge1xuXHRcdFx0Ly8gYWRkIG5ldyBhcnJheSBmb3IgZWFjaCBuZXdsaW5lXG5cdFx0XHRpZiAodG9rZW4gPT09IFRva2VuaXplci5ORVdMSU5FKSB7XG5cdFx0XHRcdC8vIGNyZWF0ZSBhIG5ldyBsaW5lIGFuZCBwdXNoIGl0IGluXG5cdFx0XHRcdGN1cnJlbnRMaW5lID0gW107XG5cdFx0XHRcdHJldHVybiBsaW5lcy5wdXNoKGN1cnJlbnRMaW5lKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gb3RoZXJ3aXNlIGp1c3QgYWRkIHRvIHRoZSBjdXJyZW50IGxpbmVcblx0XHRcdGN1cnJlbnRMaW5lLnB1c2godG9rZW4pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQ2xlYXIgYW55IGxpbmVzIHRoYXQgYXJlIG9ubHkgd2hpdGVzcGFjZVxuXHRcdGxpbmVzLmZvckVhY2goKGxpbmUsIGluZGV4KSA9PiB7XG5cdFx0XHRpZiAobGluZS5sZW5ndGggPT09IDEgJiYgbGluZVswXSBpbnN0YW5jZW9mIFRva2VuaXplci5XaGl0ZXNwYWNlKSBsaW5lc1tpbmRleF0gPSBbXTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBsaW5lcztcblx0fSxcblxuXHQvLyBSZXR1cm4gaW5kZW50cyBvZiB0aGUgc3BlY2lmaWVkIGxpbmVzLlxuXHQvLyBJbmRlbnRzIGVtcHR5IGxpbmVzIChORVdMSU5FcykgaW50byB0aGUgYmxvY2sgQUZURVIgdGhleSBhcHBlYXIuXG5cdGdldExpbmVJbmRlbnRzKGxpbmVzLCBkZWZhdWx0SW5kZW50ID0gMCkge1xuXHRcdGlmIChsaW5lcy5sZW5ndGggPT09IDApIHJldHVybiBbXTtcblxuXHRcdGNvbnN0IGluZGVudHMgPSBsaW5lcy5tYXAoVG9rZW5pemVyLmdldExpbmVJbmRlbnQpO1xuXHRcdGNvbnN0IGVuZCA9IGluZGVudHMubGVuZ3RoO1xuXG5cdFx0Ly8gZmlndXJlIG91dCB0aGUgaW5kZW50IG9mIHRoZSBmaXJzdCBub24tZW1wdHkgbGluZVxuXHRcdGxldCBzdGFydEluZGVudCA9IGdldE5leHRJbmRlbnQoMCk7XG5cdFx0aWYgKHN0YXJ0SW5kZW50ID09PSB1bmRlZmluZWQpIHN0YXJ0SW5kZW50ID0gZGVmYXVsdEluZGVudDtcblxuXHRcdC8vIGluZGVudCBibGFuayBsaW5lcyB0byB0aGUgaW5kZW50IEFGVEVSIHRoZW1cblx0XHRmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgZW5kOyBpbmRleCsrKSB7XG5cdFx0XHRpZiAoaW5kZW50c1tpbmRleF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpbmRlbnRzW2luZGV4XSA9IGdldE5leHRJbmRlbnQoaW5kZXggKyAxKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGluZGVudHM7XG5cblx0XHQvLyBSZXR1cm4gdGhlIHZhbHVlIG9mIHRoZSBORVhUIG5vbi11bmRlZmluZWQgaW5kZW50LlxuXHRcdGZ1bmN0aW9uIGdldE5leHRJbmRlbnQoaW5kZXgpIHtcblx0XHRcdHdoaWxlIChpbmRleCA8IGVuZCkge1xuXHRcdFx0XHRpZiAoaW5kZW50c1tpbmRleF0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIGluZGVudHNbaW5kZXhdO1xuXHRcdFx0XHRpbmRleCsrO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHN0YXJ0SW5kZW50O1xuXHRcdH1cblx0fSxcblxuXG5cdC8vIFJldHVybiB0aGUgaW5kZW50IG9mIGEgbGluZSBvZiB0b2tlbnMuXG5cdC8vIFJldHVybnMgYDBgIGlmIG5vdCBpbmRlbnRlZC5cblx0Ly8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBhIGJsYW5rIGxpbmUuXG5cdGdldExpbmVJbmRlbnQobGluZSkge1xuXHRcdGlmICghbGluZSB8fCBsaW5lLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRpZiAobGluZVswXSBpbnN0YW5jZW9mIFRva2VuaXplci5JbmRlbnQpIHJldHVybiBsaW5lWzBdLmxlbmd0aDtcblx0XHRyZXR1cm4gMDtcblx0fSxcblxuXHQvLyBCcmVhayBgdG9rZW5zYCBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgIGludG8gYSBgVG9rZW5pemVyLkJsb2NrYCB3aXRoIG5lc3RlZCBgY29udGVudHNgLlxuXHQvLyBTa2lwcyBcIm5vcm1hbFwiIHdoaXRlc3BhY2UgYW5kIGluZGVudHMgaW4gdGhlIHJlc3VsdHMuXG5cdGJyZWFrSW50b0Jsb2NrczogZnVuY3Rpb24odG9rZW5zLCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGgpIHtcblx0XHQvLyByZXN0cmljdCB0byB0b2tlbnMgb2YgaW50ZXJlc3Rcblx0XHR0b2tlbnMgPSB0b2tlbnMuc2xpY2Uoc3RhcnQsIGVuZCk7XG5cdFx0Ly8gcmVtb3ZlIFwibm9ybWFsXCIgd2hpdGVzcGFjZVxuLy9UT0RPOiBiZXR0ZXIgdG8gbGVhdmUgdGhpcyB0byBjb25zdW1lcnM/Pz9cblx0XHR0b2tlbnMgPSBUb2tlbml6ZXIucmVtb3ZlTm9ybWFsV2hpdGVzcGFjZSh0b2tlbnMpO1xuXG5cdFx0Ly8gYnJlYWsgaW50byBsaW5lcyAmIHJldHVybiBlYXJseSBpZiBubyBsaW5lc1xuXHRcdGxldCBsaW5lcyA9IFRva2VuaXplci5icmVha0ludG9MaW5lcyh0b2tlbnMpO1xuXHRcdGlmIChsaW5lcy5sZW5ndGggPT09IDApIHJldHVybiBbXTtcblxuXHRcdC8vIGZpZ3VyZSBvdXQgaW5kZW50c1xuXHRcdGxldCBpbmRlbnRzID0gVG9rZW5pemVyLmdldExpbmVJbmRlbnRzKGxpbmVzKTtcblxuXHRcdC8vIEZpcnN0IGJsb2NrIGlzIGF0IHRoZSBNSU5JTVVNIGluZGVudCBvZiBhbGwgbGluZXMhXG5cdFx0bGV0IG1heEluZGVudCA9IE1hdGgubWluLmFwcGx5KE1hdGgsIGluZGVudHMpO1xuXHRcdGxldCBibG9jayA9IG5ldyBUb2tlbml6ZXIuQmxvY2soeyBpbmRlbnQ6IG1heEluZGVudCB9KTtcblxuXHRcdC8vIHN0YWNrIG9mIGJsb2Nrc1xuXHRcdGxldCBzdGFjayA9IFtibG9ja107XG5cblx0XHRsaW5lcy5mb3JFYWNoKCAobGluZSwgaW5kZXgpID0+IHtcblx0XHRcdC8vIFJlbW92ZSBsZWFkaW5nIHdoaXRlc3BhY2UgKGVnOiBpbmRlbnRzKVxuXHRcdFx0bGluZSA9IFRva2VuaXplci5yZW1vdmVMZWFkaW5nV2hpdGVzcGFjZShsaW5lKTtcblxuXHRcdFx0bGV0IGxpbmVJbmRlbnQgPSBpbmRlbnRzW2luZGV4XTtcblx0XHRcdGxldCB0b3AgPSBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcblx0XHRcdC8vIElmIGluZGVudGluZywgcHVzaCBuZXcgYmxvY2socylcblx0XHRcdGlmIChsaW5lSW5kZW50ID4gdG9wLmluZGVudCkge1xuXHRcdFx0XHR3aGlsZSAobGluZUluZGVudCA+IHRvcC5pbmRlbnQpIHtcblx0XHRcdFx0XHR2YXIgbmV3QmxvY2sgPSBuZXcgVG9rZW5pemVyLkJsb2NrKHsgaW5kZW50OiB0b3AuaW5kZW50ICsgMSB9KTtcblx0XHRcdFx0XHR0b3AuY29udGVudHMucHVzaChuZXdCbG9jayk7XG5cdFx0XHRcdFx0c3RhY2sucHVzaChuZXdCbG9jayk7XG5cblx0XHRcdFx0XHR0b3AgPSBuZXdCbG9jaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gSWYgb3V0ZGVudGluZzogcG9wIGJsb2NrKHMpXG5cdFx0XHRlbHNlIGlmIChsaW5lSW5kZW50IDwgdG9wLmluZGVudCkge1xuXHRcdFx0XHR3aGlsZSAobGluZUluZGVudCA8IHRvcC5pbmRlbnQpIHtcblx0XHRcdFx0XHRzdGFjay5wb3AoKTtcblx0XHRcdFx0XHR0b3AgPSBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gYWRkIHRvIHRvcCBibG9ja1xuXHRcdFx0dG9wLmNvbnRlbnRzLnB1c2gobGluZSk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gYmxvY2s7XG5cdH0sXG5cblxuXG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFRva2VuaXplcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9Ub2tlbml6ZXIuanMiLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0geyB2ZXJzaW9uOiAnMi41LjcnIH07XG5pZiAodHlwZW9mIF9fZSA9PSAnbnVtYmVyJykgX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fY29yZS5qc1xuLy8gbW9kdWxlIGlkID0gOTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19pcy1vYmplY3QuanNcbi8vIG1vZHVsZSBpZCA9IDkyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuL19pb2JqZWN0Jyk7XG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBJT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL190by1pb2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSA5M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaWQgPSAwO1xudmFyIHB4ID0gTWF0aC5yYW5kb20oKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gJ1N5bWJvbCgnLmNvbmNhdChrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5LCAnKV8nLCAoKytpZCArIHB4KS50b1N0cmluZygzNikpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3VpZC5qc1xuLy8gbW9kdWxlIGlkID0gOTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG4vKipcbiAqIFdoZW4gc291cmNlIG1hcHMgYXJlIGVuYWJsZWQsIGBzdHlsZS1sb2FkZXJgIHVzZXMgYSBsaW5rIGVsZW1lbnQgd2l0aCBhIGRhdGEtdXJpIHRvXG4gKiBlbWJlZCB0aGUgY3NzIG9uIHRoZSBwYWdlLiBUaGlzIGJyZWFrcyBhbGwgcmVsYXRpdmUgdXJscyBiZWNhdXNlIG5vdyB0aGV5IGFyZSByZWxhdGl2ZSB0byBhXG4gKiBidW5kbGUgaW5zdGVhZCBvZiB0aGUgY3VycmVudCBwYWdlLlxuICpcbiAqIE9uZSBzb2x1dGlvbiBpcyB0byBvbmx5IHVzZSBmdWxsIHVybHMsIGJ1dCB0aGF0IG1heSBiZSBpbXBvc3NpYmxlLlxuICpcbiAqIEluc3RlYWQsIHRoaXMgZnVuY3Rpb24gXCJmaXhlc1wiIHRoZSByZWxhdGl2ZSB1cmxzIHRvIGJlIGFic29sdXRlIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBwYWdlIGxvY2F0aW9uLlxuICpcbiAqIEEgcnVkaW1lbnRhcnkgdGVzdCBzdWl0ZSBpcyBsb2NhdGVkIGF0IGB0ZXN0L2ZpeFVybHMuanNgIGFuZCBjYW4gYmUgcnVuIHZpYSB0aGUgYG5wbSB0ZXN0YCBjb21tYW5kLlxuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3MpIHtcbiAgLy8gZ2V0IGN1cnJlbnQgbG9jYXRpb25cbiAgdmFyIGxvY2F0aW9uID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cubG9jYXRpb247XG5cbiAgaWYgKCFsb2NhdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcImZpeFVybHMgcmVxdWlyZXMgd2luZG93LmxvY2F0aW9uXCIpO1xuICB9XG5cblx0Ly8gYmxhbmsgb3IgbnVsbD9cblx0aWYgKCFjc3MgfHwgdHlwZW9mIGNzcyAhPT0gXCJzdHJpbmdcIikge1xuXHQgIHJldHVybiBjc3M7XG4gIH1cblxuICB2YXIgYmFzZVVybCA9IGxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgbG9jYXRpb24uaG9zdDtcbiAgdmFyIGN1cnJlbnREaXIgPSBiYXNlVXJsICsgbG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvW15cXC9dKiQvLCBcIi9cIik7XG5cblx0Ly8gY29udmVydCBlYWNoIHVybCguLi4pXG5cdC8qXG5cdFRoaXMgcmVndWxhciBleHByZXNzaW9uIGlzIGp1c3QgYSB3YXkgdG8gcmVjdXJzaXZlbHkgbWF0Y2ggYnJhY2tldHMgd2l0aGluXG5cdGEgc3RyaW5nLlxuXG5cdCAvdXJsXFxzKlxcKCAgPSBNYXRjaCBvbiB0aGUgd29yZCBcInVybFwiIHdpdGggYW55IHdoaXRlc3BhY2UgYWZ0ZXIgaXQgYW5kIHRoZW4gYSBwYXJlbnNcblx0ICAgKCAgPSBTdGFydCBhIGNhcHR1cmluZyBncm91cFxuXHQgICAgICg/OiAgPSBTdGFydCBhIG5vbi1jYXB0dXJpbmcgZ3JvdXBcblx0ICAgICAgICAgW14pKF0gID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgIHwgID0gT1Jcblx0ICAgICAgICAgXFwoICA9IE1hdGNoIGEgc3RhcnQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICg/OiAgPSBTdGFydCBhbm90aGVyIG5vbi1jYXB0dXJpbmcgZ3JvdXBzXG5cdCAgICAgICAgICAgICAgICAgW14pKF0rICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgIHwgID0gT1Jcblx0ICAgICAgICAgICAgICAgICBcXCggID0gTWF0Y2ggYSBzdGFydCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgICAgICBbXikoXSogID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgXFwpICA9IE1hdGNoIGEgZW5kIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICApICA9IEVuZCBHcm91cFxuICAgICAgICAgICAgICAqXFwpID0gTWF0Y2ggYW55dGhpbmcgYW5kIHRoZW4gYSBjbG9zZSBwYXJlbnNcbiAgICAgICAgICApICA9IENsb3NlIG5vbi1jYXB0dXJpbmcgZ3JvdXBcbiAgICAgICAgICAqICA9IE1hdGNoIGFueXRoaW5nXG4gICAgICAgKSAgPSBDbG9zZSBjYXB0dXJpbmcgZ3JvdXBcblx0IFxcKSAgPSBNYXRjaCBhIGNsb3NlIHBhcmVuc1xuXG5cdCAvZ2kgID0gR2V0IGFsbCBtYXRjaGVzLCBub3QgdGhlIGZpcnN0LiAgQmUgY2FzZSBpbnNlbnNpdGl2ZS5cblx0ICovXG5cdHZhciBmaXhlZENzcyA9IGNzcy5yZXBsYWNlKC91cmxcXHMqXFwoKCg/OlteKShdfFxcKCg/OlteKShdK3xcXChbXikoXSpcXCkpKlxcKSkqKVxcKS9naSwgZnVuY3Rpb24oZnVsbE1hdGNoLCBvcmlnVXJsKSB7XG5cdFx0Ly8gc3RyaXAgcXVvdGVzIChpZiB0aGV5IGV4aXN0KVxuXHRcdHZhciB1bnF1b3RlZE9yaWdVcmwgPSBvcmlnVXJsXG5cdFx0XHQudHJpbSgpXG5cdFx0XHQucmVwbGFjZSgvXlwiKC4qKVwiJC8sIGZ1bmN0aW9uKG8sICQxKXsgcmV0dXJuICQxOyB9KVxuXHRcdFx0LnJlcGxhY2UoL14nKC4qKSckLywgZnVuY3Rpb24obywgJDEpeyByZXR1cm4gJDE7IH0pO1xuXG5cdFx0Ly8gYWxyZWFkeSBhIGZ1bGwgdXJsPyBubyBjaGFuZ2Vcblx0XHRpZiAoL14oI3xkYXRhOnxodHRwOlxcL1xcL3xodHRwczpcXC9cXC98ZmlsZTpcXC9cXC9cXC8pL2kudGVzdCh1bnF1b3RlZE9yaWdVcmwpKSB7XG5cdFx0ICByZXR1cm4gZnVsbE1hdGNoO1xuXHRcdH1cblxuXHRcdC8vIGNvbnZlcnQgdGhlIHVybCB0byBhIGZ1bGwgdXJsXG5cdFx0dmFyIG5ld1VybDtcblxuXHRcdGlmICh1bnF1b3RlZE9yaWdVcmwuaW5kZXhPZihcIi8vXCIpID09PSAwKSB7XG5cdFx0ICBcdC8vVE9ETzogc2hvdWxkIHdlIGFkZCBwcm90b2NvbD9cblx0XHRcdG5ld1VybCA9IHVucXVvdGVkT3JpZ1VybDtcblx0XHR9IGVsc2UgaWYgKHVucXVvdGVkT3JpZ1VybC5pbmRleE9mKFwiL1wiKSA9PT0gMCkge1xuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgcmVsYXRpdmUgdG8gdGhlIGJhc2UgdXJsXG5cdFx0XHRuZXdVcmwgPSBiYXNlVXJsICsgdW5xdW90ZWRPcmlnVXJsOyAvLyBhbHJlYWR5IHN0YXJ0cyB3aXRoICcvJ1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSByZWxhdGl2ZSB0byBjdXJyZW50IGRpcmVjdG9yeVxuXHRcdFx0bmV3VXJsID0gY3VycmVudERpciArIHVucXVvdGVkT3JpZ1VybC5yZXBsYWNlKC9eXFwuXFwvLywgXCJcIik7IC8vIFN0cmlwIGxlYWRpbmcgJy4vJ1xuXHRcdH1cblxuXHRcdC8vIHNlbmQgYmFjayB0aGUgZml4ZWQgdXJsKC4uLilcblx0XHRyZXR1cm4gXCJ1cmwoXCIgKyBKU09OLnN0cmluZ2lmeShuZXdVcmwpICsgXCIpXCI7XG5cdH0pO1xuXG5cdC8vIHNlbmQgYmFjayB0aGUgZml4ZWQgY3NzXG5cdHJldHVybiBmaXhlZENzcztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vc3R5bGUtbG9hZGVyL2ZpeFVybHMuanNcbi8vIG1vZHVsZSBpZCA9IDk0M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vU3BhY2VyLmxlc3NcIik7XG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbi8vIFByZXBhcmUgY3NzVHJhbnNmb3JtYXRpb25cbnZhciB0cmFuc2Zvcm07XG5cbnZhciBvcHRpb25zID0ge31cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gSG90IE1vZHVsZSBSZXBsYWNlbWVudFxuaWYobW9kdWxlLmhvdCkge1xuXHQvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuXHRpZighY29udGVudC5sb2NhbHMpIHtcblx0XHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vU3BhY2VyLmxlc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL1NwYWNlci5sZXNzXCIpO1xuXHRcdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cdFx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9hcHAvU3BhY2VyLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDk0NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGVzLmxlc3NcIik7XG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbi8vIFByZXBhcmUgY3NzVHJhbnNmb3JtYXRpb25cbnZhciB0cmFuc2Zvcm07XG5cbnZhciBvcHRpb25zID0ge31cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gSG90IE1vZHVsZSBSZXBsYWNlbWVudFxuaWYobW9kdWxlLmhvdCkge1xuXHQvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuXHRpZighY29udGVudC5sb2NhbHMpIHtcblx0XHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGVzLmxlc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlcy5sZXNzXCIpO1xuXHRcdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cdFx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9hcHAvc3R5bGVzLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDk0NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvL1xuLy8gICMgQ2xhc3MgdXRpbGl0aWVzXG4vL1xuXG4vLyBDbG9uZSBhIGNsYXNzLCByZS11c2luZyB0aGUgb3JpZ2luYWwgbmFtZS5cbi8vIFRPRE86IG1vdmUgdG8gdXRpbGl0eT9cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZUNsYXNzKGNvbnN0cnVjdG9yLCBuYW1lID0gY29uc3RydWN0b3IubmFtZSkge1xuICAvLyBDbG9uZSB0aGUgY29uc3RydWN0b3IsIGtlZXBpbmcgdGhlIHNhbWUgbmFtZVxuICBnbG9iYWwuX19jbG9uZUNsYXNzX18gPSBjb25zdHJ1Y3RvcjtcbiAgY29uc3QgY2xvbmUgPSBuZXcgRnVuY3Rpb24oXCJuYW1lXCIsIGByZXR1cm4gY2xhc3MgJHtuYW1lfSBleHRlbmRzIF9fY2xvbmVDbGFzc19fIHt9YCkoKTtcbiAgZGVsZXRlIGdsb2JhbC5fX2Nsb25lQ2xhc3NfXztcbiAgcmV0dXJuIGNsb25lO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3V0aWxzL2NsYXNzLmpzIiwidmFyIHN0b3JlID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ3drcycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xudmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLlN5bWJvbDtcbnZhciBVU0VfU1lNQk9MID0gdHlwZW9mIFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xuXG52YXIgJGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIFVTRV9TWU1CT0wgJiYgU3ltYm9sW25hbWVdIHx8IChVU0VfU1lNQk9MID8gU3ltYm9sIDogdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59O1xuXG4kZXhwb3J0cy5zdG9yZSA9IHN0b3JlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fd2tzLmpzXG4vLyBtb2R1bGUgaWQgPSA5NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9