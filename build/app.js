webpackJsonp([0],{

/***/ 107:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.isWhitespace = isWhitespace;
exports.showWhitespace = showWhitespace;
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

function showWhitespace(string) {
	if (typeof string !== "string") return string;
	return string.replace(/\n/g, "¬").replace(/\t/g, "∆");
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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

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
		key: "addRule",


		// Add a `rule` to our list of rules!
		// Converts to `alternatives` on re-defining the same rule.
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
			Parser.mergeRule(this._rules, ruleName, rule);
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
			var _this2 = this;

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

				// Combine aliases with the main name
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

			var names = [props.name].concat(props.alias || []);

			// Instantiate or parse to create rules to work with
			var rules = props.syntax ? (0, _RuleSyntax2.default)(props.syntax, constructor) : [new constructor()];
			if (!rules) throw new ParseError("defineRule(" + props.syntax + "): didnt get rules back");

			// Sometimes `parseRule` will give us an array back, normalize to always have an array
			rules.forEach(function (rule) {
				return _this2.addRule(names, rule);
			});

			// if tests were defined, mark as `_testable_`
			if (props.tests) {
				// only use the first rule if we got more than one
				// so we don't run the same tests more than once.
				this.addRule("_testable_", rules[0]);
			}
		}

		//
		// ### Parser registry.
		//

	}, {
		key: "rules",


		// Return map of all known rules by rule name, including rules defined in our imports.
		// NOTE: We memoize this, so make sure to clear `__rules` if you're manipulating rules or imports!
		get: function get() {
			if (!this.__rules) {
				var output = this.__rules = {};
				// Get all imported parsers, with us last
				var _imports = [this].concat(this.imports.map(Parser.forModule));

				// For each parser
				_imports.forEach(function (parser) {
					for (var _ruleName in parser._rules) {
						Parser.mergeRule(output, _ruleName, parser._rules[_ruleName]);
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

		// Merge `rule` into `map` of rules by `ruleName`.
		// If we already have a rule with that name, we'll add it as an alternative.
		//TESTME

	}, {
		key: "mergeRule",
		value: function mergeRule(map, ruleName, rule) {
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

var _Rule = __webpack_require__(87);

var _Rule2 = _interopRequireDefault(_Rule);

var _RuleSyntax = __webpack_require__(88);

var _RuleSyntax2 = _interopRequireDefault(_RuleSyntax);

var _Tokenizer = __webpack_require__(89);

var _Tokenizer2 = _interopRequireDefault(_Tokenizer);

__webpack_require__(66);

__webpack_require__(486);

__webpack_require__(485);

__webpack_require__(487);

__webpack_require__(488);

__webpack_require__(489);

__webpack_require__(490);

__webpack_require__(948);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Create parser which combines all of the above...


// Load all standard rules files.
// Export all standard "spell" rules.
var parser = _Parser2.default.forModule("spell");
// ...which depends on rules loaded above...
parser.import("core", "types", "lists", "operators", "if", "statements", "JSX", "UI");
// ...as the default export
exports.default = parser;

// Stick other stuff on `window` for reflection and ad-hoc testing.

if (typeof window !== "undefined") {
	Object.assign(window, {
		Parser: _Parser2.default,
		parseRule: _RuleSyntax2.default,

		Rule: _Rule2.default,

		Tokenizer: _Tokenizer2.default,
		tokenize: _Tokenizer2.default.tokenize.bind(exports.Tokenizer),

		parser: parser,
		rules: parser.rules,
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
            statements = _results.statements;

        return "if (" + condition + ") " + statements;
      }
    }]);

    return if_;
  }(_Rule2.default.BlockStatement),
  tests: [{
    title: "correctly matches single-line if statements",
    compileAs: "statement",
    tests: [["if a", "if (a) {}"], ["if a then", "if (a) {}"], ["if a:", "if (a) {}"], ["if a then b = 1", "if (a) { b = 1 }"], ["if a: b = 1", "if (a) { b = 1 }"], ["if a : b = 1", "if (a) { b = 1 }"]]
  }, {
    title: "correctly matches multi-line if blocks",
    compileAs: "statements",
    tests: {
      "Separate blocks if no indentation on second line.": ["if a:\nb = 1", "if (a) {}\nb = 1"],
      "Indent with tab": ["if a:\n\tb = 1", "if (a) {\n\tb = 1\n}"],
      "ANY number of spaces should count as indentation": ["if a:\n b = 1", "if (a) {\n\tb = 1\n}"],
      "Multiple lines in the nested block": ["if a:\n\tb = 1\n\tc = 2", "if (a) {\n\tb = 1\n\tc = 2\n}"],
      "Nested ifs work fine": ["if a\n\tif b\n\t\tc=2", "if (a) {\n\tif (b) {\n\t\tc = 2\n\t}\n}"],
      "Prefer nested block to inlined statement": ["if a b = 1\n\tc = 2", "if (a) {\n\tc = 2\n}"]
    }
  }]
}, {
  // NOTE: this MUST be before `else` or that will eat `else if` statements... :-(
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
        var _results2 = this.results,
            condition = _results2.condition,
            statements = _results2.statements;

        return "else if (" + condition + ") " + statements;
      }
    }]);

    return else_if;
  }(_Rule2.default.BlockStatement),
  tests: [{
    title: "correctly matches single-line else_if statements",
    compileAs: "statement",
    tests: [["else if a then", "else if (a) {}"], ["else if a then b = 1", "else if (a) { b = 1 }"], ["else if a: b = 1", "else if (a) { b = 1 }"]]
  }, {
    title: "correctly matches multi-line else_if blocks",
    compileAs: "statements",
    tests: {
      "Separate blocks if no indentation on second line.": ["else if a:\nb = 1", "else if (a) {}\nb = 1"],
      "Indent with tab": ["else if a:\n\tb = 1", "else if (a) {\n\tb = 1\n}"],
      "ANY number of spaces should count as indentation": ["else if a:\n b = 1", "else if (a) {\n\tb = 1\n}"],
      "Multiple lines in the nested block": ["else if a:\n\tb = 1\n\tc = 2", "else if (a) {\n\tb = 1\n\tc = 2\n}"]
      //FIXME          "Nested ifs work fine":
      //            ["else if a\n\tif b\n\t\tc=2", "else if (a) {\n\tif (b) {\n\t\tc = 2\n\t}\n}"],
      //FIXME          "Prefer nested block to inlined statement":
      //            ["else if a b = 1\n\tc = 2", "else if (a) {\n\tc = 2\n}"],
    }
  }]
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
        var statements = this.results.statements;

        return "else " + statements;
      }
    }]);

    return else_;
  }(_Rule2.default.BlockStatement),
  tests: [{
    title: "correctly matches single-line else statements",
    compileAs: "statement",
    tests: [["else", "else {}"], ["otherwise", "else {}"], ["else b = 1", "else { b = 1 }"], ["otherwise b = 1", "else { b = 1 }"]]
  }, {
    title: "correctly matches multi-line else blocks",
    compileAs: "statements",
    tests: {
      "Separate blocks if no indentation on second line.": ["else\nb = 1", "else {}\nb = 1"],
      "Indent with tab": ["else\n\tb = 1", "else {\n\tb = 1\n}"],
      "ANY number of spaces should count as indentation": ["else\n b = 1", "else {\n\tb = 1\n}"],
      "Multiple lines in the nested block": ["else\n\tb = 1\n\tc = 2", "else {\n\tb = 1\n\tc = 2\n}"]
    }
  }]
},

// NOTE: this is NOT a blockStatement!
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
        var _results3 = this.results,
            condition = _results3.condition,
            statement = _results3.statement,
            elseStatement = _results3.elseStatement;
        //TODO: smarter wrapping?

        var output = "if (" + condition + ") { " + statement + " }";
        if (elseStatement) output += "\nelse { " + elseStatement + " }";
        return output;
      }
    }]);

    return backwards_if;
  }(_Rule2.default.Sequence),
  tests: [{
    title: "correctly matches single-line backwards_if statements",
    compileAs: "statement",
    tests: [["b = 1 if a", "if (a) { b = 1 }"], ["b = 1 if a else b = 2", "if (a) { b = 1 }\nelse { b = 2 }"], ["b = 1 if a otherwise b = 2", "if (a) { b = 1 }\nelse { b = 2 }"]]
  }]
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
// Return the length of a list.
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

        return "spell.lengthOf(" + list + ")";
      }
    }]);

    return list_length;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "expression",
    tests: [["number of items in myList", "spell.lengthOf(myList)"], ["the number of foos in the foo of the bar", "spell.lengthOf(bar.foo)"], ["the number of items in [1,2,3]", "spell.lengthOf([1, 2, 3])"]]
  }]

},

// Return the first position of specified item in the list as an array.
// If item is not found, returns `undefined`.
// NOTE: this position returned is **1-based**.
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
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "expression",
    tests: [["position of thing in myList", "spell.positionOf(thing, myList)"], ["the position of thing in the foo of the bar", "spell.positionOf(thing, bar.foo)"], ["the position of 'a' in ['a', 'b', 'c']", "spell.positionOf('a', ['a', 'b', 'c'])"]]
  }]

},

//
//	Ordinal numbers (first, second, last, etc).
// TODO: sixty-fifth, two hundred forty ninth... with custom parser?
//
{
  name: "ordinal",
  constructor: function (_Rule$Alternatives) {
    _inherits(ordinal, _Rule$Alternatives);

    function ordinal() {
      _classCallCheck(this, ordinal);

      return _possibleConstructorReturn(this, (ordinal.__proto__ || Object.getPrototypeOf(ordinal)).apply(this, arguments));
    }

    return ordinal;
  }(_Rule2.default.Alternatives),
  tests: [{
    tests: [["first", 1], ["second", 2], ["third", 3], ["fourth", 4], ["fifth", 5], ["sixth", 6], ["seventh", 7], ["eighth", 8], ["ninth", 9], ["tenth", 10], ["penultimate", -2], ["final", -1], ["last", -1], ["top", 1], ["bottom", -1]]
  }]
}, {
  name: "ordinal",
  syntax: "first",
  constructor: function (_Rule$Keywords) {
    _inherits(ordinal_first, _Rule$Keywords);

    function ordinal_first() {
      _classCallCheck(this, ordinal_first);

      return _possibleConstructorReturn(this, (ordinal_first.__proto__ || Object.getPrototypeOf(ordinal_first)).apply(this, arguments));
    }

    _createClass(ordinal_first, [{
      key: "toSource",
      value: function toSource() {
        return 1;
      }
    }]);

    return ordinal_first;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "second",
  constructor: function (_Rule$Keywords2) {
    _inherits(ordinal_second, _Rule$Keywords2);

    function ordinal_second() {
      _classCallCheck(this, ordinal_second);

      return _possibleConstructorReturn(this, (ordinal_second.__proto__ || Object.getPrototypeOf(ordinal_second)).apply(this, arguments));
    }

    _createClass(ordinal_second, [{
      key: "toSource",
      value: function toSource() {
        return 2;
      }
    }]);

    return ordinal_second;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "third",
  constructor: function (_Rule$Keywords3) {
    _inherits(ordinal_third, _Rule$Keywords3);

    function ordinal_third() {
      _classCallCheck(this, ordinal_third);

      return _possibleConstructorReturn(this, (ordinal_third.__proto__ || Object.getPrototypeOf(ordinal_third)).apply(this, arguments));
    }

    _createClass(ordinal_third, [{
      key: "toSource",
      value: function toSource() {
        return 3;
      }
    }]);

    return ordinal_third;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "fourth",
  constructor: function (_Rule$Keywords4) {
    _inherits(ordinal_fourth, _Rule$Keywords4);

    function ordinal_fourth() {
      _classCallCheck(this, ordinal_fourth);

      return _possibleConstructorReturn(this, (ordinal_fourth.__proto__ || Object.getPrototypeOf(ordinal_fourth)).apply(this, arguments));
    }

    _createClass(ordinal_fourth, [{
      key: "toSource",
      value: function toSource() {
        return 4;
      }
    }]);

    return ordinal_fourth;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "fifth",
  constructor: function (_Rule$Keywords5) {
    _inherits(ordinal_fifth, _Rule$Keywords5);

    function ordinal_fifth() {
      _classCallCheck(this, ordinal_fifth);

      return _possibleConstructorReturn(this, (ordinal_fifth.__proto__ || Object.getPrototypeOf(ordinal_fifth)).apply(this, arguments));
    }

    _createClass(ordinal_fifth, [{
      key: "toSource",
      value: function toSource() {
        return 5;
      }
    }]);

    return ordinal_fifth;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "sixth",
  constructor: function (_Rule$Keywords6) {
    _inherits(ordinal_sixth, _Rule$Keywords6);

    function ordinal_sixth() {
      _classCallCheck(this, ordinal_sixth);

      return _possibleConstructorReturn(this, (ordinal_sixth.__proto__ || Object.getPrototypeOf(ordinal_sixth)).apply(this, arguments));
    }

    _createClass(ordinal_sixth, [{
      key: "toSource",
      value: function toSource() {
        return 6;
      }
    }]);

    return ordinal_sixth;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "seventh",
  constructor: function (_Rule$Keywords7) {
    _inherits(ordinal_seventh, _Rule$Keywords7);

    function ordinal_seventh() {
      _classCallCheck(this, ordinal_seventh);

      return _possibleConstructorReturn(this, (ordinal_seventh.__proto__ || Object.getPrototypeOf(ordinal_seventh)).apply(this, arguments));
    }

    _createClass(ordinal_seventh, [{
      key: "toSource",
      value: function toSource() {
        return 7;
      }
    }]);

    return ordinal_seventh;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "eighth",
  constructor: function (_Rule$Keywords8) {
    _inherits(ordinal_eighth, _Rule$Keywords8);

    function ordinal_eighth() {
      _classCallCheck(this, ordinal_eighth);

      return _possibleConstructorReturn(this, (ordinal_eighth.__proto__ || Object.getPrototypeOf(ordinal_eighth)).apply(this, arguments));
    }

    _createClass(ordinal_eighth, [{
      key: "toSource",
      value: function toSource() {
        return 8;
      }
    }]);

    return ordinal_eighth;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "ninth",
  constructor: function (_Rule$Keywords9) {
    _inherits(ordinal_ninth, _Rule$Keywords9);

    function ordinal_ninth() {
      _classCallCheck(this, ordinal_ninth);

      return _possibleConstructorReturn(this, (ordinal_ninth.__proto__ || Object.getPrototypeOf(ordinal_ninth)).apply(this, arguments));
    }

    _createClass(ordinal_ninth, [{
      key: "toSource",
      value: function toSource() {
        return 9;
      }
    }]);

    return ordinal_ninth;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "tenth",
  constructor: function (_Rule$Keywords10) {
    _inherits(ordinal_tenth, _Rule$Keywords10);

    function ordinal_tenth() {
      _classCallCheck(this, ordinal_tenth);

      return _possibleConstructorReturn(this, (ordinal_tenth.__proto__ || Object.getPrototypeOf(ordinal_tenth)).apply(this, arguments));
    }

    _createClass(ordinal_tenth, [{
      key: "toSource",
      value: function toSource() {
        return 10;
      }
    }]);

    return ordinal_tenth;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "penultimate",
  constructor: function (_Rule$Keywords11) {
    _inherits(ordinal_penultimate, _Rule$Keywords11);

    function ordinal_penultimate() {
      _classCallCheck(this, ordinal_penultimate);

      return _possibleConstructorReturn(this, (ordinal_penultimate.__proto__ || Object.getPrototypeOf(ordinal_penultimate)).apply(this, arguments));
    }

    _createClass(ordinal_penultimate, [{
      key: "toSource",
      value: function toSource() {
        return -2;
      }
    }]);

    return ordinal_penultimate;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "final",
  constructor: function (_Rule$Keywords12) {
    _inherits(ordinal_final, _Rule$Keywords12);

    function ordinal_final() {
      _classCallCheck(this, ordinal_final);

      return _possibleConstructorReturn(this, (ordinal_final.__proto__ || Object.getPrototypeOf(ordinal_final)).apply(this, arguments));
    }

    _createClass(ordinal_final, [{
      key: "toSource",
      value: function toSource() {
        return -1;
      }
    }]);

    return ordinal_final;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "last",
  constructor: function (_Rule$Keywords13) {
    _inherits(ordinal_last, _Rule$Keywords13);

    function ordinal_last() {
      _classCallCheck(this, ordinal_last);

      return _possibleConstructorReturn(this, (ordinal_last.__proto__ || Object.getPrototypeOf(ordinal_last)).apply(this, arguments));
    }

    _createClass(ordinal_last, [{
      key: "toSource",
      value: function toSource() {
        return -1;
      }
    }]);

    return ordinal_last;
  }(_Rule2.default.Keywords)
},

// treat list as a stack or queue
//TESTME
{
  name: "ordinal",
  syntax: "top",
  constructor: function (_Rule$Keywords14) {
    _inherits(ordinal_top, _Rule$Keywords14);

    function ordinal_top() {
      _classCallCheck(this, ordinal_top);

      return _possibleConstructorReturn(this, (ordinal_top.__proto__ || Object.getPrototypeOf(ordinal_top)).apply(this, arguments));
    }

    _createClass(ordinal_top, [{
      key: "toSource",
      value: function toSource() {
        return 1;
      }
    }]);

    return ordinal_top;
  }(_Rule2.default.Keywords)
}, {
  name: "ordinal",
  syntax: "bottom",
  constructor: function (_Rule$Keywords15) {
    _inherits(ordinal_bottom, _Rule$Keywords15);

    function ordinal_bottom() {
      _classCallCheck(this, ordinal_bottom);

      return _possibleConstructorReturn(this, (ordinal_bottom.__proto__ || Object.getPrototypeOf(ordinal_bottom)).apply(this, arguments));
    }

    _createClass(ordinal_bottom, [{
      key: "toSource",
      value: function toSource() {
        return -1;
      }
    }]);

    return ordinal_bottom;
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
{
  name: "position_expression",
  alias: "expression",
  syntax: ["{identifier} {position:expression} of {expression}", "the {position:ordinal} {identifier} (in|of) {expression}"],
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
            ordinal = _results3.ordinal,
            expression = _results3.expression;

        return "spell.getItem(" + expression + ", " + position + ", '" + identifier + "')";
      }
    }]);

    return position_expression;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "expression",
    tests: [["item 1 of my-list", "spell.getItem(my_list, 1, 'item')"], ["card 10 of deck", "spell.getItem(deck, 10, 'card')"], ["foo n of the foos of the bar", "spell.getItem(bar.foos, n, 'foo')"], ["the first item of my-list", "spell.getItem(my_list, 1, 'item')"], ["the tenth card of deck", "spell.getItem(deck, 10, 'card')"], ["the penultimate word in words", "spell.getItem(words, -2, 'word')"]]
  }]

},

// Pick a SINGLE random item from the list.
// TODO: confirm identifier is plural?
{
  name: "random_position_expression",
  alias: "expression",
  syntax: "a random {identifier} (of|from|in) {list:expression}",
  constructor: function (_Rule$Sequence4) {
    _inherits(random_position_expression, _Rule$Sequence4);

    function random_position_expression() {
      _classCallCheck(this, random_position_expression);

      return _possibleConstructorReturn(this, (random_position_expression.__proto__ || Object.getPrototypeOf(random_position_expression)).apply(this, arguments));
    }

    _createClass(random_position_expression, [{
      key: "toSource",
      value: function toSource() {
        var _results4 = this.results,
            list = _results4.list,
            identifier = _results4.identifier;

        return "spell.getRandomItemOf(" + list + ", '" + identifier + "')";
      }
    }]);

    return random_position_expression;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "expression",
    tests: [["a random item of my-list", "spell.getRandomItemOf(my_list, 'item')"], ["a random word in 'some words'", "spell.getRandomItemOf('some words', 'word')"], ["a random card from deck", "spell.getRandomItemOf(deck, 'card')"]]
  }]

},

// Pick a unique set of random items from the list, returning an array.
// TODO: `two random items...`
// TODO: confirm identifier is plural?
// TODO: `list.clone()` to return new list of same type.
//TESTME
{
  name: "random_positions_expression",
  alias: "expression",
  syntax: "{number} random {identifier} (of|from|in) {list:expression}",
  constructor: function (_Rule$Sequence5) {
    _inherits(random_positions_expression, _Rule$Sequence5);

    function random_positions_expression() {
      _classCallCheck(this, random_positions_expression);

      return _possibleConstructorReturn(this, (random_positions_expression.__proto__ || Object.getPrototypeOf(random_positions_expression)).apply(this, arguments));
    }

    _createClass(random_positions_expression, [{
      key: "toSource",
      value: function toSource() {
        var _results5 = this.results,
            number = _results5.number,
            list = _results5.list,
            identifier = _results5.identifier;

        return "spell.getRandomItemsOf(" + list + ", " + number + ", '" + identifier + "')";
      }
    }]);

    return random_positions_expression;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "expression",
    tests: [["2 random items of my-list", "spell.getRandomItemsOf(my_list, 2, 'items')"], ["2 random words in 'some other words'", "spell.getRandomItemsOf('some other words', 2, 'words')"], ["3 random cards from deck", "spell.getRandomItemsOf(deck, 3, 'cards')"]]
  }]
},

// Range expression.
// Returns a new list.
// NOTE: `start` is **1-based**.
// NOTE: `end` is inclusive!
{
  name: "range_expression",
  alias: "expression",
  syntax: "{identifier} {start:expression} to {end:expression} (of|in|from) {list:expression}",
  constructor: function (_Rule$Sequence6) {
    _inherits(range_expression, _Rule$Sequence6);

    function range_expression() {
      _classCallCheck(this, range_expression);

      return _possibleConstructorReturn(this, (range_expression.__proto__ || Object.getPrototypeOf(range_expression)).apply(this, arguments));
    }

    _createClass(range_expression, [{
      key: "toSource",
      value: function toSource() {
        var _results6 = this.results,
            list = _results6.list,
            start = _results6.start,
            end = _results6.end,
            identifier = _results6.identifier;

        return "spell.getRange(" + list + ", " + start + ", " + end + ", '" + identifier + "')";
      }
    }]);

    return range_expression;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "expression",
    tests: [["item 1 to 2 of my-list", "spell.getRange(my_list, 1, 2, 'item')"], ["word 2 to 3 in 'some other words'", "spell.getRange('some other words', 2, 3, 'word')"], ["card 1 to 3 from deck", "spell.getRange(deck, 1, 3, 'card')"]]
  }]
},

// Alternative form of range expression.
// Returns a new list.
{
  name: "ordinal_range_expression",
  alias: "expression",
  syntax: "{ordinal} {number} {identifier} (of|in|from) {list:expression}",
  constructor: function (_Rule$Sequence7) {
    _inherits(ordinal_range_expression, _Rule$Sequence7);

    function ordinal_range_expression() {
      _classCallCheck(this, ordinal_range_expression);

      return _possibleConstructorReturn(this, (ordinal_range_expression.__proto__ || Object.getPrototypeOf(ordinal_range_expression)).apply(this, arguments));
    }

    _createClass(ordinal_range_expression, [{
      key: "toSource",
      value: function toSource() {
        var _results7 = this.results,
            ordinal = _results7.ordinal,
            number = _results7.number,
            list = _results7.list,
            identifier = _results7.identifier;

        return "spell.slice(" + list + ", " + ordinal + ", " + number + ", '" + identifier + "')";
      }
    }]);

    return ordinal_range_expression;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "expression",
    tests: [["top 2 items of my-list", "spell.slice(my_list, 1, 2, 'items')"], ["first 2 words in 'some other words'", "spell.slice('some other words', 1, 2, 'words')"], ["last two cards from deck", "spell.slice(deck, -1, 2, 'cards')"]]
  }]
},

// Range expression starting at some item in the list.
// Returns a new list.
// If item is not found, returns an empty list. (???)
//TESTME
{
  name: "range_expression_starting_with",
  alias: "expression",
  syntax: "{identifier} (in|of) {list:expression} starting with {thing:expression}",
  constructor: function (_Rule$Sequence8) {
    _inherits(range_expression_starting_with, _Rule$Sequence8);

    function range_expression_starting_with() {
      _classCallCheck(this, range_expression_starting_with);

      return _possibleConstructorReturn(this, (range_expression_starting_with.__proto__ || Object.getPrototypeOf(range_expression_starting_with)).apply(this, arguments));
    }

    _createClass(range_expression_starting_with, [{
      key: "toSource",
      value: function toSource() {
        var _results8 = this.results,
            thing = _results8.thing,
            list = _results8.list,
            identifier = _results8.identifier;

        return "spell.getRange(" + list + ", spell.positionOf(" + thing + ", " + list + "), undefined, '" + identifier + "')";
      }
    }]);

    return range_expression_starting_with;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "expression",
    tests: [["items in my-list starting with it", "spell.getRange(my_list, spell.positionOf(it, my_list), undefined, 'items')"], ["words in 'some words' starting with 'some'", "spell.getRange('some words', spell.positionOf('some', 'some words'), undefined, 'words')"]]
  }]

},

// List filter.
// NOTE: we will singularize `identifier` and use that as the argument to `expression`.
//TESTME
{
  name: "list_filter",
  alias: "expression",
  syntax: "{identifier} (in|of) {list:expression} where {condition:expression}",
  constructor: function (_Rule$Sequence9) {
    _inherits(list_filter, _Rule$Sequence9);

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

        var argument = (0, _string.singularize)(identifier);
        return "spell.filter(" + list + ", " + argument + " => " + condition + ", '" + identifier + "')";
      }
    }]);

    return list_filter;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "expression",
    showAll: true,
    tests: [["items in my-list where the id of the item > 1", "spell.filter(my_list, item => item.id > 1, 'items')"], ["", ""], ["", ""], ["", ""]]
  }]

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
  constructor: function (_Rule$Sequence10) {
    _inherits(list_membership_test, _Rule$Sequence10);

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
  constructor: function (_Rule$Sequence11) {
    _inherits(list_append, _Rule$Sequence11);

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
  constructor: function (_Rule$Sequence12) {
    _inherits(list_prepend, _Rule$Sequence12);

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
  constructor: function (_Rule$Sequence13) {
    _inherits(list_splice, _Rule$Sequence13);

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
  constructor: function (_Rule$Sequence14) {
    _inherits(list_add_after, _Rule$Sequence14);

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
  constructor: function (_Rule$Sequence15) {
    _inherits(list_empty, _Rule$Sequence15);

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
  constructor: function (_Rule$Sequence16) {
    _inherits(list_remove_position, _Rule$Sequence16);

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
  constructor: function (_Rule$Sequence17) {
    _inherits(list_remove_position, _Rule$Sequence17);

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
  constructor: function (_Rule$Sequence18) {
    _inherits(list_remove, _Rule$Sequence18);

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
  constructor: function (_Rule$Sequence19) {
    _inherits(list_remove_where, _Rule$Sequence19);

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
  constructor: function (_Rule$Sequence20) {
    _inherits(list_reverse, _Rule$Sequence20);

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
  constructor: function (_Rule$Sequence21) {
    _inherits(list_shuffle, _Rule$Sequence21);

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
  constructor: function (_Rule$Sequence22) {
    _inherits(range_expression, _Rule$Sequence22);

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

        return _operator.applyOperator(lhs, rhs);
      }
    }, {
      key: "precedence",
      get: function get() {
        if (!this.matched) throw new SyntaxError("infix_operator_expression: trying to look up precedence when not parsed!");
        var _operator = this.results._operator;

        return _operator.precedence;
      }
    }]);

    return infix_operator_expression;
  }(_Rule2.default.Sequence)
},

//## Infix operators:   `{lhs} <operator> {rhs}`, eg: `a is 1`
// NOTE: `operator.applyOperator` MUST return a function which transforms two arguments (`lhs` and `rhs`) into output.
// NOTE: `precedence` numbers come from Javascript equivalents
//		 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
{
  name: "and",
  alias: ["infix_operator"],
  precedence: 6,
  syntax: "and",
  constructor: function (_Rule$Keywords) {
    _inherits(and, _Rule$Keywords);

    function and() {
      _classCallCheck(this, and);

      return _possibleConstructorReturn(this, (and.__proto__ || Object.getPrototypeOf(and)).apply(this, arguments));
    }

    _createClass(and, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " && " + b + ")";
      }
    }]);

    return and;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a and b", "(a && b)"]]
  }]
}, {
  name: "or",
  alias: ["infix_operator"],
  precedence: 5,
  syntax: "or",
  constructor: function (_Rule$Keywords2) {
    _inherits(or, _Rule$Keywords2);

    function or() {
      _classCallCheck(this, or);

      return _possibleConstructorReturn(this, (or.__proto__ || Object.getPrototypeOf(or)).apply(this, arguments));
    }

    _createClass(or, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " || " + b + ")";
      }
    }]);

    return or;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a or b", "(a || b)"]]
  }]
}, {
  name: "is",
  alias: ["infix_operator"],
  precedence: 10,
  syntax: "is",
  constructor: function (_Rule$Keywords3) {
    _inherits(is, _Rule$Keywords3);

    function is() {
      _classCallCheck(this, is);

      return _possibleConstructorReturn(this, (is.__proto__ || Object.getPrototypeOf(is)).apply(this, arguments));
    }

    _createClass(is, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " == " + b + ")";
      }
    }]);

    return is;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a is b", "(a == b)"]]
  }]
}, {
  name: "is_not",
  alias: ["infix_operator"],
  precedence: 10,
  syntax: "is not",
  constructor: function (_Rule$Keywords4) {
    _inherits(is_not, _Rule$Keywords4);

    function is_not() {
      _classCallCheck(this, is_not);

      return _possibleConstructorReturn(this, (is_not.__proto__ || Object.getPrototypeOf(is_not)).apply(this, arguments));
    }

    _createClass(is_not, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " != " + b + ")";
      }
    }]);

    return is_not;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a is not b", "(a != b)"]]
  }]
}, {
  name: "is_exactly",
  alias: ["infix_operator"],
  precedence: 10,
  syntax: "is exactly",
  constructor: function (_Rule$Keywords5) {
    _inherits(is_exactly, _Rule$Keywords5);

    function is_exactly() {
      _classCallCheck(this, is_exactly);

      return _possibleConstructorReturn(this, (is_exactly.__proto__ || Object.getPrototypeOf(is_exactly)).apply(this, arguments));
    }

    _createClass(is_exactly, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " === " + b + ")";
      }
    }]);

    return is_exactly;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a is exactly b", "(a === b)"]]
  }]
}, {
  name: "is_not_exactly",
  alias: ["infix_operator"],
  precedence: 10,
  syntax: "is not exactly",
  constructor: function (_Rule$Keywords6) {
    _inherits(is_not_exactly, _Rule$Keywords6);

    function is_not_exactly() {
      _classCallCheck(this, is_not_exactly);

      return _possibleConstructorReturn(this, (is_not_exactly.__proto__ || Object.getPrototypeOf(is_not_exactly)).apply(this, arguments));
    }

    _createClass(is_not_exactly, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " !== " + b + ")";
      }
    }]);

    return is_not_exactly;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a is not exactly b", "(a !== b)"]]
  }]
},

//FIXME: no validation that `type` is a legal JS type
//TODO: `is same type as` ?
{
  name: "is_a",
  alias: ["infix_operator"],
  precedence: 11,
  syntax: ["is a", "is an"],
  constructor: function (_Rule$Keywords7) {
    _inherits(is_a, _Rule$Keywords7);

    function is_a() {
      _classCallCheck(this, is_a);

      return _possibleConstructorReturn(this, (is_a.__proto__ || Object.getPrototypeOf(is_a)).apply(this, arguments));
    }

    _createClass(is_a, [{
      key: "applyOperator",
      value: function applyOperator(thing, type) {
        return "spell.isOfType(" + thing + ", '" + type + "')";
      }
    }]);

    return is_a;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a is a B", "spell.isOfType(a, 'B')"], ["a is an A", "spell.isOfType(a, 'A')"]]
  }]
}, {
  name: "is_not_a",
  alias: ["infix_operator"],
  precedence: 11,
  syntax: ["is not a", "is not an"],
  constructor: function (_Rule$Keywords8) {
    _inherits(is_not_a, _Rule$Keywords8);

    function is_not_a() {
      _classCallCheck(this, is_not_a);

      return _possibleConstructorReturn(this, (is_not_a.__proto__ || Object.getPrototypeOf(is_not_a)).apply(this, arguments));
    }

    _createClass(is_not_a, [{
      key: "applyOperator",
      value: function applyOperator(thing, type) {
        return "!spell.isOfType(" + thing + ", '" + type + "')";
      }
    }]);

    return is_not_a;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a is not a B", "!spell.isOfType(a, 'B')"], ["a is not an A", "!spell.isOfType(a, 'A')"]]
  }]
},

//TODO: `spell.contains(collection, thing)`
{
  name: "is_in",
  alias: ["infix_operator"],
  precedence: 11,
  syntax: ["is in", "is one of"],
  constructor: function (_Rule$Keywords9) {
    _inherits(is_in, _Rule$Keywords9);

    function is_in() {
      _classCallCheck(this, is_in);

      return _possibleConstructorReturn(this, (is_in.__proto__ || Object.getPrototypeOf(is_in)).apply(this, arguments));
    }

    _createClass(is_in, [{
      key: "applyOperator",
      value: function applyOperator(thing, list) {
        return "spell.includes(" + list + ", " + thing + ")";
      }
    }]);

    return is_in;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a is in theList", "spell.includes(theList, a)"], ["a is one of theList", "spell.includes(theList, a)"]]
  }]
}, {
  name: "is_not_in",
  alias: ["infix_operator"],
  precedence: 11,
  syntax: ["is not in", "is not one of"],
  constructor: function (_Rule$Keywords10) {
    _inherits(is_not_in, _Rule$Keywords10);

    function is_not_in() {
      _classCallCheck(this, is_not_in);

      return _possibleConstructorReturn(this, (is_not_in.__proto__ || Object.getPrototypeOf(is_not_in)).apply(this, arguments));
    }

    _createClass(is_not_in, [{
      key: "applyOperator",
      value: function applyOperator(thing, list) {
        return "!spell.includes(" + list + ", " + thing + ")";
      }
    }]);

    return is_not_in;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a is not in theList", "!spell.includes(theList, a)"], ["a is not one of theList", "!spell.includes(theList, a)"]]
  }]
}, {
  name: "includes",
  alias: ["infix_operator"],
  precedence: 11,
  syntax: ["includes", "contains"],
  constructor: function (_Rule$Keywords11) {
    _inherits(includes, _Rule$Keywords11);

    function includes() {
      _classCallCheck(this, includes);

      return _possibleConstructorReturn(this, (includes.__proto__ || Object.getPrototypeOf(includes)).apply(this, arguments));
    }

    _createClass(includes, [{
      key: "applyOperator",
      value: function applyOperator(list, thing) {
        return "spell.includes(" + list + ", " + thing + ")";
      }
    }]);

    return includes;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["theList includes a", "spell.includes(theList, a)"], ["theList contains a", "spell.includes(theList, a)"]]
  }]
}, {
  name: "does_not_include",
  alias: ["infix_operator"],
  precedence: 11,
  syntax: ["does not include", "does not contain"],
  constructor: function (_Rule$Keywords12) {
    _inherits(does_not_include, _Rule$Keywords12);

    function does_not_include() {
      _classCallCheck(this, does_not_include);

      return _possibleConstructorReturn(this, (does_not_include.__proto__ || Object.getPrototypeOf(does_not_include)).apply(this, arguments));
    }

    _createClass(does_not_include, [{
      key: "applyOperator",
      value: function applyOperator(list, thing) {
        return "!spell.includes(" + list + ", " + thing + ")";
      }
    }]);

    return does_not_include;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["theList does not include a", "!spell.includes(theList, a)"], ["theList does not contain a", "!spell.includes(theList, a)"]]
  }]
}, {
  name: "gt",
  alias: ["infix_operator"],
  precedence: 11,
  syntax: ">",
  constructor: function (_Rule$Symbols) {
    _inherits(gt, _Rule$Symbols);

    function gt() {
      _classCallCheck(this, gt);

      return _possibleConstructorReturn(this, (gt.__proto__ || Object.getPrototypeOf(gt)).apply(this, arguments));
    }

    _createClass(gt, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " > " + b + ")";
      }
    }]);

    return gt;
  }(_Rule2.default.Symbols),
  tests: [{
    compileAs: "expression",
    tests: {
      "with spaces": ["a > b", "(a > b)"],
      "without spaces": ["a>b", "(a > b)"]
    }
  }]
}, {
  name: "is_gt",
  alias: ["infix_operator"],
  precedence: 11,
  syntax: "is greater than",
  constructor: function (_Rule$Keywords13) {
    _inherits(is_gt, _Rule$Keywords13);

    function is_gt() {
      _classCallCheck(this, is_gt);

      return _possibleConstructorReturn(this, (is_gt.__proto__ || Object.getPrototypeOf(is_gt)).apply(this, arguments));
    }

    _createClass(is_gt, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " > " + b + ")";
      }
    }]);

    return is_gt;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a is greater than b", "(a > b)"]]
  }]
}, {
  name: "gte",
  alias: ["infix_operator"],
  precedence: 11,
  syntax: ">=",
  constructor: function (_Rule$Symbols2) {
    _inherits(gte, _Rule$Symbols2);

    function gte() {
      _classCallCheck(this, gte);

      return _possibleConstructorReturn(this, (gte.__proto__ || Object.getPrototypeOf(gte)).apply(this, arguments));
    }

    _createClass(gte, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " >= " + b + ")";
      }
    }]);

    return gte;
  }(_Rule2.default.Symbols),
  tests: [{
    compileAs: "expression",
    tests: {
      "with spaces": ["a >= b", "(a >= b)"],
      "without spaces": ["a>=b", "(a >= b)"]
    }
  }]
}, {
  name: "is_gte",
  alias: ["infix_operator"],
  precedence: 11,
  syntax: "is greater than or equal to",
  constructor: function (_Rule$Keywords14) {
    _inherits(is_gte, _Rule$Keywords14);

    function is_gte() {
      _classCallCheck(this, is_gte);

      return _possibleConstructorReturn(this, (is_gte.__proto__ || Object.getPrototypeOf(is_gte)).apply(this, arguments));
    }

    _createClass(is_gte, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " >= " + b + ")";
      }
    }]);

    return is_gte;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a is greater than or equal to b", "(a >= b)"]]
  }]
}, {
  name: "lt",
  alias: ["infix_operator"],
  precedence: 11,
  syntax: "<",
  constructor: function (_Rule$Symbols3) {
    _inherits(lt, _Rule$Symbols3);

    function lt() {
      _classCallCheck(this, lt);

      return _possibleConstructorReturn(this, (lt.__proto__ || Object.getPrototypeOf(lt)).apply(this, arguments));
    }

    _createClass(lt, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " < " + b + ")";
      }
    }]);

    return lt;
  }(_Rule2.default.Symbols),
  tests: [{
    compileAs: "expression",
    tests: {
      "with spaces": ["a > b", "(a > b)"],
      "without spaces": ["a>b", "(a > b)"]
    }
  }]
}, {
  name: "is_lt",
  alias: ["infix_operator"],
  precedence: 11,
  syntax: "is less than",
  constructor: function (_Rule$Keywords15) {
    _inherits(is_lt, _Rule$Keywords15);

    function is_lt() {
      _classCallCheck(this, is_lt);

      return _possibleConstructorReturn(this, (is_lt.__proto__ || Object.getPrototypeOf(is_lt)).apply(this, arguments));
    }

    _createClass(is_lt, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " < " + b + ")";
      }
    }]);

    return is_lt;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a is less than b", "(a < b)"]]
  }]
}, {
  name: "lte",
  alias: ["infix_operator"],
  precedence: 11,
  syntax: "<=",
  constructor: function (_Rule$Symbols4) {
    _inherits(lte, _Rule$Symbols4);

    function lte() {
      _classCallCheck(this, lte);

      return _possibleConstructorReturn(this, (lte.__proto__ || Object.getPrototypeOf(lte)).apply(this, arguments));
    }

    _createClass(lte, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " <= " + b + ")";
      }
    }]);

    return lte;
  }(_Rule2.default.Symbols),
  tests: [{
    compileAs: "expression",
    tests: {
      "with spaces": ["a <= b", "(a <= b)"],
      "without spaces": ["a<=b", "(a <= b)"]
    }
  }]
}, {
  name: "is_lte",
  alias: ["infix_operator"],
  precedence: 11,
  syntax: "is less than or equal to",
  constructor: function (_Rule$Keywords16) {
    _inherits(is_lte, _Rule$Keywords16);

    function is_lte() {
      _classCallCheck(this, is_lte);

      return _possibleConstructorReturn(this, (is_lte.__proto__ || Object.getPrototypeOf(is_lte)).apply(this, arguments));
    }

    _createClass(is_lte, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " <= " + b + ")";
      }
    }]);

    return is_lte;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a is less than or equal to b", "(a <= b)"]]
  }]
}, {
  name: "plus_symbol",
  alias: ["infix_operator"],
  precedence: 13,
  syntax: "\\+",
  constructor: function (_Rule$Symbols5) {
    _inherits(plus_symbol, _Rule$Symbols5);

    function plus_symbol() {
      _classCallCheck(this, plus_symbol);

      return _possibleConstructorReturn(this, (plus_symbol.__proto__ || Object.getPrototypeOf(plus_symbol)).apply(this, arguments));
    }

    _createClass(plus_symbol, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " + " + b + ")";
      }
    }]);

    return plus_symbol;
  }(_Rule2.default.Symbols),
  tests: [{
    compileAs: "expression",
    tests: [["a+b", "(a + b)"], ["a + b", "(a + b)"]]
  }]
}, {
  name: "plus",
  alias: ["infix_operator"],
  precedence: 13,
  syntax: "plus",
  constructor: function (_Rule$Keywords17) {
    _inherits(plus, _Rule$Keywords17);

    function plus() {
      _classCallCheck(this, plus);

      return _possibleConstructorReturn(this, (plus.__proto__ || Object.getPrototypeOf(plus)).apply(this, arguments));
    }

    _createClass(plus, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " + " + b + ")";
      }
    }]);

    return plus;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a plus b", "(a + b)"]]
  }]
}, {
  name: "minus_symbol",
  alias: ["infix_operator"],
  precedence: 13,
  syntax: "-",
  constructor: function (_Rule$Symbols6) {
    _inherits(minus_symbol, _Rule$Symbols6);

    function minus_symbol() {
      _classCallCheck(this, minus_symbol);

      return _possibleConstructorReturn(this, (minus_symbol.__proto__ || Object.getPrototypeOf(minus_symbol)).apply(this, arguments));
    }

    _createClass(minus_symbol, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " - " + b + ")";
      }
    }]);

    return minus_symbol;
  }(_Rule2.default.Symbols),
  tests: [{
    compileAs: "expression",
    tests: {
      //        "without spaces": ["a-b", "(a - b)"],   // minus requires space
      "with spaces": ["a - b", "(a - b)"]
    }
  }]
}, {
  name: "minus",
  alias: ["infix_operator"],
  precedence: 13,
  syntax: "minus",
  constructor: function (_Rule$Keywords18) {
    _inherits(minus, _Rule$Keywords18);

    function minus() {
      _classCallCheck(this, minus);

      return _possibleConstructorReturn(this, (minus.__proto__ || Object.getPrototypeOf(minus)).apply(this, arguments));
    }

    _createClass(minus, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " - " + b + ")";
      }
    }]);

    return minus;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a minus b", "(a - b)"]]
  }]
}, {
  name: "times_sumbol",
  alias: ["infix_operator"],
  precedence: 14,
  syntax: "\\*",
  constructor: function (_Rule$Symbols7) {
    _inherits(times, _Rule$Symbols7);

    function times() {
      _classCallCheck(this, times);

      return _possibleConstructorReturn(this, (times.__proto__ || Object.getPrototypeOf(times)).apply(this, arguments));
    }

    _createClass(times, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " * " + b + ")";
      }
    }]);

    return times;
  }(_Rule2.default.Symbols),
  tests: [{
    compileAs: "expression",
    tests: {
      "without spaces": ["a*b", "(a * b)"],
      "with spaces": ["a * b", "(a * b)"]
    }
  }]
}, {
  name: "times",
  alias: ["infix_operator"],
  precedence: 14,
  syntax: "times",
  constructor: function (_Rule$Keywords19) {
    _inherits(times, _Rule$Keywords19);

    function times() {
      _classCallCheck(this, times);

      return _possibleConstructorReturn(this, (times.__proto__ || Object.getPrototypeOf(times)).apply(this, arguments));
    }

    _createClass(times, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " * " + b + ")";
      }
    }]);

    return times;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a times b", "(a * b)"]]
  }]
}, {
  name: "division_symbol",
  alias: ["infix_operator"],
  precedence: 14,
  syntax: "/",
  constructor: function (_Rule$Symbols8) {
    _inherits(divided_by, _Rule$Symbols8);

    function divided_by() {
      _classCallCheck(this, divided_by);

      return _possibleConstructorReturn(this, (divided_by.__proto__ || Object.getPrototypeOf(divided_by)).apply(this, arguments));
    }

    _createClass(divided_by, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " / " + b + ")";
      }
    }]);

    return divided_by;
  }(_Rule2.default.Symbols),
  tests: [{
    compileAs: "expression",
    tests: {
      "without spaces": ["a/b", "(a / b)"],
      "with spaces": ["a / b", "(a / b)"]
    }
  }]
}, {
  name: "divided_by",
  alias: ["infix_operator"],
  precedence: 14,
  syntax: "divided by",
  constructor: function (_Rule$Keywords20) {
    _inherits(divided_by, _Rule$Keywords20);

    function divided_by() {
      _classCallCheck(this, divided_by);

      return _possibleConstructorReturn(this, (divided_by.__proto__ || Object.getPrototypeOf(divided_by)).apply(this, arguments));
    }

    _createClass(divided_by, [{
      key: "applyOperator",
      value: function applyOperator(a, b) {
        return "(" + a + " / " + b + ")";
      }
    }]);

    return divided_by;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a divided by b", "(a / b)"]]
  }]
},

//
//## Postifx operators:   `{lhs} <operator>`, e.g. `a is defined`
// NOTE: `operator.applyOperator` MUST return a function which transforms argument (`lhs`) into JS output.

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

        return _operator.applyOperator(expression);
      }
    }]);

    return postfix_operator_expresion;
  }(_Rule2.default.Sequence)
}, {
  name: "is_defined",
  alias: ["postfix_operator"],
  syntax: "is defined",
  constructor: function (_Rule$Keywords21) {
    _inherits(is_defined, _Rule$Keywords21);

    function is_defined() {
      _classCallCheck(this, is_defined);

      return _possibleConstructorReturn(this, (is_defined.__proto__ || Object.getPrototypeOf(is_defined)).apply(this, arguments));
    }

    _createClass(is_defined, [{
      key: "applyOperator",
      value: function applyOperator(thing) {
        return "(typeof " + thing + " !== 'undefined')";
      }
    }]);

    return is_defined;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["a is defined", "(typeof a !== 'undefined')"]]
  }]
}, {
  name: "is_undefined",
  alias: ["postfix_operator"],
  syntax: ["is undefined", "is not defined"],
  constructor: function (_Rule$Keywords22) {
    _inherits(is_undefined, _Rule$Keywords22);

    function is_undefined() {
      _classCallCheck(this, is_undefined);

      return _possibleConstructorReturn(this, (is_undefined.__proto__ || Object.getPrototypeOf(is_undefined)).apply(this, arguments));
    }

    _createClass(is_undefined, [{
      key: "applyOperator",
      value: function applyOperator(thing) {
        return "(typeof " + thing + " === 'undefined')";
      }
    }]);

    return is_undefined;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["thing is undefined", "(typeof thing === 'undefined')"], ["thing is not defined", "(typeof thing === 'undefined')"]]
  }]
}, {
  name: "is_empty",
  alias: ["postfix_operator"],
  syntax: "is empty",
  constructor: function (_Rule$Keywords23) {
    _inherits(is_empty, _Rule$Keywords23);

    function is_empty() {
      _classCallCheck(this, is_empty);

      return _possibleConstructorReturn(this, (is_empty.__proto__ || Object.getPrototypeOf(is_empty)).apply(this, arguments));
    }

    _createClass(is_empty, [{
      key: "applyOperator",
      value: function applyOperator(thing) {
        return "spell.isEmpty(" + thing + ")";
      }
    }]);

    return is_empty;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["thing is empty", "spell.isEmpty(thing)"]]
  }]
}, {
  name: "is_not_empty",
  alias: ["postfix_operator"],
  syntax: "is not empty",
  constructor: function (_Rule$Keywords24) {
    _inherits(is_not_empty, _Rule$Keywords24);

    function is_not_empty() {
      _classCallCheck(this, is_not_empty);

      return _possibleConstructorReturn(this, (is_not_empty.__proto__ || Object.getPrototypeOf(is_not_empty)).apply(this, arguments));
    }

    _createClass(is_not_empty, [{
      key: "applyOperator",
      value: function applyOperator(thing) {
        return "!spell.isEmpty(" + thing + ")";
      }
    }]);

    return is_not_empty;
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["thing is not empty", "!spell.isEmpty(thing)"]]
  }]
},

//
//## Prefix operators:   `<operator> {lhs}`, e.g. `round theList`
// NOTE: `operator.applyOperator` MUST return a function which transforms argument (`lhs`) into JS output.

{
  name: "absolute_value",
  alias: "expression",
  //FIXME: make `the` optional
  syntax: "the absolute value of {expression}",
  constructor: function (_Rule$Sequence3) {
    _inherits(absolute_value, _Rule$Sequence3);

    function absolute_value() {
      _classCallCheck(this, absolute_value);

      return _possibleConstructorReturn(this, (absolute_value.__proto__ || Object.getPrototypeOf(absolute_value)).apply(this, arguments));
    }

    _createClass(absolute_value, [{
      key: "toSource",
      value: function toSource() {
        var expression = this.results.expression;

        return "Math.abs(" + expression + ")";
      }
    }]);

    return absolute_value;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "expression",
    tests: [["the absolute value of thing", "Math.abs(thing)"]]
  }]
}, {
  name: "max",
  alias: "expression",
  //FIXME: "the?"
  syntax: "(max|maximum|largest|biggest) {identifier}? (of|in) {expression}",
  constructor: function (_Rule$Sequence4) {
    _inherits(max, _Rule$Sequence4);

    function max() {
      _classCallCheck(this, max);

      return _possibleConstructorReturn(this, (max.__proto__ || Object.getPrototypeOf(max)).apply(this, arguments));
    }

    _createClass(max, [{
      key: "toSource",
      value: function toSource() {
        var expression = this.results.expression;
        // TODO: Math.max() doesn't work when passed an array... :-(

        return "spell.max(" + expression + ")";
      }
    }]);

    return max;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "expression",
    tests: [["max of thing", "spell.max(thing)"], ["max in thing", "spell.max(thing)"], ["maximum of thing", "spell.max(thing)"], ["largest of thing", "spell.max(thing)"], ["biggest in thing", "spell.max(thing)"], ["biggest item in thing", "spell.max(thing)"]]
  }]
}, {
  name: "min",
  alias: "expression",
  //FIXME: "the?"
  syntax: "(min|minimum|smallest|least) {identifier}? (of|in) {expression}",
  constructor: function (_Rule$Sequence5) {
    _inherits(min, _Rule$Sequence5);

    function min() {
      _classCallCheck(this, min);

      return _possibleConstructorReturn(this, (min.__proto__ || Object.getPrototypeOf(min)).apply(this, arguments));
    }

    _createClass(min, [{
      key: "toSource",
      value: function toSource() {
        var expression = this.results.expression;
        // TODO: Math.min() doesn't work when passed an array... :-(

        return "spell.min(" + expression + ")";
      }
    }]);

    return min;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "expression",
    tests: [["min of thing", "spell.min(thing)"], ["min in thing", "spell.min(thing)"], ["minimum of thing", "spell.min(thing)"], ["smallest of thing", "spell.min(thing)"], ["least of thing", "spell.min(thing)"], ["smallest item in thing", "spell.min(thing)"]]
  }]
},

//
//## "surrounding" operator expressions:   `round thing down`
//

{
  name: "round_up_or_down",
  alias: "expression",
  syntax: "round {thing:expression} (direction:off|up|down)?",
  constructor: function (_Rule$Sequence6) {
    _inherits(round_up_or_down, _Rule$Sequence6);

    function round_up_or_down() {
      _classCallCheck(this, round_up_or_down);

      return _possibleConstructorReturn(this, (round_up_or_down.__proto__ || Object.getPrototypeOf(round_up_or_down)).apply(this, arguments));
    }

    _createClass(round_up_or_down, [{
      key: "toSource",
      value: function toSource() {
        var _results3 = this.results,
            thing = _results3.thing,
            direction = _results3.direction;

        if (direction === "up") return "Math.ceil(" + thing + ")";else if (direction === "down") return "Math.floor(" + thing + ")";else return "Math.round(" + thing + ")";
      }
    }]);

    return round_up_or_down;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "expression",
    tests: [["round thing", "Math.round(thing)"], ["round thing off", "Math.round(thing)"], ["round thing up", "Math.ceil(thing)"], ["round thing down", "Math.floor(thing)"]]
  }]
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
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "statement",
    tests: [["return thing", "return thing"]]
  }]
},

//
//	## Assignment
//

//TODO: distinguish between `new_identifier` and `scoped_identifier`?
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
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "statement",
    tests: [["thing = yes", "thing = true"], ["set thing to yes", "thing = true"], ["put yes into thing", "thing = true"]]
  }]
}, {
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
        return "var it = " + value;
      }
    }]);

    return get_value;
  }(_Rule2.default.Sequence),
  tests: [{
    title: "correctly matches ",
    compileAs: "statement",
    tests: [["get thing", "var it = thing"]]
  }]
});

/***/ }),

/***/ 490:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _flattenDeep = __webpack_require__(949);

var _flattenDeep2 = _interopRequireDefault(_flattenDeep);

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

// TODO: constructor
// TODO: mixins / traits / composed classes / annotations

var parser = _Parser2.default.forModule("types");
exports.default = parser;


parser.defineRules(
//
//	Self-reference
//

// TODO: confusing???
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
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["me", "this"]]
  }]
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
  }(_Rule2.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["I", "this"]]
  }]
},

//
//	Property access
//

{
  // TODO: really low precedence on this so more-specific rules with similar pattern will work
  // TODO: multiple identifiers would be cool...
  name: "property_expression",
  alias: "expression",
  syntax: "(properties:the {identifier} of)+ the? {expression}",
  constructor: function (_Rule$Sequence) {
    _inherits(property_expression, _Rule$Sequence);

    function property_expression() {
      _classCallCheck(this, property_expression);

      return _possibleConstructorReturn(this, (property_expression.__proto__ || Object.getPrototypeOf(property_expression)).apply(this, arguments));
    }

    _createClass(property_expression, [{
      key: "toSource",
      value: function toSource() {
        var _results = this.results,
            expression = _results.expression,
            properties = _results.properties;

        properties = properties.reverse().join(".");
        return expression + "." + properties;
        // NOTE: the following is safer, but ugly for demo purposes
        //			return `spell.get(${expression}, ['${properties}'])`;
      }
    }, {
      key: "results",
      get: function get() {
        var results = _get(property_expression.prototype.__proto__ || Object.getPrototypeOf(property_expression.prototype), "results", this);
        results._properties = results._properties.matched;
        results.properties = results._properties.map(function (property) {
          return property.results.identifier;
        });
        return results;
      }
    }]);

    return property_expression;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "expression",
    tests: [["the foo of bar", "bar.foo"], ["the foo of the bar", "bar.foo"], ["the foo of the bar of the baz", "baz.bar.foo"], ["the foo-bar of the baz", "baz.foo_bar"]]
  }]

}, {
  name: "my_property_expression",
  alias: "expression",
  syntax: "(my|this) {identifier}",
  constructor: function (_Rule$Sequence2) {
    _inherits(my_property_expression, _Rule$Sequence2);

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
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "expression",
    tests: [["my foo", "this.foo"], ["this bank-account", "this.bank_account"]]
  }]
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
  constructor: function (_Rule$Sequence3) {
    _inherits(args, _Rule$Sequence3);

    function args() {
      _classCallCheck(this, args);

      return _possibleConstructorReturn(this, (args.__proto__ || Object.getPrototypeOf(args)).apply(this, arguments));
    }

    _createClass(args, [{
      key: "toSource",

      // Returns an array of argument values
      value: function toSource() {
        var args = this.results.args;

        return args.join(", ");
      }
    }]);

    return args;
  }(_Rule2.default.Sequence),
  tests: [{
    tests: [["with a", "a"], ["with a, b, c", "a, b, c"], ["with a, b, c,", "a, b, c"]]
  }]
},

// Properties clause: creates an object with one or more property values.
//	`foo = 1, bar = 2`
//TODO: would like to use `and` but that conflicts with "and" operator
//TODO: don't quote if we don't have to? (ASCII and blacklist only)
//TOOD: multiple lines if > 2 props?
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
        var props = this.matched.map(function (prop) {
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
  }(_Rule2.default.List),
  tests: [{
    tests: [["", undefined], ["a = 1", "{ \"a\": 1 }"], ["a = 1,", "{ \"a\": 1 }"], ["a = 1, b = yes, c = \"quoted\"", "{ \"a\": 1, \"b\": true, \"c\": \"quoted\" }"], ["a = 1, b = the foo of the bar", "{ \"a\": 1, \"b\": bar.foo }"]]
  }]
}, {
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
        var _results2 = this.results,
            name = _results2.name,
            superType = _results2.superType,
            statements = _results2.statements;

        var output = "class " + name;
        if (superType) output += " extends " + superType;
        output += " " + statements;
        return output;
      }
    }]);

    return define_type;
  }(_Rule2.default.BlockStatement),
  tests: [{
    compileAs: "statements",
    tests: [["define type Foo", "class Foo {}"], ["define type Foo as a Bar", "class Foo extends Bar {}"], ["define type Foo\n\ta = yes", "class Foo {\n\ta = true\n}"], ["define type Foo\n\ta = yes\n\tb = no", "class Foo {\n\ta = true\n\tb = false\n}"]]
  }]

},

// `new` or `create`
// This works as an expression OR a statement.
// NOTE: we assume that all types take an object of properties????
//FIXME: `list`, `text`, etc don't follow these semantics and should be disallowed... ???
{
  name: "new_thing",
  alias: ["expression", "statement"],
  syntax: "(create|new) {type} (?:with {props:object_literal_properties})?",
  constructor: function (_Rule$Sequence4) {
    _inherits(new_thing, _Rule$Sequence4);

    function new_thing() {
      _classCallCheck(this, new_thing);

      return _possibleConstructorReturn(this, (new_thing.__proto__ || Object.getPrototypeOf(new_thing)).apply(this, arguments));
    }

    _createClass(new_thing, [{
      key: "toSource",
      value: function toSource() {
        var _results3 = this.results,
            type = _results3.type,
            _results3$props = _results3.props,
            props = _results3$props === undefined ? "" : _results3$props;
        // Special case for object, which we'll create with an object literal.

        if (type === "Object") {
          if (!props) return "{}";
          return props;
        }

        return "new " + type + "(" + props + ")";
      }
    }]);

    return new_thing;
  }(_Rule2.default.Sequence),
  tests: [{
    title: "creates normal objects properly",
    compileAs: "statement",
    tests: [["create Object", "{}"], ["new Object", "{}"], ["new Object with a = 1, b = yes", "{ \"a\": 1, \"b\": true }"], ["new Foo", "new Foo()"], ["new Foo with a = 1, b = yes", "new Foo({ \"a\": 1, \"b\": true })"]]
  }, {
    title: "creates special types",
    compileAs: "expression",
    tests: [["create object", "{}"],
    //FIXME: the following don't make sense if they have arguments...
    ["create List", "new Array()"], ["create list", "new Array()"]]
  }]

},

//
//	declare properties
//

{
  //TODO: another name for `constant` ?
  name: "declare_property",
  alias: ["statement", "mutatesScope"],
  syntax: "(scope:property|constant|shared property) {name:identifier} (?:= {value:expression})?",
  constructor: function (_Rule$Sequence5) {
    _inherits(declare_property, _Rule$Sequence5);

    function declare_property() {
      _classCallCheck(this, declare_property);

      return _possibleConstructorReturn(this, (declare_property.__proto__ || Object.getPrototypeOf(declare_property)).apply(this, arguments));
    }

    _createClass(declare_property, [{
      key: "toSource",
      value: function toSource() {
        var _results4 = this.results,
            scope = _results4.scope,
            name = _results4.name,
            _results4$value = _results4.value,
            value = _results4$value === undefined ? "" : _results4$value;

        if (value) value = " = " + value;

        var declaration = "" + name + value;
        switch (scope) {
          case "constant":
            if (!value) console.warn("parse('declare_property'): constant properties must declare a value:  ", this.matchedText);
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
        var _results5 = this.results,
            scope = _results5.scope,
            name = _results5.name;

        return { type: "property", name: name, scope: scope };
      }
    }]);

    return declare_property;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "statement",
    tests: [["property foo", "foo"],
    //FIXME          ["constant foo", "const foo"],
    ["shared property foo", "@proto foo"], ["property foo = the foo of the bar", "foo = bar.foo"], ["constant foo = 'some text'", "const foo = 'some text'"], ["shared property foo = new object with a = 1", "@proto foo = { \"a\": 1 }"]]
  }]
},

// TODO: merge with `declare_property`?
// TODO: in class/object scope only?
// TODO: `@typed` decorator to make substitution cleaner
{
  name: "declare_property_of_type",
  alias: ["statement", "mutatesScope"],
  syntax: "property {name:identifier} as (a|an)? {type} (?:= {value:expression})?",
  constructor: function (_Rule$Sequence6) {
    _inherits(declare_property_of_type, _Rule$Sequence6);

    function declare_property_of_type() {
      _classCallCheck(this, declare_property_of_type);

      return _possibleConstructorReturn(this, (declare_property_of_type.__proto__ || Object.getPrototypeOf(declare_property_of_type)).apply(this, arguments));
    }

    _createClass(declare_property_of_type, [{
      key: "toSource",
      value: function toSource() {
        var _results6 = this.results,
            name = _results6.name,
            type = _results6.type,
            _results6$value = _results6.value,
            value = _results6$value === undefined ? "undefined" : _results6$value;

        return "@typed(" + type + ") " + name + " = " + value;
      }

      // Return a logical representation of the data structure

    }, {
      key: "toStructure",
      value: function toStructure() {
        var _results7 = this.results,
            name = _results7.name,
            type = _results7.type;

        return { type: "property", subType: "setter", name: name, dataType: type };
      }
    }]);

    return declare_property_of_type;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "statement",
    tests: [["property foo as a Foo", "@typed(Foo) foo = undefined"], ["property foo as text = 'default value'", "@typed(String) foo = 'default value'"], ["property foo as a list = []", "@typed(Array) foo = []"]]
  }]

},

// TODO: `@typed` decorator which takes array to make logic cleaner
// TODO: assign to first value if no default?
// TODO: allow list to be an expression?
{
  name: "declare_property_as_one_of",
  alias: ["statement", "mutatesScope"],
  syntax: "property {name:identifier} as one of (?:list:[{expression},]+|{literal_list}) (?:= {value:expression})?",
  constructor: function (_Rule$Sequence7) {
    _inherits(declare_property_as_one_of, _Rule$Sequence7);

    function declare_property_as_one_of() {
      _classCallCheck(this, declare_property_as_one_of);

      return _possibleConstructorReturn(this, (declare_property_as_one_of.__proto__ || Object.getPrototypeOf(declare_property_as_one_of)).apply(this, arguments));
    }

    _createClass(declare_property_as_one_of, [{
      key: "toSource",
      value: function toSource() {
        var _results8 = this.results,
            name = _results8.name,
            list = _results8.list,
            _results8$value = _results8.value,
            value = _results8$value === undefined ? "undefined" : _results8$value;

        // TODO: this is ugly...

        list = (0, _flattenDeep2.default)(list);
        list = list.length === 1 && typeof list[0] === "string" ? list[0] : list.join(", ");
        if (list[0] !== "[") list = "[" + list + "]";
        return "@typed(" + list + ") " + name + " = " + value;
      }

      // Return a logical representation of the data structure

    }, {
      key: "toStructure",
      value: function toStructure() {
        var _results9 = this.results,
            name = _results9.name,
            plural = _results9.plural;

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
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "statement",
    tests: [["property foo as one of [1, 2, 3]", "@typed([1, 2, 3]) foo = undefined"], ["property foo as one of yes, no, undefined", "@typed([true, false, undefined]) foo = undefined"], ["property foo as one of [1, 2, 3] = 1", "@typed([1, 2, 3]) foo = 1"], ["property foo as one of yes, no, undefined = yes", "@typed([true, false, undefined]) foo = true"]]
  }]
},

// Getter.
// TODO: `to get x` ?
// TODO: make the `:` optional in a way that doesn't conflict with `get x`
// TODO: implicit return in block form
{
  name: "getter",
  alias: ["statement", "mutatesScope"],
  syntax: "get {name:identifier}\\: return? {expression}?",
  constructor: function (_Rule$BlockStatement2) {
    _inherits(getter, _Rule$BlockStatement2);

    function getter() {
      _classCallCheck(this, getter);

      return _possibleConstructorReturn(this, (getter.__proto__ || Object.getPrototypeOf(getter)).apply(this, arguments));
    }

    _createClass(getter, [{
      key: "toSource",
      value: function toSource() {
        // NOTE: we need to parse `expression` and `block` manually (unlike other BlockStatements)
        var _results10 = this.results,
            name = _results10.name,
            expression = _results10.expression,
            block = _results10.block;

        var statements = void 0;
        if (block) {
          statements = block;
        } else if (expression) {
          var returnPrefix = expression.startsWith("return ") ? "" : "return ";
          statements = "{ " + returnPrefix + expression + " }";
        } else {
          statements = "{}";
        }
        return "get " + name + "() " + statements;
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
  }(_Rule2.default.BlockStatement),
  tests: [{
    compileAs: "statements",
    tests: [["get foo:", "get foo() {}"], ["get foo: a", "get foo() { return a }"], ["get foo: return a", "get foo() { return a }"], ["get foo:\n\treturn a", "get foo() {\n\treturn a\n}"], ["get foo:\n\tside-effect = yes\n\treturn a", "get foo() {\n\tside_effect = true\n\treturn a\n}"]]
  }]
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
  constructor: function (_Rule$BlockStatement3) {
    _inherits(setter, _Rule$BlockStatement3);

    function setter() {
      _classCallCheck(this, setter);

      return _possibleConstructorReturn(this, (setter.__proto__ || Object.getPrototypeOf(setter)).apply(this, arguments));
    }

    _createClass(setter, [{
      key: "toSource",
      value: function toSource() {
        // default args to the setter name
        var _results11 = this.results,
            name = _results11.name,
            _results11$args = _results11.args,
            args = _results11$args === undefined ? name : _results11$args,
            statements = _results11.statements;
        // Complain if more than one argument

        if (args && args.includes(",")) {
          console.warn("parse('setter'): only one argument allowed in setter:  ", args);
          args = args.trim().split(",")[0];
        }
        return "set " + name + "(" + args + ") " + statements;
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
  }(_Rule2.default.BlockStatement),
  tests: [{
    compileAs: "statements",
    tests: [
    // no body
    ["set color", "set color(color) {}"], ["set color:", "set color(color) {}"], ["set color with culr", "set color(culr) {}"], ["set color with culr:", "set color(culr) {}"],
    // inline form
    ["set color set the color of my text to color", "set color(color) { this.text.color = color }"], ["set color: set the color of my text to color", "set color(color) { this.text.color = color }"], ["set color with culr set the color of my text to culr", "set color(culr) { this.text.color = culr }"], ["set color with culr: set the color of my text to culr", "set color(culr) { this.text.color = culr }"],
    // nested block form
    ["set color\n\tset the color of my text to color", "set color(color) {\n\tthis.text.color = color\n}"], ["set color:\n\tset the color of my text to color", "set color(color) {\n\tthis.text.color = color\n}"], ["set color with culr\n\tset the color of my text to culr", "set color(culr) {\n\tthis.text.color = culr\n}"], ["set color with culr:\n\tset the color of my text to culr", "set color(culr) {\n\tthis.text.color = culr\n}"]]
  }]
},

// Declare instance method or normal function.
// TODO: static/etc
{
  name: "declare_method",
  alias: ["statement", "mutatesScope"],
  syntax: "(operator:to|on) {name:identifier} {args}? (\\:)? {statement}?",
  constructor: function (_Rule$BlockStatement4) {
    _inherits(declare_method, _Rule$BlockStatement4);

    function declare_method() {
      _classCallCheck(this, declare_method);

      return _possibleConstructorReturn(this, (declare_method.__proto__ || Object.getPrototypeOf(declare_method)).apply(this, arguments));
    }

    _createClass(declare_method, [{
      key: "toStructure",

      // Return a logical representation of the data structure
      value: function toStructure() {
        var _results12 = this.results,
            operator = _results12.operator,
            name = _results12.name,
            _results12$args = _results12.args,
            args = _results12$args === undefined ? [] : _results12$args;

        var subType = operator === "to" ? "method" : "event";
        return { type: "function", subType: subType, name: name, args: args };
      }
    }, {
      key: "toSource",
      value: function toSource() {
        var _results13 = this.results,
            name = _results13.name,
            _results13$args = _results13.args,
            args = _results13$args === undefined ? "" : _results13$args,
            statements = _results13.statements;

        return name + "(" + args + ") " + statements;
      }
    }]);

    return declare_method;
  }(_Rule2.default.BlockStatement),
  tests: [{
    compileAs: "statements",
    tests: [["on foo", "foo() {}"], ["to foo", "foo() {}"], ["to foo:", "foo() {}"], ["to foo with a", "foo(a) {}"], ["to foo with a, b", "foo(a, b) {}"], ["to foo with a,b,c", "foo(a, b, c) {}"], ["to foo a = yes", "foo() { a = true }"], ["to foo: a = yes", "foo() { a = true }"], ["to foo with a: a = yes", "foo(a) { a = true }"], ["to foo\n\ta = yes", "foo() {\n\ta = true\n}"], ["to foo with a, b\n\ta = yes\n\tb = no", "foo(a, b) {\n\ta = true\n\tb = false\n}"]]
  }]

},

// Declare "action", which can be called globally and affects the parser.
// TODO: `turn a card over`
// TODO: {keyword:{identifier} (keywords:({word}|{type})?)
// TODO: `with` clause (will conflict with `word`)
// TODO: install the action as a special in the parser somehow
// TODO: create instance function?  or maybe we don't need it:
//			`action turn Card over` for an instance is just `turn me over`
//			`action add card to deck` => `add me to deck`
//TESTME
{
  name: "declare_action",
  alias: ["statement", "mutatesScope"],
  syntax: "action (keywords:{word}|{type})+ \\: {statement}?",
  constructor: function (_Rule$BlockStatement5) {
    _inherits(declare_action, _Rule$BlockStatement5);

    function declare_action() {
      _classCallCheck(this, declare_action);

      return _possibleConstructorReturn(this, (declare_action.__proto__ || Object.getPrototypeOf(declare_action)).apply(this, arguments));
    }

    _createClass(declare_action, [{
      key: "toSource",
      value: function toSource() {
        var _results14 = this.results,
            name = _results14.name,
            _results14$args = _results14.args,
            args = _results14$args === undefined ? [] : _results14$args,
            types = _results14.types,
            statements = _results14.statements;
        // figure out if there are any conditions due to known argument types
        //         let conditions = [];
        //         for (let arg in types) {
        //           conditions.push(`\tif (!spell.isA(${arg}, ${types[arg]})) return undefined`);
        //         }
        // Create as a STATIC function

        return "static " + name + "(" + args.join(", ") + ") " + statements;
      }
    }, {
      key: "toStructure",
      value: function toStructure() {
        var _results15 = this.results,
            name = _results15.name,
            args = _results15.args,
            types = _results15.types;

        return { type: "function", subType: "action", name: name, args: args, types: types };
      }
    }, {
      key: "results",

      // Add `name`, `args` and `types` to matched source
      get: function get() {
        var results = _get(declare_action.prototype.__proto__ || Object.getPrototypeOf(declare_action.prototype), "results", this);

        // if there's only one keyword, it can't be a type or a blacklisted identifier
        var keywords = results.keywords;

        var _keywords = results._keywords.matched;
        if (_keywords.length === 1) {
          var keyword = keywords[0];
          if (_keywords[0] instanceof _Rule2.default.Type) {
            console.error("parse('declare_action'): one-word actions may not be types: " + keyword);
          }
          // TODO...
          //   let parser = (context && context.parser) || global.parser;
          //   let blacklist = parser.getBlacklist("identifier");
          //   if (blacklist[keyword]) {
          //     console.error(`parse('declare_action'): one-word actions may not be blacklisted identifiers": ${keyword}`);
          //   }
        }

        // figure out arguments and/or types
        results.args = [];
        results.types = {};

        // if any of the words are types (capital letter) make that an argument of the same name.
        _keywords.map(function (item, index) {
          if (item instanceof _Rule2.default.Type) {
            var Type = keywords[index];
            var type = Type.toLowerCase();

            results.types[type] = Type;
            results.args.push(type);

            // replace with lowercase in method name
            keywords[index] = type;
          }
        });
        // get static method name and arguments for results
        results.name = keywords.join("_");
        return results;
      }
    }]);

    return declare_action;
  }(_Rule2.default.BlockStatement),
  tests: [{
    compileAs: "statements",
    showAll: true,
    tests: [["action turn Card over:", "static turn_card_over(card) {}"], ["action add Card to Pile:", "static add_card_to_pile(card, pile) {}"], ["action turn Card over: set the direction of the card to 'up'", "static turn_card_over(card) { card.direction = 'up' }"], ["action turn Card over:\n\tset the direction of the card to 'up'", "static turn_card_over(card) {\n\tcard.direction = 'up'\n}"]]
  }]

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

// `undefined` as an expression... ???
{
  name: "undefined",
  alias: "expression",
  syntax: "undefined",
  constructor: function (_Rule$Keywords) {
    _inherits(_undefined, _Rule$Keywords);

    function _undefined() {
      _classCallCheck(this, _undefined);

      return _possibleConstructorReturn(this, (_undefined.__proto__ || Object.getPrototypeOf(_undefined)).apply(this, arguments));
    }

    _createClass(_undefined, [{
      key: "toSource",
      value: function toSource() {
        return "undefined";
      }
    }]);

    return _undefined;
  }(_Rule4.default.Keywords),
  tests: [{
    compileAs: "expression",
    tests: [["undefined", "undefined"]]
  }]

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
    title: "converts special types",
    tests: [["List", "Array"], ["list", "Array"], ["text", "String"], ["character", "Character"], ["number", "Number"], ["integer", "Integer"], ["decimal", "Decimal"], ["boolean", "Boolean"], ["object", "Object"]]
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
		//    - `match.name`:       name of the rule if set up by parseRule

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
						var sourceName = match.argument || match.group || match.name;
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
//	`this.matched` is array of matched item rules (delmiter is ignored).
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

		// Returns JS Array of matched items as source.
		//TODO: `JSDelimiter` to return as a single string?

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
					// if the last matched item wants to eat a block, give it the block
					var last = matched[matched.length - 1];
					if (last.parseBlock) {
						last.parseBlock(parser, item, indent + 1);
					}
					// otherwise add the block to the stream
					else {
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
			return "{\n" + this.blockToSource() + "\n" + "}";
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
		//
		// Indents with tabs, e.g.  `{¬»statement_1¬»statement2¬}`

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

		// Enclose a single statement.

	}, {
		key: "encloseStatement",
		value: function encloseStatement(statement, forceWrap) {
			if (!statement) return "{}";
			if (!forceWrap && !statement.includes("\n") && statement.length < 40) {
				return "{ " + statement.trim() + " }";
			}
			if (statement[0] !== "\t") statement = "\t" + statement;
			return "{\n" + statement + "\n}";
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
// Note that it's considered an error to have BOTH an inline statement AND a nested block.
//
//  e.g. a `BlockStatement` with syntax `if {expression} then {statement}?` will attemt to:
//  - match the optional `statement` as an inline-statement (as `results.statement`)
//  - match an INDENTED block starting on the next line (as `result.block`)
//
//	For your convenience in `toSource()`, you can just look at `results.statements`
//  which will be one of the following (whichever comes first):
//    - the block and its statements, enclosed in curly braces and indented, or
//    - the formatted `statement`, enclosed in curly brackets,
//    - `{}` if neither statement or block was matched.
Rule.BlockStatement = function (_Rule$Block2) {
	_inherits(block_statement, _Rule$Block2);

	function block_statement() {
		_classCallCheck(this, block_statement);

		return _possibleConstructorReturn(this, (block_statement.__proto__ || Object.getPrototypeOf(block_statement)).apply(this, arguments));
	}

	_createClass(block_statement, [{
		key: "parseBlock",


		// Parse a nested block which appears directly after our "main" rule.
		// Adds to our `matched` list as necessary.
		value: function parseBlock() {
			if (!this.matched) throw new ParseError((this.name || "blockStatement") + ".parseBlock(): no matched!");
			var block = _get(block_statement.prototype.__proto__ || Object.getPrototypeOf(block_statement.prototype), "parseBlock", this).apply(this, arguments);
			if (!block) return;
			block.argument = "block";
			this.matched.push(block);
		}

		// Add `statements` to the results.

	}, {
		key: "results",
		get: function get() {
			var results = _get(block_statement.prototype.__proto__ || Object.getPrototypeOf(block_statement.prototype), "results", this);
			if (!results) return results;

			// If we got a block, use that for our `statements`
			if (results.block) {
				results._statements = results._block;
				results.statements = results.block;
			}
			// otherwise use the `statement`, if it's empty this will return the empty string.
			else {
					results._statements = results._statement;
					results.statements = Rule.Block.encloseStatement(results.statement);
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

var _flatten = __webpack_require__(715);

var _flatten2 = _interopRequireDefault(_flatten);

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

// Return array of rules generated by parsing rule `syntax`, instantiating with `constructor` passed in.
function parseRule(syntax, constructor) {
  // If we got an array of possible syntaxes...
  if (Array.isArray(syntax)) {
    // ...recursively parse each syntax, using a CLONE of the constructor.
    return (0, _flatten2.default)(syntax.map(function (syntax) {
      return parseRule(syntax, constructor && (0, _class.cloneClass)(constructor));
    }));
  };

  var rules = parseSyntax(syntax);
  if (rules.length === 0) {
    throw new SyntaxError("parser.defineRule(" + names[0] + ", " + syntax + "): no rule produced");
  }

  if (!constructor) {
    // If we only got one rule, just return it
    if (rules.length === 1) return rules;

    // Otherwise group the rules together and return that
    return [new _Rule2.default.Alternatives({ rules: rules })];
  } else {
    // Make an instance of the rule and add relevant properties to its prototype non-enumerably
    if (constructor.prototype instanceof _Rule2.default.Keywords || constructor.prototype instanceof _Rule2.default.Symbols || constructor.prototype instanceof _Rule2.default.List || constructor.prototype instanceof _Rule2.default.Alternatives) {
      for (var property in rules[0]) {
        Object.defineProperty(constructor.prototype, property, { value: rules[0][property] });
      }
    } else {
      Object.defineProperty(constructor.prototype, "rules", { value: rules });
    }

    return [new constructor()];
  }
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

/***/ 948:
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

// Create "UI" parser.
var parser = _Parser2.default.forModule("UI");
exports.default = parser;


parser.defineRules(
// Alert a message.
{
  name: "alert",
  alias: ["statement", "mutatesScope", "async"],
  syntax: "alert {message:expression} (?:with {okButton:text})?",
  // TODO: need some fancy promise juju to make parent funtion async?
  constructor: function (_Rule$Sequence) {
    _inherits(alert, _Rule$Sequence);

    function alert() {
      _classCallCheck(this, alert);

      return _possibleConstructorReturn(this, (alert.__proto__ || Object.getPrototypeOf(alert)).apply(this, arguments));
    }

    _createClass(alert, [{
      key: "toSource",
      value: function toSource() {
        var _results = this.results,
            message = _results.message,
            _results$okButton = _results.okButton,
            okButton = _results$okButton === undefined ? '"OK"' : _results$okButton;

        return "await spell.alert(" + message + ", " + okButton + ")";
      }
    }]);

    return alert;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "statement",
    tests: [["alert 'Yo!'", "await spell.alert('Yo!', \"OK\")"], ["alert \"Yo!\"", "await spell.alert(\"Yo!\", \"OK\")"], ["alert 'Yo!' with 'yep'", "await spell.alert('Yo!', 'yep')"], ["alert \"Yo!\" with \"yep\"", "await spell.alert(\"Yo!\", \"yep\")"]]
  }]
},

// Warning message -- like alert but fancier.
// TODO: need some fancy promise juju here?
//TESTME
{
  name: "warn",
  alias: "statement",
  syntax: "warn {message:expression} (?:with {okButton:text})?",
  constructor: function (_Rule$Sequence2) {
    _inherits(warn, _Rule$Sequence2);

    function warn() {
      _classCallCheck(this, warn);

      return _possibleConstructorReturn(this, (warn.__proto__ || Object.getPrototypeOf(warn)).apply(this, arguments));
    }

    _createClass(warn, [{
      key: "toSource",
      value: function toSource() {
        var _results2 = this.results,
            message = _results2.message,
            _results2$okButton = _results2.okButton,
            okButton = _results2$okButton === undefined ? '"OK"' : _results2$okButton;

        return "await spell.warn(" + message + ", " + okButton + ")";
      }
    }]);

    return warn;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "statement",
    tests: [["warn 'Yo!'", "await spell.warn('Yo!', \"OK\")"], ["warn 'Yo!' with 'yep'", "await spell.warn('Yo!', 'yep')"], ["warn \"Yo!\"", "await spell.warn(\"Yo!\", \"OK\")"], ["warn \"Yo!\" with \"yep\"", "await spell.warn(\"Yo!\", \"yep\")"]]
  }]
},

// Confirm message -- present a question with two answers.
// TODO: need some fancy promise juju here?
//TESTME
{
  name: "confirm",
  alias: "statement",
  syntax: "confirm {message:expression} (?:with {okButton:text} (?: (and|or) {cancelButton:text})? )?",
  constructor: function (_Rule$Sequence3) {
    _inherits(confirm, _Rule$Sequence3);

    function confirm() {
      _classCallCheck(this, confirm);

      return _possibleConstructorReturn(this, (confirm.__proto__ || Object.getPrototypeOf(confirm)).apply(this, arguments));
    }

    _createClass(confirm, [{
      key: "toSource",
      value: function toSource() {
        var _results3 = this.results,
            message = _results3.message,
            _results3$okButton = _results3.okButton,
            okButton = _results3$okButton === undefined ? '"OK"' : _results3$okButton,
            _results3$cancelButto = _results3.cancelButton,
            cancelButton = _results3$cancelButto === undefined ? '"Cancel"' : _results3$cancelButto;

        return "await spell.confirm(" + message + ", " + okButton + ", " + cancelButton + ")";
      }
    }]);

    return confirm;
  }(_Rule2.default.Sequence),
  tests: [{
    compileAs: "statement",
    tests: [["confirm 'Yo!'", "await spell.confirm('Yo!', \"OK\", \"Cancel\")"], ["confirm 'Yo!' with 'yep'", "await spell.confirm('Yo!', 'yep', \"Cancel\")"], ["confirm 'Yo!' with 'yep' and 'nope'", "await spell.confirm('Yo!', 'yep', 'nope')"], ["confirm 'Yo!' with 'yep' or 'nope'", "await spell.confirm('Yo!', 'yep', 'nope')"], ["confirm \"Yo!\" with \"yep\" or \"nope\"", "await spell.confirm(\"Yo!\", \"yep\", \"nope\")"]]
  }]
});

/***/ }),

/***/ 949:
/***/ (function(module, exports, __webpack_require__) {

var baseFlatten = __webpack_require__(123);

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Recursively flattens `array`.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @returns {Array} Returns the new flattened array.
 * @example
 *
 * _.flattenDeep([1, [2, [3, [4]], 5]]);
 * // => [1, 2, 3, 4, 5]
 */
function flattenDeep(array) {
  var length = array == null ? 0 : array.length;
  return length ? baseFlatten(array, INFINITY) : [];
}

module.exports = flattenDeep;


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvc3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2ZhaWxzLmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9saWIva2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvc3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY29mLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19saWJyYXJ5LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LXBpZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcG4uanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLWtleS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW50ZWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fd2tzLWV4dC5qcyIsIndlYnBhY2s6Ly8vLi9+L2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL3NyYy9QYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9ldmVudF9oYW5kbGVycy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL21hdGNoX2tleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9wYXJzZV9rZXlzLmpzIiwid2VicGFjazovLy8uL34vc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL1NwZWxsRWRpdG9yLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvcnVsZXMvc3BlbGwvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9FeGFtcGxlU3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL1NwYWNlci5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9UYWJiYWJsZVRleHRBcmVhLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL2luZGV4LmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL3V0aWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21lbW9pemUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL0pTWC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcnVsZXMvc3BlbGwvaWYuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL2xpc3RzLmpzIiwid2VicGFjazovLy8uL3NyYy9ydWxlcy9zcGVsbC9vcGVyYXRvcnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL3N0YXRlbWVudHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL3R5cGVzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9lczYvc3ltYm9sLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY2xhc3NvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY3R4LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faHRtbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faXMtYXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX21ldGEuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1jcmVhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcHMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wbi1leHQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3NldC10by1zdHJpbmctdGFnLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL190by1hYnNvbHV0ZS1pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tbGVuZ3RoLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL193a3MtZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL2VzNi5zeW1ib2wuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9TcGFjZXIubGVzcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL3N0eWxlcy5sZXNzIiwid2VicGFjazovLy8uL3NyYy9ydWxlcy9zcGVsbC9jb3JlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kZXNjcmlwdG9ycy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faGFzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2ZhY3RvcnlXaXRoVGhyb3dpbmdTaGltcy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9jbGFzc19kZWNvcmF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvbWV0aG9kX2RlY29yYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9tZXRob2RfZGVjb3JhdG9yX3Njb3BlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9hcnJheS5mcm9tLmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvZG9tX2hlbHBlcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9saXN0ZW5lcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi91dWlkLmpzIiwid2VicGFjazovLy8uL3NyYy9SdWxlLmpzIiwid2VicGFjazovLy8uL3NyYy9SdWxlU3ludGF4LmpzIiwid2VicGFjazovLy8uL3NyYy9Ub2tlbml6ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2lzLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdWlkLmpzIiwid2VicGFjazovLy8uL34vc3R5bGUtbG9hZGVyL2ZpeFVybHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9TcGFjZXIubGVzcz8wOGRlIiwid2VicGFjazovLy8uL3NyYy9hcHAvc3R5bGVzLmxlc3M/YjdlNyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvY2xhc3MuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL1VJLmpzIiwid2VicGFjazovLy8uL34vbG9kYXNoL2ZsYXR0ZW5EZWVwLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL193a3MuanMiXSwibmFtZXMiOlsiaXNXaGl0ZXNwYWNlIiwic2hvd1doaXRlc3BhY2UiLCJwbHVyYWxpemUiLCJpc1BsdXJhbCIsInNpbmd1bGFyaXplIiwiaXNTaW5ndWxhciIsImdldFRhYnMiLCJBTExfV0hJVEVTUEFDRSIsInRleHQiLCJ0ZXN0Iiwic3RyaW5nIiwicmVwbGFjZSIsIndvcmQiLCJUQUJTIiwibnVtYmVyIiwic3Vic3RyIiwiYWxsRXhwb3J0cyIsImV4cG9ydHMiLCJnbG9iYWwiLCJTVFJJTkciLCJnbG9iYWxfaWRlbnRpZmllciIsIndpbmRvdyIsInNlbGYiLCJQYXJzZUVycm9yIiwiY29uc29sZSIsImdyb3VwIiwibG9nIiwiZ3JvdXBFbmQiLCJhcmdzIiwiRXJyb3IiLCJhcHBseSIsImNhcHR1cmVTdGFja1RyYWNlIiwicHJvdG90eXBlIiwiUGFyc2VyIiwicHJvcGVydGllcyIsImltcG9ydHMiLCJfcnVsZXMiLCJPYmplY3QiLCJhc3NpZ24iLCJydWxlTmFtZSIsImFyZ3VtZW50cyIsImxlbmd0aCIsIlRJTUUiLCJ0aW1lIiwidG9rZW5zIiwiVG9rZW5pemVyIiwidG9rZW5pemUiLCJmaWx0ZXIiLCJpc05vcm1hbFdoaXRlc3BhY2UiLCJ0b2tlbiIsInRpbWVFbmQiLCJ1bmRlZmluZWQiLCJyZW1vdmVMZWFkaW5nV2hpdGVzcGFjZSIsInJlc3VsdCIsInBhcnNlTmFtZWRSdWxlIiwicGFyc2UiLCJ0b1NvdXJjZSIsInN0YXJ0IiwiZW5kIiwic3RhY2siLCJjYWxsaW5nQ29udGV4dCIsInJ1bGUiLCJydWxlcyIsInJldmVyc2UiLCJjb25jYXQiLCJfX3J1bGVzIiwiQXJyYXkiLCJpc0FycmF5IiwiZm9yRWFjaCIsImFkZFJ1bGUiLCJtZXJnZVJ1bGUiLCJSdWxlIiwiQWx0ZXJuYXRpdmVzIiwicmVkdWNlIiwiYmxhY2tsaXN0IiwiZGVmaW5lUnVsZSIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJuYW1lIiwiVHlwZUVycm9yIiwibW9kdWxlIiwiY2Fub25pY2FsIiwibWFwIiwia2V5Iiwia2V5cyIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJuYW1lcyIsImFsaWFzIiwic3ludGF4IiwidGVzdHMiLCJvdXRwdXQiLCJmb3JNb2R1bGUiLCJwYXJzZXIiLCJSRUdJU1RSWSIsImV4aXN0aW5nIiwiYWx0Q29uc3RydWN0b3IiLCJzdGFydFRva2VuIiwiZW5kVG9rZW4iLCJuZXN0aW5nIiwibmVzdGVkIiwibGFzdEluZGV4Iiwic2xpY2UiLCJERUJVRyIsIldBUk4iLCJTcGVsbEVkaXRvciIsIm9ic2VydmVyIiwiZXhhbXBsZXMiLCJsb2FkIiwic3BlbGxFZGl0b3IiLCJzYXZlIiwicmV2ZXJ0IiwiY29tcGlsZSIsImNyZWF0ZSIsImRlbGV0ZSIsInJlbmFtZSIsImR1cGxpY2F0ZSIsInJlc2V0IiwidGl0bGVzIiwic2VsZWN0ZWQiLCJkaXJ0eSIsImNvZGUiLCJvcHRpb25zIiwidGl0bGUiLCJjb250ZW50Iiwib25DbGljayIsInNlbGVjdCIsImRpcnR5QnV0dG9ucyIsInBvc2l0aW9uIiwicmlnaHQiLCJ0b3AiLCJtYXJnaW4iLCJjb21waWxlQnV0dG9uIiwid2lkdGgiLCJsZWZ0IiwiaGVpZ2h0IiwicGFkZGluZ1RvcCIsImV2ZW50IiwidXBkYXRlIiwidGFyZ2V0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJkZWZhdWx0UHJvcHMiLCJFeGFtcGxlU3RvcmUiLCJpbXBvcnQiLCJwYXJzZVJ1bGUiLCJiaW5kIiwibG9jYWxTdG9yYWdlIiwic3BlbGxFZGl0b3JFeGFtcGxlcyIsInNwZWxsRWRpdG9yRXhhbXBsZSIsImxvY2F0aW9uIiwicmVsb2FkIiwiSlNPTiIsIl9zYXZlZEV4YW1wbGVzIiwic3RyaW5naWZ5IiwiZXhhbXBsZSIsInNraXBTYXZlIiwic2hvd0NvbmZpcm0iLCJjb25maXJtIiwicHJvbXB0Iiwib2xkTmFtZSIsIm5ld05hbWUiLCJ3YXJuIiwic2V0VGltZW91dCIsImluZm8iLCJvYnNlcnZhYmxlIiwiY29tcHV0ZWQiLCJTcGFjZXIiLCJjbGFzc05hbWUiLCJhcHBlYXJhbmNlIiwic2l6ZSIsImlubGluZSIsImZsdWlkIiwidGlueSIsInNtYWxsIiwibWVkaXVtIiwibGFyZ2UiLCJodWdlIiwibWFzc2l2ZSIsInNwYWNlclByb3BzIiwic3R5bGUiLCJwcm9wVHlwZXMiLCJQcm9wVHlwZXMiLCJib29sIiwiVGFiYmFibGVUZXh0QXJlYSIsIm9uS2V5RG93biIsImtleUNvZGUiLCJwcmV2ZW50RGVmYXVsdCIsImVsZW1lbnQiLCJzZWxlY3Rpb25TdGFydCIsInNlbGVjdGlvbkVuZCIsIm5ld1RleHQiLCJzaGlmdEtleSIsImxhc3RJbmRleE9mIiwiaW5kZXhPZiIsImxpbmVzIiwic3BsaXQiLCJsaW5lIiwiam9pbiIsIm9uQ2hhbmdlIiwiVGV4dEFyZWEiLCJSZWFjdERPTSIsInJlbmRlciIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJjbGFzc05hbWVzIiwiYXJnIiwiQm9vbGVhbiIsIm1lbW9pemVkIiwiZGVmaW5lTWVtb2l6ZWQiLCJwcm9wZXJ0eSIsImdldHRlciIsImNvbmZpZ3VyYWJsZSIsImdldCIsImRlZmluZVJ1bGVzIiwiSlNYRWxlbWVudCIsImNsb25lIiwibWF0Y2hlZCIsIm5leHRTdGFydCIsImpzeEVsZW1lbnQiLCJhdHRyaWJ1dGVzIiwiYXR0cnMiLCJKU1hFeHByZXNzaW9uIiwianN4RXhwcmVzc2lvblRvU291cmNlIiwiY2hpbGRyZW4iLCJjaGlsZCIsInRyaW0iLCJjaGlsZFNvdXJjZSIsImpzeEVsZW1lbnRUb1NvdXJjZSIsIlN5bnRheEVycm9yIiwianN4RXhwcmVzc2lvbiIsInRhZ05hbWUiLCJhdHRyc1RvU291cmNlIiwiY2hpbGRyZW5Ub1NvdXJjZSIsInJlc3VsdHMiLCJjb25kaXRpb24iLCJzdGF0ZW1lbnRzIiwiQmxvY2tTdGF0ZW1lbnQiLCJjb21waWxlQXMiLCJsZWZ0UmVjdXJzaXZlIiwidGVzdFJ1bGUiLCJLZXl3b3JkcyIsImxpdGVyYWxzIiwic3RhdGVtZW50IiwiZWxzZVN0YXRlbWVudCIsIlNlcXVlbmNlIiwibGlzdCIsImlkZW50aWZpZXIiLCJ0aGluZyIsIm9yZGluYWwiLCJleHByZXNzaW9uIiwiYXJndW1lbnQiLCJzaG93QWxsIiwibWF0Y2giLCJvcGVyYXRvciIsImJhbmciLCJpdGVtIiwiaXRlbVZhciIsInBvc2l0aW9uVmFyIiwiYmxvY2siLCJCbG9jayIsImVuY2xvc2VTdGF0ZW1lbnRzIiwibGhzIiwicmhzIiwiX29wZXJhdG9yIiwiYXBwbHlPcGVyYXRvciIsInByZWNlZGVuY2UiLCJhIiwiYiIsInR5cGUiLCJTeW1ib2xzIiwiZGlyZWN0aW9uIiwiX3Byb3BlcnRpZXMiLCJwcm9wIiwiTGlzdCIsInN0cnVjdHVyZSIsInN1cGVyVHlwZSIsInNjb3BlIiwiZGVjbGFyYXRpb24iLCJtYXRjaGVkVGV4dCIsInN1YlR5cGUiLCJkYXRhVHlwZSIsInBsdXJhbCIsInJldHVyblByZWZpeCIsInN0YXJ0c1dpdGgiLCJpbmNsdWRlcyIsInR5cGVzIiwia2V5d29yZHMiLCJfa2V5d29yZHMiLCJrZXl3b3JkIiwiVHlwZSIsImVycm9yIiwiaW5kZXgiLCJ0b0xvd2VyQ2FzZSIsInB1c2giLCJTdGF0ZW1lbnRzIiwiQ29tbWVudCIsInBhdHRlcm4iLCJQYXR0ZXJuIiwiTnVtYmVyIiwiTlVNQkVSX05BTUVTIiwiemVybyIsIm9uZSIsInR3byIsInRocmVlIiwiZm91ciIsImZpdmUiLCJzaXgiLCJzZXZlbiIsImVpZ2h0IiwibmluZSIsInRlbiIsIlRleHQiLCJxdW90ZWRTdHJpbmciLCJlbmRzV2l0aCIsIkxpdGVyYWxzIiwibWF0Y2hlc1N0YXJ0aW5nQXQiLCJsaXRlcmFsU2VwYXJhdG9yIiwiZmlyc3QiLCJldmVyeSIsImxpdGVyYWwiLCJpIiwib3B0aW9uYWwiLCJzb21lIiwic291cmNlIiwiU3VicnVsZSIsIm1hdGNoZWRSdWxlIiwic3VicnVsZSIsInRvU3ludGF4IiwiYWRkUmVzdWx0cyIsImNvbW1lbnQiLCJwcm9tb3RlIiwic291cmNlTmFtZSIsIm1hdGNoTmFtZSIsIm1hdGNoZXMiLCJiZXN0TWF0Y2giLCJnZXRCZXN0TWF0Y2giLCJiZXN0IiwiY3VycmVudCIsIlJlcGVhdCIsInJlcGVhdCIsImlzQ29tcG91bmRSdWxlIiwiZGVsaW1pdGVyIiwiaW5kZW50IiwiY29udGVudHMiLCJCbGFua0xpbmUiLCJsYXN0IiwicGFyc2VCbG9jayIsInBhcnNlU3RhdGVtZW50IiwiV2hpdGVzcGFjZSIsIlN0YXRlbWVudFBhcnNlRXJyb3IiLCJ1bnBhcnNlZCIsInBhcnNlZCIsImUiLCJibG9ja1RvU291cmNlIiwiX25hbWUiLCJfc3VwZXJUeXBlIiwibmFtZWQiLCJtZXRob2RzIiwib3RoZXIiLCJ0b1N0cnVjdHVyZSIsImFkZFN0cnVjdHVyZSIsImZvcmNlV3JhcCIsImJyZWFrSW50b0Jsb2NrcyIsIl9zdGF0ZW1lbnRzIiwiX2Jsb2NrIiwiX3N0YXRlbWVudCIsImVuY2xvc2VTdGF0ZW1lbnQiLCJ3aGl0ZXNwYWNlIiwibWVzc2FnZSIsInBhcnNlU3ludGF4IiwidG9rZW5pc2VSdWxlU3ludGF4IiwiU1lOVEFYX0VYUFJFU1NJT04iLCJzeW50YXhTdHJlYW0iLCJwYXJzZVRva2VuIiwicG9wIiwiS0VZV09SRF9QQVRURVJOIiwic3ludGF4VG9rZW4iLCJwYXJzZVN5bWJvbCIsInBhcnNlU3VicnVsZSIsInBhcnNlQWx0ZXJuYXRpdmVzIiwicGFyc2VMaXN0IiwicGFyc2VSZXBlYXQiLCJwYXJzZUtleXdvcmQiLCJuZXh0IiwiaXNFc2NhcGVkIiwiZmluZE5lc3RlZFRva2VucyIsImFsdGVybmF0aXZlcyIsImdyb3VwQWx0ZXJuYXRpdmVzIiwic3ltYm9sIiwicGFyYW1zIiwiYmFuZ1Bvc2l0aW9uIiwibm90IiwibmV3bGluZSIsIkluZGVudCIsIk5FV0xJTkUiLCJlYXRUb2tlbnMiLCJtYXRjaFRvcFRva2VucyIsIm1ldGhvZCIsImNhbGwiLCJtYXRjaFdoaXRlc3BhY2UiLCJtYXRjaFdvcmQiLCJtYXRjaE51bWJlciIsIm1hdGNoTmV3bGluZSIsIm1hdGNoSlNYRWxlbWVudCIsIm1hdGNoVGV4dCIsIm1hdGNoQ29tbWVudCIsIm1hdGNoU3ltYm9sIiwiZWF0V2hpdGVzcGFjZSIsIndoaXRlU3BhY2VFbmQiLCJ3aGl0ZXNwYWNlRW5kIiwiV09SRF9TVEFSVCIsIldPUkRfQ0hBUiIsIndvcmRFbmQiLCJOVU1CRVJfU1RBUlQiLCJOVU1CRVIiLCJudW1iZXJNYXRjaCIsIm1hdGNoRXhwcmVzc2lvbkF0SGVhZCIsIm51bWJlclN0ciIsInBhcnNlRmxvYXQiLCJxdW90ZVN5bWJvbCIsInRleHRFbmQiLCJjaGFyIiwiQ09NTUVOVCIsImNvbW1lbnRTdGFydCIsImdldExpbmVBdEhlYWQiLCJjb21tZW50TWF0Y2giLCJjb21tZW50U3ltYm9sIiwibWF0Y2hKU1hTdGFydFRhZyIsImlzVW5hcnlUYWciLCJtYXRjaEpTWENoaWxkcmVuIiwiY2hpbGRFbmQiLCJKU1hfVEFHX1NUQVJUIiwidGFnTWF0Y2giLCJlbmRCaXQiLCJtYXRjaEpTWEF0dHJpYnV0ZSIsImF0dHJFbmQiLCJhdHRyc0FzU3RyaW5nIiwiY2hpbGRyZW5Bc1N0cmluZyIsImF0dHIiLCJlbmRUYWciLCJtYXRjaEpTWENoaWxkIiwibWF0Y2hKU1hFbmRUYWciLCJtYXRjaEpTWEV4cHJlc3Npb24iLCJtYXRjaEpTWFRleHQiLCJtYXRjaFN0cmluZ0F0SGVhZCIsIkpTWF9BVFRSSUJVVEVfU1RBUlQiLCJlcXVhbHMiLCJhdHRyaWJ1dGUiLCJKU1hBdHRyaWJ1dGUiLCJtYXRjaEpTWEF0dHJpYnV0ZVZhbHVlIiwidmFsdWVFbmQiLCJtYXRjaEpTWEF0dHJpYnV0ZVZhbHVlSWRlbnRpZmllciIsImVuZEluZGV4IiwiZmluZE1hdGNoaW5nQXRIZWFkIiwiSlNYX1RFWFRfRU5EX0NIQVJTIiwiZmluZEZpcnN0QXRIZWFkIiwianN4VGV4dCIsInN0cmluZ0VuZCIsImhlYWQiLCJzdGFydERlbGltaXRlciIsImVuZERlbGltaXRlciIsImFmdGVyUXVvdGUiLCJjaGFycyIsInJlbW92ZU5vcm1hbFdoaXRlc3BhY2UiLCJicmVha0ludG9MaW5lcyIsImN1cnJlbnRMaW5lIiwiZ2V0TGluZUluZGVudHMiLCJkZWZhdWx0SW5kZW50IiwiaW5kZW50cyIsImdldExpbmVJbmRlbnQiLCJzdGFydEluZGVudCIsImdldE5leHRJbmRlbnQiLCJtYXhJbmRlbnQiLCJNYXRoIiwibWluIiwibGluZUluZGVudCIsIm5ld0Jsb2NrIiwiY2xvbmVDbGFzcyIsIl9fY2xvbmVDbGFzc19fIiwiRnVuY3Rpb24iLCJva0J1dHRvbiIsImNhbmNlbEJ1dHRvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7UUFJZ0JBLFksR0FBQUEsWTtRQUlBQyxjLEdBQUFBLGM7UUFTQUMsUyxHQUFBQSxTO1FBTUFDLFEsR0FBQUEsUTtRQVFBQyxXLEdBQUFBLFc7UUFNQUMsVSxHQUFBQSxVO1FBT0FDLE8sR0FBQUEsTzs7QUE1Q2hCOzs7Ozs7QUFFQTtBQUNBLElBQUlDLGlCQUFpQixPQUFyQjtBQUNPLFNBQVNQLFlBQVQsQ0FBc0JRLElBQXRCLEVBQTRCO0FBQ2xDLFFBQU9ELGVBQWVFLElBQWYsQ0FBb0JELElBQXBCLENBQVA7QUFDQTs7QUFFTSxTQUFTUCxjQUFULENBQXdCUyxNQUF4QixFQUFnQztBQUNyQyxLQUFJLE9BQU9BLE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0MsT0FBT0EsTUFBUDtBQUNoQyxRQUFPQSxPQUFPQyxPQUFQLENBQWUsS0FBZixFQUFzQixHQUF0QixFQUNFQSxPQURGLENBQ1UsS0FEVixFQUNpQixHQURqQixDQUFQO0FBRUQ7O0FBRUQ7QUFDQTtBQUNBO0FBQ08sU0FBU1QsU0FBVCxDQUFtQlUsSUFBbkIsRUFBeUI7QUFDL0IsUUFBT0EsT0FBTyxHQUFkO0FBQ0E7O0FBRUQ7QUFDQTtBQUNPLFNBQVNULFFBQVQsQ0FBa0JTLElBQWxCLEVBQXdCO0FBQzlCLFFBQU9BLFNBQVNWLFVBQVVVLElBQVYsQ0FBaEI7QUFDQTs7QUFHRDtBQUNBO0FBQ0E7QUFDTyxTQUFTUixXQUFULENBQXFCUSxJQUFyQixFQUEyQjtBQUNqQyxRQUFPQSxLQUFLRCxPQUFMLENBQWEsTUFBYixFQUFxQixFQUFyQixDQUFQO0FBQ0E7O0FBRUQ7QUFDQTtBQUNPLFNBQVNOLFVBQVQsQ0FBb0JPLElBQXBCLEVBQTBCO0FBQ2hDLFFBQU9BLFNBQVNSLFlBQVlRLElBQVosQ0FBaEI7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Q0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBLGdDQUFnQyxzQkFBc0I7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNB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U0FEUjtBQUVFVyxVQUFRLFFBRlY7QUFHRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUUsZUFBTyxDQUFQO0FBQVU7QUFEekI7O0FBQUE7QUFBQSxJQUEwQ0wsZUFBSzBLLFFBQS9DO0FBSEYsQ0E3RkYsRUFxR0U7QUFDRW5LLFFBQU0sU0FEUjtBQUVFVyxVQUFRLE9BRlY7QUFHRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUUsZUFBTyxDQUFQO0FBQVU7QUFEekI7O0FBQUE7QUFBQSxJQUF5Q0wsZUFBSzBLLFFBQTlDO0FBSEYsQ0FyR0YsRUE2R0U7QUFDRW5LLFFBQU0sU0FEUjtBQUVFVyxVQUFRLFFBRlY7QUFHRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUUsZUFBTyxDQUFQO0FBQVU7QUFEekI7O0FBQUE7QUFBQSxJQUEwQ0wsZUFBSzBLLFFBQS9DO0FBSEYsQ0E3R0YsRUFxSEU7QUFDRW5LLFFBQU0sU0FEUjtBQUVFVyxVQUFRLE9BRlY7QUFHRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUUsZUFBTyxDQUFQO0FBQVU7QUFEekI7O0FBQUE7QUFBQSxJQUF5Q0wsZUFBSzBLLFFBQTlDO0FBSEYsQ0FySEYsRUE2SEU7QUFDRW5LLFFBQU0sU0FEUjtBQUVFVyxVQUFRLE9BRlY7QUFHRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUUsZUFBTyxDQUFQO0FBQVU7QUFEekI7O0FBQUE7QUFBQSxJQUF5Q0wsZUFBSzBLLFFBQTlDO0FBSEYsQ0E3SEYsRUFxSUU7QUFDRW5LLFFBQU0sU0FEUjtBQUVFVyxVQUFRLFNBRlY7QUFHRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUUsZUFBTyxDQUFQ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REYsRTs7Ozs7OztBQ1hBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE1BQU07QUFDakIsYUFBYSxNQUFNO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7Ozs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGdsb2JhbCBmcm9tIFwiLi9nbG9iYWxcIjtcblxuLy8gUmV0dXJuIHRydWUgaWYgdGV4dCBpcyBhbGwgd2hpdGVzcGFjZSwgaW5jbHVkaW5nIGVtcHR5IHN0cmluZy5cbmxldCBBTExfV0hJVEVTUEFDRSA9IC9eXFxzKiQvO1xuZXhwb3J0IGZ1bmN0aW9uIGlzV2hpdGVzcGFjZSh0ZXh0KSB7XG5cdHJldHVybiBBTExfV0hJVEVTUEFDRS50ZXN0KHRleHQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93V2hpdGVzcGFjZShzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09IFwic3RyaW5nXCIpIHJldHVybiBzdHJpbmc7XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZSgvXFxuL2csIFwiwqxcIilcbiAgICAgICAgICAucmVwbGFjZSgvXFx0L2csIFwi4oiGXCIpO1xufVxuXG4vLyBSZXR1cm4gdGhlIHBsdXJhbCBvZiBgd29yZGAuXG4vLyBOT1RFOiB0aGlzIGlzIG5vdCB2ZXJ5IGdvb2QgYXQgYWxsISEhXG4vLyBUT0RPOiBleGNlcHRpb25zLCBldGMuXG5leHBvcnQgZnVuY3Rpb24gcGx1cmFsaXplKHdvcmQpIHtcblx0cmV0dXJuIHdvcmQgKyBcInNcIjtcbn1cblxuLy8gUmV0dXJuIHRydWUgaWYgd29yZCBpcyBhIHBsdXJhbC5cbi8vIE5PVEU6IGZvciB3b3JkcyB3aGljaCBhcmUgQk9USCBzaW5ndWxhciBhbmQgcGx1cmFsLCB0aGlzIHdpbGwgcmV0dXJuIHRydWUuXG5leHBvcnQgZnVuY3Rpb24gaXNQbHVyYWwod29yZCkge1xuXHRyZXR1cm4gd29yZCA9PT0gcGx1cmFsaXplKHdvcmQpO1xufVxuXG5cbi8vIFJldHVybiB0aGUgc2luZ3VsYXIgb2YgYHdvcmRgLlxuLy8gTk9URTogdGhpcyBpcyBub3QgdmVyeSBnb29kIGF0IGFsbCEhIVxuLy8gVE9ETzogZXhjZXB0aW9ucywgZXRjLlxuZXhwb3J0IGZ1bmN0aW9uIHNpbmd1bGFyaXplKHdvcmQpIHtcblx0cmV0dXJuIHdvcmQucmVwbGFjZSgvZT9zJC8sIFwiXCIpO1xufVxuXG4vLyBSZXR1cm4gdHJ1ZSBpZiB3b3JkIGlzIGEgc2luZ3VsYXIuXG4vLyBOT1RFOiBmb3Igd29yZHMgd2hpY2ggYXJlIEJPVEggc2luZ3VsYXIgYW5kIHBsdXJhbCwgdGhpcyB3aWxsIHJldHVybiB0cnVlLlxuZXhwb3J0IGZ1bmN0aW9uIGlzU2luZ3VsYXIod29yZCkge1xuXHRyZXR1cm4gd29yZCA9PT0gc2luZ3VsYXJpemUod29yZCk7XG59XG5cblxuLy8gUmV0dXJuIGEgY2VydGFpbiBgbnVtYmVyYCBvZiB0YWIgY2hhcmFjdGVycy5cbmNvbnN0IFRBQlMgPSBcIlxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdFwiO1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRhYnMobnVtYmVyKSB7XG5cdGlmICh0eXBlb2YgbnVtYmVyICE9PSBcIm51bWJlclwiKSByZXR1cm4gXCJcIjtcblx0cmV0dXJuIFRBQlMuc3Vic3RyKDAsIG51bWJlcik7XG59XG5cblxuLy8gRXhwb3J0IGFsbCBhcyBhIGx1bXBcbmxldCBhbGxFeHBvcnRzID0gey4uLmV4cG9ydHN9O1xuZXhwb3J0IGRlZmF1bHQgYWxsRXhwb3J0cztcblxuLy8gREVCVUc6IHB1dCBvbiBnbG9iYWwgZm9yIGRlYnVnZ2luZy5cbmdsb2JhbC5TVFJJTkcgPSBhbGxFeHBvcnRzO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3V0aWxzL3N0cmluZy5qcyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKCFpc09iamVjdChpdCkpIHRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2FuLW9iamVjdC5qc1xuLy8gbW9kdWxlIGlkID0gMTE0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4ZWMpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gISFleGVjKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2ZhaWxzLmpzXG4vLyBtb2R1bGUgaWQgPSAxMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0ICdjb3JlLWpzL2VzNi9zeW1ib2wnO1xuXG4vLyBUT0RPOiBOZWVkIGJldHRlciwgbW9yZSBjb21wbGV0ZSwgYW5kIG1vcmUgbWV0aG9kaWNhbCBrZXkgZGVmaW5pdGlvbnNcblxudmFyIEtleXMgPSB7XG4gIGJhY2tzcGFjZTogOCxcbiAgZGVsOiA0NixcbiAgZGVsZXRlOiA0NixcbiAgdGFiOiA5LFxuICBlbnRlcjogMTMsXG4gICdyZXR1cm4nOiAxMyxcbiAgZXNjOiAyNyxcbiAgc3BhY2U6IDMyLFxuICBwYWdlVXA6IDMzLFxuICBwYWdlRG93bjogMzQsXG4gIGVuZDogMzUsXG4gIGhvbWU6IDM2LFxuICBsZWZ0OiAzNyxcbiAgdXA6IDM4LFxuICByaWdodDogMzksXG4gIGRvd246IDQwLFxuICAnOyc6IDE4NixcbiAgJz0nOiAxODcsXG4gICcsJzogMTg4LFxuICAnLSc6IDE4OSxcbiAgJy4nOiAxOTAsXG4gICcvJzogMTkxLFxuICAnYCc6IDE5MixcbiAgJ1snOiAyMTksXG4gICdcXFxcJzogMjIwLFxuICAnXSc6IDIyMVxufTtcblxuLy8gQWRkIHVwcGVyY2FzZSB2ZXJzaW9ucyBvZiBrZXlzIGFib3ZlIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuT2JqZWN0LmtleXMoS2V5cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBLZXlzW2tleS50b1VwcGVyQ2FzZSgpXSA9IEtleXNba2V5XTtcbn0pO1xuXG4nMDEyMzQ1Njc4OScuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24gKG51bSwgaW5kZXgpIHtcbiAgcmV0dXJuIEtleXNbbnVtXSA9IGluZGV4ICsgNDg7XG59KTtcblxuJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJy5zcGxpdCgnJykuZm9yRWFjaChmdW5jdGlvbiAobGV0dGVyLCBpbmRleCkge1xuICBLZXlzW2xldHRlcl0gPSBpbmRleCArIDY1O1xuICBLZXlzW2xldHRlci50b0xvd2VyQ2FzZSgpXSA9IGluZGV4ICsgNjU7XG59KTtcblxuLy8gZm4ga2V5c1xuWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTJdLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XG4gIHJldHVybiBLZXlzWydmJyArIGluZGV4XSA9IDExMSArIGluZGV4O1xufSk7XG5cbmV4cG9ydCB2YXIgbW9kaWZpZXJzID0ge1xuICBjb250cm9sOiAnY3RybCcsXG4gIGN0cmw6ICdjdHJsJyxcbiAgc2hpZnQ6ICdzaGlmdCcsXG4gIG1ldGE6ICdtZXRhJyxcbiAgY21kOiAnbWV0YScsXG4gIGNvbW1hbmQ6ICdtZXRhJyxcbiAgb3B0aW9uOiAnYWx0JyxcbiAgYWx0OiAnYWx0J1xufTtcblxuZXhwb3J0IHZhciBBTExfS0VZUyA9IFN5bWJvbCgnQUxMX0tFWVMnKTtcblxuZXhwb3J0IHZhciBBTExfUFJJTlRBQkxFX0tFWVMgPSBTeW1ib2woJ0FMTF9QUklOVEFCTEVfS0VZUycpO1xuXG5leHBvcnQgZGVmYXVsdCBLZXlzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9rZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSAxNDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIF9zbGljZWRUb0FycmF5ID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7IH0gfTsgfSgpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuLyoqXG4gKiBAbW9kdWxlIHN0b3JlXG4gKlxuICovXG5pbXBvcnQgbWF0Y2hLZXlzIGZyb20gJy4vbGliL21hdGNoX2tleXMnO1xuaW1wb3J0IHBhcnNlS2V5cyBmcm9tICcuL2xpYi9wYXJzZV9rZXlzJztcbmltcG9ydCB1dWlkIGZyb20gJy4vbGliL3V1aWQnO1xuXG4vKipcbiAqIHByaXZhdGVcbiAqXG4gKi9cblxuLy8gZGljdCBmb3IgY2xhc3MgcHJvdG90eXBlcyA9PiBiaW5kaW5nc1xudmFyIF9oYW5kbGVycyA9IG5ldyBNYXAoKTtcblxuLy8gYWxsIG1vdW50ZWQgaW5zdGFuY2VzIHRoYXQgaGF2ZSBrZXliaW5kaW5nc1xudmFyIF9pbnN0YW5jZXMgPSBuZXcgU2V0KCk7XG5cbi8vIGZvciB0ZXN0aW5nXG5leHBvcnQgZnVuY3Rpb24gX3Jlc2V0U3RvcmUoKSB7XG4gIF9oYW5kbGVycy5jbGVhcigpO1xuICBfaW5zdGFuY2VzLmNsZWFyKCk7XG59XG5cbi8qKlxuICogYWN0aXZhdGVcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IGluc3RhbmNlIEluc3RhbnRpYXRlZCBjbGFzcyB0aGF0IGV4dGVuZGVkIFJlYWN0LkNvbXBvbmVudCwgdG8gYmUgZm9jdXNlZCB0byByZWNlaXZlIGtleWRvd24gZXZlbnRzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShpbnN0YW5jZXMpIHtcbiAgdmFyIGluc3RhbmNlc0FycmF5ID0gW10uY29uY2F0KGluc3RhbmNlcyk7XG5cbiAgLy8gaWYgbm8gY29tcG9uZW50cyB3ZXJlIGZvdW5kIGFzIGFuY2VzdG9ycyBvZiB0aGUgZXZlbnQgdGFyZ2V0LFxuICAvLyBlZmZlY3RpdmVseSBkZWFjdGl2YXRlIGtleWRvd24gaGFuZGxpbmcgYnkgY2FwcGluZyB0aGUgc2V0IG9mIGluc3RhbmNlc1xuICAvLyB3aXRoIGBudWxsYC5cbiAgaWYgKCFpbnN0YW5jZXNBcnJheS5sZW5ndGgpIHtcbiAgICBfaW5zdGFuY2VzLmFkZChudWxsKTtcbiAgfSBlbHNlIHtcbiAgICBfaW5zdGFuY2VzLmRlbGV0ZShudWxsKTtcblxuICAgIC8vIGRlbGV0aW5nIGFuZCB0aGVuIGFkZGluZyB0aGUgaW5zdGFuY2UocykgaGFzIHRoZSBlZmZlY3Qgb2Ygc29ydGluZyB0aGUgc2V0XG4gICAgLy8gYWNjb3JkaW5nIHRvIGluc3RhbmNlIGFjdGl2YXRpb24gKGFzY2VuZGluZylcbiAgICBpbnN0YW5jZXNBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgICAgX2luc3RhbmNlcy5kZWxldGUoaW5zdGFuY2UpO1xuICAgICAgX2luc3RhbmNlcy5hZGQoaW5zdGFuY2UpO1xuICAgIH0pO1xuICB9XG59O1xuXG4vKipcbiAqIGRlbGV0ZUluc3RhbmNlXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXQgSW5zdGFudGlhdGVkIGNsYXNzIHRoYXQgZXh0ZW5kZWQgUmVhY3QuQ29tcG9uZW50XG4gKiBAcmV0dXJuIHtib29sZWFufSBUaGUgdmFsdWUgc2V0LmhhcyggdGFyZ2V0ICkgd291bGQgaGF2ZSByZXR1cm5lZCBwcmlvciB0byBkZWxldGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlSW5zdGFuY2UodGFyZ2V0KSB7XG4gIF9pbnN0YW5jZXMuZGVsZXRlKHRhcmdldCk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZmluZEJpbmRpbmdGb3JFdmVudChldmVudCkge1xuICBpZiAoIV9pbnN0YW5jZXMuaGFzKG51bGwpKSB7XG4gICAgdmFyIGtleU1hdGNoZXNFdmVudCA9IGZ1bmN0aW9uIGtleU1hdGNoZXNFdmVudChrZXlTZXQpIHtcbiAgICAgIHJldHVybiBtYXRjaEtleXMoeyBrZXlTZXQ6IGtleVNldCwgZXZlbnQ6IGV2ZW50IH0pO1xuICAgIH07XG5cbiAgICAvLyBsb29wIHRocm91Z2ggaW5zdGFuY2VzIGluIHJldmVyc2UgYWN0aXZhdGlvbiBvcmRlciBzbyB0aGF0IG1vc3RcbiAgICAvLyByZWNlbnRseSBhY3RpdmF0ZWQgaW5zdGFuY2UgZ2V0cyBmaXJzdCBkaWJzIG9uIGV2ZW50XG4gICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KF9pbnN0YW5jZXMpKS5yZXZlcnNlKClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICAgIHZhciBiaW5kaW5ncyA9IGdldEJpbmRpbmcoaW5zdGFuY2UuY29uc3RydWN0b3IucHJvdG90eXBlKTtcbiAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMiA9IGZhbHNlO1xuICAgICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IyID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMiA9IGJpbmRpbmdzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICAgICAgICB2YXIgX3N0ZXAyJHZhbHVlID0gX3NsaWNlZFRvQXJyYXkoX3N0ZXAyLnZhbHVlLCAyKSxcbiAgICAgICAgICAgICAgICBrZXlTZXRzID0gX3N0ZXAyJHZhbHVlWzBdLFxuICAgICAgICAgICAgICAgIGZuID0gX3N0ZXAyJHZhbHVlWzFdO1xuXG4gICAgICAgICAgICBpZiAoa2V5U2V0cy5zb21lKGtleU1hdGNoZXNFdmVudCkpIHtcbiAgICAgICAgICAgICAgLy8gcmV0dXJuIHdoZW4gbWF0Y2hpbmcga2V5YmluZGluZyBpcyBmb3VuZCAtIGkuZS4gb25seSBvbmVcbiAgICAgICAgICAgICAgLy8ga2V5Ym91bmQgY29tcG9uZW50IGNhbiByZXNwb25kIHRvIGEgZ2l2ZW4ga2V5IGNvZGUuIHRvIGdldCBhcm91bmQgdGhpcyxcbiAgICAgICAgICAgICAgLy8gc2NvcGUgYSBjb21tb24gYW5jZXN0b3IgY29tcG9uZW50IGNsYXNzIHdpdGggQGtleWRvd24gYW5kIHVzZVxuICAgICAgICAgICAgICAvLyBAa2V5ZG93blNjb3BlZCB0byBiaW5kIHRoZSBkdXBsaWNhdGUga2V5cyBpbiB5b3VyIGNoaWxkIGNvbXBvbmVudHNcbiAgICAgICAgICAgICAgLy8gKG9yIGp1c3QgaW5zcGVjdCBuZXh0UHJvcHMua2V5ZG93bi5ldmVudCkuXG4gICAgICAgICAgICAgIHJldHVybiB7IGZuOiBmbiwgaW5zdGFuY2U6IGluc3RhbmNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjIgPSB0cnVlO1xuICAgICAgICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgICAgfVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG4vKipcbiAqIGdldEJpbmRpbmdcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCBDbGFzcyB1c2VkIGFzIGtleSBpbiBkaWN0IG9mIGtleSBiaW5kaW5nc1xuICogQHJldHVybiB7b2JqZWN0fSBUaGUgb2JqZWN0IGNvbnRhaW5pbmcgYmluZGluZ3MgZm9yIHRoZSBnaXZlbiBjbGFzc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmluZGluZyhfcmVmKSB7XG4gIHZhciBfX3JlYWN0S2V5ZG93blVVSUQgPSBfcmVmLl9fcmVhY3RLZXlkb3duVVVJRDtcblxuICByZXR1cm4gX2hhbmRsZXJzLmdldChfX3JlYWN0S2V5ZG93blVVSUQpO1xufTtcblxuLyoqXG4gKiBnZXRJbnN0YW5jZXNcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHJldHVybiB7c2V0fSBBbGwgc3RvcmVkIGluc3RhbmNlcyAoYWxsIG1vdW50ZWQgY29tcG9uZW50IGluc3RhbmNlcyB3aXRoIGtleWJpbmRpbmdzKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5zdGFuY2VzKCkge1xuICByZXR1cm4gX2luc3RhbmNlcztcbn07XG5cbi8qKlxuICogaXNFbXB0eVxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFNpemUgb2YgdGhlIHNldCBvZiBhbGwgc3RvcmVkIGluc3RhbmNlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eSgpIHtcbiAgcmV0dXJuICFfaW5zdGFuY2VzLnNpemU7XG59O1xuXG4vKipcbiAqIHNldEJpbmRpbmdcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MgQWxsIGFyZ3VtZW50cyBuZWNlc3NhcnkgdG8gc2V0IHRoZSBiaW5kaW5nXG4gKiBAcGFyYW0ge2FycmF5fSBhcmdzLmtleXMgS2V5IGNvZGVzIHRoYXQgc2hvdWxkIHRyaWdnZXIgdGhlIGZuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBhcmdzLmZuIFRoZSBjYWxsYmFjayB0byBiZSB0cmlnZ2VyZWQgd2hlbiBnaXZlbiBrZXlzIGFyZSBwcmVzc2VkXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncy50YXJnZXQgVGhlIGRlY29yYXRlZCBjbGFzc1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0QmluZGluZyhfcmVmMikge1xuICB2YXIga2V5cyA9IF9yZWYyLmtleXMsXG4gICAgICBmbiA9IF9yZWYyLmZuLFxuICAgICAgdGFyZ2V0ID0gX3JlZjIudGFyZ2V0O1xuXG4gIHZhciBrZXlTZXRzID0gcGFyc2VLZXlzKGtleXMpO1xuXG4gIHZhciBfX3JlYWN0S2V5ZG93blVVSUQgPSB0YXJnZXQuX19yZWFjdEtleWRvd25VVUlEO1xuXG4gIGlmICghX19yZWFjdEtleWRvd25VVUlEKSB7XG4gICAgdGFyZ2V0Ll9fcmVhY3RLZXlkb3duVVVJRCA9IHV1aWQoKTtcbiAgICBfaGFuZGxlcnMuc2V0KHRhcmdldC5fX3JlYWN0S2V5ZG93blVVSUQsIG5ldyBNYXAoW1trZXlTZXRzLCBmbl1dKSk7XG4gIH0gZWxzZSB7XG4gICAgX2hhbmRsZXJzLmdldChfX3JlYWN0S2V5ZG93blVVSUQpLnNldChrZXlTZXRzLCBmbik7XG4gIH1cbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvc3RvcmUuanNcbi8vIG1vZHVsZSBpZCA9IDE0OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBNYWtlIHN1cmUgYGdsb2JhbGAgaXMgZGVmaW5lZCBnbG9iYWxseTpcbi8vXHQtIGVpdGhlciBhcyB0aGUgbm9kZWpzIGBnbG9iYWxgLCBvclxuLy9cdC0gYXMgYW4gYWxpYXMgZm9yIGB3aW5kb3dgIGluIGJyb3dzZXJzLCBvclxuLy9cdC0gZm9yIHRoZSBgc2VsZmAgY29udGV4dCBpbiB3ZWIgd29ya2Vycy5cbi8vXG4vLyBOT1RFOiB0aGlzIG1vZGlmaWVzIHRoZSBcImdsb2JhbFwiIGVudmlyb25tZW50IGJ5IG1ha2luZyBzdXJlIFwiZ2xvYmFsXCIgaXMgc2V0LiFcbi8vXG5cbmxldCBnbG9iYWxfaWRlbnRpZmllcjtcbmlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4vL1x0Y29uc29sZS5sb2coXCJSdW5uaW5nIGluIG5vZGVcIik7XG5cdGdsb2JhbF9pZGVudGlmaWVyID0gZ2xvYmFsO1xufVxuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuLy9cdGNvbnNvbGUubG9nKFwiUnVubmluZyBpbiBhIHdlYiBicm93c2VyXCIpO1xuXHR3aW5kb3cuZ2xvYmFsID0gd2luZG93O1xuXHRnbG9iYWxfaWRlbnRpZmllciA9IHdpbmRvdztcbn1cblxuaWYgKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKSB7XG4vL1x0Y29uc29sZS5sb2coXCJSdW5uaW5nIGluIGEgd2ViIHdvcmtlclwiKTtcblx0c2VsZi5nbG9iYWwgPSBzZWxmO1xuXHRnbG9iYWxfaWRlbnRpZmllciA9IHNlbGY7XG59XG5cbi8vIEV4cG9ydCBmb3IgY29uc3VtcHRpb24gYnkgaW1wb3J0LlxuZXhwb3J0IGRlZmF1bHQgZ2xvYmFsX2lkZW50aWZpZXI7XG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91dGlscy9nbG9iYWwuanMiLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19jb2YuanNcbi8vIG1vZHVsZSBpZCA9IDE3OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBJRSA4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgJ2NvbnN0cnVjdG9yLGhhc093blByb3BlcnR5LGlzUHJvdG90eXBlT2YscHJvcGVydHlJc0VudW1lcmFibGUsdG9Mb2NhbGVTdHJpbmcsdG9TdHJpbmcsdmFsdWVPZidcbikuc3BsaXQoJywnKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2VudW0tYnVnLWtleXMuanNcbi8vIG1vZHVsZSBpZCA9IDE4MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICByZXR1cm4gZFAuZihvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzXG4vLyBtb2R1bGUgaWQgPSAxODFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmYWxzZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2xpYnJhcnkuanNcbi8vIG1vZHVsZSBpZCA9IDE4MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyAxOS4xLjIuMTQgLyAxNS4yLjMuMTQgT2JqZWN0LmtleXMoTylcbnZhciAka2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzLWludGVybmFsJyk7XG52YXIgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuL19lbnVtLWJ1Zy1rZXlzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24ga2V5cyhPKSB7XG4gIHJldHVybiAka2V5cyhPLCBlbnVtQnVnS2V5cyk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWtleXMuanNcbi8vIG1vZHVsZSBpZCA9IDE4M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzLmYgPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1waWUuanNcbi8vIG1vZHVsZSBpZCA9IDE4NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChiaXRtYXAsIHZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZTogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGU6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWU6IHZhbHVlXG4gIH07XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qc1xuLy8gbW9kdWxlIGlkID0gMTg1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIFNSQyA9IHJlcXVpcmUoJy4vX3VpZCcpKCdzcmMnKTtcbnZhciBUT19TVFJJTkcgPSAndG9TdHJpbmcnO1xudmFyICR0b1N0cmluZyA9IEZ1bmN0aW9uW1RPX1NUUklOR107XG52YXIgVFBMID0gKCcnICsgJHRvU3RyaW5nKS5zcGxpdChUT19TVFJJTkcpO1xuXG5yZXF1aXJlKCcuL19jb3JlJykuaW5zcGVjdFNvdXJjZSA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gJHRvU3RyaW5nLmNhbGwoaXQpO1xufTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE8sIGtleSwgdmFsLCBzYWZlKSB7XG4gIHZhciBpc0Z1bmN0aW9uID0gdHlwZW9mIHZhbCA9PSAnZnVuY3Rpb24nO1xuICBpZiAoaXNGdW5jdGlvbikgaGFzKHZhbCwgJ25hbWUnKSB8fCBoaWRlKHZhbCwgJ25hbWUnLCBrZXkpO1xuICBpZiAoT1trZXldID09PSB2YWwpIHJldHVybjtcbiAgaWYgKGlzRnVuY3Rpb24pIGhhcyh2YWwsIFNSQykgfHwgaGlkZSh2YWwsIFNSQywgT1trZXldID8gJycgKyBPW2tleV0gOiBUUEwuam9pbihTdHJpbmcoa2V5KSkpO1xuICBpZiAoTyA9PT0gZ2xvYmFsKSB7XG4gICAgT1trZXldID0gdmFsO1xuICB9IGVsc2UgaWYgKCFzYWZlKSB7XG4gICAgZGVsZXRlIE9ba2V5XTtcbiAgICBoaWRlKE8sIGtleSwgdmFsKTtcbiAgfSBlbHNlIGlmIChPW2tleV0pIHtcbiAgICBPW2tleV0gPSB2YWw7XG4gIH0gZWxzZSB7XG4gICAgaGlkZShPLCBrZXksIHZhbCk7XG4gIH1cbi8vIGFkZCBmYWtlIEZ1bmN0aW9uI3RvU3RyaW5nIGZvciBjb3JyZWN0IHdvcmsgd3JhcHBlZCBtZXRob2RzIC8gY29uc3RydWN0b3JzIHdpdGggbWV0aG9kcyBsaWtlIExvRGFzaCBpc05hdGl2ZVxufSkoRnVuY3Rpb24ucHJvdG90eXBlLCBUT19TVFJJTkcsIGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gdHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyAmJiB0aGlzW1NSQ10gfHwgJHRvU3RyaW5nLmNhbGwodGhpcyk7XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3JlZGVmaW5lLmpzXG4vLyBtb2R1bGUgaWQgPSAxODZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXyc7XG52YXIgc3RvcmUgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5cbihtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0gdmFsdWUgIT09IHVuZGVmaW5lZCA/IHZhbHVlIDoge30pO1xufSkoJ3ZlcnNpb25zJywgW10pLnB1c2goe1xuICB2ZXJzaW9uOiBjb3JlLnZlcnNpb24sXG4gIG1vZGU6IHJlcXVpcmUoJy4vX2xpYnJhcnknKSA/ICdwdXJlJyA6ICdnbG9iYWwnLFxuICBjb3B5cmlnaHQ6ICfCqSAyMDE4IERlbmlzIFB1c2hrYXJldiAoemxvaXJvY2sucnUpJ1xufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19zaGFyZWQuanNcbi8vIG1vZHVsZSBpZCA9IDE4N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyA3LjEuMSBUb1ByaW1pdGl2ZShpbnB1dCBbLCBQcmVmZXJyZWRUeXBlXSlcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xuLy8gaW5zdGVhZCBvZiB0aGUgRVM2IHNwZWMgdmVyc2lvbiwgd2UgZGlkbid0IGltcGxlbWVudCBAQHRvUHJpbWl0aXZlIGNhc2Vcbi8vIGFuZCB0aGUgc2Vjb25kIGFyZ3VtZW50IC0gZmxhZyAtIHByZWZlcnJlZCB0eXBlIGlzIGEgc3RyaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgUykge1xuICBpZiAoIWlzT2JqZWN0KGl0KSkgcmV0dXJuIGl0O1xuICB2YXIgZm4sIHZhbDtcbiAgaWYgKFMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIGlmICh0eXBlb2YgKGZuID0gaXQudmFsdWVPZikgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICBpZiAoIVMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNvbnZlcnQgb2JqZWN0IHRvIHByaW1pdGl2ZSB2YWx1ZVwiKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL190by1wcmltaXRpdmUuanNcbi8vIG1vZHVsZSBpZCA9IDE4OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBkb2N1bWVudCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50O1xuLy8gdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCcgaW4gb2xkIElFXG52YXIgaXMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2RvbS1jcmVhdGUuanNcbi8vIG1vZHVsZSBpZCA9IDI3OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpICYmICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2RpdicpLCAnYScsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiA3OyB9IH0pLmEgIT0gNztcbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faWU4LWRvbS1kZWZpbmUuanNcbi8vIG1vZHVsZSBpZCA9IDI4MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyAxOS4xLjIuNyAvIDE1LjIuMy40IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXG52YXIgJGtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cy1pbnRlcm5hbCcpO1xudmFyIGhpZGRlbktleXMgPSByZXF1aXJlKCcuL19lbnVtLWJ1Zy1rZXlzJykuY29uY2F0KCdsZW5ndGgnLCAncHJvdG90eXBlJyk7XG5cbmV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoTykge1xuICByZXR1cm4gJGtleXMoTywgaGlkZGVuS2V5cyk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcG4uanNcbi8vIG1vZHVsZSBpZCA9IDI4MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcHMuanNcbi8vIG1vZHVsZSBpZCA9IDI4MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIGFycmF5SW5kZXhPZiA9IHJlcXVpcmUoJy4vX2FycmF5LWluY2x1ZGVzJykoZmFsc2UpO1xudmFyIElFX1BST1RPID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWVzKSB7XG4gIHZhciBPID0gdG9JT2JqZWN0KG9iamVjdCk7XG4gIHZhciBpID0gMDtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIga2V5O1xuICBmb3IgKGtleSBpbiBPKSBpZiAoa2V5ICE9IElFX1BST1RPKSBoYXMoTywga2V5KSAmJiByZXN1bHQucHVzaChrZXkpO1xuICAvLyBEb24ndCBlbnVtIGJ1ZyAmIGhpZGRlbiBrZXlzXG4gIHdoaWxlIChuYW1lcy5sZW5ndGggPiBpKSBpZiAoaGFzKE8sIGtleSA9IG5hbWVzW2krK10pKSB7XG4gICAgfmFycmF5SW5kZXhPZihyZXN1bHQsIGtleSkgfHwgcmVzdWx0LnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1rZXlzLWludGVybmFsLmpzXG4vLyBtb2R1bGUgaWQgPSAyODNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpKCdrZXlzJyk7XG52YXIgdWlkID0gcmVxdWlyZSgnLi9fdWlkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIHNoYXJlZFtrZXldIHx8IChzaGFyZWRba2V5XSA9IHVpZChrZXkpKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19zaGFyZWQta2V5LmpzXG4vLyBtb2R1bGUgaWQgPSAyODRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gNy4xLjQgVG9JbnRlZ2VyXG52YXIgY2VpbCA9IE1hdGguY2VpbDtcbnZhciBmbG9vciA9IE1hdGguZmxvb3I7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL190by1pbnRlZ2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAyODVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fd2tzJyk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL193a3MtZXh0LmpzXG4vLyBtb2R1bGUgaWQgPSAyODZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbi8vIGNzcyBiYXNlIGNvZGUsIGluamVjdGVkIGJ5IHRoZSBjc3MtbG9hZGVyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVzZVNvdXJjZU1hcCkge1xuXHR2YXIgbGlzdCA9IFtdO1xuXG5cdC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblx0bGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0dmFyIGNvbnRlbnQgPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0sIHVzZVNvdXJjZU1hcCk7XG5cdFx0XHRpZihpdGVtWzJdKSB7XG5cdFx0XHRcdHJldHVybiBcIkBtZWRpYSBcIiArIGl0ZW1bMl0gKyBcIntcIiArIGNvbnRlbnQgKyBcIn1cIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBjb250ZW50O1xuXHRcdFx0fVxuXHRcdH0pLmpvaW4oXCJcIik7XG5cdH07XG5cblx0Ly8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3Rcblx0bGlzdC5pID0gZnVuY3Rpb24obW9kdWxlcywgbWVkaWFRdWVyeSkge1xuXHRcdGlmKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKVxuXHRcdFx0bW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgXCJcIl1dO1xuXHRcdHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpZCA9IHRoaXNbaV1bMF07XG5cdFx0XHRpZih0eXBlb2YgaWQgPT09IFwibnVtYmVyXCIpXG5cdFx0XHRcdGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcblx0XHR9XG5cdFx0Zm9yKGkgPSAwOyBpIDwgbW9kdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGl0ZW0gPSBtb2R1bGVzW2ldO1xuXHRcdFx0Ly8gc2tpcCBhbHJlYWR5IGltcG9ydGVkIG1vZHVsZVxuXHRcdFx0Ly8gdGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBub3QgMTAwJSBwZXJmZWN0IGZvciB3ZWlyZCBtZWRpYSBxdWVyeSBjb21iaW5hdGlvbnNcblx0XHRcdC8vICB3aGVuIGEgbW9kdWxlIGlzIGltcG9ydGVkIG11bHRpcGxlIHRpbWVzIHdpdGggZGlmZmVyZW50IG1lZGlhIHF1ZXJpZXMuXG5cdFx0XHQvLyAgSSBob3BlIHRoaXMgd2lsbCBuZXZlciBvY2N1ciAoSGV5IHRoaXMgd2F5IHdlIGhhdmUgc21hbGxlciBidW5kbGVzKVxuXHRcdFx0aWYodHlwZW9mIGl0ZW1bMF0gIT09IFwibnVtYmVyXCIgfHwgIWFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcblx0XHRcdFx0aWYobWVkaWFRdWVyeSAmJiAhaXRlbVsyXSkge1xuXHRcdFx0XHRcdGl0ZW1bMl0gPSBtZWRpYVF1ZXJ5O1xuXHRcdFx0XHR9IGVsc2UgaWYobWVkaWFRdWVyeSkge1xuXHRcdFx0XHRcdGl0ZW1bMl0gPSBcIihcIiArIGl0ZW1bMl0gKyBcIikgYW5kIChcIiArIG1lZGlhUXVlcnkgKyBcIilcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRsaXN0LnB1c2goaXRlbSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHRyZXR1cm4gbGlzdDtcbn07XG5cbmZ1bmN0aW9uIGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKSB7XG5cdHZhciBjb250ZW50ID0gaXRlbVsxXSB8fCAnJztcblx0dmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXHRpZiAoIWNzc01hcHBpbmcpIHtcblx0XHRyZXR1cm4gY29udGVudDtcblx0fVxuXG5cdGlmICh1c2VTb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcblx0XHR2YXIgc291cmNlTWFwcGluZyA9IHRvQ29tbWVudChjc3NNYXBwaW5nKTtcblx0XHR2YXIgc291cmNlVVJMcyA9IGNzc01hcHBpbmcuc291cmNlcy5tYXAoZnVuY3Rpb24gKHNvdXJjZSkge1xuXHRcdFx0cmV0dXJuICcvKiMgc291cmNlVVJMPScgKyBjc3NNYXBwaW5nLnNvdXJjZVJvb3QgKyBzb3VyY2UgKyAnICovJ1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbignXFxuJyk7XG5cdH1cblxuXHRyZXR1cm4gW2NvbnRlbnRdLmpvaW4oJ1xcbicpO1xufVxuXG4vLyBBZGFwdGVkIGZyb20gY29udmVydC1zb3VyY2UtbWFwIChNSVQpXG5mdW5jdGlvbiB0b0NvbW1lbnQoc291cmNlTWFwKSB7XG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuXHR2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKTtcblx0dmFyIGRhdGEgPSAnc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsJyArIGJhc2U2NDtcblxuXHRyZXR1cm4gJy8qIyAnICsgZGF0YSArICcgKi8nO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXG4vLyBtb2R1bGUgaWQgPSAyODdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gU3BlbGwgXCJwYXJzZXJcIiBjbGFzcy5cbi8vXG5cbi8vIFRPRE86IGRlcGVuZGVuY3ktaW5qZWN0IHRva2VuaXplcj9cbmltcG9ydCBUb2tlbml6ZXIgZnJvbSBcIi4vVG9rZW5pemVyLmpzXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi9SdWxlLmpzXCI7XG5pbXBvcnQgcGFyc2VSdWxlIGZyb20gXCIuL1J1bGVTeW50YXguanNcIjtcbmltcG9ydCB7IGNsb25lQ2xhc3MgfSBmcm9tIFwiLi91dGlscy9jbGFzcy5qc1wiO1xuXG4vLyBHUlJSLi4uIHdpbGwgU09NRU9ORSBvbiB0aGUgbm9kZSB0ZWFtIHBsZWFzZSBpbXBsZW1lbnQgY29uc29sZS5ncm91cCA/Pz9cbmlmICghY29uc29sZS5ncm91cCkgY29uc29sZS5ncm91cCA9IGNvbnNvbGUubG9nO1xuaWYgKCFjb25zb2xlLmdyb3VwRW5kKSBjb25zb2xlLmdyb3VwRW5kID0gY29uc29sZS5sb2c7XG5cbi8vIEVycm9yIHdlJ2xsIHRocm93IGZvciBwcm9ibGVtcyB3aGVuIHBhcnNpbmcuXG4vLyBVc2VzIGEgc3BlY2lmaWMgdHlwZSBzbyB3ZSBjYW4gY2hlY2sgZm9yIGl0IGluIHRlc3RzLlxuZXhwb3J0IGZ1bmN0aW9uIFBhcnNlRXJyb3IoLi4uYXJncykge1xuICBFcnJvci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBQYXJzZUVycm9yKTtcbn1cblBhcnNlRXJyb3IucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlciB7XG5cdC8vIFNldCB0byBgdHJ1ZWAgdG8gb3V0cHV0IGRlYnVnIGluZm8gd2hpbGUgYWRkaW5nIHJ1bGVzXG5cdHN0YXRpYyBERUJVRyA9IGZhbHNlO1xuXG5cdC8vIFNob3VsZCB3ZSB3YXJuIGFib3V0IGFub21hbG91cyBjb25kaXRpb25zP1xuXHRzdGF0aWMgV0FSTiA9IGZhbHNlO1xuXG5cdC8vIFNldCB0byBgdHJ1ZWAgdG8gb3V0cHV0IHRpbWluZyBpbmZvLlxuXHRzdGF0aWMgVElNRSA9IGZhbHNlO1xuXG4gIC8vIEFkZCB0byBQYXJzZXIgY29uc29sZSBkZWJ1Z2dpbmdcbiAgc3RhdGljIFBhcnNlRXJyb3IgPSBQYXJzZUVycm9yO1xuXG5cdC8vIENvbnN0cnVjdG9yLlxuXHRjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzKSB7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBwcm9wZXJ0aWVzKTtcblx0fVxuXG4vL1xuLy8jIyMgUGFyc2luZ1xuLy9cblx0Ly8gUGFyc2UgYHJ1bGVOYW1lYCBydWxlIGF0IGhlYWQgb2YgYHRleHRgLlxuXHQvLyBJZiB5b3UgcGFzcyBvbmx5IG9uZSBhcmd1bWVudCwgd2UnbGwgYXNzdW1lIHRoYXQncyBgdGV4dGAgYW5kIHlvdSB3YW50IHRvIG1hdGNoIGBzdGF0ZW1lbnRzYC5cblx0Ly8gSGFuZGxlcyBvcHRpb25hbCBhbmQgcmVwZWF0aW5nIHJ1bGVzIGFzIHdlbGwgYXMgZWF0aW5nIHdoaXRlc3BhY2UuXG5cdC8vIFJldHVybnMgcmVzdWx0IG9mIHBhcnNlLlxuLy9URVNUTUVcblx0cGFyc2UocnVsZU5hbWUsIHRleHQpIHtcblx0XHQvLyBJZiBvbmx5IG9uZSBhcmd1bWVudCwgYXNzdW1lIHRoYXQncyB0aGUgdGV4dCBhbmQgcGFyc2UgYHN0YXRlbWVudHNgXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHRleHQgPSBydWxlTmFtZTtcblx0XHRcdHJ1bGVOYW1lID0gXCJzdGF0ZW1lbnRzXCI7XG5cdFx0fVxuXG5cdFx0Ly8gQ29udmVydCB0byB0b2tlbnMuXG5cdFx0aWYgKFBhcnNlci5USU1FKSBjb25zb2xlLnRpbWUoXCJ0b2tlbml6ZVwiKTtcblx0XHRsZXQgdG9rZW5zID0gVG9rZW5pemVyLnRva2VuaXplKHRleHQpO1xuXHRcdC8vIGVhdCBub24taW5kZW50IHdoaXRlc3BhY2UgKHNpbmNlIHdlIGlnbm9yZSBpdClcblx0XHR0b2tlbnMgPSB0b2tlbnMuZmlsdGVyKHRva2VuID0+ICFUb2tlbml6ZXIuaXNOb3JtYWxXaGl0ZXNwYWNlKHRva2VuKSk7XG5cdFx0aWYgKFBhcnNlci5USU1FKSBjb25zb2xlLnRpbWVFbmQoXCJ0b2tlbml6ZVwiKTtcblxuXHRcdC8vIEJhaWwgaWYgd2UgZGlkbid0IGdldCBhbnkgdG9rZW5zIGJhY2suXG5cdFx0aWYgKCF0b2tlbnMgfHwgdG9rZW5zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGlmIChQYXJzZXIuVElNRSkgY29uc29sZS50aW1lKFwicGFyc2VcIik7XG5cdFx0Ly8gSWYgd2UncmUgbm90IHBhcnNpbmcgYHN0YXRlbWVudHNgLCBlYXQgd2hpdGVzcGFjZSBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lLlxuXHRcdGlmIChydWxlTmFtZSAhPT0gXCJzdGF0ZW1lbnRzXCIpIHtcblx0XHRcdHRva2VucyA9IFRva2VuaXplci5yZW1vdmVMZWFkaW5nV2hpdGVzcGFjZSh0b2tlbnMpO1xuXHRcdH1cblxuXHRcdC8vIFBhcnNlIHRoZSBydWxlIG9yIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBydWxlIG5vdCBmb3VuZC5cblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5wYXJzZU5hbWVkUnVsZShydWxlTmFtZSwgdG9rZW5zLCAwLCB0b2tlbnMubGVuZ3RoLCB1bmRlZmluZWQsIFwicGFyc2VyLnBhcnNlKClcIik7XG5cdFx0aWYgKFBhcnNlci5USU1FKSBjb25zb2xlLnRpbWVFbmQoXCJwYXJzZVwiKTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblxuXG5cdC8vIFBhcnNlIGB0ZXh0YCBhbmQgcmV0dXJuIHRoZSByZXN1bHRpbmcgc291cmNlIGNvZGUuXG5cdC8vXHQtIGlmIG9uZSBzdHJpbmcgYXJndW1lbnQsIGNvbXBpbGVzIGFzIFwic3RhdGVtZW50c1wiXG5cdC8vIFRocm93cyBpZiBub3QgcGFyc2VhYmxlLlxuLy9URVNUTUVcblx0Y29tcGlsZShydWxlTmFtZSwgdGV4dCkge1xuXHRcdC8vIElmIG9ubHkgb25lIGFyZ3VtZW50LCBhc3N1bWUgdGhhdCdzIHRoZSB0ZXh0IGFuZCBwYXJzZSBgc3RhdGVtZW50c2Bcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0dGV4dCA9IHJ1bGVOYW1lO1xuXHRcdFx0cnVsZU5hbWUgPSBcInN0YXRlbWVudHNcIjtcblx0XHR9XG5cdFx0bGV0IHJlc3VsdCA9IHRoaXMucGFyc2UocnVsZU5hbWUsIHRleHQpO1xuXHRcdGlmICghcmVzdWx0KSB7XG5cdFx0ICB0aHJvdyBuZXcgUGFyc2VFcnJvcihgcGFyc2VyLnBhcnNlKCcke3J1bGVOYW1lfScsICcke3RleHR9Jyk6IGNhbid0IHBhcnNlIHRleHRgKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdC50b1NvdXJjZSh0aGlzKTtcblx0fVxuXG5cblx0Ly8gUGFyc2UgYSBuYW1lZCBydWxlIChkZWZpbmVkIGluIHRoaXMgcGFyc2VyIG9yIGluIGFueSBvZiBvdXIgYGltcG9ydHNgKSwgcmV0dXJuaW5nIHRoZSBcImJlc3RcIiBtYXRjaC5cblx0Ly8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBubyBtYXRjaC5cblx0Ly8gVGhyb3dzIGlmIHJ1bGUgaXMgbm90IGltcGxlbWVudGVkLlxuXHRwYXJzZU5hbWVkUnVsZShydWxlTmFtZSwgdG9rZW5zLCBzdGFydCwgZW5kLCBzdGFjaywgY2FsbGluZ0NvbnRleHQgPSBcInBhcnNlTmFtZWRSdWxlXCIpIHtcbiAgICBjb25zdCBydWxlID0gdGhpcy5ydWxlc1tydWxlTmFtZV07XG5cdFx0aWYgKCFydWxlKSB0aHJvdyBuZXcgUGFyc2VFcnJvcihgJHtjYWxsaW5nQ29udGV4dH06IHJ1bGUgJyR7cnVsZU5hbWV9JyBub3QgZm91bmRgKTtcbiAgICByZXR1cm4gcnVsZS5wYXJzZSh0aGlzLCB0b2tlbnMsIHN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0fVxuXG5cdC8vIFRlc3Qgd2hldGhlciBhIHJ1bGUgKHdoaWNoIG1heSBiZSBzcGVjaWZpZWQgYnkgbmFtZSkgTUlHSFQgYmUgZm91bmQgaW4gaGVhZCBvZiBzdHJlYW0uXG5cdC8vIFJldHVybnM6XG5cdC8vXHQtIGB0cnVlYCBpZiB0aGUgcnVsZSBNSUdIVCBiZSBtYXRjaGVkLlxuXHQvL1x0LSBgZmFsc2VgIGlmIHRoZXJlIGlzIE5PIFdBWSB0aGUgcnVsZSBjYW4gYmUgbWF0Y2hlZC5cblx0Ly9cdC0gYHVuZGVmaW5lZGAgaWYgbm90IGRldGVybWluc3RpYyAoZWc6IG5vIHdheSB0byB0ZWxsIHF1aWNrbHkpLlxuXHR0ZXN0KHJ1bGUsIHRva2Vucywgc3RhcnQsIGVuZCkge1xuXHQgIGlmICh0eXBlb2YgcnVsZSA9PT0gXCJzdHJpbmdcIikge1xuXHQgICAgcnVsZSA9IHRoaXMucnVsZXNbcnVsZV07XG5cdCAgICBpZiAoIXJ1bGUpIHJldHVybiB1bmRlZmluZWQ7ICAgIC8vIFRPRE86IHRocm93P1xuXHQgIH1cblx0ICByZXR1cm4gcnVsZS50ZXN0KHRoaXMsIHRva2Vucywgc3RhcnQsIGVuZCk7XG5cdH1cblxuXG4vL1xuLy8gIyMjIFx0SW1wb3J0c1xuLy9cdFx0UGFyc2VycyBjYW4gZGVwZW5kIG9uIG90aGVyIHBhcnNlcnMgZm9yIGFkZGl0aW9uYWwgYHJ1bGVzYC5cbi8vXHRcdEltcG9ydHMgYXJlIGxhenktYm91bmQgaW50byBgcGFyc2VyLnJ1bGVzYCBhcyBuZWNlc3NhcnkuXG4vLyAgICBXZSBhc3N1bWUgdGhlIHRvcC1sZXZlbCBwYXJzZXIgZm9yIGEgbGFuZ3VhZ2Ugd2lsbCBpbmNsdWRlIGFsbCBuZWNlc3NhcnkgaW1wb3J0cyBhdXRvbWF0aWNhbGx5LlxuLy9cblxuXHQvLyBBZGQgb25lIG9yIG1vcmUgbmFtZWQgaW1wb3J0cyB0byB0aGlzIHBhcnNlci5cblx0Ly8gSW1wb3J0cyBpbmNyZWFzZSBpbiBwcmlvcml0eSB0aGUgbGF0ZXIgdGhleSBhcmUgaW4gdGhlIGxpc3QuXG4gIGltcG9ydHMgPSBbXTtcblx0aW1wb3J0KC4uLmltcG9ydHMpIHtcblx0XHQvLyBSRVZFUlNFIHRoZSBsaXN0IG9mIGltcG9ydHMsIHNvIHRoZSBtb3N0IGdlbmVyYWwgb25lIGlzIExBU1Rcblx0XHQvLyBUaHVzIG1vcmUgc3BlY2lmaWMgaW1wb3J0cyB3aWxsIGJlIEVBUkxJRVIgaW4gdGhlIGBpbXBvcnRzYCBsaXN0LlxuXG5cdFx0Ly8gQ3JlYXRlIG5ldyBhcnJheSBvZiBpbXBvcnRzIGFuZCBhZGQgaW1wb3J0IG5hbWVzIHBhc3NlZCBpbi5cblx0XHR0aGlzLmltcG9ydHMgPSBpbXBvcnRzLnJldmVyc2UoKS5jb25jYXQodGhpcy5pbXBvcnRzKTtcblxuXHRcdC8vIGNsZWFyIGNvbmNhdGVuYXRlZCBsaXN0IG9mIHJ1bGVzIHNvIHdlJ2xsIHJlY2FjdWxhdGUgaW4gYHBhcnNlci5ydWxlc2Bcblx0XHRkZWxldGUgdGhpcy5fX3J1bGVzO1xuXHR9XG5cbi8vXG4vLyAjIyMgUnVsZXNcbi8vICAgIExpc3Qgb2YgYWxsIGtub3duIHJ1bGVzIGZvciB0aGlzIHBhcnNlci5cbi8vICAgIFlvdSBjYW4gYWNjZXNzIG5hbWVkIHJ1bGVzIGFzIGBwYXJzZXIucnVsZXNbXCJydWxlTmFtZVwiXWBcbi8vXG5cdC8vIFN0YXJ0IHdpdGggYW4gZW1wdHkgbWFwIG9mIHJ1bGVzLlxuXHRfcnVsZXMgPSB7fTtcblxuXHQvLyBSZXR1cm4gbWFwIG9mIGFsbCBrbm93biBydWxlcyBieSBydWxlIG5hbWUsIGluY2x1ZGluZyBydWxlcyBkZWZpbmVkIGluIG91ciBpbXBvcnRzLlxuXHQvLyBOT1RFOiBXZSBtZW1vaXplIHRoaXMsIHNvIG1ha2Ugc3VyZSB0byBjbGVhciBgX19ydWxlc2AgaWYgeW91J3JlIG1hbmlwdWxhdGluZyBydWxlcyBvciBpbXBvcnRzIVxuXHRnZXQgcnVsZXMoKSB7XG5cdFx0aWYgKCF0aGlzLl9fcnVsZXMpIHtcblx0XHRcdGNvbnN0IG91dHB1dCA9IHRoaXMuX19ydWxlcyA9IHt9O1xuXHRcdFx0Ly8gR2V0IGFsbCBpbXBvcnRlZCBwYXJzZXJzLCB3aXRoIHVzIGxhc3Rcblx0XHRcdGNvbnN0IGltcG9ydHMgPSBbdGhpc10uY29uY2F0KHRoaXMuaW1wb3J0cy5tYXAoUGFyc2VyLmZvck1vZHVsZSkpO1xuXG5cdFx0XHQvLyBGb3IgZWFjaCBwYXJzZXJcblx0XHRcdGltcG9ydHMuZm9yRWFjaChwYXJzZXIgPT4ge1xuXHRcdFx0XHRmb3IgKGNvbnN0IHJ1bGVOYW1lIGluIHBhcnNlci5fcnVsZXMpIHtcblx0XHRcdFx0ICBQYXJzZXIubWVyZ2VSdWxlKG91dHB1dCwgcnVsZU5hbWUsIHBhcnNlci5fcnVsZXNbcnVsZU5hbWVdKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9fcnVsZXM7XG5cdH1cblxuXHQvLyBBZGQgYSBgcnVsZWAgdG8gb3VyIGxpc3Qgb2YgcnVsZXMhXG5cdC8vIENvbnZlcnRzIHRvIGBhbHRlcm5hdGl2ZXNgIG9uIHJlLWRlZmluaW5nIHRoZSBzYW1lIHJ1bGUuXG5cdGFkZFJ1bGUocnVsZU5hbWUsIHJ1bGUpIHtcblx0XHQvLyBDbGVhciBtZW1vaXplZCBgX19ydWxlc2Agc28gd2UnbGwgcmVjYWxjdWxhdGUgYHBhcnNlci5ydWxlc2AgYXMgbmVjZXNzYXJ5XG5cdFx0ZGVsZXRlIHRoaXMuX19ydWxlcztcblxuXHRcdC8vIElmIHBhc3NlZCBhIGZ1bmN0aW9uLCBjcmVhdGUgYW4gaW5zdGFuY2UgZm9yIHRoZSBhY3R1YWwgcnVsZS5cblx0XHQvLyBUaGlzIGlzIGNvbW1vbmx5IGRvbmUgc28gSlMgd2lsbCBnaXZlIHVzIG1lYW5pbmdmdWwgY2xhc3MgbmFtZXMgaW4gZGVidWcgb3V0cHV0LlxuXHRcdGlmICh0eXBlb2YgcnVsZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRydWxlID0gbmV3IHJ1bGUoKTtcblx0XHR9XG5cblx0XHQvLyBJZiB3ZSBnb3QgYW4gYXJyYXkgb2YgYHJ1bGVOYW1lYHMsIHJlY3Vyc2l2ZWx5IGFkZCB1bmRlciBlYWNoIG5hbWUgd2l0aCB0aGUgc2FtZSBgcnVsZWAuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkocnVsZU5hbWUpKSB7XG5cdFx0XHRydWxlTmFtZS5mb3JFYWNoKHJ1bGVOYW1lID0+IHRoaXMuYWRkUnVsZShydWxlTmFtZSwgcnVsZSkgKTtcblx0XHRcdHJldHVybiBydWxlO1xuXHRcdH1cblxuXHRcdC8vIEFkZCB0byBvdXIgbGlzdCBvZiBfcnVsZXNcblx0XHRQYXJzZXIubWVyZ2VSdWxlKHRoaXMuX3J1bGVzLCBydWxlTmFtZSwgcnVsZSk7XG5cdFx0cmV0dXJuIHJ1bGU7XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIGNvbmNhdGVuYXRlZCBibGFja2xpc3QgZm9yIGEgZ2l2ZW4gbmFtZWQgcnVsZS5cblx0Z2V0QmxhY2tsaXN0KHJ1bGVOYW1lKSB7XG5cdCAgY29uc3QgcnVsZSA9IHRoaXMucnVsZXNbcnVsZU5hbWVdO1xuXHQgIGNvbnN0IHJ1bGVzID0gcnVsZSBpbnN0YW5jZW9mIFJ1bGUuQWx0ZXJuYXRpdmVzXG4gICAgICAgICAgPyBydWxlLnJ1bGVzXG4gICAgICAgICAgOiBbIHJ1bGUgXTtcblx0XHRyZXR1cm4gcnVsZXMucmVkdWNlKGZ1bmN0aW9uIChibGFja2xpc3QsIHJ1bGUpIHtcblx0XHRcdHJldHVybiBPYmplY3QuYXNzaWduKGJsYWNrbGlzdCwgcnVsZS5ibGFja2xpc3QpO1xuXHRcdH0sIHt9KTtcblx0fVxuXG4gIC8vIERlZmluZSBtdWx0aXBsZSBydWxlcyBhdCBvbmNlIHVzaW5nIHJ1bGVTeW50YXguXG4gIC8vIFNlZSBgUnVsZVN5bnRheC5qczo6ZGVmaW5lUnVsZSgpYFxuICBkZWZpbmVSdWxlcygpIHtcbiAgICBmb3IgKGNvbnN0IHJ1bGUgb2YgYXJndW1lbnRzKSB7XG4gICAgICB0aGlzLmRlZmluZVJ1bGUocnVsZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gRGVmaW5lIGEgcnVsZSB1c2luZyAocnVsZSlgc3ludGF4YCBvciBgcGF0dGVybnNgIHRvIGNyZWF0ZSB0aGUgcnVsZSBpbnN0YW5jZXMuXG4gIC8vICBgbmFtZWAgKGlkZW50aWZpZXIsIHJlcXVpcmVkKSAgQmFzZSBuYW1lIG9mIHRoZSBydWxlLlxuICAvLyAgYGFsaWFzYCAoc3RyaW5nIG9yIFtzdHJpbmddLCBvcHRpbmFsKSBPdGhlciBuYW1lcyB0byBkZWZpbmUgcnVsZSB1bmRlci5cbiAgLy8gIGBjYW5vbmljYWxgIChzdHJpbmcsIG9wdGlvbmFsKSBDYW5vbmljYWwgbmFtZSBmb3IgdGhlIHJ1bGUsIGF2YWlsYWJsZSBvbiBgUnVsZWAgZm9yIGRlYnVnZ2luZy5cbiAgLy8gIGBjb25zdHJ1Y3RvcmAgKGNsYXNzLCByZXF1aXJlZCkgQ2xhc3Mgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIGluc3RhbnRpYXRlIHRoZSBydWxlLlxuICAvLyAgYHN5bnRheGAgKHN0cmluZywgcmVxdWlyZWQpIFJ1bGVTeW50YXggc3RyaW5nIGZvciB0aGlzIHJ1bGUuXG4gIC8vICBgcGF0dGVybmAgKFJlZ0V4cCwgb3B0aW9uYWwpIFJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgYFBhdHRlcm5gIHJ1bGVzXG4gIC8vICBgcHJlY2VkZW5jZWAgKG51bWJlciwgb3B0aW9uYWwpIFByZWNlZGVuY2UgbnVtYmVyIGZvciB0aGUgcnVsZSAoY3VycmVudGx5IGRvZXNuJ3QgZG8gYW55dGhpbmcpXG4gIC8vICBgYmxhY2tsaXN0YCAoW3N0cmluZ10sIG9wdGlvbmFsKSBBcnJheSBvZiBzdHJpbmdzIGFzIGJsYWNrbGlzdCBmb3IgcGF0dGVybiBydWxlcy5cbiAgLy8gIGBsZWZ0UmVjdXJzaXZlJyAoYm9vbGVhbiwgb3B0aW9uYWwpIFNldCB0byBgdHJ1ZWAgaWYgdGhlIHJ1bGUgaXMgbGVmdC1yZWN1cnNpdmUsXG4gIC8vICAgIGkuZS4gaXQgY2FsbHMgaXRzZWxmIGFzIGEgc3VicnVsZSBiZWZvcmUgbWF0Y2hpbmcgYW55IGxpdGVyYWwgdG9rZW5zXG4gIC8vICBgdGVzdFJ1bGVgIChSdWxlIG9yIHN0cmluZywgb3B0aW9uYWwpIFJ1bGUgb3IgcnVsZSBuYW1lIHRvIHVzZSBhcyBhIHRlc3QgcnVsZVxuICAvLyAgICBzcGVjaWZ5aW5nIHRoaXMgY2FuIGxldCB1cyBqdW1wIG91dCBxdWlja2x5IGlmIHRoZXJlIGlzIG5vIHBvc3NpYmxlIG1hdGNoXG4gIC8vXG4gIC8vIE5vdGUgdGhhdCB3ZSBtdW5nZSB0aGUgYGNvbnN0cnVjdG9yYCBwYXNzZWQgaW4gZm9yIGVmZmljaWVuY3kgd2hpbGUgcGFyc2luZy5cbiAgZGVmaW5lUnVsZSh7IGNvbnN0cnVjdG9yLCAuLi5wcm9wcyB9KSB7XG4gICAgLy8gdGhyb3cgaWYgcmVxdWlyZWQgcGFyYW1zIG5vdCBwcm92aWRlZFxuICAgIGlmICghY29uc3RydWN0b3IgfHwgIXByb3BzLm5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYHBhcnNlci5kZWZpbmUoKTogWW91IG11c3QgcGFzcyAnY29uc3RydWN0b3InIGFuZCAnbmFtZSdgKTtcbiAgICB9XG4gICAgLy8gdGhyb3cgaWYgd2UncmUgcmUtdXNpbmcgYSBjb25zdHJ1Y3RvclxuICAgIGlmIChjb25zdHJ1Y3Rvci5wcm90b3R5cGUubmFtZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgcGFyc2VyLmRlZmluZSgpOiBBdHRlbXB0aW5nIHRvIHJlLXVzZSBjb25zdHJ1Y3RvciBmb3IgcnVsZSAnJHtydWxlTmFtZX0nYCk7XG4gICAgfVxuXG4gICAgLy8gTm90ZSB0aGUgbW9kdWxlIHRoYXQgdGhlIHJ1bGUgd2FzIGRlZmluZWQgaW5cbiAgICBpZiAodGhpcy5tb2R1bGUpIHByb3BzLm1vZHVsZSA9IHRoaXMubW9kdWxlO1xuXG4gICAgLy8gSWYgd2UncmUgYSBcImNhbm9uaWNhbFwiIHJ1bGUsIHNldCBvbiBSdWxlLlxuICAgIC8vIFVzZSB0aGlzIGlmIHlvdSB3YW50IHRvIGNoZWNrIHRoZSB0eXBlIG9mIGEgcnVsZSBpbiBhIHRlc3Qgb3Igc29tZXRoaW5nLlxuICAgIGlmIChwcm9wcy5jYW5vbmljYWwpIFJ1bGVbcHJvcHMuY2Fub25pY2FsXSA9IGNvbnN0cnVjdG9yO1xuXG4gICAgLy8gQ29udmVydCBibGFja2xpc3QgZnJvbSBsaXN0IG9mIHN0cmluZ3MgdG8gYSBtYXBcbiAgICBpZiAocHJvcHMuYmxhY2tsaXN0ICYmIEFycmF5LmlzQXJyYXkocHJvcHMuYmxhY2tsaXN0KSkge1xuICAgICAgY29uc3QgbWFwID0ge307XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBwcm9wcy5ibGFja2xpc3QpIG1hcFtrZXldID0gdHJ1ZTtcbiAgICAgIHByb3BzLmJsYWNrbGlzdCA9IG1hcDtcbiAgICB9XG5cbiAgICAvLyBBZGQgcHJvcHMgdG8gdGhlIGNvbnRydWN0b3IgcHJvdG95cGUgbm9uLWVudW1lcmFibHkgYW5kIG5vbi13cml0YWJseVxuICAgIC8vICBzbyB3ZSdsbCBnZXQgYW4gZXJyb3IgaWYgc29tZXRoaW5nIHRyaWVzIHRvIG92ZXJ3cml0ZSB0aGVtLlxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHByb3BzKSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLnByb3RvdHlwZSwga2V5LCB7IHZhbHVlOiBwcm9wc1trZXldIH0pO1xuICAgIH1cblxuICAgIC8vIENvbWJpbmUgYWxpYXNlcyB3aXRoIHRoZSBtYWluIG5hbWVcbiAgICBjb25zdCBuYW1lcyA9IFtwcm9wcy5uYW1lXS5jb25jYXQocHJvcHMuYWxpYXMgfHwgW10pO1xuXG4gICAgLy8gSW5zdGFudGlhdGUgb3IgcGFyc2UgdG8gY3JlYXRlIHJ1bGVzIHRvIHdvcmsgd2l0aFxuICAgIGNvbnN0IHJ1bGVzID0gcHJvcHMuc3ludGF4XG4gICAgICA/IHBhcnNlUnVsZShwcm9wcy5zeW50YXgsIGNvbnN0cnVjdG9yKVxuICAgICAgOiBbIG5ldyBjb25zdHJ1Y3RvcigpIF1cbiAgICBpZiAoIXJ1bGVzKSB0aHJvdyBuZXcgUGFyc2VFcnJvcihgZGVmaW5lUnVsZSgke3Byb3BzLnN5bnRheH0pOiBkaWRudCBnZXQgcnVsZXMgYmFja2ApO1xuXG4gICAgLy8gU29tZXRpbWVzIGBwYXJzZVJ1bGVgIHdpbGwgZ2l2ZSB1cyBhbiBhcnJheSBiYWNrLCBub3JtYWxpemUgdG8gYWx3YXlzIGhhdmUgYW4gYXJyYXlcbiAgICBydWxlcy5mb3JFYWNoKHJ1bGUgPT4gdGhpcy5hZGRSdWxlKG5hbWVzLCBydWxlKSk7XG5cbiAgICAvLyBpZiB0ZXN0cyB3ZXJlIGRlZmluZWQsIG1hcmsgYXMgYF90ZXN0YWJsZV9gXG4gICAgaWYgKHByb3BzLnRlc3RzKSB7XG4gICAgICAvLyBvbmx5IHVzZSB0aGUgZmlyc3QgcnVsZSBpZiB3ZSBnb3QgbW9yZSB0aGFuIG9uZVxuICAgICAgLy8gc28gd2UgZG9uJ3QgcnVuIHRoZSBzYW1lIHRlc3RzIG1vcmUgdGhhbiBvbmNlLlxuICAgICAgdGhpcy5hZGRSdWxlKFwiX3Rlc3RhYmxlX1wiLCBydWxlc1swXSk7XG4gICAgfVxuICB9XG5cblxuLy9cbi8vICMjIyBQYXJzZXIgcmVnaXN0cnkuXG4vL1xuXHRzdGF0aWMgUkVHSVNUUlkgPSB7fTtcblxuXHQvLyBHZXQgYSBwYXJzZXIgZm9yIGEgZ2l2ZW4gYGNvbnRleHROYW1lYC5cblx0Ly8gV2lsbCByZS11c2UgZXhpc3RpbmcgcGFyc2VyLCBvciBjcmVhdGUgYSBuZXcgb25lIGlmIG5vdCBhbHJlYWR5IGRlZmluZWQuXG5cdHN0YXRpYyBmb3JNb2R1bGUobW9kdWxlKSB7XG5cdFx0aWYgKCFQYXJzZXIuUkVHSVNUUllbbW9kdWxlXSkge1xuXHRcdFx0UGFyc2VyLlJFR0lTVFJZW21vZHVsZV0gPSBuZXcgUGFyc2VyKHsgbW9kdWxlIH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gUGFyc2VyLlJFR0lTVFJZW21vZHVsZV07XG5cdH1cblxuXG4vL1xuLy8gIyMgVXRpbGl0eSBtZXRob2RzXG4vL1xuXG4gIC8vIE1lcmdlIGBydWxlYCBpbnRvIGBtYXBgIG9mIHJ1bGVzIGJ5IGBydWxlTmFtZWAuXG4gIC8vIElmIHdlIGFscmVhZHkgaGF2ZSBhIHJ1bGUgd2l0aCB0aGF0IG5hbWUsIHdlJ2xsIGFkZCBpdCBhcyBhbiBhbHRlcm5hdGl2ZS5cbi8vVEVTVE1FXG4gIHN0YXRpYyBtZXJnZVJ1bGUobWFwLCBydWxlTmFtZSwgcnVsZSkge1xuICAgIGxldCBleGlzdGluZyA9IG1hcFtydWxlTmFtZV07XG4gICAgaWYgKCFleGlzdGluZykge1xuICAgICAgbWFwW3J1bGVOYW1lXSA9IHJ1bGU7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCEoZXhpc3RpbmcgaW5zdGFuY2VvZiBSdWxlLkFsdGVybmF0aXZlcykgfHwgKGV4aXN0aW5nLmdyb3VwICE9PSBydWxlTmFtZSkpIHtcbiAgICAgIGNvbnN0IGFsdENvbnN0cnVjdG9yID0gY2xvbmVDbGFzcyhSdWxlLkFsdGVybmF0aXZlcywgcnVsZU5hbWUpO1xuICAgICAgZXhpc3RpbmcgPSBtYXBbcnVsZU5hbWVdID0gbmV3IGFsdENvbnN0cnVjdG9yKHtcbiAgICAgICAgZ3JvdXA6IHJ1bGVOYW1lLFxuICAgICAgICBydWxlczogWyBleGlzdGluZyBdXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAocnVsZSBpbnN0YW5jZW9mIFJ1bGUuQWx0ZXJuYXRpdmVzICYmIChydWxlLmdyb3VwID09PSBydWxlTmFtZSkpIHtcbiAgICAgIGV4aXN0aW5nLmFkZFJ1bGUoLi4ucnVsZS5ydWxlcyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZXhpc3RpbmcuYWRkUnVsZShydWxlKTtcbiAgICB9XG4gIH1cblxuXHQvLyBGaW5kIHRoZSBtYXRjaGluZyBpbnN0YW5jZSBvZiAocG9zc2libHkgbmVzdGVkKSBgZW5kVG9rZW5gIHRvIGJhbGFuY2UgYHN0YXJ0VG9rZW5gXG5cdC8vXHRpbiBhcnJheSBvZiBgdG9rZW5zYCAoc3RyaW5ncykuXG5cdC8vIElmIHN1Y2Nlc3NmdWwsIHJldHVybnMgYHsgc3RhcnQsIGVuZCwgc2xpY2UgfWBcblx0Ly8gVGhyb3dzIGlmIHVuc3VjZXNzZnVsLlxuXHRzdGF0aWMgZmluZE5lc3RlZFRva2Vucyh0b2tlbnMsIHN0YXJ0VG9rZW4sIGVuZFRva2VuLCBzdGFydCA9IDApIHtcblx0XHRpZiAodG9rZW5zW3N0YXJ0XSAhPT0gc3RhcnRUb2tlbikgdGhyb3cgbmV3IFBhcnNlRXJyb3IoYEV4cGVjdGVkICcke3N0YXJ0VG9rZW59JyBhdCBpbmRleCAke3N0YXJ0fSBvZiB0b2tlbnNgKTtcblx0XHRsZXQgbmVzdGluZyA9IDA7XG5cdFx0bGV0IG5lc3RlZCA9IGZhbHNlO1xuXHRcdGZvciAobGV0IGVuZCA9IHN0YXJ0ICsgMSwgbGFzdEluZGV4ID0gdG9rZW5zLmxlbmd0aDsgZW5kIDwgbGFzdEluZGV4OyBlbmQrKykge1xuXHRcdFx0bGV0IHRva2VuID0gdG9rZW5zW2VuZF07XG5cdFx0XHRpZiAodG9rZW4gPT09IHN0YXJ0VG9rZW4pIHtcblx0XHRcdFx0bmVzdGluZysrO1xuXHRcdFx0XHRuZXN0ZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRva2VuID09PSBlbmRUb2tlbikge1xuXHRcdFx0XHRpZiAobmVzdGluZyA9PT0gMClcblx0XHRcdFx0XHRyZXR1cm4geyBzdGFydCwgZW5kLCBzbGljZTogdG9rZW5zLnNsaWNlKHN0YXJ0KzEsIGVuZCksIG5lc3RlZCB9O1xuXHRcdFx0XHRuZXN0aW5nLS07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRocm93IG5ldyBQYXJzZUVycm9yKGBDb3VsZG4ndCBmaW5kIG1hdGNoaW5nICcke2VuZFRva2VufSdzIHN0YXJ0aW5nIGF0IGl0ZW0gJHtzdGFydH1gKTtcblx0fVxufVxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvUGFyc2VyLmpzIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICB2YXIgUkVBQ1RfRUxFTUVOVF9UWVBFID0gKHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiZcbiAgICBTeW1ib2wuZm9yICYmXG4gICAgU3ltYm9sLmZvcigncmVhY3QuZWxlbWVudCcpKSB8fFxuICAgIDB4ZWFjNztcblxuICB2YXIgaXNWYWxpZEVsZW1lbnQgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIG9iamVjdCAhPT0gbnVsbCAmJlxuICAgICAgb2JqZWN0LiQkdHlwZW9mID09PSBSRUFDVF9FTEVNRU5UX1RZUEU7XG4gIH07XG5cbiAgLy8gQnkgZXhwbGljaXRseSB1c2luZyBgcHJvcC10eXBlc2AgeW91IGFyZSBvcHRpbmcgaW50byBuZXcgZGV2ZWxvcG1lbnQgYmVoYXZpb3IuXG4gIC8vIGh0dHA6Ly9mYi5tZS9wcm9wLXR5cGVzLWluLXByb2RcbiAgdmFyIHRocm93T25EaXJlY3RBY2Nlc3MgPSB0cnVlO1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZmFjdG9yeVdpdGhUeXBlQ2hlY2tlcnMnKShpc1ZhbGlkRWxlbWVudCwgdGhyb3dPbkRpcmVjdEFjY2Vzcyk7XG59IGVsc2Uge1xuICAvLyBCeSBleHBsaWNpdGx5IHVzaW5nIGBwcm9wLXR5cGVzYCB5b3UgYXJlIG9wdGluZyBpbnRvIG5ldyBwcm9kdWN0aW9uIGJlaGF2aW9yLlxuICAvLyBodHRwOi8vZmIubWUvcHJvcC10eXBlcy1pbi1wcm9kXG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9mYWN0b3J5V2l0aFRocm93aW5nU2hpbXMnKSgpO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3Byb3AtdHlwZXMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDM1OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJmdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuLyogZXNsaW50LWRpc2FibGUgbm8tdXNlLWJlZm9yZS1kZWZpbmUgKi9cbi8qKlxuICogQG1vZHVsZSBldmVudEhhbmRsZXJzXG4gKlxuICovXG5pbXBvcnQgZG9tSGVscGVycyBmcm9tICcuL2xpYi9kb21faGVscGVycyc7XG5pbXBvcnQgbGlzdGVuZXJzIGZyb20gJy4vbGliL2xpc3RlbmVycyc7XG5pbXBvcnQgKiBhcyBzdG9yZSBmcm9tICcuL3N0b3JlJztcblxuLyoqXG4gKiBwcml2YXRlXG4gKlxuICovXG5cbi8qKlxuICogX29uQ2xpY2tcbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCBUaGUgY2xpY2sgZXZlbnQgb2JqZWN0XG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnQudGFyZ2V0IFRoZSBET00gbm9kZSBmcm9tIHRoZSBjbGljayBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gX29uQ2xpY2soX3JlZikge1xuICB2YXIgdGFyZ2V0ID0gX3JlZi50YXJnZXQ7XG5cbiAgc3RvcmUuYWN0aXZhdGUoW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShzdG9yZS5nZXRJbnN0YW5jZXMoKSkpLnJlZHVjZShkb21IZWxwZXJzLmZpbmRDb250YWluZXJOb2Rlcyh0YXJnZXQpLCBbXSkuc29ydChkb21IZWxwZXJzLnNvcnRCeURPTVBvc2l0aW9uKS5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5pbnN0YW5jZTtcbiAgfSkpO1xufVxuXG4vKipcbiAqIF9vbktleURvd246IFRoZSBrZXlkb3duIGV2ZW50IGNhbGxiYWNrXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgVGhlIGtleWRvd24gZXZlbnQgb2JqZWN0XG4gKiBAcGFyYW0ge251bWJlcn0gZXZlbnQud2hpY2ggVGhlIGtleSBjb2RlICh3aGljaCkgcmVjZWl2ZWQgZnJvbSB0aGUga2V5ZG93biBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gX29uS2V5RG93bihldmVudCkge1xuICB2YXIgZm9yY2VDb25zaWRlciA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG5cbiAgaWYgKGZvcmNlQ29uc2lkZXIgfHwgX3Nob3VsZENvbnNpZGVyKGV2ZW50KSkge1xuICAgIHZhciBfcmVmMiA9IHN0b3JlLmZpbmRCaW5kaW5nRm9yRXZlbnQoZXZlbnQpIHx8IHt9LFxuICAgICAgICBmbiA9IF9yZWYyLmZuLFxuICAgICAgICBpbnN0YW5jZSA9IF9yZWYyLmluc3RhbmNlO1xuXG4gICAgaWYgKGZuKSB7XG4gICAgICBmbi5jYWxsKGluc3RhbmNlLCBldmVudCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIF9zaG91bGRDb25zaWRlcjogQ29uZGl0aW9ucyBmb3IgcHJvY2VlZGluZyB3aXRoIGtleSBldmVudCBoYW5kbGluZ1xuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IFRoZSBrZXlkb3duIGV2ZW50IG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50LnRhcmdldCBUaGUgbm9kZSBvcmlnaW4gb2YgdGhlIGV2ZW50XG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHRvIGNvbnRpbnVlIHByb2Nlc2luZyB0aGUga2V5ZG93biBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gX3Nob3VsZENvbnNpZGVyKF9yZWYzKSB7XG4gIHZhciBjdHJsS2V5ID0gX3JlZjMuY3RybEtleSxcbiAgICAgIHRhcmdldCA9IF9yZWYzLnRhcmdldDtcblxuICByZXR1cm4gY3RybEtleSB8fCAhflsnSU5QVVQnLCAnU0VMRUNUJywgJ1RFWFRBUkVBJ10uaW5kZXhPZih0YXJnZXQudGFnTmFtZSkgJiYgKCF0YXJnZXQuZ2V0QXR0cmlidXRlIHx8IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ3JvbGUnKSAhPT0gJ3RleHRib3gnKTtcbn1cblxuLyoqXG4gKiBwdWJsaWNcbiAqXG4gKi9cblxuLyoqXG4gKiBvbk1vdW50XG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gb25Nb3VudChpbnN0YW5jZSkge1xuICBzdG9yZS5hY3RpdmF0ZShpbnN0YW5jZSk7XG4gIGxpc3RlbmVycy5iaW5kS2V5cyhfb25LZXlEb3duKTtcbiAgbGlzdGVuZXJzLmJpbmRDbGlja3MoX29uQ2xpY2spO1xuICBkb21IZWxwZXJzLmJpbmRGb2N1c2FibGVzKGluc3RhbmNlLCBzdG9yZS5hY3RpdmF0ZSk7XG59XG5cbi8qKlxuICogb25Vbm1vdW50XG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gb25Vbm1vdW50KGluc3RhbmNlKSB7XG4gIHN0b3JlLmRlbGV0ZUluc3RhbmNlKGluc3RhbmNlKTtcbiAgaWYgKHN0b3JlLmlzRW1wdHkoKSkge1xuICAgIGxpc3RlbmVycy51bmJpbmRDbGlja3MoX29uQ2xpY2spO1xuICAgIGxpc3RlbmVycy51bmJpbmRLZXlzKF9vbktleURvd24pO1xuICB9XG59XG5cbmV4cG9ydCB7IG9uTW91bnQsIG9uVW5tb3VudCB9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2V2ZW50X2hhbmRsZXJzLmpzXG4vLyBtb2R1bGUgaWQgPSAzODFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgbW9kaWZpZXJzIGFzIG1vZGlmaWVyS2V5cywgQUxMX0tFWVMsIEFMTF9QUklOVEFCTEVfS0VZUyB9IGZyb20gJy4va2V5cyc7XG5cbnZhciBQUklOVEFCTEVfQ0hBUkFDVEVSUyA9ICcwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWn4hQCMkJV4mKigpLV8rPVtdXFxcXHt9fDtcXCc6XCIsLi88Pj/Coyc7XG5cbnZhciBtb2RLZXlzID0gT2JqZWN0LmtleXMobW9kaWZpZXJLZXlzKTtcblxuZnVuY3Rpb24gbWF0Y2hLZXlzKF9yZWYpIHtcbiAgdmFyIGtleVNldCA9IF9yZWYua2V5U2V0LFxuICAgICAgZXZlbnQgPSBfcmVmLmV2ZW50O1xuICB2YXIga2V5ID0ga2V5U2V0LmtleSxcbiAgICAgIF9rZXlTZXQkbW9kaWZpZXJzID0ga2V5U2V0Lm1vZGlmaWVycyxcbiAgICAgIG1vZGlmaWVycyA9IF9rZXlTZXQkbW9kaWZpZXJzID09PSB1bmRlZmluZWQgPyBbXSA6IF9rZXlTZXQkbW9kaWZpZXJzO1xuXG4gIHZhciBrZXlzTWF0Y2ggPSB2b2lkIDA7XG5cbiAga2V5c01hdGNoID0ga2V5ID09PSBBTExfS0VZUztcblxuICBpZiAoa2V5ID09PSBBTExfUFJJTlRBQkxFX0tFWVMpIHtcbiAgICBpZiAoZXZlbnQua2V5KSB7XG4gICAgICAvLyBNb2Rlcm4gYnJvd3NlcnMgaW1wbGVtZW50IGBrZXlgLCBzbyBpZiBga2V5YCBpcyBsZW5ndGggMSwgd2UgaGF2ZSBhIG1hdGNoLiBlLmcuICdhJyBmb3IgdGhlXG4gICAgICAvLyBhIGtleSwgb3IgJzInIGZvciB0aGUgMiBrZXkuIEFsbCBvdGhlciBub24tcHJpbnRhYmxlIGNoYXJhY3RlcnMgaGF2ZSBuYW1lcywgZS5nLiAnRW50ZXInIG9yICdCYWNrc3BhY2UnLlxuICAgICAga2V5c01hdGNoID0gZXZlbnQua2V5Lmxlbmd0aCA9PT0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgZG8gbm8gc3VwcG9ydCBgZXZlbnQua2V5YCwgd2UgdGVzdCBhZ2FpbnN0IGEgbGlzdCBvZiBjaGFyYWN0ZXJzXG4gICAgICB2YXIgcHJlc3NlZENoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LmNoYXJDb2RlKTtcbiAgICAgIGtleXNNYXRjaCA9IFBSSU5UQUJMRV9DSEFSQUNURVJTLmluZGV4T2YocHJlc3NlZENoYXIpID49IDA7XG4gICAgfVxuICB9XG5cbiAgaWYgKGtleSA9PT0gZXZlbnQud2hpY2gpIHtcbiAgICB2YXIgZXZ0TW9kS2V5cyA9IG1vZEtleXMuZmlsdGVyKGZ1bmN0aW9uIChtb2RLZXkpIHtcbiAgICAgIHJldHVybiBldmVudFttb2RLZXkgKyAnS2V5J107XG4gICAgfSkuc29ydCgpO1xuICAgIGtleXNNYXRjaCA9IG1vZGlmaWVycy5sZW5ndGggPT09IGV2dE1vZEtleXMubGVuZ3RoICYmIG1vZGlmaWVycy5ldmVyeShmdW5jdGlvbiAobW9kS2V5LCBpbmRleCkge1xuICAgICAgcmV0dXJuIGV2dE1vZEtleXNbaW5kZXhdID09PSBtb2RLZXk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4ga2V5c01hdGNoO1xufVxuXG5leHBvcnQgZGVmYXVsdCBtYXRjaEtleXM7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL21hdGNoX2tleXMuanNcbi8vIG1vZHVsZSBpZCA9IDM4MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgS2V5cywgeyBtb2RpZmllcnMgfSBmcm9tICcuL2tleXMnO1xuXG5mdW5jdGlvbiBwYXJzZUtleXMoa2V5c0FycmF5KSB7XG4gIHJldHVybiBrZXlzQXJyYXkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIga2V5U2V0ID0geyBrZXk6IGtleSB9O1xuICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgdmFyIGtleVN0cmluZyA9IGtleS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICAgIHZhciBtYXRjaGVzID0ga2V5U3RyaW5nLnNwbGl0KC9cXHM/XFwrXFxzPy8pO1xuICAgICAga2V5U2V0ID0gbWF0Y2hlcy5sZW5ndGggPT09IDEgPyB7IGtleTogS2V5c1trZXlTdHJpbmddIH0gOiB7XG4gICAgICAgIGtleTogS2V5c1ttYXRjaGVzLnBvcCgpXSxcbiAgICAgICAgbW9kaWZpZXJzOiBtYXRjaGVzLm1hcChmdW5jdGlvbiAobW9kS2V5KSB7XG4gICAgICAgICAgcmV0dXJuIG1vZGlmaWVyc1ttb2RLZXldO1xuICAgICAgICB9KS5zb3J0KClcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBrZXlTZXQ7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBwYXJzZUtleXM7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL3BhcnNlX2tleXMuanNcbi8vIG1vZHVsZSBpZCA9IDM4M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuXHRNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xudmFyIHN0eWxlc0luRG9tID0ge30sXG5cdG1lbW9pemUgPSBmdW5jdGlvbihmbikge1xuXHRcdHZhciBtZW1vO1xuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAodHlwZW9mIG1lbW8gPT09IFwidW5kZWZpbmVkXCIpIG1lbW8gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0cmV0dXJuIG1lbW87XG5cdFx0fTtcblx0fSxcblx0aXNPbGRJRSA9IG1lbW9pemUoZnVuY3Rpb24oKSB7XG5cdFx0Ly8gVGVzdCBmb3IgSUUgPD0gOSBhcyBwcm9wb3NlZCBieSBCcm93c2VyaGFja3Ncblx0XHQvLyBAc2VlIGh0dHA6Ly9icm93c2VyaGFja3MuY29tLyNoYWNrLWU3MWQ4NjkyZjY1MzM0MTczZmVlNzE1YzIyMmNiODA1XG5cdFx0Ly8gVGVzdHMgZm9yIGV4aXN0ZW5jZSBvZiBzdGFuZGFyZCBnbG9iYWxzIGlzIHRvIGFsbG93IHN0eWxlLWxvYWRlciBcblx0XHQvLyB0byBvcGVyYXRlIGNvcnJlY3RseSBpbnRvIG5vbi1zdGFuZGFyZCBlbnZpcm9ubWVudHNcblx0XHQvLyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJwYWNrLWNvbnRyaWIvc3R5bGUtbG9hZGVyL2lzc3Vlcy8xNzdcblx0XHRyZXR1cm4gd2luZG93ICYmIGRvY3VtZW50ICYmIGRvY3VtZW50LmFsbCAmJiAhd2luZG93LmF0b2I7XG5cdH0pLFxuXHRnZXRFbGVtZW50ID0gKGZ1bmN0aW9uKGZuKSB7XG5cdFx0dmFyIG1lbW8gPSB7fTtcblx0XHRyZXR1cm4gZnVuY3Rpb24oc2VsZWN0b3IpIHtcblx0XHRcdGlmICh0eXBlb2YgbWVtb1tzZWxlY3Rvcl0gPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0bWVtb1tzZWxlY3Rvcl0gPSBmbi5jYWxsKHRoaXMsIHNlbGVjdG9yKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBtZW1vW3NlbGVjdG9yXVxuXHRcdH07XG5cdH0pKGZ1bmN0aW9uIChzdHlsZVRhcmdldCkge1xuXHRcdHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHN0eWxlVGFyZ2V0KVxuXHR9KSxcblx0c2luZ2xldG9uRWxlbWVudCA9IG51bGwsXG5cdHNpbmdsZXRvbkNvdW50ZXIgPSAwLFxuXHRzdHlsZUVsZW1lbnRzSW5zZXJ0ZWRBdFRvcCA9IFtdLFxuXHRmaXhVcmxzID0gcmVxdWlyZShcIi4vZml4VXJsc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsaXN0LCBvcHRpb25zKSB7XG5cdGlmKHR5cGVvZiBERUJVRyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBERUJVRykge1xuXHRcdGlmKHR5cGVvZiBkb2N1bWVudCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHN0eWxlLWxvYWRlciBjYW5ub3QgYmUgdXNlZCBpbiBhIG5vbi1icm93c2VyIGVudmlyb25tZW50XCIpO1xuXHR9XG5cblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdG9wdGlvbnMuYXR0cnMgPSB0eXBlb2Ygb3B0aW9ucy5hdHRycyA9PT0gXCJvYmplY3RcIiA/IG9wdGlvbnMuYXR0cnMgOiB7fTtcblxuXHQvLyBGb3JjZSBzaW5nbGUtdGFnIHNvbHV0aW9uIG9uIElFNi05LCB3aGljaCBoYXMgYSBoYXJkIGxpbWl0IG9uIHRoZSAjIG9mIDxzdHlsZT5cblx0Ly8gdGFncyBpdCB3aWxsIGFsbG93IG9uIGEgcGFnZVxuXHRpZiAodHlwZW9mIG9wdGlvbnMuc2luZ2xldG9uID09PSBcInVuZGVmaW5lZFwiKSBvcHRpb25zLnNpbmdsZXRvbiA9IGlzT2xkSUUoKTtcblxuXHQvLyBCeSBkZWZhdWx0LCBhZGQgPHN0eWxlPiB0YWdzIHRvIHRoZSA8aGVhZD4gZWxlbWVudFxuXHRpZiAodHlwZW9mIG9wdGlvbnMuaW5zZXJ0SW50byA9PT0gXCJ1bmRlZmluZWRcIikgb3B0aW9ucy5pbnNlcnRJbnRvID0gXCJoZWFkXCI7XG5cblx0Ly8gQnkgZGVmYXVsdCwgYWRkIDxzdHlsZT4gdGFncyB0byB0aGUgYm90dG9tIG9mIHRoZSB0YXJnZXRcblx0aWYgKHR5cGVvZiBvcHRpb25zLmluc2VydEF0ID09PSBcInVuZGVmaW5lZFwiKSBvcHRpb25zLmluc2VydEF0ID0gXCJib3R0b21cIjtcblxuXHR2YXIgc3R5bGVzID0gbGlzdFRvU3R5bGVzKGxpc3QsIG9wdGlvbnMpO1xuXHRhZGRTdHlsZXNUb0RvbShzdHlsZXMsIG9wdGlvbnMpO1xuXG5cdHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuXHRcdHZhciBtYXlSZW1vdmUgPSBbXTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IHN0eWxlc1tpXTtcblx0XHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXHRcdFx0ZG9tU3R5bGUucmVmcy0tO1xuXHRcdFx0bWF5UmVtb3ZlLnB1c2goZG9tU3R5bGUpO1xuXHRcdH1cblx0XHRpZihuZXdMaXN0KSB7XG5cdFx0XHR2YXIgbmV3U3R5bGVzID0gbGlzdFRvU3R5bGVzKG5ld0xpc3QsIG9wdGlvbnMpO1xuXHRcdFx0YWRkU3R5bGVzVG9Eb20obmV3U3R5bGVzLCBvcHRpb25zKTtcblx0XHR9XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IG1heVJlbW92ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGRvbVN0eWxlID0gbWF5UmVtb3ZlW2ldO1xuXHRcdFx0aWYoZG9tU3R5bGUucmVmcyA9PT0gMCkge1xuXHRcdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgZG9tU3R5bGUucGFydHMubGVuZ3RoOyBqKyspXG5cdFx0XHRcdFx0ZG9tU3R5bGUucGFydHNbal0oKTtcblx0XHRcdFx0ZGVsZXRlIHN0eWxlc0luRG9tW2RvbVN0eWxlLmlkXTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59O1xuXG5mdW5jdGlvbiBhZGRTdHlsZXNUb0RvbShzdHlsZXMsIG9wdGlvbnMpIHtcblx0Zm9yKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xuXHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXHRcdGlmKGRvbVN0eWxlKSB7XG5cdFx0XHRkb21TdHlsZS5yZWZzKys7XG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgZG9tU3R5bGUucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0ZG9tU3R5bGUucGFydHNbal0oaXRlbS5wYXJ0c1tqXSk7XG5cdFx0XHR9XG5cdFx0XHRmb3IoOyBqIDwgaXRlbS5wYXJ0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRkb21TdHlsZS5wYXJ0cy5wdXNoKGFkZFN0eWxlKGl0ZW0ucGFydHNbal0sIG9wdGlvbnMpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHBhcnRzID0gW107XG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgaXRlbS5wYXJ0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRwYXJ0cy5wdXNoKGFkZFN0eWxlKGl0ZW0ucGFydHNbal0sIG9wdGlvbnMpKTtcblx0XHRcdH1cblx0XHRcdHN0eWxlc0luRG9tW2l0ZW0uaWRdID0ge2lkOiBpdGVtLmlkLCByZWZzOiAxLCBwYXJ0czogcGFydHN9O1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBsaXN0VG9TdHlsZXMobGlzdCwgb3B0aW9ucykge1xuXHR2YXIgc3R5bGVzID0gW107XG5cdHZhciBuZXdTdHlsZXMgPSB7fTtcblx0Zm9yKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgaXRlbSA9IGxpc3RbaV07XG5cdFx0dmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG5cdFx0dmFyIGNzcyA9IGl0ZW1bMV07XG5cdFx0dmFyIG1lZGlhID0gaXRlbVsyXTtcblx0XHR2YXIgc291cmNlTWFwID0gaXRlbVszXTtcblx0XHR2YXIgcGFydCA9IHtjc3M6IGNzcywgbWVkaWE6IG1lZGlhLCBzb3VyY2VNYXA6IHNvdXJjZU1hcH07XG5cdFx0aWYoIW5ld1N0eWxlc1tpZF0pXG5cdFx0XHRzdHlsZXMucHVzaChuZXdTdHlsZXNbaWRdID0ge2lkOiBpZCwgcGFydHM6IFtwYXJ0XX0pO1xuXHRcdGVsc2Vcblx0XHRcdG5ld1N0eWxlc1tpZF0ucGFydHMucHVzaChwYXJ0KTtcblx0fVxuXHRyZXR1cm4gc3R5bGVzO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgc3R5bGVFbGVtZW50KSB7XG5cdHZhciBzdHlsZVRhcmdldCA9IGdldEVsZW1lbnQob3B0aW9ucy5pbnNlcnRJbnRvKVxuXHRpZiAoIXN0eWxlVGFyZ2V0KSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnRJbnRvJyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG5cdH1cblx0dmFyIGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wID0gc3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3Bbc3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AubGVuZ3RoIC0gMV07XG5cdGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcInRvcFwiKSB7XG5cdFx0aWYoIWxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wKSB7XG5cdFx0XHRzdHlsZVRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGVFbGVtZW50LCBzdHlsZVRhcmdldC5maXJzdENoaWxkKTtcblx0XHR9IGVsc2UgaWYobGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3AubmV4dFNpYmxpbmcpIHtcblx0XHRcdHN0eWxlVGFyZ2V0Lmluc2VydEJlZm9yZShzdHlsZUVsZW1lbnQsIGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3R5bGVUYXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGVFbGVtZW50KTtcblx0XHR9XG5cdFx0c3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AucHVzaChzdHlsZUVsZW1lbnQpO1xuXHR9IGVsc2UgaWYgKG9wdGlvbnMuaW5zZXJ0QXQgPT09IFwiYm90dG9tXCIpIHtcblx0XHRzdHlsZVRhcmdldC5hcHBlbmRDaGlsZChzdHlsZUVsZW1lbnQpO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdmFsdWUgZm9yIHBhcmFtZXRlciAnaW5zZXJ0QXQnLiBNdXN0IGJlICd0b3AnIG9yICdib3R0b20nLlwiKTtcblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG5cdHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG5cdHZhciBpZHggPSBzdHlsZUVsZW1lbnRzSW5zZXJ0ZWRBdFRvcC5pbmRleE9mKHN0eWxlRWxlbWVudCk7XG5cdGlmKGlkeCA+PSAwKSB7XG5cdFx0c3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3Auc3BsaWNlKGlkeCwgMSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcblx0b3B0aW9ucy5hdHRycy50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuXG5cdGF0dGFjaFRhZ0F0dHJzKHN0eWxlRWxlbWVudCwgb3B0aW9ucy5hdHRycyk7XG5cdGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zLCBzdHlsZUVsZW1lbnQpO1xuXHRyZXR1cm4gc3R5bGVFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVMaW5rRWxlbWVudChvcHRpb25zKSB7XG5cdHZhciBsaW5rRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xuXHRvcHRpb25zLmF0dHJzLnR5cGUgPSBcInRleHQvY3NzXCI7XG5cdG9wdGlvbnMuYXR0cnMucmVsID0gXCJzdHlsZXNoZWV0XCI7XG5cblx0YXR0YWNoVGFnQXR0cnMobGlua0VsZW1lbnQsIG9wdGlvbnMuYXR0cnMpO1xuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgbGlua0VsZW1lbnQpO1xuXHRyZXR1cm4gbGlua0VsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGF0dGFjaFRhZ0F0dHJzKGVsZW1lbnQsIGF0dHJzKSB7XG5cdE9iamVjdC5rZXlzKGF0dHJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gYWRkU3R5bGUob2JqLCBvcHRpb25zKSB7XG5cdHZhciBzdHlsZUVsZW1lbnQsIHVwZGF0ZSwgcmVtb3ZlLCB0cmFuc2Zvcm1SZXN1bHQ7XG5cblx0Ly8gSWYgYSB0cmFuc2Zvcm0gZnVuY3Rpb24gd2FzIGRlZmluZWQsIHJ1biBpdCBvbiB0aGUgY3NzXG5cdGlmIChvcHRpb25zLnRyYW5zZm9ybSAmJiBvYmouY3NzKSB7XG5cdCAgICB0cmFuc2Zvcm1SZXN1bHQgPSBvcHRpb25zLnRyYW5zZm9ybShvYmouY3NzKTtcblx0ICAgIFxuXHQgICAgaWYgKHRyYW5zZm9ybVJlc3VsdCkge1xuXHQgICAgXHQvLyBJZiB0cmFuc2Zvcm0gcmV0dXJucyBhIHZhbHVlLCB1c2UgdGhhdCBpbnN0ZWFkIG9mIHRoZSBvcmlnaW5hbCBjc3MuXG5cdCAgICBcdC8vIFRoaXMgYWxsb3dzIHJ1bm5pbmcgcnVudGltZSB0cmFuc2Zvcm1hdGlvbnMgb24gdGhlIGNzcy5cblx0ICAgIFx0b2JqLmNzcyA9IHRyYW5zZm9ybVJlc3VsdDtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICBcdC8vIElmIHRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24gcmV0dXJucyBhIGZhbHN5IHZhbHVlLCBkb24ndCBhZGQgdGhpcyBjc3MuIFxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBjb25kaXRpb25hbCBsb2FkaW5nIG9mIGNzc1xuXHQgICAgXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdCAgICBcdFx0Ly8gbm9vcFxuXHQgICAgXHR9O1xuXHQgICAgfVxuXHR9XG5cblx0aWYgKG9wdGlvbnMuc2luZ2xldG9uKSB7XG5cdFx0dmFyIHN0eWxlSW5kZXggPSBzaW5nbGV0b25Db3VudGVyKys7XG5cdFx0c3R5bGVFbGVtZW50ID0gc2luZ2xldG9uRWxlbWVudCB8fCAoc2luZ2xldG9uRWxlbWVudCA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKSk7XG5cdFx0dXBkYXRlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlRWxlbWVudCwgc3R5bGVJbmRleCwgZmFsc2UpO1xuXHRcdHJlbW92ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZUVsZW1lbnQsIHN0eWxlSW5kZXgsIHRydWUpO1xuXHR9IGVsc2UgaWYob2JqLnNvdXJjZU1hcCAmJlxuXHRcdHR5cGVvZiBVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBVUkwuY3JlYXRlT2JqZWN0VVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgVVJMLnJldm9rZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIEJsb2IgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRzdHlsZUVsZW1lbnQgPSBjcmVhdGVMaW5rRWxlbWVudChvcHRpb25zKTtcblx0XHR1cGRhdGUgPSB1cGRhdGVMaW5rLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50LCBvcHRpb25zKTtcblx0XHRyZW1vdmUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuXHRcdFx0aWYoc3R5bGVFbGVtZW50LmhyZWYpXG5cdFx0XHRcdFVSTC5yZXZva2VPYmplY3RVUkwoc3R5bGVFbGVtZW50LmhyZWYpO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0c3R5bGVFbGVtZW50ID0gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuXHRcdHVwZGF0ZSA9IGFwcGx5VG9UYWcuYmluZChudWxsLCBzdHlsZUVsZW1lbnQpO1xuXHRcdHJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG5cdFx0fTtcblx0fVxuXG5cdHVwZGF0ZShvYmopO1xuXG5cdHJldHVybiBmdW5jdGlvbiB1cGRhdGVTdHlsZShuZXdPYmopIHtcblx0XHRpZihuZXdPYmopIHtcblx0XHRcdGlmKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcClcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0dXBkYXRlKG9iaiA9IG5ld09iaik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlbW92ZSgpO1xuXHRcdH1cblx0fTtcbn1cblxudmFyIHJlcGxhY2VUZXh0ID0gKGZ1bmN0aW9uICgpIHtcblx0dmFyIHRleHRTdG9yZSA9IFtdO1xuXG5cdHJldHVybiBmdW5jdGlvbiAoaW5kZXgsIHJlcGxhY2VtZW50KSB7XG5cdFx0dGV4dFN0b3JlW2luZGV4XSA9IHJlcGxhY2VtZW50O1xuXHRcdHJldHVybiB0ZXh0U3RvcmUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuXHR9O1xufSkoKTtcblxuZnVuY3Rpb24gYXBwbHlUb1NpbmdsZXRvblRhZyhzdHlsZUVsZW1lbnQsIGluZGV4LCByZW1vdmUsIG9iaikge1xuXHR2YXIgY3NzID0gcmVtb3ZlID8gXCJcIiA6IG9iai5jc3M7XG5cblx0aWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG5cdFx0c3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IHJlcGxhY2VUZXh0KGluZGV4LCBjc3MpO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBjc3NOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKTtcblx0XHR2YXIgY2hpbGROb2RlcyA9IHN0eWxlRWxlbWVudC5jaGlsZE5vZGVzO1xuXHRcdGlmIChjaGlsZE5vZGVzW2luZGV4XSkgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKGNoaWxkTm9kZXNbaW5kZXhdKTtcblx0XHRpZiAoY2hpbGROb2Rlcy5sZW5ndGgpIHtcblx0XHRcdHN0eWxlRWxlbWVudC5pbnNlcnRCZWZvcmUoY3NzTm9kZSwgY2hpbGROb2Rlc1tpbmRleF0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoY3NzTm9kZSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGFwcGx5VG9UYWcoc3R5bGVFbGVtZW50LCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBtZWRpYSA9IG9iai5tZWRpYTtcblxuXHRpZihtZWRpYSkge1xuXHRcdHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJtZWRpYVwiLCBtZWRpYSlcblx0fVxuXG5cdGlmKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG5cdFx0c3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcblx0fSBlbHNlIHtcblx0XHR3aGlsZShzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuXHRcdFx0c3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcblx0XHR9XG5cdFx0c3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUxpbmsobGlua0VsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuXHR2YXIgY3NzID0gb2JqLmNzcztcblx0dmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cblx0LyogSWYgY29udmVydFRvQWJzb2x1dGVVcmxzIGlzbid0IGRlZmluZWQsIGJ1dCBzb3VyY2VtYXBzIGFyZSBlbmFibGVkXG5cdGFuZCB0aGVyZSBpcyBubyBwdWJsaWNQYXRoIGRlZmluZWQgdGhlbiBsZXRzIHR1cm4gY29udmVydFRvQWJzb2x1dGVVcmxzXG5cdG9uIGJ5IGRlZmF1bHQuICBPdGhlcndpc2UgZGVmYXVsdCB0byB0aGUgY29udmVydFRvQWJzb2x1dGVVcmxzIG9wdGlvblxuXHRkaXJlY3RseVxuXHQqL1xuXHR2YXIgYXV0b0ZpeFVybHMgPSBvcHRpb25zLmNvbnZlcnRUb0Fic29sdXRlVXJscyA9PT0gdW5kZWZpbmVkICYmIHNvdXJjZU1hcDtcblxuXHRpZiAob3B0aW9ucy5jb252ZXJ0VG9BYnNvbHV0ZVVybHMgfHwgYXV0b0ZpeFVybHMpe1xuXHRcdGNzcyA9IGZpeFVybHMoY3NzKTtcblx0fVxuXG5cdGlmKHNvdXJjZU1hcCkge1xuXHRcdC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI2NjAzODc1XG5cdFx0Y3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIiArIGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSkgKyBcIiAqL1wiO1xuXHR9XG5cblx0dmFyIGJsb2IgPSBuZXcgQmxvYihbY3NzXSwgeyB0eXBlOiBcInRleHQvY3NzXCIgfSk7XG5cblx0dmFyIG9sZFNyYyA9IGxpbmtFbGVtZW50LmhyZWY7XG5cblx0bGlua0VsZW1lbnQuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cblx0aWYob2xkU3JjKVxuXHRcdFVSTC5yZXZva2VPYmplY3RVUkwob2xkU3JjKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9zdHlsZS1sb2FkZXIvYWRkU3R5bGVzLmpzXG4vLyBtb2R1bGUgaWQgPSA0NzZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tIFwibW9ieC1yZWFjdFwiO1xuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IGtleWRvd24gZnJvbSBcInJlYWN0LWtleWRvd25cIjtcbmltcG9ydCB7IEJ1dHRvbiwgRHJvcGRvd24sIEdyaWQsIE1lbnUsIFNlZ21lbnQsIFRleHRBcmVhIH0gZnJvbSAnc2VtYW50aWMtdWktcmVhY3QnXG5cbmltcG9ydCBFeGFtcGxlU3RvcmUgZnJvbSBcIi4vRXhhbXBsZVN0b3JlXCI7XG5pbXBvcnQgU3BhY2VyIGZyb20gXCIuL1NwYWNlci5qc3hcIjtcbmltcG9ydCBcIi4vc3R5bGVzLmxlc3NcIjtcbmltcG9ydCBUYWJiYWJsZVRleHRBcmVhIGZyb20gXCIuL1RhYmJhYmxlVGV4dEFyZWEuanN4XCI7XG5cbkBvYnNlcnZlclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BlbGxFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuXHRcdGV4YW1wbGVzOiBuZXcgRXhhbXBsZVN0b3JlKClcblx0fTtcblxuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHN1cGVyKHByb3BzKTtcbndpbmRvdy5leGFtcGxlcyA9IHByb3BzLmV4YW1wbGVzO1xuXHRcdHRoaXMucHJvcHMuZXhhbXBsZXMubG9hZCgpO1xuXG5cdFx0Ly9ERUJVR1xuXHRcdHdpbmRvdy5zcGVsbEVkaXRvciA9IHRoaXM7XG5cdFx0d2luZG93LmV4YW1wbGVzID0gdGhpcy5wcm9wcy5leGFtcGxlcztcblx0fVxuXG5cdEBrZXlkb3duKFwiY3RybCtzXCIpXG5cdHNhdmUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuc2F2ZSgpOyB9XG5cblx0QGtleWRvd24oXCJjdHJsK3JcIilcblx0cmV2ZXJ0KCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLnJldmVydCgpOyB9XG5cblx0QGtleWRvd24oXCJjdHJsK2NcIilcblx0Y29tcGlsZSgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5jb21waWxlKCk7IH1cblxuXHRAa2V5ZG93bihcImN0cmwrblwiKVxuXHRjcmVhdGUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuY3JlYXRlKCk7IH1cblxuXHRAa2V5ZG93bihcImN0cmwrZFwiKVxuXHRkZWxldGUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuZGVsZXRlKHVuZGVmaW5lZCwgXCJDT05GSVJNXCIpOyB9XG5cblx0cmVuYW1lKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLnJlbmFtZSgpOyB9XG5cdGR1cGxpY2F0ZSgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5kdXBsaWNhdGUoKTsgfVxuXHRsb2FkKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLmxvYWQoKTsgfVxuXHRyZXNldCgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5yZXNldCgpOyB9XG5cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IHsgZXhhbXBsZXMgfSA9IHRoaXMucHJvcHM7XG5cdFx0bGV0IHsgdGl0bGVzLCBzZWxlY3RlZCwgZGlydHksIGNvZGUsIG91dHB1dCB9ID0gZXhhbXBsZXM7XG5cblx0XHQvLyBDcmVhdGUgbWVudWl0ZW1zIGZyb20gdGhlIGV4YW1wbGVzXG5cdFx0bGV0IG9wdGlvbnMgPSB0aXRsZXMubWFwKCB0aXRsZSA9PlxuXHRcdFx0KHtcblx0XHRcdFx0dmFsdWU6IHRpdGxlLFxuXHRcdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRcdHRleHQ6IHRpdGxlLFxuXHRcdFx0XHRjb250ZW50OiB0aXRsZSxcblx0XHRcdFx0b25DbGljazogKCkgPT4gZXhhbXBsZXMuc2VsZWN0KHRpdGxlKVxuXHRcdFx0fSkpO1xuXG5cdFx0bGV0IGRpcnR5QnV0dG9ucyA9ICgpID0+IHtcblx0XHRcdGlmICghZGlydHkpIHJldHVybjtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxNZW51IHNlY29uZGFyeSBzdHlsZT17eyBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLCByaWdodDogXCIxcmVtXCIsIHRvcDogXCIzcHhcIiwgbWFyZ2luOiAwIH19PlxuXHRcdFx0XHRcdDxCdXR0b24gbmVnYXRpdmUgb25DbGljaz17KCkgPT4gdGhpcy5yZXZlcnQoKX0+PHU+UjwvdT5ldmVydDwvQnV0dG9uPlxuXHRcdFx0XHRcdDxCdXR0b24gcG9zaXRpdmUgb25DbGljaz17KCkgPT4gdGhpcy5zYXZlKCl9Pjx1PlM8L3U+YXZlPC9CdXR0b24+XG5cdFx0XHRcdDwvTWVudT5cblx0XHRcdCk7XG5cdFx0fTtcblxuXHRcdGxldCBjb21waWxlQnV0dG9uID0gKCkgPT4ge1xuXHRcdFx0aWYgKG91dHB1dCkgcmV0dXJuO1xuXHRcdFx0cmV0dXJuIDxCdXR0b25cblx0XHRcdFx0XHRzdHlsZT17eyBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLCAgd2lkdGg6IFwiNGVtXCIsIGxlZnQ6IFwiY2FsYyg1MCUgLSAyZW0pXCIsIHRvcDogXCI1MCVcIiB9fVxuXHRcdFx0XHRcdG9uQ2xpY2s9eygpID0+IHRoaXMuY29tcGlsZSgpfVxuXHRcdFx0XHRcdGljb249XCJyaWdodCBjaGV2cm9uXCIvPjtcblx0XHR9O1xuXG5cdFx0cmV0dXJuIChcblx0XHQ8R3JpZCBzdHJldGNoZWQgcGFkZGVkIGNsYXNzTmFtZT1cImZ1bGxIZWlnaHRcIj5cblx0XHRcdDxHcmlkLlJvdyBzdHlsZT17eyBoZWlnaHQ6IFwiMnJlbVwiLCBwYWRkaW5nVG9wOiBcIjByZW1cIiB9fSBjbGFzc05hbWU9XCJ1aSBpbnZlcnRlZCBhdHRhY2hlZCBtZW51XCI+XG5cdFx0XHRcdDxHcmlkLkNvbHVtbiB3aWR0aD17N30+XG5cdFx0XHRcdFx0PE1lbnUgaW52ZXJ0ZWQgYXR0YWNoZWQgZmx1aWQ+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtPkV4YW1wbGU6PC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0XHQ8RHJvcGRvd24gaXRlbSBzZWxlY3Rpb24gb3B0aW9ucz17b3B0aW9uc30gdmFsdWU9e3NlbGVjdGVkfSBzdHlsZT17eyB3aWR0aDogXCIyMGVtXCIgfX0vPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbSBvbkNsaWNrPXsoKSA9PiB0aGlzLmRlbGV0ZSgpfT48dT5EPC91PmVsZXRlPC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtIG9uQ2xpY2s9eygpID0+IHRoaXMucmVuYW1lKCl9PlJlbmFtZTwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbSBvbkNsaWNrPXsoKSA9PiB0aGlzLmR1cGxpY2F0ZSgpfT5EdXBsaWNhdGU8L01lbnUuSXRlbT5cblx0XHRcdFx0XHQ8L01lbnU+XG5cdFx0XHRcdDwvR3JpZC5Db2x1bW4+XG5cdFx0XHRcdDxHcmlkLkNvbHVtbiB3aWR0aD17Mn0+XG5cdFx0XHRcdFx0PE1lbnUgaW52ZXJ0ZWQgYXR0YWNoZWQgZmx1aWQ+XG5cdFx0XHRcdFx0XHQ8U3BhY2VyIGZsdWlkLz5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0gb25DbGljaz17KCkgPT4gdGhpcy5jcmVhdGUoKX0+PHU+TjwvdT5ldzwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdFx0PFNwYWNlciBmbHVpZC8+XG5cdFx0XHRcdFx0PC9NZW51PlxuXHRcdFx0XHQ8L0dyaWQuQ29sdW1uPlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezd9PlxuXHRcdFx0XHRcdDxNZW51IGludmVydGVkIGF0dGFjaGVkIGZsdWlkPlxuXHRcdFx0XHRcdFx0PFNwYWNlciBmbHVpZC8+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtIG9uQ2xpY2s9eygpID0+IHRoaXMubG9hZCgpfT5SZWxvYWQ8L01lbnUuSXRlbT5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0gb25DbGljaz17KCkgPT4gdGhpcy5yZXNldCgpfT5SZXNldDwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdDwvTWVudT5cblx0XHRcdFx0PC9HcmlkLkNvbHVtbj5cblx0XHRcdDwvR3JpZC5Sb3c+XG5cdFx0XHQ8R3JpZC5Sb3cgc3R5bGU9e3sgaGVpZ2h0OiBcImNhbGMoMTAwJSAtIDNyZW0pXCIgfX0+XG5cdFx0XHRcdDxHcmlkLkNvbHVtbiB3aWR0aD17OH0+XG5cdFx0XHRcdFx0PFRhYmJhYmxlVGV4dEFyZWFcblx0XHRcdFx0XHRcdGNsYXNzTmFtZT1cInVpIHNlZ21lbnRcIlxuXHRcdFx0XHRcdFx0dmFsdWU9e2NvZGV9XG5cdFx0XHRcdFx0XHRvbkNoYW5nZT17KGV2ZW50KSA9PiBleGFtcGxlcy51cGRhdGUoZXhhbXBsZXMuc2VsZWN0ZWQsIGV2ZW50LnRhcmdldC52YWx1ZSwgXCJTS0lQX1NBVkVcIil9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHR7ZGlydHlCdXR0b25zKCl9XG5cdFx0XHRcdDwvR3JpZC5Db2x1bW4+XG5cdFx0XHRcdDxHcmlkLkNvbHVtbiB3aWR0aD17OH0+XG5cdFx0XHRcdFx0PFRleHRBcmVhIGNsYXNzTmFtZT1cInVpIHNlZ21lbnRcIiB2YWx1ZT17b3V0cHV0fS8+XG5cdFx0XHRcdDwvR3JpZC5Db2x1bW4+XG5cdFx0XHRcdHtjb21waWxlQnV0dG9uKCl9XG5cdFx0XHQ8L0dyaWQuUm93PlxuXHRcdDwvR3JpZD5cblx0KTt9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL1NwZWxsRWRpdG9yLmpzeCIsIi8vIEV4cG9ydCBhbGwgc3RhbmRhcmQgXCJzcGVsbFwiIHJ1bGVzLlxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyLmpzXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZS5qc1wiO1xuaW1wb3J0IHBhcnNlUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVN5bnRheC5qc1wiO1xuaW1wb3J0IFRva2VuaXplciBmcm9tIFwiLi4vLi4vVG9rZW5pemVyLmpzXCI7XG5cbi8vIExvYWQgYWxsIHN0YW5kYXJkIHJ1bGVzIGZpbGVzLlxuaW1wb3J0IFwiLi9jb3JlLmpzXCI7XG5pbXBvcnQgXCIuL2lmLmpzXCI7XG5pbXBvcnQgXCIuL0pTWC5qc1wiO1xuaW1wb3J0IFwiLi9saXN0cy5qc1wiO1xuaW1wb3J0IFwiLi9vcGVyYXRvcnMuanNcIjtcbmltcG9ydCBcIi4vc3RhdGVtZW50cy5qc1wiO1xuaW1wb3J0IFwiLi90eXBlcy5qc1wiO1xuaW1wb3J0IFwiLi9VSS5qc1wiO1xuXG4vLyBDcmVhdGUgcGFyc2VyIHdoaWNoIGNvbWJpbmVzIGFsbCBvZiB0aGUgYWJvdmUuLi5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JNb2R1bGUoXCJzcGVsbFwiKTtcbi8vIC4uLndoaWNoIGRlcGVuZHMgb24gcnVsZXMgbG9hZGVkIGFib3ZlLi4uXG5wYXJzZXIuaW1wb3J0KFwiY29yZVwiLCBcInR5cGVzXCIsIFwibGlzdHNcIiwgXCJvcGVyYXRvcnNcIiwgXCJpZlwiLCBcInN0YXRlbWVudHNcIiwgXCJKU1hcIiwgXCJVSVwiKTtcbi8vIC4uLmFzIHRoZSBkZWZhdWx0IGV4cG9ydFxuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG4vLyBTdGljayBvdGhlciBzdHVmZiBvbiBgd2luZG93YCBmb3IgcmVmbGVjdGlvbiBhbmQgYWQtaG9jIHRlc3RpbmcuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRPYmplY3QuYXNzaWduKHdpbmRvdywge1xuXHRcdFBhcnNlcixcblx0XHRwYXJzZVJ1bGUsXG5cblx0XHRSdWxlLFxuXG5cdFx0VG9rZW5pemVyLFxuXHRcdHRva2VuaXplOiBUb2tlbml6ZXIudG9rZW5pemUuYmluZChleHBvcnRzLlRva2VuaXplciksXG5cblx0XHRwYXJzZXIsXG5cdFx0cnVsZXM6IHBhcnNlci5ydWxlcyxcblx0XHRwYXJzZTogcGFyc2VyLnBhcnNlLmJpbmQocGFyc2VyKSxcblx0XHRjb21waWxlOiBwYXJzZXIuY29tcGlsZS5iaW5kKHBhcnNlciksXG5cdH0pO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL2luZGV4LmpzIiwiLyogU3RvcmUgb2YgZXhhbXBsZSBzcGVsbCBjb2RlIGZyYWdtZW50cy4gKi9cbmltcG9ydCBtb2J4LCB7IG9ic2VydmFibGUsIGNvbXB1dGVkIH0gZnJvbSBcIm1vYnhcIjtcblxuLy8gTWFrZSBQYXJzZXIgYW5kIFRva2VuaXplciBXQVJOIGFzIHdlIHJ1blxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vUGFyc2VyXCI7XG5QYXJzZXIuV0FSTiA9IHRydWU7XG5QYXJzZXIuREVCVUcgPSB0cnVlO1xuUGFyc2VyLlRJTUUgPSB0cnVlO1xuXG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuLi9Ub2tlbml6ZXJcIjtcblRva2VuaXplci5XQVJOID0gdHJ1ZTtcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeGFtcGxlU3RvcmUge1xuXHQvLyBDVVJSRU5UIGV4YW1wbGVzXG5cdEBvYnNlcnZhYmxlIGV4YW1wbGVzID0ge307XG5cdC8vIEV4YW1wbGVzIGFzIG9mIGxhc3Qgc2F2ZSAoZm9yIHJldmVyKVxuXHRAb2JzZXJ2YWJsZSBfc2F2ZWRFeGFtcGxlcyA9IHt9O1xuXHQvLyBTZWxlY3RlZCBleGFtcGxlIGtleS5cblx0QG9ic2VydmFibGUgc2VsZWN0ZWQgPSBcIlwiO1xuXHQvLyBDb21waWxlZCBvdXRwdXQuXG5cdEBvYnNlcnZhYmxlIG91dHB1dCA9IFwiXCI7XG5cblx0Ly8gUmV0dXJuIGp1c3QgdGhlIHRpdGxlcyBvZiB0aGUgZXhhbXBsZXMuXG5cdEBjb21wdXRlZCBnZXQgdGl0bGVzKCkge1xuXHRcdHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmV4YW1wbGVzKTtcblx0fVxuXG5cdC8vIFJldHVybiB0aGUgY29kZSBmb3IgdGhlIGN1cnJlbnQgZXhhbXBsZVxuXHRAY29tcHV0ZWQgZ2V0IGNvZGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZXhhbXBsZXNbdGhpcy5zZWxlY3RlZF07XG5cdH1cblxuXHQvLyBJcyBBTllUSElORyBkaXJ0eT9cblx0QGNvbXB1dGVkIGdldCBkaXJ0eSgpIHtcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5fc2F2ZWRFeGFtcGxlcykgIT09IEpTT04uc3RyaW5naWZ5KHRoaXMuZXhhbXBsZXMpO1xuXHR9XG5cblx0Ly8gUmVzZXQgYWxsIGV4YW1wbGVzIGZyb20gbG9jYWxTdG9yYWdlLlxuXHRyZXNldCgpIHtcblx0XHRkZWxldGUgbG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZXM7XG5cdFx0ZGVsZXRlIGxvY2FsU3RvcmFnZS5zcGVsbEVkaXRvckV4YW1wbGU7XG5cdFx0d2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuXHR9XG5cblx0Ly8gTG9hZCBleGFtcGxlc1xuXHRsb2FkKCkge1xuXHRcdC8vIExvYWQgZXhhbXBsZXMgZnJvbSBsb2NhbFN0b3JhZ2Vcblx0XHR0aGlzLmV4YW1wbGVzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlc1xuXHRcdFx0fHwgJ3tcIkZvb1wiOlwiZGVmaW5lIHR5cGUgRm9vXCIsIFwiQmFyXCI6XCJkZWZpbmUgdHlwZSBCYXJcIn0nKTtcblxuXHRcdC8vIFNhdmUgYSBjb3B5IG9mIGV4YW1wbGVzIGZvciByZXZlcnRcblx0XHR0aGlzLl9zYXZlZEV4YW1wbGVzID0gdGhpcy5leGFtcGxlcztcblxuXHRcdC8vIExvYWQgc2VsZWN0ZWQgZXhhbXBsZSBuYW1lXG5cdFx0dGhpcy5zZWxlY3QobG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZSk7XG5cdH1cblxuXHQvLyBTYXZlIGN1cnJlbnQgZXhhbXBsZXMuXG5cdHNhdmUoKSB7XG5cdFx0bG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZXMgPSBKU09OLnN0cmluZ2lmeSh0aGlzLmV4YW1wbGVzKTtcblxuXHRcdC8vIFNhdmUgYSBjb3B5IG9mIGV4YW1wbGVzIGZvciByZXZlcnRcblx0XHR0aGlzLl9zYXZlZEV4YW1wbGVzID0gdGhpcy5leGFtcGxlcztcblx0fVxuXG5cdC8vIFJldmVydCB0aGUgY3VycmVudCBleGFtcGxlXG5cdHJldmVydChleGFtcGxlID0gdGhpcy5zZWxlY3RlZCkge1xuXHRcdHRoaXMudXBkYXRlKGV4YW1wbGUsIHRoaXMuX3NhdmVkRXhhbXBsZXNbZXhhbXBsZV0pO1xuXHR9XG5cblx0Ly8gU2VsZWN0IGEgZGlmZmVyZW50IGV4YW1wbGUuXG5cdHNlbGVjdChleGFtcGxlKSB7XG5cdFx0aWYgKCFleGFtcGxlIHx8IHRoaXMuZXhhbXBsZXNbZXhhbXBsZV0gPT0gbnVsbCkgZXhhbXBsZSA9IE9iamVjdC5rZXlzKHRoaXMuZXhhbXBsZXMpWzBdIHx8IFwiXCI7XG5cdFx0dGhpcy5zZWxlY3RlZCA9IGxvY2FsU3RvcmFnZS5zcGVsbEVkaXRvckV4YW1wbGUgPSBleGFtcGxlO1xuXHRcdHRoaXMub3V0cHV0ID0gXCJcIjtcblx0fVxuXG5cdC8vIENyZWF0ZSBhIG5ldyBleGFtcGxlLlxuXHQvLyBTYXZlcyBhbmQgc2VsZWN0cyB0aGUgZXhhbXBsZSBhdXRvbWF0aWNhbGx5LlxuXHR1cGRhdGUobmFtZSwgY29kZSwgc2tpcFNhdmUpIHtcblx0XHR0aGlzLmV4YW1wbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5leGFtcGxlcywgeyBbIG5hbWUgXTogY29kZSB9KTtcblx0XHR0aGlzLnNlbGVjdChuYW1lKTtcblx0XHR0aGlzLm91dHB1dCA9IFwiXCI7XG5cdFx0aWYgKCFza2lwU2F2ZSkgdGhpcy5zYXZlKCk7XG5cdH1cblxuXHQvLyBEZWxldGUgYW4gZXhhbXBsZS5cblx0Ly8gU2F2ZXMgYW5kIHNlbGVjdHMgYW5vdGhlciBleGFtcGxlIGF1dG9tYXRpY2FsbHkuXG5cdGRlbGV0ZShuYW1lID0gdGhpcy5zZWxlY3RlZCwgc2hvd0NvbmZpcm0pIHtcblx0XHRpZiAoc2hvd0NvbmZpcm0gJiYgIWNvbmZpcm0oYFJlYWxseSBkZWxldGUgZXhhbXBsZSAke25hbWV9P2ApKSByZXR1cm47XG5cdFx0bGV0IGV4YW1wbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5leGFtcGxlcyk7XG5cdFx0ZGVsZXRlIGV4YW1wbGVzW25hbWVdO1xuXHRcdHRoaXMuZXhhbXBsZXMgPSBleGFtcGxlcztcblx0XHR0aGlzLnNhdmUoKTtcblx0XHR0aGlzLnNlbGVjdCgpO1xuXHR9XG5cblx0Ly8gQ3JlYXRlIGEgbmV3IGV4YW1wbGUuXG5cdGNyZWF0ZShuYW1lLCBjb2RlID0gXCJcIikge1xuXHRcdC8vIElmIG5vIG5hbWUsIHByb21wdC5cblx0XHRpZiAoIW5hbWUpIG5hbWUgPSBwcm9tcHQoXCJOYW1lIGZvciB0aGlzIGV4YW1wbGU/XCIpO1xuXHRcdC8vIEZvcmdldCBpdCBpZiBubyBuYW1lLlxuXHRcdGlmICghbmFtZSkgcmV0dXJuO1xuXG5cdFx0dGhpcy51cGRhdGUobmFtZSwgY29kZSk7XG5cdH1cblxuXHQvLyBSZW5hbWUgYW4gZXhhbXBsZS5cblx0Ly8gU2VsZWN0cyBhbmQgc2F2ZXMgYXV0b21hdGljYWxseS5cblx0cmVuYW1lKG9sZE5hbWUgPSB0aGlzLnNlbGVjdGVkLCBuZXdOYW1lKSB7XG5cdFx0Ly8gSWYgbm8gbmV3IG5hbWUsIHByb21wdC5cblx0XHRpZiAoIW5ld05hbWUpIG5ld05hbWUgPSBwcm9tcHQoXCJOZXcgbmFtZSBmb3IgdGhpcyBleGFtcGxlP1wiLCBvbGROYW1lKTtcblxuXHRcdC8vIEZvcmdldCBpdCBpZiBubyBuYW1lIHN1cHBsaWVkIG9yIG5hbWUgaXMgdGhlIHNhbWVcblx0XHRpZiAoIW5ld05hbWUgfHwgbmV3TmFtZSA9PT0gb2xkTmFtZSkgcmV0dXJuO1xuXHRcdGlmICh0aGlzLmV4YW1wbGVzW25ld05hbWVdKSByZXR1cm4gY29uc29sZS53YXJuKGBleGFtcGxlcy5yZW5hbWUoXCIke25ld05hbWV9XCIpOiBuYW1lIGFscmVhZHkgaW4gdXNlYCk7XG5cblx0XHRsZXQgY29kZSA9IHRoaXMuZXhhbXBsZXNbb2xkTmFtZV07XG5cdFx0dGhpcy5kZWxldGUob2xkTmFtZSk7XG5cdFx0dGhpcy51cGRhdGUobmV3TmFtZSwgY29kZSk7XG5cdH1cblxuXHQvLyBEdXBsaWNhdGUgYW4gZXhhbXBsZS5cblx0ZHVwbGljYXRlKG9sZE5hbWUgPSB0aGlzLnNlbGVjdGVkLCBuZXdOYW1lKSB7XG5cdFx0Ly8gSWYgbm8gbmV3IG5hbWUsIHByb21wdC5cblx0XHRpZiAoIW5ld05hbWUpIG5ld05hbWUgPSBwcm9tcHQoXCJOZXcgbmFtZSBmb3IgZHVwbGljYXRlIGV4YW1wbGU/XCIsIG9sZE5hbWUpO1xuXHRcdC8vIEZvcmdldCBpdCBpZiBubyBuYW1lIHN1cHBsaWVkIG9yIG5hbWUgaXMgdGhlIHNhbWVcblx0XHRpZiAoIW5ld05hbWUgfHwgbmV3TmFtZSA9PT0gb2xkTmFtZSkgcmV0dXJuO1xuXHRcdGlmICh0aGlzLmV4YW1wbGVzW25ld05hbWVdKSByZXR1cm4gY29uc29sZS53YXJuKGBleGFtcGxlcy5yZW5hbWUoXCIke25ld05hbWV9XCIpOiBuYW1lIGFscmVhZHkgaW4gdXNlYCk7XG5cblx0XHR0aGlzLnVwZGF0ZShuZXdOYW1lLCB0aGlzLmNvZGUpO1xuXHR9XG5cblx0Ly8gQ29tcGlsZSB0aGUgY3VycmVudCBleGFtcGxlLCBwbGFjaW5nIGl0IGluIG91ciBgb3V0cHV0YC5cbi8vVE9ETzogc29tZSB3YXkgdG8gZG8gdGhpcyBhdXRvbWF0aWNhbGx5IHcvIFwib3V0cHV0XCIgP1xuXHRjb21waWxlKCkge1xuXHRcdHRoaXMub3V0cHV0ID0gXCIuLi5jb21waWxpbmcuLi5cIjtcblx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdGxldCByZXN1bHQgPSBwYXJzZXIucGFyc2UoXCJzdGF0ZW1lbnRzXCIsIHRoaXMuY29kZSk7XG5cdFx0XHRpZiAoIXJlc3VsdCkge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oXCJDYW4ndCBwYXJzZSFcIik7XG5cdFx0XHRcdHRoaXMub3V0cHV0ID0gXCJDYW4ndCBwYXJzZSBzdGF0ZW1lbnRzXCI7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5pbmZvKFwiUmVzdWx0XCIsIHJlc3VsdCk7XG5cdFx0XHRcdHRoaXMub3V0cHV0ID0gcmVzdWx0LnRvU291cmNlKHBhcnNlcik7XG5cdFx0XHR9XG5cdFx0fSwgMTAwKTtcblx0fVxuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL0V4YW1wbGVTdG9yZS5qcyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGZcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW5ldy1mdW5jXG4gIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbmlmICh0eXBlb2YgX19nID09ICdudW1iZXInKSBfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qc1xuLy8gbW9kdWxlIGlkID0gNDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vL1xuLy8gIDxTcGFjZXI+IGNvbXBvbmVudCBmb3IgdXNlIHdpdGggb2FrLlxuLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gXCJwcm9wLXR5cGVzXCI7XG5pbXBvcnQgeyBjbGFzc05hbWVzIH0gZnJvbSBcIi4vdXRpbFwiO1xuXG5pbXBvcnQgXCIuL1NwYWNlci5sZXNzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNwYWNlcihwcm9wcykge1xuICBjb25zdCB7XG4gICAgY2xhc3NOYW1lLFxuICAgIGFwcGVhcmFuY2UsIHNpemUsIHdpZHRoLCBoZWlnaHQsXG4gICAgaW5saW5lLCBmbHVpZCwgdGlueSwgc21hbGwsIG1lZGl1bSwgbGFyZ2UsIGh1Z2UsIG1hc3NpdmVcbiAgfSA9IHByb3BzO1xuXG4gIGNvbnN0IHNwYWNlclByb3BzID0ge1xuICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lcyhjbGFzc05hbWUsIFwib2FrXCIsIHNpemUsIGFwcGVhcmFuY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHsgaW5saW5lLCBmbHVpZCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInNwYWNlclwiKSxcbiAgICBzdHlsZToge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIDxkaXYgey4uLnNwYWNlclByb3BzfS8+O1xufVxuXG5TcGFjZXIucHJvcFR5cGVzID0ge1xuICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIGFwcGVhcmFuY2U6IFByb3BUeXBlcy5zdHJpbmcsXG4gIHNpemU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLFxuICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIsXG5cbiAgaW5saW5lOiBQcm9wVHlwZXMuYm9vbCxcbiAgZmx1aWQ6IFByb3BUeXBlcy5ib29sLFxuXG59O1xuXG5TcGFjZXIuZGVmYXVsdFByb3BzID0ge1xuICBzaXplOiBcIm1lZGl1bVwiXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL1NwYWNlci5qc3giLCJpbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgcHJvcFR5cGVzIGZyb20gXCJwcm9wLXR5cGVzXCI7XG5pbXBvcnQgeyBUZXh0QXJlYSB9IGZyb20gJ3NlbWFudGljLXVpLXJlYWN0J1xuXG4vL1xuLy9cdCMgPFRhYmJhYmxlVGV4dEFyZWE+IC0tIDxTVUkuVGV4dEFyZWE+IGluIHdoaWNoIHlvdSBjYW4gdHlwZSBhIHRhYiBjaGFyYWN0ZXI6XG4vL1x0LSBJZiBub3RoaW5nIGlzIHNlbGVjdGVkLCBpbnNlcnRzIGEgdGFiIGNoYXJhY3RlclxuLy9cdC0gSWYgYW55dGhpbmcgaXMgc2VsZWN0ZWQsIGluc2VydHMgdGFiIGNoYXJhY3RlcnMgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZShzKVxuLy9cdC0gSWYgc2hpZnQga2V5IGlzIGRvd24sIGluc2VydHMgdGFiIGNoYXJhY3RlcnMgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZShzKS5cbi8vXG4vL1x0IyMjIFByb3BlcnRpZXNcbi8vXHQtIGBzYXZlYCAocmVxdWlyZWQpIC0tIGZ1bmN0aW9uIHVzZWQgdG8gc2F2ZSB0aGUgcmVzdWx0cyBvbiBrZXlwcmVzc1xuLy9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhYmJhYmxlVGV4dEFyZWEgZXh0ZW5kcyBUZXh0QXJlYSB7XG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gPFRleHRBcmVhIHsuLi50aGlzLnByb3BzfSBvbktleURvd249e3RoaXMub25LZXlEb3dufSAvPjtcblx0fVxuXG5cdC8vIERvIE5PVCBleGl0IG9uIHRhYiAtLSBpbnNlcnQgb3IgcmVtb3ZlIHRhYihzKSB2YWx1ZSBpbnN0ZWFkLlxuXHRvbktleURvd24gPSAoZXZlbnQpID0+IHtcblxuLy9UT0RPIGZpcmUgYHRoaXMucHJvcHMub25LZXlEb3duYCBpZiBkZWZpbmVkLi4uXG5cdFx0Ly8gRm9yZ2V0IGl0IGlmIG5vdCBhIHRhYlxuXHRcdGlmIChldmVudC5rZXlDb2RlICE9PSA5KSByZXR1cm47XG5cblx0XHQvLyBwcmV2ZW50IGRlZmF1bHQgc28gd2UgZG9uJ3QgZXhpdCB0aGUgZmllbGRcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0Ly8gZmlndXJlIG91dCB0aGUgdGV4dCByYW5nZVxuXHRcdHZhciBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuXHRcdHZhciB0ZXh0ID0gZWxlbWVudC52YWx1ZTtcblx0XHR2YXIgc3RhcnQgPSBlbGVtZW50LnNlbGVjdGlvblN0YXJ0O1xuXHRcdHZhciBlbmQgPSBlbGVtZW50LnNlbGVjdGlvbkVuZDtcblxuXHRcdC8vIFJlcGxhY2VtZW50IHRleHRcblx0XHRsZXQgbmV3VGV4dCA9IFwiXCIsIHNlbGVjdGlvblN0YXJ0ID0gc3RhcnQsIHNlbGVjdGlvbkVuZCA9IGVuZDtcblxuXHRcdC8vIElmIHNlbGVjdGlvbiBpcyBlbXB0eSxcblx0XHRpZiAoc3RhcnQgPT09IGVuZCAmJiAhZXZlbnQuc2hpZnRLZXkpIHtcblx0XHRcdG5ld1RleHQgPSBcIlxcdFwiO1xuXHRcdFx0c2VsZWN0aW9uU3RhcnQgPSBzZWxlY3Rpb25FbmQgPSBlbmQgKyAxO1xuXHRcdH1cblx0XHQvLyBvdGhlcndpc2UgaW5kZW50L2RlLWluZGVudCBhbGwgb2YgdGhlIGxpbmVzXG5cdFx0ZWxzZSB7XG5cdFx0Ly8gdXNlIHN0YXJ0IGFuZCBlbmQgb2YgbGluZShzKVxuLy9jb25zb2xlLmluZm8oYHN0YXJ0OiAke3N0YXJ0fSA6JHt0ZXh0W3N0YXJ0XX06ICAgZW5kOiAke2VuZH0gOiAke3RleHRbZW5kXX06YCk7XG5cdFx0XHRpZiAodGV4dFtzdGFydF0gIT09IFwiXFxuXCIpIHN0YXJ0ID0gdGV4dC5sYXN0SW5kZXhPZihcIlxcblwiLCBzdGFydCkgKyAxO1xuXHRcdFx0aWYgKHRleHRbZW5kLTFdID09PSBcIlxcblwiKSBlbmQtLTtcblx0XHRcdGVsc2UgaWYgKHRleHRbZW5kKzFdICE9PSBcIlxcblwiKSBlbmQgPSB0ZXh0LmluZGV4T2YoXCJcXG5cIiwgZW5kKSAtIDE7XG4vL2NvbnNvbGUuaW5mbyhgc3RhcnQ6ICR7c3RhcnR9IDoke3RleHRbc3RhcnRdfTogICBlbmQ6ICR7ZW5kfSA6ICR7dGV4dFtlbmRdfTpgKTtcblxuXHRcdFx0bGV0IGxpbmVzID0gdGV4dC5zbGljZShzdGFydCwgZW5kKS5zcGxpdChcIlxcblwiKTtcblx0XHRcdC8vIGlmIHNoaWZ0IGtleSBpcyBkb3duLCBSRU1PVkUgYSB0YWIgZnJvbSBlYWNoIGxpbmVcblx0XHRcdGlmIChldmVudC5zaGlmdEtleSkge1xuXHRcdFx0XHRsaW5lcyA9IGxpbmVzLm1hcChsaW5lID0+IGxpbmVbMF0gPT09IFwiXFx0XCIgPyBsaW5lLnN1YnN0cigxKSA6IGxpbmUpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gb3RoZXJ3aXNlIEFERCBhIHRhYiB0byBlYWNoIGxpbmVcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRsaW5lcyA9IGxpbmVzLm1hcChsaW5lID0+IFwiXFx0XCIgKyBsaW5lKTtcblx0XHRcdH1cblx0XHRcdHNlbGVjdGlvblN0YXJ0ID0gc3RhcnQ7XG5cdFx0XHRuZXdUZXh0ID0gbGluZXMuam9pbihcIlxcblwiKTtcblx0XHRcdHNlbGVjdGlvbkVuZCA9IHNlbGVjdGlvblN0YXJ0ICsgbmV3VGV4dC5sZW5ndGggKyAxO1xuXHRcdH1cblxuXHRcdC8vIFVwZGF0ZSBpbnB1dCB2YWx1ZS5cblx0XHRlbGVtZW50LnZhbHVlIFx0PSB0ZXh0LnN1YnN0cigwLCBzdGFydClcblx0XHRcdFx0XHRcdCsgbmV3VGV4dFxuXHRcdFx0XHRcdFx0KyB0ZXh0LnN1YnN0cihlbmQpO1xuXG5cdFx0Ly8gVXBkYXRlIHRoZSBzZWxlY3Rpb25cblx0XHRlbGVtZW50LnNlbGVjdGlvblN0YXJ0ID0gc2VsZWN0aW9uU3RhcnQ7XG5cdFx0ZWxlbWVudC5zZWxlY3Rpb25FbmQgPSBzZWxlY3Rpb25FbmQ7XG5cblx0XHQvLyBEZWxlZ2F0ZSB0byBgcHJvcHMub25DaGFuZ2VgIHRvIHNhdmUgdGhlIHZhbHVlIG91dHNpZGUgb2YgdGhlIGNvbnRyb2xcblx0XHRpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkgdGhpcy5wcm9wcy5vbkNoYW5nZShldmVudCk7XG5cdH1cblxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC9UYWJiYWJsZVRleHRBcmVhLmpzeCIsIi8vIENvbW1vbiBpbXBvcnRzXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcblxuLy8gUGFyc2VyXG5pbXBvcnQgcGFyc2VyIGZyb20gXCIuLi9ydWxlcy9zcGVsbC9pbmRleC5qc1wiO1xuXG4vLyBBcHAtc3BlY2lmaWMgaW1wb3J0c1xuaW1wb3J0IFNwZWxsRWRpdG9yIGZyb20gXCIuL1NwZWxsRWRpdG9yLmpzeFwiO1xuXG4vLyBLaWNrIG9mZiBvdXIgdG9wLWxldmVsIGVsZW1lbnRcblJlYWN0RE9NLnJlbmRlcihcbiAgPFNwZWxsRWRpdG9yIC8+LFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVhY3Qtcm9vdCcpXG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC9pbmRleC5qc3giLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICBSZWFjdCBVdGlsaXR5IGZ1bmN0aW9uc1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIGBjbGFzc05hbWVzYCwgY29uY2VwdCBzdG9sZW4gZnJvbTogIGh0dHA6Ly9qZWR3YXRzb24uZ2l0aHViLmlvL2NsYXNzbmFtZXNcbmV4cG9ydCBmdW5jdGlvbiBjbGFzc05hbWVzICguLi5hcmdzKSB7XG4gIHJldHVybiBhcmdzLm1hcCggYXJnID0+IHtcbiAgICBpZiAoIWFyZykgcmV0dXJuIFwiXCI7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYXJnKSkgcmV0dXJuIGNsYXNzTmFtZXMoLi4uYXJnKTtcbiAgICBzd2l0Y2ggKHR5cGVvZiBhcmcpIHtcbiAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgIGNhc2UgXCJzdHJpbmdcIjogIHJldHVybiBhcmc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoYXJnKS5tYXAoIGtleSA9PiBhcmdba2V5XSA/IGtleSA6IFwiXCIpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihCb29sZWFuKVxuICAgICAgICAgICAgICAgIC5qb2luKFwiIFwiKTtcbiAgICB9XG4gIH0pLmZpbHRlcihCb29sZWFuKVxuICAgIC5qb2luKFwiIFwiKTtcbn1cblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC91dGlsLmpzIiwiLy8gTWVtb2l6ZS9mb3JnZXQgc2VtYW50aWNzLlxuXG4vLyBSZXR1cm4gYSBtZW1vaXppbmcgZ2V0dGVyIGZ1bmN0aW9uLlxuLy8gVEVTVE1FXG5leHBvcnQgZnVuY3Rpb24gbWVtb2l6ZWQocHJvcGVydHksIGdldHRlcikge1xuXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHRoaXNbcHJvcGVydHldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHZhciB2YWx1ZSA9IGdldHRlci5hcHBseSh0aGlzKTtcblx0XHRcdGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdC8vIERlZmluZSBzbyB0aGF0IHdlIGNhbiBiZSBkZWxldGVkIGFuZCByZS1kZWZpbmVkLCBidXQgbm90IHNldCBvciBlbnVtZXJhdGVkLlxuXHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcGVydHksIHsgdmFsdWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRoaXNbcHJvcGVydHldO1xuXHR9XG59XG5cblxuLy8gUmV0dXJuIGEgbWVtb2l6ZSBmdW5jdGlvbiBmb3IgdXNlIGFzIGEgZ2V0dGVyIGluIGEgYE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgpYFxuLy8gVEVTVE1FXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lTWVtb2l6ZWQocHJvcGVydHksIGdldHRlcikge1xuXHRyZXR1cm4ge1xuXHRcdGdldCA6IG1lbW9pemVkKHByb3BlcnR5LCBnZXR0ZXIpXG5cdH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9tZW1vaXplLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIHBhcnNpbmcganN4XG4vL1xuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuLi8uLi9Ub2tlbml6ZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5cbi8vIENyZWF0ZSBcIkpTWFwiIHBhcnNlci5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JNb2R1bGUoXCJKU1hcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwianN4XCIsXG4gICAgYWxpYXM6IFsgXCJleHByZXNzaW9uXCIsIFwic3RhdGVtZW50XCIgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MganN4RWxlbWVudCBleHRlbmRzIFJ1bGUge1xuICAgICAgLy8gVGV4dCBzdHJpbmdzIGdldCBlbmNvZGVkIGFzIGB0ZXh0YCBvYmplY3RzIGluIHRoZSB0b2tlbiBzdHJlYW0uXG4gICAgICBwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQgPSB0b2tlbnMubGVuZ3RoKSB7XG4gICAgICAgIGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG4gICAgICAgIGlmICghKHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEVsZW1lbnQpKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSh7XG4gICAgICAgICAgbWF0Y2hlZDogdG9rZW4sXG4gICAgICAgICAgbmV4dFN0YXJ0OiBzdGFydCArIDFcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgb3VyIGF0dHJpYnV0ZXMgdG8gc291cmNlLlxuICAgICAgLy8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBubyBhdHRyaWJ1dGVzLlxuICAgICAgYXR0cnNUb1NvdXJjZShqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIGxldCBhdHRyaWJ1dGVzID0ganN4RWxlbWVudC5hdHRyaWJ1dGVzO1xuICAgICAgICBpZiAoIWF0dHJpYnV0ZXMgfHwgIWF0dHJpYnV0ZXMubGVuZ3RoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgICAgIGxldCBhdHRycyA9IGF0dHJpYnV0ZXMubWFwKCAoeyBuYW1lLCB2YWx1ZSB9KSA9PiB7XG4gICAgICAgICAgLy8gaWYgTk8gdmFsdWUsIGFzc3VtZSBpdCdzIGEgdmFyaWFibGUgb2YgdGhlIHNhbWUgbmFtZVxuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB2YWx1ZSA9IG5hbWU7XG4gICAgICAgICAgLy8gaWYgaXQncyBhbiBhcnJheSwgaXQncyBhIHNwZWxsIGV4cHJlc3Npb24sIHBvc3NpYmx5IHdpdGggbmVzdGVkIEpTWCBlbGVtZW50cy4uLlxuICAgICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5qc3hFeHByZXNzaW9uVG9Tb3VyY2UodmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBlbHNlIGlmIGEgSlNYIGVsZW1lbnQsIHJlY3Vyc2VcbiAgICAvL1RPRE86IGluZGVudC4uLlxuICAgICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9Tb3VyY2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGlmIGEgbnVtYmVyIG9yIFRleHQgbGl0ZXJhbCwganVzdCB1c2UgaXRcblxuICAgICAgICAgIC8vIHNwZWNpYWwgY2FzZSBgY2xhc3NgIHRvIGBjbGFzc05hbWVgIGJlY2F1c2UgUmVhY3QgaXMgZWZmaW5nIHBlcnNuaWNrZXR5LlxuICAgICAgICAgIGlmIChuYW1lID09PSBcImNsYXNzXCIpIG5hbWUgPSBcImNsYXNzTmFtZVwiO1xuICAgIC8vVE9ETzogZXNjYXBlIG5hbWVzIHdoaWNoIGFyZSBpbnZhbGlkIEpTIGlkZW50aWZpZXJzXG4gICAgICAgICAgcmV0dXJuIGAke25hbWV9OiAke3ZhbHVlfWA7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBgeyAke2F0dHJzLmpvaW4oXCIsIFwiKX0gfWA7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhbiBhcnJheSB3aXRoIHNvdXJjZSBmb3IgZWFjaCBvZiBvdXIgY2hpbGRyZW4uXG4gICAgICAvLyBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIHdlIGRvbid0IGhhdmUgYW55IGNoaWxkcmVuLlxuICAgICAgY2hpbGRyZW5Ub1NvdXJjZShqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIGxldCBjaGlsZHJlbiA9IGpzeEVsZW1lbnQuY2hpbGRyZW47XG4gICAgICAgIGlmICghY2hpbGRyZW4gfHwgY2hpbGRyZW4ubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcbiAgICAvL1RPRE86IGVzY2FwZSBpbm5lciBxdW90ZXMuLi5cbiAgICAgICAgICBpZiAodHlwZW9mIGNoaWxkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAvL2ZvcmdldCBpdCBpZiB3aGl0ZXNwYWNlIG9ubHkuLi4gPz8/XG4gICAgICAgICAgICBsZXQgdGV4dCA9IGNoaWxkLnRyaW0oKTtcbiAgICAgICAgICAgIGlmICghdGV4dCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJldHVybiBgXCIke3RleHR9XCJgO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBUb2tlbml6ZXIuSlNYRWxlbWVudCkge1xuICAgICAgICAgICAgbGV0IGNoaWxkU291cmNlID0gdGhpcy5qc3hFbGVtZW50VG9Tb3VyY2UoY2hpbGQpO1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkU291cmNlLnNwbGl0KFwiXFxuXCIpLmpvaW4oXCJcXG5cXHRcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIFRva2VuaXplci5KU1hFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5qc3hFeHByZXNzaW9uVG9Tb3VyY2UoY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJjaGlsZHJlblRvU291cmNlKCk6IGRvbid0IHVuZGVyc3RhbmQgY2hpbGRcIiArICBjaGlsZCk7XG4gICAgICAgIH0pXG4gICAgICAgIC8vIHJlbW92ZSB1bmRlZmluZWQvZW1wdHkgc3RyaW5nIHJ1bGVzXG4gICAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgSlNYIGV4cHJlc3Npb24gKCBgey4uLn1gICkgdG8gSlMgc291cmNlLlxuICAgICAganN4RXhwcmVzc2lvblRvU291cmNlKGpzeEV4cHJlc3Npb24pIHtcbiAgICAgICAgbGV0IHRva2VucyA9IGpzeEV4cHJlc3Npb24udG9rZW5zO1xuICAgIGNvbnNvbGUuaW5mbyhqc3hFeHByZXNzaW9uLCB0b2tlbnMpO1xuICAgICAgICByZXR1cm4gXCIvXCIgKyBgKlRPRE86ICR7dG9rZW5zLmpvaW4oXCIgXCIpfSpgICsgXCIvXCI7XG4gICAgICB9XG5cbiAgICAgIGpzeEVsZW1lbnRUb1NvdXJjZShqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIC8vIGdldCB0aGUgYml0cyBvZiB0aGUgb3V0cHV0XG4gICAgICAgIGxldCB0YWdOYW1lID0gYFwiJHtqc3hFbGVtZW50LnRhZ05hbWV9XCJgO1xuICAgICAgICBsZXQgYXR0cnMgPSB0aGlzLmF0dHJzVG9Tb3VyY2UoanN4RWxlbWVudCk7XG4gICAgICAgIGxldCBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW5Ub1NvdXJjZShqc3hFbGVtZW50KTtcblxuICAgICAgICBsZXQgb3V0cHV0ID0gYGNyZWF0ZUVsZW1lbnQoJHt0YWdOYW1lfWA7XG4gICAgICAgIGlmICghYXR0cnMgJiYgY2hpbGRyZW4pIGF0dHJzID0gXCJudWxsXCI7XG5cbiAgICAgICAgaWYgKGF0dHJzKSBvdXRwdXQgKz0gYCwgJHthdHRyc31gO1xuICAgICAgICBpZiAoY2hpbGRyZW4pIHtcbiAgICAgICAgICBvdXRwdXQgKz0gXCIsXFxuXFx0XCIgKyBjaGlsZHJlbi5qb2luKFwiLFxcblxcdFwiKSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0ICs9IFwiKVwiXG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5qc3hFbGVtZW50VG9Tb3VyY2UodGhpcy5tYXRjaGVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvSlNYLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBpZiBzdGF0ZW1lbnRzLlxuLy9cblxuaW1wb3J0IFBhcnNlciwgeyBQYXJzZUVycm9yIH0gZnJvbSBcIi4uLy4uL1BhcnNlclwiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVcIjtcblxuLy8gQ3JlYXRlIFwiaWZcIiBwYXJzZXIuXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTW9kdWxlKFwiaWZcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwiaWZcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiaWYge2NvbmRpdGlvbjpleHByZXNzaW9ufSAodGhlbnw6KT8ge3N0YXRlbWVudH0/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlmXyBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGNvbmRpdGlvbiwgc3RhdGVtZW50cyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYGlmICgke2NvbmRpdGlvbn0pICR7c3RhdGVtZW50c31gO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgc2luZ2xlLWxpbmUgaWYgc3RhdGVtZW50c1wiLFxuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiaWYgYVwiLCBcImlmIChhKSB7fVwiXSxcbiAgICAgICAgICBbXCJpZiBhIHRoZW5cIiwgXCJpZiAoYSkge31cIl0sXG4gICAgICAgICAgW1wiaWYgYTpcIiwgXCJpZiAoYSkge31cIl0sXG4gICAgICAgICAgW1wiaWYgYSB0aGVuIGIgPSAxXCIsIFwiaWYgKGEpIHsgYiA9IDEgfVwiXSxcbiAgICAgICAgICBbXCJpZiBhOiBiID0gMVwiLCBcImlmIChhKSB7IGIgPSAxIH1cIl0sXG4gICAgICAgICAgW1wiaWYgYSA6IGIgPSAxXCIsIFwiaWYgKGEpIHsgYiA9IDEgfVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgbXVsdGktbGluZSBpZiBibG9ja3NcIixcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudHNcIixcbiAgICAgICAgdGVzdHM6IHtcbiAgICAgICAgICBcIlNlcGFyYXRlIGJsb2NrcyBpZiBubyBpbmRlbnRhdGlvbiBvbiBzZWNvbmQgbGluZS5cIjpcbiAgICAgICAgICAgICAgW1wiaWYgYTpcXG5iID0gMVwiLCBcImlmIChhKSB7fVxcbmIgPSAxXCJdLFxuICAgICAgICAgIFwiSW5kZW50IHdpdGggdGFiXCI6XG4gICAgICAgICAgICAgIFtcImlmIGE6XFxuXFx0YiA9IDFcIiwgXCJpZiAoYSkge1xcblxcdGIgPSAxXFxufVwiXSxcbiAgICAgICAgICBcIkFOWSBudW1iZXIgb2Ygc3BhY2VzIHNob3VsZCBjb3VudCBhcyBpbmRlbnRhdGlvblwiOlxuICAgICAgICAgICAgICBbXCJpZiBhOlxcbiBiID0gMVwiLCBcImlmIChhKSB7XFxuXFx0YiA9IDFcXG59XCJdLFxuICAgICAgICAgIFwiTXVsdGlwbGUgbGluZXMgaW4gdGhlIG5lc3RlZCBibG9ja1wiOlxuICAgICAgICAgICAgICBbXCJpZiBhOlxcblxcdGIgPSAxXFxuXFx0YyA9IDJcIiwgXCJpZiAoYSkge1xcblxcdGIgPSAxXFxuXFx0YyA9IDJcXG59XCJdLFxuICAgICAgICAgIFwiTmVzdGVkIGlmcyB3b3JrIGZpbmVcIjpcbiAgICAgICAgICAgICAgW1wiaWYgYVxcblxcdGlmIGJcXG5cXHRcXHRjPTJcIiwgXCJpZiAoYSkge1xcblxcdGlmIChiKSB7XFxuXFx0XFx0YyA9IDJcXG5cXHR9XFxufVwiXSxcbiAgICAgICAgICBcIlByZWZlciBuZXN0ZWQgYmxvY2sgdG8gaW5saW5lZCBzdGF0ZW1lbnRcIjpcbiAgICAgICAgICAgICAgW1wiaWYgYSBiID0gMVxcblxcdGMgPSAyXCIsIFwiaWYgKGEpIHtcXG5cXHRjID0gMlxcbn1cIl0sXG4gICAgICAgIH1cbiAgICAgIH0sXG4vL1RFU1RNRTogdGVzdCBmdWxsIGlmL2Vsc2UgaWYvZWxzZSBibG9ja3NcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIC8vIE5PVEU6IHRoaXMgTVVTVCBiZSBiZWZvcmUgYGVsc2VgIG9yIHRoYXQgd2lsbCBlYXQgYGVsc2UgaWZgIHN0YXRlbWVudHMuLi4gOi0oXG4gICAgbmFtZTogXCJlbHNlX2lmXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIihlbHNlfG90aGVyd2lzZSkgaWYge2NvbmRpdGlvbjpleHByZXNzaW9ufSAodGhlbnw6KSB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZWxzZV9pZiBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGNvbmRpdGlvbiwgc3RhdGVtZW50cyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYGVsc2UgaWYgKCR7Y29uZGl0aW9ufSkgJHtzdGF0ZW1lbnRzfWBcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIHNpbmdsZS1saW5lIGVsc2VfaWYgc3RhdGVtZW50c1wiLFxuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiZWxzZSBpZiBhIHRoZW5cIiwgXCJlbHNlIGlmIChhKSB7fVwiXSxcbiAgICAgICAgICBbXCJlbHNlIGlmIGEgdGhlbiBiID0gMVwiLCBcImVsc2UgaWYgKGEpIHsgYiA9IDEgfVwiXSxcbiAgICAgICAgICBbXCJlbHNlIGlmIGE6IGIgPSAxXCIsIFwiZWxzZSBpZiAoYSkgeyBiID0gMSB9XCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBtdWx0aS1saW5lIGVsc2VfaWYgYmxvY2tzXCIsXG4gICAgICAgIGNvbXBpbGVBczogXCJzdGF0ZW1lbnRzXCIsXG4gICAgICAgIHRlc3RzOiB7XG4gICAgICAgICAgXCJTZXBhcmF0ZSBibG9ja3MgaWYgbm8gaW5kZW50YXRpb24gb24gc2Vjb25kIGxpbmUuXCI6XG4gICAgICAgICAgICAgIFtcImVsc2UgaWYgYTpcXG5iID0gMVwiLCBcImVsc2UgaWYgKGEpIHt9XFxuYiA9IDFcIl0sXG4gICAgICAgICAgXCJJbmRlbnQgd2l0aCB0YWJcIjpcbiAgICAgICAgICAgICAgW1wiZWxzZSBpZiBhOlxcblxcdGIgPSAxXCIsIFwiZWxzZSBpZiAoYSkge1xcblxcdGIgPSAxXFxufVwiXSxcbiAgICAgICAgICBcIkFOWSBudW1iZXIgb2Ygc3BhY2VzIHNob3VsZCBjb3VudCBhcyBpbmRlbnRhdGlvblwiOlxuICAgICAgICAgICAgICBbXCJlbHNlIGlmIGE6XFxuIGIgPSAxXCIsIFwiZWxzZSBpZiAoYSkge1xcblxcdGIgPSAxXFxufVwiXSxcbiAgICAgICAgICBcIk11bHRpcGxlIGxpbmVzIGluIHRoZSBuZXN0ZWQgYmxvY2tcIjpcbiAgICAgICAgICAgICAgW1wiZWxzZSBpZiBhOlxcblxcdGIgPSAxXFxuXFx0YyA9IDJcIiwgXCJlbHNlIGlmIChhKSB7XFxuXFx0YiA9IDFcXG5cXHRjID0gMlxcbn1cIl0sXG4vL0ZJWE1FICAgICAgICAgIFwiTmVzdGVkIGlmcyB3b3JrIGZpbmVcIjpcbi8vICAgICAgICAgICAgW1wiZWxzZSBpZiBhXFxuXFx0aWYgYlxcblxcdFxcdGM9MlwiLCBcImVsc2UgaWYgKGEpIHtcXG5cXHRpZiAoYikge1xcblxcdFxcdGMgPSAyXFxuXFx0fVxcbn1cIl0sXG4vL0ZJWE1FICAgICAgICAgIFwiUHJlZmVyIG5lc3RlZCBibG9jayB0byBpbmxpbmVkIHN0YXRlbWVudFwiOlxuLy8gICAgICAgICAgICBbXCJlbHNlIGlmIGEgYiA9IDFcXG5cXHRjID0gMlwiLCBcImVsc2UgaWYgKGEpIHtcXG5cXHRjID0gMlxcbn1cIl0sXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImVsc2VcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiKGVsc2V8b3RoZXJ3aXNlKSAoOik/IHtzdGF0ZW1lbnR9P1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBlbHNlXyBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHN0YXRlbWVudHMgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBlbHNlICR7c3RhdGVtZW50c31gXG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBzaW5nbGUtbGluZSBlbHNlIHN0YXRlbWVudHNcIixcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImVsc2VcIiwgXCJlbHNlIHt9XCJdLFxuICAgICAgICAgIFtcIm90aGVyd2lzZVwiLCBcImVsc2Uge31cIl0sXG4gICAgICAgICAgW1wiZWxzZSBiID0gMVwiLCBcImVsc2UgeyBiID0gMSB9XCJdLFxuICAgICAgICAgIFtcIm90aGVyd2lzZSBiID0gMVwiLCBcImVsc2UgeyBiID0gMSB9XCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBtdWx0aS1saW5lIGVsc2UgYmxvY2tzXCIsXG4gICAgICAgIGNvbXBpbGVBczogXCJzdGF0ZW1lbnRzXCIsXG4gICAgICAgIHRlc3RzOiB7XG4gICAgICAgICAgXCJTZXBhcmF0ZSBibG9ja3MgaWYgbm8gaW5kZW50YXRpb24gb24gc2Vjb25kIGxpbmUuXCI6XG4gICAgICAgICAgICAgIFtcImVsc2VcXG5iID0gMVwiLCBcImVsc2Uge31cXG5iID0gMVwiXSxcbiAgICAgICAgICBcIkluZGVudCB3aXRoIHRhYlwiOlxuICAgICAgICAgICAgICBbXCJlbHNlXFxuXFx0YiA9IDFcIiwgXCJlbHNlIHtcXG5cXHRiID0gMVxcbn1cIl0sXG4gICAgICAgICAgXCJBTlkgbnVtYmVyIG9mIHNwYWNlcyBzaG91bGQgY291bnQgYXMgaW5kZW50YXRpb25cIjpcbiAgICAgICAgICAgICAgW1wiZWxzZVxcbiBiID0gMVwiLCBcImVsc2Uge1xcblxcdGIgPSAxXFxufVwiXSxcbiAgICAgICAgICBcIk11bHRpcGxlIGxpbmVzIGluIHRoZSBuZXN0ZWQgYmxvY2tcIjpcbiAgICAgICAgICAgICAgW1wiZWxzZVxcblxcdGIgPSAxXFxuXFx0YyA9IDJcIiwgXCJlbHNlIHtcXG5cXHRiID0gMVxcblxcdGMgPSAyXFxufVwiXSxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAgLy8gTk9URTogdGhpcyBpcyBOT1QgYSBibG9ja1N0YXRlbWVudCFcbiAge1xuICAgIG5hbWU6IFwiYmFja3dhcmRzX2lmXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIntzdGF0ZW1lbnR9IGlmIHtjb25kaXRpb246ZXhwcmVzc2lvbn0gKD86KGVsc2V8b3RoZXJ3aXNlKSB7ZWxzZVN0YXRlbWVudDpzdGF0ZW1lbnR9KT9cIixcbiAgICBsZWZ0UmVjdXJzaXZlOiB0cnVlLFxuICAgIHRlc3RSdWxlOiBuZXcgUnVsZS5LZXl3b3Jkcyh7IGxpdGVyYWxzOiBbIFwiaWZcIiBdIH0pLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBiYWNrd2FyZHNfaWYgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBjb25kaXRpb24sIHN0YXRlbWVudCwgZWxzZVN0YXRlbWVudCB9ID0gdGhpcy5yZXN1bHRzO1xuLy9UT0RPOiBzbWFydGVyIHdyYXBwaW5nP1xuICAgICAgICBsZXQgb3V0cHV0ID0gYGlmICgke2NvbmRpdGlvbn0pIHsgJHtzdGF0ZW1lbnR9IH1gO1xuICAgICAgICBpZiAoZWxzZVN0YXRlbWVudCkgb3V0cHV0ICs9IGBcXG5lbHNlIHsgJHtlbHNlU3RhdGVtZW50fSB9YFxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgc2luZ2xlLWxpbmUgYmFja3dhcmRzX2lmIHN0YXRlbWVudHNcIixcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImIgPSAxIGlmIGFcIiwgXCJpZiAoYSkgeyBiID0gMSB9XCJdLFxuICAgICAgICAgIFtcImIgPSAxIGlmIGEgZWxzZSBiID0gMlwiLCBcImlmIChhKSB7IGIgPSAxIH1cXG5lbHNlIHsgYiA9IDIgfVwiXSxcbiAgICAgICAgICBbXCJiID0gMSBpZiBhIG90aGVyd2lzZSBiID0gMlwiLCBcImlmIChhKSB7IGIgPSAxIH1cXG5lbHNlIHsgYiA9IDIgfVwiXSxcbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfSxcbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvaWYuanMiLCIvL1xuLy9cdCMgUnVsZXMgZm9yIGRlYWxpbmcgd2l0aCBsaXN0c1xuLy9cblxuLy8gVE9ETzogY29uZmlybSBpZGVudGlmaWVycyBhcmUgcGx1cmFsIGluIHNvbWUgb2YgdGhlIGJlbG93P1xuLy8gVE9ETzogYGxpc3QuY2xvbmUoKWAgdG8gcmV0dXJuIG5ldyBsaXN0IG9mIHNhbWUgdHlwZS5cblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG5pbXBvcnQgeyBpc1BsdXJhbCwgc2luZ3VsYXJpemUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc3RyaW5nXCI7XG5cbi8vIENyZWF0ZSBcImxpc3RzXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck1vZHVsZShcImxpc3RzXCIpO1xuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG5cbi8vIFdPUktJTkcgRlJPTSBPVEhFUiBSVUxFUyAodGVzdG1lKVxuLy9cdGB0aGUgbGVuZ3RoIG9mIDxsaXN0PmBcbi8vXHRgPHRoaW5nPiBpcyBub3Q/IGluIDxsaXN0PmBcbi8vXHRgPGxpc3Q+IGlzIG5vdD8gZW1wdHlgXG4vL1x0YHNldCBpdGVtIDEgb2YgbXlMaXN0IHRvICdhJ2BcblxuXG4vLyBUT0RPOiBcdGBjcmVhdGUgbGlzdCB3aXRoIDxleHA+LCA8ZXhwPiwgPGV4cD5gXG4vLyBUT0RPOlx0YGR1cGxpY2F0ZSBsaXN0YFxuLy8gVE9ETzpcdGBkdXBsaWNhdGUgbGlzdCB3aXRoIDxleHA+LCA8ZXhwPiwgPGV4cD5gID8/P1xuLy8gVE9ETzpcdGB0aGUgc2l6ZSBvZiA8bGlzdD5gID0+IHdpbGwgbWFwIHRvIGBsaXN0LnNpemVgLi4uXG4vL1x0XHRcdFx0LSBpbnN0YWxsIGBzaXplYCBhcyBhbiBhbGlhcyB0byBgbGVuZ3RoYD9cbi8vIFRPRE86XHRgbW92ZSA8dGhpbmc+IHRvIGVuZCBvZiA8bGlzdD5gID8/P1xuLy8gVE9ETzpcdGBTZXRgIGZvciBhIHVuaXF1ZSBsaXN0P1xuLy8gVE9ETzpcdHR5cGVkIGxpc3Q/XG4vLyBUT0RPOlx0bGlzdCB3aGljaCB3b24ndCB0YWtlIG51bGwvdW5kZWZpbmVkXG5cblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICAvLyBSZXR1cm4gdGhlIGxlbmd0aCBvZiBhIGxpc3QuXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfbGVuZ3RoXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ0aGU/IG51bWJlciBvZiB7aWRlbnRpZmllcn0gaW4ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9sZW5ndGggZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBsaXN0LCBpZGVudGlmaWVyIH0gPSB0aGlzLnJlc3VsdHM7XG4gIC8vIFRPRE86IHNwZWNpYWwgY2FzZSAnd29yZHMnLCAnbGluZXMnLCBldGNcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5sZW5ndGhPZigke2xpc3R9KWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIm51bWJlciBvZiBpdGVtcyBpbiBteUxpc3RcIiwgXCJzcGVsbC5sZW5ndGhPZihteUxpc3QpXCJdLFxuICAgICAgICAgIFtcInRoZSBudW1iZXIgb2YgZm9vcyBpbiB0aGUgZm9vIG9mIHRoZSBiYXJcIiwgXCJzcGVsbC5sZW5ndGhPZihiYXIuZm9vKVwiXSxcbiAgICAgICAgICBbXCJ0aGUgbnVtYmVyIG9mIGl0ZW1zIGluIFsxLDIsM11cIiwgXCJzcGVsbC5sZW5ndGhPZihbMSwgMiwgM10pXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cblxuICB9LFxuXG4gIC8vIFJldHVybiB0aGUgZmlyc3QgcG9zaXRpb24gb2Ygc3BlY2lmaWVkIGl0ZW0gaW4gdGhlIGxpc3QgYXMgYW4gYXJyYXkuXG4gIC8vIElmIGl0ZW0gaXMgbm90IGZvdW5kLCByZXR1cm5zIGB1bmRlZmluZWRgLlxuICAvLyBOT1RFOiB0aGlzIHBvc2l0aW9uIHJldHVybmVkIGlzICoqMS1iYXNlZCoqLlxuICAvLyBUT0RPOiBgcG9zaXRpb25zYCwgYGxhc3QgcG9zaXRpb25gLCBgYWZ0ZXIuLi5gXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcG9zaXRpb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcInRoZT8gcG9zaXRpb24gb2Yge3RoaW5nOmV4cHJlc3Npb259IGluIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcG9zaXRpb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnBvc2l0aW9uT2YoJHt0aGluZ30sICR7bGlzdH0pYFxuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJwb3NpdGlvbiBvZiB0aGluZyBpbiBteUxpc3RcIiwgXCJzcGVsbC5wb3NpdGlvbk9mKHRoaW5nLCBteUxpc3QpXCJdLFxuICAgICAgICAgIFtcInRoZSBwb3NpdGlvbiBvZiB0aGluZyBpbiB0aGUgZm9vIG9mIHRoZSBiYXJcIiwgXCJzcGVsbC5wb3NpdGlvbk9mKHRoaW5nLCBiYXIuZm9vKVwiXSxcbiAgICAgICAgICBbXCJ0aGUgcG9zaXRpb24gb2YgJ2EnIGluIFsnYScsICdiJywgJ2MnXVwiLCBcInNwZWxsLnBvc2l0aW9uT2YoJ2EnLCBbJ2EnLCAnYicsICdjJ10pXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cblxuICB9LFxuXG4gIC8vXG4gIC8vXHRPcmRpbmFsIG51bWJlcnMgKGZpcnN0LCBzZWNvbmQsIGxhc3QsIGV0YykuXG4gIC8vIFRPRE86IHNpeHR5LWZpZnRoLCB0d28gaHVuZHJlZCBmb3J0eSBuaW50aC4uLiB3aXRoIGN1c3RvbSBwYXJzZXI/XG4gIC8vXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuQWx0ZXJuYXRpdmVzIHt9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiZmlyc3RcIiwgMV0sXG4gICAgICAgICAgW1wic2Vjb25kXCIsIDJdLFxuICAgICAgICAgIFtcInRoaXJkXCIsIDNdLFxuICAgICAgICAgIFtcImZvdXJ0aFwiLCA0XSxcbiAgICAgICAgICBbXCJmaWZ0aFwiLCA1XSxcbiAgICAgICAgICBbXCJzaXh0aFwiLCA2XSxcbiAgICAgICAgICBbXCJzZXZlbnRoXCIsIDddLFxuICAgICAgICAgIFtcImVpZ2h0aFwiLCA4XSxcbiAgICAgICAgICBbXCJuaW50aFwiLCA5XSxcbiAgICAgICAgICBbXCJ0ZW50aFwiLCAxMF0sXG5cbiAgICAgICAgICBbXCJwZW51bHRpbWF0ZVwiLCAtMl0sXG4gICAgICAgICAgW1wiZmluYWxcIiwgLTFdLFxuICAgICAgICAgIFtcImxhc3RcIiwgLTFdLFxuXG4gICAgICAgICAgW1widG9wXCIsIDFdLFxuICAgICAgICAgIFtcImJvdHRvbVwiLCAtMV0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiZmlyc3RcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbF9maXJzdCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDEgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInNlY29uZFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsX3NlY29uZCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDIgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInRoaXJkXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWxfdGhpcmQgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAzIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJmb3VydGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbF9mb3VydGggZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiA0IH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJmaWZ0aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsX2ZpZnRoIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gNSB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwic2l4dGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbF9zaXh0aCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDYgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInNldmVudGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbF9zZXZlbnRoIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gNyB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiZWlnaHRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWxfZWlnaHRoIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gOCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwibmludGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbF9uaW50aCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDkgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInRlbnRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWxfdGVudGggZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAxMCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwicGVudWx0aW1hdGVcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbF9wZW51bHRpbWF0ZSBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIC0yIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJmaW5hbFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsX2ZpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gLTEgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImxhc3RcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbF9sYXN0IGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gLTEgfVxuICAgIH1cbiAgfSxcblxuXG5cbiAgLy8gdHJlYXQgbGlzdCBhcyBhIHN0YWNrIG9yIHF1ZXVlXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwidG9wXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWxfdG9wIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gMSB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiYm90dG9tXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWxfYm90dG9tIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gLTEgfVxuICAgIH1cbiAgfSxcblxuXG5cbiAgLy8gSW5kZXggZXhwcmVzc2lvbjogbnVtZXJpYyBwb3NpdGlvbiBpbiBzb21lIGxpc3QuXG4gIC8vXHRlLmcuXHRgY2FyZCAxIG9mIHRoZSBwaWxlYFxuICAvL1x0XHRcdGBjYXJkICMyIG9mIHRoZSBwaWxlYFxuICAvL1x0XHRcdGB0aGUgZmlyc3QgY2FyZCBvZiB0aGUgcGlsZWBcbiAgLy9cbiAgLy8gTk9URTogTmVnYXRpdmUgbnVtZXJpYyBwb3NpdGlvbnMgY29tZSBmcm9tIHRoZSBFTkQgb2YgdGhlIGxpc3QuXG4gIC8vXHRlLmcuXHRgY2FyZCAtMSBvZiB0aGUgcGlsZWBcbiAgLy9cbiAgLy8gTk9URTogT3VyIHBvc2l0aW9ucyBhcmUgKioxLWJhc2VkKiogYW5kIEphdmFzY3JpcHQgaXMgKiowLWJhc2VkKiouXG4gIC8vXHRcdCBlLmcuIGBpdGVtIDEgb2YgdGhlIGFycmF5YCAgPSBgYXJyYXlbMF1gXG4gIHtcbiAgICBuYW1lOiBcInBvc2l0aW9uX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBbXG4gICAgICBcIntpZGVudGlmaWVyfSB7cG9zaXRpb246ZXhwcmVzc2lvbn0gb2Yge2V4cHJlc3Npb259XCIsXG4gICAgICBcInRoZSB7cG9zaXRpb246b3JkaW5hbH0ge2lkZW50aWZpZXJ9IChpbnxvZikge2V4cHJlc3Npb259XCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBwb3NpdGlvbl9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZXtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyLCBwb3NpdGlvbiwgb3JkaW5hbCwgZXhwcmVzc2lvbiB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldEl0ZW0oJHtleHByZXNzaW9ufSwgJHtwb3NpdGlvbn0sICcke2lkZW50aWZpZXJ9JylgO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJpdGVtIDEgb2YgbXktbGlzdFwiLCBcInNwZWxsLmdldEl0ZW0obXlfbGlzdCwgMSwgJ2l0ZW0nKVwiXSxcbiAgICAgICAgICBbXCJjYXJkIDEwIG9mIGRlY2tcIiwgXCJzcGVsbC5nZXRJdGVtKGRlY2ssIDEwLCAnY2FyZCcpXCJdLFxuICAgICAgICAgIFtcImZvbyBuIG9mIHRoZSBmb29zIG9mIHRoZSBiYXJcIiwgXCJzcGVsbC5nZXRJdGVtKGJhci5mb29zLCBuLCAnZm9vJylcIl0sXG5cbiAgICAgICAgICBbXCJ0aGUgZmlyc3QgaXRlbSBvZiBteS1saXN0XCIsIFwic3BlbGwuZ2V0SXRlbShteV9saXN0LCAxLCAnaXRlbScpXCJdLFxuICAgICAgICAgIFtcInRoZSB0ZW50aCBjYXJkIG9mIGRlY2tcIiwgXCJzcGVsbC5nZXRJdGVtKGRlY2ssIDEwLCAnY2FyZCcpXCJdLFxuICAgICAgICAgIFtcInRoZSBwZW51bHRpbWF0ZSB3b3JkIGluIHdvcmRzXCIsIFwic3BlbGwuZ2V0SXRlbSh3b3JkcywgLTIsICd3b3JkJylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuXG4gIH0sXG5cblxuICAvLyBQaWNrIGEgU0lOR0xFIHJhbmRvbSBpdGVtIGZyb20gdGhlIGxpc3QuXG4gIC8vIFRPRE86IGNvbmZpcm0gaWRlbnRpZmllciBpcyBwbHVyYWw/XG4gIHtcbiAgICBuYW1lOiBcInJhbmRvbV9wb3NpdGlvbl9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJhIHJhbmRvbSB7aWRlbnRpZmllcn0gKG9mfGZyb218aW4pIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJhbmRvbV9wb3NpdGlvbl9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCwgaWRlbnRpZmllciB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldFJhbmRvbUl0ZW1PZigke2xpc3R9LCAnJHtpZGVudGlmaWVyfScpYDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSByYW5kb20gaXRlbSBvZiBteS1saXN0XCIsIFwic3BlbGwuZ2V0UmFuZG9tSXRlbU9mKG15X2xpc3QsICdpdGVtJylcIl0sXG4gICAgICAgICAgW1wiYSByYW5kb20gd29yZCBpbiAnc29tZSB3b3JkcydcIiwgXCJzcGVsbC5nZXRSYW5kb21JdGVtT2YoJ3NvbWUgd29yZHMnLCAnd29yZCcpXCJdLFxuICAgICAgICAgIFtcImEgcmFuZG9tIGNhcmQgZnJvbSBkZWNrXCIsIFwic3BlbGwuZ2V0UmFuZG9tSXRlbU9mKGRlY2ssICdjYXJkJylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuXG4gIH0sXG5cbiAgLy8gUGljayBhIHVuaXF1ZSBzZXQgb2YgcmFuZG9tIGl0ZW1zIGZyb20gdGhlIGxpc3QsIHJldHVybmluZyBhbiBhcnJheS5cbiAgLy8gVE9ETzogYHR3byByYW5kb20gaXRlbXMuLi5gXG4gIC8vIFRPRE86IGNvbmZpcm0gaWRlbnRpZmllciBpcyBwbHVyYWw/XG4gIC8vIFRPRE86IGBsaXN0LmNsb25lKClgIHRvIHJldHVybiBuZXcgbGlzdCBvZiBzYW1lIHR5cGUuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcInJhbmRvbV9wb3NpdGlvbnNfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie251bWJlcn0gcmFuZG9tIHtpZGVudGlmaWVyfSAob2Z8ZnJvbXxpbikge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZG9tX3Bvc2l0aW9uc19leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbnVtYmVyLCBsaXN0LCBpZGVudGlmaWVyIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0UmFuZG9tSXRlbXNPZigke2xpc3R9LCAke251bWJlcn0sICcke2lkZW50aWZpZXJ9JylgO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCIyIHJhbmRvbSBpdGVtcyBvZiBteS1saXN0XCIsIFwic3BlbGwuZ2V0UmFuZG9tSXRlbXNPZihteV9saXN0LCAyLCAnaXRlbXMnKVwiXSxcbiAgICAgICAgICBbXCIyIHJhbmRvbSB3b3JkcyBpbiAnc29tZSBvdGhlciB3b3JkcydcIiwgXCJzcGVsbC5nZXRSYW5kb21JdGVtc09mKCdzb21lIG90aGVyIHdvcmRzJywgMiwgJ3dvcmRzJylcIl0sXG4gICAgICAgICAgW1wiMyByYW5kb20gY2FyZHMgZnJvbSBkZWNrXCIsIFwic3BlbGwuZ2V0UmFuZG9tSXRlbXNPZihkZWNrLCAzLCAnY2FyZHMnKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cblxuICAvLyBSYW5nZSBleHByZXNzaW9uLlxuICAvLyBSZXR1cm5zIGEgbmV3IGxpc3QuXG4gIC8vIE5PVEU6IGBzdGFydGAgaXMgKioxLWJhc2VkKiouXG4gIC8vIE5PVEU6IGBlbmRgIGlzIGluY2x1c2l2ZSFcbiAge1xuICAgIG5hbWU6IFwicmFuZ2VfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2lkZW50aWZpZXJ9IHtzdGFydDpleHByZXNzaW9ufSB0byB7ZW5kOmV4cHJlc3Npb259IChvZnxpbnxmcm9tKSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5nZV9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCwgc3RhcnQsIGVuZCwgaWRlbnRpZmllciB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldFJhbmdlKCR7bGlzdH0sICR7c3RhcnR9LCAke2VuZH0sICcke2lkZW50aWZpZXJ9JylgO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJpdGVtIDEgdG8gMiBvZiBteS1saXN0XCIsIFwic3BlbGwuZ2V0UmFuZ2UobXlfbGlzdCwgMSwgMiwgJ2l0ZW0nKVwiXSxcbiAgICAgICAgICBbXCJ3b3JkIDIgdG8gMyBpbiAnc29tZSBvdGhlciB3b3JkcydcIiwgXCJzcGVsbC5nZXRSYW5nZSgnc29tZSBvdGhlciB3b3JkcycsIDIsIDMsICd3b3JkJylcIl0sXG4gICAgICAgICAgW1wiY2FyZCAxIHRvIDMgZnJvbSBkZWNrXCIsIFwic3BlbGwuZ2V0UmFuZ2UoZGVjaywgMSwgMywgJ2NhcmQnKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAgLy8gQWx0ZXJuYXRpdmUgZm9ybSBvZiByYW5nZSBleHByZXNzaW9uLlxuICAvLyBSZXR1cm5zIGEgbmV3IGxpc3QuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxfcmFuZ2VfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie29yZGluYWx9IHtudW1iZXJ9IHtpZGVudGlmaWVyfSAob2Z8aW58ZnJvbSkge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbF9yYW5nZV9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgb3JkaW5hbCwgbnVtYmVyLCBsaXN0LCBpZGVudGlmaWVyIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuc2xpY2UoJHtsaXN0fSwgJHtvcmRpbmFsfSwgJHtudW1iZXJ9LCAnJHtpZGVudGlmaWVyfScpYDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1widG9wIDIgaXRlbXMgb2YgbXktbGlzdFwiLCBcInNwZWxsLnNsaWNlKG15X2xpc3QsIDEsIDIsICdpdGVtcycpXCJdLFxuICAgICAgICAgIFtcImZpcnN0IDIgd29yZHMgaW4gJ3NvbWUgb3RoZXIgd29yZHMnXCIsIFwic3BlbGwuc2xpY2UoJ3NvbWUgb3RoZXIgd29yZHMnLCAxLCAyLCAnd29yZHMnKVwiXSxcbiAgICAgICAgICBbXCJsYXN0IHR3byBjYXJkcyBmcm9tIGRlY2tcIiwgXCJzcGVsbC5zbGljZShkZWNrLCAtMSwgMiwgJ2NhcmRzJylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIC8vIFJhbmdlIGV4cHJlc3Npb24gc3RhcnRpbmcgYXQgc29tZSBpdGVtIGluIHRoZSBsaXN0LlxuICAvLyBSZXR1cm5zIGEgbmV3IGxpc3QuXG4gIC8vIElmIGl0ZW0gaXMgbm90IGZvdW5kLCByZXR1cm5zIGFuIGVtcHR5IGxpc3QuICg/Pz8pXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcInJhbmdlX2V4cHJlc3Npb25fc3RhcnRpbmdfd2l0aFwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2lkZW50aWZpZXJ9IChpbnxvZikge2xpc3Q6ZXhwcmVzc2lvbn0gc3RhcnRpbmcgd2l0aCB7dGhpbmc6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbl9zdGFydGluZ193aXRoIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIGxpc3QsIGlkZW50aWZpZXIgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5nZSgke2xpc3R9LCBzcGVsbC5wb3NpdGlvbk9mKCR7dGhpbmd9LCAke2xpc3R9KSwgdW5kZWZpbmVkLCAnJHtpZGVudGlmaWVyfScpYDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiaXRlbXMgaW4gbXktbGlzdCBzdGFydGluZyB3aXRoIGl0XCIsXG4gICAgICAgICAgIFwic3BlbGwuZ2V0UmFuZ2UobXlfbGlzdCwgc3BlbGwucG9zaXRpb25PZihpdCwgbXlfbGlzdCksIHVuZGVmaW5lZCwgJ2l0ZW1zJylcIl0sXG4gICAgICAgICAgW1wid29yZHMgaW4gJ3NvbWUgd29yZHMnIHN0YXJ0aW5nIHdpdGggJ3NvbWUnXCIsXG4gICAgICAgICAgIFwic3BlbGwuZ2V0UmFuZ2UoJ3NvbWUgd29yZHMnLCBzcGVsbC5wb3NpdGlvbk9mKCdzb21lJywgJ3NvbWUgd29yZHMnKSwgdW5kZWZpbmVkLCAnd29yZHMnKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG5cbiAgfSxcblxuXG4gIC8vIExpc3QgZmlsdGVyLlxuICAvLyBOT1RFOiB3ZSB3aWxsIHNpbmd1bGFyaXplIGBpZGVudGlmaWVyYCBhbmQgdXNlIHRoYXQgYXMgdGhlIGFyZ3VtZW50IHRvIGBleHByZXNzaW9uYC5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9maWx0ZXJcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIntpZGVudGlmaWVyfSAoaW58b2YpIHtsaXN0OmV4cHJlc3Npb259IHdoZXJlIHtjb25kaXRpb246ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9maWx0ZXIgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyLCBjb25kaXRpb24sIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgLy8gdXNlIHNpbmd1bGFyIG9mIGlkZW50aWZpZXIgZm9yIG1ldGhvZCBhcmd1bWVudFxuICAgICAgICBsZXQgYXJndW1lbnQgPSBzaW5ndWxhcml6ZShpZGVudGlmaWVyKTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5maWx0ZXIoJHtsaXN0fSwgJHthcmd1bWVudH0gPT4gJHtjb25kaXRpb259LCAnJHtpZGVudGlmaWVyfScpYDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHNob3dBbGw6IHRydWUsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiaXRlbXMgaW4gbXktbGlzdCB3aGVyZSB0aGUgaWQgb2YgdGhlIGl0ZW0gPiAxXCIsIFwic3BlbGwuZmlsdGVyKG15X2xpc3QsIGl0ZW0gPT4gaXRlbS5pZCA+IDEsICdpdGVtcycpXCJdLFxuICAgICAgICAgIFtcIlwiLCBcIlwiXSxcbiAgICAgICAgICBbXCJcIiwgXCJcIl0sXG4gICAgICAgICAgW1wiXCIsIFwiXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cblxuICB9LFxuXG5cbiAgLy8gU2V0IG1lbWJlcnNoaXAgKGxlZnQgcmVjdXJzaXZlKS5cbiAgLy8gTk9URTogd2Ugd2lsbCBzaW5ndWxhcml6ZSBgaWRlbnRpZmllcmAgYW5kIHVzZSB0aGF0IGFzIHRoZSBhcmd1bWVudCB0byBgZXhwcmVzc2lvbmAuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfbWVtYmVyc2hpcF90ZXN0XCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7bGlzdDpleHByZXNzaW9ufSAob3BlcmF0b3I6aGFzfGhhcyBub3xkb2VzbnQgaGF2ZXxkb2VzIG5vdCBoYXZlKSB7aWRlbnRpZmllcn0gd2hlcmUge2ZpbHRlcjpleHByZXNzaW9ufVwiLFxuICAgIGxlZnRSZWN1cnNpdmU6IHRydWUsXG4gICAgdGVzdFJ1bGU6IG5ldyBSdWxlLktleXdvcmRzKHsgbWF0Y2g6IFwid2hlcmVcIiB9KSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9tZW1iZXJzaGlwX3Rlc3QgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyLCBvcGVyYXRvciwgZmlsdGVyLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIGxldCBiYW5nID0gb3BlcmF0b3IgPT09IFwiaGFzXCIgPyBcIlwiIDogXCIhXCI7XG4gICAgICAgIC8vIHVzZSBzaW5ndWxhciBvZiBpZGVudGlmaWVyIGZvciBtZXRob2QgYXJndW1lbnRcbiAgICAgICAgbGV0IGFyZ3VtZW50ID0gc2luZ3VsYXJpemUoaWRlbnRpZmllci50b1NvdXJjZSgpKTtcbiAgICAgICAgcmV0dXJuIGAke2Jhbmd9c3BlbGwuYW55KCR7bGlzdH0sICR7YXJndW1lbnR9ID0+ICR7ZmlsdGVyfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvL1xuICAvL1x0QWRkaW5nIHRvIGxpc3QgKGluLXBsYWNlKVxuICAvL1xuXG4gIC8vIEFkZCB0byBlbmQgb2YgbGlzdC5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9hcHBlbmRcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiYXBwZW5kIHt0aGluZzpleHByZXNzaW9ufSB0byB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgICAgXCJhZGQge3RoaW5nOmV4cHJlc3Npb259IHRvICgodGhlPykgZW5kIG9mKT8ge2xpc3Q6ZXhwcmVzc2lvbn1cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfYXBwZW5kIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5hcHBlbmQoJHtsaXN0fSwgJHt0aGluZ30pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gQWRkIHRvIGJlZ2lubmluZyBvZiBsaXN0LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3ByZXBlbmRcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFtcbiAgICAgIFwicHJlcGVuZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwiYWRkIHt0aGluZzpleHByZXNzaW9ufSB0byB0aGUgKHN0YXJ0fGZyb250fHRvcCkgb2Yge2xpc3Q6ZXhwcmVzc2lvbn1cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcHJlcGVuZCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwucHJlcGVuZCgke2xpc3R9LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBBZGQgdG8gbWlkZGxlIG9mIGxpc3QsIHB1c2hpbmcgZXhpc3RpbmcgaXRlbXMgb3V0IG9mIHRoZSB3YXkuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfYWRkX2F0XCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn0gYXQgcG9zaXRpb24ge3Bvc2l0aW9uOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3Rfc3BsaWNlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIHBvc2l0aW9uLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuc3BsaWNlKCR7bGlzdH0sICR7cG9zaXRpb259LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFRPRE86ICBcdFwiYWRkIHt0aGluZzpleHByZXNzaW9ufSB0byB7bGlzdDpleHByZXNzaW9ufSBiZWZvcmUge2l0ZW06ZXhwcmVzc2lvbn1cIixcblxuICAvLyBBZGQgdG8gbWlkZGxlIG9mIGxpc3QsIHB1c2hpbmcgZXhpc3RpbmcgaXRlbXMgb3V0IG9mIHRoZSB3YXkuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfYWRkX2FmdGVyXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn0gYWZ0ZXIge2l0ZW06ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9hZGRfYWZ0ZXIgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgaXRlbSwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnNwbGljZSgke2xpc3R9LCBzcGVsbC5wb3NpdGlvbk9mKCR7bGlzdH0sICR7aXRlbX0pLCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvL1xuICAvL1x0UmVtb3ZpbmcgZnJvbSBsaXN0IChpbi1wbGFjZSlcbiAgLy9cblxuICAvLyBFbXB0eSBsaXN0LlxuICAvL1RPRE86IG1ha2UgYGVtcHR5YCBhbmQvb3IgYGNsZWFyYCBhIGdlbmVyaWMgc3RhdGVtZW50Pz8/XG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfZW1wdHlcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiKGVtcHR5fGNsZWFyKSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X2VtcHR5IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmNsZWFyKCR7bGlzdH0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gUmVtb3ZlIG9uZSBpdGVtIGZyb20gbGlzdCBieSBwb3NpdGlvbi5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9yZW1vdmVfcG9zaXRpb25cIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwicmVtb3ZlIHtpZGVudGlmaWVyfSB7bnVtYmVyOmV4cHJlc3Npb259IG9mIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcmVtb3ZlX3Bvc2l0aW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbnVtYmVyLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwucmVtb3ZlSXRlbSgke2xpc3R9LCAke251bWJlcn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gUmVtb3ZlIHJhbmdlIG9mIHRoaW5ncyBmcm9tIGxpc3QuXG4gIC8vIE5PVEU6IGBzdGFydGAgaXMgKioxLWJhc2VkKiouXG4gIC8vIE5PVEU6IGBlbmRgIGlzIGluY2x1c2l2ZSFcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9yZW1vdmVfcmFuZ2VcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwicmVtb3ZlIHtpZGVudGlmaWVyfSB7c3RhcnQ6ZXhwcmVzc2lvbn0gdG8ge2VuZDpleHByZXNzaW9ufSBvZiB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3JlbW92ZV9wb3NpdGlvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHN0YXJ0LCBlbmQsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5yZW1vdmVSYW5nZSgke2xpc3R9LCAke3N0YXJ0fSwgJHtlbmR9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gUmVtb3ZlIGFsbCBpbnN0YW5jZXMgb2Ygc29tZXRoaW5nIGZyb20gYSBsaXN0LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3JlbW92ZVwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJyZW1vdmUge3RoaW5nOmV4cHJlc3Npb259IGZyb20ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9yZW1vdmUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnJlbW92ZSgke2xpc3R9LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBSZW1vdmUgYWxsIGl0ZW1zIGZyb20gbGlzdCB3aGVyZSBjb25kaXRpb24gaXMgdHJ1ZS5cbiAgLy8gTk9URTogd2Ugd2lsbCBzaW5ndWxhcml6ZSBgaWRlbnRpZmllcmAgYW5kIHVzZSB0aGF0IGFzIHRoZSBhcmd1bWVudCB0byBgZXhwcmVzc2lvbmAuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcmVtb3ZlX3doZXJlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJlbW92ZSB7aWRlbnRpZmllcn0gKGlufG9mfGZyb20pIHtsaXN0OmV4cHJlc3Npb259IHdoZXJlIHtjb25kaXRpb246ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9yZW1vdmVfd2hlcmUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyLCBjb25kaXRpb24sIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgLy8gdXNlIHNpbmd1bGFyIG9mIGlkZW50aWZpZXIgZm9yIG1ldGhvZCBhcmd1bWVudFxuICAgICAgICBsZXQgYXJndW1lbnQgPSBzaW5ndWxhcml6ZShpZGVudGlmaWVyLnRvU291cmNlKCkpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnJlbW92ZVdoZXJlKCR7bGlzdH0sICR7YXJndW1lbnR9ID0+ICR7Y29uZGl0aW9ufSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vXG4gIC8vXHRSYW5kb20gKGluLXBsYWNlKSBsaXN0IG1hbmlwdWxhdGlvbi5cbiAgLy9cblxuICAvLyBSZXZlcnNlIGxpc3QgaW4tcGxhY2UuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcmV2ZXJzZVwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJyZXZlcnNlIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcmV2ZXJzZSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5yZXZlcnNlKCR7bGlzdH0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gU2h1ZmZsZSBsaXN0IGluLXBsYWNlLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3NodWZmbGVcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiKHJhbmRvbWl6ZXxzaHVmZmxlKSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3NodWZmbGUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuc2h1ZmZsZSgke2xpc3R9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gSXRlcmF0aW9uXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfaXRlcmF0aW9uXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImZvciAoZWFjaCk/IHtpdGVtVmFyOmlkZW50aWZpZXJ9IGluIHtsaXN0OmV4cHJlc3Npb259Oj8ge3N0YXRlbWVudH0/XCIsXG4gICAgICBcImZvciAoZWFjaCk/IHtpdGVtVmFyOmlkZW50aWZpZXJ9IChhbmR8LCkge3Bvc2l0aW9uVmFyOmlkZW50aWZpZXJ9IGluIHtsaXN0OmV4cHJlc3Npb259Oj8ge3N0YXRlbWVudH0/XCIsXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9pdGVyYXRpb24gZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpdGVtVmFyLCBwb3NpdGlvblZhciwgbGlzdCwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBsZXQgb3V0cHV0O1xuICAgICAgICBpZiAocG9zaXRpb25WYXIpIHtcbiAgICAgICAgICBvdXRwdXQgPSBgZm9yIChsZXQgJHtwb3NpdGlvblZhcn0gPSAxLCBiYXI7ICR7aXRlbVZhcn0gPSAke2xpc3R9WyR7cG9zaXRpb25WYXJ9LTFdLCAke3Bvc2l0aW9uVmFyfSA8PSAke2xpc3R9Lmxlbmd0aDsgJHtwb3NpdGlvblZhcn0rKykgYFxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIE5PVEU6IHRoaXMgaXMgcmVsYXRpdmVseSBzbG93Li4uICBwcm9iYWJseSBkb2Vzbid0IG1hdHRlci4uLlxuICAgICAgICAgIG91dHB1dCA9IGBmb3IgKGxldCAke2l0ZW1WYXJ9IG9mICR7bGlzdH0pIGA7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0ICs9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoc3RhdGVtZW50LCBibG9jayk7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gUmFuZ2VcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmFuZ2VfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwicmFuZ2Uge3N0YXJ0OmV4cHJlc3Npb259IHRvIHtlbmQ6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHN0YXJ0LCBlbmQgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5nZSgke3N0YXJ0fSwgJHtlbmR9KWA7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL2xpc3RzLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBpbmZpeCBhbmQgcHJlZml4IG9wZXJhdG9ycy5cbi8vXG5cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4uLy4uL1BhcnNlclwiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVcIjtcblxuLy8gQ3JlYXRlIFwib3BlcmF0b3JzXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck1vZHVsZShcIm9wZXJhdG9yc1wiKTtcbmV4cG9ydCBkZWZhdWx0IHBhcnNlcjtcblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICAvLyBUT0RPOlxuICAvLyBcdC8vIEZpbmQgYmVzdCBtYXRjaCBhY2NvcmRpbmcgdG8gb3BlcmF0b3IgcHJlY2VkZW5jZSBhcyBkZWZpbmVkIGJlbG93LlxuICAvLyBcdGdldEJlc3RNYXRjaChtYXRjaGVzKSB7XG4gIC8vIFx0XHRjb25zb2xlLndhcm4oXCJHQk1cIiwgbWF0Y2hlcywgbWF0Y2hlcy5tYXAobWF0Y2ggPT4gbWF0Y2gucHJlY2VkZW5jZSksIG1hdGNoZXMubWFwKG1hdGNoID0+IG1hdGNoLm1hdGNoZWRUZXh0KSk7XG4gIC8vIFx0XHRyZXR1cm4gbWF0Y2hlcy5yZWR1Y2UoZnVuY3Rpb24gKGJlc3QsIG5leHQpIHtcbiAgLy8gXHRcdFx0Ly8gdGFrZSBoaWdoZXN0IHByZWNlZGVuY2UgbWF0Y2ggZmlyc3RcbiAgLy8gXHRcdFx0aWYgKG5leHQucHJlY2VkZW5jZSA+IGJlc3QucHJlY2VkZW5jZSkgcmV0dXJuIG5leHQ7XG4gIC8vIFx0XHRcdC8vIHRha2UgbG9uZ2VzdCBtYXRjaCBpZiBzYW1lIHByZWNlZGVuY2VcbiAgLy8gXHRcdFx0aWYgKG5leHQucHJlY2VkZW5jZSA9PT0gYmVzdC5wcmVjZWRlbmNlKSB7XG4gIC8vIFx0XHRcdFx0aWYgKG5leHQuZW5kSW5kZXggPiBiZXN0LmVuZEluZGV4KSByZXR1cm4gbmV4dDtcbiAgLy8gXHRcdFx0fVxuICAvLyBcdFx0XHRyZXR1cm4gYmVzdDtcbiAgLy8gXHRcdH0sIG1hdGNoZXNbMF0pO1xuICAvLyBcdH1cblxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIntsaHM6ZXhwcmVzc2lvbn0ge29wZXJhdG9yOmluZml4X29wZXJhdG9yfSB7cmhzOmV4cHJlc3Npb259XCIsXG4gICAgbGVmdFJlY3Vyc2l2ZTogdHJ1ZSxcbiAgICB0ZXN0UnVsZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpbmZpeF9vcGVyYXRvcl9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGhzLCByaHMsIF9vcGVyYXRvciB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gX29wZXJhdG9yLmFwcGx5T3BlcmF0b3IobGhzLCByaHMpO1xuICAgICAgfVxuXG4gICAgICBnZXQgcHJlY2VkZW5jZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1hdGNoZWQpIHRocm93IG5ldyBTeW50YXhFcnJvcihcImluZml4X29wZXJhdG9yX2V4cHJlc3Npb246IHRyeWluZyB0byBsb29rIHVwIHByZWNlZGVuY2Ugd2hlbiBub3QgcGFyc2VkIVwiKTtcbiAgICAgICAgY29uc3QgeyBfb3BlcmF0b3IgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIF9vcGVyYXRvci5wcmVjZWRlbmNlO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyMjIEluZml4IG9wZXJhdG9yczogICBge2xoc30gPG9wZXJhdG9yPiB7cmhzfWAsIGVnOiBgYSBpcyAxYFxuICAvLyBOT1RFOiBgb3BlcmF0b3IuYXBwbHlPcGVyYXRvcmAgTVVTVCByZXR1cm4gYSBmdW5jdGlvbiB3aGljaCB0cmFuc2Zvcm1zIHR3byBhcmd1bWVudHMgKGBsaHNgIGFuZCBgcmhzYCkgaW50byBvdXRwdXQuXG4gIC8vIE5PVEU6IGBwcmVjZWRlbmNlYCBudW1iZXJzIGNvbWUgZnJvbSBKYXZhc2NyaXB0IGVxdWl2YWxlbnRzXG4gIC8vXHRcdCBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9PcGVyYXRvcnMvT3BlcmF0b3JfUHJlY2VkZW5jZVxuICB7XG4gICAgbmFtZTogXCJhbmRcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogNixcbiAgICBzeW50YXg6IFwiYW5kXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGFuZCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuIGAoJHthfSAmJiAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIGFuZCBiXCIsIFwiKGEgJiYgYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDUsXG4gICAgc3ludGF4OiBcIm9yXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm4gYCgke2F9IHx8ICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImEgb3IgYlwiLCBcIihhIHx8IGIpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpc1wiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMCxcbiAgICBzeW50YXg6IFwiaXNcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXMgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybiBgKCR7YX0gPT0gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBiXCIsIFwiKGEgPT0gYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImlzX25vdFwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMCxcbiAgICBzeW50YXg6IFwiaXMgbm90XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX25vdCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuIGAoJHthfSAhPSAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIGlzIG5vdCBiXCIsIFwiKGEgIT0gYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImlzX2V4YWN0bHlcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTAsXG4gICAgc3ludGF4OiBcImlzIGV4YWN0bHlcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfZXhhY3RseSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuIGAoJHthfSA9PT0gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBleGFjdGx5IGJcIiwgXCIoYSA9PT0gYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpc19ub3RfZXhhY3RseVwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMCxcbiAgICBzeW50YXg6IFwiaXMgbm90IGV4YWN0bHlcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2V4YWN0bHkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybiBgKCR7YX0gIT09ICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImEgaXMgbm90IGV4YWN0bHkgYlwiLCBcIihhICE9PSBiKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbi8vRklYTUU6IG5vIHZhbGlkYXRpb24gdGhhdCBgdHlwZWAgaXMgYSBsZWdhbCBKUyB0eXBlXG4gIC8vVE9ETzogYGlzIHNhbWUgdHlwZSBhc2AgP1xuICB7XG4gICAgbmFtZTogXCJpc19hXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpcyBhXCIsXG4gICAgICBcImlzIGFuXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19hIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKHRoaW5nLCB0eXBlKSB7IHJldHVybiBgc3BlbGwuaXNPZlR5cGUoJHt0aGluZ30sICcke3R5cGV9JylgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBhIEJcIiwgXCJzcGVsbC5pc09mVHlwZShhLCAnQicpXCJdLFxuICAgICAgICAgIFtcImEgaXMgYW4gQVwiLCBcInNwZWxsLmlzT2ZUeXBlKGEsICdBJylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImlzX25vdF9hXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpcyBub3QgYVwiLFxuICAgICAgXCJpcyBub3QgYW5cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX25vdF9hIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKHRoaW5nLCB0eXBlKSB7IHJldHVybiBgIXNwZWxsLmlzT2ZUeXBlKCR7dGhpbmd9LCAnJHt0eXBlfScpYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImEgaXMgbm90IGEgQlwiLCBcIiFzcGVsbC5pc09mVHlwZShhLCAnQicpXCJdLFxuICAgICAgICAgIFtcImEgaXMgbm90IGFuIEFcIiwgXCIhc3BlbGwuaXNPZlR5cGUoYSwgJ0EnKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAgLy9UT0RPOiBgc3BlbGwuY29udGFpbnMoY29sbGVjdGlvbiwgdGhpbmcpYFxuICB7XG4gICAgbmFtZTogXCJpc19pblwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgaW5cIixcbiAgICAgIFwiaXMgb25lIG9mXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19pbiBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcih0aGluZywgbGlzdCkgeyByZXR1cm4gYHNwZWxsLmluY2x1ZGVzKCR7bGlzdH0sICR7dGhpbmd9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIGlzIGluIHRoZUxpc3RcIiwgXCJzcGVsbC5pbmNsdWRlcyh0aGVMaXN0LCBhKVwiXSxcbiAgICAgICAgICBbXCJhIGlzIG9uZSBvZiB0aGVMaXN0XCIsIFwic3BlbGwuaW5jbHVkZXModGhlTGlzdCwgYSlcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImlzX25vdF9pblwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgbm90IGluXCIsXG4gICAgICBcImlzIG5vdCBvbmUgb2ZcIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX25vdF9pbiBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcih0aGluZywgbGlzdCkgeyByZXR1cm4gYCFzcGVsbC5pbmNsdWRlcygke2xpc3R9LCAke3RoaW5nfSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBub3QgaW4gdGhlTGlzdFwiLCBcIiFzcGVsbC5pbmNsdWRlcyh0aGVMaXN0LCBhKVwiXSxcbiAgICAgICAgICBbXCJhIGlzIG5vdCBvbmUgb2YgdGhlTGlzdFwiLCBcIiFzcGVsbC5pbmNsdWRlcyh0aGVMaXN0LCBhKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cblxuXG4gIHtcbiAgICBuYW1lOiBcImluY2x1ZGVzXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpbmNsdWRlc1wiLFxuICAgICAgXCJjb250YWluc1wiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaW5jbHVkZXMgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IobGlzdCwgdGhpbmcpIHsgcmV0dXJuIGBzcGVsbC5pbmNsdWRlcygke2xpc3R9LCAke3RoaW5nfSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1widGhlTGlzdCBpbmNsdWRlcyBhXCIsIFwic3BlbGwuaW5jbHVkZXModGhlTGlzdCwgYSlcIl0sXG4gICAgICAgICAgW1widGhlTGlzdCBjb250YWlucyBhXCIsIFwic3BlbGwuaW5jbHVkZXModGhlTGlzdCwgYSlcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImRvZXNfbm90X2luY2x1ZGVcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImRvZXMgbm90IGluY2x1ZGVcIixcbiAgICAgIFwiZG9lcyBub3QgY29udGFpblwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZG9lc19ub3RfaW5jbHVkZSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihsaXN0LCB0aGluZykgeyByZXR1cm4gYCFzcGVsbC5pbmNsdWRlcygke2xpc3R9LCAke3RoaW5nfSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1widGhlTGlzdCBkb2VzIG5vdCBpbmNsdWRlIGFcIiwgXCIhc3BlbGwuaW5jbHVkZXModGhlTGlzdCwgYSlcIl0sXG4gICAgICAgICAgW1widGhlTGlzdCBkb2VzIG5vdCBjb250YWluIGFcIiwgXCIhc3BlbGwuaW5jbHVkZXModGhlTGlzdCwgYSlcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG5cbiAge1xuICAgIG5hbWU6IFwiZ3RcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcIj5cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZ3QgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9ID4gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiB7XG4gICAgICAgICAgXCJ3aXRoIHNwYWNlc1wiOiBbXCJhID4gYlwiLCBcIihhID4gYilcIl0sXG4gICAgICAgICAgXCJ3aXRob3V0IHNwYWNlc1wiOiBbXCJhPmJcIiwgXCIoYSA+IGIpXCJdLFxuICAgICAgICB9XG4gICAgICB9LFxuICAgIF1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaXNfZ3RcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcImlzIGdyZWF0ZXIgdGhhblwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19ndCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9ID4gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBncmVhdGVyIHRoYW4gYlwiLCBcIihhID4gYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImd0ZVwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiPj1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZ3RlIGV4dGVuZHMgUnVsZS5TeW1ib2xzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybmAoJHthfSA+PSAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IHtcbiAgICAgICAgICBcIndpdGggc3BhY2VzXCI6IFtcImEgPj0gYlwiLCBcIihhID49IGIpXCJdLFxuICAgICAgICAgIFwid2l0aG91dCBzcGFjZXNcIjogW1wiYT49YlwiLCBcIihhID49IGIpXCJdLFxuICAgICAgICB9XG4gICAgICB9LFxuICAgIF1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaXNfZ3RlXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCJpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfZ3RlIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gPj0gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gYlwiLCBcIihhID49IGIpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJsdFwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiPFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsdCBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gPCAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IHtcbiAgICAgICAgICBcIndpdGggc3BhY2VzXCI6IFtcImEgPiBiXCIsIFwiKGEgPiBiKVwiXSxcbiAgICAgICAgICBcIndpdGhvdXQgc3BhY2VzXCI6IFtcImE+YlwiLCBcIihhID4gYilcIl0sXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpc19sdFwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiaXMgbGVzcyB0aGFuXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2x0IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gPCAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIGlzIGxlc3MgdGhhbiBiXCIsIFwiKGEgPCBiKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwibHRlXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCI8PVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsdGUgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9IDw9ICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czoge1xuICAgICAgICAgIFwid2l0aCBzcGFjZXNcIjogW1wiYSA8PSBiXCIsIFwiKGEgPD0gYilcIl0sXG4gICAgICAgICAgXCJ3aXRob3V0IHNwYWNlc1wiOiBbXCJhPD1iXCIsIFwiKGEgPD0gYilcIl0sXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImlzX2x0ZVwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2x0ZSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9IDw9ICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImEgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIGJcIiwgXCIoYSA8PSBiKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cblxuICB7XG4gICAgbmFtZTogXCJwbHVzX3N5bWJvbFwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMyxcbiAgICBzeW50YXg6IFwiXFxcXCtcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcGx1c19zeW1ib2wgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9ICsgJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYStiXCIsIFwiKGEgKyBiKVwiXSxcbiAgICAgICAgICBbXCJhICsgYlwiLCBcIihhICsgYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJwbHVzXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDEzLFxuICAgIHN5bnRheDogXCJwbHVzXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHBsdXMgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybmAoJHthfSArICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImEgcGx1cyBiXCIsIFwiKGEgKyBiKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwibWludXNfc3ltYm9sXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDEzLFxuICAgIHN5bnRheDogXCItXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG1pbnVzX3N5bWJvbCBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gLSAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IHtcbi8vICAgICAgICBcIndpdGhvdXQgc3BhY2VzXCI6IFtcImEtYlwiLCBcIihhIC0gYilcIl0sICAgLy8gbWludXMgcmVxdWlyZXMgc3BhY2VcbiAgICAgICAgICBcIndpdGggc3BhY2VzXCI6IFtcImEgLSBiXCIsIFwiKGEgLSBiKVwiXSxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcIm1pbnVzXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDEzLFxuICAgIHN5bnRheDogXCJtaW51c1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBtaW51cyBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9IC0gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBtaW51cyBiXCIsIFwiKGEgLSBiKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwidGltZXNfc3VtYm9sXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDE0LFxuICAgIHN5bnRheDogXCJcXFxcKlwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0aW1lcyBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gKiAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IHtcbiAgICAgICAgICBcIndpdGhvdXQgc3BhY2VzXCI6IFtcImEqYlwiLCBcIihhICogYilcIl0sXG4gICAgICAgICAgXCJ3aXRoIHNwYWNlc1wiOiBbXCJhICogYlwiLCBcIihhICogYilcIl0sXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJ0aW1lc1wiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxNCxcbiAgICBzeW50YXg6IFwidGltZXNcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgdGltZXMgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybmAoJHthfSAqICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImEgdGltZXMgYlwiLCBcIihhICogYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImRpdmlzaW9uX3N5bWJvbFwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxNCxcbiAgICBzeW50YXg6IFwiL1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkaXZpZGVkX2J5IGV4dGVuZHMgUnVsZS5TeW1ib2xzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybmAoJHthfSAvICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czoge1xuICAgICAgICAgIFwid2l0aG91dCBzcGFjZXNcIjogW1wiYS9iXCIsIFwiKGEgLyBiKVwiXSxcbiAgICAgICAgICBcIndpdGggc3BhY2VzXCI6IFtcImEgLyBiXCIsIFwiKGEgLyBiKVwiXSxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcImRpdmlkZWRfYnlcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTQsXG4gICAgc3ludGF4OiBcImRpdmlkZWQgYnlcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGl2aWRlZF9ieSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9IC8gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBkaXZpZGVkIGJ5IGJcIiwgXCIoYSAvIGIpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICAvL1xuICAvLyMjIFBvc3RpZnggb3BlcmF0b3JzOiAgIGB7bGhzfSA8b3BlcmF0b3I+YCwgZS5nLiBgYSBpcyBkZWZpbmVkYFxuICAvLyBOT1RFOiBgb3BlcmF0b3IuYXBwbHlPcGVyYXRvcmAgTVVTVCByZXR1cm4gYSBmdW5jdGlvbiB3aGljaCB0cmFuc2Zvcm1zIGFyZ3VtZW50IChgbGhzYCkgaW50byBKUyBvdXRwdXQuXG5cbiAge1xuICAgIG5hbWU6IFwicG9zdGZpeF9vcGVyYXRvcl9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7ZXhwcmVzc2lvbn0ge29wZXJhdG9yOnBvc3RmaXhfb3BlcmF0b3J9XCIsXG4gICAgbGVmdFJlY3Vyc2l2ZTogdHJ1ZSxcbiAgICB0ZXN0UnVsZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHBvc3RmaXhfb3BlcmF0b3JfZXhwcmVzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgZXhwcmVzc2lvbiwgX29wZXJhdG9yIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBfb3BlcmF0b3IuYXBwbHlPcGVyYXRvcihleHByZXNzaW9uKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaXNfZGVmaW5lZFwiLFxuICAgIGFsaWFzOiBbXCJwb3N0Zml4X29wZXJhdG9yXCJdLFxuICAgIHN5bnRheDogXCJpcyBkZWZpbmVkXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2RlZmluZWQgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IodGhpbmcpIHsgcmV0dXJuIGAodHlwZW9mICR7dGhpbmd9ICE9PSAndW5kZWZpbmVkJylgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBkZWZpbmVkXCIsIFwiKHR5cGVvZiBhICE9PSAndW5kZWZpbmVkJylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpc191bmRlZmluZWRcIixcbiAgICBhbGlhczogW1wicG9zdGZpeF9vcGVyYXRvclwiXSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgdW5kZWZpbmVkXCIsXG4gICAgICBcImlzIG5vdCBkZWZpbmVkXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc191bmRlZmluZWQgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IodGhpbmcpIHsgcmV0dXJuIGAodHlwZW9mICR7dGhpbmd9ID09PSAndW5kZWZpbmVkJylgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1widGhpbmcgaXMgdW5kZWZpbmVkXCIsIFwiKHR5cGVvZiB0aGluZyA9PT0gJ3VuZGVmaW5lZCcpXCJdLFxuICAgICAgICAgIFtcInRoaW5nIGlzIG5vdCBkZWZpbmVkXCIsIFwiKHR5cGVvZiB0aGluZyA9PT0gJ3VuZGVmaW5lZCcpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpc19lbXB0eVwiLFxuICAgIGFsaWFzOiBbXCJwb3N0Zml4X29wZXJhdG9yXCJdLFxuICAgIHN5bnRheDogXCJpcyBlbXB0eVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19lbXB0eSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcih0aGluZykgeyByZXR1cm4gYHNwZWxsLmlzRW1wdHkoJHt0aGluZ30pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcInRoaW5nIGlzIGVtcHR5XCIsIFwic3BlbGwuaXNFbXB0eSh0aGluZylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpc19ub3RfZW1wdHlcIixcbiAgICBhbGlhczogW1wicG9zdGZpeF9vcGVyYXRvclwiXSxcbiAgICBzeW50YXg6IFwiaXMgbm90IGVtcHR5XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX25vdF9lbXB0eSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcih0aGluZykgeyByZXR1cm4gYCFzcGVsbC5pc0VtcHR5KCR7dGhpbmd9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJ0aGluZyBpcyBub3QgZW1wdHlcIiwgXCIhc3BlbGwuaXNFbXB0eSh0aGluZylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG5cbiAgLy9cbiAgLy8jIyBQcmVmaXggb3BlcmF0b3JzOiAgIGA8b3BlcmF0b3I+IHtsaHN9YCwgZS5nLiBgcm91bmQgdGhlTGlzdGBcbiAgLy8gTk9URTogYG9wZXJhdG9yLmFwcGx5T3BlcmF0b3JgIE1VU1QgcmV0dXJuIGEgZnVuY3Rpb24gd2hpY2ggdHJhbnNmb3JtcyBhcmd1bWVudCAoYGxoc2ApIGludG8gSlMgb3V0cHV0LlxuXG4gIHtcbiAgICBuYW1lOiBcImFic29sdXRlX3ZhbHVlXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuLy9GSVhNRTogbWFrZSBgdGhlYCBvcHRpb25hbFxuICAgIHN5bnRheDogXCJ0aGUgYWJzb2x1dGUgdmFsdWUgb2Yge2V4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGFic29sdXRlX3ZhbHVlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgY29uc3QgeyBleHByZXNzaW9uIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgTWF0aC5hYnMoJHtleHByZXNzaW9ufSlgO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJ0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpbmdcIiwgXCJNYXRoLmFicyh0aGluZylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm1heFwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbi8vRklYTUU6IFwidGhlP1wiXG4gICAgc3ludGF4OiBcIihtYXh8bWF4aW11bXxsYXJnZXN0fGJpZ2dlc3QpIHtpZGVudGlmaWVyfT8gKG9mfGluKSB7ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbWF4IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgY29uc3QgeyBleHByZXNzaW9uIH0gPSB0aGlzLnJlc3VsdHM7XG4vLyBUT0RPOiBNYXRoLm1heCgpIGRvZXNuJ3Qgd29yayB3aGVuIHBhc3NlZCBhbiBhcnJheS4uLiA6LShcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5tYXgoJHtleHByZXNzaW9ufSlgXG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIm1heCBvZiB0aGluZ1wiLCBcInNwZWxsLm1heCh0aGluZylcIl0sXG4gICAgICAgICAgW1wibWF4IGluIHRoaW5nXCIsIFwic3BlbGwubWF4KHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJtYXhpbXVtIG9mIHRoaW5nXCIsIFwic3BlbGwubWF4KHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJsYXJnZXN0IG9mIHRoaW5nXCIsIFwic3BlbGwubWF4KHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJiaWdnZXN0IGluIHRoaW5nXCIsIFwic3BlbGwubWF4KHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJiaWdnZXN0IGl0ZW0gaW4gdGhpbmdcIiwgXCJzcGVsbC5tYXgodGhpbmcpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJtaW5cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4vL0ZJWE1FOiBcInRoZT9cIlxuICAgIHN5bnRheDogXCIobWlufG1pbmltdW18c21hbGxlc3R8bGVhc3QpIHtpZGVudGlmaWVyfT8gKG9mfGluKSB7ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbWluIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgY29uc3QgeyBleHByZXNzaW9uIH0gPSB0aGlzLnJlc3VsdHM7XG4vLyBUT0RPOiBNYXRoLm1pbigpIGRvZXNuJ3Qgd29yayB3aGVuIHBhc3NlZCBhbiBhcnJheS4uLiA6LShcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5taW4oJHtleHByZXNzaW9ufSlgXG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIm1pbiBvZiB0aGluZ1wiLCBcInNwZWxsLm1pbih0aGluZylcIl0sXG4gICAgICAgICAgW1wibWluIGluIHRoaW5nXCIsIFwic3BlbGwubWluKHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJtaW5pbXVtIG9mIHRoaW5nXCIsIFwic3BlbGwubWluKHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJzbWFsbGVzdCBvZiB0aGluZ1wiLCBcInNwZWxsLm1pbih0aGluZylcIl0sXG4gICAgICAgICAgW1wibGVhc3Qgb2YgdGhpbmdcIiwgXCJzcGVsbC5taW4odGhpbmcpXCJdLFxuICAgICAgICAgIFtcInNtYWxsZXN0IGl0ZW0gaW4gdGhpbmdcIiwgXCJzcGVsbC5taW4odGhpbmcpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuXG4gIC8vXG4gIC8vIyMgXCJzdXJyb3VuZGluZ1wiIG9wZXJhdG9yIGV4cHJlc3Npb25zOiAgIGByb3VuZCB0aGluZyBkb3duYFxuICAvL1xuXG4gIHtcbiAgICBuYW1lOiBcInJvdW5kX3VwX29yX2Rvd25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcInJvdW5kIHt0aGluZzpleHByZXNzaW9ufSAoZGlyZWN0aW9uOm9mZnx1cHxkb3duKT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgcm91bmRfdXBfb3JfZG93biBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGNvbnN0IHsgdGhpbmcsIGRpcmVjdGlvbiB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSBcInVwXCIpXG4gICAgICAgICAgcmV0dXJuIGBNYXRoLmNlaWwoJHt0aGluZ30pYDtcbiAgICAgICAgZWxzZSBpZiAoZGlyZWN0aW9uID09PSBcImRvd25cIilcbiAgICAgICAgICByZXR1cm4gYE1hdGguZmxvb3IoJHt0aGluZ30pYDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBgTWF0aC5yb3VuZCgke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJyb3VuZCB0aGluZ1wiLCBcIk1hdGgucm91bmQodGhpbmcpXCJdLFxuICAgICAgICAgIFtcInJvdW5kIHRoaW5nIG9mZlwiLCBcIk1hdGgucm91bmQodGhpbmcpXCJdLFxuICAgICAgICAgIFtcInJvdW5kIHRoaW5nIHVwXCIsIFwiTWF0aC5jZWlsKHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJyb3VuZCB0aGluZyBkb3duXCIsIFwiTWF0aC5mbG9vcih0aGluZylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9XG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL29wZXJhdG9ycy5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgY3JlYXRpbmcgdmFyaWFibGVzLCBwcm9wZXJ0eSBhY2Nlc3MsIGV0Y1xuLy9cblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG4vLyBDcmVhdGUgXCJzdGF0ZW1lbnRzXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck1vZHVsZShcInN0YXRlbWVudHNcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAgLy9cbiAgLy9cdCMjIFJldHVybnNcbiAgLy9cblxuICAvLyBSZXR1cm4gYSB2YWx1ZVxuICB7XG4gICAgbmFtZTogXCJyZXR1cm5fc3RhdGVtZW50XCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJldHVybiB7ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmV0dXJuX3N0YXRlbWVudCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGV4cHJlc3Npb24gfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGByZXR1cm4gJHtleHByZXNzaW9ufWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wicmV0dXJuIHRoaW5nXCIsIFwicmV0dXJuIHRoaW5nXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICAvL1xuICAvL1x0IyMgQXNzaWdubWVudFxuICAvL1xuXG4gIC8vVE9ETzogZGlzdGluZ3Vpc2ggYmV0d2VlbiBgbmV3X2lkZW50aWZpZXJgIGFuZCBgc2NvcGVkX2lkZW50aWZpZXJgP1xuICB7XG4gICAgbmFtZTogXCJhc3NpZ25tZW50XCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwie3RoaW5nOmV4cHJlc3Npb259ID0ge3ZhbHVlOmV4cHJlc3Npb259XCIsXG4gICAgICBcInNldCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge3ZhbHVlOmV4cHJlc3Npb259XCIsXG4gICAgICBcInB1dCB7dmFsdWU6ZXhwcmVzc2lvbn0gaW50byB7dGhpbmc6ZXhwcmVzc2lvbn1cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGFzc2lnbm1lbnQgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgdmFsdWUgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgLy8gVE9ETzogZGVjbGFyZSBpZGVudGlmaWVyIGlmIG5vdCBpbiBzY29wZSwgZXRjXG4gICAgICAgIHJldHVybiBgJHt0aGluZ30gPSAke3ZhbHVlfWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1widGhpbmcgPSB5ZXNcIiwgXCJ0aGluZyA9IHRydWVcIl0sXG4gICAgICAgICAgW1wic2V0IHRoaW5nIHRvIHllc1wiLCBcInRoaW5nID0gdHJ1ZVwiXSxcbiAgICAgICAgICBbXCJwdXQgeWVzIGludG8gdGhpbmdcIiwgXCJ0aGluZyA9IHRydWVcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImdldF92YWx1ZVwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcImdldCB7dmFsdWU6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZ2V0X3ZhbHVlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdmFsdWUgfSA9IHRoaXMucmVzdWx0czs7XG4gICAgICAgIHJldHVybiBgdmFyIGl0ID0gJHt2YWx1ZX1gXG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBcIixcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImdldCB0aGluZ1wiLCBcInZhciBpdCA9IHRoaW5nXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ydWxlcy9zcGVsbC9zdGF0ZW1lbnRzLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBkZWZpbmluZyBjbGFzc2VzIChrbm93biBhcyBgdHlwZXNgKVxuLy9cblxuLy8gVE9ETzogY29uc3RydWN0b3Jcbi8vIFRPRE86IG1peGlucyAvIHRyYWl0cyAvIGNvbXBvc2VkIGNsYXNzZXMgLyBhbm5vdGF0aW9uc1xuXG5pbXBvcnQgZmxhdHRlbkRlZXAgZnJvbSBcImxvZGFzaC9mbGF0dGVuRGVlcC5qc1wiO1xuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5cbmltcG9ydCBnbG9iYWwgZnJvbSBcIi4uLy4uL3V0aWxzL2dsb2JhbFwiO1xuaW1wb3J0IHsgcGx1cmFsaXplIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3N0cmluZ1wiO1xuXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTW9kdWxlKFwidHlwZXNcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAgLy9cbiAgLy9cdFNlbGYtcmVmZXJlbmNlXG4gIC8vXG5cbiAgLy8gVE9ETzogY29uZnVzaW5nPz8/XG4gIHtcbiAgICBuYW1lOiBcIm1lXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJtZVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBtZSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiBcInRoaXNcIjtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wibWVcIiwgXCJ0aGlzXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICAvLyBUT0RPOiB0aGlzIHJlYWxseSBtYWtlcyBtZSB3YW50IHRvIG1ha2UgYEkgYW0gZW1wdHlgIGV0YyB3b3JrLi4uXG4gIHtcbiAgICBuYW1lOiBcIklcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIklcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgSSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiBcInRoaXNcIjtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiSVwiLCBcInRoaXNcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIC8vXG4gIC8vXHRQcm9wZXJ0eSBhY2Nlc3NcbiAgLy9cblxuICB7XG4vLyBUT0RPOiByZWFsbHkgbG93IHByZWNlZGVuY2Ugb24gdGhpcyBzbyBtb3JlLXNwZWNpZmljIHJ1bGVzIHdpdGggc2ltaWxhciBwYXR0ZXJuIHdpbGwgd29ya1xuLy8gVE9ETzogbXVsdGlwbGUgaWRlbnRpZmllcnMgd291bGQgYmUgY29vbC4uLlxuICAgIG5hbWU6IFwicHJvcGVydHlfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiKHByb3BlcnRpZXM6dGhlIHtpZGVudGlmaWVyfSBvZikrIHRoZT8ge2V4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHByb3BlcnR5X2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIGdldCByZXN1bHRzKCkge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gc3VwZXIucmVzdWx0cztcbiAgICAgICAgcmVzdWx0cy5fcHJvcGVydGllcyA9IHJlc3VsdHMuX3Byb3BlcnRpZXMubWF0Y2hlZDtcbiAgICAgICAgcmVzdWx0cy5wcm9wZXJ0aWVzID0gcmVzdWx0cy5fcHJvcGVydGllcy5tYXAocHJvcGVydHkgPT4gcHJvcGVydHkucmVzdWx0cy5pZGVudGlmaWVyKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBleHByZXNzaW9uLCBwcm9wZXJ0aWVzIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzLnJldmVyc2UoKS5qb2luKFwiLlwiKTtcbiAgICAgICAgcmV0dXJuIGAke2V4cHJlc3Npb259LiR7cHJvcGVydGllc31gO1xuICAvLyBOT1RFOiB0aGUgZm9sbG93aW5nIGlzIHNhZmVyLCBidXQgdWdseSBmb3IgZGVtbyBwdXJwb3Nlc1xuICAvL1x0XHRcdHJldHVybiBgc3BlbGwuZ2V0KCR7ZXhwcmVzc2lvbn0sIFsnJHtwcm9wZXJ0aWVzfSddKWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcInRoZSBmb28gb2YgYmFyXCIsIFwiYmFyLmZvb1wiXSxcbiAgICAgICAgICBbXCJ0aGUgZm9vIG9mIHRoZSBiYXJcIiwgXCJiYXIuZm9vXCJdLFxuICAgICAgICAgIFtcInRoZSBmb28gb2YgdGhlIGJhciBvZiB0aGUgYmF6XCIsIFwiYmF6LmJhci5mb29cIl0sXG4gICAgICAgICAgW1widGhlIGZvby1iYXIgb2YgdGhlIGJhelwiLCBcImJhei5mb29fYmFyXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cblxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm15X3Byb3BlcnR5X2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIihteXx0aGlzKSB7aWRlbnRpZmllcn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbXlfcHJvcGVydHlfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGlkZW50aWZpZXIgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGB0aGlzLiR7aWRlbnRpZmllcn1gO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJteSBmb29cIiwgXCJ0aGlzLmZvb1wiXSxcbiAgICAgICAgICBbXCJ0aGlzIGJhbmstYWNjb3VudFwiLCBcInRoaXMuYmFua19hY2NvdW50XCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICAvL01PVkUgVE8gYGZ1bmN0aW9uc2A/XG4gIC8vIEFyZ3VtZW50cyBjbGF1c2UgZm9yIG1ldGhvZHNcbiAgLy9cdGB3aXRoIGZvb2Agb3IgYHdpdGggZm9vIGFuZCBiYXIgYW5kIGJhemBcbiAgLy9UT0RPOiB7aWRlbnRpZmllcn0gPSB7ZXhwcmVzc2lvbn1cdD0+IHJlcXVpcmVzIGAsYCBpbnN0ZWFkIG9mIGBhbmRgXG4gIC8vVE9ETzogYHdpdGggZm9vIGFzIFR5cGVgXG4gIC8vVE9ETzpcdGB3aXRoIGZvby4uLmAgZm9yIHNwbGF0P1xuICB7XG4gICAgbmFtZTogXCJhcmdzXCIsXG4gICAgc3ludGF4OiBcIndpdGggW2FyZ3M6e2lkZW50aWZpZXJ9LF1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgYXJncyBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgLy8gUmV0dXJucyBhbiBhcnJheSBvZiBhcmd1bWVudCB2YWx1ZXNcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBjb25zdCB7IGFyZ3MgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGFyZ3Muam9pbihcIiwgXCIpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJ3aXRoIGFcIiwgXCJhXCJdLFxuICAgICAgICAgIFtcIndpdGggYSwgYiwgY1wiLCBcImEsIGIsIGNcIl0sXG4gICAgICAgICAgW1wid2l0aCBhLCBiLCBjLFwiLCBcImEsIGIsIGNcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG5cbiAgLy8gUHJvcGVydGllcyBjbGF1c2U6IGNyZWF0ZXMgYW4gb2JqZWN0IHdpdGggb25lIG9yIG1vcmUgcHJvcGVydHkgdmFsdWVzLlxuICAvL1x0YGZvbyA9IDEsIGJhciA9IDJgXG4gIC8vVE9ETzogd291bGQgbGlrZSB0byB1c2UgYGFuZGAgYnV0IHRoYXQgY29uZmxpY3RzIHdpdGggXCJhbmRcIiBvcGVyYXRvclxuICAvL1RPRE86IGRvbid0IHF1b3RlIGlmIHdlIGRvbid0IGhhdmUgdG8/IChBU0NJSSBhbmQgYmxhY2tsaXN0IG9ubHkpXG4gIC8vVE9PRDogbXVsdGlwbGUgbGluZXMgaWYgPiAyIHByb3BzP1xuICB7XG4gICAgbmFtZTogXCJvYmplY3RfbGl0ZXJhbF9wcm9wZXJ0aWVzXCIsXG4gICAgc3ludGF4OiBcIlsoe2tleTppZGVudGlmaWVyfSg/Oj0ge3ZhbHVlOmV4cHJlc3Npb259KT8pICxdXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9iamVjdF9saXRlcmFsX3Byb3BlcnRpZXMgZXh0ZW5kcyBSdWxlLkxpc3Qge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCBwcm9wcyA9IHRoaXMubWF0Y2hlZC5tYXAoZnVuY3Rpb24gKHByb3ApIHtcbiAgICAgICAgICAgIGxldCB7IGtleSwgdmFsdWUgfSA9IHByb3AucmVzdWx0cztcbiAgICAgICAgICAgIGlmICh2YWx1ZSkgcmV0dXJuIGBcIiR7a2V5fVwiOiAke3ZhbHVlfWBcbiAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBgeyAke3Byb3BzLmpvaW4oXCIsIFwiKX0gfWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtgYCwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbYGEgPSAxYCwgYHsgXCJhXCI6IDEgfWBdLFxuICAgICAgICAgIFtgYSA9IDEsYCwgYHsgXCJhXCI6IDEgfWBdLFxuICAgICAgICAgIFtgYSA9IDEsIGIgPSB5ZXMsIGMgPSBcInF1b3RlZFwiYCwgYHsgXCJhXCI6IDEsIFwiYlwiOiB0cnVlLCBcImNcIjogXCJxdW90ZWRcIiB9YF0sXG4gICAgICAgICAgW2BhID0gMSwgYiA9IHRoZSBmb28gb2YgdGhlIGJhcmAsIGB7IFwiYVwiOiAxLCBcImJcIjogYmFyLmZvbyB9YF0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImRlZmluZV90eXBlXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwiZGVmaW5lIHR5cGUge25hbWU6dHlwZX0gKD86YXMgKGF8YW4pIHtzdXBlclR5cGU6dHlwZX0pP1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkZWZpbmVfdHlwZSBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgc3RydWN0dXJlID0gc3VwZXIudG9TdHJ1Y3R1cmUoKTtcbiAgICAgICAgc3RydWN0dXJlLnR5cGUgPSBcImNsYXNzXCI7XG4gICAgICAgIHJldHVybiBzdHJ1Y3R1cmU7XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBuYW1lLCBzdXBlclR5cGUsIHN0YXRlbWVudHMgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgbGV0IG91dHB1dCA9IGBjbGFzcyAke25hbWV9YDtcbiAgICAgICAgaWYgKHN1cGVyVHlwZSkgb3V0cHV0ICs9IGAgZXh0ZW5kcyAke3N1cGVyVHlwZX1gO1xuICAgICAgICBvdXRwdXQgKz0gXCIgXCIgKyBzdGF0ZW1lbnRzO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudHNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJkZWZpbmUgdHlwZSBGb29cIiwgXCJjbGFzcyBGb28ge31cIl0sXG4gICAgICAgICAgW1wiZGVmaW5lIHR5cGUgRm9vIGFzIGEgQmFyXCIsIFwiY2xhc3MgRm9vIGV4dGVuZHMgQmFyIHt9XCJdLFxuICAgICAgICAgIFtcImRlZmluZSB0eXBlIEZvb1xcblxcdGEgPSB5ZXNcIiwgXCJjbGFzcyBGb28ge1xcblxcdGEgPSB0cnVlXFxufVwiXSxcbiAgICAgICAgICBbXCJkZWZpbmUgdHlwZSBGb29cXG5cXHRhID0geWVzXFxuXFx0YiA9IG5vXCIsIFwiY2xhc3MgRm9vIHtcXG5cXHRhID0gdHJ1ZVxcblxcdGIgPSBmYWxzZVxcbn1cIl0sXG4vL1RFU1RNRTogbW9yZSBpbnZvbHZlZCB0ZXN0cy4uLlxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cblxuICB9LFxuXG4gIC8vIGBuZXdgIG9yIGBjcmVhdGVgXG4gIC8vIFRoaXMgd29ya3MgYXMgYW4gZXhwcmVzc2lvbiBPUiBhIHN0YXRlbWVudC5cbiAgLy8gTk9URTogd2UgYXNzdW1lIHRoYXQgYWxsIHR5cGVzIHRha2UgYW4gb2JqZWN0IG9mIHByb3BlcnRpZXM/Pz8/XG4vL0ZJWE1FOiBgbGlzdGAsIGB0ZXh0YCwgZXRjIGRvbid0IGZvbGxvdyB0aGVzZSBzZW1hbnRpY3MgYW5kIHNob3VsZCBiZSBkaXNhbGxvd2VkLi4uID8/P1xuICB7XG4gICAgbmFtZTogXCJuZXdfdGhpbmdcIixcbiAgICBhbGlhczogW1wiZXhwcmVzc2lvblwiLCBcInN0YXRlbWVudFwiXSxcbiAgICBzeW50YXg6IFwiKGNyZWF0ZXxuZXcpIHt0eXBlfSAoPzp3aXRoIHtwcm9wczpvYmplY3RfbGl0ZXJhbF9wcm9wZXJ0aWVzfSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG5ld190aGluZyBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHR5cGUsIHByb3BzID0gXCJcIiB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIG9iamVjdCwgd2hpY2ggd2UnbGwgY3JlYXRlIHdpdGggYW4gb2JqZWN0IGxpdGVyYWwuXG4gICAgICAgIGlmICh0eXBlID09PSBcIk9iamVjdFwiKSB7XG4gICAgICAgICAgaWYgKCFwcm9wcykgcmV0dXJuIFwie31cIjtcbiAgICAgICAgICByZXR1cm4gcHJvcHM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYG5ldyAke3R5cGV9KCR7cHJvcHN9KWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjcmVhdGVzIG5vcm1hbCBvYmplY3RzIHByb3Blcmx5XCIsXG4gICAgICAgIGNvbXBpbGVBczogXCJzdGF0ZW1lbnRcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgIFtgY3JlYXRlIE9iamVjdGAsIGB7fWBdLFxuICAgICAgICAgW2BuZXcgT2JqZWN0YCwgYHt9YF0sXG4gICAgICAgICBbYG5ldyBPYmplY3Qgd2l0aCBhID0gMSwgYiA9IHllc2AsIGB7IFwiYVwiOiAxLCBcImJcIjogdHJ1ZSB9YF0sXG4gICAgICAgICBbYG5ldyBGb29gLCBgbmV3IEZvbygpYF0sXG4gICAgICAgICBbYG5ldyBGb28gd2l0aCBhID0gMSwgYiA9IHllc2AsIGBuZXcgRm9vKHsgXCJhXCI6IDEsIFwiYlwiOiB0cnVlIH0pYF0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNyZWF0ZXMgc3BlY2lhbCB0eXBlc1wiLFxuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImNyZWF0ZSBvYmplY3RcIiwgXCJ7fVwiXSxcbi8vRklYTUU6IHRoZSBmb2xsb3dpbmcgZG9uJ3QgbWFrZSBzZW5zZSBpZiB0aGV5IGhhdmUgYXJndW1lbnRzLi4uXG4gICAgICAgICAgW1wiY3JlYXRlIExpc3RcIiwgXCJuZXcgQXJyYXkoKVwiXSxcbiAgICAgICAgICBbXCJjcmVhdGUgbGlzdFwiLCBcIm5ldyBBcnJheSgpXCJdLFxuLy9GSVhNRTogdGhlIGZvbGxvd2luZyBkb24ndCBtYWtlIHNlbnNlIGluIEpTIGJ1dCBhcmUgbGVnYWwgcGFyc2Utd2lzZVxuXG4vLyAgICAgICAgICAgW1wiY3JlYXRlIHRleHRcIiwgXCJuZXcgU3RyaW5nKClcIl0sXG4vLyAgICAgICAgICAgW1wiY3JlYXRlIGNoYXJhY3RlclwiLCBcIm5ldyBDaGFyYWN0ZXIoKVwiXSxcbi8vICAgICAgICAgICBbXCJjcmVhdGUgbnVtYmVyXCIsIFwibmV3IE51bWJlcigpXCJdLFxuLy8gICAgICAgICAgIFtcImNyZWF0ZSBpbnRlZ2VyXCIsIFwibmV3IEludGVnZXIoKVwiXSxcbi8vICAgICAgICAgICBbXCJjcmVhdGUgZGVjaW1hbFwiLCBcIm5ldyBEZWNpbWFsKClcIl0sXG4vLyAgICAgICAgICAgW1wiY3JlYXRlIGJvb2xlYW5cIiwgXCJuZXcgQm9vbGVhbigpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cblxuICB9LFxuXG5cblxuICAvL1xuICAvL1x0ZGVjbGFyZSBwcm9wZXJ0aWVzXG4gIC8vXG5cbiAge1xuICAgIC8vVE9ETzogYW5vdGhlciBuYW1lIGZvciBgY29uc3RhbnRgID9cbiAgICBuYW1lOiBcImRlY2xhcmVfcHJvcGVydHlcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCIoc2NvcGU6cHJvcGVydHl8Y29uc3RhbnR8c2hhcmVkIHByb3BlcnR5KSB7bmFtZTppZGVudGlmaWVyfSAoPzo9IHt2YWx1ZTpleHByZXNzaW9ufSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRlY2xhcmVfcHJvcGVydHkgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBzY29wZSwgbmFtZSwgdmFsdWUgPSBcIlwiIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIGlmICh2YWx1ZSkgdmFsdWUgPSBgID0gJHt2YWx1ZX1gO1xuXG4gICAgICAgIGxldCBkZWNsYXJhdGlvbiA9IGAke25hbWV9JHt2YWx1ZX1gO1xuICAgICAgICBzd2l0Y2ggKHNjb3BlKSB7XG4gICAgICAgICAgY2FzZSBcImNvbnN0YW50XCI6XG4gICAgICAgICAgICBpZiAoIXZhbHVlKSBjb25zb2xlLndhcm4oXCJwYXJzZSgnZGVjbGFyZV9wcm9wZXJ0eScpOiBjb25zdGFudCBwcm9wZXJ0aWVzIG11c3QgZGVjbGFyZSBhIHZhbHVlOiAgXCIsIHRoaXMubWF0Y2hlZFRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIGBjb25zdCAke2RlY2xhcmF0aW9ufWA7XG5cbiAgICAgICAgICBjYXNlIFwic2hhcmVkIHByb3BlcnR5XCI6XG4gICAgICAgICAgICByZXR1cm4gYEBwcm90byAke2RlY2xhcmF0aW9ufWA7XG5cbiAgICAgICAgICBjYXNlIFwicHJvcGVydHlcIjpcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGRlY2xhcmF0aW9uO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlXG4gICAgICB0b1N0cnVjdHVyZSgpIHtcbiAgICAgICAgbGV0IHsgc2NvcGUsIG5hbWUgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBuYW1lLCBzY29wZSB9O1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcInByb3BlcnR5IGZvb1wiLCBcImZvb1wiXSxcbi8vRklYTUUgICAgICAgICAgW1wiY29uc3RhbnQgZm9vXCIsIFwiY29uc3QgZm9vXCJdLFxuICAgICAgICAgIFtcInNoYXJlZCBwcm9wZXJ0eSBmb29cIiwgXCJAcHJvdG8gZm9vXCJdLFxuXG4gICAgICAgICAgW1wicHJvcGVydHkgZm9vID0gdGhlIGZvbyBvZiB0aGUgYmFyXCIsIFwiZm9vID0gYmFyLmZvb1wiXSxcbiAgICAgICAgICBbXCJjb25zdGFudCBmb28gPSAnc29tZSB0ZXh0J1wiLCBcImNvbnN0IGZvbyA9ICdzb21lIHRleHQnXCJdLFxuICAgICAgICAgIFtcInNoYXJlZCBwcm9wZXJ0eSBmb28gPSBuZXcgb2JqZWN0IHdpdGggYSA9IDFcIiwgXCJAcHJvdG8gZm9vID0geyBcXFwiYVxcXCI6IDEgfVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAgLy8gVE9ETzogbWVyZ2Ugd2l0aCBgZGVjbGFyZV9wcm9wZXJ0eWA/XG4gIC8vIFRPRE86IGluIGNsYXNzL29iamVjdCBzY29wZSBvbmx5P1xuICAvLyBUT0RPOiBgQHR5cGVkYCBkZWNvcmF0b3IgdG8gbWFrZSBzdWJzdGl0dXRpb24gY2xlYW5lclxuICB7XG4gICAgbmFtZTogXCJkZWNsYXJlX3Byb3BlcnR5X29mX3R5cGVcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJwcm9wZXJ0eSB7bmFtZTppZGVudGlmaWVyfSBhcyAoYXxhbik/IHt0eXBlfSAoPzo9IHt2YWx1ZTpleHByZXNzaW9ufSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRlY2xhcmVfcHJvcGVydHlfb2ZfdHlwZSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHR5cGUsIHZhbHVlID0gXCJ1bmRlZmluZWRcIiB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYEB0eXBlZCgke3R5cGV9KSAke25hbWV9ID0gJHt2YWx1ZX1gO1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHR5cGUgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBzdWJUeXBlOiBcInNldHRlclwiLCBuYW1lLCBkYXRhVHlwZTogdHlwZSB9O1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcInByb3BlcnR5IGZvbyBhcyBhIEZvb1wiLCBcIkB0eXBlZChGb28pIGZvbyA9IHVuZGVmaW5lZFwiIF0sXG4gICAgICAgICAgW1wicHJvcGVydHkgZm9vIGFzIHRleHQgPSAnZGVmYXVsdCB2YWx1ZSdcIiwgXCJAdHlwZWQoU3RyaW5nKSBmb28gPSAnZGVmYXVsdCB2YWx1ZSdcIiBdLFxuICAgICAgICAgIFtcInByb3BlcnR5IGZvbyBhcyBhIGxpc3QgPSBbXVwiLCBcIkB0eXBlZChBcnJheSkgZm9vID0gW11cIiBdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cblxuICB9LFxuXG5cbiAgLy8gVE9ETzogYEB0eXBlZGAgZGVjb3JhdG9yIHdoaWNoIHRha2VzIGFycmF5IHRvIG1ha2UgbG9naWMgY2xlYW5lclxuICAvLyBUT0RPOiBhc3NpZ24gdG8gZmlyc3QgdmFsdWUgaWYgbm8gZGVmYXVsdD9cbiAgLy8gVE9ETzogYWxsb3cgbGlzdCB0byBiZSBhbiBleHByZXNzaW9uP1xuICB7XG4gICAgbmFtZTogXCJkZWNsYXJlX3Byb3BlcnR5X2FzX29uZV9vZlwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcInByb3BlcnR5IHtuYW1lOmlkZW50aWZpZXJ9IGFzIG9uZSBvZiAoPzpsaXN0Olt7ZXhwcmVzc2lvbn0sXSt8e2xpdGVyYWxfbGlzdH0pICg/Oj0ge3ZhbHVlOmV4cHJlc3Npb259KT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVjbGFyZV9wcm9wZXJ0eV9hc19vbmVfb2YgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIGdldCByZXN1bHRzKCkge1xuICAgICAgICBsZXQgcmVzdWx0cyA9IHN1cGVyLnJlc3VsdHM7XG4gICAgICAgIHJlc3VsdHMucGx1cmFsID0gcGx1cmFsaXplKHJlc3VsdHMubmFtZSk7XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgfVxuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgbGlzdCwgdmFsdWUgPSBcInVuZGVmaW5lZFwiIH0gPSB0aGlzLnJlc3VsdHM7XG5cbiAgICAgICAgLy8gVE9ETzogdGhpcyBpcyB1Z2x5Li4uXG4gICAgICAgIGxpc3QgPSBmbGF0dGVuRGVlcChsaXN0KTtcbiAgICAgICAgbGlzdCA9IGxpc3QubGVuZ3RoID09PSAxICYmIHR5cGVvZiBsaXN0WzBdID09PSBcInN0cmluZ1wiID8gbGlzdFswXSA6IGxpc3Quam9pbihcIiwgXCIpO1xuICAgICAgICBpZiAobGlzdFswXSAhPT0gXCJbXCIpIGxpc3QgPSBgWyR7bGlzdH1dYDtcbiAgICAgICAgcmV0dXJuIGBAdHlwZWQoJHtsaXN0fSkgJHtuYW1lfSA9ICR7dmFsdWV9YFxuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHBsdXJhbCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBuYW1lIH0sXG4gICAgICAgICAgeyB0eXBlOiBcInByb3BlcnR5XCIsIHN1YlR5cGU6IFwic2hhcmVkXCIsIG5hbWU6IHBsdXJhbCB9XG4gICAgICAgIF07XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wicHJvcGVydHkgZm9vIGFzIG9uZSBvZiBbMSwgMiwgM11cIiwgXCJAdHlwZWQoWzEsIDIsIDNdKSBmb28gPSB1bmRlZmluZWRcIiBdLFxuICAgICAgICAgIFtcInByb3BlcnR5IGZvbyBhcyBvbmUgb2YgeWVzLCBubywgdW5kZWZpbmVkXCIsIFwiQHR5cGVkKFt0cnVlLCBmYWxzZSwgdW5kZWZpbmVkXSkgZm9vID0gdW5kZWZpbmVkXCIgXSxcblxuICAgICAgICAgIFtcInByb3BlcnR5IGZvbyBhcyBvbmUgb2YgWzEsIDIsIDNdID0gMVwiLCBcIkB0eXBlZChbMSwgMiwgM10pIGZvbyA9IDFcIiBdLFxuICAgICAgICAgIFtcInByb3BlcnR5IGZvbyBhcyBvbmUgb2YgeWVzLCBubywgdW5kZWZpbmVkID0geWVzXCIsIFwiQHR5cGVkKFt0cnVlLCBmYWxzZSwgdW5kZWZpbmVkXSkgZm9vID0gdHJ1ZVwiIF0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIC8vIEdldHRlci5cbiAgLy8gVE9ETzogYHRvIGdldCB4YCA/XG4gIC8vIFRPRE86IG1ha2UgdGhlIGA6YCBvcHRpb25hbCBpbiBhIHdheSB0aGF0IGRvZXNuJ3QgY29uZmxpY3Qgd2l0aCBgZ2V0IHhgXG4gIC8vIFRPRE86IGltcGxpY2l0IHJldHVybiBpbiBibG9jayBmb3JtXG4gIHtcbiAgICBuYW1lOiBcImdldHRlclwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcImdldCB7bmFtZTppZGVudGlmaWVyfVxcXFw6IHJldHVybj8ge2V4cHJlc3Npb259P1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBnZXR0ZXIgZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICAvLyBOT1RFOiB3ZSBuZWVkIHRvIHBhcnNlIGBleHByZXNzaW9uYCBhbmQgYGJsb2NrYCBtYW51YWxseSAodW5saWtlIG90aGVyIEJsb2NrU3RhdGVtZW50cylcbiAgICAgICAgY29uc3QgeyBuYW1lLCBleHByZXNzaW9uLCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBsZXQgc3RhdGVtZW50cztcbiAgICAgICAgaWYgKGJsb2NrKSB7XG4gICAgICAgICAgc3RhdGVtZW50cyA9IGJsb2NrO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGV4cHJlc3Npb24pIHtcbiAgICAgICAgICBjb25zdCByZXR1cm5QcmVmaXggPSBleHByZXNzaW9uLnN0YXJ0c1dpdGgoXCJyZXR1cm4gXCIpID8gXCJcIiA6IFwicmV0dXJuIFwiO1xuICAgICAgICAgIHN0YXRlbWVudHMgPSBgeyAke3JldHVyblByZWZpeH0ke2V4cHJlc3Npb259IH1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHN0YXRlbWVudHMgPSBcInt9XCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGBnZXQgJHtuYW1lfSgpICR7c3RhdGVtZW50c31gO1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IG5hbWUgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBzdWJUeXBlOiBcImdldHRlclwiLCBuYW1lIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJzdGF0ZW1lbnRzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiZ2V0IGZvbzpcIiwgXCJnZXQgZm9vKCkge31cIl0sXG4gICAgICAgICAgW1wiZ2V0IGZvbzogYVwiLCBcImdldCBmb28oKSB7IHJldHVybiBhIH1cIl0sXG4gICAgICAgICAgW1wiZ2V0IGZvbzogcmV0dXJuIGFcIiwgXCJnZXQgZm9vKCkgeyByZXR1cm4gYSB9XCJdLFxuICAgICAgICAgIFtcImdldCBmb286XFxuXFx0cmV0dXJuIGFcIiwgXCJnZXQgZm9vKCkge1xcblxcdHJldHVybiBhXFxufVwiXSxcbiAgICAgICAgICBbXCJnZXQgZm9vOlxcblxcdHNpZGUtZWZmZWN0ID0geWVzXFxuXFx0cmV0dXJuIGFcIiwgXCJnZXQgZm9vKCkge1xcblxcdHNpZGVfZWZmZWN0ID0gdHJ1ZVxcblxcdHJldHVybiBhXFxufVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAgLy8gU2V0dGVyLlxuICAvLyBDb21wbGFpbnMgaWYgeW91IHNwZWNpZnkgbW9yZSB0aGFuIG9uZSBhcmd1bWVudC5cbiAgLy8gSWYgeW91IGRvbid0IHBhc3MgYW4gZXhwbGljaXQgYXJndW1lbnQsIHdlJ2xsIGFzc3VtZSBpdCdzIHRoZSBzYW1lIGFzIHRoZSBpZGVudGlmaWVyLlxuICAvLyBlZztcdGBzZXQgY29sb3I6IHNldCB0aGUgY29sb3Igb2YgbXkgdGV4dCB0byBjb2xvcmBcbiAgLy9cbiAgLy8gVE9ETzogaW50ZXJuYWwgZ2V0dGVyL3NldHRlciBzZW1hbnRpY3MgYWxhIG9iamVjdGl2ZSBDXG4gIC8vXHRcdFx0YHNldCBjb2xvcjogaWYgY29sb3IgaXMgaW4gW1wicmVkXCIsIFwiYmx1ZVwiXSB0aGVuIHNldCBteSBjb2xvciB0byBjb2xvcmBcbiAgLy9cdFx0ID0+IGBteSBjb2xvcmAgd2l0aGluIHNldHRlciBzaG91bGQgYXV0b21hdGljYWxseSB0cmFuc2xhdGUgdG8gYHRoaXMuX2NvbG9yYCA/Pz9cbiAgLy8gVE9ETzogYHRvIHNldC4uLmAgP1xuICB7XG4gICAgbmFtZTogXCJzZXR0ZXJcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJzZXQge25hbWU6aWRlbnRpZmllcn0ge2FyZ3N9PyAoXFxcXDopPyB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgc2V0dGVyIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgLy8gZGVmYXVsdCBhcmdzIHRvIHRoZSBzZXR0ZXIgbmFtZVxuICAgICAgICBsZXQgeyBuYW1lLCBhcmdzID0gbmFtZSwgc3RhdGVtZW50cyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICAvLyBDb21wbGFpbiBpZiBtb3JlIHRoYW4gb25lIGFyZ3VtZW50XG4gICAgICAgIGlmIChhcmdzICYmIGFyZ3MuaW5jbHVkZXMoXCIsXCIpKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwicGFyc2UoJ3NldHRlcicpOiBvbmx5IG9uZSBhcmd1bWVudCBhbGxvd2VkIGluIHNldHRlcjogIFwiLCBhcmdzKTtcbiAgICAgICAgICBhcmdzID0gYXJncy50cmltKCkuc3BsaXQoXCIsXCIpWzBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgc2V0ICR7bmFtZX0oJHthcmdzfSkgJHtzdGF0ZW1lbnRzfWA7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlXG4gICAgICB0b1N0cnVjdHVyZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcInByb3BlcnR5XCIsIHN1YlR5cGU6IFwic2V0dGVyXCIsIG5hbWUgfVxuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudHNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICAvLyBubyBib2R5XG4gICAgICAgICAgW1wic2V0IGNvbG9yXCIsIFwic2V0IGNvbG9yKGNvbG9yKSB7fVwiXSxcbiAgICAgICAgICBbXCJzZXQgY29sb3I6XCIsIFwic2V0IGNvbG9yKGNvbG9yKSB7fVwiXSxcbiAgICAgICAgICBbXCJzZXQgY29sb3Igd2l0aCBjdWxyXCIsIFwic2V0IGNvbG9yKGN1bHIpIHt9XCJdLFxuICAgICAgICAgIFtcInNldCBjb2xvciB3aXRoIGN1bHI6XCIsIFwic2V0IGNvbG9yKGN1bHIpIHt9XCJdLFxuICAgICAgICAgIC8vIGlubGluZSBmb3JtXG4gICAgICAgICAgW1wic2V0IGNvbG9yIHNldCB0aGUgY29sb3Igb2YgbXkgdGV4dCB0byBjb2xvclwiLCBcInNldCBjb2xvcihjb2xvcikgeyB0aGlzLnRleHQuY29sb3IgPSBjb2xvciB9XCJdLFxuICAgICAgICAgIFtcInNldCBjb2xvcjogc2V0IHRoZSBjb2xvciBvZiBteSB0ZXh0IHRvIGNvbG9yXCIsIFwic2V0IGNvbG9yKGNvbG9yKSB7IHRoaXMudGV4dC5jb2xvciA9IGNvbG9yIH1cIl0sXG4gICAgICAgICAgW1wic2V0IGNvbG9yIHdpdGggY3VsciBzZXQgdGhlIGNvbG9yIG9mIG15IHRleHQgdG8gY3VsclwiLCBcInNldCBjb2xvcihjdWxyKSB7IHRoaXMudGV4dC5jb2xvciA9IGN1bHIgfVwiXSxcbiAgICAgICAgICBbXCJzZXQgY29sb3Igd2l0aCBjdWxyOiBzZXQgdGhlIGNvbG9yIG9mIG15IHRleHQgdG8gY3VsclwiLCBcInNldCBjb2xvcihjdWxyKSB7IHRoaXMudGV4dC5jb2xvciA9IGN1bHIgfVwiXSxcbiAgICAgICAgICAvLyBuZXN0ZWQgYmxvY2sgZm9ybVxuICAgICAgICAgIFtcInNldCBjb2xvclxcblxcdHNldCB0aGUgY29sb3Igb2YgbXkgdGV4dCB0byBjb2xvclwiLCBcInNldCBjb2xvcihjb2xvcikge1xcblxcdHRoaXMudGV4dC5jb2xvciA9IGNvbG9yXFxufVwiXSxcbiAgICAgICAgICBbXCJzZXQgY29sb3I6XFxuXFx0c2V0IHRoZSBjb2xvciBvZiBteSB0ZXh0IHRvIGNvbG9yXCIsIFwic2V0IGNvbG9yKGNvbG9yKSB7XFxuXFx0dGhpcy50ZXh0LmNvbG9yID0gY29sb3JcXG59XCJdLFxuICAgICAgICAgIFtcInNldCBjb2xvciB3aXRoIGN1bHJcXG5cXHRzZXQgdGhlIGNvbG9yIG9mIG15IHRleHQgdG8gY3VsclwiLCBcInNldCBjb2xvcihjdWxyKSB7XFxuXFx0dGhpcy50ZXh0LmNvbG9yID0gY3Vsclxcbn1cIl0sXG4gICAgICAgICAgW1wic2V0IGNvbG9yIHdpdGggY3VscjpcXG5cXHRzZXQgdGhlIGNvbG9yIG9mIG15IHRleHQgdG8gY3VsclwiLCBcInNldCBjb2xvcihjdWxyKSB7XFxuXFx0dGhpcy50ZXh0LmNvbG9yID0gY3Vsclxcbn1cIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIC8vIERlY2xhcmUgaW5zdGFuY2UgbWV0aG9kIG9yIG5vcm1hbCBmdW5jdGlvbi5cbiAgLy8gVE9ETzogc3RhdGljL2V0Y1xuICB7XG4gICAgbmFtZTogXCJkZWNsYXJlX21ldGhvZFwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcIihvcGVyYXRvcjp0b3xvbikge25hbWU6aWRlbnRpZmllcn0ge2FyZ3N9PyAoXFxcXDopPyB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVjbGFyZV9tZXRob2QgZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIC8vIFJldHVybiBhIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlXG4gICAgICB0b1N0cnVjdHVyZSgpIHtcbiAgICAgICAgbGV0IHsgb3BlcmF0b3IsIG5hbWUsIGFyZ3MgPSBbXX0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIGxldCBzdWJUeXBlID0gKG9wZXJhdG9yID09PSBcInRvXCIgPyBcIm1ldGhvZFwiIDogXCJldmVudFwiKTtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJmdW5jdGlvblwiLCBzdWJUeXBlLCBuYW1lLCBhcmdzIH07XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBuYW1lLCBhcmdzID0gXCJcIiwgc3RhdGVtZW50cyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYCR7bmFtZX0oJHthcmdzfSkgJHtzdGF0ZW1lbnRzfWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50c1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIm9uIGZvb1wiLCBcImZvbygpIHt9XCJdLFxuICAgICAgICAgIFtcInRvIGZvb1wiLCBcImZvbygpIHt9XCJdLFxuICAgICAgICAgIFtcInRvIGZvbzpcIiwgXCJmb28oKSB7fVwiXSxcbiAgICAgICAgICBbXCJ0byBmb28gd2l0aCBhXCIsIFwiZm9vKGEpIHt9XCJdLFxuICAgICAgICAgIFtcInRvIGZvbyB3aXRoIGEsIGJcIiwgXCJmb28oYSwgYikge31cIl0sXG4gICAgICAgICAgW1widG8gZm9vIHdpdGggYSxiLGNcIiwgXCJmb28oYSwgYiwgYykge31cIl0sXG4gICAgICAgICAgW1widG8gZm9vIGEgPSB5ZXNcIiwgXCJmb28oKSB7IGEgPSB0cnVlIH1cIl0sXG4gICAgICAgICAgW1widG8gZm9vOiBhID0geWVzXCIsIFwiZm9vKCkgeyBhID0gdHJ1ZSB9XCJdLFxuICAgICAgICAgIFtcInRvIGZvbyB3aXRoIGE6IGEgPSB5ZXNcIiwgXCJmb28oYSkgeyBhID0gdHJ1ZSB9XCJdLFxuICAgICAgICAgIFtcInRvIGZvb1xcblxcdGEgPSB5ZXNcIiwgXCJmb28oKSB7XFxuXFx0YSA9IHRydWVcXG59XCJdLFxuICAgICAgICAgIFtcInRvIGZvbyB3aXRoIGEsIGJcXG5cXHRhID0geWVzXFxuXFx0YiA9IG5vXCIsIFwiZm9vKGEsIGIpIHtcXG5cXHRhID0gdHJ1ZVxcblxcdGIgPSBmYWxzZVxcbn1cIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuXG4gIH0sXG5cbiAgLy8gRGVjbGFyZSBcImFjdGlvblwiLCB3aGljaCBjYW4gYmUgY2FsbGVkIGdsb2JhbGx5IGFuZCBhZmZlY3RzIHRoZSBwYXJzZXIuXG4gIC8vIFRPRE86IGB0dXJuIGEgY2FyZCBvdmVyYFxuICAvLyBUT0RPOiB7a2V5d29yZDp7aWRlbnRpZmllcn0gKGtleXdvcmRzOih7d29yZH18e3R5cGV9KT8pXG4gIC8vIFRPRE86IGB3aXRoYCBjbGF1c2UgKHdpbGwgY29uZmxpY3Qgd2l0aCBgd29yZGApXG4gIC8vIFRPRE86IGluc3RhbGwgdGhlIGFjdGlvbiBhcyBhIHNwZWNpYWwgaW4gdGhlIHBhcnNlciBzb21laG93XG4gIC8vIFRPRE86IGNyZWF0ZSBpbnN0YW5jZSBmdW5jdGlvbj8gIG9yIG1heWJlIHdlIGRvbid0IG5lZWQgaXQ6XG4gIC8vXHRcdFx0YGFjdGlvbiB0dXJuIENhcmQgb3ZlcmAgZm9yIGFuIGluc3RhbmNlIGlzIGp1c3QgYHR1cm4gbWUgb3ZlcmBcbiAgLy9cdFx0XHRgYWN0aW9uIGFkZCBjYXJkIHRvIGRlY2tgID0+IGBhZGQgbWUgdG8gZGVja2BcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwiZGVjbGFyZV9hY3Rpb25cIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJhY3Rpb24gKGtleXdvcmRzOnt3b3JkfXx7dHlwZX0pKyBcXFxcOiB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVjbGFyZV9hY3Rpb24gZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIC8vIEFkZCBgbmFtZWAsIGBhcmdzYCBhbmQgYHR5cGVzYCB0byBtYXRjaGVkIHNvdXJjZVxuICAgICAgZ2V0IHJlc3VsdHMoKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBzdXBlci5yZXN1bHRzO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlJ3Mgb25seSBvbmUga2V5d29yZCwgaXQgY2FuJ3QgYmUgYSB0eXBlIG9yIGEgYmxhY2tsaXN0ZWQgaWRlbnRpZmllclxuICAgICAgICBjb25zdCB7IGtleXdvcmRzIH0gPSByZXN1bHRzO1xuICAgICAgICBjb25zdCBfa2V5d29yZHMgPSByZXN1bHRzLl9rZXl3b3Jkcy5tYXRjaGVkO1xuICAgICAgICBpZiAoX2tleXdvcmRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIGNvbnN0IGtleXdvcmQgPSBrZXl3b3Jkc1swXTtcbiAgICAgICAgICBpZiAoX2tleXdvcmRzWzBdIGluc3RhbmNlb2YgUnVsZS5UeXBlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBwYXJzZSgnZGVjbGFyZV9hY3Rpb24nKTogb25lLXdvcmQgYWN0aW9ucyBtYXkgbm90IGJlIHR5cGVzOiAke2tleXdvcmR9YCk7XG4gICAgICAgICAgfVxuICAvLyBUT0RPLi4uXG4gICAgICAgIC8vICAgbGV0IHBhcnNlciA9IChjb250ZXh0ICYmIGNvbnRleHQucGFyc2VyKSB8fCBnbG9iYWwucGFyc2VyO1xuICAgICAgICAvLyAgIGxldCBibGFja2xpc3QgPSBwYXJzZXIuZ2V0QmxhY2tsaXN0KFwiaWRlbnRpZmllclwiKTtcbiAgICAgICAgLy8gICBpZiAoYmxhY2tsaXN0W2tleXdvcmRdKSB7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmVycm9yKGBwYXJzZSgnZGVjbGFyZV9hY3Rpb24nKTogb25lLXdvcmQgYWN0aW9ucyBtYXkgbm90IGJlIGJsYWNrbGlzdGVkIGlkZW50aWZpZXJzXCI6ICR7a2V5d29yZH1gKTtcbiAgICAgICAgLy8gICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmaWd1cmUgb3V0IGFyZ3VtZW50cyBhbmQvb3IgdHlwZXNcbiAgICAgICAgcmVzdWx0cy5hcmdzID0gW107XG4gICAgICAgIHJlc3VsdHMudHlwZXMgPSB7fTtcblxuICAgICAgICAvLyBpZiBhbnkgb2YgdGhlIHdvcmRzIGFyZSB0eXBlcyAoY2FwaXRhbCBsZXR0ZXIpIG1ha2UgdGhhdCBhbiBhcmd1bWVudCBvZiB0aGUgc2FtZSBuYW1lLlxuICAgICAgICBfa2V5d29yZHMubWFwKCAoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIFJ1bGUuVHlwZSkge1xuICAgICAgICAgICAgbGV0IFR5cGUgPSBrZXl3b3Jkc1tpbmRleF07XG4gICAgICAgICAgICBsZXQgdHlwZSA9IFR5cGUudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgcmVzdWx0cy50eXBlc1t0eXBlXSA9IFR5cGU7XG4gICAgICAgICAgICByZXN1bHRzLmFyZ3MucHVzaCh0eXBlKTtcblxuICAgICAgICAgICAgLy8gcmVwbGFjZSB3aXRoIGxvd2VyY2FzZSBpbiBtZXRob2QgbmFtZVxuICAgICAgICAgICAga2V5d29yZHNbaW5kZXhdID0gdHlwZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBnZXQgc3RhdGljIG1ldGhvZCBuYW1lIGFuZCBhcmd1bWVudHMgZm9yIHJlc3VsdHNcbiAgICAgICAgcmVzdWx0cy5uYW1lID0ga2V5d29yZHMuam9pbihcIl9cIik7XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgfVxuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgYXJncyA9IFtdLCB0eXBlcywgc3RhdGVtZW50cyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICAvLyBmaWd1cmUgb3V0IGlmIHRoZXJlIGFyZSBhbnkgY29uZGl0aW9ucyBkdWUgdG8ga25vd24gYXJndW1lbnQgdHlwZXNcbi8vICAgICAgICAgbGV0IGNvbmRpdGlvbnMgPSBbXTtcbi8vICAgICAgICAgZm9yIChsZXQgYXJnIGluIHR5cGVzKSB7XG4vLyAgICAgICAgICAgY29uZGl0aW9ucy5wdXNoKGBcXHRpZiAoIXNwZWxsLmlzQSgke2FyZ30sICR7dHlwZXNbYXJnXX0pKSByZXR1cm4gdW5kZWZpbmVkYCk7XG4vLyAgICAgICAgIH1cbiAgICAgICAgLy8gQ3JlYXRlIGFzIGEgU1RBVElDIGZ1bmN0aW9uXG4gICAgICAgIHJldHVybiBgc3RhdGljICR7bmFtZX0oJHthcmdzLmpvaW4oXCIsIFwiKX0pICR7c3RhdGVtZW50c31gO1xuICAgICAgfVxuXG4gICAgICB0b1N0cnVjdHVyZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgYXJncywgdHlwZXMgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJmdW5jdGlvblwiLCBzdWJUeXBlOiBcImFjdGlvblwiLCBuYW1lLCBhcmdzLCB0eXBlcyB9XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50c1wiLFxuICAgICAgICBzaG93QWxsOiB0cnVlLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImFjdGlvbiB0dXJuIENhcmQgb3ZlcjpcIiwgXCJzdGF0aWMgdHVybl9jYXJkX292ZXIoY2FyZCkge31cIl0sXG4gICAgICAgICAgW1wiYWN0aW9uIGFkZCBDYXJkIHRvIFBpbGU6XCIsIFwic3RhdGljIGFkZF9jYXJkX3RvX3BpbGUoY2FyZCwgcGlsZSkge31cIl0sXG5cbiAgICAgICAgICBbXCJhY3Rpb24gdHVybiBDYXJkIG92ZXI6IHNldCB0aGUgZGlyZWN0aW9uIG9mIHRoZSBjYXJkIHRvICd1cCdcIiwgXCJzdGF0aWMgdHVybl9jYXJkX292ZXIoY2FyZCkgeyBjYXJkLmRpcmVjdGlvbiA9ICd1cCcgfVwiXSxcbiAgICAgICAgICBbXCJhY3Rpb24gdHVybiBDYXJkIG92ZXI6XFxuXFx0c2V0IHRoZSBkaXJlY3Rpb24gb2YgdGhlIGNhcmQgdG8gJ3VwJ1wiLCBcInN0YXRpYyB0dXJuX2NhcmRfb3ZlcihjYXJkKSB7XFxuXFx0Y2FyZC5kaXJlY3Rpb24gPSAndXAnXFxufVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG5cbiAgfSxcblxuKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ydWxlcy9zcGVsbC90eXBlcy5qcyIsInJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN5bWJvbCcpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL19jb3JlJykuU3ltYm9sO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvZXM2L3N5bWJvbC5qc1xuLy8gbW9kdWxlIGlkID0gNTAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICh0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJykgdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2EtZnVuY3Rpb24uanNcbi8vIG1vZHVsZSBpZCA9IDU0N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBmYWxzZSAtPiBBcnJheSNpbmRleE9mXG4vLyB0cnVlICAtPiBBcnJheSNpbmNsdWRlc1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpO1xudmFyIHRvQWJzb2x1dGVJbmRleCA9IHJlcXVpcmUoJy4vX3RvLWFic29sdXRlLWluZGV4Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChJU19JTkNMVURFUykge1xuICByZXR1cm4gZnVuY3Rpb24gKCR0aGlzLCBlbCwgZnJvbUluZGV4KSB7XG4gICAgdmFyIE8gPSB0b0lPYmplY3QoJHRoaXMpO1xuICAgIHZhciBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgdmFyIGluZGV4ID0gdG9BYnNvbHV0ZUluZGV4KGZyb21JbmRleCwgbGVuZ3RoKTtcbiAgICB2YXIgdmFsdWU7XG4gICAgLy8gQXJyYXkjaW5jbHVkZXMgdXNlcyBTYW1lVmFsdWVaZXJvIGVxdWFsaXR5IGFsZ29yaXRobVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICBpZiAoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpIHdoaWxlIChsZW5ndGggPiBpbmRleCkge1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgaWYgKHZhbHVlICE9IHZhbHVlKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBBcnJheSNpbmRleE9mIGlnbm9yZXMgaG9sZXMsIEFycmF5I2luY2x1ZGVzIC0gbm90XG4gICAgfSBlbHNlIGZvciAoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKSBpZiAoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTykge1xuICAgICAgaWYgKE9baW5kZXhdID09PSBlbCkgcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4IHx8IDA7XG4gICAgfSByZXR1cm4gIUlTX0lOQ0xVREVTICYmIC0xO1xuICB9O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2FycmF5LWluY2x1ZGVzLmpzXG4vLyBtb2R1bGUgaWQgPSA1NDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gZ2V0dGluZyB0YWcgZnJvbSAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbnZhciBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcbi8vIEVTMyB3cm9uZyBoZXJlXG52YXIgQVJHID0gY29mKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnQXJndW1lbnRzJztcblxuLy8gZmFsbGJhY2sgZm9yIElFMTEgU2NyaXB0IEFjY2VzcyBEZW5pZWQgZXJyb3JcbnZhciB0cnlHZXQgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICB0cnkge1xuICAgIHJldHVybiBpdFtrZXldO1xuICB9IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHZhciBPLCBULCBCO1xuICByZXR1cm4gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogaXQgPT09IG51bGwgPyAnTnVsbCdcbiAgICAvLyBAQHRvU3RyaW5nVGFnIGNhc2VcbiAgICA6IHR5cGVvZiAoVCA9IHRyeUdldChPID0gT2JqZWN0KGl0KSwgVEFHKSkgPT0gJ3N0cmluZycgPyBUXG4gICAgLy8gYnVpbHRpblRhZyBjYXNlXG4gICAgOiBBUkcgPyBjb2YoTylcbiAgICAvLyBFUzMgYXJndW1lbnRzIGZhbGxiYWNrXG4gICAgOiAoQiA9IGNvZihPKSkgPT0gJ09iamVjdCcgJiYgdHlwZW9mIE8uY2FsbGVlID09ICdmdW5jdGlvbicgPyAnQXJndW1lbnRzJyA6IEI7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fY2xhc3NvZi5qc1xuLy8gbW9kdWxlIGlkID0gNTQ5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuLCB0aGF0LCBsZW5ndGgpIHtcbiAgYUZ1bmN0aW9uKGZuKTtcbiAgaWYgKHRoYXQgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZuO1xuICBzd2l0Y2ggKGxlbmd0aCkge1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uIChhKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiAoLyogLi4uYXJncyAqLykge1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2N0eC5qc1xuLy8gbW9kdWxlIGlkID0gNTUwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDcuMi4xIFJlcXVpcmVPYmplY3RDb2VyY2libGUoYXJndW1lbnQpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoaXQgPT0gdW5kZWZpbmVkKSB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzXG4vLyBtb2R1bGUgaWQgPSA1NTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gYWxsIGVudW1lcmFibGUgb2JqZWN0IGtleXMsIGluY2x1ZGVzIHN5bWJvbHNcbnZhciBnZXRLZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcbnZhciBnT1BTID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcHMnKTtcbnZhciBwSUUgPSByZXF1aXJlKCcuL19vYmplY3QtcGllJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgcmVzdWx0ID0gZ2V0S2V5cyhpdCk7XG4gIHZhciBnZXRTeW1ib2xzID0gZ09QUy5mO1xuICBpZiAoZ2V0U3ltYm9scykge1xuICAgIHZhciBzeW1ib2xzID0gZ2V0U3ltYm9scyhpdCk7XG4gICAgdmFyIGlzRW51bSA9IHBJRS5mO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIga2V5O1xuICAgIHdoaWxlIChzeW1ib2xzLmxlbmd0aCA+IGkpIGlmIChpc0VudW0uY2FsbChpdCwga2V5ID0gc3ltYm9sc1tpKytdKSkgcmVzdWx0LnB1c2goa2V5KTtcbiAgfSByZXR1cm4gcmVzdWx0O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2VudW0ta2V5cy5qc1xuLy8gbW9kdWxlIGlkID0gNTUyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuL19yZWRlZmluZScpO1xudmFyIGN0eCA9IHJlcXVpcmUoJy4vX2N0eCcpO1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG52YXIgJGV4cG9ydCA9IGZ1bmN0aW9uICh0eXBlLCBuYW1lLCBzb3VyY2UpIHtcbiAgdmFyIElTX0ZPUkNFRCA9IHR5cGUgJiAkZXhwb3J0LkY7XG4gIHZhciBJU19HTE9CQUwgPSB0eXBlICYgJGV4cG9ydC5HO1xuICB2YXIgSVNfU1RBVElDID0gdHlwZSAmICRleHBvcnQuUztcbiAgdmFyIElTX1BST1RPID0gdHlwZSAmICRleHBvcnQuUDtcbiAgdmFyIElTX0JJTkQgPSB0eXBlICYgJGV4cG9ydC5CO1xuICB2YXIgdGFyZ2V0ID0gSVNfR0xPQkFMID8gZ2xvYmFsIDogSVNfU1RBVElDID8gZ2xvYmFsW25hbWVdIHx8IChnbG9iYWxbbmFtZV0gPSB7fSkgOiAoZ2xvYmFsW25hbWVdIHx8IHt9KVtQUk9UT1RZUEVdO1xuICB2YXIgZXhwb3J0cyA9IElTX0dMT0JBTCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pO1xuICB2YXIgZXhwUHJvdG8gPSBleHBvcnRzW1BST1RPVFlQRV0gfHwgKGV4cG9ydHNbUFJPVE9UWVBFXSA9IHt9KTtcbiAgdmFyIGtleSwgb3duLCBvdXQsIGV4cDtcbiAgaWYgKElTX0dMT0JBTCkgc291cmNlID0gbmFtZTtcbiAgZm9yIChrZXkgaW4gc291cmNlKSB7XG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXG4gICAgb3duID0gIUlTX0ZPUkNFRCAmJiB0YXJnZXQgJiYgdGFyZ2V0W2tleV0gIT09IHVuZGVmaW5lZDtcbiAgICAvLyBleHBvcnQgbmF0aXZlIG9yIHBhc3NlZFxuICAgIG91dCA9IChvd24gPyB0YXJnZXQgOiBzb3VyY2UpW2tleV07XG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICBleHAgPSBJU19CSU5EICYmIG93biA/IGN0eChvdXQsIGdsb2JhbCkgOiBJU19QUk9UTyAmJiB0eXBlb2Ygb3V0ID09ICdmdW5jdGlvbicgPyBjdHgoRnVuY3Rpb24uY2FsbCwgb3V0KSA6IG91dDtcbiAgICAvLyBleHRlbmQgZ2xvYmFsXG4gICAgaWYgKHRhcmdldCkgcmVkZWZpbmUodGFyZ2V0LCBrZXksIG91dCwgdHlwZSAmICRleHBvcnQuVSk7XG4gICAgLy8gZXhwb3J0XG4gICAgaWYgKGV4cG9ydHNba2V5XSAhPSBvdXQpIGhpZGUoZXhwb3J0cywga2V5LCBleHApO1xuICAgIGlmIChJU19QUk9UTyAmJiBleHBQcm90b1trZXldICE9IG91dCkgZXhwUHJvdG9ba2V5XSA9IG91dDtcbiAgfVxufTtcbmdsb2JhbC5jb3JlID0gY29yZTtcbi8vIHR5cGUgYml0bWFwXG4kZXhwb3J0LkYgPSAxOyAgIC8vIGZvcmNlZFxuJGV4cG9ydC5HID0gMjsgICAvLyBnbG9iYWxcbiRleHBvcnQuUyA9IDQ7ICAgLy8gc3RhdGljXG4kZXhwb3J0LlAgPSA4OyAgIC8vIHByb3RvXG4kZXhwb3J0LkIgPSAxNjsgIC8vIGJpbmRcbiRleHBvcnQuVyA9IDMyOyAgLy8gd3JhcFxuJGV4cG9ydC5VID0gNjQ7ICAvLyBzYWZlXG4kZXhwb3J0LlIgPSAxMjg7IC8vIHJlYWwgcHJvdG8gbWV0aG9kIGZvciBgbGlicmFyeWBcbm1vZHVsZS5leHBvcnRzID0gJGV4cG9ydDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qc1xuLy8gbW9kdWxlIGlkID0gNTUzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkb2N1bWVudCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50O1xubW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19odG1sLmpzXG4vLyBtb2R1bGUgaWQgPSA1NTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3NcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0KCd6JykucHJvcGVydHlJc0VudW1lcmFibGUoMCkgPyBPYmplY3QgOiBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2lvYmplY3QuanNcbi8vIG1vZHVsZSBpZCA9IDU1NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyA3LjIuMiBJc0FycmF5KGFyZ3VtZW50KVxudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIGlzQXJyYXkoYXJnKSB7XG4gIHJldHVybiBjb2YoYXJnKSA9PSAnQXJyYXknO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2lzLWFycmF5LmpzXG4vLyBtb2R1bGUgaWQgPSA1NTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIE1FVEEgPSByZXF1aXJlKCcuL191aWQnKSgnbWV0YScpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgc2V0RGVzYyA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmY7XG52YXIgaWQgPSAwO1xudmFyIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdHJ1ZTtcbn07XG52YXIgRlJFRVpFID0gIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gaXNFeHRlbnNpYmxlKE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyh7fSkpO1xufSk7XG52YXIgc2V0TWV0YSA9IGZ1bmN0aW9uIChpdCkge1xuICBzZXREZXNjKGl0LCBNRVRBLCB7IHZhbHVlOiB7XG4gICAgaTogJ08nICsgKytpZCwgLy8gb2JqZWN0IElEXG4gICAgdzoge30gICAgICAgICAgLy8gd2VhayBjb2xsZWN0aW9ucyBJRHNcbiAgfSB9KTtcbn07XG52YXIgZmFzdEtleSA9IGZ1bmN0aW9uIChpdCwgY3JlYXRlKSB7XG4gIC8vIHJldHVybiBwcmltaXRpdmUgd2l0aCBwcmVmaXhcbiAgaWYgKCFpc09iamVjdChpdCkpIHJldHVybiB0eXBlb2YgaXQgPT0gJ3N5bWJvbCcgPyBpdCA6ICh0eXBlb2YgaXQgPT0gJ3N0cmluZycgPyAnUycgOiAnUCcpICsgaXQ7XG4gIGlmICghaGFzKGl0LCBNRVRBKSkge1xuICAgIC8vIGNhbid0IHNldCBtZXRhZGF0YSB0byB1bmNhdWdodCBmcm96ZW4gb2JqZWN0XG4gICAgaWYgKCFpc0V4dGVuc2libGUoaXQpKSByZXR1cm4gJ0YnO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIG1ldGFkYXRhXG4gICAgaWYgKCFjcmVhdGUpIHJldHVybiAnRSc7XG4gICAgLy8gYWRkIG1pc3NpbmcgbWV0YWRhdGFcbiAgICBzZXRNZXRhKGl0KTtcbiAgLy8gcmV0dXJuIG9iamVjdCBJRFxuICB9IHJldHVybiBpdFtNRVRBXS5pO1xufTtcbnZhciBnZXRXZWFrID0gZnVuY3Rpb24gKGl0LCBjcmVhdGUpIHtcbiAgaWYgKCFoYXMoaXQsIE1FVEEpKSB7XG4gICAgLy8gY2FuJ3Qgc2V0IG1ldGFkYXRhIHRvIHVuY2F1Z2h0IGZyb3plbiBvYmplY3RcbiAgICBpZiAoIWlzRXh0ZW5zaWJsZShpdCkpIHJldHVybiB0cnVlO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIG1ldGFkYXRhXG4gICAgaWYgKCFjcmVhdGUpIHJldHVybiBmYWxzZTtcbiAgICAvLyBhZGQgbWlzc2luZyBtZXRhZGF0YVxuICAgIHNldE1ldGEoaXQpO1xuICAvLyByZXR1cm4gaGFzaCB3ZWFrIGNvbGxlY3Rpb25zIElEc1xuICB9IHJldHVybiBpdFtNRVRBXS53O1xufTtcbi8vIGFkZCBtZXRhZGF0YSBvbiBmcmVlemUtZmFtaWx5IG1ldGhvZHMgY2FsbGluZ1xudmFyIG9uRnJlZXplID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmIChGUkVFWkUgJiYgbWV0YS5ORUVEICYmIGlzRXh0ZW5zaWJsZShpdCkgJiYgIWhhcyhpdCwgTUVUQSkpIHNldE1ldGEoaXQpO1xuICByZXR1cm4gaXQ7XG59O1xudmFyIG1ldGEgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgS0VZOiBNRVRBLFxuICBORUVEOiBmYWxzZSxcbiAgZmFzdEtleTogZmFzdEtleSxcbiAgZ2V0V2VhazogZ2V0V2VhayxcbiAgb25GcmVlemU6IG9uRnJlZXplXG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fbWV0YS5qc1xuLy8gbW9kdWxlIGlkID0gNTU3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgZFBzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwcycpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpO1xudmFyIElFX1BST1RPID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpO1xudmFyIEVtcHR5ID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggZmFrZSBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXG52YXIgY3JlYXRlRGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gVGhyYXNoLCB3YXN0ZSBhbmQgc29kb215OiBJRSBHQyBidWdcbiAgdmFyIGlmcmFtZSA9IHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnaWZyYW1lJyk7XG4gIHZhciBpID0gZW51bUJ1Z0tleXMubGVuZ3RoO1xuICB2YXIgbHQgPSAnPCc7XG4gIHZhciBndCA9ICc+JztcbiAgdmFyIGlmcmFtZURvY3VtZW50O1xuICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgcmVxdWlyZSgnLi9faHRtbCcpLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZS5zcmMgPSAnamF2YXNjcmlwdDonOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNjcmlwdC11cmxcbiAgLy8gY3JlYXRlRGljdCA9IGlmcmFtZS5jb250ZW50V2luZG93Lk9iamVjdDtcbiAgLy8gaHRtbC5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICBpZnJhbWVEb2N1bWVudCA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICBpZnJhbWVEb2N1bWVudC5vcGVuKCk7XG4gIGlmcmFtZURvY3VtZW50LndyaXRlKGx0ICsgJ3NjcmlwdCcgKyBndCArICdkb2N1bWVudC5GPU9iamVjdCcgKyBsdCArICcvc2NyaXB0JyArIGd0KTtcbiAgaWZyYW1lRG9jdW1lbnQuY2xvc2UoKTtcbiAgY3JlYXRlRGljdCA9IGlmcmFtZURvY3VtZW50LkY7XG4gIHdoaWxlIChpLS0pIGRlbGV0ZSBjcmVhdGVEaWN0W1BST1RPVFlQRV1bZW51bUJ1Z0tleXNbaV1dO1xuICByZXR1cm4gY3JlYXRlRGljdCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIGNyZWF0ZShPLCBQcm9wZXJ0aWVzKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmIChPICE9PSBudWxsKSB7XG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IGFuT2JqZWN0KE8pO1xuICAgIHJlc3VsdCA9IG5ldyBFbXB0eSgpO1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBudWxsO1xuICAgIC8vIGFkZCBcIl9fcHJvdG9fX1wiIGZvciBPYmplY3QuZ2V0UHJvdG90eXBlT2YgcG9seWZpbGxcbiAgICByZXN1bHRbSUVfUFJPVE9dID0gTztcbiAgfSBlbHNlIHJlc3VsdCA9IGNyZWF0ZURpY3QoKTtcbiAgcmV0dXJuIFByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IGRQcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1jcmVhdGUuanNcbi8vIG1vZHVsZSBpZCA9IDU1OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGdldEtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcykge1xuICBhbk9iamVjdChPKTtcbiAgdmFyIGtleXMgPSBnZXRLZXlzKFByb3BlcnRpZXMpO1xuICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gIHZhciBpID0gMDtcbiAgdmFyIFA7XG4gIHdoaWxlIChsZW5ndGggPiBpKSBkUC5mKE8sIFAgPSBrZXlzW2krK10sIFByb3BlcnRpZXNbUF0pO1xuICByZXR1cm4gTztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHBzLmpzXG4vLyBtb2R1bGUgaWQgPSA1NTlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHBJRSA9IHJlcXVpcmUoJy4vX29iamVjdC1waWUnKTtcbnZhciBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKTtcbnZhciBnT1BEID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGdPUEQgOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUCkge1xuICBPID0gdG9JT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gZ09QRChPLCBQKTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG4gIGlmIChoYXMoTywgUCkpIHJldHVybiBjcmVhdGVEZXNjKCFwSUUuZi5jYWxsKE8sIFApLCBPW1BdKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wZC5qc1xuLy8gbW9kdWxlIGlkID0gNTYwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGZhbGxiYWNrIGZvciBJRTExIGJ1Z2d5IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHdpdGggaWZyYW1lIGFuZCB3aW5kb3dcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgZ09QTiA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BuJykuZjtcbnZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG52YXIgd2luZG93TmFtZXMgPSB0eXBlb2Ygd2luZG93ID09ICdvYmplY3QnICYmIHdpbmRvdyAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc1xuICA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHdpbmRvdykgOiBbXTtcblxudmFyIGdldFdpbmRvd05hbWVzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGdPUE4oaXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHdpbmRvd05hbWVzLnNsaWNlKCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLmYgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KSB7XG4gIHJldHVybiB3aW5kb3dOYW1lcyAmJiB0b1N0cmluZy5jYWxsKGl0KSA9PSAnW29iamVjdCBXaW5kb3ddJyA/IGdldFdpbmRvd05hbWVzKGl0KSA6IGdPUE4odG9JT2JqZWN0KGl0KSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcG4tZXh0LmpzXG4vLyBtb2R1bGUgaWQgPSA1NjFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRlZiA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmY7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCB0YWcsIHN0YXQpIHtcbiAgaWYgKGl0ICYmICFoYXMoaXQgPSBzdGF0ID8gaXQgOiBpdC5wcm90b3R5cGUsIFRBRykpIGRlZihpdCwgVEFHLCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHRhZyB9KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19zZXQtdG8tc3RyaW5nLXRhZy5qc1xuLy8gbW9kdWxlIGlkID0gNTYyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJyk7XG52YXIgbWF4ID0gTWF0aC5tYXg7XG52YXIgbWluID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbmRleCwgbGVuZ3RoKSB7XG4gIGluZGV4ID0gdG9JbnRlZ2VyKGluZGV4KTtcbiAgcmV0dXJuIGluZGV4IDwgMCA/IG1heChpbmRleCArIGxlbmd0aCwgMCkgOiBtaW4oaW5kZXgsIGxlbmd0aCk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tYWJzb2x1dGUtaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDU2M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyA3LjEuMTUgVG9MZW5ndGhcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJyk7XG52YXIgbWluID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3RvLWxlbmd0aC5qc1xuLy8gbW9kdWxlIGlkID0gNTY0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIExJQlJBUlkgPSByZXF1aXJlKCcuL19saWJyYXJ5Jyk7XG52YXIgd2tzRXh0ID0gcmVxdWlyZSgnLi9fd2tzLWV4dCcpO1xudmFyIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgdmFyICRTeW1ib2wgPSBjb3JlLlN5bWJvbCB8fCAoY29yZS5TeW1ib2wgPSBMSUJSQVJZID8ge30gOiBnbG9iYWwuU3ltYm9sIHx8IHt9KTtcbiAgaWYgKG5hbWUuY2hhckF0KDApICE9ICdfJyAmJiAhKG5hbWUgaW4gJFN5bWJvbCkpIGRlZmluZVByb3BlcnR5KCRTeW1ib2wsIG5hbWUsIHsgdmFsdWU6IHdrc0V4dC5mKG5hbWUpIH0pO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3drcy1kZWZpbmUuanNcbi8vIG1vZHVsZSBpZCA9IDU2NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG4vLyAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjbGFzc29mID0gcmVxdWlyZSgnLi9fY2xhc3NvZicpO1xudmFyIHRlc3QgPSB7fTtcbnRlc3RbcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyldID0gJ3onO1xuaWYgKHRlc3QgKyAnJyAhPSAnW29iamVjdCB6XScpIHtcbiAgcmVxdWlyZSgnLi9fcmVkZWZpbmUnKShPYmplY3QucHJvdG90eXBlLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gJ1tvYmplY3QgJyArIGNsYXNzb2YodGhpcykgKyAnXSc7XG4gIH0sIHRydWUpO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZy5qc1xuLy8gbW9kdWxlIGlkID0gNTY2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0Jztcbi8vIEVDTUFTY3JpcHQgNiBzeW1ib2xzIHNoaW1cbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJyk7XG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBNRVRBID0gcmVxdWlyZSgnLi9fbWV0YScpLktFWTtcbnZhciAkZmFpbHMgPSByZXF1aXJlKCcuL19mYWlscycpO1xudmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpO1xudmFyIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi9fc2V0LXRvLXN0cmluZy10YWcnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuL191aWQnKTtcbnZhciB3a3MgPSByZXF1aXJlKCcuL193a3MnKTtcbnZhciB3a3NFeHQgPSByZXF1aXJlKCcuL193a3MtZXh0Jyk7XG52YXIgd2tzRGVmaW5lID0gcmVxdWlyZSgnLi9fd2tzLWRlZmluZScpO1xudmFyIGVudW1LZXlzID0gcmVxdWlyZSgnLi9fZW51bS1rZXlzJyk7XG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJy4vX2lzLWFycmF5Jyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG52YXIgX2NyZWF0ZSA9IHJlcXVpcmUoJy4vX29iamVjdC1jcmVhdGUnKTtcbnZhciBnT1BORXh0ID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcG4tZXh0Jyk7XG52YXIgJEdPUEQgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wZCcpO1xudmFyICREUCA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpO1xudmFyICRrZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcbnZhciBnT1BEID0gJEdPUEQuZjtcbnZhciBkUCA9ICREUC5mO1xudmFyIGdPUE4gPSBnT1BORXh0LmY7XG52YXIgJFN5bWJvbCA9IGdsb2JhbC5TeW1ib2w7XG52YXIgJEpTT04gPSBnbG9iYWwuSlNPTjtcbnZhciBfc3RyaW5naWZ5ID0gJEpTT04gJiYgJEpTT04uc3RyaW5naWZ5O1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xudmFyIEhJRERFTiA9IHdrcygnX2hpZGRlbicpO1xudmFyIFRPX1BSSU1JVElWRSA9IHdrcygndG9QcmltaXRpdmUnKTtcbnZhciBpc0VudW0gPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcbnZhciBTeW1ib2xSZWdpc3RyeSA9IHNoYXJlZCgnc3ltYm9sLXJlZ2lzdHJ5Jyk7XG52YXIgQWxsU3ltYm9scyA9IHNoYXJlZCgnc3ltYm9scycpO1xudmFyIE9QU3ltYm9scyA9IHNoYXJlZCgnb3Atc3ltYm9scycpO1xudmFyIE9iamVjdFByb3RvID0gT2JqZWN0W1BST1RPVFlQRV07XG52YXIgVVNFX05BVElWRSA9IHR5cGVvZiAkU3ltYm9sID09ICdmdW5jdGlvbic7XG52YXIgUU9iamVjdCA9IGdsb2JhbC5RT2JqZWN0O1xuLy8gRG9uJ3QgdXNlIHNldHRlcnMgaW4gUXQgU2NyaXB0LCBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvMTczXG52YXIgc2V0dGVyID0gIVFPYmplY3QgfHwgIVFPYmplY3RbUFJPVE9UWVBFXSB8fCAhUU9iamVjdFtQUk9UT1RZUEVdLmZpbmRDaGlsZDtcblxuLy8gZmFsbGJhY2sgZm9yIG9sZCBBbmRyb2lkLCBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9Njg3XG52YXIgc2V0U3ltYm9sRGVzYyA9IERFU0NSSVBUT1JTICYmICRmYWlscyhmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBfY3JlYXRlKGRQKHt9LCAnYScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRQKHRoaXMsICdhJywgeyB2YWx1ZTogNyB9KS5hOyB9XG4gIH0pKS5hICE9IDc7XG59KSA/IGZ1bmN0aW9uIChpdCwga2V5LCBEKSB7XG4gIHZhciBwcm90b0Rlc2MgPSBnT1BEKE9iamVjdFByb3RvLCBrZXkpO1xuICBpZiAocHJvdG9EZXNjKSBkZWxldGUgT2JqZWN0UHJvdG9ba2V5XTtcbiAgZFAoaXQsIGtleSwgRCk7XG4gIGlmIChwcm90b0Rlc2MgJiYgaXQgIT09IE9iamVjdFByb3RvKSBkUChPYmplY3RQcm90bywga2V5LCBwcm90b0Rlc2MpO1xufSA6IGRQO1xuXG52YXIgd3JhcCA9IGZ1bmN0aW9uICh0YWcpIHtcbiAgdmFyIHN5bSA9IEFsbFN5bWJvbHNbdGFnXSA9IF9jcmVhdGUoJFN5bWJvbFtQUk9UT1RZUEVdKTtcbiAgc3ltLl9rID0gdGFnO1xuICByZXR1cm4gc3ltO1xufTtcblxudmFyIGlzU3ltYm9sID0gVVNFX05BVElWRSAmJiB0eXBlb2YgJFN5bWJvbC5pdGVyYXRvciA9PSAnc3ltYm9sJyA/IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnO1xufSA6IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgaW5zdGFuY2VvZiAkU3ltYm9sO1xufTtcblxudmFyICRkZWZpbmVQcm9wZXJ0eSA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KGl0LCBrZXksIEQpIHtcbiAgaWYgKGl0ID09PSBPYmplY3RQcm90bykgJGRlZmluZVByb3BlcnR5KE9QU3ltYm9scywga2V5LCBEKTtcbiAgYW5PYmplY3QoaXQpO1xuICBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpO1xuICBhbk9iamVjdChEKTtcbiAgaWYgKGhhcyhBbGxTeW1ib2xzLCBrZXkpKSB7XG4gICAgaWYgKCFELmVudW1lcmFibGUpIHtcbiAgICAgIGlmICghaGFzKGl0LCBISURERU4pKSBkUChpdCwgSElEREVOLCBjcmVhdGVEZXNjKDEsIHt9KSk7XG4gICAgICBpdFtISURERU5dW2tleV0gPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSkgaXRbSElEREVOXVtrZXldID0gZmFsc2U7XG4gICAgICBEID0gX2NyZWF0ZShELCB7IGVudW1lcmFibGU6IGNyZWF0ZURlc2MoMCwgZmFsc2UpIH0pO1xuICAgIH0gcmV0dXJuIHNldFN5bWJvbERlc2MoaXQsIGtleSwgRCk7XG4gIH0gcmV0dXJuIGRQKGl0LCBrZXksIEQpO1xufTtcbnZhciAkZGVmaW5lUHJvcGVydGllcyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoaXQsIFApIHtcbiAgYW5PYmplY3QoaXQpO1xuICB2YXIga2V5cyA9IGVudW1LZXlzKFAgPSB0b0lPYmplY3QoUCkpO1xuICB2YXIgaSA9IDA7XG4gIHZhciBsID0ga2V5cy5sZW5ndGg7XG4gIHZhciBrZXk7XG4gIHdoaWxlIChsID4gaSkgJGRlZmluZVByb3BlcnR5KGl0LCBrZXkgPSBrZXlzW2krK10sIFBba2V5XSk7XG4gIHJldHVybiBpdDtcbn07XG52YXIgJGNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpdCwgUCkge1xuICByZXR1cm4gUCA9PT0gdW5kZWZpbmVkID8gX2NyZWF0ZShpdCkgOiAkZGVmaW5lUHJvcGVydGllcyhfY3JlYXRlKGl0KSwgUCk7XG59O1xudmFyICRwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IGZ1bmN0aW9uIHByb3BlcnR5SXNFbnVtZXJhYmxlKGtleSkge1xuICB2YXIgRSA9IGlzRW51bS5jYWxsKHRoaXMsIGtleSA9IHRvUHJpbWl0aXZlKGtleSwgdHJ1ZSkpO1xuICBpZiAodGhpcyA9PT0gT2JqZWN0UHJvdG8gJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIWhhcyhPUFN5bWJvbHMsIGtleSkpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIEUgfHwgIWhhcyh0aGlzLCBrZXkpIHx8ICFoYXMoQWxsU3ltYm9scywga2V5KSB8fCBoYXModGhpcywgSElEREVOKSAmJiB0aGlzW0hJRERFTl1ba2V5XSA/IEUgOiB0cnVlO1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpIHtcbiAgaXQgPSB0b0lPYmplY3QoaXQpO1xuICBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpO1xuICBpZiAoaXQgPT09IE9iamVjdFByb3RvICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICFoYXMoT1BTeW1ib2xzLCBrZXkpKSByZXR1cm47XG4gIHZhciBEID0gZ09QRChpdCwga2V5KTtcbiAgaWYgKEQgJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIShoYXMoaXQsIEhJRERFTikgJiYgaXRbSElEREVOXVtrZXldKSkgRC5lbnVtZXJhYmxlID0gdHJ1ZTtcbiAgcmV0dXJuIEQ7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCkge1xuICB2YXIgbmFtZXMgPSBnT1BOKHRvSU9iamVjdChpdCkpO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBpID0gMDtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIHtcbiAgICBpZiAoIWhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiBrZXkgIT0gSElEREVOICYmIGtleSAhPSBNRVRBKSByZXN1bHQucHVzaChrZXkpO1xuICB9IHJldHVybiByZXN1bHQ7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoaXQpIHtcbiAgdmFyIElTX09QID0gaXQgPT09IE9iamVjdFByb3RvO1xuICB2YXIgbmFtZXMgPSBnT1BOKElTX09QID8gT1BTeW1ib2xzIDogdG9JT2JqZWN0KGl0KSk7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIGkgPSAwO1xuICB2YXIga2V5O1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkge1xuICAgIGlmIChoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkgJiYgKElTX09QID8gaGFzKE9iamVjdFByb3RvLCBrZXkpIDogdHJ1ZSkpIHJlc3VsdC5wdXNoKEFsbFN5bWJvbHNba2V5XSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8vIDE5LjQuMS4xIFN5bWJvbChbZGVzY3JpcHRpb25dKVxuaWYgKCFVU0VfTkFUSVZFKSB7XG4gICRTeW1ib2wgPSBmdW5jdGlvbiBTeW1ib2woKSB7XG4gICAgaWYgKHRoaXMgaW5zdGFuY2VvZiAkU3ltYm9sKSB0aHJvdyBUeXBlRXJyb3IoJ1N5bWJvbCBpcyBub3QgYSBjb25zdHJ1Y3RvciEnKTtcbiAgICB2YXIgdGFnID0gdWlkKGFyZ3VtZW50cy5sZW5ndGggPiAwID8gYXJndW1lbnRzWzBdIDogdW5kZWZpbmVkKTtcbiAgICB2YXIgJHNldCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHRoaXMgPT09IE9iamVjdFByb3RvKSAkc2V0LmNhbGwoT1BTeW1ib2xzLCB2YWx1ZSk7XG4gICAgICBpZiAoaGFzKHRoaXMsIEhJRERFTikgJiYgaGFzKHRoaXNbSElEREVOXSwgdGFnKSkgdGhpc1tISURERU5dW3RhZ10gPSBmYWxzZTtcbiAgICAgIHNldFN5bWJvbERlc2ModGhpcywgdGFnLCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG4gICAgfTtcbiAgICBpZiAoREVTQ1JJUFRPUlMgJiYgc2V0dGVyKSBzZXRTeW1ib2xEZXNjKE9iamVjdFByb3RvLCB0YWcsIHsgY29uZmlndXJhYmxlOiB0cnVlLCBzZXQ6ICRzZXQgfSk7XG4gICAgcmV0dXJuIHdyYXAodGFnKTtcbiAgfTtcbiAgcmVkZWZpbmUoJFN5bWJvbFtQUk9UT1RZUEVdLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5faztcbiAgfSk7XG5cbiAgJEdPUEQuZiA9ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG4gICREUC5mID0gJGRlZmluZVByb3BlcnR5O1xuICByZXF1aXJlKCcuL19vYmplY3QtZ29wbicpLmYgPSBnT1BORXh0LmYgPSAkZ2V0T3duUHJvcGVydHlOYW1lcztcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpLmYgPSAkcHJvcGVydHlJc0VudW1lcmFibGU7XG4gIHJlcXVpcmUoJy4vX29iamVjdC1nb3BzJykuZiA9ICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbiAgaWYgKERFU0NSSVBUT1JTICYmICFyZXF1aXJlKCcuL19saWJyYXJ5JykpIHtcbiAgICByZWRlZmluZShPYmplY3RQcm90bywgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJHByb3BlcnR5SXNFbnVtZXJhYmxlLCB0cnVlKTtcbiAgfVxuXG4gIHdrc0V4dC5mID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gd3JhcCh3a3MobmFtZSkpO1xuICB9O1xufVxuXG4kZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCB7IFN5bWJvbDogJFN5bWJvbCB9KTtcblxuZm9yICh2YXIgZXM2U3ltYm9scyA9IChcbiAgLy8gMTkuNC4yLjIsIDE5LjQuMi4zLCAxOS40LjIuNCwgMTkuNC4yLjYsIDE5LjQuMi44LCAxOS40LjIuOSwgMTkuNC4yLjEwLCAxOS40LjIuMTEsIDE5LjQuMi4xMiwgMTkuNC4yLjEzLCAxOS40LjIuMTRcbiAgJ2hhc0luc3RhbmNlLGlzQ29uY2F0U3ByZWFkYWJsZSxpdGVyYXRvcixtYXRjaCxyZXBsYWNlLHNlYXJjaCxzcGVjaWVzLHNwbGl0LHRvUHJpbWl0aXZlLHRvU3RyaW5nVGFnLHVuc2NvcGFibGVzJ1xuKS5zcGxpdCgnLCcpLCBqID0gMDsgZXM2U3ltYm9scy5sZW5ndGggPiBqOyl3a3MoZXM2U3ltYm9sc1tqKytdKTtcblxuZm9yICh2YXIgd2VsbEtub3duU3ltYm9scyA9ICRrZXlzKHdrcy5zdG9yZSksIGsgPSAwOyB3ZWxsS25vd25TeW1ib2xzLmxlbmd0aCA+IGs7KSB3a3NEZWZpbmUod2VsbEtub3duU3ltYm9sc1trKytdKTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgJ1N5bWJvbCcsIHtcbiAgLy8gMTkuNC4yLjEgU3ltYm9sLmZvcihrZXkpXG4gICdmb3InOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIGhhcyhTeW1ib2xSZWdpc3RyeSwga2V5ICs9ICcnKVxuICAgICAgPyBTeW1ib2xSZWdpc3RyeVtrZXldXG4gICAgICA6IFN5bWJvbFJlZ2lzdHJ5W2tleV0gPSAkU3ltYm9sKGtleSk7XG4gIH0sXG4gIC8vIDE5LjQuMi41IFN5bWJvbC5rZXlGb3Ioc3ltKVxuICBrZXlGb3I6IGZ1bmN0aW9uIGtleUZvcihzeW0pIHtcbiAgICBpZiAoIWlzU3ltYm9sKHN5bSkpIHRocm93IFR5cGVFcnJvcihzeW0gKyAnIGlzIG5vdCBhIHN5bWJvbCEnKTtcbiAgICBmb3IgKHZhciBrZXkgaW4gU3ltYm9sUmVnaXN0cnkpIGlmIChTeW1ib2xSZWdpc3RyeVtrZXldID09PSBzeW0pIHJldHVybiBrZXk7XG4gIH0sXG4gIHVzZVNldHRlcjogZnVuY3Rpb24gKCkgeyBzZXR0ZXIgPSB0cnVlOyB9LFxuICB1c2VTaW1wbGU6IGZ1bmN0aW9uICgpIHsgc2V0dGVyID0gZmFsc2U7IH1cbn0pO1xuXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCAnT2JqZWN0Jywge1xuICAvLyAxOS4xLjIuMiBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXG4gIGNyZWF0ZTogJGNyZWF0ZSxcbiAgLy8gMTkuMS4yLjQgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXG4gIGRlZmluZVByb3BlcnR5OiAkZGVmaW5lUHJvcGVydHksXG4gIC8vIDE5LjEuMi4zIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpXG4gIGRlZmluZVByb3BlcnRpZXM6ICRkZWZpbmVQcm9wZXJ0aWVzLFxuICAvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogJGdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgLy8gMTkuMS4yLjcgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbiAgZ2V0T3duUHJvcGVydHlOYW1lczogJGdldE93blByb3BlcnR5TmFtZXMsXG4gIC8vIDE5LjEuMi44IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoTylcbiAgZ2V0T3duUHJvcGVydHlTeW1ib2xzOiAkZ2V0T3duUHJvcGVydHlTeW1ib2xzXG59KTtcblxuLy8gMjQuMy4yIEpTT04uc3RyaW5naWZ5KHZhbHVlIFssIHJlcGxhY2VyIFssIHNwYWNlXV0pXG4kSlNPTiAmJiAkZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICghVVNFX05BVElWRSB8fCAkZmFpbHMoZnVuY3Rpb24gKCkge1xuICB2YXIgUyA9ICRTeW1ib2woKTtcbiAgLy8gTVMgRWRnZSBjb252ZXJ0cyBzeW1ib2wgdmFsdWVzIHRvIEpTT04gYXMge31cbiAgLy8gV2ViS2l0IGNvbnZlcnRzIHN5bWJvbCB2YWx1ZXMgdG8gSlNPTiBhcyBudWxsXG4gIC8vIFY4IHRocm93cyBvbiBib3hlZCBzeW1ib2xzXG4gIHJldHVybiBfc3RyaW5naWZ5KFtTXSkgIT0gJ1tudWxsXScgfHwgX3N0cmluZ2lmeSh7IGE6IFMgfSkgIT0gJ3t9JyB8fCBfc3RyaW5naWZ5KE9iamVjdChTKSkgIT0gJ3t9Jztcbn0pKSwgJ0pTT04nLCB7XG4gIHN0cmluZ2lmeTogZnVuY3Rpb24gc3RyaW5naWZ5KGl0KSB7XG4gICAgdmFyIGFyZ3MgPSBbaXRdO1xuICAgIHZhciBpID0gMTtcbiAgICB2YXIgcmVwbGFjZXIsICRyZXBsYWNlcjtcbiAgICB3aGlsZSAoYXJndW1lbnRzLmxlbmd0aCA+IGkpIGFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XG4gICAgJHJlcGxhY2VyID0gcmVwbGFjZXIgPSBhcmdzWzFdO1xuICAgIGlmICghaXNPYmplY3QocmVwbGFjZXIpICYmIGl0ID09PSB1bmRlZmluZWQgfHwgaXNTeW1ib2woaXQpKSByZXR1cm47IC8vIElFOCByZXR1cm5zIHN0cmluZyBvbiB1bmRlZmluZWRcbiAgICBpZiAoIWlzQXJyYXkocmVwbGFjZXIpKSByZXBsYWNlciA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICBpZiAodHlwZW9mICRyZXBsYWNlciA9PSAnZnVuY3Rpb24nKSB2YWx1ZSA9ICRyZXBsYWNlci5jYWxsKHRoaXMsIGtleSwgdmFsdWUpO1xuICAgICAgaWYgKCFpc1N5bWJvbCh2YWx1ZSkpIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICAgIGFyZ3NbMV0gPSByZXBsYWNlcjtcbiAgICByZXR1cm4gX3N0cmluZ2lmeS5hcHBseSgkSlNPTiwgYXJncyk7XG4gIH1cbn0pO1xuXG4vLyAxOS40LjMuNCBTeW1ib2wucHJvdG90eXBlW0BAdG9QcmltaXRpdmVdKGhpbnQpXG4kU3ltYm9sW1BST1RPVFlQRV1bVE9fUFJJTUlUSVZFXSB8fCByZXF1aXJlKCcuL19oaWRlJykoJFN5bWJvbFtQUk9UT1RZUEVdLCBUT19QUklNSVRJVkUsICRTeW1ib2xbUFJPVE9UWVBFXS52YWx1ZU9mKTtcbi8vIDE5LjQuMy41IFN5bWJvbC5wcm90b3R5cGVbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKCRTeW1ib2wsICdTeW1ib2wnKTtcbi8vIDIwLjIuMS45IE1hdGhbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKE1hdGgsICdNYXRoJywgdHJ1ZSk7XG4vLyAyNC4zLjMgSlNPTltAQHRvU3RyaW5nVGFnXVxuc2V0VG9TdHJpbmdUYWcoZ2xvYmFsLkpTT04sICdKU09OJywgdHJ1ZSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL2VzNi5zeW1ib2wuanNcbi8vIG1vZHVsZSBpZCA9IDU2N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKGZhbHNlKTtcbi8vIGltcG9ydHNcblxuXG4vLyBtb2R1bGVcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIi5vYWsuc3BhY2VyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbn1cXG4ub2FrLnNwYWNlci5pbmxpbmUge1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xcbn1cXG4ub2FrLnNwYWNlci5mbHVpZCB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGZsZXg6IDEgMSAxMDAlO1xcbn1cXG4ub2FrLnNwYWNlci50aW55IHtcXG4gIHdpZHRoOiAycHg7XFxuICBoZWlnaHQ6IDJweDtcXG59XFxuLm9hay5zcGFjZXIuc21hbGwge1xcbiAgd2lkdGg6IDRweDtcXG4gIGhlaWdodDogNHB4O1xcbn1cXG4ub2FrLnNwYWNlci5tZWRpdW0ge1xcbiAgd2lkdGg6IDEwcHg7XFxuICBoZWlnaHQ6IDEwcHg7XFxufVxcbi5vYWsuc3BhY2VyLmxhcmdlIHtcXG4gIHdpZHRoOiAyMHB4O1xcbiAgaGVpZ2h0OiAyMHB4O1xcbn1cXG4ub2FrLnNwYWNlci5odWdlIHtcXG4gIHdpZHRoOiAzMHB4O1xcbiAgaGVpZ2h0OiAzMHB4O1xcbn1cXG4ub2FrLnNwYWNlci5tYXNzaXZlIHtcXG4gIHdpZHRoOiA1MHB4O1xcbiAgaGVpZ2h0OiA1MHB4O1xcbn1cXG5cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY3NzLWxvYWRlciEuL34vbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zcmMvYXBwL1NwYWNlci5sZXNzXG4vLyBtb2R1bGUgaWQgPSA1Njlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKShmYWxzZSk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIuZnVsbFdpZHRoIHtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG4uZnVsbEhlaWdodCB7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcbi5mdWxsU2l6ZSB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuXCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2Nzcy1sb2FkZXIhLi9+L2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3JjL2FwcC9zdHlsZXMubGVzc1xuLy8gbW9kdWxlIGlkID0gNTcwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vXG4vL1x0IyBDb3JlIGBydWxlc2AgLS0gc2ltcGxlIGRhdGF0eXBlcywgZXRjLlxuLy9cbi8vIE5PVEU6IG1hbnkgb2YgdGhlIGJlbG93IGFyZSBjcmVhdGVkIGFzIGN1c3RvbSBQYXR0ZXJuIHN1YmNsYXNzZXMgZm9yIGRlYnVnZ2luZy5cbi8vXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuLi8uLi9Ub2tlbml6ZXJcIjtcblxuLy8gQ3JlYXRlIGBjb3JlYCBwYXJzZXIuXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTW9kdWxlKFwiY29yZVwiKTtcbmV4cG9ydCBkZWZhdWx0IHBhcnNlcjtcblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICB7XG4gICAgbmFtZTogXCJzdGF0ZW1lbnRzXCIsXG4gICAgY29uc3RydWN0b3I6IFJ1bGUuU3RhdGVtZW50c1xuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImNvbW1lbnRcIixcbiAgICBjb25zdHJ1Y3RvcjogUnVsZS5Db21tZW50XG4gIH0sXG5cbiAgLy8gYHVuZGVmaW5lZGAgYXMgYW4gZXhwcmVzc2lvbi4uLiA/Pz9cbiAge1xuICAgIG5hbWU6IFwidW5kZWZpbmVkXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ1bmRlZmluZWRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgX3VuZGVmaW5lZCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiBcInVuZGVmaW5lZFwiO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJ1bmRlZmluZWRcIiwgXCJ1bmRlZmluZWRcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuXG4gIH0sXG5cbiAgLy8gYHdvcmRgID0gaXMgYSBzaW5nbGUgYWxwaGFudW1lcmljIHdvcmQuXG4gIC8vIE1VU1Qgc3RhcnQgd2l0aCBhIGxvd2VyLWNhc2UgbGV0dGVyICg/KVxuICB7XG4gICAgbmFtZTogXCJ3b3JkXCIsXG4gICAgcGF0dGVybjogL15bYS16XVtcXHdcXC1dKiQvLFxuICAgIGNhbm9uaWNhbDogXCJXb3JkXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHdvcmQgZXh0ZW5kcyBSdWxlLlBhdHRlcm4ge1xuICAgICAgLy8gQ29udmVydCBcIi1cIiB0byBcIl9cIiBpbiBzb3VyY2Ugb3V0cHV0LlxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoZWQucmVwbGFjZSgvXFwtL2csIFwiX1wiKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIHdvcmRzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYWJjXCIsIFwiYWJjXCJdLFxuICAgICAgICAgIFtcImFiYy1kZWZcIiwgXCJhYmNfZGVmXCJdLFxuICAgICAgICAgIFtcImFiY19kZWZcIiwgXCJhYmNfZGVmXCJdLFxuICAgICAgICAgIFtcImFiYzAxXCIsIFwiYWJjMDFcIl0sXG4gICAgICAgICAgW1wiYWJjLWRlZl8wMVwiLCBcImFiY19kZWZfMDFcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImRvZXNuJ3QgbWF0Y2ggdGhpbmdzIHRoYXQgYXJlbid0IHdvcmRzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiJGFzZGFcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCIoYXNkYSlcIiwgdW5kZWZpbmVkXSAgICAgLy8gVE9ETy4uLiA/Pz9cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAgLy8gYGlkZW50aWZpZXJgID0gdmFyaWFibGVzIG9yIHByb3BlcnR5IG5hbWUuXG4gIC8vIE1VU1Qgc3RhcnQgd2l0aCBhIGxvd2VyLWNhc2UgbGV0dGVyICg/KVxuICAvLyBOT1RFOiBXZSBibGFja2xpc3QgYSBsb3Qgb2Ygd29yZHMgYXMgaWRlbnRpZmllcnMuXG4gIHtcbiAgICBuYW1lOiBcImlkZW50aWZpZXJcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgY2Fub25pY2FsOiBcIklkZW5maWZpZXJcIixcbiAgICBwYXR0ZXJuOiAvXlthLXpdW1xcd1xcLV0qJC8sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlkZW50aWZpZXIgZXh0ZW5kcyBSdWxlLlBhdHRlcm4ge1xuICAgICAgLy8gQ29udmVydCBcIi1cIiB0byBcIl9cIiBpbiBzb3VyY2Ugb3V0cHV0LlxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoZWQucmVwbGFjZSgvXFwtL2csIFwiX1wiKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGJsYWNrbGlzdDogW1xuICAgICAgLy8gQWRkIEVuZ2xpc2ggcHJlcG9zaXRpb25zIHRvIGlkZW50aWZpZXIgYmxhY2tsaXN0LlxuICAgICAgLy9cbiAgICAgIC8vIFdpa2lwZWRpYSBcIlByZXBvc2l0aW9uXCI6XG4gICAgICAvL1x0XCJQcmVwb3NpdGlvbnMuLi5hcmUgYSBjbGFzcyBvZiB3b3JkcyB0aGF0XG4gICAgICAvL1x0ZXhwcmVzcyBzcGF0aWFsIG9yIHRlbXBvcmFsIHJlbGF0aW9ucyAgKGluLCB1bmRlciwgdG93YXJkcywgYmVmb3JlKVxuICAgICAgLy9cdG9yIG1hcmsgdmFyaW91cyBzZW1hbnRpYyByb2xlcyAob2YsIGZvcikuXG4gICAgICAvLyBURVNUTUVcbiAgICAgIFwiYWJvdXRcIiwgXCJhYm92ZVwiLCBcImFmdGVyXCIsIFwiYW5kXCIsIFwiYXNcIiwgXCJhdFwiLFxuICAgICAgXCJiZWZvcmVcIiwgXCJiZWhpbmRcIiwgXCJiZWxvd1wiLCBcImJlbmVhdGhcIiwgXCJiZXNpZGVcIiwgXCJiZXR3ZWVuXCIsIFwiYmV5b25kXCIsIFwiYnlcIixcbiAgICAgIFwiZGVmaW5lZFwiLCBcImRvd25cIiwgXCJkdXJpbmdcIixcbiAgICAgIFwiZWFjaFwiLCBcImVtcHR5XCIsIFwiZXhhY3RseVwiLCBcImV4Y2VwdFwiLFxuICAgICAgXCJmb3JcIiwgXCJmcm9tXCIsXG4gICAgICBcImdyZWF0ZXJcIixcbiAgICAgIFwiSVwiLCBcImluXCIsIFwiaW50b1wiLFxuICAgICAgXCJsZXNzXCIsIFwibG9uZ1wiLFxuICAgICAgXCJtZVwiLCBcIm1pbnVzXCIsIFwibW9yZVwiLFxuICAgICAgXCJuZWFyXCIsIFwibm90XCIsXG4gICAgICBcIm9mXCIsIFwib2ZmXCIsIFwib25cIiwgXCJvbnRvXCIsIFwib3Bwb3NpdGVcIiwgXCJvclwiLCBcIm91dFwiLCBcIm91dHNpZGVcIiwgXCJvdmVyXCIsXG4gICAgICBcInNob3J0XCIsIFwic2luY2VcIixcbiAgICAgIFwidGhhblwiLCBcInRoZVwiLCBcInRoZW5cIiwgXCJ0aHJvdWdoXCIsIFwidGhydVwiLCBcInRvXCIsIFwidG93YXJkXCIsIFwidG93YXJkc1wiLFxuICAgICAgXCJ1bmRlZmluZWRcIiwgXCJ1bmRlclwiLCBcInVuZGVybmVhdGhcIiwgXCJ1bmlxdWVcIiwgXCJ1bnRpbFwiLCBcInVwXCIsIFwidXBvblwiLCBcInVwc2lkZVwiLFxuICAgICAgXCJ2ZXJzdXNcIiwgXCJ2c1wiLFxuICAgICAgXCJ3aGVyZVwiLCBcIndpdGhcIiwgXCJ3aXRoaW5cIiwgXCJ3aXRob3V0XCIsXG5cbiAgICAgIC8vIEFkZCBjb21tb24gZW5nbGlzaCB2ZXJicyB0byBpZGVudGlmaWVyIGJsYWNrbGlzdC5cbiAgICAgIFwiYXJlXCIsXG4gICAgICBcImRvXCIsIFwiZG9lc1wiLFxuICAgICAgXCJjb250YWluc1wiLFxuICAgICAgXCJoYXNcIiwgXCJoYXZlXCIsXG4gICAgICBcImlzXCIsXG4gICAgICBcInJlcGVhdFwiLFxuICAgICAgXCJ3YXNcIiwgXCJ3ZXJlXCIsXG5cbiAgICAgIC8vIEFkZCBzcGVjaWFsIGNvbnRyb2wga2V5d29yZHMgdG8gaWRlbnRpZmllciBibGFja2xpc3QuXG4gICAgICBcImVsc2VcIixcbiAgICAgIFwiaWZcIixcbiAgICAgIFwib3RoZXJ3aXNlXCIsXG4gICAgICBcIndoaWxlXCIsXG5cbiAgICAgIC8vIEFkZCBib29sZWFuIHRva2VucyB0byBpZGVudGlmaWVyIGJsYWNrbGlzdC5cbiAgICAgIFwidHJ1ZVwiLCBcImZhbHNlXCIsXG4gICAgICBcInllc1wiLCBcIm5vXCIsXG4gICAgICBcIm9rXCIsIFwiY2FuY2VsXCIsXG4gICAgICBcInN1Y2Nlc3NcIiwgXCJmYWlsdXJlXCIsXG5cbiAgICAgIC8vIEFkZCBudW1iZXIgd29yZHMgdG8gaWRlbnRpZmllciBibGFja2xpc3QuXG4gICAgICAvLyBURVNUTUVcbiAgICAgIFwib25lXCIsIFwidHdvXCIsIFwidGhyZWVcIiwgXCJmb3VyXCIsIFwiZml2ZVwiLFxuICAgICAgXCJzaXhcIiwgXCJzZXZlblwiLCBcImVpZ2h0XCIsIFwibmluZVwiLCBcInRlblwiLFxuICAgIF0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgaWRlbnRpZmllcnNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCJhYmNcIiwgXCJhYmNcIl0sXG4gICAgICAgICAgW1wiYWJjLWRlZlwiLCBcImFiY19kZWZcIl0sXG4gICAgICAgICAgW1wiYWJjX2RlZlwiLCBcImFiY19kZWZcIl0sXG4gICAgICAgICAgW1wiYWJjMDFcIiwgXCJhYmMwMVwiXSxcbiAgICAgICAgICBbXCJhYmMtZGVmXzAxXCIsIFwiYWJjX2RlZl8wMVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiZG9lc24ndCBtYXRjaCB0aGluZ3MgdGhhdCBhcmVuJ3QgaWRlbnRpZmllcnNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCIkYXNkYVwiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcIihhc2RhKVwiLCB1bmRlZmluZWRdLCAgICAgLy8gVE9ETy4uLiA/Pz9cbiAgICAgICAgICBbXCJBYmNcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwic2tpcHMgaXRlbXMgaW4gaXRzIGJsYWNrbGlzdFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcInllc1wiLCB1bmRlZmluZWRdXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICBdXG4gIH0sXG5cbiAgLy8gYFR5cGVgID0gdHlwZSBuYW1lLlxuICAvLyBNVVNUIHN0YXJ0IHdpdGggYW4gdXBwZXItY2FzZSBsZXR0ZXIgKD8pXG4gIHtcbiAgICBuYW1lOiBcInR5cGVcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgY2Fub25pY2FsOiBcIlR5cGVcIixcbiAgICBwYXR0ZXJuOiAvXihbQS1aXVtcXHdcXC1dKnxsaXN0fHRleHR8bnVtYmVyfGludGVnZXJ8ZGVjaW1hbHxjaGFyYWN0ZXJ8Ym9vbGVhbnxvYmplY3QpJC8sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHR5cGUgZXh0ZW5kcyBSdWxlLlBhdHRlcm4ge1xuICAgICAgLy8gQ29udmVydCBcIi1cIiB0byBcIl9cIiBpbiBzb3VyY2Ugb3V0cHV0LlxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB0eXBlID0gdGhpcy5tYXRjaGVkO1xuICAgICAgICBzd2l0Y2godHlwZSkge1xuICAgICAgICAgIC8vIEFsaWFzIGBMaXN0YCB0byBgQXJyYXlgXG4gICAgICAgICAgY2FzZSBcIkxpc3RcIjpcdFx0cmV0dXJuIFwiQXJyYXlcIjtcblxuICAgICAgICAgIC8vIHNwZWNpYWwgY2FzZSB0byB0YWtlIHRoZSBmb2xsb3dpbmcgYXMgbG93ZXJjYXNlXG4gICAgICAgICAgY2FzZSBcImxpc3RcIjpcdFx0cmV0dXJuIFwiQXJyYXlcIjtcbiAgICAgICAgICBjYXNlIFwidGV4dFwiOlx0XHRyZXR1cm4gXCJTdHJpbmdcIjtcbiAgICAgICAgICBjYXNlIFwiY2hhcmFjdGVyXCI6XHRyZXR1cm4gXCJDaGFyYWN0ZXJcIjtcbiAgICAgICAgICBjYXNlIFwibnVtYmVyXCI6XHRcdHJldHVybiBcIk51bWJlclwiO1xuICAgICAgICAgIGNhc2UgXCJpbnRlZ2VyXCI6XHRcdHJldHVybiBcIkludGVnZXJcIjtcbiAgICAgICAgICBjYXNlIFwiZGVjaW1hbFwiOlx0XHRyZXR1cm4gXCJEZWNpbWFsXCI7XG4gICAgICAgICAgY2FzZSBcImJvb2xlYW5cIjpcdFx0cmV0dXJuIFwiQm9vbGVhblwiO1xuICAgICAgICAgIGNhc2UgXCJvYmplY3RcIjpcdFx0cmV0dXJuIFwiT2JqZWN0XCI7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB0eXBlLnJlcGxhY2UoL1xcLS9nLCBcIl9cIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGJsYWNrbGlzdDogWyBcIklcIiBdLFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIHR5cGVzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiQWJjXCIsIFwiQWJjXCJdLFxuICAgICAgICAgIFtcIkFiYy1kZWZcIiwgXCJBYmNfZGVmXCJdLFxuICAgICAgICAgIFtcIkFiY19EZWZcIiwgXCJBYmNfRGVmXCJdLFxuICAgICAgICAgIFtcIkFiYzAxXCIsIFwiQWJjMDFcIl0sXG4gICAgICAgICAgW1wiQWJjLWRlZl8wMVwiLCBcIkFiY19kZWZfMDFcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImRvZXNuJ3QgbWF0Y2ggdGhpbmdzIHRoYXQgYXJlbid0IHR5cGVzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wiJEFzZGFcIiwgdW5kZWZpbmVkXSwgICAgIC8vIFRPRE8uLi4gPz8/XG4gICAgICAgICAgW1wiKEFzZGEpXCIsIHVuZGVmaW5lZF0sICAgIC8vIFRPRE8uLi4gPz8/XG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvbnZlcnRzIHNwZWNpYWwgdHlwZXNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJMaXN0XCIsIFwiQXJyYXlcIl0sXG4gICAgICAgICAgW1wibGlzdFwiLCBcIkFycmF5XCJdLFxuICAgICAgICAgIFtcInRleHRcIiwgXCJTdHJpbmdcIl0sXG4gICAgICAgICAgW1wiY2hhcmFjdGVyXCIsIFwiQ2hhcmFjdGVyXCJdLFxuICAgICAgICAgIFtcIm51bWJlclwiLCBcIk51bWJlclwiXSxcbiAgICAgICAgICBbXCJpbnRlZ2VyXCIsIFwiSW50ZWdlclwiXSxcbiAgICAgICAgICBbXCJkZWNpbWFsXCIsIFwiRGVjaW1hbFwiXSxcbiAgICAgICAgICBbXCJib29sZWFuXCIsIFwiQm9vbGVhblwiXSxcbiAgICAgICAgICBbXCJvYmplY3RcIiwgXCJPYmplY3RcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcInNraXBzIGl0ZW1zIGluIGl0cyBibGFja2xpc3RcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJJXCIsIHVuZGVmaW5lZF1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfSxcblxuXG5cbiAgLy8gQm9vbGVhbiBsaXRlcmFsLCBjcmVhdGVkIHdpdGggY3VzdG9tIGNvbnN0cnVjdG9yIGZvciBkZWJ1Z2dpbmcuXG4gIC8vIFRPRE86IGJldHRlciBuYW1lIGZvciB0aGlzPz8/XG4gIHtcbiAgICBuYW1lOiBcImJvb2xlYW5cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgY2Fub25pY2FsOiBcIkJvb2xlYW5cIixcbiAgICBwYXR0ZXJuOiAvXih0cnVlfGZhbHNlfHllc3xub3xva3xjYW5jZWx8c3VjY2Vzc3xmYWlsdXJlKSQvLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBib29sZWFuIGV4dGVuZHMgUnVsZS5QYXR0ZXJuIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMubWF0Y2hlZCkge1xuICAgICAgICAgIGNhc2UgXCJ0cnVlXCI6XG4gICAgICAgICAgY2FzZSBcInllc1wiOlxuICAgICAgICAgIGNhc2UgXCJva1wiOlxuICAgICAgICAgIGNhc2UgXCJzdWNjZXNzXCI6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIGJvb2xlYW5zXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1widHJ1ZVwiLCB0cnVlXSxcbiAgICAgICAgICBbXCJ5ZXNcIiwgdHJ1ZV0sXG4gICAgICAgICAgW1wib2tcIiwgdHJ1ZV0sXG4gICAgICAgICAgW1wic3VjY2Vzc1wiLCB0cnVlXSxcbiAgICAgICAgICBbXCJmYWxzZVwiLCBmYWxzZV0sXG4gICAgICAgICAgW1wibm9cIiwgZmFsc2VdLFxuICAgICAgICAgIFtcImNhbmNlbFwiLCBmYWxzZV0sXG4gICAgICAgICAgW1wiZmFpbHVyZVwiLCBmYWxzZV1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiZG9lc24ndCBtYXRjaCBpbiB0aGUgbWlkZGxlIG9mIGEgbG9uZ2VyIGtleXdvcmRcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJ5ZXNzaXJcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCJ5ZXMtc2lyXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wieWVzX3NpclwiLCB1bmRlZmluZWRdXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIC8vIGBudW1iZXJgIGFzIGVpdGhlciBmbG9hdCBvciBpbnRlZ2VyLCBjcmVhdGVkIHdpdGggY3VzdG9tIGNvbnN0cnVjdG9yIGZvciBkZWJ1Z2dpbmcuXG4gIC8vIE5PVEU6IHlvdSBjYW4gYWxzbyB1c2UgYG9uZWAuLi5gdGVuYCBhcyBzdHJpbmdzLidcbiAgLy8gVE9ETzogIGBpbnRlZ2VyYCBhbmQgYGRlY2ltYWxgPyAgdG9vIHRlY2h5P1xuICB7XG4gICAgbmFtZTogXCJudW1iZXJcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgY2Fub25pY2FsOiBcIk51bWJlclwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBudW1iZXIgZXh0ZW5kcyBSdWxlIHtcbiAgICAgIC8vIFNwZWNpYWwgd29yZHMgeW91IGNhbiB1c2UgYXMgbnVtYmVycy4uLlxuICAgICAgc3RhdGljIE5VTUJFUl9OQU1FUyA9IHtcbiAgICAgICAgemVybzogMCxcbiAgICAgICAgb25lOiAxLFxuICAgICAgICB0d286IDIsXG4gICAgICAgIHRocmVlOiAzLFxuICAgICAgICBmb3VyOiA0LFxuICAgICAgICBmaXZlOiA1LFxuICAgICAgICBzaXg6IDYsXG4gICAgICAgIHNldmVuOiA3LFxuICAgICAgICBlaWdodDogOCxcbiAgICAgICAgbmluZTogOSxcbiAgICAgICAgdGVuOiAxMFxuICAgICAgfVxuXG4gICAgICAvLyBOdW1iZXJzIGdldCBlbmNvZGVkIGFzIG51bWJlcnMgaW4gdGhlIHRva2VuIHN0cmVhbS5cbiAgICAgIHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDApIHtcbiAgICAgICAgbGV0IHRva2VuID0gdG9rZW5zW3N0YXJ0XTtcbiAgICAgICAgLy8gaWYgYSBzdHJpbmcsIGF0dGVtcHQgdG8gcnVuIHRocm91Z2ggb3VyIE5VTUJFUl9OQU1FU1xuICAgICAgICBpZiAodHlwZW9mIHRva2VuID09PSBcInN0cmluZ1wiKSB0b2tlbiA9IFJ1bGUuTnVtYmVyLk5VTUJFUl9OQU1FU1t0b2tlbl07XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW4gIT09IFwibnVtYmVyXCIpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiB0aGlzLmNsb25lKHtcbiAgICAgICAgICBtYXRjaGVkOiB0b2tlbixcbiAgICAgICAgICBuZXh0U3RhcnQ6IHN0YXJ0ICsgMVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udmVydCB0byBudW1iZXIgb24gc291cmNlIG91dHB1dC5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVkO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgbnVtYmVyc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIjFcIiwgMV0sXG4gICAgICAgICAgW1wiMTAwMFwiLCAxMDAwXSxcbiAgICAgICAgICBbXCItMVwiLCAtMV0sXG4gICAgICAgICAgW1wiMS4xXCIsIDEuMV0sXG4gICAgICAgICAgW1wiMDAwLjFcIiwgMC4xXSxcbiAgICAgICAgICBbXCIxLlwiLCAxXSxcbiAgICAgICAgICBbXCIuMVwiLCAwLjFdLFxuICAgICAgICAgIFtcIi0xMTEuMTExXCIsIC0xMTEuMTExXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiZG9lc24ndCBtYXRjaCB0aGluZ3MgdGhhdCBhcmVuJ3QgbnVtYmVyc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIlwiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcIi5cIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwicmVxdWlyZXMgbmVnYXRpdmUgc2lnbiB0byBiZSB0b3VjaGluZyB0aGUgbnVtYmVyXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiLSAxXCIsIHVuZGVmaW5lZF1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAgLy8gTGl0ZXJhbCBgdGV4dGAgc3RyaW5nLCBjcmVhdGVkIHdpdGggY3VzdG9tIGNvbnN0cnVjdG9yIGZvciBkZWJ1Z2dpbmcuXG4gIC8vIFlvdSBjYW4gdXNlIGVpdGhlciBzaW5nbGUgb3IgZG91YmxlIHF1b3RlcyBvbiB0aGUgb3V0c2lkZSAoYWx0aG91Z2ggZG91YmxlIHF1b3RlcyBhcmUgcHJlZmVycmVkKS5cbiAgLy8gUmV0dXJuZWQgdmFsdWUgaGFzIGVuY2xvc2luZyBxdW90ZXMuXG4gIHtcbiAgICBuYW1lOiBcInRleHRcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgY2Fub25pY2FsOiBcIlRleHRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgdGV4dCBleHRlbmRzIFJ1bGUge1xuICAgICAgLy8gVGV4dCBzdHJpbmdzIGdldCBlbmNvZGVkIGFzIGB0ZXh0YCBvYmplY3RzIGluIHRoZSB0b2tlbiBzdHJlYW0uXG4gICAgICBwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwKSB7XG4gICAgICAgIGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG4gICAgICAgIGlmICghKHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLlRleHQpKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSh7XG4gICAgICAgICAgbWF0Y2hlZDogdG9rZW4ucXVvdGVkU3RyaW5nLFxuICAgICAgICAgIG5leHRTdGFydDogc3RhcnQgKyAxXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0Y2hlZDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIHRleHRcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbJ1wiXCInLCAnXCJcIiddLFxuICAgICAgICAgIFtcIicnXCIsIFwiJydcIl0sXG4gICAgICAgICAgWydcImFcIicsICdcImFcIiddLFxuICAgICAgICAgIFtcIidhJ1wiLCBcIidhJ1wiXSxcbiAgICAgICAgICBbJ1wiYWJjZFwiJywgJ1wiYWJjZFwiJ10sXG4gICAgICAgICAgWydcImFiYyBkZWYgZ2hpLiBqa2xcIicsICdcImFiYyBkZWYgZ2hpLiBqa2xcIiddLFxuICAgICAgICAgIFsnXCIuLi5DYW5cXCd0IHRvdWNoIHRoaXNcIicsICdcIi4uLkNhblxcJ3QgdG91Y2ggdGhpc1wiJ10sXG4vL0ZJWE1FICAgICAgICAgIFtcIidcXFwiR2Fkem9va3MhIEkgY2FuXFxcXCd0IGJlbGlldmUgaXQhXFxcIiBoZSBzYWlkJ1wiLCBcIidcXFwiR2Fkem9va3MhIEkgY2FuXFwndCBiZWxpZXZlIGl0IVxcXCIgaGUgc2FpZCdcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIC8vIExpdGVyYWwgbGlzdCAoYXJyYXkpLCBlZzogIGBbMSwyICwgdHJ1ZSxmYWxzZSBdYFxuICB7XG4gICAgbmFtZTogXCJsaXRlcmFsX2xpc3RcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIlxcXFxbW2xpc3Q6e2V4cHJlc3Npb259LF0/XFxcXF1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGl0ZXJhbF9saXN0IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYFske2xpc3QgPyBsaXN0LmpvaW4oXCIsIFwiKSA6IFwiXCJ9XWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBsaXRlcmFsIGxpc3RzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiW11cIiwgXCJbXVwiXSxcbiAgICAgICAgICBbXCJbMV1cIiwgXCJbMV1cIl0sXG4gICAgICAgICAgW1wiWzEsXVwiLCBcIlsxXVwiXSxcbiAgICAgICAgICBbXCJbMSwyLDNdXCIsIFwiWzEsIDIsIDNdXCJdLFxuICAgICAgICAgIFtcIlsxLCAyLCAzXVwiLCBcIlsxLCAyLCAzXVwiXSxcbiAgICAgICAgICBbXCJbMSwyLDMsXVwiLCBcIlsxLCAyLCAzXVwiXSxcbiAgICAgICAgICBbXCJbeWVzLG5vLCdhJywxXVwiLCBcIlt0cnVlLCBmYWxzZSwgJ2EnLCAxXVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiZG9lc24ndCBtYXRjaCBtYWxmb3JtZWQgbGlzdHMgXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wiWywxXVwiLCB1bmRlZmluZWRdXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG5cbiAgLy8gUGFyZW50aGVzaXplZCBleHByZXNzaW9uXG4gIHtcbiAgICBuYW1lOiBcInBhcmVudGhlc2l6ZWRfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiXFxcXCh7ZXhwcmVzc2lvbn1cXFxcKVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBwYXJlbnRoZXNpemVkX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBleHByZXNzaW9uIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIC8vIGRvbid0IGRvdWJsZSBwYXJlbnMgaWYgbm90IG5lY2Vzc2FyeVxuICAgICAgICBpZiAodHlwZW9mIGV4cHJlc3Npb24gPT09IFwic3RyaW5nXCIgJiYgZXhwcmVzc2lvbi5zdGFydHNXaXRoKFwiKFwiKSAmJiBleHByZXNzaW9uLmVuZHNXaXRoKFwiKVwiKSkgcmV0dXJuIGV4cHJlc3Npb247XG4gICAgICAgIHJldHVybiBcIihcIiArIGV4cHJlc3Npb24gKyBcIilcIjtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIHBhcmVudGhlc2l6ZWQgZXhwcmVzc2lvbnNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCIoc29tZVZhcilcIiwgXCIoc29tZVZhcilcIl0sXG4gICAgICAgICAgW1wiKChzb21lVmFyKSlcIiwgXCIoc29tZVZhcilcIl0sXG4gICAgICAgICAgW1wiKDEgYW5kIHllcylcIiwgXCIoMSAmJiB0cnVlKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgbXVsdGlwbGUgcGFyZW50aGVzaXNcIixcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCIoMSkgYW5kICh5ZXMpXCIsIFwiKCgxKSAmJiAodHJ1ZSkpXCJdLFxuICAgICAgICAgIFtcIigoMSkgYW5kICh5ZXMpKVwiLCBcIigoMSkgJiYgKHRydWUpKVwiXSxcbiAgICAgICAgICBbXCIoKDEpIGFuZCAoKHllcykpKVwiLCBcIigoMSkgJiYgKHRydWUpKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiZG9lc24ndCBtYXRjaCBtYWxmb3JtZWQgcGFyZW50aGVzaXplZCBleHByZXNzaW9uc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIihmb29cIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCIoZm9vKGJhciliYXpcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH1cblxuKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ydWxlcy9zcGVsbC9jb3JlLmpzIiwiLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH0gfSkuYSAhPSA3O1xufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19kZXNjcmlwdG9ycy5qc1xuLy8gbW9kdWxlIGlkID0gNzJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwga2V5KSB7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2hhcy5qc1xuLy8gbW9kdWxlIGlkID0gNzNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuL19pZTgtZG9tLWRlZmluZScpO1xudmFyIHRvUHJpbWl0aXZlID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJyk7XG52YXIgZFAgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG5cbmV4cG9ydHMuZiA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKSB7XG4gIGFuT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGFuT2JqZWN0KEF0dHJpYnV0ZXMpO1xuICBpZiAoSUU4X0RPTV9ERUZJTkUpIHRyeSB7XG4gICAgcmV0dXJuIGRQKE8sIFAsIEF0dHJpYnV0ZXMpO1xuICB9IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cbiAgaWYgKCdnZXQnIGluIEF0dHJpYnV0ZXMgfHwgJ3NldCcgaW4gQXR0cmlidXRlcykgdGhyb3cgVHlwZUVycm9yKCdBY2Nlc3NvcnMgbm90IHN1cHBvcnRlZCEnKTtcbiAgaWYgKCd2YWx1ZScgaW4gQXR0cmlidXRlcykgT1tQXSA9IEF0dHJpYnV0ZXMudmFsdWU7XG4gIHJldHVybiBPO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcC5qc1xuLy8gbW9kdWxlIGlkID0gNzRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdFByb3BUeXBlc1NlY3JldCA9IHJlcXVpcmUoJy4vbGliL1JlYWN0UHJvcFR5cGVzU2VjcmV0Jyk7XG5cbmZ1bmN0aW9uIGVtcHR5RnVuY3Rpb24oKSB7fVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBzaGltKHByb3BzLCBwcm9wTmFtZSwgY29tcG9uZW50TmFtZSwgbG9jYXRpb24sIHByb3BGdWxsTmFtZSwgc2VjcmV0KSB7XG4gICAgaWYgKHNlY3JldCA9PT0gUmVhY3RQcm9wVHlwZXNTZWNyZXQpIHtcbiAgICAgIC8vIEl0IGlzIHN0aWxsIHNhZmUgd2hlbiBjYWxsZWQgZnJvbSBSZWFjdC5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcihcbiAgICAgICdDYWxsaW5nIFByb3BUeXBlcyB2YWxpZGF0b3JzIGRpcmVjdGx5IGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGBwcm9wLXR5cGVzYCBwYWNrYWdlLiAnICtcbiAgICAgICdVc2UgUHJvcFR5cGVzLmNoZWNrUHJvcFR5cGVzKCkgdG8gY2FsbCB0aGVtLiAnICtcbiAgICAgICdSZWFkIG1vcmUgYXQgaHR0cDovL2ZiLm1lL3VzZS1jaGVjay1wcm9wLXR5cGVzJ1xuICAgICk7XG4gICAgZXJyLm5hbWUgPSAnSW52YXJpYW50IFZpb2xhdGlvbic7XG4gICAgdGhyb3cgZXJyO1xuICB9O1xuICBzaGltLmlzUmVxdWlyZWQgPSBzaGltO1xuICBmdW5jdGlvbiBnZXRTaGltKCkge1xuICAgIHJldHVybiBzaGltO1xuICB9O1xuICAvLyBJbXBvcnRhbnQhXG4gIC8vIEtlZXAgdGhpcyBsaXN0IGluIHN5bmMgd2l0aCBwcm9kdWN0aW9uIHZlcnNpb24gaW4gYC4vZmFjdG9yeVdpdGhUeXBlQ2hlY2tlcnMuanNgLlxuICB2YXIgUmVhY3RQcm9wVHlwZXMgPSB7XG4gICAgYXJyYXk6IHNoaW0sXG4gICAgYm9vbDogc2hpbSxcbiAgICBmdW5jOiBzaGltLFxuICAgIG51bWJlcjogc2hpbSxcbiAgICBvYmplY3Q6IHNoaW0sXG4gICAgc3RyaW5nOiBzaGltLFxuICAgIHN5bWJvbDogc2hpbSxcblxuICAgIGFueTogc2hpbSxcbiAgICBhcnJheU9mOiBnZXRTaGltLFxuICAgIGVsZW1lbnQ6IHNoaW0sXG4gICAgaW5zdGFuY2VPZjogZ2V0U2hpbSxcbiAgICBub2RlOiBzaGltLFxuICAgIG9iamVjdE9mOiBnZXRTaGltLFxuICAgIG9uZU9mOiBnZXRTaGltLFxuICAgIG9uZU9mVHlwZTogZ2V0U2hpbSxcbiAgICBzaGFwZTogZ2V0U2hpbSxcbiAgICBleGFjdDogZ2V0U2hpbVxuICB9O1xuXG4gIFJlYWN0UHJvcFR5cGVzLmNoZWNrUHJvcFR5cGVzID0gZW1wdHlGdW5jdGlvbjtcbiAgUmVhY3RQcm9wVHlwZXMuUHJvcFR5cGVzID0gUmVhY3RQcm9wVHlwZXM7XG5cbiAgcmV0dXJuIFJlYWN0UHJvcFR5cGVzO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9wcm9wLXR5cGVzL2ZhY3RvcnlXaXRoVGhyb3dpbmdTaGltcy5qc1xuLy8gbW9kdWxlIGlkID0gNzcwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxuLyoqXG4gKiBAbW9kdWxlIGNvbXBvbmVudFdyYXBwZXJcbiAqXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCAqIGFzIHN0b3JlIGZyb20gJy4uL3N0b3JlJztcbmltcG9ydCB7IG9uTW91bnQsIG9uVW5tb3VudCB9IGZyb20gJy4uL2V2ZW50X2hhbmRsZXJzJztcbmltcG9ydCB7IEFMTF9LRVlTIH0gZnJvbSAnLi4vbGliL2tleXMnO1xuXG4vKipcbiAqIGNvbXBvbmVudFdyYXBwZXJcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IFdyYXBwZWRDb21wb25lbnQgUmVhY3QgY29tcG9uZW50IGNsYXNzIHRvIGJlIHdyYXBwZWRcbiAqIEBwYXJhbSB7YXJyYXl9IFtrZXlzXSBUaGUga2V5KHMpIGJvdW5kIHRvIHRoZSBjbGFzc1xuICogQHJldHVybiB7b2JqZWN0fSBUaGUgaGlnaGVyLW9yZGVyIGZ1bmN0aW9uIHRoYXQgd3JhcHMgdGhlIGRlY29yYXRlZCBjbGFzc1xuICovXG5mdW5jdGlvbiBjb21wb25lbnRXcmFwcGVyKFdyYXBwZWRDb21wb25lbnQpIHtcbiAgdmFyIGtleXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IEFMTF9LRVlTO1xuXG4gIHZhciBLZXlCb2FyZEhlbHBlciA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEtleUJvYXJkSGVscGVyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEtleUJvYXJkSGVscGVyKHByb3BzKSB7XG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgS2V5Qm9hcmRIZWxwZXIpO1xuXG4gICAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoS2V5Qm9hcmRIZWxwZXIuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihLZXlCb2FyZEhlbHBlcikpLmNhbGwodGhpcywgcHJvcHMpKTtcblxuICAgICAgX3RoaXMuc3RhdGUgPSB7XG4gICAgICAgIGV2ZW50OiBudWxsXG4gICAgICB9O1xuICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhLZXlCb2FyZEhlbHBlciwgW3tcbiAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgb25Nb3VudCh0aGlzKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjb21wb25lbnRXaWxsVW5tb3VudCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIG9uVW5tb3VudCh0aGlzKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdoYW5kbGVLZXlEb3duJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVLZXlEb3duKGV2ZW50KSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIC8vIHRvIHNpbXVsYXRlIGEga2V5cHJlc3MsIHNldCB0aGUgZXZlbnQgYW5kIHRoZW4gY2xlYXIgaXQgaW4gdGhlIGNhbGxiYWNrXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBldmVudDogZXZlbnQgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpczIuc2V0U3RhdGUoeyBldmVudDogbnVsbCB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFdyYXBwZWRDb21wb25lbnQsIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCB7IGtleWRvd246IHRoaXMuc3RhdGUgfSkpO1xuICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBLZXlCb2FyZEhlbHBlcjtcbiAgfShSZWFjdC5Db21wb25lbnQpO1xuXG4gIHN0b3JlLnNldEJpbmRpbmcoeyBrZXlzOiBbXS5jb25jYXQoa2V5cyksIGZuOiBLZXlCb2FyZEhlbHBlci5wcm90b3R5cGUuaGFuZGxlS2V5RG93biwgdGFyZ2V0OiBLZXlCb2FyZEhlbHBlci5wcm90b3R5cGUgfSk7XG5cbiAgcmV0dXJuIEtleUJvYXJkSGVscGVyO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjb21wb25lbnRXcmFwcGVyO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvY2xhc3NfZGVjb3JhdG9yLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG4vKipcbiAqIEBtb2R1bGUgZGVjb3JhdG9yc1xuICpcbiAqL1xuaW1wb3J0IGNsYXNzV3JhcHBlciBmcm9tICcuL2NsYXNzX2RlY29yYXRvcic7XG5pbXBvcnQgbWV0aG9kV3JhcHBlciBmcm9tICcuL21ldGhvZF9kZWNvcmF0b3InO1xuaW1wb3J0IG1ldGhvZFdyYXBwZXJTY29wZWQgZnJvbSAnLi9tZXRob2RfZGVjb3JhdG9yX3Njb3BlZCc7XG5cbi8qKlxuICogbm9vcERlY29yYXRvclxuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHJldHVybiB7dW5kZWZpbmVkfSBSZXR1cm5zIGB1bmRlZmluZWRgIHNvIHRoYXQgdGhlIG9yaWdpbmFsIHVuZGVjb3JhdGVkIGluc3RhbmNlL21ldGhvZCBpcyB1c2VkXG4gKi9cbmZ1bmN0aW9uIG5vb3BEZWNvcmF0b3IoKSB7XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogX2RlY29yYXRvclxuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWV0aG9kRm4gVGhlIG1ldGhvZCB3cmFwcGVyIHRvIGRlbGVnYXRlIHRvLCBiYXNlZCBvbiB3aGV0aGVyIHVzZXIgaGFzIHNwZWNpZmllZCBhIHNjb3BlZCBkZWNvcmF0b3Igb3Igbm90XG4gKiBAcGFyYW0ge0FycmF5fSAuLi5hcmdzIFJlbWFpbmRlciBvZiBhcmd1bWVudHMgcGFzc2VkIGluXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIGRlY29yYXRlZCBjbGFzcyBvciBtZXRob2RcbiAqL1xuZnVuY3Rpb24gX2RlY29yYXRvcihtZXRob2RGbikge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBhcmdzW19rZXkgLSAxXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIC8vIGNoZWNrIHRoZSBmaXJzdCBhcmd1bWVudCB0byBzZWUgaWYgaXQncyBhIHVzZXItc3VwcGxpZWQga2V5Y29kZSBvciBhcnJheVxuICAvLyBvZiBrZXljb2Rlcywgb3IgaWYgaXQncyB0aGUgd3JhcHBlZCBjbGFzcyBvciBtZXRob2RcbiAgdmFyIHRlc3RBcmcgPSBhcmdzWzBdO1xuICB2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkodGVzdEFyZyk7XG5cbiAgLy8gaWYgdGhlIHRlc3QgYXJndW1lbnQgaXMgbm90IGFuIG9iamVjdCBvciBmdW5jdGlvbiwgaXQgaXMgdXNlci1zdXBwbGllZFxuICAvLyBrZXljb2Rlcy4gZWxzZSB0aGVyZSBhcmUgbm8gYXJndW1lbnRzIGFuZCBpdCdzIGp1c3QgdGhlIHdyYXBwZWQgY2xhc3NcbiAgaWYgKGlzQXJyYXkgfHwgflsnc3RyaW5nJywgJ251bWJlcicsICdzeW1ib2wnXS5pbmRleE9mKHR5cGVvZiB0ZXN0QXJnID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZih0ZXN0QXJnKSkpIHtcbiAgICB2YXIga2V5cyA9IGlzQXJyYXkgPyB0ZXN0QXJnIDogYXJncztcblxuICAgIC8vIHJldHVybiB0aGUgZGVjb3JhdG9yIGZ1bmN0aW9uLCB3aGljaCBvbiB0aGUgbmV4dCBjYWxsIHdpbGwgbG9vayBmb3JcbiAgICAvLyB0aGUgcHJlc2VuY2Ugb2YgYSBtZXRob2QgbmFtZSB0byBkZXRlcm1pbmUgaWYgdGhpcyBpcyBhIHdyYXBwZWQgbWV0aG9kXG4gICAgLy8gb3IgY29tcG9uZW50XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIG1ldGhvZE5hbWUsIGRlc2NyaXB0b3IpIHtcbiAgICAgIHJldHVybiBtZXRob2ROYW1lID8gbWV0aG9kRm4oeyB0YXJnZXQ6IHRhcmdldCwgZGVzY3JpcHRvcjogZGVzY3JpcHRvciwga2V5czoga2V5cyB9KSA6IGNsYXNzV3JhcHBlcih0YXJnZXQsIGtleXMpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgdmFyIFdyYXBwZWRDb21wb25lbnQgPSBhcmdzWzBdO1xuICAgIHZhciBtZXRob2ROYW1lID0gYXJnc1sxXTtcblxuICAgIC8vIG1ldGhvZCBkZWNvcmF0b3JzIHdpdGhvdXQga2V5Y29kZSAod2hpY2gpIGFyZ3VtZW50cyBhcmUgbm90IGFsbG93ZWQuXG4gICAgaWYgKFdyYXBwZWRDb21wb25lbnQgJiYgIW1ldGhvZE5hbWUpIHtcbiAgICAgIHJldHVybiBjbGFzc1dyYXBwZXIuYXBwbHkodW5kZWZpbmVkLCBhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKG1ldGhvZE5hbWUgKyAnOiBNZXRob2QgZGVjb3JhdG9ycyBtdXN0IGhhdmUga2V5Y29kZSBhcmd1bWVudHMsIHNvIHRoZSBkZWNvcmF0b3IgZm9yIHRoaXMgbWV0aG9kIHdpbGwgbm90IGRvIGFueXRoaW5nJyk7XG4gICAgICByZXR1cm4gbm9vcERlY29yYXRvcjtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBrZXlkb3duU2NvcGVkXG4gKlxuICogTWV0aG9kIGRlY29yYXRvciB0aGF0IHdpbGwgbG9vayBmb3IgY2hhbmdlcyB0byBpdHMgdGFyZ2V0ZWQgY29tcG9uZW50J3NcbiAqIGBrZXlkb3duYCBwcm9wcyB0byBkZWNpZGUgd2hlbiB0byB0cmlnZ2VyLCByYXRoZXIgdGhhbiByZXNwb25kaW5nIGRpcmVjdGx5XG4gKiB0byBrZXlkb3duIGV2ZW50cy4gVGhpcyBsZXRzIHlvdSBzcGVjaWZ5IGEgQGtleWRvd24gZGVjb3JhdGVkIGNsYXNzIGhpZ2hlclxuICogdXAgaW4gdGhlIHZpZXcgaGllcmFyY2h5IGZvciBsYXJnZXIgc2NvcGluZyBvZiBrZXlkb3duIGV2ZW50cywgb3IgZm9yXG4gKiBwcm9ncmFtbWF0aWNhbGx5IHNlbmRpbmcga2V5ZG93biBldmVudHMgYXMgcHJvcHMgaW50byB0aGUgY29tcG9uZW50cyBpbiBvcmRlclxuICogdG8gdHJpZ2dlciBkZWNvcmF0ZWQgbWV0aG9kcyB3aXRoIG1hdGNoaW5nIGtleXMuXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7QXJyYXl9IC4uLmFyZ3MgIEFsbCAob3Igbm8pIGFyZ3VtZW50cyBwYXNzZWQgaW4gZnJvbSBkZWNvcmF0aW9uXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIGRlY29yYXRlZCBjbGFzcyBvciBtZXRob2RcbiAqL1xuZnVuY3Rpb24ga2V5ZG93blNjb3BlZCgpIHtcbiAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbjIpLCBfa2V5MiA9IDA7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICBhcmdzW19rZXkyXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gIH1cblxuICByZXR1cm4gX2RlY29yYXRvci5hcHBseSh1bmRlZmluZWQsIFttZXRob2RXcmFwcGVyU2NvcGVkXS5jb25jYXQoYXJncykpO1xufVxuXG4vKipcbiAqIGtleWRvd25cbiAqXG4gKiBUaGUgbWFpbiBkZWNvcmF0b3IgYW5kIGRlZmF1bHQgZXhwb3J0LCBoYW5kbGVzIGJvdGggY2xhc3NlcyBhbmQgbWV0aG9kcy5cbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtBcnJheX0gLi4uYXJncyAgQWxsIChvciBubykgYXJndW1lbnRzIHBhc3NlZCBpbiBmcm9tIGRlY29yYXRpb25cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgZGVjb3JhdGVkIGNsYXNzIG9yIG1ldGhvZFxuICovXG5mdW5jdGlvbiBrZXlkb3duKCkge1xuICBmb3IgKHZhciBfbGVuMyA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuMyksIF9rZXkzID0gMDsgX2tleTMgPCBfbGVuMzsgX2tleTMrKykge1xuICAgIGFyZ3NbX2tleTNdID0gYXJndW1lbnRzW19rZXkzXTtcbiAgfVxuXG4gIHJldHVybiBfZGVjb3JhdG9yLmFwcGx5KHVuZGVmaW5lZCwgW21ldGhvZFdyYXBwZXJdLmNvbmNhdChhcmdzKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGtleWRvd247XG5cbmV4cG9ydCB7IGtleWRvd25TY29wZWQgfTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9kZWNvcmF0b3JzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA4NDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG4vKipcbiAqIEBtb2R1bGUgbWV0aG9kV3JhcHBlclxuICpcbiAqL1xuaW1wb3J0ICogYXMgc3RvcmUgZnJvbSAnLi4vc3RvcmUnO1xuaW1wb3J0IHsgb25Nb3VudCwgb25Vbm1vdW50LCBfb25LZXlEb3duIH0gZnJvbSAnLi4vZXZlbnRfaGFuZGxlcnMnO1xuXG4vKipcbiAqIF9pc1JlYWN0S2V5RG93blxuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IFRoZSBwb3NzaWJseSBzeW50aGV0aWMgZXZlbnQgcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHdpdGhcbiAqIHRoZSBtZXRob2QgaW52b2NhdGlvbi5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIF9pc1JlYWN0S2V5RG93bihldmVudCkge1xuICByZXR1cm4gZXZlbnQgJiYgKHR5cGVvZiBldmVudCA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoZXZlbnQpKSA9PT0gJ29iamVjdCcgJiYgZXZlbnQubmF0aXZlRXZlbnQgaW5zdGFuY2VvZiB3aW5kb3cuS2V5Ym9hcmRFdmVudCAmJiBldmVudC50eXBlID09PSAna2V5ZG93bic7XG59XG5cbi8qKlxuICogbWV0aG9kV3JhcHBlclxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncyBBbGwgYXJndW1lbnRzIG5lY2Vzc2FyeSBmb3Igd3JhcHBpbmcgbWV0aG9kXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncy50YXJnZXQgVGhlIGRlY29yYXRlZCBjbGFzc1xuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MuZGVzY3JpcHRvciBNZXRob2QgZGVzY3JpcHRvclxuICogQHBhcmFtIHthcnJheX0gYXJncy5rZXlzIFRoZSBhcnJheSBvZiBrZXlzIGJvdW5kIHRvIHRoZSBnaXZlbiBtZXRob2RcbiAqIEByZXR1cm4ge29iamVjdH0gVGhlIG1ldGhvZCBkZXNjcmlwdG9yXG4gKi9cbmZ1bmN0aW9uIG1ldGhvZFdyYXBwZXIoX3JlZikge1xuICB2YXIgdGFyZ2V0ID0gX3JlZi50YXJnZXQsXG4gICAgICBkZXNjcmlwdG9yID0gX3JlZi5kZXNjcmlwdG9yLFxuICAgICAga2V5cyA9IF9yZWYua2V5cztcblxuXG4gIHZhciBmbiA9IGRlc2NyaXB0b3IudmFsdWU7XG5cbiAgLy8gaWYgd2UgaGF2ZW4ndCBhbHJlYWR5IGNyZWF0ZWQgYSBiaW5kaW5nIGZvciB0aGlzIGNsYXNzICh2aWEgYW5vdGhlclxuICAvLyBkZWNvcmF0ZWQgbWV0aG9kKSwgd3JhcCB0aGVzZSBsaWZlY3ljbGUgbWV0aG9kcy5cbiAgaWYgKCFzdG9yZS5nZXRCaW5kaW5nKHRhcmdldCkpIHtcbiAgICB2YXIgY29tcG9uZW50RGlkTW91bnQgPSB0YXJnZXQuY29tcG9uZW50RGlkTW91bnQsXG4gICAgICAgIGNvbXBvbmVudFdpbGxVbm1vdW50ID0gdGFyZ2V0LmNvbXBvbmVudFdpbGxVbm1vdW50O1xuXG5cbiAgICB0YXJnZXQuY29tcG9uZW50RGlkTW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBvbk1vdW50KHRoaXMpO1xuICAgICAgaWYgKGNvbXBvbmVudERpZE1vdW50KSByZXR1cm4gY29tcG9uZW50RGlkTW91bnQuY2FsbCh0aGlzKTtcbiAgICB9O1xuXG4gICAgdGFyZ2V0LmNvbXBvbmVudFdpbGxVbm1vdW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgb25Vbm1vdW50KHRoaXMpO1xuICAgICAgaWYgKGNvbXBvbmVudFdpbGxVbm1vdW50KSByZXR1cm4gY29tcG9uZW50V2lsbFVubW91bnQuY2FsbCh0aGlzKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gYWRkIHRoaXMgYmluZGluZyBvZiBrZXlzIGFuZCBtZXRob2QgdG8gdGhlIHRhcmdldCdzIGJpbmRpbmdzXG4gIHN0b3JlLnNldEJpbmRpbmcoeyBrZXlzOiBrZXlzLCB0YXJnZXQ6IHRhcmdldCwgZm46IGZuIH0pO1xuXG4gIGRlc2NyaXB0b3IudmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgfVxuXG4gICAgdmFyIG1heWJlRXZlbnQgPSBhcmdzWzBdO1xuXG4gICAgaWYgKF9pc1JlYWN0S2V5RG93bihtYXliZUV2ZW50KSkge1xuICAgICAgLy8gcHJveHkgbWV0aG9kIGluIG9yZGVyIHRvIHVzZSBAa2V5ZG93biBhcyBmaWx0ZXIgZm9yIGtleWRvd24gZXZlbnRzIGNvbWluZ1xuICAgICAgLy8gZnJvbSBhbiBhY3R1YWwgb25LZXlEb3duIGJpbmRpbmcgKGFzIGlkZW50aWZpZWQgYnkgcmVhY3QncyBhZGRpdGlvbiBvZlxuICAgICAgLy8gJ25hdGl2ZUV2ZW50JyArIHR5cGUgPT09ICdrZXlkb3duJylcbiAgICAgIGlmICghbWF5YmVFdmVudC5jdHJsS2V5KSB7XG4gICAgICAgIC8vIHdlIGFscmVhZHkgd2hpdGVsaXN0IHNob3J0Y3V0cyB3aXRoIGN0cmwgbW9kaWZpZXJzIHNvIGlmIHdlIHdlcmUgdG9cbiAgICAgICAgLy8gZmlyZSBpdCBhZ2FpbiBoZXJlIHRoZSBtZXRob2Qgd291bGQgdHJpZ2dlciB0d2ljZS4gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9nbG9ydGhvL3JlYWN0LWtleWRvd24vaXNzdWVzLzM4XG4gICAgICAgIHJldHVybiBfb25LZXlEb3duKG1heWJlRXZlbnQsIHRydWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIW1heWJlRXZlbnQgfHwgIShtYXliZUV2ZW50IGluc3RhbmNlb2Ygd2luZG93LktleWJvYXJkRXZlbnQpIHx8IG1heWJlRXZlbnQudHlwZSAhPT0gJ2tleWRvd24nKSB7XG4gICAgICAvLyBpZiBvdXIgZmlyc3QgYXJndW1lbnQgaXMgYSBrZXlkb3duIGV2ZW50IGl0IGlzIGJlaW5nIGhhbmRsZWQgYnkgb3VyXG4gICAgICAvLyBiaW5kaW5nIHN5c3RlbS4gaWYgaXQncyBhbnl0aGluZyBlbHNlLCBqdXN0IHBhc3MgdGhyb3VnaC5cbiAgICAgIHJldHVybiBmbi5jYWxsLmFwcGx5KGZuLCBbdGhpc10uY29uY2F0KGFyZ3MpKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGRlc2NyaXB0b3I7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1ldGhvZFdyYXBwZXI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9tZXRob2RfZGVjb3JhdG9yLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBAbW9kdWxlIG1ldGhvZFdyYXBwZXJTY29wZWRcbiAqXG4gKi9cbmltcG9ydCBtYXRjaEtleXMgZnJvbSAnLi4vbGliL21hdGNoX2tleXMnO1xuaW1wb3J0IHBhcnNlS2V5cyBmcm9tICcuLi9saWIvcGFyc2Vfa2V5cyc7XG5cbi8qKlxuICogbWV0aG9kV3JhcHBlclNjb3BlZFxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncyBBbGwgYXJncyBuZWNlc3NhcnkgZm9yIGRlY29yYXRpbmcgdGhlIG1ldGhvZFxuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MudGFyZ2V0IFRoZSBkZWNvcmF0ZWQgbWV0aG9kJ3MgY2xhc3Mgb2JqZWN0XG4gKiBAcGFyYW0ge29iamVjdH0gYXJncy5kZXNjcmlwdG9yIFRoZSBtZXRob2QncyBkZXNjcmlwdG9yIG9iamVjdFxuICogQHBhcmFtIHthcnJheX0gYXJncy5rZXlzIFRoZSBrZXkgY29kZXMgYm91bmQgdG8gdGhlIGRlY29yYXRlZCBtZXRob2RcbiAqIEByZXR1cm4ge29iamVjdH0gVGhlIG1ldGhvZCdzIGRlc2NyaXB0b3Igb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIG1ldGhvZFdyYXBwZXJTY29wZWQoX3JlZikge1xuICB2YXIgdGFyZ2V0ID0gX3JlZi50YXJnZXQsXG4gICAgICBkZXNjcmlwdG9yID0gX3JlZi5kZXNjcmlwdG9yLFxuICAgICAga2V5cyA9IF9yZWYua2V5cztcbiAgdmFyIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgPSB0YXJnZXQuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcztcblxuICB2YXIgZm4gPSBkZXNjcmlwdG9yLnZhbHVlO1xuICBpZiAoIWtleXMpIHtcbiAgICBjb25zb2xlLndhcm4oZm4gKyAnOiBrZXlkb3duU2NvcGVkIHJlcXVpcmVzIG9uZSBvciBtb3JlIGtleXMnKTtcbiAgfSBlbHNlIHtcblxuICAgIC8qKlxuICAgICAqIF9zaG91bGRUcmlnZ2VyXG4gICAgICpcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhpc1Byb3BzIEV4c3RpbmcgcHJvcHMgZnJvbSB0aGUgd3JhcHBlZCBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhpc1Byb3BzLmtleWRvd24gVGhlIG5hbWVzcGFjZWQgc3RhdGUgZnJvbSB0aGUgaGlnaGVyLW9yZGVyXG4gICAgICogY29tcG9uZW50IChjbGFzc19kZWNvcmF0b3IpXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG5leHRQcm9wcyBUaGUgaW5jb21pbmcgcHJvcHMgZnJvbSB0aGUgd3JhcHBlZCBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbmV4dFByb3BzLmtleWRvd24gVGhlIG5hbWVzY2FwZWQgc3RhdGUgZnJvbSB0aGUgaGlnaGVyLW9yZGVyXG4gICAgICogY29tcG9uZW50IChjbGFzc19kZWNvcmF0b3IpXG4gICAgICogQHBhcmFtIHthcnJheX0ga2V5cyBUaGUga2V5cyBib3VuZCB0byB0aGUgZGVjb3JhdGVkIG1ldGhvZFxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgYWxsIHRlc3RzIGhhdmUgcGFzc2VkXG4gICAgICovXG4gICAgdmFyIF9zaG91bGRUcmlnZ2VyID0gZnVuY3Rpb24gX3Nob3VsZFRyaWdnZXIoa2V5ZG93blRoaXMsIGtleWRvd25OZXh0KSB7XG4gICAgICBpZiAoIShrZXlkb3duTmV4dCAmJiBrZXlkb3duTmV4dC5ldmVudCAmJiAha2V5ZG93blRoaXMuZXZlbnQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHJldHVybiBrZXlTZXRzLnNvbWUoZnVuY3Rpb24gKGtleVNldCkge1xuICAgICAgICByZXR1cm4gbWF0Y2hLZXlzKHsga2V5U2V0OiBrZXlTZXQsIGV2ZW50OiBrZXlkb3duTmV4dC5ldmVudCB9KTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyB3cmFwIHRoZSBjb21wb25lbnQncyBsaWZlY3ljbGUgbWV0aG9kIHRvIGludGVyY2VwdCBrZXkgY29kZXMgY29taW5nIGRvd25cbiAgICAvLyBmcm9tIHRoZSB3cmFwcGVkL3Njb3BlZCBjb21wb25lbnQgdXAgdGhlIHZpZXcgaGllcmFyY2h5LiBpZiBuZXcga2V5ZG93blxuICAgIC8vIGV2ZW50IGhhcyBhcnJpdmVkIGFuZCB0aGUga2V5IGNvZGVzIG1hdGNoIHdoYXQgd2FzIHNwZWNpZmllZCBpbiB0aGVcbiAgICAvLyBkZWNvcmF0b3IsIGNhbGwgdGhlIHdyYXBwZWQgbWV0aG9kLlxuXG5cbiAgICB2YXIga2V5U2V0cyA9IHBhcnNlS2V5cyhrZXlzKTt0YXJnZXQuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICAgIHZhciBrZXlkb3duTmV4dCA9IG5leHRQcm9wcy5rZXlkb3duO1xuICAgICAgdmFyIGtleWRvd25UaGlzID0gdGhpcy5wcm9wcy5rZXlkb3duO1xuXG5cbiAgICAgIGlmIChfc2hvdWxkVHJpZ2dlcihrZXlkb3duVGhpcywga2V5ZG93bk5leHQpKSB7XG4gICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGtleWRvd25OZXh0LmV2ZW50KTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuID4gMSA/IF9sZW4gLSAxIDogMCksIF9rZXkgPSAxOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIGFyZ3NbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICBpZiAoY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcykgcmV0dXJuIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMuY2FsbC5hcHBseShjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzLCBbdGhpcywgbmV4dFByb3BzXS5jb25jYXQoYXJncykpO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gZGVzY3JpcHRvcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWV0aG9kV3JhcHBlclNjb3BlZDtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9kZWNvcmF0b3JzL21ldGhvZF9kZWNvcmF0b3Jfc2NvcGVkLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcG9seWZpbGwgYXJyYXkuZnJvbSAobWFpbmx5IGZvciBJRSlcbmltcG9ydCAnLi9saWIvYXJyYXkuZnJvbSc7XG5cbi8vIEBrZXlkb3duIGFuZCBAa2V5ZG93blNjb3BlZFxuZXhwb3J0IHsgZGVmYXVsdCwga2V5ZG93blNjb3BlZCB9IGZyb20gJy4vZGVjb3JhdG9ycyc7XG5cbi8vIHNldEJpbmRpbmcgLSBvbmx5IHVzZWZ1bCBpZiB5b3UncmUgbm90IGdvaW5nIHRvIHVzZSBkZWNvcmF0b3JzXG5leHBvcnQgeyBzZXRCaW5kaW5nIH0gZnJvbSAnLi9zdG9yZSc7XG5cbi8vIEtleXMgLSB1c2UgdGhpcyB0byBmaW5kIGtleSBjb2RlcyBmb3Igc3RyaW5ncy4gZm9yIGV4YW1wbGU6IEtleXMuaiwgS2V5cy5lbnRlclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBLZXlzLCBBTExfS0VZUywgQUxMX1BSSU5UQUJMRV9LRVlTIH0gZnJvbSAnLi9saWIva2V5cyc7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDg0NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBQcm9kdWN0aW9uIHN0ZXBzIG9mIEVDTUEtMjYyLCBFZGl0aW9uIDYsIDIyLjEuMi4xXG4vLyBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvZnJvbVxuaWYgKCFBcnJheS5mcm9tKSB7XG4gIEFycmF5LmZyb20gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgICB2YXIgaXNDYWxsYWJsZSA9IGZ1bmN0aW9uIGlzQ2FsbGFibGUoZm4pIHtcbiAgICAgIHJldHVybiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicgfHwgdG9TdHIuY2FsbChmbikgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG4gICAgfTtcbiAgICB2YXIgdG9JbnRlZ2VyID0gZnVuY3Rpb24gdG9JbnRlZ2VyKHZhbHVlKSB7XG4gICAgICB2YXIgbnVtYmVyID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgIGlmIChpc05hTihudW1iZXIpKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgICAgaWYgKG51bWJlciA9PT0gMCB8fCAhaXNGaW5pdGUobnVtYmVyKSkge1xuICAgICAgICByZXR1cm4gbnVtYmVyO1xuICAgICAgfVxuICAgICAgcmV0dXJuIChudW1iZXIgPiAwID8gMSA6IC0xKSAqIE1hdGguZmxvb3IoTWF0aC5hYnMobnVtYmVyKSk7XG4gICAgfTtcbiAgICB2YXIgbWF4U2FmZUludGVnZXIgPSBNYXRoLnBvdygyLCA1MykgLSAxO1xuICAgIHZhciB0b0xlbmd0aCA9IGZ1bmN0aW9uIHRvTGVuZ3RoKHZhbHVlKSB7XG4gICAgICB2YXIgbGVuID0gdG9JbnRlZ2VyKHZhbHVlKTtcbiAgICAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChsZW4sIDApLCBtYXhTYWZlSW50ZWdlcik7XG4gICAgfTtcblxuICAgIC8vIFRoZSBsZW5ndGggcHJvcGVydHkgb2YgdGhlIGZyb20gbWV0aG9kIGlzIDEuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGZyb20oYXJyYXlMaWtlIC8qLCBtYXBGbiwgdGhpc0FyZyAqLykge1xuICAgICAgLy8gMS4gTGV0IEMgYmUgdGhlIHRoaXMgdmFsdWUuXG4gICAgICB2YXIgQyA9IHRoaXM7XG5cbiAgICAgIC8vIDIuIExldCBpdGVtcyBiZSBUb09iamVjdChhcnJheUxpa2UpLlxuICAgICAgdmFyIGl0ZW1zID0gT2JqZWN0KGFycmF5TGlrZSk7XG5cbiAgICAgIC8vIDMuIFJldHVybklmQWJydXB0KGl0ZW1zKS5cbiAgICAgIGlmIChhcnJheUxpa2UgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJyYXkuZnJvbSByZXF1aXJlcyBhbiBhcnJheS1saWtlIG9iamVjdCAtIG5vdCBudWxsIG9yIHVuZGVmaW5lZFwiKTtcbiAgICAgIH1cblxuICAgICAgLy8gNC4gSWYgbWFwZm4gaXMgdW5kZWZpbmVkLCB0aGVuIGxldCBtYXBwaW5nIGJlIGZhbHNlLlxuICAgICAgdmFyIG1hcEZuID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB2b2lkIHVuZGVmaW5lZDtcbiAgICAgIHZhciBUO1xuICAgICAgaWYgKHR5cGVvZiBtYXBGbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgLy8gNS4gZWxzZVxuICAgICAgICAvLyA1LiBhIElmIElzQ2FsbGFibGUobWFwZm4pIGlzIGZhbHNlLCB0aHJvdyBhIFR5cGVFcnJvciBleGNlcHRpb24uXG4gICAgICAgIGlmICghaXNDYWxsYWJsZShtYXBGbikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcnJheS5mcm9tOiB3aGVuIHByb3ZpZGVkLCB0aGUgc2Vjb25kIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gNS4gYi4gSWYgdGhpc0FyZyB3YXMgc3VwcGxpZWQsIGxldCBUIGJlIHRoaXNBcmc7IGVsc2UgbGV0IFQgYmUgdW5kZWZpbmVkLlxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICBUID0gYXJndW1lbnRzWzJdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIDEwLiBMZXQgbGVuVmFsdWUgYmUgR2V0KGl0ZW1zLCBcImxlbmd0aFwiKS5cbiAgICAgIC8vIDExLiBMZXQgbGVuIGJlIFRvTGVuZ3RoKGxlblZhbHVlKS5cbiAgICAgIHZhciBsZW4gPSB0b0xlbmd0aChpdGVtcy5sZW5ndGgpO1xuXG4gICAgICAvLyAxMy4gSWYgSXNDb25zdHJ1Y3RvcihDKSBpcyB0cnVlLCB0aGVuXG4gICAgICAvLyAxMy4gYS4gTGV0IEEgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0NvbnN0cnVjdF1dIGludGVybmFsIG1ldGhvZCBcbiAgICAgIC8vIG9mIEMgd2l0aCBhbiBhcmd1bWVudCBsaXN0IGNvbnRhaW5pbmcgdGhlIHNpbmdsZSBpdGVtIGxlbi5cbiAgICAgIC8vIDE0LiBhLiBFbHNlLCBMZXQgQSBiZSBBcnJheUNyZWF0ZShsZW4pLlxuICAgICAgdmFyIEEgPSBpc0NhbGxhYmxlKEMpID8gT2JqZWN0KG5ldyBDKGxlbikpIDogbmV3IEFycmF5KGxlbik7XG5cbiAgICAgIC8vIDE2LiBMZXQgayBiZSAwLlxuICAgICAgdmFyIGsgPSAwO1xuICAgICAgLy8gMTcuIFJlcGVhdCwgd2hpbGUgayA8IGxlbuKApiAoYWxzbyBzdGVwcyBhIC0gaClcbiAgICAgIHZhciBrVmFsdWU7XG4gICAgICB3aGlsZSAoayA8IGxlbikge1xuICAgICAgICBrVmFsdWUgPSBpdGVtc1trXTtcbiAgICAgICAgaWYgKG1hcEZuKSB7XG4gICAgICAgICAgQVtrXSA9IHR5cGVvZiBUID09PSAndW5kZWZpbmVkJyA/IG1hcEZuKGtWYWx1ZSwgaykgOiBtYXBGbi5jYWxsKFQsIGtWYWx1ZSwgayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgQVtrXSA9IGtWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBrICs9IDE7XG4gICAgICB9XG4gICAgICAvLyAxOC4gTGV0IHB1dFN0YXR1cyBiZSBQdXQoQSwgXCJsZW5ndGhcIiwgbGVuLCB0cnVlKS5cbiAgICAgIEEubGVuZ3RoID0gbGVuO1xuICAgICAgLy8gMjAuIFJldHVybiBBLlxuICAgICAgcmV0dXJuIEE7XG4gICAgfTtcbiAgfSgpO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9hcnJheS5mcm9tLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBAbW9kdWxlIGRvbUhlbHBlcnNcbiAqXG4gKi9cbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuXG52YXIgZm9jdXNhYmxlU2VsZWN0b3IgPSAnYVtocmVmXSwgYnV0dG9uLCBpbnB1dCwgb2JqZWN0LCBzZWxlY3QsIHRleHRhcmVhLCBbdGFiaW5kZXhdJztcblxuLyoqXG4gKiBiaW5kRm9jdXNhYmxlczogRmluZCBhbnkgZm9jdXNhYmxlIGNoaWxkIGVsZW1lbnRzIG9mIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgYW5kXG4gKiBhZGQgYW4gb25Gb2N1cyBoYW5kbGVyIHRvIGZvY3VzIG91ciBrZXlkb3duIGhhbmRsZXJzIG9uIHRoZSBwYXJlbnQgY29tcG9uZW50XG4gKiB3aGVuIHVzZXIga2V5cyBhcHBsaWVzIGZvY3VzIHRvIHRoZSBlbGVtZW50LlxuICpcbiAqIE5PVEU6IE9uZSBsaW1pdGF0aW9uIG9mIHRoaXMgcmlnaHQgbm93IGlzIHRoYXQgaWYgeW91IHRhYiBvdXQgb2YgdGhlXG4gKiBjb21wb25lbnQsIF9mb2N1c2VkSW5zdGFuY2Ugd2lsbCBzdGlsbCBiZSBzZXQgdW50aWwgbmV4dCBjbGljayBvciBtb3VudCBvclxuICogY29udHJvbGxlZCBmb2N1cy5cbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IGluc3RhbmNlIFRoZSBrZXktYm91bmQgY29tcG9uZW50IGluc3RhbmNlXG4gKiBAcGFyYW0ge2NhbGxiYWNrfSBhY3RpdmF0ZU9uRm9jdXMgVGhlIGZuIHRvIGZpcmUgd2hlbiBlbGVtZW50IGlzIGZvY3VzZWRcbiAqL1xuZnVuY3Rpb24gYmluZEZvY3VzYWJsZXMoaW5zdGFuY2UsIGFjdGl2YXRlT25Gb2N1cykge1xuICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKGluc3RhbmNlKTtcbiAgICAgIGlmIChub2RlKSB7XG4gICAgICAgIHZhciBmb2N1c2FibGVzID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKGZvY3VzYWJsZVNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGZvY3VzYWJsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIG9uRm9jdXMgPSBmdW5jdGlvbiBvbkZvY3VzKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBvbkZvY3VzUHJldiA9IGVsZW1lbnQub25mb2N1cztcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgYWN0aXZhdGVPbkZvY3VzKGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgaWYgKG9uRm9jdXNQcmV2KSBvbkZvY3VzUHJldi5jYWxsKGVsZW1lbnQsIGV2ZW50KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfTtcbiAgICAgICAgICBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmb2N1c2FibGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5vbmZvY3VzID0gb25Gb2N1cyhlbGVtZW50KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBub29wLCBtb3N0bHkgc3VwcHJlc3NpbmcgZXJyb3IgaGVyZSBodHRwczovL2dpdGh1Yi5jb20vZ2xvcnRoby9yZWFjdC1rZXlkb3duL2lzc3Vlcy83NlxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIGZpbmRDb250YWluZXJOb2RlczogQ2FsbGVkIGJ5IG91ciBjbGljayBoYW5kbGVyIHRvIGZpbmQgaW5zdGFuY2VzIHdpdGggbm9kZXNcbiAqIHRoYXQgYXJlIGVxdWFsIHRvIG9yIHRoYXQgY29udGFpbiB0aGUgY2xpY2sgdGFyZ2V0LiBBbnkgdGhhdCBwYXNzIHRoaXMgdGVzdFxuICogd2lsbCBiZSByZWNpcGllbnRzIG9mIHRoZSBuZXh0IGtleWRvd24gZXZlbnQuXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXQgVGhlIGNsaWNrIGV2ZW50LnRhcmdldCBET00gZWxlbWVudFxuICogQHJldHVybiB7ZnVuY3Rpb259IFJlZHVjZXIgZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gZmluZENvbnRhaW5lck5vZGVzKHRhcmdldCkge1xuICByZXR1cm4gZnVuY3Rpb24gKG1lbW8sIGluc3RhbmNlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBub2RlID0gUmVhY3RET00uZmluZERPTU5vZGUoaW5zdGFuY2UpO1xuICAgICAgaWYgKG5vZGUgJiYgKG5vZGUgPT09IHRhcmdldCB8fCBub2RlLmNvbnRhaW5zKHRhcmdldCkpKSB7XG4gICAgICAgIG1lbW8ucHVzaCh7IGluc3RhbmNlOiBpbnN0YW5jZSwgbm9kZTogbm9kZSB9KTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIHNvcnRCeURPTVBvc2l0aW9uOiBDYWxsZWQgYnkgb3VyIGNsaWNrIGhhbmRsZXIgdG8gc29ydCBhIGxpc3Qgb2YgaW5zdGFuY2VzXG4gKiBhY2NvcmRpbmcgdG8gbGVhc3QgLT4gbW9zdCBuZXN0ZWQuIFRoaXMgaXMgc28gdGhhdCBpZiBtdWx0aXBsZSBrZXlib3VuZFxuICogaW5zdGFuY2VzIGhhdmUgbm9kZXMgdGhhdCBhcmUgYW5jZXN0b3JzIG9mIHRoZSBjbGljayB0YXJnZXQsIHRoZXkgd2lsbCBiZVxuICogc29ydGVkIHRvIGxldCB0aGUgaW5zdGFuY2UgY2xvc2VzdCB0byB0aGUgY2xpY2sgdGFyZ2V0IGdldCBmaXJzdCBkaWJzIG9uIHRoZVxuICogbmV4dCBrZXkgZG93biBldmVudC5cbiAqL1xuZnVuY3Rpb24gc29ydEJ5RE9NUG9zaXRpb24oYSwgYikge1xuICByZXR1cm4gYS5ub2RlLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKGIubm9kZSkgPT09IDEwID8gMSA6IC0xO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7IGJpbmRGb2N1c2FibGVzOiBiaW5kRm9jdXNhYmxlcywgZmluZENvbnRhaW5lck5vZGVzOiBmaW5kQ29udGFpbmVyTm9kZXMsIHNvcnRCeURPTVBvc2l0aW9uOiBzb3J0QnlET01Qb3NpdGlvbiB9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9kb21faGVscGVycy5qc1xuLy8gbW9kdWxlIGlkID0gODQ3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogQG1vZHVsZSBMaXN0ZW5lcnNcbiAqXG4gKi9cblxuLy8gZmxhZyBmb3Igd2hldGhlciBjbGljayBsaXN0ZW5lciBoYXMgYmVlbiBib3VuZCB0byBkb2N1bWVudFxudmFyIF9jbGlja3NCb3VuZCA9IGZhbHNlO1xuXG4vLyBmbGFnIGZvciB3aGV0aGVyIGtleWRvd24gbGlzdGVuZXIgaGFzIGJlZW4gYm91bmQgdG8gZG9jdW1lbnRcbnZhciBfa2V5c0JvdW5kID0gZmFsc2U7XG5cbnZhciBMaXN0ZW5lcnMgPSB7XG4gIC8qKlxuICAgKiBfYmluZEtleXNcbiAgICpcbiAgICogQGFjY2VzcyBwdWJsaWNcbiAgICovXG4gIGJpbmRLZXlzOiBmdW5jdGlvbiBiaW5kS2V5cyhjYWxsYmFjaykge1xuICAgIGlmICghX2tleXNCb3VuZCkge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGNhbGxiYWNrKTtcbiAgICAgIF9rZXlzQm91bmQgPSB0cnVlO1xuICAgIH1cbiAgfSxcblxuXG4gIC8qKlxuICAgKiB1bmJpbmRLZXlzXG4gICAqXG4gICAqIEBhY2Nlc3MgcHVibGljXG4gICAqL1xuICB1bmJpbmRLZXlzOiBmdW5jdGlvbiB1bmJpbmRLZXlzKGNhbGxiYWNrKSB7XG4gICAgaWYgKF9rZXlzQm91bmQpIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBjYWxsYmFjayk7XG4gICAgICBfa2V5c0JvdW5kID0gZmFsc2U7XG4gICAgfVxuICB9LFxuXG5cbiAgLyoqXG4gICAqIGJpbmRDbGlja3NcbiAgICpcbiAgICogQGFjY2VzcyBwdWJsaWNcbiAgICovXG4gIGJpbmRDbGlja3M6IGZ1bmN0aW9uIGJpbmRDbGlja3MoY2FsbGJhY2spIHtcbiAgICBpZiAoIV9jbGlja3NCb3VuZCkge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYWxsYmFjaywgdHJ1ZSk7XG4gICAgICBfY2xpY2tzQm91bmQgPSB0cnVlO1xuICAgIH1cbiAgfSxcblxuXG4gIC8qKlxuICAgKiB1bmJpbmRDbGlja3NcbiAgICpcbiAgICogQGFjY2VzcyBwdWJsaWNcbiAgICovXG4gIHVuYmluZENsaWNrczogZnVuY3Rpb24gdW5iaW5kQ2xpY2tzKGNhbGxiYWNrKSB7XG4gICAgaWYgKF9jbGlja3NCb3VuZCkge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYWxsYmFjaywgdHJ1ZSk7XG4gICAgICBfY2xpY2tzQm91bmQgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IExpc3RlbmVycztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvbGlzdGVuZXJzLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gQ291bnRlciBiZWluZyBpbmNyZW1lbnRlZC4gSlMgaXMgc2luZ2xlLXRocmVhZGVkLCBzbyBpdCdsbCBKdXN0IFdvcmvihKIuXG52YXIgX19jb3VudGVyID0gMTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvY2Vzcy13aWRlIHVuaXF1ZSBpZGVudGlmaWVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB1dWlkKCkge1xuICByZXR1cm4gXCJ1aWQtXCIgKyBfX2NvdW50ZXIrKztcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvdXVpZC5qc1xuLy8gbW9kdWxlIGlkID0gODQ5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vXHQjIFBhcnNlciBSdWxlc1xuLy9cdFJ1bGVzIGNhbiBiZSBhcyBzaW1wbGUgYXMgYSBzdHJpbmcgYEtleXdvcmRgIG9yIGEgY29tcGxleCBzZXF1ZW5jZSBvZiAobmVzdGVkKSBydWxlcy5cbi8vXG4vL1x0UGFyc2UgYSBydWxlIHdpdGggYHJ1bGUucGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0LCBlbmQpYCwgdGhpcyB3aWxsIGVpdGhlcjpcbi8vXHRcdC0gcmV0dXJuIGB1bmRlZmluZWRgIGlmIHRoZSBydWxlIGRvZXNuJ3QgbWF0Y2ggdGhlIGhlYWQgb2YgdGhlIHRva2Vucywgb3Jcbi8vXHRcdC0gcmV0dXJuIGEgQ0xPTkUgb2YgdGhlIG1hdGNoZWQgcnVsZSB3aXRoIGF0IGxlYXN0IHRoZSBmb2xsb3dpbmc6XG4vL1x0XHRcdC0gYG1hdGNoZWRgXHRcdFJlc3VsdHMgb2YgeW91ciBwYXJzZS5cbi8vXHRcdFx0LSBgbmV4dFN0YXJ0YFx0UGxhY2Ugd2hlcmUgbmV4dCBtYXRjaCBzaG91bGQgc3RhcnQgKGVnOiBvbmUgYmV5b25kIHdoYXQgeW91IG1hdGNoZWQpLlxuLy9cbi8vXHRUaGUgY2xvbmUgcmV0dXJuZWQgYWJvdmUgY2FuIGJlIG1hbmlwdWxhdGVkIHdpdGhcbi8vXHRcdC0gYHJ1bGUudG9Tb3VyY2UoKWBcdCAgUmV0dXJuIGphdmFzY3JpcHQgc291cmNlIHRvIGludGVycHJldCB0aGUgcnVsZS5cbi8vXHRcdC0gYHJ1bGUudG9TeW50YXgoKWBcdCAgUmV0dXJuIHJ1bGVTeW50YXggZm9yIHRoZSBydWxlIChtb3N0bHkgZm9yIGRlYnVnZ2luZylcbi8vICAgIC1cbi8vXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuL1BhcnNlci5qc1wiO1xuaW1wb3J0IFRva2VuaXplciBmcm9tIFwiLi9Ub2tlbml6ZXIuanNcIjtcblxuaW1wb3J0IGdsb2JhbCBmcm9tIFwiLi91dGlscy9nbG9iYWxcIjtcbmltcG9ydCB7IGlzV2hpdGVzcGFjZSB9IGZyb20gXCIuL3V0aWxzL3N0cmluZ1wiO1xuXG5cbi8vIEFic3RyYWN0IFJ1bGUgY2xhc3MuXG4vLyBUT0RPQ1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnVsZSB7XG5cdGNvbnN0cnVjdG9yKC4uLnByb3BzKSB7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCAuLi5wcm9wcyk7XG5cdH1cblxuXHQvLyBDbG9uZSB0aGlzIHJ1bGUgYW5kIGFkZCBhbnkgYHByb3BzYCBwYXNzZWQgaW4uXG5cdGNsb25lKHByb3BzKSB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMsIHByb3BzKTtcblx0fVxuXG4vL1xuLy9cdFBhcnNpbmcgcHJpbWl0aXZlcyAtLSB5b3UgTVVTVCBpbXBsZW1lbnQgdGhlc2UgaW4geW91ciBzdWJjbGFzc2VzIVxuLy9cblxuXHQvLyBBdHRlbXB0IHRvIG1hdGNoIHRoaXMgcnVsZSBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgIG9mIGB0b2tlbnNgLlxuXHQvLyBSZXR1cm5zIHJlc3VsdHMgb2YgdGhlIHBhcnNlIG9yIGB1bmRlZmluZWRgLlxuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdC8vIFRlc3QgdG8gc2VlIGlmIGJpdHMgb2Ygb3VyIHJ1bGUgYXJlIGZvdW5kIEFOWVdIRVJFIGJldHdlZW4gYHN0YXJ0YCBhbmQgYGVuZGAgaW4gdGhlIGB0b2tlbnNgLlxuXHQvLyBUaGlzIGlzIHVzZWQgYnkgY29tcGxpY2F0ZWQgKGVnOiBsZWZ0IHJlY3Vyc2l2ZSkgcnVsZXMgdG8gZXhpdCBxdWlja2x5IGlmIHRoZXJlJ3Mgbm8gY2hhbmNlLlxuXHQvLyBSZXR1cm5zOlxuXHQvL1x0LSBgdHJ1ZWAgaWYgdGhlIHJ1bGUgTUlHSFQgYmUgbWF0Y2hlZC5cblx0Ly9cdC0gYGZhbHNlYCBpZiB0aGVyZSBpcyBOTyBXQVkgdGhlIHJ1bGUgY2FuIGJlIG1hdGNoZWQuXG5cdC8vXHQtIGB1bmRlZmluZWRgIGlmIG5vdCBkZXRlcm1pbnN0aWMgKGVnOiBubyB3YXkgdG8gdGVsbCBxdWlja2x5KS5cblx0dGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cbi8vXG4vLyAjIyBvdXRwdXQgYXMgc291cmNlXG4vL1xuXG5cdC8vIE91dHB1dCB2YWx1ZSBmb3IgdGhpcyBJTlNUQU5USUFURUQgcnVsZSBhcyBzb3VyY2UuXG5cdHRvU291cmNlKCkge1xuXHRcdHJldHVybiB0aGlzLm1hdGNoZWQ7XG5cdH1cblxuXG4vL1xuLy8gIyMgb3V0cHV0IGFzIHN0cnVjdHVyZTpcbi8vXG5cdHRvU3RydWN0dXJlKCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuLy9cbi8vICMjIHJlZmxlY3Rpb25cbi8vXG5cbn1cblxuXG4vLyBBYnN0cmFjdCBydWxlIGZvciBvbmUgb3IgbW9yZSBzZXF1ZW50aWFsIGxpdGVyYWwgdmFsdWVzIHRvIG1hdGNoLlxuLy8gYHJ1bGUubGl0ZXJhbHNgIGlzIHRoZSBsaXRlcmFsIHN0cmluZyBvciBhcnJheSBvZiBsaXRlcmFsIHN0cmluZ3MgdG8gbWF0Y2guXG4vLyBgcnVsZS5saXRlcmFsU2VwYXJhdG9yYCBpcyB0aGUgc3RyaW5nIHRvIHB1dCBiZXR3ZWVuIG11bHRpcGxlIGxpdGVyYWxzIHdoZW4gam9pbmluZy5cbi8vXG4vLyBBZnRlciBwYXJzaW5nXG4vLyAgYHJ1bGUubWF0Y2hlZGAgd2lsbCBiZSB0aGUgc3RyaW5nIHdoaWNoIHdhcyBtYXRjaGVkXG4vLyAgYHJ1bGUubmV4dFN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RhcnQgdG9rZW5cblJ1bGUuTGl0ZXJhbHMgPSBjbGFzcyBsaXRlcmFscyBleHRlbmRzIFJ1bGUge1xuXHRjb25zdHJ1Y3RvciguLi5wcm9wcykge1xuXHRcdHN1cGVyKC4uLnByb3BzKTtcblx0XHQvLyBjb2VyY2UgdG8gYW4gYXJyYXkgKGEgYml0IHNsb3dlciBidXQgY2xlYW5lcikuXG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHRoaXMubGl0ZXJhbHMpKSB0aGlzLmxpdGVyYWxzID0gW3RoaXMubGl0ZXJhbHNdO1xuXHR9XG5cblx0Ly8gQXR0ZW1wdCB0byBtYXRjaCB0aGlzIHJ1bGUgaW4gdGhlIGB0b2tlbnNgLlxuXHQvLyBSZXR1cm5zIHJlc3VsdHMgb2YgdGhlIHBhcnNlIG9yIGB1bmRlZmluZWRgLlxuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0aWYgKCF0aGlzLm1hdGNoZXNTdGFydGluZ0F0KHRva2Vucywgc3RhcnQsIGVuZCkpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZDogdGhpcy5saXRlcmFscy5qb2luKHRoaXMubGl0ZXJhbFNlcGFyYXRvciksXG5cdFx0XHRuZXh0U3RhcnQ6IHN0YXJ0ICsgdGhpcy5saXRlcmFscy5sZW5ndGhcblx0XHR9KTtcblx0fVxuXG5cdC8vIERvZXMgdGhpcyBtYXRjaCBhcHBlYXIgQU5ZV0hFUkUgaW4gdGhlIHRva2Vucz9cblx0dGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQgPSB0b2tlbnMubGVuZ3RoKSB7XG5cdCAgbGV0IGZpcnN0ID0gdGhpcy5saXRlcmFsc1swXTtcblx0ICBmb3IgKHZhciBpbmRleCA9IHN0YXJ0OyBpbmRleCA8IGVuZDsgaW5kZXgrKykge1xuXHQgICAgaWYgKHRva2Vuc1tpbmRleF0gIT09IGZpcnN0KSBjb250aW51ZTtcblx0ICAgIGlmICh0aGlzLm1hdGNoZXNTdGFydGluZ0F0KHRva2VucywgaW5kZXgsIGVuZCkpIHJldHVybiB0cnVlO1xuXHQgIH1cblx0ICByZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBNYXRjaCBvdXIgYGxpdGVyYWxzYCBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgIG9mIHRva2Vucy5cblx0bWF0Y2hlc1N0YXJ0aW5nQXQodG9rZW5zLCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGgpIHtcblx0ICBpZiAodGhpcy5saXRlcmFscy5sZW5ndGggPT09IDEpIHJldHVybiB0b2tlbnNbc3RhcnRdID09PSB0aGlzLmxpdGVyYWxzWzBdO1xuICAgIHJldHVybiB0aGlzLmxpdGVyYWxzLmV2ZXJ5KChsaXRlcmFsLCBpKSA9PiAoc3RhcnQgKyBpIDwgZW5kKSAmJiAobGl0ZXJhbCA9PT0gdG9rZW5zW3N0YXJ0ICsgaV0pKTtcblx0fVxuXG4gIHRvU291cmNlKCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoZWQ7XG4gIH1cblxuXHR0b1N5bnRheCgpIHtcblx0XHRyZXR1cm4gYCR7dGhpcy5saXRlcmFscy5qb2luKHRoaXMubGl0ZXJhbFNlcGFyYXRvciB8fCBcIlwiKX0ke3RoaXMub3B0aW9uYWwgPyAnPycgOiAnJ31gO1xuXHR9XG59XG5cbi8vIE9uZSBvciBtb3JlIGxpdGVyYWwgc3ltYm9sczogYDxgLCBgJWAgZXRjLlxuLy8gU3ltYm9scyBqb2luIFdJVEhPVVQgc3BhY2VzLlxuUnVsZS5TeW1ib2xzID0gY2xhc3Mgc3ltYm9scyBleHRlbmRzIFJ1bGUuTGl0ZXJhbHMge31cblxuXG4vLyBPbmUgb3IgbW9yZSBsaXRlcmFsIGtleXdvcmRzLlxuLy8gS2V5d29yZHMgam9pbiBXSVRIIHNwYWNlcy5cblJ1bGUuS2V5d29yZHMgPSBjbGFzcyBrZXl3b3JkcyBleHRlbmRzIFJ1bGUuTGl0ZXJhbHMge31cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShSdWxlLktleXdvcmRzLnByb3RvdHlwZSwgXCJsaXRlcmFsU2VwYXJhdG9yXCIsIHsgdmFsdWU6IFwiIFwiIH0pO1xuXG5cblxuLy8gUmVnZXggcGF0dGVybiB0byBtYXRjaCBhIFNJTkdMRSB0b2tlbi5cbi8vIGBydWxlLnBhdHRlcm5gIGlzIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gdG8gbWF0Y2guXG4vLyAgICBOb3RlIHRoYXQgeW91IE1VU1Qgc3RhcnQgeW91ciBwYXR0ZXJuIHdpdGggYF5gIGFuZCBlbmQgd2l0aCBgJGAgdG8gbWFrZSBzdXJlIGl0IG1hdGNoZXMgdGhlIGVudGlyZSB0b2tlbi5cbi8vICAgIE5vdGUgdGhhdCB0aGlzIGNhbiBvbmx5IG1hdGNoIGEgc2luZ2xlIHRva2VuIVxuLy8gYHJ1bGUuYmxhY2tsaXN0YCBpcyBhIG1hcCBvZiBgeyBrZXk6IHRydWUgfWAgZm9yIHN0cmluZ3Mgd2hpY2ggd2lsbCBOT1QgYmUgYWNjZXB0ZWQuXG4vL1xuLy8gQWZ0ZXIgcGFyc2luZ1xuLy8gIGBydWxlLm1hdGNoZWRgIHdpbGwgYmUgdGhlIHN0cmluZyB3aGljaCB3YXMgbWF0Y2hlZC5cbi8vICBgcnVsZS5uZXh0U3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGFydCB0b2tlbi5cblJ1bGUuUGF0dGVybiA9IGNsYXNzIHBhdHRlcm4gZXh0ZW5kcyBSdWxlIHtcblx0Ly8gQXR0ZW1wdCB0byBtYXRjaCB0aGlzIHBhdHRlcm4gYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgdG9rZW5zLlxuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0bGV0IHRva2VuID0gdG9rZW5zW3N0YXJ0XTtcblx0XHRpZiAodHlwZW9mIHRva2VuICE9PSBcInN0cmluZ1wiKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG1hdGNoID0gdG9rZW4ubWF0Y2godGhpcy5wYXR0ZXJuKTtcblx0XHRpZiAoIW1hdGNoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gYmFpbCBpZiBwcmVzZW50IGluIGJsYWNrbGlzdFxuXHRcdGxldCBtYXRjaGVkID0gbWF0Y2hbMF07XG5cdFx0aWYgKHRoaXMuYmxhY2tsaXN0ICYmIHRoaXMuYmxhY2tsaXN0W21hdGNoZWRdKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZCxcblx0XHRcdG5leHRTdGFydDogc3RhcnQgKyAxXG5cdFx0fSk7XG5cdH1cblxuXHQvLyBUZXN0IHRvIHNlZSBpZiBhbnkgb2Ygb3VyIHBhdHRlcm4gaXMgZm91bmQgQU5ZV0hFUkUgaW4gdGhlIHRva2Vucy5cblx0dGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRyZXR1cm4gdG9rZW5zLnNsaWNlKHN0YXJ0LCBlbmQpLnNvbWUodG9rZW4gPT4gdHlwZW9mIHRva2VuID09PSBcInN0cmluZ1wiICYmIHBhdHRlcm4udGVzdCh0b2tlbikpO1xuXHR9XG5cblx0dG9TeW50YXgoKSB7XG5cdFx0cmV0dXJuIHRoaXMucGF0dGVybi5zb3VyY2U7XG5cdH1cbn1cblxuXG4vLyBTdWJydWxlIC0tIG5hbWUgb2YgYW5vdGhlciBydWxlIHRvIGJlIGNhbGxlZC5cbi8vIGBydWxlLnN1YnJ1bGVgIGlzIHRoZSBuYW1lIG9mIHRoZSBydWxlIGluIGBwYXJzZXIucnVsZXNgLlxuLy9cbi8vIEFmdGVyIHBhcnNpbmdcbi8vICB3ZSdsbCByZXR1cm4gdGhlIGFjdHVhbCBydWxlIHRoYXQgd2FzIG1hdGNoZWQgKHJhdGhlciB0aGFuIGEgY2xvbmUgb2YgdGhpcyBydWxlKVxuUnVsZS5TdWJydWxlID0gY2xhc3Mgc3VicnVsZSBleHRlbmRzIFJ1bGUge1xuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0bGV0IG1hdGNoZWRSdWxlID0gcGFyc2VyLnBhcnNlTmFtZWRSdWxlKHRoaXMuc3VicnVsZSwgdG9rZW5zLCBzdGFydCwgZW5kLCBzdGFjaywgYHBhcnNlIHN1YnJ1bGUgJyR7dGhpcy5ydWxlfSdgKTtcblx0XHRpZiAoIW1hdGNoZWRSdWxlKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdGlmICh0aGlzLmFyZ3VtZW50KSBtYXRjaGVkUnVsZS5hcmd1bWVudCA9IHRoaXMuYXJndW1lbnQ7XG5cdFx0cmV0dXJuIG1hdGNoZWRSdWxlO1xuXHR9XG5cblx0Ly8gQXNrIHRoZSBzdWJydWxlIHRvIGZpZ3VyZSBvdXQgaWYgYSBtYXRjaCBpcyBwb3NzaWJsZS5cblx0dGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRyZXR1cm4gcGFyc2VyLnRlc3QodGhpcy5zdWJydWxlLCB0b2tlbnMsIHN0YXJ0LCBlbmQpO1xuXHR9XG5cblx0dG9TeW50YXgoKSB7XG5cdFx0cmV0dXJuIGB7JHt0aGlzLmFyZ3VtZW50ID8gdGhpcy5hcmd1bWVudCtcIjpcIiA6IFwiXCJ9JHt0aGlzLnN1YnJ1bGV9fSR7dGhpcy5vcHRpb25hbCA/ICc/JyA6ICcnfWA7XG5cdH1cbn1cblxuXG4vLyBTZXF1ZW5jZSBvZiBydWxlcyB0byBtYXRjaC5cbi8vICBgcnVsZS5ydWxlc2AgaXMgdGhlIGFycmF5IG9mIHJ1bGVzIHRvIG1hdGNoLlxuLy8gIGBydWxlLmxlZnRSZWN1cnNpdmVgIHNob3VsZCBiZSBgdHJ1ZWAgaWYgdGhlIGZpcnN0IG5vbi1vcHRpb25hbCBydWxlIGluIG91ciBgcnVsZXNgXG4vLyAgICBtYXkgZW5kIHVwIGNhbGxpbmcgdXMgYWdhaW4uICBJbiB0aGlzIGNhc2UsIHlvdSBzaG91bGQgcHJvdmlkZSBgcnVsZS50ZXN0UnVsZWAuXG4vL1xuLy8gQWZ0ZXIgcGFyc2luZ1xuLy8gIGBydWxlLm1hdGNoZWRgIHdpbGwgYmUgdGhlIGFycmF5IG9mIHJ1bGVzIHdoaWNoIHdlcmUgbWF0Y2hlZC5cbi8vICBgcnVsZS5uZXh0U3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGFydCB0b2tlbi5cblJ1bGUuU2VxdWVuY2UgPSBjbGFzcyBzZXF1ZW5jZSBleHRlbmRzIFJ1bGUge1xuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0Ly8gSWYgd2UgaGF2ZSBhIGB0ZXN0UnVsZWAgZGVmaW5lZFxuXHRcdGlmICh0aGlzLnRlc3RSdWxlKSB7XG5cdFx0XHQvLyBGb3JnZXQgaXQgaWYgdGhlcmUgaXMgTk8gV0FZIHRoZSBydWxlIGNvdWxkIGJlIG1hdGNoZWQuXG5cdFx0XHRpZiAocGFyc2VyLnRlc3QodGhpcy50ZXN0UnVsZSwgdG9rZW5zLCBzdGFydCkgPT09IGZhbHNlKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdC8vIElmIHdlJ3JlIGEgbGVmdFJlY3Vyc2l2ZSBzZXF1ZW5jZS4uLlxuXHRcdGlmICh0aGlzLmxlZnRSZWN1cnNpdmUpIHtcblx0XHRcdC8vIElmIHRoZSBzdGFjayBhbHJlYWR5IGNvbnRhaW5zIHRoaXMgcnVsZSwgZm9yZ2V0IGl0LlxuXHRcdFx0aWYgKHN0YWNrICYmIHN0YWNrLmluY2x1ZGVzKHRoaXMpKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0XHQvLyBDbG9uZSBzdGFjayBhbmQgYWRkIHRoaXMgcnVsZSBmb3IgcmVjdXJzaW9uLi4uXG5cdFx0XHRzdGFjayA9IHN0YWNrID8gc3RhY2suY29uY2F0KCkgOiBbXTtcblx0XHRcdHN0YWNrLnB1c2godGhpcyk7XG5cblx0XHRcdC8vIFRPRE86IFdlIGNvdWxkIGRpc3Rpbmd1aXNoIGJldHdlZW4gcHJvZHVjdGl2ZSBhbmQgdW5wcm9kdWN0aXZlIHJ1bGVzXG5cdFx0XHQvL1x0XHQgYnkgY2hlY2tpbmcgb25seSBydWxlcyB3aGljaCBvY2N1ciBhdCB0aGUgc2FtZSBgc3RhcnRgLi4uXG5cdFx0XHQvL1x0XHQgVGhpcyB3b3VsZCBwcm9iYWJseSBhbGxvdyBtb3JlIGludGVyZXN0aW5nIHRoaW5ncywgYnV0IGl0J3MgbXVjaCBtdWNoIHNsb3dlci5cblx0XHR9XG5cblx0XHRsZXQgbWF0Y2hlZCA9IFtdO1xuXHRcdGxldCBuZXh0U3RhcnQgPSBzdGFydDtcblx0XHRsZXQgaW5kZXggPSAwLCBydWxlID0gdW5kZWZpbmVkO1xuXHRcdHdoaWxlIChydWxlID0gdGhpcy5ydWxlc1tpbmRleCsrXSkge1xuXHRcdFx0bGV0IG1hdGNoID0gcnVsZS5wYXJzZShwYXJzZXIsIHRva2VucywgbmV4dFN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0XHRcdGlmICghbWF0Y2ggJiYgIXJ1bGUub3B0aW9uYWwpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRpZiAobWF0Y2gpIHtcblx0XHRcdFx0bWF0Y2hlZC5wdXNoKG1hdGNoKTtcblx0XHRcdFx0bmV4dFN0YXJ0ID0gbWF0Y2gubmV4dFN0YXJ0O1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBpZiB3ZSBnZXQgaGVyZSwgd2UgbWF0Y2hlZCBhbGwgdGhlIHJ1bGVzIVxuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQsXG5cdFx0XHRuZXh0U3RhcnRcblx0XHR9KTtcblx0fVxuXG5cbi8vVE9ET0Ncblx0Ly8gXCJnYXRoZXJcIiBhcmd1bWVudHMgaW4gcHJlcGFyYXRpb24gdG8gY2FsbCBgdG9Tb3VyY2UoKWBcblx0Ly8gT25seSBjYWxsYWJsZSBhZnRlciBwYXJzZSBpcyBjb21wbGV0ZWQuXG5cdC8vIFJldHVybnMgYW4gb2JqZWN0IHdpdGggcHJvcGVydGllcyBmcm9tIHRoZSBgbWF0Y2hlZGAgYXJyYXkgaW5kZXhlZCBieSBvbmUgb2YgdGhlIGZvbGxvd2luZzpcblx0Ly9cdFx0LSBgbWF0Y2guYXJndW1lbnRgOlx0XHRhcmd1bWVudCBzZXQgd2hlbiBydWxlIHdhcyBkZWNsYXJlZCwgZWc6IGB7dmFsdWU6bGl0ZXJhbH1gID0+IGB2YWx1ZWBcblx0Ly9cdFx0LSBgbWF0Y2guZ3JvdXBgOlx0XHQgIG5hbWUgb2YgZ3JvdXAgcnVsZSB3YXMgYWRkZWQgdG9cblx0Ly8gICAgLSBgbWF0Y2gubmFtZWA6ICAgICAgIG5hbWUgb2YgdGhlIHJ1bGUgaWYgc2V0IHVwIGJ5IHBhcnNlUnVsZVxuXHRnZXQgcmVzdWx0cygpIHtcblx0XHRpZiAoIXRoaXMubWF0Y2hlZCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRsZXQgcmVzdWx0cyA9IGFkZFJlc3VsdHMoe30sIHRoaXMubWF0Y2hlZCk7XG5cdFx0aWYgKHRoaXMuY29tbWVudCkgcmVzdWx0cy5jb21tZW50ID0gdGhpcy5jb21tZW50O1xuXHRcdHJldHVybiByZXN1bHRzO1xuXG4gICAgZnVuY3Rpb24gYWRkUmVzdWx0cyhyZXN1bHRzLCBtYXRjaGVkKSB7XG4gICAgICBsZXQgaW5kZXggPSAwLCBtYXRjaCA9IHVuZGVmaW5lZDtcbiAgICAgIHdoaWxlIChtYXRjaCA9IG1hdGNoZWRbaW5kZXgrK10pIHtcbiAgICAgICAgaWYgKG1hdGNoLnByb21vdGUpIHtcbiAgICAgICAgICBhZGRSZXN1bHRzKHJlc3VsdHMsIG1hdGNoLm1hdGNoZWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHNvdXJjZU5hbWUgPSBtYXRjaC5hcmd1bWVudCB8fCBtYXRjaC5ncm91cCB8fCBtYXRjaC5uYW1lO1xuICAgICAgICAgIGNvbnN0IG1hdGNoTmFtZSA9IFwiX1wiICsgc291cmNlTmFtZTtcbiAgICAgICAgICBjb25zdCBzb3VyY2UgPSBtYXRjaC50b1NvdXJjZSgpO1xuICAgICAgICAgIC8vIElmIGFyZyBhbHJlYWR5IGV4aXN0cywgY29udmVydCB0byBhbiBhcnJheVxuICAgICAgICAgIGlmIChtYXRjaE5hbWUgaW4gcmVzdWx0cykge1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHJlc3VsdHNbbWF0Y2hOYW1lXSkpIHtcbiAgICAgICAgICAgICAgcmVzdWx0c1ttYXRjaE5hbWVdID0gW3Jlc3VsdHNbbWF0Y2hOYW1lXV07XG4gICAgICAgICAgICAgIHJlc3VsdHNbc291cmNlTmFtZV0gPSBbcmVzdWx0c1tzb3VyY2VOYW1lXV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRzW21hdGNoTmFtZV0ucHVzaChtYXRjaCk7XG4gICAgICAgICAgICByZXN1bHRzW3NvdXJjZU5hbWVdLnB1c2goc291cmNlKVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdHNbbWF0Y2hOYW1lXSA9IG1hdGNoO1xuICAgICAgICAgICAgcmVzdWx0c1tzb3VyY2VOYW1lXSA9IHNvdXJjZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblx0fVxuXG5cdC8vIEVjaG8gdGhpcyBydWxlIGJhY2sgb3V0LlxuXHR0b1N5bnRheCgpIHtcblx0ICBjb25zdCBydWxlcyA9IHRoaXMucnVsZXMubWFwKHJ1bGUgPT4gcnVsZS50b1N5bnRheCgpKTtcblx0XHRyZXR1cm4gYCR7dGhpcy5ydWxlcy5qb2luKFwiIFwiKX0ke3RoaXMub3B0aW9uYWwgPyAnPycgOiAnJ31gO1xuXHR9XG5cbn1cblxuXG4vLyBBbHRlcm5hdGl2ZSBzeW50YXgsIG1hdGNoaW5nIG9uZSBvZiBhIG51bWJlciBvZiBkaWZmZXJlbnQgcnVsZXMuXG4vLyBUaGUgcmVzdWx0IG9mIGEgcGFyc2UgaXMgdGhlIGxvbmdlc3QgcnVsZSB0aGF0IGFjdHVhbGx5IG1hdGNoZWQuXG4vLyBOT1RFOiBDdXJyZW50bHkgdGFrZXMgdGhlIGxvbmdlc3QgdmFsaWQgbWF0Y2guXG4vLyBUT0RPOiBtYXRjaCBhbGwgdmFsaWQgYWx0ZXJuYXRpdmVzXG4vL1xuLy8gQWZ0ZXIgcGFyc2luZ1xuLy8gIHdlJ2xsIHJldHVybiB0aGUgcnVsZSB3aGljaCBpcyB0aGUgXCJiZXN0IG1hdGNoXCIgKHJhdGhlciB0aGFuIGNsb25pbmcgdGhpcyBydWxlKS5cblJ1bGUuQWx0ZXJuYXRpdmVzID0gY2xhc3MgYWx0ZXJuYXRpdmVzIGV4dGVuZHMgUnVsZSB7XG5cdGNvbnN0cnVjdG9yKC4uLnByb3BzKSB7XG5cdFx0c3VwZXIoLi4ucHJvcHMpO1xuXHRcdGlmICghdGhpcy5ydWxlcykgdGhpcy5ydWxlcyA9IFtdO1xuXHR9XG5cblx0Ly8gVGVzdCB0byBzZWUgaWYgYW55IG9mIG91ciBhbHRlcm5hdGl2ZXMgYXJlIGZvdW5kIEFOWVdIRVJFIGluIHRoZSB0b2tlbnMuXG5cdC8vIE5PVEU6IHRoaXMgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGlmIHdlJ3JlIHNwZWNpZmllZCBhcyBhIGB0ZXN0UnVsZWBcblx0Ly9cdFx0IGFuZCB0aGVuIG9ubHkgaWYgYWxsIG9mIG91ciBydWxlcyBhcmUgZGV0ZXJtaW5pc3RpYy5cblx0dGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRsZXQgaW5kZXggPSAwLCBydWxlID0gdW5kZWZpbmVkO1xuXHRcdHdoaWxlIChydWxlID0gdGhpcy5ydWxlc1tpbmRleCsrXSkge1xuXHRcdFx0aWYgKHJ1bGUudGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQsIGVuZCkpIHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBGaW5kIGFsbCBydWxlcyB3aGljaCBtYXRjaCBhbmQgZGVsZWdhdGUgdG8gYGdldEJlc3RNYXRjaCgpYCB0byBwaWNrIHRoZSBiZXN0IG9uZS5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGxldCBtYXRjaGVzID0gW107XG5cdFx0bGV0IGluZGV4ID0gMCwgcnVsZSA9IHVuZGVmaW5lZDtcblx0XHR3aGlsZSAocnVsZSA9IHRoaXMucnVsZXNbaW5kZXgrK10pIHtcblx0XHRcdGxldCBtYXRjaCA9IHJ1bGUucGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0XHRcdGlmIChtYXRjaCkgbWF0Y2hlcy5wdXNoKG1hdGNoKTtcblx0XHR9XG5cblx0XHRpZiAoIW1hdGNoZXMubGVuZ3RoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gdW5jb21tZW50IHRoZSBiZWxvdyB0byBwcmludCBhbHRlcm5hdGl2ZXNcblx0XHQvLyBpZiAobWF0Y2hlcy5sZW5ndGggPiAxKSB7XG5cdFx0Ly9cdGNvbnNvbGUuaW5mbyh0aGlzLmFyZ3VtZW50IHx8IHRoaXMuZ3JvdXAsIG1hdGNoZXMsIG1hdGNoZXMubWFwKG1hdGNoID0+IG1hdGNoLm1hdGNoZWRUZXh0KSk7XG5cdFx0Ly8gfVxuXG5cdFx0bGV0IGJlc3RNYXRjaCA9IChtYXRjaGVzLmxlbmd0aCA9PT0gMSA/IG1hdGNoZXNbMF0gOiB0aGlzLmdldEJlc3RNYXRjaChtYXRjaGVzKSk7XG5cblx0XHQvLyBhc3NpZ24gYGFyZ05hbWVgIG9yIGBncm91cGAgZm9yIGByZXN1bHRzYFxuXHRcdGlmICh0aGlzLmFyZ3VtZW50KSBiZXN0TWF0Y2guYXJndW1lbnQgPSB0aGlzLmFyZ3VtZW50O1xuXHRcdGVsc2UgaWYgKHRoaXMuZ3JvdXApIGJlc3RNYXRjaC5ncm91cCA9IHRoaXMuZ3JvdXA7XG4vL1RPRE86IG90aGVyIHRoaW5ncyB0byBjb3B5IGhlcmU/Pz9cblxuXHRcdHJldHVybiBiZXN0TWF0Y2g7XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIFwiYmVzdFwiIG1hdGNoIGdpdmVuIG1vcmUgdGhhbiBvbmUgbWF0Y2hlcyBhdCB0aGUgaGVhZCBvZiB0aGUgdG9rZW5zLlxuXHQvLyBEZWZhdWx0IGlzIHRvIHJldHVybiB0aGUgbG9uZ2VzdCBtYXRjaC5cblx0Ly8gSW1wbGVtZW50IHNvbWV0aGluZyBlbHNlIHRvIGRvLCBlZywgcHJlY2VkZW5jZSBydWxlcy5cblx0Z2V0QmVzdE1hdGNoKG1hdGNoZXMpIHtcblx0XHRyZXR1cm4gbWF0Y2hlcy5yZWR1Y2UoZnVuY3Rpb24gKGJlc3QsIGN1cnJlbnQpIHtcblx0XHRcdGlmIChjdXJyZW50Lm5leHRTdGFydCA+IGJlc3QubmV4dFN0YXJ0KSByZXR1cm4gY3VycmVudDtcblx0XHRcdHJldHVybiBiZXN0O1xuXHRcdH0sIG1hdGNoZXNbMF0pO1xuXHR9XG5cblx0YWRkUnVsZSguLi5ydWxlKSB7XG5cdFx0dGhpcy5ydWxlcy5wdXNoKC4uLnJ1bGUpO1xuXHR9XG5cblx0dG9TeW50YXgoKSB7XG5cdCAgY29uc3QgcnVsZXMgPSB0aGlzLnJ1bGVzLm1hcChydWxlID0+IHJ1bGUudG9TeW50YXgoKSkuam9pbihcInxcIik7XG5cdFx0cmV0dXJuIGAoJHt0aGlzLmFyZ3VtZW50ID8gdGhpcy5hcmd1bWVudCtcIjpcIiA6IFwiXCJ9JHtydWxlc30pJHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcblx0fVxufTtcblxuXG4vLyBSZXBlYXRpbmcgcnVsZS5cbi8vXHRgdGhpcy5yZXBlYXRgIGlzIHRoZSBydWxlIHRoYXQgcmVwZWF0cy5cbi8vICBgdGhpcy5vcHRpb25hbGAgaXMgdHJ1ZSBpZiB0aGUgcHJvZHV0aW9uIGlzIG9wdGlvbmFsLlxuLy9cdE5vdGU6IEF1dG9tYXRpY2FsbHkgY29uc3VtZXMgd2hpdGVzcGFjZSBiZWZvcmUgcnVsZXMuXG4vL1x0Tm90ZTogUmV0dXJucyBgdW5kZWZpbmVkYCBpZiB3ZSBkb24ndCBtYXRjaCBhdCBsZWFzdCBvbmNlLlxuLy9cbi8vIEFmdGVyIG1hdGNoaW5nOlxuLy9cdGB0aGlzLm1hdGNoZWRgIGlzIGFycmF5IG9mIG1hdGNoZWQgcnVsZXMuXG4vLyAgYHJ1bGUubmV4dFN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RhcnQgdG9rZW4uXG5SdWxlLlJlcGVhdCA9IGNsYXNzIHJlcGVhdCBleHRlbmRzIFJ1bGUge1xuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0bGV0IG1hdGNoZWQgPSBbXTtcblx0XHRsZXQgbmV4dFN0YXJ0ID0gc3RhcnQ7XG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdGxldCBtYXRjaCA9IHRoaXMucmVwZWF0LnBhcnNlKHBhcnNlciwgdG9rZW5zLCBuZXh0U3RhcnQsIGVuZCwgc3RhY2spO1xuXHRcdFx0aWYgKCFtYXRjaCkgYnJlYWs7XG5cblx0XHRcdG1hdGNoZWQucHVzaChtYXRjaCk7XG5cdFx0XHRuZXh0U3RhcnQgPSBtYXRjaC5uZXh0U3RhcnQ7XG5cdFx0fVxuXG5cdFx0aWYgKG1hdGNoZWQubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZCxcblx0XHRcdG5leHRTdGFydFxuXHRcdH0pO1xuXHR9XG5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0aWYgKCF0aGlzLm1hdGNoZWQpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hlZC5tYXAobWF0Y2ggPT4gbWF0Y2gudG9Tb3VyY2UoKSk7XG5cdH1cblxuXHR0b1N5bnRheCgpIHtcblx0XHRsZXQgaXNDb21wb3VuZFJ1bGUgPSAodGhpcy5yZXBlYXQgaW5zdGFuY2VvZiBSdWxlLlNlcXVlbmNlKVxuICAgICAgfHwgKHRoaXMucmVwZWF0IGluc3RhbmNlb2YgUnVsZS5MaXRlcmFscyAmJiB0aGlzLnJlcGVhdC5saXRlcmFscy5sZW5ndGggPiAxKTtcbiAgICBjb25zdCByZXBlYXQgPSB0aGlzLnJlcGVhdC50b1N5bnRheCgpO1xuXHRcdGNvbnN0IHJ1bGUgPSBpc0NvbXBvdW5kUnVsZSA/IGAoJHtyZXBlYXR9KWAgOiBgJHtyZXBlYXR9YDtcblx0XHRyZXR1cm4gYCR7cnVsZX0ke3RoaXMub3B0aW9uYWwgPyAnKicgOiAnKyd9YDtcblx0fVxufVxuXG5cbi8vIExpc3QgbWF0Y2ggcnVsZTogICBgWzxpdGVtPjxkZWxpbWl0ZXI+XWAuIGVnXCIgYFt7bnVtYmVyfSxdYCB0byBtYXRjaCBgMSwyLDNgXG4vL1x0YHJ1bGUuaXRlbWAgaXMgdGhlIHJ1bGUgZm9yIGVhY2ggaXRlbSxcbi8vXHRgcnVsZS5kZWxpbWl0ZXJgIGlzIHRoZSBkZWxpbWl0ZXIgYmV0d2VlbiBlYWNoIGl0ZW0sIHdoaWNoIGlzIG9wdGlvbmFsIGF0IHRoZSBlbmQuXG4vL1xuLy8gQWZ0ZXIgbWF0Y2hpbmc6XG4vL1x0YHRoaXMubWF0Y2hlZGAgaXMgYXJyYXkgb2YgbWF0Y2hlZCBpdGVtIHJ1bGVzIChkZWxtaXRlciBpcyBpZ25vcmVkKS5cbi8vICBgcnVsZS5uZXh0U3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGFydCB0b2tlbi5cbi8vXG4vLyBOT1RFOiB3ZSBhc3N1bWUgdGhhdCBhIExpc3QgcnVsZSBpdHNlbGYgd2lsbCBOT1QgcmVwZWF0ICg/Pz8/KVxuUnVsZS5MaXN0ID0gY2xhc3MgbGlzdCBleHRlbmRzIFJ1bGUge1xuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0Ly8gZW5zdXJlIGl0ZW0gYW5kIGRlbGltaXRlciBhcmUgb3B0aW9uYWwgc28gd2UgZG9uJ3QgYmFyZiBpbiBgcGFyc2VSdWxlYFxuLy9UT0RPOiA/Pz9cblx0XHR0aGlzLml0ZW0ub3B0aW9uYWwgPSB0cnVlO1xuXHRcdHRoaXMuZGVsaW1pdGVyLm9wdGlvbmFsID0gdHJ1ZTtcblxuXHRcdGxldCBtYXRjaGVkID0gW107XG5cdFx0bGV0IG5leHRTdGFydCA9IHN0YXJ0O1xuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHQvLyBnZXQgbmV4dCBpdGVtLCBleGl0aW5nIGlmIG5vdCBmb3VuZFxuXHRcdFx0bGV0IGl0ZW0gPSB0aGlzLml0ZW0ucGFyc2UocGFyc2VyLCB0b2tlbnMsIG5leHRTdGFydCwgZW5kLCBzdGFjayk7XG5cdFx0XHRpZiAoIWl0ZW0pIGJyZWFrO1xuXG5cdFx0XHRtYXRjaGVkLnB1c2goaXRlbSk7XG5cdFx0XHRuZXh0U3RhcnQgPSBpdGVtLm5leHRTdGFydDtcblxuXHRcdFx0Ly8gZ2V0IGRlbGltaXRlciwgZXhpdGluZyBpZiBub3QgZm91bmRcblx0XHRcdGxldCBkZWxpbWl0ZXIgPSB0aGlzLmRlbGltaXRlci5wYXJzZShwYXJzZXIsIHRva2VucywgbmV4dFN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0XHRcdGlmICghZGVsaW1pdGVyKSBicmVhaztcblx0XHRcdG5leHRTdGFydCA9IGRlbGltaXRlci5uZXh0U3RhcnQ7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgd2UgZGlkbid0IGdldCBhbnkgbWF0Y2hlcywgZm9yZ2V0IGl0LlxuXHRcdGlmIChtYXRjaGVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQsXG5cdFx0XHRuZXh0U3RhcnRcblx0XHR9KTtcblx0fVxuXG5cdC8vIFJldHVybnMgSlMgQXJyYXkgb2YgbWF0Y2hlZCBpdGVtcyBhcyBzb3VyY2UuXG4vL1RPRE86IGBKU0RlbGltaXRlcmAgdG8gcmV0dXJuIGFzIGEgc2luZ2xlIHN0cmluZz9cblx0dG9Tb3VyY2UoKSB7XG5cdFx0aWYgKCF0aGlzLm1hdGNoZWQpIHJldHVybiBbXTtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkLm1hcCggbWF0Y2ggPT4gbWF0Y2gudG9Tb3VyY2UoKSApO1xuXHR9XG5cblx0dG9TeW50YXgoKSB7XG5cdCAgY29uc3QgaXRlbSA9IHRoaXMuaXRlbS50b1N5bnRheCgpO1xuXHQgIGNvbnN0IGRlbGltaXRlciA9IHRoaXMuZGVsaW1pdGVyLnRvU3ludGF4KCk7XG5cdFx0cmV0dXJuIGBbJHt0aGlzLmFyZ3VtZW50ID8gdGhpcy5hcmd1bWVudCtcIjpcIiA6IFwiXCJ9JHtpdGVtfSAke2RlbGltaXRlcn1dJHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcblx0fVxufTtcblxuXG5cbi8vIEEgYmxvY2sgaXMgdXNlZCB0byBwYXJzZSBhIG5lc3RlZCBibG9jayBvZiBzdGF0ZW1lbnRzLlxuLy8gQWJzdHJhY3QgY2xhc3MuXG5SdWxlLkJsb2NrID0gY2xhc3MgYmxvY2sgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcblxuXHQvLyBQYXJzZSB0aGUgZW50aXJlIGBibG9ja2AsIHJldHVybmluZyByZXN1bHRzLlxuXHRwYXJzZUJsb2NrKHBhcnNlciwgYmxvY2ssIGluZGVudCA9IDApIHtcblx0XHRsZXQgbWF0Y2hlZCA9IFtdO1xuLy9jb25zb2xlLndhcm4oXCJibG9jazpcIiwgYmxvY2spO1xuXHRcdGJsb2NrLmNvbnRlbnRzLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG5cdFx0XHRsZXQgcmVzdWx0O1xuXHRcdFx0aWYgKGl0ZW0ubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdG1hdGNoZWQucHVzaChuZXcgUnVsZS5CbGFua0xpbmUoKSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChpdGVtIGluc3RhbmNlb2YgVG9rZW5pemVyLkJsb2NrKSB7XG5cdFx0XHQgIC8vIGlmIHRoZSBsYXN0IG1hdGNoZWQgaXRlbSB3YW50cyB0byBlYXQgYSBibG9jaywgZ2l2ZSBpdCB0aGUgYmxvY2tcblx0XHRcdFx0bGV0IGxhc3QgPSBtYXRjaGVkW21hdGNoZWQubGVuZ3RoIC0gMV07XG5cdFx0XHRcdGlmIChsYXN0LnBhcnNlQmxvY2spIHtcblx0XHRcdFx0XHRsYXN0LnBhcnNlQmxvY2socGFyc2VyLCBpdGVtLCBpbmRlbnQgKyAxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBvdGhlcndpc2UgYWRkIHRoZSBibG9jayB0byB0aGUgc3RyZWFtXG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGxldCBibG9jayA9IHRoaXMucGFyc2VCbG9jayhwYXJzZXIsIGl0ZW0sIGluZGVudCArIDEpO1xuXHRcdFx0XHRcdGlmIChibG9jayAhPT0gdW5kZWZpbmVkKSBtYXRjaGVkLnB1c2goYmxvY2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0bWF0Y2hlZCA9IG1hdGNoZWQuY29uY2F0KHRoaXMucGFyc2VTdGF0ZW1lbnQocGFyc2VyLCBpdGVtKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gbmV3IFJ1bGUuQmxvY2soe1xuXHRcdFx0aW5kZW50LFxuXHRcdFx0bWF0Y2hlZFxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gUGFyc2UgYSBzaW5nbGUgc3RhdGVtZW50IChhIGxpbmUncyB3b3J0aCBvZiBgdG9rZW5zYCkuXG5cdC8vIFNraXBzIHdoaXRlc3BhY2UgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZS5cblx0Ly8gQXV0by1tYXRjaGVzIGNvbW1lbnQgaW4gdGhlIG1pZGRsZSBvZiB0aGUgbGluZS5cblx0Ly8gUmV0dXJucyBhcnJheSBvZiByZXN1bHRzLlxuXHRwYXJzZVN0YXRlbWVudChwYXJzZXIsIHRva2Vucykge1xuXHRcdGxldCByZXN1bHRzID0gW107XG5cdFx0bGV0IHN0YXJ0ID0gMCwgZW5kID0gdG9rZW5zLmxlbmd0aDtcblx0XHRsZXQgc3RhdGVtZW50LCBjb21tZW50O1xuXG5cdFx0Ly8gY2hlY2sgZm9yIGFuIGluZGVudCBhdCB0aGUgc3RhcnQgb2YgdGhlIGxpbmVcblx0XHRpZiAodG9rZW5zW3N0YXJ0XSBpbnN0YW5jZW9mIFRva2VuaXplci5XaGl0ZXNwYWNlKSBzdGFydCsrO1xuXG5cdFx0Ly8gY2hlY2sgZm9yIGEgY29tbWVudCBhdCB0aGUgZW5kIG9mIHRoZSB0b2tlbnNcblx0XHRpZiAodG9rZW5zW2VuZC0xXSBpbnN0YW5jZW9mIFRva2VuaXplci5Db21tZW50KSB7XG5cdFx0XHRjb21tZW50ID0gcGFyc2VyLnBhcnNlTmFtZWRSdWxlKFwiY29tbWVudFwiLCB0b2tlbnMsIGVuZC0xLCBlbmQsIHVuZGVmaW5lZCwgXCJwYXJzZVN0YXRlbWVudFwiKTtcblx0XHRcdC8vIGFkZCBjb21tZW50IEZJUlNUIGlmIGZvdW5kXG5cdFx0XHRyZXN1bHRzLnB1c2goY29tbWVudCk7XG5cdFx0XHRlbmQtLTtcblx0XHR9XG5cblx0XHQvLyBwYXJzZSB0aGUgcmVzdCBhcyBhIFwic3RhdGVtZW50XCJcblx0XHRzdGF0ZW1lbnQgPSBwYXJzZXIucGFyc2VOYW1lZFJ1bGUoXCJzdGF0ZW1lbnRcIiwgdG9rZW5zLCBzdGFydCwgZW5kLCB1bmRlZmluZWQsIFwicGFyc2VTdGF0ZW1lbnRcIik7XG5cdFx0Ly8gY29tcGxhaW4gaWYgbm8gc3RhdGVtZW50IGFuZCBubyBjb21tZW50XG5cdFx0aWYgKCFzdGF0ZW1lbnQgJiYgIWNvbW1lbnQpIHtcblx0XHRcdGxldCBlcnJvciA9IG5ldyBSdWxlLlN0YXRlbWVudFBhcnNlRXJyb3Ioe1xuXHRcdFx0XHR1bnBhcnNlZDogdG9rZW5zLnNsaWNlKHN0YXJ0LCBlbmQpLmpvaW4oXCIgXCIpXG5cdFx0XHR9KTtcblx0XHRcdHJlc3VsdHMucHVzaChlcnJvcik7XG5cdFx0fVxuXG5cdFx0Ly8gY29tcGxhaW4gaWYgd2UgY2FuJ3QgcGFyc2UgdGhlIGVudGlyZSBsaW5lIVxuXHRcdGVsc2UgaWYgKHN0YXRlbWVudCAmJiBzdGF0ZW1lbnQubmV4dFN0YXJ0ICE9PSBlbmQpIHtcblx0XHRcdGxldCBlcnJvciA9IG5ldyBSdWxlLlN0YXRlbWVudFBhcnNlRXJyb3Ioe1xuXHRcdFx0XHRwYXJzZWQgOiB0b2tlbnMuc2xpY2Uoc3RhcnQsIHN0YXRlbWVudC5uZXh0U3RhcnQpLmpvaW4oXCIgXCIpLFxuXHRcdFx0XHR1bnBhcnNlZCA6IHRva2Vucy5zbGljZShzdGF0ZW1lbnQubmV4dFN0YXJ0LCBlbmQpLmpvaW4oXCIgXCIpXG5cdFx0XHR9KTtcblx0XHRcdHJlc3VsdHMucHVzaChlcnJvcik7XG5cdFx0fVxuXG5cdFx0Ly8gT3RoZXJ3aXNlIGFkZCB0aGUgc3RhdGVtZW50XG5cdFx0ZWxzZSBpZiAoc3RhdGVtZW50KSB7XG5cdFx0XHRyZXN1bHRzLnB1c2goc3RhdGVtZW50KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0cztcblx0fVxuXG5cdC8vIFJldHVybiBzb3VyY2UgZm9yIHRoaXMgYmxvY2sgYXMgYW4gYXJyYXkgb2YgaW5kZW50ZWQgbGluZXMgV0lUSE9VVCBge2AgT1IgYH1gLlxuXHRibG9ja1RvU291cmNlKGJsb2NrID0gdGhpcy5tYXRjaGVkKSB7XG5cdFx0bGV0IHJlc3VsdHMgPSBbXSwgc3RhdGVtZW50O1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBibG9jay5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGV0IG1hdGNoID0gYmxvY2tbaV07XG4gICAgICAvL2NvbnNvbGUuaW5mbyhpLCBtYXRjaCk7XG4gICAgICB0cnkge1xuICAgICAgICAgICAgc3RhdGVtZW50ID0gbWF0Y2gudG9Tb3VyY2UoKSB8fCBcIlwiO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICBjb25zb2xlLndhcm4oXCJFcnJvciBjb252ZXJ0aW5nIGJsb2NrOiBcIiwgYmxvY2ssIFwic3RhdGVtZW50OlwiLCBtYXRjaCk7XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUuaW5mbyhpLCBzdGF0ZW1lbnQpO1xuXHRcdFx0aWYgKGlzV2hpdGVzcGFjZShzdGF0ZW1lbnQpKSB7XG5cdFx0XHRcdHJlc3VsdHMucHVzaChcIlwiKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoc3RhdGVtZW50KSkge1xuXHRcdFx0XHRyZXN1bHRzID0gcmVzdWx0cy5jb25jYXQoc3RhdGVtZW50KTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiBzdGF0ZW1lbnQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0c3RhdGVtZW50ID0gc3RhdGVtZW50LnNwbGl0KFwiXFxuXCIpO1xuXHRcdFx0XHRyZXN1bHRzID0gcmVzdWx0cy5jb25jYXQoc3RhdGVtZW50KTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oXCJibG9ja1RvU291cmNlKCk6IERPTidUIEtOT1cgSE9XIFRPIFdPUksgV0lUSFxcblxcdFwiLCBzdGF0ZW1lbnQsIFwiXFxuXFx0ZnJvbSBtYXRjaFwiLCBtYXRjaCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICh0aGlzLmluZGVudCAhPT0gMCkge1xuXHRcdFx0cmV0dXJuIFwiXFx0XCIgKyByZXN1bHRzLmpvaW4oXCJcXG5cXHRcIik7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHRzLmpvaW4oXCJcXG5cIik7XG5cdH1cblxuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gXCJ7XFxuXCIgKyB0aGlzLmJsb2NrVG9Tb3VyY2UoKSArIFwiXFxuXCIgKyBcIn1cIjtcblx0fVxuXG5cdC8vIENvbnZlcnQgdG8gbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiBzdHJ1Y3R1cmUgYnkgY29udmVydGluZyBpbmRpdmlkdWFsIHN0YXRlbWVudHMgYW5kIGdyb3VwaW5nXG5cdC8vIE5PVEU6IHlvdSBzaG91bGQgb3ZlcnJpZGUgdGhpcyBhbmQgaW5jbHVkZSBcInR5cGVcIlxuXHR0b1N0cnVjdHVyZSgpIHtcblx0XHRsZXQgeyBfbmFtZTogbmFtZSwgX3N1cGVyVHlwZTogc3VwZXJUeXBlIH0gPSB0aGlzLnJlc3VsdHM7XG5cdFx0bGV0IGJsb2NrID0gKHRoaXMuYmxvY2sgJiYgdGhpcy5ibG9jay5tYXRjaGVkKSB8fCBbXTtcblxuXHRcdGxldCBuYW1lZCA9IHt9O1xuXHRcdGxldCBwcm9wZXJ0aWVzID0gW107XG5cdFx0bGV0IG1ldGhvZHMgPSBbXTtcblx0XHRsZXQgb3RoZXIgPSBbXTtcblx0XHRibG9jay5tYXAoc3RhdGVtZW50ID0+IHN0YXRlbWVudC50b1N0cnVjdHVyZSgpKVxuXHRcdFx0IC5maWx0ZXIoQm9vbGVhbilcblx0XHRcdCAuZm9yRWFjaChhZGRTdHJ1Y3R1cmUpO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHR5cGU6IFwidW5rbm93blwiLFxuXHRcdFx0bmFtZSxcblx0XHRcdHN1cGVyVHlwZSxcblx0XHRcdG5hbWVkLFxuXHRcdFx0cHJvcGVydGllcyxcblx0XHRcdG1ldGhvZHMsXG5cdFx0XHRvdGhlclxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGFkZFN0cnVjdHVyZShzdHJ1Y3R1cmUpIHtcblx0XHRcdC8vIGFkZCBhcnJheXMgYXMgaW5kaXZpZHVhbCBpdGVtc1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoc3RydWN0dXJlKSkgcmV0dXJuIHN0cnVjdHVyZS5mb3JFYWNoKGFkZFN0cnVjdHVyZSk7XG5cblx0XHRcdC8vIGFkZCB1bmRlciBgbmFtZWRgIGZvciBxdWljayBoaXQgb2YgYWxsIHNpZ25pZmljYW50IGJpdHMuLi5cblx0XHRcdGlmIChzdHJ1Y3R1cmUubmFtZSkgbmFtZWRbc3RydWN0dXJlLm5hbWVdID0gc3RydWN0dXJlO1xuXG5cdFx0XHQvLyBhZGQgdW5kZXIgJ21ldGhvZHMnLCAncHJvcGVydGllcycgb3IgJ290aGVyJ1xuXHRcdFx0aWYgKHN0cnVjdHVyZS50eXBlID09PSBcImZ1bmN0aW9uXCIpIG1ldGhvZHMucHVzaChzdHJ1Y3R1cmUpO1xuXHRcdFx0ZWxzZSBpZiAoc3RydWN0dXJlLnR5cGUgPT09IFwicHJvcGVydHlcIikgcHJvcGVydGllcy5wdXNoKHN0cnVjdHVyZSk7XG5cdFx0XHRlbHNlIG90aGVyLnB1c2goc3RydWN0dXJlKTtcblx0XHR9XG5cdH1cblxuXHQvLyBGb3JtYXQgYXJyYXkgb2YgYHN0YXRlbWVudHNgIGFzIGEgSlMgb3V0cHV0IGJsb2NrOlxuXHQvL1x0LSBpZiBgc3RhdGVtZW50c2AgaXMgZW1wdHksIHJldHVybnMgYHt9YFxuXHQvL1x0LSBpZiBgc3RhdGVtZW50cyBpcyBhIHNpbmdsZSBsaW5lLCByZXR1cm5zIGB7IHN0YXRlbWVudCB9YFxuXHQvL1x0LSBlbHNlIHJldHVybnMgbXVsdGlwbGUgbGluZXNcbiAgLy9cblx0Ly8gSW5kZW50cyB3aXRoIHRhYnMsIGUuZy4gIGB7wqzCu3N0YXRlbWVudF8xwqzCu3N0YXRlbWVudDLCrH1gXG5cdHN0YXRpYyBlbmNsb3NlU3RhdGVtZW50cyguLi5hcmdzKSB7XG5cdFx0dmFyIHN0YXRlbWVudHMgPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdGxldCBhcmcgPSBhcmdzW2ldO1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoYXJnKSkge1xuXHRcdFx0XHRzdGF0ZW1lbnRzID0gc3RhdGVtZW50cy5jb25jYXQoYXJnKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiBhcmcgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0c3RhdGVtZW50cy5wdXNoKGFyZyk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHN0YXRlbWVudHMgPSBzdGF0ZW1lbnRzLmpvaW4oXCJcXG5cIik7XG5cblx0XHRpZiAoIXN0YXRlbWVudHMpIHJldHVybiBcInt9XCI7XG5cdFx0aWYgKCFzdGF0ZW1lbnRzLmluY2x1ZGVzKFwiXFxuXCIpICYmIHN0YXRlbWVudHMubGVuZ3RoIDwgNDApIHtcblx0XHRcdHJldHVybiBgeyAke3N0YXRlbWVudHMudHJpbSgpfSB9YDtcblx0XHR9XG5cdFx0aWYgKHN0YXRlbWVudHNbMF0gIT09IFwiXFx0XCIpIHN0YXRlbWVudHMgPSBgXFx0JHtzdGF0ZW1lbnRzfWA7XG5cdFx0cmV0dXJuIGB7XFxuJHtzdGF0ZW1lbnRzfVxcbn1gO1xuXHR9XG5cbiAgLy8gRW5jbG9zZSBhIHNpbmdsZSBzdGF0ZW1lbnQuXG5cdHN0YXRpYyBlbmNsb3NlU3RhdGVtZW50KHN0YXRlbWVudCwgZm9yY2VXcmFwKSB7XG5cdFx0aWYgKCFzdGF0ZW1lbnQpIHJldHVybiBcInt9XCI7XG5cdFx0aWYgKCFmb3JjZVdyYXAgJiYgIXN0YXRlbWVudC5pbmNsdWRlcyhcIlxcblwiKSAmJiBzdGF0ZW1lbnQubGVuZ3RoIDwgNDApIHtcblx0XHRcdHJldHVybiBgeyAke3N0YXRlbWVudC50cmltKCl9IH1gO1xuXHRcdH1cblx0XHRpZiAoc3RhdGVtZW50WzBdICE9PSBcIlxcdFwiKSBzdGF0ZW1lbnQgPSBgXFx0JHtzdGF0ZW1lbnR9YDtcblx0XHRyZXR1cm4gYHtcXG4ke3N0YXRlbWVudH1cXG59YDtcblx0fVxuXG59XG5cblxuLy8gYFN0YXRlbWVudHNgIGFyZSBhIHNwZWNpYWwgY2FzZSBmb3IgYSBibG9jayBvZiBgU3RhdGVtZW50YCBydWxlc1xuLy9cdHRoYXQgdW5kZXJzdGFuZCBuZXN0aW5nIGFuZCBjb21tZW50cy5cbi8vXG4vLyBUaGlzIGlzIGEgdG9wLWxldmVsIGNvbnN0cnVjdCwgZS5nLiB1c2VkIHRvIHBhcnNlIGFuIGVudGlyZSBmaWxlLlxuUnVsZS5TdGF0ZW1lbnRzID0gY2xhc3Mgc3RhdGVtZW50cyBleHRlbmRzIFJ1bGUuQmxvY2sge1xuXG5cdC8vIFNwbGl0IHN0YXRlbWVudHMgdXAgaW50byBibG9ja3MgYW5kIHBhcnNlICdlbS5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kID0gdG9rZW5zLmxlbmd0aCwgc3RhY2spIHtcblx0XHR2YXIgYmxvY2sgPSBUb2tlbml6ZXIuYnJlYWtJbnRvQmxvY2tzKHRva2Vucywgc3RhcnQsIGVuZCk7XG5cblx0XHRsZXQgbWF0Y2hlZCA9IHRoaXMucGFyc2VCbG9jayhwYXJzZXIsIGJsb2NrKTtcblx0XHRpZiAoIW1hdGNoZWQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkLFxuXHRcdFx0bmV4dFN0YXJ0OiBlbmRcblx0XHR9KTtcblx0fVxuXG5cdC8vIE91dHB1dCBzdGF0ZW1lbnRzIFdJVEhPVVQgY3VybHkgYnJhY2VzIGFyb3VuZCB0aGVtLlxuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkLmJsb2NrVG9Tb3VyY2UoKTtcblx0fVxufVxuXG5cbi8vIEEgYEJsb2NrU3RhdGVtZW50YCAoZS5nLiBhbiBgaWZgIG9yIGByZXBlYXRgKTpcbi8vXHQtIGlzIGFzc3VtZWQgdG8gaGF2ZSBhbiBpbml0aWFsIHBhcnRpYWwgYHN0YXRlbWVudGBcbi8vXHQtIE1BWSBoYXZlIGFuIGlubGluZSBgc3RhdGVtZW50YCAob24gdGhlIHNhbWUgbGluZSwgcG9zc2libHkgYWZ0ZXIgYSBgOmApXG4vL1x0LSBNQVkgaGF2ZSBjb250ZW50cyBhcyBhbiBlbWJlZGRlZCBgYmxvY2tgXG4vLyBOb3RlIHRoYXQgaXQncyBjb25zaWRlcmVkIGFuIGVycm9yIHRvIGhhdmUgQk9USCBhbiBpbmxpbmUgc3RhdGVtZW50IEFORCBhIG5lc3RlZCBibG9jay5cbi8vXG4vLyAgZS5nLiBhIGBCbG9ja1N0YXRlbWVudGAgd2l0aCBzeW50YXggYGlmIHtleHByZXNzaW9ufSB0aGVuIHtzdGF0ZW1lbnR9P2Agd2lsbCBhdHRlbXQgdG86XG4vLyAgLSBtYXRjaCB0aGUgb3B0aW9uYWwgYHN0YXRlbWVudGAgYXMgYW4gaW5saW5lLXN0YXRlbWVudCAoYXMgYHJlc3VsdHMuc3RhdGVtZW50YClcbi8vICAtIG1hdGNoIGFuIElOREVOVEVEIGJsb2NrIHN0YXJ0aW5nIG9uIHRoZSBuZXh0IGxpbmUgKGFzIGByZXN1bHQuYmxvY2tgKVxuLy9cbi8vXHRGb3IgeW91ciBjb252ZW5pZW5jZSBpbiBgdG9Tb3VyY2UoKWAsIHlvdSBjYW4ganVzdCBsb29rIGF0IGByZXN1bHRzLnN0YXRlbWVudHNgXG4vLyAgd2hpY2ggd2lsbCBiZSBvbmUgb2YgdGhlIGZvbGxvd2luZyAod2hpY2hldmVyIGNvbWVzIGZpcnN0KTpcbi8vICAgIC0gdGhlIGJsb2NrIGFuZCBpdHMgc3RhdGVtZW50cywgZW5jbG9zZWQgaW4gY3VybHkgYnJhY2VzIGFuZCBpbmRlbnRlZCwgb3Jcbi8vICAgIC0gdGhlIGZvcm1hdHRlZCBgc3RhdGVtZW50YCwgZW5jbG9zZWQgaW4gY3VybHkgYnJhY2tldHMsXG4vLyAgICAtIGB7fWAgaWYgbmVpdGhlciBzdGF0ZW1lbnQgb3IgYmxvY2sgd2FzIG1hdGNoZWQuXG5SdWxlLkJsb2NrU3RhdGVtZW50ID0gY2xhc3MgYmxvY2tfc3RhdGVtZW50IGV4dGVuZHMgUnVsZS5CbG9jayB7XG5cblx0Ly8gUGFyc2UgYSBuZXN0ZWQgYmxvY2sgd2hpY2ggYXBwZWFycyBkaXJlY3RseSBhZnRlciBvdXIgXCJtYWluXCIgcnVsZS5cblx0Ly8gQWRkcyB0byBvdXIgYG1hdGNoZWRgIGxpc3QgYXMgbmVjZXNzYXJ5LlxuXHRwYXJzZUJsb2NrKCkge1xuXHQgIGlmICghdGhpcy5tYXRjaGVkKSB0aHJvdyBuZXcgUGFyc2VFcnJvcihgJHt0aGlzLm5hbWV8fFwiYmxvY2tTdGF0ZW1lbnRcIn0ucGFyc2VCbG9jaygpOiBubyBtYXRjaGVkIWApO1xuXHQgIGNvbnN0IGJsb2NrID0gc3VwZXIucGFyc2VCbG9jayguLi5hcmd1bWVudHMpO1xuXHQgIGlmICghYmxvY2spIHJldHVybjtcblx0ICBibG9jay5hcmd1bWVudCA9IFwiYmxvY2tcIjtcblx0ICB0aGlzLm1hdGNoZWQucHVzaChibG9jayk7XG5cdH1cblxuICAvLyBBZGQgYHN0YXRlbWVudHNgIHRvIHRoZSByZXN1bHRzLlxuICBnZXQgcmVzdWx0cygpIHtcbiAgICBjb25zdCByZXN1bHRzID0gc3VwZXIucmVzdWx0cztcbiAgICBpZiAoIXJlc3VsdHMpIHJldHVybiByZXN1bHRzO1xuXG4gICAgLy8gSWYgd2UgZ290IGEgYmxvY2ssIHVzZSB0aGF0IGZvciBvdXIgYHN0YXRlbWVudHNgXG4gICAgaWYgKHJlc3VsdHMuYmxvY2spIHtcbiAgICAgIHJlc3VsdHMuX3N0YXRlbWVudHMgPSByZXN1bHRzLl9ibG9jaztcbiAgICAgIHJlc3VsdHMuc3RhdGVtZW50cyA9IHJlc3VsdHMuYmxvY2s7XG4gICAgfVxuICAgIC8vIG90aGVyd2lzZSB1c2UgdGhlIGBzdGF0ZW1lbnRgLCBpZiBpdCdzIGVtcHR5IHRoaXMgd2lsbCByZXR1cm4gdGhlIGVtcHR5IHN0cmluZy5cbiAgICBlbHNlIHtcbiAgICAgIHJlc3VsdHMuX3N0YXRlbWVudHMgPSByZXN1bHRzLl9zdGF0ZW1lbnQ7XG4gICAgICByZXN1bHRzLnN0YXRlbWVudHMgPSBSdWxlLkJsb2NrLmVuY2xvc2VTdGF0ZW1lbnQocmVzdWx0cy5zdGF0ZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxufVxuXG5cbi8vIEJsYW5rIGxpbmUgcmVwcmVzZW50YXRpb24gaW4gcGFyc2VyIG91dHB1dC5cblJ1bGUuQmxhbmtMaW5lID0gY2xhc3MgYmxhbmtfbGluZSBleHRlbmRzIFJ1bGUge1xuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gXCJcXG5cIjtcblx0fVxufVxuXG4vLyBDb21tZW50IHJ1bGUgLS0gbWF0Y2hlcyB0b2tlbnMgb2YgdHlwZSBgVG9rZW5pemVyLkNvbW1lbnRgLlxuUnVsZS5Db21tZW50ID0gY2xhc3MgY29tbWVudCBleHRlbmRzIFJ1bGUge1xuXHQvLyBDb21tZW50cyBhcmUgc3BlY2lhbCBub2RlcyBpbiBvdXIgdG9rZW4gc3RyZWFtLlxuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0bGV0IHRva2VuID0gdG9rZW5zW3N0YXJ0XTtcblx0XHRpZiAoISh0b2tlbiBpbnN0YW5jZW9mIFRva2VuaXplci5Db21tZW50KSkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkOiB0b2tlbixcblx0XHRcdG5leHRTdGFydDogc3RhcnQgKyAxXG5cdFx0fSk7XG5cdH1cblxuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gYC8vJHt0aGlzLm1hdGNoZWQud2hpdGVzcGFjZX0ke3RoaXMubWF0Y2hlZC5jb21tZW50fWA7XG5cdH1cbn1cblxuLy8gUGFyc2VyIGVycm9yIHJlcHJlc2VudGF0aW9uIGluIHBhcnNlciBvdXRwdXQuXG5SdWxlLlN0YXRlbWVudFBhcnNlRXJyb3IgPSBjbGFzcyBwYXJzZV9lcnJvciBleHRlbmRzIFJ1bGUge1xuXHRjb25zdHJ1Y3RvciguLi5wcm9wcykge1xuXHRcdHN1cGVyKC4uLnByb3BzKTtcblx0XHRpZiAoUGFyc2VyLldBUk4pIGNvbnNvbGUud2Fybih0aGlzLm1lc3NhZ2UpO1xuXHR9XG5cblx0Z2V0IG1lc3NhZ2UoKSB7XG5cdFx0aWYgKHRoaXMucGFyc2VkKSB7XG5cdFx0XHRyZXR1cm4gXCJDQU5UIFBBUlNFIEVOVElSRSBTVEFURU1FTlRcXG5cIlxuXHRcdFx0XHQgKyBcIlBBUlNFRCAgICAgIDogYFwiKyB0aGlzLnBhcnNlZCArIFwiYFxcblwiXG5cdFx0XHRcdCArIFwiQ0FOJ1QgUEFSU0UgOiBgXCIrIHRoaXMudW5wYXJzZWQgKyBcImBcIjtcblx0XHR9XG5cdFx0cmV0dXJuIFwiQ0FOJ1QgUEFSU0UgU1RBVEVNRU5UOiBgXCIgKyB0aGlzLnVucGFyc2VkICsgXCJgXCI7XG5cdH1cblxuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gXCIvLyBcIiArIHRoaXMubWVzc2FnZS5zcGxpdChcIlxcblwiKS5qb2luKFwiXFxuLy8gXCIpO1xuXHR9XG59XG5cblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1J1bGUuanMiLCJpbXBvcnQgZmxhdHRlbiBmcm9tIFwibG9kYXNoL2ZsYXR0ZW4uanNcIjtcblxuaW1wb3J0IHsgZGVmaW5lTWVtb2l6ZWQgfSBmcm9tIFwiLi9tZW1vaXplLmpzXCI7XG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuL1BhcnNlci5qc1wiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4vUnVsZS5qc1wiO1xuaW1wb3J0IHsgY2xvbmVDbGFzcyB9IGZyb20gXCIuL3V0aWxzL2NsYXNzLmpzXCI7XG5pbXBvcnQgZ2xvYmFsIGZyb20gXCIuL3V0aWxzL2dsb2JhbC5qc1wiO1xuXG5cblxuLy9cbi8vXHQjIFBhcnNpbmcgYHJ1bGVTeW50YXhgIHRvIGNyZWF0ZSBydWxlcyBhdXRvbWF0aWNhbGx5LlxuLy9cbi8vIFRPRE86XHRCZXR0ZXIgbmFtZSBmb3IgYHJ1bGVTeW50YXhgXG4vLyBUT0RPOlx0VXNlIGtleXdvcmRzIGluIHN5bnRheCB0byBtYWtlIGEgcXVpY2sgcmVnZXgtYmFzZWQgYHRlc3RgIGZ1bmN0aW9uIGZvciB0aGUgZW50aXJlIHJ1bGVcblxuLy9cbi8vICMjIGdyb3VwOiBwYXJzaW5nIHN5bnRheFxuLy9cblxuLy8gUmV0dXJuIGFycmF5IG9mIHJ1bGVzIGdlbmVyYXRlZCBieSBwYXJzaW5nIHJ1bGUgYHN5bnRheGAsIGluc3RhbnRpYXRpbmcgd2l0aCBgY29uc3RydWN0b3JgIHBhc3NlZCBpbi5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlUnVsZShzeW50YXgsIGNvbnN0cnVjdG9yKSB7XG4gIC8vIElmIHdlIGdvdCBhbiBhcnJheSBvZiBwb3NzaWJsZSBzeW50YXhlcy4uLlxuICBpZiAoQXJyYXkuaXNBcnJheShzeW50YXgpKSB7XG4gICAgLy8gLi4ucmVjdXJzaXZlbHkgcGFyc2UgZWFjaCBzeW50YXgsIHVzaW5nIGEgQ0xPTkUgb2YgdGhlIGNvbnN0cnVjdG9yLlxuICAgIHJldHVybiBmbGF0dGVuKHN5bnRheC5tYXAoc3ludGF4ID0+IHBhcnNlUnVsZShzeW50YXgsIGNvbnN0cnVjdG9yICYmIGNsb25lQ2xhc3MoY29uc3RydWN0b3IpKSApKTtcbiAgfTtcblxuICBsZXQgcnVsZXMgPSBwYXJzZVN5bnRheChzeW50YXgpO1xuICBpZiAocnVsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBwYXJzZXIuZGVmaW5lUnVsZSgke25hbWVzWzBdfSwgJHtzeW50YXh9KTogbm8gcnVsZSBwcm9kdWNlZGApO1xuICB9XG5cbiAgaWYgKCFjb25zdHJ1Y3Rvcikge1xuICAgIC8vIElmIHdlIG9ubHkgZ290IG9uZSBydWxlLCBqdXN0IHJldHVybiBpdFxuICAgIGlmIChydWxlcy5sZW5ndGggPT09IDEpIHJldHVybiBydWxlcztcblxuICAgIC8vIE90aGVyd2lzZSBncm91cCB0aGUgcnVsZXMgdG9nZXRoZXIgYW5kIHJldHVybiB0aGF0XG4gICAgcmV0dXJuIFsgbmV3IFJ1bGUuQWx0ZXJuYXRpdmVzKHsgcnVsZXMgfSkgXTtcbiAgfVxuICBlbHNlIHtcbiAgICAvLyBNYWtlIGFuIGluc3RhbmNlIG9mIHRoZSBydWxlIGFuZCBhZGQgcmVsZXZhbnQgcHJvcGVydGllcyB0byBpdHMgcHJvdG90eXBlIG5vbi1lbnVtZXJhYmx5XG4gICAgaWYgKGNvbnN0cnVjdG9yLnByb3RvdHlwZSBpbnN0YW5jZW9mIFJ1bGUuS2V5d29yZHNcbiAgICAgfHwgY29uc3RydWN0b3IucHJvdG90eXBlIGluc3RhbmNlb2YgUnVsZS5TeW1ib2xzXG4gICAgIHx8IGNvbnN0cnVjdG9yLnByb3RvdHlwZSBpbnN0YW5jZW9mIFJ1bGUuTGlzdFxuICAgICB8fCBjb25zdHJ1Y3Rvci5wcm90b3R5cGUgaW5zdGFuY2VvZiBSdWxlLkFsdGVybmF0aXZlc1xuICAgICkge1xuICAgICAgZm9yIChsZXQgcHJvcGVydHkgaW4gcnVsZXNbMF0pIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvcGVydHksIHsgdmFsdWU6IHJ1bGVzWzBdW3Byb3BlcnR5XSB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IucHJvdG90eXBlLCBcInJ1bGVzXCIsIHsgdmFsdWU6IHJ1bGVzIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBbIG5ldyBjb25zdHJ1Y3RvcigpIF07XG4gIH1cbn1cblxuZnVuY3Rpb24gdG9rZW5pc2VSdWxlU3ludGF4KHN5bnRheCkge1xuICBjb25zdCBTWU5UQVhfRVhQUkVTU0lPTiA9IC8oPzpbXFx3XFwtXSt8XFxcXFtcXFtcXChcXHtcXClcXH1cXF1dfFteXFxzXFx3XXxcXHwpL2c7XG4gIGxldCBzeW50YXhTdHJlYW0gPSBzeW50YXgubWF0Y2goU1lOVEFYX0VYUFJFU1NJT04pO1xuICBpZiAoIXN5bnRheFN0cmVhbSkgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBDYW4ndCB0b2tlbml6ZSBwYXJzZSBydWxlIHN5bnRheCA+PiR7c3ludGF4fTw8YCk7XG4gIHJldHVybiBzeW50YXhTdHJlYW07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVN5bnRheChzeW50YXgsIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCkge1xuICBpZiAoc3ludGF4ID09IG51bGwpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJwYXJzZVN5bnRheCgpOiBgc3ludGF4YCBpcyByZXF1aXJlZFwiKTtcbiAgY29uc3Qgc3ludGF4U3RyZWFtID0gdHlwZW9mIHN5bnRheCA9PT0gXCJzdHJpbmdcIlxuICAgID8gdG9rZW5pc2VSdWxlU3ludGF4KHN5bnRheClcbiAgICA6IHN5bnRheDtcblxuICBsZXQgbGFzdEluZGV4ID0gc3ludGF4U3RyZWFtLmxlbmd0aDtcbiAgd2hpbGUgKHN0YXJ0IDwgbGFzdEluZGV4KSB7XG4gICAgbGV0IFsgcnVsZSwgZW5kIF0gPSBwYXJzZVRva2VuKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICBpZiAocnVsZSkge1xuICAgICAgbGV0IGxhc3QgPSBydWxlc1tydWxlcy5sZW5ndGgtMV07XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgYFN5bWJvbGAgYW5kIGxhc3Qgd2FzIGEgYFN5bWJvbGAsIG1lcmdlIHRvZ2V0aGVyXG4gICAgICBpZiAobGFzdCAmJiBsYXN0IGluc3RhbmNlb2YgUnVsZS5TeW1ib2xzICYmIHJ1bGUgaW5zdGFuY2VvZiBSdWxlLlN5bWJvbHMpIHtcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBsYXN0IHJ1bGVcbiAgICAgICAgcnVsZXMucG9wKCk7XG4gICAgICAgIC8vIGFuZCByZXBsYWNlIHdpdGggYSBydWxlIHRoYXQgbWVyZ2VzIHRoZSBrZXl3b3Jkc1xuICAgICAgICBydWxlLmxpdGVyYWxzID0gbGFzdC5saXRlcmFscy5jb25jYXQocnVsZS5saXRlcmFscyk7XG4gICAgICB9XG4gICAgICBydWxlcy5wdXNoKHJ1bGUpO1xuICAgIH1cbiAgICBzdGFydCA9IGVuZCArIDE7XG4gIH1cbiAgcmV0dXJuIHJ1bGVzO1xufVxuXG5jb25zdCBLRVlXT1JEX1BBVFRFUk4gPSAvW0EtWmEtel1bXFx3Xy1dKi87XG5mdW5jdGlvbiBwYXJzZVRva2VuKHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwKSB7XG4gIGxldCBzeW50YXhUb2tlbiA9IHN5bnRheFN0cmVhbVtzdGFydF07XG5cbiAgLy8gaWYgd2UgZ290IGEgXCJcXFxcXCIgKHdoaWNoIGFsc28gaGFzIHRvIGdvIGludG8gdGhlIHNvdXJjZSBzdHJpbmcgYXMgXCJcXFxcXCIpXG4gIC8vIHRyZWF0IHRoZSBuZXh0IHRva2VuIGFzIGEgbGl0ZXJhbCBzdHJpbmcgcmF0aGVyIHRoYW4gYXMgYSBzcGVjaWFsIGNoYXJhY3Rlci5cbiAgaWYgKHN5bnRheFRva2VuID09PSBcIlxcXFxcIikge1xuICAgIHJldHVybiBwYXJzZVN5bWJvbChzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCArIDEpO1xuICB9XG5cbiAgc3dpdGNoIChzeW50YXhUb2tlbikge1xuICAgIGNhc2UgXCJ7XCI6XHRyZXR1cm4gcGFyc2VTdWJydWxlKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICBjYXNlIFwiKFwiOlx0cmV0dXJuIHBhcnNlQWx0ZXJuYXRpdmVzKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICBjYXNlIFwiW1wiOlx0cmV0dXJuIHBhcnNlTGlzdChzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgY2FzZSBcIipcIjpcbiAgICBjYXNlIFwiK1wiOlxuICAgIGNhc2UgXCI/XCI6XHRyZXR1cm4gcGFyc2VSZXBlYXQoc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuXG4gICAgLy8gdGhlIGZvbGxvd2luZyBzaG91bGQgQUxXQVlTIGJlIGNvbnN1bWVkIGJ5IHRoZSBhYm92ZVxuICAgIGNhc2UgXCJ9XCI6XG4gICAgY2FzZSBcIilcIjpcbiAgICBjYXNlIFwiXVwiOlxuICAgIGNhc2UgXCJ8XCI6XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFVuZXhwZWN0ZWQgJHtzeW50YXhUb2tlbn0gZm91bmQgYXMgaXRlbSAke3N0YXJ0fSBvZiAke3N5bnRheFN0cmVhbX1gKTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICBpZiAoc3ludGF4VG9rZW4ubWF0Y2goS0VZV09SRF9QQVRURVJOKSkge1xuICAgICAgICByZXR1cm4gcGFyc2VLZXl3b3JkKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gcGFyc2VTeW1ib2woc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuICAgICAgfVxuICB9XG59XG5cblxuLy8gTWF0Y2ggYGtleXdvcmRgIGluIHN5bnRheCBydWxlcy5cbi8vIElmIG1vcmUgdGhhbiBvbmUga2V5d29yZCBhcHBlYXJzIGluIGEgcm93LCBjb21iaW5lcyB0aGVtIGludG8gYSBzaW5nbGUgYEtleXdvcmRgIG9iamVjdC5cbi8vIFRoaXMgaXMgcHJldHR5IHNhZmUsIHVubGVzcyB5b3UgaGF2ZSBhbiBvcHRpb25hbCBrZXl3b3JkIGxpa2Vcbi8vXHRcdGB0aGUge2lkZW50aWZpZXJ9IG9mIHRoZT8ge2V4cHJlc3Npb259YFxuLy8gaW4gd2hpY2ggY2FzZSB5b3UgY2FuIHB1dCB0aGUgb3B0aW9uYWwga2V5d29yZCBpbiBwYXJlbnNcbi8vXHRcdGB0aGUge2lkZW50aWZpZXJ9IG9mICh0aGU/KSB7ZXhwcmVzc2lvbn1gXG4vL1xuLy8gUmV0dXJucyBgWyBydWxlLCBlbmQgXWBcbi8vIFRocm93cyBpZiBpbnZhbGlkLlxuZnVuY3Rpb24gcGFyc2VLZXl3b3JkKHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwLCBjb25zdHJ1Y3RvciA9IFJ1bGUuS2V5d29yZHMpIHtcbiAgbGV0IGxpdGVyYWxzID0gW10sIGVuZDtcbiAgLy8gZWF0IGtleXdvcmRzIHdoaWxlIHRoZXkgbGFzdFxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBzeW50YXhTdHJlYW0ubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgbmV4dCA9IHN5bnRheFN0cmVhbVtpXTtcbiAgICBpZiAodHlwZW9mIG5leHQgPT09IFwic3RyaW5nXCIgJiYgbmV4dC5tYXRjaChLRVlXT1JEX1BBVFRFUk4pKSB7XG4gICAgICBsaXRlcmFscy5wdXNoKG5leHQpO1xuICAgICAgZW5kID0gaTtcbiAgICB9XG4gICAgZWxzZSBicmVhaztcbiAgfVxuXG4gIGxldCBydWxlID0gbmV3IGNvbnN0cnVjdG9yKHsgbGl0ZXJhbHMgfSk7XG4gIHJldHVybiBbIHJ1bGUsIGVuZCBdO1xufVxuXG4vLyBNYXRjaCBga2V5d29yZGAgaW4gc3ludGF4IHJ1bGVzLlxuLy8gUmV0dXJucyBgWyBydWxlLCBlbmQgXWBcbi8vIFRocm93cyBpZiBpbnZhbGlkLlxuZnVuY3Rpb24gcGFyc2VTeW1ib2woc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDAsIGNvbnN0cnVjdG9yID0gUnVsZS5TeW1ib2xzKSB7XG4gIGxldCBzdHJpbmcgPSBzeW50YXhTdHJlYW1bc3RhcnRdO1xuICBpZiAoIWNvbnN0cnVjdG9yKSBjb25zdHJ1Y3RvciA9IFJ1bGUuU3ltYm9scztcblxuICAvLyBJZiBzdHJpbmcgc3RhcnRzIHdpdGggYFxcXFxgLCBpdCdzIGFuIGVzY2FwZWQgbGl0ZXJhbCAoZWc6IGBcXFtgIG5lZWRzIHRvIGlucHV0IGFzIGBcXFxcW2ApLlxuICBsZXQgaXNFc2NhcGVkID0gc3RyaW5nLnN0YXJ0c1dpdGgoXCJcXFxcXCIpO1xuICBsZXQgbGl0ZXJhbHMgPSBpc0VzY2FwZWQgPyBzdHJpbmcuc3Vic3RyKDEpIDogc3RyaW5nO1xuXG4gIGxldCBydWxlID0gbmV3IGNvbnN0cnVjdG9yKHsgbGl0ZXJhbHMgfSk7XG5cbiAgaWYgKGlzRXNjYXBlZCkge1xuICAgIHJ1bGUudG9TeW50YXggPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBgXFxcXCR7bGl0ZXJhbHN9JHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gWyBydWxlLCBzdGFydCBdO1xufVxuXG5cbi8vIE1hdGNoIGdyb3VwaW5nIGV4cHJlc3Npb24gYCguLi58Li4uKWAgaW4gc3ludGF4IHJ1bGVzLlxuLy8gUmV0dXJucyBgWyBydWxlLCBlbmQgXWBcbi8vIFlvdSBjYW4gc3BlY2lmeSBhbiBleHBsaWNpdCBgcnVsZS5hcmd1bWVudGAgd2l0aDogIGAoc29tZWFyZzouLi4pYFxuLy8gWW91IGNhbiBzcGVjaWZ5IHRoYXQgdGhlIHJlc3VsdHMgc2hvdWxkIGJlIGBwcm9tb3RlZGAgdG8gZW5jbG9zaW5nIHJ1bGUgd2l0aDogYCg/Oi4uLilgXG4vL1xuLy8gTk9URTogbmVzdGVkIHBhcmVucyBtYXkgbm90IGhhdmUgYWx0ZXJuYXRpdmVzLi4uIDotKCAgIGAoYXwoYnxjKSlgIHdvbid0IHdvcms/Pz9cbmZ1bmN0aW9uIHBhcnNlQWx0ZXJuYXRpdmVzKHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwKSB7XG4gIGxldCB7IGVuZCwgc2xpY2UgfSA9IFBhcnNlci5maW5kTmVzdGVkVG9rZW5zKHN5bnRheFN0cmVhbSwgXCIoXCIsIFwiKVwiLCBzdGFydCk7XG5cbiAgLy8gcHVsbCBvdXQgZXhwbGljaXQgXCJwcm9tb3RlXCIgZmxhZzogYD86YFxuICBsZXQgcHJvbW90ZSA9IChzbGljZVswXSA9PT0gXCI/XCIgJiYgc2xpY2VbMV0gPT09IFwiOlwiKTtcbiAgaWYgKHByb21vdGUpIHtcbiAgICBzbGljZSA9IHNsaWNlLnNsaWNlKDIpO1xuICB9XG5cbiAgLy8gcHVsbCBvdXQgZXhwbGljaXQgYXJndW1lbnQgbmFtZVxuICBsZXQgYXJndW1lbnQ7XG4gIGlmIChzbGljZS5sZW5ndGggPiAyICYmIHNsaWNlWzFdID09PSBcIjpcIikge1xuICAgIGFyZ3VtZW50ID0gc2xpY2VbMF07XG4gICAgc2xpY2UgPSBzbGljZS5zbGljZSgyKTtcbiAgfVxuXG4gIC8vIHNwbGl0IGludG8gZ3JvdXBzLCBpbmNsdWRpbmcgbmVzdGVkIHBhcmVuc1xuICBsZXQgYWx0ZXJuYXRpdmVzID1cbiAgICBncm91cEFsdGVybmF0aXZlcyhzbGljZSlcbiAgICAubWFwKGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICBsZXQgcmVzdWx0cyA9IHBhcnNlU3ludGF4KGdyb3VwLCBbXSk7XG4gICAgICBpZiAocmVzdWx0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNbMF07XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSdWxlLlNlcXVlbmNlKHsgcnVsZXM6IHJlc3VsdHMgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgbGV0IHJ1bGUgPSBhbHRlcm5hdGl2ZXMubGVuZ3RoID09PSAxID8gYWx0ZXJuYXRpdmVzWzBdIDogbmV3IFJ1bGUuQWx0ZXJuYXRpdmVzKHsgcnVsZXM6IGFsdGVybmF0aXZlcyB9KTtcbiAgaWYgKGFyZ3VtZW50KSBydWxlLmFyZ3VtZW50ID0gYXJndW1lbnQ7XG4gIGlmIChwcm9tb3RlKSBydWxlLnByb21vdGUgPSB0cnVlO1xuICByZXR1cm4gWyBydWxlLCBlbmQgXTtcbn1cblxuZnVuY3Rpb24gZ3JvdXBBbHRlcm5hdGl2ZXModG9rZW5zKSB7XG4gIGxldCBhbHRlcm5hdGl2ZXMgPSBbXTtcbiAgbGV0IGN1cnJlbnQgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDAsIHRva2VuOyB0b2tlbiA9IHRva2Vuc1tpXTsgaSsrKSB7XG4gICAgLy8gaGFuZGxlIGFsdGVybmF0ZSBtYXJrZXJcbiAgICBpZiAodG9rZW4gPT09IFwifFwiKSB7XG4gICAgICBhbHRlcm5hdGl2ZXMucHVzaChjdXJyZW50KTtcbiAgICAgIGN1cnJlbnQgPSBbXTtcbiAgICB9XG4gICAgLy8gaGFuZGxlIG5lc3RlZCBwYXJlbnNcbiAgICBlbHNlIGlmICh0b2tlbiA9PT0gXCIoXCIpIHtcbiAgICAgIGxldCB7IGVuZCB9ID0gUGFyc2VyLmZpbmROZXN0ZWRUb2tlbnModG9rZW5zLCBcIihcIiwgXCIpXCIsIGkpO1xuICAgICAgY3VycmVudCA9IGN1cnJlbnQuY29uY2F0KHRva2Vucy5zbGljZShpLCBlbmQgKyAxKSk7XG4gICAgICBpID0gZW5kO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGN1cnJlbnQucHVzaCh0b2tlbik7XG4gICAgfVxuICB9XG4gIGlmIChjdXJyZW50Lmxlbmd0aCkgYWx0ZXJuYXRpdmVzLnB1c2goY3VycmVudCk7XG4gIHJldHVybiBhbHRlcm5hdGl2ZXM7XG59XG5cbi8vIE1hdGNoIHJlcGVhdCBpbmRpY2F0b3IgYD9gLCBgK2Agb3IgYCpgIGJ5IGF0dGFjaGluZyBpdCB0byB0aGUgcHJldmlvdXMgcnVsZS5cbmZ1bmN0aW9uIHBhcnNlUmVwZWF0KHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwKSB7XG4gIGxldCBzeW1ib2wgPSBzeW50YXhTdHJlYW1bc3RhcnRdO1xuICBsZXQgcnVsZSA9IHJ1bGVzW3J1bGVzLmxlbmd0aCAtIDFdO1xuICBpZiAoIXJ1bGUpIHRocm93IG5ldyBTeW50YXhFcnJvcihgQ2FuJ3QgYXR0YWNoIHJlcGVhdCBzeW1ib2wgJHtzeW1ib2x9IHRvIGVtcHR5IHJ1bGUhYCk7XG5cbiAgLy8gVHJhbnNmb3JtIGxhc3QgcnVsZSBpbnRvIGEgcmVwZWF0IGZvciBgKmAgYW5kIGArYC5cbiAgaWYgKHN5bWJvbCA9PT0gXCIqXCIgfHwgc3ltYm9sID09PSBcIitcIikge1xuICAgIGxldCBhcmd1bWVudCA9IHJ1bGUuYXJndW1lbnQ7XG4gICAgcnVsZSA9IG5ldyBSdWxlLlJlcGVhdCh7IHJlcGVhdDogcnVsZSB9KTtcbiAgICBpZiAoYXJndW1lbnQpIHJ1bGUuYXJndW1lbnQgPSBhcmd1bWVudDtcbiAgICAvLyBwdXNoIGludG8gcnVsZSBzdGFjayBpbiBwbGFjZSBvZiBvbGQgcnVsZVxuICAgIHJ1bGVzW3J1bGVzLmxlbmd0aCAtIDFdID0gcnVsZTtcbiAgfVxuXG4gIC8vIFJ1bGUgaXMgb3B0aW9uYWwgZm9yIGA/YCBhbmQgYCpgLlxuICBpZiAoc3ltYm9sID09PSBcIj9cIiB8fCBzeW1ib2wgPT09IFwiKlwiKSB7XG4gICAgcnVsZS5vcHRpb25hbCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gWyB1bmRlZmluZWQsIHN0YXJ0IF1cbn1cblxuLy8gTWF0Y2ggYHs8c3VicnVsZT59YCBpbiBzeW50YXggcnVsZXMuXG4vLyBSZXR1cm5zIGBbIHJ1bGUsIGVuZCBdYFxuLy8gVGhyb3dzIGlmIGludmFsaWQuXG5mdW5jdGlvbiBwYXJzZVN1YnJ1bGUoc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDApIHtcbiAgbGV0IG1hdGNoID0gUGFyc2VyLmZpbmROZXN0ZWRUb2tlbnMoc3ludGF4U3RyZWFtLCBcIntcIiwgXCJ9XCIsIHN0YXJ0KTtcbiAgbGV0IGFyZ3VtZW50O1xuICBpZiAobWF0Y2guc2xpY2UubGVuZ3RoID09PSAzICYmIG1hdGNoLnNsaWNlWzFdID09PSBcIjpcIikge1xuICAgIGFyZ3VtZW50ID0gbWF0Y2guc2xpY2VbMF07XG4gICAgbWF0Y2guc2xpY2UgPSBtYXRjaC5zbGljZS5zbGljZSgyKTtcbiAgfVxuICBpZiAobWF0Y2guc2xpY2UubGVuZ3RoID4gMSkgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBDYW4ndCBwcm9jZXNzIHJ1bGVzIHdpdGggbW9yZSB0aGFuIG9uZSBydWxlIG5hbWU6IHske21hdGNoLnNsaWNlLmpvaW4oXCJcIil9fWApO1xuXG4gIGxldCBwYXJhbXMgPSB7IHN1YnJ1bGU6IG1hdGNoLnNsaWNlWzBdIH07XG5cbiAgLy8gc2VlIGlmIHRoZXJlJ3MgYSBgbm90YCBydWxlIGluIHRoZXJlXG4gIGxldCBiYW5nUG9zaXRpb24gPSBwYXJhbXMuc3VicnVsZS5pbmRleE9mKFwiIVwiKTtcbiAgaWYgKGJhbmdQb3NpdGlvbiAhPT0gLTEpIHtcbiAgICBwYXJhbXMubm90ID0gcGFyYW1zLnN1YnJ1bGUuc3Vic3RyKGJhbmdQb3NpdGlvbiArIDEpO1xuICAgIHBhcmFtcy5zdWJydWxlID0gcGFyYW1zLnN1YnJ1bGUuc3Vic3RyKDAsIGJhbmdQb3NpdGlvbik7XG4gIH1cblxuICBsZXQgcnVsZSA9IG5ldyBSdWxlLlN1YnJ1bGUocGFyYW1zKTtcbiAgaWYgKGFyZ3VtZW50KSBydWxlLmFyZ3VtZW50ID0gYXJndW1lbnQ7XG4gIHJldHVybiBbIHJ1bGUsIG1hdGNoLmVuZCBdO1xufVxuXG4vLyBNYXRjaCBsaXN0IGV4cHJlc3Npb24gYFs8aXRlbT48ZGVsaW1pdGVyPl1gIG9yIGBbPGFyZ3VtZW50Pjo8aXRlbT48ZGVsaW1pdGVyPl1gIGluIHN5bnRheCBydWxlcy5cbi8vIFJldHVybnMgYFsgcnVsZSwgZW5kIF1gXG4vLyBUaHJvd3MgaWYgaW52YWxpZC5cbmZ1bmN0aW9uIHBhcnNlTGlzdChzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCwgY29uc3RydWN0b3IgPSBSdWxlLkxpc3QpIHtcbiAgbGV0IHsgZW5kLCBzbGljZSB9ID0gUGFyc2VyLmZpbmROZXN0ZWRUb2tlbnMoc3ludGF4U3RyZWFtLCBcIltcIiwgXCJdXCIsIHN0YXJ0KTtcblxuICAvLyBnZXQgYXJndW1lbnQgaWYgc3VwcGxpZWRcbiAgbGV0IGFyZ3VtZW50O1xuICBpZiAoc2xpY2UubGVuZ3RoID4gMiAmJiBzbGljZVsxXSA9PT0gXCI6XCIpIHtcbiAgICBhcmd1bWVudCA9IHNsaWNlWzBdO1xuICAgIHNsaWNlID0gc2xpY2Uuc2xpY2UoMik7XG4gIH1cblxuICBsZXQgcmVzdWx0cyA9IHBhcnNlU3ludGF4KHNsaWNlLCBbXSk7XG4gIGlmIChyZXN1bHRzLmxlbmd0aCAhPT0gMikge1xuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgVW5leHBlY3RlZCBzdHVmZiBhdCBlbmQgb2YgbGlzdDogWyR7c2xpY2Uuam9pbihcIiBcIil9XWApO1xuICB9XG4gIGxldCBbIGl0ZW0sIGRlbGltaXRlciBdID0gcmVzdWx0cztcblxuICBsZXQgcnVsZSA9IG5ldyBjb25zdHJ1Y3Rvcih7IGl0ZW0sIGRlbGltaXRlciB9KTtcbiAgaWYgKGFyZ3VtZW50KSBydWxlLmFyZ3VtZW50ID0gYXJndW1lbnQ7XG4gIHJldHVybiBbIHJ1bGUsIGVuZCBdO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1J1bGVTeW50YXguanMiLCJpbXBvcnQgeyBnZXRUYWJzIH0gZnJvbSBcIi4vdXRpbHMvc3RyaW5nXCI7XG5cbi8vIEdSUlIuLi4gbm9kZSBkb2Vzbid0IGluY2x1ZGUgdGhpcz8/P1xuLy8gQ0hFQ0sgRElGRkVSRU5UIE5PREUgVkVSU0lPTlMuLi5cbmlmICghKEFycmF5LnByb3RvdHlwZS5pbmNsdWRlcykpIHtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KEFycmF5LnByb3RvdHlwZSwgXCJpbmNsdWRlc1wiLCB7XG5cdFx0dmFsdWU6IGZ1bmN0aW9uKHZhbHVlLCBzdGFydCkge1xuXHRcdFx0bGV0IGluZGV4ID0gdGhpcy5pbmRleE9mKHZhbHVlLCBzdGFydCk7XG5cdFx0XHRyZXR1cm4gKGluZGV4ICE9PSAtMSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuXG5cbi8vIGB3aGl0ZXNwYWNlYCBjbGFzcyBmb3Igbm9ybWFsIChub24taW5kZW50LCBub24tbmV3bGluZSkgd2hpdGVzcGFjZS5cbmNsYXNzIHdoaXRlc3BhY2Uge1xuXHRjb25zdHJ1Y3Rvcih3aGl0ZXNwYWNlKSB7XG5cdFx0dGhpcy53aGl0ZXNwYWNlID0gd2hpdGVzcGFjZTtcblx0fVxuXG5cdC8vIFJldHVybiB0aGUgXCJsZW5ndGhcIiBvZiB0aGlzIHdoaXRlc3BhY2UsIGVnIGZvciBhbiBpbmRlbnQuXG5cdGdldCBsZW5ndGgoKSB7XG5cdFx0cmV0dXJuIHRoaXMud2hpdGVzcGFjZS5sZW5ndGg7XG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gdGhpcy53aGl0ZXNwYWNlO1xuXHR9XG59XG5cblxuLy8gYGluZGVudGAgY2xhc3MuXG5jbGFzcyBpbmRlbnQgZXh0ZW5kcyB3aGl0ZXNwYWNlIHt9XG5cblxuLy8gTmV3bGluZSBzaW5nbGV0b24uXG5jbGFzcyBuZXdsaW5lIGV4dGVuZHMgd2hpdGVzcGFjZSB7fVxuXG5cbi8vXG4vL1x0IyBUb2tlbml6ZXJcbi8vXHQtIGAudG9rZW5pemUoKWAgXHRcdEJyZWFrcyB1cCBsb25nIHN0cmluZyBpbnRvIHRva2VucywgaW5jbHVkaW5nIG5ld2xpbmVzLCBKU1ggZXhwcmVzc2lvbnMsIGV0Yy5cbi8vXHQtIGAudG9rZW5pemVMaW5lcygpYCBcdFRha2VzIHRoZSBhYm92ZSBhbmQgYnJlYWtzIGl0IGludG8gYW4gYXJyYXkgb2YgYXJyYXlzIGZvciBlYWNoIGxpbmUuXG4vL1xuLy8gVE9ETzogZXJyb3IgY2hlY2tpbmcgLyByZXBvcnRpbmcsIGVzcGVjaWFsbHkgaW4gSlNYIGV4cHJlc3Npb25zLlxuLy8gVE9ETzogaGF2ZSBub3JtYWwgYHRva2VuaXplYCBzdGljayB3aGl0ZXNwYWNlIGVsZW1lbnRzIGluIHRoZSBzdHJlYW0sIHRoZW4gYHRva2VuaXplTGluZXMoKWAgdGFrZXMgdGhlbSBvdXQ/XG5jb25zdCBUb2tlbml6ZXIgPSB7XG5cblx0Ly8gU2hvdWxkIHdlIHdhcm4gYWJvdXQgYW5vbWFsb3VzIGNvbmRpdGlvbnM/XG5cdFdBUk4gOiBmYWxzZSxcblxuXHQvLyBXaGl0ZXNwYWNlIGNvbnN0cnVjdG9yLlxuXHRXaGl0ZXNwYWNlOiB3aGl0ZXNwYWNlLFxuXG5cdC8vIEluZGVudCBjb25zdHJ1Y3RvclxuXHRJbmRlbnQ6IGluZGVudCxcblxuXHQvLyBORVdMSU5FIHNpbmdsZXRvbi5cblx0TkVXTElORTogbmV3IG5ld2xpbmUoXCJcXG5cIiksXG5cblx0Ly8gVG9rZW5pemUgdGV4dCBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgIGludG8gYW4gYXJyYXkgb2YgYHJlc3VsdHNgLCBhbiBhcnJheSBvZjpcblx0Ly9cdC0gYFRva2VuaXplci5ORVdMSU5FYCBmb3IgYSBuZXdsaW5lIHN5bWJvbFxuXHQvL1x0LSBzdHJpbmdzIGZvciBrZXl3b3Jkcy9zeW1ib2xzXG5cdC8vXHQtIG51bWJlcnMgZm9yIG51bWJlciBsaXRlcmFsc1xuXHQvL1x0LSBgeyBpbmRlbnQ6IG51bWJlciB9YCBmb3IgaW5kZW50IGF0IHN0YXJ0IG9mIGxpbmVcblx0Ly9cdC0gYHsgdHlwZTogXCJ0ZXh0XCIsIGxpdGVyYWw6IFwiJ2FiYydcIiwgdGV4dDogXCJhYmNcIiB9XG5cdC8vXHQtIGB7IHR5cGU6IFwiaW5kZW50XCIsIGxldmVsOiA3IH1gXG5cdC8vXHQtIGB7IHR5cGU6IFwiY29tbWVudFwiLCBjb21tZW50OiBcInN0cmluZ1wiLCBjb21tZW50U3ltYm9sLCB3aGl0ZXNwYWNlIH1gXG4vL1RFU1RNRVxuXHR0b2tlbml6ZSh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHQvLyBxdWljayByZXR1cm4gb3V0IG9mIHJhbmdlIG9yIG9ubHkgd2hpdGVzcGFjZVxuXHRcdGlmIChzdGFydCA+PSBlbmQgfHwgIXRleHQudHJpbSgpKSByZXR1cm4gW107XG5cblx0XHRsZXQgdG9rZW5zID0gW107XG5cdFx0Ly8gUHJvY2VzcyBvdXIgdG9wLWxldmVsIHJ1bGVzLlxuXHRcdGxldCBbcmVzdWx0cywgbmV4dFN0YXJ0XSA9IHRoaXMuZWF0VG9rZW5zKHRoaXMubWF0Y2hUb3BUb2tlbnMsIHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGlmIChyZXN1bHRzKSB7XG5cdFx0XHR0b2tlbnMgPSB0b2tlbnMuY29uY2F0KHJlc3VsdHMpO1xuXHRcdFx0c3RhcnQgPSBuZXh0U3RhcnQ7XG5cdFx0fVxuXHRcdGlmIChzdGFydCAhPT0gZW5kKSB7XG5cdFx0XHRpZiAoVG9rZW5pemVyLldBUk4pIGNvbnNvbGUud2FybihcInRva2VuaXplKCk6IGRpZG4ndCBjb25zdW1lOiBgXCIsIHRleHQuc2xpY2Uoc3RhcnQsIGVuZCkgKyBcImBcIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdHM7XG5cdH0sXG5cblx0Ly8gUmVwZWF0ZWRseSBleGVjdXRlIGEgYG1ldGhvZGAgKGJvdW5kIHRvIGB0aGlzKSB3aGljaCByZXR1cm5zIGEgYFtyZXN1bHQsIG5leHRTdGFydF1gIG9yIGB1bmRlZmluZWRgLlxuXHQvLyBQbGFjZXMgbWF0Y2hlZCByZXN1bHRzIHRvZ2V0aGVyIGluIGByZXN1bHRzYCBhcnJheSBhbmQgcmV0dXJucyBgW3Jlc3VsdHMsIG5leHRTdGFydF1gIGZvciB0aGUgZW50aXJlIHNldC5cblx0Ly8gU3RvcHMgaWYgYG1ldGhvZGAgZG9lc24ndCByZXR1cm4gYW55dGhpbmcsIG9yIGlmIGNhbGxpbmcgYG1ldGhvZGAgaXMgdW5wcm9kdWN0aXZlLlxuLy9URVNUTUVcblx0ZWF0VG9rZW5zKG1ldGhvZCwgdGV4dCwgc3RhcnQgPSAwLCBlbmQsIHJlc3VsdHMgPSBbXSkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gcHJvY2VzcyBydWxlcyByZXBlYXRlZGx5IHVudGlsIHdlIGdldCB0byB0aGUgZW5kXG5cdFx0d2hpbGUgKHN0YXJ0IDwgZW5kKSB7XG5cdFx0XHRsZXQgcmVzdWx0ID0gbWV0aG9kLmNhbGwodGhpcywgdGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0XHRpZiAoIXJlc3VsdCkgYnJlYWs7XG5cblx0XHRcdGxldCBbdG9rZW5zLCBuZXh0U3RhcnRdID0gcmVzdWx0O1xuXHRcdFx0Ly8gQmFpbCBpZiB3ZSBkaWRuJ3QgZ2V0IGEgcHJvZHVjdGl2ZSBydWxlIVxuXHRcdFx0aWYgKHN0YXJ0ID09PSBuZXh0U3RhcnQpIGJyZWFrO1xuXG5cdFx0XHQvLyBoYW5kbGUgbmV3UmVzdWx0cyBhcyBhbiBhcnJheSBvciBzaW5nbGUgb2JqZWN0LlxuXHRcdFx0aWYgKHRva2VucyAhPT0gdW5kZWZpbmVkKSByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQodG9rZW5zKTtcblx0XHRcdHN0YXJ0ID0gbmV4dFN0YXJ0O1xuXHRcdH1cblx0XHRyZXR1cm4gW3Jlc3VsdHMsIHN0YXJ0XTtcblx0fSxcblxuXHQvLyBNYXRjaCBhIHNpbmdsZSB0b3AtbGV2ZWwgdG9rZW4gYXQgYHRleHRbc3RhcnRdYC5cbi8vVEVTVE1FXG5cdG1hdGNoVG9wVG9rZW5zKHRleHQsIHN0YXJ0LCBlbmQpIHtcblx0XHRyZXR1cm5cdHRoaXMubWF0Y2hXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaFdvcmQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoTnVtYmVyKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaE5ld2xpbmUodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoSlNYRWxlbWVudCh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0IHx8IHRoaXMubWF0Y2hUZXh0KHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaENvbW1lbnQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoU3ltYm9sKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0O1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBTeW1ib2wgY2hhcmFjdGVyXG5cdC8vXG5cblx0Ly8gTWF0Y2ggdGhlIHNpbmdsZSBcInN5bWJvbFwiIGNoYXJhY3RlciBhdCBgdGV4dFtzdGFydF1gLlxuXHQvLyBOT1RFOiBUaGlzIGRvZXMgbm90IGRvIGFueSBjaGVja2luZywgaXQganVzdCBibGluZGx5IHVzZXMgdGhlIGNoYXJhY3RlciBpbiBxdWVzdGlvbi5cblx0Ly9cdFx0IFlvdSBzaG91bGQgbWFrZSBzdXJlIGFsbCBvdGhlciBwb3NzaWJsZSBydWxlcyBoYXZlIGJlZW4gZXhoYXVzdGVkIGZpcnN0LlxuXHRtYXRjaFN5bWJvbCh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIFt0ZXh0W3N0YXJ0XSwgc3RhcnQgKyAxXVxuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBXaGl0ZXNwYWNlXG5cdC8vXG5cblx0Ly8gUmV0dXJuIHRoZSBmaXJzdCBjaGFyIHBvc2l0aW9uIGFmdGVyIGBzdGFydGAgd2hpY2ggaXMgTk9UIGEgd2hpdGVzcGFjZSBjaGFyIChzcGFjZSBvciB0YWIgb25seSkuXG5cdC8vIElmIGB0ZXh0W3N0YXJ0XWAgaXMgbm90IHdoaXRlc3BhY2UsIHJldHVybnMgYHN0YXJ0YCxcblx0Ly9cdHNvIHlvdSBjYW4gY2FsbCB0aGlzIGF0IGFueSB0aW1lIHRvIHNraXAgd2hpdGVzcGFjZSBpbiB0aGUgb3V0cHV0LlxuXHRlYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiBlbmQ7XG5cblx0XHRsZXQgd2hpdGVTcGFjZUVuZCA9IHN0YXJ0O1xuXHRcdHdoaWxlICh3aGl0ZVNwYWNlRW5kIDwgZW5kICYmICh0ZXh0W3doaXRlU3BhY2VFbmRdID09PSBcIiBcIiB8fCB0ZXh0W3doaXRlU3BhY2VFbmRdID09PSBcIlxcdFwiKSkge1xuXHRcdFx0d2hpdGVTcGFjZUVuZCsrO1xuXHRcdH1cblx0XHRyZXR1cm4gd2hpdGVTcGFjZUVuZDtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgV2hpdGVzcGFjZVxuXHQvL1x0Tk9URTogV2hpdGVzcGFjZSBhdCB0aGUgYmVnaW5uaW5nIG9mIGB0ZXh0YCBvciB0aGUgYmVnaW5uaW5nIG9mIGEgbGluZVxuXHQvL1x0XHQgIGlzIGNvbnNpZGVyZWQgYW4gXCJpbmRlbnRcIiBhbmQgd2lsbCBoYXZlIGAuaXNJbmRlbnQgPT09IHRydWVgLlxuXHQvL1xuXG5cdC8vIENvbnZlcnQgYSBydW4gb2Ygc3BhY2VzIGFuZC9vciB0YWJzIGludG8gYSBgVG9rZW5pemVyLldoaXRlc3BhY2VgLlxuXHRtYXRjaFdoaXRlc3BhY2UodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB3aGl0ZXNwYWNlRW5kID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdC8vIGZvcmdldCBpdCBpZiBubyBmb3J3YXJkIG1vdGlvblxuXHRcdGlmICh3aGl0ZXNwYWNlRW5kID09PSBzdGFydCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB3aGl0ZXNwYWNlID0gdGV4dC5zbGljZShzdGFydCwgd2hpdGVzcGFjZUVuZCk7XG5cdFx0bGV0IHRva2VuO1xuXHRcdGlmIChzdGFydCA9PT0gMCB8fCB0ZXh0W3N0YXJ0LTFdID09PSBcIlxcblwiKVxuXHRcdFx0dG9rZW4gPSBuZXcgVG9rZW5pemVyLkluZGVudCh3aGl0ZXNwYWNlKTtcblx0XHRlbHNlXG5cdFx0XHR0b2tlbiA9IG5ldyBUb2tlbml6ZXIuV2hpdGVzcGFjZSh3aGl0ZXNwYWNlKTtcblxuXHRcdHJldHVybiBbdG9rZW4sIHdoaXRlc3BhY2VFbmRdO1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBOZXdsaW5lXG5cdC8vXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgbmV3bGluZSBjaGFyYWN0ZXIgYXQgYHRleHRbc3RhcnRdYC5cblx0Ly8gUmV0dXJucyBgW1Rva2VuaXplci5ORVdMSU5FLCBuZXh0U3RhcnRdYCBvbiBtYXRjaC5cblx0Ly8gT3RoZXJ3aXNlIHJldHVybnMgYHVuZGVmaW5lZGAuXG5cdG1hdGNoTmV3bGluZSh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kIHx8IHRleHRbc3RhcnRdICE9PSBcIlxcblwiKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIFtUb2tlbml6ZXIuTkVXTElORSwgc3RhcnQgKyAxXTtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgV29yZFxuXHQvL1xuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIGB3b3JkYCBpbiBgdGV4dGAgYXQgY2hhcmFjdGVyIGBzdGFydGAuXG5cdC8vIFJldHVybnMgYFt3b3JkLCB3b3JkRW5kXWAuXG5cdC8vIFJldHVybnMgYW4gZW1wdHkgYXJyYXkgaWYgY291bGRuJ3QgbWF0Y2ggYSB3b3JkLlxuXHRXT1JEX1NUQVJUOiAvW0EtWmEtel0vLFxuXHRXT1JEX0NIQVIgOiAvXltcXHdfLV0vLFxuXHRtYXRjaFdvcmQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGlmICghdGhpcy5XT1JEX1NUQVJULnRlc3QodGV4dFtzdGFydF0pKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHdvcmRFbmQgPSBzdGFydCArIDE7XG5cdFx0d2hpbGUgKHdvcmRFbmQgPCBlbmQgJiYgdGhpcy5XT1JEX0NIQVIudGVzdCh0ZXh0W3dvcmRFbmRdKSkge1xuXHRcdFx0d29yZEVuZCsrO1xuXHRcdH1cblx0XHRpZiAod29yZEVuZCA9PT0gc3RhcnQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgd29yZCA9IHRleHQuc2xpY2Uoc3RhcnQsIHdvcmRFbmQpO1xuXHRcdHJldHVybiBbd29yZCwgd29yZEVuZF07XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIE51bWJlcnNcblx0Ly9cblxuXHQvLyBFYXQgYSBzaW5nbGUgbnVtYmVyLlxuXHQvLyBSZXR1cm5zIGEgYE51bWJlcmAgaWYgbWF0Y2hlZC5cblx0TlVNQkVSX1NUQVJUOiAvWzAtOS0uXS8sXG5cdE5VTUJFUiA6IC9eLT8oWzAtOV0qXFwuKT9bMC05XSsvLFxuXHRtYXRjaE51bWJlcih0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0aWYgKCF0aGlzLk5VTUJFUl9TVEFSVC50ZXN0KHRleHRbc3RhcnRdKSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBudW1iZXJNYXRjaCA9IHRoaXMubWF0Y2hFeHByZXNzaW9uQXRIZWFkKHRoaXMuTlVNQkVSLCB0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRpZiAoIW51bWJlck1hdGNoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG51bWJlclN0ciA9IG51bWJlck1hdGNoWzBdO1xuXHRcdGxldCBudW1iZXIgPSBwYXJzZUZsb2F0KG51bWJlclN0ciwgMTApO1xuXHRcdHJldHVybiBbbnVtYmVyLCBzdGFydCArIG51bWJlclN0ci5sZW5ndGhdO1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBUZXh0IGxpdGVyYWxcblx0Ly9cblxuXHQvLyBFYXQgYSB0ZXh0IGxpdGVyYWwgKHN0YXJ0cy9lbmRzIHdpdGggYCdgIG9yIGBcImApLlxuXHQvLyBSZXR1cm5zIGEgYFRva2VuaXplci5UZXh0YCBpZiBtYXRjaGVkLlxuLy9URVNUTUU6ICBub3Qgc3VyZSB0aGUgZXNjYXBpbmcgbG9naWMgaXMgcmVhbGx5IHJpZ2h0Li4uXG5cdG1hdGNoVGV4dCh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHF1b3RlU3ltYm9sID0gdGV4dFtzdGFydF07XG5cdFx0aWYgKHF1b3RlU3ltYm9sICE9PSAnXCInICYmIHF1b3RlU3ltYm9sICE9PSBcIidcIikgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB0ZXh0RW5kID0gc3RhcnQgKyAxO1xuXHRcdHdoaWxlICh0ZXh0RW5kIDwgZW5kKSB7XG5cdFx0XHRsZXQgY2hhciA9IHRleHRbdGV4dEVuZF07XG5cdFx0XHRpZiAoY2hhciA9PT0gcXVvdGVTeW1ib2wpIGJyZWFrO1xuXHRcdFx0Ly8gaWYgd2UgZ2V0IGEgYmFja3F1b3RlLCBpZ25vcmUgcXVvdGUgaW4gbmV4dCBjaGFyXG5cdFx0XHRpZiAoY2hhciA9PT0gXCJcXFxcXCIgJiYgdGV4dFt0ZXh0RW5kICsgMV0gPT09IHF1b3RlU3ltYm9sKSB0ZXh0RW5kKys7XG5cdFx0XHR0ZXh0RW5kKys7XG5cdFx0fVxuXHRcdC8vIEZvcmdldCBpdCBpZiB3ZSBkaWRuJ3QgZW5kIHdpdGggdGhlIHF1b3RlIHN5bWJvbFxuXHRcdGlmICh0ZXh0W3RleHRFbmRdICE9PSBxdW90ZVN5bWJvbCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHQvLyBhZHZhbmNlIHBhc3QgZW5kIHF1b3RlXG5cdFx0dGV4dEVuZCsrO1xuXG5cdFx0bGV0IHF1b3RlZFN0cmluZyA9IHRleHQuc2xpY2Uoc3RhcnQsIHRleHRFbmQpO1xuXHRcdGxldCB0b2tlbiA9IG5ldyBUb2tlbml6ZXIuVGV4dChxdW90ZWRTdHJpbmcpO1xuXHRcdHJldHVybiBbdG9rZW4sIHRleHRFbmRdO1xuXHR9LFxuXG5cdC8vIGBUZXh0YCBjbGFzcyBmb3Igc3RyaW5nIGxpdGVyYWxzLlxuXHQvLyBQYXNzIHRoZSBsaXRlcmFsIHZhbHVlLCB1c2UgYC50ZXh0YCB0byBnZXQganVzdCB0aGUgYml0IGluc2lkZSB0aGUgcXVvdGVzLlxuXHRUZXh0IDogY2xhc3MgdGV4dCB7XG5cdFx0Y29uc3RydWN0b3IocXVvdGVkU3RyaW5nKSB7XG5cdFx0XHR0aGlzLnF1b3RlZFN0cmluZyA9IHF1b3RlZFN0cmluZztcblx0XHR9XG5cdFx0Z2V0IHRleHQoKSB7XG5cdFx0XHRsZXQgc3RyaW5nID0gdGhpcy5xdW90ZWRTdHJpbmc7XG5cdFx0XHQvLyBjYWxjdWxhdGUgYHRleHRgIGFzIHRoZSBiaXRzIGJldHdlZW4gdGhlIHF1b3Rlcy5cblx0XHRcdGxldCBzdGFydCA9IDA7XG5cdFx0XHRsZXQgZW5kID0gc3RyaW5nLmxlbmd0aDtcblx0XHRcdGlmIChzdHJpbmdbc3RhcnRdID09PSAnXCInIHx8IHN0cmluZ1tzdGFydF0gPT09IFwiJ1wiKSBzdGFydCA9IDE7XG5cdFx0XHRpZiAoc3RyaW5nW2VuZC0xXSA9PT0gJ1wiJyB8fCBzdHJpbmdbZW5kLTFdID09PSBcIidcIikgZW5kID0gLTE7XG5cdFx0XHRyZXR1cm4gc3RyaW5nLnNsaWNlKHN0YXJ0LCBlbmQpO1xuXHRcdH1cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdHJldHVybiB0aGlzLnF1b3RlZFN0cmluZztcblx0XHR9XG5cdH0sXG5cblx0Ly9cblx0Ly9cdCMjIyBDb21tZW50c1xuXHQvL1xuXG5cdC8vIEVhdCBhIGNvbW1lbnQgKHVudGlsIHRoZSBlbmQgb2YgdGhlIGxpbmUpLlxuXHQvLyBSZXR1cm5zIGEgYFRva2VuaXplci5Db21tZW50YCBpZiBtYXRjaGVkLlxuXHRDT01NRU5UIDogL14oIyMrfC0tK3xcXC9cXC8rKShcXHMqKSguKikvLFxuXHRtYXRjaENvbW1lbnQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBjb21tZW50U3RhcnQgPSB0ZXh0LnNsaWNlKHN0YXJ0LCBzdGFydCArIDIpO1xuXHRcdGlmIChjb21tZW50U3RhcnQgIT09IFwiLS1cIiAmJiBjb21tZW50U3RhcnQgIT09IFwiXFwvXFwvXCIgJiYgY29tbWVudFN0YXJ0ICE9PSBcIiMjXCIpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBjb21tZW50IGVhdHMgdW50aWwgdGhlIGVuZCBvZiB0aGUgbGluZVxuXHRcdGxldCBsaW5lID0gdGhpcy5nZXRMaW5lQXRIZWFkKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGxldCBjb21tZW50TWF0Y2ggPSBsaW5lLm1hdGNoKHRoaXMuQ09NTUVOVClcblx0XHRpZiAoIWNvbW1lbnRNYXRjaCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBbbWF0Y2gsIGNvbW1lbnRTeW1ib2wsIHdoaXRlc3BhY2UsIGNvbW1lbnRdID0gY29tbWVudE1hdGNoO1xuXHRcdGxldCB0b2tlbiA9IG5ldyBUb2tlbml6ZXIuQ29tbWVudCh7IGNvbW1lbnRTeW1ib2wsIHdoaXRlc3BhY2UsIGNvbW1lbnQgfSk7XG5cdFx0cmV0dXJuIFt0b2tlbiwgc3RhcnQgKyBsaW5lLmxlbmd0aF07XG5cdH0sXG5cblx0Ly8gQ29tbWVudCBjbGFzc1xuLy9URVNUTUVcblx0Q29tbWVudCA6IGNsYXNzIGNvbW1lbnQge1xuXHRcdGNvbnN0cnVjdG9yIChwcm9wcykge1xuXHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBwcm9wcyk7XG5cdFx0fVxuXHRcdHRvU3RyaW5nKCkge1xuXHRcdFx0cmV0dXJuIGAke3RoaXMuY29tbWVudFN5bWJvbH0ke3RoaXMud2hpdGVzcGFjZX0ke3RoaXMuY29tbWVudH1gO1xuXHRcdH1cblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgSlNYXG5cdC8vXG5cblx0Ly8gRWF0IGEgKG5lc3RlZCkgSlNYIGV4cHJlc3Npb24uXG4vL1RFU1RNRVxuXHRtYXRjaEpTWEVsZW1lbnQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XSA9IHRoaXMubWF0Y2hKU1hTdGFydFRhZyh0ZXh0LCBzdGFydCwgZW5kKSB8fCBbXTtcblx0XHRpZiAoIWpzeEVsZW1lbnQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRpZiAoIWpzeEVsZW1lbnQuaXNVbmFyeVRhZykge1xuXHRcdFx0bGV0IFtjaGlsZHJlbiwgY2hpbGRFbmRdID0gdGhpcy5tYXRjaEpTWENoaWxkcmVuKGpzeEVsZW1lbnQudGFnTmFtZSwgdGV4dCwgbmV4dFN0YXJ0LCBlbmQpO1xuXHRcdFx0aWYgKGNoaWxkcmVuLmxlbmd0aCkge1xuXHRcdFx0XHRqc3hFbGVtZW50LmNoaWxkcmVuID0gY2hpbGRyZW47XG5cdFx0XHRcdG5leHRTdGFydCA9IGNoaWxkRW5kO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XTtcblx0fSxcblxuXHQvLyBNYXRjaCBKU1ggc3RhcnQgdGFnIGFuZCBpbnRlcm5hbCBlbGVtZW50cyAoYnV0IE5PVCBjaGlsZHJlbikuXG5cdC8vIFJldHVybnMgYFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdYCBvciBgdW5kZWZpbmVkYC5cblx0Ly8gVXNlIGBtYXRjaEpTWEVsZW1lbnQoKWAgdG8gbWF0Y2ggY2hpbGRyZW4sIGVuZCB0YWcsIGV0Yy5cblx0Ly8gSWdub3JlcyBsZWFkaW5nIHdoaXRlc3BhY2UuXG5cdEpTWF9UQUdfU1RBUlQgOiAvXjwoW0EtWmEtel1bXFx3LVxcLl0qKShcXHMqXFwvPnxcXHMqPnxcXHMrKS8sXG4vLyBUT0RPOiBjbGVhbiB0aGlzIHN0dWZmIHVwLCBtYXliZSB3aXRoIGZpbmRGaXJzdEF0SGVhZD9cblx0bWF0Y2hKU1hTdGFydFRhZyh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG5leHRTdGFydCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHQvLyBNYWtlIHN1cmUgd2Ugc3RhcnQgd2l0aCBgPGAuXG5cdFx0aWYgKHRleHRbbmV4dFN0YXJ0XSAhPT0gXCI8XCIpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgdGFnTWF0Y2ggPSB0aGlzLm1hdGNoRXhwcmVzc2lvbkF0SGVhZCh0aGlzLkpTWF9UQUdfU1RBUlQsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRpZiAoIXRhZ01hdGNoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IFsgbWF0Y2hUZXh0LCB0YWdOYW1lLCBlbmRCaXQgXSA9IHRhZ01hdGNoO1xuXHRcdGxldCBqc3hFbGVtZW50ID0gbmV3IFRva2VuaXplci5KU1hFbGVtZW50KHRhZ05hbWUpO1xuXHRcdG5leHRTdGFydCA9IG5leHRTdGFydCArIG1hdGNoVGV4dC5sZW5ndGg7XG5cblx0XHQvLyBJZiB1bmFyeSB0YWcsIG1hcmsgYXMgc3VjaCBhbmQgcmV0dXJuLlxuXHRcdGVuZEJpdCA9IGVuZEJpdC50cmltKCk7XG5cdFx0aWYgKGVuZEJpdCA9PT0gXCIvPlwiKSB7XG5cdFx0XHRqc3hFbGVtZW50LmlzVW5hcnlUYWcgPSB0cnVlO1xuXHRcdFx0cmV0dXJuIFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdO1xuXHRcdH1cblxuXHRcdC8vIElmIHdlIGRpZG4ndCBpbW1lZGlhdGVseSBnZXQgYW4gZW5kIG1hcmtlciwgYXR0ZW1wdCB0byBtYXRjaCBhdHRyaWJ1dGVzXG5cdFx0aWYgKGVuZEJpdCAhPT0gXCI+XCIgJiYgZW5kQml0ICE9PSBcIi8+XCIpIHtcblx0XHRcdGxldCBbIGF0dHJzLCBhdHRyRW5kIF0gPSB0aGlzLmVhdFRva2Vucyh0aGlzLm1hdGNoSlNYQXR0cmlidXRlLCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0XHRqc3hFbGVtZW50LmF0dHJpYnV0ZXMgPSBhdHRycztcblx0XHRcdG5leHRTdGFydCA9IGF0dHJFbmQ7XG5cdFx0fVxuXG5cdFx0Ly8gYXQgdGhpcyBwb2ludCB3ZSBzaG91bGQgZ2V0IGFuIGAvPmAgb3IgYD5gICh3aXRoIG5vIHdoaXRlc3BhY2UpLlxuXHRcdGlmICh0ZXh0W25leHRTdGFydF0gPT09IFwiL1wiICYmIHRleHRbbmV4dFN0YXJ0ICsgMV0gPT09IFwiPlwiKSB7XG5cdFx0XHRlbmRCaXQgPSBcIi8+XCI7XG5cdFx0XHRuZXh0U3RhcnQgKz0gMjtcblx0XHR9XG5cdFx0ZWxzZSBpZiAodGV4dFtuZXh0U3RhcnRdID09PSBcIj5cIikge1xuXHRcdFx0ZW5kQml0ID0gdGV4dFtuZXh0U3RhcnRdO1xuXHRcdFx0bmV4dFN0YXJ0ICs9IDE7XG5cdFx0fVxuXG5cdFx0Ly8gUmV0dXJuIGltbWVkaWF0ZWx5IGZvciB1bmFyeSB0YWdcblx0XHRpZiAoZW5kQml0ID09PSBcIi8+XCIpIHtcblx0XHRcdGpzeEVsZW1lbnQuaXNVbmFyeVRhZyA9IHRydWU7XG5cdFx0XHRyZXR1cm4gW2pzeEVsZW1lbnQsIG5leHRTdGFydF07XG5cdFx0fVxuXG5cdFx0Ly8gYWR2YW5jZSBwYXN0IGA+YFxuXHRcdGlmIChlbmRCaXQgIT09IFwiPlwiKSB7XG5cdFx0XHRpZiAoVG9rZW5pemVyLldBUk4pIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKFwiTWlzc2luZyBleHBlY3RlZCBlbmQgYD5gIGZvciBqc3hFbGVtZW50XCIsIGpzeEVsZW1lbnQsIFwiYFwiK3RleHQuc2xpY2Uoc3RhcnQsIG5leHRTdGFydCkrXCJgXCIpO1xuXHRcdFx0fVxuXHRcdFx0anN4RWxlbWVudC5lcnJvciA9IFwiTm8gZW5kID5cIjtcblx0XHRcdHJldHVybiBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XTtcblx0XHR9XG5cblx0XHRyZXR1cm4gW2pzeEVsZW1lbnQsIG5leHRTdGFydF07XG5cdH0sXG5cblxuXHQvLyBKU1ggZWxlbWVudCBjbGFzc1xuXHRKU1hFbGVtZW50IDogY2xhc3MganN4RWxlbWVudCB7XG5cdFx0Y29uc3RydWN0b3IodGFnTmFtZSwgYXR0cmlidXRlcywgY2hpbGRyZW4pIHtcblx0XHRcdHRoaXMudGFnTmFtZSA9IHRhZ05hbWU7XG5cdFx0XHRpZiAoYXR0cmlidXRlcykgdGhpcy5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcblx0XHRcdGlmIChjaGlsZHJlbikgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuXHRcdH1cblxuXHRcdC8vIFJldHVybiBhdHRyaWJ1dGVzIGFzIGEgbWFwLlxuLy9URVNUTUVcblx0XHRnZXQgYXR0cnMoKSB7XG5cdFx0XHRsZXQgYXR0cnMgPSB7fTtcblx0XHRcdGlmICh0aGlzLmF0dHJpYnV0ZXMpIHRoaXMuYXR0cmlidXRlcy5mb3JFYWNoKGF0dHIgPT4ge1xuXHRcdFx0XHQvLyBpZ25vcmUgdW5uYW1lZCBhdHRyaWJ1dGVzXG5cdFx0XHRcdGlmIChhdHRyLm5hbWUpIGF0dHJzW2F0dHIubmFtZV0gPSBhdHRyLnZhbHVlXG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBhdHRycztcblx0XHR9XG5cblx0XHQvLyBSZXR1cm4gb3VyIGF0dHJpYnV0ZXMgYXMgYSBzdHJpbmdcbi8vVEVTVE1FXG5cdFx0Z2V0IGF0dHJzQXNTdHJpbmcoKSB7XG5cdFx0XHRpZiAoIXRoaXMuYXR0cmlidXRlcykgcmV0dXJuIFwiXCI7XG5cdFx0XHRyZXR1cm4gXCIgXCIgKyB0aGlzLmF0dHJpYnV0ZXMubWFwKCAoeyBuYW1lLCB2YWx1ZSB9KSA9PiB7XG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gbmFtZTtcblx0XHRcdFx0Ly8gY29udmVydCB2YWx1ZSBhcnJheSAodG9rZW5zKSB0byBzdHJpbmdcblx0XHRcdFx0Ly8gVE9ETzogdGhpcyB3aWxsIHdhbnQgdG8gYmUgc21hcnRlci4uLlxuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHZhbHVlID0gYHske3ZhbHVlLmpvaW4oXCIgXCIpfX1gO1xuXHRcdFx0XHRyZXR1cm4gYG5hbWU9JHt2YWx1ZX1gO1xuXHRcdFx0fSkuam9pbihcIiBcIik7XG5cdFx0fVxuXG5cdFx0Ly8gUmV0dXJuIG91ciBjaGlsZHJlbiBhcyBhIHN0cmluZy5cbi8vVEVTVE1FXG5cdFx0Z2V0IGNoaWxkcmVuQXNTdHJpbmcoKSB7XG5cdFx0XHRpZiAoIXRoaXMuY2hpbGRyZW4pIHJldHVybiBcIlwiO1xuXHRcdFx0cmV0dXJuIHRoaXMuY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY2hpbGQpKSByZXR1cm4gYHske2NoaWxkLmpvaW4oXCIgXCIpfX1gO1xuXHRcdFx0XHRyZXR1cm4gXCJcIiArIGNoaWxkO1xuXHRcdFx0fSkuam9pbihcIlwiKTtcblx0XHR9XG5cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdGxldCBhdHRycyA9IHRoaXMuYXR0cnNBc1N0cmluZztcblx0XHRcdGxldCBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW5Bc1N0cmluZztcblx0XHRcdGlmICh0aGlzLmlzVW5hcnlUYWcpIHJldHVybiBgPCR7dGhpcy50YWdOYW1lfSR7YXR0cnN9Lz5gO1xuXHRcdFx0cmV0dXJuIGA8JHt0aGlzLnRhZ05hbWV9JHthdHRyc30+JHtjaGlsZHJlbn08LyR7dGhpcy50YWdOYW1lfT5gO1xuXHRcdH1cblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgSlNYIGNoaWxkcmVuXG5cdC8vXG5cblx0Ly8gTWF0Y2ggSlNYIGVsZW1lbnQgY2hpbGRyZW4gb2YgYDx0YWdOYW1lPmAgYXQgYHRleHRbc3RhcnRdYC5cblx0Ly8gTWF0Y2hlcyBuZXN0ZWQgY2hpbGRyZW4gYW5kIHN0b3BzIGFmdGVyIG1hdGNoaW5nIGVuZCB0YWc6IGA8L3RhZ05hbWU+YC5cblx0Ly8gUmV0dXJucyBgW2NoaWxkcmVuLCBuZXh0U3RhcnRdYC5cbi8vVEVTVE1FXG5cdG1hdGNoSlNYQ2hpbGRyZW4odGFnTmFtZSwgdGV4dCwgc3RhcnQsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IGNoaWxkcmVuID0gW107XG5cdFx0bGV0IG5lc3RpbmcgPSAxO1xuXHRcdGxldCBlbmRUYWcgPSBgPC8ke3RhZ05hbWV9PmA7XG5cblx0XHRsZXQgbmV4dFN0YXJ0ID0gc3RhcnQ7XG5cdFx0d2hpbGUodHJ1ZSkge1xuXHRcdFx0bGV0IHJlc3VsdCA9IHRoaXMubWF0Y2hKU1hDaGlsZChlbmRUYWcsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRcdGlmICghcmVzdWx0KSBicmVhaztcblxuXHRcdFx0bGV0IFtjaGlsZCwgY2hpbGRFbmRdID0gcmVzdWx0O1xuXHRcdFx0bmV4dFN0YXJ0ID0gY2hpbGRFbmQ7XG5cdFx0XHQvLyBJZiB3ZSBnb3QgdGhlIGVuZFRhZywgdXBkYXRlIG5lc3RpbmcgYW5kIGJyZWFrIG91dCBvZiBsb29wIGlmIG5lc3RpbmcgIT09IDBcblx0XHRcdGlmIChjaGlsZCA9PT0gZW5kVGFnKSB7XG5cdFx0XHRcdG5lc3RpbmcgLS07XG5cdFx0XHRcdGlmIChuZXN0aW5nID09PSAwKSBicmVhaztcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYgKGNoaWxkKSBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcblx0XHRcdH1cblx0XHR9XG4vLyBUT0RPOiBob3cgdG8gc3VyZmFjZSB0aGlzIGVycm9yPz8/XG5cdFx0aWYgKG5lc3RpbmcgIT09IDApIHtcblx0XHRcdGlmIChUb2tlbml6ZXIuV0FSTikge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oYG1hdGNoSlNYQ2hpbGRyZW4oJHt0ZXh0LnNsaWNlKHN0YXJ0LCBuZXh0U3RhcnQgKyAxMCl9OiBkaWRuJ3QgbWF0Y2ggZW5kIGNoaWxkIWApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gW2NoaWxkcmVuLCBuZXh0U3RhcnRdO1xuXHR9LFxuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIEpTWCBjaGlsZDpcblx0Ly9cdC0gY3VycmVudCBlbmRUYWdcblx0Ly9cdC0gYHsganN4IGV4cHJlc3Npb24gfWBcblx0Ly9cdC0gbmVzdGVkIEpTWCBlbGVtZW50XG5cdC8vXHQtIChhbnl0aGluZyBlbHNlKSBhcyBqc3hUZXh0IGV4cHJlc3Npb24uXG5cdG1hdGNoSlNYQ2hpbGQoZW5kVGFnLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdHJldHVybiB0aGlzLm1hdGNoSlNYRW5kVGFnKGVuZFRhZywgdGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hKU1hFeHByZXNzaW9uKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoSlNYRWxlbWVudCh0ZXh0LCBzdGFydCwgZW5kKVxuLy8gVE9ETzogbmV3bGluZSBhbmQgaW5kZW50P1xuXHRcdFx0fHwgdGhpcy5tYXRjaEpTWFRleHQodGV4dCwgc3RhcnQsIGVuZCk7XG5cdH0sXG5cblx0Ly8gQXR0ZW1wdCB0byBtYXRjaCBhIHNwZWNpZmljIGVuZCB0YWcuXG5cdC8vIElnbm9yZXMgbGVhZGluZyB3aGl0ZXNwYWNlLlxuXHRtYXRjaEpTWEVuZFRhZyhlbmRUYWcsIHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbmV4dFN0YXJ0ID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGlmICghdGhpcy5tYXRjaFN0cmluZ0F0SGVhZChlbmRUYWcsIHRleHQsIG5leHRTdGFydCwgZW5kKSkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gW2VuZFRhZywgbmV4dFN0YXJ0ICsgZW5kVGFnLmxlbmd0aF07XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIEpTWCBhdHRyaWJ1dGVzXG5cdC8vXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgSlNYIGVsZW1lbnQgYXR0cmlidXRlIGFzIGA8YXR0cj49ezx2YWx1ZT59YFxuLy8gVE9ETzogey4uLnh4eH1cblx0SlNYX0FUVFJJQlVURV9TVEFSVCA6IC9eXFxzKihbXFx3LV0rXFxiKVxccyooPT8pXFxzKi8sXG5cdG1hdGNoSlNYQXR0cmlidXRlKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBhdHRyaWJ1dGVzIG11c3Qgc3RhcnQgd2l0aCBhIHdvcmQgY2hhcmFjdGVyXG5cdFx0aWYgKCF0aGlzLldPUkRfU1RBUlQudGVzdCh0ZXh0W3N0YXJ0XSkpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBhdHRlbXB0IHRvIG1hdGNoIGFuIGF0dHJpYnV0ZSBuYW1lLCBpbmNsdWRpbmcgYD1gIGlmIHByZXNlbnQuXG5cdFx0bGV0IHJlc3VsdCA9IHRoaXMubWF0Y2hFeHByZXNzaW9uQXRIZWFkKHRoaXMuSlNYX0FUVFJJQlVURV9TVEFSVCwgdGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0aWYgKCFyZXN1bHQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgWyBtYXRjaCwgbmFtZSwgZXF1YWxzIF0gPSByZXN1bHQ7XG5cdFx0bGV0IG5leHRTdGFydCA9IHN0YXJ0ICsgbWF0Y2gubGVuZ3RoO1xuXHRcdGxldCBhdHRyaWJ1dGUgPSBuZXcgVG9rZW5pemVyLkpTWEF0dHJpYnV0ZShuYW1lKTtcblxuXHRcdC8vIGlmIHRoZXJlIHdhcyBhbiBlcXVhbHMgY2hhciwgcGFyc2UgdGhlIHZhbHVlXG5cdFx0aWYgKGVxdWFscykge1xuXHRcdFx0bGV0IFt2YWx1ZSwgdmFsdWVFbmRdID0gdGhpcy5tYXRjaEpTWEF0dHJpYnV0ZVZhbHVlKHRleHQsIG5leHRTdGFydCwgZW5kKSB8fCBbXTtcblx0XHRcdGlmICh2YWx1ZSkge1xuXHRcdFx0XHRhdHRyaWJ1dGUudmFsdWUgPSB2YWx1ZTtcblx0XHRcdFx0bmV4dFN0YXJ0ID0gdmFsdWVFbmQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGVhdCB3aGl0ZXNwYWNlIGJlZm9yZSB0aGUgbmV4dCBhdHRyaWJ1dGUgLyB0YWcgZW5kXG5cdFx0bmV4dFN0YXJ0ID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRyZXR1cm4gW2F0dHJpYnV0ZSwgbmV4dFN0YXJ0XTtcblx0fSxcblxuXHQvLyBNYXRjaCBhIHZhbHVlIGV4cHJlc3Npb24gZm9yIGEgSlNYIGVsZW1lbnQgYXR0cmlidXRlOlxuXHQvLyBOT1RFOiB3ZSB3aWxsIGJlIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlciB0aGUgYD1gIChhbmQgc3Vic2VxdWVudCB3aGl0ZXNwYWNlKS5cblx0bWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZSh0ZXh0LCBzdGFydCwgZW5kKSB7XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hUZXh0KHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoSlNYRXhwcmVzc2lvbih0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0fHwgdGhpcy5tYXRjaEpTWEVsZW1lbnQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZUlkZW50aWZpZXIodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hOdW1iZXIodGV4dCwgc3RhcnQsIGVuZClcblx0XHQ7XG5cdH0sXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgaWRlbnRpZmVyIGFzIGEgSlNYIGF0dHJpYnV0ZSB2YWx1ZS5cblx0Ly8gUmV0dXJucyBhcyBhIGBKU1hFeHByZXNzaW9uYC5cblx0bWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZUlkZW50aWZpZXIodGV4dCwgc3RhcnQsIGVuZCkge1xuXHRcdGxldCByZXN1bHQgPSB0aGlzLm1hdGNoV29yZCh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRpZiAoIXJlc3VsdCkgcmV0dXJuO1xuXG5cdFx0bGV0IFsgd29yZCwgbmV4dFN0YXJ0IF0gPSByZXN1bHQ7XG5cdFx0bGV0IHRva2VuID0gbmV3IFRva2VuaXplci5KU1hFeHByZXNzaW9uKHdvcmQpO1xuXHRcdHJldHVybiBbdG9rZW4sIG5leHRTdGFydF07XG5cdH0sXG5cblx0Ly8gSlNYIGF0dHJpYnV0ZSBjbGFzc1xuXHQvLyBgbmFtZWAgaXMgdGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZS5cblx0Ly8gYHZhbHVlYCBpcyBvbmUgb2Y6XG5cdC8vXHRcdC0gYCcuLi4nYFx0XHRcdC8vIFRleHQgKGxpdGVyYWwgc3RyaW5nKS5cblx0Ly9cdFx0LSBgXCIuLi5cImBcdFx0XHQvLyBUZXh0IChsaXRlcmFsIHN0cmluZykuXG5cdC8vXHRcdC0gYHsuLi59YFx0XHRcdC8vIEV4cHJlc3Npb24uICBSZXN1bHRzIHdpbGwgYmUgdG9rZW5pemVkIGFycmF5LlxuXHQvL1x0XHQtIGA8Li4uLj5gXHRcdFx0Ly8gSlNYIGVsZW1lbnQuXG5cdC8vXHRcdC0gYDFgXHRcdFx0XHQvLyBOdW1iZXIuICBOb3RlOiB0aGlzIGlzIGFuIGV4dGVuc2lvbiB0byBKU1guXG5cblx0SlNYQXR0cmlidXRlIDogY2xhc3MganN4QXR0cmlidXRlIHtcblx0XHRjb25zdHJ1Y3RvcihuYW1lLCB2YWx1ZSkge1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZTtcblx0XHRcdGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB0aGlzLnZhbHVlID0gdmFsdWU7XG5cdFx0fVxuXHRcdHRvU3RyaW5nKCkge1xuXHRcdFx0aWYgKHRoaXMudmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHRoaXMubmFtZTtcblx0XHRcdHJldHVybiBgJHt0aGlzLm5hbWV9PXske3RoaXMudmFsdWV9fWA7XG5cdFx0fVxuXHR9LFxuXG5cblx0Ly8gTWF0Y2ggYSBKU1ggZXhwcmVzc2lvbiBlbmNsb3NlZCBpbiBjdXJseSBicmFjZXMsIGVnOiAgYHsgLi4uIH1gLlxuXHQvLyAgSGFuZGxlcyBuZXN0ZWQgY3VybGllcywgcXVvdGVzLCBldGMuXG5cdC8vIFJldHVybnMgYXJyYXkgb2YgdG9rZW5zIG9mIGludGVybmFsIG1hdGNoLlxuXHQvLyBJZ25vcmVzIGxlYWRpbmcgd2hpdGVzcGFjZS5cbi8vVE9ETzogbmV3bGluZXMvaW5kZW50cz8/P1xuLy9UT0RPOiB7Li4ueHh4fVxuLy9URVNUTUVcblx0bWF0Y2hKU1hFeHByZXNzaW9uKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbmV4dFN0YXJ0ID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGxldCBlbmRJbmRleCA9IHRoaXMuZmluZE1hdGNoaW5nQXRIZWFkKFwie1wiLCBcIn1cIiwgdGV4dCwgbmV4dFN0YXJ0LCBlbmQpO1xuXHRcdGlmIChlbmRJbmRleCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gR2V0IGNvbnRlbnRzLCBpbmNsdWRpbmcgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZS5cblx0XHRsZXQgY29udGVudHMgPSB0ZXh0LnNsaWNlKHN0YXJ0ICsgMSwgZW5kSW5kZXgpO1xuXG5cdFx0Ly8gcmV0dXJuIGEgbmV3IEpTWEV4cHJlc3Npb24sIGFkdmFuY2luZyBiZXlvbmQgdGhlIGVuZGluZyBgfWAuXG5cdFx0bGV0IGV4cHJlc3Npb24gPSBuZXcgVG9rZW5pemVyLkpTWEV4cHJlc3Npb24oY29udGVudHMpO1xuXHRcdHJldHVybiBbZXhwcmVzc2lvbiwgZW5kSW5kZXggKyAxXTtcblx0fSxcblxuXHQvLyBKU1ggZXhwcmVzc2lvbiwgY29tcG9zZWQgb2YgaW5saW5lIHRva2VucyB3aGljaCBzaG91bGQgeWllbGQgYW4gYGV4cHJlc3Npb25gLlxuXHRKU1hFeHByZXNzaW9uIDogY2xhc3MganN4RXhwcmVzc2lvbiB7XG5cdFx0Y29uc3RydWN0b3IoY29udGVudHMpIHtcblx0XHRcdHRoaXMuY29udGVudHMgPSBjb250ZW50cyB8fCBcIlwiO1xuXHRcdH1cblx0XHQvLyBEaXZpZGUgY29udGVudHMgaW50byBgdG9rZW5zYC5cblx0XHRnZXQgdG9rZW5zKCkge1xuXHRcdFx0cmV0dXJuIFRva2VuaXplci50b2tlbml6ZSh0aGlzLmNvbnRlbnRzLnRyaW0oKSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8vIE1hdGNoIEpTWFRleHQgdW50aWwgdGhlIG9uZSBvZiBge2AsIGA8YCwgYD5gIG9yIGB9YC5cblx0Ly8gTk9URTogSU5DTFVERVMgbGVhZGluZyAvIHRyYWlsaW5nIHdoaXRlc3BhY2UuXG5cdEpTWF9URVhUX0VORF9DSEFSUyA6IFtcIntcIiwgXCI8XCIsIFwiPlwiLCBcIn1cIl0sXG4vL1RFU1RNRVxuXHRtYXRjaEpTWFRleHQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIHRlbXBvcmFyaWx5IGFkdmFuY2UgcGFzdCB3aGl0ZXNwYWNlICh3ZSdsbCBpbmNsdWRlIGl0IGluIHRoZSBvdXRwdXQpLlxuXHRcdGxldCBuZXh0U3RhcnQgPSB0aGlzLmVhdFdoaXRlc3BhY2UodGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0bGV0IGVuZEluZGV4ID0gdGhpcy5maW5kRmlyc3RBdEhlYWQodGhpcy5KU1hfVEVYVF9FTkRfQ0hBUlMsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHQvLyBJZiB0aGUgZmlyc3Qgbm9uLXdoaXRlc3BhY2UgY2hhciBpcyBpbiBvdXIgRU5EX0NIQVJTLCBmb3JnZXQgaXQuXG5cdFx0aWYgKGVuZEluZGV4ID09PSBuZXh0U3RhcnQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBpZiBubyBtYXRjaCwgd2UndmUgZ290IHNvbWUgc29ydCBvZiBlcnJvclxuXHRcdGlmIChlbmRJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZiAoVG9rZW5pemVyLldBUk4pIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKFwibWF0Y2hKU1hUZXh0KFwiK3RleHQuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgNTApK1wiKTogSlNYIHNlZW1zIHRvIGJlIHVuYmFsYW5jZWQuXCIpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHQvLyBpbmNsdWRlIGxlYWRpbmcgd2hpdGVzcGFjZSBpbiB0aGUgb3V0cHV0LlxuXHRcdGxldCBqc3hUZXh0ID0gdGV4dC5zbGljZShzdGFydCwgZW5kSW5kZXgpO1xuXHRcdHJldHVybiBbanN4VGV4dCwgZW5kSW5kZXhdO1xuXHR9LFxuXG5cblxuXG5cdC8vXG5cdC8vXHQjIyBVdGlsaXR5IGZ1bmN0aW9uc1xuXHQvL1xuXG5cdC8vIFJldHVybiBjaGFyYWN0ZXJzIHVwIHRvLCBidXQgbm90IGluY2x1ZGluZywgdGhlIG5leHQgbmV3bGluZSBjaGFyIGFmdGVyIGBzdGFydGAuXG5cdC8vIElmIGBzdGFydGAgaXMgYSBuZXdsaW5lIGNoYXIgb3Igc3RhcnQgPj0gZW5kLCByZXR1cm5zIGVtcHR5IHN0cmluZy5cblx0Ly8gSWYgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nIChlZzogbm8gbW9yZSBuZXdsaW5lcyksIHJldHVybnMgZnJvbSBzdGFydCB0byBlbmQuXG4vL1RFU1RNRVxuXHRnZXRMaW5lQXRIZWFkKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiBcIlwiO1xuXG5cdFx0bGV0IG5ld2xpbmUgPSB0ZXh0LmluZGV4T2YoXCJcXG5cIiwgc3RhcnQpO1xuXHRcdGlmIChuZXdsaW5lID09PSAtMSB8fCBuZXdsaW5lID4gZW5kKSBuZXdsaW5lID0gZW5kO1xuXHRcdHJldHVybiB0ZXh0LnNsaWNlKHN0YXJ0LCBuZXdsaW5lKTtcblx0fSxcblxuXHQvLyBNYXRjaCBhIG11bHRpLWNoYXIgc3RyaW5nIHN0YXJ0aW5nIGF0IGB0ZXh0W3N0YXJ0XWAuXG4vL1RFU1RNRVxuXHRtYXRjaFN0cmluZ0F0SGVhZChzdHJpbmcsIHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgc3RyaW5nRW5kID0gc3RhcnQgKyBzdHJpbmcubGVuZ3RoO1xuXHRcdGlmIChzdHJpbmdFbmQgPiBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHN0cmluZyA9PT0gdGV4dC5zbGljZShzdGFydCwgc3RyaW5nRW5kKTtcblx0fSxcblxuXG5cdC8vIE1hdGNoIGEgcmVndWxhciBleHByZXNzaW9uIHN0YXJ0aW5nIGF0IGB0ZXh0W3N0YXJ0XWAsIHJldHVybmluZyB0aGUgbWF0Y2guXG5cdC8vIFJldHVybnMgYG51bGxgIGlmIG5vIG1hdGNoLlxuXHQvL1xuXHQvLyBOT1RFOiBUaGUgZXhwcmVzc2lvbiBNVVNUIHN0YXJ0IHdpdGggYC9eLi4uL2Bcbi8vVEVTVE1FXG5cdG1hdGNoRXhwcmVzc2lvbkF0SGVhZChleHByZXNzaW9uLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IGhlYWQgPSB0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpO1xuXHRcdHJldHVybiBoZWFkLm1hdGNoKGV4cHJlc3Npb24pO1xuXHR9LFxuXG5cdC8vIEZpbmQgaW5kZXggb2YgdGhlIG1hdGNoaW5nIFNJTkdMRSBDSEFSQUNURVIgYGVuZERlbGltaXRlcmAgdG8gbWF0Y2ggYHN0YXJ0RGVsaW1pdGVyYC5cblx0Ly8gTWF0Y2hlcyBuZXN0ZWQgZGVsaW1pdGVycyBhbmQgaGFuZGxlcyBlc2NhcGVkIGRlbGltaXRlcnMuXG5cdC8vIEFzc3VtZXMgYHRleHRbc3RhcnRdYCBpcyB0aGUgc3RhcnREZWxpbWl0ZXIhXG5cdC8vIFJldHVybnMgbnVtZXJpYyBpbmRleCBvciBgdW5kZWZpbmVkYCBpZiBubyBtYXRjaCBvciBpZiBmaXJzdCBjaGFyIGlzIG5vdCBgc3RhcnREZWxpbWl0ZXJgLlxuXHQvL1xuXHQvL1x0QWxzbyBoYW5kbGVzIG5lc3RlZCBxdW90ZXMgLS0gaWYgd2UgZW5jb3VudGVyIGEgc2luZ2xlIG9yIGRvdWJsZSBxdW90ZSxcblx0Ly9cdFx0d2UnbGwgc2tpcCBzY2FubmluZyB1bnRpbCB3ZSBmaW5kIGEgbWF0Y2hpbmcgcXVvdGUuXG5cdC8vXG5cdC8vXHRlZzogIGBmaW5kTWF0Y2hpbmdBdEhlYWQoXCJ7XCIsIFwifVwiLCBcInthYXthfWFhfVwiKWAgPT4gOFxuLy9URVNUTUVcblx0ZmluZE1hdGNoaW5nQXRIZWFkKHN0YXJ0RGVsaW1pdGVyLCBlbmREZWxpbWl0ZXIsIHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRpZiAodGV4dFtzdGFydF0gIT09IHN0YXJ0RGVsaW1pdGVyKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG5lc3RpbmcgPSAwO1xuXHRcdGxldCBjdXJyZW50ID0gc3RhcnQ7XG5cdFx0d2hpbGUgKGN1cnJlbnQgPCBlbmQpIHtcblx0XHRcdGxldCBjaGFyID0gdGV4dFtjdXJyZW50XTtcblx0XHRcdC8vIGlmIHN0YXJ0RGVsaW1pdGVyLCBpbmNyZWFzZSBuZXN0aW5nXG5cdFx0XHRpZiAoY2hhciA9PT0gc3RhcnREZWxpbWl0ZXIpIHtcblx0XHRcdFx0bmVzdGluZysrO1xuXHRcdFx0fVxuXHRcdFx0Ly8gaWYgZW5kRGVsaW1pdGVyLCBkZWNyZWFzZSBuZXN0aW5nIGFuZCByZXR1cm4gaWYgbmVzdGluZyBiYWNrIHRvIDBcblx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IGVuZERlbGltaXRlcikge1xuXHRcdFx0XHRuZXN0aW5nLS07XG5cdFx0XHRcdGlmIChuZXN0aW5nID09PSAwKSByZXR1cm4gY3VycmVudDtcblx0XHRcdH1cblx0XHRcdC8vIGlmIGEgc2luZ2xlIG9yIGRvdWJsZSBxdW90ZSwgc2tpcCB1bnRpbCB0aGUgbWF0Y2hpbmcgcXVvdGVcblx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFwiJ1wiIHx8IGNoYXIgPT09ICdcIicpIHtcblx0XHRcdFx0bGV0IFt0b2tlbiwgYWZ0ZXJRdW90ZV0gPSB0aGlzLm1hdGNoVGV4dCh0ZXh0LCBjdXJyZW50LCBlbmQpIHx8IFtdO1xuXHRcdFx0XHRjdXJyZW50ID0gYWZ0ZXJRdW90ZTtcblx0XHRcdFx0Y29udGludWU7XHQvLyBjb250aW51ZSBzbyB3ZSBkb24ndCBhZGQgMSB0byBjdXJlbnQgYmVsb3dcblx0XHRcdH1cblx0XHRcdC8vIElmIGJhY2tzbGFzaCwgc2tpcCBhbiBleHRyYSBjaGFyIGlmIGl0J3MgZWl0aGVyIGRlbGltaXRlciBvciBhIHF1b3RlXG5cdFx0XHRlbHNlIGlmIChjaGFyID09PSBcIlxcXFxcIikge1xuXHRcdFx0XHRjaGFyID0gdGV4dFtjdXJyZW50ICsgMV07XG5cdFx0XHRcdGlmIChjaGFyID09PSBzdGFydERlbGltaXRlclxuXHRcdFx0XHQgfHwgY2hhciA9PT0gZW5kRGVsaW1pdGVyXG5cdFx0XHRcdCB8fCBjaGFyID09PSBcIidcIlxuXHRcdFx0XHQgfHwgY2hhciA9PT0gJ1wiJ1xuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRjdXJyZW50Kys7O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjdXJyZW50Kys7XG5cdFx0fVxuXHR9LFxuXG5cblx0Ly8gUmV0dXJuIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgTk9OLUVTQ0FQRUQgY2hhcmFjdGVyIGluIGBjaGFyc2AgYWZ0ZXIgYHRleHRbc3RhcnRdYC5cblx0Ly8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiB3ZSBkaWRuJ3QgZmluZCBhIG1hdGNoLlxuLy9URVNUTUVcblx0ZmluZEZpcnN0QXRIZWFkKGNoYXJzLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0d2hpbGUgKHN0YXJ0IDwgZW5kKSB7XG5cdFx0XHRsZXQgY2hhciA9IHRleHRbc3RhcnRdO1xuXHRcdFx0aWYgKGNoYXJzLmluY2x1ZGVzKGNoYXIpKSByZXR1cm4gc3RhcnQ7XG5cdFx0XHQvLyBpZiB3ZSBnb3QgYW4gZXNjYXBlIGNoYXIsIGlnbm9yZSB0aGUgbmV4dCBjaGFyIGlmIGl0J3MgaW4gYGNoYXJzYFxuXHRcdFx0aWYgKGNoYXIgPT09IFwiXFxcXFwiICYmIGNoYXJzLmluY2x1ZGVzKHRleHRbc3RhcnQrMV0pKSBzdGFydCsrO1xuXHRcdFx0c3RhcnQrKztcblx0XHR9XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gc3RhcnQ7XG5cdH0sXG5cblxuLy9cbi8vICMjIyBVdGlsaXR5XG4vL1xuXG5cdC8vIEdpdmVuIGEgc2V0IG9mIHRva2Vucywgc2xpY2Ugd2hpdGVzcGFjZSAoaW5kZW50LCBORVdMSU5FIG9yIG5vcm1hbCB3aGl0ZXNwYWNlKSBmcm9tIHRoZSBmcm9udC5cblx0cmVtb3ZlTGVhZGluZ1doaXRlc3BhY2UodG9rZW5zLCBzdGFydCA9IDApIHtcblx0XHR3aGlsZSAodG9rZW5zW3N0YXJ0XSBpbnN0YW5jZW9mIFRva2VuaXplci5XaGl0ZXNwYWNlKSBzdGFydCsrO1xuXHRcdGlmIChzdGFydCA9PT0gMCkgcmV0dXJuIHRva2Vucztcblx0XHRyZXR1cm4gdG9rZW5zLnNsaWNlKHN0YXJ0KTtcblx0fSxcblxuXHQvLyBHaXZlbiBhIHNldCBvZiB0b2tlbnMsIHJlbW92ZSBBTEwgXCJub3JtYWxcIiB3aGl0ZXNwYWNlIHRva2VucyAoTk9UIGluZGVudCBvciBORVdMSU5FKS5cblx0cmVtb3ZlTm9ybWFsV2hpdGVzcGFjZSh0b2tlbnMpIHtcblx0XHRyZXR1cm4gdG9rZW5zLmZpbHRlcih0b2tlbiA9PiAhVG9rZW5pemVyLmlzTm9ybWFsV2hpdGVzcGFjZSh0b2tlbikpO1xuXHR9LFxuXG5cblx0Ly8gUmV0dXJuIGB0cnVlYCBpZiBgdG9rZW5gIGlzIFwibm9ybWFsXCIgd2hpdGVzcGNlIChub3QgYSBuZXdsaW5lIG9yIGluZGVudClcblx0aXNOb3JtYWxXaGl0ZXNwYWNlKHRva2VuKSB7XG5cdFx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLldoaXRlc3BhY2Vcblx0XHRcdCYmICEodG9rZW4gaW5zdGFuY2VvZiBUb2tlbml6ZXIuSW5kZW50KVxuXHRcdFx0JiYgKHRva2VuICE9PSBUb2tlbml6ZXIuTkVXTElORSk7XG5cdH0sXG5cblxuLy9cbi8vICMjIyBCbG9jayAvIGluZGVudCBwcm9jZXNzaW5nXG4vL1xuXG5cdC8vIFNpbXBsZSBibG9jayBjbGFzcyBmb3IgYGJyZWFrSW50b0Jsb2Nrc2AuXG5cdEJsb2NrOiBjbGFzcyBibG9jayB7XG5cdFx0Y29uc3RydWN0b3IocHJvcHMpe1xuXHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBwcm9wcyk7XG5cdFx0XHRpZiAoIXRoaXMuY29udGVudHMpIHRoaXMuY29udGVudHMgPSBbXTtcblx0XHR9XG5cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLCBudWxsLCBcIlxcdFwiKTtcblx0XHR9XG5cdH0sXG5cblx0Ly8gQnJlYWsgdG9rZW5zIGludG8gYW4gYXJyYXkgb2YgYXJyYXlzIGJ5IGBORVdMSU5FYHMuXG5cdC8vIFJldHVybnMgYW4gYXJyYXkgb2YgbGluZXMgV0lUSE9VVCB0aGUgYE5FV0xJTkVgcy5cblx0Ly8gTGluZXMgd2hpY2ggYXJlIGNvbXBvc2VkIHNvbGVseSBvZiB3aGl0ZXNwYWNlIGFyZSB0cmVhdGVkIGFzIGJsYW5rLlxuXHRicmVha0ludG9MaW5lcyh0b2tlbnMpIHtcblx0XHQvLyBDb252ZXJ0IHRvIGxpbmVzLlxuXHRcdGxldCBjdXJyZW50TGluZSA9IFtdO1xuXHRcdGxldCBsaW5lcyA9IFtjdXJyZW50TGluZV07XG5cdFx0dG9rZW5zLmZvckVhY2godG9rZW4gPT4ge1xuXHRcdFx0Ly8gYWRkIG5ldyBhcnJheSBmb3IgZWFjaCBuZXdsaW5lXG5cdFx0XHRpZiAodG9rZW4gPT09IFRva2VuaXplci5ORVdMSU5FKSB7XG5cdFx0XHRcdC8vIGNyZWF0ZSBhIG5ldyBsaW5lIGFuZCBwdXNoIGl0IGluXG5cdFx0XHRcdGN1cnJlbnRMaW5lID0gW107XG5cdFx0XHRcdHJldHVybiBsaW5lcy5wdXNoKGN1cnJlbnRMaW5lKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gb3RoZXJ3aXNlIGp1c3QgYWRkIHRvIHRoZSBjdXJyZW50IGxpbmVcblx0XHRcdGN1cnJlbnRMaW5lLnB1c2godG9rZW4pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQ2xlYXIgYW55IGxpbmVzIHRoYXQgYXJlIG9ubHkgd2hpdGVzcGFjZVxuXHRcdGxpbmVzLmZvckVhY2goKGxpbmUsIGluZGV4KSA9PiB7XG5cdFx0XHRpZiAobGluZS5sZW5ndGggPT09IDEgJiYgbGluZVswXSBpbnN0YW5jZW9mIFRva2VuaXplci5XaGl0ZXNwYWNlKSBsaW5lc1tpbmRleF0gPSBbXTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBsaW5lcztcblx0fSxcblxuXHQvLyBSZXR1cm4gaW5kZW50cyBvZiB0aGUgc3BlY2lmaWVkIGxpbmVzLlxuXHQvLyBJbmRlbnRzIGVtcHR5IGxpbmVzIChORVdMSU5FcykgaW50byB0aGUgYmxvY2sgQUZURVIgdGhleSBhcHBlYXIuXG5cdGdldExpbmVJbmRlbnRzKGxpbmVzLCBkZWZhdWx0SW5kZW50ID0gMCkge1xuXHRcdGlmIChsaW5lcy5sZW5ndGggPT09IDApIHJldHVybiBbXTtcblxuXHRcdGNvbnN0IGluZGVudHMgPSBsaW5lcy5tYXAoVG9rZW5pemVyLmdldExpbmVJbmRlbnQpO1xuXHRcdGNvbnN0IGVuZCA9IGluZGVudHMubGVuZ3RoO1xuXG5cdFx0Ly8gZmlndXJlIG91dCB0aGUgaW5kZW50IG9mIHRoZSBmaXJzdCBub24tZW1wdHkgbGluZVxuXHRcdGxldCBzdGFydEluZGVudCA9IGdldE5leHRJbmRlbnQoMCk7XG5cdFx0aWYgKHN0YXJ0SW5kZW50ID09PSB1bmRlZmluZWQpIHN0YXJ0SW5kZW50ID0gZGVmYXVsdEluZGVudDtcblxuXHRcdC8vIGluZGVudCBibGFuayBsaW5lcyB0byB0aGUgaW5kZW50IEFGVEVSIHRoZW1cblx0XHRmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgZW5kOyBpbmRleCsrKSB7XG5cdFx0XHRpZiAoaW5kZW50c1tpbmRleF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpbmRlbnRzW2luZGV4XSA9IGdldE5leHRJbmRlbnQoaW5kZXggKyAxKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGluZGVudHM7XG5cblx0XHQvLyBSZXR1cm4gdGhlIHZhbHVlIG9mIHRoZSBORVhUIG5vbi11bmRlZmluZWQgaW5kZW50LlxuXHRcdGZ1bmN0aW9uIGdldE5leHRJbmRlbnQoaW5kZXgpIHtcblx0XHRcdHdoaWxlIChpbmRleCA8IGVuZCkge1xuXHRcdFx0XHRpZiAoaW5kZW50c1tpbmRleF0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIGluZGVudHNbaW5kZXhdO1xuXHRcdFx0XHRpbmRleCsrO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHN0YXJ0SW5kZW50O1xuXHRcdH1cblx0fSxcblxuXG5cdC8vIFJldHVybiB0aGUgaW5kZW50IG9mIGEgbGluZSBvZiB0b2tlbnMuXG5cdC8vIFJldHVybnMgYDBgIGlmIG5vdCBpbmRlbnRlZC5cblx0Ly8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBhIGJsYW5rIGxpbmUuXG5cdGdldExpbmVJbmRlbnQobGluZSkge1xuXHRcdGlmICghbGluZSB8fCBsaW5lLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRpZiAobGluZVswXSBpbnN0YW5jZW9mIFRva2VuaXplci5JbmRlbnQpIHJldHVybiBsaW5lWzBdLmxlbmd0aDtcblx0XHRyZXR1cm4gMDtcblx0fSxcblxuXHQvLyBCcmVhayBgdG9rZW5zYCBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgIGludG8gYSBgVG9rZW5pemVyLkJsb2NrYCB3aXRoIG5lc3RlZCBgY29udGVudHNgLlxuXHQvLyBTa2lwcyBcIm5vcm1hbFwiIHdoaXRlc3BhY2UgYW5kIGluZGVudHMgaW4gdGhlIHJlc3VsdHMuXG5cdGJyZWFrSW50b0Jsb2NrczogZnVuY3Rpb24odG9rZW5zLCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGgpIHtcblx0XHQvLyByZXN0cmljdCB0byB0b2tlbnMgb2YgaW50ZXJlc3Rcblx0XHR0b2tlbnMgPSB0b2tlbnMuc2xpY2Uoc3RhcnQsIGVuZCk7XG5cdFx0Ly8gcmVtb3ZlIFwibm9ybWFsXCIgd2hpdGVzcGFjZVxuLy9UT0RPOiBiZXR0ZXIgdG8gbGVhdmUgdGhpcyB0byBjb25zdW1lcnM/Pz9cblx0XHR0b2tlbnMgPSBUb2tlbml6ZXIucmVtb3ZlTm9ybWFsV2hpdGVzcGFjZSh0b2tlbnMpO1xuXG5cdFx0Ly8gYnJlYWsgaW50byBsaW5lcyAmIHJldHVybiBlYXJseSBpZiBubyBsaW5lc1xuXHRcdGxldCBsaW5lcyA9IFRva2VuaXplci5icmVha0ludG9MaW5lcyh0b2tlbnMpO1xuXHRcdGlmIChsaW5lcy5sZW5ndGggPT09IDApIHJldHVybiBbXTtcblxuXHRcdC8vIGZpZ3VyZSBvdXQgaW5kZW50c1xuXHRcdGxldCBpbmRlbnRzID0gVG9rZW5pemVyLmdldExpbmVJbmRlbnRzKGxpbmVzKTtcblxuXHRcdC8vIEZpcnN0IGJsb2NrIGlzIGF0IHRoZSBNSU5JTVVNIGluZGVudCBvZiBhbGwgbGluZXMhXG5cdFx0bGV0IG1heEluZGVudCA9IE1hdGgubWluLmFwcGx5KE1hdGgsIGluZGVudHMpO1xuXHRcdGxldCBibG9jayA9IG5ldyBUb2tlbml6ZXIuQmxvY2soeyBpbmRlbnQ6IG1heEluZGVudCB9KTtcblxuXHRcdC8vIHN0YWNrIG9mIGJsb2Nrc1xuXHRcdGxldCBzdGFjayA9IFtibG9ja107XG5cblx0XHRsaW5lcy5mb3JFYWNoKCAobGluZSwgaW5kZXgpID0+IHtcblx0XHRcdC8vIFJlbW92ZSBsZWFkaW5nIHdoaXRlc3BhY2UgKGVnOiBpbmRlbnRzKVxuXHRcdFx0bGluZSA9IFRva2VuaXplci5yZW1vdmVMZWFkaW5nV2hpdGVzcGFjZShsaW5lKTtcblxuXHRcdFx0bGV0IGxpbmVJbmRlbnQgPSBpbmRlbnRzW2luZGV4XTtcblx0XHRcdGxldCB0b3AgPSBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcblx0XHRcdC8vIElmIGluZGVudGluZywgcHVzaCBuZXcgYmxvY2socylcblx0XHRcdGlmIChsaW5lSW5kZW50ID4gdG9wLmluZGVudCkge1xuXHRcdFx0XHR3aGlsZSAobGluZUluZGVudCA+IHRvcC5pbmRlbnQpIHtcblx0XHRcdFx0XHR2YXIgbmV3QmxvY2sgPSBuZXcgVG9rZW5pemVyLkJsb2NrKHsgaW5kZW50OiB0b3AuaW5kZW50ICsgMSB9KTtcblx0XHRcdFx0XHR0b3AuY29udGVudHMucHVzaChuZXdCbG9jayk7XG5cdFx0XHRcdFx0c3RhY2sucHVzaChuZXdCbG9jayk7XG5cblx0XHRcdFx0XHR0b3AgPSBuZXdCbG9jaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gSWYgb3V0ZGVudGluZzogcG9wIGJsb2NrKHMpXG5cdFx0XHRlbHNlIGlmIChsaW5lSW5kZW50IDwgdG9wLmluZGVudCkge1xuXHRcdFx0XHR3aGlsZSAobGluZUluZGVudCA8IHRvcC5pbmRlbnQpIHtcblx0XHRcdFx0XHRzdGFjay5wb3AoKTtcblx0XHRcdFx0XHR0b3AgPSBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gYWRkIHRvIHRvcCBibG9ja1xuXHRcdFx0dG9wLmNvbnRlbnRzLnB1c2gobGluZSk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gYmxvY2s7XG5cdH0sXG5cblxuXG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFRva2VuaXplcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9Ub2tlbml6ZXIuanMiLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0geyB2ZXJzaW9uOiAnMi41LjcnIH07XG5pZiAodHlwZW9mIF9fZSA9PSAnbnVtYmVyJykgX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fY29yZS5qc1xuLy8gbW9kdWxlIGlkID0gOTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19pcy1vYmplY3QuanNcbi8vIG1vZHVsZSBpZCA9IDkyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuL19pb2JqZWN0Jyk7XG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBJT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL190by1pb2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSA5M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaWQgPSAwO1xudmFyIHB4ID0gTWF0aC5yYW5kb20oKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gJ1N5bWJvbCgnLmNvbmNhdChrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5LCAnKV8nLCAoKytpZCArIHB4KS50b1N0cmluZygzNikpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3VpZC5qc1xuLy8gbW9kdWxlIGlkID0gOTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG4vKipcbiAqIFdoZW4gc291cmNlIG1hcHMgYXJlIGVuYWJsZWQsIGBzdHlsZS1sb2FkZXJgIHVzZXMgYSBsaW5rIGVsZW1lbnQgd2l0aCBhIGRhdGEtdXJpIHRvXG4gKiBlbWJlZCB0aGUgY3NzIG9uIHRoZSBwYWdlLiBUaGlzIGJyZWFrcyBhbGwgcmVsYXRpdmUgdXJscyBiZWNhdXNlIG5vdyB0aGV5IGFyZSByZWxhdGl2ZSB0byBhXG4gKiBidW5kbGUgaW5zdGVhZCBvZiB0aGUgY3VycmVudCBwYWdlLlxuICpcbiAqIE9uZSBzb2x1dGlvbiBpcyB0byBvbmx5IHVzZSBmdWxsIHVybHMsIGJ1dCB0aGF0IG1heSBiZSBpbXBvc3NpYmxlLlxuICpcbiAqIEluc3RlYWQsIHRoaXMgZnVuY3Rpb24gXCJmaXhlc1wiIHRoZSByZWxhdGl2ZSB1cmxzIHRvIGJlIGFic29sdXRlIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBwYWdlIGxvY2F0aW9uLlxuICpcbiAqIEEgcnVkaW1lbnRhcnkgdGVzdCBzdWl0ZSBpcyBsb2NhdGVkIGF0IGB0ZXN0L2ZpeFVybHMuanNgIGFuZCBjYW4gYmUgcnVuIHZpYSB0aGUgYG5wbSB0ZXN0YCBjb21tYW5kLlxuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3MpIHtcbiAgLy8gZ2V0IGN1cnJlbnQgbG9jYXRpb25cbiAgdmFyIGxvY2F0aW9uID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cubG9jYXRpb247XG5cbiAgaWYgKCFsb2NhdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcImZpeFVybHMgcmVxdWlyZXMgd2luZG93LmxvY2F0aW9uXCIpO1xuICB9XG5cblx0Ly8gYmxhbmsgb3IgbnVsbD9cblx0aWYgKCFjc3MgfHwgdHlwZW9mIGNzcyAhPT0gXCJzdHJpbmdcIikge1xuXHQgIHJldHVybiBjc3M7XG4gIH1cblxuICB2YXIgYmFzZVVybCA9IGxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgbG9jYXRpb24uaG9zdDtcbiAgdmFyIGN1cnJlbnREaXIgPSBiYXNlVXJsICsgbG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvW15cXC9dKiQvLCBcIi9cIik7XG5cblx0Ly8gY29udmVydCBlYWNoIHVybCguLi4pXG5cdC8qXG5cdFRoaXMgcmVndWxhciBleHByZXNzaW9uIGlzIGp1c3QgYSB3YXkgdG8gcmVjdXJzaXZlbHkgbWF0Y2ggYnJhY2tldHMgd2l0aGluXG5cdGEgc3RyaW5nLlxuXG5cdCAvdXJsXFxzKlxcKCAgPSBNYXRjaCBvbiB0aGUgd29yZCBcInVybFwiIHdpdGggYW55IHdoaXRlc3BhY2UgYWZ0ZXIgaXQgYW5kIHRoZW4gYSBwYXJlbnNcblx0ICAgKCAgPSBTdGFydCBhIGNhcHR1cmluZyBncm91cFxuXHQgICAgICg/OiAgPSBTdGFydCBhIG5vbi1jYXB0dXJpbmcgZ3JvdXBcblx0ICAgICAgICAgW14pKF0gID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgIHwgID0gT1Jcblx0ICAgICAgICAgXFwoICA9IE1hdGNoIGEgc3RhcnQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICg/OiAgPSBTdGFydCBhbm90aGVyIG5vbi1jYXB0dXJpbmcgZ3JvdXBzXG5cdCAgICAgICAgICAgICAgICAgW14pKF0rICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgIHwgID0gT1Jcblx0ICAgICAgICAgICAgICAgICBcXCggID0gTWF0Y2ggYSBzdGFydCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgICAgICBbXikoXSogID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgXFwpICA9IE1hdGNoIGEgZW5kIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICApICA9IEVuZCBHcm91cFxuICAgICAgICAgICAgICAqXFwpID0gTWF0Y2ggYW55dGhpbmcgYW5kIHRoZW4gYSBjbG9zZSBwYXJlbnNcbiAgICAgICAgICApICA9IENsb3NlIG5vbi1jYXB0dXJpbmcgZ3JvdXBcbiAgICAgICAgICAqICA9IE1hdGNoIGFueXRoaW5nXG4gICAgICAgKSAgPSBDbG9zZSBjYXB0dXJpbmcgZ3JvdXBcblx0IFxcKSAgPSBNYXRjaCBhIGNsb3NlIHBhcmVuc1xuXG5cdCAvZ2kgID0gR2V0IGFsbCBtYXRjaGVzLCBub3QgdGhlIGZpcnN0LiAgQmUgY2FzZSBpbnNlbnNpdGl2ZS5cblx0ICovXG5cdHZhciBmaXhlZENzcyA9IGNzcy5yZXBsYWNlKC91cmxcXHMqXFwoKCg/OlteKShdfFxcKCg/OlteKShdK3xcXChbXikoXSpcXCkpKlxcKSkqKVxcKS9naSwgZnVuY3Rpb24oZnVsbE1hdGNoLCBvcmlnVXJsKSB7XG5cdFx0Ly8gc3RyaXAgcXVvdGVzIChpZiB0aGV5IGV4aXN0KVxuXHRcdHZhciB1bnF1b3RlZE9yaWdVcmwgPSBvcmlnVXJsXG5cdFx0XHQudHJpbSgpXG5cdFx0XHQucmVwbGFjZSgvXlwiKC4qKVwiJC8sIGZ1bmN0aW9uKG8sICQxKXsgcmV0dXJuICQxOyB9KVxuXHRcdFx0LnJlcGxhY2UoL14nKC4qKSckLywgZnVuY3Rpb24obywgJDEpeyByZXR1cm4gJDE7IH0pO1xuXG5cdFx0Ly8gYWxyZWFkeSBhIGZ1bGwgdXJsPyBubyBjaGFuZ2Vcblx0XHRpZiAoL14oI3xkYXRhOnxodHRwOlxcL1xcL3xodHRwczpcXC9cXC98ZmlsZTpcXC9cXC9cXC8pL2kudGVzdCh1bnF1b3RlZE9yaWdVcmwpKSB7XG5cdFx0ICByZXR1cm4gZnVsbE1hdGNoO1xuXHRcdH1cblxuXHRcdC8vIGNvbnZlcnQgdGhlIHVybCB0byBhIGZ1bGwgdXJsXG5cdFx0dmFyIG5ld1VybDtcblxuXHRcdGlmICh1bnF1b3RlZE9yaWdVcmwuaW5kZXhPZihcIi8vXCIpID09PSAwKSB7XG5cdFx0ICBcdC8vVE9ETzogc2hvdWxkIHdlIGFkZCBwcm90b2NvbD9cblx0XHRcdG5ld1VybCA9IHVucXVvdGVkT3JpZ1VybDtcblx0XHR9IGVsc2UgaWYgKHVucXVvdGVkT3JpZ1VybC5pbmRleE9mKFwiL1wiKSA9PT0gMCkge1xuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgcmVsYXRpdmUgdG8gdGhlIGJhc2UgdXJsXG5cdFx0XHRuZXdVcmwgPSBiYXNlVXJsICsgdW5xdW90ZWRPcmlnVXJsOyAvLyBhbHJlYWR5IHN0YXJ0cyB3aXRoICcvJ1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSByZWxhdGl2ZSB0byBjdXJyZW50IGRpcmVjdG9yeVxuXHRcdFx0bmV3VXJsID0gY3VycmVudERpciArIHVucXVvdGVkT3JpZ1VybC5yZXBsYWNlKC9eXFwuXFwvLywgXCJcIik7IC8vIFN0cmlwIGxlYWRpbmcgJy4vJ1xuXHRcdH1cblxuXHRcdC8vIHNlbmQgYmFjayB0aGUgZml4ZWQgdXJsKC4uLilcblx0XHRyZXR1cm4gXCJ1cmwoXCIgKyBKU09OLnN0cmluZ2lmeShuZXdVcmwpICsgXCIpXCI7XG5cdH0pO1xuXG5cdC8vIHNlbmQgYmFjayB0aGUgZml4ZWQgY3NzXG5cdHJldHVybiBmaXhlZENzcztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vc3R5bGUtbG9hZGVyL2ZpeFVybHMuanNcbi8vIG1vZHVsZSBpZCA9IDk0M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vU3BhY2VyLmxlc3NcIik7XG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbi8vIFByZXBhcmUgY3NzVHJhbnNmb3JtYXRpb25cbnZhciB0cmFuc2Zvcm07XG5cbnZhciBvcHRpb25zID0ge31cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gSG90IE1vZHVsZSBSZXBsYWNlbWVudFxuaWYobW9kdWxlLmhvdCkge1xuXHQvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuXHRpZighY29udGVudC5sb2NhbHMpIHtcblx0XHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vU3BhY2VyLmxlc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL1NwYWNlci5sZXNzXCIpO1xuXHRcdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cdFx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9hcHAvU3BhY2VyLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDk0NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGVzLmxlc3NcIik7XG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbi8vIFByZXBhcmUgY3NzVHJhbnNmb3JtYXRpb25cbnZhciB0cmFuc2Zvcm07XG5cbnZhciBvcHRpb25zID0ge31cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gSG90IE1vZHVsZSBSZXBsYWNlbWVudFxuaWYobW9kdWxlLmhvdCkge1xuXHQvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuXHRpZighY29udGVudC5sb2NhbHMpIHtcblx0XHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGVzLmxlc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlcy5sZXNzXCIpO1xuXHRcdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cdFx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9hcHAvc3R5bGVzLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDk0NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvL1xuLy8gICMgQ2xhc3MgdXRpbGl0aWVzXG4vL1xuXG4vLyBDbG9uZSBhIGNsYXNzLCByZS11c2luZyB0aGUgb3JpZ2luYWwgbmFtZS5cbi8vIFRPRE86IG1vdmUgdG8gdXRpbGl0eT9cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZUNsYXNzKGNvbnN0cnVjdG9yLCBuYW1lID0gY29uc3RydWN0b3IubmFtZSkge1xuICAvLyBDbG9uZSB0aGUgY29uc3RydWN0b3IsIGtlZXBpbmcgdGhlIHNhbWUgbmFtZVxuICBnbG9iYWwuX19jbG9uZUNsYXNzX18gPSBjb25zdHJ1Y3RvcjtcbiAgY29uc3QgY2xvbmUgPSBuZXcgRnVuY3Rpb24oXCJuYW1lXCIsIGByZXR1cm4gY2xhc3MgJHtuYW1lfSBleHRlbmRzIF9fY2xvbmVDbGFzc19fIHt9YCkoKTtcbiAgZGVsZXRlIGdsb2JhbC5fX2Nsb25lQ2xhc3NfXztcbiAgcmV0dXJuIGNsb25lO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3V0aWxzL2NsYXNzLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBjcmVhdGluZyB2YXJpYWJsZXMsIHByb3BlcnR5IGFjY2VzcywgZXRjXG4vL1xuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5cbi8vIENyZWF0ZSBcIlVJXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck1vZHVsZShcIlVJXCIpO1xuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG5wYXJzZXIuZGVmaW5lUnVsZXMoXG4gIC8vIEFsZXJ0IGEgbWVzc2FnZS5cbiAge1xuICAgIG5hbWU6IFwiYWxlcnRcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCIsIFwiYXN5bmNcIl0sXG4gICAgc3ludGF4OiBcImFsZXJ0IHttZXNzYWdlOmV4cHJlc3Npb259ICg/OndpdGgge29rQnV0dG9uOnRleHR9KT9cIixcbiAgLy8gVE9ETzogbmVlZCBzb21lIGZhbmN5IHByb21pc2UganVqdSB0byBtYWtlIHBhcmVudCBmdW50aW9uIGFzeW5jP1xuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBhbGVydCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG1lc3NhZ2UsIG9rQnV0dG9uID0gJ1wiT0tcIicgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBhd2FpdCBzcGVsbC5hbGVydCgke21lc3NhZ2V9LCAke29rQnV0dG9ufSlgO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtgYWxlcnQgJ1lvISdgLCBgYXdhaXQgc3BlbGwuYWxlcnQoJ1lvIScsIFwiT0tcIilgXSxcbiAgICAgICAgICBbYGFsZXJ0IFwiWW8hXCJgLCBgYXdhaXQgc3BlbGwuYWxlcnQoXCJZbyFcIiwgXCJPS1wiKWBdLFxuICAgICAgICAgIFtgYWxlcnQgJ1lvIScgd2l0aCAneWVwJ2AsIGBhd2FpdCBzcGVsbC5hbGVydCgnWW8hJywgJ3llcCcpYF0sXG4gICAgICAgICAgW2BhbGVydCBcIllvIVwiIHdpdGggXCJ5ZXBcImAsIGBhd2FpdCBzcGVsbC5hbGVydChcIllvIVwiLCBcInllcFwiKWBdLFxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICB9LFxuXG4gIC8vIFdhcm5pbmcgbWVzc2FnZSAtLSBsaWtlIGFsZXJ0IGJ1dCBmYW5jaWVyLlxuICAvLyBUT0RPOiBuZWVkIHNvbWUgZmFuY3kgcHJvbWlzZSBqdWp1IGhlcmU/XG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcIndhcm5cIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwid2FybiB7bWVzc2FnZTpleHByZXNzaW9ufSAoPzp3aXRoIHtva0J1dHRvbjp0ZXh0fSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHdhcm4gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBtZXNzYWdlLCBva0J1dHRvbiA9ICdcIk9LXCInIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgYXdhaXQgc3BlbGwud2Fybigke21lc3NhZ2V9LCAke29rQnV0dG9ufSlgO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtgd2FybiAnWW8hJ2AsIGBhd2FpdCBzcGVsbC53YXJuKCdZbyEnLCBcIk9LXCIpYF0sXG4gICAgICAgICAgW2B3YXJuICdZbyEnIHdpdGggJ3llcCdgLCBgYXdhaXQgc3BlbGwud2FybignWW8hJywgJ3llcCcpYF0sXG4gICAgICAgICAgW2B3YXJuIFwiWW8hXCJgLCBgYXdhaXQgc3BlbGwud2FybihcIllvIVwiLCBcIk9LXCIpYF0sXG4gICAgICAgICAgW2B3YXJuIFwiWW8hXCIgd2l0aCBcInllcFwiYCwgYGF3YWl0IHNwZWxsLndhcm4oXCJZbyFcIiwgXCJ5ZXBcIilgXSxcbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfSxcblxuXG4gIC8vIENvbmZpcm0gbWVzc2FnZSAtLSBwcmVzZW50IGEgcXVlc3Rpb24gd2l0aCB0d28gYW5zd2Vycy5cbiAgLy8gVE9ETzogbmVlZCBzb21lIGZhbmN5IHByb21pc2UganVqdSBoZXJlP1xuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJjb25maXJtXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcImNvbmZpcm0ge21lc3NhZ2U6ZXhwcmVzc2lvbn0gKD86d2l0aCB7b2tCdXR0b246dGV4dH0gKD86IChhbmR8b3IpIHtjYW5jZWxCdXR0b246dGV4dH0pPyApP1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBjb25maXJtIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbWVzc2FnZSwgb2tCdXR0b24gPSAnXCJPS1wiJywgY2FuY2VsQnV0dG9uID0gJ1wiQ2FuY2VsXCInIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgYXdhaXQgc3BlbGwuY29uZmlybSgke21lc3NhZ2V9LCAke29rQnV0dG9ufSwgJHtjYW5jZWxCdXR0b259KWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW2Bjb25maXJtICdZbyEnYCwgYGF3YWl0IHNwZWxsLmNvbmZpcm0oJ1lvIScsIFwiT0tcIiwgXCJDYW5jZWxcIilgXSxcbiAgICAgICAgICBbYGNvbmZpcm0gJ1lvIScgd2l0aCAneWVwJ2AsIGBhd2FpdCBzcGVsbC5jb25maXJtKCdZbyEnLCAneWVwJywgXCJDYW5jZWxcIilgXSxcbiAgICAgICAgICBbYGNvbmZpcm0gJ1lvIScgd2l0aCAneWVwJyBhbmQgJ25vcGUnYCwgYGF3YWl0IHNwZWxsLmNvbmZpcm0oJ1lvIScsICd5ZXAnLCAnbm9wZScpYF0sXG4gICAgICAgICAgW2Bjb25maXJtICdZbyEnIHdpdGggJ3llcCcgb3IgJ25vcGUnYCwgYGF3YWl0IHNwZWxsLmNvbmZpcm0oJ1lvIScsICd5ZXAnLCAnbm9wZScpYF0sXG4gICAgICAgICAgW2Bjb25maXJtIFwiWW8hXCIgd2l0aCBcInllcFwiIG9yIFwibm9wZVwiYCwgYGF3YWl0IHNwZWxsLmNvbmZpcm0oXCJZbyFcIiwgXCJ5ZXBcIiwgXCJub3BlXCIpYF0sXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICBdXG4gIH1cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvVUkuanMiLCJ2YXIgYmFzZUZsYXR0ZW4gPSByZXF1aXJlKCcuL19iYXNlRmxhdHRlbicpO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBJTkZJTklUWSA9IDEgLyAwO1xuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IGZsYXR0ZW5zIGBhcnJheWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IEFycmF5XG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gZmxhdHRlbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGZsYXR0ZW5lZCBhcnJheS5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5mbGF0dGVuRGVlcChbMSwgWzIsIFszLCBbNF1dLCA1XV0pO1xuICogLy8gPT4gWzEsIDIsIDMsIDQsIDVdXG4gKi9cbmZ1bmN0aW9uIGZsYXR0ZW5EZWVwKGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aDtcbiAgcmV0dXJuIGxlbmd0aCA/IGJhc2VGbGF0dGVuKGFycmF5LCBJTkZJTklUWSkgOiBbXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmbGF0dGVuRGVlcDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2gvZmxhdHRlbkRlZXAuanNcbi8vIG1vZHVsZSBpZCA9IDk0OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgc3RvcmUgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgnd2tzJyk7XG52YXIgdWlkID0gcmVxdWlyZSgnLi9fdWlkJyk7XG52YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuU3ltYm9sO1xudmFyIFVTRV9TWU1CT0wgPSB0eXBlb2YgU3ltYm9sID09ICdmdW5jdGlvbic7XG5cbnZhciAkZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9XG4gICAgVVNFX1NZTUJPTCAmJiBTeW1ib2xbbmFtZV0gfHwgKFVTRV9TWU1CT0wgPyBTeW1ib2wgOiB1aWQpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07XG5cbiRleHBvcnRzLnN0b3JlID0gc3RvcmU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL193a3MuanNcbi8vIG1vZHVsZSBpZCA9IDk1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=