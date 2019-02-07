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
        var list = this.results.list;

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
        var expression = this.results.expression;
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
		//		- `match.ruleName`:		name of rule when defined
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvc3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2ZhaWxzLmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9saWIva2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvc3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY29mLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19oaWRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19saWJyYXJ5LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LXBpZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcG4uanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fc2hhcmVkLWtleS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW50ZWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fd2tzLWV4dC5qcyIsIndlYnBhY2s6Ly8vLi9+L2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL3NyYy9QYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9ldmVudF9oYW5kbGVycy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL21hdGNoX2tleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9wYXJzZV9rZXlzLmpzIiwid2VicGFjazovLy8uL34vc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL1NwZWxsRWRpdG9yLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvcnVsZXMvc3BlbGwvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9FeGFtcGxlU3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL1NwYWNlci5qc3giLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9UYWJiYWJsZVRleHRBcmVhLmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL2luZGV4LmpzeCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL3V0aWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21lbW9pemUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL0pTWC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcnVsZXMvc3BlbGwvaWYuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL2xpc3RzLmpzIiwid2VicGFjazovLy8uL3NyYy9ydWxlcy9zcGVsbC9vcGVyYXRvcnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL3N0YXRlbWVudHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3J1bGVzL3NwZWxsL3R5cGVzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9lczYvc3ltYm9sLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY2xhc3NvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fY3R4LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kZWZpbmVkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2V4cG9ydC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faHRtbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faXMtYXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX21ldGEuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1jcmVhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1kcHMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wbi1leHQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3NldC10by1zdHJpbmctdGFnLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL190by1hYnNvbHV0ZS1pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8tbGVuZ3RoLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL193a3MtZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL2VzNi5zeW1ib2wuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9TcGFjZXIubGVzcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwL3N0eWxlcy5sZXNzIiwid2VicGFjazovLy8uL3NyYy9ydWxlcy9zcGVsbC9jb3JlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19kZXNjcmlwdG9ycy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9faGFzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZHAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2ZhY3RvcnlXaXRoVGhyb3dpbmdTaGltcy5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9jbGFzc19kZWNvcmF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvbWV0aG9kX2RlY29yYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9tZXRob2RfZGVjb3JhdG9yX3Njb3BlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L3JlYWN0LWtleWRvd24vZXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9hcnJheS5mcm9tLmpzIiwid2VicGFjazovLy8uL34vcmVhY3Qta2V5ZG93bi9lcy9saWIvZG9tX2hlbHBlcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9saXN0ZW5lcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi91dWlkLmpzIiwid2VicGFjazovLy8uL3NyYy9SdWxlLmpzIiwid2VicGFjazovLy8uL3NyYy9SdWxlU3ludGF4LmpzIiwid2VicGFjazovLy8uL3NyYy9Ub2tlbml6ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2NvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX2lzLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbW9kdWxlcy9fdWlkLmpzIiwid2VicGFjazovLy8uL34vc3R5bGUtbG9hZGVyL2ZpeFVybHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9TcGFjZXIubGVzcz8wOGRlIiwid2VicGFjazovLy8uL3NyYy9hcHAvc3R5bGVzLmxlc3M/YjdlNyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvY2xhc3MuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL21vZHVsZXMvX3drcy5qcyJdLCJuYW1lcyI6WyJpc1doaXRlc3BhY2UiLCJwbHVyYWxpemUiLCJpc1BsdXJhbCIsInNpbmd1bGFyaXplIiwiaXNTaW5ndWxhciIsImdldFRhYnMiLCJBTExfV0hJVEVTUEFDRSIsInRleHQiLCJ0ZXN0Iiwid29yZCIsInJlcGxhY2UiLCJUQUJTIiwibnVtYmVyIiwic3Vic3RyIiwiYWxsRXhwb3J0cyIsImV4cG9ydHMiLCJnbG9iYWwiLCJTVFJJTkciLCJnbG9iYWxfaWRlbnRpZmllciIsIndpbmRvdyIsInNlbGYiLCJjb25zb2xlIiwiZ3JvdXAiLCJsb2ciLCJncm91cEVuZCIsIlBhcnNlciIsInByb3BlcnRpZXMiLCJpbXBvcnRzIiwiX3J1bGVzIiwiT2JqZWN0IiwiYXNzaWduIiwicnVsZU5hbWUiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJUSU1FIiwidGltZSIsInRva2VucyIsIlRva2VuaXplciIsInRva2VuaXplIiwiZmlsdGVyIiwiaXNOb3JtYWxXaGl0ZXNwYWNlIiwidG9rZW4iLCJ0aW1lRW5kIiwidW5kZWZpbmVkIiwicmVtb3ZlTGVhZGluZ1doaXRlc3BhY2UiLCJyZXN1bHQiLCJwYXJzZU5hbWVkUnVsZSIsInBhcnNlIiwiU3ludGF4RXJyb3IiLCJ0b1NvdXJjZSIsInN0YXJ0IiwiZW5kIiwic3RhY2siLCJjYWxsaW5nQ29udGV4dCIsInJ1bGUiLCJydWxlcyIsInJldmVyc2UiLCJjb25jYXQiLCJfX3J1bGVzIiwibWFwIiwiZXhpc3RpbmciLCJSdWxlIiwiQWx0ZXJuYXRpdmVzIiwiYWx0Q29uc3RydWN0b3IiLCJhZGRSdWxlIiwiQXJyYXkiLCJpc0FycmF5IiwiZm9yRWFjaCIsIl9tZXJnZVJ1bGUiLCJyZWR1Y2UiLCJibGFja2xpc3QiLCJkZWZpbmVSdWxlIiwibmFtZSIsImNvbnN0cnVjdG9yIiwiYWxpYXMiLCJjYW5vbmljYWwiLCJzeW50YXgiLCJvdGhlclByb3BzIiwibmFtZXMiLCJwcm90b3R5cGUiLCJydWxlTmFtZXMiLCJUeXBlRXJyb3IiLCJkZWZpbmVQcm9wZXJ0eSIsInZhbHVlIiwia2V5Iiwia2V5cyIsIm91dHB1dCIsImZvck5hbWUiLCJwYXJzZXIiLCJSRUdJU1RSWSIsInN0YXJ0VG9rZW4iLCJlbmRUb2tlbiIsIm5lc3RpbmciLCJuZXN0ZWQiLCJsYXN0SW5kZXgiLCJzbGljZSIsIkRFQlVHIiwiV0FSTiIsIlNwZWxsRWRpdG9yIiwib2JzZXJ2ZXIiLCJwcm9wcyIsImV4YW1wbGVzIiwibG9hZCIsInNwZWxsRWRpdG9yIiwic2F2ZSIsInJldmVydCIsImNvbXBpbGUiLCJjcmVhdGUiLCJkZWxldGUiLCJyZW5hbWUiLCJkdXBsaWNhdGUiLCJyZXNldCIsInRpdGxlcyIsInNlbGVjdGVkIiwiZGlydHkiLCJjb2RlIiwib3B0aW9ucyIsInRpdGxlIiwiY29udGVudCIsIm9uQ2xpY2siLCJzZWxlY3QiLCJkaXJ0eUJ1dHRvbnMiLCJwb3NpdGlvbiIsInJpZ2h0IiwidG9wIiwibWFyZ2luIiwiY29tcGlsZUJ1dHRvbiIsIndpZHRoIiwibGVmdCIsImhlaWdodCIsInBhZGRpbmdUb3AiLCJldmVudCIsInVwZGF0ZSIsInRhcmdldCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZGVmYXVsdFByb3BzIiwiRXhhbXBsZVN0b3JlIiwiaW1wb3J0IiwiYmluZCIsImxvY2FsU3RvcmFnZSIsInNwZWxsRWRpdG9yRXhhbXBsZXMiLCJzcGVsbEVkaXRvckV4YW1wbGUiLCJsb2NhdGlvbiIsInJlbG9hZCIsIkpTT04iLCJfc2F2ZWRFeGFtcGxlcyIsInN0cmluZ2lmeSIsImV4YW1wbGUiLCJza2lwU2F2ZSIsInNob3dDb25maXJtIiwiY29uZmlybSIsInByb21wdCIsIm9sZE5hbWUiLCJuZXdOYW1lIiwid2FybiIsInNldFRpbWVvdXQiLCJpbmZvIiwib2JzZXJ2YWJsZSIsImNvbXB1dGVkIiwiU3BhY2VyIiwiY2xhc3NOYW1lIiwiYXBwZWFyYW5jZSIsInNpemUiLCJpbmxpbmUiLCJmbHVpZCIsInRpbnkiLCJzbWFsbCIsIm1lZGl1bSIsImxhcmdlIiwiaHVnZSIsIm1hc3NpdmUiLCJzcGFjZXJQcm9wcyIsInN0eWxlIiwicHJvcFR5cGVzIiwiUHJvcFR5cGVzIiwic3RyaW5nIiwiYm9vbCIsIlRhYmJhYmxlVGV4dEFyZWEiLCJvbktleURvd24iLCJrZXlDb2RlIiwicHJldmVudERlZmF1bHQiLCJlbGVtZW50Iiwic2VsZWN0aW9uU3RhcnQiLCJzZWxlY3Rpb25FbmQiLCJuZXdUZXh0Iiwic2hpZnRLZXkiLCJsYXN0SW5kZXhPZiIsImluZGV4T2YiLCJsaW5lcyIsInNwbGl0IiwibGluZSIsImpvaW4iLCJvbkNoYW5nZSIsIlRleHRBcmVhIiwiUmVhY3RET00iLCJyZW5kZXIiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiY2xhc3NOYW1lcyIsImFyZ3MiLCJhcmciLCJCb29sZWFuIiwibWVtb2l6ZWQiLCJkZWZpbmVNZW1vaXplZCIsInByb3BlcnR5IiwiZ2V0dGVyIiwiYXBwbHkiLCJjb25maWd1cmFibGUiLCJnZXQiLCJkZWZpbmVSdWxlcyIsIkpTWEVsZW1lbnQiLCJjbG9uZSIsIm1hdGNoZWQiLCJuZXh0U3RhcnQiLCJqc3hFbGVtZW50IiwiYXR0cmlidXRlcyIsImF0dHJzIiwiSlNYRXhwcmVzc2lvbiIsImpzeEV4cHJlc3Npb25Ub1NvdXJjZSIsImNoaWxkcmVuIiwiY2hpbGQiLCJ0cmltIiwiY2hpbGRTb3VyY2UiLCJqc3hFbGVtZW50VG9Tb3VyY2UiLCJqc3hFeHByZXNzaW9uIiwidGFnTmFtZSIsImF0dHJzVG9Tb3VyY2UiLCJjaGlsZHJlblRvU291cmNlIiwicmVzdWx0cyIsImNvbmRpdGlvbiIsInN0YXRlbWVudCIsImJsb2NrIiwic3RhdGVtZW50cyIsIkJsb2NrIiwiZW5jbG9zZVN0YXRlbWVudHMiLCJCbG9ja1N0YXRlbWVudCIsImxlZnRSZWN1cnNpdmUiLCJ0ZXN0UnVsZSIsIktleXdvcmRzIiwibGl0ZXJhbHMiLCJlbHNlU3RhdGVtZW50IiwiU2VxdWVuY2UiLCJsaXN0IiwiaWRlbnRpZmllciIsInRoaW5nIiwiZXhwcmVzc2lvbiIsImFyZ3VtZW50IiwibWF0Y2giLCJvcGVyYXRvciIsImJhbmciLCJpdGVtIiwiaXRlbVZhciIsInBvc2l0aW9uVmFyIiwibGhzIiwicmhzIiwiX29wZXJhdG9yIiwicHJlY2VkZW5jZSIsImEiLCJiIiwidHlwZSIsIlN5bWJvbHMiLCJtZXNzYWdlIiwib2tCdXR0b24iLCJjYW5jZWxCdXR0b24iLCJzdHJ1Y3R1cmUiLCJzdXBlclR5cGUiLCJzdWJUeXBlIiwidHlwZXMiLCJjb25kaXRpb25zIiwicHVzaCIsImtleXdvcmRzIiwia2V5d29yZE1hdGNoZXMiLCJrZXl3b3JkIiwiVHlwZSIsImVycm9yIiwiaW5kZXgiLCJ0b0xvd2VyQ2FzZSIsInN0YXJ0c1dpdGgiLCJtYXRjaGVkVGV4dCIsInNjb3BlIiwiZGVjbGFyYXRpb24iLCJkYXRhVHlwZSIsInBsdXJhbCIsInByb3BlcnRpZXNfIiwiX3Byb3BlcnRpZXMiLCJwcm9wIiwiTGlzdCIsIl9hcmdzIiwiU3RhdGVtZW50cyIsIkNvbW1lbnQiLCJwYXR0ZXJuIiwiUGF0dGVybiIsIk51bWJlciIsIk5VTUJFUl9OQU1FUyIsInplcm8iLCJvbmUiLCJ0d28iLCJ0aHJlZSIsImZvdXIiLCJmaXZlIiwic2l4Iiwic2V2ZW4iLCJlaWdodCIsIm5pbmUiLCJ0ZW4iLCJUZXh0IiwicXVvdGVkU3RyaW5nIiwiZW5kc1dpdGgiLCJMaXRlcmFscyIsIm1hdGNoZXNTdGFydGluZ0F0IiwibGl0ZXJhbFNlcGFyYXRvciIsImZpcnN0IiwiZXZlcnkiLCJsaXRlcmFsIiwiaSIsIm9wdGlvbmFsIiwic29tZSIsInNvdXJjZSIsIlN1YnJ1bGUiLCJtYXRjaGVkUnVsZSIsInN1YnJ1bGUiLCJpbmNsdWRlcyIsInRvU3ludGF4IiwiYWRkUmVzdWx0cyIsImNvbW1lbnQiLCJwcm9tb3RlIiwic291cmNlTmFtZSIsIm1hdGNoTmFtZSIsIm1hdGNoZXMiLCJiZXN0TWF0Y2giLCJnZXRCZXN0TWF0Y2giLCJiZXN0IiwiY3VycmVudCIsIlJlcGVhdCIsInJlcGVhdCIsImlzQ29tcG91bmRSdWxlIiwiZGVsaW1pdGVyIiwiaW5kZW50IiwiY29udGVudHMiLCJCbGFua0xpbmUiLCJsYXN0IiwicGFyc2VCbG9jayIsInBhcnNlU3RhdGVtZW50IiwiV2hpdGVzcGFjZSIsIlN0YXRlbWVudFBhcnNlRXJyb3IiLCJ1bnBhcnNlZCIsInBhcnNlZCIsImUiLCJibG9ja1RvU291cmNlIiwiX25hbWUiLCJfc3VwZXJUeXBlIiwibmFtZWQiLCJtZXRob2RzIiwib3RoZXIiLCJ0b1N0cnVjdHVyZSIsImFkZFN0cnVjdHVyZSIsImJyZWFrSW50b0Jsb2NrcyIsIl9ibG9jayIsIndoaXRlc3BhY2UiLCJwYXJzZVJ1bGUiLCJwYXJzZVN5bnRheCIsImFsdENsYXNzIiwidG9rZW5pc2VSdWxlU3ludGF4IiwiU1lOVEFYX0VYUFJFU1NJT04iLCJzeW50YXhTdHJlYW0iLCJwYXJzZVRva2VuIiwicG9wIiwiS0VZV09SRF9QQVRURVJOIiwic3ludGF4VG9rZW4iLCJwYXJzZVN5bWJvbCIsInBhcnNlU3VicnVsZSIsInBhcnNlQWx0ZXJuYXRpdmVzIiwicGFyc2VMaXN0IiwicGFyc2VSZXBlYXQiLCJwYXJzZUtleXdvcmQiLCJuZXh0IiwiaXNFc2NhcGVkIiwiZmluZE5lc3RlZFRva2VucyIsImFsdGVybmF0aXZlcyIsImdyb3VwQWx0ZXJuYXRpdmVzIiwic3ltYm9sIiwicGFyYW1zIiwiYmFuZ1Bvc2l0aW9uIiwibm90IiwibmV3bGluZSIsIkluZGVudCIsIk5FV0xJTkUiLCJlYXRUb2tlbnMiLCJtYXRjaFRvcFRva2VucyIsIm1ldGhvZCIsImNhbGwiLCJtYXRjaFdoaXRlc3BhY2UiLCJtYXRjaFdvcmQiLCJtYXRjaE51bWJlciIsIm1hdGNoTmV3bGluZSIsIm1hdGNoSlNYRWxlbWVudCIsIm1hdGNoVGV4dCIsIm1hdGNoQ29tbWVudCIsIm1hdGNoU3ltYm9sIiwiZWF0V2hpdGVzcGFjZSIsIndoaXRlU3BhY2VFbmQiLCJ3aGl0ZXNwYWNlRW5kIiwiV09SRF9TVEFSVCIsIldPUkRfQ0hBUiIsIndvcmRFbmQiLCJOVU1CRVJfU1RBUlQiLCJOVU1CRVIiLCJudW1iZXJNYXRjaCIsIm1hdGNoRXhwcmVzc2lvbkF0SGVhZCIsIm51bWJlclN0ciIsInBhcnNlRmxvYXQiLCJxdW90ZVN5bWJvbCIsInRleHRFbmQiLCJjaGFyIiwiQ09NTUVOVCIsImNvbW1lbnRTdGFydCIsImdldExpbmVBdEhlYWQiLCJjb21tZW50TWF0Y2giLCJjb21tZW50U3ltYm9sIiwibWF0Y2hKU1hTdGFydFRhZyIsImlzVW5hcnlUYWciLCJtYXRjaEpTWENoaWxkcmVuIiwiY2hpbGRFbmQiLCJKU1hfVEFHX1NUQVJUIiwidGFnTWF0Y2giLCJlbmRCaXQiLCJtYXRjaEpTWEF0dHJpYnV0ZSIsImF0dHJFbmQiLCJhdHRyc0FzU3RyaW5nIiwiY2hpbGRyZW5Bc1N0cmluZyIsImF0dHIiLCJlbmRUYWciLCJtYXRjaEpTWENoaWxkIiwibWF0Y2hKU1hFbmRUYWciLCJtYXRjaEpTWEV4cHJlc3Npb24iLCJtYXRjaEpTWFRleHQiLCJtYXRjaFN0cmluZ0F0SGVhZCIsIkpTWF9BVFRSSUJVVEVfU1RBUlQiLCJlcXVhbHMiLCJhdHRyaWJ1dGUiLCJKU1hBdHRyaWJ1dGUiLCJtYXRjaEpTWEF0dHJpYnV0ZVZhbHVlIiwidmFsdWVFbmQiLCJtYXRjaEpTWEF0dHJpYnV0ZVZhbHVlSWRlbnRpZmllciIsImVuZEluZGV4IiwiZmluZE1hdGNoaW5nQXRIZWFkIiwiSlNYX1RFWFRfRU5EX0NIQVJTIiwiZmluZEZpcnN0QXRIZWFkIiwianN4VGV4dCIsInN0cmluZ0VuZCIsImhlYWQiLCJzdGFydERlbGltaXRlciIsImVuZERlbGltaXRlciIsImFmdGVyUXVvdGUiLCJjaGFycyIsInJlbW92ZU5vcm1hbFdoaXRlc3BhY2UiLCJicmVha0ludG9MaW5lcyIsImN1cnJlbnRMaW5lIiwiZ2V0TGluZUluZGVudHMiLCJkZWZhdWx0SW5kZW50IiwiaW5kZW50cyIsImdldExpbmVJbmRlbnQiLCJzdGFydEluZGVudCIsImdldE5leHRJbmRlbnQiLCJtYXhJbmRlbnQiLCJNYXRoIiwibWluIiwibGluZUluZGVudCIsIm5ld0Jsb2NrIiwiY2xvbmVDbGFzcyIsIl9fY2xvbmVDbGFzc19fIiwiRnVuY3Rpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O1FBSWdCQSxZLEdBQUFBLFk7UUFPQUMsUyxHQUFBQSxTO1FBTUFDLFEsR0FBQUEsUTtRQVFBQyxXLEdBQUFBLFc7UUFNQUMs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QXNCO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1REFBdUQ7QUFDdkQ7O0FB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxnQ0FBZ0MsVUFBVSxFQUFFO0FBQzVDLEM7Ozs7Ozs7Ozs7Ozs7UUNuQmdCaWIsVSxHQUFBQSxVO0FBTmhCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ08sU0FBU0EsVUFBVCxDQUFvQjdZLFdBQXBCLEVBQTBEO0FBQUEsTUFBekJELElBQXlCLHVFQUFsQkMsWUFBWUQsSUFBTTs7QUFDL0Q7QUFDQXhELFNBQU91YyxjQUFQLEdBQXdCOVksV0FBeEI7QUFDQSxNQUFNMkksUUFBUSxJQUFJb1EsUUFBSixDQUFhLE1BQWIsb0JBQXFDaFosSUFBckMsa0NBQWQ7QUFDQSxTQUFPeEQsT0FBT3VjLGNBQWQ7QUFDQSxTQUFPblEsS0FBUDtBQUNELEM7Ozs7Ozs7O0FDWkQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGdsb2JhbCBmcm9tIFwiLi9nbG9iYWxcIjtcblxuLy8gUmV0dXJuIHRydWUgaWYgdGV4dCBpcyBhbGwgd2hpdGVzcGFjZSwgaW5jbHVkaW5nIGVtcHR5IHN0cmluZy5cbmxldCBBTExfV0hJVEVTUEFDRSA9IC9eXFxzKiQvO1xuZXhwb3J0IGZ1bmN0aW9uIGlzV2hpdGVzcGFjZSh0ZXh0KSB7XG5cdHJldHVybiBBTExfV0hJVEVTUEFDRS50ZXN0KHRleHQpXG59XG5cbi8vIFJldHVybiB0aGUgcGx1cmFsIG9mIGB3b3JkYC5cbi8vIE5PVEU6IHRoaXMgaXMgbm90IHZlcnkgZ29vZCBhdCBhbGwhISFcbi8vIFRPRE86IGV4Y2VwdGlvbnMsIGV0Yy5cbmV4cG9ydCBmdW5jdGlvbiBwbHVyYWxpemUod29yZCkge1xuXHRyZXR1cm4gd29yZCArIFwic1wiO1xufVxuXG4vLyBSZXR1cm4gdHJ1ZSBpZiB3b3JkIGlzIGEgcGx1cmFsLlxuLy8gTk9URTogZm9yIHdvcmRzIHdoaWNoIGFyZSBCT1RIIHNpbmd1bGFyIGFuZCBwbHVyYWwsIHRoaXMgd2lsbCByZXR1cm4gdHJ1ZS5cbmV4cG9ydCBmdW5jdGlvbiBpc1BsdXJhbCh3b3JkKSB7XG5cdHJldHVybiB3b3JkID09PSBwbHVyYWxpemUod29yZCk7XG59XG5cblxuLy8gUmV0dXJuIHRoZSBzaW5ndWxhciBvZiBgd29yZGAuXG4vLyBOT1RFOiB0aGlzIGlzIG5vdCB2ZXJ5IGdvb2QgYXQgYWxsISEhXG4vLyBUT0RPOiBleGNlcHRpb25zLCBldGMuXG5leHBvcnQgZnVuY3Rpb24gc2luZ3VsYXJpemUod29yZCkge1xuXHRyZXR1cm4gd29yZC5yZXBsYWNlKC9lP3MkLywgXCJcIik7XG59XG5cbi8vIFJldHVybiB0cnVlIGlmIHdvcmQgaXMgYSBzaW5ndWxhci5cbi8vIE5PVEU6IGZvciB3b3JkcyB3aGljaCBhcmUgQk9USCBzaW5ndWxhciBhbmQgcGx1cmFsLCB0aGlzIHdpbGwgcmV0dXJuIHRydWUuXG5leHBvcnQgZnVuY3Rpb24gaXNTaW5ndWxhcih3b3JkKSB7XG5cdHJldHVybiB3b3JkID09PSBzaW5ndWxhcml6ZSh3b3JkKTtcbn1cblxuXG4vLyBSZXR1cm4gYSBjZXJ0YWluIGBudW1iZXJgIG9mIHRhYiBjaGFyYWN0ZXJzLlxuY29uc3QgVEFCUyA9IFwiXFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XCI7XG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFicyhudW1iZXIpIHtcblx0aWYgKHR5cGVvZiBudW1iZXIgIT09IFwibnVtYmVyXCIpIHJldHVybiBcIlwiO1xuXHRyZXR1cm4gVEFCUy5zdWJzdHIoMCwgbnVtYmVyKTtcbn1cblxuXG4vLyBFeHBvcnQgYWxsIGFzIGEgbHVtcFxubGV0IGFsbEV4cG9ydHMgPSB7Li4uZXhwb3J0c307XG5leHBvcnQgZGVmYXVsdCBhbGxFeHBvcnRzO1xuXG4vLyBERUJVRzogcHV0IG9uIGdsb2JhbCBmb3IgZGVidWdnaW5nLlxuZ2xvYmFsLlNUUklORyA9IGFsbEV4cG9ydHM7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdXRpbHMvc3RyaW5nLmpzIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoIWlzT2JqZWN0KGl0KSkgdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fYW4tb2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSAxMTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhlYykge1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZmFpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDExNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgJ2NvcmUtanMvZXM2L3N5bWJvbCc7XG5cbi8vIFRPRE86IE5lZWQgYmV0dGVyLCBtb3JlIGNvbXBsZXRlLCBhbmQgbW9yZSBtZXRob2RpY2FsIGtleSBkZWZpbml0aW9uc1xuXG52YXIgS2V5cyA9IHtcbiAgYmFja3NwYWNlOiA4LFxuICBkZWw6IDQ2LFxuICBkZWxldGU6IDQ2LFxuICB0YWI6IDksXG4gIGVudGVyOiAxMyxcbiAgJ3JldHVybic6IDEzLFxuICBlc2M6IDI3LFxuICBzcGFjZTogMzIsXG4gIHBhZ2VVcDogMzMsXG4gIHBhZ2VEb3duOiAzNCxcbiAgZW5kOiAzNSxcbiAgaG9tZTogMzYsXG4gIGxlZnQ6IDM3LFxuICB1cDogMzgsXG4gIHJpZ2h0OiAzOSxcbiAgZG93bjogNDAsXG4gICc7JzogMTg2LFxuICAnPSc6IDE4NyxcbiAgJywnOiAxODgsXG4gICctJzogMTg5LFxuICAnLic6IDE5MCxcbiAgJy8nOiAxOTEsXG4gICdgJzogMTkyLFxuICAnWyc6IDIxOSxcbiAgJ1xcXFwnOiAyMjAsXG4gICddJzogMjIxXG59O1xuXG4vLyBBZGQgdXBwZXJjYXNlIHZlcnNpb25zIG9mIGtleXMgYWJvdmUgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG5PYmplY3Qua2V5cyhLZXlzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIEtleXNba2V5LnRvVXBwZXJDYXNlKCldID0gS2V5c1trZXldO1xufSk7XG5cbicwMTIzNDU2Nzg5Jy5zcGxpdCgnJykuZm9yRWFjaChmdW5jdGlvbiAobnVtLCBpbmRleCkge1xuICByZXR1cm4gS2V5c1tudW1dID0gaW5kZXggKyA0ODtcbn0pO1xuXG4nQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChsZXR0ZXIsIGluZGV4KSB7XG4gIEtleXNbbGV0dGVyXSA9IGluZGV4ICsgNjU7XG4gIEtleXNbbGV0dGVyLnRvTG93ZXJDYXNlKCldID0gaW5kZXggKyA2NTtcbn0pO1xuXG4vLyBmbiBrZXlzXG5bMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIDExLCAxMl0uZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcbiAgcmV0dXJuIEtleXNbJ2YnICsgaW5kZXhdID0gMTExICsgaW5kZXg7XG59KTtcblxuZXhwb3J0IHZhciBtb2RpZmllcnMgPSB7XG4gIGNvbnRyb2w6ICdjdHJsJyxcbiAgY3RybDogJ2N0cmwnLFxuICBzaGlmdDogJ3NoaWZ0JyxcbiAgbWV0YTogJ21ldGEnLFxuICBjbWQ6ICdtZXRhJyxcbiAgY29tbWFuZDogJ21ldGEnLFxuICBvcHRpb246ICdhbHQnLFxuICBhbHQ6ICdhbHQnXG59O1xuXG5leHBvcnQgdmFyIEFMTF9LRVlTID0gU3ltYm9sKCdBTExfS0VZUycpO1xuXG5leHBvcnQgdmFyIEFMTF9QUklOVEFCTEVfS0VZUyA9IFN5bWJvbCgnQUxMX1BSSU5UQUJMRV9LRVlTJyk7XG5cbmV4cG9ydCBkZWZhdWx0IEtleXM7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL2tleXMuanNcbi8vIG1vZHVsZSBpZCA9IDE0OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgX3NsaWNlZFRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH0gcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyByZXR1cm4gYXJyOyB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkgeyByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpOyB9IGVsc2UgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTsgfSB9OyB9KCk7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG4vKipcbiAqIEBtb2R1bGUgc3RvcmVcbiAqXG4gKi9cbmltcG9ydCBtYXRjaEtleXMgZnJvbSAnLi9saWIvbWF0Y2hfa2V5cyc7XG5pbXBvcnQgcGFyc2VLZXlzIGZyb20gJy4vbGliL3BhcnNlX2tleXMnO1xuaW1wb3J0IHV1aWQgZnJvbSAnLi9saWIvdXVpZCc7XG5cbi8qKlxuICogcHJpdmF0ZVxuICpcbiAqL1xuXG4vLyBkaWN0IGZvciBjbGFzcyBwcm90b3R5cGVzID0+IGJpbmRpbmdzXG52YXIgX2hhbmRsZXJzID0gbmV3IE1hcCgpO1xuXG4vLyBhbGwgbW91bnRlZCBpbnN0YW5jZXMgdGhhdCBoYXZlIGtleWJpbmRpbmdzXG52YXIgX2luc3RhbmNlcyA9IG5ldyBTZXQoKTtcblxuLy8gZm9yIHRlc3RpbmdcbmV4cG9ydCBmdW5jdGlvbiBfcmVzZXRTdG9yZSgpIHtcbiAgX2hhbmRsZXJzLmNsZWFyKCk7XG4gIF9pbnN0YW5jZXMuY2xlYXIoKTtcbn1cblxuLyoqXG4gKiBhY3RpdmF0ZVxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gaW5zdGFuY2UgSW5zdGFudGlhdGVkIGNsYXNzIHRoYXQgZXh0ZW5kZWQgUmVhY3QuQ29tcG9uZW50LCB0byBiZSBmb2N1c2VkIHRvIHJlY2VpdmUga2V5ZG93biBldmVudHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKGluc3RhbmNlcykge1xuICB2YXIgaW5zdGFuY2VzQXJyYXkgPSBbXS5jb25jYXQoaW5zdGFuY2VzKTtcblxuICAvLyBpZiBubyBjb21wb25lbnRzIHdlcmUgZm91bmQgYXMgYW5jZXN0b3JzIG9mIHRoZSBldmVudCB0YXJnZXQsXG4gIC8vIGVmZmVjdGl2ZWx5IGRlYWN0aXZhdGUga2V5ZG93biBoYW5kbGluZyBieSBjYXBwaW5nIHRoZSBzZXQgb2YgaW5zdGFuY2VzXG4gIC8vIHdpdGggYG51bGxgLlxuICBpZiAoIWluc3RhbmNlc0FycmF5Lmxlbmd0aCkge1xuICAgIF9pbnN0YW5jZXMuYWRkKG51bGwpO1xuICB9IGVsc2Uge1xuICAgIF9pbnN0YW5jZXMuZGVsZXRlKG51bGwpO1xuXG4gICAgLy8gZGVsZXRpbmcgYW5kIHRoZW4gYWRkaW5nIHRoZSBpbnN0YW5jZShzKSBoYXMgdGhlIGVmZmVjdCBvZiBzb3J0aW5nIHRoZSBzZXRcbiAgICAvLyBhY2NvcmRpbmcgdG8gaW5zdGFuY2UgYWN0aXZhdGlvbiAoYXNjZW5kaW5nKVxuICAgIGluc3RhbmNlc0FycmF5LmZvckVhY2goZnVuY3Rpb24gKGluc3RhbmNlKSB7XG4gICAgICBfaW5zdGFuY2VzLmRlbGV0ZShpbnN0YW5jZSk7XG4gICAgICBfaW5zdGFuY2VzLmFkZChpbnN0YW5jZSk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8qKlxuICogZGVsZXRlSW5zdGFuY2VcbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCBJbnN0YW50aWF0ZWQgY2xhc3MgdGhhdCBleHRlbmRlZCBSZWFjdC5Db21wb25lbnRcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRoZSB2YWx1ZSBzZXQuaGFzKCB0YXJnZXQgKSB3b3VsZCBoYXZlIHJldHVybmVkIHByaW9yIHRvIGRlbGV0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVJbnN0YW5jZSh0YXJnZXQpIHtcbiAgX2luc3RhbmNlcy5kZWxldGUodGFyZ2V0KTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kQmluZGluZ0ZvckV2ZW50KGV2ZW50KSB7XG4gIGlmICghX2luc3RhbmNlcy5oYXMobnVsbCkpIHtcbiAgICB2YXIga2V5TWF0Y2hlc0V2ZW50ID0gZnVuY3Rpb24ga2V5TWF0Y2hlc0V2ZW50KGtleVNldCkge1xuICAgICAgcmV0dXJuIG1hdGNoS2V5cyh7IGtleVNldDoga2V5U2V0LCBldmVudDogZXZlbnQgfSk7XG4gICAgfTtcblxuICAgIC8vIGxvb3AgdGhyb3VnaCBpbnN0YW5jZXMgaW4gcmV2ZXJzZSBhY3RpdmF0aW9uIG9yZGVyIHNvIHRoYXQgbW9zdFxuICAgIC8vIHJlY2VudGx5IGFjdGl2YXRlZCBpbnN0YW5jZSBnZXRzIGZpcnN0IGRpYnMgb24gZXZlbnRcbiAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoX2luc3RhbmNlcykpLnJldmVyc2UoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gX3N0ZXAudmFsdWU7XG5cbiAgICAgICAgdmFyIGJpbmRpbmdzID0gZ2V0QmluZGluZyhpbnN0YW5jZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUpO1xuICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyID0gZmFsc2U7XG4gICAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gYmluZGluZ3NbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDI7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSAoX3N0ZXAyID0gX2l0ZXJhdG9yMi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWUpIHtcbiAgICAgICAgICAgIHZhciBfc3RlcDIkdmFsdWUgPSBfc2xpY2VkVG9BcnJheShfc3RlcDIudmFsdWUsIDIpLFxuICAgICAgICAgICAgICAgIGtleVNldHMgPSBfc3RlcDIkdmFsdWVbMF0sXG4gICAgICAgICAgICAgICAgZm4gPSBfc3RlcDIkdmFsdWVbMV07XG5cbiAgICAgICAgICAgIGlmIChrZXlTZXRzLnNvbWUoa2V5TWF0Y2hlc0V2ZW50KSkge1xuICAgICAgICAgICAgICAvLyByZXR1cm4gd2hlbiBtYXRjaGluZyBrZXliaW5kaW5nIGlzIGZvdW5kIC0gaS5lLiBvbmx5IG9uZVxuICAgICAgICAgICAgICAvLyBrZXlib3VuZCBjb21wb25lbnQgY2FuIHJlc3BvbmQgdG8gYSBnaXZlbiBrZXkgY29kZS4gdG8gZ2V0IGFyb3VuZCB0aGlzLFxuICAgICAgICAgICAgICAvLyBzY29wZSBhIGNvbW1vbiBhbmNlc3RvciBjb21wb25lbnQgY2xhc3Mgd2l0aCBAa2V5ZG93biBhbmQgdXNlXG4gICAgICAgICAgICAgIC8vIEBrZXlkb3duU2NvcGVkIHRvIGJpbmQgdGhlIGR1cGxpY2F0ZSBrZXlzIGluIHlvdXIgY2hpbGQgY29tcG9uZW50c1xuICAgICAgICAgICAgICAvLyAob3IganVzdCBpbnNwZWN0IG5leHRQcm9wcy5rZXlkb3duLmV2ZW50KS5cbiAgICAgICAgICAgICAgcmV0dXJuIHsgZm46IGZuLCBpbnN0YW5jZTogaW5zdGFuY2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgICAgICAgX2l0ZXJhdG9yRXJyb3IyID0gZXJyO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yICYmIF9pdGVyYXRvcjIucmV0dXJuKSB7XG4gICAgICAgICAgICAgIF9pdGVyYXRvcjIucmV0dXJuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjIpIHtcbiAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogZ2V0QmluZGluZ1xuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IENsYXNzIHVzZWQgYXMga2V5IGluIGRpY3Qgb2Yga2V5IGJpbmRpbmdzXG4gKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBvYmplY3QgY29udGFpbmluZyBiaW5kaW5ncyBmb3IgdGhlIGdpdmVuIGNsYXNzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRCaW5kaW5nKF9yZWYpIHtcbiAgdmFyIF9fcmVhY3RLZXlkb3duVVVJRCA9IF9yZWYuX19yZWFjdEtleWRvd25VVUlEO1xuXG4gIHJldHVybiBfaGFuZGxlcnMuZ2V0KF9fcmVhY3RLZXlkb3duVVVJRCk7XG59O1xuXG4vKipcbiAqIGdldEluc3RhbmNlc1xuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcmV0dXJuIHtzZXR9IEFsbCBzdG9yZWQgaW5zdGFuY2VzIChhbGwgbW91bnRlZCBjb21wb25lbnQgaW5zdGFuY2VzIHdpdGgga2V5YmluZGluZ3MpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbnN0YW5jZXMoKSB7XG4gIHJldHVybiBfaW5zdGFuY2VzO1xufTtcblxuLyoqXG4gKiBpc0VtcHR5XG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEByZXR1cm4ge251bWJlcn0gU2l6ZSBvZiB0aGUgc2V0IG9mIGFsbCBzdG9yZWQgaW5zdGFuY2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5KCkge1xuICByZXR1cm4gIV9pbnN0YW5jZXMuc2l6ZTtcbn07XG5cbi8qKlxuICogc2V0QmluZGluZ1xuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncyBBbGwgYXJndW1lbnRzIG5lY2Vzc2FyeSB0byBzZXQgdGhlIGJpbmRpbmdcbiAqIEBwYXJhbSB7YXJyYXl9IGFyZ3Mua2V5cyBLZXkgY29kZXMgdGhhdCBzaG91bGQgdHJpZ2dlciB0aGUgZm5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGFyZ3MuZm4gVGhlIGNhbGxiYWNrIHRvIGJlIHRyaWdnZXJlZCB3aGVuIGdpdmVuIGtleXMgYXJlIHByZXNzZWRcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzLnRhcmdldCBUaGUgZGVjb3JhdGVkIGNsYXNzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRCaW5kaW5nKF9yZWYyKSB7XG4gIHZhciBrZXlzID0gX3JlZjIua2V5cyxcbiAgICAgIGZuID0gX3JlZjIuZm4sXG4gICAgICB0YXJnZXQgPSBfcmVmMi50YXJnZXQ7XG5cbiAgdmFyIGtleVNldHMgPSBwYXJzZUtleXMoa2V5cyk7XG5cbiAgdmFyIF9fcmVhY3RLZXlkb3duVVVJRCA9IHRhcmdldC5fX3JlYWN0S2V5ZG93blVVSUQ7XG5cbiAgaWYgKCFfX3JlYWN0S2V5ZG93blVVSUQpIHtcbiAgICB0YXJnZXQuX19yZWFjdEtleWRvd25VVUlEID0gdXVpZCgpO1xuICAgIF9oYW5kbGVycy5zZXQodGFyZ2V0Ll9fcmVhY3RLZXlkb3duVVVJRCwgbmV3IE1hcChbW2tleVNldHMsIGZuXV0pKTtcbiAgfSBlbHNlIHtcbiAgICBfaGFuZGxlcnMuZ2V0KF9fcmVhY3RLZXlkb3duVVVJRCkuc2V0KGtleVNldHMsIGZuKTtcbiAgfVxufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9zdG9yZS5qc1xuLy8gbW9kdWxlIGlkID0gMTQ5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIE1ha2Ugc3VyZSBgZ2xvYmFsYCBpcyBkZWZpbmVkIGdsb2JhbGx5OlxuLy9cdC0gZWl0aGVyIGFzIHRoZSBub2RlanMgYGdsb2JhbGAsIG9yXG4vL1x0LSBhcyBhbiBhbGlhcyBmb3IgYHdpbmRvd2AgaW4gYnJvd3NlcnMsIG9yXG4vL1x0LSBmb3IgdGhlIGBzZWxmYCBjb250ZXh0IGluIHdlYiB3b3JrZXJzLlxuLy9cbi8vIE5PVEU6IHRoaXMgbW9kaWZpZXMgdGhlIFwiZ2xvYmFsXCIgZW52aXJvbm1lbnQgYnkgbWFraW5nIHN1cmUgXCJnbG9iYWxcIiBpcyBzZXQuIVxuLy9cblxubGV0IGdsb2JhbF9pZGVudGlmaWVyO1xuaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbi8vXHRjb25zb2xlLmxvZyhcIlJ1bm5pbmcgaW4gbm9kZVwiKTtcblx0Z2xvYmFsX2lkZW50aWZpZXIgPSBnbG9iYWw7XG59XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4vL1x0Y29uc29sZS5sb2coXCJSdW5uaW5nIGluIGEgd2ViIGJyb3dzZXJcIik7XG5cdHdpbmRvdy5nbG9iYWwgPSB3aW5kb3c7XG5cdGdsb2JhbF9pZGVudGlmaWVyID0gd2luZG93O1xufVxuXG5pZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcbi8vXHRjb25zb2xlLmxvZyhcIlJ1bm5pbmcgaW4gYSB3ZWIgd29ya2VyXCIpO1xuXHRzZWxmLmdsb2JhbCA9IHNlbGY7XG5cdGdsb2JhbF9pZGVudGlmaWVyID0gc2VsZjtcbn1cblxuLy8gRXhwb3J0IGZvciBjb25zdW1wdGlvbiBieSBpbXBvcnQuXG5leHBvcnQgZGVmYXVsdCBnbG9iYWxfaWRlbnRpZmllcjtcblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3V0aWxzL2dsb2JhbC5qcyIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2NvZi5qc1xuLy8gbW9kdWxlIGlkID0gMTc5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIElFIDgtIGRvbid0IGVudW0gYnVnIGtleXNcbm1vZHVsZS5leHBvcnRzID0gKFxuICAnY29uc3RydWN0b3IsaGFzT3duUHJvcGVydHksaXNQcm90b3R5cGVPZixwcm9wZXJ0eUlzRW51bWVyYWJsZSx0b0xvY2FsZVN0cmluZyx0b1N0cmluZyx2YWx1ZU9mJ1xuKS5zcGxpdCgnLCcpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZW51bS1idWcta2V5cy5qc1xuLy8gbW9kdWxlIGlkID0gMTgwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkUCA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpO1xudmFyIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIHJldHVybiBkUC5mKG9iamVjdCwga2V5LCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG59IDogZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICByZXR1cm4gb2JqZWN0O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2hpZGUuanNcbi8vIG1vZHVsZSBpZCA9IDE4MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZhbHNlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fbGlicmFyeS5qc1xuLy8gbW9kdWxlIGlkID0gMTgyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDE5LjEuMi4xNCAvIDE1LjIuMy4xNCBPYmplY3Qua2V5cyhPKVxudmFyICRrZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMtaW50ZXJuYWwnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiBrZXlzKE8pIHtcbiAgcmV0dXJuICRrZXlzKE8sIGVudW1CdWdLZXlzKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3Qta2V5cy5qc1xuLy8gbW9kdWxlIGlkID0gMTgzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMuZiA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LXBpZS5qc1xuLy8gbW9kdWxlIGlkID0gMTg0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJpdG1hcCwgdmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZTogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZTogdmFsdWVcbiAgfTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19wcm9wZXJ0eS1kZXNjLmpzXG4vLyBtb2R1bGUgaWQgPSAxODVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgU1JDID0gcmVxdWlyZSgnLi9fdWlkJykoJ3NyYycpO1xudmFyIFRPX1NUUklORyA9ICd0b1N0cmluZyc7XG52YXIgJHRvU3RyaW5nID0gRnVuY3Rpb25bVE9fU1RSSU5HXTtcbnZhciBUUEwgPSAoJycgKyAkdG9TdHJpbmcpLnNwbGl0KFRPX1NUUklORyk7XG5cbnJlcXVpcmUoJy4vX2NvcmUnKS5pbnNwZWN0U291cmNlID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiAkdG9TdHJpbmcuY2FsbChpdCk7XG59O1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTywga2V5LCB2YWwsIHNhZmUpIHtcbiAgdmFyIGlzRnVuY3Rpb24gPSB0eXBlb2YgdmFsID09ICdmdW5jdGlvbic7XG4gIGlmIChpc0Z1bmN0aW9uKSBoYXModmFsLCAnbmFtZScpIHx8IGhpZGUodmFsLCAnbmFtZScsIGtleSk7XG4gIGlmIChPW2tleV0gPT09IHZhbCkgcmV0dXJuO1xuICBpZiAoaXNGdW5jdGlvbikgaGFzKHZhbCwgU1JDKSB8fCBoaWRlKHZhbCwgU1JDLCBPW2tleV0gPyAnJyArIE9ba2V5XSA6IFRQTC5qb2luKFN0cmluZyhrZXkpKSk7XG4gIGlmIChPID09PSBnbG9iYWwpIHtcbiAgICBPW2tleV0gPSB2YWw7XG4gIH0gZWxzZSBpZiAoIXNhZmUpIHtcbiAgICBkZWxldGUgT1trZXldO1xuICAgIGhpZGUoTywga2V5LCB2YWwpO1xuICB9IGVsc2UgaWYgKE9ba2V5XSkge1xuICAgIE9ba2V5XSA9IHZhbDtcbiAgfSBlbHNlIHtcbiAgICBoaWRlKE8sIGtleSwgdmFsKTtcbiAgfVxuLy8gYWRkIGZha2UgRnVuY3Rpb24jdG9TdHJpbmcgZm9yIGNvcnJlY3Qgd29yayB3cmFwcGVkIG1ldGhvZHMgLyBjb25zdHJ1Y3RvcnMgd2l0aCBtZXRob2RzIGxpa2UgTG9EYXNoIGlzTmF0aXZlXG59KShGdW5jdGlvbi5wcm90b3R5cGUsIFRPX1NUUklORywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nICYmIHRoaXNbU1JDXSB8fCAkdG9TdHJpbmcuY2FsbCh0aGlzKTtcbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fcmVkZWZpbmUuanNcbi8vIG1vZHVsZSBpZCA9IDE4NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBTSEFSRUQgPSAnX19jb3JlLWpzX3NoYXJlZF9fJztcbnZhciBzdG9yZSA9IGdsb2JhbFtTSEFSRURdIHx8IChnbG9iYWxbU0hBUkVEXSA9IHt9KTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIHN0b3JlW2tleV0gfHwgKHN0b3JlW2tleV0gPSB2YWx1ZSAhPT0gdW5kZWZpbmVkID8gdmFsdWUgOiB7fSk7XG59KSgndmVyc2lvbnMnLCBbXSkucHVzaCh7XG4gIHZlcnNpb246IGNvcmUudmVyc2lvbixcbiAgbW9kZTogcmVxdWlyZSgnLi9fbGlicmFyeScpID8gJ3B1cmUnIDogJ2dsb2JhbCcsXG4gIGNvcHlyaWdodDogJ8KpIDIwMTggRGVuaXMgUHVzaGthcmV2ICh6bG9pcm9jay5ydSknXG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC5qc1xuLy8gbW9kdWxlIGlkID0gMTg3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDcuMS4xIFRvUHJpbWl0aXZlKGlucHV0IFssIFByZWZlcnJlZFR5cGVdKVxudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG4vLyBpbnN0ZWFkIG9mIHRoZSBFUzYgc3BlYyB2ZXJzaW9uLCB3ZSBkaWRuJ3QgaW1wbGVtZW50IEBAdG9QcmltaXRpdmUgY2FzZVxuLy8gYW5kIHRoZSBzZWNvbmQgYXJndW1lbnQgLSBmbGFnIC0gcHJlZmVycmVkIHR5cGUgaXMgYSBzdHJpbmdcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBTKSB7XG4gIGlmICghaXNPYmplY3QoaXQpKSByZXR1cm4gaXQ7XG4gIHZhciBmbiwgdmFsO1xuICBpZiAoUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKHR5cGVvZiAoZm4gPSBpdC52YWx1ZU9mKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpIHJldHVybiB2YWw7XG4gIGlmICghUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gcHJpbWl0aXZlIHZhbHVlXCIpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qc1xuLy8gbW9kdWxlIGlkID0gMTg4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGRvY3VtZW50ID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuZG9jdW1lbnQ7XG4vLyB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0JyBpbiBvbGQgSUVcbnZhciBpcyA9IGlzT2JqZWN0KGRvY3VtZW50KSAmJiBpc09iamVjdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpcyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZG9tLWNyZWF0ZS5qc1xuLy8gbW9kdWxlIGlkID0gMjc5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgJiYgIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnZGl2JyksICdhJywgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH0gfSkuYSAhPSA3O1xufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qc1xuLy8gbW9kdWxlIGlkID0gMjgwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIDE5LjEuMi43IC8gMTUuMi4zLjQgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbnZhciAka2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzLWludGVybmFsJyk7XG52YXIgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKS5jb25jYXQoJ2xlbmd0aCcsICdwcm90b3R5cGUnKTtcblxuZXhwb3J0cy5mID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhPKSB7XG4gIHJldHVybiAka2V5cyhPLCBoaWRkZW5LZXlzKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wbi5qc1xuLy8gbW9kdWxlIGlkID0gMjgxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtZ29wcy5qc1xuLy8gbW9kdWxlIGlkID0gMjgyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgYXJyYXlJbmRleE9mID0gcmVxdWlyZSgnLi9fYXJyYXktaW5jbHVkZXMnKShmYWxzZSk7XG52YXIgSUVfUFJPVE8gPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZXMpIHtcbiAgdmFyIE8gPSB0b0lPYmplY3Qob2JqZWN0KTtcbiAgdmFyIGkgPSAwO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBrZXk7XG4gIGZvciAoa2V5IGluIE8pIGlmIChrZXkgIT0gSUVfUFJPVE8pIGhhcyhPLCBrZXkpICYmIHJlc3VsdC5wdXNoKGtleSk7XG4gIC8vIERvbid0IGVudW0gYnVnICYgaGlkZGVuIGtleXNcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIGlmIChoYXMoTywga2V5ID0gbmFtZXNbaSsrXSkpIHtcbiAgICB+YXJyYXlJbmRleE9mKHJlc3VsdCwga2V5KSB8fCByZXN1bHQucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWtleXMtaW50ZXJuYWwuanNcbi8vIG1vZHVsZSBpZCA9IDI4M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgc2hhcmVkID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ2tleXMnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuL191aWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gc2hhcmVkW2tleV0gfHwgKHNoYXJlZFtrZXldID0gdWlkKGtleSkpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3NoYXJlZC1rZXkuanNcbi8vIG1vZHVsZSBpZCA9IDI4NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsID0gTWF0aC5jZWlsO1xudmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3RvLWludGVnZXIuanNcbi8vIG1vZHVsZSBpZCA9IDI4NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzLmYgPSByZXF1aXJlKCcuL193a3MnKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3drcy1leHQuanNcbi8vIG1vZHVsZSBpZCA9IDI4NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuXHRNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xuLy8gY3NzIGJhc2UgY29kZSwgaW5qZWN0ZWQgYnkgdGhlIGNzcy1sb2FkZXJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXNlU291cmNlTWFwKSB7XG5cdHZhciBsaXN0ID0gW107XG5cblx0Ly8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXHRsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHR2YXIgY29udGVudCA9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKTtcblx0XHRcdGlmKGl0ZW1bMl0pIHtcblx0XHRcdFx0cmV0dXJuIFwiQG1lZGlhIFwiICsgaXRlbVsyXSArIFwie1wiICsgY29udGVudCArIFwifVwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGNvbnRlbnQ7XG5cdFx0XHR9XG5cdFx0fSkuam9pbihcIlwiKTtcblx0fTtcblxuXHQvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXHRsaXN0LmkgPSBmdW5jdGlvbihtb2R1bGVzLCBtZWRpYVF1ZXJ5KSB7XG5cdFx0aWYodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpXG5cdFx0XHRtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCBcIlwiXV07XG5cdFx0dmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGlkID0gdGhpc1tpXVswXTtcblx0XHRcdGlmKHR5cGVvZiBpZCA9PT0gXCJudW1iZXJcIilcblx0XHRcdFx0YWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuXHRcdH1cblx0XHRmb3IoaSA9IDA7IGkgPCBtb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IG1vZHVsZXNbaV07XG5cdFx0XHQvLyBza2lwIGFscmVhZHkgaW1wb3J0ZWQgbW9kdWxlXG5cdFx0XHQvLyB0aGlzIGltcGxlbWVudGF0aW9uIGlzIG5vdCAxMDAlIHBlcmZlY3QgZm9yIHdlaXJkIG1lZGlhIHF1ZXJ5IGNvbWJpbmF0aW9uc1xuXHRcdFx0Ly8gIHdoZW4gYSBtb2R1bGUgaXMgaW1wb3J0ZWQgbXVsdGlwbGUgdGltZXMgd2l0aCBkaWZmZXJlbnQgbWVkaWEgcXVlcmllcy5cblx0XHRcdC8vICBJIGhvcGUgdGhpcyB3aWxsIG5ldmVyIG9jY3VyIChIZXkgdGhpcyB3YXkgd2UgaGF2ZSBzbWFsbGVyIGJ1bmRsZXMpXG5cdFx0XHRpZih0eXBlb2YgaXRlbVswXSAhPT0gXCJudW1iZXJcIiB8fCAhYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuXHRcdFx0XHRpZihtZWRpYVF1ZXJ5ICYmICFpdGVtWzJdKSB7XG5cdFx0XHRcdFx0aXRlbVsyXSA9IG1lZGlhUXVlcnk7XG5cdFx0XHRcdH0gZWxzZSBpZihtZWRpYVF1ZXJ5KSB7XG5cdFx0XHRcdFx0aXRlbVsyXSA9IFwiKFwiICsgaXRlbVsyXSArIFwiKSBhbmQgKFwiICsgbWVkaWFRdWVyeSArIFwiKVwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxpc3QucHVzaChpdGVtKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdHJldHVybiBsaXN0O1xufTtcblxuZnVuY3Rpb24gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtLCB1c2VTb3VyY2VNYXApIHtcblx0dmFyIGNvbnRlbnQgPSBpdGVtWzFdIHx8ICcnO1xuXHR2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG5cdGlmICghY3NzTWFwcGluZykge1xuXHRcdHJldHVybiBjb250ZW50O1xuXHR9XG5cblx0aWYgKHVzZVNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHZhciBzb3VyY2VNYXBwaW5nID0gdG9Db21tZW50KGNzc01hcHBpbmcpO1xuXHRcdHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG5cdFx0XHRyZXR1cm4gJy8qIyBzb3VyY2VVUkw9JyArIGNzc01hcHBpbmcuc291cmNlUm9vdCArIHNvdXJjZSArICcgKi8nXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKCdcXG4nKTtcblx0fVxuXG5cdHJldHVybiBbY29udGVudF0uam9pbignXFxuJyk7XG59XG5cbi8vIEFkYXB0ZWQgZnJvbSBjb252ZXJ0LXNvdXJjZS1tYXAgKE1JVClcbmZ1bmN0aW9uIHRvQ29tbWVudChzb3VyY2VNYXApIHtcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpO1xuXHR2YXIgZGF0YSA9ICdzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCwnICsgYmFzZTY0O1xuXG5cdHJldHVybiAnLyojICcgKyBkYXRhICsgJyAqLyc7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcbi8vIG1vZHVsZSBpZCA9IDI4N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBTcGVsbCBcInBhcnNlclwiIGNsYXNzLlxuLy9cblxuLy8gVE9ETzogZGVwZW5kZW5jeS1pbmplY3QgdG9rZW5pemVyP1xuaW1wb3J0IFRva2VuaXplciBmcm9tIFwiLi9Ub2tlbml6ZXIuanNcIjtcbmltcG9ydCBSdWxlIGZyb20gXCIuL1J1bGUuanNcIjtcbmltcG9ydCBwYXJzZVJ1bGUgZnJvbSBcIi4vUnVsZVN5bnRheC5qc1wiO1xuaW1wb3J0IHsgY2xvbmVDbGFzcyB9IGZyb20gXCIuL3V0aWxzL2NsYXNzLmpzXCI7XG5cbi8vIEdSUlIuLi4gd2lsbCBTT01FT05FIG9uIHRoZSBub2RlIHRlYW0gcGxlYXNlIGltcGxlbWVudCBjb25zb2xlLmdyb3VwID8/P1xuaWYgKCFjb25zb2xlLmdyb3VwKSBjb25zb2xlLmdyb3VwID0gY29uc29sZS5sb2c7XG5pZiAoIWNvbnNvbGUuZ3JvdXBFbmQpIGNvbnNvbGUuZ3JvdXBFbmQgPSBjb25zb2xlLmxvZztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VyIHtcblx0Ly8gU2V0IHRvIGB0cnVlYCB0byBvdXRwdXQgZGVidWcgaW5mbyB3aGlsZSBhZGRpbmcgcnVsZXNcblx0c3RhdGljIERFQlVHID0gZmFsc2U7XG5cblx0Ly8gU2hvdWxkIHdlIHdhcm4gYWJvdXQgYW5vbWFsb3VzIGNvbmRpdGlvbnM/XG5cdHN0YXRpYyBXQVJOID0gZmFsc2U7XG5cblx0Ly8gU2V0IHRvIGB0cnVlYCB0byBvdXRwdXQgdGltaW5nIGluZm8uXG5cdHN0YXRpYyBUSU1FID0gZmFsc2U7XG5cblx0Ly8gQ29uc3RydWN0b3IuXG5cdGNvbnN0cnVjdG9yKHByb3BlcnRpZXMpIHtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIHByb3BlcnRpZXMpO1xuXHR9XG5cbi8vXG4vLyMjIyBQYXJzaW5nXG4vL1xuXHQvLyBQYXJzZSBgcnVsZU5hbWVgIHJ1bGUgYXQgaGVhZCBvZiBgdGV4dGAuXG5cdC8vIElmIHlvdSBwYXNzIG9ubHkgb25lIGFyZ3VtZW50LCB3ZSdsbCBhc3N1bWUgdGhhdCdzIGB0ZXh0YCBhbmQgeW91IHdhbnQgdG8gbWF0Y2ggYHN0YXRlbWVudHNgLlxuXHQvLyBIYW5kbGVzIG9wdGlvbmFsIGFuZCByZXBlYXRpbmcgcnVsZXMgYXMgd2VsbCBhcyBlYXRpbmcgd2hpdGVzcGFjZS5cblx0Ly8gUmV0dXJucyByZXN1bHQgb2YgcGFyc2UuXG4vL1RFU1RNRVxuXHRwYXJzZShydWxlTmFtZSwgdGV4dCkge1xuXHRcdC8vIElmIG9ubHkgb25lIGFyZ3VtZW50LCBhc3N1bWUgdGhhdCdzIHRoZSB0ZXh0IGFuZCBwYXJzZSBgc3RhdGVtZW50c2Bcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0dGV4dCA9IHJ1bGVOYW1lO1xuXHRcdFx0cnVsZU5hbWUgPSBcInN0YXRlbWVudHNcIjtcblx0XHR9XG5cblx0XHQvLyBDb252ZXJ0IHRvIHRva2Vucy5cblx0XHRpZiAoUGFyc2VyLlRJTUUpIGNvbnNvbGUudGltZShcInRva2VuaXplXCIpO1xuXHRcdGxldCB0b2tlbnMgPSBUb2tlbml6ZXIudG9rZW5pemUodGV4dCk7XG5cdFx0Ly8gZWF0IG5vbi1pbmRlbnQgd2hpdGVzcGFjZSAoc2luY2Ugd2UgaWdub3JlIGl0KVxuXHRcdHRva2VucyA9IHRva2Vucy5maWx0ZXIodG9rZW4gPT4gIVRva2VuaXplci5pc05vcm1hbFdoaXRlc3BhY2UodG9rZW4pKTtcblx0XHRpZiAoUGFyc2VyLlRJTUUpIGNvbnNvbGUudGltZUVuZChcInRva2VuaXplXCIpO1xuXG5cdFx0Ly8gQmFpbCBpZiB3ZSBkaWRuJ3QgZ2V0IGFueSB0b2tlbnMgYmFjay5cblx0XHRpZiAoIXRva2VucyB8fCB0b2tlbnMubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0aWYgKFBhcnNlci5USU1FKSBjb25zb2xlLnRpbWUoXCJwYXJzZVwiKTtcblx0XHQvLyBJZiB3ZSdyZSBub3QgcGFyc2luZyBgc3RhdGVtZW50c2AsIGVhdCB3aGl0ZXNwYWNlIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmUuXG5cdFx0aWYgKHJ1bGVOYW1lICE9PSBcInN0YXRlbWVudHNcIikge1xuXHRcdFx0dG9rZW5zID0gVG9rZW5pemVyLnJlbW92ZUxlYWRpbmdXaGl0ZXNwYWNlKHRva2Vucyk7XG5cdFx0fVxuXG5cdFx0Ly8gUGFyc2UgdGhlIHJ1bGUgb3IgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIHJ1bGUgbm90IGZvdW5kLlxuXHRcdGxldCByZXN1bHQgPSB0aGlzLnBhcnNlTmFtZWRSdWxlKHJ1bGVOYW1lLCB0b2tlbnMsIDAsIHRva2Vucy5sZW5ndGgsIHVuZGVmaW5lZCwgXCJwYXJzZXIucGFyc2UoKVwiKTtcblx0XHRpZiAoUGFyc2VyLlRJTUUpIGNvbnNvbGUudGltZUVuZChcInBhcnNlXCIpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXG5cblx0Ly8gUGFyc2UgYHRleHRgIGFuZCByZXR1cm4gdGhlIHJlc3VsdGluZyBzb3VyY2UgY29kZS5cblx0Ly9cdC0gaWYgb25lIHN0cmluZyBhcmd1bWVudCwgY29tcGlsZXMgYXMgXCJzdGF0ZW1lbnRzXCJcblx0Ly8gVGhyb3dzIGlmIG5vdCBwYXJzZWFibGUuXG4vL1RFU1RNRVxuXHRjb21waWxlKHJ1bGVOYW1lLCB0ZXh0KSB7XG5cdFx0Ly8gSWYgb25seSBvbmUgYXJndW1lbnQsIGFzc3VtZSB0aGF0J3MgdGhlIHRleHQgYW5kIHBhcnNlIGBzdGF0ZW1lbnRzYFxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHR0ZXh0ID0gcnVsZU5hbWU7XG5cdFx0XHRydWxlTmFtZSA9IFwic3RhdGVtZW50c1wiO1xuXHRcdH1cblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5wYXJzZShydWxlTmFtZSwgdGV4dCk7XG5cdFx0aWYgKCFyZXN1bHQpIHRocm93IG5ldyBTeW50YXhFcnJvcihgcGFyc2VyLnBhcnNlKCcke3J1bGVOYW1lfScsICcke3RleHR9Jyk6IGNhbid0IHBhcnNlIHRoaXNgKTtcblx0XHRyZXR1cm4gcmVzdWx0LnRvU291cmNlKHRoaXMpO1xuXHR9XG5cblxuXHQvLyBQYXJzZSBhIG5hbWVkIHJ1bGUgKGRlZmluZWQgaW4gdGhpcyBwYXJzZXIgb3IgaW4gYW55IG9mIG91ciBgaW1wb3J0c2ApLCByZXR1cm5pbmcgdGhlIFwiYmVzdFwiIG1hdGNoLlxuXHQvLyBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIG5vIG1hdGNoLlxuXHQvLyBUaHJvd3MgaWYgcnVsZSBpcyBub3QgaW1wbGVtZW50ZWQuXG5cdHBhcnNlTmFtZWRSdWxlKHJ1bGVOYW1lLCB0b2tlbnMsIHN0YXJ0LCBlbmQsIHN0YWNrLCBjYWxsaW5nQ29udGV4dCA9IFwicGFyc2VOYW1lZFJ1bGVcIikge1xuICAgIGNvbnN0IHJ1bGUgPSB0aGlzLnJ1bGVzW3J1bGVOYW1lXTtcblx0XHRpZiAoIXJ1bGUpIHRocm93IG5ldyBTeW50YXhFcnJvcihgJHtjYWxsaW5nQ29udGV4dH06IHJ1bGUgJyR7cnVsZU5hbWV9JyBub3QgZm91bmRgKTtcbiAgICByZXR1cm4gcnVsZS5wYXJzZSh0aGlzLCB0b2tlbnMsIHN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0fVxuXG5cdC8vIFRlc3Qgd2hldGhlciBhIHJ1bGUgKHdoaWNoIG1heSBiZSBzcGVjaWZpZWQgYnkgbmFtZSkgTUlHSFQgYmUgZm91bmQgaW4gaGVhZCBvZiBzdHJlYW0uXG5cdC8vIFJldHVybnM6XG5cdC8vXHQtIGB0cnVlYCBpZiB0aGUgcnVsZSBNSUdIVCBiZSBtYXRjaGVkLlxuXHQvL1x0LSBgZmFsc2VgIGlmIHRoZXJlIGlzIE5PIFdBWSB0aGUgcnVsZSBjYW4gYmUgbWF0Y2hlZC5cblx0Ly9cdC0gYHVuZGVmaW5lZGAgaWYgbm90IGRldGVybWluc3RpYyAoZWc6IG5vIHdheSB0byB0ZWxsIHF1aWNrbHkpLlxuXHR0ZXN0KHJ1bGUsIHRva2Vucywgc3RhcnQsIGVuZCkge1xuXHQgIGlmICh0eXBlb2YgcnVsZSA9PT0gXCJzdHJpbmdcIikge1xuXHQgICAgcnVsZSA9IHRoaXMucnVsZXNbcnVsZV07XG5cdCAgICBpZiAoIXJ1bGUpIHJldHVybiB1bmRlZmluZWQ7ICAgIC8vIFRPRE86IHRocm93P1xuXHQgIH1cblx0ICByZXR1cm4gcnVsZS50ZXN0KHRoaXMsIHRva2Vucywgc3RhcnQsIGVuZCk7XG5cdH1cblxuXG4vL1xuLy8gIyMjIFx0SW1wb3J0c1xuLy9cdFx0UGFyc2VycyBjYW4gZGVwZW5kIG9uIG90aGVyIHBhcnNlcnMgZm9yIGFkZGl0aW9uYWwgYHJ1bGVzYC5cbi8vXHRcdEltcG9ydHMgYXJlIGxhenktYm91bmQgaW50byBgcGFyc2VyLnJ1bGVzYCBhcyBuZWNlc3NhcnkuXG4vLyAgICBXZSBhc3N1bWUgdGhlIHRvcC1sZXZlbCBwYXJzZXIgZm9yIGEgbGFuZ3VhZ2Ugd2lsbCBpbmNsdWRlIGFsbCBuZWNlc3NhcnkgaW1wb3J0cyBhdXRvbWF0aWNhbGx5LlxuLy9cblxuXHQvLyBBZGQgb25lIG9yIG1vcmUgbmFtZWQgaW1wb3J0cyB0byB0aGlzIHBhcnNlci5cblx0Ly8gSW1wb3J0cyBpbmNyZWFzZSBpbiBwcmlvcml0eSB0aGUgbGF0ZXIgdGhleSBhcmUgaW4gdGhlIGxpc3QuXG4gIGltcG9ydHMgPSBbXTtcblx0aW1wb3J0KC4uLmltcG9ydHMpIHtcblx0XHQvLyBSRVZFUlNFIHRoZSBsaXN0IG9mIGltcG9ydHMsIHNvIHRoZSBtb3N0IGdlbmVyYWwgb25lIGlzIExBU1Rcblx0XHQvLyBUaHVzIG1vcmUgc3BlY2lmaWMgaW1wb3J0cyB3aWxsIGJlIEVBUkxJRVIgaW4gdGhlIGBpbXBvcnRzYCBsaXN0LlxuXG5cdFx0Ly8gQ3JlYXRlIG5ldyBhcnJheSBvZiBpbXBvcnRzIGFuZCBhZGQgaW1wb3J0IG5hbWVzIHBhc3NlZCBpbi5cblx0XHR0aGlzLmltcG9ydHMgPSBpbXBvcnRzLnJldmVyc2UoKS5jb25jYXQodGhpcy5pbXBvcnRzKTtcblxuXHRcdC8vIGNsZWFyIGNvbmNhdGVuYXRlZCBsaXN0IG9mIHJ1bGVzIHNvIHdlJ2xsIHJlY2FjdWxhdGUgaW4gYHBhcnNlci5ydWxlc2Bcblx0XHRkZWxldGUgdGhpcy5fX3J1bGVzO1xuXHR9XG5cbi8vXG4vLyAjIyMgUnVsZXNcbi8vICAgIExpc3Qgb2YgYWxsIGtub3duIHJ1bGVzIGZvciB0aGlzIHBhcnNlci5cbi8vICAgIFlvdSBjYW4gYWNjZXNzIG5hbWVkIHJ1bGVzIGFzIGBwYXJzZXIucnVsZXNbXCJydWxlTmFtZVwiXWBcbi8vXG5cdC8vIFN0YXJ0IHdpdGggYW4gZW1wdHkgbWFwIG9mIHJ1bGVzLlxuXHRfcnVsZXMgPSB7fTtcblxuXHQvLyBSZXR1cm4gbWFwIG9mIGFsbCBrbm93biBydWxlcyBieSBydWxlIG5hbWUsIGluY2x1ZGluZyBydWxlcyBkZWZpbmVkIGluIG91ciBpbXBvcnRzLlxuXHQvLyBOT1RFOiBXZSBtZW1vaXplIHRoaXMsIHNvIG1ha2Ugc3VyZSB0byBjbGVhciBgX19ydWxlc2AgaWYgeW91J3JlIG1hbmlwdWxhdGluZyBydWxlcyBvciBpbXBvcnRzIVxuXHRnZXQgcnVsZXMoKSB7XG5cdFx0aWYgKCF0aGlzLl9fcnVsZXMpIHtcblx0XHRcdGNvbnN0IG91dHB1dCA9IHRoaXMuX19ydWxlcyA9IHt9O1xuXHRcdFx0Ly8gR2V0IGFsbCBpbXBvcnRlZCBwYXJzZXJzLCB3aXRoIHVzIGxhc3Rcblx0XHRcdGNvbnN0IGltcG9ydHMgPSBbdGhpc10uY29uY2F0KHRoaXMuaW1wb3J0cy5tYXAoUGFyc2VyLmZvck5hbWUpKTtcblxuXHRcdFx0Ly8gRm9yIGVhY2ggcGFyc2VyXG5cdFx0XHRpbXBvcnRzLmZvckVhY2gocGFyc2VyID0+IHtcblx0XHRcdFx0Zm9yIChjb25zdCBydWxlTmFtZSBpbiBwYXJzZXIuX3J1bGVzKSB7XG5cdFx0XHRcdCAgdGhpcy5fbWVyZ2VSdWxlKG91dHB1dCwgcnVsZU5hbWUsIHBhcnNlci5fcnVsZXNbcnVsZU5hbWVdKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9fcnVsZXM7XG5cdH1cblxuICAvLyBNZXJnZSBgcnVsZWAgaW50byBgbWFwYCBvZiBydWxlcyBieSBgcnVsZU5hbWVgLlxuICAvLyBJZiB3ZSBhbHJlYWR5IGhhdmUgYSBydWxlIHdpdGggdGhhdCBuYW1lLCB3ZSdsbCBhZGQgaXQgYXMgYW4gYWx0ZXJuYXRpdmUuXG4vL1RFU1RNRVxuICBfbWVyZ2VSdWxlKG1hcCwgcnVsZU5hbWUsIHJ1bGUpIHtcbiAgICBsZXQgZXhpc3RpbmcgPSBtYXBbcnVsZU5hbWVdO1xuICAgIGlmICghZXhpc3RpbmcpIHtcbiAgICAgIG1hcFtydWxlTmFtZV0gPSBydWxlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghKGV4aXN0aW5nIGluc3RhbmNlb2YgUnVsZS5BbHRlcm5hdGl2ZXMpIHx8IChleGlzdGluZy5ncm91cCAhPT0gcnVsZU5hbWUpKSB7XG4gICAgICBjb25zdCBhbHRDb25zdHJ1Y3RvciA9IGNsb25lQ2xhc3MoUnVsZS5BbHRlcm5hdGl2ZXMsIHJ1bGVOYW1lKTtcbiAgICAgIGV4aXN0aW5nID0gbWFwW3J1bGVOYW1lXSA9IG5ldyBhbHRDb25zdHJ1Y3Rvcih7XG4gICAgICAgIGdyb3VwOiBydWxlTmFtZSxcbiAgICAgICAgcnVsZXM6IFsgZXhpc3RpbmcgXVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHJ1bGUgaW5zdGFuY2VvZiBSdWxlLkFsdGVybmF0aXZlcyAmJiAocnVsZS5ncm91cCA9PT0gcnVsZU5hbWUpKSB7XG4gICAgICBleGlzdGluZy5hZGRSdWxlKC4uLnJ1bGUucnVsZXMpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGV4aXN0aW5nLmFkZFJ1bGUocnVsZSk7XG4gICAgfVxuICB9XG5cblx0Ly8gQWRkIGEgYHJ1bGVgIHRvIG91ciBsaXN0IG9mIHJ1bGVzIVxuXHQvLyBDb252ZXJ0cyB0byBgYWx0ZXJuYXRpdmVzYCBvbiByZS1kZWZpbmluZyB0aGUgc2FtZSBydWxlLlxuXHRhZGRSdWxlKHJ1bGVOYW1lLCBydWxlKSB7XG5cdFx0Ly8gQ2xlYXIgbWVtb2l6ZWQgYF9fcnVsZXNgIHNvIHdlJ2xsIHJlY2FsY3VsYXRlIGBwYXJzZXIucnVsZXNgIGFzIG5lY2Vzc2FyeVxuXHRcdGRlbGV0ZSB0aGlzLl9fcnVsZXM7XG5cblx0XHQvLyBJZiBwYXNzZWQgYSBmdW5jdGlvbiwgY3JlYXRlIGFuIGluc3RhbmNlIGZvciB0aGUgYWN0dWFsIHJ1bGUuXG5cdFx0Ly8gVGhpcyBpcyBjb21tb25seSBkb25lIHNvIEpTIHdpbGwgZ2l2ZSB1cyBtZWFuaW5nZnVsIGNsYXNzIG5hbWVzIGluIGRlYnVnIG91dHB1dC5cblx0XHRpZiAodHlwZW9mIHJ1bGUgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0cnVsZSA9IG5ldyBydWxlKCk7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgd2UgZ290IGFuIGFycmF5IG9mIGBydWxlTmFtZWBzLCByZWN1cnNpdmVseSBhZGQgdW5kZXIgZWFjaCBuYW1lIHdpdGggdGhlIHNhbWUgYHJ1bGVgLlxuXHRcdGlmIChBcnJheS5pc0FycmF5KHJ1bGVOYW1lKSkge1xuXHRcdFx0cnVsZU5hbWUuZm9yRWFjaChydWxlTmFtZSA9PiB0aGlzLmFkZFJ1bGUocnVsZU5hbWUsIHJ1bGUpICk7XG5cdFx0XHRyZXR1cm4gcnVsZTtcblx0XHR9XG5cblx0XHQvLyBBZGQgdG8gb3VyIGxpc3Qgb2YgX3J1bGVzXG5cdFx0dGhpcy5fbWVyZ2VSdWxlKHRoaXMuX3J1bGVzLCBydWxlTmFtZSwgcnVsZSk7XG5cdFx0cmV0dXJuIHJ1bGU7XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIGNvbmNhdGVuYXRlZCBibGFja2xpc3QgZm9yIGEgZ2l2ZW4gbmFtZWQgcnVsZS5cblx0Z2V0QmxhY2tsaXN0KHJ1bGVOYW1lKSB7XG5cdCAgY29uc3QgcnVsZSA9IHRoaXMucnVsZXNbcnVsZU5hbWVdO1xuXHQgIGNvbnN0IHJ1bGVzID0gcnVsZSBpbnN0YW5jZW9mIFJ1bGUuQWx0ZXJuYXRpdmVzXG4gICAgICAgICAgPyBydWxlLnJ1bGVzXG4gICAgICAgICAgOiBbIHJ1bGUgXTtcblx0XHRyZXR1cm4gcnVsZXMucmVkdWNlKGZ1bmN0aW9uIChibGFja2xpc3QsIHJ1bGUpIHtcblx0XHRcdHJldHVybiBPYmplY3QuYXNzaWduKGJsYWNrbGlzdCwgcnVsZS5ibGFja2xpc3QpO1xuXHRcdH0sIHt9KTtcblx0fVxuXG4gIC8vIERlZmluZSBtdWx0aXBsZSBydWxlcyBhdCBvbmNlIHVzaW5nIHJ1bGVTeW50YXguXG4gIC8vIFNlZSBgUnVsZVN5bnRheC5qczo6ZGVmaW5lUnVsZSgpYFxuICBkZWZpbmVSdWxlcygpIHtcbiAgICBmb3IgKGNvbnN0IHJ1bGUgb2YgYXJndW1lbnRzKSB7XG4gICAgICB0aGlzLmRlZmluZVJ1bGUocnVsZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gRGVmaW5lIGEgcnVsZSB1c2luZyAocnVsZSlgc3ludGF4YCBvciBgcGF0dGVybnNgIHRvIGNyZWF0ZSB0aGUgcnVsZSBpbnN0YW5jZXMuXG4gIC8vICBgbmFtZWAgKGlkZW50aWZpZXIsIHJlcXVpcmVkKSAgQmFzZSBuYW1lIG9mIHRoZSBydWxlLlxuICAvLyAgYGFsaWFzYCAoc3RyaW5nIG9yIFtzdHJpbmddLCBvcHRpbmFsKSBPdGhlciBuYW1lcyB0byBkZWZpbmUgcnVsZSB1bmRlci5cbiAgLy8gIGBjYW5vbmljYWxgIChzdHJpbmcsIG9wdGlvbmFsKSBDYW5vbmljYWwgbmFtZSBmb3IgdGhlIHJ1bGUsIGF2YWlsYWJsZSBvbiBgUnVsZWAgZm9yIGRlYnVnZ2luZy5cbiAgLy8gIGBjb25zdHJ1Y3RvcmAgKGNsYXNzLCByZXF1aXJlZCkgQ2xhc3Mgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIGluc3RhbnRpYXRlIHRoZSBydWxlLlxuICAvLyAgYHN5bnRheGAgKHN0cmluZywgcmVxdWlyZWQpIFJ1bGVTeW50YXggc3RyaW5nIGZvciB0aGlzIHJ1bGUuXG4gIC8vICBgcGF0dGVybmAgKFJlZ0V4cCwgb3B0aW9uYWwpIFJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgYFBhdHRlcm5gIHJ1bGVzXG4gIC8vICBgcHJlY2VkZW5jZWAgKG51bWJlciwgb3B0aW9uYWwpIFByZWNlZGVuY2UgbnVtYmVyIGZvciB0aGUgcnVsZSAoY3VycmVudGx5IGRvZXNuJ3QgZG8gYW55dGhpbmcpXG4gIC8vICBgYmxhY2tsaXN0YCAoW3N0cmluZ10sIG9wdGlvbmFsKSBBcnJheSBvZiBzdHJpbmdzIGFzIGJsYWNrbGlzdCBmb3IgcGF0dGVybiBydWxlcy5cbiAgLy8gIGBsZWZ0UmVjdXJzaXZlJyAoYm9vbGVhbiwgb3B0aW9uYWwpIFNldCB0byBgdHJ1ZWAgaWYgdGhlIHJ1bGUgaXMgbGVmdC1yZWN1cnNpdmUsXG4gIC8vICAgIGkuZS4gaXQgY2FsbHMgaXRzZWxmIGFzIGEgc3VicnVsZSBiZWZvcmUgbWF0Y2hpbmcgYW55IGxpdGVyYWwgdG9rZW5zXG4gIC8vICBgdGVzdFJ1bGVgIChSdWxlIG9yIHN0cmluZywgb3B0aW9uYWwpIFJ1bGUgb3IgcnVsZSBuYW1lIHRvIHVzZSBhcyBhIHRlc3QgcnVsZVxuICAvLyAgICBzcGVjaWZ5aW5nIHRoaXMgY2FuIGxldCB1cyBqdW1wIG91dCBxdWlja2x5IGlmIHRoZXJlIGlzIG5vIHBvc3NpYmxlIG1hdGNoXG4gIC8vXG4gIC8vIE5vdGUgdGhhdCB3ZSBtdW5nZSB0aGUgYGNvbnN0cnVjdG9yYCBwYXNzZWQgaW4gZm9yIGVmZmljaWVuY3kgd2hpbGUgcGFyc2luZy5cbiAgZGVmaW5lUnVsZSh7XG4gICAgbmFtZSwgY29uc3RydWN0b3IsIGFsaWFzID0gW10sIGNhbm9uaWNhbCxcbiAgICBzeW50YXgsIGJsYWNrbGlzdCxcbiAgICAuLi5vdGhlclByb3BzXG4gICAgLy8gcGF0dGVybiwgcHJlY2VkZW5jZSwgLCBsZWZ0UmVjdXJzaXZlLCB0ZXN0UnVsZVxuICB9KSB7XG4gICAgY29uc3QgbmFtZXMgPSBbbmFtZV0uY29uY2F0KGFsaWFzKTtcblxuICAgIC8vIHRocm93IGlmIHdlJ3JlIHJlLXVzaW5nIGEgY29uc3RydWN0b3JcbiAgICBpZiAoY29uc3RydWN0b3IucHJvdG90eXBlLnJ1bGVOYW1lcykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgcGFyc2VyLmRlZmluZSgpOiBBdHRlbXB0aW5nIHRvIHJlLXVzZSBjb25zdHJ1Y3RvciBmb3IgcnVsZSAnJHtydWxlTmFtZX0nYCk7XG4gICAgfVxuXG4gICAgLy8gU2V0IHByb3BlcnRpZXMgb24gcHJvdG90eXBlLmNvbnN0cnVjdG9yXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLnByb3RvdHlwZSwgXCJydWxlTmFtZXNcIiwgeyB2YWx1ZTogbmFtZXMgfSk7XG4gICAgaWYgKGNhbm9uaWNhbCkgUnVsZVtjYW5vbmljYWxdID0gY29uc3RydWN0b3I7XG4gICAgaWYgKGJsYWNrbGlzdCkge1xuICAgICAgY29uc3QgbWFwID0ge307XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBibGFja2xpc3QpIG1hcFtrZXldID0gdHJ1ZTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb25zdHJ1Y3Rvci5wcm90b3R5cGUsIFwiYmxhY2tsaXN0XCIsIHsgdmFsdWU6IG1hcCB9KTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvdGhlclByb3BzKSkge1xuLy9jb25zb2xlLmluZm8obmFtZSwga2V5LCBvdGhlclByb3BzW2tleV0pO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLnByb3RvdHlwZSwga2V5LCB7IHZhbHVlOiBvdGhlclByb3BzW2tleV0gfSk7XG4gICAgfVxuXG4gICAgY29uc3QgcnVsZSA9IHN5bnRheFxuICAgICAgPyBwYXJzZVJ1bGUoc3ludGF4LCBjb25zdHJ1Y3RvcilcbiAgICAgIDogbmV3IGNvbnN0cnVjdG9yKCk7XG5cbiAgICB0aGlzLmFkZFJ1bGUobmFtZXMsIHJ1bGUpO1xuICB9XG5cblxuLy9cbi8vICMjIyBQYXJzZXIgcmVnaXN0cnkuXG4vL1xuXHRzdGF0aWMgUkVHSVNUUlkgPSB7fTtcblxuXHQvLyBHZXQgYSBwYXJzZXIgZm9yIGEgZ2l2ZW4gYGNvbnRleHROYW1lYC5cblx0Ly8gV2lsbCByZS11c2UgZXhpc3RpbmcgcGFyc2VyLCBvciBjcmVhdGUgYSBuZXcgb25lIGlmIG5vdCBhbHJlYWR5IGRlZmluZWQuXG5cdHN0YXRpYyBmb3JOYW1lKG5hbWUpIHtcblx0XHRpZiAoIVBhcnNlci5SRUdJU1RSWVtuYW1lXSkge1xuXHRcdFx0UGFyc2VyLlJFR0lTVFJZW25hbWVdID0gbmV3IFBhcnNlcih7IG5hbWUgfSk7XG5cdFx0fVxuXHRcdHJldHVybiBQYXJzZXIuUkVHSVNUUllbbmFtZV07XG5cdH1cblxuXG4vL1xuLy8gIyMgVXRpbGl0eSBtZXRob2RzXG4vL1xuXG5cdC8vIEZpbmQgdGhlIG1hdGNoaW5nIGluc3RhbmNlIG9mIChwb3NzaWJseSBuZXN0ZWQpIGBlbmRUb2tlbmAgdG8gYmFsYW5jZSBgc3RhcnRUb2tlbmBcblx0Ly9cdGluIGFycmF5IG9mIGB0b2tlbnNgIChzdHJpbmdzKS5cblx0Ly8gSWYgc3VjY2Vzc2Z1bCwgcmV0dXJucyBgeyBzdGFydCwgZW5kLCBzbGljZSB9YFxuXHQvLyBUaHJvd3MgaWYgdW5zdWNlc3NmdWwuXG5cdHN0YXRpYyBmaW5kTmVzdGVkVG9rZW5zKHRva2Vucywgc3RhcnRUb2tlbiwgZW5kVG9rZW4sIHN0YXJ0ID0gMCkge1xuXHRcdGlmICh0b2tlbnNbc3RhcnRdICE9PSBzdGFydFRva2VuKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEV4cGVjdGVkICcke3N0YXJ0VG9rZW59JyBhdCBpbmRleCAke3N0YXJ0fSBvZiB0b2tlbnNgKTtcblx0XHRsZXQgbmVzdGluZyA9IDA7XG5cdFx0bGV0IG5lc3RlZCA9IGZhbHNlO1xuXHRcdGZvciAobGV0IGVuZCA9IHN0YXJ0ICsgMSwgbGFzdEluZGV4ID0gdG9rZW5zLmxlbmd0aDsgZW5kIDwgbGFzdEluZGV4OyBlbmQrKykge1xuXHRcdFx0bGV0IHRva2VuID0gdG9rZW5zW2VuZF07XG5cdFx0XHRpZiAodG9rZW4gPT09IHN0YXJ0VG9rZW4pIHtcblx0XHRcdFx0bmVzdGluZysrO1xuXHRcdFx0XHRuZXN0ZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRva2VuID09PSBlbmRUb2tlbikge1xuXHRcdFx0XHRpZiAobmVzdGluZyA9PT0gMClcblx0XHRcdFx0XHRyZXR1cm4geyBzdGFydCwgZW5kLCBzbGljZTogdG9rZW5zLnNsaWNlKHN0YXJ0KzEsIGVuZCksIG5lc3RlZCB9O1xuXHRcdFx0XHRuZXN0aW5nLS07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihgQ291bGRuJ3QgZmluZCBtYXRjaGluZyAnJHtlbmRUb2tlbn0ncyBzdGFydGluZyBhdCBpdGVtICR7c3RhcnR9YCk7XG5cdH1cbn1cblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1BhcnNlci5qcyIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgdmFyIFJFQUNUX0VMRU1FTlRfVFlQRSA9ICh0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmXG4gICAgU3ltYm9sLmZvciAmJlxuICAgIFN5bWJvbC5mb3IoJ3JlYWN0LmVsZW1lbnQnKSkgfHxcbiAgICAweGVhYzc7XG5cbiAgdmFyIGlzVmFsaWRFbGVtZW50ID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICBvYmplY3QgIT09IG51bGwgJiZcbiAgICAgIG9iamVjdC4kJHR5cGVvZiA9PT0gUkVBQ1RfRUxFTUVOVF9UWVBFO1xuICB9O1xuXG4gIC8vIEJ5IGV4cGxpY2l0bHkgdXNpbmcgYHByb3AtdHlwZXNgIHlvdSBhcmUgb3B0aW5nIGludG8gbmV3IGRldmVsb3BtZW50IGJlaGF2aW9yLlxuICAvLyBodHRwOi8vZmIubWUvcHJvcC10eXBlcy1pbi1wcm9kXG4gIHZhciB0aHJvd09uRGlyZWN0QWNjZXNzID0gdHJ1ZTtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2ZhY3RvcnlXaXRoVHlwZUNoZWNrZXJzJykoaXNWYWxpZEVsZW1lbnQsIHRocm93T25EaXJlY3RBY2Nlc3MpO1xufSBlbHNlIHtcbiAgLy8gQnkgZXhwbGljaXRseSB1c2luZyBgcHJvcC10eXBlc2AgeW91IGFyZSBvcHRpbmcgaW50byBuZXcgcHJvZHVjdGlvbiBiZWhhdmlvci5cbiAgLy8gaHR0cDovL2ZiLm1lL3Byb3AtdHlwZXMtaW4tcHJvZFxuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZmFjdG9yeVdpdGhUaHJvd2luZ1NoaW1zJykoKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9wcm9wLXR5cGVzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAzNThcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVzZS1iZWZvcmUtZGVmaW5lICovXG4vKipcbiAqIEBtb2R1bGUgZXZlbnRIYW5kbGVyc1xuICpcbiAqL1xuaW1wb3J0IGRvbUhlbHBlcnMgZnJvbSAnLi9saWIvZG9tX2hlbHBlcnMnO1xuaW1wb3J0IGxpc3RlbmVycyBmcm9tICcuL2xpYi9saXN0ZW5lcnMnO1xuaW1wb3J0ICogYXMgc3RvcmUgZnJvbSAnLi9zdG9yZSc7XG5cbi8qKlxuICogcHJpdmF0ZVxuICpcbiAqL1xuXG4vKipcbiAqIF9vbkNsaWNrXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgVGhlIGNsaWNrIGV2ZW50IG9iamVjdFxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50LnRhcmdldCBUaGUgRE9NIG5vZGUgZnJvbSB0aGUgY2xpY2sgZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9vbkNsaWNrKF9yZWYpIHtcbiAgdmFyIHRhcmdldCA9IF9yZWYudGFyZ2V0O1xuXG4gIHN0b3JlLmFjdGl2YXRlKFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoc3RvcmUuZ2V0SW5zdGFuY2VzKCkpKS5yZWR1Y2UoZG9tSGVscGVycy5maW5kQ29udGFpbmVyTm9kZXModGFyZ2V0KSwgW10pLnNvcnQoZG9tSGVscGVycy5zb3J0QnlET01Qb3NpdGlvbikubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uaW5zdGFuY2U7XG4gIH0pKTtcbn1cblxuLyoqXG4gKiBfb25LZXlEb3duOiBUaGUga2V5ZG93biBldmVudCBjYWxsYmFja1xuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IFRoZSBrZXlkb3duIGV2ZW50IG9iamVjdFxuICogQHBhcmFtIHtudW1iZXJ9IGV2ZW50LndoaWNoIFRoZSBrZXkgY29kZSAod2hpY2gpIHJlY2VpdmVkIGZyb20gdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9vbktleURvd24oZXZlbnQpIHtcbiAgdmFyIGZvcmNlQ29uc2lkZXIgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuXG4gIGlmIChmb3JjZUNvbnNpZGVyIHx8IF9zaG91bGRDb25zaWRlcihldmVudCkpIHtcbiAgICB2YXIgX3JlZjIgPSBzdG9yZS5maW5kQmluZGluZ0ZvckV2ZW50KGV2ZW50KSB8fCB7fSxcbiAgICAgICAgZm4gPSBfcmVmMi5mbixcbiAgICAgICAgaW5zdGFuY2UgPSBfcmVmMi5pbnN0YW5jZTtcblxuICAgIGlmIChmbikge1xuICAgICAgZm4uY2FsbChpbnN0YW5jZSwgZXZlbnQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBfc2hvdWxkQ29uc2lkZXI6IENvbmRpdGlvbnMgZm9yIHByb2NlZWRpbmcgd2l0aCBrZXkgZXZlbnQgaGFuZGxpbmdcbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCBUaGUga2V5ZG93biBldmVudCBvYmplY3RcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudC50YXJnZXQgVGhlIG5vZGUgb3JpZ2luIG9mIHRoZSBldmVudFxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0byBjb250aW51ZSBwcm9jZXNpbmcgdGhlIGtleWRvd24gZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9zaG91bGRDb25zaWRlcihfcmVmMykge1xuICB2YXIgY3RybEtleSA9IF9yZWYzLmN0cmxLZXksXG4gICAgICB0YXJnZXQgPSBfcmVmMy50YXJnZXQ7XG5cbiAgcmV0dXJuIGN0cmxLZXkgfHwgIX5bJ0lOUFVUJywgJ1NFTEVDVCcsICdURVhUQVJFQSddLmluZGV4T2YodGFyZ2V0LnRhZ05hbWUpICYmICghdGFyZ2V0LmdldEF0dHJpYnV0ZSB8fCB0YXJnZXQuZ2V0QXR0cmlidXRlKCdyb2xlJykgIT09ICd0ZXh0Ym94Jyk7XG59XG5cbi8qKlxuICogcHVibGljXG4gKlxuICovXG5cbi8qKlxuICogb25Nb3VudFxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKi9cbmZ1bmN0aW9uIG9uTW91bnQoaW5zdGFuY2UpIHtcbiAgc3RvcmUuYWN0aXZhdGUoaW5zdGFuY2UpO1xuICBsaXN0ZW5lcnMuYmluZEtleXMoX29uS2V5RG93bik7XG4gIGxpc3RlbmVycy5iaW5kQ2xpY2tzKF9vbkNsaWNrKTtcbiAgZG9tSGVscGVycy5iaW5kRm9jdXNhYmxlcyhpbnN0YW5jZSwgc3RvcmUuYWN0aXZhdGUpO1xufVxuXG4vKipcbiAqIG9uVW5tb3VudFxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKi9cbmZ1bmN0aW9uIG9uVW5tb3VudChpbnN0YW5jZSkge1xuICBzdG9yZS5kZWxldGVJbnN0YW5jZShpbnN0YW5jZSk7XG4gIGlmIChzdG9yZS5pc0VtcHR5KCkpIHtcbiAgICBsaXN0ZW5lcnMudW5iaW5kQ2xpY2tzKF9vbkNsaWNrKTtcbiAgICBsaXN0ZW5lcnMudW5iaW5kS2V5cyhfb25LZXlEb3duKTtcbiAgfVxufVxuXG5leHBvcnQgeyBvbk1vdW50LCBvblVubW91bnQgfTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9ldmVudF9oYW5kbGVycy5qc1xuLy8gbW9kdWxlIGlkID0gMzgxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IG1vZGlmaWVycyBhcyBtb2RpZmllcktleXMsIEFMTF9LRVlTLCBBTExfUFJJTlRBQkxFX0tFWVMgfSBmcm9tICcuL2tleXMnO1xuXG52YXIgUFJJTlRBQkxFX0NIQVJBQ1RFUlMgPSAnMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVp+IUAjJCVeJiooKS1fKz1bXVxcXFx7fXw7XFwnOlwiLC4vPD4/wqMnO1xuXG52YXIgbW9kS2V5cyA9IE9iamVjdC5rZXlzKG1vZGlmaWVyS2V5cyk7XG5cbmZ1bmN0aW9uIG1hdGNoS2V5cyhfcmVmKSB7XG4gIHZhciBrZXlTZXQgPSBfcmVmLmtleVNldCxcbiAgICAgIGV2ZW50ID0gX3JlZi5ldmVudDtcbiAgdmFyIGtleSA9IGtleVNldC5rZXksXG4gICAgICBfa2V5U2V0JG1vZGlmaWVycyA9IGtleVNldC5tb2RpZmllcnMsXG4gICAgICBtb2RpZmllcnMgPSBfa2V5U2V0JG1vZGlmaWVycyA9PT0gdW5kZWZpbmVkID8gW10gOiBfa2V5U2V0JG1vZGlmaWVycztcblxuICB2YXIga2V5c01hdGNoID0gdm9pZCAwO1xuXG4gIGtleXNNYXRjaCA9IGtleSA9PT0gQUxMX0tFWVM7XG5cbiAgaWYgKGtleSA9PT0gQUxMX1BSSU5UQUJMRV9LRVlTKSB7XG4gICAgaWYgKGV2ZW50LmtleSkge1xuICAgICAgLy8gTW9kZXJuIGJyb3dzZXJzIGltcGxlbWVudCBga2V5YCwgc28gaWYgYGtleWAgaXMgbGVuZ3RoIDEsIHdlIGhhdmUgYSBtYXRjaC4gZS5nLiAnYScgZm9yIHRoZVxuICAgICAgLy8gYSBrZXksIG9yICcyJyBmb3IgdGhlIDIga2V5LiBBbGwgb3RoZXIgbm9uLXByaW50YWJsZSBjaGFyYWN0ZXJzIGhhdmUgbmFtZXMsIGUuZy4gJ0VudGVyJyBvciAnQmFja3NwYWNlJy5cbiAgICAgIGtleXNNYXRjaCA9IGV2ZW50LmtleS5sZW5ndGggPT09IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZvciBicm93c2VycyB0aGF0IGRvIG5vIHN1cHBvcnQgYGV2ZW50LmtleWAsIHdlIHRlc3QgYWdhaW5zdCBhIGxpc3Qgb2YgY2hhcmFjdGVyc1xuICAgICAgdmFyIHByZXNzZWRDaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZShldmVudC5jaGFyQ29kZSk7XG4gICAgICBrZXlzTWF0Y2ggPSBQUklOVEFCTEVfQ0hBUkFDVEVSUy5pbmRleE9mKHByZXNzZWRDaGFyKSA+PSAwO1xuICAgIH1cbiAgfVxuXG4gIGlmIChrZXkgPT09IGV2ZW50LndoaWNoKSB7XG4gICAgdmFyIGV2dE1vZEtleXMgPSBtb2RLZXlzLmZpbHRlcihmdW5jdGlvbiAobW9kS2V5KSB7XG4gICAgICByZXR1cm4gZXZlbnRbbW9kS2V5ICsgJ0tleSddO1xuICAgIH0pLnNvcnQoKTtcbiAgICBrZXlzTWF0Y2ggPSBtb2RpZmllcnMubGVuZ3RoID09PSBldnRNb2RLZXlzLmxlbmd0aCAmJiBtb2RpZmllcnMuZXZlcnkoZnVuY3Rpb24gKG1vZEtleSwgaW5kZXgpIHtcbiAgICAgIHJldHVybiBldnRNb2RLZXlzW2luZGV4XSA9PT0gbW9kS2V5O1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGtleXNNYXRjaDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWF0Y2hLZXlzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9tYXRjaF9rZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSAzODJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IEtleXMsIHsgbW9kaWZpZXJzIH0gZnJvbSAnLi9rZXlzJztcblxuZnVuY3Rpb24gcGFyc2VLZXlzKGtleXNBcnJheSkge1xuICByZXR1cm4ga2V5c0FycmF5Lm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGtleVNldCA9IHsga2V5OiBrZXkgfTtcbiAgICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhciBrZXlTdHJpbmcgPSBrZXkudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgICB2YXIgbWF0Y2hlcyA9IGtleVN0cmluZy5zcGxpdCgvXFxzP1xcK1xccz8vKTtcbiAgICAgIGtleVNldCA9IG1hdGNoZXMubGVuZ3RoID09PSAxID8geyBrZXk6IEtleXNba2V5U3RyaW5nXSB9IDoge1xuICAgICAgICBrZXk6IEtleXNbbWF0Y2hlcy5wb3AoKV0sXG4gICAgICAgIG1vZGlmaWVyczogbWF0Y2hlcy5tYXAoZnVuY3Rpb24gKG1vZEtleSkge1xuICAgICAgICAgIHJldHVybiBtb2RpZmllcnNbbW9kS2V5XTtcbiAgICAgICAgfSkuc29ydCgpXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ga2V5U2V0O1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcGFyc2VLZXlzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9wYXJzZV9rZXlzLmpzXG4vLyBtb2R1bGUgaWQgPSAzODNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbnZhciBzdHlsZXNJbkRvbSA9IHt9LFxuXHRtZW1vaXplID0gZnVuY3Rpb24oZm4pIHtcblx0XHR2YXIgbWVtbztcblx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKHR5cGVvZiBtZW1vID09PSBcInVuZGVmaW5lZFwiKSBtZW1vID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdHJldHVybiBtZW1vO1xuXHRcdH07XG5cdH0sXG5cdGlzT2xkSUUgPSBtZW1vaXplKGZ1bmN0aW9uKCkge1xuXHRcdC8vIFRlc3QgZm9yIElFIDw9IDkgYXMgcHJvcG9zZWQgYnkgQnJvd3NlcmhhY2tzXG5cdFx0Ly8gQHNlZSBodHRwOi8vYnJvd3NlcmhhY2tzLmNvbS8jaGFjay1lNzFkODY5MmY2NTMzNDE3M2ZlZTcxNWMyMjJjYjgwNVxuXHRcdC8vIFRlc3RzIGZvciBleGlzdGVuY2Ugb2Ygc3RhbmRhcmQgZ2xvYmFscyBpcyB0byBhbGxvdyBzdHlsZS1sb2FkZXIgXG5cdFx0Ly8gdG8gb3BlcmF0ZSBjb3JyZWN0bHkgaW50byBub24tc3RhbmRhcmQgZW52aXJvbm1lbnRzXG5cdFx0Ly8gQHNlZSBodHRwczovL2dpdGh1Yi5jb20vd2VicGFjay1jb250cmliL3N0eWxlLWxvYWRlci9pc3N1ZXMvMTc3XG5cdFx0cmV0dXJuIHdpbmRvdyAmJiBkb2N1bWVudCAmJiBkb2N1bWVudC5hbGwgJiYgIXdpbmRvdy5hdG9iO1xuXHR9KSxcblx0Z2V0RWxlbWVudCA9IChmdW5jdGlvbihmbikge1xuXHRcdHZhciBtZW1vID0ge307XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG5cdFx0XHRpZiAodHlwZW9mIG1lbW9bc2VsZWN0b3JdID09PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdG1lbW9bc2VsZWN0b3JdID0gZm4uY2FsbCh0aGlzLCBzZWxlY3Rvcik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbWVtb1tzZWxlY3Rvcl1cblx0XHR9O1xuXHR9KShmdW5jdGlvbiAoc3R5bGVUYXJnZXQpIHtcblx0XHRyZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzdHlsZVRhcmdldClcblx0fSksXG5cdHNpbmdsZXRvbkVsZW1lbnQgPSBudWxsLFxuXHRzaW5nbGV0b25Db3VudGVyID0gMCxcblx0c3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AgPSBbXSxcblx0Zml4VXJscyA9IHJlcXVpcmUoXCIuL2ZpeFVybHNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlzdCwgb3B0aW9ucykge1xuXHRpZih0eXBlb2YgREVCVUcgIT09IFwidW5kZWZpbmVkXCIgJiYgREVCVUcpIHtcblx0XHRpZih0eXBlb2YgZG9jdW1lbnQgIT09IFwib2JqZWN0XCIpIHRocm93IG5ldyBFcnJvcihcIlRoZSBzdHlsZS1sb2FkZXIgY2Fubm90IGJlIHVzZWQgaW4gYSBub24tYnJvd3NlciBlbnZpcm9ubWVudFwiKTtcblx0fVxuXG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRvcHRpb25zLmF0dHJzID0gdHlwZW9mIG9wdGlvbnMuYXR0cnMgPT09IFwib2JqZWN0XCIgPyBvcHRpb25zLmF0dHJzIDoge307XG5cblx0Ly8gRm9yY2Ugc2luZ2xlLXRhZyBzb2x1dGlvbiBvbiBJRTYtOSwgd2hpY2ggaGFzIGEgaGFyZCBsaW1pdCBvbiB0aGUgIyBvZiA8c3R5bGU+XG5cdC8vIHRhZ3MgaXQgd2lsbCBhbGxvdyBvbiBhIHBhZ2Vcblx0aWYgKHR5cGVvZiBvcHRpb25zLnNpbmdsZXRvbiA9PT0gXCJ1bmRlZmluZWRcIikgb3B0aW9ucy5zaW5nbGV0b24gPSBpc09sZElFKCk7XG5cblx0Ly8gQnkgZGVmYXVsdCwgYWRkIDxzdHlsZT4gdGFncyB0byB0aGUgPGhlYWQ+IGVsZW1lbnRcblx0aWYgKHR5cGVvZiBvcHRpb25zLmluc2VydEludG8gPT09IFwidW5kZWZpbmVkXCIpIG9wdGlvbnMuaW5zZXJ0SW50byA9IFwiaGVhZFwiO1xuXG5cdC8vIEJ5IGRlZmF1bHQsIGFkZCA8c3R5bGU+IHRhZ3MgdG8gdGhlIGJvdHRvbSBvZiB0aGUgdGFyZ2V0XG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ1bmRlZmluZWRcIikgb3B0aW9ucy5pbnNlcnRBdCA9IFwiYm90dG9tXCI7XG5cblx0dmFyIHN0eWxlcyA9IGxpc3RUb1N0eWxlcyhsaXN0LCBvcHRpb25zKTtcblx0YWRkU3R5bGVzVG9Eb20oc3R5bGVzLCBvcHRpb25zKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcblx0XHR2YXIgbWF5UmVtb3ZlID0gW107XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGl0ZW0gPSBzdHlsZXNbaV07XG5cdFx0XHR2YXIgZG9tU3R5bGUgPSBzdHlsZXNJbkRvbVtpdGVtLmlkXTtcblx0XHRcdGRvbVN0eWxlLnJlZnMtLTtcblx0XHRcdG1heVJlbW92ZS5wdXNoKGRvbVN0eWxlKTtcblx0XHR9XG5cdFx0aWYobmV3TGlzdCkge1xuXHRcdFx0dmFyIG5ld1N0eWxlcyA9IGxpc3RUb1N0eWxlcyhuZXdMaXN0LCBvcHRpb25zKTtcblx0XHRcdGFkZFN0eWxlc1RvRG9tKG5ld1N0eWxlcywgb3B0aW9ucyk7XG5cdFx0fVxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBtYXlSZW1vdmUubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBkb21TdHlsZSA9IG1heVJlbW92ZVtpXTtcblx0XHRcdGlmKGRvbVN0eWxlLnJlZnMgPT09IDApIHtcblx0XHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKVxuXHRcdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKCk7XG5cdFx0XHRcdGRlbGV0ZSBzdHlsZXNJbkRvbVtkb21TdHlsZS5pZF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufTtcblxuZnVuY3Rpb24gYWRkU3R5bGVzVG9Eb20oc3R5bGVzLCBvcHRpb25zKSB7XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgaXRlbSA9IHN0eWxlc1tpXTtcblx0XHR2YXIgZG9tU3R5bGUgPSBzdHlsZXNJbkRvbVtpdGVtLmlkXTtcblx0XHRpZihkb21TdHlsZSkge1xuXHRcdFx0ZG9tU3R5bGUucmVmcysrO1xuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKGl0ZW0ucGFydHNbal0pO1xuXHRcdFx0fVxuXHRcdFx0Zm9yKDsgaiA8IGl0ZW0ucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0ZG9tU3R5bGUucGFydHMucHVzaChhZGRTdHlsZShpdGVtLnBhcnRzW2pdLCBvcHRpb25zKSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBwYXJ0cyA9IFtdO1xuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGl0ZW0ucGFydHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0cGFydHMucHVzaChhZGRTdHlsZShpdGVtLnBhcnRzW2pdLCBvcHRpb25zKSk7XG5cdFx0XHR9XG5cdFx0XHRzdHlsZXNJbkRvbVtpdGVtLmlkXSA9IHtpZDogaXRlbS5pZCwgcmVmczogMSwgcGFydHM6IHBhcnRzfTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gbGlzdFRvU3R5bGVzKGxpc3QsIG9wdGlvbnMpIHtcblx0dmFyIHN0eWxlcyA9IFtdO1xuXHR2YXIgbmV3U3R5bGVzID0ge307XG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGl0ZW0gPSBsaXN0W2ldO1xuXHRcdHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuXHRcdHZhciBjc3MgPSBpdGVtWzFdO1xuXHRcdHZhciBtZWRpYSA9IGl0ZW1bMl07XG5cdFx0dmFyIHNvdXJjZU1hcCA9IGl0ZW1bM107XG5cdFx0dmFyIHBhcnQgPSB7Y3NzOiBjc3MsIG1lZGlhOiBtZWRpYSwgc291cmNlTWFwOiBzb3VyY2VNYXB9O1xuXHRcdGlmKCFuZXdTdHlsZXNbaWRdKVxuXHRcdFx0c3R5bGVzLnB1c2gobmV3U3R5bGVzW2lkXSA9IHtpZDogaWQsIHBhcnRzOiBbcGFydF19KTtcblx0XHRlbHNlXG5cdFx0XHRuZXdTdHlsZXNbaWRdLnBhcnRzLnB1c2gocGFydCk7XG5cdH1cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIHN0eWxlRWxlbWVudCkge1xuXHR2YXIgc3R5bGVUYXJnZXQgPSBnZXRFbGVtZW50KG9wdGlvbnMuaW5zZXJ0SW50bylcblx0aWYgKCFzdHlsZVRhcmdldCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0SW50bycgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuXHR9XG5cdHZhciBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCA9IHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wW3N0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLmxlbmd0aCAtIDFdO1xuXHRpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ0b3BcIikge1xuXHRcdGlmKCFsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCkge1xuXHRcdFx0c3R5bGVUYXJnZXQuaW5zZXJ0QmVmb3JlKHN0eWxlRWxlbWVudCwgc3R5bGVUYXJnZXQuZmlyc3RDaGlsZCk7XG5cdFx0fSBlbHNlIGlmKGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKSB7XG5cdFx0XHRzdHlsZVRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGVFbGVtZW50LCBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcC5uZXh0U2libGluZyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0eWxlVGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlRWxlbWVudCk7XG5cdFx0fVxuXHRcdHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLnB1c2goc3R5bGVFbGVtZW50KTtcblx0fSBlbHNlIGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcImJvdHRvbVwiKSB7XG5cdFx0c3R5bGVUYXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGVFbGVtZW50KTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHZhbHVlIGZvciBwYXJhbWV0ZXIgJ2luc2VydEF0Jy4gTXVzdCBiZSAndG9wJyBvciAnYm90dG9tJy5cIik7XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuXHRzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xuXHR2YXIgaWR4ID0gc3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AuaW5kZXhPZihzdHlsZUVsZW1lbnQpO1xuXHRpZihpZHggPj0gMCkge1xuXHRcdHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLnNwbGljZShpZHgsIDEpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKSB7XG5cdHZhciBzdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG5cdG9wdGlvbnMuYXR0cnMudHlwZSA9IFwidGV4dC9jc3NcIjtcblxuXHRhdHRhY2hUYWdBdHRycyhzdHlsZUVsZW1lbnQsIG9wdGlvbnMuYXR0cnMpO1xuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgc3R5bGVFbGVtZW50KTtcblx0cmV0dXJuIHN0eWxlRWxlbWVudDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTGlua0VsZW1lbnQob3B0aW9ucykge1xuXHR2YXIgbGlua0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcblx0b3B0aW9ucy5hdHRycy50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuXHRvcHRpb25zLmF0dHJzLnJlbCA9IFwic3R5bGVzaGVldFwiO1xuXG5cdGF0dGFjaFRhZ0F0dHJzKGxpbmtFbGVtZW50LCBvcHRpb25zLmF0dHJzKTtcblx0aW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIGxpbmtFbGVtZW50KTtcblx0cmV0dXJuIGxpbmtFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBhdHRhY2hUYWdBdHRycyhlbGVtZW50LCBhdHRycykge1xuXHRPYmplY3Qua2V5cyhhdHRycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGFkZFN0eWxlKG9iaiwgb3B0aW9ucykge1xuXHR2YXIgc3R5bGVFbGVtZW50LCB1cGRhdGUsIHJlbW92ZSwgdHJhbnNmb3JtUmVzdWx0O1xuXG5cdC8vIElmIGEgdHJhbnNmb3JtIGZ1bmN0aW9uIHdhcyBkZWZpbmVkLCBydW4gaXQgb24gdGhlIGNzc1xuXHRpZiAob3B0aW9ucy50cmFuc2Zvcm0gJiYgb2JqLmNzcykge1xuXHQgICAgdHJhbnNmb3JtUmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm0ob2JqLmNzcyk7XG5cdCAgICBcblx0ICAgIGlmICh0cmFuc2Zvcm1SZXN1bHQpIHtcblx0ICAgIFx0Ly8gSWYgdHJhbnNmb3JtIHJldHVybnMgYSB2YWx1ZSwgdXNlIHRoYXQgaW5zdGVhZCBvZiB0aGUgb3JpZ2luYWwgY3NzLlxuXHQgICAgXHQvLyBUaGlzIGFsbG93cyBydW5uaW5nIHJ1bnRpbWUgdHJhbnNmb3JtYXRpb25zIG9uIHRoZSBjc3MuXG5cdCAgICBcdG9iai5jc3MgPSB0cmFuc2Zvcm1SZXN1bHQ7XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgXHQvLyBJZiB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIHJldHVybnMgYSBmYWxzeSB2YWx1ZSwgZG9uJ3QgYWRkIHRoaXMgY3NzLiBcblx0ICAgIFx0Ly8gVGhpcyBhbGxvd3MgY29uZGl0aW9uYWwgbG9hZGluZyBvZiBjc3Ncblx0ICAgIFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHQgICAgXHRcdC8vIG5vb3Bcblx0ICAgIFx0fTtcblx0ICAgIH1cblx0fVxuXG5cdGlmIChvcHRpb25zLnNpbmdsZXRvbikge1xuXHRcdHZhciBzdHlsZUluZGV4ID0gc2luZ2xldG9uQ291bnRlcisrO1xuXHRcdHN0eWxlRWxlbWVudCA9IHNpbmdsZXRvbkVsZW1lbnQgfHwgKHNpbmdsZXRvbkVsZW1lbnQgPSBjcmVhdGVTdHlsZUVsZW1lbnQob3B0aW9ucykpO1xuXHRcdHVwZGF0ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZUVsZW1lbnQsIHN0eWxlSW5kZXgsIGZhbHNlKTtcblx0XHRyZW1vdmUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50LCBzdHlsZUluZGV4LCB0cnVlKTtcblx0fSBlbHNlIGlmKG9iai5zb3VyY2VNYXAgJiZcblx0XHR0eXBlb2YgVVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgVVJMLmNyZWF0ZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIFVSTC5yZXZva2VPYmplY3RVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBCbG9iID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0c3R5bGVFbGVtZW50ID0gY3JlYXRlTGlua0VsZW1lbnQob3B0aW9ucyk7XG5cdFx0dXBkYXRlID0gdXBkYXRlTGluay5iaW5kKG51bGwsIHN0eWxlRWxlbWVudCwgb3B0aW9ucyk7XG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcblx0XHRcdGlmKHN0eWxlRWxlbWVudC5ocmVmKVxuXHRcdFx0XHRVUkwucmV2b2tlT2JqZWN0VVJMKHN0eWxlRWxlbWVudC5ocmVmKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHN0eWxlRWxlbWVudCA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKTtcblx0XHR1cGRhdGUgPSBhcHBseVRvVGFnLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50KTtcblx0XHRyZW1vdmUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuXHRcdH07XG5cdH1cblxuXHR1cGRhdGUob2JqKTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlU3R5bGUobmV3T2JqKSB7XG5cdFx0aWYobmV3T2JqKSB7XG5cdFx0XHRpZihuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXApXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdHVwZGF0ZShvYmogPSBuZXdPYmopO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZW1vdmUoKTtcblx0XHR9XG5cdH07XG59XG5cbnZhciByZXBsYWNlVGV4dCA9IChmdW5jdGlvbiAoKSB7XG5cdHZhciB0ZXh0U3RvcmUgPSBbXTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gKGluZGV4LCByZXBsYWNlbWVudCkge1xuXHRcdHRleHRTdG9yZVtpbmRleF0gPSByZXBsYWNlbWVudDtcblx0XHRyZXR1cm4gdGV4dFN0b3JlLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG4nKTtcblx0fTtcbn0pKCk7XG5cbmZ1bmN0aW9uIGFwcGx5VG9TaW5nbGV0b25UYWcoc3R5bGVFbGVtZW50LCBpbmRleCwgcmVtb3ZlLCBvYmopIHtcblx0dmFyIGNzcyA9IHJlbW92ZSA/IFwiXCIgOiBvYmouY3NzO1xuXG5cdGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSByZXBsYWNlVGV4dChpbmRleCwgY3NzKTtcblx0fSBlbHNlIHtcblx0XHR2YXIgY3NzTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcyk7XG5cdFx0dmFyIGNoaWxkTm9kZXMgPSBzdHlsZUVsZW1lbnQuY2hpbGROb2Rlcztcblx0XHRpZiAoY2hpbGROb2Rlc1tpbmRleF0pIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChjaGlsZE5vZGVzW2luZGV4XSk7XG5cdFx0aWYgKGNoaWxkTm9kZXMubGVuZ3RoKSB7XG5cdFx0XHRzdHlsZUVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNzc05vZGUsIGNoaWxkTm9kZXNbaW5kZXhdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGNzc05vZGUpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBhcHBseVRvVGFnKHN0eWxlRWxlbWVudCwgb2JqKSB7XG5cdHZhciBjc3MgPSBvYmouY3NzO1xuXHR2YXIgbWVkaWEgPSBvYmoubWVkaWE7XG5cblx0aWYobWVkaWEpIHtcblx0XHRzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibWVkaWFcIiwgbWVkaWEpXG5cdH1cblxuXHRpZihzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuXHRcdHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG5cdH0gZWxzZSB7XG5cdFx0d2hpbGUoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcblx0XHRcdHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG5cdFx0fVxuXHRcdHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcblx0fVxufVxuXG5mdW5jdGlvbiB1cGRhdGVMaW5rKGxpbmtFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcblx0dmFyIGNzcyA9IG9iai5jc3M7XG5cdHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuXG5cdC8qIElmIGNvbnZlcnRUb0Fic29sdXRlVXJscyBpc24ndCBkZWZpbmVkLCBidXQgc291cmNlbWFwcyBhcmUgZW5hYmxlZFxuXHRhbmQgdGhlcmUgaXMgbm8gcHVibGljUGF0aCBkZWZpbmVkIHRoZW4gbGV0cyB0dXJuIGNvbnZlcnRUb0Fic29sdXRlVXJsc1xuXHRvbiBieSBkZWZhdWx0LiAgT3RoZXJ3aXNlIGRlZmF1bHQgdG8gdGhlIGNvbnZlcnRUb0Fic29sdXRlVXJscyBvcHRpb25cblx0ZGlyZWN0bHlcblx0Ki9cblx0dmFyIGF1dG9GaXhVcmxzID0gb3B0aW9ucy5jb252ZXJ0VG9BYnNvbHV0ZVVybHMgPT09IHVuZGVmaW5lZCAmJiBzb3VyY2VNYXA7XG5cblx0aWYgKG9wdGlvbnMuY29udmVydFRvQWJzb2x1dGVVcmxzIHx8IGF1dG9GaXhVcmxzKXtcblx0XHRjc3MgPSBmaXhVcmxzKGNzcyk7XG5cdH1cblxuXHRpZihzb3VyY2VNYXApIHtcblx0XHQvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNjYwMzg3NVxuXHRcdGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIgKyBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpICsgXCIgKi9cIjtcblx0fVxuXG5cdHZhciBibG9iID0gbmV3IEJsb2IoW2Nzc10sIHsgdHlwZTogXCJ0ZXh0L2Nzc1wiIH0pO1xuXG5cdHZhciBvbGRTcmMgPSBsaW5rRWxlbWVudC5ocmVmO1xuXG5cdGxpbmtFbGVtZW50LmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXG5cdGlmKG9sZFNyYylcblx0XHRVUkwucmV2b2tlT2JqZWN0VVJMKG9sZFNyYyk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qc1xuLy8gbW9kdWxlIGlkID0gNDc2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IG9ic2VydmVyIH0gZnJvbSBcIm1vYngtcmVhY3RcIjtcbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBrZXlkb3duIGZyb20gXCJyZWFjdC1rZXlkb3duXCI7XG5pbXBvcnQgeyBCdXR0b24sIERyb3Bkb3duLCBHcmlkLCBNZW51LCBTZWdtZW50LCBUZXh0QXJlYSB9IGZyb20gJ3NlbWFudGljLXVpLXJlYWN0J1xuXG5pbXBvcnQgRXhhbXBsZVN0b3JlIGZyb20gXCIuL0V4YW1wbGVTdG9yZVwiO1xuaW1wb3J0IFNwYWNlciBmcm9tIFwiLi9TcGFjZXIuanN4XCI7XG5pbXBvcnQgXCIuL3N0eWxlcy5sZXNzXCI7XG5pbXBvcnQgVGFiYmFibGVUZXh0QXJlYSBmcm9tIFwiLi9UYWJiYWJsZVRleHRBcmVhLmpzeFwiO1xuXG5Ab2JzZXJ2ZXJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwZWxsRWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0c3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcblx0XHRleGFtcGxlczogbmV3IEV4YW1wbGVTdG9yZSgpXG5cdH07XG5cblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcyk7XG53aW5kb3cuZXhhbXBsZXMgPSBwcm9wcy5leGFtcGxlcztcblx0XHR0aGlzLnByb3BzLmV4YW1wbGVzLmxvYWQoKTtcblxuXHRcdC8vREVCVUdcblx0XHR3aW5kb3cuc3BlbGxFZGl0b3IgPSB0aGlzO1xuXHRcdHdpbmRvdy5leGFtcGxlcyA9IHRoaXMucHJvcHMuZXhhbXBsZXM7XG5cdH1cblxuXHRAa2V5ZG93bihcImN0cmwrc1wiKVxuXHRzYXZlKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLnNhdmUoKTsgfVxuXG5cdEBrZXlkb3duKFwiY3RybCtyXCIpXG5cdHJldmVydCgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5yZXZlcnQoKTsgfVxuXG5cdEBrZXlkb3duKFwiY3RybCtjXCIpXG5cdGNvbXBpbGUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuY29tcGlsZSgpOyB9XG5cblx0QGtleWRvd24oXCJjdHJsK25cIilcblx0Y3JlYXRlKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLmNyZWF0ZSgpOyB9XG5cblx0QGtleWRvd24oXCJjdHJsK2RcIilcblx0ZGVsZXRlKCkgeyB0aGlzLnByb3BzLmV4YW1wbGVzLmRlbGV0ZSh1bmRlZmluZWQsIFwiQ09ORklSTVwiKTsgfVxuXG5cdHJlbmFtZSgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5yZW5hbWUoKTsgfVxuXHRkdXBsaWNhdGUoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMuZHVwbGljYXRlKCk7IH1cblx0bG9hZCgpIHsgdGhpcy5wcm9wcy5leGFtcGxlcy5sb2FkKCk7IH1cblx0cmVzZXQoKSB7IHRoaXMucHJvcHMuZXhhbXBsZXMucmVzZXQoKTsgfVxuXG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCB7IGV4YW1wbGVzIH0gPSB0aGlzLnByb3BzO1xuXHRcdGxldCB7IHRpdGxlcywgc2VsZWN0ZWQsIGRpcnR5LCBjb2RlLCBvdXRwdXQgfSA9IGV4YW1wbGVzO1xuXG5cdFx0Ly8gQ3JlYXRlIG1lbnVpdGVtcyBmcm9tIHRoZSBleGFtcGxlc1xuXHRcdGxldCBvcHRpb25zID0gdGl0bGVzLm1hcCggdGl0bGUgPT5cblx0XHRcdCh7XG5cdFx0XHRcdHZhbHVlOiB0aXRsZSxcblx0XHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0XHR0ZXh0OiB0aXRsZSxcblx0XHRcdFx0Y29udGVudDogdGl0bGUsXG5cdFx0XHRcdG9uQ2xpY2s6ICgpID0+IGV4YW1wbGVzLnNlbGVjdCh0aXRsZSlcblx0XHRcdH0pKTtcblxuXHRcdGxldCBkaXJ0eUJ1dHRvbnMgPSAoKSA9PiB7XG5cdFx0XHRpZiAoIWRpcnR5KSByZXR1cm47XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8TWVudSBzZWNvbmRhcnkgc3R5bGU9e3sgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgcmlnaHQ6IFwiMXJlbVwiLCB0b3A6IFwiM3B4XCIsIG1hcmdpbjogMCB9fT5cblx0XHRcdFx0XHQ8QnV0dG9uIG5lZ2F0aXZlIG9uQ2xpY2s9eygpID0+IHRoaXMucmV2ZXJ0KCl9Pjx1PlI8L3U+ZXZlcnQ8L0J1dHRvbj5cblx0XHRcdFx0XHQ8QnV0dG9uIHBvc2l0aXZlIG9uQ2xpY2s9eygpID0+IHRoaXMuc2F2ZSgpfT48dT5TPC91PmF2ZTwvQnV0dG9uPlxuXHRcdFx0XHQ8L01lbnU+XG5cdFx0XHQpO1xuXHRcdH07XG5cblx0XHRsZXQgY29tcGlsZUJ1dHRvbiA9ICgpID0+IHtcblx0XHRcdGlmIChvdXRwdXQpIHJldHVybjtcblx0XHRcdHJldHVybiA8QnV0dG9uXG5cdFx0XHRcdFx0c3R5bGU9e3sgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgIHdpZHRoOiBcIjRlbVwiLCBsZWZ0OiBcImNhbGMoNTAlIC0gMmVtKVwiLCB0b3A6IFwiNTAlXCIgfX1cblx0XHRcdFx0XHRvbkNsaWNrPXsoKSA9PiB0aGlzLmNvbXBpbGUoKX1cblx0XHRcdFx0XHRpY29uPVwicmlnaHQgY2hldnJvblwiLz47XG5cdFx0fTtcblxuXHRcdHJldHVybiAoXG5cdFx0PEdyaWQgc3RyZXRjaGVkIHBhZGRlZCBjbGFzc05hbWU9XCJmdWxsSGVpZ2h0XCI+XG5cdFx0XHQ8R3JpZC5Sb3cgc3R5bGU9e3sgaGVpZ2h0OiBcIjJyZW1cIiwgcGFkZGluZ1RvcDogXCIwcmVtXCIgfX0gY2xhc3NOYW1lPVwidWkgaW52ZXJ0ZWQgYXR0YWNoZWQgbWVudVwiPlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezd9PlxuXHRcdFx0XHRcdDxNZW51IGludmVydGVkIGF0dGFjaGVkIGZsdWlkPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbT5FeGFtcGxlOjwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdFx0PERyb3Bkb3duIGl0ZW0gc2VsZWN0aW9uIG9wdGlvbnM9e29wdGlvbnN9IHZhbHVlPXtzZWxlY3RlZH0gc3R5bGU9e3sgd2lkdGg6IFwiMjBlbVwiIH19Lz5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0gb25DbGljaz17KCkgPT4gdGhpcy5kZWxldGUoKX0+PHU+RDwvdT5lbGV0ZTwvTWVudS5JdGVtPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbSBvbkNsaWNrPXsoKSA9PiB0aGlzLnJlbmFtZSgpfT5SZW5hbWU8L01lbnUuSXRlbT5cblx0XHRcdFx0XHRcdDxNZW51Lkl0ZW0gb25DbGljaz17KCkgPT4gdGhpcy5kdXBsaWNhdGUoKX0+RHVwbGljYXRlPC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0PC9NZW51PlxuXHRcdFx0XHQ8L0dyaWQuQ29sdW1uPlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezJ9PlxuXHRcdFx0XHRcdDxNZW51IGludmVydGVkIGF0dGFjaGVkIGZsdWlkPlxuXHRcdFx0XHRcdFx0PFNwYWNlciBmbHVpZC8+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtIG9uQ2xpY2s9eygpID0+IHRoaXMuY3JlYXRlKCl9Pjx1Pk48L3U+ZXc8L01lbnUuSXRlbT5cblx0XHRcdFx0XHRcdDxTcGFjZXIgZmx1aWQvPlxuXHRcdFx0XHRcdDwvTWVudT5cblx0XHRcdFx0PC9HcmlkLkNvbHVtbj5cblx0XHRcdFx0PEdyaWQuQ29sdW1uIHdpZHRoPXs3fT5cblx0XHRcdFx0XHQ8TWVudSBpbnZlcnRlZCBhdHRhY2hlZCBmbHVpZD5cblx0XHRcdFx0XHRcdDxTcGFjZXIgZmx1aWQvPlxuXHRcdFx0XHRcdFx0PE1lbnUuSXRlbSBvbkNsaWNrPXsoKSA9PiB0aGlzLmxvYWQoKX0+UmVsb2FkPC9NZW51Lkl0ZW0+XG5cdFx0XHRcdFx0XHQ8TWVudS5JdGVtIG9uQ2xpY2s9eygpID0+IHRoaXMucmVzZXQoKX0+UmVzZXQ8L01lbnUuSXRlbT5cblx0XHRcdFx0XHQ8L01lbnU+XG5cdFx0XHRcdDwvR3JpZC5Db2x1bW4+XG5cdFx0XHQ8L0dyaWQuUm93PlxuXHRcdFx0PEdyaWQuUm93IHN0eWxlPXt7IGhlaWdodDogXCJjYWxjKDEwMCUgLSAzcmVtKVwiIH19PlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezh9PlxuXHRcdFx0XHRcdDxUYWJiYWJsZVRleHRBcmVhXG5cdFx0XHRcdFx0XHRjbGFzc05hbWU9XCJ1aSBzZWdtZW50XCJcblx0XHRcdFx0XHRcdHZhbHVlPXtjb2RlfVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyhldmVudCkgPT4gZXhhbXBsZXMudXBkYXRlKGV4YW1wbGVzLnNlbGVjdGVkLCBldmVudC50YXJnZXQudmFsdWUsIFwiU0tJUF9TQVZFXCIpfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0e2RpcnR5QnV0dG9ucygpfVxuXHRcdFx0XHQ8L0dyaWQuQ29sdW1uPlxuXHRcdFx0XHQ8R3JpZC5Db2x1bW4gd2lkdGg9ezh9PlxuXHRcdFx0XHRcdDxUZXh0QXJlYSBjbGFzc05hbWU9XCJ1aSBzZWdtZW50XCIgdmFsdWU9e291dHB1dH0vPlxuXHRcdFx0XHQ8L0dyaWQuQ29sdW1uPlxuXHRcdFx0XHR7Y29tcGlsZUJ1dHRvbigpfVxuXHRcdFx0PC9HcmlkLlJvdz5cblx0XHQ8L0dyaWQ+XG5cdCk7fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2FwcC9TcGVsbEVkaXRvci5qc3giLCIvLyBFeHBvcnQgYWxsIHN0YW5kYXJkIFwic3BlbGxcIiBydWxlcy5cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4uLy4uL1BhcnNlclwiO1xuaW1wb3J0IFRva2VuaXplciBmcm9tIFwiLi4vLi4vVG9rZW5pemVyLmpzXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZS5qc1wiO1xuXG4vLyBMb2FkIGFsbCBzdGFuZGFyZCBydWxlcyBmaWxlcy5cbmltcG9ydCBcIi4vY29yZVwiO1xuaW1wb3J0IFwiLi9saXN0c1wiO1xuaW1wb3J0IFwiLi9vcGVyYXRvcnNcIjtcbmltcG9ydCBcIi4vaWZcIjtcbmltcG9ydCBcIi4vc3RhdGVtZW50c1wiO1xuaW1wb3J0IFwiLi90eXBlc1wiO1xuaW1wb3J0IFwiLi9KU1hcIjtcblxuLy8gQ3JlYXRlIHBhcnNlciB3aGljaCBjb21iaW5lcyBhbGwgb2YgdGhlIGFib3ZlLi4uXG5jb25zdCBwYXJzZXIgPSBQYXJzZXIuZm9yTmFtZShcInNwZWxsXCIpO1xuLy8gLi4ud2hpY2ggZGVwZW5kcyBvbiBydWxlcyBsb2FkZWQgYWJvdmUuLi5cbnBhcnNlci5pbXBvcnQoXCJjb3JlXCIsIFwibGlzdHNcIiwgXCJvcGVyYXRvcnNcIiwgXCJpZlwiLCBcInN0YXRlbWVudHNcIiwgXCJ0eXBlc1wiLCBcIkpTWFwiKTtcbi8vIC4uLmFzIHRoZSBkZWZhdWx0IGV4cG9ydFxuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG4vLyBTdGljayBvdGhlciBzdHVmZiBvbiBgd2luZG93YCBmb3IgcmVmbGVjdGlvbiBhbmQgYWQtaG9jIHRlc3RpbmcuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRPYmplY3QuYXNzaWduKHdpbmRvdywge1xuXHRcdFRva2VuaXplcixcblx0XHRSdWxlLFxuXHRcdFBhcnNlcixcblxuXHRcdHRva2VuaXplOiBUb2tlbml6ZXIudG9rZW5pemUuYmluZChleHBvcnRzLlRva2VuaXplciksXG5cdFx0cGFyc2VyLFxuXHRcdHBhcnNlOiBwYXJzZXIucGFyc2UuYmluZChwYXJzZXIpLFxuXHRcdGNvbXBpbGU6IHBhcnNlci5jb21waWxlLmJpbmQocGFyc2VyKSxcblx0fSk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvaW5kZXguanMiLCIvKiBTdG9yZSBvZiBleGFtcGxlIHNwZWxsIGNvZGUgZnJhZ21lbnRzLiAqL1xuaW1wb3J0IG1vYngsIHsgb2JzZXJ2YWJsZSwgY29tcHV0ZWQgfSBmcm9tIFwibW9ieFwiO1xuXG4vLyBNYWtlIFBhcnNlciBhbmQgVG9rZW5pemVyIFdBUk4gYXMgd2UgcnVuXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi9QYXJzZXJcIjtcblBhcnNlci5XQVJOID0gdHJ1ZTtcblBhcnNlci5ERUJVRyA9IHRydWU7XG5QYXJzZXIuVElNRSA9IHRydWU7XG5cbmltcG9ydCBUb2tlbml6ZXIgZnJvbSBcIi4uL1Rva2VuaXplclwiO1xuVG9rZW5pemVyLldBUk4gPSB0cnVlO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4YW1wbGVTdG9yZSB7XG5cdC8vIENVUlJFTlQgZXhhbXBsZXNcblx0QG9ic2VydmFibGUgZXhhbXBsZXMgPSB7fTtcblx0Ly8gRXhhbXBsZXMgYXMgb2YgbGFzdCBzYXZlIChmb3IgcmV2ZXIpXG5cdEBvYnNlcnZhYmxlIF9zYXZlZEV4YW1wbGVzID0ge307XG5cdC8vIFNlbGVjdGVkIGV4YW1wbGUga2V5LlxuXHRAb2JzZXJ2YWJsZSBzZWxlY3RlZCA9IFwiXCI7XG5cdC8vIENvbXBpbGVkIG91dHB1dC5cblx0QG9ic2VydmFibGUgb3V0cHV0ID0gXCJcIjtcblxuXHQvLyBSZXR1cm4ganVzdCB0aGUgdGl0bGVzIG9mIHRoZSBleGFtcGxlcy5cblx0QGNvbXB1dGVkIGdldCB0aXRsZXMoKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuZXhhbXBsZXMpO1xuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBjb2RlIGZvciB0aGUgY3VycmVudCBleGFtcGxlXG5cdEBjb21wdXRlZCBnZXQgY29kZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5leGFtcGxlc1t0aGlzLnNlbGVjdGVkXTtcblx0fVxuXG5cdC8vIElzIEFOWVRISU5HIGRpcnR5P1xuXHRAY29tcHV0ZWQgZ2V0IGRpcnR5KCkge1xuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLl9zYXZlZEV4YW1wbGVzKSAhPT0gSlNPTi5zdHJpbmdpZnkodGhpcy5leGFtcGxlcyk7XG5cdH1cblxuXHQvLyBSZXNldCBhbGwgZXhhbXBsZXMgZnJvbSBsb2NhbFN0b3JhZ2UuXG5cdHJlc2V0KCkge1xuXHRcdGRlbGV0ZSBsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlcztcblx0XHRkZWxldGUgbG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZTtcblx0XHR3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG5cdH1cblxuXHQvLyBMb2FkIGV4YW1wbGVzXG5cdGxvYWQoKSB7XG5cdFx0Ly8gTG9hZCBleGFtcGxlcyBmcm9tIGxvY2FsU3RvcmFnZVxuXHRcdHRoaXMuZXhhbXBsZXMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5zcGVsbEVkaXRvckV4YW1wbGVzXG5cdFx0XHR8fCAne1wiRm9vXCI6XCJkZWZpbmUgdHlwZSBGb29cIiwgXCJCYXJcIjpcImRlZmluZSB0eXBlIEJhclwifScpO1xuXG5cdFx0Ly8gU2F2ZSBhIGNvcHkgb2YgZXhhbXBsZXMgZm9yIHJldmVydFxuXHRcdHRoaXMuX3NhdmVkRXhhbXBsZXMgPSB0aGlzLmV4YW1wbGVzO1xuXG5cdFx0Ly8gTG9hZCBzZWxlY3RlZCBleGFtcGxlIG5hbWVcblx0XHR0aGlzLnNlbGVjdChsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlKTtcblx0fVxuXG5cdC8vIFNhdmUgY3VycmVudCBleGFtcGxlcy5cblx0c2F2ZSgpIHtcblx0XHRsb2NhbFN0b3JhZ2Uuc3BlbGxFZGl0b3JFeGFtcGxlcyA9IEpTT04uc3RyaW5naWZ5KHRoaXMuZXhhbXBsZXMpO1xuXG5cdFx0Ly8gU2F2ZSBhIGNvcHkgb2YgZXhhbXBsZXMgZm9yIHJldmVydFxuXHRcdHRoaXMuX3NhdmVkRXhhbXBsZXMgPSB0aGlzLmV4YW1wbGVzO1xuXHR9XG5cblx0Ly8gUmV2ZXJ0IHRoZSBjdXJyZW50IGV4YW1wbGVcblx0cmV2ZXJ0KGV4YW1wbGUgPSB0aGlzLnNlbGVjdGVkKSB7XG5cdFx0dGhpcy51cGRhdGUoZXhhbXBsZSwgdGhpcy5fc2F2ZWRFeGFtcGxlc1tleGFtcGxlXSk7XG5cdH1cblxuXHQvLyBTZWxlY3QgYSBkaWZmZXJlbnQgZXhhbXBsZS5cblx0c2VsZWN0KGV4YW1wbGUpIHtcblx0XHRpZiAoIWV4YW1wbGUgfHwgdGhpcy5leGFtcGxlc1tleGFtcGxlXSA9PSBudWxsKSBleGFtcGxlID0gT2JqZWN0LmtleXModGhpcy5leGFtcGxlcylbMF0gfHwgXCJcIjtcblx0XHR0aGlzLnNlbGVjdGVkID0gbG9jYWxTdG9yYWdlLnNwZWxsRWRpdG9yRXhhbXBsZSA9IGV4YW1wbGU7XG5cdFx0dGhpcy5vdXRwdXQgPSBcIlwiO1xuXHR9XG5cblx0Ly8gQ3JlYXRlIGEgbmV3IGV4YW1wbGUuXG5cdC8vIFNhdmVzIGFuZCBzZWxlY3RzIHRoZSBleGFtcGxlIGF1dG9tYXRpY2FsbHkuXG5cdHVwZGF0ZShuYW1lLCBjb2RlLCBza2lwU2F2ZSkge1xuXHRcdHRoaXMuZXhhbXBsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmV4YW1wbGVzLCB7IFsgbmFtZSBdOiBjb2RlIH0pO1xuXHRcdHRoaXMuc2VsZWN0KG5hbWUpO1xuXHRcdHRoaXMub3V0cHV0ID0gXCJcIjtcblx0XHRpZiAoIXNraXBTYXZlKSB0aGlzLnNhdmUoKTtcblx0fVxuXG5cdC8vIERlbGV0ZSBhbiBleGFtcGxlLlxuXHQvLyBTYXZlcyBhbmQgc2VsZWN0cyBhbm90aGVyIGV4YW1wbGUgYXV0b21hdGljYWxseS5cblx0ZGVsZXRlKG5hbWUgPSB0aGlzLnNlbGVjdGVkLCBzaG93Q29uZmlybSkge1xuXHRcdGlmIChzaG93Q29uZmlybSAmJiAhY29uZmlybShgUmVhbGx5IGRlbGV0ZSBleGFtcGxlICR7bmFtZX0/YCkpIHJldHVybjtcblx0XHRsZXQgZXhhbXBsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmV4YW1wbGVzKTtcblx0XHRkZWxldGUgZXhhbXBsZXNbbmFtZV07XG5cdFx0dGhpcy5leGFtcGxlcyA9IGV4YW1wbGVzO1xuXHRcdHRoaXMuc2F2ZSgpO1xuXHRcdHRoaXMuc2VsZWN0KCk7XG5cdH1cblxuXHQvLyBDcmVhdGUgYSBuZXcgZXhhbXBsZS5cblx0Y3JlYXRlKG5hbWUsIGNvZGUgPSBcIlwiKSB7XG5cdFx0Ly8gSWYgbm8gbmFtZSwgcHJvbXB0LlxuXHRcdGlmICghbmFtZSkgbmFtZSA9IHByb21wdChcIk5hbWUgZm9yIHRoaXMgZXhhbXBsZT9cIik7XG5cdFx0Ly8gRm9yZ2V0IGl0IGlmIG5vIG5hbWUuXG5cdFx0aWYgKCFuYW1lKSByZXR1cm47XG5cblx0XHR0aGlzLnVwZGF0ZShuYW1lLCBjb2RlKTtcblx0fVxuXG5cdC8vIFJlbmFtZSBhbiBleGFtcGxlLlxuXHQvLyBTZWxlY3RzIGFuZCBzYXZlcyBhdXRvbWF0aWNhbGx5LlxuXHRyZW5hbWUob2xkTmFtZSA9IHRoaXMuc2VsZWN0ZWQsIG5ld05hbWUpIHtcblx0XHQvLyBJZiBubyBuZXcgbmFtZSwgcHJvbXB0LlxuXHRcdGlmICghbmV3TmFtZSkgbmV3TmFtZSA9IHByb21wdChcIk5ldyBuYW1lIGZvciB0aGlzIGV4YW1wbGU/XCIsIG9sZE5hbWUpO1xuXG5cdFx0Ly8gRm9yZ2V0IGl0IGlmIG5vIG5hbWUgc3VwcGxpZWQgb3IgbmFtZSBpcyB0aGUgc2FtZVxuXHRcdGlmICghbmV3TmFtZSB8fCBuZXdOYW1lID09PSBvbGROYW1lKSByZXR1cm47XG5cdFx0aWYgKHRoaXMuZXhhbXBsZXNbbmV3TmFtZV0pIHJldHVybiBjb25zb2xlLndhcm4oYGV4YW1wbGVzLnJlbmFtZShcIiR7bmV3TmFtZX1cIik6IG5hbWUgYWxyZWFkeSBpbiB1c2VgKTtcblxuXHRcdGxldCBjb2RlID0gdGhpcy5leGFtcGxlc1tvbGROYW1lXTtcblx0XHR0aGlzLmRlbGV0ZShvbGROYW1lKTtcblx0XHR0aGlzLnVwZGF0ZShuZXdOYW1lLCBjb2RlKTtcblx0fVxuXG5cdC8vIER1cGxpY2F0ZSBhbiBleGFtcGxlLlxuXHRkdXBsaWNhdGUob2xkTmFtZSA9IHRoaXMuc2VsZWN0ZWQsIG5ld05hbWUpIHtcblx0XHQvLyBJZiBubyBuZXcgbmFtZSwgcHJvbXB0LlxuXHRcdGlmICghbmV3TmFtZSkgbmV3TmFtZSA9IHByb21wdChcIk5ldyBuYW1lIGZvciBkdXBsaWNhdGUgZXhhbXBsZT9cIiwgb2xkTmFtZSk7XG5cdFx0Ly8gRm9yZ2V0IGl0IGlmIG5vIG5hbWUgc3VwcGxpZWQgb3IgbmFtZSBpcyB0aGUgc2FtZVxuXHRcdGlmICghbmV3TmFtZSB8fCBuZXdOYW1lID09PSBvbGROYW1lKSByZXR1cm47XG5cdFx0aWYgKHRoaXMuZXhhbXBsZXNbbmV3TmFtZV0pIHJldHVybiBjb25zb2xlLndhcm4oYGV4YW1wbGVzLnJlbmFtZShcIiR7bmV3TmFtZX1cIik6IG5hbWUgYWxyZWFkeSBpbiB1c2VgKTtcblxuXHRcdHRoaXMudXBkYXRlKG5ld05hbWUsIHRoaXMuY29kZSk7XG5cdH1cblxuXHQvLyBDb21waWxlIHRoZSBjdXJyZW50IGV4YW1wbGUsIHBsYWNpbmcgaXQgaW4gb3VyIGBvdXRwdXRgLlxuLy9UT0RPOiBzb21lIHdheSB0byBkbyB0aGlzIGF1dG9tYXRpY2FsbHkgdy8gXCJvdXRwdXRcIiA/XG5cdGNvbXBpbGUoKSB7XG5cdFx0dGhpcy5vdXRwdXQgPSBcIi4uLmNvbXBpbGluZy4uLlwiO1xuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0bGV0IHJlc3VsdCA9IHBhcnNlci5wYXJzZShcInN0YXRlbWVudHNcIiwgdGhpcy5jb2RlKTtcblx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihcIkNhbid0IHBhcnNlIVwiKTtcblx0XHRcdFx0dGhpcy5vdXRwdXQgPSBcIkNhbid0IHBhcnNlIHN0YXRlbWVudHNcIjtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmluZm8oXCJSZXN1bHRcIiwgcmVzdWx0KTtcblx0XHRcdFx0dGhpcy5vdXRwdXQgPSByZXN1bHQudG9Tb3VyY2UocGFyc2VyKTtcblx0XHRcdH1cblx0XHR9LCAxMDApO1xuXHR9XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hcHAvRXhhbXBsZVN0b3JlLmpzIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0xMTU3NTkwMjhcbnZhciBnbG9iYWwgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lk1hdGggPT0gTWF0aFxuICA/IHdpbmRvdyA6IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnICYmIHNlbGYuTWF0aCA9PSBNYXRoID8gc2VsZlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3LWZ1bmNcbiAgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuaWYgKHR5cGVvZiBfX2cgPT0gJ251bWJlcicpIF9fZyA9IGdsb2JhbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZ2xvYmFsLmpzXG4vLyBtb2R1bGUgaWQgPSA0OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vXG4vLyAgPFNwYWNlcj4gY29tcG9uZW50IGZvciB1c2Ugd2l0aCBvYWsuXG4vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSBcInByb3AtdHlwZXNcIjtcbmltcG9ydCB7IGNsYXNzTmFtZXMgfSBmcm9tIFwiLi91dGlsXCI7XG5cbmltcG9ydCBcIi4vU3BhY2VyLmxlc3NcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU3BhY2VyKHByb3BzKSB7XG4gIGNvbnN0IHtcbiAgICBjbGFzc05hbWUsXG4gICAgYXBwZWFyYW5jZSwgc2l6ZSwgd2lkdGgsIGhlaWdodCxcbiAgICBpbmxpbmUsIGZsdWlkLCB0aW55LCBzbWFsbCwgbWVkaXVtLCBsYXJnZSwgaHVnZSwgbWFzc2l2ZVxuICB9ID0gcHJvcHM7XG5cbiAgY29uc3Qgc3BhY2VyUHJvcHMgPSB7XG4gICAgY2xhc3NOYW1lOiBjbGFzc05hbWVzKGNsYXNzTmFtZSwgXCJvYWtcIiwgc2l6ZSwgYXBwZWFyYW5jZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgeyBpbmxpbmUsIGZsdWlkIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3BhY2VyXCIpLFxuICAgIHN0eWxlOiB7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICB9XG4gIH1cblxuICByZXR1cm4gPGRpdiB7Li4uc3BhY2VyUHJvcHN9Lz47XG59XG5cblNwYWNlci5wcm9wVHlwZXMgPSB7XG4gIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgYXBwZWFyYW5jZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgc2l6ZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIsXG4gIGhlaWdodDogUHJvcFR5cGVzLm51bWJlcixcblxuICBpbmxpbmU6IFByb3BUeXBlcy5ib29sLFxuICBmbHVpZDogUHJvcFR5cGVzLmJvb2wsXG5cbn07XG5cblNwYWNlci5kZWZhdWx0UHJvcHMgPSB7XG4gIHNpemU6IFwibWVkaXVtXCJcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hcHAvU3BhY2VyLmpzeCIsImltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBwcm9wVHlwZXMgZnJvbSBcInByb3AtdHlwZXNcIjtcbmltcG9ydCB7IFRleHRBcmVhIH0gZnJvbSAnc2VtYW50aWMtdWktcmVhY3QnXG5cbi8vXG4vL1x0IyA8VGFiYmFibGVUZXh0QXJlYT4gLS0gPFNVSS5UZXh0QXJlYT4gaW4gd2hpY2ggeW91IGNhbiB0eXBlIGEgdGFiIGNoYXJhY3Rlcjpcbi8vXHQtIElmIG5vdGhpbmcgaXMgc2VsZWN0ZWQsIGluc2VydHMgYSB0YWIgY2hhcmFjdGVyXG4vL1x0LSBJZiBhbnl0aGluZyBpcyBzZWxlY3RlZCwgaW5zZXJ0cyB0YWIgY2hhcmFjdGVycyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lKHMpXG4vL1x0LSBJZiBzaGlmdCBrZXkgaXMgZG93biwgaW5zZXJ0cyB0YWIgY2hhcmFjdGVycyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lKHMpLlxuLy9cbi8vXHQjIyMgUHJvcGVydGllc1xuLy9cdC0gYHNhdmVgIChyZXF1aXJlZCkgLS0gZnVuY3Rpb24gdXNlZCB0byBzYXZlIHRoZSByZXN1bHRzIG9uIGtleXByZXNzXG4vL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFiYmFibGVUZXh0QXJlYSBleHRlbmRzIFRleHRBcmVhIHtcblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiA8VGV4dEFyZWEgey4uLnRoaXMucHJvcHN9IG9uS2V5RG93bj17dGhpcy5vbktleURvd259IC8+O1xuXHR9XG5cblx0Ly8gRG8gTk9UIGV4aXQgb24gdGFiIC0tIGluc2VydCBvciByZW1vdmUgdGFiKHMpIHZhbHVlIGluc3RlYWQuXG5cdG9uS2V5RG93biA9IChldmVudCkgPT4ge1xuXG4vL1RPRE8gZmlyZSBgdGhpcy5wcm9wcy5vbktleURvd25gIGlmIGRlZmluZWQuLi5cblx0XHQvLyBGb3JnZXQgaXQgaWYgbm90IGEgdGFiXG5cdFx0aWYgKGV2ZW50LmtleUNvZGUgIT09IDkpIHJldHVybjtcblxuXHRcdC8vIHByZXZlbnQgZGVmYXVsdCBzbyB3ZSBkb24ndCBleGl0IHRoZSBmaWVsZFxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHQvLyBmaWd1cmUgb3V0IHRoZSB0ZXh0IHJhbmdlXG5cdFx0dmFyIGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG5cdFx0dmFyIHRleHQgPSBlbGVtZW50LnZhbHVlO1xuXHRcdHZhciBzdGFydCA9IGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7XG5cdFx0dmFyIGVuZCA9IGVsZW1lbnQuc2VsZWN0aW9uRW5kO1xuXG5cdFx0Ly8gUmVwbGFjZW1lbnQgdGV4dFxuXHRcdGxldCBuZXdUZXh0ID0gXCJcIiwgc2VsZWN0aW9uU3RhcnQgPSBzdGFydCwgc2VsZWN0aW9uRW5kID0gZW5kO1xuXG5cdFx0Ly8gSWYgc2VsZWN0aW9uIGlzIGVtcHR5LFxuXHRcdGlmIChzdGFydCA9PT0gZW5kICYmICFldmVudC5zaGlmdEtleSkge1xuXHRcdFx0bmV3VGV4dCA9IFwiXFx0XCI7XG5cdFx0XHRzZWxlY3Rpb25TdGFydCA9IHNlbGVjdGlvbkVuZCA9IGVuZCArIDE7XG5cdFx0fVxuXHRcdC8vIG90aGVyd2lzZSBpbmRlbnQvZGUtaW5kZW50IGFsbCBvZiB0aGUgbGluZXNcblx0XHRlbHNlIHtcblx0XHQvLyB1c2Ugc3RhcnQgYW5kIGVuZCBvZiBsaW5lKHMpXG4vL2NvbnNvbGUuaW5mbyhgc3RhcnQ6ICR7c3RhcnR9IDoke3RleHRbc3RhcnRdfTogICBlbmQ6ICR7ZW5kfSA6ICR7dGV4dFtlbmRdfTpgKTtcblx0XHRcdGlmICh0ZXh0W3N0YXJ0XSAhPT0gXCJcXG5cIikgc3RhcnQgPSB0ZXh0Lmxhc3RJbmRleE9mKFwiXFxuXCIsIHN0YXJ0KSArIDE7XG5cdFx0XHRpZiAodGV4dFtlbmQtMV0gPT09IFwiXFxuXCIpIGVuZC0tO1xuXHRcdFx0ZWxzZSBpZiAodGV4dFtlbmQrMV0gIT09IFwiXFxuXCIpIGVuZCA9IHRleHQuaW5kZXhPZihcIlxcblwiLCBlbmQpIC0gMTtcbi8vY29uc29sZS5pbmZvKGBzdGFydDogJHtzdGFydH0gOiR7dGV4dFtzdGFydF19OiAgIGVuZDogJHtlbmR9IDogJHt0ZXh0W2VuZF19OmApO1xuXG5cdFx0XHRsZXQgbGluZXMgPSB0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpLnNwbGl0KFwiXFxuXCIpO1xuXHRcdFx0Ly8gaWYgc2hpZnQga2V5IGlzIGRvd24sIFJFTU9WRSBhIHRhYiBmcm9tIGVhY2ggbGluZVxuXHRcdFx0aWYgKGV2ZW50LnNoaWZ0S2V5KSB7XG5cdFx0XHRcdGxpbmVzID0gbGluZXMubWFwKGxpbmUgPT4gbGluZVswXSA9PT0gXCJcXHRcIiA/IGxpbmUuc3Vic3RyKDEpIDogbGluZSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBvdGhlcndpc2UgQUREIGEgdGFiIHRvIGVhY2ggbGluZVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGxpbmVzID0gbGluZXMubWFwKGxpbmUgPT4gXCJcXHRcIiArIGxpbmUpO1xuXHRcdFx0fVxuXHRcdFx0c2VsZWN0aW9uU3RhcnQgPSBzdGFydDtcblx0XHRcdG5ld1RleHQgPSBsaW5lcy5qb2luKFwiXFxuXCIpO1xuXHRcdFx0c2VsZWN0aW9uRW5kID0gc2VsZWN0aW9uU3RhcnQgKyBuZXdUZXh0Lmxlbmd0aCArIDE7XG5cdFx0fVxuXG5cdFx0Ly8gVXBkYXRlIGlucHV0IHZhbHVlLlxuXHRcdGVsZW1lbnQudmFsdWUgXHQ9IHRleHQuc3Vic3RyKDAsIHN0YXJ0KVxuXHRcdFx0XHRcdFx0KyBuZXdUZXh0XG5cdFx0XHRcdFx0XHQrIHRleHQuc3Vic3RyKGVuZCk7XG5cblx0XHQvLyBVcGRhdGUgdGhlIHNlbGVjdGlvblxuXHRcdGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPSBzZWxlY3Rpb25TdGFydDtcblx0XHRlbGVtZW50LnNlbGVjdGlvbkVuZCA9IHNlbGVjdGlvbkVuZDtcblxuXHRcdC8vIERlbGVnYXRlIHRvIGBwcm9wcy5vbkNoYW5nZWAgdG8gc2F2ZSB0aGUgdmFsdWUgb3V0c2lkZSBvZiB0aGUgY29udHJvbFxuXHRcdGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB0aGlzLnByb3BzLm9uQ2hhbmdlKGV2ZW50KTtcblx0fVxuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL1RhYmJhYmxlVGV4dEFyZWEuanN4IiwiLy8gQ29tbW9uIGltcG9ydHNcbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuXG4vLyBQYXJzZXJcbmltcG9ydCBwYXJzZXIgZnJvbSBcIi4uL3J1bGVzL3NwZWxsL2luZGV4LmpzXCI7XG5cbi8vIEFwcC1zcGVjaWZpYyBpbXBvcnRzXG5pbXBvcnQgU3BlbGxFZGl0b3IgZnJvbSBcIi4vU3BlbGxFZGl0b3IuanN4XCI7XG5cbi8vIEtpY2sgb2ZmIG91ciB0b3AtbGV2ZWwgZWxlbWVudFxuUmVhY3RET00ucmVuZGVyKFxuICA8U3BlbGxFZGl0b3IgLz4sXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdC1yb290Jylcbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL2luZGV4LmpzeCIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gIFJlYWN0IFV0aWxpdHkgZnVuY3Rpb25zXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gYGNsYXNzTmFtZXNgLCBjb25jZXB0IHN0b2xlbiBmcm9tOiAgaHR0cDovL2plZHdhdHNvbi5naXRodWIuaW8vY2xhc3NuYW1lc1xuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzTmFtZXMgKC4uLmFyZ3MpIHtcbiAgcmV0dXJuIGFyZ3MubWFwKCBhcmcgPT4ge1xuICAgIGlmICghYXJnKSByZXR1cm4gXCJcIjtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSByZXR1cm4gY2xhc3NOYW1lcyguLi5hcmcpO1xuICAgIHN3aXRjaCAodHlwZW9mIGFyZykge1xuICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgY2FzZSBcInN0cmluZ1wiOiAgcmV0dXJuIGFyZztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhhcmcpLm1hcCgga2V5ID0+IGFyZ1trZXldID8ga2V5IDogXCJcIilcbiAgICAgICAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICAgICAgICAgICAgLmpvaW4oXCIgXCIpO1xuICAgIH1cbiAgfSkuZmlsdGVyKEJvb2xlYW4pXG4gICAgLmpvaW4oXCIgXCIpO1xufVxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXBwL3V0aWwuanMiLCIvLyBNZW1vaXplL2ZvcmdldCBzZW1hbnRpY3MuXG5cbi8vIFJldHVybiBhIG1lbW9pemluZyBnZXR0ZXIgZnVuY3Rpb24uXG4vLyBURVNUTUVcbmV4cG9ydCBmdW5jdGlvbiBtZW1vaXplZChwcm9wZXJ0eSwgZ2V0dGVyKSB7XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRpZiAodGhpc1twcm9wZXJ0eV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dmFyIHZhbHVlID0gZ2V0dGVyLmFwcGx5KHRoaXMpO1xuXHRcdFx0aWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Ly8gRGVmaW5lIHNvIHRoYXQgd2UgY2FuIGJlIGRlbGV0ZWQgYW5kIHJlLWRlZmluZWQsIGJ1dCBub3Qgc2V0IG9yIGVudW1lcmF0ZWQuXG5cdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBwcm9wZXJ0eSwgeyB2YWx1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdGhpc1twcm9wZXJ0eV07XG5cdH1cbn1cblxuXG4vLyBSZXR1cm4gYSBtZW1vaXplIGZ1bmN0aW9uIGZvciB1c2UgYXMgYSBnZXR0ZXIgaW4gYSBgT2JqZWN0LmRlZmluZVByb3BlcnR5KClgXG4vLyBURVNUTUVcbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVNZW1vaXplZChwcm9wZXJ0eSwgZ2V0dGVyKSB7XG5cdHJldHVybiB7XG5cdFx0Z2V0IDogbWVtb2l6ZWQocHJvcGVydHksIGdldHRlcilcblx0fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21lbW9pemUuanMiLCIvL1xuLy9cdCMgUnVsZXMgcGFyc2luZyBqc3hcbi8vXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuLi8uLi9QYXJzZXJcIjtcbmltcG9ydCBUb2tlbml6ZXIgZnJvbSBcIi4uLy4uL1Rva2VuaXplclwiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVcIjtcblxuLy8gQ3JlYXRlIFwiSlNYXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck5hbWUoXCJKU1hcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwianN4XCIsXG4gICAgYWxpYXM6IFsgXCJleHByZXNzaW9uXCIsIFwic3RhdGVtZW50XCIgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MganN4RWxlbWVudCBleHRlbmRzIFJ1bGUge1xuICAgICAgLy8gVGV4dCBzdHJpbmdzIGdldCBlbmNvZGVkIGFzIGB0ZXh0YCBvYmplY3RzIGluIHRoZSB0b2tlbiBzdHJlYW0uXG4gICAgICBwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQgPSB0b2tlbnMubGVuZ3RoKSB7XG4gICAgICAgIGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG4gICAgICAgIGlmICghKHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEVsZW1lbnQpKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSh7XG4gICAgICAgICAgbWF0Y2hlZDogdG9rZW4sXG4gICAgICAgICAgbmV4dFN0YXJ0OiBzdGFydCArIDFcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgb3VyIGF0dHJpYnV0ZXMgdG8gc291cmNlLlxuICAgICAgLy8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBubyBhdHRyaWJ1dGVzLlxuICAgICAgYXR0cnNUb1NvdXJjZShqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIGxldCBhdHRyaWJ1dGVzID0ganN4RWxlbWVudC5hdHRyaWJ1dGVzO1xuICAgICAgICBpZiAoIWF0dHJpYnV0ZXMgfHwgIWF0dHJpYnV0ZXMubGVuZ3RoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgICAgIGxldCBhdHRycyA9IGF0dHJpYnV0ZXMubWFwKCAoeyBuYW1lLCB2YWx1ZSB9KSA9PiB7XG4gICAgICAgICAgLy8gaWYgTk8gdmFsdWUsIGFzc3VtZSBpdCdzIGEgdmFyaWFibGUgb2YgdGhlIHNhbWUgbmFtZVxuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB2YWx1ZSA9IG5hbWU7XG4gICAgICAgICAgLy8gaWYgaXQncyBhbiBhcnJheSwgaXQncyBhIHNwZWxsIGV4cHJlc3Npb24sIHBvc3NpYmx5IHdpdGggbmVzdGVkIEpTWCBlbGVtZW50cy4uLlxuICAgICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5qc3hFeHByZXNzaW9uVG9Tb3VyY2UodmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBlbHNlIGlmIGEgSlNYIGVsZW1lbnQsIHJlY3Vyc2VcbiAgICAvL1RPRE86IGluZGVudC4uLlxuICAgICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgVG9rZW5pemVyLkpTWEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9Tb3VyY2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGlmIGEgbnVtYmVyIG9yIFRleHQgbGl0ZXJhbCwganVzdCB1c2UgaXRcblxuICAgICAgICAgIC8vIHNwZWNpYWwgY2FzZSBgY2xhc3NgIHRvIGBjbGFzc05hbWVgIGJlY2F1c2UgUmVhY3QgaXMgZWZmaW5nIHBlcnNuaWNrZXR5LlxuICAgICAgICAgIGlmIChuYW1lID09PSBcImNsYXNzXCIpIG5hbWUgPSBcImNsYXNzTmFtZVwiO1xuICAgIC8vVE9ETzogZXNjYXBlIG5hbWVzIHdoaWNoIGFyZSBpbnZhbGlkIEpTIGlkZW50aWZpZXJzXG4gICAgICAgICAgcmV0dXJuIGAke25hbWV9OiAke3ZhbHVlfWA7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBgeyAke2F0dHJzLmpvaW4oXCIsIFwiKX0gfWA7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhbiBhcnJheSB3aXRoIHNvdXJjZSBmb3IgZWFjaCBvZiBvdXIgY2hpbGRyZW4uXG4gICAgICAvLyBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIHdlIGRvbid0IGhhdmUgYW55IGNoaWxkcmVuLlxuICAgICAgY2hpbGRyZW5Ub1NvdXJjZShqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIGxldCBjaGlsZHJlbiA9IGpzeEVsZW1lbnQuY2hpbGRyZW47XG4gICAgICAgIGlmICghY2hpbGRyZW4gfHwgY2hpbGRyZW4ubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcbiAgICAvL1RPRE86IGVzY2FwZSBpbm5lciBxdW90ZXMuLi5cbiAgICAgICAgICBpZiAodHlwZW9mIGNoaWxkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAvL2ZvcmdldCBpdCBpZiB3aGl0ZXNwYWNlIG9ubHkuLi4gPz8/XG4gICAgICAgICAgICBsZXQgdGV4dCA9IGNoaWxkLnRyaW0oKTtcbiAgICAgICAgICAgIGlmICghdGV4dCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJldHVybiBgXCIke3RleHR9XCJgO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBUb2tlbml6ZXIuSlNYRWxlbWVudCkge1xuICAgICAgICAgICAgbGV0IGNoaWxkU291cmNlID0gdGhpcy5qc3hFbGVtZW50VG9Tb3VyY2UoY2hpbGQpO1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkU291cmNlLnNwbGl0KFwiXFxuXCIpLmpvaW4oXCJcXG5cXHRcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIFRva2VuaXplci5KU1hFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5qc3hFeHByZXNzaW9uVG9Tb3VyY2UoY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJjaGlsZHJlblRvU291cmNlKCk6IGRvbid0IHVuZGVyc3RhbmQgY2hpbGRcIiArICBjaGlsZCk7XG4gICAgICAgIH0pXG4gICAgICAgIC8vIHJlbW92ZSB1bmRlZmluZWQvZW1wdHkgc3RyaW5nIHJ1bGVzXG4gICAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgSlNYIGV4cHJlc3Npb24gKCBgey4uLn1gICkgdG8gSlMgc291cmNlLlxuICAgICAganN4RXhwcmVzc2lvblRvU291cmNlKGpzeEV4cHJlc3Npb24pIHtcbiAgICAgICAgbGV0IHRva2VucyA9IGpzeEV4cHJlc3Npb24udG9rZW5zO1xuICAgIGNvbnNvbGUuaW5mbyhqc3hFeHByZXNzaW9uLCB0b2tlbnMpO1xuICAgICAgICByZXR1cm4gXCIvXCIgKyBgKlRPRE86ICR7dG9rZW5zLmpvaW4oXCIgXCIpfSpgICsgXCIvXCI7XG4gICAgICB9XG5cbiAgICAgIGpzeEVsZW1lbnRUb1NvdXJjZShqc3hFbGVtZW50ID0gdGhpcy5tYXRjaGVkKSB7XG4gICAgICAgIC8vIGdldCB0aGUgYml0cyBvZiB0aGUgb3V0cHV0XG4gICAgICAgIGxldCB0YWdOYW1lID0gYFwiJHtqc3hFbGVtZW50LnRhZ05hbWV9XCJgO1xuICAgICAgICBsZXQgYXR0cnMgPSB0aGlzLmF0dHJzVG9Tb3VyY2UoanN4RWxlbWVudCk7XG4gICAgICAgIGxldCBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW5Ub1NvdXJjZShqc3hFbGVtZW50KTtcblxuICAgICAgICBsZXQgb3V0cHV0ID0gYGNyZWF0ZUVsZW1lbnQoJHt0YWdOYW1lfWA7XG4gICAgICAgIGlmICghYXR0cnMgJiYgY2hpbGRyZW4pIGF0dHJzID0gXCJudWxsXCI7XG5cbiAgICAgICAgaWYgKGF0dHJzKSBvdXRwdXQgKz0gYCwgJHthdHRyc31gO1xuICAgICAgICBpZiAoY2hpbGRyZW4pIHtcbiAgICAgICAgICBvdXRwdXQgKz0gXCIsXFxuXFx0XCIgKyBjaGlsZHJlbi5qb2luKFwiLFxcblxcdFwiKSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0ICs9IFwiKVwiXG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5qc3hFbGVtZW50VG9Tb3VyY2UodGhpcy5tYXRjaGVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvSlNYLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBpZiBzdGF0ZW1lbnRzLlxuLy9cblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG4vLyBDcmVhdGUgXCJpZlwiIHBhcnNlci5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JOYW1lKFwiaWZcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwiaWZcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiaWYge2NvbmRpdGlvbjpleHByZXNzaW9ufSAodGhlbnw6KT8ge3N0YXRlbWVudH0/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlmXyBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGNvbmRpdGlvbiwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuICAvL1x0XHRcdGlmIChzdGF0ZW1lbnQgJiYgYmxvY2spIHRocm93IG5ldyBTeW50YXhFcnJvcihcImlmIG1heSBvbmx5IGhhdmUgaW5saW5lIHN0YXRlbWVudCBPUiBibG9ja1wiKTtcbiAgICAgICAgbGV0IHN0YXRlbWVudHMgPSBSdWxlLkJsb2NrLmVuY2xvc2VTdGF0ZW1lbnRzKHN0YXRlbWVudCwgYmxvY2spO1xuICAgICAgICByZXR1cm4gYGlmICgke2NvbmRpdGlvbn0pICR7c3RhdGVtZW50c31gO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBOT1RFOiB0aGlzIGlzIE5PVCBhIGJsb2NrIHN0YXRlbWVudC4uLiA/Pz9cbiAge1xuICAgIG5hbWU6IFwiYmFja3dhcmRzX2lmXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIntzdGF0ZW1lbnR9IGlmIHtjb25kaXRpb246ZXhwcmVzc2lvbn0gKD86KGVsc2V8b3RoZXJ3aXNlKSB7ZWxzZVN0YXRlbWVudDpzdGF0ZW1lbnR9KT9cIixcbiAgICBsZWZ0UmVjdXJzaXZlOiB0cnVlLFxuICAgIHRlc3RSdWxlOiBuZXcgUnVsZS5LZXl3b3Jkcyh7IGxpdGVyYWxzOiBbIFwiaWZcIiBdIH0pLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBiYWNrd2FyZHNfaWYgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBjb25kaXRpb24sIHN0YXRlbWVudCwgZWxzZVN0YXRlbWVudCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBsZXQgb3V0cHV0ID0gYGlmICgke2NvbmRpdGlvbn0pIHsgJHtzdGF0ZW1lbnR9IH1gO1xuICAgICAgICBpZiAoZWxzZVN0YXRlbWVudCkgb3V0cHV0ICs9IGBcXG5lbHNlIHsgJHtlbHNlU3RhdGVtZW50fSB9YFxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJlbHNlX2lmXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIihlbHNlfG90aGVyd2lzZSkgaWYge2NvbmRpdGlvbjpleHByZXNzaW9ufSAodGhlbnw6KSB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZWxzZV9pZiBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGNvbmRpdGlvbiwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuICAvL1x0XHRcdGlmIChzdGF0ZW1lbnQgJiYgYmxvY2spIHRocm93IG5ldyBTeW50YXhFcnJvcihcImVsc2UgaWYgbWF5IG9ubHkgaGF2ZSBpbmxpbmUgc3RhdGVtZW50IE9SIGJsb2NrXCIpO1xuICAgICAgICBsZXQgc3RhdGVtZW50cyA9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoc3RhdGVtZW50LCBibG9jayk7XG4gICAgICAgIHJldHVybiBgZWxzZSBpZiAoJHtjb25kaXRpb259KSAke3N0YXRlbWVudHN9YFxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJlbHNlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcIihlbHNlfG90aGVyd2lzZSkgKDopPyB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZWxzZV8gZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBzdGF0ZW1lbnQsIGJsb2NrIH0gPSB0aGlzLnJlc3VsdHM7XG4gIC8vXHRcdFx0aWYgKHN0YXRlbWVudCAmJiBibG9jaykgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiZWxzZSBpZiBtYXkgb25seSBoYXZlIGlubGluZSBzdGF0ZW1lbnQgT1IgYmxvY2tcIik7XG4gICAgICAgIGxldCBzdGF0ZW1lbnRzID0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhzdGF0ZW1lbnQsIGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIGBlbHNlICR7c3RhdGVtZW50c31gXG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL2lmLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBkZWFsaW5nIHdpdGggbGlzdHNcbi8vXG5cbi8vIFRPRE86IGNvbmZpcm0gaWRlbnRpZmllcnMgYXJlIHBsdXJhbCBpbiBzb21lIG9mIHRoZSBiZWxvdz9cbi8vIFRPRE86IGBsaXN0LmNsb25lKClgIHRvIHJldHVybiBuZXcgbGlzdCBvZiBzYW1lIHR5cGUuXG5cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4uLy4uL1BhcnNlclwiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVcIjtcblxuaW1wb3J0IHsgaXNQbHVyYWwsIHNpbmd1bGFyaXplIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3N0cmluZ1wiO1xuXG4vLyBDcmVhdGUgXCJsaXN0c1wiIHBhcnNlci5cbmNvbnN0IHBhcnNlciA9IFBhcnNlci5mb3JOYW1lKFwibGlzdHNcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cblxuLy8gV09SS0lORyBGUk9NIE9USEVSIFJVTEVTICh0ZXN0bWUpXG4vL1x0YHRoZSBsZW5ndGggb2YgPGxpc3Q+YFxuLy9cdGA8dGhpbmc+IGlzIG5vdD8gaW4gPGxpc3Q+YFxuLy9cdGA8bGlzdD4gaXMgbm90PyBlbXB0eWBcbi8vXHRgc2V0IGl0ZW0gMSBvZiBteUxpc3QgdG8gJ2EnYFxuXG5cbi8vIFRPRE86IFx0YGNyZWF0ZSBsaXN0IHdpdGggPGV4cD4sIDxleHA+LCA8ZXhwPmBcbi8vIFRPRE86XHRgZHVwbGljYXRlIGxpc3RgXG4vLyBUT0RPOlx0YGR1cGxpY2F0ZSBsaXN0IHdpdGggPGV4cD4sIDxleHA+LCA8ZXhwPmAgPz8/XG4vLyBUT0RPOlx0YHRoZSBzaXplIG9mIDxsaXN0PmAgPT4gd2lsbCBtYXAgdG8gYGxpc3Quc2l6ZWAuLi5cbi8vXHRcdFx0XHQtIGluc3RhbGwgYHNpemVgIGFzIGFuIGFsaWFzIHRvIGBsZW5ndGhgP1xuLy8gVE9ETzpcdGBtb3ZlIDx0aGluZz4gdG8gZW5kIG9mIDxsaXN0PmAgPz8/XG4vLyBUT0RPOlx0YFNldGAgZm9yIGEgdW5pcXVlIGxpc3Q/XG4vLyBUT0RPOlx0dHlwZWQgbGlzdD9cbi8vIFRPRE86XHRsaXN0IHdoaWNoIHdvbid0IHRha2UgbnVsbC91bmRlZmluZWRcblxuXG5wYXJzZXIuZGVmaW5lUnVsZXMoXG4gIC8vIFJldHVybiB0aGUgbGVuZ3RoIG9mIHRoZSBsaXN0LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X2xlbmd0aFwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwidGhlPyBudW1iZXIgb2Yge2lkZW50aWZpZXJ9IGluIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfbGVuZ3RoIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCwgaWRlbnRpZmllciB9ID0gdGhpcy5yZXN1bHRzO1xuICAvLyBUT0RPOiBzcGVjaWFsIGNhc2UgJ3dvcmRzJywgJ2xpbmVzJywgZXRjXG4gICAgICAgIHJldHVybiBgJHtsaXN0fS5sZW5ndGhgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBSZXR1cm4gdGhlIGZpcnN0IHBvc2l0aW9uIG9mIHNwZWNpZmllZCBpdGVtIGluIHRoZSBsaXN0IGFzIGFuIGFycmF5LlxuICAvLyBJZiBpdGVtIGlzIG5vdCBmb3VuZCwgcmV0dXJucyBgdW5kZWZpbmVkYC5cbiAgLy8gTk9URTogdGhpcyBwb3NpdGlvbiByZXR1cm5lZCBpcyAqKjEtYmFzZWQqKi5cbiAgLy9URVNUTUVcbiAgLy8gVE9ETzogYHBvc2l0aW9uc2AsIGBsYXN0IHBvc2l0aW9uYCwgYGFmdGVyLi4uYFxuICB7XG4gICAgbmFtZTogXCJsaXN0X3Bvc2l0aW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ0aGU/IHBvc2l0aW9uIG9mIHt0aGluZzpleHByZXNzaW9ufSBpbiB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3Bvc2l0aW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5wb3NpdGlvbk9mKCR7dGhpbmd9LCAke2xpc3R9KWBcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy9cbiAgLy9cdE9yZGluYWwgbnVtYmVycyAoZmlyc3QsIHNlY29uZCwgbGFzdCwgZXRjKS5cbiAgLy8gVE9ETzogc2l4dHktZmlmdGgsIHR3byBodW5kcmVkIGZvcnR5IG5pbnRoLi4uXG4gIC8vXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiZmlyc3RcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDEgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInNlY29uZFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gMiB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwidGhpcmRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDMgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImZvdXJ0aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gNCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiZmlmdGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDUgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInNpeHRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiA2IH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJzZXZlbnRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiA3IH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJlaWdodGhcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDggfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcIm5pbnRoXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiA5IH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJ0ZW50aFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gMTAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcInBlbnVsdGltYXRlXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAtMiB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcIm9yZGluYWxcIixcbiAgICBzeW50YXg6IFwiZmluYWxcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIC0xIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJsYXN0XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG9yZGluYWwgZXh0ZW5kcyBSdWxlLktleXdvcmRze1xuICAgICAgdG9Tb3VyY2UoKSB7IHJldHVybiAtMSB9XG4gICAgfVxuICB9LFxuXG5cblxuICAvLyB0cmVhdCBsaXN0IGFzIGEgc3RhY2sgb3IgcXVldWVcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwib3JkaW5hbFwiLFxuICAgIHN5bnRheDogXCJ0b3BcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3JkaW5hbCBleHRlbmRzIFJ1bGUuS2V5d29yZHN7XG4gICAgICB0b1NvdXJjZSgpIHsgcmV0dXJuIDEgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJvcmRpbmFsXCIsXG4gICAgc3ludGF4OiBcImJvdHRvbVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBvcmRpbmFsIGV4dGVuZHMgUnVsZS5LZXl3b3Jkc3tcbiAgICAgIHRvU291cmNlKCkgeyByZXR1cm4gLTEgfVxuICAgIH1cbiAgfSxcblxuXG5cbiAgLy8gSW5kZXggZXhwcmVzc2lvbjogbnVtZXJpYyBwb3NpdGlvbiBpbiBzb21lIGxpc3QuXG4gIC8vXHRlLmcuXHRgY2FyZCAxIG9mIHRoZSBwaWxlYFxuICAvL1x0XHRcdGBjYXJkICMyIG9mIHRoZSBwaWxlYFxuICAvL1x0XHRcdGB0aGUgZmlyc3QgY2FyZCBvZiB0aGUgcGlsZWBcbiAgLy9cbiAgLy8gTk9URTogTmVnYXRpdmUgbnVtZXJpYyBwb3NpdGlvbnMgY29tZSBmcm9tIHRoZSBFTkQgb2YgdGhlIGxpc3QuXG4gIC8vXHRlLmcuXHRgY2FyZCAtMSBvZiB0aGUgcGlsZWBcbiAgLy9cbiAgLy8gTk9URTogT3VyIHBvc2l0aW9ucyBhcmUgKioxLWJhc2VkKiogYW5kIEphdmFzY3JpcHQgaXMgKiowLWJhc2VkKiouXG4gIC8vXHRcdCBlLmcuIGBpdGVtIDEgb2YgdGhlIGFycmF5YCAgPSBgYXJyYXlbMF1gXG4gIC8vXG4gIC8vIFRPRE86IGlmIGBpZGVudGlmaWVyYCBpcyBcIndvcmRcIiwgb3V0cHV0IGBnZXRXb3JkKClgIGV0Y1xuICAvLyBUT0RPOiBzcGVjaWFsIGNhc2UgJ3dvcmRzJywgJ2xpbmVzJywgZXRjID9cbiAge1xuICAgIG5hbWU6IFwicG9zaXRpb25fZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFtcbiAgICAgIFwie2lkZW50aWZpZXJ9IHtwb3NpdGlvbjpleHByZXNzaW9ufSBvZiAodGhlPykge2V4cHJlc3Npb259XCIsXG4gICAgICBcInRoZSB7cG9zaXRpb246b3JkaW5hbH0ge2lkZW50aWZpZXJ9IG9mICh0aGU/KSB7ZXhwcmVzc2lvbn1cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHBvc2l0aW9uX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNle1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGlkZW50aWZpZXIsIHBvc2l0aW9uLCBleHByZXNzaW9uIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIC8vIElmIHdlIGdvdCBhIHBvc2l0aXZlIG51bWJlciBsaXRlcmFsLCBjb21wZW5zYXRlIGZvciBKUyAwLWJhc2VkIGFycmF5cyBub3csIGZvciBuaWNlciBvdXRwdXQuXG4gICAgICAgIGlmICh0eXBlb2YgcG9zaXRpb24gPT09IFwibnVtYmVyXCIgJiYgcG9zaXRpb24gPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIGAke2V4cHJlc3Npb259WyR7cG9zaXRpb24gLSAxfV1gO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0SXRlbSgke2V4cHJlc3Npb259LCAke3Bvc2l0aW9ufSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFBpY2sgYSBTSU5HTEUgcmFuZG9tIGl0ZW0gZnJvbSB0aGUgbGlzdC5cbiAgLy8gVE9ETzogY29uZmlybSBpZGVudGlmaWVyIGlzIHBsdXJhbD9cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmFuZG9tX3Bvc2l0aW9uX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcImEgcmFuZG9tIHtpZGVudGlmaWVyfSAob2Z8ZnJvbXxpbikgKHRoZSk/IHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJhbmRvbV9wb3NpdGlvbl9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldFJhbmRvbUl0ZW1PZigke2xpc3R9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFBpY2sgYSB1bmlxdWUgc2V0IG9mIHJhbmRvbSBpdGVtcyBmcm9tIHRoZSBsaXN0LCByZXR1cm5pbmcgYW4gYXJyYXkuXG4gIC8vIFRPRE86IGB0d28gcmFuZG9tIGl0ZW1zLi4uYFxuICAvLyBUT0RPOiBjb25maXJtIGlkZW50aWZpZXIgaXMgcGx1cmFsP1xuICAvLyBUT0RPOiBgbGlzdC5jbG9uZSgpYCB0byByZXR1cm4gbmV3IGxpc3Qgb2Ygc2FtZSB0eXBlLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJyYW5kb21fcG9zaXRpb25zX2V4cHJlc3Npb25cIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcIntudW1iZXJ9IHJhbmRvbSB7aWRlbnRpZmllcn0gKG9mfGZyb218aW4pICh0aGUpPyB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5kb21fcG9zaXRpb25zX2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBudW1iZXIsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5kb21JdGVtc09mKCR7bGlzdH0sICR7bnVtYmVyfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFJhbmdlIGV4cHJlc3Npb24uXG4gIC8vIFJldHVybnMgYSBuZXcgbGlzdC5cbiAgLy8gTk9URTogYHN0YXJ0YCBpcyAqKjEtYmFzZWQqKi5cbiAgLy8gTk9URTogYGVuZGAgaXMgaW5jbHVzaXZlIVxuICAvLyBUT0RPOiBjb25maXJtIGlkZW50aWZpZXIgaXMgcGx1cmFsP1xuICAvLyBUT0RPOiBgbGlzdC5jbG9uZSgpYCB0byByZXR1cm4gbmV3IGxpc3Qgb2Ygc2FtZSB0eXBlLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJyYW5nZV9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7aWRlbnRpZmllcn0ge3N0YXJ0OmV4cHJlc3Npb259IHRvIHtlbmQ6ZXhwcmVzc2lvbn0gb2Yge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHN0YXJ0LCBlbmQsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5nZSgke2xpc3R9LCAke3N0YXJ0fSwgJHtlbmR9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFN0YXJ0aW5nIHJhbmdlIGV4cHJlc3Npb24uXG4gIC8vIFJldHVybnMgYSBuZXcgbGlzdC5cbiAgLy8gZS5nLlx0YGZpcnN0IDQgaXRlbXMgb2YgbGlzdGBcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwiZmlyc3RfaW5fcmFuZ2VcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcImZpcnN0IHtudW1iZXI6ZXhwcmVzc2lvbn0ge2lkZW50aWZpZXJ9IChpbnxvZikge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG51bWJlciwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmdldFJhbmdlKCR7bGlzdH0sIDEsICR7bnVtYmVyfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBFbmRpbmcgcmFuZ2UgZXhwcmVzc2lvbi5cbiAgLy8gUmV0dXJucyBhIG5ldyBsaXN0LlxuICAvLyBlLmcuXHRgbGFzdCA0IGl0ZW1zIG9mIGxpc3RgXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxhc3RfaW5fcmFuZ2VcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgc3ludGF4OiBcImxhc3Qge251bWJlcjpleHByZXNzaW9ufSB7aWRlbnRpZmllcn0gKGlufG9mKSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyByYW5nZV9leHByZXNzaW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbnVtYmVyLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0RW5kUmFuZ2UoJHtsaXN0fSwgMSwgJHtudW1iZXJ9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gUmFuZ2UgZXhwcmVzc2lvbiBzdGFydGluZyBhdCBzb21lIGl0ZW0gaW4gdGhlIGxpc3QuXG4gIC8vIFJldHVybnMgYSBuZXcgbGlzdC5cbiAgLy8gSWYgaXRlbSBpcyBub3QgZm91bmQsIHJldHVybnMgYW4gZW1wdHkgbGlzdC4gKD8/PylcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmFuZ2VfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2lkZW50aWZpZXJ9IChpbnxvZikge2xpc3Q6ZXhwcmVzc2lvbn0gc3RhcnRpbmcgd2l0aCB7dGhpbmc6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuZ2V0UmFuZ2UoJHtsaXN0fSwgc3BlbGwucG9zaXRpb25PZigke3RoaW5nfSwgJHtsaXN0fSkpYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBMaXN0IGZpbHRlci5cbiAgLy8gTk9URTogd2Ugd2lsbCBzaW5ndWxhcml6ZSBgaWRlbnRpZmllcmAgYW5kIHVzZSB0aGF0IGFzIHRoZSBhcmd1bWVudCB0byBgZXhwcmVzc2lvbmAuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfZmlsdGVyXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7aWRlbnRpZmllcn0gKGlufG9mKSB7bGlzdDpleHByZXNzaW9ufSB3aGVyZSB7Y29uZGl0aW9uOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfZmlsdGVyIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgaWRlbnRpZmllciwgY29uZGl0aW9uLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIC8vIHVzZSBzaW5ndWxhciBvZiBpZGVudGlmaWVyIGZvciBtZXRob2QgYXJndW1lbnRcbiAgICAgICAgbGV0IGFyZ3VtZW50ID0gc2luZ3VsYXJpemUoaWRlbnRpZmllci50b1NvdXJjZSgpKTtcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5maWx0ZXIoJHtsaXN0fSwgJHthcmd1bWVudH0gPT4gJHtjb25kaXRpb259KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gU2V0IG1lbWJlcnNoaXAgKGxlZnQgcmVjdXJzaXZlKS5cbiAgLy8gTk9URTogd2Ugd2lsbCBzaW5ndWxhcml6ZSBgaWRlbnRpZmllcmAgYW5kIHVzZSB0aGF0IGFzIHRoZSBhcmd1bWVudCB0byBgZXhwcmVzc2lvbmAuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfbWVtYmVyc2hpcF90ZXN0XCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7bGlzdDpleHByZXNzaW9ufSAob3BlcmF0b3I6aGFzfGhhcyBub3xkb2VzbnQgaGF2ZXxkb2VzIG5vdCBoYXZlKSB7aWRlbnRpZmllcn0gd2hlcmUge2ZpbHRlcjpleHByZXNzaW9ufVwiLFxuICAgIGxlZnRSZWN1cnNpdmU6IHRydWUsXG4gICAgdGVzdFJ1bGU6IG5ldyBSdWxlLktleXdvcmRzKHsgbWF0Y2g6IFwid2hlcmVcIiB9KSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9tZW1iZXJzaGlwX3Rlc3QgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyLCBvcGVyYXRvciwgZmlsdGVyLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIGxldCBiYW5nID0gb3BlcmF0b3IgPT09IFwiaGFzXCIgPyBcIlwiIDogXCIhXCI7XG4gICAgICAgIC8vIHVzZSBzaW5ndWxhciBvZiBpZGVudGlmaWVyIGZvciBtZXRob2QgYXJndW1lbnRcbiAgICAgICAgbGV0IGFyZ3VtZW50ID0gc2luZ3VsYXJpemUoaWRlbnRpZmllci50b1NvdXJjZSgpKTtcbiAgICAgICAgcmV0dXJuIGAke2Jhbmd9c3BlbGwuYW55KCR7bGlzdH0sICR7YXJndW1lbnR9ID0+ICR7ZmlsdGVyfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvL1xuICAvL1x0QWRkaW5nIHRvIGxpc3QgKGluLXBsYWNlKVxuICAvL1xuXG4gIC8vIEFkZCB0byBlbmQgb2YgbGlzdC5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9hcHBlbmRcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiYXBwZW5kIHt0aGluZzpleHByZXNzaW9ufSB0byB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgICAgXCJhZGQge3RoaW5nOmV4cHJlc3Npb259IHRvICgodGhlPykgZW5kIG9mKT8ge2xpc3Q6ZXhwcmVzc2lvbn1cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfYXBwZW5kIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5hcHBlbmQoJHtsaXN0fSwgJHt0aGluZ30pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gQWRkIHRvIGJlZ2lubmluZyBvZiBsaXN0LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3ByZXBlbmRcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFtcbiAgICAgIFwicHJlcGVuZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwiYWRkIHt0aGluZzpleHByZXNzaW9ufSB0byB0aGUgKHN0YXJ0fGZyb250fHRvcCkgb2Yge2xpc3Q6ZXhwcmVzc2lvbn1cIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcHJlcGVuZCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwucHJlcGVuZCgke2xpc3R9LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBBZGQgdG8gbWlkZGxlIG9mIGxpc3QsIHB1c2hpbmcgZXhpc3RpbmcgaXRlbXMgb3V0IG9mIHRoZSB3YXkuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfYWRkX2F0XCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn0gYXQgcG9zaXRpb24ge3Bvc2l0aW9uOmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3Rfc3BsaWNlIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgdGhpbmcsIHBvc2l0aW9uLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuc3BsaWNlKCR7bGlzdH0sICR7cG9zaXRpb259LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFRPRE86ICBcdFwiYWRkIHt0aGluZzpleHByZXNzaW9ufSB0byB7bGlzdDpleHByZXNzaW9ufSBiZWZvcmUge2l0ZW06ZXhwcmVzc2lvbn1cIixcblxuICAvLyBBZGQgdG8gbWlkZGxlIG9mIGxpc3QsIHB1c2hpbmcgZXhpc3RpbmcgaXRlbXMgb3V0IG9mIHRoZSB3YXkuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfYWRkX2FmdGVyXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcImFkZCB7dGhpbmc6ZXhwcmVzc2lvbn0gdG8ge2xpc3Q6ZXhwcmVzc2lvbn0gYWZ0ZXIge2l0ZW06ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9hZGRfYWZ0ZXIgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgaXRlbSwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnNwbGljZSgke2xpc3R9LCBzcGVsbC5wb3NpdGlvbk9mKCR7bGlzdH0sICR7aXRlbX0pLCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvL1xuICAvL1x0UmVtb3ZpbmcgZnJvbSBsaXN0IChpbi1wbGFjZSlcbiAgLy9cblxuICAvLyBFbXB0eSBsaXN0LlxuICAvL1RPRE86IG1ha2UgYGVtcHR5YCBhbmQvb3IgYGNsZWFyYCBhIGdlbmVyaWMgc3RhdGVtZW50Pz8/XG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfZW1wdHlcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiKGVtcHR5fGNsZWFyKSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X2VtcHR5IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLmNsZWFyKCR7bGlzdH0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gUmVtb3ZlIG9uZSBpdGVtIGZyb20gbGlzdCBieSBwb3NpdGlvbi5cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9yZW1vdmVfcG9zaXRpb25cIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwicmVtb3ZlIHtpZGVudGlmaWVyfSB7bnVtYmVyOmV4cHJlc3Npb259IG9mIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcmVtb3ZlX3Bvc2l0aW9uIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbnVtYmVyLCBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwucmVtb3ZlSXRlbSgke2xpc3R9LCAke251bWJlcn0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gUmVtb3ZlIHJhbmdlIG9mIHRoaW5ncyBmcm9tIGxpc3QuXG4gIC8vIE5PVEU6IGBzdGFydGAgaXMgKioxLWJhc2VkKiouXG4gIC8vIE5PVEU6IGBlbmRgIGlzIGluY2x1c2l2ZSFcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwibGlzdF9yZW1vdmVfcmFuZ2VcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwicmVtb3ZlIHtpZGVudGlmaWVyfSB7c3RhcnQ6ZXhwcmVzc2lvbn0gdG8ge2VuZDpleHByZXNzaW9ufSBvZiB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3JlbW92ZV9wb3NpdGlvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHN0YXJ0LCBlbmQsIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5yZW1vdmVSYW5nZSgke2xpc3R9LCAke3N0YXJ0fSwgJHtlbmR9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gUmVtb3ZlIGFsbCBpbnN0YW5jZXMgb2Ygc29tZXRoaW5nIGZyb20gYSBsaXN0LlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3JlbW92ZVwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJyZW1vdmUge3RoaW5nOmV4cHJlc3Npb259IGZyb20ge2xpc3Q6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9yZW1vdmUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0aGluZywgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnJlbW92ZSgke2xpc3R9LCAke3RoaW5nfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBSZW1vdmUgYWxsIGl0ZW1zIGZyb20gbGlzdCB3aGVyZSBjb25kaXRpb24gaXMgdHJ1ZS5cbiAgLy8gTk9URTogd2Ugd2lsbCBzaW5ndWxhcml6ZSBgaWRlbnRpZmllcmAgYW5kIHVzZSB0aGF0IGFzIHRoZSBhcmd1bWVudCB0byBgZXhwcmVzc2lvbmAuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcmVtb3ZlX3doZXJlXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcInJlbW92ZSB7aWRlbnRpZmllcn0gKGlufG9mfGZyb20pIHtsaXN0OmV4cHJlc3Npb259IHdoZXJlIHtjb25kaXRpb246ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9yZW1vdmVfd2hlcmUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyLCBjb25kaXRpb24sIGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgLy8gdXNlIHNpbmd1bGFyIG9mIGlkZW50aWZpZXIgZm9yIG1ldGhvZCBhcmd1bWVudFxuICAgICAgICBsZXQgYXJndW1lbnQgPSBzaW5ndWxhcml6ZShpZGVudGlmaWVyLnRvU291cmNlKCkpO1xuICAgICAgICByZXR1cm4gYHNwZWxsLnJlbW92ZVdoZXJlKCR7bGlzdH0sICR7YXJndW1lbnR9ID0+ICR7Y29uZGl0aW9ufSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vXG4gIC8vXHRSYW5kb20gKGluLXBsYWNlKSBsaXN0IG1hbmlwdWxhdGlvbi5cbiAgLy9cblxuICAvLyBSZXZlcnNlIGxpc3QgaW4tcGxhY2UuXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfcmV2ZXJzZVwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJyZXZlcnNlIHtsaXN0OmV4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGxpc3RfcmV2ZXJzZSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxpc3QgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5yZXZlcnNlKCR7bGlzdH0pYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gU2h1ZmZsZSBsaXN0IGluLXBsYWNlLlxuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJsaXN0X3NodWZmbGVcIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwiKHJhbmRvbWl6ZXxzaHVmZmxlKSB7bGlzdDpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXN0X3NodWZmbGUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgc3BlbGwuc2h1ZmZsZSgke2xpc3R9KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gSXRlcmF0aW9uXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImxpc3RfaXRlcmF0aW9uXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImZvciAoZWFjaCk/IHtpdGVtVmFyOmlkZW50aWZpZXJ9IGluIHtsaXN0OmV4cHJlc3Npb259Oj8ge3N0YXRlbWVudH0/XCIsXG4gICAgICBcImZvciAoZWFjaCk/IHtpdGVtVmFyOmlkZW50aWZpZXJ9IChhbmR8LCkge3Bvc2l0aW9uVmFyOmlkZW50aWZpZXJ9IGluIHtsaXN0OmV4cHJlc3Npb259Oj8ge3N0YXRlbWVudH0/XCIsXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbGlzdF9pdGVyYXRpb24gZXh0ZW5kcyBSdWxlLkJsb2NrU3RhdGVtZW50IHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpdGVtVmFyLCBwb3NpdGlvblZhciwgbGlzdCwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBsZXQgb3V0cHV0O1xuICAgICAgICBpZiAocG9zaXRpb25WYXIpIHtcbiAgICAgICAgICBvdXRwdXQgPSBgZm9yIChsZXQgJHtwb3NpdGlvblZhcn0gPSAxLCBiYXI7ICR7aXRlbVZhcn0gPSAke2xpc3R9WyR7cG9zaXRpb25WYXJ9LTFdLCAke3Bvc2l0aW9uVmFyfSA8PSAke2xpc3R9Lmxlbmd0aDsgJHtwb3NpdGlvblZhcn0rKykgYFxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIE5PVEU6IHRoaXMgaXMgcmVsYXRpdmVseSBzbG93Li4uICBwcm9iYWJseSBkb2Vzbid0IG1hdHRlci4uLlxuICAgICAgICAgIG91dHB1dCA9IGBmb3IgKGxldCAke2l0ZW1WYXJ9IG9mICR7bGlzdH0pIGA7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0ICs9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoc3RhdGVtZW50LCBibG9jayk7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy8gUmFuZ2VcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmFuZ2VfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwicmFuZ2Uge3N0YXJ0OmV4cHJlc3Npb259IHRvIHtlbmQ6ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcmFuZ2VfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHN0YXJ0LCBlbmQgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIGBzcGVsbC5nZXRSYW5nZSgke3N0YXJ0fSwgJHtlbmR9KWA7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL2xpc3RzLmpzIiwiLy9cbi8vXHQjIFJ1bGVzIGZvciBpbmZpeCBhbmQgcHJlZml4IG9wZXJhdG9ycy5cbi8vXG5cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4uLy4uL1BhcnNlclwiO1xuaW1wb3J0IFJ1bGUgZnJvbSBcIi4uLy4uL1J1bGVcIjtcblxuLy8gQ3JlYXRlIFwib3BlcmF0b3JzXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck5hbWUoXCJvcGVyYXRvcnNcIik7XG5leHBvcnQgZGVmYXVsdCBwYXJzZXI7XG5cbnBhcnNlci5kZWZpbmVSdWxlcyhcbiAgLy8gVE9ETzpcbiAgLy8gXHQvLyBGaW5kIGJlc3QgbWF0Y2ggYWNjb3JkaW5nIHRvIG9wZXJhdG9yIHByZWNlZGVuY2UgYXMgZGVmaW5lZCBiZWxvdy5cbiAgLy8gXHRnZXRCZXN0TWF0Y2gobWF0Y2hlcykge1xuICAvLyBcdFx0Y29uc29sZS53YXJuKFwiR0JNXCIsIG1hdGNoZXMsIG1hdGNoZXMubWFwKG1hdGNoID0+IG1hdGNoLnByZWNlZGVuY2UpLCBtYXRjaGVzLm1hcChtYXRjaCA9PiBtYXRjaC5tYXRjaGVkVGV4dCkpO1xuICAvLyBcdFx0cmV0dXJuIG1hdGNoZXMucmVkdWNlKGZ1bmN0aW9uIChiZXN0LCBuZXh0KSB7XG4gIC8vIFx0XHRcdC8vIHRha2UgaGlnaGVzdCBwcmVjZWRlbmNlIG1hdGNoIGZpcnN0XG4gIC8vIFx0XHRcdGlmIChuZXh0LnByZWNlZGVuY2UgPiBiZXN0LnByZWNlZGVuY2UpIHJldHVybiBuZXh0O1xuICAvLyBcdFx0XHQvLyB0YWtlIGxvbmdlc3QgbWF0Y2ggaWYgc2FtZSBwcmVjZWRlbmNlXG4gIC8vIFx0XHRcdGlmIChuZXh0LnByZWNlZGVuY2UgPT09IGJlc3QucHJlY2VkZW5jZSkge1xuICAvLyBcdFx0XHRcdGlmIChuZXh0LmVuZEluZGV4ID4gYmVzdC5lbmRJbmRleCkgcmV0dXJuIG5leHQ7XG4gIC8vIFx0XHRcdH1cbiAgLy8gXHRcdFx0cmV0dXJuIGJlc3Q7XG4gIC8vIFx0XHR9LCBtYXRjaGVzWzBdKTtcbiAgLy8gXHR9XG5cblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvcl9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJ7bGhzOmV4cHJlc3Npb259IHtvcGVyYXRvcjppbmZpeF9vcGVyYXRvcn0ge3JoczpleHByZXNzaW9ufVwiLFxuICAgIGxlZnRSZWN1cnNpdmU6IHRydWUsXG4gICAgdGVzdFJ1bGU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaW5maXhfb3BlcmF0b3JfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGxocywgcmhzLCBfb3BlcmF0b3IgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIF9vcGVyYXRvci5hcHBseShsaHMsIHJocyk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIyMgSW5maXggb3BlcmF0b3JzOiAgIGB7bGhzfSA8b3BlcmF0b3I+IHtyaHN9YCwgZWc6IGBhIGlzIDFgXG4gIC8vIE5PVEU6IGBvcGVyYXRvci5hcHBseWAgTVVTVCByZXR1cm4gYSBmdW5jdGlvbiB3aGljaCB0cmFuc2Zvcm1zIHR3byBhcmd1bWVudHMgKGBsaHNgIGFuZCBgcmhzYCkgaW50byBvdXRwdXQuXG4gIC8vIE5PVEU6IGBwcmVjZWRlbmNlYCBudW1iZXJzIGNvbWUgZnJvbSBKYXZhc2NyaXB0IGVxdWl2YWxlbnRzXG4gIC8vXHRcdCBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9PcGVyYXRvcnMvT3BlcmF0b3JfUHJlY2VkZW5jZVxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDYsXG4gICAgc3ludGF4OiBcImFuZFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBhbmQgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm4gYCgke2F9ICYmICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogNSxcbiAgICBzeW50YXg6IFwib3JcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb3IgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm4gYCgke2F9IHx8ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTAsXG4gICAgc3ludGF4OiBcImlzXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuIGAoJHthfSA9PSAke2J9KWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEwLFxuICAgIHN5bnRheDogXCJpcyBub3RcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuIGAoJHthfSAhPSAke2J9KWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEwLFxuICAgIHN5bnRheDogXCJpcyBleGFjdGx5XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2V4YWN0bHkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm4gYCgke2F9ID09PSAke2J9KWAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMCxcbiAgICBzeW50YXg6IFwiaXMgbm90IGV4YWN0bHlcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2V4YWN0bHkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm4gYCgke2F9ICE9PSAke2J9KWAgfVxuICAgIH1cbiAgfSxcblxuICAvL1RPRE86IGBzcGVsbC5pc09mVHlwZSh0aGluZywgdHlwZSlgXG4gIC8vVE9ETzogYGlzIHNhbWUgdHlwZSBhc2AgP1xuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpcyBhXCIsXG4gICAgICBcImlzIGFuXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19hIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseSh0aGluZywgdHlwZSkgeyByZXR1cm4gYHNwZWxsLmlzT2ZUeXBlKCR7dGhpbmd9LCAnJHt0eXBlfScpYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImlzIG5vdCBhXCIsXG4gICAgICBcImlzIG5vdCBhblwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2EgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KHRoaW5nLCB0eXBlKSB7IHJldHVybiBgIXNwZWxsLmlzT2ZUeXBlKCR7dGhpbmd9LCAnJHt0eXBlfScpYCB9XG4gICAgfVxuICB9LFxuXG4gIC8vVE9ETzogYHNwZWxsLmNvbnRhaW5zKGNvbGxlY3Rpb24sIHRoaW5nKWBcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgaW5cIixcbiAgICAgIFwiaXMgb25lIG9mXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19pbiBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkodGhpbmcsIGxpc3QpIHsgcmV0dXJuIGAke2xpc3R9LmluY2x1ZGVzKCR7dGhpbmd9KWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJpcyBub3QgaW5cIixcbiAgICAgIFwiaXMgbm90IG9uZSBvZlwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbm90X2luIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseSh0aGluZywgbGlzdCkgeyByZXR1cm4gYCEke2xpc3R9LmluY2x1ZGVzKCR7dGhpbmd9KWAgfVxuICAgIH1cbiAgfSxcblxuXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaW5jbHVkZXNcIixcbiAgICAgIFwiY29udGFpbnNcIlxuICAgIF0sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGluY2x1ZGVzIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShsaXN0LCB0aGluZykgeyByZXR1cm4gYCR7bGlzdH0uaW5jbHVkZXMoJHt0aGluZ30pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBbXG4gICAgICBcImRvZXMgbm90IGluY2x1ZGVcIixcbiAgICAgIFwiZG9lcyBub3QgY29udGFpblwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZG9lc19ub3RfaW5jbHVkZSBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkobGlzdCwgdGhpbmcpIHsgcmV0dXJuIGAhJHtsaXN0fS5pbmNsdWRlcygke3RoaW5nfSlgIH1cbiAgICB9XG4gIH0sXG5cblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCI+XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGd0IGV4dGVuZHMgUnVsZS5TeW1ib2xzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gKCR7YX0gPiAke2J9KWAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiaXMgZ3JlYXRlciB0aGFuXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2d0IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9ID4gJHtifSlgIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiPj1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZ3RlIGV4dGVuZHMgUnVsZS5TeW1ib2xzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gKCR7YX0gPj0gJHtifSlgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcImlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0b1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19ndGUgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gKCR7YX0gPj0gJHtifSlgIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMSxcbiAgICBzeW50YXg6IFwiPFwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsdCBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9IDwgJHtifSlgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcImlzIGxlc3MgdGhhblwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19sdCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAoJHthfSA8ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG4gIHtcbiAgICBuYW1lOiBcImluZml4X29wZXJhdG9yXCIsXG4gICAgcHJlY2VkZW5jZTogMTEsXG4gICAgc3ludGF4OiBcIjw9XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGx0ZSBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9IDw9ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDExLFxuICAgIHN5bnRheDogXCJpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfbHRlIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCgke2F9IDw9ICR7Yn0pYCB9XG4gICAgfVxuICB9LFxuXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMyxcbiAgICBzeW50YXg6IFwiXFxcXCtcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcGx1cyBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gKyAke2J9YCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEzLFxuICAgIHN5bnRheDogXCJwbHVzXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHBsdXMgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KGEsYikgeyByZXR1cm5gJHthfSArICR7Yn1gIH1cbiAgICB9XG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxMyxcbiAgICBzeW50YXg6IFwiLVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBtaW51cyBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gLSAke2J9YCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDEzLFxuICAgIHN5bnRheDogXCJtaW51c1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBtaW51cyBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAke2F9IC0gJHtifWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDE0LFxuICAgIHN5bnRheDogXCJcXFxcKlwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0aW1lcyBleHRlbmRzIFJ1bGUuU3ltYm9scyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gKiAke2J9YCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDE0LFxuICAgIHN5bnRheDogXCJ0aW1lc1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0aW1lcyBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAke2F9ICogJHtifWAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJpbmZpeF9vcGVyYXRvclwiLFxuICAgIHByZWNlZGVuY2U6IDE0LFxuICAgIHN5bnRheDogXCIvXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRpdmlkZWRfYnkgZXh0ZW5kcyBSdWxlLlN5bWJvbHMge1xuICAgICAgYXBwbHkoYSxiKSB7IHJldHVybmAke2F9IC8gJHtifWAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiaW5maXhfb3BlcmF0b3JcIixcbiAgICBwcmVjZWRlbmNlOiAxNCxcbiAgICBzeW50YXg6IFwiZGl2aWRlZCBieVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkaXZpZGVkX2J5IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseShhLGIpIHsgcmV0dXJuYCR7YX0gLyAke2J9YCB9XG4gICAgfVxuICB9LFxuXG4gIC8vVE9ETzogIGArPWAgZXRjPyAgb3RoZXIgbWF0aCBmdW5jdGlvbnM/XG5cblxuICAvL1xuICAvL1xuICAvLyMjIFBvc3RpZnggb3BlcmF0b3JzOiAgIGB7bGhzfSA8b3BlcmF0b3I+YCwgZS5nLiBgYSBpcyBkZWZpbmVkYFxuICAvLyBOT1RFOiBgb3BlcmF0b3IuYXBwbHlgIE1VU1QgcmV0dXJuIGEgZnVuY3Rpb24gd2hpY2ggdHJhbnNmb3JtcyBhcmd1bWVudCAoYGxoc2ApIGludG8gSlMgb3V0cHV0LlxuXG4gIHtcbiAgICBuYW1lOiBcInBvc3RmaXhfb3BlcmF0b3JfZXhwcmVzc2lvblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwie2V4cHJlc3Npb259IHtvcGVyYXRvcjpwb3N0Zml4X29wZXJhdG9yfVwiLFxuICAgIGxlZnRSZWN1cnNpdmU6IHRydWUsXG4gICAgdGVzdFJ1bGU6IFwicG9zdGZpeF9vcGVyYXRvclwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBwb3N0Zml4X29wZXJhdG9yX2V4cHJlc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGV4cHJlc3Npb24sIF9vcGVyYXRvciB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gX29wZXJhdG9yLmFwcGx5KGV4cHJlc3Npb24pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgc3ludGF4OiBcImlzIGRlZmluZWRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaXNfZGVmaW5lZCBleHRlbmRzIFJ1bGUuS2V5d29yZHMge1xuICAgICAgYXBwbHkodGhpbmcpIHsgcmV0dXJuIGAodHlwZW9mICR7dGhpbmd9ICE9PSAndW5kZWZpbmVkJylgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcInBvc3RmaXhfb3BlcmF0b3JcIixcbiAgICBzeW50YXg6IFtcbiAgICAgIFwiaXMgdW5kZWZpbmVkXCIsXG4gICAgICBcImlzIG5vdCBkZWZpbmVkXCJcbiAgICBdLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc191bmRlZmluZWQgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KHRoaW5nKSB7IHJldHVybiBgKHR5cGVvZiAke3RoaW5nfSA9PT0gJ3VuZGVmaW5lZCcpYCB9XG4gICAgfVxuICB9LFxuXG4gIC8vVE9ETzogYHNwZWxsLmlzRW1wdHkodGhpbmcpYFxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgc3ludGF4OiBcImlzIGVtcHR5XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGlzX2VtcHR5IGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICBhcHBseSh0aGluZykgeyByZXR1cm4gYHNwZWxsLmlzRW1wdHkoJHt0aGluZ30pYCB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJwb3N0Zml4X29wZXJhdG9yXCIsXG4gICAgc3ludGF4OiBcImlzIG5vdCBlbXB0eVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBpc19ub3RfZW1wdHkgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIGFwcGx5KHRoaW5nKSB7IHJldHVybiBgIXNwZWxsLmlzRW1wdHkoJHt0aGluZ30pYCB9XG4gICAgfVxuICB9LFxuXG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL29wZXJhdG9ycy5qcyIsIi8vXG4vL1x0IyBSdWxlcyBmb3IgY3JlYXRpbmcgdmFyaWFibGVzLCBwcm9wZXJ0eSBhY2Nlc3MsIGV0Y1xuLy9cblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG4vLyBDcmVhdGUgXCJzdGF0ZW1lbnRzXCIgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck5hbWUoXCJzdGF0ZW1lbnRzXCIpO1xuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG5wYXJzZXIuZGVmaW5lUnVsZXMoXG4gIC8vXG4gIC8vXHQjIyBSZXR1cm5zXG4gIC8vXG5cbiAgLy8gUmV0dXJuIGEgdmFsdWVcbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicmV0dXJuX3N0YXRlbWVudFwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJyZXR1cm4ge2V4cHJlc3Npb259XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHJldHVybl9zdGF0ZW1lbnQgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBleHByZXNzaW9uIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgcmV0dXJuICR7ZXhwcmVzc2lvbn1gO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvL1xuICAvL1x0IyMgQXNzaWdubWVudFxuICAvL1xuXG4gIC8vVEVTVE1FXG4gIC8vVE9ETzogZGlzdGluZ3Vpc2ggYmV0d2VlbiBgbmV3X2lkZW50aWZpZXJgIGFuZCBgc2NvcGVkX2lkZW50aWZpZXJgXG4gIHtcbiAgICBuYW1lOiBcImFzc2lnbm1lbnRcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogW1xuICAgICAgXCJ7dGhpbmc6ZXhwcmVzc2lvbn0gPSB7dmFsdWU6ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwic2V0IHt0aGluZzpleHByZXNzaW9ufSB0byB7dmFsdWU6ZXhwcmVzc2lvbn1cIixcbiAgICAgIFwicHV0IHt2YWx1ZTpleHByZXNzaW9ufSBpbnRvIHt0aGluZzpleHByZXNzaW9ufVwiXG4gICAgXSxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgYXNzaWdubWVudCBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHRoaW5nLCB2YWx1ZSB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICAvLyBUT0RPOiBkZWNsYXJlIGlkZW50aWZpZXIgaWYgbm90IGluIHNjb3BlLCBldGNcbiAgICAgICAgcmV0dXJuIGAke3RoaW5nfSA9ICR7dmFsdWV9YDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy9URVNUTUVcbiAgLy8gVE9ETzogYGl0YCBtYXkgbm90IGFscmVhZHkgYmUgZGVmaW5lZC4uLiA/Pz9cbiAge1xuICAgIG5hbWU6IFwiZ2V0X3ZhbHVlXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwiZ2V0IHt2YWx1ZTpleHByZXNzaW9ufVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBnZXRfdmFsdWUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB2YWx1ZSB9ID0gdGhpcy5yZXN1bHRzOztcbiAgICAgICAgcmV0dXJuIGBpdCA9ICR7dmFsdWV9YFxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG5cbiAgLy9cbiAgLy9cdCMjIFVzZXIgaW50ZXJhY3Rpb25cbiAgLy8gVE9ETzogbW92ZSBpbnRvIGFub3RoZXIgZmlsZVxuICAvL1xuXG4gIC8vIEFsZXJ0IGEgbWVzc2FnZS5cbiAgLy8gVE9ETzogbmVlZCBzb21lIGZhbmN5IHByb21pc2UganVqdSBoZXJlP1xuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJhbGVydFwiLFxuICAgIGFsaWFzOiBcInN0YXRlbWVudFwiLFxuICAgIHN5bnRheDogXCJhbGVydCB7bWVzc2FnZTpleHByZXNzaW9ufSAoPzp3aXRoIHtva0J1dHRvbjp0ZXh0fSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGFsZXJ0IGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbWVzc2FnZSwgb2tCdXR0b24gPSBgXCJPS1wiYCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYGF3YWl0IHNwZWxsLmFsZXJ0KCR7bWVzc2FnZX0sICR7b2tCdXR0b259KWA7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFdhcm5pbmcgbWVzc2FnZSAtLSBsaWtlIGFsZXJ0IGJ1dCBmYW5jaWVyLlxuICAvLyBUT0RPOiBuZWVkIHNvbWUgZmFuY3kgcHJvbWlzZSBqdWp1IGhlcmU/XG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcIndhcm5cIixcbiAgICBhbGlhczogXCJzdGF0ZW1lbnRcIixcbiAgICBzeW50YXg6IFwid2FybiB7ZXhwcmVzc2lvbjpleHByZXNzaW9ufSAoPzp3aXRoIHtva0J1dHRvbjp0ZXh0fSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHdhcm4gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBtZXNzYWdlLCBva0J1dHRvbiA9IGBcIk9LXCJgIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgYXdhaXQgc3BlbGwud2Fybigke21lc3NhZ2V9LCAke29rQnV0dG9ufSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIENvbmZpcm0gbWVzc2FnZSAtLSBwcmVzZW50IGEgcXVlc3Rpb24gd2l0aCB0d28gYW5zd2Vycy5cbiAgLy8gVE9ETzogbmVlZCBzb21lIGZhbmN5IHByb21pc2UganVqdSBoZXJlP1xuICAvL1RFU1RNRVxuICB7XG4gICAgbmFtZTogXCJjb25maXJtXCIsXG4gICAgYWxpYXM6IFwic3RhdGVtZW50XCIsXG4gICAgc3ludGF4OiBcImNvbmZpcm0ge21lc3NhZ2U6ZXhwcmVzc2lvbn0gKD86d2l0aCB7b2tCdXR0b246dGV4dH0gKD86IChhbmR8b3IpIHtjYW5jZWxCdXR0b246dGV4dH0pPyApP1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBjb25maXJtIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbWVzc2FnZSwgb2tCdXR0b24gPSBgXCJPS1wiYCwgY2FuY2VsQnV0dG9uID0gYFwiQ2FuY2VsXCJgIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgYXdhaXQgc3BlbGwuY29uZmlybSgke21lc3NhZ2V9LCAke29rQnV0dG9ufSwgJHtjYW5jZWxCdXR0b259KWA7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL3N0YXRlbWVudHMuanMiLCIvL1xuLy9cdCMgUnVsZXMgZm9yIGRlZmluaW5nIGNsYXNzZXMgKGtub3duIGFzIGB0eXBlc2ApXG4vL1xuXG4vL1RPRE86IGNvbnN0cnVjdG9yXG4vLyBUT0RPOiBtaXhpbnMgLyB0cmFpdHMgLyBjb21wb3NlZCBjbGFzc2VzIC8gYW5ub3RhdGlvbnNcblxuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuXG5pbXBvcnQgZ2xvYmFsIGZyb20gXCIuLi8uLi91dGlscy9nbG9iYWxcIjtcbmltcG9ydCB7IHBsdXJhbGl6ZSB9IGZyb20gXCIuLi8uLi91dGlscy9zdHJpbmdcIjtcblxuZXhwb3J0IGRlZmF1bHQgUGFyc2VyLmZvck5hbWUoXCJ0eXBlc1wiKS5kZWZpbmVSdWxlcyhcbiAge1xuICAgIG5hbWU6IFwiZGVmaW5lX3R5cGVcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJkZWZpbmUgdHlwZSB7bmFtZTp0eXBlfSAoPzphcyAoYXxhbikge3N1cGVyVHlwZTp0eXBlfSk/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRlZmluZV90eXBlIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCBzdHJ1Y3R1cmUgPSBzdXBlci50b1N0cnVjdHVyZSgpO1xuICAgICAgICBzdHJ1Y3R1cmUudHlwZSA9IFwiY2xhc3NcIjtcbiAgICAgICAgcmV0dXJuIHN0cnVjdHVyZTtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHN1cGVyVHlwZSwgYmxvY2sgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgbGV0IG91dHB1dCA9IGBjbGFzcyAke25hbWV9YDtcbiAgICAgICAgaWYgKHN1cGVyVHlwZSkgb3V0cHV0ICs9IGAgZXh0ZW5kcyAke3N1cGVyVHlwZX1gO1xuICAgICAgICBvdXRwdXQgKz0gXCIgXCIgKyBSdWxlLkJsb2NrLmVuY2xvc2VTdGF0ZW1lbnRzKGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gYG5ld2Agb3IgYGNyZWF0ZWBcbiAgLy8gVGhpcyB3b3JrcyBhcyBhbiBleHByZXNzaW9uIE9SIGEgc3RhdGVtZW50LlxuICAvLyBOT1RFOiB3ZSBhc3N1bWUgdGhhdCBhbGwgdHlwZXMgdGFrZSBhbiBvYmplY3Qgb2YgcHJvcGVydGllcz8/Pz9cbiAge1xuICAgIG5hbWU6IFwibmV3X3RoaW5nXCIsXG4gICAgYWxpYXM6IFtcImV4cHJlc3Npb25cIiwgXCJzdGF0ZW1lbnRcIl0sXG4gICAgc3ludGF4OiBcIihjcmVhdGV8bmV3KSB7dHlwZX0gKD86d2l0aCB7cHJvcHM6b2JqZWN0X2xpdGVyYWxfcHJvcGVydGllc30pP1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBuZXdfdGhpbmcgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyB0eXBlLCBwcm9wcyA9IFwiXCIgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgLy8gU3BlY2lhbCBjYXNlIGZvciBvYmplY3QsIHdoaWNoIHdlJ2xsIGNyZWF0ZSB3aXRoIGFuIG9iamVjdCBsaXRlcmFsLlxuICAgICAgICBpZiAodHlwZSA9PT0gXCJPYmplY3RcIikge1xuICAgICAgICAgIGlmICghcHJvcHMpIHJldHVybiBcInt9XCI7XG4gICAgICAgICAgcmV0dXJuIHByb3BzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBuZXcgJHt0eXBlfSgke3Byb3BzfSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBEZWNsYXJlIGluc3RhbmNlIG1ldGhvZCBvciBub3JtYWwgZnVuY3Rpb24uXG4gIHtcbiAgICBuYW1lOiBcImRlY2xhcmVfbWV0aG9kXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwiKG9wZXJhdG9yOnRvfG9uKSB7bmFtZTppZGVudGlmaWVyfSB7YXJnc30/IChcXFxcOik/IHtzdGF0ZW1lbnR9P1wiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkZWNsYXJlX21ldGhvZCBleHRlbmRzIFJ1bGUuQmxvY2tTdGF0ZW1lbnQge1xuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBvcGVyYXRvciwgbmFtZSwgYXJncyA9IFtdfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgbGV0IHN1YlR5cGUgPSAob3BlcmF0b3IgPT09IFwidG9cIiA/IFwibWV0aG9kXCIgOiBcImV2ZW50XCIpO1xuICAgICAgICByZXR1cm4geyB0eXBlOiBcImZ1bmN0aW9uXCIsIHN1YlR5cGUsIG5hbWUsIGFyZ3MgfTtcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIGFyZ3MgPSBbXSwgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBsZXQgb3V0cHV0ID0gYCR7bmFtZX0oJHthcmdzLmpvaW4oXCIsIFwiKX0pIGA7XG4gICAgICAgIG91dHB1dCArPSBSdWxlLkJsb2NrLmVuY2xvc2VTdGF0ZW1lbnRzKHN0YXRlbWVudCwgYmxvY2spO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBEZWNsYXJlIFwiYWN0aW9uXCIsIHdoaWNoIGNhbiBiZSBjYWxsZWQgZ2xvYmFsbHkgYW5kIGFmZmVjdHMgdGhlIHBhcnNlci5cbiAgLy8gVE9ETzogYHdpdGhgIGNsYXVzZSAod2lsbCBjb25mbGljdCB3aXRoIGB3b3JkYClcbiAgLy8gVE9ETzogaW5zdGFsbCBpbiBwYXJzZXIgc29tZWhvd1xuICAvLyBUT0RPOiBjcmVhdGUgaW5zdGFuY2UgZnVuY3Rpb24/ICBvciBtYXliZSB3ZSBkb24ndCBuZWVkIGl0OlxuICAvL1x0XHRcdGBhY3Rpb24gdHVybiBDYXJkIG92ZXJgIGZvciBhbiBpbnN0YW5jZSBpcyBqdXN0IGB0dXJuIG1lIG92ZXJgXG4gIC8vXHRcdFx0YGFjdGlvbiBhZGQgY2FyZCB0byBkZWNrYCA9PiBgYWRkIG1lIHRvIGRlY2tgXG4gIC8vVEVTVE1FXG4gIHtcbiAgICBuYW1lOiBcImRlY2xhcmVfYWN0aW9uXCIsXG4gICAgYWxpYXM6IFtcInN0YXRlbWVudFwiLCBcIm11dGF0ZXNTY29wZVwiXSxcbiAgICBzeW50YXg6IFwiYWN0aW9uIChrZXl3b3Jkczp7d29yZH18e3R5cGV9KSsgKFxcXFw6KT8ge3N0YXRlbWVudH0/XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRlY2xhcmVfYWN0aW9uIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICAvLyBBZGQgYG5hbWVgLCBgYXJnc2AgYW5kIGB0eXBlc2AgdG8gbWF0Y2hlZCBzb3VyY2VcbiAgICAgIGdldCByZXN1bHRzKCkge1xuICAgICAgICBsZXQgb3V0cHV0ID0gc3VwZXIucmVzdWx0cztcblxuICAgICAgICAvLyBpZiB0aGVyZSdzIG9ubHkgb25lIGtleXdvcmQsIGl0IGNhbid0IGJlIGEgYmxhY2tsaXN0ZWQgaWRlbnRpZmllciBvciBhIHR5cGVcbiAgICAgICAgbGV0IHsga2V5d29yZHMgfSA9IG91dHB1dDtcbiAgICAgICAgbGV0IGtleXdvcmRNYXRjaGVzID0gdGhpcy5yZXN1bHRzLmtleXdvcmRzLm1hdGNoZWQ7XG4gICAgICAgIGlmIChrZXl3b3Jkcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICBsZXQga2V5d29yZCA9IGtleXdvcmRzWzBdO1xuICAgICAgICAgIGlmIChrZXl3b3JkTWF0Y2hlc1swXSBpbnN0YW5jZW9mIFJ1bGUuVHlwZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgcGFyc2UoJ2RlY2xhcmVfYWN0aW9uJyk6IG9uZS13b3JkIGFjdGlvbnMgbWF5IG5vdCBiZSB0eXBlczogJHtrZXl3b3JkfWApO1xuICAgICAgICAgIH1cblxuICAvLyBIQUNLOiBgZ2xvYmFsLnBhcnNlcmAgaXMgYSBoYWNrIGhlcmUgZm9yIGNvbnZlbmllbmNlIGluIHRlc3RpbmcuLi5cbi8vICAgICAgICAgICBsZXQgcGFyc2VyID0gKGNvbnRleHQgJiYgY29udGV4dC5wYXJzZXIpIHx8IGdsb2JhbC5wYXJzZXI7XG4vLyAgICAgICAgICAgbGV0IGJsYWNrbGlzdCA9IHBhcnNlci5nZXRCbGFja2xpc3QoXCJpZGVudGlmaWVyXCIpO1xuLy8gICAgICAgICAgIGlmIChibGFja2xpc3Rba2V5d29yZF0pIHtcbi8vICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHBhcnNlKCdkZWNsYXJlX2FjdGlvbicpOiBvbmUtd29yZCBhY3Rpb25zIG1heSBub3QgYmUgYmxhY2tsaXN0ZWQgaWRlbnRpZmllcnNcIjogJHtrZXl3b3JkfWApO1xuLy8gICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZpZ3VyZSBvdXQgYXJndW1lbnRzIGFuZC9vciB0eXBlc1xuICAgICAgICBvdXRwdXQuYXJncyA9IFtdO1xuICAgICAgICBvdXRwdXQudHlwZXMgPSB7fTtcblxuICAgICAgICAvLyBpZiBhbnkgb2YgdGhlIHdvcmRzIGFyZSB0eXBlcyAoY2FwaXRhbCBsZXR0ZXIpIG1ha2UgdGhhdCBhbiBhcmd1bWVudCBvZiB0aGUgc2FtZSBuYW1lLlxuICAgICAgICBrZXl3b3JkTWF0Y2hlcy5tYXAoIChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgUnVsZS5UeXBlKSB7XG4gICAgICAgICAgICBsZXQgVHlwZSA9IGtleXdvcmRzW2luZGV4XTtcbiAgICAgICAgICAgIGxldCB0eXBlID0gVHlwZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICBvdXRwdXQudHlwZXNbdHlwZV0gPSBUeXBlO1xuICAgICAgICAgICAgb3V0cHV0LmFyZ3MucHVzaCh0eXBlKTtcblxuICAgICAgICAgICAgLy8gcmVwbGFjZSB3aXRoIGxvd2VyY2FzZSBpbiBtZXRob2QgbmFtZVxuICAgICAgICAgICAga2V5d29yZHNbaW5kZXhdID0gdHlwZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBnZXQgc3RhdGljIG1ldGhvZCBuYW1lIGFuZCBhcmd1bWVudHMgZm9yIG91dHB1dFxuICAgICAgICBvdXRwdXQubmFtZSA9IGtleXdvcmRzLmpvaW4oXCJfXCIpO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgYXJncyA9IFtdLCB0eXBlcywgc3RhdGVtZW50LCBibG9jayB9ID0gdGhpcy5yZXN1bHRzO1xuXG4gICAgICAgIC8vIGZpZ3VyZSBvdXQgaWYgdGhlcmUgYXJlIGFueSBjb25kaXRpb25zIGR1ZSB0byBrbm93biBhcmd1bWVudCB0eXBlc1xuICAgICAgICBsZXQgY29uZGl0aW9ucyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBhcmcgaW4gdHlwZXMpIHtcbiAgICAgICAgICBjb25kaXRpb25zLnB1c2goYFxcdGlmICghc3BlbGwuaXNBKCR7YXJnfSwgJHt0eXBlc1thcmddfSkpIHJldHVybiB1bmRlZmluZWRgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzdGF0ZW1lbnRzID0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhjb25kaXRpb25zLCBzdGF0ZW1lbnQsIGJsb2NrKTtcblxuICAgICAgICAvLyBDcmVhdGUgYXMgYSBTVEFUSUMgZnVuY3Rpb25cbiAgICAvL1RPRE86IGNyZWF0ZSBhcyBhbiBpbnN0YW5jZSBmdW5jdGlvbiB3ZSBjYW4gY2FsbCBvbiBvdXJzZWxmIVxuICAgICAgICByZXR1cm4gYHN0YXRpYyAke25hbWV9KCR7YXJncy5qb2luKFwiLCBcIil9KSAke3N0YXRlbWVudHN9YDtcbiAgICAgIH1cblxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIGFyZ3MsIHR5cGVzIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IFwiZnVuY3Rpb25cIiwgc3ViVHlwZTogXCJhY3Rpb25cIiwgbmFtZSwgYXJncywgdHlwZXMgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIEdldHRlciBlaXRoZXIgd2l0aCBvciB3aXRob3V0IGFyZ3VtZW50cy5cbiAgLy8gSWYgeW91IHNwZWNpZnkgYXJndW1lbnRzLCB5aWVsZHMgYSBub3JtYWwgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHZhbHVlLlxuICAvLyBUT0RPOiBgdG8gZ2V0Li4uYCA/XG4gIHtcbiAgICBuYW1lOiBcImdldHRlclwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcImdldCB7bmFtZTppZGVudGlmaWVyfVxcXFw6IHtleHByZXNzaW9ufT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZ2V0dGVyIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgbmFtZSwgZXhwcmVzc2lvbiwgYmxvY2sgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgLy8gSWYgdGhleSBzcGVjaWZpZWQgYW4gaW5saW5lLWV4cHJlc3Npb24sIHByZXBlbmQgcmV0dXJuXG4gICAgICAgIGlmIChleHByZXNzaW9uICYmICFleHByZXNzaW9uLnN0YXJ0c1dpdGgoXCJyZXR1cm4gXCIpKSBleHByZXNzaW9uID0gYHJldHVybiAoJHtleHByZXNzaW9ufSlgO1xuICAgICAgICBsZXQgb3V0cHV0ID0gYGdldCAke25hbWV9KCkgYDtcbiAgICAgICAgb3V0cHV0ICs9IFJ1bGUuQmxvY2suZW5jbG9zZVN0YXRlbWVudHMoZXhwcmVzc2lvbiwgYmxvY2spO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IG5hbWUgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBzdWJUeXBlOiBcImdldHRlclwiLCBuYW1lIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gU2V0dGVyLlxuICAvLyBDb21wbGFpbnMgaWYgeW91IHNwZWNpZnkgbW9yZSB0aGFuIG9uZSBhcmd1bWVudC5cbiAgLy8gSWYgeW91IGRvbid0IHBhc3MgYW4gZXhwbGljaXQgYXJndW1lbnQsIHdlJ2xsIGFzc3VtZSBpdCdzIHRoZSBzYW1lIGFzIHRoZSBpZGVudGlmaWVyLlxuICAvLyBlZztcdGBzZXQgY29sb3I6IHNldCB0aGUgY29sb3Igb2YgbXkgdGV4dCB0byBjb2xvcmBcbiAgLy9cbiAgLy8gVE9ETzogaW50ZXJuYWwgZ2V0dGVyL3NldHRlciBzZW1hbnRpY3MgYWxhIG9iamVjdGl2ZSBDXG4gIC8vXHRcdFx0YHNldCBjb2xvcjogaWYgY29sb3IgaXMgaW4gW1wicmVkXCIsIFwiYmx1ZVwiXSB0aGVuIHNldCBteSBjb2xvciB0byBjb2xvcmBcbiAgLy9cdFx0ID0+IGBteSBjb2xvcmAgd2l0aGluIHNldHRlciBzaG91bGQgYXV0b21hdGljYWxseSB0cmFuc2xhdGUgdG8gYHRoaXMuX2NvbG9yYCA/Pz9cbiAgLy8gVE9ETzogYHRvIHNldC4uLmAgP1xuICB7XG4gICAgbmFtZTogXCJzZXR0ZXJcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJzZXQge25hbWU6aWRlbnRpZmllcn0ge2FyZ3N9PyAoXFxcXDopPyB7c3RhdGVtZW50fT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgc2V0dGVyIGV4dGVuZHMgUnVsZS5CbG9ja1N0YXRlbWVudCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgLy8gZGVmYXVsdCBhcmdzIHRvIHRoZSBzZXR0ZXIgbmFtZVxuICAgICAgICBsZXQgeyBuYW1lLCBhcmdzID0gW25hbWVdLCBzdGF0ZW1lbnQsIGJsb2NrIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIC8vIENvbXBsYWluIGlmIG1vcmUgdGhhbiBvbmUgYXJndW1lbnRcbiAgICAgICAgaWYgKGFyZ3MgJiYgYXJncy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwicGFyc2UoJ3NldHRlcicpOiBvbmx5IG9uZSBhcmd1bWVudCBhbGxvd2VkIGluIHNldHRlcjogIFwiLCB0aGlzLm1hdGNoZWRUZXh0KTtcbiAgICAgICAgICBhcmdzID0gWyBhcmdzWzBdIF07XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG91dHB1dCA9IGBzZXQgJHtuYW1lfSgke2FyZ3N9KSBgO1xuICAgICAgICBvdXRwdXQgKz0gUnVsZS5CbG9jay5lbmNsb3NlU3RhdGVtZW50cyhzdGF0ZW1lbnQsIGJsb2NrKTtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBuYW1lIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IFwicHJvcGVydHlcIiwgc3ViVHlwZTogXCJzZXR0ZXJcIiwgbmFtZSB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG5cbiAgLy9cbiAgLy9cdGRlY2xhcmUgcHJvcGVydGllc1xuICAvL1xuXG4gIC8vVE9ETzogYW5vdGhlciBuYW1lIGZvciBgY29uc3RhbnRgID9cbiAge1xuICAgIG5hbWU6IFwiZGVjbGFyZV9wcm9wZXJ0eVwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcIihzY29wZTpwcm9wZXJ0eXxjb25zdGFudHxzaGFyZWQgcHJvcGVydHkpIHtuYW1lOmlkZW50aWZpZXJ9ICg/Oj0ge3ZhbHVlOmV4cHJlc3Npb259KT9cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgZGVjbGFyZV9wcm9wZXJ0eSBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IHNjb3BlLCBuYW1lLCB2YWx1ZSA9IFwiXCIgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgaWYgKHZhbHVlKSB2YWx1ZSA9IGAgPSAke3ZhbHVlfWA7XG5cbiAgICAgICAgbGV0IGRlY2xhcmF0aW9uID0gYCR7bmFtZX0ke3ZhbHVlfWA7XG4gICAgICAgIHN3aXRjaCAoc2NvcGUpIHtcbiAgICAgICAgICBjYXNlIFwiY29uc3RhbnRcIjpcbi8vICAgICAgICAgICAgaWYgKCF2YWx1ZSkgY29uc29sZS53YXJuKFwicGFyc2UoJ2RlY2xhcmVfcHJvcGVydHknKTogY29uc3RhbnQgcHJvcGVydGllcyBtdXN0IGRlY2xhcmUgYSB2YWx1ZTogIFwiLCB0aGlzLm1hdGNoZWRUZXh0KTtcbiAgICAgICAgICAgIHJldHVybiBgY29uc3QgJHtkZWNsYXJhdGlvbn1gO1xuXG4gICAgICAgICAgY2FzZSBcInNoYXJlZCBwcm9wZXJ0eVwiOlxuICAgICAgICAgICAgcmV0dXJuIGBAcHJvdG8gJHtkZWNsYXJhdGlvbn1gO1xuXG4gICAgICAgICAgY2FzZSBcInByb3BlcnR5XCI6XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBkZWNsYXJhdGlvbjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IHNjb3BlLCBuYW1lIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IFwicHJvcGVydHlcIiwgbmFtZSwgc2NvcGUgfTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gVE9ETzogc2NvcGVfbW9kaWZpZXI/Pz9cbiAgLy8gVE9ETzogaW5pdGlhbCB2YWx1ZVxuICB7XG4gICAgbmFtZTogXCJkZWNsYXJlX3Byb3BlcnR5X29mX3R5cGVcIixcbiAgICBhbGlhczogW1wic3RhdGVtZW50XCIsIFwibXV0YXRlc1Njb3BlXCJdLFxuICAgIHN5bnRheDogXCJwcm9wZXJ0eSB7bmFtZTppZGVudGlmaWVyfSBhcyAoYXxhbik/IHt0eXBlfVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBkZWNsYXJlX3Byb3BlcnR5X29mX3R5cGUgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBuYW1lLCB0eXBlIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgZ2V0ICR7bmFtZX0oKSB7IHJldHVybiB0aGlzLl9fJHtuYW1lfSB9XFxuYFxuICAgICAgICAgICArIGBzZXQgJHtuYW1lfSh2YWx1ZSkgeyBpZiAoc3BlbGwuaXNBKHZhbHVlLCAke3R5cGV9KSB0aGlzLl9fJHtuYW1lfSA9IHZhbHVlIH1gO1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gYSBsb2dpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZVxuICAgICAgdG9TdHJ1Y3R1cmUoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHR5cGUgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBzdWJUeXBlOiBcInNldHRlclwiLCBuYW1lLCBkYXRhVHlwZTogdHlwZSB9O1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vIFRPRE86IHdhcm4gb24gaW52YWxpZCBzZXQ/ICBzaGFyZWQ/ICB1bmRlZmluZWQ/IHNvbWV0aGluZyBvdGhlciB0aGFuIHRoZSBmaXJzdCB2YWx1ZSBhcyBkZWZhdWx0P1xuICB7XG4gICAgbmFtZTogXCJkZWNsYXJlX3Byb3BlcnR5X2FzX29uZV9vZlwiLFxuICAgIGFsaWFzOiBbXCJzdGF0ZW1lbnRcIiwgXCJtdXRhdGVzU2NvcGVcIl0sXG4gICAgc3ludGF4OiBcInByb3BlcnR5IHtuYW1lOmlkZW50aWZpZXJ9IGFzIG9uZSBvZiB7bGlzdDpsaXRlcmFsX2xpc3R9XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGRlY2xhcmVfcHJvcGVydHlfYXNfb25lX29mIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICBnZXQgcmVzdWx0cygpIHtcbiAgICAgICAgbGV0IHJlc3VsdHMgPSBzdXBlci5yZXN1bHRzO1xuICAgICAgICByZXN1bHRzLnBsdXJhbCA9IHBsdXJhbGl6ZShyZXN1bHRzLm5hbWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH1cblxuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IG5hbWUsIHBsdXJhbCwgbGlzdCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4gYEBwcm90byAke3BsdXJhbH0gPSAke2xpc3R9XFxuYFxuICAgICAgICAgICArIGBnZXQgJHtuYW1lfSgpIHsgcmV0dXJuIHRoaXMuX18ke25hbWV9ID09PSB1bmRlZmluZWQgPyB0aGlzLiR7cGx1cmFsfVswXSA6IHRoaXMuX18ke25hbWV9IH1cXG5gXG4gICAgICAgICAgICsgYHNldCAke25hbWV9KHZhbHVlKSB7IGlmICh0aGlzLiR7cGx1cmFsfS5pbmNsdWRlcyh2YWx1ZSkpIHRoaXMuX18ke25hbWV9ID0gdmFsdWUgfWA7XG5cbiAgLy8gTU9SRSBFRkZJQ0lFTlQgQlVUIFVHTElFUlxuICAvLyBcdFx0XHRyZXR1cm4gYHN0YXRpYyAke3BsdXJhbH0gPSAke2xpc3R9O1xcbmBcbiAgLy8gXHRcdFx0XHQgKyBgZ2V0ICR7bmFtZX0geyByZXR1cm4gKFwiX18ke25hbWV9XCIgaW4gdGhpcyA/IHRoaXMuX18ke25hbWV9IDogJHtmaXJzdFZhbHVlfSkgfVxcbmBcbiAgLy8gXHRcdFx0XHQgKyBgc2V0ICR7bmFtZX0odmFsdWUpIHsgaWYgKHRoaXMuY29uc3RydWN0b3IuJHtwbHVyYWx9LmluY2x1ZGVzKHZhbHVlKSkgdGhpcy5fXyR7bmFtZX0gPSB2YWx1ZSB9YDtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIGEgbG9naWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmVcbiAgICAgIHRvU3RydWN0dXJlKCkge1xuICAgICAgICBsZXQgeyBuYW1lLCBwbHVyYWwgfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICB7IHR5cGU6IFwicHJvcGVydHlcIiwgbmFtZSB9LFxuICAgICAgICAgIHsgdHlwZTogXCJwcm9wZXJ0eVwiLCBzdWJUeXBlOiBcInNoYXJlZFwiLCBuYW1lOiBwbHVyYWwgfVxuICAgICAgICBdO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vXG4gIC8vXHRTZWxmLXJlZmVyZW5jZVxuICAvL1xuICB7XG4gICAgbmFtZTogXCJtZVwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwibWVcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbWUgZXh0ZW5kcyBSdWxlLktleXdvcmRzIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICByZXR1cm4gXCJ0aGlzXCI7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFRPRE86IHRoaXMgcmVhbGx5IG1ha2VzIG1lIHdhbnQgdG8gbWFrZSBgSSBhbSBlbXB0eWAgZXRjIHdvcmsuLi5cbiAge1xuICAgIG5hbWU6IFwiSVwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiSVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBJIGV4dGVuZHMgUnVsZS5LZXl3b3JkcyB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIFwidGhpc1wiO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vXG4gIC8vXHRQcm9wZXJ0eSBhY2Nlc3NcbiAgLy9cblxuICB7XG4gICAgbmFtZTogXCJwcm9wZXJ0eV9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCIocHJvcGVydGllczp0aGUge2lkZW50aWZpZXJ9IG9mKSsgdGhlPyB7ZXhwcmVzc2lvbn1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgcHJvcGVydHlfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgZ2V0IHJlc3VsdHMoKSB7XG4gICAgICAgIGxldCB7IGV4cHJlc3Npb24sIHByb3BlcnRpZXNfLCB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHByb3BlcnRpZXM6IF9wcm9wZXJ0aWVzLm1hdGNoZWQubWFwKCBwcm9wZXJ0eSA9PiBwcm9wZXJ0eS5yZXN1bHRzLmlkZW50aWZpZXIgKVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHsgZXhwcmVzc2lvbiwgcHJvcGVydGllcyB9ID0gdGhpcy5yZXN1bHRzO1xuICAgICAgICBwcm9wZXJ0aWVzID0gcHJvcGVydGllcy5yZXZlcnNlKCkuam9pbihcIi5cIik7XG4gICAgICAgIHJldHVybiBgJHtleHByZXNzaW9ufS4ke3Byb3BlcnRpZXN9YDtcbiAgLy8gTk9URTogdGhlIGZvbGxvd2luZyBpcyBzYWZlciwgYnV0IHVnbHkgZm9yIGRlbW8gcHVycG9zZXNcbiAgLy9cdFx0XHRyZXR1cm4gYHNwZWxsLmdldCgke2V4cHJlc3Npb259LCBbJyR7cHJvcGVydGllc30nXSlgO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB7XG4gICAgbmFtZTogXCJteV9wcm9wZXJ0eV9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCIobXl8dGhpcykge2lkZW50aWZpZXJ9XCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIG15X3Byb3BlcnR5X2V4cHJlc3Npb24gZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBpZGVudGlmaWVyIH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgdGhpcy4ke2lkZW50aWZpZXJ9YDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvL1xuICAvL1x0VXRpbGl0eVxuICAvL1xuXG5cbiAgLy8gUHJvcGVydGllcyBjbGF1c2U6IGNyZWF0ZXMgYW4gb2JqZWN0IHdpdGggb25lIG9yIG1vcmUgcHJvcGVydHkgdmFsdWVzLlxuICAvL1x0YGZvbyA9IDEsIGJhciA9IDJgXG4gIC8vVE9ETzogd291bGQgbGlrZSB0byB1c2UgYGFuZGAgYnV0IHRoYXQgd2lsbCBiYXJmIG9uIGV4cHJlc3Npb25zLi4uXG4gIC8vVE9ETzogaG93IHRvIGRvIHByb3BlcnRpZXMgb24gbXVsdGlwbGUgbGluZXM/XG4gIHtcbiAgICBuYW1lOiBcIm9iamVjdF9saXRlcmFsX3Byb3BlcnRpZXNcIixcbiAgICBzeW50YXg6IFwiWyh7a2V5OmlkZW50aWZpZXJ9KD86PSB7dmFsdWU6ZXhwcmVzc2lvbn0pPykgLF1cIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgb2JqZWN0X2xpdGVyYWxfcHJvcGVydGllcyBleHRlbmRzIFJ1bGUuTGlzdCB7XG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgbGV0IHByb3BzID0gdGhpcy5yZXN1bHRzLm1hdGNoZWQubWFwKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgICAgICBsZXQgeyBrZXksIHZhbHVlIH0gPSBwcm9wLnJlc3VsdHM7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHJldHVybiBgXCIke2tleX1cIjogJHt2YWx1ZX1gXG4gICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYHsgJHtwcm9wcy5qb2luKFwiLCBcIil9IH1gO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8vTU9WRSBUTyBgZnVuY3Rpb25zYD9cbiAgLy8gQXJndW1lbnRzIGNsYXVzZSBmb3IgbWV0aG9kc1xuICAvL1x0YHdpdGggZm9vYCBvciBgd2l0aCBmb28gYW5kIGJhciBhbmQgYmF6YFxuICAvL1RPRE86IHtpZGVudGlmaWVyfSA9IHtleHByZXNzaW9ufVx0PT4gcmVxdWlyZXMgYCxgIGluc3RlYWQgb2YgYGFuZGBcbiAgLy9UT0RPOiBgd2l0aCBmb28gYXMgVHlwZWBcbiAgLy9UT0RPOlx0YHdpdGggZm9vLi4uYCBmb3Igc3BsYXQ/XG4gIHtcbiAgICBuYW1lOiBcImFyZ3NcIixcbiAgICBzeW50YXg6IFwid2l0aCBbYXJnczp7aWRlbnRpZmllcn0sXVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBhcmdzIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG4gICAgICAvLyBSZXR1cm5zIGFuIGFycmF5IG9mIGFyZ3VtZW50IHZhbHVlc1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc3VsdHMuX2FyZ3MubWF0Y2hlZC5tYXAoYXJnID0+IGFyZy50b1NvdXJjZSgpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnVsZXMvc3BlbGwvdHlwZXMuanMiLCJyZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zeW1ib2wnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9fY29yZScpLlN5bWJvbDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL2VzNi9zeW1ib2wuanNcbi8vIG1vZHVsZSBpZCA9IDUwMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpIHRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGEgZnVuY3Rpb24hJyk7XG4gIHJldHVybiBpdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzXG4vLyBtb2R1bGUgaWQgPSA1NDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gZmFsc2UgLT4gQXJyYXkjaW5kZXhPZlxuLy8gdHJ1ZSAgLT4gQXJyYXkjaW5jbHVkZXNcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuL190by1sZW5ndGgnKTtcbnZhciB0b0Fic29sdXRlSW5kZXggPSByZXF1aXJlKCcuL190by1hYnNvbHV0ZS1pbmRleCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoSVNfSU5DTFVERVMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcywgZWwsIGZyb21JbmRleCkge1xuICAgIHZhciBPID0gdG9JT2JqZWN0KCR0aGlzKTtcbiAgICB2YXIgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpO1xuICAgIHZhciBpbmRleCA9IHRvQWJzb2x1dGVJbmRleChmcm9tSW5kZXgsIGxlbmd0aCk7XG4gICAgdmFyIHZhbHVlO1xuICAgIC8vIEFycmF5I2luY2x1ZGVzIHVzZXMgU2FtZVZhbHVlWmVybyBlcXVhbGl0eSBhbGdvcml0aG1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgaWYgKElTX0lOQ0xVREVTICYmIGVsICE9IGVsKSB3aGlsZSAobGVuZ3RoID4gaW5kZXgpIHtcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgIGlmICh2YWx1ZSAhPSB2YWx1ZSkgcmV0dXJuIHRydWU7XG4gICAgLy8gQXJyYXkjaW5kZXhPZiBpZ25vcmVzIGhvbGVzLCBBcnJheSNpbmNsdWRlcyAtIG5vdFxuICAgIH0gZWxzZSBmb3IgKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKykgaWYgKElTX0lOQ0xVREVTIHx8IGluZGV4IGluIE8pIHtcbiAgICAgIGlmIChPW2luZGV4XSA9PT0gZWwpIHJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleCB8fCAwO1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qc1xuLy8gbW9kdWxlIGlkID0gNTQ4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGdldHRpbmcgdGFnIGZyb20gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG52YXIgVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyk7XG4vLyBFUzMgd3JvbmcgaGVyZVxudmFyIEFSRyA9IGNvZihmdW5jdGlvbiAoKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ0FyZ3VtZW50cyc7XG5cbi8vIGZhbGxiYWNrIGZvciBJRTExIFNjcmlwdCBBY2Nlc3MgRGVuaWVkIGVycm9yXG52YXIgdHJ5R2V0ID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gaXRba2V5XTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgTywgVCwgQjtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IGl0ID09PSBudWxsID8gJ051bGwnXG4gICAgLy8gQEB0b1N0cmluZ1RhZyBjYXNlXG4gICAgOiB0eXBlb2YgKFQgPSB0cnlHZXQoTyA9IE9iamVjdChpdCksIFRBRykpID09ICdzdHJpbmcnID8gVFxuICAgIC8vIGJ1aWx0aW5UYWcgY2FzZVxuICAgIDogQVJHID8gY29mKE8pXG4gICAgLy8gRVMzIGFyZ3VtZW50cyBmYWxsYmFja1xuICAgIDogKEIgPSBjb2YoTykpID09ICdPYmplY3QnICYmIHR5cGVvZiBPLmNhbGxlZSA9PSAnZnVuY3Rpb24nID8gJ0FyZ3VtZW50cycgOiBCO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2NsYXNzb2YuanNcbi8vIG1vZHVsZSBpZCA9IDU0OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBvcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuL19hLWZ1bmN0aW9uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbiwgdGhhdCwgbGVuZ3RoKSB7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmICh0aGF0ID09PSB1bmRlZmluZWQpIHJldHVybiBmbjtcbiAgc3dpdGNoIChsZW5ndGgpIHtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbiAoYSkge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKC8qIC4uLmFyZ3MgKi8pIHtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19jdHguanNcbi8vIG1vZHVsZSBpZCA9IDU1MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyA3LjIuMSBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ID09IHVuZGVmaW5lZCkgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fZGVmaW5lZC5qc1xuLy8gbW9kdWxlIGlkID0gNTUxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGFsbCBlbnVtZXJhYmxlIG9iamVjdCBrZXlzLCBpbmNsdWRlcyBzeW1ib2xzXG52YXIgZ2V0S2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJyk7XG52YXIgZ09QUyA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BzJyk7XG52YXIgcElFID0gcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdmFyIHJlc3VsdCA9IGdldEtleXMoaXQpO1xuICB2YXIgZ2V0U3ltYm9scyA9IGdPUFMuZjtcbiAgaWYgKGdldFN5bWJvbHMpIHtcbiAgICB2YXIgc3ltYm9scyA9IGdldFN5bWJvbHMoaXQpO1xuICAgIHZhciBpc0VudW0gPSBwSUUuZjtcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGtleTtcbiAgICB3aGlsZSAoc3ltYm9scy5sZW5ndGggPiBpKSBpZiAoaXNFbnVtLmNhbGwoaXQsIGtleSA9IHN5bWJvbHNbaSsrXSkpIHJlc3VsdC5wdXNoKGtleSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19lbnVtLWtleXMuanNcbi8vIG1vZHVsZSBpZCA9IDU1MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxudmFyICRleHBvcnQgPSBmdW5jdGlvbiAodHlwZSwgbmFtZSwgc291cmNlKSB7XG4gIHZhciBJU19GT1JDRUQgPSB0eXBlICYgJGV4cG9ydC5GO1xuICB2YXIgSVNfR0xPQkFMID0gdHlwZSAmICRleHBvcnQuRztcbiAgdmFyIElTX1NUQVRJQyA9IHR5cGUgJiAkZXhwb3J0LlM7XG4gIHZhciBJU19QUk9UTyA9IHR5cGUgJiAkZXhwb3J0LlA7XG4gIHZhciBJU19CSU5EID0gdHlwZSAmICRleHBvcnQuQjtcbiAgdmFyIHRhcmdldCA9IElTX0dMT0JBTCA/IGdsb2JhbCA6IElTX1NUQVRJQyA/IGdsb2JhbFtuYW1lXSB8fCAoZ2xvYmFsW25hbWVdID0ge30pIDogKGdsb2JhbFtuYW1lXSB8fCB7fSlbUFJPVE9UWVBFXTtcbiAgdmFyIGV4cG9ydHMgPSBJU19HTE9CQUwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KTtcbiAgdmFyIGV4cFByb3RvID0gZXhwb3J0c1tQUk9UT1RZUEVdIHx8IChleHBvcnRzW1BST1RPVFlQRV0gPSB7fSk7XG4gIHZhciBrZXksIG93biwgb3V0LCBleHA7XG4gIGlmIChJU19HTE9CQUwpIHNvdXJjZSA9IG5hbWU7XG4gIGZvciAoa2V5IGluIHNvdXJjZSkge1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIHRhcmdldFtrZXldICE9PSB1bmRlZmluZWQ7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSAob3duID8gdGFyZ2V0IDogc291cmNlKVtrZXldO1xuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XG4gICAgZXhwID0gSVNfQklORCAmJiBvd24gPyBjdHgob3V0LCBnbG9iYWwpIDogSVNfUFJPVE8gJiYgdHlwZW9mIG91dCA9PSAnZnVuY3Rpb24nID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgLy8gZXh0ZW5kIGdsb2JhbFxuICAgIGlmICh0YXJnZXQpIHJlZGVmaW5lKHRhcmdldCwga2V5LCBvdXQsIHR5cGUgJiAkZXhwb3J0LlUpO1xuICAgIC8vIGV4cG9ydFxuICAgIGlmIChleHBvcnRzW2tleV0gIT0gb3V0KSBoaWRlKGV4cG9ydHMsIGtleSwgZXhwKTtcbiAgICBpZiAoSVNfUFJPVE8gJiYgZXhwUHJvdG9ba2V5XSAhPSBvdXQpIGV4cFByb3RvW2tleV0gPSBvdXQ7XG4gIH1cbn07XG5nbG9iYWwuY29yZSA9IGNvcmU7XG4vLyB0eXBlIGJpdG1hcFxuJGV4cG9ydC5GID0gMTsgICAvLyBmb3JjZWRcbiRleHBvcnQuRyA9IDI7ICAgLy8gZ2xvYmFsXG4kZXhwb3J0LlMgPSA0OyAgIC8vIHN0YXRpY1xuJGV4cG9ydC5QID0gODsgICAvLyBwcm90b1xuJGV4cG9ydC5CID0gMTY7ICAvLyBiaW5kXG4kZXhwb3J0LlcgPSAzMjsgIC8vIHdyYXBcbiRleHBvcnQuVSA9IDY0OyAgLy8gc2FmZVxuJGV4cG9ydC5SID0gMTI4OyAvLyByZWFsIHByb3RvIG1ldGhvZCBmb3IgYGxpYnJhcnlgXG5tb2R1bGUuZXhwb3J0cyA9ICRleHBvcnQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19leHBvcnQuanNcbi8vIG1vZHVsZSBpZCA9IDU1M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudDtcbm1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faHRtbC5qc1xuLy8gbW9kdWxlIGlkID0gNTU0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApID8gT2JqZWN0IDogZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19pb2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSA1NTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gNy4yLjIgSXNBcnJheShhcmd1bWVudClcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiBpc0FycmF5KGFyZykge1xuICByZXR1cm4gY29mKGFyZykgPT0gJ0FycmF5Jztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19pcy1hcnJheS5qc1xuLy8gbW9kdWxlIGlkID0gNTU2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBNRVRBID0gcmVxdWlyZSgnLi9fdWlkJykoJ21ldGEnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIHNldERlc2MgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mO1xudmFyIGlkID0gMDtcbnZhciBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRydWU7XG59O1xudmFyIEZSRUVaRSA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGlzRXh0ZW5zaWJsZShPYmplY3QucHJldmVudEV4dGVuc2lvbnMoe30pKTtcbn0pO1xudmFyIHNldE1ldGEgPSBmdW5jdGlvbiAoaXQpIHtcbiAgc2V0RGVzYyhpdCwgTUVUQSwgeyB2YWx1ZToge1xuICAgIGk6ICdPJyArICsraWQsIC8vIG9iamVjdCBJRFxuICAgIHc6IHt9ICAgICAgICAgIC8vIHdlYWsgY29sbGVjdGlvbnMgSURzXG4gIH0gfSk7XG59O1xudmFyIGZhc3RLZXkgPSBmdW5jdGlvbiAoaXQsIGNyZWF0ZSkge1xuICAvLyByZXR1cm4gcHJpbWl0aXZlIHdpdGggcHJlZml4XG4gIGlmICghaXNPYmplY3QoaXQpKSByZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnID8gaXQgOiAodHlwZW9mIGl0ID09ICdzdHJpbmcnID8gJ1MnIDogJ1AnKSArIGl0O1xuICBpZiAoIWhhcyhpdCwgTUVUQSkpIHtcbiAgICAvLyBjYW4ndCBzZXQgbWV0YWRhdGEgdG8gdW5jYXVnaHQgZnJvemVuIG9iamVjdFxuICAgIGlmICghaXNFeHRlbnNpYmxlKGl0KSkgcmV0dXJuICdGJztcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBtZXRhZGF0YVxuICAgIGlmICghY3JlYXRlKSByZXR1cm4gJ0UnO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBvYmplY3QgSURcbiAgfSByZXR1cm4gaXRbTUVUQV0uaTtcbn07XG52YXIgZ2V0V2VhayA9IGZ1bmN0aW9uIChpdCwgY3JlYXRlKSB7XG4gIGlmICghaGFzKGl0LCBNRVRBKSkge1xuICAgIC8vIGNhbid0IHNldCBtZXRhZGF0YSB0byB1bmNhdWdodCBmcm96ZW4gb2JqZWN0XG4gICAgaWYgKCFpc0V4dGVuc2libGUoaXQpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBtZXRhZGF0YVxuICAgIGlmICghY3JlYXRlKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gYWRkIG1pc3NpbmcgbWV0YWRhdGFcbiAgICBzZXRNZXRhKGl0KTtcbiAgLy8gcmV0dXJuIGhhc2ggd2VhayBjb2xsZWN0aW9ucyBJRHNcbiAgfSByZXR1cm4gaXRbTUVUQV0udztcbn07XG4vLyBhZGQgbWV0YWRhdGEgb24gZnJlZXplLWZhbWlseSBtZXRob2RzIGNhbGxpbmdcbnZhciBvbkZyZWV6ZSA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoRlJFRVpFICYmIG1ldGEuTkVFRCAmJiBpc0V4dGVuc2libGUoaXQpICYmICFoYXMoaXQsIE1FVEEpKSBzZXRNZXRhKGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcbnZhciBtZXRhID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIEtFWTogTUVUQSxcbiAgTkVFRDogZmFsc2UsXG4gIGZhc3RLZXk6IGZhc3RLZXksXG4gIGdldFdlYWs6IGdldFdlYWssXG4gIG9uRnJlZXplOiBvbkZyZWV6ZVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX21ldGEuanNcbi8vIG1vZHVsZSBpZCA9IDU1N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyAxOS4xLjIuMiAvIDE1LjIuMy41IE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGRQcyA9IHJlcXVpcmUoJy4vX29iamVjdC1kcHMnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKTtcbnZhciBJRV9QUk9UTyA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKTtcbnZhciBFbXB0eSA9IGZ1bmN0aW9uICgpIHsgLyogZW1wdHkgKi8gfTtcbnZhciBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxuLy8gQ3JlYXRlIG9iamVjdCB3aXRoIGZha2UgYG51bGxgIHByb3RvdHlwZTogdXNlIGlmcmFtZSBPYmplY3Qgd2l0aCBjbGVhcmVkIHByb3RvdHlwZVxudmFyIGNyZWF0ZURpY3QgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIFRocmFzaCwgd2FzdGUgYW5kIHNvZG9teTogSUUgR0MgYnVnXG4gIHZhciBpZnJhbWUgPSByZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2lmcmFtZScpO1xuICB2YXIgaSA9IGVudW1CdWdLZXlzLmxlbmd0aDtcbiAgdmFyIGx0ID0gJzwnO1xuICB2YXIgZ3QgPSAnPic7XG4gIHZhciBpZnJhbWVEb2N1bWVudDtcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIHJlcXVpcmUoJy4vX2h0bWwnKS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICBpZnJhbWUuc3JjID0gJ2phdmFzY3JpcHQ6JzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zY3JpcHQtdXJsXG4gIC8vIGNyZWF0ZURpY3QgPSBpZnJhbWUuY29udGVudFdpbmRvdy5PYmplY3Q7XG4gIC8vIGh0bWwucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcbiAgaWZyYW1lRG9jdW1lbnQgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgaWZyYW1lRG9jdW1lbnQub3BlbigpO1xuICBpZnJhbWVEb2N1bWVudC53cml0ZShsdCArICdzY3JpcHQnICsgZ3QgKyAnZG9jdW1lbnQuRj1PYmplY3QnICsgbHQgKyAnL3NjcmlwdCcgKyBndCk7XG4gIGlmcmFtZURvY3VtZW50LmNsb3NlKCk7XG4gIGNyZWF0ZURpY3QgPSBpZnJhbWVEb2N1bWVudC5GO1xuICB3aGlsZSAoaS0tKSBkZWxldGUgY3JlYXRlRGljdFtQUk9UT1RZUEVdW2VudW1CdWdLZXlzW2ldXTtcbiAgcmV0dXJuIGNyZWF0ZURpY3QoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiBjcmVhdGUoTywgUHJvcGVydGllcykge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoTyAhPT0gbnVsbCkge1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBhbk9iamVjdChPKTtcbiAgICByZXN1bHQgPSBuZXcgRW1wdHkoKTtcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gbnVsbDtcbiAgICAvLyBhZGQgXCJfX3Byb3RvX19cIiBmb3IgT2JqZWN0LmdldFByb3RvdHlwZU9mIHBvbHlmaWxsXG4gICAgcmVzdWx0W0lFX1BST1RPXSA9IE87XG4gIH0gZWxzZSByZXN1bHQgPSBjcmVhdGVEaWN0KCk7XG4gIHJldHVybiBQcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiBkUHMocmVzdWx0LCBQcm9wZXJ0aWVzKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19vYmplY3QtY3JlYXRlLmpzXG4vLyBtb2R1bGUgaWQgPSA1NThcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGRQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBnZXRLZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIHZhciBrZXlzID0gZ2V0S2V5cyhQcm9wZXJ0aWVzKTtcbiAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICB2YXIgaSA9IDA7XG4gIHZhciBQO1xuICB3aGlsZSAobGVuZ3RoID4gaSkgZFAuZihPLCBQID0ga2V5c1tpKytdLCBQcm9wZXJ0aWVzW1BdKTtcbiAgcmV0dXJuIE87XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwcy5qc1xuLy8gbW9kdWxlIGlkID0gNTU5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBwSUUgPSByZXF1aXJlKCcuL19vYmplY3QtcGllJyk7XG52YXIgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4vX2llOC1kb20tZGVmaW5lJyk7XG52YXIgZ09QRCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG5cbmV4cG9ydHMuZiA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBnT1BEIDogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApIHtcbiAgTyA9IHRvSU9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBpZiAoSUU4X0RPTV9ERUZJTkUpIHRyeSB7XG4gICAgcmV0dXJuIGdPUEQoTywgUCk7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoaGFzKE8sIFApKSByZXR1cm4gY3JlYXRlRGVzYyghcElFLmYuY2FsbChPLCBQKSwgT1tQXSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWdvcGQuanNcbi8vIG1vZHVsZSBpZCA9IDU2MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBmYWxsYmFjayBmb3IgSUUxMSBidWdneSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB3aXRoIGlmcmFtZSBhbmQgd2luZG93XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIGdPUE4gPSByZXF1aXJlKCcuL19vYmplY3QtZ29wbicpLmY7XG52YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxudmFyIHdpbmRvd05hbWVzID0gdHlwZW9mIHdpbmRvdyA9PSAnb2JqZWN0JyAmJiB3aW5kb3cgJiYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXNcbiAgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh3aW5kb3cpIDogW107XG5cbnZhciBnZXRXaW5kb3dOYW1lcyA9IGZ1bmN0aW9uIChpdCkge1xuICB0cnkge1xuICAgIHJldHVybiBnT1BOKGl0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB3aW5kb3dOYW1lcy5zbGljZSgpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5mID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCkge1xuICByZXR1cm4gd2luZG93TmFtZXMgJiYgdG9TdHJpbmcuY2FsbChpdCkgPT0gJ1tvYmplY3QgV2luZG93XScgPyBnZXRXaW5kb3dOYW1lcyhpdCkgOiBnT1BOKHRvSU9iamVjdChpdCkpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX29iamVjdC1nb3BuLWV4dC5qc1xuLy8gbW9kdWxlIGlkID0gNTYxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkZWYgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIFRBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgdGFnLCBzdGF0KSB7XG4gIGlmIChpdCAmJiAhaGFzKGl0ID0gc3RhdCA/IGl0IDogaXQucHJvdG90eXBlLCBUQUcpKSBkZWYoaXQsIFRBRywgeyBjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiB0YWcgfSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fc2V0LXRvLXN0cmluZy10YWcuanNcbi8vIG1vZHVsZSBpZCA9IDU2MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIG1heCA9IE1hdGgubWF4O1xudmFyIG1pbiA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW5kZXgsIGxlbmd0aCkge1xuICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XG4gIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3RvLWFic29sdXRlLWluZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA1NjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gNy4xLjE1IFRvTGVuZ3RoXG52YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIG1pbiA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCAweDFmZmZmZmZmZmZmZmZmKSA6IDA7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL190by1sZW5ndGguanNcbi8vIG1vZHVsZSBpZCA9IDU2NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBMSUJSQVJZID0gcmVxdWlyZSgnLi9fbGlicmFyeScpO1xudmFyIHdrc0V4dCA9IHJlcXVpcmUoJy4vX3drcy1leHQnKTtcbnZhciBkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmY7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHZhciAkU3ltYm9sID0gY29yZS5TeW1ib2wgfHwgKGNvcmUuU3ltYm9sID0gTElCUkFSWSA/IHt9IDogZ2xvYmFsLlN5bWJvbCB8fCB7fSk7XG4gIGlmIChuYW1lLmNoYXJBdCgwKSAhPSAnXycgJiYgIShuYW1lIGluICRTeW1ib2wpKSBkZWZpbmVQcm9wZXJ0eSgkU3ltYm9sLCBuYW1lLCB7IHZhbHVlOiB3a3NFeHQuZihuYW1lKSB9KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL193a3MtZGVmaW5lLmpzXG4vLyBtb2R1bGUgaWQgPSA1NjVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuLy8gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4vX2NsYXNzb2YnKTtcbnZhciB0ZXN0ID0ge307XG50ZXN0W3JlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpXSA9ICd6JztcbmlmICh0ZXN0ICsgJycgIT0gJ1tvYmplY3Qgel0nKSB7XG4gIHJlcXVpcmUoJy4vX3JlZGVmaW5lJykoT2JqZWN0LnByb3RvdHlwZSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuICdbb2JqZWN0ICcgKyBjbGFzc29mKHRoaXMpICsgJ10nO1xuICB9LCB0cnVlKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcuanNcbi8vIG1vZHVsZSBpZCA9IDU2NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG4vLyBFQ01BU2NyaXB0IDYgc3ltYm9scyBzaGltXG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpO1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJyk7XG52YXIgTUVUQSA9IHJlcXVpcmUoJy4vX21ldGEnKS5LRVk7XG52YXIgJGZhaWxzID0gcmVxdWlyZSgnLi9fZmFpbHMnKTtcbnZhciBzaGFyZWQgPSByZXF1aXJlKCcuL19zaGFyZWQnKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJyk7XG52YXIgdWlkID0gcmVxdWlyZSgnLi9fdWlkJyk7XG52YXIgd2tzID0gcmVxdWlyZSgnLi9fd2tzJyk7XG52YXIgd2tzRXh0ID0gcmVxdWlyZSgnLi9fd2tzLWV4dCcpO1xudmFyIHdrc0RlZmluZSA9IHJlcXVpcmUoJy4vX3drcy1kZWZpbmUnKTtcbnZhciBlbnVtS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0ta2V5cycpO1xudmFyIGlzQXJyYXkgPSByZXF1aXJlKCcuL19pcy1hcnJheScpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKTtcbnZhciBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xudmFyIF9jcmVhdGUgPSByZXF1aXJlKCcuL19vYmplY3QtY3JlYXRlJyk7XG52YXIgZ09QTkV4dCA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BuLWV4dCcpO1xudmFyICRHT1BEID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcGQnKTtcbnZhciAkRFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciAka2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJyk7XG52YXIgZ09QRCA9ICRHT1BELmY7XG52YXIgZFAgPSAkRFAuZjtcbnZhciBnT1BOID0gZ09QTkV4dC5mO1xudmFyICRTeW1ib2wgPSBnbG9iYWwuU3ltYm9sO1xudmFyICRKU09OID0gZ2xvYmFsLkpTT047XG52YXIgX3N0cmluZ2lmeSA9ICRKU09OICYmICRKU09OLnN0cmluZ2lmeTtcbnZhciBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcbnZhciBISURERU4gPSB3a3MoJ19oaWRkZW4nKTtcbnZhciBUT19QUklNSVRJVkUgPSB3a3MoJ3RvUHJpbWl0aXZlJyk7XG52YXIgaXNFbnVtID0ge30ucHJvcGVydHlJc0VudW1lcmFibGU7XG52YXIgU3ltYm9sUmVnaXN0cnkgPSBzaGFyZWQoJ3N5bWJvbC1yZWdpc3RyeScpO1xudmFyIEFsbFN5bWJvbHMgPSBzaGFyZWQoJ3N5bWJvbHMnKTtcbnZhciBPUFN5bWJvbHMgPSBzaGFyZWQoJ29wLXN5bWJvbHMnKTtcbnZhciBPYmplY3RQcm90byA9IE9iamVjdFtQUk9UT1RZUEVdO1xudmFyIFVTRV9OQVRJVkUgPSB0eXBlb2YgJFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xudmFyIFFPYmplY3QgPSBnbG9iYWwuUU9iamVjdDtcbi8vIERvbid0IHVzZSBzZXR0ZXJzIGluIFF0IFNjcmlwdCwgaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzE3M1xudmFyIHNldHRlciA9ICFRT2JqZWN0IHx8ICFRT2JqZWN0W1BST1RPVFlQRV0gfHwgIVFPYmplY3RbUFJPVE9UWVBFXS5maW5kQ2hpbGQ7XG5cbi8vIGZhbGxiYWNrIGZvciBvbGQgQW5kcm9pZCwgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTY4N1xudmFyIHNldFN5bWJvbERlc2MgPSBERVNDUklQVE9SUyAmJiAkZmFpbHMoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gX2NyZWF0ZShkUCh7fSwgJ2EnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBkUCh0aGlzLCAnYScsIHsgdmFsdWU6IDcgfSkuYTsgfVxuICB9KSkuYSAhPSA3O1xufSkgPyBmdW5jdGlvbiAoaXQsIGtleSwgRCkge1xuICB2YXIgcHJvdG9EZXNjID0gZ09QRChPYmplY3RQcm90bywga2V5KTtcbiAgaWYgKHByb3RvRGVzYykgZGVsZXRlIE9iamVjdFByb3RvW2tleV07XG4gIGRQKGl0LCBrZXksIEQpO1xuICBpZiAocHJvdG9EZXNjICYmIGl0ICE9PSBPYmplY3RQcm90bykgZFAoT2JqZWN0UHJvdG8sIGtleSwgcHJvdG9EZXNjKTtcbn0gOiBkUDtcblxudmFyIHdyYXAgPSBmdW5jdGlvbiAodGFnKSB7XG4gIHZhciBzeW0gPSBBbGxTeW1ib2xzW3RhZ10gPSBfY3JlYXRlKCRTeW1ib2xbUFJPVE9UWVBFXSk7XG4gIHN5bS5fayA9IHRhZztcbiAgcmV0dXJuIHN5bTtcbn07XG5cbnZhciBpc1N5bWJvbCA9IFVTRV9OQVRJVkUgJiYgdHlwZW9mICRTeW1ib2wuaXRlcmF0b3IgPT0gJ3N5bWJvbCcgPyBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJztcbn0gOiBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0IGluc3RhbmNlb2YgJFN5bWJvbDtcbn07XG5cbnZhciAkZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBEKSB7XG4gIGlmIChpdCA9PT0gT2JqZWN0UHJvdG8pICRkZWZpbmVQcm9wZXJ0eShPUFN5bWJvbHMsIGtleSwgRCk7XG4gIGFuT2JqZWN0KGl0KTtcbiAga2V5ID0gdG9QcmltaXRpdmUoa2V5LCB0cnVlKTtcbiAgYW5PYmplY3QoRCk7XG4gIGlmIChoYXMoQWxsU3ltYm9scywga2V5KSkge1xuICAgIGlmICghRC5lbnVtZXJhYmxlKSB7XG4gICAgICBpZiAoIWhhcyhpdCwgSElEREVOKSkgZFAoaXQsIEhJRERFTiwgY3JlYXRlRGVzYygxLCB7fSkpO1xuICAgICAgaXRbSElEREVOXVtrZXldID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0pIGl0W0hJRERFTl1ba2V5XSA9IGZhbHNlO1xuICAgICAgRCA9IF9jcmVhdGUoRCwgeyBlbnVtZXJhYmxlOiBjcmVhdGVEZXNjKDAsIGZhbHNlKSB9KTtcbiAgICB9IHJldHVybiBzZXRTeW1ib2xEZXNjKGl0LCBrZXksIEQpO1xuICB9IHJldHVybiBkUChpdCwga2V5LCBEKTtcbn07XG52YXIgJGRlZmluZVByb3BlcnRpZXMgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKGl0LCBQKSB7XG4gIGFuT2JqZWN0KGl0KTtcbiAgdmFyIGtleXMgPSBlbnVtS2V5cyhQID0gdG9JT2JqZWN0KFApKTtcbiAgdmFyIGkgPSAwO1xuICB2YXIgbCA9IGtleXMubGVuZ3RoO1xuICB2YXIga2V5O1xuICB3aGlsZSAobCA+IGkpICRkZWZpbmVQcm9wZXJ0eShpdCwga2V5ID0ga2V5c1tpKytdLCBQW2tleV0pO1xuICByZXR1cm4gaXQ7XG59O1xudmFyICRjcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaXQsIFApIHtcbiAgcmV0dXJuIFAgPT09IHVuZGVmaW5lZCA/IF9jcmVhdGUoaXQpIDogJGRlZmluZVByb3BlcnRpZXMoX2NyZWF0ZShpdCksIFApO1xufTtcbnZhciAkcHJvcGVydHlJc0VudW1lcmFibGUgPSBmdW5jdGlvbiBwcm9wZXJ0eUlzRW51bWVyYWJsZShrZXkpIHtcbiAgdmFyIEUgPSBpc0VudW0uY2FsbCh0aGlzLCBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpKTtcbiAgaWYgKHRoaXMgPT09IE9iamVjdFByb3RvICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICFoYXMoT1BTeW1ib2xzLCBrZXkpKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiBFIHx8ICFoYXModGhpcywga2V5KSB8fCAhaGFzKEFsbFN5bWJvbHMsIGtleSkgfHwgaGFzKHRoaXMsIEhJRERFTikgJiYgdGhpc1tISURERU5dW2tleV0gPyBFIDogdHJ1ZTtcbn07XG52YXIgJGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KSB7XG4gIGl0ID0gdG9JT2JqZWN0KGl0KTtcbiAga2V5ID0gdG9QcmltaXRpdmUoa2V5LCB0cnVlKTtcbiAgaWYgKGl0ID09PSBPYmplY3RQcm90byAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhaGFzKE9QU3ltYm9scywga2V5KSkgcmV0dXJuO1xuICB2YXIgRCA9IGdPUEQoaXQsIGtleSk7XG4gIGlmIChEICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICEoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSkpIEQuZW51bWVyYWJsZSA9IHRydWU7XG4gIHJldHVybiBEO1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlOYW1lcyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpIHtcbiAgdmFyIG5hbWVzID0gZ09QTih0b0lPYmplY3QoaXQpKTtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIgaSA9IDA7XG4gIHZhciBrZXk7XG4gIHdoaWxlIChuYW1lcy5sZW5ndGggPiBpKSB7XG4gICAgaWYgKCFoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkgJiYga2V5ICE9IEhJRERFTiAmJiBrZXkgIT0gTUVUQSkgcmVzdWx0LnB1c2goa2V5KTtcbiAgfSByZXR1cm4gcmVzdWx0O1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlTeW1ib2xzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGl0KSB7XG4gIHZhciBJU19PUCA9IGl0ID09PSBPYmplY3RQcm90bztcbiAgdmFyIG5hbWVzID0gZ09QTihJU19PUCA/IE9QU3ltYm9scyA6IHRvSU9iamVjdChpdCkpO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBpID0gMDtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIHtcbiAgICBpZiAoaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pICYmIChJU19PUCA/IGhhcyhPYmplY3RQcm90bywga2V5KSA6IHRydWUpKSByZXN1bHQucHVzaChBbGxTeW1ib2xzW2tleV0pO1xuICB9IHJldHVybiByZXN1bHQ7XG59O1xuXG4vLyAxOS40LjEuMSBTeW1ib2woW2Rlc2NyaXB0aW9uXSlcbmlmICghVVNFX05BVElWRSkge1xuICAkU3ltYm9sID0gZnVuY3Rpb24gU3ltYm9sKCkge1xuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgJFN5bWJvbCkgdGhyb3cgVHlwZUVycm9yKCdTeW1ib2wgaXMgbm90IGEgY29uc3RydWN0b3IhJyk7XG4gICAgdmFyIHRhZyA9IHVpZChhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZCk7XG4gICAgdmFyICRzZXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh0aGlzID09PSBPYmplY3RQcm90bykgJHNldC5jYWxsKE9QU3ltYm9scywgdmFsdWUpO1xuICAgICAgaWYgKGhhcyh0aGlzLCBISURERU4pICYmIGhhcyh0aGlzW0hJRERFTl0sIHRhZykpIHRoaXNbSElEREVOXVt0YWddID0gZmFsc2U7XG4gICAgICBzZXRTeW1ib2xEZXNjKHRoaXMsIHRhZywgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xuICAgIH07XG4gICAgaWYgKERFU0NSSVBUT1JTICYmIHNldHRlcikgc2V0U3ltYm9sRGVzYyhPYmplY3RQcm90bywgdGFnLCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgc2V0OiAkc2V0IH0pO1xuICAgIHJldHVybiB3cmFwKHRhZyk7XG4gIH07XG4gIHJlZGVmaW5lKCRTeW1ib2xbUFJPVE9UWVBFXSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2s7XG4gIH0pO1xuXG4gICRHT1BELmYgPSAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuICAkRFAuZiA9ICRkZWZpbmVQcm9wZXJ0eTtcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LWdvcG4nKS5mID0gZ09QTkV4dC5mID0gJGdldE93blByb3BlcnR5TmFtZXM7XG4gIHJlcXVpcmUoJy4vX29iamVjdC1waWUnKS5mID0gJHByb3BlcnR5SXNFbnVtZXJhYmxlO1xuICByZXF1aXJlKCcuL19vYmplY3QtZ29wcycpLmYgPSAkZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG4gIGlmIChERVNDUklQVE9SUyAmJiAhcmVxdWlyZSgnLi9fbGlicmFyeScpKSB7XG4gICAgcmVkZWZpbmUoT2JqZWN0UHJvdG8sICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsICRwcm9wZXJ0eUlzRW51bWVyYWJsZSwgdHJ1ZSk7XG4gIH1cblxuICB3a3NFeHQuZiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIHdyYXAod2tzKG5hbWUpKTtcbiAgfTtcbn1cblxuJGV4cG9ydCgkZXhwb3J0LkcgKyAkZXhwb3J0LlcgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgeyBTeW1ib2w6ICRTeW1ib2wgfSk7XG5cbmZvciAodmFyIGVzNlN5bWJvbHMgPSAoXG4gIC8vIDE5LjQuMi4yLCAxOS40LjIuMywgMTkuNC4yLjQsIDE5LjQuMi42LCAxOS40LjIuOCwgMTkuNC4yLjksIDE5LjQuMi4xMCwgMTkuNC4yLjExLCAxOS40LjIuMTIsIDE5LjQuMi4xMywgMTkuNC4yLjE0XG4gICdoYXNJbnN0YW5jZSxpc0NvbmNhdFNwcmVhZGFibGUsaXRlcmF0b3IsbWF0Y2gscmVwbGFjZSxzZWFyY2gsc3BlY2llcyxzcGxpdCx0b1ByaW1pdGl2ZSx0b1N0cmluZ1RhZyx1bnNjb3BhYmxlcydcbikuc3BsaXQoJywnKSwgaiA9IDA7IGVzNlN5bWJvbHMubGVuZ3RoID4gajspd2tzKGVzNlN5bWJvbHNbaisrXSk7XG5cbmZvciAodmFyIHdlbGxLbm93blN5bWJvbHMgPSAka2V5cyh3a3Muc3RvcmUpLCBrID0gMDsgd2VsbEtub3duU3ltYm9scy5sZW5ndGggPiBrOykgd2tzRGVmaW5lKHdlbGxLbm93blN5bWJvbHNbaysrXSk7XG5cbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsICdTeW1ib2wnLCB7XG4gIC8vIDE5LjQuMi4xIFN5bWJvbC5mb3Ioa2V5KVxuICAnZm9yJzogZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBoYXMoU3ltYm9sUmVnaXN0cnksIGtleSArPSAnJylcbiAgICAgID8gU3ltYm9sUmVnaXN0cnlba2V5XVxuICAgICAgOiBTeW1ib2xSZWdpc3RyeVtrZXldID0gJFN5bWJvbChrZXkpO1xuICB9LFxuICAvLyAxOS40LjIuNSBTeW1ib2wua2V5Rm9yKHN5bSlcbiAga2V5Rm9yOiBmdW5jdGlvbiBrZXlGb3Ioc3ltKSB7XG4gICAgaWYgKCFpc1N5bWJvbChzeW0pKSB0aHJvdyBUeXBlRXJyb3Ioc3ltICsgJyBpcyBub3QgYSBzeW1ib2whJyk7XG4gICAgZm9yICh2YXIga2V5IGluIFN5bWJvbFJlZ2lzdHJ5KSBpZiAoU3ltYm9sUmVnaXN0cnlba2V5XSA9PT0gc3ltKSByZXR1cm4ga2V5O1xuICB9LFxuICB1c2VTZXR0ZXI6IGZ1bmN0aW9uICgpIHsgc2V0dGVyID0gdHJ1ZTsgfSxcbiAgdXNlU2ltcGxlOiBmdW5jdGlvbiAoKSB7IHNldHRlciA9IGZhbHNlOyB9XG59KTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgJ09iamVjdCcsIHtcbiAgLy8gMTkuMS4yLjIgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxuICBjcmVhdGU6ICRjcmVhdGUsXG4gIC8vIDE5LjEuMi40IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKVxuICBkZWZpbmVQcm9wZXJ0eTogJGRlZmluZVByb3BlcnR5LFxuICAvLyAxOS4xLjIuMyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKVxuICBkZWZpbmVQcm9wZXJ0aWVzOiAkZGVmaW5lUHJvcGVydGllcyxcbiAgLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIC8vIDE5LjEuMi43IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXG4gIGdldE93blByb3BlcnR5TmFtZXM6ICRnZXRPd25Qcm9wZXJ0eU5hbWVzLFxuICAvLyAxOS4xLjIuOCBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKE8pXG4gIGdldE93blByb3BlcnR5U3ltYm9sczogJGdldE93blByb3BlcnR5U3ltYm9sc1xufSk7XG5cbi8vIDI0LjMuMiBKU09OLnN0cmluZ2lmeSh2YWx1ZSBbLCByZXBsYWNlciBbLCBzcGFjZV1dKVxuJEpTT04gJiYgJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAoIVVTRV9OQVRJVkUgfHwgJGZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgdmFyIFMgPSAkU3ltYm9sKCk7XG4gIC8vIE1TIEVkZ2UgY29udmVydHMgc3ltYm9sIHZhbHVlcyB0byBKU09OIGFzIHt9XG4gIC8vIFdlYktpdCBjb252ZXJ0cyBzeW1ib2wgdmFsdWVzIHRvIEpTT04gYXMgbnVsbFxuICAvLyBWOCB0aHJvd3Mgb24gYm94ZWQgc3ltYm9sc1xuICByZXR1cm4gX3N0cmluZ2lmeShbU10pICE9ICdbbnVsbF0nIHx8IF9zdHJpbmdpZnkoeyBhOiBTIH0pICE9ICd7fScgfHwgX3N0cmluZ2lmeShPYmplY3QoUykpICE9ICd7fSc7XG59KSksICdKU09OJywge1xuICBzdHJpbmdpZnk6IGZ1bmN0aW9uIHN0cmluZ2lmeShpdCkge1xuICAgIHZhciBhcmdzID0gW2l0XTtcbiAgICB2YXIgaSA9IDE7XG4gICAgdmFyIHJlcGxhY2VyLCAkcmVwbGFjZXI7XG4gICAgd2hpbGUgKGFyZ3VtZW50cy5sZW5ndGggPiBpKSBhcmdzLnB1c2goYXJndW1lbnRzW2krK10pO1xuICAgICRyZXBsYWNlciA9IHJlcGxhY2VyID0gYXJnc1sxXTtcbiAgICBpZiAoIWlzT2JqZWN0KHJlcGxhY2VyKSAmJiBpdCA9PT0gdW5kZWZpbmVkIHx8IGlzU3ltYm9sKGl0KSkgcmV0dXJuOyAvLyBJRTggcmV0dXJucyBzdHJpbmcgb24gdW5kZWZpbmVkXG4gICAgaWYgKCFpc0FycmF5KHJlcGxhY2VyKSkgcmVwbGFjZXIgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgaWYgKHR5cGVvZiAkcmVwbGFjZXIgPT0gJ2Z1bmN0aW9uJykgdmFsdWUgPSAkcmVwbGFjZXIuY2FsbCh0aGlzLCBrZXksIHZhbHVlKTtcbiAgICAgIGlmICghaXNTeW1ib2wodmFsdWUpKSByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgICBhcmdzWzFdID0gcmVwbGFjZXI7XG4gICAgcmV0dXJuIF9zdHJpbmdpZnkuYXBwbHkoJEpTT04sIGFyZ3MpO1xuICB9XG59KTtcblxuLy8gMTkuNC4zLjQgU3ltYm9sLnByb3RvdHlwZVtAQHRvUHJpbWl0aXZlXShoaW50KVxuJFN5bWJvbFtQUk9UT1RZUEVdW1RPX1BSSU1JVElWRV0gfHwgcmVxdWlyZSgnLi9faGlkZScpKCRTeW1ib2xbUFJPVE9UWVBFXSwgVE9fUFJJTUlUSVZFLCAkU3ltYm9sW1BST1RPVFlQRV0udmFsdWVPZik7XG4vLyAxOS40LjMuNSBTeW1ib2wucHJvdG90eXBlW0BAdG9TdHJpbmdUYWddXG5zZXRUb1N0cmluZ1RhZygkU3ltYm9sLCAnU3ltYm9sJyk7XG4vLyAyMC4yLjEuOSBNYXRoW0BAdG9TdHJpbmdUYWddXG5zZXRUb1N0cmluZ1RhZyhNYXRoLCAnTWF0aCcsIHRydWUpO1xuLy8gMjQuMy4zIEpTT05bQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKGdsb2JhbC5KU09OLCAnSlNPTicsIHRydWUpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9lczYuc3ltYm9sLmpzXG4vLyBtb2R1bGUgaWQgPSA1Njdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1wiKShmYWxzZSk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIub2FrLnNwYWNlciB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBkaXNwbGF5OiBibG9jaztcXG59XFxuLm9hay5zcGFjZXIuaW5saW5lIHtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTtcXG59XFxuLm9hay5zcGFjZXIuZmx1aWQge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBmbGV4OiAxIDEgMTAwJTtcXG59XFxuLm9hay5zcGFjZXIudGlueSB7XFxuICB3aWR0aDogMnB4O1xcbiAgaGVpZ2h0OiAycHg7XFxufVxcbi5vYWsuc3BhY2VyLnNtYWxsIHtcXG4gIHdpZHRoOiA0cHg7XFxuICBoZWlnaHQ6IDRweDtcXG59XFxuLm9hay5zcGFjZXIubWVkaXVtIHtcXG4gIHdpZHRoOiAxMHB4O1xcbiAgaGVpZ2h0OiAxMHB4O1xcbn1cXG4ub2FrLnNwYWNlci5sYXJnZSB7XFxuICB3aWR0aDogMjBweDtcXG4gIGhlaWdodDogMjBweDtcXG59XFxuLm9hay5zcGFjZXIuaHVnZSB7XFxuICB3aWR0aDogMzBweDtcXG4gIGhlaWdodDogMzBweDtcXG59XFxuLm9hay5zcGFjZXIubWFzc2l2ZSB7XFxuICB3aWR0aDogNTBweDtcXG4gIGhlaWdodDogNTBweDtcXG59XFxuXCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2Nzcy1sb2FkZXIhLi9+L2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3JjL2FwcC9TcGFjZXIubGVzc1xuLy8gbW9kdWxlIGlkID0gNTY5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcIikoZmFsc2UpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiLmZ1bGxXaWR0aCB7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuLmZ1bGxIZWlnaHQge1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG4uZnVsbFNpemUge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcblwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jc3MtbG9hZGVyIS4vfi9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3NyYy9hcHAvc3R5bGVzLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDU3MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvL1xuLy9cdCMgQ29yZSBgcnVsZXNgIC0tIHNpbXBsZSBkYXRhdHlwZXMsIGV0Yy5cbi8vXG4vLyBOT1RFOiBtYW55IG9mIHRoZSBiZWxvdyBhcmUgY3JlYXRlZCBhcyBjdXN0b20gUGF0dGVybiBzdWJjbGFzc2VzIGZvciBkZWJ1Z2dpbmcuXG4vL1xuaW1wb3J0IFBhcnNlciBmcm9tIFwiLi4vLi4vUGFyc2VyXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi4vLi4vUnVsZVwiO1xuaW1wb3J0IFRva2VuaXplciBmcm9tIFwiLi4vLi4vVG9rZW5pemVyXCI7XG5cbi8vIENyZWF0ZSBgY29yZWAgcGFyc2VyLlxuY29uc3QgcGFyc2VyID0gUGFyc2VyLmZvck5hbWUoXCJjb3JlXCIpO1xuZXhwb3J0IGRlZmF1bHQgcGFyc2VyO1xuXG5wYXJzZXIuZGVmaW5lUnVsZXMoXG4gIHtcbiAgICBuYW1lOiBcInN0YXRlbWVudHNcIixcbiAgICBjb25zdHJ1Y3RvcjogUnVsZS5TdGF0ZW1lbnRzXG4gIH0sXG5cbiAge1xuICAgIG5hbWU6IFwiY29tbWVudFwiLFxuICAgIGNvbnN0cnVjdG9yOiBSdWxlLkNvbW1lbnRcbiAgfSxcblxuICAvLyBgd29yZGAgPSBpcyBhIHNpbmdsZSBhbHBoYW51bWVyaWMgd29yZC5cbiAgLy8gTVVTVCBzdGFydCB3aXRoIGEgbG93ZXItY2FzZSBsZXR0ZXIgKD8pXG4gIHtcbiAgICBuYW1lOiBcIndvcmRcIixcbiAgICBwYXR0ZXJuOiAvXlthLXpdW1xcd1xcLV0qJC8sXG4gICAgY2Fub25pY2FsOiBcIldvcmRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3Mgd29yZCBleHRlbmRzIFJ1bGUuUGF0dGVybiB7XG4gICAgICAvLyBDb252ZXJ0IFwiLVwiIHRvIFwiX1wiIGluIHNvdXJjZSBvdXRwdXQuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0Y2hlZC5yZXBsYWNlKC9cXC0vZywgXCJfXCIpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBgaWRlbnRpZmllcmAgPSB2YXJpYWJsZXMgb3IgcHJvcGVydHkgbmFtZS5cbiAgLy8gTVVTVCBzdGFydCB3aXRoIGEgbG93ZXItY2FzZSBsZXR0ZXIgKD8pXG4gIC8vIE5PVEU6IFdlIGJsYWNrbGlzdCBhIGxvdCBvZiB3b3JkcyBhcyBpZGVudGlmaWVycy5cbiAge1xuICAgIG5hbWU6IFwiaWRlbnRpZmllclwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBjYW5vbmljYWw6IFwiSWRlbmZpZmllclwiLFxuICAgIHBhdHRlcm46IC9eW2Etel1bXFx3XFwtXSokLyxcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgaWRlbnRpZmllciBleHRlbmRzIFJ1bGUuUGF0dGVybiB7XG4gICAgICAvLyBDb252ZXJ0IFwiLVwiIHRvIFwiX1wiIGluIHNvdXJjZSBvdXRwdXQuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0Y2hlZC5yZXBsYWNlKC9cXC0vZywgXCJfXCIpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYmxhY2tsaXN0OiBbXG4gICAgICAvLyBBZGQgRW5nbGlzaCBwcmVwb3NpdGlvbnMgdG8gaWRlbnRpZmllciBibGFja2xpc3QuXG4gICAgICAvL1xuICAgICAgLy8gV2lraXBlZGlhIFwiUHJlcG9zaXRpb25cIjpcbiAgICAgIC8vXHRcIlByZXBvc2l0aW9ucy4uLmFyZSBhIGNsYXNzIG9mIHdvcmRzIHRoYXRcbiAgICAgIC8vXHRleHByZXNzIHNwYXRpYWwgb3IgdGVtcG9yYWwgcmVsYXRpb25zICAoaW4sIHVuZGVyLCB0b3dhcmRzLCBiZWZvcmUpXG4gICAgICAvL1x0b3IgbWFyayB2YXJpb3VzIHNlbWFudGljIHJvbGVzIChvZiwgZm9yKS5cbiAgICAgIC8vIFRFU1RNRVxuICAgICAgXCJhYm91dFwiLCBcImFib3ZlXCIsIFwiYWZ0ZXJcIiwgXCJhbmRcIiwgXCJhc1wiLCBcImF0XCIsXG4gICAgICBcImJlZm9yZVwiLCBcImJlaGluZFwiLCBcImJlbG93XCIsIFwiYmVuZWF0aFwiLCBcImJlc2lkZVwiLCBcImJldHdlZW5cIiwgXCJiZXlvbmRcIiwgXCJieVwiLFxuICAgICAgXCJkZWZpbmVkXCIsIFwiZG93blwiLCBcImR1cmluZ1wiLFxuICAgICAgXCJlYWNoXCIsIFwiZW1wdHlcIiwgXCJleGFjdGx5XCIsIFwiZXhjZXB0XCIsXG4gICAgICBcImZvclwiLCBcImZyb21cIixcbiAgICAgIFwiZ3JlYXRlclwiLFxuICAgICAgXCJJXCIsIFwiaW5cIiwgXCJpbnRvXCIsXG4gICAgICBcImxlc3NcIiwgXCJsb25nXCIsXG4gICAgICBcIm1lXCIsIFwibWludXNcIiwgXCJtb3JlXCIsXG4gICAgICBcIm5lYXJcIiwgXCJub3RcIixcbiAgICAgIFwib2ZcIiwgXCJvZmZcIiwgXCJvblwiLCBcIm9udG9cIiwgXCJvcHBvc2l0ZVwiLCBcIm9yXCIsIFwib3V0XCIsIFwib3V0c2lkZVwiLCBcIm92ZXJcIixcbiAgICAgIFwic2hvcnRcIiwgXCJzaW5jZVwiLFxuICAgICAgXCJ0aGFuXCIsIFwidGhlXCIsIFwidGhlblwiLCBcInRocm91Z2hcIiwgXCJ0aHJ1XCIsIFwidG9cIiwgXCJ0b3dhcmRcIiwgXCJ0b3dhcmRzXCIsXG4gICAgICBcInVuZGVmaW5lZFwiLCBcInVuZGVyXCIsIFwidW5kZXJuZWF0aFwiLCBcInVuaXF1ZVwiLCBcInVudGlsXCIsIFwidXBcIiwgXCJ1cG9uXCIsIFwidXBzaWRlXCIsXG4gICAgICBcInZlcnN1c1wiLCBcInZzXCIsXG4gICAgICBcIndoZXJlXCIsIFwid2l0aFwiLCBcIndpdGhpblwiLCBcIndpdGhvdXRcIixcblxuICAgICAgLy8gQWRkIGNvbW1vbiBlbmdsaXNoIHZlcmJzIHRvIGlkZW50aWZpZXIgYmxhY2tsaXN0LlxuICAgICAgXCJhcmVcIixcbiAgICAgIFwiZG9cIiwgXCJkb2VzXCIsXG4gICAgICBcImNvbnRhaW5zXCIsXG4gICAgICBcImhhc1wiLCBcImhhdmVcIixcbiAgICAgIFwiaXNcIixcbiAgICAgIFwicmVwZWF0XCIsXG4gICAgICBcIndhc1wiLCBcIndlcmVcIixcblxuICAgICAgLy8gQWRkIHNwZWNpYWwgY29udHJvbCBrZXl3b3JkcyB0byBpZGVudGlmaWVyIGJsYWNrbGlzdC5cbiAgICAgIFwiZWxzZVwiLFxuICAgICAgXCJpZlwiLFxuICAgICAgXCJvdGhlcndpc2VcIixcbiAgICAgIFwid2hpbGVcIixcblxuICAgICAgLy8gQWRkIGJvb2xlYW4gdG9rZW5zIHRvIGlkZW50aWZpZXIgYmxhY2tsaXN0LlxuICAgICAgXCJ0cnVlXCIsIFwiZmFsc2VcIixcbiAgICAgIFwieWVzXCIsIFwibm9cIixcbiAgICAgIFwib2tcIiwgXCJjYW5jZWxcIixcbiAgICAgIFwic3VjY2Vzc1wiLCBcImZhaWx1cmVcIixcblxuICAgICAgLy8gQWRkIG51bWJlciB3b3JkcyB0byBpZGVudGlmaWVyIGJsYWNrbGlzdC5cbiAgICAgIC8vIFRFU1RNRVxuICAgICAgXCJvbmVcIiwgXCJ0d29cIiwgXCJ0aHJlZVwiLCBcImZvdXJcIiwgXCJmaXZlXCIsXG4gICAgICBcInNpeFwiLCBcInNldmVuXCIsIFwiZWlnaHRcIiwgXCJuaW5lXCIsIFwidGVuXCIsXG4gICAgXVxuICB9LFxuXG4gIC8vIGBUeXBlYCA9IHR5cGUgbmFtZS5cbiAgLy8gTVVTVCBzdGFydCB3aXRoIGFuIHVwcGVyLWNhc2UgbGV0dGVyICg/KVxuICB7XG4gICAgbmFtZTogXCJ0eXBlXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIGNhbm9uaWNhbDogXCJUeXBlXCIsXG4gICAgcGF0dGVybjogL14oW0EtWl1bXFx3XFwtXSp8bGlzdHx0ZXh0fG51bWJlcnxpbnRlZ2VyfGRlY2ltYWx8Y2hhcmFjdGVyfGJvb2xlYW58b2JqZWN0KSQvLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyB0eXBlIGV4dGVuZHMgUnVsZS5QYXR0ZXJuIHtcbiAgICAgIC8vIENvbnZlcnQgXCItXCIgdG8gXCJfXCIgaW4gc291cmNlIG91dHB1dC5cbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgdHlwZSA9IHRoaXMubWF0Y2hlZDtcbiAgICAgICAgc3dpdGNoKHR5cGUpIHtcbiAgICAgICAgICAvLyBBbGlhcyBgTGlzdGAgdG8gYEFycmF5YFxuICAgICAgICAgIGNhc2UgXCJMaXN0XCI6XHRcdHJldHVybiBcIkFycmF5XCI7XG5cbiAgICAgICAgICAvLyBzcGVjaWFsIGNhc2UgdG8gdGFrZSB0aGUgZm9sbG93aW5nIGFzIGxvd2VyY2FzZVxuICAgICAgICAgIGNhc2UgXCJsaXN0XCI6XHRcdHJldHVybiBcIkFycmF5XCI7XG4gICAgICAgICAgY2FzZSBcInRleHRcIjpcdFx0cmV0dXJuIFwiU3RyaW5nXCI7XG4gICAgICAgICAgY2FzZSBcImNoYXJhY3RlclwiOlx0cmV0dXJuIFwiQ2hhcmFjdGVyXCI7XG4gICAgICAgICAgY2FzZSBcIm51bWJlclwiOlx0XHRyZXR1cm4gXCJOdW1iZXJcIjtcbiAgICAgICAgICBjYXNlIFwiaW50ZWdlclwiOlx0XHRyZXR1cm4gXCJJbnRlZ2VyXCI7XG4gICAgICAgICAgY2FzZSBcImRlY2ltYWxcIjpcdFx0cmV0dXJuIFwiRGVjaW1hbFwiO1xuICAgICAgICAgIGNhc2UgXCJib29sZWFuXCI6XHRcdHJldHVybiBcIkJvb2xlYW5cIjtcbiAgICAgICAgICBjYXNlIFwib2JqZWN0XCI6XHRcdHJldHVybiBcIk9iamVjdFwiO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gdHlwZS5yZXBsYWNlKC9cXC0vZywgXCJfXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBibGFja2xpc3Q6IFsgXCJJXCIgXVxuICB9LFxuXG5cblxuICAvLyBCb29sZWFuIGxpdGVyYWwsIGNyZWF0ZWQgd2l0aCBjdXN0b20gY29uc3RydWN0b3IgZm9yIGRlYnVnZ2luZy5cbiAgLy8gVE9ETzogYmV0dGVyIG5hbWUgZm9yIHRoaXM/Pz9cbiAge1xuICAgIG5hbWU6IFwiYm9vbGVhblwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBjYW5vbmljYWw6IFwiQm9vbGVhblwiLFxuICAgIHBhdHRlcm46IC9eKHRydWV8ZmFsc2V8eWVzfG5vfG9rfGNhbmNlbHxzdWNjZXNzfGZhaWx1cmUpJC8sXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIGJvb2xlYW4gZXh0ZW5kcyBSdWxlLlBhdHRlcm4ge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5tYXRjaGVkKSB7XG4gICAgICAgICAgY2FzZSBcInRydWVcIjpcbiAgICAgICAgICBjYXNlIFwieWVzXCI6XG4gICAgICAgICAgY2FzZSBcIm9rXCI6XG4gICAgICAgICAgY2FzZSBcInN1Y2Nlc3NcIjpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBgbnVtYmVyYCBhcyBlaXRoZXIgZmxvYXQgb3IgaW50ZWdlciwgY3JlYXRlZCB3aXRoIGN1c3RvbSBjb25zdHJ1Y3RvciBmb3IgZGVidWdnaW5nLlxuICAvLyBOT1RFOiB5b3UgY2FuIGFsc28gdXNlIGBvbmVgLi4uYHRlbmAgYXMgc3RyaW5ncy4nXG4gIC8vIFRPRE86ICBgaW50ZWdlcmAgYW5kIGBkZWNpbWFsYD8gIHRvbyB0ZWNoeT9cbiAge1xuICAgIG5hbWU6IFwibnVtYmVyXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIGNhbm9uaWNhbDogXCJOdW1iZXJcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgbnVtYmVyIGV4dGVuZHMgUnVsZSB7XG4gICAgICAvLyBTcGVjaWFsIHdvcmRzIHlvdSBjYW4gdXNlIGFzIG51bWJlcnMuLi5cbiAgICAgIHN0YXRpYyBOVU1CRVJfTkFNRVMgPSB7XG4gICAgICAgIHplcm86IDAsXG4gICAgICAgIG9uZTogMSxcbiAgICAgICAgdHdvOiAyLFxuICAgICAgICB0aHJlZTogMyxcbiAgICAgICAgZm91cjogNCxcbiAgICAgICAgZml2ZTogNSxcbiAgICAgICAgc2l4OiA2LFxuICAgICAgICBzZXZlbjogNyxcbiAgICAgICAgZWlnaHQ6IDgsXG4gICAgICAgIG5pbmU6IDksXG4gICAgICAgIHRlbjogMTBcbiAgICAgIH1cblxuICAgICAgLy8gTnVtYmVycyBnZXQgZW5jb2RlZCBhcyBudW1iZXJzIGluIHRoZSB0b2tlbiBzdHJlYW0uXG4gICAgICBwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwKSB7XG4gICAgICAgIGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG4gICAgICAgIC8vIGlmIGEgc3RyaW5nLCBhdHRlbXB0IHRvIHJ1biB0aHJvdWdoIG91ciBOVU1CRVJfTkFNRVNcbiAgICAgICAgaWYgKHR5cGVvZiB0b2tlbiA9PT0gXCJzdHJpbmdcIikgdG9rZW4gPSBSdWxlLk51bWJlci5OVU1CRVJfTkFNRVNbdG9rZW5dO1xuICAgICAgICBpZiAodHlwZW9mIHRva2VuICE9PSBcIm51bWJlclwiKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSh7XG4gICAgICAgICAgbWF0Y2hlZDogdG9rZW4sXG4gICAgICAgICAgbmV4dFN0YXJ0OiBzdGFydCArIDFcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgdG8gbnVtYmVyIG9uIHNvdXJjZSBvdXRwdXQuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0Y2hlZDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gTGl0ZXJhbCBgdGV4dGAgc3RyaW5nLCBjcmVhdGVkIHdpdGggY3VzdG9tIGNvbnN0cnVjdG9yIGZvciBkZWJ1Z2dpbmcuXG4gIC8vIFlvdSBjYW4gdXNlIGVpdGhlciBzaW5nbGUgb3IgZG91YmxlIHF1b3RlcyBvbiB0aGUgb3V0c2lkZSAoYWx0aG91Z2ggZG91YmxlIHF1b3RlcyBhcmUgcHJlZmVycmVkKS5cbiAgLy8gUmV0dXJuZWQgdmFsdWUgaGFzIGVuY2xvc2luZyBxdW90ZXMuXG4gIHtcbiAgICBuYW1lOiBcInRleHRcIixcbiAgICBhbGlhczogXCJleHByZXNzaW9uXCIsXG4gICAgY2Fub25pY2FsOiBcIlRleHRcIixcbiAgICBjb25zdHJ1Y3RvcjogY2xhc3MgdGV4dCBleHRlbmRzIFJ1bGUge1xuICAgICAgLy8gVGV4dCBzdHJpbmdzIGdldCBlbmNvZGVkIGFzIGB0ZXh0YCBvYmplY3RzIGluIHRoZSB0b2tlbiBzdHJlYW0uXG4gICAgICBwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwKSB7XG4gICAgICAgIGxldCB0b2tlbiA9IHRva2Vuc1tzdGFydF07XG4gICAgICAgIGlmICghKHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLlRleHQpKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSh7XG4gICAgICAgICAgbWF0Y2hlZDogdG9rZW4ucXVvdGVkU3RyaW5nLFxuICAgICAgICAgIG5leHRTdGFydDogc3RhcnQgKyAxXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB0b1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0Y2hlZDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gTGl0ZXJhbCBsaXN0IChhcnJheSksIGVnOiAgYFsxLDIgLCB0cnVlLGZhbHNlIF1gXG4gIHtcbiAgICBuYW1lOiBcImxpdGVyYWxfbGlzdFwiLFxuICAgIGFsaWFzOiBcImV4cHJlc3Npb25cIixcbiAgICBzeW50YXg6IFwiXFxcXFtbbGlzdDp7ZXhwcmVzc2lvbn0sXT9cXFxcXVwiLFxuICAgIGNvbnN0cnVjdG9yOiBjbGFzcyBsaXRlcmFsX2xpc3QgZXh0ZW5kcyBSdWxlLlNlcXVlbmNlIHtcbiAgICAgIHRvU291cmNlKCkge1xuICAgICAgICBsZXQgeyBsaXN0IH0gPSB0aGlzLnJlc3VsdHM7XG4gICAgICAgIHJldHVybiBgWyR7bGlzdCA/IGxpc3Quam9pbihcIiwgXCIpIDogXCJcIn1dYDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cblxuICAvLyBQYXJlbnRoZXNpemVkIGV4cHJlc3Npb25cbiAgLy9URVNUTUVcbiAge1xuICAgIG5hbWU6IFwicGFyZW50aGVzaXplZF9leHByZXNzaW9uXCIsXG4gICAgYWxpYXM6IFwiZXhwcmVzc2lvblwiLFxuICAgIHN5bnRheDogXCJcXFxcKHtleHByZXNzaW9ufVxcXFwpXCIsXG4gICAgY29uc3RydWN0b3I6IGNsYXNzIHBhcmVudGhlc2l6ZWRfZXhwcmVzc2lvbiBleHRlbmRzIFJ1bGUuU2VxdWVuY2Uge1xuICAgICAgdG9Tb3VyY2UoKSB7XG4gICAgICAgIGxldCB7IGV4cHJlc3Npb24gfSA9IHRoaXMucmVzdWx0cztcbiAgICAgICAgLy8gZG9uJ3QgZG91YmxlIHBhcmVucyBpZiBub3QgbmVjZXNzYXJ5XG4gICAgICAgIGlmICh0eXBlb2YgZXhwcmVzc2lvbiA9PT0gXCJzdHJpbmdcIiAmJiBleHByZXNzaW9uLnN0YXJ0c1dpdGgoXCIoXCIpICYmIGV4cHJlc3Npb24uZW5kc1dpdGgoXCIpXCIpKSByZXR1cm4gZXhwcmVzc2lvbjtcbiAgICAgICAgcmV0dXJuIFwiKFwiICsgZXhwcmVzc2lvbiArIFwiKVwiO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3J1bGVzL3NwZWxsL2NvcmUuanMiLCIvLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfSB9KS5hICE9IDc7XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzXG4vLyBtb2R1bGUgaWQgPSA3MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9faGFzLmpzXG4vLyBtb2R1bGUgaWQgPSA3M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4vX2llOC1kb20tZGVmaW5lJyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKTtcbnZhciBkUCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgYW5PYmplY3QoQXR0cmlidXRlcyk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gZFAoTywgUCwgQXR0cmlidXRlcyk7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKSB0aHJvdyBUeXBlRXJyb3IoJ0FjY2Vzc29ycyBub3Qgc3VwcG9ydGVkIScpO1xuICBpZiAoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKSBPW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcbiAgcmV0dXJuIE87XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fb2JqZWN0LWRwLmpzXG4vLyBtb2R1bGUgaWQgPSA3NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxMy1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0UHJvcFR5cGVzU2VjcmV0ID0gcmVxdWlyZSgnLi9saWIvUmVhY3RQcm9wVHlwZXNTZWNyZXQnKTtcblxuZnVuY3Rpb24gZW1wdHlGdW5jdGlvbigpIHt9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIHNoaW0ocHJvcHMsIHByb3BOYW1lLCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgcHJvcEZ1bGxOYW1lLCBzZWNyZXQpIHtcbiAgICBpZiAoc2VjcmV0ID09PSBSZWFjdFByb3BUeXBlc1NlY3JldCkge1xuICAgICAgLy8gSXQgaXMgc3RpbGwgc2FmZSB3aGVuIGNhbGxlZCBmcm9tIFJlYWN0LlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKFxuICAgICAgJ0NhbGxpbmcgUHJvcFR5cGVzIHZhbGlkYXRvcnMgZGlyZWN0bHkgaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgYHByb3AtdHlwZXNgIHBhY2thZ2UuICcgK1xuICAgICAgJ1VzZSBQcm9wVHlwZXMuY2hlY2tQcm9wVHlwZXMoKSB0byBjYWxsIHRoZW0uICcgK1xuICAgICAgJ1JlYWQgbW9yZSBhdCBodHRwOi8vZmIubWUvdXNlLWNoZWNrLXByb3AtdHlwZXMnXG4gICAgKTtcbiAgICBlcnIubmFtZSA9ICdJbnZhcmlhbnQgVmlvbGF0aW9uJztcbiAgICB0aHJvdyBlcnI7XG4gIH07XG4gIHNoaW0uaXNSZXF1aXJlZCA9IHNoaW07XG4gIGZ1bmN0aW9uIGdldFNoaW0oKSB7XG4gICAgcmV0dXJuIHNoaW07XG4gIH07XG4gIC8vIEltcG9ydGFudCFcbiAgLy8gS2VlcCB0aGlzIGxpc3QgaW4gc3luYyB3aXRoIHByb2R1Y3Rpb24gdmVyc2lvbiBpbiBgLi9mYWN0b3J5V2l0aFR5cGVDaGVja2Vycy5qc2AuXG4gIHZhciBSZWFjdFByb3BUeXBlcyA9IHtcbiAgICBhcnJheTogc2hpbSxcbiAgICBib29sOiBzaGltLFxuICAgIGZ1bmM6IHNoaW0sXG4gICAgbnVtYmVyOiBzaGltLFxuICAgIG9iamVjdDogc2hpbSxcbiAgICBzdHJpbmc6IHNoaW0sXG4gICAgc3ltYm9sOiBzaGltLFxuXG4gICAgYW55OiBzaGltLFxuICAgIGFycmF5T2Y6IGdldFNoaW0sXG4gICAgZWxlbWVudDogc2hpbSxcbiAgICBpbnN0YW5jZU9mOiBnZXRTaGltLFxuICAgIG5vZGU6IHNoaW0sXG4gICAgb2JqZWN0T2Y6IGdldFNoaW0sXG4gICAgb25lT2Y6IGdldFNoaW0sXG4gICAgb25lT2ZUeXBlOiBnZXRTaGltLFxuICAgIHNoYXBlOiBnZXRTaGltLFxuICAgIGV4YWN0OiBnZXRTaGltXG4gIH07XG5cbiAgUmVhY3RQcm9wVHlwZXMuY2hlY2tQcm9wVHlwZXMgPSBlbXB0eUZ1bmN0aW9uO1xuICBSZWFjdFByb3BUeXBlcy5Qcm9wVHlwZXMgPSBSZWFjdFByb3BUeXBlcztcblxuICByZXR1cm4gUmVhY3RQcm9wVHlwZXM7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3Byb3AtdHlwZXMvZmFjdG9yeVdpdGhUaHJvd2luZ1NoaW1zLmpzXG4vLyBtb2R1bGUgaWQgPSA3NzBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG4vKipcbiAqIEBtb2R1bGUgY29tcG9uZW50V3JhcHBlclxuICpcbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0ICogYXMgc3RvcmUgZnJvbSAnLi4vc3RvcmUnO1xuaW1wb3J0IHsgb25Nb3VudCwgb25Vbm1vdW50IH0gZnJvbSAnLi4vZXZlbnRfaGFuZGxlcnMnO1xuaW1wb3J0IHsgQUxMX0tFWVMgfSBmcm9tICcuLi9saWIva2V5cyc7XG5cbi8qKlxuICogY29tcG9uZW50V3JhcHBlclxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gV3JhcHBlZENvbXBvbmVudCBSZWFjdCBjb21wb25lbnQgY2xhc3MgdG8gYmUgd3JhcHBlZFxuICogQHBhcmFtIHthcnJheX0gW2tleXNdIFRoZSBrZXkocykgYm91bmQgdG8gdGhlIGNsYXNzXG4gKiBAcmV0dXJuIHtvYmplY3R9IFRoZSBoaWdoZXItb3JkZXIgZnVuY3Rpb24gdGhhdCB3cmFwcyB0aGUgZGVjb3JhdGVkIGNsYXNzXG4gKi9cbmZ1bmN0aW9uIGNvbXBvbmVudFdyYXBwZXIoV3JhcHBlZENvbXBvbmVudCkge1xuICB2YXIga2V5cyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogQUxMX0tFWVM7XG5cbiAgdmFyIEtleUJvYXJkSGVscGVyID0gZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoS2V5Qm9hcmRIZWxwZXIsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gS2V5Qm9hcmRIZWxwZXIocHJvcHMpIHtcbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBLZXlCb2FyZEhlbHBlcik7XG5cbiAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChLZXlCb2FyZEhlbHBlci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKEtleUJvYXJkSGVscGVyKSkuY2FsbCh0aGlzLCBwcm9wcykpO1xuXG4gICAgICBfdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgZXZlbnQ6IG51bGxcbiAgICAgIH07XG4gICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEtleUJvYXJkSGVscGVyLCBbe1xuICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBvbk1vdW50KHRoaXMpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgb25Vbm1vdW50KHRoaXMpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2hhbmRsZUtleURvd24nLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZUtleURvd24oZXZlbnQpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgLy8gdG8gc2ltdWxhdGUgYSBrZXlwcmVzcywgc2V0IHRoZSBldmVudCBhbmQgdGhlbiBjbGVhciBpdCBpbiB0aGUgY2FsbGJhY2tcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGV2ZW50OiBldmVudCB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzMi5zZXRTdGF0ZSh7IGV2ZW50OiBudWxsIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoV3JhcHBlZENvbXBvbmVudCwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHsga2V5ZG93bjogdGhpcy5zdGF0ZSB9KSk7XG4gICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEtleUJvYXJkSGVscGVyO1xuICB9KFJlYWN0LkNvbXBvbmVudCk7XG5cbiAgc3RvcmUuc2V0QmluZGluZyh7IGtleXM6IFtdLmNvbmNhdChrZXlzKSwgZm46IEtleUJvYXJkSGVscGVyLnByb3RvdHlwZS5oYW5kbGVLZXlEb3duLCB0YXJnZXQ6IEtleUJvYXJkSGVscGVyLnByb3RvdHlwZSB9KTtcblxuICByZXR1cm4gS2V5Qm9hcmRIZWxwZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbXBvbmVudFdyYXBwZXI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvZGVjb3JhdG9ycy9jbGFzc19kZWNvcmF0b3IuanNcbi8vIG1vZHVsZSBpZCA9IDg0MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbi8qKlxuICogQG1vZHVsZSBkZWNvcmF0b3JzXG4gKlxuICovXG5pbXBvcnQgY2xhc3NXcmFwcGVyIGZyb20gJy4vY2xhc3NfZGVjb3JhdG9yJztcbmltcG9ydCBtZXRob2RXcmFwcGVyIGZyb20gJy4vbWV0aG9kX2RlY29yYXRvcic7XG5pbXBvcnQgbWV0aG9kV3JhcHBlclNjb3BlZCBmcm9tICcuL21ldGhvZF9kZWNvcmF0b3Jfc2NvcGVkJztcblxuLyoqXG4gKiBub29wRGVjb3JhdG9yXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9IFJldHVybnMgYHVuZGVmaW5lZGAgc28gdGhhdCB0aGUgb3JpZ2luYWwgdW5kZWNvcmF0ZWQgaW5zdGFuY2UvbWV0aG9kIGlzIHVzZWRcbiAqL1xuZnVuY3Rpb24gbm9vcERlY29yYXRvcigpIHtcbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBfZGVjb3JhdG9yXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtZXRob2RGbiBUaGUgbWV0aG9kIHdyYXBwZXIgdG8gZGVsZWdhdGUgdG8sIGJhc2VkIG9uIHdoZXRoZXIgdXNlciBoYXMgc3BlY2lmaWVkIGEgc2NvcGVkIGRlY29yYXRvciBvciBub3RcbiAqIEBwYXJhbSB7QXJyYXl9IC4uLmFyZ3MgUmVtYWluZGVyIG9mIGFyZ3VtZW50cyBwYXNzZWQgaW5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgZGVjb3JhdGVkIGNsYXNzIG9yIG1ldGhvZFxuICovXG5mdW5jdGlvbiBfZGVjb3JhdG9yKG1ldGhvZEZuKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgLy8gY2hlY2sgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHNlZSBpZiBpdCdzIGEgdXNlci1zdXBwbGllZCBrZXljb2RlIG9yIGFycmF5XG4gIC8vIG9mIGtleWNvZGVzLCBvciBpZiBpdCdzIHRoZSB3cmFwcGVkIGNsYXNzIG9yIG1ldGhvZFxuICB2YXIgdGVzdEFyZyA9IGFyZ3NbMF07XG4gIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSh0ZXN0QXJnKTtcblxuICAvLyBpZiB0aGUgdGVzdCBhcmd1bWVudCBpcyBub3QgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uLCBpdCBpcyB1c2VyLXN1cHBsaWVkXG4gIC8vIGtleWNvZGVzLiBlbHNlIHRoZXJlIGFyZSBubyBhcmd1bWVudHMgYW5kIGl0J3MganVzdCB0aGUgd3JhcHBlZCBjbGFzc1xuICBpZiAoaXNBcnJheSB8fCB+WydzdHJpbmcnLCAnbnVtYmVyJywgJ3N5bWJvbCddLmluZGV4T2YodHlwZW9mIHRlc3RBcmcgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKHRlc3RBcmcpKSkge1xuICAgIHZhciBrZXlzID0gaXNBcnJheSA/IHRlc3RBcmcgOiBhcmdzO1xuXG4gICAgLy8gcmV0dXJuIHRoZSBkZWNvcmF0b3IgZnVuY3Rpb24sIHdoaWNoIG9uIHRoZSBuZXh0IGNhbGwgd2lsbCBsb29rIGZvclxuICAgIC8vIHRoZSBwcmVzZW5jZSBvZiBhIG1ldGhvZCBuYW1lIHRvIGRldGVybWluZSBpZiB0aGlzIGlzIGEgd3JhcHBlZCBtZXRob2RcbiAgICAvLyBvciBjb21wb25lbnRcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgbWV0aG9kTmFtZSwgZGVzY3JpcHRvcikge1xuICAgICAgcmV0dXJuIG1ldGhvZE5hbWUgPyBtZXRob2RGbih7IHRhcmdldDogdGFyZ2V0LCBkZXNjcmlwdG9yOiBkZXNjcmlwdG9yLCBrZXlzOiBrZXlzIH0pIDogY2xhc3NXcmFwcGVyKHRhcmdldCwga2V5cyk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgV3JhcHBlZENvbXBvbmVudCA9IGFyZ3NbMF07XG4gICAgdmFyIG1ldGhvZE5hbWUgPSBhcmdzWzFdO1xuXG4gICAgLy8gbWV0aG9kIGRlY29yYXRvcnMgd2l0aG91dCBrZXljb2RlICh3aGljaCkgYXJndW1lbnRzIGFyZSBub3QgYWxsb3dlZC5cbiAgICBpZiAoV3JhcHBlZENvbXBvbmVudCAmJiAhbWV0aG9kTmFtZSkge1xuICAgICAgcmV0dXJuIGNsYXNzV3JhcHBlci5hcHBseSh1bmRlZmluZWQsIGFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4obWV0aG9kTmFtZSArICc6IE1ldGhvZCBkZWNvcmF0b3JzIG11c3QgaGF2ZSBrZXljb2RlIGFyZ3VtZW50cywgc28gdGhlIGRlY29yYXRvciBmb3IgdGhpcyBtZXRob2Qgd2lsbCBub3QgZG8gYW55dGhpbmcnKTtcbiAgICAgIHJldHVybiBub29wRGVjb3JhdG9yO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIGtleWRvd25TY29wZWRcbiAqXG4gKiBNZXRob2QgZGVjb3JhdG9yIHRoYXQgd2lsbCBsb29rIGZvciBjaGFuZ2VzIHRvIGl0cyB0YXJnZXRlZCBjb21wb25lbnQnc1xuICogYGtleWRvd25gIHByb3BzIHRvIGRlY2lkZSB3aGVuIHRvIHRyaWdnZXIsIHJhdGhlciB0aGFuIHJlc3BvbmRpbmcgZGlyZWN0bHlcbiAqIHRvIGtleWRvd24gZXZlbnRzLiBUaGlzIGxldHMgeW91IHNwZWNpZnkgYSBAa2V5ZG93biBkZWNvcmF0ZWQgY2xhc3MgaGlnaGVyXG4gKiB1cCBpbiB0aGUgdmlldyBoaWVyYXJjaHkgZm9yIGxhcmdlciBzY29waW5nIG9mIGtleWRvd24gZXZlbnRzLCBvciBmb3JcbiAqIHByb2dyYW1tYXRpY2FsbHkgc2VuZGluZyBrZXlkb3duIGV2ZW50cyBhcyBwcm9wcyBpbnRvIHRoZSBjb21wb25lbnRzIGluIG9yZGVyXG4gKiB0byB0cmlnZ2VyIGRlY29yYXRlZCBtZXRob2RzIHdpdGggbWF0Y2hpbmcga2V5cy5cbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtBcnJheX0gLi4uYXJncyAgQWxsIChvciBubykgYXJndW1lbnRzIHBhc3NlZCBpbiBmcm9tIGRlY29yYXRpb25cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgZGVjb3JhdGVkIGNsYXNzIG9yIG1ldGhvZFxuICovXG5mdW5jdGlvbiBrZXlkb3duU2NvcGVkKCkge1xuICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuMiksIF9rZXkyID0gMDsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgIGFyZ3NbX2tleTJdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgfVxuXG4gIHJldHVybiBfZGVjb3JhdG9yLmFwcGx5KHVuZGVmaW5lZCwgW21ldGhvZFdyYXBwZXJTY29wZWRdLmNvbmNhdChhcmdzKSk7XG59XG5cbi8qKlxuICoga2V5ZG93blxuICpcbiAqIFRoZSBtYWluIGRlY29yYXRvciBhbmQgZGVmYXVsdCBleHBvcnQsIGhhbmRsZXMgYm90aCBjbGFzc2VzIGFuZCBtZXRob2RzLlxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge0FycmF5fSAuLi5hcmdzICBBbGwgKG9yIG5vKSBhcmd1bWVudHMgcGFzc2VkIGluIGZyb20gZGVjb3JhdGlvblxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBkZWNvcmF0ZWQgY2xhc3Mgb3IgbWV0aG9kXG4gKi9cbmZ1bmN0aW9uIGtleWRvd24oKSB7XG4gIGZvciAodmFyIF9sZW4zID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4zKSwgX2tleTMgPSAwOyBfa2V5MyA8IF9sZW4zOyBfa2V5MysrKSB7XG4gICAgYXJnc1tfa2V5M10gPSBhcmd1bWVudHNbX2tleTNdO1xuICB9XG5cbiAgcmV0dXJuIF9kZWNvcmF0b3IuYXBwbHkodW5kZWZpbmVkLCBbbWV0aG9kV3JhcHBlcl0uY29uY2F0KGFyZ3MpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQga2V5ZG93bjtcblxuZXhwb3J0IHsga2V5ZG93blNjb3BlZCB9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDg0MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbi8qKlxuICogQG1vZHVsZSBtZXRob2RXcmFwcGVyXG4gKlxuICovXG5pbXBvcnQgKiBhcyBzdG9yZSBmcm9tICcuLi9zdG9yZSc7XG5pbXBvcnQgeyBvbk1vdW50LCBvblVubW91bnQsIF9vbktleURvd24gfSBmcm9tICcuLi9ldmVudF9oYW5kbGVycyc7XG5cbi8qKlxuICogX2lzUmVhY3RLZXlEb3duXG4gKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgVGhlIHBvc3NpYmx5IHN5bnRoZXRpYyBldmVudCBwYXNzZWQgYXMgYW4gYXJndW1lbnQgd2l0aFxuICogdGhlIG1ldGhvZCBpbnZvY2F0aW9uLlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gX2lzUmVhY3RLZXlEb3duKGV2ZW50KSB7XG4gIHJldHVybiBldmVudCAmJiAodHlwZW9mIGV2ZW50ID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihldmVudCkpID09PSAnb2JqZWN0JyAmJiBldmVudC5uYXRpdmVFdmVudCBpbnN0YW5jZW9mIHdpbmRvdy5LZXlib2FyZEV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICdrZXlkb3duJztcbn1cblxuLyoqXG4gKiBtZXRob2RXcmFwcGVyXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzIEFsbCBhcmd1bWVudHMgbmVjZXNzYXJ5IGZvciB3cmFwcGluZyBtZXRob2RcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzLnRhcmdldCBUaGUgZGVjb3JhdGVkIGNsYXNzXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncy5kZXNjcmlwdG9yIE1ldGhvZCBkZXNjcmlwdG9yXG4gKiBAcGFyYW0ge2FycmF5fSBhcmdzLmtleXMgVGhlIGFycmF5IG9mIGtleXMgYm91bmQgdG8gdGhlIGdpdmVuIG1ldGhvZFxuICogQHJldHVybiB7b2JqZWN0fSBUaGUgbWV0aG9kIGRlc2NyaXB0b3JcbiAqL1xuZnVuY3Rpb24gbWV0aG9kV3JhcHBlcihfcmVmKSB7XG4gIHZhciB0YXJnZXQgPSBfcmVmLnRhcmdldCxcbiAgICAgIGRlc2NyaXB0b3IgPSBfcmVmLmRlc2NyaXB0b3IsXG4gICAgICBrZXlzID0gX3JlZi5rZXlzO1xuXG5cbiAgdmFyIGZuID0gZGVzY3JpcHRvci52YWx1ZTtcblxuICAvLyBpZiB3ZSBoYXZlbid0IGFscmVhZHkgY3JlYXRlZCBhIGJpbmRpbmcgZm9yIHRoaXMgY2xhc3MgKHZpYSBhbm90aGVyXG4gIC8vIGRlY29yYXRlZCBtZXRob2QpLCB3cmFwIHRoZXNlIGxpZmVjeWNsZSBtZXRob2RzLlxuICBpZiAoIXN0b3JlLmdldEJpbmRpbmcodGFyZ2V0KSkge1xuICAgIHZhciBjb21wb25lbnREaWRNb3VudCA9IHRhcmdldC5jb21wb25lbnREaWRNb3VudCxcbiAgICAgICAgY29tcG9uZW50V2lsbFVubW91bnQgPSB0YXJnZXQuY29tcG9uZW50V2lsbFVubW91bnQ7XG5cblxuICAgIHRhcmdldC5jb21wb25lbnREaWRNb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIG9uTW91bnQodGhpcyk7XG4gICAgICBpZiAoY29tcG9uZW50RGlkTW91bnQpIHJldHVybiBjb21wb25lbnREaWRNb3VudC5jYWxsKHRoaXMpO1xuICAgIH07XG5cbiAgICB0YXJnZXQuY29tcG9uZW50V2lsbFVubW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBvblVubW91bnQodGhpcyk7XG4gICAgICBpZiAoY29tcG9uZW50V2lsbFVubW91bnQpIHJldHVybiBjb21wb25lbnRXaWxsVW5tb3VudC5jYWxsKHRoaXMpO1xuICAgIH07XG4gIH1cblxuICAvLyBhZGQgdGhpcyBiaW5kaW5nIG9mIGtleXMgYW5kIG1ldGhvZCB0byB0aGUgdGFyZ2V0J3MgYmluZGluZ3NcbiAgc3RvcmUuc2V0QmluZGluZyh7IGtleXM6IGtleXMsIHRhcmdldDogdGFyZ2V0LCBmbjogZm4gfSk7XG5cbiAgZGVzY3JpcHRvci52YWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICB2YXIgbWF5YmVFdmVudCA9IGFyZ3NbMF07XG5cbiAgICBpZiAoX2lzUmVhY3RLZXlEb3duKG1heWJlRXZlbnQpKSB7XG4gICAgICAvLyBwcm94eSBtZXRob2QgaW4gb3JkZXIgdG8gdXNlIEBrZXlkb3duIGFzIGZpbHRlciBmb3Iga2V5ZG93biBldmVudHMgY29taW5nXG4gICAgICAvLyBmcm9tIGFuIGFjdHVhbCBvbktleURvd24gYmluZGluZyAoYXMgaWRlbnRpZmllZCBieSByZWFjdCdzIGFkZGl0aW9uIG9mXG4gICAgICAvLyAnbmF0aXZlRXZlbnQnICsgdHlwZSA9PT0gJ2tleWRvd24nKVxuICAgICAgaWYgKCFtYXliZUV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgLy8gd2UgYWxyZWFkeSB3aGl0ZWxpc3Qgc2hvcnRjdXRzIHdpdGggY3RybCBtb2RpZmllcnMgc28gaWYgd2Ugd2VyZSB0b1xuICAgICAgICAvLyBmaXJlIGl0IGFnYWluIGhlcmUgdGhlIG1ldGhvZCB3b3VsZCB0cmlnZ2VyIHR3aWNlLiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2dsb3J0aG8vcmVhY3Qta2V5ZG93bi9pc3N1ZXMvMzhcbiAgICAgICAgcmV0dXJuIF9vbktleURvd24obWF5YmVFdmVudCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghbWF5YmVFdmVudCB8fCAhKG1heWJlRXZlbnQgaW5zdGFuY2VvZiB3aW5kb3cuS2V5Ym9hcmRFdmVudCkgfHwgbWF5YmVFdmVudC50eXBlICE9PSAna2V5ZG93bicpIHtcbiAgICAgIC8vIGlmIG91ciBmaXJzdCBhcmd1bWVudCBpcyBhIGtleWRvd24gZXZlbnQgaXQgaXMgYmVpbmcgaGFuZGxlZCBieSBvdXJcbiAgICAgIC8vIGJpbmRpbmcgc3lzdGVtLiBpZiBpdCdzIGFueXRoaW5nIGVsc2UsIGp1c3QgcGFzcyB0aHJvdWdoLlxuICAgICAgcmV0dXJuIGZuLmNhbGwuYXBwbHkoZm4sIFt0aGlzXS5jb25jYXQoYXJncykpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZGVzY3JpcHRvcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWV0aG9kV3JhcHBlcjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9kZWNvcmF0b3JzL21ldGhvZF9kZWNvcmF0b3IuanNcbi8vIG1vZHVsZSBpZCA9IDg0M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEBtb2R1bGUgbWV0aG9kV3JhcHBlclNjb3BlZFxuICpcbiAqL1xuaW1wb3J0IG1hdGNoS2V5cyBmcm9tICcuLi9saWIvbWF0Y2hfa2V5cyc7XG5pbXBvcnQgcGFyc2VLZXlzIGZyb20gJy4uL2xpYi9wYXJzZV9rZXlzJztcblxuLyoqXG4gKiBtZXRob2RXcmFwcGVyU2NvcGVkXG4gKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzIEFsbCBhcmdzIG5lY2Vzc2FyeSBmb3IgZGVjb3JhdGluZyB0aGUgbWV0aG9kXG4gKiBAcGFyYW0ge29iamVjdH0gYXJncy50YXJnZXQgVGhlIGRlY29yYXRlZCBtZXRob2QncyBjbGFzcyBvYmplY3RcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzLmRlc2NyaXB0b3IgVGhlIG1ldGhvZCdzIGRlc2NyaXB0b3Igb2JqZWN0XG4gKiBAcGFyYW0ge2FycmF5fSBhcmdzLmtleXMgVGhlIGtleSBjb2RlcyBib3VuZCB0byB0aGUgZGVjb3JhdGVkIG1ldGhvZFxuICogQHJldHVybiB7b2JqZWN0fSBUaGUgbWV0aG9kJ3MgZGVzY3JpcHRvciBvYmplY3RcbiAqL1xuZnVuY3Rpb24gbWV0aG9kV3JhcHBlclNjb3BlZChfcmVmKSB7XG4gIHZhciB0YXJnZXQgPSBfcmVmLnRhcmdldCxcbiAgICAgIGRlc2NyaXB0b3IgPSBfcmVmLmRlc2NyaXB0b3IsXG4gICAgICBrZXlzID0gX3JlZi5rZXlzO1xuICB2YXIgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IHRhcmdldC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzO1xuXG4gIHZhciBmbiA9IGRlc2NyaXB0b3IudmFsdWU7XG4gIGlmICgha2V5cykge1xuICAgIGNvbnNvbGUud2FybihmbiArICc6IGtleWRvd25TY29wZWQgcmVxdWlyZXMgb25lIG9yIG1vcmUga2V5cycpO1xuICB9IGVsc2Uge1xuXG4gICAgLyoqXG4gICAgICogX3Nob3VsZFRyaWdnZXJcbiAgICAgKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGlzUHJvcHMgRXhzdGluZyBwcm9wcyBmcm9tIHRoZSB3cmFwcGVkIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0aGlzUHJvcHMua2V5ZG93biBUaGUgbmFtZXNwYWNlZCBzdGF0ZSBmcm9tIHRoZSBoaWdoZXItb3JkZXJcbiAgICAgKiBjb21wb25lbnQgKGNsYXNzX2RlY29yYXRvcilcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbmV4dFByb3BzIFRoZSBpbmNvbWluZyBwcm9wcyBmcm9tIHRoZSB3cmFwcGVkIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBuZXh0UHJvcHMua2V5ZG93biBUaGUgbmFtZXNjYXBlZCBzdGF0ZSBmcm9tIHRoZSBoaWdoZXItb3JkZXJcbiAgICAgKiBjb21wb25lbnQgKGNsYXNzX2RlY29yYXRvcilcbiAgICAgKiBAcGFyYW0ge2FycmF5fSBrZXlzIFRoZSBrZXlzIGJvdW5kIHRvIHRoZSBkZWNvcmF0ZWQgbWV0aG9kXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciBhbGwgdGVzdHMgaGF2ZSBwYXNzZWRcbiAgICAgKi9cbiAgICB2YXIgX3Nob3VsZFRyaWdnZXIgPSBmdW5jdGlvbiBfc2hvdWxkVHJpZ2dlcihrZXlkb3duVGhpcywga2V5ZG93bk5leHQpIHtcbiAgICAgIGlmICghKGtleWRvd25OZXh0ICYmIGtleWRvd25OZXh0LmV2ZW50ICYmICFrZXlkb3duVGhpcy5ldmVudCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgcmV0dXJuIGtleVNldHMuc29tZShmdW5jdGlvbiAoa2V5U2V0KSB7XG4gICAgICAgIHJldHVybiBtYXRjaEtleXMoeyBrZXlTZXQ6IGtleVNldCwgZXZlbnQ6IGtleWRvd25OZXh0LmV2ZW50IH0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIHdyYXAgdGhlIGNvbXBvbmVudCdzIGxpZmVjeWNsZSBtZXRob2QgdG8gaW50ZXJjZXB0IGtleSBjb2RlcyBjb21pbmcgZG93blxuICAgIC8vIGZyb20gdGhlIHdyYXBwZWQvc2NvcGVkIGNvbXBvbmVudCB1cCB0aGUgdmlldyBoaWVyYXJjaHkuIGlmIG5ldyBrZXlkb3duXG4gICAgLy8gZXZlbnQgaGFzIGFycml2ZWQgYW5kIHRoZSBrZXkgY29kZXMgbWF0Y2ggd2hhdCB3YXMgc3BlY2lmaWVkIGluIHRoZVxuICAgIC8vIGRlY29yYXRvciwgY2FsbCB0aGUgd3JhcHBlZCBtZXRob2QuXG5cblxuICAgIHZhciBrZXlTZXRzID0gcGFyc2VLZXlzKGtleXMpO3RhcmdldC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzID0gZnVuY3Rpb24gKG5leHRQcm9wcykge1xuICAgICAgdmFyIGtleWRvd25OZXh0ID0gbmV4dFByb3BzLmtleWRvd247XG4gICAgICB2YXIga2V5ZG93blRoaXMgPSB0aGlzLnByb3BzLmtleWRvd247XG5cblxuICAgICAgaWYgKF9zaG91bGRUcmlnZ2VyKGtleWRvd25UaGlzLCBrZXlkb3duTmV4dCkpIHtcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywga2V5ZG93bk5leHQuZXZlbnQpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgYXJnc1tfa2V5IC0gMV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIGlmIChjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKSByZXR1cm4gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcy5jYWxsLmFwcGx5KGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMsIFt0aGlzLCBuZXh0UHJvcHNdLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBkZXNjcmlwdG9yO1xufVxuXG5leHBvcnQgZGVmYXVsdCBtZXRob2RXcmFwcGVyU2NvcGVkO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2RlY29yYXRvcnMvbWV0aG9kX2RlY29yYXRvcl9zY29wZWQuanNcbi8vIG1vZHVsZSBpZCA9IDg0NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBwb2x5ZmlsbCBhcnJheS5mcm9tIChtYWlubHkgZm9yIElFKVxuaW1wb3J0ICcuL2xpYi9hcnJheS5mcm9tJztcblxuLy8gQGtleWRvd24gYW5kIEBrZXlkb3duU2NvcGVkXG5leHBvcnQgeyBkZWZhdWx0LCBrZXlkb3duU2NvcGVkIH0gZnJvbSAnLi9kZWNvcmF0b3JzJztcblxuLy8gc2V0QmluZGluZyAtIG9ubHkgdXNlZnVsIGlmIHlvdSdyZSBub3QgZ29pbmcgdG8gdXNlIGRlY29yYXRvcnNcbmV4cG9ydCB7IHNldEJpbmRpbmcgfSBmcm9tICcuL3N0b3JlJztcblxuLy8gS2V5cyAtIHVzZSB0aGlzIHRvIGZpbmQga2V5IGNvZGVzIGZvciBzdHJpbmdzLiBmb3IgZXhhbXBsZTogS2V5cy5qLCBLZXlzLmVudGVyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEtleXMsIEFMTF9LRVlTLCBBTExfUFJJTlRBQkxFX0tFWVMgfSBmcm9tICcuL2xpYi9rZXlzJztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcmVhY3Qta2V5ZG93bi9lcy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gODQ1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIFByb2R1Y3Rpb24gc3RlcHMgb2YgRUNNQS0yNjIsIEVkaXRpb24gNiwgMjIuMS4yLjFcbi8vIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9mcm9tXG5pZiAoIUFycmF5LmZyb20pIHtcbiAgQXJyYXkuZnJvbSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuICAgIHZhciBpc0NhbGxhYmxlID0gZnVuY3Rpb24gaXNDYWxsYWJsZShmbikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJyB8fCB0b1N0ci5jYWxsKGZuKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgICB9O1xuICAgIHZhciB0b0ludGVnZXIgPSBmdW5jdGlvbiB0b0ludGVnZXIodmFsdWUpIHtcbiAgICAgIHZhciBudW1iZXIgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgaWYgKGlzTmFOKG51bWJlcikpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgICBpZiAobnVtYmVyID09PSAwIHx8ICFpc0Zpbml0ZShudW1iZXIpKSB7XG4gICAgICAgIHJldHVybiBudW1iZXI7XG4gICAgICB9XG4gICAgICByZXR1cm4gKG51bWJlciA+IDAgPyAxIDogLTEpICogTWF0aC5mbG9vcihNYXRoLmFicyhudW1iZXIpKTtcbiAgICB9O1xuICAgIHZhciBtYXhTYWZlSW50ZWdlciA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gICAgdmFyIHRvTGVuZ3RoID0gZnVuY3Rpb24gdG9MZW5ndGgodmFsdWUpIHtcbiAgICAgIHZhciBsZW4gPSB0b0ludGVnZXIodmFsdWUpO1xuICAgICAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KGxlbiwgMCksIG1heFNhZmVJbnRlZ2VyKTtcbiAgICB9O1xuXG4gICAgLy8gVGhlIGxlbmd0aCBwcm9wZXJ0eSBvZiB0aGUgZnJvbSBtZXRob2QgaXMgMS5cbiAgICByZXR1cm4gZnVuY3Rpb24gZnJvbShhcnJheUxpa2UgLyosIG1hcEZuLCB0aGlzQXJnICovKSB7XG4gICAgICAvLyAxLiBMZXQgQyBiZSB0aGUgdGhpcyB2YWx1ZS5cbiAgICAgIHZhciBDID0gdGhpcztcblxuICAgICAgLy8gMi4gTGV0IGl0ZW1zIGJlIFRvT2JqZWN0KGFycmF5TGlrZSkuXG4gICAgICB2YXIgaXRlbXMgPSBPYmplY3QoYXJyYXlMaWtlKTtcblxuICAgICAgLy8gMy4gUmV0dXJuSWZBYnJ1cHQoaXRlbXMpLlxuICAgICAgaWYgKGFycmF5TGlrZSA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcnJheS5mcm9tIHJlcXVpcmVzIGFuIGFycmF5LWxpa2Ugb2JqZWN0IC0gbm90IG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgfVxuXG4gICAgICAvLyA0LiBJZiBtYXBmbiBpcyB1bmRlZmluZWQsIHRoZW4gbGV0IG1hcHBpbmcgYmUgZmFsc2UuXG4gICAgICB2YXIgbWFwRm4gPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHZvaWQgdW5kZWZpbmVkO1xuICAgICAgdmFyIFQ7XG4gICAgICBpZiAodHlwZW9mIG1hcEZuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAvLyA1LiBlbHNlXG4gICAgICAgIC8vIDUuIGEgSWYgSXNDYWxsYWJsZShtYXBmbikgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgICAgaWYgKCFpc0NhbGxhYmxlKG1hcEZuKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FycmF5LmZyb206IHdoZW4gcHJvdmlkZWQsIHRoZSBzZWNvbmQgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyA1LiBiLiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVCBiZSB1bmRlZmluZWQuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgICAgICAgIFQgPSBhcmd1bWVudHNbMl07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gMTAuIExldCBsZW5WYWx1ZSBiZSBHZXQoaXRlbXMsIFwibGVuZ3RoXCIpLlxuICAgICAgLy8gMTEuIExldCBsZW4gYmUgVG9MZW5ndGgobGVuVmFsdWUpLlxuICAgICAgdmFyIGxlbiA9IHRvTGVuZ3RoKGl0ZW1zLmxlbmd0aCk7XG5cbiAgICAgIC8vIDEzLiBJZiBJc0NvbnN0cnVjdG9yKEMpIGlzIHRydWUsIHRoZW5cbiAgICAgIC8vIDEzLiBhLiBMZXQgQSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbQ29uc3RydWN0XV0gaW50ZXJuYWwgbWV0aG9kIFxuICAgICAgLy8gb2YgQyB3aXRoIGFuIGFyZ3VtZW50IGxpc3QgY29udGFpbmluZyB0aGUgc2luZ2xlIGl0ZW0gbGVuLlxuICAgICAgLy8gMTQuIGEuIEVsc2UsIExldCBBIGJlIEFycmF5Q3JlYXRlKGxlbikuXG4gICAgICB2YXIgQSA9IGlzQ2FsbGFibGUoQykgPyBPYmplY3QobmV3IEMobGVuKSkgOiBuZXcgQXJyYXkobGVuKTtcblxuICAgICAgLy8gMTYuIExldCBrIGJlIDAuXG4gICAgICB2YXIgayA9IDA7XG4gICAgICAvLyAxNy4gUmVwZWF0LCB3aGlsZSBrIDwgbGVu4oCmIChhbHNvIHN0ZXBzIGEgLSBoKVxuICAgICAgdmFyIGtWYWx1ZTtcbiAgICAgIHdoaWxlIChrIDwgbGVuKSB7XG4gICAgICAgIGtWYWx1ZSA9IGl0ZW1zW2tdO1xuICAgICAgICBpZiAobWFwRm4pIHtcbiAgICAgICAgICBBW2tdID0gdHlwZW9mIFQgPT09ICd1bmRlZmluZWQnID8gbWFwRm4oa1ZhbHVlLCBrKSA6IG1hcEZuLmNhbGwoVCwga1ZhbHVlLCBrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBBW2tdID0ga1ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGsgKz0gMTtcbiAgICAgIH1cbiAgICAgIC8vIDE4LiBMZXQgcHV0U3RhdHVzIGJlIFB1dChBLCBcImxlbmd0aFwiLCBsZW4sIHRydWUpLlxuICAgICAgQS5sZW5ndGggPSBsZW47XG4gICAgICAvLyAyMC4gUmV0dXJuIEEuXG4gICAgICByZXR1cm4gQTtcbiAgICB9O1xuICB9KCk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL2FycmF5LmZyb20uanNcbi8vIG1vZHVsZSBpZCA9IDg0NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEBtb2R1bGUgZG9tSGVscGVyc1xuICpcbiAqL1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5cbnZhciBmb2N1c2FibGVTZWxlY3RvciA9ICdhW2hyZWZdLCBidXR0b24sIGlucHV0LCBvYmplY3QsIHNlbGVjdCwgdGV4dGFyZWEsIFt0YWJpbmRleF0nO1xuXG4vKipcbiAqIGJpbmRGb2N1c2FibGVzOiBGaW5kIGFueSBmb2N1c2FibGUgY2hpbGQgZWxlbWVudHMgb2YgdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhbmRcbiAqIGFkZCBhbiBvbkZvY3VzIGhhbmRsZXIgdG8gZm9jdXMgb3VyIGtleWRvd24gaGFuZGxlcnMgb24gdGhlIHBhcmVudCBjb21wb25lbnRcbiAqIHdoZW4gdXNlciBrZXlzIGFwcGxpZXMgZm9jdXMgdG8gdGhlIGVsZW1lbnQuXG4gKlxuICogTk9URTogT25lIGxpbWl0YXRpb24gb2YgdGhpcyByaWdodCBub3cgaXMgdGhhdCBpZiB5b3UgdGFiIG91dCBvZiB0aGVcbiAqIGNvbXBvbmVudCwgX2ZvY3VzZWRJbnN0YW5jZSB3aWxsIHN0aWxsIGJlIHNldCB1bnRpbCBuZXh0IGNsaWNrIG9yIG1vdW50IG9yXG4gKiBjb250cm9sbGVkIGZvY3VzLlxuICpcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAcGFyYW0ge29iamVjdH0gaW5zdGFuY2UgVGhlIGtleS1ib3VuZCBjb21wb25lbnQgaW5zdGFuY2VcbiAqIEBwYXJhbSB7Y2FsbGJhY2t9IGFjdGl2YXRlT25Gb2N1cyBUaGUgZm4gdG8gZmlyZSB3aGVuIGVsZW1lbnQgaXMgZm9jdXNlZFxuICovXG5mdW5jdGlvbiBiaW5kRm9jdXNhYmxlcyhpbnN0YW5jZSwgYWN0aXZhdGVPbkZvY3VzKSB7XG4gIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBub2RlID0gUmVhY3RET00uZmluZERPTU5vZGUoaW5zdGFuY2UpO1xuICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgdmFyIGZvY3VzYWJsZXMgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoZm9jdXNhYmxlU2VsZWN0b3IpO1xuICAgICAgICBpZiAoZm9jdXNhYmxlcy5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgb25Gb2N1cyA9IGZ1bmN0aW9uIG9uRm9jdXMoZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIG9uRm9jdXNQcmV2ID0gZWxlbWVudC5vbmZvY3VzO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICBhY3RpdmF0ZU9uRm9jdXMoaW5zdGFuY2UpO1xuICAgICAgICAgICAgICBpZiAob25Gb2N1c1ByZXYpIG9uRm9jdXNQcmV2LmNhbGwoZWxlbWVudCwgZXZlbnQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZvY3VzYWJsZXMpLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50Lm9uZm9jdXMgPSBvbkZvY3VzKGVsZW1lbnQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIG5vb3AsIG1vc3RseSBzdXBwcmVzc2luZyBlcnJvciBoZXJlIGh0dHBzOi8vZ2l0aHViLmNvbS9nbG9ydGhvL3JlYWN0LWtleWRvd24vaXNzdWVzLzc2XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogZmluZENvbnRhaW5lck5vZGVzOiBDYWxsZWQgYnkgb3VyIGNsaWNrIGhhbmRsZXIgdG8gZmluZCBpbnN0YW5jZXMgd2l0aCBub2Rlc1xuICogdGhhdCBhcmUgZXF1YWwgdG8gb3IgdGhhdCBjb250YWluIHRoZSBjbGljayB0YXJnZXQuIEFueSB0aGF0IHBhc3MgdGhpcyB0ZXN0XG4gKiB3aWxsIGJlIHJlY2lwaWVudHMgb2YgdGhlIG5leHQga2V5ZG93biBldmVudC5cbiAqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCBUaGUgY2xpY2sgZXZlbnQudGFyZ2V0IERPTSBlbGVtZW50XG4gKiBAcmV0dXJuIHtmdW5jdGlvbn0gUmVkdWNlciBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBmaW5kQ29udGFpbmVyTm9kZXModGFyZ2V0KSB7XG4gIHJldHVybiBmdW5jdGlvbiAobWVtbywgaW5zdGFuY2UpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIG5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZShpbnN0YW5jZSk7XG4gICAgICBpZiAobm9kZSAmJiAobm9kZSA9PT0gdGFyZ2V0IHx8IG5vZGUuY29udGFpbnModGFyZ2V0KSkpIHtcbiAgICAgICAgbWVtby5wdXNoKHsgaW5zdGFuY2U6IGluc3RhbmNlLCBub2RlOiBub2RlIH0pO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogc29ydEJ5RE9NUG9zaXRpb246IENhbGxlZCBieSBvdXIgY2xpY2sgaGFuZGxlciB0byBzb3J0IGEgbGlzdCBvZiBpbnN0YW5jZXNcbiAqIGFjY29yZGluZyB0byBsZWFzdCAtPiBtb3N0IG5lc3RlZC4gVGhpcyBpcyBzbyB0aGF0IGlmIG11bHRpcGxlIGtleWJvdW5kXG4gKiBpbnN0YW5jZXMgaGF2ZSBub2RlcyB0aGF0IGFyZSBhbmNlc3RvcnMgb2YgdGhlIGNsaWNrIHRhcmdldCwgdGhleSB3aWxsIGJlXG4gKiBzb3J0ZWQgdG8gbGV0IHRoZSBpbnN0YW5jZSBjbG9zZXN0IHRvIHRoZSBjbGljayB0YXJnZXQgZ2V0IGZpcnN0IGRpYnMgb24gdGhlXG4gKiBuZXh0IGtleSBkb3duIGV2ZW50LlxuICovXG5mdW5jdGlvbiBzb3J0QnlET01Qb3NpdGlvbihhLCBiKSB7XG4gIHJldHVybiBhLm5vZGUuY29tcGFyZURvY3VtZW50UG9zaXRpb24oYi5ub2RlKSA9PT0gMTAgPyAxIDogLTE7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHsgYmluZEZvY3VzYWJsZXM6IGJpbmRGb2N1c2FibGVzLCBmaW5kQ29udGFpbmVyTm9kZXM6IGZpbmRDb250YWluZXJOb2Rlcywgc29ydEJ5RE9NUG9zaXRpb246IHNvcnRCeURPTVBvc2l0aW9uIH07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3JlYWN0LWtleWRvd24vZXMvbGliL2RvbV9oZWxwZXJzLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBAbW9kdWxlIExpc3RlbmVyc1xuICpcbiAqL1xuXG4vLyBmbGFnIGZvciB3aGV0aGVyIGNsaWNrIGxpc3RlbmVyIGhhcyBiZWVuIGJvdW5kIHRvIGRvY3VtZW50XG52YXIgX2NsaWNrc0JvdW5kID0gZmFsc2U7XG5cbi8vIGZsYWcgZm9yIHdoZXRoZXIga2V5ZG93biBsaXN0ZW5lciBoYXMgYmVlbiBib3VuZCB0byBkb2N1bWVudFxudmFyIF9rZXlzQm91bmQgPSBmYWxzZTtcblxudmFyIExpc3RlbmVycyA9IHtcbiAgLyoqXG4gICAqIF9iaW5kS2V5c1xuICAgKlxuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKi9cbiAgYmluZEtleXM6IGZ1bmN0aW9uIGJpbmRLZXlzKGNhbGxiYWNrKSB7XG4gICAgaWYgKCFfa2V5c0JvdW5kKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY2FsbGJhY2spO1xuICAgICAgX2tleXNCb3VuZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG5cbiAgLyoqXG4gICAqIHVuYmluZEtleXNcbiAgICpcbiAgICogQGFjY2VzcyBwdWJsaWNcbiAgICovXG4gIHVuYmluZEtleXM6IGZ1bmN0aW9uIHVuYmluZEtleXMoY2FsbGJhY2spIHtcbiAgICBpZiAoX2tleXNCb3VuZCkge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGNhbGxiYWNrKTtcbiAgICAgIF9rZXlzQm91bmQgPSBmYWxzZTtcbiAgICB9XG4gIH0sXG5cblxuICAvKipcbiAgICogYmluZENsaWNrc1xuICAgKlxuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKi9cbiAgYmluZENsaWNrczogZnVuY3Rpb24gYmluZENsaWNrcyhjYWxsYmFjaykge1xuICAgIGlmICghX2NsaWNrc0JvdW5kKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbGxiYWNrLCB0cnVlKTtcbiAgICAgIF9jbGlja3NCb3VuZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG5cbiAgLyoqXG4gICAqIHVuYmluZENsaWNrc1xuICAgKlxuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKi9cbiAgdW5iaW5kQ2xpY2tzOiBmdW5jdGlvbiB1bmJpbmRDbGlja3MoY2FsbGJhY2spIHtcbiAgICBpZiAoX2NsaWNrc0JvdW5kKSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbGxiYWNrLCB0cnVlKTtcbiAgICAgIF9jbGlja3NCb3VuZCA9IGZhbHNlO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgTGlzdGVuZXJzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi9saXN0ZW5lcnMuanNcbi8vIG1vZHVsZSBpZCA9IDg0OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBDb3VudGVyIGJlaW5nIGluY3JlbWVudGVkLiBKUyBpcyBzaW5nbGUtdGhyZWFkZWQsIHNvIGl0J2xsIEp1c3QgV29ya+KEoi5cbnZhciBfX2NvdW50ZXIgPSAxO1xuXG4vKipcbiAqIFJldHVybnMgYSBwcm9jZXNzLXdpZGUgdW5pcXVlIGlkZW50aWZpZXIuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHV1aWQoKSB7XG4gIHJldHVybiBcInVpZC1cIiArIF9fY291bnRlcisrO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1rZXlkb3duL2VzL2xpYi91dWlkLmpzXG4vLyBtb2R1bGUgaWQgPSA4NDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy9cdCMgUGFyc2VyIFJ1bGVzXG4vL1x0UnVsZXMgY2FuIGJlIGFzIHNpbXBsZSBhcyBhIHN0cmluZyBgS2V5d29yZGAgb3IgYSBjb21wbGV4IHNlcXVlbmNlIG9mIChuZXN0ZWQpIHJ1bGVzLlxuLy9cbi8vXHRQYXJzZSBhIHJ1bGUgd2l0aCBgcnVsZS5wYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQsIGVuZClgLCB0aGlzIHdpbGwgZWl0aGVyOlxuLy9cdFx0LSByZXR1cm4gYHVuZGVmaW5lZGAgaWYgdGhlIHJ1bGUgZG9lc24ndCBtYXRjaCB0aGUgaGVhZCBvZiB0aGUgdG9rZW5zLCBvclxuLy9cdFx0LSByZXR1cm4gYSBDTE9ORSBvZiB0aGUgbWF0Y2hlZCBydWxlIHdpdGggYXQgbGVhc3QgdGhlIGZvbGxvd2luZzpcbi8vXHRcdFx0LSBgbWF0Y2hlZGBcdFx0UmVzdWx0cyBvZiB5b3VyIHBhcnNlLlxuLy9cdFx0XHQtIGBuZXh0U3RhcnRgXHRQbGFjZSB3aGVyZSBuZXh0IG1hdGNoIHNob3VsZCBzdGFydCAoZWc6IG9uZSBiZXlvbmQgd2hhdCB5b3UgbWF0Y2hlZCkuXG4vL1xuLy9cdFRoZSBjbG9uZSByZXR1cm5lZCBhYm92ZSBjYW4gYmUgbWFuaXB1bGF0ZWQgd2l0aFxuLy9cdFx0LSBgcnVsZS50b1NvdXJjZSgpYFx0ICBSZXR1cm4gamF2YXNjcmlwdCBzb3VyY2UgdG8gaW50ZXJwcmV0IHRoZSBydWxlLlxuLy9cdFx0LSBgcnVsZS50b1N5bnRheCgpYFx0ICBSZXR1cm4gcnVsZVN5bnRheCBmb3IgdGhlIHJ1bGUgKG1vc3RseSBmb3IgZGVidWdnaW5nKVxuLy8gICAgLVxuLy9cbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4vUGFyc2VyLmpzXCI7XG5pbXBvcnQgVG9rZW5pemVyIGZyb20gXCIuL1Rva2VuaXplci5qc1wiO1xuXG5pbXBvcnQgZ2xvYmFsIGZyb20gXCIuL3V0aWxzL2dsb2JhbFwiO1xuaW1wb3J0IHsgaXNXaGl0ZXNwYWNlIH0gZnJvbSBcIi4vdXRpbHMvc3RyaW5nXCI7XG5cblxuLy8gQWJzdHJhY3QgUnVsZSBjbGFzcy5cbi8vIFRPRE9DXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSdWxlIHtcblx0Y29uc3RydWN0b3IoLi4ucHJvcHMpIHtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIC4uLnByb3BzKTtcblx0fVxuXG5cdC8vIENsb25lIHRoaXMgcnVsZSBhbmQgYWRkIGFueSBgcHJvcHNgIHBhc3NlZCBpbi5cblx0Y2xvbmUocHJvcHMpIHtcblx0XHRyZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcywgcHJvcHMpO1xuXHR9XG5cbi8vXG4vL1x0UGFyc2luZyBwcmltaXRpdmVzIC0tIHlvdSBNVVNUIGltcGxlbWVudCB0aGVzZSBpbiB5b3VyIHN1YmNsYXNzZXMhXG4vL1xuXG5cdC8vIEF0dGVtcHQgdG8gbWF0Y2ggdGhpcyBydWxlIGJldHdlZW4gYHN0YXJ0YCBhbmQgYGVuZGAgb2YgYHRva2Vuc2AuXG5cdC8vIFJldHVybnMgcmVzdWx0cyBvZiB0aGUgcGFyc2Ugb3IgYHVuZGVmaW5lZGAuXG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0Ly8gVGVzdCB0byBzZWUgaWYgYml0cyBvZiBvdXIgcnVsZSBhcmUgZm91bmQgQU5ZV0hFUkUgYmV0d2VlbiBgc3RhcnRgIGFuZCBgZW5kYCBpbiB0aGUgYHRva2Vuc2AuXG5cdC8vIFRoaXMgaXMgdXNlZCBieSBjb21wbGljYXRlZCAoZWc6IGxlZnQgcmVjdXJzaXZlKSBydWxlcyB0byBleGl0IHF1aWNrbHkgaWYgdGhlcmUncyBubyBjaGFuY2UuXG5cdC8vIFJldHVybnM6XG5cdC8vXHQtIGB0cnVlYCBpZiB0aGUgcnVsZSBNSUdIVCBiZSBtYXRjaGVkLlxuXHQvL1x0LSBgZmFsc2VgIGlmIHRoZXJlIGlzIE5PIFdBWSB0aGUgcnVsZSBjYW4gYmUgbWF0Y2hlZC5cblx0Ly9cdC0gYHVuZGVmaW5lZGAgaWYgbm90IGRldGVybWluc3RpYyAoZWc6IG5vIHdheSB0byB0ZWxsIHF1aWNrbHkpLlxuXHR0ZXN0KHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuLy9cbi8vICMjIG91dHB1dCBhcyBzb3VyY2Vcbi8vXG5cblx0Ly8gT3V0cHV0IHZhbHVlIGZvciB0aGlzIElOU1RBTlRJQVRFRCBydWxlIGFzIHNvdXJjZS5cblx0dG9Tb3VyY2UoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hlZDtcblx0fVxuXG5cbi8vXG4vLyAjIyBvdXRwdXQgYXMgc3RydWN0dXJlOlxuLy9cblx0dG9TdHJ1Y3R1cmUoKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufVxuXG5cbi8vIEFic3RyYWN0IHJ1bGUgZm9yIG9uZSBvciBtb3JlIHNlcXVlbnRpYWwgbGl0ZXJhbCB2YWx1ZXMgdG8gbWF0Y2guXG4vLyBgcnVsZS5saXRlcmFsc2AgaXMgdGhlIGxpdGVyYWwgc3RyaW5nIG9yIGFycmF5IG9mIGxpdGVyYWwgc3RyaW5ncyB0byBtYXRjaC5cbi8vIGBydWxlLmxpdGVyYWxTZXBhcmF0b3JgIGlzIHRoZSBzdHJpbmcgdG8gcHV0IGJldHdlZW4gbXVsdGlwbGUgbGl0ZXJhbHMgd2hlbiBqb2luaW5nLlxuLy9cbi8vIEFmdGVyIHBhcnNpbmdcbi8vICBgcnVsZS5tYXRjaGVkYCB3aWxsIGJlIHRoZSBzdHJpbmcgd2hpY2ggd2FzIG1hdGNoZWRcbi8vICBgcnVsZS5uZXh0U3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGFydCB0b2tlblxuUnVsZS5MaXRlcmFscyA9IGNsYXNzIGxpdGVyYWxzIGV4dGVuZHMgUnVsZSB7XG5cdGNvbnN0cnVjdG9yKC4uLnByb3BzKSB7XG5cdFx0c3VwZXIoLi4ucHJvcHMpO1xuXHRcdC8vIGNvZXJjZSB0byBhbiBhcnJheSAoYSBiaXQgc2xvd2VyIGJ1dCBjbGVhbmVyKS5cblx0XHRpZiAoIUFycmF5LmlzQXJyYXkodGhpcy5saXRlcmFscykpIHRoaXMubGl0ZXJhbHMgPSBbdGhpcy5saXRlcmFsc107XG5cdH1cblxuXHQvLyBBdHRlbXB0IHRvIG1hdGNoIHRoaXMgcnVsZSBpbiB0aGUgYHRva2Vuc2AuXG5cdC8vIFJldHVybnMgcmVzdWx0cyBvZiB0aGUgcGFyc2Ugb3IgYHVuZGVmaW5lZGAuXG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHRpZiAoIXRoaXMubWF0Y2hlc1N0YXJ0aW5nQXQodG9rZW5zLCBzdGFydCwgZW5kKSkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkOiB0aGlzLmxpdGVyYWxzLmpvaW4odGhpcy5saXRlcmFsU2VwYXJhdG9yKSxcblx0XHRcdG5leHRTdGFydDogc3RhcnQgKyB0aGlzLmxpdGVyYWxzLmxlbmd0aFxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gRG9lcyB0aGlzIG1hdGNoIGFwcGVhciBBTllXSEVSRSBpbiB0aGUgdG9rZW5zP1xuXHR0ZXN0KHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGgpIHtcblx0ICBsZXQgZmlyc3QgPSB0aGlzLmxpdGVyYWxzWzBdO1xuXHQgIGZvciAodmFyIGluZGV4ID0gc3RhcnQ7IGluZGV4IDwgZW5kOyBpbmRleCsrKSB7XG5cdCAgICBpZiAodG9rZW5zW2luZGV4XSAhPT0gZmlyc3QpIGNvbnRpbnVlO1xuXHQgICAgaWYgKHRoaXMubWF0Y2hlc1N0YXJ0aW5nQXQodG9rZW5zLCBpbmRleCwgZW5kKSkgcmV0dXJuIHRydWU7XG5cdCAgfVxuXHQgIHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIE1hdGNoIG91ciBgbGl0ZXJhbHNgIGJldHdlZW4gYHN0YXJ0YCBhbmQgYGVuZGAgb2YgdG9rZW5zLlxuXHRtYXRjaGVzU3RhcnRpbmdBdCh0b2tlbnMsIHN0YXJ0ID0gMCwgZW5kID0gdG9rZW5zLmxlbmd0aCkge1xuXHQgIGlmICh0aGlzLmxpdGVyYWxzLmxlbmd0aCA9PT0gMSkgcmV0dXJuIHRva2Vuc1tzdGFydF0gPT09IHRoaXMubGl0ZXJhbHNbMF07XG4gICAgcmV0dXJuIHRoaXMubGl0ZXJhbHMuZXZlcnkoKGxpdGVyYWwsIGkpID0+IChzdGFydCArIGkgPCBlbmQpICYmIChsaXRlcmFsID09PSB0b2tlbnNbc3RhcnQgKyBpXSkpO1xuXHR9XG5cbiAgdG9Tb3VyY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2hlZDtcbiAgfVxuXG5cdHRvU3ludGF4KCkge1xuXHRcdHJldHVybiBgJHt0aGlzLmxpdGVyYWxzLmpvaW4odGhpcy5saXRlcmFsU2VwYXJhdG9yIHx8IFwiXCIpfSR7dGhpcy5vcHRpb25hbCA/ICc/JyA6ICcnfWA7XG5cdH1cbn1cblxuLy8gT25lIG9yIG1vcmUgbGl0ZXJhbCBzeW1ib2xzOiBgPGAsIGAlYCBldGMuXG4vLyBTeW1ib2xzIGpvaW4gV0lUSE9VVCBzcGFjZXMuXG5SdWxlLlN5bWJvbHMgPSBjbGFzcyBzeW1ib2xzIGV4dGVuZHMgUnVsZS5MaXRlcmFscyB7fVxuXG5cbi8vIE9uZSBvciBtb3JlIGxpdGVyYWwga2V5d29yZHMuXG4vLyBLZXl3b3JkcyBqb2luIFdJVEggc3BhY2VzLlxuUnVsZS5LZXl3b3JkcyA9IGNsYXNzIGtleXdvcmRzIGV4dGVuZHMgUnVsZS5MaXRlcmFscyB7fVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFJ1bGUuS2V5d29yZHMucHJvdG90eXBlLCBcImxpdGVyYWxTZXBhcmF0b3JcIiwgeyB2YWx1ZTogXCIgXCIgfSk7XG5cblxuXG4vLyBSZWdleCBwYXR0ZXJuIHRvIG1hdGNoIGEgU0lOR0xFIHRva2VuLlxuLy8gYHJ1bGUucGF0dGVybmAgaXMgdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byBtYXRjaC5cbi8vICAgIE5vdGUgdGhhdCB5b3UgTVVTVCBzdGFydCB5b3VyIHBhdHRlcm4gd2l0aCBgXmAgYW5kIGVuZCB3aXRoIGAkYCB0byBtYWtlIHN1cmUgaXQgbWF0Y2hlcyB0aGUgZW50aXJlIHRva2VuLlxuLy8gICAgTm90ZSB0aGF0IHRoaXMgY2FuIG9ubHkgbWF0Y2ggYSBzaW5nbGUgdG9rZW4hXG4vLyBgcnVsZS5ibGFja2xpc3RgIGlzIGEgbWFwIG9mIGB7IGtleTogdHJ1ZSB9YCBmb3Igc3RyaW5ncyB3aGljaCB3aWxsIE5PVCBiZSBhY2NlcHRlZC5cbi8vXG4vLyBBZnRlciBwYXJzaW5nXG4vLyAgYHJ1bGUubWF0Y2hlZGAgd2lsbCBiZSB0aGUgc3RyaW5nIHdoaWNoIHdhcyBtYXRjaGVkLlxuLy8gIGBydWxlLm5leHRTdGFydGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IHN0YXJ0IHRva2VuLlxuUnVsZS5QYXR0ZXJuID0gY2xhc3MgcGF0dGVybiBleHRlbmRzIFJ1bGUge1xuXHQvLyBBdHRlbXB0IHRvIG1hdGNoIHRoaXMgcGF0dGVybiBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSB0b2tlbnMuXG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHRsZXQgdG9rZW4gPSB0b2tlbnNbc3RhcnRdO1xuXHRcdGlmICh0eXBlb2YgdG9rZW4gIT09IFwic3RyaW5nXCIpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbWF0Y2ggPSB0b2tlbi5tYXRjaCh0aGlzLnBhdHRlcm4pO1xuXHRcdGlmICghbWF0Y2gpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBiYWlsIGlmIHByZXNlbnQgaW4gYmxhY2tsaXN0XG5cdFx0bGV0IG1hdGNoZWQgPSBtYXRjaFswXTtcblx0XHRpZiAodGhpcy5ibGFja2xpc3QgJiYgdGhpcy5ibGFja2xpc3RbbWF0Y2hlZF0pIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkLFxuXHRcdFx0bmV4dFN0YXJ0OiBzdGFydCArIDFcblx0XHR9KTtcblx0fVxuXG5cdC8vIFRlc3QgdG8gc2VlIGlmIGFueSBvZiBvdXIgcGF0dGVybiBpcyBmb3VuZCBBTllXSEVSRSBpbiB0aGUgdG9rZW5zLlxuXHR0ZXN0KHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdHJldHVybiB0b2tlbnMuc2xpY2Uoc3RhcnQsIGVuZCkuc29tZSh0b2tlbiA9PiB0eXBlb2YgdG9rZW4gPT09IFwic3RyaW5nXCIgJiYgcGF0dGVybi50ZXN0KHRva2VuKSk7XG5cdH1cblxuXHR0b1N5bnRheCgpIHtcblx0XHRyZXR1cm4gdGhpcy5wYXR0ZXJuLnNvdXJjZTtcblx0fVxufVxuXG5cbi8vIFN1YnJ1bGUgLS0gbmFtZSBvZiBhbm90aGVyIHJ1bGUgdG8gYmUgY2FsbGVkLlxuLy8gYHJ1bGUuc3VicnVsZWAgaXMgdGhlIG5hbWUgb2YgdGhlIHJ1bGUgaW4gYHBhcnNlci5ydWxlc2AuXG4vL1xuLy8gQWZ0ZXIgcGFyc2luZ1xuLy8gIHdlJ2xsIHJldHVybiB0aGUgYWN0dWFsIHJ1bGUgdGhhdCB3YXMgbWF0Y2hlZCAocmF0aGVyIHRoYW4gYSBjbG9uZSBvZiB0aGlzIHJ1bGUpXG5SdWxlLlN1YnJ1bGUgPSBjbGFzcyBzdWJydWxlIGV4dGVuZHMgUnVsZSB7XG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHRsZXQgbWF0Y2hlZFJ1bGUgPSBwYXJzZXIucGFyc2VOYW1lZFJ1bGUodGhpcy5zdWJydWxlLCB0b2tlbnMsIHN0YXJ0LCBlbmQsIHN0YWNrLCBgcGFyc2Ugc3VicnVsZSAnJHt0aGlzLnJ1bGV9J2ApO1xuXHRcdGlmICghbWF0Y2hlZFJ1bGUpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0aWYgKHRoaXMuYXJndW1lbnQpIG1hdGNoZWRSdWxlLmFyZ3VtZW50ID0gdGhpcy5hcmd1bWVudDtcblx0XHRyZXR1cm4gbWF0Y2hlZFJ1bGU7XG5cdH1cblxuXHQvLyBBc2sgdGhlIHN1YnJ1bGUgdG8gZmlndXJlIG91dCBpZiBhIG1hdGNoIGlzIHBvc3NpYmxlLlxuXHR0ZXN0KHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdHJldHVybiBwYXJzZXIudGVzdCh0aGlzLnN1YnJ1bGUsIHRva2Vucywgc3RhcnQsIGVuZCk7XG5cdH1cblxuXHR0b1N5bnRheCgpIHtcblx0XHRyZXR1cm4gYHske3RoaXMuYXJndW1lbnQgPyB0aGlzLmFyZ3VtZW50K1wiOlwiIDogXCJcIn0ke3RoaXMuc3VicnVsZX19JHt0aGlzLm9wdGlvbmFsID8gJz8nIDogJyd9YDtcblx0fVxufVxuXG5cbi8vIFNlcXVlbmNlIG9mIHJ1bGVzIHRvIG1hdGNoLlxuLy8gIGBydWxlLnJ1bGVzYCBpcyB0aGUgYXJyYXkgb2YgcnVsZXMgdG8gbWF0Y2guXG4vLyAgYHJ1bGUubGVmdFJlY3Vyc2l2ZWAgc2hvdWxkIGJlIGB0cnVlYCBpZiB0aGUgZmlyc3Qgbm9uLW9wdGlvbmFsIHJ1bGUgaW4gb3VyIGBydWxlc2Bcbi8vICAgIG1heSBlbmQgdXAgY2FsbGluZyB1cyBhZ2Fpbi4gIEluIHRoaXMgY2FzZSwgeW91IHNob3VsZCBwcm92aWRlIGBydWxlLnRlc3RSdWxlYC5cbi8vXG4vLyBBZnRlciBwYXJzaW5nXG4vLyAgYHJ1bGUubWF0Y2hlZGAgd2lsbCBiZSB0aGUgYXJyYXkgb2YgcnVsZXMgd2hpY2ggd2VyZSBtYXRjaGVkLlxuLy8gIGBydWxlLm5leHRTdGFydGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IHN0YXJ0IHRva2VuLlxuUnVsZS5TZXF1ZW5jZSA9IGNsYXNzIHNlcXVlbmNlIGV4dGVuZHMgUnVsZSB7XG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHQvLyBJZiB3ZSBoYXZlIGEgYHRlc3RSdWxlYCBkZWZpbmVkXG5cdFx0aWYgKHRoaXMudGVzdFJ1bGUpIHtcblx0XHRcdC8vIEZvcmdldCBpdCBpZiB0aGVyZSBpcyBOTyBXQVkgdGhlIHJ1bGUgY291bGQgYmUgbWF0Y2hlZC5cblx0XHRcdGlmIChwYXJzZXIudGVzdCh0aGlzLnRlc3RSdWxlLCB0b2tlbnMsIHN0YXJ0KSA9PT0gZmFsc2UpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgd2UncmUgYSBsZWZ0UmVjdXJzaXZlIHNlcXVlbmNlLi4uXG5cdFx0aWYgKHRoaXMubGVmdFJlY3Vyc2l2ZSkge1xuXHRcdFx0Ly8gSWYgdGhlIHN0YWNrIGFscmVhZHkgY29udGFpbnMgdGhpcyBydWxlLCBmb3JnZXQgaXQuXG5cdFx0XHRpZiAoc3RhY2sgJiYgc3RhY2suaW5jbHVkZXModGhpcykpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRcdC8vIENsb25lIHN0YWNrIGFuZCBhZGQgdGhpcyBydWxlIGZvciByZWN1cnNpb24uLi5cblx0XHRcdHN0YWNrID0gc3RhY2sgPyBzdGFjay5jb25jYXQoKSA6IFtdO1xuXHRcdFx0c3RhY2sucHVzaCh0aGlzKTtcblxuXHRcdFx0Ly8gVE9ETzogV2UgY291bGQgZGlzdGluZ3Vpc2ggYmV0d2VlbiBwcm9kdWN0aXZlIGFuZCB1bnByb2R1Y3RpdmUgcnVsZXNcblx0XHRcdC8vXHRcdCBieSBjaGVja2luZyBvbmx5IHJ1bGVzIHdoaWNoIG9jY3VyIGF0IHRoZSBzYW1lIGBzdGFydGAuLi5cblx0XHRcdC8vXHRcdCBUaGlzIHdvdWxkIHByb2JhYmx5IGFsbG93IG1vcmUgaW50ZXJlc3RpbmcgdGhpbmdzLCBidXQgaXQncyBtdWNoIG11Y2ggc2xvd2VyLlxuXHRcdH1cblxuXHRcdGxldCBtYXRjaGVkID0gW107XG5cdFx0bGV0IG5leHRTdGFydCA9IHN0YXJ0O1xuXHRcdGxldCBpbmRleCA9IDAsIHJ1bGUgPSB1bmRlZmluZWQ7XG5cdFx0d2hpbGUgKHJ1bGUgPSB0aGlzLnJ1bGVzW2luZGV4KytdKSB7XG5cdFx0XHRsZXQgbWF0Y2ggPSBydWxlLnBhcnNlKHBhcnNlciwgdG9rZW5zLCBuZXh0U3RhcnQsIGVuZCwgc3RhY2spO1xuXHRcdFx0aWYgKCFtYXRjaCAmJiAhcnVsZS5vcHRpb25hbCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdGlmIChtYXRjaCkge1xuXHRcdFx0XHRtYXRjaGVkLnB1c2gobWF0Y2gpO1xuXHRcdFx0XHRuZXh0U3RhcnQgPSBtYXRjaC5uZXh0U3RhcnQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGlmIHdlIGdldCBoZXJlLCB3ZSBtYXRjaGVkIGFsbCB0aGUgcnVsZXMhXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZCxcblx0XHRcdG5leHRTdGFydFxuXHRcdH0pO1xuXHR9XG5cblxuLy9UT0RPQ1xuXHQvLyBcImdhdGhlclwiIGFyZ3VtZW50cyBpbiBwcmVwYXJhdGlvbiB0byBjYWxsIGB0b1NvdXJjZSgpYFxuXHQvLyBPbmx5IGNhbGxhYmxlIGFmdGVyIHBhcnNlIGlzIGNvbXBsZXRlZC5cblx0Ly8gUmV0dXJucyBhbiBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIGZyb20gdGhlIGBtYXRjaGVkYCBhcnJheSBpbmRleGVkIGJ5IG9uZSBvZiB0aGUgZm9sbG93aW5nOlxuXHQvL1x0XHQtIGBtYXRjaC5hcmd1bWVudGA6XHRcdGFyZ3VtZW50IHNldCB3aGVuIHJ1bGUgd2FzIGRlY2xhcmVkLCBlZzogYHt2YWx1ZTpsaXRlcmFsfWAgPT4gYHZhbHVlYFxuXHQvL1x0XHQtIGBtYXRjaC5ydWxlTmFtZWA6XHRcdG5hbWUgb2YgcnVsZSB3aGVuIGRlZmluZWRcblx0Ly9cdFx0LSBgbWF0Y2guY29uc3RydWN0b3IubmFtZWA6XHRcdFx0bmFtZSBvZiB0aGUgcnVsZSB0eXBlXG5cdGdldCByZXN1bHRzKCkge1xuXHRcdGlmICghdGhpcy5tYXRjaGVkKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdGxldCByZXN1bHRzID0gYWRkUmVzdWx0cyh7fSwgdGhpcy5tYXRjaGVkKTtcblx0XHRpZiAodGhpcy5jb21tZW50KSByZXN1bHRzLmNvbW1lbnQgPSB0aGlzLmNvbW1lbnQ7XG5cdFx0cmV0dXJuIHJlc3VsdHM7XG5cbiAgICBmdW5jdGlvbiBhZGRSZXN1bHRzKHJlc3VsdHMsIG1hdGNoZWQpIHtcbiAgICAgIGxldCBpbmRleCA9IDAsIG1hdGNoID0gdW5kZWZpbmVkO1xuICAgICAgd2hpbGUgKG1hdGNoID0gbWF0Y2hlZFtpbmRleCsrXSkge1xuICAgICAgICBpZiAobWF0Y2gucHJvbW90ZSkge1xuICAgICAgICAgIGFkZFJlc3VsdHMocmVzdWx0cywgbWF0Y2gubWF0Y2hlZCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY29uc3Qgc291cmNlTmFtZSA9IG1hdGNoLmFyZ3VtZW50IHx8IG1hdGNoLmdyb3VwIHx8IG1hdGNoLmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgICAgICAgY29uc3QgbWF0Y2hOYW1lID0gXCJfXCIgKyBzb3VyY2VOYW1lO1xuICAgICAgICAgIGNvbnN0IHNvdXJjZSA9IG1hdGNoLnRvU291cmNlKCk7XG4gICAgICAgICAgLy8gSWYgYXJnIGFscmVhZHkgZXhpc3RzLCBjb252ZXJ0IHRvIGFuIGFycmF5XG4gICAgICAgICAgaWYgKG1hdGNoTmFtZSBpbiByZXN1bHRzKSB7XG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVzdWx0c1ttYXRjaE5hbWVdKSkge1xuICAgICAgICAgICAgICByZXN1bHRzW21hdGNoTmFtZV0gPSBbcmVzdWx0c1ttYXRjaE5hbWVdXTtcbiAgICAgICAgICAgICAgcmVzdWx0c1tzb3VyY2VOYW1lXSA9IFtyZXN1bHRzW3NvdXJjZU5hbWVdXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdHNbbWF0Y2hOYW1lXS5wdXNoKG1hdGNoKTtcbiAgICAgICAgICAgIHJlc3VsdHNbc291cmNlTmFtZV0ucHVzaChzb3VyY2UpXG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0c1ttYXRjaE5hbWVdID0gbWF0Y2g7XG4gICAgICAgICAgICByZXN1bHRzW3NvdXJjZU5hbWVdID0gc291cmNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXHR9XG5cblx0Ly8gRWNobyB0aGlzIHJ1bGUgYmFjayBvdXQuXG5cdHRvU3ludGF4KCkge1xuXHQgIGNvbnN0IHJ1bGVzID0gdGhpcy5ydWxlcy5tYXAocnVsZSA9PiBydWxlLnRvU3ludGF4KCkpO1xuXHRcdHJldHVybiBgJHt0aGlzLnJ1bGVzLmpvaW4oXCIgXCIpfSR7dGhpcy5vcHRpb25hbCA/ICc/JyA6ICcnfWA7XG5cdH1cblxufVxuXG5cbi8vIEFsdGVybmF0aXZlIHN5bnRheCwgbWF0Y2hpbmcgb25lIG9mIGEgbnVtYmVyIG9mIGRpZmZlcmVudCBydWxlcy5cbi8vIFRoZSByZXN1bHQgb2YgYSBwYXJzZSBpcyB0aGUgbG9uZ2VzdCBydWxlIHRoYXQgYWN0dWFsbHkgbWF0Y2hlZC5cbi8vIE5PVEU6IEN1cnJlbnRseSB0YWtlcyB0aGUgbG9uZ2VzdCB2YWxpZCBtYXRjaC5cbi8vIFRPRE86IG1hdGNoIGFsbCB2YWxpZCBhbHRlcm5hdGl2ZXNcbi8vXG4vLyBBZnRlciBwYXJzaW5nXG4vLyAgd2UnbGwgcmV0dXJuIHRoZSBydWxlIHdoaWNoIGlzIHRoZSBcImJlc3QgbWF0Y2hcIiAocmF0aGVyIHRoYW4gY2xvbmluZyB0aGlzIHJ1bGUpLlxuUnVsZS5BbHRlcm5hdGl2ZXMgPSBjbGFzcyBhbHRlcm5hdGl2ZXMgZXh0ZW5kcyBSdWxlIHtcblx0Y29uc3RydWN0b3IoLi4ucHJvcHMpIHtcblx0XHRzdXBlciguLi5wcm9wcyk7XG5cdFx0aWYgKCF0aGlzLnJ1bGVzKSB0aGlzLnJ1bGVzID0gW107XG5cdH1cblxuXHQvLyBUZXN0IHRvIHNlZSBpZiBhbnkgb2Ygb3VyIGFsdGVybmF0aXZlcyBhcmUgZm91bmQgQU5ZV0hFUkUgaW4gdGhlIHRva2Vucy5cblx0Ly8gTk9URTogdGhpcyBzaG91bGQgb25seSBiZSBjYWxsZWQgaWYgd2UncmUgc3BlY2lmaWVkIGFzIGEgYHRlc3RSdWxlYFxuXHQvL1x0XHQgYW5kIHRoZW4gb25seSBpZiBhbGwgb2Ygb3VyIHJ1bGVzIGFyZSBkZXRlcm1pbmlzdGljLlxuXHR0ZXN0KHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGxldCBpbmRleCA9IDAsIHJ1bGUgPSB1bmRlZmluZWQ7XG5cdFx0d2hpbGUgKHJ1bGUgPSB0aGlzLnJ1bGVzW2luZGV4KytdKSB7XG5cdFx0XHRpZiAocnVsZS50ZXN0KHBhcnNlciwgdG9rZW5zLCBzdGFydCwgZW5kKSkgcmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIEZpbmQgYWxsIHJ1bGVzIHdoaWNoIG1hdGNoIGFuZCBkZWxlZ2F0ZSB0byBgZ2V0QmVzdE1hdGNoKClgIHRvIHBpY2sgdGhlIGJlc3Qgb25lLlxuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0bGV0IG1hdGNoZXMgPSBbXTtcblx0XHRsZXQgaW5kZXggPSAwLCBydWxlID0gdW5kZWZpbmVkO1xuXHRcdHdoaWxlIChydWxlID0gdGhpcy5ydWxlc1tpbmRleCsrXSkge1xuXHRcdFx0bGV0IG1hdGNoID0gcnVsZS5wYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQsIGVuZCwgc3RhY2spO1xuXHRcdFx0aWYgKG1hdGNoKSBtYXRjaGVzLnB1c2gobWF0Y2gpO1xuXHRcdH1cblxuXHRcdGlmICghbWF0Y2hlcy5sZW5ndGgpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyB1bmNvbW1lbnQgdGhlIGJlbG93IHRvIHByaW50IGFsdGVybmF0aXZlc1xuXHRcdC8vIGlmIChtYXRjaGVzLmxlbmd0aCA+IDEpIHtcblx0XHQvL1x0Y29uc29sZS5pbmZvKHRoaXMuYXJndW1lbnQgfHwgdGhpcy5ydWxlTmFtZSwgbWF0Y2hlcywgbWF0Y2hlcy5tYXAobWF0Y2ggPT4gbWF0Y2gubWF0Y2hlZFRleHQpKTtcblx0XHQvLyB9XG5cblx0XHRsZXQgYmVzdE1hdGNoID0gKG1hdGNoZXMubGVuZ3RoID09PSAxID8gbWF0Y2hlc1swXSA6IHRoaXMuZ2V0QmVzdE1hdGNoKG1hdGNoZXMpKTtcblxuXHRcdC8vIGFzc2lnbiBgYXJnTmFtZWAgb3IgYGdyb3VwYCBmb3IgYHJlc3VsdHNgXG5cdFx0aWYgKHRoaXMuYXJndW1lbnQpIGJlc3RNYXRjaC5hcmd1bWVudCA9IHRoaXMuYXJndW1lbnQ7XG5cdFx0ZWxzZSBpZiAodGhpcy5ncm91cCkgYmVzdE1hdGNoLmdyb3VwID0gdGhpcy5ncm91cDtcbi8vVE9ETzogb3RoZXIgdGhpbmdzIHRvIGNvcHkgaGVyZT8/P1xuXG5cdFx0cmV0dXJuIGJlc3RNYXRjaDtcblx0fVxuXG5cdC8vIFJldHVybiB0aGUgXCJiZXN0XCIgbWF0Y2ggZ2l2ZW4gbW9yZSB0aGFuIG9uZSBtYXRjaGVzIGF0IHRoZSBoZWFkIG9mIHRoZSB0b2tlbnMuXG5cdC8vIERlZmF1bHQgaXMgdG8gcmV0dXJuIHRoZSBsb25nZXN0IG1hdGNoLlxuXHQvLyBJbXBsZW1lbnQgc29tZXRoaW5nIGVsc2UgdG8gZG8sIGVnLCBwcmVjZWRlbmNlIHJ1bGVzLlxuXHRnZXRCZXN0TWF0Y2gobWF0Y2hlcykge1xuXHRcdHJldHVybiBtYXRjaGVzLnJlZHVjZShmdW5jdGlvbiAoYmVzdCwgY3VycmVudCkge1xuXHRcdFx0aWYgKGN1cnJlbnQubmV4dFN0YXJ0ID4gYmVzdC5uZXh0U3RhcnQpIHJldHVybiBjdXJyZW50O1xuXHRcdFx0cmV0dXJuIGJlc3Q7XG5cdFx0fSwgbWF0Y2hlc1swXSk7XG5cdH1cblxuXHRhZGRSdWxlKC4uLnJ1bGUpIHtcblx0XHR0aGlzLnJ1bGVzLnB1c2goLi4ucnVsZSk7XG5cdH1cblxuXHR0b1N5bnRheCgpIHtcblx0ICBjb25zdCBydWxlcyA9IHRoaXMucnVsZXMubWFwKHJ1bGUgPT4gcnVsZS50b1N5bnRheCgpKS5qb2luKFwifFwiKTtcblx0XHRyZXR1cm4gYCgke3RoaXMuYXJndW1lbnQgPyB0aGlzLmFyZ3VtZW50K1wiOlwiIDogXCJcIn0ke3J1bGVzfSkke3RoaXMub3B0aW9uYWwgPyAnPycgOiAnJ31gO1xuXHR9XG59O1xuXG5cbi8vIFJlcGVhdGluZyBydWxlLlxuLy9cdGB0aGlzLnJlcGVhdGAgaXMgdGhlIHJ1bGUgdGhhdCByZXBlYXRzLlxuLy8gIGB0aGlzLm9wdGlvbmFsYCBpcyB0cnVlIGlmIHRoZSBwcm9kdXRpb24gaXMgb3B0aW9uYWwuXG4vL1x0Tm90ZTogQXV0b21hdGljYWxseSBjb25zdW1lcyB3aGl0ZXNwYWNlIGJlZm9yZSBydWxlcy5cbi8vXHROb3RlOiBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIHdlIGRvbid0IG1hdGNoIGF0IGxlYXN0IG9uY2UuXG4vL1xuLy8gQWZ0ZXIgbWF0Y2hpbmc6XG4vL1x0YHRoaXMubWF0Y2hlZGAgaXMgYXJyYXkgb2YgbWF0Y2hlZCBydWxlcy5cbi8vICBgcnVsZS5uZXh0U3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGFydCB0b2tlbi5cblJ1bGUuUmVwZWF0ID0gY2xhc3MgcmVwZWF0IGV4dGVuZHMgUnVsZSB7XG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHRsZXQgbWF0Y2hlZCA9IFtdO1xuXHRcdGxldCBuZXh0U3RhcnQgPSBzdGFydDtcblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0bGV0IG1hdGNoID0gdGhpcy5yZXBlYXQucGFyc2UocGFyc2VyLCB0b2tlbnMsIG5leHRTdGFydCwgZW5kLCBzdGFjayk7XG5cdFx0XHRpZiAoIW1hdGNoKSBicmVhaztcblxuXHRcdFx0bWF0Y2hlZC5wdXNoKG1hdGNoKTtcblx0XHRcdG5leHRTdGFydCA9IG1hdGNoLm5leHRTdGFydDtcblx0XHR9XG5cblx0XHRpZiAobWF0Y2hlZC5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkLFxuXHRcdFx0bmV4dFN0YXJ0XG5cdFx0fSk7XG5cdH1cblxuXHR0b1NvdXJjZSgpIHtcblx0XHRpZiAoIXRoaXMubWF0Y2hlZCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkLm1hcChtYXRjaCA9PiBtYXRjaC50b1NvdXJjZSgpKTtcblx0fVxuXG5cdHRvU3ludGF4KCkge1xuXHRcdGxldCBpc0NvbXBvdW5kUnVsZSA9ICh0aGlzLnJlcGVhdCBpbnN0YW5jZW9mIFJ1bGUuU2VxdWVuY2UpXG4gICAgICB8fCAodGhpcy5yZXBlYXQgaW5zdGFuY2VvZiBSdWxlLkxpdGVyYWxzICYmIHRoaXMucmVwZWF0LmxpdGVyYWxzLmxlbmd0aCA+IDEpO1xuICAgIGNvbnN0IHJlcGVhdCA9IHRoaXMucmVwZWF0LnRvU3ludGF4KCk7XG5cdFx0Y29uc3QgcnVsZSA9IGlzQ29tcG91bmRSdWxlID8gYCgke3JlcGVhdH0pYCA6IGAke3JlcGVhdH1gO1xuXHRcdHJldHVybiBgJHtydWxlfSR7dGhpcy5vcHRpb25hbCA/ICcqJyA6ICcrJ31gO1xuXHR9XG59XG5cblxuLy8gTGlzdCBtYXRjaCBydWxlOiAgIGBbPGl0ZW0+PGRlbGltaXRlcj5dYC4gZWdcIiBgW3tudW1iZXJ9LF1gIHRvIG1hdGNoIGAxLDIsM2Bcbi8vXHRgcnVsZS5pdGVtYCBpcyB0aGUgcnVsZSBmb3IgZWFjaCBpdGVtLFxuLy9cdGBydWxlLmRlbGltaXRlcmAgaXMgdGhlIGRlbGltaXRlciBiZXR3ZWVuIGVhY2ggaXRlbSwgd2hpY2ggaXMgb3B0aW9uYWwgYXQgdGhlIGVuZC5cbi8vXG4vLyBBZnRlciBtYXRjaGluZzpcbi8vXHRgdGhpcy5tYXRjaGVkYCBpcyBhcnJheSBvZiBtYXRjaGVkIHJ1bGVzLlxuLy8gIGBydWxlLm5leHRTdGFydGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IHN0YXJ0IHRva2VuLlxuLy9cbi8vIE5PVEU6IHdlIGFzc3VtZSB0aGF0IGEgTGlzdCBydWxlIGl0c2VsZiB3aWxsIE5PVCByZXBlYXQgKD8/Pz8pXG5SdWxlLkxpc3QgPSBjbGFzcyBsaXN0IGV4dGVuZHMgUnVsZSB7XG5cdHBhcnNlKHBhcnNlciwgdG9rZW5zLCBzdGFydCA9IDAsIGVuZCwgc3RhY2spIHtcblx0XHQvLyBlbnN1cmUgaXRlbSBhbmQgZGVsaW1pdGVyIGFyZSBvcHRpb25hbCBzbyB3ZSBkb24ndCBiYXJmIGluIGBwYXJzZVJ1bGVgXG4vL1RPRE86ID8/P1xuXHRcdHRoaXMuaXRlbS5vcHRpb25hbCA9IHRydWU7XG5cdFx0dGhpcy5kZWxpbWl0ZXIub3B0aW9uYWwgPSB0cnVlO1xuXG5cdFx0bGV0IG1hdGNoZWQgPSBbXTtcblx0XHRsZXQgbmV4dFN0YXJ0ID0gc3RhcnQ7XG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdC8vIGdldCBuZXh0IGl0ZW0sIGV4aXRpbmcgaWYgbm90IGZvdW5kXG5cdFx0XHRsZXQgaXRlbSA9IHRoaXMuaXRlbS5wYXJzZShwYXJzZXIsIHRva2VucywgbmV4dFN0YXJ0LCBlbmQsIHN0YWNrKTtcblx0XHRcdGlmICghaXRlbSkgYnJlYWs7XG5cblx0XHRcdG1hdGNoZWQucHVzaChpdGVtKTtcblx0XHRcdG5leHRTdGFydCA9IGl0ZW0ubmV4dFN0YXJ0O1xuXG5cdFx0XHQvLyBnZXQgZGVsaW1pdGVyLCBleGl0aW5nIGlmIG5vdCBmb3VuZFxuXHRcdFx0bGV0IGRlbGltaXRlciA9IHRoaXMuZGVsaW1pdGVyLnBhcnNlKHBhcnNlciwgdG9rZW5zLCBuZXh0U3RhcnQsIGVuZCwgc3RhY2spO1xuXHRcdFx0aWYgKCFkZWxpbWl0ZXIpIGJyZWFrO1xuXHRcdFx0bmV4dFN0YXJ0ID0gZGVsaW1pdGVyLm5leHRTdGFydDtcblx0XHR9XG5cblx0XHQvLyBJZiB3ZSBkaWRuJ3QgZ2V0IGFueSBtYXRjaGVzLCBmb3JnZXQgaXQuXG5cdFx0aWYgKG1hdGNoZWQubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHRoaXMuY2xvbmUoe1xuXHRcdFx0bWF0Y2hlZCxcblx0XHRcdG5leHRTdGFydFxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gUmV0dXJucyBsaXN0IG9mIHZhbHVlcyBhcyBzb3VyY2UuXG5cdHRvU291cmNlKCkge1xuXHRcdGlmICghdGhpcy5tYXRjaGVkKSByZXR1cm4gW107XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hlZC5tYXAoIG1hdGNoID0+IG1hdGNoLnRvU291cmNlKCkgKTtcblx0fVxuXG5cdHRvU3ludGF4KCkge1xuXHQgIGNvbnN0IGl0ZW0gPSB0aGlzLml0ZW0udG9TeW50YXgoKTtcblx0ICBjb25zdCBkZWxpbWl0ZXIgPSB0aGlzLmRlbGltaXRlci50b1N5bnRheCgpO1xuXHRcdHJldHVybiBgWyR7dGhpcy5hcmd1bWVudCA/IHRoaXMuYXJndW1lbnQrXCI6XCIgOiBcIlwifSR7aXRlbX0gJHtkZWxpbWl0ZXJ9XSR7dGhpcy5vcHRpb25hbCA/ICc/JyA6ICcnfWA7XG5cdH1cbn07XG5cblxuXG4vLyBBIGJsb2NrIGlzIHVzZWQgdG8gcGFyc2UgYSBuZXN0ZWQgYmxvY2sgb2Ygc3RhdGVtZW50cy5cbi8vIEFic3RyYWN0IGNsYXNzLlxuUnVsZS5CbG9jayA9IGNsYXNzIGJsb2NrIGV4dGVuZHMgUnVsZS5TZXF1ZW5jZSB7XG5cblx0Ly8gUGFyc2UgdGhlIGVudGlyZSBgYmxvY2tgLCByZXR1cm5pbmcgcmVzdWx0cy5cblx0cGFyc2VCbG9jayhwYXJzZXIsIGJsb2NrLCBpbmRlbnQgPSAwKSB7XG5cdFx0bGV0IG1hdGNoZWQgPSBbXTtcbi8vY29uc29sZS53YXJuKFwiYmxvY2s6XCIsIGJsb2NrKTtcblx0XHRibG9jay5jb250ZW50cy5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuXHRcdFx0bGV0IHJlc3VsdDtcblx0XHRcdGlmIChpdGVtLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRtYXRjaGVkLnB1c2gobmV3IFJ1bGUuQmxhbmtMaW5lKCkpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoaXRlbSBpbnN0YW5jZW9mIFRva2VuaXplci5CbG9jaykge1xuXHRcdFx0XHRsZXQgbGFzdCA9IG1hdGNoZWRbbWF0Y2hlZC5sZW5ndGggLSAxXTtcblx0XHRcdFx0aWYgKGxhc3QucGFyc2VCbG9jaykge1xuXHRcdFx0XHRcdGxhc3QucGFyc2VCbG9jayhwYXJzZXIsIGl0ZW0sIGluZGVudCArIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGxldCBibG9jayA9IHRoaXMucGFyc2VCbG9jayhwYXJzZXIsIGl0ZW0sIGluZGVudCArIDEpO1xuXHRcdFx0XHRcdGlmIChibG9jayAhPT0gdW5kZWZpbmVkKSBtYXRjaGVkLnB1c2goYmxvY2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0bWF0Y2hlZCA9IG1hdGNoZWQuY29uY2F0KHRoaXMucGFyc2VTdGF0ZW1lbnQocGFyc2VyLCBpdGVtKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gbmV3IFJ1bGUuQmxvY2soe1xuXHRcdFx0aW5kZW50LFxuXHRcdFx0bWF0Y2hlZFxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gUGFyc2UgYSBzaW5nbGUgc3RhdGVtZW50IChhIGxpbmUncyB3b3J0aCBvZiBgdG9rZW5zYCkuXG5cdC8vIFNraXBzIHdoaXRlc3BhY2UgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZS5cblx0Ly8gQXV0by1tYXRjaGVzIGNvbW1lbnQgaW4gdGhlIG1pZGRsZSBvZiB0aGUgbGluZS5cblx0Ly8gUmV0dXJucyBhcnJheSBvZiByZXN1bHRzLlxuXHRwYXJzZVN0YXRlbWVudChwYXJzZXIsIHRva2Vucykge1xuXHRcdGxldCByZXN1bHRzID0gW107XG5cdFx0bGV0IHN0YXJ0ID0gMCwgZW5kID0gdG9rZW5zLmxlbmd0aDtcblx0XHRsZXQgc3RhdGVtZW50LCBjb21tZW50O1xuXG5cdFx0Ly8gY2hlY2sgZm9yIGFuIGluZGVudCBhdCB0aGUgc3RhcnQgb2YgdGhlIGxpbmVcblx0XHRpZiAodG9rZW5zW3N0YXJ0XSBpbnN0YW5jZW9mIFRva2VuaXplci5XaGl0ZXNwYWNlKSBzdGFydCsrO1xuXG5cdFx0Ly8gY2hlY2sgZm9yIGEgY29tbWVudCBhdCB0aGUgZW5kIG9mIHRoZSB0b2tlbnNcblx0XHRpZiAodG9rZW5zW2VuZC0xXSBpbnN0YW5jZW9mIFRva2VuaXplci5Db21tZW50KSB7XG5cdFx0XHRjb21tZW50ID0gcGFyc2VyLnBhcnNlTmFtZWRSdWxlKFwiY29tbWVudFwiLCB0b2tlbnMsIGVuZC0xLCBlbmQsIHVuZGVmaW5lZCwgXCJwYXJzZVN0YXRlbWVudFwiKTtcblx0XHRcdC8vIGFkZCBjb21tZW50IEZJUlNUIGlmIGZvdW5kXG5cdFx0XHRyZXN1bHRzLnB1c2goY29tbWVudCk7XG5cdFx0XHRlbmQtLTtcblx0XHR9XG5cblx0XHQvLyBwYXJzZSB0aGUgcmVzdCBhcyBhIFwic3RhdGVtZW50XCJcblx0XHRzdGF0ZW1lbnQgPSBwYXJzZXIucGFyc2VOYW1lZFJ1bGUoXCJzdGF0ZW1lbnRcIiwgdG9rZW5zLCBzdGFydCwgZW5kLCB1bmRlZmluZWQsIFwicGFyc2VTdGF0ZW1lbnRcIik7XG5cdFx0Ly8gY29tcGxhaW4gaWYgbm8gc3RhdGVtZW50IGFuZCBubyBjb21tZW50XG5cdFx0aWYgKCFzdGF0ZW1lbnQgJiYgIWNvbW1lbnQpIHtcblx0XHRcdGxldCBlcnJvciA9IG5ldyBSdWxlLlN0YXRlbWVudFBhcnNlRXJyb3Ioe1xuXHRcdFx0XHR1bnBhcnNlZDogdG9rZW5zLnNsaWNlKHN0YXJ0LCBlbmQpLmpvaW4oXCIgXCIpXG5cdFx0XHR9KTtcblx0XHRcdHJlc3VsdHMucHVzaChlcnJvcik7XG5cdFx0fVxuXG5cdFx0Ly8gY29tcGxhaW4gaWYgd2UgY2FuJ3QgcGFyc2UgdGhlIGVudGlyZSBsaW5lIVxuXHRcdGVsc2UgaWYgKHN0YXRlbWVudCAmJiBzdGF0ZW1lbnQubmV4dFN0YXJ0ICE9PSBlbmQpIHtcblx0XHRcdGxldCBlcnJvciA9IG5ldyBSdWxlLlN0YXRlbWVudFBhcnNlRXJyb3Ioe1xuXHRcdFx0XHRwYXJzZWQgOiB0b2tlbnMuc2xpY2Uoc3RhcnQsIHN0YXRlbWVudC5uZXh0U3RhcnQpLmpvaW4oXCIgXCIpLFxuXHRcdFx0XHR1bnBhcnNlZCA6IHRva2Vucy5zbGljZShzdGF0ZW1lbnQubmV4dFN0YXJ0LCBlbmQpLmpvaW4oXCIgXCIpXG5cdFx0XHR9KTtcblx0XHRcdHJlc3VsdHMucHVzaChlcnJvcik7XG5cdFx0fVxuXG5cdFx0Ly8gT3RoZXJ3aXNlIGFkZCB0aGUgc3RhdGVtZW50XG5cdFx0ZWxzZSBpZiAoc3RhdGVtZW50KSB7XG5cdFx0XHRyZXN1bHRzLnB1c2goc3RhdGVtZW50KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0cztcblx0fVxuXG5cdC8vIFJldHVybiBzb3VyY2UgZm9yIHRoaXMgYmxvY2sgYXMgYW4gYXJyYXkgb2YgaW5kZW50ZWQgbGluZXMgV0lUSE9VVCBge2AgT1IgYH1gLlxuXHRibG9ja1RvU291cmNlKGJsb2NrID0gdGhpcy5tYXRjaGVkKSB7XG5cdFx0bGV0IHJlc3VsdHMgPSBbXSwgc3RhdGVtZW50O1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBibG9jay5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGV0IG1hdGNoID0gYmxvY2tbaV07XG4gICAgICAvL2NvbnNvbGUuaW5mbyhpLCBtYXRjaCk7XG4gICAgICB0cnkge1xuICAgICAgICAgICAgc3RhdGVtZW50ID0gbWF0Y2gudG9Tb3VyY2UoKSB8fCBcIlwiO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICBjb25zb2xlLndhcm4oXCJFcnJvciBjb252ZXJ0aW5nIGJsb2NrOiBcIiwgYmxvY2ssIFwic3RhdGVtZW50OlwiLCBtYXRjaCk7XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUuaW5mbyhpLCBzdGF0ZW1lbnQpO1xuXHRcdFx0aWYgKGlzV2hpdGVzcGFjZShzdGF0ZW1lbnQpKSB7XG5cdFx0XHRcdHJlc3VsdHMucHVzaChcIlwiKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoc3RhdGVtZW50KSkge1xuXHRcdFx0XHRyZXN1bHRzID0gcmVzdWx0cy5jb25jYXQoc3RhdGVtZW50KTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiBzdGF0ZW1lbnQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0c3RhdGVtZW50ID0gc3RhdGVtZW50LnNwbGl0KFwiXFxuXCIpO1xuXHRcdFx0XHRyZXN1bHRzID0gcmVzdWx0cy5jb25jYXQoc3RhdGVtZW50KTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oXCJibG9ja1RvU291cmNlKCk6IERPTidUIEtOT1cgSE9XIFRPIFdPUksgV0lUSFxcblxcdFwiLCBzdGF0ZW1lbnQsIFwiXFxuXFx0ZnJvbSBtYXRjaFwiLCBtYXRjaCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICh0aGlzLmluZGVudCAhPT0gMCkge1xuXHRcdFx0cmV0dXJuIFwiXFx0XCIgKyByZXN1bHRzLmpvaW4oXCJcXG5cXHRcIik7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHRzLmpvaW4oXCJcXG5cIik7XG5cdH1cblxuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gXCIge1xcblwiICsgdGhpcy5ibG9ja1RvU291cmNlKCkgKyBcIlxcblwiICsgXCJ9XCI7XG5cdH1cblxuXHQvLyBDb252ZXJ0IHRvIGxvZ2ljYWwgcmVwcmVzZW50YXRpb24gb2Ygc3RydWN0dXJlIGJ5IGNvbnZlcnRpbmcgaW5kaXZpZHVhbCBzdGF0ZW1lbnRzIGFuZCBncm91cGluZ1xuXHQvLyBOT1RFOiB5b3Ugc2hvdWxkIG92ZXJyaWRlIHRoaXMgYW5kIGluY2x1ZGUgXCJ0eXBlXCJcblx0dG9TdHJ1Y3R1cmUoKSB7XG5cdFx0bGV0IHsgX25hbWU6IG5hbWUsIF9zdXBlclR5cGU6IHN1cGVyVHlwZSB9ID0gdGhpcy5yZXN1bHRzO1xuXHRcdGxldCBibG9jayA9ICh0aGlzLmJsb2NrICYmIHRoaXMuYmxvY2subWF0Y2hlZCkgfHwgW107XG5cblx0XHRsZXQgbmFtZWQgPSB7fTtcblx0XHRsZXQgcHJvcGVydGllcyA9IFtdO1xuXHRcdGxldCBtZXRob2RzID0gW107XG5cdFx0bGV0IG90aGVyID0gW107XG5cdFx0YmxvY2subWFwKHN0YXRlbWVudCA9PiBzdGF0ZW1lbnQudG9TdHJ1Y3R1cmUoKSlcblx0XHRcdCAuZmlsdGVyKEJvb2xlYW4pXG5cdFx0XHQgLmZvckVhY2goYWRkU3RydWN0dXJlKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR0eXBlOiBcInVua25vd25cIixcblx0XHRcdG5hbWUsXG5cdFx0XHRzdXBlclR5cGUsXG5cdFx0XHRuYW1lZCxcblx0XHRcdHByb3BlcnRpZXMsXG5cdFx0XHRtZXRob2RzLFxuXHRcdFx0b3RoZXJcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBhZGRTdHJ1Y3R1cmUoc3RydWN0dXJlKSB7XG5cdFx0XHQvLyBhZGQgYXJyYXlzIGFzIGluZGl2aWR1YWwgaXRlbXNcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHN0cnVjdHVyZSkpIHJldHVybiBzdHJ1Y3R1cmUuZm9yRWFjaChhZGRTdHJ1Y3R1cmUpO1xuXG5cdFx0XHQvLyBhZGQgdW5kZXIgYG5hbWVkYCBmb3IgcXVpY2sgaGl0IG9mIGFsbCBzaWduaWZpY2FudCBiaXRzLi4uXG5cdFx0XHRpZiAoc3RydWN0dXJlLm5hbWUpIG5hbWVkW3N0cnVjdHVyZS5uYW1lXSA9IHN0cnVjdHVyZTtcblxuXHRcdFx0Ly8gYWRkIHVuZGVyICdtZXRob2RzJywgJ3Byb3BlcnRpZXMnIG9yICdvdGhlcidcblx0XHRcdGlmIChzdHJ1Y3R1cmUudHlwZSA9PT0gXCJmdW5jdGlvblwiKSBtZXRob2RzLnB1c2goc3RydWN0dXJlKTtcblx0XHRcdGVsc2UgaWYgKHN0cnVjdHVyZS50eXBlID09PSBcInByb3BlcnR5XCIpIHByb3BlcnRpZXMucHVzaChzdHJ1Y3R1cmUpO1xuXHRcdFx0ZWxzZSBvdGhlci5wdXNoKHN0cnVjdHVyZSk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gRm9ybWF0IGFycmF5IG9mIGBzdGF0ZW1lbnRzYCBhcyBhIEpTIG91dHB1dCBibG9jazpcblx0Ly9cdC0gaWYgYHN0YXRlbWVudHNgIGlzIGVtcHR5LCByZXR1cm5zIGB7fWBcblx0Ly9cdC0gaWYgYHN0YXRlbWVudHMgaXMgYSBzaW5nbGUgbGluZSwgcmV0dXJucyBgeyBzdGF0ZW1lbnQgfWBcblx0Ly9cdC0gZWxzZSByZXR1cm5zIG11bHRpcGxlIGxpbmVzXG5cdHN0YXRpYyBlbmNsb3NlU3RhdGVtZW50cyguLi5hcmdzKSB7XG5cdFx0dmFyIHN0YXRlbWVudHMgPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdGxldCBhcmcgPSBhcmdzW2ldO1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoYXJnKSkge1xuXHRcdFx0XHRzdGF0ZW1lbnRzID0gc3RhdGVtZW50cy5jb25jYXQoYXJnKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiBhcmcgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0c3RhdGVtZW50cy5wdXNoKGFyZyk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHN0YXRlbWVudHMgPSBzdGF0ZW1lbnRzLmpvaW4oXCJcXG5cIik7XG5cblx0XHRpZiAoIXN0YXRlbWVudHMpIHJldHVybiBcInt9XCI7XG5cdFx0aWYgKCFzdGF0ZW1lbnRzLmluY2x1ZGVzKFwiXFxuXCIpICYmIHN0YXRlbWVudHMubGVuZ3RoIDwgNDApIHtcblx0XHRcdHJldHVybiBgeyAke3N0YXRlbWVudHMudHJpbSgpfSB9YDtcblx0XHR9XG5cdFx0aWYgKHN0YXRlbWVudHNbMF0gIT09IFwiXFx0XCIpIHN0YXRlbWVudHMgPSBgXFx0JHtzdGF0ZW1lbnRzfWA7XG5cdFx0cmV0dXJuIGB7XFxuJHtzdGF0ZW1lbnRzfVxcbn1gO1xuXHR9XG5cbn1cblxuXG4vLyBgU3RhdGVtZW50c2AgYXJlIGEgc3BlY2lhbCBjYXNlIGZvciBhIGJsb2NrIG9mIGBTdGF0ZW1lbnRgIHJ1bGVzXG4vL1x0dGhhdCB1bmRlcnN0YW5kIG5lc3RpbmcgYW5kIGNvbW1lbnRzLlxuLy9cbi8vIFRoaXMgaXMgYSB0b3AtbGV2ZWwgY29uc3RydWN0LCBlLmcuIHVzZWQgdG8gcGFyc2UgYW4gZW50aXJlIGZpbGUuXG5SdWxlLlN0YXRlbWVudHMgPSBjbGFzcyBzdGF0ZW1lbnRzIGV4dGVuZHMgUnVsZS5CbG9jayB7XG5cblx0Ly8gU3BsaXQgc3RhdGVtZW50cyB1cCBpbnRvIGJsb2NrcyBhbmQgcGFyc2UgJ2VtLlxuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQgPSB0b2tlbnMubGVuZ3RoLCBzdGFjaykge1xuXHRcdHZhciBibG9jayA9IFRva2VuaXplci5icmVha0ludG9CbG9ja3ModG9rZW5zLCBzdGFydCwgZW5kKTtcblxuXHRcdGxldCBtYXRjaGVkID0gdGhpcy5wYXJzZUJsb2NrKHBhcnNlciwgYmxvY2spO1xuXHRcdGlmICghbWF0Y2hlZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiB0aGlzLmNsb25lKHtcblx0XHRcdG1hdGNoZWQsXG5cdFx0XHRuZXh0U3RhcnQ6IGVuZFxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gT3V0cHV0IHN0YXRlbWVudHMgV0lUSE9VVCBjdXJseSBicmFjZXMgYXJvdW5kIHRoZW0uXG5cdHRvU291cmNlKCkge1xuXHRcdHJldHVybiB0aGlzLm1hdGNoZWQuYmxvY2tUb1NvdXJjZSgpO1xuXHR9XG59XG5cblxuLy8gQSBgQmxvY2tTdGF0ZW1lbnRgIChlLmcuIGFuIGBpZmAgb3IgYHJlcGVhdGApOlxuLy9cdC0gaXMgYXNzdW1lZCB0byBoYXZlIGFuIGluaXRpYWwgcGFydGlhbCBgc3RhdGVtZW50YFxuLy9cdC0gTUFZIGhhdmUgYW4gaW5saW5lIGBzdGF0ZW1lbnRgIChvbiB0aGUgc2FtZSBsaW5lLCBwb3NzaWJseSBhZnRlciBhIGA6YClcbi8vXHQtIE1BWSBoYXZlIGNvbnRlbnRzIGFzIGFuIGVtYmVkZGVkIGBibG9ja2Bcbi8vXG4vL1x0SW4geW91ciBgcmVzdWx0c2AsIGBibG9ja2Agd2lsbCBiZSB0aGUgcmVzdWx0aW5nIGJsb2NrIG91dHB1dCwgaWYgdGhlcmUgaXMgb25lLlxuLy9cdEl0J3MgdXAgdG8geW91ciBydWxlIHRvIGRvIHNvbWV0aGluZyB3aXRoIGl0Li4uXG5SdWxlLkJsb2NrU3RhdGVtZW50ID0gY2xhc3MgYmxvY2tfc3RhdGVtZW50IGV4dGVuZHMgUnVsZS5CbG9jayB7XG5cblx0Ly8gUGFyc2UgYSBibG9jayBhbmQgYWRkIGl0IHRvIGB0aGlzLmJsb2NrYFxuXHRwYXJzZUJsb2NrKHBhcnNlciwgYmxvY2ssIGluZGVudCA9IDApIHtcblx0XHR0aGlzLmJsb2NrID0gc3VwZXIucGFyc2VCbG9jayguLi5hcmd1bWVudHMpO1xuXHR9XG5cbiAgLy8gQWRkIG91ciBgYmxvY2tgIHRvIHRoZSByZXN1bHRzXG4gIGdldCByZXN1bHRzKCkge1xuICAgIGxldCByZXN1bHRzID0gc3VwZXIucmVzdWx0cztcbiAgICBpZiAocmVzdWx0cyAmJiB0aGlzLmJsb2NrKSB7XG4gICAgICByZXN1bHRzLl9ibG9jayA9IHRoaXMuYmxvY2s7XG4gICAgICByZXN1bHRzLmJsb2NrID0gdGhpcy5ibG9jay50b1NvdXJjZSgpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxufVxuXG5cbi8vIEJsYW5rIGxpbmUgcmVwcmVzZW50YXRpb24gaW4gcGFyc2VyIG91dHB1dC5cblJ1bGUuQmxhbmtMaW5lID0gY2xhc3MgYmxhbmtfbGluZSBleHRlbmRzIFJ1bGUge1xuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gXCJcXG5cIjtcblx0fVxufVxuXG4vLyBDb21tZW50IHJ1bGUgLS0gbWF0Y2hlcyB0b2tlbnMgb2YgdHlwZSBgVG9rZW5pemVyLkNvbW1lbnRgLlxuUnVsZS5Db21tZW50ID0gY2xhc3MgY29tbWVudCBleHRlbmRzIFJ1bGUge1xuXHQvLyBDb21tZW50cyBhcmUgc3BlY2lhbCBub2RlcyBpbiBvdXIgdG9rZW4gc3RyZWFtLlxuXHRwYXJzZShwYXJzZXIsIHRva2Vucywgc3RhcnQgPSAwLCBlbmQsIHN0YWNrKSB7XG5cdFx0bGV0IHRva2VuID0gdG9rZW5zW3N0YXJ0XTtcblx0XHRpZiAoISh0b2tlbiBpbnN0YW5jZW9mIFRva2VuaXplci5Db21tZW50KSkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gdGhpcy5jbG9uZSh7XG5cdFx0XHRtYXRjaGVkOiB0b2tlbixcblx0XHRcdG5leHRTdGFydDogc3RhcnQgKyAxXG5cdFx0fSk7XG5cdH1cblxuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gYC8vJHt0aGlzLm1hdGNoZWQud2hpdGVzcGFjZX0ke3RoaXMubWF0Y2hlZC5jb21tZW50fWA7XG5cdH1cbn1cblxuLy8gUGFyc2VyIGVycm9yIHJlcHJlc2VudGF0aW9uIGluIHBhcnNlciBvdXRwdXQuXG5SdWxlLlN0YXRlbWVudFBhcnNlRXJyb3IgPSBjbGFzcyBwYXJzZV9lcnJvciBleHRlbmRzIFJ1bGUge1xuXHRjb25zdHJ1Y3RvciguLi5wcm9wcykge1xuXHRcdHN1cGVyKC4uLnByb3BzKTtcblx0XHRpZiAoUGFyc2VyLldBUk4pIGNvbnNvbGUud2Fybih0aGlzLm1lc3NhZ2UpO1xuXHR9XG5cblx0Z2V0IG1lc3NhZ2UoKSB7XG5cdFx0aWYgKHRoaXMucGFyc2VkKSB7XG5cdFx0XHRyZXR1cm4gXCJDQU5UIFBBUlNFIEVOVElSRSBTVEFURU1FTlRcXG5cIlxuXHRcdFx0XHQgKyBcIlBBUlNFRCAgICAgIDogYFwiKyB0aGlzLnBhcnNlZCArIFwiYFxcblwiXG5cdFx0XHRcdCArIFwiQ0FOJ1QgUEFSU0UgOiBgXCIrIHRoaXMudW5wYXJzZWQgKyBcImBcIjtcblx0XHR9XG5cdFx0cmV0dXJuIFwiQ0FOJ1QgUEFSU0UgU1RBVEVNRU5UOiBgXCIgKyB0aGlzLnVucGFyc2VkICsgXCJgXCI7XG5cdH1cblxuXHR0b1NvdXJjZSgpIHtcblx0XHRyZXR1cm4gXCIvLyBcIiArIHRoaXMubWVzc2FnZS5zcGxpdChcIlxcblwiKS5qb2luKFwiXFxuLy8gXCIpO1xuXHR9XG59XG5cblxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1J1bGUuanMiLCJpbXBvcnQgeyBkZWZpbmVNZW1vaXplZCB9IGZyb20gXCIuL21lbW9pemUuanNcIjtcbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4vUGFyc2VyLmpzXCI7XG5pbXBvcnQgUnVsZSBmcm9tIFwiLi9SdWxlLmpzXCI7XG5pbXBvcnQgeyBjbG9uZUNsYXNzIH0gZnJvbSBcIi4vdXRpbHMvY2xhc3MuanNcIjtcbmltcG9ydCBnbG9iYWwgZnJvbSBcIi4vdXRpbHMvZ2xvYmFsLmpzXCI7XG5cblxuXG4vL1xuLy9cdCMgUGFyc2luZyBgcnVsZVN5bnRheGAgdG8gY3JlYXRlIHJ1bGVzIGF1dG9tYXRpY2FsbHkuXG4vL1xuLy8gVE9ETzpcdEJldHRlciBuYW1lIGZvciBgcnVsZVN5bnRheGBcbi8vIFRPRE86XHRVc2Uga2V5d29yZHMgaW4gc3ludGF4IHRvIG1ha2UgYSBxdWljayByZWdleC1iYXNlZCBgdGVzdGAgZnVuY3Rpb24gZm9yIHRoZSBlbnRpcmUgcnVsZVxuXG4vL1xuLy8gIyMgZ3JvdXA6IHBhcnNpbmcgc3ludGF4XG4vL1xuXG4vL1RPRE9DXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZVJ1bGUoc3ludGF4LCBjb25zdHJ1Y3Rvcikge1xuICAvLyBJZiB3ZSBnb3QgYW4gYXJyYXkgb2YgcG9zc2libGUgc3ludGF4ZXMuLi5cbiAgaWYgKEFycmF5LmlzQXJyYXkoc3ludGF4KSkge1xuICAgIC8vIHJlY3Vyc2l2ZWx5IHBhcnNlIGVhY2ggc3ludGF4LCB1c2luZyBhIENMT05FIG9mIHRoZSBjb25zdHJ1Y3RvclxuICAgIGNvbnN0IHJ1bGVzID0gc3ludGF4Lm1hcChzeW50YXggPT4gcGFyc2VSdWxlKHN5bnRheCwgY2xvbmVDbGFzcyhjb25zdHJ1Y3RvcikpICk7XG4gICAgLy8gcmV0dXJuIGFuIGFsdGVybmF0aXZlcyB3aXRoIHRoZSBjb3JyZWN0IG5hbWVcbiAgICBjb25zdCBhbHRDbGFzcyA9IGNsb25lQ2xhc3MoUnVsZS5BbHRlcm5hdGl2ZXMsIGNvbnN0cnVjdG9yLm5hbWUpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhbHRDbGFzcy5wcm90b3R5cGUsIFwicnVsZXNcIiwgeyB2YWx1ZTogcnVsZXMgfSk7XG4gICAgcmV0dXJuIG5ldyBhbHRDbGFzcygpO1xuICB9O1xuXG4gIGxldCBydWxlcyA9IHBhcnNlU3ludGF4KHN5bnRheCwgW10pO1xuICBpZiAocnVsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBwYXJzZXIuZGVmaW5lUnVsZSgke25hbWVzWzBdfSwgJHtzeW50YXh9KTogbm8gcnVsZSBwcm9kdWNlZGApO1xuICB9XG5cbiAgLy8gTWFrZSBhbiBpbnN0YW5jZSBvZiB0aGUgcnVsZSBhbmQgYWRkIHJlbGV2YW50IHByb3BlcnRpZXMgdG8gaXRzIHByb3RvdHlwZSBub24tZW51bWVyYWJseVxuICBpZiAoY29uc3RydWN0b3IucHJvdG90eXBlIGluc3RhbmNlb2YgUnVsZS5LZXl3b3Jkc1xuICAgfHwgY29uc3RydWN0b3IucHJvdG90eXBlIGluc3RhbmNlb2YgUnVsZS5TeW1ib2xzXG4gICB8fCBjb25zdHJ1Y3Rvci5wcm90b3R5cGUgaW5zdGFuY2VvZiBSdWxlLkxpc3RcbiAgIHx8IGNvbnN0cnVjdG9yLnByb3RvdHlwZSBpbnN0YW5jZW9mIFJ1bGUuQWx0ZXJuYXRpdmVzXG4gICkge1xuICAgIGZvciAobGV0IHByb3BlcnR5IGluIHJ1bGVzWzBdKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IucHJvdG90eXBlLCBwcm9wZXJ0eSwgeyB2YWx1ZTogcnVsZXNbMF1bcHJvcGVydHldIH0pO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IucHJvdG90eXBlLCBcInJ1bGVzXCIsIHsgdmFsdWU6IHJ1bGVzIH0pO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBjb25zdHJ1Y3RvcigpO1xufVxuXG5mdW5jdGlvbiB0b2tlbmlzZVJ1bGVTeW50YXgoc3ludGF4KSB7XG4gIGNvbnN0IFNZTlRBWF9FWFBSRVNTSU9OID0gLyg/OltcXHdcXC1dK3xcXFxcW1xcW1xcKFxce1xcKVxcfVxcXV18W15cXHNcXHddfFxcfCkvZztcbiAgbGV0IHN5bnRheFN0cmVhbSA9IHN5bnRheC5tYXRjaChTWU5UQVhfRVhQUkVTU0lPTik7XG4gIGlmICghc3ludGF4U3RyZWFtKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYENhbid0IHRva2VuaXplIHBhcnNlIHJ1bGUgc3ludGF4ID4+JHtzeW50YXh9PDxgKTtcbiAgcmV0dXJuIHN5bnRheFN0cmVhbTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU3ludGF4KHN5bnRheCwgcnVsZXMgPSBbXSwgc3RhcnQgPSAwKSB7XG4gIGlmIChzeW50YXggPT0gbnVsbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihcInBhcnNlU3ludGF4KCk6IGBzeW50YXhgIGlzIHJlcXVpcmVkXCIpO1xuICBjb25zdCBzeW50YXhTdHJlYW0gPSB0eXBlb2Ygc3ludGF4ID09PSBcInN0cmluZ1wiXG4gICAgPyB0b2tlbmlzZVJ1bGVTeW50YXgoc3ludGF4KVxuICAgIDogc3ludGF4O1xuXG4gIGxldCBsYXN0SW5kZXggPSBzeW50YXhTdHJlYW0ubGVuZ3RoO1xuICB3aGlsZSAoc3RhcnQgPCBsYXN0SW5kZXgpIHtcbiAgICBsZXQgWyBydWxlLCBlbmQgXSA9IHBhcnNlVG9rZW4oc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuICAgIGlmIChydWxlKSB7XG4gICAgICBsZXQgbGFzdCA9IHJ1bGVzW3J1bGVzLmxlbmd0aC0xXTtcbiAgICAgIC8vIElmIHRoaXMgaXMgYSBgU3ltYm9sYCBhbmQgbGFzdCB3YXMgYSBgU3ltYm9sYCwgbWVyZ2UgdG9nZXRoZXJcbiAgICAgIGlmIChsYXN0ICYmIGxhc3QgaW5zdGFuY2VvZiBSdWxlLlN5bWJvbHMgJiYgcnVsZSBpbnN0YW5jZW9mIFJ1bGUuU3ltYm9scykge1xuICAgICAgICAvLyByZW1vdmUgdGhlIGxhc3QgcnVsZVxuICAgICAgICBydWxlcy5wb3AoKTtcbiAgICAgICAgLy8gYW5kIHJlcGxhY2Ugd2l0aCBhIHJ1bGUgdGhhdCBtZXJnZXMgdGhlIGtleXdvcmRzXG4gICAgICAgIHJ1bGUubGl0ZXJhbHMgPSBsYXN0LmxpdGVyYWxzLmNvbmNhdChydWxlLmxpdGVyYWxzKTtcbiAgICAgIH1cbiAgICAgIHJ1bGVzLnB1c2gocnVsZSk7XG4gICAgfVxuICAgIHN0YXJ0ID0gZW5kICsgMTtcbiAgfVxuICByZXR1cm4gcnVsZXM7XG59XG5cbmNvbnN0IEtFWVdPUkRfUEFUVEVSTiA9IC9bQS1aYS16XVtcXHdfLV0qLztcbmZ1bmN0aW9uIHBhcnNlVG9rZW4oc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDApIHtcbiAgbGV0IHN5bnRheFRva2VuID0gc3ludGF4U3RyZWFtW3N0YXJ0XTtcblxuICAvLyBpZiB3ZSBnb3QgYSBcIlxcXFxcIiAod2hpY2ggYWxzbyBoYXMgdG8gZ28gaW50byB0aGUgc291cmNlIHN0cmluZyBhcyBcIlxcXFxcIilcbiAgLy8gdHJlYXQgdGhlIG5leHQgdG9rZW4gYXMgYSBsaXRlcmFsIHN0cmluZyByYXRoZXIgdGhhbiBhcyBhIHNwZWNpYWwgY2hhcmFjdGVyLlxuICBpZiAoc3ludGF4VG9rZW4gPT09IFwiXFxcXFwiKSB7XG4gICAgcmV0dXJuIHBhcnNlU3ltYm9sKHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0ICsgMSk7XG4gIH1cblxuICBzd2l0Y2ggKHN5bnRheFRva2VuKSB7XG4gICAgY2FzZSBcIntcIjpcdHJldHVybiBwYXJzZVN1YnJ1bGUoc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuICAgIGNhc2UgXCIoXCI6XHRyZXR1cm4gcGFyc2VBbHRlcm5hdGl2ZXMoc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuICAgIGNhc2UgXCJbXCI6XHRyZXR1cm4gcGFyc2VMaXN0KHN5bnRheFN0cmVhbSwgcnVsZXMsIHN0YXJ0KTtcbiAgICBjYXNlIFwiKlwiOlxuICAgIGNhc2UgXCIrXCI6XG4gICAgY2FzZSBcIj9cIjpcdHJldHVybiBwYXJzZVJlcGVhdChzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG5cbiAgICAvLyB0aGUgZm9sbG93aW5nIHNob3VsZCBBTFdBWVMgYmUgY29uc3VtZWQgYnkgdGhlIGFib3ZlXG4gICAgY2FzZSBcIn1cIjpcbiAgICBjYXNlIFwiKVwiOlxuICAgIGNhc2UgXCJdXCI6XG4gICAgY2FzZSBcInxcIjpcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgVW5leHBlY3RlZCAke3N5bnRheFRva2VufSBmb3VuZCBhcyBpdGVtICR7c3RhcnR9IG9mICR7c3ludGF4U3RyZWFtfWApO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGlmIChzeW50YXhUb2tlbi5tYXRjaChLRVlXT1JEX1BBVFRFUk4pKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUtleXdvcmQoc3ludGF4U3RyZWFtLCBydWxlcywgc3RhcnQpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBwYXJzZVN5bWJvbChzeW50YXhTdHJlYW0sIHJ1bGVzLCBzdGFydCk7XG4gICAgICB9XG4gIH1cbn1cblxuXG4vLyBNYXRjaCBga2V5d29yZGAgaW4gc3ludGF4IHJ1bGVzLlxuLy8gSWYgbW9yZSB0aGFuIG9uZSBrZXl3b3JkIGFwcGVhcnMgaW4gYSByb3csIGNvbWJpbmVzIHRoZW0gaW50byBhIHNpbmdsZSBgS2V5d29yZGAgb2JqZWN0LlxuLy8gVGhpcyBpcyBwcmV0dHkgc2FmZSwgdW5sZXNzIHlvdSBoYXZlIGFuIG9wdGlvbmFsIGtleXdvcmQgbGlrZVxuLy9cdFx0YHRoZSB7aWRlbnRpZmllcn0gb2YgdGhlPyB7ZXhwcmVzc2lvbn1gXG4vLyBpbiB3aGljaCBjYXNlIHlvdSBjYW4gcHV0IHRoZSBvcHRpb25hbCBrZXl3b3JkIGluIHBhcmVuc1xuLy9cdFx0YHRoZSB7aWRlbnRpZmllcn0gb2YgKHRoZT8pIHtleHByZXNzaW9ufWBcbi8vXG4vLyBSZXR1cm5zIGBbIHJ1bGUsIGVuZCBdYFxuLy8gVGhyb3dzIGlmIGludmFsaWQuXG5mdW5jdGlvbiBwYXJzZUtleXdvcmQoc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDAsIGNvbnN0cnVjdG9yID0gUnVsZS5LZXl3b3Jkcykge1xuICBsZXQgbGl0ZXJhbHMgPSBbXSwgZW5kO1xuICAvLyBlYXQga2V5d29yZHMgd2hpbGUgdGhleSBsYXN0XG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IHN5bnRheFN0cmVhbS5sZW5ndGg7IGkrKykge1xuICAgIGxldCBuZXh0ID0gc3ludGF4U3RyZWFtW2ldO1xuICAgIGlmICh0eXBlb2YgbmV4dCA9PT0gXCJzdHJpbmdcIiAmJiBuZXh0Lm1hdGNoKEtFWVdPUkRfUEFUVEVSTikpIHtcbiAgICAgIGxpdGVyYWxzLnB1c2gobmV4dCk7XG4gICAgICBlbmQgPSBpO1xuICAgIH1cbiAgICBlbHNlIGJyZWFrO1xuICB9XG5cbiAgbGV0IHJ1bGUgPSBuZXcgY29uc3RydWN0b3IoeyBsaXRlcmFscyB9KTtcbiAgcmV0dXJuIFsgcnVsZSwgZW5kIF07XG59XG5cbi8vIE1hdGNoIGBrZXl3b3JkYCBpbiBzeW50YXggcnVsZXMuXG4vLyBSZXR1cm5zIGBbIHJ1bGUsIGVuZCBdYFxuLy8gVGhyb3dzIGlmIGludmFsaWQuXG5mdW5jdGlvbiBwYXJzZVN5bWJvbChzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCwgY29uc3RydWN0b3IgPSBSdWxlLlN5bWJvbHMpIHtcbiAgbGV0IHN0cmluZyA9IHN5bnRheFN0cmVhbVtzdGFydF07XG4gIGlmICghY29uc3RydWN0b3IpIGNvbnN0cnVjdG9yID0gUnVsZS5TeW1ib2xzO1xuXG4gIC8vIElmIHN0cmluZyBzdGFydHMgd2l0aCBgXFxcXGAsIGl0J3MgYW4gZXNjYXBlZCBsaXRlcmFsIChlZzogYFxcW2AgbmVlZHMgdG8gaW5wdXQgYXMgYFxcXFxbYCkuXG4gIGxldCBpc0VzY2FwZWQgPSBzdHJpbmcuc3RhcnRzV2l0aChcIlxcXFxcIik7XG4gIGxldCBsaXRlcmFscyA9IGlzRXNjYXBlZCA/IHN0cmluZy5zdWJzdHIoMSkgOiBzdHJpbmc7XG5cbiAgbGV0IHJ1bGUgPSBuZXcgY29uc3RydWN0b3IoeyBsaXRlcmFscyB9KTtcblxuICBpZiAoaXNFc2NhcGVkKSB7XG4gICAgcnVsZS50b1N5bnRheCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGBcXFxcJHtsaXRlcmFsc30ke3RoaXMub3B0aW9uYWwgPyAnPycgOiAnJ31gO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbIHJ1bGUsIHN0YXJ0IF07XG59XG5cblxuLy8gTWF0Y2ggZ3JvdXBpbmcgZXhwcmVzc2lvbiBgKC4uLnwuLi4pYCBpbiBzeW50YXggcnVsZXMuXG4vLyBSZXR1cm5zIGBbIHJ1bGUsIGVuZCBdYFxuLy8gWW91IGNhbiBzcGVjaWZ5IGFuIGV4cGxpY2l0IGBydWxlLmFyZ3VtZW50YCB3aXRoOiAgYChzb21lYXJnOi4uLilgXG4vLyBZb3UgY2FuIHNwZWNpZnkgdGhhdCB0aGUgcmVzdWx0cyBzaG91bGQgYmUgYHByb21vdGVkYCB0byBlbmNsb3NpbmcgcnVsZSB3aXRoOiBgKD86Li4uKWBcbi8vXG4vLyBOT1RFOiBuZXN0ZWQgcGFyZW5zIG1heSBub3QgaGF2ZSBhbHRlcm5hdGl2ZXMuLi4gOi0oICAgYChhfChifGMpKWAgd29uJ3Qgd29yaz8/P1xuZnVuY3Rpb24gcGFyc2VBbHRlcm5hdGl2ZXMoc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDApIHtcbiAgbGV0IHsgZW5kLCBzbGljZSB9ID0gUGFyc2VyLmZpbmROZXN0ZWRUb2tlbnMoc3ludGF4U3RyZWFtLCBcIihcIiwgXCIpXCIsIHN0YXJ0KTtcblxuICAvLyBwdWxsIG91dCBleHBsaWNpdCBcInByb21vdGVcIiBmbGFnOiBgPzpgXG4gIGxldCBwcm9tb3RlID0gKHNsaWNlWzBdID09PSBcIj9cIiAmJiBzbGljZVsxXSA9PT0gXCI6XCIpO1xuICBpZiAocHJvbW90ZSkge1xuICAgIHNsaWNlID0gc2xpY2Uuc2xpY2UoMik7XG4gIH1cblxuICAvLyBwdWxsIG91dCBleHBsaWNpdCBhcmd1bWVudCBuYW1lXG4gIGxldCBhcmd1bWVudDtcbiAgaWYgKHNsaWNlLmxlbmd0aCA+IDIgJiYgc2xpY2VbMV0gPT09IFwiOlwiKSB7XG4gICAgYXJndW1lbnQgPSBzbGljZVswXTtcbiAgICBzbGljZSA9IHNsaWNlLnNsaWNlKDIpO1xuICB9XG5cbiAgLy8gc3BsaXQgaW50byBncm91cHMsIGluY2x1ZGluZyBuZXN0ZWQgcGFyZW5zXG4gIGxldCBhbHRlcm5hdGl2ZXMgPVxuICAgIGdyb3VwQWx0ZXJuYXRpdmVzKHNsaWNlKVxuICAgIC5tYXAoZnVuY3Rpb24oZ3JvdXApIHtcbiAgICAgIGxldCByZXN1bHRzID0gcGFyc2VTeW50YXgoZ3JvdXAsIFtdKTtcbiAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gcmVzdWx0c1swXTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFJ1bGUuU2VxdWVuY2UoeyBydWxlczogcmVzdWx0cyB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICBsZXQgcnVsZSA9IGFsdGVybmF0aXZlcy5sZW5ndGggPT09IDEgPyBhbHRlcm5hdGl2ZXNbMF0gOiBuZXcgUnVsZS5BbHRlcm5hdGl2ZXMoeyBydWxlczogYWx0ZXJuYXRpdmVzIH0pO1xuICBpZiAoYXJndW1lbnQpIHJ1bGUuYXJndW1lbnQgPSBhcmd1bWVudDtcbiAgaWYgKHByb21vdGUpIHJ1bGUucHJvbW90ZSA9IHRydWU7XG4gIHJldHVybiBbIHJ1bGUsIGVuZCBdO1xufVxuXG5mdW5jdGlvbiBncm91cEFsdGVybmF0aXZlcyh0b2tlbnMpIHtcbiAgbGV0IGFsdGVybmF0aXZlcyA9IFtdO1xuICBsZXQgY3VycmVudCA9IFtdO1xuICBmb3IgKGxldCBpID0gMCwgdG9rZW47IHRva2VuID0gdG9rZW5zW2ldOyBpKyspIHtcbiAgICAvLyBoYW5kbGUgYWx0ZXJuYXRlIG1hcmtlclxuICAgIGlmICh0b2tlbiA9PT0gXCJ8XCIpIHtcbiAgICAgIGFsdGVybmF0aXZlcy5wdXNoKGN1cnJlbnQpO1xuICAgICAgY3VycmVudCA9IFtdO1xuICAgIH1cbiAgICAvLyBoYW5kbGUgbmVzdGVkIHBhcmVuc1xuICAgIGVsc2UgaWYgKHRva2VuID09PSBcIihcIikge1xuICAgICAgbGV0IHsgZW5kIH0gPSBQYXJzZXIuZmluZE5lc3RlZFRva2Vucyh0b2tlbnMsIFwiKFwiLCBcIilcIiwgaSk7XG4gICAgICBjdXJyZW50ID0gY3VycmVudC5jb25jYXQodG9rZW5zLnNsaWNlKGksIGVuZCArIDEpKTtcbiAgICAgIGkgPSBlbmQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY3VycmVudC5wdXNoKHRva2VuKTtcbiAgICB9XG4gIH1cbiAgaWYgKGN1cnJlbnQubGVuZ3RoKSBhbHRlcm5hdGl2ZXMucHVzaChjdXJyZW50KTtcbiAgcmV0dXJuIGFsdGVybmF0aXZlcztcbn1cblxuLy8gTWF0Y2ggcmVwZWF0IGluZGljYXRvciBgP2AsIGArYCBvciBgKmAgYnkgYXR0YWNoaW5nIGl0IHRvIHRoZSBwcmV2aW91cyBydWxlLlxuZnVuY3Rpb24gcGFyc2VSZXBlYXQoc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDApIHtcbiAgbGV0IHN5bWJvbCA9IHN5bnRheFN0cmVhbVtzdGFydF07XG4gIGxldCBydWxlID0gcnVsZXNbcnVsZXMubGVuZ3RoIC0gMV07XG4gIGlmICghcnVsZSkgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBDYW4ndCBhdHRhY2ggcmVwZWF0IHN5bWJvbCAke3N5bWJvbH0gdG8gZW1wdHkgcnVsZSFgKTtcblxuICAvLyBUcmFuc2Zvcm0gbGFzdCBydWxlIGludG8gYSByZXBlYXQgZm9yIGAqYCBhbmQgYCtgLlxuICBpZiAoc3ltYm9sID09PSBcIipcIiB8fCBzeW1ib2wgPT09IFwiK1wiKSB7XG4gICAgbGV0IGFyZ3VtZW50ID0gcnVsZS5hcmd1bWVudDtcbiAgICBydWxlID0gbmV3IFJ1bGUuUmVwZWF0KHsgcmVwZWF0OiBydWxlIH0pO1xuICAgIGlmIChhcmd1bWVudCkgcnVsZS5hcmd1bWVudCA9IGFyZ3VtZW50O1xuICAgIC8vIHB1c2ggaW50byBydWxlIHN0YWNrIGluIHBsYWNlIG9mIG9sZCBydWxlXG4gICAgcnVsZXNbcnVsZXMubGVuZ3RoIC0gMV0gPSBydWxlO1xuICB9XG5cbiAgLy8gUnVsZSBpcyBvcHRpb25hbCBmb3IgYD9gIGFuZCBgKmAuXG4gIGlmIChzeW1ib2wgPT09IFwiP1wiIHx8IHN5bWJvbCA9PT0gXCIqXCIpIHtcbiAgICBydWxlLm9wdGlvbmFsID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBbIHVuZGVmaW5lZCwgc3RhcnQgXVxufVxuXG4vLyBNYXRjaCBgezxydWxlTmFtZT59YCBpbiBzeW50YXggcnVsZXMuXG4vLyBSZXR1cm5zIGBbIHJ1bGUsIGVuZCBdYFxuLy8gVGhyb3dzIGlmIGludmFsaWQuXG5mdW5jdGlvbiBwYXJzZVN1YnJ1bGUoc3ludGF4U3RyZWFtLCBydWxlcyA9IFtdLCBzdGFydCA9IDApIHtcbiAgbGV0IG1hdGNoID0gUGFyc2VyLmZpbmROZXN0ZWRUb2tlbnMoc3ludGF4U3RyZWFtLCBcIntcIiwgXCJ9XCIsIHN0YXJ0KTtcbiAgbGV0IGFyZ3VtZW50O1xuICBpZiAobWF0Y2guc2xpY2UubGVuZ3RoID09PSAzICYmIG1hdGNoLnNsaWNlWzFdID09PSBcIjpcIikge1xuICAgIGFyZ3VtZW50ID0gbWF0Y2guc2xpY2VbMF07XG4gICAgbWF0Y2guc2xpY2UgPSBtYXRjaC5zbGljZS5zbGljZSgyKTtcbiAgfVxuICBpZiAobWF0Y2guc2xpY2UubGVuZ3RoID4gMSkgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBDYW4ndCBwcm9jZXNzIHJ1bGVzIHdpdGggbW9yZSB0aGFuIG9uZSBydWxlIG5hbWU6IHske21hdGNoLnNsaWNlLmpvaW4oXCJcIil9fWApO1xuXG4gIGxldCBwYXJhbXMgPSB7IHN1YnJ1bGU6IG1hdGNoLnNsaWNlWzBdIH07XG5cbiAgLy8gc2VlIGlmIHRoZXJlJ3MgYSBgbm90YCBydWxlIGluIHRoZXJlXG4gIGxldCBiYW5nUG9zaXRpb24gPSBwYXJhbXMuc3VicnVsZS5pbmRleE9mKFwiIVwiKTtcbiAgaWYgKGJhbmdQb3NpdGlvbiAhPT0gLTEpIHtcbiAgICBwYXJhbXMubm90ID0gcGFyYW1zLnN1YnJ1bGUuc3Vic3RyKGJhbmdQb3NpdGlvbiArIDEpO1xuICAgIHBhcmFtcy5zdWJydWxlID0gcGFyYW1zLnN1YnJ1bGUuc3Vic3RyKDAsIGJhbmdQb3NpdGlvbik7XG4gIH1cblxuICBsZXQgcnVsZSA9IG5ldyBSdWxlLlN1YnJ1bGUocGFyYW1zKTtcbiAgaWYgKGFyZ3VtZW50KSBydWxlLmFyZ3VtZW50ID0gYXJndW1lbnQ7XG4gIHJldHVybiBbIHJ1bGUsIG1hdGNoLmVuZCBdO1xufVxuXG4vLyBNYXRjaCBsaXN0IGV4cHJlc3Npb24gYFs8aXRlbT48ZGVsaW1pdGVyPl1gIG9yIGBbPGFyZ3VtZW50Pjo8aXRlbT48ZGVsaW1pdGVyPl1gIGluIHN5bnRheCBydWxlcy5cbi8vIFJldHVybnMgYFsgcnVsZSwgZW5kIF1gXG4vLyBUaHJvd3MgaWYgaW52YWxpZC5cbmZ1bmN0aW9uIHBhcnNlTGlzdChzeW50YXhTdHJlYW0sIHJ1bGVzID0gW10sIHN0YXJ0ID0gMCwgY29uc3RydWN0b3IgPSBSdWxlLkxpc3QpIHtcbiAgbGV0IHsgZW5kLCBzbGljZSB9ID0gUGFyc2VyLmZpbmROZXN0ZWRUb2tlbnMoc3ludGF4U3RyZWFtLCBcIltcIiwgXCJdXCIsIHN0YXJ0KTtcblxuICAvLyBnZXQgYXJndW1lbnQgaWYgc3VwcGxpZWRcbiAgbGV0IGFyZ3VtZW50O1xuICBpZiAoc2xpY2UubGVuZ3RoID4gMiAmJiBzbGljZVsxXSA9PT0gXCI6XCIpIHtcbiAgICBhcmd1bWVudCA9IHNsaWNlWzBdO1xuICAgIHNsaWNlID0gc2xpY2Uuc2xpY2UoMik7XG4gIH1cblxuICBsZXQgcmVzdWx0cyA9IHBhcnNlU3ludGF4KHNsaWNlLCBbXSk7XG4gIGlmIChyZXN1bHRzLmxlbmd0aCAhPT0gMikge1xuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgVW5leHBlY3RlZCBzdHVmZiBhdCBlbmQgb2YgbGlzdDogWyR7c2xpY2Uuam9pbihcIiBcIil9XWApO1xuICB9XG4gIGxldCBbIGl0ZW0sIGRlbGltaXRlciBdID0gcmVzdWx0cztcblxuICBsZXQgcnVsZSA9IG5ldyBjb25zdHJ1Y3Rvcih7IGl0ZW0sIGRlbGltaXRlciB9KTtcbiAgaWYgKGFyZ3VtZW50KSBydWxlLmFyZ3VtZW50ID0gYXJndW1lbnQ7XG4gIHJldHVybiBbIHJ1bGUsIGVuZCBdO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL1J1bGVTeW50YXguanMiLCJpbXBvcnQgeyBnZXRUYWJzIH0gZnJvbSBcIi4vdXRpbHMvc3RyaW5nXCI7XG5cbi8vIEdSUlIuLi4gbm9kZSBkb2Vzbid0IGluY2x1ZGUgdGhpcz8/P1xuLy8gQ0hFQ0sgRElGRkVSRU5UIE5PREUgVkVSU0lPTlMuLi5cbmlmICghKEFycmF5LnByb3RvdHlwZS5pbmNsdWRlcykpIHtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KEFycmF5LnByb3RvdHlwZSwgXCJpbmNsdWRlc1wiLCB7XG5cdFx0dmFsdWU6IGZ1bmN0aW9uKHZhbHVlLCBzdGFydCkge1xuXHRcdFx0bGV0IGluZGV4ID0gdGhpcy5pbmRleE9mKHZhbHVlLCBzdGFydCk7XG5cdFx0XHRyZXR1cm4gKGluZGV4ICE9PSAtMSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuXG5cbi8vIGB3aGl0ZXNwYWNlYCBjbGFzcyBmb3Igbm9ybWFsIChub24taW5kZW50LCBub24tbmV3bGluZSkgd2hpdGVzcGFjZS5cbmNsYXNzIHdoaXRlc3BhY2Uge1xuXHRjb25zdHJ1Y3Rvcih3aGl0ZXNwYWNlKSB7XG5cdFx0dGhpcy53aGl0ZXNwYWNlID0gd2hpdGVzcGFjZTtcblx0fVxuXG5cdC8vIFJldHVybiB0aGUgXCJsZW5ndGhcIiBvZiB0aGlzIHdoaXRlc3BhY2UsIGVnIGZvciBhbiBpbmRlbnQuXG5cdGdldCBsZW5ndGgoKSB7XG5cdFx0cmV0dXJuIHRoaXMud2hpdGVzcGFjZS5sZW5ndGg7XG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gdGhpcy53aGl0ZXNwYWNlO1xuXHR9XG59XG5cblxuLy8gYGluZGVudGAgY2xhc3MuXG5jbGFzcyBpbmRlbnQgZXh0ZW5kcyB3aGl0ZXNwYWNlIHt9XG5cblxuLy8gTmV3bGluZSBzaW5nbGV0b24uXG5jbGFzcyBuZXdsaW5lIGV4dGVuZHMgd2hpdGVzcGFjZSB7fVxuXG5cbi8vXG4vL1x0IyBUb2tlbml6ZXJcbi8vXHQtIGAudG9rZW5pemUoKWAgXHRcdEJyZWFrcyB1cCBsb25nIHN0cmluZyBpbnRvIHRva2VucywgaW5jbHVkaW5nIG5ld2xpbmVzLCBKU1ggZXhwcmVzc2lvbnMsIGV0Yy5cbi8vXHQtIGAudG9rZW5pemVMaW5lcygpYCBcdFRha2VzIHRoZSBhYm92ZSBhbmQgYnJlYWtzIGl0IGludG8gYW4gYXJyYXkgb2YgYXJyYXlzIGZvciBlYWNoIGxpbmUuXG4vL1xuLy8gVE9ETzogZXJyb3IgY2hlY2tpbmcgLyByZXBvcnRpbmcsIGVzcGVjaWFsbHkgaW4gSlNYIGV4cHJlc3Npb25zLlxuLy8gVE9ETzogaGF2ZSBub3JtYWwgYHRva2VuaXplYCBzdGljayB3aGl0ZXNwYWNlIGVsZW1lbnRzIGluIHRoZSBzdHJlYW0sIHRoZW4gYHRva2VuaXplTGluZXMoKWAgdGFrZXMgdGhlbSBvdXQ/XG5jb25zdCBUb2tlbml6ZXIgPSB7XG5cblx0Ly8gU2hvdWxkIHdlIHdhcm4gYWJvdXQgYW5vbWFsb3VzIGNvbmRpdGlvbnM/XG5cdFdBUk4gOiBmYWxzZSxcblxuXHQvLyBXaGl0ZXNwYWNlIGNvbnN0cnVjdG9yLlxuXHRXaGl0ZXNwYWNlOiB3aGl0ZXNwYWNlLFxuXG5cdC8vIEluZGVudCBjb25zdHJ1Y3RvclxuXHRJbmRlbnQ6IGluZGVudCxcblxuXHQvLyBORVdMSU5FIHNpbmdsZXRvbi5cblx0TkVXTElORTogbmV3IG5ld2xpbmUoXCJcXG5cIiksXG5cblx0Ly8gVG9rZW5pemUgdGV4dCBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgIGludG8gYW4gYXJyYXkgb2YgYHJlc3VsdHNgLCBhbiBhcnJheSBvZjpcblx0Ly9cdC0gYFRva2VuaXplci5ORVdMSU5FYCBmb3IgYSBuZXdsaW5lIHN5bWJvbFxuXHQvL1x0LSBzdHJpbmdzIGZvciBrZXl3b3Jkcy9zeW1ib2xzXG5cdC8vXHQtIG51bWJlcnMgZm9yIG51bWJlciBsaXRlcmFsc1xuXHQvL1x0LSBgeyBpbmRlbnQ6IG51bWJlciB9YCBmb3IgaW5kZW50IGF0IHN0YXJ0IG9mIGxpbmVcblx0Ly9cdC0gYHsgdHlwZTogXCJ0ZXh0XCIsIGxpdGVyYWw6IFwiJ2FiYydcIiwgdGV4dDogXCJhYmNcIiB9XG5cdC8vXHQtIGB7IHR5cGU6IFwiaW5kZW50XCIsIGxldmVsOiA3IH1gXG5cdC8vXHQtIGB7IHR5cGU6IFwiY29tbWVudFwiLCBjb21tZW50OiBcInN0cmluZ1wiLCBjb21tZW50U3ltYm9sLCB3aGl0ZXNwYWNlIH1gXG4vL1RFU1RNRVxuXHR0b2tlbml6ZSh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHQvLyBxdWljayByZXR1cm4gb3V0IG9mIHJhbmdlIG9yIG9ubHkgd2hpdGVzcGFjZVxuXHRcdGlmIChzdGFydCA+PSBlbmQgfHwgIXRleHQudHJpbSgpKSByZXR1cm4gW107XG5cblx0XHRsZXQgdG9rZW5zID0gW107XG5cdFx0Ly8gUHJvY2VzcyBvdXIgdG9wLWxldmVsIHJ1bGVzLlxuXHRcdGxldCBbcmVzdWx0cywgbmV4dFN0YXJ0XSA9IHRoaXMuZWF0VG9rZW5zKHRoaXMubWF0Y2hUb3BUb2tlbnMsIHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGlmIChyZXN1bHRzKSB7XG5cdFx0XHR0b2tlbnMgPSB0b2tlbnMuY29uY2F0KHJlc3VsdHMpO1xuXHRcdFx0c3RhcnQgPSBuZXh0U3RhcnQ7XG5cdFx0fVxuXHRcdGlmIChzdGFydCAhPT0gZW5kKSB7XG5cdFx0XHRpZiAoVG9rZW5pemVyLldBUk4pIGNvbnNvbGUud2FybihcInRva2VuaXplKCk6IGRpZG4ndCBjb25zdW1lOiBgXCIsIHRleHQuc2xpY2Uoc3RhcnQsIGVuZCkgKyBcImBcIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdHM7XG5cdH0sXG5cblx0Ly8gUmVwZWF0ZWRseSBleGVjdXRlIGEgYG1ldGhvZGAgKGJvdW5kIHRvIGB0aGlzKSB3aGljaCByZXR1cm5zIGEgYFtyZXN1bHQsIG5leHRTdGFydF1gIG9yIGB1bmRlZmluZWRgLlxuXHQvLyBQbGFjZXMgbWF0Y2hlZCByZXN1bHRzIHRvZ2V0aGVyIGluIGByZXN1bHRzYCBhcnJheSBhbmQgcmV0dXJucyBgW3Jlc3VsdHMsIG5leHRTdGFydF1gIGZvciB0aGUgZW50aXJlIHNldC5cblx0Ly8gU3RvcHMgaWYgYG1ldGhvZGAgZG9lc24ndCByZXR1cm4gYW55dGhpbmcsIG9yIGlmIGNhbGxpbmcgYG1ldGhvZGAgaXMgdW5wcm9kdWN0aXZlLlxuLy9URVNUTUVcblx0ZWF0VG9rZW5zKG1ldGhvZCwgdGV4dCwgc3RhcnQgPSAwLCBlbmQsIHJlc3VsdHMgPSBbXSkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gcHJvY2VzcyBydWxlcyByZXBlYXRlZGx5IHVudGlsIHdlIGdldCB0byB0aGUgZW5kXG5cdFx0d2hpbGUgKHN0YXJ0IDwgZW5kKSB7XG5cdFx0XHRsZXQgcmVzdWx0ID0gbWV0aG9kLmNhbGwodGhpcywgdGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0XHRpZiAoIXJlc3VsdCkgYnJlYWs7XG5cblx0XHRcdGxldCBbdG9rZW5zLCBuZXh0U3RhcnRdID0gcmVzdWx0O1xuXHRcdFx0Ly8gQmFpbCBpZiB3ZSBkaWRuJ3QgZ2V0IGEgcHJvZHVjdGl2ZSBydWxlIVxuXHRcdFx0aWYgKHN0YXJ0ID09PSBuZXh0U3RhcnQpIGJyZWFrO1xuXG5cdFx0XHQvLyBoYW5kbGUgbmV3UmVzdWx0cyBhcyBhbiBhcnJheSBvciBzaW5nbGUgb2JqZWN0LlxuXHRcdFx0aWYgKHRva2VucyAhPT0gdW5kZWZpbmVkKSByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQodG9rZW5zKTtcblx0XHRcdHN0YXJ0ID0gbmV4dFN0YXJ0O1xuXHRcdH1cblx0XHRyZXR1cm4gW3Jlc3VsdHMsIHN0YXJ0XTtcblx0fSxcblxuXHQvLyBNYXRjaCBhIHNpbmdsZSB0b3AtbGV2ZWwgdG9rZW4gYXQgYHRleHRbc3RhcnRdYC5cbi8vVEVTVE1FXG5cdG1hdGNoVG9wVG9rZW5zKHRleHQsIHN0YXJ0LCBlbmQpIHtcblx0XHRyZXR1cm5cdHRoaXMubWF0Y2hXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaFdvcmQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoTnVtYmVyKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaE5ld2xpbmUodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoSlNYRWxlbWVudCh0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0IHx8IHRoaXMubWF0Y2hUZXh0KHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHQgfHwgdGhpcy5tYXRjaENvbW1lbnQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdCB8fCB0aGlzLm1hdGNoU3ltYm9sKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0O1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBTeW1ib2wgY2hhcmFjdGVyXG5cdC8vXG5cblx0Ly8gTWF0Y2ggdGhlIHNpbmdsZSBcInN5bWJvbFwiIGNoYXJhY3RlciBhdCBgdGV4dFtzdGFydF1gLlxuXHQvLyBOT1RFOiBUaGlzIGRvZXMgbm90IGRvIGFueSBjaGVja2luZywgaXQganVzdCBibGluZGx5IHVzZXMgdGhlIGNoYXJhY3RlciBpbiBxdWVzdGlvbi5cblx0Ly9cdFx0IFlvdSBzaG91bGQgbWFrZSBzdXJlIGFsbCBvdGhlciBwb3NzaWJsZSBydWxlcyBoYXZlIGJlZW4gZXhoYXVzdGVkIGZpcnN0LlxuXHRtYXRjaFN5bWJvbCh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIFt0ZXh0W3N0YXJ0XSwgc3RhcnQgKyAxXVxuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBXaGl0ZXNwYWNlXG5cdC8vXG5cblx0Ly8gUmV0dXJuIHRoZSBmaXJzdCBjaGFyIHBvc2l0aW9uIGFmdGVyIGBzdGFydGAgd2hpY2ggaXMgTk9UIGEgd2hpdGVzcGFjZSBjaGFyIChzcGFjZSBvciB0YWIgb25seSkuXG5cdC8vIElmIGB0ZXh0W3N0YXJ0XWAgaXMgbm90IHdoaXRlc3BhY2UsIHJldHVybnMgYHN0YXJ0YCxcblx0Ly9cdHNvIHlvdSBjYW4gY2FsbCB0aGlzIGF0IGFueSB0aW1lIHRvIHNraXAgd2hpdGVzcGFjZSBpbiB0aGUgb3V0cHV0LlxuXHRlYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiBlbmQ7XG5cblx0XHRsZXQgd2hpdGVTcGFjZUVuZCA9IHN0YXJ0O1xuXHRcdHdoaWxlICh3aGl0ZVNwYWNlRW5kIDwgZW5kICYmICh0ZXh0W3doaXRlU3BhY2VFbmRdID09PSBcIiBcIiB8fCB0ZXh0W3doaXRlU3BhY2VFbmRdID09PSBcIlxcdFwiKSkge1xuXHRcdFx0d2hpdGVTcGFjZUVuZCsrO1xuXHRcdH1cblx0XHRyZXR1cm4gd2hpdGVTcGFjZUVuZDtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgV2hpdGVzcGFjZVxuXHQvL1x0Tk9URTogV2hpdGVzcGFjZSBhdCB0aGUgYmVnaW5uaW5nIG9mIGB0ZXh0YCBvciB0aGUgYmVnaW5uaW5nIG9mIGEgbGluZVxuXHQvL1x0XHQgIGlzIGNvbnNpZGVyZWQgYW4gXCJpbmRlbnRcIiBhbmQgd2lsbCBoYXZlIGAuaXNJbmRlbnQgPT09IHRydWVgLlxuXHQvL1xuXG5cdC8vIENvbnZlcnQgYSBydW4gb2Ygc3BhY2VzIGFuZC9vciB0YWJzIGludG8gYSBgVG9rZW5pemVyLldoaXRlc3BhY2VgLlxuXHRtYXRjaFdoaXRlc3BhY2UodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB3aGl0ZXNwYWNlRW5kID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdC8vIGZvcmdldCBpdCBpZiBubyBmb3J3YXJkIG1vdGlvblxuXHRcdGlmICh3aGl0ZXNwYWNlRW5kID09PSBzdGFydCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB3aGl0ZXNwYWNlID0gdGV4dC5zbGljZShzdGFydCwgd2hpdGVzcGFjZUVuZCk7XG5cdFx0bGV0IHRva2VuO1xuXHRcdGlmIChzdGFydCA9PT0gMCB8fCB0ZXh0W3N0YXJ0LTFdID09PSBcIlxcblwiKVxuXHRcdFx0dG9rZW4gPSBuZXcgVG9rZW5pemVyLkluZGVudCh3aGl0ZXNwYWNlKTtcblx0XHRlbHNlXG5cdFx0XHR0b2tlbiA9IG5ldyBUb2tlbml6ZXIuV2hpdGVzcGFjZSh3aGl0ZXNwYWNlKTtcblxuXHRcdHJldHVybiBbdG9rZW4sIHdoaXRlc3BhY2VFbmRdO1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBOZXdsaW5lXG5cdC8vXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgbmV3bGluZSBjaGFyYWN0ZXIgYXQgYHRleHRbc3RhcnRdYC5cblx0Ly8gUmV0dXJucyBgW1Rva2VuaXplci5ORVdMSU5FLCBuZXh0U3RhcnRdYCBvbiBtYXRjaC5cblx0Ly8gT3RoZXJ3aXNlIHJldHVybnMgYHVuZGVmaW5lZGAuXG5cdG1hdGNoTmV3bGluZSh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kIHx8IHRleHRbc3RhcnRdICE9PSBcIlxcblwiKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIFtUb2tlbml6ZXIuTkVXTElORSwgc3RhcnQgKyAxXTtcblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgV29yZFxuXHQvL1xuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIGB3b3JkYCBpbiBgdGV4dGAgYXQgY2hhcmFjdGVyIGBzdGFydGAuXG5cdC8vIFJldHVybnMgYFt3b3JkLCB3b3JkRW5kXWAuXG5cdC8vIFJldHVybnMgYW4gZW1wdHkgYXJyYXkgaWYgY291bGRuJ3QgbWF0Y2ggYSB3b3JkLlxuXHRXT1JEX1NUQVJUOiAvW0EtWmEtel0vLFxuXHRXT1JEX0NIQVIgOiAvXltcXHdfLV0vLFxuXHRtYXRjaFdvcmQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGlmICghdGhpcy5XT1JEX1NUQVJULnRlc3QodGV4dFtzdGFydF0pKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHdvcmRFbmQgPSBzdGFydCArIDE7XG5cdFx0d2hpbGUgKHdvcmRFbmQgPCBlbmQgJiYgdGhpcy5XT1JEX0NIQVIudGVzdCh0ZXh0W3dvcmRFbmRdKSkge1xuXHRcdFx0d29yZEVuZCsrO1xuXHRcdH1cblx0XHRpZiAod29yZEVuZCA9PT0gc3RhcnQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgd29yZCA9IHRleHQuc2xpY2Uoc3RhcnQsIHdvcmRFbmQpO1xuXHRcdHJldHVybiBbd29yZCwgd29yZEVuZF07XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIE51bWJlcnNcblx0Ly9cblxuXHQvLyBFYXQgYSBzaW5nbGUgbnVtYmVyLlxuXHQvLyBSZXR1cm5zIGEgYE51bWJlcmAgaWYgbWF0Y2hlZC5cblx0TlVNQkVSX1NUQVJUOiAvWzAtOS0uXS8sXG5cdE5VTUJFUiA6IC9eLT8oWzAtOV0qXFwuKT9bMC05XSsvLFxuXHRtYXRjaE51bWJlcih0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0aWYgKCF0aGlzLk5VTUJFUl9TVEFSVC50ZXN0KHRleHRbc3RhcnRdKSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBudW1iZXJNYXRjaCA9IHRoaXMubWF0Y2hFeHByZXNzaW9uQXRIZWFkKHRoaXMuTlVNQkVSLCB0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRpZiAoIW51bWJlck1hdGNoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG51bWJlclN0ciA9IG51bWJlck1hdGNoWzBdO1xuXHRcdGxldCBudW1iZXIgPSBwYXJzZUZsb2F0KG51bWJlclN0ciwgMTApO1xuXHRcdHJldHVybiBbbnVtYmVyLCBzdGFydCArIG51bWJlclN0ci5sZW5ndGhdO1xuXHR9LFxuXG5cblx0Ly9cblx0Ly9cdCMjIyBUZXh0IGxpdGVyYWxcblx0Ly9cblxuXHQvLyBFYXQgYSB0ZXh0IGxpdGVyYWwgKHN0YXJ0cy9lbmRzIHdpdGggYCdgIG9yIGBcImApLlxuXHQvLyBSZXR1cm5zIGEgYFRva2VuaXplci5UZXh0YCBpZiBtYXRjaGVkLlxuLy9URVNUTUU6ICBub3Qgc3VyZSB0aGUgZXNjYXBpbmcgbG9naWMgaXMgcmVhbGx5IHJpZ2h0Li4uXG5cdG1hdGNoVGV4dCh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHF1b3RlU3ltYm9sID0gdGV4dFtzdGFydF07XG5cdFx0aWYgKHF1b3RlU3ltYm9sICE9PSAnXCInICYmIHF1b3RlU3ltYm9sICE9PSBcIidcIikgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCB0ZXh0RW5kID0gc3RhcnQgKyAxO1xuXHRcdHdoaWxlICh0ZXh0RW5kIDwgZW5kKSB7XG5cdFx0XHRsZXQgY2hhciA9IHRleHRbdGV4dEVuZF07XG5cdFx0XHRpZiAoY2hhciA9PT0gcXVvdGVTeW1ib2wpIGJyZWFrO1xuXHRcdFx0Ly8gaWYgd2UgZ2V0IGEgYmFja3F1b3RlLCBpZ25vcmUgcXVvdGUgaW4gbmV4dCBjaGFyXG5cdFx0XHRpZiAoY2hhciA9PT0gXCJcXFxcXCIgJiYgdGV4dFt0ZXh0RW5kICsgMV0gPT09IHF1b3RlU3ltYm9sKSB0ZXh0RW5kKys7XG5cdFx0XHR0ZXh0RW5kKys7XG5cdFx0fVxuXHRcdC8vIEZvcmdldCBpdCBpZiB3ZSBkaWRuJ3QgZW5kIHdpdGggdGhlIHF1b3RlIHN5bWJvbFxuXHRcdGlmICh0ZXh0W3RleHRFbmRdICE9PSBxdW90ZVN5bWJvbCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHQvLyBhZHZhbmNlIHBhc3QgZW5kIHF1b3RlXG5cdFx0dGV4dEVuZCsrO1xuXG5cdFx0bGV0IHF1b3RlZFN0cmluZyA9IHRleHQuc2xpY2Uoc3RhcnQsIHRleHRFbmQpO1xuXHRcdGxldCB0b2tlbiA9IG5ldyBUb2tlbml6ZXIuVGV4dChxdW90ZWRTdHJpbmcpO1xuXHRcdHJldHVybiBbdG9rZW4sIHRleHRFbmRdO1xuXHR9LFxuXG5cdC8vIGBUZXh0YCBjbGFzcyBmb3Igc3RyaW5nIGxpdGVyYWxzLlxuXHQvLyBQYXNzIHRoZSBsaXRlcmFsIHZhbHVlLCB1c2UgYC50ZXh0YCB0byBnZXQganVzdCB0aGUgYml0IGluc2lkZSB0aGUgcXVvdGVzLlxuXHRUZXh0IDogY2xhc3MgdGV4dCB7XG5cdFx0Y29uc3RydWN0b3IocXVvdGVkU3RyaW5nKSB7XG5cdFx0XHR0aGlzLnF1b3RlZFN0cmluZyA9IHF1b3RlZFN0cmluZztcblx0XHR9XG5cdFx0Z2V0IHRleHQoKSB7XG5cdFx0XHRsZXQgc3RyaW5nID0gdGhpcy5xdW90ZWRTdHJpbmc7XG5cdFx0XHQvLyBjYWxjdWxhdGUgYHRleHRgIGFzIHRoZSBiaXRzIGJldHdlZW4gdGhlIHF1b3Rlcy5cblx0XHRcdGxldCBzdGFydCA9IDA7XG5cdFx0XHRsZXQgZW5kID0gc3RyaW5nLmxlbmd0aDtcblx0XHRcdGlmIChzdHJpbmdbc3RhcnRdID09PSAnXCInIHx8IHN0cmluZ1tzdGFydF0gPT09IFwiJ1wiKSBzdGFydCA9IDE7XG5cdFx0XHRpZiAoc3RyaW5nW2VuZC0xXSA9PT0gJ1wiJyB8fCBzdHJpbmdbZW5kLTFdID09PSBcIidcIikgZW5kID0gLTE7XG5cdFx0XHRyZXR1cm4gc3RyaW5nLnNsaWNlKHN0YXJ0LCBlbmQpO1xuXHRcdH1cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdHJldHVybiB0aGlzLnF1b3RlZFN0cmluZztcblx0XHR9XG5cdH0sXG5cblx0Ly9cblx0Ly9cdCMjIyBDb21tZW50c1xuXHQvL1xuXG5cdC8vIEVhdCBhIGNvbW1lbnQgKHVudGlsIHRoZSBlbmQgb2YgdGhlIGxpbmUpLlxuXHQvLyBSZXR1cm5zIGEgYFRva2VuaXplci5Db21tZW50YCBpZiBtYXRjaGVkLlxuXHRDT01NRU5UIDogL14oIyMrfC0tK3xcXC9cXC8rKShcXHMqKSguKikvLFxuXHRtYXRjaENvbW1lbnQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBjb21tZW50U3RhcnQgPSB0ZXh0LnNsaWNlKHN0YXJ0LCBzdGFydCArIDIpO1xuXHRcdGlmIChjb21tZW50U3RhcnQgIT09IFwiLS1cIiAmJiBjb21tZW50U3RhcnQgIT09IFwiXFwvXFwvXCIgJiYgY29tbWVudFN0YXJ0ICE9PSBcIiMjXCIpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBjb21tZW50IGVhdHMgdW50aWwgdGhlIGVuZCBvZiB0aGUgbGluZVxuXHRcdGxldCBsaW5lID0gdGhpcy5nZXRMaW5lQXRIZWFkKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGxldCBjb21tZW50TWF0Y2ggPSBsaW5lLm1hdGNoKHRoaXMuQ09NTUVOVClcblx0XHRpZiAoIWNvbW1lbnRNYXRjaCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBbbWF0Y2gsIGNvbW1lbnRTeW1ib2wsIHdoaXRlc3BhY2UsIGNvbW1lbnRdID0gY29tbWVudE1hdGNoO1xuXHRcdGxldCB0b2tlbiA9IG5ldyBUb2tlbml6ZXIuQ29tbWVudCh7IGNvbW1lbnRTeW1ib2wsIHdoaXRlc3BhY2UsIGNvbW1lbnQgfSk7XG5cdFx0cmV0dXJuIFt0b2tlbiwgc3RhcnQgKyBsaW5lLmxlbmd0aF07XG5cdH0sXG5cblx0Ly8gQ29tbWVudCBjbGFzc1xuLy9URVNUTUVcblx0Q29tbWVudCA6IGNsYXNzIGNvbW1lbnQge1xuXHRcdGNvbnN0cnVjdG9yIChwcm9wcykge1xuXHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBwcm9wcyk7XG5cdFx0fVxuXHRcdHRvU3RyaW5nKCkge1xuXHRcdFx0cmV0dXJuIGAke3RoaXMuY29tbWVudFN5bWJvbH0ke3RoaXMud2hpdGVzcGFjZX0ke3RoaXMuY29tbWVudH1gO1xuXHRcdH1cblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgSlNYXG5cdC8vXG5cblx0Ly8gRWF0IGEgKG5lc3RlZCkgSlNYIGV4cHJlc3Npb24uXG4vL1RFU1RNRVxuXHRtYXRjaEpTWEVsZW1lbnQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XSA9IHRoaXMubWF0Y2hKU1hTdGFydFRhZyh0ZXh0LCBzdGFydCwgZW5kKSB8fCBbXTtcblx0XHRpZiAoIWpzeEVsZW1lbnQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRpZiAoIWpzeEVsZW1lbnQuaXNVbmFyeVRhZykge1xuXHRcdFx0bGV0IFtjaGlsZHJlbiwgY2hpbGRFbmRdID0gdGhpcy5tYXRjaEpTWENoaWxkcmVuKGpzeEVsZW1lbnQudGFnTmFtZSwgdGV4dCwgbmV4dFN0YXJ0LCBlbmQpO1xuXHRcdFx0aWYgKGNoaWxkcmVuLmxlbmd0aCkge1xuXHRcdFx0XHRqc3hFbGVtZW50LmNoaWxkcmVuID0gY2hpbGRyZW47XG5cdFx0XHRcdG5leHRTdGFydCA9IGNoaWxkRW5kO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XTtcblx0fSxcblxuXHQvLyBNYXRjaCBKU1ggc3RhcnQgdGFnIGFuZCBpbnRlcm5hbCBlbGVtZW50cyAoYnV0IE5PVCBjaGlsZHJlbikuXG5cdC8vIFJldHVybnMgYFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdYCBvciBgdW5kZWZpbmVkYC5cblx0Ly8gVXNlIGBtYXRjaEpTWEVsZW1lbnQoKWAgdG8gbWF0Y2ggY2hpbGRyZW4sIGVuZCB0YWcsIGV0Yy5cblx0Ly8gSWdub3JlcyBsZWFkaW5nIHdoaXRlc3BhY2UuXG5cdEpTWF9UQUdfU1RBUlQgOiAvXjwoW0EtWmEtel1bXFx3LVxcLl0qKShcXHMqXFwvPnxcXHMqPnxcXHMrKS8sXG4vLyBUT0RPOiBjbGVhbiB0aGlzIHN0dWZmIHVwLCBtYXliZSB3aXRoIGZpbmRGaXJzdEF0SGVhZD9cblx0bWF0Y2hKU1hTdGFydFRhZyh0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG5leHRTdGFydCA9IHRoaXMuZWF0V2hpdGVzcGFjZSh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHQvLyBNYWtlIHN1cmUgd2Ugc3RhcnQgd2l0aCBgPGAuXG5cdFx0aWYgKHRleHRbbmV4dFN0YXJ0XSAhPT0gXCI8XCIpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgdGFnTWF0Y2ggPSB0aGlzLm1hdGNoRXhwcmVzc2lvbkF0SGVhZCh0aGlzLkpTWF9UQUdfU1RBUlQsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRpZiAoIXRhZ01hdGNoKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IFsgbWF0Y2hUZXh0LCB0YWdOYW1lLCBlbmRCaXQgXSA9IHRhZ01hdGNoO1xuXHRcdGxldCBqc3hFbGVtZW50ID0gbmV3IFRva2VuaXplci5KU1hFbGVtZW50KHRhZ05hbWUpO1xuXHRcdG5leHRTdGFydCA9IG5leHRTdGFydCArIG1hdGNoVGV4dC5sZW5ndGg7XG5cblx0XHQvLyBJZiB1bmFyeSB0YWcsIG1hcmsgYXMgc3VjaCBhbmQgcmV0dXJuLlxuXHRcdGVuZEJpdCA9IGVuZEJpdC50cmltKCk7XG5cdFx0aWYgKGVuZEJpdCA9PT0gXCIvPlwiKSB7XG5cdFx0XHRqc3hFbGVtZW50LmlzVW5hcnlUYWcgPSB0cnVlO1xuXHRcdFx0cmV0dXJuIFtqc3hFbGVtZW50LCBuZXh0U3RhcnRdO1xuXHRcdH1cblxuXHRcdC8vIElmIHdlIGRpZG4ndCBpbW1lZGlhdGVseSBnZXQgYW4gZW5kIG1hcmtlciwgYXR0ZW1wdCB0byBtYXRjaCBhdHRyaWJ1dGVzXG5cdFx0aWYgKGVuZEJpdCAhPT0gXCI+XCIgJiYgZW5kQml0ICE9PSBcIi8+XCIpIHtcblx0XHRcdGxldCBbIGF0dHJzLCBhdHRyRW5kIF0gPSB0aGlzLmVhdFRva2Vucyh0aGlzLm1hdGNoSlNYQXR0cmlidXRlLCB0ZXh0LCBuZXh0U3RhcnQsIGVuZCk7XG5cdFx0XHRqc3hFbGVtZW50LmF0dHJpYnV0ZXMgPSBhdHRycztcblx0XHRcdG5leHRTdGFydCA9IGF0dHJFbmQ7XG5cdFx0fVxuXG5cdFx0Ly8gYXQgdGhpcyBwb2ludCB3ZSBzaG91bGQgZ2V0IGFuIGAvPmAgb3IgYD5gICh3aXRoIG5vIHdoaXRlc3BhY2UpLlxuXHRcdGlmICh0ZXh0W25leHRTdGFydF0gPT09IFwiL1wiICYmIHRleHRbbmV4dFN0YXJ0ICsgMV0gPT09IFwiPlwiKSB7XG5cdFx0XHRlbmRCaXQgPSBcIi8+XCI7XG5cdFx0XHRuZXh0U3RhcnQgKz0gMjtcblx0XHR9XG5cdFx0ZWxzZSBpZiAodGV4dFtuZXh0U3RhcnRdID09PSBcIj5cIikge1xuXHRcdFx0ZW5kQml0ID0gdGV4dFtuZXh0U3RhcnRdO1xuXHRcdFx0bmV4dFN0YXJ0ICs9IDE7XG5cdFx0fVxuXG5cdFx0Ly8gUmV0dXJuIGltbWVkaWF0ZWx5IGZvciB1bmFyeSB0YWdcblx0XHRpZiAoZW5kQml0ID09PSBcIi8+XCIpIHtcblx0XHRcdGpzeEVsZW1lbnQuaXNVbmFyeVRhZyA9IHRydWU7XG5cdFx0XHRyZXR1cm4gW2pzeEVsZW1lbnQsIG5leHRTdGFydF07XG5cdFx0fVxuXG5cdFx0Ly8gYWR2YW5jZSBwYXN0IGA+YFxuXHRcdGlmIChlbmRCaXQgIT09IFwiPlwiKSB7XG5cdFx0XHRpZiAoVG9rZW5pemVyLldBUk4pIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKFwiTWlzc2luZyBleHBlY3RlZCBlbmQgYD5gIGZvciBqc3hFbGVtZW50XCIsIGpzeEVsZW1lbnQsIFwiYFwiK3RleHQuc2xpY2Uoc3RhcnQsIG5leHRTdGFydCkrXCJgXCIpO1xuXHRcdFx0fVxuXHRcdFx0anN4RWxlbWVudC5lcnJvciA9IFwiTm8gZW5kID5cIjtcblx0XHRcdHJldHVybiBbanN4RWxlbWVudCwgbmV4dFN0YXJ0XTtcblx0XHR9XG5cblx0XHRyZXR1cm4gW2pzeEVsZW1lbnQsIG5leHRTdGFydF07XG5cdH0sXG5cblxuXHQvLyBKU1ggZWxlbWVudCBjbGFzc1xuXHRKU1hFbGVtZW50IDogY2xhc3MganN4RWxlbWVudCB7XG5cdFx0Y29uc3RydWN0b3IodGFnTmFtZSwgYXR0cmlidXRlcywgY2hpbGRyZW4pIHtcblx0XHRcdHRoaXMudGFnTmFtZSA9IHRhZ05hbWU7XG5cdFx0XHRpZiAoYXR0cmlidXRlcykgdGhpcy5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcblx0XHRcdGlmIChjaGlsZHJlbikgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuXHRcdH1cblxuXHRcdC8vIFJldHVybiBhdHRyaWJ1dGVzIGFzIGEgbWFwLlxuLy9URVNUTUVcblx0XHRnZXQgYXR0cnMoKSB7XG5cdFx0XHRsZXQgYXR0cnMgPSB7fTtcblx0XHRcdGlmICh0aGlzLmF0dHJpYnV0ZXMpIHRoaXMuYXR0cmlidXRlcy5mb3JFYWNoKGF0dHIgPT4ge1xuXHRcdFx0XHQvLyBpZ25vcmUgdW5uYW1lZCBhdHRyaWJ1dGVzXG5cdFx0XHRcdGlmIChhdHRyLm5hbWUpIGF0dHJzW2F0dHIubmFtZV0gPSBhdHRyLnZhbHVlXG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBhdHRycztcblx0XHR9XG5cblx0XHQvLyBSZXR1cm4gb3VyIGF0dHJpYnV0ZXMgYXMgYSBzdHJpbmdcbi8vVEVTVE1FXG5cdFx0Z2V0IGF0dHJzQXNTdHJpbmcoKSB7XG5cdFx0XHRpZiAoIXRoaXMuYXR0cmlidXRlcykgcmV0dXJuIFwiXCI7XG5cdFx0XHRyZXR1cm4gXCIgXCIgKyB0aGlzLmF0dHJpYnV0ZXMubWFwKCAoeyBuYW1lLCB2YWx1ZSB9KSA9PiB7XG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gbmFtZTtcblx0XHRcdFx0Ly8gY29udmVydCB2YWx1ZSBhcnJheSAodG9rZW5zKSB0byBzdHJpbmdcblx0XHRcdFx0Ly8gVE9ETzogdGhpcyB3aWxsIHdhbnQgdG8gYmUgc21hcnRlci4uLlxuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHZhbHVlID0gYHske3ZhbHVlLmpvaW4oXCIgXCIpfX1gO1xuXHRcdFx0XHRyZXR1cm4gYG5hbWU9JHt2YWx1ZX1gO1xuXHRcdFx0fSkuam9pbihcIiBcIik7XG5cdFx0fVxuXG5cdFx0Ly8gUmV0dXJuIG91ciBjaGlsZHJlbiBhcyBhIHN0cmluZy5cbi8vVEVTVE1FXG5cdFx0Z2V0IGNoaWxkcmVuQXNTdHJpbmcoKSB7XG5cdFx0XHRpZiAoIXRoaXMuY2hpbGRyZW4pIHJldHVybiBcIlwiO1xuXHRcdFx0cmV0dXJuIHRoaXMuY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY2hpbGQpKSByZXR1cm4gYHske2NoaWxkLmpvaW4oXCIgXCIpfX1gO1xuXHRcdFx0XHRyZXR1cm4gXCJcIiArIGNoaWxkO1xuXHRcdFx0fSkuam9pbihcIlwiKTtcblx0XHR9XG5cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdGxldCBhdHRycyA9IHRoaXMuYXR0cnNBc1N0cmluZztcblx0XHRcdGxldCBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW5Bc1N0cmluZztcblx0XHRcdGlmICh0aGlzLmlzVW5hcnlUYWcpIHJldHVybiBgPCR7dGhpcy50YWdOYW1lfSR7YXR0cnN9Lz5gO1xuXHRcdFx0cmV0dXJuIGA8JHt0aGlzLnRhZ05hbWV9JHthdHRyc30+JHtjaGlsZHJlbn08LyR7dGhpcy50YWdOYW1lfT5gO1xuXHRcdH1cblx0fSxcblxuXG5cdC8vXG5cdC8vXHQjIyMgSlNYIGNoaWxkcmVuXG5cdC8vXG5cblx0Ly8gTWF0Y2ggSlNYIGVsZW1lbnQgY2hpbGRyZW4gb2YgYDx0YWdOYW1lPmAgYXQgYHRleHRbc3RhcnRdYC5cblx0Ly8gTWF0Y2hlcyBuZXN0ZWQgY2hpbGRyZW4gYW5kIHN0b3BzIGFmdGVyIG1hdGNoaW5nIGVuZCB0YWc6IGA8L3RhZ05hbWU+YC5cblx0Ly8gUmV0dXJucyBgW2NoaWxkcmVuLCBuZXh0U3RhcnRdYC5cbi8vVEVTVE1FXG5cdG1hdGNoSlNYQ2hpbGRyZW4odGFnTmFtZSwgdGV4dCwgc3RhcnQsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IGNoaWxkcmVuID0gW107XG5cdFx0bGV0IG5lc3RpbmcgPSAxO1xuXHRcdGxldCBlbmRUYWcgPSBgPC8ke3RhZ05hbWV9PmA7XG5cblx0XHRsZXQgbmV4dFN0YXJ0ID0gc3RhcnQ7XG5cdFx0d2hpbGUodHJ1ZSkge1xuXHRcdFx0bGV0IHJlc3VsdCA9IHRoaXMubWF0Y2hKU1hDaGlsZChlbmRUYWcsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRcdGlmICghcmVzdWx0KSBicmVhaztcblxuXHRcdFx0bGV0IFtjaGlsZCwgY2hpbGRFbmRdID0gcmVzdWx0O1xuXHRcdFx0bmV4dFN0YXJ0ID0gY2hpbGRFbmQ7XG5cdFx0XHQvLyBJZiB3ZSBnb3QgdGhlIGVuZFRhZywgdXBkYXRlIG5lc3RpbmcgYW5kIGJyZWFrIG91dCBvZiBsb29wIGlmIG5lc3RpbmcgIT09IDBcblx0XHRcdGlmIChjaGlsZCA9PT0gZW5kVGFnKSB7XG5cdFx0XHRcdG5lc3RpbmcgLS07XG5cdFx0XHRcdGlmIChuZXN0aW5nID09PSAwKSBicmVhaztcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYgKGNoaWxkKSBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcblx0XHRcdH1cblx0XHR9XG4vLyBUT0RPOiBob3cgdG8gc3VyZmFjZSB0aGlzIGVycm9yPz8/XG5cdFx0aWYgKG5lc3RpbmcgIT09IDApIHtcblx0XHRcdGlmIChUb2tlbml6ZXIuV0FSTikge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oYG1hdGNoSlNYQ2hpbGRyZW4oJHt0ZXh0LnNsaWNlKHN0YXJ0LCBuZXh0U3RhcnQgKyAxMCl9OiBkaWRuJ3QgbWF0Y2ggZW5kIGNoaWxkIWApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gW2NoaWxkcmVuLCBuZXh0U3RhcnRdO1xuXHR9LFxuXG5cdC8vIE1hdGNoIGEgc2luZ2xlIEpTWCBjaGlsZDpcblx0Ly9cdC0gY3VycmVudCBlbmRUYWdcblx0Ly9cdC0gYHsganN4IGV4cHJlc3Npb24gfWBcblx0Ly9cdC0gbmVzdGVkIEpTWCBlbGVtZW50XG5cdC8vXHQtIChhbnl0aGluZyBlbHNlKSBhcyBqc3hUZXh0IGV4cHJlc3Npb24uXG5cdG1hdGNoSlNYQ2hpbGQoZW5kVGFnLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdHJldHVybiB0aGlzLm1hdGNoSlNYRW5kVGFnKGVuZFRhZywgdGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hKU1hFeHByZXNzaW9uKHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoSlNYRWxlbWVudCh0ZXh0LCBzdGFydCwgZW5kKVxuLy8gVE9ETzogbmV3bGluZSBhbmQgaW5kZW50P1xuXHRcdFx0fHwgdGhpcy5tYXRjaEpTWFRleHQodGV4dCwgc3RhcnQsIGVuZCk7XG5cdH0sXG5cblx0Ly8gQXR0ZW1wdCB0byBtYXRjaCBhIHNwZWNpZmljIGVuZCB0YWcuXG5cdC8vIElnbm9yZXMgbGVhZGluZyB3aGl0ZXNwYWNlLlxuXHRtYXRjaEpTWEVuZFRhZyhlbmRUYWcsIHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbmV4dFN0YXJ0ID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGlmICghdGhpcy5tYXRjaFN0cmluZ0F0SGVhZChlbmRUYWcsIHRleHQsIG5leHRTdGFydCwgZW5kKSkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gW2VuZFRhZywgbmV4dFN0YXJ0ICsgZW5kVGFnLmxlbmd0aF07XG5cdH0sXG5cblxuXHQvL1xuXHQvL1x0IyMjIEpTWCBhdHRyaWJ1dGVzXG5cdC8vXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgSlNYIGVsZW1lbnQgYXR0cmlidXRlIGFzIGA8YXR0cj49ezx2YWx1ZT59YFxuLy8gVE9ETzogey4uLnh4eH1cblx0SlNYX0FUVFJJQlVURV9TVEFSVCA6IC9eXFxzKihbXFx3LV0rXFxiKVxccyooPT8pXFxzKi8sXG5cdG1hdGNoSlNYQXR0cmlidXRlKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBhdHRyaWJ1dGVzIG11c3Qgc3RhcnQgd2l0aCBhIHdvcmQgY2hhcmFjdGVyXG5cdFx0aWYgKCF0aGlzLldPUkRfU1RBUlQudGVzdCh0ZXh0W3N0YXJ0XSkpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBhdHRlbXB0IHRvIG1hdGNoIGFuIGF0dHJpYnV0ZSBuYW1lLCBpbmNsdWRpbmcgYD1gIGlmIHByZXNlbnQuXG5cdFx0bGV0IHJlc3VsdCA9IHRoaXMubWF0Y2hFeHByZXNzaW9uQXRIZWFkKHRoaXMuSlNYX0FUVFJJQlVURV9TVEFSVCwgdGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0aWYgKCFyZXN1bHQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgWyBtYXRjaCwgbmFtZSwgZXF1YWxzIF0gPSByZXN1bHQ7XG5cdFx0bGV0IG5leHRTdGFydCA9IHN0YXJ0ICsgbWF0Y2gubGVuZ3RoO1xuXHRcdGxldCBhdHRyaWJ1dGUgPSBuZXcgVG9rZW5pemVyLkpTWEF0dHJpYnV0ZShuYW1lKTtcblxuXHRcdC8vIGlmIHRoZXJlIHdhcyBhbiBlcXVhbHMgY2hhciwgcGFyc2UgdGhlIHZhbHVlXG5cdFx0aWYgKGVxdWFscykge1xuXHRcdFx0bGV0IFt2YWx1ZSwgdmFsdWVFbmRdID0gdGhpcy5tYXRjaEpTWEF0dHJpYnV0ZVZhbHVlKHRleHQsIG5leHRTdGFydCwgZW5kKSB8fCBbXTtcblx0XHRcdGlmICh2YWx1ZSkge1xuXHRcdFx0XHRhdHRyaWJ1dGUudmFsdWUgPSB2YWx1ZTtcblx0XHRcdFx0bmV4dFN0YXJ0ID0gdmFsdWVFbmQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGVhdCB3aGl0ZXNwYWNlIGJlZm9yZSB0aGUgbmV4dCBhdHRyaWJ1dGUgLyB0YWcgZW5kXG5cdFx0bmV4dFN0YXJ0ID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHRyZXR1cm4gW2F0dHJpYnV0ZSwgbmV4dFN0YXJ0XTtcblx0fSxcblxuXHQvLyBNYXRjaCBhIHZhbHVlIGV4cHJlc3Npb24gZm9yIGEgSlNYIGVsZW1lbnQgYXR0cmlidXRlOlxuXHQvLyBOT1RFOiB3ZSB3aWxsIGJlIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlciB0aGUgYD1gIChhbmQgc3Vic2VxdWVudCB3aGl0ZXNwYWNlKS5cblx0bWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZSh0ZXh0LCBzdGFydCwgZW5kKSB7XG5cdFx0cmV0dXJuIHRoaXMubWF0Y2hUZXh0KHRleHQsIHN0YXJ0LCBlbmQpXG5cdFx0XHR8fCB0aGlzLm1hdGNoSlNYRXhwcmVzc2lvbih0ZXh0LCBzdGFydCwgZW5kKVxuXHRcdFx0fHwgdGhpcy5tYXRjaEpTWEVsZW1lbnQodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZUlkZW50aWZpZXIodGV4dCwgc3RhcnQsIGVuZClcblx0XHRcdHx8IHRoaXMubWF0Y2hOdW1iZXIodGV4dCwgc3RhcnQsIGVuZClcblx0XHQ7XG5cdH0sXG5cblx0Ly8gTWF0Y2ggYSBzaW5nbGUgaWRlbnRpZmVyIGFzIGEgSlNYIGF0dHJpYnV0ZSB2YWx1ZS5cblx0Ly8gUmV0dXJucyBhcyBhIGBKU1hFeHByZXNzaW9uYC5cblx0bWF0Y2hKU1hBdHRyaWJ1dGVWYWx1ZUlkZW50aWZpZXIodGV4dCwgc3RhcnQsIGVuZCkge1xuXHRcdGxldCByZXN1bHQgPSB0aGlzLm1hdGNoV29yZCh0ZXh0LCBzdGFydCwgZW5kKTtcblx0XHRpZiAoIXJlc3VsdCkgcmV0dXJuO1xuXG5cdFx0bGV0IFsgd29yZCwgbmV4dFN0YXJ0IF0gPSByZXN1bHQ7XG5cdFx0bGV0IHRva2VuID0gbmV3IFRva2VuaXplci5KU1hFeHByZXNzaW9uKHdvcmQpO1xuXHRcdHJldHVybiBbdG9rZW4sIG5leHRTdGFydF07XG5cdH0sXG5cblx0Ly8gSlNYIGF0dHJpYnV0ZSBjbGFzc1xuXHQvLyBgbmFtZWAgaXMgdGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZS5cblx0Ly8gYHZhbHVlYCBpcyBvbmUgb2Y6XG5cdC8vXHRcdC0gYCcuLi4nYFx0XHRcdC8vIFRleHQgKGxpdGVyYWwgc3RyaW5nKS5cblx0Ly9cdFx0LSBgXCIuLi5cImBcdFx0XHQvLyBUZXh0IChsaXRlcmFsIHN0cmluZykuXG5cdC8vXHRcdC0gYHsuLi59YFx0XHRcdC8vIEV4cHJlc3Npb24uICBSZXN1bHRzIHdpbGwgYmUgdG9rZW5pemVkIGFycmF5LlxuXHQvL1x0XHQtIGA8Li4uLj5gXHRcdFx0Ly8gSlNYIGVsZW1lbnQuXG5cdC8vXHRcdC0gYDFgXHRcdFx0XHQvLyBOdW1iZXIuICBOb3RlOiB0aGlzIGlzIGFuIGV4dGVuc2lvbiB0byBKU1guXG5cblx0SlNYQXR0cmlidXRlIDogY2xhc3MganN4QXR0cmlidXRlIHtcblx0XHRjb25zdHJ1Y3RvcihuYW1lLCB2YWx1ZSkge1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZTtcblx0XHRcdGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB0aGlzLnZhbHVlID0gdmFsdWU7XG5cdFx0fVxuXHRcdHRvU3RyaW5nKCkge1xuXHRcdFx0aWYgKHRoaXMudmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHRoaXMubmFtZTtcblx0XHRcdHJldHVybiBgJHt0aGlzLm5hbWV9PXske3RoaXMudmFsdWV9fWA7XG5cdFx0fVxuXHR9LFxuXG5cblx0Ly8gTWF0Y2ggYSBKU1ggZXhwcmVzc2lvbiBlbmNsb3NlZCBpbiBjdXJseSBicmFjZXMsIGVnOiAgYHsgLi4uIH1gLlxuXHQvLyAgSGFuZGxlcyBuZXN0ZWQgY3VybGllcywgcXVvdGVzLCBldGMuXG5cdC8vIFJldHVybnMgYXJyYXkgb2YgdG9rZW5zIG9mIGludGVybmFsIG1hdGNoLlxuXHQvLyBJZ25vcmVzIGxlYWRpbmcgd2hpdGVzcGFjZS5cbi8vVE9ETzogbmV3bGluZXMvaW5kZW50cz8/P1xuLy9UT0RPOiB7Li4ueHh4fVxuLy9URVNUTUVcblx0bWF0Y2hKU1hFeHByZXNzaW9uKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbmV4dFN0YXJ0ID0gdGhpcy5lYXRXaGl0ZXNwYWNlKHRleHQsIHN0YXJ0LCBlbmQpO1xuXHRcdGxldCBlbmRJbmRleCA9IHRoaXMuZmluZE1hdGNoaW5nQXRIZWFkKFwie1wiLCBcIn1cIiwgdGV4dCwgbmV4dFN0YXJ0LCBlbmQpO1xuXHRcdGlmIChlbmRJbmRleCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gR2V0IGNvbnRlbnRzLCBpbmNsdWRpbmcgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZS5cblx0XHRsZXQgY29udGVudHMgPSB0ZXh0LnNsaWNlKHN0YXJ0ICsgMSwgZW5kSW5kZXgpO1xuXG5cdFx0Ly8gcmV0dXJuIGEgbmV3IEpTWEV4cHJlc3Npb24sIGFkdmFuY2luZyBiZXlvbmQgdGhlIGVuZGluZyBgfWAuXG5cdFx0bGV0IGV4cHJlc3Npb24gPSBuZXcgVG9rZW5pemVyLkpTWEV4cHJlc3Npb24oY29udGVudHMpO1xuXHRcdHJldHVybiBbZXhwcmVzc2lvbiwgZW5kSW5kZXggKyAxXTtcblx0fSxcblxuXHQvLyBKU1ggZXhwcmVzc2lvbiwgY29tcG9zZWQgb2YgaW5saW5lIHRva2VucyB3aGljaCBzaG91bGQgeWllbGQgYW4gYGV4cHJlc3Npb25gLlxuXHRKU1hFeHByZXNzaW9uIDogY2xhc3MganN4RXhwcmVzc2lvbiB7XG5cdFx0Y29uc3RydWN0b3IoY29udGVudHMpIHtcblx0XHRcdHRoaXMuY29udGVudHMgPSBjb250ZW50cyB8fCBcIlwiO1xuXHRcdH1cblx0XHQvLyBEaXZpZGUgY29udGVudHMgaW50byBgdG9rZW5zYC5cblx0XHRnZXQgdG9rZW5zKCkge1xuXHRcdFx0cmV0dXJuIFRva2VuaXplci50b2tlbml6ZSh0aGlzLmNvbnRlbnRzLnRyaW0oKSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8vIE1hdGNoIEpTWFRleHQgdW50aWwgdGhlIG9uZSBvZiBge2AsIGA8YCwgYD5gIG9yIGB9YC5cblx0Ly8gTk9URTogSU5DTFVERVMgbGVhZGluZyAvIHRyYWlsaW5nIHdoaXRlc3BhY2UuXG5cdEpTWF9URVhUX0VORF9DSEFSUyA6IFtcIntcIiwgXCI8XCIsIFwiPlwiLCBcIn1cIl0sXG4vL1RFU1RNRVxuXHRtYXRjaEpTWFRleHQodGV4dCwgc3RhcnQgPSAwLCBlbmQpIHtcblx0XHRpZiAodHlwZW9mIGVuZCAhPT0gXCJudW1iZXJcIiB8fCBlbmQgPiB0ZXh0Lmxlbmd0aCkgZW5kID0gdGV4dC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdC8vIHRlbXBvcmFyaWx5IGFkdmFuY2UgcGFzdCB3aGl0ZXNwYWNlICh3ZSdsbCBpbmNsdWRlIGl0IGluIHRoZSBvdXRwdXQpLlxuXHRcdGxldCBuZXh0U3RhcnQgPSB0aGlzLmVhdFdoaXRlc3BhY2UodGV4dCwgc3RhcnQsIGVuZCk7XG5cdFx0bGV0IGVuZEluZGV4ID0gdGhpcy5maW5kRmlyc3RBdEhlYWQodGhpcy5KU1hfVEVYVF9FTkRfQ0hBUlMsIHRleHQsIG5leHRTdGFydCwgZW5kKTtcblx0XHQvLyBJZiB0aGUgZmlyc3Qgbm9uLXdoaXRlc3BhY2UgY2hhciBpcyBpbiBvdXIgRU5EX0NIQVJTLCBmb3JnZXQgaXQuXG5cdFx0aWYgKGVuZEluZGV4ID09PSBuZXh0U3RhcnQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBpZiBubyBtYXRjaCwgd2UndmUgZ290IHNvbWUgc29ydCBvZiBlcnJvclxuXHRcdGlmIChlbmRJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZiAoVG9rZW5pemVyLldBUk4pIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKFwibWF0Y2hKU1hUZXh0KFwiK3RleHQuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgNTApK1wiKTogSlNYIHNlZW1zIHRvIGJlIHVuYmFsYW5jZWQuXCIpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHQvLyBpbmNsdWRlIGxlYWRpbmcgd2hpdGVzcGFjZSBpbiB0aGUgb3V0cHV0LlxuXHRcdGxldCBqc3hUZXh0ID0gdGV4dC5zbGljZShzdGFydCwgZW5kSW5kZXgpO1xuXHRcdHJldHVybiBbanN4VGV4dCwgZW5kSW5kZXhdO1xuXHR9LFxuXG5cblxuXG5cdC8vXG5cdC8vXHQjIyBVdGlsaXR5IGZ1bmN0aW9uc1xuXHQvL1xuXG5cdC8vIFJldHVybiBjaGFyYWN0ZXJzIHVwIHRvLCBidXQgbm90IGluY2x1ZGluZywgdGhlIG5leHQgbmV3bGluZSBjaGFyIGFmdGVyIGBzdGFydGAuXG5cdC8vIElmIGBzdGFydGAgaXMgYSBuZXdsaW5lIGNoYXIgb3Igc3RhcnQgPj0gZW5kLCByZXR1cm5zIGVtcHR5IHN0cmluZy5cblx0Ly8gSWYgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nIChlZzogbm8gbW9yZSBuZXdsaW5lcyksIHJldHVybnMgZnJvbSBzdGFydCB0byBlbmQuXG4vL1RFU1RNRVxuXHRnZXRMaW5lQXRIZWFkKHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiBcIlwiO1xuXG5cdFx0bGV0IG5ld2xpbmUgPSB0ZXh0LmluZGV4T2YoXCJcXG5cIiwgc3RhcnQpO1xuXHRcdGlmIChuZXdsaW5lID09PSAtMSB8fCBuZXdsaW5lID4gZW5kKSBuZXdsaW5lID0gZW5kO1xuXHRcdHJldHVybiB0ZXh0LnNsaWNlKHN0YXJ0LCBuZXdsaW5lKTtcblx0fSxcblxuXHQvLyBNYXRjaCBhIG11bHRpLWNoYXIgc3RyaW5nIHN0YXJ0aW5nIGF0IGB0ZXh0W3N0YXJ0XWAuXG4vL1RFU1RNRVxuXHRtYXRjaFN0cmluZ0F0SGVhZChzdHJpbmcsIHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgc3RyaW5nRW5kID0gc3RhcnQgKyBzdHJpbmcubGVuZ3RoO1xuXHRcdGlmIChzdHJpbmdFbmQgPiBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHN0cmluZyA9PT0gdGV4dC5zbGljZShzdGFydCwgc3RyaW5nRW5kKTtcblx0fSxcblxuXG5cdC8vIE1hdGNoIGEgcmVndWxhciBleHByZXNzaW9uIHN0YXJ0aW5nIGF0IGB0ZXh0W3N0YXJ0XWAsIHJldHVybmluZyB0aGUgbWF0Y2guXG5cdC8vIFJldHVybnMgYG51bGxgIGlmIG5vIG1hdGNoLlxuXHQvL1xuXHQvLyBOT1RFOiBUaGUgZXhwcmVzc2lvbiBNVVNUIHN0YXJ0IHdpdGggYC9eLi4uL2Bcbi8vVEVTVE1FXG5cdG1hdGNoRXhwcmVzc2lvbkF0SGVhZChleHByZXNzaW9uLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IGhlYWQgPSB0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpO1xuXHRcdHJldHVybiBoZWFkLm1hdGNoKGV4cHJlc3Npb24pO1xuXHR9LFxuXG5cdC8vIEZpbmQgaW5kZXggb2YgdGhlIG1hdGNoaW5nIFNJTkdMRSBDSEFSQUNURVIgYGVuZERlbGltaXRlcmAgdG8gbWF0Y2ggYHN0YXJ0RGVsaW1pdGVyYC5cblx0Ly8gTWF0Y2hlcyBuZXN0ZWQgZGVsaW1pdGVycyBhbmQgaGFuZGxlcyBlc2NhcGVkIGRlbGltaXRlcnMuXG5cdC8vIEFzc3VtZXMgYHRleHRbc3RhcnRdYCBpcyB0aGUgc3RhcnREZWxpbWl0ZXIhXG5cdC8vIFJldHVybnMgbnVtZXJpYyBpbmRleCBvciBgdW5kZWZpbmVkYCBpZiBubyBtYXRjaCBvciBpZiBmaXJzdCBjaGFyIGlzIG5vdCBgc3RhcnREZWxpbWl0ZXJgLlxuXHQvL1xuXHQvL1x0QWxzbyBoYW5kbGVzIG5lc3RlZCBxdW90ZXMgLS0gaWYgd2UgZW5jb3VudGVyIGEgc2luZ2xlIG9yIGRvdWJsZSBxdW90ZSxcblx0Ly9cdFx0d2UnbGwgc2tpcCBzY2FubmluZyB1bnRpbCB3ZSBmaW5kIGEgbWF0Y2hpbmcgcXVvdGUuXG5cdC8vXG5cdC8vXHRlZzogIGBmaW5kTWF0Y2hpbmdBdEhlYWQoXCJ7XCIsIFwifVwiLCBcInthYXthfWFhfVwiKWAgPT4gOFxuLy9URVNUTUVcblx0ZmluZE1hdGNoaW5nQXRIZWFkKHN0YXJ0RGVsaW1pdGVyLCBlbmREZWxpbWl0ZXIsIHRleHQsIHN0YXJ0ID0gMCwgZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBlbmQgIT09IFwibnVtYmVyXCIgfHwgZW5kID4gdGV4dC5sZW5ndGgpIGVuZCA9IHRleHQubGVuZ3RoO1xuXHRcdGlmIChzdGFydCA+PSBlbmQpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRpZiAodGV4dFtzdGFydF0gIT09IHN0YXJ0RGVsaW1pdGVyKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG5lc3RpbmcgPSAwO1xuXHRcdGxldCBjdXJyZW50ID0gc3RhcnQ7XG5cdFx0d2hpbGUgKGN1cnJlbnQgPCBlbmQpIHtcblx0XHRcdGxldCBjaGFyID0gdGV4dFtjdXJyZW50XTtcblx0XHRcdC8vIGlmIHN0YXJ0RGVsaW1pdGVyLCBpbmNyZWFzZSBuZXN0aW5nXG5cdFx0XHRpZiAoY2hhciA9PT0gc3RhcnREZWxpbWl0ZXIpIHtcblx0XHRcdFx0bmVzdGluZysrO1xuXHRcdFx0fVxuXHRcdFx0Ly8gaWYgZW5kRGVsaW1pdGVyLCBkZWNyZWFzZSBuZXN0aW5nIGFuZCByZXR1cm4gaWYgbmVzdGluZyBiYWNrIHRvIDBcblx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IGVuZERlbGltaXRlcikge1xuXHRcdFx0XHRuZXN0aW5nLS07XG5cdFx0XHRcdGlmIChuZXN0aW5nID09PSAwKSByZXR1cm4gY3VycmVudDtcblx0XHRcdH1cblx0XHRcdC8vIGlmIGEgc2luZ2xlIG9yIGRvdWJsZSBxdW90ZSwgc2tpcCB1bnRpbCB0aGUgbWF0Y2hpbmcgcXVvdGVcblx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFwiJ1wiIHx8IGNoYXIgPT09ICdcIicpIHtcblx0XHRcdFx0bGV0IFt0b2tlbiwgYWZ0ZXJRdW90ZV0gPSB0aGlzLm1hdGNoVGV4dCh0ZXh0LCBjdXJyZW50LCBlbmQpIHx8IFtdO1xuXHRcdFx0XHRjdXJyZW50ID0gYWZ0ZXJRdW90ZTtcblx0XHRcdFx0Y29udGludWU7XHQvLyBjb250aW51ZSBzbyB3ZSBkb24ndCBhZGQgMSB0byBjdXJlbnQgYmVsb3dcblx0XHRcdH1cblx0XHRcdC8vIElmIGJhY2tzbGFzaCwgc2tpcCBhbiBleHRyYSBjaGFyIGlmIGl0J3MgZWl0aGVyIGRlbGltaXRlciBvciBhIHF1b3RlXG5cdFx0XHRlbHNlIGlmIChjaGFyID09PSBcIlxcXFxcIikge1xuXHRcdFx0XHRjaGFyID0gdGV4dFtjdXJyZW50ICsgMV07XG5cdFx0XHRcdGlmIChjaGFyID09PSBzdGFydERlbGltaXRlclxuXHRcdFx0XHQgfHwgY2hhciA9PT0gZW5kRGVsaW1pdGVyXG5cdFx0XHRcdCB8fCBjaGFyID09PSBcIidcIlxuXHRcdFx0XHQgfHwgY2hhciA9PT0gJ1wiJ1xuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRjdXJyZW50Kys7O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjdXJyZW50Kys7XG5cdFx0fVxuXHR9LFxuXG5cblx0Ly8gUmV0dXJuIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgTk9OLUVTQ0FQRUQgY2hhcmFjdGVyIGluIGBjaGFyc2AgYWZ0ZXIgYHRleHRbc3RhcnRdYC5cblx0Ly8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiB3ZSBkaWRuJ3QgZmluZCBhIG1hdGNoLlxuLy9URVNUTUVcblx0ZmluZEZpcnN0QXRIZWFkKGNoYXJzLCB0ZXh0LCBzdGFydCA9IDAsIGVuZCkge1xuXHRcdGlmICh0eXBlb2YgZW5kICE9PSBcIm51bWJlclwiIHx8IGVuZCA+IHRleHQubGVuZ3RoKSBlbmQgPSB0ZXh0Lmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPj0gZW5kKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0d2hpbGUgKHN0YXJ0IDwgZW5kKSB7XG5cdFx0XHRsZXQgY2hhciA9IHRleHRbc3RhcnRdO1xuXHRcdFx0aWYgKGNoYXJzLmluY2x1ZGVzKGNoYXIpKSByZXR1cm4gc3RhcnQ7XG5cdFx0XHQvLyBpZiB3ZSBnb3QgYW4gZXNjYXBlIGNoYXIsIGlnbm9yZSB0aGUgbmV4dCBjaGFyIGlmIGl0J3MgaW4gYGNoYXJzYFxuXHRcdFx0aWYgKGNoYXIgPT09IFwiXFxcXFwiICYmIGNoYXJzLmluY2x1ZGVzKHRleHRbc3RhcnQrMV0pKSBzdGFydCsrO1xuXHRcdFx0c3RhcnQrKztcblx0XHR9XG5cdFx0aWYgKHN0YXJ0ID49IGVuZCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gc3RhcnQ7XG5cdH0sXG5cblxuLy9cbi8vICMjIyBVdGlsaXR5XG4vL1xuXG5cdC8vIEdpdmVuIGEgc2V0IG9mIHRva2Vucywgc2xpY2Ugd2hpdGVzcGFjZSAoaW5kZW50LCBORVdMSU5FIG9yIG5vcm1hbCB3aGl0ZXNwYWNlKSBmcm9tIHRoZSBmcm9udC5cblx0cmVtb3ZlTGVhZGluZ1doaXRlc3BhY2UodG9rZW5zLCBzdGFydCA9IDApIHtcblx0XHR3aGlsZSAodG9rZW5zW3N0YXJ0XSBpbnN0YW5jZW9mIFRva2VuaXplci5XaGl0ZXNwYWNlKSBzdGFydCsrO1xuXHRcdGlmIChzdGFydCA9PT0gMCkgcmV0dXJuIHRva2Vucztcblx0XHRyZXR1cm4gdG9rZW5zLnNsaWNlKHN0YXJ0KTtcblx0fSxcblxuXHQvLyBHaXZlbiBhIHNldCBvZiB0b2tlbnMsIHJlbW92ZSBBTEwgXCJub3JtYWxcIiB3aGl0ZXNwYWNlIHRva2VucyAoTk9UIGluZGVudCBvciBORVdMSU5FKS5cblx0cmVtb3ZlTm9ybWFsV2hpdGVzcGFjZSh0b2tlbnMpIHtcblx0XHRyZXR1cm4gdG9rZW5zLmZpbHRlcih0b2tlbiA9PiAhVG9rZW5pemVyLmlzTm9ybWFsV2hpdGVzcGFjZSh0b2tlbikpO1xuXHR9LFxuXG5cblx0Ly8gUmV0dXJuIGB0cnVlYCBpZiBgdG9rZW5gIGlzIFwibm9ybWFsXCIgd2hpdGVzcGNlIChub3QgYSBuZXdsaW5lIG9yIGluZGVudClcblx0aXNOb3JtYWxXaGl0ZXNwYWNlKHRva2VuKSB7XG5cdFx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgVG9rZW5pemVyLldoaXRlc3BhY2Vcblx0XHRcdCYmICEodG9rZW4gaW5zdGFuY2VvZiBUb2tlbml6ZXIuSW5kZW50KVxuXHRcdFx0JiYgKHRva2VuICE9PSBUb2tlbml6ZXIuTkVXTElORSk7XG5cdH0sXG5cblxuLy9cbi8vICMjIyBCbG9jayAvIGluZGVudCBwcm9jZXNzaW5nXG4vL1xuXG5cdC8vIFNpbXBsZSBibG9jayBjbGFzcyBmb3IgYGJyZWFrSW50b0Jsb2Nrc2AuXG5cdEJsb2NrOiBjbGFzcyBibG9jayB7XG5cdFx0Y29uc3RydWN0b3IocHJvcHMpe1xuXHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBwcm9wcyk7XG5cdFx0XHRpZiAoIXRoaXMuY29udGVudHMpIHRoaXMuY29udGVudHMgPSBbXTtcblx0XHR9XG5cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLCBudWxsLCBcIlxcdFwiKTtcblx0XHR9XG5cdH0sXG5cblx0Ly8gQnJlYWsgdG9rZW5zIGludG8gYW4gYXJyYXkgb2YgYXJyYXlzIGJ5IGBORVdMSU5FYHMuXG5cdC8vIFJldHVybnMgYW4gYXJyYXkgb2YgbGluZXMgV0lUSE9VVCB0aGUgYE5FV0xJTkVgcy5cblx0Ly8gTGluZXMgd2hpY2ggYXJlIGNvbXBvc2VkIHNvbGVseSBvZiB3aGl0ZXNwYWNlIGFyZSB0cmVhdGVkIGFzIGJsYW5rLlxuXHRicmVha0ludG9MaW5lcyh0b2tlbnMpIHtcblx0XHQvLyBDb252ZXJ0IHRvIGxpbmVzLlxuXHRcdGxldCBjdXJyZW50TGluZSA9IFtdO1xuXHRcdGxldCBsaW5lcyA9IFtjdXJyZW50TGluZV07XG5cdFx0dG9rZW5zLmZvckVhY2godG9rZW4gPT4ge1xuXHRcdFx0Ly8gYWRkIG5ldyBhcnJheSBmb3IgZWFjaCBuZXdsaW5lXG5cdFx0XHRpZiAodG9rZW4gPT09IFRva2VuaXplci5ORVdMSU5FKSB7XG5cdFx0XHRcdC8vIGNyZWF0ZSBhIG5ldyBsaW5lIGFuZCBwdXNoIGl0IGluXG5cdFx0XHRcdGN1cnJlbnRMaW5lID0gW107XG5cdFx0XHRcdHJldHVybiBsaW5lcy5wdXNoKGN1cnJlbnRMaW5lKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gb3RoZXJ3aXNlIGp1c3QgYWRkIHRvIHRoZSBjdXJyZW50IGxpbmVcblx0XHRcdGN1cnJlbnRMaW5lLnB1c2godG9rZW4pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQ2xlYXIgYW55IGxpbmVzIHRoYXQgYXJlIG9ubHkgd2hpdGVzcGFjZVxuXHRcdGxpbmVzLmZvckVhY2goKGxpbmUsIGluZGV4KSA9PiB7XG5cdFx0XHRpZiAobGluZS5sZW5ndGggPT09IDEgJiYgbGluZVswXSBpbnN0YW5jZW9mIFRva2VuaXplci5XaGl0ZXNwYWNlKSBsaW5lc1tpbmRleF0gPSBbXTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBsaW5lcztcblx0fSxcblxuXHQvLyBSZXR1cm4gaW5kZW50cyBvZiB0aGUgc3BlY2lmaWVkIGxpbmVzLlxuXHQvLyBJbmRlbnRzIGVtcHR5IGxpbmVzIChORVdMSU5FcykgaW50byB0aGUgYmxvY2sgQUZURVIgdGhleSBhcHBlYXIuXG5cdGdldExpbmVJbmRlbnRzKGxpbmVzLCBkZWZhdWx0SW5kZW50ID0gMCkge1xuXHRcdGlmIChsaW5lcy5sZW5ndGggPT09IDApIHJldHVybiBbXTtcblxuXHRcdGNvbnN0IGluZGVudHMgPSBsaW5lcy5tYXAoVG9rZW5pemVyLmdldExpbmVJbmRlbnQpO1xuXHRcdGNvbnN0IGVuZCA9IGluZGVudHMubGVuZ3RoO1xuXG5cdFx0Ly8gZmlndXJlIG91dCB0aGUgaW5kZW50IG9mIHRoZSBmaXJzdCBub24tZW1wdHkgbGluZVxuXHRcdGxldCBzdGFydEluZGVudCA9IGdldE5leHRJbmRlbnQoMCk7XG5cdFx0aWYgKHN0YXJ0SW5kZW50ID09PSB1bmRlZmluZWQpIHN0YXJ0SW5kZW50ID0gZGVmYXVsdEluZGVudDtcblxuXHRcdC8vIGluZGVudCBibGFuayBsaW5lcyB0byB0aGUgaW5kZW50IEFGVEVSIHRoZW1cblx0XHRmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgZW5kOyBpbmRleCsrKSB7XG5cdFx0XHRpZiAoaW5kZW50c1tpbmRleF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpbmRlbnRzW2luZGV4XSA9IGdldE5leHRJbmRlbnQoaW5kZXggKyAxKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGluZGVudHM7XG5cblx0XHQvLyBSZXR1cm4gdGhlIHZhbHVlIG9mIHRoZSBORVhUIG5vbi11bmRlZmluZWQgaW5kZW50LlxuXHRcdGZ1bmN0aW9uIGdldE5leHRJbmRlbnQoaW5kZXgpIHtcblx0XHRcdHdoaWxlIChpbmRleCA8IGVuZCkge1xuXHRcdFx0XHRpZiAoaW5kZW50c1tpbmRleF0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIGluZGVudHNbaW5kZXhdO1xuXHRcdFx0XHRpbmRleCsrO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHN0YXJ0SW5kZW50O1xuXHRcdH1cblx0fSxcblxuXG5cdC8vIFJldHVybiB0aGUgaW5kZW50IG9mIGEgbGluZSBvZiB0b2tlbnMuXG5cdC8vIFJldHVybnMgYDBgIGlmIG5vdCBpbmRlbnRlZC5cblx0Ly8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBhIGJsYW5rIGxpbmUuXG5cdGdldExpbmVJbmRlbnQobGluZSkge1xuXHRcdGlmICghbGluZSB8fCBsaW5lLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRpZiAobGluZVswXSBpbnN0YW5jZW9mIFRva2VuaXplci5JbmRlbnQpIHJldHVybiBsaW5lWzBdLmxlbmd0aDtcblx0XHRyZXR1cm4gMDtcblx0fSxcblxuXHQvLyBCcmVhayBgdG9rZW5zYCBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgIGludG8gYSBgVG9rZW5pemVyLkJsb2NrYCB3aXRoIG5lc3RlZCBgY29udGVudHNgLlxuXHQvLyBTa2lwcyBcIm5vcm1hbFwiIHdoaXRlc3BhY2UgYW5kIGluZGVudHMgaW4gdGhlIHJlc3VsdHMuXG5cdGJyZWFrSW50b0Jsb2NrczogZnVuY3Rpb24odG9rZW5zLCBzdGFydCA9IDAsIGVuZCA9IHRva2Vucy5sZW5ndGgpIHtcblx0XHQvLyByZXN0cmljdCB0byB0b2tlbnMgb2YgaW50ZXJlc3Rcblx0XHR0b2tlbnMgPSB0b2tlbnMuc2xpY2Uoc3RhcnQsIGVuZCk7XG5cdFx0Ly8gcmVtb3ZlIFwibm9ybWFsXCIgd2hpdGVzcGFjZVxuLy9UT0RPOiBiZXR0ZXIgdG8gbGVhdmUgdGhpcyB0byBjb25zdW1lcnM/Pz9cblx0XHR0b2tlbnMgPSBUb2tlbml6ZXIucmVtb3ZlTm9ybWFsV2hpdGVzcGFjZSh0b2tlbnMpO1xuXG5cdFx0Ly8gYnJlYWsgaW50byBsaW5lcyAmIHJldHVybiBlYXJseSBpZiBubyBsaW5lc1xuXHRcdGxldCBsaW5lcyA9IFRva2VuaXplci5icmVha0ludG9MaW5lcyh0b2tlbnMpO1xuXHRcdGlmIChsaW5lcy5sZW5ndGggPT09IDApIHJldHVybiBbXTtcblxuXHRcdC8vIGZpZ3VyZSBvdXQgaW5kZW50c1xuXHRcdGxldCBpbmRlbnRzID0gVG9rZW5pemVyLmdldExpbmVJbmRlbnRzKGxpbmVzKTtcblxuXHRcdC8vIEZpcnN0IGJsb2NrIGlzIGF0IHRoZSBNSU5JTVVNIGluZGVudCBvZiBhbGwgbGluZXMhXG5cdFx0bGV0IG1heEluZGVudCA9IE1hdGgubWluLmFwcGx5KE1hdGgsIGluZGVudHMpO1xuXHRcdGxldCBibG9jayA9IG5ldyBUb2tlbml6ZXIuQmxvY2soeyBpbmRlbnQ6IG1heEluZGVudCB9KTtcblxuXHRcdC8vIHN0YWNrIG9mIGJsb2Nrc1xuXHRcdGxldCBzdGFjayA9IFtibG9ja107XG5cblx0XHRsaW5lcy5mb3JFYWNoKCAobGluZSwgaW5kZXgpID0+IHtcblx0XHRcdC8vIFJlbW92ZSBsZWFkaW5nIHdoaXRlc3BhY2UgKGVnOiBpbmRlbnRzKVxuXHRcdFx0bGluZSA9IFRva2VuaXplci5yZW1vdmVMZWFkaW5nV2hpdGVzcGFjZShsaW5lKTtcblxuXHRcdFx0bGV0IGxpbmVJbmRlbnQgPSBpbmRlbnRzW2luZGV4XTtcblx0XHRcdGxldCB0b3AgPSBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcblx0XHRcdC8vIElmIGluZGVudGluZywgcHVzaCBuZXcgYmxvY2socylcblx0XHRcdGlmIChsaW5lSW5kZW50ID4gdG9wLmluZGVudCkge1xuXHRcdFx0XHR3aGlsZSAobGluZUluZGVudCA+IHRvcC5pbmRlbnQpIHtcblx0XHRcdFx0XHR2YXIgbmV3QmxvY2sgPSBuZXcgVG9rZW5pemVyLkJsb2NrKHsgaW5kZW50OiB0b3AuaW5kZW50ICsgMSB9KTtcblx0XHRcdFx0XHR0b3AuY29udGVudHMucHVzaChuZXdCbG9jayk7XG5cdFx0XHRcdFx0c3RhY2sucHVzaChuZXdCbG9jayk7XG5cblx0XHRcdFx0XHR0b3AgPSBuZXdCbG9jaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gSWYgb3V0ZGVudGluZzogcG9wIGJsb2NrKHMpXG5cdFx0XHRlbHNlIGlmIChsaW5lSW5kZW50IDwgdG9wLmluZGVudCkge1xuXHRcdFx0XHR3aGlsZSAobGluZUluZGVudCA8IHRvcC5pbmRlbnQpIHtcblx0XHRcdFx0XHRzdGFjay5wb3AoKTtcblx0XHRcdFx0XHR0b3AgPSBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gYWRkIHRvIHRvcCBibG9ja1xuXHRcdFx0dG9wLmNvbnRlbnRzLnB1c2gobGluZSk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gYmxvY2s7XG5cdH0sXG5cblxuXG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFRva2VuaXplcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9Ub2tlbml6ZXIuanMiLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0geyB2ZXJzaW9uOiAnMi41LjcnIH07XG5pZiAodHlwZW9mIF9fZSA9PSAnbnVtYmVyJykgX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fY29yZS5qc1xuLy8gbW9kdWxlIGlkID0gOTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL19pcy1vYmplY3QuanNcbi8vIG1vZHVsZSBpZCA9IDkyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuL19pb2JqZWN0Jyk7XG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBJT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29yZS1qcy9tb2R1bGVzL190by1pb2JqZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSA5M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgaWQgPSAwO1xudmFyIHB4ID0gTWF0aC5yYW5kb20oKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gJ1N5bWJvbCgnLmNvbmNhdChrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5LCAnKV8nLCAoKytpZCArIHB4KS50b1N0cmluZygzNikpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb3JlLWpzL21vZHVsZXMvX3VpZC5qc1xuLy8gbW9kdWxlIGlkID0gOTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG4vKipcbiAqIFdoZW4gc291cmNlIG1hcHMgYXJlIGVuYWJsZWQsIGBzdHlsZS1sb2FkZXJgIHVzZXMgYSBsaW5rIGVsZW1lbnQgd2l0aCBhIGRhdGEtdXJpIHRvXG4gKiBlbWJlZCB0aGUgY3NzIG9uIHRoZSBwYWdlLiBUaGlzIGJyZWFrcyBhbGwgcmVsYXRpdmUgdXJscyBiZWNhdXNlIG5vdyB0aGV5IGFyZSByZWxhdGl2ZSB0byBhXG4gKiBidW5kbGUgaW5zdGVhZCBvZiB0aGUgY3VycmVudCBwYWdlLlxuICpcbiAqIE9uZSBzb2x1dGlvbiBpcyB0byBvbmx5IHVzZSBmdWxsIHVybHMsIGJ1dCB0aGF0IG1heSBiZSBpbXBvc3NpYmxlLlxuICpcbiAqIEluc3RlYWQsIHRoaXMgZnVuY3Rpb24gXCJmaXhlc1wiIHRoZSByZWxhdGl2ZSB1cmxzIHRvIGJlIGFic29sdXRlIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBwYWdlIGxvY2F0aW9uLlxuICpcbiAqIEEgcnVkaW1lbnRhcnkgdGVzdCBzdWl0ZSBpcyBsb2NhdGVkIGF0IGB0ZXN0L2ZpeFVybHMuanNgIGFuZCBjYW4gYmUgcnVuIHZpYSB0aGUgYG5wbSB0ZXN0YCBjb21tYW5kLlxuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3MpIHtcbiAgLy8gZ2V0IGN1cnJlbnQgbG9jYXRpb25cbiAgdmFyIGxvY2F0aW9uID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cubG9jYXRpb247XG5cbiAgaWYgKCFsb2NhdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcImZpeFVybHMgcmVxdWlyZXMgd2luZG93LmxvY2F0aW9uXCIpO1xuICB9XG5cblx0Ly8gYmxhbmsgb3IgbnVsbD9cblx0aWYgKCFjc3MgfHwgdHlwZW9mIGNzcyAhPT0gXCJzdHJpbmdcIikge1xuXHQgIHJldHVybiBjc3M7XG4gIH1cblxuICB2YXIgYmFzZVVybCA9IGxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgbG9jYXRpb24uaG9zdDtcbiAgdmFyIGN1cnJlbnREaXIgPSBiYXNlVXJsICsgbG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvW15cXC9dKiQvLCBcIi9cIik7XG5cblx0Ly8gY29udmVydCBlYWNoIHVybCguLi4pXG5cdC8qXG5cdFRoaXMgcmVndWxhciBleHByZXNzaW9uIGlzIGp1c3QgYSB3YXkgdG8gcmVjdXJzaXZlbHkgbWF0Y2ggYnJhY2tldHMgd2l0aGluXG5cdGEgc3RyaW5nLlxuXG5cdCAvdXJsXFxzKlxcKCAgPSBNYXRjaCBvbiB0aGUgd29yZCBcInVybFwiIHdpdGggYW55IHdoaXRlc3BhY2UgYWZ0ZXIgaXQgYW5kIHRoZW4gYSBwYXJlbnNcblx0ICAgKCAgPSBTdGFydCBhIGNhcHR1cmluZyBncm91cFxuXHQgICAgICg/OiAgPSBTdGFydCBhIG5vbi1jYXB0dXJpbmcgZ3JvdXBcblx0ICAgICAgICAgW14pKF0gID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgIHwgID0gT1Jcblx0ICAgICAgICAgXFwoICA9IE1hdGNoIGEgc3RhcnQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICg/OiAgPSBTdGFydCBhbm90aGVyIG5vbi1jYXB0dXJpbmcgZ3JvdXBzXG5cdCAgICAgICAgICAgICAgICAgW14pKF0rICA9IE1hdGNoIGFueXRoaW5nIHRoYXQgaXNuJ3QgYSBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgIHwgID0gT1Jcblx0ICAgICAgICAgICAgICAgICBcXCggID0gTWF0Y2ggYSBzdGFydCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgICAgICAgICBbXikoXSogID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgXFwpICA9IE1hdGNoIGEgZW5kIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICApICA9IEVuZCBHcm91cFxuICAgICAgICAgICAgICAqXFwpID0gTWF0Y2ggYW55dGhpbmcgYW5kIHRoZW4gYSBjbG9zZSBwYXJlbnNcbiAgICAgICAgICApICA9IENsb3NlIG5vbi1jYXB0dXJpbmcgZ3JvdXBcbiAgICAgICAgICAqICA9IE1hdGNoIGFueXRoaW5nXG4gICAgICAgKSAgPSBDbG9zZSBjYXB0dXJpbmcgZ3JvdXBcblx0IFxcKSAgPSBNYXRjaCBhIGNsb3NlIHBhcmVuc1xuXG5cdCAvZ2kgID0gR2V0IGFsbCBtYXRjaGVzLCBub3QgdGhlIGZpcnN0LiAgQmUgY2FzZSBpbnNlbnNpdGl2ZS5cblx0ICovXG5cdHZhciBmaXhlZENzcyA9IGNzcy5yZXBsYWNlKC91cmxcXHMqXFwoKCg/OlteKShdfFxcKCg/OlteKShdK3xcXChbXikoXSpcXCkpKlxcKSkqKVxcKS9naSwgZnVuY3Rpb24oZnVsbE1hdGNoLCBvcmlnVXJsKSB7XG5cdFx0Ly8gc3RyaXAgcXVvdGVzIChpZiB0aGV5IGV4aXN0KVxuXHRcdHZhciB1bnF1b3RlZE9yaWdVcmwgPSBvcmlnVXJsXG5cdFx0XHQudHJpbSgpXG5cdFx0XHQucmVwbGFjZSgvXlwiKC4qKVwiJC8sIGZ1bmN0aW9uKG8sICQxKXsgcmV0dXJuICQxOyB9KVxuXHRcdFx0LnJlcGxhY2UoL14nKC4qKSckLywgZnVuY3Rpb24obywgJDEpeyByZXR1cm4gJDE7IH0pO1xuXG5cdFx0Ly8gYWxyZWFkeSBhIGZ1bGwgdXJsPyBubyBjaGFuZ2Vcblx0XHRpZiAoL14oI3xkYXRhOnxodHRwOlxcL1xcL3xodHRwczpcXC9cXC98ZmlsZTpcXC9cXC9cXC8pL2kudGVzdCh1bnF1b3RlZE9yaWdVcmwpKSB7XG5cdFx0ICByZXR1cm4gZnVsbE1hdGNoO1xuXHRcdH1cblxuXHRcdC8vIGNvbnZlcnQgdGhlIHVybCB0byBhIGZ1bGwgdXJsXG5cdFx0dmFyIG5ld1VybDtcblxuXHRcdGlmICh1bnF1b3RlZE9yaWdVcmwuaW5kZXhPZihcIi8vXCIpID09PSAwKSB7XG5cdFx0ICBcdC8vVE9ETzogc2hvdWxkIHdlIGFkZCBwcm90b2NvbD9cblx0XHRcdG5ld1VybCA9IHVucXVvdGVkT3JpZ1VybDtcblx0XHR9IGVsc2UgaWYgKHVucXVvdGVkT3JpZ1VybC5pbmRleE9mKFwiL1wiKSA9PT0gMCkge1xuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgcmVsYXRpdmUgdG8gdGhlIGJhc2UgdXJsXG5cdFx0XHRuZXdVcmwgPSBiYXNlVXJsICsgdW5xdW90ZWRPcmlnVXJsOyAvLyBhbHJlYWR5IHN0YXJ0cyB3aXRoICcvJ1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSByZWxhdGl2ZSB0byBjdXJyZW50IGRpcmVjdG9yeVxuXHRcdFx0bmV3VXJsID0gY3VycmVudERpciArIHVucXVvdGVkT3JpZ1VybC5yZXBsYWNlKC9eXFwuXFwvLywgXCJcIik7IC8vIFN0cmlwIGxlYWRpbmcgJy4vJ1xuXHRcdH1cblxuXHRcdC8vIHNlbmQgYmFjayB0aGUgZml4ZWQgdXJsKC4uLilcblx0XHRyZXR1cm4gXCJ1cmwoXCIgKyBKU09OLnN0cmluZ2lmeShuZXdVcmwpICsgXCIpXCI7XG5cdH0pO1xuXG5cdC8vIHNlbmQgYmFjayB0aGUgZml4ZWQgY3NzXG5cdHJldHVybiBmaXhlZENzcztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vc3R5bGUtbG9hZGVyL2ZpeFVybHMuanNcbi8vIG1vZHVsZSBpZCA9IDk0M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vU3BhY2VyLmxlc3NcIik7XG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbi8vIFByZXBhcmUgY3NzVHJhbnNmb3JtYXRpb25cbnZhciB0cmFuc2Zvcm07XG5cbnZhciBvcHRpb25zID0ge31cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gSG90IE1vZHVsZSBSZXBsYWNlbWVudFxuaWYobW9kdWxlLmhvdCkge1xuXHQvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuXHRpZighY29udGVudC5sb2NhbHMpIHtcblx0XHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vU3BhY2VyLmxlc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL1NwYWNlci5sZXNzXCIpO1xuXHRcdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cdFx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9hcHAvU3BhY2VyLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDk0NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzdHlsZS1sb2FkZXI6IEFkZHMgc29tZSBjc3MgdG8gdGhlIERPTSBieSBhZGRpbmcgYSA8c3R5bGU+IHRhZ1xuXG4vLyBsb2FkIHRoZSBzdHlsZXNcbnZhciBjb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGVzLmxlc3NcIik7XG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcbi8vIFByZXBhcmUgY3NzVHJhbnNmb3JtYXRpb25cbnZhciB0cmFuc2Zvcm07XG5cbnZhciBvcHRpb25zID0ge31cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG4vLyBhZGQgdGhlIHN0eWxlcyB0byB0aGUgRE9NXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcbmlmKGNvbnRlbnQubG9jYWxzKSBtb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnQubG9jYWxzO1xuLy8gSG90IE1vZHVsZSBSZXBsYWNlbWVudFxuaWYobW9kdWxlLmhvdCkge1xuXHQvLyBXaGVuIHRoZSBzdHlsZXMgY2hhbmdlLCB1cGRhdGUgdGhlIDxzdHlsZT4gdGFnc1xuXHRpZighY29udGVudC5sb2NhbHMpIHtcblx0XHRtb2R1bGUuaG90LmFjY2VwdChcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGVzLmxlc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlcy5sZXNzXCIpO1xuXHRcdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cdFx0XHR1cGRhdGUobmV3Q29udGVudCk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gV2hlbiB0aGUgbW9kdWxlIGlzIGRpc3Bvc2VkLCByZW1vdmUgdGhlIDxzdHlsZT4gdGFnc1xuXHRtb2R1bGUuaG90LmRpc3Bvc2UoZnVuY3Rpb24oKSB7IHVwZGF0ZSgpOyB9KTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9hcHAvc3R5bGVzLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDk0NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvL1xuLy8gICMgQ2xhc3MgdXRpbGl0aWVzXG4vL1xuXG4vLyBDbG9uZSBhIGNsYXNzLCByZS11c2luZyB0aGUgb3JpZ2luYWwgbmFtZS5cbi8vIFRPRE86IG1vdmUgdG8gdXRpbGl0eT9cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZUNsYXNzKGNvbnN0cnVjdG9yLCBuYW1lID0gY29uc3RydWN0b3IubmFtZSkge1xuICAvLyBDbG9uZSB0aGUgY29uc3RydWN0b3IsIGtlZXBpbmcgdGhlIHNhbWUgbmFtZVxuICBnbG9iYWwuX19jbG9uZUNsYXNzX18gPSBjb25zdHJ1Y3RvcjtcbiAgY29uc3QgY2xvbmUgPSBuZXcgRnVuY3Rpb24oXCJuYW1lXCIsIGByZXR1cm4gY2xhc3MgJHtuYW1lfSBleHRlbmRzIF9fY2xvbmVDbGFzc19fIHt9YCkoKTtcbiAgZGVsZXRlIGdsb2JhbC5fX2Nsb25lQ2xhc3NfXztcbiAgcmV0dXJuIGNsb25lO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3V0aWxzL2NsYXNzLmpzIiwidmFyIHN0b3JlID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ3drcycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xudmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLlN5bWJvbDtcbnZhciBVU0VfU1lNQk9MID0gdHlwZW9mIFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xuXG52YXIgJGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIFVTRV9TWU1CT0wgJiYgU3ltYm9sW25hbWVdIHx8IChVU0VfU1lNQk9MID8gU3ltYm9sIDogdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59O1xuXG4kZXhwb3J0cy5zdG9yZSA9IHN0b3JlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvcmUtanMvbW9kdWxlcy9fd2tzLmpzXG4vLyBtb2R1bGUgaWQgPSA5NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9