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

			// if tests were defined, mark only as testable
			if (props.tests) {
				// (only use the first rule if we got more than one)
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


parser.defineRules(

//MOVE TO `functions`?
// Arguments clause for methods
//	`with foo` or `with foo and bar and baz`
//TODO: {identifier} = {expression}	=> requires `,` instead of `and`
//TODO: `with foo as Type`
//TODO:	`with foo...` for splat?
{
  name: "args",
  syntax: "with [args:{identifier},]",
  constructor: function (_Rule$Sequence) {
    _inherits(args, _Rule$Sequence);

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
    // showAll: true,
    tests: [["with a", "a"], ["with a, b, c", "a, b, c"], ["with a, b, c,", "a, b, c"]]
  }]
},

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
        var props = this.matched.map(function (prop) {
          var _prop$results = prop.results,
              key = _prop$results.key,
              value = _prop$results.value;
          //TODO: don't quote if we don't have to?
          //TOOD: multiple lines if > 2 props?

          if (value) return "\"" + key + "\": " + value;
          return key;
        });
        return "{ " + props.join(", ") + " }";
      }
    }]);

    return object_literal_properties;
  }(_Rule2.default.List),
  tests: [{
    title: "",
    // showAll: true,
    tests: [["a = 1", "{ \"a\": 1 }"], ["a = 1,", "{ \"a\": 1 }"], ["a = 1, b = yes, c = \"quoted\"", "{ \"a\": 1, \"b\": true, \"c\": \"quoted\" }"]]
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
        var _results = this.results,
            name = _results.name,
            superType = _results.superType,
            statements = _results.statements;

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
    tests: [["define type Foo", "class Foo {}"], ["define type Foo as a Bar", "class Foo extends Bar {}"], ["define type Foo\n\ta = true", "class Foo {\n\ta = true\n}"]]
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
  constructor: function (_Rule$Sequence2) {
    _inherits(new_thing, _Rule$Sequence2);

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
  }(_Rule2.default.Sequence),
  tests: [{
    title: "creates normal objects properly",
    compileAs: "statement",
    // showAll: true,
    tests: [["create Object", "{}"], ["new Object", "{}"], ["new Object with a = 1, b = yes", "{ \"a\": 1, \"b\": true }"], ["new Foo", "new Foo()"], ["new Foo with a = 1, b = yes", "new Foo({ \"a\": 1, \"b\": true })"]]
  }, {
    title: "creates special types",
    compileAs: "expression",
    // showAll: true,
    tests: [["create object", "{}"],
    //FIXME: the following don't make sense if they have arguments...
    ["create List", "new Array()"], ["create list", "new Array()"]]
  }]

},

// Declare instance method or normal function.
// TODO: static/etc
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
            args = _results4$args === undefined ? "" : _results4$args,
            statements = _results4.statements;

        return name + "(" + args + ") " + statements;
      }
    }]);

    return declare_method;
  }(_Rule2.default.BlockStatement),
  tests: [{
    compileAs: "statements",
    showAll: true,
    tests: [["on foo", "foo() {}"], ["to foo", "foo() {}"], ["to foo:", "foo() {}"], ["to foo with a", "foo(a) {}"], ["to foo with a, b", "foo(a, b) {}"], ["to foo with a,b,c", "foo(a, b, c) {}"], ["to foo a = yes", "foo() { a = true }"], ["to foo: a = yes", "foo() { a = true }"], ["to foo with a: a = yes", "foo(a) { a = true }"], ["to foo\n\ta = yes", "foo() {\n\ta = true\n}"], ["to foo with a, b\n\ta = yes\n\tb = no", "foo(a, b) {\n\ta = true\n\tb = false\n}"], ["", ""]]
  }]

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
  constructor: function (_Rule$Sequence3) {
    _inherits(declare_property, _Rule$Sequence3);

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
  constructor: function (_Rule$Sequence4) {
    _inherits(declare_property_of_type, _Rule$Sequence4);

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
  constructor: function (_Rule$Sequence5) {
    _inherits(declare_property_as_one_of, _Rule$Sequence5);

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
  constructor: function (_Rule$Sequence6) {
    _inherits(property_expression, _Rule$Sequence6);

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
  constructor: function (_Rule$Sequence7) {
    _inherits(my_property_expression, _Rule$Sequence7);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvc3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2ZhaWxzLmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9saWIva2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvc3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY29mLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19saWJyYXJ5LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LXBpZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcG4uanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLWtleS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW50ZWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fd2tzLWV4dC5qcyIsIndlYnBhY2s6Ly8vLi9+L2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL3NyYy9QYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9ldmVudF9oYW5kbGVycy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL21hdGNoX2tleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9wYXJzZV9rZXlzLmpzIiwid2VicGFjazovLy8uL34vc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL1NwZWxsRWRpdG9yLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvcnVsZXMvc3BlbGwvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9FeGFtcGxlU3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL1NwYWNlci5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9UYWJiYWJsZVRleHRBcmVhLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL2luZGV4LmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL3V0aWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21lbW9pemUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL0pTWC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcnVsZXMvc3BlbGwvaWYuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL2xpc3RzLmpzIiwid2VicGFjazovLy8uL3NyYy9ydWxlcy9zcGVsbC9vcGVyYXRvcnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL3N0YXRlbWVudHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL3R5cGVzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9lczYvc3ltYm9sLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY2xhc3NvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY3R4LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faHRtbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faXMtYXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX21ldGEuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1jcmVhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcHMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wbi1leHQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3NldC10by1zdHJpbmctdGFnLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL190by1hYnNvbHV0ZS1pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tbGVuZ3RoLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL193a3MtZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL2VzNi5zeW1ib2wuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9TcGFjZXIubGVzcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL3N0eWxlcy5sZXNzIiwid2VicGFjazovLy8uL3NyYy9ydWxlcy9zcGVsbC9jb3JlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kZXNjcmlwdG9ycy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faGFzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2ZhY3RvcnlXaXRoVGhyb3dpbmdTaGltcy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9jbGFzc19kZWNvcmF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvbWV0aG9kX2RlY29yYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9tZXRob2RfZGVjb3JhdG9yX3Njb3BlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9hcnJheS5mcm9tLmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvZG9tX2hlbHBlcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9saXN0ZW5lcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi91dWlkLmpzIiwid2VicGFjazovLy8uL3NyYy9SdWxlLmpzIiwid2VicGFjazovLy8uL3NyYy9SdWxlU3ludGF4LmpzIiwid2VicGFjazovLy8uL3NyYy9Ub2tlbml6ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2lzLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdWlkLmpzIiwid2VicGFjazovLy8uL34vc3R5bGUtbG9hZGVyL2ZpeFVybHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9TcGFjZXIubGVzcz8wOGRlIiwid2VicGFjazovLy8uL3NyYy9hcHAvc3R5bGVzLmxlc3M/YjdlNyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvY2xhc3MuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL1VJLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL193a3MuanMiXSwibmFtZXMiOlsiaXNXaGl0ZXNwYWNlIiwic2hvd1doaXRlc3BhY2UiLCJwbHVyYWxpemUiLCJpc1BsdXJhbCIsInNpbmd1bGFyaXplIiwiaXNTaW5ndWxhciIsImdldFRhYnMiLCJBTExfV0hJVEVTUEFDRSIsInRleHQiLCJ0ZXN0Iiwic3RyaW5nIiwicmVwbGFjZSIsIndvcmQiLCJUQUJTIiwibnVtYmVyIiwic3Vic3RyIiwiYWxsRXhwb3J0cyIsImV4cG9ydHMiLCJnbG9iYWwiLCJTVFJJTkciLCJnbG9iYWxfaWRlbnRpZmllciIsIndpbmRvdyIsInNlbGYiLCJQYXJzZUVycm9yIiwiY29uc29sZSIsImdyb3VwIiwibG9nIiwiZ3JvdXBFbmQiLCJhcmdzIiwiRXJyb3IiLCJhcHBseSIsImNhcHR1cmVTdGFja1RyYWNlIiwicHJvdG90eXBlIiwiUGFyc2VyIiwicHJvcGVydGllcyIsImltcG9ydHMiLCJfcnVsZXMiLCJPYmplY3QiLCJhc3NpZ24iLCJydWxlTmFtZSIsImFyZ3VtZW50cyIsImxlbmd0aCIsIlRJTUUiLCJ0aW1lIiwidG9rZW5zIiwiVG9rZW5pemVyIiwidG9rZW5pemUiLCJmaWx0ZXIiLCJpc05vcm1hbFdoaXRlc3BhY2UiLCJ0b2tlbiIsInRpbWVFbmQiLCJ1bmRlZmluZWQiLCJyZW1vdmVMZWFkaW5nV2hpdGVzcGFjZSIsInJlc3VsdCIsInBhcnNlTmFtZWRSdWxlIiwicGFyc2UiLCJ0b1NvdXJjZSIsInN0YXJ0IiwiZW5kIiwic3RhY2siLCJjYWxsaW5nQ29udGV4dCIsInJ1bGUiLCJydWxlcyIsInJldmVyc2UiLCJjb25jYXQiLCJfX3J1bGVzIiwiQXJyYXkiLCJpc0FycmF5IiwiZm9yRWFjaCIsImFkZFJ1bGUiLCJtZXJnZVJ1bGUiLCJSdWxlIiwiQWx0ZXJuYXRpdmVzIiwicmVkdWNlIiwiYmxhY2tsaXN0IiwiZGVmaW5lUnVsZSIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJuYW1lIiwiVHlwZUVycm9yIiwibW9kdWxlIiwiY2Fub25pY2FsIiwibWFwIiwia2V5Iiwia2V5cyIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJuYW1lcyIsImFsaWFzIiwic3ludGF4IiwidGVzdHMiLCJvdXRwdXQiLCJmb3JNb2R1bGUiLCJwYXJzZXIiLCJSRUdJU1RSWSIsImV4aXN0aW5nIiwiYWx0Q29uc3RydWN0b3IiLCJzdGFydFRva2VuIiwiZW5kVG9rZW4iLCJuZXN0aW5nIiwibmVzdGVkIiwibGFzdEluZGV4Iiwic2xpY2UiLCJERUJVRyIsIldBUk4iLCJTcGVsbEVkaXRvciIsIm9ic2VydmVyIiwiZXhhbXBsZXMiLCJsb2FkIiwic3BlbGxFZGl0b3IiLCJzYXZlIiwicmV2ZXJ0IiwiY29tcGlsZSIsImNyZWF0ZSIsImRlbGV0ZSIsInJlbmFtZSIsImR1cGxpY2F0ZSIsInJlc2V0IiwidGl0bGVzIiwic2VsZWN0ZWQiLCJkaXJ0eSIsImNvZGUiLCJvcHRpb25zIiwidGl0bGUiLCJjb250ZW50Iiwib25DbGljayIsInNlbGVjdCIsImRpcnR5QnV0dG9ucyIsInBvc2l0aW9uIiwicmlnaHQiLCJ0b3AiLCJtYXJnaW4iLCJjb21waWxlQnV0dG9uIiwid2lkdGgiLCJsZWZ0IiwiaGVpZ2h0IiwicGFkZGluZ1RvcCIsImV2ZW50IiwidXBkYXRlIiwidGFyZ2V0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJkZWZhdWx0UHJvcHMiLCJFeGFtcGxlU3RvcmUiLCJpbXBvcnQiLCJwYXJzZVJ1bGUiLCJiaW5kIiwibG9jYWxTdG9yYWdlIiwic3BlbGxFZGl0b3JFeGFtcGxlcyIsInNwZWxsRWRpdG9yRXhhbXBsZSIsImxvY2F0aW9uIiwicmVsb2FkIiwiSlNPTiIsIl9zYXZlZEV4YW1wbGVzIiwic3RyaW5naWZ5IiwiZXhhbXBsZSIsInNraXBTYXZlIiwic2hvd0NvbmZpcm0iLCJjb25maXJtIiwicHJvbXB0Iiwib2xkTmFtZSIsIm5ld05hbWUiLCJ3YXJuIiwic2V0VGltZW91dCIsImluZm8iLCJvYnNlcnZhYmxlIiwiY29tcHV0ZWQiLCJTcGFjZXIiLCJjbGFzc05hbWUiLCJhcHBlYXJhbmNlIiwic2l6ZSIsImlubGluZSIsImZsdWlkIiwidGlueSIsInNtYWxsIiwibWVkaXVtIiwibGFyZ2UiLCJodWdlIiwibWFzc2l2ZSIsInNwYWNlclByb3BzIiwic3R5bGUiLCJwcm9wVHlwZXMiLCJQcm9wVHlwZXMiLCJib29sIiwiVGFiYmFibGVUZXh0QXJlYSIsIm9uS2V5RG93biIsImtleUNvZGUiLCJwcmV2ZW50RGVmYXVsdCIsImVsZW1lbnQiLCJzZWxlY3Rpb25TdGFydCIsInNlbGVjdGlvbkVuZCIsIm5ld1RleHQiLCJzaGlmdEtleSIsImxhc3RJbmRleE9mIiwiaW5kZXhPZiIsImxpbmVzIiwic3BsaXQiLCJsaW5lIiwiam9pbiIsIm9uQ2hhbmdlIiwiVGV4dEFyZWEiLCJSZWFjdERPTSIsInJlbmRlciIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJjbGFzc05hbWVzIiwiYXJnIiwiQm9vbGVhbiIsIm1lbW9pemVkIiwiZGVmaW5lTWVtb2l6ZWQiLCJwcm9wZXJ0eSIsImdldHRlciIsImNvbmZpZ3VyYWJsZSIsImdldCIsImRlZmluZVJ1bGVzIiwiSlNYRWxlbWVudCIsImNsb25lIiwibWF0Y2hlZCIsIm5leHRTdGFydCIsImpzeEVsZW1lbnQiLCJhdHRyaWJ1dGVzIiwiYXR0cnMiLCJKU1hFeHByZXNzaW9uIiwianN4RXhwcmVzc2lvblRvU291cmNlIiwiY2hpbGRyZW4iLCJjaGlsZCIsInRyaW0iLCJjaGlsZFNvdXJjZSIsImpzeEVsZW1lbnRUb1NvdXJjZSIsIlN5bnRheEVycm9yIiwianN4RXhwcmVzc2lvbiIsInRhZ05hbWUiLCJhdHRyc1RvU291cmNlIiwiY2hpbGRyZW5Ub1NvdXJjZSIsInJlc3VsdHMiLCJjb25kaXRpb24iLCJzdGF0ZW1lbnRzIiwiQmxvY2tTdGF0ZW1lbnQiLCJjb21waWxlQXMiLCJsZWZ0UmVjdXJzaXZlIiwidGVzdFJ1bGUiLCJLZXl3b3JkcyIsImxpdGVyYWxzIiwic3RhdGVtZW50IiwiZWxzZVN0YXRlbWVudCIsIlNlcXVlbmNlIiwibGlzdCIsImlkZW50aWZpZXIiLCJ0aGluZyIsImV4cHJlc3Npb24iLCJhcmd1bWVudCIsIm1hdGNoIiwib3BlcmF0b3IiLCJiYW5nIiwiaXRlbSIsIml0ZW1WYXIiLCJwb3NpdGlvblZhciIsImJsb2NrIiwiQmxvY2siLCJlbmNsb3NlU3RhdGVtZW50cyIsImxocyIsInJocyIsIl9vcGVyYXRvciIsImFwcGx5T3BlcmF0b3IiLCJwcmVjZWRlbmNlIiwiYSIsImIiLCJ0eXBlIiwiU3ltYm9scyIsImRpcmVjdGlvbiIsInByb3AiLCJMaXN0Iiwic3RydWN0dXJlIiwic3VwZXJUeXBlIiwic3ViVHlwZSIsInNob3dBbGwiLCJ0eXBlcyIsImNvbmRpdGlvbnMiLCJwdXNoIiwia2V5d29yZHMiLCJrZXl3b3JkTWF0Y2hlcyIsImtleXdvcmQiLCJUeXBlIiwiZXJyb3IiLCJpbmRleCIsInRvTG93ZXJDYXNlIiwic3RhcnRzV2l0aCIsIm1hdGNoZWRUZXh0Iiwic2NvcGUiLCJkZWNsYXJhdGlvbiIsImRhdGFUeXBlIiwicGx1cmFsIiwicHJvcGVydGllc18iLCJfcHJvcGVydGllcyIsIlN0YXRlbWVudHMiLCJDb21tZW50IiwicGF0dGVybiIsIlBhdHRlcm4iLCJOdW1iZXIiLCJOVU1CRVJfTkFNRVMiLCJ6ZXJvIiwib25lIiwidHdvIiwidGhyZWUiLCJmb3VyIiwiZml2ZSIsInNpeCIsInNldmVuIiwiZWlnaHQiLCJuaW5lIiwidGVuIiwiVGV4dCIsInF1b3RlZFN0cmluZyIsImVuZHNXaXRoIiwiTGl0ZXJhbHMiLCJtYXRjaGVzU3RhcnRpbmdBdCIsImxpdGVyYWxTZXBhcmF0b3IiLCJmaXJzdCIsImV2ZXJ5IiwibGl0ZXJhbCIsImkiLCJvcHRpb25hbCIsInNvbWUiLCJzb3VyY2UiLCJTdWJydWxlIiwibWF0Y2hlZFJ1bGUiLCJzdWJydWxlIiwiaW5jbHVkZXMiLCJ0b1N5bnRheCIsImFkZFJlc3VsdHMiLCJjb21tZW50IiwicHJvbW90ZSIsInNvdXJjZU5hbWUiLCJtYXRjaE5hbWUiLCJtYXRjaGVzIiwiYmVzdE1hdGNoIiwiZ2V0QmVzdE1hdGNoIiwiYmVzdCIsImN1cnJlbnQiLCJSZXBlYXQiLCJyZXBlYXQiLCJpc0NvbXBvdW5kUnVsZSIsImRlbGltaXRlciIsImluZGVudCIsImNvbnRlbnRzIiwiQmxhbmtMaW5lIiwibGFzdCIsInBhcnNlQmxvY2siLCJwYXJzZVN0YXRlbWVudCIsIldoaXRlc3BhY2UiLCJTdGF0ZW1lbnRQYXJzZUVycm9yIiwidW5wYXJzZWQiLCJwYXJzZWQiLCJlIiwiYmxvY2tUb1NvdXJjZSIsIl9uYW1lIiwiX3N1cGVyVHlwZSIsIm5hbWVkIiwibWV0aG9kcyIsIm90aGVyIiwidG9TdHJ1Y3R1cmUiLCJhZGRTdHJ1Y3R1cmUiLCJmb3JjZVdyYXAiLCJicmVha0ludG9CbG9ja3MiLCJfc3RhdGVtZW50cyIsIl9ibG9jayIsIl9zdGF0ZW1lbnQiLCJlbmNsb3NlU3RhdGVtZW50Iiwid2hpdGVzcGFjZSIsIm1lc3NhZ2UiLCJwYXJzZVN5bnRheCIsInRva2VuaXNlUnVsZVN5bnRheCIsIlNZTlRBWF9FWFBSRVNTSU9OIiwic3ludGF4U3RyZWFtIiwicGFyc2VUb2tlbiIsInBvcCIsIktFWVdPUkRfUEFUVEVSTiIsInN5bnRheFRva2VuIiwicGFyc2VTeW1ib2wiLCJwYXJzZVN1YnJ1bGUiLCJwYXJzZUFsdGVybmF0aXZlcyIsInBhcnNlTGlzdCIsInBhcnNlUmVwZWF0IiwicGFyc2VLZXl3b3JkIiwibmV4dCIsImlzRXNjYXBlZCIsImZpbmROZXN0ZWRUb2tlbnMiLCJhbHRlcm5hdGl2ZXMiLCJncm91cEFsdGVybmF0aXZlcyIsInN5bWJvbCIsInBhcmFtcyIsImJhbmdQb3NpdGlvbiIsIm5vdCIsIm5ld2xpbmUiLCJJbmRlbnQiLCJORVdMSU5FIiwiZWF0VG9rZW5zIiwibWF0Y2hUb3BUb2tlbnMiLCJtZXRob2QiLCJjYWxsIiwibWF0Y2hXaGl0ZXNwYWNlIiwibWF0Y2hXb3JkIiwibWF0Y2hOdW1iZXIiLCJtYXRjaE5ld2xpbmUiLCJtYXRjaEpTWEVsZW1lbnQiLCJtYXRjaFRleHQiLCJtYXRjaENvbW1lbnQiLCJtYXRjaFN5bWJvbCIsImVhdFdoaXRlc3BhY2UiLCJ3aGl0ZVNwYWNlRW5kIiwid2hpdGVzcGFjZUVuZCIsIldPUkRfU1RBUlQiLCJXT1JEX0NIQVIiLCJ3b3JkRW5kIiwiTlVNQkVSX1NUQVJUIiwiTlVNQkVSIiwibnVtYmVyTWF0Y2giLCJtYXRjaEV4cHJlc3Npb25BdEhlYWQiLCJudW1iZXJTdHIiLCJwYXJzZUZsb2F0IiwicXVvdGVTeW1ib2wiLCJ0ZXh0RW5kIiwiY2hhciIsIkNPTU1FTlQiLCJjb21tZW50U3RhcnQiLCJnZXRMaW5lQXRIZWFkIiwiY29tbWVudE1hdGNoIiwiY29tbWVudFN5bWJvbCIsIm1hdGNoSlNYU3RhcnRUYWciLCJpc1VuYXJ5VGFnIiwibWF0Y2hKU1hDaGlsZHJlbiIsImNoaWxkRW5kIiwiSlNYX1RBR19TVEFSVCIsInRhZ01hdGNoIiwiZW5kQml0IiwibWF0Y2hKU1hBdHRyaWJ1dGUiLCJhdHRyRW5kIiwiYXR0cnNBc1N0cmluZyIsImNoaWxkcmVuQXNTdHJpbmciLCJhdHRyIiwiZW5kVGFnIiwibWF0Y2hKU1hDaGlsZCIsIm1hdGNoSlNYRW5kVGFnIiwibWF0Y2hKU1hFeHByZXNzaW9uIiwibWF0Y2hKU1hUZXh0IiwibWF0Y2hTdHJpbmdBdEhlYWQiLCJKU1hfQVRUUklCVVRFX1NUQVJUIiwiZXF1YWxzIiwiYXR0cmlidXRlIiwiSlNYQXR0cmlidXRlIiwibWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZSIsInZhbHVlRW5kIiwibWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZUlkZW50aWZpZXIiLCJlbmRJbmRleCIsImZpbmRNYXRjaGluZ0F0SGVhZCIsIkpTWF9URVhUX0VORF9DSEFSUyIsImZpbmRGaXJzdEF0SGVhZCIsImpzeFRleHQiLCJzdHJpbmdFbmQiLCJoZWFkIiwic3RhcnREZWxpbWl0ZXIiLCJlbmREZWxpbWl0ZXIiLCJhZnRlclF1b3RlIiwiY2hhcnMiLCJyZW1vdmVOb3JtYWxXaGl0ZXNwYWNlIiwiYnJlYWtJbnRvTGluZXMiLCJjdXJyZW50TGluZSIsImdldExpbmVJbmRlbnRzIiwiZGVmYXVsdEluZGVudCIsImluZGVudHMiLCJnZXRMaW5lSW5kZW50Iiwic3RhcnRJbmRlbnQiLCJnZXROZXh0SW5kZW50IiwibWF4SW5kZW50IiwiTWF0aCIsIm1pbiIsImxpbmVJbmRlbnQiLCJuZXdCbG9jayIsImNsb25lQ2xhc3MiLCJfX2Nsb25lQ2xhc3NfXyIsIkZ1bmN0aW9uIiwib2tCdXR0b24iLCJjYW5jZWxCdXR0b24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O1FBSWdCQSxZLEdBQUFBLFk7UUFJQUMsYyxHQUFBQSxjO1FBU0FDLFMsR0FBQUEsUztRQU1BQyxRLEdBQUFBLFE7UUFRQUMsVyxHQUFBQSxXO1FBTUFDLFUsR0FBQUEsVTtRQU9BQyxPLEdBQUFBLE87O0FBNUNoQjs7Ozs7O0FBRUE7QUFDQSxJQUFJQyxpQkFBaUIsT0FBckI7QUFDTyxTQUFTUCxZQUFULENBQXNCUSxJQUF0QixFQUE0QjtBQUNsQyxRQUFPRCxlQUFlRSxJQUFmLENBQW9CRCxJQUFwQixDQUFQO0FBQ0E7O0FBRU0sU0FBU1AsY0FBVCxDQUF3QlMsTUFBeEIsRUFBZ0M7QUFDckMsS0FBSSxPQUFPQSxNQUFQLEtBQWtCLFFBQXRCLEVBQWdDLE9BQU9BLE1BQVA7QUFDaEMsUUFBT0EsT0FBT0MsT0FBUCxDQUFlLEtBQWYsRUFBc0IsR0FBdEIsRUFDRUEsT0FERixDQUNVLEtBRFYsRUFDaUIsR0FEakIsQ0FBUDtBQUVEOztBQUVEO0FBQ0E7QUFDQTtBQUNPLFNBQVNULFNBQVQsQ0FBbUJVLElBQW5CLEVBQXlCO0FBQy9CLFFBQU9BLE9BQU8sR0FBZDtBQUNBOztBQUVEO0FBQ0E7QUFDTyxTQUFTVCxRQUFULENBQWtCUyxJQUFsQixFQUF3QjtBQUM5QixRQUFPQSxTQUFTVixVQUFVVSxJQUFWLENBQWhCO0FBQ0E7O0FBR0Q7QUFDQTtBQUNBO0FBQ08sU0FBU1IsV0FBVCxDQUFxQlEsSUFBckIsRUFBMkI7QUFDakMsUUFBT0EsS0FBS0QsT0FBTCxDQUFhLE1BQWIsRUFBcUIsRUFBckIsQ0FBUDtBQUNBOztBQUVEO0FBQ0E7QUFDTyxTQUFTTixVQUFULENBQW9CTyxJQUFwQixFQUEwQjtBQUNoQyxRQUFPQSxTQUFTUixZQUFZUSxJQUFaLENBQWhCO0FBQ0E7O0FBR0Q7QUFDQSxJQUFNQyxPQUFPLHNFQUFi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QUFzQjtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdURBQXVEO0FBQ3ZEOztBQUVBLDZCQUE2QixtQkFBbUI7O0FBRWhEOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsVEE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFHcUJ3RSxXLFdBZW5CLDRCQUFRLFFBQVIsQyxVQUdBLDRCQUFRLFFBQVIsQyxVQUdBLDRCQUFRLFFBQVIsQyxVQUdBLDRCQUFRLFFBQVIsQyxVQUdBLDRCQUFRLFFBQVIsQyxNQTVCREMsbUI7OztBQU1BLHNCQUFZN0IsS0FBWixFQUFtQjtBQUFBOztBQUFBLHdIQUNaQSxLQURZOztBQUVwQnhELFNBQU9zRixRQUFQLEdBQWtCOUIsTUFBTThCLFFBQXhCO0FBQ0UsUUFBSzlCLEtBQUwsQ0FBVzhCLFFBQVgsQ0FBb0JDLElBQXBCOztBQUVBO0FBQ0F2RixTQUFPd0YsV0FBUDtBQUNBeEYsU0FBT3NGLFFBQVAsR0FBa0IsTUFBSzlCLEtBQUwsQ0FBVzhCLFFBQTdCO0FBUGtCO0FBUWxCOzs7O3lCQUdNO0FBQUUsUUFBSzlCLEtBQUwsQ0FBVzhCLFFBQVgsQ0FBb0JHLElBQXBCO0FBQTZCOzs7MkJBRzdCO0FBQUUsUUFBS2pDLEtBQUwsQ0FBVzhCLFFBQVgsQ0FBb0JJLE1BQXBCO0FBQStCOzs7NEJBR2hDO0FBQUUsUUFBS2xDLEtBQUwsQ0FBVzhCLFFBQVgsQ0FBb0JLLE9BQXBCO0FBQWdDOzs7MkJBR25DO0FBQUUsUUFBS25DLEtBQUwsQ0FBVzhCLFFBQVgsQ0FBb0JNLE1BQXBCO0FBQStCOzs7NEJBR2pDO0FBQUUsUUFBS3BDLEtBQUwsQ0FBVzhCLFFBQVgsQ0FBb0JPLE1BQXBCLENBQTJCL0QsU0FBM0IsRUFBc0MsU0FBdEM7QUFBbUQ7OzsyQkFFckQ7QUFBRSxRQUFLMEIsS0FBTCxDQUFXOEIsUUFBWCxDQUFvQlEsTUFBcEI7QUFBK0I7Ozs4QkFDOUI7QUFBRSxRQUFLdEMsS0FBTCxDQUFXOEIsUUFBWCxDQUFvQlMsU0FBcEI7QUFBa0M7Ozt5QkFDekM7QUFBRSxRQUFLdkMsS0FBTCxDQUFXOEIsUUFBWCxDQUFvQkMsSUFBcEI7QUFBNkI7OzswQkFDOUI7QUFBRSxRQUFLL0IsS0FBTCxDQUFXOEIsUUFBWCxDQUFvQlUsS0FBcEI7QUFBOEI7OzsyQkFHL0I7QUFBQTs7QUFBQSxPQUNGVixRQURFLEdBQ1csS0FBSzlCLEtBRGhCLENBQ0Y4QixRQURFO0FBQUEsT0FFRlcsTUFGRSxHQUV3Q1gsUUFGeEMsQ0FFRlcsTUFGRTtBQUFBLE9BRU1DLFFBRk4sR0FFd0NaLFFBRnhDLENBRU1ZLFFBRk47QUFBQSxPQUVnQkMsS0FGaEIsR0FFd0NiLFFBRnhDLENBRWdCYSxLQUZoQjtBQUFBLE9BRXVCQyxJQUZ2QixHQUV3Q2QsUUFGeEMsQ0FFdUJjLElBRnZCO0FBQUEsT0FFNkI5QixNQUY3QixHQUV3Q2dCLFFBRnhDLENBRTZCaEIsTUFGN0I7O0FBSVI7O0FBQ0EsT0FBSStCLFVBQVVKLE9BQU9wQyxHQUFQLENBQVk7QUFBQSxXQUN4QjtBQUNBSSxZQUFPcUMsS0FEUDtBQUVBQSxZQUFPQSxLQUZQO0FBR0FuSCxXQUFNbUgsS0FITjtBQUlBQyxjQUFTRCxLQUpUO0FBS0FFLGNBQVM7QUFBQSxhQUFNbEIsU0FBU21CLE1BQVQsQ0FBZ0JILEtBQWhCLENBQU47QUFBQTtBQUxULEtBRHdCO0FBQUEsSUFBWixDQUFkOztBQVNBLE9BQUlJLGVBQWUsU0FBZkEsWUFBZSxHQUFNO0FBQ3hCLFFBQUksQ0FBQ1AsS0FBTCxFQUFZO0FBQ1osV0FDQztBQUFDLDBCQUFEO0FBQUEsT0FBTSxlQUFOLEVBQWdCLE9BQU8sRUFBRVEsVUFBVSxVQUFaLEVBQXdCQyxPQUFPLE1BQS9CLEVBQXVDQyxLQUFLLEtBQTVDLEVBQW1EQyxRQUFRLENBQTNELEVBQXZCO0FBQ0M7QUFBQyw2QkFBRDtBQUFBLFFBQVEsY0FBUixFQUFpQixTQUFTO0FBQUEsZUFBTSxPQUFLcEIsTUFBTCxFQUFOO0FBQUEsUUFBMUI7QUFBK0M7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUEvQztBQUFBO0FBQUEsTUFERDtBQUVDO0FBQUMsNkJBQUQ7QUFBQSxRQUFRLGNBQVIsRUFBaUIsU0FBUztBQUFBLGVBQU0sT0FBS0QsSUFBTCxFQUFOO0FBQUEsUUFBMUI7QUFBNkM7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUE3QztBQUFBO0FBQUE7QUFGRCxLQUREO0FBTUEsSUFSRDs7QUFVQSxPQUFJc0IsZ0JBQWdCLFNBQWhCQSxhQUFnQixHQUFNO0FBQ3pCLFFBQUl6QyxNQUFKLEVBQVk7QUFDWixXQUFPLDhCQUFDLHVCQUFEO0FBQ0wsWUFBTyxFQUFFcUMsVUFBVSxVQUFaLEVBQXlCSyxPQUFPLEtBQWhDLEVBQXVDQyxNQUFNLGlCQUE3QyxFQUFnRUosS0FBSyxLQUFyRSxFQURGO0FBRUwsY0FBUztBQUFBLGFBQU0sT0FBS2xCLE9BQUwsRUFBTjtBQUFBLE1BRko7QUFHTCxXQUFLLGVBSEEsR0FBUDtBQUlBLElBTkQ7O0FBUUEsVUFDQTtBQUFDLHlCQUFEO0FBQUEsTUFBTSxlQUFOLEVBQWdCLFlBQWhCLEVBQXVCLFdBQVUsWUFBakM7QUFDQztBQUFDLDBCQUFELENBQU0sR0FBTjtBQUFBLE9BQVUsT0FBTyxFQUFFdUIsUUFBUSxNQUFWLEVBQWtCQyxZQUFZLE1BQTlCLEVBQWpCLEVBQXlELFdBQVUsMkJBQW5FO0FBQ0M7QUFBQywyQkFBRCxDQUFNLE1BQU47QUFBQSxRQUFhLE9BQU8sQ0FBcEI7QUFDQztBQUFDLDRCQUFEO0FBQUEsU0FBTSxjQUFOLEVBQWUsY0FBZixFQUF3QixXQUF4QjtBQUNDO0FBQUMsNkJBQUQsQ0FBTSxJQUFOO0FBQUE7QUFBQTtBQUFBLFFBREQ7QUFFQyxxQ0FBQyx5QkFBRCxJQUFVLFVBQVYsRUFBZSxlQUFmLEVBQXlCLFNBQVNkLE9BQWxDLEVBQTJDLE9BQU9ILFFBQWxELEVBQTRELE9BQU8sRUFBRWMsT0FBTyxNQUFULEVBQW5FLEdBRkQ7QUFHQztBQUFDLDZCQUFELENBQU0sSUFBTjtBQUFBLFVBQVcsU0FBUztBQUFBLGlCQUFNLE9BQUtuQixNQUFMLEVBQU47QUFBQSxVQUFwQjtBQUF5QztBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQXpDO0FBQUE7QUFBQSxRQUhEO0FBSUM7QUFBQyw2QkFBRCxDQUFNLElBQU47QUFBQSxVQUFXLFNBQVM7QUFBQSxpQkFBTSxPQUFLQyxNQUFMLEVBQU47QUFBQSxVQUFwQjtBQUFBO0FBQUEsUUFKRDtBQUtDO0FBQUMsNkJBQUQsQ0FBTSxJQUFOO0FBQUEsVUFBVyxTQUFTO0FBQUEsaUJBQU0sT0FBS0MsU0FBTCxFQUFOO0FBQUEsVUFBcEI7QUFBQTtBQUFBO0FBTEQ7QUFERCxNQUREO0FBVUM7QUFBQywyQkFBRCxDQUFNLE1BQU47QUFBQSxRQUFhLE9BQU8sQ0FBcEI7QUFDQztBQUFDLDRCQUFEO0FBQUEsU0FBTSxjQUFOLEVBQWUsY0FBZixFQUF3QixXQUF4QjtBQUNDLHFDQUFDLGdCQUFELElBQVEsV0FBUixHQUREO0FBRUM7QUFBQyw2QkFBRCxDQUFNLElBQU47QUFBQSxVQUFXLFNBQVM7QUFBQSxpQkFBTSxPQUFLSCxNQUFMLEVBQU47QUFBQSxVQUFwQjtBQUF5QztBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQXpDO0FBQUE7QUFBQSxRQUZEO0FBR0MscUNBQUMsZ0JBQUQsSUFBUSxXQUFSO0FBSEQ7QUFERCxNQVZEO0FBaUJDO0FBQUMsMkJBQUQsQ0FBTSxNQUFOO0FBQUEsUUFBYSxPQUFPLENBQXBCO0FBQ0M7QUFBQyw0QkFBRDtBQUFBLFNBQU0sY0FBTixFQUFlLGNBQWYsRUFBd0IsV0FBeEI7QUFDQyxxQ0FBQyxnQkFBRCxJQUFRLFdBQVIsR0FERDtBQUVDO0FBQUMsNkJBQUQsQ0FBTSxJQUFOO0FBQUEsVUFBVyxTQUFTO0FBQUEsaUJBQU0sT0FBS0wsSUFBTCxFQUFOO0FBQUEsVUFBcEI7QUFBQTtBQUFBLFFBRkQ7QUFHQztBQUFDLDZCQUFELENBQU0sSUFBTjtBQUFBLFVBQVcsU0FBUztBQUFBLGlCQUFNLE9BQUtTLEtBQUwsRUFBTjtBQUFBLFVBQXBCO0FBQUE7QUFBQTtBQUhEO0FBREQ7QUFqQkQsS0FERDtBQTBCQztBQUFDLDBCQUFELENBQU0sR0FBTjtBQUFBLE9BQVUsT0FBTyxFQUFFa0IsUUFBUSxtQkFBVixFQUFqQjtBQUNDO0FBQUMsMkJBQUQsQ0FBTSxNQUFOO0FBQUEsUUFBYSxPQUFPLENBQXBCO0FBQ0Msb0NBQUMsMEJBQUQ7QUFDQyxrQkFBVSxZQURYO0FBRUMsY0FBT2QsSUFGUjtBQUdDLGlCQUFVLGtCQUFDZ0IsS0FBRDtBQUFBLGVBQVc5QixTQUFTK0IsTUFBVCxDQUFnQi9CLFNBQVNZLFFBQXpCLEVBQW1Da0IsTUFBTUUsTUFBTixDQUFhckQsS0FBaEQsRUFBdUQsV0FBdkQsQ0FBWDtBQUFBO0FBSFgsUUFERDtBQU1FeUM7QUFORixNQUREO0FBU0M7QUFBQywyQkFBRCxDQUFNLE1BQU47QUFBQSxRQUFhLE9BQU8sQ0FBcEI7QUFDQyxvQ0FBQyx5QkFBRCxJQUFVLFdBQVUsWUFBcEIsRUFBaUMsT0FBT3BDLE1BQXhDO0FBREQsTUFURDtBQVlFeUM7QUFaRjtBQTFCRCxJQURBO0FBMENFOzs7O0VBOUdxQ1EsZ0JBQU1DLFMsV0FDdkNDLFksR0FBZTtBQUNyQm5DLFdBQVUsSUFBSW9DLHNCQUFKO0FBRFcsQztrQkFERnRDLFc7Ozs7Ozs7Ozs7Ozs7O0FDVnJCOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQTs7O0FBVkE7QUFOQTtBQWlCQSxJQUFNWixTQUFTNUQsaUJBQU8yRCxTQUFQLENBQWlCLE9BQWpCLENBQWY7QUFDQTtBQUNBQyxPQUFPbUQsTUFBUCxDQUFjLE1BQWQsRUFBc0IsT0FBdEIsRUFBK0IsT0FBL0IsRUFBd0MsV0FBeEMsRUFBcUQsSUFBckQsRUFBMkQsWUFBM0QsRUFBeUUsS0FBekUsRUFBZ0YsSUFBaEY7QUFDQTtrQkFDZW5ELE07O0FBRWY7O0FBQ0EsSUFBSSxPQUFPeEUsTUFBUCxLQUFrQixXQUF0QixFQUFtQztBQUNsQ2dCLFFBQU9DLE1BQVAsQ0FBY2pCLE1BQWQsRUFBc0I7QUFDckJZLDBCQURxQjtBQUVyQmdILGlDQUZxQjs7QUFJckIxRSxzQkFKcUI7O0FBTXJCMUIsZ0NBTnFCO0FBT3JCQyxZQUFVRCxvQkFBVUMsUUFBVixDQUFtQm9HLElBQW5CLENBQXdCakksUUFBUTRCLFNBQWhDLENBUFc7O0FBU3JCZ0QsZ0JBVHFCO0FBVXJCdEMsU0FBT3NDLE9BQU90QyxLQUFQLENBQWEyRixJQUFiLENBQWtCckQsTUFBbEIsQ0FWYztBQVdyQm1CLFdBQVNuQixPQUFPbUIsT0FBUCxDQUFla0MsSUFBZixDQUFvQnJELE1BQXBCO0FBWFksRUFBdEI7QUFhQSxDOzs7Ozs7Ozs7Ozs7Ozs7OztrRkN0Q0Q7OztBQUdBOzs7QUFGQTs7OztBQUdBOzs7O0FBS0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSkE1RCxpQkFBT3VFLElBQVAsR0FBYyxJQUFkO0FBQ0F2RSxpQkFBT3NFLEtBQVAsR0FBZSxJQUFmO0FBQ0F0RSxpQkFBT1MsSUFBUCxHQUFjLElBQWQ7O0FBR0FHLG9CQUFVMkQsSUFBVixHQUFpQixJQUFqQjs7SUFHcUJ1QyxZOzs7Ozs7Ozs7Ozs7QUFHcEI7O0FBRUE7O0FBRUE7Ozs7Ozs7QUFrQkE7MEJBQ1E7QUFDUCxVQUFPSSxhQUFhQyxtQkFBcEI7QUFDQSxVQUFPRCxhQUFhRSxrQkFBcEI7QUFDQWhJLFVBQU9pSSxRQUFQLENBQWdCQyxNQUFoQjtBQUNBOztBQUVEOzs7O3lCQUNPO0FBQ047QUFDQSxRQUFLNUMsUUFBTCxHQUFnQjZDLEtBQUtqRyxLQUFMLENBQVc0RixhQUFhQyxtQkFBYixJQUN2QixvREFEWSxDQUFoQjs7QUFHQTtBQUNBLFFBQUtLLGNBQUwsR0FBc0IsS0FBSzlDLFFBQTNCOztBQUVBO0FBQ0EsUUFBS21CLE1BQUwsQ0FBWXFCLGFBQWFFLGtCQUF6QjtBQUNBOztBQUVEOzs7O3lCQUNPO0FBQ05GLGdCQUFhQyxtQkFBYixHQUFtQ0ksS0FBS0UsU0FBTCxDQUFlLEtBQUsvQyxRQUFwQixDQUFuQzs7QUFFQTtBQUNBLFFBQUs4QyxjQUFMLEdBQXNCLEtBQUs5QyxRQUEzQjtBQUNBOztBQUVEOzs7OzJCQUNnQztBQUFBLE9BQXpCZ0QsT0FBeUIsdUVBQWYsS0FBS3BDLFFBQVU7O0FBQy9CLFFBQUttQixNQUFMLENBQVlpQixPQUFaLEVBQXFCLEtBQUtGLGNBQUwsQ0FBb0JFLE9BQXBCLENBQXJCO0FBQ0E7O0FBRUQ7Ozs7eUJBQ09BLE8sRUFBUztBQUNmLE9BQUksQ0FBQ0EsT0FBRCxJQUFZLEtBQUtoRCxRQUFMLENBQWNnRCxPQUFkLEtBQTBCLElBQTFDLEVBQWdEQSxVQUFVdEgsT0FBTytDLElBQVAsQ0FBWSxLQUFLdUIsUUFBakIsRUFBMkIsQ0FBM0IsS0FBaUMsRUFBM0M7QUFDaEQsUUFBS1ksUUFBTCxHQUFnQjRCLGFBQWFFLGtCQUFiLEdBQWtDTSxPQUFsRDtBQUNBLFFBQUtoRSxNQUFMLEdBQWMsRUFBZDtBQUNBOztBQUVEO0FBQ0E7Ozs7eUJBQ09iLEksRUFBTTJDLEksRUFBTW1DLFEsRUFBVTtBQUM1QixRQUFLakQsUUFBTCxHQUFnQnRFLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEtBQUtxRSxRQUF2QixzQkFBcUM3QixJQUFyQyxFQUE2QzJDLElBQTdDLEVBQWhCO0FBQ0EsUUFBS0ssTUFBTCxDQUFZaEQsSUFBWjtBQUNBLFFBQUthLE1BQUwsR0FBYyxFQUFkO0FBQ0EsT0FBSSxDQUFDaUUsUUFBTCxFQUFlLEtBQUs5QyxJQUFMO0FBQ2Y7O0FBRUQ7QUFDQTs7Ozs0QkFDMEM7QUFBQSxPQUFuQ2hDLElBQW1DLHVFQUE1QixLQUFLeUMsUUFBdUI7QUFBQSxPQUFic0MsV0FBYTs7QUFDekMsT0FBSUEsZUFBZSxDQUFDQyxtQ0FBaUNoRixJQUFqQyxPQUFwQixFQUErRDtBQUMvRCxPQUFJNkIsV0FBV3RFLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEtBQUtxRSxRQUF2QixDQUFmO0FBQ0EsVUFBT0EsU0FBUzdCLElBQVQsQ0FBUDtBQUNBLFFBQUs2QixRQUFMLEdBQWdCQSxRQUFoQjtBQUNBLFFBQUtHLElBQUw7QUFDQSxRQUFLZ0IsTUFBTDtBQUNBOztBQUVEOzs7O3lCQUNPaEQsSSxFQUFpQjtBQUFBLE9BQVgyQyxJQUFXLHVFQUFKLEVBQUk7O0FBQ3ZCO0FBQ0EsT0FBSSxDQUFDM0MsSUFBTCxFQUFXQSxPQUFPaUYsT0FBTyx3QkFBUCxDQUFQO0FBQ1g7QUFDQSxPQUFJLENBQUNqRixJQUFMLEVBQVc7O0FBRVgsUUFBSzRELE1BQUwsQ0FBWTVELElBQVosRUFBa0IyQyxJQUFsQjtBQUNBOztBQUVEO0FBQ0E7Ozs7MkJBQ3lDO0FBQUEsT0FBbEN1QyxPQUFrQyx1RUFBeEIsS0FBS3pDLFFBQW1CO0FBQUEsT0FBVDBDLE9BQVM7O0FBQ3hDO0FBQ0EsT0FBSSxDQUFDQSxPQUFMLEVBQWNBLFVBQVVGLE9BQU8sNEJBQVAsRUFBcUNDLE9BQXJDLENBQVY7O0FBRWQ7QUFDQSxPQUFJLENBQUNDLE9BQUQsSUFBWUEsWUFBWUQsT0FBNUIsRUFBcUM7QUFDckMsT0FBSSxLQUFLckQsUUFBTCxDQUFjc0QsT0FBZCxDQUFKLEVBQTRCLE9BQU96SSxRQUFRMEksSUFBUix3QkFBaUNELE9BQWpDLDhCQUFQOztBQUU1QixPQUFJeEMsT0FBTyxLQUFLZCxRQUFMLENBQWNxRCxPQUFkLENBQVg7QUFDQSxRQUFLOUMsTUFBTCxDQUFZOEMsT0FBWjtBQUNBLFFBQUt0QixNQUFMLENBQVl1QixPQUFaLEVBQXFCeEMsSUFBckI7QUFDQTs7QUFFRDs7Ozs4QkFDNEM7QUFBQSxPQUFsQ3VDLE9BQWtDLHVFQUF4QixLQUFLekMsUUFBbUI7QUFBQSxPQUFUMEMsT0FBUzs7QUFDM0M7QUFDQSxPQUFJLENBQUNBLE9BQUwsRUFBY0EsVUFBVUYsT0FBTyxpQ0FBUCxFQUEwQ0MsT0FBMUMsQ0FBVjtBQUNkO0FBQ0EsT0FBSSxDQUFDQyxPQUFELElBQVlBLFlBQVlELE9BQTVCLEVBQXFDO0FBQ3JDLE9BQUksS0FBS3JELFFBQUwsQ0FBY3NELE9BQWQsQ0FBSixFQUE0QixPQUFPekksUUFBUTBJLElBQVIsd0JBQWlDRCxPQUFqQyw4QkFBUDs7QUFFNUIsUUFBS3ZCLE1BQUwsQ0FBWXVCLE9BQVosRUFBcUIsS0FBS3hDLElBQTFCO0FBQ0E7O0FBRUQ7QUFDRDs7Ozs0QkFDVztBQUFBOztBQUNULFFBQUs5QixNQUFMLEdBQWMsaUJBQWQ7QUFDQXdFLGNBQVcsWUFBTTtBQUNoQixRQUFJOUcsU0FBU3dDLE9BQU90QyxLQUFQLENBQWEsWUFBYixFQUEyQixNQUFLa0UsSUFBaEMsQ0FBYjtBQUNBLFFBQUksQ0FBQ3BFLE1BQUwsRUFBYTtBQUNaN0IsYUFBUTBJLElBQVIsQ0FBYSxjQUFiO0FBQ0EsV0FBS3ZFLE1BQUwsR0FBYyx3QkFBZDtBQUNBLEtBSEQsTUFJSztBQUNKbkUsYUFBUTRJLElBQVIsQ0FBYSxRQUFiLEVBQXVCL0csTUFBdkI7QUFDQSxXQUFLc0MsTUFBTCxHQUFjdEMsT0FBT0csUUFBUCxDQUFnQnFDLE1BQWhCLENBQWQ7QUFDQTtBQUNELElBVkQsRUFVRyxHQVZIO0FBV0E7Ozs7O0FBOUhEO3NCQUN1QjtBQUN0QixVQUFPeEQsT0FBTytDLElBQVAsQ0FBWSxLQUFLdUIsUUFBakIsQ0FBUDtBQUNBOztBQUVEOzs7O3NCQUNxQjtBQUNwQixVQUFPLEtBQUtBLFFBQUwsQ0FBYyxLQUFLWSxRQUFuQixDQUFQO0FBQ0E7O0FBRUQ7Ozs7c0JBQ3NCO0FBQ3JCLFVBQU9pQyxLQUFLRSxTQUFMLENBQWUsS0FBS0QsY0FBcEIsTUFBd0NELEtBQUtFLFNBQUwsQ0FBZSxLQUFLL0MsUUFBcEIsQ0FBL0M7QUFDQTs7Ozs2RUFyQkEwRCxnQjs7O1NBQXNCLEU7O2tGQUV0QkEsZ0I7OztTQUE0QixFOzs0RUFFNUJBLGdCOzs7U0FBc0IsRTs7MEVBRXRCQSxnQjs7O1NBQW9CLEU7OzJEQUdwQkMsYyx3SUFLQUEsYyx1SUFLQUEsYztrQkFyQm1CdkIsWTs7Ozs7OztBQ2JyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUNBQXlDOzs7Ozs7Ozs7Ozs7OztrQkNPakJ3QixNOztBQU54Qjs7OztBQUNBOzs7O0FBQ0E7O0FBRUE7Ozs7QUFWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQVFlLFNBQVNBLE1BQVQsQ0FBZ0IxRixLQUFoQixFQUF1QjtBQUFBLE1BRWxDMkYsU0FGa0MsR0FLaEMzRixLQUxnQyxDQUVsQzJGLFNBRmtDO0FBQUEsTUFHbENDLFVBSGtDLEdBS2hDNUYsS0FMZ0MsQ0FHbEM0RixVQUhrQztBQUFBLE1BR3RCQyxJQUhzQixHQUtoQzdGLEtBTGdDLENBR3RCNkYsSUFIc0I7QUFBQSxNQUdoQnJDLEtBSGdCLEdBS2hDeEQsS0FMZ0MsQ0FHaEJ3RCxLQUhnQjtBQUFBLE1BR1RFLE1BSFMsR0FLaEMxRCxLQUxnQyxDQUdUMEQsTUFIUztBQUFBLE1BSWxDb0MsTUFKa0MsR0FLaEM5RixLQUxnQyxDQUlsQzhGLE1BSmtDO0FBQUEsTUFJMUJDLEtBSjBCLEdBS2hDL0YsS0FMZ0MsQ0FJMUIrRixLQUowQjtBQUFBLE1BSW5CQyxJQUptQixHQUtoQ2hHLEtBTGdDLENBSW5CZ0csSUFKbUI7QUFBQSxNQUliQyxLQUphLEdBS2hDakcsS0FMZ0MsQ0FJYmlHLEtBSmE7QUFBQSxNQUlOQyxNQUpNLEdBS2hDbEcsS0FMZ0MsQ0FJTmtHLE1BSk07QUFBQSxNQUlFQyxLQUpGLEdBS2hDbkcsS0FMZ0MsQ0FJRW1HLEtBSkY7QUFBQSxNQUlTQyxJQUpULEdBS2hDcEcsS0FMZ0MsQ0FJU29HLElBSlQ7QUFBQSxNQUllQyxPQUpmLEdBS2hDckcsS0FMZ0MsQ0FJZXFHLE9BSmY7OztBQU9wQyxNQUFNQyxjQUFjO0FBQ2xCWCxlQUFXLHNCQUFXQSxTQUFYLEVBQXNCLEtBQXRCLEVBQTZCRSxJQUE3QixFQUFtQ0QsVUFBbkMsRUFDVyxFQUFFRSxjQUFGLEVBQVVDLFlBQVYsRUFEWCxFQUVXLFFBRlgsQ0FETztBQUlsQlEsV0FBTztBQUNML0Msa0JBREs7QUFFTEU7QUFGSztBQUpXLEdBQXBCOztBQVVBLFNBQU8scUNBQVM0QyxXQUFULENBQVA7QUFDRDs7QUFFRFosT0FBT2MsU0FBUCxHQUFtQjtBQUNqQmIsYUFBV2Msb0JBQVU1SyxNQURKO0FBRWpCK0osY0FBWWEsb0JBQVU1SyxNQUZMO0FBR2pCZ0ssUUFBTVksb0JBQVU1SyxNQUhDO0FBSWpCMkgsU0FBT2lELG9CQUFVeEssTUFKQTtBQUtqQnlILFVBQVErQyxvQkFBVXhLLE1BTEQ7O0FBT2pCNkosVUFBUVcsb0JBQVVDLElBUEQ7QUFRakJYLFNBQU9VLG9CQUFVQzs7QUFSQSxDQUFuQjs7QUFZQWhCLE9BQU96QixZQUFQLEdBQXNCO0FBQ3BCNEIsUUFBTTtBQURjLENBQXRCLEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1Q0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ3FCYyxnQjs7Ozs7Ozs7Ozs7Ozs7d01BTXBCQyxTLEdBQVksVUFBQ2hELEtBQUQsRUFBVzs7QUFFeEI7QUFDRTtBQUNBLE9BQUlBLE1BQU1pRCxPQUFOLEtBQWtCLENBQXRCLEVBQXlCOztBQUV6QjtBQUNBakQsU0FBTWtELGNBQU47O0FBRUE7QUFDQSxPQUFJQyxVQUFVbkQsTUFBTUUsTUFBcEI7QUFDQSxPQUFJbkksT0FBT29MLFFBQVF0RyxLQUFuQjtBQUNBLE9BQUk3QixRQUFRbUksUUFBUUMsY0FBcEI7QUFDQSxPQUFJbkksTUFBTWtJLFFBQVFFLFlBQWxCOztBQUVBO0FBQ0EsT0FBSUMsVUFBVSxFQUFkO0FBQUEsT0FBa0JGLGlCQUFpQnBJLEtBQW5DO0FBQUEsT0FBMENxSSxlQUFlcEksR0FBekQ7O0FBRUE7QUFDQSxPQUFJRCxVQUFVQyxHQUFWLElBQWlCLENBQUMrRSxNQUFNdUQsUUFBNUIsRUFBc0M7QUFDckNELGNBQVUsSUFBVjtBQUNBRixxQkFBaUJDLGVBQWVwSSxNQUFNLENBQXRDO0FBQ0E7QUFDRDtBQUpBLFFBS0s7QUFDTDtBQUNGO0FBQ0csU0FBSWxELEtBQUtpRCxLQUFMLE1BQWdCLElBQXBCLEVBQTBCQSxRQUFRakQsS0FBS3lMLFdBQUwsQ0FBaUIsSUFBakIsRUFBdUJ4SSxLQUF2QixJQUFnQyxDQUF4QztBQUMxQixTQUFJakQsS0FBS2tELE1BQUksQ0FBVCxNQUFnQixJQUFwQixFQUEwQkEsTUFBMUIsS0FDSyxJQUFJbEQsS0FBS2tELE1BQUksQ0FBVCxNQUFnQixJQUFwQixFQUEwQkEsTUFBTWxELEtBQUswTCxPQUFMLENBQWEsSUFBYixFQUFtQnhJLEdBQW5CLElBQTBCLENBQWhDO0FBQ2xDOztBQUVHLFNBQUl5SSxRQUFRM0wsS0FBSzhGLEtBQUwsQ0FBVzdDLEtBQVgsRUFBa0JDLEdBQWxCLEVBQXVCMEksS0FBdkIsQ0FBNkIsSUFBN0IsQ0FBWjtBQUNBO0FBQ0EsU0FBSTNELE1BQU11RCxRQUFWLEVBQW9CO0FBQ25CRyxjQUFRQSxNQUFNakgsR0FBTixDQUFVO0FBQUEsY0FBUW1ILEtBQUssQ0FBTCxNQUFZLElBQVosR0FBbUJBLEtBQUt0TCxNQUFMLENBQVksQ0FBWixDQUFuQixHQUFvQ3NMLElBQTVDO0FBQUEsT0FBVixDQUFSO0FBQ0E7QUFDRDtBQUhBLFVBSUs7QUFDSkYsZUFBUUEsTUFBTWpILEdBQU4sQ0FBVTtBQUFBLGVBQVEsT0FBT21ILElBQWY7QUFBQSxRQUFWLENBQVI7QUFDQTtBQUNEUixzQkFBaUJwSSxLQUFqQjtBQUNBc0ksZUFBVUksTUFBTUcsSUFBTixDQUFXLElBQVgsQ0FBVjtBQUNBUixvQkFBZUQsaUJBQWlCRSxRQUFRdEosTUFBekIsR0FBa0MsQ0FBakQ7QUFDQTs7QUFFRDtBQUNBbUosV0FBUXRHLEtBQVIsR0FBaUI5RSxLQUFLTyxNQUFMLENBQVksQ0FBWixFQUFlMEMsS0FBZixJQUNYc0ksT0FEVyxHQUVYdkwsS0FBS08sTUFBTCxDQUFZMkMsR0FBWixDQUZOOztBQUlBO0FBQ0FrSSxXQUFRQyxjQUFSLEdBQXlCQSxjQUF6QjtBQUNBRCxXQUFRRSxZQUFSLEdBQXVCQSxZQUF2Qjs7QUFFQTtBQUNBLE9BQUksTUFBS2pILEtBQUwsQ0FBVzBILFFBQWYsRUFBeUIsTUFBSzFILEtBQUwsQ0FBVzBILFFBQVgsQ0FBb0I5RCxLQUFwQjtBQUN6QixHOzs7OzsyQkE5RFE7QUFDUixVQUFPLDhCQUFDLHlCQUFELGVBQWMsS0FBSzVELEtBQW5CLElBQTBCLFdBQVcsS0FBSzRHLFNBQTFDLElBQVA7QUFDQTs7QUFFRDs7Ozs7RUFMNkNlLHlCOztrQkFBekJoQixnQjs7Ozs7Ozs7OztBQ1pyQjs7OztBQUNBOzs7O0FBR0E7Ozs7QUFHQTs7Ozs7O0FBRUE7OztBQU5BO0FBSkE7QUFXQWlCLG1CQUFTQyxNQUFULENBQ0UsOEJBQUMscUJBQUQsT0FERixFQUVFQyxTQUFTQyxjQUFULENBQXdCLFlBQXhCLENBRkY7O0FBSkEsdUI7Ozs7Ozs7Ozs7Ozs7Ozs7UUNGZ0JDLFUsR0FBQUEsVTs7OztBQUxoQjtBQUNBO0FBQ0E7O0FBRUE7QUFDTyxTQUFTQSxVQUFULEdBQThCO0FBQUEsb0NBQU5qTCxJQUFNO0FBQU5BLFFBQU07QUFBQTs7QUFDbkMsU0FBT0EsS0FBS3NELEdBQUwsQ0FBVSxlQUFPO0FBQ3RCLFFBQUksQ0FBQzRILEdBQUwsRUFBVSxPQUFPLEVBQVA7QUFDVixRQUFJNUksTUFBTUMsT0FBTixDQUFjMkksR0FBZCxDQUFKLEVBQXdCLE9BQU9ELCtDQUFjQyxHQUFkLEVBQVA7QUFDeEIsbUJBQWVBLEdBQWYseUNBQWVBLEdBQWY7QUFDRSxXQUFLLFFBQUw7QUFDQSxXQUFLLFFBQUw7QUFBZ0IsZUFBT0EsR0FBUDtBQUNoQjtBQUNFLGVBQU96SyxPQUFPK0MsSUFBUCxDQUFZMEgsR0FBWixFQUFpQjVILEdBQWpCLENBQXNCO0FBQUEsaUJBQU80SCxJQUFJM0gsR0FBSixJQUFXQSxHQUFYLEdBQWlCLEVBQXhCO0FBQUEsU0FBdEIsRUFDRXBDLE1BREYsQ0FDU2dLLE9BRFQsRUFFRVQsSUFGRixDQUVPLEdBRlAsQ0FBUDtBQUpKO0FBUUQsR0FYTSxFQVdKdkosTUFYSSxDQVdHZ0ssT0FYSCxFQVlKVCxJQVpJLENBWUMsR0FaRCxDQUFQO0FBYUQsQzs7Ozs7Ozs7Ozs7OztRQ2ZlVSxRLEdBQUFBLFE7UUFnQkFDLGMsR0FBQUEsYztBQXBCaEI7O0FBRUE7QUFDQTtBQUNPLFNBQVNELFFBQVQsQ0FBa0JFLFFBQWxCLEVBQTRCQyxNQUE1QixFQUFvQztBQUMxQyxRQUFPLFlBQVc7QUFDakIsTUFBSSxLQUFLRCxRQUFMLE1BQW1CL0osU0FBdkIsRUFBa0M7QUFDakMsT0FBSW1DLFFBQVE2SCxPQUFPckwsS0FBUCxDQUFhLElBQWIsQ0FBWjtBQUNBLE9BQUl3RCxVQUFVbkMsU0FBZCxFQUF5QjtBQUN4QjtBQUNBZCxXQUFPZ0QsY0FBUCxDQUFzQixJQUF0QixFQUE0QjZILFFBQTVCLEVBQXNDLEVBQUU1SCxZQUFGLEVBQVM4SCxjQUFjLElBQXZCLEVBQXRDO0FBQ0E7QUFDRDtBQUNELFNBQU8sS0FBS0YsUUFBTCxDQUFQO0FBQ0EsRUFURDtBQVVBOztBQUdEO0FBQ0E7QUFDTyxTQUFTRCxjQUFULENBQXdCQyxRQUF4QixFQUFrQ0MsTUFBbEMsRUFBMEM7QUFDaEQsUUFBTztBQUNORSxPQUFNTCxTQUFTRSxRQUFULEVBQW1CQyxNQUFuQjtBQURBLEVBQVA7QUFHQSxDOzs7Ozs7Ozs7Ozs7Ozs7O0FDckJEOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7OzsrZUFMQTtBQUNBO0FBQ0E7OztBQUtBO0FBQ0EsSUFBTXRILFNBQVM1RCxpQkFBTzJELFNBQVAsQ0FBaUIsS0FBakIsQ0FBZjtrQkFDZUMsTTs7O0FBRWZBLE9BQU95SCxXQUFQLENBQ0U7QUFDRXhJLFFBQU0sS0FEUjtBQUVFVSxTQUFPLENBQUUsWUFBRixFQUFnQixXQUFoQixDQUZUO0FBR0VaO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQ0U7QUFERiw0QkFFUWlCLE1BRlIsRUFFZ0JqRCxNQUZoQixFQUV3RDtBQUFBLFlBQWhDYSxLQUFnQyx1RUFBeEIsQ0FBd0I7QUFBQSxZQUFyQkMsR0FBcUIsdUVBQWZkLE9BQU9ILE1BQVE7O0FBQ3BELFlBQUlRLFFBQVFMLE9BQU9hLEtBQVAsQ0FBWjtBQUNBLFlBQUksRUFBRVIsaUJBQWlCSixvQkFBVTBLLFVBQTdCLENBQUosRUFBOEMsT0FBT3BLLFNBQVA7QUFDOUMsZUFBTyxLQUFLcUssS0FBTCxDQUFXO0FBQ2hCQyxtQkFBU3hLLEtBRE87QUFFaEJ5SyxxQkFBV2pLLFFBQVE7QUFGSCxTQUFYLENBQVA7QUFJRDs7QUFFRDtBQUNBOztBQVpGO0FBQUE7QUFBQSxzQ0FhMkM7QUFBQTs7QUFBQSxZQUEzQmtLLFVBQTJCLHVFQUFkLEtBQUtGLE9BQVM7O0FBQ3ZDLFlBQUlHLGFBQWFELFdBQVdDLFVBQTVCO0FBQ0EsWUFBSSxDQUFDQSxVQUFELElBQWUsQ0FBQ0EsV0FBV25MLE1BQS9CLEVBQXVDLE9BQU9VLFNBQVA7O0FBRXZDLFlBQUkwSyxRQUFRRCxXQUFXMUksR0FBWCxDQUFnQixnQkFBcUI7QUFBQSxjQUFsQkosSUFBa0IsUUFBbEJBLElBQWtCO0FBQUEsY0FBWlEsS0FBWSxRQUFaQSxLQUFZOztBQUMvQztBQUNBLGNBQUlBLFVBQVVuQyxTQUFkLEVBQXlCbUMsUUFBUVIsSUFBUjtBQUN6QjtBQURBLGVBRUssSUFBSVEsaUJBQWlCekMsb0JBQVVpTCxhQUEvQixFQUE4QztBQUNqRHhJLHNCQUFRLE9BQUt5SSxxQkFBTCxDQUEyQnpJLEtBQTNCLENBQVI7QUFDRDtBQUNEO0FBQ047QUFKVyxpQkFLQSxJQUFJQSxpQkFBaUJ6QyxvQkFBVTBLLFVBQS9CLEVBQTJDO0FBQzlDakksd0JBQVFBLE1BQU05QixRQUFOLEVBQVI7QUFDRDtBQUNEOztBQUVBO0FBQ0EsY0FBSXNCLFNBQVMsT0FBYixFQUFzQkEsT0FBTyxXQUFQO0FBQzVCO0FBQ00saUJBQVVBLElBQVYsVUFBbUJRLEtBQW5CO0FBQ0QsU0FsQlcsQ0FBWjs7QUFvQkEsc0JBQVl1SSxNQUFNdkIsSUFBTixDQUFXLElBQVgsQ0FBWjtBQUNEOztBQUVEO0FBQ0E7O0FBekNGO0FBQUE7QUFBQSx5Q0EwQzhDO0FBQUE7O0FBQUEsWUFBM0JxQixVQUEyQix1RUFBZCxLQUFLRixPQUFTOztBQUMxQyxZQUFJTyxXQUFXTCxXQUFXSyxRQUExQjtBQUNBLFlBQUksQ0FBQ0EsUUFBRCxJQUFhQSxTQUFTdkwsTUFBVCxLQUFvQixDQUFyQyxFQUF3QyxPQUFPVSxTQUFQO0FBQ3hDLGVBQU82SyxTQUFTOUksR0FBVCxDQUFhLGlCQUFTO0FBQ2pDO0FBQ00sY0FBSSxPQUFPK0ksS0FBUCxLQUFpQixRQUFyQixFQUErQjtBQUM3QjtBQUNBLGdCQUFJek4sT0FBT3lOLE1BQU1DLElBQU4sRUFBWDtBQUNBLGdCQUFJLENBQUMxTixJQUFMLEVBQVcsT0FBTzJDLFNBQVA7QUFDWCwwQkFBVzNDLElBQVg7QUFDRDtBQUNELGNBQUl5TixpQkFBaUJwTCxvQkFBVTBLLFVBQS9CLEVBQTJDO0FBQ3pDLGdCQUFJWSxjQUFjLE9BQUtDLGtCQUFMLENBQXdCSCxLQUF4QixDQUFsQjtBQUNBLG1CQUFPRSxZQUFZL0IsS0FBWixDQUFrQixJQUFsQixFQUF3QkUsSUFBeEIsQ0FBNkIsTUFBN0IsQ0FBUDtBQUNEO0FBQ0QsY0FBSTJCLGlCQUFpQnBMLG9CQUFVaUwsYUFBL0IsRUFBOEM7QUFDNUMsbUJBQU8sT0FBS0MscUJBQUwsQ0FBMkJFLEtBQTNCLENBQVA7QUFDRDtBQUNELGdCQUFNLElBQUlJLFdBQUosQ0FBZ0IsK0NBQWdESixLQUFoRSxDQUFOO0FBQ0QsU0FoQk07QUFpQlA7QUFqQk8sU0FrQk5sTCxNQWxCTSxDQWtCQ2dLLE9BbEJELENBQVA7QUFtQkQ7O0FBRUQ7O0FBbEVGO0FBQUE7QUFBQSw0Q0FtRXdCdUIsYUFuRXhCLEVBbUV1QztBQUNuQyxZQUFJMUwsU0FBUzBMLGNBQWMxTCxNQUEzQjtBQUNKcEIsZ0JBQVE0SSxJQUFSLENBQWFrRSxhQUFiLEVBQTRCMUwsTUFBNUI7QUFDSSxlQUFPLG1CQUFnQkEsT0FBTzBKLElBQVAsQ0FBWSxHQUFaLENBQWhCLFVBQXNDLEdBQTdDO0FBQ0Q7QUF2RUg7QUFBQTtBQUFBLDJDQXlFZ0Q7QUFBQSxZQUEzQnFCLFVBQTJCLHVFQUFkLEtBQUtGLE9BQVM7O0FBQzVDO0FBQ0EsWUFBSWMsaUJBQWNaLFdBQVdZLE9BQXpCLE9BQUo7QUFDQSxZQUFJVixRQUFRLEtBQUtXLGFBQUwsQ0FBbUJiLFVBQW5CLENBQVo7QUFDQSxZQUFJSyxXQUFXLEtBQUtTLGdCQUFMLENBQXNCZCxVQUF0QixDQUFmOztBQUVBLFlBQUloSSw0QkFBMEI0SSxPQUE5QjtBQUNBLFlBQUksQ0FBQ1YsS0FBRCxJQUFVRyxRQUFkLEVBQXdCSCxRQUFRLE1BQVI7O0FBRXhCLFlBQUlBLEtBQUosRUFBV2xJLGlCQUFla0ksS0FBZjtBQUNYLFlBQUlHLFFBQUosRUFBYztBQUNackksb0JBQVUsVUFBVXFJLFNBQVMxQixJQUFULENBQWMsT0FBZCxDQUFWLEdBQW1DLElBQTdDO0FBQ0Q7QUFDRDNHLGtCQUFVLEdBQVY7QUFDQSxlQUFPQSxNQUFQO0FBQ0Q7QUF4Rkg7QUFBQTtBQUFBLGlDQTBGYTtBQUNULGVBQU8sS0FBS3lJLGtCQUFMLENBQXdCLEtBQUtYLE9BQTdCLENBQVA7QUFDRDtBQTVGSDs7QUFBQTtBQUFBLElBQXNDbEosY0FBdEM7QUFIRixDQURGLEU7Ozs7Ozs7Ozs7Ozs7Ozs7QUNQQTs7OztBQUNBOzs7Ozs7Ozs7OytlQUxBO0FBQ0E7QUFDQTs7QUFLQTtBQUNBLElBQU1zQixTQUFTNUQsaUJBQU8yRCxTQUFQLENBQWlCLElBQWpCLENBQWY7a0JBQ2VDLE07OztBQUVmQSxPQUFPeUgsV0FBUCxDQUNFO0FBQ0V4SSxRQUFNLElBRFI7QUFFRVUsU0FBTyxXQUZUO0FBR0VDLFVBQVEsa0RBSFY7QUFJRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsdUJBQ3VCLEtBQUs4SixPQUQ1QjtBQUFBLFlBQ0hDLFNBREcsWUFDSEEsU0FERztBQUFBLFlBQ1FDLFVBRFIsWUFDUUEsVUFEUjs7QUFFVCx3QkFBY0QsU0FBZCxVQUE0QkMsVUFBNUI7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBK0JySyxlQUFLc0ssY0FBcEMsQ0FKRjtBQVVFbkosU0FBTyxDQUNMO0FBQ0VpQyxXQUFPLDZDQURUO0FBRUVtSCxlQUFXLFdBRmI7QUFHRXBKLFdBQU8sQ0FDTCxDQUFDLE1BQUQsRUFBUyxXQUFULENBREssRUFFTCxDQUFDLFdBQUQsRUFBYyxXQUFkLENBRkssRUFHTCxDQUFDLE9BQUQsRUFBVSxXQUFWLENBSEssRUFJTCxDQUFDLGlCQUFELEVBQW9CLGtCQUFwQixDQUpLLEVBS0wsQ0FBQyxhQUFELEVBQWdCLGtCQUFoQixDQUxLLEVBTUwsQ0FBQyxjQUFELEVBQWlCLGtCQUFqQixDQU5LO0FBSFQsR0FESyxFQWFMO0FBQ0VpQyxXQUFPLHdDQURUO0FBRUVtSCxlQUFXLFlBRmI7QUFHRXBKLFdBQU87QUFDTCwyREFDSSxDQUFDLGNBQUQsRUFBaUIsa0JBQWpCLENBRkM7QUFHTCx5QkFDSSxDQUFDLGdCQUFELEVBQW1CLHNCQUFuQixDQUpDO0FBS0wsMERBQ0ksQ0FBQyxlQUFELEVBQWtCLHNCQUFsQixDQU5DO0FBT0wsNENBQ0ksQ0FBQyx5QkFBRCxFQUE0QiwrQkFBNUIsQ0FSQztBQVNMLDhCQUNJLENBQUMsdUJBQUQsRUFBMEIseUNBQTFCLENBVkM7QUFXTCxrREFDSSxDQUFDLHFCQUFELEVBQXdCLHNCQUF4QjtBQVpDO0FBSFQsR0FiSztBQVZULENBREYsRUE4Q0U7QUFDRTtBQUNBWixRQUFNLFNBRlI7QUFHRVUsU0FBTyxXQUhUO0FBSUVDLFVBQVEsa0VBSlY7QUFLRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsd0JBQ3VCLEtBQUs4SixPQUQ1QjtBQUFBLFlBQ0hDLFNBREcsYUFDSEEsU0FERztBQUFBLFlBQ1FDLFVBRFIsYUFDUUEsVUFEUjs7QUFFVCw2QkFBbUJELFNBQW5CLFVBQWlDQyxVQUFqQztBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUFtQ3JLLGVBQUtzSyxjQUF4QyxDQUxGO0FBV0VuSixTQUFPLENBQ0w7QUFDRWlDLFdBQU8sa0RBRFQ7QUFFRW1ILGVBQVcsV0FGYjtBQUdFcEosV0FBTyxDQUNMLENBQUMsZ0JBQUQsRUFBbUIsZ0JBQW5CLENBREssRUFFTCxDQUFDLHNCQUFELEVBQXlCLHVCQUF6QixDQUZLLEVBR0wsQ0FBQyxrQkFBRCxFQUFxQix1QkFBckIsQ0FISztBQUhULEdBREssRUFVTDtBQUNFaUMsV0FBTyw2Q0FEVDtBQUVFbUgsZUFBVyxZQUZiO0FBR0VwSixXQUFPO0FBQ0wsMkRBQ0ksQ0FBQyxtQkFBRCxFQUFzQix1QkFBdEIsQ0FGQztBQUdMLHlCQUNJLENBQUMscUJBQUQsRUFBd0IsMkJBQXhCLENBSkM7QUFLTCwwREFDSSxDQUFDLG9CQUFELEVBQXVCLDJCQUF2QixDQU5DO0FBT0wsNENBQ0ksQ0FBQyw4QkFBRCxFQUFpQyxvQ0FBakM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQVplO0FBSFQsR0FWSztBQVhULENBOUNGLEVBd0ZFO0FBQ0VaLFFBQU0sTUFEUjtBQUVFVSxTQUFPLFdBRlQ7QUFHRUMsVUFBUSxvQ0FIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSxZQUNIZ0ssVUFERyxHQUNZLEtBQUtGLE9BRGpCLENBQ0hFLFVBREc7O0FBRVQseUJBQWVBLFVBQWY7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBaUNySyxlQUFLc0ssY0FBdEMsQ0FKRjtBQVVFbkosU0FBTyxDQUNMO0FBQ0VpQyxXQUFPLCtDQURUO0FBRUVtSCxlQUFXLFdBRmI7QUFHRXBKLFdBQU8sQ0FDTCxDQUFDLE1BQUQsRUFBUyxTQUFULENBREssRUFFTCxDQUFDLFdBQUQsRUFBYyxTQUFkLENBRkssRUFHTCxDQUFDLFlBQUQsRUFBZSxnQkFBZixDQUhLLEVBSUwsQ0FBQyxpQkFBRCxFQUFvQixnQkFBcEIsQ0FKSztBQUhULEdBREssRUFXTDtBQUNFaUMsV0FBTywwQ0FEVDtBQUVFbUgsZUFBVyxZQUZiO0FBR0VwSixXQUFPO0FBQ0wsMkRBQ0ksQ0FBQyxhQUFELEVBQWdCLGdCQUFoQixDQUZDO0FBR0wseUJBQ0ksQ0FBQyxlQUFELEVBQWtCLG9CQUFsQixDQUpDO0FBS0wsMERBQ0ksQ0FBQyxjQUFELEVBQWlCLG9CQUFqQixDQU5DO0FBT0wsNENBQ0ksQ0FBQyx3QkFBRCxFQUEyQiw2QkFBM0I7QUFSQztBQUhULEdBWEs7QUFWVCxDQXhGRjs7QUE4SEU7QUFDQTtBQUNFWixRQUFNLGNBRFI7QUFFRVUsU0FBTyxXQUZUO0FBR0VDLFVBQVEsdUZBSFY7QUFJRXNKLGlCQUFlLElBSmpCO0FBS0VDLFlBQVUsSUFBSXpLLGVBQUswSyxRQUFULENBQWtCLEVBQUVDLFVBQVUsQ0FBRSxJQUFGLENBQVosRUFBbEIsQ0FMWjtBQU1FdEs7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsd0JBQ3FDLEtBQUs4SixPQUQxQztBQUFBLFlBQ0hDLFNBREcsYUFDSEEsU0FERztBQUFBLFlBQ1FRLFNBRFIsYUFDUUEsU0FEUjtBQUFBLFlBQ21CQyxhQURuQixhQUNtQkEsYUFEbkI7QUFFakI7O0FBQ1EsWUFBSXpKLGtCQUFnQmdKLFNBQWhCLFlBQWdDUSxTQUFoQyxPQUFKO0FBQ0EsWUFBSUMsYUFBSixFQUFtQnpKLHdCQUFzQnlKLGFBQXRCO0FBQ25CLGVBQU96SixNQUFQO0FBQ0Q7QUFQSDs7QUFBQTtBQUFBLElBQXdDcEIsZUFBSzhLLFFBQTdDLENBTkY7QUFlRTNKLFNBQU8sQ0FDTDtBQUNFaUMsV0FBTyx1REFEVDtBQUVFbUgsZUFBVyxXQUZiO0FBR0VwSixXQUFPLENBQ0wsQ0FBQyxZQUFELEVBQWUsa0JBQWYsQ0FESyxFQUVMLENBQUMsdUJBQUQsRUFBMEIsa0NBQTFCLENBRkssRUFHTCxDQUFDLDRCQUFELEVBQStCLGtDQUEvQixDQUhLO0FBSFQsR0FESztBQWZULENBL0hGLEU7Ozs7Ozs7Ozs7Ozs7Ozs7QUNKQTs7OztBQUNBOzs7O0FBRUE7Ozs7Ozs7OytlQVZBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQU9BO0FBQ0EsSUFBTUcsU0FBUzVELGlCQUFPMkQsU0FBUCxDQUFpQixPQUFqQixDQUFmO2tCQUNlQyxNOztBQUdmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0FBLE9BQU95SCxXQUFQO0FBQ0U7QUFDQTtBQUNBO0FBQ0V4SSxRQUFNLGFBRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VDLFVBQVEsa0RBSFY7QUFJRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsdUJBQ2tCLEtBQUs4SixPQUR2QjtBQUFBLFlBQ0hZLElBREcsWUFDSEEsSUFERztBQUFBLFlBQ0dDLFVBREgsWUFDR0EsVUFESDtBQUVmOztBQUNNLGVBQVVELElBQVY7QUFDRDtBQUxIOztBQUFBO0FBQUEsSUFBdUMvSyxlQUFLOEssUUFBNUM7QUFKRixDQUhGOztBQWdCRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sZUFEUjtBQUVFVSxTQUFPLFlBRlQ7QUFHRUMsVUFBUSwwREFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx3QkFDYSxLQUFLOEosT0FEbEI7QUFBQSxZQUNIYyxLQURHLGFBQ0hBLEtBREc7QUFBQSxZQUNJRixJQURKLGFBQ0lBLElBREo7O0FBRVQscUNBQTJCRSxLQUEzQixVQUFxQ0YsSUFBckM7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBeUMvSyxlQUFLOEssUUFBOUM7QUFKRixDQXJCRjs7QUFpQ0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxTQURSO0FBRUVXLFVBQVEsT0FGVjtBQUdFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBRSxlQUFPLENBQVA7QUFBVTtBQUR6Qjs7QUFBQTtBQUFBLElBQW1DTCxlQUFLMEssUUFBeEM7QUFIRixDQXJDRixFQTZDRTtBQUNFbkssUUFBTSxTQURSO0FBRUVXLFVBQVEsUUFGVjtBQUdFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBRSxlQUFPLENBQVA7QUFBVTtBQUR6Qjs7QUFBQTtBQUFBLElBQW1DTCxlQUFLMEssUUFBeEM7QUFIRixDQTdDRixFQXFERTtBQUNFbkssUUFBTSxTQURSO0FBRUVXLFVBQVEsT0FGVjtBQUdFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBRSxlQUFPLENBQVA7QUFBVTtBQUR6Qjs7QUFBQTtBQUFBLElBQW1DTCxlQUFLMEssUUFBeEM7QUFIRixDQXJERixFQTZERTtBQUNFbkssUUFBTSxTQURSO0FBRUVXLFVBQVEsUUFGVjtBQUdFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBRSxlQUFPLENBQVA7QUFBVTtBQUR6Qjs7QUFBQTtBQUFBLElBQW1DTCxlQUFLMEssUUFBeEM7QUFIRixDQTdERixFQXFFRTtBQUNFbkssUUFBTSxTQURSO0FBRUVXLFVBQVEsT0FGVjtBQUdFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBRSxlQUFPLENBQVA7QUFBVTtBQUR6Qjs7QUFBQTtBQUFBLElBQW1DTCxlQUFLMEssUUFBeEM7QUFIRixDQXJFRixFQTZFRTtBQUNFbkssUUFBTSxTQURSO0FBRUVXLFVBQVEsT0FGVjtBQUdFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBRSxlQUFPLENBQVA7QUFBVTtBQUR6Qjs7QUFBQTtBQUFBLElBQW1DTCxlQUFLMEssUUFBeEM7QUFIRixDQTdFRixFQXFGRTtBQUNFbkssUUFBTSxTQURSO0FBRUVXLFVBQVEsU0FGVjtBQUdFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBRSxlQUFPLENBQVA7QUFBVTtBQUR6Qjs7QUFBQTtBQUFBLElBQW1DTCxlQUFLMEssUUFBeEM7QUFIRixDQXJGRixFQTZGRTtBQUNFbkssUUFBTSxTQURSO0FBRUVXLFVBQVEsUUFGVjtBQUdFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBRSxlQUFPLENBQVA7QUFBVTtBQUR6Qjs7QUFBQTtBQUFBLElBQW1DTCxlQUFLMEssUUFBeEM7QUFIRixDQTdGRixFQXFHRTtBQUNFbkssUUFBTSxTQURSO0FBRUVXLFVBQVEsT0FGVjtBQUdFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBRSxlQUFPLENBQVA7QUFBVTtBQUR6Qjs7QUFBQTtBQUFBLElBQW1DTCxlQUFLMEssUUFBeEM7QUFIRixDQXJHRixFQTZHRTtBQUNFbkssUUFBTSxTQURSO0FBRUVXLFVBQVEsT0FGVjtBQUdFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBRSxlQUFPLEVBQVA7QUFBVztBQUQxQjs7QUFBQTtBQUFBLElBQW1DTCxlQUFLMEssUUFBeEM7QUFIRixDQTdHRixFQXFIRTtBQUNFbkssUUFBTSxTQURSO0FBRUVXLFVBQVEsYUFGVjtBQUdFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBRSxlQUFPLENBQUMsQ0FBUjtBQUFXO0FBRDFCOztBQUFBO0FBQUEsSUFBbUNMLGVBQUswSyxRQUF4QztBQUhGLENBckhGLEVBNkhFO0FBQ0VuSyxRQUFNLFNBRFI7QUFFRVcsVUFBUSxPQUZWO0FBR0ViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBQyxDQUFSO0FBQVc7QUFEMUI7O0FBQUE7QUFBQSxJQUFtQ0wsZUFBSzBLLFFBQXhDO0FBSEYsQ0E3SEYsRUFxSUU7QUFDRW5LLFFBQU0sU0FEUjtBQUVFVyxVQUFRLE1BRlY7QUFHRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUUsZUFBTyxDQUFDLENBQVI7QUFBVztBQUQxQjs7QUFBQTtBQUFBLElBQW1DTCxlQUFLMEssUUFBeEM7QUFIRixDQXJJRjs7QUErSUU7QUFDQTtBQUNBO0FBQ0VuSyxRQUFNLFNBRFI7QUFFRVcsVUFBUSxLQUZWO0FBR0ViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBUDtBQUFVO0FBRHpCOztBQUFBO0FBQUEsSUFBbUNMLGVBQUswSyxRQUF4QztBQUhGLENBakpGLEVBeUpFO0FBQ0VuSyxRQUFNLFNBRFI7QUFFRVcsVUFBUSxRQUZWO0FBR0ViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFFLGVBQU8sQ0FBQyxDQUFSO0FBQVc7QUFEMUI7O0FBQUE7QUFBQSxJQUFtQ0wsZUFBSzBLLFFBQXhDO0FBSEYsQ0F6SkY7O0FBbUtFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRW5LLFFBQU0scUJBRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VDLFVBQVEsQ0FDTiwyREFETSxFQUVOLDREQUZNLENBSFY7QUFPRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsd0JBQ2tDLEtBQUs4SixPQUR2QztBQUFBLFlBQ0hhLFVBREcsYUFDSEEsVUFERztBQUFBLFlBQ1N2SCxRQURULGFBQ1NBLFFBRFQ7QUFBQSxZQUNtQnlILFVBRG5CLGFBQ21CQSxVQURuQjtBQUVUOztBQUNBLFlBQUksT0FBT3pILFFBQVAsS0FBb0IsUUFBcEIsSUFBZ0NBLFdBQVcsQ0FBL0MsRUFBa0Q7QUFDaEQsaUJBQVV5SCxVQUFWLFVBQXdCekgsV0FBVyxDQUFuQztBQUNEO0FBQ0Qsa0NBQXdCeUgsVUFBeEIsVUFBdUN6SCxRQUF2QztBQUNEO0FBUkg7O0FBQUE7QUFBQSxJQUErQ3pELGVBQUs4SyxRQUFwRDtBQVBGLENBaExGOztBQW9NRTtBQUNBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSw0QkFEUjtBQUVFVSxTQUFPLFlBRlQ7QUFHRUMsVUFBUSw2REFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSxZQUNIMEssSUFERyxHQUNNLEtBQUtaLE9BRFgsQ0FDSFksSUFERzs7QUFFVCwwQ0FBZ0NBLElBQWhDO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQXNEL0ssZUFBSzhLLFFBQTNEO0FBSkYsQ0F2TUY7O0FBbU5FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSw2QkFEUjtBQUVFVSxTQUFPLFlBRlQ7QUFHRUMsVUFBUSxvRUFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx3QkFDYyxLQUFLOEosT0FEbkI7QUFBQSxZQUNINU4sTUFERyxhQUNIQSxNQURHO0FBQUEsWUFDS3dPLElBREwsYUFDS0EsSUFETDs7QUFFVCwyQ0FBaUNBLElBQWpDLFVBQTBDeE8sTUFBMUM7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBdUR5RCxlQUFLOEssUUFBNUQ7QUFKRixDQXhORjs7QUFxT0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxrQkFEUjtBQUVFVSxTQUFPLFlBRlQ7QUFHRUMsVUFBUSwwRUFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx3QkFDa0IsS0FBSzhKLE9BRHZCO0FBQUEsWUFDSGpMLEtBREcsYUFDSEEsS0FERztBQUFBLFlBQ0lDLEdBREosYUFDSUEsR0FESjtBQUFBLFlBQ1M0TCxJQURULGFBQ1NBLElBRFQ7O0FBRVQsbUNBQXlCQSxJQUF6QixVQUFrQzdMLEtBQWxDLFVBQTRDQyxHQUE1QztBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUE0Q2EsZUFBSzhLLFFBQWpEO0FBSkYsQ0E1T0Y7O0FBd1BFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sZ0JBRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VDLFVBQVEsa0VBSFY7QUFJRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsd0JBQ2MsS0FBSzhKLE9BRG5CO0FBQUEsWUFDSDVOLE1BREcsYUFDSEEsTUFERztBQUFBLFlBQ0t3TyxJQURMLGFBQ0tBLElBREw7O0FBRVQsbUNBQXlCQSxJQUF6QixhQUFxQ3hPLE1BQXJDO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQTRDeUQsZUFBSzhLLFFBQWpEO0FBSkYsQ0E1UEY7O0FBd1FFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sZUFEUjtBQUVFVSxTQUFPLFlBRlQ7QUFHRUMsVUFBUSxpRUFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx3QkFDYyxLQUFLOEosT0FEbkI7QUFBQSxZQUNINU4sTUFERyxhQUNIQSxNQURHO0FBQUEsWUFDS3dPLElBREwsYUFDS0EsSUFETDs7QUFFVCxzQ0FBNEJBLElBQTVCLGFBQXdDeE8sTUFBeEM7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBNEN5RCxlQUFLOEssUUFBakQ7QUFKRixDQTVRRjs7QUF5UkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxrQkFEUjtBQUVFVSxTQUFPLFlBRlQ7QUFHRUMsVUFBUSx5RUFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx3QkFDYSxLQUFLOEosT0FEbEI7QUFBQSxZQUNIYyxLQURHLGFBQ0hBLEtBREc7QUFBQSxZQUNJRixJQURKLGFBQ0lBLElBREo7O0FBRVQsbUNBQXlCQSxJQUF6QiwyQkFBbURFLEtBQW5ELFVBQTZERixJQUE3RDtBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUE0Qy9LLGVBQUs4SyxRQUFqRDtBQUpGLENBN1JGOztBQTBTRTtBQUNBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxhQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFQyxVQUFRLHFFQUhWO0FBSUViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHdCQUM2QixLQUFLOEosT0FEbEM7QUFBQSxZQUNIYSxVQURHLGFBQ0hBLFVBREc7QUFBQSxZQUNTWixTQURULGFBQ1NBLFNBRFQ7QUFBQSxZQUNvQlcsSUFEcEIsYUFDb0JBLElBRHBCO0FBRVQ7O0FBQ0EsWUFBSUksV0FBVyx5QkFBWUgsV0FBVy9MLFFBQVgsRUFBWixDQUFmO0FBQ0EsaUNBQXVCOEwsSUFBdkIsVUFBZ0NJLFFBQWhDLFlBQStDZixTQUEvQztBQUNEO0FBTkg7O0FBQUE7QUFBQSxJQUF1Q3BLLGVBQUs4SyxRQUE1QztBQUpGLENBN1NGOztBQTRURTtBQUNBO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxzQkFEUjtBQUVFVSxTQUFPLFlBRlQ7QUFHRUMsVUFBUSwwR0FIVjtBQUlFc0osaUJBQWUsSUFKakI7QUFLRUMsWUFBVSxJQUFJekssZUFBSzBLLFFBQVQsQ0FBa0IsRUFBRVUsT0FBTyxPQUFULEVBQWxCLENBTFo7QUFNRS9LO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHlCQUNvQyxLQUFLOEosT0FEekM7QUFBQSxZQUNIYSxVQURHLGNBQ0hBLFVBREc7QUFBQSxZQUNTSyxRQURULGNBQ1NBLFFBRFQ7QUFBQSxZQUNtQjdNLE1BRG5CLGNBQ21CQSxNQURuQjtBQUFBLFlBQzJCdU0sSUFEM0IsY0FDMkJBLElBRDNCOztBQUVULFlBQUlPLE9BQU9ELGFBQWEsS0FBYixHQUFxQixFQUFyQixHQUEwQixHQUFyQztBQUNBO0FBQ0EsWUFBSUYsV0FBVyx5QkFBWUgsV0FBVy9MLFFBQVgsRUFBWixDQUFmO0FBQ0EsZUFBVXFNLElBQVYsa0JBQTJCUCxJQUEzQixVQUFvQ0ksUUFBcEMsWUFBbUQzTSxNQUFuRDtBQUNEO0FBUEg7O0FBQUE7QUFBQSxJQUFnRHdCLGVBQUs4SyxRQUFyRDtBQU5GLENBL1RGOztBQWdWRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0V2SyxRQUFNLGFBRFI7QUFFRVUsU0FBTyxXQUZUO0FBR0VDLFVBQVEsQ0FDTixnREFETSxFQUVOLDhEQUZNLENBSFY7QUFPRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEseUJBQ2EsS0FBSzhKLE9BRGxCO0FBQUEsWUFDSGMsS0FERyxjQUNIQSxLQURHO0FBQUEsWUFDSUYsSUFESixjQUNJQSxJQURKOztBQUVULGlDQUF1QkEsSUFBdkIsVUFBZ0NFLEtBQWhDO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQXVDakwsZUFBSzhLLFFBQTVDO0FBUEYsQ0F0VkY7O0FBcVdFO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxjQURSO0FBRUVVLFNBQU8sV0FGVDtBQUdFQyxVQUFRLENBQ04saURBRE0sRUFFTixzRUFGTSxDQUhWO0FBT0ViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHlCQUNhLEtBQUs4SixPQURsQjtBQUFBLFlBQ0hjLEtBREcsY0FDSEEsS0FERztBQUFBLFlBQ0lGLElBREosY0FDSUEsSUFESjs7QUFFVCxrQ0FBd0JBLElBQXhCLFVBQWlDRSxLQUFqQztBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUF3Q2pMLGVBQUs4SyxRQUE3QztBQVBGLENBdldGOztBQXNYRTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sYUFEUjtBQUVFVSxTQUFPLFdBRlQ7QUFHRUMsVUFBUSwrRUFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx5QkFDdUIsS0FBSzhKLE9BRDVCO0FBQUEsWUFDSGMsS0FERyxjQUNIQSxLQURHO0FBQUEsWUFDSXhILFFBREosY0FDSUEsUUFESjtBQUFBLFlBQ2NzSCxJQURkLGNBQ2NBLElBRGQ7O0FBRVQsaUNBQXVCQSxJQUF2QixVQUFnQ3RILFFBQWhDLFVBQTZDd0gsS0FBN0M7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBdUNqTCxlQUFLOEssUUFBNUM7QUFKRixDQXhYRjs7QUFxWUU7O0FBRUE7QUFDQTtBQUNBO0FBQ0V2SyxRQUFNLGdCQURSO0FBRUVVLFNBQU8sV0FGVDtBQUdFQyxVQUFRLHFFQUhWO0FBSUViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHlCQUNtQixLQUFLOEosT0FEeEI7QUFBQSxZQUNIYyxLQURHLGNBQ0hBLEtBREc7QUFBQSxZQUNJTSxJQURKLGNBQ0lBLElBREo7QUFBQSxZQUNVUixJQURWLGNBQ1VBLElBRFY7O0FBRVQsaUNBQXVCQSxJQUF2QiwyQkFBaURBLElBQWpELFVBQTBEUSxJQUExRCxXQUFvRU4sS0FBcEU7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBMENqTCxlQUFLOEssUUFBL0M7QUFKRixDQXpZRjs7QUFxWkU7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0V2SyxRQUFNLFlBRFI7QUFFRVUsU0FBTyxXQUZUO0FBR0VDLFVBQVEsaUNBSFY7QUFJRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsWUFDSDBLLElBREcsR0FDTSxLQUFLWixPQURYLENBQ0hZLElBREc7O0FBRVQsZ0NBQXNCQSxJQUF0QjtBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUFzQy9LLGVBQUs4SyxRQUEzQztBQUpGLENBNVpGOztBQXdhRTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sc0JBRFI7QUFFRVUsU0FBTyxXQUZUO0FBR0VDLFVBQVEsOERBSFY7QUFJRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEseUJBQ2MsS0FBSzhKLE9BRG5CO0FBQUEsWUFDSDVOLE1BREcsY0FDSEEsTUFERztBQUFBLFlBQ0t3TyxJQURMLGNBQ0tBLElBREw7O0FBRVQscUNBQTJCQSxJQUEzQixVQUFvQ3hPLE1BQXBDO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQWdEeUQsZUFBSzhLLFFBQXJEO0FBSkYsQ0ExYUY7O0FBc2JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sbUJBRFI7QUFFRVUsU0FBTyxXQUZUO0FBR0VDLFVBQVEsaUZBSFY7QUFJRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEseUJBQ2tCLEtBQUs4SixPQUR2QjtBQUFBLFlBQ0hqTCxLQURHLGNBQ0hBLEtBREc7QUFBQSxZQUNJQyxHQURKLGNBQ0lBLEdBREo7QUFBQSxZQUNTNEwsSUFEVCxjQUNTQSxJQURUOztBQUVULHNDQUE0QkEsSUFBNUIsVUFBcUM3TCxLQUFyQyxVQUErQ0MsR0FBL0M7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBZ0RhLGVBQUs4SyxRQUFyRDtBQUpGLENBMWJGOztBQXVjRTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sYUFEUjtBQUVFVSxTQUFPLFdBRlQ7QUFHRUMsVUFBUSxrREFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx5QkFDYSxLQUFLOEosT0FEbEI7QUFBQSxZQUNIYyxLQURHLGNBQ0hBLEtBREc7QUFBQSxZQUNJRixJQURKLGNBQ0lBLElBREo7O0FBRVQsaUNBQXVCQSxJQUF2QixVQUFnQ0UsS0FBaEM7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBdUNqTCxlQUFLOEssUUFBNUM7QUFKRixDQXpjRjs7QUFxZEU7QUFDQTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sbUJBRFI7QUFFRVUsU0FBTyxXQUZUO0FBR0VDLFVBQVEsaUZBSFY7QUFJRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEseUJBQzZCLEtBQUs4SixPQURsQztBQUFBLFlBQ0hhLFVBREcsY0FDSEEsVUFERztBQUFBLFlBQ1NaLFNBRFQsY0FDU0EsU0FEVDtBQUFBLFlBQ29CVyxJQURwQixjQUNvQkEsSUFEcEI7QUFFVDs7QUFDQSxZQUFJSSxXQUFXLHlCQUFZSCxXQUFXL0wsUUFBWCxFQUFaLENBQWY7QUFDQSxzQ0FBNEI4TCxJQUE1QixVQUFxQ0ksUUFBckMsWUFBb0RmLFNBQXBEO0FBQ0Q7QUFOSDs7QUFBQTtBQUFBLElBQTZDcEssZUFBSzhLLFFBQWxEO0FBSkYsQ0F4ZEY7O0FBdWVFO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sY0FEUjtBQUVFVSxTQUFPLFdBRlQ7QUFHRUMsVUFBUSwyQkFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSxZQUNIMEssSUFERyxHQUNNLEtBQUtaLE9BRFgsQ0FDSFksSUFERzs7QUFFVCxrQ0FBd0JBLElBQXhCO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQXdDL0ssZUFBSzhLLFFBQTdDO0FBSkYsQ0E3ZUY7O0FBeWZFO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxjQURSO0FBRUVVLFNBQU8sV0FGVDtBQUdFQyxVQUFRLHVDQUhWO0FBSUViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLFlBQ0gwSyxJQURHLEdBQ00sS0FBS1osT0FEWCxDQUNIWSxJQURHOztBQUVULGtDQUF3QkEsSUFBeEI7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBd0MvSyxlQUFLOEssUUFBN0M7QUFKRixDQTNmRjs7QUF3Z0JFO0FBQ0E7QUFDQTtBQUNFdkssUUFBTSxnQkFEUjtBQUVFVSxTQUFPLFdBRlQ7QUFHRUMsVUFBUSxDQUNOLHNFQURNLEVBRU4sdUdBRk0sQ0FIVjtBQU9FYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx5QkFDOEMsS0FBSzhKLE9BRG5EO0FBQUEsWUFDSHFCLE9BREcsY0FDSEEsT0FERztBQUFBLFlBQ01DLFdBRE4sY0FDTUEsV0FETjtBQUFBLFlBQ21CVixJQURuQixjQUNtQkEsSUFEbkI7QUFBQSxZQUN5QkgsU0FEekIsY0FDeUJBLFNBRHpCO0FBQUEsWUFDb0NjLEtBRHBDLGNBQ29DQSxLQURwQzs7QUFFVCxZQUFJdEssZUFBSjtBQUNBLFlBQUlxSyxXQUFKLEVBQWlCO0FBQ2ZySyxpQ0FBcUJxSyxXQUFyQixtQkFBOENELE9BQTlDLFdBQTJEVCxJQUEzRCxTQUFtRVUsV0FBbkUsYUFBc0ZBLFdBQXRGLFlBQXdHVixJQUF4RyxpQkFBd0hVLFdBQXhIO0FBQ0QsU0FGRCxNQUdLO0FBQ0g7QUFDQXJLLGlDQUFxQm9LLE9BQXJCLFlBQW1DVCxJQUFuQztBQUNEO0FBQ0QzSixrQkFBVXBCLGVBQUsyTCxLQUFMLENBQVdDLGlCQUFYLENBQTZCaEIsU0FBN0IsRUFBd0NjLEtBQXhDLENBQVY7QUFDQSxlQUFPdEssTUFBUDtBQUNEO0FBYkg7O0FBQUE7QUFBQSxJQUEwQ3BCLGVBQUtzSyxjQUEvQztBQVBGLENBMWdCRjs7QUFtaUJFO0FBQ0E7QUFDQTtBQUNFL0osUUFBTSxrQkFEUjtBQUVFVSxTQUFPLFlBRlQ7QUFHRUMsVUFBUSw4Q0FIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx5QkFDWSxLQUFLOEosT0FEakI7QUFBQSxZQUNIakwsS0FERyxjQUNIQSxLQURHO0FBQUEsWUFDSUMsR0FESixjQUNJQSxHQURKOztBQUVULG1DQUF5QkQsS0FBekIsVUFBbUNDLEdBQW5DO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQTRDYSxlQUFLOEssUUFBakQ7QUFKRixDQXJpQkYsRTs7Ozs7Ozs7Ozs7Ozs7OztBQy9CQTs7OztBQUNBOzs7Ozs7Ozs7OytlQUxBO0FBQ0E7QUFDQTs7QUFLQTtBQUNBLElBQU14SixTQUFTNUQsaUJBQU8yRCxTQUFQLENBQWlCLFdBQWpCLENBQWY7a0JBQ2VDLE07OztBQUVmQSxPQUFPeUgsV0FBUDtBQUNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0V4SSxRQUFNLDJCQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFQyxVQUFRLDZEQUhWO0FBSUVzSixpQkFBZSxJQUpqQjtBQUtFQyxZQUFVLGdCQUxaO0FBTUVwSztBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx1QkFDcUIsS0FBSzhKLE9BRDFCO0FBQUEsWUFDSDBCLEdBREcsWUFDSEEsR0FERztBQUFBLFlBQ0VDLEdBREYsWUFDRUEsR0FERjtBQUFBLFlBQ09DLFNBRFAsWUFDT0EsU0FEUDs7QUFFVCxlQUFPQSxVQUFVQyxhQUFWLENBQXdCSCxHQUF4QixFQUE2QkMsR0FBN0IsQ0FBUDtBQUNEO0FBSkg7QUFBQTtBQUFBLDBCQU1tQjtBQUNmLFlBQUksQ0FBQyxLQUFLNUMsT0FBVixFQUFtQixNQUFNLElBQUlZLFdBQUosQ0FBZ0IsMEVBQWhCLENBQU47QUFESixZQUVQaUMsU0FGTyxHQUVPLEtBQUs1QixPQUZaLENBRVA0QixTQUZPOztBQUdmLGVBQU9BLFVBQVVFLFVBQWpCO0FBQ0Q7QUFWSDs7QUFBQTtBQUFBLElBQXFEak0sZUFBSzhLLFFBQTFEO0FBTkYsQ0FqQkY7O0FBcUNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sS0FEUjtBQUVFVSxTQUFPLENBQUMsZ0JBQUQsQ0FGVDtBQUdFZ0wsY0FBWSxDQUhkO0FBSUUvSyxVQUFRLEtBSlY7QUFLRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLG9DQUNnQjZMLENBRGhCLEVBQ2tCQyxDQURsQixFQUNxQjtBQUFFLHFCQUFXRCxDQUFYLFlBQW1CQyxDQUFuQjtBQUF5QjtBQURoRDs7QUFBQTtBQUFBLElBQStCbk0sZUFBSzBLLFFBQXBDLENBTEY7QUFRRXZKLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxZQURiO0FBRUVwSixXQUFPLENBQ0wsQ0FBQyxTQUFELEVBQVksVUFBWixDQURLO0FBRlQsR0FESztBQVJULENBekNGLEVBMkRFO0FBQ0VaLFFBQU0sSUFEUjtBQUVFVSxTQUFPLENBQUMsZ0JBQUQsQ0FGVDtBQUdFZ0wsY0FBWSxDQUhkO0FBSUUvSyxVQUFRLElBSlY7QUFLRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLG9DQUNnQjZMLENBRGhCLEVBQ2tCQyxDQURsQixFQUNxQjtBQUFFLHFCQUFXRCxDQUFYLFlBQW1CQyxDQUFuQjtBQUF5QjtBQURoRDs7QUFBQTtBQUFBLElBQThCbk0sZUFBSzBLLFFBQW5DLENBTEY7QUFRRXZKLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxZQURiO0FBRUVwSixXQUFPLENBQ0wsQ0FBQyxRQUFELEVBQVcsVUFBWCxDQURLO0FBRlQsR0FESztBQVJULENBM0RGLEVBNkVFO0FBQ0VaLFFBQU0sSUFEUjtBQUVFVSxTQUFPLENBQUMsZ0JBQUQsQ0FGVDtBQUdFZ0wsY0FBWSxFQUhkO0FBSUUvSyxVQUFRLElBSlY7QUFLRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLG9DQUNnQjZMLENBRGhCLEVBQ2tCQyxDQURsQixFQUNxQjtBQUFFLHFCQUFXRCxDQUFYLFlBQW1CQyxDQUFuQjtBQUF5QjtBQURoRDs7QUFBQTtBQUFBLElBQThCbk0sZUFBSzBLLFFBQW5DLENBTEY7QUFRRXZKLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxZQURiO0FBRUVwSixXQUFPLENBQ0wsQ0FBQyxRQUFELEVBQVcsVUFBWCxDQURLO0FBRlQsR0FESztBQVJULENBN0VGLEVBK0ZFO0FBQ0VaLFFBQU0sUUFEUjtBQUVFVSxTQUFPLENBQUMsZ0JBQUQsQ0FGVDtBQUdFZ0wsY0FBWSxFQUhkO0FBSUUvSyxVQUFRLFFBSlY7QUFLRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLG9DQUNnQjZMLENBRGhCLEVBQ2tCQyxDQURsQixFQUNxQjtBQUFFLHFCQUFXRCxDQUFYLFlBQW1CQyxDQUFuQjtBQUF5QjtBQURoRDs7QUFBQTtBQUFBLElBQWtDbk0sZUFBSzBLLFFBQXZDLENBTEY7QUFRRXZKLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxZQURiO0FBRUVwSixXQUFPLENBQ0wsQ0FBQyxZQUFELEVBQWUsVUFBZixDQURLO0FBRlQsR0FESztBQVJULENBL0ZGLEVBaUhFO0FBQ0VaLFFBQU0sWUFEUjtBQUVFVSxTQUFPLENBQUMsZ0JBQUQsQ0FGVDtBQUdFZ0wsY0FBWSxFQUhkO0FBSUUvSyxVQUFRLFlBSlY7QUFLRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLG9DQUNnQjZMLENBRGhCLEVBQ2tCQyxDQURsQixFQUNxQjtBQUFFLHFCQUFXRCxDQUFYLGFBQW9CQyxDQUFwQjtBQUEwQjtBQURqRDs7QUFBQTtBQUFBLElBQXNDbk0sZUFBSzBLLFFBQTNDLENBTEY7QUFRRXZKLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxZQURiO0FBRUVwSixXQUFPLENBQ0wsQ0FBQyxnQkFBRCxFQUFtQixXQUFuQixDQURLO0FBRlQsR0FESztBQVJULENBakhGLEVBa0lFO0FBQ0VaLFFBQU0sZ0JBRFI7QUFFRVUsU0FBTyxDQUFDLGdCQUFELENBRlQ7QUFHRWdMLGNBQVksRUFIZDtBQUlFL0ssVUFBUSxnQkFKVjtBQUtFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsb0NBQ2dCNkwsQ0FEaEIsRUFDa0JDLENBRGxCLEVBQ3FCO0FBQUUscUJBQVdELENBQVgsYUFBb0JDLENBQXBCO0FBQTBCO0FBRGpEOztBQUFBO0FBQUEsSUFBMENuTSxlQUFLMEssUUFBL0MsQ0FMRjtBQVFFdkosU0FBTyxDQUNMO0FBQ0VvSixlQUFXLFlBRGI7QUFFRXBKLFdBQU8sQ0FDTCxDQUFDLG9CQUFELEVBQXVCLFdBQXZCLENBREs7QUFGVCxHQURLO0FBUlQsQ0FsSUY7O0FBb0pBO0FBQ0U7QUFDQTtBQUNFWixRQUFNLE1BRFI7QUFFRVUsU0FBTyxDQUFDLGdCQUFELENBRlQ7QUFHRWdMLGNBQVksRUFIZDtBQUlFL0ssVUFBUSxDQUNOLE1BRE0sRUFFTixPQUZNLENBSlY7QUFRRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLG9DQUNnQjRLLEtBRGhCLEVBQ3VCbUIsSUFEdkIsRUFDNkI7QUFBRSxtQ0FBeUJuQixLQUF6QixXQUFvQ21CLElBQXBDO0FBQThDO0FBRDdFOztBQUFBO0FBQUEsSUFBZ0NwTSxlQUFLMEssUUFBckMsQ0FSRjtBQVdFdkosU0FBTyxDQUNMO0FBQ0VvSixlQUFXLFlBRGI7QUFFRXBKLFdBQU8sQ0FDTCxDQUFDLFVBQUQsRUFBYSx3QkFBYixDQURLLEVBRUwsQ0FBQyxXQUFELEVBQWMsd0JBQWQsQ0FGSztBQUZULEdBREs7QUFYVCxDQXRKRixFQTRLRTtBQUNFWixRQUFNLFVBRFI7QUFFRVUsU0FBTyxDQUFDLGdCQUFELENBRlQ7QUFHRWdMLGNBQVksRUFIZDtBQUlFL0ssVUFBUSxDQUNOLFVBRE0sRUFFTixXQUZNLENBSlY7QUFRRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLG9DQUNnQjRLLEtBRGhCLEVBQ3VCbUIsSUFEdkIsRUFDNkI7QUFBRSxvQ0FBMEJuQixLQUExQixXQUFxQ21CLElBQXJDO0FBQStDO0FBRDlFOztBQUFBO0FBQUEsSUFBb0NwTSxlQUFLMEssUUFBekMsQ0FSRjtBQVdFdkosU0FBTyxDQUNMO0FBQ0VvSixlQUFXLFlBRGI7QUFFRXBKLFdBQU8sQ0FDTCxDQUFDLGNBQUQsRUFBaUIseUJBQWpCLENBREssRUFFTCxDQUFDLGVBQUQsRUFBa0IseUJBQWxCLENBRks7QUFGVCxHQURLO0FBWFQsQ0E1S0Y7O0FBa01FO0FBQ0E7QUFDRVosUUFBTSxPQURSO0FBRUVVLFNBQU8sQ0FBQyxnQkFBRCxDQUZUO0FBR0VnTCxjQUFZLEVBSGQ7QUFJRS9LLFVBQVEsQ0FDTixPQURNLEVBRU4sV0FGTSxDQUpWO0FBUUViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxvQ0FDZ0I0SyxLQURoQixFQUN1QkYsSUFEdkIsRUFDNkI7QUFBRSxtQ0FBeUJBLElBQXpCLFVBQWtDRSxLQUFsQztBQUE0QztBQUQzRTs7QUFBQTtBQUFBLElBQWlDakwsZUFBSzBLLFFBQXRDLENBUkY7QUFXRXZKLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxZQURiO0FBRUVwSixXQUFPLENBQ0wsQ0FBQyxpQkFBRCxFQUFvQiw0QkFBcEIsQ0FESyxFQUVMLENBQUMscUJBQUQsRUFBd0IsNEJBQXhCLENBRks7QUFGVCxHQURLO0FBWFQsQ0FuTUYsRUF5TkU7QUFDRVosUUFBTSxXQURSO0FBRUVVLFNBQU8sQ0FBQyxnQkFBRCxDQUZUO0FBR0VnTCxjQUFZLEVBSGQ7QUFJRS9LLFVBQVEsQ0FDTixXQURNLEVBRU4sZUFGTSxDQUpWO0FBUUViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxvQ0FDZ0I0SyxLQURoQixFQUN1QkYsSUFEdkIsRUFDNkI7QUFBRSxvQ0FBMEJBLElBQTFCLFVBQW1DRSxLQUFuQztBQUE2QztBQUQ1RTs7QUFBQTtBQUFBLElBQXFDakwsZUFBSzBLLFFBQTFDLENBUkY7QUFXRXZKLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxZQURiO0FBRUVwSixXQUFPLENBQ0wsQ0FBQyxxQkFBRCxFQUF3Qiw2QkFBeEIsQ0FESyxFQUVMLENBQUMseUJBQUQsRUFBNEIsNkJBQTVCLENBRks7QUFGVCxHQURLO0FBWFQsQ0F6TkYsRUFpUEU7QUFDRVosUUFBTSxVQURSO0FBRUVVLFNBQU8sQ0FBQyxnQkFBRCxDQUZUO0FBR0VnTCxjQUFZLEVBSGQ7QUFJRS9LLFVBQVEsQ0FDTixVQURNLEVBRU4sVUFGTSxDQUpWO0FBUUViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxvQ0FDZ0IwSyxJQURoQixFQUNzQkUsS0FEdEIsRUFDNkI7QUFBRSxtQ0FBeUJGLElBQXpCLFVBQWtDRSxLQUFsQztBQUE0QztBQUQzRTs7QUFBQTtBQUFBLElBQW9DakwsZUFBSzBLLFFBQXpDLENBUkY7QUFXRXZKLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxZQURiO0FBRUVwSixXQUFPLENBQ0wsQ0FBQyxvQkFBRCxFQUF1Qiw0QkFBdkIsQ0FESyxFQUVMLENBQUMsb0JBQUQsRUFBdUIsNEJBQXZCLENBRks7QUFGVCxHQURLO0FBWFQsQ0FqUEYsRUF1UUU7QUFDRVosUUFBTSxrQkFEUjtBQUVFVSxTQUFPLENBQUMsZ0JBQUQsQ0FGVDtBQUdFZ0wsY0FBWSxFQUhkO0FBSUUvSyxVQUFRLENBQ04sa0JBRE0sRUFFTixrQkFGTSxDQUpWO0FBUUViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxvQ0FDZ0IwSyxJQURoQixFQUNzQkUsS0FEdEIsRUFDNkI7QUFBRSxvQ0FBMEJGLElBQTFCLFVBQW1DRSxLQUFuQztBQUE2QztBQUQ1RTs7QUFBQTtBQUFBLElBQTRDakwsZUFBSzBLLFFBQWpELENBUkY7QUFXRXZKLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxZQURiO0FBRUVwSixXQUFPLENBQ0wsQ0FBQyw0QkFBRCxFQUErQiw2QkFBL0IsQ0FESyxFQUVMLENBQUMsNEJBQUQsRUFBK0IsNkJBQS9CLENBRks7QUFGVCxHQURLO0FBWFQsQ0F2UUYsRUE4UkU7QUFDRVosUUFBTSxJQURSO0FBRUVVLFNBQU8sQ0FBQyxnQkFBRCxDQUZUO0FBR0VnTCxjQUFZLEVBSGQ7QUFJRS9LLFVBQVEsR0FKVjtBQUtFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsb0NBQ2dCNkwsQ0FEaEIsRUFDa0JDLENBRGxCLEVBQ3FCO0FBQUUscUJBQVVELENBQVYsV0FBaUJDLENBQWpCO0FBQXVCO0FBRDlDOztBQUFBO0FBQUEsSUFBOEJuTSxlQUFLcU0sT0FBbkMsQ0FMRjtBQVFFbEwsU0FBTyxDQUNMO0FBQ0VvSixlQUFXLFlBRGI7QUFFRXBKLFdBQU87QUFDTCxxQkFBZSxDQUFDLE9BQUQsRUFBVSxTQUFWLENBRFY7QUFFTCx3QkFBa0IsQ0FBQyxLQUFELEVBQVEsU0FBUjtBQUZiO0FBRlQsR0FESztBQVJULENBOVJGLEVBZ1RFO0FBQ0VaLFFBQU0sT0FEUjtBQUVFVSxTQUFPLENBQUMsZ0JBQUQsQ0FGVDtBQUdFZ0wsY0FBWSxFQUhkO0FBSUUvSyxVQUFRLGlCQUpWO0FBS0ViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxvQ0FDZ0I2TCxDQURoQixFQUNrQkMsQ0FEbEIsRUFDcUI7QUFBRSxxQkFBVUQsQ0FBVixXQUFpQkMsQ0FBakI7QUFBdUI7QUFEOUM7O0FBQUE7QUFBQSxJQUFpQ25NLGVBQUswSyxRQUF0QyxDQUxGO0FBUUV2SixTQUFPLENBQ0w7QUFDRW9KLGVBQVcsWUFEYjtBQUVFcEosV0FBTyxDQUNMLENBQUMscUJBQUQsRUFBd0IsU0FBeEIsQ0FESztBQUZULEdBREs7QUFSVCxDQWhURixFQWtVRTtBQUNFWixRQUFNLEtBRFI7QUFFRVUsU0FBTyxDQUFDLGdCQUFELENBRlQ7QUFHRWdMLGNBQVksRUFIZDtBQUlFL0ssVUFBUSxJQUpWO0FBS0ViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxvQ0FDZ0I2TCxDQURoQixFQUNrQkMsQ0FEbEIsRUFDcUI7QUFBRSxxQkFBVUQsQ0FBVixZQUFrQkMsQ0FBbEI7QUFBd0I7QUFEL0M7O0FBQUE7QUFBQSxJQUErQm5NLGVBQUtxTSxPQUFwQyxDQUxGO0FBUUVsTCxTQUFPLENBQ0w7QUFDRW9KLGVBQVcsWUFEYjtBQUVFcEosV0FBTztBQUNMLHFCQUFlLENBQUMsUUFBRCxFQUFXLFVBQVgsQ0FEVjtBQUVMLHdCQUFrQixDQUFDLE1BQUQsRUFBUyxVQUFUO0FBRmI7QUFGVCxHQURLO0FBUlQsQ0FsVUYsRUFvVkU7QUFDRVosUUFBTSxRQURSO0FBRUVVLFNBQU8sQ0FBQyxnQkFBRCxDQUZUO0FBR0VnTCxjQUFZLEVBSGQ7QUFJRS9LLFVBQVEsNkJBSlY7QUFLRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLG9DQUNnQjZMLENBRGhCLEVBQ2tCQyxDQURsQixFQUNxQjtBQUFFLHFCQUFVRCxDQUFWLFlBQWtCQyxDQUFsQjtBQUF3QjtBQUQvQzs7QUFBQTtBQUFBLElBQWtDbk0sZUFBSzBLLFFBQXZDLENBTEY7QUFRRXZKLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxZQURiO0FBRUVwSixXQUFPLENBQ0wsQ0FBQyxpQ0FBRCxFQUFvQyxVQUFwQyxDQURLO0FBRlQsR0FESztBQVJULENBcFZGLEVBc1dFO0FBQ0VaLFFBQU0sSUFEUjtBQUVFVSxTQUFPLENBQUMsZ0JBQUQsQ0FGVDtBQUdFZ0wsY0FBWSxFQUhkO0FBSUUvSyxVQUFRLEdBSlY7QUFLRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLG9DQUNnQjZMLENBRGhCLEVBQ2tCQyxDQURsQixFQUNxQjtBQUFFLHFCQUFVRCxDQUFWLFdBQWlCQyxDQUFqQjtBQUF1QjtBQUQ5Qzs7QUFBQTtBQUFBLElBQThCbk0sZUFBS3FNLE9BQW5DLENBTEY7QUFRRWxMLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxZQURiO0FBRUVwSixXQUFPO0FBQ0wscUJBQWUsQ0FBQyxPQUFELEVBQVUsU0FBVixDQURWO0FBRUwsd0JBQWtCLENBQUMsS0FBRCxFQUFRLFNBQVI7QUFGYjtBQUZULEdBREs7QUFSVCxDQXRXRixFQXdYRTtBQUNFWixRQUFNLE9BRFI7QUFFRVUsU0FBTyxDQUFDLGdCQUFELENBRlQ7QUFHRWdMLGNBQVksRUFIZDtBQUlFL0ssVUFBUSxjQUpWO0FBS0ViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxvQ0FDZ0I2TCxDQURoQixFQUNrQkMsQ0FEbEIsRUFDcUI7QUFBRSxxQkFBVUQsQ0FBVixXQUFpQkMsQ0FBakI7QUFBdUI7QUFEOUM7O0FBQUE7QUFBQSxJQUFpQ25NLGVBQUswSyxRQUF0QyxDQUxGO0FBUUV2SixTQUFPLENBQ0w7QUFDRW9KLGVBQVcsWUFEYjtBQUVFcEosV0FBTyxDQUNMLENBQUMsa0JBQUQsRUFBcUIsU0FBckIsQ0FESztBQUZULEdBREs7QUFSVCxDQXhYRixFQTBZRTtBQUNFWixRQUFNLEtBRFI7QUFFRVUsU0FBTyxDQUFDLGdCQUFELENBRlQ7QUFHRWdMLGNBQVksRUFIZDtBQUlFL0ssVUFBUSxJQUpWO0FBS0ViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxvQ0FDZ0I2TCxDQURoQixFQUNrQkMsQ0FEbEIsRUFDcUI7QUFBRSxxQkFBVUQsQ0FBVixZQUFrQkMsQ0FBbEI7QUFBd0I7QUFEL0M7O0FBQUE7QUFBQSxJQUErQm5NLGVBQUtxTSxPQUFwQyxDQUxGO0FBUUVsTCxTQUFPLENBQ0w7QUFDRW9KLGVBQVcsWUFEYjtBQUVFcEosV0FBTztBQUNMLHFCQUFlLENBQUMsUUFBRCxFQUFXLFVBQVgsQ0FEVjtBQUVMLHdCQUFrQixDQUFDLE1BQUQsRUFBUyxVQUFUO0FBRmI7QUFGVCxHQURLO0FBUlQsQ0ExWUYsRUE2WkU7QUFDRVosUUFBTSxRQURSO0FBRUVVLFNBQU8sQ0FBQyxnQkFBRCxDQUZUO0FBR0VnTCxjQUFZLEVBSGQ7QUFJRS9LLFVBQVEsMEJBSlY7QUFLRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLG9DQUNnQjZMLENBRGhCLEVBQ2tCQyxDQURsQixFQUNxQjtBQUFFLHFCQUFVRCxDQUFWLFlBQWtCQyxDQUFsQjtBQUF3QjtBQUQvQzs7QUFBQTtBQUFBLElBQWtDbk0sZUFBSzBLLFFBQXZDLENBTEY7QUFRRXZKLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxZQURiO0FBRUVwSixXQUFPLENBQ0wsQ0FBQyw4QkFBRCxFQUFpQyxVQUFqQyxDQURLO0FBRlQsR0FESztBQVJULENBN1pGLEVBZ2JFO0FBQ0VaLFFBQU0sYUFEUjtBQUVFVSxTQUFPLENBQUMsZ0JBQUQsQ0FGVDtBQUdFZ0wsY0FBWSxFQUhkO0FBSUUvSyxVQUFRLEtBSlY7QUFLRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLG9DQUNnQjZMLENBRGhCLEVBQ2tCQyxDQURsQixFQUNxQjtBQUFFLHFCQUFVRCxDQUFWLFdBQWlCQyxDQUFqQjtBQUF1QjtBQUQ5Qzs7QUFBQTtBQUFBLElBQXVDbk0sZUFBS3FNLE9BQTVDLENBTEY7QUFRRWxMLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxZQURiO0FBRUVwSixXQUFPLENBQ0wsQ0FBQyxLQUFELEVBQVEsU0FBUixDQURLLEVBRUwsQ0FBQyxPQUFELEVBQVUsU0FBVixDQUZLO0FBRlQsR0FESztBQVJULENBaGJGLEVBa2NFO0FBQ0VaLFFBQU0sTUFEUjtBQUVFVSxTQUFPLENBQUMsZ0JBQUQsQ0FGVDtBQUdFZ0wsY0FBWSxFQUhkO0FBSUUvSyxVQUFRLE1BSlY7QUFLRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLG9DQUNnQjZMLENBRGhCLEVBQ2tCQyxDQURsQixFQUNxQjtBQUFFLHFCQUFVRCxDQUFWLFdBQWlCQyxDQUFqQjtBQUF1QjtBQUQ5Qzs7QUFBQTtBQUFBLElBQWdDbk0sZUFBSzBLLFFBQXJDLENBTEY7QUFRRXZKLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxZQURiO0FBRUVwSixXQUFPLENBQ0wsQ0FBQyxVQUFELEVBQWEsU0FBYixDQURLO0FBRlQsR0FESztBQVJULENBbGNGLEVBb2RFO0FBQ0VaLFFBQU0sY0FEUjtBQUVFVSxTQUFPLENBQUMsZ0JBQUQsQ0FGVDtBQUdFZ0wsY0FBWSxFQUhkO0FBSUUvSyxVQUFRLEdBSlY7QUFLRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLG9DQUNnQjZMLENBRGhCLEVBQ2tCQyxDQURsQixFQUNxQjtBQUFFLHFCQUFVRCxDQUFWLFdBQWlCQyxDQUFqQjtBQUF1QjtBQUQ5Qzs7QUFBQTtBQUFBLElBQXdDbk0sZUFBS3FNLE9BQTdDLENBTEY7QUFRRWxMLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxZQURiO0FBRUVwSixXQUFPO0FBQ2Y7QUFDVSxxQkFBZSxDQUFDLE9BQUQsRUFBVSxTQUFWO0FBRlY7QUFGVCxHQURLO0FBUlQsQ0FwZEYsRUFzZUU7QUFDRVosUUFBTSxPQURSO0FBRUVVLFNBQU8sQ0FBQyxnQkFBRCxDQUZUO0FBR0VnTCxjQUFZLEVBSGQ7QUFJRS9LLFVBQVEsT0FKVjtBQUtFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsb0NBQ2dCNkwsQ0FEaEIsRUFDa0JDLENBRGxCLEVBQ3FCO0FBQUUscUJBQVVELENBQVYsV0FBaUJDLENBQWpCO0FBQXVCO0FBRDlDOztBQUFBO0FBQUEsSUFBaUNuTSxlQUFLMEssUUFBdEMsQ0FMRjtBQVFFdkosU0FBTyxDQUNMO0FBQ0VvSixlQUFXLFlBRGI7QUFFRXBKLFdBQU8sQ0FDTCxDQUFDLFdBQUQsRUFBYyxTQUFkLENBREs7QUFGVCxHQURLO0FBUlQsQ0F0ZUYsRUF3ZkU7QUFDRVosUUFBTSxjQURSO0FBRUVVLFNBQU8sQ0FBQyxnQkFBRCxDQUZUO0FBR0VnTCxjQUFZLEVBSGQ7QUFJRS9LLFVBQVEsS0FKVjtBQUtFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsb0NBQ2dCNkwsQ0FEaEIsRUFDa0JDLENBRGxCLEVBQ3FCO0FBQUUscUJBQVVELENBQVYsV0FBaUJDLENBQWpCO0FBQXVCO0FBRDlDOztBQUFBO0FBQUEsSUFBaUNuTSxlQUFLcU0sT0FBdEMsQ0FMRjtBQVFFbEwsU0FBTyxDQUNMO0FBQ0VvSixlQUFXLFlBRGI7QUFFRXBKLFdBQU87QUFDTCx3QkFBa0IsQ0FBQyxLQUFELEVBQVEsU0FBUixDQURiO0FBRUwscUJBQWUsQ0FBQyxPQUFELEVBQVUsU0FBVjtBQUZWO0FBRlQsR0FESztBQVJULENBeGZGLEVBMGdCRTtBQUNFWixRQUFNLE9BRFI7QUFFRVUsU0FBTyxDQUFDLGdCQUFELENBRlQ7QUFHRWdMLGNBQVksRUFIZDtBQUlFL0ssVUFBUSxPQUpWO0FBS0ViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxvQ0FDZ0I2TCxDQURoQixFQUNrQkMsQ0FEbEIsRUFDcUI7QUFBRSxxQkFBVUQsQ0FBVixXQUFpQkMsQ0FBakI7QUFBdUI7QUFEOUM7O0FBQUE7QUFBQSxJQUFpQ25NLGVBQUswSyxRQUF0QyxDQUxGO0FBUUV2SixTQUFPLENBQ0w7QUFDRW9KLGVBQVcsWUFEYjtBQUVFcEosV0FBTyxDQUNMLENBQUMsV0FBRCxFQUFjLFNBQWQsQ0FESztBQUZULEdBREs7QUFSVCxDQTFnQkYsRUE0aEJFO0FBQ0VaLFFBQU0saUJBRFI7QUFFRVUsU0FBTyxDQUFDLGdCQUFELENBRlQ7QUFHRWdMLGNBQVksRUFIZDtBQUlFL0ssVUFBUSxHQUpWO0FBS0ViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxvQ0FDZ0I2TCxDQURoQixFQUNrQkMsQ0FEbEIsRUFDcUI7QUFBRSxxQkFBVUQsQ0FBVixXQUFpQkMsQ0FBakI7QUFBdUI7QUFEOUM7O0FBQUE7QUFBQSxJQUFzQ25NLGVBQUtxTSxPQUEzQyxDQUxGO0FBUUVsTCxTQUFPLENBQ0w7QUFDRW9KLGVBQVcsWUFEYjtBQUVFcEosV0FBTztBQUNMLHdCQUFrQixDQUFDLEtBQUQsRUFBUSxTQUFSLENBRGI7QUFFTCxxQkFBZSxDQUFDLE9BQUQsRUFBVSxTQUFWO0FBRlY7QUFGVCxHQURLO0FBUlQsQ0E1aEJGLEVBOGlCRTtBQUNFWixRQUFNLFlBRFI7QUFFRVUsU0FBTyxDQUFDLGdCQUFELENBRlQ7QUFHRWdMLGNBQVksRUFIZDtBQUlFL0ssVUFBUSxZQUpWO0FBS0ViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxvQ0FDZ0I2TCxDQURoQixFQUNrQkMsQ0FEbEIsRUFDcUI7QUFBRSxxQkFBVUQsQ0FBVixXQUFpQkMsQ0FBakI7QUFBdUI7QUFEOUM7O0FBQUE7QUFBQSxJQUFzQ25NLGVBQUswSyxRQUEzQyxDQUxGO0FBUUV2SixTQUFPLENBQ0w7QUFDRW9KLGVBQVcsWUFEYjtBQUVFcEosV0FBTyxDQUNMLENBQUMsZ0JBQUQsRUFBbUIsU0FBbkIsQ0FESztBQUZULEdBREs7QUFSVCxDQTlpQkY7O0FBZ2tCRTtBQUNBO0FBQ0E7O0FBRUE7QUFDRVosUUFBTSw2QkFEUjtBQUVFVSxTQUFPLFlBRlQ7QUFHRUMsVUFBUSwwQ0FIVjtBQUlFc0osaUJBQWUsSUFKakI7QUFLRUMsWUFBVSxrQkFMWjtBQU1FcEs7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsd0JBQ3VCLEtBQUs4SixPQUQ1QjtBQUFBLFlBQ0hlLFVBREcsYUFDSEEsVUFERztBQUFBLFlBQ1NhLFNBRFQsYUFDU0EsU0FEVDs7QUFFVCxlQUFPQSxVQUFVQyxhQUFWLENBQXdCZCxVQUF4QixDQUFQO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQXNEbEwsZUFBSzhLLFFBQTNEO0FBTkYsQ0Fwa0JGLEVBa2xCRTtBQUNFdkssUUFBTSxZQURSO0FBRUVVLFNBQU8sQ0FBQyxrQkFBRCxDQUZUO0FBR0VDLFVBQVEsWUFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsb0NBQ2dCNEssS0FEaEIsRUFDdUI7QUFBRSw0QkFBa0JBLEtBQWxCO0FBQTRDO0FBRHJFOztBQUFBO0FBQUEsSUFBc0NqTCxlQUFLMEssUUFBM0MsQ0FKRjtBQU9FdkosU0FBTyxDQUNMO0FBQ0VvSixlQUFXLFlBRGI7QUFFRXBKLFdBQU8sQ0FDTCxDQUFDLGNBQUQsRUFBaUIsNEJBQWpCLENBREs7QUFGVCxHQURLO0FBUFQsQ0FsbEJGLEVBa21CRTtBQUNFWixRQUFNLGNBRFI7QUFFRVUsU0FBTyxDQUFDLGtCQUFELENBRlQ7QUFHRUMsVUFBUSxDQUNOLGNBRE0sRUFFTixnQkFGTSxDQUhWO0FBT0ViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxvQ0FDZ0I0SyxLQURoQixFQUN1QjtBQUFFLDRCQUFrQkEsS0FBbEI7QUFBNEM7QUFEckU7O0FBQUE7QUFBQSxJQUF3Q2pMLGVBQUswSyxRQUE3QyxDQVBGO0FBVUV2SixTQUFPLENBQ0w7QUFDRW9KLGVBQVcsWUFEYjtBQUVFcEosV0FBTyxDQUNMLENBQUMsb0JBQUQsRUFBdUIsZ0NBQXZCLENBREssRUFFTCxDQUFDLHNCQUFELEVBQXlCLGdDQUF6QixDQUZLO0FBRlQsR0FESztBQVZULENBbG1CRixFQXVuQkU7QUFDRVosUUFBTSxVQURSO0FBRUVVLFNBQU8sQ0FBQyxrQkFBRCxDQUZUO0FBR0VDLFVBQVEsVUFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsb0NBQ2dCNEssS0FEaEIsRUFDdUI7QUFBRSxrQ0FBd0JBLEtBQXhCO0FBQWtDO0FBRDNEOztBQUFBO0FBQUEsSUFBb0NqTCxlQUFLMEssUUFBekMsQ0FKRjtBQU9FdkosU0FBTyxDQUNMO0FBQ0VvSixlQUFXLFlBRGI7QUFFRXBKLFdBQU8sQ0FDTCxDQUFDLGdCQUFELEVBQW1CLHNCQUFuQixDQURLO0FBRlQsR0FESztBQVBULENBdm5CRixFQXVvQkU7QUFDRVosUUFBTSxjQURSO0FBRUVVLFNBQU8sQ0FBQyxrQkFBRCxDQUZUO0FBR0VDLFVBQVEsY0FIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsb0NBQ2dCNEssS0FEaEIsRUFDdUI7QUFBRSxtQ0FBeUJBLEtBQXpCO0FBQW1DO0FBRDVEOztBQUFBO0FBQUEsSUFBd0NqTCxlQUFLMEssUUFBN0MsQ0FKRjtBQU9FdkosU0FBTyxDQUNMO0FBQ0VvSixlQUFXLFlBRGI7QUFFRXBKLFdBQU8sQ0FDTCxDQUFDLG9CQUFELEVBQXVCLHVCQUF2QixDQURLO0FBRlQsR0FESztBQVBULENBdm9CRjs7QUF5cEJFO0FBQ0E7QUFDQTs7QUFFQTtBQUNFWixRQUFNLGdCQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdGO0FBQ0lDLFVBQVEsb0NBSlY7QUFLRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsWUFDRDZLLFVBREMsR0FDYyxLQUFLZixPQURuQixDQUNEZSxVQURDOztBQUVULDZCQUFtQkEsVUFBbkI7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBMENsTCxlQUFLOEssUUFBL0MsQ0FMRjtBQVdFM0osU0FBTyxDQUNMO0FBQ0VvSixlQUFXLFlBRGI7QUFFRXBKLFdBQU8sQ0FDTCxDQUFDLDZCQUFELEVBQWdDLGlCQUFoQyxDQURLO0FBRlQsR0FESztBQVhULENBN3BCRixFQWtyQkU7QUFDRVosUUFBTSxLQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdGO0FBQ0lDLFVBQVEsa0VBSlY7QUFLRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsWUFDRDZLLFVBREMsR0FDYyxLQUFLZixPQURuQixDQUNEZSxVQURDO0FBRWpCOztBQUNRLDhCQUFvQkEsVUFBcEI7QUFDRDtBQUxIOztBQUFBO0FBQUEsSUFBK0JsTCxlQUFLOEssUUFBcEMsQ0FMRjtBQVlFM0osU0FBTyxDQUNMO0FBQ0VvSixlQUFXLFlBRGI7QUFFRXBKLFdBQU8sQ0FDTCxDQUFDLGNBQUQsRUFBaUIsa0JBQWpCLENBREssRUFFTCxDQUFDLGNBQUQsRUFBaUIsa0JBQWpCLENBRkssRUFHTCxDQUFDLGtCQUFELEVBQXFCLGtCQUFyQixDQUhLLEVBSUwsQ0FBQyxrQkFBRCxFQUFxQixrQkFBckIsQ0FKSyxFQUtMLENBQUMsa0JBQUQsRUFBcUIsa0JBQXJCLENBTEssRUFNTCxDQUFDLHVCQUFELEVBQTBCLGtCQUExQixDQU5LO0FBRlQsR0FESztBQVpULENBbHJCRixFQTZzQkU7QUFDRVosUUFBTSxLQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdGO0FBQ0lDLFVBQVEsaUVBSlY7QUFLRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsWUFDRDZLLFVBREMsR0FDYyxLQUFLZixPQURuQixDQUNEZSxVQURDO0FBRWpCOztBQUNRLDhCQUFvQkEsVUFBcEI7QUFDRDtBQUxIOztBQUFBO0FBQUEsSUFBK0JsTCxlQUFLOEssUUFBcEMsQ0FMRjtBQVlFM0osU0FBTyxDQUNMO0FBQ0VvSixlQUFXLFlBRGI7QUFFRXBKLFdBQU8sQ0FDTCxDQUFDLGNBQUQsRUFBaUIsa0JBQWpCLENBREssRUFFTCxDQUFDLGNBQUQsRUFBaUIsa0JBQWpCLENBRkssRUFHTCxDQUFDLGtCQUFELEVBQXFCLGtCQUFyQixDQUhLLEVBSUwsQ0FBQyxtQkFBRCxFQUFzQixrQkFBdEIsQ0FKSyxFQUtMLENBQUMsZ0JBQUQsRUFBbUIsa0JBQW5CLENBTEssRUFNTCxDQUFDLHdCQUFELEVBQTJCLGtCQUEzQixDQU5LO0FBRlQsR0FESztBQVpULENBN3NCRjs7QUF5dUJFO0FBQ0E7QUFDQTs7QUFFQTtBQUNFWixRQUFNLGtCQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFQyxVQUFRLG1EQUhWO0FBSUViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHdCQUNvQixLQUFLOEosT0FEekI7QUFBQSxZQUNEYyxLQURDLGFBQ0RBLEtBREM7QUFBQSxZQUNNcUIsU0FETixhQUNNQSxTQUROOztBQUVULFlBQUlBLGNBQWMsSUFBbEIsRUFDRSxzQkFBb0JyQixLQUFwQixPQURGLEtBRUssSUFBSXFCLGNBQWMsTUFBbEIsRUFDSCx1QkFBcUJyQixLQUFyQixPQURHLEtBR0gsdUJBQXFCQSxLQUFyQjtBQUNIO0FBVEg7O0FBQUE7QUFBQSxJQUE0Q2pMLGVBQUs4SyxRQUFqRCxDQUpGO0FBZUUzSixTQUFPLENBQ0w7QUFDRW9KLGVBQVcsWUFEYjtBQUVFcEosV0FBTyxDQUNMLENBQUMsYUFBRCxFQUFnQixtQkFBaEIsQ0FESyxFQUVMLENBQUMsaUJBQUQsRUFBb0IsbUJBQXBCLENBRkssRUFHTCxDQUFDLGdCQUFELEVBQW1CLGtCQUFuQixDQUhLLEVBSUwsQ0FBQyxrQkFBRCxFQUFxQixtQkFBckIsQ0FKSztBQUZULEdBREs7QUFmVCxDQTd1QkYsRTs7Ozs7Ozs7Ozs7Ozs7OztBQ1BBOzs7O0FBQ0E7Ozs7Ozs7Ozs7K2VBTEE7QUFDQTtBQUNBOztBQUtBO0FBQ0EsSUFBTUcsU0FBUzVELGlCQUFPMkQsU0FBUCxDQUFpQixZQUFqQixDQUFmO2tCQUNlQyxNOzs7QUFFZkEsT0FBT3lILFdBQVA7QUFDRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNFeEksUUFBTSxrQkFEUjtBQUVFVSxTQUFPLFdBRlQ7QUFHRUMsVUFBUSxxQkFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSxZQUNINkssVUFERyxHQUNZLEtBQUtmLE9BRGpCLENBQ0hlLFVBREc7O0FBRVQsMkJBQWlCQSxVQUFqQjtBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUE0Q2xMLGVBQUs4SyxRQUFqRCxDQUpGO0FBVUUzSixTQUFPLENBQ0w7QUFDRW9KLGVBQVcsV0FEYjtBQUVFcEosV0FBTyxDQUNMLENBQUMsY0FBRCxFQUFpQixjQUFqQixDQURLO0FBRlQsR0FESztBQVZULENBTkY7O0FBMEJFO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0VaLFFBQU0sWUFEUjtBQUVFVSxTQUFPLENBQUMsV0FBRCxFQUFjLGNBQWQsQ0FGVDtBQUdFQyxVQUFRLENBQ04seUNBRE0sRUFFTiw4Q0FGTSxFQUdOLGdEQUhNLENBSFY7QUFRRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsdUJBQ2MsS0FBSzhKLE9BRG5CO0FBQUEsWUFDSGMsS0FERyxZQUNIQSxLQURHO0FBQUEsWUFDSWxLLEtBREosWUFDSUEsS0FESjtBQUVUOztBQUNBLGVBQVVrSyxLQUFWLFdBQXFCbEssS0FBckI7QUFDRDtBQUxIOztBQUFBO0FBQUEsSUFBc0NmLGVBQUs4SyxRQUEzQyxDQVJGO0FBZUUzSixTQUFPLENBQ0w7QUFDRW9KLGVBQVcsV0FEYjtBQUVFcEosV0FBTyxDQUNMLENBQUMsYUFBRCxFQUFnQixjQUFoQixDQURLLEVBRUwsQ0FBQyxrQkFBRCxFQUFxQixjQUFyQixDQUZLLEVBR0wsQ0FBQyxvQkFBRCxFQUF1QixjQUF2QixDQUhLO0FBRlQsR0FESztBQWZULENBL0JGLEVBMERFO0FBQ0VaLFFBQU0sV0FEUjtBQUVFVSxTQUFPLENBQUMsV0FBRCxFQUFjLGNBQWQsQ0FGVDtBQUdFQyxVQUFRLHdCQUhWO0FBSUViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLFlBQ0hVLEtBREcsR0FDTyxLQUFLb0osT0FEWixDQUNIcEosS0FERztBQUNvQjtBQUM3Qiw2QkFBbUJBLEtBQW5CO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQXFDZixlQUFLOEssUUFBMUMsQ0FKRjtBQVVFM0osU0FBTyxDQUNMO0FBQ0VpQyxXQUFPLG9CQURUO0FBRUVtSCxlQUFXLFdBRmI7QUFHRXBKLFdBQU8sQ0FDTCxDQUFDLFdBQUQsRUFBYyxnQkFBZCxDQURLO0FBSFQsR0FESztBQVZULENBMURGLEU7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0pBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7OzsrZUFYQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFRQSxJQUFNRyxTQUFTNUQsaUJBQU8yRCxTQUFQLENBQWlCLE9BQWpCLENBQWY7a0JBQ2VDLE07OztBQUVmQSxPQUFPeUgsV0FBUDs7QUFFRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFeEksUUFBTSxNQURSO0FBRUVXLFVBQVEsMkJBRlY7QUFHRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFDRTtBQURGLGlDQUVhO0FBQUEsWUFDRGhELElBREMsR0FDUSxLQUFLOE0sT0FEYixDQUNEOU0sSUFEQzs7QUFFVCxlQUFPQSxLQUFLMEssSUFBTCxDQUFVLElBQVYsQ0FBUDtBQUNEO0FBTEg7O0FBQUE7QUFBQSxJQUFnQy9ILGVBQUs4SyxRQUFyQyxDQUhGO0FBVUUzSixTQUFPLENBQ0w7QUFDRTtBQUNBQSxXQUFPLENBQ0wsQ0FBQyxRQUFELEVBQVcsR0FBWCxDQURLLEVBRUwsQ0FBQyxjQUFELEVBQWlCLFNBQWpCLENBRkssRUFHTCxDQUFDLGVBQUQsRUFBa0IsU0FBbEIsQ0FISztBQUZULEdBREs7QUFWVCxDQVJGOztBQStCRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0VaLFFBQU0sMkJBRFI7QUFFRVcsVUFBUSxpREFGVjtBQUdFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFDVCxZQUFJQyxRQUFRLEtBQUs0SSxPQUFMLENBQWF2SSxHQUFiLENBQWlCLFVBQVU0TCxJQUFWLEVBQWdCO0FBQUEsOEJBQ3BCQSxLQUFLcEMsT0FEZTtBQUFBLGNBQ25DdkosR0FEbUMsaUJBQ25DQSxHQURtQztBQUFBLGNBQzlCRyxLQUQ4QixpQkFDOUJBLEtBRDhCO0FBRXJEO0FBQ0E7O0FBQ1ksY0FBSUEsS0FBSixFQUFXLGNBQVdILEdBQVgsWUFBb0JHLEtBQXBCO0FBQ1gsaUJBQU9ILEdBQVA7QUFDRCxTQU5TLENBQVo7QUFPQSxzQkFBWU4sTUFBTXlILElBQU4sQ0FBVyxJQUFYLENBQVo7QUFDRDtBQVZIOztBQUFBO0FBQUEsSUFBcUQvSCxlQUFLd00sSUFBMUQsQ0FIRjtBQWVFckwsU0FBTyxDQUNMO0FBQ0VpQyxXQUFPLEVBRFQ7QUFFRTtBQUNBakMsV0FBTyxDQUNMLHlCQURLLEVBRUwsMEJBRkssRUFHTCxrRkFISztBQUhULEdBREs7QUFmVCxDQW5DRixFQStERTtBQUNFWixRQUFNLGFBRFI7QUFFRVUsU0FBTyxDQUFDLFdBQUQsRUFBYyxjQUFkLENBRlQ7QUFHRUMsVUFBUSx5REFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUNFO0FBREYsb0NBRWdCO0FBQ1osWUFBSW9NLGlJQUFKO0FBQ0FBLGtCQUFVTCxJQUFWLEdBQWlCLE9BQWpCO0FBQ0EsZUFBT0ssU0FBUDtBQUNEO0FBTkg7QUFBQTtBQUFBLGlDQVFhO0FBQUEsdUJBQzZCLEtBQUt0QyxPQURsQztBQUFBLFlBQ0g1SixJQURHLFlBQ0hBLElBREc7QUFBQSxZQUNHbU0sU0FESCxZQUNHQSxTQURIO0FBQUEsWUFDY3JDLFVBRGQsWUFDY0EsVUFEZDs7QUFFVCxZQUFJakosb0JBQWtCYixJQUF0QjtBQUNBLFlBQUltTSxTQUFKLEVBQWV0TCx3QkFBc0JzTCxTQUF0QjtBQUNmdEwsa0JBQVUsTUFBTWlKLFVBQWhCO0FBQ0EsZUFBT2pKLE1BQVA7QUFDRDtBQWRIOztBQUFBO0FBQUEsSUFBdUNwQixlQUFLc0ssY0FBNUMsQ0FKRjtBQW9CRW5KLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxZQURiO0FBRUVwSixXQUFPLENBQ0wsQ0FBQyxpQkFBRCxFQUFvQixjQUFwQixDQURLLEVBRUwsQ0FBQywwQkFBRCxFQUE2QiwwQkFBN0IsQ0FGSyxFQUdMLENBQUMsNkJBQUQsRUFBZ0MsNEJBQWhDLENBSEs7QUFGVCxHQURLOztBQXBCVCxDQS9ERjs7QUFpR0U7QUFDQTtBQUNBO0FBQ0Y7QUFDRTtBQUNFWixRQUFNLFdBRFI7QUFFRVUsU0FBTyxDQUFDLFlBQUQsRUFBZSxXQUFmLENBRlQ7QUFHRUMsVUFBUSxpRUFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx3QkFDa0IsS0FBSzhKLE9BRHZCO0FBQUEsWUFDSGlDLElBREcsYUFDSEEsSUFERztBQUFBLHdDQUNHOUwsS0FESDtBQUFBLFlBQ0dBLEtBREgsbUNBQ1csRUFEWDtBQUVUOztBQUNBLFlBQUk4TCxTQUFTLFFBQWIsRUFBdUI7QUFDckIsY0FBSSxDQUFDOUwsS0FBTCxFQUFZLE9BQU8sSUFBUDtBQUNaLGlCQUFPQSxLQUFQO0FBQ0Q7O0FBRUQsd0JBQWM4TCxJQUFkLFNBQXNCOUwsS0FBdEI7QUFDRDtBQVZIOztBQUFBO0FBQUEsSUFBcUNOLGVBQUs4SyxRQUExQyxDQUpGO0FBZ0JFM0osU0FBTyxDQUNMO0FBQ0VpQyxXQUFPLGlDQURUO0FBRUVtSCxlQUFXLFdBRmI7QUFHRTtBQUNBcEosV0FBTyxDQUNOLHVCQURNLEVBRU4sb0JBRk0sRUFHTiwrREFITSxFQUlOLHdCQUpNLEVBS04scUVBTE07QUFKVCxHQURLLEVBYUw7QUFDRWlDLFdBQU8sdUJBRFQ7QUFFRW1ILGVBQVcsWUFGYjtBQUdFO0FBQ0FwSixXQUFPLENBQ0wsQ0FBQyxlQUFELEVBQWtCLElBQWxCLENBREs7QUFFZjtBQUNVLEtBQUMsYUFBRCxFQUFnQixhQUFoQixDQUhLLEVBSUwsQ0FBQyxhQUFELEVBQWdCLGFBQWhCLENBSks7QUFKVCxHQWJLOztBQWhCVCxDQXJHRjs7QUEwSkU7QUFDQTtBQUNBO0FBQ0VaLFFBQU0sZ0JBRFI7QUFFRVUsU0FBTyxDQUFDLFdBQUQsRUFBYyxjQUFkLENBRlQ7QUFHRUMsVUFBUSxnRUFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUNFO0FBREYsb0NBRWdCO0FBQUEsd0JBQ3VCLEtBQUs4SixPQUQ1QjtBQUFBLFlBQ05rQixRQURNLGFBQ05BLFFBRE07QUFBQSxZQUNJOUssSUFESixhQUNJQSxJQURKO0FBQUEsdUNBQ1VsRCxJQURWO0FBQUEsWUFDVUEsSUFEVixrQ0FDaUIsRUFEakI7O0FBRVosWUFBSXNQLFVBQVd0QixhQUFhLElBQWIsR0FBb0IsUUFBcEIsR0FBK0IsT0FBOUM7QUFDQSxlQUFPLEVBQUVlLE1BQU0sVUFBUixFQUFvQk8sZ0JBQXBCLEVBQTZCcE0sVUFBN0IsRUFBbUNsRCxVQUFuQyxFQUFQO0FBQ0Q7QUFOSDtBQUFBO0FBQUEsaUNBUWE7QUFBQSx3QkFDNkIsS0FBSzhNLE9BRGxDO0FBQUEsWUFDSDVKLElBREcsYUFDSEEsSUFERztBQUFBLHVDQUNHbEQsSUFESDtBQUFBLFlBQ0dBLElBREgsa0NBQ1UsRUFEVjtBQUFBLFlBQ2NnTixVQURkLGFBQ2NBLFVBRGQ7O0FBRVQsZUFBVTlKLElBQVYsU0FBa0JsRCxJQUFsQixVQUEyQmdOLFVBQTNCO0FBQ0Q7QUFYSDs7QUFBQTtBQUFBLElBQTBDckssZUFBS3NLLGNBQS9DLENBSkY7QUFpQkVuSixTQUFPLENBQ0w7QUFDRW9KLGVBQVcsWUFEYjtBQUVFcUMsYUFBUyxJQUZYO0FBR0V6TCxXQUFPLENBQ0wsQ0FBQyxRQUFELEVBQVcsVUFBWCxDQURLLEVBRUwsQ0FBQyxRQUFELEVBQVcsVUFBWCxDQUZLLEVBR0wsQ0FBQyxTQUFELEVBQVksVUFBWixDQUhLLEVBSUwsQ0FBQyxlQUFELEVBQWtCLFdBQWxCLENBSkssRUFLTCxDQUFDLGtCQUFELEVBQXFCLGNBQXJCLENBTEssRUFNTCxDQUFDLG1CQUFELEVBQXNCLGlCQUF0QixDQU5LLEVBT0wsQ0FBQyxnQkFBRCxFQUFtQixvQkFBbkIsQ0FQSyxFQVFMLENBQUMsaUJBQUQsRUFBb0Isb0JBQXBCLENBUkssRUFTTCxDQUFDLHdCQUFELEVBQTJCLHFCQUEzQixDQVRLLEVBVUwsQ0FBQyxtQkFBRCxFQUFzQix3QkFBdEIsQ0FWSyxFQVdMLENBQUMsdUNBQUQsRUFBMEMseUNBQTFDLENBWEssRUFZTCxDQUFDLEVBQUQsRUFBSyxFQUFMLENBWks7QUFIVCxHQURLOztBQWpCVCxDQTVKRjs7QUFvTUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFWixRQUFNLGdCQURSO0FBRUVVLFNBQU8sQ0FBQyxXQUFELEVBQWMsY0FBZCxDQUZUO0FBR0VDLFVBQVEsc0RBSFY7QUFJRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQTRDYTtBQUFBLHdCQUMwQyxLQUFLOEosT0FEL0M7QUFBQSxZQUNINUosSUFERyxhQUNIQSxJQURHO0FBQUEsdUNBQ0dsRCxJQURIO0FBQUEsWUFDR0EsSUFESCxrQ0FDVSxFQURWO0FBQUEsWUFDY3dQLEtBRGQsYUFDY0EsS0FEZDtBQUFBLFlBQ3FCakMsU0FEckIsYUFDcUJBLFNBRHJCO0FBQUEsWUFDZ0NjLEtBRGhDLGFBQ2dDQSxLQURoQzs7QUFHVDs7QUFDQSxZQUFJb0IsYUFBYSxFQUFqQjtBQUNBLGFBQUssSUFBSXZFLEdBQVQsSUFBZ0JzRSxLQUFoQixFQUF1QjtBQUNyQkMscUJBQVdDLElBQVgsdUJBQW9DeEUsR0FBcEMsVUFBNENzRSxNQUFNdEUsR0FBTixDQUE1QztBQUNEOztBQUVELFlBQUk4QixhQUFhckssZUFBSzJMLEtBQUwsQ0FBV0MsaUJBQVgsQ0FBNkJrQixVQUE3QixFQUF5Q2xDLFNBQXpDLEVBQW9EYyxLQUFwRCxDQUFqQjs7QUFFQTtBQUNKO0FBQ0ksMkJBQWlCbkwsSUFBakIsU0FBeUJsRCxLQUFLMEssSUFBTCxDQUFVLElBQVYsQ0FBekIsVUFBNkNzQyxVQUE3QztBQUNEO0FBMURIO0FBQUE7QUFBQSxvQ0E0RGdCO0FBQUEsd0JBQ2dCLEtBQUtGLE9BRHJCO0FBQUEsWUFDTjVKLElBRE0sYUFDTkEsSUFETTtBQUFBLFlBQ0FsRCxJQURBLGFBQ0FBLElBREE7QUFBQSxZQUNNd1AsS0FETixhQUNNQSxLQUROOztBQUVaLGVBQU8sRUFBRVQsTUFBTSxVQUFSLEVBQW9CTyxTQUFTLFFBQTdCLEVBQXVDcE0sVUFBdkMsRUFBNkNsRCxVQUE3QyxFQUFtRHdQLFlBQW5ELEVBQVA7QUFDRDtBQS9ESDtBQUFBOztBQUNFO0FBREYsMEJBRWdCO0FBQ1osWUFBSXpMLHFIQUFKOztBQUVBO0FBSFksWUFJTjRMLFFBSk0sR0FJTzVMLE1BSlAsQ0FJTjRMLFFBSk07O0FBS1osWUFBSUMsaUJBQWlCLEtBQUs5QyxPQUFMLENBQWE2QyxRQUFiLENBQXNCOUQsT0FBM0M7QUFDQSxZQUFJOEQsU0FBUzlPLE1BQVQsS0FBb0IsQ0FBeEIsRUFBMkI7QUFDekIsY0FBSWdQLFVBQVVGLFNBQVMsQ0FBVCxDQUFkO0FBQ0EsY0FBSUMsZUFBZSxDQUFmLGFBQTZCak4sZUFBS21OLElBQXRDLEVBQTRDO0FBQzFDbFEsb0JBQVFtUSxLQUFSLGtFQUE2RUYsT0FBN0U7QUFDRDs7QUFFVDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDUzs7QUFFRDtBQUNBOUwsZUFBTy9ELElBQVAsR0FBYyxFQUFkO0FBQ0ErRCxlQUFPeUwsS0FBUCxHQUFlLEVBQWY7O0FBRUE7QUFDQUksdUJBQWV0TSxHQUFmLENBQW9CLFVBQUM0SyxJQUFELEVBQU84QixLQUFQLEVBQWlCO0FBQ25DLGNBQUk5QixnQkFBZ0J2TCxlQUFLbU4sSUFBekIsRUFBK0I7QUFDN0IsZ0JBQUlBLE9BQU9ILFNBQVNLLEtBQVQsQ0FBWDtBQUNBLGdCQUFJakIsT0FBT2UsS0FBS0csV0FBTCxFQUFYOztBQUVBbE0sbUJBQU95TCxLQUFQLENBQWFULElBQWIsSUFBcUJlLElBQXJCO0FBQ0EvTCxtQkFBTy9ELElBQVAsQ0FBWTBQLElBQVosQ0FBaUJYLElBQWpCOztBQUVBO0FBQ0FZLHFCQUFTSyxLQUFULElBQWtCakIsSUFBbEI7QUFDRDtBQUNGLFNBWEQ7QUFZQTtBQUNBaEwsZUFBT2IsSUFBUCxHQUFjeU0sU0FBU2pGLElBQVQsQ0FBYyxHQUFkLENBQWQ7QUFDQSxlQUFPM0csTUFBUDtBQUNEO0FBMUNIOztBQUFBO0FBQUEsSUFBMENwQixlQUFLc0ssY0FBL0M7QUFKRixDQTNNRjs7QUFtUkU7QUFDQTtBQUNBO0FBQ0E7QUFDRS9KLFFBQU0sUUFEUjtBQUVFVSxTQUFPLENBQUMsV0FBRCxFQUFjLGNBQWQsQ0FGVDtBQUdFQyxVQUFRLHdDQUhWO0FBSUViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHdCQUN5QixLQUFLOEosT0FEOUI7QUFBQSxZQUNINUosSUFERyxhQUNIQSxJQURHO0FBQUEsWUFDRzJLLFVBREgsYUFDR0EsVUFESDtBQUFBLFlBQ2VRLEtBRGYsYUFDZUEsS0FEZjtBQUVUOztBQUNBLFlBQUlSLGNBQWMsQ0FBQ0EsV0FBV3FDLFVBQVgsQ0FBc0IsU0FBdEIsQ0FBbkIsRUFBcURyQywwQkFBd0JBLFVBQXhCO0FBQ3JELFlBQUk5SixrQkFBZ0JiLElBQWhCLFFBQUo7QUFDQWEsa0JBQVVwQixlQUFLMkwsS0FBTCxDQUFXQyxpQkFBWCxDQUE2QlYsVUFBN0IsRUFBeUNRLEtBQXpDLENBQVY7QUFDQSxlQUFPdEssTUFBUDtBQUNEOztBQUVEOztBQVZGO0FBQUE7QUFBQSxvQ0FXZ0I7QUFBQSxZQUNOYixJQURNLEdBQ0csS0FBSzRKLE9BRFIsQ0FDTjVKLElBRE07O0FBRVosZUFBTyxFQUFFNkwsTUFBTSxVQUFSLEVBQW9CTyxTQUFTLFFBQTdCLEVBQXVDcE0sVUFBdkMsRUFBUDtBQUNEO0FBZEg7O0FBQUE7QUFBQSxJQUFrQ1AsZUFBS3NLLGNBQXZDO0FBSkYsQ0F0UkY7O0FBNFNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0UvSixRQUFNLFFBRFI7QUFFRVUsU0FBTyxDQUFDLFdBQUQsRUFBYyxjQUFkLENBRlQ7QUFHRUMsVUFBUSxtREFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFDVDtBQURTLHdCQUV1QyxLQUFLOEosT0FGNUM7QUFBQSxZQUVINUosSUFGRyxhQUVIQSxJQUZHO0FBQUEsdUNBRUdsRCxJQUZIO0FBQUEsWUFFR0EsSUFGSCxrQ0FFVSxDQUFDa0QsSUFBRCxDQUZWO0FBQUEsWUFFa0JxSyxTQUZsQixhQUVrQkEsU0FGbEI7QUFBQSxZQUU2QmMsS0FGN0IsYUFFNkJBLEtBRjdCO0FBR1Q7O0FBQ0EsWUFBSXJPLFFBQVFBLEtBQUthLE1BQUwsR0FBYyxDQUExQixFQUE2QjtBQUMzQmpCLGtCQUFRMEksSUFBUixDQUFhLHlEQUFiLEVBQXdFLEtBQUs2SCxXQUE3RTtBQUNBblEsaUJBQU8sQ0FBRUEsS0FBSyxDQUFMLENBQUYsQ0FBUDtBQUNEO0FBQ0QsWUFBSStELGtCQUFnQmIsSUFBaEIsU0FBd0JsRCxJQUF4QixPQUFKO0FBQ0ErRCxrQkFBVXBCLGVBQUsyTCxLQUFMLENBQVdDLGlCQUFYLENBQTZCaEIsU0FBN0IsRUFBd0NjLEtBQXhDLENBQVY7QUFDQSxlQUFPdEssTUFBUDtBQUNEOztBQUVEOztBQWRGO0FBQUE7QUFBQSxvQ0FlZ0I7QUFBQSxZQUNOYixJQURNLEdBQ0csS0FBSzRKLE9BRFIsQ0FDTjVKLElBRE07O0FBRVosZUFBTyxFQUFFNkwsTUFBTSxVQUFSLEVBQW9CTyxTQUFTLFFBQTdCLEVBQXVDcE0sVUFBdkMsRUFBUDtBQUNEO0FBbEJIOztBQUFBO0FBQUEsSUFBa0NQLGVBQUtzSyxjQUF2QztBQUpGLENBclRGOztBQWdWRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNFL0osUUFBTSxrQkFEUjtBQUVFVSxTQUFPLENBQUMsV0FBRCxFQUFjLGNBQWQsQ0FGVDtBQUdFQyxVQUFRLHVGQUhWO0FBSUViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHdCQUN5QixLQUFLOEosT0FEOUI7QUFBQSxZQUNIc0QsS0FERyxhQUNIQSxLQURHO0FBQUEsWUFDSWxOLElBREosYUFDSUEsSUFESjtBQUFBLHdDQUNVUSxLQURWO0FBQUEsWUFDVUEsS0FEVixtQ0FDa0IsRUFEbEI7O0FBRVQsWUFBSUEsS0FBSixFQUFXQSxnQkFBY0EsS0FBZDs7QUFFWCxZQUFJMk0sbUJBQWlCbk4sSUFBakIsR0FBd0JRLEtBQTVCO0FBQ0EsZ0JBQVEwTSxLQUFSO0FBQ0UsZUFBSyxVQUFMO0FBQ1Y7QUFDWSw4QkFBZ0JDLFdBQWhCOztBQUVGLGVBQUssaUJBQUw7QUFDRSwrQkFBaUJBLFdBQWpCOztBQUVGLGVBQUssVUFBTDtBQUNBO0FBQ0UsbUJBQU9BLFdBQVA7QUFWSjtBQVlEOztBQUVEOztBQXBCRjtBQUFBO0FBQUEsb0NBcUJnQjtBQUFBLHlCQUNVLEtBQUt2RCxPQURmO0FBQUEsWUFDTnNELEtBRE0sY0FDTkEsS0FETTtBQUFBLFlBQ0NsTixJQURELGNBQ0NBLElBREQ7O0FBRVosZUFBTyxFQUFFNkwsTUFBTSxVQUFSLEVBQW9CN0wsVUFBcEIsRUFBMEJrTixZQUExQixFQUFQO0FBQ0Q7QUF4Qkg7O0FBQUE7QUFBQSxJQUE0Q3pOLGVBQUs4SyxRQUFqRDtBQUpGLENBclZGOztBQXFYRTtBQUNBO0FBQ0E7QUFDRXZLLFFBQU0sMEJBRFI7QUFFRVUsU0FBTyxDQUFDLFdBQUQsRUFBYyxjQUFkLENBRlQ7QUFHRUMsVUFBUSw4Q0FIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx5QkFDWSxLQUFLOEosT0FEakI7QUFBQSxZQUNINUosSUFERyxjQUNIQSxJQURHO0FBQUEsWUFDRzZMLElBREgsY0FDR0EsSUFESDs7QUFFVCxlQUFPLFNBQU83TCxJQUFQLDJCQUFpQ0EsSUFBakMsc0JBQ0tBLElBREwsdUNBQzJDNkwsSUFEM0MsaUJBQzJEN0wsSUFEM0QsZ0JBQVA7QUFFRDs7QUFFRDs7QUFQRjtBQUFBO0FBQUEsb0NBUWdCO0FBQUEseUJBQ1MsS0FBSzRKLE9BRGQ7QUFBQSxZQUNONUosSUFETSxjQUNOQSxJQURNO0FBQUEsWUFDQTZMLElBREEsY0FDQUEsSUFEQTs7QUFFWixlQUFPLEVBQUVBLE1BQU0sVUFBUixFQUFvQk8sU0FBUyxRQUE3QixFQUF1Q3BNLFVBQXZDLEVBQTZDb04sVUFBVXZCLElBQXZELEVBQVA7QUFDRDtBQVhIOztBQUFBO0FBQUEsSUFBb0RwTSxlQUFLOEssUUFBekQ7QUFKRixDQXZYRjs7QUEyWUU7QUFDQTtBQUNFdkssUUFBTSw0QkFEUjtBQUVFVSxTQUFPLENBQUMsV0FBRCxFQUFjLGNBQWQsQ0FGVDtBQUdFQyxVQUFRLDBEQUhWO0FBSUViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FPYTtBQUFBLHlCQUNvQixLQUFLOEosT0FEekI7QUFBQSxZQUNINUosSUFERyxjQUNIQSxJQURHO0FBQUEsWUFDR3FOLE1BREgsY0FDR0EsTUFESDtBQUFBLFlBQ1c3QyxJQURYLGNBQ1dBLElBRFg7O0FBRVQsZUFBTyxZQUFVNkMsTUFBVixXQUFzQjdDLElBQXRCLG9CQUNLeEssSUFETCwyQkFDK0JBLElBRC9CLDhCQUM0RHFOLE1BRDVELHFCQUNrRnJOLElBRGxGLHVCQUVLQSxJQUZMLDJCQUUrQnFOLE1BRi9CLGlDQUVpRXJOLElBRmpFLGdCQUFQOztBQUlOO0FBQ0E7QUFDQTtBQUNBO0FBQ0s7O0FBRUQ7O0FBbkJGO0FBQUE7QUFBQSxvQ0FvQmdCO0FBQUEseUJBQ1csS0FBSzRKLE9BRGhCO0FBQUEsWUFDTjVKLElBRE0sY0FDTkEsSUFETTtBQUFBLFlBQ0FxTixNQURBLGNBQ0FBLE1BREE7O0FBRVosZUFBTyxDQUNMLEVBQUV4QixNQUFNLFVBQVIsRUFBb0I3TCxVQUFwQixFQURLLEVBRUwsRUFBRTZMLE1BQU0sVUFBUixFQUFvQk8sU0FBUyxRQUE3QixFQUF1Q3BNLE1BQU1xTixNQUE3QyxFQUZLLENBQVA7QUFJRDtBQTFCSDtBQUFBO0FBQUEsMEJBQ2dCO0FBQ1osWUFBSXpELDhJQUFKO0FBQ0FBLGdCQUFReUQsTUFBUixHQUFpQix1QkFBVXpELFFBQVE1SixJQUFsQixDQUFqQjtBQUNBLGVBQU80SixPQUFQO0FBQ0Q7QUFMSDs7QUFBQTtBQUFBLElBQXNEbkssZUFBSzhLLFFBQTNEO0FBSkYsQ0E1WUY7O0FBK2FFO0FBQ0E7QUFDQTtBQUNBO0FBQ0V2SyxRQUFNLElBRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VDLFVBQVEsSUFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFDVCxlQUFPLE1BQVA7QUFDRDtBQUhIOztBQUFBO0FBQUEsSUFBOEJMLGVBQUswSyxRQUFuQztBQUpGLENBbGJGOztBQTZiRTtBQUNBO0FBQ0VuSyxRQUFNLEdBRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VDLFVBQVEsR0FIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFDVCxlQUFPLE1BQVA7QUFDRDtBQUhIOztBQUFBO0FBQUEsSUFBNkJMLGVBQUswSyxRQUFsQztBQUpGLENBOWJGOztBQTBjRTtBQUNBO0FBQ0E7O0FBRUE7QUFDRW5LLFFBQU0scUJBRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VDLFVBQVEscURBSFY7QUFJRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQVFhO0FBQUEseUJBQ3dCLEtBQUs4SixPQUQ3QjtBQUFBLFlBQ0hlLFVBREcsY0FDSEEsVUFERztBQUFBLFlBQ1N2TixVQURULGNBQ1NBLFVBRFQ7O0FBRVRBLHFCQUFhQSxXQUFXNkIsT0FBWCxHQUFxQnVJLElBQXJCLENBQTBCLEdBQTFCLENBQWI7QUFDQSxlQUFVbUQsVUFBVixTQUF3QnZOLFVBQXhCO0FBQ047QUFDQTtBQUNLO0FBZEg7QUFBQTtBQUFBLDBCQUNnQjtBQUFBLHlCQUN1QixLQUFLd00sT0FENUI7QUFBQSxZQUNOZSxVQURNLGNBQ05BLFVBRE07QUFBQSxZQUNNMkMsV0FETixjQUNNQSxXQUROOztBQUVaLGVBQU87QUFDTGxRLHNCQUFZbVEsWUFBWTVFLE9BQVosQ0FBb0J2SSxHQUFwQixDQUF5QjtBQUFBLG1CQUFZZ0ksU0FBU3dCLE9BQVQsQ0FBaUJhLFVBQTdCO0FBQUEsV0FBekI7QUFEUCxTQUFQO0FBR0Q7QUFOSDs7QUFBQTtBQUFBLElBQStDaEwsZUFBSzhLLFFBQXBEO0FBSkYsQ0E5Y0YsRUFvZUU7QUFDRXZLLFFBQU0sd0JBRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VDLFVBQVEsd0JBSFY7QUFJRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsWUFDSDJLLFVBREcsR0FDWSxLQUFLYixPQURqQixDQUNIYSxVQURHOztBQUVULHlCQUFlQSxVQUFmO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQWtEaEwsZUFBSzhLLFFBQXZEO0FBSkYsQ0FwZUYsRTs7Ozs7OztBQ2hCQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSyxZQUFZLGVBQWU7QUFDaEM7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7Ozs7Ozs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsa0JBQWtCLEVBQUU7O0FBRS9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRyxZQUFZO0FBQ2Y7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7Ozs7Ozs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtGQUFrRix1QkFBdUI7QUFDekcsaUVBQWlFO0FBQ2pFLCtEQUErRDtBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsY0FBYztBQUNkLGNBQWM7QUFDZCxjQUFjO0FBQ2QsZUFBZTtBQUNmLGVBQWU7QUFDZixlQUFlO0FBQ2YsZ0JBQWdCO0FBQ2hCOzs7Ozs7OztBQzFDQTtBQUNBOzs7Ozs7OztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRDtBQUNqRCxDQUFDO0FBQ0Q7QUFDQSxxQkFBcUI7QUFDckI7QUFDQSxTQUFTO0FBQ1QsR0FBRyxFQUFFO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7Ozs7Ozs7QUN4Q0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRyxZQUFZO0FBQ2Y7QUFDQTs7Ozs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7O0FBRWpCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDbEJBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG9FQUFvRSxpQ0FBaUM7QUFDckc7Ozs7Ozs7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyREFBMkQ7QUFDM0Q7Ozs7Ozs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMERBQTBELHNCQUFzQjtBQUNoRixrRkFBa0Ysd0JBQXdCO0FBQzFHOzs7Ozs7Ozs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7Ozs7Ozs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCLHNCQUFzQix1QkFBdUIsV0FBVyxJQUFJO0FBQzVELEdBQUc7QUFDSCxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkRBQTJEO0FBQzNEO0FBQ0EsS0FBSztBQUNMO0FBQ0Esc0JBQXNCLG1DQUFtQztBQUN6RCxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnRUFBZ0UsZ0NBQWdDO0FBQ2hHO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwwREFBMEQsa0JBQWtCOztBQUU1RTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsdUJBQXVCOztBQUUzQyxvREFBb0QsNkJBQTZCOztBQUVqRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsMEJBQTBCLGVBQWUsRUFBRTtBQUMzQywwQkFBMEIsZ0JBQWdCO0FBQzFDLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9EQUFvRCxPQUFPLFFBQVEsaUNBQWlDO0FBQ3BHLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3RUFBd0U7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDek9BO0FBQ0E7OztBQUdBO0FBQ0Esc0NBQXVDLHVCQUF1QixtQkFBbUIsR0FBRyxzQkFBc0IsMEJBQTBCLDZCQUE2QixHQUFHLHFCQUFxQixnQkFBZ0IsbUJBQW1CLEdBQUcsb0JBQW9CLGVBQWUsZ0JBQWdCLEdBQUcscUJBQXFCLGVBQWUsZ0JBQWdCLEdBQUcsc0JBQXNCLGdCQUFnQixpQkFBaUIsR0FBRyxxQkFBcUIsZ0JBQWdCLGlCQUFpQixHQUFHLG9CQUFvQixnQkFBZ0IsaUJBQWlCLEdBQUcsdUJBQXVCLGdCQUFnQixpQkFBaUIsR0FBRzs7QUFFbGpCOzs7Ozs7OztBQ1BBO0FBQ0E7OztBQUdBO0FBQ0EscUNBQXNDLGdCQUFnQixHQUFHLGVBQWUsaUJBQWlCLEdBQUcsYUFBYSxnQkFBZ0IsaUJBQWlCLEdBQUc7O0FBRTdJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRkE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7OytlQVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUtBO0FBQ0EsSUFBTXhKLFNBQVM1RCxpQkFBTzJELFNBQVAsQ0FBaUIsTUFBakIsQ0FBZjtrQkFDZUMsTTs7O0FBRWZBLE9BQU95SCxXQUFQLENBQ0U7QUFDRXhJLFFBQU0sWUFEUjtBQUVFRixlQUFhTCxlQUFLK047QUFGcEIsQ0FERixFQU1FO0FBQ0V4TixRQUFNLFNBRFI7QUFFRUYsZUFBYUwsZUFBS2dPO0FBRnBCLENBTkY7O0FBV0U7QUFDQTtBQUNBO0FBQ0V6TixRQUFNLE1BRFI7QUFFRTBOLFdBQVMsZ0JBRlg7QUFHRXZOLGFBQVcsTUFIYjtBQUlFTDtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUNFO0FBREYsaUNBRWE7QUFDVCxlQUFPLEtBQUs2SSxPQUFMLENBQWE5TSxPQUFiLENBQXFCLEtBQXJCLEVBQTRCLEdBQTVCLENBQVA7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBZ0M0RCxlQUFLa08sT0FBckMsQ0FKRjtBQVVFL00sU0FBTyxDQUNMO0FBQ0VpQyxXQUFPLHlCQURUO0FBRUVqQyxXQUFPLENBQ0wsQ0FBQyxLQUFELEVBQVEsS0FBUixDQURLLEVBRUwsQ0FBQyxTQUFELEVBQVksU0FBWixDQUZLLEVBR0wsQ0FBQyxTQUFELEVBQVksU0FBWixDQUhLLEVBSUwsQ0FBQyxPQUFELEVBQVUsT0FBVixDQUpLLEVBS0wsQ0FBQyxZQUFELEVBQWUsWUFBZixDQUxLO0FBRlQsR0FESyxFQVdMO0FBQ0VpQyxXQUFPLHdDQURUO0FBRUVqQyxXQUFPLENBQ0wsQ0FBQyxPQUFELEVBQVV2QyxTQUFWLENBREssRUFFTCxDQUFDLFFBQUQsRUFBV0EsU0FBWCxDQUZLLENBRXFCO0FBRnJCO0FBRlQsR0FYSztBQVZULENBYkY7O0FBNENFO0FBQ0E7QUFDQTtBQUNBO0FBQ0UyQixRQUFNLFlBRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VQLGFBQVcsWUFIYjtBQUlFdU4sV0FBUyxnQkFKWDtBQUtFNU47QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFDRTtBQURGLGlDQUVhO0FBQ1QsZUFBTyxLQUFLNkksT0FBTCxDQUFhOU0sT0FBYixDQUFxQixLQUFyQixFQUE0QixHQUE1QixDQUFQO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQXNDNEQsZUFBS2tPLE9BQTNDLENBTEY7QUFXRS9OLGFBQVc7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBUlMsRUFRQSxPQVJBLEVBUVMsT0FSVCxFQVFrQixLQVJsQixFQVF5QixJQVJ6QixFQVErQixJQVIvQixFQVNULFFBVFMsRUFTQyxRQVRELEVBU1csT0FUWCxFQVNvQixTQVRwQixFQVMrQixRQVQvQixFQVN5QyxTQVR6QyxFQVNvRCxRQVRwRCxFQVM4RCxJQVQ5RCxFQVVULFNBVlMsRUFVRSxNQVZGLEVBVVUsUUFWVixFQVdULE1BWFMsRUFXRCxPQVhDLEVBV1EsU0FYUixFQVdtQixRQVhuQixFQVlULEtBWlMsRUFZRixNQVpFLEVBYVQsU0FiUyxFQWNULEdBZFMsRUFjSixJQWRJLEVBY0UsTUFkRixFQWVULE1BZlMsRUFlRCxNQWZDLEVBZ0JULElBaEJTLEVBZ0JILE9BaEJHLEVBZ0JNLE1BaEJOLEVBaUJULE1BakJTLEVBaUJELEtBakJDLEVBa0JULElBbEJTLEVBa0JILEtBbEJHLEVBa0JJLElBbEJKLEVBa0JVLE1BbEJWLEVBa0JrQixVQWxCbEIsRUFrQjhCLElBbEI5QixFQWtCb0MsS0FsQnBDLEVBa0IyQyxTQWxCM0MsRUFrQnNELE1BbEJ0RCxFQW1CVCxPQW5CUyxFQW1CQSxPQW5CQSxFQW9CVCxNQXBCUyxFQW9CRCxLQXBCQyxFQW9CTSxNQXBCTixFQW9CYyxTQXBCZCxFQW9CeUIsTUFwQnpCLEVBb0JpQyxJQXBCakMsRUFvQnVDLFFBcEJ2QyxFQW9CaUQsU0FwQmpELEVBcUJULFdBckJTLEVBcUJJLE9BckJKLEVBcUJhLFlBckJiLEVBcUIyQixRQXJCM0IsRUFxQnFDLE9BckJyQyxFQXFCOEMsSUFyQjlDLEVBcUJvRCxNQXJCcEQsRUFxQjRELFFBckI1RCxFQXNCVCxRQXRCUyxFQXNCQyxJQXRCRCxFQXVCVCxPQXZCUyxFQXVCQSxNQXZCQSxFQXVCUSxRQXZCUixFQXVCa0IsU0F2QmxCOztBQXlCVDtBQUNBLE9BMUJTLEVBMkJULElBM0JTLEVBMkJILE1BM0JHLEVBNEJULFVBNUJTLEVBNkJULEtBN0JTLEVBNkJGLE1BN0JFLEVBOEJULElBOUJTLEVBK0JULFFBL0JTLEVBZ0NULEtBaENTLEVBZ0NGLE1BaENFOztBQWtDVDtBQUNBLFFBbkNTLEVBb0NULElBcENTLEVBcUNULFdBckNTLEVBc0NULE9BdENTOztBQXdDVDtBQUNBLFFBekNTLEVBeUNELE9BekNDLEVBMENULEtBMUNTLEVBMENGLElBMUNFLEVBMkNULElBM0NTLEVBMkNILFFBM0NHLEVBNENULFNBNUNTLEVBNENFLFNBNUNGOztBQThDVDtBQUNBO0FBQ0EsT0FoRFMsRUFnREYsS0FoREUsRUFnREssT0FoREwsRUFnRGMsTUFoRGQsRUFnRHNCLE1BaER0QixFQWlEVCxLQWpEUyxFQWlERixPQWpERSxFQWlETyxPQWpEUCxFQWlEZ0IsTUFqRGhCLEVBaUR3QixLQWpEeEIsQ0FYYjtBQThERWdCLFNBQU8sQ0FDTDtBQUNFaUMsV0FBTywrQkFEVDtBQUVFakMsV0FBTyxDQUNMLENBQUMsRUFBRCxFQUFLdkMsU0FBTCxDQURLLEVBRUwsQ0FBQyxLQUFELEVBQVEsS0FBUixDQUZLLEVBR0wsQ0FBQyxTQUFELEVBQVksU0FBWixDQUhLLEVBSUwsQ0FBQyxTQUFELEVBQVksU0FBWixDQUpLLEVBS0wsQ0FBQyxPQUFELEVBQVUsT0FBVixDQUxLLEVBTUwsQ0FBQyxZQUFELEVBQWUsWUFBZixDQU5LO0FBRlQsR0FESyxFQVlMO0FBQ0V3RSxXQUFPLDhDQURUO0FBRUVqQyxXQUFPLENBQ0wsQ0FBQyxFQUFELEVBQUt2QyxTQUFMLENBREssRUFFTCxDQUFDLE9BQUQsRUFBVUEsU0FBVixDQUZLLEVBR0wsQ0FBQyxRQUFELEVBQVdBLFNBQVgsQ0FISyxFQUdzQjtBQUMzQixLQUFDLEtBQUQsRUFBUUEsU0FBUixDQUpLO0FBRlQsR0FaSyxFQXFCTDtBQUNFd0UsV0FBTyw4QkFEVDtBQUVFakMsV0FBTyxDQUNMLENBQUMsS0FBRCxFQUFRdkMsU0FBUixDQURLO0FBRlQsR0FyQks7QUE5RFQsQ0EvQ0Y7O0FBMklFO0FBQ0E7QUFDQTtBQUNFMkIsUUFBTSxNQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFUCxhQUFXLE1BSGI7QUFJRXVOLFdBQVMsNEVBSlg7QUFLRTVOO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQ0U7QUFERixpQ0FFYTtBQUNULFlBQUkrTCxPQUFPLEtBQUtsRCxPQUFoQjtBQUNBLGdCQUFPa0QsSUFBUDtBQUNFO0FBQ0EsZUFBSyxNQUFMO0FBQWMsbUJBQU8sT0FBUDs7QUFFZDtBQUNBLGVBQUssTUFBTDtBQUFjLG1CQUFPLE9BQVA7QUFDZCxlQUFLLE1BQUw7QUFBYyxtQkFBTyxRQUFQO0FBQ2QsZUFBSyxXQUFMO0FBQWtCLG1CQUFPLFdBQVA7QUFDbEIsZUFBSyxRQUFMO0FBQWdCLG1CQUFPLFFBQVA7QUFDaEIsZUFBSyxTQUFMO0FBQWlCLG1CQUFPLFNBQVA7QUFDakIsZUFBSyxTQUFMO0FBQWlCLG1CQUFPLFNBQVA7QUFDakIsZUFBSyxTQUFMO0FBQWlCLG1CQUFPLFNBQVA7QUFDakIsZUFBSyxRQUFMO0FBQWdCLG1CQUFPLFFBQVA7QUFDaEI7QUFDRSxtQkFBT0EsS0FBS2hRLE9BQUwsQ0FBYSxLQUFiLEVBQW9CLEdBQXBCLENBQVA7QUFkSjtBQWdCRDtBQXBCSDs7QUFBQTtBQUFBLElBQWdDNEQsZUFBS2tPLE9BQXJDLENBTEY7QUEyQkUvTixhQUFXLENBQUUsR0FBRixDQTNCYjtBQTRCRWdCLFNBQU8sQ0FDTDtBQUNFaUMsV0FBTyx5QkFEVDtBQUVFakMsV0FBTyxDQUNMLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FESyxFQUVMLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FGSyxFQUdMLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FISyxFQUlMLENBQUMsT0FBRCxFQUFVLE9BQVYsQ0FKSyxFQUtMLENBQUMsWUFBRCxFQUFlLFlBQWYsQ0FMSztBQUZULEdBREssRUFXTDtBQUNFaUMsV0FBTyx3Q0FEVDtBQUVFakMsV0FBTyxDQUNMLENBQUMsRUFBRCxFQUFLdkMsU0FBTCxDQURLLEVBRUwsQ0FBQyxPQUFELEVBQVVBLFNBQVYsQ0FGSyxFQUVxQjtBQUMxQixLQUFDLFFBQUQsRUFBV0EsU0FBWCxDQUhLO0FBRlQsR0FYSyxFQW1CTDtBQUNFd0UsV0FBTyx3QkFEVDtBQUVFakMsV0FBTyxDQUNMLENBQUMsTUFBRCxFQUFTLE9BQVQsQ0FESyxFQUVMLENBQUMsTUFBRCxFQUFTLE9BQVQsQ0FGSyxFQUdMLENBQUMsTUFBRCxFQUFTLFFBQVQsQ0FISyxFQUlMLENBQUMsV0FBRCxFQUFjLFdBQWQsQ0FKSyxFQUtMLENBQUMsUUFBRCxFQUFXLFFBQVgsQ0FMSyxFQU1MLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FOSyxFQU9MLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FQSyxFQVFMLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FSSyxFQVNMLENBQUMsUUFBRCxFQUFXLFFBQVgsQ0FUSztBQUZULEdBbkJLLEVBaUNMO0FBQ0VpQyxXQUFPLDhCQURUO0FBRUVqQyxXQUFPLENBQ0wsQ0FBQyxHQUFELEVBQU12QyxTQUFOLENBREs7QUFGVCxHQWpDSztBQTVCVCxDQTdJRjs7QUFxTkU7QUFDQTtBQUNBO0FBQ0UyQixRQUFNLFNBRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VQLGFBQVcsU0FIYjtBQUlFdU4sV0FBUyxpREFKWDtBQUtFNU47QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQ1QsZ0JBQVEsS0FBSzZJLE9BQWI7QUFDRSxlQUFLLE1BQUw7QUFDQSxlQUFLLEtBQUw7QUFDQSxlQUFLLElBQUw7QUFDQSxlQUFLLFNBQUw7QUFDRSxtQkFBTyxJQUFQOztBQUVGO0FBQ0UsbUJBQU8sS0FBUDtBQVJKO0FBVUQ7QUFaSDs7QUFBQTtBQUFBLElBQW1DbEosZUFBS2tPLE9BQXhDLENBTEY7QUFtQkUvTSxTQUFPLENBQ0w7QUFDRWlDLFdBQU8sNEJBRFQ7QUFFRWpDLFdBQU8sQ0FDTCxDQUFDLEVBQUQsRUFBS3ZDLFNBQUwsQ0FESyxFQUVMLENBQUMsTUFBRCxFQUFTLElBQVQsQ0FGSyxFQUdMLENBQUMsS0FBRCxFQUFRLElBQVIsQ0FISyxFQUlMLENBQUMsSUFBRCxFQUFPLElBQVAsQ0FKSyxFQUtMLENBQUMsU0FBRCxFQUFZLElBQVosQ0FMSyxFQU1MLENBQUMsT0FBRCxFQUFVLEtBQVYsQ0FOSyxFQU9MLENBQUMsSUFBRCxFQUFPLEtBQVAsQ0FQSyxFQVFMLENBQUMsUUFBRCxFQUFXLEtBQVgsQ0FSSyxFQVNMLENBQUMsU0FBRCxFQUFZLEtBQVosQ0FUSztBQUZULEdBREssRUFlTDtBQUNFd0UsV0FBTyxpREFEVDtBQUVFakMsV0FBTyxDQUNMLENBQUMsUUFBRCxFQUFXdkMsU0FBWCxDQURLLEVBRUwsQ0FBQyxTQUFELEVBQVlBLFNBQVosQ0FGSyxFQUdMLENBQUMsU0FBRCxFQUFZQSxTQUFaLENBSEs7QUFGVCxHQWZLO0FBbkJULENBdk5GOztBQW9RRTtBQUNBO0FBQ0E7QUFDQTtBQUNFMkIsUUFBTSxRQURSO0FBRUVVLFNBQU8sWUFGVDtBQUdFUCxhQUFXLFFBSGI7QUFJRUw7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7O0FBZ0JFO0FBaEJGLDRCQWlCUWlCLE1BakJSLEVBaUJnQmpELE1BakJoQixFQWlCbUM7QUFBQSxZQUFYYSxLQUFXLHVFQUFILENBQUc7O0FBQy9CLFlBQUlSLFFBQVFMLE9BQU9hLEtBQVAsQ0FBWjtBQUNBO0FBQ0EsWUFBSSxPQUFPUixLQUFQLEtBQWlCLFFBQXJCLEVBQStCQSxRQUFRc0IsZUFBS21PLE1BQUwsQ0FBWUMsWUFBWixDQUF5QjFQLEtBQXpCLENBQVI7QUFDL0IsWUFBSSxPQUFPQSxLQUFQLEtBQWlCLFFBQXJCLEVBQStCLE9BQU9FLFNBQVA7QUFDL0IsZUFBTyxLQUFLcUssS0FBTCxDQUFXO0FBQ2hCQyxtQkFBU3hLLEtBRE87QUFFaEJ5SyxxQkFBV2pLLFFBQVE7QUFGSCxTQUFYLENBQVA7QUFJRDs7QUFFRDs7QUEzQkE7O0FBREY7QUFBQTtBQUFBLGlDQTZCYTtBQUNULGVBQU8sS0FBS2dLLE9BQVo7QUFDRDtBQS9CSDs7QUFBQTtBQUFBLElBQWtDbEosY0FBbEMsVUFFU29PLFlBRlQsR0FFd0I7QUFDcEJDLFVBQU0sQ0FEYztBQUVwQkMsU0FBSyxDQUZlO0FBR3BCQyxTQUFLLENBSGU7QUFJcEJDLFdBQU8sQ0FKYTtBQUtwQkMsVUFBTSxDQUxjO0FBTXBCQyxVQUFNLENBTmM7QUFPcEJDLFNBQUssQ0FQZTtBQVFwQkMsV0FBTyxDQVJhO0FBU3BCQyxXQUFPLENBVGE7QUFVcEJDLFVBQU0sQ0FWYztBQVdwQkMsU0FBSyxFQVhlLEVBRnhCLFFBSkY7QUFxQ0U1TixTQUFPLENBQ0w7QUFDRWlDLFdBQU8sMkJBRFQ7QUFFRWpDLFdBQU8sQ0FDTCxDQUFDLEdBQUQsRUFBTSxDQUFOLENBREssRUFFTCxDQUFDLE1BQUQsRUFBUyxJQUFULENBRkssRUFHTCxDQUFDLElBQUQsRUFBTyxDQUFDLENBQVIsQ0FISyxFQUlMLENBQUMsS0FBRCxFQUFRLEdBQVIsQ0FKSyxFQUtMLENBQUMsT0FBRCxFQUFVLEdBQVYsQ0FMSyxFQU1MLENBQUMsSUFBRCxFQUFPLENBQVAsQ0FOSyxFQU9MLENBQUMsSUFBRCxFQUFPLEdBQVAsQ0FQSyxFQVFMLENBQUMsVUFBRCxFQUFhLENBQUMsT0FBZCxDQVJLO0FBRlQsR0FESyxFQWNMO0FBQ0VpQyxXQUFPLDBDQURUO0FBRUVqQyxXQUFPLENBQ0wsQ0FBQyxFQUFELEVBQUt2QyxTQUFMLENBREssRUFFTCxDQUFDLEdBQUQsRUFBTUEsU0FBTixDQUZLO0FBRlQsR0FkSyxFQXFCTDtBQUNFd0UsV0FBTyxrREFEVDtBQUVFakMsV0FBTyxDQUNMLENBQUMsS0FBRCxFQUFRdkMsU0FBUixDQURLO0FBRlQsR0FyQks7QUFyQ1QsQ0F2UUY7O0FBMFVFO0FBQ0E7QUFDQTtBQUNBO0FBQ0UyQixRQUFNLE1BRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VQLGFBQVcsTUFIYjtBQUlFTDtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUNFO0FBREYsNEJBRVFpQixNQUZSLEVBRWdCakQsTUFGaEIsRUFFbUM7QUFBQSxZQUFYYSxLQUFXLHVFQUFILENBQUc7O0FBQy9CLFlBQUlSLFFBQVFMLE9BQU9hLEtBQVAsQ0FBWjtBQUNBLFlBQUksRUFBRVIsaUJBQWlCSixvQkFBVTBRLElBQTdCLENBQUosRUFBd0MsT0FBT3BRLFNBQVA7QUFDeEMsZUFBTyxLQUFLcUssS0FBTCxDQUFXO0FBQ2hCQyxtQkFBU3hLLE1BQU11USxZQURDO0FBRWhCOUYscUJBQVdqSyxRQUFRO0FBRkgsU0FBWCxDQUFQO0FBSUQ7QUFUSDtBQUFBO0FBQUEsaUNBV2E7QUFDVCxlQUFPLEtBQUtnSyxPQUFaO0FBQ0Q7QUFiSDs7QUFBQTtBQUFBLElBQWdDbEosY0FBaEMsQ0FKRjtBQW1CRW1CLFNBQU8sQ0FDTDtBQUNFaUMsV0FBTyx3QkFEVDtBQUVFakMsV0FBTyxDQUNMLENBQUMsSUFBRCxFQUFPLElBQVAsQ0FESyxFQUVMLENBQUMsSUFBRCxFQUFPLElBQVAsQ0FGSyxFQUdMLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FISyxFQUlMLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FKSyxFQUtMLENBQUMsUUFBRCxFQUFXLFFBQVgsQ0FMSyxFQU1MLENBQUMsb0JBQUQsRUFBdUIsb0JBQXZCLENBTkssRUFPTCxDQUFDLHdCQUFELEVBQTJCLHdCQUEzQixDQVBLO0FBRlQsR0FESztBQW5CVCxDQTdVRjs7QUFpWEU7QUFDQTtBQUNFWixRQUFNLGNBRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VDLFVBQVEsNkJBSFY7QUFJRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsWUFDSDBLLElBREcsR0FDTSxLQUFLWixPQURYLENBQ0hZLElBREc7O0FBRVQsc0JBQVdBLE9BQU9BLEtBQUtoRCxJQUFMLENBQVUsSUFBVixDQUFQLEdBQXlCLEVBQXBDO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQXdDL0gsZUFBSzhLLFFBQTdDLENBSkY7QUFVRTNKLFNBQU8sQ0FDTDtBQUNFaUMsV0FBTyxpQ0FEVDtBQUVFakMsV0FBTyxDQUNMLENBQUMsSUFBRCxFQUFPLElBQVAsQ0FESyxFQUVMLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FGSyxFQUdMLENBQUMsTUFBRCxFQUFTLEtBQVQsQ0FISyxFQUlMLENBQUMsU0FBRCxFQUFZLFdBQVosQ0FKSyxFQUtMLENBQUMsV0FBRCxFQUFjLFdBQWQsQ0FMSyxFQU1MLENBQUMsVUFBRCxFQUFhLFdBQWIsQ0FOSyxFQU9MLENBQUMsZ0JBQUQsRUFBbUIsdUJBQW5CLENBUEs7QUFGVCxHQURLLEVBYUw7QUFDRWlDLFdBQU8sZ0NBRFQ7QUFFRWpDLFdBQU8sQ0FDTCxDQUFDLEVBQUQsRUFBS3ZDLFNBQUwsQ0FESyxFQUVMLENBQUMsTUFBRCxFQUFTQSxTQUFULENBRks7QUFGVCxHQWJLO0FBVlQsQ0FsWEY7O0FBb1pFO0FBQ0E7QUFDRTJCLFFBQU0sMEJBRFI7QUFFRVUsU0FBTyxZQUZUO0FBR0VDLFVBQVEsb0JBSFY7QUFJRWI7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGlDQUNhO0FBQUEsWUFDSDZLLFVBREcsR0FDWSxLQUFLZixPQURqQixDQUNIZSxVQURHO0FBRVQ7O0FBQ0EsWUFBSSxPQUFPQSxVQUFQLEtBQXNCLFFBQXRCLElBQWtDQSxXQUFXcUMsVUFBWCxDQUFzQixHQUF0QixDQUFsQyxJQUFnRXJDLFdBQVdnRSxRQUFYLENBQW9CLEdBQXBCLENBQXBFLEVBQThGLE9BQU9oRSxVQUFQO0FBQzlGLGVBQU8sTUFBTUEsVUFBTixHQUFtQixHQUExQjtBQUNEO0FBTkg7O0FBQUE7QUFBQSxJQUFvRGxMLGVBQUs4SyxRQUF6RCxDQUpGO0FBWUUzSixTQUFPLENBQ0w7QUFDRWlDLFdBQU8sNkNBRFQ7QUFFRWpDLFdBQU8sQ0FDTCxDQUFDLFdBQUQsRUFBYyxXQUFkLENBREssRUFFTCxDQUFDLGFBQUQsRUFBZ0IsV0FBaEIsQ0FGSyxFQUdMLENBQUMsYUFBRCxFQUFnQixhQUFoQixDQUhLO0FBRlQsR0FESyxFQVNMO0FBQ0VpQyxXQUFPLHdDQURUO0FBRUVtSCxlQUFXLFlBRmI7QUFHRXBKLFdBQU8sQ0FDTCxDQUFDLGVBQUQsRUFBa0IsaUJBQWxCLENBREssRUFFTCxDQUFDLGlCQUFELEVBQW9CLGlCQUFwQixDQUZLLEVBR0wsQ0FBQyxtQkFBRCxFQUFzQixpQkFBdEIsQ0FISztBQUhULEdBVEssRUFrQkw7QUFDRWlDLFdBQU8sbURBRFQ7QUFFRWpDLFdBQU8sQ0FDTCxDQUFDLE1BQUQsRUFBU3ZDLFNBQVQsQ0FESyxFQUVMLENBQUMsY0FBRCxFQUFpQkEsU0FBakIsQ0FGSztBQUZULEdBbEJLO0FBWlQsQ0FyWkYsRTs7Ozs7OztBQ2JBO0FBQ0E7QUFDQSxpQ0FBaUMsUUFBUSxtQkFBbUIsVUFBVSxFQUFFLEVBQUU7QUFDMUUsQ0FBQzs7Ozs7Ozs7QUNIRCx1QkFBdUI7QUFDdkI7QUFDQTtBQUNBOzs7Ozs7OztBQ0hBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUcsWUFBWTtBQUNmO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUMxREE7QUFBQSxtREFBbUQsZ0JBQWdCLHNCQUFzQixPQUFPLDJCQUEyQiwwQkFBMEIseURBQXlELDJCQUEyQixFQUFFLEVBQUUsRUFBRSxlQUFlOztBQUU5UCxnQ0FBZ0MsMkNBQTJDLGdCQUFnQixrQkFBa0IsT0FBTywyQkFBMkIsd0RBQXdELGdDQUFnQyx1REFBdUQsMkRBQTJELEVBQUUsRUFBRSx5REFBeUQscUVBQXFFLDZEQUE2RCxvQkFBb0IsR0FBRyxFQUFFOztBQUVqakIsaURBQWlELDBDQUEwQywwREFBMEQsRUFBRTs7QUFFdkosaURBQWlELGFBQWEsdUZBQXVGLEVBQUUsdUZBQXVGOztBQUU5TywwQ0FBMEMsK0RBQStELHFHQUFxRyxFQUFFLHlFQUF5RSxlQUFlLHlFQUF5RSxFQUFFLEVBQUUsdUhBQXVIOztBQUU1ZTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQzZCO0FBQ1Y7O0FBRW5CO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsTUFBTTtBQUNqQixZQUFZLE9BQU87QUFDbkI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0EsdUJBQXVCLGVBQWU7QUFDdEMsa0NBQWtDLGNBQWM7QUFDaEQsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSx3R0FBZ0UsZUFBZSxzQkFBc0I7QUFDckc7QUFDQSxLQUFLOztBQUVMO0FBQ0EsR0FBRzs7QUFFSCw4REFBb0Isc0dBQXNHOztBQUUxSDtBQUNBOztBQUVBLDJFOzs7Ozs7Ozs7OztBQ2hGQTtBQUFBLG9HQUFvRyxtQkFBbUIsRUFBRSxtQkFBbUIsOEhBQThIOztBQUUxUTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksVUFBVTtBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsU0FBUztBQUNwQixXQUFXLE1BQU07QUFDakIsWUFBWSxTQUFTO0FBQ3JCO0FBQ0E7QUFDQSxvRkFBb0YsYUFBYTtBQUNqRztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLHFEQUFxRDtBQUN6RjtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE1BQU07QUFDakIsWUFBWSxTQUFTO0FBQ3JCO0FBQ0E7QUFDQSxvRUFBb0UsZUFBZTtBQUNuRjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxNQUFNO0FBQ2pCLFlBQVksU0FBUztBQUNyQjtBQUNBO0FBQ0Esb0VBQW9FLGVBQWU7QUFDbkY7QUFDQTs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7Ozs7OztBQ3RHQTtBQUFBLG9HQUFvRyxtQkFBbUIsRUFBRSxtQkFBbUIsOEhBQThIOztBQUUxUTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ3lDOztBQUV6QztBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQjtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsTUFBTTtBQUNqQixZQUFZLE9BQU87QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFvQixxQ0FBcUM7O0FBRXpEO0FBQ0EsbUVBQW1FLGFBQWE7QUFDaEY7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLHdFOzs7Ozs7Ozs7QUN0RkE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixXQUFXLE1BQU07QUFDakIsWUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGVBQWUsT0FBTztBQUN0QjtBQUNBLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEI7QUFDQSxlQUFlLE1BQU07QUFDckIsZ0JBQWdCLFFBQVE7QUFDeEI7QUFDQTtBQUNBOztBQUVBO0FBQ0Esd0dBQTBCLDJDQUEyQztBQUNyRSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7OztBQUdBLGdIQUFrQztBQUNsQztBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7O0FBRUEsd0ZBQXdGLGFBQWE7QUFDckc7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSw4RTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzNFQTtBQUFBO0FBQ0E7O0FBRUE7QUFDaUM7O0FBRWpDO0FBQ3FCOztBQUVyQjs7Ozs7Ozs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDJEQUEyRDtBQUMzRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxDOzs7Ozs7OztBQ2xGQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLFNBQVM7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixZQUFZLFNBQVM7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLGlDQUFpQztBQUNwRDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwwREFBZ0IsaUg7Ozs7Ozs7O0FDL0VoQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7OztBQUdIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7O0FBR0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOzs7QUFHSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsb0U7Ozs7Ozs7O0FDaEVBO0FBQUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQzs7Ozs7Ozs7Ozs7Ozs7Ozs7cWpCQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7Ozs7O0FBR0E7QUFDQTtJQUNxQm9CLEk7QUFDcEIsaUJBQXNCO0FBQUE7O0FBQUEsb0NBQVBNLEtBQU87QUFBUEEsUUFBTztBQUFBOztBQUNyQnhDLFNBQU9DLE1BQVAsZ0JBQWMsSUFBZCxTQUF1QnVDLEtBQXZCO0FBQ0E7O0FBRUQ7Ozs7O3dCQUNNQSxLLEVBQU87QUFDWixVQUFPLElBQUksS0FBS0QsV0FBVCxDQUFxQixJQUFyQixFQUEyQkMsS0FBM0IsQ0FBUDtBQUNBOztBQUVGO0FBQ0E7QUFDQTs7QUFFQztBQUNBOzs7O3dCQUNNZ0IsTSxFQUFRakQsTSxFQUErQjtBQUFBLE9BQXZCYSxLQUF1Qix1RUFBZixDQUFlO0FBQUEsT0FBWkMsR0FBWTtBQUFBLE9BQVBDLEtBQU87O0FBQzVDLFVBQU9SLFNBQVA7QUFDQTs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7dUJBQ0swQyxNLEVBQVFqRCxNLEVBQXdCO0FBQUEsT0FBaEJhLEtBQWdCLHVFQUFSLENBQVE7QUFBQSxPQUFMQyxHQUFLOztBQUNwQyxVQUFPUCxTQUFQO0FBQ0E7O0FBRUY7QUFDQTtBQUNBOztBQUVDOzs7OzZCQUNXO0FBQ1YsVUFBTyxLQUFLc0ssT0FBWjtBQUNBOztBQUdGO0FBQ0E7QUFDQTs7OztnQ0FDZTtBQUNiLFVBQU90SyxTQUFQO0FBQ0E7O0FBRUY7QUFDQTtBQUNBOzs7Ozs7O0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztrQkE1RHFCb0IsSTtBQTZEckJBLEtBQUttUCxRQUFMO0FBQUE7O0FBQ0MscUJBQXNCO0FBQUE7O0FBQUE7O0FBQUEscUNBQVA3TyxLQUFPO0FBQVBBLFFBQU87QUFBQTs7QUFFckI7QUFGcUIsNklBQ1pBLEtBRFk7O0FBR3JCLE1BQUksQ0FBQ1gsTUFBTUMsT0FBTixDQUFjLE1BQUsrSyxRQUFuQixDQUFMLEVBQW1DLE1BQUtBLFFBQUwsR0FBZ0IsQ0FBQyxNQUFLQSxRQUFOLENBQWhCO0FBSGQ7QUFJckI7O0FBRUQ7QUFDQTs7O0FBUkQ7QUFBQTtBQUFBLHdCQVNPckosTUFUUCxFQVNlakQsTUFUZixFQVM4QztBQUFBLE9BQXZCYSxLQUF1Qix1RUFBZixDQUFlO0FBQUEsT0FBWkMsR0FBWTtBQUFBLE9BQVBDLEtBQU87O0FBQzVDLE9BQUksQ0FBQyxLQUFLZ1EsaUJBQUwsQ0FBdUIvUSxNQUF2QixFQUErQmEsS0FBL0IsRUFBc0NDLEdBQXRDLENBQUwsRUFBaUQsT0FBT1AsU0FBUDtBQUNqRCxVQUFPLEtBQUtxSyxLQUFMLENBQVc7QUFDakJDLGFBQVMsS0FBS3lCLFFBQUwsQ0FBYzVDLElBQWQsQ0FBbUIsS0FBS3NILGdCQUF4QixDQURRO0FBRWpCbEcsZUFBV2pLLFFBQVEsS0FBS3lMLFFBQUwsQ0FBY3pNO0FBRmhCLElBQVgsQ0FBUDtBQUlBOztBQUVEOztBQWpCRDtBQUFBO0FBQUEsdUJBa0JNb0QsTUFsQk4sRUFrQmNqRCxNQWxCZCxFQWtCc0Q7QUFBQSxPQUFoQ2EsS0FBZ0MsdUVBQXhCLENBQXdCO0FBQUEsT0FBckJDLEdBQXFCLHVFQUFmZCxPQUFPSCxNQUFROztBQUNuRCxPQUFJb1IsUUFBUSxLQUFLM0UsUUFBTCxDQUFjLENBQWQsQ0FBWjtBQUNBLFFBQUssSUFBSTBDLFFBQVFuTyxLQUFqQixFQUF3Qm1PLFFBQVFsTyxHQUFoQyxFQUFxQ2tPLE9BQXJDLEVBQThDO0FBQzVDLFFBQUloUCxPQUFPZ1AsS0FBUCxNQUFrQmlDLEtBQXRCLEVBQTZCO0FBQzdCLFFBQUksS0FBS0YsaUJBQUwsQ0FBdUIvUSxNQUF2QixFQUErQmdQLEtBQS9CLEVBQXNDbE8sR0FBdEMsQ0FBSixFQUFnRCxPQUFPLElBQVA7QUFDakQ7QUFDRCxVQUFPLEtBQVA7QUFDRDs7QUFFRDs7QUEzQkQ7QUFBQTtBQUFBLG9DQTRCbUJkLE1BNUJuQixFQTRCMkQ7QUFBQSxPQUFoQ2EsS0FBZ0MsdUVBQXhCLENBQXdCO0FBQUEsT0FBckJDLEdBQXFCLHVFQUFmZCxPQUFPSCxNQUFROztBQUN4RCxPQUFJLEtBQUt5TSxRQUFMLENBQWN6TSxNQUFkLEtBQXlCLENBQTdCLEVBQWdDLE9BQU9HLE9BQU9hLEtBQVAsTUFBa0IsS0FBS3lMLFFBQUwsQ0FBYyxDQUFkLENBQXpCO0FBQy9CLFVBQU8sS0FBS0EsUUFBTCxDQUFjNEUsS0FBZCxDQUFvQixVQUFDQyxPQUFELEVBQVVDLENBQVY7QUFBQSxXQUFpQnZRLFFBQVF1USxDQUFSLEdBQVl0USxHQUFiLElBQXNCcVEsWUFBWW5SLE9BQU9hLFFBQVF1USxDQUFmLENBQWxEO0FBQUEsSUFBcEIsQ0FBUDtBQUNGO0FBL0JGO0FBQUE7QUFBQSw2QkFpQ2E7QUFDVCxVQUFPLEtBQUt2RyxPQUFaO0FBQ0Q7QUFuQ0g7QUFBQTtBQUFBLDZCQXFDWTtBQUNWLGVBQVUsS0FBS3lCLFFBQUwsQ0FBYzVDLElBQWQsQ0FBbUIsS0FBS3NILGdCQUFMLElBQXlCLEVBQTVDLENBQVYsSUFBNEQsS0FBS0ssUUFBTCxHQUFnQixHQUFoQixHQUFzQixFQUFsRjtBQUNBO0FBdkNGOztBQUFBO0FBQUEsRUFBdUMxUCxJQUF2Qzs7QUEwQ0E7QUFDQTtBQUNBQSxLQUFLcU0sT0FBTDtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBLEVBQXFDck0sS0FBS21QLFFBQTFDOztBQUdBO0FBQ0E7QUFDQW5QLEtBQUswSyxRQUFMO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUEsRUFBdUMxSyxLQUFLbVAsUUFBNUM7QUFDQXJSLE9BQU9nRCxjQUFQLENBQXNCZCxLQUFLMEssUUFBTCxDQUFjak4sU0FBcEMsRUFBK0Msa0JBQS9DLEVBQW1FLEVBQUVzRCxPQUFPLEdBQVQsRUFBbkU7O0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FmLEtBQUtrTyxPQUFMO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQ0M7QUFERCx3QkFFTzVNLE1BRlAsRUFFZWpELE1BRmYsRUFFOEM7QUFBQSxPQUF2QmEsS0FBdUIsdUVBQWYsQ0FBZTtBQUFBLE9BQVpDLEdBQVk7QUFBQSxPQUFQQyxLQUFPOztBQUM1QyxPQUFJVixRQUFRTCxPQUFPYSxLQUFQLENBQVo7QUFDQSxPQUFJLE9BQU9SLEtBQVAsS0FBaUIsUUFBckIsRUFBK0IsT0FBT0UsU0FBUDs7QUFFL0IsT0FBSXdNLFFBQVExTSxNQUFNME0sS0FBTixDQUFZLEtBQUs2QyxPQUFqQixDQUFaO0FBQ0EsT0FBSSxDQUFDN0MsS0FBTCxFQUFZLE9BQU94TSxTQUFQOztBQUVaO0FBQ0EsT0FBSXNLLFVBQVVrQyxNQUFNLENBQU4sQ0FBZDtBQUNBLE9BQUksS0FBS2pMLFNBQUwsSUFBa0IsS0FBS0EsU0FBTCxDQUFlK0ksT0FBZixDQUF0QixFQUErQyxPQUFPdEssU0FBUDs7QUFFL0MsVUFBTyxLQUFLcUssS0FBTCxDQUFXO0FBQ2pCQyxvQkFEaUI7QUFFakJDLGVBQVdqSyxRQUFRO0FBRkYsSUFBWCxDQUFQO0FBSUE7O0FBRUQ7O0FBbkJEO0FBQUE7QUFBQSx1QkFvQk1vQyxNQXBCTixFQW9CY2pELE1BcEJkLEVBb0JzQztBQUFBLE9BQWhCYSxLQUFnQix1RUFBUixDQUFRO0FBQUEsT0FBTEMsR0FBSzs7QUFDcEMsVUFBT2QsT0FBTzBELEtBQVAsQ0FBYTdDLEtBQWIsRUFBb0JDLEdBQXBCLEVBQXlCd1EsSUFBekIsQ0FBOEI7QUFBQSxXQUFTLE9BQU9qUixLQUFQLEtBQWlCLFFBQWpCLElBQTZCdVAsUUFBUS9SLElBQVIsQ0FBYXdDLEtBQWIsQ0FBdEM7QUFBQSxJQUE5QixDQUFQO0FBQ0E7QUF0QkY7QUFBQTtBQUFBLDZCQXdCWTtBQUNWLFVBQU8sS0FBS3VQLE9BQUwsQ0FBYTJCLE1BQXBCO0FBQ0E7QUExQkY7O0FBQUE7QUFBQSxFQUFxQzVQLElBQXJDOztBQThCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FBLEtBQUs2UCxPQUFMO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSx3QkFDT3ZPLE1BRFAsRUFDZWpELE1BRGYsRUFDOEM7QUFBQSxPQUF2QmEsS0FBdUIsdUVBQWYsQ0FBZTtBQUFBLE9BQVpDLEdBQVk7QUFBQSxPQUFQQyxLQUFPOztBQUM1QyxPQUFJMFEsY0FBY3hPLE9BQU92QyxjQUFQLENBQXNCLEtBQUtnUixPQUEzQixFQUFvQzFSLE1BQXBDLEVBQTRDYSxLQUE1QyxFQUFtREMsR0FBbkQsRUFBd0RDLEtBQXhELHNCQUFpRixLQUFLRSxJQUF0RixPQUFsQjtBQUNBLE9BQUksQ0FBQ3dRLFdBQUwsRUFBa0IsT0FBT2xSLFNBQVA7QUFDbEIsT0FBSSxLQUFLdU0sUUFBVCxFQUFtQjJFLFlBQVkzRSxRQUFaLEdBQXVCLEtBQUtBLFFBQTVCO0FBQ25CLFVBQU8yRSxXQUFQO0FBQ0E7O0FBRUQ7O0FBUkQ7QUFBQTtBQUFBLHVCQVNNeE8sTUFUTixFQVNjakQsTUFUZCxFQVNzQztBQUFBLE9BQWhCYSxLQUFnQix1RUFBUixDQUFRO0FBQUEsT0FBTEMsR0FBSzs7QUFDcEMsVUFBT21DLE9BQU9wRixJQUFQLENBQVksS0FBSzZULE9BQWpCLEVBQTBCMVIsTUFBMUIsRUFBa0NhLEtBQWxDLEVBQXlDQyxHQUF6QyxDQUFQO0FBQ0E7QUFYRjtBQUFBO0FBQUEsNkJBYVk7QUFDVixpQkFBVyxLQUFLZ00sUUFBTCxHQUFnQixLQUFLQSxRQUFMLEdBQWMsR0FBOUIsR0FBb0MsRUFBL0MsSUFBb0QsS0FBSzRFLE9BQXpELFVBQW9FLEtBQUtMLFFBQUwsR0FBZ0IsR0FBaEIsR0FBc0IsRUFBMUY7QUFDQTtBQWZGOztBQUFBO0FBQUEsRUFBcUMxUCxJQUFyQzs7QUFtQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBQSxLQUFLOEssUUFBTDtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsd0JBQ094SixNQURQLEVBQ2VqRCxNQURmLEVBQzhDO0FBQUEsT0FBdkJhLEtBQXVCLHVFQUFmLENBQWU7QUFBQSxPQUFaQyxHQUFZO0FBQUEsT0FBUEMsS0FBTzs7QUFDNUM7QUFDQSxPQUFJLEtBQUtxTCxRQUFULEVBQW1CO0FBQ2xCO0FBQ0EsUUFBSW5KLE9BQU9wRixJQUFQLENBQVksS0FBS3VPLFFBQWpCLEVBQTJCcE0sTUFBM0IsRUFBbUNhLEtBQW5DLE1BQThDLEtBQWxELEVBQXlELE9BQU9OLFNBQVA7QUFDekQ7O0FBRUQ7QUFDQSxPQUFJLEtBQUs0TCxhQUFULEVBQXdCO0FBQ3ZCO0FBQ0EsUUFBSXBMLFNBQVNBLE1BQU00USxRQUFOLENBQWUsSUFBZixDQUFiLEVBQW1DLE9BQU9wUixTQUFQOztBQUVuQztBQUNBUSxZQUFRQSxRQUFRQSxNQUFNSyxNQUFOLEVBQVIsR0FBeUIsRUFBakM7QUFDQUwsVUFBTTJOLElBQU4sQ0FBVyxJQUFYOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVELE9BQUk3RCxVQUFVLEVBQWQ7QUFDQSxPQUFJQyxZQUFZakssS0FBaEI7QUFDQSxPQUFJbU8sUUFBUSxDQUFaO0FBQUEsT0FBZS9OLE9BQU9WLFNBQXRCO0FBQ0EsVUFBT1UsT0FBTyxLQUFLQyxLQUFMLENBQVc4TixPQUFYLENBQWQsRUFBbUM7QUFDbEMsUUFBSWpDLFFBQVE5TCxLQUFLTixLQUFMLENBQVdzQyxNQUFYLEVBQW1CakQsTUFBbkIsRUFBMkI4SyxTQUEzQixFQUFzQ2hLLEdBQXRDLEVBQTJDQyxLQUEzQyxDQUFaO0FBQ0EsUUFBSSxDQUFDZ00sS0FBRCxJQUFVLENBQUM5TCxLQUFLb1EsUUFBcEIsRUFBOEIsT0FBTzlRLFNBQVA7QUFDOUIsUUFBSXdNLEtBQUosRUFBVztBQUNWbEMsYUFBUTZELElBQVIsQ0FBYTNCLEtBQWI7QUFDQWpDLGlCQUFZaUMsTUFBTWpDLFNBQWxCO0FBQ0E7QUFDRDtBQUNEO0FBQ0EsVUFBTyxLQUFLRixLQUFMLENBQVc7QUFDakJDLG9CQURpQjtBQUVqQkM7QUFGaUIsSUFBWCxDQUFQO0FBSUE7O0FBR0Y7QUFDQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBL0NEO0FBQUE7OztBQW1GQztBQW5GRCw2QkFvRlk7QUFDVCxPQUFNNUosUUFBUSxLQUFLQSxLQUFMLENBQVdvQixHQUFYLENBQWU7QUFBQSxXQUFRckIsS0FBSzJRLFFBQUwsRUFBUjtBQUFBLElBQWYsQ0FBZDtBQUNELGVBQVUsS0FBSzFRLEtBQUwsQ0FBV3dJLElBQVgsQ0FBZ0IsR0FBaEIsQ0FBVixJQUFpQyxLQUFLMkgsUUFBTCxHQUFnQixHQUFoQixHQUFzQixFQUF2RDtBQUNBO0FBdkZGO0FBQUE7QUFBQSxzQkFnRGU7QUFDYixPQUFJLENBQUMsS0FBS3hHLE9BQVYsRUFBbUIsT0FBT3RLLFNBQVA7QUFDbkIsT0FBSXVMLFVBQVUrRixXQUFXLEVBQVgsRUFBZSxLQUFLaEgsT0FBcEIsQ0FBZDtBQUNBLE9BQUksS0FBS2lILE9BQVQsRUFBa0JoRyxRQUFRZ0csT0FBUixHQUFrQixLQUFLQSxPQUF2QjtBQUNsQixVQUFPaEcsT0FBUDs7QUFFRSxZQUFTK0YsVUFBVCxDQUFvQi9GLE9BQXBCLEVBQTZCakIsT0FBN0IsRUFBc0M7QUFDcEMsUUFBSW1FLFFBQVEsQ0FBWjtBQUFBLFFBQWVqQyxRQUFReE0sU0FBdkI7QUFDQSxXQUFPd00sUUFBUWxDLFFBQVFtRSxPQUFSLENBQWYsRUFBaUM7QUFDL0IsU0FBSWpDLE1BQU1nRixPQUFWLEVBQW1CO0FBQ2pCRixpQkFBVy9GLE9BQVgsRUFBb0JpQixNQUFNbEMsT0FBMUI7QUFDRCxNQUZELE1BR0s7QUFDSCxVQUFNbUgsYUFBYWpGLE1BQU1ELFFBQU4sSUFBa0JDLE1BQU1sTyxLQUF4QixJQUFpQ2tPLE1BQU03SyxJQUExRDtBQUNBLFVBQU0rUCxZQUFZLE1BQU1ELFVBQXhCO0FBQ0EsVUFBTVQsU0FBU3hFLE1BQU1uTSxRQUFOLEVBQWY7QUFDQTtBQUNBLFVBQUlxUixhQUFhbkcsT0FBakIsRUFBMEI7QUFDeEIsV0FBSSxDQUFDeEssTUFBTUMsT0FBTixDQUFjdUssUUFBUW1HLFNBQVIsQ0FBZCxDQUFMLEVBQXdDO0FBQ3RDbkcsZ0JBQVFtRyxTQUFSLElBQXFCLENBQUNuRyxRQUFRbUcsU0FBUixDQUFELENBQXJCO0FBQ0FuRyxnQkFBUWtHLFVBQVIsSUFBc0IsQ0FBQ2xHLFFBQVFrRyxVQUFSLENBQUQsQ0FBdEI7QUFDRDtBQUNEbEcsZUFBUW1HLFNBQVIsRUFBbUJ2RCxJQUFuQixDQUF3QjNCLEtBQXhCO0FBQ0FqQixlQUFRa0csVUFBUixFQUFvQnRELElBQXBCLENBQXlCNkMsTUFBekI7QUFDRCxPQVBELE1BUUs7QUFDSHpGLGVBQVFtRyxTQUFSLElBQXFCbEYsS0FBckI7QUFDQWpCLGVBQVFrRyxVQUFSLElBQXNCVCxNQUF0QjtBQUNEO0FBQ0Y7QUFDRjtBQUNELFdBQU96RixPQUFQO0FBQ0Q7QUFDSDtBQWpGRjs7QUFBQTtBQUFBLEVBQXVDbkssSUFBdkM7O0FBNEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FBLEtBQUtDLFlBQUw7QUFBQTs7QUFDQyx5QkFBc0I7QUFBQTs7QUFBQTs7QUFBQSxxQ0FBUEssS0FBTztBQUFQQSxRQUFPO0FBQUE7O0FBQUEsd0pBQ1pBLEtBRFk7O0FBRXJCLE1BQUksQ0FBQyxPQUFLZixLQUFWLEVBQWlCLE9BQUtBLEtBQUwsR0FBYSxFQUFiO0FBRkk7QUFHckI7O0FBRUQ7QUFDQTtBQUNBOzs7QUFSRDtBQUFBO0FBQUEsdUJBU00rQixNQVROLEVBU2NqRCxNQVRkLEVBU3NDO0FBQUEsT0FBaEJhLEtBQWdCLHVFQUFSLENBQVE7QUFBQSxPQUFMQyxHQUFLOztBQUNwQyxPQUFJa08sUUFBUSxDQUFaO0FBQUEsT0FBZS9OLE9BQU9WLFNBQXRCO0FBQ0EsVUFBT1UsT0FBTyxLQUFLQyxLQUFMLENBQVc4TixPQUFYLENBQWQsRUFBbUM7QUFDbEMsUUFBSS9OLEtBQUtwRCxJQUFMLENBQVVvRixNQUFWLEVBQWtCakQsTUFBbEIsRUFBMEJhLEtBQTFCLEVBQWlDQyxHQUFqQyxDQUFKLEVBQTJDLE9BQU8sSUFBUDtBQUMzQztBQUNELFVBQU8sS0FBUDtBQUNBOztBQUVEOztBQWpCRDtBQUFBO0FBQUEsd0JBa0JPbUMsTUFsQlAsRUFrQmVqRCxNQWxCZixFQWtCOEM7QUFBQSxPQUF2QmEsS0FBdUIsdUVBQWYsQ0FBZTtBQUFBLE9BQVpDLEdBQVk7QUFBQSxPQUFQQyxLQUFPOztBQUM1QyxPQUFJbVIsVUFBVSxFQUFkO0FBQ0EsT0FBSWxELFFBQVEsQ0FBWjtBQUFBLE9BQWUvTixPQUFPVixTQUF0QjtBQUNBLFVBQU9VLE9BQU8sS0FBS0MsS0FBTCxDQUFXOE4sT0FBWCxDQUFkLEVBQW1DO0FBQ2xDLFFBQUlqQyxRQUFROUwsS0FBS04sS0FBTCxDQUFXc0MsTUFBWCxFQUFtQmpELE1BQW5CLEVBQTJCYSxLQUEzQixFQUFrQ0MsR0FBbEMsRUFBdUNDLEtBQXZDLENBQVo7QUFDQSxRQUFJZ00sS0FBSixFQUFXbUYsUUFBUXhELElBQVIsQ0FBYTNCLEtBQWI7QUFDWDs7QUFFRCxPQUFJLENBQUNtRixRQUFRclMsTUFBYixFQUFxQixPQUFPVSxTQUFQOztBQUVyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFJNFIsWUFBYUQsUUFBUXJTLE1BQVIsS0FBbUIsQ0FBbkIsR0FBdUJxUyxRQUFRLENBQVIsQ0FBdkIsR0FBb0MsS0FBS0UsWUFBTCxDQUFrQkYsT0FBbEIsQ0FBckQ7O0FBRUE7QUFDQSxPQUFJLEtBQUtwRixRQUFULEVBQW1CcUYsVUFBVXJGLFFBQVYsR0FBcUIsS0FBS0EsUUFBMUIsQ0FBbkIsS0FDSyxJQUFJLEtBQUtqTyxLQUFULEVBQWdCc1QsVUFBVXRULEtBQVYsR0FBa0IsS0FBS0EsS0FBdkI7QUFDdkI7O0FBRUUsVUFBT3NULFNBQVA7QUFDQTs7QUFFRDtBQUNBO0FBQ0E7O0FBN0NEO0FBQUE7QUFBQSwrQkE4Q2NELE9BOUNkLEVBOEN1QjtBQUNyQixVQUFPQSxRQUFRclEsTUFBUixDQUFlLFVBQVV3USxJQUFWLEVBQWdCQyxPQUFoQixFQUF5QjtBQUM5QyxRQUFJQSxRQUFReEgsU0FBUixHQUFvQnVILEtBQUt2SCxTQUE3QixFQUF3QyxPQUFPd0gsT0FBUDtBQUN4QyxXQUFPRCxJQUFQO0FBQ0EsSUFITSxFQUdKSCxRQUFRLENBQVIsQ0FISSxDQUFQO0FBSUE7QUFuREY7QUFBQTtBQUFBLDRCQXFEa0I7QUFBQTs7QUFDaEIsa0JBQUtoUixLQUFMLEVBQVd3TixJQUFYO0FBQ0E7QUF2REY7QUFBQTtBQUFBLDZCQXlEWTtBQUNULE9BQU14TixRQUFRLEtBQUtBLEtBQUwsQ0FBV29CLEdBQVgsQ0FBZTtBQUFBLFdBQVFyQixLQUFLMlEsUUFBTCxFQUFSO0FBQUEsSUFBZixFQUF3Q2xJLElBQXhDLENBQTZDLEdBQTdDLENBQWQ7QUFDRCxpQkFBVyxLQUFLb0QsUUFBTCxHQUFnQixLQUFLQSxRQUFMLEdBQWMsR0FBOUIsR0FBb0MsRUFBL0MsSUFBb0Q1TCxLQUFwRCxVQUE2RCxLQUFLbVEsUUFBTCxHQUFnQixHQUFoQixHQUFzQixFQUFuRjtBQUNBO0FBNURGOztBQUFBO0FBQUEsRUFBK0MxUCxJQUEvQzs7QUFnRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FBLEtBQUs0USxNQUFMO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSx3QkFDT3RQLE1BRFAsRUFDZWpELE1BRGYsRUFDOEM7QUFBQSxPQUF2QmEsS0FBdUIsdUVBQWYsQ0FBZTtBQUFBLE9BQVpDLEdBQVk7QUFBQSxPQUFQQyxLQUFPOztBQUM1QyxPQUFJOEosVUFBVSxFQUFkO0FBQ0EsT0FBSUMsWUFBWWpLLEtBQWhCO0FBQ0EsVUFBTyxJQUFQLEVBQWE7QUFDWixRQUFJa00sUUFBUSxLQUFLeUYsTUFBTCxDQUFZN1IsS0FBWixDQUFrQnNDLE1BQWxCLEVBQTBCakQsTUFBMUIsRUFBa0M4SyxTQUFsQyxFQUE2Q2hLLEdBQTdDLEVBQWtEQyxLQUFsRCxDQUFaO0FBQ0EsUUFBSSxDQUFDZ00sS0FBTCxFQUFZOztBQUVabEMsWUFBUTZELElBQVIsQ0FBYTNCLEtBQWI7QUFDQWpDLGdCQUFZaUMsTUFBTWpDLFNBQWxCO0FBQ0E7O0FBRUQsT0FBSUQsUUFBUWhMLE1BQVIsS0FBbUIsQ0FBdkIsRUFBMEIsT0FBT1UsU0FBUDs7QUFFMUIsVUFBTyxLQUFLcUssS0FBTCxDQUFXO0FBQ2pCQyxvQkFEaUI7QUFFakJDO0FBRmlCLElBQVgsQ0FBUDtBQUlBO0FBbEJGO0FBQUE7QUFBQSw2QkFvQlk7QUFDVixPQUFJLENBQUMsS0FBS0QsT0FBVixFQUFtQixPQUFPdEssU0FBUDtBQUNuQixVQUFPLEtBQUtzSyxPQUFMLENBQWF2SSxHQUFiLENBQWlCO0FBQUEsV0FBU3lLLE1BQU1uTSxRQUFOLEVBQVQ7QUFBQSxJQUFqQixDQUFQO0FBQ0E7QUF2QkY7QUFBQTtBQUFBLDZCQXlCWTtBQUNWLE9BQUk2UixpQkFBa0IsS0FBS0QsTUFBTCxZQUF1QjdRLEtBQUs4SyxRQUE3QixJQUNiLEtBQUsrRixNQUFMLFlBQXVCN1EsS0FBS21QLFFBQTVCLElBQXdDLEtBQUswQixNQUFMLENBQVlsRyxRQUFaLENBQXFCek0sTUFBckIsR0FBOEIsQ0FEOUU7QUFFRSxPQUFNMlMsU0FBUyxLQUFLQSxNQUFMLENBQVlaLFFBQVosRUFBZjtBQUNGLE9BQU0zUSxPQUFPd1IsdUJBQXFCRCxNQUFyQixjQUFvQ0EsTUFBakQ7QUFDQSxlQUFVdlIsSUFBVixJQUFpQixLQUFLb1EsUUFBTCxHQUFnQixHQUFoQixHQUFzQixHQUF2QztBQUNBO0FBL0JGOztBQUFBO0FBQUEsRUFBbUMxUCxJQUFuQzs7QUFtQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FBLEtBQUt3TSxJQUFMO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSx3QkFDT2xMLE1BRFAsRUFDZWpELE1BRGYsRUFDOEM7QUFBQSxPQUF2QmEsS0FBdUIsdUVBQWYsQ0FBZTtBQUFBLE9BQVpDLEdBQVk7QUFBQSxPQUFQQyxLQUFPOztBQUM1QztBQUNGO0FBQ0UsUUFBS21NLElBQUwsQ0FBVW1FLFFBQVYsR0FBcUIsSUFBckI7QUFDQSxRQUFLcUIsU0FBTCxDQUFlckIsUUFBZixHQUEwQixJQUExQjs7QUFFQSxPQUFJeEcsVUFBVSxFQUFkO0FBQ0EsT0FBSUMsWUFBWWpLLEtBQWhCO0FBQ0EsVUFBTyxJQUFQLEVBQWE7QUFDWjtBQUNBLFFBQUlxTSxPQUFPLEtBQUtBLElBQUwsQ0FBVXZNLEtBQVYsQ0FBZ0JzQyxNQUFoQixFQUF3QmpELE1BQXhCLEVBQWdDOEssU0FBaEMsRUFBMkNoSyxHQUEzQyxFQUFnREMsS0FBaEQsQ0FBWDtBQUNBLFFBQUksQ0FBQ21NLElBQUwsRUFBVzs7QUFFWHJDLFlBQVE2RCxJQUFSLENBQWF4QixJQUFiO0FBQ0FwQyxnQkFBWW9DLEtBQUtwQyxTQUFqQjs7QUFFQTtBQUNBLFFBQUk0SCxZQUFZLEtBQUtBLFNBQUwsQ0FBZS9SLEtBQWYsQ0FBcUJzQyxNQUFyQixFQUE2QmpELE1BQTdCLEVBQXFDOEssU0FBckMsRUFBZ0RoSyxHQUFoRCxFQUFxREMsS0FBckQsQ0FBaEI7QUFDQSxRQUFJLENBQUMyUixTQUFMLEVBQWdCO0FBQ2hCNUgsZ0JBQVk0SCxVQUFVNUgsU0FBdEI7QUFDQTs7QUFFRDtBQUNBLE9BQUlELFFBQVFoTCxNQUFSLEtBQW1CLENBQXZCLEVBQTBCLE9BQU9VLFNBQVA7O0FBRTFCLFVBQU8sS0FBS3FLLEtBQUwsQ0FBVztBQUNqQkMsb0JBRGlCO0FBRWpCQztBQUZpQixJQUFYLENBQVA7QUFJQTs7QUFFRDtBQUNEOztBQWpDQTtBQUFBO0FBQUEsNkJBa0NZO0FBQ1YsT0FBSSxDQUFDLEtBQUtELE9BQVYsRUFBbUIsT0FBTyxFQUFQO0FBQ25CLFVBQU8sS0FBS0EsT0FBTCxDQUFhdkksR0FBYixDQUFrQjtBQUFBLFdBQVN5SyxNQUFNbk0sUUFBTixFQUFUO0FBQUEsSUFBbEIsQ0FBUDtBQUNBO0FBckNGO0FBQUE7QUFBQSw2QkF1Q1k7QUFDVCxPQUFNc00sT0FBTyxLQUFLQSxJQUFMLENBQVUwRSxRQUFWLEVBQWI7QUFDQSxPQUFNYyxZQUFZLEtBQUtBLFNBQUwsQ0FBZWQsUUFBZixFQUFsQjtBQUNELGlCQUFXLEtBQUs5RSxRQUFMLEdBQWdCLEtBQUtBLFFBQUwsR0FBYyxHQUE5QixHQUFvQyxFQUEvQyxJQUFvREksSUFBcEQsU0FBNER3RixTQUE1RCxVQUF5RSxLQUFLckIsUUFBTCxHQUFnQixHQUFoQixHQUFzQixFQUEvRjtBQUNBO0FBM0NGOztBQUFBO0FBQUEsRUFBK0IxUCxJQUEvQjs7QUFnREE7QUFDQTtBQUNBQSxLQUFLMkwsS0FBTDtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOzs7QUFFQztBQUZELDZCQUdZckssTUFIWixFQUdvQm9LLEtBSHBCLEVBR3VDO0FBQUE7O0FBQUEsT0FBWnNGLE1BQVksdUVBQUgsQ0FBRzs7QUFDckMsT0FBSTlILFVBQVUsRUFBZDtBQUNGO0FBQ0V3QyxTQUFNdUYsUUFBTixDQUFlcFIsT0FBZixDQUF1QixVQUFDMEwsSUFBRCxFQUFPOEIsS0FBUCxFQUFpQjtBQUN2QyxRQUFJdk8sZUFBSjtBQUNBLFFBQUl5TSxLQUFLck4sTUFBTCxLQUFnQixDQUFwQixFQUF1QjtBQUN0QmdMLGFBQVE2RCxJQUFSLENBQWEsSUFBSS9NLEtBQUtrUixTQUFULEVBQWI7QUFDQSxLQUZELE1BR0ssSUFBSTNGLGdCQUFnQmpOLG9CQUFVcU4sS0FBOUIsRUFBcUM7QUFDeEM7QUFDRCxTQUFJd0YsT0FBT2pJLFFBQVFBLFFBQVFoTCxNQUFSLEdBQWlCLENBQXpCLENBQVg7QUFDQSxTQUFJaVQsS0FBS0MsVUFBVCxFQUFxQjtBQUNwQkQsV0FBS0MsVUFBTCxDQUFnQjlQLE1BQWhCLEVBQXdCaUssSUFBeEIsRUFBOEJ5RixTQUFTLENBQXZDO0FBQ0E7QUFDRDtBQUhBLFVBSUs7QUFDSixXQUFJdEYsU0FBUSxRQUFLMEYsVUFBTCxDQUFnQjlQLE1BQWhCLEVBQXdCaUssSUFBeEIsRUFBOEJ5RixTQUFTLENBQXZDLENBQVo7QUFDQSxXQUFJdEYsV0FBVTlNLFNBQWQsRUFBeUJzSyxRQUFRNkQsSUFBUixDQUFhckIsTUFBYjtBQUN6QjtBQUNELEtBWEksTUFZQTtBQUNKeEMsZUFBVUEsUUFBUXpKLE1BQVIsQ0FBZSxRQUFLNFIsY0FBTCxDQUFvQi9QLE1BQXBCLEVBQTRCaUssSUFBNUIsQ0FBZixDQUFWO0FBQ0E7QUFDRCxJQXBCRDs7QUFzQkEsVUFBTyxJQUFJdkwsS0FBSzJMLEtBQVQsQ0FBZTtBQUNyQnFGLGtCQURxQjtBQUVyQjlIO0FBRnFCLElBQWYsQ0FBUDtBQUlBOztBQUVEO0FBQ0E7QUFDQTtBQUNBOztBQXJDRDtBQUFBO0FBQUEsaUNBc0NnQjVILE1BdENoQixFQXNDd0JqRCxNQXRDeEIsRUFzQ2dDO0FBQzlCLE9BQUk4TCxVQUFVLEVBQWQ7QUFDQSxPQUFJakwsUUFBUSxDQUFaO0FBQUEsT0FBZUMsTUFBTWQsT0FBT0gsTUFBNUI7QUFDQSxPQUFJME0sa0JBQUo7QUFBQSxPQUFldUYsZ0JBQWY7O0FBRUE7QUFDQSxPQUFJOVIsT0FBT2EsS0FBUCxhQUF5Qlosb0JBQVVnVCxVQUF2QyxFQUFtRHBTOztBQUVuRDtBQUNBLE9BQUliLE9BQU9jLE1BQUksQ0FBWCxhQUF5QmIsb0JBQVUwUCxPQUF2QyxFQUFnRDtBQUMvQ21DLGNBQVU3TyxPQUFPdkMsY0FBUCxDQUFzQixTQUF0QixFQUFpQ1YsTUFBakMsRUFBeUNjLE1BQUksQ0FBN0MsRUFBZ0RBLEdBQWhELEVBQXFEUCxTQUFyRCxFQUFnRSxnQkFBaEUsQ0FBVjtBQUNBO0FBQ0F1TCxZQUFRNEMsSUFBUixDQUFhb0QsT0FBYjtBQUNBaFI7QUFDQTs7QUFFRDtBQUNBeUwsZUFBWXRKLE9BQU92QyxjQUFQLENBQXNCLFdBQXRCLEVBQW1DVixNQUFuQyxFQUEyQ2EsS0FBM0MsRUFBa0RDLEdBQWxELEVBQXVEUCxTQUF2RCxFQUFrRSxnQkFBbEUsQ0FBWjtBQUNBO0FBQ0EsT0FBSSxDQUFDZ00sU0FBRCxJQUFjLENBQUN1RixPQUFuQixFQUE0QjtBQUMzQixRQUFJL0MsUUFBUSxJQUFJcE4sS0FBS3VSLG1CQUFULENBQTZCO0FBQ3hDQyxlQUFVblQsT0FBTzBELEtBQVAsQ0FBYTdDLEtBQWIsRUFBb0JDLEdBQXBCLEVBQXlCNEksSUFBekIsQ0FBOEIsR0FBOUI7QUFEOEIsS0FBN0IsQ0FBWjtBQUdBb0MsWUFBUTRDLElBQVIsQ0FBYUssS0FBYjtBQUNBOztBQUVEO0FBUEEsUUFRSyxJQUFJeEMsYUFBYUEsVUFBVXpCLFNBQVYsS0FBd0JoSyxHQUF6QyxFQUE4QztBQUNsRCxTQUFJaU8sU0FBUSxJQUFJcE4sS0FBS3VSLG1CQUFULENBQTZCO0FBQ3hDRSxjQUFTcFQsT0FBTzBELEtBQVAsQ0FBYTdDLEtBQWIsRUFBb0IwTCxVQUFVekIsU0FBOUIsRUFBeUNwQixJQUF6QyxDQUE4QyxHQUE5QyxDQUQrQjtBQUV4Q3lKLGdCQUFXblQsT0FBTzBELEtBQVAsQ0FBYTZJLFVBQVV6QixTQUF2QixFQUFrQ2hLLEdBQWxDLEVBQXVDNEksSUFBdkMsQ0FBNEMsR0FBNUM7QUFGNkIsTUFBN0IsQ0FBWjtBQUlBb0MsYUFBUTRDLElBQVIsQ0FBYUssTUFBYjtBQUNBOztBQUVEO0FBUkssU0FTQSxJQUFJeEMsU0FBSixFQUFlO0FBQ25CVCxjQUFRNEMsSUFBUixDQUFhbkMsU0FBYjtBQUNBOztBQUVELFVBQU9ULE9BQVA7QUFDQTs7QUFFRDs7QUFqRkQ7QUFBQTtBQUFBLGtDQWtGcUM7QUFBQSxPQUF0QnVCLEtBQXNCLHVFQUFkLEtBQUt4QyxPQUFTOztBQUNuQyxPQUFJaUIsVUFBVSxFQUFkO0FBQUEsT0FBa0JTLGtCQUFsQjs7QUFFQSxRQUFLLElBQUk2RSxJQUFJLENBQWIsRUFBZ0JBLElBQUkvRCxNQUFNeE4sTUFBMUIsRUFBa0N1UixHQUFsQyxFQUF1QztBQUN0QyxRQUFJckUsUUFBUU0sTUFBTStELENBQU4sQ0FBWjtBQUNHO0FBQ0EsUUFBSTtBQUNFN0UsaUJBQVlRLE1BQU1uTSxRQUFOLE1BQW9CLEVBQWhDO0FBQ0wsS0FGRCxDQUVFLE9BQU95UyxDQUFQLEVBQVU7QUFDVnpVLGFBQVFtUSxLQUFSLENBQWNzRSxDQUFkO0FBQ0F6VSxhQUFRMEksSUFBUixDQUFhLDBCQUFiLEVBQXlDK0YsS0FBekMsRUFBZ0QsWUFBaEQsRUFBOEROLEtBQTlEO0FBQ0Q7QUFDRDtBQUNILFFBQUksMEJBQWFSLFNBQWIsQ0FBSixFQUE2QjtBQUM1QlQsYUFBUTRDLElBQVIsQ0FBYSxFQUFiO0FBQ0EsS0FGRCxNQUdLLElBQUlwTixNQUFNQyxPQUFOLENBQWNnTCxTQUFkLENBQUosRUFBOEI7QUFDbENULGVBQVVBLFFBQVExSyxNQUFSLENBQWVtTCxTQUFmLENBQVY7QUFDQSxLQUZJLE1BR0EsSUFBSSxPQUFPQSxTQUFQLEtBQXFCLFFBQXpCLEVBQW1DO0FBQ3ZDQSxpQkFBWUEsVUFBVS9DLEtBQVYsQ0FBZ0IsSUFBaEIsQ0FBWjtBQUNBc0MsZUFBVUEsUUFBUTFLLE1BQVIsQ0FBZW1MLFNBQWYsQ0FBVjtBQUNBLEtBSEksTUFJQTtBQUNKM04sYUFBUTBJLElBQVIsQ0FBYSxrREFBYixFQUFpRWlGLFNBQWpFLEVBQTRFLGdCQUE1RSxFQUE4RlEsS0FBOUY7QUFDQTtBQUNEO0FBQ0QsT0FBSSxLQUFLNEYsTUFBTCxLQUFnQixDQUFwQixFQUF1QjtBQUN0QixXQUFPLE9BQU83RyxRQUFRcEMsSUFBUixDQUFhLE1BQWIsQ0FBZDtBQUNBO0FBQ0QsVUFBT29DLFFBQVFwQyxJQUFSLENBQWEsSUFBYixDQUFQO0FBQ0E7QUFqSEY7QUFBQTtBQUFBLDZCQW1IWTtBQUNWLFVBQU8sUUFBUSxLQUFLNEosYUFBTCxFQUFSLEdBQStCLElBQS9CLEdBQXNDLEdBQTdDO0FBQ0E7O0FBRUQ7QUFDQTs7QUF4SEQ7QUFBQTtBQUFBLGdDQXlIZTtBQUFBLGtCQUNnQyxLQUFLeEgsT0FEckM7QUFBQSxPQUNBNUosSUFEQSxZQUNQcVIsS0FETztBQUFBLE9BQ2tCbEYsU0FEbEIsWUFDTW1GLFVBRE47O0FBRWIsT0FBSW5HLFFBQVMsS0FBS0EsS0FBTCxJQUFjLEtBQUtBLEtBQUwsQ0FBV3hDLE9BQTFCLElBQXNDLEVBQWxEOztBQUVBLE9BQUk0SSxRQUFRLEVBQVo7QUFDQSxPQUFJblUsYUFBYSxFQUFqQjtBQUNBLE9BQUlvVSxVQUFVLEVBQWQ7QUFDQSxPQUFJQyxRQUFRLEVBQVo7QUFDQXRHLFNBQU0vSyxHQUFOLENBQVU7QUFBQSxXQUFhaUssVUFBVXFILFdBQVYsRUFBYjtBQUFBLElBQVYsRUFDR3pULE1BREgsQ0FDVWdLLE9BRFYsRUFFRzNJLE9BRkgsQ0FFV3FTLFlBRlg7O0FBSUEsVUFBTztBQUNOOUYsVUFBTSxTQURBO0FBRU43TCxjQUZNO0FBR05tTSx3QkFITTtBQUlOb0YsZ0JBSk07QUFLTm5VLDBCQUxNO0FBTU5vVSxvQkFOTTtBQU9OQztBQVBNLElBQVA7O0FBVUEsWUFBU0UsWUFBVCxDQUFzQnpGLFNBQXRCLEVBQWlDO0FBQ2hDO0FBQ0EsUUFBSTlNLE1BQU1DLE9BQU4sQ0FBYzZNLFNBQWQsQ0FBSixFQUE4QixPQUFPQSxVQUFVNU0sT0FBVixDQUFrQnFTLFlBQWxCLENBQVA7O0FBRTlCO0FBQ0EsUUFBSXpGLFVBQVVsTSxJQUFkLEVBQW9CdVIsTUFBTXJGLFVBQVVsTSxJQUFoQixJQUF3QmtNLFNBQXhCOztBQUVwQjtBQUNBLFFBQUlBLFVBQVVMLElBQVYsS0FBbUIsVUFBdkIsRUFBbUMyRixRQUFRaEYsSUFBUixDQUFhTixTQUFiLEVBQW5DLEtBQ0ssSUFBSUEsVUFBVUwsSUFBVixLQUFtQixVQUF2QixFQUFtQ3pPLFdBQVdvUCxJQUFYLENBQWdCTixTQUFoQixFQUFuQyxLQUNBdUYsTUFBTWpGLElBQU4sQ0FBV04sU0FBWDtBQUNMO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQztBQUNEOztBQWxLRDtBQUFBO0FBQUEsc0NBbUttQztBQUNqQyxPQUFJcEMsYUFBYSxFQUFqQjs7QUFEaUMsc0NBQU5oTixJQUFNO0FBQU5BLFFBQU07QUFBQTs7QUFFakMsUUFBSyxJQUFJb1MsSUFBSSxDQUFiLEVBQWdCQSxJQUFJcFMsS0FBS2EsTUFBekIsRUFBaUN1UixHQUFqQyxFQUFzQztBQUNyQyxRQUFJbEgsTUFBTWxMLEtBQUtvUyxDQUFMLENBQVY7QUFDQSxRQUFJOVAsTUFBTUMsT0FBTixDQUFjMkksR0FBZCxDQUFKLEVBQXdCO0FBQ3ZCOEIsa0JBQWFBLFdBQVc1SyxNQUFYLENBQWtCOEksR0FBbEIsQ0FBYjtBQUNBLEtBRkQsTUFHSyxJQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFuQixFQUE2QjtBQUNqQzhCLGdCQUFXMEMsSUFBWCxDQUFnQnhFLEdBQWhCO0FBQ0E7QUFDRDtBQUNEOEIsZ0JBQWFBLFdBQVd0QyxJQUFYLENBQWdCLElBQWhCLENBQWI7O0FBRUEsT0FBSSxDQUFDc0MsVUFBTCxFQUFpQixPQUFPLElBQVA7QUFDakIsT0FBSSxDQUFDQSxXQUFXMkYsUUFBWCxDQUFvQixJQUFwQixDQUFELElBQThCM0YsV0FBV25NLE1BQVgsR0FBb0IsRUFBdEQsRUFBMEQ7QUFDekQsa0JBQVltTSxXQUFXVixJQUFYLEVBQVo7QUFDQTtBQUNELE9BQUlVLFdBQVcsQ0FBWCxNQUFrQixJQUF0QixFQUE0QkEsb0JBQWtCQSxVQUFsQjtBQUM1QixrQkFBYUEsVUFBYjtBQUNBOztBQUVBOztBQXhMRjtBQUFBO0FBQUEsbUNBeUx5Qk8sU0F6THpCLEVBeUxvQ3VILFNBekxwQyxFQXlMK0M7QUFDN0MsT0FBSSxDQUFDdkgsU0FBTCxFQUFnQixPQUFPLElBQVA7QUFDaEIsT0FBSSxDQUFDdUgsU0FBRCxJQUFjLENBQUN2SCxVQUFVb0YsUUFBVixDQUFtQixJQUFuQixDQUFmLElBQTJDcEYsVUFBVTFNLE1BQVYsR0FBbUIsRUFBbEUsRUFBc0U7QUFDckUsa0JBQVkwTSxVQUFVakIsSUFBVixFQUFaO0FBQ0E7QUFDRCxPQUFJaUIsVUFBVSxDQUFWLE1BQWlCLElBQXJCLEVBQTJCQSxtQkFBaUJBLFNBQWpCO0FBQzNCLGtCQUFhQSxTQUFiO0FBQ0E7QUFoTUY7O0FBQUE7QUFBQSxFQUFpQzVLLEtBQUs4SyxRQUF0Qzs7QUFxTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTlLLEtBQUsrTixVQUFMO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7OztBQUVDO0FBRkQsd0JBR096TSxNQUhQLEVBR2VqRCxNQUhmLEVBRzhEO0FBQUEsT0FBdkNhLEtBQXVDLHVFQUEvQixDQUErQjtBQUFBLE9BQTVCQyxHQUE0Qix1RUFBdEJkLE9BQU9ILE1BQWU7QUFBQSxPQUFQa0IsS0FBTzs7QUFDNUQsT0FBSXNNLFFBQVFwTixvQkFBVThULGVBQVYsQ0FBMEIvVCxNQUExQixFQUFrQ2EsS0FBbEMsRUFBeUNDLEdBQXpDLENBQVo7O0FBRUEsT0FBSStKLFVBQVUsS0FBS2tJLFVBQUwsQ0FBZ0I5UCxNQUFoQixFQUF3Qm9LLEtBQXhCLENBQWQ7QUFDQSxPQUFJLENBQUN4QyxPQUFMLEVBQWMsT0FBT3RLLFNBQVA7O0FBRWQsVUFBTyxLQUFLcUssS0FBTCxDQUFXO0FBQ2pCQyxvQkFEaUI7QUFFakJDLGVBQVdoSztBQUZNLElBQVgsQ0FBUDtBQUlBOztBQUVEOztBQWZEO0FBQUE7QUFBQSw2QkFnQlk7QUFDVixVQUFPLEtBQUsrSixPQUFMLENBQWF5SSxhQUFiLEVBQVA7QUFDQTtBQWxCRjs7QUFBQTtBQUFBLEVBQTJDM1IsS0FBSzJMLEtBQWhEOztBQXNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTNMLEtBQUtzSyxjQUFMO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7OztBQUVDO0FBQ0E7QUFIRCwrQkFJYztBQUNYLE9BQUksQ0FBQyxLQUFLcEIsT0FBVixFQUFtQixNQUFNLElBQUlsTSxVQUFKLEVBQWtCLEtBQUt1RCxJQUFMLElBQVcsZ0JBQTdCLGlDQUFOO0FBQ25CLE9BQU1tTCxzSUFBNEJ6TixTQUE1QixDQUFOO0FBQ0EsT0FBSSxDQUFDeU4sS0FBTCxFQUFZO0FBQ1pBLFNBQU1QLFFBQU4sR0FBaUIsT0FBakI7QUFDQSxRQUFLakMsT0FBTCxDQUFhNkQsSUFBYixDQUFrQnJCLEtBQWxCO0FBQ0Q7O0FBRUE7O0FBWkY7QUFBQTtBQUFBLHNCQWFnQjtBQUNaLE9BQU12Qix3SEFBTjtBQUNBLE9BQUksQ0FBQ0EsT0FBTCxFQUFjLE9BQU9BLE9BQVA7O0FBRWQ7QUFDQSxPQUFJQSxRQUFRdUIsS0FBWixFQUFtQjtBQUNqQnZCLFlBQVFrSSxXQUFSLEdBQXNCbEksUUFBUW1JLE1BQTlCO0FBQ0FuSSxZQUFRRSxVQUFSLEdBQXFCRixRQUFRdUIsS0FBN0I7QUFDRDtBQUNEO0FBSkEsUUFLSztBQUNIdkIsYUFBUWtJLFdBQVIsR0FBc0JsSSxRQUFRb0ksVUFBOUI7QUFDQXBJLGFBQVFFLFVBQVIsR0FBcUJySyxLQUFLMkwsS0FBTCxDQUFXNkcsZ0JBQVgsQ0FBNEJySSxRQUFRUyxTQUFwQyxDQUFyQjtBQUNEO0FBQ0QsVUFBT1QsT0FBUDtBQUNEO0FBNUJIOztBQUFBO0FBQUEsRUFBb0RuSyxLQUFLMkwsS0FBekQ7O0FBZ0NBO0FBQ0EzTCxLQUFLa1IsU0FBTDtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsNkJBQ1k7QUFDVixVQUFPLElBQVA7QUFDQTtBQUhGOztBQUFBO0FBQUEsRUFBMENsUixJQUExQzs7QUFNQTtBQUNBQSxLQUFLZ08sT0FBTDtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUNDO0FBREQsd0JBRU8xTSxNQUZQLEVBRWVqRCxNQUZmLEVBRThDO0FBQUEsT0FBdkJhLEtBQXVCLHVFQUFmLENBQWU7QUFBQSxPQUFaQyxHQUFZO0FBQUEsT0FBUEMsS0FBTzs7QUFDNUMsT0FBSVYsUUFBUUwsT0FBT2EsS0FBUCxDQUFaO0FBQ0EsT0FBSSxFQUFFUixpQkFBaUJKLG9CQUFVMFAsT0FBN0IsQ0FBSixFQUEyQyxPQUFPcFAsU0FBUDtBQUMzQyxVQUFPLEtBQUtxSyxLQUFMLENBQVc7QUFDakJDLGFBQVN4SyxLQURRO0FBRWpCeUssZUFBV2pLLFFBQVE7QUFGRixJQUFYLENBQVA7QUFJQTtBQVRGO0FBQUE7QUFBQSw2QkFXWTtBQUNWLGlCQUFZLEtBQUtnSyxPQUFMLENBQWF1SixVQUF6QixHQUFzQyxLQUFLdkosT0FBTCxDQUFhaUgsT0FBbkQ7QUFDQTtBQWJGOztBQUFBO0FBQUEsRUFBcUNuUSxJQUFyQzs7QUFnQkE7QUFDQUEsS0FBS3VSLG1CQUFMO0FBQUE7O0FBQ0Msd0JBQXNCO0FBQUE7O0FBQUE7O0FBQUEscUNBQVBqUixLQUFPO0FBQVBBLFFBQU87QUFBQTs7QUFBQSx1SkFDWkEsS0FEWTs7QUFFckIsTUFBSTVDLGlCQUFPdUUsSUFBWCxFQUFpQmhGLFFBQVEwSSxJQUFSLENBQWEsUUFBSytNLE9BQWxCO0FBRkk7QUFHckI7O0FBSkY7QUFBQTtBQUFBLDZCQWVZO0FBQ1YsVUFBTyxRQUFRLEtBQUtBLE9BQUwsQ0FBYTdLLEtBQWIsQ0FBbUIsSUFBbkIsRUFBeUJFLElBQXpCLENBQThCLE9BQTlCLENBQWY7QUFDQTtBQWpCRjtBQUFBO0FBQUEsc0JBTWU7QUFDYixPQUFJLEtBQUswSixNQUFULEVBQWlCO0FBQ2hCLFdBQU8sa0NBQ0gsaUJBREcsR0FDZ0IsS0FBS0EsTUFEckIsR0FDOEIsS0FEOUIsR0FFSCxpQkFGRyxHQUVnQixLQUFLRCxRQUZyQixHQUVnQyxHQUZ2QztBQUdBO0FBQ0QsVUFBTyw2QkFBNkIsS0FBS0EsUUFBbEMsR0FBNkMsR0FBcEQ7QUFDQTtBQWJGOztBQUFBO0FBQUEsRUFBcUR4UixJQUFyRCxFOzs7Ozs7Ozs7Ozs7Ozs7O2tCQzd1QndCMEUsUztRQTZDUmlPLFcsR0FBQUEsVzs7QUFsRWhCOzs7O0FBRUE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNlLFNBQVNqTyxTQUFULENBQW1CeEQsTUFBbkIsRUFBMkJiLFdBQTNCLEVBQXdDO0FBQ3JEO0FBQ0EsTUFBSVYsTUFBTUMsT0FBTixDQUFjc0IsTUFBZCxDQUFKLEVBQTJCO0FBQ3pCO0FBQ0EsV0FBTyx1QkFBUUEsT0FBT1AsR0FBUCxDQUFXO0FBQUEsYUFBVStELFVBQVV4RCxNQUFWLEVBQWtCYixlQUFlLHVCQUFXQSxXQUFYLENBQWpDLENBQVY7QUFBQSxLQUFYLENBQVIsQ0FBUDtBQUNEOztBQUVELE1BQUlkLFFBQVFvVCxZQUFZelIsTUFBWixDQUFaO0FBQ0EsTUFBSTNCLE1BQU1yQixNQUFOLEtBQWlCLENBQXJCLEVBQXdCO0FBQ3RCLFVBQU0sSUFBSTRMLFdBQUosd0JBQXFDOUksTUFBTSxDQUFOLENBQXJDLFVBQWtERSxNQUFsRCx5QkFBTjtBQUNEOztBQUVELE1BQUksQ0FBQ2IsV0FBTCxFQUFrQjtBQUNoQjtBQUNBLFFBQUlkLE1BQU1yQixNQUFOLEtBQWlCLENBQXJCLEVBQXdCLE9BQU9xQixLQUFQOztBQUV4QjtBQUNBLFdBQU8sQ0FBRSxJQUFJUyxlQUFLQyxZQUFULENBQXNCLEVBQUVWLFlBQUYsRUFBdEIsQ0FBRixDQUFQO0FBQ0QsR0FORCxNQU9LO0FBQ0g7QUFDQSxRQUFJYyxZQUFZNUMsU0FBWixZQUFpQ3VDLGVBQUswSyxRQUF0QyxJQUNBckssWUFBWTVDLFNBQVosWUFBaUN1QyxlQUFLcU0sT0FEdEMsSUFFQWhNLFlBQVk1QyxTQUFaLFlBQWlDdUMsZUFBS3dNLElBRnRDLElBR0FuTSxZQUFZNUMsU0FBWixZQUFpQ3VDLGVBQUtDLFlBSDFDLEVBSUU7QUFDQSxXQUFLLElBQUkwSSxRQUFULElBQXFCcEosTUFBTSxDQUFOLENBQXJCLEVBQStCO0FBQzdCekIsZUFBT2dELGNBQVAsQ0FBc0JULFlBQVk1QyxTQUFsQyxFQUE2Q2tMLFFBQTdDLEVBQXVELEVBQUU1SCxPQUFPeEIsTUFBTSxDQUFOLEVBQVNvSixRQUFULENBQVQsRUFBdkQ7QUFDRDtBQUNGLEtBUkQsTUFTSztBQUNIN0ssYUFBT2dELGNBQVAsQ0FBc0JULFlBQVk1QyxTQUFsQyxFQUE2QyxPQUE3QyxFQUFzRCxFQUFFc0QsT0FBT3hCLEtBQVQsRUFBdEQ7QUFDRDs7QUFFRCxXQUFPLENBQUUsSUFBSWMsV0FBSixFQUFGLENBQVA7QUFDRDtBQUNGOztBQUVELFNBQVN1UyxrQkFBVCxDQUE0QjFSLE1BQTVCLEVBQW9DO0FBQ2xDLE1BQU0yUixvQkFBb0IsMENBQTFCO0FBQ0EsTUFBSUMsZUFBZTVSLE9BQU9rSyxLQUFQLENBQWF5SCxpQkFBYixDQUFuQjtBQUNBLE1BQUksQ0FBQ0MsWUFBTCxFQUFtQixNQUFNLElBQUloSixXQUFKLHlDQUFzRDVJLE1BQXRELFFBQU47QUFDbkIsU0FBTzRSLFlBQVA7QUFDRDs7QUFFTSxTQUFTSCxXQUFULENBQXFCelIsTUFBckIsRUFBb0Q7QUFBQSxNQUF2QjNCLEtBQXVCLHVFQUFmLEVBQWU7QUFBQSxNQUFYTCxLQUFXLHVFQUFILENBQUc7O0FBQ3pELE1BQUlnQyxVQUFVLElBQWQsRUFBb0IsTUFBTSxJQUFJVixTQUFKLENBQWMscUNBQWQsQ0FBTjtBQUNwQixNQUFNc1MsZUFBZSxPQUFPNVIsTUFBUCxLQUFrQixRQUFsQixHQUNqQjBSLG1CQUFtQjFSLE1BQW5CLENBRGlCLEdBRWpCQSxNQUZKOztBQUlBLE1BQUlZLFlBQVlnUixhQUFhNVUsTUFBN0I7QUFDQSxTQUFPZ0IsUUFBUTRDLFNBQWYsRUFBMEI7QUFBQSxzQkFDSmlSLFdBQVdELFlBQVgsRUFBeUJ2VCxLQUF6QixFQUFnQ0wsS0FBaEMsQ0FESTtBQUFBO0FBQUEsUUFDbEJJLElBRGtCO0FBQUEsUUFDWkgsR0FEWTs7QUFFeEIsUUFBSUcsSUFBSixFQUFVO0FBQ1IsVUFBSTZSLE9BQU81UixNQUFNQSxNQUFNckIsTUFBTixHQUFhLENBQW5CLENBQVg7QUFDQTtBQUNBLFVBQUlpVCxRQUFRQSxnQkFBZ0JuUixlQUFLcU0sT0FBN0IsSUFBd0MvTSxnQkFBZ0JVLGVBQUtxTSxPQUFqRSxFQUEwRTtBQUN4RTtBQUNBOU0sY0FBTXlULEdBQU47QUFDQTtBQUNBMVQsYUFBS3FMLFFBQUwsR0FBZ0J3RyxLQUFLeEcsUUFBTCxDQUFjbEwsTUFBZCxDQUFxQkgsS0FBS3FMLFFBQTFCLENBQWhCO0FBQ0Q7QUFDRHBMLFlBQU13TixJQUFOLENBQVd6TixJQUFYO0FBQ0Q7QUFDREosWUFBUUMsTUFBTSxDQUFkO0FBQ0Q7QUFDRCxTQUFPSSxLQUFQO0FBQ0Q7O0FBRUQsSUFBTTBULGtCQUFrQixpQkFBeEI7QUFDQSxTQUFTRixVQUFULENBQW9CRCxZQUFwQixFQUF5RDtBQUFBLE1BQXZCdlQsS0FBdUIsdUVBQWYsRUFBZTtBQUFBLE1BQVhMLEtBQVcsdUVBQUgsQ0FBRzs7QUFDdkQsTUFBSWdVLGNBQWNKLGFBQWE1VCxLQUFiLENBQWxCOztBQUVBO0FBQ0E7QUFDQSxNQUFJZ1UsZ0JBQWdCLElBQXBCLEVBQTBCO0FBQ3hCLFdBQU9DLFlBQVlMLFlBQVosRUFBMEJ2VCxLQUExQixFQUFpQ0wsUUFBUSxDQUF6QyxDQUFQO0FBQ0Q7O0FBRUQsVUFBUWdVLFdBQVI7QUFDRSxTQUFLLEdBQUw7QUFBVSxhQUFPRSxhQUFhTixZQUFiLEVBQTJCdlQsS0FBM0IsRUFBa0NMLEtBQWxDLENBQVA7QUFDVixTQUFLLEdBQUw7QUFBVSxhQUFPbVUsa0JBQWtCUCxZQUFsQixFQUFnQ3ZULEtBQWhDLEVBQXVDTCxLQUF2QyxDQUFQO0FBQ1YsU0FBSyxHQUFMO0FBQVUsYUFBT29VLFVBQVVSLFlBQVYsRUFBd0J2VCxLQUF4QixFQUErQkwsS0FBL0IsQ0FBUDtBQUNWLFNBQUssR0FBTDtBQUNBLFNBQUssR0FBTDtBQUNBLFNBQUssR0FBTDtBQUFVLGFBQU9xVSxZQUFZVCxZQUFaLEVBQTBCdlQsS0FBMUIsRUFBaUNMLEtBQWpDLENBQVA7O0FBRVY7QUFDQSxTQUFLLEdBQUw7QUFDQSxTQUFLLEdBQUw7QUFDQSxTQUFLLEdBQUw7QUFDQSxTQUFLLEdBQUw7QUFDRSxZQUFNLElBQUk0SyxXQUFKLGlCQUE4Qm9KLFdBQTlCLHVCQUEyRGhVLEtBQTNELFlBQXVFNFQsWUFBdkUsQ0FBTjs7QUFFRjtBQUNFLFVBQUlJLFlBQVk5SCxLQUFaLENBQWtCNkgsZUFBbEIsQ0FBSixFQUF3QztBQUN0QyxlQUFPTyxhQUFhVixZQUFiLEVBQTJCdlQsS0FBM0IsRUFBa0NMLEtBQWxDLENBQVA7QUFDRCxPQUZELE1BR0s7QUFDSCxlQUFPaVUsWUFBWUwsWUFBWixFQUEwQnZULEtBQTFCLEVBQWlDTCxLQUFqQyxDQUFQO0FBQ0Q7QUFyQkw7QUF1QkQ7O0FBR0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU3NVLFlBQVQsQ0FBc0JWLFlBQXRCLEVBQXdGO0FBQUEsTUFBcER2VCxLQUFvRCx1RUFBNUMsRUFBNEM7QUFBQSxNQUF4Q0wsS0FBd0MsdUVBQWhDLENBQWdDO0FBQUEsTUFBN0JtQixXQUE2Qix1RUFBZkwsZUFBSzBLLFFBQVU7O0FBQ3RGLE1BQUlDLFdBQVcsRUFBZjtBQUFBLE1BQW1CeEwsWUFBbkI7QUFDQTtBQUNBLE9BQUssSUFBSXNRLElBQUl2USxLQUFiLEVBQW9CdVEsSUFBSXFELGFBQWE1VSxNQUFyQyxFQUE2Q3VSLEdBQTdDLEVBQWtEO0FBQ2hELFFBQUlnRSxPQUFPWCxhQUFhckQsQ0FBYixDQUFYO0FBQ0EsUUFBSSxPQUFPZ0UsSUFBUCxLQUFnQixRQUFoQixJQUE0QkEsS0FBS3JJLEtBQUwsQ0FBVzZILGVBQVgsQ0FBaEMsRUFBNkQ7QUFDM0R0SSxlQUFTb0MsSUFBVCxDQUFjMEcsSUFBZDtBQUNBdFUsWUFBTXNRLENBQU47QUFDRCxLQUhELE1BSUs7QUFDTjs7QUFFRCxNQUFJblEsT0FBTyxJQUFJZSxXQUFKLENBQWdCLEVBQUVzSyxrQkFBRixFQUFoQixDQUFYO0FBQ0EsU0FBTyxDQUFFckwsSUFBRixFQUFRSCxHQUFSLENBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxTQUFTZ1UsV0FBVCxDQUFxQkwsWUFBckIsRUFBc0Y7QUFBQSxNQUFuRHZULEtBQW1ELHVFQUEzQyxFQUEyQztBQUFBLE1BQXZDTCxLQUF1Qyx1RUFBL0IsQ0FBK0I7QUFBQSxNQUE1Qm1CLFdBQTRCLHVFQUFkTCxlQUFLcU0sT0FBUzs7QUFDcEYsTUFBSWxRLFNBQVMyVyxhQUFhNVQsS0FBYixDQUFiO0FBQ0EsTUFBSSxDQUFDbUIsV0FBTCxFQUFrQkEsY0FBY0wsZUFBS3FNLE9BQW5COztBQUVsQjtBQUNBLE1BQUlxSCxZQUFZdlgsT0FBT29SLFVBQVAsQ0FBa0IsSUFBbEIsQ0FBaEI7QUFDQSxNQUFJNUMsV0FBVytJLFlBQVl2WCxPQUFPSyxNQUFQLENBQWMsQ0FBZCxDQUFaLEdBQStCTCxNQUE5Qzs7QUFFQSxNQUFJbUQsT0FBTyxJQUFJZSxXQUFKLENBQWdCLEVBQUVzSyxrQkFBRixFQUFoQixDQUFYOztBQUVBLE1BQUkrSSxTQUFKLEVBQWU7QUFDYnBVLFNBQUsyUSxRQUFMLEdBQWdCLFlBQVc7QUFDekIsb0JBQVl0RixRQUFaLElBQXVCLEtBQUsrRSxRQUFMLEdBQWdCLEdBQWhCLEdBQXNCLEVBQTdDO0FBQ0QsS0FGRDtBQUdEOztBQUVELFNBQU8sQ0FBRXBRLElBQUYsRUFBUUosS0FBUixDQUFQO0FBQ0Q7O0FBR0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU21VLGlCQUFULENBQTJCUCxZQUEzQixFQUFnRTtBQUFBLE1BQXZCdlQsS0FBdUIsdUVBQWYsRUFBZTtBQUFBLE1BQVhMLEtBQVcsdUVBQUgsQ0FBRzs7QUFBQSw4QkFDekN4QixpQkFBT2lXLGdCQUFQLENBQXdCYixZQUF4QixFQUFzQyxHQUF0QyxFQUEyQyxHQUEzQyxFQUFnRDVULEtBQWhELENBRHlDO0FBQUEsTUFDeERDLEdBRHdELHlCQUN4REEsR0FEd0Q7QUFBQSxNQUNuRDRDLEtBRG1ELHlCQUNuREEsS0FEbUQ7O0FBRzlEOzs7QUFDQSxNQUFJcU8sVUFBV3JPLE1BQU0sQ0FBTixNQUFhLEdBQWIsSUFBb0JBLE1BQU0sQ0FBTixNQUFhLEdBQWhEO0FBQ0EsTUFBSXFPLE9BQUosRUFBYTtBQUNYck8sWUFBUUEsTUFBTUEsS0FBTixDQUFZLENBQVosQ0FBUjtBQUNEOztBQUVEO0FBQ0EsTUFBSW9KLGlCQUFKO0FBQ0EsTUFBSXBKLE1BQU03RCxNQUFOLEdBQWUsQ0FBZixJQUFvQjZELE1BQU0sQ0FBTixNQUFhLEdBQXJDLEVBQTBDO0FBQ3hDb0osZUFBV3BKLE1BQU0sQ0FBTixDQUFYO0FBQ0FBLFlBQVFBLE1BQU1BLEtBQU4sQ0FBWSxDQUFaLENBQVI7QUFDRDs7QUFFRDtBQUNBLE1BQUk2UixlQUNGQyxrQkFBa0I5UixLQUFsQixFQUNDcEIsR0FERCxDQUNLLFVBQVN6RCxLQUFULEVBQWdCO0FBQ25CLFFBQUlpTixVQUFVd0ksWUFBWXpWLEtBQVosRUFBbUIsRUFBbkIsQ0FBZDtBQUNBLFFBQUlpTixRQUFRak0sTUFBUixLQUFtQixDQUF2QixFQUEwQjtBQUN4QixhQUFPaU0sUUFBUSxDQUFSLENBQVA7QUFDRCxLQUZELE1BR0s7QUFDSCxhQUFPLElBQUluSyxlQUFLOEssUUFBVCxDQUFrQixFQUFFdkwsT0FBTzRLLE9BQVQsRUFBbEIsQ0FBUDtBQUNEO0FBQ0YsR0FURCxDQURGOztBQVlBLE1BQUk3SyxPQUFPc1UsYUFBYTFWLE1BQWIsS0FBd0IsQ0FBeEIsR0FBNEIwVixhQUFhLENBQWIsQ0FBNUIsR0FBOEMsSUFBSTVULGVBQUtDLFlBQVQsQ0FBc0IsRUFBRVYsT0FBT3FVLFlBQVQsRUFBdEIsQ0FBekQ7QUFDQSxNQUFJekksUUFBSixFQUFjN0wsS0FBSzZMLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ2QsTUFBSWlGLE9BQUosRUFBYTlRLEtBQUs4USxPQUFMLEdBQWUsSUFBZjtBQUNiLFNBQU8sQ0FBRTlRLElBQUYsRUFBUUgsR0FBUixDQUFQO0FBQ0Q7O0FBRUQsU0FBUzBVLGlCQUFULENBQTJCeFYsTUFBM0IsRUFBbUM7QUFDakMsTUFBSXVWLGVBQWUsRUFBbkI7QUFDQSxNQUFJakQsVUFBVSxFQUFkO0FBQ0EsT0FBSyxJQUFJbEIsSUFBSSxDQUFSLEVBQVcvUSxLQUFoQixFQUF1QkEsUUFBUUwsT0FBT29SLENBQVAsQ0FBL0IsRUFBMENBLEdBQTFDLEVBQStDO0FBQzdDO0FBQ0EsUUFBSS9RLFVBQVUsR0FBZCxFQUFtQjtBQUNqQmtWLG1CQUFhN0csSUFBYixDQUFrQjRELE9BQWxCO0FBQ0FBLGdCQUFVLEVBQVY7QUFDRDtBQUNEO0FBSkEsU0FLSyxJQUFJalMsVUFBVSxHQUFkLEVBQW1CO0FBQUEscUNBQ1JoQixpQkFBT2lXLGdCQUFQLENBQXdCdFYsTUFBeEIsRUFBZ0MsR0FBaEMsRUFBcUMsR0FBckMsRUFBMENvUixDQUExQyxDQURRO0FBQUEsWUFDaEJ0USxHQURnQiwwQkFDaEJBLEdBRGdCOztBQUV0QndSLGtCQUFVQSxRQUFRbFIsTUFBUixDQUFlcEIsT0FBTzBELEtBQVAsQ0FBYTBOLENBQWIsRUFBZ0J0USxNQUFNLENBQXRCLENBQWYsQ0FBVjtBQUNBc1EsWUFBSXRRLEdBQUo7QUFDRCxPQUpJLE1BS0E7QUFDSHdSLGdCQUFRNUQsSUFBUixDQUFhck8sS0FBYjtBQUNEO0FBQ0Y7QUFDRCxNQUFJaVMsUUFBUXpTLE1BQVosRUFBb0IwVixhQUFhN0csSUFBYixDQUFrQjRELE9BQWxCO0FBQ3BCLFNBQU9pRCxZQUFQO0FBQ0Q7O0FBRUQ7QUFDQSxTQUFTTCxXQUFULENBQXFCVCxZQUFyQixFQUEwRDtBQUFBLE1BQXZCdlQsS0FBdUIsdUVBQWYsRUFBZTtBQUFBLE1BQVhMLEtBQVcsdUVBQUgsQ0FBRzs7QUFDeEQsTUFBSTRVLFNBQVNoQixhQUFhNVQsS0FBYixDQUFiO0FBQ0EsTUFBSUksT0FBT0MsTUFBTUEsTUFBTXJCLE1BQU4sR0FBZSxDQUFyQixDQUFYO0FBQ0EsTUFBSSxDQUFDb0IsSUFBTCxFQUFXLE1BQU0sSUFBSXdLLFdBQUosaUNBQThDZ0ssTUFBOUMscUJBQU47O0FBRVg7QUFDQSxNQUFJQSxXQUFXLEdBQVgsSUFBa0JBLFdBQVcsR0FBakMsRUFBc0M7QUFDcEMsUUFBSTNJLFdBQVc3TCxLQUFLNkwsUUFBcEI7QUFDQTdMLFdBQU8sSUFBSVUsZUFBSzRRLE1BQVQsQ0FBZ0IsRUFBRUMsUUFBUXZSLElBQVYsRUFBaEIsQ0FBUDtBQUNBLFFBQUk2TCxRQUFKLEVBQWM3TCxLQUFLNkwsUUFBTCxHQUFnQkEsUUFBaEI7QUFDZDtBQUNBNUwsVUFBTUEsTUFBTXJCLE1BQU4sR0FBZSxDQUFyQixJQUEwQm9CLElBQTFCO0FBQ0Q7O0FBRUQ7QUFDQSxNQUFJd1UsV0FBVyxHQUFYLElBQWtCQSxXQUFXLEdBQWpDLEVBQXNDO0FBQ3BDeFUsU0FBS29RLFFBQUwsR0FBZ0IsSUFBaEI7QUFDRDs7QUFFRCxTQUFPLENBQUU5USxTQUFGLEVBQWFNLEtBQWIsQ0FBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBLFNBQVNrVSxZQUFULENBQXNCTixZQUF0QixFQUEyRDtBQUFBLE1BQXZCdlQsS0FBdUIsdUVBQWYsRUFBZTtBQUFBLE1BQVhMLEtBQVcsdUVBQUgsQ0FBRzs7QUFDekQsTUFBSWtNLFFBQVExTixpQkFBT2lXLGdCQUFQLENBQXdCYixZQUF4QixFQUFzQyxHQUF0QyxFQUEyQyxHQUEzQyxFQUFnRDVULEtBQWhELENBQVo7QUFDQSxNQUFJaU0saUJBQUo7QUFDQSxNQUFJQyxNQUFNckosS0FBTixDQUFZN0QsTUFBWixLQUF1QixDQUF2QixJQUE0QmtOLE1BQU1ySixLQUFOLENBQVksQ0FBWixNQUFtQixHQUFuRCxFQUF3RDtBQUN0RG9KLGVBQVdDLE1BQU1ySixLQUFOLENBQVksQ0FBWixDQUFYO0FBQ0FxSixVQUFNckosS0FBTixHQUFjcUosTUFBTXJKLEtBQU4sQ0FBWUEsS0FBWixDQUFrQixDQUFsQixDQUFkO0FBQ0Q7QUFDRCxNQUFJcUosTUFBTXJKLEtBQU4sQ0FBWTdELE1BQVosR0FBcUIsQ0FBekIsRUFBNEIsTUFBTSxJQUFJNEwsV0FBSix5REFBc0VzQixNQUFNckosS0FBTixDQUFZZ0csSUFBWixDQUFpQixFQUFqQixDQUF0RSxPQUFOOztBQUU1QixNQUFJZ00sU0FBUyxFQUFFaEUsU0FBUzNFLE1BQU1ySixLQUFOLENBQVksQ0FBWixDQUFYLEVBQWI7O0FBRUE7QUFDQSxNQUFJaVMsZUFBZUQsT0FBT2hFLE9BQVAsQ0FBZXBJLE9BQWYsQ0FBdUIsR0FBdkIsQ0FBbkI7QUFDQSxNQUFJcU0saUJBQWlCLENBQUMsQ0FBdEIsRUFBeUI7QUFDdkJELFdBQU9FLEdBQVAsR0FBYUYsT0FBT2hFLE9BQVAsQ0FBZXZULE1BQWYsQ0FBc0J3WCxlQUFlLENBQXJDLENBQWI7QUFDQUQsV0FBT2hFLE9BQVAsR0FBaUJnRSxPQUFPaEUsT0FBUCxDQUFldlQsTUFBZixDQUFzQixDQUF0QixFQUF5QndYLFlBQXpCLENBQWpCO0FBQ0Q7O0FBRUQsTUFBSTFVLE9BQU8sSUFBSVUsZUFBSzZQLE9BQVQsQ0FBaUJrRSxNQUFqQixDQUFYO0FBQ0EsTUFBSTVJLFFBQUosRUFBYzdMLEtBQUs2TCxRQUFMLEdBQWdCQSxRQUFoQjtBQUNkLFNBQU8sQ0FBRTdMLElBQUYsRUFBUThMLE1BQU1qTSxHQUFkLENBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxTQUFTbVUsU0FBVCxDQUFtQlIsWUFBbkIsRUFBaUY7QUFBQSxNQUFoRHZULEtBQWdELHVFQUF4QyxFQUF3QztBQUFBLE1BQXBDTCxLQUFvQyx1RUFBNUIsQ0FBNEI7QUFBQSxNQUF6Qm1CLFdBQXlCLHVFQUFYTCxlQUFLd00sSUFBTTs7QUFBQSwrQkFDMUQ5TyxpQkFBT2lXLGdCQUFQLENBQXdCYixZQUF4QixFQUFzQyxHQUF0QyxFQUEyQyxHQUEzQyxFQUFnRDVULEtBQWhELENBRDBEO0FBQUEsTUFDekVDLEdBRHlFLDBCQUN6RUEsR0FEeUU7QUFBQSxNQUNwRTRDLEtBRG9FLDBCQUNwRUEsS0FEb0U7O0FBRy9FOzs7QUFDQSxNQUFJb0osaUJBQUo7QUFDQSxNQUFJcEosTUFBTTdELE1BQU4sR0FBZSxDQUFmLElBQW9CNkQsTUFBTSxDQUFOLE1BQWEsR0FBckMsRUFBMEM7QUFDeENvSixlQUFXcEosTUFBTSxDQUFOLENBQVg7QUFDQUEsWUFBUUEsTUFBTUEsS0FBTixDQUFZLENBQVosQ0FBUjtBQUNEOztBQUVELE1BQUlvSSxVQUFVd0ksWUFBWTVRLEtBQVosRUFBbUIsRUFBbkIsQ0FBZDtBQUNBLE1BQUlvSSxRQUFRak0sTUFBUixLQUFtQixDQUF2QixFQUEwQjtBQUN4QixVQUFNLElBQUk0TCxXQUFKLHdDQUFxRC9ILE1BQU1nRyxJQUFOLENBQVcsR0FBWCxDQUFyRCxPQUFOO0FBQ0Q7O0FBYjhFLGdDQWNyRG9DLE9BZHFEO0FBQUEsTUFjekVvQixJQWR5RTtBQUFBLE1BY25Fd0YsU0FkbUU7O0FBZ0IvRSxNQUFJelIsT0FBTyxJQUFJZSxXQUFKLENBQWdCLEVBQUVrTCxVQUFGLEVBQVF3RixvQkFBUixFQUFoQixDQUFYO0FBQ0EsTUFBSTVGLFFBQUosRUFBYzdMLEtBQUs2TCxRQUFMLEdBQWdCQSxRQUFoQjtBQUNkLFNBQU8sQ0FBRTdMLElBQUYsRUFBUUgsR0FBUixDQUFQO0FBQ0QsQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdFREOzs7Ozs7OztBQUVBO0FBQ0E7QUFDQSxJQUFJLENBQUVRLE1BQU1sQyxTQUFOLENBQWdCdVMsUUFBdEIsRUFBaUM7QUFDaENsUyxRQUFPZ0QsY0FBUCxDQUFzQm5CLE1BQU1sQyxTQUE1QixFQUF1QyxVQUF2QyxFQUFtRDtBQUNsRHNELFNBQU8sZUFBU0EsTUFBVCxFQUFnQjdCLEtBQWhCLEVBQXVCO0FBQzdCLE9BQUltTyxRQUFRLEtBQUsxRixPQUFMLENBQWE1RyxNQUFiLEVBQW9CN0IsS0FBcEIsQ0FBWjtBQUNBLFVBQVFtTyxVQUFVLENBQUMsQ0FBbkI7QUFDQTtBQUppRCxFQUFuRDtBQU1BOztBQUlEOztJQUNNb0YsVTtBQUNMLHFCQUFZQSxXQUFaLEVBQXdCO0FBQUE7O0FBQ3ZCLE9BQUtBLFVBQUwsR0FBa0JBLFdBQWxCO0FBQ0E7O0FBRUQ7Ozs7OzZCQUtXO0FBQ1YsVUFBTyxLQUFLQSxVQUFaO0FBQ0E7OztzQkFOWTtBQUNaLFVBQU8sS0FBS0EsVUFBTCxDQUFnQnZVLE1BQXZCO0FBQ0E7Ozs7OztBQVFGOzs7SUFDTThTLE07Ozs7Ozs7Ozs7RUFBZXlCLFU7O0FBR3JCOzs7SUFDTXlCLE87Ozs7Ozs7Ozs7RUFBZ0J6QixVOztBQUd0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0EsSUFBTW5VLFlBQVk7O0FBRWpCO0FBQ0EyRCxPQUFPLEtBSFU7O0FBS2pCO0FBQ0FxUCxhQUFZbUIsVUFOSzs7QUFRakI7QUFDQTBCLFNBQVFuRCxNQVRTOztBQVdqQjtBQUNBb0QsVUFBUyxJQUFJRixPQUFKLENBQVksSUFBWixDQVpROztBQWNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Q7QUFDQzNWLFNBdkJpQixvQkF1QlJ0QyxJQXZCUSxFQXVCYztBQUFBLE1BQWhCaUQsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQzlCLE1BQUksT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1sRCxLQUFLaUMsTUFBMUMsRUFBa0RpQixNQUFNbEQsS0FBS2lDLE1BQVg7QUFDbEQ7QUFDQSxNQUFJZ0IsU0FBU0MsR0FBVCxJQUFnQixDQUFDbEQsS0FBSzBOLElBQUwsRUFBckIsRUFBa0MsT0FBTyxFQUFQOztBQUVsQyxNQUFJdEwsU0FBUyxFQUFiO0FBQ0E7O0FBTjhCLG1CQU9ILEtBQUtnVyxTQUFMLENBQWUsS0FBS0MsY0FBcEIsRUFBb0NyWSxJQUFwQyxFQUEwQ2lELEtBQTFDLEVBQWlEQyxHQUFqRCxDQVBHO0FBQUE7QUFBQSxNQU96QmdMLE9BUHlCO0FBQUEsTUFPaEJoQixTQVBnQjs7QUFROUIsTUFBSWdCLE9BQUosRUFBYTtBQUNaOUwsWUFBU0EsT0FBT29CLE1BQVAsQ0FBYzBLLE9BQWQsQ0FBVDtBQUNBakwsV0FBUWlLLFNBQVI7QUFDQTtBQUNELE1BQUlqSyxVQUFVQyxHQUFkLEVBQW1CO0FBQ2xCLE9BQUliLFVBQVUyRCxJQUFkLEVBQW9CaEYsUUFBUTBJLElBQVIsQ0FBYSwrQkFBYixFQUE4QzFKLEtBQUs4RixLQUFMLENBQVc3QyxLQUFYLEVBQWtCQyxHQUFsQixJQUF5QixHQUF2RTtBQUNwQjs7QUFFRCxTQUFPZ0wsT0FBUDtBQUNBLEVBeENnQjs7O0FBMENqQjtBQUNBO0FBQ0E7QUFDRDtBQUNDa0ssVUE5Q2lCLHFCQThDUEUsTUE5Q08sRUE4Q0N0WSxJQTlDRCxFQThDcUM7QUFBQSxNQUE5QmlELEtBQThCLHVFQUF0QixDQUFzQjtBQUFBLE1BQW5CQyxHQUFtQjtBQUFBLE1BQWRnTCxPQUFjLHVFQUFKLEVBQUk7O0FBQ3JELE1BQUksT0FBT2hMLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxNQUFNbEQsS0FBS2lDLE1BQTFDLEVBQWtEaUIsTUFBTWxELEtBQUtpQyxNQUFYO0FBQ2xELE1BQUlnQixTQUFTQyxHQUFiLEVBQWtCLE9BQU9QLFNBQVA7O0FBRWxCO0FBQ0EsU0FBT00sUUFBUUMsR0FBZixFQUFvQjtBQUNuQixPQUFJTCxTQUFTeVYsT0FBT0MsSUFBUCxDQUFZLElBQVosRUFBa0J2WSxJQUFsQixFQUF3QmlELEtBQXhCLEVBQStCQyxHQUEvQixDQUFiO0FBQ0EsT0FBSSxDQUFDTCxNQUFMLEVBQWE7O0FBRk0sZ0NBSU9BLE1BSlA7QUFBQSxPQUlkVCxNQUpjO0FBQUEsT0FJTjhLLFNBSk07QUFLbkI7OztBQUNBLE9BQUlqSyxVQUFVaUssU0FBZCxFQUF5Qjs7QUFFekI7QUFDQSxPQUFJOUssV0FBV08sU0FBZixFQUEwQnVMLFVBQVVBLFFBQVExSyxNQUFSLENBQWVwQixNQUFmLENBQVY7QUFDMUJhLFdBQVFpSyxTQUFSO0FBQ0E7QUFDRCxTQUFPLENBQUNnQixPQUFELEVBQVVqTCxLQUFWLENBQVA7QUFDQSxFQWhFZ0I7OztBQWtFakI7QUFDRDtBQUNDb1YsZUFwRWlCLDBCQW9FRnJZLElBcEVFLEVBb0VJaUQsS0FwRUosRUFvRVdDLEdBcEVYLEVBb0VnQjtBQUNoQyxTQUFPLEtBQUtzVixlQUFMLENBQXFCeFksSUFBckIsRUFBMkJpRCxLQUEzQixFQUFrQ0MsR0FBbEMsS0FDRixLQUFLdVYsU0FBTCxDQUFlelksSUFBZixFQUFxQmlELEtBQXJCLEVBQTRCQyxHQUE1QixDQURFLElBRUYsS0FBS3dWLFdBQUwsQ0FBaUIxWSxJQUFqQixFQUF1QmlELEtBQXZCLEVBQThCQyxHQUE5QixDQUZFLElBR0YsS0FBS3lWLFlBQUwsQ0FBa0IzWSxJQUFsQixFQUF3QmlELEtBQXhCLEVBQStCQyxHQUEvQixDQUhFLElBSUYsS0FBSzBWLGVBQUwsQ0FBcUI1WSxJQUFyQixFQUEyQmlELEtBQTNCLEVBQWtDQyxHQUFsQyxDQUpFLElBS0YsS0FBSzJWLFNBQUwsQ0FBZTdZLElBQWYsRUFBcUJpRCxLQUFyQixFQUE0QkMsR0FBNUIsQ0FMRSxJQU1GLEtBQUs0VixZQUFMLENBQWtCOVksSUFBbEIsRUFBd0JpRCxLQUF4QixFQUErQkMsR0FBL0IsQ0FORSxJQU9GLEtBQUs2VixXQUFMLENBQWlCL1ksSUFBakIsRUFBdUJpRCxLQUF2QixFQUE4QkMsR0FBOUIsQ0FQTDtBQVNBLEVBOUVnQjs7O0FBaUZqQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E2VixZQXhGaUIsdUJBd0ZML1ksSUF4RkssRUF3RmlCO0FBQUEsTUFBaEJpRCxLQUFnQix1RUFBUixDQUFRO0FBQUEsTUFBTEMsR0FBSzs7QUFDakMsTUFBSSxPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsTUFBTWxELEtBQUtpQyxNQUExQyxFQUFrRGlCLE1BQU1sRCxLQUFLaUMsTUFBWDtBQUNsRCxNQUFJZ0IsU0FBU0MsR0FBYixFQUFrQixPQUFPUCxTQUFQOztBQUVsQixTQUFPLENBQUMzQyxLQUFLaUQsS0FBTCxDQUFELEVBQWNBLFFBQVEsQ0FBdEIsQ0FBUDtBQUNBLEVBN0ZnQjs7O0FBZ0dqQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0ErVixjQXZHaUIseUJBdUdIaFosSUF2R0csRUF1R21CO0FBQUEsTUFBaEJpRCxLQUFnQix1RUFBUixDQUFRO0FBQUEsTUFBTEMsR0FBSzs7QUFDbkMsTUFBSSxPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsTUFBTWxELEtBQUtpQyxNQUExQyxFQUFrRGlCLE1BQU1sRCxLQUFLaUMsTUFBWDtBQUNsRCxNQUFJZ0IsU0FBU0MsR0FBYixFQUFrQixPQUFPQSxHQUFQOztBQUVsQixNQUFJK1YsZ0JBQWdCaFcsS0FBcEI7QUFDQSxTQUFPZ1csZ0JBQWdCL1YsR0FBaEIsS0FBd0JsRCxLQUFLaVosYUFBTCxNQUF3QixHQUF4QixJQUErQmpaLEtBQUtpWixhQUFMLE1BQXdCLElBQS9FLENBQVAsRUFBNkY7QUFDNUZBO0FBQ0E7QUFDRCxTQUFPQSxhQUFQO0FBQ0EsRUFoSGdCOzs7QUFtSGpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQVQsZ0JBMUhpQiwyQkEwSER4WSxJQTFIQyxFQTBIcUI7QUFBQSxNQUFoQmlELEtBQWdCLHVFQUFSLENBQVE7QUFBQSxNQUFMQyxHQUFLOztBQUNyQyxNQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxNQUFNbEQsS0FBS2lDLE1BQTFDLEVBQWtEaUIsTUFBTWxELEtBQUtpQyxNQUFYO0FBQ2xELE1BQUlnQixTQUFTQyxHQUFiLEVBQWtCLE9BQU9QLFNBQVA7O0FBRWxCLE1BQUl1VyxnQkFBZ0IsS0FBS0YsYUFBTCxDQUFtQmhaLElBQW5CLEVBQXlCaUQsS0FBekIsRUFBZ0NDLEdBQWhDLENBQXBCO0FBQ0E7QUFDQSxNQUFJZ1csa0JBQWtCalcsS0FBdEIsRUFBNkIsT0FBT04sU0FBUDs7QUFFN0IsTUFBSTZULGFBQWF4VyxLQUFLOEYsS0FBTCxDQUFXN0MsS0FBWCxFQUFrQmlXLGFBQWxCLENBQWpCO0FBQ0EsTUFBSXpXLGNBQUo7QUFDQSxNQUFJUSxVQUFVLENBQVYsSUFBZWpELEtBQUtpRCxRQUFNLENBQVgsTUFBa0IsSUFBckMsRUFDQ1IsUUFBUSxJQUFJSixVQUFVNlYsTUFBZCxDQUFxQjFCLFVBQXJCLENBQVIsQ0FERCxLQUdDL1QsUUFBUSxJQUFJSixVQUFVZ1QsVUFBZCxDQUF5Qm1CLFVBQXpCLENBQVI7O0FBRUQsU0FBTyxDQUFDL1QsS0FBRCxFQUFReVcsYUFBUixDQUFQO0FBQ0EsRUExSWdCOzs7QUE2SWpCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQVAsYUFwSmlCLHdCQW9KSjNZLElBcEpJLEVBb0prQjtBQUFBLE1BQWhCaUQsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQ2xDLE1BQUksT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1sRCxLQUFLaUMsTUFBMUMsRUFBa0RpQixNQUFNbEQsS0FBS2lDLE1BQVg7QUFDbEQsTUFBSWdCLFNBQVNDLEdBQVQsSUFBZ0JsRCxLQUFLaUQsS0FBTCxNQUFnQixJQUFwQyxFQUEwQyxPQUFPTixTQUFQOztBQUUxQyxTQUFPLENBQUNOLFVBQVU4VixPQUFYLEVBQW9CbFYsUUFBUSxDQUE1QixDQUFQO0FBQ0EsRUF6SmdCOzs7QUE0SmpCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQWtXLGFBQVksVUFuS0s7QUFvS2pCQyxZQUFZLFNBcEtLO0FBcUtqQlgsVUFyS2lCLHFCQXFLUHpZLElBcktPLEVBcUtlO0FBQUEsTUFBaEJpRCxLQUFnQix1RUFBUixDQUFRO0FBQUEsTUFBTEMsR0FBSzs7QUFDL0IsTUFBSSxPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsTUFBTWxELEtBQUtpQyxNQUExQyxFQUFrRGlCLE1BQU1sRCxLQUFLaUMsTUFBWDtBQUNsRCxNQUFJZ0IsU0FBU0MsR0FBYixFQUFrQixPQUFPUCxTQUFQOztBQUVsQixNQUFJLENBQUMsS0FBS3dXLFVBQUwsQ0FBZ0JsWixJQUFoQixDQUFxQkQsS0FBS2lELEtBQUwsQ0FBckIsQ0FBTCxFQUF3QyxPQUFPTixTQUFQOztBQUV4QyxNQUFJMFcsVUFBVXBXLFFBQVEsQ0FBdEI7QUFDQSxTQUFPb1csVUFBVW5XLEdBQVYsSUFBaUIsS0FBS2tXLFNBQUwsQ0FBZW5aLElBQWYsQ0FBb0JELEtBQUtxWixPQUFMLENBQXBCLENBQXhCLEVBQTREO0FBQzNEQTtBQUNBO0FBQ0QsTUFBSUEsWUFBWXBXLEtBQWhCLEVBQXVCLE9BQU9OLFNBQVA7O0FBRXZCLE1BQUl2QyxPQUFPSixLQUFLOEYsS0FBTCxDQUFXN0MsS0FBWCxFQUFrQm9XLE9BQWxCLENBQVg7QUFDQSxTQUFPLENBQUNqWixJQUFELEVBQU9pWixPQUFQLENBQVA7QUFDQSxFQW5MZ0I7OztBQXNMakI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQUMsZUFBYyxTQTVMRztBQTZMakJDLFNBQVMsc0JBN0xRO0FBOExqQmIsWUE5TGlCLHVCQThMTDFZLElBOUxLLEVBOExpQjtBQUFBLE1BQWhCaUQsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQ2pDLE1BQUksT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1sRCxLQUFLaUMsTUFBMUMsRUFBa0RpQixNQUFNbEQsS0FBS2lDLE1BQVg7QUFDbEQsTUFBSWdCLFNBQVNDLEdBQWIsRUFBa0IsT0FBT1AsU0FBUDs7QUFFbEIsTUFBSSxDQUFDLEtBQUsyVyxZQUFMLENBQWtCclosSUFBbEIsQ0FBdUJELEtBQUtpRCxLQUFMLENBQXZCLENBQUwsRUFBMEMsT0FBT04sU0FBUDs7QUFFMUMsTUFBSTZXLGNBQWMsS0FBS0MscUJBQUwsQ0FBMkIsS0FBS0YsTUFBaEMsRUFBd0N2WixJQUF4QyxFQUE4Q2lELEtBQTlDLEVBQXFEQyxHQUFyRCxDQUFsQjtBQUNBLE1BQUksQ0FBQ3NXLFdBQUwsRUFBa0IsT0FBTzdXLFNBQVA7O0FBRWxCLE1BQUkrVyxZQUFZRixZQUFZLENBQVosQ0FBaEI7QUFDQSxNQUFJbFosU0FBU3FaLFdBQVdELFNBQVgsRUFBc0IsRUFBdEIsQ0FBYjtBQUNBLFNBQU8sQ0FBQ3BaLE1BQUQsRUFBUzJDLFFBQVF5VyxVQUFVelgsTUFBM0IsQ0FBUDtBQUNBLEVBMU1nQjs7O0FBNk1qQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNEO0FBQ0M0VyxVQXBOaUIscUJBb05QN1ksSUFwTk8sRUFvTmU7QUFBQSxNQUFoQmlELEtBQWdCLHVFQUFSLENBQVE7QUFBQSxNQUFMQyxHQUFLOztBQUMvQixNQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxNQUFNbEQsS0FBS2lDLE1BQTFDLEVBQWtEaUIsTUFBTWxELEtBQUtpQyxNQUFYO0FBQ2xELE1BQUlnQixTQUFTQyxHQUFiLEVBQWtCLE9BQU9QLFNBQVA7O0FBRWxCLE1BQUlpWCxjQUFjNVosS0FBS2lELEtBQUwsQ0FBbEI7QUFDQSxNQUFJMlcsZ0JBQWdCLEdBQWhCLElBQXVCQSxnQkFBZ0IsR0FBM0MsRUFBZ0QsT0FBT2pYLFNBQVA7O0FBRWhELE1BQUlrWCxVQUFVNVcsUUFBUSxDQUF0QjtBQUNBLFNBQU80VyxVQUFVM1csR0FBakIsRUFBc0I7QUFDckIsT0FBSTRXLE9BQU85WixLQUFLNlosT0FBTCxDQUFYO0FBQ0EsT0FBSUMsU0FBU0YsV0FBYixFQUEwQjtBQUMxQjtBQUNBLE9BQUlFLFNBQVMsSUFBVCxJQUFpQjlaLEtBQUs2WixVQUFVLENBQWYsTUFBc0JELFdBQTNDLEVBQXdEQztBQUN4REE7QUFDQTtBQUNEO0FBQ0EsTUFBSTdaLEtBQUs2WixPQUFMLE1BQWtCRCxXQUF0QixFQUFtQyxPQUFPalgsU0FBUDtBQUNuQztBQUNBa1g7O0FBRUEsTUFBSTdHLGVBQWVoVCxLQUFLOEYsS0FBTCxDQUFXN0MsS0FBWCxFQUFrQjRXLE9BQWxCLENBQW5CO0FBQ0EsTUFBSXBYLFFBQVEsSUFBSUosVUFBVTBRLElBQWQsQ0FBbUJDLFlBQW5CLENBQVo7QUFDQSxTQUFPLENBQUN2USxLQUFELEVBQVFvWCxPQUFSLENBQVA7QUFDQSxFQTNPZ0I7OztBQTZPakI7QUFDQTtBQUNBOUc7QUFDQyxnQkFBWUMsWUFBWixFQUEwQjtBQUFBOztBQUN6QixRQUFLQSxZQUFMLEdBQW9CQSxZQUFwQjtBQUNBOztBQUhGO0FBQUE7QUFBQSw4QkFhWTtBQUNWLFdBQU8sS0FBS0EsWUFBWjtBQUNBO0FBZkY7QUFBQTtBQUFBLHVCQUlZO0FBQ1YsUUFBSTlTLFNBQVMsS0FBSzhTLFlBQWxCO0FBQ0E7QUFDQSxRQUFJL1AsUUFBUSxDQUFaO0FBQ0EsUUFBSUMsTUFBTWhELE9BQU8rQixNQUFqQjtBQUNBLFFBQUkvQixPQUFPK0MsS0FBUCxNQUFrQixHQUFsQixJQUF5Qi9DLE9BQU8rQyxLQUFQLE1BQWtCLEdBQS9DLEVBQW9EQSxRQUFRLENBQVI7QUFDcEQsUUFBSS9DLE9BQU9nRCxNQUFJLENBQVgsTUFBa0IsR0FBbEIsSUFBeUJoRCxPQUFPZ0QsTUFBSSxDQUFYLE1BQWtCLEdBQS9DLEVBQW9EQSxNQUFNLENBQUMsQ0FBUDtBQUNwRCxXQUFPaEQsT0FBTzRGLEtBQVAsQ0FBYTdDLEtBQWIsRUFBb0JDLEdBQXBCLENBQVA7QUFDQTtBQVpGOztBQUFBO0FBQUEsSUEvT2lCOztBQWlRakI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTZXLFVBQVUsMkJBdlFPO0FBd1FqQmpCLGFBeFFpQix3QkF3UUo5WSxJQXhRSSxFQXdRa0I7QUFBQSxNQUFoQmlELEtBQWdCLHVFQUFSLENBQVE7QUFBQSxNQUFMQyxHQUFLOztBQUNsQyxNQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxNQUFNbEQsS0FBS2lDLE1BQTFDLEVBQWtEaUIsTUFBTWxELEtBQUtpQyxNQUFYO0FBQ2xELE1BQUlnQixTQUFTQyxHQUFiLEVBQWtCLE9BQU9QLFNBQVA7O0FBRWxCLE1BQUlxWCxlQUFlaGEsS0FBSzhGLEtBQUwsQ0FBVzdDLEtBQVgsRUFBa0JBLFFBQVEsQ0FBMUIsQ0FBbkI7QUFDQSxNQUFJK1csaUJBQWlCLElBQWpCLElBQXlCQSxpQkFBaUIsTUFBMUMsSUFBb0RBLGlCQUFpQixJQUF6RSxFQUErRSxPQUFPclgsU0FBUDs7QUFFL0U7QUFDQSxNQUFJa0osT0FBTyxLQUFLb08sYUFBTCxDQUFtQmphLElBQW5CLEVBQXlCaUQsS0FBekIsRUFBZ0NDLEdBQWhDLENBQVg7QUFDQSxNQUFJZ1gsZUFBZXJPLEtBQUtzRCxLQUFMLENBQVcsS0FBSzRLLE9BQWhCLENBQW5CO0FBQ0EsTUFBSSxDQUFDRyxZQUFMLEVBQW1CLE9BQU92WCxTQUFQOztBQVZlLHFDQVlnQnVYLFlBWmhCO0FBQUEsTUFZN0IvSyxLQVo2QjtBQUFBLE1BWXRCZ0wsYUFac0I7QUFBQSxNQVlQM0QsVUFaTztBQUFBLE1BWUt0QyxPQVpMOztBQWFsQyxNQUFJelIsUUFBUSxJQUFJSixVQUFVMFAsT0FBZCxDQUFzQixFQUFFb0ksNEJBQUYsRUFBaUIzRCxzQkFBakIsRUFBNkJ0QyxnQkFBN0IsRUFBdEIsQ0FBWjtBQUNBLFNBQU8sQ0FBQ3pSLEtBQUQsRUFBUVEsUUFBUTRJLEtBQUs1SixNQUFyQixDQUFQO0FBQ0EsRUF2UmdCOzs7QUF5UmpCO0FBQ0Q7QUFDQzhQO0FBQ0MsbUJBQWExTixLQUFiLEVBQW9CO0FBQUE7O0FBQ25CeEMsVUFBT0MsTUFBUCxDQUFjLElBQWQsRUFBb0J1QyxLQUFwQjtBQUNBOztBQUhGO0FBQUE7QUFBQSw4QkFJWTtBQUNWLGdCQUFVLEtBQUs4VixhQUFmLEdBQStCLEtBQUszRCxVQUFwQyxHQUFpRCxLQUFLdEMsT0FBdEQ7QUFDQTtBQU5GOztBQUFBO0FBQUEsSUEzUmlCOztBQXFTakI7QUFDQTtBQUNBOztBQUVBO0FBQ0Q7QUFDQzBFLGdCQTNTaUIsMkJBMlNENVksSUEzU0MsRUEyU3FCO0FBQUEsTUFBaEJpRCxLQUFnQix1RUFBUixDQUFRO0FBQUEsTUFBTEMsR0FBSzs7QUFDckMsTUFBSSxPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsTUFBTWxELEtBQUtpQyxNQUExQyxFQUFrRGlCLE1BQU1sRCxLQUFLaUMsTUFBWDtBQUNsRCxNQUFJZ0IsU0FBU0MsR0FBYixFQUFrQixPQUFPUCxTQUFQOztBQUZtQixhQUlQLEtBQUt5WCxnQkFBTCxDQUFzQnBhLElBQXRCLEVBQTRCaUQsS0FBNUIsRUFBbUNDLEdBQW5DLEtBQTJDLEVBSnBDO0FBQUE7QUFBQSxNQUloQ2lLLFVBSmdDO0FBQUEsTUFJcEJELFNBSm9COztBQUtyQyxNQUFJLENBQUNDLFVBQUwsRUFBaUIsT0FBT3hLLFNBQVA7O0FBRWpCLE1BQUksQ0FBQ3dLLFdBQVdrTixVQUFoQixFQUE0QjtBQUFBLDJCQUNBLEtBQUtDLGdCQUFMLENBQXNCbk4sV0FBV1ksT0FBakMsRUFBMEMvTixJQUExQyxFQUFnRGtOLFNBQWhELEVBQTJEaEssR0FBM0QsQ0FEQTtBQUFBO0FBQUEsT0FDdEJzSyxRQURzQjtBQUFBLE9BQ1orTSxRQURZOztBQUUzQixPQUFJL00sU0FBU3ZMLE1BQWIsRUFBcUI7QUFDcEJrTCxlQUFXSyxRQUFYLEdBQXNCQSxRQUF0QjtBQUNBTixnQkFBWXFOLFFBQVo7QUFDQTtBQUNEOztBQUVELFNBQU8sQ0FBQ3BOLFVBQUQsRUFBYUQsU0FBYixDQUFQO0FBQ0EsRUEzVGdCOzs7QUE2VGpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0FzTixnQkFBZ0IsdUNBalVDO0FBa1VsQjtBQUNDSixpQkFuVWlCLDRCQW1VQXBhLElBblVBLEVBbVVzQjtBQUFBLE1BQWhCaUQsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQ3RDLE1BQUksT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1sRCxLQUFLaUMsTUFBMUMsRUFBa0RpQixNQUFNbEQsS0FBS2lDLE1BQVg7QUFDbEQsTUFBSWdCLFNBQVNDLEdBQWIsRUFBa0IsT0FBT1AsU0FBUDs7QUFFbEIsTUFBSXVLLFlBQVksS0FBSzhMLGFBQUwsQ0FBbUJoWixJQUFuQixFQUF5QmlELEtBQXpCLEVBQWdDQyxHQUFoQyxDQUFoQjtBQUNBO0FBQ0EsTUFBSWxELEtBQUtrTixTQUFMLE1BQW9CLEdBQXhCLEVBQTZCLE9BQU92SyxTQUFQOztBQUU3QixNQUFJOFgsV0FBVyxLQUFLaEIscUJBQUwsQ0FBMkIsS0FBS2UsYUFBaEMsRUFBK0N4YSxJQUEvQyxFQUFxRGtOLFNBQXJELEVBQWdFaEssR0FBaEUsQ0FBZjtBQUNBLE1BQUksQ0FBQ3VYLFFBQUwsRUFBZSxPQUFPOVgsU0FBUDs7QUFUdUIsaUNBV0Q4WCxRQVhDO0FBQUEsTUFXaEM1QixTQVhnQztBQUFBLE1BV3JCOUssT0FYcUI7QUFBQSxNQVdaMk0sTUFYWTs7QUFZdEMsTUFBSXZOLGFBQWEsSUFBSTlLLFVBQVUwSyxVQUFkLENBQXlCZ0IsT0FBekIsQ0FBakI7QUFDQWIsY0FBWUEsWUFBWTJMLFVBQVU1VyxNQUFsQzs7QUFFQTtBQUNBeVksV0FBU0EsT0FBT2hOLElBQVAsRUFBVDtBQUNBLE1BQUlnTixXQUFXLElBQWYsRUFBcUI7QUFDcEJ2TixjQUFXa04sVUFBWCxHQUF3QixJQUF4QjtBQUNBLFVBQU8sQ0FBQ2xOLFVBQUQsRUFBYUQsU0FBYixDQUFQO0FBQ0E7O0FBRUQ7QUFDQSxNQUFJd04sV0FBVyxHQUFYLElBQWtCQSxXQUFXLElBQWpDLEVBQXVDO0FBQUEscUJBQ2IsS0FBS3RDLFNBQUwsQ0FBZSxLQUFLdUMsaUJBQXBCLEVBQXVDM2EsSUFBdkMsRUFBNkNrTixTQUE3QyxFQUF3RGhLLEdBQXhELENBRGE7QUFBQTtBQUFBLE9BQ2hDbUssS0FEZ0M7QUFBQSxPQUN6QnVOLE9BRHlCOztBQUV0Q3pOLGNBQVdDLFVBQVgsR0FBd0JDLEtBQXhCO0FBQ0FILGVBQVkwTixPQUFaO0FBQ0E7O0FBRUQ7QUFDQSxNQUFJNWEsS0FBS2tOLFNBQUwsTUFBb0IsR0FBcEIsSUFBMkJsTixLQUFLa04sWUFBWSxDQUFqQixNQUF3QixHQUF2RCxFQUE0RDtBQUMzRHdOLFlBQVMsSUFBVDtBQUNBeE4sZ0JBQWEsQ0FBYjtBQUNBLEdBSEQsTUFJSyxJQUFJbE4sS0FBS2tOLFNBQUwsTUFBb0IsR0FBeEIsRUFBNkI7QUFDakN3TixZQUFTMWEsS0FBS2tOLFNBQUwsQ0FBVDtBQUNBQSxnQkFBYSxDQUFiO0FBQ0E7O0FBRUQ7QUFDQSxNQUFJd04sV0FBVyxJQUFmLEVBQXFCO0FBQ3BCdk4sY0FBV2tOLFVBQVgsR0FBd0IsSUFBeEI7QUFDQSxVQUFPLENBQUNsTixVQUFELEVBQWFELFNBQWIsQ0FBUDtBQUNBOztBQUVEO0FBQ0EsTUFBSXdOLFdBQVcsR0FBZixFQUFvQjtBQUNuQixPQUFJclksVUFBVTJELElBQWQsRUFBb0I7QUFDbkJoRixZQUFRMEksSUFBUixDQUFhLHlDQUFiLEVBQXdEeUQsVUFBeEQsRUFBb0UsTUFBSW5OLEtBQUs4RixLQUFMLENBQVc3QyxLQUFYLEVBQWtCaUssU0FBbEIsQ0FBSixHQUFpQyxHQUFyRztBQUNBO0FBQ0RDLGNBQVdnRSxLQUFYLEdBQW1CLFVBQW5CO0FBQ0EsVUFBTyxDQUFDaEUsVUFBRCxFQUFhRCxTQUFiLENBQVA7QUFDQTs7QUFFRCxTQUFPLENBQUNDLFVBQUQsRUFBYUQsU0FBYixDQUFQO0FBQ0EsRUExWGdCOzs7QUE2WGpCO0FBQ0FIO0FBQ0Msc0JBQVlnQixPQUFaLEVBQXFCWCxVQUFyQixFQUFpQ0ksUUFBakMsRUFBMkM7QUFBQTs7QUFDMUMsUUFBS08sT0FBTCxHQUFlQSxPQUFmO0FBQ0EsT0FBSVgsVUFBSixFQUFnQixLQUFLQSxVQUFMLEdBQWtCQSxVQUFsQjtBQUNoQixPQUFJSSxRQUFKLEVBQWMsS0FBS0EsUUFBTCxHQUFnQkEsUUFBaEI7QUFDZDs7QUFFRDtBQUNGOzs7QUFSQztBQUFBO0FBQUEsOEJBeUNZO0FBQ1YsUUFBSUgsUUFBUSxLQUFLd04sYUFBakI7QUFDQSxRQUFJck4sV0FBVyxLQUFLc04sZ0JBQXBCO0FBQ0EsUUFBSSxLQUFLVCxVQUFULEVBQXFCLGFBQVcsS0FBS3RNLE9BQWhCLEdBQTBCVixLQUExQjtBQUNyQixpQkFBVyxLQUFLVSxPQUFoQixHQUEwQlYsS0FBMUIsU0FBbUNHLFFBQW5DLFVBQWdELEtBQUtPLE9BQXJEO0FBQ0E7QUE5Q0Y7QUFBQTtBQUFBLHVCQVNhO0FBQ1gsUUFBSVYsUUFBUSxFQUFaO0FBQ0EsUUFBSSxLQUFLRCxVQUFULEVBQXFCLEtBQUtBLFVBQUwsQ0FBZ0J4SixPQUFoQixDQUF3QixnQkFBUTtBQUNwRDtBQUNBLFNBQUltWCxLQUFLelcsSUFBVCxFQUFlK0ksTUFBTTBOLEtBQUt6VyxJQUFYLElBQW1CeVcsS0FBS2pXLEtBQXhCO0FBQ2YsS0FIb0I7QUFJckIsV0FBT3VJLEtBQVA7QUFDQTs7QUFFRDtBQUNGOztBQW5CQztBQUFBO0FBQUEsdUJBb0JxQjtBQUNuQixRQUFJLENBQUMsS0FBS0QsVUFBVixFQUFzQixPQUFPLEVBQVA7QUFDdEIsV0FBTyxNQUFNLEtBQUtBLFVBQUwsQ0FBZ0IxSSxHQUFoQixDQUFxQixpQkFBcUI7QUFBQSxTQUFsQkosSUFBa0IsU0FBbEJBLElBQWtCO0FBQUEsU0FBWlEsS0FBWSxTQUFaQSxLQUFZOztBQUN0RCxTQUFJQSxVQUFVbkMsU0FBZCxFQUF5QixPQUFPMkIsSUFBUDtBQUN6QjtBQUNBO0FBQ0EsU0FBSVosTUFBTUMsT0FBTixDQUFjbUIsS0FBZCxDQUFKLEVBQTBCQSxjQUFZQSxNQUFNZ0gsSUFBTixDQUFXLEdBQVgsQ0FBWjtBQUMxQixzQkFBZWhILEtBQWY7QUFDQSxLQU5ZLEVBTVZnSCxJQU5VLENBTUwsR0FOSyxDQUFiO0FBT0E7O0FBRUQ7QUFDRjs7QUFoQ0M7QUFBQTtBQUFBLHVCQWlDd0I7QUFDdEIsUUFBSSxDQUFDLEtBQUswQixRQUFWLEVBQW9CLE9BQU8sRUFBUDtBQUNwQixXQUFPLEtBQUtBLFFBQUwsQ0FBYzlJLEdBQWQsQ0FBa0IsaUJBQVM7QUFDakMsU0FBSWhCLE1BQU1DLE9BQU4sQ0FBYzhKLEtBQWQsQ0FBSixFQUEwQixhQUFXQSxNQUFNM0IsSUFBTixDQUFXLEdBQVgsQ0FBWDtBQUMxQixZQUFPLEtBQUsyQixLQUFaO0FBQ0EsS0FITSxFQUdKM0IsSUFISSxDQUdDLEVBSEQsQ0FBUDtBQUlBO0FBdkNGOztBQUFBO0FBQUEsSUE5WGlCOztBQWdiakI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNEO0FBQ0N3TyxpQkF4YmlCLDRCQXdiQXZNLE9BeGJBLEVBd2JTL04sSUF4YlQsRUF3YmVpRCxLQXhiZixFQXdic0JDLEdBeGJ0QixFQXdiMkI7QUFDM0MsTUFBSSxPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsTUFBTWxELEtBQUtpQyxNQUExQyxFQUFrRGlCLE1BQU1sRCxLQUFLaUMsTUFBWDtBQUNsRCxNQUFJZ0IsU0FBU0MsR0FBYixFQUFrQixPQUFPUCxTQUFQOztBQUVsQixNQUFJNkssV0FBVyxFQUFmO0FBQ0EsTUFBSTdILFVBQVUsQ0FBZDtBQUNBLE1BQUlxVixnQkFBY2pOLE9BQWQsTUFBSjs7QUFFQSxNQUFJYixZQUFZakssS0FBaEI7QUFDQSxTQUFNLElBQU4sRUFBWTtBQUNYLE9BQUlKLFNBQVMsS0FBS29ZLGFBQUwsQ0FBbUJELE1BQW5CLEVBQTJCaGIsSUFBM0IsRUFBaUNrTixTQUFqQyxFQUE0Q2hLLEdBQTVDLENBQWI7QUFDQSxPQUFJLENBQUNMLE1BQUwsRUFBYTs7QUFGRixpQ0FJYUEsTUFKYjtBQUFBLE9BSU40SyxLQUpNO0FBQUEsT0FJQzhNLFFBSkQ7O0FBS1hyTixlQUFZcU4sUUFBWjtBQUNBO0FBQ0EsT0FBSTlNLFVBQVV1TixNQUFkLEVBQXNCO0FBQ3JCclY7QUFDQSxRQUFJQSxZQUFZLENBQWhCLEVBQW1CO0FBQ25CO0FBQ0EsSUFKRCxNQUtLO0FBQ0osUUFBSThILEtBQUosRUFBV0QsU0FBU3NELElBQVQsQ0FBY3JELEtBQWQ7QUFDWDtBQUNEO0FBQ0g7QUFDRSxNQUFJOUgsWUFBWSxDQUFoQixFQUFtQjtBQUNsQixPQUFJdEQsVUFBVTJELElBQWQsRUFBb0I7QUFDbkJoRixZQUFRMEksSUFBUix1QkFBaUMxSixLQUFLOEYsS0FBTCxDQUFXN0MsS0FBWCxFQUFrQmlLLFlBQVksRUFBOUIsQ0FBakM7QUFDQTtBQUNEO0FBQ0QsU0FBTyxDQUFDTSxRQUFELEVBQVdOLFNBQVgsQ0FBUDtBQUNBLEVBeGRnQjs7O0FBMGRqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0ErTixjQS9kaUIseUJBK2RIRCxNQS9kRyxFQStkS2hiLElBL2RMLEVBK2QyQjtBQUFBLE1BQWhCaUQsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQzNDLFNBQU8sS0FBS2dZLGNBQUwsQ0FBb0JGLE1BQXBCLEVBQTRCaGIsSUFBNUIsRUFBa0NpRCxLQUFsQyxFQUF5Q0MsR0FBekMsS0FDSCxLQUFLaVksa0JBQUwsQ0FBd0JuYixJQUF4QixFQUE4QmlELEtBQTlCLEVBQXFDQyxHQUFyQyxDQURHLElBRUgsS0FBSzBWLGVBQUwsQ0FBcUI1WSxJQUFyQixFQUEyQmlELEtBQTNCLEVBQWtDQyxHQUFsQztBQUNOO0FBSFMsS0FJSCxLQUFLa1ksWUFBTCxDQUFrQnBiLElBQWxCLEVBQXdCaUQsS0FBeEIsRUFBK0JDLEdBQS9CLENBSko7QUFLQSxFQXJlZ0I7OztBQXVlakI7QUFDQTtBQUNBZ1ksZUF6ZWlCLDBCQXllRkYsTUF6ZUUsRUF5ZU1oYixJQXplTixFQXllNEI7QUFBQSxNQUFoQmlELEtBQWdCLHVFQUFSLENBQVE7QUFBQSxNQUFMQyxHQUFLOztBQUM1QyxNQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxNQUFNbEQsS0FBS2lDLE1BQTFDLEVBQWtEaUIsTUFBTWxELEtBQUtpQyxNQUFYO0FBQ2xELE1BQUlnQixTQUFTQyxHQUFiLEVBQWtCLE9BQU9QLFNBQVA7O0FBRWxCLE1BQUl1SyxZQUFZLEtBQUs4TCxhQUFMLENBQW1CaFosSUFBbkIsRUFBeUJpRCxLQUF6QixFQUFnQ0MsR0FBaEMsQ0FBaEI7QUFDQSxNQUFJLENBQUMsS0FBS21ZLGlCQUFMLENBQXVCTCxNQUF2QixFQUErQmhiLElBQS9CLEVBQXFDa04sU0FBckMsRUFBZ0RoSyxHQUFoRCxDQUFMLEVBQTJELE9BQU9QLFNBQVA7QUFDM0QsU0FBTyxDQUFDcVksTUFBRCxFQUFTOU4sWUFBWThOLE9BQU8vWSxNQUE1QixDQUFQO0FBQ0EsRUFoZmdCOzs7QUFtZmpCO0FBQ0E7QUFDQTs7QUFFQTtBQUNEO0FBQ0NxWixzQkFBc0IsMEJBemZMO0FBMGZqQlgsa0JBMWZpQiw2QkEwZkMzYSxJQTFmRCxFQTBmdUI7QUFBQSxNQUFoQmlELEtBQWdCLHVFQUFSLENBQVE7QUFBQSxNQUFMQyxHQUFLOztBQUN2QyxNQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxNQUFNbEQsS0FBS2lDLE1BQTFDLEVBQWtEaUIsTUFBTWxELEtBQUtpQyxNQUFYO0FBQ2xELE1BQUlnQixTQUFTQyxHQUFiLEVBQWtCLE9BQU9QLFNBQVA7O0FBRWxCO0FBQ0EsTUFBSSxDQUFDLEtBQUt3VyxVQUFMLENBQWdCbFosSUFBaEIsQ0FBcUJELEtBQUtpRCxLQUFMLENBQXJCLENBQUwsRUFBd0MsT0FBT04sU0FBUDs7QUFFeEM7QUFDQSxNQUFJRSxTQUFTLEtBQUs0VyxxQkFBTCxDQUEyQixLQUFLNkIsbUJBQWhDLEVBQXFEdGIsSUFBckQsRUFBMkRpRCxLQUEzRCxFQUFrRUMsR0FBbEUsQ0FBYjtBQUNBLE1BQUksQ0FBQ0wsTUFBTCxFQUFhLE9BQU9GLFNBQVA7O0FBVDBCLGdDQVdURSxNQVhTO0FBQUEsTUFXakNzTSxLQVhpQztBQUFBLE1BVzFCN0ssSUFYMEI7QUFBQSxNQVdwQmlYLE1BWG9COztBQVl2QyxNQUFJck8sWUFBWWpLLFFBQVFrTSxNQUFNbE4sTUFBOUI7QUFDQSxNQUFJdVosWUFBWSxJQUFJblosVUFBVW9aLFlBQWQsQ0FBMkJuWCxJQUEzQixDQUFoQjs7QUFFQTtBQUNBLE1BQUlpWCxNQUFKLEVBQVk7QUFBQSxlQUNhLEtBQUtHLHNCQUFMLENBQTRCMWIsSUFBNUIsRUFBa0NrTixTQUFsQyxFQUE2Q2hLLEdBQTdDLEtBQXFELEVBRGxFO0FBQUE7QUFBQSxPQUNONEIsS0FETTtBQUFBLE9BQ0M2VyxRQUREOztBQUVYLE9BQUk3VyxLQUFKLEVBQVc7QUFDVjBXLGNBQVUxVyxLQUFWLEdBQWtCQSxLQUFsQjtBQUNBb0ksZ0JBQVl5TyxRQUFaO0FBQ0E7QUFDRDtBQUNEO0FBQ0F6TyxjQUFZLEtBQUs4TCxhQUFMLENBQW1CaFosSUFBbkIsRUFBeUJrTixTQUF6QixFQUFvQ2hLLEdBQXBDLENBQVo7QUFDQSxTQUFPLENBQUNzWSxTQUFELEVBQVl0TyxTQUFaLENBQVA7QUFDQSxFQXBoQmdCOzs7QUFzaEJqQjtBQUNBO0FBQ0F3Tyx1QkF4aEJpQixrQ0F3aEJNMWIsSUF4aEJOLEVBd2hCWWlELEtBeGhCWixFQXdoQm1CQyxHQXhoQm5CLEVBd2hCd0I7QUFDeEMsU0FBTyxLQUFLMlYsU0FBTCxDQUFlN1ksSUFBZixFQUFxQmlELEtBQXJCLEVBQTRCQyxHQUE1QixLQUNILEtBQUtpWSxrQkFBTCxDQUF3Qm5iLElBQXhCLEVBQThCaUQsS0FBOUIsRUFBcUNDLEdBQXJDLENBREcsSUFFSCxLQUFLMFYsZUFBTCxDQUFxQjVZLElBQXJCLEVBQTJCaUQsS0FBM0IsRUFBa0NDLEdBQWxDLENBRkcsSUFHSCxLQUFLMFksZ0NBQUwsQ0FBc0M1YixJQUF0QyxFQUE0Q2lELEtBQTVDLEVBQW1EQyxHQUFuRCxDQUhHLElBSUgsS0FBS3dWLFdBQUwsQ0FBaUIxWSxJQUFqQixFQUF1QmlELEtBQXZCLEVBQThCQyxHQUE5QixDQUpKO0FBTUEsRUEvaEJnQjs7O0FBaWlCakI7QUFDQTtBQUNBMFksaUNBbmlCaUIsNENBbWlCZ0I1YixJQW5pQmhCLEVBbWlCc0JpRCxLQW5pQnRCLEVBbWlCNkJDLEdBbmlCN0IsRUFtaUJrQztBQUNsRCxNQUFJTCxTQUFTLEtBQUs0VixTQUFMLENBQWV6WSxJQUFmLEVBQXFCaUQsS0FBckIsRUFBNEJDLEdBQTVCLENBQWI7QUFDQSxNQUFJLENBQUNMLE1BQUwsRUFBYTs7QUFGcUMsZ0NBSXhCQSxNQUp3QjtBQUFBLE1BSTVDekMsSUFKNEM7QUFBQSxNQUl0QzhNLFNBSnNDOztBQUtsRCxNQUFJekssUUFBUSxJQUFJSixVQUFVaUwsYUFBZCxDQUE0QmxOLElBQTVCLENBQVo7QUFDQSxTQUFPLENBQUNxQyxLQUFELEVBQVF5SyxTQUFSLENBQVA7QUFDQSxFQTFpQmdCOzs7QUE0aUJqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBdU87QUFDQyx3QkFBWW5YLElBQVosRUFBa0JRLEtBQWxCLEVBQXlCO0FBQUE7O0FBQ3hCLFFBQUtSLElBQUwsR0FBWUEsSUFBWjtBQUNBLE9BQUlRLFVBQVVuQyxTQUFkLEVBQXlCLEtBQUttQyxLQUFMLEdBQWFBLEtBQWI7QUFDekI7O0FBSkY7QUFBQTtBQUFBLDhCQUtZO0FBQ1YsUUFBSSxLQUFLQSxLQUFMLEtBQWVuQyxTQUFuQixFQUE4QixPQUFPLEtBQUsyQixJQUFaO0FBQzlCLFdBQVUsS0FBS0EsSUFBZixVQUF3QixLQUFLUSxLQUE3QjtBQUNBO0FBUkY7O0FBQUE7QUFBQSxJQXJqQmlCOztBQWlrQmpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NxVyxtQkF4a0JpQiw4QkF3a0JFbmIsSUF4a0JGLEVBd2tCd0I7QUFBQSxNQUFoQmlELEtBQWdCLHVFQUFSLENBQVE7QUFBQSxNQUFMQyxHQUFLOztBQUN4QyxNQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxNQUFNbEQsS0FBS2lDLE1BQTFDLEVBQWtEaUIsTUFBTWxELEtBQUtpQyxNQUFYO0FBQ2xELE1BQUlnQixTQUFTQyxHQUFiLEVBQWtCLE9BQU9QLFNBQVA7O0FBRWxCLE1BQUl1SyxZQUFZLEtBQUs4TCxhQUFMLENBQW1CaFosSUFBbkIsRUFBeUJpRCxLQUF6QixFQUFnQ0MsR0FBaEMsQ0FBaEI7QUFDQSxNQUFJMlksV0FBVyxLQUFLQyxrQkFBTCxDQUF3QixHQUF4QixFQUE2QixHQUE3QixFQUFrQzliLElBQWxDLEVBQXdDa04sU0FBeEMsRUFBbURoSyxHQUFuRCxDQUFmO0FBQ0EsTUFBSTJZLGFBQWFsWixTQUFqQixFQUE0QixPQUFPQSxTQUFQOztBQUU1QjtBQUNBLE1BQUlxUyxXQUFXaFYsS0FBSzhGLEtBQUwsQ0FBVzdDLFFBQVEsQ0FBbkIsRUFBc0I0WSxRQUF0QixDQUFmOztBQUVBO0FBQ0EsTUFBSTVNLGFBQWEsSUFBSTVNLFVBQVVpTCxhQUFkLENBQTRCMEgsUUFBNUIsQ0FBakI7QUFDQSxTQUFPLENBQUMvRixVQUFELEVBQWE0TSxXQUFXLENBQXhCLENBQVA7QUFDQSxFQXRsQmdCOzs7QUF3bEJqQjtBQUNBdk87QUFDQyx5QkFBWTBILFFBQVosRUFBc0I7QUFBQTs7QUFDckIsUUFBS0EsUUFBTCxHQUFnQkEsWUFBWSxFQUE1QjtBQUNBO0FBQ0Q7OztBQUpEO0FBQUE7QUFBQSx1QkFLYztBQUNaLFdBQU8zUyxVQUFVQyxRQUFWLENBQW1CLEtBQUswUyxRQUFMLENBQWN0SCxJQUFkLEVBQW5CLENBQVA7QUFDQTtBQVBGOztBQUFBO0FBQUEsSUF6bEJpQjs7QUFtbUJqQjtBQUNBO0FBQ0FxTyxxQkFBcUIsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsQ0FybUJKO0FBc21CbEI7QUFDQ1gsYUF2bUJpQix3QkF1bUJKcGIsSUF2bUJJLEVBdW1Ca0I7QUFBQSxNQUFoQmlELEtBQWdCLHVFQUFSLENBQVE7QUFBQSxNQUFMQyxHQUFLOztBQUNsQyxNQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxNQUFNbEQsS0FBS2lDLE1BQTFDLEVBQWtEaUIsTUFBTWxELEtBQUtpQyxNQUFYO0FBQ2xELE1BQUlnQixTQUFTQyxHQUFiLEVBQWtCLE9BQU9QLFNBQVA7O0FBRWxCO0FBQ0EsTUFBSXVLLFlBQVksS0FBSzhMLGFBQUwsQ0FBbUJoWixJQUFuQixFQUF5QmlELEtBQXpCLEVBQWdDQyxHQUFoQyxDQUFoQjtBQUNBLE1BQUkyWSxXQUFXLEtBQUtHLGVBQUwsQ0FBcUIsS0FBS0Qsa0JBQTFCLEVBQThDL2IsSUFBOUMsRUFBb0RrTixTQUFwRCxFQUErRGhLLEdBQS9ELENBQWY7QUFDQTtBQUNBLE1BQUkyWSxhQUFhM08sU0FBakIsRUFBNEIsT0FBT3ZLLFNBQVA7O0FBRTVCO0FBQ0EsTUFBSWtaLGFBQWFsWixTQUFqQixFQUE0QjtBQUMzQixPQUFJTixVQUFVMkQsSUFBZCxFQUFvQjtBQUNuQmhGLFlBQVEwSSxJQUFSLENBQWEsa0JBQWdCMUosS0FBSzhGLEtBQUwsQ0FBVzdDLEtBQVgsRUFBa0JBLFFBQVEsRUFBMUIsQ0FBaEIsR0FBOEMsZ0NBQTNEO0FBQ0E7QUFDRCxVQUFPTixTQUFQO0FBQ0E7O0FBRUQ7QUFDQSxNQUFJc1osVUFBVWpjLEtBQUs4RixLQUFMLENBQVc3QyxLQUFYLEVBQWtCNFksUUFBbEIsQ0FBZDtBQUNBLFNBQU8sQ0FBQ0ksT0FBRCxFQUFVSixRQUFWLENBQVA7QUFDQSxFQTVuQmdCOzs7QUFpb0JqQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Q7QUFDQzVCLGNBem9CaUIseUJBeW9CSGphLElBem9CRyxFQXlvQm1CO0FBQUEsTUFBaEJpRCxLQUFnQix1RUFBUixDQUFRO0FBQUEsTUFBTEMsR0FBSzs7QUFDbkMsTUFBSSxPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsTUFBTWxELEtBQUtpQyxNQUExQyxFQUFrRGlCLE1BQU1sRCxLQUFLaUMsTUFBWDtBQUNsRCxNQUFJZ0IsU0FBU0MsR0FBYixFQUFrQixPQUFPLEVBQVA7O0FBRWxCLE1BQUkrVSxVQUFValksS0FBSzBMLE9BQUwsQ0FBYSxJQUFiLEVBQW1CekksS0FBbkIsQ0FBZDtBQUNBLE1BQUlnVixZQUFZLENBQUMsQ0FBYixJQUFrQkEsVUFBVS9VLEdBQWhDLEVBQXFDK1UsVUFBVS9VLEdBQVY7QUFDckMsU0FBT2xELEtBQUs4RixLQUFMLENBQVc3QyxLQUFYLEVBQWtCZ1YsT0FBbEIsQ0FBUDtBQUNBLEVBaHBCZ0I7OztBQWtwQmpCO0FBQ0Q7QUFDQ29ELGtCQXBwQmlCLDZCQW9wQkNuYixNQXBwQkQsRUFvcEJTRixJQXBwQlQsRUFvcEIrQjtBQUFBLE1BQWhCaUQsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQy9DLE1BQUksT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1sRCxLQUFLaUMsTUFBMUMsRUFBa0RpQixNQUFNbEQsS0FBS2lDLE1BQVg7QUFDbEQsTUFBSWdCLFNBQVNDLEdBQWIsRUFBa0IsT0FBT1AsU0FBUDs7QUFFbEIsTUFBSXVaLFlBQVlqWixRQUFRL0MsT0FBTytCLE1BQS9CO0FBQ0EsTUFBSWlhLFlBQVloWixHQUFoQixFQUFxQixPQUFPUCxTQUFQO0FBQ3JCLFNBQU96QyxXQUFXRixLQUFLOEYsS0FBTCxDQUFXN0MsS0FBWCxFQUFrQmlaLFNBQWxCLENBQWxCO0FBQ0EsRUEzcEJnQjs7O0FBOHBCakI7QUFDQTtBQUNBO0FBQ0E7QUFDRDtBQUNDekMsc0JBbnFCaUIsaUNBbXFCS3hLLFVBbnFCTCxFQW1xQmlCalAsSUFucUJqQixFQW1xQnVDO0FBQUEsTUFBaEJpRCxLQUFnQix1RUFBUixDQUFRO0FBQUEsTUFBTEMsR0FBSzs7QUFDdkQsTUFBSSxPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsTUFBTWxELEtBQUtpQyxNQUExQyxFQUFrRGlCLE1BQU1sRCxLQUFLaUMsTUFBWDtBQUNsRCxNQUFJZ0IsU0FBU0MsR0FBYixFQUFrQixPQUFPUCxTQUFQOztBQUVsQixNQUFJd1osT0FBT25jLEtBQUs4RixLQUFMLENBQVc3QyxLQUFYLEVBQWtCQyxHQUFsQixDQUFYO0FBQ0EsU0FBT2laLEtBQUtoTixLQUFMLENBQVdGLFVBQVgsQ0FBUDtBQUNBLEVBenFCZ0I7OztBQTJxQmpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNEO0FBQ0M2TSxtQkFyckJpQiw4QkFxckJFTSxjQXJyQkYsRUFxckJrQkMsWUFyckJsQixFQXFyQmdDcmMsSUFyckJoQyxFQXFyQnNEO0FBQUEsTUFBaEJpRCxLQUFnQix1RUFBUixDQUFRO0FBQUEsTUFBTEMsR0FBSzs7QUFDdEUsTUFBSSxPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsTUFBTWxELEtBQUtpQyxNQUExQyxFQUFrRGlCLE1BQU1sRCxLQUFLaUMsTUFBWDtBQUNsRCxNQUFJZ0IsU0FBU0MsR0FBYixFQUFrQixPQUFPUCxTQUFQOztBQUVsQixNQUFJM0MsS0FBS2lELEtBQUwsTUFBZ0JtWixjQUFwQixFQUFvQyxPQUFPelosU0FBUDs7QUFFcEMsTUFBSWdELFVBQVUsQ0FBZDtBQUNBLE1BQUkrTyxVQUFVelIsS0FBZDtBQUNBLFNBQU95UixVQUFVeFIsR0FBakIsRUFBc0I7QUFDckIsT0FBSTRXLE9BQU85WixLQUFLMFUsT0FBTCxDQUFYO0FBQ0E7QUFDQSxPQUFJb0YsU0FBU3NDLGNBQWIsRUFBNkI7QUFDNUJ6VztBQUNBO0FBQ0Q7QUFIQSxRQUlLLElBQUltVSxTQUFTdUMsWUFBYixFQUEyQjtBQUMvQjFXO0FBQ0EsU0FBSUEsWUFBWSxDQUFoQixFQUFtQixPQUFPK08sT0FBUDtBQUNuQjtBQUNEO0FBSkssU0FLQSxJQUFJb0YsU0FBUyxHQUFULElBQWdCQSxTQUFTLEdBQTdCLEVBQWtDO0FBQUEsa0JBQ1osS0FBS2pCLFNBQUwsQ0FBZTdZLElBQWYsRUFBcUIwVSxPQUFyQixFQUE4QnhSLEdBQTlCLEtBQXNDLEVBRDFCO0FBQUE7QUFBQSxVQUNqQ1QsS0FEaUM7QUFBQSxVQUMxQjZaLFVBRDBCOztBQUV0QzVILGdCQUFVNEgsVUFBVjtBQUNBLGVBSHNDLENBRzVCO0FBQ1Y7QUFDRDtBQUxLLFVBTUEsSUFBSXhDLFNBQVMsSUFBYixFQUFtQjtBQUN2QkEsY0FBTzlaLEtBQUswVSxVQUFVLENBQWYsQ0FBUDtBQUNBLFdBQUlvRixTQUFTc0MsY0FBVCxJQUNBdEMsU0FBU3VDLFlBRFQsSUFFQXZDLFNBQVMsR0FGVCxJQUdBQSxTQUFTLEdBSGIsRUFJRTtBQUNEcEYsa0JBQVU7QUFDVjtBQUNEO0FBQ0RBO0FBQ0E7QUFDRCxFQTN0QmdCOzs7QUE4dEJqQjtBQUNBO0FBQ0Q7QUFDQ3NILGdCQWp1QmlCLDJCQWl1QkRPLEtBanVCQyxFQWl1Qk12YyxJQWp1Qk4sRUFpdUI0QjtBQUFBLE1BQWhCaUQsS0FBZ0IsdUVBQVIsQ0FBUTtBQUFBLE1BQUxDLEdBQUs7O0FBQzVDLE1BQUksT0FBT0EsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLE1BQU1sRCxLQUFLaUMsTUFBMUMsRUFBa0RpQixNQUFNbEQsS0FBS2lDLE1BQVg7QUFDbEQsTUFBSWdCLFNBQVNDLEdBQWIsRUFBa0IsT0FBT1AsU0FBUDs7QUFFbEIsU0FBT00sUUFBUUMsR0FBZixFQUFvQjtBQUNuQixPQUFJNFcsT0FBTzlaLEtBQUtpRCxLQUFMLENBQVg7QUFDQSxPQUFJc1osTUFBTXhJLFFBQU4sQ0FBZStGLElBQWYsQ0FBSixFQUEwQixPQUFPN1csS0FBUDtBQUMxQjtBQUNBLE9BQUk2VyxTQUFTLElBQVQsSUFBaUJ5QyxNQUFNeEksUUFBTixDQUFlL1QsS0FBS2lELFFBQU0sQ0FBWCxDQUFmLENBQXJCLEVBQW9EQTtBQUNwREE7QUFDQTtBQUNELE1BQUlBLFNBQVNDLEdBQWIsRUFBa0IsT0FBT1AsU0FBUDtBQUNsQixTQUFPTSxLQUFQO0FBQ0EsRUE5dUJnQjs7O0FBaXZCbEI7QUFDQTtBQUNBOztBQUVDO0FBQ0FMLHdCQXR2QmlCLG1DQXN2Qk9SLE1BdHZCUCxFQXN2QjBCO0FBQUEsTUFBWGEsS0FBVyx1RUFBSCxDQUFHOztBQUMxQyxTQUFPYixPQUFPYSxLQUFQLGFBQXlCWixVQUFVZ1QsVUFBMUM7QUFBc0RwUztBQUF0RCxHQUNBLElBQUlBLFVBQVUsQ0FBZCxFQUFpQixPQUFPYixNQUFQO0FBQ2pCLFNBQU9BLE9BQU8wRCxLQUFQLENBQWE3QyxLQUFiLENBQVA7QUFDQSxFQTF2QmdCOzs7QUE0dkJqQjtBQUNBdVosdUJBN3ZCaUIsa0NBNnZCTXBhLE1BN3ZCTixFQTZ2QmM7QUFDOUIsU0FBT0EsT0FBT0csTUFBUCxDQUFjO0FBQUEsVUFBUyxDQUFDRixVQUFVRyxrQkFBVixDQUE2QkMsS0FBN0IsQ0FBVjtBQUFBLEdBQWQsQ0FBUDtBQUNBLEVBL3ZCZ0I7OztBQWt3QmpCO0FBQ0FELG1CQW53QmlCLDhCQW13QkVDLEtBbndCRixFQW13QlM7QUFDekIsU0FBT0EsaUJBQWlCSixVQUFVZ1QsVUFBM0IsSUFDSCxFQUFFNVMsaUJBQWlCSixVQUFVNlYsTUFBN0IsQ0FERyxJQUVGelYsVUFBVUosVUFBVThWLE9BRnpCO0FBR0EsRUF2d0JnQjs7O0FBMHdCbEI7QUFDQTtBQUNBOztBQUVDO0FBQ0F6STtBQUNDLGlCQUFZckwsS0FBWixFQUFrQjtBQUFBOztBQUNqQnhDLFVBQU9DLE1BQVAsQ0FBYyxJQUFkLEVBQW9CdUMsS0FBcEI7QUFDQSxPQUFJLENBQUMsS0FBSzJRLFFBQVYsRUFBb0IsS0FBS0EsUUFBTCxHQUFnQixFQUFoQjtBQUNwQjs7QUFKRjtBQUFBO0FBQUEsOEJBTVk7QUFDVixXQUFPaE0sS0FBS0UsU0FBTCxDQUFlLElBQWYsRUFBcUIsSUFBckIsRUFBMkIsSUFBM0IsQ0FBUDtBQUNBO0FBUkY7O0FBQUE7QUFBQSxJQS93QmlCOztBQTB4QmpCO0FBQ0E7QUFDQTtBQUNBdVQsZUE3eEJpQiwwQkE2eEJGcmEsTUE3eEJFLEVBNnhCTTtBQUN0QjtBQUNBLE1BQUlzYSxjQUFjLEVBQWxCO0FBQ0EsTUFBSS9RLFFBQVEsQ0FBQytRLFdBQUQsQ0FBWjtBQUNBdGEsU0FBT3dCLE9BQVAsQ0FBZSxpQkFBUztBQUN2QjtBQUNBLE9BQUluQixVQUFVSixVQUFVOFYsT0FBeEIsRUFBaUM7QUFDaEM7QUFDQXVFLGtCQUFjLEVBQWQ7QUFDQSxXQUFPL1EsTUFBTW1GLElBQU4sQ0FBVzRMLFdBQVgsQ0FBUDtBQUNBOztBQUVEO0FBQ0FBLGVBQVk1TCxJQUFaLENBQWlCck8sS0FBakI7QUFDQSxHQVZEOztBQVlBO0FBQ0FrSixRQUFNL0gsT0FBTixDQUFjLFVBQUNpSSxJQUFELEVBQU91RixLQUFQLEVBQWlCO0FBQzlCLE9BQUl2RixLQUFLNUosTUFBTCxLQUFnQixDQUFoQixJQUFxQjRKLEtBQUssQ0FBTCxhQUFtQnhKLFVBQVVnVCxVQUF0RCxFQUFrRTFKLE1BQU15RixLQUFOLElBQWUsRUFBZjtBQUNsRSxHQUZEOztBQUlBLFNBQU96RixLQUFQO0FBQ0EsRUFuekJnQjs7O0FBcXpCakI7QUFDQTtBQUNBZ1IsZUF2ekJpQiwwQkF1ekJGaFIsS0F2ekJFLEVBdXpCd0I7QUFBQSxNQUFuQmlSLGFBQW1CLHVFQUFILENBQUc7O0FBQ3hDLE1BQUlqUixNQUFNMUosTUFBTixLQUFpQixDQUFyQixFQUF3QixPQUFPLEVBQVA7O0FBRXhCLE1BQU00YSxVQUFVbFIsTUFBTWpILEdBQU4sQ0FBVXJDLFVBQVV5YSxhQUFwQixDQUFoQjtBQUNBLE1BQU01WixNQUFNMlosUUFBUTVhLE1BQXBCOztBQUVBO0FBQ0EsTUFBSThhLGNBQWNDLGNBQWMsQ0FBZCxDQUFsQjtBQUNBLE1BQUlELGdCQUFnQnBhLFNBQXBCLEVBQStCb2EsY0FBY0gsYUFBZDs7QUFFL0I7QUFDQSxPQUFLLElBQUl4TCxRQUFRLENBQWpCLEVBQW9CQSxRQUFRbE8sR0FBNUIsRUFBaUNrTyxPQUFqQyxFQUEwQztBQUN6QyxPQUFJeUwsUUFBUXpMLEtBQVIsTUFBbUJ6TyxTQUF2QixFQUFrQztBQUNqQ2thLFlBQVF6TCxLQUFSLElBQWlCNEwsY0FBYzVMLFFBQVEsQ0FBdEIsQ0FBakI7QUFDQTtBQUNEO0FBQ0QsU0FBT3lMLE9BQVA7O0FBRUE7QUFDQSxXQUFTRyxhQUFULENBQXVCNUwsS0FBdkIsRUFBOEI7QUFDN0IsVUFBT0EsUUFBUWxPLEdBQWYsRUFBb0I7QUFDbkIsUUFBSTJaLFFBQVF6TCxLQUFSLE1BQW1Cek8sU0FBdkIsRUFBa0MsT0FBT2thLFFBQVF6TCxLQUFSLENBQVA7QUFDbENBO0FBQ0E7QUFDRCxVQUFPMkwsV0FBUDtBQUNBO0FBQ0QsRUFqMUJnQjs7O0FBbzFCakI7QUFDQTtBQUNBO0FBQ0FELGNBdjFCaUIseUJBdTFCSGpSLElBdjFCRyxFQXUxQkc7QUFDbkIsTUFBSSxDQUFDQSxJQUFELElBQVNBLEtBQUs1SixNQUFMLEtBQWdCLENBQTdCLEVBQWdDLE9BQU9VLFNBQVA7QUFDaEMsTUFBSWtKLEtBQUssQ0FBTCxhQUFtQnhKLFVBQVU2VixNQUFqQyxFQUF5QyxPQUFPck0sS0FBSyxDQUFMLEVBQVE1SixNQUFmO0FBQ3pDLFNBQU8sQ0FBUDtBQUNBLEVBMzFCZ0I7OztBQTYxQmpCO0FBQ0E7QUFDQWtVLGtCQUFpQix5QkFBUy9ULE1BQVQsRUFBaUQ7QUFBQSxNQUFoQ2EsS0FBZ0MsdUVBQXhCLENBQXdCO0FBQUEsTUFBckJDLEdBQXFCLHVFQUFmZCxPQUFPSCxNQUFROztBQUNqRTtBQUNBRyxXQUFTQSxPQUFPMEQsS0FBUCxDQUFhN0MsS0FBYixFQUFvQkMsR0FBcEIsQ0FBVDtBQUNBO0FBQ0Y7QUFDRWQsV0FBU0MsVUFBVW1hLHNCQUFWLENBQWlDcGEsTUFBakMsQ0FBVDs7QUFFQTtBQUNBLE1BQUl1SixRQUFRdEosVUFBVW9hLGNBQVYsQ0FBeUJyYSxNQUF6QixDQUFaO0FBQ0EsTUFBSXVKLE1BQU0xSixNQUFOLEtBQWlCLENBQXJCLEVBQXdCLE9BQU8sRUFBUDs7QUFFeEI7QUFDQSxNQUFJNGEsVUFBVXhhLFVBQVVzYSxjQUFWLENBQXlCaFIsS0FBekIsQ0FBZDs7QUFFQTtBQUNBLE1BQUlzUixZQUFZQyxLQUFLQyxHQUFMLENBQVM3YixLQUFULENBQWU0YixJQUFmLEVBQXFCTCxPQUFyQixDQUFoQjtBQUNBLE1BQUlwTixRQUFRLElBQUlwTixVQUFVcU4sS0FBZCxDQUFvQixFQUFFcUYsUUFBUWtJLFNBQVYsRUFBcEIsQ0FBWjs7QUFFQTtBQUNBLE1BQUk5WixRQUFRLENBQUNzTSxLQUFELENBQVo7O0FBRUE5RCxRQUFNL0gsT0FBTixDQUFlLFVBQUNpSSxJQUFELEVBQU91RixLQUFQLEVBQWlCO0FBQy9CO0FBQ0F2RixVQUFPeEosVUFBVU8sdUJBQVYsQ0FBa0NpSixJQUFsQyxDQUFQOztBQUVBLE9BQUl1UixhQUFhUCxRQUFRekwsS0FBUixDQUFqQjtBQUNBLE9BQUkxSixNQUFNdkUsTUFBTUEsTUFBTWxCLE1BQU4sR0FBZSxDQUFyQixDQUFWO0FBQ0E7QUFDQSxPQUFJbWIsYUFBYTFWLElBQUlxTixNQUFyQixFQUE2QjtBQUM1QixXQUFPcUksYUFBYTFWLElBQUlxTixNQUF4QixFQUFnQztBQUMvQixTQUFJc0ksV0FBVyxJQUFJaGIsVUFBVXFOLEtBQWQsQ0FBb0IsRUFBRXFGLFFBQVFyTixJQUFJcU4sTUFBSixHQUFhLENBQXZCLEVBQXBCLENBQWY7QUFDQXJOLFNBQUlzTixRQUFKLENBQWFsRSxJQUFiLENBQWtCdU0sUUFBbEI7QUFDQWxhLFdBQU0yTixJQUFOLENBQVd1TSxRQUFYOztBQUVBM1YsV0FBTTJWLFFBQU47QUFDQTtBQUNEO0FBQ0Q7QUFUQSxRQVVLLElBQUlELGFBQWExVixJQUFJcU4sTUFBckIsRUFBNkI7QUFDakMsWUFBT3FJLGFBQWExVixJQUFJcU4sTUFBeEIsRUFBZ0M7QUFDL0I1UixZQUFNNFQsR0FBTjtBQUNBclAsWUFBTXZFLE1BQU1BLE1BQU1sQixNQUFOLEdBQWUsQ0FBckIsQ0FBTjtBQUNBO0FBQ0Q7QUFDRDtBQUNBeUYsT0FBSXNOLFFBQUosQ0FBYWxFLElBQWIsQ0FBa0JqRixJQUFsQjtBQUNBLEdBekJEOztBQTJCQSxTQUFPNEQsS0FBUDtBQUNBOztBQWg1QmdCLENBQWxCOztrQkF1NUJlcE4sUzs7Ozs7OztBQ3Q4QmYsNkJBQTZCO0FBQzdCLHVDQUF1Qzs7Ozs7Ozs7QUNEdkM7QUFDQTtBQUNBOzs7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsV0FBVyxFQUFFO0FBQ3JELHdDQUF3QyxXQUFXLEVBQUU7O0FBRXJEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0Esc0NBQXNDO0FBQ3RDLEdBQUc7QUFDSDtBQUNBLDhEQUE4RDtBQUM5RDs7QUFFQTtBQUNBO0FBQ0EsRUFBRTs7QUFFRjtBQUNBO0FBQ0E7Ozs7Ozs7O0FDeEZBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLGdDQUFnQyxVQUFVLEVBQUU7QUFDNUMsQzs7Ozs7OztBQ3pCQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxnQ0FBZ0MsVUFBVSxFQUFFO0FBQzVDLEM7Ozs7Ozs7Ozs7Ozs7UUNuQmdCaWIsVSxHQUFBQSxVO0FBTmhCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ08sU0FBU0EsVUFBVCxDQUFvQmxaLFdBQXBCLEVBQTBEO0FBQUEsTUFBekJFLElBQXlCLHVFQUFsQkYsWUFBWUUsSUFBTTs7QUFDL0Q7QUFDQTVELFNBQU82YyxjQUFQLEdBQXdCblosV0FBeEI7QUFDQSxNQUFNNEksUUFBUSxJQUFJd1EsUUFBSixDQUFhLE1BQWIsb0JBQXFDbFosSUFBckMsa0NBQWQ7QUFDQSxTQUFPNUQsT0FBTzZjLGNBQWQ7QUFDQSxTQUFPdlEsS0FBUDtBQUNELEM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDUkQ7Ozs7QUFDQTs7Ozs7Ozs7OzsrZUFMQTtBQUNBO0FBQ0E7O0FBS0E7QUFDQSxJQUFNM0gsU0FBUzVELGlCQUFPMkQsU0FBUCxDQUFpQixJQUFqQixDQUFmO2tCQUNlQyxNOzs7QUFFZkEsT0FBT3lILFdBQVA7QUFDRTtBQUNBO0FBQ0V4SSxRQUFNLE9BRFI7QUFFRVUsU0FBTyxDQUFDLFdBQUQsRUFBYyxjQUFkLEVBQThCLE9BQTlCLENBRlQ7QUFHRUMsVUFBUSxzREFIVjtBQUlBO0FBQ0ViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHVCQUM0QixLQUFLOEosT0FEakM7QUFBQSxZQUNIdUksT0FERyxZQUNIQSxPQURHO0FBQUEseUNBQ01nSCxRQUROO0FBQUEsWUFDTUEsUUFETixxQ0FDaUIsTUFEakI7O0FBRVQsc0NBQTRCaEgsT0FBNUIsVUFBd0NnSCxRQUF4QztBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUFpQzFaLGVBQUs4SyxRQUF0QyxDQUxGO0FBV0UzSixTQUFPLENBQ0w7QUFDRW9KLGVBQVcsV0FEYjtBQUVFcEosV0FBTyxDQUNMLG1EQURLLEVBRUwsdURBRkssRUFHTCw2REFISyxFQUlMLHFFQUpLO0FBRlQsR0FESztBQVhULENBRkY7O0FBMEJFO0FBQ0E7QUFDQTtBQUNBO0FBQ0VaLFFBQU0sTUFEUjtBQUVFVSxTQUFPLFdBRlQ7QUFHRUMsVUFBUSxxREFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx3QkFDNEIsS0FBSzhKLE9BRGpDO0FBQUEsWUFDSHVJLE9BREcsYUFDSEEsT0FERztBQUFBLDJDQUNNZ0gsUUFETjtBQUFBLFlBQ01BLFFBRE4sc0NBQ2lCLE1BRGpCOztBQUVULHFDQUEyQmhILE9BQTNCLFVBQXVDZ0gsUUFBdkM7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBZ0MxWixlQUFLOEssUUFBckMsQ0FKRjtBQVVFM0osU0FBTyxDQUNMO0FBQ0VvSixlQUFXLFdBRGI7QUFFRXBKLFdBQU8sQ0FDTCxpREFESyxFQUVMLDJEQUZLLEVBR0wscURBSEssRUFJTCxtRUFKSztBQUZULEdBREs7QUFWVCxDQTdCRjs7QUFxREU7QUFDQTtBQUNBO0FBQ0E7QUFDRVosUUFBTSxTQURSO0FBRUVVLFNBQU8sV0FGVDtBQUdFQyxVQUFRLDRGQUhWO0FBSUViO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxpQ0FDYTtBQUFBLHdCQUN1RCxLQUFLOEosT0FENUQ7QUFBQSxZQUNIdUksT0FERyxhQUNIQSxPQURHO0FBQUEsMkNBQ01nSCxRQUROO0FBQUEsWUFDTUEsUUFETixzQ0FDaUIsTUFEakI7QUFBQSw4Q0FDeUJDLFlBRHpCO0FBQUEsWUFDeUJBLFlBRHpCLHlDQUN3QyxVQUR4Qzs7QUFFVCx3Q0FBOEJqSCxPQUE5QixVQUEwQ2dILFFBQTFDLFVBQXVEQyxZQUF2RDtBQUNEO0FBSkg7O0FBQUE7QUFBQSxJQUFtQzNaLGVBQUs4SyxRQUF4QyxDQUpGO0FBVUUzSixTQUFPLENBQ0w7QUFDRW9KLGVBQVcsV0FEYjtBQUVFcEosV0FBTyxDQUNMLG1FQURLLEVBRUwsNkVBRkssRUFHTCxvRkFISyxFQUlMLG1GQUpLLEVBS0wsK0ZBTEs7QUFGVCxHQURLO0FBVlQsQ0F4REYsRTs7Ozs7OztBQ1hBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBnbG9iYWwgZnJvbSBcIi4vZ2xvYmFsXCI7XG5cbi8vIFJldHVybiB0cnVlIGlmIHRleHQgaXMgYWxsIHdoaXRlc3BhY2UsIGluY2x1ZGluZyBlbXB0eSBzdHJpbmcuXG5sZXQgQUxMX1dISVRFU1BBQ0UgPSAvXlxccyokLztcbmV4cG9ydCBmdW5jdGlvbiBpc1doaXRlc3BhY2UodGV4dCkge1xuXHRyZXR1cm4gQUxMX1dISVRFU1BBQ0UudGVzdCh0ZXh0KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd1doaXRlc3BhY2Uoc3RyaW5nKSB7XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSBcInN0cmluZ1wiKSByZXR1cm4gc3RyaW5nO1xuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoL1xcbi9nLCBcIsKsXCIpXG4gICAgICAgICAgLnJlcGxhY2UoL1xcdC9nLCBcIuKIhlwiKTtcbn1cblxuLy8gUmV0dXJuIHRoZSBwbHVyYWwgb2YgYHdvcmRgLlxuLy8gTk9URTogdGhpcyBpcyBub3QgdmVyeSBnb29kIGF0IGFsbCEhIVxuLy8gVE9ETzogZXhjZXB0aW9ucywgZXRjLlxuZXhwb3J0IGZ1bmN0aW9uIHBsdXJhbGl6ZSh3b3JkKSB7XG5cdHJldHVybiB3b3JkICsgXCJzXCI7XG59XG5cbi8vIFJldHVybiB0cnVlIGlmIHdvcmQgaXMgYSBwbHVyYWwuXG4vLyBOT1RFOiBmb3Igd29yZHMgd2hpY2ggYXJlIEJPVEggc2luZ3VsYXIgYW5kIHBsdXJhbCwgdGhpcyB3aWxsIHJldHVybiB0cnVlLlxuZXhwb3J0IGZ1bmN0aW9uIGlzUGx1cmFsKHdvcmQpIHtcblx0cmV0dXJuIHdvcmQgPT09IHBsdXJhbGl6ZSh3b3JkKTtcbn1cblxuXG4vLyBSZXR1cm4gdGhlIHNpbmd1bGFyIG9mIGB3b3JkYC5cbi8vIE5PVEU6IHRoaXMgaXMgbm90IHZlcnkgZ29vZCBhdCBhbGwhISFcbi8vIFRPRE86IGV4Y2VwdGlvbnMsIGV0Yy5cbmV4cG9ydCBmdW5jdGlvbiBzaW5ndWxhcml6ZSh3b3JkKSB7XG5cdHJldHVybiB3b3JkLnJlcGxhY2UoL2U/cyQvLCBcIlwiKTtcbn1cblxuLy8gUmV0dXJuIHRydWUgaWYgd29yZCBpcyBhIHNpbmd1bGFyLlxuLy8gTk9URTogZm9yIHdvcmRzIHdoaWNoIGFyZSBCT1RIIHNpbmd1bGFyIGFuZCBwbHVyYWwsIHRoaXMgd2lsbCByZXR1cm4gdHJ1ZS5cbmV4cG9ydCBmdW5jdGlvbiBpc1Npbmd1bGFyKHdvcmQpIHtcblx0cmV0dXJuIHdvcmQgPT09IHNpbmd1bGFyaXplKHdvcmQpO1xufVxuXG5cbi8vIFJldHVybiBhIGNlcnRhaW4gYG51bWJlcmAgb2YgdGFiIGNoYXJhY3RlcnMuXG5jb25zdCBUQUJTID0gXCJcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcIjtcbmV4cG9ydCBmdW5jdGlvbiBnZXRUYWJzKG51bWJlcikge1xuXHRpZiAodHlwZW9mIG51bWJlciAhPT0gXCJudW1iZXJcIikgcmV0dXJuIFwiXCI7XG5cdHJldHVybiBUQUJTLnN1YnN0cigwLCBudW1iZXIpO1xufVxuXG5cbi8vIEV4cG9ydCBhbGwgYXMgYSBsdW1wXG5sZXQgYWxsRXhwb3J0cyA9IHsuLi5leHBvcnRzfTtcbmV4cG9ydCBkZWZhdWx0IGFsbEV4cG9ydHM7XG5cbi8vIERFQlVHOiBwdXQgb24gZ2xvYmFsIGZvciBkZWJ1Z2dpbmcuXG5nbG9iYWwuU1RSSU5HID0gYWxsRXhwb3J0cztcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91dGlscy9zdHJpbmcuanMiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICghaXNPYmplY3QoaXQpKSB0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XG4gIHJldHVybiBpdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanNcbi8vIG1vZHVsZSBpZCA9IDExNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGVjKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19mYWlscy5qc1xuLy8gbW9kdWxlIGlkID0gMTE1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAnY29yZS1qcy9lczYvc3ltYm9sJztcblxuLy8gVE9ETzogTmVlZCBiZXR0ZXIsIG1vcmUgY29tcGxldGUsIGFuZCBtb3JlIG1ldGhvZGljYWwga2V5IGRlZmluaXRpb25zXG5cbnZhciBLZXlzID0ge1xuICBiYWNrc3BhY2U6IDgsXG4gIGRlbDogNDYsXG4gIGRlbGV0ZTogNDYsXG4gIHRhYjogOSxcbiAgZW50ZXI6IDEzLFxuICAncmV0dXJuJzogMTMsXG4gIGVzYzogMjcsXG4gIHNwYWNlOiAzMixcbiAgcGFnZVVwOiAzMyxcbiAgcGFnZURvd246IDM0LFxuICBlbmQ6IDM1LFxuICBob21lOiAzNixcbiAgbGVmdDogMzcsXG4gIHVwOiAzOCxcbiAgcmlnaHQ6IDM5LFxuICBkb3duOiA0MCxcbiAgJzsnOiAxODYsXG4gICc9JzogMTg3LFxuICAnLCc6IDE4OCxcbiAgJy0nOiAxODksXG4gICcuJzogMTkwLFxuICAnLyc6IDE5MSxcbiAgJ2AnOiAxOTIsXG4gICdbJzogMjE5LFxuICAnXFxcXCc6IDIyMCxcbiAgJ10nOiAyMjFcbn07XG5cbi8vIEFkZCB1cHBlcmNhc2UgdmVyc2lvbnMgb2Yga2V5cyBhYm92ZSBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbk9iamVjdC5rZXlzKEtleXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gS2V5c1trZXkudG9VcHBlckNhc2UoKV0gPSBLZXlzW2tleV07XG59KTtcblxuJzAxMjM0NTY3ODknLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChudW0sIGluZGV4KSB7XG4gIHJldHVybiBLZXlzW251bV0gPSBpbmRleCArIDQ4O1xufSk7XG5cbidBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWicuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24gKGxldHRlciwgaW5kZXgpIHtcbiAgS2V5c1tsZXR0ZXJdID0gaW5kZXggKyA2NTtcbiAgS2V5c1tsZXR0ZXIudG9Mb3dlckNhc2UoKV0gPSBpbmRleCArIDY1O1xufSk7XG5cbi8vIGZuIGtleXNcblsxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCwgMTEsIDEyXS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xuICByZXR1cm4gS2V5c1snZicgKyBpbmRleF0gPSAxMTEgKyBpbmRleDtcbn0pO1xuXG5leHBvcnQgdmFyIG1vZGlmaWVycyA9IHtcbiAgY29udHJvbDogJ2N0cmwnLFxuICBjdHJsOiAnY3RybCcsXG4gIHNoaWZ0OiAnc2hpZnQnLFxuICBtZXRhOiAnbWV0YScsXG4gIGNtZDogJ21ldGEnLFxuICBjb21tYW5kOiAnbWV0YScsXG4gIG9wdGlvbjogJ2FsdCcsXG4gIGFsdDogJ2FsdCdcbn07XG5cbmV4cG9ydCB2YXIgQUxMX0tFWVMgPSBTeW1ib2woJ0FMTF9LRVlTJyk7XG5cbmV4cG9ydCB2YXIgQUxMX1BSSU5UQUJMRV9LRVlTID0gU3ltYm9sKCdBTExfUFJJTlRBQkxFX0tFWVMnKTtcblxuZXhwb3J0IGRlZmF1bHQgS2V5cztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9saWIva2V5cy5qc1xuLy8gbW9kdWxlIGlkID0gMTQ4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBfc2xpY2VkVG9BcnJheSA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gc2xpY2VJdGVyYXRvcihhcnIsIGkpIHsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0pIF9pW1wicmV0dXJuXCJdKCk7IH0gZmluYWxseSB7IGlmIChfZCkgdGhyb3cgX2U7IH0gfSByZXR1cm4gX2FycjsgfSByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IHJldHVybiBhcnI7IH0gZWxzZSBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSB7IHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7IH0gZWxzZSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpOyB9IH07IH0oKTtcblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbi8qKlxuICogQG1vZHVsZSBzdG9yZVxuICpcbiAqL1xuaW1wb3J0IG1hdGNoS2V5cyBmcm9tICcuL2xpYi9tYXRjaF9rZXlzJztcbmltcG9ydCBwYXJzZUtleXMgZnJvbSAnLi9saWIvcGFyc2Vfa2V5cyc7XG5pbXBvcnQgdXVpZCBmcm9tICcuL2xpYi91dWlkJztcblxuLyoqXG4gKiBwcml2YXRlXG4gKlxuICovXG5cbi8vIGRpY3QgZm9yIGNsYXNzIHByb3RvdHlwZXMgPT4gYmluZGluZ3NcbnZhciBfaGFuZGxlcnMgPSBuZXcgTWFwKCk7XG5cbi8vIGFsbCBtb3VudGVkIGluc3RhbmNlcyB0aGF0IGhhdmUga2V5YmluZGluZ3NcbnZhciBfaW5zdGFuY2VzID0gbmV3IFNldCgpO1xuXG4vLyBmb3IgdGVzdGluZ1xuZXhwb3J0IGZ1bmN0aW9uIF9yZXNldFN0b3JlKCkge1xuICBfaGFuZGxlcnMuY2xlYXIoKTtcbiAgX2luc3RhbmNlcy5jbGVhcigpO1xufVxuXG4vKipcbiAqIGFjdGl2YXRlXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSBpbnN0YW5jZSBJbnN0YW50aWF0ZWQgY2xhc3MgdGhhdCBleHRlbmRlZCBSZWFjdC5Db21wb25lbnQsIHRvIGJlIGZvY3VzZWQgdG8gcmVjZWl2ZSBrZXlkb3duIGV2ZW50c1xuICovXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoaW5zdGFuY2VzKSB7XG4gIHZhciBpbnN0YW5jZXNBcnJheSA9IFtdLmNvbmNhdChpbnN0YW5jZXMpO1xuXG4gIC8vIGlmIG5vIGNvbXBvbmVudHMgd2VyZSBmb3VuZCBhcyBhbmNlc3RvcnMgb2YgdGhlIGV2ZW50IHRhcmdldCxcbiAgLy8gZWZmZWN0aXZlbHkgZGVhY3RpdmF0ZSBrZXlkb3duIGhhbmRsaW5nIGJ5IGNhcHBpbmcgdGhlIHNldCBvZiBpbnN0YW5jZXNcbiAgLy8gd2l0aCBgbnVsbGAuXG4gIGlmICghaW5zdGFuY2VzQXJyYXkubGVuZ3RoKSB7XG4gICAgX2luc3RhbmNlcy5hZGQobnVsbCk7XG4gIH0gZWxzZSB7XG4gICAgX2luc3RhbmNlcy5kZWxldGUobnVsbCk7XG5cbiAgICAvLyBkZWxldGluZyBhbmQgdGhlbiBhZGRpbmcgdGhlIGluc3RhbmNlKHMpIGhhcyB0aGUgZWZmZWN0IG9mIHNvcnRpbmcgdGhlIHNldFxuICAgIC8vIGFjY29yZGluZyB0byBpbnN0YW5jZSBhY3RpdmF0aW9uIChhc2NlbmRpbmcpXG4gICAgaW5zdGFuY2VzQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICAgIF9pbnN0YW5jZXMuZGVsZXRlKGluc3RhbmNlKTtcbiAgICAgIF9pbnN0YW5jZXMuYWRkKGluc3RhbmNlKTtcbiAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiBkZWxldGVJbnN0YW5jZVxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IEluc3RhbnRpYXRlZCBjbGFzcyB0aGF0IGV4dGVuZGVkIFJlYWN0LkNvbXBvbmVudFxuICogQHJldHVybiB7Ym9vbGVhbn0gVGhlIHZhbHVlIHNldC5oYXMoIHRhcmdldCApIHdvdWxkIGhhdmUgcmV0dXJuZWQgcHJpb3IgdG8gZGVsZXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZUluc3RhbmNlKHRhcmdldCkge1xuICBfaW5zdGFuY2VzLmRlbGV0ZSh0YXJnZXQpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRCaW5kaW5nRm9yRXZlbnQoZXZlbnQpIHtcbiAgaWYgKCFfaW5zdGFuY2VzLmhhcyhudWxsKSkge1xuICAgIHZhciBrZXlNYXRjaGVzRXZlbnQgPSBmdW5jdGlvbiBrZXlNYXRjaGVzRXZlbnQoa2V5U2V0KSB7XG4gICAgICByZXR1cm4gbWF0Y2hLZXlzKHsga2V5U2V0OiBrZXlTZXQsIGV2ZW50OiBldmVudCB9KTtcbiAgICB9O1xuXG4gICAgLy8gbG9vcCB0aHJvdWdoIGluc3RhbmNlcyBpbiByZXZlcnNlIGFjdGl2YXRpb24gb3JkZXIgc28gdGhhdCBtb3N0XG4gICAgLy8gcmVjZW50bHkgYWN0aXZhdGVkIGluc3RhbmNlIGdldHMgZmlyc3QgZGlicyBvbiBldmVudFxuICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShfaW5zdGFuY2VzKSkucmV2ZXJzZSgpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICB2YXIgYmluZGluZ3MgPSBnZXRCaW5kaW5nKGluc3RhbmNlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSk7XG4gICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWU7XG4gICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yMiA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSBiaW5kaW5nc1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMjsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IChfc3RlcDIgPSBfaXRlcmF0b3IyLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZSkge1xuICAgICAgICAgICAgdmFyIF9zdGVwMiR2YWx1ZSA9IF9zbGljZWRUb0FycmF5KF9zdGVwMi52YWx1ZSwgMiksXG4gICAgICAgICAgICAgICAga2V5U2V0cyA9IF9zdGVwMiR2YWx1ZVswXSxcbiAgICAgICAgICAgICAgICBmbiA9IF9zdGVwMiR2YWx1ZVsxXTtcblxuICAgICAgICAgICAgaWYgKGtleVNldHMuc29tZShrZXlNYXRjaGVzRXZlbnQpKSB7XG4gICAgICAgICAgICAgIC8vIHJldHVybiB3aGVuIG1hdGNoaW5nIGtleWJpbmRpbmcgaXMgZm91bmQgLSBpLmUuIG9ubHkgb25lXG4gICAgICAgICAgICAgIC8vIGtleWJvdW5kIGNvbXBvbmVudCBjYW4gcmVzcG9uZCB0byBhIGdpdmVuIGtleSBjb2RlLiB0byBnZXQgYXJvdW5kIHRoaXMsXG4gICAgICAgICAgICAgIC8vIHNjb3BlIGEgY29tbW9uIGFuY2VzdG9yIGNvbXBvbmVudCBjbGFzcyB3aXRoIEBrZXlkb3duIGFuZCB1c2VcbiAgICAgICAgICAgICAgLy8gQGtleWRvd25TY29wZWQgdG8gYmluZCB0aGUgZHVwbGljYXRlIGtleXMgaW4geW91ciBjaGlsZCBjb21wb25lbnRzXG4gICAgICAgICAgICAgIC8vIChvciBqdXN0IGluc3BlY3QgbmV4dFByb3BzLmtleWRvd24uZXZlbnQpLlxuICAgICAgICAgICAgICByZXR1cm4geyBmbjogZm4sIGluc3RhbmNlOiBpbnN0YW5jZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IyID0gdHJ1ZTtcbiAgICAgICAgICBfaXRlcmF0b3JFcnJvcjIgPSBlcnI7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgJiYgX2l0ZXJhdG9yMi5yZXR1cm4pIHtcbiAgICAgICAgICAgICAgX2l0ZXJhdG9yMi5yZXR1cm4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMikge1xuICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBnZXRCaW5kaW5nXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXQgQ2xhc3MgdXNlZCBhcyBrZXkgaW4gZGljdCBvZiBrZXkgYmluZGluZ3NcbiAqIEByZXR1cm4ge29iamVjdH0gVGhlIG9iamVjdCBjb250YWluaW5nIGJpbmRpbmdzIGZvciB0aGUgZ2l2ZW4gY2xhc3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEJpbmRpbmcoX3JlZikge1xuICB2YXIgX19yZWFjdEtleWRvd25VVUlEID0gX3JlZi5fX3JlYWN0S2V5ZG93blVVSUQ7XG5cbiAgcmV0dXJuIF9oYW5kbGVycy5nZXQoX19yZWFjdEtleWRvd25VVUlEKTtcbn07XG5cbi8qKlxuICogZ2V0SW5zdGFuY2VzXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEByZXR1cm4ge3NldH0gQWxsIHN0b3JlZCBpbnN0YW5jZXMgKGFsbCBtb3VudGVkIGNvbXBvbmVudCBpbnN0YW5jZXMgd2l0aCBrZXliaW5kaW5ncylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEluc3RhbmNlcygpIHtcbiAgcmV0dXJuIF9pbnN0YW5jZXM7XG59O1xuXG4vKipcbiAqIGlzRW1wdHlcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHJldHVybiB7bnVtYmVyfSBTaXplIG9mIHRoZSBzZXQgb2YgYWxsIHN0b3JlZCBpbnN0YW5jZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHkoKSB7XG4gIHJldHVybiAhX2luc3RhbmNlcy5zaXplO1xufTtcblxuLyoqXG4gKiBzZXRCaW5kaW5nXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzIEFsbCBhcmd1bWVudHMgbmVjZXNzYXJ5IHRvIHNldCB0aGUgYmluZGluZ1xuICogQHBhcmFtIHthcnJheX0gYXJncy5rZXlzIEtleSBjb2RlcyB0aGF0IHNob3VsZCB0cmlnZ2VyIHRoZSBmblxuICogQHBhcmFtIHtmdW5jdGlvbn0gYXJncy5mbiBUaGUgY2FsbGJhY2sgdG8gYmUgdHJpZ2dlcmVkIHdoZW4gZ2l2ZW4ga2V5cyBhcmUgcHJlc3NlZFxuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MudGFyZ2V0IFRoZSBkZWNvcmF0ZWQgY2xhc3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEJpbmRpbmcoX3JlZjIpIHtcbiAgdmFyIGtleXMgPSBfcmVmMi5rZXlzLFxuICAgICAgZm4gPSBfcmVmMi5mbixcbiAgICAgIHRhcmdldCA9IF9yZWYyLnRhcmdldDtcblxuICB2YXIga2V5U2V0cyA9IHBhcnNlS2V5cyhrZXlzKTtcblxuICB2YXIgX19yZWFjdEtleWRvd25VVUlEID0gdGFyZ2V0Ll9fcmVhY3RLZXlkb3duVVVJRDtcblxuICBpZiAoIV9fcmVhY3RLZXlkb3duVVVJRCkge1xuICAgIHRhcmdldC5fX3JlYWN0S2V5ZG93blVVSUQgPSB1dWlkKCk7XG4gICAgX2hhbmRsZXJzLnNldCh0YXJnZXQuX19yZWFjdEtleWRvd25VVUlELCBuZXcgTWFwKFtba2V5U2V0cywgZm5dXSkpO1xuICB9IGVsc2Uge1xuICAgIF9oYW5kbGVycy5nZXQoX19yZWFjdEtleWRvd25VVUlEKS5zZXQoa2V5U2V0cywgZm4pO1xuICB9XG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL3N0b3JlLmpzXG4vLyBtb2R1bGUgaWQgPSAxNDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gTWFrZSBzdXJlIGBnbG9iYWxgIGlzIGRlZmluZWQgZ2xvYmFsbHk6XG4vL1x0LSBlaXRoZXIgYXMgdGhlIG5vZGVqcyBgZ2xvYmFsYCwgb3Jcbi8vXHQtIGFzIGFuIGFsaWFzIGZvciBgd2luZG93YCBpbiBicm93c2Vycywgb3Jcbi8vXHQtIGZvciB0aGUgYHNlbGZgIGNvbnRleHQgaW4gd2ViIHdvcmtlcnMuXG4vL1xuLy8gTk9URTogdGhpcyBtb2RpZmllcyB0aGUgXCJnbG9iYWxcIiBlbnZpcm9ubWVudCBieSBtYWtpbmcgc3VyZSBcImdsb2JhbFwiIGlzIHNldC4hXG4vL1xuXG5sZXQgZ2xvYmFsX2lkZW50aWZpZXI7XG5pZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuLy9cdGNvbnNvbGUubG9nKFwiUnVubmluZyBpbiBub2RlXCIpO1xuXHRnbG9iYWxfaWRlbnRpZmllciA9IGdsb2JhbDtcbn1cblxuaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbi8vXHRjb25zb2xlLmxvZyhcIlJ1bm5pbmcgaW4gYSB3ZWIgYnJvd3NlclwiKTtcblx0d2luZG93Lmdsb2JhbCA9IHdpbmRvdztcblx0Z2xvYmFsX2lkZW50aWZpZXIgPSB3aW5kb3c7XG59XG5cbmlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIikge1xuLy9cdGNvbnNvbGUubG9nKFwiUnVubmluZyBpbiBhIHdlYiB3b3JrZXJcIik7XG5cdHNlbGYuZ2xvYmFsID0gc2VsZjtcblx0Z2xvYmFsX2lkZW50aWZpZXIgPSBzZWxmO1xufVxuXG4vLyBFeHBvcnQgZm9yIGNvbnN1bXB0aW9uIGJ5IGltcG9ydC5cbmV4cG9ydCBkZWZhdWx0IGdsb2JhbF9pZGVudGlmaWVyO1xuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdXRpbHMvZ2xvYmFsLmpzIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fY29mLmpzXG4vLyBtb2R1bGUgaWQgPSAxNzlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gSUUgOC0gZG9uJ3QgZW51bSBidWcga2V5c1xubW9kdWxlLmV4cG9ydHMgPSAoXG4gICdjb25zdHJ1Y3RvcixoYXNPd25Qcm9wZXJ0eSxpc1Byb3RvdHlwZU9mLHByb3BlcnR5SXNFbnVtZXJhYmxlLHRvTG9jYWxlU3RyaW5nLHRvU3RyaW5nLHZhbHVlT2YnXG4pLnNwbGl0KCcsJyk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSAxODBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJyk7XG52YXIgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIGRQLmYob2JqZWN0LCBrZXksIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faGlkZS5qc1xuLy8gbW9kdWxlIGlkID0gMTgxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZmFsc2U7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19saWJyYXJ5LmpzXG4vLyBtb2R1bGUgaWQgPSAxODJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gMTkuMS4yLjE0IC8gMTUuMi4zLjE0IE9iamVjdC5rZXlzKE8pXG52YXIgJGtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cy1pbnRlcm5hbCcpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIGtleXMoTykge1xuICByZXR1cm4gJGtleXMoTywgZW51bUJ1Z0tleXMpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1rZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSAxODNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cy5mID0ge30ucHJvcGVydHlJc0VudW1lcmFibGU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtcGllLmpzXG4vLyBtb2R1bGUgaWQgPSAxODRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYml0bWFwLCB2YWx1ZSkge1xuICByZXR1cm4ge1xuICAgIGVudW1lcmFibGU6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlOiAhKGJpdG1hcCAmIDQpLFxuICAgIHZhbHVlOiB2YWx1ZVxuICB9O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3Byb3BlcnR5LWRlc2MuanNcbi8vIG1vZHVsZSBpZCA9IDE4NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4vX2hpZGUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBTUkMgPSByZXF1aXJlKCcuL191aWQnKSgnc3JjJyk7XG52YXIgVE9fU1RSSU5HID0gJ3RvU3RyaW5nJztcbnZhciAkdG9TdHJpbmcgPSBGdW5jdGlvbltUT19TVFJJTkddO1xudmFyIFRQTCA9ICgnJyArICR0b1N0cmluZykuc3BsaXQoVE9fU1RSSU5HKTtcblxucmVxdWlyZSgnLi9fY29yZScpLmluc3BlY3RTb3VyY2UgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuICR0b1N0cmluZy5jYWxsKGl0KTtcbn07XG5cbihtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChPLCBrZXksIHZhbCwgc2FmZSkge1xuICB2YXIgaXNGdW5jdGlvbiA9IHR5cGVvZiB2YWwgPT0gJ2Z1bmN0aW9uJztcbiAgaWYgKGlzRnVuY3Rpb24pIGhhcyh2YWwsICduYW1lJykgfHwgaGlkZSh2YWwsICduYW1lJywga2V5KTtcbiAgaWYgKE9ba2V5XSA9PT0gdmFsKSByZXR1cm47XG4gIGlmIChpc0Z1bmN0aW9uKSBoYXModmFsLCBTUkMpIHx8IGhpZGUodmFsLCBTUkMsIE9ba2V5XSA/ICcnICsgT1trZXldIDogVFBMLmpvaW4oU3RyaW5nKGtleSkpKTtcbiAgaWYgKE8gPT09IGdsb2JhbCkge1xuICAgIE9ba2V5XSA9IHZhbDtcbiAgfSBlbHNlIGlmICghc2FmZSkge1xuICAgIGRlbGV0ZSBPW2tleV07XG4gICAgaGlkZShPLCBrZXksIHZhbCk7XG4gIH0gZWxzZSBpZiAoT1trZXldKSB7XG4gICAgT1trZXldID0gdmFsO1xuICB9IGVsc2Uge1xuICAgIGhpZGUoTywga2V5LCB2YWwpO1xuICB9XG4vLyBhZGQgZmFrZSBGdW5jdGlvbiN0b1N0cmluZyBmb3IgY29ycmVjdCB3b3JrIHdyYXBwZWQgbWV0aG9kcyAvIGNvbnN0cnVjdG9ycyB3aXRoIG1ldGhvZHMgbGlrZSBMb0Rhc2ggaXNOYXRpdmVcbn0pKEZ1bmN0aW9uLnByb3RvdHlwZSwgVE9fU1RSSU5HLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuIHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgJiYgdGhpc1tTUkNdIHx8ICR0b1N0cmluZy5jYWxsKHRoaXMpO1xufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19yZWRlZmluZS5qc1xuLy8gbW9kdWxlIGlkID0gMTg2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIFNIQVJFRCA9ICdfX2NvcmUtanNfc2hhcmVkX18nO1xudmFyIHN0b3JlID0gZ2xvYmFsW1NIQVJFRF0gfHwgKGdsb2JhbFtTSEFSRURdID0ge30pO1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICByZXR1cm4gc3RvcmVba2V5XSB8fCAoc3RvcmVba2V5XSA9IHZhbHVlICE9PSB1bmRlZmluZWQgPyB2YWx1ZSA6IHt9KTtcbn0pKCd2ZXJzaW9ucycsIFtdKS5wdXNoKHtcbiAgdmVyc2lvbjogY29yZS52ZXJzaW9uLFxuICBtb2RlOiByZXF1aXJlKCcuL19saWJyYXJ5JykgPyAncHVyZScgOiAnZ2xvYmFsJyxcbiAgY29weXJpZ2h0OiAnwqkgMjAxOCBEZW5pcyBQdXNoa2FyZXYgKHpsb2lyb2NrLnJ1KSdcbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLmpzXG4vLyBtb2R1bGUgaWQgPSAxODdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gNy4xLjEgVG9QcmltaXRpdmUoaW5wdXQgWywgUHJlZmVycmVkVHlwZV0pXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbi8vIGluc3RlYWQgb2YgdGhlIEVTNiBzcGVjIHZlcnNpb24sIHdlIGRpZG4ndCBpbXBsZW1lbnQgQEB0b1ByaW1pdGl2ZSBjYXNlXG4vLyBhbmQgdGhlIHNlY29uZCBhcmd1bWVudCAtIGZsYWcgLSBwcmVmZXJyZWQgdHlwZSBpcyBhIHN0cmluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIFMpIHtcbiAgaWYgKCFpc09iamVjdChpdCkpIHJldHVybiBpdDtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmIChTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICBpZiAodHlwZW9mIChmbiA9IGl0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKCFTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBwcmltaXRpdmUgdmFsdWVcIik7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzXG4vLyBtb2R1bGUgaWQgPSAxODhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudDtcbi8vIHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFbGVtZW50IGlzICdvYmplY3QnIGluIG9sZCBJRVxudmFyIGlzID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGlzID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChpdCkgOiB7fTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzXG4vLyBtb2R1bGUgaWQgPSAyNzlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSAmJiAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdkaXYnKSwgJ2EnLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfSB9KS5hICE9IDc7XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2llOC1kb20tZGVmaW5lLmpzXG4vLyBtb2R1bGUgaWQgPSAyODBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gMTkuMS4yLjcgLyAxNS4yLjMuNCBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxudmFyICRrZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMtaW50ZXJuYWwnKTtcbnZhciBoaWRkZW5LZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpLmNvbmNhdCgnbGVuZ3RoJywgJ3Byb3RvdHlwZScpO1xuXG5leHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKE8pIHtcbiAgcmV0dXJuICRrZXlzKE8sIGhpZGRlbktleXMpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BuLmpzXG4vLyBtb2R1bGUgaWQgPSAyODFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cy5mID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BzLmpzXG4vLyBtb2R1bGUgaWQgPSAyODJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciBhcnJheUluZGV4T2YgPSByZXF1aXJlKCcuL19hcnJheS1pbmNsdWRlcycpKGZhbHNlKTtcbnZhciBJRV9QUk9UTyA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lcykge1xuICB2YXIgTyA9IHRvSU9iamVjdChvYmplY3QpO1xuICB2YXIgaSA9IDA7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIGtleTtcbiAgZm9yIChrZXkgaW4gTykgaWYgKGtleSAhPSBJRV9QUk9UTykgaGFzKE8sIGtleSkgJiYgcmVzdWx0LnB1c2goa2V5KTtcbiAgLy8gRG9uJ3QgZW51bSBidWcgJiBoaWRkZW4ga2V5c1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkgaWYgKGhhcyhPLCBrZXkgPSBuYW1lc1tpKytdKSkge1xuICAgIH5hcnJheUluZGV4T2YocmVzdWx0LCBrZXkpIHx8IHJlc3VsdC5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qc1xuLy8gbW9kdWxlIGlkID0gMjgzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBzaGFyZWQgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgna2V5cycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBzaGFyZWRba2V5XSB8fCAoc2hhcmVkW2tleV0gPSB1aWQoa2V5KSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLWtleS5qc1xuLy8gbW9kdWxlIGlkID0gMjg0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDcuMS40IFRvSW50ZWdlclxudmFyIGNlaWwgPSBNYXRoLmNlaWw7XG52YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGlzTmFOKGl0ID0gK2l0KSA/IDAgOiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW50ZWdlci5qc1xuLy8gbW9kdWxlIGlkID0gMjg1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMuZiA9IHJlcXVpcmUoJy4vX3drcycpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fd2tzLWV4dC5qc1xuLy8gbW9kdWxlIGlkID0gMjg2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qXG5cdE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cdEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG4vLyBjc3MgYmFzZSBjb2RlLCBpbmplY3RlZCBieSB0aGUgY3NzLWxvYWRlclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1c2VTb3VyY2VNYXApIHtcblx0dmFyIGxpc3QgPSBbXTtcblxuXHQvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG5cdGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcblx0XHRcdHZhciBjb250ZW50ID0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtLCB1c2VTb3VyY2VNYXApO1xuXHRcdFx0aWYoaXRlbVsyXSkge1xuXHRcdFx0XHRyZXR1cm4gXCJAbWVkaWEgXCIgKyBpdGVtWzJdICsgXCJ7XCIgKyBjb250ZW50ICsgXCJ9XCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gY29udGVudDtcblx0XHRcdH1cblx0XHR9KS5qb2luKFwiXCIpO1xuXHR9O1xuXG5cdC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG5cdGxpc3QuaSA9IGZ1bmN0aW9uKG1vZHVsZXMsIG1lZGlhUXVlcnkpIHtcblx0XHRpZih0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIilcblx0XHRcdG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIFwiXCJdXTtcblx0XHR2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaWQgPSB0aGlzW2ldWzBdO1xuXHRcdFx0aWYodHlwZW9mIGlkID09PSBcIm51bWJlclwiKVxuXHRcdFx0XHRhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG5cdFx0fVxuXHRcdGZvcihpID0gMDsgaSA8IG1vZHVsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpdGVtID0gbW9kdWxlc1tpXTtcblx0XHRcdC8vIHNraXAgYWxyZWFkeSBpbXBvcnRlZCBtb2R1bGVcblx0XHRcdC8vIHRoaXMgaW1wbGVtZW50YXRpb24gaXMgbm90IDEwMCUgcGVyZmVjdCBmb3Igd2VpcmQgbWVkaWEgcXVlcnkgY29tYmluYXRpb25zXG5cdFx0XHQvLyAgd2hlbiBhIG1vZHVsZSBpcyBpbXBvcnRlZCBtdWx0aXBsZSB0aW1lcyB3aXRoIGRpZmZlcmVudCBtZWRpYSBxdWVyaWVzLlxuXHRcdFx0Ly8gIEkgaG9wZSB0aGlzIHdpbGwgbmV2ZXIgb2NjdXIgKEhleSB0aGlzIHdheSB3ZSBoYXZlIHNtYWxsZXIgYnVuZGxlcylcblx0XHRcdGlmKHR5cGVvZiBpdGVtWzBdICE9PSBcIm51bWJlclwiIHx8ICFhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG5cdFx0XHRcdGlmKG1lZGlhUXVlcnkgJiYgIWl0ZW1bMl0pIHtcblx0XHRcdFx0XHRpdGVtWzJdID0gbWVkaWFRdWVyeTtcblx0XHRcdFx0fSBlbHNlIGlmKG1lZGlhUXVlcnkpIHtcblx0XHRcdFx0XHRpdGVtWzJdID0gXCIoXCIgKyBpdGVtWzJdICsgXCIpIGFuZCAoXCIgKyBtZWRpYVF1ZXJ5ICsgXCIpXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGlzdC5wdXNoKGl0ZW0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0cmV0dXJuIGxpc3Q7XG59O1xuXG5mdW5jdGlvbiBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0sIHVzZVNvdXJjZU1hcCkge1xuXHR2YXIgY29udGVudCA9IGl0ZW1bMV0gfHwgJyc7XG5cdHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcblx0aWYgKCFjc3NNYXBwaW5nKSB7XG5cdFx0cmV0dXJuIGNvbnRlbnQ7XG5cdH1cblxuXHRpZiAodXNlU291cmNlTWFwICYmIHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0dmFyIHNvdXJjZU1hcHBpbmcgPSB0b0NvbW1lbnQoY3NzTWFwcGluZyk7XG5cdFx0dmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcblx0XHRcdHJldHVybiAnLyojIHNvdXJjZVVSTD0nICsgY3NzTWFwcGluZy5zb3VyY2VSb290ICsgc291cmNlICsgJyAqLydcblx0XHR9KTtcblxuXHRcdHJldHVybiBbY29udGVudF0uY29uY2F0KHNvdXJjZVVSTHMpLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oJ1xcbicpO1xuXHR9XG5cblx0cmV0dXJuIFtjb250ZW50XS5qb2luKCdcXG4nKTtcbn1cblxuLy8gQWRhcHRlZCBmcm9tIGNvbnZlcnQtc291cmNlLW1hcCAoTUlUKVxuZnVuY3Rpb24gdG9Db21tZW50KHNvdXJjZU1hcCkge1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0dmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSk7XG5cdHZhciBkYXRhID0gJ3NvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LCcgKyBiYXNlNjQ7XG5cblx0cmV0dXJuICcvKiMgJyArIGRhdGEgKyAnICovJztcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1xuLy8gbW9kdWxlIGlkID0gMjg3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIFNwZWxsIFwicGFyc2VyXCIgY2xhc3MuXG4vL1xuXG4vLyBUT0RPOiBkZXBlbmRlbmN5LWluamVjdCB0b2tlbml6ZXI/XG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuL1Rva2VuaXplci5qc1wiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4vUnVsZS5qc1wiO1xuaW1wb3J0IHBhcnNlUnVsZSBmcm9tIFwiLi9SdWxlU3ludGF4LmpzXCI7XG5pbXBvcnQgeyBjbG9uZUNsYXNzIH0gZnJvbSBcIi4vdXRpbHMvY2xhc3MuanNcIjtcblxuLy8gR1JSUi4uLiB3aWxsIFNPTUVPTkUgb24gdGhlIG5vZGUgdGVhbSBwbGVhc2UgaW1wbGVtZW50IGNvbnNvbGUuZ3JvdXAgPz8/XG5pZiAoIWNvbnNvbGUuZ3JvdXApIGNvbnNvbGUuZ3JvdXAgPSBjb25zb2xlLmxvZztcbmlmICghY29uc29sZS5ncm91cEVuZCkgY29uc29sZS5ncm91cEVuZCA9IGNvbnNvbGUubG9nO1xuXG4vLyBFcnJvciB3ZSdsbCB0aHJvdyBmb3IgcHJvYmxlbXMgd2hlbiBwYXJzaW5nLlxuLy8gVXNlcyBhIHNwZWNpZmljIHR5cGUgc28gd2UgY2FuIGNoZWNrIGZvciBpdCBpbiB0ZXN0cy5cbmV4cG9ydCBmdW5jdGlvbiBQYXJzZUVycm9yKC4uLmFyZ3MpIHtcbiAgRXJyb3IuYXBwbHkodGhpcywgYXJncyk7XG4gIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgUGFyc2VFcnJvcik7XG59XG5QYXJzZUVycm9yLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJzZXIge1xuXHQvLyBTZXQgdG8gYHRydWVgIHRvIG91dHB1dCBkZWJ1ZyBpbmZvIHdoaWxlIGFkZGluZyBydWxlc1xuXHRzdGF0aWMgREVCVUcgPSBmYWxzZTtcblxuXHQvLyBTaG91bGQgd2Ugd2FybiBhYm91dCBhbm9tYWxvdXMgY29uZGl0aW9ucz9cblx0c3RhdGljIFdBUk4gPSBmYWxzZTtcblxuXHQvLyBTZXQgdG8gYHRydWVgIHRvIG91dHB1dCB0aW1pbmcgaW5mby5cblx0c3RhdGljIFRJTUUgPSBmYWxzZTtcblxuICAvLyBBZGQgdG8gUGFyc2VyIGNvbnNvbGUgZGVidWdnaW5nXG4gIHN0YXRpYyBQYXJzZUVycm9yID0gUGFyc2VFcnJvcjtcblxuXHQvLyBDb25zdHJ1Y3Rvci5cblx0Y29uc3RydWN0b3IocHJvcGVydGllcykge1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywgcHJvcGVydGllcyk7XG5cdH1cblxuLy9cbi8vIyMjIFBhcnNpbmdcbi8vXG5cdC8vIFBhcnNlIGBydWxlTmFtZWAgcnVsZSBhdCBoZWFkIG9mIGB0ZXh0YC5cblx0Ly8gSWYgeW91IHBhc3Mgb25seSBvbmUgYXJndW1lbnQsIHdlJ2xsIGFzc3VtZSB0aGF0J3MgYHRleHRgIGFuZCB5b3Ugd2FudCB0byBtYXRjaCBgc3RhdGVtZW50c2AuXG5cdC8vIEhhbmRsZXMgb3B0aW9uYWwgYW5kIHJlcGVhdGluZyBydWxlcyBhcyB3ZWxsIGFzIGVhdGluZyB3aGl0ZXNwYWNlLlxuXHQvLyBSZXR1cm5zIHJlc3VsdCBvZiBwYXJzZS5cbi8vVEVTVE1FXG5cdHBhcnNlKHJ1bGVOYW1lLCB0ZXh0KSB7XG5cdFx0Ly8gSWYgb25seSBvbmUgYXJndW1lbnQsIGFzc3VtZSB0aGF0J3MgdGhlIHRleHQgYW5kIHBhcnNlIGBzdGF0ZW1lbnRzYFxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHR0ZXh0ID0gcnVsZU5hbWU7XG5cdFx0XHRydWxlTmFtZSA9IFwic3RhdGVtZW50c1wiO1xuXHRcdH1cblxuXHRcdC8vIENvbnZlcnQgdG8gdG9rZW5zLlxuXHRcdGlmIChQYXJzZXIuVElNRSkgY29uc29sZS50aW1lKFwidG9rZW5pemVcIik7XG5cdFx0bGV0IHRva2VucyA9IFRva2VuaXplci50b2tlbml6ZSh0ZXh0KTtcblx0XHQvLyBlYXQgbm9uLWluZGVudCB3aGl0ZXNwYWNlIChzaW5jZSB3ZSBpZ25vcmUgaXQpXG5cdFx0dG9rZW5zID0gdG9rZW5zLmZpbHRlcih0b2tlbiA9PiAhVG9rZW5pemVyLmlzTm9ybWFsV2hpdGVzcGFjZSh0b2tlbikpO1xuXHRcdGlmIChQYXJzZXIuVElNRSkgY29uc29sZS50aW1lRW5kKFwidG9rZW5pemVcIik7XG5cblx0XHQvLyBCYWlsIGlmIHdlIGRpZG4ndCBnZXQgYW55IHRva2VucyBiYWNrLlxuXHRcdGlmICghdG9rZW5zIHx8IHRva2Vucy5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRpZiAoUGFyc2VyLlRJTUUpIGNvbnNvbGUudGltZShcInBhcnNlXCIpO1xuXHRcdC8vIElmIHdlJ3JlIG5vdCBwYXJzaW5nIGBzdGF0ZW1lbnRzYCwgZWF0IHdoaXRlc3BhY2UgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZS5cblx0XHRpZiAocnVsZU5hbWUgIT09IFwic3RhdGVtZW50c1wiKSB7XG5cdFx0XHR0b2tlbnMgPSBUb2tlbml6ZXIucmVtb3ZlTGVhZGluZ1doaXRlc3BhY2UodG9rZW5zKTtcblx0XHR9XG5cblx0XHQvLyBQYXJzZSB0aGUgcnVsZSBvciB0aHJvdyBhbiBleGNlcHRpb24gaWYgcnVsZSBub3QgZm91bmQuXG5cdFx0bGV0IHJlc3VsdCA9IHRoaXMucGFyc2VOYW1lZFJ1bGUocnVsZU5hbWUsIHRva2VucywgMCwgdG9rZW5zLmxlbmd0aCwgdW5kZWZpbmVkLCBcInBhcnNlci5wYXJzZSgpXCIpO1xuXHRcdGlmIChQYXJzZXIuVElNRSkgY29uc29sZS50aW1lRW5kKFwicGFyc2VcIik7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cblxuXHQvLyBQYXJzZSBgdGV4dGAgYW5kIHJldHVybiB0aGUgcmVzdWx0aW5nIHNvdXJjZSBjb2RlLlxuXHQvL1x0LSBpZiBvbmUgc3RyaW5nIGFyZ3VtZW50LCBjb21waWxlcyBhcyBcInN0YXRlbWVudHNcIlxuXHQvLyBUaHJvd3MgaWYgbm90IHBhcnNlYWJsZS5cbi8vVEVTVE1FXG5cdGNvbXBpbGUocnVsZU5hbWUsIHRleHQpIHtcblx0XHQvLyBJZiBvbmx5IG9uZSBhcmd1bWVudCwgYXNzdW1lIHRoYXQncyB0aGUgdGV4dCBhbmQgcGFyc2UgYHN0YXRlbWVudHNgXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHRleHQgPSBydWxlTmFtZTtcblx0XHRcdHJ1bGVOYW1lID0gXCJzdGF0ZW1lbnRzXCI7XG5cdFx0fVxuXHRcdGxldCByZXN1bHQgPSB0aGlzLnBhcnNlKHJ1bGVOYW1lLCB0ZXh0KTtcblx0XHRpZiAoIXJlc3VsdCkge1xuXHRcdCAgdGhyb3cgbmV3IFBhcnNlRXJyb3IoYHBhcnNlci5wYXJzZSgnJHtydWxlTmFtZX0nLCAnJHt0ZXh0fScpOiBjYW4ndCBwYXJzZSB0ZXh0YCk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQudG9Tb3VyY2UodGhpcyk7XG5cdH1cblxuXG5cdC8vIFBhcnNlIGEgbmFtZWQgcnVsZSAoZGVmaW5lZCBpbiB0aGlzIHBhcnNlciBvciBpbiBhbnkgb2Ygb3VyIGBpbXBvcnRzYCksIHJldHVybmluZyB0aGUgXCJiZXN0XCIgbWF0Y2guXG5cdC8vIFJldHVybnMgYHVuZGVmaW5lZGAgaWYgbm8gbWF0Y2guXG5cdC8vIFRocm93cyBpZiBydWxlIGlzIG5vdCBpbXBsZW1lbnRlZC5cblx0cGFyc2VOYW1lZFJ1bGUocnVsZU5hbWUsIHRva2Vucywgc3RhcnQsIGVuZCwgc3RhY2ssIGNhbGxpbmdDb250ZXh0ID0gXCJwYXJzZU5hbWVkUnVsZVwiKSB7XG4gICAgY29uc3QgcnVsZSA9IHRoaXMucnVsZXNbcnVsZU5hbWVdO1xuXHRcdGlmICghcnVsZSkgdGhyb3cgbmV3IFBhcnNlRXJyb3IoYCR7Y2FsbGluZ0NvbnRleHR9OiBydWxlICcke3J1bGVOYW1lfScgbm90IGZvdW5kYCk7XG4gICAgcmV0dXJuIHJ1bGUucGFyc2UodGhpcywgdG9rZW5zLCBzdGFydCwgZW5kLCBzdGFjayk7XG5cdH1cblxuXHQvLyBUZXN0IHdoZXRoZXIgYSBydWxlICh3aGljaCBtYXkgYmUgc3BlY2lmaWVkIGJ5IG5hbWUpIE1JR0hUIGJlIGZvdW5kIGluIGhlYWQgb2Ygc3RyZWFtLlxuXHQvLyBSZXR1cm5zOlxuXHQvL1x0LSBgdHJ1ZWAgaWYgdGhlIHJ1bGUgTUlHSFQgYmUgbWF0Y2hlZC5cblx0Ly9cdC0gYGZhbHNlYCBpZiB0aGVyZSBpcyBOTyBXQVkgdGhlIHJ1bGUgY2FuIGJlIG1hdGNoZWQuXG5cdC8vXHQtIGB1bmRlZmluZWRgIGlmIG5vdCBkZXRlcm1pbnN0aWMgKGVnOiBubyB3YXkgdG8gdGVsbCBxdWlja2x5KS5cblx0dGVzdChydWxlLCB0b2tlbnMsIHN0YXJ0LCBlbmQpIHtcblx0ICBpZiAodHlwZW9mIHJ1bGUgPT09IFwic3RyaW5nXCIpIHtcblx0ICAgIHJ1bGUgPSB0aGlzLnJ1bGVzW3J1bGVdO1xuXHQgICAgaWYgKCFydWxlKSByZXR1cm4gdW5kZWZpbmVkOyAgICAvLyBUT0RPOiB0aHJvdz9cblx0ICB9XG5cdCAgcmV0dXJuIHJ1bGUudGVzdCh0aGlzLCB0b2tlbnMsIHN0YXJ0LCBlbmQpO1xuXHR9XG5cblxuLy9cbi8vICMjIyBcdEltcG9ydHNcbi8vXHRcdFBhcnNlcnMgY2FuIGRlcGVuZCBvbiBvdGhlciBwYXJzZXJzIGZvciBhZGRpdGlvbmFsIGBydWxlc2AuXG4vL1x0XHRJbXBvcnRzIGFyZSBsYXp5LWJvdW5kIGludG8gYHBhcnNlci5ydWxlc2AgYXMgbmVjZXNzYXJ5LlxuLy8gICAgV2UgYXNzdW1lIHRoZSB0b3AtbGV2ZWwgcGFyc2VyIGZvciBhIGxhbmd1YWdlIHdpbGwgaW5jbHVkZSBhbGwgbmVjZXNzYXJ5IGltcG9ydHMgYXV0b21hdGljYWxseS5cbi8vXG5cblx0Ly8gQWRkIG9uZSBvciBtb3JlIG5hbWVkIGltcG9ydHMgdG8gdGhpcyBwYXJzZXIuXG5cdC8vIEltcG9ydHMgaW5jcmVhc2UgaW4gcHJpb3JpdHkgdGhlIGxhdGVyIHRoZXkgYXJlIGluIHRoZSBsaXN0LlxuICBpbXBvcnRzID0gW107XG5cdGltcG9ydCguLi5pbXBvcnRzKSB7XG5cdFx0Ly8gUkVWRVJTRSB0aGUgbGlzdCBvZiBpbXBvcnRzLCBzbyB0aGUgbW9zdCBnZW5lcmFsIG9uZSBpcyBMQVNUXG5cdFx0Ly8gVGh1cyBtb3JlIHNwZWNpZmljIGltcG9ydHMgd2lsbCBiZSBFQVJMSUVSIGluIHRoZSBgaW1wb3J0c2AgbGlzdC5cblxuXHRcdC8vIENyZWF0ZSBuZXcgYXJyYXkgb2YgaW1wb3J0cyBhbmQgYWRkIGltcG9ydCBuYW1lcyBwYXNzZWQgaW4uXG5cdFx0dGhpcy5pbXBvcnRzID0gaW1wb3J0cy5yZXZlcnNlKCkuY29uY2F0KHRoaXMuaW1wb3J0cyk7XG5cblx0XHQvLyBjbGVhciBjb25jYXRlbmF0ZWQgbGlzdCBvZiBydWxlcyBzbyB3ZSdsbCByZWNhY3VsYXRlIGluIGBwYXJzZXIucnVsZXNgXG5cdFx0ZGVsZXRlIHRoaXMuX19ydWxlcztcblx0fVxuXG4vL1xuLy8gIyMjIFJ1bGVzXG4vLyAgICBMaXN0IG9mIGFsbCBrbm93biBydWxlcyBmb3IgdGhpcyBwYXJzZXIuXG4vLyAgICBZb3UgY2FuIGFjY2VzcyBuYW1lZCBydWxlcyBhcyBgcGFyc2VyLnJ1bGVzW1wicnVsZU5hbWVcIl1gXG4vL1xuXHQvLyBTdGFydCB3aXRoIGFuIGVtcHR5IG1hcCBvZiBydWxlcy5cblx0X3J1bGVzID0ge307XG5cblx0Ly8gUmV0dXJuIG1hcCBvZiBhbGwga25vd24gcnVsZXMgYnkgcnVsZSBuYW1lLCBpbmNsdWRpbmcgcnVsZXMgZGVmaW5lZCBpbiBvdXIgaW1wb3J0cy5cblx0Ly8gTk9URTogV2UgbWVtb2l6ZSB0aGlzLCBzbyBtYWtlIHN1cmUgdG8gY2xlYXIgYF9fcnVsZXNgIGlmIHlvdSdyZSBtYW5pcHVsYXRpbmcgcnVsZXMgb3IgaW1wb3J0cyFcblx0Z2V0IHJ1bGVzKCkge1xuXHRcdGlmICghdGhpcy5fX3J1bGVzKSB7XG5cdFx0XHRjb25zdCBvdXRwdXQgPSB0aGlzLl9fcnVsZXMgPSB7fTtcblx0XHRcdC8vIEdldCBhbGwgaW1wb3J0ZWQgcGFyc2Vycywgd2l0aCB1cyBsYXN0XG5cdFx0XHRjb25zdCBpbXBvcnRzID0gW3RoaXNdLmNvbmNhdCh0aGlzLmltcG9ydHMubWFwKFBhcnNlci5mb3JNb2R1bGUpKTtcblxuXHRcdFx0Ly8gRm9yIGVhY2ggcGFyc2VyXG5cdFx0XHRpbXBvcnRzLmZvckVhY2gocGFyc2VyID0+IHtcblx0XHRcdFx0Zm9yIChjb25zdCBydWxlTmFtZSBpbiBwYXJzZXIuX3J1bGVzKSB7XG5cdFx0XHRcdCAgUGFyc2VyLm1lcmdlUnVsZShvdXRwdXQsIHJ1bGVOYW1lLCBwYXJzZXIuX3J1bGVzW3J1bGVOYW1lXSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fX3J1bGVzO1xuXHR9XG5cblx0Ly8gQWRkIGEgYHJ1bGVgIHRvIG91ciBsaXN0IG9mIHJ1bGVzIVxuXHQvLyBDb252ZXJ0cyB0byBgYWx0ZXJuYXRpdmVzYCBvbiByZS1kZWZpbmluZyB0aGUgc2FtZSBydWxlLlxuXHRhZGRSdWxlKHJ1bGVOYW1lLCBydWxlKSB7XG5cdFx0Ly8gQ2xlYXIgbWVtb2l6ZWQgYF9fcnVsZXNgIHNvIHdlJ2xsIHJlY2FsY3VsYXRlIGBwYXJzZXIucnVsZXNgIGFzIG5lY2Vzc2FyeVxuXHRcdGRlbGV0ZSB0aGlzLl9fcnVsZXM7XG5cblx0XHQvLyBJZiBwYXNzZWQgYSBmdW5jdGlvbiwgY3JlYXRlIGFuIGluc3RhbmNlIGZvciB0aGUgYWN0dWFsIHJ1bGUuXG5cdFx0Ly8gVGhpcyBpcyBjb21tb25seSBkb25lIHNvIEpTIHdpbGwgZ2l2ZSB1cyBtZWFuaW5nZnVsIGNsYXNzIG5hbWVzIGluIGRlYnVnIG91dHB1dC5cblx0XHRpZiAodHlwZW9mIHJ1bGUgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0cnVsZSA9IG5ldyBydWxlKCk7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgd2UgZ290IGFuIGFycmF5IG9mIGBydWxlTmFtZWBzLCByZWN1cnNpdmVseSBhZGQgdW5kZXIgZWFjaCBuYW1lIHdpdGggdGhlIHNhbWUgYHJ1bGVgLlxuXHRcdGlmIChBcnJheS5pc0FycmF5KHJ1bGVOYW1lKSkge1xuXHRcdFx0cnVsZU5hbWUuZm9yRWFjaChydWxlTmFtZSA9PiB0aGlzLmFkZFJ1bGUocnVsZU5hbWUsIHJ1bGUpICk7XG5cdFx0XHRyZXR1cm4gcnVsZTtcblx0XHR9XG5cblx0XHQvLyBBZGQgdG8gb3VyIGxpc3Qgb2YgX3J1bGVzXG5cdFx0UGFyc2VyLm1lcmdlUnVsZSh0aGlzLl9ydWxlcywgcnVsZU5hbWUsIHJ1bGUpO1xuXHRcdHJldHVybiBydWxlO1xuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBjb25jYXRlbmF0ZWQgYmxhY2tsaXN0IGZvciBhIGdpdmVuIG5hbWVkIHJ1bGUuXG5cdGdldEJsYWNrbGlzdChydWxlTmFtZSkge1xuXHQgIGNvbnN0IHJ1bGUgPSB0aGlzLnJ1bGVzW3J1bGVOYW1lXTtcblx0ICBjb25zdCBydWxlcyA9IHJ1bGUgaW5zdGFuY2VvZiBSdWxlLkFsdGVybmF0aXZlc1xuICAgICAgICAgID8gcnVsZS5ydWxlc1xuICAgICAgICAgIDogWyBydWxlIF07XG5cdFx0cmV0dXJuIHJ1bGVzLnJlZHVjZShmdW5jdGlvbiAoYmxhY2tsaXN0LCBydWxlKSB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LmFzc2lnbihibGFja2xpc3QsIHJ1bGUuYmxhY2tsaXN0KTtcblx0XHR9LCB7fSk7XG5cdH1cblxuICAvLyBEZWZpbmUgbXVsdGlwbGUgcnVsZXMgYXQgb25jZSB1c2luZyBydWxlU3ludGF4LlxuICAvLyBTZWUgYFJ1bGVTeW50YXguanM6OmRlZmluZVJ1bGUoKWBcbiAgZGVmaW5lUnVsZXMoKSB7XG4gICAgZm9yIChjb25zdCBydWxlIG9mIGFyZ3VtZW50cykge1xuICAgICAgdGhpcy5kZWZpbmVSdWxlKHJ1bGUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIERlZmluZSBhIHJ1bGUgdXNpbmcgKHJ1bGUpYHN5bnRheGAgb3IgYHBhdHRlcm5zYCB0byBjcmVhdGUgdGhlIHJ1bGUgaW5zdGFuY2VzLlxuICAvLyAgYG5hbWVgIChpZGVudGlmaWVyLCByZXF1aXJlZCkgIEJhc2UgbmFtZSBvZiB0aGUgcnVsZS5cbiAgLy8gIGBhbGlhc2AgKHN0cmluZyBvciBbc3RyaW5nXSwgb3B0aW5hbCkgT3RoZXIgbmFtZXMgdG8gZGVmaW5lIHJ1bGUgdW5kZXIuXG4gIC8vICBgY2Fub25pY2FsYCAoc3RyaW5nLCBvcHRpb25hbCkgQ2Fub25pY2FsIG5hbWUgZm9yIHRoZSBydWxlLCBhdmFpbGFibGUgb24gYFJ1bGVgIGZvciBkZWJ1Z2dpbmcuXG4gIC8vICBgY29uc3RydWN0b3JgIChjbGFzcywgcmVxdWlyZWQpIENsYXNzIHdoaWNoIHdpbGwgYmUgdXNlZCB0byBpbnN0YW50aWF0ZSB0aGUgcnVsZS5cbiAgLy8gIGBzeW50YXhgIChzdHJpbmcsIHJlcXVpcmVkKSBSdWxlU3ludGF4IHN0cmluZyBmb3IgdGhpcyBydWxlLlxuICAvLyAgYHBhdHRlcm5gIChSZWdFeHAsIG9wdGlvbmFsKSBSZWd1bGFyIGV4cHJlc3Npb24gZm9yIGBQYXR0ZXJuYCBydWxlc1xuICAvLyAgYHByZWNlZGVuY2VgIChudW1iZXIsIG9wdGlvbmFsKSBQcmVjZWRlbmNlIG51bWJlciBmb3IgdGhlIHJ1bGUgKGN1cnJlbnRseSBkb2Vzbid0IGRvIGFueXRoaW5nKVxuICAvLyAgYGJsYWNrbGlzdGAgKFtzdHJpbmddLCBvcHRpb25hbCkgQXJyYXkgb2Ygc3RyaW5ncyBhcyBibGFja2xpc3QgZm9yIHBhdHRlcm4gcnVsZXMuXG4gIC8vICBgbGVmdFJlY3Vyc2l2ZScgKGJvb2xlYW4sIG9wdGlvbmFsKSBTZXQgdG8gYHRydWVgIGlmIHRoZSBydWxlIGlzIGxlZnQtcmVjdXJzaXZlLFxuICAvLyAgICBpLmUuIGl0IGNhbGxzIGl0c2VsZiBhcyBhIHN1YnJ1bGUgYmVmb3JlIG1hdGNoaW5nIGFueSBsaXRlcmFsIHRva2Vuc1xuICAvLyAgYHRlc3RSdWxlYCAoUnVsZSBvciBzdHJpbmcsIG9wdGlvbmFsKSBSdWxlIG9yIHJ1bGUgbmFtZSB0byB1c2UgYXMgYSB0ZXN0IHJ1bGVcbiAgLy8gICAgc3BlY2lmeWluZyB0aGlzIGNhbiBsZXQgdXMganVtcCBvdXQgcXVpY2tseSBpZiB0aGVyZSBpcyBubyBwb3NzaWJsZSBtYXRjaFxuICAvL1xuICAvLyBOb3RlIHRoYXQgd2UgbXVuZ2UgdGhlIGBjb25zdHJ1Y3RvcmAgcGFzc2VkIGluIGZvciBlZmZpY2llbmN5IHdoaWxlIHBhcnNpbmcuXG4gIGRlZmluZVJ1bGUoeyBjb25zdHJ1Y3RvciwgLi4ucHJvcHMgfSkge1xuICAgIC8vIHRocm93IGlmIHJlcXVpcmVkIHBhcmFtcyBub3QgcHJvdmlkZWRcbiAgICBpZiAoIWNvbnN0cnVjdG9yIHx8ICFwcm9wcy5uYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBwYXJzZXIuZGVmaW5lKCk6IFlvdSBtdXN0IHBhc3MgJ2NvbnN0cnVjdG9yJyBhbmQgJ25hbWUnYCk7XG4gICAgfVxuICAgIC8vIHRocm93IGlmIHdlJ3JlIHJlLXVzaW5nIGEgY29uc3RydWN0b3JcbiAgICBpZiAoY29uc3RydWN0b3IucHJvdG90eXBlLm5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYHBhcnNlci5kZWZpbmUoKTogQXR0ZW1wdGluZyB0byByZS11c2UgY29uc3RydWN0b3IgZm9yIHJ1bGUgJyR7cnVsZU5hbWV9J2ApO1xuICAgIH1cblxuICAgIC8vIE5vdGUgdGhlIG1vZHVsZSB0aGF0IHRoZSBydWxlIHdhcyBkZWZpbmVkIGluXG4gICAgaWYgKHRoaXMubW9kdWxlKSBwcm9wcy5tb2R1bGUgPSB0aGlzLm1vZHVsZTtcblxuICAgIC8vIElmIHdlJ3JlIGEgXCJjYW5vbmljYWxcIiBydWxlLCBzZXQgb24gUnVsZS5cbiAgICAvLyBVc2UgdGhpcyBpZiB5b3Ugd2FudCB0byBjaGVjayB0aGUgdHlwZSBvZiBhIHJ1bGUgaW4gYSB0ZXN0IG9yIHNvbWV0aGluZy5cbiAgICBpZiAocHJvcHMuY2Fub25pY2FsKSBSdWxlW3Byb3BzLmNhbm9uaWNhbF0gPSBjb25zdHJ1Y3RvcjtcblxuICAgIC8vIENvbnZlcnQgYmxhY2tsaXN0IGZyb20gbGlzdCBvZiBzdHJpbmdzIHRvIGEgbWFwXG4gICAgaWYgKHByb3BzLmJsYWNrbGlzdCAmJiBBcnJheS5pc0FycmF5KHByb3BzLmJsYWNrbGlzdCkpIHtcbiAgICAgIGNvbnN0IG1hcCA9IHt9O1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgcHJvcHMuYmxhY2tsaXN0KSBtYXBba2V5XSA9IHRydWU7XG4gICAgICBwcm9wcy5ibGFja2xpc3QgPSBtYXA7XG4gICAgfVxuXG4gICAgLy8gQWRkIHByb3BzIHRvIHRoZSBjb250cnVjdG9yIHByb3RveXBlIG5vbi1lbnVtZXJhYmx5IGFuZCBub24td3JpdGFibHlcbiAgICAvLyAgc28gd2UnbGwgZ2V0IGFuIGVycm9yIGlmIHNvbWV0aGluZyB0cmllcyB0byBvdmVyd3JpdGUgdGhlbS5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhwcm9wcykpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb25zdHJ1Y3Rvci5wcm90b3R5cGUsIGtleSwgeyB2YWx1ZTogcHJvcHNba2V5XSB9KTtcbiAgICB9XG5cbiAgICAvLyBDb21iaW5lIGFsaWFzZXMgd2l0aCB0aGUgbWFpbiBuYW1lXG4gICAgY29uc3QgbmFtZXMgPSBbcHJvcHMubmFtZV0uY29uY2F0KHByb3BzLmFsaWFzIHx8IFtdKTtcblxuICAgIC8vIEluc3RhbnRpYXRlIG9yIHBhcnNlIHRvIGNyZWF0ZSBydWxlcyB0byB3b3JrIHdpdGhcbiAgICBjb25zdCBydWxlcyA9IHByb3BzLnN5bnRheFxuICAgICAgPyBwYXJzZVJ1bGUocHJvcHMuc3ludGF4LCBjb25zdHJ1Y3RvcilcbiAgICAgIDogWyBuZXcgY29uc3RydWN0b3IoKSBdXG4gICAgaWYgKCFydWxlcykgdGhyb3cgbmV3IFBhcnNlRXJyb3IoYGRlZmluZVJ1bGUoJHtwcm9wcy5zeW50YXh9KTogZGlkbnQgZ2V0IHJ1bGVzIGJhY2tgKTtcblxuICAgIC8vIFNvbWV0aW1lcyBgcGFyc2VSdWxlYCB3aWxsIGdpdmUgdXMgYW4gYXJyYXkgYmFjaywgbm9ybWFsaXplIHRvIGFsd2F5cyBoYXZlIGFuIGFycmF5XG4gICAgcnVsZXMuZm9yRWFjaChydWxlID0+IHRoaXMuYWRkUnVsZShuYW1lcywgcnVsZSkpO1xuXG4gICAgLy8gaWYgdGVzdHMgd2VyZSBkZWZpbmVkLCBtYXJrIG9ubHkgYXMgdGVzdGFibGVcbiAgICBpZiAocHJvcHMudGVzdHMpIHtcbiAgICAgIC8vIChvbmx5IHVzZSB0aGUgZmlyc3QgcnVsZSBpZiB3ZSBnb3QgbW9yZSB0aGFuIG9uZSlcbiAgICAgIHRoaXMuYWRkUnVsZShcIl90ZXN0YWJsZV9cIiwgcnVsZXNbMF0pO1xuICAgIH1cbiAgfVxuXG5cbi8vXG4vLyAjIyMgUGFyc2VyIHJlZ2lzdHJ5LlxuLy9cblx0c3RhdGljIFJFR0lTVFJZID0ge307XG5cblx0Ly8gR2V0IGEgcGFyc2VyIGZvciBhIGdpdmVuIGBjb250ZXh0TmFtZWAuXG5cdC8vIFdpbGwgcmUtdXNlIGV4aXN0aW5nIHBhcnNlciwgb3IgY3JlYXRlIGEgbmV3IG9uZSBpZiBub3QgYWxyZWFkeSBkZWZpbmVkLlxuXHRzdGF0aWMgZm9yTW9kdWxlKG1vZHVsZSkge1xuXHRcdGlmICghUGFyc2VyLlJFR0lTVFJZW21vZHVsZV0pIHtcblx0XHRcdFBhcnNlci5SRUdJU1RSWVttb2R1bGVdID0gbmV3IFBhcnNlcih7IG1vZHVsZSB9KTtcblx0XHR9XG5cdFx0cmV0dXJuIFBhcnNlci5SRUdJU1RSWVttb2R1bGVdO1xuXHR9XG5cblxuLy9cbi8vICMjIFV0aWxpdHkgbWV0aG9kc1xuLy9cblxuICAvLyBNZXJnZSBgcnVsZWAgaW50byBgbWFwYCBvZiBydWxlcyBieSBgcnVsZU5hbWVgLlxuICAvLyBJZiB3ZSBhbHJlYWR5IGhhdmUgYSBydWxlIHdpdGggdGhhdCBuYW1lLCB3ZSdsbCBhZGQgaXQgYXMgYW4gYWx0ZXJuYXRpdmUuXG4vL1RFU1RNRVxuICBzdGF0aWMgbWVyZ2VSdWxlKG1hcCwgcnVsZU5hbWUsIHJ1bGUpIHtcbiAgICBsZXQgZXhpc3RpbmcgPSBtYXBbcnVsZU5hbWVdO1xuICAgIGlmICghZXhpc3RpbmcpIHtcbiAgICAgIG1hcFtydWxlTmFtZV0gPSBydWxlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghKGV4aXN0aW5nIGluc3RhbmNlb2YgUnVsZS5BbHRlcm5hdGl2ZXMpIHx8IChleGlzdGluZy5ncm91cCAhPT0gcnVsZU5hbWUpKSB7XG4gICAgICBjb25zdCBhbHRDb25zdHJ1Y3RvciA9IGNsb25lQ2xhc3MoUnVsZS5BbHRlcm5hdGl2ZXMsIHJ1bGVOYW1lKTtcbiAgICAgIGV4aXN0aW5nID0gbWFwW3J1bGVOYW1lXSA9IG5ldyBhbHRDb25zdHJ1Y3Rvcih7XG4gICAgICAgIGdyb3VwOiBydWxlTmFtZSxcbiAgICAgICAgcnVsZXM6IFsgZXhpc3RpbmcgXVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHJ1bGUgaW5zdGFuY2VvZiBSdWxlLkFsdGVybmF0aXZlcyAmJiAocnVsZS5ncm91cCA9PT0gcnVsZU5hbWUpKSB7XG4gICAgICBleGlzdGluZy5hZGRSdWxlKC4uLnJ1bGUucnVsZXMpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGV4aXN0aW5nLmFkZFJ1bGUocnVsZSk7XG4gICAgfVxuICB9XG5cblx0Ly8gRmluZCB0aGUgbWF0Y2hpbmcgaW5zdGFuY2Ugb2YgKHBvc3NpYmx5IG5lc3RlZCkgYGVuZFRva2VuYCB0byBiYWxhbmNlIGBzdGFydFRva2VuYFxuXHQvL1x0aW4gYXJyYXkgb2YgYHRva2Vuc2AgKHN0cmluZ3MpLlxuXHQvLyBJZiBzdWNjZXNzZnVsLCByZXR1cm5zIGB7IHN0YXJ0LCBlbmQsIHNsaWNlIH1gXG5cdC8vIFRocm93cyBpZiB1bnN1Y2Vzc2Z1bC5cblx0c3RhdGljIGZpbmROZXN0ZWRUb2tlbnModG9rZW5zLCBzdGFydFRva2VuLCBlbmRUb2tlbiwgc3RhcnQgPSAwKSB7XG5cdFx0aWYgKHRva2Vuc1tzdGFydF0gIT09IHN0YXJ0VG9rZW4pIHRocm93IG5ldyBQYXJzZUVycm9yKGBFeHBlY3RlZCAnJHtzdGFydFRva2VufScgYXQgaW5kZXggJHtzdGFydH0gb2YgdG9rZW5zYCk7XG5cdFx0bGV0IG5lc3RpbmcgPSAwO1xuXHRcdGxldCBuZXN0ZWQgPSBmYWxzZTtcblx0XHRmb3IgKGxldCBlbmQgPSBzdGFydCArIDEsIGxhc3RJbmRleCA9IHRva2Vucy5sZW5ndGg7IGVuZCA8IGxhc3RJbmRleDsgZW5kKyspIHtcblx0XHRcdGxldCB0b2tlbiA9IHRva2Vuc1tlbmRdO1xuXHRcdFx0aWYgKHRva2VuID09PSBzdGFydFRva2VuKSB7XG5cdFx0XHRcdG5lc3RpbmcrKztcblx0XHRcdFx0bmVzdGVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGlmICh0b2tlbiA9PT0gZW5kVG9rZW4pIHtcblx0XHRcdFx0aWYgKG5lc3RpbmcgPT09IDApXG5cdFx0XHRcdFx0cmV0dXJuIHsgc3RhcnQsIGVuZCwgc2xpY2U6IHRva2Vucy5zbGljZShzdGFydCsxLCBlbmQpLCBuZXN0ZWQgfTtcblx0XHRcdFx0bmVzdGluZy0tO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aHJvdyBuZXcgUGFyc2VFcnJvcihgQ291bGRuJ3QgZmluZCBtYXRjaGluZyAnJHtlbmRUb2tlbn0ncyBzdGFydGluZyBhdCBpdGVtICR7c3RhcnR9YCk7XG5cdH1cbn1cblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1BhcnNlci5qcyIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgdmFyIFJFQUNUX0VMRU1FTlRfVFlQRSA9ICh0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmXG4gICAgU3ltYm9sLmZvciAmJlxuICAgIFN5bWJvbC5mb3IoJ3JlYWN0LmVsZW1lbnQnKSkgfHxcbiAgICAweGVhYzc7XG5cbiAgdmFyIGlzVmFsaWRFbGVtZW50ID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICBvYmplY3QgIT09IG51bGwgJiZcbiAgICAgIG9iamVjdC4kJHR5cGVvZiA9PT0gUkVBQ1RfRUxFTUVOVF9UWVBFO1xuICB9O1xuXG4gIC8vIEJ5IGV4cGxpY2l0bHkgdXNpbmcgYHByb3AtdHlwZXNgIHlvdSBhcmUgb3B0aW5nIGludG8gbmV3IGRldmVsb3BtZW50IGJlaGF2aW9yLlxuICAvLyBodHRwOi8vZmIubWUvcHJvcC10eXBlcy1pbi1wcm9kXG4gIHZhciB0aHJvd09uRGlyZWN0QWNjZXNzID0gdHJ1ZTtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2ZhY3RvcnlXaXRoVHlwZUNoZWNrZXJzJykoaXNWYWxpZEVsZW1lbnQsIHRocm93T25EaXJlY3RBY2Nlc3MpO1xufSBlbHNlIHtcbiAgLy8gQnkgZXhwbGljaXRseSB1c2luZyBgcHJvcC10eXBlc2AgeW91IGFyZSBvcHRpbmcgaW50byBuZXcgcHJvZHVjdGlvbiBiZWhhdmlvci5cbiAgLy8gaHR0cDovL2ZiLm1lL3Byb3AtdHlwZXMtaW4tcHJvZFxuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZmFjdG9yeVdpdGhUaHJvd2luZ1NoaW1zJykoKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9wcm9wLXR5cGVzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAzNThcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVzZS1iZWZvcmUtZGVmaW5lICovXG4vKipcbiAqIEBtb2R1bGUgZXZlbnRIYW5kbGVyc1xuICpcbiAqL1xuaW1wb3J0IGRvbUhlbHBlcnMgZnJvbSAnLi9saWIvZG9tX2hlbHBlcnMnO1xuaW1wb3J0IGxpc3RlbmVycyBmcm9tICcuL2xpYi9saXN0ZW5lcnMnO1xuaW1wb3J0ICogYXMgc3RvcmUgZnJvbSAnLi9zdG9yZSc7XG5cbi8qKlxuICogcHJpdmF0ZVxuICpcbiAqL1xuXG4vKipcbiAqIF9vbkNsaWNrXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgVGhlIGNsaWNrIGV2ZW50IG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50LnRhcmdldCBUaGUgRE9NIG5vZGUgZnJvbSB0aGUgY2xpY2sgZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9vbkNsaWNrKF9yZWYpIHtcbiAgdmFyIHRhcmdldCA9IF9yZWYudGFyZ2V0O1xuXG4gIHN0b3JlLmFjdGl2YXRlKFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoc3RvcmUuZ2V0SW5zdGFuY2VzKCkpKS5yZWR1Y2UoZG9tSGVscGVycy5maW5kQ29udGFpbmVyTm9kZXModGFyZ2V0KSwgW10pLnNvcnQoZG9tSGVscGVycy5zb3J0QnlET01Qb3NpdGlvbikubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uaW5zdGFuY2U7XG4gIH0pKTtcbn1cblxuLyoqXG4gKiBfb25LZXlEb3duOiBUaGUga2V5ZG93biBldmVudCBjYWxsYmFja1xuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IFRoZSBrZXlkb3duIGV2ZW50IG9iamVjdFxuICogQHBhcmFtIHtudW1iZXJ9IGV2ZW50LndoaWNoIFRoZSBrZXkgY29kZSAod2hpY2gpIHJlY2VpdmVkIGZyb20gdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9vbktleURvd24oZXZlbnQpIHtcbiAgdmFyIGZvcmNlQ29uc2lkZXIgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuXG4gIGlmIChmb3JjZUNvbnNpZGVyIHx8IF9zaG91bGRDb25zaWRlcihldmVudCkpIHtcbiAgICB2YXIgX3JlZjIgPSBzdG9yZS5maW5kQmluZGluZ0ZvckV2ZW50KGV2ZW50KSB8fCB7fSxcbiAgICAgICAgZm4gPSBfcmVmMi5mbixcbiAgICAgICAgaW5zdGFuY2UgPSBfcmVmMi5pbnN0YW5jZTtcblxuICAgIGlmIChmbikge1xuICAgICAgZm4uY2FsbChpbnN0YW5jZSwgZXZlbnQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBfc2hvdWxkQ29uc2lkZXI6IENvbmRpdGlvbnMgZm9yIHByb2NlZWRpbmcgd2l0aCBrZXkgZXZlbnQgaGFuZGxpbmdcbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCBUaGUga2V5ZG93biBldmVudCBvYmplY3RcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudC50YXJnZXQgVGhlIG5vZGUgb3JpZ2luIG9mIHRoZSBldmVudFxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0byBjb250aW51ZSBwcm9jZXNpbmcgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9zaG91bGRDb25zaWRlcihfcmVmMykge1xuICB2YXIgY3RybEtleSA9IF9yZWYzLmN0cmxLZXksXG4gICAgICB0YXJnZXQgPSBfcmVmMy50YXJnZXQ7XG5cbiAgcmV0dXJuIGN0cmxLZXkgfHwgIX5bJ0lOUFVUJywgJ1NFTEVDVCcsICdURVhUQVJFQSddLmluZGV4T2YodGFyZ2V0LnRhZ05hbWUpICYmICghdGFyZ2V0LmdldEF0dHJpYnV0ZSB8fCB0YXJnZXQuZ2V0QXR0cmlidXRlKCdyb2xlJykgIT09ICd0ZXh0Ym94Jyk7XG59XG5cbi8qKlxuICogcHVibGljXG4gKlxuICovXG5cbi8qKlxuICogb25Nb3VudFxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKi9cbmZ1bmN0aW9uIG9uTW91bnQoaW5zdGFuY2UpIHtcbiAgc3RvcmUuYWN0aXZhdGUoaW5zdGFuY2UpO1xuICBsaXN0ZW5lcnMuYmluZEtleXMoX29uS2V5RG93bik7XG4gIGxpc3RlbmVycy5iaW5kQ2xpY2tzKF9vbkNsaWNrKTtcbiAgZG9tSGVscGVycy5iaW5kRm9jdXNhYmxlcyhpbnN0YW5jZSwgc3RvcmUuYWN0aXZhdGUpO1xufVxuXG4vKipcbiAqIG9uVW5tb3VudFxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKi9cbmZ1bmN0aW9uIG9uVW5tb3VudChpbnN0YW5jZSkge1xuICBzdG9yZS5kZWxldGVJbnN0YW5jZShpbnN0YW5jZSk7XG4gIGlmIChzdG9yZS5pc0VtcHR5KCkpIHtcbiAgICBsaXN0ZW5lcnMudW5iaW5kQ2xpY2tzKF9vbkNsaWNrKTtcbiAgICBsaXN0ZW5lcnMudW5iaW5kS2V5cyhfb25LZXlEb3duKTtcbiAgfVxufVxuXG5leHBvcnQgeyBvbk1vdW50LCBvblVubW91bnQgfTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9ldmVudF9oYW5kbGVycy5qc1xuLy8gbW9kdWxlIGlkID0gMzgxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IG1vZGlmaWVycyBhcyBtb2RpZmllcktleXMsIEFMTF9LRVlTLCBBTExfUFJJTlRBQkxFX0tFWVMgfSBmcm9tICcuL2tleXMnO1xuXG52YXIgUFJJTlRBQkxFX0NIQVJBQ1RFUlMgPSAnMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVp+IUAjJCVeJiooKS1fKz1bXVxcXFx7fXw7XFwnOlwiLC4vPD4/wqMnO1xuXG52YXIgbW9kS2V5cyA9IE9iamVjdC5rZXlzKG1vZGlmaWVyS2V5cyk7XG5cbmZ1bmN0aW9uIG1hdGNoS2V5cyhfcmVmKSB7XG4gIHZhciBrZXlTZXQgPSBfcmVmLmtleVNldCxcbiAgICAgIGV2ZW50ID0gX3JlZi5ldmVudDtcbiAgdmFyIGtleSA9IGtleVNldC5rZXksXG4gICAgICBfa2V5U2V0JG1vZGlmaWVycyA9IGtleVNldC5tb2RpZmllcnMsXG4gICAgICBtb2RpZmllcnMgPSBfa2V5U2V0JG1vZGlmaWVycyA9PT0gdW5kZWZpbmVkID8gW10gOiBfa2V5U2V0JG1vZGlmaWVycztcblxuICB2YXIga2V5c01hdGNoID0gdm9pZCAwO1xuXG4gIGtleXNNYXRjaCA9IGtleSA9PT0gQUxMX0tFWVM7XG5cbiAgaWYgKGtleSA9PT0gQUxMX1BSSU5UQUJMRV9LRVlTKSB7XG4gICAgaWYgKGV2ZW50LmtleSkge1xuICAgICAgLy8gTW9kZXJuIGJyb3dzZXJzIGltcGxlbWVudCBga2V5YCwgc28gaWYgYGtleWAgaXMgbGVuZ3RoIDEsIHdlIGhhdmUgYSBtYXRjaC4gZS5nLiAnYScgZm9yIHRoZVxuICAgICAgLy8gYSBrZXksIG9yICcyJyBmb3IgdGhlIDIga2V5LiBBbGwgb3RoZXIgbm9uLXByaW50YWJsZSBjaGFyYWN0ZXJzIGhhdmUgbmFtZXMsIGUuZy4gJ0VudGVyJyBvciAnQmFja3NwYWNlJy5cbiAgICAgIGtleXNNYXRjaCA9IGV2ZW50LmtleS5sZW5ndGggPT09IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZvciBicm93c2VycyB0aGF0IGRvIG5vIHN1cHBvcnQgYGV2ZW50LmtleWAsIHdlIHRlc3QgYWdhaW5zdCBhIGxpc3Qgb2YgY2hhcmFjdGVyc1xuICAgICAgdmFyIHByZXNzZWRDaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZShldmVudC5jaGFyQ29kZSk7XG4gICAgICBrZXlzTWF0Y2ggPSBQUklOVEFCTEVfQ0hBUkFDVEVSUy5pbmRleE9mKHByZXNzZWRDaGFyKSA+PSAwO1xuICAgIH1cbiAgfVxuXG4gIGlmIChrZXkgPT09IGV2ZW50LndoaWNoKSB7XG4gICAgdmFyIGV2dE1vZEtleXMgPSBtb2RLZXlzLmZpbHRlcihmdW5jdGlvbiAobW9kS2V5KSB7XG4gICAgICByZXR1cm4gZXZlbnRbbW9kS2V5ICsgJ0tleSddO1xuICAgIH0pLnNvcnQoKTtcbiAgICBrZXlzTWF0Y2ggPSBtb2RpZmllcnMubGVuZ3RoID09PSBldnRNb2RLZXlzLmxlbmd0aCAmJiBtb2RpZmllcnMuZXZlcnkoZnVuY3Rpb24gKG1vZEtleSwgaW5kZXgpIHtcbiAgICAgIHJldHVybiBldnRNb2RLZXlzW2luZGV4XSA9PT0gbW9kS2V5O1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGtleXNNYXRjaDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWF0Y2hLZXlzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9tYXRjaF9rZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSAzODJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IEtleXMsIHsgbW9kaWZpZXJzIH0gZnJvbSAnLi9rZXlzJztcblxuZnVuY3Rpb24gcGFyc2VLZXlzKGtleXNBcnJheSkge1xuICByZXR1cm4ga2V5c0FycmF5Lm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGtleVNldCA9IHsga2V5OiBrZXkgfTtcbiAgICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhciBrZXlTdHJpbmcgPSBrZXkudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgICB2YXIgbWF0Y2hlcyA9IGtleVN0cmluZy5zcGxpdCgvXFxzP1xcK1xccz8vKTtcbiAgICAgIGtleVNldCA9IG1hdGNoZXMubGVuZ3RoID09PSAxID8geyBrZXk6IEtleXNba2V5U3RyaW5nXSB9IDoge1xuICAgICAgICBrZXk6IEtleXNbbWF0Y2hlcy5wb3AoKV0sXG4gICAgICAgIG1vZGlmaWVyczogbWF0Y2hlcy5tYXAoZnVuY3Rpb24gKG1vZEtleSkge1xuICAgICAgICAgIHJldHVybiBtb2RpZmllcnNbbW9kS2V5XTtcbiAgICAgICAgfSkuc29ydCgpXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ga2V5U2V0O1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcGFyc2VLZXlzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9wYXJzZV9rZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSAzODNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbnZhciBzdHlsZXNJbkRvbSA9IHt9LFxuXHRtZW1vaXplID0gZnVuY3Rpb24oZm4pIHtcblx0XHR2YXIgbWVtbztcblx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKHR5cGVvZiBtZW1vID09PSBcInVuZGVmaW5lZFwiKSBtZW1vID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdHJldHVybiBtZW1vO1xuXHRcdH07XG5cdH0sXG5cdGlzT2xkSUUgPSBtZW1vaXplKGZ1bmN0aW9uKCkge1xuXHRcdC8vIFRlc3QgZm9yIElFIDw9IDkgYXMgcHJvcG9zZWQgYnkgQnJvd3NlcmhhY2tzXG5cdFx0Ly8gQHNlZSBodHRwOi8vYnJvd3NlcmhhY2tzLmNvbS8jaGFjay1lNzFkODY5MmY2NTMzNDE3M2ZlZTcxNWMyMjJjYjgwNVxuXHRcdC8vIFRlc3RzIGZvciBleGlzdGVuY2Ugb2Ygc3RhbmRhcmQgZ2xvYmFscyBpcyB0byBhbGxvdyBzdHlsZS1sb2FkZXIgXG5cdFx0Ly8gdG8gb3BlcmF0ZSBjb3JyZWN0bHkgaW50byBub24tc3RhbmRhcmQgZW52aXJvbm1lbnRzXG5cdFx0Ly8gQHNlZSBodHRwczovL2dpdGh1Yi5jb20vd2VicGFjay1jb250cmliL3N0eWxlLWxvYWRlci9pc3N1ZXMvMTc3XG5cdFx0cmV0dXJuIHdpbmRvdyAmJiBkb2N1bWVudCAmJiBkb2N1bWVudC5hbGwgJiYgIXdpbmRvdy5hdG9iO1xuXHR9KSxcblx0Z2V0RWxlbWVudCA9IChmdW5jdGlvbihmbikge1xuXHRcdHZhciBtZW1vID0ge307XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG5cdFx0XHRpZiAodHlwZW9mIG1lbW9bc2VsZWN0b3JdID09PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdG1lbW9bc2VsZWN0b3JdID0gZm4uY2FsbCh0aGlzLCBzZWxlY3Rvcik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbWVtb1tzZWxlY3Rvcl1cblx0XHR9O1xuXHR9KShmdW5jdGlvbiAoc3R5bGVUYXJnZXQpIHtcblx0XHRyZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzdHlsZVRhcmdldClcblx0fSksXG5cdHNpbmdsZXRvbkVsZW1lbnQgPSBudWxsLFxuXHRzaW5nbGV0b25Db3VudGVyID0gMCxcblx0c3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AgPSBbXSxcblx0Zml4VXJscyA9IHJlcXVpcmUoXCIuL2ZpeFVybHNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlzdCwgb3B0aW9ucykge1xuXHRpZih0eXBlb2YgREVCVUcgIT09IFwidW5kZWZpbmVkXCIgJiYgREVCVUcpIHtcblx0XHRpZih0eXBlb2YgZG9jdW1lbnQgIT09IFwib2JqZWN0XCIpIHRocm93IG5ldyBFcnJvcihcIlRoZSBzdHlsZS1sb2FkZXIgY2Fubm90IGJlIHVzZWQgaW4gYSBub24tYnJvd3NlciBlbnZpcm9ubWVudFwiKTtcblx0fVxuXG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRvcHRpb25zLmF0dHJzID0gdHlwZW9mIG9wdGlvbnMuYXR0cnMgPT09IFwib2JqZWN0XCIgPyBvcHRpb25zLmF0dHJzIDoge307XG5cblx0Ly8gRm9yY2Ugc2luZ2xlLXRhZyBzb2x1dGlvbiBvbiBJRTYtOSwgd2hpY2ggaGFzIGEgaGFyZCBsaW1pdCBvbiB0aGUgIyBvZiA8c3R5bGU+XG5cdC8vIHRhZ3MgaXQgd2lsbCBhbGxvdyBvbiBhIHBhZ2Vcblx0aWYgKHR5cGVvZiBvcHRpb25zLnNpbmdsZXRvbiA9PT0gXCJ1bmRlZmluZWRcIikgb3B0aW9ucy5zaW5nbGV0b24gPSBpc09sZElFKCk7XG5cblx0Ly8gQnkgZGVmYXVsdCwgYWRkIDxzdHlsZT4gdGFncyB0byB0aGUgPGhlYWQ+IGVsZW1lbnRcblx0aWYgKHR5cGVvZiBvcHRpb25zLmluc2VydEludG8gPT09IFwidW5kZWZpbmVkXCIpIG9wdGlvbnMuaW5zZXJ0SW50byA9IFwiaGVhZFwiO1xuXG5cdC8vIEJ5IGRlZmF1bHQsIGFkZCA8c3R5bGU+IHRhZ3MgdG8gdGhlIGJvdHRvbSBvZiB0aGUgdGFyZ2V0XG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ1bmRlZmluZWRcIikgb3B0aW9ucy5pbnNlcnRBdCA9IFwiYm90dG9tXCI7XG5cblx0dmFyIHN0eWxlcyA9IGxpc3RUb1N0eWxlcyhsaXN0LCBvcHRpb25zKTtcblx0YWRkU3R5bGVzVG9Eb20oc3R5bGVzLCBvcHRpb25zKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcblx0XHR2YXIgbWF5UmVtb3ZlID0gW107XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGl0ZW0gPSBzdHlsZXNbaV07XG5cdFx0XHR2YXIgZG9tU3R5bGUgPSBzdHlsZXNJbkRvbVtpdGVtLmlkXTtcblx0XHRcdGRvbVN0eWxlLnJlZnMtLTtcblx0XHRcdG1heVJlbW92ZS5wdXNoKGRvbVN0eWxlKTtcblx0XHR9XG5cdFx0aWYobmV3TGlzdCkge1xuXHRcdFx0dmFyIG5ld1N0eWxlcyA9IGxpc3RUb1N0eWxlcyhuZXdMaXN0LCBvcHRpb25zKTtcblx0XHRcdGFkZFN0eWxlc1RvRG9tKG5ld1N0eWxlcywgb3B0aW9ucyk7XG5cdFx0fVxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBtYXlSZW1vdmUubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBkb21TdHlsZSA9IG1heVJlbW92ZVtpXTtcblx0XHRcdGlmKGRvbVN0eWxlLnJlZnMgPT09IDApIHtcblx0XHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKVxuXHRcdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKCk7XG5cdFx0XHRcdGRlbGV0ZSBzdHlsZXNJbkRvbVtkb21TdHlsZS5pZF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufTtcblxuZnVuY3Rpb24gYWRkU3R5bGVzVG9Eb20oc3R5bGVzLCBvcHRpb25zKSB7XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgaXRlbSA9IHN0eWxlc1tpXTtcblx0XHR2YXIgZG9tU3R5bGUgPSBzdHlsZXNJbkRvbVtpdGVtLmlkXTtcblx0XHRpZihkb21TdHlsZSkge1xuXHRcdFx0ZG9tU3R5bGUucmVmcysrO1xuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKGl0ZW0ucGFydHNbal0pO1xuXHRcdFx0fVxuXHRcdFx0Zm9yKDsgaiA8IGl0ZW0ucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0ZG9tU3R5bGUucGFydHMucHVzaChhZGRTdHlsZShpdGVtLnBhcnRzW2pdLCBvcHRpb25zKSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBwYXJ0cyA9IFtdO1xuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGl0ZW0ucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0cGFydHMucHVzaChhZGRTdHlsZShpdGVtLnBhcnRzW2pdLCBvcHRpb25zKSk7XG5cdFx0XHR9XG5cdFx0XHRzdHlsZXNJbkRvbVtpdGVtLmlkXSA9IHtpZDogaXRlbS5pZCwgcmVmczogMSwgcGFydHM6IHBhcnRzfTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gbGlzdFRvU3R5bGVzKGxpc3QsIG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlcyA9IFtdO1xuXHR2YXIgbmV3U3R5bGVzID0ge307XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGl0ZW0gPSBsaXN0W2ldO1xuXHRcdHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuXHRcdHZhciBjc3MgPSBpdGVtWzFdO1xuXHRcdHZhciBtZWRpYSA9IGl0ZW1bMl07XG5cdFx0dmFyIHNvdXJjZU1hcCA9IGl0ZW1bM107XG5cdFx0dmFyIHBhcnQgPSB7Y3NzOiBjc3MsIG1lZGlhOiBtZWRpYSwgc291cmNlTWFwOiBzb3VyY2VNYXB9O1xuXHRcdGlmKCFuZXdTdHlsZXNbaWRdKVxuXHRcdFx0c3R5bGVzLnB1c2gobmV3U3R5bGVzW2lkXSA9IHtpZDogaWQsIHBhcnRzOiBbcGFydF19KTtcblx0XHRlbHNlXG5cdFx0XHRuZXdTdHlsZXNbaWRdLnBhcnRzLnB1c2gocGFydCk7XG5cdH1cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIHN0eWxlRWxlbWVudCkge1xuXHR2YXIgc3R5bGVUYXJnZXQgPSBnZXRFbGVtZW50KG9wdGlvbnMuaW5zZXJ0SW50bylcblx0aWYgKCFzdHlsZVRhcmdldCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0SW50bycgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuXHR9XG5cdHZhciBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCA9IHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wW3N0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLmxlbmd0aCAtIDFdO1xuXHRpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ0b3BcIikge1xuXHRcdGlmKCFsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCkge1xuXHRcdFx0c3R5bGVUYXJnZXQuaW5zZXJ0QmVmb3JlKHN0eWxlRWxlbWVudCwgc3R5bGVUYXJnZXQuZmlyc3RDaGlsZCk7XG5cdFx0fSBlbHNlIGlmKGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKSB7XG5cdFx0XHRzdHlsZVRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGVFbGVtZW50LCBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcC5uZXh0U2libGluZyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0eWxlVGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlRWxlbWVudCk7XG5cdFx0fVxuXHRcdHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLnB1c2goc3R5bGVFbGVtZW50KTtcblx0fSBlbHNlIGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcImJvdHRvbVwiKSB7XG5cdFx0c3R5bGVUYXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGVFbGVtZW50KTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHZhbHVlIGZvciBwYXJhbWV0ZXIgJ2luc2VydEF0Jy4gTXVzdCBiZSAndG9wJyBvciAnYm90dG9tJy5cIik7XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuXHRzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xuXHR2YXIgaWR4ID0gc3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AuaW5kZXhPZihzdHlsZUVsZW1lbnQpO1xuXHRpZihpZHggPj0gMCkge1xuXHRcdHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLnNwbGljZShpZHgsIDEpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKSB7XG5cdHZhciBzdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG5cdG9wdGlvbnMuYXR0cnMudHlwZSA9IFwidGV4dC9jc3NcIjtcblxuXHRhdHRhY2hUYWdBdHRycyhzdHlsZUVsZW1lbnQsIG9wdGlvbnMuYXR0cnMpO1xuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgc3R5bGVFbGVtZW50KTtcblx0cmV0dXJuIHN0eWxlRWxlbWVudDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTGlua0VsZW1lbnQob3B0aW9ucykge1xuXHR2YXIgbGlua0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcblx0b3B0aW9ucy5hdHRycy50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuXHRvcHRpb25zLmF0dHJzLnJlbCA9IFwic3R5bGVzaGVldFwiO1xuXG5cdGF0dGFjaFRhZ0F0dHJzKGxpbmtFbGVtZW50LCBvcHRpb25zLmF0dHJzKTtcblx0aW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIGxpbmtFbGVtZW50KTtcblx0cmV0dXJuIGxpbmtFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBhdHRhY2hUYWdBdHRycyhlbGVtZW50LCBhdHRycykge1xuXHRPYmplY3Qua2V5cyhhdHRycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGFkZFN0eWxlKG9iaiwgb3B0aW9ucykge1xuXHR2YXIgc3R5bGVFbGVtZW50LCB1cGRhdGUsIHJlbW92ZSwgdHJhbnNmb3JtUmVzdWx0O1xuXG5cdC8vIElmIGEgdHJhbnNmb3JtIGZ1bmN0aW9uIHdhcyBkZWZpbmVkLCBydW4gaXQgb24gdGhlIGNzc1xuXHRpZiAob3B0aW9ucy50cmFuc2Zvcm0gJiYgb2JqLmNzcykge1xuXHQgICAgdHJhbnNmb3JtUmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm0ob2JqLmNzcyk7XG5cdCAgICBcblx0ICAgIGlmICh0cmFuc2Zvcm1SZXN1bHQpIHtcblx0ICAgIFx0Ly8gSWYgdHJhbnNmb3JtIHJldHVybnMgYSB2YWx1ZSwgdXNlIHRoYXQgaW5zdGVhZCBvZiB0aGUgb3JpZ2luYWwgY3NzLlxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBydW5uaW5nIHJ1bnRpbWUgdHJhbnNmb3JtYXRpb25zIG9uIHRoZSBjc3MuXG5cdCAgICBcdG9iai5jc3MgPSB0cmFuc2Zvcm1SZXN1bHQ7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgXHQvLyBJZiB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIHJldHVybnMgYSBmYWxzeSB2YWx1ZSwgZG9uJ3QgYWRkIHRoaXMgY3NzLiBcblx0ICAgIFx0Ly8gVGhpcyBhbGxvd3MgY29uZGl0aW9uYWwgbG9hZGluZyBvZiBjc3Ncblx0ICAgIFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHQgICAgXHRcdC8vIG5vb3Bcblx0ICAgIFx0fTtcblx0ICAgIH1cblx0fVxuXG5cdGlmIChvcHRpb25zLnNpbmdsZXRvbikge1xuXHRcdHZhciBzdHlsZUluZGV4ID0gc2luZ2xldG9uQ291bnRlcisrO1xuXHRcdHN0eWxlRWxlbWVudCA9IHNpbmdsZXRvbkVsZW1lbnQgfHwgKHNpbmdsZXRvbkVsZW1lbnQgPSBjcmVhdGVTdHlsZUVsZW1lbnQob3B0aW9ucykpO1xuXHRcdHVwZGF0ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZUVsZW1lbnQsIHN0eWxlSW5kZXgsIGZhbHNlKTtcblx0XHRyZW1vdmUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50LCBzdHlsZUluZGV4LCB0cnVlKTtcblx0fSBlbHNlIGlmKG9iai5zb3VyY2VNYXAgJiZcblx0XHR0eXBlb2YgVVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgVVJMLmNyZWF0ZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIFVSTC5yZXZva2VPYmplY3RVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBCbG9iID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0c3R5bGVFbGVtZW50ID0gY3JlYXRlTGlua0VsZW1lbnQob3B0aW9ucyk7XG5cdFx0dXBkYXRlID0gdXBkYXRlTGluay5iaW5kKG51bGwsIHN0eWxlRWxlbWVudCwgb3B0aW9ucyk7XG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcblx0XHRcdGlmKHN0eWxlRWxlbWVudC5ocmVmKVxuXHRcdFx0XHRVUkwucmV2b2tlT2JqZWN0VVJMKHN0eWxlRWxlbWVudC5ocmVmKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHN0eWxlRWxlbWVudCA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKTtcblx0XHR1cGRhdGUgPSBhcHBseVRvVGFnLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50KTtcblx0XHRyZW1vdmUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuXHRcdH07XG5cdH1cblxuXHR1cGRhdGUob2JqKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlU3R5bGUobmV3T2JqKSB7XG5cdFx0aWYobmV3T2JqKSB7XG5cdFx0XHRpZihuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXApXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdHVwZGF0ZShvYmogPSBuZXdPYmopO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZW1vdmUoKTtcblx0XHR9XG5cdH07XG59XG5cbnZhciByZXBsYWNlVGV4dCA9IChmdW5jdGlvbiAoKSB7XG5cdHZhciB0ZXh0U3RvcmUgPSBbXTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gKGluZGV4LCByZXBsYWNlbWVudCkge1xuXHRcdHRleHRTdG9yZVtpbmRleF0gPSByZXBsYWNlbWVudDtcblx0XHRyZXR1cm4gdGV4dFN0b3JlLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG4nKTtcblx0fTtcbn0pKCk7XG5cbmZ1bmN0aW9uIGFwcGx5VG9TaW5nbGV0b25UYWcoc3R5bGVFbGVtZW50LCBpbmRleCwgcmVtb3ZlLCBvYmopIHtcblx0dmFyIGNzcyA9IHJlbW92ZSA/IFwiXCIgOiBvYmouY3NzO1xuXG5cdGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSByZXBsYWNlVGV4dChpbmRleCwgY3NzKTtcblx0fSBlbHNlIHtcblx0XHR2YXIgY3NzTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcyk7XG5cdFx0dmFyIGNoaWxkTm9kZXMgPSBzdHlsZUVsZW1lbnQuY2hpbGROb2Rlcztcblx0XHRpZiAoY2hpbGROb2Rlc1tpbmRleF0pIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChjaGlsZE5vZGVzW2luZGV4XSk7XG5cdFx0aWYgKGNoaWxkTm9kZXMubGVuZ3RoKSB7XG5cdFx0XHRzdHlsZUVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNzc05vZGUsIGNoaWxkTm9kZXNbaW5kZXhdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGNzc05vZGUpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBhcHBseVRvVGFnKHN0eWxlRWxlbWVudCwgb2JqKSB7XG5cdHZhciBjc3MgPSBvYmouY3NzO1xuXHR2YXIgbWVkaWEgPSBvYmoubWVkaWE7XG5cblx0aWYobWVkaWEpIHtcblx0XHRzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibWVkaWFcIiwgbWVkaWEpXG5cdH1cblxuXHRpZihzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG5cdH0gZWxzZSB7XG5cdFx0d2hpbGUoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcblx0XHRcdHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG5cdFx0fVxuXHRcdHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcblx0fVxufVxuXG5mdW5jdGlvbiB1cGRhdGVMaW5rKGxpbmtFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuXG5cdC8qIElmIGNvbnZlcnRUb0Fic29sdXRlVXJscyBpc24ndCBkZWZpbmVkLCBidXQgc291cmNlbWFwcyBhcmUgZW5hYmxlZFxuXHRhbmQgdGhlcmUgaXMgbm8gcHVibGljUGF0aCBkZWZpbmVkIHRoZW4gbGV0cyB0dXJuIGNvbnZlcnRUb0Fic29sdXRlVXJsc1xuXHRvbiBieSBkZWZhdWx0LiAgT3RoZXJ3aXNlIGRlZmF1bHQgdG8gdGhlIGNvbnZlcnRUb0Fic29sdXRlVXJscyBvcHRpb25cblx0ZGlyZWN0bHlcblx0Ki9cblx0dmFyIGF1dG9GaXhVcmxzID0gb3B0aW9ucy5jb252ZXJ0VG9BYnNvbHV0ZVVybHMgPT09IHVuZGVmaW5lZCAmJiBzb3VyY2VNYXA7XG5cblx0aWYgKG9wdGlvbnMuY29udmVydFRvQWJzb2x1dGVVcmxzIHx8IGF1dG9GaXhVcmxzKXtcblx0XHRjc3MgPSBmaXhVcmxzKGNzcyk7XG5cdH1cblxuXHRpZihzb3VyY2VNYXApIHtcblx0XHQvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNjYwMzg3NVxuXHRcdGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIgKyBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpICsgXCIgKi9cIjtcblx0fVxuXG5cdHZhciBibG9iID0gbmV3IEJsb2IoW2Nzc10sIHsgdHlwZTogXCJ0ZXh0L2Nzc1wiIH0pO1xuXG5cdHZhciBvbGRTcmMgPSBsaW5rRWxlbWVudC5ocmVmO1xuXG5cdGxpbmtFbGVtZW50LmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXG5cdGlmKG9sZFNyYylcblx0XHRVUkwucmV2b2tlT2JqZWN0VVJMKG9sZFNyYyk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qc1xuLy8gbW9kdWxlIGlkID0gNDc2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IG9ic2VydmVyIH0gZnJvbSBcIm1vYngtcmVhY3RcIjtcbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBrZXlkb3duIGZyb20gXCJyZWFjdC1rZXlkb3duXCI7XG5pbXBvcnQgeyBCdXR0b24sIERyb3Bkb3duLCBHcmlkLCBNZW51LCBTZWdtZW50LCBUZXh0QXJlYSB9IGZyb20gJ3NlbWFudGljLXVpLXJlYWN0J1xuXG5pbXBvcnQgRXhhbXBsZVN0b3JlIGZyb20gXCIuL0V4YW1wbGVTdG9yZVwiO1xuaW1wb3J0IFNwYWNlciBmcm9tIFwiLi9TcGFjZXIuanN4XCI7XG5pbXBvcnQgXCIuL3N0eWxlcy5sZXNzXCI7XG5pbXBvcnQgVGFiYmFibGVUZXh0QXJlYSBmcm9tIFwiLi9UYWJiYWJsZVRleHRBcmVhLmpzeFwiO1xuXG5Ab2JzZXJ2ZXJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwZWxsRWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0c3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcblx0XHRleGFtcGxlczogbmV3IEV4YW1wbGVTdG9yZSgpXG5cdH07XG5cblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcyk7XG53aW5kb3cuZXhhbXBsZXMgPSBwcm9wcy5leGFtcGxlcztcblx0XHR0aGlzLnByb3BzLmV4YW1wbGVzLmxvYWQoKTtcblxuXHRcdC8vREVCVUdcblx0XHR3aW5kb3cuc3BlbGxFZGl0b3IgPSB0aGlzO1xuXHRcdHdpbmRvdy5leGFtcGxlcyA9IHRoaXMucHJvcHMuZXhhbXBsZXM7XG5cdH1cblxuXHRAa2V5ZG93bihcImN0cmwrc1wiKVxuXHRzYXZlKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLnNhdmUoKTsgfVxuXG5cdEBrZXlkb3duKFwiY3RybCtyXCIpXG5cdHJldmVydCgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5yZXZlcnQoKTsgfVxuXG5cdEBrZXlkb3duKFwiY3RybCtjXCIpXG5cdGNvbXBpbGUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuY29tcGlsZSgpOyB9XG5cblx0QGtleWRvd24oXCJjdHJsK25cIilcblx0Y3JlYXRlKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLmNyZWF0ZSgpOyB9XG5cblx0QGtleWRvd24oXCJjdHJsK2RcIilcblx0ZGVsZXRlKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLmRlbGV0ZSh1bmRlZmluZWQsIFwiQ09ORklSTVwiKTsgfVxuXG5cdHJlbmFtZSgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5yZW5hbWUoKTsgfVxuXHRkdXBsaWNhdGUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuZHVwbGljYXRlKCk7IH1cblx0bG9hZCgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5sb2FkKCk7IH1cblx0cmVzZXQoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMucmVzZXQoKTsgfVxuXG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCB7IGV4YW1wbGVzIH0gPSB0aGlzLnByb3BzO1xuXHRcdGxldCB7IHRpdGxlcywgc2VsZWN0ZWQsIGRpcnR5LCBjb2RlLCBvdXRwdXQgfSA9IGV4YW1wbGVzO1xuXG5cdFx0Ly8gQ3JlYXRlIG1lbnVpdGVtcyBmcm9tIHRoZSBleGFtcGxlc1xuXHRcdGxldCBvcHRpb25zID0gdGl0bGVzLm1hcCggdGl0bGUgPT5cblx0XHRcdCh7XG5cdFx0XHRcdHZhbHVlOiB0aXRsZSxcblx0XHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0XHR0ZXh0OiB0aXRsZSxcblx0XHRcdFx0Y29udGVudDogdGl0bGUsXG5cdFx0XHRcdG9uQ2xpY2s6ICgpID0+IGV4YW1wbGVzLnNlbGVjdCh0aXRsZSlcblx0XHRcdH0pKTtcblxuXHRcdGxldCBkaXJ0eUJ1dHRvbnMgPSAoKSA9PiB7XG5cdFx0XHRpZiAoIWRpcnR5KSByZXR1cm47XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8TWVudSBzZWNvbmRhcnkgc3R5bGU9e3sgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgcmlnaHQ6IFwiMXJlbVwiLCB0b3A6IFwiM3B4XCIsIG1hcmdpbjogMCB9fT5cblx0XHRcdFx0XHQ8QnV0dG9uIG5lZ2F0aXZlIG9uQ2xpY2s9eygpID0+IHRoaXMucmV2ZXJ0KCl9Pjx1PlI8L3U+ZXZlcnQ8L0J1dHRvbj5cblx0XHRcdFx0XHQ8QnV0dG9uIHBvc2l0aXZlIG9uQ2xpY2s9eygpID0+IHRoaXMuc2F2ZSgpfT48dT5TPC91PmF2ZTwvQnV0dG9uPlxuXHRcdFx0XHQ8L01lbnU+XG5cdFx0XHQpO1xuXHRcdH07XG5cblx0XHRsZXQgY29tcGlsZUJ1dHRvbiA9ICgpID0+IHtcblx0XHRcdGlmIChvdXRwdXQpIHJldHVybjtcblx0XHRcdHJldHVybiA8QnV0dG9uXG5cdFx0XHRcdFx0c3R5bGU9e3sgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgIHdpZHRoOiBcIjRlbVwiLCBsZWZ0OiBcImNhbGMoNTAlIC0gMmVtKVwiLCB0b3A6IFwiNTAlXCIgfX1cblx0XHRcdFx0XHRvbkNsaWNrPXsoKSA9PiB0aGlzLmNvbXBpbGUoKX1cblx0XHRcdFx0XHRpY29uPVwicmlnaHQgY2hldnJvblwiLz47XG5cdFx0fTtcblxuXHRcdHJldHVybiAoXG5cdFx0PEdyaWQgc3RyZXRjaGVkIHBhZGRlZCBjbGFzc05hbWU9XCJmdWxsSGVpZ2h0XCI+XG5cdFx0XHQ8R3JpZC5Sb3cgc3R5bGU9e3sgaGVpZ2h0OiBcIjJyZW1cIiwgcGFkZGluZ1RvcDogXCIwcmVtXCIgfX0gY2xhc3NOYW1lPVwidWkgaW52ZXJ0ZWQgYXR0YWNoZWQgbWVudVwiPlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezd9PlxuXHRcdFx0XHRcdDxNZW51IGludmVydGVkIGF0dGFjaGVkIGZsdWlkPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbT5FeGFtcGxlOjwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdFx0PERyb3Bkb3duIGl0ZW0gc2VsZWN0aW9uIG9wdGlvbnM9e29wdGlvbnN9IHZhbHVlPXtzZWxlY3RlZH0gc3R5bGU9e3sgd2lkdGg6IFwiMjBlbVwiIH19Lz5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0gb25DbGljaz17KCkgPT4gdGhpcy5kZWxldGUoKX0+PHU+RDwvdT5lbGV0ZTwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbSBvbkNsaWNrPXsoKSA9PiB0aGlzLnJlbmFtZSgpfT5SZW5hbWU8L01lbnUuSXRlbT5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0gb25DbGljaz17KCkgPT4gdGhpcy5kdXBsaWNhdGUoKX0+RHVwbGljYXRlPC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0PC9NZW51PlxuXHRcdFx0XHQ8L0dyaWQuQ29sdW1uPlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezJ9PlxuXHRcdFx0XHRcdDxNZW51IGludmVydGVkIGF0dGFjaGVkIGZsdWlkPlxuXHRcdFx0XHRcdFx0PFNwYWNlciBmbHVpZC8+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtIG9uQ2xpY2s9eygpID0+IHRoaXMuY3JlYXRlKCl9Pjx1Pk48L3U+ZXc8L01lbnUuSXRlbT5cblx0XHRcdFx0XHRcdDxTcGFjZXIgZmx1aWQvPlxuXHRcdFx0XHRcdDwvTWVudT5cblx0XHRcdFx0PC9HcmlkLkNvbHVtbj5cblx0XHRcdFx0PEdyaWQuQ29sdW1uIHdpZHRoPXs3fT5cblx0XHRcdFx0XHQ8TWVudSBpbnZlcnRlZCBhdHRhY2hlZCBmbHVpZD5cblx0XHRcdFx0XHRcdDxTcGFjZXIgZmx1aWQvPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbSBvbkNsaWNrPXsoKSA9PiB0aGlzLmxvYWQoKX0+UmVsb2FkPC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtIG9uQ2xpY2s9eygpID0+IHRoaXMucmVzZXQoKX0+UmVzZXQ8L01lbnUuSXRlbT5cblx0XHRcdFx0XHQ8L01lbnU+XG5cdFx0XHRcdDwvR3JpZC5Db2x1bW4+XG5cdFx0XHQ8L0dyaWQuUm93PlxuXHRcdFx0PEdyaWQuUm93IHN0eWxlPXt7IGhlaWdodDogXCJjYWxjKDEwMCUgLSAzcmVtKVwiIH19PlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezh9PlxuXHRcdFx0XHRcdDxUYWJiYWJsZVRleHRBcmVhXG5cdFx0XHRcdFx0XHRjbGFzc05hbWU9XCJ1aSBzZWdtZW50XCJcblx0XHRcdFx0XHRcdHZhbHVlPXtjb2RlfVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyhldmVudCkgPT4gZXhhbXBsZXMudXBkYXRlKGV4YW1wbGVzLnNlbGVjdGVkLCBldmVudC50YXJnZXQudmFsdWUsIFwiU0tJUF9TQVZFXCIpfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0e2RpcnR5QnV0dG9ucygpfVxuXHRcdFx0XHQ8L0dyaWQuQ29sdW1uPlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezh9PlxuXHRcdFx0XHRcdDxUZXh0QXJlYSBjbGFzc05hbWU9XCJ1aSBzZWdtZW50XCIgdmFsdWU9e291dHB1dH0vPlxuXHRcdFx0XHQ8L0dyaWQuQ29sdW1uPlxuXHRcdFx0XHR7Y29tcGlsZUJ1dHRvbigpfVxuXHRcdFx0PC9HcmlkLlJvdz5cblx0XHQ8L0dyaWQ+XG5cdCk7fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC9TcGVsbEVkaXRvci5qc3giLCIvLyBFeHBvcnQgYWxsIHN0YW5kYXJkIFwic3BlbGxcIiBydWxlcy5cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4uLy4uL1BhcnNlci5qc1wiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGUuanNcIjtcbmltcG9ydCBwYXJzZVJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVTeW50YXguanNcIjtcbmltcG9ydCBUb2tlbml6ZXIgZnJvbSBcIi4uLy4uL1Rva2VuaXplci5qc1wiO1xuXG4vLyBMb2FkIGFsbCBzdGFuZGFyZCBydWxlcyBmaWxlcy5cbmltcG9ydCBcIi4vY29yZS5qc1wiO1xuaW1wb3J0IFwiLi9pZi5qc1wiO1xuaW1wb3J0IFwiLi9KU1guanNcIjtcbmltcG9ydCBcIi4vbGlzdHMuanNcIjtcbmltcG9ydCBcIi4vb3BlcmF0b3JzLmpzXCI7XG5pbXBvcnQgXCIuL3N0YXRlbWVudHMuanNcIjtcbmltcG9ydCBcIi4vdHlwZXMuanNcIjtcbmltcG9ydCBcIi4vVUkuanNcIjtcblxuLy8gQ3JlYXRlIHBhcnNlciB3aGljaCBjb21iaW5lcyBhbGwgb2YgdGhlIGFib3ZlLi4uXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTW9kdWxlKFwic3BlbGxcIik7XG4vLyAuLi53aGljaCBkZXBlbmRzIG9uIHJ1bGVzIGxvYWRlZCBhYm92ZS4uLlxucGFyc2VyLmltcG9ydChcImNvcmVcIiwgXCJ0eXBlc1wiLCBcImxpc3RzXCIsIFwib3BlcmF0b3JzXCIsIFwiaWZcIiwgXCJzdGF0ZW1lbnRzXCIsIFwiSlNYXCIsIFwiVUlcIik7XG4vLyAuLi5hcyB0aGUgZGVmYXVsdCBleHBvcnRcbmV4cG9ydCBkZWZhdWx0IHBhcnNlcjtcblxuLy8gU3RpY2sgb3RoZXIgc3R1ZmYgb24gYHdpbmRvd2AgZm9yIHJlZmxlY3Rpb24gYW5kIGFkLWhvYyB0ZXN0aW5nLlxuaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0T2JqZWN0LmFzc2lnbih3aW5kb3csIHtcblx0XHRQYXJzZXIsXG5cdFx0cGFyc2VSdWxlLFxuXG5cdFx0UnVsZSxcblxuXHRcdFRva2VuaXplcixcblx0XHR0b2tlbml6ZTogVG9rZW5pemVyLnRva2VuaXplLmJpbmQoZXhwb3J0cy5Ub2tlbml6ZXIpLFxuXG5cdFx0cGFyc2VyLFxuXHRcdHBhcnNlOiBwYXJzZXIucGFyc2UuYmluZChwYXJzZXIpLFxuXHRcdGNvbXBpbGU6IHBhcnNlci5jb21waWxlLmJpbmQocGFyc2VyKSxcblx0fSk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvaW5kZXguanMiLCIvKiBTdG9yZSBvZiBleGFtcGxlIHNwZWxsIGNvZGUgZnJhZ21lbnRzLiAqL1xuaW1wb3J0IG1vYngsIHsgb2JzZXJ2YWJsZSwgY29tcHV0ZWQgfSBmcm9tIFwibW9ieFwiO1xuXG4vLyBNYWtlIFBhcnNlciBhbmQgVG9rZW5pemVyIFdBUk4gYXMgd2UgcnVuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi9QYXJzZXJcIjtcblBhcnNlci5XQVJOID0gdHJ1ZTtcblBhcnNlci5ERUJVRyA9IHRydWU7XG5QYXJzZXIuVElNRSA9IHRydWU7XG5cbmltcG9ydCBUb2tlbml6ZXIgZnJvbSBcIi4uL1Rva2VuaXplclwiO1xuVG9rZW5pemVyLldBUk4gPSB0cnVlO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4YW1wbGVTdG9yZSB7XG5cdC8vIENVUlJFTlQgZXhhbXBsZXNcblx0QG9ic2VydmFibGUgZXhhbXBsZXMgPSB7fTtcblx0Ly8gRXhhbXBsZXMgYXMgb2YgbGFzdCBzYXZlIChmb3IgcmV2ZXIpXG5cdEBvYnNlcnZhYmxlIF9zYXZlZEV4YW1wbGVzID0ge307XG5cdC8vIFNlbGVjdGVkIGV4YW1wbGUga2V5LlxuXHRAb2JzZXJ2YWJsZSBzZWxlY3RlZCA9IFwiXCI7XG5cdC8vIENvbXBpbGVkIG91dHB1dC5cblx0QG9ic2VydmFibGUgb3V0cHV0ID0gXCJcIjtcblxuXHQvLyBSZXR1cm4ganVzdCB0aGUgdGl0bGVzIG9mIHRoZSBleGFtcGxlcy5cblx0QGNvbXB1dGVkIGdldCB0aXRsZXMoKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuZXhhbXBsZXMpO1xuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBjb2RlIGZvciB0aGUgY3VycmVudCBleGFtcGxlXG5cdEBjb21wdXRlZCBnZXQgY29kZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5leGFtcGxlc1t0aGlzLnNlbGVjdGVkXTtcblx0fVxuXG5cdC8vIElzIEFOWVRISU5HIGRpcnR5P1xuXHRAY29tcHV0ZWQgZ2V0IGRpcnR5KCkge1xuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLl9zYXZlZEV4YW1wbGVzKSAhPT0gSlNPTi5zdHJpbmdpZnkodGhpcy5leGFtcGxlcyk7XG5cdH1cblxuXHQvLyBSZXNldCBhbGwgZXhhbXBsZXMgZnJvbSBsb2NhbFN0b3JhZ2UuXG5cdHJlc2V0KCkge1xuXHRcdGRlbGV0ZSBsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlcztcblx0XHRkZWxldGUgbG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZTtcblx0XHR3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG5cdH1cblxuXHQvLyBMb2FkIGV4YW1wbGVzXG5cdGxvYWQoKSB7XG5cdFx0Ly8gTG9hZCBleGFtcGxlcyBmcm9tIGxvY2FsU3RvcmFnZVxuXHRcdHRoaXMuZXhhbXBsZXMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5zcGVsbEVkaXRvckV4YW1wbGVzXG5cdFx0XHR8fCAne1wiRm9vXCI6XCJkZWZpbmUgdHlwZSBGb29cIiwgXCJCYXJcIjpcImRlZmluZSB0eXBlIEJhclwifScpO1xuXG5cdFx0Ly8gU2F2ZSBhIGNvcHkgb2YgZXhhbXBsZXMgZm9yIHJldmVydFxuXHRcdHRoaXMuX3NhdmVkRXhhbXBsZXMgPSB0aGlzLmV4YW1wbGVzO1xuXG5cdFx0Ly8gTG9hZCBzZWxlY3RlZCBleGFtcGxlIG5hbWVcblx0XHR0aGlzLnNlbGVjdChsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlKTtcblx0fVxuXG5cdC8vIFNhdmUgY3VycmVudCBleGFtcGxlcy5cblx0c2F2ZSgpIHtcblx0XHRsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlcyA9IEpTT04uc3RyaW5naWZ5KHRoaXMuZXhhbXBsZXMpO1xuXG5cdFx0Ly8gU2F2ZSBhIGNvcHkgb2YgZXhhbXBsZXMgZm9yIHJldmVydFxuXHRcdHRoaXMuX3NhdmVkRXhhbXBsZXMgPSB0aGlzLmV4YW1wbGVzO1xuXHR9XG5cblx0Ly8gUmV2ZXJ0IHRoZSBjdXJyZW50IGV4YW1wbGVcblx0cmV2ZXJ0KGV4YW1wbGUgPSB0aGlzLnNlbGVjdGVkKSB7XG5cdFx0dGhpcy51cGRhdGUoZXhhbXBsZSwgdGhpcy5fc2F2ZWRFeGFtcGxlc1tleGFtcGxlXSk7XG5cdH1cblxuXHQvLyBTZWxlY3QgYSBkaWZmZXJlbnQgZXhhbXBsZS5cblx0c2VsZWN0KGV4YW1wbGUpIHtcblx0XHRpZiAoIWV4YW1wbGUgfHwgdGhpcy5leGFtcGxlc1tleGFtcGxlXSA9PSBudWxsKSBleGFtcGxlID0gT2JqZWN0LmtleXModGhpcy5leGFtcGxlcylbMF0gfHwgXCJcIjtcblx0XHR0aGlzLnNlbGVjdGVkID0gbG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZSA9IGV4YW1wbGU7XG5cdFx0dGhpcy5vdXRwdXQgPSBcIlwiO1xuXHR9XG5cblx0Ly8gQ3JlYXRlIGEgbmV3IGV4YW1wbGUuXG5cdC8vIFNhdmVzIGFuZCBzZWxlY3RzIHRoZSBleGFtcGxlIGF1dG9tYXRpY2FsbHkuXG5cdHVwZGF0ZShuYW1lLCBjb2RlLCBza2lwU2F2ZSkge1xuXHRcdHRoaXMuZXhhbXBsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmV4YW1wbGVzLCB7IFsgbmFtZSBdOiBjb2RlIH0pO1xuXHRcdHRoaXMuc2VsZWN0KG5hbWUpO1xuXHRcdHRoaXMub3V0cHV0ID0gXCJcIjtcblx0XHRpZiAoIXNraXBTYXZlKSB0aGlzLnNhdmUoKTtcblx0fVxuXG5cdC8vIERlbGV0ZSBhbiBleGFtcGxlLlxuXHQvLyBTYXZlcyBhbmQgc2VsZWN0cyBhbm90aGVyIGV4YW1wbGUgYXV0b21hdGljYWxseS5cblx0ZGVsZXRlKG5hbWUgPSB0aGlzLnNlbGVjdGVkLCBzaG93Q29uZmlybSkge1xuXHRcdGlmIChzaG93Q29uZmlybSAmJiAhY29uZmlybShgUmVhbGx5IGRlbGV0ZSBleGFtcGxlICR7bmFtZX0/YCkpIHJldHVybjtcblx0XHRsZXQgZXhhbXBsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmV4YW1wbGVzKTtcblx0XHRkZWxldGUgZXhhbXBsZXNbbmFtZV07XG5cdFx0dGhpcy5leGFtcGxlcyA9IGV4YW1wbGVzO1xuXHRcdHRoaXMuc2F2ZSgpO1xuXHRcdHRoaXMuc2VsZWN0KCk7XG5cdH1cblxuXHQvLyBDcmVhdGUgYSBuZXcgZXhhbXBsZS5cblx0Y3JlYXRlKG5hbWUsIGNvZGUgPSBcIlwiKSB7XG5cdFx0Ly8gSWYgbm8gbmFtZSwgcHJvbXB0LlxuXHRcdGlmICghbmFtZSkgbmFtZSA9IHByb21wdChcIk5hbWUgZm9yIHRoaXMgZXhhbXBsZT9cIik7XG5cdFx0Ly8gRm9yZ2V0IGl0IGlmIG5vIG5hbWUuXG5cdFx0aWYgKCFuYW1lKSByZXR1cm47XG5cblx0XHR0aGlzLnVwZGF0ZShuYW1lLCBjb2RlKTtcblx0fVxuXG5cdC8vIFJlbmFtZSBhbiBleGFtcGxlLlxuXHQvLyBTZWxlY3RzIGFuZCBzYXZlcyBhdXRvbWF0aWNhbGx5LlxuXHRyZW5hbWUob2xkTmFtZSA9IHRoaXMuc2VsZWN0ZWQsIG5ld05hbWUpIHtcblx0XHQvLyBJZiBubyBuZXcgbmFtZSwgcHJvbXB0LlxuXHRcdGlmICghbmV3TmFtZSkgbmV3TmFtZSA9IHByb21wdChcIk5ldyBuYW1lIGZvciB0aGlzIGV4YW1wbGU/XCIsIG9sZE5hbWUpO1xuXG5cdFx0Ly8gRm9yZ2V0IGl0IGlmIG5vIG5hbWUgc3VwcGxpZWQgb3IgbmFtZSBpcyB0aGUgc2FtZVxuXHRcdGlmICghbmV3TmFtZSB8fCBuZXdOYW1lID09PSBvbGROYW1lKSByZXR1cm47XG5cdFx0aWYgKHRoaXMuZXhhbXBsZXNbbmV3TmFtZV0pIHJldHVybiBjb25zb2xlLndhcm4oYGV4YW1wbGVzLnJlbmFtZShcIiR7bmV3TmFtZX1cIik6IG5hbWUgYWxyZWFkeSBpbiB1c2VgKTtcblxuXHRcdGxldCBjb2RlID0gdGhpcy5leGFtcGxlc1tvbGROYW1lXTtcblx0XHR0aGlzLmRlbGV0ZShvbGROYW1lKTtcblx0XHR0aGlzLnVwZGF0ZShuZXdOYW1lLCBjb2RlKTtcblx0fVxuXG5cdC8vIER1cGxpY2F0ZSBhbiBleGFtcGxlLlxuXHRkdXBsaWNhdGUob2xkTmFtZSA9IHRoaXMuc2VsZWN0ZWQsIG5ld05hbWUpIHtcblx0XHQvLyBJZiBubyBuZXcgbmFtZSwgcHJvbXB0LlxuXHRcdGlmICghbmV3TmFtZSkgbmV3TmFtZSA9IHByb21wdChcIk5ldyBuYW1lIGZvciBkdXBsaWNhdGUgZXhhbXBsZT9cIiwgb2xkTmFtZSk7XG5cdFx0Ly8gRm9yZ2V0IGl0IGlmIG5vIG5hbWUgc3VwcGxpZWQgb3IgbmFtZSBpcyB0aGUgc2FtZVxuXHRcdGlmICghbmV3TmFtZSB8fCBuZXdOYW1lID09PSBvbGROYW1lKSByZXR1cm47XG5cdFx0aWYgKHRoaXMuZXhhbXBsZXNbbmV3TmFtZV0pIHJldHVybiBjb25zb2xlLndhcm4oYGV4YW1wbGVzLnJlbmFtZShcIiR7bmV3TmFtZX1cIik6IG5hbWUgYWxyZWFkeSBpbiB1c2VgKTtcblxuXHRcdHRoaXMudXBkYXRlKG5ld05hbWUsIHRoaXMuY29kZSk7XG5cdH1cblxuXHQvLyBDb21waWxlIHRoZSBjdXJyZW50IGV4YW1wbGUsIHBsYWNpbmcgaXQgaW4gb3VyIGBvdXRwdXRgLlxuLy9UT0RPOiBzb21lIHdheSB0byBkbyB0aGlzIGF1dG9tYXRpY2FsbHkgdy8gXCJvdXRwdXRcIiA/XG5cdGNvbXBpbGUoKSB7XG5cdFx0dGhpcy5vdXRwdXQgPSBcIi4uLmNvbXBpbGluZy4uLlwiO1xuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0bGV0IHJlc3VsdCA9IHBhcnNlci5wYXJzZShcInN0YXRlbWVudHNcIiwgdGhpcy5jb2RlKTtcblx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihcIkNhbid0IHBhcnNlIVwiKTtcblx0XHRcdFx0dGhpcy5vdXRwdXQgPSBcIkNhbid0IHBhcnNlIHN0YXRlbWVudHNcIjtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmluZm8oXCJSZXN1bHRcIiwgcmVzdWx0KTtcblx0XHRcdFx0dGhpcy5vdXRwdXQgPSByZXN1bHQudG9Tb3VyY2UocGFyc2VyKTtcblx0XHRcdH1cblx0XHR9LCAxMDApO1xuXHR9XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hcHAvRXhhbXBsZVN0b3JlLmpzIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0xMTU3NTkwMjhcbnZhciBnbG9iYWwgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lk1hdGggPT0gTWF0aFxuICA/IHdpbmRvdyA6IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnICYmIHNlbGYuTWF0aCA9PSBNYXRoID8gc2VsZlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3LWZ1bmNcbiAgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuaWYgKHR5cGVvZiBfX2cgPT0gJ251bWJlcicpIF9fZyA9IGdsb2JhbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZ2xvYmFsLmpzXG4vLyBtb2R1bGUgaWQgPSA0OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vXG4vLyAgPFNwYWNlcj4gY29tcG9uZW50IGZvciB1c2Ugd2l0aCBvYWsuXG4vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSBcInByb3AtdHlwZXNcIjtcbmltcG9ydCB7IGNsYXNzTmFtZXMgfSBmcm9tIFwiLi91dGlsXCI7XG5cbmltcG9ydCBcIi4vU3BhY2VyLmxlc3NcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU3BhY2VyKHByb3BzKSB7XG4gIGNvbnN0IHtcbiAgICBjbGFzc05hbWUsXG4gICAgYXBwZWFyYW5jZSwgc2l6ZSwgd2lkdGgsIGhlaWdodCxcbiAgICBpbmxpbmUsIGZsdWlkLCB0aW55LCBzbWFsbCwgbWVkaXVtLCBsYXJnZSwgaHVnZSwgbWFzc2l2ZVxuICB9ID0gcHJvcHM7XG5cbiAgY29uc3Qgc3BhY2VyUHJvcHMgPSB7XG4gICAgY2xhc3NOYW1lOiBjbGFzc05hbWVzKGNsYXNzTmFtZSwgXCJvYWtcIiwgc2l6ZSwgYXBwZWFyYW5jZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgeyBpbmxpbmUsIGZsdWlkIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3BhY2VyXCIpLFxuICAgIHN0eWxlOiB7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICB9XG4gIH1cblxuICByZXR1cm4gPGRpdiB7Li4uc3BhY2VyUHJvcHN9Lz47XG59XG5cblNwYWNlci5wcm9wVHlwZXMgPSB7XG4gIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgYXBwZWFyYW5jZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgc2l6ZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIsXG4gIGhlaWdodDogUHJvcFR5cGVzLm51bWJlcixcblxuICBpbmxpbmU6IFByb3BUeXBlcy5ib29sLFxuICBmbHVpZDogUHJvcFR5cGVzLmJvb2wsXG5cbn07XG5cblNwYWNlci5kZWZhdWx0UHJvcHMgPSB7XG4gIHNpemU6IFwibWVkaXVtXCJcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hcHAvU3BhY2VyLmpzeCIsImltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBwcm9wVHlwZXMgZnJvbSBcInByb3AtdHlwZXNcIjtcbmltcG9ydCB7IFRleHRBcmVhIH0gZnJvbSAnc2VtYW50aWMtdWktcmVhY3QnXG5cbi8vXG4vL1x0IyA8VGFiYmFibGVUZXh0QXJlYT4gLS0gPFNVSS5UZXh0QXJlYT4gaW4gd2hpY2ggeW91IGNhbiB0eXBlIGEgdGFiIGNoYXJhY3Rlcjpcbi8vXHQtIElmIG5vdGhpbmcgaXMgc2VsZWN0ZWQsIGluc2VydHMgYSB0YWIgY2hhcmFjdGVyXG4vL1x0LSBJZiBhbnl0aGluZyBpcyBzZWxlY3RlZCwgaW5zZXJ0cyB0YWIgY2hhcmFjdGVycyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lKHMpXG4vL1x0LSBJZiBzaGlmdCBrZXkgaXMgZG93biwgaW5zZXJ0cyB0YWIgY2hhcmFjdGVycyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lKHMpLlxuLy9cbi8vXHQjIyMgUHJvcGVydGllc1xuLy9cdC0gYHNhdmVgIChyZXF1aXJlZCkgLS0gZnVuY3Rpb24gdXNlZCB0byBzYXZlIHRoZSByZXN1bHRzIG9uIGtleXByZXNzXG4vL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFiYmFibGVUZXh0QXJlYSBleHRlbmRzIFRleHRBcmVhIHtcblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiA8VGV4dEFyZWEgey4uLnRoaXMucHJvcHN9IG9uS2V5RG93bj17dGhpcy5vbktleURvd259IC8+O1xuXHR9XG5cblx0Ly8gRG8gTk9UIGV4aXQgb24gdGFiIC0tIGluc2VydCBvciByZW1vdmUgdGFiKHMpIHZhbHVlIGluc3RlYWQuXG5cdG9uS2V5RG93biA9IChldmVudCkgPT4ge1xuXG4vL1RPRE8gZmlyZSBgdGhpcy5wcm9wcy5vbktleURvd25gIGlmIGRlZmluZWQuLi5cblx0XHQvLyBGb3JnZXQgaXQgaWYgbm90IGEgdGFiXG5cdFx0aWYgKGV2ZW50LmtleUNvZGUgIT09IDkpIHJldHVybjtcblxuXHRcdC8vIHByZXZlbnQgZGVmYXVsdCBzbyB3ZSBkb24ndCBleGl0IHRoZSBmaWVsZFxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHQvLyBmaWd1cmUgb3V0IHRoZSB0ZXh0IHJhbmdlXG5cdFx0dmFyIGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG5cdFx0dmFyIHRleHQgPSBlbGVtZW50LnZhbHVlO1xuXHRcdHZhciBzdGFydCA9IGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7XG5cdFx0dmFyIGVuZCA9IGVsZW1lbnQuc2VsZWN0aW9uRW5kO1xuXG5cdFx0Ly8gUmVwbGFjZW1lbnQgdGV4dFxuXHRcdGxldCBuZXdUZXh0ID0gXCJcIiwgc2VsZWN0aW9uU3RhcnQgPSBzdGFydCwgc2VsZWN0aW9uRW5kID0gZW5kO1xuXG5cdFx0Ly8gSWYgc2VsZWN0aW9uIGlzIGVtcHR5LFxuXHRcdGlmIChzdGFydCA9PT0gZW5kICYmICFldmVudC5zaGlmdEtleSkge1xuXHRcdFx0bmV3VGV4dCA9IFwiXFx0XCI7XG5cdFx0XHRzZWxlY3Rpb25TdGFydCA9IHNlbGVjdGlvbkVuZCA9IGVuZCArIDE7XG5cdFx0fVxuXHRcdC8vIG90aGVyd2lzZSBpbmRlbnQvZGUtaW5kZW50IGFsbCBvZiB0aGUgbGluZXNcblx0XHRlbHNlIHtcblx0XHQvLyB1c2Ugc3RhcnQgYW5kIGVuZCBvZiBsaW5lKHMpXG4vL2NvbnNvbGUuaW5mbyhgc3RhcnQ6ICR7c3RhcnR9IDoke3RleHRbc3RhcnRdfTogICBlbmQ6ICR7ZW5kfSA6ICR7dGV4dFtlbmRdfTpgKTtcblx0XHRcdGlmICh0ZXh0W3N0YXJ0XSAhPT0gXCJcXG5cIikgc3RhcnQgPSB0ZXh0Lmxhc3RJbmRleE9mKFwiXFxuXCIsIHN0YXJ0KSArIDE7XG5cdFx0XHRpZiAodGV4dFtlbmQtMV0gPT09IFwiXFxuXCIpIGVuZC0tO1xuXHRcdFx0ZWxzZSBpZiAodGV4dFtlbmQrMV0gIT09IFwiXFxuXCIpIGVuZCA9IHRleHQuaW5kZXhPZihcIlxcblwiLCBlbmQpIC0gMTtcbi8vY29uc29sZS5pbmZvKGBzdGFydDogJHtzdGFydH0gOiR7dGV4dFtzdGFydF19OiAgIGVuZDogJHtlbmR9IDogJHt0ZXh0W2VuZF19OmApO1xuXG5cdFx0XHRsZXQgbGluZXMgPSB0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpLnNwbGl0KFwiXFxuXCIpO1xuXHRcdFx0Ly8gaWYgc2hpZnQga2V5IGlzIGRvd24sIFJFTU9WRSBhIHRhYiBmcm9tIGVhY2ggbGluZVxuXHRcdFx0aWYgKGV2ZW50LnNoaWZ0S2V5KSB7XG5cdFx0XHRcdGxpbmVzID0gbGluZXMubWFwKGxpbmUgPT4gbGluZVswXSA9PT0gXCJcXHRcIiA/IGxpbmUuc3Vic3RyKDEpIDogbGluZSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBvdGhlcndpc2UgQUREIGEgdGFiIHRvIGVhY2ggbGluZVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGxpbmVzID0gbGluZXMubWFwKGxpbmUgPT4gXCJcXHRcIiArIGxpbmUpO1xuXHRcdFx0fVxuXHRcdFx0c2VsZWN0aW9uU3RhcnQgPSBzdGFydDtcblx0XHRcdG5ld1RleHQgPSBsaW5lcy5qb2luKFwiXFxuXCIpO1xuXHRcdFx0c2VsZWN0aW9uRW5kID0gc2VsZWN0aW9uU3RhcnQgKyBuZXdUZXh0Lmxlbmd0aCArIDE7XG5cdFx0fVxuXG5cdFx0Ly8gVXBkYXRlIGlucHV0IHZhbHVlLlxuXHRcdGVsZW1lbnQudmFsdWUgXHQ9IHRleHQuc3Vic3RyKDAsIHN0YXJ0KVxuXHRcdFx0XHRcdFx0KyBuZXdUZXh0XG5cdFx0XHRcdFx0XHQrIHRleHQuc3Vic3RyKGVuZCk7XG5cblx0XHQvLyBVcGRhdGUgdGhlIHNlbGVjdGlvblxuXHRcdGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPSBzZWxlY3Rpb25TdGFydDtcblx0XHRlbGVtZW50LnNlbGVjdGlvbkVuZCA9IHNlbGVjdGlvbkVuZDtcblxuXHRcdC8vIERlbGVnYXRlIHRvIGBwcm9wcy5vbkNoYW5nZWAgdG8gc2F2ZSB0aGUgdmFsdWUgb3V0c2lkZSBvZiB0aGUgY29udHJvbFxuXHRcdGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB0aGlzLnByb3BzLm9uQ2hhbmdlKGV2ZW50KTtcblx0fVxuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL1RhYmJhYmxlVGV4dEFyZWEuanN4IiwiLy8gQ29tbW9uIGltcG9ydHNcbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuXG4vLyBQYXJzZXJcbmltcG9ydCBwYXJzZXIgZnJvbSBcIi4uL3J1bGVzL3NwZWxsL2luZGV4LmpzXCI7XG5cbi8vIEFwcC1zcGVjaWZpYyBpbXBvcnRzXG5pbXBvcnQgU3BlbGxFZGl0b3IgZnJvbSBcIi4vU3BlbGxFZGl0b3IuanN4XCI7XG5cbi8vIEtpY2sgb2ZmIG91ciB0b3AtbGV2ZWwgZWxlbWVudFxuUmVhY3RET00ucmVuZGVyKFxuICA8U3BlbGxFZGl0b3IgLz4sXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdC1yb290Jylcbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL2luZGV4LmpzeCIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gIFJlYWN0IFV0aWxpdHkgZnVuY3Rpb25zXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gYGNsYXNzTmFtZXNgLCBjb25jZXB0IHN0b2xlbiBmcm9tOiAgaHR0cDovL2plZHdhdHNvbi5naXRodWIuaW8vY2xhc3NuYW1lc1xuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzTmFtZXMgKC4uLmFyZ3MpIHtcbiAgcmV0dXJuIGFyZ3MubWFwKCBhcmcgPT4ge1xuICAgIGlmICghYXJnKSByZXR1cm4gXCJcIjtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSByZXR1cm4gY2xhc3NOYW1lcyguLi5hcmcpO1xuICAgIHN3aXRjaCAodHlwZW9mIGFyZykge1xuICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgY2FzZSBcInN0cmluZ1wiOiAgcmV0dXJuIGFyZztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhhcmcpLm1hcCgga2V5ID0+IGFyZ1trZXldID8ga2V5IDogXCJcIilcbiAgICAgICAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICAgICAgICAgICAgLmpvaW4oXCIgXCIpO1xuICAgIH1cbiAgfSkuZmlsdGVyKEJvb2xlYW4pXG4gICAgLmpvaW4oXCIgXCIpO1xufVxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL3V0aWwuanMiLCIvLyBNZW1vaXplL2ZvcmdldCBzZW1hbnRpY3MuXG5cbi8vIFJldHVybiBhIG1lbW9pemluZyBnZXR0ZXIgZnVuY3Rpb24uXG4vLyBURVNUTUVcbmV4cG9ydCBmdW5jdGlvbiBtZW1vaXplZChwcm9wZXJ0eSwgZ2V0dGVyKSB7XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRpZiAodGhpc1twcm9wZXJ0eV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dmFyIHZhbHVlID0gZ2V0dGVyLmFwcGx5KHRoaXMpO1xuXHRcdFx0aWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Ly8gRGVmaW5lIHNvIHRoYXQgd2UgY2FuIGJlIGRlbGV0ZWQgYW5kIHJlLWRlZmluZWQsIGJ1dCBub3Qgc2V0IG9yIGVudW1lcmF0ZWQuXG5cdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBwcm9wZXJ0eSwgeyB2YWx1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdGhpc1twcm9wZXJ0eV07XG5cdH1cbn1cblxuXG4vLyBSZXR1cm4gYSBtZW1vaXplIGZ1bmN0aW9uIGZvciB1c2UgYXMgYSBnZXR0ZXIgaW4gYSBgT2JqZWN0LmRlZmluZVByb3BlcnR5KClgXG4vLyBURVNUTUVcbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVNZW1vaXplZChwcm9wZXJ0eSwgZ2V0dGVyKSB7XG5cdHJldHVybiB7XG5cdFx0Z2V0IDogbWVtb2l6ZWQocHJvcGVydHksIGdldHRlcilcblx0fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21lbW9pemUuanMiLCIvL1xuLy9cdCMgUnVsZXMgcGFyc2luZyBqc3hcbi8vXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBUb2tlbml6ZXIgZnJvbSBcIi4uLy4uL1Rva2VuaXplclwiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVcIjtcblxuLy8gQ3JlYXRlIFwiSlNYXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck1vZHVsZShcIkpTWFwiKTtcbmV4cG9ydCBkZWZhdWx0IHBhcnNlcjtcblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICB7XG4gICAgbmFtZTogXCJqc3hcIixcbiAgICBhbGlhczogWyBcImV4cHJlc3Npb25cIiwgXCJzdGF0ZW1lbnRcIiBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBqc3hFbGVtZW50IGV4dGVuZHMgUnVsZSB7XG4gICAgICAvLyBUZXh0IHN0cmluZ3MgZ2V0IGVuY29kZWQgYXMgYHRleHRgIG9iamVjdHMgaW4gdGhlIHRva2VuIHN0cmVhbS5cbiAgICAgIHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGgpIHtcbiAgICAgICAgbGV0IHRva2VuID0gdG9rZW5zW3N0YXJ0XTtcbiAgICAgICAgaWYgKCEodG9rZW4gaW5zdGFuY2VvZiBUb2tlbml6ZXIuSlNYRWxlbWVudCkpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiB0aGlzLmNsb25lKHtcbiAgICAgICAgICBtYXRjaGVkOiB0b2tlbixcbiAgICAgICAgICBuZXh0U3RhcnQ6IHN0YXJ0ICsgMVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udmVydCBvdXIgYXR0cmlidXRlcyB0byBzb3VyY2UuXG4gICAgICAvLyBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIG5vIGF0dHJpYnV0ZXMuXG4gICAgICBhdHRyc1RvU291cmNlKGpzeEVsZW1lbnQgPSB0aGlzLm1hdGNoZWQpIHtcbiAgICAgICAgbGV0IGF0dHJpYnV0ZXMgPSBqc3hFbGVtZW50LmF0dHJpYnV0ZXM7XG4gICAgICAgIGlmICghYXR0cmlidXRlcyB8fCAhYXR0cmlidXRlcy5sZW5ndGgpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICAgICAgbGV0IGF0dHJzID0gYXR0cmlidXRlcy5tYXAoICh7IG5hbWUsIHZhbHVlIH0pID0+IHtcbiAgICAgICAgICAvLyBpZiBOTyB2YWx1ZSwgYXNzdW1lIGl0J3MgYSB2YXJpYWJsZSBvZiB0aGUgc2FtZSBuYW1lXG4gICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHZhbHVlID0gbmFtZTtcbiAgICAgICAgICAvLyBpZiBpdCdzIGFuIGFycmF5LCBpdCdzIGEgc3BlbGwgZXhwcmVzc2lvbiwgcG9zc2libHkgd2l0aCBuZXN0ZWQgSlNYIGVsZW1lbnRzLi4uXG4gICAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBUb2tlbml6ZXIuSlNYRXhwcmVzc2lvbikge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmpzeEV4cHJlc3Npb25Ub1NvdXJjZSh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGVsc2UgaWYgYSBKU1ggZWxlbWVudCwgcmVjdXJzZVxuICAgIC8vVE9ETzogaW5kZW50Li4uXG4gICAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBUb2tlbml6ZXIuSlNYRWxlbWVudCkge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1NvdXJjZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBPdGhlcndpc2UgaWYgYSBudW1iZXIgb3IgVGV4dCBsaXRlcmFsLCBqdXN0IHVzZSBpdFxuXG4gICAgICAgICAgLy8gc3BlY2lhbCBjYXNlIGBjbGFzc2AgdG8gYGNsYXNzTmFtZWAgYmVjYXVzZSBSZWFjdCBpcyBlZmZpbmcgcGVyc25pY2tldHkuXG4gICAgICAgICAgaWYgKG5hbWUgPT09IFwiY2xhc3NcIikgbmFtZSA9IFwiY2xhc3NOYW1lXCI7XG4gICAgLy9UT0RPOiBlc2NhcGUgbmFtZXMgd2hpY2ggYXJlIGludmFsaWQgSlMgaWRlbnRpZmllcnNcbiAgICAgICAgICByZXR1cm4gYCR7bmFtZX06ICR7dmFsdWV9YDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGB7ICR7YXR0cnMuam9pbihcIiwgXCIpfSB9YDtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIGFuIGFycmF5IHdpdGggc291cmNlIGZvciBlYWNoIG9mIG91ciBjaGlsZHJlbi5cbiAgICAgIC8vIFJldHVybnMgYHVuZGVmaW5lZGAgaWYgd2UgZG9uJ3QgaGF2ZSBhbnkgY2hpbGRyZW4uXG4gICAgICBjaGlsZHJlblRvU291cmNlKGpzeEVsZW1lbnQgPSB0aGlzLm1hdGNoZWQpIHtcbiAgICAgICAgbGV0IGNoaWxkcmVuID0ganN4RWxlbWVudC5jaGlsZHJlbjtcbiAgICAgICAgaWYgKCFjaGlsZHJlbiB8fCBjaGlsZHJlbi5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBjaGlsZHJlbi5tYXAoY2hpbGQgPT4ge1xuICAgIC8vVE9ETzogZXNjYXBlIGlubmVyIHF1b3Rlcy4uLlxuICAgICAgICAgIGlmICh0eXBlb2YgY2hpbGQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIC8vZm9yZ2V0IGl0IGlmIHdoaXRlc3BhY2Ugb25seS4uLiA/Pz9cbiAgICAgICAgICAgIGxldCB0ZXh0ID0gY2hpbGQudHJpbSgpO1xuICAgICAgICAgICAgaWYgKCF0ZXh0KSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmV0dXJuIGBcIiR7dGV4dH1cImA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIFRva2VuaXplci5KU1hFbGVtZW50KSB7XG4gICAgICAgICAgICBsZXQgY2hpbGRTb3VyY2UgPSB0aGlzLmpzeEVsZW1lbnRUb1NvdXJjZShjaGlsZCk7XG4gICAgICAgICAgICByZXR1cm4gY2hpbGRTb3VyY2Uuc3BsaXQoXCJcXG5cIikuam9pbihcIlxcblxcdFwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmpzeEV4cHJlc3Npb25Ub1NvdXJjZShjaGlsZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcImNoaWxkcmVuVG9Tb3VyY2UoKTogZG9uJ3QgdW5kZXJzdGFuZCBjaGlsZFwiICsgIGNoaWxkKTtcbiAgICAgICAgfSlcbiAgICAgICAgLy8gcmVtb3ZlIHVuZGVmaW5lZC9lbXB0eSBzdHJpbmcgcnVsZXNcbiAgICAgICAgLmZpbHRlcihCb29sZWFuKTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udmVydCBKU1ggZXhwcmVzc2lvbiAoIGB7Li4ufWAgKSB0byBKUyBzb3VyY2UuXG4gICAgICBqc3hFeHByZXNzaW9uVG9Tb3VyY2UoanN4RXhwcmVzc2lvbikge1xuICAgICAgICBsZXQgdG9rZW5zID0ganN4RXhwcmVzc2lvbi50b2tlbnM7XG4gICAgY29uc29sZS5pbmZvKGpzeEV4cHJlc3Npb24sIHRva2Vucyk7XG4gICAgICAgIHJldHVybiBcIi9cIiArIGAqVE9ETzogJHt0b2tlbnMuam9pbihcIiBcIil9KmAgKyBcIi9cIjtcbiAgICAgIH1cblxuICAgICAganN4RWxlbWVudFRvU291cmNlKGpzeEVsZW1lbnQgPSB0aGlzLm1hdGNoZWQpIHtcbiAgICAgICAgLy8gZ2V0IHRoZSBiaXRzIG9mIHRoZSBvdXRwdXRcbiAgICAgICAgbGV0IHRhZ05hbWUgPSBgXCIke2pzeEVsZW1lbnQudGFnTmFtZX1cImA7XG4gICAgICAgIGxldCBhdHRycyA9IHRoaXMuYXR0cnNUb1NvdXJjZShqc3hFbGVtZW50KTtcbiAgICAgICAgbGV0IGNoaWxkcmVuID0gdGhpcy5jaGlsZHJlblRvU291cmNlKGpzeEVsZW1lbnQpO1xuXG4gICAgICAgIGxldCBvdXRwdXQgPSBgY3JlYXRlRWxlbWVudCgke3RhZ05hbWV9YDtcbiAgICAgICAgaWYgKCFhdHRycyAmJiBjaGlsZHJlbikgYXR0cnMgPSBcIm51bGxcIjtcblxuICAgICAgICBpZiAoYXR0cnMpIG91dHB1dCArPSBgLCAke2F0dHJzfWA7XG4gICAgICAgIGlmIChjaGlsZHJlbikge1xuICAgICAgICAgIG91dHB1dCArPSBcIixcXG5cXHRcIiArIGNoaWxkcmVuLmpvaW4oXCIsXFxuXFx0XCIpICsgXCJcXG5cIjtcbiAgICAgICAgfVxuICAgICAgICBvdXRwdXQgKz0gXCIpXCJcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmpzeEVsZW1lbnRUb1NvdXJjZSh0aGlzLm1hdGNoZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ydWxlcy9zcGVsbC9KU1guanMiLCIvL1xuLy9cdCMgUnVsZXMgZm9yIGlmIHN0YXRlbWVudHMuXG4vL1xuXG5pbXBvcnQgUGFyc2VyLCB7IFBhcnNlRXJyb3IgfSBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG4vLyBDcmVhdGUgXCJpZlwiIHBhcnNlci5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JNb2R1bGUoXCJpZlwiKTtcbmV4cG9ydCBkZWZhdWx0IHBhcnNlcjtcblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICB7XG4gICAgbmFtZTogXCJpZlwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJpZiB7Y29uZGl0aW9uOmV4cHJlc3Npb259ICh0aGVufDopPyB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaWZfIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgY29uZGl0aW9uLCBzdGF0ZW1lbnRzIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgaWYgKCR7Y29uZGl0aW9ufSkgJHtzdGF0ZW1lbnRzfWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBzaW5nbGUtbGluZSBpZiBzdGF0ZW1lbnRzXCIsXG4gICAgICAgIGNvbXBpbGVBczogXCJzdGF0ZW1lbnRcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJpZiBhXCIsIFwiaWYgKGEpIHt9XCJdLFxuICAgICAgICAgIFtcImlmIGEgdGhlblwiLCBcImlmIChhKSB7fVwiXSxcbiAgICAgICAgICBbXCJpZiBhOlwiLCBcImlmIChhKSB7fVwiXSxcbiAgICAgICAgICBbXCJpZiBhIHRoZW4gYiA9IDFcIiwgXCJpZiAoYSkgeyBiID0gMSB9XCJdLFxuICAgICAgICAgIFtcImlmIGE6IGIgPSAxXCIsIFwiaWYgKGEpIHsgYiA9IDEgfVwiXSxcbiAgICAgICAgICBbXCJpZiBhIDogYiA9IDFcIiwgXCJpZiAoYSkgeyBiID0gMSB9XCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBtdWx0aS1saW5lIGlmIGJsb2Nrc1wiLFxuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50c1wiLFxuICAgICAgICB0ZXN0czoge1xuICAgICAgICAgIFwiU2VwYXJhdGUgYmxvY2tzIGlmIG5vIGluZGVudGF0aW9uIG9uIHNlY29uZCBsaW5lLlwiOlxuICAgICAgICAgICAgICBbXCJpZiBhOlxcbmIgPSAxXCIsIFwiaWYgKGEpIHt9XFxuYiA9IDFcIl0sXG4gICAgICAgICAgXCJJbmRlbnQgd2l0aCB0YWJcIjpcbiAgICAgICAgICAgICAgW1wiaWYgYTpcXG5cXHRiID0gMVwiLCBcImlmIChhKSB7XFxuXFx0YiA9IDFcXG59XCJdLFxuICAgICAgICAgIFwiQU5ZIG51bWJlciBvZiBzcGFjZXMgc2hvdWxkIGNvdW50IGFzIGluZGVudGF0aW9uXCI6XG4gICAgICAgICAgICAgIFtcImlmIGE6XFxuIGIgPSAxXCIsIFwiaWYgKGEpIHtcXG5cXHRiID0gMVxcbn1cIl0sXG4gICAgICAgICAgXCJNdWx0aXBsZSBsaW5lcyBpbiB0aGUgbmVzdGVkIGJsb2NrXCI6XG4gICAgICAgICAgICAgIFtcImlmIGE6XFxuXFx0YiA9IDFcXG5cXHRjID0gMlwiLCBcImlmIChhKSB7XFxuXFx0YiA9IDFcXG5cXHRjID0gMlxcbn1cIl0sXG4gICAgICAgICAgXCJOZXN0ZWQgaWZzIHdvcmsgZmluZVwiOlxuICAgICAgICAgICAgICBbXCJpZiBhXFxuXFx0aWYgYlxcblxcdFxcdGM9MlwiLCBcImlmIChhKSB7XFxuXFx0aWYgKGIpIHtcXG5cXHRcXHRjID0gMlxcblxcdH1cXG59XCJdLFxuICAgICAgICAgIFwiUHJlZmVyIG5lc3RlZCBibG9jayB0byBpbmxpbmVkIHN0YXRlbWVudFwiOlxuICAgICAgICAgICAgICBbXCJpZiBhIGIgPSAxXFxuXFx0YyA9IDJcIiwgXCJpZiAoYSkge1xcblxcdGMgPSAyXFxufVwiXSxcbiAgICAgICAgfVxuICAgICAgfSxcbi8vVEVTVE1FOiB0ZXN0IGZ1bGwgaWYvZWxzZSBpZi9lbHNlIGJsb2Nrc1xuICAgIF1cbiAgfSxcblxuICB7XG4gICAgLy8gTk9URTogdGhpcyBNVVNUIGJlIGJlZm9yZSBgZWxzZWAgb3IgdGhhdCB3aWxsIGVhdCBgZWxzZSBpZmAgc3RhdGVtZW50cy4uLiA6LShcbiAgICBuYW1lOiBcImVsc2VfaWZcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiKGVsc2V8b3RoZXJ3aXNlKSBpZiB7Y29uZGl0aW9uOmV4cHJlc3Npb259ICh0aGVufDopIHtzdGF0ZW1lbnR9P1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBlbHNlX2lmIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgY29uZGl0aW9uLCBzdGF0ZW1lbnRzIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgZWxzZSBpZiAoJHtjb25kaXRpb259KSAke3N0YXRlbWVudHN9YFxuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgc2luZ2xlLWxpbmUgZWxzZV9pZiBzdGF0ZW1lbnRzXCIsXG4gICAgICAgIGNvbXBpbGVBczogXCJzdGF0ZW1lbnRcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJlbHNlIGlmIGEgdGhlblwiLCBcImVsc2UgaWYgKGEpIHt9XCJdLFxuICAgICAgICAgIFtcImVsc2UgaWYgYSB0aGVuIGIgPSAxXCIsIFwiZWxzZSBpZiAoYSkgeyBiID0gMSB9XCJdLFxuICAgICAgICAgIFtcImVsc2UgaWYgYTogYiA9IDFcIiwgXCJlbHNlIGlmIChhKSB7IGIgPSAxIH1cIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIG11bHRpLWxpbmUgZWxzZV9pZiBibG9ja3NcIixcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudHNcIixcbiAgICAgICAgdGVzdHM6IHtcbiAgICAgICAgICBcIlNlcGFyYXRlIGJsb2NrcyBpZiBubyBpbmRlbnRhdGlvbiBvbiBzZWNvbmQgbGluZS5cIjpcbiAgICAgICAgICAgICAgW1wiZWxzZSBpZiBhOlxcbmIgPSAxXCIsIFwiZWxzZSBpZiAoYSkge31cXG5iID0gMVwiXSxcbiAgICAgICAgICBcIkluZGVudCB3aXRoIHRhYlwiOlxuICAgICAgICAgICAgICBbXCJlbHNlIGlmIGE6XFxuXFx0YiA9IDFcIiwgXCJlbHNlIGlmIChhKSB7XFxuXFx0YiA9IDFcXG59XCJdLFxuICAgICAgICAgIFwiQU5ZIG51bWJlciBvZiBzcGFjZXMgc2hvdWxkIGNvdW50IGFzIGluZGVudGF0aW9uXCI6XG4gICAgICAgICAgICAgIFtcImVsc2UgaWYgYTpcXG4gYiA9IDFcIiwgXCJlbHNlIGlmIChhKSB7XFxuXFx0YiA9IDFcXG59XCJdLFxuICAgICAgICAgIFwiTXVsdGlwbGUgbGluZXMgaW4gdGhlIG5lc3RlZCBibG9ja1wiOlxuICAgICAgICAgICAgICBbXCJlbHNlIGlmIGE6XFxuXFx0YiA9IDFcXG5cXHRjID0gMlwiLCBcImVsc2UgaWYgKGEpIHtcXG5cXHRiID0gMVxcblxcdGMgPSAyXFxufVwiXSxcbi8vRklYTUUgICAgICAgICAgXCJOZXN0ZWQgaWZzIHdvcmsgZmluZVwiOlxuLy8gICAgICAgICAgICBbXCJlbHNlIGlmIGFcXG5cXHRpZiBiXFxuXFx0XFx0Yz0yXCIsIFwiZWxzZSBpZiAoYSkge1xcblxcdGlmIChiKSB7XFxuXFx0XFx0YyA9IDJcXG5cXHR9XFxufVwiXSxcbi8vRklYTUUgICAgICAgICAgXCJQcmVmZXIgbmVzdGVkIGJsb2NrIHRvIGlubGluZWQgc3RhdGVtZW50XCI6XG4vLyAgICAgICAgICAgIFtcImVsc2UgaWYgYSBiID0gMVxcblxcdGMgPSAyXCIsIFwiZWxzZSBpZiAoYSkge1xcblxcdGMgPSAyXFxufVwiXSxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiZWxzZVwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCIoZWxzZXxvdGhlcndpc2UpICg6KT8ge3N0YXRlbWVudH0/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGVsc2VfIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgc3RhdGVtZW50cyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYGVsc2UgJHtzdGF0ZW1lbnRzfWBcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIHNpbmdsZS1saW5lIGVsc2Ugc3RhdGVtZW50c1wiLFxuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiZWxzZVwiLCBcImVsc2Uge31cIl0sXG4gICAgICAgICAgW1wib3RoZXJ3aXNlXCIsIFwiZWxzZSB7fVwiXSxcbiAgICAgICAgICBbXCJlbHNlIGIgPSAxXCIsIFwiZWxzZSB7IGIgPSAxIH1cIl0sXG4gICAgICAgICAgW1wib3RoZXJ3aXNlIGIgPSAxXCIsIFwiZWxzZSB7IGIgPSAxIH1cIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIG11bHRpLWxpbmUgZWxzZSBibG9ja3NcIixcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudHNcIixcbiAgICAgICAgdGVzdHM6IHtcbiAgICAgICAgICBcIlNlcGFyYXRlIGJsb2NrcyBpZiBubyBpbmRlbnRhdGlvbiBvbiBzZWNvbmQgbGluZS5cIjpcbiAgICAgICAgICAgICAgW1wiZWxzZVxcbmIgPSAxXCIsIFwiZWxzZSB7fVxcbmIgPSAxXCJdLFxuICAgICAgICAgIFwiSW5kZW50IHdpdGggdGFiXCI6XG4gICAgICAgICAgICAgIFtcImVsc2VcXG5cXHRiID0gMVwiLCBcImVsc2Uge1xcblxcdGIgPSAxXFxufVwiXSxcbiAgICAgICAgICBcIkFOWSBudW1iZXIgb2Ygc3BhY2VzIHNob3VsZCBjb3VudCBhcyBpbmRlbnRhdGlvblwiOlxuICAgICAgICAgICAgICBbXCJlbHNlXFxuIGIgPSAxXCIsIFwiZWxzZSB7XFxuXFx0YiA9IDFcXG59XCJdLFxuICAgICAgICAgIFwiTXVsdGlwbGUgbGluZXMgaW4gdGhlIG5lc3RlZCBibG9ja1wiOlxuICAgICAgICAgICAgICBbXCJlbHNlXFxuXFx0YiA9IDFcXG5cXHRjID0gMlwiLCBcImVsc2Uge1xcblxcdGIgPSAxXFxuXFx0YyA9IDJcXG59XCJdLFxuICAgICAgICB9XG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICAvLyBOT1RFOiB0aGlzIGlzIE5PVCBhIGJsb2NrU3RhdGVtZW50IVxuICB7XG4gICAgbmFtZTogXCJiYWNrd2FyZHNfaWZcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwie3N0YXRlbWVudH0gaWYge2NvbmRpdGlvbjpleHByZXNzaW9ufSAoPzooZWxzZXxvdGhlcndpc2UpIHtlbHNlU3RhdGVtZW50OnN0YXRlbWVudH0pP1wiLFxuICAgIGxlZnRSZWN1cnNpdmU6IHRydWUsXG4gICAgdGVzdFJ1bGU6IG5ldyBSdWxlLktleXdvcmRzKHsgbGl0ZXJhbHM6IFsgXCJpZlwiIF0gfSksXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGJhY2t3YXJkc19pZiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGNvbmRpdGlvbiwgc3RhdGVtZW50LCBlbHNlU3RhdGVtZW50IH0gPSB0aGlzLnJlc3VsdHM7XG4vL1RPRE86IHNtYXJ0ZXIgd3JhcHBpbmc/XG4gICAgICAgIGxldCBvdXRwdXQgPSBgaWYgKCR7Y29uZGl0aW9ufSkgeyAke3N0YXRlbWVudH0gfWA7XG4gICAgICAgIGlmIChlbHNlU3RhdGVtZW50KSBvdXRwdXQgKz0gYFxcbmVsc2UgeyAke2Vsc2VTdGF0ZW1lbnR9IH1gXG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBzaW5nbGUtbGluZSBiYWNrd2FyZHNfaWYgc3RhdGVtZW50c1wiLFxuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYiA9IDEgaWYgYVwiLCBcImlmIChhKSB7IGIgPSAxIH1cIl0sXG4gICAgICAgICAgW1wiYiA9IDEgaWYgYSBlbHNlIGIgPSAyXCIsIFwiaWYgKGEpIHsgYiA9IDEgfVxcbmVsc2UgeyBiID0gMiB9XCJdLFxuICAgICAgICAgIFtcImIgPSAxIGlmIGEgb3RoZXJ3aXNlIGIgPSAyXCIsIFwiaWYgKGEpIHsgYiA9IDEgfVxcbmVsc2UgeyBiID0gMiB9XCJdLFxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICB9LFxuKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ydWxlcy9zcGVsbC9pZi5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgZGVhbGluZyB3aXRoIGxpc3RzXG4vL1xuXG4vLyBUT0RPOiBjb25maXJtIGlkZW50aWZpZXJzIGFyZSBwbHVyYWwgaW4gc29tZSBvZiB0aGUgYmVsb3c/XG4vLyBUT0RPOiBgbGlzdC5jbG9uZSgpYCB0byByZXR1cm4gbmV3IGxpc3Qgb2Ygc2FtZSB0eXBlLlxuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5cbmltcG9ydCB7IGlzUGx1cmFsLCBzaW5ndWxhcml6ZSB9IGZyb20gXCIuLi8uLi91dGlscy9zdHJpbmdcIjtcblxuLy8gQ3JlYXRlIFwibGlzdHNcIiBwYXJzZXIuXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTW9kdWxlKFwibGlzdHNcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cblxuLy8gV09SS0lORyBGUk9NIE9USEVSIFJVTEVTICh0ZXN0bWUpXG4vL1x0YHRoZSBsZW5ndGggb2YgPGxpc3Q+YFxuLy9cdGA8dGhpbmc+IGlzIG5vdD8gaW4gPGxpc3Q+YFxuLy9cdGA8bGlzdD4gaXMgbm90PyBlbXB0eWBcbi8vXHRgc2V0IGl0ZW0gMSBvZiBteUxpc3QgdG8gJ2EnYFxuXG5cbi8vIFRPRE86IFx0YGNyZWF0ZSBsaXN0IHdpdGggPGV4cD4sIDxleHA+LCA8ZXhwPmBcbi8vIFRPRE86XHRgZHVwbGljYXRlIGxpc3RgXG4vLyBUT0RPOlx0YGR1cGxpY2F0ZSBsaXN0IHdpdGggPGV4cD4sIDxleHA+LCA8ZXhwPmAgPz8/XG4vLyBUT0RPOlx0YHRoZSBzaXplIG9mIDxsaXN0PmAgPT4gd2lsbCBtYXAgdG8gYGxpc3Quc2l6ZWAuLi5cbi8vXHRcdFx0XHQtIGluc3RhbGwgYHNpemVgIGFzIGFuIGFsaWFzIHRvIGBsZW5ndGhgP1xuLy8gVE9ETzpcdGBtb3ZlIDx0aGluZz4gdG8gZW5kIG9mIDxsaXN0PmAgPz8/XG4vLyBUT0RPOlx0YFNldGAgZm9yIGEgdW5pcXVlIGxpc3Q/XG4vLyBUT0RPOlx0dHlwZWQgbGlzdD9cbi8vIFRPRE86XHRsaXN0IHdoaWNoIHdvbid0IHRha2UgbnVsbC91bmRlZmluZWRcblxuXG5wYXJzZXIuZGVmaW5lUnVsZXMoXG4gIC8vIFJldHVybiB0aGUgbGVuZ3RoIG9mIHRoZSBsaXN0LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2xlbmd0aFwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwidGhlPyBudW1iZXIgb2Yge2lkZW50aWZpZXJ9IGluIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfbGVuZ3RoIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCwgaWRlbnRpZmllciB9ID0gdGhpcy5yZXN1bHRzO1xuICAvLyBUT0RPOiBzcGVjaWFsIGNhc2UgJ3dvcmRzJywgJ2xpbmVzJywgZXRjXG4gICAgICAgIHJldHVybiBgJHtsaXN0fS5sZW5ndGhgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBSZXR1cm4gdGhlIGZpcnN0IHBvc2l0aW9uIG9mIHNwZWNpZmllZCBpdGVtIGluIHRoZSBsaXN0IGFzIGFuIGFycmF5LlxuICAvLyBJZiBpdGVtIGlzIG5vdCBmb3VuZCwgcmV0dXJucyBgdW5kZWZpbmVkYC5cbiAgLy8gTk9URTogdGhpcyBwb3NpdGlvbiByZXR1cm5lZCBpcyAqKjEtYmFzZWQqKi5cbiAgLy9URVNUTUVcbiAgLy8gVE9ETzogYHBvc2l0aW9uc2AsIGBsYXN0IHBvc2l0aW9uYCwgYGFmdGVyLi4uYFxuICB7XG4gICAgbmFtZTogXCJsaXN0X3Bvc2l0aW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ0aGU/IHBvc2l0aW9uIG9mIHt0aGluZzpleHByZXNzaW9ufSBpbiB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3Bvc2l0aW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5wb3NpdGlvbk9mKCR7dGhpbmd9LCAke2xpc3R9KWBcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy9cbiAgLy9cdE9yZGluYWwgbnVtYmVycyAoZmlyc3QsIHNlY29uZCwgbGFzdCwgZXRjKS5cbiAgLy8gVE9ETzogc2l4dHktZmlmdGgsIHR3byBodW5kcmVkIGZvcnR5IG5pbnRoLi4uXG4gIC8vXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiZmlyc3RcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDEgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInNlY29uZFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gMiB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwidGhpcmRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDMgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImZvdXJ0aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gNCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiZmlmdGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDUgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInNpeHRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiA2IH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJzZXZlbnRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiA3IH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJlaWdodGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDggfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcIm5pbnRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiA5IH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJ0ZW50aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gMTAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInBlbnVsdGltYXRlXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAtMiB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiZmluYWxcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIC0xIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJsYXN0XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAtMSB9XG4gICAgfVxuICB9LFxuXG5cblxuICAvLyB0cmVhdCBsaXN0IGFzIGEgc3RhY2sgb3IgcXVldWVcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJ0b3BcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDEgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImJvdHRvbVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gLTEgfVxuICAgIH1cbiAgfSxcblxuXG5cbiAgLy8gSW5kZXggZXhwcmVzc2lvbjogbnVtZXJpYyBwb3NpdGlvbiBpbiBzb21lIGxpc3QuXG4gIC8vXHRlLmcuXHRgY2FyZCAxIG9mIHRoZSBwaWxlYFxuICAvL1x0XHRcdGBjYXJkICMyIG9mIHRoZSBwaWxlYFxuICAvL1x0XHRcdGB0aGUgZmlyc3QgY2FyZCBvZiB0aGUgcGlsZWBcbiAgLy9cbiAgLy8gTk9URTogTmVnYXRpdmUgbnVtZXJpYyBwb3NpdGlvbnMgY29tZSBmcm9tIHRoZSBFTkQgb2YgdGhlIGxpc3QuXG4gIC8vXHRlLmcuXHRgY2FyZCAtMSBvZiB0aGUgcGlsZWBcbiAgLy9cbiAgLy8gTk9URTogT3VyIHBvc2l0aW9ucyBhcmUgKioxLWJhc2VkKiogYW5kIEphdmFzY3JpcHQgaXMgKiowLWJhc2VkKiouXG4gIC8vXHRcdCBlLmcuIGBpdGVtIDEgb2YgdGhlIGFycmF5YCAgPSBgYXJyYXlbMF1gXG4gIC8vXG4gIC8vIFRPRE86IGlmIGBpZGVudGlmaWVyYCBpcyBcIndvcmRcIiwgb3V0cHV0IGBnZXRXb3JkKClgIGV0Y1xuICAvLyBUT0RPOiBzcGVjaWFsIGNhc2UgJ3dvcmRzJywgJ2xpbmVzJywgZXRjID9cbiAge1xuICAgIG5hbWU6IFwicG9zaXRpb25fZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFtcbiAgICAgIFwie2lkZW50aWZpZXJ9IHtwb3NpdGlvbjpleHByZXNzaW9ufSBvZiAodGhlPykge2V4cHJlc3Npb259XCIsXG4gICAgICBcInRoZSB7cG9zaXRpb246b3JkaW5hbH0ge2lkZW50aWZpZXJ9IG9mICh0aGU/KSB7ZXhwcmVzc2lvbn1cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHBvc2l0aW9uX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNle1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGlkZW50aWZpZXIsIHBvc2l0aW9uLCBleHByZXNzaW9uIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIC8vIElmIHdlIGdvdCBhIHBvc2l0aXZlIG51bWJlciBsaXRlcmFsLCBjb21wZW5zYXRlIGZvciBKUyAwLWJhc2VkIGFycmF5cyBub3csIGZvciBuaWNlciBvdXRwdXQuXG4gICAgICAgIGlmICh0eXBlb2YgcG9zaXRpb24gPT09IFwibnVtYmVyXCIgJiYgcG9zaXRpb24gPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIGAke2V4cHJlc3Npb259WyR7cG9zaXRpb24gLSAxfV1gO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0SXRlbSgke2V4cHJlc3Npb259LCAke3Bvc2l0aW9ufSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFBpY2sgYSBTSU5HTEUgcmFuZG9tIGl0ZW0gZnJvbSB0aGUgbGlzdC5cbiAgLy8gVE9ETzogY29uZmlybSBpZGVudGlmaWVyIGlzIHBsdXJhbD9cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmFuZG9tX3Bvc2l0aW9uX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcImEgcmFuZG9tIHtpZGVudGlmaWVyfSAob2Z8ZnJvbXxpbikgKHRoZSk/IHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJhbmRvbV9wb3NpdGlvbl9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldFJhbmRvbUl0ZW1PZigke2xpc3R9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFBpY2sgYSB1bmlxdWUgc2V0IG9mIHJhbmRvbSBpdGVtcyBmcm9tIHRoZSBsaXN0LCByZXR1cm5pbmcgYW4gYXJyYXkuXG4gIC8vIFRPRE86IGB0d28gcmFuZG9tIGl0ZW1zLi4uYFxuICAvLyBUT0RPOiBjb25maXJtIGlkZW50aWZpZXIgaXMgcGx1cmFsP1xuICAvLyBUT0RPOiBgbGlzdC5jbG9uZSgpYCB0byByZXR1cm4gbmV3IGxpc3Qgb2Ygc2FtZSB0eXBlLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJyYW5kb21fcG9zaXRpb25zX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIntudW1iZXJ9IHJhbmRvbSB7aWRlbnRpZmllcn0gKG9mfGZyb218aW4pICh0aGUpPyB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5kb21fcG9zaXRpb25zX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBudW1iZXIsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5kb21JdGVtc09mKCR7bGlzdH0sICR7bnVtYmVyfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFJhbmdlIGV4cHJlc3Npb24uXG4gIC8vIFJldHVybnMgYSBuZXcgbGlzdC5cbiAgLy8gTk9URTogYHN0YXJ0YCBpcyAqKjEtYmFzZWQqKi5cbiAgLy8gTk9URTogYGVuZGAgaXMgaW5jbHVzaXZlIVxuICAvLyBUT0RPOiBjb25maXJtIGlkZW50aWZpZXIgaXMgcGx1cmFsP1xuICAvLyBUT0RPOiBgbGlzdC5jbG9uZSgpYCB0byByZXR1cm4gbmV3IGxpc3Qgb2Ygc2FtZSB0eXBlLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJyYW5nZV9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7aWRlbnRpZmllcn0ge3N0YXJ0OmV4cHJlc3Npb259IHRvIHtlbmQ6ZXhwcmVzc2lvbn0gb2Yge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHN0YXJ0LCBlbmQsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5nZSgke2xpc3R9LCAke3N0YXJ0fSwgJHtlbmR9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFN0YXJ0aW5nIHJhbmdlIGV4cHJlc3Npb24uXG4gIC8vIFJldHVybnMgYSBuZXcgbGlzdC5cbiAgLy8gZS5nLlx0YGZpcnN0IDQgaXRlbXMgb2YgbGlzdGBcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwiZmlyc3RfaW5fcmFuZ2VcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcImZpcnN0IHtudW1iZXI6ZXhwcmVzc2lvbn0ge2lkZW50aWZpZXJ9IChpbnxvZikge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG51bWJlciwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldFJhbmdlKCR7bGlzdH0sIDEsICR7bnVtYmVyfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBFbmRpbmcgcmFuZ2UgZXhwcmVzc2lvbi5cbiAgLy8gUmV0dXJucyBhIG5ldyBsaXN0LlxuICAvLyBlLmcuXHRgbGFzdCA0IGl0ZW1zIG9mIGxpc3RgXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxhc3RfaW5fcmFuZ2VcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcImxhc3Qge251bWJlcjpleHByZXNzaW9ufSB7aWRlbnRpZmllcn0gKGlufG9mKSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5nZV9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbnVtYmVyLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0RW5kUmFuZ2UoJHtsaXN0fSwgMSwgJHtudW1iZXJ9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gUmFuZ2UgZXhwcmVzc2lvbiBzdGFydGluZyBhdCBzb21lIGl0ZW0gaW4gdGhlIGxpc3QuXG4gIC8vIFJldHVybnMgYSBuZXcgbGlzdC5cbiAgLy8gSWYgaXRlbSBpcyBub3QgZm91bmQsIHJldHVybnMgYW4gZW1wdHkgbGlzdC4gKD8/PylcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmFuZ2VfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2lkZW50aWZpZXJ9IChpbnxvZikge2xpc3Q6ZXhwcmVzc2lvbn0gc3RhcnRpbmcgd2l0aCB7dGhpbmc6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0UmFuZ2UoJHtsaXN0fSwgc3BlbGwucG9zaXRpb25PZigke3RoaW5nfSwgJHtsaXN0fSkpYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBMaXN0IGZpbHRlci5cbiAgLy8gTk9URTogd2Ugd2lsbCBzaW5ndWxhcml6ZSBgaWRlbnRpZmllcmAgYW5kIHVzZSB0aGF0IGFzIHRoZSBhcmd1bWVudCB0byBgZXhwcmVzc2lvbmAuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfZmlsdGVyXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7aWRlbnRpZmllcn0gKGlufG9mKSB7bGlzdDpleHByZXNzaW9ufSB3aGVyZSB7Y29uZGl0aW9uOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfZmlsdGVyIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgaWRlbnRpZmllciwgY29uZGl0aW9uLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIC8vIHVzZSBzaW5ndWxhciBvZiBpZGVudGlmaWVyIGZvciBtZXRob2QgYXJndW1lbnRcbiAgICAgICAgbGV0IGFyZ3VtZW50ID0gc2luZ3VsYXJpemUoaWRlbnRpZmllci50b1NvdXJjZSgpKTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5maWx0ZXIoJHtsaXN0fSwgJHthcmd1bWVudH0gPT4gJHtjb25kaXRpb259KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gU2V0IG1lbWJlcnNoaXAgKGxlZnQgcmVjdXJzaXZlKS5cbiAgLy8gTk9URTogd2Ugd2lsbCBzaW5ndWxhcml6ZSBgaWRlbnRpZmllcmAgYW5kIHVzZSB0aGF0IGFzIHRoZSBhcmd1bWVudCB0byBgZXhwcmVzc2lvbmAuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfbWVtYmVyc2hpcF90ZXN0XCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7bGlzdDpleHByZXNzaW9ufSAob3BlcmF0b3I6aGFzfGhhcyBub3xkb2VzbnQgaGF2ZXxkb2VzIG5vdCBoYXZlKSB7aWRlbnRpZmllcn0gd2hlcmUge2ZpbHRlcjpleHByZXNzaW9ufVwiLFxuICAgIGxlZnRSZWN1cnNpdmU6IHRydWUsXG4gICAgdGVzdFJ1bGU6IG5ldyBSdWxlLktleXdvcmRzKHsgbWF0Y2g6IFwid2hlcmVcIiB9KSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9tZW1iZXJzaGlwX3Rlc3QgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyLCBvcGVyYXRvciwgZmlsdGVyLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIGxldCBiYW5nID0gb3BlcmF0b3IgPT09IFwiaGFzXCIgPyBcIlwiIDogXCIhXCI7XG4gICAgICAgIC8vIHVzZSBzaW5ndWxhciBvZiBpZGVudGlmaWVyIGZvciBtZXRob2QgYXJndW1lbnRcbiAgICAgICAgbGV0IGFyZ3VtZW50ID0gc2luZ3VsYXJpemUoaWRlbnRpZmllci50b1NvdXJjZSgpKTtcbiAgICAgICAgcmV0dXJuIGAke2Jhbmd9c3BlbGwuYW55KCR7bGlzdH0sICR7YXJndW1lbnR9ID0+ICR7ZmlsdGVyfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvL1xuICAvL1x0QWRkaW5nIHRvIGxpc3QgKGluLXBsYWNlKVxuICAvL1xuXG4gIC8vIEFkZCB0byBlbmQgb2YgbGlzdC5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9hcHBlbmRcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiYXBwZW5kIHt0aGluZzpleHByZXNzaW9ufSB0byB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgICAgXCJhZGQge3RoaW5nOmV4cHJlc3Npb259IHRvICgodGhlPykgZW5kIG9mKT8ge2xpc3Q6ZXhwcmVzc2lvbn1cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfYXBwZW5kIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5hcHBlbmQoJHtsaXN0fSwgJHt0aGluZ30pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gQWRkIHRvIGJlZ2lubmluZyBvZiBsaXN0LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3ByZXBlbmRcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFtcbiAgICAgIFwicHJlcGVuZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwiYWRkIHt0aGluZzpleHByZXNzaW9ufSB0byB0aGUgKHN0YXJ0fGZyb250fHRvcCkgb2Yge2xpc3Q6ZXhwcmVzc2lvbn1cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcHJlcGVuZCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwucHJlcGVuZCgke2xpc3R9LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBBZGQgdG8gbWlkZGxlIG9mIGxpc3QsIHB1c2hpbmcgZXhpc3RpbmcgaXRlbXMgb3V0IG9mIHRoZSB3YXkuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfYWRkX2F0XCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn0gYXQgcG9zaXRpb24ge3Bvc2l0aW9uOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3Rfc3BsaWNlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIHBvc2l0aW9uLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuc3BsaWNlKCR7bGlzdH0sICR7cG9zaXRpb259LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFRPRE86ICBcdFwiYWRkIHt0aGluZzpleHByZXNzaW9ufSB0byB7bGlzdDpleHByZXNzaW9ufSBiZWZvcmUge2l0ZW06ZXhwcmVzc2lvbn1cIixcblxuICAvLyBBZGQgdG8gbWlkZGxlIG9mIGxpc3QsIHB1c2hpbmcgZXhpc3RpbmcgaXRlbXMgb3V0IG9mIHRoZSB3YXkuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfYWRkX2FmdGVyXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn0gYWZ0ZXIge2l0ZW06ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9hZGRfYWZ0ZXIgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgaXRlbSwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnNwbGljZSgke2xpc3R9LCBzcGVsbC5wb3NpdGlvbk9mKCR7bGlzdH0sICR7aXRlbX0pLCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvL1xuICAvL1x0UmVtb3ZpbmcgZnJvbSBsaXN0IChpbi1wbGFjZSlcbiAgLy9cblxuICAvLyBFbXB0eSBsaXN0LlxuICAvL1RPRE86IG1ha2UgYGVtcHR5YCBhbmQvb3IgYGNsZWFyYCBhIGdlbmVyaWMgc3RhdGVtZW50Pz8/XG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfZW1wdHlcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiKGVtcHR5fGNsZWFyKSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X2VtcHR5IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmNsZWFyKCR7bGlzdH0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gUmVtb3ZlIG9uZSBpdGVtIGZyb20gbGlzdCBieSBwb3NpdGlvbi5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9yZW1vdmVfcG9zaXRpb25cIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwicmVtb3ZlIHtpZGVudGlmaWVyfSB7bnVtYmVyOmV4cHJlc3Npb259IG9mIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcmVtb3ZlX3Bvc2l0aW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbnVtYmVyLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwucmVtb3ZlSXRlbSgke2xpc3R9LCAke251bWJlcn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gUmVtb3ZlIHJhbmdlIG9mIHRoaW5ncyBmcm9tIGxpc3QuXG4gIC8vIE5PVEU6IGBzdGFydGAgaXMgKioxLWJhc2VkKiouXG4gIC8vIE5PVEU6IGBlbmRgIGlzIGluY2x1c2l2ZSFcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9yZW1vdmVfcmFuZ2VcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwicmVtb3ZlIHtpZGVudGlmaWVyfSB7c3RhcnQ6ZXhwcmVzc2lvbn0gdG8ge2VuZDpleHByZXNzaW9ufSBvZiB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3JlbW92ZV9wb3NpdGlvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHN0YXJ0LCBlbmQsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5yZW1vdmVSYW5nZSgke2xpc3R9LCAke3N0YXJ0fSwgJHtlbmR9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gUmVtb3ZlIGFsbCBpbnN0YW5jZXMgb2Ygc29tZXRoaW5nIGZyb20gYSBsaXN0LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3JlbW92ZVwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJyZW1vdmUge3RoaW5nOmV4cHJlc3Npb259IGZyb20ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9yZW1vdmUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnJlbW92ZSgke2xpc3R9LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBSZW1vdmUgYWxsIGl0ZW1zIGZyb20gbGlzdCB3aGVyZSBjb25kaXRpb24gaXMgdHJ1ZS5cbiAgLy8gTk9URTogd2Ugd2lsbCBzaW5ndWxhcml6ZSBgaWRlbnRpZmllcmAgYW5kIHVzZSB0aGF0IGFzIHRoZSBhcmd1bWVudCB0byBgZXhwcmVzc2lvbmAuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcmVtb3ZlX3doZXJlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJlbW92ZSB7aWRlbnRpZmllcn0gKGlufG9mfGZyb20pIHtsaXN0OmV4cHJlc3Npb259IHdoZXJlIHtjb25kaXRpb246ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9yZW1vdmVfd2hlcmUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyLCBjb25kaXRpb24sIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgLy8gdXNlIHNpbmd1bGFyIG9mIGlkZW50aWZpZXIgZm9yIG1ldGhvZCBhcmd1bWVudFxuICAgICAgICBsZXQgYXJndW1lbnQgPSBzaW5ndWxhcml6ZShpZGVudGlmaWVyLnRvU291cmNlKCkpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnJlbW92ZVdoZXJlKCR7bGlzdH0sICR7YXJndW1lbnR9ID0+ICR7Y29uZGl0aW9ufSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vXG4gIC8vXHRSYW5kb20gKGluLXBsYWNlKSBsaXN0IG1hbmlwdWxhdGlvbi5cbiAgLy9cblxuICAvLyBSZXZlcnNlIGxpc3QgaW4tcGxhY2UuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcmV2ZXJzZVwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJyZXZlcnNlIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcmV2ZXJzZSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5yZXZlcnNlKCR7bGlzdH0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gU2h1ZmZsZSBsaXN0IGluLXBsYWNlLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3NodWZmbGVcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiKHJhbmRvbWl6ZXxzaHVmZmxlKSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3NodWZmbGUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuc2h1ZmZsZSgke2xpc3R9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gSXRlcmF0aW9uXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfaXRlcmF0aW9uXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImZvciAoZWFjaCk/IHtpdGVtVmFyOmlkZW50aWZpZXJ9IGluIHtsaXN0OmV4cHJlc3Npb259Oj8ge3N0YXRlbWVudH0/XCIsXG4gICAgICBcImZvciAoZWFjaCk/IHtpdGVtVmFyOmlkZW50aWZpZXJ9IChhbmR8LCkge3Bvc2l0aW9uVmFyOmlkZW50aWZpZXJ9IGluIHtsaXN0OmV4cHJlc3Npb259Oj8ge3N0YXRlbWVudH0/XCIsXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9pdGVyYXRpb24gZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpdGVtVmFyLCBwb3NpdGlvblZhciwgbGlzdCwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBsZXQgb3V0cHV0O1xuICAgICAgICBpZiAocG9zaXRpb25WYXIpIHtcbiAgICAgICAgICBvdXRwdXQgPSBgZm9yIChsZXQgJHtwb3NpdGlvblZhcn0gPSAxLCBiYXI7ICR7aXRlbVZhcn0gPSAke2xpc3R9WyR7cG9zaXRpb25WYXJ9LTFdLCAke3Bvc2l0aW9uVmFyfSA8PSAke2xpc3R9Lmxlbmd0aDsgJHtwb3NpdGlvblZhcn0rKykgYFxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIE5PVEU6IHRoaXMgaXMgcmVsYXRpdmVseSBzbG93Li4uICBwcm9iYWJseSBkb2Vzbid0IG1hdHRlci4uLlxuICAgICAgICAgIG91dHB1dCA9IGBmb3IgKGxldCAke2l0ZW1WYXJ9IG9mICR7bGlzdH0pIGA7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0ICs9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoc3RhdGVtZW50LCBibG9jayk7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gUmFuZ2VcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmFuZ2VfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwicmFuZ2Uge3N0YXJ0OmV4cHJlc3Npb259IHRvIHtlbmQ6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHN0YXJ0LCBlbmQgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5nZSgke3N0YXJ0fSwgJHtlbmR9KWA7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL2xpc3RzLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBpbmZpeCBhbmQgcHJlZml4IG9wZXJhdG9ycy5cbi8vXG5cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4uLy4uL1BhcnNlclwiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVcIjtcblxuLy8gQ3JlYXRlIFwib3BlcmF0b3JzXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck1vZHVsZShcIm9wZXJhdG9yc1wiKTtcbmV4cG9ydCBkZWZhdWx0IHBhcnNlcjtcblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICAvLyBUT0RPOlxuICAvLyBcdC8vIEZpbmQgYmVzdCBtYXRjaCBhY2NvcmRpbmcgdG8gb3BlcmF0b3IgcHJlY2VkZW5jZSBhcyBkZWZpbmVkIGJlbG93LlxuICAvLyBcdGdldEJlc3RNYXRjaChtYXRjaGVzKSB7XG4gIC8vIFx0XHRjb25zb2xlLndhcm4oXCJHQk1cIiwgbWF0Y2hlcywgbWF0Y2hlcy5tYXAobWF0Y2ggPT4gbWF0Y2gucHJlY2VkZW5jZSksIG1hdGNoZXMubWFwKG1hdGNoID0+IG1hdGNoLm1hdGNoZWRUZXh0KSk7XG4gIC8vIFx0XHRyZXR1cm4gbWF0Y2hlcy5yZWR1Y2UoZnVuY3Rpb24gKGJlc3QsIG5leHQpIHtcbiAgLy8gXHRcdFx0Ly8gdGFrZSBoaWdoZXN0IHByZWNlZGVuY2UgbWF0Y2ggZmlyc3RcbiAgLy8gXHRcdFx0aWYgKG5leHQucHJlY2VkZW5jZSA+IGJlc3QucHJlY2VkZW5jZSkgcmV0dXJuIG5leHQ7XG4gIC8vIFx0XHRcdC8vIHRha2UgbG9uZ2VzdCBtYXRjaCBpZiBzYW1lIHByZWNlZGVuY2VcbiAgLy8gXHRcdFx0aWYgKG5leHQucHJlY2VkZW5jZSA9PT0gYmVzdC5wcmVjZWRlbmNlKSB7XG4gIC8vIFx0XHRcdFx0aWYgKG5leHQuZW5kSW5kZXggPiBiZXN0LmVuZEluZGV4KSByZXR1cm4gbmV4dDtcbiAgLy8gXHRcdFx0fVxuICAvLyBcdFx0XHRyZXR1cm4gYmVzdDtcbiAgLy8gXHRcdH0sIG1hdGNoZXNbMF0pO1xuICAvLyBcdH1cblxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIntsaHM6ZXhwcmVzc2lvbn0ge29wZXJhdG9yOmluZml4X29wZXJhdG9yfSB7cmhzOmV4cHJlc3Npb259XCIsXG4gICAgbGVmdFJlY3Vyc2l2ZTogdHJ1ZSxcbiAgICB0ZXN0UnVsZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpbmZpeF9vcGVyYXRvcl9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGhzLCByaHMsIF9vcGVyYXRvciB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gX29wZXJhdG9yLmFwcGx5T3BlcmF0b3IobGhzLCByaHMpO1xuICAgICAgfVxuXG4gICAgICBnZXQgcHJlY2VkZW5jZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1hdGNoZWQpIHRocm93IG5ldyBTeW50YXhFcnJvcihcImluZml4X29wZXJhdG9yX2V4cHJlc3Npb246IHRyeWluZyB0byBsb29rIHVwIHByZWNlZGVuY2Ugd2hlbiBub3QgcGFyc2VkIVwiKTtcbiAgICAgICAgY29uc3QgeyBfb3BlcmF0b3IgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIF9vcGVyYXRvci5wcmVjZWRlbmNlO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyMjIEluZml4IG9wZXJhdG9yczogICBge2xoc30gPG9wZXJhdG9yPiB7cmhzfWAsIGVnOiBgYSBpcyAxYFxuICAvLyBOT1RFOiBgb3BlcmF0b3IuYXBwbHlPcGVyYXRvcmAgTVVTVCByZXR1cm4gYSBmdW5jdGlvbiB3aGljaCB0cmFuc2Zvcm1zIHR3byBhcmd1bWVudHMgKGBsaHNgIGFuZCBgcmhzYCkgaW50byBvdXRwdXQuXG4gIC8vIE5PVEU6IGBwcmVjZWRlbmNlYCBudW1iZXJzIGNvbWUgZnJvbSBKYXZhc2NyaXB0IGVxdWl2YWxlbnRzXG4gIC8vXHRcdCBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9PcGVyYXRvcnMvT3BlcmF0b3JfUHJlY2VkZW5jZVxuICB7XG4gICAgbmFtZTogXCJhbmRcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogNixcbiAgICBzeW50YXg6IFwiYW5kXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGFuZCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuIGAoJHthfSAmJiAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIGFuZCBiXCIsIFwiKGEgJiYgYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDUsXG4gICAgc3ludGF4OiBcIm9yXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm4gYCgke2F9IHx8ICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImEgb3IgYlwiLCBcIihhIHx8IGIpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpc1wiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMCxcbiAgICBzeW50YXg6IFwiaXNcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXMgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybiBgKCR7YX0gPT0gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBiXCIsIFwiKGEgPT0gYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImlzX25vdFwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMCxcbiAgICBzeW50YXg6IFwiaXMgbm90XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX25vdCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuIGAoJHthfSAhPSAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIGlzIG5vdCBiXCIsIFwiKGEgIT0gYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImlzX2V4YWN0bHlcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTAsXG4gICAgc3ludGF4OiBcImlzIGV4YWN0bHlcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfZXhhY3RseSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuIGAoJHthfSA9PT0gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBleGFjdGx5IGJcIiwgXCIoYSA9PT0gYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpc19ub3RfZXhhY3RseVwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMCxcbiAgICBzeW50YXg6IFwiaXMgbm90IGV4YWN0bHlcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2V4YWN0bHkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybiBgKCR7YX0gIT09ICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImEgaXMgbm90IGV4YWN0bHkgYlwiLCBcIihhICE9PSBiKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbi8vRklYTUU6IG5vIHZhbGlkYXRpb24gdGhhdCBgdHlwZWAgaXMgYSBsZWdhbCBKUyB0eXBlXG4gIC8vVE9ETzogYGlzIHNhbWUgdHlwZSBhc2AgP1xuICB7XG4gICAgbmFtZTogXCJpc19hXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpcyBhXCIsXG4gICAgICBcImlzIGFuXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19hIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKHRoaW5nLCB0eXBlKSB7IHJldHVybiBgc3BlbGwuaXNPZlR5cGUoJHt0aGluZ30sICcke3R5cGV9JylgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBhIEJcIiwgXCJzcGVsbC5pc09mVHlwZShhLCAnQicpXCJdLFxuICAgICAgICAgIFtcImEgaXMgYW4gQVwiLCBcInNwZWxsLmlzT2ZUeXBlKGEsICdBJylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImlzX25vdF9hXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpcyBub3QgYVwiLFxuICAgICAgXCJpcyBub3QgYW5cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX25vdF9hIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKHRoaW5nLCB0eXBlKSB7IHJldHVybiBgIXNwZWxsLmlzT2ZUeXBlKCR7dGhpbmd9LCAnJHt0eXBlfScpYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImEgaXMgbm90IGEgQlwiLCBcIiFzcGVsbC5pc09mVHlwZShhLCAnQicpXCJdLFxuICAgICAgICAgIFtcImEgaXMgbm90IGFuIEFcIiwgXCIhc3BlbGwuaXNPZlR5cGUoYSwgJ0EnKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAgLy9UT0RPOiBgc3BlbGwuY29udGFpbnMoY29sbGVjdGlvbiwgdGhpbmcpYFxuICB7XG4gICAgbmFtZTogXCJpc19pblwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgaW5cIixcbiAgICAgIFwiaXMgb25lIG9mXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19pbiBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcih0aGluZywgbGlzdCkgeyByZXR1cm4gYHNwZWxsLmluY2x1ZGVzKCR7bGlzdH0sICR7dGhpbmd9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIGlzIGluIHRoZUxpc3RcIiwgXCJzcGVsbC5pbmNsdWRlcyh0aGVMaXN0LCBhKVwiXSxcbiAgICAgICAgICBbXCJhIGlzIG9uZSBvZiB0aGVMaXN0XCIsIFwic3BlbGwuaW5jbHVkZXModGhlTGlzdCwgYSlcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImlzX25vdF9pblwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgbm90IGluXCIsXG4gICAgICBcImlzIG5vdCBvbmUgb2ZcIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX25vdF9pbiBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcih0aGluZywgbGlzdCkgeyByZXR1cm4gYCFzcGVsbC5pbmNsdWRlcygke2xpc3R9LCAke3RoaW5nfSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBub3QgaW4gdGhlTGlzdFwiLCBcIiFzcGVsbC5pbmNsdWRlcyh0aGVMaXN0LCBhKVwiXSxcbiAgICAgICAgICBbXCJhIGlzIG5vdCBvbmUgb2YgdGhlTGlzdFwiLCBcIiFzcGVsbC5pbmNsdWRlcyh0aGVMaXN0LCBhKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cblxuXG4gIHtcbiAgICBuYW1lOiBcImluY2x1ZGVzXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpbmNsdWRlc1wiLFxuICAgICAgXCJjb250YWluc1wiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaW5jbHVkZXMgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IobGlzdCwgdGhpbmcpIHsgcmV0dXJuIGBzcGVsbC5pbmNsdWRlcygke2xpc3R9LCAke3RoaW5nfSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1widGhlTGlzdCBpbmNsdWRlcyBhXCIsIFwic3BlbGwuaW5jbHVkZXModGhlTGlzdCwgYSlcIl0sXG4gICAgICAgICAgW1widGhlTGlzdCBjb250YWlucyBhXCIsIFwic3BlbGwuaW5jbHVkZXModGhlTGlzdCwgYSlcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImRvZXNfbm90X2luY2x1ZGVcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImRvZXMgbm90IGluY2x1ZGVcIixcbiAgICAgIFwiZG9lcyBub3QgY29udGFpblwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZG9lc19ub3RfaW5jbHVkZSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihsaXN0LCB0aGluZykgeyByZXR1cm4gYCFzcGVsbC5pbmNsdWRlcygke2xpc3R9LCAke3RoaW5nfSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1widGhlTGlzdCBkb2VzIG5vdCBpbmNsdWRlIGFcIiwgXCIhc3BlbGwuaW5jbHVkZXModGhlTGlzdCwgYSlcIl0sXG4gICAgICAgICAgW1widGhlTGlzdCBkb2VzIG5vdCBjb250YWluIGFcIiwgXCIhc3BlbGwuaW5jbHVkZXModGhlTGlzdCwgYSlcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG5cbiAge1xuICAgIG5hbWU6IFwiZ3RcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcIj5cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZ3QgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9ID4gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiB7XG4gICAgICAgICAgXCJ3aXRoIHNwYWNlc1wiOiBbXCJhID4gYlwiLCBcIihhID4gYilcIl0sXG4gICAgICAgICAgXCJ3aXRob3V0IHNwYWNlc1wiOiBbXCJhPmJcIiwgXCIoYSA+IGIpXCJdLFxuICAgICAgICB9XG4gICAgICB9LFxuICAgIF1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaXNfZ3RcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcImlzIGdyZWF0ZXIgdGhhblwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19ndCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9ID4gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBncmVhdGVyIHRoYW4gYlwiLCBcIihhID4gYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImd0ZVwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiPj1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZ3RlIGV4dGVuZHMgUnVsZS5TeW1ib2xzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybmAoJHthfSA+PSAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IHtcbiAgICAgICAgICBcIndpdGggc3BhY2VzXCI6IFtcImEgPj0gYlwiLCBcIihhID49IGIpXCJdLFxuICAgICAgICAgIFwid2l0aG91dCBzcGFjZXNcIjogW1wiYT49YlwiLCBcIihhID49IGIpXCJdLFxuICAgICAgICB9XG4gICAgICB9LFxuICAgIF1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaXNfZ3RlXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCJpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfZ3RlIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gPj0gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gYlwiLCBcIihhID49IGIpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJsdFwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiPFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsdCBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gPCAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IHtcbiAgICAgICAgICBcIndpdGggc3BhY2VzXCI6IFtcImEgPiBiXCIsIFwiKGEgPiBiKVwiXSxcbiAgICAgICAgICBcIndpdGhvdXQgc3BhY2VzXCI6IFtcImE+YlwiLCBcIihhID4gYilcIl0sXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpc19sdFwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiaXMgbGVzcyB0aGFuXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2x0IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gPCAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIGlzIGxlc3MgdGhhbiBiXCIsIFwiKGEgPCBiKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwibHRlXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCI8PVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsdGUgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9IDw9ICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czoge1xuICAgICAgICAgIFwid2l0aCBzcGFjZXNcIjogW1wiYSA8PSBiXCIsIFwiKGEgPD0gYilcIl0sXG4gICAgICAgICAgXCJ3aXRob3V0IHNwYWNlc1wiOiBbXCJhPD1iXCIsIFwiKGEgPD0gYilcIl0sXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImlzX2x0ZVwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2x0ZSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9IDw9ICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImEgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIGJcIiwgXCIoYSA8PSBiKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cblxuICB7XG4gICAgbmFtZTogXCJwbHVzX3N5bWJvbFwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMyxcbiAgICBzeW50YXg6IFwiXFxcXCtcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcGx1c19zeW1ib2wgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9ICsgJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYStiXCIsIFwiKGEgKyBiKVwiXSxcbiAgICAgICAgICBbXCJhICsgYlwiLCBcIihhICsgYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJwbHVzXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDEzLFxuICAgIHN5bnRheDogXCJwbHVzXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHBsdXMgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybmAoJHthfSArICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImEgcGx1cyBiXCIsIFwiKGEgKyBiKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwibWludXNfc3ltYm9sXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDEzLFxuICAgIHN5bnRheDogXCItXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG1pbnVzX3N5bWJvbCBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gLSAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IHtcbi8vICAgICAgICBcIndpdGhvdXQgc3BhY2VzXCI6IFtcImEtYlwiLCBcIihhIC0gYilcIl0sICAgLy8gbWludXMgcmVxdWlyZXMgc3BhY2VcbiAgICAgICAgICBcIndpdGggc3BhY2VzXCI6IFtcImEgLSBiXCIsIFwiKGEgLSBiKVwiXSxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcIm1pbnVzXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDEzLFxuICAgIHN5bnRheDogXCJtaW51c1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBtaW51cyBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9IC0gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBtaW51cyBiXCIsIFwiKGEgLSBiKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwidGltZXNfc3VtYm9sXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDE0LFxuICAgIHN5bnRheDogXCJcXFxcKlwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0aW1lcyBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gKiAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IHtcbiAgICAgICAgICBcIndpdGhvdXQgc3BhY2VzXCI6IFtcImEqYlwiLCBcIihhICogYilcIl0sXG4gICAgICAgICAgXCJ3aXRoIHNwYWNlc1wiOiBbXCJhICogYlwiLCBcIihhICogYilcIl0sXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJ0aW1lc1wiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxNCxcbiAgICBzeW50YXg6IFwidGltZXNcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgdGltZXMgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybmAoJHthfSAqICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImEgdGltZXMgYlwiLCBcIihhICogYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImRpdmlzaW9uX3N5bWJvbFwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxNCxcbiAgICBzeW50YXg6IFwiL1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkaXZpZGVkX2J5IGV4dGVuZHMgUnVsZS5TeW1ib2xzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybmAoJHthfSAvICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czoge1xuICAgICAgICAgIFwid2l0aG91dCBzcGFjZXNcIjogW1wiYS9iXCIsIFwiKGEgLyBiKVwiXSxcbiAgICAgICAgICBcIndpdGggc3BhY2VzXCI6IFtcImEgLyBiXCIsIFwiKGEgLyBiKVwiXSxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcImRpdmlkZWRfYnlcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTQsXG4gICAgc3ludGF4OiBcImRpdmlkZWQgYnlcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGl2aWRlZF9ieSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9IC8gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBkaXZpZGVkIGJ5IGJcIiwgXCIoYSAvIGIpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICAvL1xuICAvLyMjIFBvc3RpZnggb3BlcmF0b3JzOiAgIGB7bGhzfSA8b3BlcmF0b3I+YCwgZS5nLiBgYSBpcyBkZWZpbmVkYFxuICAvLyBOT1RFOiBgb3BlcmF0b3IuYXBwbHlPcGVyYXRvcmAgTVVTVCByZXR1cm4gYSBmdW5jdGlvbiB3aGljaCB0cmFuc2Zvcm1zIGFyZ3VtZW50IChgbGhzYCkgaW50byBKUyBvdXRwdXQuXG5cbiAge1xuICAgIG5hbWU6IFwicG9zdGZpeF9vcGVyYXRvcl9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7ZXhwcmVzc2lvbn0ge29wZXJhdG9yOnBvc3RmaXhfb3BlcmF0b3J9XCIsXG4gICAgbGVmdFJlY3Vyc2l2ZTogdHJ1ZSxcbiAgICB0ZXN0UnVsZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHBvc3RmaXhfb3BlcmF0b3JfZXhwcmVzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgZXhwcmVzc2lvbiwgX29wZXJhdG9yIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBfb3BlcmF0b3IuYXBwbHlPcGVyYXRvcihleHByZXNzaW9uKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaXNfZGVmaW5lZFwiLFxuICAgIGFsaWFzOiBbXCJwb3N0Zml4X29wZXJhdG9yXCJdLFxuICAgIHN5bnRheDogXCJpcyBkZWZpbmVkXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2RlZmluZWQgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IodGhpbmcpIHsgcmV0dXJuIGAodHlwZW9mICR7dGhpbmd9ICE9PSAndW5kZWZpbmVkJylgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBkZWZpbmVkXCIsIFwiKHR5cGVvZiBhICE9PSAndW5kZWZpbmVkJylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpc191bmRlZmluZWRcIixcbiAgICBhbGlhczogW1wicG9zdGZpeF9vcGVyYXRvclwiXSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgdW5kZWZpbmVkXCIsXG4gICAgICBcImlzIG5vdCBkZWZpbmVkXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc191bmRlZmluZWQgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IodGhpbmcpIHsgcmV0dXJuIGAodHlwZW9mICR7dGhpbmd9ID09PSAndW5kZWZpbmVkJylgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1widGhpbmcgaXMgdW5kZWZpbmVkXCIsIFwiKHR5cGVvZiB0aGluZyA9PT0gJ3VuZGVmaW5lZCcpXCJdLFxuICAgICAgICAgIFtcInRoaW5nIGlzIG5vdCBkZWZpbmVkXCIsIFwiKHR5cGVvZiB0aGluZyA9PT0gJ3VuZGVmaW5lZCcpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpc19lbXB0eVwiLFxuICAgIGFsaWFzOiBbXCJwb3N0Zml4X29wZXJhdG9yXCJdLFxuICAgIHN5bnRheDogXCJpcyBlbXB0eVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19lbXB0eSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcih0aGluZykgeyByZXR1cm4gYHNwZWxsLmlzRW1wdHkoJHt0aGluZ30pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcInRoaW5nIGlzIGVtcHR5XCIsIFwic3BlbGwuaXNFbXB0eSh0aGluZylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpc19ub3RfZW1wdHlcIixcbiAgICBhbGlhczogW1wicG9zdGZpeF9vcGVyYXRvclwiXSxcbiAgICBzeW50YXg6IFwiaXMgbm90IGVtcHR5XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX25vdF9lbXB0eSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcih0aGluZykgeyByZXR1cm4gYCFzcGVsbC5pc0VtcHR5KCR7dGhpbmd9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJ0aGluZyBpcyBub3QgZW1wdHlcIiwgXCIhc3BlbGwuaXNFbXB0eSh0aGluZylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG5cbiAgLy9cbiAgLy8jIyBQcmVmaXggb3BlcmF0b3JzOiAgIGA8b3BlcmF0b3I+IHtsaHN9YCwgZS5nLiBgcm91bmQgdGhlTGlzdGBcbiAgLy8gTk9URTogYG9wZXJhdG9yLmFwcGx5T3BlcmF0b3JgIE1VU1QgcmV0dXJuIGEgZnVuY3Rpb24gd2hpY2ggdHJhbnNmb3JtcyBhcmd1bWVudCAoYGxoc2ApIGludG8gSlMgb3V0cHV0LlxuXG4gIHtcbiAgICBuYW1lOiBcImFic29sdXRlX3ZhbHVlXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuLy9GSVhNRTogbWFrZSBgdGhlYCBvcHRpb25hbFxuICAgIHN5bnRheDogXCJ0aGUgYWJzb2x1dGUgdmFsdWUgb2Yge2V4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGFic29sdXRlX3ZhbHVlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgY29uc3QgeyBleHByZXNzaW9uIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgTWF0aC5hYnMoJHtleHByZXNzaW9ufSlgO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJ0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpbmdcIiwgXCJNYXRoLmFicyh0aGluZylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm1heFwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbi8vRklYTUU6IFwidGhlP1wiXG4gICAgc3ludGF4OiBcIihtYXh8bWF4aW11bXxsYXJnZXN0fGJpZ2dlc3QpIHtpZGVudGlmaWVyfT8gKG9mfGluKSB7ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbWF4IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgY29uc3QgeyBleHByZXNzaW9uIH0gPSB0aGlzLnJlc3VsdHM7XG4vLyBUT0RPOiBNYXRoLm1heCgpIGRvZXNuJ3Qgd29yayB3aGVuIHBhc3NlZCBhbiBhcnJheS4uLiA6LShcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5tYXgoJHtleHByZXNzaW9ufSlgXG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIm1heCBvZiB0aGluZ1wiLCBcInNwZWxsLm1heCh0aGluZylcIl0sXG4gICAgICAgICAgW1wibWF4IGluIHRoaW5nXCIsIFwic3BlbGwubWF4KHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJtYXhpbXVtIG9mIHRoaW5nXCIsIFwic3BlbGwubWF4KHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJsYXJnZXN0IG9mIHRoaW5nXCIsIFwic3BlbGwubWF4KHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJiaWdnZXN0IGluIHRoaW5nXCIsIFwic3BlbGwubWF4KHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJiaWdnZXN0IGl0ZW0gaW4gdGhpbmdcIiwgXCJzcGVsbC5tYXgodGhpbmcpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJtaW5cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4vL0ZJWE1FOiBcInRoZT9cIlxuICAgIHN5bnRheDogXCIobWlufG1pbmltdW18c21hbGxlc3R8bGVhc3QpIHtpZGVudGlmaWVyfT8gKG9mfGluKSB7ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbWluIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgY29uc3QgeyBleHByZXNzaW9uIH0gPSB0aGlzLnJlc3VsdHM7XG4vLyBUT0RPOiBNYXRoLm1pbigpIGRvZXNuJ3Qgd29yayB3aGVuIHBhc3NlZCBhbiBhcnJheS4uLiA6LShcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5taW4oJHtleHByZXNzaW9ufSlgXG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIm1pbiBvZiB0aGluZ1wiLCBcInNwZWxsLm1pbih0aGluZylcIl0sXG4gICAgICAgICAgW1wibWluIGluIHRoaW5nXCIsIFwic3BlbGwubWluKHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJtaW5pbXVtIG9mIHRoaW5nXCIsIFwic3BlbGwubWluKHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJzbWFsbGVzdCBvZiB0aGluZ1wiLCBcInNwZWxsLm1pbih0aGluZylcIl0sXG4gICAgICAgICAgW1wibGVhc3Qgb2YgdGhpbmdcIiwgXCJzcGVsbC5taW4odGhpbmcpXCJdLFxuICAgICAgICAgIFtcInNtYWxsZXN0IGl0ZW0gaW4gdGhpbmdcIiwgXCJzcGVsbC5taW4odGhpbmcpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuXG4gIC8vXG4gIC8vIyMgXCJzdXJyb3VuZGluZ1wiIG9wZXJhdG9yIGV4cHJlc3Npb25zOiAgIGByb3VuZCB0aGluZyBkb3duYFxuICAvL1xuXG4gIHtcbiAgICBuYW1lOiBcInJvdW5kX3VwX29yX2Rvd25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcInJvdW5kIHt0aGluZzpleHByZXNzaW9ufSAoZGlyZWN0aW9uOm9mZnx1cHxkb3duKT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgcm91bmRfdXBfb3JfZG93biBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGNvbnN0IHsgdGhpbmcsIGRpcmVjdGlvbiB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSBcInVwXCIpXG4gICAgICAgICAgcmV0dXJuIGBNYXRoLmNlaWwoJHt0aGluZ30pYDtcbiAgICAgICAgZWxzZSBpZiAoZGlyZWN0aW9uID09PSBcImRvd25cIilcbiAgICAgICAgICByZXR1cm4gYE1hdGguZmxvb3IoJHt0aGluZ30pYDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBgTWF0aC5yb3VuZCgke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJyb3VuZCB0aGluZ1wiLCBcIk1hdGgucm91bmQodGhpbmcpXCJdLFxuICAgICAgICAgIFtcInJvdW5kIHRoaW5nIG9mZlwiLCBcIk1hdGgucm91bmQodGhpbmcpXCJdLFxuICAgICAgICAgIFtcInJvdW5kIHRoaW5nIHVwXCIsIFwiTWF0aC5jZWlsKHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJyb3VuZCB0aGluZyBkb3duXCIsIFwiTWF0aC5mbG9vcih0aGluZylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9XG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL29wZXJhdG9ycy5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgY3JlYXRpbmcgdmFyaWFibGVzLCBwcm9wZXJ0eSBhY2Nlc3MsIGV0Y1xuLy9cblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG4vLyBDcmVhdGUgXCJzdGF0ZW1lbnRzXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck1vZHVsZShcInN0YXRlbWVudHNcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAgLy9cbiAgLy9cdCMjIFJldHVybnNcbiAgLy9cblxuICAvLyBSZXR1cm4gYSB2YWx1ZVxuICB7XG4gICAgbmFtZTogXCJyZXR1cm5fc3RhdGVtZW50XCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJldHVybiB7ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmV0dXJuX3N0YXRlbWVudCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGV4cHJlc3Npb24gfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGByZXR1cm4gJHtleHByZXNzaW9ufWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wicmV0dXJuIHRoaW5nXCIsIFwicmV0dXJuIHRoaW5nXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICAvL1xuICAvL1x0IyMgQXNzaWdubWVudFxuICAvL1xuXG4gIC8vVE9ETzogZGlzdGluZ3Vpc2ggYmV0d2VlbiBgbmV3X2lkZW50aWZpZXJgIGFuZCBgc2NvcGVkX2lkZW50aWZpZXJgP1xuICB7XG4gICAgbmFtZTogXCJhc3NpZ25tZW50XCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwie3RoaW5nOmV4cHJlc3Npb259ID0ge3ZhbHVlOmV4cHJlc3Npb259XCIsXG4gICAgICBcInNldCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge3ZhbHVlOmV4cHJlc3Npb259XCIsXG4gICAgICBcInB1dCB7dmFsdWU6ZXhwcmVzc2lvbn0gaW50byB7dGhpbmc6ZXhwcmVzc2lvbn1cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGFzc2lnbm1lbnQgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgdmFsdWUgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgLy8gVE9ETzogZGVjbGFyZSBpZGVudGlmaWVyIGlmIG5vdCBpbiBzY29wZSwgZXRjXG4gICAgICAgIHJldHVybiBgJHt0aGluZ30gPSAke3ZhbHVlfWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1widGhpbmcgPSB5ZXNcIiwgXCJ0aGluZyA9IHRydWVcIl0sXG4gICAgICAgICAgW1wic2V0IHRoaW5nIHRvIHllc1wiLCBcInRoaW5nID0gdHJ1ZVwiXSxcbiAgICAgICAgICBbXCJwdXQgeWVzIGludG8gdGhpbmdcIiwgXCJ0aGluZyA9IHRydWVcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImdldF92YWx1ZVwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcImdldCB7dmFsdWU6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZ2V0X3ZhbHVlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdmFsdWUgfSA9IHRoaXMucmVzdWx0czs7XG4gICAgICAgIHJldHVybiBgdmFyIGl0ID0gJHt2YWx1ZX1gXG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBcIixcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImdldCB0aGluZ1wiLCBcInZhciBpdCA9IHRoaW5nXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ydWxlcy9zcGVsbC9zdGF0ZW1lbnRzLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBkZWZpbmluZyBjbGFzc2VzIChrbm93biBhcyBgdHlwZXNgKVxuLy9cblxuLy9UT0RPOiBjb25zdHJ1Y3RvclxuLy8gVE9ETzogbWl4aW5zIC8gdHJhaXRzIC8gY29tcG9zZWQgY2xhc3NlcyAvIGFubm90YXRpb25zXG5cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4uLy4uL1BhcnNlclwiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVcIjtcblxuaW1wb3J0IGdsb2JhbCBmcm9tIFwiLi4vLi4vdXRpbHMvZ2xvYmFsXCI7XG5pbXBvcnQgeyBwbHVyYWxpemUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc3RyaW5nXCI7XG5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JNb2R1bGUoXCJ0eXBlc1wiKTtcbmV4cG9ydCBkZWZhdWx0IHBhcnNlcjtcblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuXG4gIC8vTU9WRSBUTyBgZnVuY3Rpb25zYD9cbiAgLy8gQXJndW1lbnRzIGNsYXVzZSBmb3IgbWV0aG9kc1xuICAvL1x0YHdpdGggZm9vYCBvciBgd2l0aCBmb28gYW5kIGJhciBhbmQgYmF6YFxuICAvL1RPRE86IHtpZGVudGlmaWVyfSA9IHtleHByZXNzaW9ufVx0PT4gcmVxdWlyZXMgYCxgIGluc3RlYWQgb2YgYGFuZGBcbiAgLy9UT0RPOiBgd2l0aCBmb28gYXMgVHlwZWBcbiAgLy9UT0RPOlx0YHdpdGggZm9vLi4uYCBmb3Igc3BsYXQ/XG4gIHtcbiAgICBuYW1lOiBcImFyZ3NcIixcbiAgICBzeW50YXg6IFwid2l0aCBbYXJnczp7aWRlbnRpZmllcn0sXVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBhcmdzIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICAvLyBSZXR1cm5zIGFuIGFycmF5IG9mIGFyZ3VtZW50IHZhbHVlc1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGNvbnN0IHsgYXJncyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYXJncy5qb2luKFwiLCBcIik7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICAvLyBzaG93QWxsOiB0cnVlLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIndpdGggYVwiLCBcImFcIl0sXG4gICAgICAgICAgW1wid2l0aCBhLCBiLCBjXCIsIFwiYSwgYiwgY1wiXSxcbiAgICAgICAgICBbXCJ3aXRoIGEsIGIsIGMsXCIsIFwiYSwgYiwgY1wiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cblxuICAvLyBQcm9wZXJ0aWVzIGNsYXVzZTogY3JlYXRlcyBhbiBvYmplY3Qgd2l0aCBvbmUgb3IgbW9yZSBwcm9wZXJ0eSB2YWx1ZXMuXG4gIC8vXHRgZm9vID0gMSwgYmFyID0gMmBcbiAgLy9UT0RPOiB3b3VsZCBsaWtlIHRvIHVzZSBgYW5kYCBidXQgdGhhdCB3aWxsIGJhcmYgb24gZXhwcmVzc2lvbnMuLi5cbiAgLy9UT0RPOiBob3cgdG8gZG8gcHJvcGVydGllcyBvbiBtdWx0aXBsZSBsaW5lcz9cbiAge1xuICAgIG5hbWU6IFwib2JqZWN0X2xpdGVyYWxfcHJvcGVydGllc1wiLFxuICAgIHN5bnRheDogXCJbKHtrZXk6aWRlbnRpZmllcn0oPzo9IHt2YWx1ZTpleHByZXNzaW9ufSk/KSAsXVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvYmplY3RfbGl0ZXJhbF9wcm9wZXJ0aWVzIGV4dGVuZHMgUnVsZS5MaXN0IHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgcHJvcHMgPSB0aGlzLm1hdGNoZWQubWFwKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgICAgICBsZXQgeyBrZXksIHZhbHVlIH0gPSBwcm9wLnJlc3VsdHM7XG4vL1RPRE86IGRvbid0IHF1b3RlIGlmIHdlIGRvbid0IGhhdmUgdG8/XG4vL1RPT0Q6IG11bHRpcGxlIGxpbmVzIGlmID4gMiBwcm9wcz9cbiAgICAgICAgICAgIGlmICh2YWx1ZSkgcmV0dXJuIGBcIiR7a2V5fVwiOiAke3ZhbHVlfWBcbiAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBgeyAke3Byb3BzLmpvaW4oXCIsIFwiKX0gfWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJcIixcbiAgICAgICAgLy8gc2hvd0FsbDogdHJ1ZSxcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbYGEgPSAxYCwgYHsgXCJhXCI6IDEgfWBdLFxuICAgICAgICAgIFtgYSA9IDEsYCwgYHsgXCJhXCI6IDEgfWBdLFxuICAgICAgICAgIFtgYSA9IDEsIGIgPSB5ZXMsIGMgPSBcInF1b3RlZFwiYCwgYHsgXCJhXCI6IDEsIFwiYlwiOiB0cnVlLCBcImNcIjogXCJxdW90ZWRcIiB9YF0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImRlZmluZV90eXBlXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwiZGVmaW5lIHR5cGUge25hbWU6dHlwZX0gKD86YXMgKGF8YW4pIHtzdXBlclR5cGU6dHlwZX0pP1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkZWZpbmVfdHlwZSBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgc3RydWN0dXJlID0gc3VwZXIudG9TdHJ1Y3R1cmUoKTtcbiAgICAgICAgc3RydWN0dXJlLnR5cGUgPSBcImNsYXNzXCI7XG4gICAgICAgIHJldHVybiBzdHJ1Y3R1cmU7XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBuYW1lLCBzdXBlclR5cGUsIHN0YXRlbWVudHMgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgbGV0IG91dHB1dCA9IGBjbGFzcyAke25hbWV9YDtcbiAgICAgICAgaWYgKHN1cGVyVHlwZSkgb3V0cHV0ICs9IGAgZXh0ZW5kcyAke3N1cGVyVHlwZX1gO1xuICAgICAgICBvdXRwdXQgKz0gXCIgXCIgKyBzdGF0ZW1lbnRzO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudHNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJkZWZpbmUgdHlwZSBGb29cIiwgXCJjbGFzcyBGb28ge31cIl0sXG4gICAgICAgICAgW1wiZGVmaW5lIHR5cGUgRm9vIGFzIGEgQmFyXCIsIFwiY2xhc3MgRm9vIGV4dGVuZHMgQmFyIHt9XCJdLFxuICAgICAgICAgIFtcImRlZmluZSB0eXBlIEZvb1xcblxcdGEgPSB0cnVlXCIsIFwiY2xhc3MgRm9vIHtcXG5cXHRhID0gdHJ1ZVxcbn1cIl0sXG4vL1RFU1RNRTogbW9yZSBpbnZvbHZlZCB0ZXN0cy4uLlxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cblxuICB9LFxuXG4gIC8vIGBuZXdgIG9yIGBjcmVhdGVgXG4gIC8vIFRoaXMgd29ya3MgYXMgYW4gZXhwcmVzc2lvbiBPUiBhIHN0YXRlbWVudC5cbiAgLy8gTk9URTogd2UgYXNzdW1lIHRoYXQgYWxsIHR5cGVzIHRha2UgYW4gb2JqZWN0IG9mIHByb3BlcnRpZXM/Pz8/XG4vL0ZJWE1FOiBgbGlzdGAsIGB0ZXh0YCwgZXRjIGRvbid0IGZvbGxvdyB0aGVzZSBzZW1hbnRpY3MgYW5kIHNob3VsZCBiZSBkaXNhbGxvd2VkLi4uID8/P1xuICB7XG4gICAgbmFtZTogXCJuZXdfdGhpbmdcIixcbiAgICBhbGlhczogW1wiZXhwcmVzc2lvblwiLCBcInN0YXRlbWVudFwiXSxcbiAgICBzeW50YXg6IFwiKGNyZWF0ZXxuZXcpIHt0eXBlfSAoPzp3aXRoIHtwcm9wczpvYmplY3RfbGl0ZXJhbF9wcm9wZXJ0aWVzfSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG5ld190aGluZyBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHR5cGUsIHByb3BzID0gXCJcIiB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIG9iamVjdCwgd2hpY2ggd2UnbGwgY3JlYXRlIHdpdGggYW4gb2JqZWN0IGxpdGVyYWwuXG4gICAgICAgIGlmICh0eXBlID09PSBcIk9iamVjdFwiKSB7XG4gICAgICAgICAgaWYgKCFwcm9wcykgcmV0dXJuIFwie31cIjtcbiAgICAgICAgICByZXR1cm4gcHJvcHM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYG5ldyAke3R5cGV9KCR7cHJvcHN9KWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjcmVhdGVzIG5vcm1hbCBvYmplY3RzIHByb3Blcmx5XCIsXG4gICAgICAgIGNvbXBpbGVBczogXCJzdGF0ZW1lbnRcIixcbiAgICAgICAgLy8gc2hvd0FsbDogdHJ1ZSxcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgIFtgY3JlYXRlIE9iamVjdGAsIGB7fWBdLFxuICAgICAgICAgW2BuZXcgT2JqZWN0YCwgYHt9YF0sXG4gICAgICAgICBbYG5ldyBPYmplY3Qgd2l0aCBhID0gMSwgYiA9IHllc2AsIGB7IFwiYVwiOiAxLCBcImJcIjogdHJ1ZSB9YF0sXG4gICAgICAgICBbYG5ldyBGb29gLCBgbmV3IEZvbygpYF0sXG4gICAgICAgICBbYG5ldyBGb28gd2l0aCBhID0gMSwgYiA9IHllc2AsIGBuZXcgRm9vKHsgXCJhXCI6IDEsIFwiYlwiOiB0cnVlIH0pYF0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNyZWF0ZXMgc3BlY2lhbCB0eXBlc1wiLFxuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICAvLyBzaG93QWxsOiB0cnVlLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImNyZWF0ZSBvYmplY3RcIiwgXCJ7fVwiXSxcbi8vRklYTUU6IHRoZSBmb2xsb3dpbmcgZG9uJ3QgbWFrZSBzZW5zZSBpZiB0aGV5IGhhdmUgYXJndW1lbnRzLi4uXG4gICAgICAgICAgW1wiY3JlYXRlIExpc3RcIiwgXCJuZXcgQXJyYXkoKVwiXSxcbiAgICAgICAgICBbXCJjcmVhdGUgbGlzdFwiLCBcIm5ldyBBcnJheSgpXCJdLFxuLy9GSVhNRTogdGhlIGZvbGxvd2luZyBkb24ndCBtYWtlIHNlbnNlIGluIEpTIGJ1dCBhcmUgbGVnYWwgcGFyc2Utd2lzZVxuXG4vLyAgICAgICAgICAgW1wiY3JlYXRlIHRleHRcIiwgXCJuZXcgU3RyaW5nKClcIl0sXG4vLyAgICAgICAgICAgW1wiY3JlYXRlIGNoYXJhY3RlclwiLCBcIm5ldyBDaGFyYWN0ZXIoKVwiXSxcbi8vICAgICAgICAgICBbXCJjcmVhdGUgbnVtYmVyXCIsIFwibmV3IE51bWJlcigpXCJdLFxuLy8gICAgICAgICAgIFtcImNyZWF0ZSBpbnRlZ2VyXCIsIFwibmV3IEludGVnZXIoKVwiXSxcbi8vICAgICAgICAgICBbXCJjcmVhdGUgZGVjaW1hbFwiLCBcIm5ldyBEZWNpbWFsKClcIl0sXG4vLyAgICAgICAgICAgW1wiY3JlYXRlIGJvb2xlYW5cIiwgXCJuZXcgQm9vbGVhbigpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cblxuICB9LFxuXG5cbiAgLy8gRGVjbGFyZSBpbnN0YW5jZSBtZXRob2Qgb3Igbm9ybWFsIGZ1bmN0aW9uLlxuICAvLyBUT0RPOiBzdGF0aWMvZXRjXG4gIHtcbiAgICBuYW1lOiBcImRlY2xhcmVfbWV0aG9kXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwiKG9wZXJhdG9yOnRvfG9uKSB7bmFtZTppZGVudGlmaWVyfSB7YXJnc30/IChcXFxcOik/IHtzdGF0ZW1lbnR9P1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkZWNsYXJlX21ldGhvZCBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBvcGVyYXRvciwgbmFtZSwgYXJncyA9IFtdfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgbGV0IHN1YlR5cGUgPSAob3BlcmF0b3IgPT09IFwidG9cIiA/IFwibWV0aG9kXCIgOiBcImV2ZW50XCIpO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcImZ1bmN0aW9uXCIsIHN1YlR5cGUsIG5hbWUsIGFyZ3MgfTtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIGFyZ3MgPSBcIlwiLCBzdGF0ZW1lbnRzIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgJHtuYW1lfSgke2FyZ3N9KSAke3N0YXRlbWVudHN9YDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJzdGF0ZW1lbnRzXCIsXG4gICAgICAgIHNob3dBbGw6IHRydWUsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wib24gZm9vXCIsIFwiZm9vKCkge31cIl0sXG4gICAgICAgICAgW1widG8gZm9vXCIsIFwiZm9vKCkge31cIl0sXG4gICAgICAgICAgW1widG8gZm9vOlwiLCBcImZvbygpIHt9XCJdLFxuICAgICAgICAgIFtcInRvIGZvbyB3aXRoIGFcIiwgXCJmb28oYSkge31cIl0sXG4gICAgICAgICAgW1widG8gZm9vIHdpdGggYSwgYlwiLCBcImZvbyhhLCBiKSB7fVwiXSxcbiAgICAgICAgICBbXCJ0byBmb28gd2l0aCBhLGIsY1wiLCBcImZvbyhhLCBiLCBjKSB7fVwiXSxcbiAgICAgICAgICBbXCJ0byBmb28gYSA9IHllc1wiLCBcImZvbygpIHsgYSA9IHRydWUgfVwiXSxcbiAgICAgICAgICBbXCJ0byBmb286IGEgPSB5ZXNcIiwgXCJmb28oKSB7IGEgPSB0cnVlIH1cIl0sXG4gICAgICAgICAgW1widG8gZm9vIHdpdGggYTogYSA9IHllc1wiLCBcImZvbyhhKSB7IGEgPSB0cnVlIH1cIl0sXG4gICAgICAgICAgW1widG8gZm9vXFxuXFx0YSA9IHllc1wiLCBcImZvbygpIHtcXG5cXHRhID0gdHJ1ZVxcbn1cIl0sXG4gICAgICAgICAgW1widG8gZm9vIHdpdGggYSwgYlxcblxcdGEgPSB5ZXNcXG5cXHRiID0gbm9cIiwgXCJmb28oYSwgYikge1xcblxcdGEgPSB0cnVlXFxuXFx0YiA9IGZhbHNlXFxufVwiXSxcbiAgICAgICAgICBbXCJcIiwgXCJcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuXG4gIH0sXG5cbiAgLy8gRGVjbGFyZSBcImFjdGlvblwiLCB3aGljaCBjYW4gYmUgY2FsbGVkIGdsb2JhbGx5IGFuZCBhZmZlY3RzIHRoZSBwYXJzZXIuXG4gIC8vIFRPRE86IGB3aXRoYCBjbGF1c2UgKHdpbGwgY29uZmxpY3Qgd2l0aCBgd29yZGApXG4gIC8vIFRPRE86IGluc3RhbGwgaW4gcGFyc2VyIHNvbWVob3dcbiAgLy8gVE9ETzogY3JlYXRlIGluc3RhbmNlIGZ1bmN0aW9uPyAgb3IgbWF5YmUgd2UgZG9uJ3QgbmVlZCBpdDpcbiAgLy9cdFx0XHRgYWN0aW9uIHR1cm4gQ2FyZCBvdmVyYCBmb3IgYW4gaW5zdGFuY2UgaXMganVzdCBgdHVybiBtZSBvdmVyYFxuICAvL1x0XHRcdGBhY3Rpb24gYWRkIGNhcmQgdG8gZGVja2AgPT4gYGFkZCBtZSB0byBkZWNrYFxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJkZWNsYXJlX2FjdGlvblwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcImFjdGlvbiAoa2V5d29yZHM6e3dvcmR9fHt0eXBlfSkrIChcXFxcOik/IHtzdGF0ZW1lbnR9P1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkZWNsYXJlX2FjdGlvbiBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgLy8gQWRkIGBuYW1lYCwgYGFyZ3NgIGFuZCBgdHlwZXNgIHRvIG1hdGNoZWQgc291cmNlXG4gICAgICBnZXQgcmVzdWx0cygpIHtcbiAgICAgICAgbGV0IG91dHB1dCA9IHN1cGVyLnJlc3VsdHM7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUncyBvbmx5IG9uZSBrZXl3b3JkLCBpdCBjYW4ndCBiZSBhIGJsYWNrbGlzdGVkIGlkZW50aWZpZXIgb3IgYSB0eXBlXG4gICAgICAgIGxldCB7IGtleXdvcmRzIH0gPSBvdXRwdXQ7XG4gICAgICAgIGxldCBrZXl3b3JkTWF0Y2hlcyA9IHRoaXMucmVzdWx0cy5rZXl3b3Jkcy5tYXRjaGVkO1xuICAgICAgICBpZiAoa2V5d29yZHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgbGV0IGtleXdvcmQgPSBrZXl3b3Jkc1swXTtcbiAgICAgICAgICBpZiAoa2V5d29yZE1hdGNoZXNbMF0gaW5zdGFuY2VvZiBSdWxlLlR5cGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHBhcnNlKCdkZWNsYXJlX2FjdGlvbicpOiBvbmUtd29yZCBhY3Rpb25zIG1heSBub3QgYmUgdHlwZXM6ICR7a2V5d29yZH1gKTtcbiAgICAgICAgICB9XG5cbiAgLy8gSEFDSzogYGdsb2JhbC5wYXJzZXJgIGlzIGEgaGFjayBoZXJlIGZvciBjb252ZW5pZW5jZSBpbiB0ZXN0aW5nLi4uXG4vLyAgICAgICAgICAgbGV0IHBhcnNlciA9IChjb250ZXh0ICYmIGNvbnRleHQucGFyc2VyKSB8fCBnbG9iYWwucGFyc2VyO1xuLy8gICAgICAgICAgIGxldCBibGFja2xpc3QgPSBwYXJzZXIuZ2V0QmxhY2tsaXN0KFwiaWRlbnRpZmllclwiKTtcbi8vICAgICAgICAgICBpZiAoYmxhY2tsaXN0W2tleXdvcmRdKSB7XG4vLyAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBwYXJzZSgnZGVjbGFyZV9hY3Rpb24nKTogb25lLXdvcmQgYWN0aW9ucyBtYXkgbm90IGJlIGJsYWNrbGlzdGVkIGlkZW50aWZpZXJzXCI6ICR7a2V5d29yZH1gKTtcbi8vICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmaWd1cmUgb3V0IGFyZ3VtZW50cyBhbmQvb3IgdHlwZXNcbiAgICAgICAgb3V0cHV0LmFyZ3MgPSBbXTtcbiAgICAgICAgb3V0cHV0LnR5cGVzID0ge307XG5cbiAgICAgICAgLy8gaWYgYW55IG9mIHRoZSB3b3JkcyBhcmUgdHlwZXMgKGNhcGl0YWwgbGV0dGVyKSBtYWtlIHRoYXQgYW4gYXJndW1lbnQgb2YgdGhlIHNhbWUgbmFtZS5cbiAgICAgICAga2V5d29yZE1hdGNoZXMubWFwKCAoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIFJ1bGUuVHlwZSkge1xuICAgICAgICAgICAgbGV0IFR5cGUgPSBrZXl3b3Jkc1tpbmRleF07XG4gICAgICAgICAgICBsZXQgdHlwZSA9IFR5cGUudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgb3V0cHV0LnR5cGVzW3R5cGVdID0gVHlwZTtcbiAgICAgICAgICAgIG91dHB1dC5hcmdzLnB1c2godHlwZSk7XG5cbiAgICAgICAgICAgIC8vIHJlcGxhY2Ugd2l0aCBsb3dlcmNhc2UgaW4gbWV0aG9kIG5hbWVcbiAgICAgICAgICAgIGtleXdvcmRzW2luZGV4XSA9IHR5cGU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gZ2V0IHN0YXRpYyBtZXRob2QgbmFtZSBhbmQgYXJndW1lbnRzIGZvciBvdXRwdXRcbiAgICAgICAgb3V0cHV0Lm5hbWUgPSBrZXl3b3Jkcy5qb2luKFwiX1wiKTtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIGFyZ3MgPSBbXSwgdHlwZXMsIHN0YXRlbWVudCwgYmxvY2sgfSA9IHRoaXMucmVzdWx0cztcblxuICAgICAgICAvLyBmaWd1cmUgb3V0IGlmIHRoZXJlIGFyZSBhbnkgY29uZGl0aW9ucyBkdWUgdG8ga25vd24gYXJndW1lbnQgdHlwZXNcbiAgICAgICAgbGV0IGNvbmRpdGlvbnMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgYXJnIGluIHR5cGVzKSB7XG4gICAgICAgICAgY29uZGl0aW9ucy5wdXNoKGBcXHRpZiAoIXNwZWxsLmlzQSgke2FyZ30sICR7dHlwZXNbYXJnXX0pKSByZXR1cm4gdW5kZWZpbmVkYCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3RhdGVtZW50cyA9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoY29uZGl0aW9ucywgc3RhdGVtZW50LCBibG9jayk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFzIGEgU1RBVElDIGZ1bmN0aW9uXG4gICAgLy9UT0RPOiBjcmVhdGUgYXMgYW4gaW5zdGFuY2UgZnVuY3Rpb24gd2UgY2FuIGNhbGwgb24gb3Vyc2VsZiFcbiAgICAgICAgcmV0dXJuIGBzdGF0aWMgJHtuYW1lfSgke2FyZ3Muam9pbihcIiwgXCIpfSkgJHtzdGF0ZW1lbnRzfWA7XG4gICAgICB9XG5cbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBuYW1lLCBhcmdzLCB0eXBlcyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcImZ1bmN0aW9uXCIsIHN1YlR5cGU6IFwiYWN0aW9uXCIsIG5hbWUsIGFyZ3MsIHR5cGVzIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBHZXR0ZXIgZWl0aGVyIHdpdGggb3Igd2l0aG91dCBhcmd1bWVudHMuXG4gIC8vIElmIHlvdSBzcGVjaWZ5IGFyZ3VtZW50cywgeWllbGRzIGEgbm9ybWFsIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSB2YWx1ZS5cbiAgLy8gVE9ETzogYHRvIGdldC4uLmAgP1xuICB7XG4gICAgbmFtZTogXCJnZXR0ZXJcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJnZXQge25hbWU6aWRlbnRpZmllcn1cXFxcOiB7ZXhwcmVzc2lvbn0/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGdldHRlciBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIGV4cHJlc3Npb24sIGJsb2NrIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIC8vIElmIHRoZXkgc3BlY2lmaWVkIGFuIGlubGluZS1leHByZXNzaW9uLCBwcmVwZW5kIHJldHVyblxuICAgICAgICBpZiAoZXhwcmVzc2lvbiAmJiAhZXhwcmVzc2lvbi5zdGFydHNXaXRoKFwicmV0dXJuIFwiKSkgZXhwcmVzc2lvbiA9IGByZXR1cm4gKCR7ZXhwcmVzc2lvbn0pYDtcbiAgICAgICAgbGV0IG91dHB1dCA9IGBnZXQgJHtuYW1lfSgpIGA7XG4gICAgICAgIG91dHB1dCArPSBSdWxlLkJsb2NrLmVuY2xvc2VTdGF0ZW1lbnRzKGV4cHJlc3Npb24sIGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBuYW1lIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IFwicHJvcGVydHlcIiwgc3ViVHlwZTogXCJnZXR0ZXJcIiwgbmFtZSB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFNldHRlci5cbiAgLy8gQ29tcGxhaW5zIGlmIHlvdSBzcGVjaWZ5IG1vcmUgdGhhbiBvbmUgYXJndW1lbnQuXG4gIC8vIElmIHlvdSBkb24ndCBwYXNzIGFuIGV4cGxpY2l0IGFyZ3VtZW50LCB3ZSdsbCBhc3N1bWUgaXQncyB0aGUgc2FtZSBhcyB0aGUgaWRlbnRpZmllci5cbiAgLy8gZWc7XHRgc2V0IGNvbG9yOiBzZXQgdGhlIGNvbG9yIG9mIG15IHRleHQgdG8gY29sb3JgXG4gIC8vXG4gIC8vIFRPRE86IGludGVybmFsIGdldHRlci9zZXR0ZXIgc2VtYW50aWNzIGFsYSBvYmplY3RpdmUgQ1xuICAvL1x0XHRcdGBzZXQgY29sb3I6IGlmIGNvbG9yIGlzIGluIFtcInJlZFwiLCBcImJsdWVcIl0gdGhlbiBzZXQgbXkgY29sb3IgdG8gY29sb3JgXG4gIC8vXHRcdCA9PiBgbXkgY29sb3JgIHdpdGhpbiBzZXR0ZXIgc2hvdWxkIGF1dG9tYXRpY2FsbHkgdHJhbnNsYXRlIHRvIGB0aGlzLl9jb2xvcmAgPz8/XG4gIC8vIFRPRE86IGB0byBzZXQuLi5gID9cbiAge1xuICAgIG5hbWU6IFwic2V0dGVyXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwic2V0IHtuYW1lOmlkZW50aWZpZXJ9IHthcmdzfT8gKFxcXFw6KT8ge3N0YXRlbWVudH0/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHNldHRlciBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIC8vIGRlZmF1bHQgYXJncyB0byB0aGUgc2V0dGVyIG5hbWVcbiAgICAgICAgbGV0IHsgbmFtZSwgYXJncyA9IFtuYW1lXSwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICAvLyBDb21wbGFpbiBpZiBtb3JlIHRoYW4gb25lIGFyZ3VtZW50XG4gICAgICAgIGlmIChhcmdzICYmIGFyZ3MubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcInBhcnNlKCdzZXR0ZXInKTogb25seSBvbmUgYXJndW1lbnQgYWxsb3dlZCBpbiBzZXR0ZXI6ICBcIiwgdGhpcy5tYXRjaGVkVGV4dCk7XG4gICAgICAgICAgYXJncyA9IFsgYXJnc1swXSBdO1xuICAgICAgICB9XG4gICAgICAgIGxldCBvdXRwdXQgPSBgc2V0ICR7bmFtZX0oJHthcmdzfSkgYDtcbiAgICAgICAgb3V0cHV0ICs9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoc3RhdGVtZW50LCBibG9jayk7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlXG4gICAgICB0b1N0cnVjdHVyZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcInByb3BlcnR5XCIsIHN1YlR5cGU6IFwic2V0dGVyXCIsIG5hbWUgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vXG4gIC8vXHRkZWNsYXJlIHByb3BlcnRpZXNcbiAgLy9cblxuICAvL1RPRE86IGFub3RoZXIgbmFtZSBmb3IgYGNvbnN0YW50YCA/XG4gIHtcbiAgICBuYW1lOiBcImRlY2xhcmVfcHJvcGVydHlcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCIoc2NvcGU6cHJvcGVydHl8Y29uc3RhbnR8c2hhcmVkIHByb3BlcnR5KSB7bmFtZTppZGVudGlmaWVyfSAoPzo9IHt2YWx1ZTpleHByZXNzaW9ufSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRlY2xhcmVfcHJvcGVydHkgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBzY29wZSwgbmFtZSwgdmFsdWUgPSBcIlwiIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIGlmICh2YWx1ZSkgdmFsdWUgPSBgID0gJHt2YWx1ZX1gO1xuXG4gICAgICAgIGxldCBkZWNsYXJhdGlvbiA9IGAke25hbWV9JHt2YWx1ZX1gO1xuICAgICAgICBzd2l0Y2ggKHNjb3BlKSB7XG4gICAgICAgICAgY2FzZSBcImNvbnN0YW50XCI6XG4vLyAgICAgICAgICAgIGlmICghdmFsdWUpIGNvbnNvbGUud2FybihcInBhcnNlKCdkZWNsYXJlX3Byb3BlcnR5Jyk6IGNvbnN0YW50IHByb3BlcnRpZXMgbXVzdCBkZWNsYXJlIGEgdmFsdWU6ICBcIiwgdGhpcy5tYXRjaGVkVGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gYGNvbnN0ICR7ZGVjbGFyYXRpb259YDtcblxuICAgICAgICAgIGNhc2UgXCJzaGFyZWQgcHJvcGVydHlcIjpcbiAgICAgICAgICAgIHJldHVybiBgQHByb3RvICR7ZGVjbGFyYXRpb259YDtcblxuICAgICAgICAgIGNhc2UgXCJwcm9wZXJ0eVwiOlxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZGVjbGFyYXRpb247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBzY29wZSwgbmFtZSB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcInByb3BlcnR5XCIsIG5hbWUsIHNjb3BlIH07XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFRPRE86IHNjb3BlX21vZGlmaWVyPz8/XG4gIC8vIFRPRE86IGluaXRpYWwgdmFsdWVcbiAge1xuICAgIG5hbWU6IFwiZGVjbGFyZV9wcm9wZXJ0eV9vZl90eXBlXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwicHJvcGVydHkge25hbWU6aWRlbnRpZmllcn0gYXMgKGF8YW4pPyB7dHlwZX1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVjbGFyZV9wcm9wZXJ0eV9vZl90eXBlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgdHlwZSB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYGdldCAke25hbWV9KCkgeyByZXR1cm4gdGhpcy5fXyR7bmFtZX0gfVxcbmBcbiAgICAgICAgICAgKyBgc2V0ICR7bmFtZX0odmFsdWUpIHsgaWYgKHNwZWxsLmlzQSh2YWx1ZSwgJHt0eXBlfSkgdGhpcy5fXyR7bmFtZX0gPSB2YWx1ZSB9YDtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBuYW1lLCB0eXBlIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IFwicHJvcGVydHlcIiwgc3ViVHlwZTogXCJzZXR0ZXJcIiwgbmFtZSwgZGF0YVR5cGU6IHR5cGUgfTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBUT0RPOiB3YXJuIG9uIGludmFsaWQgc2V0PyAgc2hhcmVkPyAgdW5kZWZpbmVkPyBzb21ldGhpbmcgb3RoZXIgdGhhbiB0aGUgZmlyc3QgdmFsdWUgYXMgZGVmYXVsdD9cbiAge1xuICAgIG5hbWU6IFwiZGVjbGFyZV9wcm9wZXJ0eV9hc19vbmVfb2ZcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJwcm9wZXJ0eSB7bmFtZTppZGVudGlmaWVyfSBhcyBvbmUgb2Yge2xpc3Q6bGl0ZXJhbF9saXN0fVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkZWNsYXJlX3Byb3BlcnR5X2FzX29uZV9vZiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgZ2V0IHJlc3VsdHMoKSB7XG4gICAgICAgIGxldCByZXN1bHRzID0gc3VwZXIucmVzdWx0cztcbiAgICAgICAgcmVzdWx0cy5wbHVyYWwgPSBwbHVyYWxpemUocmVzdWx0cy5uYW1lKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBuYW1lLCBwbHVyYWwsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBAcHJvdG8gJHtwbHVyYWx9ID0gJHtsaXN0fVxcbmBcbiAgICAgICAgICAgKyBgZ2V0ICR7bmFtZX0oKSB7IHJldHVybiB0aGlzLl9fJHtuYW1lfSA9PT0gdW5kZWZpbmVkID8gdGhpcy4ke3BsdXJhbH1bMF0gOiB0aGlzLl9fJHtuYW1lfSB9XFxuYFxuICAgICAgICAgICArIGBzZXQgJHtuYW1lfSh2YWx1ZSkgeyBpZiAodGhpcy4ke3BsdXJhbH0uaW5jbHVkZXModmFsdWUpKSB0aGlzLl9fJHtuYW1lfSA9IHZhbHVlIH1gO1xuXG4gIC8vIE1PUkUgRUZGSUNJRU5UIEJVVCBVR0xJRVJcbiAgLy8gXHRcdFx0cmV0dXJuIGBzdGF0aWMgJHtwbHVyYWx9ID0gJHtsaXN0fTtcXG5gXG4gIC8vIFx0XHRcdFx0ICsgYGdldCAke25hbWV9IHsgcmV0dXJuIChcIl9fJHtuYW1lfVwiIGluIHRoaXMgPyB0aGlzLl9fJHtuYW1lfSA6ICR7Zmlyc3RWYWx1ZX0pIH1cXG5gXG4gIC8vIFx0XHRcdFx0ICsgYHNldCAke25hbWV9KHZhbHVlKSB7IGlmICh0aGlzLmNvbnN0cnVjdG9yLiR7cGx1cmFsfS5pbmNsdWRlcyh2YWx1ZSkpIHRoaXMuX18ke25hbWV9ID0gdmFsdWUgfWA7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlXG4gICAgICB0b1N0cnVjdHVyZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgcGx1cmFsIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgeyB0eXBlOiBcInByb3BlcnR5XCIsIG5hbWUgfSxcbiAgICAgICAgICB7IHR5cGU6IFwicHJvcGVydHlcIiwgc3ViVHlwZTogXCJzaGFyZWRcIiwgbmFtZTogcGx1cmFsIH1cbiAgICAgICAgXTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvL1xuICAvL1x0U2VsZi1yZWZlcmVuY2VcbiAgLy9cbiAge1xuICAgIG5hbWU6IFwibWVcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIm1lXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG1lIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIFwidGhpc1wiO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBUT0RPOiB0aGlzIHJlYWxseSBtYWtlcyBtZSB3YW50IHRvIG1ha2UgYEkgYW0gZW1wdHlgIGV0YyB3b3JrLi4uXG4gIHtcbiAgICBuYW1lOiBcIklcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIklcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgSSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiBcInRoaXNcIjtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvL1xuICAvL1x0UHJvcGVydHkgYWNjZXNzXG4gIC8vXG5cbiAge1xuICAgIG5hbWU6IFwicHJvcGVydHlfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiKHByb3BlcnRpZXM6dGhlIHtpZGVudGlmaWVyfSBvZikrIHRoZT8ge2V4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHByb3BlcnR5X2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIGdldCByZXN1bHRzKCkge1xuICAgICAgICBsZXQgeyBleHByZXNzaW9uLCBwcm9wZXJ0aWVzXywgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBwcm9wZXJ0aWVzOiBfcHJvcGVydGllcy5tYXRjaGVkLm1hcCggcHJvcGVydHkgPT4gcHJvcGVydHkucmVzdWx0cy5pZGVudGlmaWVyIClcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGV4cHJlc3Npb24sIHByb3BlcnRpZXMgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcHJvcGVydGllcyA9IHByb3BlcnRpZXMucmV2ZXJzZSgpLmpvaW4oXCIuXCIpO1xuICAgICAgICByZXR1cm4gYCR7ZXhwcmVzc2lvbn0uJHtwcm9wZXJ0aWVzfWA7XG4gIC8vIE5PVEU6IHRoZSBmb2xsb3dpbmcgaXMgc2FmZXIsIGJ1dCB1Z2x5IGZvciBkZW1vIHB1cnBvc2VzXG4gIC8vXHRcdFx0cmV0dXJuIGBzcGVsbC5nZXQoJHtleHByZXNzaW9ufSwgWycke3Byb3BlcnRpZXN9J10pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwibXlfcHJvcGVydHlfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiKG15fHRoaXMpIHtpZGVudGlmaWVyfVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBteV9wcm9wZXJ0eV9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgaWRlbnRpZmllciB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHRoaXMuJHtpZGVudGlmaWVyfWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ydWxlcy9zcGVsbC90eXBlcy5qcyIsInJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN5bWJvbCcpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL19jb3JlJykuU3ltYm9sO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvZXM2L3N5bWJvbC5qc1xuLy8gbW9kdWxlIGlkID0gNTAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICh0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJykgdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2EtZnVuY3Rpb24uanNcbi8vIG1vZHVsZSBpZCA9IDU0N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBmYWxzZSAtPiBBcnJheSNpbmRleE9mXG4vLyB0cnVlICAtPiBBcnJheSNpbmNsdWRlc1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpO1xudmFyIHRvQWJzb2x1dGVJbmRleCA9IHJlcXVpcmUoJy4vX3RvLWFic29sdXRlLWluZGV4Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChJU19JTkNMVURFUykge1xuICByZXR1cm4gZnVuY3Rpb24gKCR0aGlzLCBlbCwgZnJvbUluZGV4KSB7XG4gICAgdmFyIE8gPSB0b0lPYmplY3QoJHRoaXMpO1xuICAgIHZhciBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgdmFyIGluZGV4ID0gdG9BYnNvbHV0ZUluZGV4KGZyb21JbmRleCwgbGVuZ3RoKTtcbiAgICB2YXIgdmFsdWU7XG4gICAgLy8gQXJyYXkjaW5jbHVkZXMgdXNlcyBTYW1lVmFsdWVaZXJvIGVxdWFsaXR5IGFsZ29yaXRobVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICBpZiAoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpIHdoaWxlIChsZW5ndGggPiBpbmRleCkge1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgaWYgKHZhbHVlICE9IHZhbHVlKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBBcnJheSNpbmRleE9mIGlnbm9yZXMgaG9sZXMsIEFycmF5I2luY2x1ZGVzIC0gbm90XG4gICAgfSBlbHNlIGZvciAoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKSBpZiAoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTykge1xuICAgICAgaWYgKE9baW5kZXhdID09PSBlbCkgcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4IHx8IDA7XG4gICAgfSByZXR1cm4gIUlTX0lOQ0xVREVTICYmIC0xO1xuICB9O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2FycmF5LWluY2x1ZGVzLmpzXG4vLyBtb2R1bGUgaWQgPSA1NDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gZ2V0dGluZyB0YWcgZnJvbSAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbnZhciBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcbi8vIEVTMyB3cm9uZyBoZXJlXG52YXIgQVJHID0gY29mKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnQXJndW1lbnRzJztcblxuLy8gZmFsbGJhY2sgZm9yIElFMTEgU2NyaXB0IEFjY2VzcyBEZW5pZWQgZXJyb3JcbnZhciB0cnlHZXQgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICB0cnkge1xuICAgIHJldHVybiBpdFtrZXldO1xuICB9IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHZhciBPLCBULCBCO1xuICByZXR1cm4gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogaXQgPT09IG51bGwgPyAnTnVsbCdcbiAgICAvLyBAQHRvU3RyaW5nVGFnIGNhc2VcbiAgICA6IHR5cGVvZiAoVCA9IHRyeUdldChPID0gT2JqZWN0KGl0KSwgVEFHKSkgPT0gJ3N0cmluZycgPyBUXG4gICAgLy8gYnVpbHRpblRhZyBjYXNlXG4gICAgOiBBUkcgPyBjb2YoTylcbiAgICAvLyBFUzMgYXJndW1lbnRzIGZhbGxiYWNrXG4gICAgOiAoQiA9IGNvZihPKSkgPT0gJ09iamVjdCcgJiYgdHlwZW9mIE8uY2FsbGVlID09ICdmdW5jdGlvbicgPyAnQXJndW1lbnRzJyA6IEI7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fY2xhc3NvZi5qc1xuLy8gbW9kdWxlIGlkID0gNTQ5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuLCB0aGF0LCBsZW5ndGgpIHtcbiAgYUZ1bmN0aW9uKGZuKTtcbiAgaWYgKHRoYXQgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZuO1xuICBzd2l0Y2ggKGxlbmd0aCkge1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uIChhKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiAoLyogLi4uYXJncyAqLykge1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2N0eC5qc1xuLy8gbW9kdWxlIGlkID0gNTUwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDcuMi4xIFJlcXVpcmVPYmplY3RDb2VyY2libGUoYXJndW1lbnQpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoaXQgPT0gdW5kZWZpbmVkKSB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzXG4vLyBtb2R1bGUgaWQgPSA1NTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gYWxsIGVudW1lcmFibGUgb2JqZWN0IGtleXMsIGluY2x1ZGVzIHN5bWJvbHNcbnZhciBnZXRLZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcbnZhciBnT1BTID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcHMnKTtcbnZhciBwSUUgPSByZXF1aXJlKCcuL19vYmplY3QtcGllJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgcmVzdWx0ID0gZ2V0S2V5cyhpdCk7XG4gIHZhciBnZXRTeW1ib2xzID0gZ09QUy5mO1xuICBpZiAoZ2V0U3ltYm9scykge1xuICAgIHZhciBzeW1ib2xzID0gZ2V0U3ltYm9scyhpdCk7XG4gICAgdmFyIGlzRW51bSA9IHBJRS5mO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIga2V5O1xuICAgIHdoaWxlIChzeW1ib2xzLmxlbmd0aCA+IGkpIGlmIChpc0VudW0uY2FsbChpdCwga2V5ID0gc3ltYm9sc1tpKytdKSkgcmVzdWx0LnB1c2goa2V5KTtcbiAgfSByZXR1cm4gcmVzdWx0O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2VudW0ta2V5cy5qc1xuLy8gbW9kdWxlIGlkID0gNTUyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuL19yZWRlZmluZScpO1xudmFyIGN0eCA9IHJlcXVpcmUoJy4vX2N0eCcpO1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG52YXIgJGV4cG9ydCA9IGZ1bmN0aW9uICh0eXBlLCBuYW1lLCBzb3VyY2UpIHtcbiAgdmFyIElTX0ZPUkNFRCA9IHR5cGUgJiAkZXhwb3J0LkY7XG4gIHZhciBJU19HTE9CQUwgPSB0eXBlICYgJGV4cG9ydC5HO1xuICB2YXIgSVNfU1RBVElDID0gdHlwZSAmICRleHBvcnQuUztcbiAgdmFyIElTX1BST1RPID0gdHlwZSAmICRleHBvcnQuUDtcbiAgdmFyIElTX0JJTkQgPSB0eXBlICYgJGV4cG9ydC5CO1xuICB2YXIgdGFyZ2V0ID0gSVNfR0xPQkFMID8gZ2xvYmFsIDogSVNfU1RBVElDID8gZ2xvYmFsW25hbWVdIHx8IChnbG9iYWxbbmFtZV0gPSB7fSkgOiAoZ2xvYmFsW25hbWVdIHx8IHt9KVtQUk9UT1RZUEVdO1xuICB2YXIgZXhwb3J0cyA9IElTX0dMT0JBTCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pO1xuICB2YXIgZXhwUHJvdG8gPSBleHBvcnRzW1BST1RPVFlQRV0gfHwgKGV4cG9ydHNbUFJPVE9UWVBFXSA9IHt9KTtcbiAgdmFyIGtleSwgb3duLCBvdXQsIGV4cDtcbiAgaWYgKElTX0dMT0JBTCkgc291cmNlID0gbmFtZTtcbiAgZm9yIChrZXkgaW4gc291cmNlKSB7XG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXG4gICAgb3duID0gIUlTX0ZPUkNFRCAmJiB0YXJnZXQgJiYgdGFyZ2V0W2tleV0gIT09IHVuZGVmaW5lZDtcbiAgICAvLyBleHBvcnQgbmF0aXZlIG9yIHBhc3NlZFxuICAgIG91dCA9IChvd24gPyB0YXJnZXQgOiBzb3VyY2UpW2tleV07XG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICBleHAgPSBJU19CSU5EICYmIG93biA/IGN0eChvdXQsIGdsb2JhbCkgOiBJU19QUk9UTyAmJiB0eXBlb2Ygb3V0ID09ICdmdW5jdGlvbicgPyBjdHgoRnVuY3Rpb24uY2FsbCwgb3V0KSA6IG91dDtcbiAgICAvLyBleHRlbmQgZ2xvYmFsXG4gICAgaWYgKHRhcmdldCkgcmVkZWZpbmUodGFyZ2V0LCBrZXksIG91dCwgdHlwZSAmICRleHBvcnQuVSk7XG4gICAgLy8gZXhwb3J0XG4gICAgaWYgKGV4cG9ydHNba2V5XSAhPSBvdXQpIGhpZGUoZXhwb3J0cywga2V5LCBleHApO1xuICAgIGlmIChJU19QUk9UTyAmJiBleHBQcm90b1trZXldICE9IG91dCkgZXhwUHJvdG9ba2V5XSA9IG91dDtcbiAgfVxufTtcbmdsb2JhbC5jb3JlID0gY29yZTtcbi8vIHR5cGUgYml0bWFwXG4kZXhwb3J0LkYgPSAxOyAgIC8vIGZvcmNlZFxuJGV4cG9ydC5HID0gMjsgICAvLyBnbG9iYWxcbiRleHBvcnQuUyA9IDQ7ICAgLy8gc3RhdGljXG4kZXhwb3J0LlAgPSA4OyAgIC8vIHByb3RvXG4kZXhwb3J0LkIgPSAxNjsgIC8vIGJpbmRcbiRleHBvcnQuVyA9IDMyOyAgLy8gd3JhcFxuJGV4cG9ydC5VID0gNjQ7ICAvLyBzYWZlXG4kZXhwb3J0LlIgPSAxMjg7IC8vIHJlYWwgcHJvdG8gbWV0aG9kIGZvciBgbGlicmFyeWBcbm1vZHVsZS5leHBvcnRzID0gJGV4cG9ydDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qc1xuLy8gbW9kdWxlIGlkID0gNTUzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkb2N1bWVudCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50O1xubW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19odG1sLmpzXG4vLyBtb2R1bGUgaWQgPSA1NTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3NcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0KCd6JykucHJvcGVydHlJc0VudW1lcmFibGUoMCkgPyBPYmplY3QgOiBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2lvYmplY3QuanNcbi8vIG1vZHVsZSBpZCA9IDU1NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyA3LjIuMiBJc0FycmF5KGFyZ3VtZW50KVxudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIGlzQXJyYXkoYXJnKSB7XG4gIHJldHVybiBjb2YoYXJnKSA9PSAnQXJyYXknO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2lzLWFycmF5LmpzXG4vLyBtb2R1bGUgaWQgPSA1NTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIE1FVEEgPSByZXF1aXJlKCcuL191aWQnKSgnbWV0YScpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgc2V0RGVzYyA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmY7XG52YXIgaWQgPSAwO1xudmFyIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdHJ1ZTtcbn07XG52YXIgRlJFRVpFID0gIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gaXNFeHRlbnNpYmxlKE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyh7fSkpO1xufSk7XG52YXIgc2V0TWV0YSA9IGZ1bmN0aW9uIChpdCkge1xuICBzZXREZXNjKGl0LCBNRVRBLCB7IHZhbHVlOiB7XG4gICAgaTogJ08nICsgKytpZCwgLy8gb2JqZWN0IElEXG4gICAgdzoge30gICAgICAgICAgLy8gd2VhayBjb2xsZWN0aW9ucyBJRHNcbiAgfSB9KTtcbn07XG52YXIgZmFzdEtleSA9IGZ1bmN0aW9uIChpdCwgY3JlYXRlKSB7XG4gIC8vIHJldHVybiBwcmltaXRpdmUgd2l0aCBwcmVmaXhcbiAgaWYgKCFpc09iamVjdChpdCkpIHJldHVybiB0eXBlb2YgaXQgPT0gJ3N5bWJvbCcgPyBpdCA6ICh0eXBlb2YgaXQgPT0gJ3N0cmluZycgPyAnUycgOiAnUCcpICsgaXQ7XG4gIGlmICghaGFzKGl0LCBNRVRBKSkge1xuICAgIC8vIGNhbid0IHNldCBtZXRhZGF0YSB0byB1bmNhdWdodCBmcm96ZW4gb2JqZWN0XG4gICAgaWYgKCFpc0V4dGVuc2libGUoaXQpKSByZXR1cm4gJ0YnO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIG1ldGFkYXRhXG4gICAgaWYgKCFjcmVhdGUpIHJldHVybiAnRSc7XG4gICAgLy8gYWRkIG1pc3NpbmcgbWV0YWRhdGFcbiAgICBzZXRNZXRhKGl0KTtcbiAgLy8gcmV0dXJuIG9iamVjdCBJRFxuICB9IHJldHVybiBpdFtNRVRBXS5pO1xufTtcbnZhciBnZXRXZWFrID0gZnVuY3Rpb24gKGl0LCBjcmVhdGUpIHtcbiAgaWYgKCFoYXMoaXQsIE1FVEEpKSB7XG4gICAgLy8gY2FuJ3Qgc2V0IG1ldGFkYXRhIHRvIHVuY2F1Z2h0IGZyb3plbiBvYmplY3RcbiAgICBpZiAoIWlzRXh0ZW5zaWJsZShpdCkpIHJldHVybiB0cnVlO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIG1ldGFkYXRhXG4gICAgaWYgKCFjcmVhdGUpIHJldHVybiBmYWxzZTtcbiAgICAvLyBhZGQgbWlzc2luZyBtZXRhZGF0YVxuICAgIHNldE1ldGEoaXQpO1xuICAvLyByZXR1cm4gaGFzaCB3ZWFrIGNvbGxlY3Rpb25zIElEc1xuICB9IHJldHVybiBpdFtNRVRBXS53O1xufTtcbi8vIGFkZCBtZXRhZGF0YSBvbiBmcmVlemUtZmFtaWx5IG1ldGhvZHMgY2FsbGluZ1xudmFyIG9uRnJlZXplID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmIChGUkVFWkUgJiYgbWV0YS5ORUVEICYmIGlzRXh0ZW5zaWJsZShpdCkgJiYgIWhhcyhpdCwgTUVUQSkpIHNldE1ldGEoaXQpO1xuICByZXR1cm4gaXQ7XG59O1xudmFyIG1ldGEgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgS0VZOiBNRVRBLFxuICBORUVEOiBmYWxzZSxcbiAgZmFzdEtleTogZmFzdEtleSxcbiAgZ2V0V2VhazogZ2V0V2VhayxcbiAgb25GcmVlemU6IG9uRnJlZXplXG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fbWV0YS5qc1xuLy8gbW9kdWxlIGlkID0gNTU3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgZFBzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwcycpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpO1xudmFyIElFX1BST1RPID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpO1xudmFyIEVtcHR5ID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggZmFrZSBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXG52YXIgY3JlYXRlRGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gVGhyYXNoLCB3YXN0ZSBhbmQgc29kb215OiBJRSBHQyBidWdcbiAgdmFyIGlmcmFtZSA9IHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnaWZyYW1lJyk7XG4gIHZhciBpID0gZW51bUJ1Z0tleXMubGVuZ3RoO1xuICB2YXIgbHQgPSAnPCc7XG4gIHZhciBndCA9ICc+JztcbiAgdmFyIGlmcmFtZURvY3VtZW50O1xuICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgcmVxdWlyZSgnLi9faHRtbCcpLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZS5zcmMgPSAnamF2YXNjcmlwdDonOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNjcmlwdC11cmxcbiAgLy8gY3JlYXRlRGljdCA9IGlmcmFtZS5jb250ZW50V2luZG93Lk9iamVjdDtcbiAgLy8gaHRtbC5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICBpZnJhbWVEb2N1bWVudCA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICBpZnJhbWVEb2N1bWVudC5vcGVuKCk7XG4gIGlmcmFtZURvY3VtZW50LndyaXRlKGx0ICsgJ3NjcmlwdCcgKyBndCArICdkb2N1bWVudC5GPU9iamVjdCcgKyBsdCArICcvc2NyaXB0JyArIGd0KTtcbiAgaWZyYW1lRG9jdW1lbnQuY2xvc2UoKTtcbiAgY3JlYXRlRGljdCA9IGlmcmFtZURvY3VtZW50LkY7XG4gIHdoaWxlIChpLS0pIGRlbGV0ZSBjcmVhdGVEaWN0W1BST1RPVFlQRV1bZW51bUJ1Z0tleXNbaV1dO1xuICByZXR1cm4gY3JlYXRlRGljdCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIGNyZWF0ZShPLCBQcm9wZXJ0aWVzKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmIChPICE9PSBudWxsKSB7XG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IGFuT2JqZWN0KE8pO1xuICAgIHJlc3VsdCA9IG5ldyBFbXB0eSgpO1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBudWxsO1xuICAgIC8vIGFkZCBcIl9fcHJvdG9fX1wiIGZvciBPYmplY3QuZ2V0UHJvdG90eXBlT2YgcG9seWZpbGxcbiAgICByZXN1bHRbSUVfUFJPVE9dID0gTztcbiAgfSBlbHNlIHJlc3VsdCA9IGNyZWF0ZURpY3QoKTtcbiAgcmV0dXJuIFByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IGRQcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1jcmVhdGUuanNcbi8vIG1vZHVsZSBpZCA9IDU1OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGdldEtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcykge1xuICBhbk9iamVjdChPKTtcbiAgdmFyIGtleXMgPSBnZXRLZXlzKFByb3BlcnRpZXMpO1xuICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gIHZhciBpID0gMDtcbiAgdmFyIFA7XG4gIHdoaWxlIChsZW5ndGggPiBpKSBkUC5mKE8sIFAgPSBrZXlzW2krK10sIFByb3BlcnRpZXNbUF0pO1xuICByZXR1cm4gTztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHBzLmpzXG4vLyBtb2R1bGUgaWQgPSA1NTlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIHBJRSA9IHJlcXVpcmUoJy4vX29iamVjdC1waWUnKTtcbnZhciBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKTtcbnZhciBnT1BEID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGdPUEQgOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUCkge1xuICBPID0gdG9JT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gZ09QRChPLCBQKTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG4gIGlmIChoYXMoTywgUCkpIHJldHVybiBjcmVhdGVEZXNjKCFwSUUuZi5jYWxsKE8sIFApLCBPW1BdKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wZC5qc1xuLy8gbW9kdWxlIGlkID0gNTYwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGZhbGxiYWNrIGZvciBJRTExIGJ1Z2d5IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHdpdGggaWZyYW1lIGFuZCB3aW5kb3dcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgZ09QTiA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BuJykuZjtcbnZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG52YXIgd2luZG93TmFtZXMgPSB0eXBlb2Ygd2luZG93ID09ICdvYmplY3QnICYmIHdpbmRvdyAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc1xuICA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHdpbmRvdykgOiBbXTtcblxudmFyIGdldFdpbmRvd05hbWVzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGdPUE4oaXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHdpbmRvd05hbWVzLnNsaWNlKCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLmYgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KSB7XG4gIHJldHVybiB3aW5kb3dOYW1lcyAmJiB0b1N0cmluZy5jYWxsKGl0KSA9PSAnW29iamVjdCBXaW5kb3ddJyA/IGdldFdpbmRvd05hbWVzKGl0KSA6IGdPUE4odG9JT2JqZWN0KGl0KSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcG4tZXh0LmpzXG4vLyBtb2R1bGUgaWQgPSA1NjFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRlZiA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmY7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCB0YWcsIHN0YXQpIHtcbiAgaWYgKGl0ICYmICFoYXMoaXQgPSBzdGF0ID8gaXQgOiBpdC5wcm90b3R5cGUsIFRBRykpIGRlZihpdCwgVEFHLCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHRhZyB9KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19zZXQtdG8tc3RyaW5nLXRhZy5qc1xuLy8gbW9kdWxlIGlkID0gNTYyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJyk7XG52YXIgbWF4ID0gTWF0aC5tYXg7XG52YXIgbWluID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbmRleCwgbGVuZ3RoKSB7XG4gIGluZGV4ID0gdG9JbnRlZ2VyKGluZGV4KTtcbiAgcmV0dXJuIGluZGV4IDwgMCA/IG1heChpbmRleCArIGxlbmd0aCwgMCkgOiBtaW4oaW5kZXgsIGxlbmd0aCk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tYWJzb2x1dGUtaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDU2M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyA3LjEuMTUgVG9MZW5ndGhcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJyk7XG52YXIgbWluID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3RvLWxlbmd0aC5qc1xuLy8gbW9kdWxlIGlkID0gNTY0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIExJQlJBUlkgPSByZXF1aXJlKCcuL19saWJyYXJ5Jyk7XG52YXIgd2tzRXh0ID0gcmVxdWlyZSgnLi9fd2tzLWV4dCcpO1xudmFyIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgdmFyICRTeW1ib2wgPSBjb3JlLlN5bWJvbCB8fCAoY29yZS5TeW1ib2wgPSBMSUJSQVJZID8ge30gOiBnbG9iYWwuU3ltYm9sIHx8IHt9KTtcbiAgaWYgKG5hbWUuY2hhckF0KDApICE9ICdfJyAmJiAhKG5hbWUgaW4gJFN5bWJvbCkpIGRlZmluZVByb3BlcnR5KCRTeW1ib2wsIG5hbWUsIHsgdmFsdWU6IHdrc0V4dC5mKG5hbWUpIH0pO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3drcy1kZWZpbmUuanNcbi8vIG1vZHVsZSBpZCA9IDU2NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG4vLyAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjbGFzc29mID0gcmVxdWlyZSgnLi9fY2xhc3NvZicpO1xudmFyIHRlc3QgPSB7fTtcbnRlc3RbcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyldID0gJ3onO1xuaWYgKHRlc3QgKyAnJyAhPSAnW29iamVjdCB6XScpIHtcbiAgcmVxdWlyZSgnLi9fcmVkZWZpbmUnKShPYmplY3QucHJvdG90eXBlLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gJ1tvYmplY3QgJyArIGNsYXNzb2YodGhpcykgKyAnXSc7XG4gIH0sIHRydWUpO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZy5qc1xuLy8gbW9kdWxlIGlkID0gNTY2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0Jztcbi8vIEVDTUFTY3JpcHQgNiBzeW1ib2xzIHNoaW1cbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJyk7XG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBNRVRBID0gcmVxdWlyZSgnLi9fbWV0YScpLktFWTtcbnZhciAkZmFpbHMgPSByZXF1aXJlKCcuL19mYWlscycpO1xudmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpO1xudmFyIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi9fc2V0LXRvLXN0cmluZy10YWcnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuL191aWQnKTtcbnZhciB3a3MgPSByZXF1aXJlKCcuL193a3MnKTtcbnZhciB3a3NFeHQgPSByZXF1aXJlKCcuL193a3MtZXh0Jyk7XG52YXIgd2tzRGVmaW5lID0gcmVxdWlyZSgnLi9fd2tzLWRlZmluZScpO1xudmFyIGVudW1LZXlzID0gcmVxdWlyZSgnLi9fZW51bS1rZXlzJyk7XG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJy4vX2lzLWFycmF5Jyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG52YXIgX2NyZWF0ZSA9IHJlcXVpcmUoJy4vX29iamVjdC1jcmVhdGUnKTtcbnZhciBnT1BORXh0ID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcG4tZXh0Jyk7XG52YXIgJEdPUEQgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wZCcpO1xudmFyICREUCA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpO1xudmFyICRrZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcbnZhciBnT1BEID0gJEdPUEQuZjtcbnZhciBkUCA9ICREUC5mO1xudmFyIGdPUE4gPSBnT1BORXh0LmY7XG52YXIgJFN5bWJvbCA9IGdsb2JhbC5TeW1ib2w7XG52YXIgJEpTT04gPSBnbG9iYWwuSlNPTjtcbnZhciBfc3RyaW5naWZ5ID0gJEpTT04gJiYgJEpTT04uc3RyaW5naWZ5O1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xudmFyIEhJRERFTiA9IHdrcygnX2hpZGRlbicpO1xudmFyIFRPX1BSSU1JVElWRSA9IHdrcygndG9QcmltaXRpdmUnKTtcbnZhciBpc0VudW0gPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcbnZhciBTeW1ib2xSZWdpc3RyeSA9IHNoYXJlZCgnc3ltYm9sLXJlZ2lzdHJ5Jyk7XG52YXIgQWxsU3ltYm9scyA9IHNoYXJlZCgnc3ltYm9scycpO1xudmFyIE9QU3ltYm9scyA9IHNoYXJlZCgnb3Atc3ltYm9scycpO1xudmFyIE9iamVjdFByb3RvID0gT2JqZWN0W1BST1RPVFlQRV07XG52YXIgVVNFX05BVElWRSA9IHR5cGVvZiAkU3ltYm9sID09ICdmdW5jdGlvbic7XG52YXIgUU9iamVjdCA9IGdsb2JhbC5RT2JqZWN0O1xuLy8gRG9uJ3QgdXNlIHNldHRlcnMgaW4gUXQgU2NyaXB0LCBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvMTczXG52YXIgc2V0dGVyID0gIVFPYmplY3QgfHwgIVFPYmplY3RbUFJPVE9UWVBFXSB8fCAhUU9iamVjdFtQUk9UT1RZUEVdLmZpbmRDaGlsZDtcblxuLy8gZmFsbGJhY2sgZm9yIG9sZCBBbmRyb2lkLCBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9Njg3XG52YXIgc2V0U3ltYm9sRGVzYyA9IERFU0NSSVBUT1JTICYmICRmYWlscyhmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBfY3JlYXRlKGRQKHt9LCAnYScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRQKHRoaXMsICdhJywgeyB2YWx1ZTogNyB9KS5hOyB9XG4gIH0pKS5hICE9IDc7XG59KSA/IGZ1bmN0aW9uIChpdCwga2V5LCBEKSB7XG4gIHZhciBwcm90b0Rlc2MgPSBnT1BEKE9iamVjdFByb3RvLCBrZXkpO1xuICBpZiAocHJvdG9EZXNjKSBkZWxldGUgT2JqZWN0UHJvdG9ba2V5XTtcbiAgZFAoaXQsIGtleSwgRCk7XG4gIGlmIChwcm90b0Rlc2MgJiYgaXQgIT09IE9iamVjdFByb3RvKSBkUChPYmplY3RQcm90bywga2V5LCBwcm90b0Rlc2MpO1xufSA6IGRQO1xuXG52YXIgd3JhcCA9IGZ1bmN0aW9uICh0YWcpIHtcbiAgdmFyIHN5bSA9IEFsbFN5bWJvbHNbdGFnXSA9IF9jcmVhdGUoJFN5bWJvbFtQUk9UT1RZUEVdKTtcbiAgc3ltLl9rID0gdGFnO1xuICByZXR1cm4gc3ltO1xufTtcblxudmFyIGlzU3ltYm9sID0gVVNFX05BVElWRSAmJiB0eXBlb2YgJFN5bWJvbC5pdGVyYXRvciA9PSAnc3ltYm9sJyA/IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnO1xufSA6IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgaW5zdGFuY2VvZiAkU3ltYm9sO1xufTtcblxudmFyICRkZWZpbmVQcm9wZXJ0eSA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KGl0LCBrZXksIEQpIHtcbiAgaWYgKGl0ID09PSBPYmplY3RQcm90bykgJGRlZmluZVByb3BlcnR5KE9QU3ltYm9scywga2V5LCBEKTtcbiAgYW5PYmplY3QoaXQpO1xuICBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpO1xuICBhbk9iamVjdChEKTtcbiAgaWYgKGhhcyhBbGxTeW1ib2xzLCBrZXkpKSB7XG4gICAgaWYgKCFELmVudW1lcmFibGUpIHtcbiAgICAgIGlmICghaGFzKGl0LCBISURERU4pKSBkUChpdCwgSElEREVOLCBjcmVhdGVEZXNjKDEsIHt9KSk7XG4gICAgICBpdFtISURERU5dW2tleV0gPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSkgaXRbSElEREVOXVtrZXldID0gZmFsc2U7XG4gICAgICBEID0gX2NyZWF0ZShELCB7IGVudW1lcmFibGU6IGNyZWF0ZURlc2MoMCwgZmFsc2UpIH0pO1xuICAgIH0gcmV0dXJuIHNldFN5bWJvbERlc2MoaXQsIGtleSwgRCk7XG4gIH0gcmV0dXJuIGRQKGl0LCBrZXksIEQpO1xufTtcbnZhciAkZGVmaW5lUHJvcGVydGllcyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoaXQsIFApIHtcbiAgYW5PYmplY3QoaXQpO1xuICB2YXIga2V5cyA9IGVudW1LZXlzKFAgPSB0b0lPYmplY3QoUCkpO1xuICB2YXIgaSA9IDA7XG4gIHZhciBsID0ga2V5cy5sZW5ndGg7XG4gIHZhciBrZXk7XG4gIHdoaWxlIChsID4gaSkgJGRlZmluZVByb3BlcnR5KGl0LCBrZXkgPSBrZXlzW2krK10sIFBba2V5XSk7XG4gIHJldHVybiBpdDtcbn07XG52YXIgJGNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpdCwgUCkge1xuICByZXR1cm4gUCA9PT0gdW5kZWZpbmVkID8gX2NyZWF0ZShpdCkgOiAkZGVmaW5lUHJvcGVydGllcyhfY3JlYXRlKGl0KSwgUCk7XG59O1xudmFyICRwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IGZ1bmN0aW9uIHByb3BlcnR5SXNFbnVtZXJhYmxlKGtleSkge1xuICB2YXIgRSA9IGlzRW51bS5jYWxsKHRoaXMsIGtleSA9IHRvUHJpbWl0aXZlKGtleSwgdHJ1ZSkpO1xuICBpZiAodGhpcyA9PT0gT2JqZWN0UHJvdG8gJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIWhhcyhPUFN5bWJvbHMsIGtleSkpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIEUgfHwgIWhhcyh0aGlzLCBrZXkpIHx8ICFoYXMoQWxsU3ltYm9scywga2V5KSB8fCBoYXModGhpcywgSElEREVOKSAmJiB0aGlzW0hJRERFTl1ba2V5XSA/IEUgOiB0cnVlO1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpIHtcbiAgaXQgPSB0b0lPYmplY3QoaXQpO1xuICBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpO1xuICBpZiAoaXQgPT09IE9iamVjdFByb3RvICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICFoYXMoT1BTeW1ib2xzLCBrZXkpKSByZXR1cm47XG4gIHZhciBEID0gZ09QRChpdCwga2V5KTtcbiAgaWYgKEQgJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIShoYXMoaXQsIEhJRERFTikgJiYgaXRbSElEREVOXVtrZXldKSkgRC5lbnVtZXJhYmxlID0gdHJ1ZTtcbiAgcmV0dXJuIEQ7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCkge1xuICB2YXIgbmFtZXMgPSBnT1BOKHRvSU9iamVjdChpdCkpO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBpID0gMDtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIHtcbiAgICBpZiAoIWhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiBrZXkgIT0gSElEREVOICYmIGtleSAhPSBNRVRBKSByZXN1bHQucHVzaChrZXkpO1xuICB9IHJldHVybiByZXN1bHQ7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoaXQpIHtcbiAgdmFyIElTX09QID0gaXQgPT09IE9iamVjdFByb3RvO1xuICB2YXIgbmFtZXMgPSBnT1BOKElTX09QID8gT1BTeW1ib2xzIDogdG9JT2JqZWN0KGl0KSk7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIGkgPSAwO1xuICB2YXIga2V5O1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkge1xuICAgIGlmIChoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkgJiYgKElTX09QID8gaGFzKE9iamVjdFByb3RvLCBrZXkpIDogdHJ1ZSkpIHJlc3VsdC5wdXNoKEFsbFN5bWJvbHNba2V5XSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8vIDE5LjQuMS4xIFN5bWJvbChbZGVzY3JpcHRpb25dKVxuaWYgKCFVU0VfTkFUSVZFKSB7XG4gICRTeW1ib2wgPSBmdW5jdGlvbiBTeW1ib2woKSB7XG4gICAgaWYgKHRoaXMgaW5zdGFuY2VvZiAkU3ltYm9sKSB0aHJvdyBUeXBlRXJyb3IoJ1N5bWJvbCBpcyBub3QgYSBjb25zdHJ1Y3RvciEnKTtcbiAgICB2YXIgdGFnID0gdWlkKGFyZ3VtZW50cy5sZW5ndGggPiAwID8gYXJndW1lbnRzWzBdIDogdW5kZWZpbmVkKTtcbiAgICB2YXIgJHNldCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHRoaXMgPT09IE9iamVjdFByb3RvKSAkc2V0LmNhbGwoT1BTeW1ib2xzLCB2YWx1ZSk7XG4gICAgICBpZiAoaGFzKHRoaXMsIEhJRERFTikgJiYgaGFzKHRoaXNbSElEREVOXSwgdGFnKSkgdGhpc1tISURERU5dW3RhZ10gPSBmYWxzZTtcbiAgICAgIHNldFN5bWJvbERlc2ModGhpcywgdGFnLCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG4gICAgfTtcbiAgICBpZiAoREVTQ1JJUFRPUlMgJiYgc2V0dGVyKSBzZXRTeW1ib2xEZXNjKE9iamVjdFByb3RvLCB0YWcsIHsgY29uZmlndXJhYmxlOiB0cnVlLCBzZXQ6ICRzZXQgfSk7XG4gICAgcmV0dXJuIHdyYXAodGFnKTtcbiAgfTtcbiAgcmVkZWZpbmUoJFN5bWJvbFtQUk9UT1RZUEVdLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5faztcbiAgfSk7XG5cbiAgJEdPUEQuZiA9ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG4gICREUC5mID0gJGRlZmluZVByb3BlcnR5O1xuICByZXF1aXJlKCcuL19vYmplY3QtZ29wbicpLmYgPSBnT1BORXh0LmYgPSAkZ2V0T3duUHJvcGVydHlOYW1lcztcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpLmYgPSAkcHJvcGVydHlJc0VudW1lcmFibGU7XG4gIHJlcXVpcmUoJy4vX29iamVjdC1nb3BzJykuZiA9ICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbiAgaWYgKERFU0NSSVBUT1JTICYmICFyZXF1aXJlKCcuL19saWJyYXJ5JykpIHtcbiAgICByZWRlZmluZShPYmplY3RQcm90bywgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJHByb3BlcnR5SXNFbnVtZXJhYmxlLCB0cnVlKTtcbiAgfVxuXG4gIHdrc0V4dC5mID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gd3JhcCh3a3MobmFtZSkpO1xuICB9O1xufVxuXG4kZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCB7IFN5bWJvbDogJFN5bWJvbCB9KTtcblxuZm9yICh2YXIgZXM2U3ltYm9scyA9IChcbiAgLy8gMTkuNC4yLjIsIDE5LjQuMi4zLCAxOS40LjIuNCwgMTkuNC4yLjYsIDE5LjQuMi44LCAxOS40LjIuOSwgMTkuNC4yLjEwLCAxOS40LjIuMTEsIDE5LjQuMi4xMiwgMTkuNC4yLjEzLCAxOS40LjIuMTRcbiAgJ2hhc0luc3RhbmNlLGlzQ29uY2F0U3ByZWFkYWJsZSxpdGVyYXRvcixtYXRjaCxyZXBsYWNlLHNlYXJjaCxzcGVjaWVzLHNwbGl0LHRvUHJpbWl0aXZlLHRvU3RyaW5nVGFnLHVuc2NvcGFibGVzJ1xuKS5zcGxpdCgnLCcpLCBqID0gMDsgZXM2U3ltYm9scy5sZW5ndGggPiBqOyl3a3MoZXM2U3ltYm9sc1tqKytdKTtcblxuZm9yICh2YXIgd2VsbEtub3duU3ltYm9scyA9ICRrZXlzKHdrcy5zdG9yZSksIGsgPSAwOyB3ZWxsS25vd25TeW1ib2xzLmxlbmd0aCA+IGs7KSB3a3NEZWZpbmUod2VsbEtub3duU3ltYm9sc1trKytdKTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgJ1N5bWJvbCcsIHtcbiAgLy8gMTkuNC4yLjEgU3ltYm9sLmZvcihrZXkpXG4gICdmb3InOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIGhhcyhTeW1ib2xSZWdpc3RyeSwga2V5ICs9ICcnKVxuICAgICAgPyBTeW1ib2xSZWdpc3RyeVtrZXldXG4gICAgICA6IFN5bWJvbFJlZ2lzdHJ5W2tleV0gPSAkU3ltYm9sKGtleSk7XG4gIH0sXG4gIC8vIDE5LjQuMi41IFN5bWJvbC5rZXlGb3Ioc3ltKVxuICBrZXlGb3I6IGZ1bmN0aW9uIGtleUZvcihzeW0pIHtcbiAgICBpZiAoIWlzU3ltYm9sKHN5bSkpIHRocm93IFR5cGVFcnJvcihzeW0gKyAnIGlzIG5vdCBhIHN5bWJvbCEnKTtcbiAgICBmb3IgKHZhciBrZXkgaW4gU3ltYm9sUmVnaXN0cnkpIGlmIChTeW1ib2xSZWdpc3RyeVtrZXldID09PSBzeW0pIHJldHVybiBrZXk7XG4gIH0sXG4gIHVzZVNldHRlcjogZnVuY3Rpb24gKCkgeyBzZXR0ZXIgPSB0cnVlOyB9LFxuICB1c2VTaW1wbGU6IGZ1bmN0aW9uICgpIHsgc2V0dGVyID0gZmFsc2U7IH1cbn0pO1xuXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCAnT2JqZWN0Jywge1xuICAvLyAxOS4xLjIuMiBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXG4gIGNyZWF0ZTogJGNyZWF0ZSxcbiAgLy8gMTkuMS4yLjQgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXG4gIGRlZmluZVByb3BlcnR5OiAkZGVmaW5lUHJvcGVydHksXG4gIC8vIDE5LjEuMi4zIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpXG4gIGRlZmluZVByb3BlcnRpZXM6ICRkZWZpbmVQcm9wZXJ0aWVzLFxuICAvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogJGdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgLy8gMTkuMS4yLjcgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbiAgZ2V0T3duUHJvcGVydHlOYW1lczogJGdldE93blByb3BlcnR5TmFtZXMsXG4gIC8vIDE5LjEuMi44IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoTylcbiAgZ2V0T3duUHJvcGVydHlTeW1ib2xzOiAkZ2V0T3duUHJvcGVydHlTeW1ib2xzXG59KTtcblxuLy8gMjQuMy4yIEpTT04uc3RyaW5naWZ5KHZhbHVlIFssIHJlcGxhY2VyIFssIHNwYWNlXV0pXG4kSlNPTiAmJiAkZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICghVVNFX05BVElWRSB8fCAkZmFpbHMoZnVuY3Rpb24gKCkge1xuICB2YXIgUyA9ICRTeW1ib2woKTtcbiAgLy8gTVMgRWRnZSBjb252ZXJ0cyBzeW1ib2wgdmFsdWVzIHRvIEpTT04gYXMge31cbiAgLy8gV2ViS2l0IGNvbnZlcnRzIHN5bWJvbCB2YWx1ZXMgdG8gSlNPTiBhcyBudWxsXG4gIC8vIFY4IHRocm93cyBvbiBib3hlZCBzeW1ib2xzXG4gIHJldHVybiBfc3RyaW5naWZ5KFtTXSkgIT0gJ1tudWxsXScgfHwgX3N0cmluZ2lmeSh7IGE6IFMgfSkgIT0gJ3t9JyB8fCBfc3RyaW5naWZ5KE9iamVjdChTKSkgIT0gJ3t9Jztcbn0pKSwgJ0pTT04nLCB7XG4gIHN0cmluZ2lmeTogZnVuY3Rpb24gc3RyaW5naWZ5KGl0KSB7XG4gICAgdmFyIGFyZ3MgPSBbaXRdO1xuICAgIHZhciBpID0gMTtcbiAgICB2YXIgcmVwbGFjZXIsICRyZXBsYWNlcjtcbiAgICB3aGlsZSAoYXJndW1lbnRzLmxlbmd0aCA+IGkpIGFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XG4gICAgJHJlcGxhY2VyID0gcmVwbGFjZXIgPSBhcmdzWzFdO1xuICAgIGlmICghaXNPYmplY3QocmVwbGFjZXIpICYmIGl0ID09PSB1bmRlZmluZWQgfHwgaXNTeW1ib2woaXQpKSByZXR1cm47IC8vIElFOCByZXR1cm5zIHN0cmluZyBvbiB1bmRlZmluZWRcbiAgICBpZiAoIWlzQXJyYXkocmVwbGFjZXIpKSByZXBsYWNlciA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICBpZiAodHlwZW9mICRyZXBsYWNlciA9PSAnZnVuY3Rpb24nKSB2YWx1ZSA9ICRyZXBsYWNlci5jYWxsKHRoaXMsIGtleSwgdmFsdWUpO1xuICAgICAgaWYgKCFpc1N5bWJvbCh2YWx1ZSkpIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICAgIGFyZ3NbMV0gPSByZXBsYWNlcjtcbiAgICByZXR1cm4gX3N0cmluZ2lmeS5hcHBseSgkSlNPTiwgYXJncyk7XG4gIH1cbn0pO1xuXG4vLyAxOS40LjMuNCBTeW1ib2wucHJvdG90eXBlW0BAdG9QcmltaXRpdmVdKGhpbnQpXG4kU3ltYm9sW1BST1RPVFlQRV1bVE9fUFJJTUlUSVZFXSB8fCByZXF1aXJlKCcuL19oaWRlJykoJFN5bWJvbFtQUk9UT1RZUEVdLCBUT19QUklNSVRJVkUsICRTeW1ib2xbUFJPVE9UWVBFXS52YWx1ZU9mKTtcbi8vIDE5LjQuMy41IFN5bWJvbC5wcm90b3R5cGVbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKCRTeW1ib2wsICdTeW1ib2wnKTtcbi8vIDIwLjIuMS45IE1hdGhbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKE1hdGgsICdNYXRoJywgdHJ1ZSk7XG4vLyAyNC4zLjMgSlNPTltAQHRvU3RyaW5nVGFnXVxuc2V0VG9TdHJpbmdUYWcoZ2xvYmFsLkpTT04sICdKU09OJywgdHJ1ZSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL2VzNi5zeW1ib2wuanNcbi8vIG1vZHVsZSBpZCA9IDU2N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKGZhbHNlKTtcbi8vIGltcG9ydHNcblxuXG4vLyBtb2R1bGVcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIi5vYWsuc3BhY2VyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbn1cXG4ub2FrLnNwYWNlci5pbmxpbmUge1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgdmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xcbn1cXG4ub2FrLnNwYWNlci5mbHVpZCB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGZsZXg6IDEgMSAxMDAlO1xcbn1cXG4ub2FrLnNwYWNlci50aW55IHtcXG4gIHdpZHRoOiAycHg7XFxuICBoZWlnaHQ6IDJweDtcXG59XFxuLm9hay5zcGFjZXIuc21hbGwge1xcbiAgd2lkdGg6IDRweDtcXG4gIGhlaWdodDogNHB4O1xcbn1cXG4ub2FrLnNwYWNlci5tZWRpdW0ge1xcbiAgd2lkdGg6IDEwcHg7XFxuICBoZWlnaHQ6IDEwcHg7XFxufVxcbi5vYWsuc3BhY2VyLmxhcmdlIHtcXG4gIHdpZHRoOiAyMHB4O1xcbiAgaGVpZ2h0OiAyMHB4O1xcbn1cXG4ub2FrLnNwYWNlci5odWdlIHtcXG4gIHdpZHRoOiAzMHB4O1xcbiAgaGVpZ2h0OiAzMHB4O1xcbn1cXG4ub2FrLnNwYWNlci5tYXNzaXZlIHtcXG4gIHdpZHRoOiA1MHB4O1xcbiAgaGVpZ2h0OiA1MHB4O1xcbn1cXG5cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY3NzLWxvYWRlciEuL34vbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zcmMvYXBwL1NwYWNlci5sZXNzXG4vLyBtb2R1bGUgaWQgPSA1Njlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKShmYWxzZSk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIuZnVsbFdpZHRoIHtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG4uZnVsbEhlaWdodCB7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcbi5mdWxsU2l6ZSB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuXCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2Nzcy1sb2FkZXIhLi9+L2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3JjL2FwcC9zdHlsZXMubGVzc1xuLy8gbW9kdWxlIGlkID0gNTcwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vXG4vL1x0IyBDb3JlIGBydWxlc2AgLS0gc2ltcGxlIGRhdGF0eXBlcywgZXRjLlxuLy9cbi8vIE5PVEU6IG1hbnkgb2YgdGhlIGJlbG93IGFyZSBjcmVhdGVkIGFzIGN1c3RvbSBQYXR0ZXJuIHN1YmNsYXNzZXMgZm9yIGRlYnVnZ2luZy5cbi8vXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuLi8uLi9Ub2tlbml6ZXJcIjtcblxuLy8gQ3JlYXRlIGBjb3JlYCBwYXJzZXIuXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTW9kdWxlKFwiY29yZVwiKTtcbmV4cG9ydCBkZWZhdWx0IHBhcnNlcjtcblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICB7XG4gICAgbmFtZTogXCJzdGF0ZW1lbnRzXCIsXG4gICAgY29uc3RydWN0b3I6IFJ1bGUuU3RhdGVtZW50c1xuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImNvbW1lbnRcIixcbiAgICBjb25zdHJ1Y3RvcjogUnVsZS5Db21tZW50XG4gIH0sXG5cbiAgLy8gYHdvcmRgID0gaXMgYSBzaW5nbGUgYWxwaGFudW1lcmljIHdvcmQuXG4gIC8vIE1VU1Qgc3RhcnQgd2l0aCBhIGxvd2VyLWNhc2UgbGV0dGVyICg/KVxuICB7XG4gICAgbmFtZTogXCJ3b3JkXCIsXG4gICAgcGF0dGVybjogL15bYS16XVtcXHdcXC1dKiQvLFxuICAgIGNhbm9uaWNhbDogXCJXb3JkXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHdvcmQgZXh0ZW5kcyBSdWxlLlBhdHRlcm4ge1xuICAgICAgLy8gQ29udmVydCBcIi1cIiB0byBcIl9cIiBpbiBzb3VyY2Ugb3V0cHV0LlxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoZWQucmVwbGFjZSgvXFwtL2csIFwiX1wiKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIHdvcmRzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYWJjXCIsIFwiYWJjXCJdLFxuICAgICAgICAgIFtcImFiYy1kZWZcIiwgXCJhYmNfZGVmXCJdLFxuICAgICAgICAgIFtcImFiY19kZWZcIiwgXCJhYmNfZGVmXCJdLFxuICAgICAgICAgIFtcImFiYzAxXCIsIFwiYWJjMDFcIl0sXG4gICAgICAgICAgW1wiYWJjLWRlZl8wMVwiLCBcImFiY19kZWZfMDFcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImRvZXNuJ3QgbWF0Y2ggdGhpbmdzIHRoYXQgYXJlbid0IHdvcmRzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiJGFzZGFcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCIoYXNkYSlcIiwgdW5kZWZpbmVkXSAgICAgLy8gVE9ETy4uLiA/Pz9cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAgLy8gYGlkZW50aWZpZXJgID0gdmFyaWFibGVzIG9yIHByb3BlcnR5IG5hbWUuXG4gIC8vIE1VU1Qgc3RhcnQgd2l0aCBhIGxvd2VyLWNhc2UgbGV0dGVyICg/KVxuICAvLyBOT1RFOiBXZSBibGFja2xpc3QgYSBsb3Qgb2Ygd29yZHMgYXMgaWRlbnRpZmllcnMuXG4gIHtcbiAgICBuYW1lOiBcImlkZW50aWZpZXJcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgY2Fub25pY2FsOiBcIklkZW5maWZpZXJcIixcbiAgICBwYXR0ZXJuOiAvXlthLXpdW1xcd1xcLV0qJC8sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlkZW50aWZpZXIgZXh0ZW5kcyBSdWxlLlBhdHRlcm4ge1xuICAgICAgLy8gQ29udmVydCBcIi1cIiB0byBcIl9cIiBpbiBzb3VyY2Ugb3V0cHV0LlxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoZWQucmVwbGFjZSgvXFwtL2csIFwiX1wiKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGJsYWNrbGlzdDogW1xuICAgICAgLy8gQWRkIEVuZ2xpc2ggcHJlcG9zaXRpb25zIHRvIGlkZW50aWZpZXIgYmxhY2tsaXN0LlxuICAgICAgLy9cbiAgICAgIC8vIFdpa2lwZWRpYSBcIlByZXBvc2l0aW9uXCI6XG4gICAgICAvL1x0XCJQcmVwb3NpdGlvbnMuLi5hcmUgYSBjbGFzcyBvZiB3b3JkcyB0aGF0XG4gICAgICAvL1x0ZXhwcmVzcyBzcGF0aWFsIG9yIHRlbXBvcmFsIHJlbGF0aW9ucyAgKGluLCB1bmRlciwgdG93YXJkcywgYmVmb3JlKVxuICAgICAgLy9cdG9yIG1hcmsgdmFyaW91cyBzZW1hbnRpYyByb2xlcyAob2YsIGZvcikuXG4gICAgICAvLyBURVNUTUVcbiAgICAgIFwiYWJvdXRcIiwgXCJhYm92ZVwiLCBcImFmdGVyXCIsIFwiYW5kXCIsIFwiYXNcIiwgXCJhdFwiLFxuICAgICAgXCJiZWZvcmVcIiwgXCJiZWhpbmRcIiwgXCJiZWxvd1wiLCBcImJlbmVhdGhcIiwgXCJiZXNpZGVcIiwgXCJiZXR3ZWVuXCIsIFwiYmV5b25kXCIsIFwiYnlcIixcbiAgICAgIFwiZGVmaW5lZFwiLCBcImRvd25cIiwgXCJkdXJpbmdcIixcbiAgICAgIFwiZWFjaFwiLCBcImVtcHR5XCIsIFwiZXhhY3RseVwiLCBcImV4Y2VwdFwiLFxuICAgICAgXCJmb3JcIiwgXCJmcm9tXCIsXG4gICAgICBcImdyZWF0ZXJcIixcbiAgICAgIFwiSVwiLCBcImluXCIsIFwiaW50b1wiLFxuICAgICAgXCJsZXNzXCIsIFwibG9uZ1wiLFxuICAgICAgXCJtZVwiLCBcIm1pbnVzXCIsIFwibW9yZVwiLFxuICAgICAgXCJuZWFyXCIsIFwibm90XCIsXG4gICAgICBcIm9mXCIsIFwib2ZmXCIsIFwib25cIiwgXCJvbnRvXCIsIFwib3Bwb3NpdGVcIiwgXCJvclwiLCBcIm91dFwiLCBcIm91dHNpZGVcIiwgXCJvdmVyXCIsXG4gICAgICBcInNob3J0XCIsIFwic2luY2VcIixcbiAgICAgIFwidGhhblwiLCBcInRoZVwiLCBcInRoZW5cIiwgXCJ0aHJvdWdoXCIsIFwidGhydVwiLCBcInRvXCIsIFwidG93YXJkXCIsIFwidG93YXJkc1wiLFxuICAgICAgXCJ1bmRlZmluZWRcIiwgXCJ1bmRlclwiLCBcInVuZGVybmVhdGhcIiwgXCJ1bmlxdWVcIiwgXCJ1bnRpbFwiLCBcInVwXCIsIFwidXBvblwiLCBcInVwc2lkZVwiLFxuICAgICAgXCJ2ZXJzdXNcIiwgXCJ2c1wiLFxuICAgICAgXCJ3aGVyZVwiLCBcIndpdGhcIiwgXCJ3aXRoaW5cIiwgXCJ3aXRob3V0XCIsXG5cbiAgICAgIC8vIEFkZCBjb21tb24gZW5nbGlzaCB2ZXJicyB0byBpZGVudGlmaWVyIGJsYWNrbGlzdC5cbiAgICAgIFwiYXJlXCIsXG4gICAgICBcImRvXCIsIFwiZG9lc1wiLFxuICAgICAgXCJjb250YWluc1wiLFxuICAgICAgXCJoYXNcIiwgXCJoYXZlXCIsXG4gICAgICBcImlzXCIsXG4gICAgICBcInJlcGVhdFwiLFxuICAgICAgXCJ3YXNcIiwgXCJ3ZXJlXCIsXG5cbiAgICAgIC8vIEFkZCBzcGVjaWFsIGNvbnRyb2wga2V5d29yZHMgdG8gaWRlbnRpZmllciBibGFja2xpc3QuXG4gICAgICBcImVsc2VcIixcbiAgICAgIFwiaWZcIixcbiAgICAgIFwib3RoZXJ3aXNlXCIsXG4gICAgICBcIndoaWxlXCIsXG5cbiAgICAgIC8vIEFkZCBib29sZWFuIHRva2VucyB0byBpZGVudGlmaWVyIGJsYWNrbGlzdC5cbiAgICAgIFwidHJ1ZVwiLCBcImZhbHNlXCIsXG4gICAgICBcInllc1wiLCBcIm5vXCIsXG4gICAgICBcIm9rXCIsIFwiY2FuY2VsXCIsXG4gICAgICBcInN1Y2Nlc3NcIiwgXCJmYWlsdXJlXCIsXG5cbiAgICAgIC8vIEFkZCBudW1iZXIgd29yZHMgdG8gaWRlbnRpZmllciBibGFja2xpc3QuXG4gICAgICAvLyBURVNUTUVcbiAgICAgIFwib25lXCIsIFwidHdvXCIsIFwidGhyZWVcIiwgXCJmb3VyXCIsIFwiZml2ZVwiLFxuICAgICAgXCJzaXhcIiwgXCJzZXZlblwiLCBcImVpZ2h0XCIsIFwibmluZVwiLCBcInRlblwiLFxuICAgIF0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgaWRlbnRpZmllcnNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCJhYmNcIiwgXCJhYmNcIl0sXG4gICAgICAgICAgW1wiYWJjLWRlZlwiLCBcImFiY19kZWZcIl0sXG4gICAgICAgICAgW1wiYWJjX2RlZlwiLCBcImFiY19kZWZcIl0sXG4gICAgICAgICAgW1wiYWJjMDFcIiwgXCJhYmMwMVwiXSxcbiAgICAgICAgICBbXCJhYmMtZGVmXzAxXCIsIFwiYWJjX2RlZl8wMVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiZG9lc24ndCBtYXRjaCB0aGluZ3MgdGhhdCBhcmVuJ3QgaWRlbnRpZmllcnNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCIkYXNkYVwiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcIihhc2RhKVwiLCB1bmRlZmluZWRdLCAgICAgLy8gVE9ETy4uLiA/Pz9cbiAgICAgICAgICBbXCJBYmNcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwic2tpcHMgaXRlbXMgaW4gaXRzIGJsYWNrbGlzdFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcInllc1wiLCB1bmRlZmluZWRdXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICBdXG4gIH0sXG5cbiAgLy8gYFR5cGVgID0gdHlwZSBuYW1lLlxuICAvLyBNVVNUIHN0YXJ0IHdpdGggYW4gdXBwZXItY2FzZSBsZXR0ZXIgKD8pXG4gIHtcbiAgICBuYW1lOiBcInR5cGVcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgY2Fub25pY2FsOiBcIlR5cGVcIixcbiAgICBwYXR0ZXJuOiAvXihbQS1aXVtcXHdcXC1dKnxsaXN0fHRleHR8bnVtYmVyfGludGVnZXJ8ZGVjaW1hbHxjaGFyYWN0ZXJ8Ym9vbGVhbnxvYmplY3QpJC8sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHR5cGUgZXh0ZW5kcyBSdWxlLlBhdHRlcm4ge1xuICAgICAgLy8gQ29udmVydCBcIi1cIiB0byBcIl9cIiBpbiBzb3VyY2Ugb3V0cHV0LlxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB0eXBlID0gdGhpcy5tYXRjaGVkO1xuICAgICAgICBzd2l0Y2godHlwZSkge1xuICAgICAgICAgIC8vIEFsaWFzIGBMaXN0YCB0byBgQXJyYXlgXG4gICAgICAgICAgY2FzZSBcIkxpc3RcIjpcdFx0cmV0dXJuIFwiQXJyYXlcIjtcblxuICAgICAgICAgIC8vIHNwZWNpYWwgY2FzZSB0byB0YWtlIHRoZSBmb2xsb3dpbmcgYXMgbG93ZXJjYXNlXG4gICAgICAgICAgY2FzZSBcImxpc3RcIjpcdFx0cmV0dXJuIFwiQXJyYXlcIjtcbiAgICAgICAgICBjYXNlIFwidGV4dFwiOlx0XHRyZXR1cm4gXCJTdHJpbmdcIjtcbiAgICAgICAgICBjYXNlIFwiY2hhcmFjdGVyXCI6XHRyZXR1cm4gXCJDaGFyYWN0ZXJcIjtcbiAgICAgICAgICBjYXNlIFwibnVtYmVyXCI6XHRcdHJldHVybiBcIk51bWJlclwiO1xuICAgICAgICAgIGNhc2UgXCJpbnRlZ2VyXCI6XHRcdHJldHVybiBcIkludGVnZXJcIjtcbiAgICAgICAgICBjYXNlIFwiZGVjaW1hbFwiOlx0XHRyZXR1cm4gXCJEZWNpbWFsXCI7XG4gICAgICAgICAgY2FzZSBcImJvb2xlYW5cIjpcdFx0cmV0dXJuIFwiQm9vbGVhblwiO1xuICAgICAgICAgIGNhc2UgXCJvYmplY3RcIjpcdFx0cmV0dXJuIFwiT2JqZWN0XCI7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB0eXBlLnJlcGxhY2UoL1xcLS9nLCBcIl9cIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGJsYWNrbGlzdDogWyBcIklcIiBdLFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIHR5cGVzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiQWJjXCIsIFwiQWJjXCJdLFxuICAgICAgICAgIFtcIkFiYy1kZWZcIiwgXCJBYmNfZGVmXCJdLFxuICAgICAgICAgIFtcIkFiY19EZWZcIiwgXCJBYmNfRGVmXCJdLFxuICAgICAgICAgIFtcIkFiYzAxXCIsIFwiQWJjMDFcIl0sXG4gICAgICAgICAgW1wiQWJjLWRlZl8wMVwiLCBcIkFiY19kZWZfMDFcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImRvZXNuJ3QgbWF0Y2ggdGhpbmdzIHRoYXQgYXJlbid0IHR5cGVzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wiJEFzZGFcIiwgdW5kZWZpbmVkXSwgICAgIC8vIFRPRE8uLi4gPz8/XG4gICAgICAgICAgW1wiKEFzZGEpXCIsIHVuZGVmaW5lZF0sICAgIC8vIFRPRE8uLi4gPz8/XG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvbnZlcnRzIHNwZWNpYWwgdHlwZXNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJMaXN0XCIsIFwiQXJyYXlcIl0sXG4gICAgICAgICAgW1wibGlzdFwiLCBcIkFycmF5XCJdLFxuICAgICAgICAgIFtcInRleHRcIiwgXCJTdHJpbmdcIl0sXG4gICAgICAgICAgW1wiY2hhcmFjdGVyXCIsIFwiQ2hhcmFjdGVyXCJdLFxuICAgICAgICAgIFtcIm51bWJlclwiLCBcIk51bWJlclwiXSxcbiAgICAgICAgICBbXCJpbnRlZ2VyXCIsIFwiSW50ZWdlclwiXSxcbiAgICAgICAgICBbXCJkZWNpbWFsXCIsIFwiRGVjaW1hbFwiXSxcbiAgICAgICAgICBbXCJib29sZWFuXCIsIFwiQm9vbGVhblwiXSxcbiAgICAgICAgICBbXCJvYmplY3RcIiwgXCJPYmplY3RcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcInNraXBzIGl0ZW1zIGluIGl0cyBibGFja2xpc3RcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJJXCIsIHVuZGVmaW5lZF1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfSxcblxuXG5cbiAgLy8gQm9vbGVhbiBsaXRlcmFsLCBjcmVhdGVkIHdpdGggY3VzdG9tIGNvbnN0cnVjdG9yIGZvciBkZWJ1Z2dpbmcuXG4gIC8vIFRPRE86IGJldHRlciBuYW1lIGZvciB0aGlzPz8/XG4gIHtcbiAgICBuYW1lOiBcImJvb2xlYW5cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgY2Fub25pY2FsOiBcIkJvb2xlYW5cIixcbiAgICBwYXR0ZXJuOiAvXih0cnVlfGZhbHNlfHllc3xub3xva3xjYW5jZWx8c3VjY2Vzc3xmYWlsdXJlKSQvLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBib29sZWFuIGV4dGVuZHMgUnVsZS5QYXR0ZXJuIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMubWF0Y2hlZCkge1xuICAgICAgICAgIGNhc2UgXCJ0cnVlXCI6XG4gICAgICAgICAgY2FzZSBcInllc1wiOlxuICAgICAgICAgIGNhc2UgXCJva1wiOlxuICAgICAgICAgIGNhc2UgXCJzdWNjZXNzXCI6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIGJvb2xlYW5zXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1widHJ1ZVwiLCB0cnVlXSxcbiAgICAgICAgICBbXCJ5ZXNcIiwgdHJ1ZV0sXG4gICAgICAgICAgW1wib2tcIiwgdHJ1ZV0sXG4gICAgICAgICAgW1wic3VjY2Vzc1wiLCB0cnVlXSxcbiAgICAgICAgICBbXCJmYWxzZVwiLCBmYWxzZV0sXG4gICAgICAgICAgW1wibm9cIiwgZmFsc2VdLFxuICAgICAgICAgIFtcImNhbmNlbFwiLCBmYWxzZV0sXG4gICAgICAgICAgW1wiZmFpbHVyZVwiLCBmYWxzZV1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiZG9lc24ndCBtYXRjaCBpbiB0aGUgbWlkZGxlIG9mIGEgbG9uZ2VyIGtleXdvcmRcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJ5ZXNzaXJcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCJ5ZXMtc2lyXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wieWVzX3NpclwiLCB1bmRlZmluZWRdXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIC8vIGBudW1iZXJgIGFzIGVpdGhlciBmbG9hdCBvciBpbnRlZ2VyLCBjcmVhdGVkIHdpdGggY3VzdG9tIGNvbnN0cnVjdG9yIGZvciBkZWJ1Z2dpbmcuXG4gIC8vIE5PVEU6IHlvdSBjYW4gYWxzbyB1c2UgYG9uZWAuLi5gdGVuYCBhcyBzdHJpbmdzLidcbiAgLy8gVE9ETzogIGBpbnRlZ2VyYCBhbmQgYGRlY2ltYWxgPyAgdG9vIHRlY2h5P1xuICB7XG4gICAgbmFtZTogXCJudW1iZXJcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgY2Fub25pY2FsOiBcIk51bWJlclwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBudW1iZXIgZXh0ZW5kcyBSdWxlIHtcbiAgICAgIC8vIFNwZWNpYWwgd29yZHMgeW91IGNhbiB1c2UgYXMgbnVtYmVycy4uLlxuICAgICAgc3RhdGljIE5VTUJFUl9OQU1FUyA9IHtcbiAgICAgICAgemVybzogMCxcbiAgICAgICAgb25lOiAxLFxuICAgICAgICB0d286IDIsXG4gICAgICAgIHRocmVlOiAzLFxuICAgICAgICBmb3VyOiA0LFxuICAgICAgICBmaXZlOiA1LFxuICAgICAgICBzaXg6IDYsXG4gICAgICAgIHNldmVuOiA3LFxuICAgICAgICBlaWdodDogOCxcbiAgICAgICAgbmluZTogOSxcbiAgICAgICAgdGVuOiAxMFxuICAgICAgfVxuXG4gICAgICAvLyBOdW1iZXJzIGdldCBlbmNvZGVkIGFzIG51bWJlcnMgaW4gdGhlIHRva2VuIHN0cmVhbS5cbiAgICAgIHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDApIHtcbiAgICAgICAgbGV0IHRva2VuID0gdG9rZW5zW3N0YXJ0XTtcbiAgICAgICAgLy8gaWYgYSBzdHJpbmcsIGF0dGVtcHQgdG8gcnVuIHRocm91Z2ggb3VyIE5VTUJFUl9OQU1FU1xuICAgICAgICBpZiAodHlwZW9mIHRva2VuID09PSBcInN0cmluZ1wiKSB0b2tlbiA9IFJ1bGUuTnVtYmVyLk5VTUJFUl9OQU1FU1t0b2tlbl07XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW4gIT09IFwibnVtYmVyXCIpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiB0aGlzLmNsb25lKHtcbiAgICAgICAgICBtYXRjaGVkOiB0b2tlbixcbiAgICAgICAgICBuZXh0U3RhcnQ6IHN0YXJ0ICsgMVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udmVydCB0byBudW1iZXIgb24gc291cmNlIG91dHB1dC5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVkO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgbnVtYmVyc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIjFcIiwgMV0sXG4gICAgICAgICAgW1wiMTAwMFwiLCAxMDAwXSxcbiAgICAgICAgICBbXCItMVwiLCAtMV0sXG4gICAgICAgICAgW1wiMS4xXCIsIDEuMV0sXG4gICAgICAgICAgW1wiMDAwLjFcIiwgMC4xXSxcbiAgICAgICAgICBbXCIxLlwiLCAxXSxcbiAgICAgICAgICBbXCIuMVwiLCAwLjFdLFxuICAgICAgICAgIFtcIi0xMTEuMTExXCIsIC0xMTEuMTExXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiZG9lc24ndCBtYXRjaCB0aGluZ3MgdGhhdCBhcmVuJ3QgbnVtYmVyc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIlwiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcIi5cIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwicmVxdWlyZXMgbmVnYXRpdmUgc2lnbiB0byBiZSB0b3VjaGluZyB0aGUgbnVtYmVyXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiLSAxXCIsIHVuZGVmaW5lZF1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAgLy8gTGl0ZXJhbCBgdGV4dGAgc3RyaW5nLCBjcmVhdGVkIHdpdGggY3VzdG9tIGNvbnN0cnVjdG9yIGZvciBkZWJ1Z2dpbmcuXG4gIC8vIFlvdSBjYW4gdXNlIGVpdGhlciBzaW5nbGUgb3IgZG91YmxlIHF1b3RlcyBvbiB0aGUgb3V0c2lkZSAoYWx0aG91Z2ggZG91YmxlIHF1b3RlcyBhcmUgcHJlZmVycmVkKS5cbiAgLy8gUmV0dXJuZWQgdmFsdWUgaGFzIGVuY2xvc2luZyBxdW90ZXMuXG4gIHtcbiAgICBuYW1lOiBcInRleHRcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgY2Fub25pY2FsOiBcIlRleHRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgdGV4dCBleHRlbmRzIFJ1bGUge1xuICAgICAgLy8gVGV4dCBzdHJpbmdzIGdldCBlbmNvZGVkIGFzIGB0ZXh0YCBvYmplY3RzIGluIHRoZSB0b2tlbiBzdHJlYW0uXG4gICAgICBwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwKSB7XG4gICAgICAgIGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG4gICAgICAgIGlmICghKHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLlRleHQpKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSh7XG4gICAgICAgICAgbWF0Y2hlZDogdG9rZW4ucXVvdGVkU3RyaW5nLFxuICAgICAgICAgIG5leHRTdGFydDogc3RhcnQgKyAxXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0Y2hlZDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIHRleHRcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbJ1wiXCInLCAnXCJcIiddLFxuICAgICAgICAgIFtcIicnXCIsIFwiJydcIl0sXG4gICAgICAgICAgWydcImFcIicsICdcImFcIiddLFxuICAgICAgICAgIFtcIidhJ1wiLCBcIidhJ1wiXSxcbiAgICAgICAgICBbJ1wiYWJjZFwiJywgJ1wiYWJjZFwiJ10sXG4gICAgICAgICAgWydcImFiYyBkZWYgZ2hpLiBqa2xcIicsICdcImFiYyBkZWYgZ2hpLiBqa2xcIiddLFxuICAgICAgICAgIFsnXCIuLi5DYW5cXCd0IHRvdWNoIHRoaXNcIicsICdcIi4uLkNhblxcJ3QgdG91Y2ggdGhpc1wiJ10sXG4vL0ZJWE1FICAgICAgICAgIFtcIidcXFwiR2Fkem9va3MhIEkgY2FuXFxcXCd0IGJlbGlldmUgaXQhXFxcIiBoZSBzYWlkJ1wiLCBcIidcXFwiR2Fkem9va3MhIEkgY2FuXFwndCBiZWxpZXZlIGl0IVxcXCIgaGUgc2FpZCdcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIC8vIExpdGVyYWwgbGlzdCAoYXJyYXkpLCBlZzogIGBbMSwyICwgdHJ1ZSxmYWxzZSBdYFxuICB7XG4gICAgbmFtZTogXCJsaXRlcmFsX2xpc3RcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIlxcXFxbW2xpc3Q6e2V4cHJlc3Npb259LF0/XFxcXF1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGl0ZXJhbF9saXN0IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYFske2xpc3QgPyBsaXN0LmpvaW4oXCIsIFwiKSA6IFwiXCJ9XWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBsaXRlcmFsIGxpc3RzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiW11cIiwgXCJbXVwiXSxcbiAgICAgICAgICBbXCJbMV1cIiwgXCJbMV1cIl0sXG4gICAgICAgICAgW1wiWzEsXVwiLCBcIlsxXVwiXSxcbiAgICAgICAgICBbXCJbMSwyLDNdXCIsIFwiWzEsIDIsIDNdXCJdLFxuICAgICAgICAgIFtcIlsxLCAyLCAzXVwiLCBcIlsxLCAyLCAzXVwiXSxcbiAgICAgICAgICBbXCJbMSwyLDMsXVwiLCBcIlsxLCAyLCAzXVwiXSxcbiAgICAgICAgICBbXCJbeWVzLG5vLCdhJywxXVwiLCBcIlt0cnVlLCBmYWxzZSwgJ2EnLCAxXVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiZG9lc24ndCBtYXRjaCBtYWxmb3JtZWQgbGlzdHMgXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wiWywxXVwiLCB1bmRlZmluZWRdXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG5cbiAgLy8gUGFyZW50aGVzaXplZCBleHByZXNzaW9uXG4gIHtcbiAgICBuYW1lOiBcInBhcmVudGhlc2l6ZWRfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiXFxcXCh7ZXhwcmVzc2lvbn1cXFxcKVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBwYXJlbnRoZXNpemVkX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBleHByZXNzaW9uIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIC8vIGRvbid0IGRvdWJsZSBwYXJlbnMgaWYgbm90IG5lY2Vzc2FyeVxuICAgICAgICBpZiAodHlwZW9mIGV4cHJlc3Npb24gPT09IFwic3RyaW5nXCIgJiYgZXhwcmVzc2lvbi5zdGFydHNXaXRoKFwiKFwiKSAmJiBleHByZXNzaW9uLmVuZHNXaXRoKFwiKVwiKSkgcmV0dXJuIGV4cHJlc3Npb247XG4gICAgICAgIHJldHVybiBcIihcIiArIGV4cHJlc3Npb24gKyBcIilcIjtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIHBhcmVudGhlc2l6ZWQgZXhwcmVzc2lvbnNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCIoc29tZVZhcilcIiwgXCIoc29tZVZhcilcIl0sXG4gICAgICAgICAgW1wiKChzb21lVmFyKSlcIiwgXCIoc29tZVZhcilcIl0sXG4gICAgICAgICAgW1wiKDEgYW5kIHllcylcIiwgXCIoMSAmJiB0cnVlKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgbXVsdGlwbGUgcGFyZW50aGVzaXNcIixcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCIoMSkgYW5kICh5ZXMpXCIsIFwiKCgxKSAmJiAodHJ1ZSkpXCJdLFxuICAgICAgICAgIFtcIigoMSkgYW5kICh5ZXMpKVwiLCBcIigoMSkgJiYgKHRydWUpKVwiXSxcbiAgICAgICAgICBbXCIoKDEpIGFuZCAoKHllcykpKVwiLCBcIigoMSkgJiYgKHRydWUpKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiZG9lc24ndCBtYXRjaCBtYWxmb3JtZWQgcGFyZW50aGVzaXplZCBleHByZXNzaW9uc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIihmb29cIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCIoZm9vKGJhciliYXpcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH1cblxuKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ydWxlcy9zcGVsbC9jb3JlLmpzIiwiLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH0gfSkuYSAhPSA3O1xufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19kZXNjcmlwdG9ycy5qc1xuLy8gbW9kdWxlIGlkID0gNzJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwga2V5KSB7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2hhcy5qc1xuLy8gbW9kdWxlIGlkID0gNzNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuL19pZTgtZG9tLWRlZmluZScpO1xudmFyIHRvUHJpbWl0aXZlID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJyk7XG52YXIgZFAgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG5cbmV4cG9ydHMuZiA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKSB7XG4gIGFuT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGFuT2JqZWN0KEF0dHJpYnV0ZXMpO1xuICBpZiAoSUU4X0RPTV9ERUZJTkUpIHRyeSB7XG4gICAgcmV0dXJuIGRQKE8sIFAsIEF0dHJpYnV0ZXMpO1xuICB9IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cbiAgaWYgKCdnZXQnIGluIEF0dHJpYnV0ZXMgfHwgJ3NldCcgaW4gQXR0cmlidXRlcykgdGhyb3cgVHlwZUVycm9yKCdBY2Nlc3NvcnMgbm90IHN1cHBvcnRlZCEnKTtcbiAgaWYgKCd2YWx1ZScgaW4gQXR0cmlidXRlcykgT1tQXSA9IEF0dHJpYnV0ZXMudmFsdWU7XG4gIHJldHVybiBPO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcC5qc1xuLy8gbW9kdWxlIGlkID0gNzRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdFByb3BUeXBlc1NlY3JldCA9IHJlcXVpcmUoJy4vbGliL1JlYWN0UHJvcFR5cGVzU2VjcmV0Jyk7XG5cbmZ1bmN0aW9uIGVtcHR5RnVuY3Rpb24oKSB7fVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBzaGltKHByb3BzLCBwcm9wTmFtZSwgY29tcG9uZW50TmFtZSwgbG9jYXRpb24sIHByb3BGdWxsTmFtZSwgc2VjcmV0KSB7XG4gICAgaWYgKHNlY3JldCA9PT0gUmVhY3RQcm9wVHlwZXNTZWNyZXQpIHtcbiAgICAgIC8vIEl0IGlzIHN0aWxsIHNhZmUgd2hlbiBjYWxsZWQgZnJvbSBSZWFjdC5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcihcbiAgICAgICdDYWxsaW5nIFByb3BUeXBlcyB2YWxpZGF0b3JzIGRpcmVjdGx5IGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGBwcm9wLXR5cGVzYCBwYWNrYWdlLiAnICtcbiAgICAgICdVc2UgUHJvcFR5cGVzLmNoZWNrUHJvcFR5cGVzKCkgdG8gY2FsbCB0aGVtLiAnICtcbiAgICAgICdSZWFkIG1vcmUgYXQgaHR0cDovL2ZiLm1lL3VzZS1jaGVjay1wcm9wLXR5cGVzJ1xuICAgICk7XG4gICAgZXJyLm5hbWUgPSAnSW52YXJpYW50IFZpb2xhdGlvbic7XG4gICAgdGhyb3cgZXJyO1xuICB9O1xuICBzaGltLmlzUmVxdWlyZWQgPSBzaGltO1xuICBmdW5jdGlvbiBnZXRTaGltKCkge1xuICAgIHJldHVybiBzaGltO1xuICB9O1xuICAvLyBJbXBvcnRhbnQhXG4gIC8vIEtlZXAgdGhpcyBsaXN0IGluIHN5bmMgd2l0aCBwcm9kdWN0aW9uIHZlcnNpb24gaW4gYC4vZmFjdG9yeVdpdGhUeXBlQ2hlY2tlcnMuanNgLlxuICB2YXIgUmVhY3RQcm9wVHlwZXMgPSB7XG4gICAgYXJyYXk6IHNoaW0sXG4gICAgYm9vbDogc2hpbSxcbiAgICBmdW5jOiBzaGltLFxuICAgIG51bWJlcjogc2hpbSxcbiAgICBvYmplY3Q6IHNoaW0sXG4gICAgc3RyaW5nOiBzaGltLFxuICAgIHN5bWJvbDogc2hpbSxcblxuICAgIGFueTogc2hpbSxcbiAgICBhcnJheU9mOiBnZXRTaGltLFxuICAgIGVsZW1lbnQ6IHNoaW0sXG4gICAgaW5zdGFuY2VPZjogZ2V0U2hpbSxcbiAgICBub2RlOiBzaGltLFxuICAgIG9iamVjdE9mOiBnZXRTaGltLFxuICAgIG9uZU9mOiBnZXRTaGltLFxuICAgIG9uZU9mVHlwZTogZ2V0U2hpbSxcbiAgICBzaGFwZTogZ2V0U2hpbSxcbiAgICBleGFjdDogZ2V0U2hpbVxuICB9O1xuXG4gIFJlYWN0UHJvcFR5cGVzLmNoZWNrUHJvcFR5cGVzID0gZW1wdHlGdW5jdGlvbjtcbiAgUmVhY3RQcm9wVHlwZXMuUHJvcFR5cGVzID0gUmVhY3RQcm9wVHlwZXM7XG5cbiAgcmV0dXJuIFJlYWN0UHJvcFR5cGVzO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9wcm9wLXR5cGVzL2ZhY3RvcnlXaXRoVGhyb3dpbmdTaGltcy5qc1xuLy8gbW9kdWxlIGlkID0gNzcwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxuLyoqXG4gKiBAbW9kdWxlIGNvbXBvbmVudFdyYXBwZXJcbiAqXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCAqIGFzIHN0b3JlIGZyb20gJy4uL3N0b3JlJztcbmltcG9ydCB7IG9uTW91bnQsIG9uVW5tb3VudCB9IGZyb20gJy4uL2V2ZW50X2hhbmRsZXJzJztcbmltcG9ydCB7IEFMTF9LRVlTIH0gZnJvbSAnLi4vbGliL2tleXMnO1xuXG4vKipcbiAqIGNvbXBvbmVudFdyYXBwZXJcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IFdyYXBwZWRDb21wb25lbnQgUmVhY3QgY29tcG9uZW50IGNsYXNzIHRvIGJlIHdyYXBwZWRcbiAqIEBwYXJhbSB7YXJyYXl9IFtrZXlzXSBUaGUga2V5KHMpIGJvdW5kIHRvIHRoZSBjbGFzc1xuICogQHJldHVybiB7b2JqZWN0fSBUaGUgaGlnaGVyLW9yZGVyIGZ1bmN0aW9uIHRoYXQgd3JhcHMgdGhlIGRlY29yYXRlZCBjbGFzc1xuICovXG5mdW5jdGlvbiBjb21wb25lbnRXcmFwcGVyKFdyYXBwZWRDb21wb25lbnQpIHtcbiAgdmFyIGtleXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IEFMTF9LRVlTO1xuXG4gIHZhciBLZXlCb2FyZEhlbHBlciA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEtleUJvYXJkSGVscGVyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEtleUJvYXJkSGVscGVyKHByb3BzKSB7XG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgS2V5Qm9hcmRIZWxwZXIpO1xuXG4gICAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoS2V5Qm9hcmRIZWxwZXIuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihLZXlCb2FyZEhlbHBlcikpLmNhbGwodGhpcywgcHJvcHMpKTtcblxuICAgICAgX3RoaXMuc3RhdGUgPSB7XG4gICAgICAgIGV2ZW50OiBudWxsXG4gICAgICB9O1xuICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhLZXlCb2FyZEhlbHBlciwgW3tcbiAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgb25Nb3VudCh0aGlzKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdjb21wb25lbnRXaWxsVW5tb3VudCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIG9uVW5tb3VudCh0aGlzKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdoYW5kbGVLZXlEb3duJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVLZXlEb3duKGV2ZW50KSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIC8vIHRvIHNpbXVsYXRlIGEga2V5cHJlc3MsIHNldCB0aGUgZXZlbnQgYW5kIHRoZW4gY2xlYXIgaXQgaW4gdGhlIGNhbGxiYWNrXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBldmVudDogZXZlbnQgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpczIuc2V0U3RhdGUoeyBldmVudDogbnVsbCB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFdyYXBwZWRDb21wb25lbnQsIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCB7IGtleWRvd246IHRoaXMuc3RhdGUgfSkpO1xuICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBLZXlCb2FyZEhlbHBlcjtcbiAgfShSZWFjdC5Db21wb25lbnQpO1xuXG4gIHN0b3JlLnNldEJpbmRpbmcoeyBrZXlzOiBbXS5jb25jYXQoa2V5cyksIGZuOiBLZXlCb2FyZEhlbHBlci5wcm90b3R5cGUuaGFuZGxlS2V5RG93biwgdGFyZ2V0OiBLZXlCb2FyZEhlbHBlci5wcm90b3R5cGUgfSk7XG5cbiAgcmV0dXJuIEtleUJvYXJkSGVscGVyO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjb21wb25lbnRXcmFwcGVyO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvY2xhc3NfZGVjb3JhdG9yLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG4vKipcbiAqIEBtb2R1bGUgZGVjb3JhdG9yc1xuICpcbiAqL1xuaW1wb3J0IGNsYXNzV3JhcHBlciBmcm9tICcuL2NsYXNzX2RlY29yYXRvcic7XG5pbXBvcnQgbWV0aG9kV3JhcHBlciBmcm9tICcuL21ldGhvZF9kZWNvcmF0b3InO1xuaW1wb3J0IG1ldGhvZFdyYXBwZXJTY29wZWQgZnJvbSAnLi9tZXRob2RfZGVjb3JhdG9yX3Njb3BlZCc7XG5cbi8qKlxuICogbm9vcERlY29yYXRvclxuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHJldHVybiB7dW5kZWZpbmVkfSBSZXR1cm5zIGB1bmRlZmluZWRgIHNvIHRoYXQgdGhlIG9yaWdpbmFsIHVuZGVjb3JhdGVkIGluc3RhbmNlL21ldGhvZCBpcyB1c2VkXG4gKi9cbmZ1bmN0aW9uIG5vb3BEZWNvcmF0b3IoKSB7XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogX2RlY29yYXRvclxuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWV0aG9kRm4gVGhlIG1ldGhvZCB3cmFwcGVyIHRvIGRlbGVnYXRlIHRvLCBiYXNlZCBvbiB3aGV0aGVyIHVzZXIgaGFzIHNwZWNpZmllZCBhIHNjb3BlZCBkZWNvcmF0b3Igb3Igbm90XG4gKiBAcGFyYW0ge0FycmF5fSAuLi5hcmdzIFJlbWFpbmRlciBvZiBhcmd1bWVudHMgcGFzc2VkIGluXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIGRlY29yYXRlZCBjbGFzcyBvciBtZXRob2RcbiAqL1xuZnVuY3Rpb24gX2RlY29yYXRvcihtZXRob2RGbikge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBhcmdzW19rZXkgLSAxXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIC8vIGNoZWNrIHRoZSBmaXJzdCBhcmd1bWVudCB0byBzZWUgaWYgaXQncyBhIHVzZXItc3VwcGxpZWQga2V5Y29kZSBvciBhcnJheVxuICAvLyBvZiBrZXljb2Rlcywgb3IgaWYgaXQncyB0aGUgd3JhcHBlZCBjbGFzcyBvciBtZXRob2RcbiAgdmFyIHRlc3RBcmcgPSBhcmdzWzBdO1xuICB2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkodGVzdEFyZyk7XG5cbiAgLy8gaWYgdGhlIHRlc3QgYXJndW1lbnQgaXMgbm90IGFuIG9iamVjdCBvciBmdW5jdGlvbiwgaXQgaXMgdXNlci1zdXBwbGllZFxuICAvLyBrZXljb2Rlcy4gZWxzZSB0aGVyZSBhcmUgbm8gYXJndW1lbnRzIGFuZCBpdCdzIGp1c3QgdGhlIHdyYXBwZWQgY2xhc3NcbiAgaWYgKGlzQXJyYXkgfHwgflsnc3RyaW5nJywgJ251bWJlcicsICdzeW1ib2wnXS5pbmRleE9mKHR5cGVvZiB0ZXN0QXJnID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZih0ZXN0QXJnKSkpIHtcbiAgICB2YXIga2V5cyA9IGlzQXJyYXkgPyB0ZXN0QXJnIDogYXJncztcblxuICAgIC8vIHJldHVybiB0aGUgZGVjb3JhdG9yIGZ1bmN0aW9uLCB3aGljaCBvbiB0aGUgbmV4dCBjYWxsIHdpbGwgbG9vayBmb3JcbiAgICAvLyB0aGUgcHJlc2VuY2Ugb2YgYSBtZXRob2QgbmFtZSB0byBkZXRlcm1pbmUgaWYgdGhpcyBpcyBhIHdyYXBwZWQgbWV0aG9kXG4gICAgLy8gb3IgY29tcG9uZW50XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIG1ldGhvZE5hbWUsIGRlc2NyaXB0b3IpIHtcbiAgICAgIHJldHVybiBtZXRob2ROYW1lID8gbWV0aG9kRm4oeyB0YXJnZXQ6IHRhcmdldCwgZGVzY3JpcHRvcjogZGVzY3JpcHRvciwga2V5czoga2V5cyB9KSA6IGNsYXNzV3JhcHBlcih0YXJnZXQsIGtleXMpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgdmFyIFdyYXBwZWRDb21wb25lbnQgPSBhcmdzWzBdO1xuICAgIHZhciBtZXRob2ROYW1lID0gYXJnc1sxXTtcblxuICAgIC8vIG1ldGhvZCBkZWNvcmF0b3JzIHdpdGhvdXQga2V5Y29kZSAod2hpY2gpIGFyZ3VtZW50cyBhcmUgbm90IGFsbG93ZWQuXG4gICAgaWYgKFdyYXBwZWRDb21wb25lbnQgJiYgIW1ldGhvZE5hbWUpIHtcbiAgICAgIHJldHVybiBjbGFzc1dyYXBwZXIuYXBwbHkodW5kZWZpbmVkLCBhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKG1ldGhvZE5hbWUgKyAnOiBNZXRob2QgZGVjb3JhdG9ycyBtdXN0IGhhdmUga2V5Y29kZSBhcmd1bWVudHMsIHNvIHRoZSBkZWNvcmF0b3IgZm9yIHRoaXMgbWV0aG9kIHdpbGwgbm90IGRvIGFueXRoaW5nJyk7XG4gICAgICByZXR1cm4gbm9vcERlY29yYXRvcjtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBrZXlkb3duU2NvcGVkXG4gKlxuICogTWV0aG9kIGRlY29yYXRvciB0aGF0IHdpbGwgbG9vayBmb3IgY2hhbmdlcyB0byBpdHMgdGFyZ2V0ZWQgY29tcG9uZW50J3NcbiAqIGBrZXlkb3duYCBwcm9wcyB0byBkZWNpZGUgd2hlbiB0byB0cmlnZ2VyLCByYXRoZXIgdGhhbiByZXNwb25kaW5nIGRpcmVjdGx5XG4gKiB0byBrZXlkb3duIGV2ZW50cy4gVGhpcyBsZXRzIHlvdSBzcGVjaWZ5IGEgQGtleWRvd24gZGVjb3JhdGVkIGNsYXNzIGhpZ2hlclxuICogdXAgaW4gdGhlIHZpZXcgaGllcmFyY2h5IGZvciBsYXJnZXIgc2NvcGluZyBvZiBrZXlkb3duIGV2ZW50cywgb3IgZm9yXG4gKiBwcm9ncmFtbWF0aWNhbGx5IHNlbmRpbmcga2V5ZG93biBldmVudHMgYXMgcHJvcHMgaW50byB0aGUgY29tcG9uZW50cyBpbiBvcmRlclxuICogdG8gdHJpZ2dlciBkZWNvcmF0ZWQgbWV0aG9kcyB3aXRoIG1hdGNoaW5nIGtleXMuXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7QXJyYXl9IC4uLmFyZ3MgIEFsbCAob3Igbm8pIGFyZ3VtZW50cyBwYXNzZWQgaW4gZnJvbSBkZWNvcmF0aW9uXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIGRlY29yYXRlZCBjbGFzcyBvciBtZXRob2RcbiAqL1xuZnVuY3Rpb24ga2V5ZG93blNjb3BlZCgpIHtcbiAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbjIpLCBfa2V5MiA9IDA7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICBhcmdzW19rZXkyXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gIH1cblxuICByZXR1cm4gX2RlY29yYXRvci5hcHBseSh1bmRlZmluZWQsIFttZXRob2RXcmFwcGVyU2NvcGVkXS5jb25jYXQoYXJncykpO1xufVxuXG4vKipcbiAqIGtleWRvd25cbiAqXG4gKiBUaGUgbWFpbiBkZWNvcmF0b3IgYW5kIGRlZmF1bHQgZXhwb3J0LCBoYW5kbGVzIGJvdGggY2xhc3NlcyBhbmQgbWV0aG9kcy5cbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtBcnJheX0gLi4uYXJncyAgQWxsIChvciBubykgYXJndW1lbnRzIHBhc3NlZCBpbiBmcm9tIGRlY29yYXRpb25cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgZGVjb3JhdGVkIGNsYXNzIG9yIG1ldGhvZFxuICovXG5mdW5jdGlvbiBrZXlkb3duKCkge1xuICBmb3IgKHZhciBfbGVuMyA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuMyksIF9rZXkzID0gMDsgX2tleTMgPCBfbGVuMzsgX2tleTMrKykge1xuICAgIGFyZ3NbX2tleTNdID0gYXJndW1lbnRzW19rZXkzXTtcbiAgfVxuXG4gIHJldHVybiBfZGVjb3JhdG9yLmFwcGx5KHVuZGVmaW5lZCwgW21ldGhvZFdyYXBwZXJdLmNvbmNhdChhcmdzKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGtleWRvd247XG5cbmV4cG9ydCB7IGtleWRvd25TY29wZWQgfTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9kZWNvcmF0b3JzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA4NDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG4vKipcbiAqIEBtb2R1bGUgbWV0aG9kV3JhcHBlclxuICpcbiAqL1xuaW1wb3J0ICogYXMgc3RvcmUgZnJvbSAnLi4vc3RvcmUnO1xuaW1wb3J0IHsgb25Nb3VudCwgb25Vbm1vdW50LCBfb25LZXlEb3duIH0gZnJvbSAnLi4vZXZlbnRfaGFuZGxlcnMnO1xuXG4vKipcbiAqIF9pc1JlYWN0S2V5RG93blxuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IFRoZSBwb3NzaWJseSBzeW50aGV0aWMgZXZlbnQgcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHdpdGhcbiAqIHRoZSBtZXRob2QgaW52b2NhdGlvbi5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIF9pc1JlYWN0S2V5RG93bihldmVudCkge1xuICByZXR1cm4gZXZlbnQgJiYgKHR5cGVvZiBldmVudCA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoZXZlbnQpKSA9PT0gJ29iamVjdCcgJiYgZXZlbnQubmF0aXZlRXZlbnQgaW5zdGFuY2VvZiB3aW5kb3cuS2V5Ym9hcmRFdmVudCAmJiBldmVudC50eXBlID09PSAna2V5ZG93bic7XG59XG5cbi8qKlxuICogbWV0aG9kV3JhcHBlclxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncyBBbGwgYXJndW1lbnRzIG5lY2Vzc2FyeSBmb3Igd3JhcHBpbmcgbWV0aG9kXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncy50YXJnZXQgVGhlIGRlY29yYXRlZCBjbGFzc1xuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MuZGVzY3JpcHRvciBNZXRob2QgZGVzY3JpcHRvclxuICogQHBhcmFtIHthcnJheX0gYXJncy5rZXlzIFRoZSBhcnJheSBvZiBrZXlzIGJvdW5kIHRvIHRoZSBnaXZlbiBtZXRob2RcbiAqIEByZXR1cm4ge29iamVjdH0gVGhlIG1ldGhvZCBkZXNjcmlwdG9yXG4gKi9cbmZ1bmN0aW9uIG1ldGhvZFdyYXBwZXIoX3JlZikge1xuICB2YXIgdGFyZ2V0ID0gX3JlZi50YXJnZXQsXG4gICAgICBkZXNjcmlwdG9yID0gX3JlZi5kZXNjcmlwdG9yLFxuICAgICAga2V5cyA9IF9yZWYua2V5cztcblxuXG4gIHZhciBmbiA9IGRlc2NyaXB0b3IudmFsdWU7XG5cbiAgLy8gaWYgd2UgaGF2ZW4ndCBhbHJlYWR5IGNyZWF0ZWQgYSBiaW5kaW5nIGZvciB0aGlzIGNsYXNzICh2aWEgYW5vdGhlclxuICAvLyBkZWNvcmF0ZWQgbWV0aG9kKSwgd3JhcCB0aGVzZSBsaWZlY3ljbGUgbWV0aG9kcy5cbiAgaWYgKCFzdG9yZS5nZXRCaW5kaW5nKHRhcmdldCkpIHtcbiAgICB2YXIgY29tcG9uZW50RGlkTW91bnQgPSB0YXJnZXQuY29tcG9uZW50RGlkTW91bnQsXG4gICAgICAgIGNvbXBvbmVudFdpbGxVbm1vdW50ID0gdGFyZ2V0LmNvbXBvbmVudFdpbGxVbm1vdW50O1xuXG5cbiAgICB0YXJnZXQuY29tcG9uZW50RGlkTW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBvbk1vdW50KHRoaXMpO1xuICAgICAgaWYgKGNvbXBvbmVudERpZE1vdW50KSByZXR1cm4gY29tcG9uZW50RGlkTW91bnQuY2FsbCh0aGlzKTtcbiAgICB9O1xuXG4gICAgdGFyZ2V0LmNvbXBvbmVudFdpbGxVbm1vdW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgb25Vbm1vdW50KHRoaXMpO1xuICAgICAgaWYgKGNvbXBvbmVudFdpbGxVbm1vdW50KSByZXR1cm4gY29tcG9uZW50V2lsbFVubW91bnQuY2FsbCh0aGlzKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gYWRkIHRoaXMgYmluZGluZyBvZiBrZXlzIGFuZCBtZXRob2QgdG8gdGhlIHRhcmdldCdzIGJpbmRpbmdzXG4gIHN0b3JlLnNldEJpbmRpbmcoeyBrZXlzOiBrZXlzLCB0YXJnZXQ6IHRhcmdldCwgZm46IGZuIH0pO1xuXG4gIGRlc2NyaXB0b3IudmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgfVxuXG4gICAgdmFyIG1heWJlRXZlbnQgPSBhcmdzWzBdO1xuXG4gICAgaWYgKF9pc1JlYWN0S2V5RG93bihtYXliZUV2ZW50KSkge1xuICAgICAgLy8gcHJveHkgbWV0aG9kIGluIG9yZGVyIHRvIHVzZSBAa2V5ZG93biBhcyBmaWx0ZXIgZm9yIGtleWRvd24gZXZlbnRzIGNvbWluZ1xuICAgICAgLy8gZnJvbSBhbiBhY3R1YWwgb25LZXlEb3duIGJpbmRpbmcgKGFzIGlkZW50aWZpZWQgYnkgcmVhY3QncyBhZGRpdGlvbiBvZlxuICAgICAgLy8gJ25hdGl2ZUV2ZW50JyArIHR5cGUgPT09ICdrZXlkb3duJylcbiAgICAgIGlmICghbWF5YmVFdmVudC5jdHJsS2V5KSB7XG4gICAgICAgIC8vIHdlIGFscmVhZHkgd2hpdGVsaXN0IHNob3J0Y3V0cyB3aXRoIGN0cmwgbW9kaWZpZXJzIHNvIGlmIHdlIHdlcmUgdG9cbiAgICAgICAgLy8gZmlyZSBpdCBhZ2FpbiBoZXJlIHRoZSBtZXRob2Qgd291bGQgdHJpZ2dlciB0d2ljZS4gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9nbG9ydGhvL3JlYWN0LWtleWRvd24vaXNzdWVzLzM4XG4gICAgICAgIHJldHVybiBfb25LZXlEb3duKG1heWJlRXZlbnQsIHRydWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIW1heWJlRXZlbnQgfHwgIShtYXliZUV2ZW50IGluc3RhbmNlb2Ygd2luZG93LktleWJvYXJkRXZlbnQpIHx8IG1heWJlRXZlbnQudHlwZSAhPT0gJ2tleWRvd24nKSB7XG4gICAgICAvLyBpZiBvdXIgZmlyc3QgYXJndW1lbnQgaXMgYSBrZXlkb3duIGV2ZW50IGl0IGlzIGJlaW5nIGhhbmRsZWQgYnkgb3VyXG4gICAgICAvLyBiaW5kaW5nIHN5c3RlbS4gaWYgaXQncyBhbnl0aGluZyBlbHNlLCBqdXN0IHBhc3MgdGhyb3VnaC5cbiAgICAgIHJldHVybiBmbi5jYWxsLmFwcGx5KGZuLCBbdGhpc10uY29uY2F0KGFyZ3MpKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGRlc2NyaXB0b3I7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1ldGhvZFdyYXBwZXI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9tZXRob2RfZGVjb3JhdG9yLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBAbW9kdWxlIG1ldGhvZFdyYXBwZXJTY29wZWRcbiAqXG4gKi9cbmltcG9ydCBtYXRjaEtleXMgZnJvbSAnLi4vbGliL21hdGNoX2tleXMnO1xuaW1wb3J0IHBhcnNlS2V5cyBmcm9tICcuLi9saWIvcGFyc2Vfa2V5cyc7XG5cbi8qKlxuICogbWV0aG9kV3JhcHBlclNjb3BlZFxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncyBBbGwgYXJncyBuZWNlc3NhcnkgZm9yIGRlY29yYXRpbmcgdGhlIG1ldGhvZFxuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MudGFyZ2V0IFRoZSBkZWNvcmF0ZWQgbWV0aG9kJ3MgY2xhc3Mgb2JqZWN0XG4gKiBAcGFyYW0ge29iamVjdH0gYXJncy5kZXNjcmlwdG9yIFRoZSBtZXRob2QncyBkZXNjcmlwdG9yIG9iamVjdFxuICogQHBhcmFtIHthcnJheX0gYXJncy5rZXlzIFRoZSBrZXkgY29kZXMgYm91bmQgdG8gdGhlIGRlY29yYXRlZCBtZXRob2RcbiAqIEByZXR1cm4ge29iamVjdH0gVGhlIG1ldGhvZCdzIGRlc2NyaXB0b3Igb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIG1ldGhvZFdyYXBwZXJTY29wZWQoX3JlZikge1xuICB2YXIgdGFyZ2V0ID0gX3JlZi50YXJnZXQsXG4gICAgICBkZXNjcmlwdG9yID0gX3JlZi5kZXNjcmlwdG9yLFxuICAgICAga2V5cyA9IF9yZWYua2V5cztcbiAgdmFyIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgPSB0YXJnZXQuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcztcblxuICB2YXIgZm4gPSBkZXNjcmlwdG9yLnZhbHVlO1xuICBpZiAoIWtleXMpIHtcbiAgICBjb25zb2xlLndhcm4oZm4gKyAnOiBrZXlkb3duU2NvcGVkIHJlcXVpcmVzIG9uZSBvciBtb3JlIGtleXMnKTtcbiAgfSBlbHNlIHtcblxuICAgIC8qKlxuICAgICAqIF9zaG91bGRUcmlnZ2VyXG4gICAgICpcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhpc1Byb3BzIEV4c3RpbmcgcHJvcHMgZnJvbSB0aGUgd3JhcHBlZCBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdGhpc1Byb3BzLmtleWRvd24gVGhlIG5hbWVzcGFjZWQgc3RhdGUgZnJvbSB0aGUgaGlnaGVyLW9yZGVyXG4gICAgICogY29tcG9uZW50IChjbGFzc19kZWNvcmF0b3IpXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG5leHRQcm9wcyBUaGUgaW5jb21pbmcgcHJvcHMgZnJvbSB0aGUgd3JhcHBlZCBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbmV4dFByb3BzLmtleWRvd24gVGhlIG5hbWVzY2FwZWQgc3RhdGUgZnJvbSB0aGUgaGlnaGVyLW9yZGVyXG4gICAgICogY29tcG9uZW50IChjbGFzc19kZWNvcmF0b3IpXG4gICAgICogQHBhcmFtIHthcnJheX0ga2V5cyBUaGUga2V5cyBib3VuZCB0byB0aGUgZGVjb3JhdGVkIG1ldGhvZFxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgYWxsIHRlc3RzIGhhdmUgcGFzc2VkXG4gICAgICovXG4gICAgdmFyIF9zaG91bGRUcmlnZ2VyID0gZnVuY3Rpb24gX3Nob3VsZFRyaWdnZXIoa2V5ZG93blRoaXMsIGtleWRvd25OZXh0KSB7XG4gICAgICBpZiAoIShrZXlkb3duTmV4dCAmJiBrZXlkb3duTmV4dC5ldmVudCAmJiAha2V5ZG93blRoaXMuZXZlbnQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHJldHVybiBrZXlTZXRzLnNvbWUoZnVuY3Rpb24gKGtleVNldCkge1xuICAgICAgICByZXR1cm4gbWF0Y2hLZXlzKHsga2V5U2V0OiBrZXlTZXQsIGV2ZW50OiBrZXlkb3duTmV4dC5ldmVudCB9KTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyB3cmFwIHRoZSBjb21wb25lbnQncyBsaWZlY3ljbGUgbWV0aG9kIHRvIGludGVyY2VwdCBrZXkgY29kZXMgY29taW5nIGRvd25cbiAgICAvLyBmcm9tIHRoZSB3cmFwcGVkL3Njb3BlZCBjb21wb25lbnQgdXAgdGhlIHZpZXcgaGllcmFyY2h5LiBpZiBuZXcga2V5ZG93blxuICAgIC8vIGV2ZW50IGhhcyBhcnJpdmVkIGFuZCB0aGUga2V5IGNvZGVzIG1hdGNoIHdoYXQgd2FzIHNwZWNpZmllZCBpbiB0aGVcbiAgICAvLyBkZWNvcmF0b3IsIGNhbGwgdGhlIHdyYXBwZWQgbWV0aG9kLlxuXG5cbiAgICB2YXIga2V5U2V0cyA9IHBhcnNlS2V5cyhrZXlzKTt0YXJnZXQuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICAgIHZhciBrZXlkb3duTmV4dCA9IG5leHRQcm9wcy5rZXlkb3duO1xuICAgICAgdmFyIGtleWRvd25UaGlzID0gdGhpcy5wcm9wcy5rZXlkb3duO1xuXG5cbiAgICAgIGlmIChfc2hvdWxkVHJpZ2dlcihrZXlkb3duVGhpcywga2V5ZG93bk5leHQpKSB7XG4gICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGtleWRvd25OZXh0LmV2ZW50KTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuID4gMSA/IF9sZW4gLSAxIDogMCksIF9rZXkgPSAxOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIGFyZ3NbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICBpZiAoY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcykgcmV0dXJuIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMuY2FsbC5hcHBseShjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzLCBbdGhpcywgbmV4dFByb3BzXS5jb25jYXQoYXJncykpO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gZGVzY3JpcHRvcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWV0aG9kV3JhcHBlclNjb3BlZDtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9kZWNvcmF0b3JzL21ldGhvZF9kZWNvcmF0b3Jfc2NvcGVkLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gcG9seWZpbGwgYXJyYXkuZnJvbSAobWFpbmx5IGZvciBJRSlcbmltcG9ydCAnLi9saWIvYXJyYXkuZnJvbSc7XG5cbi8vIEBrZXlkb3duIGFuZCBAa2V5ZG93blNjb3BlZFxuZXhwb3J0IHsgZGVmYXVsdCwga2V5ZG93blNjb3BlZCB9IGZyb20gJy4vZGVjb3JhdG9ycyc7XG5cbi8vIHNldEJpbmRpbmcgLSBvbmx5IHVzZWZ1bCBpZiB5b3UncmUgbm90IGdvaW5nIHRvIHVzZSBkZWNvcmF0b3JzXG5leHBvcnQgeyBzZXRCaW5kaW5nIH0gZnJvbSAnLi9zdG9yZSc7XG5cbi8vIEtleXMgLSB1c2UgdGhpcyB0byBmaW5kIGtleSBjb2RlcyBmb3Igc3RyaW5ncy4gZm9yIGV4YW1wbGU6IEtleXMuaiwgS2V5cy5lbnRlclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBLZXlzLCBBTExfS0VZUywgQUxMX1BSSU5UQUJMRV9LRVlTIH0gZnJvbSAnLi9saWIva2V5cyc7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDg0NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBQcm9kdWN0aW9uIHN0ZXBzIG9mIEVDTUEtMjYyLCBFZGl0aW9uIDYsIDIyLjEuMi4xXG4vLyBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvZnJvbVxuaWYgKCFBcnJheS5mcm9tKSB7XG4gIEFycmF5LmZyb20gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgICB2YXIgaXNDYWxsYWJsZSA9IGZ1bmN0aW9uIGlzQ2FsbGFibGUoZm4pIHtcbiAgICAgIHJldHVybiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicgfHwgdG9TdHIuY2FsbChmbikgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG4gICAgfTtcbiAgICB2YXIgdG9JbnRlZ2VyID0gZnVuY3Rpb24gdG9JbnRlZ2VyKHZhbHVlKSB7XG4gICAgICB2YXIgbnVtYmVyID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgIGlmIChpc05hTihudW1iZXIpKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgICAgaWYgKG51bWJlciA9PT0gMCB8fCAhaXNGaW5pdGUobnVtYmVyKSkge1xuICAgICAgICByZXR1cm4gbnVtYmVyO1xuICAgICAgfVxuICAgICAgcmV0dXJuIChudW1iZXIgPiAwID8gMSA6IC0xKSAqIE1hdGguZmxvb3IoTWF0aC5hYnMobnVtYmVyKSk7XG4gICAgfTtcbiAgICB2YXIgbWF4U2FmZUludGVnZXIgPSBNYXRoLnBvdygyLCA1MykgLSAxO1xuICAgIHZhciB0b0xlbmd0aCA9IGZ1bmN0aW9uIHRvTGVuZ3RoKHZhbHVlKSB7XG4gICAgICB2YXIgbGVuID0gdG9JbnRlZ2VyKHZhbHVlKTtcbiAgICAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChsZW4sIDApLCBtYXhTYWZlSW50ZWdlcik7XG4gICAgfTtcblxuICAgIC8vIFRoZSBsZW5ndGggcHJvcGVydHkgb2YgdGhlIGZyb20gbWV0aG9kIGlzIDEuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGZyb20oYXJyYXlMaWtlIC8qLCBtYXBGbiwgdGhpc0FyZyAqLykge1xuICAgICAgLy8gMS4gTGV0IEMgYmUgdGhlIHRoaXMgdmFsdWUuXG4gICAgICB2YXIgQyA9IHRoaXM7XG5cbiAgICAgIC8vIDIuIExldCBpdGVtcyBiZSBUb09iamVjdChhcnJheUxpa2UpLlxuICAgICAgdmFyIGl0ZW1zID0gT2JqZWN0KGFycmF5TGlrZSk7XG5cbiAgICAgIC8vIDMuIFJldHVybklmQWJydXB0KGl0ZW1zKS5cbiAgICAgIGlmIChhcnJheUxpa2UgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJyYXkuZnJvbSByZXF1aXJlcyBhbiBhcnJheS1saWtlIG9iamVjdCAtIG5vdCBudWxsIG9yIHVuZGVmaW5lZFwiKTtcbiAgICAgIH1cblxuICAgICAgLy8gNC4gSWYgbWFwZm4gaXMgdW5kZWZpbmVkLCB0aGVuIGxldCBtYXBwaW5nIGJlIGZhbHNlLlxuICAgICAgdmFyIG1hcEZuID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB2b2lkIHVuZGVmaW5lZDtcbiAgICAgIHZhciBUO1xuICAgICAgaWYgKHR5cGVvZiBtYXBGbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgLy8gNS4gZWxzZVxuICAgICAgICAvLyA1LiBhIElmIElzQ2FsbGFibGUobWFwZm4pIGlzIGZhbHNlLCB0aHJvdyBhIFR5cGVFcnJvciBleGNlcHRpb24uXG4gICAgICAgIGlmICghaXNDYWxsYWJsZShtYXBGbikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcnJheS5mcm9tOiB3aGVuIHByb3ZpZGVkLCB0aGUgc2Vjb25kIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gNS4gYi4gSWYgdGhpc0FyZyB3YXMgc3VwcGxpZWQsIGxldCBUIGJlIHRoaXNBcmc7IGVsc2UgbGV0IFQgYmUgdW5kZWZpbmVkLlxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICBUID0gYXJndW1lbnRzWzJdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIDEwLiBMZXQgbGVuVmFsdWUgYmUgR2V0KGl0ZW1zLCBcImxlbmd0aFwiKS5cbiAgICAgIC8vIDExLiBMZXQgbGVuIGJlIFRvTGVuZ3RoKGxlblZhbHVlKS5cbiAgICAgIHZhciBsZW4gPSB0b0xlbmd0aChpdGVtcy5sZW5ndGgpO1xuXG4gICAgICAvLyAxMy4gSWYgSXNDb25zdHJ1Y3RvcihDKSBpcyB0cnVlLCB0aGVuXG4gICAgICAvLyAxMy4gYS4gTGV0IEEgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0NvbnN0cnVjdF1dIGludGVybmFsIG1ldGhvZCBcbiAgICAgIC8vIG9mIEMgd2l0aCBhbiBhcmd1bWVudCBsaXN0IGNvbnRhaW5pbmcgdGhlIHNpbmdsZSBpdGVtIGxlbi5cbiAgICAgIC8vIDE0LiBhLiBFbHNlLCBMZXQgQSBiZSBBcnJheUNyZWF0ZShsZW4pLlxuICAgICAgdmFyIEEgPSBpc0NhbGxhYmxlKEMpID8gT2JqZWN0KG5ldyBDKGxlbikpIDogbmV3IEFycmF5KGxlbik7XG5cbiAgICAgIC8vIDE2LiBMZXQgayBiZSAwLlxuICAgICAgdmFyIGsgPSAwO1xuICAgICAgLy8gMTcuIFJlcGVhdCwgd2hpbGUgayA8IGxlbuKApiAoYWxzbyBzdGVwcyBhIC0gaClcbiAgICAgIHZhciBrVmFsdWU7XG4gICAgICB3aGlsZSAoayA8IGxlbikge1xuICAgICAgICBrVmFsdWUgPSBpdGVtc1trXTtcbiAgICAgICAgaWYgKG1hcEZuKSB7XG4gICAgICAgICAgQVtrXSA9IHR5cGVvZiBUID09PSAndW5kZWZpbmVkJyA/IG1hcEZuKGtWYWx1ZSwgaykgOiBtYXBGbi5jYWxsKFQsIGtWYWx1ZSwgayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgQVtrXSA9IGtWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBrICs9IDE7XG4gICAgICB9XG4gICAgICAvLyAxOC4gTGV0IHB1dFN0YXR1cyBiZSBQdXQoQSwgXCJsZW5ndGhcIiwgbGVuLCB0cnVlKS5cbiAgICAgIEEubGVuZ3RoID0gbGVuO1xuICAgICAgLy8gMjAuIFJldHVybiBBLlxuICAgICAgcmV0dXJuIEE7XG4gICAgfTtcbiAgfSgpO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9hcnJheS5mcm9tLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBAbW9kdWxlIGRvbUhlbHBlcnNcbiAqXG4gKi9cbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuXG52YXIgZm9jdXNhYmxlU2VsZWN0b3IgPSAnYVtocmVmXSwgYnV0dG9uLCBpbnB1dCwgb2JqZWN0LCBzZWxlY3QsIHRleHRhcmVhLCBbdGFiaW5kZXhdJztcblxuLyoqXG4gKiBiaW5kRm9jdXNhYmxlczogRmluZCBhbnkgZm9jdXNhYmxlIGNoaWxkIGVsZW1lbnRzIG9mIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgYW5kXG4gKiBhZGQgYW4gb25Gb2N1cyBoYW5kbGVyIHRvIGZvY3VzIG91ciBrZXlkb3duIGhhbmRsZXJzIG9uIHRoZSBwYXJlbnQgY29tcG9uZW50XG4gKiB3aGVuIHVzZXIga2V5cyBhcHBsaWVzIGZvY3VzIHRvIHRoZSBlbGVtZW50LlxuICpcbiAqIE5PVEU6IE9uZSBsaW1pdGF0aW9uIG9mIHRoaXMgcmlnaHQgbm93IGlzIHRoYXQgaWYgeW91IHRhYiBvdXQgb2YgdGhlXG4gKiBjb21wb25lbnQsIF9mb2N1c2VkSW5zdGFuY2Ugd2lsbCBzdGlsbCBiZSBzZXQgdW50aWwgbmV4dCBjbGljayBvciBtb3VudCBvclxuICogY29udHJvbGxlZCBmb2N1cy5cbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IGluc3RhbmNlIFRoZSBrZXktYm91bmQgY29tcG9uZW50IGluc3RhbmNlXG4gKiBAcGFyYW0ge2NhbGxiYWNrfSBhY3RpdmF0ZU9uRm9jdXMgVGhlIGZuIHRvIGZpcmUgd2hlbiBlbGVtZW50IGlzIGZvY3VzZWRcbiAqL1xuZnVuY3Rpb24gYmluZEZvY3VzYWJsZXMoaW5zdGFuY2UsIGFjdGl2YXRlT25Gb2N1cykge1xuICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKGluc3RhbmNlKTtcbiAgICAgIGlmIChub2RlKSB7XG4gICAgICAgIHZhciBmb2N1c2FibGVzID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKGZvY3VzYWJsZVNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGZvY3VzYWJsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIG9uRm9jdXMgPSBmdW5jdGlvbiBvbkZvY3VzKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBvbkZvY3VzUHJldiA9IGVsZW1lbnQub25mb2N1cztcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgYWN0aXZhdGVPbkZvY3VzKGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgaWYgKG9uRm9jdXNQcmV2KSBvbkZvY3VzUHJldi5jYWxsKGVsZW1lbnQsIGV2ZW50KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfTtcbiAgICAgICAgICBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmb2N1c2FibGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5vbmZvY3VzID0gb25Gb2N1cyhlbGVtZW50KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBub29wLCBtb3N0bHkgc3VwcHJlc3NpbmcgZXJyb3IgaGVyZSBodHRwczovL2dpdGh1Yi5jb20vZ2xvcnRoby9yZWFjdC1rZXlkb3duL2lzc3Vlcy83NlxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIGZpbmRDb250YWluZXJOb2RlczogQ2FsbGVkIGJ5IG91ciBjbGljayBoYW5kbGVyIHRvIGZpbmQgaW5zdGFuY2VzIHdpdGggbm9kZXNcbiAqIHRoYXQgYXJlIGVxdWFsIHRvIG9yIHRoYXQgY29udGFpbiB0aGUgY2xpY2sgdGFyZ2V0LiBBbnkgdGhhdCBwYXNzIHRoaXMgdGVzdFxuICogd2lsbCBiZSByZWNpcGllbnRzIG9mIHRoZSBuZXh0IGtleWRvd24gZXZlbnQuXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXQgVGhlIGNsaWNrIGV2ZW50LnRhcmdldCBET00gZWxlbWVudFxuICogQHJldHVybiB7ZnVuY3Rpb259IFJlZHVjZXIgZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gZmluZENvbnRhaW5lck5vZGVzKHRhcmdldCkge1xuICByZXR1cm4gZnVuY3Rpb24gKG1lbW8sIGluc3RhbmNlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBub2RlID0gUmVhY3RET00uZmluZERPTU5vZGUoaW5zdGFuY2UpO1xuICAgICAgaWYgKG5vZGUgJiYgKG5vZGUgPT09IHRhcmdldCB8fCBub2RlLmNvbnRhaW5zKHRhcmdldCkpKSB7XG4gICAgICAgIG1lbW8ucHVzaCh7IGluc3RhbmNlOiBpbnN0YW5jZSwgbm9kZTogbm9kZSB9KTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIHNvcnRCeURPTVBvc2l0aW9uOiBDYWxsZWQgYnkgb3VyIGNsaWNrIGhhbmRsZXIgdG8gc29ydCBhIGxpc3Qgb2YgaW5zdGFuY2VzXG4gKiBhY2NvcmRpbmcgdG8gbGVhc3QgLT4gbW9zdCBuZXN0ZWQuIFRoaXMgaXMgc28gdGhhdCBpZiBtdWx0aXBsZSBrZXlib3VuZFxuICogaW5zdGFuY2VzIGhhdmUgbm9kZXMgdGhhdCBhcmUgYW5jZXN0b3JzIG9mIHRoZSBjbGljayB0YXJnZXQsIHRoZXkgd2lsbCBiZVxuICogc29ydGVkIHRvIGxldCB0aGUgaW5zdGFuY2UgY2xvc2VzdCB0byB0aGUgY2xpY2sgdGFyZ2V0IGdldCBmaXJzdCBkaWJzIG9uIHRoZVxuICogbmV4dCBrZXkgZG93biBldmVudC5cbiAqL1xuZnVuY3Rpb24gc29ydEJ5RE9NUG9zaXRpb24oYSwgYikge1xuICByZXR1cm4gYS5ub2RlLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKGIubm9kZSkgPT09IDEwID8gMSA6IC0xO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7IGJpbmRGb2N1c2FibGVzOiBiaW5kRm9jdXNhYmxlcywgZmluZENvbnRhaW5lck5vZGVzOiBmaW5kQ29udGFpbmVyTm9kZXMsIHNvcnRCeURPTVBvc2l0aW9uOiBzb3J0QnlET01Qb3NpdGlvbiB9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9kb21faGVscGVycy5qc1xuLy8gbW9kdWxlIGlkID0gODQ3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogQG1vZHVsZSBMaXN0ZW5lcnNcbiAqXG4gKi9cblxuLy8gZmxhZyBmb3Igd2hldGhlciBjbGljayBsaXN0ZW5lciBoYXMgYmVlbiBib3VuZCB0byBkb2N1bWVudFxudmFyIF9jbGlja3NCb3VuZCA9IGZhbHNlO1xuXG4vLyBmbGFnIGZvciB3aGV0aGVyIGtleWRvd24gbGlzdGVuZXIgaGFzIGJlZW4gYm91bmQgdG8gZG9jdW1lbnRcbnZhciBfa2V5c0JvdW5kID0gZmFsc2U7XG5cbnZhciBMaXN0ZW5lcnMgPSB7XG4gIC8qKlxuICAgKiBfYmluZEtleXNcbiAgICpcbiAgICogQGFjY2VzcyBwdWJsaWNcbiAgICovXG4gIGJpbmRLZXlzOiBmdW5jdGlvbiBiaW5kS2V5cyhjYWxsYmFjaykge1xuICAgIGlmICghX2tleXNCb3VuZCkge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGNhbGxiYWNrKTtcbiAgICAgIF9rZXlzQm91bmQgPSB0cnVlO1xuICAgIH1cbiAgfSxcblxuXG4gIC8qKlxuICAgKiB1bmJpbmRLZXlzXG4gICAqXG4gICAqIEBhY2Nlc3MgcHVibGljXG4gICAqL1xuICB1bmJpbmRLZXlzOiBmdW5jdGlvbiB1bmJpbmRLZXlzKGNhbGxiYWNrKSB7XG4gICAgaWYgKF9rZXlzQm91bmQpIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBjYWxsYmFjayk7XG4gICAgICBfa2V5c0JvdW5kID0gZmFsc2U7XG4gICAgfVxuICB9LFxuXG5cbiAgLyoqXG4gICAqIGJpbmRDbGlja3NcbiAgICpcbiAgICogQGFjY2VzcyBwdWJsaWNcbiAgICovXG4gIGJpbmRDbGlja3M6IGZ1bmN0aW9uIGJpbmRDbGlja3MoY2FsbGJhY2spIHtcbiAgICBpZiAoIV9jbGlja3NCb3VuZCkge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYWxsYmFjaywgdHJ1ZSk7XG4gICAgICBfY2xpY2tzQm91bmQgPSB0cnVlO1xuICAgIH1cbiAgfSxcblxuXG4gIC8qKlxuICAgKiB1bmJpbmRDbGlja3NcbiAgICpcbiAgICogQGFjY2VzcyBwdWJsaWNcbiAgICovXG4gIHVuYmluZENsaWNrczogZnVuY3Rpb24gdW5iaW5kQ2xpY2tzKGNhbGxiYWNrKSB7XG4gICAgaWYgKF9jbGlja3NCb3VuZCkge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYWxsYmFjaywgdHJ1ZSk7XG4gICAgICBfY2xpY2tzQm91bmQgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IExpc3RlbmVycztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvbGlzdGVuZXJzLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gQ291bnRlciBiZWluZyBpbmNyZW1lbnRlZC4gSlMgaXMgc2luZ2xlLXRocmVhZGVkLCBzbyBpdCdsbCBKdXN0IFdvcmvihKIuXG52YXIgX19jb3VudGVyID0gMTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvY2Vzcy13aWRlIHVuaXF1ZSBpZGVudGlmaWVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB1dWlkKCkge1xuICByZXR1cm4gXCJ1aWQtXCIgKyBfX2NvdW50ZXIrKztcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvdXVpZC5qc1xuLy8gbW9kdWxlIGlkID0gODQ5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vXHQjIFBhcnNlciBSdWxlc1xuLy9cdFJ1bGVzIGNhbiBiZSBhcyBzaW1wbGUgYXMgYSBzdHJpbmcgYEtleXdvcmRgIG9yIGEgY29tcGxleCBzZXF1ZW5jZSBvZiAobmVzdGVkKSBydWxlcy5cbi8vXG4vL1x0UGFyc2UgYSBydWxlIHdpdGggYHJ1bGUucGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0LCBlbmQpYCwgdGhpcyB3aWxsIGVpdGhlcjpcbi8vXHRcdC0gcmV0dXJuIGB1bmRlZmluZWRgIGlmIHRoZSBydWxlIGRvZXNuJ3QgbWF0Y2ggdGhlIGhlYWQgb2YgdGhlIHRva2Vucywgb3Jcbi8vXHRcdC0gcmV0dXJuIGEgQ0xPTkUgb2YgdGhlIG1hdGNoZWQgcnVsZSB3aXRoIGF0IGxlYXN0IHRoZSBmb2xsb3dpbmc6XG4vL1x0XHRcdC0gYG1hdGNoZWRgXHRcdFJlc3VsdHMgb2YgeW91ciBwYXJzZS5cbi8vXHRcdFx0LSBgbmV4dFN0YXJ0YFx0UGxhY2Ugd2hlcmUgbmV4dCBtYXRjaCBzaG91bGQgc3RhcnQgKGVnOiBvbmUgYmV5b25kIHdoYXQgeW91IG1hdGNoZWQpLlxuLy9cbi8vXHRUaGUgY2xvbmUgcmV0dXJuZWQgYWJvdmUgY2FuIGJlIG1hbmlwdWxhdGVkIHdpdGhcbi8vXHRcdC0gYHJ1bGUudG9Tb3VyY2UoKWBcdCAgUmV0dXJuIGphdmFzY3JpcHQgc291cmNlIHRvIGludGVycHJldCB0aGUgcnVsZS5cbi8vXHRcdC0gYHJ1bGUudG9TeW50YXgoKWBcdCAgUmV0dXJuIHJ1bGVTeW50YXggZm9yIHRoZSBydWxlIChtb3N0bHkgZm9yIGRlYnVnZ2luZylcbi8vICAgIC1cbi8vXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuL1BhcnNlci5qc1wiO1xuaW1wb3J0IFRva2VuaXplciBmcm9tIFwiLi9Ub2tlbml6ZXIuanNcIjtcblxuaW1wb3J0IGdsb2JhbCBmcm9tIFwiLi91dGlscy9nbG9iYWxcIjtcbmltcG9ydCB7IGlzV2hpdGVzcGFjZSB9IGZyb20gXCIuL3V0aWxzL3N0cmluZ1wiO1xuXG5cbi8vIEFic3RyYWN0IFJ1bGUgY2xhc3MuXG4vLyBUT0RPQ1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnVsZSB7XG5cdGNvbnN0cnVjdG9yKC4uLnByb3BzKSB7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCAuLi5wcm9wcyk7XG5cdH1cblxuXHQvLyBDbG9uZSB0aGlzIHJ1bGUgYW5kIGFkZCBhbnkgYHByb3BzYCBwYXNzZWQgaW4uXG5cdGNsb25lKHByb3BzKSB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMsIHByb3BzKTtcblx0fVxuXG4vL1xuLy9cdFBhcnNpbmcgcHJpbWl0aXZlcyAtLSB5b3UgTVVTVCBpbXBsZW1lbnQgdGhlc2UgaW4geW91ciBzdWJjbGFzc2VzIVxuLy9cblxuXHQvLyBBdHRlbXB0IHRvIG1hdGNoIHRoaXMgcnVsZSBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgIG9mIGB0b2tlbnNgLlxuXHQvLyBSZXR1cm5zIHJlc3VsdHMgb2YgdGhlIHBhcnNlIG9yIGB1bmRlZmluZWRgLlxuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdC8vIFRlc3QgdG8gc2VlIGlmIGJpdHMgb2Ygb3VyIHJ1bGUgYXJlIGZvdW5kIEFOWVdIRVJFIGJldHdlZW4gYHN0YXJ0YCBhbmQgYGVuZGAgaW4gdGhlIGB0b2tlbnNgLlxuXHQvLyBUaGlzIGlzIHVzZWQgYnkgY29tcGxpY2F0ZWQgKGVnOiBsZWZ0IHJlY3Vyc2l2ZSkgcnVsZXMgdG8gZXhpdCBxdWlja2x5IGlmIHRoZXJlJ3Mgbm8gY2hhbmNlLlxuXHQvLyBSZXR1cm5zOlxuXHQvL1x0LSBgdHJ1ZWAgaWYgdGhlIHJ1bGUgTUlHSFQgYmUgbWF0Y2hlZC5cblx0Ly9cdC0gYGZhbHNlYCBpZiB0aGVyZSBpcyBOTyBXQVkgdGhlIHJ1bGUgY2FuIGJlIG1hdGNoZWQuXG5cdC8vXHQtIGB1bmRlZmluZWRgIGlmIG5vdCBkZXRlcm1pbnN0aWMgKGVnOiBubyB3YXkgdG8gdGVsbCBxdWlja2x5KS5cblx0dGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cbi8vXG4vLyAjIyBvdXRwdXQgYXMgc291cmNlXG4vL1xuXG5cdC8vIE91dHB1dCB2YWx1ZSBmb3IgdGhpcyBJTlNUQU5USUFURUQgcnVsZSBhcyBzb3VyY2UuXG5cdHRvU291cmNlKCkge1xuXHRcdHJldHVybiB0aGlzLm1hdGNoZWQ7XG5cdH1cblxuXG4vL1xuLy8gIyMgb3V0cHV0IGFzIHN0cnVjdHVyZTpcbi8vXG5cdHRvU3RydWN0dXJlKCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuLy9cbi8vICMjIHJlZmxlY3Rpb25cbi8vXG5cbn1cblxuXG4vLyBBYnN0cmFjdCBydWxlIGZvciBvbmUgb3IgbW9yZSBzZXF1ZW50aWFsIGxpdGVyYWwgdmFsdWVzIHRvIG1hdGNoLlxuLy8gYHJ1bGUubGl0ZXJhbHNgIGlzIHRoZSBsaXRlcmFsIHN0cmluZyBvciBhcnJheSBvZiBsaXRlcmFsIHN0cmluZ3MgdG8gbWF0Y2guXG4vLyBgcnVsZS5saXRlcmFsU2VwYXJhdG9yYCBpcyB0aGUgc3RyaW5nIHRvIHB1dCBiZXR3ZWVuIG11bHRpcGxlIGxpdGVyYWxzIHdoZW4gam9pbmluZy5cbi8vXG4vLyBBZnRlciBwYXJzaW5nXG4vLyAgYHJ1bGUubWF0Y2hlZGAgd2lsbCBiZSB0aGUgc3RyaW5nIHdoaWNoIHdhcyBtYXRjaGVkXG4vLyAgYHJ1bGUubmV4dFN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RhcnQgdG9rZW5cblJ1bGUuTGl0ZXJhbHMgPSBjbGFzcyBsaXRlcmFscyBleHRlbmRzIFJ1bGUge1xuXHRjb25zdHJ1Y3RvciguLi5wcm9wcykge1xuXHRcdHN1cGVyKC4uLnByb3BzKTtcblx0XHQvLyBjb2VyY2UgdG8gYW4gYXJyYXkgKGEgYml0IHNsb3dlciBidXQgY2xlYW5lcikuXG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHRoaXMubGl0ZXJhbHMpKSB0aGlzLmxpdGVyYWxzID0gW3RoaXMubGl0ZXJhbHNdO1xuXHR9XG5cblx0Ly8gQXR0ZW1wdCB0byBtYXRjaCB0aGlzIHJ1bGUgaW4gdGhlIGB0b2tlbnNgLlxuXHQvLyBSZXR1cm5zIHJlc3VsdHMgb2YgdGhlIHBhcnNlIG9yIGB1bmRlZmluZWRgLlxuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0aWYgKCF0aGlzLm1hdGNoZXNTdGFydGluZ0F0KHRva2Vucywgc3RhcnQsIGVuZCkpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZDogdGhpcy5saXRlcmFscy5qb2luKHRoaXMubGl0ZXJhbFNlcGFyYXRvciksXG5cdFx0XHRuZXh0U3RhcnQ6IHN0YXJ0ICsgdGhpcy5saXRlcmFscy5sZW5ndGhcblx0XHR9KTtcblx0fVxuXG5cdC8vIERvZXMgdGhpcyBtYXRjaCBhcHBlYXIgQU5ZV0hFUkUgaW4gdGhlIHRva2Vucz9cblx0dGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQgPSB0b2tlbnMubGVuZ3RoKSB7XG5cdCAgbGV0IGZpcnN0ID0gdGhpcy5saXRlcmFsc1swXTtcblx0ICBmb3IgKHZhciBpbmRleCA9IHN0YXJ0OyBpbmRleCA8IGVuZDsgaW5kZXgrKykge1xuXHQgICAgaWYgKHRva2Vuc1tpbmRleF0gIT09IGZpcnN0KSBjb250aW51ZTtcblx0ICAgIGlmICh0aGlzLm1hdGNoZXNTdGFydGluZ0F0KHRva2VucywgaW5kZXgsIGVuZCkpIHJldHVybiB0cnVlO1xuXHQgIH1cblx0ICByZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBNYXRjaCBvdXIgYGxpdGVyYWxzYCBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgIG9mIHRva2Vucy5cblx0bWF0Y2hlc1N0YXJ0aW5nQXQodG9rZW5zLCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGgpIHtcblx0ICBpZiAodGhpcy5saXRlcmFscy5sZW5ndGggPT09IDEpIHJldHVybiB0b2tlbnNbc3RhcnRdID09PSB0aGlzLmxpdGVyYWxzWzBdO1xuICAgIHJldHVybiB0aGlzLmxpdGVyYWxzLmV2ZXJ5KChsaXRlcmFsLCBpKSA9PiAoc3RhcnQgKyBpIDwgZW5kKSAmJiAobGl0ZXJhbCA9PT0gdG9rZW5zW3N0YXJ0ICsgaV0pKTtcblx0fVxuXG4gIHRvU291cmNlKCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoZWQ7XG4gIH1cblxuXHR0b1N5bnRheCgpIHtcblx0XHRyZXR1cm4gYCR7dGhpcy5saXRlcmFscy5qb2luKHRoaXMubGl0ZXJhbFNlcGFyYXRvciB8fCBcIlwiKX0ke3RoaXMub3B0aW9uYWwgPyAnPycgOiAnJ31gO1xuXHR9XG59XG5cbi8vIE9uZSBvciBtb3JlIGxpdGVyYWwgc3ltYm9sczogYDxgLCBgJWAgZXRjLlxuLy8gU3ltYm9scyBqb2luIFdJVEhPVVQgc3BhY2VzLlxuUnVsZS5TeW1ib2xzID0gY2xhc3Mgc3ltYm9scyBleHRlbmRzIFJ1bGUuTGl0ZXJhbHMge31cblxuXG4vLyBPbmUgb3IgbW9yZSBsaXRlcmFsIGtleXdvcmRzLlxuLy8gS2V5d29yZHMgam9pbiBXSVRIIHNwYWNlcy5cblJ1bGUuS2V5d29yZHMgPSBjbGFzcyBrZXl3b3JkcyBleHRlbmRzIFJ1bGUuTGl0ZXJhbHMge31cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShSdWxlLktleXdvcmRzLnByb3RvdHlwZSwgXCJsaXRlcmFsU2VwYXJhdG9yXCIsIHsgdmFsdWU6IFwiIFwiIH0pO1xuXG5cblxuLy8gUmVnZXggcGF0dGVybiB0byBtYXRjaCBhIFNJTkdMRSB0b2tlbi5cbi8vIGBydWxlLnBhdHRlcm5gIGlzIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gdG8gbWF0Y2guXG4vLyAgICBOb3RlIHRoYXQgeW91IE1VU1Qgc3RhcnQgeW91ciBwYXR0ZXJuIHdpdGggYF5gIGFuZCBlbmQgd2l0aCBgJGAgdG8gbWFrZSBzdXJlIGl0IG1hdGNoZXMgdGhlIGVudGlyZSB0b2tlbi5cbi8vICAgIE5vdGUgdGhhdCB0aGlzIGNhbiBvbmx5IG1hdGNoIGEgc2luZ2xlIHRva2VuIVxuLy8gYHJ1bGUuYmxhY2tsaXN0YCBpcyBhIG1hcCBvZiBgeyBrZXk6IHRydWUgfWAgZm9yIHN0cmluZ3Mgd2hpY2ggd2lsbCBOT1QgYmUgYWNjZXB0ZWQuXG4vL1xuLy8gQWZ0ZXIgcGFyc2luZ1xuLy8gIGBydWxlLm1hdGNoZWRgIHdpbGwgYmUgdGhlIHN0cmluZyB3aGljaCB3YXMgbWF0Y2hlZC5cbi8vICBgcnVsZS5uZXh0U3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGFydCB0b2tlbi5cblJ1bGUuUGF0dGVybiA9IGNsYXNzIHBhdHRlcm4gZXh0ZW5kcyBSdWxlIHtcblx0Ly8gQXR0ZW1wdCB0byBtYXRjaCB0aGlzIHBhdHRlcm4gYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgdG9rZW5zLlxuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0bGV0IHRva2VuID0gdG9rZW5zW3N0YXJ0XTtcblx0XHRpZiAodHlwZW9mIHRva2VuICE9PSBcInN0cmluZ1wiKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG1hdGNoID0gdG9rZW4ubWF0Y2godGhpcy5wYXR0ZXJuKTtcblx0XHRpZiAoIW1hdGNoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gYmFpbCBpZiBwcmVzZW50IGluIGJsYWNrbGlzdFxuXHRcdGxldCBtYXRjaGVkID0gbWF0Y2hbMF07XG5cdFx0aWYgKHRoaXMuYmxhY2tsaXN0ICYmIHRoaXMuYmxhY2tsaXN0W21hdGNoZWRdKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZCxcblx0XHRcdG5leHRTdGFydDogc3RhcnQgKyAxXG5cdFx0fSk7XG5cdH1cblxuXHQvLyBUZXN0IHRvIHNlZSBpZiBhbnkgb2Ygb3VyIHBhdHRlcm4gaXMgZm91bmQgQU5ZV0hFUkUgaW4gdGhlIHRva2Vucy5cblx0dGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRyZXR1cm4gdG9rZW5zLnNsaWNlKHN0YXJ0LCBlbmQpLnNvbWUodG9rZW4gPT4gdHlwZW9mIHRva2VuID09PSBcInN0cmluZ1wiICYmIHBhdHRlcm4udGVzdCh0b2tlbikpO1xuXHR9XG5cblx0dG9TeW50YXgoKSB7XG5cdFx0cmV0dXJuIHRoaXMucGF0dGVybi5zb3VyY2U7XG5cdH1cbn1cblxuXG4vLyBTdWJydWxlIC0tIG5hbWUgb2YgYW5vdGhlciBydWxlIHRvIGJlIGNhbGxlZC5cbi8vIGBydWxlLnN1YnJ1bGVgIGlzIHRoZSBuYW1lIG9mIHRoZSBydWxlIGluIGBwYXJzZXIucnVsZXNgLlxuLy9cbi8vIEFmdGVyIHBhcnNpbmdcbi8vICB3ZSdsbCByZXR1cm4gdGhlIGFjdHVhbCBydWxlIHRoYXQgd2FzIG1hdGNoZWQgKHJhdGhlciB0aGFuIGEgY2xvbmUgb2YgdGhpcyBydWxlKVxuUnVsZS5TdWJydWxlID0gY2xhc3Mgc3VicnVsZSBleHRlbmRzIFJ1bGUge1xuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0bGV0IG1hdGNoZWRSdWxlID0gcGFyc2VyLnBhcnNlTmFtZWRSdWxlKHRoaXMuc3VicnVsZSwgdG9rZW5zLCBzdGFydCwgZW5kLCBzdGFjaywgYHBhcnNlIHN1YnJ1bGUgJyR7dGhpcy5ydWxlfSdgKTtcblx0XHRpZiAoIW1hdGNoZWRSdWxlKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdGlmICh0aGlzLmFyZ3VtZW50KSBtYXRjaGVkUnVsZS5hcmd1bWVudCA9IHRoaXMuYXJndW1lbnQ7XG5cdFx0cmV0dXJuIG1hdGNoZWRSdWxlO1xuXHR9XG5cblx0Ly8gQXNrIHRoZSBzdWJydWxlIHRvIGZpZ3VyZSBvdXQgaWYgYSBtYXRjaCBpcyBwb3NzaWJsZS5cblx0dGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRyZXR1cm4gcGFyc2VyLnRlc3QodGhpcy5zdWJydWxlLCB0b2tlbnMsIHN0YXJ0LCBlbmQpO1xuXHR9XG5cblx0dG9TeW50YXgoKSB7XG5cdFx0cmV0dXJuIGB7JHt0aGlzLmFyZ3VtZW50ID8gdGhpcy5hcmd1bWVudCtcIjpcIiA6IFwiXCJ9JHt0aGlzLnN1YnJ1bGV9fSR7dGhpcy5vcHRpb25hbCA/ICc/JyA6ICcnfWA7XG5cdH1cbn1cblxuXG4vLyBTZXF1ZW5jZSBvZiBydWxlcyB0byBtYXRjaC5cbi8vICBgcnVsZS5ydWxlc2AgaXMgdGhlIGFycmF5IG9mIHJ1bGVzIHRvIG1hdGNoLlxuLy8gIGBydWxlLmxlZnRSZWN1cnNpdmVgIHNob3VsZCBiZSBgdHJ1ZWAgaWYgdGhlIGZpcnN0IG5vbi1vcHRpb25hbCBydWxlIGluIG91ciBgcnVsZXNgXG4vLyAgICBtYXkgZW5kIHVwIGNhbGxpbmcgdXMgYWdhaW4uICBJbiB0aGlzIGNhc2UsIHlvdSBzaG91bGQgcHJvdmlkZSBgcnVsZS50ZXN0UnVsZWAuXG4vL1xuLy8gQWZ0ZXIgcGFyc2luZ1xuLy8gIGBydWxlLm1hdGNoZWRgIHdpbGwgYmUgdGhlIGFycmF5IG9mIHJ1bGVzIHdoaWNoIHdlcmUgbWF0Y2hlZC5cbi8vICBgcnVsZS5uZXh0U3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGFydCB0b2tlbi5cblJ1bGUuU2VxdWVuY2UgPSBjbGFzcyBzZXF1ZW5jZSBleHRlbmRzIFJ1bGUge1xuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0Ly8gSWYgd2UgaGF2ZSBhIGB0ZXN0UnVsZWAgZGVmaW5lZFxuXHRcdGlmICh0aGlzLnRlc3RSdWxlKSB7XG5cdFx0XHQvLyBGb3JnZXQgaXQgaWYgdGhlcmUgaXMgTk8gV0FZIHRoZSBydWxlIGNvdWxkIGJlIG1hdGNoZWQuXG5cdFx0XHRpZiAocGFyc2VyLnRlc3QodGhpcy50ZXN0UnVsZSwgdG9rZW5zLCBzdGFydCkgPT09IGZhbHNlKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdC8vIElmIHdlJ3JlIGEgbGVmdFJlY3Vyc2l2ZSBzZXF1ZW5jZS4uLlxuXHRcdGlmICh0aGlzLmxlZnRSZWN1cnNpdmUpIHtcblx0XHRcdC8vIElmIHRoZSBzdGFjayBhbHJlYWR5IGNvbnRhaW5zIHRoaXMgcnVsZSwgZm9yZ2V0IGl0LlxuXHRcdFx0aWYgKHN0YWNrICYmIHN0YWNrLmluY2x1ZGVzKHRoaXMpKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0XHQvLyBDbG9uZSBzdGFjayBhbmQgYWRkIHRoaXMgcnVsZSBmb3IgcmVjdXJzaW9uLi4uXG5cdFx0XHRzdGFjayA9IHN0YWNrID8gc3RhY2suY29uY2F0KCkgOiBbXTtcblx0XHRcdHN0YWNrLnB1c2godGhpcyk7XG5cblx0XHRcdC8vIFRPRE86IFdlIGNvdWxkIGRpc3Rpbmd1aXNoIGJldHdlZW4gcHJvZHVjdGl2ZSBhbmQgdW5wcm9kdWN0aXZlIHJ1bGVzXG5cdFx0XHQvL1x0XHQgYnkgY2hlY2tpbmcgb25seSBydWxlcyB3aGljaCBvY2N1ciBhdCB0aGUgc2FtZSBgc3RhcnRgLi4uXG5cdFx0XHQvL1x0XHQgVGhpcyB3b3VsZCBwcm9iYWJseSBhbGxvdyBtb3JlIGludGVyZXN0aW5nIHRoaW5ncywgYnV0IGl0J3MgbXVjaCBtdWNoIHNsb3dlci5cblx0XHR9XG5cblx0XHRsZXQgbWF0Y2hlZCA9IFtdO1xuXHRcdGxldCBuZXh0U3RhcnQgPSBzdGFydDtcblx0XHRsZXQgaW5kZXggPSAwLCBydWxlID0gdW5kZWZpbmVkO1xuXHRcdHdoaWxlIChydWxlID0gdGhpcy5ydWxlc1tpbmRleCsrXSkge1xuXHRcdFx0bGV0IG1hdGNoID0gcnVsZS5wYXJzZShwYXJzZXIsIHRva2VucywgbmV4dFN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0XHRcdGlmICghbWF0Y2ggJiYgIXJ1bGUub3B0aW9uYWwpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRpZiAobWF0Y2gpIHtcblx0XHRcdFx0bWF0Y2hlZC5wdXNoKG1hdGNoKTtcblx0XHRcdFx0bmV4dFN0YXJ0ID0gbWF0Y2gubmV4dFN0YXJ0O1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBpZiB3ZSBnZXQgaGVyZSwgd2UgbWF0Y2hlZCBhbGwgdGhlIHJ1bGVzIVxuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQsXG5cdFx0XHRuZXh0U3RhcnRcblx0XHR9KTtcblx0fVxuXG5cbi8vVE9ET0Ncblx0Ly8gXCJnYXRoZXJcIiBhcmd1bWVudHMgaW4gcHJlcGFyYXRpb24gdG8gY2FsbCBgdG9Tb3VyY2UoKWBcblx0Ly8gT25seSBjYWxsYWJsZSBhZnRlciBwYXJzZSBpcyBjb21wbGV0ZWQuXG5cdC8vIFJldHVybnMgYW4gb2JqZWN0IHdpdGggcHJvcGVydGllcyBmcm9tIHRoZSBgbWF0Y2hlZGAgYXJyYXkgaW5kZXhlZCBieSBvbmUgb2YgdGhlIGZvbGxvd2luZzpcblx0Ly9cdFx0LSBgbWF0Y2guYXJndW1lbnRgOlx0XHRhcmd1bWVudCBzZXQgd2hlbiBydWxlIHdhcyBkZWNsYXJlZCwgZWc6IGB7dmFsdWU6bGl0ZXJhbH1gID0+IGB2YWx1ZWBcblx0Ly9cdFx0LSBgbWF0Y2guZ3JvdXBgOlx0XHQgIG5hbWUgb2YgZ3JvdXAgcnVsZSB3YXMgYWRkZWQgdG9cblx0Ly8gICAgLSBgbWF0Y2gubmFtZWA6ICAgICAgIG5hbWUgb2YgdGhlIHJ1bGUgaWYgc2V0IHVwIGJ5IHBhcnNlUnVsZVxuXHRnZXQgcmVzdWx0cygpIHtcblx0XHRpZiAoIXRoaXMubWF0Y2hlZCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRsZXQgcmVzdWx0cyA9IGFkZFJlc3VsdHMoe30sIHRoaXMubWF0Y2hlZCk7XG5cdFx0aWYgKHRoaXMuY29tbWVudCkgcmVzdWx0cy5jb21tZW50ID0gdGhpcy5jb21tZW50O1xuXHRcdHJldHVybiByZXN1bHRzO1xuXG4gICAgZnVuY3Rpb24gYWRkUmVzdWx0cyhyZXN1bHRzLCBtYXRjaGVkKSB7XG4gICAgICBsZXQgaW5kZXggPSAwLCBtYXRjaCA9IHVuZGVmaW5lZDtcbiAgICAgIHdoaWxlIChtYXRjaCA9IG1hdGNoZWRbaW5kZXgrK10pIHtcbiAgICAgICAgaWYgKG1hdGNoLnByb21vdGUpIHtcbiAgICAgICAgICBhZGRSZXN1bHRzKHJlc3VsdHMsIG1hdGNoLm1hdGNoZWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHNvdXJjZU5hbWUgPSBtYXRjaC5hcmd1bWVudCB8fCBtYXRjaC5ncm91cCB8fCBtYXRjaC5uYW1lO1xuICAgICAgICAgIGNvbnN0IG1hdGNoTmFtZSA9IFwiX1wiICsgc291cmNlTmFtZTtcbiAgICAgICAgICBjb25zdCBzb3VyY2UgPSBtYXRjaC50b1NvdXJjZSgpO1xuICAgICAgICAgIC8vIElmIGFyZyBhbHJlYWR5IGV4aXN0cywgY29udmVydCB0byBhbiBhcnJheVxuICAgICAgICAgIGlmIChtYXRjaE5hbWUgaW4gcmVzdWx0cykge1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHJlc3VsdHNbbWF0Y2hOYW1lXSkpIHtcbiAgICAgICAgICAgICAgcmVzdWx0c1ttYXRjaE5hbWVdID0gW3Jlc3VsdHNbbWF0Y2hOYW1lXV07XG4gICAgICAgICAgICAgIHJlc3VsdHNbc291cmNlTmFtZV0gPSBbcmVzdWx0c1tzb3VyY2VOYW1lXV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRzW21hdGNoTmFtZV0ucHVzaChtYXRjaCk7XG4gICAgICAgICAgICByZXN1bHRzW3NvdXJjZU5hbWVdLnB1c2goc291cmNlKVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdHNbbWF0Y2hOYW1lXSA9IG1hdGNoO1xuICAgICAgICAgICAgcmVzdWx0c1tzb3VyY2VOYW1lXSA9IHNvdXJjZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblx0fVxuXG5cdC8vIEVjaG8gdGhpcyBydWxlIGJhY2sgb3V0LlxuXHR0b1N5bnRheCgpIHtcblx0ICBjb25zdCBydWxlcyA9IHRoaXMucnVsZXMubWFwKHJ1bGUgPT4gcnVsZS50b1N5bnRheCgpKTtcblx0XHRyZXR1cm4gYCR7dGhpcy5ydWxlcy5qb2luKFwiIFwiKX0ke3RoaXMub3B0aW9uYWwgPyAnPycgOiAnJ31gO1xuXHR9XG5cbn1cblxuXG4vLyBBbHRlcm5hdGl2ZSBzeW50YXgsIG1hdGNoaW5nIG9uZSBvZiBhIG51bWJlciBvZiBkaWZmZXJlbnQgcnVsZXMuXG4vLyBUaGUgcmVzdWx0IG9mIGEgcGFyc2UgaXMgdGhlIGxvbmdlc3QgcnVsZSB0aGF0IGFjdHVhbGx5IG1hdGNoZWQuXG4vLyBOT1RFOiBDdXJyZW50bHkgdGFrZXMgdGhlIGxvbmdlc3QgdmFsaWQgbWF0Y2guXG4vLyBUT0RPOiBtYXRjaCBhbGwgdmFsaWQgYWx0ZXJuYXRpdmVzXG4vL1xuLy8gQWZ0ZXIgcGFyc2luZ1xuLy8gIHdlJ2xsIHJldHVybiB0aGUgcnVsZSB3aGljaCBpcyB0aGUgXCJiZXN0IG1hdGNoXCIgKHJhdGhlciB0aGFuIGNsb25pbmcgdGhpcyBydWxlKS5cblJ1bGUuQWx0ZXJuYXRpdmVzID0gY2xhc3MgYWx0ZXJuYXRpdmVzIGV4dGVuZHMgUnVsZSB7XG5cdGNvbnN0cnVjdG9yKC4uLnByb3BzKSB7XG5cdFx0c3VwZXIoLi4ucHJvcHMpO1xuXHRcdGlmICghdGhpcy5ydWxlcykgdGhpcy5ydWxlcyA9IFtdO1xuXHR9XG5cblx0Ly8gVGVzdCB0byBzZWUgaWYgYW55IG9mIG91ciBhbHRlcm5hdGl2ZXMgYXJlIGZvdW5kIEFOWVdIRVJFIGluIHRoZSB0b2tlbnMuXG5cdC8vIE5PVEU6IHRoaXMgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGlmIHdlJ3JlIHNwZWNpZmllZCBhcyBhIGB0ZXN0UnVsZWBcblx0Ly9cdFx0IGFuZCB0aGVuIG9ubHkgaWYgYWxsIG9mIG91ciBydWxlcyBhcmUgZGV0ZXJtaW5pc3RpYy5cblx0dGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRsZXQgaW5kZXggPSAwLCBydWxlID0gdW5kZWZpbmVkO1xuXHRcdHdoaWxlIChydWxlID0gdGhpcy5ydWxlc1tpbmRleCsrXSkge1xuXHRcdFx0aWYgKHJ1bGUudGVzdChwYXJzZXIsIHRva2Vucywgc3RhcnQsIGVuZCkpIHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBGaW5kIGFsbCBydWxlcyB3aGljaCBtYXRjaCBhbmQgZGVsZWdhdGUgdG8gYGdldEJlc3RNYXRjaCgpYCB0byBwaWNrIHRoZSBiZXN0IG9uZS5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGxldCBtYXRjaGVzID0gW107XG5cdFx0bGV0IGluZGV4ID0gMCwgcnVsZSA9IHVuZGVmaW5lZDtcblx0XHR3aGlsZSAocnVsZSA9IHRoaXMucnVsZXNbaW5kZXgrK10pIHtcblx0XHRcdGxldCBtYXRjaCA9IHJ1bGUucGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0XHRcdGlmIChtYXRjaCkgbWF0Y2hlcy5wdXNoKG1hdGNoKTtcblx0XHR9XG5cblx0XHRpZiAoIW1hdGNoZXMubGVuZ3RoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gdW5jb21tZW50IHRoZSBiZWxvdyB0byBwcmludCBhbHRlcm5hdGl2ZXNcblx0XHQvLyBpZiAobWF0Y2hlcy5sZW5ndGggPiAxKSB7XG5cdFx0Ly9cdGNvbnNvbGUuaW5mbyh0aGlzLmFyZ3VtZW50IHx8IHRoaXMuZ3JvdXAsIG1hdGNoZXMsIG1hdGNoZXMubWFwKG1hdGNoID0+IG1hdGNoLm1hdGNoZWRUZXh0KSk7XG5cdFx0Ly8gfVxuXG5cdFx0bGV0IGJlc3RNYXRjaCA9IChtYXRjaGVzLmxlbmd0aCA9PT0gMSA/IG1hdGNoZXNbMF0gOiB0aGlzLmdldEJlc3RNYXRjaChtYXRjaGVzKSk7XG5cblx0XHQvLyBhc3NpZ24gYGFyZ05hbWVgIG9yIGBncm91cGAgZm9yIGByZXN1bHRzYFxuXHRcdGlmICh0aGlzLmFyZ3VtZW50KSBiZXN0TWF0Y2guYXJndW1lbnQgPSB0aGlzLmFyZ3VtZW50O1xuXHRcdGVsc2UgaWYgKHRoaXMuZ3JvdXApIGJlc3RNYXRjaC5ncm91cCA9IHRoaXMuZ3JvdXA7XG4vL1RPRE86IG90aGVyIHRoaW5ncyB0byBjb3B5IGhlcmU/Pz9cblxuXHRcdHJldHVybiBiZXN0TWF0Y2g7XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIFwiYmVzdFwiIG1hdGNoIGdpdmVuIG1vcmUgdGhhbiBvbmUgbWF0Y2hlcyBhdCB0aGUgaGVhZCBvZiB0aGUgdG9rZW5zLlxuXHQvLyBEZWZhdWx0IGlzIHRvIHJldHVybiB0aGUgbG9uZ2VzdCBtYXRjaC5cblx0Ly8gSW1wbGVtZW50IHNvbWV0aGluZyBlbHNlIHRvIGRvLCBlZywgcHJlY2VkZW5jZSBydWxlcy5cblx0Z2V0QmVzdE1hdGNoKG1hdGNoZXMpIHtcblx0XHRyZXR1cm4gbWF0Y2hlcy5yZWR1Y2UoZnVuY3Rpb24gKGJlc3QsIGN1cnJlbnQpIHtcblx0XHRcdGlmIChjdXJyZW50Lm5leHRTdGFydCA+IGJlc3QubmV4dFN0YXJ0KSByZXR1cm4gY3VycmVudDtcblx0XHRcdHJldHVybiBiZXN0O1xuXHRcdH0sIG1hdGNoZXNbMF0pO1xuXHR9XG5cblx0YWRkUnVsZSguLi5ydWxlKSB7XG5cdFx0dGhpcy5ydWxlcy5wdXNoKC4uLnJ1bGUpO1xuXHR9XG5cblx0dG9TeW50YXgoKSB7XG5cdCAgY29uc3QgcnVsZXMgPSB0aGlzLnJ1bGVzLm1hcChydWxlID0+IHJ1bGUudG9TeW50YXgoKSkuam9pbihcInxcIik7XG5cdFx0cmV0dXJuIGAoJHt0aGlzLmFyZ3VtZW50ID8gdGhpcy5hcmd1bWVudCtcIjpcIiA6IFwiXCJ9JHtydWxlc30pJHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcblx0fVxufTtcblxuXG4vLyBSZXBlYXRpbmcgcnVsZS5cbi8vXHRgdGhpcy5yZXBlYXRgIGlzIHRoZSBydWxlIHRoYXQgcmVwZWF0cy5cbi8vICBgdGhpcy5vcHRpb25hbGAgaXMgdHJ1ZSBpZiB0aGUgcHJvZHV0aW9uIGlzIG9wdGlvbmFsLlxuLy9cdE5vdGU6IEF1dG9tYXRpY2FsbHkgY29uc3VtZXMgd2hpdGVzcGFjZSBiZWZvcmUgcnVsZXMuXG4vL1x0Tm90ZTogUmV0dXJucyBgdW5kZWZpbmVkYCBpZiB3ZSBkb24ndCBtYXRjaCBhdCBsZWFzdCBvbmNlLlxuLy9cbi8vIEFmdGVyIG1hdGNoaW5nOlxuLy9cdGB0aGlzLm1hdGNoZWRgIGlzIGFycmF5IG9mIG1hdGNoZWQgcnVsZXMuXG4vLyAgYHJ1bGUubmV4dFN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RhcnQgdG9rZW4uXG5SdWxlLlJlcGVhdCA9IGNsYXNzIHJlcGVhdCBleHRlbmRzIFJ1bGUge1xuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0bGV0IG1hdGNoZWQgPSBbXTtcblx0XHRsZXQgbmV4dFN0YXJ0ID0gc3RhcnQ7XG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdGxldCBtYXRjaCA9IHRoaXMucmVwZWF0LnBhcnNlKHBhcnNlciwgdG9rZW5zLCBuZXh0U3RhcnQsIGVuZCwgc3RhY2spO1xuXHRcdFx0aWYgKCFtYXRjaCkgYnJlYWs7XG5cblx0XHRcdG1hdGNoZWQucHVzaChtYXRjaCk7XG5cdFx0XHRuZXh0U3RhcnQgPSBtYXRjaC5uZXh0U3RhcnQ7XG5cdFx0fVxuXG5cdFx0aWYgKG1hdGNoZWQubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZCxcblx0XHRcdG5leHRTdGFydFxuXHRcdH0pO1xuXHR9XG5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0aWYgKCF0aGlzLm1hdGNoZWQpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hlZC5tYXAobWF0Y2ggPT4gbWF0Y2gudG9Tb3VyY2UoKSk7XG5cdH1cblxuXHR0b1N5bnRheCgpIHtcblx0XHRsZXQgaXNDb21wb3VuZFJ1bGUgPSAodGhpcy5yZXBlYXQgaW5zdGFuY2VvZiBSdWxlLlNlcXVlbmNlKVxuICAgICAgfHwgKHRoaXMucmVwZWF0IGluc3RhbmNlb2YgUnVsZS5MaXRlcmFscyAmJiB0aGlzLnJlcGVhdC5saXRlcmFscy5sZW5ndGggPiAxKTtcbiAgICBjb25zdCByZXBlYXQgPSB0aGlzLnJlcGVhdC50b1N5bnRheCgpO1xuXHRcdGNvbnN0IHJ1bGUgPSBpc0NvbXBvdW5kUnVsZSA/IGAoJHtyZXBlYXR9KWAgOiBgJHtyZXBlYXR9YDtcblx0XHRyZXR1cm4gYCR7cnVsZX0ke3RoaXMub3B0aW9uYWwgPyAnKicgOiAnKyd9YDtcblx0fVxufVxuXG5cbi8vIExpc3QgbWF0Y2ggcnVsZTogICBgWzxpdGVtPjxkZWxpbWl0ZXI+XWAuIGVnXCIgYFt7bnVtYmVyfSxdYCB0byBtYXRjaCBgMSwyLDNgXG4vL1x0YHJ1bGUuaXRlbWAgaXMgdGhlIHJ1bGUgZm9yIGVhY2ggaXRlbSxcbi8vXHRgcnVsZS5kZWxpbWl0ZXJgIGlzIHRoZSBkZWxpbWl0ZXIgYmV0d2VlbiBlYWNoIGl0ZW0sIHdoaWNoIGlzIG9wdGlvbmFsIGF0IHRoZSBlbmQuXG4vL1xuLy8gQWZ0ZXIgbWF0Y2hpbmc6XG4vL1x0YHRoaXMubWF0Y2hlZGAgaXMgYXJyYXkgb2YgbWF0Y2hlZCBpdGVtIHJ1bGVzIChkZWxtaXRlciBpcyBpZ25vcmVkKS5cbi8vICBgcnVsZS5uZXh0U3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGFydCB0b2tlbi5cbi8vXG4vLyBOT1RFOiB3ZSBhc3N1bWUgdGhhdCBhIExpc3QgcnVsZSBpdHNlbGYgd2lsbCBOT1QgcmVwZWF0ICg/Pz8/KVxuUnVsZS5MaXN0ID0gY2xhc3MgbGlzdCBleHRlbmRzIFJ1bGUge1xuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0Ly8gZW5zdXJlIGl0ZW0gYW5kIGRlbGltaXRlciBhcmUgb3B0aW9uYWwgc28gd2UgZG9uJ3QgYmFyZiBpbiBgcGFyc2VSdWxlYFxuLy9UT0RPOiA/Pz9cblx0XHR0aGlzLml0ZW0ub3B0aW9uYWwgPSB0cnVlO1xuXHRcdHRoaXMuZGVsaW1pdGVyLm9wdGlvbmFsID0gdHJ1ZTtcblxuXHRcdGxldCBtYXRjaGVkID0gW107XG5cdFx0bGV0IG5leHRTdGFydCA9IHN0YXJ0O1xuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHQvLyBnZXQgbmV4dCBpdGVtLCBleGl0aW5nIGlmIG5vdCBmb3VuZFxuXHRcdFx0bGV0IGl0ZW0gPSB0aGlzLml0ZW0ucGFyc2UocGFyc2VyLCB0b2tlbnMsIG5leHRTdGFydCwgZW5kLCBzdGFjayk7XG5cdFx0XHRpZiAoIWl0ZW0pIGJyZWFrO1xuXG5cdFx0XHRtYXRjaGVkLnB1c2goaXRlbSk7XG5cdFx0XHRuZXh0U3RhcnQgPSBpdGVtLm5leHRTdGFydDtcblxuXHRcdFx0Ly8gZ2V0IGRlbGltaXRlciwgZXhpdGluZyBpZiBub3QgZm91bmRcblx0XHRcdGxldCBkZWxpbWl0ZXIgPSB0aGlzLmRlbGltaXRlci5wYXJzZShwYXJzZXIsIHRva2VucywgbmV4dFN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0XHRcdGlmICghZGVsaW1pdGVyKSBicmVhaztcblx0XHRcdG5leHRTdGFydCA9IGRlbGltaXRlci5uZXh0U3RhcnQ7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgd2UgZGlkbid0IGdldCBhbnkgbWF0Y2hlcywgZm9yZ2V0IGl0LlxuXHRcdGlmIChtYXRjaGVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQsXG5cdFx0XHRuZXh0U3RhcnRcblx0XHR9KTtcblx0fVxuXG5cdC8vIFJldHVybnMgSlMgQXJyYXkgb2YgbWF0Y2hlZCBpdGVtcyBhcyBzb3VyY2UuXG4vL1RPRE86IGBKU0RlbGltaXRlcmAgdG8gcmV0dXJuIGFzIGEgc2luZ2xlIHN0cmluZz9cblx0dG9Tb3VyY2UoKSB7XG5cdFx0aWYgKCF0aGlzLm1hdGNoZWQpIHJldHVybiBbXTtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkLm1hcCggbWF0Y2ggPT4gbWF0Y2gudG9Tb3VyY2UoKSApO1xuXHR9XG5cblx0dG9TeW50YXgoKSB7XG5cdCAgY29uc3QgaXRlbSA9IHRoaXMuaXRlbS50b1N5bnRheCgpO1xuXHQgIGNvbnN0IGRlbGltaXRlciA9IHRoaXMuZGVsaW1pdGVyLnRvU3ludGF4KCk7XG5cdFx0cmV0dXJuIGBbJHt0aGlzLmFyZ3VtZW50ID8gdGhpcy5hcmd1bWVudCtcIjpcIiA6IFwiXCJ9JHtpdGVtfSAke2RlbGltaXRlcn1dJHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcblx0fVxufTtcblxuXG5cbi8vIEEgYmxvY2sgaXMgdXNlZCB0byBwYXJzZSBhIG5lc3RlZCBibG9jayBvZiBzdGF0ZW1lbnRzLlxuLy8gQWJzdHJhY3QgY2xhc3MuXG5SdWxlLkJsb2NrID0gY2xhc3MgYmxvY2sgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcblxuXHQvLyBQYXJzZSB0aGUgZW50aXJlIGBibG9ja2AsIHJldHVybmluZyByZXN1bHRzLlxuXHRwYXJzZUJsb2NrKHBhcnNlciwgYmxvY2ssIGluZGVudCA9IDApIHtcblx0XHRsZXQgbWF0Y2hlZCA9IFtdO1xuLy9jb25zb2xlLndhcm4oXCJibG9jazpcIiwgYmxvY2spO1xuXHRcdGJsb2NrLmNvbnRlbnRzLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG5cdFx0XHRsZXQgcmVzdWx0O1xuXHRcdFx0aWYgKGl0ZW0ubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdG1hdGNoZWQucHVzaChuZXcgUnVsZS5CbGFua0xpbmUoKSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChpdGVtIGluc3RhbmNlb2YgVG9rZW5pemVyLkJsb2NrKSB7XG5cdFx0XHQgIC8vIGlmIHRoZSBsYXN0IG1hdGNoZWQgaXRlbSB3YW50cyB0byBlYXQgYSBibG9jaywgZ2l2ZSBpdCB0aGUgYmxvY2tcblx0XHRcdFx0bGV0IGxhc3QgPSBtYXRjaGVkW21hdGNoZWQubGVuZ3RoIC0gMV07XG5cdFx0XHRcdGlmIChsYXN0LnBhcnNlQmxvY2spIHtcblx0XHRcdFx0XHRsYXN0LnBhcnNlQmxvY2socGFyc2VyLCBpdGVtLCBpbmRlbnQgKyAxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBvdGhlcndpc2UgYWRkIHRoZSBibG9jayB0byB0aGUgc3RyZWFtXG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGxldCBibG9jayA9IHRoaXMucGFyc2VCbG9jayhwYXJzZXIsIGl0ZW0sIGluZGVudCArIDEpO1xuXHRcdFx0XHRcdGlmIChibG9jayAhPT0gdW5kZWZpbmVkKSBtYXRjaGVkLnB1c2goYmxvY2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0bWF0Y2hlZCA9IG1hdGNoZWQuY29uY2F0KHRoaXMucGFyc2VTdGF0ZW1lbnQocGFyc2VyLCBpdGVtKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gbmV3IFJ1bGUuQmxvY2soe1xuXHRcdFx0aW5kZW50LFxuXHRcdFx0bWF0Y2hlZFxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gUGFyc2UgYSBzaW5nbGUgc3RhdGVtZW50IChhIGxpbmUncyB3b3J0aCBvZiBgdG9rZW5zYCkuXG5cdC8vIFNraXBzIHdoaXRlc3BhY2UgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZS5cblx0Ly8gQXV0by1tYXRjaGVzIGNvbW1lbnQgaW4gdGhlIG1pZGRsZSBvZiB0aGUgbGluZS5cblx0Ly8gUmV0dXJucyBhcnJheSBvZiByZXN1bHRzLlxuXHRwYXJzZVN0YXRlbWVudChwYXJzZXIsIHRva2Vucykge1xuXHRcdGxldCByZXN1bHRzID0gW107XG5cdFx0bGV0IHN0YXJ0ID0gMCwgZW5kID0gdG9rZW5zLmxlbmd0aDtcblx0XHRsZXQgc3RhdGVtZW50LCBjb21tZW50O1xuXG5cdFx0Ly8gY2hlY2sgZm9yIGFuIGluZGVudCBhdCB0aGUgc3RhcnQgb2YgdGhlIGxpbmVcblx0XHRpZiAodG9rZW5zW3N0YXJ0XSBpbnN0YW5jZW9mIFRva2VuaXplci5XaGl0ZXNwYWNlKSBzdGFydCsrO1xuXG5cdFx0Ly8gY2hlY2sgZm9yIGEgY29tbWVudCBhdCB0aGUgZW5kIG9mIHRoZSB0b2tlbnNcblx0XHRpZiAodG9rZW5zW2VuZC0xXSBpbnN0YW5jZW9mIFRva2VuaXplci5Db21tZW50KSB7XG5cdFx0XHRjb21tZW50ID0gcGFyc2VyLnBhcnNlTmFtZWRSdWxlKFwiY29tbWVudFwiLCB0b2tlbnMsIGVuZC0xLCBlbmQsIHVuZGVmaW5lZCwgXCJwYXJzZVN0YXRlbWVudFwiKTtcblx0XHRcdC8vIGFkZCBjb21tZW50IEZJUlNUIGlmIGZvdW5kXG5cdFx0XHRyZXN1bHRzLnB1c2goY29tbWVudCk7XG5cdFx0XHRlbmQtLTtcblx0XHR9XG5cblx0XHQvLyBwYXJzZSB0aGUgcmVzdCBhcyBhIFwic3RhdGVtZW50XCJcblx0XHRzdGF0ZW1lbnQgPSBwYXJzZXIucGFyc2VOYW1lZFJ1bGUoXCJzdGF0ZW1lbnRcIiwgdG9rZW5zLCBzdGFydCwgZW5kLCB1bmRlZmluZWQsIFwicGFyc2VTdGF0ZW1lbnRcIik7XG5cdFx0Ly8gY29tcGxhaW4gaWYgbm8gc3RhdGVtZW50IGFuZCBubyBjb21tZW50XG5cdFx0aWYgKCFzdGF0ZW1lbnQgJiYgIWNvbW1lbnQpIHtcblx0XHRcdGxldCBlcnJvciA9IG5ldyBSdWxlLlN0YXRlbWVudFBhcnNlRXJyb3Ioe1xuXHRcdFx0XHR1bnBhcnNlZDogdG9rZW5zLnNsaWNlKHN0YXJ0LCBlbmQpLmpvaW4oXCIgXCIpXG5cdFx0XHR9KTtcblx0XHRcdHJlc3VsdHMucHVzaChlcnJvcik7XG5cdFx0fVxuXG5cdFx0Ly8gY29tcGxhaW4gaWYgd2UgY2FuJ3QgcGFyc2UgdGhlIGVudGlyZSBsaW5lIVxuXHRcdGVsc2UgaWYgKHN0YXRlbWVudCAmJiBzdGF0ZW1lbnQubmV4dFN0YXJ0ICE9PSBlbmQpIHtcblx0XHRcdGxldCBlcnJvciA9IG5ldyBSdWxlLlN0YXRlbWVudFBhcnNlRXJyb3Ioe1xuXHRcdFx0XHRwYXJzZWQgOiB0b2tlbnMuc2xpY2Uoc3RhcnQsIHN0YXRlbWVudC5uZXh0U3RhcnQpLmpvaW4oXCIgXCIpLFxuXHRcdFx0XHR1bnBhcnNlZCA6IHRva2Vucy5zbGljZShzdGF0ZW1lbnQubmV4dFN0YXJ0LCBlbmQpLmpvaW4oXCIgXCIpXG5cdFx0XHR9KTtcblx0XHRcdHJlc3VsdHMucHVzaChlcnJvcik7XG5cdFx0fVxuXG5cdFx0Ly8gT3RoZXJ3aXNlIGFkZCB0aGUgc3RhdGVtZW50XG5cdFx0ZWxzZSBpZiAoc3RhdGVtZW50KSB7XG5cdFx0XHRyZXN1bHRzLnB1c2goc3RhdGVtZW50KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0cztcblx0fVxuXG5cdC8vIFJldHVybiBzb3VyY2UgZm9yIHRoaXMgYmxvY2sgYXMgYW4gYXJyYXkgb2YgaW5kZW50ZWQgbGluZXMgV0lUSE9VVCBge2AgT1IgYH1gLlxuXHRibG9ja1RvU291cmNlKGJsb2NrID0gdGhpcy5tYXRjaGVkKSB7XG5cdFx0bGV0IHJlc3VsdHMgPSBbXSwgc3RhdGVtZW50O1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBibG9jay5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGV0IG1hdGNoID0gYmxvY2tbaV07XG4gICAgICAvL2NvbnNvbGUuaW5mbyhpLCBtYXRjaCk7XG4gICAgICB0cnkge1xuICAgICAgICAgICAgc3RhdGVtZW50ID0gbWF0Y2gudG9Tb3VyY2UoKSB8fCBcIlwiO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICBjb25zb2xlLndhcm4oXCJFcnJvciBjb252ZXJ0aW5nIGJsb2NrOiBcIiwgYmxvY2ssIFwic3RhdGVtZW50OlwiLCBtYXRjaCk7XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUuaW5mbyhpLCBzdGF0ZW1lbnQpO1xuXHRcdFx0aWYgKGlzV2hpdGVzcGFjZShzdGF0ZW1lbnQpKSB7XG5cdFx0XHRcdHJlc3VsdHMucHVzaChcIlwiKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoc3RhdGVtZW50KSkge1xuXHRcdFx0XHRyZXN1bHRzID0gcmVzdWx0cy5jb25jYXQoc3RhdGVtZW50KTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiBzdGF0ZW1lbnQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0c3RhdGVtZW50ID0gc3RhdGVtZW50LnNwbGl0KFwiXFxuXCIpO1xuXHRcdFx0XHRyZXN1bHRzID0gcmVzdWx0cy5jb25jYXQoc3RhdGVtZW50KTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oXCJibG9ja1RvU291cmNlKCk6IERPTidUIEtOT1cgSE9XIFRPIFdPUksgV0lUSFxcblxcdFwiLCBzdGF0ZW1lbnQsIFwiXFxuXFx0ZnJvbSBtYXRjaFwiLCBtYXRjaCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICh0aGlzLmluZGVudCAhPT0gMCkge1xuXHRcdFx0cmV0dXJuIFwiXFx0XCIgKyByZXN1bHRzLmpvaW4oXCJcXG5cXHRcIik7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHRzLmpvaW4oXCJcXG5cIik7XG5cdH1cblxuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gXCJ7XFxuXCIgKyB0aGlzLmJsb2NrVG9Tb3VyY2UoKSArIFwiXFxuXCIgKyBcIn1cIjtcblx0fVxuXG5cdC8vIENvbnZlcnQgdG8gbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiBzdHJ1Y3R1cmUgYnkgY29udmVydGluZyBpbmRpdmlkdWFsIHN0YXRlbWVudHMgYW5kIGdyb3VwaW5nXG5cdC8vIE5PVEU6IHlvdSBzaG91bGQgb3ZlcnJpZGUgdGhpcyBhbmQgaW5jbHVkZSBcInR5cGVcIlxuXHR0b1N0cnVjdHVyZSgpIHtcblx0XHRsZXQgeyBfbmFtZTogbmFtZSwgX3N1cGVyVHlwZTogc3VwZXJUeXBlIH0gPSB0aGlzLnJlc3VsdHM7XG5cdFx0bGV0IGJsb2NrID0gKHRoaXMuYmxvY2sgJiYgdGhpcy5ibG9jay5tYXRjaGVkKSB8fCBbXTtcblxuXHRcdGxldCBuYW1lZCA9IHt9O1xuXHRcdGxldCBwcm9wZXJ0aWVzID0gW107XG5cdFx0bGV0IG1ldGhvZHMgPSBbXTtcblx0XHRsZXQgb3RoZXIgPSBbXTtcblx0XHRibG9jay5tYXAoc3RhdGVtZW50ID0+IHN0YXRlbWVudC50b1N0cnVjdHVyZSgpKVxuXHRcdFx0IC5maWx0ZXIoQm9vbGVhbilcblx0XHRcdCAuZm9yRWFjaChhZGRTdHJ1Y3R1cmUpO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHR5cGU6IFwidW5rbm93blwiLFxuXHRcdFx0bmFtZSxcblx0XHRcdHN1cGVyVHlwZSxcblx0XHRcdG5hbWVkLFxuXHRcdFx0cHJvcGVydGllcyxcblx0XHRcdG1ldGhvZHMsXG5cdFx0XHRvdGhlclxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGFkZFN0cnVjdHVyZShzdHJ1Y3R1cmUpIHtcblx0XHRcdC8vIGFkZCBhcnJheXMgYXMgaW5kaXZpZHVhbCBpdGVtc1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoc3RydWN0dXJlKSkgcmV0dXJuIHN0cnVjdHVyZS5mb3JFYWNoKGFkZFN0cnVjdHVyZSk7XG5cblx0XHRcdC8vIGFkZCB1bmRlciBgbmFtZWRgIGZvciBxdWljayBoaXQgb2YgYWxsIHNpZ25pZmljYW50IGJpdHMuLi5cblx0XHRcdGlmIChzdHJ1Y3R1cmUubmFtZSkgbmFtZWRbc3RydWN0dXJlLm5hbWVdID0gc3RydWN0dXJlO1xuXG5cdFx0XHQvLyBhZGQgdW5kZXIgJ21ldGhvZHMnLCAncHJvcGVydGllcycgb3IgJ290aGVyJ1xuXHRcdFx0aWYgKHN0cnVjdHVyZS50eXBlID09PSBcImZ1bmN0aW9uXCIpIG1ldGhvZHMucHVzaChzdHJ1Y3R1cmUpO1xuXHRcdFx0ZWxzZSBpZiAoc3RydWN0dXJlLnR5cGUgPT09IFwicHJvcGVydHlcIikgcHJvcGVydGllcy5wdXNoKHN0cnVjdHVyZSk7XG5cdFx0XHRlbHNlIG90aGVyLnB1c2goc3RydWN0dXJlKTtcblx0XHR9XG5cdH1cblxuXHQvLyBGb3JtYXQgYXJyYXkgb2YgYHN0YXRlbWVudHNgIGFzIGEgSlMgb3V0cHV0IGJsb2NrOlxuXHQvL1x0LSBpZiBgc3RhdGVtZW50c2AgaXMgZW1wdHksIHJldHVybnMgYHt9YFxuXHQvL1x0LSBpZiBgc3RhdGVtZW50cyBpcyBhIHNpbmdsZSBsaW5lLCByZXR1cm5zIGB7IHN0YXRlbWVudCB9YFxuXHQvL1x0LSBlbHNlIHJldHVybnMgbXVsdGlwbGUgbGluZXNcbiAgLy9cblx0Ly8gSW5kZW50cyB3aXRoIHRhYnMsIGUuZy4gIGB7wqzCu3N0YXRlbWVudF8xwqzCu3N0YXRlbWVudDLCrH1gXG5cdHN0YXRpYyBlbmNsb3NlU3RhdGVtZW50cyguLi5hcmdzKSB7XG5cdFx0dmFyIHN0YXRlbWVudHMgPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdGxldCBhcmcgPSBhcmdzW2ldO1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoYXJnKSkge1xuXHRcdFx0XHRzdGF0ZW1lbnRzID0gc3RhdGVtZW50cy5jb25jYXQoYXJnKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiBhcmcgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0c3RhdGVtZW50cy5wdXNoKGFyZyk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHN0YXRlbWVudHMgPSBzdGF0ZW1lbnRzLmpvaW4oXCJcXG5cIik7XG5cblx0XHRpZiAoIXN0YXRlbWVudHMpIHJldHVybiBcInt9XCI7XG5cdFx0aWYgKCFzdGF0ZW1lbnRzLmluY2x1ZGVzKFwiXFxuXCIpICYmIHN0YXRlbWVudHMubGVuZ3RoIDwgNDApIHtcblx0XHRcdHJldHVybiBgeyAke3N0YXRlbWVudHMudHJpbSgpfSB9YDtcblx0XHR9XG5cdFx0aWYgKHN0YXRlbWVudHNbMF0gIT09IFwiXFx0XCIpIHN0YXRlbWVudHMgPSBgXFx0JHtzdGF0ZW1lbnRzfWA7XG5cdFx0cmV0dXJuIGB7XFxuJHtzdGF0ZW1lbnRzfVxcbn1gO1xuXHR9XG5cbiAgLy8gRW5jbG9zZSBhIHNpbmdsZSBzdGF0ZW1lbnQuXG5cdHN0YXRpYyBlbmNsb3NlU3RhdGVtZW50KHN0YXRlbWVudCwgZm9yY2VXcmFwKSB7XG5cdFx0aWYgKCFzdGF0ZW1lbnQpIHJldHVybiBcInt9XCI7XG5cdFx0aWYgKCFmb3JjZVdyYXAgJiYgIXN0YXRlbWVudC5pbmNsdWRlcyhcIlxcblwiKSAmJiBzdGF0ZW1lbnQubGVuZ3RoIDwgNDApIHtcblx0XHRcdHJldHVybiBgeyAke3N0YXRlbWVudC50cmltKCl9IH1gO1xuXHRcdH1cblx0XHRpZiAoc3RhdGVtZW50WzBdICE9PSBcIlxcdFwiKSBzdGF0ZW1lbnQgPSBgXFx0JHtzdGF0ZW1lbnR9YDtcblx0XHRyZXR1cm4gYHtcXG4ke3N0YXRlbWVudH1cXG59YDtcblx0fVxuXG59XG5cblxuLy8gYFN0YXRlbWVudHNgIGFyZSBhIHNwZWNpYWwgY2FzZSBmb3IgYSBibG9jayBvZiBgU3RhdGVtZW50YCBydWxlc1xuLy9cdHRoYXQgdW5kZXJzdGFuZCBuZXN0aW5nIGFuZCBjb21tZW50cy5cbi8vXG4vLyBUaGlzIGlzIGEgdG9wLWxldmVsIGNvbnN0cnVjdCwgZS5nLiB1c2VkIHRvIHBhcnNlIGFuIGVudGlyZSBmaWxlLlxuUnVsZS5TdGF0ZW1lbnRzID0gY2xhc3Mgc3RhdGVtZW50cyBleHRlbmRzIFJ1bGUuQmxvY2sge1xuXG5cdC8vIFNwbGl0IHN0YXRlbWVudHMgdXAgaW50byBibG9ja3MgYW5kIHBhcnNlICdlbS5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kID0gdG9rZW5zLmxlbmd0aCwgc3RhY2spIHtcblx0XHR2YXIgYmxvY2sgPSBUb2tlbml6ZXIuYnJlYWtJbnRvQmxvY2tzKHRva2Vucywgc3RhcnQsIGVuZCk7XG5cblx0XHRsZXQgbWF0Y2hlZCA9IHRoaXMucGFyc2VCbG9jayhwYXJzZXIsIGJsb2NrKTtcblx0XHRpZiAoIW1hdGNoZWQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkLFxuXHRcdFx0bmV4dFN0YXJ0OiBlbmRcblx0XHR9KTtcblx0fVxuXG5cdC8vIE91dHB1dCBzdGF0ZW1lbnRzIFdJVEhPVVQgY3VybHkgYnJhY2VzIGFyb3VuZCB0aGVtLlxuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkLmJsb2NrVG9Tb3VyY2UoKTtcblx0fVxufVxuXG5cbi8vIEEgYEJsb2NrU3RhdGVtZW50YCAoZS5nLiBhbiBgaWZgIG9yIGByZXBlYXRgKTpcbi8vXHQtIGlzIGFzc3VtZWQgdG8gaGF2ZSBhbiBpbml0aWFsIHBhcnRpYWwgYHN0YXRlbWVudGBcbi8vXHQtIE1BWSBoYXZlIGFuIGlubGluZSBgc3RhdGVtZW50YCAob24gdGhlIHNhbWUgbGluZSwgcG9zc2libHkgYWZ0ZXIgYSBgOmApXG4vL1x0LSBNQVkgaGF2ZSBjb250ZW50cyBhcyBhbiBlbWJlZGRlZCBgYmxvY2tgXG4vLyBOb3RlIHRoYXQgaXQncyBjb25zaWRlcmVkIGFuIGVycm9yIHRvIGhhdmUgQk9USCBhbiBpbmxpbmUgc3RhdGVtZW50IEFORCBhIG5lc3RlZCBibG9jay5cbi8vXG4vLyAgZS5nLiBhIGBCbG9ja1N0YXRlbWVudGAgd2l0aCBzeW50YXggYGlmIHtleHByZXNzaW9ufSB0aGVuIHtzdGF0ZW1lbnR9P2Agd2lsbCBhdHRlbXQgdG86XG4vLyAgLSBtYXRjaCB0aGUgb3B0aW9uYWwgYHN0YXRlbWVudGAgYXMgYW4gaW5saW5lLXN0YXRlbWVudCAoYXMgYHJlc3VsdHMuc3RhdGVtZW50YClcbi8vICAtIG1hdGNoIGFuIElOREVOVEVEIGJsb2NrIHN0YXJ0aW5nIG9uIHRoZSBuZXh0IGxpbmUgKGFzIGByZXN1bHQuYmxvY2tgKVxuLy9cbi8vXHRGb3IgeW91ciBjb252ZW5pZW5jZSBpbiBgdG9Tb3VyY2UoKWAsIHlvdSBjYW4ganVzdCBsb29rIGF0IGByZXN1bHRzLnN0YXRlbWVudHNgXG4vLyAgd2hpY2ggd2lsbCBiZSBvbmUgb2YgdGhlIGZvbGxvd2luZyAod2hpY2hldmVyIGNvbWVzIGZpcnN0KTpcbi8vICAgIC0gdGhlIGJsb2NrIGFuZCBpdHMgc3RhdGVtZW50cywgZW5jbG9zZWQgaW4gY3VybHkgYnJhY2VzIGFuZCBpbmRlbnRlZCwgb3Jcbi8vICAgIC0gdGhlIGZvcm1hdHRlZCBgc3RhdGVtZW50YCwgZW5jbG9zZWQgaW4gY3VybHkgYnJhY2tldHMsXG4vLyAgICAtIGB7fWAgaWYgbmVpdGhlciBzdGF0ZW1lbnQgb3IgYmxvY2sgd2FzIG1hdGNoZWQuXG5SdWxlLkJsb2NrU3RhdGVtZW50ID0gY2xhc3MgYmxvY2tfc3RhdGVtZW50IGV4dGVuZHMgUnVsZS5CbG9jayB7XG5cblx0Ly8gUGFyc2UgYSBuZXN0ZWQgYmxvY2sgd2hpY2ggYXBwZWFycyBkaXJlY3RseSBhZnRlciBvdXIgXCJtYWluXCIgcnVsZS5cblx0Ly8gQWRkcyB0byBvdXIgYG1hdGNoZWRgIGxpc3QgYXMgbmVjZXNzYXJ5LlxuXHRwYXJzZUJsb2NrKCkge1xuXHQgIGlmICghdGhpcy5tYXRjaGVkKSB0aHJvdyBuZXcgUGFyc2VFcnJvcihgJHt0aGlzLm5hbWV8fFwiYmxvY2tTdGF0ZW1lbnRcIn0ucGFyc2VCbG9jaygpOiBubyBtYXRjaGVkIWApO1xuXHQgIGNvbnN0IGJsb2NrID0gc3VwZXIucGFyc2VCbG9jayguLi5hcmd1bWVudHMpO1xuXHQgIGlmICghYmxvY2spIHJldHVybjtcblx0ICBibG9jay5hcmd1bWVudCA9IFwiYmxvY2tcIjtcblx0ICB0aGlzLm1hdGNoZWQucHVzaChibG9jayk7XG5cdH1cblxuICAvLyBBZGQgYHN0YXRlbWVudHNgIHRvIHRoZSByZXN1bHRzLlxuICBnZXQgcmVzdWx0cygpIHtcbiAgICBjb25zdCByZXN1bHRzID0gc3VwZXIucmVzdWx0cztcbiAgICBpZiAoIXJlc3VsdHMpIHJldHVybiByZXN1bHRzO1xuXG4gICAgLy8gSWYgd2UgZ290IGEgYmxvY2ssIHVzZSB0aGF0IGZvciBvdXIgYHN0YXRlbWVudHNgXG4gICAgaWYgKHJlc3VsdHMuYmxvY2spIHtcbiAgICAgIHJlc3VsdHMuX3N0YXRlbWVudHMgPSByZXN1bHRzLl9ibG9jaztcbiAgICAgIHJlc3VsdHMuc3RhdGVtZW50cyA9IHJlc3VsdHMuYmxvY2s7XG4gICAgfVxuICAgIC8vIG90aGVyd2lzZSB1c2UgdGhlIGBzdGF0ZW1lbnRgLCBpZiBpdCdzIGVtcHR5IHRoaXMgd2lsbCByZXR1cm4gdGhlIGVtcHR5IHN0cmluZy5cbiAgICBlbHNlIHtcbiAgICAgIHJlc3VsdHMuX3N0YXRlbWVudHMgPSByZXN1bHRzLl9zdGF0ZW1lbnQ7XG4gICAgICByZXN1bHRzLnN0YXRlbWVudHMgPSBSdWxlLkJsb2NrLmVuY2xvc2VTdGF0ZW1lbnQocmVzdWx0cy5zdGF0ZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxufVxuXG5cbi8vIEJsYW5rIGxpbmUgcmVwcmVzZW50YXRpb24gaW4gcGFyc2VyIG91dHB1dC5cblJ1bGUuQmxhbmtMaW5lID0gY2xhc3MgYmxhbmtfbGluZSBleHRlbmRzIFJ1bGUge1xuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gXCJcXG5cIjtcblx0fVxufVxuXG4vLyBDb21tZW50IHJ1bGUgLS0gbWF0Y2hlcyB0b2tlbnMgb2YgdHlwZSBgVG9rZW5pemVyLkNvbW1lbnRgLlxuUnVsZS5Db21tZW50ID0gY2xhc3MgY29tbWVudCBleHRlbmRzIFJ1bGUge1xuXHQvLyBDb21tZW50cyBhcmUgc3BlY2lhbCBub2RlcyBpbiBvdXIgdG9rZW4gc3RyZWFtLlxuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0bGV0IHRva2VuID0gdG9rZW5zW3N0YXJ0XTtcblx0XHRpZiAoISh0b2tlbiBpbnN0YW5jZW9mIFRva2VuaXplci5Db21tZW50KSkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkOiB0b2tlbixcblx0XHRcdG5leHRTdGFydDogc3RhcnQgKyAxXG5cdFx0fSk7XG5cdH1cblxuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gYC8vJHt0aGlzLm1hdGNoZWQud2hpdGVzcGFjZX0ke3RoaXMubWF0Y2hlZC5jb21tZW50fWA7XG5cdH1cbn1cblxuLy8gUGFyc2VyIGVycm9yIHJlcHJlc2VudGF0aW9uIGluIHBhcnNlciBvdXRwdXQuXG5SdWxlLlN0YXRlbWVudFBhcnNlRXJyb3IgPSBjbGFzcyBwYXJzZV9lcnJvciBleHRlbmRzIFJ1bGUge1xuXHRjb25zdHJ1Y3RvciguLi5wcm9wcykge1xuXHRcdHN1cGVyKC4uLnByb3BzKTtcblx0XHRpZiAoUGFyc2VyLldBUk4pIGNvbnNvbGUud2Fybih0aGlzLm1lc3NhZ2UpO1xuXHR9XG5cblx0Z2V0IG1lc3NhZ2UoKSB7XG5cdFx0aWYgKHRoaXMucGFyc2VkKSB7XG5cdFx0XHRyZXR1cm4gXCJDQU5UIFBBUlNFIEVOVElSRSBTVEFURU1FTlRcXG5cIlxuXHRcdFx0XHQgKyBcIlBBUlNFRCAgICAgIDogYFwiKyB0aGlzLnBhcnNlZCArIFwiYFxcblwiXG5cdFx0XHRcdCArIFwiQ0FOJ1QgUEFSU0UgOiBgXCIrIHRoaXMudW5wYXJzZWQgKyBcImBcIjtcblx0XHR9XG5cdFx0cmV0dXJuIFwiQ0FOJ1QgUEFSU0UgU1RBVEVNRU5UOiBgXCIgKyB0aGlzLnVucGFyc2VkICsgXCJgXCI7XG5cdH1cblxuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gXCIvLyBcIiArIHRoaXMubWVzc2FnZS5zcGxpdChcIlxcblwiKS5qb2luKFwiXFxuLy8gXCIpO1xuXHR9XG59XG5cblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1J1bGUuanMiLCJpbXBvcnQgZmxhdHRlbiBmcm9tIFwibG9kYXNoL2ZsYXR0ZW4uanNcIjtcblxuaW1wb3J0IHsgZGVmaW5lTWVtb2l6ZWQgfSBmcm9tIFwiLi9tZW1vaXplLmpzXCI7XG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuL1BhcnNlci5qc1wiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4vUnVsZS5qc1wiO1xuaW1wb3J0IHsgY2xvbmVDbGFzcyB9IGZyb20gXCIuL3V0aWxzL2NsYXNzLmpzXCI7XG5pbXBvcnQgZ2xvYmFsIGZyb20gXCIuL3V0aWxzL2dsb2JhbC5qc1wiO1xuXG5cblxuLy9cbi8vXHQjIFBhcnNpbmcgYHJ1bGVTeW50YXhgIHRvIGNyZWF0ZSBydWxlcyBhdXRvbWF0aWNhbGx5LlxuLy9cbi8vIFRPRE86XHRCZXR0ZXIgbmFtZSBmb3IgYHJ1bGVTeW50YXhgXG4vLyBUT0RPOlx0VXNlIGtleXdvcmRzIGluIHN5bnRheCB0byBtYWtlIGEgcXVpY2sgcmVnZXgtYmFzZWQgYHRlc3RgIGZ1bmN0aW9uIGZvciB0aGUgZW50aXJlIHJ1bGVcblxuLy9cbi8vICMjIGdyb3VwOiBwYXJzaW5nIHN5bnRheFxuLy9cblxuLy8gUmV0dXJuIGFycmF5IG9mIHJ1bGVzIGdlbmVyYXRlZCBieSBwYXJzaW5nIHJ1bGUgYHN5bnRheGAsIGluc3RhbnRpYXRpbmcgd2l0aCBgY29uc3RydWN0b3JgIHBhc3NlZCBpbi5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlUnVsZShzeW50YXgsIGNvbnN0cnVjdG9yKSB7XG4gIC8vIElmIHdlIGdvdCBhbiBhcnJheSBvZiBwb3NzaWJsZSBzeW50YXhlcy4uLlxuICBpZiAoQXJyYXkuaXNBcnJheShzeW50YXgpKSB7XG4gICAgLy8gLi4ucmVjdXJzaXZlbHkgcGFyc2UgZWFjaCBzeW50YXgsIHVzaW5nIGEgQ0xPTkUgb2YgdGhlIGNvbnN0cnVjdG9yLlxuICAgIHJldHVybiBmbGF0dGVuKHN5bnRheC5tYXAoc3ludGF4ID0+IHBhcnNlUnVsZShzeW50YXgsIGNvbnN0cnVjdG9yICYmIGNsb25lQ2xhc3MoY29uc3RydWN0b3IpKSApKTtcbiAgfTtcblxuICBsZXQgcnVsZXMgPSBwYXJzZVN5bnRheChzeW50YXgpO1xuICBpZiAocnVsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBwYXJzZXIuZGVmaW5lUnVsZSgke25hbWVzWzBdfSwgJHtzeW50YXh9KTogbm8gcnVsZSBwcm9kdWNlZGApO1xuICB9XG5cbiAgaWYgKCFjb25zdHJ1Y3Rvcikge1xuICAgIC8vIElmIHdlIG9ubHkgZ290IG9uZSBydWxlLCBqdXN0IHJldHVybiBpdFxuICAgIGlmIChydWxlcy5sZW5ndGggPT09IDEpIHJldHVybiBydWxlcztcblxuICAgIC8vIE90aGVyd2lzZSBncm91cCB0aGUgcnVsZXMgdG9nZXRoZXIgYW5kIHJldHVybiB0aGF0XG4gICAgcmV0dXJuIFsgbmV3IFJ1bGUuQWx0ZXJuYXRpdmVzKHsgcnVsZXMgfSkgXTtcbiAgfVxuICBlbHNlIHtcbiAgICAvLyBNYWtlIGFuIGluc3RhbmNlIG9mIHRoZSBydWxlIGFuZCBhZGQgcmVsZXZhbnQgcHJvcGVydGllcyB0byBpdHMgcHJvdG90eXBlIG5vbi1lbnVtZXJhYmx5XG4gICAgaWYgKGNvbnN0cnVjdG9yLnByb3RvdHlwZSBpbnN0YW5jZW9mIFJ1bGUuS2V5d29yZHNcbiAgICAgfHwgY29uc3RydWN0b3IucHJvdG90eXBlIGluc3RhbmNlb2YgUnVsZS5TeW1ib2xzXG4gICAgIHx8IGNvbnN0cnVjdG9yLnByb3RvdHlwZSBpbnN0YW5jZW9mIFJ1bGUuTGlzdFxuICAgICB8fCBjb25zdHJ1Y3Rvci5wcm90b3R5cGUgaW5zdGFuY2VvZiBSdWxlLkFsdGVybmF0aXZlc1xuICAgICkge1xuICAgICAgZm9yIChsZXQgcHJvcGVydHkgaW4gcnVsZXNbMF0pIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvcGVydHksIHsgdmFsdWU6IHJ1bGVzWzBdW3Byb3BlcnR5XSB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IucHJvdG90eXBlLCBcInJ1bGVzXCIsIHsgdmFsdWU6IHJ1bGVzIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBbIG5ldyBjb25zdHJ1Y3RvcigpIF07XG4gIH1cbn1cblxuZnVuY3Rpb24gdG9rZW5pc2VSdWxlU3ludGF4KHN5bnRheCkge1xuICBjb25zdCBTWU5UQVhfRVhQUkVTU0lPTiA9IC8oPzpbXFx3XFwtXSt8XFxcXFtcXFtcXChcXHtcXClcXH1cXF1dfFteXFxzXFx3XXxcXHwpL2c7XG4gIGxldCBzeW50YXhTdHJlYW0gPSBzeW50YXgubWF0Y2goU1lOVEFYX0VYUFJFU1NJT04pO1xuICBpZiAoIXN5bnRheFN0cmVhbSkgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBDYW4ndCB0b2tlbml6ZSBwYXJzZSBydWxlIHN5bnRheCA+PiR7c3ludGF4fTw8YCk7XG4gIHJldHVybiBzeW50YXhTdHJlYW07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVN5bnRheChzeW50YXgsIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCkge1xuICBpZiAoc3ludGF4ID09IG51bGwpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJwYXJzZVN5bnRheCgpOiBgc3ludGF4YCBpcyByZXF1aXJlZFwiKTtcbiAgY29uc3Qgc3ludGF4U3RyZWFtID0gdHlwZW9mIHN5bnRheCA9PT0gXCJzdHJpbmdcIlxuICAgID8gdG9rZW5pc2VSdWxlU3ludGF4KHN5bnRheClcbiAgICA6IHN5bnRheDtcblxuICBsZXQgbGFzdEluZGV4ID0gc3ludGF4U3RyZWFtLmxlbmd0aDtcbiAgd2hpbGUgKHN0YXJ0IDwgbGFzdEluZGV4KSB7XG4gICAgbGV0IFsgcnVsZSwgZW5kIF0gPSBwYXJzZVRva2VuKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICBpZiAocnVsZSkge1xuICAgICAgbGV0IGxhc3QgPSBydWxlc1tydWxlcy5sZW5ndGgtMV07XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgYFN5bWJvbGAgYW5kIGxhc3Qgd2FzIGEgYFN5bWJvbGAsIG1lcmdlIHRvZ2V0aGVyXG4gICAgICBpZiAobGFzdCAmJiBsYXN0IGluc3RhbmNlb2YgUnVsZS5TeW1ib2xzICYmIHJ1bGUgaW5zdGFuY2VvZiBSdWxlLlN5bWJvbHMpIHtcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBsYXN0IHJ1bGVcbiAgICAgICAgcnVsZXMucG9wKCk7XG4gICAgICAgIC8vIGFuZCByZXBsYWNlIHdpdGggYSBydWxlIHRoYXQgbWVyZ2VzIHRoZSBrZXl3b3Jkc1xuICAgICAgICBydWxlLmxpdGVyYWxzID0gbGFzdC5saXRlcmFscy5jb25jYXQocnVsZS5saXRlcmFscyk7XG4gICAgICB9XG4gICAgICBydWxlcy5wdXNoKHJ1bGUpO1xuICAgIH1cbiAgICBzdGFydCA9IGVuZCArIDE7XG4gIH1cbiAgcmV0dXJuIHJ1bGVzO1xufVxuXG5jb25zdCBLRVlXT1JEX1BBVFRFUk4gPSAvW0EtWmEtel1bXFx3Xy1dKi87XG5mdW5jdGlvbiBwYXJzZVRva2VuKHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwKSB7XG4gIGxldCBzeW50YXhUb2tlbiA9IHN5bnRheFN0cmVhbVtzdGFydF07XG5cbiAgLy8gaWYgd2UgZ290IGEgXCJcXFxcXCIgKHdoaWNoIGFsc28gaGFzIHRvIGdvIGludG8gdGhlIHNvdXJjZSBzdHJpbmcgYXMgXCJcXFxcXCIpXG4gIC8vIHRyZWF0IHRoZSBuZXh0IHRva2VuIGFzIGEgbGl0ZXJhbCBzdHJpbmcgcmF0aGVyIHRoYW4gYXMgYSBzcGVjaWFsIGNoYXJhY3Rlci5cbiAgaWYgKHN5bnRheFRva2VuID09PSBcIlxcXFxcIikge1xuICAgIHJldHVybiBwYXJzZVN5bWJvbChzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCArIDEpO1xuICB9XG5cbiAgc3dpdGNoIChzeW50YXhUb2tlbikge1xuICAgIGNhc2UgXCJ7XCI6XHRyZXR1cm4gcGFyc2VTdWJydWxlKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICBjYXNlIFwiKFwiOlx0cmV0dXJuIHBhcnNlQWx0ZXJuYXRpdmVzKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICBjYXNlIFwiW1wiOlx0cmV0dXJuIHBhcnNlTGlzdChzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgY2FzZSBcIipcIjpcbiAgICBjYXNlIFwiK1wiOlxuICAgIGNhc2UgXCI/XCI6XHRyZXR1cm4gcGFyc2VSZXBlYXQoc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuXG4gICAgLy8gdGhlIGZvbGxvd2luZyBzaG91bGQgQUxXQVlTIGJlIGNvbnN1bWVkIGJ5IHRoZSBhYm92ZVxuICAgIGNhc2UgXCJ9XCI6XG4gICAgY2FzZSBcIilcIjpcbiAgICBjYXNlIFwiXVwiOlxuICAgIGNhc2UgXCJ8XCI6XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFVuZXhwZWN0ZWQgJHtzeW50YXhUb2tlbn0gZm91bmQgYXMgaXRlbSAke3N0YXJ0fSBvZiAke3N5bnRheFN0cmVhbX1gKTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICBpZiAoc3ludGF4VG9rZW4ubWF0Y2goS0VZV09SRF9QQVRURVJOKSkge1xuICAgICAgICByZXR1cm4gcGFyc2VLZXl3b3JkKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gcGFyc2VTeW1ib2woc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuICAgICAgfVxuICB9XG59XG5cblxuLy8gTWF0Y2ggYGtleXdvcmRgIGluIHN5bnRheCBydWxlcy5cbi8vIElmIG1vcmUgdGhhbiBvbmUga2V5d29yZCBhcHBlYXJzIGluIGEgcm93LCBjb21iaW5lcyB0aGVtIGludG8gYSBzaW5nbGUgYEtleXdvcmRgIG9iamVjdC5cbi8vIFRoaXMgaXMgcHJldHR5IHNhZmUsIHVubGVzcyB5b3UgaGF2ZSBhbiBvcHRpb25hbCBrZXl3b3JkIGxpa2Vcbi8vXHRcdGB0aGUge2lkZW50aWZpZXJ9IG9mIHRoZT8ge2V4cHJlc3Npb259YFxuLy8gaW4gd2hpY2ggY2FzZSB5b3UgY2FuIHB1dCB0aGUgb3B0aW9uYWwga2V5d29yZCBpbiBwYXJlbnNcbi8vXHRcdGB0aGUge2lkZW50aWZpZXJ9IG9mICh0aGU/KSB7ZXhwcmVzc2lvbn1gXG4vL1xuLy8gUmV0dXJucyBgWyBydWxlLCBlbmQgXWBcbi8vIFRocm93cyBpZiBpbnZhbGlkLlxuZnVuY3Rpb24gcGFyc2VLZXl3b3JkKHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwLCBjb25zdHJ1Y3RvciA9IFJ1bGUuS2V5d29yZHMpIHtcbiAgbGV0IGxpdGVyYWxzID0gW10sIGVuZDtcbiAgLy8gZWF0IGtleXdvcmRzIHdoaWxlIHRoZXkgbGFzdFxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBzeW50YXhTdHJlYW0ubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgbmV4dCA9IHN5bnRheFN0cmVhbVtpXTtcbiAgICBpZiAodHlwZW9mIG5leHQgPT09IFwic3RyaW5nXCIgJiYgbmV4dC5tYXRjaChLRVlXT1JEX1BBVFRFUk4pKSB7XG4gICAgICBsaXRlcmFscy5wdXNoKG5leHQpO1xuICAgICAgZW5kID0gaTtcbiAgICB9XG4gICAgZWxzZSBicmVhaztcbiAgfVxuXG4gIGxldCBydWxlID0gbmV3IGNvbnN0cnVjdG9yKHsgbGl0ZXJhbHMgfSk7XG4gIHJldHVybiBbIHJ1bGUsIGVuZCBdO1xufVxuXG4vLyBNYXRjaCBga2V5d29yZGAgaW4gc3ludGF4IHJ1bGVzLlxuLy8gUmV0dXJucyBgWyBydWxlLCBlbmQgXWBcbi8vIFRocm93cyBpZiBpbnZhbGlkLlxuZnVuY3Rpb24gcGFyc2VTeW1ib2woc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDAsIGNvbnN0cnVjdG9yID0gUnVsZS5TeW1ib2xzKSB7XG4gIGxldCBzdHJpbmcgPSBzeW50YXhTdHJlYW1bc3RhcnRdO1xuICBpZiAoIWNvbnN0cnVjdG9yKSBjb25zdHJ1Y3RvciA9IFJ1bGUuU3ltYm9scztcblxuICAvLyBJZiBzdHJpbmcgc3RhcnRzIHdpdGggYFxcXFxgLCBpdCdzIGFuIGVzY2FwZWQgbGl0ZXJhbCAoZWc6IGBcXFtgIG5lZWRzIHRvIGlucHV0IGFzIGBcXFxcW2ApLlxuICBsZXQgaXNFc2NhcGVkID0gc3RyaW5nLnN0YXJ0c1dpdGgoXCJcXFxcXCIpO1xuICBsZXQgbGl0ZXJhbHMgPSBpc0VzY2FwZWQgPyBzdHJpbmcuc3Vic3RyKDEpIDogc3RyaW5nO1xuXG4gIGxldCBydWxlID0gbmV3IGNvbnN0cnVjdG9yKHsgbGl0ZXJhbHMgfSk7XG5cbiAgaWYgKGlzRXNjYXBlZCkge1xuICAgIHJ1bGUudG9TeW50YXggPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBgXFxcXCR7bGl0ZXJhbHN9JHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gWyBydWxlLCBzdGFydCBdO1xufVxuXG5cbi8vIE1hdGNoIGdyb3VwaW5nIGV4cHJlc3Npb24gYCguLi58Li4uKWAgaW4gc3ludGF4IHJ1bGVzLlxuLy8gUmV0dXJucyBgWyBydWxlLCBlbmQgXWBcbi8vIFlvdSBjYW4gc3BlY2lmeSBhbiBleHBsaWNpdCBgcnVsZS5hcmd1bWVudGAgd2l0aDogIGAoc29tZWFyZzouLi4pYFxuLy8gWW91IGNhbiBzcGVjaWZ5IHRoYXQgdGhlIHJlc3VsdHMgc2hvdWxkIGJlIGBwcm9tb3RlZGAgdG8gZW5jbG9zaW5nIHJ1bGUgd2l0aDogYCg/Oi4uLilgXG4vL1xuLy8gTk9URTogbmVzdGVkIHBhcmVucyBtYXkgbm90IGhhdmUgYWx0ZXJuYXRpdmVzLi4uIDotKCAgIGAoYXwoYnxjKSlgIHdvbid0IHdvcms/Pz9cbmZ1bmN0aW9uIHBhcnNlQWx0ZXJuYXRpdmVzKHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwKSB7XG4gIGxldCB7IGVuZCwgc2xpY2UgfSA9IFBhcnNlci5maW5kTmVzdGVkVG9rZW5zKHN5bnRheFN0cmVhbSwgXCIoXCIsIFwiKVwiLCBzdGFydCk7XG5cbiAgLy8gcHVsbCBvdXQgZXhwbGljaXQgXCJwcm9tb3RlXCIgZmxhZzogYD86YFxuICBsZXQgcHJvbW90ZSA9IChzbGljZVswXSA9PT0gXCI/XCIgJiYgc2xpY2VbMV0gPT09IFwiOlwiKTtcbiAgaWYgKHByb21vdGUpIHtcbiAgICBzbGljZSA9IHNsaWNlLnNsaWNlKDIpO1xuICB9XG5cbiAgLy8gcHVsbCBvdXQgZXhwbGljaXQgYXJndW1lbnQgbmFtZVxuICBsZXQgYXJndW1lbnQ7XG4gIGlmIChzbGljZS5sZW5ndGggPiAyICYmIHNsaWNlWzFdID09PSBcIjpcIikge1xuICAgIGFyZ3VtZW50ID0gc2xpY2VbMF07XG4gICAgc2xpY2UgPSBzbGljZS5zbGljZSgyKTtcbiAgfVxuXG4gIC8vIHNwbGl0IGludG8gZ3JvdXBzLCBpbmNsdWRpbmcgbmVzdGVkIHBhcmVuc1xuICBsZXQgYWx0ZXJuYXRpdmVzID1cbiAgICBncm91cEFsdGVybmF0aXZlcyhzbGljZSlcbiAgICAubWFwKGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICBsZXQgcmVzdWx0cyA9IHBhcnNlU3ludGF4KGdyb3VwLCBbXSk7XG4gICAgICBpZiAocmVzdWx0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNbMF07XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSdWxlLlNlcXVlbmNlKHsgcnVsZXM6IHJlc3VsdHMgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgbGV0IHJ1bGUgPSBhbHRlcm5hdGl2ZXMubGVuZ3RoID09PSAxID8gYWx0ZXJuYXRpdmVzWzBdIDogbmV3IFJ1bGUuQWx0ZXJuYXRpdmVzKHsgcnVsZXM6IGFsdGVybmF0aXZlcyB9KTtcbiAgaWYgKGFyZ3VtZW50KSBydWxlLmFyZ3VtZW50ID0gYXJndW1lbnQ7XG4gIGlmIChwcm9tb3RlKSBydWxlLnByb21vdGUgPSB0cnVlO1xuICByZXR1cm4gWyBydWxlLCBlbmQgXTtcbn1cblxuZnVuY3Rpb24gZ3JvdXBBbHRlcm5hdGl2ZXModG9rZW5zKSB7XG4gIGxldCBhbHRlcm5hdGl2ZXMgPSBbXTtcbiAgbGV0IGN1cnJlbnQgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDAsIHRva2VuOyB0b2tlbiA9IHRva2Vuc1tpXTsgaSsrKSB7XG4gICAgLy8gaGFuZGxlIGFsdGVybmF0ZSBtYXJrZXJcbiAgICBpZiAodG9rZW4gPT09IFwifFwiKSB7XG4gICAgICBhbHRlcm5hdGl2ZXMucHVzaChjdXJyZW50KTtcbiAgICAgIGN1cnJlbnQgPSBbXTtcbiAgICB9XG4gICAgLy8gaGFuZGxlIG5lc3RlZCBwYXJlbnNcbiAgICBlbHNlIGlmICh0b2tlbiA9PT0gXCIoXCIpIHtcbiAgICAgIGxldCB7IGVuZCB9ID0gUGFyc2VyLmZpbmROZXN0ZWRUb2tlbnModG9rZW5zLCBcIihcIiwgXCIpXCIsIGkpO1xuICAgICAgY3VycmVudCA9IGN1cnJlbnQuY29uY2F0KHRva2Vucy5zbGljZShpLCBlbmQgKyAxKSk7XG4gICAgICBpID0gZW5kO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGN1cnJlbnQucHVzaCh0b2tlbik7XG4gICAgfVxuICB9XG4gIGlmIChjdXJyZW50Lmxlbmd0aCkgYWx0ZXJuYXRpdmVzLnB1c2goY3VycmVudCk7XG4gIHJldHVybiBhbHRlcm5hdGl2ZXM7XG59XG5cbi8vIE1hdGNoIHJlcGVhdCBpbmRpY2F0b3IgYD9gLCBgK2Agb3IgYCpgIGJ5IGF0dGFjaGluZyBpdCB0byB0aGUgcHJldmlvdXMgcnVsZS5cbmZ1bmN0aW9uIHBhcnNlUmVwZWF0KHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwKSB7XG4gIGxldCBzeW1ib2wgPSBzeW50YXhTdHJlYW1bc3RhcnRdO1xuICBsZXQgcnVsZSA9IHJ1bGVzW3J1bGVzLmxlbmd0aCAtIDFdO1xuICBpZiAoIXJ1bGUpIHRocm93IG5ldyBTeW50YXhFcnJvcihgQ2FuJ3QgYXR0YWNoIHJlcGVhdCBzeW1ib2wgJHtzeW1ib2x9IHRvIGVtcHR5IHJ1bGUhYCk7XG5cbiAgLy8gVHJhbnNmb3JtIGxhc3QgcnVsZSBpbnRvIGEgcmVwZWF0IGZvciBgKmAgYW5kIGArYC5cbiAgaWYgKHN5bWJvbCA9PT0gXCIqXCIgfHwgc3ltYm9sID09PSBcIitcIikge1xuICAgIGxldCBhcmd1bWVudCA9IHJ1bGUuYXJndW1lbnQ7XG4gICAgcnVsZSA9IG5ldyBSdWxlLlJlcGVhdCh7IHJlcGVhdDogcnVsZSB9KTtcbiAgICBpZiAoYXJndW1lbnQpIHJ1bGUuYXJndW1lbnQgPSBhcmd1bWVudDtcbiAgICAvLyBwdXNoIGludG8gcnVsZSBzdGFjayBpbiBwbGFjZSBvZiBvbGQgcnVsZVxuICAgIHJ1bGVzW3J1bGVzLmxlbmd0aCAtIDFdID0gcnVsZTtcbiAgfVxuXG4gIC8vIFJ1bGUgaXMgb3B0aW9uYWwgZm9yIGA/YCBhbmQgYCpgLlxuICBpZiAoc3ltYm9sID09PSBcIj9cIiB8fCBzeW1ib2wgPT09IFwiKlwiKSB7XG4gICAgcnVsZS5vcHRpb25hbCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gWyB1bmRlZmluZWQsIHN0YXJ0IF1cbn1cblxuLy8gTWF0Y2ggYHs8c3VicnVsZT59YCBpbiBzeW50YXggcnVsZXMuXG4vLyBSZXR1cm5zIGBbIHJ1bGUsIGVuZCBdYFxuLy8gVGhyb3dzIGlmIGludmFsaWQuXG5mdW5jdGlvbiBwYXJzZVN1YnJ1bGUoc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDApIHtcbiAgbGV0IG1hdGNoID0gUGFyc2VyLmZpbmROZXN0ZWRUb2tlbnMoc3ludGF4U3RyZWFtLCBcIntcIiwgXCJ9XCIsIHN0YXJ0KTtcbiAgbGV0IGFyZ3VtZW50O1xuICBpZiAobWF0Y2guc2xpY2UubGVuZ3RoID09PSAzICYmIG1hdGNoLnNsaWNlWzFdID09PSBcIjpcIikge1xuICAgIGFyZ3VtZW50ID0gbWF0Y2guc2xpY2VbMF07XG4gICAgbWF0Y2guc2xpY2UgPSBtYXRjaC5zbGljZS5zbGljZSgyKTtcbiAgfVxuICBpZiAobWF0Y2guc2xpY2UubGVuZ3RoID4gMSkgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBDYW4ndCBwcm9jZXNzIHJ1bGVzIHdpdGggbW9yZSB0aGFuIG9uZSBydWxlIG5hbWU6IHske21hdGNoLnNsaWNlLmpvaW4oXCJcIil9fWApO1xuXG4gIGxldCBwYXJhbXMgPSB7IHN1YnJ1bGU6IG1hdGNoLnNsaWNlWzBdIH07XG5cbiAgLy8gc2VlIGlmIHRoZXJlJ3MgYSBgbm90YCBydWxlIGluIHRoZXJlXG4gIGxldCBiYW5nUG9zaXRpb24gPSBwYXJhbXMuc3VicnVsZS5pbmRleE9mKFwiIVwiKTtcbiAgaWYgKGJhbmdQb3NpdGlvbiAhPT0gLTEpIHtcbiAgICBwYXJhbXMubm90ID0gcGFyYW1zLnN1YnJ1bGUuc3Vic3RyKGJhbmdQb3NpdGlvbiArIDEpO1xuICAgIHBhcmFtcy5zdWJydWxlID0gcGFyYW1zLnN1YnJ1bGUuc3Vic3RyKDAsIGJhbmdQb3NpdGlvbik7XG4gIH1cblxuICBsZXQgcnVsZSA9IG5ldyBSdWxlLlN1YnJ1bGUocGFyYW1zKTtcbiAgaWYgKGFyZ3VtZW50KSBydWxlLmFyZ3VtZW50ID0gYXJndW1lbnQ7XG4gIHJldHVybiBbIHJ1bGUsIG1hdGNoLmVuZCBdO1xufVxuXG4vLyBNYXRjaCBsaXN0IGV4cHJlc3Npb24gYFs8aXRlbT48ZGVsaW1pdGVyPl1gIG9yIGBbPGFyZ3VtZW50Pjo8aXRlbT48ZGVsaW1pdGVyPl1gIGluIHN5bnRheCBydWxlcy5cbi8vIFJldHVybnMgYFsgcnVsZSwgZW5kIF1gXG4vLyBUaHJvd3MgaWYgaW52YWxpZC5cbmZ1bmN0aW9uIHBhcnNlTGlzdChzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCwgY29uc3RydWN0b3IgPSBSdWxlLkxpc3QpIHtcbiAgbGV0IHsgZW5kLCBzbGljZSB9ID0gUGFyc2VyLmZpbmROZXN0ZWRUb2tlbnMoc3ludGF4U3RyZWFtLCBcIltcIiwgXCJdXCIsIHN0YXJ0KTtcblxuICAvLyBnZXQgYXJndW1lbnQgaWYgc3VwcGxpZWRcbiAgbGV0IGFyZ3VtZW50O1xuICBpZiAoc2xpY2UubGVuZ3RoID4gMiAmJiBzbGljZVsxXSA9PT0gXCI6XCIpIHtcbiAgICBhcmd1bWVudCA9IHNsaWNlWzBdO1xuICAgIHNsaWNlID0gc2xpY2Uuc2xpY2UoMik7XG4gIH1cblxuICBsZXQgcmVzdWx0cyA9IHBhcnNlU3ludGF4KHNsaWNlLCBbXSk7XG4gIGlmIChyZXN1bHRzLmxlbmd0aCAhPT0gMikge1xuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgVW5leHBlY3RlZCBzdHVmZiBhdCBlbmQgb2YgbGlzdDogWyR7c2xpY2Uuam9pbihcIiBcIil9XWApO1xuICB9XG4gIGxldCBbIGl0ZW0sIGRlbGltaXRlciBdID0gcmVzdWx0cztcblxuICBsZXQgcnVsZSA9IG5ldyBjb25zdHJ1Y3Rvcih7IGl0ZW0sIGRlbGltaXRlciB9KTtcbiAgaWYgKGFyZ3VtZW50KSBydWxlLmFyZ3VtZW50ID0gYXJndW1lbnQ7XG4gIHJldHVybiBbIHJ1bGUsIGVuZCBdO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1J1bGVTeW50YXguanMiLCJpbXBvcnQgeyBnZXRUYWJzIH0gZnJvbSBcIi4vdXRpbHMvc3RyaW5nXCI7XG5cbi8vIEdSUlIuLi4gbm9kZSBkb2Vzbid0IGluY2x1ZGUgdGhpcz8/P1xuLy8gQ0hFQ0sgRElGRkVSRU5UIE5PREUgVkVSU0lPTlMuLi5cbmlmICghKEFycmF5LnByb3RvdHlwZS5pbmNsdWRlcykpIHtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KEFycmF5LnByb3RvdHlwZSwgXCJpbmNsdWRlc1wiLCB7XG5cdFx0dmFsdWU6IGZ1bmN0aW9uKHZhbHVlLCBzdGFydCkge1xuXHRcdFx0bGV0IGluZGV4ID0gdGhpcy5pbmRleE9mKHZhbHVlLCBzdGFydCk7XG5cdFx0XHRyZXR1cm4gKGluZGV4ICE9PSAtMSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuXG5cbi8vIGB3aGl0ZXNwYWNlYCBjbGFzcyBmb3Igbm9ybWFsIChub24taW5kZW50LCBub24tbmV3bGluZSkgd2hpdGVzcGFjZS5cbmNsYXNzIHdoaXRlc3BhY2Uge1xuXHRjb25zdHJ1Y3Rvcih3aGl0ZXNwYWNlKSB7XG5cdFx0dGhpcy53aGl0ZXNwYWNlID0gd2hpdGVzcGFjZTtcblx0fVxuXG5cdC8vIFJldHVybiB0aGUgXCJsZW5ndGhcIiBvZiB0aGlzIHdoaXRlc3BhY2UsIGVnIGZvciBhbiBpbmRlbnQuXG5cdGdldCBsZW5ndGgoKSB7XG5cdFx0cmV0dXJuIHRoaXMud2hpdGVzcGFjZS5sZW5ndGg7XG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gdGhpcy53aGl0ZXNwYWNlO1xuXHR9XG59XG5cblxuLy8gYGluZGVudGAgY2xhc3MuXG5jbGFzcyBpbmRlbnQgZXh0ZW5kcyB3aGl0ZXNwYWNlIHt9XG5cblxuLy8gTmV3bGluZSBzaW5nbGV0b24uXG5jbGFzcyBuZXdsaW5lIGV4dGVuZHMgd2hpdGVzcGFjZSB7fVxuXG5cbi8vXG4vL1x0IyBUb2tlbml6ZXJcbi8vXHQtIGAudG9rZW5pemUoKWAgXHRcdEJyZWFrcyB1cCBsb25nIHN0cmluZyBpbnRvIHRva2VucywgaW5jbHVkaW5nIG5ld2xpbmVzLCBKU1ggZXhwcmVzc2lvbnMsIGV0Yy5cbi8vXHQtIGAudG9rZW5pemVMaW5lcygpYCBcdFRha2VzIHRoZSBhYm92ZSBhbmQgYnJlYWtzIGl0IGludG8gYW4gYXJyYXkgb2YgYXJyYXlzIGZvciBlYWNoIGxpbmUuXG4vL1xuLy8gVE9ETzogZXJyb3IgY2hlY2tpbmcgLyByZXBvcnRpbmcsIGVzcGVjaWFsbHkgaW4gSlNYIGV4cHJlc3Npb25zLlxuLy8gVE9ETzogaGF2ZSBub3JtYWwgYHRva2VuaXplYCBzdGljayB3aGl0ZXNwYWNlIGVsZW1lbnRzIGluIHRoZSBzdHJlYW0sIHRoZW4gYHRva2VuaXplTGluZXMoKWAgdGFrZXMgdGhlbSBvdXQ/XG5jb25zdCBUb2tlbml6ZXIgPSB7XG5cblx0Ly8gU2hvdWxkIHdlIHdhcm4gYWJvdXQgYW5vbWFsb3VzIGNvbmRpdGlvbnM/XG5cdFdBUk4gOiBmYWxzZSxcblxuXHQvLyBXaGl0ZXNwYWNlIGNvbnN0cnVjdG9yLlxuXHRXaGl0ZXNwYWNlOiB3aGl0ZXNwYWNlLFxuXG5cdC8vIEluZGVudCBjb25zdHJ1Y3RvclxuXHRJbmRlbnQ6IGluZGVudCxcblxuXHQvLyBORVdMSU5FIHNpbmdsZXRvbi5cblx0TkVXTElORTogbmV3IG5ld2xpbmUoXCJcXG5cIiksXG5cblx0Ly8gVG9rZW5pemUgdGV4dCBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgIGludG8gYW4gYXJyYXkgb2YgYHJlc3VsdHNgLCBhbiBhcnJheSBvZjpcblx0Ly9cdC0gYFRva2VuaXplci5ORVdMSU5FYCBmb3IgYSBuZXdsaW5lIHN5bWJvbFxuXHQvL1x0LSBzdHJpbmdzIGZvciBrZXl3b3Jkcy9zeW1ib2xzXG5cdC8vXHQtIG51bWJlcnMgZm9yIG51bWJlciBsaXRlcmFsc1xuXHQvL1x0LSBgeyBpbmRlbnQ6IG51bWJlciB9YCBmb3IgaW5kZW50IGF0IHN0YXJ0IG9mIGxpbmVcblx0Ly9cdC0gYHsgdHlwZTogXCJ0ZXh0XCIsIGxpdGVyYWw6IFwiJ2FiYydcIiwgdGV4dDogXCJhYmNcIiB9XG5cdC8vXHQtIGB7IHR5cGU6IFwiaW5kZW50XCIsIGxldmVsOiA3IH1gXG5cdC8vXHQtIGB7IHR5cGU6IFwiY29tbWVudFwiLCBjb21tZW50OiBcInN0cmluZ1wiLCBjb21tZW50U3ltYm9sLCB3aGl0ZXNwYWNlIH1gXG4vL1RFU1RNRVxuXHR0b2tlbml6ZSh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHQvLyBxdWljayByZXR1cm4gb3V0IG9mIHJhbmdlIG9yIG9ubHkgd2hpdGVzcGFjZVxuXHRcdGlmIChzdGFydCA+PSBlbmQgfHwgIXRleHQudHJpbSgpKSByZXR1cm4gW107XG5cblx0XHRsZXQgdG9rZW5zID0gW107XG5cdFx0Ly8gUHJvY2VzcyBvdXIgdG9wLWxldmVsIHJ1bGVzLlxuXHRcdGxldCBbcmVzdWx0cywgbmV4dFN0YXJ0XSA9IHRoaXMuZWF0VG9rZW5zKHRoaXMubWF0Y2hUb3BUb2tlbnMsIHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGlmIChyZXN1bHRzKSB7XG5cdFx0XHR0b2tlbnMgPSB0b2tlbnMuY29uY2F0KHJlc3VsdHMpO1xuXHRcdFx0c3RhcnQgPSBuZXh0U3RhcnQ7XG5cdFx0fVxuXHRcdGlmIChzdGFydCAhPT0gZW5kKSB7XG5cdFx0XHRpZiAoVG9rZW5pemVyLldBUk4pIGNvbnNvbGUud2FybihcInRva2VuaXplKCk6IGRpZG4ndCBjb25zdW1lOiBgXCIsIHRleHQuc2xpY2Uoc3RhcnQsIGVuZCkgKyBcImBcIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdHM7XG5cdH0sXG5cblx0Ly8gUmVwZWF0ZWRseSBleGVjdXRlIGEgYG1ldGhvZGAgKGJvdW5kIHRvIGB0aGlzKSB3aGljaCByZXR1cm5zIGEgYFtyZXN1bHQsIG5leHRTdGFydF1gIG9yIGB1bmRlZmluZWRgLlxuXHQvLyBQbGFjZXMgbWF0Y2hlZCByZXN1bHRzIHRvZ2V0aGVyIGluIGByZXN1bHRzYCBhcnJheSBhbmQgcmV0dXJucyBgW3Jlc3VsdHMsIG5leHRTdGFydF1gIGZvciB0aGUgZW50aXJlIHNldC5cblx0Ly8gU3RvcHMgaWYgYG1ldGhvZGAgZG9lc24ndCByZXR1cm4gYW55dGhpbmcsIG9yIGlmIGNhbGxpbmcgYG1ldGhvZGAgaXMgdW5wcm9kdWN0aXZlLlxuLy9URVNUTUVcblx0ZWF0VG9rZW5zKG1ldGhvZCwgdGV4dCwgc3RhcnQgPSAwLCBlbmQsIHJlc3VsdHMgPSBbXSkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gcHJvY2VzcyBydWxlcyByZXBlYXRlZGx5IHVudGlsIHdlIGdldCB0byB0aGUgZW5kXG5cdFx0d2hpbGUgKHN0YXJ0IDwgZW5kKSB7XG5cdFx0XHRsZXQgcmVzdWx0ID0gbWV0aG9kLmNhbGwodGhpcywgdGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0XHRpZiAoIXJlc3VsdCkgYnJlYWs7XG5cblx0XHRcdGxldCBbdG9rZW5zLCBuZXh0U3RhcnRdID0gcmVzdWx0O1xuXHRcdFx0Ly8gQmFpbCBpZiB3ZSBkaWRuJ3QgZ2V0IGEgcHJvZHVjdGl2ZSBydWxlIVxuXHRcdFx0aWYgKHN0YXJ0ID09PSBuZXh0U3RhcnQpIGJyZWFrO1xuXG5cdFx0XHQvLyBoYW5kbGUgbmV3UmVzdWx0cyBhcyBhbiBhcnJheSBvciBzaW5nbGUgb2JqZWN0LlxuXHRcdFx0aWYgKHRva2VucyAhPT0gdW5kZWZpbmVkKSByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQodG9rZW5zKTtcblx0XHRcdHN0YXJ0ID0gbmV4dFN0YXJ0O1xuXHRcdH1cblx0XHRyZXR1cm4gW3Jlc3VsdHMsIHN0YXJ0XTtcblx0fSxcblxuXHQvLyBNYXRjaCBhIHNpbmdsZSB0b3AtbGV2ZWwgdG9rZW4gYXQgYHRleHRbc3RhcnRdYC5cbi8vVEVTVE1FXG5cdG1hdGNoVG9wVG9rZW5zKHRleHQsIHN0YXJ0LCBlbmQpIHtcblx0XHRyZXR1cm5cdHRoaXMubWF0Y2hXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaFdvcmQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoTnVtYmVyKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaE5ld2xpbmUodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoSlNYRWxlbWVudCh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0IHx8IHRoaXMubWF0Y2hUZXh0KHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaENvbW1lbnQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoU3ltYm9sKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0O1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBTeW1ib2wgY2hhcmFjdGVyXG5cdC8vXG5cblx0Ly8gTWF0Y2ggdGhlIHNpbmdsZSBcInN5bWJvbFwiIGNoYXJhY3RlciBhdCBgdGV4dFtzdGFydF1gLlxuXHQvLyBOT1RFOiBUaGlzIGRvZXMgbm90IGRvIGFueSBjaGVja2luZywgaXQganVzdCBibGluZGx5IHVzZXMgdGhlIGNoYXJhY3RlciBpbiBxdWVzdGlvbi5cblx0Ly9cdFx0IFlvdSBzaG91bGQgbWFrZSBzdXJlIGFsbCBvdGhlciBwb3NzaWJsZSBydWxlcyBoYXZlIGJlZW4gZXhoYXVzdGVkIGZpcnN0LlxuXHRtYXRjaFN5bWJvbCh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIFt0ZXh0W3N0YXJ0XSwgc3RhcnQgKyAxXVxuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBXaGl0ZXNwYWNlXG5cdC8vXG5cblx0Ly8gUmV0dXJuIHRoZSBmaXJzdCBjaGFyIHBvc2l0aW9uIGFmdGVyIGBzdGFydGAgd2hpY2ggaXMgTk9UIGEgd2hpdGVzcGFjZSBjaGFyIChzcGFjZSBvciB0YWIgb25seSkuXG5cdC8vIElmIGB0ZXh0W3N0YXJ0XWAgaXMgbm90IHdoaXRlc3BhY2UsIHJldHVybnMgYHN0YXJ0YCxcblx0Ly9cdHNvIHlvdSBjYW4gY2FsbCB0aGlzIGF0IGFueSB0aW1lIHRvIHNraXAgd2hpdGVzcGFjZSBpbiB0aGUgb3V0cHV0LlxuXHRlYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiBlbmQ7XG5cblx0XHRsZXQgd2hpdGVTcGFjZUVuZCA9IHN0YXJ0O1xuXHRcdHdoaWxlICh3aGl0ZVNwYWNlRW5kIDwgZW5kICYmICh0ZXh0W3doaXRlU3BhY2VFbmRdID09PSBcIiBcIiB8fCB0ZXh0W3doaXRlU3BhY2VFbmRdID09PSBcIlxcdFwiKSkge1xuXHRcdFx0d2hpdGVTcGFjZUVuZCsrO1xuXHRcdH1cblx0XHRyZXR1cm4gd2hpdGVTcGFjZUVuZDtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgV2hpdGVzcGFjZVxuXHQvL1x0Tk9URTogV2hpdGVzcGFjZSBhdCB0aGUgYmVnaW5uaW5nIG9mIGB0ZXh0YCBvciB0aGUgYmVnaW5uaW5nIG9mIGEgbGluZVxuXHQvL1x0XHQgIGlzIGNvbnNpZGVyZWQgYW4gXCJpbmRlbnRcIiBhbmQgd2lsbCBoYXZlIGAuaXNJbmRlbnQgPT09IHRydWVgLlxuXHQvL1xuXG5cdC8vIENvbnZlcnQgYSBydW4gb2Ygc3BhY2VzIGFuZC9vciB0YWJzIGludG8gYSBgVG9rZW5pemVyLldoaXRlc3BhY2VgLlxuXHRtYXRjaFdoaXRlc3BhY2UodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB3aGl0ZXNwYWNlRW5kID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdC8vIGZvcmdldCBpdCBpZiBubyBmb3J3YXJkIG1vdGlvblxuXHRcdGlmICh3aGl0ZXNwYWNlRW5kID09PSBzdGFydCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB3aGl0ZXNwYWNlID0gdGV4dC5zbGljZShzdGFydCwgd2hpdGVzcGFjZUVuZCk7XG5cdFx0bGV0IHRva2VuO1xuXHRcdGlmIChzdGFydCA9PT0gMCB8fCB0ZXh0W3N0YXJ0LTFdID09PSBcIlxcblwiKVxuXHRcdFx0dG9rZW4gPSBuZXcgVG9rZW5pemVyLkluZGVudCh3aGl0ZXNwYWNlKTtcblx0XHRlbHNlXG5cdFx0XHR0b2tlbiA9IG5ldyBUb2tlbml6ZXIuV2hpdGVzcGFjZSh3aGl0ZXNwYWNlKTtcblxuXHRcdHJldHVybiBbdG9rZW4sIHdoaXRlc3BhY2VFbmRdO1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBOZXdsaW5lXG5cdC8vXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgbmV3bGluZSBjaGFyYWN0ZXIgYXQgYHRleHRbc3RhcnRdYC5cblx0Ly8gUmV0dXJucyBgW1Rva2VuaXplci5ORVdMSU5FLCBuZXh0U3RhcnRdYCBvbiBtYXRjaC5cblx0Ly8gT3RoZXJ3aXNlIHJldHVybnMgYHVuZGVmaW5lZGAuXG5cdG1hdGNoTmV3bGluZSh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kIHx8IHRleHRbc3RhcnRdICE9PSBcIlxcblwiKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIFtUb2tlbml6ZXIuTkVXTElORSwgc3RhcnQgKyAxXTtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgV29yZFxuXHQvL1xuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIGB3b3JkYCBpbiBgdGV4dGAgYXQgY2hhcmFjdGVyIGBzdGFydGAuXG5cdC8vIFJldHVybnMgYFt3b3JkLCB3b3JkRW5kXWAuXG5cdC8vIFJldHVybnMgYW4gZW1wdHkgYXJyYXkgaWYgY291bGRuJ3QgbWF0Y2ggYSB3b3JkLlxuXHRXT1JEX1NUQVJUOiAvW0EtWmEtel0vLFxuXHRXT1JEX0NIQVIgOiAvXltcXHdfLV0vLFxuXHRtYXRjaFdvcmQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGlmICghdGhpcy5XT1JEX1NUQVJULnRlc3QodGV4dFtzdGFydF0pKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHdvcmRFbmQgPSBzdGFydCArIDE7XG5cdFx0d2hpbGUgKHdvcmRFbmQgPCBlbmQgJiYgdGhpcy5XT1JEX0NIQVIudGVzdCh0ZXh0W3dvcmRFbmRdKSkge1xuXHRcdFx0d29yZEVuZCsrO1xuXHRcdH1cblx0XHRpZiAod29yZEVuZCA9PT0gc3RhcnQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgd29yZCA9IHRleHQuc2xpY2Uoc3RhcnQsIHdvcmRFbmQpO1xuXHRcdHJldHVybiBbd29yZCwgd29yZEVuZF07XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIE51bWJlcnNcblx0Ly9cblxuXHQvLyBFYXQgYSBzaW5nbGUgbnVtYmVyLlxuXHQvLyBSZXR1cm5zIGEgYE51bWJlcmAgaWYgbWF0Y2hlZC5cblx0TlVNQkVSX1NUQVJUOiAvWzAtOS0uXS8sXG5cdE5VTUJFUiA6IC9eLT8oWzAtOV0qXFwuKT9bMC05XSsvLFxuXHRtYXRjaE51bWJlcih0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0aWYgKCF0aGlzLk5VTUJFUl9TVEFSVC50ZXN0KHRleHRbc3RhcnRdKSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBudW1iZXJNYXRjaCA9IHRoaXMubWF0Y2hFeHByZXNzaW9uQXRIZWFkKHRoaXMuTlVNQkVSLCB0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRpZiAoIW51bWJlck1hdGNoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG51bWJlclN0ciA9IG51bWJlck1hdGNoWzBdO1xuXHRcdGxldCBudW1iZXIgPSBwYXJzZUZsb2F0KG51bWJlclN0ciwgMTApO1xuXHRcdHJldHVybiBbbnVtYmVyLCBzdGFydCArIG51bWJlclN0ci5sZW5ndGhdO1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBUZXh0IGxpdGVyYWxcblx0Ly9cblxuXHQvLyBFYXQgYSB0ZXh0IGxpdGVyYWwgKHN0YXJ0cy9lbmRzIHdpdGggYCdgIG9yIGBcImApLlxuXHQvLyBSZXR1cm5zIGEgYFRva2VuaXplci5UZXh0YCBpZiBtYXRjaGVkLlxuLy9URVNUTUU6ICBub3Qgc3VyZSB0aGUgZXNjYXBpbmcgbG9naWMgaXMgcmVhbGx5IHJpZ2h0Li4uXG5cdG1hdGNoVGV4dCh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHF1b3RlU3ltYm9sID0gdGV4dFtzdGFydF07XG5cdFx0aWYgKHF1b3RlU3ltYm9sICE9PSAnXCInICYmIHF1b3RlU3ltYm9sICE9PSBcIidcIikgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB0ZXh0RW5kID0gc3RhcnQgKyAxO1xuXHRcdHdoaWxlICh0ZXh0RW5kIDwgZW5kKSB7XG5cdFx0XHRsZXQgY2hhciA9IHRleHRbdGV4dEVuZF07XG5cdFx0XHRpZiAoY2hhciA9PT0gcXVvdGVTeW1ib2wpIGJyZWFrO1xuXHRcdFx0Ly8gaWYgd2UgZ2V0IGEgYmFja3F1b3RlLCBpZ25vcmUgcXVvdGUgaW4gbmV4dCBjaGFyXG5cdFx0XHRpZiAoY2hhciA9PT0gXCJcXFxcXCIgJiYgdGV4dFt0ZXh0RW5kICsgMV0gPT09IHF1b3RlU3ltYm9sKSB0ZXh0RW5kKys7XG5cdFx0XHR0ZXh0RW5kKys7XG5cdFx0fVxuXHRcdC8vIEZvcmdldCBpdCBpZiB3ZSBkaWRuJ3QgZW5kIHdpdGggdGhlIHF1b3RlIHN5bWJvbFxuXHRcdGlmICh0ZXh0W3RleHRFbmRdICE9PSBxdW90ZVN5bWJvbCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHQvLyBhZHZhbmNlIHBhc3QgZW5kIHF1b3RlXG5cdFx0dGV4dEVuZCsrO1xuXG5cdFx0bGV0IHF1b3RlZFN0cmluZyA9IHRleHQuc2xpY2Uoc3RhcnQsIHRleHRFbmQpO1xuXHRcdGxldCB0b2tlbiA9IG5ldyBUb2tlbml6ZXIuVGV4dChxdW90ZWRTdHJpbmcpO1xuXHRcdHJldHVybiBbdG9rZW4sIHRleHRFbmRdO1xuXHR9LFxuXG5cdC8vIGBUZXh0YCBjbGFzcyBmb3Igc3RyaW5nIGxpdGVyYWxzLlxuXHQvLyBQYXNzIHRoZSBsaXRlcmFsIHZhbHVlLCB1c2UgYC50ZXh0YCB0byBnZXQganVzdCB0aGUgYml0IGluc2lkZSB0aGUgcXVvdGVzLlxuXHRUZXh0IDogY2xhc3MgdGV4dCB7XG5cdFx0Y29uc3RydWN0b3IocXVvdGVkU3RyaW5nKSB7XG5cdFx0XHR0aGlzLnF1b3RlZFN0cmluZyA9IHF1b3RlZFN0cmluZztcblx0XHR9XG5cdFx0Z2V0IHRleHQoKSB7XG5cdFx0XHRsZXQgc3RyaW5nID0gdGhpcy5xdW90ZWRTdHJpbmc7XG5cdFx0XHQvLyBjYWxjdWxhdGUgYHRleHRgIGFzIHRoZSBiaXRzIGJldHdlZW4gdGhlIHF1b3Rlcy5cblx0XHRcdGxldCBzdGFydCA9IDA7XG5cdFx0XHRsZXQgZW5kID0gc3RyaW5nLmxlbmd0aDtcblx0XHRcdGlmIChzdHJpbmdbc3RhcnRdID09PSAnXCInIHx8IHN0cmluZ1tzdGFydF0gPT09IFwiJ1wiKSBzdGFydCA9IDE7XG5cdFx0XHRpZiAoc3RyaW5nW2VuZC0xXSA9PT0gJ1wiJyB8fCBzdHJpbmdbZW5kLTFdID09PSBcIidcIikgZW5kID0gLTE7XG5cdFx0XHRyZXR1cm4gc3RyaW5nLnNsaWNlKHN0YXJ0LCBlbmQpO1xuXHRcdH1cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdHJldHVybiB0aGlzLnF1b3RlZFN0cmluZztcblx0XHR9XG5cdH0sXG5cblx0Ly9cblx0Ly9cdCMjIyBDb21tZW50c1xuXHQvL1xuXG5cdC8vIEVhdCBhIGNvbW1lbnQgKHVudGlsIHRoZSBlbmQgb2YgdGhlIGxpbmUpLlxuXHQvLyBSZXR1cm5zIGEgYFRva2VuaXplci5Db21tZW50YCBpZiBtYXRjaGVkLlxuXHRDT01NRU5UIDogL14oIyMrfC0tK3xcXC9cXC8rKShcXHMqKSguKikvLFxuXHRtYXRjaENvbW1lbnQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBjb21tZW50U3RhcnQgPSB0ZXh0LnNsaWNlKHN0YXJ0LCBzdGFydCArIDIpO1xuXHRcdGlmIChjb21tZW50U3RhcnQgIT09IFwiLS1cIiAmJiBjb21tZW50U3RhcnQgIT09IFwiXFwvXFwvXCIgJiYgY29tbWVudFN0YXJ0ICE9PSBcIiMjXCIpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBjb21tZW50IGVhdHMgdW50aWwgdGhlIGVuZCBvZiB0aGUgbGluZVxuXHRcdGxldCBsaW5lID0gdGhpcy5nZXRMaW5lQXRIZWFkKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGxldCBjb21tZW50TWF0Y2ggPSBsaW5lLm1hdGNoKHRoaXMuQ09NTUVOVClcblx0XHRpZiAoIWNvbW1lbnRNYXRjaCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBbbWF0Y2gsIGNvbW1lbnRTeW1ib2wsIHdoaXRlc3BhY2UsIGNvbW1lbnRdID0gY29tbWVudE1hdGNoO1xuXHRcdGxldCB0b2tlbiA9IG5ldyBUb2tlbml6ZXIuQ29tbWVudCh7IGNvbW1lbnRTeW1ib2wsIHdoaXRlc3BhY2UsIGNvbW1lbnQgfSk7XG5cdFx0cmV0dXJuIFt0b2tlbiwgc3RhcnQgKyBsaW5lLmxlbmd0aF07XG5cdH0sXG5cblx0Ly8gQ29tbWVudCBjbGFzc1xuLy9URVNUTUVcblx0Q29tbWVudCA6IGNsYXNzIGNvbW1lbnQge1xuXHRcdGNvbnN0cnVjdG9yIChwcm9wcykge1xuXHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBwcm9wcyk7XG5cdFx0fVxuXHRcdHRvU3RyaW5nKCkge1xuXHRcdFx0cmV0dXJuIGAke3RoaXMuY29tbWVudFN5bWJvbH0ke3RoaXMud2hpdGVzcGFjZX0ke3RoaXMuY29tbWVudH1gO1xuXHRcdH1cblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgSlNYXG5cdC8vXG5cblx0Ly8gRWF0IGEgKG5lc3RlZCkgSlNYIGV4cHJlc3Npb24uXG4vL1RFU1RNRVxuXHRtYXRjaEpTWEVsZW1lbnQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XSA9IHRoaXMubWF0Y2hKU1hTdGFydFRhZyh0ZXh0LCBzdGFydCwgZW5kKSB8fCBbXTtcblx0XHRpZiAoIWpzeEVsZW1lbnQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRpZiAoIWpzeEVsZW1lbnQuaXNVbmFyeVRhZykge1xuXHRcdFx0bGV0IFtjaGlsZHJlbiwgY2hpbGRFbmRdID0gdGhpcy5tYXRjaEpTWENoaWxkcmVuKGpzeEVsZW1lbnQudGFnTmFtZSwgdGV4dCwgbmV4dFN0YXJ0LCBlbmQpO1xuXHRcdFx0aWYgKGNoaWxkcmVuLmxlbmd0aCkge1xuXHRcdFx0XHRqc3hFbGVtZW50LmNoaWxkcmVuID0gY2hpbGRyZW47XG5cdFx0XHRcdG5leHRTdGFydCA9IGNoaWxkRW5kO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XTtcblx0fSxcblxuXHQvLyBNYXRjaCBKU1ggc3RhcnQgdGFnIGFuZCBpbnRlcm5hbCBlbGVtZW50cyAoYnV0IE5PVCBjaGlsZHJlbikuXG5cdC8vIFJldHVybnMgYFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdYCBvciBgdW5kZWZpbmVkYC5cblx0Ly8gVXNlIGBtYXRjaEpTWEVsZW1lbnQoKWAgdG8gbWF0Y2ggY2hpbGRyZW4sIGVuZCB0YWcsIGV0Yy5cblx0Ly8gSWdub3JlcyBsZWFkaW5nIHdoaXRlc3BhY2UuXG5cdEpTWF9UQUdfU1RBUlQgOiAvXjwoW0EtWmEtel1bXFx3LVxcLl0qKShcXHMqXFwvPnxcXHMqPnxcXHMrKS8sXG4vLyBUT0RPOiBjbGVhbiB0aGlzIHN0dWZmIHVwLCBtYXliZSB3aXRoIGZpbmRGaXJzdEF0SGVhZD9cblx0bWF0Y2hKU1hTdGFydFRhZyh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG5leHRTdGFydCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHQvLyBNYWtlIHN1cmUgd2Ugc3RhcnQgd2l0aCBgPGAuXG5cdFx0aWYgKHRleHRbbmV4dFN0YXJ0XSAhPT0gXCI8XCIpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgdGFnTWF0Y2ggPSB0aGlzLm1hdGNoRXhwcmVzc2lvbkF0SGVhZCh0aGlzLkpTWF9UQUdfU1RBUlQsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRpZiAoIXRhZ01hdGNoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IFsgbWF0Y2hUZXh0LCB0YWdOYW1lLCBlbmRCaXQgXSA9IHRhZ01hdGNoO1xuXHRcdGxldCBqc3hFbGVtZW50ID0gbmV3IFRva2VuaXplci5KU1hFbGVtZW50KHRhZ05hbWUpO1xuXHRcdG5leHRTdGFydCA9IG5leHRTdGFydCArIG1hdGNoVGV4dC5sZW5ndGg7XG5cblx0XHQvLyBJZiB1bmFyeSB0YWcsIG1hcmsgYXMgc3VjaCBhbmQgcmV0dXJuLlxuXHRcdGVuZEJpdCA9IGVuZEJpdC50cmltKCk7XG5cdFx0aWYgKGVuZEJpdCA9PT0gXCIvPlwiKSB7XG5cdFx0XHRqc3hFbGVtZW50LmlzVW5hcnlUYWcgPSB0cnVlO1xuXHRcdFx0cmV0dXJuIFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdO1xuXHRcdH1cblxuXHRcdC8vIElmIHdlIGRpZG4ndCBpbW1lZGlhdGVseSBnZXQgYW4gZW5kIG1hcmtlciwgYXR0ZW1wdCB0byBtYXRjaCBhdHRyaWJ1dGVzXG5cdFx0aWYgKGVuZEJpdCAhPT0gXCI+XCIgJiYgZW5kQml0ICE9PSBcIi8+XCIpIHtcblx0XHRcdGxldCBbIGF0dHJzLCBhdHRyRW5kIF0gPSB0aGlzLmVhdFRva2Vucyh0aGlzLm1hdGNoSlNYQXR0cmlidXRlLCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0XHRqc3hFbGVtZW50LmF0dHJpYnV0ZXMgPSBhdHRycztcblx0XHRcdG5leHRTdGFydCA9IGF0dHJFbmQ7XG5cdFx0fVxuXG5cdFx0Ly8gYXQgdGhpcyBwb2ludCB3ZSBzaG91bGQgZ2V0IGFuIGAvPmAgb3IgYD5gICh3aXRoIG5vIHdoaXRlc3BhY2UpLlxuXHRcdGlmICh0ZXh0W25leHRTdGFydF0gPT09IFwiL1wiICYmIHRleHRbbmV4dFN0YXJ0ICsgMV0gPT09IFwiPlwiKSB7XG5cdFx0XHRlbmRCaXQgPSBcIi8+XCI7XG5cdFx0XHRuZXh0U3RhcnQgKz0gMjtcblx0XHR9XG5cdFx0ZWxzZSBpZiAodGV4dFtuZXh0U3RhcnRdID09PSBcIj5cIikge1xuXHRcdFx0ZW5kQml0ID0gdGV4dFtuZXh0U3RhcnRdO1xuXHRcdFx0bmV4dFN0YXJ0ICs9IDE7XG5cdFx0fVxuXG5cdFx0Ly8gUmV0dXJuIGltbWVkaWF0ZWx5IGZvciB1bmFyeSB0YWdcblx0XHRpZiAoZW5kQml0ID09PSBcIi8+XCIpIHtcblx0XHRcdGpzeEVsZW1lbnQuaXNVbmFyeVRhZyA9IHRydWU7XG5cdFx0XHRyZXR1cm4gW2pzeEVsZW1lbnQsIG5leHRTdGFydF07XG5cdFx0fVxuXG5cdFx0Ly8gYWR2YW5jZSBwYXN0IGA+YFxuXHRcdGlmIChlbmRCaXQgIT09IFwiPlwiKSB7XG5cdFx0XHRpZiAoVG9rZW5pemVyLldBUk4pIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKFwiTWlzc2luZyBleHBlY3RlZCBlbmQgYD5gIGZvciBqc3hFbGVtZW50XCIsIGpzeEVsZW1lbnQsIFwiYFwiK3RleHQuc2xpY2Uoc3RhcnQsIG5leHRTdGFydCkrXCJgXCIpO1xuXHRcdFx0fVxuXHRcdFx0anN4RWxlbWVudC5lcnJvciA9IFwiTm8gZW5kID5cIjtcblx0XHRcdHJldHVybiBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XTtcblx0XHR9XG5cblx0XHRyZXR1cm4gW2pzeEVsZW1lbnQsIG5leHRTdGFydF07XG5cdH0sXG5cblxuXHQvLyBKU1ggZWxlbWVudCBjbGFzc1xuXHRKU1hFbGVtZW50IDogY2xhc3MganN4RWxlbWVudCB7XG5cdFx0Y29uc3RydWN0b3IodGFnTmFtZSwgYXR0cmlidXRlcywgY2hpbGRyZW4pIHtcblx0XHRcdHRoaXMudGFnTmFtZSA9IHRhZ05hbWU7XG5cdFx0XHRpZiAoYXR0cmlidXRlcykgdGhpcy5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcblx0XHRcdGlmIChjaGlsZHJlbikgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuXHRcdH1cblxuXHRcdC8vIFJldHVybiBhdHRyaWJ1dGVzIGFzIGEgbWFwLlxuLy9URVNUTUVcblx0XHRnZXQgYXR0cnMoKSB7XG5cdFx0XHRsZXQgYXR0cnMgPSB7fTtcblx0XHRcdGlmICh0aGlzLmF0dHJpYnV0ZXMpIHRoaXMuYXR0cmlidXRlcy5mb3JFYWNoKGF0dHIgPT4ge1xuXHRcdFx0XHQvLyBpZ25vcmUgdW5uYW1lZCBhdHRyaWJ1dGVzXG5cdFx0XHRcdGlmIChhdHRyLm5hbWUpIGF0dHJzW2F0dHIubmFtZV0gPSBhdHRyLnZhbHVlXG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBhdHRycztcblx0XHR9XG5cblx0XHQvLyBSZXR1cm4gb3VyIGF0dHJpYnV0ZXMgYXMgYSBzdHJpbmdcbi8vVEVTVE1FXG5cdFx0Z2V0IGF0dHJzQXNTdHJpbmcoKSB7XG5cdFx0XHRpZiAoIXRoaXMuYXR0cmlidXRlcykgcmV0dXJuIFwiXCI7XG5cdFx0XHRyZXR1cm4gXCIgXCIgKyB0aGlzLmF0dHJpYnV0ZXMubWFwKCAoeyBuYW1lLCB2YWx1ZSB9KSA9PiB7XG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gbmFtZTtcblx0XHRcdFx0Ly8gY29udmVydCB2YWx1ZSBhcnJheSAodG9rZW5zKSB0byBzdHJpbmdcblx0XHRcdFx0Ly8gVE9ETzogdGhpcyB3aWxsIHdhbnQgdG8gYmUgc21hcnRlci4uLlxuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHZhbHVlID0gYHske3ZhbHVlLmpvaW4oXCIgXCIpfX1gO1xuXHRcdFx0XHRyZXR1cm4gYG5hbWU9JHt2YWx1ZX1gO1xuXHRcdFx0fSkuam9pbihcIiBcIik7XG5cdFx0fVxuXG5cdFx0Ly8gUmV0dXJuIG91ciBjaGlsZHJlbiBhcyBhIHN0cmluZy5cbi8vVEVTVE1FXG5cdFx0Z2V0IGNoaWxkcmVuQXNTdHJpbmcoKSB7XG5cdFx0XHRpZiAoIXRoaXMuY2hpbGRyZW4pIHJldHVybiBcIlwiO1xuXHRcdFx0cmV0dXJuIHRoaXMuY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY2hpbGQpKSByZXR1cm4gYHske2NoaWxkLmpvaW4oXCIgXCIpfX1gO1xuXHRcdFx0XHRyZXR1cm4gXCJcIiArIGNoaWxkO1xuXHRcdFx0fSkuam9pbihcIlwiKTtcblx0XHR9XG5cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdGxldCBhdHRycyA9IHRoaXMuYXR0cnNBc1N0cmluZztcblx0XHRcdGxldCBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW5Bc1N0cmluZztcblx0XHRcdGlmICh0aGlzLmlzVW5hcnlUYWcpIHJldHVybiBgPCR7dGhpcy50YWdOYW1lfSR7YXR0cnN9Lz5gO1xuXHRcdFx0cmV0dXJuIGA8JHt0aGlzLnRhZ05hbWV9JHthdHRyc30+JHtjaGlsZHJlbn08LyR7dGhpcy50YWdOYW1lfT5gO1xuXHRcdH1cblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgSlNYIGNoaWxkcmVuXG5cdC8vXG5cblx0Ly8gTWF0Y2ggSlNYIGVsZW1lbnQgY2hpbGRyZW4gb2YgYDx0YWdOYW1lPmAgYXQgYHRleHRbc3RhcnRdYC5cblx0Ly8gTWF0Y2hlcyBuZXN0ZWQgY2hpbGRyZW4gYW5kIHN0b3BzIGFmdGVyIG1hdGNoaW5nIGVuZCB0YWc6IGA8L3RhZ05hbWU+YC5cblx0Ly8gUmV0dXJucyBgW2NoaWxkcmVuLCBuZXh0U3RhcnRdYC5cbi8vVEVTVE1FXG5cdG1hdGNoSlNYQ2hpbGRyZW4odGFnTmFtZSwgdGV4dCwgc3RhcnQsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IGNoaWxkcmVuID0gW107XG5cdFx0bGV0IG5lc3RpbmcgPSAxO1xuXHRcdGxldCBlbmRUYWcgPSBgPC8ke3RhZ05hbWV9PmA7XG5cblx0XHRsZXQgbmV4dFN0YXJ0ID0gc3RhcnQ7XG5cdFx0d2hpbGUodHJ1ZSkge1xuXHRcdFx0bGV0IHJlc3VsdCA9IHRoaXMubWF0Y2hKU1hDaGlsZChlbmRUYWcsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRcdGlmICghcmVzdWx0KSBicmVhaztcblxuXHRcdFx0bGV0IFtjaGlsZCwgY2hpbGRFbmRdID0gcmVzdWx0O1xuXHRcdFx0bmV4dFN0YXJ0ID0gY2hpbGRFbmQ7XG5cdFx0XHQvLyBJZiB3ZSBnb3QgdGhlIGVuZFRhZywgdXBkYXRlIG5lc3RpbmcgYW5kIGJyZWFrIG91dCBvZiBsb29wIGlmIG5lc3RpbmcgIT09IDBcblx0XHRcdGlmIChjaGlsZCA9PT0gZW5kVGFnKSB7XG5cdFx0XHRcdG5lc3RpbmcgLS07XG5cdFx0XHRcdGlmIChuZXN0aW5nID09PSAwKSBicmVhaztcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYgKGNoaWxkKSBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcblx0XHRcdH1cblx0XHR9XG4vLyBUT0RPOiBob3cgdG8gc3VyZmFjZSB0aGlzIGVycm9yPz8/XG5cdFx0aWYgKG5lc3RpbmcgIT09IDApIHtcblx0XHRcdGlmIChUb2tlbml6ZXIuV0FSTikge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oYG1hdGNoSlNYQ2hpbGRyZW4oJHt0ZXh0LnNsaWNlKHN0YXJ0LCBuZXh0U3RhcnQgKyAxMCl9OiBkaWRuJ3QgbWF0Y2ggZW5kIGNoaWxkIWApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gW2NoaWxkcmVuLCBuZXh0U3RhcnRdO1xuXHR9LFxuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIEpTWCBjaGlsZDpcblx0Ly9cdC0gY3VycmVudCBlbmRUYWdcblx0Ly9cdC0gYHsganN4IGV4cHJlc3Npb24gfWBcblx0Ly9cdC0gbmVzdGVkIEpTWCBlbGVtZW50XG5cdC8vXHQtIChhbnl0aGluZyBlbHNlKSBhcyBqc3hUZXh0IGV4cHJlc3Npb24uXG5cdG1hdGNoSlNYQ2hpbGQoZW5kVGFnLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdHJldHVybiB0aGlzLm1hdGNoSlNYRW5kVGFnKGVuZFRhZywgdGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hKU1hFeHByZXNzaW9uKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoSlNYRWxlbWVudCh0ZXh0LCBzdGFydCwgZW5kKVxuLy8gVE9ETzogbmV3bGluZSBhbmQgaW5kZW50P1xuXHRcdFx0fHwgdGhpcy5tYXRjaEpTWFRleHQodGV4dCwgc3RhcnQsIGVuZCk7XG5cdH0sXG5cblx0Ly8gQXR0ZW1wdCB0byBtYXRjaCBhIHNwZWNpZmljIGVuZCB0YWcuXG5cdC8vIElnbm9yZXMgbGVhZGluZyB3aGl0ZXNwYWNlLlxuXHRtYXRjaEpTWEVuZFRhZyhlbmRUYWcsIHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbmV4dFN0YXJ0ID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGlmICghdGhpcy5tYXRjaFN0cmluZ0F0SGVhZChlbmRUYWcsIHRleHQsIG5leHRTdGFydCwgZW5kKSkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gW2VuZFRhZywgbmV4dFN0YXJ0ICsgZW5kVGFnLmxlbmd0aF07XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIEpTWCBhdHRyaWJ1dGVzXG5cdC8vXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgSlNYIGVsZW1lbnQgYXR0cmlidXRlIGFzIGA8YXR0cj49ezx2YWx1ZT59YFxuLy8gVE9ETzogey4uLnh4eH1cblx0SlNYX0FUVFJJQlVURV9TVEFSVCA6IC9eXFxzKihbXFx3LV0rXFxiKVxccyooPT8pXFxzKi8sXG5cdG1hdGNoSlNYQXR0cmlidXRlKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBhdHRyaWJ1dGVzIG11c3Qgc3RhcnQgd2l0aCBhIHdvcmQgY2hhcmFjdGVyXG5cdFx0aWYgKCF0aGlzLldPUkRfU1RBUlQudGVzdCh0ZXh0W3N0YXJ0XSkpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBhdHRlbXB0IHRvIG1hdGNoIGFuIGF0dHJpYnV0ZSBuYW1lLCBpbmNsdWRpbmcgYD1gIGlmIHByZXNlbnQuXG5cdFx0bGV0IHJlc3VsdCA9IHRoaXMubWF0Y2hFeHByZXNzaW9uQXRIZWFkKHRoaXMuSlNYX0FUVFJJQlVURV9TVEFSVCwgdGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0aWYgKCFyZXN1bHQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgWyBtYXRjaCwgbmFtZSwgZXF1YWxzIF0gPSByZXN1bHQ7XG5cdFx0bGV0IG5leHRTdGFydCA9IHN0YXJ0ICsgbWF0Y2gubGVuZ3RoO1xuXHRcdGxldCBhdHRyaWJ1dGUgPSBuZXcgVG9rZW5pemVyLkpTWEF0dHJpYnV0ZShuYW1lKTtcblxuXHRcdC8vIGlmIHRoZXJlIHdhcyBhbiBlcXVhbHMgY2hhciwgcGFyc2UgdGhlIHZhbHVlXG5cdFx0aWYgKGVxdWFscykge1xuXHRcdFx0bGV0IFt2YWx1ZSwgdmFsdWVFbmRdID0gdGhpcy5tYXRjaEpTWEF0dHJpYnV0ZVZhbHVlKHRleHQsIG5leHRTdGFydCwgZW5kKSB8fCBbXTtcblx0XHRcdGlmICh2YWx1ZSkge1xuXHRcdFx0XHRhdHRyaWJ1dGUudmFsdWUgPSB2YWx1ZTtcblx0XHRcdFx0bmV4dFN0YXJ0ID0gdmFsdWVFbmQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGVhdCB3aGl0ZXNwYWNlIGJlZm9yZSB0aGUgbmV4dCBhdHRyaWJ1dGUgLyB0YWcgZW5kXG5cdFx0bmV4dFN0YXJ0ID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRyZXR1cm4gW2F0dHJpYnV0ZSwgbmV4dFN0YXJ0XTtcblx0fSxcblxuXHQvLyBNYXRjaCBhIHZhbHVlIGV4cHJlc3Npb24gZm9yIGEgSlNYIGVsZW1lbnQgYXR0cmlidXRlOlxuXHQvLyBOT1RFOiB3ZSB3aWxsIGJlIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlciB0aGUgYD1gIChhbmQgc3Vic2VxdWVudCB3aGl0ZXNwYWNlKS5cblx0bWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZSh0ZXh0LCBzdGFydCwgZW5kKSB7XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hUZXh0KHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoSlNYRXhwcmVzc2lvbih0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0fHwgdGhpcy5tYXRjaEpTWEVsZW1lbnQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZUlkZW50aWZpZXIodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hOdW1iZXIodGV4dCwgc3RhcnQsIGVuZClcblx0XHQ7XG5cdH0sXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgaWRlbnRpZmVyIGFzIGEgSlNYIGF0dHJpYnV0ZSB2YWx1ZS5cblx0Ly8gUmV0dXJucyBhcyBhIGBKU1hFeHByZXNzaW9uYC5cblx0bWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZUlkZW50aWZpZXIodGV4dCwgc3RhcnQsIGVuZCkge1xuXHRcdGxldCByZXN1bHQgPSB0aGlzLm1hdGNoV29yZCh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRpZiAoIXJlc3VsdCkgcmV0dXJuO1xuXG5cdFx0bGV0IFsgd29yZCwgbmV4dFN0YXJ0IF0gPSByZXN1bHQ7XG5cdFx0bGV0IHRva2VuID0gbmV3IFRva2VuaXplci5KU1hFeHByZXNzaW9uKHdvcmQpO1xuXHRcdHJldHVybiBbdG9rZW4sIG5leHRTdGFydF07XG5cdH0sXG5cblx0Ly8gSlNYIGF0dHJpYnV0ZSBjbGFzc1xuXHQvLyBgbmFtZWAgaXMgdGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZS5cblx0Ly8gYHZhbHVlYCBpcyBvbmUgb2Y6XG5cdC8vXHRcdC0gYCcuLi4nYFx0XHRcdC8vIFRleHQgKGxpdGVyYWwgc3RyaW5nKS5cblx0Ly9cdFx0LSBgXCIuLi5cImBcdFx0XHQvLyBUZXh0IChsaXRlcmFsIHN0cmluZykuXG5cdC8vXHRcdC0gYHsuLi59YFx0XHRcdC8vIEV4cHJlc3Npb24uICBSZXN1bHRzIHdpbGwgYmUgdG9rZW5pemVkIGFycmF5LlxuXHQvL1x0XHQtIGA8Li4uLj5gXHRcdFx0Ly8gSlNYIGVsZW1lbnQuXG5cdC8vXHRcdC0gYDFgXHRcdFx0XHQvLyBOdW1iZXIuICBOb3RlOiB0aGlzIGlzIGFuIGV4dGVuc2lvbiB0byBKU1guXG5cblx0SlNYQXR0cmlidXRlIDogY2xhc3MganN4QXR0cmlidXRlIHtcblx0XHRjb25zdHJ1Y3RvcihuYW1lLCB2YWx1ZSkge1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZTtcblx0XHRcdGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB0aGlzLnZhbHVlID0gdmFsdWU7XG5cdFx0fVxuXHRcdHRvU3RyaW5nKCkge1xuXHRcdFx0aWYgKHRoaXMudmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHRoaXMubmFtZTtcblx0XHRcdHJldHVybiBgJHt0aGlzLm5hbWV9PXske3RoaXMudmFsdWV9fWA7XG5cdFx0fVxuXHR9LFxuXG5cblx0Ly8gTWF0Y2ggYSBKU1ggZXhwcmVzc2lvbiBlbmNsb3NlZCBpbiBjdXJseSBicmFjZXMsIGVnOiAgYHsgLi4uIH1gLlxuXHQvLyAgSGFuZGxlcyBuZXN0ZWQgY3VybGllcywgcXVvdGVzLCBldGMuXG5cdC8vIFJldHVybnMgYXJyYXkgb2YgdG9rZW5zIG9mIGludGVybmFsIG1hdGNoLlxuXHQvLyBJZ25vcmVzIGxlYWRpbmcgd2hpdGVzcGFjZS5cbi8vVE9ETzogbmV3bGluZXMvaW5kZW50cz8/P1xuLy9UT0RPOiB7Li4ueHh4fVxuLy9URVNUTUVcblx0bWF0Y2hKU1hFeHByZXNzaW9uKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbmV4dFN0YXJ0ID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGxldCBlbmRJbmRleCA9IHRoaXMuZmluZE1hdGNoaW5nQXRIZWFkKFwie1wiLCBcIn1cIiwgdGV4dCwgbmV4dFN0YXJ0LCBlbmQpO1xuXHRcdGlmIChlbmRJbmRleCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gR2V0IGNvbnRlbnRzLCBpbmNsdWRpbmcgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZS5cblx0XHRsZXQgY29udGVudHMgPSB0ZXh0LnNsaWNlKHN0YXJ0ICsgMSwgZW5kSW5kZXgpO1xuXG5cdFx0Ly8gcmV0dXJuIGEgbmV3IEpTWEV4cHJlc3Npb24sIGFkdmFuY2luZyBiZXlvbmQgdGhlIGVuZGluZyBgfWAuXG5cdFx0bGV0IGV4cHJlc3Npb24gPSBuZXcgVG9rZW5pemVyLkpTWEV4cHJlc3Npb24oY29udGVudHMpO1xuXHRcdHJldHVybiBbZXhwcmVzc2lvbiwgZW5kSW5kZXggKyAxXTtcblx0fSxcblxuXHQvLyBKU1ggZXhwcmVzc2lvbiwgY29tcG9zZWQgb2YgaW5saW5lIHRva2VucyB3aGljaCBzaG91bGQgeWllbGQgYW4gYGV4cHJlc3Npb25gLlxuXHRKU1hFeHByZXNzaW9uIDogY2xhc3MganN4RXhwcmVzc2lvbiB7XG5cdFx0Y29uc3RydWN0b3IoY29udGVudHMpIHtcblx0XHRcdHRoaXMuY29udGVudHMgPSBjb250ZW50cyB8fCBcIlwiO1xuXHRcdH1cblx0XHQvLyBEaXZpZGUgY29udGVudHMgaW50byBgdG9rZW5zYC5cblx0XHRnZXQgdG9rZW5zKCkge1xuXHRcdFx0cmV0dXJuIFRva2VuaXplci50b2tlbml6ZSh0aGlzLmNvbnRlbnRzLnRyaW0oKSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8vIE1hdGNoIEpTWFRleHQgdW50aWwgdGhlIG9uZSBvZiBge2AsIGA8YCwgYD5gIG9yIGB9YC5cblx0Ly8gTk9URTogSU5DTFVERVMgbGVhZGluZyAvIHRyYWlsaW5nIHdoaXRlc3BhY2UuXG5cdEpTWF9URVhUX0VORF9DSEFSUyA6IFtcIntcIiwgXCI8XCIsIFwiPlwiLCBcIn1cIl0sXG4vL1RFU1RNRVxuXHRtYXRjaEpTWFRleHQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIHRlbXBvcmFyaWx5IGFkdmFuY2UgcGFzdCB3aGl0ZXNwYWNlICh3ZSdsbCBpbmNsdWRlIGl0IGluIHRoZSBvdXRwdXQpLlxuXHRcdGxldCBuZXh0U3RhcnQgPSB0aGlzLmVhdFdoaXRlc3BhY2UodGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0bGV0IGVuZEluZGV4ID0gdGhpcy5maW5kRmlyc3RBdEhlYWQodGhpcy5KU1hfVEVYVF9FTkRfQ0hBUlMsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHQvLyBJZiB0aGUgZmlyc3Qgbm9uLXdoaXRlc3BhY2UgY2hhciBpcyBpbiBvdXIgRU5EX0NIQVJTLCBmb3JnZXQgaXQuXG5cdFx0aWYgKGVuZEluZGV4ID09PSBuZXh0U3RhcnQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBpZiBubyBtYXRjaCwgd2UndmUgZ290IHNvbWUgc29ydCBvZiBlcnJvclxuXHRcdGlmIChlbmRJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZiAoVG9rZW5pemVyLldBUk4pIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKFwibWF0Y2hKU1hUZXh0KFwiK3RleHQuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgNTApK1wiKTogSlNYIHNlZW1zIHRvIGJlIHVuYmFsYW5jZWQuXCIpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHQvLyBpbmNsdWRlIGxlYWRpbmcgd2hpdGVzcGFjZSBpbiB0aGUgb3V0cHV0LlxuXHRcdGxldCBqc3hUZXh0ID0gdGV4dC5zbGljZShzdGFydCwgZW5kSW5kZXgpO1xuXHRcdHJldHVybiBbanN4VGV4dCwgZW5kSW5kZXhdO1xuXHR9LFxuXG5cblxuXG5cdC8vXG5cdC8vXHQjIyBVdGlsaXR5IGZ1bmN0aW9uc1xuXHQvL1xuXG5cdC8vIFJldHVybiBjaGFyYWN0ZXJzIHVwIHRvLCBidXQgbm90IGluY2x1ZGluZywgdGhlIG5leHQgbmV3bGluZSBjaGFyIGFmdGVyIGBzdGFydGAuXG5cdC8vIElmIGBzdGFydGAgaXMgYSBuZXdsaW5lIGNoYXIgb3Igc3RhcnQgPj0gZW5kLCByZXR1cm5zIGVtcHR5IHN0cmluZy5cblx0Ly8gSWYgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nIChlZzogbm8gbW9yZSBuZXdsaW5lcyksIHJldHVybnMgZnJvbSBzdGFydCB0byBlbmQuXG4vL1RFU1RNRVxuXHRnZXRMaW5lQXRIZWFkKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiBcIlwiO1xuXG5cdFx0bGV0IG5ld2xpbmUgPSB0ZXh0LmluZGV4T2YoXCJcXG5cIiwgc3RhcnQpO1xuXHRcdGlmIChuZXdsaW5lID09PSAtMSB8fCBuZXdsaW5lID4gZW5kKSBuZXdsaW5lID0gZW5kO1xuXHRcdHJldHVybiB0ZXh0LnNsaWNlKHN0YXJ0LCBuZXdsaW5lKTtcblx0fSxcblxuXHQvLyBNYXRjaCBhIG11bHRpLWNoYXIgc3RyaW5nIHN0YXJ0aW5nIGF0IGB0ZXh0W3N0YXJ0XWAuXG4vL1RFU1RNRVxuXHRtYXRjaFN0cmluZ0F0SGVhZChzdHJpbmcsIHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgc3RyaW5nRW5kID0gc3RhcnQgKyBzdHJpbmcubGVuZ3RoO1xuXHRcdGlmIChzdHJpbmdFbmQgPiBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHN0cmluZyA9PT0gdGV4dC5zbGljZShzdGFydCwgc3RyaW5nRW5kKTtcblx0fSxcblxuXG5cdC8vIE1hdGNoIGEgcmVndWxhciBleHByZXNzaW9uIHN0YXJ0aW5nIGF0IGB0ZXh0W3N0YXJ0XWAsIHJldHVybmluZyB0aGUgbWF0Y2guXG5cdC8vIFJldHVybnMgYG51bGxgIGlmIG5vIG1hdGNoLlxuXHQvL1xuXHQvLyBOT1RFOiBUaGUgZXhwcmVzc2lvbiBNVVNUIHN0YXJ0IHdpdGggYC9eLi4uL2Bcbi8vVEVTVE1FXG5cdG1hdGNoRXhwcmVzc2lvbkF0SGVhZChleHByZXNzaW9uLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IGhlYWQgPSB0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpO1xuXHRcdHJldHVybiBoZWFkLm1hdGNoKGV4cHJlc3Npb24pO1xuXHR9LFxuXG5cdC8vIEZpbmQgaW5kZXggb2YgdGhlIG1hdGNoaW5nIFNJTkdMRSBDSEFSQUNURVIgYGVuZERlbGltaXRlcmAgdG8gbWF0Y2ggYHN0YXJ0RGVsaW1pdGVyYC5cblx0Ly8gTWF0Y2hlcyBuZXN0ZWQgZGVsaW1pdGVycyBhbmQgaGFuZGxlcyBlc2NhcGVkIGRlbGltaXRlcnMuXG5cdC8vIEFzc3VtZXMgYHRleHRbc3RhcnRdYCBpcyB0aGUgc3RhcnREZWxpbWl0ZXIhXG5cdC8vIFJldHVybnMgbnVtZXJpYyBpbmRleCBvciBgdW5kZWZpbmVkYCBpZiBubyBtYXRjaCBvciBpZiBmaXJzdCBjaGFyIGlzIG5vdCBgc3RhcnREZWxpbWl0ZXJgLlxuXHQvL1xuXHQvL1x0QWxzbyBoYW5kbGVzIG5lc3RlZCBxdW90ZXMgLS0gaWYgd2UgZW5jb3VudGVyIGEgc2luZ2xlIG9yIGRvdWJsZSBxdW90ZSxcblx0Ly9cdFx0d2UnbGwgc2tpcCBzY2FubmluZyB1bnRpbCB3ZSBmaW5kIGEgbWF0Y2hpbmcgcXVvdGUuXG5cdC8vXG5cdC8vXHRlZzogIGBmaW5kTWF0Y2hpbmdBdEhlYWQoXCJ7XCIsIFwifVwiLCBcInthYXthfWFhfVwiKWAgPT4gOFxuLy9URVNUTUVcblx0ZmluZE1hdGNoaW5nQXRIZWFkKHN0YXJ0RGVsaW1pdGVyLCBlbmREZWxpbWl0ZXIsIHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRpZiAodGV4dFtzdGFydF0gIT09IHN0YXJ0RGVsaW1pdGVyKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG5lc3RpbmcgPSAwO1xuXHRcdGxldCBjdXJyZW50ID0gc3RhcnQ7XG5cdFx0d2hpbGUgKGN1cnJlbnQgPCBlbmQpIHtcblx0XHRcdGxldCBjaGFyID0gdGV4dFtjdXJyZW50XTtcblx0XHRcdC8vIGlmIHN0YXJ0RGVsaW1pdGVyLCBpbmNyZWFzZSBuZXN0aW5nXG5cdFx0XHRpZiAoY2hhciA9PT0gc3RhcnREZWxpbWl0ZXIpIHtcblx0XHRcdFx0bmVzdGluZysrO1xuXHRcdFx0fVxuXHRcdFx0Ly8gaWYgZW5kRGVsaW1pdGVyLCBkZWNyZWFzZSBuZXN0aW5nIGFuZCByZXR1cm4gaWYgbmVzdGluZyBiYWNrIHRvIDBcblx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IGVuZERlbGltaXRlcikge1xuXHRcdFx0XHRuZXN0aW5nLS07XG5cdFx0XHRcdGlmIChuZXN0aW5nID09PSAwKSByZXR1cm4gY3VycmVudDtcblx0XHRcdH1cblx0XHRcdC8vIGlmIGEgc2luZ2xlIG9yIGRvdWJsZSBxdW90ZSwgc2tpcCB1bnRpbCB0aGUgbWF0Y2hpbmcgcXVvdGVcblx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFwiJ1wiIHx8IGNoYXIgPT09ICdcIicpIHtcblx0XHRcdFx0bGV0IFt0b2tlbiwgYWZ0ZXJRdW90ZV0gPSB0aGlzLm1hdGNoVGV4dCh0ZXh0LCBjdXJyZW50LCBlbmQpIHx8IFtdO1xuXHRcdFx0XHRjdXJyZW50ID0gYWZ0ZXJRdW90ZTtcblx0XHRcdFx0Y29udGludWU7XHQvLyBjb250aW51ZSBzbyB3ZSBkb24ndCBhZGQgMSB0byBjdXJlbnQgYmVsb3dcblx0XHRcdH1cblx0XHRcdC8vIElmIGJhY2tzbGFzaCwgc2tpcCBhbiBleHRyYSBjaGFyIGlmIGl0J3MgZWl0aGVyIGRlbGltaXRlciBvciBhIHF1b3RlXG5cdFx0XHRlbHNlIGlmIChjaGFyID09PSBcIlxcXFxcIikge1xuXHRcdFx0XHRjaGFyID0gdGV4dFtjdXJyZW50ICsgMV07XG5cdFx0XHRcdGlmIChjaGFyID09PSBzdGFydERlbGltaXRlclxuXHRcdFx0XHQgfHwgY2hhciA9PT0gZW5kRGVsaW1pdGVyXG5cdFx0XHRcdCB8fCBjaGFyID09PSBcIidcIlxuXHRcdFx0XHQgfHwgY2hhciA9PT0gJ1wiJ1xuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRjdXJyZW50Kys7O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjdXJyZW50Kys7XG5cdFx0fVxuXHR9LFxuXG5cblx0Ly8gUmV0dXJuIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgTk9OLUVTQ0FQRUQgY2hhcmFjdGVyIGluIGBjaGFyc2AgYWZ0ZXIgYHRleHRbc3RhcnRdYC5cblx0Ly8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiB3ZSBkaWRuJ3QgZmluZCBhIG1hdGNoLlxuLy9URVNUTUVcblx0ZmluZEZpcnN0QXRIZWFkKGNoYXJzLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0d2hpbGUgKHN0YXJ0IDwgZW5kKSB7XG5cdFx0XHRsZXQgY2hhciA9IHRleHRbc3RhcnRdO1xuXHRcdFx0aWYgKGNoYXJzLmluY2x1ZGVzKGNoYXIpKSByZXR1cm4gc3RhcnQ7XG5cdFx0XHQvLyBpZiB3ZSBnb3QgYW4gZXNjYXBlIGNoYXIsIGlnbm9yZSB0aGUgbmV4dCBjaGFyIGlmIGl0J3MgaW4gYGNoYXJzYFxuXHRcdFx0aWYgKGNoYXIgPT09IFwiXFxcXFwiICYmIGNoYXJzLmluY2x1ZGVzKHRleHRbc3RhcnQrMV0pKSBzdGFydCsrO1xuXHRcdFx0c3RhcnQrKztcblx0XHR9XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gc3RhcnQ7XG5cdH0sXG5cblxuLy9cbi8vICMjIyBVdGlsaXR5XG4vL1xuXG5cdC8vIEdpdmVuIGEgc2V0IG9mIHRva2Vucywgc2xpY2Ugd2hpdGVzcGFjZSAoaW5kZW50LCBORVdMSU5FIG9yIG5vcm1hbCB3aGl0ZXNwYWNlKSBmcm9tIHRoZSBmcm9udC5cblx0cmVtb3ZlTGVhZGluZ1doaXRlc3BhY2UodG9rZW5zLCBzdGFydCA9IDApIHtcblx0XHR3aGlsZSAodG9rZW5zW3N0YXJ0XSBpbnN0YW5jZW9mIFRva2VuaXplci5XaGl0ZXNwYWNlKSBzdGFydCsrO1xuXHRcdGlmIChzdGFydCA9PT0gMCkgcmV0dXJuIHRva2Vucztcblx0XHRyZXR1cm4gdG9rZW5zLnNsaWNlKHN0YXJ0KTtcblx0fSxcblxuXHQvLyBHaXZlbiBhIHNldCBvZiB0b2tlbnMsIHJlbW92ZSBBTEwgXCJub3JtYWxcIiB3aGl0ZXNwYWNlIHRva2VucyAoTk9UIGluZGVudCBvciBORVdMSU5FKS5cblx0cmVtb3ZlTm9ybWFsV2hpdGVzcGFjZSh0b2tlbnMpIHtcblx0XHRyZXR1cm4gdG9rZW5zLmZpbHRlcih0b2tlbiA9PiAhVG9rZW5pemVyLmlzTm9ybWFsV2hpdGVzcGFjZSh0b2tlbikpO1xuXHR9LFxuXG5cblx0Ly8gUmV0dXJuIGB0cnVlYCBpZiBgdG9rZW5gIGlzIFwibm9ybWFsXCIgd2hpdGVzcGNlIChub3QgYSBuZXdsaW5lIG9yIGluZGVudClcblx0aXNOb3JtYWxXaGl0ZXNwYWNlKHRva2VuKSB7XG5cdFx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLldoaXRlc3BhY2Vcblx0XHRcdCYmICEodG9rZW4gaW5zdGFuY2VvZiBUb2tlbml6ZXIuSW5kZW50KVxuXHRcdFx0JiYgKHRva2VuICE9PSBUb2tlbml6ZXIuTkVXTElORSk7XG5cdH0sXG5cblxuLy9cbi8vICMjIyBCbG9jayAvIGluZGVudCBwcm9jZXNzaW5nXG4vL1xuXG5cdC8vIFNpbXBsZSBibG9jayBjbGFzcyBmb3IgYGJyZWFrSW50b0Jsb2Nrc2AuXG5cdEJsb2NrOiBjbGFzcyBibG9jayB7XG5cdFx0Y29uc3RydWN0b3IocHJvcHMpe1xuXHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBwcm9wcyk7XG5cdFx0XHRpZiAoIXRoaXMuY29udGVudHMpIHRoaXMuY29udGVudHMgPSBbXTtcblx0XHR9XG5cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLCBudWxsLCBcIlxcdFwiKTtcblx0XHR9XG5cdH0sXG5cblx0Ly8gQnJlYWsgdG9rZW5zIGludG8gYW4gYXJyYXkgb2YgYXJyYXlzIGJ5IGBORVdMSU5FYHMuXG5cdC8vIFJldHVybnMgYW4gYXJyYXkgb2YgbGluZXMgV0lUSE9VVCB0aGUgYE5FV0xJTkVgcy5cblx0Ly8gTGluZXMgd2hpY2ggYXJlIGNvbXBvc2VkIHNvbGVseSBvZiB3aGl0ZXNwYWNlIGFyZSB0cmVhdGVkIGFzIGJsYW5rLlxuXHRicmVha0ludG9MaW5lcyh0b2tlbnMpIHtcblx0XHQvLyBDb252ZXJ0IHRvIGxpbmVzLlxuXHRcdGxldCBjdXJyZW50TGluZSA9IFtdO1xuXHRcdGxldCBsaW5lcyA9IFtjdXJyZW50TGluZV07XG5cdFx0dG9rZW5zLmZvckVhY2godG9rZW4gPT4ge1xuXHRcdFx0Ly8gYWRkIG5ldyBhcnJheSBmb3IgZWFjaCBuZXdsaW5lXG5cdFx0XHRpZiAodG9rZW4gPT09IFRva2VuaXplci5ORVdMSU5FKSB7XG5cdFx0XHRcdC8vIGNyZWF0ZSBhIG5ldyBsaW5lIGFuZCBwdXNoIGl0IGluXG5cdFx0XHRcdGN1cnJlbnRMaW5lID0gW107XG5cdFx0XHRcdHJldHVybiBsaW5lcy5wdXNoKGN1cnJlbnRMaW5lKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gb3RoZXJ3aXNlIGp1c3QgYWRkIHRvIHRoZSBjdXJyZW50IGxpbmVcblx0XHRcdGN1cnJlbnRMaW5lLnB1c2godG9rZW4pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQ2xlYXIgYW55IGxpbmVzIHRoYXQgYXJlIG9ubHkgd2hpdGVzcGFjZVxuXHRcdGxpbmVzLmZvckVhY2goKGxpbmUsIGluZGV4KSA9PiB7XG5cdFx0XHRpZiAobGluZS5sZW5ndGggPT09IDEgJiYgbGluZVswXSBpbnN0YW5jZW9mIFRva2VuaXplci5XaGl0ZXNwYWNlKSBsaW5lc1tpbmRleF0gPSBbXTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBsaW5lcztcblx0fSxcblxuXHQvLyBSZXR1cm4gaW5kZW50cyBvZiB0aGUgc3BlY2lmaWVkIGxpbmVzLlxuXHQvLyBJbmRlbnRzIGVtcHR5IGxpbmVzIChORVdMSU5FcykgaW50byB0aGUgYmxvY2sgQUZURVIgdGhleSBhcHBlYXIuXG5cdGdldExpbmVJbmRlbnRzKGxpbmVzLCBkZWZhdWx0SW5kZW50ID0gMCkge1xuXHRcdGlmIChsaW5lcy5sZW5ndGggPT09IDApIHJldHVybiBbXTtcblxuXHRcdGNvbnN0IGluZGVudHMgPSBsaW5lcy5tYXAoVG9rZW5pemVyLmdldExpbmVJbmRlbnQpO1xuXHRcdGNvbnN0IGVuZCA9IGluZGVudHMubGVuZ3RoO1xuXG5cdFx0Ly8gZmlndXJlIG91dCB0aGUgaW5kZW50IG9mIHRoZSBmaXJzdCBub24tZW1wdHkgbGluZVxuXHRcdGxldCBzdGFydEluZGVudCA9IGdldE5leHRJbmRlbnQoMCk7XG5cdFx0aWYgKHN0YXJ0SW5kZW50ID09PSB1bmRlZmluZWQpIHN0YXJ0SW5kZW50ID0gZGVmYXVsdEluZGVudDtcblxuXHRcdC8vIGluZGVudCBibGFuayBsaW5lcyB0byB0aGUgaW5kZW50IEFGVEVSIHRoZW1cblx0XHRmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgZW5kOyBpbmRleCsrKSB7XG5cdFx0XHRpZiAoaW5kZW50c1tpbmRleF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpbmRlbnRzW2luZGV4XSA9IGdldE5leHRJbmRlbnQoaW5kZXggKyAxKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGluZGVudHM7XG5cblx0XHQvLyBSZXR1cm4gdGhlIHZhbHVlIG9mIHRoZSBORVhUIG5vbi11bmRlZmluZWQgaW5kZW50LlxuXHRcdGZ1bmN0aW9uIGdldE5leHRJbmRlbnQoaW5kZXgpIHtcblx0XHRcdHdoaWxlIChpbmRleCA8IGVuZCkge1xuXHRcdFx0XHRpZiAoaW5kZW50c1tpbmRleF0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIGluZGVudHNbaW5kZXhdO1xuXHRcdFx0XHRpbmRleCsrO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHN0YXJ0SW5kZW50O1xuXHRcdH1cblx0fSxcblxuXG5cdC8vIFJldHVybiB0aGUgaW5kZW50IG9mIGEgbGluZSBvZiB0b2tlbnMuXG5cdC8vIFJldHVybnMgYDBgIGlmIG5vdCBpbmRlbnRlZC5cblx0Ly8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBhIGJsYW5rIGxpbmUuXG5cdGdldExpbmVJbmRlbnQobGluZSkge1xuXHRcdGlmICghbGluZSB8fCBsaW5lLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRpZiAobGluZVswXSBpbnN0YW5jZW9mIFRva2VuaXplci5JbmRlbnQpIHJldHVybiBsaW5lWzBdLmxlbmd0aDtcblx0XHRyZXR1cm4gMDtcblx0fSxcblxuXHQvLyBCcmVhayBgdG9rZW5zYCBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgIGludG8gYSBgVG9rZW5pemVyLkJsb2NrYCB3aXRoIG5lc3RlZCBgY29udGVudHNgLlxuXHQvLyBTa2lwcyBcIm5vcm1hbFwiIHdoaXRlc3BhY2UgYW5kIGluZGVudHMgaW4gdGhlIHJlc3VsdHMuXG5cdGJyZWFrSW50b0Jsb2NrczogZnVuY3Rpb24odG9rZW5zLCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGgpIHtcblx0XHQvLyByZXN0cmljdCB0byB0b2tlbnMgb2YgaW50ZXJlc3Rcblx0XHR0b2tlbnMgPSB0b2tlbnMuc2xpY2Uoc3RhcnQsIGVuZCk7XG5cdFx0Ly8gcmVtb3ZlIFwibm9ybWFsXCIgd2hpdGVzcGFjZVxuLy9UT0RPOiBiZXR0ZXIgdG8gbGVhdmUgdGhpcyB0byBjb25zdW1lcnM/Pz9cblx0XHR0b2tlbnMgPSBUb2tlbml6ZXIucmVtb3ZlTm9ybWFsV2hpdGVzcGFjZSh0b2tlbnMpO1xuXG5cdFx0Ly8gYnJlYWsgaW50byBsaW5lcyAmIHJldHVybiBlYXJseSBpZiBubyBsaW5lc1xuXHRcdGxldCBsaW5lcyA9IFRva2VuaXplci5icmVha0ludG9MaW5lcyh0b2tlbnMpO1xuXHRcdGlmIChsaW5lcy5sZW5ndGggPT09IDApIHJldHVybiBbXTtcblxuXHRcdC8vIGZpZ3VyZSBvdXQgaW5kZW50c1xuXHRcdGxldCBpbmRlbnRzID0gVG9rZW5pemVyLmdldExpbmVJbmRlbnRzKGxpbmVzKTtcblxuXHRcdC8vIEZpcnN0IGJsb2NrIGlzIGF0IHRoZSBNSU5JTVVNIGluZGVudCBvZiBhbGwgbGluZXMhXG5cdFx0bGV0IG1heEluZGVudCA9IE1hdGgubWluLmFwcGx5KE1hdGgsIGluZGVudHMpO1xuXHRcdGxldCBibG9jayA9IG5ldyBUb2tlbml6ZXIuQmxvY2soeyBpbmRlbnQ6IG1heEluZGVudCB9KTtcblxuXHRcdC8vIHN0YWNrIG9mIGJsb2Nrc1xuXHRcdGxldCBzdGFjayA9IFtibG9ja107XG5cblx0XHRsaW5lcy5mb3JFYWNoKCAobGluZSwgaW5kZXgpID0+IHtcblx0XHRcdC8vIFJlbW92ZSBsZWFkaW5nIHdoaXRlc3BhY2UgKGVnOiBpbmRlbnRzKVxuXHRcdFx0bGluZSA9IFRva2VuaXplci5yZW1vdmVMZWFkaW5nV2hpdGVzcGFjZShsaW5lKTtcblxuXHRcdFx0bGV0IGxpbmVJbmRlbnQgPSBpbmRlbnRzW2luZGV4XTtcblx0XHRcdGxldCB0b3AgPSBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcblx0XHRcdC8vIElmIGluZGVudGluZywgcHVzaCBuZXcgYmxvY2socylcblx0XHRcdGlmIChsaW5lSW5kZW50ID4gdG9wLmluZGVudCkge1xuXHRcdFx0XHR3aGlsZSAobGluZUluZGVudCA+IHRvcC5pbmRlbnQpIHtcblx0XHRcdFx0XHR2YXIgbmV3QmxvY2sgPSBuZXcgVG9rZW5pemVyLkJsb2NrKHsgaW5kZW50OiB0b3AuaW5kZW50ICsgMSB9KTtcblx0XHRcdFx0XHR0b3AuY29udGVudHMucHVzaChuZXdCbG9jayk7XG5cdFx0XHRcdFx0c3RhY2sucHVzaChuZXdCbG9jayk7XG5cblx0XHRcdFx0XHR0b3AgPSBuZXdCbG9jaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gSWYgb3V0ZGVudGluZzogcG9wIGJsb2NrKHMpXG5cdFx0XHRlbHNlIGlmIChsaW5lSW5kZW50IDwgdG9wLmluZGVudCkge1xuXHRcdFx0XHR3aGlsZSAobGluZUluZGVudCA8IHRvcC5pbmRlbnQpIHtcblx0XHRcdFx0XHRzdGFjay5wb3AoKTtcblx0XHRcdFx0XHR0b3AgPSBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gYWRkIHRvIHRvcCBibG9ja1xuXHRcdFx0dG9wLmNvbnRlbnRzLnB1c2gobGluZSk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gYmxvY2s7XG5cdH0sXG5cblxuXG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFRva2VuaXplcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9Ub2tlbml6ZXIuanMiLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0geyB2ZXJzaW9uOiAnMi41LjcnIH07XG5pZiAodHlwZW9mIF9fZSA9PSAnbnVtYmVyJykgX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fY29yZS5qc1xuLy8gbW9kdWxlIGlkID0gOTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19pcy1vYmplY3QuanNcbi8vIG1vZHVsZSBpZCA9IDkyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuL19pb2JqZWN0Jyk7XG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBJT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL190by1pb2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSA5M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaWQgPSAwO1xudmFyIHB4ID0gTWF0aC5yYW5kb20oKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gJ1N5bWJvbCgnLmNvbmNhdChrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5LCAnKV8nLCAoKytpZCArIHB4KS50b1N0cmluZygzNikpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3VpZC5qc1xuLy8gbW9kdWxlIGlkID0gOTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG4vKipcbiAqIFdoZW4gc291cmNlIG1hcHMgYXJlIGVuYWJsZWQsIGBzdHlsZS1sb2FkZXJgIHVzZXMgYSBsaW5rIGVsZW1lbnQgd2l0aCBhIGRhdGEtdXJpIHRvXG4gKiBlbWJlZCB0aGUgY3NzIG9uIHRoZSBwYWdlLiBUaGlzIGJyZWFrcyBhbGwgcmVsYXRpdmUgdXJscyBiZWNhdXNlIG5vdyB0aGV5IGFyZSByZWxhdGl2ZSB0byBhXG4gKiBidW5kbGUgaW5zdGVhZCBvZiB0aGUgY3VycmVudCBwYWdlLlxuICpcbiAqIE9uZSBzb2x1dGlvbiBpcyB0byBvbmx5IHVzZSBmdWxsIHVybHMsIGJ1dCB0aGF0IG1heSBiZSBpbXBvc3NpYmxlLlxuICpcbiAqIEluc3RlYWQsIHRoaXMgZnVuY3Rpb24gXCJmaXhlc1wiIHRoZSByZWxhdGl2ZSB1cmxzIHRvIGJlIGFic29sdXRlIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBwYWdlIGxvY2F0aW9uLlxuICpcbiAqIEEgcnVkaW1lbnRhcnkgdGVzdCBzdWl0ZSBpcyBsb2NhdGVkIGF0IGB0ZXN0L2ZpeFVybHMuanNgIGFuZCBjYW4gYmUgcnVuIHZpYSB0aGUgYG5wbSB0ZXN0YCBjb21tYW5kLlxuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3MpIHtcbiAgLy8gZ2V0IGN1cnJlbnQgbG9jYXRpb25cbiAgdmFyIGxvY2F0aW9uID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cubG9jYXRpb247XG5cbiAgaWYgKCFsb2NhdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcImZpeFVybHMgcmVxdWlyZXMgd2luZG93LmxvY2F0aW9uXCIpO1xuICB9XG5cblx0Ly8gYmxhbmsgb3IgbnVsbD9cblx0aWYgKCFjc3MgfHwgdHlwZW9mIGNzcyAhPT0gXCJzdHJpbmdcIikge1xuXHQgIHJldHVybiBjc3M7XG4gIH1cblxuICB2YXIgYmFzZVVybCA9IGxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgbG9jYXRpb24uaG9zdDtcbiAgdmFyIGN1cnJlbnREaXIgPSBiYXNlVXJsICsgbG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvW15cXC9dKiQvLCBcIi9cIik7XG5cblx0Ly8gY29udmVydCBlYWNoIHVybCguLi4pXG5cdC8qXG5cdFRoaXMgcmVndWxhciBleHByZXNzaW9uIGlzIGp1c3QgYSB3YXkgdG8gcmVjdXJzaXZlbHkgbWF0Y2ggYnJhY2tldHMgd2l0aGluXG5cdGEgc3RyaW5nLlxuXG5cdCAvdXJsXFxzKlxcKCAgPSBNYXRjaCBvbiB0aGUgd29yZCBcInVybFwiIHdpdGggYW55IHdoaXRlc3BhY2UgYWZ0ZXIgaXQgYW5kIHRoZW4gYSBwYXJlbnNcblx0ICAgKCAgPSBTdGFydCBhIGNhcHR1cmluZyBncm91cFxuXHQgICAgICg/OiAgPSBTdGFydCBhIG5vbi1jYXB0dXJpbmcgZ3JvdXBcblx0ICAgICAgICAgW14pKF0gID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgIHwgID0gT1Jcblx0ICAgICAgICAgXFwoICA9IE1hdGNoIGEgc3RhcnQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICg/OiAgPSBTdGFydCBhbm90aGVyIG5vbi1jYXB0dXJpbmcgZ3JvdXBzXG5cdCAgICAgICAgICAgICAgICAgW14pKF0rICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgIHwgID0gT1Jcblx0ICAgICAgICAgICAgICAgICBcXCggID0gTWF0Y2ggYSBzdGFydCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgICAgICBbXikoXSogID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgXFwpICA9IE1hdGNoIGEgZW5kIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICApICA9IEVuZCBHcm91cFxuICAgICAgICAgICAgICAqXFwpID0gTWF0Y2ggYW55dGhpbmcgYW5kIHRoZW4gYSBjbG9zZSBwYXJlbnNcbiAgICAgICAgICApICA9IENsb3NlIG5vbi1jYXB0dXJpbmcgZ3JvdXBcbiAgICAgICAgICAqICA9IE1hdGNoIGFueXRoaW5nXG4gICAgICAgKSAgPSBDbG9zZSBjYXB0dXJpbmcgZ3JvdXBcblx0IFxcKSAgPSBNYXRjaCBhIGNsb3NlIHBhcmVuc1xuXG5cdCAvZ2kgID0gR2V0IGFsbCBtYXRjaGVzLCBub3QgdGhlIGZpcnN0LiAgQmUgY2FzZSBpbnNlbnNpdGl2ZS5cblx0ICovXG5cdHZhciBmaXhlZENzcyA9IGNzcy5yZXBsYWNlKC91cmxcXHMqXFwoKCg/OlteKShdfFxcKCg/OlteKShdK3xcXChbXikoXSpcXCkpKlxcKSkqKVxcKS9naSwgZnVuY3Rpb24oZnVsbE1hdGNoLCBvcmlnVXJsKSB7XG5cdFx0Ly8gc3RyaXAgcXVvdGVzIChpZiB0aGV5IGV4aXN0KVxuXHRcdHZhciB1bnF1b3RlZE9yaWdVcmwgPSBvcmlnVXJsXG5cdFx0XHQudHJpbSgpXG5cdFx0XHQucmVwbGFjZSgvXlwiKC4qKVwiJC8sIGZ1bmN0aW9uKG8sICQxKXsgcmV0dXJuICQxOyB9KVxuXHRcdFx0LnJlcGxhY2UoL14nKC4qKSckLywgZnVuY3Rpb24obywgJDEpeyByZXR1cm4gJDE7IH0pO1xuXG5cdFx0Ly8gYWxyZWFkeSBhIGZ1bGwgdXJsPyBubyBjaGFuZ2Vcblx0XHRpZiAoL14oI3xkYXRhOnxodHRwOlxcL1xcL3xodHRwczpcXC9cXC98ZmlsZTpcXC9cXC9cXC8pL2kudGVzdCh1bnF1b3RlZE9yaWdVcmwpKSB7XG5cdFx0ICByZXR1cm4gZnVsbE1hdGNoO1xuXHRcdH1cblxuXHRcdC8vIGNvbnZlcnQgdGhlIHVybCB0byBhIGZ1bGwgdXJsXG5cdFx0dmFyIG5ld1VybDtcblxuXHRcdGlmICh1bnF1b3RlZE9yaWdVcmwuaW5kZXhPZihcIi8vXCIpID09PSAwKSB7XG5cdFx0ICBcdC8vVE9ETzogc2hvdWxkIHdlIGFkZCBwcm90b2NvbD9cblx0XHRcdG5ld1VybCA9IHVucXVvdGVkT3JpZ1VybDtcblx0XHR9IGVsc2UgaWYgKHVucXVvdGVkT3JpZ1VybC5pbmRleE9mKFwiL1wiKSA9PT0gMCkge1xuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgcmVsYXRpdmUgdG8gdGhlIGJhc2UgdXJsXG5cdFx0XHRuZXdVcmwgPSBiYXNlVXJsICsgdW5xdW90ZWRPcmlnVXJsOyAvLyBhbHJlYWR5IHN0YXJ0cyB3aXRoICcvJ1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSByZWxhdGl2ZSB0byBjdXJyZW50IGRpcmVjdG9yeVxuXHRcdFx0bmV3VXJsID0gY3VycmVudERpciArIHVucXVvdGVkT3JpZ1VybC5yZXBsYWNlKC9eXFwuXFwvLywgXCJcIik7IC8vIFN0cmlwIGxlYWRpbmcgJy4vJ1xuXHRcdH1cblxuXHRcdC8vIHNlbmQgYmFjayB0aGUgZml4ZWQgdXJsKC4uLilcblx0XHRyZXR1cm4gXCJ1cmwoXCIgKyBKU09OLnN0cmluZ2lmeShuZXdVcmwpICsgXCIpXCI7XG5cdH0pO1xuXG5cdC8vIHNlbmQgYmFjayB0aGUgZml4ZWQgY3NzXG5cdHJldHVybiBmaXhlZENzcztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vc3R5bGUtbG9hZGVyL2ZpeFVybHMuanNcbi8vIG1vZHVsZSBpZCA9IDk0M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vU3BhY2VyLmxlc3NcIik7XG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbi8vIFByZXBhcmUgY3NzVHJhbnNmb3JtYXRpb25cbnZhciB0cmFuc2Zvcm07XG5cbnZhciBvcHRpb25zID0ge31cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gSG90IE1vZHVsZSBSZXBsYWNlbWVudFxuaWYobW9kdWxlLmhvdCkge1xuXHQvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuXHRpZighY29udGVudC5sb2NhbHMpIHtcblx0XHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vU3BhY2VyLmxlc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL1NwYWNlci5sZXNzXCIpO1xuXHRcdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cdFx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9hcHAvU3BhY2VyLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDk0NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGVzLmxlc3NcIik7XG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbi8vIFByZXBhcmUgY3NzVHJhbnNmb3JtYXRpb25cbnZhciB0cmFuc2Zvcm07XG5cbnZhciBvcHRpb25zID0ge31cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gSG90IE1vZHVsZSBSZXBsYWNlbWVudFxuaWYobW9kdWxlLmhvdCkge1xuXHQvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuXHRpZighY29udGVudC5sb2NhbHMpIHtcblx0XHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGVzLmxlc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlcy5sZXNzXCIpO1xuXHRcdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cdFx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9hcHAvc3R5bGVzLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDk0NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvL1xuLy8gICMgQ2xhc3MgdXRpbGl0aWVzXG4vL1xuXG4vLyBDbG9uZSBhIGNsYXNzLCByZS11c2luZyB0aGUgb3JpZ2luYWwgbmFtZS5cbi8vIFRPRE86IG1vdmUgdG8gdXRpbGl0eT9cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZUNsYXNzKGNvbnN0cnVjdG9yLCBuYW1lID0gY29uc3RydWN0b3IubmFtZSkge1xuICAvLyBDbG9uZSB0aGUgY29uc3RydWN0b3IsIGtlZXBpbmcgdGhlIHNhbWUgbmFtZVxuICBnbG9iYWwuX19jbG9uZUNsYXNzX18gPSBjb25zdHJ1Y3RvcjtcbiAgY29uc3QgY2xvbmUgPSBuZXcgRnVuY3Rpb24oXCJuYW1lXCIsIGByZXR1cm4gY2xhc3MgJHtuYW1lfSBleHRlbmRzIF9fY2xvbmVDbGFzc19fIHt9YCkoKTtcbiAgZGVsZXRlIGdsb2JhbC5fX2Nsb25lQ2xhc3NfXztcbiAgcmV0dXJuIGNsb25lO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3V0aWxzL2NsYXNzLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBjcmVhdGluZyB2YXJpYWJsZXMsIHByb3BlcnR5IGFjY2VzcywgZXRjXG4vL1xuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5cbi8vIENyZWF0ZSBcIlVJXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck1vZHVsZShcIlVJXCIpO1xuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG5wYXJzZXIuZGVmaW5lUnVsZXMoXG4gIC8vIEFsZXJ0IGEgbWVzc2FnZS5cbiAge1xuICAgIG5hbWU6IFwiYWxlcnRcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCIsIFwiYXN5bmNcIl0sXG4gICAgc3ludGF4OiBcImFsZXJ0IHttZXNzYWdlOmV4cHJlc3Npb259ICg/OndpdGgge29rQnV0dG9uOnRleHR9KT9cIixcbiAgLy8gVE9ETzogbmVlZCBzb21lIGZhbmN5IHByb21pc2UganVqdSB0byBtYWtlIHBhcmVudCBmdW50aW9uIGFzeW5jP1xuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBhbGVydCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG1lc3NhZ2UsIG9rQnV0dG9uID0gJ1wiT0tcIicgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBhd2FpdCBzcGVsbC5hbGVydCgke21lc3NhZ2V9LCAke29rQnV0dG9ufSlgO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtgYWxlcnQgJ1lvISdgLCBgYXdhaXQgc3BlbGwuYWxlcnQoJ1lvIScsIFwiT0tcIilgXSxcbiAgICAgICAgICBbYGFsZXJ0IFwiWW8hXCJgLCBgYXdhaXQgc3BlbGwuYWxlcnQoXCJZbyFcIiwgXCJPS1wiKWBdLFxuICAgICAgICAgIFtgYWxlcnQgJ1lvIScgd2l0aCAneWVwJ2AsIGBhd2FpdCBzcGVsbC5hbGVydCgnWW8hJywgJ3llcCcpYF0sXG4gICAgICAgICAgW2BhbGVydCBcIllvIVwiIHdpdGggXCJ5ZXBcImAsIGBhd2FpdCBzcGVsbC5hbGVydChcIllvIVwiLCBcInllcFwiKWBdLFxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICB9LFxuXG4gIC8vIFdhcm5pbmcgbWVzc2FnZSAtLSBsaWtlIGFsZXJ0IGJ1dCBmYW5jaWVyLlxuICAvLyBUT0RPOiBuZWVkIHNvbWUgZmFuY3kgcHJvbWlzZSBqdWp1IGhlcmU/XG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcIndhcm5cIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwid2FybiB7bWVzc2FnZTpleHByZXNzaW9ufSAoPzp3aXRoIHtva0J1dHRvbjp0ZXh0fSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHdhcm4gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBtZXNzYWdlLCBva0J1dHRvbiA9ICdcIk9LXCInIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgYXdhaXQgc3BlbGwud2Fybigke21lc3NhZ2V9LCAke29rQnV0dG9ufSlgO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtgd2FybiAnWW8hJ2AsIGBhd2FpdCBzcGVsbC53YXJuKCdZbyEnLCBcIk9LXCIpYF0sXG4gICAgICAgICAgW2B3YXJuICdZbyEnIHdpdGggJ3llcCdgLCBgYXdhaXQgc3BlbGwud2FybignWW8hJywgJ3llcCcpYF0sXG4gICAgICAgICAgW2B3YXJuIFwiWW8hXCJgLCBgYXdhaXQgc3BlbGwud2FybihcIllvIVwiLCBcIk9LXCIpYF0sXG4gICAgICAgICAgW2B3YXJuIFwiWW8hXCIgd2l0aCBcInllcFwiYCwgYGF3YWl0IHNwZWxsLndhcm4oXCJZbyFcIiwgXCJ5ZXBcIilgXSxcbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfSxcblxuXG4gIC8vIENvbmZpcm0gbWVzc2FnZSAtLSBwcmVzZW50IGEgcXVlc3Rpb24gd2l0aCB0d28gYW5zd2Vycy5cbiAgLy8gVE9ETzogbmVlZCBzb21lIGZhbmN5IHByb21pc2UganVqdSBoZXJlP1xuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJjb25maXJtXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcImNvbmZpcm0ge21lc3NhZ2U6ZXhwcmVzc2lvbn0gKD86d2l0aCB7b2tCdXR0b246dGV4dH0gKD86IChhbmR8b3IpIHtjYW5jZWxCdXR0b246dGV4dH0pPyApP1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBjb25maXJtIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbWVzc2FnZSwgb2tCdXR0b24gPSAnXCJPS1wiJywgY2FuY2VsQnV0dG9uID0gJ1wiQ2FuY2VsXCInIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgYXdhaXQgc3BlbGwuY29uZmlybSgke21lc3NhZ2V9LCAke29rQnV0dG9ufSwgJHtjYW5jZWxCdXR0b259KWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW2Bjb25maXJtICdZbyEnYCwgYGF3YWl0IHNwZWxsLmNvbmZpcm0oJ1lvIScsIFwiT0tcIiwgXCJDYW5jZWxcIilgXSxcbiAgICAgICAgICBbYGNvbmZpcm0gJ1lvIScgd2l0aCAneWVwJ2AsIGBhd2FpdCBzcGVsbC5jb25maXJtKCdZbyEnLCAneWVwJywgXCJDYW5jZWxcIilgXSxcbiAgICAgICAgICBbYGNvbmZpcm0gJ1lvIScgd2l0aCAneWVwJyBhbmQgJ25vcGUnYCwgYGF3YWl0IHNwZWxsLmNvbmZpcm0oJ1lvIScsICd5ZXAnLCAnbm9wZScpYF0sXG4gICAgICAgICAgW2Bjb25maXJtICdZbyEnIHdpdGggJ3llcCcgb3IgJ25vcGUnYCwgYGF3YWl0IHNwZWxsLmNvbmZpcm0oJ1lvIScsICd5ZXAnLCAnbm9wZScpYF0sXG4gICAgICAgICAgW2Bjb25maXJtIFwiWW8hXCIgd2l0aCBcInllcFwiIG9yIFwibm9wZVwiYCwgYGF3YWl0IHNwZWxsLmNvbmZpcm0oXCJZbyFcIiwgXCJ5ZXBcIiwgXCJub3BlXCIpYF0sXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICBdXG4gIH1cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvVUkuanMiLCJ2YXIgc3RvcmUgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgnd2tzJyk7XG52YXIgdWlkID0gcmVxdWlyZSgnLi9fdWlkJyk7XG52YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuU3ltYm9sO1xudmFyIFVTRV9TWU1CT0wgPSB0eXBlb2YgU3ltYm9sID09ICdmdW5jdGlvbic7XG5cbnZhciAkZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9XG4gICAgVVNFX1NZTUJPTCAmJiBTeW1ib2xbbmFtZV0gfHwgKFVTRV9TWU1CT0wgPyBTeW1ib2wgOiB1aWQpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07XG5cbiRleHBvcnRzLnN0b3JlID0gc3RvcmU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL193a3MuanNcbi8vIG1vZHVsZSBpZCA9IDk1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=