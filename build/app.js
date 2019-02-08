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

//TODO: `spell.isOfType(thing, type)`
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
    showAll: true,
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
    showAll: true,
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
    title: "Normal objects",
    compileAs: "statement",
    showAll: true,
    tests: [["create Object", "{}"], ["new Object", "{}"], ["new Object with a = 1, b = yes", "{ \"a\": 1, \"b\": true }"], ["new Foo", "new Foo()"], ["new Foo with a = 1, b = yes", "new Foo({ \"a\": 1, \"b\": true })"]]
  }, {
    title: "special types",
    compileAs: "expression",
    showAll: true,
    tests: [["create object", "{}"], ["create list", "new Array()"]]
  }]

}
/*

  // Declare instance method or normal function.
  {
    name: "declare_method",
    alias: ["statement", "mutatesScope"],
    syntax: "(operator:to|on) {name:identifier} {args}? (\\:)? {statement}?",
    constructor: class declare_method extends Rule.BlockStatement {
      // Return a logical representation of the data structure
      toStructure() {
        let { operator, name, args = []} = this.results;
        let subType = (operator === "to" ? "method" : "event");
        return { type: "function", subType, name, args };
      }

      toSource() {
        let { name, args = [], statement, block } = this.results;
        let output = `${name}(${args.join(", ")}) `;
        output += Rule.Block.encloseStatements(statement, block);
        return output;
      }
    }
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
    constructor: class declare_action extends Rule.BlockStatement {
      // Add `name`, `args` and `types` to matched source
      get results() {
        let output = super.results;

        // if there's only one keyword, it can't be a blacklisted identifier or a type
        let { keywords } = output;
        let keywordMatches = this.results.keywords.matched;
        if (keywords.length === 1) {
          let keyword = keywords[0];
          if (keywordMatches[0] instanceof Rule.Type) {
            console.error(`parse('declare_action'): one-word actions may not be types: ${keyword}`);
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
        keywordMatches.map( (item, index) => {
          if (item instanceof Rule.Type) {
            let Type = keywords[index];
            let type = Type.toLowerCase();

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

      toSource() {
        let { name, args = [], types, statement, block } = this.results;

        // figure out if there are any conditions due to known argument types
        let conditions = [];
        for (let arg in types) {
          conditions.push(`\tif (!spell.isA(${arg}, ${types[arg]})) return undefined`);
        }

        let statements = Rule.Block.encloseStatements(conditions, statement, block);

        // Create as a STATIC function
    //TODO: create as an instance function we can call on ourself!
        return `static ${name}(${args.join(", ")}) ${statements}`;
      }

      toStructure() {
        let { name, args, types } = this.results;
        return { type: "function", subType: "action", name, args, types }
      }
    }
  },


  // Getter either with or without arguments.
  // If you specify arguments, yields a normal function which returns a value.
  // TODO: `to get...` ?
  {
    name: "getter",
    alias: ["statement", "mutatesScope"],
    syntax: "get {name:identifier}\\: {expression}?",
    constructor: class getter extends Rule.BlockStatement {
      toSource() {
        let { name, expression, block } = this.results;
        // If they specified an inline-expression, prepend return
        if (expression && !expression.startsWith("return ")) expression = `return (${expression})`;
        let output = `get ${name}() `;
        output += Rule.Block.encloseStatements(expression, block);
        return output;
      }

      // Return a logical representation of the data structure
      toStructure() {
        let { name } = this.results;
        return { type: "property", subType: "getter", name }
      }
    }
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
    constructor: class setter extends Rule.BlockStatement {
      toSource() {
        // default args to the setter name
        let { name, args = [name], statement, block } = this.results;
        // Complain if more than one argument
        if (args && args.length > 1) {
          console.warn("parse('setter'): only one argument allowed in setter:  ", this.matchedText);
          args = [ args[0] ];
        }
        let output = `set ${name}(${args}) `;
        output += Rule.Block.encloseStatements(statement, block);
        return output;
      }

      // Return a logical representation of the data structure
      toStructure() {
        let { name } = this.results;
        return { type: "property", subType: "setter", name }
      }
    }
  },


  //
  //	declare properties
  //

  //TODO: another name for `constant` ?
  {
    name: "declare_property",
    alias: ["statement", "mutatesScope"],
    syntax: "(scope:property|constant|shared property) {name:identifier} (?:= {value:expression})?",
    constructor: class declare_property extends Rule.Sequence {
      toSource() {
        let { scope, name, value = "" } = this.results;
        if (value) value = ` = ${value}`;

        let declaration = `${name}${value}`;
        switch (scope) {
          case "constant":
//            if (!value) console.warn("parse('declare_property'): constant properties must declare a value:  ", this.matchedText);
            return `const ${declaration}`;

          case "shared property":
            return `@proto ${declaration}`;

          case "property":
          default:
            return declaration;
        }
      }

      // Return a logical representation of the data structure
      toStructure() {
        let { scope, name } = this.results;
        return { type: "property", name, scope };
      }
    }
  },

  // TODO: scope_modifier???
  // TODO: initial value
  {
    name: "declare_property_of_type",
    alias: ["statement", "mutatesScope"],
    syntax: "property {name:identifier} as (a|an)? {type}",
    constructor: class declare_property_of_type extends Rule.Sequence {
      toSource() {
        let { name, type } = this.results;
        return `get ${name}() { return this.__${name} }\n`
           + `set ${name}(value) { if (spell.isA(value, ${type}) this.__${name} = value }`;
      }

      // Return a logical representation of the data structure
      toStructure() {
        let { name, type } = this.results;
        return { type: "property", subType: "setter", name, dataType: type };
      }
    }
  },


  // TODO: warn on invalid set?  shared?  undefined? something other than the first value as default?
  {
    name: "declare_property_as_one_of",
    alias: ["statement", "mutatesScope"],
    syntax: "property {name:identifier} as one of {list:literal_list}",
    constructor: class declare_property_as_one_of extends Rule.Sequence {
      get results() {
        let results = super.results;
        results.plural = pluralize(results.name);
        return results;
      }

      toSource() {
        let { name, plural, list } = this.results;
        return `@proto ${plural} = ${list}\n`
           + `get ${name}() { return this.__${name} === undefined ? this.${plural}[0] : this.__${name} }\n`
           + `set ${name}(value) { if (this.${plural}.includes(value)) this.__${name} = value }`;

  // MORE EFFICIENT BUT UGLIER
  // 			return `static ${plural} = ${list};\n`
  // 				 + `get ${name} { return ("__${name}" in this ? this.__${name} : ${firstValue}) }\n`
  // 				 + `set ${name}(value) { if (this.constructor.${plural}.includes(value)) this.__${name} = value }`;
      }

      // Return a logical representation of the data structure
      toStructure() {
        let { name, plural } = this.results;
        return [
          { type: "property", name },
          { type: "property", subType: "shared", name: plural }
        ];
      }
    }
  },


  //
  //	Self-reference
  //
  {
    name: "me",
    alias: "expression",
    syntax: "me",
    constructor: class me extends Rule.Keywords {
      toSource() {
        return "this";
      }
    }
  },

  // TODO: this really makes me want to make `I am empty` etc work...
  {
    name: "I",
    alias: "expression",
    syntax: "I",
    constructor: class I extends Rule.Keywords {
      toSource() {
        return "this";
      }
    }
  },


  //
  //	Property access
  //

  {
    name: "property_expression",
    alias: "expression",
    syntax: "(properties:the {identifier} of)+ the? {expression}",
    constructor: class property_expression extends Rule.Sequence {
      get results() {
        let { expression, properties_, } = this.results;
        return {
          properties: _properties.matched.map( property => property.results.identifier )
        };
      }

      toSource() {
        let { expression, properties } = this.results;
        properties = properties.reverse().join(".");
        return `${expression}.${properties}`;
  // NOTE: the following is safer, but ugly for demo purposes
  //			return `spell.get(${expression}, ['${properties}'])`;
      }
    }
  },

  {
    name: "my_property_expression",
    alias: "expression",
    syntax: "(my|this) {identifier}",
    constructor: class my_property_expression extends Rule.Sequence {
      toSource() {
        let { identifier } = this.results;
        return `this.${identifier}`;
      }
    }
  },
*/
);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvc3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2ZhaWxzLmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9saWIva2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvc3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY29mLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19saWJyYXJ5LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LXBpZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcG4uanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLWtleS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW50ZWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fd2tzLWV4dC5qcyIsIndlYnBhY2s6Ly8vLi9+L2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL3NyYy9QYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9ldmVudF9oYW5kbGVycy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL21hdGNoX2tleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9wYXJzZV9rZXlzLmpzIiwid2VicGFjazovLy8uL34vc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL1NwZWxsRWRpdG9yLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvcnVsZXMvc3BlbGwvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9FeGFtcGxlU3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL1NwYWNlci5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9UYWJiYWJsZVRleHRBcmVhLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL2luZGV4LmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL3V0aWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21lbW9pemUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL0pTWC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcnVsZXMvc3BlbGwvaWYuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL2xpc3RzLmpzIiwid2VicGFjazovLy8uL3NyYy9ydWxlcy9zcGVsbC9vcGVyYXRvcnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL3N0YXRlbWVudHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL3R5cGVzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9lczYvc3ltYm9sLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY2xhc3NvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY3R4LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faHRtbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faXMtYXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX21ldGEuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1jcmVhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcHMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wbi1leHQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3NldC10by1zdHJpbmctdGFnLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL190by1hYnNvbHV0ZS1pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tbGVuZ3RoLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL193a3MtZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL2VzNi5zeW1ib2wuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9TcGFjZXIubGVzcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL3N0eWxlcy5sZXNzIiwid2VicGFjazovLy8uL3NyYy9ydWxlcy9zcGVsbC9jb3JlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kZXNjcmlwdG9ycy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faGFzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2ZhY3RvcnlXaXRoVGhyb3dpbmdTaGltcy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9jbGFzc19kZWNvcmF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvbWV0aG9kX2RlY29yYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9tZXRob2RfZGVjb3JhdG9yX3Njb3BlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9hcnJheS5mcm9tLmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvZG9tX2hlbHBlcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9saXN0ZW5lcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi91dWlkLmpzIiwid2VicGFjazovLy8uL3NyYy9SdWxlLmpzIiwid2VicGFjazovLy8uL3NyYy9SdWxlU3ludGF4LmpzIiwid2VicGFjazovLy8uL3NyYy9Ub2tlbml6ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2lzLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdWlkLmpzIiwid2VicGFjazovLy8uL34vc3R5bGUtbG9hZGVyL2ZpeFVybHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9TcGFjZXIubGVzcz8wOGRlIiwid2VicGFjazovLy8uL3NyYy9hcHAvc3R5bGVzLmxlc3M/YjdlNyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvY2xhc3MuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL1VJLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL193a3MuanMiXSwibmFtZXMiOlsiaXNXaGl0ZXNwYWNlIiwic2hvd1doaXRlc3BhY2UiLCJwbHVyYWxpemUiLCJpc1BsdXJhbCIsInNpbmd1bGFyaXplIiwiaXNTaW5ndWxhciIsImdldFRhYnMiLCJBTExfV0hJVEVTUEFDRSIsInRleHQiLCJ0ZXN0Iiwic3RyaW5nIiwicmVwbGFjZSIsIndvcmQiLCJUQUJTIiwibnVtYmVyIiwic3Vic3RyIiwiYWxsRXhwb3J0cyIsImV4cG9ydHMiLCJnbG9iYWwiLCJTVFJJTkciLCJnbG9iYWxfaWRlbnRpZmllciIsIndpbmRvdyIsInNlbGYiLCJQYXJzZUVycm9yIiwiY29uc29sZSIsImdyb3VwIiwibG9nIiwiZ3JvdXBFbmQiLCJhcmdzIiwiRXJyb3IiLCJhcHBseSIsImNhcHR1cmVTdGFja1RyYWNlIiwicHJvdG90eXBlIiwiUGFyc2VyIiwicHJvcGVydGllcyIsImltcG9ydHMiLCJfcnVsZXMiLCJPYmplY3QiLCJhc3NpZ24iLCJydWxlTmFtZSIsImFyZ3VtZW50cyIsImxlbmd0aCIsIlRJTUUiLCJ0aW1lIiwidG9rZW5zIiwiVG9rZW5pemVyIiwidG9rZW5pemUiLCJmaWx0ZXIiLCJpc05vcm1hbFdoaXRlc3BhY2UiLCJ0b2tlbiIsInRpbWVFbmQiLCJ1bmRlZmluZWQiLCJyZW1vdmVMZWFkaW5nV2hpdGVzcGFjZSIsInJlc3VsdCIsInBhcnNlTmFtZWRSdWxlIiwicGFyc2UiLCJ0b1NvdXJjZSIsInN0YXJ0IiwiZW5kIiwic3RhY2siLCJjYWxsaW5nQ29udGV4dCIsInJ1bGUiLCJydWxlcyIsInJldmVyc2UiLCJjb25jYXQiLCJfX3J1bGVzIiwiQXJyYXkiLCJpc0FycmF5IiwiZm9yRWFjaCIsImFkZFJ1bGUiLCJtZXJnZVJ1bGUiLCJSdWxlIiwiQWx0ZXJuYXRpdmVzIiwicmVkdWNlIiwiYmxhY2tsaXN0IiwiZGVmaW5lUnVsZSIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJuYW1lIiwiVHlwZUVycm9yIiwibW9kdWxlIiwiY2Fub25pY2FsIiwibWFwIiwia2V5Iiwia2V5cyIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJuYW1lcyIsImFsaWFzIiwic3ludGF4IiwidGVzdHMiLCJvdXRwdXQiLCJmb3JNb2R1bGUiLCJwYXJzZXIiLCJSRUdJU1RSWSIsImV4aXN0aW5nIiwiYWx0Q29uc3RydWN0b3IiLCJzdGFydFRva2VuIiwiZW5kVG9rZW4iLCJuZXN0aW5nIiwibmVzdGVkIiwibGFzdEluZGV4Iiwic2xpY2UiLCJERUJVRyIsIldBUk4iLCJTcGVsbEVkaXRvciIsIm9ic2VydmVyIiwiZXhhbXBsZXMiLCJsb2FkIiwic3BlbGxFZGl0b3IiLCJzYXZlIiwicmV2ZXJ0IiwiY29tcGlsZSIsImNyZWF0ZSIsImRlbGV0ZSIsInJlbmFtZSIsImR1cGxpY2F0ZSIsInJlc2V0IiwidGl0bGVzIiwic2VsZWN0ZWQiLCJkaXJ0eSIsImNvZGUiLCJvcHRpb25zIiwidGl0bGUiLCJjb250ZW50Iiwib25DbGljayIsInNlbGVjdCIsImRpcnR5QnV0dG9ucyIsInBvc2l0aW9uIiwicmlnaHQiLCJ0b3AiLCJtYXJnaW4iLCJjb21waWxlQnV0dG9uIiwid2lkdGgiLCJsZWZ0IiwiaGVpZ2h0IiwicGFkZGluZ1RvcCIsImV2ZW50IiwidXBkYXRlIiwidGFyZ2V0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJkZWZhdWx0UHJvcHMiLCJFeGFtcGxlU3RvcmUiLCJpbXBvcnQiLCJwYXJzZVJ1bGUiLCJiaW5kIiwibG9jYWxTdG9yYWdlIiwic3BlbGxFZGl0b3JFeGFtcGxlcyIsInNwZWxsRWRpdG9yRXhhbXBsZSIsImxvY2F0aW9uIiwicmVsb2FkIiwiSlNPTiIsIl9zYXZlZEV4YW1wbGVzIiwic3RyaW5naWZ5IiwiZXhhbXBsZSIsInNraXBTYXZlIiwic2hvd0NvbmZpcm0iLCJjb25maXJtIiwicHJvbXB0Iiwib2xkTmFtZSIsIm5ld05hbWUiLCJ3YXJuIiwic2V0VGltZW91dCIsImluZm8iLCJvYnNlcnZhYmxlIiwiY29tcHV0ZWQiLCJTcGFjZXIiLCJjbGFzc05hbWUiLCJhcHBlYXJhbmNlIiwic2l6ZSIsImlubGluZSIsImZsdWlkIiwidGlueSIsInNtYWxsIiwibWVkaXVtIiwibGFyZ2UiLCJodWdlIiwibWFzc2l2ZSIsInNwYWNlclByb3BzIiwic3R5bGUiLCJwcm9wVHlwZXMiLCJQcm9wVHlwZXMiLCJib29sIiwiVGFiYmFibGVUZXh0QXJlYSIsIm9uS2V5RG93biIsImtleUNvZGUiLCJwcmV2ZW50RGVmYXVsdCIsImVsZW1lbnQiLCJzZWxlY3Rpb25TdGFydCIsInNlbGVjdGlvbkVuZCIsIm5ld1RleHQiLCJzaGlmdEtleSIsImxhc3RJbmRleE9mIiwiaW5kZXhPZiIsImxpbmVzIiwic3BsaXQiLCJsaW5lIiwiam9pbiIsIm9uQ2hhbmdlIiwiVGV4dEFyZWEiLCJSZWFjdERPTSIsInJlbmRlciIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJjbGFzc05hbWVzIiwiYXJnIiwiQm9vbGVhbiIsIm1lbW9pemVkIiwiZGVmaW5lTWVtb2l6ZWQiLCJwcm9wZXJ0eSIsImdldHRlciIsImNvbmZpZ3VyYWJsZSIsImdldCIsImRlZmluZVJ1bGVzIiwiSlNYRWxlbWVudCIsImNsb25lIiwibWF0Y2hlZCIsIm5leHRTdGFydCIsImpzeEVsZW1lbnQiLCJhdHRyaWJ1dGVzIiwiYXR0cnMiLCJKU1hFeHByZXNzaW9uIiwianN4RXhwcmVzc2lvblRvU291cmNlIiwiY2hpbGRyZW4iLCJjaGlsZCIsInRyaW0iLCJjaGlsZFNvdXJjZSIsImpzeEVsZW1lbnRUb1NvdXJjZSIsIlN5bnRheEVycm9yIiwianN4RXhwcmVzc2lvbiIsInRhZ05hbWUiLCJhdHRyc1RvU291cmNlIiwiY2hpbGRyZW5Ub1NvdXJjZSIsInJlc3VsdHMiLCJjb25kaXRpb24iLCJzdGF0ZW1lbnRzIiwiQmxvY2tTdGF0ZW1lbnQiLCJjb21waWxlQXMiLCJsZWZ0UmVjdXJzaXZlIiwidGVzdFJ1bGUiLCJLZXl3b3JkcyIsImxpdGVyYWxzIiwic3RhdGVtZW50IiwiZWxzZVN0YXRlbWVudCIsIlNlcXVlbmNlIiwibGlzdCIsImlkZW50aWZpZXIiLCJ0aGluZyIsImV4cHJlc3Npb24iLCJhcmd1bWVudCIsIm1hdGNoIiwib3BlcmF0b3IiLCJiYW5nIiwiaXRlbSIsIml0ZW1WYXIiLCJwb3NpdGlvblZhciIsImJsb2NrIiwiQmxvY2siLCJlbmNsb3NlU3RhdGVtZW50cyIsImxocyIsInJocyIsIl9vcGVyYXRvciIsImFwcGx5T3BlcmF0b3IiLCJwcmVjZWRlbmNlIiwiYSIsImIiLCJ0eXBlIiwiU3ltYm9scyIsImRpcmVjdGlvbiIsInNob3dBbGwiLCJwcm9wIiwiTGlzdCIsInN0cnVjdHVyZSIsInN1cGVyVHlwZSIsIlN0YXRlbWVudHMiLCJDb21tZW50IiwicGF0dGVybiIsIlBhdHRlcm4iLCJOdW1iZXIiLCJOVU1CRVJfTkFNRVMiLCJ6ZXJvIiwib25lIiwidHdvIiwidGhyZWUiLCJmb3VyIiwiZml2ZSIsInNpeCIsInNldmVuIiwiZWlnaHQiLCJuaW5lIiwidGVuIiwiVGV4dCIsInF1b3RlZFN0cmluZyIsInN0YXJ0c1dpdGgiLCJlbmRzV2l0aCIsIkxpdGVyYWxzIiwibWF0Y2hlc1N0YXJ0aW5nQXQiLCJsaXRlcmFsU2VwYXJhdG9yIiwiZmlyc3QiLCJpbmRleCIsImV2ZXJ5IiwibGl0ZXJhbCIsImkiLCJvcHRpb25hbCIsInNvbWUiLCJzb3VyY2UiLCJTdWJydWxlIiwibWF0Y2hlZFJ1bGUiLCJzdWJydWxlIiwiaW5jbHVkZXMiLCJwdXNoIiwidG9TeW50YXgiLCJhZGRSZXN1bHRzIiwiY29tbWVudCIsInByb21vdGUiLCJzb3VyY2VOYW1lIiwibWF0Y2hOYW1lIiwibWF0Y2hlcyIsImJlc3RNYXRjaCIsImdldEJlc3RNYXRjaCIsImJlc3QiLCJjdXJyZW50IiwiUmVwZWF0IiwicmVwZWF0IiwiaXNDb21wb3VuZFJ1bGUiLCJkZWxpbWl0ZXIiLCJpbmRlbnQiLCJjb250ZW50cyIsIkJsYW5rTGluZSIsImxhc3QiLCJwYXJzZUJsb2NrIiwicGFyc2VTdGF0ZW1lbnQiLCJXaGl0ZXNwYWNlIiwiZXJyb3IiLCJTdGF0ZW1lbnRQYXJzZUVycm9yIiwidW5wYXJzZWQiLCJwYXJzZWQiLCJlIiwiYmxvY2tUb1NvdXJjZSIsIl9uYW1lIiwiX3N1cGVyVHlwZSIsIm5hbWVkIiwibWV0aG9kcyIsIm90aGVyIiwidG9TdHJ1Y3R1cmUiLCJhZGRTdHJ1Y3R1cmUiLCJmb3JjZVdyYXAiLCJicmVha0ludG9CbG9ja3MiLCJfc3RhdGVtZW50cyIsIl9ibG9jayIsIl9zdGF0ZW1lbnQiLCJlbmNsb3NlU3RhdGVtZW50Iiwid2hpdGVzcGFjZSIsIm1lc3NhZ2UiLCJwYXJzZVN5bnRheCIsInRva2VuaXNlUnVsZVN5bnRheCIsIlNZTlRBWF9FWFBSRVNTSU9OIiwic3ludGF4U3RyZWFtIiwicGFyc2VUb2tlbiIsInBvcCIsIktFWVdPUkRfUEFUVEVSTiIsInN5bnRheFRva2VuIiwicGFyc2VTeW1ib2wiLCJwYXJzZVN1YnJ1bGUiLCJwYXJzZUFsdGVybmF0aXZlcyIsInBhcnNlTGlzdCIsInBhcnNlUmVwZWF0IiwicGFyc2VLZXl3b3JkIiwibmV4dCIsImlzRXNjYXBlZCIsImZpbmROZXN0ZWRUb2tlbnMiLCJhbHRlcm5hdGl2ZXMiLCJncm91cEFsdGVybmF0aXZlcyIsInN5bWJvbCIsInBhcmFtcyIsImJhbmdQb3NpdGlvbiIsIm5vdCIsIm5ld2xpbmUiLCJJbmRlbnQiLCJORVdMSU5FIiwiZWF0VG9rZW5zIiwibWF0Y2hUb3BUb2tlbnMiLCJtZXRob2QiLCJjYWxsIiwibWF0Y2hXaGl0ZXNwYWNlIiwibWF0Y2hXb3JkIiwibWF0Y2hOdW1iZXIiLCJtYXRjaE5ld2xpbmUiLCJtYXRjaEpTWEVsZW1lbnQiLCJtYXRjaFRleHQiLCJtYXRjaENvbW1lbnQiLCJtYXRjaFN5bWJvbCIsImVhdFdoaXRlc3BhY2UiLCJ3aGl0ZVNwYWNlRW5kIiwid2hpdGVzcGFjZUVuZCIsIldPUkRfU1RBUlQiLCJXT1JEX0NIQVIiLCJ3b3JkRW5kIiwiTlVNQkVSX1NUQVJUIiwiTlVNQkVSIiwibnVtYmVyTWF0Y2giLCJtYXRjaEV4cHJlc3Npb25BdEhlYWQiLCJudW1iZXJTdHIiLCJwYXJzZUZsb2F0IiwicXVvdGVTeW1ib2wiLCJ0ZXh0RW5kIiwiY2hhciIsIkNPTU1FTlQiLCJjb21tZW50U3RhcnQiLCJnZXRMaW5lQXRIZWFkIiwiY29tbWVudE1hdGNoIiwiY29tbWVudFN5bWJvbCIsIm1hdGNoSlNYU3RhcnRUYWciLCJpc1VuYXJ5VGFnIiwibWF0Y2hKU1hDaGlsZHJlbiIsImNoaWxkRW5kIiwiSlNYX1RBR19TVEFSVCIsInRhZ01hdGNoIiwiZW5kQml0IiwibWF0Y2hKU1hBdHRyaWJ1dGUiLCJhdHRyRW5kIiwiYXR0cnNBc1N0cmluZyIsImNoaWxkcmVuQXNTdHJpbmciLCJhdHRyIiwiZW5kVGFnIiwibWF0Y2hKU1hDaGlsZCIsIm1hdGNoSlNYRW5kVGFnIiwibWF0Y2hKU1hFeHByZXNzaW9uIiwibWF0Y2hKU1hUZXh0IiwibWF0Y2hTdHJpbmdBdEhlYWQiLCJKU1hfQVRUUklCVVRFX1NUQVJUIiwiZXF1YWxzIiwiYXR0cmlidXRlIiwiSlNYQXR0cmlidXRlIiwibWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZSIsInZhbHVlRW5kIiwibWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZUlkZW50aWZpZXIiLCJlbmRJbmRleCIsImZpbmRNYXRjaGluZ0F0SGVhZCIsIkpTWF9URVhUX0VORF9DSEFSUyIsImZpbmRGaXJzdEF0SGVhZCIsImpzeFRleHQiLCJzdHJpbmdFbmQiLCJoZWFkIiwic3RhcnREZWxpbWl0ZXIiLCJlbmREZWxpbWl0ZXIiLCJhZnRlclF1b3RlIiwiY2hhcnMiLCJyZW1vdmVOb3JtYWxXaGl0ZXNwYWNlIiwiYnJlYWtJbnRvTGluZXMiLCJjdXJyZW50TGluZSIsImdldExpbmVJbmRlbnRzIiwiZGVmYXVsdEluZGVudCIsImluZGVudHMiLCJnZXRMaW5lSW5kZW50Iiwic3RhcnRJbmRlbnQiLCJnZXROZXh0SW5kZW50IiwibWF4SW5kZW50IiwiTWF0aCIsIm1pbiIsImxpbmVJbmRlbnQiLCJuZXdCbG9jayIsImNsb25lQ2xhc3MiLCJfX2Nsb25lQ2xhc3NfXyIsIkZ1bmN0aW9uIiwib2tCdXR0b24iLCJjYW5jZWxCdXR0b24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O1FBSWdCQSxZLEdBQUFBLFk7UUFJQUMsYyxHQUFBQSxjO1FBU0FDLFMsR0FBQUEsUztRQU1BQyxRLEdBQUFBLFE7UUFR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MkJoSCxPQUEzQixVQUF1Q2dILFFBQXZDO0FBQ0Q7QUFKSDs7QUFBQTtBQUFBLElBQWdDM1ksZUFBSzhLLFFBQXJDLENBSkY7QUFVRTNKLFNBQU8sQ0FDTDtBQUNFb0osZUFBVyxXQURiO0FBRUVwSixXQUFPLENBQ0wsaURBREssRUFFTCwyREFGSyxFQUdMLHFEQUhLLEVBSUwsbUVBSks7QUFGVCxHQURLO0FBVlQsQ0E3QkY7O0FBcURFO0FBQ0E7QUFDQTtBQUNBO0FBQ0VaLFFBQU0sU0FEUjtBQUVFVSxTQUFPLFdBRlQ7QUFHRUMsVUFBUSw0RkFIVjtBQUlFYjtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsaUNBQ2E7QUFBQSx3QkFDdUQsS0FBSzhKLE9BRDVEO0FBQUEsWUFDSHdILE9BREcsYUFDSEEsT0FERztBQUFBLDJDQUNNZ0gsUUFETjtBQUFBLFlBQ01BLFFBRE4sc0NBQ2lCLE1BRGpCO0FBQUEsOENBQ3lCQyxZQUR6QjtBQUFBLFlBQ3lCQSxZQUR6Qix5Q0FDd0MsVUFEeEM7O0FBRVQsd0NBQThCakgsT0FBOUIsVUFBMENnSCxRQUExQyxVQUF1REMsWUFBdkQ7QUFDRDtBQUpIOztBQUFBO0FBQUEsSUFBbUM1WSxlQUFLOEssUUFBeEMsQ0FKRjtBQVVFM0osU0FBTyxDQUNMO0FBQ0VvSixlQUFXLFdBRGI7QUFFRXBKLFdBQU8sQ0FDTCxtRUFESyxFQUVMLDZFQUZLLEVBR0wsb0ZBSEssRUFJTCxtRkFKSyxFQUtMLCtGQUxLO0FBRlQsR0FESztBQVZULENBeERGLEU7Ozs7Ozs7QUNYQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZ2xvYmFsIGZyb20gXCIuL2dsb2JhbFwiO1xuXG4vLyBSZXR1cm4gdHJ1ZSBpZiB0ZXh0IGlzIGFsbCB3aGl0ZXNwYWNlLCBpbmNsdWRpbmcgZW1wdHkgc3RyaW5nLlxubGV0IEFMTF9XSElURVNQQUNFID0gL15cXHMqJC87XG5leHBvcnQgZnVuY3Rpb24gaXNXaGl0ZXNwYWNlKHRleHQpIHtcblx0cmV0dXJuIEFMTF9XSElURVNQQUNFLnRlc3QodGV4dClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dXaGl0ZXNwYWNlKHN0cmluZykge1xuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gXCJzdHJpbmdcIikgcmV0dXJuIHN0cmluZztcbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC9cXG4vZywgXCLCrFwiKVxuICAgICAgICAgIC5yZXBsYWNlKC9cXHQvZywgXCLiiIZcIik7XG59XG5cbi8vIFJldHVybiB0aGUgcGx1cmFsIG9mIGB3b3JkYC5cbi8vIE5PVEU6IHRoaXMgaXMgbm90IHZlcnkgZ29vZCBhdCBhbGwhISFcbi8vIFRPRE86IGV4Y2VwdGlvbnMsIGV0Yy5cbmV4cG9ydCBmdW5jdGlvbiBwbHVyYWxpemUod29yZCkge1xuXHRyZXR1cm4gd29yZCArIFwic1wiO1xufVxuXG4vLyBSZXR1cm4gdHJ1ZSBpZiB3b3JkIGlzIGEgcGx1cmFsLlxuLy8gTk9URTogZm9yIHdvcmRzIHdoaWNoIGFyZSBCT1RIIHNpbmd1bGFyIGFuZCBwbHVyYWwsIHRoaXMgd2lsbCByZXR1cm4gdHJ1ZS5cbmV4cG9ydCBmdW5jdGlvbiBpc1BsdXJhbCh3b3JkKSB7XG5cdHJldHVybiB3b3JkID09PSBwbHVyYWxpemUod29yZCk7XG59XG5cblxuLy8gUmV0dXJuIHRoZSBzaW5ndWxhciBvZiBgd29yZGAuXG4vLyBOT1RFOiB0aGlzIGlzIG5vdCB2ZXJ5IGdvb2QgYXQgYWxsISEhXG4vLyBUT0RPOiBleGNlcHRpb25zLCBldGMuXG5leHBvcnQgZnVuY3Rpb24gc2luZ3VsYXJpemUod29yZCkge1xuXHRyZXR1cm4gd29yZC5yZXBsYWNlKC9lP3MkLywgXCJcIik7XG59XG5cbi8vIFJldHVybiB0cnVlIGlmIHdvcmQgaXMgYSBzaW5ndWxhci5cbi8vIE5PVEU6IGZvciB3b3JkcyB3aGljaCBhcmUgQk9USCBzaW5ndWxhciBhbmQgcGx1cmFsLCB0aGlzIHdpbGwgcmV0dXJuIHRydWUuXG5leHBvcnQgZnVuY3Rpb24gaXNTaW5ndWxhcih3b3JkKSB7XG5cdHJldHVybiB3b3JkID09PSBzaW5ndWxhcml6ZSh3b3JkKTtcbn1cblxuXG4vLyBSZXR1cm4gYSBjZXJ0YWluIGBudW1iZXJgIG9mIHRhYiBjaGFyYWN0ZXJzLlxuY29uc3QgVEFCUyA9IFwiXFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XCI7XG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFicyhudW1iZXIpIHtcblx0aWYgKHR5cGVvZiBudW1iZXIgIT09IFwibnVtYmVyXCIpIHJldHVybiBcIlwiO1xuXHRyZXR1cm4gVEFCUy5zdWJzdHIoMCwgbnVtYmVyKTtcbn1cblxuXG4vLyBFeHBvcnQgYWxsIGFzIGEgbHVtcFxubGV0IGFsbEV4cG9ydHMgPSB7Li4uZXhwb3J0c307XG5leHBvcnQgZGVmYXVsdCBhbGxFeHBvcnRzO1xuXG4vLyBERUJVRzogcHV0IG9uIGdsb2JhbCBmb3IgZGVidWdnaW5nLlxuZ2xvYmFsLlNUUklORyA9IGFsbEV4cG9ydHM7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdXRpbHMvc3RyaW5nLmpzIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoIWlzT2JqZWN0KGl0KSkgdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fYW4tb2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSAxMTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhlYykge1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZmFpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDExNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgJ2NvcmUtanMvZXM2L3N5bWJvbCc7XG5cbi8vIFRPRE86IE5lZWQgYmV0dGVyLCBtb3JlIGNvbXBsZXRlLCBhbmQgbW9yZSBtZXRob2RpY2FsIGtleSBkZWZpbml0aW9uc1xuXG52YXIgS2V5cyA9IHtcbiAgYmFja3NwYWNlOiA4LFxuICBkZWw6IDQ2LFxuICBkZWxldGU6IDQ2LFxuICB0YWI6IDksXG4gIGVudGVyOiAxMyxcbiAgJ3JldHVybic6IDEzLFxuICBlc2M6IDI3LFxuICBzcGFjZTogMzIsXG4gIHBhZ2VVcDogMzMsXG4gIHBhZ2VEb3duOiAzNCxcbiAgZW5kOiAzNSxcbiAgaG9tZTogMzYsXG4gIGxlZnQ6IDM3LFxuICB1cDogMzgsXG4gIHJpZ2h0OiAzOSxcbiAgZG93bjogNDAsXG4gICc7JzogMTg2LFxuICAnPSc6IDE4NyxcbiAgJywnOiAxODgsXG4gICctJzogMTg5LFxuICAnLic6IDE5MCxcbiAgJy8nOiAxOTEsXG4gICdgJzogMTkyLFxuICAnWyc6IDIxOSxcbiAgJ1xcXFwnOiAyMjAsXG4gICddJzogMjIxXG59O1xuXG4vLyBBZGQgdXBwZXJjYXNlIHZlcnNpb25zIG9mIGtleXMgYWJvdmUgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG5PYmplY3Qua2V5cyhLZXlzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIEtleXNba2V5LnRvVXBwZXJDYXNlKCldID0gS2V5c1trZXldO1xufSk7XG5cbicwMTIzNDU2Nzg5Jy5zcGxpdCgnJykuZm9yRWFjaChmdW5jdGlvbiAobnVtLCBpbmRleCkge1xuICByZXR1cm4gS2V5c1tudW1dID0gaW5kZXggKyA0ODtcbn0pO1xuXG4nQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChsZXR0ZXIsIGluZGV4KSB7XG4gIEtleXNbbGV0dGVyXSA9IGluZGV4ICsgNjU7XG4gIEtleXNbbGV0dGVyLnRvTG93ZXJDYXNlKCldID0gaW5kZXggKyA2NTtcbn0pO1xuXG4vLyBmbiBrZXlzXG5bMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIDExLCAxMl0uZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcbiAgcmV0dXJuIEtleXNbJ2YnICsgaW5kZXhdID0gMTExICsgaW5kZXg7XG59KTtcblxuZXhwb3J0IHZhciBtb2RpZmllcnMgPSB7XG4gIGNvbnRyb2w6ICdjdHJsJyxcbiAgY3RybDogJ2N0cmwnLFxuICBzaGlmdDogJ3NoaWZ0JyxcbiAgbWV0YTogJ21ldGEnLFxuICBjbWQ6ICdtZXRhJyxcbiAgY29tbWFuZDogJ21ldGEnLFxuICBvcHRpb246ICdhbHQnLFxuICBhbHQ6ICdhbHQnXG59O1xuXG5leHBvcnQgdmFyIEFMTF9LRVlTID0gU3ltYm9sKCdBTExfS0VZUycpO1xuXG5leHBvcnQgdmFyIEFMTF9QUklOVEFCTEVfS0VZUyA9IFN5bWJvbCgnQUxMX1BSSU5UQUJMRV9LRVlTJyk7XG5cbmV4cG9ydCBkZWZhdWx0IEtleXM7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL2tleXMuanNcbi8vIG1vZHVsZSBpZCA9IDE0OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgX3NsaWNlZFRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH0gcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyByZXR1cm4gYXJyOyB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkgeyByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpOyB9IGVsc2UgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTsgfSB9OyB9KCk7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG4vKipcbiAqIEBtb2R1bGUgc3RvcmVcbiAqXG4gKi9cbmltcG9ydCBtYXRjaEtleXMgZnJvbSAnLi9saWIvbWF0Y2hfa2V5cyc7XG5pbXBvcnQgcGFyc2VLZXlzIGZyb20gJy4vbGliL3BhcnNlX2tleXMnO1xuaW1wb3J0IHV1aWQgZnJvbSAnLi9saWIvdXVpZCc7XG5cbi8qKlxuICogcHJpdmF0ZVxuICpcbiAqL1xuXG4vLyBkaWN0IGZvciBjbGFzcyBwcm90b3R5cGVzID0+IGJpbmRpbmdzXG52YXIgX2hhbmRsZXJzID0gbmV3IE1hcCgpO1xuXG4vLyBhbGwgbW91bnRlZCBpbnN0YW5jZXMgdGhhdCBoYXZlIGtleWJpbmRpbmdzXG52YXIgX2luc3RhbmNlcyA9IG5ldyBTZXQoKTtcblxuLy8gZm9yIHRlc3RpbmdcbmV4cG9ydCBmdW5jdGlvbiBfcmVzZXRTdG9yZSgpIHtcbiAgX2hhbmRsZXJzLmNsZWFyKCk7XG4gIF9pbnN0YW5jZXMuY2xlYXIoKTtcbn1cblxuLyoqXG4gKiBhY3RpdmF0ZVxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gaW5zdGFuY2UgSW5zdGFudGlhdGVkIGNsYXNzIHRoYXQgZXh0ZW5kZWQgUmVhY3QuQ29tcG9uZW50LCB0byBiZSBmb2N1c2VkIHRvIHJlY2VpdmUga2V5ZG93biBldmVudHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKGluc3RhbmNlcykge1xuICB2YXIgaW5zdGFuY2VzQXJyYXkgPSBbXS5jb25jYXQoaW5zdGFuY2VzKTtcblxuICAvLyBpZiBubyBjb21wb25lbnRzIHdlcmUgZm91bmQgYXMgYW5jZXN0b3JzIG9mIHRoZSBldmVudCB0YXJnZXQsXG4gIC8vIGVmZmVjdGl2ZWx5IGRlYWN0aXZhdGUga2V5ZG93biBoYW5kbGluZyBieSBjYXBwaW5nIHRoZSBzZXQgb2YgaW5zdGFuY2VzXG4gIC8vIHdpdGggYG51bGxgLlxuICBpZiAoIWluc3RhbmNlc0FycmF5Lmxlbmd0aCkge1xuICAgIF9pbnN0YW5jZXMuYWRkKG51bGwpO1xuICB9IGVsc2Uge1xuICAgIF9pbnN0YW5jZXMuZGVsZXRlKG51bGwpO1xuXG4gICAgLy8gZGVsZXRpbmcgYW5kIHRoZW4gYWRkaW5nIHRoZSBpbnN0YW5jZShzKSBoYXMgdGhlIGVmZmVjdCBvZiBzb3J0aW5nIHRoZSBzZXRcbiAgICAvLyBhY2NvcmRpbmcgdG8gaW5zdGFuY2UgYWN0aXZhdGlvbiAoYXNjZW5kaW5nKVxuICAgIGluc3RhbmNlc0FycmF5LmZvckVhY2goZnVuY3Rpb24gKGluc3RhbmNlKSB7XG4gICAgICBfaW5zdGFuY2VzLmRlbGV0ZShpbnN0YW5jZSk7XG4gICAgICBfaW5zdGFuY2VzLmFkZChpbnN0YW5jZSk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8qKlxuICogZGVsZXRlSW5zdGFuY2VcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCBJbnN0YW50aWF0ZWQgY2xhc3MgdGhhdCBleHRlbmRlZCBSZWFjdC5Db21wb25lbnRcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRoZSB2YWx1ZSBzZXQuaGFzKCB0YXJnZXQgKSB3b3VsZCBoYXZlIHJldHVybmVkIHByaW9yIHRvIGRlbGV0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVJbnN0YW5jZSh0YXJnZXQpIHtcbiAgX2luc3RhbmNlcy5kZWxldGUodGFyZ2V0KTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kQmluZGluZ0ZvckV2ZW50KGV2ZW50KSB7XG4gIGlmICghX2luc3RhbmNlcy5oYXMobnVsbCkpIHtcbiAgICB2YXIga2V5TWF0Y2hlc0V2ZW50ID0gZnVuY3Rpb24ga2V5TWF0Y2hlc0V2ZW50KGtleVNldCkge1xuICAgICAgcmV0dXJuIG1hdGNoS2V5cyh7IGtleVNldDoga2V5U2V0LCBldmVudDogZXZlbnQgfSk7XG4gICAgfTtcblxuICAgIC8vIGxvb3AgdGhyb3VnaCBpbnN0YW5jZXMgaW4gcmV2ZXJzZSBhY3RpdmF0aW9uIG9yZGVyIHNvIHRoYXQgbW9zdFxuICAgIC8vIHJlY2VudGx5IGFjdGl2YXRlZCBpbnN0YW5jZSBnZXRzIGZpcnN0IGRpYnMgb24gZXZlbnRcbiAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoX2luc3RhbmNlcykpLnJldmVyc2UoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gX3N0ZXAudmFsdWU7XG5cbiAgICAgICAgdmFyIGJpbmRpbmdzID0gZ2V0QmluZGluZyhpbnN0YW5jZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUpO1xuICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyID0gZmFsc2U7XG4gICAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gYmluZGluZ3NbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDI7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSAoX3N0ZXAyID0gX2l0ZXJhdG9yMi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWUpIHtcbiAgICAgICAgICAgIHZhciBfc3RlcDIkdmFsdWUgPSBfc2xpY2VkVG9BcnJheShfc3RlcDIudmFsdWUsIDIpLFxuICAgICAgICAgICAgICAgIGtleVNldHMgPSBfc3RlcDIkdmFsdWVbMF0sXG4gICAgICAgICAgICAgICAgZm4gPSBfc3RlcDIkdmFsdWVbMV07XG5cbiAgICAgICAgICAgIGlmIChrZXlTZXRzLnNvbWUoa2V5TWF0Y2hlc0V2ZW50KSkge1xuICAgICAgICAgICAgICAvLyByZXR1cm4gd2hlbiBtYXRjaGluZyBrZXliaW5kaW5nIGlzIGZvdW5kIC0gaS5lLiBvbmx5IG9uZVxuICAgICAgICAgICAgICAvLyBrZXlib3VuZCBjb21wb25lbnQgY2FuIHJlc3BvbmQgdG8gYSBnaXZlbiBrZXkgY29kZS4gdG8gZ2V0IGFyb3VuZCB0aGlzLFxuICAgICAgICAgICAgICAvLyBzY29wZSBhIGNvbW1vbiBhbmNlc3RvciBjb21wb25lbnQgY2xhc3Mgd2l0aCBAa2V5ZG93biBhbmQgdXNlXG4gICAgICAgICAgICAgIC8vIEBrZXlkb3duU2NvcGVkIHRvIGJpbmQgdGhlIGR1cGxpY2F0ZSBrZXlzIGluIHlvdXIgY2hpbGQgY29tcG9uZW50c1xuICAgICAgICAgICAgICAvLyAob3IganVzdCBpbnNwZWN0IG5leHRQcm9wcy5rZXlkb3duLmV2ZW50KS5cbiAgICAgICAgICAgICAgcmV0dXJuIHsgZm46IGZuLCBpbnN0YW5jZTogaW5zdGFuY2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgICAgICAgX2l0ZXJhdG9yRXJyb3IyID0gZXJyO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yICYmIF9pdGVyYXRvcjIucmV0dXJuKSB7XG4gICAgICAgICAgICAgIF9pdGVyYXRvcjIucmV0dXJuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjIpIHtcbiAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogZ2V0QmluZGluZ1xuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IENsYXNzIHVzZWQgYXMga2V5IGluIGRpY3Qgb2Yga2V5IGJpbmRpbmdzXG4gKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBvYmplY3QgY29udGFpbmluZyBiaW5kaW5ncyBmb3IgdGhlIGdpdmVuIGNsYXNzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRCaW5kaW5nKF9yZWYpIHtcbiAgdmFyIF9fcmVhY3RLZXlkb3duVVVJRCA9IF9yZWYuX19yZWFjdEtleWRvd25VVUlEO1xuXG4gIHJldHVybiBfaGFuZGxlcnMuZ2V0KF9fcmVhY3RLZXlkb3duVVVJRCk7XG59O1xuXG4vKipcbiAqIGdldEluc3RhbmNlc1xuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcmV0dXJuIHtzZXR9IEFsbCBzdG9yZWQgaW5zdGFuY2VzIChhbGwgbW91bnRlZCBjb21wb25lbnQgaW5zdGFuY2VzIHdpdGgga2V5YmluZGluZ3MpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbnN0YW5jZXMoKSB7XG4gIHJldHVybiBfaW5zdGFuY2VzO1xufTtcblxuLyoqXG4gKiBpc0VtcHR5XG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEByZXR1cm4ge251bWJlcn0gU2l6ZSBvZiB0aGUgc2V0IG9mIGFsbCBzdG9yZWQgaW5zdGFuY2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5KCkge1xuICByZXR1cm4gIV9pbnN0YW5jZXMuc2l6ZTtcbn07XG5cbi8qKlxuICogc2V0QmluZGluZ1xuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncyBBbGwgYXJndW1lbnRzIG5lY2Vzc2FyeSB0byBzZXQgdGhlIGJpbmRpbmdcbiAqIEBwYXJhbSB7YXJyYXl9IGFyZ3Mua2V5cyBLZXkgY29kZXMgdGhhdCBzaG91bGQgdHJpZ2dlciB0aGUgZm5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGFyZ3MuZm4gVGhlIGNhbGxiYWNrIHRvIGJlIHRyaWdnZXJlZCB3aGVuIGdpdmVuIGtleXMgYXJlIHByZXNzZWRcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzLnRhcmdldCBUaGUgZGVjb3JhdGVkIGNsYXNzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRCaW5kaW5nKF9yZWYyKSB7XG4gIHZhciBrZXlzID0gX3JlZjIua2V5cyxcbiAgICAgIGZuID0gX3JlZjIuZm4sXG4gICAgICB0YXJnZXQgPSBfcmVmMi50YXJnZXQ7XG5cbiAgdmFyIGtleVNldHMgPSBwYXJzZUtleXMoa2V5cyk7XG5cbiAgdmFyIF9fcmVhY3RLZXlkb3duVVVJRCA9IHRhcmdldC5fX3JlYWN0S2V5ZG93blVVSUQ7XG5cbiAgaWYgKCFfX3JlYWN0S2V5ZG93blVVSUQpIHtcbiAgICB0YXJnZXQuX19yZWFjdEtleWRvd25VVUlEID0gdXVpZCgpO1xuICAgIF9oYW5kbGVycy5zZXQodGFyZ2V0Ll9fcmVhY3RLZXlkb3duVVVJRCwgbmV3IE1hcChbW2tleVNldHMsIGZuXV0pKTtcbiAgfSBlbHNlIHtcbiAgICBfaGFuZGxlcnMuZ2V0KF9fcmVhY3RLZXlkb3duVVVJRCkuc2V0KGtleVNldHMsIGZuKTtcbiAgfVxufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9zdG9yZS5qc1xuLy8gbW9kdWxlIGlkID0gMTQ5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIE1ha2Ugc3VyZSBgZ2xvYmFsYCBpcyBkZWZpbmVkIGdsb2JhbGx5OlxuLy9cdC0gZWl0aGVyIGFzIHRoZSBub2RlanMgYGdsb2JhbGAsIG9yXG4vL1x0LSBhcyBhbiBhbGlhcyBmb3IgYHdpbmRvd2AgaW4gYnJvd3NlcnMsIG9yXG4vL1x0LSBmb3IgdGhlIGBzZWxmYCBjb250ZXh0IGluIHdlYiB3b3JrZXJzLlxuLy9cbi8vIE5PVEU6IHRoaXMgbW9kaWZpZXMgdGhlIFwiZ2xvYmFsXCIgZW52aXJvbm1lbnQgYnkgbWFraW5nIHN1cmUgXCJnbG9iYWxcIiBpcyBzZXQuIVxuLy9cblxubGV0IGdsb2JhbF9pZGVudGlmaWVyO1xuaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbi8vXHRjb25zb2xlLmxvZyhcIlJ1bm5pbmcgaW4gbm9kZVwiKTtcblx0Z2xvYmFsX2lkZW50aWZpZXIgPSBnbG9iYWw7XG59XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4vL1x0Y29uc29sZS5sb2coXCJSdW5uaW5nIGluIGEgd2ViIGJyb3dzZXJcIik7XG5cdHdpbmRvdy5nbG9iYWwgPSB3aW5kb3c7XG5cdGdsb2JhbF9pZGVudGlmaWVyID0gd2luZG93O1xufVxuXG5pZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcbi8vXHRjb25zb2xlLmxvZyhcIlJ1bm5pbmcgaW4gYSB3ZWIgd29ya2VyXCIpO1xuXHRzZWxmLmdsb2JhbCA9IHNlbGY7XG5cdGdsb2JhbF9pZGVudGlmaWVyID0gc2VsZjtcbn1cblxuLy8gRXhwb3J0IGZvciBjb25zdW1wdGlvbiBieSBpbXBvcnQuXG5leHBvcnQgZGVmYXVsdCBnbG9iYWxfaWRlbnRpZmllcjtcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3V0aWxzL2dsb2JhbC5qcyIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2NvZi5qc1xuLy8gbW9kdWxlIGlkID0gMTc5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIElFIDgtIGRvbid0IGVudW0gYnVnIGtleXNcbm1vZHVsZS5leHBvcnRzID0gKFxuICAnY29uc3RydWN0b3IsaGFzT3duUHJvcGVydHksaXNQcm90b3R5cGVPZixwcm9wZXJ0eUlzRW51bWVyYWJsZSx0b0xvY2FsZVN0cmluZyx0b1N0cmluZyx2YWx1ZU9mJ1xuKS5zcGxpdCgnLCcpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZW51bS1idWcta2V5cy5qc1xuLy8gbW9kdWxlIGlkID0gMTgwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkUCA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpO1xudmFyIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIHJldHVybiBkUC5mKG9iamVjdCwga2V5LCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG59IDogZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICByZXR1cm4gb2JqZWN0O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2hpZGUuanNcbi8vIG1vZHVsZSBpZCA9IDE4MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZhbHNlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fbGlicmFyeS5qc1xuLy8gbW9kdWxlIGlkID0gMTgyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDE5LjEuMi4xNCAvIDE1LjIuMy4xNCBPYmplY3Qua2V5cyhPKVxudmFyICRrZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMtaW50ZXJuYWwnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiBrZXlzKE8pIHtcbiAgcmV0dXJuICRrZXlzKE8sIGVudW1CdWdLZXlzKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy5qc1xuLy8gbW9kdWxlIGlkID0gMTgzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMuZiA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LXBpZS5qc1xuLy8gbW9kdWxlIGlkID0gMTg0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJpdG1hcCwgdmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZTogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZTogdmFsdWVcbiAgfTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19wcm9wZXJ0eS1kZXNjLmpzXG4vLyBtb2R1bGUgaWQgPSAxODVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgU1JDID0gcmVxdWlyZSgnLi9fdWlkJykoJ3NyYycpO1xudmFyIFRPX1NUUklORyA9ICd0b1N0cmluZyc7XG52YXIgJHRvU3RyaW5nID0gRnVuY3Rpb25bVE9fU1RSSU5HXTtcbnZhciBUUEwgPSAoJycgKyAkdG9TdHJpbmcpLnNwbGl0KFRPX1NUUklORyk7XG5cbnJlcXVpcmUoJy4vX2NvcmUnKS5pbnNwZWN0U291cmNlID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiAkdG9TdHJpbmcuY2FsbChpdCk7XG59O1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTywga2V5LCB2YWwsIHNhZmUpIHtcbiAgdmFyIGlzRnVuY3Rpb24gPSB0eXBlb2YgdmFsID09ICdmdW5jdGlvbic7XG4gIGlmIChpc0Z1bmN0aW9uKSBoYXModmFsLCAnbmFtZScpIHx8IGhpZGUodmFsLCAnbmFtZScsIGtleSk7XG4gIGlmIChPW2tleV0gPT09IHZhbCkgcmV0dXJuO1xuICBpZiAoaXNGdW5jdGlvbikgaGFzKHZhbCwgU1JDKSB8fCBoaWRlKHZhbCwgU1JDLCBPW2tleV0gPyAnJyArIE9ba2V5XSA6IFRQTC5qb2luKFN0cmluZyhrZXkpKSk7XG4gIGlmIChPID09PSBnbG9iYWwpIHtcbiAgICBPW2tleV0gPSB2YWw7XG4gIH0gZWxzZSBpZiAoIXNhZmUpIHtcbiAgICBkZWxldGUgT1trZXldO1xuICAgIGhpZGUoTywga2V5LCB2YWwpO1xuICB9IGVsc2UgaWYgKE9ba2V5XSkge1xuICAgIE9ba2V5XSA9IHZhbDtcbiAgfSBlbHNlIHtcbiAgICBoaWRlKE8sIGtleSwgdmFsKTtcbiAgfVxuLy8gYWRkIGZha2UgRnVuY3Rpb24jdG9TdHJpbmcgZm9yIGNvcnJlY3Qgd29yayB3cmFwcGVkIG1ldGhvZHMgLyBjb25zdHJ1Y3RvcnMgd2l0aCBtZXRob2RzIGxpa2UgTG9EYXNoIGlzTmF0aXZlXG59KShGdW5jdGlvbi5wcm90b3R5cGUsIFRPX1NUUklORywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nICYmIHRoaXNbU1JDXSB8fCAkdG9TdHJpbmcuY2FsbCh0aGlzKTtcbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanNcbi8vIG1vZHVsZSBpZCA9IDE4NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBTSEFSRUQgPSAnX19jb3JlLWpzX3NoYXJlZF9fJztcbnZhciBzdG9yZSA9IGdsb2JhbFtTSEFSRURdIHx8IChnbG9iYWxbU0hBUkVEXSA9IHt9KTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIHN0b3JlW2tleV0gfHwgKHN0b3JlW2tleV0gPSB2YWx1ZSAhPT0gdW5kZWZpbmVkID8gdmFsdWUgOiB7fSk7XG59KSgndmVyc2lvbnMnLCBbXSkucHVzaCh7XG4gIHZlcnNpb246IGNvcmUudmVyc2lvbixcbiAgbW9kZTogcmVxdWlyZSgnLi9fbGlicmFyeScpID8gJ3B1cmUnIDogJ2dsb2JhbCcsXG4gIGNvcHlyaWdodDogJ8KpIDIwMTggRGVuaXMgUHVzaGthcmV2ICh6bG9pcm9jay5ydSknXG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qc1xuLy8gbW9kdWxlIGlkID0gMTg3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDcuMS4xIFRvUHJpbWl0aXZlKGlucHV0IFssIFByZWZlcnJlZFR5cGVdKVxudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG4vLyBpbnN0ZWFkIG9mIHRoZSBFUzYgc3BlYyB2ZXJzaW9uLCB3ZSBkaWRuJ3QgaW1wbGVtZW50IEBAdG9QcmltaXRpdmUgY2FzZVxuLy8gYW5kIHRoZSBzZWNvbmQgYXJndW1lbnQgLSBmbGFnIC0gcHJlZmVycmVkIHR5cGUgaXMgYSBzdHJpbmdcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBTKSB7XG4gIGlmICghaXNPYmplY3QoaXQpKSByZXR1cm4gaXQ7XG4gIHZhciBmbiwgdmFsO1xuICBpZiAoUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKHR5cGVvZiAoZm4gPSBpdC52YWx1ZU9mKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIGlmICghUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gcHJpbWl0aXZlIHZhbHVlXCIpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qc1xuLy8gbW9kdWxlIGlkID0gMTg4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGRvY3VtZW50ID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuZG9jdW1lbnQ7XG4vLyB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0JyBpbiBvbGQgSUVcbnZhciBpcyA9IGlzT2JqZWN0KGRvY3VtZW50KSAmJiBpc09iamVjdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpcyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZG9tLWNyZWF0ZS5qc1xuLy8gbW9kdWxlIGlkID0gMjc5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgJiYgIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnZGl2JyksICdhJywgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH0gfSkuYSAhPSA3O1xufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qc1xuLy8gbW9kdWxlIGlkID0gMjgwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDE5LjEuMi43IC8gMTUuMi4zLjQgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbnZhciAka2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzLWludGVybmFsJyk7XG52YXIgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKS5jb25jYXQoJ2xlbmd0aCcsICdwcm90b3R5cGUnKTtcblxuZXhwb3J0cy5mID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhPKSB7XG4gIHJldHVybiAka2V5cyhPLCBoaWRkZW5LZXlzKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wbi5qc1xuLy8gbW9kdWxlIGlkID0gMjgxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wcy5qc1xuLy8gbW9kdWxlIGlkID0gMjgyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgYXJyYXlJbmRleE9mID0gcmVxdWlyZSgnLi9fYXJyYXktaW5jbHVkZXMnKShmYWxzZSk7XG52YXIgSUVfUFJPVE8gPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZXMpIHtcbiAgdmFyIE8gPSB0b0lPYmplY3Qob2JqZWN0KTtcbiAgdmFyIGkgPSAwO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBrZXk7XG4gIGZvciAoa2V5IGluIE8pIGlmIChrZXkgIT0gSUVfUFJPVE8pIGhhcyhPLCBrZXkpICYmIHJlc3VsdC5wdXNoKGtleSk7XG4gIC8vIERvbid0IGVudW0gYnVnICYgaGlkZGVuIGtleXNcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIGlmIChoYXMoTywga2V5ID0gbmFtZXNbaSsrXSkpIHtcbiAgICB+YXJyYXlJbmRleE9mKHJlc3VsdCwga2V5KSB8fCByZXN1bHQucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWtleXMtaW50ZXJuYWwuanNcbi8vIG1vZHVsZSBpZCA9IDI4M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgc2hhcmVkID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ2tleXMnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuL191aWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gc2hhcmVkW2tleV0gfHwgKHNoYXJlZFtrZXldID0gdWlkKGtleSkpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC1rZXkuanNcbi8vIG1vZHVsZSBpZCA9IDI4NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsID0gTWF0aC5jZWlsO1xudmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3RvLWludGVnZXIuanNcbi8vIG1vZHVsZSBpZCA9IDI4NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzLmYgPSByZXF1aXJlKCcuL193a3MnKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3drcy1leHQuanNcbi8vIG1vZHVsZSBpZCA9IDI4NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuXHRNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xuLy8gY3NzIGJhc2UgY29kZSwgaW5qZWN0ZWQgYnkgdGhlIGNzcy1sb2FkZXJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXNlU291cmNlTWFwKSB7XG5cdHZhciBsaXN0ID0gW107XG5cblx0Ly8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXHRsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHR2YXIgY29udGVudCA9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKTtcblx0XHRcdGlmKGl0ZW1bMl0pIHtcblx0XHRcdFx0cmV0dXJuIFwiQG1lZGlhIFwiICsgaXRlbVsyXSArIFwie1wiICsgY29udGVudCArIFwifVwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGNvbnRlbnQ7XG5cdFx0XHR9XG5cdFx0fSkuam9pbihcIlwiKTtcblx0fTtcblxuXHQvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXHRsaXN0LmkgPSBmdW5jdGlvbihtb2R1bGVzLCBtZWRpYVF1ZXJ5KSB7XG5cdFx0aWYodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpXG5cdFx0XHRtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCBcIlwiXV07XG5cdFx0dmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGlkID0gdGhpc1tpXVswXTtcblx0XHRcdGlmKHR5cGVvZiBpZCA9PT0gXCJudW1iZXJcIilcblx0XHRcdFx0YWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuXHRcdH1cblx0XHRmb3IoaSA9IDA7IGkgPCBtb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IG1vZHVsZXNbaV07XG5cdFx0XHQvLyBza2lwIGFscmVhZHkgaW1wb3J0ZWQgbW9kdWxlXG5cdFx0XHQvLyB0aGlzIGltcGxlbWVudGF0aW9uIGlzIG5vdCAxMDAlIHBlcmZlY3QgZm9yIHdlaXJkIG1lZGlhIHF1ZXJ5IGNvbWJpbmF0aW9uc1xuXHRcdFx0Ly8gIHdoZW4gYSBtb2R1bGUgaXMgaW1wb3J0ZWQgbXVsdGlwbGUgdGltZXMgd2l0aCBkaWZmZXJlbnQgbWVkaWEgcXVlcmllcy5cblx0XHRcdC8vICBJIGhvcGUgdGhpcyB3aWxsIG5ldmVyIG9jY3VyIChIZXkgdGhpcyB3YXkgd2UgaGF2ZSBzbWFsbGVyIGJ1bmRsZXMpXG5cdFx0XHRpZih0eXBlb2YgaXRlbVswXSAhPT0gXCJudW1iZXJcIiB8fCAhYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuXHRcdFx0XHRpZihtZWRpYVF1ZXJ5ICYmICFpdGVtWzJdKSB7XG5cdFx0XHRcdFx0aXRlbVsyXSA9IG1lZGlhUXVlcnk7XG5cdFx0XHRcdH0gZWxzZSBpZihtZWRpYVF1ZXJ5KSB7XG5cdFx0XHRcdFx0aXRlbVsyXSA9IFwiKFwiICsgaXRlbVsyXSArIFwiKSBhbmQgKFwiICsgbWVkaWFRdWVyeSArIFwiKVwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxpc3QucHVzaChpdGVtKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdHJldHVybiBsaXN0O1xufTtcblxuZnVuY3Rpb24gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtLCB1c2VTb3VyY2VNYXApIHtcblx0dmFyIGNvbnRlbnQgPSBpdGVtWzFdIHx8ICcnO1xuXHR2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG5cdGlmICghY3NzTWFwcGluZykge1xuXHRcdHJldHVybiBjb250ZW50O1xuXHR9XG5cblx0aWYgKHVzZVNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHZhciBzb3VyY2VNYXBwaW5nID0gdG9Db21tZW50KGNzc01hcHBpbmcpO1xuXHRcdHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG5cdFx0XHRyZXR1cm4gJy8qIyBzb3VyY2VVUkw9JyArIGNzc01hcHBpbmcuc291cmNlUm9vdCArIHNvdXJjZSArICcgKi8nXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKCdcXG4nKTtcblx0fVxuXG5cdHJldHVybiBbY29udGVudF0uam9pbignXFxuJyk7XG59XG5cbi8vIEFkYXB0ZWQgZnJvbSBjb252ZXJ0LXNvdXJjZS1tYXAgKE1JVClcbmZ1bmN0aW9uIHRvQ29tbWVudChzb3VyY2VNYXApIHtcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpO1xuXHR2YXIgZGF0YSA9ICdzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCwnICsgYmFzZTY0O1xuXG5cdHJldHVybiAnLyojICcgKyBkYXRhICsgJyAqLyc7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcbi8vIG1vZHVsZSBpZCA9IDI4N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBTcGVsbCBcInBhcnNlclwiIGNsYXNzLlxuLy9cblxuLy8gVE9ETzogZGVwZW5kZW5jeS1pbmplY3QgdG9rZW5pemVyP1xuaW1wb3J0IFRva2VuaXplciBmcm9tIFwiLi9Ub2tlbml6ZXIuanNcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuL1J1bGUuanNcIjtcbmltcG9ydCBwYXJzZVJ1bGUgZnJvbSBcIi4vUnVsZVN5bnRheC5qc1wiO1xuaW1wb3J0IHsgY2xvbmVDbGFzcyB9IGZyb20gXCIuL3V0aWxzL2NsYXNzLmpzXCI7XG5cbi8vIEdSUlIuLi4gd2lsbCBTT01FT05FIG9uIHRoZSBub2RlIHRlYW0gcGxlYXNlIGltcGxlbWVudCBjb25zb2xlLmdyb3VwID8/P1xuaWYgKCFjb25zb2xlLmdyb3VwKSBjb25zb2xlLmdyb3VwID0gY29uc29sZS5sb2c7XG5pZiAoIWNvbnNvbGUuZ3JvdXBFbmQpIGNvbnNvbGUuZ3JvdXBFbmQgPSBjb25zb2xlLmxvZztcblxuLy8gRXJyb3Igd2UnbGwgdGhyb3cgZm9yIHByb2JsZW1zIHdoZW4gcGFyc2luZy5cbi8vIFVzZXMgYSBzcGVjaWZpYyB0eXBlIHNvIHdlIGNhbiBjaGVjayBmb3IgaXQgaW4gdGVzdHMuXG5leHBvcnQgZnVuY3Rpb24gUGFyc2VFcnJvciguLi5hcmdzKSB7XG4gIEVycm9yLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIFBhcnNlRXJyb3IpO1xufVxuUGFyc2VFcnJvci5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VyIHtcblx0Ly8gU2V0IHRvIGB0cnVlYCB0byBvdXRwdXQgZGVidWcgaW5mbyB3aGlsZSBhZGRpbmcgcnVsZXNcblx0c3RhdGljIERFQlVHID0gZmFsc2U7XG5cblx0Ly8gU2hvdWxkIHdlIHdhcm4gYWJvdXQgYW5vbWFsb3VzIGNvbmRpdGlvbnM/XG5cdHN0YXRpYyBXQVJOID0gZmFsc2U7XG5cblx0Ly8gU2V0IHRvIGB0cnVlYCB0byBvdXRwdXQgdGltaW5nIGluZm8uXG5cdHN0YXRpYyBUSU1FID0gZmFsc2U7XG5cbiAgLy8gQWRkIHRvIFBhcnNlciBjb25zb2xlIGRlYnVnZ2luZ1xuICBzdGF0aWMgUGFyc2VFcnJvciA9IFBhcnNlRXJyb3I7XG5cblx0Ly8gQ29uc3RydWN0b3IuXG5cdGNvbnN0cnVjdG9yKHByb3BlcnRpZXMpIHtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIHByb3BlcnRpZXMpO1xuXHR9XG5cbi8vXG4vLyMjIyBQYXJzaW5nXG4vL1xuXHQvLyBQYXJzZSBgcnVsZU5hbWVgIHJ1bGUgYXQgaGVhZCBvZiBgdGV4dGAuXG5cdC8vIElmIHlvdSBwYXNzIG9ubHkgb25lIGFyZ3VtZW50LCB3ZSdsbCBhc3N1bWUgdGhhdCdzIGB0ZXh0YCBhbmQgeW91IHdhbnQgdG8gbWF0Y2ggYHN0YXRlbWVudHNgLlxuXHQvLyBIYW5kbGVzIG9wdGlvbmFsIGFuZCByZXBlYXRpbmcgcnVsZXMgYXMgd2VsbCBhcyBlYXRpbmcgd2hpdGVzcGFjZS5cblx0Ly8gUmV0dXJucyByZXN1bHQgb2YgcGFyc2UuXG4vL1RFU1RNRVxuXHRwYXJzZShydWxlTmFtZSwgdGV4dCkge1xuXHRcdC8vIElmIG9ubHkgb25lIGFyZ3VtZW50LCBhc3N1bWUgdGhhdCdzIHRoZSB0ZXh0IGFuZCBwYXJzZSBgc3RhdGVtZW50c2Bcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0dGV4dCA9IHJ1bGVOYW1lO1xuXHRcdFx0cnVsZU5hbWUgPSBcInN0YXRlbWVudHNcIjtcblx0XHR9XG5cblx0XHQvLyBDb252ZXJ0IHRvIHRva2Vucy5cblx0XHRpZiAoUGFyc2VyLlRJTUUpIGNvbnNvbGUudGltZShcInRva2VuaXplXCIpO1xuXHRcdGxldCB0b2tlbnMgPSBUb2tlbml6ZXIudG9rZW5pemUodGV4dCk7XG5cdFx0Ly8gZWF0IG5vbi1pbmRlbnQgd2hpdGVzcGFjZSAoc2luY2Ugd2UgaWdub3JlIGl0KVxuXHRcdHRva2VucyA9IHRva2Vucy5maWx0ZXIodG9rZW4gPT4gIVRva2VuaXplci5pc05vcm1hbFdoaXRlc3BhY2UodG9rZW4pKTtcblx0XHRpZiAoUGFyc2VyLlRJTUUpIGNvbnNvbGUudGltZUVuZChcInRva2VuaXplXCIpO1xuXG5cdFx0Ly8gQmFpbCBpZiB3ZSBkaWRuJ3QgZ2V0IGFueSB0b2tlbnMgYmFjay5cblx0XHRpZiAoIXRva2VucyB8fCB0b2tlbnMubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0aWYgKFBhcnNlci5USU1FKSBjb25zb2xlLnRpbWUoXCJwYXJzZVwiKTtcblx0XHQvLyBJZiB3ZSdyZSBub3QgcGFyc2luZyBgc3RhdGVtZW50c2AsIGVhdCB3aGl0ZXNwYWNlIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmUuXG5cdFx0aWYgKHJ1bGVOYW1lICE9PSBcInN0YXRlbWVudHNcIikge1xuXHRcdFx0dG9rZW5zID0gVG9rZW5pemVyLnJlbW92ZUxlYWRpbmdXaGl0ZXNwYWNlKHRva2Vucyk7XG5cdFx0fVxuXG5cdFx0Ly8gUGFyc2UgdGhlIHJ1bGUgb3IgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIHJ1bGUgbm90IGZvdW5kLlxuXHRcdGxldCByZXN1bHQgPSB0aGlzLnBhcnNlTmFtZWRSdWxlKHJ1bGVOYW1lLCB0b2tlbnMsIDAsIHRva2Vucy5sZW5ndGgsIHVuZGVmaW5lZCwgXCJwYXJzZXIucGFyc2UoKVwiKTtcblx0XHRpZiAoUGFyc2VyLlRJTUUpIGNvbnNvbGUudGltZUVuZChcInBhcnNlXCIpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXG5cblx0Ly8gUGFyc2UgYHRleHRgIGFuZCByZXR1cm4gdGhlIHJlc3VsdGluZyBzb3VyY2UgY29kZS5cblx0Ly9cdC0gaWYgb25lIHN0cmluZyBhcmd1bWVudCwgY29tcGlsZXMgYXMgXCJzdGF0ZW1lbnRzXCJcblx0Ly8gVGhyb3dzIGlmIG5vdCBwYXJzZWFibGUuXG4vL1RFU1RNRVxuXHRjb21waWxlKHJ1bGVOYW1lLCB0ZXh0KSB7XG5cdFx0Ly8gSWYgb25seSBvbmUgYXJndW1lbnQsIGFzc3VtZSB0aGF0J3MgdGhlIHRleHQgYW5kIHBhcnNlIGBzdGF0ZW1lbnRzYFxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHR0ZXh0ID0gcnVsZU5hbWU7XG5cdFx0XHRydWxlTmFtZSA9IFwic3RhdGVtZW50c1wiO1xuXHRcdH1cblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5wYXJzZShydWxlTmFtZSwgdGV4dCk7XG5cdFx0aWYgKCFyZXN1bHQpIHtcblx0XHQgIHRocm93IG5ldyBQYXJzZUVycm9yKGBwYXJzZXIucGFyc2UoJyR7cnVsZU5hbWV9JywgJyR7dGV4dH0nKTogY2FuJ3QgcGFyc2UgdGV4dGApO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0LnRvU291cmNlKHRoaXMpO1xuXHR9XG5cblxuXHQvLyBQYXJzZSBhIG5hbWVkIHJ1bGUgKGRlZmluZWQgaW4gdGhpcyBwYXJzZXIgb3IgaW4gYW55IG9mIG91ciBgaW1wb3J0c2ApLCByZXR1cm5pbmcgdGhlIFwiYmVzdFwiIG1hdGNoLlxuXHQvLyBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIG5vIG1hdGNoLlxuXHQvLyBUaHJvd3MgaWYgcnVsZSBpcyBub3QgaW1wbGVtZW50ZWQuXG5cdHBhcnNlTmFtZWRSdWxlKHJ1bGVOYW1lLCB0b2tlbnMsIHN0YXJ0LCBlbmQsIHN0YWNrLCBjYWxsaW5nQ29udGV4dCA9IFwicGFyc2VOYW1lZFJ1bGVcIikge1xuICAgIGNvbnN0IHJ1bGUgPSB0aGlzLnJ1bGVzW3J1bGVOYW1lXTtcblx0XHRpZiAoIXJ1bGUpIHRocm93IG5ldyBQYXJzZUVycm9yKGAke2NhbGxpbmdDb250ZXh0fTogcnVsZSAnJHtydWxlTmFtZX0nIG5vdCBmb3VuZGApO1xuICAgIHJldHVybiBydWxlLnBhcnNlKHRoaXMsIHRva2Vucywgc3RhcnQsIGVuZCwgc3RhY2spO1xuXHR9XG5cblx0Ly8gVGVzdCB3aGV0aGVyIGEgcnVsZSAod2hpY2ggbWF5IGJlIHNwZWNpZmllZCBieSBuYW1lKSBNSUdIVCBiZSBmb3VuZCBpbiBoZWFkIG9mIHN0cmVhbS5cblx0Ly8gUmV0dXJuczpcblx0Ly9cdC0gYHRydWVgIGlmIHRoZSBydWxlIE1JR0hUIGJlIG1hdGNoZWQuXG5cdC8vXHQtIGBmYWxzZWAgaWYgdGhlcmUgaXMgTk8gV0FZIHRoZSBydWxlIGNhbiBiZSBtYXRjaGVkLlxuXHQvL1x0LSBgdW5kZWZpbmVkYCBpZiBub3QgZGV0ZXJtaW5zdGljIChlZzogbm8gd2F5IHRvIHRlbGwgcXVpY2tseSkuXG5cdHRlc3QocnVsZSwgdG9rZW5zLCBzdGFydCwgZW5kKSB7XG5cdCAgaWYgKHR5cGVvZiBydWxlID09PSBcInN0cmluZ1wiKSB7XG5cdCAgICBydWxlID0gdGhpcy5ydWxlc1tydWxlXTtcblx0ICAgIGlmICghcnVsZSkgcmV0dXJuIHVuZGVmaW5lZDsgICAgLy8gVE9ETzogdGhyb3c/XG5cdCAgfVxuXHQgIHJldHVybiBydWxlLnRlc3QodGhpcywgdG9rZW5zLCBzdGFydCwgZW5kKTtcblx0fVxuXG5cbi8vXG4vLyAjIyMgXHRJbXBvcnRzXG4vL1x0XHRQYXJzZXJzIGNhbiBkZXBlbmQgb24gb3RoZXIgcGFyc2VycyBmb3IgYWRkaXRpb25hbCBgcnVsZXNgLlxuLy9cdFx0SW1wb3J0cyBhcmUgbGF6eS1ib3VuZCBpbnRvIGBwYXJzZXIucnVsZXNgIGFzIG5lY2Vzc2FyeS5cbi8vICAgIFdlIGFzc3VtZSB0aGUgdG9wLWxldmVsIHBhcnNlciBmb3IgYSBsYW5ndWFnZSB3aWxsIGluY2x1ZGUgYWxsIG5lY2Vzc2FyeSBpbXBvcnRzIGF1dG9tYXRpY2FsbHkuXG4vL1xuXG5cdC8vIEFkZCBvbmUgb3IgbW9yZSBuYW1lZCBpbXBvcnRzIHRvIHRoaXMgcGFyc2VyLlxuXHQvLyBJbXBvcnRzIGluY3JlYXNlIGluIHByaW9yaXR5IHRoZSBsYXRlciB0aGV5IGFyZSBpbiB0aGUgbGlzdC5cbiAgaW1wb3J0cyA9IFtdO1xuXHRpbXBvcnQoLi4uaW1wb3J0cykge1xuXHRcdC8vIFJFVkVSU0UgdGhlIGxpc3Qgb2YgaW1wb3J0cywgc28gdGhlIG1vc3QgZ2VuZXJhbCBvbmUgaXMgTEFTVFxuXHRcdC8vIFRodXMgbW9yZSBzcGVjaWZpYyBpbXBvcnRzIHdpbGwgYmUgRUFSTElFUiBpbiB0aGUgYGltcG9ydHNgIGxpc3QuXG5cblx0XHQvLyBDcmVhdGUgbmV3IGFycmF5IG9mIGltcG9ydHMgYW5kIGFkZCBpbXBvcnQgbmFtZXMgcGFzc2VkIGluLlxuXHRcdHRoaXMuaW1wb3J0cyA9IGltcG9ydHMucmV2ZXJzZSgpLmNvbmNhdCh0aGlzLmltcG9ydHMpO1xuXG5cdFx0Ly8gY2xlYXIgY29uY2F0ZW5hdGVkIGxpc3Qgb2YgcnVsZXMgc28gd2UnbGwgcmVjYWN1bGF0ZSBpbiBgcGFyc2VyLnJ1bGVzYFxuXHRcdGRlbGV0ZSB0aGlzLl9fcnVsZXM7XG5cdH1cblxuLy9cbi8vICMjIyBSdWxlc1xuLy8gICAgTGlzdCBvZiBhbGwga25vd24gcnVsZXMgZm9yIHRoaXMgcGFyc2VyLlxuLy8gICAgWW91IGNhbiBhY2Nlc3MgbmFtZWQgcnVsZXMgYXMgYHBhcnNlci5ydWxlc1tcInJ1bGVOYW1lXCJdYFxuLy9cblx0Ly8gU3RhcnQgd2l0aCBhbiBlbXB0eSBtYXAgb2YgcnVsZXMuXG5cdF9ydWxlcyA9IHt9O1xuXG5cdC8vIFJldHVybiBtYXAgb2YgYWxsIGtub3duIHJ1bGVzIGJ5IHJ1bGUgbmFtZSwgaW5jbHVkaW5nIHJ1bGVzIGRlZmluZWQgaW4gb3VyIGltcG9ydHMuXG5cdC8vIE5PVEU6IFdlIG1lbW9pemUgdGhpcywgc28gbWFrZSBzdXJlIHRvIGNsZWFyIGBfX3J1bGVzYCBpZiB5b3UncmUgbWFuaXB1bGF0aW5nIHJ1bGVzIG9yIGltcG9ydHMhXG5cdGdldCBydWxlcygpIHtcblx0XHRpZiAoIXRoaXMuX19ydWxlcykge1xuXHRcdFx0Y29uc3Qgb3V0cHV0ID0gdGhpcy5fX3J1bGVzID0ge307XG5cdFx0XHQvLyBHZXQgYWxsIGltcG9ydGVkIHBhcnNlcnMsIHdpdGggdXMgbGFzdFxuXHRcdFx0Y29uc3QgaW1wb3J0cyA9IFt0aGlzXS5jb25jYXQodGhpcy5pbXBvcnRzLm1hcChQYXJzZXIuZm9yTW9kdWxlKSk7XG5cblx0XHRcdC8vIEZvciBlYWNoIHBhcnNlclxuXHRcdFx0aW1wb3J0cy5mb3JFYWNoKHBhcnNlciA9PiB7XG5cdFx0XHRcdGZvciAoY29uc3QgcnVsZU5hbWUgaW4gcGFyc2VyLl9ydWxlcykge1xuXHRcdFx0XHQgIFBhcnNlci5tZXJnZVJ1bGUob3V0cHV0LCBydWxlTmFtZSwgcGFyc2VyLl9ydWxlc1tydWxlTmFtZV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX19ydWxlcztcblx0fVxuXG5cdC8vIEFkZCBhIGBydWxlYCB0byBvdXIgbGlzdCBvZiBydWxlcyFcblx0Ly8gQ29udmVydHMgdG8gYGFsdGVybmF0aXZlc2Agb24gcmUtZGVmaW5pbmcgdGhlIHNhbWUgcnVsZS5cblx0YWRkUnVsZShydWxlTmFtZSwgcnVsZSkge1xuXHRcdC8vIENsZWFyIG1lbW9pemVkIGBfX3J1bGVzYCBzbyB3ZSdsbCByZWNhbGN1bGF0ZSBgcGFyc2VyLnJ1bGVzYCBhcyBuZWNlc3Nhcnlcblx0XHRkZWxldGUgdGhpcy5fX3J1bGVzO1xuXG5cdFx0Ly8gSWYgcGFzc2VkIGEgZnVuY3Rpb24sIGNyZWF0ZSBhbiBpbnN0YW5jZSBmb3IgdGhlIGFjdHVhbCBydWxlLlxuXHRcdC8vIFRoaXMgaXMgY29tbW9ubHkgZG9uZSBzbyBKUyB3aWxsIGdpdmUgdXMgbWVhbmluZ2Z1bCBjbGFzcyBuYW1lcyBpbiBkZWJ1ZyBvdXRwdXQuXG5cdFx0aWYgKHR5cGVvZiBydWxlID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdHJ1bGUgPSBuZXcgcnVsZSgpO1xuXHRcdH1cblxuXHRcdC8vIElmIHdlIGdvdCBhbiBhcnJheSBvZiBgcnVsZU5hbWVgcywgcmVjdXJzaXZlbHkgYWRkIHVuZGVyIGVhY2ggbmFtZSB3aXRoIHRoZSBzYW1lIGBydWxlYC5cblx0XHRpZiAoQXJyYXkuaXNBcnJheShydWxlTmFtZSkpIHtcblx0XHRcdHJ1bGVOYW1lLmZvckVhY2gocnVsZU5hbWUgPT4gdGhpcy5hZGRSdWxlKHJ1bGVOYW1lLCBydWxlKSApO1xuXHRcdFx0cmV0dXJuIHJ1bGU7XG5cdFx0fVxuXG5cdFx0Ly8gQWRkIHRvIG91ciBsaXN0IG9mIF9ydWxlc1xuXHRcdFBhcnNlci5tZXJnZVJ1bGUodGhpcy5fcnVsZXMsIHJ1bGVOYW1lLCBydWxlKTtcblx0XHRyZXR1cm4gcnVsZTtcblx0fVxuXG5cdC8vIFJldHVybiB0aGUgY29uY2F0ZW5hdGVkIGJsYWNrbGlzdCBmb3IgYSBnaXZlbiBuYW1lZCBydWxlLlxuXHRnZXRCbGFja2xpc3QocnVsZU5hbWUpIHtcblx0ICBjb25zdCBydWxlID0gdGhpcy5ydWxlc1tydWxlTmFtZV07XG5cdCAgY29uc3QgcnVsZXMgPSBydWxlIGluc3RhbmNlb2YgUnVsZS5BbHRlcm5hdGl2ZXNcbiAgICAgICAgICA/IHJ1bGUucnVsZXNcbiAgICAgICAgICA6IFsgcnVsZSBdO1xuXHRcdHJldHVybiBydWxlcy5yZWR1Y2UoZnVuY3Rpb24gKGJsYWNrbGlzdCwgcnVsZSkge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oYmxhY2tsaXN0LCBydWxlLmJsYWNrbGlzdCk7XG5cdFx0fSwge30pO1xuXHR9XG5cbiAgLy8gRGVmaW5lIG11bHRpcGxlIHJ1bGVzIGF0IG9uY2UgdXNpbmcgcnVsZVN5bnRheC5cbiAgLy8gU2VlIGBSdWxlU3ludGF4LmpzOjpkZWZpbmVSdWxlKClgXG4gIGRlZmluZVJ1bGVzKCkge1xuICAgIGZvciAoY29uc3QgcnVsZSBvZiBhcmd1bWVudHMpIHtcbiAgICAgIHRoaXMuZGVmaW5lUnVsZShydWxlKTtcbiAgICB9XG4gIH1cblxuICAvLyBEZWZpbmUgYSBydWxlIHVzaW5nIChydWxlKWBzeW50YXhgIG9yIGBwYXR0ZXJuc2AgdG8gY3JlYXRlIHRoZSBydWxlIGluc3RhbmNlcy5cbiAgLy8gIGBuYW1lYCAoaWRlbnRpZmllciwgcmVxdWlyZWQpICBCYXNlIG5hbWUgb2YgdGhlIHJ1bGUuXG4gIC8vICBgYWxpYXNgIChzdHJpbmcgb3IgW3N0cmluZ10sIG9wdGluYWwpIE90aGVyIG5hbWVzIHRvIGRlZmluZSBydWxlIHVuZGVyLlxuICAvLyAgYGNhbm9uaWNhbGAgKHN0cmluZywgb3B0aW9uYWwpIENhbm9uaWNhbCBuYW1lIGZvciB0aGUgcnVsZSwgYXZhaWxhYmxlIG9uIGBSdWxlYCBmb3IgZGVidWdnaW5nLlxuICAvLyAgYGNvbnN0cnVjdG9yYCAoY2xhc3MsIHJlcXVpcmVkKSBDbGFzcyB3aGljaCB3aWxsIGJlIHVzZWQgdG8gaW5zdGFudGlhdGUgdGhlIHJ1bGUuXG4gIC8vICBgc3ludGF4YCAoc3RyaW5nLCByZXF1aXJlZCkgUnVsZVN5bnRheCBzdHJpbmcgZm9yIHRoaXMgcnVsZS5cbiAgLy8gIGBwYXR0ZXJuYCAoUmVnRXhwLCBvcHRpb25hbCkgUmVndWxhciBleHByZXNzaW9uIGZvciBgUGF0dGVybmAgcnVsZXNcbiAgLy8gIGBwcmVjZWRlbmNlYCAobnVtYmVyLCBvcHRpb25hbCkgUHJlY2VkZW5jZSBudW1iZXIgZm9yIHRoZSBydWxlIChjdXJyZW50bHkgZG9lc24ndCBkbyBhbnl0aGluZylcbiAgLy8gIGBibGFja2xpc3RgIChbc3RyaW5nXSwgb3B0aW9uYWwpIEFycmF5IG9mIHN0cmluZ3MgYXMgYmxhY2tsaXN0IGZvciBwYXR0ZXJuIHJ1bGVzLlxuICAvLyAgYGxlZnRSZWN1cnNpdmUnIChib29sZWFuLCBvcHRpb25hbCkgU2V0IHRvIGB0cnVlYCBpZiB0aGUgcnVsZSBpcyBsZWZ0LXJlY3Vyc2l2ZSxcbiAgLy8gICAgaS5lLiBpdCBjYWxscyBpdHNlbGYgYXMgYSBzdWJydWxlIGJlZm9yZSBtYXRjaGluZyBhbnkgbGl0ZXJhbCB0b2tlbnNcbiAgLy8gIGB0ZXN0UnVsZWAgKFJ1bGUgb3Igc3RyaW5nLCBvcHRpb25hbCkgUnVsZSBvciBydWxlIG5hbWUgdG8gdXNlIGFzIGEgdGVzdCBydWxlXG4gIC8vICAgIHNwZWNpZnlpbmcgdGhpcyBjYW4gbGV0IHVzIGp1bXAgb3V0IHF1aWNrbHkgaWYgdGhlcmUgaXMgbm8gcG9zc2libGUgbWF0Y2hcbiAgLy9cbiAgLy8gTm90ZSB0aGF0IHdlIG11bmdlIHRoZSBgY29uc3RydWN0b3JgIHBhc3NlZCBpbiBmb3IgZWZmaWNpZW5jeSB3aGlsZSBwYXJzaW5nLlxuICBkZWZpbmVSdWxlKHsgY29uc3RydWN0b3IsIC4uLnByb3BzIH0pIHtcbiAgICAvLyB0aHJvdyBpZiByZXF1aXJlZCBwYXJhbXMgbm90IHByb3ZpZGVkXG4gICAgaWYgKCFjb25zdHJ1Y3RvciB8fCAhcHJvcHMubmFtZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgcGFyc2VyLmRlZmluZSgpOiBZb3UgbXVzdCBwYXNzICdjb25zdHJ1Y3RvcicgYW5kICduYW1lJ2ApO1xuICAgIH1cbiAgICAvLyB0aHJvdyBpZiB3ZSdyZSByZS11c2luZyBhIGNvbnN0cnVjdG9yXG4gICAgaWYgKGNvbnN0cnVjdG9yLnByb3RvdHlwZS5uYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBwYXJzZXIuZGVmaW5lKCk6IEF0dGVtcHRpbmcgdG8gcmUtdXNlIGNvbnN0cnVjdG9yIGZvciBydWxlICcke3J1bGVOYW1lfSdgKTtcbiAgICB9XG5cbiAgICAvLyBOb3RlIHRoZSBtb2R1bGUgdGhhdCB0aGUgcnVsZSB3YXMgZGVmaW5lZCBpblxuICAgIGlmICh0aGlzLm1vZHVsZSkgcHJvcHMubW9kdWxlID0gdGhpcy5tb2R1bGU7XG5cbiAgICAvLyBJZiB3ZSdyZSBhIFwiY2Fub25pY2FsXCIgcnVsZSwgc2V0IG9uIFJ1bGUuXG4gICAgLy8gVXNlIHRoaXMgaWYgeW91IHdhbnQgdG8gY2hlY2sgdGhlIHR5cGUgb2YgYSBydWxlIGluIGEgdGVzdCBvciBzb21ldGhpbmcuXG4gICAgaWYgKHByb3BzLmNhbm9uaWNhbCkgUnVsZVtwcm9wcy5jYW5vbmljYWxdID0gY29uc3RydWN0b3I7XG5cbiAgICAvLyBDb252ZXJ0IGJsYWNrbGlzdCBmcm9tIGxpc3Qgb2Ygc3RyaW5ncyB0byBhIG1hcFxuICAgIGlmIChwcm9wcy5ibGFja2xpc3QgJiYgQXJyYXkuaXNBcnJheShwcm9wcy5ibGFja2xpc3QpKSB7XG4gICAgICBjb25zdCBtYXAgPSB7fTtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIHByb3BzLmJsYWNrbGlzdCkgbWFwW2tleV0gPSB0cnVlO1xuICAgICAgcHJvcHMuYmxhY2tsaXN0ID0gbWFwO1xuICAgIH1cblxuICAgIC8vIEFkZCBwcm9wcyB0byB0aGUgY29udHJ1Y3RvciBwcm90b3lwZSBub24tZW51bWVyYWJseSBhbmQgbm9uLXdyaXRhYmx5XG4gICAgLy8gIHNvIHdlJ2xsIGdldCBhbiBlcnJvciBpZiBzb21ldGhpbmcgdHJpZXMgdG8gb3ZlcndyaXRlIHRoZW0uXG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMocHJvcHMpKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IucHJvdG90eXBlLCBrZXksIHsgdmFsdWU6IHByb3BzW2tleV0gfSk7XG4gICAgfVxuXG4gICAgLy8gQ29tYmluZSBhbGlhc2VzIHdpdGggdGhlIG1haW4gbmFtZVxuICAgIGNvbnN0IG5hbWVzID0gW3Byb3BzLm5hbWVdLmNvbmNhdChwcm9wcy5hbGlhcyB8fCBbXSk7XG5cbiAgICAvLyBJbnN0YW50aWF0ZSBvciBwYXJzZSB0byBjcmVhdGUgcnVsZXMgdG8gd29yayB3aXRoXG4gICAgY29uc3QgcnVsZXMgPSBwcm9wcy5zeW50YXhcbiAgICAgID8gcGFyc2VSdWxlKHByb3BzLnN5bnRheCwgY29uc3RydWN0b3IpXG4gICAgICA6IFsgbmV3IGNvbnN0cnVjdG9yKCkgXVxuICAgIGlmICghcnVsZXMpIHRocm93IG5ldyBQYXJzZUVycm9yKGBkZWZpbmVSdWxlKCR7cHJvcHMuc3ludGF4fSk6IGRpZG50IGdldCBydWxlcyBiYWNrYCk7XG5cbiAgICAvLyBTb21ldGltZXMgYHBhcnNlUnVsZWAgd2lsbCBnaXZlIHVzIGFuIGFycmF5IGJhY2ssIG5vcm1hbGl6ZSB0byBhbHdheXMgaGF2ZSBhbiBhcnJheVxuICAgIHJ1bGVzLmZvckVhY2gocnVsZSA9PiB0aGlzLmFkZFJ1bGUobmFtZXMsIHJ1bGUpKTtcblxuICAgIC8vIGlmIHRlc3RzIHdlcmUgZGVmaW5lZCwgbWFyayBvbmx5IGFzIHRlc3RhYmxlXG4gICAgaWYgKHByb3BzLnRlc3RzKSB7XG4gICAgICAvLyAob25seSB1c2UgdGhlIGZpcnN0IHJ1bGUgaWYgd2UgZ290IG1vcmUgdGhhbiBvbmUpXG4gICAgICB0aGlzLmFkZFJ1bGUoXCJfdGVzdGFibGVfXCIsIHJ1bGVzWzBdKTtcbiAgICB9XG4gIH1cblxuXG4vL1xuLy8gIyMjIFBhcnNlciByZWdpc3RyeS5cbi8vXG5cdHN0YXRpYyBSRUdJU1RSWSA9IHt9O1xuXG5cdC8vIEdldCBhIHBhcnNlciBmb3IgYSBnaXZlbiBgY29udGV4dE5hbWVgLlxuXHQvLyBXaWxsIHJlLXVzZSBleGlzdGluZyBwYXJzZXIsIG9yIGNyZWF0ZSBhIG5ldyBvbmUgaWYgbm90IGFscmVhZHkgZGVmaW5lZC5cblx0c3RhdGljIGZvck1vZHVsZShtb2R1bGUpIHtcblx0XHRpZiAoIVBhcnNlci5SRUdJU1RSWVttb2R1bGVdKSB7XG5cdFx0XHRQYXJzZXIuUkVHSVNUUllbbW9kdWxlXSA9IG5ldyBQYXJzZXIoeyBtb2R1bGUgfSk7XG5cdFx0fVxuXHRcdHJldHVybiBQYXJzZXIuUkVHSVNUUllbbW9kdWxlXTtcblx0fVxuXG5cbi8vXG4vLyAjIyBVdGlsaXR5IG1ldGhvZHNcbi8vXG5cbiAgLy8gTWVyZ2UgYHJ1bGVgIGludG8gYG1hcGAgb2YgcnVsZXMgYnkgYHJ1bGVOYW1lYC5cbiAgLy8gSWYgd2UgYWxyZWFkeSBoYXZlIGEgcnVsZSB3aXRoIHRoYXQgbmFtZSwgd2UnbGwgYWRkIGl0IGFzIGFuIGFsdGVybmF0aXZlLlxuLy9URVNUTUVcbiAgc3RhdGljIG1lcmdlUnVsZShtYXAsIHJ1bGVOYW1lLCBydWxlKSB7XG4gICAgbGV0IGV4aXN0aW5nID0gbWFwW3J1bGVOYW1lXTtcbiAgICBpZiAoIWV4aXN0aW5nKSB7XG4gICAgICBtYXBbcnVsZU5hbWVdID0gcnVsZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIShleGlzdGluZyBpbnN0YW5jZW9mIFJ1bGUuQWx0ZXJuYXRpdmVzKSB8fCAoZXhpc3RpbmcuZ3JvdXAgIT09IHJ1bGVOYW1lKSkge1xuICAgICAgY29uc3QgYWx0Q29uc3RydWN0b3IgPSBjbG9uZUNsYXNzKFJ1bGUuQWx0ZXJuYXRpdmVzLCBydWxlTmFtZSk7XG4gICAgICBleGlzdGluZyA9IG1hcFtydWxlTmFtZV0gPSBuZXcgYWx0Q29uc3RydWN0b3Ioe1xuICAgICAgICBncm91cDogcnVsZU5hbWUsXG4gICAgICAgIHJ1bGVzOiBbIGV4aXN0aW5nIF1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChydWxlIGluc3RhbmNlb2YgUnVsZS5BbHRlcm5hdGl2ZXMgJiYgKHJ1bGUuZ3JvdXAgPT09IHJ1bGVOYW1lKSkge1xuICAgICAgZXhpc3RpbmcuYWRkUnVsZSguLi5ydWxlLnJ1bGVzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBleGlzdGluZy5hZGRSdWxlKHJ1bGUpO1xuICAgIH1cbiAgfVxuXG5cdC8vIEZpbmQgdGhlIG1hdGNoaW5nIGluc3RhbmNlIG9mIChwb3NzaWJseSBuZXN0ZWQpIGBlbmRUb2tlbmAgdG8gYmFsYW5jZSBgc3RhcnRUb2tlbmBcblx0Ly9cdGluIGFycmF5IG9mIGB0b2tlbnNgIChzdHJpbmdzKS5cblx0Ly8gSWYgc3VjY2Vzc2Z1bCwgcmV0dXJucyBgeyBzdGFydCwgZW5kLCBzbGljZSB9YFxuXHQvLyBUaHJvd3MgaWYgdW5zdWNlc3NmdWwuXG5cdHN0YXRpYyBmaW5kTmVzdGVkVG9rZW5zKHRva2Vucywgc3RhcnRUb2tlbiwgZW5kVG9rZW4sIHN0YXJ0ID0gMCkge1xuXHRcdGlmICh0b2tlbnNbc3RhcnRdICE9PSBzdGFydFRva2VuKSB0aHJvdyBuZXcgUGFyc2VFcnJvcihgRXhwZWN0ZWQgJyR7c3RhcnRUb2tlbn0nIGF0IGluZGV4ICR7c3RhcnR9IG9mIHRva2Vuc2ApO1xuXHRcdGxldCBuZXN0aW5nID0gMDtcblx0XHRsZXQgbmVzdGVkID0gZmFsc2U7XG5cdFx0Zm9yIChsZXQgZW5kID0gc3RhcnQgKyAxLCBsYXN0SW5kZXggPSB0b2tlbnMubGVuZ3RoOyBlbmQgPCBsYXN0SW5kZXg7IGVuZCsrKSB7XG5cdFx0XHRsZXQgdG9rZW4gPSB0b2tlbnNbZW5kXTtcblx0XHRcdGlmICh0b2tlbiA9PT0gc3RhcnRUb2tlbikge1xuXHRcdFx0XHRuZXN0aW5nKys7XG5cdFx0XHRcdG5lc3RlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAodG9rZW4gPT09IGVuZFRva2VuKSB7XG5cdFx0XHRcdGlmIChuZXN0aW5nID09PSAwKVxuXHRcdFx0XHRcdHJldHVybiB7IHN0YXJ0LCBlbmQsIHNsaWNlOiB0b2tlbnMuc2xpY2Uoc3RhcnQrMSwgZW5kKSwgbmVzdGVkIH07XG5cdFx0XHRcdG5lc3RpbmctLTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhyb3cgbmV3IFBhcnNlRXJyb3IoYENvdWxkbid0IGZpbmQgbWF0Y2hpbmcgJyR7ZW5kVG9rZW59J3Mgc3RhcnRpbmcgYXQgaXRlbSAke3N0YXJ0fWApO1xuXHR9XG59XG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9QYXJzZXIuanMiLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxMy1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIHZhciBSRUFDVF9FTEVNRU5UX1RZUEUgPSAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIFN5bWJvbC5mb3IgJiZcbiAgICBTeW1ib2wuZm9yKCdyZWFjdC5lbGVtZW50JykpIHx8XG4gICAgMHhlYWM3O1xuXG4gIHZhciBpc1ZhbGlkRWxlbWVudCA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgb2JqZWN0ICE9PSBudWxsICYmXG4gICAgICBvYmplY3QuJCR0eXBlb2YgPT09IFJFQUNUX0VMRU1FTlRfVFlQRTtcbiAgfTtcblxuICAvLyBCeSBleHBsaWNpdGx5IHVzaW5nIGBwcm9wLXR5cGVzYCB5b3UgYXJlIG9wdGluZyBpbnRvIG5ldyBkZXZlbG9wbWVudCBiZWhhdmlvci5cbiAgLy8gaHR0cDovL2ZiLm1lL3Byb3AtdHlwZXMtaW4tcHJvZFxuICB2YXIgdGhyb3dPbkRpcmVjdEFjY2VzcyA9IHRydWU7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9mYWN0b3J5V2l0aFR5cGVDaGVja2VycycpKGlzVmFsaWRFbGVtZW50LCB0aHJvd09uRGlyZWN0QWNjZXNzKTtcbn0gZWxzZSB7XG4gIC8vIEJ5IGV4cGxpY2l0bHkgdXNpbmcgYHByb3AtdHlwZXNgIHlvdSBhcmUgb3B0aW5nIGludG8gbmV3IHByb2R1Y3Rpb24gYmVoYXZpb3IuXG4gIC8vIGh0dHA6Ly9mYi5tZS9wcm9wLXR5cGVzLWluLXByb2RcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2ZhY3RvcnlXaXRoVGhyb3dpbmdTaGltcycpKCk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcHJvcC10eXBlcy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMzU4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11c2UtYmVmb3JlLWRlZmluZSAqL1xuLyoqXG4gKiBAbW9kdWxlIGV2ZW50SGFuZGxlcnNcbiAqXG4gKi9cbmltcG9ydCBkb21IZWxwZXJzIGZyb20gJy4vbGliL2RvbV9oZWxwZXJzJztcbmltcG9ydCBsaXN0ZW5lcnMgZnJvbSAnLi9saWIvbGlzdGVuZXJzJztcbmltcG9ydCAqIGFzIHN0b3JlIGZyb20gJy4vc3RvcmUnO1xuXG4vKipcbiAqIHByaXZhdGVcbiAqXG4gKi9cblxuLyoqXG4gKiBfb25DbGlja1xuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IFRoZSBjbGljayBldmVudCBvYmplY3RcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudC50YXJnZXQgVGhlIERPTSBub2RlIGZyb20gdGhlIGNsaWNrIGV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfb25DbGljayhfcmVmKSB7XG4gIHZhciB0YXJnZXQgPSBfcmVmLnRhcmdldDtcblxuICBzdG9yZS5hY3RpdmF0ZShbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHN0b3JlLmdldEluc3RhbmNlcygpKSkucmVkdWNlKGRvbUhlbHBlcnMuZmluZENvbnRhaW5lck5vZGVzKHRhcmdldCksIFtdKS5zb3J0KGRvbUhlbHBlcnMuc29ydEJ5RE9NUG9zaXRpb24pLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHJldHVybiBpdGVtLmluc3RhbmNlO1xuICB9KSk7XG59XG5cbi8qKlxuICogX29uS2V5RG93bjogVGhlIGtleWRvd24gZXZlbnQgY2FsbGJhY2tcbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCBUaGUga2V5ZG93biBldmVudCBvYmplY3RcbiAqIEBwYXJhbSB7bnVtYmVyfSBldmVudC53aGljaCBUaGUga2V5IGNvZGUgKHdoaWNoKSByZWNlaXZlZCBmcm9tIHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfb25LZXlEb3duKGV2ZW50KSB7XG4gIHZhciBmb3JjZUNvbnNpZGVyID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcblxuICBpZiAoZm9yY2VDb25zaWRlciB8fCBfc2hvdWxkQ29uc2lkZXIoZXZlbnQpKSB7XG4gICAgdmFyIF9yZWYyID0gc3RvcmUuZmluZEJpbmRpbmdGb3JFdmVudChldmVudCkgfHwge30sXG4gICAgICAgIGZuID0gX3JlZjIuZm4sXG4gICAgICAgIGluc3RhbmNlID0gX3JlZjIuaW5zdGFuY2U7XG5cbiAgICBpZiAoZm4pIHtcbiAgICAgIGZuLmNhbGwoaW5zdGFuY2UsIGV2ZW50KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogX3Nob3VsZENvbnNpZGVyOiBDb25kaXRpb25zIGZvciBwcm9jZWVkaW5nIHdpdGgga2V5IGV2ZW50IGhhbmRsaW5nXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgVGhlIGtleWRvd24gZXZlbnQgb2JqZWN0XG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnQudGFyZ2V0IFRoZSBub2RlIG9yaWdpbiBvZiB0aGUgZXZlbnRcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdG8gY29udGludWUgcHJvY2VzaW5nIHRoZSBrZXlkb3duIGV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfc2hvdWxkQ29uc2lkZXIoX3JlZjMpIHtcbiAgdmFyIGN0cmxLZXkgPSBfcmVmMy5jdHJsS2V5LFxuICAgICAgdGFyZ2V0ID0gX3JlZjMudGFyZ2V0O1xuXG4gIHJldHVybiBjdHJsS2V5IHx8ICF+WydJTlBVVCcsICdTRUxFQ1QnLCAnVEVYVEFSRUEnXS5pbmRleE9mKHRhcmdldC50YWdOYW1lKSAmJiAoIXRhcmdldC5nZXRBdHRyaWJ1dGUgfHwgdGFyZ2V0LmdldEF0dHJpYnV0ZSgncm9sZScpICE9PSAndGV4dGJveCcpO1xufVxuXG4vKipcbiAqIHB1YmxpY1xuICpcbiAqL1xuXG4vKipcbiAqIG9uTW91bnRcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICovXG5mdW5jdGlvbiBvbk1vdW50KGluc3RhbmNlKSB7XG4gIHN0b3JlLmFjdGl2YXRlKGluc3RhbmNlKTtcbiAgbGlzdGVuZXJzLmJpbmRLZXlzKF9vbktleURvd24pO1xuICBsaXN0ZW5lcnMuYmluZENsaWNrcyhfb25DbGljayk7XG4gIGRvbUhlbHBlcnMuYmluZEZvY3VzYWJsZXMoaW5zdGFuY2UsIHN0b3JlLmFjdGl2YXRlKTtcbn1cblxuLyoqXG4gKiBvblVubW91bnRcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICovXG5mdW5jdGlvbiBvblVubW91bnQoaW5zdGFuY2UpIHtcbiAgc3RvcmUuZGVsZXRlSW5zdGFuY2UoaW5zdGFuY2UpO1xuICBpZiAoc3RvcmUuaXNFbXB0eSgpKSB7XG4gICAgbGlzdGVuZXJzLnVuYmluZENsaWNrcyhfb25DbGljayk7XG4gICAgbGlzdGVuZXJzLnVuYmluZEtleXMoX29uS2V5RG93bik7XG4gIH1cbn1cblxuZXhwb3J0IHsgb25Nb3VudCwgb25Vbm1vdW50IH07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvZXZlbnRfaGFuZGxlcnMuanNcbi8vIG1vZHVsZSBpZCA9IDM4MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgeyBtb2RpZmllcnMgYXMgbW9kaWZpZXJLZXlzLCBBTExfS0VZUywgQUxMX1BSSU5UQUJMRV9LRVlTIH0gZnJvbSAnLi9rZXlzJztcblxudmFyIFBSSU5UQUJMRV9DSEFSQUNURVJTID0gJzAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlafiFAIyQlXiYqKCktXys9W11cXFxce318O1xcJzpcIiwuLzw+P8KjJztcblxudmFyIG1vZEtleXMgPSBPYmplY3Qua2V5cyhtb2RpZmllcktleXMpO1xuXG5mdW5jdGlvbiBtYXRjaEtleXMoX3JlZikge1xuICB2YXIga2V5U2V0ID0gX3JlZi5rZXlTZXQsXG4gICAgICBldmVudCA9IF9yZWYuZXZlbnQ7XG4gIHZhciBrZXkgPSBrZXlTZXQua2V5LFxuICAgICAgX2tleVNldCRtb2RpZmllcnMgPSBrZXlTZXQubW9kaWZpZXJzLFxuICAgICAgbW9kaWZpZXJzID0gX2tleVNldCRtb2RpZmllcnMgPT09IHVuZGVmaW5lZCA/IFtdIDogX2tleVNldCRtb2RpZmllcnM7XG5cbiAgdmFyIGtleXNNYXRjaCA9IHZvaWQgMDtcblxuICBrZXlzTWF0Y2ggPSBrZXkgPT09IEFMTF9LRVlTO1xuXG4gIGlmIChrZXkgPT09IEFMTF9QUklOVEFCTEVfS0VZUykge1xuICAgIGlmIChldmVudC5rZXkpIHtcbiAgICAgIC8vIE1vZGVybiBicm93c2VycyBpbXBsZW1lbnQgYGtleWAsIHNvIGlmIGBrZXlgIGlzIGxlbmd0aCAxLCB3ZSBoYXZlIGEgbWF0Y2guIGUuZy4gJ2EnIGZvciB0aGVcbiAgICAgIC8vIGEga2V5LCBvciAnMicgZm9yIHRoZSAyIGtleS4gQWxsIG90aGVyIG5vbi1wcmludGFibGUgY2hhcmFjdGVycyBoYXZlIG5hbWVzLCBlLmcuICdFbnRlcicgb3IgJ0JhY2tzcGFjZScuXG4gICAgICBrZXlzTWF0Y2ggPSBldmVudC5rZXkubGVuZ3RoID09PSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBGb3IgYnJvd3NlcnMgdGhhdCBkbyBubyBzdXBwb3J0IGBldmVudC5rZXlgLCB3ZSB0ZXN0IGFnYWluc3QgYSBsaXN0IG9mIGNoYXJhY3RlcnNcbiAgICAgIHZhciBwcmVzc2VkQ2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoZXZlbnQuY2hhckNvZGUpO1xuICAgICAga2V5c01hdGNoID0gUFJJTlRBQkxFX0NIQVJBQ1RFUlMuaW5kZXhPZihwcmVzc2VkQ2hhcikgPj0gMDtcbiAgICB9XG4gIH1cblxuICBpZiAoa2V5ID09PSBldmVudC53aGljaCkge1xuICAgIHZhciBldnRNb2RLZXlzID0gbW9kS2V5cy5maWx0ZXIoZnVuY3Rpb24gKG1vZEtleSkge1xuICAgICAgcmV0dXJuIGV2ZW50W21vZEtleSArICdLZXknXTtcbiAgICB9KS5zb3J0KCk7XG4gICAga2V5c01hdGNoID0gbW9kaWZpZXJzLmxlbmd0aCA9PT0gZXZ0TW9kS2V5cy5sZW5ndGggJiYgbW9kaWZpZXJzLmV2ZXJ5KGZ1bmN0aW9uIChtb2RLZXksIGluZGV4KSB7XG4gICAgICByZXR1cm4gZXZ0TW9kS2V5c1tpbmRleF0gPT09IG1vZEtleTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBrZXlzTWF0Y2g7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1hdGNoS2V5cztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvbWF0Y2hfa2V5cy5qc1xuLy8gbW9kdWxlIGlkID0gMzgyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCBLZXlzLCB7IG1vZGlmaWVycyB9IGZyb20gJy4va2V5cyc7XG5cbmZ1bmN0aW9uIHBhcnNlS2V5cyhrZXlzQXJyYXkpIHtcbiAgcmV0dXJuIGtleXNBcnJheS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBrZXlTZXQgPSB7IGtleToga2V5IH07XG4gICAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICB2YXIga2V5U3RyaW5nID0ga2V5LnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICAgICAgdmFyIG1hdGNoZXMgPSBrZXlTdHJpbmcuc3BsaXQoL1xccz9cXCtcXHM/Lyk7XG4gICAgICBrZXlTZXQgPSBtYXRjaGVzLmxlbmd0aCA9PT0gMSA/IHsga2V5OiBLZXlzW2tleVN0cmluZ10gfSA6IHtcbiAgICAgICAga2V5OiBLZXlzW21hdGNoZXMucG9wKCldLFxuICAgICAgICBtb2RpZmllcnM6IG1hdGNoZXMubWFwKGZ1bmN0aW9uIChtb2RLZXkpIHtcbiAgICAgICAgICByZXR1cm4gbW9kaWZpZXJzW21vZEtleV07XG4gICAgICAgIH0pLnNvcnQoKVxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGtleVNldDtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHBhcnNlS2V5cztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvcGFyc2Vfa2V5cy5qc1xuLy8gbW9kdWxlIGlkID0gMzgzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qXG5cdE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cdEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG52YXIgc3R5bGVzSW5Eb20gPSB7fSxcblx0bWVtb2l6ZSA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0dmFyIG1lbW87XG5cdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICh0eXBlb2YgbWVtbyA9PT0gXCJ1bmRlZmluZWRcIikgbWVtbyA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRyZXR1cm4gbWVtbztcblx0XHR9O1xuXHR9LFxuXHRpc09sZElFID0gbWVtb2l6ZShmdW5jdGlvbigpIHtcblx0XHQvLyBUZXN0IGZvciBJRSA8PSA5IGFzIHByb3Bvc2VkIGJ5IEJyb3dzZXJoYWNrc1xuXHRcdC8vIEBzZWUgaHR0cDovL2Jyb3dzZXJoYWNrcy5jb20vI2hhY2stZTcxZDg2OTJmNjUzMzQxNzNmZWU3MTVjMjIyY2I4MDVcblx0XHQvLyBUZXN0cyBmb3IgZXhpc3RlbmNlIG9mIHN0YW5kYXJkIGdsb2JhbHMgaXMgdG8gYWxsb3cgc3R5bGUtbG9hZGVyIFxuXHRcdC8vIHRvIG9wZXJhdGUgY29ycmVjdGx5IGludG8gbm9uLXN0YW5kYXJkIGVudmlyb25tZW50c1xuXHRcdC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9zdHlsZS1sb2FkZXIvaXNzdWVzLzE3N1xuXHRcdHJldHVybiB3aW5kb3cgJiYgZG9jdW1lbnQgJiYgZG9jdW1lbnQuYWxsICYmICF3aW5kb3cuYXRvYjtcblx0fSksXG5cdGdldEVsZW1lbnQgPSAoZnVuY3Rpb24oZm4pIHtcblx0XHR2YXIgbWVtbyA9IHt9O1xuXHRcdHJldHVybiBmdW5jdGlvbihzZWxlY3Rvcikge1xuXHRcdFx0aWYgKHR5cGVvZiBtZW1vW3NlbGVjdG9yXSA9PT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0XHRtZW1vW3NlbGVjdG9yXSA9IGZuLmNhbGwodGhpcywgc2VsZWN0b3IpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG1lbW9bc2VsZWN0b3JdXG5cdFx0fTtcblx0fSkoZnVuY3Rpb24gKHN0eWxlVGFyZ2V0KSB7XG5cdFx0cmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc3R5bGVUYXJnZXQpXG5cdH0pLFxuXHRzaW5nbGV0b25FbGVtZW50ID0gbnVsbCxcblx0c2luZ2xldG9uQ291bnRlciA9IDAsXG5cdHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wID0gW10sXG5cdGZpeFVybHMgPSByZXF1aXJlKFwiLi9maXhVcmxzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxpc3QsIG9wdGlvbnMpIHtcblx0aWYodHlwZW9mIERFQlVHICE9PSBcInVuZGVmaW5lZFwiICYmIERFQlVHKSB7XG5cdFx0aWYodHlwZW9mIGRvY3VtZW50ICE9PSBcIm9iamVjdFwiKSB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgc3R5bGUtbG9hZGVyIGNhbm5vdCBiZSB1c2VkIGluIGEgbm9uLWJyb3dzZXIgZW52aXJvbm1lbnRcIik7XG5cdH1cblxuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0b3B0aW9ucy5hdHRycyA9IHR5cGVvZiBvcHRpb25zLmF0dHJzID09PSBcIm9iamVjdFwiID8gb3B0aW9ucy5hdHRycyA6IHt9O1xuXG5cdC8vIEZvcmNlIHNpbmdsZS10YWcgc29sdXRpb24gb24gSUU2LTksIHdoaWNoIGhhcyBhIGhhcmQgbGltaXQgb24gdGhlICMgb2YgPHN0eWxlPlxuXHQvLyB0YWdzIGl0IHdpbGwgYWxsb3cgb24gYSBwYWdlXG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5zaW5nbGV0b24gPT09IFwidW5kZWZpbmVkXCIpIG9wdGlvbnMuc2luZ2xldG9uID0gaXNPbGRJRSgpO1xuXG5cdC8vIEJ5IGRlZmF1bHQsIGFkZCA8c3R5bGU+IHRhZ3MgdG8gdGhlIDxoZWFkPiBlbGVtZW50XG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5pbnNlcnRJbnRvID09PSBcInVuZGVmaW5lZFwiKSBvcHRpb25zLmluc2VydEludG8gPSBcImhlYWRcIjtcblxuXHQvLyBCeSBkZWZhdWx0LCBhZGQgPHN0eWxlPiB0YWdzIHRvIHRoZSBib3R0b20gb2YgdGhlIHRhcmdldFxuXHRpZiAodHlwZW9mIG9wdGlvbnMuaW5zZXJ0QXQgPT09IFwidW5kZWZpbmVkXCIpIG9wdGlvbnMuaW5zZXJ0QXQgPSBcImJvdHRvbVwiO1xuXG5cdHZhciBzdHlsZXMgPSBsaXN0VG9TdHlsZXMobGlzdCwgb3B0aW9ucyk7XG5cdGFkZFN0eWxlc1RvRG9tKHN0eWxlcywgb3B0aW9ucyk7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG5cdFx0dmFyIG1heVJlbW92ZSA9IFtdO1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xuXHRcdFx0dmFyIGRvbVN0eWxlID0gc3R5bGVzSW5Eb21baXRlbS5pZF07XG5cdFx0XHRkb21TdHlsZS5yZWZzLS07XG5cdFx0XHRtYXlSZW1vdmUucHVzaChkb21TdHlsZSk7XG5cdFx0fVxuXHRcdGlmKG5ld0xpc3QpIHtcblx0XHRcdHZhciBuZXdTdHlsZXMgPSBsaXN0VG9TdHlsZXMobmV3TGlzdCwgb3B0aW9ucyk7XG5cdFx0XHRhZGRTdHlsZXNUb0RvbShuZXdTdHlsZXMsIG9wdGlvbnMpO1xuXHRcdH1cblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbWF5UmVtb3ZlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgZG9tU3R5bGUgPSBtYXlSZW1vdmVbaV07XG5cdFx0XHRpZihkb21TdHlsZS5yZWZzID09PSAwKSB7XG5cdFx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBkb21TdHlsZS5wYXJ0cy5sZW5ndGg7IGorKylcblx0XHRcdFx0XHRkb21TdHlsZS5wYXJ0c1tqXSgpO1xuXHRcdFx0XHRkZWxldGUgc3R5bGVzSW5Eb21bZG9tU3R5bGUuaWRdO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcbn07XG5cbmZ1bmN0aW9uIGFkZFN0eWxlc1RvRG9tKHN0eWxlcywgb3B0aW9ucykge1xuXHRmb3IodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGl0ZW0gPSBzdHlsZXNbaV07XG5cdFx0dmFyIGRvbVN0eWxlID0gc3R5bGVzSW5Eb21baXRlbS5pZF07XG5cdFx0aWYoZG9tU3R5bGUpIHtcblx0XHRcdGRvbVN0eWxlLnJlZnMrKztcblx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBkb21TdHlsZS5wYXJ0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRkb21TdHlsZS5wYXJ0c1tqXShpdGVtLnBhcnRzW2pdKTtcblx0XHRcdH1cblx0XHRcdGZvcig7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSwgb3B0aW9ucykpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgcGFydHMgPSBbXTtcblx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdHBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSwgb3B0aW9ucykpO1xuXHRcdFx0fVxuXHRcdFx0c3R5bGVzSW5Eb21baXRlbS5pZF0gPSB7aWQ6IGl0ZW0uaWQsIHJlZnM6IDEsIHBhcnRzOiBwYXJ0c307XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGxpc3RUb1N0eWxlcyhsaXN0LCBvcHRpb25zKSB7XG5cdHZhciBzdHlsZXMgPSBbXTtcblx0dmFyIG5ld1N0eWxlcyA9IHt9O1xuXHRmb3IodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gbGlzdFtpXTtcblx0XHR2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcblx0XHR2YXIgY3NzID0gaXRlbVsxXTtcblx0XHR2YXIgbWVkaWEgPSBpdGVtWzJdO1xuXHRcdHZhciBzb3VyY2VNYXAgPSBpdGVtWzNdO1xuXHRcdHZhciBwYXJ0ID0ge2NzczogY3NzLCBtZWRpYTogbWVkaWEsIHNvdXJjZU1hcDogc291cmNlTWFwfTtcblx0XHRpZighbmV3U3R5bGVzW2lkXSlcblx0XHRcdHN0eWxlcy5wdXNoKG5ld1N0eWxlc1tpZF0gPSB7aWQ6IGlkLCBwYXJ0czogW3BhcnRdfSk7XG5cdFx0ZWxzZVxuXHRcdFx0bmV3U3R5bGVzW2lkXS5wYXJ0cy5wdXNoKHBhcnQpO1xuXHR9XG5cdHJldHVybiBzdHlsZXM7XG59XG5cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zLCBzdHlsZUVsZW1lbnQpIHtcblx0dmFyIHN0eWxlVGFyZ2V0ID0gZ2V0RWxlbWVudChvcHRpb25zLmluc2VydEludG8pXG5cdGlmICghc3R5bGVUYXJnZXQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydEludG8nIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcblx0fVxuXHR2YXIgbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3AgPSBzdHlsZUVsZW1lbnRzSW5zZXJ0ZWRBdFRvcFtzdHlsZUVsZW1lbnRzSW5zZXJ0ZWRBdFRvcC5sZW5ndGggLSAxXTtcblx0aWYgKG9wdGlvbnMuaW5zZXJ0QXQgPT09IFwidG9wXCIpIHtcblx0XHRpZighbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3ApIHtcblx0XHRcdHN0eWxlVGFyZ2V0Lmluc2VydEJlZm9yZShzdHlsZUVsZW1lbnQsIHN0eWxlVGFyZ2V0LmZpcnN0Q2hpbGQpO1xuXHRcdH0gZWxzZSBpZihsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcC5uZXh0U2libGluZykge1xuXHRcdFx0c3R5bGVUYXJnZXQuaW5zZXJ0QmVmb3JlKHN0eWxlRWxlbWVudCwgbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3AubmV4dFNpYmxpbmcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdHlsZVRhcmdldC5hcHBlbmRDaGlsZChzdHlsZUVsZW1lbnQpO1xuXHRcdH1cblx0XHRzdHlsZUVsZW1lbnRzSW5zZXJ0ZWRBdFRvcC5wdXNoKHN0eWxlRWxlbWVudCk7XG5cdH0gZWxzZSBpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJib3R0b21cIikge1xuXHRcdHN0eWxlVGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlRWxlbWVudCk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCB2YWx1ZSBmb3IgcGFyYW1ldGVyICdpbnNlcnRBdCcuIE11c3QgYmUgJ3RvcCcgb3IgJ2JvdHRvbScuXCIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcblx0c3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KTtcblx0dmFyIGlkeCA9IHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLmluZGV4T2Yoc3R5bGVFbGVtZW50KTtcblx0aWYoaWR4ID49IDApIHtcblx0XHRzdHlsZUVsZW1lbnRzSW5zZXJ0ZWRBdFRvcC5zcGxpY2UoaWR4LCAxKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuXHR2YXIgc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuXHRvcHRpb25zLmF0dHJzLnR5cGUgPSBcInRleHQvY3NzXCI7XG5cblx0YXR0YWNoVGFnQXR0cnMoc3R5bGVFbGVtZW50LCBvcHRpb25zLmF0dHJzKTtcblx0aW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIHN0eWxlRWxlbWVudCk7XG5cdHJldHVybiBzdHlsZUVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUxpbmtFbGVtZW50KG9wdGlvbnMpIHtcblx0dmFyIGxpbmtFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIik7XG5cdG9wdGlvbnMuYXR0cnMudHlwZSA9IFwidGV4dC9jc3NcIjtcblx0b3B0aW9ucy5hdHRycy5yZWwgPSBcInN0eWxlc2hlZXRcIjtcblxuXHRhdHRhY2hUYWdBdHRycyhsaW5rRWxlbWVudCwgb3B0aW9ucy5hdHRycyk7XG5cdGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zLCBsaW5rRWxlbWVudCk7XG5cdHJldHVybiBsaW5rRWxlbWVudDtcbn1cblxuZnVuY3Rpb24gYXR0YWNoVGFnQXR0cnMoZWxlbWVudCwgYXR0cnMpIHtcblx0T2JqZWN0LmtleXMoYXR0cnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBhZGRTdHlsZShvYmosIG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlRWxlbWVudCwgdXBkYXRlLCByZW1vdmUsIHRyYW5zZm9ybVJlc3VsdDtcblxuXHQvLyBJZiBhIHRyYW5zZm9ybSBmdW5jdGlvbiB3YXMgZGVmaW5lZCwgcnVuIGl0IG9uIHRoZSBjc3Ncblx0aWYgKG9wdGlvbnMudHJhbnNmb3JtICYmIG9iai5jc3MpIHtcblx0ICAgIHRyYW5zZm9ybVJlc3VsdCA9IG9wdGlvbnMudHJhbnNmb3JtKG9iai5jc3MpO1xuXHQgICAgXG5cdCAgICBpZiAodHJhbnNmb3JtUmVzdWx0KSB7XG5cdCAgICBcdC8vIElmIHRyYW5zZm9ybSByZXR1cm5zIGEgdmFsdWUsIHVzZSB0aGF0IGluc3RlYWQgb2YgdGhlIG9yaWdpbmFsIGNzcy5cblx0ICAgIFx0Ly8gVGhpcyBhbGxvd3MgcnVubmluZyBydW50aW1lIHRyYW5zZm9ybWF0aW9ucyBvbiB0aGUgY3NzLlxuXHQgICAgXHRvYmouY3NzID0gdHJhbnNmb3JtUmVzdWx0O1xuXHQgICAgfSBlbHNlIHtcblx0ICAgIFx0Ly8gSWYgdGhlIHRyYW5zZm9ybSBmdW5jdGlvbiByZXR1cm5zIGEgZmFsc3kgdmFsdWUsIGRvbid0IGFkZCB0aGlzIGNzcy4gXG5cdCAgICBcdC8vIFRoaXMgYWxsb3dzIGNvbmRpdGlvbmFsIGxvYWRpbmcgb2YgY3NzXG5cdCAgICBcdHJldHVybiBmdW5jdGlvbigpIHtcblx0ICAgIFx0XHQvLyBub29wXG5cdCAgICBcdH07XG5cdCAgICB9XG5cdH1cblxuXHRpZiAob3B0aW9ucy5zaW5nbGV0b24pIHtcblx0XHR2YXIgc3R5bGVJbmRleCA9IHNpbmdsZXRvbkNvdW50ZXIrKztcblx0XHRzdHlsZUVsZW1lbnQgPSBzaW5nbGV0b25FbGVtZW50IHx8IChzaW5nbGV0b25FbGVtZW50ID0gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpKTtcblx0XHR1cGRhdGUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50LCBzdHlsZUluZGV4LCBmYWxzZSk7XG5cdFx0cmVtb3ZlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlRWxlbWVudCwgc3R5bGVJbmRleCwgdHJ1ZSk7XG5cdH0gZWxzZSBpZihvYmouc291cmNlTWFwICYmXG5cdFx0dHlwZW9mIFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIFVSTC5jcmVhdGVPYmplY3RVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBVUkwucmV2b2tlT2JqZWN0VVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgQmxvYiA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdHN0eWxlRWxlbWVudCA9IGNyZWF0ZUxpbmtFbGVtZW50KG9wdGlvbnMpO1xuXHRcdHVwZGF0ZSA9IHVwZGF0ZUxpbmsuYmluZChudWxsLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMpO1xuXHRcdHJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG5cdFx0XHRpZihzdHlsZUVsZW1lbnQuaHJlZilcblx0XHRcdFx0VVJMLnJldm9rZU9iamVjdFVSTChzdHlsZUVsZW1lbnQuaHJlZik7XG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHRzdHlsZUVsZW1lbnQgPSBjcmVhdGVTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG5cdFx0dXBkYXRlID0gYXBwbHlUb1RhZy5iaW5kKG51bGwsIHN0eWxlRWxlbWVudCk7XG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcblx0XHR9O1xuXHR9XG5cblx0dXBkYXRlKG9iaik7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZVN0eWxlKG5ld09iaikge1xuXHRcdGlmKG5ld09iaikge1xuXHRcdFx0aWYobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwKVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR1cGRhdGUob2JqID0gbmV3T2JqKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVtb3ZlKCk7XG5cdFx0fVxuXHR9O1xufVxuXG52YXIgcmVwbGFjZVRleHQgPSAoZnVuY3Rpb24gKCkge1xuXHR2YXIgdGV4dFN0b3JlID0gW107XG5cblx0cmV0dXJuIGZ1bmN0aW9uIChpbmRleCwgcmVwbGFjZW1lbnQpIHtcblx0XHR0ZXh0U3RvcmVbaW5kZXhdID0gcmVwbGFjZW1lbnQ7XG5cdFx0cmV0dXJuIHRleHRTdG9yZS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuJyk7XG5cdH07XG59KSgpO1xuXG5mdW5jdGlvbiBhcHBseVRvU2luZ2xldG9uVGFnKHN0eWxlRWxlbWVudCwgaW5kZXgsIHJlbW92ZSwgb2JqKSB7XG5cdHZhciBjc3MgPSByZW1vdmUgPyBcIlwiIDogb2JqLmNzcztcblxuXHRpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcblx0XHRzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gcmVwbGFjZVRleHQoaW5kZXgsIGNzcyk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGNzc05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpO1xuXHRcdHZhciBjaGlsZE5vZGVzID0gc3R5bGVFbGVtZW50LmNoaWxkTm9kZXM7XG5cdFx0aWYgKGNoaWxkTm9kZXNbaW5kZXhdKSBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoY2hpbGROb2Rlc1tpbmRleF0pO1xuXHRcdGlmIChjaGlsZE5vZGVzLmxlbmd0aCkge1xuXHRcdFx0c3R5bGVFbGVtZW50Lmluc2VydEJlZm9yZShjc3NOb2RlLCBjaGlsZE5vZGVzW2luZGV4XSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChjc3NOb2RlKTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gYXBwbHlUb1RhZyhzdHlsZUVsZW1lbnQsIG9iaikge1xuXHR2YXIgY3NzID0gb2JqLmNzcztcblx0dmFyIG1lZGlhID0gb2JqLm1lZGlhO1xuXG5cdGlmKG1lZGlhKSB7XG5cdFx0c3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm1lZGlhXCIsIG1lZGlhKVxuXHR9XG5cblx0aWYoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcblx0XHRzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuXHR9IGVsc2Uge1xuXHRcdHdoaWxlKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG5cdFx0XHRzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuXHRcdH1cblx0XHRzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlTGluayhsaW5rRWxlbWVudCwgb3B0aW9ucywgb2JqKSB7XG5cdHZhciBjc3MgPSBvYmouY3NzO1xuXHR2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuXHQvKiBJZiBjb252ZXJ0VG9BYnNvbHV0ZVVybHMgaXNuJ3QgZGVmaW5lZCwgYnV0IHNvdXJjZW1hcHMgYXJlIGVuYWJsZWRcblx0YW5kIHRoZXJlIGlzIG5vIHB1YmxpY1BhdGggZGVmaW5lZCB0aGVuIGxldHMgdHVybiBjb252ZXJ0VG9BYnNvbHV0ZVVybHNcblx0b24gYnkgZGVmYXVsdC4gIE90aGVyd2lzZSBkZWZhdWx0IHRvIHRoZSBjb252ZXJ0VG9BYnNvbHV0ZVVybHMgb3B0aW9uXG5cdGRpcmVjdGx5XG5cdCovXG5cdHZhciBhdXRvRml4VXJscyA9IG9wdGlvbnMuY29udmVydFRvQWJzb2x1dGVVcmxzID09PSB1bmRlZmluZWQgJiYgc291cmNlTWFwO1xuXG5cdGlmIChvcHRpb25zLmNvbnZlcnRUb0Fic29sdXRlVXJscyB8fCBhdXRvRml4VXJscyl7XG5cdFx0Y3NzID0gZml4VXJscyhjc3MpO1xuXHR9XG5cblx0aWYoc291cmNlTWFwKSB7XG5cdFx0Ly8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjY2MDM4NzVcblx0XHRjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiICsgYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSArIFwiICovXCI7XG5cdH1cblxuXHR2YXIgYmxvYiA9IG5ldyBCbG9iKFtjc3NdLCB7IHR5cGU6IFwidGV4dC9jc3NcIiB9KTtcblxuXHR2YXIgb2xkU3JjID0gbGlua0VsZW1lbnQuaHJlZjtcblxuXHRsaW5rRWxlbWVudC5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblxuXHRpZihvbGRTcmMpXG5cdFx0VVJMLnJldm9rZU9iamVjdFVSTChvbGRTcmMpO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3N0eWxlLWxvYWRlci9hZGRTdHlsZXMuanNcbi8vIG1vZHVsZSBpZCA9IDQ3NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gXCJtb2J4LXJlYWN0XCI7XG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQga2V5ZG93biBmcm9tIFwicmVhY3Qta2V5ZG93blwiO1xuaW1wb3J0IHsgQnV0dG9uLCBEcm9wZG93biwgR3JpZCwgTWVudSwgU2VnbWVudCwgVGV4dEFyZWEgfSBmcm9tICdzZW1hbnRpYy11aS1yZWFjdCdcblxuaW1wb3J0IEV4YW1wbGVTdG9yZSBmcm9tIFwiLi9FeGFtcGxlU3RvcmVcIjtcbmltcG9ydCBTcGFjZXIgZnJvbSBcIi4vU3BhY2VyLmpzeFwiO1xuaW1wb3J0IFwiLi9zdHlsZXMubGVzc1wiO1xuaW1wb3J0IFRhYmJhYmxlVGV4dEFyZWEgZnJvbSBcIi4vVGFiYmFibGVUZXh0QXJlYS5qc3hcIjtcblxuQG9ic2VydmVyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcGVsbEVkaXRvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG5cdFx0ZXhhbXBsZXM6IG5ldyBFeGFtcGxlU3RvcmUoKVxuXHR9O1xuXG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIocHJvcHMpO1xud2luZG93LmV4YW1wbGVzID0gcHJvcHMuZXhhbXBsZXM7XG5cdFx0dGhpcy5wcm9wcy5leGFtcGxlcy5sb2FkKCk7XG5cblx0XHQvL0RFQlVHXG5cdFx0d2luZG93LnNwZWxsRWRpdG9yID0gdGhpcztcblx0XHR3aW5kb3cuZXhhbXBsZXMgPSB0aGlzLnByb3BzLmV4YW1wbGVzO1xuXHR9XG5cblx0QGtleWRvd24oXCJjdHJsK3NcIilcblx0c2F2ZSgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5zYXZlKCk7IH1cblxuXHRAa2V5ZG93bihcImN0cmwrclwiKVxuXHRyZXZlcnQoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMucmV2ZXJ0KCk7IH1cblxuXHRAa2V5ZG93bihcImN0cmwrY1wiKVxuXHRjb21waWxlKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLmNvbXBpbGUoKTsgfVxuXG5cdEBrZXlkb3duKFwiY3RybCtuXCIpXG5cdGNyZWF0ZSgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5jcmVhdGUoKTsgfVxuXG5cdEBrZXlkb3duKFwiY3RybCtkXCIpXG5cdGRlbGV0ZSgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5kZWxldGUodW5kZWZpbmVkLCBcIkNPTkZJUk1cIik7IH1cblxuXHRyZW5hbWUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMucmVuYW1lKCk7IH1cblx0ZHVwbGljYXRlKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLmR1cGxpY2F0ZSgpOyB9XG5cdGxvYWQoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMubG9hZCgpOyB9XG5cdHJlc2V0KCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLnJlc2V0KCk7IH1cblxuXG5cdHJlbmRlcigpIHtcblx0XHRsZXQgeyBleGFtcGxlcyB9ID0gdGhpcy5wcm9wcztcblx0XHRsZXQgeyB0aXRsZXMsIHNlbGVjdGVkLCBkaXJ0eSwgY29kZSwgb3V0cHV0IH0gPSBleGFtcGxlcztcblxuXHRcdC8vIENyZWF0ZSBtZW51aXRlbXMgZnJvbSB0aGUgZXhhbXBsZXNcblx0XHRsZXQgb3B0aW9ucyA9IHRpdGxlcy5tYXAoIHRpdGxlID0+XG5cdFx0XHQoe1xuXHRcdFx0XHR2YWx1ZTogdGl0bGUsXG5cdFx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdFx0dGV4dDogdGl0bGUsXG5cdFx0XHRcdGNvbnRlbnQ6IHRpdGxlLFxuXHRcdFx0XHRvbkNsaWNrOiAoKSA9PiBleGFtcGxlcy5zZWxlY3QodGl0bGUpXG5cdFx0XHR9KSk7XG5cblx0XHRsZXQgZGlydHlCdXR0b25zID0gKCkgPT4ge1xuXHRcdFx0aWYgKCFkaXJ0eSkgcmV0dXJuO1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PE1lbnUgc2Vjb25kYXJ5IHN0eWxlPXt7IHBvc2l0aW9uOiBcImFic29sdXRlXCIsIHJpZ2h0OiBcIjFyZW1cIiwgdG9wOiBcIjNweFwiLCBtYXJnaW46IDAgfX0+XG5cdFx0XHRcdFx0PEJ1dHRvbiBuZWdhdGl2ZSBvbkNsaWNrPXsoKSA9PiB0aGlzLnJldmVydCgpfT48dT5SPC91PmV2ZXJ0PC9CdXR0b24+XG5cdFx0XHRcdFx0PEJ1dHRvbiBwb3NpdGl2ZSBvbkNsaWNrPXsoKSA9PiB0aGlzLnNhdmUoKX0+PHU+UzwvdT5hdmU8L0J1dHRvbj5cblx0XHRcdFx0PC9NZW51PlxuXHRcdFx0KTtcblx0XHR9O1xuXG5cdFx0bGV0IGNvbXBpbGVCdXR0b24gPSAoKSA9PiB7XG5cdFx0XHRpZiAob3V0cHV0KSByZXR1cm47XG5cdFx0XHRyZXR1cm4gPEJ1dHRvblxuXHRcdFx0XHRcdHN0eWxlPXt7IHBvc2l0aW9uOiBcImFic29sdXRlXCIsICB3aWR0aDogXCI0ZW1cIiwgbGVmdDogXCJjYWxjKDUwJSAtIDJlbSlcIiwgdG9wOiBcIjUwJVwiIH19XG5cdFx0XHRcdFx0b25DbGljaz17KCkgPT4gdGhpcy5jb21waWxlKCl9XG5cdFx0XHRcdFx0aWNvbj1cInJpZ2h0IGNoZXZyb25cIi8+O1xuXHRcdH07XG5cblx0XHRyZXR1cm4gKFxuXHRcdDxHcmlkIHN0cmV0Y2hlZCBwYWRkZWQgY2xhc3NOYW1lPVwiZnVsbEhlaWdodFwiPlxuXHRcdFx0PEdyaWQuUm93IHN0eWxlPXt7IGhlaWdodDogXCIycmVtXCIsIHBhZGRpbmdUb3A6IFwiMHJlbVwiIH19IGNsYXNzTmFtZT1cInVpIGludmVydGVkIGF0dGFjaGVkIG1lbnVcIj5cblx0XHRcdFx0PEdyaWQuQ29sdW1uIHdpZHRoPXs3fT5cblx0XHRcdFx0XHQ8TWVudSBpbnZlcnRlZCBhdHRhY2hlZCBmbHVpZD5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0+RXhhbXBsZTo8L01lbnUuSXRlbT5cblx0XHRcdFx0XHRcdDxEcm9wZG93biBpdGVtIHNlbGVjdGlvbiBvcHRpb25zPXtvcHRpb25zfSB2YWx1ZT17c2VsZWN0ZWR9IHN0eWxlPXt7IHdpZHRoOiBcIjIwZW1cIiB9fS8+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtIG9uQ2xpY2s9eygpID0+IHRoaXMuZGVsZXRlKCl9Pjx1PkQ8L3U+ZWxldGU8L01lbnUuSXRlbT5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0gb25DbGljaz17KCkgPT4gdGhpcy5yZW5hbWUoKX0+UmVuYW1lPC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtIG9uQ2xpY2s9eygpID0+IHRoaXMuZHVwbGljYXRlKCl9PkR1cGxpY2F0ZTwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdDwvTWVudT5cblx0XHRcdFx0PC9HcmlkLkNvbHVtbj5cblx0XHRcdFx0PEdyaWQuQ29sdW1uIHdpZHRoPXsyfT5cblx0XHRcdFx0XHQ8TWVudSBpbnZlcnRlZCBhdHRhY2hlZCBmbHVpZD5cblx0XHRcdFx0XHRcdDxTcGFjZXIgZmx1aWQvPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbSBvbkNsaWNrPXsoKSA9PiB0aGlzLmNyZWF0ZSgpfT48dT5OPC91PmV3PC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0XHQ8U3BhY2VyIGZsdWlkLz5cblx0XHRcdFx0XHQ8L01lbnU+XG5cdFx0XHRcdDwvR3JpZC5Db2x1bW4+XG5cdFx0XHRcdDxHcmlkLkNvbHVtbiB3aWR0aD17N30+XG5cdFx0XHRcdFx0PE1lbnUgaW52ZXJ0ZWQgYXR0YWNoZWQgZmx1aWQ+XG5cdFx0XHRcdFx0XHQ8U3BhY2VyIGZsdWlkLz5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0gb25DbGljaz17KCkgPT4gdGhpcy5sb2FkKCl9PlJlbG9hZDwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbSBvbkNsaWNrPXsoKSA9PiB0aGlzLnJlc2V0KCl9PlJlc2V0PC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0PC9NZW51PlxuXHRcdFx0XHQ8L0dyaWQuQ29sdW1uPlxuXHRcdFx0PC9HcmlkLlJvdz5cblx0XHRcdDxHcmlkLlJvdyBzdHlsZT17eyBoZWlnaHQ6IFwiY2FsYygxMDAlIC0gM3JlbSlcIiB9fT5cblx0XHRcdFx0PEdyaWQuQ29sdW1uIHdpZHRoPXs4fT5cblx0XHRcdFx0XHQ8VGFiYmFibGVUZXh0QXJlYVxuXHRcdFx0XHRcdFx0Y2xhc3NOYW1lPVwidWkgc2VnbWVudFwiXG5cdFx0XHRcdFx0XHR2YWx1ZT17Y29kZX1cblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsoZXZlbnQpID0+IGV4YW1wbGVzLnVwZGF0ZShleGFtcGxlcy5zZWxlY3RlZCwgZXZlbnQudGFyZ2V0LnZhbHVlLCBcIlNLSVBfU0FWRVwiKX1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdHtkaXJ0eUJ1dHRvbnMoKX1cblx0XHRcdFx0PC9HcmlkLkNvbHVtbj5cblx0XHRcdFx0PEdyaWQuQ29sdW1uIHdpZHRoPXs4fT5cblx0XHRcdFx0XHQ8VGV4dEFyZWEgY2xhc3NOYW1lPVwidWkgc2VnbWVudFwiIHZhbHVlPXtvdXRwdXR9Lz5cblx0XHRcdFx0PC9HcmlkLkNvbHVtbj5cblx0XHRcdFx0e2NvbXBpbGVCdXR0b24oKX1cblx0XHRcdDwvR3JpZC5Sb3c+XG5cdFx0PC9HcmlkPlxuXHQpO31cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hcHAvU3BlbGxFZGl0b3IuanN4IiwiLy8gRXhwb3J0IGFsbCBzdGFuZGFyZCBcInNwZWxsXCIgcnVsZXMuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXIuanNcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlLmpzXCI7XG5pbXBvcnQgcGFyc2VSdWxlIGZyb20gXCIuLi8uLi9SdWxlU3ludGF4LmpzXCI7XG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuLi8uLi9Ub2tlbml6ZXIuanNcIjtcblxuLy8gTG9hZCBhbGwgc3RhbmRhcmQgcnVsZXMgZmlsZXMuXG5pbXBvcnQgXCIuL2NvcmUuanNcIjtcbmltcG9ydCBcIi4vaWYuanNcIjtcbmltcG9ydCBcIi4vSlNYLmpzXCI7XG5pbXBvcnQgXCIuL2xpc3RzLmpzXCI7XG5pbXBvcnQgXCIuL29wZXJhdG9ycy5qc1wiO1xuaW1wb3J0IFwiLi9zdGF0ZW1lbnRzLmpzXCI7XG5pbXBvcnQgXCIuL3R5cGVzLmpzXCI7XG5pbXBvcnQgXCIuL1VJLmpzXCI7XG5cbi8vIENyZWF0ZSBwYXJzZXIgd2hpY2ggY29tYmluZXMgYWxsIG9mIHRoZSBhYm92ZS4uLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck1vZHVsZShcInNwZWxsXCIpO1xuLy8gLi4ud2hpY2ggZGVwZW5kcyBvbiBydWxlcyBsb2FkZWQgYWJvdmUuLi5cbnBhcnNlci5pbXBvcnQoXCJjb3JlXCIsIFwidHlwZXNcIiwgXCJsaXN0c1wiLCBcIm9wZXJhdG9yc1wiLCBcImlmXCIsIFwic3RhdGVtZW50c1wiLCBcIkpTWFwiLCBcIlVJXCIpO1xuLy8gLi4uYXMgdGhlIGRlZmF1bHQgZXhwb3J0XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbi8vIFN0aWNrIG90aGVyIHN0dWZmIG9uIGB3aW5kb3dgIGZvciByZWZsZWN0aW9uIGFuZCBhZC1ob2MgdGVzdGluZy5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdE9iamVjdC5hc3NpZ24od2luZG93LCB7XG5cdFx0UGFyc2VyLFxuXHRcdHBhcnNlUnVsZSxcblxuXHRcdFJ1bGUsXG5cblx0XHRUb2tlbml6ZXIsXG5cdFx0dG9rZW5pemU6IFRva2VuaXplci50b2tlbml6ZS5iaW5kKGV4cG9ydHMuVG9rZW5pemVyKSxcblxuXHRcdHBhcnNlcixcblx0XHRwYXJzZTogcGFyc2VyLnBhcnNlLmJpbmQocGFyc2VyKSxcblx0XHRjb21waWxlOiBwYXJzZXIuY29tcGlsZS5iaW5kKHBhcnNlciksXG5cdH0pO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL2luZGV4LmpzIiwiLyogU3RvcmUgb2YgZXhhbXBsZSBzcGVsbCBjb2RlIGZyYWdtZW50cy4gKi9cbmltcG9ydCBtb2J4LCB7IG9ic2VydmFibGUsIGNvbXB1dGVkIH0gZnJvbSBcIm1vYnhcIjtcblxuLy8gTWFrZSBQYXJzZXIgYW5kIFRva2VuaXplciBXQVJOIGFzIHdlIHJ1blxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vUGFyc2VyXCI7XG5QYXJzZXIuV0FSTiA9IHRydWU7XG5QYXJzZXIuREVCVUcgPSB0cnVlO1xuUGFyc2VyLlRJTUUgPSB0cnVlO1xuXG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuLi9Ub2tlbml6ZXJcIjtcblRva2VuaXplci5XQVJOID0gdHJ1ZTtcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeGFtcGxlU3RvcmUge1xuXHQvLyBDVVJSRU5UIGV4YW1wbGVzXG5cdEBvYnNlcnZhYmxlIGV4YW1wbGVzID0ge307XG5cdC8vIEV4YW1wbGVzIGFzIG9mIGxhc3Qgc2F2ZSAoZm9yIHJldmVyKVxuXHRAb2JzZXJ2YWJsZSBfc2F2ZWRFeGFtcGxlcyA9IHt9O1xuXHQvLyBTZWxlY3RlZCBleGFtcGxlIGtleS5cblx0QG9ic2VydmFibGUgc2VsZWN0ZWQgPSBcIlwiO1xuXHQvLyBDb21waWxlZCBvdXRwdXQuXG5cdEBvYnNlcnZhYmxlIG91dHB1dCA9IFwiXCI7XG5cblx0Ly8gUmV0dXJuIGp1c3QgdGhlIHRpdGxlcyBvZiB0aGUgZXhhbXBsZXMuXG5cdEBjb21wdXRlZCBnZXQgdGl0bGVzKCkge1xuXHRcdHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmV4YW1wbGVzKTtcblx0fVxuXG5cdC8vIFJldHVybiB0aGUgY29kZSBmb3IgdGhlIGN1cnJlbnQgZXhhbXBsZVxuXHRAY29tcHV0ZWQgZ2V0IGNvZGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZXhhbXBsZXNbdGhpcy5zZWxlY3RlZF07XG5cdH1cblxuXHQvLyBJcyBBTllUSElORyBkaXJ0eT9cblx0QGNvbXB1dGVkIGdldCBkaXJ0eSgpIHtcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5fc2F2ZWRFeGFtcGxlcykgIT09IEpTT04uc3RyaW5naWZ5KHRoaXMuZXhhbXBsZXMpO1xuXHR9XG5cblx0Ly8gUmVzZXQgYWxsIGV4YW1wbGVzIGZyb20gbG9jYWxTdG9yYWdlLlxuXHRyZXNldCgpIHtcblx0XHRkZWxldGUgbG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZXM7XG5cdFx0ZGVsZXRlIGxvY2FsU3RvcmFnZS5zcGVsbEVkaXRvckV4YW1wbGU7XG5cdFx0d2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuXHR9XG5cblx0Ly8gTG9hZCBleGFtcGxlc1xuXHRsb2FkKCkge1xuXHRcdC8vIExvYWQgZXhhbXBsZXMgZnJvbSBsb2NhbFN0b3JhZ2Vcblx0XHR0aGlzLmV4YW1wbGVzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlc1xuXHRcdFx0fHwgJ3tcIkZvb1wiOlwiZGVmaW5lIHR5cGUgRm9vXCIsIFwiQmFyXCI6XCJkZWZpbmUgdHlwZSBCYXJcIn0nKTtcblxuXHRcdC8vIFNhdmUgYSBjb3B5IG9mIGV4YW1wbGVzIGZvciByZXZlcnRcblx0XHR0aGlzLl9zYXZlZEV4YW1wbGVzID0gdGhpcy5leGFtcGxlcztcblxuXHRcdC8vIExvYWQgc2VsZWN0ZWQgZXhhbXBsZSBuYW1lXG5cdFx0dGhpcy5zZWxlY3QobG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZSk7XG5cdH1cblxuXHQvLyBTYXZlIGN1cnJlbnQgZXhhbXBsZXMuXG5cdHNhdmUoKSB7XG5cdFx0bG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZXMgPSBKU09OLnN0cmluZ2lmeSh0aGlzLmV4YW1wbGVzKTtcblxuXHRcdC8vIFNhdmUgYSBjb3B5IG9mIGV4YW1wbGVzIGZvciByZXZlcnRcblx0XHR0aGlzLl9zYXZlZEV4YW1wbGVzID0gdGhpcy5leGFtcGxlcztcblx0fVxuXG5cdC8vIFJldmVydCB0aGUgY3VycmVudCBleGFtcGxlXG5cdHJldmVydChleGFtcGxlID0gdGhpcy5zZWxlY3RlZCkge1xuXHRcdHRoaXMudXBkYXRlKGV4YW1wbGUsIHRoaXMuX3NhdmVkRXhhbXBsZXNbZXhhbXBsZV0pO1xuXHR9XG5cblx0Ly8gU2VsZWN0IGEgZGlmZmVyZW50IGV4YW1wbGUuXG5cdHNlbGVjdChleGFtcGxlKSB7XG5cdFx0aWYgKCFleGFtcGxlIHx8IHRoaXMuZXhhbXBsZXNbZXhhbXBsZV0gPT0gbnVsbCkgZXhhbXBsZSA9IE9iamVjdC5rZXlzKHRoaXMuZXhhbXBsZXMpWzBdIHx8IFwiXCI7XG5cdFx0dGhpcy5zZWxlY3RlZCA9IGxvY2FsU3RvcmFnZS5zcGVsbEVkaXRvckV4YW1wbGUgPSBleGFtcGxlO1xuXHRcdHRoaXMub3V0cHV0ID0gXCJcIjtcblx0fVxuXG5cdC8vIENyZWF0ZSBhIG5ldyBleGFtcGxlLlxuXHQvLyBTYXZlcyBhbmQgc2VsZWN0cyB0aGUgZXhhbXBsZSBhdXRvbWF0aWNhbGx5LlxuXHR1cGRhdGUobmFtZSwgY29kZSwgc2tpcFNhdmUpIHtcblx0XHR0aGlzLmV4YW1wbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5leGFtcGxlcywgeyBbIG5hbWUgXTogY29kZSB9KTtcblx0XHR0aGlzLnNlbGVjdChuYW1lKTtcblx0XHR0aGlzLm91dHB1dCA9IFwiXCI7XG5cdFx0aWYgKCFza2lwU2F2ZSkgdGhpcy5zYXZlKCk7XG5cdH1cblxuXHQvLyBEZWxldGUgYW4gZXhhbXBsZS5cblx0Ly8gU2F2ZXMgYW5kIHNlbGVjdHMgYW5vdGhlciBleGFtcGxlIGF1dG9tYXRpY2FsbHkuXG5cdGRlbGV0ZShuYW1lID0gdGhpcy5zZWxlY3RlZCwgc2hvd0NvbmZpcm0pIHtcblx0XHRpZiAoc2hvd0NvbmZpcm0gJiYgIWNvbmZpcm0oYFJlYWxseSBkZWxldGUgZXhhbXBsZSAke25hbWV9P2ApKSByZXR1cm47XG5cdFx0bGV0IGV4YW1wbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5leGFtcGxlcyk7XG5cdFx0ZGVsZXRlIGV4YW1wbGVzW25hbWVdO1xuXHRcdHRoaXMuZXhhbXBsZXMgPSBleGFtcGxlcztcblx0XHR0aGlzLnNhdmUoKTtcblx0XHR0aGlzLnNlbGVjdCgpO1xuXHR9XG5cblx0Ly8gQ3JlYXRlIGEgbmV3IGV4YW1wbGUuXG5cdGNyZWF0ZShuYW1lLCBjb2RlID0gXCJcIikge1xuXHRcdC8vIElmIG5vIG5hbWUsIHByb21wdC5cblx0XHRpZiAoIW5hbWUpIG5hbWUgPSBwcm9tcHQoXCJOYW1lIGZvciB0aGlzIGV4YW1wbGU/XCIpO1xuXHRcdC8vIEZvcmdldCBpdCBpZiBubyBuYW1lLlxuXHRcdGlmICghbmFtZSkgcmV0dXJuO1xuXG5cdFx0dGhpcy51cGRhdGUobmFtZSwgY29kZSk7XG5cdH1cblxuXHQvLyBSZW5hbWUgYW4gZXhhbXBsZS5cblx0Ly8gU2VsZWN0cyBhbmQgc2F2ZXMgYXV0b21hdGljYWxseS5cblx0cmVuYW1lKG9sZE5hbWUgPSB0aGlzLnNlbGVjdGVkLCBuZXdOYW1lKSB7XG5cdFx0Ly8gSWYgbm8gbmV3IG5hbWUsIHByb21wdC5cblx0XHRpZiAoIW5ld05hbWUpIG5ld05hbWUgPSBwcm9tcHQoXCJOZXcgbmFtZSBmb3IgdGhpcyBleGFtcGxlP1wiLCBvbGROYW1lKTtcblxuXHRcdC8vIEZvcmdldCBpdCBpZiBubyBuYW1lIHN1cHBsaWVkIG9yIG5hbWUgaXMgdGhlIHNhbWVcblx0XHRpZiAoIW5ld05hbWUgfHwgbmV3TmFtZSA9PT0gb2xkTmFtZSkgcmV0dXJuO1xuXHRcdGlmICh0aGlzLmV4YW1wbGVzW25ld05hbWVdKSByZXR1cm4gY29uc29sZS53YXJuKGBleGFtcGxlcy5yZW5hbWUoXCIke25ld05hbWV9XCIpOiBuYW1lIGFscmVhZHkgaW4gdXNlYCk7XG5cblx0XHRsZXQgY29kZSA9IHRoaXMuZXhhbXBsZXNbb2xkTmFtZV07XG5cdFx0dGhpcy5kZWxldGUob2xkTmFtZSk7XG5cdFx0dGhpcy51cGRhdGUobmV3TmFtZSwgY29kZSk7XG5cdH1cblxuXHQvLyBEdXBsaWNhdGUgYW4gZXhhbXBsZS5cblx0ZHVwbGljYXRlKG9sZE5hbWUgPSB0aGlzLnNlbGVjdGVkLCBuZXdOYW1lKSB7XG5cdFx0Ly8gSWYgbm8gbmV3IG5hbWUsIHByb21wdC5cblx0XHRpZiAoIW5ld05hbWUpIG5ld05hbWUgPSBwcm9tcHQoXCJOZXcgbmFtZSBmb3IgZHVwbGljYXRlIGV4YW1wbGU/XCIsIG9sZE5hbWUpO1xuXHRcdC8vIEZvcmdldCBpdCBpZiBubyBuYW1lIHN1cHBsaWVkIG9yIG5hbWUgaXMgdGhlIHNhbWVcblx0XHRpZiAoIW5ld05hbWUgfHwgbmV3TmFtZSA9PT0gb2xkTmFtZSkgcmV0dXJuO1xuXHRcdGlmICh0aGlzLmV4YW1wbGVzW25ld05hbWVdKSByZXR1cm4gY29uc29sZS53YXJuKGBleGFtcGxlcy5yZW5hbWUoXCIke25ld05hbWV9XCIpOiBuYW1lIGFscmVhZHkgaW4gdXNlYCk7XG5cblx0XHR0aGlzLnVwZGF0ZShuZXdOYW1lLCB0aGlzLmNvZGUpO1xuXHR9XG5cblx0Ly8gQ29tcGlsZSB0aGUgY3VycmVudCBleGFtcGxlLCBwbGFjaW5nIGl0IGluIG91ciBgb3V0cHV0YC5cbi8vVE9ETzogc29tZSB3YXkgdG8gZG8gdGhpcyBhdXRvbWF0aWNhbGx5IHcvIFwib3V0cHV0XCIgP1xuXHRjb21waWxlKCkge1xuXHRcdHRoaXMub3V0cHV0ID0gXCIuLi5jb21waWxpbmcuLi5cIjtcblx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdGxldCByZXN1bHQgPSBwYXJzZXIucGFyc2UoXCJzdGF0ZW1lbnRzXCIsIHRoaXMuY29kZSk7XG5cdFx0XHRpZiAoIXJlc3VsdCkge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oXCJDYW4ndCBwYXJzZSFcIik7XG5cdFx0XHRcdHRoaXMub3V0cHV0ID0gXCJDYW4ndCBwYXJzZSBzdGF0ZW1lbnRzXCI7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5pbmZvKFwiUmVzdWx0XCIsIHJlc3VsdCk7XG5cdFx0XHRcdHRoaXMub3V0cHV0ID0gcmVzdWx0LnRvU291cmNlKHBhcnNlcik7XG5cdFx0XHR9XG5cdFx0fSwgMTAwKTtcblx0fVxuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL0V4YW1wbGVTdG9yZS5qcyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGZcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW5ldy1mdW5jXG4gIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbmlmICh0eXBlb2YgX19nID09ICdudW1iZXInKSBfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qc1xuLy8gbW9kdWxlIGlkID0gNDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vL1xuLy8gIDxTcGFjZXI+IGNvbXBvbmVudCBmb3IgdXNlIHdpdGggb2FrLlxuLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gXCJwcm9wLXR5cGVzXCI7XG5pbXBvcnQgeyBjbGFzc05hbWVzIH0gZnJvbSBcIi4vdXRpbFwiO1xuXG5pbXBvcnQgXCIuL1NwYWNlci5sZXNzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNwYWNlcihwcm9wcykge1xuICBjb25zdCB7XG4gICAgY2xhc3NOYW1lLFxuICAgIGFwcGVhcmFuY2UsIHNpemUsIHdpZHRoLCBoZWlnaHQsXG4gICAgaW5saW5lLCBmbHVpZCwgdGlueSwgc21hbGwsIG1lZGl1bSwgbGFyZ2UsIGh1Z2UsIG1hc3NpdmVcbiAgfSA9IHByb3BzO1xuXG4gIGNvbnN0IHNwYWNlclByb3BzID0ge1xuICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lcyhjbGFzc05hbWUsIFwib2FrXCIsIHNpemUsIGFwcGVhcmFuY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHsgaW5saW5lLCBmbHVpZCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInNwYWNlclwiKSxcbiAgICBzdHlsZToge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIDxkaXYgey4uLnNwYWNlclByb3BzfS8+O1xufVxuXG5TcGFjZXIucHJvcFR5cGVzID0ge1xuICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIGFwcGVhcmFuY2U6IFByb3BUeXBlcy5zdHJpbmcsXG4gIHNpemU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLFxuICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIsXG5cbiAgaW5saW5lOiBQcm9wVHlwZXMuYm9vbCxcbiAgZmx1aWQ6IFByb3BUeXBlcy5ib29sLFxuXG59O1xuXG5TcGFjZXIuZGVmYXVsdFByb3BzID0ge1xuICBzaXplOiBcIm1lZGl1bVwiXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL1NwYWNlci5qc3giLCJpbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgcHJvcFR5cGVzIGZyb20gXCJwcm9wLXR5cGVzXCI7XG5pbXBvcnQgeyBUZXh0QXJlYSB9IGZyb20gJ3NlbWFudGljLXVpLXJlYWN0J1xuXG4vL1xuLy9cdCMgPFRhYmJhYmxlVGV4dEFyZWE+IC0tIDxTVUkuVGV4dEFyZWE+IGluIHdoaWNoIHlvdSBjYW4gdHlwZSBhIHRhYiBjaGFyYWN0ZXI6XG4vL1x0LSBJZiBub3RoaW5nIGlzIHNlbGVjdGVkLCBpbnNlcnRzIGEgdGFiIGNoYXJhY3RlclxuLy9cdC0gSWYgYW55dGhpbmcgaXMgc2VsZWN0ZWQsIGluc2VydHMgdGFiIGNoYXJhY3RlcnMgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZShzKVxuLy9cdC0gSWYgc2hpZnQga2V5IGlzIGRvd24sIGluc2VydHMgdGFiIGNoYXJhY3RlcnMgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZShzKS5cbi8vXG4vL1x0IyMjIFByb3BlcnRpZXNcbi8vXHQtIGBzYXZlYCAocmVxdWlyZWQpIC0tIGZ1bmN0aW9uIHVzZWQgdG8gc2F2ZSB0aGUgcmVzdWx0cyBvbiBrZXlwcmVzc1xuLy9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhYmJhYmxlVGV4dEFyZWEgZXh0ZW5kcyBUZXh0QXJlYSB7XG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gPFRleHRBcmVhIHsuLi50aGlzLnByb3BzfSBvbktleURvd249e3RoaXMub25LZXlEb3dufSAvPjtcblx0fVxuXG5cdC8vIERvIE5PVCBleGl0IG9uIHRhYiAtLSBpbnNlcnQgb3IgcmVtb3ZlIHRhYihzKSB2YWx1ZSBpbnN0ZWFkLlxuXHRvbktleURvd24gPSAoZXZlbnQpID0+IHtcblxuLy9UT0RPIGZpcmUgYHRoaXMucHJvcHMub25LZXlEb3duYCBpZiBkZWZpbmVkLi4uXG5cdFx0Ly8gRm9yZ2V0IGl0IGlmIG5vdCBhIHRhYlxuXHRcdGlmIChldmVudC5rZXlDb2RlICE9PSA5KSByZXR1cm47XG5cblx0XHQvLyBwcmV2ZW50IGRlZmF1bHQgc28gd2UgZG9uJ3QgZXhpdCB0aGUgZmllbGRcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0Ly8gZmlndXJlIG91dCB0aGUgdGV4dCByYW5nZVxuXHRcdHZhciBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuXHRcdHZhciB0ZXh0ID0gZWxlbWVudC52YWx1ZTtcblx0XHR2YXIgc3RhcnQgPSBlbGVtZW50LnNlbGVjdGlvblN0YXJ0O1xuXHRcdHZhciBlbmQgPSBlbGVtZW50LnNlbGVjdGlvbkVuZDtcblxuXHRcdC8vIFJlcGxhY2VtZW50IHRleHRcblx0XHRsZXQgbmV3VGV4dCA9IFwiXCIsIHNlbGVjdGlvblN0YXJ0ID0gc3RhcnQsIHNlbGVjdGlvbkVuZCA9IGVuZDtcblxuXHRcdC8vIElmIHNlbGVjdGlvbiBpcyBlbXB0eSxcblx0XHRpZiAoc3RhcnQgPT09IGVuZCAmJiAhZXZlbnQuc2hpZnRLZXkpIHtcblx0XHRcdG5ld1RleHQgPSBcIlxcdFwiO1xuXHRcdFx0c2VsZWN0aW9uU3RhcnQgPSBzZWxlY3Rpb25FbmQgPSBlbmQgKyAxO1xuXHRcdH1cblx0XHQvLyBvdGhlcndpc2UgaW5kZW50L2RlLWluZGVudCBhbGwgb2YgdGhlIGxpbmVzXG5cdFx0ZWxzZSB7XG5cdFx0Ly8gdXNlIHN0YXJ0IGFuZCBlbmQgb2YgbGluZShzKVxuLy9jb25zb2xlLmluZm8oYHN0YXJ0OiAke3N0YXJ0fSA6JHt0ZXh0W3N0YXJ0XX06ICAgZW5kOiAke2VuZH0gOiAke3RleHRbZW5kXX06YCk7XG5cdFx0XHRpZiAodGV4dFtzdGFydF0gIT09IFwiXFxuXCIpIHN0YXJ0ID0gdGV4dC5sYXN0SW5kZXhPZihcIlxcblwiLCBzdGFydCkgKyAxO1xuXHRcdFx0aWYgKHRleHRbZW5kLTFdID09PSBcIlxcblwiKSBlbmQtLTtcblx0XHRcdGVsc2UgaWYgKHRleHRbZW5kKzFdICE9PSBcIlxcblwiKSBlbmQgPSB0ZXh0LmluZGV4T2YoXCJcXG5cIiwgZW5kKSAtIDE7XG4vL2NvbnNvbGUuaW5mbyhgc3RhcnQ6ICR7c3RhcnR9IDoke3RleHRbc3RhcnRdfTogICBlbmQ6ICR7ZW5kfSA6ICR7dGV4dFtlbmRdfTpgKTtcblxuXHRcdFx0bGV0IGxpbmVzID0gdGV4dC5zbGljZShzdGFydCwgZW5kKS5zcGxpdChcIlxcblwiKTtcblx0XHRcdC8vIGlmIHNoaWZ0IGtleSBpcyBkb3duLCBSRU1PVkUgYSB0YWIgZnJvbSBlYWNoIGxpbmVcblx0XHRcdGlmIChldmVudC5zaGlmdEtleSkge1xuXHRcdFx0XHRsaW5lcyA9IGxpbmVzLm1hcChsaW5lID0+IGxpbmVbMF0gPT09IFwiXFx0XCIgPyBsaW5lLnN1YnN0cigxKSA6IGxpbmUpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gb3RoZXJ3aXNlIEFERCBhIHRhYiB0byBlYWNoIGxpbmVcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRsaW5lcyA9IGxpbmVzLm1hcChsaW5lID0+IFwiXFx0XCIgKyBsaW5lKTtcblx0XHRcdH1cblx0XHRcdHNlbGVjdGlvblN0YXJ0ID0gc3RhcnQ7XG5cdFx0XHRuZXdUZXh0ID0gbGluZXMuam9pbihcIlxcblwiKTtcblx0XHRcdHNlbGVjdGlvbkVuZCA9IHNlbGVjdGlvblN0YXJ0ICsgbmV3VGV4dC5sZW5ndGggKyAxO1xuXHRcdH1cblxuXHRcdC8vIFVwZGF0ZSBpbnB1dCB2YWx1ZS5cblx0XHRlbGVtZW50LnZhbHVlIFx0PSB0ZXh0LnN1YnN0cigwLCBzdGFydClcblx0XHRcdFx0XHRcdCsgbmV3VGV4dFxuXHRcdFx0XHRcdFx0KyB0ZXh0LnN1YnN0cihlbmQpO1xuXG5cdFx0Ly8gVXBkYXRlIHRoZSBzZWxlY3Rpb25cblx0XHRlbGVtZW50LnNlbGVjdGlvblN0YXJ0ID0gc2VsZWN0aW9uU3RhcnQ7XG5cdFx0ZWxlbWVudC5zZWxlY3Rpb25FbmQgPSBzZWxlY3Rpb25FbmQ7XG5cblx0XHQvLyBEZWxlZ2F0ZSB0byBgcHJvcHMub25DaGFuZ2VgIHRvIHNhdmUgdGhlIHZhbHVlIG91dHNpZGUgb2YgdGhlIGNvbnRyb2xcblx0XHRpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkgdGhpcy5wcm9wcy5vbkNoYW5nZShldmVudCk7XG5cdH1cblxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC9UYWJiYWJsZVRleHRBcmVhLmpzeCIsIi8vIENvbW1vbiBpbXBvcnRzXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcblxuLy8gUGFyc2VyXG5pbXBvcnQgcGFyc2VyIGZyb20gXCIuLi9ydWxlcy9zcGVsbC9pbmRleC5qc1wiO1xuXG4vLyBBcHAtc3BlY2lmaWMgaW1wb3J0c1xuaW1wb3J0IFNwZWxsRWRpdG9yIGZyb20gXCIuL1NwZWxsRWRpdG9yLmpzeFwiO1xuXG4vLyBLaWNrIG9mZiBvdXIgdG9wLWxldmVsIGVsZW1lbnRcblJlYWN0RE9NLnJlbmRlcihcbiAgPFNwZWxsRWRpdG9yIC8+LFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVhY3Qtcm9vdCcpXG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC9pbmRleC5qc3giLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICBSZWFjdCBVdGlsaXR5IGZ1bmN0aW9uc1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIGBjbGFzc05hbWVzYCwgY29uY2VwdCBzdG9sZW4gZnJvbTogIGh0dHA6Ly9qZWR3YXRzb24uZ2l0aHViLmlvL2NsYXNzbmFtZXNcbmV4cG9ydCBmdW5jdGlvbiBjbGFzc05hbWVzICguLi5hcmdzKSB7XG4gIHJldHVybiBhcmdzLm1hcCggYXJnID0+IHtcbiAgICBpZiAoIWFyZykgcmV0dXJuIFwiXCI7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYXJnKSkgcmV0dXJuIGNsYXNzTmFtZXMoLi4uYXJnKTtcbiAgICBzd2l0Y2ggKHR5cGVvZiBhcmcpIHtcbiAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgIGNhc2UgXCJzdHJpbmdcIjogIHJldHVybiBhcmc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoYXJnKS5tYXAoIGtleSA9PiBhcmdba2V5XSA/IGtleSA6IFwiXCIpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihCb29sZWFuKVxuICAgICAgICAgICAgICAgIC5qb2luKFwiIFwiKTtcbiAgICB9XG4gIH0pLmZpbHRlcihCb29sZWFuKVxuICAgIC5qb2luKFwiIFwiKTtcbn1cblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC91dGlsLmpzIiwiLy8gTWVtb2l6ZS9mb3JnZXQgc2VtYW50aWNzLlxuXG4vLyBSZXR1cm4gYSBtZW1vaXppbmcgZ2V0dGVyIGZ1bmN0aW9uLlxuLy8gVEVTVE1FXG5leHBvcnQgZnVuY3Rpb24gbWVtb2l6ZWQocHJvcGVydHksIGdldHRlcikge1xuXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHRoaXNbcHJvcGVydHldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHZhciB2YWx1ZSA9IGdldHRlci5hcHBseSh0aGlzKTtcblx0XHRcdGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdC8vIERlZmluZSBzbyB0aGF0IHdlIGNhbiBiZSBkZWxldGVkIGFuZCByZS1kZWZpbmVkLCBidXQgbm90IHNldCBvciBlbnVtZXJhdGVkLlxuXHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcGVydHksIHsgdmFsdWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRoaXNbcHJvcGVydHldO1xuXHR9XG59XG5cblxuLy8gUmV0dXJuIGEgbWVtb2l6ZSBmdW5jdGlvbiBmb3IgdXNlIGFzIGEgZ2V0dGVyIGluIGEgYE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgpYFxuLy8gVEVTVE1FXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lTWVtb2l6ZWQocHJvcGVydHksIGdldHRlcikge1xuXHRyZXR1cm4ge1xuXHRcdGdldCA6IG1lbW9pemVkKHByb3BlcnR5LCBnZXR0ZXIpXG5cdH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9tZW1vaXplLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIHBhcnNpbmcganN4XG4vL1xuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuLi8uLi9Ub2tlbml6ZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5cbi8vIENyZWF0ZSBcIkpTWFwiIHBhcnNlci5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JNb2R1bGUoXCJKU1hcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwianN4XCIsXG4gICAgYWxpYXM6IFsgXCJleHByZXNzaW9uXCIsIFwic3RhdGVtZW50XCIgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MganN4RWxlbWVudCBleHRlbmRzIFJ1bGUge1xuICAgICAgLy8gVGV4dCBzdHJpbmdzIGdldCBlbmNvZGVkIGFzIGB0ZXh0YCBvYmplY3RzIGluIHRoZSB0b2tlbiBzdHJlYW0uXG4gICAgICBwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQgPSB0b2tlbnMubGVuZ3RoKSB7XG4gICAgICAgIGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG4gICAgICAgIGlmICghKHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEVsZW1lbnQpKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSh7XG4gICAgICAgICAgbWF0Y2hlZDogdG9rZW4sXG4gICAgICAgICAgbmV4dFN0YXJ0OiBzdGFydCArIDFcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgb3VyIGF0dHJpYnV0ZXMgdG8gc291cmNlLlxuICAgICAgLy8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBubyBhdHRyaWJ1dGVzLlxuICAgICAgYXR0cnNUb1NvdXJjZShqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIGxldCBhdHRyaWJ1dGVzID0ganN4RWxlbWVudC5hdHRyaWJ1dGVzO1xuICAgICAgICBpZiAoIWF0dHJpYnV0ZXMgfHwgIWF0dHJpYnV0ZXMubGVuZ3RoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgICAgIGxldCBhdHRycyA9IGF0dHJpYnV0ZXMubWFwKCAoeyBuYW1lLCB2YWx1ZSB9KSA9PiB7XG4gICAgICAgICAgLy8gaWYgTk8gdmFsdWUsIGFzc3VtZSBpdCdzIGEgdmFyaWFibGUgb2YgdGhlIHNhbWUgbmFtZVxuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB2YWx1ZSA9IG5hbWU7XG4gICAgICAgICAgLy8gaWYgaXQncyBhbiBhcnJheSwgaXQncyBhIHNwZWxsIGV4cHJlc3Npb24sIHBvc3NpYmx5IHdpdGggbmVzdGVkIEpTWCBlbGVtZW50cy4uLlxuICAgICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5qc3hFeHByZXNzaW9uVG9Tb3VyY2UodmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBlbHNlIGlmIGEgSlNYIGVsZW1lbnQsIHJlY3Vyc2VcbiAgICAvL1RPRE86IGluZGVudC4uLlxuICAgICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9Tb3VyY2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGlmIGEgbnVtYmVyIG9yIFRleHQgbGl0ZXJhbCwganVzdCB1c2UgaXRcblxuICAgICAgICAgIC8vIHNwZWNpYWwgY2FzZSBgY2xhc3NgIHRvIGBjbGFzc05hbWVgIGJlY2F1c2UgUmVhY3QgaXMgZWZmaW5nIHBlcnNuaWNrZXR5LlxuICAgICAgICAgIGlmIChuYW1lID09PSBcImNsYXNzXCIpIG5hbWUgPSBcImNsYXNzTmFtZVwiO1xuICAgIC8vVE9ETzogZXNjYXBlIG5hbWVzIHdoaWNoIGFyZSBpbnZhbGlkIEpTIGlkZW50aWZpZXJzXG4gICAgICAgICAgcmV0dXJuIGAke25hbWV9OiAke3ZhbHVlfWA7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBgeyAke2F0dHJzLmpvaW4oXCIsIFwiKX0gfWA7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhbiBhcnJheSB3aXRoIHNvdXJjZSBmb3IgZWFjaCBvZiBvdXIgY2hpbGRyZW4uXG4gICAgICAvLyBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIHdlIGRvbid0IGhhdmUgYW55IGNoaWxkcmVuLlxuICAgICAgY2hpbGRyZW5Ub1NvdXJjZShqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIGxldCBjaGlsZHJlbiA9IGpzeEVsZW1lbnQuY2hpbGRyZW47XG4gICAgICAgIGlmICghY2hpbGRyZW4gfHwgY2hpbGRyZW4ubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcbiAgICAvL1RPRE86IGVzY2FwZSBpbm5lciBxdW90ZXMuLi5cbiAgICAgICAgICBpZiAodHlwZW9mIGNoaWxkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAvL2ZvcmdldCBpdCBpZiB3aGl0ZXNwYWNlIG9ubHkuLi4gPz8/XG4gICAgICAgICAgICBsZXQgdGV4dCA9IGNoaWxkLnRyaW0oKTtcbiAgICAgICAgICAgIGlmICghdGV4dCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJldHVybiBgXCIke3RleHR9XCJgO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBUb2tlbml6ZXIuSlNYRWxlbWVudCkge1xuICAgICAgICAgICAgbGV0IGNoaWxkU291cmNlID0gdGhpcy5qc3hFbGVtZW50VG9Tb3VyY2UoY2hpbGQpO1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkU291cmNlLnNwbGl0KFwiXFxuXCIpLmpvaW4oXCJcXG5cXHRcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIFRva2VuaXplci5KU1hFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5qc3hFeHByZXNzaW9uVG9Tb3VyY2UoY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJjaGlsZHJlblRvU291cmNlKCk6IGRvbid0IHVuZGVyc3RhbmQgY2hpbGRcIiArICBjaGlsZCk7XG4gICAgICAgIH0pXG4gICAgICAgIC8vIHJlbW92ZSB1bmRlZmluZWQvZW1wdHkgc3RyaW5nIHJ1bGVzXG4gICAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgSlNYIGV4cHJlc3Npb24gKCBgey4uLn1gICkgdG8gSlMgc291cmNlLlxuICAgICAganN4RXhwcmVzc2lvblRvU291cmNlKGpzeEV4cHJlc3Npb24pIHtcbiAgICAgICAgbGV0IHRva2VucyA9IGpzeEV4cHJlc3Npb24udG9rZW5zO1xuICAgIGNvbnNvbGUuaW5mbyhqc3hFeHByZXNzaW9uLCB0b2tlbnMpO1xuICAgICAgICByZXR1cm4gXCIvXCIgKyBgKlRPRE86ICR7dG9rZW5zLmpvaW4oXCIgXCIpfSpgICsgXCIvXCI7XG4gICAgICB9XG5cbiAgICAgIGpzeEVsZW1lbnRUb1NvdXJjZShqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIC8vIGdldCB0aGUgYml0cyBvZiB0aGUgb3V0cHV0XG4gICAgICAgIGxldCB0YWdOYW1lID0gYFwiJHtqc3hFbGVtZW50LnRhZ05hbWV9XCJgO1xuICAgICAgICBsZXQgYXR0cnMgPSB0aGlzLmF0dHJzVG9Tb3VyY2UoanN4RWxlbWVudCk7XG4gICAgICAgIGxldCBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW5Ub1NvdXJjZShqc3hFbGVtZW50KTtcblxuICAgICAgICBsZXQgb3V0cHV0ID0gYGNyZWF0ZUVsZW1lbnQoJHt0YWdOYW1lfWA7XG4gICAgICAgIGlmICghYXR0cnMgJiYgY2hpbGRyZW4pIGF0dHJzID0gXCJudWxsXCI7XG5cbiAgICAgICAgaWYgKGF0dHJzKSBvdXRwdXQgKz0gYCwgJHthdHRyc31gO1xuICAgICAgICBpZiAoY2hpbGRyZW4pIHtcbiAgICAgICAgICBvdXRwdXQgKz0gXCIsXFxuXFx0XCIgKyBjaGlsZHJlbi5qb2luKFwiLFxcblxcdFwiKSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0ICs9IFwiKVwiXG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5qc3hFbGVtZW50VG9Tb3VyY2UodGhpcy5tYXRjaGVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvSlNYLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBpZiBzdGF0ZW1lbnRzLlxuLy9cblxuaW1wb3J0IFBhcnNlciwgeyBQYXJzZUVycm9yIH0gZnJvbSBcIi4uLy4uL1BhcnNlclwiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVcIjtcblxuLy8gQ3JlYXRlIFwiaWZcIiBwYXJzZXIuXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTW9kdWxlKFwiaWZcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwiaWZcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiaWYge2NvbmRpdGlvbjpleHByZXNzaW9ufSAodGhlbnw6KT8ge3N0YXRlbWVudH0/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlmXyBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGNvbmRpdGlvbiwgc3RhdGVtZW50cyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYGlmICgke2NvbmRpdGlvbn0pICR7c3RhdGVtZW50c31gO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgc2luZ2xlLWxpbmUgaWYgc3RhdGVtZW50c1wiLFxuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiaWYgYVwiLCBcImlmIChhKSB7fVwiXSxcbiAgICAgICAgICBbXCJpZiBhIHRoZW5cIiwgXCJpZiAoYSkge31cIl0sXG4gICAgICAgICAgW1wiaWYgYTpcIiwgXCJpZiAoYSkge31cIl0sXG4gICAgICAgICAgW1wiaWYgYSB0aGVuIGIgPSAxXCIsIFwiaWYgKGEpIHsgYiA9IDEgfVwiXSxcbiAgICAgICAgICBbXCJpZiBhOiBiID0gMVwiLCBcImlmIChhKSB7IGIgPSAxIH1cIl0sXG4gICAgICAgICAgW1wiaWYgYSA6IGIgPSAxXCIsIFwiaWYgKGEpIHsgYiA9IDEgfVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgbXVsdGktbGluZSBpZiBibG9ja3NcIixcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudHNcIixcbiAgICAgICAgdGVzdHM6IHtcbiAgICAgICAgICBcIlNlcGFyYXRlIGJsb2NrcyBpZiBubyBpbmRlbnRhdGlvbiBvbiBzZWNvbmQgbGluZS5cIjpcbiAgICAgICAgICAgICAgW1wiaWYgYTpcXG5iID0gMVwiLCBcImlmIChhKSB7fVxcbmIgPSAxXCJdLFxuICAgICAgICAgIFwiSW5kZW50IHdpdGggdGFiXCI6XG4gICAgICAgICAgICAgIFtcImlmIGE6XFxuXFx0YiA9IDFcIiwgXCJpZiAoYSkge1xcblxcdGIgPSAxXFxufVwiXSxcbiAgICAgICAgICBcIkFOWSBudW1iZXIgb2Ygc3BhY2VzIHNob3VsZCBjb3VudCBhcyBpbmRlbnRhdGlvblwiOlxuICAgICAgICAgICAgICBbXCJpZiBhOlxcbiBiID0gMVwiLCBcImlmIChhKSB7XFxuXFx0YiA9IDFcXG59XCJdLFxuICAgICAgICAgIFwiTXVsdGlwbGUgbGluZXMgaW4gdGhlIG5lc3RlZCBibG9ja1wiOlxuICAgICAgICAgICAgICBbXCJpZiBhOlxcblxcdGIgPSAxXFxuXFx0YyA9IDJcIiwgXCJpZiAoYSkge1xcblxcdGIgPSAxXFxuXFx0YyA9IDJcXG59XCJdLFxuICAgICAgICAgIFwiTmVzdGVkIGlmcyB3b3JrIGZpbmVcIjpcbiAgICAgICAgICAgICAgW1wiaWYgYVxcblxcdGlmIGJcXG5cXHRcXHRjPTJcIiwgXCJpZiAoYSkge1xcblxcdGlmIChiKSB7XFxuXFx0XFx0YyA9IDJcXG5cXHR9XFxufVwiXSxcbiAgICAgICAgICBcIlByZWZlciBuZXN0ZWQgYmxvY2sgdG8gaW5saW5lZCBzdGF0ZW1lbnRcIjpcbiAgICAgICAgICAgICAgW1wiaWYgYSBiID0gMVxcblxcdGMgPSAyXCIsIFwiaWYgKGEpIHtcXG5cXHRjID0gMlxcbn1cIl0sXG4gICAgICAgIH1cbiAgICAgIH0sXG4vL1RFU1RNRTogdGVzdCBmdWxsIGlmL2Vsc2UgaWYvZWxzZSBibG9ja3NcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIC8vIE5PVEU6IHRoaXMgTVVTVCBiZSBiZWZvcmUgYGVsc2VgIG9yIHRoYXQgd2lsbCBlYXQgYGVsc2UgaWZgIHN0YXRlbWVudHMuLi4gOi0oXG4gICAgbmFtZTogXCJlbHNlX2lmXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIihlbHNlfG90aGVyd2lzZSkgaWYge2NvbmRpdGlvbjpleHByZXNzaW9ufSAodGhlbnw6KSB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZWxzZV9pZiBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGNvbmRpdGlvbiwgc3RhdGVtZW50cyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYGVsc2UgaWYgKCR7Y29uZGl0aW9ufSkgJHtzdGF0ZW1lbnRzfWBcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIHNpbmdsZS1saW5lIGVsc2VfaWYgc3RhdGVtZW50c1wiLFxuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiZWxzZSBpZiBhIHRoZW5cIiwgXCJlbHNlIGlmIChhKSB7fVwiXSxcbiAgICAgICAgICBbXCJlbHNlIGlmIGEgdGhlbiBiID0gMVwiLCBcImVsc2UgaWYgKGEpIHsgYiA9IDEgfVwiXSxcbiAgICAgICAgICBbXCJlbHNlIGlmIGE6IGIgPSAxXCIsIFwiZWxzZSBpZiAoYSkgeyBiID0gMSB9XCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBtdWx0aS1saW5lIGVsc2VfaWYgYmxvY2tzXCIsXG4gICAgICAgIGNvbXBpbGVBczogXCJzdGF0ZW1lbnRzXCIsXG4gICAgICAgIHRlc3RzOiB7XG4gICAgICAgICAgXCJTZXBhcmF0ZSBibG9ja3MgaWYgbm8gaW5kZW50YXRpb24gb24gc2Vjb25kIGxpbmUuXCI6XG4gICAgICAgICAgICAgIFtcImVsc2UgaWYgYTpcXG5iID0gMVwiLCBcImVsc2UgaWYgKGEpIHt9XFxuYiA9IDFcIl0sXG4gICAgICAgICAgXCJJbmRlbnQgd2l0aCB0YWJcIjpcbiAgICAgICAgICAgICAgW1wiZWxzZSBpZiBhOlxcblxcdGIgPSAxXCIsIFwiZWxzZSBpZiAoYSkge1xcblxcdGIgPSAxXFxufVwiXSxcbiAgICAgICAgICBcIkFOWSBudW1iZXIgb2Ygc3BhY2VzIHNob3VsZCBjb3VudCBhcyBpbmRlbnRhdGlvblwiOlxuICAgICAgICAgICAgICBbXCJlbHNlIGlmIGE6XFxuIGIgPSAxXCIsIFwiZWxzZSBpZiAoYSkge1xcblxcdGIgPSAxXFxufVwiXSxcbiAgICAgICAgICBcIk11bHRpcGxlIGxpbmVzIGluIHRoZSBuZXN0ZWQgYmxvY2tcIjpcbiAgICAgICAgICAgICAgW1wiZWxzZSBpZiBhOlxcblxcdGIgPSAxXFxuXFx0YyA9IDJcIiwgXCJlbHNlIGlmIChhKSB7XFxuXFx0YiA9IDFcXG5cXHRjID0gMlxcbn1cIl0sXG4vL0ZJWE1FICAgICAgICAgIFwiTmVzdGVkIGlmcyB3b3JrIGZpbmVcIjpcbi8vICAgICAgICAgICAgW1wiZWxzZSBpZiBhXFxuXFx0aWYgYlxcblxcdFxcdGM9MlwiLCBcImVsc2UgaWYgKGEpIHtcXG5cXHRpZiAoYikge1xcblxcdFxcdGMgPSAyXFxuXFx0fVxcbn1cIl0sXG4vL0ZJWE1FICAgICAgICAgIFwiUHJlZmVyIG5lc3RlZCBibG9jayB0byBpbmxpbmVkIHN0YXRlbWVudFwiOlxuLy8gICAgICAgICAgICBbXCJlbHNlIGlmIGEgYiA9IDFcXG5cXHRjID0gMlwiLCBcImVsc2UgaWYgKGEpIHtcXG5cXHRjID0gMlxcbn1cIl0sXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImVsc2VcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiKGVsc2V8b3RoZXJ3aXNlKSAoOik/IHtzdGF0ZW1lbnR9P1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBlbHNlXyBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHN0YXRlbWVudHMgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBlbHNlICR7c3RhdGVtZW50c31gXG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBzaW5nbGUtbGluZSBlbHNlIHN0YXRlbWVudHNcIixcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImVsc2VcIiwgXCJlbHNlIHt9XCJdLFxuICAgICAgICAgIFtcIm90aGVyd2lzZVwiLCBcImVsc2Uge31cIl0sXG4gICAgICAgICAgW1wiZWxzZSBiID0gMVwiLCBcImVsc2UgeyBiID0gMSB9XCJdLFxuICAgICAgICAgIFtcIm90aGVyd2lzZSBiID0gMVwiLCBcImVsc2UgeyBiID0gMSB9XCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBtdWx0aS1saW5lIGVsc2UgYmxvY2tzXCIsXG4gICAgICAgIGNvbXBpbGVBczogXCJzdGF0ZW1lbnRzXCIsXG4gICAgICAgIHRlc3RzOiB7XG4gICAgICAgICAgXCJTZXBhcmF0ZSBibG9ja3MgaWYgbm8gaW5kZW50YXRpb24gb24gc2Vjb25kIGxpbmUuXCI6XG4gICAgICAgICAgICAgIFtcImVsc2VcXG5iID0gMVwiLCBcImVsc2Uge31cXG5iID0gMVwiXSxcbiAgICAgICAgICBcIkluZGVudCB3aXRoIHRhYlwiOlxuICAgICAgICAgICAgICBbXCJlbHNlXFxuXFx0YiA9IDFcIiwgXCJlbHNlIHtcXG5cXHRiID0gMVxcbn1cIl0sXG4gICAgICAgICAgXCJBTlkgbnVtYmVyIG9mIHNwYWNlcyBzaG91bGQgY291bnQgYXMgaW5kZW50YXRpb25cIjpcbiAgICAgICAgICAgICAgW1wiZWxzZVxcbiBiID0gMVwiLCBcImVsc2Uge1xcblxcdGIgPSAxXFxufVwiXSxcbiAgICAgICAgICBcIk11bHRpcGxlIGxpbmVzIGluIHRoZSBuZXN0ZWQgYmxvY2tcIjpcbiAgICAgICAgICAgICAgW1wiZWxzZVxcblxcdGIgPSAxXFxuXFx0YyA9IDJcIiwgXCJlbHNlIHtcXG5cXHRiID0gMVxcblxcdGMgPSAyXFxufVwiXSxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAgLy8gTk9URTogdGhpcyBpcyBOT1QgYSBibG9ja1N0YXRlbWVudCFcbiAge1xuICAgIG5hbWU6IFwiYmFja3dhcmRzX2lmXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIntzdGF0ZW1lbnR9IGlmIHtjb25kaXRpb246ZXhwcmVzc2lvbn0gKD86KGVsc2V8b3RoZXJ3aXNlKSB7ZWxzZVN0YXRlbWVudDpzdGF0ZW1lbnR9KT9cIixcbiAgICBsZWZ0UmVjdXJzaXZlOiB0cnVlLFxuICAgIHRlc3RSdWxlOiBuZXcgUnVsZS5LZXl3b3Jkcyh7IGxpdGVyYWxzOiBbIFwiaWZcIiBdIH0pLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBiYWNrd2FyZHNfaWYgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBjb25kaXRpb24sIHN0YXRlbWVudCwgZWxzZVN0YXRlbWVudCB9ID0gdGhpcy5yZXN1bHRzO1xuLy9UT0RPOiBzbWFydGVyIHdyYXBwaW5nP1xuICAgICAgICBsZXQgb3V0cHV0ID0gYGlmICgke2NvbmRpdGlvbn0pIHsgJHtzdGF0ZW1lbnR9IH1gO1xuICAgICAgICBpZiAoZWxzZVN0YXRlbWVudCkgb3V0cHV0ICs9IGBcXG5lbHNlIHsgJHtlbHNlU3RhdGVtZW50fSB9YFxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgc2luZ2xlLWxpbmUgYmFja3dhcmRzX2lmIHN0YXRlbWVudHNcIixcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImIgPSAxIGlmIGFcIiwgXCJpZiAoYSkgeyBiID0gMSB9XCJdLFxuICAgICAgICAgIFtcImIgPSAxIGlmIGEgZWxzZSBiID0gMlwiLCBcImlmIChhKSB7IGIgPSAxIH1cXG5lbHNlIHsgYiA9IDIgfVwiXSxcbiAgICAgICAgICBbXCJiID0gMSBpZiBhIG90aGVyd2lzZSBiID0gMlwiLCBcImlmIChhKSB7IGIgPSAxIH1cXG5lbHNlIHsgYiA9IDIgfVwiXSxcbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfSxcbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvaWYuanMiLCIvL1xuLy9cdCMgUnVsZXMgZm9yIGRlYWxpbmcgd2l0aCBsaXN0c1xuLy9cblxuLy8gVE9ETzogY29uZmlybSBpZGVudGlmaWVycyBhcmUgcGx1cmFsIGluIHNvbWUgb2YgdGhlIGJlbG93P1xuLy8gVE9ETzogYGxpc3QuY2xvbmUoKWAgdG8gcmV0dXJuIG5ldyBsaXN0IG9mIHNhbWUgdHlwZS5cblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG5pbXBvcnQgeyBpc1BsdXJhbCwgc2luZ3VsYXJpemUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc3RyaW5nXCI7XG5cbi8vIENyZWF0ZSBcImxpc3RzXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck1vZHVsZShcImxpc3RzXCIpO1xuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG5cbi8vIFdPUktJTkcgRlJPTSBPVEhFUiBSVUxFUyAodGVzdG1lKVxuLy9cdGB0aGUgbGVuZ3RoIG9mIDxsaXN0PmBcbi8vXHRgPHRoaW5nPiBpcyBub3Q/IGluIDxsaXN0PmBcbi8vXHRgPGxpc3Q+IGlzIG5vdD8gZW1wdHlgXG4vL1x0YHNldCBpdGVtIDEgb2YgbXlMaXN0IHRvICdhJ2BcblxuXG4vLyBUT0RPOiBcdGBjcmVhdGUgbGlzdCB3aXRoIDxleHA+LCA8ZXhwPiwgPGV4cD5gXG4vLyBUT0RPOlx0YGR1cGxpY2F0ZSBsaXN0YFxuLy8gVE9ETzpcdGBkdXBsaWNhdGUgbGlzdCB3aXRoIDxleHA+LCA8ZXhwPiwgPGV4cD5gID8/P1xuLy8gVE9ETzpcdGB0aGUgc2l6ZSBvZiA8bGlzdD5gID0+IHdpbGwgbWFwIHRvIGBsaXN0LnNpemVgLi4uXG4vL1x0XHRcdFx0LSBpbnN0YWxsIGBzaXplYCBhcyBhbiBhbGlhcyB0byBgbGVuZ3RoYD9cbi8vIFRPRE86XHRgbW92ZSA8dGhpbmc+IHRvIGVuZCBvZiA8bGlzdD5gID8/P1xuLy8gVE9ETzpcdGBTZXRgIGZvciBhIHVuaXF1ZSBsaXN0P1xuLy8gVE9ETzpcdHR5cGVkIGxpc3Q/XG4vLyBUT0RPOlx0bGlzdCB3aGljaCB3b24ndCB0YWtlIG51bGwvdW5kZWZpbmVkXG5cblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICAvLyBSZXR1cm4gdGhlIGxlbmd0aCBvZiB0aGUgbGlzdC5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9sZW5ndGhcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcInRoZT8gbnVtYmVyIG9mIHtpZGVudGlmaWVyfSBpbiB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X2xlbmd0aCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxpc3QsIGlkZW50aWZpZXIgfSA9IHRoaXMucmVzdWx0cztcbiAgLy8gVE9ETzogc3BlY2lhbCBjYXNlICd3b3JkcycsICdsaW5lcycsIGV0Y1xuICAgICAgICByZXR1cm4gYCR7bGlzdH0ubGVuZ3RoYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gUmV0dXJuIHRoZSBmaXJzdCBwb3NpdGlvbiBvZiBzcGVjaWZpZWQgaXRlbSBpbiB0aGUgbGlzdCBhcyBhbiBhcnJheS5cbiAgLy8gSWYgaXRlbSBpcyBub3QgZm91bmQsIHJldHVybnMgYHVuZGVmaW5lZGAuXG4gIC8vIE5PVEU6IHRoaXMgcG9zaXRpb24gcmV0dXJuZWQgaXMgKioxLWJhc2VkKiouXG4gIC8vVEVTVE1FXG4gIC8vIFRPRE86IGBwb3NpdGlvbnNgLCBgbGFzdCBwb3NpdGlvbmAsIGBhZnRlci4uLmBcbiAge1xuICAgIG5hbWU6IFwibGlzdF9wb3NpdGlvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwidGhlPyBwb3NpdGlvbiBvZiB7dGhpbmc6ZXhwcmVzc2lvbn0gaW4ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9wb3NpdGlvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwucG9zaXRpb25PZigke3RoaW5nfSwgJHtsaXN0fSlgXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vXG4gIC8vXHRPcmRpbmFsIG51bWJlcnMgKGZpcnN0LCBzZWNvbmQsIGxhc3QsIGV0YykuXG4gIC8vIFRPRE86IHNpeHR5LWZpZnRoLCB0d28gaHVuZHJlZCBmb3J0eSBuaW50aC4uLlxuICAvL1xuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImZpcnN0XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAxIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJzZWNvbmRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDIgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInRoaXJkXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAzIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJmb3VydGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDQgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImZpZnRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiA1IH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJzaXh0aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gNiB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwic2V2ZW50aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gNyB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiZWlnaHRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiA4IH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJuaW50aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gOSB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwidGVudGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDEwIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJwZW51bHRpbWF0ZVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gLTIgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImZpbmFsXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAtMSB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwibGFzdFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gLTEgfVxuICAgIH1cbiAgfSxcblxuXG5cbiAgLy8gdHJlYXQgbGlzdCBhcyBhIHN0YWNrIG9yIHF1ZXVlXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwidG9wXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAxIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJib3R0b21cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIC0xIH1cbiAgICB9XG4gIH0sXG5cblxuXG4gIC8vIEluZGV4IGV4cHJlc3Npb246IG51bWVyaWMgcG9zaXRpb24gaW4gc29tZSBsaXN0LlxuICAvL1x0ZS5nLlx0YGNhcmQgMSBvZiB0aGUgcGlsZWBcbiAgLy9cdFx0XHRgY2FyZCAjMiBvZiB0aGUgcGlsZWBcbiAgLy9cdFx0XHRgdGhlIGZpcnN0IGNhcmQgb2YgdGhlIHBpbGVgXG4gIC8vXG4gIC8vIE5PVEU6IE5lZ2F0aXZlIG51bWVyaWMgcG9zaXRpb25zIGNvbWUgZnJvbSB0aGUgRU5EIG9mIHRoZSBsaXN0LlxuICAvL1x0ZS5nLlx0YGNhcmQgLTEgb2YgdGhlIHBpbGVgXG4gIC8vXG4gIC8vIE5PVEU6IE91ciBwb3NpdGlvbnMgYXJlICoqMS1iYXNlZCoqIGFuZCBKYXZhc2NyaXB0IGlzICoqMC1iYXNlZCoqLlxuICAvL1x0XHQgZS5nLiBgaXRlbSAxIG9mIHRoZSBhcnJheWAgID0gYGFycmF5WzBdYFxuICAvL1xuICAvLyBUT0RPOiBpZiBgaWRlbnRpZmllcmAgaXMgXCJ3b3JkXCIsIG91dHB1dCBgZ2V0V29yZCgpYCBldGNcbiAgLy8gVE9ETzogc3BlY2lhbCBjYXNlICd3b3JkcycsICdsaW5lcycsIGV0YyA/XG4gIHtcbiAgICBuYW1lOiBcInBvc2l0aW9uX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBbXG4gICAgICBcIntpZGVudGlmaWVyfSB7cG9zaXRpb246ZXhwcmVzc2lvbn0gb2YgKHRoZT8pIHtleHByZXNzaW9ufVwiLFxuICAgICAgXCJ0aGUge3Bvc2l0aW9uOm9yZGluYWx9IHtpZGVudGlmaWVyfSBvZiAodGhlPykge2V4cHJlc3Npb259XCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBwb3NpdGlvbl9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZXtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyLCBwb3NpdGlvbiwgZXhwcmVzc2lvbiB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICAvLyBJZiB3ZSBnb3QgYSBwb3NpdGl2ZSBudW1iZXIgbGl0ZXJhbCwgY29tcGVuc2F0ZSBmb3IgSlMgMC1iYXNlZCBhcnJheXMgbm93LCBmb3IgbmljZXIgb3V0cHV0LlxuICAgICAgICBpZiAodHlwZW9mIHBvc2l0aW9uID09PSBcIm51bWJlclwiICYmIHBvc2l0aW9uID4gMCkge1xuICAgICAgICAgIHJldHVybiBgJHtleHByZXNzaW9ufVske3Bvc2l0aW9uIC0gMX1dYDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYHNwZWxsLmdldEl0ZW0oJHtleHByZXNzaW9ufSwgJHtwb3NpdGlvbn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBQaWNrIGEgU0lOR0xFIHJhbmRvbSBpdGVtIGZyb20gdGhlIGxpc3QuXG4gIC8vIFRPRE86IGNvbmZpcm0gaWRlbnRpZmllciBpcyBwbHVyYWw/XG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcInJhbmRvbV9wb3NpdGlvbl9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJhIHJhbmRvbSB7aWRlbnRpZmllcn0gKG9mfGZyb218aW4pICh0aGUpPyB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5kb21fcG9zaXRpb25fZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5kb21JdGVtT2YoJHtsaXN0fSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBQaWNrIGEgdW5pcXVlIHNldCBvZiByYW5kb20gaXRlbXMgZnJvbSB0aGUgbGlzdCwgcmV0dXJuaW5nIGFuIGFycmF5LlxuICAvLyBUT0RPOiBgdHdvIHJhbmRvbSBpdGVtcy4uLmBcbiAgLy8gVE9ETzogY29uZmlybSBpZGVudGlmaWVyIGlzIHBsdXJhbD9cbiAgLy8gVE9ETzogYGxpc3QuY2xvbmUoKWAgdG8gcmV0dXJuIG5ldyBsaXN0IG9mIHNhbWUgdHlwZS5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmFuZG9tX3Bvc2l0aW9uc19leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7bnVtYmVyfSByYW5kb20ge2lkZW50aWZpZXJ9IChvZnxmcm9tfGluKSAodGhlKT8ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZG9tX3Bvc2l0aW9uc19leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbnVtYmVyLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0UmFuZG9tSXRlbXNPZigke2xpc3R9LCAke251bWJlcn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBSYW5nZSBleHByZXNzaW9uLlxuICAvLyBSZXR1cm5zIGEgbmV3IGxpc3QuXG4gIC8vIE5PVEU6IGBzdGFydGAgaXMgKioxLWJhc2VkKiouXG4gIC8vIE5PVEU6IGBlbmRgIGlzIGluY2x1c2l2ZSFcbiAgLy8gVE9ETzogY29uZmlybSBpZGVudGlmaWVyIGlzIHBsdXJhbD9cbiAgLy8gVE9ETzogYGxpc3QuY2xvbmUoKWAgdG8gcmV0dXJuIG5ldyBsaXN0IG9mIHNhbWUgdHlwZS5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmFuZ2VfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2lkZW50aWZpZXJ9IHtzdGFydDpleHByZXNzaW9ufSB0byB7ZW5kOmV4cHJlc3Npb259IG9mIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJhbmdlX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBzdGFydCwgZW5kLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0UmFuZ2UoJHtsaXN0fSwgJHtzdGFydH0sICR7ZW5kfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBTdGFydGluZyByYW5nZSBleHByZXNzaW9uLlxuICAvLyBSZXR1cm5zIGEgbmV3IGxpc3QuXG4gIC8vIGUuZy5cdGBmaXJzdCA0IGl0ZW1zIG9mIGxpc3RgXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImZpcnN0X2luX3JhbmdlXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJmaXJzdCB7bnVtYmVyOmV4cHJlc3Npb259IHtpZGVudGlmaWVyfSAoaW58b2YpIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJhbmdlX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBudW1iZXIsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5nZSgke2xpc3R9LCAxLCAke251bWJlcn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gRW5kaW5nIHJhbmdlIGV4cHJlc3Npb24uXG4gIC8vIFJldHVybnMgYSBuZXcgbGlzdC5cbiAgLy8gZS5nLlx0YGxhc3QgNCBpdGVtcyBvZiBsaXN0YFxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsYXN0X2luX3JhbmdlXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJsYXN0IHtudW1iZXI6ZXhwcmVzc2lvbn0ge2lkZW50aWZpZXJ9IChpbnxvZikge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG51bWJlciwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldEVuZFJhbmdlKCR7bGlzdH0sIDEsICR7bnVtYmVyfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFJhbmdlIGV4cHJlc3Npb24gc3RhcnRpbmcgYXQgc29tZSBpdGVtIGluIHRoZSBsaXN0LlxuICAvLyBSZXR1cm5zIGEgbmV3IGxpc3QuXG4gIC8vIElmIGl0ZW0gaXMgbm90IGZvdW5kLCByZXR1cm5zIGFuIGVtcHR5IGxpc3QuICg/Pz8pXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcInJhbmdlX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIntpZGVudGlmaWVyfSAoaW58b2YpIHtsaXN0OmV4cHJlc3Npb259IHN0YXJ0aW5nIHdpdGgge3RoaW5nOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJhbmdlX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldFJhbmdlKCR7bGlzdH0sIHNwZWxsLnBvc2l0aW9uT2YoJHt0aGluZ30sICR7bGlzdH0pKWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gTGlzdCBmaWx0ZXIuXG4gIC8vIE5PVEU6IHdlIHdpbGwgc2luZ3VsYXJpemUgYGlkZW50aWZpZXJgIGFuZCB1c2UgdGhhdCBhcyB0aGUgYXJndW1lbnQgdG8gYGV4cHJlc3Npb25gLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2ZpbHRlclwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2lkZW50aWZpZXJ9IChpbnxvZikge2xpc3Q6ZXhwcmVzc2lvbn0gd2hlcmUge2NvbmRpdGlvbjpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X2ZpbHRlciBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGlkZW50aWZpZXIsIGNvbmRpdGlvbiwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICAvLyB1c2Ugc2luZ3VsYXIgb2YgaWRlbnRpZmllciBmb3IgbWV0aG9kIGFyZ3VtZW50XG4gICAgICAgIGxldCBhcmd1bWVudCA9IHNpbmd1bGFyaXplKGlkZW50aWZpZXIudG9Tb3VyY2UoKSk7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZmlsdGVyKCR7bGlzdH0sICR7YXJndW1lbnR9ID0+ICR7Y29uZGl0aW9ufSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFNldCBtZW1iZXJzaGlwIChsZWZ0IHJlY3Vyc2l2ZSkuXG4gIC8vIE5PVEU6IHdlIHdpbGwgc2luZ3VsYXJpemUgYGlkZW50aWZpZXJgIGFuZCB1c2UgdGhhdCBhcyB0aGUgYXJndW1lbnQgdG8gYGV4cHJlc3Npb25gLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X21lbWJlcnNoaXBfdGVzdFwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2xpc3Q6ZXhwcmVzc2lvbn0gKG9wZXJhdG9yOmhhc3xoYXMgbm98ZG9lc250IGhhdmV8ZG9lcyBub3QgaGF2ZSkge2lkZW50aWZpZXJ9IHdoZXJlIHtmaWx0ZXI6ZXhwcmVzc2lvbn1cIixcbiAgICBsZWZ0UmVjdXJzaXZlOiB0cnVlLFxuICAgIHRlc3RSdWxlOiBuZXcgUnVsZS5LZXl3b3Jkcyh7IG1hdGNoOiBcIndoZXJlXCIgfSksXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfbWVtYmVyc2hpcF90ZXN0IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgaWRlbnRpZmllciwgb3BlcmF0b3IsIGZpbHRlciwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBsZXQgYmFuZyA9IG9wZXJhdG9yID09PSBcImhhc1wiID8gXCJcIiA6IFwiIVwiO1xuICAgICAgICAvLyB1c2Ugc2luZ3VsYXIgb2YgaWRlbnRpZmllciBmb3IgbWV0aG9kIGFyZ3VtZW50XG4gICAgICAgIGxldCBhcmd1bWVudCA9IHNpbmd1bGFyaXplKGlkZW50aWZpZXIudG9Tb3VyY2UoKSk7XG4gICAgICAgIHJldHVybiBgJHtiYW5nfXNwZWxsLmFueSgke2xpc3R9LCAke2FyZ3VtZW50fSA9PiAke2ZpbHRlcn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy9cbiAgLy9cdEFkZGluZyB0byBsaXN0IChpbi1wbGFjZSlcbiAgLy9cblxuICAvLyBBZGQgdG8gZW5kIG9mIGxpc3QuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfYXBwZW5kXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImFwcGVuZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwiYWRkIHt0aGluZzpleHByZXNzaW9ufSB0byAoKHRoZT8pIGVuZCBvZik/IHtsaXN0OmV4cHJlc3Npb259XCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X2FwcGVuZCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuYXBwZW5kKCR7bGlzdH0sICR7dGhpbmd9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIEFkZCB0byBiZWdpbm5pbmcgb2YgbGlzdC5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9wcmVwZW5kXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBbXG4gICAgICBcInByZXBlbmQge3RoaW5nOmV4cHJlc3Npb259IHRvIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgICBcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8gdGhlIChzdGFydHxmcm9udHx0b3ApIG9mIHtsaXN0OmV4cHJlc3Npb259XCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3ByZXBlbmQgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnByZXBlbmQoJHtsaXN0fSwgJHt0aGluZ30pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gQWRkIHRvIG1pZGRsZSBvZiBsaXN0LCBwdXNoaW5nIGV4aXN0aW5nIGl0ZW1zIG91dCBvZiB0aGUgd2F5LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2FkZF9hdFwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJhZGQge3RoaW5nOmV4cHJlc3Npb259IHRvIHtsaXN0OmV4cHJlc3Npb259IGF0IHBvc2l0aW9uIHtwb3NpdGlvbjpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3NwbGljZSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBwb3NpdGlvbiwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnNwbGljZSgke2xpc3R9LCAke3Bvc2l0aW9ufSwgJHt0aGluZ30pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBUT0RPOiAgXHRcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn0gYmVmb3JlIHtpdGVtOmV4cHJlc3Npb259XCIsXG5cbiAgLy8gQWRkIHRvIG1pZGRsZSBvZiBsaXN0LCBwdXNoaW5nIGV4aXN0aW5nIGl0ZW1zIG91dCBvZiB0aGUgd2F5LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2FkZF9hZnRlclwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJhZGQge3RoaW5nOmV4cHJlc3Npb259IHRvIHtsaXN0OmV4cHJlc3Npb259IGFmdGVyIHtpdGVtOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfYWRkX2FmdGVyIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIGl0ZW0sIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5zcGxpY2UoJHtsaXN0fSwgc3BlbGwucG9zaXRpb25PZigke2xpc3R9LCAke2l0ZW19KSwgJHt0aGluZ30pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy9cbiAgLy9cdFJlbW92aW5nIGZyb20gbGlzdCAoaW4tcGxhY2UpXG4gIC8vXG5cbiAgLy8gRW1wdHkgbGlzdC5cbiAgLy9UT0RPOiBtYWtlIGBlbXB0eWAgYW5kL29yIGBjbGVhcmAgYSBnZW5lcmljIHN0YXRlbWVudD8/P1xuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2VtcHR5XCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIihlbXB0eXxjbGVhcikge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9lbXB0eSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5jbGVhcigke2xpc3R9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFJlbW92ZSBvbmUgaXRlbSBmcm9tIGxpc3QgYnkgcG9zaXRpb24uXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcmVtb3ZlX3Bvc2l0aW9uXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJlbW92ZSB7aWRlbnRpZmllcn0ge251bWJlcjpleHByZXNzaW9ufSBvZiB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3JlbW92ZV9wb3NpdGlvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG51bWJlciwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnJlbW92ZUl0ZW0oJHtsaXN0fSwgJHtudW1iZXJ9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFJlbW92ZSByYW5nZSBvZiB0aGluZ3MgZnJvbSBsaXN0LlxuICAvLyBOT1RFOiBgc3RhcnRgIGlzICoqMS1iYXNlZCoqLlxuICAvLyBOT1RFOiBgZW5kYCBpcyBpbmNsdXNpdmUhXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcmVtb3ZlX3JhbmdlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJlbW92ZSB7aWRlbnRpZmllcn0ge3N0YXJ0OmV4cHJlc3Npb259IHRvIHtlbmQ6ZXhwcmVzc2lvbn0gb2Yge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9yZW1vdmVfcG9zaXRpb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBzdGFydCwgZW5kLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwucmVtb3ZlUmFuZ2UoJHtsaXN0fSwgJHtzdGFydH0sICR7ZW5kfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFJlbW92ZSBhbGwgaW5zdGFuY2VzIG9mIHNvbWV0aGluZyBmcm9tIGEgbGlzdC5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9yZW1vdmVcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwicmVtb3ZlIHt0aGluZzpleHByZXNzaW9ufSBmcm9tIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcmVtb3ZlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5yZW1vdmUoJHtsaXN0fSwgJHt0aGluZ30pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gUmVtb3ZlIGFsbCBpdGVtcyBmcm9tIGxpc3Qgd2hlcmUgY29uZGl0aW9uIGlzIHRydWUuXG4gIC8vIE5PVEU6IHdlIHdpbGwgc2luZ3VsYXJpemUgYGlkZW50aWZpZXJgIGFuZCB1c2UgdGhhdCBhcyB0aGUgYXJndW1lbnQgdG8gYGV4cHJlc3Npb25gLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3JlbW92ZV93aGVyZVwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJyZW1vdmUge2lkZW50aWZpZXJ9IChpbnxvZnxmcm9tKSB7bGlzdDpleHByZXNzaW9ufSB3aGVyZSB7Y29uZGl0aW9uOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcmVtb3ZlX3doZXJlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgaWRlbnRpZmllciwgY29uZGl0aW9uLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIC8vIHVzZSBzaW5ndWxhciBvZiBpZGVudGlmaWVyIGZvciBtZXRob2QgYXJndW1lbnRcbiAgICAgICAgbGV0IGFyZ3VtZW50ID0gc2luZ3VsYXJpemUoaWRlbnRpZmllci50b1NvdXJjZSgpKTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5yZW1vdmVXaGVyZSgke2xpc3R9LCAke2FyZ3VtZW50fSA9PiAke2NvbmRpdGlvbn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvL1xuICAvL1x0UmFuZG9tIChpbi1wbGFjZSkgbGlzdCBtYW5pcHVsYXRpb24uXG4gIC8vXG5cbiAgLy8gUmV2ZXJzZSBsaXN0IGluLXBsYWNlLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3JldmVyc2VcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwicmV2ZXJzZSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3JldmVyc2UgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwucmV2ZXJzZSgke2xpc3R9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFNodWZmbGUgbGlzdCBpbi1wbGFjZS5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9zaHVmZmxlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIihyYW5kb21pemV8c2h1ZmZsZSkge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9zaHVmZmxlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnNodWZmbGUoJHtsaXN0fSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIEl0ZXJhdGlvblxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2l0ZXJhdGlvblwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJmb3IgKGVhY2gpPyB7aXRlbVZhcjppZGVudGlmaWVyfSBpbiB7bGlzdDpleHByZXNzaW9ufTo/IHtzdGF0ZW1lbnR9P1wiLFxuICAgICAgXCJmb3IgKGVhY2gpPyB7aXRlbVZhcjppZGVudGlmaWVyfSAoYW5kfCwpIHtwb3NpdGlvblZhcjppZGVudGlmaWVyfSBpbiB7bGlzdDpleHByZXNzaW9ufTo/IHtzdGF0ZW1lbnR9P1wiLFxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfaXRlcmF0aW9uIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgaXRlbVZhciwgcG9zaXRpb25WYXIsIGxpc3QsIHN0YXRlbWVudCwgYmxvY2sgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgbGV0IG91dHB1dDtcbiAgICAgICAgaWYgKHBvc2l0aW9uVmFyKSB7XG4gICAgICAgICAgb3V0cHV0ID0gYGZvciAobGV0ICR7cG9zaXRpb25WYXJ9ID0gMSwgYmFyOyAke2l0ZW1WYXJ9ID0gJHtsaXN0fVske3Bvc2l0aW9uVmFyfS0xXSwgJHtwb3NpdGlvblZhcn0gPD0gJHtsaXN0fS5sZW5ndGg7ICR7cG9zaXRpb25WYXJ9KyspIGBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBOT1RFOiB0aGlzIGlzIHJlbGF0aXZlbHkgc2xvdy4uLiAgcHJvYmFibHkgZG9lc24ndCBtYXR0ZXIuLi5cbiAgICAgICAgICBvdXRwdXQgPSBgZm9yIChsZXQgJHtpdGVtVmFyfSBvZiAke2xpc3R9KSBgO1xuICAgICAgICB9XG4gICAgICAgIG91dHB1dCArPSBSdWxlLkJsb2NrLmVuY2xvc2VTdGF0ZW1lbnRzKHN0YXRlbWVudCwgYmxvY2spO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFJhbmdlXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcInJhbmdlX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcInJhbmdlIHtzdGFydDpleHByZXNzaW9ufSB0byB7ZW5kOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJhbmdlX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBzdGFydCwgZW5kIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0UmFuZ2UoJHtzdGFydH0sICR7ZW5kfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfVxuKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ydWxlcy9zcGVsbC9saXN0cy5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgaW5maXggYW5kIHByZWZpeCBvcGVyYXRvcnMuXG4vL1xuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5cbi8vIENyZWF0ZSBcIm9wZXJhdG9yc1wiIHBhcnNlci5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JNb2R1bGUoXCJvcGVyYXRvcnNcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAgLy8gVE9ETzpcbiAgLy8gXHQvLyBGaW5kIGJlc3QgbWF0Y2ggYWNjb3JkaW5nIHRvIG9wZXJhdG9yIHByZWNlZGVuY2UgYXMgZGVmaW5lZCBiZWxvdy5cbiAgLy8gXHRnZXRCZXN0TWF0Y2gobWF0Y2hlcykge1xuICAvLyBcdFx0Y29uc29sZS53YXJuKFwiR0JNXCIsIG1hdGNoZXMsIG1hdGNoZXMubWFwKG1hdGNoID0+IG1hdGNoLnByZWNlZGVuY2UpLCBtYXRjaGVzLm1hcChtYXRjaCA9PiBtYXRjaC5tYXRjaGVkVGV4dCkpO1xuICAvLyBcdFx0cmV0dXJuIG1hdGNoZXMucmVkdWNlKGZ1bmN0aW9uIChiZXN0LCBuZXh0KSB7XG4gIC8vIFx0XHRcdC8vIHRha2UgaGlnaGVzdCBwcmVjZWRlbmNlIG1hdGNoIGZpcnN0XG4gIC8vIFx0XHRcdGlmIChuZXh0LnByZWNlZGVuY2UgPiBiZXN0LnByZWNlZGVuY2UpIHJldHVybiBuZXh0O1xuICAvLyBcdFx0XHQvLyB0YWtlIGxvbmdlc3QgbWF0Y2ggaWYgc2FtZSBwcmVjZWRlbmNlXG4gIC8vIFx0XHRcdGlmIChuZXh0LnByZWNlZGVuY2UgPT09IGJlc3QucHJlY2VkZW5jZSkge1xuICAvLyBcdFx0XHRcdGlmIChuZXh0LmVuZEluZGV4ID4gYmVzdC5lbmRJbmRleCkgcmV0dXJuIG5leHQ7XG4gIC8vIFx0XHRcdH1cbiAgLy8gXHRcdFx0cmV0dXJuIGJlc3Q7XG4gIC8vIFx0XHR9LCBtYXRjaGVzWzBdKTtcbiAgLy8gXHR9XG5cblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvcl9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7bGhzOmV4cHJlc3Npb259IHtvcGVyYXRvcjppbmZpeF9vcGVyYXRvcn0ge3JoczpleHByZXNzaW9ufVwiLFxuICAgIGxlZnRSZWN1cnNpdmU6IHRydWUsXG4gICAgdGVzdFJ1bGU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaW5maXhfb3BlcmF0b3JfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxocywgcmhzLCBfb3BlcmF0b3IgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIF9vcGVyYXRvci5hcHBseU9wZXJhdG9yKGxocywgcmhzKTtcbiAgICAgIH1cblxuICAgICAgZ2V0IHByZWNlZGVuY2UoKSB7XG4gICAgICAgIGlmICghdGhpcy5tYXRjaGVkKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJpbmZpeF9vcGVyYXRvcl9leHByZXNzaW9uOiB0cnlpbmcgdG8gbG9vayB1cCBwcmVjZWRlbmNlIHdoZW4gbm90IHBhcnNlZCFcIik7XG4gICAgICAgIGNvbnN0IHsgX29wZXJhdG9yIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBfb3BlcmF0b3IucHJlY2VkZW5jZTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8jIyBJbmZpeCBvcGVyYXRvcnM6ICAgYHtsaHN9IDxvcGVyYXRvcj4ge3Joc31gLCBlZzogYGEgaXMgMWBcbiAgLy8gTk9URTogYG9wZXJhdG9yLmFwcGx5T3BlcmF0b3JgIE1VU1QgcmV0dXJuIGEgZnVuY3Rpb24gd2hpY2ggdHJhbnNmb3JtcyB0d28gYXJndW1lbnRzIChgbGhzYCBhbmQgYHJoc2ApIGludG8gb3V0cHV0LlxuICAvLyBOT1RFOiBgcHJlY2VkZW5jZWAgbnVtYmVycyBjb21lIGZyb20gSmF2YXNjcmlwdCBlcXVpdmFsZW50c1xuICAvL1x0XHQgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvT3BlcmF0b3JzL09wZXJhdG9yX1ByZWNlZGVuY2VcbiAge1xuICAgIG5hbWU6IFwiYW5kXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDYsXG4gICAgc3ludGF4OiBcImFuZFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBhbmQgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybiBgKCR7YX0gJiYgJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBhbmQgYlwiLCBcIihhICYmIGIpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvclwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiA1LFxuICAgIHN5bnRheDogXCJvclwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvciBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuIGAoJHthfSB8fCAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIG9yIGJcIiwgXCIoYSB8fCBiKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaXNcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTAsXG4gICAgc3ludGF4OiBcImlzXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm4gYCgke2F9ID09ICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImEgaXMgYlwiLCBcIihhID09IGIpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpc19ub3RcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTAsXG4gICAgc3ludGF4OiBcImlzIG5vdFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19ub3QgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybiBgKCR7YX0gIT0gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBub3QgYlwiLCBcIihhICE9IGIpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpc19leGFjdGx5XCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDEwLFxuICAgIHN5bnRheDogXCJpcyBleGFjdGx5XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2V4YWN0bHkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybiBgKCR7YX0gPT09ICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImEgaXMgZXhhY3RseSBiXCIsIFwiKGEgPT09IGIpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaXNfbm90X2V4YWN0bHlcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTAsXG4gICAgc3ludGF4OiBcImlzIG5vdCBleGFjdGx5XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX25vdF9leGFjdGx5IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm4gYCgke2F9ICE9PSAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIGlzIG5vdCBleGFjdGx5IGJcIiwgXCIoYSAhPT0gYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIC8vVE9ETzogYHNwZWxsLmlzT2ZUeXBlKHRoaW5nLCB0eXBlKWBcbiAgLy9UT0RPOiBgaXMgc2FtZSB0eXBlIGFzYCA/XG4gIHtcbiAgICBuYW1lOiBcImlzX2FcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImlzIGFcIixcbiAgICAgIFwiaXMgYW5cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2EgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IodGhpbmcsIHR5cGUpIHsgcmV0dXJuIGBzcGVsbC5pc09mVHlwZSgke3RoaW5nfSwgJyR7dHlwZX0nKWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIGlzIGEgQlwiLCBcInNwZWxsLmlzT2ZUeXBlKGEsICdCJylcIl0sXG4gICAgICAgICAgW1wiYSBpcyBhbiBBXCIsIFwic3BlbGwuaXNPZlR5cGUoYSwgJ0EnKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaXNfbm90X2FcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImlzIG5vdCBhXCIsXG4gICAgICBcImlzIG5vdCBhblwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2EgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IodGhpbmcsIHR5cGUpIHsgcmV0dXJuIGAhc3BlbGwuaXNPZlR5cGUoJHt0aGluZ30sICcke3R5cGV9JylgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBub3QgYSBCXCIsIFwiIXNwZWxsLmlzT2ZUeXBlKGEsICdCJylcIl0sXG4gICAgICAgICAgW1wiYSBpcyBub3QgYW4gQVwiLCBcIiFzcGVsbC5pc09mVHlwZShhLCAnQScpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICAvL1RPRE86IGBzcGVsbC5jb250YWlucyhjb2xsZWN0aW9uLCB0aGluZylgXG4gIHtcbiAgICBuYW1lOiBcImlzX2luXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpcyBpblwiLFxuICAgICAgXCJpcyBvbmUgb2ZcIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2luIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKHRoaW5nLCBsaXN0KSB7IHJldHVybiBgc3BlbGwuaW5jbHVkZXMoJHtsaXN0fSwgJHt0aGluZ30pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImEgaXMgaW4gdGhlTGlzdFwiLCBcInNwZWxsLmluY2x1ZGVzKHRoZUxpc3QsIGEpXCJdLFxuICAgICAgICAgIFtcImEgaXMgb25lIG9mIHRoZUxpc3RcIiwgXCJzcGVsbC5pbmNsdWRlcyh0aGVMaXN0LCBhKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaXNfbm90X2luXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpcyBub3QgaW5cIixcbiAgICAgIFwiaXMgbm90IG9uZSBvZlwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2luIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKHRoaW5nLCBsaXN0KSB7IHJldHVybiBgIXNwZWxsLmluY2x1ZGVzKCR7bGlzdH0sICR7dGhpbmd9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIGlzIG5vdCBpbiB0aGVMaXN0XCIsIFwiIXNwZWxsLmluY2x1ZGVzKHRoZUxpc3QsIGEpXCJdLFxuICAgICAgICAgIFtcImEgaXMgbm90IG9uZSBvZiB0aGVMaXN0XCIsIFwiIXNwZWxsLmluY2x1ZGVzKHRoZUxpc3QsIGEpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuXG5cbiAge1xuICAgIG5hbWU6IFwiaW5jbHVkZXNcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImluY2x1ZGVzXCIsXG4gICAgICBcImNvbnRhaW5zXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpbmNsdWRlcyBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihsaXN0LCB0aGluZykgeyByZXR1cm4gYHNwZWxsLmluY2x1ZGVzKCR7bGlzdH0sICR7dGhpbmd9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJ0aGVMaXN0IGluY2x1ZGVzIGFcIiwgXCJzcGVsbC5pbmNsdWRlcyh0aGVMaXN0LCBhKVwiXSxcbiAgICAgICAgICBbXCJ0aGVMaXN0IGNvbnRhaW5zIGFcIiwgXCJzcGVsbC5pbmNsdWRlcyh0aGVMaXN0LCBhKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiZG9lc19ub3RfaW5jbHVkZVwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiZG9lcyBub3QgaW5jbHVkZVwiLFxuICAgICAgXCJkb2VzIG5vdCBjb250YWluXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkb2VzX25vdF9pbmNsdWRlIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGxpc3QsIHRoaW5nKSB7IHJldHVybiBgIXNwZWxsLmluY2x1ZGVzKCR7bGlzdH0sICR7dGhpbmd9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJ0aGVMaXN0IGRvZXMgbm90IGluY2x1ZGUgYVwiLCBcIiFzcGVsbC5pbmNsdWRlcyh0aGVMaXN0LCBhKVwiXSxcbiAgICAgICAgICBbXCJ0aGVMaXN0IGRvZXMgbm90IGNvbnRhaW4gYVwiLCBcIiFzcGVsbC5pbmNsdWRlcyh0aGVMaXN0LCBhKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cblxuICB7XG4gICAgbmFtZTogXCJndFwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiPlwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBndCBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gPiAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IHtcbiAgICAgICAgICBcIndpdGggc3BhY2VzXCI6IFtcImEgPiBiXCIsIFwiKGEgPiBiKVwiXSxcbiAgICAgICAgICBcIndpdGhvdXQgc3BhY2VzXCI6IFtcImE+YlwiLCBcIihhID4gYilcIl0sXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpc19ndFwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiaXMgZ3JlYXRlciB0aGFuXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2d0IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gPiAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIGlzIGdyZWF0ZXIgdGhhbiBiXCIsIFwiKGEgPiBiKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiZ3RlXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCI+PVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBndGUgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9ID49ICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czoge1xuICAgICAgICAgIFwid2l0aCBzcGFjZXNcIjogW1wiYSA+PSBiXCIsIFwiKGEgPj0gYilcIl0sXG4gICAgICAgICAgXCJ3aXRob3V0IHNwYWNlc1wiOiBbXCJhPj1iXCIsIFwiKGEgPj0gYilcIl0sXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpc19ndGVcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcImlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0b1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19ndGUgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybmAoJHthfSA+PSAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBiXCIsIFwiKGEgPj0gYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImx0XCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCI8XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGx0IGV4dGVuZHMgUnVsZS5TeW1ib2xzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybmAoJHthfSA8ICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czoge1xuICAgICAgICAgIFwid2l0aCBzcGFjZXNcIjogW1wiYSA+IGJcIiwgXCIoYSA+IGIpXCJdLFxuICAgICAgICAgIFwid2l0aG91dCBzcGFjZXNcIjogW1wiYT5iXCIsIFwiKGEgPiBiKVwiXSxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcImlzX2x0XCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCJpcyBsZXNzIHRoYW5cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbHQgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybmAoJHthfSA8ICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImEgaXMgbGVzcyB0aGFuIGJcIiwgXCIoYSA8IGIpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJsdGVcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcIjw9XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGx0ZSBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gPD0gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiB7XG4gICAgICAgICAgXCJ3aXRoIHNwYWNlc1wiOiBbXCJhIDw9IGJcIiwgXCIoYSA8PSBiKVwiXSxcbiAgICAgICAgICBcIndpdGhvdXQgc3BhY2VzXCI6IFtcImE8PWJcIiwgXCIoYSA8PSBiKVwiXSxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaXNfbHRlXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCJpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbHRlIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gPD0gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYlwiLCBcIihhIDw9IGIpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuXG4gIHtcbiAgICBuYW1lOiBcInBsdXNfc3ltYm9sXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDEzLFxuICAgIHN5bnRheDogXCJcXFxcK1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBwbHVzX3N5bWJvbCBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gKyAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhK2JcIiwgXCIoYSArIGIpXCJdLFxuICAgICAgICAgIFtcImEgKyBiXCIsIFwiKGEgKyBiKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcInBsdXNcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTMsXG4gICAgc3ludGF4OiBcInBsdXNcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcGx1cyBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9ICsgJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSBwbHVzIGJcIiwgXCIoYSArIGIpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJtaW51c19zeW1ib2xcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTMsXG4gICAgc3ludGF4OiBcIi1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbWludXNfc3ltYm9sIGV4dGVuZHMgUnVsZS5TeW1ib2xzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybmAoJHthfSAtICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czoge1xuLy8gICAgICAgIFwid2l0aG91dCBzcGFjZXNcIjogW1wiYS1iXCIsIFwiKGEgLSBiKVwiXSwgICAvLyBtaW51cyByZXF1aXJlcyBzcGFjZVxuICAgICAgICAgIFwid2l0aCBzcGFjZXNcIjogW1wiYSAtIGJcIiwgXCIoYSAtIGIpXCJdLFxuICAgICAgICB9XG4gICAgICB9LFxuICAgIF1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwibWludXNcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTMsXG4gICAgc3ludGF4OiBcIm1pbnVzXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG1pbnVzIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gLSAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIG1pbnVzIGJcIiwgXCIoYSAtIGIpXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJ0aW1lc19zdW1ib2xcIixcbiAgICBhbGlhczogW1wiaW5maXhfb3BlcmF0b3JcIl0sXG4gICAgcHJlY2VkZW5jZTogMTQsXG4gICAgc3ludGF4OiBcIlxcXFwqXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHRpbWVzIGV4dGVuZHMgUnVsZS5TeW1ib2xzIHtcbiAgICAgIGFwcGx5T3BlcmF0b3IoYSxiKSB7IHJldHVybmAoJHthfSAqICR7Yn0pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czoge1xuICAgICAgICAgIFwid2l0aG91dCBzcGFjZXNcIjogW1wiYSpiXCIsIFwiKGEgKiBiKVwiXSxcbiAgICAgICAgICBcIndpdGggc3BhY2VzXCI6IFtcImEgKiBiXCIsIFwiKGEgKiBiKVwiXSxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcInRpbWVzXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDE0LFxuICAgIHN5bnRheDogXCJ0aW1lc1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0aW1lcyBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9ICogJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiYSB0aW1lcyBiXCIsIFwiKGEgKiBiKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiZGl2aXNpb25fc3ltYm9sXCIsXG4gICAgYWxpYXM6IFtcImluZml4X29wZXJhdG9yXCJdLFxuICAgIHByZWNlZGVuY2U6IDE0LFxuICAgIHN5bnRheDogXCIvXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRpdmlkZWRfYnkgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHlPcGVyYXRvcihhLGIpIHsgcmV0dXJuYCgke2F9IC8gJHtifSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiB7XG4gICAgICAgICAgXCJ3aXRob3V0IHNwYWNlc1wiOiBbXCJhL2JcIiwgXCIoYSAvIGIpXCJdLFxuICAgICAgICAgIFwid2l0aCBzcGFjZXNcIjogW1wiYSAvIGJcIiwgXCIoYSAvIGIpXCJdLFxuICAgICAgICB9XG4gICAgICB9LFxuICAgIF1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiZGl2aWRlZF9ieVwiLFxuICAgIGFsaWFzOiBbXCJpbmZpeF9vcGVyYXRvclwiXSxcbiAgICBwcmVjZWRlbmNlOiAxNCxcbiAgICBzeW50YXg6IFwiZGl2aWRlZCBieVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkaXZpZGVkX2J5IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKGEsYikgeyByZXR1cm5gKCR7YX0gLyAke2J9KWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIGRpdmlkZWQgYnkgYlwiLCBcIihhIC8gYilcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIC8vXG4gIC8vIyMgUG9zdGlmeCBvcGVyYXRvcnM6ICAgYHtsaHN9IDxvcGVyYXRvcj5gLCBlLmcuIGBhIGlzIGRlZmluZWRgXG4gIC8vIE5PVEU6IGBvcGVyYXRvci5hcHBseU9wZXJhdG9yYCBNVVNUIHJldHVybiBhIGZ1bmN0aW9uIHdoaWNoIHRyYW5zZm9ybXMgYXJndW1lbnQgKGBsaHNgKSBpbnRvIEpTIG91dHB1dC5cblxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIntleHByZXNzaW9ufSB7b3BlcmF0b3I6cG9zdGZpeF9vcGVyYXRvcn1cIixcbiAgICBsZWZ0UmVjdXJzaXZlOiB0cnVlLFxuICAgIHRlc3RSdWxlOiBcInBvc3RmaXhfb3BlcmF0b3JcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcG9zdGZpeF9vcGVyYXRvcl9leHByZXNpb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBleHByZXNzaW9uLCBfb3BlcmF0b3IgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIF9vcGVyYXRvci5hcHBseU9wZXJhdG9yKGV4cHJlc3Npb24pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpc19kZWZpbmVkXCIsXG4gICAgYWxpYXM6IFtcInBvc3RmaXhfb3BlcmF0b3JcIl0sXG4gICAgc3ludGF4OiBcImlzIGRlZmluZWRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfZGVmaW5lZCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcih0aGluZykgeyByZXR1cm4gYCh0eXBlb2YgJHt0aGluZ30gIT09ICd1bmRlZmluZWQnKWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJhIGlzIGRlZmluZWRcIiwgXCIodHlwZW9mIGEgIT09ICd1bmRlZmluZWQnKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcImlzX3VuZGVmaW5lZFwiLFxuICAgIGFsaWFzOiBbXCJwb3N0Zml4X29wZXJhdG9yXCJdLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpcyB1bmRlZmluZWRcIixcbiAgICAgIFwiaXMgbm90IGRlZmluZWRcIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX3VuZGVmaW5lZCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHlPcGVyYXRvcih0aGluZykgeyByZXR1cm4gYCh0eXBlb2YgJHt0aGluZ30gPT09ICd1bmRlZmluZWQnKWAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcImV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJ0aGluZyBpcyB1bmRlZmluZWRcIiwgXCIodHlwZW9mIHRoaW5nID09PSAndW5kZWZpbmVkJylcIl0sXG4gICAgICAgICAgW1widGhpbmcgaXMgbm90IGRlZmluZWRcIiwgXCIodHlwZW9mIHRoaW5nID09PSAndW5kZWZpbmVkJylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImlzX2VtcHR5XCIsXG4gICAgYWxpYXM6IFtcInBvc3RmaXhfb3BlcmF0b3JcIl0sXG4gICAgc3ludGF4OiBcImlzIGVtcHR5XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2VtcHR5IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKHRoaW5nKSB7IHJldHVybiBgc3BlbGwuaXNFbXB0eSgke3RoaW5nfSlgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1widGhpbmcgaXMgZW1wdHlcIiwgXCJzcGVsbC5pc0VtcHR5KHRoaW5nKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcImlzX25vdF9lbXB0eVwiLFxuICAgIGFsaWFzOiBbXCJwb3N0Zml4X29wZXJhdG9yXCJdLFxuICAgIHN5bnRheDogXCJpcyBub3QgZW1wdHlcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2VtcHR5IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseU9wZXJhdG9yKHRoaW5nKSB7IHJldHVybiBgIXNwZWxsLmlzRW1wdHkoJHt0aGluZ30pYCB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcInRoaW5nIGlzIG5vdCBlbXB0eVwiLCBcIiFzcGVsbC5pc0VtcHR5KHRoaW5nKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cblxuICAvL1xuICAvLyMjIFByZWZpeCBvcGVyYXRvcnM6ICAgYDxvcGVyYXRvcj4ge2xoc31gLCBlLmcuIGByb3VuZCB0aGVMaXN0YFxuICAvLyBOT1RFOiBgb3BlcmF0b3IuYXBwbHlPcGVyYXRvcmAgTVVTVCByZXR1cm4gYSBmdW5jdGlvbiB3aGljaCB0cmFuc2Zvcm1zIGFyZ3VtZW50IChgbGhzYCkgaW50byBKUyBvdXRwdXQuXG5cbiAge1xuICAgIG5hbWU6IFwiYWJzb2x1dGVfdmFsdWVcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4vL0ZJWE1FOiBtYWtlIGB0aGVgIG9wdGlvbmFsXG4gICAgc3ludGF4OiBcInRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB7ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgYWJzb2x1dGVfdmFsdWUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBjb25zdCB7IGV4cHJlc3Npb24gfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBNYXRoLmFicygke2V4cHJlc3Npb259KWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcInRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGluZ1wiLCBcIk1hdGguYWJzKHRoaW5nKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwibWF4XCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuLy9GSVhNRTogXCJ0aGU/XCJcbiAgICBzeW50YXg6IFwiKG1heHxtYXhpbXVtfGxhcmdlc3R8YmlnZ2VzdCkge2lkZW50aWZpZXJ9PyAob2Z8aW4pIHtleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBtYXggZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBjb25zdCB7IGV4cHJlc3Npb24gfSA9IHRoaXMucmVzdWx0cztcbi8vIFRPRE86IE1hdGgubWF4KCkgZG9lc24ndCB3b3JrIHdoZW4gcGFzc2VkIGFuIGFycmF5Li4uIDotKFxuICAgICAgICByZXR1cm4gYHNwZWxsLm1heCgke2V4cHJlc3Npb259KWBcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wibWF4IG9mIHRoaW5nXCIsIFwic3BlbGwubWF4KHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJtYXggaW4gdGhpbmdcIiwgXCJzcGVsbC5tYXgodGhpbmcpXCJdLFxuICAgICAgICAgIFtcIm1heGltdW0gb2YgdGhpbmdcIiwgXCJzcGVsbC5tYXgodGhpbmcpXCJdLFxuICAgICAgICAgIFtcImxhcmdlc3Qgb2YgdGhpbmdcIiwgXCJzcGVsbC5tYXgodGhpbmcpXCJdLFxuICAgICAgICAgIFtcImJpZ2dlc3QgaW4gdGhpbmdcIiwgXCJzcGVsbC5tYXgodGhpbmcpXCJdLFxuICAgICAgICAgIFtcImJpZ2dlc3QgaXRlbSBpbiB0aGluZ1wiLCBcInNwZWxsLm1heCh0aGluZylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm1pblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbi8vRklYTUU6IFwidGhlP1wiXG4gICAgc3ludGF4OiBcIihtaW58bWluaW11bXxzbWFsbGVzdHxsZWFzdCkge2lkZW50aWZpZXJ9PyAob2Z8aW4pIHtleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBtaW4gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBjb25zdCB7IGV4cHJlc3Npb24gfSA9IHRoaXMucmVzdWx0cztcbi8vIFRPRE86IE1hdGgubWluKCkgZG9lc24ndCB3b3JrIHdoZW4gcGFzc2VkIGFuIGFycmF5Li4uIDotKFxuICAgICAgICByZXR1cm4gYHNwZWxsLm1pbigke2V4cHJlc3Npb259KWBcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wibWluIG9mIHRoaW5nXCIsIFwic3BlbGwubWluKHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJtaW4gaW4gdGhpbmdcIiwgXCJzcGVsbC5taW4odGhpbmcpXCJdLFxuICAgICAgICAgIFtcIm1pbmltdW0gb2YgdGhpbmdcIiwgXCJzcGVsbC5taW4odGhpbmcpXCJdLFxuICAgICAgICAgIFtcInNtYWxsZXN0IG9mIHRoaW5nXCIsIFwic3BlbGwubWluKHRoaW5nKVwiXSxcbiAgICAgICAgICBbXCJsZWFzdCBvZiB0aGluZ1wiLCBcInNwZWxsLm1pbih0aGluZylcIl0sXG4gICAgICAgICAgW1wic21hbGxlc3QgaXRlbSBpbiB0aGluZ1wiLCBcInNwZWxsLm1pbih0aGluZylcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG5cbiAgLy9cbiAgLy8jIyBcInN1cnJvdW5kaW5nXCIgb3BlcmF0b3IgZXhwcmVzc2lvbnM6ICAgYHJvdW5kIHRoaW5nIGRvd25gXG4gIC8vXG5cbiAge1xuICAgIG5hbWU6IFwicm91bmRfdXBfb3JfZG93blwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwicm91bmQge3RoaW5nOmV4cHJlc3Npb259IChkaXJlY3Rpb246b2ZmfHVwfGRvd24pP1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByb3VuZF91cF9vcl9kb3duIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgY29uc3QgeyB0aGluZywgZGlyZWN0aW9uIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09IFwidXBcIilcbiAgICAgICAgICByZXR1cm4gYE1hdGguY2VpbCgke3RoaW5nfSlgO1xuICAgICAgICBlbHNlIGlmIChkaXJlY3Rpb24gPT09IFwiZG93blwiKVxuICAgICAgICAgIHJldHVybiBgTWF0aC5mbG9vcigke3RoaW5nfSlgO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIGBNYXRoLnJvdW5kKCR7dGhpbmd9KWA7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcInJvdW5kIHRoaW5nXCIsIFwiTWF0aC5yb3VuZCh0aGluZylcIl0sXG4gICAgICAgICAgW1wicm91bmQgdGhpbmcgb2ZmXCIsIFwiTWF0aC5yb3VuZCh0aGluZylcIl0sXG4gICAgICAgICAgW1wicm91bmQgdGhpbmcgdXBcIiwgXCJNYXRoLmNlaWwodGhpbmcpXCJdLFxuICAgICAgICAgIFtcInJvdW5kIHRoaW5nIGRvd25cIiwgXCJNYXRoLmZsb29yKHRoaW5nKVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH1cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvb3BlcmF0b3JzLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBjcmVhdGluZyB2YXJpYWJsZXMsIHByb3BlcnR5IGFjY2VzcywgZXRjXG4vL1xuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuLi8uLi9SdWxlXCI7XG5cbi8vIENyZWF0ZSBcInN0YXRlbWVudHNcIiBwYXJzZXIuXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTW9kdWxlKFwic3RhdGVtZW50c1wiKTtcbmV4cG9ydCBkZWZhdWx0IHBhcnNlcjtcblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICAvL1xuICAvL1x0IyMgUmV0dXJuc1xuICAvL1xuXG4gIC8vIFJldHVybiBhIHZhbHVlXG4gIHtcbiAgICBuYW1lOiBcInJldHVybl9zdGF0ZW1lbnRcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwicmV0dXJuIHtleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByZXR1cm5fc3RhdGVtZW50IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgZXhwcmVzc2lvbiB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHJldHVybiAke2V4cHJlc3Npb259YDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJzdGF0ZW1lbnRcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJyZXR1cm4gdGhpbmdcIiwgXCJyZXR1cm4gdGhpbmdcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIC8vXG4gIC8vXHQjIyBBc3NpZ25tZW50XG4gIC8vXG5cbiAgLy9UT0RPOiBkaXN0aW5ndWlzaCBiZXR3ZWVuIGBuZXdfaWRlbnRpZmllcmAgYW5kIGBzY29wZWRfaWRlbnRpZmllcmA/XG4gIHtcbiAgICBuYW1lOiBcImFzc2lnbm1lbnRcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJ7dGhpbmc6ZXhwcmVzc2lvbn0gPSB7dmFsdWU6ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwic2V0IHt0aGluZzpleHByZXNzaW9ufSB0byB7dmFsdWU6ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwicHV0IHt2YWx1ZTpleHByZXNzaW9ufSBpbnRvIHt0aGluZzpleHByZXNzaW9ufVwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgYXNzaWdubWVudCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCB2YWx1ZSB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICAvLyBUT0RPOiBkZWNsYXJlIGlkZW50aWZpZXIgaWYgbm90IGluIHNjb3BlLCBldGNcbiAgICAgICAgcmV0dXJuIGAke3RoaW5nfSA9ICR7dmFsdWV9YDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJzdGF0ZW1lbnRcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJ0aGluZyA9IHllc1wiLCBcInRoaW5nID0gdHJ1ZVwiXSxcbiAgICAgICAgICBbXCJzZXQgdGhpbmcgdG8geWVzXCIsIFwidGhpbmcgPSB0cnVlXCJdLFxuICAgICAgICAgIFtcInB1dCB5ZXMgaW50byB0aGluZ1wiLCBcInRoaW5nID0gdHJ1ZVwiXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiZ2V0X3ZhbHVlXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwiZ2V0IHt2YWx1ZTpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBnZXRfdmFsdWUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB2YWx1ZSB9ID0gdGhpcy5yZXN1bHRzOztcbiAgICAgICAgcmV0dXJuIGB2YXIgaXQgPSAke3ZhbHVlfWBcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIFwiLFxuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiZ2V0IHRoaW5nXCIsIFwidmFyIGl0ID0gdGhpbmdcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL3N0YXRlbWVudHMuanMiLCIvL1xuLy9cdCMgUnVsZXMgZm9yIGRlZmluaW5nIGNsYXNzZXMgKGtub3duIGFzIGB0eXBlc2ApXG4vL1xuXG4vL1RPRE86IGNvbnN0cnVjdG9yXG4vLyBUT0RPOiBtaXhpbnMgLyB0cmFpdHMgLyBjb21wb3NlZCBjbGFzc2VzIC8gYW5ub3RhdGlvbnNcblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG5pbXBvcnQgZ2xvYmFsIGZyb20gXCIuLi8uLi91dGlscy9nbG9iYWxcIjtcbmltcG9ydCB7IHBsdXJhbGl6ZSB9IGZyb20gXCIuLi8uLi91dGlscy9zdHJpbmdcIjtcblxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck1vZHVsZShcInR5cGVzXCIpO1xuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG5wYXJzZXIuZGVmaW5lUnVsZXMoXG5cbiAgLy9NT1ZFIFRPIGBmdW5jdGlvbnNgP1xuICAvLyBBcmd1bWVudHMgY2xhdXNlIGZvciBtZXRob2RzXG4gIC8vXHRgd2l0aCBmb29gIG9yIGB3aXRoIGZvbyBhbmQgYmFyIGFuZCBiYXpgXG4gIC8vVE9ETzoge2lkZW50aWZpZXJ9ID0ge2V4cHJlc3Npb259XHQ9PiByZXF1aXJlcyBgLGAgaW5zdGVhZCBvZiBgYW5kYFxuICAvL1RPRE86IGB3aXRoIGZvbyBhcyBUeXBlYFxuICAvL1RPRE86XHRgd2l0aCBmb28uLi5gIGZvciBzcGxhdD9cbiAge1xuICAgIG5hbWU6IFwiYXJnc1wiLFxuICAgIHN5bnRheDogXCJ3aXRoIFthcmdzOntpZGVudGlmaWVyfSxdXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGFyZ3MgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIC8vIFJldHVybnMgYW4gYXJyYXkgb2YgYXJndW1lbnQgdmFsdWVzXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgY29uc3QgeyBhcmdzIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBhcmdzLmpvaW4oXCIsIFwiKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHNob3dBbGw6IHRydWUsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wid2l0aCBhXCIsIFwiYVwiXSxcbiAgICAgICAgICBbXCJ3aXRoIGEsIGIsIGNcIiwgXCJhLCBiLCBjXCJdLFxuICAgICAgICAgIFtcIndpdGggYSwgYiwgYyxcIiwgXCJhLCBiLCBjXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuXG4gIC8vIFByb3BlcnRpZXMgY2xhdXNlOiBjcmVhdGVzIGFuIG9iamVjdCB3aXRoIG9uZSBvciBtb3JlIHByb3BlcnR5IHZhbHVlcy5cbiAgLy9cdGBmb28gPSAxLCBiYXIgPSAyYFxuICAvL1RPRE86IHdvdWxkIGxpa2UgdG8gdXNlIGBhbmRgIGJ1dCB0aGF0IHdpbGwgYmFyZiBvbiBleHByZXNzaW9ucy4uLlxuICAvL1RPRE86IGhvdyB0byBkbyBwcm9wZXJ0aWVzIG9uIG11bHRpcGxlIGxpbmVzP1xuICB7XG4gICAgbmFtZTogXCJvYmplY3RfbGl0ZXJhbF9wcm9wZXJ0aWVzXCIsXG4gICAgc3ludGF4OiBcIlsoe2tleTppZGVudGlmaWVyfSg/Oj0ge3ZhbHVlOmV4cHJlc3Npb259KT8pICxdXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9iamVjdF9saXRlcmFsX3Byb3BlcnRpZXMgZXh0ZW5kcyBSdWxlLkxpc3Qge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCBwcm9wcyA9IHRoaXMubWF0Y2hlZC5tYXAoZnVuY3Rpb24gKHByb3ApIHtcbiAgICAgICAgICAgIGxldCB7IGtleSwgdmFsdWUgfSA9IHByb3AucmVzdWx0cztcbi8vVE9ETzogZG9uJ3QgcXVvdGUgaWYgd2UgZG9uJ3QgaGF2ZSB0bz9cbi8vVE9PRDogbXVsdGlwbGUgbGluZXMgaWYgPiAyIHByb3BzP1xuICAgICAgICAgICAgaWYgKHZhbHVlKSByZXR1cm4gYFwiJHtrZXl9XCI6ICR7dmFsdWV9YFxuICAgICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGB7ICR7cHJvcHMuam9pbihcIiwgXCIpfSB9YDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgICBzaG93QWxsOiB0cnVlLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtgYSA9IDFgLCBgeyBcImFcIjogMSB9YF0sXG4gICAgICAgICAgW2BhID0gMSxgLCBgeyBcImFcIjogMSB9YF0sXG4gICAgICAgICAgW2BhID0gMSwgYiA9IHllcywgYyA9IFwicXVvdGVkXCJgLCBgeyBcImFcIjogMSwgXCJiXCI6IHRydWUsIFwiY1wiOiBcInF1b3RlZFwiIH1gXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiZGVmaW5lX3R5cGVcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJkZWZpbmUgdHlwZSB7bmFtZTp0eXBlfSAoPzphcyAoYXxhbikge3N1cGVyVHlwZTp0eXBlfSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRlZmluZV90eXBlIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCBzdHJ1Y3R1cmUgPSBzdXBlci50b1N0cnVjdHVyZSgpO1xuICAgICAgICBzdHJ1Y3R1cmUudHlwZSA9IFwiY2xhc3NcIjtcbiAgICAgICAgcmV0dXJuIHN0cnVjdHVyZTtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHN1cGVyVHlwZSwgc3RhdGVtZW50cyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBsZXQgb3V0cHV0ID0gYGNsYXNzICR7bmFtZX1gO1xuICAgICAgICBpZiAoc3VwZXJUeXBlKSBvdXRwdXQgKz0gYCBleHRlbmRzICR7c3VwZXJUeXBlfWA7XG4gICAgICAgIG91dHB1dCArPSBcIiBcIiArIHN0YXRlbWVudHM7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICBjb21waWxlQXM6IFwic3RhdGVtZW50c1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImRlZmluZSB0eXBlIEZvb1wiLCBcImNsYXNzIEZvbyB7fVwiXSxcbiAgICAgICAgICBbXCJkZWZpbmUgdHlwZSBGb28gYXMgYSBCYXJcIiwgXCJjbGFzcyBGb28gZXh0ZW5kcyBCYXIge31cIl0sXG4gICAgICAgICAgW1wiZGVmaW5lIHR5cGUgRm9vXFxuXFx0YSA9IHRydWVcIiwgXCJjbGFzcyBGb28ge1xcblxcdGEgPSB0cnVlXFxufVwiXSxcbi8vVEVTVE1FOiBtb3JlIGludm9sdmVkIHRlc3RzLi4uXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuXG4gIH0sXG5cbiAgLy8gYG5ld2Agb3IgYGNyZWF0ZWBcbiAgLy8gVGhpcyB3b3JrcyBhcyBhbiBleHByZXNzaW9uIE9SIGEgc3RhdGVtZW50LlxuICAvLyBOT1RFOiB3ZSBhc3N1bWUgdGhhdCBhbGwgdHlwZXMgdGFrZSBhbiBvYmplY3Qgb2YgcHJvcGVydGllcz8/Pz9cbiAge1xuICAgIG5hbWU6IFwibmV3X3RoaW5nXCIsXG4gICAgYWxpYXM6IFtcImV4cHJlc3Npb25cIiwgXCJzdGF0ZW1lbnRcIl0sXG4gICAgc3ludGF4OiBcIihjcmVhdGV8bmV3KSB7dHlwZX0gKD86d2l0aCB7cHJvcHM6b2JqZWN0X2xpdGVyYWxfcHJvcGVydGllc30pP1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBuZXdfdGhpbmcgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0eXBlLCBwcm9wcyA9IFwiXCIgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgLy8gU3BlY2lhbCBjYXNlIGZvciBvYmplY3QsIHdoaWNoIHdlJ2xsIGNyZWF0ZSB3aXRoIGFuIG9iamVjdCBsaXRlcmFsLlxuICAgICAgICBpZiAodHlwZSA9PT0gXCJPYmplY3RcIikge1xuICAgICAgICAgIGlmICghcHJvcHMpIHJldHVybiBcInt9XCI7XG4gICAgICAgICAgcmV0dXJuIHByb3BzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBuZXcgJHt0eXBlfSgke3Byb3BzfSlgO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiTm9ybWFsIG9iamVjdHNcIixcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudFwiLFxuICAgICAgICBzaG93QWxsOiB0cnVlLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgW2BjcmVhdGUgT2JqZWN0YCwgYHt9YF0sXG4gICAgICAgICBbYG5ldyBPYmplY3RgLCBge31gXSxcbiAgICAgICAgIFtgbmV3IE9iamVjdCB3aXRoIGEgPSAxLCBiID0geWVzYCwgYHsgXCJhXCI6IDEsIFwiYlwiOiB0cnVlIH1gXSxcbiAgICAgICAgIFtgbmV3IEZvb2AsIGBuZXcgRm9vKClgXSxcbiAgICAgICAgIFtgbmV3IEZvbyB3aXRoIGEgPSAxLCBiID0geWVzYCwgYG5ldyBGb28oeyBcImFcIjogMSwgXCJiXCI6IHRydWUgfSlgXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwic3BlY2lhbCB0eXBlc1wiLFxuICAgICAgICBjb21waWxlQXM6IFwiZXhwcmVzc2lvblwiLFxuICAgICAgICBzaG93QWxsOiB0cnVlLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtgY3JlYXRlIG9iamVjdGAsIGB7fWBdLFxuICAgICAgICAgIFtgY3JlYXRlIGxpc3RgLCBgbmV3IEFycmF5KClgXSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICBdXG5cbiAgfSxcbi8qXG5cbiAgLy8gRGVjbGFyZSBpbnN0YW5jZSBtZXRob2Qgb3Igbm9ybWFsIGZ1bmN0aW9uLlxuICB7XG4gICAgbmFtZTogXCJkZWNsYXJlX21ldGhvZFwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcIihvcGVyYXRvcjp0b3xvbikge25hbWU6aWRlbnRpZmllcn0ge2FyZ3N9PyAoXFxcXDopPyB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVjbGFyZV9tZXRob2QgZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIC8vIFJldHVybiBhIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlXG4gICAgICB0b1N0cnVjdHVyZSgpIHtcbiAgICAgICAgbGV0IHsgb3BlcmF0b3IsIG5hbWUsIGFyZ3MgPSBbXX0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIGxldCBzdWJUeXBlID0gKG9wZXJhdG9yID09PSBcInRvXCIgPyBcIm1ldGhvZFwiIDogXCJldmVudFwiKTtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJmdW5jdGlvblwiLCBzdWJUeXBlLCBuYW1lLCBhcmdzIH07XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBuYW1lLCBhcmdzID0gW10sIHN0YXRlbWVudCwgYmxvY2sgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgbGV0IG91dHB1dCA9IGAke25hbWV9KCR7YXJncy5qb2luKFwiLCBcIil9KSBgO1xuICAgICAgICBvdXRwdXQgKz0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhzdGF0ZW1lbnQsIGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gRGVjbGFyZSBcImFjdGlvblwiLCB3aGljaCBjYW4gYmUgY2FsbGVkIGdsb2JhbGx5IGFuZCBhZmZlY3RzIHRoZSBwYXJzZXIuXG4gIC8vIFRPRE86IGB3aXRoYCBjbGF1c2UgKHdpbGwgY29uZmxpY3Qgd2l0aCBgd29yZGApXG4gIC8vIFRPRE86IGluc3RhbGwgaW4gcGFyc2VyIHNvbWVob3dcbiAgLy8gVE9ETzogY3JlYXRlIGluc3RhbmNlIGZ1bmN0aW9uPyAgb3IgbWF5YmUgd2UgZG9uJ3QgbmVlZCBpdDpcbiAgLy9cdFx0XHRgYWN0aW9uIHR1cm4gQ2FyZCBvdmVyYCBmb3IgYW4gaW5zdGFuY2UgaXMganVzdCBgdHVybiBtZSBvdmVyYFxuICAvL1x0XHRcdGBhY3Rpb24gYWRkIGNhcmQgdG8gZGVja2AgPT4gYGFkZCBtZSB0byBkZWNrYFxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJkZWNsYXJlX2FjdGlvblwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcImFjdGlvbiAoa2V5d29yZHM6e3dvcmR9fHt0eXBlfSkrIChcXFxcOik/IHtzdGF0ZW1lbnR9P1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkZWNsYXJlX2FjdGlvbiBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgLy8gQWRkIGBuYW1lYCwgYGFyZ3NgIGFuZCBgdHlwZXNgIHRvIG1hdGNoZWQgc291cmNlXG4gICAgICBnZXQgcmVzdWx0cygpIHtcbiAgICAgICAgbGV0IG91dHB1dCA9IHN1cGVyLnJlc3VsdHM7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUncyBvbmx5IG9uZSBrZXl3b3JkLCBpdCBjYW4ndCBiZSBhIGJsYWNrbGlzdGVkIGlkZW50aWZpZXIgb3IgYSB0eXBlXG4gICAgICAgIGxldCB7IGtleXdvcmRzIH0gPSBvdXRwdXQ7XG4gICAgICAgIGxldCBrZXl3b3JkTWF0Y2hlcyA9IHRoaXMucmVzdWx0cy5rZXl3b3Jkcy5tYXRjaGVkO1xuICAgICAgICBpZiAoa2V5d29yZHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgbGV0IGtleXdvcmQgPSBrZXl3b3Jkc1swXTtcbiAgICAgICAgICBpZiAoa2V5d29yZE1hdGNoZXNbMF0gaW5zdGFuY2VvZiBSdWxlLlR5cGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHBhcnNlKCdkZWNsYXJlX2FjdGlvbicpOiBvbmUtd29yZCBhY3Rpb25zIG1heSBub3QgYmUgdHlwZXM6ICR7a2V5d29yZH1gKTtcbiAgICAgICAgICB9XG5cbiAgLy8gSEFDSzogYGdsb2JhbC5wYXJzZXJgIGlzIGEgaGFjayBoZXJlIGZvciBjb252ZW5pZW5jZSBpbiB0ZXN0aW5nLi4uXG4vLyAgICAgICAgICAgbGV0IHBhcnNlciA9IChjb250ZXh0ICYmIGNvbnRleHQucGFyc2VyKSB8fCBnbG9iYWwucGFyc2VyO1xuLy8gICAgICAgICAgIGxldCBibGFja2xpc3QgPSBwYXJzZXIuZ2V0QmxhY2tsaXN0KFwiaWRlbnRpZmllclwiKTtcbi8vICAgICAgICAgICBpZiAoYmxhY2tsaXN0W2tleXdvcmRdKSB7XG4vLyAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBwYXJzZSgnZGVjbGFyZV9hY3Rpb24nKTogb25lLXdvcmQgYWN0aW9ucyBtYXkgbm90IGJlIGJsYWNrbGlzdGVkIGlkZW50aWZpZXJzXCI6ICR7a2V5d29yZH1gKTtcbi8vICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmaWd1cmUgb3V0IGFyZ3VtZW50cyBhbmQvb3IgdHlwZXNcbiAgICAgICAgb3V0cHV0LmFyZ3MgPSBbXTtcbiAgICAgICAgb3V0cHV0LnR5cGVzID0ge307XG5cbiAgICAgICAgLy8gaWYgYW55IG9mIHRoZSB3b3JkcyBhcmUgdHlwZXMgKGNhcGl0YWwgbGV0dGVyKSBtYWtlIHRoYXQgYW4gYXJndW1lbnQgb2YgdGhlIHNhbWUgbmFtZS5cbiAgICAgICAga2V5d29yZE1hdGNoZXMubWFwKCAoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIFJ1bGUuVHlwZSkge1xuICAgICAgICAgICAgbGV0IFR5cGUgPSBrZXl3b3Jkc1tpbmRleF07XG4gICAgICAgICAgICBsZXQgdHlwZSA9IFR5cGUudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgb3V0cHV0LnR5cGVzW3R5cGVdID0gVHlwZTtcbiAgICAgICAgICAgIG91dHB1dC5hcmdzLnB1c2godHlwZSk7XG5cbiAgICAgICAgICAgIC8vIHJlcGxhY2Ugd2l0aCBsb3dlcmNhc2UgaW4gbWV0aG9kIG5hbWVcbiAgICAgICAgICAgIGtleXdvcmRzW2luZGV4XSA9IHR5cGU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gZ2V0IHN0YXRpYyBtZXRob2QgbmFtZSBhbmQgYXJndW1lbnRzIGZvciBvdXRwdXRcbiAgICAgICAgb3V0cHV0Lm5hbWUgPSBrZXl3b3Jkcy5qb2luKFwiX1wiKTtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIGFyZ3MgPSBbXSwgdHlwZXMsIHN0YXRlbWVudCwgYmxvY2sgfSA9IHRoaXMucmVzdWx0cztcblxuICAgICAgICAvLyBmaWd1cmUgb3V0IGlmIHRoZXJlIGFyZSBhbnkgY29uZGl0aW9ucyBkdWUgdG8ga25vd24gYXJndW1lbnQgdHlwZXNcbiAgICAgICAgbGV0IGNvbmRpdGlvbnMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgYXJnIGluIHR5cGVzKSB7XG4gICAgICAgICAgY29uZGl0aW9ucy5wdXNoKGBcXHRpZiAoIXNwZWxsLmlzQSgke2FyZ30sICR7dHlwZXNbYXJnXX0pKSByZXR1cm4gdW5kZWZpbmVkYCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3RhdGVtZW50cyA9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoY29uZGl0aW9ucywgc3RhdGVtZW50LCBibG9jayk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFzIGEgU1RBVElDIGZ1bmN0aW9uXG4gICAgLy9UT0RPOiBjcmVhdGUgYXMgYW4gaW5zdGFuY2UgZnVuY3Rpb24gd2UgY2FuIGNhbGwgb24gb3Vyc2VsZiFcbiAgICAgICAgcmV0dXJuIGBzdGF0aWMgJHtuYW1lfSgke2FyZ3Muam9pbihcIiwgXCIpfSkgJHtzdGF0ZW1lbnRzfWA7XG4gICAgICB9XG5cbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBuYW1lLCBhcmdzLCB0eXBlcyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcImZ1bmN0aW9uXCIsIHN1YlR5cGU6IFwiYWN0aW9uXCIsIG5hbWUsIGFyZ3MsIHR5cGVzIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBHZXR0ZXIgZWl0aGVyIHdpdGggb3Igd2l0aG91dCBhcmd1bWVudHMuXG4gIC8vIElmIHlvdSBzcGVjaWZ5IGFyZ3VtZW50cywgeWllbGRzIGEgbm9ybWFsIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSB2YWx1ZS5cbiAgLy8gVE9ETzogYHRvIGdldC4uLmAgP1xuICB7XG4gICAgbmFtZTogXCJnZXR0ZXJcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJnZXQge25hbWU6aWRlbnRpZmllcn1cXFxcOiB7ZXhwcmVzc2lvbn0/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGdldHRlciBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIGV4cHJlc3Npb24sIGJsb2NrIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIC8vIElmIHRoZXkgc3BlY2lmaWVkIGFuIGlubGluZS1leHByZXNzaW9uLCBwcmVwZW5kIHJldHVyblxuICAgICAgICBpZiAoZXhwcmVzc2lvbiAmJiAhZXhwcmVzc2lvbi5zdGFydHNXaXRoKFwicmV0dXJuIFwiKSkgZXhwcmVzc2lvbiA9IGByZXR1cm4gKCR7ZXhwcmVzc2lvbn0pYDtcbiAgICAgICAgbGV0IG91dHB1dCA9IGBnZXQgJHtuYW1lfSgpIGA7XG4gICAgICAgIG91dHB1dCArPSBSdWxlLkJsb2NrLmVuY2xvc2VTdGF0ZW1lbnRzKGV4cHJlc3Npb24sIGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBuYW1lIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IFwicHJvcGVydHlcIiwgc3ViVHlwZTogXCJnZXR0ZXJcIiwgbmFtZSB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFNldHRlci5cbiAgLy8gQ29tcGxhaW5zIGlmIHlvdSBzcGVjaWZ5IG1vcmUgdGhhbiBvbmUgYXJndW1lbnQuXG4gIC8vIElmIHlvdSBkb24ndCBwYXNzIGFuIGV4cGxpY2l0IGFyZ3VtZW50LCB3ZSdsbCBhc3N1bWUgaXQncyB0aGUgc2FtZSBhcyB0aGUgaWRlbnRpZmllci5cbiAgLy8gZWc7XHRgc2V0IGNvbG9yOiBzZXQgdGhlIGNvbG9yIG9mIG15IHRleHQgdG8gY29sb3JgXG4gIC8vXG4gIC8vIFRPRE86IGludGVybmFsIGdldHRlci9zZXR0ZXIgc2VtYW50aWNzIGFsYSBvYmplY3RpdmUgQ1xuICAvL1x0XHRcdGBzZXQgY29sb3I6IGlmIGNvbG9yIGlzIGluIFtcInJlZFwiLCBcImJsdWVcIl0gdGhlbiBzZXQgbXkgY29sb3IgdG8gY29sb3JgXG4gIC8vXHRcdCA9PiBgbXkgY29sb3JgIHdpdGhpbiBzZXR0ZXIgc2hvdWxkIGF1dG9tYXRpY2FsbHkgdHJhbnNsYXRlIHRvIGB0aGlzLl9jb2xvcmAgPz8/XG4gIC8vIFRPRE86IGB0byBzZXQuLi5gID9cbiAge1xuICAgIG5hbWU6IFwic2V0dGVyXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwic2V0IHtuYW1lOmlkZW50aWZpZXJ9IHthcmdzfT8gKFxcXFw6KT8ge3N0YXRlbWVudH0/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHNldHRlciBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIC8vIGRlZmF1bHQgYXJncyB0byB0aGUgc2V0dGVyIG5hbWVcbiAgICAgICAgbGV0IHsgbmFtZSwgYXJncyA9IFtuYW1lXSwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICAvLyBDb21wbGFpbiBpZiBtb3JlIHRoYW4gb25lIGFyZ3VtZW50XG4gICAgICAgIGlmIChhcmdzICYmIGFyZ3MubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcInBhcnNlKCdzZXR0ZXInKTogb25seSBvbmUgYXJndW1lbnQgYWxsb3dlZCBpbiBzZXR0ZXI6ICBcIiwgdGhpcy5tYXRjaGVkVGV4dCk7XG4gICAgICAgICAgYXJncyA9IFsgYXJnc1swXSBdO1xuICAgICAgICB9XG4gICAgICAgIGxldCBvdXRwdXQgPSBgc2V0ICR7bmFtZX0oJHthcmdzfSkgYDtcbiAgICAgICAgb3V0cHV0ICs9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoc3RhdGVtZW50LCBibG9jayk7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlXG4gICAgICB0b1N0cnVjdHVyZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcInByb3BlcnR5XCIsIHN1YlR5cGU6IFwic2V0dGVyXCIsIG5hbWUgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vXG4gIC8vXHRkZWNsYXJlIHByb3BlcnRpZXNcbiAgLy9cblxuICAvL1RPRE86IGFub3RoZXIgbmFtZSBmb3IgYGNvbnN0YW50YCA/XG4gIHtcbiAgICBuYW1lOiBcImRlY2xhcmVfcHJvcGVydHlcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCIoc2NvcGU6cHJvcGVydHl8Y29uc3RhbnR8c2hhcmVkIHByb3BlcnR5KSB7bmFtZTppZGVudGlmaWVyfSAoPzo9IHt2YWx1ZTpleHByZXNzaW9ufSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRlY2xhcmVfcHJvcGVydHkgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBzY29wZSwgbmFtZSwgdmFsdWUgPSBcIlwiIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIGlmICh2YWx1ZSkgdmFsdWUgPSBgID0gJHt2YWx1ZX1gO1xuXG4gICAgICAgIGxldCBkZWNsYXJhdGlvbiA9IGAke25hbWV9JHt2YWx1ZX1gO1xuICAgICAgICBzd2l0Y2ggKHNjb3BlKSB7XG4gICAgICAgICAgY2FzZSBcImNvbnN0YW50XCI6XG4vLyAgICAgICAgICAgIGlmICghdmFsdWUpIGNvbnNvbGUud2FybihcInBhcnNlKCdkZWNsYXJlX3Byb3BlcnR5Jyk6IGNvbnN0YW50IHByb3BlcnRpZXMgbXVzdCBkZWNsYXJlIGEgdmFsdWU6ICBcIiwgdGhpcy5tYXRjaGVkVGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gYGNvbnN0ICR7ZGVjbGFyYXRpb259YDtcblxuICAgICAgICAgIGNhc2UgXCJzaGFyZWQgcHJvcGVydHlcIjpcbiAgICAgICAgICAgIHJldHVybiBgQHByb3RvICR7ZGVjbGFyYXRpb259YDtcblxuICAgICAgICAgIGNhc2UgXCJwcm9wZXJ0eVwiOlxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZGVjbGFyYXRpb247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBzY29wZSwgbmFtZSB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcInByb3BlcnR5XCIsIG5hbWUsIHNjb3BlIH07XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFRPRE86IHNjb3BlX21vZGlmaWVyPz8/XG4gIC8vIFRPRE86IGluaXRpYWwgdmFsdWVcbiAge1xuICAgIG5hbWU6IFwiZGVjbGFyZV9wcm9wZXJ0eV9vZl90eXBlXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwicHJvcGVydHkge25hbWU6aWRlbnRpZmllcn0gYXMgKGF8YW4pPyB7dHlwZX1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVjbGFyZV9wcm9wZXJ0eV9vZl90eXBlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgdHlwZSB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYGdldCAke25hbWV9KCkgeyByZXR1cm4gdGhpcy5fXyR7bmFtZX0gfVxcbmBcbiAgICAgICAgICAgKyBgc2V0ICR7bmFtZX0odmFsdWUpIHsgaWYgKHNwZWxsLmlzQSh2YWx1ZSwgJHt0eXBlfSkgdGhpcy5fXyR7bmFtZX0gPSB2YWx1ZSB9YDtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBuYW1lLCB0eXBlIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IFwicHJvcGVydHlcIiwgc3ViVHlwZTogXCJzZXR0ZXJcIiwgbmFtZSwgZGF0YVR5cGU6IHR5cGUgfTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBUT0RPOiB3YXJuIG9uIGludmFsaWQgc2V0PyAgc2hhcmVkPyAgdW5kZWZpbmVkPyBzb21ldGhpbmcgb3RoZXIgdGhhbiB0aGUgZmlyc3QgdmFsdWUgYXMgZGVmYXVsdD9cbiAge1xuICAgIG5hbWU6IFwiZGVjbGFyZV9wcm9wZXJ0eV9hc19vbmVfb2ZcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJwcm9wZXJ0eSB7bmFtZTppZGVudGlmaWVyfSBhcyBvbmUgb2Yge2xpc3Q6bGl0ZXJhbF9saXN0fVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkZWNsYXJlX3Byb3BlcnR5X2FzX29uZV9vZiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgZ2V0IHJlc3VsdHMoKSB7XG4gICAgICAgIGxldCByZXN1bHRzID0gc3VwZXIucmVzdWx0cztcbiAgICAgICAgcmVzdWx0cy5wbHVyYWwgPSBwbHVyYWxpemUocmVzdWx0cy5uYW1lKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBuYW1lLCBwbHVyYWwsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBAcHJvdG8gJHtwbHVyYWx9ID0gJHtsaXN0fVxcbmBcbiAgICAgICAgICAgKyBgZ2V0ICR7bmFtZX0oKSB7IHJldHVybiB0aGlzLl9fJHtuYW1lfSA9PT0gdW5kZWZpbmVkID8gdGhpcy4ke3BsdXJhbH1bMF0gOiB0aGlzLl9fJHtuYW1lfSB9XFxuYFxuICAgICAgICAgICArIGBzZXQgJHtuYW1lfSh2YWx1ZSkgeyBpZiAodGhpcy4ke3BsdXJhbH0uaW5jbHVkZXModmFsdWUpKSB0aGlzLl9fJHtuYW1lfSA9IHZhbHVlIH1gO1xuXG4gIC8vIE1PUkUgRUZGSUNJRU5UIEJVVCBVR0xJRVJcbiAgLy8gXHRcdFx0cmV0dXJuIGBzdGF0aWMgJHtwbHVyYWx9ID0gJHtsaXN0fTtcXG5gXG4gIC8vIFx0XHRcdFx0ICsgYGdldCAke25hbWV9IHsgcmV0dXJuIChcIl9fJHtuYW1lfVwiIGluIHRoaXMgPyB0aGlzLl9fJHtuYW1lfSA6ICR7Zmlyc3RWYWx1ZX0pIH1cXG5gXG4gIC8vIFx0XHRcdFx0ICsgYHNldCAke25hbWV9KHZhbHVlKSB7IGlmICh0aGlzLmNvbnN0cnVjdG9yLiR7cGx1cmFsfS5pbmNsdWRlcyh2YWx1ZSkpIHRoaXMuX18ke25hbWV9ID0gdmFsdWUgfWA7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlXG4gICAgICB0b1N0cnVjdHVyZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgcGx1cmFsIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgeyB0eXBlOiBcInByb3BlcnR5XCIsIG5hbWUgfSxcbiAgICAgICAgICB7IHR5cGU6IFwicHJvcGVydHlcIiwgc3ViVHlwZTogXCJzaGFyZWRcIiwgbmFtZTogcGx1cmFsIH1cbiAgICAgICAgXTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvL1xuICAvL1x0U2VsZi1yZWZlcmVuY2VcbiAgLy9cbiAge1xuICAgIG5hbWU6IFwibWVcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIm1lXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG1lIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIFwidGhpc1wiO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBUT0RPOiB0aGlzIHJlYWxseSBtYWtlcyBtZSB3YW50IHRvIG1ha2UgYEkgYW0gZW1wdHlgIGV0YyB3b3JrLi4uXG4gIHtcbiAgICBuYW1lOiBcIklcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIklcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgSSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiBcInRoaXNcIjtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvL1xuICAvL1x0UHJvcGVydHkgYWNjZXNzXG4gIC8vXG5cbiAge1xuICAgIG5hbWU6IFwicHJvcGVydHlfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiKHByb3BlcnRpZXM6dGhlIHtpZGVudGlmaWVyfSBvZikrIHRoZT8ge2V4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHByb3BlcnR5X2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIGdldCByZXN1bHRzKCkge1xuICAgICAgICBsZXQgeyBleHByZXNzaW9uLCBwcm9wZXJ0aWVzXywgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBwcm9wZXJ0aWVzOiBfcHJvcGVydGllcy5tYXRjaGVkLm1hcCggcHJvcGVydHkgPT4gcHJvcGVydHkucmVzdWx0cy5pZGVudGlmaWVyIClcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGV4cHJlc3Npb24sIHByb3BlcnRpZXMgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcHJvcGVydGllcyA9IHByb3BlcnRpZXMucmV2ZXJzZSgpLmpvaW4oXCIuXCIpO1xuICAgICAgICByZXR1cm4gYCR7ZXhwcmVzc2lvbn0uJHtwcm9wZXJ0aWVzfWA7XG4gIC8vIE5PVEU6IHRoZSBmb2xsb3dpbmcgaXMgc2FmZXIsIGJ1dCB1Z2x5IGZvciBkZW1vIHB1cnBvc2VzXG4gIC8vXHRcdFx0cmV0dXJuIGBzcGVsbC5nZXQoJHtleHByZXNzaW9ufSwgWycke3Byb3BlcnRpZXN9J10pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwibXlfcHJvcGVydHlfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiKG15fHRoaXMpIHtpZGVudGlmaWVyfVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBteV9wcm9wZXJ0eV9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgaWRlbnRpZmllciB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHRoaXMuJHtpZGVudGlmaWVyfWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuKi9cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvdHlwZXMuanMiLCJyZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zeW1ib2wnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9fY29yZScpLlN5bWJvbDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL2VzNi9zeW1ib2wuanNcbi8vIG1vZHVsZSBpZCA9IDUwMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpIHRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGEgZnVuY3Rpb24hJyk7XG4gIHJldHVybiBpdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzXG4vLyBtb2R1bGUgaWQgPSA1NDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gZmFsc2UgLT4gQXJyYXkjaW5kZXhPZlxuLy8gdHJ1ZSAgLT4gQXJyYXkjaW5jbHVkZXNcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuL190by1sZW5ndGgnKTtcbnZhciB0b0Fic29sdXRlSW5kZXggPSByZXF1aXJlKCcuL190by1hYnNvbHV0ZS1pbmRleCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoSVNfSU5DTFVERVMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcywgZWwsIGZyb21JbmRleCkge1xuICAgIHZhciBPID0gdG9JT2JqZWN0KCR0aGlzKTtcbiAgICB2YXIgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpO1xuICAgIHZhciBpbmRleCA9IHRvQWJzb2x1dGVJbmRleChmcm9tSW5kZXgsIGxlbmd0aCk7XG4gICAgdmFyIHZhbHVlO1xuICAgIC8vIEFycmF5I2luY2x1ZGVzIHVzZXMgU2FtZVZhbHVlWmVybyBlcXVhbGl0eSBhbGdvcml0aG1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgaWYgKElTX0lOQ0xVREVTICYmIGVsICE9IGVsKSB3aGlsZSAobGVuZ3RoID4gaW5kZXgpIHtcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgIGlmICh2YWx1ZSAhPSB2YWx1ZSkgcmV0dXJuIHRydWU7XG4gICAgLy8gQXJyYXkjaW5kZXhPZiBpZ25vcmVzIGhvbGVzLCBBcnJheSNpbmNsdWRlcyAtIG5vdFxuICAgIH0gZWxzZSBmb3IgKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKykgaWYgKElTX0lOQ0xVREVTIHx8IGluZGV4IGluIE8pIHtcbiAgICAgIGlmIChPW2luZGV4XSA9PT0gZWwpIHJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleCB8fCAwO1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qc1xuLy8gbW9kdWxlIGlkID0gNTQ4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGdldHRpbmcgdGFnIGZyb20gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG52YXIgVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyk7XG4vLyBFUzMgd3JvbmcgaGVyZVxudmFyIEFSRyA9IGNvZihmdW5jdGlvbiAoKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ0FyZ3VtZW50cyc7XG5cbi8vIGZhbGxiYWNrIGZvciBJRTExIFNjcmlwdCBBY2Nlc3MgRGVuaWVkIGVycm9yXG52YXIgdHJ5R2V0ID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gaXRba2V5XTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgTywgVCwgQjtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IGl0ID09PSBudWxsID8gJ051bGwnXG4gICAgLy8gQEB0b1N0cmluZ1RhZyBjYXNlXG4gICAgOiB0eXBlb2YgKFQgPSB0cnlHZXQoTyA9IE9iamVjdChpdCksIFRBRykpID09ICdzdHJpbmcnID8gVFxuICAgIC8vIGJ1aWx0aW5UYWcgY2FzZVxuICAgIDogQVJHID8gY29mKE8pXG4gICAgLy8gRVMzIGFyZ3VtZW50cyBmYWxsYmFja1xuICAgIDogKEIgPSBjb2YoTykpID09ICdPYmplY3QnICYmIHR5cGVvZiBPLmNhbGxlZSA9PSAnZnVuY3Rpb24nID8gJ0FyZ3VtZW50cycgOiBCO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2NsYXNzb2YuanNcbi8vIG1vZHVsZSBpZCA9IDU0OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBvcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuL19hLWZ1bmN0aW9uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbiwgdGhhdCwgbGVuZ3RoKSB7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmICh0aGF0ID09PSB1bmRlZmluZWQpIHJldHVybiBmbjtcbiAgc3dpdGNoIChsZW5ndGgpIHtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbiAoYSkge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKC8qIC4uLmFyZ3MgKi8pIHtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19jdHguanNcbi8vIG1vZHVsZSBpZCA9IDU1MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyA3LjIuMSBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ID09IHVuZGVmaW5lZCkgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZGVmaW5lZC5qc1xuLy8gbW9kdWxlIGlkID0gNTUxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGFsbCBlbnVtZXJhYmxlIG9iamVjdCBrZXlzLCBpbmNsdWRlcyBzeW1ib2xzXG52YXIgZ2V0S2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJyk7XG52YXIgZ09QUyA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BzJyk7XG52YXIgcElFID0gcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdmFyIHJlc3VsdCA9IGdldEtleXMoaXQpO1xuICB2YXIgZ2V0U3ltYm9scyA9IGdPUFMuZjtcbiAgaWYgKGdldFN5bWJvbHMpIHtcbiAgICB2YXIgc3ltYm9scyA9IGdldFN5bWJvbHMoaXQpO1xuICAgIHZhciBpc0VudW0gPSBwSUUuZjtcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGtleTtcbiAgICB3aGlsZSAoc3ltYm9scy5sZW5ndGggPiBpKSBpZiAoaXNFbnVtLmNhbGwoaXQsIGtleSA9IHN5bWJvbHNbaSsrXSkpIHJlc3VsdC5wdXNoKGtleSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWtleXMuanNcbi8vIG1vZHVsZSBpZCA9IDU1MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxudmFyICRleHBvcnQgPSBmdW5jdGlvbiAodHlwZSwgbmFtZSwgc291cmNlKSB7XG4gIHZhciBJU19GT1JDRUQgPSB0eXBlICYgJGV4cG9ydC5GO1xuICB2YXIgSVNfR0xPQkFMID0gdHlwZSAmICRleHBvcnQuRztcbiAgdmFyIElTX1NUQVRJQyA9IHR5cGUgJiAkZXhwb3J0LlM7XG4gIHZhciBJU19QUk9UTyA9IHR5cGUgJiAkZXhwb3J0LlA7XG4gIHZhciBJU19CSU5EID0gdHlwZSAmICRleHBvcnQuQjtcbiAgdmFyIHRhcmdldCA9IElTX0dMT0JBTCA/IGdsb2JhbCA6IElTX1NUQVRJQyA/IGdsb2JhbFtuYW1lXSB8fCAoZ2xvYmFsW25hbWVdID0ge30pIDogKGdsb2JhbFtuYW1lXSB8fCB7fSlbUFJPVE9UWVBFXTtcbiAgdmFyIGV4cG9ydHMgPSBJU19HTE9CQUwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KTtcbiAgdmFyIGV4cFByb3RvID0gZXhwb3J0c1tQUk9UT1RZUEVdIHx8IChleHBvcnRzW1BST1RPVFlQRV0gPSB7fSk7XG4gIHZhciBrZXksIG93biwgb3V0LCBleHA7XG4gIGlmIChJU19HTE9CQUwpIHNvdXJjZSA9IG5hbWU7XG4gIGZvciAoa2V5IGluIHNvdXJjZSkge1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIHRhcmdldFtrZXldICE9PSB1bmRlZmluZWQ7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSAob3duID8gdGFyZ2V0IDogc291cmNlKVtrZXldO1xuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XG4gICAgZXhwID0gSVNfQklORCAmJiBvd24gPyBjdHgob3V0LCBnbG9iYWwpIDogSVNfUFJPVE8gJiYgdHlwZW9mIG91dCA9PSAnZnVuY3Rpb24nID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgLy8gZXh0ZW5kIGdsb2JhbFxuICAgIGlmICh0YXJnZXQpIHJlZGVmaW5lKHRhcmdldCwga2V5LCBvdXQsIHR5cGUgJiAkZXhwb3J0LlUpO1xuICAgIC8vIGV4cG9ydFxuICAgIGlmIChleHBvcnRzW2tleV0gIT0gb3V0KSBoaWRlKGV4cG9ydHMsIGtleSwgZXhwKTtcbiAgICBpZiAoSVNfUFJPVE8gJiYgZXhwUHJvdG9ba2V5XSAhPSBvdXQpIGV4cFByb3RvW2tleV0gPSBvdXQ7XG4gIH1cbn07XG5nbG9iYWwuY29yZSA9IGNvcmU7XG4vLyB0eXBlIGJpdG1hcFxuJGV4cG9ydC5GID0gMTsgICAvLyBmb3JjZWRcbiRleHBvcnQuRyA9IDI7ICAgLy8gZ2xvYmFsXG4kZXhwb3J0LlMgPSA0OyAgIC8vIHN0YXRpY1xuJGV4cG9ydC5QID0gODsgICAvLyBwcm90b1xuJGV4cG9ydC5CID0gMTY7ICAvLyBiaW5kXG4kZXhwb3J0LlcgPSAzMjsgIC8vIHdyYXBcbiRleHBvcnQuVSA9IDY0OyAgLy8gc2FmZVxuJGV4cG9ydC5SID0gMTI4OyAvLyByZWFsIHByb3RvIG1ldGhvZCBmb3IgYGxpYnJhcnlgXG5tb2R1bGUuZXhwb3J0cyA9ICRleHBvcnQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19leHBvcnQuanNcbi8vIG1vZHVsZSBpZCA9IDU1M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudDtcbm1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faHRtbC5qc1xuLy8gbW9kdWxlIGlkID0gNTU0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApID8gT2JqZWN0IDogZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19pb2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSA1NTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gNy4yLjIgSXNBcnJheShhcmd1bWVudClcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiBpc0FycmF5KGFyZykge1xuICByZXR1cm4gY29mKGFyZykgPT0gJ0FycmF5Jztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19pcy1hcnJheS5qc1xuLy8gbW9kdWxlIGlkID0gNTU2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBNRVRBID0gcmVxdWlyZSgnLi9fdWlkJykoJ21ldGEnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIHNldERlc2MgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mO1xudmFyIGlkID0gMDtcbnZhciBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRydWU7XG59O1xudmFyIEZSRUVaRSA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGlzRXh0ZW5zaWJsZShPYmplY3QucHJldmVudEV4dGVuc2lvbnMoe30pKTtcbn0pO1xudmFyIHNldE1ldGEgPSBmdW5jdGlvbiAoaXQpIHtcbiAgc2V0RGVzYyhpdCwgTUVUQSwgeyB2YWx1ZToge1xuICAgIGk6ICdPJyArICsraWQsIC8vIG9iamVjdCBJRFxuICAgIHc6IHt9ICAgICAgICAgIC8vIHdlYWsgY29sbGVjdGlvbnMgSURzXG4gIH0gfSk7XG59O1xudmFyIGZhc3RLZXkgPSBmdW5jdGlvbiAoaXQsIGNyZWF0ZSkge1xuICAvLyByZXR1cm4gcHJpbWl0aXZlIHdpdGggcHJlZml4XG4gIGlmICghaXNPYmplY3QoaXQpKSByZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnID8gaXQgOiAodHlwZW9mIGl0ID09ICdzdHJpbmcnID8gJ1MnIDogJ1AnKSArIGl0O1xuICBpZiAoIWhhcyhpdCwgTUVUQSkpIHtcbiAgICAvLyBjYW4ndCBzZXQgbWV0YWRhdGEgdG8gdW5jYXVnaHQgZnJvemVuIG9iamVjdFxuICAgIGlmICghaXNFeHRlbnNpYmxlKGl0KSkgcmV0dXJuICdGJztcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBtZXRhZGF0YVxuICAgIGlmICghY3JlYXRlKSByZXR1cm4gJ0UnO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBvYmplY3QgSURcbiAgfSByZXR1cm4gaXRbTUVUQV0uaTtcbn07XG52YXIgZ2V0V2VhayA9IGZ1bmN0aW9uIChpdCwgY3JlYXRlKSB7XG4gIGlmICghaGFzKGl0LCBNRVRBKSkge1xuICAgIC8vIGNhbid0IHNldCBtZXRhZGF0YSB0byB1bmNhdWdodCBmcm96ZW4gb2JqZWN0XG4gICAgaWYgKCFpc0V4dGVuc2libGUoaXQpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBtZXRhZGF0YVxuICAgIGlmICghY3JlYXRlKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gYWRkIG1pc3NpbmcgbWV0YWRhdGFcbiAgICBzZXRNZXRhKGl0KTtcbiAgLy8gcmV0dXJuIGhhc2ggd2VhayBjb2xsZWN0aW9ucyBJRHNcbiAgfSByZXR1cm4gaXRbTUVUQV0udztcbn07XG4vLyBhZGQgbWV0YWRhdGEgb24gZnJlZXplLWZhbWlseSBtZXRob2RzIGNhbGxpbmdcbnZhciBvbkZyZWV6ZSA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoRlJFRVpFICYmIG1ldGEuTkVFRCAmJiBpc0V4dGVuc2libGUoaXQpICYmICFoYXMoaXQsIE1FVEEpKSBzZXRNZXRhKGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcbnZhciBtZXRhID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIEtFWTogTUVUQSxcbiAgTkVFRDogZmFsc2UsXG4gIGZhc3RLZXk6IGZhc3RLZXksXG4gIGdldFdlYWs6IGdldFdlYWssXG4gIG9uRnJlZXplOiBvbkZyZWV6ZVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX21ldGEuanNcbi8vIG1vZHVsZSBpZCA9IDU1N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyAxOS4xLjIuMiAvIDE1LjIuMy41IE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGRQcyA9IHJlcXVpcmUoJy4vX29iamVjdC1kcHMnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKTtcbnZhciBJRV9QUk9UTyA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKTtcbnZhciBFbXB0eSA9IGZ1bmN0aW9uICgpIHsgLyogZW1wdHkgKi8gfTtcbnZhciBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxuLy8gQ3JlYXRlIG9iamVjdCB3aXRoIGZha2UgYG51bGxgIHByb3RvdHlwZTogdXNlIGlmcmFtZSBPYmplY3Qgd2l0aCBjbGVhcmVkIHByb3RvdHlwZVxudmFyIGNyZWF0ZURpY3QgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIFRocmFzaCwgd2FzdGUgYW5kIHNvZG9teTogSUUgR0MgYnVnXG4gIHZhciBpZnJhbWUgPSByZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2lmcmFtZScpO1xuICB2YXIgaSA9IGVudW1CdWdLZXlzLmxlbmd0aDtcbiAgdmFyIGx0ID0gJzwnO1xuICB2YXIgZ3QgPSAnPic7XG4gIHZhciBpZnJhbWVEb2N1bWVudDtcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIHJlcXVpcmUoJy4vX2h0bWwnKS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICBpZnJhbWUuc3JjID0gJ2phdmFzY3JpcHQ6JzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zY3JpcHQtdXJsXG4gIC8vIGNyZWF0ZURpY3QgPSBpZnJhbWUuY29udGVudFdpbmRvdy5PYmplY3Q7XG4gIC8vIGh0bWwucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcbiAgaWZyYW1lRG9jdW1lbnQgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgaWZyYW1lRG9jdW1lbnQub3BlbigpO1xuICBpZnJhbWVEb2N1bWVudC53cml0ZShsdCArICdzY3JpcHQnICsgZ3QgKyAnZG9jdW1lbnQuRj1PYmplY3QnICsgbHQgKyAnL3NjcmlwdCcgKyBndCk7XG4gIGlmcmFtZURvY3VtZW50LmNsb3NlKCk7XG4gIGNyZWF0ZURpY3QgPSBpZnJhbWVEb2N1bWVudC5GO1xuICB3aGlsZSAoaS0tKSBkZWxldGUgY3JlYXRlRGljdFtQUk9UT1RZUEVdW2VudW1CdWdLZXlzW2ldXTtcbiAgcmV0dXJuIGNyZWF0ZURpY3QoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiBjcmVhdGUoTywgUHJvcGVydGllcykge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoTyAhPT0gbnVsbCkge1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBhbk9iamVjdChPKTtcbiAgICByZXN1bHQgPSBuZXcgRW1wdHkoKTtcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gbnVsbDtcbiAgICAvLyBhZGQgXCJfX3Byb3RvX19cIiBmb3IgT2JqZWN0LmdldFByb3RvdHlwZU9mIHBvbHlmaWxsXG4gICAgcmVzdWx0W0lFX1BST1RPXSA9IE87XG4gIH0gZWxzZSByZXN1bHQgPSBjcmVhdGVEaWN0KCk7XG4gIHJldHVybiBQcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiBkUHMocmVzdWx0LCBQcm9wZXJ0aWVzKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtY3JlYXRlLmpzXG4vLyBtb2R1bGUgaWQgPSA1NThcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBnZXRLZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIHZhciBrZXlzID0gZ2V0S2V5cyhQcm9wZXJ0aWVzKTtcbiAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICB2YXIgaSA9IDA7XG4gIHZhciBQO1xuICB3aGlsZSAobGVuZ3RoID4gaSkgZFAuZihPLCBQID0ga2V5c1tpKytdLCBQcm9wZXJ0aWVzW1BdKTtcbiAgcmV0dXJuIE87XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwcy5qc1xuLy8gbW9kdWxlIGlkID0gNTU5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBwSUUgPSByZXF1aXJlKCcuL19vYmplY3QtcGllJyk7XG52YXIgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4vX2llOC1kb20tZGVmaW5lJyk7XG52YXIgZ09QRCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG5cbmV4cG9ydHMuZiA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBnT1BEIDogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApIHtcbiAgTyA9IHRvSU9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBpZiAoSUU4X0RPTV9ERUZJTkUpIHRyeSB7XG4gICAgcmV0dXJuIGdPUEQoTywgUCk7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoaGFzKE8sIFApKSByZXR1cm4gY3JlYXRlRGVzYyghcElFLmYuY2FsbChPLCBQKSwgT1tQXSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcGQuanNcbi8vIG1vZHVsZSBpZCA9IDU2MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBmYWxsYmFjayBmb3IgSUUxMSBidWdneSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB3aXRoIGlmcmFtZSBhbmQgd2luZG93XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIGdPUE4gPSByZXF1aXJlKCcuL19vYmplY3QtZ29wbicpLmY7XG52YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxudmFyIHdpbmRvd05hbWVzID0gdHlwZW9mIHdpbmRvdyA9PSAnb2JqZWN0JyAmJiB3aW5kb3cgJiYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXNcbiAgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh3aW5kb3cpIDogW107XG5cbnZhciBnZXRXaW5kb3dOYW1lcyA9IGZ1bmN0aW9uIChpdCkge1xuICB0cnkge1xuICAgIHJldHVybiBnT1BOKGl0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB3aW5kb3dOYW1lcy5zbGljZSgpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5mID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCkge1xuICByZXR1cm4gd2luZG93TmFtZXMgJiYgdG9TdHJpbmcuY2FsbChpdCkgPT0gJ1tvYmplY3QgV2luZG93XScgPyBnZXRXaW5kb3dOYW1lcyhpdCkgOiBnT1BOKHRvSU9iamVjdChpdCkpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BuLWV4dC5qc1xuLy8gbW9kdWxlIGlkID0gNTYxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkZWYgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIFRBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgdGFnLCBzdGF0KSB7XG4gIGlmIChpdCAmJiAhaGFzKGl0ID0gc3RhdCA/IGl0IDogaXQucHJvdG90eXBlLCBUQUcpKSBkZWYoaXQsIFRBRywgeyBjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiB0YWcgfSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fc2V0LXRvLXN0cmluZy10YWcuanNcbi8vIG1vZHVsZSBpZCA9IDU2MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIG1heCA9IE1hdGgubWF4O1xudmFyIG1pbiA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW5kZXgsIGxlbmd0aCkge1xuICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XG4gIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3RvLWFic29sdXRlLWluZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA1NjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gNy4xLjE1IFRvTGVuZ3RoXG52YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIG1pbiA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCAweDFmZmZmZmZmZmZmZmZmKSA6IDA7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL190by1sZW5ndGguanNcbi8vIG1vZHVsZSBpZCA9IDU2NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBMSUJSQVJZID0gcmVxdWlyZSgnLi9fbGlicmFyeScpO1xudmFyIHdrc0V4dCA9IHJlcXVpcmUoJy4vX3drcy1leHQnKTtcbnZhciBkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmY7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHZhciAkU3ltYm9sID0gY29yZS5TeW1ib2wgfHwgKGNvcmUuU3ltYm9sID0gTElCUkFSWSA/IHt9IDogZ2xvYmFsLlN5bWJvbCB8fCB7fSk7XG4gIGlmIChuYW1lLmNoYXJBdCgwKSAhPSAnXycgJiYgIShuYW1lIGluICRTeW1ib2wpKSBkZWZpbmVQcm9wZXJ0eSgkU3ltYm9sLCBuYW1lLCB7IHZhbHVlOiB3a3NFeHQuZihuYW1lKSB9KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL193a3MtZGVmaW5lLmpzXG4vLyBtb2R1bGUgaWQgPSA1NjVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuLy8gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4vX2NsYXNzb2YnKTtcbnZhciB0ZXN0ID0ge307XG50ZXN0W3JlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpXSA9ICd6JztcbmlmICh0ZXN0ICsgJycgIT0gJ1tvYmplY3Qgel0nKSB7XG4gIHJlcXVpcmUoJy4vX3JlZGVmaW5lJykoT2JqZWN0LnByb3RvdHlwZSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuICdbb2JqZWN0ICcgKyBjbGFzc29mKHRoaXMpICsgJ10nO1xuICB9LCB0cnVlKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcuanNcbi8vIG1vZHVsZSBpZCA9IDU2NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG4vLyBFQ01BU2NyaXB0IDYgc3ltYm9scyBzaGltXG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpO1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJyk7XG52YXIgTUVUQSA9IHJlcXVpcmUoJy4vX21ldGEnKS5LRVk7XG52YXIgJGZhaWxzID0gcmVxdWlyZSgnLi9fZmFpbHMnKTtcbnZhciBzaGFyZWQgPSByZXF1aXJlKCcuL19zaGFyZWQnKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJyk7XG52YXIgdWlkID0gcmVxdWlyZSgnLi9fdWlkJyk7XG52YXIgd2tzID0gcmVxdWlyZSgnLi9fd2tzJyk7XG52YXIgd2tzRXh0ID0gcmVxdWlyZSgnLi9fd2tzLWV4dCcpO1xudmFyIHdrc0RlZmluZSA9IHJlcXVpcmUoJy4vX3drcy1kZWZpbmUnKTtcbnZhciBlbnVtS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0ta2V5cycpO1xudmFyIGlzQXJyYXkgPSByZXF1aXJlKCcuL19pcy1hcnJheScpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKTtcbnZhciBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xudmFyIF9jcmVhdGUgPSByZXF1aXJlKCcuL19vYmplY3QtY3JlYXRlJyk7XG52YXIgZ09QTkV4dCA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BuLWV4dCcpO1xudmFyICRHT1BEID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcGQnKTtcbnZhciAkRFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciAka2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJyk7XG52YXIgZ09QRCA9ICRHT1BELmY7XG52YXIgZFAgPSAkRFAuZjtcbnZhciBnT1BOID0gZ09QTkV4dC5mO1xudmFyICRTeW1ib2wgPSBnbG9iYWwuU3ltYm9sO1xudmFyICRKU09OID0gZ2xvYmFsLkpTT047XG52YXIgX3N0cmluZ2lmeSA9ICRKU09OICYmICRKU09OLnN0cmluZ2lmeTtcbnZhciBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcbnZhciBISURERU4gPSB3a3MoJ19oaWRkZW4nKTtcbnZhciBUT19QUklNSVRJVkUgPSB3a3MoJ3RvUHJpbWl0aXZlJyk7XG52YXIgaXNFbnVtID0ge30ucHJvcGVydHlJc0VudW1lcmFibGU7XG52YXIgU3ltYm9sUmVnaXN0cnkgPSBzaGFyZWQoJ3N5bWJvbC1yZWdpc3RyeScpO1xudmFyIEFsbFN5bWJvbHMgPSBzaGFyZWQoJ3N5bWJvbHMnKTtcbnZhciBPUFN5bWJvbHMgPSBzaGFyZWQoJ29wLXN5bWJvbHMnKTtcbnZhciBPYmplY3RQcm90byA9IE9iamVjdFtQUk9UT1RZUEVdO1xudmFyIFVTRV9OQVRJVkUgPSB0eXBlb2YgJFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xudmFyIFFPYmplY3QgPSBnbG9iYWwuUU9iamVjdDtcbi8vIERvbid0IHVzZSBzZXR0ZXJzIGluIFF0IFNjcmlwdCwgaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzE3M1xudmFyIHNldHRlciA9ICFRT2JqZWN0IHx8ICFRT2JqZWN0W1BST1RPVFlQRV0gfHwgIVFPYmplY3RbUFJPVE9UWVBFXS5maW5kQ2hpbGQ7XG5cbi8vIGZhbGxiYWNrIGZvciBvbGQgQW5kcm9pZCwgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTY4N1xudmFyIHNldFN5bWJvbERlc2MgPSBERVNDUklQVE9SUyAmJiAkZmFpbHMoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gX2NyZWF0ZShkUCh7fSwgJ2EnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBkUCh0aGlzLCAnYScsIHsgdmFsdWU6IDcgfSkuYTsgfVxuICB9KSkuYSAhPSA3O1xufSkgPyBmdW5jdGlvbiAoaXQsIGtleSwgRCkge1xuICB2YXIgcHJvdG9EZXNjID0gZ09QRChPYmplY3RQcm90bywga2V5KTtcbiAgaWYgKHByb3RvRGVzYykgZGVsZXRlIE9iamVjdFByb3RvW2tleV07XG4gIGRQKGl0LCBrZXksIEQpO1xuICBpZiAocHJvdG9EZXNjICYmIGl0ICE9PSBPYmplY3RQcm90bykgZFAoT2JqZWN0UHJvdG8sIGtleSwgcHJvdG9EZXNjKTtcbn0gOiBkUDtcblxudmFyIHdyYXAgPSBmdW5jdGlvbiAodGFnKSB7XG4gIHZhciBzeW0gPSBBbGxTeW1ib2xzW3RhZ10gPSBfY3JlYXRlKCRTeW1ib2xbUFJPVE9UWVBFXSk7XG4gIHN5bS5fayA9IHRhZztcbiAgcmV0dXJuIHN5bTtcbn07XG5cbnZhciBpc1N5bWJvbCA9IFVTRV9OQVRJVkUgJiYgdHlwZW9mICRTeW1ib2wuaXRlcmF0b3IgPT0gJ3N5bWJvbCcgPyBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJztcbn0gOiBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0IGluc3RhbmNlb2YgJFN5bWJvbDtcbn07XG5cbnZhciAkZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBEKSB7XG4gIGlmIChpdCA9PT0gT2JqZWN0UHJvdG8pICRkZWZpbmVQcm9wZXJ0eShPUFN5bWJvbHMsIGtleSwgRCk7XG4gIGFuT2JqZWN0KGl0KTtcbiAga2V5ID0gdG9QcmltaXRpdmUoa2V5LCB0cnVlKTtcbiAgYW5PYmplY3QoRCk7XG4gIGlmIChoYXMoQWxsU3ltYm9scywga2V5KSkge1xuICAgIGlmICghRC5lbnVtZXJhYmxlKSB7XG4gICAgICBpZiAoIWhhcyhpdCwgSElEREVOKSkgZFAoaXQsIEhJRERFTiwgY3JlYXRlRGVzYygxLCB7fSkpO1xuICAgICAgaXRbSElEREVOXVtrZXldID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0pIGl0W0hJRERFTl1ba2V5XSA9IGZhbHNlO1xuICAgICAgRCA9IF9jcmVhdGUoRCwgeyBlbnVtZXJhYmxlOiBjcmVhdGVEZXNjKDAsIGZhbHNlKSB9KTtcbiAgICB9IHJldHVybiBzZXRTeW1ib2xEZXNjKGl0LCBrZXksIEQpO1xuICB9IHJldHVybiBkUChpdCwga2V5LCBEKTtcbn07XG52YXIgJGRlZmluZVByb3BlcnRpZXMgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKGl0LCBQKSB7XG4gIGFuT2JqZWN0KGl0KTtcbiAgdmFyIGtleXMgPSBlbnVtS2V5cyhQID0gdG9JT2JqZWN0KFApKTtcbiAgdmFyIGkgPSAwO1xuICB2YXIgbCA9IGtleXMubGVuZ3RoO1xuICB2YXIga2V5O1xuICB3aGlsZSAobCA+IGkpICRkZWZpbmVQcm9wZXJ0eShpdCwga2V5ID0ga2V5c1tpKytdLCBQW2tleV0pO1xuICByZXR1cm4gaXQ7XG59O1xudmFyICRjcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaXQsIFApIHtcbiAgcmV0dXJuIFAgPT09IHVuZGVmaW5lZCA/IF9jcmVhdGUoaXQpIDogJGRlZmluZVByb3BlcnRpZXMoX2NyZWF0ZShpdCksIFApO1xufTtcbnZhciAkcHJvcGVydHlJc0VudW1lcmFibGUgPSBmdW5jdGlvbiBwcm9wZXJ0eUlzRW51bWVyYWJsZShrZXkpIHtcbiAgdmFyIEUgPSBpc0VudW0uY2FsbCh0aGlzLCBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpKTtcbiAgaWYgKHRoaXMgPT09IE9iamVjdFByb3RvICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICFoYXMoT1BTeW1ib2xzLCBrZXkpKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiBFIHx8ICFoYXModGhpcywga2V5KSB8fCAhaGFzKEFsbFN5bWJvbHMsIGtleSkgfHwgaGFzKHRoaXMsIEhJRERFTikgJiYgdGhpc1tISURERU5dW2tleV0gPyBFIDogdHJ1ZTtcbn07XG52YXIgJGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KSB7XG4gIGl0ID0gdG9JT2JqZWN0KGl0KTtcbiAga2V5ID0gdG9QcmltaXRpdmUoa2V5LCB0cnVlKTtcbiAgaWYgKGl0ID09PSBPYmplY3RQcm90byAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhaGFzKE9QU3ltYm9scywga2V5KSkgcmV0dXJuO1xuICB2YXIgRCA9IGdPUEQoaXQsIGtleSk7XG4gIGlmIChEICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICEoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSkpIEQuZW51bWVyYWJsZSA9IHRydWU7XG4gIHJldHVybiBEO1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlOYW1lcyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpIHtcbiAgdmFyIG5hbWVzID0gZ09QTih0b0lPYmplY3QoaXQpKTtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIgaSA9IDA7XG4gIHZhciBrZXk7XG4gIHdoaWxlIChuYW1lcy5sZW5ndGggPiBpKSB7XG4gICAgaWYgKCFoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkgJiYga2V5ICE9IEhJRERFTiAmJiBrZXkgIT0gTUVUQSkgcmVzdWx0LnB1c2goa2V5KTtcbiAgfSByZXR1cm4gcmVzdWx0O1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlTeW1ib2xzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGl0KSB7XG4gIHZhciBJU19PUCA9IGl0ID09PSBPYmplY3RQcm90bztcbiAgdmFyIG5hbWVzID0gZ09QTihJU19PUCA/IE9QU3ltYm9scyA6IHRvSU9iamVjdChpdCkpO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBpID0gMDtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIHtcbiAgICBpZiAoaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pICYmIChJU19PUCA/IGhhcyhPYmplY3RQcm90bywga2V5KSA6IHRydWUpKSByZXN1bHQucHVzaChBbGxTeW1ib2xzW2tleV0pO1xuICB9IHJldHVybiByZXN1bHQ7XG59O1xuXG4vLyAxOS40LjEuMSBTeW1ib2woW2Rlc2NyaXB0aW9uXSlcbmlmICghVVNFX05BVElWRSkge1xuICAkU3ltYm9sID0gZnVuY3Rpb24gU3ltYm9sKCkge1xuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgJFN5bWJvbCkgdGhyb3cgVHlwZUVycm9yKCdTeW1ib2wgaXMgbm90IGEgY29uc3RydWN0b3IhJyk7XG4gICAgdmFyIHRhZyA9IHVpZChhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZCk7XG4gICAgdmFyICRzZXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh0aGlzID09PSBPYmplY3RQcm90bykgJHNldC5jYWxsKE9QU3ltYm9scywgdmFsdWUpO1xuICAgICAgaWYgKGhhcyh0aGlzLCBISURERU4pICYmIGhhcyh0aGlzW0hJRERFTl0sIHRhZykpIHRoaXNbSElEREVOXVt0YWddID0gZmFsc2U7XG4gICAgICBzZXRTeW1ib2xEZXNjKHRoaXMsIHRhZywgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xuICAgIH07XG4gICAgaWYgKERFU0NSSVBUT1JTICYmIHNldHRlcikgc2V0U3ltYm9sRGVzYyhPYmplY3RQcm90bywgdGFnLCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgc2V0OiAkc2V0IH0pO1xuICAgIHJldHVybiB3cmFwKHRhZyk7XG4gIH07XG4gIHJlZGVmaW5lKCRTeW1ib2xbUFJPVE9UWVBFXSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2s7XG4gIH0pO1xuXG4gICRHT1BELmYgPSAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuICAkRFAuZiA9ICRkZWZpbmVQcm9wZXJ0eTtcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LWdvcG4nKS5mID0gZ09QTkV4dC5mID0gJGdldE93blByb3BlcnR5TmFtZXM7XG4gIHJlcXVpcmUoJy4vX29iamVjdC1waWUnKS5mID0gJHByb3BlcnR5SXNFbnVtZXJhYmxlO1xuICByZXF1aXJlKCcuL19vYmplY3QtZ29wcycpLmYgPSAkZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG4gIGlmIChERVNDUklQVE9SUyAmJiAhcmVxdWlyZSgnLi9fbGlicmFyeScpKSB7XG4gICAgcmVkZWZpbmUoT2JqZWN0UHJvdG8sICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsICRwcm9wZXJ0eUlzRW51bWVyYWJsZSwgdHJ1ZSk7XG4gIH1cblxuICB3a3NFeHQuZiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIHdyYXAod2tzKG5hbWUpKTtcbiAgfTtcbn1cblxuJGV4cG9ydCgkZXhwb3J0LkcgKyAkZXhwb3J0LlcgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgeyBTeW1ib2w6ICRTeW1ib2wgfSk7XG5cbmZvciAodmFyIGVzNlN5bWJvbHMgPSAoXG4gIC8vIDE5LjQuMi4yLCAxOS40LjIuMywgMTkuNC4yLjQsIDE5LjQuMi42LCAxOS40LjIuOCwgMTkuNC4yLjksIDE5LjQuMi4xMCwgMTkuNC4yLjExLCAxOS40LjIuMTIsIDE5LjQuMi4xMywgMTkuNC4yLjE0XG4gICdoYXNJbnN0YW5jZSxpc0NvbmNhdFNwcmVhZGFibGUsaXRlcmF0b3IsbWF0Y2gscmVwbGFjZSxzZWFyY2gsc3BlY2llcyxzcGxpdCx0b1ByaW1pdGl2ZSx0b1N0cmluZ1RhZyx1bnNjb3BhYmxlcydcbikuc3BsaXQoJywnKSwgaiA9IDA7IGVzNlN5bWJvbHMubGVuZ3RoID4gajspd2tzKGVzNlN5bWJvbHNbaisrXSk7XG5cbmZvciAodmFyIHdlbGxLbm93blN5bWJvbHMgPSAka2V5cyh3a3Muc3RvcmUpLCBrID0gMDsgd2VsbEtub3duU3ltYm9scy5sZW5ndGggPiBrOykgd2tzRGVmaW5lKHdlbGxLbm93blN5bWJvbHNbaysrXSk7XG5cbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsICdTeW1ib2wnLCB7XG4gIC8vIDE5LjQuMi4xIFN5bWJvbC5mb3Ioa2V5KVxuICAnZm9yJzogZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBoYXMoU3ltYm9sUmVnaXN0cnksIGtleSArPSAnJylcbiAgICAgID8gU3ltYm9sUmVnaXN0cnlba2V5XVxuICAgICAgOiBTeW1ib2xSZWdpc3RyeVtrZXldID0gJFN5bWJvbChrZXkpO1xuICB9LFxuICAvLyAxOS40LjIuNSBTeW1ib2wua2V5Rm9yKHN5bSlcbiAga2V5Rm9yOiBmdW5jdGlvbiBrZXlGb3Ioc3ltKSB7XG4gICAgaWYgKCFpc1N5bWJvbChzeW0pKSB0aHJvdyBUeXBlRXJyb3Ioc3ltICsgJyBpcyBub3QgYSBzeW1ib2whJyk7XG4gICAgZm9yICh2YXIga2V5IGluIFN5bWJvbFJlZ2lzdHJ5KSBpZiAoU3ltYm9sUmVnaXN0cnlba2V5XSA9PT0gc3ltKSByZXR1cm4ga2V5O1xuICB9LFxuICB1c2VTZXR0ZXI6IGZ1bmN0aW9uICgpIHsgc2V0dGVyID0gdHJ1ZTsgfSxcbiAgdXNlU2ltcGxlOiBmdW5jdGlvbiAoKSB7IHNldHRlciA9IGZhbHNlOyB9XG59KTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgJ09iamVjdCcsIHtcbiAgLy8gMTkuMS4yLjIgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxuICBjcmVhdGU6ICRjcmVhdGUsXG4gIC8vIDE5LjEuMi40IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKVxuICBkZWZpbmVQcm9wZXJ0eTogJGRlZmluZVByb3BlcnR5LFxuICAvLyAxOS4xLjIuMyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKVxuICBkZWZpbmVQcm9wZXJ0aWVzOiAkZGVmaW5lUHJvcGVydGllcyxcbiAgLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIC8vIDE5LjEuMi43IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXG4gIGdldE93blByb3BlcnR5TmFtZXM6ICRnZXRPd25Qcm9wZXJ0eU5hbWVzLFxuICAvLyAxOS4xLjIuOCBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKE8pXG4gIGdldE93blByb3BlcnR5U3ltYm9sczogJGdldE93blByb3BlcnR5U3ltYm9sc1xufSk7XG5cbi8vIDI0LjMuMiBKU09OLnN0cmluZ2lmeSh2YWx1ZSBbLCByZXBsYWNlciBbLCBzcGFjZV1dKVxuJEpTT04gJiYgJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAoIVVTRV9OQVRJVkUgfHwgJGZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgdmFyIFMgPSAkU3ltYm9sKCk7XG4gIC8vIE1TIEVkZ2UgY29udmVydHMgc3ltYm9sIHZhbHVlcyB0byBKU09OIGFzIHt9XG4gIC8vIFdlYktpdCBjb252ZXJ0cyBzeW1ib2wgdmFsdWVzIHRvIEpTT04gYXMgbnVsbFxuICAvLyBWOCB0aHJvd3Mgb24gYm94ZWQgc3ltYm9sc1xuICByZXR1cm4gX3N0cmluZ2lmeShbU10pICE9ICdbbnVsbF0nIHx8IF9zdHJpbmdpZnkoeyBhOiBTIH0pICE9ICd7fScgfHwgX3N0cmluZ2lmeShPYmplY3QoUykpICE9ICd7fSc7XG59KSksICdKU09OJywge1xuICBzdHJpbmdpZnk6IGZ1bmN0aW9uIHN0cmluZ2lmeShpdCkge1xuICAgIHZhciBhcmdzID0gW2l0XTtcbiAgICB2YXIgaSA9IDE7XG4gICAgdmFyIHJlcGxhY2VyLCAkcmVwbGFjZXI7XG4gICAgd2hpbGUgKGFyZ3VtZW50cy5sZW5ndGggPiBpKSBhcmdzLnB1c2goYXJndW1lbnRzW2krK10pO1xuICAgICRyZXBsYWNlciA9IHJlcGxhY2VyID0gYXJnc1sxXTtcbiAgICBpZiAoIWlzT2JqZWN0KHJlcGxhY2VyKSAmJiBpdCA9PT0gdW5kZWZpbmVkIHx8IGlzU3ltYm9sKGl0KSkgcmV0dXJuOyAvLyBJRTggcmV0dXJucyBzdHJpbmcgb24gdW5kZWZpbmVkXG4gICAgaWYgKCFpc0FycmF5KHJlcGxhY2VyKSkgcmVwbGFjZXIgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgaWYgKHR5cGVvZiAkcmVwbGFjZXIgPT0gJ2Z1bmN0aW9uJykgdmFsdWUgPSAkcmVwbGFjZXIuY2FsbCh0aGlzLCBrZXksIHZhbHVlKTtcbiAgICAgIGlmICghaXNTeW1ib2wodmFsdWUpKSByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgICBhcmdzWzFdID0gcmVwbGFjZXI7XG4gICAgcmV0dXJuIF9zdHJpbmdpZnkuYXBwbHkoJEpTT04sIGFyZ3MpO1xuICB9XG59KTtcblxuLy8gMTkuNC4zLjQgU3ltYm9sLnByb3RvdHlwZVtAQHRvUHJpbWl0aXZlXShoaW50KVxuJFN5bWJvbFtQUk9UT1RZUEVdW1RPX1BSSU1JVElWRV0gfHwgcmVxdWlyZSgnLi9faGlkZScpKCRTeW1ib2xbUFJPVE9UWVBFXSwgVE9fUFJJTUlUSVZFLCAkU3ltYm9sW1BST1RPVFlQRV0udmFsdWVPZik7XG4vLyAxOS40LjMuNSBTeW1ib2wucHJvdG90eXBlW0BAdG9TdHJpbmdUYWddXG5zZXRUb1N0cmluZ1RhZygkU3ltYm9sLCAnU3ltYm9sJyk7XG4vLyAyMC4yLjEuOSBNYXRoW0BAdG9TdHJpbmdUYWddXG5zZXRUb1N0cmluZ1RhZyhNYXRoLCAnTWF0aCcsIHRydWUpO1xuLy8gMjQuMy4zIEpTT05bQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKGdsb2JhbC5KU09OLCAnSlNPTicsIHRydWUpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9lczYuc3ltYm9sLmpzXG4vLyBtb2R1bGUgaWQgPSA1Njdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKShmYWxzZSk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIub2FrLnNwYWNlciB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBkaXNwbGF5OiBibG9jaztcXG59XFxuLm9hay5zcGFjZXIuaW5saW5lIHtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTtcXG59XFxuLm9hay5zcGFjZXIuZmx1aWQge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBmbGV4OiAxIDEgMTAwJTtcXG59XFxuLm9hay5zcGFjZXIudGlueSB7XFxuICB3aWR0aDogMnB4O1xcbiAgaGVpZ2h0OiAycHg7XFxufVxcbi5vYWsuc3BhY2VyLnNtYWxsIHtcXG4gIHdpZHRoOiA0cHg7XFxuICBoZWlnaHQ6IDRweDtcXG59XFxuLm9hay5zcGFjZXIubWVkaXVtIHtcXG4gIHdpZHRoOiAxMHB4O1xcbiAgaGVpZ2h0OiAxMHB4O1xcbn1cXG4ub2FrLnNwYWNlci5sYXJnZSB7XFxuICB3aWR0aDogMjBweDtcXG4gIGhlaWdodDogMjBweDtcXG59XFxuLm9hay5zcGFjZXIuaHVnZSB7XFxuICB3aWR0aDogMzBweDtcXG4gIGhlaWdodDogMzBweDtcXG59XFxuLm9hay5zcGFjZXIubWFzc2l2ZSB7XFxuICB3aWR0aDogNTBweDtcXG4gIGhlaWdodDogNTBweDtcXG59XFxuXCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2Nzcy1sb2FkZXIhLi9+L2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3JjL2FwcC9TcGFjZXIubGVzc1xuLy8gbW9kdWxlIGlkID0gNTY5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcIikoZmFsc2UpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiLmZ1bGxXaWR0aCB7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuLmZ1bGxIZWlnaHQge1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG4uZnVsbFNpemUge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcblwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jc3MtbG9hZGVyIS4vfi9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3NyYy9hcHAvc3R5bGVzLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDU3MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvL1xuLy9cdCMgQ29yZSBgcnVsZXNgIC0tIHNpbXBsZSBkYXRhdHlwZXMsIGV0Yy5cbi8vXG4vLyBOT1RFOiBtYW55IG9mIHRoZSBiZWxvdyBhcmUgY3JlYXRlZCBhcyBjdXN0b20gUGF0dGVybiBzdWJjbGFzc2VzIGZvciBkZWJ1Z2dpbmcuXG4vL1xuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuaW1wb3J0IFRva2VuaXplciBmcm9tIFwiLi4vLi4vVG9rZW5pemVyXCI7XG5cbi8vIENyZWF0ZSBgY29yZWAgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck1vZHVsZShcImNvcmVcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwic3RhdGVtZW50c1wiLFxuICAgIGNvbnN0cnVjdG9yOiBSdWxlLlN0YXRlbWVudHNcbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJjb21tZW50XCIsXG4gICAgY29uc3RydWN0b3I6IFJ1bGUuQ29tbWVudFxuICB9LFxuXG4gIC8vIGB3b3JkYCA9IGlzIGEgc2luZ2xlIGFscGhhbnVtZXJpYyB3b3JkLlxuICAvLyBNVVNUIHN0YXJ0IHdpdGggYSBsb3dlci1jYXNlIGxldHRlciAoPylcbiAge1xuICAgIG5hbWU6IFwid29yZFwiLFxuICAgIHBhdHRlcm46IC9eW2Etel1bXFx3XFwtXSokLyxcbiAgICBjYW5vbmljYWw6IFwiV29yZFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB3b3JkIGV4dGVuZHMgUnVsZS5QYXR0ZXJuIHtcbiAgICAgIC8vIENvbnZlcnQgXCItXCIgdG8gXCJfXCIgaW4gc291cmNlIG91dHB1dC5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVkLnJlcGxhY2UoL1xcLS9nLCBcIl9cIik7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyB3b3Jkc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcImFiY1wiLCBcImFiY1wiXSxcbiAgICAgICAgICBbXCJhYmMtZGVmXCIsIFwiYWJjX2RlZlwiXSxcbiAgICAgICAgICBbXCJhYmNfZGVmXCIsIFwiYWJjX2RlZlwiXSxcbiAgICAgICAgICBbXCJhYmMwMVwiLCBcImFiYzAxXCJdLFxuICAgICAgICAgIFtcImFiYy1kZWZfMDFcIiwgXCJhYmNfZGVmXzAxXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJkb2Vzbid0IG1hdGNoIHRoaW5ncyB0aGF0IGFyZW4ndCB3b3Jkc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIiRhc2RhXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wiKGFzZGEpXCIsIHVuZGVmaW5lZF0gICAgIC8vIFRPRE8uLi4gPz8/XG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIC8vIGBpZGVudGlmaWVyYCA9IHZhcmlhYmxlcyBvciBwcm9wZXJ0eSBuYW1lLlxuICAvLyBNVVNUIHN0YXJ0IHdpdGggYSBsb3dlci1jYXNlIGxldHRlciAoPylcbiAgLy8gTk9URTogV2UgYmxhY2tsaXN0IGEgbG90IG9mIHdvcmRzIGFzIGlkZW50aWZpZXJzLlxuICB7XG4gICAgbmFtZTogXCJpZGVudGlmaWVyXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIGNhbm9uaWNhbDogXCJJZGVuZmlmaWVyXCIsXG4gICAgcGF0dGVybjogL15bYS16XVtcXHdcXC1dKiQvLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpZGVudGlmaWVyIGV4dGVuZHMgUnVsZS5QYXR0ZXJuIHtcbiAgICAgIC8vIENvbnZlcnQgXCItXCIgdG8gXCJfXCIgaW4gc291cmNlIG91dHB1dC5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVkLnJlcGxhY2UoL1xcLS9nLCBcIl9cIik7XG4gICAgICB9XG4gICAgfSxcbiAgICBibGFja2xpc3Q6IFtcbiAgICAgIC8vIEFkZCBFbmdsaXNoIHByZXBvc2l0aW9ucyB0byBpZGVudGlmaWVyIGJsYWNrbGlzdC5cbiAgICAgIC8vXG4gICAgICAvLyBXaWtpcGVkaWEgXCJQcmVwb3NpdGlvblwiOlxuICAgICAgLy9cdFwiUHJlcG9zaXRpb25zLi4uYXJlIGEgY2xhc3Mgb2Ygd29yZHMgdGhhdFxuICAgICAgLy9cdGV4cHJlc3Mgc3BhdGlhbCBvciB0ZW1wb3JhbCByZWxhdGlvbnMgIChpbiwgdW5kZXIsIHRvd2FyZHMsIGJlZm9yZSlcbiAgICAgIC8vXHRvciBtYXJrIHZhcmlvdXMgc2VtYW50aWMgcm9sZXMgKG9mLCBmb3IpLlxuICAgICAgLy8gVEVTVE1FXG4gICAgICBcImFib3V0XCIsIFwiYWJvdmVcIiwgXCJhZnRlclwiLCBcImFuZFwiLCBcImFzXCIsIFwiYXRcIixcbiAgICAgIFwiYmVmb3JlXCIsIFwiYmVoaW5kXCIsIFwiYmVsb3dcIiwgXCJiZW5lYXRoXCIsIFwiYmVzaWRlXCIsIFwiYmV0d2VlblwiLCBcImJleW9uZFwiLCBcImJ5XCIsXG4gICAgICBcImRlZmluZWRcIiwgXCJkb3duXCIsIFwiZHVyaW5nXCIsXG4gICAgICBcImVhY2hcIiwgXCJlbXB0eVwiLCBcImV4YWN0bHlcIiwgXCJleGNlcHRcIixcbiAgICAgIFwiZm9yXCIsIFwiZnJvbVwiLFxuICAgICAgXCJncmVhdGVyXCIsXG4gICAgICBcIklcIiwgXCJpblwiLCBcImludG9cIixcbiAgICAgIFwibGVzc1wiLCBcImxvbmdcIixcbiAgICAgIFwibWVcIiwgXCJtaW51c1wiLCBcIm1vcmVcIixcbiAgICAgIFwibmVhclwiLCBcIm5vdFwiLFxuICAgICAgXCJvZlwiLCBcIm9mZlwiLCBcIm9uXCIsIFwib250b1wiLCBcIm9wcG9zaXRlXCIsIFwib3JcIiwgXCJvdXRcIiwgXCJvdXRzaWRlXCIsIFwib3ZlclwiLFxuICAgICAgXCJzaG9ydFwiLCBcInNpbmNlXCIsXG4gICAgICBcInRoYW5cIiwgXCJ0aGVcIiwgXCJ0aGVuXCIsIFwidGhyb3VnaFwiLCBcInRocnVcIiwgXCJ0b1wiLCBcInRvd2FyZFwiLCBcInRvd2FyZHNcIixcbiAgICAgIFwidW5kZWZpbmVkXCIsIFwidW5kZXJcIiwgXCJ1bmRlcm5lYXRoXCIsIFwidW5pcXVlXCIsIFwidW50aWxcIiwgXCJ1cFwiLCBcInVwb25cIiwgXCJ1cHNpZGVcIixcbiAgICAgIFwidmVyc3VzXCIsIFwidnNcIixcbiAgICAgIFwid2hlcmVcIiwgXCJ3aXRoXCIsIFwid2l0aGluXCIsIFwid2l0aG91dFwiLFxuXG4gICAgICAvLyBBZGQgY29tbW9uIGVuZ2xpc2ggdmVyYnMgdG8gaWRlbnRpZmllciBibGFja2xpc3QuXG4gICAgICBcImFyZVwiLFxuICAgICAgXCJkb1wiLCBcImRvZXNcIixcbiAgICAgIFwiY29udGFpbnNcIixcbiAgICAgIFwiaGFzXCIsIFwiaGF2ZVwiLFxuICAgICAgXCJpc1wiLFxuICAgICAgXCJyZXBlYXRcIixcbiAgICAgIFwid2FzXCIsIFwid2VyZVwiLFxuXG4gICAgICAvLyBBZGQgc3BlY2lhbCBjb250cm9sIGtleXdvcmRzIHRvIGlkZW50aWZpZXIgYmxhY2tsaXN0LlxuICAgICAgXCJlbHNlXCIsXG4gICAgICBcImlmXCIsXG4gICAgICBcIm90aGVyd2lzZVwiLFxuICAgICAgXCJ3aGlsZVwiLFxuXG4gICAgICAvLyBBZGQgYm9vbGVhbiB0b2tlbnMgdG8gaWRlbnRpZmllciBibGFja2xpc3QuXG4gICAgICBcInRydWVcIiwgXCJmYWxzZVwiLFxuICAgICAgXCJ5ZXNcIiwgXCJub1wiLFxuICAgICAgXCJva1wiLCBcImNhbmNlbFwiLFxuICAgICAgXCJzdWNjZXNzXCIsIFwiZmFpbHVyZVwiLFxuXG4gICAgICAvLyBBZGQgbnVtYmVyIHdvcmRzIHRvIGlkZW50aWZpZXIgYmxhY2tsaXN0LlxuICAgICAgLy8gVEVTVE1FXG4gICAgICBcIm9uZVwiLCBcInR3b1wiLCBcInRocmVlXCIsIFwiZm91clwiLCBcImZpdmVcIixcbiAgICAgIFwic2l4XCIsIFwic2V2ZW5cIiwgXCJlaWdodFwiLCBcIm5pbmVcIiwgXCJ0ZW5cIixcbiAgICBdLFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIGlkZW50aWZpZXJzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wiYWJjXCIsIFwiYWJjXCJdLFxuICAgICAgICAgIFtcImFiYy1kZWZcIiwgXCJhYmNfZGVmXCJdLFxuICAgICAgICAgIFtcImFiY19kZWZcIiwgXCJhYmNfZGVmXCJdLFxuICAgICAgICAgIFtcImFiYzAxXCIsIFwiYWJjMDFcIl0sXG4gICAgICAgICAgW1wiYWJjLWRlZl8wMVwiLCBcImFiY19kZWZfMDFcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImRvZXNuJ3QgbWF0Y2ggdGhpbmdzIHRoYXQgYXJlbid0IGlkZW50aWZpZXJzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wiJGFzZGFcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCIoYXNkYSlcIiwgdW5kZWZpbmVkXSwgICAgIC8vIFRPRE8uLi4gPz8/XG4gICAgICAgICAgW1wiQWJjXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcInNraXBzIGl0ZW1zIGluIGl0cyBibGFja2xpc3RcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJ5ZXNcIiwgdW5kZWZpbmVkXVxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICB9LFxuXG4gIC8vIGBUeXBlYCA9IHR5cGUgbmFtZS5cbiAgLy8gTVVTVCBzdGFydCB3aXRoIGFuIHVwcGVyLWNhc2UgbGV0dGVyICg/KVxuICB7XG4gICAgbmFtZTogXCJ0eXBlXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIGNhbm9uaWNhbDogXCJUeXBlXCIsXG4gICAgcGF0dGVybjogL14oW0EtWl1bXFx3XFwtXSp8bGlzdHx0ZXh0fG51bWJlcnxpbnRlZ2VyfGRlY2ltYWx8Y2hhcmFjdGVyfGJvb2xlYW58b2JqZWN0KSQvLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0eXBlIGV4dGVuZHMgUnVsZS5QYXR0ZXJuIHtcbiAgICAgIC8vIENvbnZlcnQgXCItXCIgdG8gXCJfXCIgaW4gc291cmNlIG91dHB1dC5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgdHlwZSA9IHRoaXMubWF0Y2hlZDtcbiAgICAgICAgc3dpdGNoKHR5cGUpIHtcbiAgICAgICAgICAvLyBBbGlhcyBgTGlzdGAgdG8gYEFycmF5YFxuICAgICAgICAgIGNhc2UgXCJMaXN0XCI6XHRcdHJldHVybiBcIkFycmF5XCI7XG5cbiAgICAgICAgICAvLyBzcGVjaWFsIGNhc2UgdG8gdGFrZSB0aGUgZm9sbG93aW5nIGFzIGxvd2VyY2FzZVxuICAgICAgICAgIGNhc2UgXCJsaXN0XCI6XHRcdHJldHVybiBcIkFycmF5XCI7XG4gICAgICAgICAgY2FzZSBcInRleHRcIjpcdFx0cmV0dXJuIFwiU3RyaW5nXCI7XG4gICAgICAgICAgY2FzZSBcImNoYXJhY3RlclwiOlx0cmV0dXJuIFwiQ2hhcmFjdGVyXCI7XG4gICAgICAgICAgY2FzZSBcIm51bWJlclwiOlx0XHRyZXR1cm4gXCJOdW1iZXJcIjtcbiAgICAgICAgICBjYXNlIFwiaW50ZWdlclwiOlx0XHRyZXR1cm4gXCJJbnRlZ2VyXCI7XG4gICAgICAgICAgY2FzZSBcImRlY2ltYWxcIjpcdFx0cmV0dXJuIFwiRGVjaW1hbFwiO1xuICAgICAgICAgIGNhc2UgXCJib29sZWFuXCI6XHRcdHJldHVybiBcIkJvb2xlYW5cIjtcbiAgICAgICAgICBjYXNlIFwib2JqZWN0XCI6XHRcdHJldHVybiBcIk9iamVjdFwiO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gdHlwZS5yZXBsYWNlKC9cXC0vZywgXCJfXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBibGFja2xpc3Q6IFsgXCJJXCIgXSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyB0eXBlc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIkFiY1wiLCBcIkFiY1wiXSxcbiAgICAgICAgICBbXCJBYmMtZGVmXCIsIFwiQWJjX2RlZlwiXSxcbiAgICAgICAgICBbXCJBYmNfRGVmXCIsIFwiQWJjX0RlZlwiXSxcbiAgICAgICAgICBbXCJBYmMwMVwiLCBcIkFiYzAxXCJdLFxuICAgICAgICAgIFtcIkFiYy1kZWZfMDFcIiwgXCJBYmNfZGVmXzAxXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJkb2Vzbid0IG1hdGNoIHRoaW5ncyB0aGF0IGFyZW4ndCB0eXBlc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIlwiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcIiRBc2RhXCIsIHVuZGVmaW5lZF0sICAgICAvLyBUT0RPLi4uID8/P1xuICAgICAgICAgIFtcIihBc2RhKVwiLCB1bmRlZmluZWRdLCAgICAvLyBUT0RPLi4uID8/P1xuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb252ZXJ0cyBzcGVjaWFsIHR5cGVzXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiTGlzdFwiLCBcIkFycmF5XCJdLFxuICAgICAgICAgIFtcImxpc3RcIiwgXCJBcnJheVwiXSxcbiAgICAgICAgICBbXCJ0ZXh0XCIsIFwiU3RyaW5nXCJdLFxuICAgICAgICAgIFtcImNoYXJhY3RlclwiLCBcIkNoYXJhY3RlclwiXSxcbiAgICAgICAgICBbXCJudW1iZXJcIiwgXCJOdW1iZXJcIl0sXG4gICAgICAgICAgW1wiaW50ZWdlclwiLCBcIkludGVnZXJcIl0sXG4gICAgICAgICAgW1wiZGVjaW1hbFwiLCBcIkRlY2ltYWxcIl0sXG4gICAgICAgICAgW1wiYm9vbGVhblwiLCBcIkJvb2xlYW5cIl0sXG4gICAgICAgICAgW1wib2JqZWN0XCIsIFwiT2JqZWN0XCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJza2lwcyBpdGVtcyBpbiBpdHMgYmxhY2tsaXN0XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiSVwiLCB1bmRlZmluZWRdXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICBdXG4gIH0sXG5cblxuXG4gIC8vIEJvb2xlYW4gbGl0ZXJhbCwgY3JlYXRlZCB3aXRoIGN1c3RvbSBjb25zdHJ1Y3RvciBmb3IgZGVidWdnaW5nLlxuICAvLyBUT0RPOiBiZXR0ZXIgbmFtZSBmb3IgdGhpcz8/P1xuICB7XG4gICAgbmFtZTogXCJib29sZWFuXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIGNhbm9uaWNhbDogXCJCb29sZWFuXCIsXG4gICAgcGF0dGVybjogL14odHJ1ZXxmYWxzZXx5ZXN8bm98b2t8Y2FuY2VsfHN1Y2Nlc3N8ZmFpbHVyZSkkLyxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgYm9vbGVhbiBleHRlbmRzIFJ1bGUuUGF0dGVybiB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLm1hdGNoZWQpIHtcbiAgICAgICAgICBjYXNlIFwidHJ1ZVwiOlxuICAgICAgICAgIGNhc2UgXCJ5ZXNcIjpcbiAgICAgICAgICBjYXNlIFwib2tcIjpcbiAgICAgICAgICBjYXNlIFwic3VjY2Vzc1wiOlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBib29sZWFuc1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIlwiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcInRydWVcIiwgdHJ1ZV0sXG4gICAgICAgICAgW1wieWVzXCIsIHRydWVdLFxuICAgICAgICAgIFtcIm9rXCIsIHRydWVdLFxuICAgICAgICAgIFtcInN1Y2Nlc3NcIiwgdHJ1ZV0sXG4gICAgICAgICAgW1wiZmFsc2VcIiwgZmFsc2VdLFxuICAgICAgICAgIFtcIm5vXCIsIGZhbHNlXSxcbiAgICAgICAgICBbXCJjYW5jZWxcIiwgZmFsc2VdLFxuICAgICAgICAgIFtcImZhaWx1cmVcIiwgZmFsc2VdXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImRvZXNuJ3QgbWF0Y2ggaW4gdGhlIG1pZGRsZSBvZiBhIGxvbmdlciBrZXl3b3JkXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wieWVzc2lyXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wieWVzLXNpclwiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcInllc19zaXJcIiwgdW5kZWZpbmVkXVxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICAvLyBgbnVtYmVyYCBhcyBlaXRoZXIgZmxvYXQgb3IgaW50ZWdlciwgY3JlYXRlZCB3aXRoIGN1c3RvbSBjb25zdHJ1Y3RvciBmb3IgZGVidWdnaW5nLlxuICAvLyBOT1RFOiB5b3UgY2FuIGFsc28gdXNlIGBvbmVgLi4uYHRlbmAgYXMgc3RyaW5ncy4nXG4gIC8vIFRPRE86ICBgaW50ZWdlcmAgYW5kIGBkZWNpbWFsYD8gIHRvbyB0ZWNoeT9cbiAge1xuICAgIG5hbWU6IFwibnVtYmVyXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIGNhbm9uaWNhbDogXCJOdW1iZXJcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbnVtYmVyIGV4dGVuZHMgUnVsZSB7XG4gICAgICAvLyBTcGVjaWFsIHdvcmRzIHlvdSBjYW4gdXNlIGFzIG51bWJlcnMuLi5cbiAgICAgIHN0YXRpYyBOVU1CRVJfTkFNRVMgPSB7XG4gICAgICAgIHplcm86IDAsXG4gICAgICAgIG9uZTogMSxcbiAgICAgICAgdHdvOiAyLFxuICAgICAgICB0aHJlZTogMyxcbiAgICAgICAgZm91cjogNCxcbiAgICAgICAgZml2ZTogNSxcbiAgICAgICAgc2l4OiA2LFxuICAgICAgICBzZXZlbjogNyxcbiAgICAgICAgZWlnaHQ6IDgsXG4gICAgICAgIG5pbmU6IDksXG4gICAgICAgIHRlbjogMTBcbiAgICAgIH1cblxuICAgICAgLy8gTnVtYmVycyBnZXQgZW5jb2RlZCBhcyBudW1iZXJzIGluIHRoZSB0b2tlbiBzdHJlYW0uXG4gICAgICBwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwKSB7XG4gICAgICAgIGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG4gICAgICAgIC8vIGlmIGEgc3RyaW5nLCBhdHRlbXB0IHRvIHJ1biB0aHJvdWdoIG91ciBOVU1CRVJfTkFNRVNcbiAgICAgICAgaWYgKHR5cGVvZiB0b2tlbiA9PT0gXCJzdHJpbmdcIikgdG9rZW4gPSBSdWxlLk51bWJlci5OVU1CRVJfTkFNRVNbdG9rZW5dO1xuICAgICAgICBpZiAodHlwZW9mIHRva2VuICE9PSBcIm51bWJlclwiKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSh7XG4gICAgICAgICAgbWF0Y2hlZDogdG9rZW4sXG4gICAgICAgICAgbmV4dFN0YXJ0OiBzdGFydCArIDFcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgdG8gbnVtYmVyIG9uIHNvdXJjZSBvdXRwdXQuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0Y2hlZDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIG51bWJlcnNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCIxXCIsIDFdLFxuICAgICAgICAgIFtcIjEwMDBcIiwgMTAwMF0sXG4gICAgICAgICAgW1wiLTFcIiwgLTFdLFxuICAgICAgICAgIFtcIjEuMVwiLCAxLjFdLFxuICAgICAgICAgIFtcIjAwMC4xXCIsIDAuMV0sXG4gICAgICAgICAgW1wiMS5cIiwgMV0sXG4gICAgICAgICAgW1wiLjFcIiwgMC4xXSxcbiAgICAgICAgICBbXCItMTExLjExMVwiLCAtMTExLjExMV0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImRvZXNuJ3QgbWF0Y2ggdGhpbmdzIHRoYXQgYXJlbid0IG51bWJlcnNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCJcIiwgdW5kZWZpbmVkXSxcbiAgICAgICAgICBbXCIuXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcInJlcXVpcmVzIG5lZ2F0aXZlIHNpZ24gdG8gYmUgdG91Y2hpbmcgdGhlIG51bWJlclwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIi0gMVwiLCB1bmRlZmluZWRdXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9LFxuXG4gIC8vIExpdGVyYWwgYHRleHRgIHN0cmluZywgY3JlYXRlZCB3aXRoIGN1c3RvbSBjb25zdHJ1Y3RvciBmb3IgZGVidWdnaW5nLlxuICAvLyBZb3UgY2FuIHVzZSBlaXRoZXIgc2luZ2xlIG9yIGRvdWJsZSBxdW90ZXMgb24gdGhlIG91dHNpZGUgKGFsdGhvdWdoIGRvdWJsZSBxdW90ZXMgYXJlIHByZWZlcnJlZCkuXG4gIC8vIFJldHVybmVkIHZhbHVlIGhhcyBlbmNsb3NpbmcgcXVvdGVzLlxuICB7XG4gICAgbmFtZTogXCJ0ZXh0XCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIGNhbm9uaWNhbDogXCJUZXh0XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHRleHQgZXh0ZW5kcyBSdWxlIHtcbiAgICAgIC8vIFRleHQgc3RyaW5ncyBnZXQgZW5jb2RlZCBhcyBgdGV4dGAgb2JqZWN0cyBpbiB0aGUgdG9rZW4gc3RyZWFtLlxuICAgICAgcGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCkge1xuICAgICAgICBsZXQgdG9rZW4gPSB0b2tlbnNbc3RhcnRdO1xuICAgICAgICBpZiAoISh0b2tlbiBpbnN0YW5jZW9mIFRva2VuaXplci5UZXh0KSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoe1xuICAgICAgICAgIG1hdGNoZWQ6IHRva2VuLnF1b3RlZFN0cmluZyxcbiAgICAgICAgICBuZXh0U3RhcnQ6IHN0YXJ0ICsgMVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoZWQ7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyB0ZXh0XCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgWydcIlwiJywgJ1wiXCInXSxcbiAgICAgICAgICBbXCInJ1wiLCBcIicnXCJdLFxuICAgICAgICAgIFsnXCJhXCInLCAnXCJhXCInXSxcbiAgICAgICAgICBbXCInYSdcIiwgXCInYSdcIl0sXG4gICAgICAgICAgWydcImFiY2RcIicsICdcImFiY2RcIiddLFxuICAgICAgICAgIFsnXCJhYmMgZGVmIGdoaS4gamtsXCInLCAnXCJhYmMgZGVmIGdoaS4gamtsXCInXSxcbiAgICAgICAgICBbJ1wiLi4uQ2FuXFwndCB0b3VjaCB0aGlzXCInLCAnXCIuLi5DYW5cXCd0IHRvdWNoIHRoaXNcIiddLFxuLy9GSVhNRSAgICAgICAgICBbXCInXFxcIkdhZHpvb2tzISBJIGNhblxcXFwndCBiZWxpZXZlIGl0IVxcXCIgaGUgc2FpZCdcIiwgXCInXFxcIkdhZHpvb2tzISBJIGNhblxcJ3QgYmVsaWV2ZSBpdCFcXFwiIGhlIHNhaWQnXCJdLFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuICAvLyBMaXRlcmFsIGxpc3QgKGFycmF5KSwgZWc6ICBgWzEsMiAsIHRydWUsZmFsc2UgXWBcbiAge1xuICAgIG5hbWU6IFwibGl0ZXJhbF9saXN0XCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJcXFxcW1tsaXN0OntleHByZXNzaW9ufSxdP1xcXFxdXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpdGVyYWxfbGlzdCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBbJHtsaXN0ID8gbGlzdC5qb2luKFwiLCBcIikgOiBcIlwifV1gO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IFwiY29ycmVjdGx5IG1hdGNoZXMgbGl0ZXJhbCBsaXN0c1wiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIltdXCIsIFwiW11cIl0sXG4gICAgICAgICAgW1wiWzFdXCIsIFwiWzFdXCJdLFxuICAgICAgICAgIFtcIlsxLF1cIiwgXCJbMV1cIl0sXG4gICAgICAgICAgW1wiWzEsMiwzXVwiLCBcIlsxLCAyLCAzXVwiXSxcbiAgICAgICAgICBbXCJbMSwgMiwgM11cIiwgXCJbMSwgMiwgM11cIl0sXG4gICAgICAgICAgW1wiWzEsMiwzLF1cIiwgXCJbMSwgMiwgM11cIl0sXG4gICAgICAgICAgW1wiW3llcyxubywnYScsMV1cIiwgXCJbdHJ1ZSwgZmFsc2UsICdhJywgMV1cIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImRvZXNuJ3QgbWF0Y2ggbWFsZm9ybWVkIGxpc3RzIFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtcIlwiLCB1bmRlZmluZWRdLFxuICAgICAgICAgIFtcIlssMV1cIiwgdW5kZWZpbmVkXVxuICAgICAgICBdXG4gICAgICB9LFxuICAgIF1cbiAgfSxcblxuXG4gIC8vIFBhcmVudGhlc2l6ZWQgZXhwcmVzc2lvblxuICB7XG4gICAgbmFtZTogXCJwYXJlbnRoZXNpemVkX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIlxcXFwoe2V4cHJlc3Npb259XFxcXClcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcGFyZW50aGVzaXplZF9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgZXhwcmVzc2lvbiB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICAvLyBkb24ndCBkb3VibGUgcGFyZW5zIGlmIG5vdCBuZWNlc3NhcnlcbiAgICAgICAgaWYgKHR5cGVvZiBleHByZXNzaW9uID09PSBcInN0cmluZ1wiICYmIGV4cHJlc3Npb24uc3RhcnRzV2l0aChcIihcIikgJiYgZXhwcmVzc2lvbi5lbmRzV2l0aChcIilcIikpIHJldHVybiBleHByZXNzaW9uO1xuICAgICAgICByZXR1cm4gXCIoXCIgKyBleHByZXNzaW9uICsgXCIpXCI7XG4gICAgICB9XG4gICAgfSxcbiAgICB0ZXN0czogW1xuICAgICAge1xuICAgICAgICB0aXRsZTogXCJjb3JyZWN0bHkgbWF0Y2hlcyBwYXJlbnRoZXNpemVkIGV4cHJlc3Npb25zXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiKHNvbWVWYXIpXCIsIFwiKHNvbWVWYXIpXCJdLFxuICAgICAgICAgIFtcIigoc29tZVZhcikpXCIsIFwiKHNvbWVWYXIpXCJdLFxuICAgICAgICAgIFtcIigxIGFuZCB5ZXMpXCIsIFwiKDEgJiYgdHJ1ZSlcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImNvcnJlY3RseSBtYXRjaGVzIG11bHRpcGxlIHBhcmVudGhlc2lzXCIsXG4gICAgICAgIGNvbXBpbGVBczogXCJleHByZXNzaW9uXCIsXG4gICAgICAgIHRlc3RzOiBbXG4gICAgICAgICAgW1wiKDEpIGFuZCAoeWVzKVwiLCBcIigoMSkgJiYgKHRydWUpKVwiXSxcbiAgICAgICAgICBbXCIoKDEpIGFuZCAoeWVzKSlcIiwgXCIoKDEpICYmICh0cnVlKSlcIl0sXG4gICAgICAgICAgW1wiKCgxKSBhbmQgKCh5ZXMpKSlcIiwgXCIoKDEpICYmICh0cnVlKSlcIl0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcImRvZXNuJ3QgbWF0Y2ggbWFsZm9ybWVkIHBhcmVudGhlc2l6ZWQgZXhwcmVzc2lvbnNcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbXCIoZm9vXCIsIHVuZGVmaW5lZF0sXG4gICAgICAgICAgW1wiKGZvbyhiYXIpYmF6XCIsIHVuZGVmaW5lZF0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgXVxuICB9XG5cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvY29yZS5qcyIsIi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiA3OyB9IH0pLmEgIT0gNztcbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZGVzY3JpcHRvcnMuanNcbi8vIG1vZHVsZSBpZCA9IDcyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19oYXMuanNcbi8vIG1vZHVsZSBpZCA9IDczXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGRQID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcykge1xuICBhbk9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBhbk9iamVjdChBdHRyaWJ1dGVzKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBkUChPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG4gIGlmICgnZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpIHRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XG4gIGlmICgndmFsdWUnIGluIEF0dHJpYnV0ZXMpIE9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanNcbi8vIG1vZHVsZSBpZCA9IDc0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3RQcm9wVHlwZXNTZWNyZXQgPSByZXF1aXJlKCcuL2xpYi9SZWFjdFByb3BUeXBlc1NlY3JldCcpO1xuXG5mdW5jdGlvbiBlbXB0eUZ1bmN0aW9uKCkge31cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gc2hpbShwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUsIHNlY3JldCkge1xuICAgIGlmIChzZWNyZXQgPT09IFJlYWN0UHJvcFR5cGVzU2VjcmV0KSB7XG4gICAgICAvLyBJdCBpcyBzdGlsbCBzYWZlIHdoZW4gY2FsbGVkIGZyb20gUmVhY3QuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoXG4gICAgICAnQ2FsbGluZyBQcm9wVHlwZXMgdmFsaWRhdG9ycyBkaXJlY3RseSBpcyBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBgcHJvcC10eXBlc2AgcGFja2FnZS4gJyArXG4gICAgICAnVXNlIFByb3BUeXBlcy5jaGVja1Byb3BUeXBlcygpIHRvIGNhbGwgdGhlbS4gJyArXG4gICAgICAnUmVhZCBtb3JlIGF0IGh0dHA6Ly9mYi5tZS91c2UtY2hlY2stcHJvcC10eXBlcydcbiAgICApO1xuICAgIGVyci5uYW1lID0gJ0ludmFyaWFudCBWaW9sYXRpb24nO1xuICAgIHRocm93IGVycjtcbiAgfTtcbiAgc2hpbS5pc1JlcXVpcmVkID0gc2hpbTtcbiAgZnVuY3Rpb24gZ2V0U2hpbSgpIHtcbiAgICByZXR1cm4gc2hpbTtcbiAgfTtcbiAgLy8gSW1wb3J0YW50IVxuICAvLyBLZWVwIHRoaXMgbGlzdCBpbiBzeW5jIHdpdGggcHJvZHVjdGlvbiB2ZXJzaW9uIGluIGAuL2ZhY3RvcnlXaXRoVHlwZUNoZWNrZXJzLmpzYC5cbiAgdmFyIFJlYWN0UHJvcFR5cGVzID0ge1xuICAgIGFycmF5OiBzaGltLFxuICAgIGJvb2w6IHNoaW0sXG4gICAgZnVuYzogc2hpbSxcbiAgICBudW1iZXI6IHNoaW0sXG4gICAgb2JqZWN0OiBzaGltLFxuICAgIHN0cmluZzogc2hpbSxcbiAgICBzeW1ib2w6IHNoaW0sXG5cbiAgICBhbnk6IHNoaW0sXG4gICAgYXJyYXlPZjogZ2V0U2hpbSxcbiAgICBlbGVtZW50OiBzaGltLFxuICAgIGluc3RhbmNlT2Y6IGdldFNoaW0sXG4gICAgbm9kZTogc2hpbSxcbiAgICBvYmplY3RPZjogZ2V0U2hpbSxcbiAgICBvbmVPZjogZ2V0U2hpbSxcbiAgICBvbmVPZlR5cGU6IGdldFNoaW0sXG4gICAgc2hhcGU6IGdldFNoaW0sXG4gICAgZXhhY3Q6IGdldFNoaW1cbiAgfTtcblxuICBSZWFjdFByb3BUeXBlcy5jaGVja1Byb3BUeXBlcyA9IGVtcHR5RnVuY3Rpb247XG4gIFJlYWN0UHJvcFR5cGVzLlByb3BUeXBlcyA9IFJlYWN0UHJvcFR5cGVzO1xuXG4gIHJldHVybiBSZWFjdFByb3BUeXBlcztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcHJvcC10eXBlcy9mYWN0b3J5V2l0aFRocm93aW5nU2hpbXMuanNcbi8vIG1vZHVsZSBpZCA9IDc3MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbi8qKlxuICogQG1vZHVsZSBjb21wb25lbnRXcmFwcGVyXG4gKlxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgKiBhcyBzdG9yZSBmcm9tICcuLi9zdG9yZSc7XG5pbXBvcnQgeyBvbk1vdW50LCBvblVubW91bnQgfSBmcm9tICcuLi9ldmVudF9oYW5kbGVycyc7XG5pbXBvcnQgeyBBTExfS0VZUyB9IGZyb20gJy4uL2xpYi9rZXlzJztcblxuLyoqXG4gKiBjb21wb25lbnRXcmFwcGVyXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSBXcmFwcGVkQ29tcG9uZW50IFJlYWN0IGNvbXBvbmVudCBjbGFzcyB0byBiZSB3cmFwcGVkXG4gKiBAcGFyYW0ge2FycmF5fSBba2V5c10gVGhlIGtleShzKSBib3VuZCB0byB0aGUgY2xhc3NcbiAqIEByZXR1cm4ge29iamVjdH0gVGhlIGhpZ2hlci1vcmRlciBmdW5jdGlvbiB0aGF0IHdyYXBzIHRoZSBkZWNvcmF0ZWQgY2xhc3NcbiAqL1xuZnVuY3Rpb24gY29tcG9uZW50V3JhcHBlcihXcmFwcGVkQ29tcG9uZW50KSB7XG4gIHZhciBrZXlzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBBTExfS0VZUztcblxuICB2YXIgS2V5Qm9hcmRIZWxwZXIgPSBmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhLZXlCb2FyZEhlbHBlciwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBLZXlCb2FyZEhlbHBlcihwcm9wcykge1xuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEtleUJvYXJkSGVscGVyKTtcblxuICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKEtleUJvYXJkSGVscGVyLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoS2V5Qm9hcmRIZWxwZXIpKS5jYWxsKHRoaXMsIHByb3BzKSk7XG5cbiAgICAgIF90aGlzLnN0YXRlID0ge1xuICAgICAgICBldmVudDogbnVsbFxuICAgICAgfTtcbiAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoS2V5Qm9hcmRIZWxwZXIsIFt7XG4gICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIG9uTW91bnQodGhpcyk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBvblVubW91bnQodGhpcyk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnaGFuZGxlS2V5RG93bicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaGFuZGxlS2V5RG93bihldmVudCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAvLyB0byBzaW11bGF0ZSBhIGtleXByZXNzLCBzZXQgdGhlIGV2ZW50IGFuZCB0aGVuIGNsZWFyIGl0IGluIHRoZSBjYWxsYmFja1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXZlbnQ6IGV2ZW50IH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMyLnNldFN0YXRlKHsgZXZlbnQ6IG51bGwgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChXcmFwcGVkQ29tcG9uZW50LCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywgeyBrZXlkb3duOiB0aGlzLnN0YXRlIH0pKTtcbiAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gS2V5Qm9hcmRIZWxwZXI7XG4gIH0oUmVhY3QuQ29tcG9uZW50KTtcblxuICBzdG9yZS5zZXRCaW5kaW5nKHsga2V5czogW10uY29uY2F0KGtleXMpLCBmbjogS2V5Qm9hcmRIZWxwZXIucHJvdG90eXBlLmhhbmRsZUtleURvd24sIHRhcmdldDogS2V5Qm9hcmRIZWxwZXIucHJvdG90eXBlIH0pO1xuXG4gIHJldHVybiBLZXlCb2FyZEhlbHBlcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY29tcG9uZW50V3JhcHBlcjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9kZWNvcmF0b3JzL2NsYXNzX2RlY29yYXRvci5qc1xuLy8gbW9kdWxlIGlkID0gODQxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxuLyoqXG4gKiBAbW9kdWxlIGRlY29yYXRvcnNcbiAqXG4gKi9cbmltcG9ydCBjbGFzc1dyYXBwZXIgZnJvbSAnLi9jbGFzc19kZWNvcmF0b3InO1xuaW1wb3J0IG1ldGhvZFdyYXBwZXIgZnJvbSAnLi9tZXRob2RfZGVjb3JhdG9yJztcbmltcG9ydCBtZXRob2RXcmFwcGVyU2NvcGVkIGZyb20gJy4vbWV0aG9kX2RlY29yYXRvcl9zY29wZWQnO1xuXG4vKipcbiAqIG5vb3BEZWNvcmF0b3JcbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEByZXR1cm4ge3VuZGVmaW5lZH0gUmV0dXJucyBgdW5kZWZpbmVkYCBzbyB0aGF0IHRoZSBvcmlnaW5hbCB1bmRlY29yYXRlZCBpbnN0YW5jZS9tZXRob2QgaXMgdXNlZFxuICovXG5mdW5jdGlvbiBub29wRGVjb3JhdG9yKCkge1xuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIF9kZWNvcmF0b3JcbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1ldGhvZEZuIFRoZSBtZXRob2Qgd3JhcHBlciB0byBkZWxlZ2F0ZSB0bywgYmFzZWQgb24gd2hldGhlciB1c2VyIGhhcyBzcGVjaWZpZWQgYSBzY29wZWQgZGVjb3JhdG9yIG9yIG5vdFxuICogQHBhcmFtIHtBcnJheX0gLi4uYXJncyBSZW1haW5kZXIgb2YgYXJndW1lbnRzIHBhc3NlZCBpblxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBkZWNvcmF0ZWQgY2xhc3Mgb3IgbWV0aG9kXG4gKi9cbmZ1bmN0aW9uIF9kZWNvcmF0b3IobWV0aG9kRm4pIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuID4gMSA/IF9sZW4gLSAxIDogMCksIF9rZXkgPSAxOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgYXJnc1tfa2V5IC0gMV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICAvLyBjaGVjayB0aGUgZmlyc3QgYXJndW1lbnQgdG8gc2VlIGlmIGl0J3MgYSB1c2VyLXN1cHBsaWVkIGtleWNvZGUgb3IgYXJyYXlcbiAgLy8gb2Yga2V5Y29kZXMsIG9yIGlmIGl0J3MgdGhlIHdyYXBwZWQgY2xhc3Mgb3IgbWV0aG9kXG4gIHZhciB0ZXN0QXJnID0gYXJnc1swXTtcbiAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5KHRlc3RBcmcpO1xuXG4gIC8vIGlmIHRoZSB0ZXN0IGFyZ3VtZW50IGlzIG5vdCBhbiBvYmplY3Qgb3IgZnVuY3Rpb24sIGl0IGlzIHVzZXItc3VwcGxpZWRcbiAgLy8ga2V5Y29kZXMuIGVsc2UgdGhlcmUgYXJlIG5vIGFyZ3VtZW50cyBhbmQgaXQncyBqdXN0IHRoZSB3cmFwcGVkIGNsYXNzXG4gIGlmIChpc0FycmF5IHx8IH5bJ3N0cmluZycsICdudW1iZXInLCAnc3ltYm9sJ10uaW5kZXhPZih0eXBlb2YgdGVzdEFyZyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YodGVzdEFyZykpKSB7XG4gICAgdmFyIGtleXMgPSBpc0FycmF5ID8gdGVzdEFyZyA6IGFyZ3M7XG5cbiAgICAvLyByZXR1cm4gdGhlIGRlY29yYXRvciBmdW5jdGlvbiwgd2hpY2ggb24gdGhlIG5leHQgY2FsbCB3aWxsIGxvb2sgZm9yXG4gICAgLy8gdGhlIHByZXNlbmNlIG9mIGEgbWV0aG9kIG5hbWUgdG8gZGV0ZXJtaW5lIGlmIHRoaXMgaXMgYSB3cmFwcGVkIG1ldGhvZFxuICAgIC8vIG9yIGNvbXBvbmVudFxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBtZXRob2ROYW1lLCBkZXNjcmlwdG9yKSB7XG4gICAgICByZXR1cm4gbWV0aG9kTmFtZSA/IG1ldGhvZEZuKHsgdGFyZ2V0OiB0YXJnZXQsIGRlc2NyaXB0b3I6IGRlc2NyaXB0b3IsIGtleXM6IGtleXMgfSkgOiBjbGFzc1dyYXBwZXIodGFyZ2V0LCBrZXlzKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHZhciBXcmFwcGVkQ29tcG9uZW50ID0gYXJnc1swXTtcbiAgICB2YXIgbWV0aG9kTmFtZSA9IGFyZ3NbMV07XG5cbiAgICAvLyBtZXRob2QgZGVjb3JhdG9ycyB3aXRob3V0IGtleWNvZGUgKHdoaWNoKSBhcmd1bWVudHMgYXJlIG5vdCBhbGxvd2VkLlxuICAgIGlmIChXcmFwcGVkQ29tcG9uZW50ICYmICFtZXRob2ROYW1lKSB7XG4gICAgICByZXR1cm4gY2xhc3NXcmFwcGVyLmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihtZXRob2ROYW1lICsgJzogTWV0aG9kIGRlY29yYXRvcnMgbXVzdCBoYXZlIGtleWNvZGUgYXJndW1lbnRzLCBzbyB0aGUgZGVjb3JhdG9yIGZvciB0aGlzIG1ldGhvZCB3aWxsIG5vdCBkbyBhbnl0aGluZycpO1xuICAgICAgcmV0dXJuIG5vb3BEZWNvcmF0b3I7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICoga2V5ZG93blNjb3BlZFxuICpcbiAqIE1ldGhvZCBkZWNvcmF0b3IgdGhhdCB3aWxsIGxvb2sgZm9yIGNoYW5nZXMgdG8gaXRzIHRhcmdldGVkIGNvbXBvbmVudCdzXG4gKiBga2V5ZG93bmAgcHJvcHMgdG8gZGVjaWRlIHdoZW4gdG8gdHJpZ2dlciwgcmF0aGVyIHRoYW4gcmVzcG9uZGluZyBkaXJlY3RseVxuICogdG8ga2V5ZG93biBldmVudHMuIFRoaXMgbGV0cyB5b3Ugc3BlY2lmeSBhIEBrZXlkb3duIGRlY29yYXRlZCBjbGFzcyBoaWdoZXJcbiAqIHVwIGluIHRoZSB2aWV3IGhpZXJhcmNoeSBmb3IgbGFyZ2VyIHNjb3Bpbmcgb2Yga2V5ZG93biBldmVudHMsIG9yIGZvclxuICogcHJvZ3JhbW1hdGljYWxseSBzZW5kaW5nIGtleWRvd24gZXZlbnRzIGFzIHByb3BzIGludG8gdGhlIGNvbXBvbmVudHMgaW4gb3JkZXJcbiAqIHRvIHRyaWdnZXIgZGVjb3JhdGVkIG1ldGhvZHMgd2l0aCBtYXRjaGluZyBrZXlzLlxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge0FycmF5fSAuLi5hcmdzICBBbGwgKG9yIG5vKSBhcmd1bWVudHMgcGFzc2VkIGluIGZyb20gZGVjb3JhdGlvblxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBkZWNvcmF0ZWQgY2xhc3Mgb3IgbWV0aG9kXG4gKi9cbmZ1bmN0aW9uIGtleWRvd25TY29wZWQoKSB7XG4gIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4yKSwgX2tleTIgPSAwOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgYXJnc1tfa2V5Ml0gPSBhcmd1bWVudHNbX2tleTJdO1xuICB9XG5cbiAgcmV0dXJuIF9kZWNvcmF0b3IuYXBwbHkodW5kZWZpbmVkLCBbbWV0aG9kV3JhcHBlclNjb3BlZF0uY29uY2F0KGFyZ3MpKTtcbn1cblxuLyoqXG4gKiBrZXlkb3duXG4gKlxuICogVGhlIG1haW4gZGVjb3JhdG9yIGFuZCBkZWZhdWx0IGV4cG9ydCwgaGFuZGxlcyBib3RoIGNsYXNzZXMgYW5kIG1ldGhvZHMuXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7QXJyYXl9IC4uLmFyZ3MgIEFsbCAob3Igbm8pIGFyZ3VtZW50cyBwYXNzZWQgaW4gZnJvbSBkZWNvcmF0aW9uXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIGRlY29yYXRlZCBjbGFzcyBvciBtZXRob2RcbiAqL1xuZnVuY3Rpb24ga2V5ZG93bigpIHtcbiAgZm9yICh2YXIgX2xlbjMgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbjMpLCBfa2V5MyA9IDA7IF9rZXkzIDwgX2xlbjM7IF9rZXkzKyspIHtcbiAgICBhcmdzW19rZXkzXSA9IGFyZ3VtZW50c1tfa2V5M107XG4gIH1cblxuICByZXR1cm4gX2RlY29yYXRvci5hcHBseSh1bmRlZmluZWQsIFttZXRob2RXcmFwcGVyXS5jb25jYXQoYXJncykpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBrZXlkb3duO1xuXG5leHBvcnQgeyBrZXlkb3duU2NvcGVkIH07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gODQyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxuLyoqXG4gKiBAbW9kdWxlIG1ldGhvZFdyYXBwZXJcbiAqXG4gKi9cbmltcG9ydCAqIGFzIHN0b3JlIGZyb20gJy4uL3N0b3JlJztcbmltcG9ydCB7IG9uTW91bnQsIG9uVW5tb3VudCwgX29uS2V5RG93biB9IGZyb20gJy4uL2V2ZW50X2hhbmRsZXJzJztcblxuLyoqXG4gKiBfaXNSZWFjdEtleURvd25cbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCBUaGUgcG9zc2libHkgc3ludGhldGljIGV2ZW50IHBhc3NlZCBhcyBhbiBhcmd1bWVudCB3aXRoXG4gKiB0aGUgbWV0aG9kIGludm9jYXRpb24uXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBfaXNSZWFjdEtleURvd24oZXZlbnQpIHtcbiAgcmV0dXJuIGV2ZW50ICYmICh0eXBlb2YgZXZlbnQgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKGV2ZW50KSkgPT09ICdvYmplY3QnICYmIGV2ZW50Lm5hdGl2ZUV2ZW50IGluc3RhbmNlb2Ygd2luZG93LktleWJvYXJkRXZlbnQgJiYgZXZlbnQudHlwZSA9PT0gJ2tleWRvd24nO1xufVxuXG4vKipcbiAqIG1ldGhvZFdyYXBwZXJcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MgQWxsIGFyZ3VtZW50cyBuZWNlc3NhcnkgZm9yIHdyYXBwaW5nIG1ldGhvZFxuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MudGFyZ2V0IFRoZSBkZWNvcmF0ZWQgY2xhc3NcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzLmRlc2NyaXB0b3IgTWV0aG9kIGRlc2NyaXB0b3JcbiAqIEBwYXJhbSB7YXJyYXl9IGFyZ3Mua2V5cyBUaGUgYXJyYXkgb2Yga2V5cyBib3VuZCB0byB0aGUgZ2l2ZW4gbWV0aG9kXG4gKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBtZXRob2QgZGVzY3JpcHRvclxuICovXG5mdW5jdGlvbiBtZXRob2RXcmFwcGVyKF9yZWYpIHtcbiAgdmFyIHRhcmdldCA9IF9yZWYudGFyZ2V0LFxuICAgICAgZGVzY3JpcHRvciA9IF9yZWYuZGVzY3JpcHRvcixcbiAgICAgIGtleXMgPSBfcmVmLmtleXM7XG5cblxuICB2YXIgZm4gPSBkZXNjcmlwdG9yLnZhbHVlO1xuXG4gIC8vIGlmIHdlIGhhdmVuJ3QgYWxyZWFkeSBjcmVhdGVkIGEgYmluZGluZyBmb3IgdGhpcyBjbGFzcyAodmlhIGFub3RoZXJcbiAgLy8gZGVjb3JhdGVkIG1ldGhvZCksIHdyYXAgdGhlc2UgbGlmZWN5Y2xlIG1ldGhvZHMuXG4gIGlmICghc3RvcmUuZ2V0QmluZGluZyh0YXJnZXQpKSB7XG4gICAgdmFyIGNvbXBvbmVudERpZE1vdW50ID0gdGFyZ2V0LmNvbXBvbmVudERpZE1vdW50LFxuICAgICAgICBjb21wb25lbnRXaWxsVW5tb3VudCA9IHRhcmdldC5jb21wb25lbnRXaWxsVW5tb3VudDtcblxuXG4gICAgdGFyZ2V0LmNvbXBvbmVudERpZE1vdW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgb25Nb3VudCh0aGlzKTtcbiAgICAgIGlmIChjb21wb25lbnREaWRNb3VudCkgcmV0dXJuIGNvbXBvbmVudERpZE1vdW50LmNhbGwodGhpcyk7XG4gICAgfTtcblxuICAgIHRhcmdldC5jb21wb25lbnRXaWxsVW5tb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIG9uVW5tb3VudCh0aGlzKTtcbiAgICAgIGlmIChjb21wb25lbnRXaWxsVW5tb3VudCkgcmV0dXJuIGNvbXBvbmVudFdpbGxVbm1vdW50LmNhbGwodGhpcyk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIGFkZCB0aGlzIGJpbmRpbmcgb2Yga2V5cyBhbmQgbWV0aG9kIHRvIHRoZSB0YXJnZXQncyBiaW5kaW5nc1xuICBzdG9yZS5zZXRCaW5kaW5nKHsga2V5czoga2V5cywgdGFyZ2V0OiB0YXJnZXQsIGZuOiBmbiB9KTtcblxuICBkZXNjcmlwdG9yLnZhbHVlID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgIH1cblxuICAgIHZhciBtYXliZUV2ZW50ID0gYXJnc1swXTtcblxuICAgIGlmIChfaXNSZWFjdEtleURvd24obWF5YmVFdmVudCkpIHtcbiAgICAgIC8vIHByb3h5IG1ldGhvZCBpbiBvcmRlciB0byB1c2UgQGtleWRvd24gYXMgZmlsdGVyIGZvciBrZXlkb3duIGV2ZW50cyBjb21pbmdcbiAgICAgIC8vIGZyb20gYW4gYWN0dWFsIG9uS2V5RG93biBiaW5kaW5nIChhcyBpZGVudGlmaWVkIGJ5IHJlYWN0J3MgYWRkaXRpb24gb2ZcbiAgICAgIC8vICduYXRpdmVFdmVudCcgKyB0eXBlID09PSAna2V5ZG93bicpXG4gICAgICBpZiAoIW1heWJlRXZlbnQuY3RybEtleSkge1xuICAgICAgICAvLyB3ZSBhbHJlYWR5IHdoaXRlbGlzdCBzaG9ydGN1dHMgd2l0aCBjdHJsIG1vZGlmaWVycyBzbyBpZiB3ZSB3ZXJlIHRvXG4gICAgICAgIC8vIGZpcmUgaXQgYWdhaW4gaGVyZSB0aGUgbWV0aG9kIHdvdWxkIHRyaWdnZXIgdHdpY2UuIHNlZSBodHRwczovL2dpdGh1Yi5jb20vZ2xvcnRoby9yZWFjdC1rZXlkb3duL2lzc3Vlcy8zOFxuICAgICAgICByZXR1cm4gX29uS2V5RG93bihtYXliZUV2ZW50LCB0cnVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFtYXliZUV2ZW50IHx8ICEobWF5YmVFdmVudCBpbnN0YW5jZW9mIHdpbmRvdy5LZXlib2FyZEV2ZW50KSB8fCBtYXliZUV2ZW50LnR5cGUgIT09ICdrZXlkb3duJykge1xuICAgICAgLy8gaWYgb3VyIGZpcnN0IGFyZ3VtZW50IGlzIGEga2V5ZG93biBldmVudCBpdCBpcyBiZWluZyBoYW5kbGVkIGJ5IG91clxuICAgICAgLy8gYmluZGluZyBzeXN0ZW0uIGlmIGl0J3MgYW55dGhpbmcgZWxzZSwganVzdCBwYXNzIHRocm91Z2guXG4gICAgICByZXR1cm4gZm4uY2FsbC5hcHBseShmbiwgW3RoaXNdLmNvbmNhdChhcmdzKSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBkZXNjcmlwdG9yO1xufVxuXG5leHBvcnQgZGVmYXVsdCBtZXRob2RXcmFwcGVyO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvbWV0aG9kX2RlY29yYXRvci5qc1xuLy8gbW9kdWxlIGlkID0gODQzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogQG1vZHVsZSBtZXRob2RXcmFwcGVyU2NvcGVkXG4gKlxuICovXG5pbXBvcnQgbWF0Y2hLZXlzIGZyb20gJy4uL2xpYi9tYXRjaF9rZXlzJztcbmltcG9ydCBwYXJzZUtleXMgZnJvbSAnLi4vbGliL3BhcnNlX2tleXMnO1xuXG4vKipcbiAqIG1ldGhvZFdyYXBwZXJTY29wZWRcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MgQWxsIGFyZ3MgbmVjZXNzYXJ5IGZvciBkZWNvcmF0aW5nIHRoZSBtZXRob2RcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzLnRhcmdldCBUaGUgZGVjb3JhdGVkIG1ldGhvZCdzIGNsYXNzIG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IGFyZ3MuZGVzY3JpcHRvciBUaGUgbWV0aG9kJ3MgZGVzY3JpcHRvciBvYmplY3RcbiAqIEBwYXJhbSB7YXJyYXl9IGFyZ3Mua2V5cyBUaGUga2V5IGNvZGVzIGJvdW5kIHRvIHRoZSBkZWNvcmF0ZWQgbWV0aG9kXG4gKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBtZXRob2QncyBkZXNjcmlwdG9yIG9iamVjdFxuICovXG5mdW5jdGlvbiBtZXRob2RXcmFwcGVyU2NvcGVkKF9yZWYpIHtcbiAgdmFyIHRhcmdldCA9IF9yZWYudGFyZ2V0LFxuICAgICAgZGVzY3JpcHRvciA9IF9yZWYuZGVzY3JpcHRvcixcbiAgICAgIGtleXMgPSBfcmVmLmtleXM7XG4gIHZhciBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzID0gdGFyZ2V0LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM7XG5cbiAgdmFyIGZuID0gZGVzY3JpcHRvci52YWx1ZTtcbiAgaWYgKCFrZXlzKSB7XG4gICAgY29uc29sZS53YXJuKGZuICsgJzoga2V5ZG93blNjb3BlZCByZXF1aXJlcyBvbmUgb3IgbW9yZSBrZXlzJyk7XG4gIH0gZWxzZSB7XG5cbiAgICAvKipcbiAgICAgKiBfc2hvdWxkVHJpZ2dlclxuICAgICAqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoaXNQcm9wcyBFeHN0aW5nIHByb3BzIGZyb20gdGhlIHdyYXBwZWQgY29tcG9uZW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRoaXNQcm9wcy5rZXlkb3duIFRoZSBuYW1lc3BhY2VkIHN0YXRlIGZyb20gdGhlIGhpZ2hlci1vcmRlclxuICAgICAqIGNvbXBvbmVudCAoY2xhc3NfZGVjb3JhdG9yKVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBuZXh0UHJvcHMgVGhlIGluY29taW5nIHByb3BzIGZyb20gdGhlIHdyYXBwZWQgY29tcG9uZW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IG5leHRQcm9wcy5rZXlkb3duIFRoZSBuYW1lc2NhcGVkIHN0YXRlIGZyb20gdGhlIGhpZ2hlci1vcmRlclxuICAgICAqIGNvbXBvbmVudCAoY2xhc3NfZGVjb3JhdG9yKVxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGtleXMgVGhlIGtleXMgYm91bmQgdG8gdGhlIGRlY29yYXRlZCBtZXRob2RcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIGFsbCB0ZXN0cyBoYXZlIHBhc3NlZFxuICAgICAqL1xuICAgIHZhciBfc2hvdWxkVHJpZ2dlciA9IGZ1bmN0aW9uIF9zaG91bGRUcmlnZ2VyKGtleWRvd25UaGlzLCBrZXlkb3duTmV4dCkge1xuICAgICAgaWYgKCEoa2V5ZG93bk5leHQgJiYga2V5ZG93bk5leHQuZXZlbnQgJiYgIWtleWRvd25UaGlzLmV2ZW50KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICByZXR1cm4ga2V5U2V0cy5zb21lKGZ1bmN0aW9uIChrZXlTZXQpIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoS2V5cyh7IGtleVNldDoga2V5U2V0LCBldmVudDoga2V5ZG93bk5leHQuZXZlbnQgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gd3JhcCB0aGUgY29tcG9uZW50J3MgbGlmZWN5Y2xlIG1ldGhvZCB0byBpbnRlcmNlcHQga2V5IGNvZGVzIGNvbWluZyBkb3duXG4gICAgLy8gZnJvbSB0aGUgd3JhcHBlZC9zY29wZWQgY29tcG9uZW50IHVwIHRoZSB2aWV3IGhpZXJhcmNoeS4gaWYgbmV3IGtleWRvd25cbiAgICAvLyBldmVudCBoYXMgYXJyaXZlZCBhbmQgdGhlIGtleSBjb2RlcyBtYXRjaCB3aGF0IHdhcyBzcGVjaWZpZWQgaW4gdGhlXG4gICAgLy8gZGVjb3JhdG9yLCBjYWxsIHRoZSB3cmFwcGVkIG1ldGhvZC5cblxuXG4gICAgdmFyIGtleVNldHMgPSBwYXJzZUtleXMoa2V5cyk7dGFyZ2V0LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgPSBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgICB2YXIga2V5ZG93bk5leHQgPSBuZXh0UHJvcHMua2V5ZG93bjtcbiAgICAgIHZhciBrZXlkb3duVGhpcyA9IHRoaXMucHJvcHMua2V5ZG93bjtcblxuXG4gICAgICBpZiAoX3Nob3VsZFRyaWdnZXIoa2V5ZG93blRoaXMsIGtleWRvd25OZXh0KSkge1xuICAgICAgICByZXR1cm4gZm4uY2FsbCh0aGlzLCBrZXlkb3duTmV4dC5ldmVudCk7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBhcmdzW19rZXkgLSAxXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMpIHJldHVybiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzLmNhbGwuYXBwbHkoY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcywgW3RoaXMsIG5leHRQcm9wc10uY29uY2F0KGFyZ3MpKTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGRlc2NyaXB0b3I7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1ldGhvZFdyYXBwZXJTY29wZWQ7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9tZXRob2RfZGVjb3JhdG9yX3Njb3BlZC5qc1xuLy8gbW9kdWxlIGlkID0gODQ0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHBvbHlmaWxsIGFycmF5LmZyb20gKG1haW5seSBmb3IgSUUpXG5pbXBvcnQgJy4vbGliL2FycmF5LmZyb20nO1xuXG4vLyBAa2V5ZG93biBhbmQgQGtleWRvd25TY29wZWRcbmV4cG9ydCB7IGRlZmF1bHQsIGtleWRvd25TY29wZWQgfSBmcm9tICcuL2RlY29yYXRvcnMnO1xuXG4vLyBzZXRCaW5kaW5nIC0gb25seSB1c2VmdWwgaWYgeW91J3JlIG5vdCBnb2luZyB0byB1c2UgZGVjb3JhdG9yc1xuZXhwb3J0IHsgc2V0QmluZGluZyB9IGZyb20gJy4vc3RvcmUnO1xuXG4vLyBLZXlzIC0gdXNlIHRoaXMgdG8gZmluZCBrZXkgY29kZXMgZm9yIHN0cmluZ3MuIGZvciBleGFtcGxlOiBLZXlzLmosIEtleXMuZW50ZXJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgS2V5cywgQUxMX0tFWVMsIEFMTF9QUklOVEFCTEVfS0VZUyB9IGZyb20gJy4vbGliL2tleXMnO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA4NDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gUHJvZHVjdGlvbiBzdGVwcyBvZiBFQ01BLTI2MiwgRWRpdGlvbiA2LCAyMi4xLjIuMVxuLy8gU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2Zyb21cbmlmICghQXJyYXkuZnJvbSkge1xuICBBcnJheS5mcm9tID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG4gICAgdmFyIGlzQ2FsbGFibGUgPSBmdW5jdGlvbiBpc0NhbGxhYmxlKGZuKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nIHx8IHRvU3RyLmNhbGwoZm4pID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICAgIH07XG4gICAgdmFyIHRvSW50ZWdlciA9IGZ1bmN0aW9uIHRvSW50ZWdlcih2YWx1ZSkge1xuICAgICAgdmFyIG51bWJlciA9IE51bWJlcih2YWx1ZSk7XG4gICAgICBpZiAoaXNOYU4obnVtYmVyKSkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICAgIGlmIChudW1iZXIgPT09IDAgfHwgIWlzRmluaXRlKG51bWJlcikpIHtcbiAgICAgICAgcmV0dXJuIG51bWJlcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiAobnVtYmVyID4gMCA/IDEgOiAtMSkgKiBNYXRoLmZsb29yKE1hdGguYWJzKG51bWJlcikpO1xuICAgIH07XG4gICAgdmFyIG1heFNhZmVJbnRlZ2VyID0gTWF0aC5wb3coMiwgNTMpIC0gMTtcbiAgICB2YXIgdG9MZW5ndGggPSBmdW5jdGlvbiB0b0xlbmd0aCh2YWx1ZSkge1xuICAgICAgdmFyIGxlbiA9IHRvSW50ZWdlcih2YWx1ZSk7XG4gICAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobGVuLCAwKSwgbWF4U2FmZUludGVnZXIpO1xuICAgIH07XG5cbiAgICAvLyBUaGUgbGVuZ3RoIHByb3BlcnR5IG9mIHRoZSBmcm9tIG1ldGhvZCBpcyAxLlxuICAgIHJldHVybiBmdW5jdGlvbiBmcm9tKGFycmF5TGlrZSAvKiwgbWFwRm4sIHRoaXNBcmcgKi8pIHtcbiAgICAgIC8vIDEuIExldCBDIGJlIHRoZSB0aGlzIHZhbHVlLlxuICAgICAgdmFyIEMgPSB0aGlzO1xuXG4gICAgICAvLyAyLiBMZXQgaXRlbXMgYmUgVG9PYmplY3QoYXJyYXlMaWtlKS5cbiAgICAgIHZhciBpdGVtcyA9IE9iamVjdChhcnJheUxpa2UpO1xuXG4gICAgICAvLyAzLiBSZXR1cm5JZkFicnVwdChpdGVtcykuXG4gICAgICBpZiAoYXJyYXlMaWtlID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFycmF5LmZyb20gcmVxdWlyZXMgYW4gYXJyYXktbGlrZSBvYmplY3QgLSBub3QgbnVsbCBvciB1bmRlZmluZWRcIik7XG4gICAgICB9XG5cbiAgICAgIC8vIDQuIElmIG1hcGZuIGlzIHVuZGVmaW5lZCwgdGhlbiBsZXQgbWFwcGluZyBiZSBmYWxzZS5cbiAgICAgIHZhciBtYXBGbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdm9pZCB1bmRlZmluZWQ7XG4gICAgICB2YXIgVDtcbiAgICAgIGlmICh0eXBlb2YgbWFwRm4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIC8vIDUuIGVsc2VcbiAgICAgICAgLy8gNS4gYSBJZiBJc0NhbGxhYmxlKG1hcGZuKSBpcyBmYWxzZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgICAgICBpZiAoIWlzQ2FsbGFibGUobWFwRm4pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJyYXkuZnJvbTogd2hlbiBwcm92aWRlZCwgdGhlIHNlY29uZCBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDUuIGIuIElmIHRoaXNBcmcgd2FzIHN1cHBsaWVkLCBsZXQgVCBiZSB0aGlzQXJnOyBlbHNlIGxldCBUIGJlIHVuZGVmaW5lZC5cbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgVCA9IGFyZ3VtZW50c1syXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyAxMC4gTGV0IGxlblZhbHVlIGJlIEdldChpdGVtcywgXCJsZW5ndGhcIikuXG4gICAgICAvLyAxMS4gTGV0IGxlbiBiZSBUb0xlbmd0aChsZW5WYWx1ZSkuXG4gICAgICB2YXIgbGVuID0gdG9MZW5ndGgoaXRlbXMubGVuZ3RoKTtcblxuICAgICAgLy8gMTMuIElmIElzQ29uc3RydWN0b3IoQykgaXMgdHJ1ZSwgdGhlblxuICAgICAgLy8gMTMuIGEuIExldCBBIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tDb25zdHJ1Y3RdXSBpbnRlcm5hbCBtZXRob2QgXG4gICAgICAvLyBvZiBDIHdpdGggYW4gYXJndW1lbnQgbGlzdCBjb250YWluaW5nIHRoZSBzaW5nbGUgaXRlbSBsZW4uXG4gICAgICAvLyAxNC4gYS4gRWxzZSwgTGV0IEEgYmUgQXJyYXlDcmVhdGUobGVuKS5cbiAgICAgIHZhciBBID0gaXNDYWxsYWJsZShDKSA/IE9iamVjdChuZXcgQyhsZW4pKSA6IG5ldyBBcnJheShsZW4pO1xuXG4gICAgICAvLyAxNi4gTGV0IGsgYmUgMC5cbiAgICAgIHZhciBrID0gMDtcbiAgICAgIC8vIDE3LiBSZXBlYXQsIHdoaWxlIGsgPCBsZW7igKYgKGFsc28gc3RlcHMgYSAtIGgpXG4gICAgICB2YXIga1ZhbHVlO1xuICAgICAgd2hpbGUgKGsgPCBsZW4pIHtcbiAgICAgICAga1ZhbHVlID0gaXRlbXNba107XG4gICAgICAgIGlmIChtYXBGbikge1xuICAgICAgICAgIEFba10gPSB0eXBlb2YgVCA9PT0gJ3VuZGVmaW5lZCcgPyBtYXBGbihrVmFsdWUsIGspIDogbWFwRm4uY2FsbChULCBrVmFsdWUsIGspO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIEFba10gPSBrVmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgayArPSAxO1xuICAgICAgfVxuICAgICAgLy8gMTguIExldCBwdXRTdGF0dXMgYmUgUHV0KEEsIFwibGVuZ3RoXCIsIGxlbiwgdHJ1ZSkuXG4gICAgICBBLmxlbmd0aCA9IGxlbjtcbiAgICAgIC8vIDIwLiBSZXR1cm4gQS5cbiAgICAgIHJldHVybiBBO1xuICAgIH07XG4gIH0oKTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvYXJyYXkuZnJvbS5qc1xuLy8gbW9kdWxlIGlkID0gODQ2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogQG1vZHVsZSBkb21IZWxwZXJzXG4gKlxuICovXG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcblxudmFyIGZvY3VzYWJsZVNlbGVjdG9yID0gJ2FbaHJlZl0sIGJ1dHRvbiwgaW5wdXQsIG9iamVjdCwgc2VsZWN0LCB0ZXh0YXJlYSwgW3RhYmluZGV4XSc7XG5cbi8qKlxuICogYmluZEZvY3VzYWJsZXM6IEZpbmQgYW55IGZvY3VzYWJsZSBjaGlsZCBlbGVtZW50cyBvZiB0aGUgY29tcG9uZW50IGluc3RhbmNlIGFuZFxuICogYWRkIGFuIG9uRm9jdXMgaGFuZGxlciB0byBmb2N1cyBvdXIga2V5ZG93biBoYW5kbGVycyBvbiB0aGUgcGFyZW50IGNvbXBvbmVudFxuICogd2hlbiB1c2VyIGtleXMgYXBwbGllcyBmb2N1cyB0byB0aGUgZWxlbWVudC5cbiAqXG4gKiBOT1RFOiBPbmUgbGltaXRhdGlvbiBvZiB0aGlzIHJpZ2h0IG5vdyBpcyB0aGF0IGlmIHlvdSB0YWIgb3V0IG9mIHRoZVxuICogY29tcG9uZW50LCBfZm9jdXNlZEluc3RhbmNlIHdpbGwgc3RpbGwgYmUgc2V0IHVudGlsIG5leHQgY2xpY2sgb3IgbW91bnQgb3JcbiAqIGNvbnRyb2xsZWQgZm9jdXMuXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSBpbnN0YW5jZSBUaGUga2V5LWJvdW5kIGNvbXBvbmVudCBpbnN0YW5jZVxuICogQHBhcmFtIHtjYWxsYmFja30gYWN0aXZhdGVPbkZvY3VzIFRoZSBmbiB0byBmaXJlIHdoZW4gZWxlbWVudCBpcyBmb2N1c2VkXG4gKi9cbmZ1bmN0aW9uIGJpbmRGb2N1c2FibGVzKGluc3RhbmNlLCBhY3RpdmF0ZU9uRm9jdXMpIHtcbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIG5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZShpbnN0YW5jZSk7XG4gICAgICBpZiAobm9kZSkge1xuICAgICAgICB2YXIgZm9jdXNhYmxlcyA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChmb2N1c2FibGVTZWxlY3Rvcik7XG4gICAgICAgIGlmIChmb2N1c2FibGVzLmxlbmd0aCkge1xuICAgICAgICAgIHZhciBvbkZvY3VzID0gZnVuY3Rpb24gb25Gb2N1cyhlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgb25Gb2N1c1ByZXYgPSBlbGVtZW50Lm9uZm9jdXM7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgIGFjdGl2YXRlT25Gb2N1cyhpbnN0YW5jZSk7XG4gICAgICAgICAgICAgIGlmIChvbkZvY3VzUHJldikgb25Gb2N1c1ByZXYuY2FsbChlbGVtZW50LCBldmVudCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH07XG4gICAgICAgICAgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZm9jdXNhYmxlcykuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQub25mb2N1cyA9IG9uRm9jdXMoZWxlbWVudCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gbm9vcCwgbW9zdGx5IHN1cHByZXNzaW5nIGVycm9yIGhlcmUgaHR0cHM6Ly9naXRodWIuY29tL2dsb3J0aG8vcmVhY3Qta2V5ZG93bi9pc3N1ZXMvNzZcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBmaW5kQ29udGFpbmVyTm9kZXM6IENhbGxlZCBieSBvdXIgY2xpY2sgaGFuZGxlciB0byBmaW5kIGluc3RhbmNlcyB3aXRoIG5vZGVzXG4gKiB0aGF0IGFyZSBlcXVhbCB0byBvciB0aGF0IGNvbnRhaW4gdGhlIGNsaWNrIHRhcmdldC4gQW55IHRoYXQgcGFzcyB0aGlzIHRlc3RcbiAqIHdpbGwgYmUgcmVjaXBpZW50cyBvZiB0aGUgbmV4dCBrZXlkb3duIGV2ZW50LlxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IFRoZSBjbGljayBldmVudC50YXJnZXQgRE9NIGVsZW1lbnRcbiAqIEByZXR1cm4ge2Z1bmN0aW9ufSBSZWR1Y2VyIGZ1bmN0aW9uXG4gKi9cbmZ1bmN0aW9uIGZpbmRDb250YWluZXJOb2Rlcyh0YXJnZXQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChtZW1vLCBpbnN0YW5jZSkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKGluc3RhbmNlKTtcbiAgICAgIGlmIChub2RlICYmIChub2RlID09PSB0YXJnZXQgfHwgbm9kZS5jb250YWlucyh0YXJnZXQpKSkge1xuICAgICAgICBtZW1vLnB1c2goeyBpbnN0YW5jZTogaW5zdGFuY2UsIG5vZGU6IG5vZGUgfSk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBzb3J0QnlET01Qb3NpdGlvbjogQ2FsbGVkIGJ5IG91ciBjbGljayBoYW5kbGVyIHRvIHNvcnQgYSBsaXN0IG9mIGluc3RhbmNlc1xuICogYWNjb3JkaW5nIHRvIGxlYXN0IC0+IG1vc3QgbmVzdGVkLiBUaGlzIGlzIHNvIHRoYXQgaWYgbXVsdGlwbGUga2V5Ym91bmRcbiAqIGluc3RhbmNlcyBoYXZlIG5vZGVzIHRoYXQgYXJlIGFuY2VzdG9ycyBvZiB0aGUgY2xpY2sgdGFyZ2V0LCB0aGV5IHdpbGwgYmVcbiAqIHNvcnRlZCB0byBsZXQgdGhlIGluc3RhbmNlIGNsb3Nlc3QgdG8gdGhlIGNsaWNrIHRhcmdldCBnZXQgZmlyc3QgZGlicyBvbiB0aGVcbiAqIG5leHQga2V5IGRvd24gZXZlbnQuXG4gKi9cbmZ1bmN0aW9uIHNvcnRCeURPTVBvc2l0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGEubm9kZS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihiLm5vZGUpID09PSAxMCA/IDEgOiAtMTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgeyBiaW5kRm9jdXNhYmxlczogYmluZEZvY3VzYWJsZXMsIGZpbmRDb250YWluZXJOb2RlczogZmluZENvbnRhaW5lck5vZGVzLCBzb3J0QnlET01Qb3NpdGlvbjogc29ydEJ5RE9NUG9zaXRpb24gfTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvZG9tX2hlbHBlcnMuanNcbi8vIG1vZHVsZSBpZCA9IDg0N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEBtb2R1bGUgTGlzdGVuZXJzXG4gKlxuICovXG5cbi8vIGZsYWcgZm9yIHdoZXRoZXIgY2xpY2sgbGlzdGVuZXIgaGFzIGJlZW4gYm91bmQgdG8gZG9jdW1lbnRcbnZhciBfY2xpY2tzQm91bmQgPSBmYWxzZTtcblxuLy8gZmxhZyBmb3Igd2hldGhlciBrZXlkb3duIGxpc3RlbmVyIGhhcyBiZWVuIGJvdW5kIHRvIGRvY3VtZW50XG52YXIgX2tleXNCb3VuZCA9IGZhbHNlO1xuXG52YXIgTGlzdGVuZXJzID0ge1xuICAvKipcbiAgICogX2JpbmRLZXlzXG4gICAqXG4gICAqIEBhY2Nlc3MgcHVibGljXG4gICAqL1xuICBiaW5kS2V5czogZnVuY3Rpb24gYmluZEtleXMoY2FsbGJhY2spIHtcbiAgICBpZiAoIV9rZXlzQm91bmQpIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBjYWxsYmFjayk7XG4gICAgICBfa2V5c0JvdW5kID0gdHJ1ZTtcbiAgICB9XG4gIH0sXG5cblxuICAvKipcbiAgICogdW5iaW5kS2V5c1xuICAgKlxuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKi9cbiAgdW5iaW5kS2V5czogZnVuY3Rpb24gdW5iaW5kS2V5cyhjYWxsYmFjaykge1xuICAgIGlmIChfa2V5c0JvdW5kKSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY2FsbGJhY2spO1xuICAgICAgX2tleXNCb3VuZCA9IGZhbHNlO1xuICAgIH1cbiAgfSxcblxuXG4gIC8qKlxuICAgKiBiaW5kQ2xpY2tzXG4gICAqXG4gICAqIEBhY2Nlc3MgcHVibGljXG4gICAqL1xuICBiaW5kQ2xpY2tzOiBmdW5jdGlvbiBiaW5kQ2xpY2tzKGNhbGxiYWNrKSB7XG4gICAgaWYgKCFfY2xpY2tzQm91bmQpIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FsbGJhY2ssIHRydWUpO1xuICAgICAgX2NsaWNrc0JvdW5kID0gdHJ1ZTtcbiAgICB9XG4gIH0sXG5cblxuICAvKipcbiAgICogdW5iaW5kQ2xpY2tzXG4gICAqXG4gICAqIEBhY2Nlc3MgcHVibGljXG4gICAqL1xuICB1bmJpbmRDbGlja3M6IGZ1bmN0aW9uIHVuYmluZENsaWNrcyhjYWxsYmFjaykge1xuICAgIGlmIChfY2xpY2tzQm91bmQpIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FsbGJhY2ssIHRydWUpO1xuICAgICAgX2NsaWNrc0JvdW5kID0gZmFsc2U7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBMaXN0ZW5lcnM7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL2xpc3RlbmVycy5qc1xuLy8gbW9kdWxlIGlkID0gODQ4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIENvdW50ZXIgYmVpbmcgaW5jcmVtZW50ZWQuIEpTIGlzIHNpbmdsZS10aHJlYWRlZCwgc28gaXQnbGwgSnVzdCBXb3Jr4oSiLlxudmFyIF9fY291bnRlciA9IDE7XG5cbi8qKlxuICogUmV0dXJucyBhIHByb2Nlc3Mtd2lkZSB1bmlxdWUgaWRlbnRpZmllci5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdXVpZCgpIHtcbiAgcmV0dXJuIFwidWlkLVwiICsgX19jb3VudGVyKys7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL3V1aWQuanNcbi8vIG1vZHVsZSBpZCA9IDg0OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvL1x0IyBQYXJzZXIgUnVsZXNcbi8vXHRSdWxlcyBjYW4gYmUgYXMgc2ltcGxlIGFzIGEgc3RyaW5nIGBLZXl3b3JkYCBvciBhIGNvbXBsZXggc2VxdWVuY2Ugb2YgKG5lc3RlZCkgcnVsZXMuXG4vL1xuLy9cdFBhcnNlIGEgcnVsZSB3aXRoIGBydWxlLnBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCwgZW5kKWAsIHRoaXMgd2lsbCBlaXRoZXI6XG4vL1x0XHQtIHJldHVybiBgdW5kZWZpbmVkYCBpZiB0aGUgcnVsZSBkb2Vzbid0IG1hdGNoIHRoZSBoZWFkIG9mIHRoZSB0b2tlbnMsIG9yXG4vL1x0XHQtIHJldHVybiBhIENMT05FIG9mIHRoZSBtYXRjaGVkIHJ1bGUgd2l0aCBhdCBsZWFzdCB0aGUgZm9sbG93aW5nOlxuLy9cdFx0XHQtIGBtYXRjaGVkYFx0XHRSZXN1bHRzIG9mIHlvdXIgcGFyc2UuXG4vL1x0XHRcdC0gYG5leHRTdGFydGBcdFBsYWNlIHdoZXJlIG5leHQgbWF0Y2ggc2hvdWxkIHN0YXJ0IChlZzogb25lIGJleW9uZCB3aGF0IHlvdSBtYXRjaGVkKS5cbi8vXG4vL1x0VGhlIGNsb25lIHJldHVybmVkIGFib3ZlIGNhbiBiZSBtYW5pcHVsYXRlZCB3aXRoXG4vL1x0XHQtIGBydWxlLnRvU291cmNlKClgXHQgIFJldHVybiBqYXZhc2NyaXB0IHNvdXJjZSB0byBpbnRlcnByZXQgdGhlIHJ1bGUuXG4vL1x0XHQtIGBydWxlLnRvU3ludGF4KClgXHQgIFJldHVybiBydWxlU3ludGF4IGZvciB0aGUgcnVsZSAobW9zdGx5IGZvciBkZWJ1Z2dpbmcpXG4vLyAgICAtXG4vL1xuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi9QYXJzZXIuanNcIjtcbmltcG9ydCBUb2tlbml6ZXIgZnJvbSBcIi4vVG9rZW5pemVyLmpzXCI7XG5cbmltcG9ydCBnbG9iYWwgZnJvbSBcIi4vdXRpbHMvZ2xvYmFsXCI7XG5pbXBvcnQgeyBpc1doaXRlc3BhY2UgfSBmcm9tIFwiLi91dGlscy9zdHJpbmdcIjtcblxuXG4vLyBBYnN0cmFjdCBSdWxlIGNsYXNzLlxuLy8gVE9ET0NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJ1bGUge1xuXHRjb25zdHJ1Y3RvciguLi5wcm9wcykge1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywgLi4ucHJvcHMpO1xuXHR9XG5cblx0Ly8gQ2xvbmUgdGhpcyBydWxlIGFuZCBhZGQgYW55IGBwcm9wc2AgcGFzc2VkIGluLlxuXHRjbG9uZShwcm9wcykge1xuXHRcdHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzLCBwcm9wcyk7XG5cdH1cblxuLy9cbi8vXHRQYXJzaW5nIHByaW1pdGl2ZXMgLS0geW91IE1VU1QgaW1wbGVtZW50IHRoZXNlIGluIHlvdXIgc3ViY2xhc3NlcyFcbi8vXG5cblx0Ly8gQXR0ZW1wdCB0byBtYXRjaCB0aGlzIHJ1bGUgYmV0d2VlbiBgc3RhcnRgIGFuZCBgZW5kYCBvZiBgdG9rZW5zYC5cblx0Ly8gUmV0dXJucyByZXN1bHRzIG9mIHRoZSBwYXJzZSBvciBgdW5kZWZpbmVkYC5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvLyBUZXN0IHRvIHNlZSBpZiBiaXRzIG9mIG91ciBydWxlIGFyZSBmb3VuZCBBTllXSEVSRSBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgIGluIHRoZSBgdG9rZW5zYC5cblx0Ly8gVGhpcyBpcyB1c2VkIGJ5IGNvbXBsaWNhdGVkIChlZzogbGVmdCByZWN1cnNpdmUpIHJ1bGVzIHRvIGV4aXQgcXVpY2tseSBpZiB0aGVyZSdzIG5vIGNoYW5jZS5cblx0Ly8gUmV0dXJuczpcblx0Ly9cdC0gYHRydWVgIGlmIHRoZSBydWxlIE1JR0hUIGJlIG1hdGNoZWQuXG5cdC8vXHQtIGBmYWxzZWAgaWYgdGhlcmUgaXMgTk8gV0FZIHRoZSBydWxlIGNhbiBiZSBtYXRjaGVkLlxuXHQvL1x0LSBgdW5kZWZpbmVkYCBpZiBub3QgZGV0ZXJtaW5zdGljIChlZzogbm8gd2F5IHRvIHRlbGwgcXVpY2tseSkuXG5cdHRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG4vL1xuLy8gIyMgb3V0cHV0IGFzIHNvdXJjZVxuLy9cblxuXHQvLyBPdXRwdXQgdmFsdWUgZm9yIHRoaXMgSU5TVEFOVElBVEVEIHJ1bGUgYXMgc291cmNlLlxuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkO1xuXHR9XG5cblxuLy9cbi8vICMjIG91dHB1dCBhcyBzdHJ1Y3R1cmU6XG4vL1xuXHR0b1N0cnVjdHVyZSgpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cbi8vXG4vLyAjIyByZWZsZWN0aW9uXG4vL1xuXG59XG5cblxuLy8gQWJzdHJhY3QgcnVsZSBmb3Igb25lIG9yIG1vcmUgc2VxdWVudGlhbCBsaXRlcmFsIHZhbHVlcyB0byBtYXRjaC5cbi8vIGBydWxlLmxpdGVyYWxzYCBpcyB0aGUgbGl0ZXJhbCBzdHJpbmcgb3IgYXJyYXkgb2YgbGl0ZXJhbCBzdHJpbmdzIHRvIG1hdGNoLlxuLy8gYHJ1bGUubGl0ZXJhbFNlcGFyYXRvcmAgaXMgdGhlIHN0cmluZyB0byBwdXQgYmV0d2VlbiBtdWx0aXBsZSBsaXRlcmFscyB3aGVuIGpvaW5pbmcuXG4vL1xuLy8gQWZ0ZXIgcGFyc2luZ1xuLy8gIGBydWxlLm1hdGNoZWRgIHdpbGwgYmUgdGhlIHN0cmluZyB3aGljaCB3YXMgbWF0Y2hlZFxuLy8gIGBydWxlLm5leHRTdGFydGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IHN0YXJ0IHRva2VuXG5SdWxlLkxpdGVyYWxzID0gY2xhc3MgbGl0ZXJhbHMgZXh0ZW5kcyBSdWxlIHtcblx0Y29uc3RydWN0b3IoLi4ucHJvcHMpIHtcblx0XHRzdXBlciguLi5wcm9wcyk7XG5cdFx0Ly8gY29lcmNlIHRvIGFuIGFycmF5IChhIGJpdCBzbG93ZXIgYnV0IGNsZWFuZXIpLlxuXHRcdGlmICghQXJyYXkuaXNBcnJheSh0aGlzLmxpdGVyYWxzKSkgdGhpcy5saXRlcmFscyA9IFt0aGlzLmxpdGVyYWxzXTtcblx0fVxuXG5cdC8vIEF0dGVtcHQgdG8gbWF0Y2ggdGhpcyBydWxlIGluIHRoZSBgdG9rZW5zYC5cblx0Ly8gUmV0dXJucyByZXN1bHRzIG9mIHRoZSBwYXJzZSBvciBgdW5kZWZpbmVkYC5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGlmICghdGhpcy5tYXRjaGVzU3RhcnRpbmdBdCh0b2tlbnMsIHN0YXJ0LCBlbmQpKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQ6IHRoaXMubGl0ZXJhbHMuam9pbih0aGlzLmxpdGVyYWxTZXBhcmF0b3IpLFxuXHRcdFx0bmV4dFN0YXJ0OiBzdGFydCArIHRoaXMubGl0ZXJhbHMubGVuZ3RoXG5cdFx0fSk7XG5cdH1cblxuXHQvLyBEb2VzIHRoaXMgbWF0Y2ggYXBwZWFyIEFOWVdIRVJFIGluIHRoZSB0b2tlbnM/XG5cdHRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kID0gdG9rZW5zLmxlbmd0aCkge1xuXHQgIGxldCBmaXJzdCA9IHRoaXMubGl0ZXJhbHNbMF07XG5cdCAgZm9yICh2YXIgaW5kZXggPSBzdGFydDsgaW5kZXggPCBlbmQ7IGluZGV4KyspIHtcblx0ICAgIGlmICh0b2tlbnNbaW5kZXhdICE9PSBmaXJzdCkgY29udGludWU7XG5cdCAgICBpZiAodGhpcy5tYXRjaGVzU3RhcnRpbmdBdCh0b2tlbnMsIGluZGV4LCBlbmQpKSByZXR1cm4gdHJ1ZTtcblx0ICB9XG5cdCAgcmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gTWF0Y2ggb3VyIGBsaXRlcmFsc2AgYmV0d2VlbiBgc3RhcnRgIGFuZCBgZW5kYCBvZiB0b2tlbnMuXG5cdG1hdGNoZXNTdGFydGluZ0F0KHRva2Vucywgc3RhcnQgPSAwLCBlbmQgPSB0b2tlbnMubGVuZ3RoKSB7XG5cdCAgaWYgKHRoaXMubGl0ZXJhbHMubGVuZ3RoID09PSAxKSByZXR1cm4gdG9rZW5zW3N0YXJ0XSA9PT0gdGhpcy5saXRlcmFsc1swXTtcbiAgICByZXR1cm4gdGhpcy5saXRlcmFscy5ldmVyeSgobGl0ZXJhbCwgaSkgPT4gKHN0YXJ0ICsgaSA8IGVuZCkgJiYgKGxpdGVyYWwgPT09IHRva2Vuc1tzdGFydCArIGldKSk7XG5cdH1cblxuICB0b1NvdXJjZSgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaGVkO1xuICB9XG5cblx0dG9TeW50YXgoKSB7XG5cdFx0cmV0dXJuIGAke3RoaXMubGl0ZXJhbHMuam9pbih0aGlzLmxpdGVyYWxTZXBhcmF0b3IgfHwgXCJcIil9JHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcblx0fVxufVxuXG4vLyBPbmUgb3IgbW9yZSBsaXRlcmFsIHN5bWJvbHM6IGA8YCwgYCVgIGV0Yy5cbi8vIFN5bWJvbHMgam9pbiBXSVRIT1VUIHNwYWNlcy5cblJ1bGUuU3ltYm9scyA9IGNsYXNzIHN5bWJvbHMgZXh0ZW5kcyBSdWxlLkxpdGVyYWxzIHt9XG5cblxuLy8gT25lIG9yIG1vcmUgbGl0ZXJhbCBrZXl3b3Jkcy5cbi8vIEtleXdvcmRzIGpvaW4gV0lUSCBzcGFjZXMuXG5SdWxlLktleXdvcmRzID0gY2xhc3Mga2V5d29yZHMgZXh0ZW5kcyBSdWxlLkxpdGVyYWxzIHt9XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoUnVsZS5LZXl3b3Jkcy5wcm90b3R5cGUsIFwibGl0ZXJhbFNlcGFyYXRvclwiLCB7IHZhbHVlOiBcIiBcIiB9KTtcblxuXG5cbi8vIFJlZ2V4IHBhdHRlcm4gdG8gbWF0Y2ggYSBTSU5HTEUgdG9rZW4uXG4vLyBgcnVsZS5wYXR0ZXJuYCBpcyB0aGUgcmVndWxhciBleHByZXNzaW9uIHRvIG1hdGNoLlxuLy8gICAgTm90ZSB0aGF0IHlvdSBNVVNUIHN0YXJ0IHlvdXIgcGF0dGVybiB3aXRoIGBeYCBhbmQgZW5kIHdpdGggYCRgIHRvIG1ha2Ugc3VyZSBpdCBtYXRjaGVzIHRoZSBlbnRpcmUgdG9rZW4uXG4vLyAgICBOb3RlIHRoYXQgdGhpcyBjYW4gb25seSBtYXRjaCBhIHNpbmdsZSB0b2tlbiFcbi8vIGBydWxlLmJsYWNrbGlzdGAgaXMgYSBtYXAgb2YgYHsga2V5OiB0cnVlIH1gIGZvciBzdHJpbmdzIHdoaWNoIHdpbGwgTk9UIGJlIGFjY2VwdGVkLlxuLy9cbi8vIEFmdGVyIHBhcnNpbmdcbi8vICBgcnVsZS5tYXRjaGVkYCB3aWxsIGJlIHRoZSBzdHJpbmcgd2hpY2ggd2FzIG1hdGNoZWQuXG4vLyAgYHJ1bGUubmV4dFN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RhcnQgdG9rZW4uXG5SdWxlLlBhdHRlcm4gPSBjbGFzcyBwYXR0ZXJuIGV4dGVuZHMgUnVsZSB7XG5cdC8vIEF0dGVtcHQgdG8gbWF0Y2ggdGhpcyBwYXR0ZXJuIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHRva2Vucy5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG5cdFx0aWYgKHR5cGVvZiB0b2tlbiAhPT0gXCJzdHJpbmdcIikgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBtYXRjaCA9IHRva2VuLm1hdGNoKHRoaXMucGF0dGVybik7XG5cdFx0aWYgKCFtYXRjaCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIGJhaWwgaWYgcHJlc2VudCBpbiBibGFja2xpc3Rcblx0XHRsZXQgbWF0Y2hlZCA9IG1hdGNoWzBdO1xuXHRcdGlmICh0aGlzLmJsYWNrbGlzdCAmJiB0aGlzLmJsYWNrbGlzdFttYXRjaGVkXSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQsXG5cdFx0XHRuZXh0U3RhcnQ6IHN0YXJ0ICsgMVxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gVGVzdCB0byBzZWUgaWYgYW55IG9mIG91ciBwYXR0ZXJuIGlzIGZvdW5kIEFOWVdIRVJFIGluIHRoZSB0b2tlbnMuXG5cdHRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0cmV0dXJuIHRva2Vucy5zbGljZShzdGFydCwgZW5kKS5zb21lKHRva2VuID0+IHR5cGVvZiB0b2tlbiA9PT0gXCJzdHJpbmdcIiAmJiBwYXR0ZXJuLnRlc3QodG9rZW4pKTtcblx0fVxuXG5cdHRvU3ludGF4KCkge1xuXHRcdHJldHVybiB0aGlzLnBhdHRlcm4uc291cmNlO1xuXHR9XG59XG5cblxuLy8gU3VicnVsZSAtLSBuYW1lIG9mIGFub3RoZXIgcnVsZSB0byBiZSBjYWxsZWQuXG4vLyBgcnVsZS5zdWJydWxlYCBpcyB0aGUgbmFtZSBvZiB0aGUgcnVsZSBpbiBgcGFyc2VyLnJ1bGVzYC5cbi8vXG4vLyBBZnRlciBwYXJzaW5nXG4vLyAgd2UnbGwgcmV0dXJuIHRoZSBhY3R1YWwgcnVsZSB0aGF0IHdhcyBtYXRjaGVkIChyYXRoZXIgdGhhbiBhIGNsb25lIG9mIHRoaXMgcnVsZSlcblJ1bGUuU3VicnVsZSA9IGNsYXNzIHN1YnJ1bGUgZXh0ZW5kcyBSdWxlIHtcblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGxldCBtYXRjaGVkUnVsZSA9IHBhcnNlci5wYXJzZU5hbWVkUnVsZSh0aGlzLnN1YnJ1bGUsIHRva2Vucywgc3RhcnQsIGVuZCwgc3RhY2ssIGBwYXJzZSBzdWJydWxlICcke3RoaXMucnVsZX0nYCk7XG5cdFx0aWYgKCFtYXRjaGVkUnVsZSkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRpZiAodGhpcy5hcmd1bWVudCkgbWF0Y2hlZFJ1bGUuYXJndW1lbnQgPSB0aGlzLmFyZ3VtZW50O1xuXHRcdHJldHVybiBtYXRjaGVkUnVsZTtcblx0fVxuXG5cdC8vIEFzayB0aGUgc3VicnVsZSB0byBmaWd1cmUgb3V0IGlmIGEgbWF0Y2ggaXMgcG9zc2libGUuXG5cdHRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0cmV0dXJuIHBhcnNlci50ZXN0KHRoaXMuc3VicnVsZSwgdG9rZW5zLCBzdGFydCwgZW5kKTtcblx0fVxuXG5cdHRvU3ludGF4KCkge1xuXHRcdHJldHVybiBgeyR7dGhpcy5hcmd1bWVudCA/IHRoaXMuYXJndW1lbnQrXCI6XCIgOiBcIlwifSR7dGhpcy5zdWJydWxlfX0ke3RoaXMub3B0aW9uYWwgPyAnPycgOiAnJ31gO1xuXHR9XG59XG5cblxuLy8gU2VxdWVuY2Ugb2YgcnVsZXMgdG8gbWF0Y2guXG4vLyAgYHJ1bGUucnVsZXNgIGlzIHRoZSBhcnJheSBvZiBydWxlcyB0byBtYXRjaC5cbi8vICBgcnVsZS5sZWZ0UmVjdXJzaXZlYCBzaG91bGQgYmUgYHRydWVgIGlmIHRoZSBmaXJzdCBub24tb3B0aW9uYWwgcnVsZSBpbiBvdXIgYHJ1bGVzYFxuLy8gICAgbWF5IGVuZCB1cCBjYWxsaW5nIHVzIGFnYWluLiAgSW4gdGhpcyBjYXNlLCB5b3Ugc2hvdWxkIHByb3ZpZGUgYHJ1bGUudGVzdFJ1bGVgLlxuLy9cbi8vIEFmdGVyIHBhcnNpbmdcbi8vICBgcnVsZS5tYXRjaGVkYCB3aWxsIGJlIHRoZSBhcnJheSBvZiBydWxlcyB3aGljaCB3ZXJlIG1hdGNoZWQuXG4vLyAgYHJ1bGUubmV4dFN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RhcnQgdG9rZW4uXG5SdWxlLlNlcXVlbmNlID0gY2xhc3Mgc2VxdWVuY2UgZXh0ZW5kcyBSdWxlIHtcblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdC8vIElmIHdlIGhhdmUgYSBgdGVzdFJ1bGVgIGRlZmluZWRcblx0XHRpZiAodGhpcy50ZXN0UnVsZSkge1xuXHRcdFx0Ly8gRm9yZ2V0IGl0IGlmIHRoZXJlIGlzIE5PIFdBWSB0aGUgcnVsZSBjb3VsZCBiZSBtYXRjaGVkLlxuXHRcdFx0aWYgKHBhcnNlci50ZXN0KHRoaXMudGVzdFJ1bGUsIHRva2Vucywgc3RhcnQpID09PSBmYWxzZSkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHQvLyBJZiB3ZSdyZSBhIGxlZnRSZWN1cnNpdmUgc2VxdWVuY2UuLi5cblx0XHRpZiAodGhpcy5sZWZ0UmVjdXJzaXZlKSB7XG5cdFx0XHQvLyBJZiB0aGUgc3RhY2sgYWxyZWFkeSBjb250YWlucyB0aGlzIHJ1bGUsIGZvcmdldCBpdC5cblx0XHRcdGlmIChzdGFjayAmJiBzdGFjay5pbmNsdWRlcyh0aGlzKSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdFx0Ly8gQ2xvbmUgc3RhY2sgYW5kIGFkZCB0aGlzIHJ1bGUgZm9yIHJlY3Vyc2lvbi4uLlxuXHRcdFx0c3RhY2sgPSBzdGFjayA/IHN0YWNrLmNvbmNhdCgpIDogW107XG5cdFx0XHRzdGFjay5wdXNoKHRoaXMpO1xuXG5cdFx0XHQvLyBUT0RPOiBXZSBjb3VsZCBkaXN0aW5ndWlzaCBiZXR3ZWVuIHByb2R1Y3RpdmUgYW5kIHVucHJvZHVjdGl2ZSBydWxlc1xuXHRcdFx0Ly9cdFx0IGJ5IGNoZWNraW5nIG9ubHkgcnVsZXMgd2hpY2ggb2NjdXIgYXQgdGhlIHNhbWUgYHN0YXJ0YC4uLlxuXHRcdFx0Ly9cdFx0IFRoaXMgd291bGQgcHJvYmFibHkgYWxsb3cgbW9yZSBpbnRlcmVzdGluZyB0aGluZ3MsIGJ1dCBpdCdzIG11Y2ggbXVjaCBzbG93ZXIuXG5cdFx0fVxuXG5cdFx0bGV0IG1hdGNoZWQgPSBbXTtcblx0XHRsZXQgbmV4dFN0YXJ0ID0gc3RhcnQ7XG5cdFx0bGV0IGluZGV4ID0gMCwgcnVsZSA9IHVuZGVmaW5lZDtcblx0XHR3aGlsZSAocnVsZSA9IHRoaXMucnVsZXNbaW5kZXgrK10pIHtcblx0XHRcdGxldCBtYXRjaCA9IHJ1bGUucGFyc2UocGFyc2VyLCB0b2tlbnMsIG5leHRTdGFydCwgZW5kLCBzdGFjayk7XG5cdFx0XHRpZiAoIW1hdGNoICYmICFydWxlLm9wdGlvbmFsKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0aWYgKG1hdGNoKSB7XG5cdFx0XHRcdG1hdGNoZWQucHVzaChtYXRjaCk7XG5cdFx0XHRcdG5leHRTdGFydCA9IG1hdGNoLm5leHRTdGFydDtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gaWYgd2UgZ2V0IGhlcmUsIHdlIG1hdGNoZWQgYWxsIHRoZSBydWxlcyFcblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkLFxuXHRcdFx0bmV4dFN0YXJ0XG5cdFx0fSk7XG5cdH1cblxuXG4vL1RPRE9DXG5cdC8vIFwiZ2F0aGVyXCIgYXJndW1lbnRzIGluIHByZXBhcmF0aW9uIHRvIGNhbGwgYHRvU291cmNlKClgXG5cdC8vIE9ubHkgY2FsbGFibGUgYWZ0ZXIgcGFyc2UgaXMgY29tcGxldGVkLlxuXHQvLyBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHByb3BlcnRpZXMgZnJvbSB0aGUgYG1hdGNoZWRgIGFycmF5IGluZGV4ZWQgYnkgb25lIG9mIHRoZSBmb2xsb3dpbmc6XG5cdC8vXHRcdC0gYG1hdGNoLmFyZ3VtZW50YDpcdFx0YXJndW1lbnQgc2V0IHdoZW4gcnVsZSB3YXMgZGVjbGFyZWQsIGVnOiBge3ZhbHVlOmxpdGVyYWx9YCA9PiBgdmFsdWVgXG5cdC8vXHRcdC0gYG1hdGNoLmdyb3VwYDpcdFx0ICBuYW1lIG9mIGdyb3VwIHJ1bGUgd2FzIGFkZGVkIHRvXG5cdC8vICAgIC0gYG1hdGNoLm5hbWVgOiAgICAgICBuYW1lIG9mIHRoZSBydWxlIGlmIHNldCB1cCBieSBwYXJzZVJ1bGVcblx0Z2V0IHJlc3VsdHMoKSB7XG5cdFx0aWYgKCF0aGlzLm1hdGNoZWQpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0bGV0IHJlc3VsdHMgPSBhZGRSZXN1bHRzKHt9LCB0aGlzLm1hdGNoZWQpO1xuXHRcdGlmICh0aGlzLmNvbW1lbnQpIHJlc3VsdHMuY29tbWVudCA9IHRoaXMuY29tbWVudDtcblx0XHRyZXR1cm4gcmVzdWx0cztcblxuICAgIGZ1bmN0aW9uIGFkZFJlc3VsdHMocmVzdWx0cywgbWF0Y2hlZCkge1xuICAgICAgbGV0IGluZGV4ID0gMCwgbWF0Y2ggPSB1bmRlZmluZWQ7XG4gICAgICB3aGlsZSAobWF0Y2ggPSBtYXRjaGVkW2luZGV4KytdKSB7XG4gICAgICAgIGlmIChtYXRjaC5wcm9tb3RlKSB7XG4gICAgICAgICAgYWRkUmVzdWx0cyhyZXN1bHRzLCBtYXRjaC5tYXRjaGVkKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBjb25zdCBzb3VyY2VOYW1lID0gbWF0Y2guYXJndW1lbnQgfHwgbWF0Y2guZ3JvdXAgfHwgbWF0Y2gubmFtZTtcbiAgICAgICAgICBjb25zdCBtYXRjaE5hbWUgPSBcIl9cIiArIHNvdXJjZU5hbWU7XG4gICAgICAgICAgY29uc3Qgc291cmNlID0gbWF0Y2gudG9Tb3VyY2UoKTtcbiAgICAgICAgICAvLyBJZiBhcmcgYWxyZWFkeSBleGlzdHMsIGNvbnZlcnQgdG8gYW4gYXJyYXlcbiAgICAgICAgICBpZiAobWF0Y2hOYW1lIGluIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShyZXN1bHRzW21hdGNoTmFtZV0pKSB7XG4gICAgICAgICAgICAgIHJlc3VsdHNbbWF0Y2hOYW1lXSA9IFtyZXN1bHRzW21hdGNoTmFtZV1dO1xuICAgICAgICAgICAgICByZXN1bHRzW3NvdXJjZU5hbWVdID0gW3Jlc3VsdHNbc291cmNlTmFtZV1dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0c1ttYXRjaE5hbWVdLnB1c2gobWF0Y2gpO1xuICAgICAgICAgICAgcmVzdWx0c1tzb3VyY2VOYW1lXS5wdXNoKHNvdXJjZSlcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHRzW21hdGNoTmFtZV0gPSBtYXRjaDtcbiAgICAgICAgICAgIHJlc3VsdHNbc291cmNlTmFtZV0gPSBzb3VyY2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cdH1cblxuXHQvLyBFY2hvIHRoaXMgcnVsZSBiYWNrIG91dC5cblx0dG9TeW50YXgoKSB7XG5cdCAgY29uc3QgcnVsZXMgPSB0aGlzLnJ1bGVzLm1hcChydWxlID0+IHJ1bGUudG9TeW50YXgoKSk7XG5cdFx0cmV0dXJuIGAke3RoaXMucnVsZXMuam9pbihcIiBcIil9JHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcblx0fVxuXG59XG5cblxuLy8gQWx0ZXJuYXRpdmUgc3ludGF4LCBtYXRjaGluZyBvbmUgb2YgYSBudW1iZXIgb2YgZGlmZmVyZW50IHJ1bGVzLlxuLy8gVGhlIHJlc3VsdCBvZiBhIHBhcnNlIGlzIHRoZSBsb25nZXN0IHJ1bGUgdGhhdCBhY3R1YWxseSBtYXRjaGVkLlxuLy8gTk9URTogQ3VycmVudGx5IHRha2VzIHRoZSBsb25nZXN0IHZhbGlkIG1hdGNoLlxuLy8gVE9ETzogbWF0Y2ggYWxsIHZhbGlkIGFsdGVybmF0aXZlc1xuLy9cbi8vIEFmdGVyIHBhcnNpbmdcbi8vICB3ZSdsbCByZXR1cm4gdGhlIHJ1bGUgd2hpY2ggaXMgdGhlIFwiYmVzdCBtYXRjaFwiIChyYXRoZXIgdGhhbiBjbG9uaW5nIHRoaXMgcnVsZSkuXG5SdWxlLkFsdGVybmF0aXZlcyA9IGNsYXNzIGFsdGVybmF0aXZlcyBleHRlbmRzIFJ1bGUge1xuXHRjb25zdHJ1Y3RvciguLi5wcm9wcykge1xuXHRcdHN1cGVyKC4uLnByb3BzKTtcblx0XHRpZiAoIXRoaXMucnVsZXMpIHRoaXMucnVsZXMgPSBbXTtcblx0fVxuXG5cdC8vIFRlc3QgdG8gc2VlIGlmIGFueSBvZiBvdXIgYWx0ZXJuYXRpdmVzIGFyZSBmb3VuZCBBTllXSEVSRSBpbiB0aGUgdG9rZW5zLlxuXHQvLyBOT1RFOiB0aGlzIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBpZiB3ZSdyZSBzcGVjaWZpZWQgYXMgYSBgdGVzdFJ1bGVgXG5cdC8vXHRcdCBhbmQgdGhlbiBvbmx5IGlmIGFsbCBvZiBvdXIgcnVsZXMgYXJlIGRldGVybWluaXN0aWMuXG5cdHRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0bGV0IGluZGV4ID0gMCwgcnVsZSA9IHVuZGVmaW5lZDtcblx0XHR3aGlsZSAocnVsZSA9IHRoaXMucnVsZXNbaW5kZXgrK10pIHtcblx0XHRcdGlmIChydWxlLnRlc3QocGFyc2VyLCB0b2tlbnMsIHN0YXJ0LCBlbmQpKSByZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gRmluZCBhbGwgcnVsZXMgd2hpY2ggbWF0Y2ggYW5kIGRlbGVnYXRlIHRvIGBnZXRCZXN0TWF0Y2goKWAgdG8gcGljayB0aGUgYmVzdCBvbmUuXG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHRsZXQgbWF0Y2hlcyA9IFtdO1xuXHRcdGxldCBpbmRleCA9IDAsIHJ1bGUgPSB1bmRlZmluZWQ7XG5cdFx0d2hpbGUgKHJ1bGUgPSB0aGlzLnJ1bGVzW2luZGV4KytdKSB7XG5cdFx0XHRsZXQgbWF0Y2ggPSBydWxlLnBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCwgZW5kLCBzdGFjayk7XG5cdFx0XHRpZiAobWF0Y2gpIG1hdGNoZXMucHVzaChtYXRjaCk7XG5cdFx0fVxuXG5cdFx0aWYgKCFtYXRjaGVzLmxlbmd0aCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIHVuY29tbWVudCB0aGUgYmVsb3cgdG8gcHJpbnQgYWx0ZXJuYXRpdmVzXG5cdFx0Ly8gaWYgKG1hdGNoZXMubGVuZ3RoID4gMSkge1xuXHRcdC8vXHRjb25zb2xlLmluZm8odGhpcy5hcmd1bWVudCB8fCB0aGlzLmdyb3VwLCBtYXRjaGVzLCBtYXRjaGVzLm1hcChtYXRjaCA9PiBtYXRjaC5tYXRjaGVkVGV4dCkpO1xuXHRcdC8vIH1cblxuXHRcdGxldCBiZXN0TWF0Y2ggPSAobWF0Y2hlcy5sZW5ndGggPT09IDEgPyBtYXRjaGVzWzBdIDogdGhpcy5nZXRCZXN0TWF0Y2gobWF0Y2hlcykpO1xuXG5cdFx0Ly8gYXNzaWduIGBhcmdOYW1lYCBvciBgZ3JvdXBgIGZvciBgcmVzdWx0c2Bcblx0XHRpZiAodGhpcy5hcmd1bWVudCkgYmVzdE1hdGNoLmFyZ3VtZW50ID0gdGhpcy5hcmd1bWVudDtcblx0XHRlbHNlIGlmICh0aGlzLmdyb3VwKSBiZXN0TWF0Y2guZ3JvdXAgPSB0aGlzLmdyb3VwO1xuLy9UT0RPOiBvdGhlciB0aGluZ3MgdG8gY29weSBoZXJlPz8/XG5cblx0XHRyZXR1cm4gYmVzdE1hdGNoO1xuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBcImJlc3RcIiBtYXRjaCBnaXZlbiBtb3JlIHRoYW4gb25lIG1hdGNoZXMgYXQgdGhlIGhlYWQgb2YgdGhlIHRva2Vucy5cblx0Ly8gRGVmYXVsdCBpcyB0byByZXR1cm4gdGhlIGxvbmdlc3QgbWF0Y2guXG5cdC8vIEltcGxlbWVudCBzb21ldGhpbmcgZWxzZSB0byBkbywgZWcsIHByZWNlZGVuY2UgcnVsZXMuXG5cdGdldEJlc3RNYXRjaChtYXRjaGVzKSB7XG5cdFx0cmV0dXJuIG1hdGNoZXMucmVkdWNlKGZ1bmN0aW9uIChiZXN0LCBjdXJyZW50KSB7XG5cdFx0XHRpZiAoY3VycmVudC5uZXh0U3RhcnQgPiBiZXN0Lm5leHRTdGFydCkgcmV0dXJuIGN1cnJlbnQ7XG5cdFx0XHRyZXR1cm4gYmVzdDtcblx0XHR9LCBtYXRjaGVzWzBdKTtcblx0fVxuXG5cdGFkZFJ1bGUoLi4ucnVsZSkge1xuXHRcdHRoaXMucnVsZXMucHVzaCguLi5ydWxlKTtcblx0fVxuXG5cdHRvU3ludGF4KCkge1xuXHQgIGNvbnN0IHJ1bGVzID0gdGhpcy5ydWxlcy5tYXAocnVsZSA9PiBydWxlLnRvU3ludGF4KCkpLmpvaW4oXCJ8XCIpO1xuXHRcdHJldHVybiBgKCR7dGhpcy5hcmd1bWVudCA/IHRoaXMuYXJndW1lbnQrXCI6XCIgOiBcIlwifSR7cnVsZXN9KSR7dGhpcy5vcHRpb25hbCA/ICc/JyA6ICcnfWA7XG5cdH1cbn07XG5cblxuLy8gUmVwZWF0aW5nIHJ1bGUuXG4vL1x0YHRoaXMucmVwZWF0YCBpcyB0aGUgcnVsZSB0aGF0IHJlcGVhdHMuXG4vLyAgYHRoaXMub3B0aW9uYWxgIGlzIHRydWUgaWYgdGhlIHByb2R1dGlvbiBpcyBvcHRpb25hbC5cbi8vXHROb3RlOiBBdXRvbWF0aWNhbGx5IGNvbnN1bWVzIHdoaXRlc3BhY2UgYmVmb3JlIHJ1bGVzLlxuLy9cdE5vdGU6IFJldHVybnMgYHVuZGVmaW5lZGAgaWYgd2UgZG9uJ3QgbWF0Y2ggYXQgbGVhc3Qgb25jZS5cbi8vXG4vLyBBZnRlciBtYXRjaGluZzpcbi8vXHRgdGhpcy5tYXRjaGVkYCBpcyBhcnJheSBvZiBtYXRjaGVkIHJ1bGVzLlxuLy8gIGBydWxlLm5leHRTdGFydGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IHN0YXJ0IHRva2VuLlxuUnVsZS5SZXBlYXQgPSBjbGFzcyByZXBlYXQgZXh0ZW5kcyBSdWxlIHtcblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGxldCBtYXRjaGVkID0gW107XG5cdFx0bGV0IG5leHRTdGFydCA9IHN0YXJ0O1xuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRsZXQgbWF0Y2ggPSB0aGlzLnJlcGVhdC5wYXJzZShwYXJzZXIsIHRva2VucywgbmV4dFN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0XHRcdGlmICghbWF0Y2gpIGJyZWFrO1xuXG5cdFx0XHRtYXRjaGVkLnB1c2gobWF0Y2gpO1xuXHRcdFx0bmV4dFN0YXJ0ID0gbWF0Y2gubmV4dFN0YXJ0O1xuXHRcdH1cblxuXHRcdGlmIChtYXRjaGVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQsXG5cdFx0XHRuZXh0U3RhcnRcblx0XHR9KTtcblx0fVxuXG5cdHRvU291cmNlKCkge1xuXHRcdGlmICghdGhpcy5tYXRjaGVkKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdHJldHVybiB0aGlzLm1hdGNoZWQubWFwKG1hdGNoID0+IG1hdGNoLnRvU291cmNlKCkpO1xuXHR9XG5cblx0dG9TeW50YXgoKSB7XG5cdFx0bGV0IGlzQ29tcG91bmRSdWxlID0gKHRoaXMucmVwZWF0IGluc3RhbmNlb2YgUnVsZS5TZXF1ZW5jZSlcbiAgICAgIHx8ICh0aGlzLnJlcGVhdCBpbnN0YW5jZW9mIFJ1bGUuTGl0ZXJhbHMgJiYgdGhpcy5yZXBlYXQubGl0ZXJhbHMubGVuZ3RoID4gMSk7XG4gICAgY29uc3QgcmVwZWF0ID0gdGhpcy5yZXBlYXQudG9TeW50YXgoKTtcblx0XHRjb25zdCBydWxlID0gaXNDb21wb3VuZFJ1bGUgPyBgKCR7cmVwZWF0fSlgIDogYCR7cmVwZWF0fWA7XG5cdFx0cmV0dXJuIGAke3J1bGV9JHt0aGlzLm9wdGlvbmFsID8gJyonIDogJysnfWA7XG5cdH1cbn1cblxuXG4vLyBMaXN0IG1hdGNoIHJ1bGU6ICAgYFs8aXRlbT48ZGVsaW1pdGVyPl1gLiBlZ1wiIGBbe251bWJlcn0sXWAgdG8gbWF0Y2ggYDEsMiwzYFxuLy9cdGBydWxlLml0ZW1gIGlzIHRoZSBydWxlIGZvciBlYWNoIGl0ZW0sXG4vL1x0YHJ1bGUuZGVsaW1pdGVyYCBpcyB0aGUgZGVsaW1pdGVyIGJldHdlZW4gZWFjaCBpdGVtLCB3aGljaCBpcyBvcHRpb25hbCBhdCB0aGUgZW5kLlxuLy9cbi8vIEFmdGVyIG1hdGNoaW5nOlxuLy9cdGB0aGlzLm1hdGNoZWRgIGlzIGFycmF5IG9mIG1hdGNoZWQgaXRlbSBydWxlcyAoZGVsbWl0ZXIgaXMgaWdub3JlZCkuXG4vLyAgYHJ1bGUubmV4dFN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RhcnQgdG9rZW4uXG4vL1xuLy8gTk9URTogd2UgYXNzdW1lIHRoYXQgYSBMaXN0IHJ1bGUgaXRzZWxmIHdpbGwgTk9UIHJlcGVhdCAoPz8/PylcblJ1bGUuTGlzdCA9IGNsYXNzIGxpc3QgZXh0ZW5kcyBSdWxlIHtcblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdC8vIGVuc3VyZSBpdGVtIGFuZCBkZWxpbWl0ZXIgYXJlIG9wdGlvbmFsIHNvIHdlIGRvbid0IGJhcmYgaW4gYHBhcnNlUnVsZWBcbi8vVE9ETzogPz8/XG5cdFx0dGhpcy5pdGVtLm9wdGlvbmFsID0gdHJ1ZTtcblx0XHR0aGlzLmRlbGltaXRlci5vcHRpb25hbCA9IHRydWU7XG5cblx0XHRsZXQgbWF0Y2hlZCA9IFtdO1xuXHRcdGxldCBuZXh0U3RhcnQgPSBzdGFydDtcblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0Ly8gZ2V0IG5leHQgaXRlbSwgZXhpdGluZyBpZiBub3QgZm91bmRcblx0XHRcdGxldCBpdGVtID0gdGhpcy5pdGVtLnBhcnNlKHBhcnNlciwgdG9rZW5zLCBuZXh0U3RhcnQsIGVuZCwgc3RhY2spO1xuXHRcdFx0aWYgKCFpdGVtKSBicmVhaztcblxuXHRcdFx0bWF0Y2hlZC5wdXNoKGl0ZW0pO1xuXHRcdFx0bmV4dFN0YXJ0ID0gaXRlbS5uZXh0U3RhcnQ7XG5cblx0XHRcdC8vIGdldCBkZWxpbWl0ZXIsIGV4aXRpbmcgaWYgbm90IGZvdW5kXG5cdFx0XHRsZXQgZGVsaW1pdGVyID0gdGhpcy5kZWxpbWl0ZXIucGFyc2UocGFyc2VyLCB0b2tlbnMsIG5leHRTdGFydCwgZW5kLCBzdGFjayk7XG5cdFx0XHRpZiAoIWRlbGltaXRlcikgYnJlYWs7XG5cdFx0XHRuZXh0U3RhcnQgPSBkZWxpbWl0ZXIubmV4dFN0YXJ0O1xuXHRcdH1cblxuXHRcdC8vIElmIHdlIGRpZG4ndCBnZXQgYW55IG1hdGNoZXMsIGZvcmdldCBpdC5cblx0XHRpZiAobWF0Y2hlZC5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkLFxuXHRcdFx0bmV4dFN0YXJ0XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBSZXR1cm5zIEpTIEFycmF5IG9mIG1hdGNoZWQgaXRlbXMgYXMgc291cmNlLlxuLy9UT0RPOiBgSlNEZWxpbWl0ZXJgIHRvIHJldHVybiBhcyBhIHNpbmdsZSBzdHJpbmc/XG5cdHRvU291cmNlKCkge1xuXHRcdGlmICghdGhpcy5tYXRjaGVkKSByZXR1cm4gW107XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hlZC5tYXAoIG1hdGNoID0+IG1hdGNoLnRvU291cmNlKCkgKTtcblx0fVxuXG5cdHRvU3ludGF4KCkge1xuXHQgIGNvbnN0IGl0ZW0gPSB0aGlzLml0ZW0udG9TeW50YXgoKTtcblx0ICBjb25zdCBkZWxpbWl0ZXIgPSB0aGlzLmRlbGltaXRlci50b1N5bnRheCgpO1xuXHRcdHJldHVybiBgWyR7dGhpcy5hcmd1bWVudCA/IHRoaXMuYXJndW1lbnQrXCI6XCIgOiBcIlwifSR7aXRlbX0gJHtkZWxpbWl0ZXJ9XSR7dGhpcy5vcHRpb25hbCA/ICc/JyA6ICcnfWA7XG5cdH1cbn07XG5cblxuXG4vLyBBIGJsb2NrIGlzIHVzZWQgdG8gcGFyc2UgYSBuZXN0ZWQgYmxvY2sgb2Ygc3RhdGVtZW50cy5cbi8vIEFic3RyYWN0IGNsYXNzLlxuUnVsZS5CbG9jayA9IGNsYXNzIGJsb2NrIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG5cblx0Ly8gUGFyc2UgdGhlIGVudGlyZSBgYmxvY2tgLCByZXR1cm5pbmcgcmVzdWx0cy5cblx0cGFyc2VCbG9jayhwYXJzZXIsIGJsb2NrLCBpbmRlbnQgPSAwKSB7XG5cdFx0bGV0IG1hdGNoZWQgPSBbXTtcbi8vY29uc29sZS53YXJuKFwiYmxvY2s6XCIsIGJsb2NrKTtcblx0XHRibG9jay5jb250ZW50cy5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuXHRcdFx0bGV0IHJlc3VsdDtcblx0XHRcdGlmIChpdGVtLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRtYXRjaGVkLnB1c2gobmV3IFJ1bGUuQmxhbmtMaW5lKCkpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoaXRlbSBpbnN0YW5jZW9mIFRva2VuaXplci5CbG9jaykge1xuXHRcdFx0ICAvLyBpZiB0aGUgbGFzdCBtYXRjaGVkIGl0ZW0gd2FudHMgdG8gZWF0IGEgYmxvY2ssIGdpdmUgaXQgdGhlIGJsb2NrXG5cdFx0XHRcdGxldCBsYXN0ID0gbWF0Y2hlZFttYXRjaGVkLmxlbmd0aCAtIDFdO1xuXHRcdFx0XHRpZiAobGFzdC5wYXJzZUJsb2NrKSB7XG5cdFx0XHRcdFx0bGFzdC5wYXJzZUJsb2NrKHBhcnNlciwgaXRlbSwgaW5kZW50ICsgMSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gb3RoZXJ3aXNlIGFkZCB0aGUgYmxvY2sgdG8gdGhlIHN0cmVhbVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRsZXQgYmxvY2sgPSB0aGlzLnBhcnNlQmxvY2socGFyc2VyLCBpdGVtLCBpbmRlbnQgKyAxKTtcblx0XHRcdFx0XHRpZiAoYmxvY2sgIT09IHVuZGVmaW5lZCkgbWF0Y2hlZC5wdXNoKGJsb2NrKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdG1hdGNoZWQgPSBtYXRjaGVkLmNvbmNhdCh0aGlzLnBhcnNlU3RhdGVtZW50KHBhcnNlciwgaXRlbSkpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIG5ldyBSdWxlLkJsb2NrKHtcblx0XHRcdGluZGVudCxcblx0XHRcdG1hdGNoZWRcblx0XHR9KTtcblx0fVxuXG5cdC8vIFBhcnNlIGEgc2luZ2xlIHN0YXRlbWVudCAoYSBsaW5lJ3Mgd29ydGggb2YgYHRva2Vuc2ApLlxuXHQvLyBTa2lwcyB3aGl0ZXNwYWNlIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmUuXG5cdC8vIEF1dG8tbWF0Y2hlcyBjb21tZW50IGluIHRoZSBtaWRkbGUgb2YgdGhlIGxpbmUuXG5cdC8vIFJldHVybnMgYXJyYXkgb2YgcmVzdWx0cy5cblx0cGFyc2VTdGF0ZW1lbnQocGFyc2VyLCB0b2tlbnMpIHtcblx0XHRsZXQgcmVzdWx0cyA9IFtdO1xuXHRcdGxldCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGg7XG5cdFx0bGV0IHN0YXRlbWVudCwgY29tbWVudDtcblxuXHRcdC8vIGNoZWNrIGZvciBhbiBpbmRlbnQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBsaW5lXG5cdFx0aWYgKHRva2Vuc1tzdGFydF0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuV2hpdGVzcGFjZSkgc3RhcnQrKztcblxuXHRcdC8vIGNoZWNrIGZvciBhIGNvbW1lbnQgYXQgdGhlIGVuZCBvZiB0aGUgdG9rZW5zXG5cdFx0aWYgKHRva2Vuc1tlbmQtMV0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuQ29tbWVudCkge1xuXHRcdFx0Y29tbWVudCA9IHBhcnNlci5wYXJzZU5hbWVkUnVsZShcImNvbW1lbnRcIiwgdG9rZW5zLCBlbmQtMSwgZW5kLCB1bmRlZmluZWQsIFwicGFyc2VTdGF0ZW1lbnRcIik7XG5cdFx0XHQvLyBhZGQgY29tbWVudCBGSVJTVCBpZiBmb3VuZFxuXHRcdFx0cmVzdWx0cy5wdXNoKGNvbW1lbnQpO1xuXHRcdFx0ZW5kLS07XG5cdFx0fVxuXG5cdFx0Ly8gcGFyc2UgdGhlIHJlc3QgYXMgYSBcInN0YXRlbWVudFwiXG5cdFx0c3RhdGVtZW50ID0gcGFyc2VyLnBhcnNlTmFtZWRSdWxlKFwic3RhdGVtZW50XCIsIHRva2Vucywgc3RhcnQsIGVuZCwgdW5kZWZpbmVkLCBcInBhcnNlU3RhdGVtZW50XCIpO1xuXHRcdC8vIGNvbXBsYWluIGlmIG5vIHN0YXRlbWVudCBhbmQgbm8gY29tbWVudFxuXHRcdGlmICghc3RhdGVtZW50ICYmICFjb21tZW50KSB7XG5cdFx0XHRsZXQgZXJyb3IgPSBuZXcgUnVsZS5TdGF0ZW1lbnRQYXJzZUVycm9yKHtcblx0XHRcdFx0dW5wYXJzZWQ6IHRva2Vucy5zbGljZShzdGFydCwgZW5kKS5qb2luKFwiIFwiKVxuXHRcdFx0fSk7XG5cdFx0XHRyZXN1bHRzLnB1c2goZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8vIGNvbXBsYWluIGlmIHdlIGNhbid0IHBhcnNlIHRoZSBlbnRpcmUgbGluZSFcblx0XHRlbHNlIGlmIChzdGF0ZW1lbnQgJiYgc3RhdGVtZW50Lm5leHRTdGFydCAhPT0gZW5kKSB7XG5cdFx0XHRsZXQgZXJyb3IgPSBuZXcgUnVsZS5TdGF0ZW1lbnRQYXJzZUVycm9yKHtcblx0XHRcdFx0cGFyc2VkIDogdG9rZW5zLnNsaWNlKHN0YXJ0LCBzdGF0ZW1lbnQubmV4dFN0YXJ0KS5qb2luKFwiIFwiKSxcblx0XHRcdFx0dW5wYXJzZWQgOiB0b2tlbnMuc2xpY2Uoc3RhdGVtZW50Lm5leHRTdGFydCwgZW5kKS5qb2luKFwiIFwiKVxuXHRcdFx0fSk7XG5cdFx0XHRyZXN1bHRzLnB1c2goZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8vIE90aGVyd2lzZSBhZGQgdGhlIHN0YXRlbWVudFxuXHRcdGVsc2UgaWYgKHN0YXRlbWVudCkge1xuXHRcdFx0cmVzdWx0cy5wdXNoKHN0YXRlbWVudCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdHM7XG5cdH1cblxuXHQvLyBSZXR1cm4gc291cmNlIGZvciB0aGlzIGJsb2NrIGFzIGFuIGFycmF5IG9mIGluZGVudGVkIGxpbmVzIFdJVEhPVVQgYHtgIE9SIGB9YC5cblx0YmxvY2tUb1NvdXJjZShibG9jayA9IHRoaXMubWF0Y2hlZCkge1xuXHRcdGxldCByZXN1bHRzID0gW10sIHN0YXRlbWVudDtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYmxvY2subGVuZ3RoOyBpKyspIHtcblx0XHRcdGxldCBtYXRjaCA9IGJsb2NrW2ldO1xuICAgICAgLy9jb25zb2xlLmluZm8oaSwgbWF0Y2gpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHN0YXRlbWVudCA9IG1hdGNoLnRvU291cmNlKCkgfHwgXCJcIjtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgY29uc29sZS53YXJuKFwiRXJyb3IgY29udmVydGluZyBibG9jazogXCIsIGJsb2NrLCBcInN0YXRlbWVudDpcIiwgbWF0Y2gpO1xuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmluZm8oaSwgc3RhdGVtZW50KTtcblx0XHRcdGlmIChpc1doaXRlc3BhY2Uoc3RhdGVtZW50KSkge1xuXHRcdFx0XHRyZXN1bHRzLnB1c2goXCJcIik7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChBcnJheS5pc0FycmF5KHN0YXRlbWVudCkpIHtcblx0XHRcdFx0cmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHN0YXRlbWVudCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2Ygc3RhdGVtZW50ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHN0YXRlbWVudCA9IHN0YXRlbWVudC5zcGxpdChcIlxcblwiKTtcblx0XHRcdFx0cmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHN0YXRlbWVudCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKFwiYmxvY2tUb1NvdXJjZSgpOiBET04nVCBLTk9XIEhPVyBUTyBXT1JLIFdJVEhcXG5cXHRcIiwgc3RhdGVtZW50LCBcIlxcblxcdGZyb20gbWF0Y2hcIiwgbWF0Y2gpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAodGhpcy5pbmRlbnQgIT09IDApIHtcblx0XHRcdHJldHVybiBcIlxcdFwiICsgcmVzdWx0cy5qb2luKFwiXFxuXFx0XCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0cy5qb2luKFwiXFxuXCIpO1xuXHR9XG5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0cmV0dXJuIFwie1xcblwiICsgdGhpcy5ibG9ja1RvU291cmNlKCkgKyBcIlxcblwiICsgXCJ9XCI7XG5cdH1cblxuXHQvLyBDb252ZXJ0IHRvIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2Ygc3RydWN0dXJlIGJ5IGNvbnZlcnRpbmcgaW5kaXZpZHVhbCBzdGF0ZW1lbnRzIGFuZCBncm91cGluZ1xuXHQvLyBOT1RFOiB5b3Ugc2hvdWxkIG92ZXJyaWRlIHRoaXMgYW5kIGluY2x1ZGUgXCJ0eXBlXCJcblx0dG9TdHJ1Y3R1cmUoKSB7XG5cdFx0bGV0IHsgX25hbWU6IG5hbWUsIF9zdXBlclR5cGU6IHN1cGVyVHlwZSB9ID0gdGhpcy5yZXN1bHRzO1xuXHRcdGxldCBibG9jayA9ICh0aGlzLmJsb2NrICYmIHRoaXMuYmxvY2subWF0Y2hlZCkgfHwgW107XG5cblx0XHRsZXQgbmFtZWQgPSB7fTtcblx0XHRsZXQgcHJvcGVydGllcyA9IFtdO1xuXHRcdGxldCBtZXRob2RzID0gW107XG5cdFx0bGV0IG90aGVyID0gW107XG5cdFx0YmxvY2subWFwKHN0YXRlbWVudCA9PiBzdGF0ZW1lbnQudG9TdHJ1Y3R1cmUoKSlcblx0XHRcdCAuZmlsdGVyKEJvb2xlYW4pXG5cdFx0XHQgLmZvckVhY2goYWRkU3RydWN0dXJlKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR0eXBlOiBcInVua25vd25cIixcblx0XHRcdG5hbWUsXG5cdFx0XHRzdXBlclR5cGUsXG5cdFx0XHRuYW1lZCxcblx0XHRcdHByb3BlcnRpZXMsXG5cdFx0XHRtZXRob2RzLFxuXHRcdFx0b3RoZXJcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBhZGRTdHJ1Y3R1cmUoc3RydWN0dXJlKSB7XG5cdFx0XHQvLyBhZGQgYXJyYXlzIGFzIGluZGl2aWR1YWwgaXRlbXNcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHN0cnVjdHVyZSkpIHJldHVybiBzdHJ1Y3R1cmUuZm9yRWFjaChhZGRTdHJ1Y3R1cmUpO1xuXG5cdFx0XHQvLyBhZGQgdW5kZXIgYG5hbWVkYCBmb3IgcXVpY2sgaGl0IG9mIGFsbCBzaWduaWZpY2FudCBiaXRzLi4uXG5cdFx0XHRpZiAoc3RydWN0dXJlLm5hbWUpIG5hbWVkW3N0cnVjdHVyZS5uYW1lXSA9IHN0cnVjdHVyZTtcblxuXHRcdFx0Ly8gYWRkIHVuZGVyICdtZXRob2RzJywgJ3Byb3BlcnRpZXMnIG9yICdvdGhlcidcblx0XHRcdGlmIChzdHJ1Y3R1cmUudHlwZSA9PT0gXCJmdW5jdGlvblwiKSBtZXRob2RzLnB1c2goc3RydWN0dXJlKTtcblx0XHRcdGVsc2UgaWYgKHN0cnVjdHVyZS50eXBlID09PSBcInByb3BlcnR5XCIpIHByb3BlcnRpZXMucHVzaChzdHJ1Y3R1cmUpO1xuXHRcdFx0ZWxzZSBvdGhlci5wdXNoKHN0cnVjdHVyZSk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gRm9ybWF0IGFycmF5IG9mIGBzdGF0ZW1lbnRzYCBhcyBhIEpTIG91dHB1dCBibG9jazpcblx0Ly9cdC0gaWYgYHN0YXRlbWVudHNgIGlzIGVtcHR5LCByZXR1cm5zIGB7fWBcblx0Ly9cdC0gaWYgYHN0YXRlbWVudHMgaXMgYSBzaW5nbGUgbGluZSwgcmV0dXJucyBgeyBzdGF0ZW1lbnQgfWBcblx0Ly9cdC0gZWxzZSByZXR1cm5zIG11bHRpcGxlIGxpbmVzXG4gIC8vXG5cdC8vIEluZGVudHMgd2l0aCB0YWJzLCBlLmcuICBge8KswrtzdGF0ZW1lbnRfMcKswrtzdGF0ZW1lbnQywqx9YFxuXHRzdGF0aWMgZW5jbG9zZVN0YXRlbWVudHMoLi4uYXJncykge1xuXHRcdHZhciBzdGF0ZW1lbnRzID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgYXJnID0gYXJnc1tpXTtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KGFyZykpIHtcblx0XHRcdFx0c3RhdGVtZW50cyA9IHN0YXRlbWVudHMuY29uY2F0KGFyZyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgYXJnID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHN0YXRlbWVudHMucHVzaChhcmcpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRzdGF0ZW1lbnRzID0gc3RhdGVtZW50cy5qb2luKFwiXFxuXCIpO1xuXG5cdFx0aWYgKCFzdGF0ZW1lbnRzKSByZXR1cm4gXCJ7fVwiO1xuXHRcdGlmICghc3RhdGVtZW50cy5pbmNsdWRlcyhcIlxcblwiKSAmJiBzdGF0ZW1lbnRzLmxlbmd0aCA8IDQwKSB7XG5cdFx0XHRyZXR1cm4gYHsgJHtzdGF0ZW1lbnRzLnRyaW0oKX0gfWA7XG5cdFx0fVxuXHRcdGlmIChzdGF0ZW1lbnRzWzBdICE9PSBcIlxcdFwiKSBzdGF0ZW1lbnRzID0gYFxcdCR7c3RhdGVtZW50c31gO1xuXHRcdHJldHVybiBge1xcbiR7c3RhdGVtZW50c31cXG59YDtcblx0fVxuXG4gIC8vIEVuY2xvc2UgYSBzaW5nbGUgc3RhdGVtZW50LlxuXHRzdGF0aWMgZW5jbG9zZVN0YXRlbWVudChzdGF0ZW1lbnQsIGZvcmNlV3JhcCkge1xuXHRcdGlmICghc3RhdGVtZW50KSByZXR1cm4gXCJ7fVwiO1xuXHRcdGlmICghZm9yY2VXcmFwICYmICFzdGF0ZW1lbnQuaW5jbHVkZXMoXCJcXG5cIikgJiYgc3RhdGVtZW50Lmxlbmd0aCA8IDQwKSB7XG5cdFx0XHRyZXR1cm4gYHsgJHtzdGF0ZW1lbnQudHJpbSgpfSB9YDtcblx0XHR9XG5cdFx0aWYgKHN0YXRlbWVudFswXSAhPT0gXCJcXHRcIikgc3RhdGVtZW50ID0gYFxcdCR7c3RhdGVtZW50fWA7XG5cdFx0cmV0dXJuIGB7XFxuJHtzdGF0ZW1lbnR9XFxufWA7XG5cdH1cblxufVxuXG5cbi8vIGBTdGF0ZW1lbnRzYCBhcmUgYSBzcGVjaWFsIGNhc2UgZm9yIGEgYmxvY2sgb2YgYFN0YXRlbWVudGAgcnVsZXNcbi8vXHR0aGF0IHVuZGVyc3RhbmQgbmVzdGluZyBhbmQgY29tbWVudHMuXG4vL1xuLy8gVGhpcyBpcyBhIHRvcC1sZXZlbCBjb25zdHJ1Y3QsIGUuZy4gdXNlZCB0byBwYXJzZSBhbiBlbnRpcmUgZmlsZS5cblJ1bGUuU3RhdGVtZW50cyA9IGNsYXNzIHN0YXRlbWVudHMgZXh0ZW5kcyBSdWxlLkJsb2NrIHtcblxuXHQvLyBTcGxpdCBzdGF0ZW1lbnRzIHVwIGludG8gYmxvY2tzIGFuZCBwYXJzZSAnZW0uXG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGgsIHN0YWNrKSB7XG5cdFx0dmFyIGJsb2NrID0gVG9rZW5pemVyLmJyZWFrSW50b0Jsb2Nrcyh0b2tlbnMsIHN0YXJ0LCBlbmQpO1xuXG5cdFx0bGV0IG1hdGNoZWQgPSB0aGlzLnBhcnNlQmxvY2socGFyc2VyLCBibG9jayk7XG5cdFx0aWYgKCFtYXRjaGVkKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZCxcblx0XHRcdG5leHRTdGFydDogZW5kXG5cdFx0fSk7XG5cdH1cblxuXHQvLyBPdXRwdXQgc3RhdGVtZW50cyBXSVRIT1VUIGN1cmx5IGJyYWNlcyBhcm91bmQgdGhlbS5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hlZC5ibG9ja1RvU291cmNlKCk7XG5cdH1cbn1cblxuXG4vLyBBIGBCbG9ja1N0YXRlbWVudGAgKGUuZy4gYW4gYGlmYCBvciBgcmVwZWF0YCk6XG4vL1x0LSBpcyBhc3N1bWVkIHRvIGhhdmUgYW4gaW5pdGlhbCBwYXJ0aWFsIGBzdGF0ZW1lbnRgXG4vL1x0LSBNQVkgaGF2ZSBhbiBpbmxpbmUgYHN0YXRlbWVudGAgKG9uIHRoZSBzYW1lIGxpbmUsIHBvc3NpYmx5IGFmdGVyIGEgYDpgKVxuLy9cdC0gTUFZIGhhdmUgY29udGVudHMgYXMgYW4gZW1iZWRkZWQgYGJsb2NrYFxuLy8gTm90ZSB0aGF0IGl0J3MgY29uc2lkZXJlZCBhbiBlcnJvciB0byBoYXZlIEJPVEggYW4gaW5saW5lIHN0YXRlbWVudCBBTkQgYSBuZXN0ZWQgYmxvY2suXG4vL1xuLy8gIGUuZy4gYSBgQmxvY2tTdGF0ZW1lbnRgIHdpdGggc3ludGF4IGBpZiB7ZXhwcmVzc2lvbn0gdGhlbiB7c3RhdGVtZW50fT9gIHdpbGwgYXR0ZW10IHRvOlxuLy8gIC0gbWF0Y2ggdGhlIG9wdGlvbmFsIGBzdGF0ZW1lbnRgIGFzIGFuIGlubGluZS1zdGF0ZW1lbnQgKGFzIGByZXN1bHRzLnN0YXRlbWVudGApXG4vLyAgLSBtYXRjaCBhbiBJTkRFTlRFRCBibG9jayBzdGFydGluZyBvbiB0aGUgbmV4dCBsaW5lIChhcyBgcmVzdWx0LmJsb2NrYClcbi8vXG4vL1x0Rm9yIHlvdXIgY29udmVuaWVuY2UgaW4gYHRvU291cmNlKClgLCB5b3UgY2FuIGp1c3QgbG9vayBhdCBgcmVzdWx0cy5zdGF0ZW1lbnRzYFxuLy8gIHdoaWNoIHdpbGwgYmUgb25lIG9mIHRoZSBmb2xsb3dpbmcgKHdoaWNoZXZlciBjb21lcyBmaXJzdCk6XG4vLyAgICAtIHRoZSBibG9jayBhbmQgaXRzIHN0YXRlbWVudHMsIGVuY2xvc2VkIGluIGN1cmx5IGJyYWNlcyBhbmQgaW5kZW50ZWQsIG9yXG4vLyAgICAtIHRoZSBmb3JtYXR0ZWQgYHN0YXRlbWVudGAsIGVuY2xvc2VkIGluIGN1cmx5IGJyYWNrZXRzLFxuLy8gICAgLSBge31gIGlmIG5laXRoZXIgc3RhdGVtZW50IG9yIGJsb2NrIHdhcyBtYXRjaGVkLlxuUnVsZS5CbG9ja1N0YXRlbWVudCA9IGNsYXNzIGJsb2NrX3N0YXRlbWVudCBleHRlbmRzIFJ1bGUuQmxvY2sge1xuXG5cdC8vIFBhcnNlIGEgbmVzdGVkIGJsb2NrIHdoaWNoIGFwcGVhcnMgZGlyZWN0bHkgYWZ0ZXIgb3VyIFwibWFpblwiIHJ1bGUuXG5cdC8vIEFkZHMgdG8gb3VyIGBtYXRjaGVkYCBsaXN0IGFzIG5lY2Vzc2FyeS5cblx0cGFyc2VCbG9jaygpIHtcblx0ICBpZiAoIXRoaXMubWF0Y2hlZCkgdGhyb3cgbmV3IFBhcnNlRXJyb3IoYCR7dGhpcy5uYW1lfHxcImJsb2NrU3RhdGVtZW50XCJ9LnBhcnNlQmxvY2soKTogbm8gbWF0Y2hlZCFgKTtcblx0ICBjb25zdCBibG9jayA9IHN1cGVyLnBhcnNlQmxvY2soLi4uYXJndW1lbnRzKTtcblx0ICBpZiAoIWJsb2NrKSByZXR1cm47XG5cdCAgYmxvY2suYXJndW1lbnQgPSBcImJsb2NrXCI7XG5cdCAgdGhpcy5tYXRjaGVkLnB1c2goYmxvY2spO1xuXHR9XG5cbiAgLy8gQWRkIGBzdGF0ZW1lbnRzYCB0byB0aGUgcmVzdWx0cy5cbiAgZ2V0IHJlc3VsdHMoKSB7XG4gICAgY29uc3QgcmVzdWx0cyA9IHN1cGVyLnJlc3VsdHM7XG4gICAgaWYgKCFyZXN1bHRzKSByZXR1cm4gcmVzdWx0cztcblxuICAgIC8vIElmIHdlIGdvdCBhIGJsb2NrLCB1c2UgdGhhdCBmb3Igb3VyIGBzdGF0ZW1lbnRzYFxuICAgIGlmIChyZXN1bHRzLmJsb2NrKSB7XG4gICAgICByZXN1bHRzLl9zdGF0ZW1lbnRzID0gcmVzdWx0cy5fYmxvY2s7XG4gICAgICByZXN1bHRzLnN0YXRlbWVudHMgPSByZXN1bHRzLmJsb2NrO1xuICAgIH1cbiAgICAvLyBvdGhlcndpc2UgdXNlIHRoZSBgc3RhdGVtZW50YCwgaWYgaXQncyBlbXB0eSB0aGlzIHdpbGwgcmV0dXJuIHRoZSBlbXB0eSBzdHJpbmcuXG4gICAgZWxzZSB7XG4gICAgICByZXN1bHRzLl9zdGF0ZW1lbnRzID0gcmVzdWx0cy5fc3RhdGVtZW50O1xuICAgICAgcmVzdWx0cy5zdGF0ZW1lbnRzID0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50KHJlc3VsdHMuc3RhdGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cbn1cblxuXG4vLyBCbGFuayBsaW5lIHJlcHJlc2VudGF0aW9uIGluIHBhcnNlciBvdXRwdXQuXG5SdWxlLkJsYW5rTGluZSA9IGNsYXNzIGJsYW5rX2xpbmUgZXh0ZW5kcyBSdWxlIHtcblx0dG9Tb3VyY2UoKSB7XG5cdFx0cmV0dXJuIFwiXFxuXCI7XG5cdH1cbn1cblxuLy8gQ29tbWVudCBydWxlIC0tIG1hdGNoZXMgdG9rZW5zIG9mIHR5cGUgYFRva2VuaXplci5Db21tZW50YC5cblJ1bGUuQ29tbWVudCA9IGNsYXNzIGNvbW1lbnQgZXh0ZW5kcyBSdWxlIHtcblx0Ly8gQ29tbWVudHMgYXJlIHNwZWNpYWwgbm9kZXMgaW4gb3VyIHRva2VuIHN0cmVhbS5cblx0cGFyc2UocGFyc2VyLCB0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kLCBzdGFjaykge1xuXHRcdGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG5cdFx0aWYgKCEodG9rZW4gaW5zdGFuY2VvZiBUb2tlbml6ZXIuQ29tbWVudCkpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZDogdG9rZW4sXG5cdFx0XHRuZXh0U3RhcnQ6IHN0YXJ0ICsgMVxuXHRcdH0pO1xuXHR9XG5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0cmV0dXJuIGAvLyR7dGhpcy5tYXRjaGVkLndoaXRlc3BhY2V9JHt0aGlzLm1hdGNoZWQuY29tbWVudH1gO1xuXHR9XG59XG5cbi8vIFBhcnNlciBlcnJvciByZXByZXNlbnRhdGlvbiBpbiBwYXJzZXIgb3V0cHV0LlxuUnVsZS5TdGF0ZW1lbnRQYXJzZUVycm9yID0gY2xhc3MgcGFyc2VfZXJyb3IgZXh0ZW5kcyBSdWxlIHtcblx0Y29uc3RydWN0b3IoLi4ucHJvcHMpIHtcblx0XHRzdXBlciguLi5wcm9wcyk7XG5cdFx0aWYgKFBhcnNlci5XQVJOKSBjb25zb2xlLndhcm4odGhpcy5tZXNzYWdlKTtcblx0fVxuXG5cdGdldCBtZXNzYWdlKCkge1xuXHRcdGlmICh0aGlzLnBhcnNlZCkge1xuXHRcdFx0cmV0dXJuIFwiQ0FOVCBQQVJTRSBFTlRJUkUgU1RBVEVNRU5UXFxuXCJcblx0XHRcdFx0ICsgXCJQQVJTRUQgICAgICA6IGBcIisgdGhpcy5wYXJzZWQgKyBcImBcXG5cIlxuXHRcdFx0XHQgKyBcIkNBTidUIFBBUlNFIDogYFwiKyB0aGlzLnVucGFyc2VkICsgXCJgXCI7XG5cdFx0fVxuXHRcdHJldHVybiBcIkNBTidUIFBBUlNFIFNUQVRFTUVOVDogYFwiICsgdGhpcy51bnBhcnNlZCArIFwiYFwiO1xuXHR9XG5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0cmV0dXJuIFwiLy8gXCIgKyB0aGlzLm1lc3NhZ2Uuc3BsaXQoXCJcXG5cIikuam9pbihcIlxcbi8vIFwiKTtcblx0fVxufVxuXG5cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9SdWxlLmpzIiwiaW1wb3J0IGZsYXR0ZW4gZnJvbSBcImxvZGFzaC9mbGF0dGVuLmpzXCI7XG5cbmltcG9ydCB7IGRlZmluZU1lbW9pemVkIH0gZnJvbSBcIi4vbWVtb2l6ZS5qc1wiO1xuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi9QYXJzZXIuanNcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuL1J1bGUuanNcIjtcbmltcG9ydCB7IGNsb25lQ2xhc3MgfSBmcm9tIFwiLi91dGlscy9jbGFzcy5qc1wiO1xuaW1wb3J0IGdsb2JhbCBmcm9tIFwiLi91dGlscy9nbG9iYWwuanNcIjtcblxuXG5cbi8vXG4vL1x0IyBQYXJzaW5nIGBydWxlU3ludGF4YCB0byBjcmVhdGUgcnVsZXMgYXV0b21hdGljYWxseS5cbi8vXG4vLyBUT0RPOlx0QmV0dGVyIG5hbWUgZm9yIGBydWxlU3ludGF4YFxuLy8gVE9ETzpcdFVzZSBrZXl3b3JkcyBpbiBzeW50YXggdG8gbWFrZSBhIHF1aWNrIHJlZ2V4LWJhc2VkIGB0ZXN0YCBmdW5jdGlvbiBmb3IgdGhlIGVudGlyZSBydWxlXG5cbi8vXG4vLyAjIyBncm91cDogcGFyc2luZyBzeW50YXhcbi8vXG5cbi8vIFJldHVybiBhcnJheSBvZiBydWxlcyBnZW5lcmF0ZWQgYnkgcGFyc2luZyBydWxlIGBzeW50YXhgLCBpbnN0YW50aWF0aW5nIHdpdGggYGNvbnN0cnVjdG9yYCBwYXNzZWQgaW4uXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZVJ1bGUoc3ludGF4LCBjb25zdHJ1Y3Rvcikge1xuICAvLyBJZiB3ZSBnb3QgYW4gYXJyYXkgb2YgcG9zc2libGUgc3ludGF4ZXMuLi5cbiAgaWYgKEFycmF5LmlzQXJyYXkoc3ludGF4KSkge1xuICAgIC8vIC4uLnJlY3Vyc2l2ZWx5IHBhcnNlIGVhY2ggc3ludGF4LCB1c2luZyBhIENMT05FIG9mIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICByZXR1cm4gZmxhdHRlbihzeW50YXgubWFwKHN5bnRheCA9PiBwYXJzZVJ1bGUoc3ludGF4LCBjb25zdHJ1Y3RvciAmJiBjbG9uZUNsYXNzKGNvbnN0cnVjdG9yKSkgKSk7XG4gIH07XG5cbiAgbGV0IHJ1bGVzID0gcGFyc2VTeW50YXgoc3ludGF4KTtcbiAgaWYgKHJ1bGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgcGFyc2VyLmRlZmluZVJ1bGUoJHtuYW1lc1swXX0sICR7c3ludGF4fSk6IG5vIHJ1bGUgcHJvZHVjZWRgKTtcbiAgfVxuXG4gIGlmICghY29uc3RydWN0b3IpIHtcbiAgICAvLyBJZiB3ZSBvbmx5IGdvdCBvbmUgcnVsZSwganVzdCByZXR1cm4gaXRcbiAgICBpZiAocnVsZXMubGVuZ3RoID09PSAxKSByZXR1cm4gcnVsZXM7XG5cbiAgICAvLyBPdGhlcndpc2UgZ3JvdXAgdGhlIHJ1bGVzIHRvZ2V0aGVyIGFuZCByZXR1cm4gdGhhdFxuICAgIHJldHVybiBbIG5ldyBSdWxlLkFsdGVybmF0aXZlcyh7IHJ1bGVzIH0pIF07XG4gIH1cbiAgZWxzZSB7XG4gICAgLy8gTWFrZSBhbiBpbnN0YW5jZSBvZiB0aGUgcnVsZSBhbmQgYWRkIHJlbGV2YW50IHByb3BlcnRpZXMgdG8gaXRzIHByb3RvdHlwZSBub24tZW51bWVyYWJseVxuICAgIGlmIChjb25zdHJ1Y3Rvci5wcm90b3R5cGUgaW5zdGFuY2VvZiBSdWxlLktleXdvcmRzXG4gICAgIHx8IGNvbnN0cnVjdG9yLnByb3RvdHlwZSBpbnN0YW5jZW9mIFJ1bGUuU3ltYm9sc1xuICAgICB8fCBjb25zdHJ1Y3Rvci5wcm90b3R5cGUgaW5zdGFuY2VvZiBSdWxlLkxpc3RcbiAgICAgfHwgY29uc3RydWN0b3IucHJvdG90eXBlIGluc3RhbmNlb2YgUnVsZS5BbHRlcm5hdGl2ZXNcbiAgICApIHtcbiAgICAgIGZvciAobGV0IHByb3BlcnR5IGluIHJ1bGVzWzBdKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3BlcnR5LCB7IHZhbHVlOiBydWxlc1swXVtwcm9wZXJ0eV0gfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLnByb3RvdHlwZSwgXCJydWxlc1wiLCB7IHZhbHVlOiBydWxlcyB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gWyBuZXcgY29uc3RydWN0b3IoKSBdO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRva2VuaXNlUnVsZVN5bnRheChzeW50YXgpIHtcbiAgY29uc3QgU1lOVEFYX0VYUFJFU1NJT04gPSAvKD86W1xcd1xcLV0rfFxcXFxbXFxbXFwoXFx7XFwpXFx9XFxdXXxbXlxcc1xcd118XFx8KS9nO1xuICBsZXQgc3ludGF4U3RyZWFtID0gc3ludGF4Lm1hdGNoKFNZTlRBWF9FWFBSRVNTSU9OKTtcbiAgaWYgKCFzeW50YXhTdHJlYW0pIHRocm93IG5ldyBTeW50YXhFcnJvcihgQ2FuJ3QgdG9rZW5pemUgcGFyc2UgcnVsZSBzeW50YXggPj4ke3N5bnRheH08PGApO1xuICByZXR1cm4gc3ludGF4U3RyZWFtO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTeW50YXgoc3ludGF4LCBydWxlcyA9IFtdLCBzdGFydCA9IDApIHtcbiAgaWYgKHN5bnRheCA9PSBudWxsKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwicGFyc2VTeW50YXgoKTogYHN5bnRheGAgaXMgcmVxdWlyZWRcIik7XG4gIGNvbnN0IHN5bnRheFN0cmVhbSA9IHR5cGVvZiBzeW50YXggPT09IFwic3RyaW5nXCJcbiAgICA/IHRva2VuaXNlUnVsZVN5bnRheChzeW50YXgpXG4gICAgOiBzeW50YXg7XG5cbiAgbGV0IGxhc3RJbmRleCA9IHN5bnRheFN0cmVhbS5sZW5ndGg7XG4gIHdoaWxlIChzdGFydCA8IGxhc3RJbmRleCkge1xuICAgIGxldCBbIHJ1bGUsIGVuZCBdID0gcGFyc2VUb2tlbihzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgaWYgKHJ1bGUpIHtcbiAgICAgIGxldCBsYXN0ID0gcnVsZXNbcnVsZXMubGVuZ3RoLTFdO1xuICAgICAgLy8gSWYgdGhpcyBpcyBhIGBTeW1ib2xgIGFuZCBsYXN0IHdhcyBhIGBTeW1ib2xgLCBtZXJnZSB0b2dldGhlclxuICAgICAgaWYgKGxhc3QgJiYgbGFzdCBpbnN0YW5jZW9mIFJ1bGUuU3ltYm9scyAmJiBydWxlIGluc3RhbmNlb2YgUnVsZS5TeW1ib2xzKSB7XG4gICAgICAgIC8vIHJlbW92ZSB0aGUgbGFzdCBydWxlXG4gICAgICAgIHJ1bGVzLnBvcCgpO1xuICAgICAgICAvLyBhbmQgcmVwbGFjZSB3aXRoIGEgcnVsZSB0aGF0IG1lcmdlcyB0aGUga2V5d29yZHNcbiAgICAgICAgcnVsZS5saXRlcmFscyA9IGxhc3QubGl0ZXJhbHMuY29uY2F0KHJ1bGUubGl0ZXJhbHMpO1xuICAgICAgfVxuICAgICAgcnVsZXMucHVzaChydWxlKTtcbiAgICB9XG4gICAgc3RhcnQgPSBlbmQgKyAxO1xuICB9XG4gIHJldHVybiBydWxlcztcbn1cblxuY29uc3QgS0VZV09SRF9QQVRURVJOID0gL1tBLVphLXpdW1xcd18tXSovO1xuZnVuY3Rpb24gcGFyc2VUb2tlbihzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCkge1xuICBsZXQgc3ludGF4VG9rZW4gPSBzeW50YXhTdHJlYW1bc3RhcnRdO1xuXG4gIC8vIGlmIHdlIGdvdCBhIFwiXFxcXFwiICh3aGljaCBhbHNvIGhhcyB0byBnbyBpbnRvIHRoZSBzb3VyY2Ugc3RyaW5nIGFzIFwiXFxcXFwiKVxuICAvLyB0cmVhdCB0aGUgbmV4dCB0b2tlbiBhcyBhIGxpdGVyYWwgc3RyaW5nIHJhdGhlciB0aGFuIGFzIGEgc3BlY2lhbCBjaGFyYWN0ZXIuXG4gIGlmIChzeW50YXhUb2tlbiA9PT0gXCJcXFxcXCIpIHtcbiAgICByZXR1cm4gcGFyc2VTeW1ib2woc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQgKyAxKTtcbiAgfVxuXG4gIHN3aXRjaCAoc3ludGF4VG9rZW4pIHtcbiAgICBjYXNlIFwie1wiOlx0cmV0dXJuIHBhcnNlU3VicnVsZShzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgY2FzZSBcIihcIjpcdHJldHVybiBwYXJzZUFsdGVybmF0aXZlcyhzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgY2FzZSBcIltcIjpcdHJldHVybiBwYXJzZUxpc3Qoc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuICAgIGNhc2UgXCIqXCI6XG4gICAgY2FzZSBcIitcIjpcbiAgICBjYXNlIFwiP1wiOlx0cmV0dXJuIHBhcnNlUmVwZWF0KHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcblxuICAgIC8vIHRoZSBmb2xsb3dpbmcgc2hvdWxkIEFMV0FZUyBiZSBjb25zdW1lZCBieSB0aGUgYWJvdmVcbiAgICBjYXNlIFwifVwiOlxuICAgIGNhc2UgXCIpXCI6XG4gICAgY2FzZSBcIl1cIjpcbiAgICBjYXNlIFwifFwiOlxuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkICR7c3ludGF4VG9rZW59IGZvdW5kIGFzIGl0ZW0gJHtzdGFydH0gb2YgJHtzeW50YXhTdHJlYW19YCk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgaWYgKHN5bnRheFRva2VuLm1hdGNoKEtFWVdPUkRfUEFUVEVSTikpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlS2V5d29yZChzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlU3ltYm9sKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICAgIH1cbiAgfVxufVxuXG5cbi8vIE1hdGNoIGBrZXl3b3JkYCBpbiBzeW50YXggcnVsZXMuXG4vLyBJZiBtb3JlIHRoYW4gb25lIGtleXdvcmQgYXBwZWFycyBpbiBhIHJvdywgY29tYmluZXMgdGhlbSBpbnRvIGEgc2luZ2xlIGBLZXl3b3JkYCBvYmplY3QuXG4vLyBUaGlzIGlzIHByZXR0eSBzYWZlLCB1bmxlc3MgeW91IGhhdmUgYW4gb3B0aW9uYWwga2V5d29yZCBsaWtlXG4vL1x0XHRgdGhlIHtpZGVudGlmaWVyfSBvZiB0aGU/IHtleHByZXNzaW9ufWBcbi8vIGluIHdoaWNoIGNhc2UgeW91IGNhbiBwdXQgdGhlIG9wdGlvbmFsIGtleXdvcmQgaW4gcGFyZW5zXG4vL1x0XHRgdGhlIHtpZGVudGlmaWVyfSBvZiAodGhlPykge2V4cHJlc3Npb259YFxuLy9cbi8vIFJldHVybnMgYFsgcnVsZSwgZW5kIF1gXG4vLyBUaHJvd3MgaWYgaW52YWxpZC5cbmZ1bmN0aW9uIHBhcnNlS2V5d29yZChzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCwgY29uc3RydWN0b3IgPSBSdWxlLktleXdvcmRzKSB7XG4gIGxldCBsaXRlcmFscyA9IFtdLCBlbmQ7XG4gIC8vIGVhdCBrZXl3b3JkcyB3aGlsZSB0aGV5IGxhc3RcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgc3ludGF4U3RyZWFtLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IG5leHQgPSBzeW50YXhTdHJlYW1baV07XG4gICAgaWYgKHR5cGVvZiBuZXh0ID09PSBcInN0cmluZ1wiICYmIG5leHQubWF0Y2goS0VZV09SRF9QQVRURVJOKSkge1xuICAgICAgbGl0ZXJhbHMucHVzaChuZXh0KTtcbiAgICAgIGVuZCA9IGk7XG4gICAgfVxuICAgIGVsc2UgYnJlYWs7XG4gIH1cblxuICBsZXQgcnVsZSA9IG5ldyBjb25zdHJ1Y3Rvcih7IGxpdGVyYWxzIH0pO1xuICByZXR1cm4gWyBydWxlLCBlbmQgXTtcbn1cblxuLy8gTWF0Y2ggYGtleXdvcmRgIGluIHN5bnRheCBydWxlcy5cbi8vIFJldHVybnMgYFsgcnVsZSwgZW5kIF1gXG4vLyBUaHJvd3MgaWYgaW52YWxpZC5cbmZ1bmN0aW9uIHBhcnNlU3ltYm9sKHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwLCBjb25zdHJ1Y3RvciA9IFJ1bGUuU3ltYm9scykge1xuICBsZXQgc3RyaW5nID0gc3ludGF4U3RyZWFtW3N0YXJ0XTtcbiAgaWYgKCFjb25zdHJ1Y3RvcikgY29uc3RydWN0b3IgPSBSdWxlLlN5bWJvbHM7XG5cbiAgLy8gSWYgc3RyaW5nIHN0YXJ0cyB3aXRoIGBcXFxcYCwgaXQncyBhbiBlc2NhcGVkIGxpdGVyYWwgKGVnOiBgXFxbYCBuZWVkcyB0byBpbnB1dCBhcyBgXFxcXFtgKS5cbiAgbGV0IGlzRXNjYXBlZCA9IHN0cmluZy5zdGFydHNXaXRoKFwiXFxcXFwiKTtcbiAgbGV0IGxpdGVyYWxzID0gaXNFc2NhcGVkID8gc3RyaW5nLnN1YnN0cigxKSA6IHN0cmluZztcblxuICBsZXQgcnVsZSA9IG5ldyBjb25zdHJ1Y3Rvcih7IGxpdGVyYWxzIH0pO1xuXG4gIGlmIChpc0VzY2FwZWQpIHtcbiAgICBydWxlLnRvU3ludGF4ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYFxcXFwke2xpdGVyYWxzfSR7dGhpcy5vcHRpb25hbCA/ICc/JyA6ICcnfWA7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFsgcnVsZSwgc3RhcnQgXTtcbn1cblxuXG4vLyBNYXRjaCBncm91cGluZyBleHByZXNzaW9uIGAoLi4ufC4uLilgIGluIHN5bnRheCBydWxlcy5cbi8vIFJldHVybnMgYFsgcnVsZSwgZW5kIF1gXG4vLyBZb3UgY2FuIHNwZWNpZnkgYW4gZXhwbGljaXQgYHJ1bGUuYXJndW1lbnRgIHdpdGg6ICBgKHNvbWVhcmc6Li4uKWBcbi8vIFlvdSBjYW4gc3BlY2lmeSB0aGF0IHRoZSByZXN1bHRzIHNob3VsZCBiZSBgcHJvbW90ZWRgIHRvIGVuY2xvc2luZyBydWxlIHdpdGg6IGAoPzouLi4pYFxuLy9cbi8vIE5PVEU6IG5lc3RlZCBwYXJlbnMgbWF5IG5vdCBoYXZlIGFsdGVybmF0aXZlcy4uLiA6LSggICBgKGF8KGJ8YykpYCB3b24ndCB3b3JrPz8/XG5mdW5jdGlvbiBwYXJzZUFsdGVybmF0aXZlcyhzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCkge1xuICBsZXQgeyBlbmQsIHNsaWNlIH0gPSBQYXJzZXIuZmluZE5lc3RlZFRva2VucyhzeW50YXhTdHJlYW0sIFwiKFwiLCBcIilcIiwgc3RhcnQpO1xuXG4gIC8vIHB1bGwgb3V0IGV4cGxpY2l0IFwicHJvbW90ZVwiIGZsYWc6IGA/OmBcbiAgbGV0IHByb21vdGUgPSAoc2xpY2VbMF0gPT09IFwiP1wiICYmIHNsaWNlWzFdID09PSBcIjpcIik7XG4gIGlmIChwcm9tb3RlKSB7XG4gICAgc2xpY2UgPSBzbGljZS5zbGljZSgyKTtcbiAgfVxuXG4gIC8vIHB1bGwgb3V0IGV4cGxpY2l0IGFyZ3VtZW50IG5hbWVcbiAgbGV0IGFyZ3VtZW50O1xuICBpZiAoc2xpY2UubGVuZ3RoID4gMiAmJiBzbGljZVsxXSA9PT0gXCI6XCIpIHtcbiAgICBhcmd1bWVudCA9IHNsaWNlWzBdO1xuICAgIHNsaWNlID0gc2xpY2Uuc2xpY2UoMik7XG4gIH1cblxuICAvLyBzcGxpdCBpbnRvIGdyb3VwcywgaW5jbHVkaW5nIG5lc3RlZCBwYXJlbnNcbiAgbGV0IGFsdGVybmF0aXZlcyA9XG4gICAgZ3JvdXBBbHRlcm5hdGl2ZXMoc2xpY2UpXG4gICAgLm1hcChmdW5jdGlvbihncm91cCkge1xuICAgICAgbGV0IHJlc3VsdHMgPSBwYXJzZVN5bnRheChncm91cCwgW10pO1xuICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiByZXN1bHRzWzBdO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgUnVsZS5TZXF1ZW5jZSh7IHJ1bGVzOiByZXN1bHRzIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIGxldCBydWxlID0gYWx0ZXJuYXRpdmVzLmxlbmd0aCA9PT0gMSA/IGFsdGVybmF0aXZlc1swXSA6IG5ldyBSdWxlLkFsdGVybmF0aXZlcyh7IHJ1bGVzOiBhbHRlcm5hdGl2ZXMgfSk7XG4gIGlmIChhcmd1bWVudCkgcnVsZS5hcmd1bWVudCA9IGFyZ3VtZW50O1xuICBpZiAocHJvbW90ZSkgcnVsZS5wcm9tb3RlID0gdHJ1ZTtcbiAgcmV0dXJuIFsgcnVsZSwgZW5kIF07XG59XG5cbmZ1bmN0aW9uIGdyb3VwQWx0ZXJuYXRpdmVzKHRva2Vucykge1xuICBsZXQgYWx0ZXJuYXRpdmVzID0gW107XG4gIGxldCBjdXJyZW50ID0gW107XG4gIGZvciAobGV0IGkgPSAwLCB0b2tlbjsgdG9rZW4gPSB0b2tlbnNbaV07IGkrKykge1xuICAgIC8vIGhhbmRsZSBhbHRlcm5hdGUgbWFya2VyXG4gICAgaWYgKHRva2VuID09PSBcInxcIikge1xuICAgICAgYWx0ZXJuYXRpdmVzLnB1c2goY3VycmVudCk7XG4gICAgICBjdXJyZW50ID0gW107XG4gICAgfVxuICAgIC8vIGhhbmRsZSBuZXN0ZWQgcGFyZW5zXG4gICAgZWxzZSBpZiAodG9rZW4gPT09IFwiKFwiKSB7XG4gICAgICBsZXQgeyBlbmQgfSA9IFBhcnNlci5maW5kTmVzdGVkVG9rZW5zKHRva2VucywgXCIoXCIsIFwiKVwiLCBpKTtcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50LmNvbmNhdCh0b2tlbnMuc2xpY2UoaSwgZW5kICsgMSkpO1xuICAgICAgaSA9IGVuZDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjdXJyZW50LnB1c2godG9rZW4pO1xuICAgIH1cbiAgfVxuICBpZiAoY3VycmVudC5sZW5ndGgpIGFsdGVybmF0aXZlcy5wdXNoKGN1cnJlbnQpO1xuICByZXR1cm4gYWx0ZXJuYXRpdmVzO1xufVxuXG4vLyBNYXRjaCByZXBlYXQgaW5kaWNhdG9yIGA/YCwgYCtgIG9yIGAqYCBieSBhdHRhY2hpbmcgaXQgdG8gdGhlIHByZXZpb3VzIHJ1bGUuXG5mdW5jdGlvbiBwYXJzZVJlcGVhdChzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCkge1xuICBsZXQgc3ltYm9sID0gc3ludGF4U3RyZWFtW3N0YXJ0XTtcbiAgbGV0IHJ1bGUgPSBydWxlc1tydWxlcy5sZW5ndGggLSAxXTtcbiAgaWYgKCFydWxlKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYENhbid0IGF0dGFjaCByZXBlYXQgc3ltYm9sICR7c3ltYm9sfSB0byBlbXB0eSBydWxlIWApO1xuXG4gIC8vIFRyYW5zZm9ybSBsYXN0IHJ1bGUgaW50byBhIHJlcGVhdCBmb3IgYCpgIGFuZCBgK2AuXG4gIGlmIChzeW1ib2wgPT09IFwiKlwiIHx8IHN5bWJvbCA9PT0gXCIrXCIpIHtcbiAgICBsZXQgYXJndW1lbnQgPSBydWxlLmFyZ3VtZW50O1xuICAgIHJ1bGUgPSBuZXcgUnVsZS5SZXBlYXQoeyByZXBlYXQ6IHJ1bGUgfSk7XG4gICAgaWYgKGFyZ3VtZW50KSBydWxlLmFyZ3VtZW50ID0gYXJndW1lbnQ7XG4gICAgLy8gcHVzaCBpbnRvIHJ1bGUgc3RhY2sgaW4gcGxhY2Ugb2Ygb2xkIHJ1bGVcbiAgICBydWxlc1tydWxlcy5sZW5ndGggLSAxXSA9IHJ1bGU7XG4gIH1cblxuICAvLyBSdWxlIGlzIG9wdGlvbmFsIGZvciBgP2AgYW5kIGAqYC5cbiAgaWYgKHN5bWJvbCA9PT0gXCI/XCIgfHwgc3ltYm9sID09PSBcIipcIikge1xuICAgIHJ1bGUub3B0aW9uYWwgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIFsgdW5kZWZpbmVkLCBzdGFydCBdXG59XG5cbi8vIE1hdGNoIGB7PHN1YnJ1bGU+fWAgaW4gc3ludGF4IHJ1bGVzLlxuLy8gUmV0dXJucyBgWyBydWxlLCBlbmQgXWBcbi8vIFRocm93cyBpZiBpbnZhbGlkLlxuZnVuY3Rpb24gcGFyc2VTdWJydWxlKHN5bnRheFN0cmVhbSwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwKSB7XG4gIGxldCBtYXRjaCA9IFBhcnNlci5maW5kTmVzdGVkVG9rZW5zKHN5bnRheFN0cmVhbSwgXCJ7XCIsIFwifVwiLCBzdGFydCk7XG4gIGxldCBhcmd1bWVudDtcbiAgaWYgKG1hdGNoLnNsaWNlLmxlbmd0aCA9PT0gMyAmJiBtYXRjaC5zbGljZVsxXSA9PT0gXCI6XCIpIHtcbiAgICBhcmd1bWVudCA9IG1hdGNoLnNsaWNlWzBdO1xuICAgIG1hdGNoLnNsaWNlID0gbWF0Y2guc2xpY2Uuc2xpY2UoMik7XG4gIH1cbiAgaWYgKG1hdGNoLnNsaWNlLmxlbmd0aCA+IDEpIHRocm93IG5ldyBTeW50YXhFcnJvcihgQ2FuJ3QgcHJvY2VzcyBydWxlcyB3aXRoIG1vcmUgdGhhbiBvbmUgcnVsZSBuYW1lOiB7JHttYXRjaC5zbGljZS5qb2luKFwiXCIpfX1gKTtcblxuICBsZXQgcGFyYW1zID0geyBzdWJydWxlOiBtYXRjaC5zbGljZVswXSB9O1xuXG4gIC8vIHNlZSBpZiB0aGVyZSdzIGEgYG5vdGAgcnVsZSBpbiB0aGVyZVxuICBsZXQgYmFuZ1Bvc2l0aW9uID0gcGFyYW1zLnN1YnJ1bGUuaW5kZXhPZihcIiFcIik7XG4gIGlmIChiYW5nUG9zaXRpb24gIT09IC0xKSB7XG4gICAgcGFyYW1zLm5vdCA9IHBhcmFtcy5zdWJydWxlLnN1YnN0cihiYW5nUG9zaXRpb24gKyAxKTtcbiAgICBwYXJhbXMuc3VicnVsZSA9IHBhcmFtcy5zdWJydWxlLnN1YnN0cigwLCBiYW5nUG9zaXRpb24pO1xuICB9XG5cbiAgbGV0IHJ1bGUgPSBuZXcgUnVsZS5TdWJydWxlKHBhcmFtcyk7XG4gIGlmIChhcmd1bWVudCkgcnVsZS5hcmd1bWVudCA9IGFyZ3VtZW50O1xuICByZXR1cm4gWyBydWxlLCBtYXRjaC5lbmQgXTtcbn1cblxuLy8gTWF0Y2ggbGlzdCBleHByZXNzaW9uIGBbPGl0ZW0+PGRlbGltaXRlcj5dYCBvciBgWzxhcmd1bWVudD46PGl0ZW0+PGRlbGltaXRlcj5dYCBpbiBzeW50YXggcnVsZXMuXG4vLyBSZXR1cm5zIGBbIHJ1bGUsIGVuZCBdYFxuLy8gVGhyb3dzIGlmIGludmFsaWQuXG5mdW5jdGlvbiBwYXJzZUxpc3Qoc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDAsIGNvbnN0cnVjdG9yID0gUnVsZS5MaXN0KSB7XG4gIGxldCB7IGVuZCwgc2xpY2UgfSA9IFBhcnNlci5maW5kTmVzdGVkVG9rZW5zKHN5bnRheFN0cmVhbSwgXCJbXCIsIFwiXVwiLCBzdGFydCk7XG5cbiAgLy8gZ2V0IGFyZ3VtZW50IGlmIHN1cHBsaWVkXG4gIGxldCBhcmd1bWVudDtcbiAgaWYgKHNsaWNlLmxlbmd0aCA+IDIgJiYgc2xpY2VbMV0gPT09IFwiOlwiKSB7XG4gICAgYXJndW1lbnQgPSBzbGljZVswXTtcbiAgICBzbGljZSA9IHNsaWNlLnNsaWNlKDIpO1xuICB9XG5cbiAgbGV0IHJlc3VsdHMgPSBwYXJzZVN5bnRheChzbGljZSwgW10pO1xuICBpZiAocmVzdWx0cy5sZW5ndGggIT09IDIpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFVuZXhwZWN0ZWQgc3R1ZmYgYXQgZW5kIG9mIGxpc3Q6IFske3NsaWNlLmpvaW4oXCIgXCIpfV1gKTtcbiAgfVxuICBsZXQgWyBpdGVtLCBkZWxpbWl0ZXIgXSA9IHJlc3VsdHM7XG5cbiAgbGV0IHJ1bGUgPSBuZXcgY29uc3RydWN0b3IoeyBpdGVtLCBkZWxpbWl0ZXIgfSk7XG4gIGlmIChhcmd1bWVudCkgcnVsZS5hcmd1bWVudCA9IGFyZ3VtZW50O1xuICByZXR1cm4gWyBydWxlLCBlbmQgXTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9SdWxlU3ludGF4LmpzIiwiaW1wb3J0IHsgZ2V0VGFicyB9IGZyb20gXCIuL3V0aWxzL3N0cmluZ1wiO1xuXG4vLyBHUlJSLi4uIG5vZGUgZG9lc24ndCBpbmNsdWRlIHRoaXM/Pz9cbi8vIENIRUNLIERJRkZFUkVOVCBOT0RFIFZFUlNJT05TLi4uXG5pZiAoIShBcnJheS5wcm90b3R5cGUuaW5jbHVkZXMpKSB7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsIFwiaW5jbHVkZXNcIiwge1xuXHRcdHZhbHVlOiBmdW5jdGlvbih2YWx1ZSwgc3RhcnQpIHtcblx0XHRcdGxldCBpbmRleCA9IHRoaXMuaW5kZXhPZih2YWx1ZSwgc3RhcnQpO1xuXHRcdFx0cmV0dXJuIChpbmRleCAhPT0gLTEpO1xuXHRcdH1cblx0fSk7XG59XG5cblxuXG4vLyBgd2hpdGVzcGFjZWAgY2xhc3MgZm9yIG5vcm1hbCAobm9uLWluZGVudCwgbm9uLW5ld2xpbmUpIHdoaXRlc3BhY2UuXG5jbGFzcyB3aGl0ZXNwYWNlIHtcblx0Y29uc3RydWN0b3Iod2hpdGVzcGFjZSkge1xuXHRcdHRoaXMud2hpdGVzcGFjZSA9IHdoaXRlc3BhY2U7XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIFwibGVuZ3RoXCIgb2YgdGhpcyB3aGl0ZXNwYWNlLCBlZyBmb3IgYW4gaW5kZW50LlxuXHRnZXQgbGVuZ3RoKCkge1xuXHRcdHJldHVybiB0aGlzLndoaXRlc3BhY2UubGVuZ3RoO1xuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIHRoaXMud2hpdGVzcGFjZTtcblx0fVxufVxuXG5cbi8vIGBpbmRlbnRgIGNsYXNzLlxuY2xhc3MgaW5kZW50IGV4dGVuZHMgd2hpdGVzcGFjZSB7fVxuXG5cbi8vIE5ld2xpbmUgc2luZ2xldG9uLlxuY2xhc3MgbmV3bGluZSBleHRlbmRzIHdoaXRlc3BhY2Uge31cblxuXG4vL1xuLy9cdCMgVG9rZW5pemVyXG4vL1x0LSBgLnRva2VuaXplKClgIFx0XHRCcmVha3MgdXAgbG9uZyBzdHJpbmcgaW50byB0b2tlbnMsIGluY2x1ZGluZyBuZXdsaW5lcywgSlNYIGV4cHJlc3Npb25zLCBldGMuXG4vL1x0LSBgLnRva2VuaXplTGluZXMoKWAgXHRUYWtlcyB0aGUgYWJvdmUgYW5kIGJyZWFrcyBpdCBpbnRvIGFuIGFycmF5IG9mIGFycmF5cyBmb3IgZWFjaCBsaW5lLlxuLy9cbi8vIFRPRE86IGVycm9yIGNoZWNraW5nIC8gcmVwb3J0aW5nLCBlc3BlY2lhbGx5IGluIEpTWCBleHByZXNzaW9ucy5cbi8vIFRPRE86IGhhdmUgbm9ybWFsIGB0b2tlbml6ZWAgc3RpY2sgd2hpdGVzcGFjZSBlbGVtZW50cyBpbiB0aGUgc3RyZWFtLCB0aGVuIGB0b2tlbml6ZUxpbmVzKClgIHRha2VzIHRoZW0gb3V0P1xuY29uc3QgVG9rZW5pemVyID0ge1xuXG5cdC8vIFNob3VsZCB3ZSB3YXJuIGFib3V0IGFub21hbG91cyBjb25kaXRpb25zP1xuXHRXQVJOIDogZmFsc2UsXG5cblx0Ly8gV2hpdGVzcGFjZSBjb25zdHJ1Y3Rvci5cblx0V2hpdGVzcGFjZTogd2hpdGVzcGFjZSxcblxuXHQvLyBJbmRlbnQgY29uc3RydWN0b3Jcblx0SW5kZW50OiBpbmRlbnQsXG5cblx0Ly8gTkVXTElORSBzaW5nbGV0b24uXG5cdE5FV0xJTkU6IG5ldyBuZXdsaW5lKFwiXFxuXCIpLFxuXG5cdC8vIFRva2VuaXplIHRleHQgYmV0d2VlbiBgc3RhcnRgIGFuZCBgZW5kYCBpbnRvIGFuIGFycmF5IG9mIGByZXN1bHRzYCwgYW4gYXJyYXkgb2Y6XG5cdC8vXHQtIGBUb2tlbml6ZXIuTkVXTElORWAgZm9yIGEgbmV3bGluZSBzeW1ib2xcblx0Ly9cdC0gc3RyaW5ncyBmb3Iga2V5d29yZHMvc3ltYm9sc1xuXHQvL1x0LSBudW1iZXJzIGZvciBudW1iZXIgbGl0ZXJhbHNcblx0Ly9cdC0gYHsgaW5kZW50OiBudW1iZXIgfWAgZm9yIGluZGVudCBhdCBzdGFydCBvZiBsaW5lXG5cdC8vXHQtIGB7IHR5cGU6IFwidGV4dFwiLCBsaXRlcmFsOiBcIidhYmMnXCIsIHRleHQ6IFwiYWJjXCIgfVxuXHQvL1x0LSBgeyB0eXBlOiBcImluZGVudFwiLCBsZXZlbDogNyB9YFxuXHQvL1x0LSBgeyB0eXBlOiBcImNvbW1lbnRcIiwgY29tbWVudDogXCJzdHJpbmdcIiwgY29tbWVudFN5bWJvbCwgd2hpdGVzcGFjZSB9YFxuLy9URVNUTUVcblx0dG9rZW5pemUodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0Ly8gcXVpY2sgcmV0dXJuIG91dCBvZiByYW5nZSBvciBvbmx5IHdoaXRlc3BhY2Vcblx0XHRpZiAoc3RhcnQgPj0gZW5kIHx8ICF0ZXh0LnRyaW0oKSkgcmV0dXJuIFtdO1xuXG5cdFx0bGV0IHRva2VucyA9IFtdO1xuXHRcdC8vIFByb2Nlc3Mgb3VyIHRvcC1sZXZlbCBydWxlcy5cblx0XHRsZXQgW3Jlc3VsdHMsIG5leHRTdGFydF0gPSB0aGlzLmVhdFRva2Vucyh0aGlzLm1hdGNoVG9wVG9rZW5zLCB0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRpZiAocmVzdWx0cykge1xuXHRcdFx0dG9rZW5zID0gdG9rZW5zLmNvbmNhdChyZXN1bHRzKTtcblx0XHRcdHN0YXJ0ID0gbmV4dFN0YXJ0O1xuXHRcdH1cblx0XHRpZiAoc3RhcnQgIT09IGVuZCkge1xuXHRcdFx0aWYgKFRva2VuaXplci5XQVJOKSBjb25zb2xlLndhcm4oXCJ0b2tlbml6ZSgpOiBkaWRuJ3QgY29uc3VtZTogYFwiLCB0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpICsgXCJgXCIpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHRzO1xuXHR9LFxuXG5cdC8vIFJlcGVhdGVkbHkgZXhlY3V0ZSBhIGBtZXRob2RgIChib3VuZCB0byBgdGhpcykgd2hpY2ggcmV0dXJucyBhIGBbcmVzdWx0LCBuZXh0U3RhcnRdYCBvciBgdW5kZWZpbmVkYC5cblx0Ly8gUGxhY2VzIG1hdGNoZWQgcmVzdWx0cyB0b2dldGhlciBpbiBgcmVzdWx0c2AgYXJyYXkgYW5kIHJldHVybnMgYFtyZXN1bHRzLCBuZXh0U3RhcnRdYCBmb3IgdGhlIGVudGlyZSBzZXQuXG5cdC8vIFN0b3BzIGlmIGBtZXRob2RgIGRvZXNuJ3QgcmV0dXJuIGFueXRoaW5nLCBvciBpZiBjYWxsaW5nIGBtZXRob2RgIGlzIHVucHJvZHVjdGl2ZS5cbi8vVEVTVE1FXG5cdGVhdFRva2VucyhtZXRob2QsIHRleHQsIHN0YXJ0ID0gMCwgZW5kLCByZXN1bHRzID0gW10pIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIHByb2Nlc3MgcnVsZXMgcmVwZWF0ZWRseSB1bnRpbCB3ZSBnZXQgdG8gdGhlIGVuZFxuXHRcdHdoaWxlIChzdGFydCA8IGVuZCkge1xuXHRcdFx0bGV0IHJlc3VsdCA9IG1ldGhvZC5jYWxsKHRoaXMsIHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdFx0aWYgKCFyZXN1bHQpIGJyZWFrO1xuXG5cdFx0XHRsZXQgW3Rva2VucywgbmV4dFN0YXJ0XSA9IHJlc3VsdDtcblx0XHRcdC8vIEJhaWwgaWYgd2UgZGlkbid0IGdldCBhIHByb2R1Y3RpdmUgcnVsZSFcblx0XHRcdGlmIChzdGFydCA9PT0gbmV4dFN0YXJ0KSBicmVhaztcblxuXHRcdFx0Ly8gaGFuZGxlIG5ld1Jlc3VsdHMgYXMgYW4gYXJyYXkgb3Igc2luZ2xlIG9iamVjdC5cblx0XHRcdGlmICh0b2tlbnMgIT09IHVuZGVmaW5lZCkgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHRva2Vucyk7XG5cdFx0XHRzdGFydCA9IG5leHRTdGFydDtcblx0XHR9XG5cdFx0cmV0dXJuIFtyZXN1bHRzLCBzdGFydF07XG5cdH0sXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgdG9wLWxldmVsIHRva2VuIGF0IGB0ZXh0W3N0YXJ0XWAuXG4vL1RFU1RNRVxuXHRtYXRjaFRvcFRva2Vucyh0ZXh0LCBzdGFydCwgZW5kKSB7XG5cdFx0cmV0dXJuXHR0aGlzLm1hdGNoV2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0IHx8IHRoaXMubWF0Y2hXb3JkKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaE51bWJlcih0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0IHx8IHRoaXMubWF0Y2hOZXdsaW5lKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaEpTWEVsZW1lbnQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoVGV4dCh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0IHx8IHRoaXMubWF0Y2hDb21tZW50KHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaFN5bWJvbCh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdDtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgU3ltYm9sIGNoYXJhY3RlclxuXHQvL1xuXG5cdC8vIE1hdGNoIHRoZSBzaW5nbGUgXCJzeW1ib2xcIiBjaGFyYWN0ZXIgYXQgYHRleHRbc3RhcnRdYC5cblx0Ly8gTk9URTogVGhpcyBkb2VzIG5vdCBkbyBhbnkgY2hlY2tpbmcsIGl0IGp1c3QgYmxpbmRseSB1c2VzIHRoZSBjaGFyYWN0ZXIgaW4gcXVlc3Rpb24uXG5cdC8vXHRcdCBZb3Ugc2hvdWxkIG1ha2Ugc3VyZSBhbGwgb3RoZXIgcG9zc2libGUgcnVsZXMgaGF2ZSBiZWVuIGV4aGF1c3RlZCBmaXJzdC5cblx0bWF0Y2hTeW1ib2wodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiBbdGV4dFtzdGFydF0sIHN0YXJ0ICsgMV1cblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgV2hpdGVzcGFjZVxuXHQvL1xuXG5cdC8vIFJldHVybiB0aGUgZmlyc3QgY2hhciBwb3NpdGlvbiBhZnRlciBgc3RhcnRgIHdoaWNoIGlzIE5PVCBhIHdoaXRlc3BhY2UgY2hhciAoc3BhY2Ugb3IgdGFiIG9ubHkpLlxuXHQvLyBJZiBgdGV4dFtzdGFydF1gIGlzIG5vdCB3aGl0ZXNwYWNlLCByZXR1cm5zIGBzdGFydGAsXG5cdC8vXHRzbyB5b3UgY2FuIGNhbGwgdGhpcyBhdCBhbnkgdGltZSB0byBza2lwIHdoaXRlc3BhY2UgaW4gdGhlIG91dHB1dC5cblx0ZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gZW5kO1xuXG5cdFx0bGV0IHdoaXRlU3BhY2VFbmQgPSBzdGFydDtcblx0XHR3aGlsZSAod2hpdGVTcGFjZUVuZCA8IGVuZCAmJiAodGV4dFt3aGl0ZVNwYWNlRW5kXSA9PT0gXCIgXCIgfHwgdGV4dFt3aGl0ZVNwYWNlRW5kXSA9PT0gXCJcXHRcIikpIHtcblx0XHRcdHdoaXRlU3BhY2VFbmQrKztcblx0XHR9XG5cdFx0cmV0dXJuIHdoaXRlU3BhY2VFbmQ7XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIFdoaXRlc3BhY2Vcblx0Ly9cdE5PVEU6IFdoaXRlc3BhY2UgYXQgdGhlIGJlZ2lubmluZyBvZiBgdGV4dGAgb3IgdGhlIGJlZ2lubmluZyBvZiBhIGxpbmVcblx0Ly9cdFx0ICBpcyBjb25zaWRlcmVkIGFuIFwiaW5kZW50XCIgYW5kIHdpbGwgaGF2ZSBgLmlzSW5kZW50ID09PSB0cnVlYC5cblx0Ly9cblxuXHQvLyBDb252ZXJ0IGEgcnVuIG9mIHNwYWNlcyBhbmQvb3IgdGFicyBpbnRvIGEgYFRva2VuaXplci5XaGl0ZXNwYWNlYC5cblx0bWF0Y2hXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgd2hpdGVzcGFjZUVuZCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHQvLyBmb3JnZXQgaXQgaWYgbm8gZm9yd2FyZCBtb3Rpb25cblx0XHRpZiAod2hpdGVzcGFjZUVuZCA9PT0gc3RhcnQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgd2hpdGVzcGFjZSA9IHRleHQuc2xpY2Uoc3RhcnQsIHdoaXRlc3BhY2VFbmQpO1xuXHRcdGxldCB0b2tlbjtcblx0XHRpZiAoc3RhcnQgPT09IDAgfHwgdGV4dFtzdGFydC0xXSA9PT0gXCJcXG5cIilcblx0XHRcdHRva2VuID0gbmV3IFRva2VuaXplci5JbmRlbnQod2hpdGVzcGFjZSk7XG5cdFx0ZWxzZVxuXHRcdFx0dG9rZW4gPSBuZXcgVG9rZW5pemVyLldoaXRlc3BhY2Uod2hpdGVzcGFjZSk7XG5cblx0XHRyZXR1cm4gW3Rva2VuLCB3aGl0ZXNwYWNlRW5kXTtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgTmV3bGluZVxuXHQvL1xuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIG5ld2xpbmUgY2hhcmFjdGVyIGF0IGB0ZXh0W3N0YXJ0XWAuXG5cdC8vIFJldHVybnMgYFtUb2tlbml6ZXIuTkVXTElORSwgbmV4dFN0YXJ0XWAgb24gbWF0Y2guXG5cdC8vIE90aGVyd2lzZSByZXR1cm5zIGB1bmRlZmluZWRgLlxuXHRtYXRjaE5ld2xpbmUodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCB8fCB0ZXh0W3N0YXJ0XSAhPT0gXCJcXG5cIikgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiBbVG9rZW5pemVyLk5FV0xJTkUsIHN0YXJ0ICsgMV07XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIFdvcmRcblx0Ly9cblxuXHQvLyBNYXRjaCBhIHNpbmdsZSBgd29yZGAgaW4gYHRleHRgIGF0IGNoYXJhY3RlciBgc3RhcnRgLlxuXHQvLyBSZXR1cm5zIGBbd29yZCwgd29yZEVuZF1gLlxuXHQvLyBSZXR1cm5zIGFuIGVtcHR5IGFycmF5IGlmIGNvdWxkbid0IG1hdGNoIGEgd29yZC5cblx0V09SRF9TVEFSVDogL1tBLVphLXpdLyxcblx0V09SRF9DSEFSIDogL15bXFx3Xy1dLyxcblx0bWF0Y2hXb3JkKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRpZiAoIXRoaXMuV09SRF9TVEFSVC50ZXN0KHRleHRbc3RhcnRdKSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB3b3JkRW5kID0gc3RhcnQgKyAxO1xuXHRcdHdoaWxlICh3b3JkRW5kIDwgZW5kICYmIHRoaXMuV09SRF9DSEFSLnRlc3QodGV4dFt3b3JkRW5kXSkpIHtcblx0XHRcdHdvcmRFbmQrKztcblx0XHR9XG5cdFx0aWYgKHdvcmRFbmQgPT09IHN0YXJ0KSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHdvcmQgPSB0ZXh0LnNsaWNlKHN0YXJ0LCB3b3JkRW5kKTtcblx0XHRyZXR1cm4gW3dvcmQsIHdvcmRFbmRdO1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBOdW1iZXJzXG5cdC8vXG5cblx0Ly8gRWF0IGEgc2luZ2xlIG51bWJlci5cblx0Ly8gUmV0dXJucyBhIGBOdW1iZXJgIGlmIG1hdGNoZWQuXG5cdE5VTUJFUl9TVEFSVDogL1swLTktLl0vLFxuXHROVU1CRVIgOiAvXi0/KFswLTldKlxcLik/WzAtOV0rLyxcblx0bWF0Y2hOdW1iZXIodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGlmICghdGhpcy5OVU1CRVJfU1RBUlQudGVzdCh0ZXh0W3N0YXJ0XSkpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbnVtYmVyTWF0Y2ggPSB0aGlzLm1hdGNoRXhwcmVzc2lvbkF0SGVhZCh0aGlzLk5VTUJFUiwgdGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0aWYgKCFudW1iZXJNYXRjaCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBudW1iZXJTdHIgPSBudW1iZXJNYXRjaFswXTtcblx0XHRsZXQgbnVtYmVyID0gcGFyc2VGbG9hdChudW1iZXJTdHIsIDEwKTtcblx0XHRyZXR1cm4gW251bWJlciwgc3RhcnQgKyBudW1iZXJTdHIubGVuZ3RoXTtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgVGV4dCBsaXRlcmFsXG5cdC8vXG5cblx0Ly8gRWF0IGEgdGV4dCBsaXRlcmFsIChzdGFydHMvZW5kcyB3aXRoIGAnYCBvciBgXCJgKS5cblx0Ly8gUmV0dXJucyBhIGBUb2tlbml6ZXIuVGV4dGAgaWYgbWF0Y2hlZC5cbi8vVEVTVE1FOiAgbm90IHN1cmUgdGhlIGVzY2FwaW5nIGxvZ2ljIGlzIHJlYWxseSByaWdodC4uLlxuXHRtYXRjaFRleHQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBxdW90ZVN5bWJvbCA9IHRleHRbc3RhcnRdO1xuXHRcdGlmIChxdW90ZVN5bWJvbCAhPT0gJ1wiJyAmJiBxdW90ZVN5bWJvbCAhPT0gXCInXCIpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgdGV4dEVuZCA9IHN0YXJ0ICsgMTtcblx0XHR3aGlsZSAodGV4dEVuZCA8IGVuZCkge1xuXHRcdFx0bGV0IGNoYXIgPSB0ZXh0W3RleHRFbmRdO1xuXHRcdFx0aWYgKGNoYXIgPT09IHF1b3RlU3ltYm9sKSBicmVhaztcblx0XHRcdC8vIGlmIHdlIGdldCBhIGJhY2txdW90ZSwgaWdub3JlIHF1b3RlIGluIG5leHQgY2hhclxuXHRcdFx0aWYgKGNoYXIgPT09IFwiXFxcXFwiICYmIHRleHRbdGV4dEVuZCArIDFdID09PSBxdW90ZVN5bWJvbCkgdGV4dEVuZCsrO1xuXHRcdFx0dGV4dEVuZCsrO1xuXHRcdH1cblx0XHQvLyBGb3JnZXQgaXQgaWYgd2UgZGlkbid0IGVuZCB3aXRoIHRoZSBxdW90ZSBzeW1ib2xcblx0XHRpZiAodGV4dFt0ZXh0RW5kXSAhPT0gcXVvdGVTeW1ib2wpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0Ly8gYWR2YW5jZSBwYXN0IGVuZCBxdW90ZVxuXHRcdHRleHRFbmQrKztcblxuXHRcdGxldCBxdW90ZWRTdHJpbmcgPSB0ZXh0LnNsaWNlKHN0YXJ0LCB0ZXh0RW5kKTtcblx0XHRsZXQgdG9rZW4gPSBuZXcgVG9rZW5pemVyLlRleHQocXVvdGVkU3RyaW5nKTtcblx0XHRyZXR1cm4gW3Rva2VuLCB0ZXh0RW5kXTtcblx0fSxcblxuXHQvLyBgVGV4dGAgY2xhc3MgZm9yIHN0cmluZyBsaXRlcmFscy5cblx0Ly8gUGFzcyB0aGUgbGl0ZXJhbCB2YWx1ZSwgdXNlIGAudGV4dGAgdG8gZ2V0IGp1c3QgdGhlIGJpdCBpbnNpZGUgdGhlIHF1b3Rlcy5cblx0VGV4dCA6IGNsYXNzIHRleHQge1xuXHRcdGNvbnN0cnVjdG9yKHF1b3RlZFN0cmluZykge1xuXHRcdFx0dGhpcy5xdW90ZWRTdHJpbmcgPSBxdW90ZWRTdHJpbmc7XG5cdFx0fVxuXHRcdGdldCB0ZXh0KCkge1xuXHRcdFx0bGV0IHN0cmluZyA9IHRoaXMucXVvdGVkU3RyaW5nO1xuXHRcdFx0Ly8gY2FsY3VsYXRlIGB0ZXh0YCBhcyB0aGUgYml0cyBiZXR3ZWVuIHRoZSBxdW90ZXMuXG5cdFx0XHRsZXQgc3RhcnQgPSAwO1xuXHRcdFx0bGV0IGVuZCA9IHN0cmluZy5sZW5ndGg7XG5cdFx0XHRpZiAoc3RyaW5nW3N0YXJ0XSA9PT0gJ1wiJyB8fCBzdHJpbmdbc3RhcnRdID09PSBcIidcIikgc3RhcnQgPSAxO1xuXHRcdFx0aWYgKHN0cmluZ1tlbmQtMV0gPT09ICdcIicgfHwgc3RyaW5nW2VuZC0xXSA9PT0gXCInXCIpIGVuZCA9IC0xO1xuXHRcdFx0cmV0dXJuIHN0cmluZy5zbGljZShzdGFydCwgZW5kKTtcblx0XHR9XG5cdFx0dG9TdHJpbmcoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5xdW90ZWRTdHJpbmc7XG5cdFx0fVxuXHR9LFxuXG5cdC8vXG5cdC8vXHQjIyMgQ29tbWVudHNcblx0Ly9cblxuXHQvLyBFYXQgYSBjb21tZW50ICh1bnRpbCB0aGUgZW5kIG9mIHRoZSBsaW5lKS5cblx0Ly8gUmV0dXJucyBhIGBUb2tlbml6ZXIuQ29tbWVudGAgaWYgbWF0Y2hlZC5cblx0Q09NTUVOVCA6IC9eKCMjK3wtLSt8XFwvXFwvKykoXFxzKikoLiopLyxcblx0bWF0Y2hDb21tZW50KHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgY29tbWVudFN0YXJ0ID0gdGV4dC5zbGljZShzdGFydCwgc3RhcnQgKyAyKTtcblx0XHRpZiAoY29tbWVudFN0YXJ0ICE9PSBcIi0tXCIgJiYgY29tbWVudFN0YXJ0ICE9PSBcIlxcL1xcL1wiICYmIGNvbW1lbnRTdGFydCAhPT0gXCIjI1wiKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gY29tbWVudCBlYXRzIHVudGlsIHRoZSBlbmQgb2YgdGhlIGxpbmVcblx0XHRsZXQgbGluZSA9IHRoaXMuZ2V0TGluZUF0SGVhZCh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRsZXQgY29tbWVudE1hdGNoID0gbGluZS5tYXRjaCh0aGlzLkNPTU1FTlQpXG5cdFx0aWYgKCFjb21tZW50TWF0Y2gpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgW21hdGNoLCBjb21tZW50U3ltYm9sLCB3aGl0ZXNwYWNlLCBjb21tZW50XSA9IGNvbW1lbnRNYXRjaDtcblx0XHRsZXQgdG9rZW4gPSBuZXcgVG9rZW5pemVyLkNvbW1lbnQoeyBjb21tZW50U3ltYm9sLCB3aGl0ZXNwYWNlLCBjb21tZW50IH0pO1xuXHRcdHJldHVybiBbdG9rZW4sIHN0YXJ0ICsgbGluZS5sZW5ndGhdO1xuXHR9LFxuXG5cdC8vIENvbW1lbnQgY2xhc3Ncbi8vVEVTVE1FXG5cdENvbW1lbnQgOiBjbGFzcyBjb21tZW50IHtcblx0XHRjb25zdHJ1Y3RvciAocHJvcHMpIHtcblx0XHRcdE9iamVjdC5hc3NpZ24odGhpcywgcHJvcHMpO1xuXHRcdH1cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdHJldHVybiBgJHt0aGlzLmNvbW1lbnRTeW1ib2x9JHt0aGlzLndoaXRlc3BhY2V9JHt0aGlzLmNvbW1lbnR9YDtcblx0XHR9XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIEpTWFxuXHQvL1xuXG5cdC8vIEVhdCBhIChuZXN0ZWQpIEpTWCBleHByZXNzaW9uLlxuLy9URVNUTUVcblx0bWF0Y2hKU1hFbGVtZW50KHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgW2pzeEVsZW1lbnQsIG5leHRTdGFydF0gPSB0aGlzLm1hdGNoSlNYU3RhcnRUYWcodGV4dCwgc3RhcnQsIGVuZCkgfHwgW107XG5cdFx0aWYgKCFqc3hFbGVtZW50KSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0aWYgKCFqc3hFbGVtZW50LmlzVW5hcnlUYWcpIHtcblx0XHRcdGxldCBbY2hpbGRyZW4sIGNoaWxkRW5kXSA9IHRoaXMubWF0Y2hKU1hDaGlsZHJlbihqc3hFbGVtZW50LnRhZ05hbWUsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRcdGlmIChjaGlsZHJlbi5sZW5ndGgpIHtcblx0XHRcdFx0anN4RWxlbWVudC5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuXHRcdFx0XHRuZXh0U3RhcnQgPSBjaGlsZEVuZDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gW2pzeEVsZW1lbnQsIG5leHRTdGFydF07XG5cdH0sXG5cblx0Ly8gTWF0Y2ggSlNYIHN0YXJ0IHRhZyBhbmQgaW50ZXJuYWwgZWxlbWVudHMgKGJ1dCBOT1QgY2hpbGRyZW4pLlxuXHQvLyBSZXR1cm5zIGBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XWAgb3IgYHVuZGVmaW5lZGAuXG5cdC8vIFVzZSBgbWF0Y2hKU1hFbGVtZW50KClgIHRvIG1hdGNoIGNoaWxkcmVuLCBlbmQgdGFnLCBldGMuXG5cdC8vIElnbm9yZXMgbGVhZGluZyB3aGl0ZXNwYWNlLlxuXHRKU1hfVEFHX1NUQVJUIDogL148KFtBLVphLXpdW1xcdy1cXC5dKikoXFxzKlxcLz58XFxzKj58XFxzKykvLFxuLy8gVE9ETzogY2xlYW4gdGhpcyBzdHVmZiB1cCwgbWF5YmUgd2l0aCBmaW5kRmlyc3RBdEhlYWQ/XG5cdG1hdGNoSlNYU3RhcnRUYWcodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBuZXh0U3RhcnQgPSB0aGlzLmVhdFdoaXRlc3BhY2UodGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0Ly8gTWFrZSBzdXJlIHdlIHN0YXJ0IHdpdGggYDxgLlxuXHRcdGlmICh0ZXh0W25leHRTdGFydF0gIT09IFwiPFwiKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHRhZ01hdGNoID0gdGhpcy5tYXRjaEV4cHJlc3Npb25BdEhlYWQodGhpcy5KU1hfVEFHX1NUQVJULCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0aWYgKCF0YWdNYXRjaCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBbIG1hdGNoVGV4dCwgdGFnTmFtZSwgZW5kQml0IF0gPSB0YWdNYXRjaDtcblx0XHRsZXQganN4RWxlbWVudCA9IG5ldyBUb2tlbml6ZXIuSlNYRWxlbWVudCh0YWdOYW1lKTtcblx0XHRuZXh0U3RhcnQgPSBuZXh0U3RhcnQgKyBtYXRjaFRleHQubGVuZ3RoO1xuXG5cdFx0Ly8gSWYgdW5hcnkgdGFnLCBtYXJrIGFzIHN1Y2ggYW5kIHJldHVybi5cblx0XHRlbmRCaXQgPSBlbmRCaXQudHJpbSgpO1xuXHRcdGlmIChlbmRCaXQgPT09IFwiLz5cIikge1xuXHRcdFx0anN4RWxlbWVudC5pc1VuYXJ5VGFnID0gdHJ1ZTtcblx0XHRcdHJldHVybiBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XTtcblx0XHR9XG5cblx0XHQvLyBJZiB3ZSBkaWRuJ3QgaW1tZWRpYXRlbHkgZ2V0IGFuIGVuZCBtYXJrZXIsIGF0dGVtcHQgdG8gbWF0Y2ggYXR0cmlidXRlc1xuXHRcdGlmIChlbmRCaXQgIT09IFwiPlwiICYmIGVuZEJpdCAhPT0gXCIvPlwiKSB7XG5cdFx0XHRsZXQgWyBhdHRycywgYXR0ckVuZCBdID0gdGhpcy5lYXRUb2tlbnModGhpcy5tYXRjaEpTWEF0dHJpYnV0ZSwgdGV4dCwgbmV4dFN0YXJ0LCBlbmQpO1xuXHRcdFx0anN4RWxlbWVudC5hdHRyaWJ1dGVzID0gYXR0cnM7XG5cdFx0XHRuZXh0U3RhcnQgPSBhdHRyRW5kO1xuXHRcdH1cblxuXHRcdC8vIGF0IHRoaXMgcG9pbnQgd2Ugc2hvdWxkIGdldCBhbiBgLz5gIG9yIGA+YCAod2l0aCBubyB3aGl0ZXNwYWNlKS5cblx0XHRpZiAodGV4dFtuZXh0U3RhcnRdID09PSBcIi9cIiAmJiB0ZXh0W25leHRTdGFydCArIDFdID09PSBcIj5cIikge1xuXHRcdFx0ZW5kQml0ID0gXCIvPlwiO1xuXHRcdFx0bmV4dFN0YXJ0ICs9IDI7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKHRleHRbbmV4dFN0YXJ0XSA9PT0gXCI+XCIpIHtcblx0XHRcdGVuZEJpdCA9IHRleHRbbmV4dFN0YXJ0XTtcblx0XHRcdG5leHRTdGFydCArPSAxO1xuXHRcdH1cblxuXHRcdC8vIFJldHVybiBpbW1lZGlhdGVseSBmb3IgdW5hcnkgdGFnXG5cdFx0aWYgKGVuZEJpdCA9PT0gXCIvPlwiKSB7XG5cdFx0XHRqc3hFbGVtZW50LmlzVW5hcnlUYWcgPSB0cnVlO1xuXHRcdFx0cmV0dXJuIFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdO1xuXHRcdH1cblxuXHRcdC8vIGFkdmFuY2UgcGFzdCBgPmBcblx0XHRpZiAoZW5kQml0ICE9PSBcIj5cIikge1xuXHRcdFx0aWYgKFRva2VuaXplci5XQVJOKSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihcIk1pc3NpbmcgZXhwZWN0ZWQgZW5kIGA+YCBmb3IganN4RWxlbWVudFwiLCBqc3hFbGVtZW50LCBcImBcIit0ZXh0LnNsaWNlKHN0YXJ0LCBuZXh0U3RhcnQpK1wiYFwiKTtcblx0XHRcdH1cblx0XHRcdGpzeEVsZW1lbnQuZXJyb3IgPSBcIk5vIGVuZCA+XCI7XG5cdFx0XHRyZXR1cm4gW2pzeEVsZW1lbnQsIG5leHRTdGFydF07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdO1xuXHR9LFxuXG5cblx0Ly8gSlNYIGVsZW1lbnQgY2xhc3Ncblx0SlNYRWxlbWVudCA6IGNsYXNzIGpzeEVsZW1lbnQge1xuXHRcdGNvbnN0cnVjdG9yKHRhZ05hbWUsIGF0dHJpYnV0ZXMsIGNoaWxkcmVuKSB7XG5cdFx0XHR0aGlzLnRhZ05hbWUgPSB0YWdOYW1lO1xuXHRcdFx0aWYgKGF0dHJpYnV0ZXMpIHRoaXMuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG5cdFx0XHRpZiAoY2hpbGRyZW4pIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcblx0XHR9XG5cblx0XHQvLyBSZXR1cm4gYXR0cmlidXRlcyBhcyBhIG1hcC5cbi8vVEVTVE1FXG5cdFx0Z2V0IGF0dHJzKCkge1xuXHRcdFx0bGV0IGF0dHJzID0ge307XG5cdFx0XHRpZiAodGhpcy5hdHRyaWJ1dGVzKSB0aGlzLmF0dHJpYnV0ZXMuZm9yRWFjaChhdHRyID0+IHtcblx0XHRcdFx0Ly8gaWdub3JlIHVubmFtZWQgYXR0cmlidXRlc1xuXHRcdFx0XHRpZiAoYXR0ci5uYW1lKSBhdHRyc1thdHRyLm5hbWVdID0gYXR0ci52YWx1ZVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gYXR0cnM7XG5cdFx0fVxuXG5cdFx0Ly8gUmV0dXJuIG91ciBhdHRyaWJ1dGVzIGFzIGEgc3RyaW5nXG4vL1RFU1RNRVxuXHRcdGdldCBhdHRyc0FzU3RyaW5nKCkge1xuXHRcdFx0aWYgKCF0aGlzLmF0dHJpYnV0ZXMpIHJldHVybiBcIlwiO1xuXHRcdFx0cmV0dXJuIFwiIFwiICsgdGhpcy5hdHRyaWJ1dGVzLm1hcCggKHsgbmFtZSwgdmFsdWUgfSkgPT4ge1xuXHRcdFx0XHRpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuIG5hbWU7XG5cdFx0XHRcdC8vIGNvbnZlcnQgdmFsdWUgYXJyYXkgKHRva2VucykgdG8gc3RyaW5nXG5cdFx0XHRcdC8vIFRPRE86IHRoaXMgd2lsbCB3YW50IHRvIGJlIHNtYXJ0ZXIuLi5cblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB2YWx1ZSA9IGB7JHt2YWx1ZS5qb2luKFwiIFwiKX19YDtcblx0XHRcdFx0cmV0dXJuIGBuYW1lPSR7dmFsdWV9YDtcblx0XHRcdH0pLmpvaW4oXCIgXCIpO1xuXHRcdH1cblxuXHRcdC8vIFJldHVybiBvdXIgY2hpbGRyZW4gYXMgYSBzdHJpbmcuXG4vL1RFU1RNRVxuXHRcdGdldCBjaGlsZHJlbkFzU3RyaW5nKCkge1xuXHRcdFx0aWYgKCF0aGlzLmNoaWxkcmVuKSByZXR1cm4gXCJcIjtcblx0XHRcdHJldHVybiB0aGlzLmNoaWxkcmVuLm1hcChjaGlsZCA9PiB7XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KGNoaWxkKSkgcmV0dXJuIGB7JHtjaGlsZC5qb2luKFwiIFwiKX19YDtcblx0XHRcdFx0cmV0dXJuIFwiXCIgKyBjaGlsZDtcblx0XHRcdH0pLmpvaW4oXCJcIik7XG5cdFx0fVxuXG5cdFx0dG9TdHJpbmcoKSB7XG5cdFx0XHRsZXQgYXR0cnMgPSB0aGlzLmF0dHJzQXNTdHJpbmc7XG5cdFx0XHRsZXQgY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuQXNTdHJpbmc7XG5cdFx0XHRpZiAodGhpcy5pc1VuYXJ5VGFnKSByZXR1cm4gYDwke3RoaXMudGFnTmFtZX0ke2F0dHJzfS8+YDtcblx0XHRcdHJldHVybiBgPCR7dGhpcy50YWdOYW1lfSR7YXR0cnN9PiR7Y2hpbGRyZW59PC8ke3RoaXMudGFnTmFtZX0+YDtcblx0XHR9XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIEpTWCBjaGlsZHJlblxuXHQvL1xuXG5cdC8vIE1hdGNoIEpTWCBlbGVtZW50IGNoaWxkcmVuIG9mIGA8dGFnTmFtZT5gIGF0IGB0ZXh0W3N0YXJ0XWAuXG5cdC8vIE1hdGNoZXMgbmVzdGVkIGNoaWxkcmVuIGFuZCBzdG9wcyBhZnRlciBtYXRjaGluZyBlbmQgdGFnOiBgPC90YWdOYW1lPmAuXG5cdC8vIFJldHVybnMgYFtjaGlsZHJlbiwgbmV4dFN0YXJ0XWAuXG4vL1RFU1RNRVxuXHRtYXRjaEpTWENoaWxkcmVuKHRhZ05hbWUsIHRleHQsIHN0YXJ0LCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBjaGlsZHJlbiA9IFtdO1xuXHRcdGxldCBuZXN0aW5nID0gMTtcblx0XHRsZXQgZW5kVGFnID0gYDwvJHt0YWdOYW1lfT5gO1xuXG5cdFx0bGV0IG5leHRTdGFydCA9IHN0YXJ0O1xuXHRcdHdoaWxlKHRydWUpIHtcblx0XHRcdGxldCByZXN1bHQgPSB0aGlzLm1hdGNoSlNYQ2hpbGQoZW5kVGFnLCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0XHRpZiAoIXJlc3VsdCkgYnJlYWs7XG5cblx0XHRcdGxldCBbY2hpbGQsIGNoaWxkRW5kXSA9IHJlc3VsdDtcblx0XHRcdG5leHRTdGFydCA9IGNoaWxkRW5kO1xuXHRcdFx0Ly8gSWYgd2UgZ290IHRoZSBlbmRUYWcsIHVwZGF0ZSBuZXN0aW5nIGFuZCBicmVhayBvdXQgb2YgbG9vcCBpZiBuZXN0aW5nICE9PSAwXG5cdFx0XHRpZiAoY2hpbGQgPT09IGVuZFRhZykge1xuXHRcdFx0XHRuZXN0aW5nIC0tO1xuXHRcdFx0XHRpZiAobmVzdGluZyA9PT0gMCkgYnJlYWs7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmIChjaGlsZCkgY2hpbGRyZW4ucHVzaChjaGlsZCk7XG5cdFx0XHR9XG5cdFx0fVxuLy8gVE9ETzogaG93IHRvIHN1cmZhY2UgdGhpcyBlcnJvcj8/P1xuXHRcdGlmIChuZXN0aW5nICE9PSAwKSB7XG5cdFx0XHRpZiAoVG9rZW5pemVyLldBUk4pIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKGBtYXRjaEpTWENoaWxkcmVuKCR7dGV4dC5zbGljZShzdGFydCwgbmV4dFN0YXJ0ICsgMTApfTogZGlkbid0IG1hdGNoIGVuZCBjaGlsZCFgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIFtjaGlsZHJlbiwgbmV4dFN0YXJ0XTtcblx0fSxcblxuXHQvLyBNYXRjaCBhIHNpbmdsZSBKU1ggY2hpbGQ6XG5cdC8vXHQtIGN1cnJlbnQgZW5kVGFnXG5cdC8vXHQtIGB7IGpzeCBleHByZXNzaW9uIH1gXG5cdC8vXHQtIG5lc3RlZCBKU1ggZWxlbWVudFxuXHQvL1x0LSAoYW55dGhpbmcgZWxzZSkgYXMganN4VGV4dCBleHByZXNzaW9uLlxuXHRtYXRjaEpTWENoaWxkKGVuZFRhZywgdGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaEpTWEVuZFRhZyhlbmRUYWcsIHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoSlNYRXhwcmVzc2lvbih0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0fHwgdGhpcy5tYXRjaEpTWEVsZW1lbnQodGV4dCwgc3RhcnQsIGVuZClcbi8vIFRPRE86IG5ld2xpbmUgYW5kIGluZGVudD9cblx0XHRcdHx8IHRoaXMubWF0Y2hKU1hUZXh0KHRleHQsIHN0YXJ0LCBlbmQpO1xuXHR9LFxuXG5cdC8vIEF0dGVtcHQgdG8gbWF0Y2ggYSBzcGVjaWZpYyBlbmQgdGFnLlxuXHQvLyBJZ25vcmVzIGxlYWRpbmcgd2hpdGVzcGFjZS5cblx0bWF0Y2hKU1hFbmRUYWcoZW5kVGFnLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG5leHRTdGFydCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRpZiAoIXRoaXMubWF0Y2hTdHJpbmdBdEhlYWQoZW5kVGFnLCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCkpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIFtlbmRUYWcsIG5leHRTdGFydCArIGVuZFRhZy5sZW5ndGhdO1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBKU1ggYXR0cmlidXRlc1xuXHQvL1xuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIEpTWCBlbGVtZW50IGF0dHJpYnV0ZSBhcyBgPGF0dHI+PXs8dmFsdWU+fWBcbi8vIFRPRE86IHsuLi54eHh9XG5cdEpTWF9BVFRSSUJVVEVfU1RBUlQgOiAvXlxccyooW1xcdy1dK1xcYilcXHMqKD0/KVxccyovLFxuXHRtYXRjaEpTWEF0dHJpYnV0ZSh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gYXR0cmlidXRlcyBtdXN0IHN0YXJ0IHdpdGggYSB3b3JkIGNoYXJhY3RlclxuXHRcdGlmICghdGhpcy5XT1JEX1NUQVJULnRlc3QodGV4dFtzdGFydF0pKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gYXR0ZW1wdCB0byBtYXRjaCBhbiBhdHRyaWJ1dGUgbmFtZSwgaW5jbHVkaW5nIGA9YCBpZiBwcmVzZW50LlxuXHRcdGxldCByZXN1bHQgPSB0aGlzLm1hdGNoRXhwcmVzc2lvbkF0SGVhZCh0aGlzLkpTWF9BVFRSSUJVVEVfU1RBUlQsIHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGlmICghcmVzdWx0KSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IFsgbWF0Y2gsIG5hbWUsIGVxdWFscyBdID0gcmVzdWx0O1xuXHRcdGxldCBuZXh0U3RhcnQgPSBzdGFydCArIG1hdGNoLmxlbmd0aDtcblx0XHRsZXQgYXR0cmlidXRlID0gbmV3IFRva2VuaXplci5KU1hBdHRyaWJ1dGUobmFtZSk7XG5cblx0XHQvLyBpZiB0aGVyZSB3YXMgYW4gZXF1YWxzIGNoYXIsIHBhcnNlIHRoZSB2YWx1ZVxuXHRcdGlmIChlcXVhbHMpIHtcblx0XHRcdGxldCBbdmFsdWUsIHZhbHVlRW5kXSA9IHRoaXMubWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZSh0ZXh0LCBuZXh0U3RhcnQsIGVuZCkgfHwgW107XG5cdFx0XHRpZiAodmFsdWUpIHtcblx0XHRcdFx0YXR0cmlidXRlLnZhbHVlID0gdmFsdWU7XG5cdFx0XHRcdG5leHRTdGFydCA9IHZhbHVlRW5kO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBlYXQgd2hpdGVzcGFjZSBiZWZvcmUgdGhlIG5leHQgYXR0cmlidXRlIC8gdGFnIGVuZFxuXHRcdG5leHRTdGFydCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0cmV0dXJuIFthdHRyaWJ1dGUsIG5leHRTdGFydF07XG5cdH0sXG5cblx0Ly8gTWF0Y2ggYSB2YWx1ZSBleHByZXNzaW9uIGZvciBhIEpTWCBlbGVtZW50IGF0dHJpYnV0ZTpcblx0Ly8gTk9URTogd2Ugd2lsbCBiZSBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGA9YCAoYW5kIHN1YnNlcXVlbnQgd2hpdGVzcGFjZSkuXG5cdG1hdGNoSlNYQXR0cmlidXRlVmFsdWUodGV4dCwgc3RhcnQsIGVuZCkge1xuXHRcdHJldHVybiB0aGlzLm1hdGNoVGV4dCh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0fHwgdGhpcy5tYXRjaEpTWEV4cHJlc3Npb24odGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hKU1hFbGVtZW50KHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoSlNYQXR0cmlidXRlVmFsdWVJZGVudGlmaWVyKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoTnVtYmVyKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0O1xuXHR9LFxuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIGlkZW50aWZlciBhcyBhIEpTWCBhdHRyaWJ1dGUgdmFsdWUuXG5cdC8vIFJldHVybnMgYXMgYSBgSlNYRXhwcmVzc2lvbmAuXG5cdG1hdGNoSlNYQXR0cmlidXRlVmFsdWVJZGVudGlmaWVyKHRleHQsIHN0YXJ0LCBlbmQpIHtcblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5tYXRjaFdvcmQodGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0aWYgKCFyZXN1bHQpIHJldHVybjtcblxuXHRcdGxldCBbIHdvcmQsIG5leHRTdGFydCBdID0gcmVzdWx0O1xuXHRcdGxldCB0b2tlbiA9IG5ldyBUb2tlbml6ZXIuSlNYRXhwcmVzc2lvbih3b3JkKTtcblx0XHRyZXR1cm4gW3Rva2VuLCBuZXh0U3RhcnRdO1xuXHR9LFxuXG5cdC8vIEpTWCBhdHRyaWJ1dGUgY2xhc3Ncblx0Ly8gYG5hbWVgIGlzIHRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUuXG5cdC8vIGB2YWx1ZWAgaXMgb25lIG9mOlxuXHQvL1x0XHQtIGAnLi4uJ2BcdFx0XHQvLyBUZXh0IChsaXRlcmFsIHN0cmluZykuXG5cdC8vXHRcdC0gYFwiLi4uXCJgXHRcdFx0Ly8gVGV4dCAobGl0ZXJhbCBzdHJpbmcpLlxuXHQvL1x0XHQtIGB7Li4ufWBcdFx0XHQvLyBFeHByZXNzaW9uLiAgUmVzdWx0cyB3aWxsIGJlIHRva2VuaXplZCBhcnJheS5cblx0Ly9cdFx0LSBgPC4uLi4+YFx0XHRcdC8vIEpTWCBlbGVtZW50LlxuXHQvL1x0XHQtIGAxYFx0XHRcdFx0Ly8gTnVtYmVyLiAgTm90ZTogdGhpcyBpcyBhbiBleHRlbnNpb24gdG8gSlNYLlxuXG5cdEpTWEF0dHJpYnV0ZSA6IGNsYXNzIGpzeEF0dHJpYnV0ZSB7XG5cdFx0Y29uc3RydWN0b3IobmFtZSwgdmFsdWUpIHtcblx0XHRcdHRoaXMubmFtZSA9IG5hbWU7XG5cdFx0XHRpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkgdGhpcy52YWx1ZSA9IHZhbHVlO1xuXHRcdH1cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdGlmICh0aGlzLnZhbHVlID09PSB1bmRlZmluZWQpIHJldHVybiB0aGlzLm5hbWU7XG5cdFx0XHRyZXR1cm4gYCR7dGhpcy5uYW1lfT17JHt0aGlzLnZhbHVlfX1gO1xuXHRcdH1cblx0fSxcblxuXG5cdC8vIE1hdGNoIGEgSlNYIGV4cHJlc3Npb24gZW5jbG9zZWQgaW4gY3VybHkgYnJhY2VzLCBlZzogIGB7IC4uLiB9YC5cblx0Ly8gIEhhbmRsZXMgbmVzdGVkIGN1cmxpZXMsIHF1b3RlcywgZXRjLlxuXHQvLyBSZXR1cm5zIGFycmF5IG9mIHRva2VucyBvZiBpbnRlcm5hbCBtYXRjaC5cblx0Ly8gSWdub3JlcyBsZWFkaW5nIHdoaXRlc3BhY2UuXG4vL1RPRE86IG5ld2xpbmVzL2luZGVudHM/Pz9cbi8vVE9ETzogey4uLnh4eH1cbi8vVEVTVE1FXG5cdG1hdGNoSlNYRXhwcmVzc2lvbih0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG5leHRTdGFydCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRsZXQgZW5kSW5kZXggPSB0aGlzLmZpbmRNYXRjaGluZ0F0SGVhZChcIntcIiwgXCJ9XCIsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRpZiAoZW5kSW5kZXggPT09IHVuZGVmaW5lZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIEdldCBjb250ZW50cywgaW5jbHVkaW5nIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UuXG5cdFx0bGV0IGNvbnRlbnRzID0gdGV4dC5zbGljZShzdGFydCArIDEsIGVuZEluZGV4KTtcblxuXHRcdC8vIHJldHVybiBhIG5ldyBKU1hFeHByZXNzaW9uLCBhZHZhbmNpbmcgYmV5b25kIHRoZSBlbmRpbmcgYH1gLlxuXHRcdGxldCBleHByZXNzaW9uID0gbmV3IFRva2VuaXplci5KU1hFeHByZXNzaW9uKGNvbnRlbnRzKTtcblx0XHRyZXR1cm4gW2V4cHJlc3Npb24sIGVuZEluZGV4ICsgMV07XG5cdH0sXG5cblx0Ly8gSlNYIGV4cHJlc3Npb24sIGNvbXBvc2VkIG9mIGlubGluZSB0b2tlbnMgd2hpY2ggc2hvdWxkIHlpZWxkIGFuIGBleHByZXNzaW9uYC5cblx0SlNYRXhwcmVzc2lvbiA6IGNsYXNzIGpzeEV4cHJlc3Npb24ge1xuXHRcdGNvbnN0cnVjdG9yKGNvbnRlbnRzKSB7XG5cdFx0XHR0aGlzLmNvbnRlbnRzID0gY29udGVudHMgfHwgXCJcIjtcblx0XHR9XG5cdFx0Ly8gRGl2aWRlIGNvbnRlbnRzIGludG8gYHRva2Vuc2AuXG5cdFx0Z2V0IHRva2VucygpIHtcblx0XHRcdHJldHVybiBUb2tlbml6ZXIudG9rZW5pemUodGhpcy5jb250ZW50cy50cmltKCkpO1xuXHRcdH1cblx0fSxcblxuXHQvLyBNYXRjaCBKU1hUZXh0IHVudGlsIHRoZSBvbmUgb2YgYHtgLCBgPGAsIGA+YCBvciBgfWAuXG5cdC8vIE5PVEU6IElOQ0xVREVTIGxlYWRpbmcgLyB0cmFpbGluZyB3aGl0ZXNwYWNlLlxuXHRKU1hfVEVYVF9FTkRfQ0hBUlMgOiBbXCJ7XCIsIFwiPFwiLCBcIj5cIiwgXCJ9XCJdLFxuLy9URVNUTUVcblx0bWF0Y2hKU1hUZXh0KHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyB0ZW1wb3JhcmlseSBhZHZhbmNlIHBhc3Qgd2hpdGVzcGFjZSAod2UnbGwgaW5jbHVkZSBpdCBpbiB0aGUgb3V0cHV0KS5cblx0XHRsZXQgbmV4dFN0YXJ0ID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGxldCBlbmRJbmRleCA9IHRoaXMuZmluZEZpcnN0QXRIZWFkKHRoaXMuSlNYX1RFWFRfRU5EX0NIQVJTLCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0Ly8gSWYgdGhlIGZpcnN0IG5vbi13aGl0ZXNwYWNlIGNoYXIgaXMgaW4gb3VyIEVORF9DSEFSUywgZm9yZ2V0IGl0LlxuXHRcdGlmIChlbmRJbmRleCA9PT0gbmV4dFN0YXJ0KSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gaWYgbm8gbWF0Y2gsIHdlJ3ZlIGdvdCBzb21lIHNvcnQgb2YgZXJyb3Jcblx0XHRpZiAoZW5kSW5kZXggPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYgKFRva2VuaXplci5XQVJOKSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihcIm1hdGNoSlNYVGV4dChcIit0ZXh0LnNsaWNlKHN0YXJ0LCBzdGFydCArIDUwKStcIik6IEpTWCBzZWVtcyB0byBiZSB1bmJhbGFuY2VkLlwiKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Ly8gaW5jbHVkZSBsZWFkaW5nIHdoaXRlc3BhY2UgaW4gdGhlIG91dHB1dC5cblx0XHRsZXQganN4VGV4dCA9IHRleHQuc2xpY2Uoc3RhcnQsIGVuZEluZGV4KTtcblx0XHRyZXR1cm4gW2pzeFRleHQsIGVuZEluZGV4XTtcblx0fSxcblxuXG5cblxuXHQvL1xuXHQvL1x0IyMgVXRpbGl0eSBmdW5jdGlvbnNcblx0Ly9cblxuXHQvLyBSZXR1cm4gY2hhcmFjdGVycyB1cCB0bywgYnV0IG5vdCBpbmNsdWRpbmcsIHRoZSBuZXh0IG5ld2xpbmUgY2hhciBhZnRlciBgc3RhcnRgLlxuXHQvLyBJZiBgc3RhcnRgIGlzIGEgbmV3bGluZSBjaGFyIG9yIHN0YXJ0ID49IGVuZCwgcmV0dXJucyBlbXB0eSBzdHJpbmcuXG5cdC8vIElmIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZyAoZWc6IG5vIG1vcmUgbmV3bGluZXMpLCByZXR1cm5zIGZyb20gc3RhcnQgdG8gZW5kLlxuLy9URVNUTUVcblx0Z2V0TGluZUF0SGVhZCh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gXCJcIjtcblxuXHRcdGxldCBuZXdsaW5lID0gdGV4dC5pbmRleE9mKFwiXFxuXCIsIHN0YXJ0KTtcblx0XHRpZiAobmV3bGluZSA9PT0gLTEgfHwgbmV3bGluZSA+IGVuZCkgbmV3bGluZSA9IGVuZDtcblx0XHRyZXR1cm4gdGV4dC5zbGljZShzdGFydCwgbmV3bGluZSk7XG5cdH0sXG5cblx0Ly8gTWF0Y2ggYSBtdWx0aS1jaGFyIHN0cmluZyBzdGFydGluZyBhdCBgdGV4dFtzdGFydF1gLlxuLy9URVNUTUVcblx0bWF0Y2hTdHJpbmdBdEhlYWQoc3RyaW5nLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHN0cmluZ0VuZCA9IHN0YXJ0ICsgc3RyaW5nLmxlbmd0aDtcblx0XHRpZiAoc3RyaW5nRW5kID4gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdHJldHVybiBzdHJpbmcgPT09IHRleHQuc2xpY2Uoc3RhcnQsIHN0cmluZ0VuZCk7XG5cdH0sXG5cblxuXHQvLyBNYXRjaCBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBzdGFydGluZyBhdCBgdGV4dFtzdGFydF1gLCByZXR1cm5pbmcgdGhlIG1hdGNoLlxuXHQvLyBSZXR1cm5zIGBudWxsYCBpZiBubyBtYXRjaC5cblx0Ly9cblx0Ly8gTk9URTogVGhlIGV4cHJlc3Npb24gTVVTVCBzdGFydCB3aXRoIGAvXi4uLi9gXG4vL1RFU1RNRVxuXHRtYXRjaEV4cHJlc3Npb25BdEhlYWQoZXhwcmVzc2lvbiwgdGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBoZWFkID0gdGV4dC5zbGljZShzdGFydCwgZW5kKTtcblx0XHRyZXR1cm4gaGVhZC5tYXRjaChleHByZXNzaW9uKTtcblx0fSxcblxuXHQvLyBGaW5kIGluZGV4IG9mIHRoZSBtYXRjaGluZyBTSU5HTEUgQ0hBUkFDVEVSIGBlbmREZWxpbWl0ZXJgIHRvIG1hdGNoIGBzdGFydERlbGltaXRlcmAuXG5cdC8vIE1hdGNoZXMgbmVzdGVkIGRlbGltaXRlcnMgYW5kIGhhbmRsZXMgZXNjYXBlZCBkZWxpbWl0ZXJzLlxuXHQvLyBBc3N1bWVzIGB0ZXh0W3N0YXJ0XWAgaXMgdGhlIHN0YXJ0RGVsaW1pdGVyIVxuXHQvLyBSZXR1cm5zIG51bWVyaWMgaW5kZXggb3IgYHVuZGVmaW5lZGAgaWYgbm8gbWF0Y2ggb3IgaWYgZmlyc3QgY2hhciBpcyBub3QgYHN0YXJ0RGVsaW1pdGVyYC5cblx0Ly9cblx0Ly9cdEFsc28gaGFuZGxlcyBuZXN0ZWQgcXVvdGVzIC0tIGlmIHdlIGVuY291bnRlciBhIHNpbmdsZSBvciBkb3VibGUgcXVvdGUsXG5cdC8vXHRcdHdlJ2xsIHNraXAgc2Nhbm5pbmcgdW50aWwgd2UgZmluZCBhIG1hdGNoaW5nIHF1b3RlLlxuXHQvL1xuXHQvL1x0ZWc6ICBgZmluZE1hdGNoaW5nQXRIZWFkKFwie1wiLCBcIn1cIiwgXCJ7YWF7YX1hYX1cIilgID0+IDhcbi8vVEVTVE1FXG5cdGZpbmRNYXRjaGluZ0F0SGVhZChzdGFydERlbGltaXRlciwgZW5kRGVsaW1pdGVyLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0aWYgKHRleHRbc3RhcnRdICE9PSBzdGFydERlbGltaXRlcikgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBuZXN0aW5nID0gMDtcblx0XHRsZXQgY3VycmVudCA9IHN0YXJ0O1xuXHRcdHdoaWxlIChjdXJyZW50IDwgZW5kKSB7XG5cdFx0XHRsZXQgY2hhciA9IHRleHRbY3VycmVudF07XG5cdFx0XHQvLyBpZiBzdGFydERlbGltaXRlciwgaW5jcmVhc2UgbmVzdGluZ1xuXHRcdFx0aWYgKGNoYXIgPT09IHN0YXJ0RGVsaW1pdGVyKSB7XG5cdFx0XHRcdG5lc3RpbmcrKztcblx0XHRcdH1cblx0XHRcdC8vIGlmIGVuZERlbGltaXRlciwgZGVjcmVhc2UgbmVzdGluZyBhbmQgcmV0dXJuIGlmIG5lc3RpbmcgYmFjayB0byAwXG5cdFx0XHRlbHNlIGlmIChjaGFyID09PSBlbmREZWxpbWl0ZXIpIHtcblx0XHRcdFx0bmVzdGluZy0tO1xuXHRcdFx0XHRpZiAobmVzdGluZyA9PT0gMCkgcmV0dXJuIGN1cnJlbnQ7XG5cdFx0XHR9XG5cdFx0XHQvLyBpZiBhIHNpbmdsZSBvciBkb3VibGUgcXVvdGUsIHNraXAgdW50aWwgdGhlIG1hdGNoaW5nIHF1b3RlXG5cdFx0XHRlbHNlIGlmIChjaGFyID09PSBcIidcIiB8fCBjaGFyID09PSAnXCInKSB7XG5cdFx0XHRcdGxldCBbdG9rZW4sIGFmdGVyUXVvdGVdID0gdGhpcy5tYXRjaFRleHQodGV4dCwgY3VycmVudCwgZW5kKSB8fCBbXTtcblx0XHRcdFx0Y3VycmVudCA9IGFmdGVyUXVvdGU7XG5cdFx0XHRcdGNvbnRpbnVlO1x0Ly8gY29udGludWUgc28gd2UgZG9uJ3QgYWRkIDEgdG8gY3VyZW50IGJlbG93XG5cdFx0XHR9XG5cdFx0XHQvLyBJZiBiYWNrc2xhc2gsIHNraXAgYW4gZXh0cmEgY2hhciBpZiBpdCdzIGVpdGhlciBkZWxpbWl0ZXIgb3IgYSBxdW90ZVxuXHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gXCJcXFxcXCIpIHtcblx0XHRcdFx0Y2hhciA9IHRleHRbY3VycmVudCArIDFdO1xuXHRcdFx0XHRpZiAoY2hhciA9PT0gc3RhcnREZWxpbWl0ZXJcblx0XHRcdFx0IHx8IGNoYXIgPT09IGVuZERlbGltaXRlclxuXHRcdFx0XHQgfHwgY2hhciA9PT0gXCInXCJcblx0XHRcdFx0IHx8IGNoYXIgPT09ICdcIidcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0Y3VycmVudCsrOztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y3VycmVudCsrO1xuXHRcdH1cblx0fSxcblxuXG5cdC8vIFJldHVybiB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IE5PTi1FU0NBUEVEIGNoYXJhY3RlciBpbiBgY2hhcnNgIGFmdGVyIGB0ZXh0W3N0YXJ0XWAuXG5cdC8vIFJldHVybnMgYHVuZGVmaW5lZGAgaWYgd2UgZGlkbid0IGZpbmQgYSBtYXRjaC5cbi8vVEVTVE1FXG5cdGZpbmRGaXJzdEF0SGVhZChjaGFycywgdGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHdoaWxlIChzdGFydCA8IGVuZCkge1xuXHRcdFx0bGV0IGNoYXIgPSB0ZXh0W3N0YXJ0XTtcblx0XHRcdGlmIChjaGFycy5pbmNsdWRlcyhjaGFyKSkgcmV0dXJuIHN0YXJ0O1xuXHRcdFx0Ly8gaWYgd2UgZ290IGFuIGVzY2FwZSBjaGFyLCBpZ25vcmUgdGhlIG5leHQgY2hhciBpZiBpdCdzIGluIGBjaGFyc2Bcblx0XHRcdGlmIChjaGFyID09PSBcIlxcXFxcIiAmJiBjaGFycy5pbmNsdWRlcyh0ZXh0W3N0YXJ0KzFdKSkgc3RhcnQrKztcblx0XHRcdHN0YXJ0Kys7XG5cdFx0fVxuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHN0YXJ0O1xuXHR9LFxuXG5cbi8vXG4vLyAjIyMgVXRpbGl0eVxuLy9cblxuXHQvLyBHaXZlbiBhIHNldCBvZiB0b2tlbnMsIHNsaWNlIHdoaXRlc3BhY2UgKGluZGVudCwgTkVXTElORSBvciBub3JtYWwgd2hpdGVzcGFjZSkgZnJvbSB0aGUgZnJvbnQuXG5cdHJlbW92ZUxlYWRpbmdXaGl0ZXNwYWNlKHRva2Vucywgc3RhcnQgPSAwKSB7XG5cdFx0d2hpbGUgKHRva2Vuc1tzdGFydF0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuV2hpdGVzcGFjZSkgc3RhcnQrKztcblx0XHRpZiAoc3RhcnQgPT09IDApIHJldHVybiB0b2tlbnM7XG5cdFx0cmV0dXJuIHRva2Vucy5zbGljZShzdGFydCk7XG5cdH0sXG5cblx0Ly8gR2l2ZW4gYSBzZXQgb2YgdG9rZW5zLCByZW1vdmUgQUxMIFwibm9ybWFsXCIgd2hpdGVzcGFjZSB0b2tlbnMgKE5PVCBpbmRlbnQgb3IgTkVXTElORSkuXG5cdHJlbW92ZU5vcm1hbFdoaXRlc3BhY2UodG9rZW5zKSB7XG5cdFx0cmV0dXJuIHRva2Vucy5maWx0ZXIodG9rZW4gPT4gIVRva2VuaXplci5pc05vcm1hbFdoaXRlc3BhY2UodG9rZW4pKTtcblx0fSxcblxuXG5cdC8vIFJldHVybiBgdHJ1ZWAgaWYgYHRva2VuYCBpcyBcIm5vcm1hbFwiIHdoaXRlc3BjZSAobm90IGEgbmV3bGluZSBvciBpbmRlbnQpXG5cdGlzTm9ybWFsV2hpdGVzcGFjZSh0b2tlbikge1xuXHRcdHJldHVybiB0b2tlbiBpbnN0YW5jZW9mIFRva2VuaXplci5XaGl0ZXNwYWNlXG5cdFx0XHQmJiAhKHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLkluZGVudClcblx0XHRcdCYmICh0b2tlbiAhPT0gVG9rZW5pemVyLk5FV0xJTkUpO1xuXHR9LFxuXG5cbi8vXG4vLyAjIyMgQmxvY2sgLyBpbmRlbnQgcHJvY2Vzc2luZ1xuLy9cblxuXHQvLyBTaW1wbGUgYmxvY2sgY2xhc3MgZm9yIGBicmVha0ludG9CbG9ja3NgLlxuXHRCbG9jazogY2xhc3MgYmxvY2sge1xuXHRcdGNvbnN0cnVjdG9yKHByb3BzKXtcblx0XHRcdE9iamVjdC5hc3NpZ24odGhpcywgcHJvcHMpO1xuXHRcdFx0aWYgKCF0aGlzLmNvbnRlbnRzKSB0aGlzLmNvbnRlbnRzID0gW107XG5cdFx0fVxuXG5cdFx0dG9TdHJpbmcoKSB7XG5cdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcywgbnVsbCwgXCJcXHRcIik7XG5cdFx0fVxuXHR9LFxuXG5cdC8vIEJyZWFrIHRva2VucyBpbnRvIGFuIGFycmF5IG9mIGFycmF5cyBieSBgTkVXTElORWBzLlxuXHQvLyBSZXR1cm5zIGFuIGFycmF5IG9mIGxpbmVzIFdJVEhPVVQgdGhlIGBORVdMSU5FYHMuXG5cdC8vIExpbmVzIHdoaWNoIGFyZSBjb21wb3NlZCBzb2xlbHkgb2Ygd2hpdGVzcGFjZSBhcmUgdHJlYXRlZCBhcyBibGFuay5cblx0YnJlYWtJbnRvTGluZXModG9rZW5zKSB7XG5cdFx0Ly8gQ29udmVydCB0byBsaW5lcy5cblx0XHRsZXQgY3VycmVudExpbmUgPSBbXTtcblx0XHRsZXQgbGluZXMgPSBbY3VycmVudExpbmVdO1xuXHRcdHRva2Vucy5mb3JFYWNoKHRva2VuID0+IHtcblx0XHRcdC8vIGFkZCBuZXcgYXJyYXkgZm9yIGVhY2ggbmV3bGluZVxuXHRcdFx0aWYgKHRva2VuID09PSBUb2tlbml6ZXIuTkVXTElORSkge1xuXHRcdFx0XHQvLyBjcmVhdGUgYSBuZXcgbGluZSBhbmQgcHVzaCBpdCBpblxuXHRcdFx0XHRjdXJyZW50TGluZSA9IFtdO1xuXHRcdFx0XHRyZXR1cm4gbGluZXMucHVzaChjdXJyZW50TGluZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIG90aGVyd2lzZSBqdXN0IGFkZCB0byB0aGUgY3VycmVudCBsaW5lXG5cdFx0XHRjdXJyZW50TGluZS5wdXNoKHRva2VuKTtcblx0XHR9KTtcblxuXHRcdC8vIENsZWFyIGFueSBsaW5lcyB0aGF0IGFyZSBvbmx5IHdoaXRlc3BhY2Vcblx0XHRsaW5lcy5mb3JFYWNoKChsaW5lLCBpbmRleCkgPT4ge1xuXHRcdFx0aWYgKGxpbmUubGVuZ3RoID09PSAxICYmIGxpbmVbMF0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuV2hpdGVzcGFjZSkgbGluZXNbaW5kZXhdID0gW107XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gbGluZXM7XG5cdH0sXG5cblx0Ly8gUmV0dXJuIGluZGVudHMgb2YgdGhlIHNwZWNpZmllZCBsaW5lcy5cblx0Ly8gSW5kZW50cyBlbXB0eSBsaW5lcyAoTkVXTElORXMpIGludG8gdGhlIGJsb2NrIEFGVEVSIHRoZXkgYXBwZWFyLlxuXHRnZXRMaW5lSW5kZW50cyhsaW5lcywgZGVmYXVsdEluZGVudCA9IDApIHtcblx0XHRpZiAobGluZXMubGVuZ3RoID09PSAwKSByZXR1cm4gW107XG5cblx0XHRjb25zdCBpbmRlbnRzID0gbGluZXMubWFwKFRva2VuaXplci5nZXRMaW5lSW5kZW50KTtcblx0XHRjb25zdCBlbmQgPSBpbmRlbnRzLmxlbmd0aDtcblxuXHRcdC8vIGZpZ3VyZSBvdXQgdGhlIGluZGVudCBvZiB0aGUgZmlyc3Qgbm9uLWVtcHR5IGxpbmVcblx0XHRsZXQgc3RhcnRJbmRlbnQgPSBnZXROZXh0SW5kZW50KDApO1xuXHRcdGlmIChzdGFydEluZGVudCA9PT0gdW5kZWZpbmVkKSBzdGFydEluZGVudCA9IGRlZmF1bHRJbmRlbnQ7XG5cblx0XHQvLyBpbmRlbnQgYmxhbmsgbGluZXMgdG8gdGhlIGluZGVudCBBRlRFUiB0aGVtXG5cdFx0Zm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGVuZDsgaW5kZXgrKykge1xuXHRcdFx0aWYgKGluZGVudHNbaW5kZXhdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0aW5kZW50c1tpbmRleF0gPSBnZXROZXh0SW5kZW50KGluZGV4ICsgMSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBpbmRlbnRzO1xuXG5cdFx0Ly8gUmV0dXJuIHRoZSB2YWx1ZSBvZiB0aGUgTkVYVCBub24tdW5kZWZpbmVkIGluZGVudC5cblx0XHRmdW5jdGlvbiBnZXROZXh0SW5kZW50KGluZGV4KSB7XG5cdFx0XHR3aGlsZSAoaW5kZXggPCBlbmQpIHtcblx0XHRcdFx0aWYgKGluZGVudHNbaW5kZXhdICE9PSB1bmRlZmluZWQpIHJldHVybiBpbmRlbnRzW2luZGV4XTtcblx0XHRcdFx0aW5kZXgrKztcblx0XHRcdH1cblx0XHRcdHJldHVybiBzdGFydEluZGVudDtcblx0XHR9XG5cdH0sXG5cblxuXHQvLyBSZXR1cm4gdGhlIGluZGVudCBvZiBhIGxpbmUgb2YgdG9rZW5zLlxuXHQvLyBSZXR1cm5zIGAwYCBpZiBub3QgaW5kZW50ZWQuXG5cdC8vIFJldHVybnMgYHVuZGVmaW5lZGAgaWYgYSBibGFuayBsaW5lLlxuXHRnZXRMaW5lSW5kZW50KGxpbmUpIHtcblx0XHRpZiAoIWxpbmUgfHwgbGluZS5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0aWYgKGxpbmVbMF0gaW5zdGFuY2VvZiBUb2tlbml6ZXIuSW5kZW50KSByZXR1cm4gbGluZVswXS5sZW5ndGg7XG5cdFx0cmV0dXJuIDA7XG5cdH0sXG5cblx0Ly8gQnJlYWsgYHRva2Vuc2AgYmV0d2VlbiBgc3RhcnRgIGFuZCBgZW5kYCBpbnRvIGEgYFRva2VuaXplci5CbG9ja2Agd2l0aCBuZXN0ZWQgYGNvbnRlbnRzYC5cblx0Ly8gU2tpcHMgXCJub3JtYWxcIiB3aGl0ZXNwYWNlIGFuZCBpbmRlbnRzIGluIHRoZSByZXN1bHRzLlxuXHRicmVha0ludG9CbG9ja3M6IGZ1bmN0aW9uKHRva2Vucywgc3RhcnQgPSAwLCBlbmQgPSB0b2tlbnMubGVuZ3RoKSB7XG5cdFx0Ly8gcmVzdHJpY3QgdG8gdG9rZW5zIG9mIGludGVyZXN0XG5cdFx0dG9rZW5zID0gdG9rZW5zLnNsaWNlKHN0YXJ0LCBlbmQpO1xuXHRcdC8vIHJlbW92ZSBcIm5vcm1hbFwiIHdoaXRlc3BhY2Vcbi8vVE9ETzogYmV0dGVyIHRvIGxlYXZlIHRoaXMgdG8gY29uc3VtZXJzPz8/XG5cdFx0dG9rZW5zID0gVG9rZW5pemVyLnJlbW92ZU5vcm1hbFdoaXRlc3BhY2UodG9rZW5zKTtcblxuXHRcdC8vIGJyZWFrIGludG8gbGluZXMgJiByZXR1cm4gZWFybHkgaWYgbm8gbGluZXNcblx0XHRsZXQgbGluZXMgPSBUb2tlbml6ZXIuYnJlYWtJbnRvTGluZXModG9rZW5zKTtcblx0XHRpZiAobGluZXMubGVuZ3RoID09PSAwKSByZXR1cm4gW107XG5cblx0XHQvLyBmaWd1cmUgb3V0IGluZGVudHNcblx0XHRsZXQgaW5kZW50cyA9IFRva2VuaXplci5nZXRMaW5lSW5kZW50cyhsaW5lcyk7XG5cblx0XHQvLyBGaXJzdCBibG9jayBpcyBhdCB0aGUgTUlOSU1VTSBpbmRlbnQgb2YgYWxsIGxpbmVzIVxuXHRcdGxldCBtYXhJbmRlbnQgPSBNYXRoLm1pbi5hcHBseShNYXRoLCBpbmRlbnRzKTtcblx0XHRsZXQgYmxvY2sgPSBuZXcgVG9rZW5pemVyLkJsb2NrKHsgaW5kZW50OiBtYXhJbmRlbnQgfSk7XG5cblx0XHQvLyBzdGFjayBvZiBibG9ja3Ncblx0XHRsZXQgc3RhY2sgPSBbYmxvY2tdO1xuXG5cdFx0bGluZXMuZm9yRWFjaCggKGxpbmUsIGluZGV4KSA9PiB7XG5cdFx0XHQvLyBSZW1vdmUgbGVhZGluZyB3aGl0ZXNwYWNlIChlZzogaW5kZW50cylcblx0XHRcdGxpbmUgPSBUb2tlbml6ZXIucmVtb3ZlTGVhZGluZ1doaXRlc3BhY2UobGluZSk7XG5cblx0XHRcdGxldCBsaW5lSW5kZW50ID0gaW5kZW50c1tpbmRleF07XG5cdFx0XHRsZXQgdG9wID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG5cdFx0XHQvLyBJZiBpbmRlbnRpbmcsIHB1c2ggbmV3IGJsb2NrKHMpXG5cdFx0XHRpZiAobGluZUluZGVudCA+IHRvcC5pbmRlbnQpIHtcblx0XHRcdFx0d2hpbGUgKGxpbmVJbmRlbnQgPiB0b3AuaW5kZW50KSB7XG5cdFx0XHRcdFx0dmFyIG5ld0Jsb2NrID0gbmV3IFRva2VuaXplci5CbG9jayh7IGluZGVudDogdG9wLmluZGVudCArIDEgfSk7XG5cdFx0XHRcdFx0dG9wLmNvbnRlbnRzLnB1c2gobmV3QmxvY2spO1xuXHRcdFx0XHRcdHN0YWNrLnB1c2gobmV3QmxvY2spO1xuXG5cdFx0XHRcdFx0dG9wID0gbmV3QmxvY2s7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIElmIG91dGRlbnRpbmc6IHBvcCBibG9jayhzKVxuXHRcdFx0ZWxzZSBpZiAobGluZUluZGVudCA8IHRvcC5pbmRlbnQpIHtcblx0XHRcdFx0d2hpbGUgKGxpbmVJbmRlbnQgPCB0b3AuaW5kZW50KSB7XG5cdFx0XHRcdFx0c3RhY2sucG9wKCk7XG5cdFx0XHRcdFx0dG9wID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIGFkZCB0byB0b3AgYmxvY2tcblx0XHRcdHRvcC5jb250ZW50cy5wdXNoKGxpbmUpO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGJsb2NrO1xuXHR9LFxuXG5cblxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBUb2tlbml6ZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvVG9rZW5pemVyLmpzIiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHsgdmVyc2lvbjogJzIuNS43JyB9O1xuaWYgKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpIF9fZSA9IGNvcmU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanNcbi8vIG1vZHVsZSBpZCA9IDkxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faXMtb2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSA5MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyB0byBpbmRleGVkIG9iamVjdCwgdG9PYmplY3Qgd2l0aCBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIHN0cmluZ3NcbnZhciBJT2JqZWN0ID0gcmVxdWlyZSgnLi9faW9iamVjdCcpO1xudmFyIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gSU9iamVjdChkZWZpbmVkKGl0KSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qc1xuLy8gbW9kdWxlIGlkID0gOTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGlkID0gMDtcbnZhciBweCA9IE1hdGgucmFuZG9tKCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL191aWQuanNcbi8vIG1vZHVsZSBpZCA9IDk0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlxuLyoqXG4gKiBXaGVuIHNvdXJjZSBtYXBzIGFyZSBlbmFibGVkLCBgc3R5bGUtbG9hZGVyYCB1c2VzIGEgbGluayBlbGVtZW50IHdpdGggYSBkYXRhLXVyaSB0b1xuICogZW1iZWQgdGhlIGNzcyBvbiB0aGUgcGFnZS4gVGhpcyBicmVha3MgYWxsIHJlbGF0aXZlIHVybHMgYmVjYXVzZSBub3cgdGhleSBhcmUgcmVsYXRpdmUgdG8gYVxuICogYnVuZGxlIGluc3RlYWQgb2YgdGhlIGN1cnJlbnQgcGFnZS5cbiAqXG4gKiBPbmUgc29sdXRpb24gaXMgdG8gb25seSB1c2UgZnVsbCB1cmxzLCBidXQgdGhhdCBtYXkgYmUgaW1wb3NzaWJsZS5cbiAqXG4gKiBJbnN0ZWFkLCB0aGlzIGZ1bmN0aW9uIFwiZml4ZXNcIiB0aGUgcmVsYXRpdmUgdXJscyB0byBiZSBhYnNvbHV0ZSBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgcGFnZSBsb2NhdGlvbi5cbiAqXG4gKiBBIHJ1ZGltZW50YXJ5IHRlc3Qgc3VpdGUgaXMgbG9jYXRlZCBhdCBgdGVzdC9maXhVcmxzLmpzYCBhbmQgY2FuIGJlIHJ1biB2aWEgdGhlIGBucG0gdGVzdGAgY29tbWFuZC5cbiAqXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzKSB7XG4gIC8vIGdldCBjdXJyZW50IGxvY2F0aW9uXG4gIHZhciBsb2NhdGlvbiA9IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93LmxvY2F0aW9uO1xuXG4gIGlmICghbG9jYXRpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJmaXhVcmxzIHJlcXVpcmVzIHdpbmRvdy5sb2NhdGlvblwiKTtcbiAgfVxuXG5cdC8vIGJsYW5rIG9yIG51bGw/XG5cdGlmICghY3NzIHx8IHR5cGVvZiBjc3MgIT09IFwic3RyaW5nXCIpIHtcblx0ICByZXR1cm4gY3NzO1xuICB9XG5cbiAgdmFyIGJhc2VVcmwgPSBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIGxvY2F0aW9uLmhvc3Q7XG4gIHZhciBjdXJyZW50RGlyID0gYmFzZVVybCArIGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcL1teXFwvXSokLywgXCIvXCIpO1xuXG5cdC8vIGNvbnZlcnQgZWFjaCB1cmwoLi4uKVxuXHQvKlxuXHRUaGlzIHJlZ3VsYXIgZXhwcmVzc2lvbiBpcyBqdXN0IGEgd2F5IHRvIHJlY3Vyc2l2ZWx5IG1hdGNoIGJyYWNrZXRzIHdpdGhpblxuXHRhIHN0cmluZy5cblxuXHQgL3VybFxccypcXCggID0gTWF0Y2ggb24gdGhlIHdvcmQgXCJ1cmxcIiB3aXRoIGFueSB3aGl0ZXNwYWNlIGFmdGVyIGl0IGFuZCB0aGVuIGEgcGFyZW5zXG5cdCAgICggID0gU3RhcnQgYSBjYXB0dXJpbmcgZ3JvdXBcblx0ICAgICAoPzogID0gU3RhcnQgYSBub24tY2FwdHVyaW5nIGdyb3VwXG5cdCAgICAgICAgIFteKShdICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICB8ICA9IE9SXG5cdCAgICAgICAgIFxcKCAgPSBNYXRjaCBhIHN0YXJ0IHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAoPzogID0gU3RhcnQgYW5vdGhlciBub24tY2FwdHVyaW5nIGdyb3Vwc1xuXHQgICAgICAgICAgICAgICAgIFteKShdKyAgPSBNYXRjaCBhbnl0aGluZyB0aGF0IGlzbid0IGEgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICB8ICA9IE9SXG5cdCAgICAgICAgICAgICAgICAgXFwoICA9IE1hdGNoIGEgc3RhcnQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICAgICAgW14pKF0qICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgIFxcKSAgPSBNYXRjaCBhIGVuZCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgKSAgPSBFbmQgR3JvdXBcbiAgICAgICAgICAgICAgKlxcKSA9IE1hdGNoIGFueXRoaW5nIGFuZCB0aGVuIGEgY2xvc2UgcGFyZW5zXG4gICAgICAgICAgKSAgPSBDbG9zZSBub24tY2FwdHVyaW5nIGdyb3VwXG4gICAgICAgICAgKiAgPSBNYXRjaCBhbnl0aGluZ1xuICAgICAgICkgID0gQ2xvc2UgY2FwdHVyaW5nIGdyb3VwXG5cdCBcXCkgID0gTWF0Y2ggYSBjbG9zZSBwYXJlbnNcblxuXHQgL2dpICA9IEdldCBhbGwgbWF0Y2hlcywgbm90IHRoZSBmaXJzdC4gIEJlIGNhc2UgaW5zZW5zaXRpdmUuXG5cdCAqL1xuXHR2YXIgZml4ZWRDc3MgPSBjc3MucmVwbGFjZSgvdXJsXFxzKlxcKCgoPzpbXikoXXxcXCgoPzpbXikoXSt8XFwoW14pKF0qXFwpKSpcXCkpKilcXCkvZ2ksIGZ1bmN0aW9uKGZ1bGxNYXRjaCwgb3JpZ1VybCkge1xuXHRcdC8vIHN0cmlwIHF1b3RlcyAoaWYgdGhleSBleGlzdClcblx0XHR2YXIgdW5xdW90ZWRPcmlnVXJsID0gb3JpZ1VybFxuXHRcdFx0LnRyaW0oKVxuXHRcdFx0LnJlcGxhY2UoL15cIiguKilcIiQvLCBmdW5jdGlvbihvLCAkMSl7IHJldHVybiAkMTsgfSlcblx0XHRcdC5yZXBsYWNlKC9eJyguKiknJC8sIGZ1bmN0aW9uKG8sICQxKXsgcmV0dXJuICQxOyB9KTtcblxuXHRcdC8vIGFscmVhZHkgYSBmdWxsIHVybD8gbm8gY2hhbmdlXG5cdFx0aWYgKC9eKCN8ZGF0YTp8aHR0cDpcXC9cXC98aHR0cHM6XFwvXFwvfGZpbGU6XFwvXFwvXFwvKS9pLnRlc3QodW5xdW90ZWRPcmlnVXJsKSkge1xuXHRcdCAgcmV0dXJuIGZ1bGxNYXRjaDtcblx0XHR9XG5cblx0XHQvLyBjb252ZXJ0IHRoZSB1cmwgdG8gYSBmdWxsIHVybFxuXHRcdHZhciBuZXdVcmw7XG5cblx0XHRpZiAodW5xdW90ZWRPcmlnVXJsLmluZGV4T2YoXCIvL1wiKSA9PT0gMCkge1xuXHRcdCAgXHQvL1RPRE86IHNob3VsZCB3ZSBhZGQgcHJvdG9jb2w/XG5cdFx0XHRuZXdVcmwgPSB1bnF1b3RlZE9yaWdVcmw7XG5cdFx0fSBlbHNlIGlmICh1bnF1b3RlZE9yaWdVcmwuaW5kZXhPZihcIi9cIikgPT09IDApIHtcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlIHJlbGF0aXZlIHRvIHRoZSBiYXNlIHVybFxuXHRcdFx0bmV3VXJsID0gYmFzZVVybCArIHVucXVvdGVkT3JpZ1VybDsgLy8gYWxyZWFkeSBzdGFydHMgd2l0aCAnLydcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgcmVsYXRpdmUgdG8gY3VycmVudCBkaXJlY3Rvcnlcblx0XHRcdG5ld1VybCA9IGN1cnJlbnREaXIgKyB1bnF1b3RlZE9yaWdVcmwucmVwbGFjZSgvXlxcLlxcLy8sIFwiXCIpOyAvLyBTdHJpcCBsZWFkaW5nICcuLydcblx0XHR9XG5cblx0XHQvLyBzZW5kIGJhY2sgdGhlIGZpeGVkIHVybCguLi4pXG5cdFx0cmV0dXJuIFwidXJsKFwiICsgSlNPTi5zdHJpbmdpZnkobmV3VXJsKSArIFwiKVwiO1xuXHR9KTtcblxuXHQvLyBzZW5kIGJhY2sgdGhlIGZpeGVkIGNzc1xuXHRyZXR1cm4gZml4ZWRDc3M7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3N0eWxlLWxvYWRlci9maXhVcmxzLmpzXG4vLyBtb2R1bGUgaWQgPSA5NDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL1NwYWNlci5sZXNzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHt9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9hZGRTdHlsZXMuanNcIikoY29udGVudCwgb3B0aW9ucyk7XG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2Fscztcbi8vIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnRcbmlmKG1vZHVsZS5ob3QpIHtcblx0Ly8gV2hlbiB0aGUgc3R5bGVzIGNoYW5nZSwgdXBkYXRlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0aWYoIWNvbnRlbnQubG9jYWxzKSB7XG5cdFx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL1NwYWNlci5sZXNzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9TcGFjZXIubGVzc1wiKTtcblx0XHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXHRcdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHRcdH0pO1xuXHR9XG5cdC8vIFdoZW4gdGhlIG1vZHVsZSBpcyBkaXNwb3NlZCwgcmVtb3ZlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvYXBwL1NwYWNlci5sZXNzXG4vLyBtb2R1bGUgaWQgPSA5NDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlcy5sZXNzXCIpO1xuaWYodHlwZW9mIGNvbnRlbnQgPT09ICdzdHJpbmcnKSBjb250ZW50ID0gW1ttb2R1bGUuaWQsIGNvbnRlbnQsICcnXV07XG4vLyBQcmVwYXJlIGNzc1RyYW5zZm9ybWF0aW9uXG52YXIgdHJhbnNmb3JtO1xuXG52YXIgb3B0aW9ucyA9IHt9XG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9hZGRTdHlsZXMuanNcIikoY29udGVudCwgb3B0aW9ucyk7XG5pZihjb250ZW50LmxvY2FscykgbW9kdWxlLmV4cG9ydHMgPSBjb250ZW50LmxvY2Fscztcbi8vIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnRcbmlmKG1vZHVsZS5ob3QpIHtcblx0Ly8gV2hlbiB0aGUgc3R5bGVzIGNoYW5nZSwgdXBkYXRlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0aWYoIWNvbnRlbnQubG9jYWxzKSB7XG5cdFx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlcy5sZXNzXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZXMubGVzc1wiKTtcblx0XHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXHRcdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHRcdH0pO1xuXHR9XG5cdC8vIFdoZW4gdGhlIG1vZHVsZSBpcyBkaXNwb3NlZCwgcmVtb3ZlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvYXBwL3N0eWxlcy5sZXNzXG4vLyBtb2R1bGUgaWQgPSA5NDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy9cbi8vICAjIENsYXNzIHV0aWxpdGllc1xuLy9cblxuLy8gQ2xvbmUgYSBjbGFzcywgcmUtdXNpbmcgdGhlIG9yaWdpbmFsIG5hbWUuXG4vLyBUT0RPOiBtb3ZlIHRvIHV0aWxpdHk/XG5leHBvcnQgZnVuY3Rpb24gY2xvbmVDbGFzcyhjb25zdHJ1Y3RvciwgbmFtZSA9IGNvbnN0cnVjdG9yLm5hbWUpIHtcbiAgLy8gQ2xvbmUgdGhlIGNvbnN0cnVjdG9yLCBrZWVwaW5nIHRoZSBzYW1lIG5hbWVcbiAgZ2xvYmFsLl9fY2xvbmVDbGFzc19fID0gY29uc3RydWN0b3I7XG4gIGNvbnN0IGNsb25lID0gbmV3IEZ1bmN0aW9uKFwibmFtZVwiLCBgcmV0dXJuIGNsYXNzICR7bmFtZX0gZXh0ZW5kcyBfX2Nsb25lQ2xhc3NfXyB7fWApKCk7XG4gIGRlbGV0ZSBnbG9iYWwuX19jbG9uZUNsYXNzX187XG4gIHJldHVybiBjbG9uZTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy91dGlscy9jbGFzcy5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgY3JlYXRpbmcgdmFyaWFibGVzLCBwcm9wZXJ0eSBhY2Nlc3MsIGV0Y1xuLy9cblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG4vLyBDcmVhdGUgXCJVSVwiIHBhcnNlci5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JNb2R1bGUoXCJVSVwiKTtcbmV4cG9ydCBkZWZhdWx0IHBhcnNlcjtcblxucGFyc2VyLmRlZmluZVJ1bGVzKFxuICAvLyBBbGVydCBhIG1lc3NhZ2UuXG4gIHtcbiAgICBuYW1lOiBcImFsZXJ0XCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiLCBcImFzeW5jXCJdLFxuICAgIHN5bnRheDogXCJhbGVydCB7bWVzc2FnZTpleHByZXNzaW9ufSAoPzp3aXRoIHtva0J1dHRvbjp0ZXh0fSk/XCIsXG4gIC8vIFRPRE86IG5lZWQgc29tZSBmYW5jeSBwcm9taXNlIGp1anUgdG8gbWFrZSBwYXJlbnQgZnVudGlvbiBhc3luYz9cbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgYWxlcnQgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBtZXNzYWdlLCBva0J1dHRvbiA9ICdcIk9LXCInIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgYXdhaXQgc3BlbGwuYWxlcnQoJHttZXNzYWdlfSwgJHtva0J1dHRvbn0pYDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJzdGF0ZW1lbnRcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbYGFsZXJ0ICdZbyEnYCwgYGF3YWl0IHNwZWxsLmFsZXJ0KCdZbyEnLCBcIk9LXCIpYF0sXG4gICAgICAgICAgW2BhbGVydCBcIllvIVwiYCwgYGF3YWl0IHNwZWxsLmFsZXJ0KFwiWW8hXCIsIFwiT0tcIilgXSxcbiAgICAgICAgICBbYGFsZXJ0ICdZbyEnIHdpdGggJ3llcCdgLCBgYXdhaXQgc3BlbGwuYWxlcnQoJ1lvIScsICd5ZXAnKWBdLFxuICAgICAgICAgIFtgYWxlcnQgXCJZbyFcIiB3aXRoIFwieWVwXCJgLCBgYXdhaXQgc3BlbGwuYWxlcnQoXCJZbyFcIiwgXCJ5ZXBcIilgXSxcbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfSxcblxuICAvLyBXYXJuaW5nIG1lc3NhZ2UgLS0gbGlrZSBhbGVydCBidXQgZmFuY2llci5cbiAgLy8gVE9ETzogbmVlZCBzb21lIGZhbmN5IHByb21pc2UganVqdSBoZXJlP1xuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJ3YXJuXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIndhcm4ge21lc3NhZ2U6ZXhwcmVzc2lvbn0gKD86d2l0aCB7b2tCdXR0b246dGV4dH0pP1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB3YXJuIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbWVzc2FnZSwgb2tCdXR0b24gPSAnXCJPS1wiJyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYGF3YWl0IHNwZWxsLndhcm4oJHttZXNzYWdlfSwgJHtva0J1dHRvbn0pYDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRlc3RzOiBbXG4gICAgICB7XG4gICAgICAgIGNvbXBpbGVBczogXCJzdGF0ZW1lbnRcIixcbiAgICAgICAgdGVzdHM6IFtcbiAgICAgICAgICBbYHdhcm4gJ1lvISdgLCBgYXdhaXQgc3BlbGwud2FybignWW8hJywgXCJPS1wiKWBdLFxuICAgICAgICAgIFtgd2FybiAnWW8hJyB3aXRoICd5ZXAnYCwgYGF3YWl0IHNwZWxsLndhcm4oJ1lvIScsICd5ZXAnKWBdLFxuICAgICAgICAgIFtgd2FybiBcIllvIVwiYCwgYGF3YWl0IHNwZWxsLndhcm4oXCJZbyFcIiwgXCJPS1wiKWBdLFxuICAgICAgICAgIFtgd2FybiBcIllvIVwiIHdpdGggXCJ5ZXBcImAsIGBhd2FpdCBzcGVsbC53YXJuKFwiWW8hXCIsIFwieWVwXCIpYF0sXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICBdXG4gIH0sXG5cblxuICAvLyBDb25maXJtIG1lc3NhZ2UgLS0gcHJlc2VudCBhIHF1ZXN0aW9uIHdpdGggdHdvIGFuc3dlcnMuXG4gIC8vIFRPRE86IG5lZWQgc29tZSBmYW5jeSBwcm9taXNlIGp1anUgaGVyZT9cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwiY29uZmlybVwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJjb25maXJtIHttZXNzYWdlOmV4cHJlc3Npb259ICg/OndpdGgge29rQnV0dG9uOnRleHR9ICg/OiAoYW5kfG9yKSB7Y2FuY2VsQnV0dG9uOnRleHR9KT8gKT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgY29uZmlybSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG1lc3NhZ2UsIG9rQnV0dG9uID0gJ1wiT0tcIicsIGNhbmNlbEJ1dHRvbiA9ICdcIkNhbmNlbFwiJyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYGF3YWl0IHNwZWxsLmNvbmZpcm0oJHttZXNzYWdlfSwgJHtva0J1dHRvbn0sICR7Y2FuY2VsQnV0dG9ufSlgO1xuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdHM6IFtcbiAgICAgIHtcbiAgICAgICAgY29tcGlsZUFzOiBcInN0YXRlbWVudFwiLFxuICAgICAgICB0ZXN0czogW1xuICAgICAgICAgIFtgY29uZmlybSAnWW8hJ2AsIGBhd2FpdCBzcGVsbC5jb25maXJtKCdZbyEnLCBcIk9LXCIsIFwiQ2FuY2VsXCIpYF0sXG4gICAgICAgICAgW2Bjb25maXJtICdZbyEnIHdpdGggJ3llcCdgLCBgYXdhaXQgc3BlbGwuY29uZmlybSgnWW8hJywgJ3llcCcsIFwiQ2FuY2VsXCIpYF0sXG4gICAgICAgICAgW2Bjb25maXJtICdZbyEnIHdpdGggJ3llcCcgYW5kICdub3BlJ2AsIGBhd2FpdCBzcGVsbC5jb25maXJtKCdZbyEnLCAneWVwJywgJ25vcGUnKWBdLFxuICAgICAgICAgIFtgY29uZmlybSAnWW8hJyB3aXRoICd5ZXAnIG9yICdub3BlJ2AsIGBhd2FpdCBzcGVsbC5jb25maXJtKCdZbyEnLCAneWVwJywgJ25vcGUnKWBdLFxuICAgICAgICAgIFtgY29uZmlybSBcIllvIVwiIHdpdGggXCJ5ZXBcIiBvciBcIm5vcGVcImAsIGBhd2FpdCBzcGVsbC5jb25maXJtKFwiWW8hXCIsIFwieWVwXCIsIFwibm9wZVwiKWBdLFxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICB9XG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL1VJLmpzIiwidmFyIHN0b3JlID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ3drcycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xudmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLlN5bWJvbDtcbnZhciBVU0VfU1lNQk9MID0gdHlwZW9mIFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xuXG52YXIgJGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIFVTRV9TWU1CT0wgJiYgU3ltYm9sW25hbWVdIHx8IChVU0VfU1lNQk9MID8gU3ltYm9sIDogdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59O1xuXG4kZXhwb3J0cy5zdG9yZSA9IHN0b3JlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fd2tzLmpzXG4vLyBtb2R1bGUgaWQgPSA5NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9