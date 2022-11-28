/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/error-stack-parser/error-stack-parser.js":
/*!***************************************************************!*\
  !*** ./node_modules/error-stack-parser/error-stack-parser.js ***!
  \***************************************************************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! stackframe */ "./node_modules/stackframe/stackframe.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function ErrorStackParser(StackFrame) {
    'use strict';

    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+\:\d+/;
    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;

    function _map(array, fn, thisArg) {
        if (typeof Array.prototype.map === 'function') {
            return array.map(fn, thisArg);
        } else {
            var output = new Array(array.length);
            for (var i = 0; i < array.length; i++) {
                output[i] = fn.call(thisArg, array[i]);
            }
            return output;
        }
    }

    function _filter(array, fn, thisArg) {
        if (typeof Array.prototype.filter === 'function') {
            return array.filter(fn, thisArg);
        } else {
            var output = [];
            for (var i = 0; i < array.length; i++) {
                if (fn.call(thisArg, array[i])) {
                    output.push(array[i]);
                }
            }
            return output;
        }
    }

    function _indexOf(array, target) {
        if (typeof Array.prototype.indexOf === 'function') {
            return array.indexOf(target);
        } else {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === target) {
                    return i;
                }
            }
            return -1;
        }
    }

    return {
        /**
         * Given an Error object, extract the most information from it.
         *
         * @param {Error} error object
         * @return {Array} of StackFrames
         */
        parse: function ErrorStackParser$$parse(error) {
            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
                return this.parseOpera(error);
            } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                return this.parseV8OrIE(error);
            } else if (error.stack) {
                return this.parseFFOrSafari(error);
            } else {
                throw new Error('Cannot parse given Error object');
            }
        },

        // Separate line and column numbers from a string of the form: (URI:Line:Column)
        extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
            // Fail-fast but return locations like "(native)"
            if (urlLike.indexOf(':') === -1) {
                return [urlLike];
            }

            var regExp = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/;
            var parts = regExp.exec(urlLike.replace(/[\(\)]/g, ''));
            return [parts[1], parts[2] || undefined, parts[3] || undefined];
        },

        parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
            var filtered = _filter(error.stack.split('\n'), function(line) {
                return !!line.match(CHROME_IE_STACK_REGEXP);
            }, this);

            return _map(filtered, function(line) {
                if (line.indexOf('(eval ') > -1) {
                    // Throw away eval information until we implement stacktrace.js/stackframe#8
                    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^\()]*)|(\)\,.*$)/g, '');
                }
                var tokens = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').split(/\s+/).slice(1);
                var locationParts = this.extractLocation(tokens.pop());
                var functionName = tokens.join(' ') || undefined;
                var fileName = _indexOf(['eval', '<anonymous>'], locationParts[0]) > -1 ? undefined : locationParts[0];

                return new StackFrame(functionName, undefined, fileName, locationParts[1], locationParts[2], line);
            }, this);
        },

        parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
            var filtered = _filter(error.stack.split('\n'), function(line) {
                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
            }, this);

            return _map(filtered, function(line) {
                // Throw away eval information until we implement stacktrace.js/stackframe#8
                if (line.indexOf(' > eval') > -1) {
                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g, ':$1');
                }

                if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
                    // Safari eval frames only have function names and nothing else
                    return new StackFrame(line);
                } else {
                    var tokens = line.split('@');
                    var locationParts = this.extractLocation(tokens.pop());
                    var functionName = tokens.join('@') || undefined;
                    return new StackFrame(functionName,
                        undefined,
                        locationParts[0],
                        locationParts[1],
                        locationParts[2],
                        line);
                }
            }, this);
        },

        parseOpera: function ErrorStackParser$$parseOpera(e) {
            if (!e.stacktrace || (e.message.indexOf('\n') > -1 &&
                e.message.split('\n').length > e.stacktrace.split('\n').length)) {
                return this.parseOpera9(e);
            } else if (!e.stack) {
                return this.parseOpera10(e);
            } else {
                return this.parseOpera11(e);
            }
        },

        parseOpera9: function ErrorStackParser$$parseOpera9(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n');
            var result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame(undefined, undefined, match[2], match[1], undefined, lines[i]));
                }
            }

            return result;
        },

        parseOpera10: function ErrorStackParser$$parseOpera10(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n');
            var result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(
                        new StackFrame(
                            match[3] || undefined,
                            undefined,
                            match[2],
                            match[1],
                            undefined,
                            lines[i]
                        )
                    );
                }
            }

            return result;
        },

        // Opera 10.65+ Error.stack very similar to FF/Safari
        parseOpera11: function ErrorStackParser$$parseOpera11(error) {
            var filtered = _filter(error.stack.split('\n'), function(line) {
                return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
            }, this);

            return _map(filtered, function(line) {
                var tokens = line.split('@');
                var locationParts = this.extractLocation(tokens.pop());
                var functionCall = (tokens.shift() || '');
                var functionName = functionCall
                        .replace(/<anonymous function(: (\w+))?>/, '$2')
                        .replace(/\([^\)]*\)/g, '') || undefined;
                var argsRaw;
                if (functionCall.match(/\(([^\)]*)\)/)) {
                    argsRaw = functionCall.replace(/^[^\(]+\(([^\)]*)\)$/, '$1');
                }
                var args = (argsRaw === undefined || argsRaw === '[arguments not available]') ?
                    undefined : argsRaw.split(',');
                return new StackFrame(
                    functionName,
                    args,
                    locationParts[0],
                    locationParts[1],
                    locationParts[2],
                    line);
            }, this);
        }
    };
}));



/***/ }),

/***/ "./node_modules/source-map/lib/array-set.js":
/*!**************************************************!*\
  !*** ./node_modules/source-map/lib/array-set.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = __webpack_require__(/*! ./util */ "./node_modules/source-map/lib/util.js");
var has = Object.prototype.hasOwnProperty;

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet() {
  this._array = [];
  this._set = Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet.prototype.size = function ArraySet_size() {
  return Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = util.toSetString(aStr);
  var isDuplicate = has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    this._set[sStr] = idx;
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet.prototype.has = function ArraySet_has(aStr) {
  var sStr = util.toSetString(aStr);
  return has.call(this._set, sStr);
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
  var sStr = util.toSetString(aStr);
  if (has.call(this._set, sStr)) {
    return this._set[sStr];
  }
  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

exports.ArraySet = ArraySet;


/***/ }),

/***/ "./node_modules/source-map/lib/base64-vlq.js":
/*!***************************************************!*\
  !*** ./node_modules/source-map/lib/base64-vlq.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var base64 = __webpack_require__(/*! ./base64 */ "./node_modules/source-map/lib/base64.js");

// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
exports.encode = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};


/***/ }),

/***/ "./node_modules/source-map/lib/base64.js":
/*!***********************************************!*\
  !*** ./node_modules/source-map/lib/base64.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
exports.encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
exports.decode = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};


/***/ }),

/***/ "./node_modules/source-map/lib/binary-search.js":
/*!******************************************************!*\
  !*** ./node_modules/source-map/lib/binary-search.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};


/***/ }),

/***/ "./node_modules/source-map/lib/mapping-list.js":
/*!*****************************************************!*\
  !*** ./node_modules/source-map/lib/mapping-list.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = __webpack_require__(/*! ./util */ "./node_modules/source-map/lib/util.js");

/**
 * Determine whether mappingB is after mappingA with respect to generated
 * position.
 */
function generatedPositionAfter(mappingA, mappingB) {
  // Optimized for most common case
  var lineA = mappingA.generatedLine;
  var lineB = mappingB.generatedLine;
  var columnA = mappingA.generatedColumn;
  var columnB = mappingB.generatedColumn;
  return lineB > lineA || lineB == lineA && columnB >= columnA ||
         util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
}

/**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a neglibable overhead in general
 * case for a large speedup in case of mappings being added in order.
 */
function MappingList() {
  this._array = [];
  this._sorted = true;
  // Serves as infimum
  this._last = {generatedLine: -1, generatedColumn: 0};
}

/**
 * Iterate through internal items. This method takes the same arguments that
 * `Array.prototype.forEach` takes.
 *
 * NOTE: The order of the mappings is NOT guaranteed.
 */
MappingList.prototype.unsortedForEach =
  function MappingList_forEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  };

/**
 * Add the given source mapping.
 *
 * @param Object aMapping
 */
MappingList.prototype.add = function MappingList_add(aMapping) {
  if (generatedPositionAfter(this._last, aMapping)) {
    this._last = aMapping;
    this._array.push(aMapping);
  } else {
    this._sorted = false;
    this._array.push(aMapping);
  }
};

/**
 * Returns the flat, sorted array of mappings. The mappings are sorted by
 * generated position.
 *
 * WARNING: This method returns internal data without copying, for
 * performance. The return value must NOT be mutated, and should be treated as
 * an immutable borrow. If you want to take ownership, you must make your own
 * copy.
 */
MappingList.prototype.toArray = function MappingList_toArray() {
  if (!this._sorted) {
    this._array.sort(util.compareByGeneratedPositionsInflated);
    this._sorted = true;
  }
  return this._array;
};

exports.MappingList = MappingList;


/***/ }),

/***/ "./node_modules/source-map/lib/quick-sort.js":
/*!***************************************************!*\
  !*** ./node_modules/source-map/lib/quick-sort.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
exports.quickSort = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};


/***/ }),

/***/ "./node_modules/source-map/lib/source-map-consumer.js":
/*!************************************************************!*\
  !*** ./node_modules/source-map/lib/source-map-consumer.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = __webpack_require__(/*! ./util */ "./node_modules/source-map/lib/util.js");
var binarySearch = __webpack_require__(/*! ./binary-search */ "./node_modules/source-map/lib/binary-search.js");
var ArraySet = (__webpack_require__(/*! ./array-set */ "./node_modules/source-map/lib/array-set.js").ArraySet);
var base64VLQ = __webpack_require__(/*! ./base64-vlq */ "./node_modules/source-map/lib/base64-vlq.js");
var quickSort = (__webpack_require__(/*! ./quick-sort */ "./node_modules/source-map/lib/quick-sort.js").quickSort);

function SourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap)
    : new BasicSourceMapConsumer(sourceMap);
}

SourceMapConsumer.fromSourceMap = function(aSourceMap) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap);
}

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer.GENERATED_ORDER = 1;
SourceMapConsumer.ORIGINAL_ORDER = 2;

SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      if (source != null && sourceRoot != null) {
        source = util.join(sourceRoot, source);
      }
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: Optional. the column number in the original source.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
SourceMapConsumer.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util.getArg(aArgs, 'column', 0)
    };

    if (this.sourceRoot != null) {
      needle.source = util.relative(this.sourceRoot, needle.source);
    }
    if (!this._sources.has(needle.source)) {
      return [];
    }
    needle.source = this._sources.indexOf(needle.source);

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

exports.SourceMapConsumer = SourceMapConsumer;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The only parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  var version = util.getArg(sourceMap, 'version');
  var sources = util.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util.getArg(sourceMap, 'names', []);
  var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util.getArg(sourceMap, 'mappings');
  var file = util.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source)
        ? util.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet.fromArray(names.map(String), true);
  this._sources = ArraySet.fromArray(sources, true);

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort(smc.__originalMappings, util.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._sources.toArray().map(function (s) {
      return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
    }, this);
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;

    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        // Because each offset is encoded relative to the previous one,
        // many segments often have the same encoding. We can exploit this
        // fact by caching the parsed variable length fields of each segment,
        // allowing us to avoid a second parse if we encounter the same
        // segment again.
        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);

        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64VLQ.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }

          if (segment.length === 2) {
            throw new Error('Found a source, but no line and column');
          }

          if (segment.length === 3) {
            throw new Error('Found a source and line, but no column');
          }

          cachedSegments[str] = segment;
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          originalMappings.push(mapping);
        }
      }
    }

    quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort(originalMappings, util.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.
 *   - column: The column number in the generated source.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.
 *   - column: The column number in the original source, or null.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util.compareByGeneratedPositionsDeflated,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          if (this.sourceRoot != null) {
            source = util.join(this.sourceRoot, source);
          }
        }
        var name = util.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    if (this.sourceRoot != null) {
      aSource = util.relative(this.sourceRoot, aSource);
    }

    if (this._sources.has(aSource)) {
      return this.sourcesContent[this._sources.indexOf(aSource)];
    }

    var url;
    if (this.sourceRoot != null
        && (url = util.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + aSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + aSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: The column number in the original source.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util.getArg(aArgs, 'source');
    if (this.sourceRoot != null) {
      source = util.relative(this.sourceRoot, source);
    }
    if (!this._sources.has(source)) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }
    source = this._sources.indexOf(source);

    var needle = {
      source: source,
      originalLine: util.getArg(aArgs, 'line'),
      originalColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util.compareByOriginalPositions,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

exports.BasicSourceMapConsumer = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The only parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  var version = util.getArg(sourceMap, 'version');
  var sections = util.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet();
  this._names = new ArraySet();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util.getArg(s, 'offset');
    var offsetLine = util.getArg(offset, 'line');
    var offsetColumn = util.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer(util.getArg(s, 'map'))
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.
 *   - column: The column number in the generated source.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.
 *   - column: The column number in the original source, or null.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: The column number in the original source.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer.sources.indexOf(util.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        if (section.consumer.sourceRoot !== null) {
          source = util.join(section.consumer.sourceRoot, source);
        }
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = section.consumer._names.at(mapping.name);
        this._names.add(name);
        name = this._names.indexOf(name);

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
    quickSort(this.__originalMappings, util.compareByOriginalPositions);
  };

exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;


/***/ }),

/***/ "./node_modules/source-map/lib/source-map-generator.js":
/*!*************************************************************!*\
  !*** ./node_modules/source-map/lib/source-map-generator.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var base64VLQ = __webpack_require__(/*! ./base64-vlq */ "./node_modules/source-map/lib/base64-vlq.js");
var util = __webpack_require__(/*! ./util */ "./node_modules/source-map/lib/util.js");
var ArraySet = (__webpack_require__(/*! ./array-set */ "./node_modules/source-map/lib/array-set.js").ArraySet);
var MappingList = (__webpack_require__(/*! ./mapping-list */ "./node_modules/source-map/lib/mapping-list.js").MappingList);

/**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */
function SourceMapGenerator(aArgs) {
  if (!aArgs) {
    aArgs = {};
  }
  this._file = util.getArg(aArgs, 'file', null);
  this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
  this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
  this._sources = new ArraySet();
  this._names = new ArraySet();
  this._mappings = new MappingList();
  this._sourcesContents = null;
}

SourceMapGenerator.prototype._version = 3;

/**
 * Creates a new SourceMapGenerator based on a SourceMapConsumer
 *
 * @param aSourceMapConsumer The SourceMap.
 */
SourceMapGenerator.fromSourceMap =
  function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
    var sourceRoot = aSourceMapConsumer.sourceRoot;
    var generator = new SourceMapGenerator({
      file: aSourceMapConsumer.file,
      sourceRoot: sourceRoot
    });
    aSourceMapConsumer.eachMapping(function (mapping) {
      var newMapping = {
        generated: {
          line: mapping.generatedLine,
          column: mapping.generatedColumn
        }
      };

      if (mapping.source != null) {
        newMapping.source = mapping.source;
        if (sourceRoot != null) {
          newMapping.source = util.relative(sourceRoot, newMapping.source);
        }

        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        };

        if (mapping.name != null) {
          newMapping.name = mapping.name;
        }
      }

      generator.addMapping(newMapping);
    });
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        generator.setSourceContent(sourceFile, content);
      }
    });
    return generator;
  };

/**
 * Add a single mapping from original source line and column to the generated
 * source's line and column for this source map being created. The mapping
 * object should have the following properties:
 *
 *   - generated: An object with the generated line and column positions.
 *   - original: An object with the original line and column positions.
 *   - source: The original source file (relative to the sourceRoot).
 *   - name: An optional original token name for this mapping.
 */
SourceMapGenerator.prototype.addMapping =
  function SourceMapGenerator_addMapping(aArgs) {
    var generated = util.getArg(aArgs, 'generated');
    var original = util.getArg(aArgs, 'original', null);
    var source = util.getArg(aArgs, 'source', null);
    var name = util.getArg(aArgs, 'name', null);

    if (!this._skipValidation) {
      this._validateMapping(generated, original, source, name);
    }

    if (source != null) {
      source = String(source);
      if (!this._sources.has(source)) {
        this._sources.add(source);
      }
    }

    if (name != null) {
      name = String(name);
      if (!this._names.has(name)) {
        this._names.add(name);
      }
    }

    this._mappings.add({
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original != null && original.line,
      originalColumn: original != null && original.column,
      source: source,
      name: name
    });
  };

/**
 * Set the source content for a source file.
 */
SourceMapGenerator.prototype.setSourceContent =
  function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
    var source = aSourceFile;
    if (this._sourceRoot != null) {
      source = util.relative(this._sourceRoot, source);
    }

    if (aSourceContent != null) {
      // Add the source content to the _sourcesContents map.
      // Create a new _sourcesContents map if the property is null.
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[util.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      // Remove the source file from the _sourcesContents map.
      // If the _sourcesContents map is empty, set the property to null.
      delete this._sourcesContents[util.toSetString(source)];
      if (Object.keys(this._sourcesContents).length === 0) {
        this._sourcesContents = null;
      }
    }
  };

/**
 * Applies the mappings of a sub-source-map for a specific source file to the
 * source map being generated. Each mapping to the supplied source file is
 * rewritten using the supplied source map. Note: The resolution for the
 * resulting mappings is the minimium of this map and the supplied map.
 *
 * @param aSourceMapConsumer The source map to be applied.
 * @param aSourceFile Optional. The filename of the source file.
 *        If omitted, SourceMapConsumer's file property will be used.
 * @param aSourceMapPath Optional. The dirname of the path to the source map
 *        to be applied. If relative, it is relative to the SourceMapConsumer.
 *        This parameter is needed when the two source maps aren't in the same
 *        directory, and the source map to be applied contains relative source
 *        paths. If so, those relative source paths need to be rewritten
 *        relative to the SourceMapGenerator.
 */
SourceMapGenerator.prototype.applySourceMap =
  function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
    var sourceFile = aSourceFile;
    // If aSourceFile is omitted, we will use the file property of the SourceMap
    if (aSourceFile == null) {
      if (aSourceMapConsumer.file == null) {
        throw new Error(
          'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
          'or the source map\'s "file" property. Both were omitted.'
        );
      }
      sourceFile = aSourceMapConsumer.file;
    }
    var sourceRoot = this._sourceRoot;
    // Make "sourceFile" relative if an absolute Url is passed.
    if (sourceRoot != null) {
      sourceFile = util.relative(sourceRoot, sourceFile);
    }
    // Applying the SourceMap can add and remove items from the sources and
    // the names array.
    var newSources = new ArraySet();
    var newNames = new ArraySet();

    // Find mappings for the "sourceFile"
    this._mappings.unsortedForEach(function (mapping) {
      if (mapping.source === sourceFile && mapping.originalLine != null) {
        // Check if it can be mapped by the source map, then update the mapping.
        var original = aSourceMapConsumer.originalPositionFor({
          line: mapping.originalLine,
          column: mapping.originalColumn
        });
        if (original.source != null) {
          // Copy mapping
          mapping.source = original.source;
          if (aSourceMapPath != null) {
            mapping.source = util.join(aSourceMapPath, mapping.source)
          }
          if (sourceRoot != null) {
            mapping.source = util.relative(sourceRoot, mapping.source);
          }
          mapping.originalLine = original.line;
          mapping.originalColumn = original.column;
          if (original.name != null) {
            mapping.name = original.name;
          }
        }
      }

      var source = mapping.source;
      if (source != null && !newSources.has(source)) {
        newSources.add(source);
      }

      var name = mapping.name;
      if (name != null && !newNames.has(name)) {
        newNames.add(name);
      }

    }, this);
    this._sources = newSources;
    this._names = newNames;

    // Copy sourcesContents of applied map.
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aSourceMapPath != null) {
          sourceFile = util.join(aSourceMapPath, sourceFile);
        }
        if (sourceRoot != null) {
          sourceFile = util.relative(sourceRoot, sourceFile);
        }
        this.setSourceContent(sourceFile, content);
      }
    }, this);
  };

/**
 * A mapping can have one of the three levels of data:
 *
 *   1. Just the generated position.
 *   2. The Generated position, original position, and original source.
 *   3. Generated and original position, original source, as well as a name
 *      token.
 *
 * To maintain consistency, we validate that any new mapping being added falls
 * in to one of these categories.
 */
SourceMapGenerator.prototype._validateMapping =
  function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                              aName) {
    if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
        && aGenerated.line > 0 && aGenerated.column >= 0
        && !aOriginal && !aSource && !aName) {
      // Case 1.
      return;
    }
    else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
             && aOriginal && 'line' in aOriginal && 'column' in aOriginal
             && aGenerated.line > 0 && aGenerated.column >= 0
             && aOriginal.line > 0 && aOriginal.column >= 0
             && aSource) {
      // Cases 2 and 3.
      return;
    }
    else {
      throw new Error('Invalid mapping: ' + JSON.stringify({
        generated: aGenerated,
        source: aSource,
        original: aOriginal,
        name: aName
      }));
    }
  };

/**
 * Serialize the accumulated mappings in to the stream of base 64 VLQs
 * specified by the source map format.
 */
SourceMapGenerator.prototype._serializeMappings =
  function SourceMapGenerator_serializeMappings() {
    var previousGeneratedColumn = 0;
    var previousGeneratedLine = 1;
    var previousOriginalColumn = 0;
    var previousOriginalLine = 0;
    var previousName = 0;
    var previousSource = 0;
    var result = '';
    var next;
    var mapping;
    var nameIdx;
    var sourceIdx;

    var mappings = this._mappings.toArray();
    for (var i = 0, len = mappings.length; i < len; i++) {
      mapping = mappings[i];
      next = ''

      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ';';
          previousGeneratedLine++;
        }
      }
      else {
        if (i > 0) {
          if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
            continue;
          }
          next += ',';
        }
      }

      next += base64VLQ.encode(mapping.generatedColumn
                                 - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;

      if (mapping.source != null) {
        sourceIdx = this._sources.indexOf(mapping.source);
        next += base64VLQ.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;

        // lines are stored 0-based in SourceMap spec version 3
        next += base64VLQ.encode(mapping.originalLine - 1
                                   - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;

        next += base64VLQ.encode(mapping.originalColumn
                                   - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;

        if (mapping.name != null) {
          nameIdx = this._names.indexOf(mapping.name);
          next += base64VLQ.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }

      result += next;
    }

    return result;
  };

SourceMapGenerator.prototype._generateSourcesContent =
  function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function (source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = util.relative(aSourceRoot, source);
      }
      var key = util.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
        ? this._sourcesContents[key]
        : null;
    }, this);
  };

/**
 * Externalize the source map.
 */
SourceMapGenerator.prototype.toJSON =
  function SourceMapGenerator_toJSON() {
    var map = {
      version: this._version,
      sources: this._sources.toArray(),
      names: this._names.toArray(),
      mappings: this._serializeMappings()
    };
    if (this._file != null) {
      map.file = this._file;
    }
    if (this._sourceRoot != null) {
      map.sourceRoot = this._sourceRoot;
    }
    if (this._sourcesContents) {
      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
    }

    return map;
  };

/**
 * Render the source map being generated to a string.
 */
SourceMapGenerator.prototype.toString =
  function SourceMapGenerator_toString() {
    return JSON.stringify(this.toJSON());
  };

exports.SourceMapGenerator = SourceMapGenerator;


/***/ }),

/***/ "./node_modules/source-map/lib/source-node.js":
/*!****************************************************!*\
  !*** ./node_modules/source-map/lib/source-node.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var SourceMapGenerator = (__webpack_require__(/*! ./source-map-generator */ "./node_modules/source-map/lib/source-map-generator.js").SourceMapGenerator);
var util = __webpack_require__(/*! ./util */ "./node_modules/source-map/lib/util.js");

// Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
// operating systems these days (capturing the result).
var REGEX_NEWLINE = /(\r?\n)/;

// Newline character code for charCodeAt() comparisons
var NEWLINE_CODE = 10;

// Private symbol for identifying `SourceNode`s when multiple versions of
// the source-map library are loaded. This MUST NOT CHANGE across
// versions!
var isSourceNode = "$$$isSourceNode$$$";

/**
 * SourceNodes provide a way to abstract over interpolating/concatenating
 * snippets of generated JavaScript source code while maintaining the line and
 * column information associated with the original source code.
 *
 * @param aLine The original line number.
 * @param aColumn The original column number.
 * @param aSource The original source's filename.
 * @param aChunks Optional. An array of strings which are snippets of
 *        generated JS, or other SourceNodes.
 * @param aName The original identifier.
 */
function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
  this.children = [];
  this.sourceContents = {};
  this.line = aLine == null ? null : aLine;
  this.column = aColumn == null ? null : aColumn;
  this.source = aSource == null ? null : aSource;
  this.name = aName == null ? null : aName;
  this[isSourceNode] = true;
  if (aChunks != null) this.add(aChunks);
}

/**
 * Creates a SourceNode from generated code and a SourceMapConsumer.
 *
 * @param aGeneratedCode The generated code
 * @param aSourceMapConsumer The SourceMap for the generated code
 * @param aRelativePath Optional. The path that relative sources in the
 *        SourceMapConsumer should be relative to.
 */
SourceNode.fromStringWithSourceMap =
  function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
    // The SourceNode we want to fill with the generated code
    // and the SourceMap
    var node = new SourceNode();

    // All even indices of this array are one line of the generated code,
    // while all odd indices are the newlines between two adjacent lines
    // (since `REGEX_NEWLINE` captures its match).
    // Processed fragments are removed from this array, by calling `shiftNextLine`.
    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    var shiftNextLine = function() {
      var lineContents = remainingLines.shift();
      // The last line of a file might not have a newline.
      var newLine = remainingLines.shift() || "";
      return lineContents + newLine;
    };

    // We need to remember the position of "remainingLines"
    var lastGeneratedLine = 1, lastGeneratedColumn = 0;

    // The generate SourceNodes we need a code range.
    // To extract it current and last mapping is used.
    // Here we store the last mapping.
    var lastMapping = null;

    aSourceMapConsumer.eachMapping(function (mapping) {
      if (lastMapping !== null) {
        // We add the code from "lastMapping" to "mapping":
        // First check if there is a new line in between.
        if (lastGeneratedLine < mapping.generatedLine) {
          // Associate first line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
          lastGeneratedLine++;
          lastGeneratedColumn = 0;
          // The remaining code is added without mapping
        } else {
          // There is no new line in between.
          // Associate the code between "lastGeneratedColumn" and
          // "mapping.generatedColumn" with "lastMapping"
          var nextLine = remainingLines[0];
          var code = nextLine.substr(0, mapping.generatedColumn -
                                        lastGeneratedColumn);
          remainingLines[0] = nextLine.substr(mapping.generatedColumn -
                                              lastGeneratedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
          addMappingWithCode(lastMapping, code);
          // No more remaining code, continue
          lastMapping = mapping;
          return;
        }
      }
      // We add the generated code until the first mapping
      // to the SourceNode without any mapping.
      // Each line is added as separate string.
      while (lastGeneratedLine < mapping.generatedLine) {
        node.add(shiftNextLine());
        lastGeneratedLine++;
      }
      if (lastGeneratedColumn < mapping.generatedColumn) {
        var nextLine = remainingLines[0];
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[0] = nextLine.substr(mapping.generatedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    // We have processed all mappings.
    if (remainingLines.length > 0) {
      if (lastMapping) {
        // Associate the remaining code in the current line with "lastMapping"
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      // and add the remaining lines without any mapping
      node.add(remainingLines.join(""));
    }

    // Copy sourcesContent into SourceNode
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aRelativePath != null) {
          sourceFile = util.join(aRelativePath, sourceFile);
        }
        node.setSourceContent(sourceFile, content);
      }
    });

    return node;

    function addMappingWithCode(mapping, code) {
      if (mapping === null || mapping.source === undefined) {
        node.add(code);
      } else {
        var source = aRelativePath
          ? util.join(aRelativePath, mapping.source)
          : mapping.source;
        node.add(new SourceNode(mapping.originalLine,
                                mapping.originalColumn,
                                source,
                                code,
                                mapping.name));
      }
    }
  };

/**
 * Add a chunk of generated JS to this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.add = function SourceNode_add(aChunk) {
  if (Array.isArray(aChunk)) {
    aChunk.forEach(function (chunk) {
      this.add(chunk);
    }, this);
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    if (aChunk) {
      this.children.push(aChunk);
    }
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Add a chunk of generated JS to the beginning of this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
  if (Array.isArray(aChunk)) {
    for (var i = aChunk.length-1; i >= 0; i--) {
      this.prepend(aChunk[i]);
    }
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    this.children.unshift(aChunk);
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Walk over the tree of JS snippets in this node and its children. The
 * walking function is called once for each snippet of JS and is passed that
 * snippet and the its original associated source's line/column location.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walk = function SourceNode_walk(aFn) {
  var chunk;
  for (var i = 0, len = this.children.length; i < len; i++) {
    chunk = this.children[i];
    if (chunk[isSourceNode]) {
      chunk.walk(aFn);
    }
    else {
      if (chunk !== '') {
        aFn(chunk, { source: this.source,
                     line: this.line,
                     column: this.column,
                     name: this.name });
      }
    }
  }
};

/**
 * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
 * each of `this.children`.
 *
 * @param aSep The separator.
 */
SourceNode.prototype.join = function SourceNode_join(aSep) {
  var newChildren;
  var i;
  var len = this.children.length;
  if (len > 0) {
    newChildren = [];
    for (i = 0; i < len-1; i++) {
      newChildren.push(this.children[i]);
      newChildren.push(aSep);
    }
    newChildren.push(this.children[i]);
    this.children = newChildren;
  }
  return this;
};

/**
 * Call String.prototype.replace on the very right-most source snippet. Useful
 * for trimming whitespace from the end of a source node, etc.
 *
 * @param aPattern The pattern to replace.
 * @param aReplacement The thing to replace the pattern with.
 */
SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
  var lastChild = this.children[this.children.length - 1];
  if (lastChild[isSourceNode]) {
    lastChild.replaceRight(aPattern, aReplacement);
  }
  else if (typeof lastChild === 'string') {
    this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
  }
  else {
    this.children.push(''.replace(aPattern, aReplacement));
  }
  return this;
};

/**
 * Set the source content for a source file. This will be added to the SourceMapGenerator
 * in the sourcesContent field.
 *
 * @param aSourceFile The filename of the source file
 * @param aSourceContent The content of the source file
 */
SourceNode.prototype.setSourceContent =
  function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
    this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
  };

/**
 * Walk over the tree of SourceNodes. The walking function is called for each
 * source file content and is passed the filename and source content.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walkSourceContents =
  function SourceNode_walkSourceContents(aFn) {
    for (var i = 0, len = this.children.length; i < len; i++) {
      if (this.children[i][isSourceNode]) {
        this.children[i].walkSourceContents(aFn);
      }
    }

    var sources = Object.keys(this.sourceContents);
    for (var i = 0, len = sources.length; i < len; i++) {
      aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
    }
  };

/**
 * Return the string representation of this source node. Walks over the tree
 * and concatenates all the various snippets together to one string.
 */
SourceNode.prototype.toString = function SourceNode_toString() {
  var str = "";
  this.walk(function (chunk) {
    str += chunk;
  });
  return str;
};

/**
 * Returns the string representation of this source node along with a source
 * map.
 */
SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
  var generated = {
    code: "",
    line: 1,
    column: 0
  };
  var map = new SourceMapGenerator(aArgs);
  var sourceMappingActive = false;
  var lastOriginalSource = null;
  var lastOriginalLine = null;
  var lastOriginalColumn = null;
  var lastOriginalName = null;
  this.walk(function (chunk, original) {
    generated.code += chunk;
    if (original.source !== null
        && original.line !== null
        && original.column !== null) {
      if(lastOriginalSource !== original.source
         || lastOriginalLine !== original.line
         || lastOriginalColumn !== original.column
         || lastOriginalName !== original.name) {
        map.addMapping({
          source: original.source,
          original: {
            line: original.line,
            column: original.column
          },
          generated: {
            line: generated.line,
            column: generated.column
          },
          name: original.name
        });
      }
      lastOriginalSource = original.source;
      lastOriginalLine = original.line;
      lastOriginalColumn = original.column;
      lastOriginalName = original.name;
      sourceMappingActive = true;
    } else if (sourceMappingActive) {
      map.addMapping({
        generated: {
          line: generated.line,
          column: generated.column
        }
      });
      lastOriginalSource = null;
      sourceMappingActive = false;
    }
    for (var idx = 0, length = chunk.length; idx < length; idx++) {
      if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
        generated.line++;
        generated.column = 0;
        // Mappings end at eol
        if (idx + 1 === length) {
          lastOriginalSource = null;
          sourceMappingActive = false;
        } else if (sourceMappingActive) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
      } else {
        generated.column++;
      }
    }
  });
  this.walkSourceContents(function (sourceFile, sourceContent) {
    map.setSourceContent(sourceFile, sourceContent);
  });

  return { code: generated.code, map: map };
};

exports.SourceNode = SourceNode;


/***/ }),

/***/ "./node_modules/source-map/lib/util.js":
/*!*********************************************!*\
  !*** ./node_modules/source-map/lib/util.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);

  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
}
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || !!aPath.match(urlRegexp);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return mappingA.name - mappingB.name;
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return mappingA.name - mappingB.name;
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;


/***/ }),

/***/ "./node_modules/source-map/source-map.js":
/*!***********************************************!*\
  !*** ./node_modules/source-map/source-map.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = __webpack_require__(/*! ./lib/source-map-generator */ "./node_modules/source-map/lib/source-map-generator.js").SourceMapGenerator;
exports.SourceMapConsumer = __webpack_require__(/*! ./lib/source-map-consumer */ "./node_modules/source-map/lib/source-map-consumer.js").SourceMapConsumer;
exports.SourceNode = __webpack_require__(/*! ./lib/source-node */ "./node_modules/source-map/lib/source-node.js").SourceNode;


/***/ }),

/***/ "./node_modules/stack-generator/node_modules/stackframe/stackframe.js":
/*!****************************************************************************!*\
  !*** ./node_modules/stack-generator/node_modules/stackframe/stackframe.js ***!
  \****************************************************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function() {
    'use strict';
    function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }

    function _getter(p) {
        return function() {
            return this[p];
        };
    }

    var booleanProps = ['isConstructor', 'isEval', 'isNative', 'isToplevel'];
    var numericProps = ['columnNumber', 'lineNumber'];
    var stringProps = ['fileName', 'functionName', 'source'];
    var arrayProps = ['args'];
    var objectProps = ['evalOrigin'];

    var props = booleanProps.concat(numericProps, stringProps, arrayProps, objectProps);

    function StackFrame(obj) {
        if (!obj) return;
        for (var i = 0; i < props.length; i++) {
            if (obj[props[i]] !== undefined) {
                this['set' + _capitalize(props[i])](obj[props[i]]);
            }
        }
    }

    StackFrame.prototype = {
        getArgs: function() {
            return this.args;
        },
        setArgs: function(v) {
            if (Object.prototype.toString.call(v) !== '[object Array]') {
                throw new TypeError('Args must be an Array');
            }
            this.args = v;
        },

        getEvalOrigin: function() {
            return this.evalOrigin;
        },
        setEvalOrigin: function(v) {
            if (v instanceof StackFrame) {
                this.evalOrigin = v;
            } else if (v instanceof Object) {
                this.evalOrigin = new StackFrame(v);
            } else {
                throw new TypeError('Eval Origin must be an Object or StackFrame');
            }
        },

        toString: function() {
            var fileName = this.getFileName() || '';
            var lineNumber = this.getLineNumber() || '';
            var columnNumber = this.getColumnNumber() || '';
            var functionName = this.getFunctionName() || '';
            if (this.getIsEval()) {
                if (fileName) {
                    return '[eval] (' + fileName + ':' + lineNumber + ':' + columnNumber + ')';
                }
                return '[eval]:' + lineNumber + ':' + columnNumber;
            }
            if (functionName) {
                return functionName + ' (' + fileName + ':' + lineNumber + ':' + columnNumber + ')';
            }
            return fileName + ':' + lineNumber + ':' + columnNumber;
        }
    };

    StackFrame.fromString = function StackFrame$$fromString(str) {
        var argsStartIndex = str.indexOf('(');
        var argsEndIndex = str.lastIndexOf(')');

        var functionName = str.substring(0, argsStartIndex);
        var args = str.substring(argsStartIndex + 1, argsEndIndex).split(',');
        var locationString = str.substring(argsEndIndex + 1);

        if (locationString.indexOf('@') === 0) {
            var parts = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(locationString, '');
            var fileName = parts[1];
            var lineNumber = parts[2];
            var columnNumber = parts[3];
        }

        return new StackFrame({
            functionName: functionName,
            args: args || undefined,
            fileName: fileName,
            lineNumber: lineNumber || undefined,
            columnNumber: columnNumber || undefined
        });
    };

    for (var i = 0; i < booleanProps.length; i++) {
        StackFrame.prototype['get' + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);
        StackFrame.prototype['set' + _capitalize(booleanProps[i])] = (function(p) {
            return function(v) {
                this[p] = Boolean(v);
            };
        })(booleanProps[i]);
    }

    for (var j = 0; j < numericProps.length; j++) {
        StackFrame.prototype['get' + _capitalize(numericProps[j])] = _getter(numericProps[j]);
        StackFrame.prototype['set' + _capitalize(numericProps[j])] = (function(p) {
            return function(v) {
                if (!_isNumber(v)) {
                    throw new TypeError(p + ' must be a Number');
                }
                this[p] = Number(v);
            };
        })(numericProps[j]);
    }

    for (var k = 0; k < stringProps.length; k++) {
        StackFrame.prototype['get' + _capitalize(stringProps[k])] = _getter(stringProps[k]);
        StackFrame.prototype['set' + _capitalize(stringProps[k])] = (function(p) {
            return function(v) {
                this[p] = String(v);
            };
        })(stringProps[k]);
    }

    return StackFrame;
}));


/***/ }),

/***/ "./node_modules/stack-generator/stack-generator.js":
/*!*********************************************************!*\
  !*** ./node_modules/stack-generator/stack-generator.js ***!
  \*********************************************************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! stackframe */ "./node_modules/stack-generator/node_modules/stackframe/stackframe.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function (StackFrame) {
    return {
        backtrace: function StackGenerator$$backtrace(opts) {
            var stack = [];
            var maxStackSize = 10;

            if (typeof opts === 'object' && typeof opts.maxStackSize === 'number') {
                maxStackSize = opts.maxStackSize;
            }

            var curr = arguments.callee;
            while (curr && stack.length < maxStackSize) {
                // Allow V8 optimizations
                var args = new Array(curr['arguments'].length);
                for(var i = 0; i < args.length; ++i) {
                    args[i] = curr['arguments'][i];
                }
                if (/function(?:\s+([\w$]+))+\s*\(/.test(curr.toString())) {
                    stack.push(new StackFrame({functionName: RegExp.$1 || undefined, args: args}));
                } else {
                    stack.push(new StackFrame({args: args}));
                }

                try {
                    curr = curr.caller;
                } catch (e) {
                    break;
                }
            }
            return stack;
        }
    };
}));


/***/ }),

/***/ "./node_modules/stackframe/stackframe.js":
/*!***********************************************!*\
  !*** ./node_modules/stackframe/stackframe.js ***!
  \***********************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function () {
    'use strict';
    function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function StackFrame(functionName, args, fileName, lineNumber, columnNumber, source) {
        if (functionName !== undefined) {
            this.setFunctionName(functionName);
        }
        if (args !== undefined) {
            this.setArgs(args);
        }
        if (fileName !== undefined) {
            this.setFileName(fileName);
        }
        if (lineNumber !== undefined) {
            this.setLineNumber(lineNumber);
        }
        if (columnNumber !== undefined) {
            this.setColumnNumber(columnNumber);
        }
        if (source !== undefined) {
            this.setSource(source);
        }
    }

    StackFrame.prototype = {
        getFunctionName: function () {
            return this.functionName;
        },
        setFunctionName: function (v) {
            this.functionName = String(v);
        },

        getArgs: function () {
            return this.args;
        },
        setArgs: function (v) {
            if (Object.prototype.toString.call(v) !== '[object Array]') {
                throw new TypeError('Args must be an Array');
            }
            this.args = v;
        },

        // NOTE: Property name may be misleading as it includes the path,
        // but it somewhat mirrors V8's JavaScriptStackTraceApi
        // https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi and Gecko's
        // http://mxr.mozilla.org/mozilla-central/source/xpcom/base/nsIException.idl#14
        getFileName: function () {
            return this.fileName;
        },
        setFileName: function (v) {
            this.fileName = String(v);
        },

        getLineNumber: function () {
            return this.lineNumber;
        },
        setLineNumber: function (v) {
            if (!_isNumber(v)) {
                throw new TypeError('Line Number must be a Number');
            }
            this.lineNumber = Number(v);
        },

        getColumnNumber: function () {
            return this.columnNumber;
        },
        setColumnNumber: function (v) {
            if (!_isNumber(v)) {
                throw new TypeError('Column Number must be a Number');
            }
            this.columnNumber = Number(v);
        },

        getSource: function () {
            return this.source;
        },
        setSource: function (v) {
            this.source = String(v);
        },

        toString: function() {
            var functionName = this.getFunctionName() || '{anonymous}';
            var args = '(' + (this.getArgs() || []).join(',') + ')';
            var fileName = this.getFileName() ? ('@' + this.getFileName()) : '';
            var lineNumber = _isNumber(this.getLineNumber()) ? (':' + this.getLineNumber()) : '';
            var columnNumber = _isNumber(this.getColumnNumber()) ? (':' + this.getColumnNumber()) : '';
            return functionName + args + fileName + lineNumber + columnNumber;
        }
    };

    return StackFrame;
}));


/***/ }),

/***/ "./node_modules/stacktrace-gps/stacktrace-gps.js":
/*!*******************************************************!*\
  !*** ./node_modules/stacktrace-gps/stacktrace-gps.js ***!
  \*******************************************************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! source-map */ "./node_modules/source-map/source-map.js"), __webpack_require__(/*! stackframe */ "./node_modules/stackframe/stackframe.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function(SourceMap, StackFrame) {
    'use strict';

    /**
     * Make a X-Domain request to url and callback.
     *
     * @param {String} url
     * @returns {Promise} with response text if fulfilled
     */
    function _xdr(url) {
        return new Promise(function(resolve, reject) {
            var req = new XMLHttpRequest();
            req.open('get', url);
            req.onerror = reject;
            req.onreadystatechange = function onreadystatechange() {
                if (req.readyState === 4) {
                    if (req.status >= 200 && req.status < 300) {
                        resolve(req.responseText);
                    } else {
                        reject(new Error('HTTP status: ' + req.status + ' retrieving ' + url));
                    }
                }
            };
            req.send();
        });

    }

    /**
     * Convert a Base64-encoded string into its original representation.
     * Used for inline sourcemaps.
     *
     * @param {String} b64str Base-64 encoded string
     * @returns {String} original representation of the base64-encoded string.
     */
    function _atob(b64str) {
        if (typeof window !== 'undefined' && window.atob) {
            return window.atob(b64str);
        } else {
            throw new Error('You must supply a polyfill for window.atob in this environment');
        }
    }

    function _parseJson(string) {
        if (typeof JSON !== 'undefined' && JSON.parse) {
            return JSON.parse(string);
        } else {
            throw new Error('You must supply a polyfill for JSON.parse in this environment');
        }
    }

    function _findFunctionName(source, lineNumber/*, columnNumber*/) {
        // function {name}({args}) m[1]=name m[2]=args
        var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/;
        // {name} = function ({args}) TODO args capture
        var reFunctionExpression = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/;
        // {name} = eval()
        var reFunctionEvaluation = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/;
        var lines = source.split('\n');

        // Walk backwards in the source lines until we find the line which matches one of the patterns above
        var code = '';
        var maxLines = Math.min(lineNumber, 20);
        var m;
        for (var i = 0; i < maxLines; ++i) {
            // lineNo is 1-based, source[] is 0-based
            var line = lines[lineNumber - i - 1];
            var commentPos = line.indexOf('//');
            if (commentPos >= 0) {
                line = line.substr(0, commentPos);
            }

            if (line) {
                code = line + code;
                m = reFunctionExpression.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
                m = reFunctionDeclaration.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
                m = reFunctionEvaluation.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
            }
        }
        return undefined;
    }

    function _ensureSupportedEnvironment() {
        if (typeof Object.defineProperty !== 'function' || typeof Object.create !== 'function') {
            throw new Error('Unable to consume source maps in older browsers');
        }
    }

    function _ensureStackFrameIsLegit(stackframe) {
        if (typeof stackframe !== 'object') {
            throw new TypeError('Given StackFrame is not an object');
        } else if (typeof stackframe.fileName !== 'string') {
            throw new TypeError('Given file name is not a String');
        } else if (typeof stackframe.lineNumber !== 'number' ||
            stackframe.lineNumber % 1 !== 0 ||
            stackframe.lineNumber < 1) {
            throw new TypeError('Given line number must be a positive integer');
        } else if (typeof stackframe.columnNumber !== 'number' ||
            stackframe.columnNumber % 1 !== 0 ||
            stackframe.columnNumber < 0) {
            throw new TypeError('Given column number must be a non-negative integer');
        }
        return true;
    }

    function _findSourceMappingURL(source) {
        var m = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/.exec(source);
        if (m && m[1]) {
            return m[1];
        } else {
            throw new Error('sourceMappingURL not found');
        }
    }

    function _extractLocationInfoFromSourceMap(stackframe, rawSourceMap, sourceCache) {
        return new Promise(function(resolve, reject) {
            var mapConsumer = new SourceMap.SourceMapConsumer(rawSourceMap);

            var loc = mapConsumer.originalPositionFor({
                line: stackframe.lineNumber,
                column: stackframe.columnNumber
            });

            if (loc.source) {
                var mappedSource = mapConsumer.sourceContentFor(loc.source);
                if (mappedSource) {
                    sourceCache[loc.source] = mappedSource;
                }
                resolve(
                    new StackFrame(
                        loc.name || stackframe.functionName,
                        stackframe.args,
                        loc.source,
                        loc.line,
                        loc.column));
            } else {
                reject(new Error('Could not get original source for given stackframe and source map'));
            }
        });
    }

    /**
     * @constructor
     * @param {Object} opts
     *      opts.sourceCache = {url: "Source String"} => preload source cache
     *      opts.offline = True to prevent network requests.
     *              Best effort without sources or source maps.
     *      opts.ajax = Promise returning function to make X-Domain requests
     */
    return function StackTraceGPS(opts) {
        if (!(this instanceof StackTraceGPS)) {
            return new StackTraceGPS(opts);
        }
        opts = opts || {};

        this.sourceCache = opts.sourceCache || {};

        this.ajax = opts.ajax || _xdr;

        this._atob = opts.atob || _atob;

        this._get = function _get(location) {
            return new Promise(function(resolve, reject) {
                var isDataUrl = location.substr(0, 5) === 'data:';
                if (this.sourceCache[location]) {
                    resolve(this.sourceCache[location]);
                } else if (opts.offline && !isDataUrl) {
                    reject(new Error('Cannot make network requests in offline mode'));
                } else {
                    if (isDataUrl) {
                        // data URLs can have parameters.
                        // see http://tools.ietf.org/html/rfc2397
                        var supportedEncodingRegexp =
                            /^data:application\/json;([\w=:"-]+;)*base64,/;
                        var match = location.match(supportedEncodingRegexp);
                        if (match) {
                            var sourceMapStart = match[0].length;
                            var encodedSource = location.substr(sourceMapStart);
                            var source = this._atob(encodedSource);
                            this.sourceCache[location] = source;
                            resolve(source);
                        } else {
                            reject(new Error('The encoding of the inline sourcemap is not supported'));
                        }
                    } else {
                        var xhrPromise = this.ajax(location, {method: 'get'});
                        // Cache the Promise to prevent duplicate in-flight requests
                        this.sourceCache[location] = xhrPromise;
                        xhrPromise.then(resolve, reject);
                    }
                }
            }.bind(this));
        };

        /**
         * Given a StackFrame, enhance function name and use source maps for a
         * better StackFrame.
         *
         * @param {StackFrame} stackframe object
         * @returns {Promise} that resolves with with source-mapped StackFrame
         */
        this.pinpoint = function StackTraceGPS$$pinpoint(stackframe) {
            return new Promise(function(resolve, reject) {
                this.getMappedLocation(stackframe).then(function(mappedStackFrame) {
                    function resolveMappedStackFrame() {
                        resolve(mappedStackFrame);
                    }

                    this.findFunctionName(mappedStackFrame)
                        .then(resolve, resolveMappedStackFrame)
                        ['catch'](resolveMappedStackFrame);
                }.bind(this), reject);
            }.bind(this));
        };

        /**
         * Given a StackFrame, guess function name from location information.
         *
         * @param {StackFrame} stackframe
         * @returns {Promise} that resolves with enhanced StackFrame.
         */
        this.findFunctionName = function StackTraceGPS$$findFunctionName(stackframe) {
            return new Promise(function(resolve, reject) {
                _ensureStackFrameIsLegit(stackframe);
                this._get(stackframe.fileName).then(function getSourceCallback(source) {
                    var lineNumber = stackframe.lineNumber;
                    var columnNumber = stackframe.columnNumber;
                    var guessedFunctionName = _findFunctionName(source, lineNumber, columnNumber);
                    // Only replace functionName if we found something
                    if (guessedFunctionName) {
                        resolve(new StackFrame(guessedFunctionName,
                            stackframe.args,
                            stackframe.fileName,
                            lineNumber,
                            columnNumber));
                    } else {
                        resolve(stackframe);
                    }
                }, reject)['catch'](reject);
            }.bind(this));
        };

        /**
         * Given a StackFrame, seek source-mapped location and return new enhanced StackFrame.
         *
         * @param {StackFrame} stackframe
         * @returns {Promise} that resolves with enhanced StackFrame.
         */
        this.getMappedLocation = function StackTraceGPS$$getMappedLocation(stackframe) {
            return new Promise(function(resolve, reject) {
                _ensureSupportedEnvironment();
                _ensureStackFrameIsLegit(stackframe);

                var sourceCache = this.sourceCache;
                var fileName = stackframe.fileName;
                this._get(fileName).then(function(source) {
                    var sourceMappingURL = _findSourceMappingURL(source);
                    var isDataUrl = sourceMappingURL.substr(0, 5) === 'data:';
                    var base = fileName.substring(0, fileName.lastIndexOf('/') + 1);

                    if (sourceMappingURL[0] !== '/' && !isDataUrl && !(/^https?:\/\/|^\/\//i).test(sourceMappingURL)) {
                        sourceMappingURL = base + sourceMappingURL;
                    }

                    this._get(sourceMappingURL).then(function(sourceMap) {
                        if (typeof sourceMap === 'string') {
                            sourceMap = _parseJson(sourceMap.replace(/^\)\]\}'/, ''));
                        }
                        if (typeof sourceMap.sourceRoot === 'undefined') {
                            sourceMap.sourceRoot = base;
                        }

                        _extractLocationInfoFromSourceMap(stackframe, sourceMap, sourceCache)
                            .then(resolve)['catch'](function() {
                            resolve(stackframe);
                        });
                    }, reject)['catch'](reject);
                }.bind(this), reject)['catch'](reject);
            }.bind(this));
        };
    };
}));


/***/ }),

/***/ "./node_modules/stacktrace-js/stacktrace.js":
/*!**************************************************!*\
  !*** ./node_modules/stacktrace-js/stacktrace.js ***!
  \**************************************************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! error-stack-parser */ "./node_modules/error-stack-parser/error-stack-parser.js"), __webpack_require__(/*! stack-generator */ "./node_modules/stack-generator/stack-generator.js"), __webpack_require__(/*! stacktrace-gps */ "./node_modules/stacktrace-gps/stacktrace-gps.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function StackTrace(ErrorStackParser, StackGenerator, StackTraceGPS) {
    var _options = {
        filter: function(stackframe) {
            // Filter out stackframes for this library by default
            return (stackframe.functionName || '').indexOf('StackTrace$$') === -1 &&
                (stackframe.functionName || '').indexOf('ErrorStackParser$$') === -1 &&
                (stackframe.functionName || '').indexOf('StackTraceGPS$$') === -1 &&
                (stackframe.functionName || '').indexOf('StackGenerator$$') === -1;
        },
        sourceCache: {}
    };

    var _generateError = function StackTrace$$GenerateError() {
        try {
            // Error must be thrown to get stack in IE
            throw new Error();
        } catch (err) {
            return err;
        }
    };

    /**
     * Merge 2 given Objects. If a conflict occurs the second object wins.
     * Does not do deep merges.
     *
     * @param {Object} first base object
     * @param {Object} second overrides
     * @returns {Object} merged first and second
     * @private
     */
    function _merge(first, second) {
        var target = {};

        [first, second].forEach(function(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    target[prop] = obj[prop];
                }
            }
            return target;
        });

        return target;
    }

    function _isShapedLikeParsableError(err) {
        return err.stack || err['opera#sourceloc'];
    }

    function _filtered(stackframes, filter) {
        if (typeof filter === 'function') {
            return stackframes.filter(filter);
        }
        return stackframes;
    }

    return {
        /**
         * Get a backtrace from invocation point.
         *
         * @param {Object} opts
         * @returns {Array} of StackFrame
         */
        get: function StackTrace$$get(opts) {
            var err = _generateError();
            return _isShapedLikeParsableError(err) ? this.fromError(err, opts) : this.generateArtificially(opts);
        },

        /**
         * Get a backtrace from invocation point.
         * IMPORTANT: Does not handle source maps or guess function names!
         *
         * @param {Object} opts
         * @returns {Array} of StackFrame
         */
        getSync: function StackTrace$$getSync(opts) {
            opts = _merge(_options, opts);
            var err = _generateError();
            var stack = _isShapedLikeParsableError(err) ? ErrorStackParser.parse(err) : StackGenerator.backtrace(opts);
            return _filtered(stack, opts.filter);
        },

        /**
         * Given an error object, parse it.
         *
         * @param {Error} error object
         * @param {Object} opts
         * @returns {Promise} for Array[StackFrame}
         */
        fromError: function StackTrace$$fromError(error, opts) {
            opts = _merge(_options, opts);
            var gps = new StackTraceGPS(opts);
            return new Promise(function(resolve) {
                var stackframes = _filtered(ErrorStackParser.parse(error), opts.filter);
                resolve(Promise.all(stackframes.map(function(sf) {
                    return new Promise(function(resolve) {
                        function resolveOriginal() {
                            resolve(sf);
                        }

                        gps.pinpoint(sf).then(resolve, resolveOriginal)['catch'](resolveOriginal);
                    });
                })));
            }.bind(this));
        },

        /**
         * Use StackGenerator to generate a backtrace.
         *
         * @param {Object} opts
         * @returns {Promise} of Array[StackFrame]
         */
        generateArtificially: function StackTrace$$generateArtificially(opts) {
            opts = _merge(_options, opts);
            var stackFrames = StackGenerator.backtrace(opts);
            if (typeof opts.filter === 'function') {
                stackFrames = stackFrames.filter(opts.filter);
            }
            return Promise.resolve(stackFrames);
        },

        /**
         * Given a function, wrap it such that invocations trigger a callback that
         * is called with a stack trace.
         *
         * @param {Function} fn to be instrumented
         * @param {Function} callback function to call with a stack trace on invocation
         * @param {Function} errback optional function to call with error if unable to get stack trace.
         * @param {Object} thisArg optional context object (e.g. window)
         */
        instrument: function StackTrace$$instrument(fn, callback, errback, thisArg) {
            if (typeof fn !== 'function') {
                throw new Error('Cannot instrument non-function object');
            } else if (typeof fn.__stacktraceOriginalFn === 'function') {
                // Already instrumented, return given Function
                return fn;
            }

            var instrumented = function StackTrace$$instrumented() {
                try {
                    this.get().then(callback, errback)['catch'](errback);
                    return fn.apply(thisArg || this, arguments);
                } catch (e) {
                    if (_isShapedLikeParsableError(e)) {
                        this.fromError(e).then(callback, errback)['catch'](errback);
                    }
                    throw e;
                }
            }.bind(this);
            instrumented.__stacktraceOriginalFn = fn;

            return instrumented;
        },

        /**
         * Given a function that has been instrumented,
         * revert the function to it's original (non-instrumented) state.
         *
         * @param {Function} fn to de-instrument
         */
        deinstrument: function StackTrace$$deinstrument(fn) {
            if (typeof fn !== 'function') {
                throw new Error('Cannot de-instrument non-function object');
            } else if (typeof fn.__stacktraceOriginalFn === 'function') {
                return fn.__stacktraceOriginalFn;
            } else {
                // Function not instrumented, return original
                return fn;
            }
        },

        /**
         * Given an error message and Array of StackFrames, serialize and POST to given URL.
         *
         * @param {Array} stackframes
         * @param {String} url
         * @param {String} errorMsg
         */
        report: function StackTrace$$report(stackframes, url, errorMsg) {
            return new Promise(function(resolve, reject) {
                var req = new XMLHttpRequest();
                req.onerror = reject;
                req.onreadystatechange = function onreadystatechange() {
                    if (req.readyState === 4) {
                        if (req.status >= 200 && req.status < 400) {
                            resolve(req.responseText);
                        } else {
                            reject(new Error('POST to ' + url + ' failed with status: ' + req.status));
                        }
                    }
                };
                req.open('post', url);
                req.setRequestHeader('Content-Type', 'application/json');

                var reportPayload = {stack: stackframes};
                if (errorMsg !== undefined) {
                    reportPayload.message = errorMsg;
                }

                req.send(JSON.stringify(reportPayload));
            });
        }
    };
}));


/***/ }),

/***/ "./src/_infra/AifexServiceHTTP.ts":
/*!****************************************!*\
  !*** ./src/_infra/AifexServiceHTTP.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Session_1 = __importDefault(__webpack_require__(/*! ../domain/Session */ "./src/domain/Session.ts"));
const OK_STATUS = 200;
const INVALID_PARAMETERS_STATUS = 400;
const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const INTERNAL_SERVER_ERROR_STATUS = 500;
class AifexServiceHTTP {
    ping(serverURL) {
        return fetch(`${serverURL}/api/ping`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
            .then(response => {
            console.log(response);
            if (response.ok) {
                console.log('ok');
                return;
            }
            else {
                console.log('error');
                throw new Error(response.statusText);
            }
        });
    }
    getSession(serverURL, sessionId) {
        const SESSION_URL = serverURL + '/api/sessions/' + sessionId;
        return fetch(SESSION_URL, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
            .then((response) => {
            if (response.status === OK_STATUS) {
                return response
                    .json()
                    .then((session) => {
                    return new Session_1.default(session.id, session.webSite.id, session.baseURL, session.name, session.description, session.overlayType, session.recordingMode);
                });
            }
            if (response.status === INVALID_PARAMETERS_STATUS) {
                return undefined;
            }
            if (response.status === NOT_FOUND_STATUS) {
                return undefined;
            }
            if (response.status === FORBIDDEN_STATUS) {
                return "Unauthorized";
            }
            if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
                return Promise.reject(`server error`);
            }
        });
    }
    createEmptyExploration(testerName, serverURL, sessionId) {
        const body = {
            testerName,
            interactionList: [],
        };
        const option = {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        };
        return fetch(`${serverURL}/api/sessions/${sessionId}/explorations`, option)
            .then((response) => {
            if (response.status === OK_STATUS) {
                return response.json().then(data => {
                    return data.explorationNumber;
                });
            }
            if (response.status === NOT_FOUND_STATUS) {
                return Promise.reject(new Error(`no session not found for Id`));
            }
            if (response.status === INVALID_PARAMETERS_STATUS) {
                return Promise.reject(new Error(`sessionId and/or exploration is malformed`));
            }
            if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
                return Promise.reject(new Error(`server error`));
            }
        });
    }
    sendAction(explorationNumber, action, serverURL, sessionId) {
        const body = {
            interactionList: [{
                    concreteType: "Action",
                    kind: action.prefix,
                    value: action.suffix,
                    date: new Date()
                }]
        };
        const option = {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        };
        return fetch(`${serverURL}/api/sessions/${sessionId}/explorations/${explorationNumber}/interactions`, option)
            .then((response) => {
            if (response.status === OK_STATUS) {
                return;
            }
            if (response.status === NOT_FOUND_STATUS) {
                return Promise.reject(new Error(`sessionId not found`));
            }
            if (response.status === INVALID_PARAMETERS_STATUS) {
                return Promise.reject(new Error(`sessionId and/or exploration is malformed`));
            }
            if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
                return Promise.reject(new Error(`server error`));
            }
        }).catch(error => {
            console.error(error);
            throw new Error("Service Failed to push new action");
        });
    }
}
exports["default"] = AifexServiceHTTP;


/***/ }),

/***/ "./src/_infra/BrowserServiceSessionStorage.ts":
/*!****************************************************!*\
  !*** ./src/_infra/BrowserServiceSessionStorage.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const Logger_1 = __webpack_require__(/*! ../framework/Logger */ "./src/framework/Logger.ts");
const EXPLORATION_NUMBER_KEY = 'EXPLORATION_NUMBER_KEY';
class BrowserServiceSessionStorage {
    getExplorationNumber() {
        Logger_1.logger.debug("BrowserServiceSessionStorage.getExplorationNumber");
        const explorationNumberItem = sessionStorage.getItem(EXPLORATION_NUMBER_KEY);
        if (explorationNumberItem) {
            const parsedNumber = parseInt(explorationNumberItem);
            if (isNaN(parsedNumber)) {
                Logger_1.logger.debug("BrowserServiceSessionStorage.getExplorationNumber: NaN");
                return undefined;
            }
            else {
                Logger_1.logger.debug("BrowserServiceSessionStorage.getExplorationNumber: " + parsedNumber);
                return parsedNumber;
            }
        }
        Logger_1.logger.debug("BrowserServiceSessionStorage.getExplorationNumber: undefined");
    }
    saveExplorationNumber(explorationNumber) {
        Logger_1.logger.debug("BrowserServiceSessionStorage.saveExplorationNumber: " + explorationNumber);
        sessionStorage.setItem(EXPLORATION_NUMBER_KEY, explorationNumber.toString());
    }
}
exports["default"] = BrowserServiceSessionStorage;


/***/ }),

/***/ "./src/domain/Action.ts":
/*!******************************!*\
  !*** ./src/domain/Action.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class Action {
    constructor(prefix, suffix) {
        this.prefix = prefix;
        this.suffix = suffix;
    }
    toString() {
        if (this.suffix) {
            return `${this.prefix}$${this.suffix}`;
        }
        else {
            return this.prefix;
        }
    }
    equals(action) {
        return ((this.prefix === action.prefix) && (this.suffix === action.suffix));
    }
    static parseAction(actionText) {
        const parts = actionText.split("$");
        if (parts.length === 1) {
            return new Action(parts[0]);
        }
        else if (parts.length === 2) {
            return new Action(parts[0], parts[1]);
        }
        else {
            throw new Error("Failed to parse action : " + actionText);
        }
    }
}
exports["default"] = Action;


/***/ }),

/***/ "./src/domain/EventListener.ts":
/*!*************************************!*\
  !*** ./src/domain/EventListener.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Action_1 = __importDefault(__webpack_require__(/*! ./Action */ "./src/domain/Action.ts"));
const css_selector_generator_1 = __importDefault(__webpack_require__(/*! css-selector-generator */ "./node_modules/css-selector-generator/build/index.js"));
const Logger_1 = __webpack_require__(/*! ../framework/Logger */ "./src/framework/Logger.ts");
class EventListener {
    constructor(serverURL, sessionId, aifexService, browserService) {
        this._serverURL = serverURL;
        this._sessionId = sessionId;
        this._aifexService = aifexService;
        this._browserService = browserService;
        let explorationNumber = this._browserService.getExplorationNumber();
        if (explorationNumber === undefined) {
            this._aifexService.createEmptyExploration("browser-script", this._serverURL, this._sessionId)
                .then((result) => {
                this._browserService.saveExplorationNumber(result);
                this._explorationNumber = result;
                this.listen();
            });
        }
        else {
            this._explorationNumber = explorationNumber;
            this.listen();
        }
    }
    listen() {
        Logger_1.logger.debug(`listening to events`);
        document.addEventListener('mousedown', this.listenToMouseDown.bind(this), true);
        document.addEventListener('keydown', this.listenToKeyDown.bind(this), true);
    }
    listenToMouseDown(event) {
        let unsafeEvent = event;
        if (!unsafeEvent.explored) {
            if (event instanceof MouseEvent) {
                let prefix = 'Click';
                let suffix = this.makeSuffix(event);
                let action = new Action_1.default(prefix, suffix);
                if (this._lastAction !== action.toString()) {
                    this._lastAction = action.toString();
                    if (this._explorationNumber !== undefined) {
                        Logger_1.logger.debug(`action : ${action.toString()}`);
                        this._aifexService.sendAction(this._explorationNumber, action, this._serverURL, this._sessionId).then(() => { }).catch(() => { });
                    }
                }
            }
            unsafeEvent.explored = true;
        }
    }
    listenToKeyDown(event) {
        let unsafeEvent = event;
        if (!unsafeEvent.explored) {
            if (event instanceof KeyboardEvent) {
                let prefix = 'Edit';
                let isEditable = false;
                if (event.target instanceof HTMLInputElement && !event.target.disabled && !event.target.readOnly) {
                    isEditable = true;
                }
                switch (event.code) {
                    case 'Tab':
                        if (event.shiftKey) {
                            prefix = 'ShiftTab';
                        }
                        else {
                            prefix = 'Tab';
                        }
                        break;
                    case 'Enter':
                        if (isEditable) {
                            prefix = 'Edit';
                        }
                        else {
                            prefix = 'Enter';
                        }
                        break;
                    case 'Space':
                        if (isEditable) {
                            prefix = 'Edit';
                        }
                        else {
                            prefix = 'Space';
                        }
                        break;
                    case 'ArrowUp':
                    case 'ArrowDown':
                    case 'ArrowLeft':
                    case 'ArrowRight':
                        prefix = event.code;
                        break;
                    case 'Escape':
                        prefix = 'Escape';
                        break;
                    default:
                        prefix = 'Edit';
                }
                let suffix = this.makeSuffix(event);
                let action = new Action_1.default(prefix, suffix);
                if (this._lastAction !== action.toString()) {
                    this._lastAction = action.toString();
                    if (this._explorationNumber !== undefined) {
                        this._aifexService.sendAction(this._explorationNumber, action, this._serverURL, this._sessionId).then(() => { }).catch(() => { });
                    }
                }
            }
            unsafeEvent.explored = true;
        }
    }
    makeSuffix(event) {
        if (event.target) {
            if (event.target instanceof HTMLElement || event.target instanceof SVGElement) {
                let suffix;
                try {
                    suffix = (0, css_selector_generator_1.default)(event.target, {
                        selectors: [
                            "id",
                            "class",
                            "tag",
                            "attribute"
                        ],
                        blacklist: [
                            /.*data.*/i,
                            /.*aifex.*/i,
                            /.*over.*/i,
                            /.*auto.*/i,
                            /.*value.*/i,
                            /.*checked.*/i,
                            '[placeholder]',
                            /.*href.*/i,
                            /.*src.*/i,
                            /.*onclick.*/i,
                            /.*onload.*/i,
                            /.*onkeyup.*/i,
                            /.*width.*/i,
                            /.*height.*/i,
                            /.*style.*/i,
                            /.*size.*/i,
                            /.*maxlength.*/i
                        ],
                        combineBetweenSelectors: true,
                        maxCandidates: 80,
                        maxCombinations: 80
                    });
                }
                catch (e) {
                    suffix = "error";
                    Logger_1.logger.debug(`[TabScript] exception while generating suffix : ${e}`);
                }
                suffix += `?href=${window.location.href}`;
                const rect = event.target.getBoundingClientRect();
                if (rect) {
                    suffix += `&left=${rect.left}&top=${rect.top}&right=${rect.right}&bottom=${rect.bottom}&width=${rect.width}&height=${rect.height}&screenwidth=${window.innerWidth}&screenheight=${window.innerHeight}`;
                }
                return suffix;
            }
        }
    }
}
exports["default"] = EventListener;


/***/ }),

/***/ "./src/domain/Session.ts":
/*!*******************************!*\
  !*** ./src/domain/Session.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class Session {
    constructor(id, webSiteId, baseURL, name, description, overlayType, recordingMode) {
        if (id === null || id === undefined) {
            throw new Error('cannot create Session without id');
        }
        if (webSiteId === null || webSiteId === undefined) {
            throw new Error('cannot create Session without webSiteId');
        }
        this.id = id;
        this.webSiteId = webSiteId;
        this.baseURL = baseURL;
        this.name = name;
        this.description = description;
        this.overlayType = overlayType;
        this.recordingMode = recordingMode;
    }
}
exports["default"] = Session;


/***/ }),

/***/ "./src/framework/Logger.ts":
/*!*********************************!*\
  !*** ./src/framework/Logger.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.logger = void 0;
const typescript_logging_1 = __webpack_require__(/*! typescript-logging */ "./node_modules/typescript-logging/dist/commonjs/typescript-logging.js");
let logLevel;
switch ("development") {
    case 'production':
        logLevel = typescript_logging_1.LogLevel.Error;
        break;
    case 'development':
        logLevel = typescript_logging_1.LogLevel.Debug;
        break;
    case 'github':
        logLevel = typescript_logging_1.LogLevel.Error;
        break;
    default:
        logLevel = typescript_logging_1.LogLevel.Error;
}
typescript_logging_1.CategoryServiceFactory.setDefaultConfiguration(new typescript_logging_1.CategoryConfiguration(logLevel));
exports.logger = new typescript_logging_1.Category("TabScript");


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const EventListener_1 = __importDefault(__webpack_require__(/*! ./domain/EventListener */ "./src/domain/EventListener.ts"));
const Logger_1 = __webpack_require__(/*! ./framework/Logger */ "./src/framework/Logger.ts");
const AifexServiceHTTP_1 = __importDefault(__webpack_require__(/*! ./_infra/AifexServiceHTTP */ "./src/_infra/AifexServiceHTTP.ts"));
const BrowserServiceSessionStorage_1 = __importDefault(__webpack_require__(/*! ./_infra/BrowserServiceSessionStorage */ "./src/_infra/BrowserServiceSessionStorage.ts"));
Logger_1.logger.info("AIFEX script is running.");
const AIFEX_SCRIPT = document.getElementById("AIFEX");
if (AIFEX_SCRIPT) {
    Logger_1.logger.info("AIFEX SCRIPT Element is found.");
    const CONNEXION_URL = AIFEX_SCRIPT.getAttribute("connexion-url");
    if (CONNEXION_URL) {
        Logger_1.logger.info("AIFEX connexion-url Element is found.");
        try {
            const AIFEX_URL = new URL(CONNEXION_URL);
            let sessionId = AIFEX_URL.searchParams.get('sessionId');
            if (sessionId) {
                Logger_1.logger.info("AIFEX sessionId is found.");
                const AIFEX_SERVICE = new AifexServiceHTTP_1.default();
                const BROWSER_SERVICE = new BrowserServiceSessionStorage_1.default();
                const EVENT_LISTENER = new EventListener_1.default(AIFEX_URL.origin, sessionId, AIFEX_SERVICE, BROWSER_SERVICE);
            }
        }
        catch (e) {
            Logger_1.logger.error("Invalid connexion URL", new Error("Invalid connexion URL"));
        }
    }
}
else {
    Logger_1.logger.error("AIFEX SCRIPT Element is not found.", new Error("AIFEX SCRIPT Element is not found."));
}


/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/control/CategoryServiceControl.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/control/CategoryServiceControl.js ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CategoryServiceControlImpl = void 0;
var CategoryService_1 = __webpack_require__(/*! ../log/category/CategoryService */ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryService.js");
var LoggerOptions_1 = __webpack_require__(/*! ../log/LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
var DataStructures_1 = __webpack_require__(/*! ../utils/DataStructures */ "./node_modules/typescript-logging/dist/commonjs/utils/DataStructures.js");
/**
 * Implementation class for CategoryServiceControl.
 */
var CategoryServiceControlImpl = /** @class */ (function () {
    function CategoryServiceControlImpl() {
    }
    CategoryServiceControlImpl.prototype.help = function () {
        /* tslint:disable:no-console */
        console.log(CategoryServiceControlImpl._help);
        /* tslint:enable:no-console */
    };
    CategoryServiceControlImpl.prototype.example = function () {
        /* tslint:disable:no-console */
        console.log(CategoryServiceControlImpl._example);
        /* tslint:enable:no-console */
    };
    CategoryServiceControlImpl.prototype.showSettings = function (id) {
        if (id === void 0) { id = "all"; }
        var result = new DataStructures_1.StringBuilder();
        var service = CategoryServiceControlImpl._getCategoryService();
        var categories = CategoryServiceControlImpl._getCategories(id);
        categories.forEach(function (category) {
            CategoryServiceControlImpl._processCategory(service, category, result, 0);
        });
        /* tslint:disable:no-console */
        console.log(result.toString());
        /* tslint:enable:no-console */
    };
    CategoryServiceControlImpl.prototype.change = function (settings) {
        var service = CategoryServiceControlImpl._getCategoryService();
        var categories = CategoryServiceControlImpl._getCategories(settings.category);
        var logLevel = null;
        var formatEnum = null;
        var showCategoryName = null;
        var showTimestamp = null;
        var result = null;
        var addResult = function (value) {
            if (result !== null) {
                result += ", ";
            }
            if (result === null) {
                result = value;
            }
            else {
                result += value;
            }
        };
        addResult("recursive=" + settings.recursive);
        if (typeof settings.logLevel === "string") {
            logLevel = LoggerOptions_1.LogLevel.fromString(settings.logLevel);
            addResult("logLevel=" + settings.logLevel);
        }
        if (typeof settings.logFormat === "string") {
            formatEnum = LoggerOptions_1.DateFormatEnum.fromString(settings.logFormat);
            addResult("logFormat=" + settings.logFormat);
        }
        if (typeof settings.showCategoryName === "boolean") {
            showCategoryName = settings.showCategoryName;
            addResult("showCategoryName=" + settings.showCategoryName);
        }
        if (typeof settings.showTimestamp === "boolean") {
            showTimestamp = settings.showTimestamp;
            addResult("showTimestamp=" + settings.showTimestamp);
        }
        var applyChanges = function (cat) {
            var categorySettings = service.getCategorySettings(cat);
            // Should not happen but make tslint happy
            if (categorySettings !== null) {
                if (logLevel !== null) {
                    categorySettings.logLevel = logLevel;
                }
                if (formatEnum !== null) {
                    categorySettings.logFormat.dateFormat.formatEnum = formatEnum;
                }
                if (showTimestamp !== null) {
                    categorySettings.logFormat.showTimeStamp = showTimestamp;
                }
                if (showCategoryName !== null) {
                    categorySettings.logFormat.showCategoryName = showCategoryName;
                }
            }
        };
        categories.forEach(function (cat) { return CategoryServiceControlImpl._applyToCategory(cat, settings.recursive, applyChanges); });
        /* tslint:disable:no-console */
        console.log("Applied changes: " + result + " to categories '" + settings.category + "'.");
        /* tslint:enable:no-console */
    };
    CategoryServiceControlImpl.prototype.reset = function (id) {
        if (id === void 0) { id = "all"; }
        var service = CategoryServiceControlImpl._getCategoryService();
        var categories = CategoryServiceControlImpl._getCategories(id);
        var applyChanges = function (cat) {
            var categorySettings = service.getCategorySettings(cat);
            var original = service.getOriginalCategorySettings(cat);
            // Should not happen but make tslint happy
            if (categorySettings !== null && original !== null) {
                categorySettings.logLevel = original.logLevel;
                categorySettings.logFormat.dateFormat.formatEnum = original.logFormat.dateFormat.formatEnum;
                categorySettings.logFormat.showTimeStamp = original.logFormat.showTimeStamp;
                categorySettings.logFormat.showCategoryName = original.logFormat.showCategoryName;
            }
        };
        categories.forEach(function (cat) { return CategoryServiceControlImpl._applyToCategory(cat, true, applyChanges); });
        /* tslint:disable:no-console */
        console.log("Applied reset to category: " + id + ".");
        /* tslint:enable:no-console */
    };
    CategoryServiceControlImpl._processCategory = function (service, category, result, indent) {
        var settings = service.getCategorySettings(category);
        if (settings !== null) {
            result.append("  " + category.id + ": ");
            if (indent > 0) {
                for (var i = 0; i < indent; i++) {
                    result.append("  ");
                }
            }
            result.append(category.name + " (" + LoggerOptions_1.LogLevel[settings.logLevel].toString() + "@" + LoggerOptions_1.LoggerType[settings.loggerType].toString() + ")\n");
            if (category.children.length > 0) {
                category.children.forEach(function (child) {
                    CategoryServiceControlImpl._processCategory(service, child, result, indent + 1);
                });
            }
        }
    };
    CategoryServiceControlImpl._applyToCategory = function (category, recursive, apply) {
        apply(category);
        if (recursive) {
            category.children.forEach(function (child) {
                CategoryServiceControlImpl._applyToCategory(child, recursive, apply);
            });
        }
    };
    CategoryServiceControlImpl._getCategoryService = function () {
        return CategoryService_1.CategoryServiceImpl.getInstance();
    };
    CategoryServiceControlImpl._getCategories = function (idCategory) {
        var service = CategoryServiceControlImpl._getCategoryService();
        var categories = [];
        if (idCategory === "all") {
            categories = service.getRootCategories();
        }
        else {
            var category = service.getCategoryById(idCategory);
            if (category === null) {
                throw new Error("Failed to find category with id " + idCategory);
            }
            categories.push(category);
        }
        return categories;
    };
    CategoryServiceControlImpl._help = "\n  help(): void\n    ** Shows this help.\n\n  example(): void\n    ** Shows an example on how to use this.\n\n  showSettings(id: number | \"all\" = \"all\"): void\n    ** Shows settings for a specific category, or for all. The id of categories can be found by calling this method without parameter.\n\n  change(settings: CategoryServiceControlSettings): void\n    ** Changes the current settings for one or all categories.\n    **\n       CategoryServiceControlSettings, properties of object:\n         category: number | \"all\"\n           ** Apply to specific category, or \"all\".\n           ** Required\n\n         recursive: boolean\n           ** Apply to child categories (true) or not.\n           ** Required\n\n         logLevel: \"Fatal\" | \"Error\" | \"Warn\" | \"Info\" | \"Debug\" | \"Trace\" | undefined\n           ** Set log level, undefined will not change the setting.\n           ** Optional\n\n         logFormat: \"Default\" | \"YearMonthDayTime\" | \"YearDayMonthWithFullTime\" | \"YearDayMonthTime\" | undefined\n           ** Set the log format, undefined will not change the setting.\n           ** Optional\n\n         showTimestamp: boolean | undefined\n           ** Whether to show timestamp, undefined will not change the setting.\n           ** Optional\n\n         showCategoryName: boolean | undefined\n           ** Whether to show the category name, undefined will not change the setting.\n           ** Optional\n\n   reset(id: number | \"all\"): void\n     ** Resets everything to original values, for one specific or for all categories.\n";
    CategoryServiceControlImpl._example = "\n  Examples:\n    change({category: \"all\", recursive:true, logLevel: \"Info\"})\n      ** Change loglevel to Info for all categories, apply to child categories as well.\n\n    change({category: 1, recursive:false, logLevel: \"Warn\"})\n      ** Change logLevel for category 1, do not recurse.\n\n    change({category: \"all\", recursive:true, logLevel: \"Debug\", logFormat: \"YearDayMonthTime\", showTimestamp:false, showCategoryName:false})\n      ** Change loglevel to Debug for all categories, apply format, do not show timestamp and category names - recursively to child categories.\n\n";
    return CategoryServiceControlImpl;
}());
exports.CategoryServiceControlImpl = CategoryServiceControlImpl;
//# sourceMappingURL=CategoryServiceControl.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/control/LogGroupControl.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/control/LogGroupControl.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggerControlImpl = void 0;
var LoggerOptions_1 = __webpack_require__(/*! ../log/LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
var LFService_1 = __webpack_require__(/*! ../log/standard/LFService */ "./node_modules/typescript-logging/dist/commonjs/log/standard/LFService.js");
var DataStructures_1 = __webpack_require__(/*! ../utils/DataStructures */ "./node_modules/typescript-logging/dist/commonjs/utils/DataStructures.js");
var LoggerControlImpl = /** @class */ (function () {
    function LoggerControlImpl() {
    }
    LoggerControlImpl.prototype.help = function () {
        /* tslint:disable:no-console */
        console.log(LoggerControlImpl._help);
        /* tslint:enable:no-console */
    };
    LoggerControlImpl.prototype.listFactories = function () {
        var rtSettingsFactories = LoggerControlImpl._getRuntimeSettingsLoggerFactories();
        var result = new DataStructures_1.StringBuilder();
        result.appendLine("Registered LoggerFactories (index / name)");
        for (var i = 0; i < rtSettingsFactories.length; i++) {
            var rtSettingsFactory = rtSettingsFactories[i];
            result.append("  " + i).append(": " + rtSettingsFactory.getName() + "\n");
        }
        /* tslint:disable:no-console */
        console.log(result.toString());
        /* tslint:enable:no-console */
    };
    LoggerControlImpl.prototype.showSettings = function (id) {
        if (id === void 0) { id = "all"; }
        var result = [];
        if (id === "all") {
            var idx_1 = 0;
            LoggerControlImpl._getRuntimeSettingsLoggerFactories().forEach(function (item) {
                result.push(new DataStructures_1.TuplePair(idx_1++, item));
            });
        }
        else {
            var settings = LoggerControlImpl._getRuntimeSettingsLoggerFactories();
            if (id >= 0 && id < settings.length) {
                result.push(new DataStructures_1.TuplePair(id, settings[id]));
            }
            else {
                throw new Error("Requested number: " + id + " was not found.");
            }
        }
        for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
            var setting = result_1[_i];
            /* tslint:disable:no-console */
            console.log("  LoggerFactory: " + setting.y.getName() + " (id=" + setting.x + ")");
            var logGroupRuntimeSettings = setting.y.getLogGroupRuntimeSettings();
            for (var g = 0; g < logGroupRuntimeSettings.length; g++) {
                var groupSetting = logGroupRuntimeSettings[g];
                console.log("     LogGroup: (id=" + g + ")");
                console.log("       RegExp: " + groupSetting.logGroupRule.regExp.source);
                console.log("       Level: " + LoggerOptions_1.LogLevel[groupSetting.level].toString());
                console.log("       LoggerType: " + LoggerOptions_1.LoggerType[groupSetting.loggerType].toString());
            }
            /* tslint:enable:no-console */
        }
    };
    LoggerControlImpl.prototype.reset = function (idFactory) {
        if (idFactory === void 0) { idFactory = "all"; }
        var loggerFactoriesSettings = LoggerControlImpl._getRuntimeSettingsLoggerFactories();
        var result = [];
        if (idFactory === "all") {
            result = loggerFactoriesSettings;
        }
        else {
            if (idFactory >= 0 && idFactory < loggerFactoriesSettings.length) {
                result.push(loggerFactoriesSettings[idFactory]);
            }
        }
        result.forEach(function (setting) {
            /* tslint:disable:no-console */
            console.log("Reset all settings for factory " + idFactory);
            /* tslint:enable:no-console */
            var control = new LoggerFactoryControlImpl(setting);
            control.reset();
        });
    };
    LoggerControlImpl.prototype.getLoggerFactoryControl = function (idFactory) {
        var loggerFactoriesSettings = LoggerControlImpl._getRuntimeSettingsLoggerFactories();
        if (idFactory >= 0 && idFactory < loggerFactoriesSettings.length) {
            return new LoggerFactoryControlImpl(loggerFactoriesSettings[idFactory]);
        }
        throw new Error("idFactory is invalid (less than 0) or non existing id.");
    };
    LoggerControlImpl._getRuntimeSettingsLoggerFactories = function () {
        return LoggerControlImpl._getSettings().getRuntimeSettingsForLoggerFactories();
    };
    LoggerControlImpl._getSettings = function () {
        return LFService_1.LFService.getRuntimeSettings();
    };
    LoggerControlImpl._help = "\n  help(): void\n    ** Shows this help.\n\n  listFactories(): void\n    ** List all registered LoggerFactories with associated log groups with respective ids (ids can be used to target a factory and/or group).\n\n  showSettings(idFactory: number | \"all\"): void\n    ** Show log group settings for idFactory (use listFactories to find id for a LoggerFactory). If idFactory is \"all\" shows all factories.\n\n  getLoggerFactoryControl(idFactory: number): LoggerFactoryControl\n    ** Return LoggerFactoryControl when found for given idFactory or throws Error if invalid or null, get the id by using listFactories()\n\n  reset(idFactory: number | \"all\"): void\n    ** Resets given factory or all factories back to original values.\n";
    return LoggerControlImpl;
}());
exports.LoggerControlImpl = LoggerControlImpl;
var LoggerFactoryControlImpl = /** @class */ (function () {
    function LoggerFactoryControlImpl(settings) {
        this._settings = settings;
    }
    LoggerFactoryControlImpl.prototype.help = function () {
        /* tslint:disable:no-console */
        console.log(LoggerFactoryControlImpl._help);
        /* tslint:enable:no-console */
    };
    LoggerFactoryControlImpl.prototype.example = function () {
        /* tslint:disable:no-console */
        console.log(LoggerFactoryControlImpl._example);
        /* tslint:enable:no-console */
    };
    LoggerFactoryControlImpl.prototype.showSettings = function (id) {
        if (id === void 0) { id = "all"; }
        var result = new DataStructures_1.StringBuilder();
        var logGroupRuntimeSettings = this._settings.getLogGroupRuntimeSettings();
        result.appendLine("Registered LogGroups (index / expression)");
        for (var i = 0; i < logGroupRuntimeSettings.length; i++) {
            var logGroupRuntimeSetting = logGroupRuntimeSettings[i];
            result.appendLine("  " + i + ": " + logGroupRuntimeSetting.logGroupRule.regExp.source + ", logLevel=" +
                LoggerOptions_1.LogLevel[logGroupRuntimeSetting.level].toString() + ", showTimestamp=" + logGroupRuntimeSetting.logFormat.showTimeStamp +
                ", showLoggerName=" + logGroupRuntimeSetting.logFormat.showLoggerName +
                ", format=" + LoggerOptions_1.DateFormatEnum[logGroupRuntimeSetting.logFormat.dateFormat.formatEnum].toString());
        }
        /* tslint:disable:no-console */
        console.log(result.toString());
        /* tslint:enable:no-console */
    };
    LoggerFactoryControlImpl.prototype.change = function (settings) {
        var logGroupRuntimeSettings = this._getLogGroupRunTimeSettingsFor(settings.group);
        var logLevel = null;
        var formatEnum = null;
        var showLoggerName = null;
        var showTimestamp = null;
        var result = null;
        var addResult = function (value) {
            if (result !== null) {
                result += ", ";
            }
            if (result === null) {
                result = value;
            }
            else {
                result += value;
            }
        };
        if (typeof settings.logLevel === "string") {
            logLevel = LoggerOptions_1.LogLevel.fromString(settings.logLevel);
            addResult("logLevel=" + settings.logLevel);
        }
        if (typeof settings.logFormat === "string") {
            formatEnum = LoggerOptions_1.DateFormatEnum.fromString(settings.logFormat);
            addResult("logFormat=" + settings.logFormat);
        }
        if (typeof settings.showLoggerName === "boolean") {
            showLoggerName = settings.showLoggerName;
            addResult("showLoggerName=" + settings.showLoggerName);
        }
        if (typeof settings.showTimestamp === "boolean") {
            showTimestamp = settings.showTimestamp;
            addResult("showTimestamp=" + settings.showTimestamp);
        }
        logGroupRuntimeSettings.forEach(function (s) {
            if (logLevel !== null) {
                s.level = logLevel;
            }
            if (formatEnum !== null) {
                s.logFormat.dateFormat.formatEnum = formatEnum;
            }
            if (showTimestamp !== null) {
                s.logFormat.showTimeStamp = showTimestamp;
            }
            if (showLoggerName !== null) {
                s.logFormat.showLoggerName = showLoggerName;
            }
        });
        /* tslint:disable:no-console */
        console.log("Applied changes: " + result + " to log groups '" + settings.group + "'.");
        /* tslint:enable:no-console */
    };
    LoggerFactoryControlImpl.prototype.reset = function (idGroup) {
        if (idGroup === void 0) { idGroup = "all"; }
        var settings = this._getLogGroupRunTimeSettingsFor(idGroup);
        for (var _i = 0, settings_1 = settings; _i < settings_1.length; _i++) {
            var setting = settings_1[_i];
            setting.level = setting.logGroupRule.level;
            setting.logFormat.showTimeStamp = setting.logGroupRule.logFormat.showTimeStamp;
            setting.logFormat.showLoggerName = setting.logGroupRule.logFormat.showLoggerName;
            setting.logFormat.dateFormat.formatEnum = setting.logGroupRule.logFormat.dateFormat.formatEnum;
        }
        /* tslint:disable:no-console */
        console.log("Reset all settings for group " + idGroup);
        /* tslint:enable:no-console */
    };
    LoggerFactoryControlImpl.prototype._getLogGroupRunTimeSettingsFor = function (idGroup) {
        var settings = [];
        if (idGroup === "all") {
            settings = this._settings.getLogGroupRuntimeSettings();
        }
        else {
            this._checkIndex(idGroup);
            settings.push(this._settings.getLogGroupRuntimeSettings()[idGroup]);
        }
        return settings;
    };
    LoggerFactoryControlImpl.prototype._checkIndex = function (index) {
        if (index < 0 || index >= this._settings.getLogGroupRuntimeSettings().length) {
            throw new Error("Invalid index, use listLogGroups to find out a valid one.");
        }
    };
    LoggerFactoryControlImpl._help = "\n  help(): void\n    ** Shows this help.\n\n  example(): void\n    ** Shows an example of usage.\n\n  showSettings(id: number | \"all\"): void\n    ** Prints settings for given group id, \"all\" for all group.\n\n  change(settings: LogGroupControlSettings): void\n    ** Changes the current settings for one or all log groups.\n    **\n       LogGroupControlSettings, properties of object:\n         group: number | \"all\"\n           ** Apply to specific group, or \"all\".\n           ** Required\n\n         logLevel: \"Fatal\" | \"Error\" | \"Warn\" | \"Info\" | \"Debug\" | \"Trace\" | undefined\n           ** Set log level, undefined will not change the setting.\n           ** Optional\n\n         logFormat: \"Default\" | \"YearMonthDayTime\" | \"YearDayMonthWithFullTime\" | \"YearDayMonthTime\" | undefined\n           ** Set the log format, undefined will not change the setting.\n           ** Optional\n\n         showTimestamp: boolean | undefined\n           ** Whether to show timestamp, undefined will not change the setting.\n           ** Optional\n\n         showLoggerName: boolean | undefined\n           ** Whether to show the logger name, undefined will not change the setting.\n           ** Optional\n\n  reset(id: number | \"all\"): void\n    ** Resets everything to original values, for one specific or for all groups.\n\n  help():\n    ** Shows this help.\n";
    LoggerFactoryControlImpl._example = "\n  Examples:\n    change({group: \"all\", logLevel: \"Info\"})\n      ** Change loglevel to Info for all groups.\n\n    change({group: 1, recursive:false, logLevel: \"Warn\"})\n      ** Change logLevel for group 1 to Warn.\n\n    change({group: \"all\", logLevel: \"Debug\", logFormat: \"YearDayMonthTime\", showTimestamp:false, showLoggerName:false})\n      ** Change loglevel to Debug for all groups, apply format, do not show timestamp and logger names.\n";
    return LoggerFactoryControlImpl;
}());
//# sourceMappingURL=LogGroupControl.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/extension/ExtensionHelper.js":
/*!************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/extension/ExtensionHelper.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExtensionHelper = void 0;
var CategoryService_1 = __webpack_require__(/*! ../log/category/CategoryService */ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryService.js");
var LoggerOptions_1 = __webpack_require__(/*! ../log/LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
var MessageUtils_1 = __webpack_require__(/*! ../utils/MessageUtils */ "./node_modules/typescript-logging/dist/commonjs/utils/MessageUtils.js");
var ExtensionHelper = /** @class */ (function () {
    function ExtensionHelper() {
        // Private constructor
    }
    /**
     * Enables the window event listener to listen to messages (from extensions).
     * Can be registered/enabled only once.
     */
    ExtensionHelper.register = function () {
        if (!ExtensionHelper.registered) {
            var listener = function (evt) {
                var msg = evt.data;
                if (msg !== null) {
                    ExtensionHelper.processMessageFromExtension(msg);
                }
            };
            if (typeof window !== "undefined" && typeof window.removeEventListener !== "undefined" && typeof window.addEventListener !== "undefined") {
                window.removeEventListener("message", listener);
                window.addEventListener("message", listener);
                ExtensionHelper.registered = true;
            }
        }
    };
    ExtensionHelper.processMessageFromExtension = function (msg) {
        if (!ExtensionHelper.registered) {
            return;
        }
        /* tslint:disable:no-console */
        if (msg.from === "tsl-extension") {
            var data = msg.data;
            switch (data.type) {
                case "register":
                    ExtensionHelper.enableExtensionIntegration();
                    break;
                case "request-change-loglevel":
                    var valueRequest = data.value;
                    var catsApplied = ExtensionHelper.applyLogLevel(valueRequest.categoryId, valueRequest.logLevel, valueRequest.recursive);
                    if (catsApplied.length > 0) {
                        // Send changes back
                        ExtensionHelper.sendCategoriesRuntimeUpdateMessage(catsApplied);
                    }
                    break;
                default:
                    console.log("Unknown command to process message from extension, command was: " + data.type);
                    break;
            }
        }
        /* tslint:enable:no-console */
    };
    ExtensionHelper.sendCategoryLogMessage = function (msg) {
        if (!ExtensionHelper.registered) {
            return;
        }
        var categoryIds = msg.categories.map(function (cat) {
            return cat.id;
        });
        var content = {
            type: "log-message",
            value: {
                categories: categoryIds,
                errorAsStack: msg.errorAsStack,
                formattedMessage: MessageUtils_1.MessageFormatUtils.renderDefaultMessage(msg, false),
                logLevel: LoggerOptions_1.LogLevel[msg.level].toString(),
                message: msg.messageAsString,
                resolvedErrorMessage: msg.isResolvedErrorMessage
            }
        };
        var message = {
            data: content,
            from: "tsl-logging",
        };
        ExtensionHelper.sendMessage(message);
    };
    ExtensionHelper.sendCategoriesRuntimeUpdateMessage = function (categories) {
        if (!ExtensionHelper.registered) {
            return;
        }
        var service = CategoryService_1.CategoryServiceImpl.getInstance();
        var catLevels = { categories: Array() };
        categories.forEach(function (cat) {
            var catSettings = service.getCategorySettings(cat);
            if (catSettings != null) {
                catLevels.categories.push({ id: cat.id, logLevel: LoggerOptions_1.LogLevel[catSettings.logLevel].toString() });
            }
        });
        var content = {
            type: "categories-rt-update",
            value: catLevels,
        };
        var message = {
            data: content,
            from: "tsl-logging"
        };
        ExtensionHelper.sendMessage(message);
    };
    ExtensionHelper.sendRootCategoriesToExtension = function () {
        if (!ExtensionHelper.registered) {
            return;
        }
        var categories = CategoryService_1.CategoryServiceImpl.getInstance().getRootCategories().map(function (cat) {
            return ExtensionHelper.getCategoryAsJSON(cat);
        });
        var content = {
            type: "root-categories-tree",
            value: categories
        };
        var message = {
            data: content,
            from: "tsl-logging"
        };
        ExtensionHelper.sendMessage(message);
    };
    /**
     * If extension integration is enabled, will send the root categories over to the extension.
     * Otherwise does nothing.
     */
    ExtensionHelper.getCategoryAsJSON = function (cat) {
        var childCategories = cat.children.map(function (child) {
            return ExtensionHelper.getCategoryAsJSON(child);
        });
        return {
            children: childCategories,
            id: cat.id,
            logLevel: LoggerOptions_1.LogLevel[cat.logLevel].toString(),
            name: cat.name,
            parentId: (cat.parent != null ? cat.parent.id : null),
        };
    };
    ExtensionHelper.applyLogLevel = function (categoryId, logLevel, recursive) {
        var cats = [];
        var category = CategoryService_1.CategoryServiceImpl.getInstance().getCategoryById(categoryId);
        if (category != null) {
            ExtensionHelper._applyLogLevelRecursive(category, LoggerOptions_1.LogLevel.fromString(logLevel), recursive, cats);
        }
        else {
            /* tslint:disable:no-console */
            console.log("Could not change log level, failed to find category with id: " + categoryId);
            /* tslint:enable:no-console */
        }
        return cats;
    };
    ExtensionHelper._applyLogLevelRecursive = function (category, logLevel, recursive, cats) {
        var categorySettings = CategoryService_1.CategoryServiceImpl.getInstance().getCategorySettings(category);
        if (categorySettings != null) {
            categorySettings.logLevel = logLevel;
            cats.push(category);
            if (recursive) {
                category.children.forEach(function (child) {
                    ExtensionHelper._applyLogLevelRecursive(child, logLevel, recursive, cats);
                });
            }
        }
    };
    ExtensionHelper.getAllCategories = function () {
        var cats = [];
        var addCats = function (cat, allCats) {
            allCats.push(cat);
            cat.children.forEach(function (catChild) {
                addCats(catChild, allCats);
            });
        };
        CategoryService_1.CategoryServiceImpl.getInstance().getRootCategories().forEach(function (cat) {
            addCats(cat, cats);
        });
        return cats;
    };
    ExtensionHelper.sendMessage = function (msg) {
        if (!ExtensionHelper.registered) {
            return;
        }
        if (typeof window !== "undefined" && typeof window.postMessage !== "undefined") {
            window.postMessage(msg, "*");
        }
    };
    /**
     *  Extension framework will call this to enable the integration between two,
     *  after this call the framework will respond with postMessage() messages.
     */
    ExtensionHelper.enableExtensionIntegration = function () {
        if (!ExtensionHelper.registered) {
            return;
        }
        var instance = CategoryService_1.CategoryServiceImpl.getInstance();
        instance.enableExtensionIntegration();
        // Send over all categories
        ExtensionHelper.sendRootCategoriesToExtension();
        // Send over the current runtime levels
        var cats = ExtensionHelper.getAllCategories();
        ExtensionHelper.sendCategoriesRuntimeUpdateMessage(cats);
    };
    ExtensionHelper.registered = false;
    return ExtensionHelper;
}());
exports.ExtensionHelper = ExtensionHelper;
//# sourceMappingURL=ExtensionHelper.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/extension/ExtensionMessageJSON.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/extension/ExtensionMessageJSON.js ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=ExtensionMessageJSON.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/extension/MessagesFromExtensionJSON.js":
/*!**********************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/extension/MessagesFromExtensionJSON.js ***!
  \**********************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=MessagesFromExtensionJSON.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/extension/MessagesToExtensionJSON.js":
/*!********************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/extension/MessagesToExtensionJSON.js ***!
  \********************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=MessagesToExtensionJSON.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js":
/*!****************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CategoryLogFormat = exports.LogFormat = exports.DateFormat = exports.DateFormatEnum = exports.LoggerType = exports.LogLevel = void 0;
/**
 * Log level for a logger.
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Trace"] = 0] = "Trace";
    LogLevel[LogLevel["Debug"] = 1] = "Debug";
    LogLevel[LogLevel["Info"] = 2] = "Info";
    LogLevel[LogLevel["Warn"] = 3] = "Warn";
    LogLevel[LogLevel["Error"] = 4] = "Error";
    LogLevel[LogLevel["Fatal"] = 5] = "Fatal";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
/* tslint:disable:no-namespace */
(function (LogLevel) {
    /**
     * Returns LogLevel based on string representation
     * @param val Value
     * @returns {LogLevel}, Error is thrown if invalid.
     */
    function fromString(val) {
        if (val == null) {
            throw new Error("Argument must be set");
        }
        switch (val.toLowerCase()) {
            case "trace":
                return LogLevel.Trace;
            case "debug":
                return LogLevel.Debug;
            case "info":
                return LogLevel.Info;
            case "warn":
                return LogLevel.Warn;
            case "error":
                return LogLevel.Error;
            case "fatal":
                return LogLevel.Fatal;
            default:
                throw new Error("Unsupported value for conversion: " + val);
        }
    }
    LogLevel.fromString = fromString;
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
/* tslint:disable:enable-namespace */
/**
 * Where to log to? Pick one of the constants. Custom requires a callback to be present, see LFService.createLoggerFactory(...)
 * where this comes into play.
 */
var LoggerType;
(function (LoggerType) {
    LoggerType[LoggerType["Console"] = 0] = "Console";
    LoggerType[LoggerType["MessageBuffer"] = 1] = "MessageBuffer";
    LoggerType[LoggerType["Custom"] = 2] = "Custom";
})(LoggerType = exports.LoggerType || (exports.LoggerType = {}));
/**
 * Defines several date enums used for formatting a date.
 */
var DateFormatEnum;
(function (DateFormatEnum) {
    /**
     * Displays as: year-month-day hour:minute:second,millis -> 1999-02-12 23:59:59,123
     * Note the date separator can be set separately.
     */
    DateFormatEnum[DateFormatEnum["Default"] = 0] = "Default";
    /**
     * Displays as: year-month-day hour:minute:second -> 1999-02-12 23:59:59
     * Note the date separator can be set separately.
     */
    DateFormatEnum[DateFormatEnum["YearMonthDayTime"] = 1] = "YearMonthDayTime";
    /**
     * Displays as: year-day-month hour:minute:second,millis -> 1999-12-02 23:59:59,123
     * Note the date separator can be set separately.
     */
    DateFormatEnum[DateFormatEnum["YearDayMonthWithFullTime"] = 2] = "YearDayMonthWithFullTime";
    /**
     * Displays as: year-day-month hour:minute:second -> 1999-12-02 23:59:59
     * Note the date separator can be set separately.
     */
    DateFormatEnum[DateFormatEnum["YearDayMonthTime"] = 3] = "YearDayMonthTime";
})(DateFormatEnum = exports.DateFormatEnum || (exports.DateFormatEnum = {}));
/* tslint:disable:no-namespace */
(function (DateFormatEnum) {
    /**
     * Returns LogLevel based on string representation
     * @param val Value
     * @returns {LogLevel}, Error is thrown if invalid.
     */
    function fromString(val) {
        if (val == null) {
            throw new Error("Argument must be set");
        }
        switch (val.toLowerCase()) {
            case "default":
                return DateFormatEnum.Default;
            case "yearmonthdayTime":
                return DateFormatEnum.YearMonthDayTime;
            case "yeardaymonthwithfulltime":
                return DateFormatEnum.YearDayMonthWithFullTime;
            case "yeardaymonthtime":
                return DateFormatEnum.YearDayMonthTime;
            default:
                throw new Error("Unsupported value for conversion: " + val);
        }
    }
    DateFormatEnum.fromString = fromString;
})(DateFormatEnum = exports.DateFormatEnum || (exports.DateFormatEnum = {}));
/* tslint:disable:enable-namespace */
/**
 * DateFormat class, stores data on how to format a date.
 */
var DateFormat = /** @class */ (function () {
    /**
     * Constructor to define the dateformat used for logging, can be called empty as it uses defaults.
     * @param formatEnum DateFormatEnum, use one of the constants from the enum. Defaults to DateFormatEnum.Default
     * @param dateSeparator Separator used between dates, defaults to -
     */
    function DateFormat(formatEnum, dateSeparator) {
        if (formatEnum === void 0) { formatEnum = DateFormatEnum.Default; }
        if (dateSeparator === void 0) { dateSeparator = "-"; }
        this._formatEnum = formatEnum;
        this._dateSeparator = dateSeparator;
    }
    Object.defineProperty(DateFormat.prototype, "formatEnum", {
        get: function () {
            return this._formatEnum;
        },
        set: function (value) {
            this._formatEnum = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DateFormat.prototype, "dateSeparator", {
        get: function () {
            return this._dateSeparator;
        },
        set: function (value) {
            this._dateSeparator = value;
        },
        enumerable: false,
        configurable: true
    });
    DateFormat.prototype.copy = function () {
        return new DateFormat(this._formatEnum, this._dateSeparator);
    };
    return DateFormat;
}());
exports.DateFormat = DateFormat;
/**
 * Information about the log format, what will a log line look like?
 */
var LogFormat = /** @class */ (function () {
    /**
     * Constructor to create a LogFormat. Can be created without parameters where it will use sane defaults.
     * @param dateFormat DateFormat (what needs the date look like in the log line)
     * @param showTimeStamp Show date timestamp at all?
     * @param showLoggerName Show the logger name?
     */
    function LogFormat(dateFormat, showTimeStamp, showLoggerName) {
        if (dateFormat === void 0) { dateFormat = new DateFormat(); }
        if (showTimeStamp === void 0) { showTimeStamp = true; }
        if (showLoggerName === void 0) { showLoggerName = true; }
        this._showTimeStamp = true;
        this._showLoggerName = true;
        this._dateFormat = dateFormat;
        this._showTimeStamp = showTimeStamp;
        this._showLoggerName = showLoggerName;
    }
    Object.defineProperty(LogFormat.prototype, "dateFormat", {
        get: function () {
            return this._dateFormat;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogFormat.prototype, "showTimeStamp", {
        get: function () {
            return this._showTimeStamp;
        },
        set: function (value) {
            this._showTimeStamp = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogFormat.prototype, "showLoggerName", {
        get: function () {
            return this._showLoggerName;
        },
        set: function (value) {
            this._showLoggerName = value;
        },
        enumerable: false,
        configurable: true
    });
    return LogFormat;
}());
exports.LogFormat = LogFormat;
/**
 * Information about the log format, what will a log line look like?
 */
var CategoryLogFormat = /** @class */ (function () {
    /**
     * Create an instance defining the category log format used.
     * @param dateFormat Date format (uses default), for details see DateFormat class.
     * @param showTimeStamp True to show timestamp in the logging, defaults to true.
     * @param showCategoryName True to show category name in the logging, defaults to true.
     */
    function CategoryLogFormat(dateFormat, showTimeStamp, showCategoryName) {
        if (dateFormat === void 0) { dateFormat = new DateFormat(); }
        if (showTimeStamp === void 0) { showTimeStamp = true; }
        if (showCategoryName === void 0) { showCategoryName = true; }
        this._dateFormat = dateFormat;
        this._showTimeStamp = showTimeStamp;
        this._showCategoryName = showCategoryName;
    }
    Object.defineProperty(CategoryLogFormat.prototype, "dateFormat", {
        get: function () {
            return this._dateFormat;
        },
        set: function (value) {
            this._dateFormat = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryLogFormat.prototype, "showTimeStamp", {
        get: function () {
            return this._showTimeStamp;
        },
        set: function (value) {
            this._showTimeStamp = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryLogFormat.prototype, "showCategoryName", {
        get: function () {
            return this._showCategoryName;
        },
        set: function (value) {
            this._showCategoryName = value;
        },
        enumerable: false,
        configurable: true
    });
    CategoryLogFormat.prototype.copy = function () {
        return new CategoryLogFormat(this._dateFormat.copy(), this._showTimeStamp, this._showCategoryName);
    };
    return CategoryLogFormat;
}());
exports.CategoryLogFormat = CategoryLogFormat;
//# sourceMappingURL=LoggerOptions.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/category/AbstractCategoryLogger.js":
/*!**********************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/category/AbstractCategoryLogger.js ***!
  \**********************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AbstractCategoryLogger = void 0;
var DataStructures_1 = __webpack_require__(/*! ../../utils/DataStructures */ "./node_modules/typescript-logging/dist/commonjs/utils/DataStructures.js");
var MessageUtils_1 = __webpack_require__(/*! ../../utils/MessageUtils */ "./node_modules/typescript-logging/dist/commonjs/utils/MessageUtils.js");
var LoggerOptions_1 = __webpack_require__(/*! ../LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
var CategoryLogMessageImpl = /** @class */ (function () {
    function CategoryLogMessageImpl(message, error, categories, date, level, logFormat, ready) {
        this._resolvedErrorMessage = false;
        this._errorAsStack = null;
        this._message = message;
        this._error = error;
        this._categories = categories;
        this._date = date;
        this._level = level;
        this._logFormat = logFormat;
        this._ready = ready;
    }
    Object.defineProperty(CategoryLogMessageImpl.prototype, "message", {
        get: function () {
            return this._message;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryLogMessageImpl.prototype, "error", {
        get: function () {
            return this._error;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryLogMessageImpl.prototype, "categories", {
        get: function () {
            return this._categories;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryLogMessageImpl.prototype, "date", {
        get: function () {
            return this._date;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryLogMessageImpl.prototype, "level", {
        get: function () {
            return this._level;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryLogMessageImpl.prototype, "logFormat", {
        get: function () {
            return this._logFormat;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryLogMessageImpl.prototype, "isMessageLogData", {
        get: function () {
            return typeof (this._message) !== "string";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryLogMessageImpl.prototype, "messageAsString", {
        get: function () {
            if (typeof (this._message) === "string") {
                return this._message;
            }
            return this._message.msg;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryLogMessageImpl.prototype, "logData", {
        get: function () {
            var result = null;
            if (typeof (this._message) !== "string") {
                result = this.message;
            }
            return result;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryLogMessageImpl.prototype, "isResolvedErrorMessage", {
        get: function () {
            return this._resolvedErrorMessage;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryLogMessageImpl.prototype, "errorAsStack", {
        get: function () {
            return this._errorAsStack;
        },
        set: function (stack) {
            this._errorAsStack = stack;
        },
        enumerable: false,
        configurable: true
    });
    CategoryLogMessageImpl.prototype.isReady = function () {
        return this._ready;
    };
    CategoryLogMessageImpl.prototype.setReady = function (value) {
        this._ready = value;
    };
    Object.defineProperty(CategoryLogMessageImpl.prototype, "resolvedErrorMessage", {
        get: function () {
            return this._resolvedErrorMessage;
        },
        set: function (value) {
            this._resolvedErrorMessage = value;
        },
        enumerable: false,
        configurable: true
    });
    return CategoryLogMessageImpl;
}());
/**
 * Abstract category logger, use as your base class for new type of loggers (it
 * saves you a lot of work) and override doLog(CategoryLogMessage). The message argument
 * provides full access to anything related to the logging event.
 * If you just want the standard line of logging, call: this.createDefaultLogMessage(msg) on
 * this class which will return you the formatted log message as string (e.g. the
 * default loggers all use this).
 */
var AbstractCategoryLogger = /** @class */ (function () {
    function AbstractCategoryLogger(rootCategory, runtimeSettings) {
        this.allMessages = new DataStructures_1.LinkedList();
        this.rootCategory = rootCategory;
        this.runtimeSettings = runtimeSettings;
    }
    AbstractCategoryLogger.prototype.trace = function (msg) {
        var categories = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            categories[_i - 1] = arguments[_i];
        }
        this._log.apply(this, __spreadArray([LoggerOptions_1.LogLevel.Trace, msg, null, false], categories, false));
    };
    AbstractCategoryLogger.prototype.debug = function (msg) {
        var categories = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            categories[_i - 1] = arguments[_i];
        }
        this._log.apply(this, __spreadArray([LoggerOptions_1.LogLevel.Debug, msg, null, false], categories, false));
    };
    AbstractCategoryLogger.prototype.info = function (msg) {
        var categories = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            categories[_i - 1] = arguments[_i];
        }
        this._log.apply(this, __spreadArray([LoggerOptions_1.LogLevel.Info, msg, null, false], categories, false));
    };
    AbstractCategoryLogger.prototype.warn = function (msg) {
        var categories = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            categories[_i - 1] = arguments[_i];
        }
        this._log.apply(this, __spreadArray([LoggerOptions_1.LogLevel.Warn, msg, null, false], categories, false));
    };
    AbstractCategoryLogger.prototype.error = function (msg, error) {
        var categories = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            categories[_i - 2] = arguments[_i];
        }
        this._log.apply(this, __spreadArray([LoggerOptions_1.LogLevel.Error, msg, error, false], categories, false));
    };
    AbstractCategoryLogger.prototype.fatal = function (msg, error) {
        var categories = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            categories[_i - 2] = arguments[_i];
        }
        this._log.apply(this, __spreadArray([LoggerOptions_1.LogLevel.Fatal, msg, error, false], categories, false));
    };
    AbstractCategoryLogger.prototype.resolved = function (msg, error) {
        var categories = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            categories[_i - 2] = arguments[_i];
        }
        this._log.apply(this, __spreadArray([LoggerOptions_1.LogLevel.Error, msg, error, true], categories, false));
    };
    AbstractCategoryLogger.prototype.log = function (level, msg, error) {
        var categories = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            categories[_i - 3] = arguments[_i];
        }
        this._log.apply(this, __spreadArray([level, msg, error, false], categories, false));
    };
    AbstractCategoryLogger.prototype.getRootCategory = function () {
        return this.rootCategory;
    };
    AbstractCategoryLogger.prototype.createDefaultLogMessage = function (msg) {
        return MessageUtils_1.MessageFormatUtils.renderDefaultMessage(msg, true);
    };
    /**
     * Return optional message formatter. All LoggerTypes (except custom) will see if
     * they have this, and if so use it to log.
     * @returns {((message:CategoryLogMessage)=>string)|null}
     */
    AbstractCategoryLogger.prototype._getMessageFormatter = function () {
        var categorySettings = this.runtimeSettings.getCategorySettings(this.rootCategory);
        // Should not happen but make ts happy
        if (categorySettings === null) {
            throw new Error("Did not find CategorySettings for rootCategory: " + this.rootCategory.name);
        }
        return categorySettings.formatterLogMessage;
    };
    AbstractCategoryLogger.prototype._log = function (level, msg, error, resolved) {
        if (error === void 0) { error = null; }
        if (resolved === void 0) { resolved = false; }
        var categories = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            categories[_i - 4] = arguments[_i];
        }
        // this._logInternal(level, () => msg, () => error, resolved, ...categories);
        var functionMessage = function () {
            if (typeof msg === "function") {
                return msg();
            }
            return msg;
        };
        var functionError = function () {
            if (typeof error === "function") {
                return error();
            }
            return error;
        };
        this._logInternal.apply(this, __spreadArray([level, functionMessage, functionError, resolved], categories, false));
    };
    AbstractCategoryLogger.prototype._logInternal = function (level, msg, error, resolved) {
        var _this = this;
        var categories = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            categories[_i - 4] = arguments[_i];
        }
        var logCategories = [this.rootCategory];
        // Log root category by default if none present
        if (typeof categories !== "undefined" && categories.length > 0) {
            logCategories = logCategories.concat(categories.filter(function (c) { return c !== _this.rootCategory; }));
        }
        var _loop_1 = function (i) {
            var category = logCategories[i];
            if (category === null) {
                throw new Error("Cannot have a null element within categories, at index=" + i);
            }
            var settings = this_1.runtimeSettings.getCategorySettings(category);
            if (settings === null) {
                throw new Error("Category with path: " + category.getCategoryPath() + " is not registered with this logger, maybe " +
                    "you registered it with a different root logger?");
            }
            if (settings.logLevel <= level) {
                var actualError = error !== null ? error() : null;
                if (actualError === null) {
                    var logMessage = new CategoryLogMessageImpl(msg(), actualError, logCategories, new Date(), level, settings.logFormat, true);
                    logMessage.resolvedErrorMessage = resolved;
                    this_1.allMessages.addTail(logMessage);
                    this_1.processMessages();
                }
                else {
                    var logMessage_1 = new CategoryLogMessageImpl(msg(), actualError, logCategories, new Date(), level, settings.logFormat, false);
                    logMessage_1.resolvedErrorMessage = resolved;
                    this_1.allMessages.addTail(logMessage_1);
                    MessageUtils_1.MessageFormatUtils.renderError(actualError).then(function (stack) {
                        logMessage_1.errorAsStack = stack;
                        logMessage_1.setReady(true);
                        _this.processMessages();
                    }).catch(function () {
                        logMessage_1.errorAsStack = "<UNKNOWN> unable to get stack.";
                        logMessage_1.setReady(true);
                        _this.processMessages();
                    });
                }
                return "break";
            }
        };
        var this_1 = this;
        // Get the runtime levels for given categories. If their level is lower than given level, we log.
        // In addition we pass along which category/categories we log this statement for.
        for (var i = 0; i < logCategories.length; i++) {
            var state_1 = _loop_1(i);
            if (state_1 === "break")
                break;
        }
    };
    AbstractCategoryLogger.prototype.processMessages = function () {
        // Basically we wait until errors are resolved (those messages
        // may not be ready).
        var msgs = this.allMessages;
        if (msgs.getSize() > 0) {
            do {
                var msg = msgs.getHead();
                if (msg != null) {
                    if (!msg.isReady()) {
                        break;
                    }
                    msgs.removeHead();
                    this.doLog(msg);
                }
            } while (msgs.getSize() > 0);
        }
    };
    return AbstractCategoryLogger;
}());
exports.AbstractCategoryLogger = AbstractCategoryLogger;
//# sourceMappingURL=AbstractCategoryLogger.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/category/Category.js":
/*!********************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/category/Category.js ***!
  \********************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Category = void 0;
var LoggerOptions_1 = __webpack_require__(/*! ../LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
var CategoryService_1 = __webpack_require__(/*! ./CategoryService */ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryService.js");
/**
 * Category for use with categorized logging.
 * At minimum you need one category, which will serve as the root category.
 * You can create child categories (like a tree). You can have multiple root
 * categories.
 */
var Category = /** @class */ (function () {
    function Category(name, parent) {
        if (parent === void 0) { parent = null; }
        this._children = [];
        this._logLevel = LoggerOptions_1.LogLevel.Error;
        if (name.indexOf("#") !== -1) {
            throw new Error("Cannot use # in a name of a Category");
        }
        this._id = Category.nextId();
        this._name = name;
        this._parent = parent;
        if (this._parent !== null) {
            this._parent._children.push(this);
        }
        CategoryService_1.CategoryServiceImpl.getInstance().registerCategory(this);
    }
    Object.defineProperty(Category.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Category.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Category.prototype, "children", {
        get: function () {
            return this._children;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Category.prototype, "logLevel", {
        get: function () {
            return this._logLevel;
        },
        enumerable: false,
        configurable: true
    });
    Category.prototype.trace = function (msg) {
        var _a;
        var categories = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            categories[_i - 1] = arguments[_i];
        }
        this.loadCategoryLogger();
        (_a = this._logger).trace.apply(_a, __spreadArray([msg], categories, false));
    };
    Category.prototype.debug = function (msg) {
        var _a;
        var categories = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            categories[_i - 1] = arguments[_i];
        }
        this.loadCategoryLogger();
        (_a = this._logger).debug.apply(_a, __spreadArray([msg], categories, false));
    };
    Category.prototype.info = function (msg) {
        var _a;
        var categories = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            categories[_i - 1] = arguments[_i];
        }
        this.loadCategoryLogger();
        (_a = this._logger).info.apply(_a, __spreadArray([msg], categories, false));
    };
    Category.prototype.warn = function (msg) {
        var _a;
        var categories = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            categories[_i - 1] = arguments[_i];
        }
        this.loadCategoryLogger();
        (_a = this._logger).warn.apply(_a, __spreadArray([msg], categories, false));
    };
    Category.prototype.error = function (msg, error) {
        var _a;
        var categories = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            categories[_i - 2] = arguments[_i];
        }
        this.loadCategoryLogger();
        (_a = this._logger).error.apply(_a, __spreadArray([msg, error], categories, false));
    };
    Category.prototype.fatal = function (msg, error) {
        var _a;
        var categories = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            categories[_i - 2] = arguments[_i];
        }
        this.loadCategoryLogger();
        (_a = this._logger).fatal.apply(_a, __spreadArray([msg, error], categories, false));
    };
    Category.prototype.resolved = function (msg, error) {
        var _a;
        var categories = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            categories[_i - 2] = arguments[_i];
        }
        this.loadCategoryLogger();
        (_a = this._logger).resolved.apply(_a, __spreadArray([msg, error], categories, false));
    };
    Category.prototype.log = function (level, msg, error) {
        var _a;
        var categories = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            categories[_i - 3] = arguments[_i];
        }
        this.loadCategoryLogger();
        (_a = this._logger).log.apply(_a, __spreadArray([level, msg, error], categories, false));
    };
    Category.prototype.getCategoryPath = function () {
        var result = this.name;
        var cat = this.parent;
        while (cat != null) {
            result = cat.name + "#" + result;
            cat = cat.parent;
        }
        return result;
    };
    Object.defineProperty(Category.prototype, "id", {
        /**
         * Returns the id for this category (this
         * is for internal purposes only).
         * @returns {number} Id
         */
        get: function () {
            return this._id;
        },
        enumerable: false,
        configurable: true
    });
    Category.prototype.loadCategoryLogger = function () {
        if (!this._logger) {
            this._logger = CategoryService_1.CategoryServiceImpl.getInstance().getLogger(this);
        }
        if (typeof this._logger === "undefined" || this._logger === null) {
            throw new Error("Failed to load a logger for category (should not happen): " + this.name);
        }
    };
    Category.nextId = function () {
        return Category.currentId++;
    };
    Category.currentId = 1;
    return Category;
}());
exports.Category = Category;
//# sourceMappingURL=Category.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryConfiguration.js":
/*!*********************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/category/CategoryConfiguration.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CategoryConfiguration = void 0;
var LoggerOptions_1 = __webpack_require__(/*! ../LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
/**
 * Default configuration, can be used to initially set a different default configuration
 * on the CategoryServiceFactory. This will be applied to all categories already registered (or
 * registered in the future). Can also be applied to one Category (and childs).
 */
var CategoryConfiguration = /** @class */ (function () {
    /**
     * Create a new instance
     * @param logLevel Log level for all loggers, default is LogLevel.Error
     * @param loggerType Where to log, default is LoggerType.Console
     * @param logFormat What logging format to use, use default instance, for default values see CategoryLogFormat.
     * @param callBackLogger Optional callback, if LoggerType.Custom is used as loggerType. In that case must return a new Logger instance.
     *            It is recommended to extend AbstractCategoryLogger to make your custom logger.
     */
    function CategoryConfiguration(logLevel, loggerType, logFormat, callBackLogger) {
        if (logLevel === void 0) { logLevel = LoggerOptions_1.LogLevel.Error; }
        if (loggerType === void 0) { loggerType = LoggerOptions_1.LoggerType.Console; }
        if (logFormat === void 0) { logFormat = new LoggerOptions_1.CategoryLogFormat(); }
        if (callBackLogger === void 0) { callBackLogger = null; }
        this._formatterLogMessage = null;
        this._logLevel = logLevel;
        this._loggerType = loggerType;
        this._logFormat = logFormat;
        this._callBackLogger = callBackLogger;
        if (this._loggerType === LoggerOptions_1.LoggerType.Custom && this.callBackLogger === null) {
            throw new Error("If you specify loggerType to be Custom, you must provide the callBackLogger argument");
        }
    }
    Object.defineProperty(CategoryConfiguration.prototype, "logLevel", {
        get: function () {
            return this._logLevel;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryConfiguration.prototype, "loggerType", {
        get: function () {
            return this._loggerType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryConfiguration.prototype, "logFormat", {
        get: function () {
            return this._logFormat;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryConfiguration.prototype, "callBackLogger", {
        get: function () {
            return this._callBackLogger;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryConfiguration.prototype, "formatterLogMessage", {
        /**
         * Get the formatterLogMessage function, see comment on the setter.
         * @returns {((message:CategoryLogMessage)=>string)|null}
         */
        get: function () {
            return this._formatterLogMessage;
        },
        /**
         * Set the default formatterLogMessage function, if set it is applied to all type of loggers except for a custom logger.
         * By default this is null (not set). You can assign a function to allow custom formatting of a log message.
         * Each log message will call this function then and expects your function to format the message and return a string.
         * Will throw an error if you attempt to set a formatterLogMessage if the LoggerType is custom.
         * @param value The formatter function, or null to reset it.
         */
        set: function (value) {
            if (value !== null && this._loggerType === LoggerOptions_1.LoggerType.Custom) {
                throw new Error("You cannot specify a formatter for log messages if your loggerType is Custom");
            }
            this._formatterLogMessage = value;
        },
        enumerable: false,
        configurable: true
    });
    CategoryConfiguration.prototype.copy = function () {
        var config = new CategoryConfiguration(this.logLevel, this.loggerType, this.logFormat.copy(), this.callBackLogger);
        config.formatterLogMessage = this.formatterLogMessage;
        return config;
    };
    return CategoryConfiguration;
}());
exports.CategoryConfiguration = CategoryConfiguration;
//# sourceMappingURL=CategoryConfiguration.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryConsoleLoggerImpl.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/category/CategoryConsoleLoggerImpl.js ***!
  \*************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CategoryConsoleLoggerImpl = void 0;
var LoggerOptions_1 = __webpack_require__(/*! ../LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
var AbstractCategoryLogger_1 = __webpack_require__(/*! ./AbstractCategoryLogger */ "./node_modules/typescript-logging/dist/commonjs/log/category/AbstractCategoryLogger.js");
/**
 * Simple logger, that logs to the console. If the console is unavailable will throw an exception.
 */
var CategoryConsoleLoggerImpl = /** @class */ (function (_super) {
    __extends(CategoryConsoleLoggerImpl, _super);
    function CategoryConsoleLoggerImpl(rootCategory, runtimeSettings) {
        return _super.call(this, rootCategory, runtimeSettings) || this;
    }
    CategoryConsoleLoggerImpl.prototype.doLog = function (msg) {
        if (console !== undefined) {
            var messageFormatter = this._getMessageFormatter();
            var fullMsg = void 0;
            if (messageFormatter === null) {
                fullMsg = this.createDefaultLogMessage(msg);
            }
            else {
                fullMsg = messageFormatter(msg);
            }
            var logged = false;
            /* tslint:disable:no-console */
            switch (msg.level) {
                case LoggerOptions_1.LogLevel.Trace:
                    // Don't try trace we don't want stacks
                    break;
                case LoggerOptions_1.LogLevel.Debug:
                    // Don't try, too much differences of consoles.
                    break;
                case LoggerOptions_1.LogLevel.Info:
                    if (console.info) {
                        console.info(fullMsg);
                        logged = true;
                    }
                    break;
                case LoggerOptions_1.LogLevel.Warn:
                    if (console.warn) {
                        console.warn(fullMsg);
                        logged = true;
                    }
                    break;
                case LoggerOptions_1.LogLevel.Error:
                case LoggerOptions_1.LogLevel.Fatal:
                    if (console.error) {
                        console.error(fullMsg);
                        logged = true;
                    }
                    break;
                default:
                    throw new Error("Unsupported level: " + msg.level);
            }
            if (!logged) {
                console.log(fullMsg);
            }
            /* tslint:enable:no-console */
        }
        else {
            throw new Error("Console is not defined, cannot log msg: " + msg.messageAsString);
        }
    };
    return CategoryConsoleLoggerImpl;
}(AbstractCategoryLogger_1.AbstractCategoryLogger));
exports.CategoryConsoleLoggerImpl = CategoryConsoleLoggerImpl;
//# sourceMappingURL=CategoryConsoleLoggerImpl.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryDelegateLoggerImpl.js":
/*!**************************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/category/CategoryDelegateLoggerImpl.js ***!
  \**************************************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CategoryDelegateLoggerImpl = void 0;
/**
 * Delegate logger, delegates logging to given logger (constructor).
 */
var CategoryDelegateLoggerImpl = /** @class */ (function () {
    function CategoryDelegateLoggerImpl(delegate) {
        this._delegate = delegate;
    }
    Object.defineProperty(CategoryDelegateLoggerImpl.prototype, "delegate", {
        get: function () {
            return this._delegate;
        },
        set: function (value) {
            this._delegate = value;
        },
        enumerable: false,
        configurable: true
    });
    CategoryDelegateLoggerImpl.prototype.trace = function (msg) {
        var _a;
        var categories = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            categories[_i - 1] = arguments[_i];
        }
        (_a = this._delegate).trace.apply(_a, __spreadArray([msg], categories, false));
    };
    CategoryDelegateLoggerImpl.prototype.debug = function (msg) {
        var _a;
        var categories = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            categories[_i - 1] = arguments[_i];
        }
        (_a = this._delegate).debug.apply(_a, __spreadArray([msg], categories, false));
    };
    CategoryDelegateLoggerImpl.prototype.info = function (msg) {
        var _a;
        var categories = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            categories[_i - 1] = arguments[_i];
        }
        (_a = this._delegate).info.apply(_a, __spreadArray([msg], categories, false));
    };
    CategoryDelegateLoggerImpl.prototype.warn = function (msg) {
        var _a;
        var categories = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            categories[_i - 1] = arguments[_i];
        }
        (_a = this._delegate).warn.apply(_a, __spreadArray([msg], categories, false));
    };
    CategoryDelegateLoggerImpl.prototype.error = function (msg, error) {
        var _a;
        var categories = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            categories[_i - 2] = arguments[_i];
        }
        (_a = this._delegate).error.apply(_a, __spreadArray([msg, error], categories, false));
    };
    CategoryDelegateLoggerImpl.prototype.fatal = function (msg, error) {
        var _a;
        var categories = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            categories[_i - 2] = arguments[_i];
        }
        (_a = this._delegate).fatal.apply(_a, __spreadArray([msg, error], categories, false));
    };
    CategoryDelegateLoggerImpl.prototype.resolved = function (msg, error) {
        var _a;
        var categories = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            categories[_i - 2] = arguments[_i];
        }
        (_a = this._delegate).resolved.apply(_a, __spreadArray([msg, error], categories, false));
    };
    CategoryDelegateLoggerImpl.prototype.log = function (level, msg, error) {
        var _a;
        var categories = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            categories[_i - 3] = arguments[_i];
        }
        (_a = this._delegate).log.apply(_a, __spreadArray([level, msg, error], categories, false));
    };
    return CategoryDelegateLoggerImpl;
}());
exports.CategoryDelegateLoggerImpl = CategoryDelegateLoggerImpl;
//# sourceMappingURL=CategoryDelegateLoggerImpl.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryExtensionLoggerImpl.js":
/*!***************************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/category/CategoryExtensionLoggerImpl.js ***!
  \***************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CategoryExtensionLoggerImpl = void 0;
var ExtensionHelper_1 = __webpack_require__(/*! ../../extension/ExtensionHelper */ "./node_modules/typescript-logging/dist/commonjs/extension/ExtensionHelper.js");
var AbstractCategoryLogger_1 = __webpack_require__(/*! ./AbstractCategoryLogger */ "./node_modules/typescript-logging/dist/commonjs/log/category/AbstractCategoryLogger.js");
/**
 * This class should not be used directly, it is used for communication with the extension only.
 */
var CategoryExtensionLoggerImpl = /** @class */ (function (_super) {
    __extends(CategoryExtensionLoggerImpl, _super);
    function CategoryExtensionLoggerImpl(rootCategory, runtimeSettings) {
        return _super.call(this, rootCategory, runtimeSettings) || this;
    }
    CategoryExtensionLoggerImpl.prototype.doLog = function (msg) {
        if (typeof window !== "undefined") {
            ExtensionHelper_1.ExtensionHelper.sendCategoryLogMessage(msg);
        }
        else {
            /* tslint:disable:no-console */
            console.log("window is not available, you must be running in a browser for this. Dropped message.");
            /* tslint:enable:no-console */
        }
    };
    return CategoryExtensionLoggerImpl;
}(AbstractCategoryLogger_1.AbstractCategoryLogger));
exports.CategoryExtensionLoggerImpl = CategoryExtensionLoggerImpl;
//# sourceMappingURL=CategoryExtensionLoggerImpl.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryMessageBufferImpl.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/category/CategoryMessageBufferImpl.js ***!
  \*************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CategoryMessageBufferLoggerImpl = void 0;
var AbstractCategoryLogger_1 = __webpack_require__(/*! ./AbstractCategoryLogger */ "./node_modules/typescript-logging/dist/commonjs/log/category/AbstractCategoryLogger.js");
/**
 * Logger which buffers all messages, use with care due to possible high memory footprint.
 * Can be convenient in some cases. Call toString() for full output, or cast to this class
 * and call getMessages() to do something with it yourself.
 */
var CategoryMessageBufferLoggerImpl = /** @class */ (function (_super) {
    __extends(CategoryMessageBufferLoggerImpl, _super);
    function CategoryMessageBufferLoggerImpl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.messages = [];
        return _this;
    }
    CategoryMessageBufferLoggerImpl.prototype.getMessages = function () {
        return this.messages;
    };
    CategoryMessageBufferLoggerImpl.prototype.toString = function () {
        return this.messages.map(function (msg) {
            return msg;
        }).join("\n");
    };
    CategoryMessageBufferLoggerImpl.prototype.doLog = function (msg) {
        var messageFormatter = this._getMessageFormatter();
        var fullMsg;
        if (messageFormatter === null) {
            fullMsg = this.createDefaultLogMessage(msg);
        }
        else {
            fullMsg = messageFormatter(msg);
        }
        this.messages.push(fullMsg);
    };
    return CategoryMessageBufferLoggerImpl;
}(AbstractCategoryLogger_1.AbstractCategoryLogger));
exports.CategoryMessageBufferLoggerImpl = CategoryMessageBufferLoggerImpl;
//# sourceMappingURL=CategoryMessageBufferImpl.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryRuntimeSettings.js":
/*!***********************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/category/CategoryRuntimeSettings.js ***!
  \***********************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CategoryRuntimeSettings = void 0;
var LoggerOptions_1 = __webpack_require__(/*! ../LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
/**
 * RuntimeSettings for a category, at runtime these are associated to a category.
 */
var CategoryRuntimeSettings = /** @class */ (function () {
    function CategoryRuntimeSettings(category, logLevel, loggerType, logFormat, callBackLogger, formatterLogMessage) {
        if (logLevel === void 0) { logLevel = LoggerOptions_1.LogLevel.Error; }
        if (loggerType === void 0) { loggerType = LoggerOptions_1.LoggerType.Console; }
        if (logFormat === void 0) { logFormat = new LoggerOptions_1.CategoryLogFormat(); }
        if (callBackLogger === void 0) { callBackLogger = null; }
        if (formatterLogMessage === void 0) { formatterLogMessage = null; }
        this._formatterLogMessage = null;
        this._category = category;
        this._logLevel = logLevel;
        this._loggerType = loggerType;
        this._logFormat = logFormat;
        this._callBackLogger = callBackLogger;
        this._formatterLogMessage = formatterLogMessage;
    }
    Object.defineProperty(CategoryRuntimeSettings.prototype, "category", {
        get: function () {
            return this._category;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryRuntimeSettings.prototype, "logLevel", {
        get: function () {
            return this._logLevel;
        },
        set: function (value) {
            this._logLevel = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryRuntimeSettings.prototype, "loggerType", {
        get: function () {
            return this._loggerType;
        },
        set: function (value) {
            this._loggerType = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryRuntimeSettings.prototype, "logFormat", {
        get: function () {
            return this._logFormat;
        },
        set: function (value) {
            this._logFormat = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryRuntimeSettings.prototype, "callBackLogger", {
        get: function () {
            return this._callBackLogger;
        },
        set: function (value) {
            this._callBackLogger = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryRuntimeSettings.prototype, "formatterLogMessage", {
        get: function () {
            return this._formatterLogMessage;
        },
        set: function (value) {
            this._formatterLogMessage = value;
        },
        enumerable: false,
        configurable: true
    });
    return CategoryRuntimeSettings;
}());
exports.CategoryRuntimeSettings = CategoryRuntimeSettings;
//# sourceMappingURL=CategoryRuntimeSettings.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryService.js":
/*!***************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/category/CategoryService.js ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CategoryServiceImpl = void 0;
var DataStructures_1 = __webpack_require__(/*! ../../utils/DataStructures */ "./node_modules/typescript-logging/dist/commonjs/utils/DataStructures.js");
var LoggerOptions_1 = __webpack_require__(/*! ../LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
var CategoryConsoleLoggerImpl_1 = __webpack_require__(/*! ./CategoryConsoleLoggerImpl */ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryConsoleLoggerImpl.js");
var CategoryDelegateLoggerImpl_1 = __webpack_require__(/*! ./CategoryDelegateLoggerImpl */ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryDelegateLoggerImpl.js");
var CategoryExtensionLoggerImpl_1 = __webpack_require__(/*! ./CategoryExtensionLoggerImpl */ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryExtensionLoggerImpl.js");
var CategoryMessageBufferImpl_1 = __webpack_require__(/*! ./CategoryMessageBufferImpl */ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryMessageBufferImpl.js");
var ExtensionHelper_1 = __webpack_require__(/*! ../../extension/ExtensionHelper */ "./node_modules/typescript-logging/dist/commonjs/extension/ExtensionHelper.js");
var CategoryRuntimeSettings_1 = __webpack_require__(/*! ./CategoryRuntimeSettings */ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryRuntimeSettings.js");
var CategoryConfiguration_1 = __webpack_require__(/*! ./CategoryConfiguration */ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryConfiguration.js");
/**
 * The service (only available as singleton) for all category related stuff as
 * retrieving, registering a logger. You should normally NOT use this,
 * instead use CategoryServiceFactory which is meant for end users.
 */
var CategoryServiceImpl = /** @class */ (function () {
    function CategoryServiceImpl() {
        this._defaultConfig = new CategoryConfiguration_1.CategoryConfiguration();
        this._mapState = new DataStructures_1.SimpleMap();
        // Private constructor
        ExtensionHelper_1.ExtensionHelper.register();
    }
    CategoryServiceImpl.getInstance = function () {
        // Load on-demand, to assure webpack ordering of module usage doesn't screw things over
        // for us when we accidentally change the order.
        if (CategoryServiceImpl._INSTANCE === null) {
            CategoryServiceImpl._INSTANCE = new CategoryServiceImpl();
        }
        return CategoryServiceImpl._INSTANCE;
    };
    CategoryServiceImpl.prototype.getLogger = function (category) {
        return this.createOrGetCategoryState(category).logger;
    };
    /**
     * Clears everything, including a default configuration you may have set.
     * After this you need to re-register your categories etc.
     */
    CategoryServiceImpl.prototype.clear = function () {
        this._mapState.clear();
        this.setDefaultConfiguration(new CategoryConfiguration_1.CategoryConfiguration());
    };
    CategoryServiceImpl.prototype.getCategorySettings = function (category) {
        return this.createOrGetCategoryState(category).currentRuntimeSettings;
    };
    CategoryServiceImpl.prototype.getOriginalCategorySettings = function (category) {
        return this.createOrGetCategoryState(category).originalRuntimeSettings;
    };
    /**
     * Set the default configuration. New root loggers created get this
     * applied. If you want to reset all current loggers to have this
     * applied as well, pass in reset=true (the default is false). All
     * categories will be reset then as well.
     * @param config New config
     * @param reset Defaults to true. Set to true to reset all loggers and current runtimesettings.
     */
    CategoryServiceImpl.prototype.setDefaultConfiguration = function (config, reset) {
        if (reset === void 0) { reset = true; }
        this._defaultConfig = config;
        if (reset) {
            this._mapState.forEachValue(function (state) {
                state.updateSettings(config);
            });
        }
    };
    /**
     * Set new configuration settings for a category (and possibly its child categories)
     * @param config Config
     * @param category Category
     * @param applyChildren True to apply to child categories, defaults to false.
     */
    CategoryServiceImpl.prototype.setConfigurationCategory = function (config, category, applyChildren) {
        var _this = this;
        if (applyChildren === void 0) { applyChildren = false; }
        this.createOrGetCategoryState(category).updateSettings(config);
        // Apply the settings to children recursive if requested
        if (applyChildren) {
            category.children.forEach(function (child) {
                // False flag, a child cannot reset a rootlogger
                _this.setConfigurationCategory(config, child, applyChildren);
            });
        }
    };
    CategoryServiceImpl.prototype.registerCategory = function (category) {
        if (category === null || typeof category === "undefined") {
            throw new Error("Category CANNOT be null/undefined");
        }
        if (this._mapState.exists(CategoryServiceImpl.getCategoryKey(category))) {
            throw new Error("Cannot add this root category with name: " + category.name + ", it already exists (same name in hierarchy).");
        }
        this.createOrGetCategoryState(category);
    };
    /**
     * Used to enable integration with chrome extension. Do not use manually, the
     * extension and the logger framework deal with this.
     */
    CategoryServiceImpl.prototype.enableExtensionIntegration = function () {
        var _this = this;
        this._mapState.forEachValue(function (state) { return state.enableForExtension(_this); });
    };
    /**
     * Return all root categories currently registered.
     */
    CategoryServiceImpl.prototype.getRootCategories = function () {
        return this._mapState.values().filter(function (state) { return state.category.parent == null; }).map(function (state) { return state.category; });
    };
    /**
     * Return Category by id
     * @param id The id of the category to find
     * @returns {Category} or null if not found
     */
    CategoryServiceImpl.prototype.getCategoryById = function (id) {
        var result = this._mapState.values().filter(function (state) { return state.category.id === id; }).map(function (state) { return state.category; });
        if (result.length === 1) {
            return result[0];
        }
        return null;
    };
    CategoryServiceImpl.prototype.createOrGetCategoryState = function (category) {
        var key = CategoryServiceImpl.getCategoryKey(category);
        var state = this._mapState.get(key);
        if (typeof state !== "undefined") {
            return state;
        }
        var newState = this.createState(category);
        this._mapState.put(key, newState);
        return newState;
    };
    CategoryServiceImpl.prototype.createState = function (category) {
        var _this = this;
        return new CategoryState(category, function () { return _this._defaultConfig; }, function (config, cat) { return _this.createLogger(config, cat); });
    };
    CategoryServiceImpl.prototype.createLogger = function (config, category) {
        // Default is always a console logger
        switch (config.loggerType) {
            case LoggerOptions_1.LoggerType.Console:
                return new CategoryConsoleLoggerImpl_1.CategoryConsoleLoggerImpl(category, this);
            case LoggerOptions_1.LoggerType.MessageBuffer:
                return new CategoryMessageBufferImpl_1.CategoryMessageBufferLoggerImpl(category, this);
            case LoggerOptions_1.LoggerType.Custom:
                if (config.callBackLogger === null) {
                    throw new Error("Cannot create custom logger, custom callback is null");
                }
                else {
                    return config.callBackLogger(category, this);
                }
            default:
                throw new Error("Cannot create a Logger for LoggerType: " + config.loggerType);
        }
    };
    CategoryServiceImpl.getCategoryKey = function (category) {
        return category.getCategoryPath();
    };
    // Singleton category service, used by CategoryServiceFactory as well as Categories.
    // Loaded on demand. Do NOT change as webpack may pack things in wrong order otherwise.
    CategoryServiceImpl._INSTANCE = null;
    return CategoryServiceImpl;
}());
exports.CategoryServiceImpl = CategoryServiceImpl;
var CategoryState = /** @class */ (function () {
    function CategoryState(category, defaultConfig, createLogger) {
        this._category = category;
        this._lazyState = new LazyState(category, defaultConfig, createLogger);
    }
    Object.defineProperty(CategoryState.prototype, "category", {
        get: function () {
            return this._category;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryState.prototype, "logger", {
        get: function () {
            return this._lazyState.getLogger();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryState.prototype, "originalRuntimeSettings", {
        get: function () {
            return this._lazyState.getOriginalRuntimeSettings();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CategoryState.prototype, "currentRuntimeSettings", {
        get: function () {
            return this._lazyState.getCurrentRuntimeSettings();
        },
        enumerable: false,
        configurable: true
    });
    CategoryState.prototype.enableForExtension = function (runtimeSettings) {
        this._lazyState.enableForExtension(runtimeSettings);
    };
    CategoryState.prototype.updateSettings = function (config) {
        this._lazyState.updateSettings(config);
    };
    return CategoryState;
}());
var LazyState = /** @class */ (function () {
    function LazyState(category, defaultConfig, createLogger) {
        this._category = category;
        this._defaultConfig = defaultConfig;
        this._createLogger = createLogger;
    }
    LazyState.prototype.isLoaded = function () {
        return (typeof this._logger !== "undefined");
    };
    LazyState.prototype.getLogger = function () {
        this.loadLoggerOnDemand();
        return this._delegateLogger;
    };
    LazyState.prototype.getOriginalRuntimeSettings = function () {
        this.loadLoggerOnDemand();
        return this._originalRuntimeSettings;
    };
    LazyState.prototype.getCurrentRuntimeSettings = function () {
        this.loadLoggerOnDemand();
        return this._currentRuntimeSettings;
    };
    LazyState.prototype.enableForExtension = function (runtimeSettings) {
        this.loadLoggerOnDemand();
        if (!(this._wrappedLogger instanceof CategoryExtensionLoggerImpl_1.CategoryExtensionLoggerImpl)) {
            /* tslint:disable no-console */
            console.log("Reconfiguring logger for extension for category: " + this._category.name);
            /* tslint:enable no-console */
            this._wrappedLogger = new CategoryExtensionLoggerImpl_1.CategoryExtensionLoggerImpl(this._category, runtimeSettings);
            this._delegateLogger.delegate = this._wrappedLogger;
        }
    };
    LazyState.prototype.updateSettings = function (config) {
        if (this.isLoaded()) {
            this._currentRuntimeSettings.logLevel = config.logLevel;
            this._currentRuntimeSettings.loggerType = config.loggerType;
            this._currentRuntimeSettings.logFormat = config.logFormat;
            this._currentRuntimeSettings.callBackLogger = config.callBackLogger;
            this._currentRuntimeSettings.formatterLogMessage = config.formatterLogMessage;
            // Replace the real logger, it may have changed.
            this._logger = this._createLogger(config, this._category);
            if (!(this._wrappedLogger instanceof CategoryExtensionLoggerImpl_1.CategoryExtensionLoggerImpl)) {
                this._wrappedLogger = this._logger;
            }
            this._delegateLogger.delegate = this._wrappedLogger;
        }
        else {
            // Set this config, it may be for the category specific, the default is therefore not good enough.
            this._defaultConfig = function () { return config; };
        }
    };
    LazyState.prototype.loadLoggerOnDemand = function () {
        if (!this.isLoaded()) {
            this._logger = this._createLogger(this._defaultConfig(), this._category);
            this._wrappedLogger = this._logger;
            this._delegateLogger = new CategoryDelegateLoggerImpl_1.CategoryDelegateLoggerImpl(this._wrappedLogger);
            this._originalRuntimeSettings = this.initNewSettings();
            this._currentRuntimeSettings = this.initNewSettings();
        }
    };
    LazyState.prototype.initNewSettings = function () {
        var defSettings = this._defaultConfig().copy();
        return new CategoryRuntimeSettings_1.CategoryRuntimeSettings(this._category, defSettings.logLevel, defSettings.loggerType, defSettings.logFormat, defSettings.callBackLogger, defSettings.formatterLogMessage);
    };
    return LazyState;
}());
//# sourceMappingURL=CategoryService.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryServiceFactory.js":
/*!**********************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/category/CategoryServiceFactory.js ***!
  \**********************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CategoryServiceFactory = void 0;
var CategoryService_1 = __webpack_require__(/*! ./CategoryService */ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryService.js");
/**
 * Categorized service for logging, where logging is bound to categories which
 * can log horizontally through specific application logic (services, group(s) of components etc).
 * For the standard way of logging like most frameworks do these days, use LFService instead.
 * If you want fine grained control to divide sections of your application in
 * logical units to enable/disable logging for, this is the service you want to use instead.
 * Also for this type a browser plugin will be available.
 */
var CategoryServiceFactory = /** @class */ (function () {
    function CategoryServiceFactory() {
        // Private constructor.
    }
    /**
     * Return a CategoryLogger for given ROOT category (thus has no parent).
     * You can only retrieve loggers for their root, when logging
     * you specify to log for what (child)categories.
     * @param root Category root (has no parent)
     * @returns {CategoryLogger}
     */
    CategoryServiceFactory.getLogger = function (root) {
        return CategoryService_1.CategoryServiceImpl.getInstance().getLogger(root);
    };
    /**
     * Clears everything, any registered (root)categories and loggers
     * are discarded. Resets to default configuration.
     */
    CategoryServiceFactory.clear = function () {
        return CategoryService_1.CategoryServiceImpl.getInstance().clear();
    };
    /**
     * Set the default configuration. New root loggers created get this
     * applied. If you want to reset all current loggers to have this
     * applied as well, pass in reset=true (the default is false). All
     * categories runtimesettings will be reset then as well.
     * @param config The new default configuration
     * @param reset If true, will reset *all* runtimesettings for all loggers/categories to these. Default is true.
     */
    CategoryServiceFactory.setDefaultConfiguration = function (config, reset) {
        if (reset === void 0) { reset = true; }
        CategoryService_1.CategoryServiceImpl.getInstance().setDefaultConfiguration(config, reset);
    };
    /**
     * Set new configuration settings for a category (and possibly its child categories)
     * @param config Config
     * @param category Category
     * @param applyChildren True to apply to child categories, defaults to false.
     */
    CategoryServiceFactory.setConfigurationCategory = function (config, category, applyChildren) {
        if (applyChildren === void 0) { applyChildren = false; }
        CategoryService_1.CategoryServiceImpl.getInstance().setConfigurationCategory(config, category, applyChildren);
    };
    return CategoryServiceFactory;
}());
exports.CategoryServiceFactory = CategoryServiceFactory;
//# sourceMappingURL=CategoryServiceFactory.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/standard/AbstractLogger.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/standard/AbstractLogger.js ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AbstractLogger = void 0;
var LoggerOptions_1 = __webpack_require__(/*! ../LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
var DataStructures_1 = __webpack_require__(/*! ../../utils/DataStructures */ "./node_modules/typescript-logging/dist/commonjs/utils/DataStructures.js");
var MessageUtils_1 = __webpack_require__(/*! ../../utils/MessageUtils */ "./node_modules/typescript-logging/dist/commonjs/utils/MessageUtils.js");
var LogMessageInternalImpl = /** @class */ (function () {
    function LogMessageInternalImpl(loggerName, message, errorAsStack, error, logGroupRule, date, level, ready) {
        this._errorAsStack = null;
        this._error = null;
        this._loggerName = loggerName;
        this._message = message;
        this._errorAsStack = errorAsStack;
        this._error = error;
        this._logGroupRule = logGroupRule;
        this._date = date;
        this._level = level;
        this._ready = ready;
    }
    Object.defineProperty(LogMessageInternalImpl.prototype, "loggerName", {
        get: function () {
            return this._loggerName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogMessageInternalImpl.prototype, "message", {
        get: function () {
            return this._message;
        },
        set: function (value) {
            this._message = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogMessageInternalImpl.prototype, "errorAsStack", {
        get: function () {
            return this._errorAsStack;
        },
        set: function (value) {
            this._errorAsStack = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogMessageInternalImpl.prototype, "error", {
        get: function () {
            return this._error;
        },
        set: function (value) {
            this._error = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogMessageInternalImpl.prototype, "logGroupRule", {
        get: function () {
            return this._logGroupRule;
        },
        set: function (value) {
            this._logGroupRule = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogMessageInternalImpl.prototype, "date", {
        get: function () {
            return this._date;
        },
        set: function (value) {
            this._date = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogMessageInternalImpl.prototype, "level", {
        get: function () {
            return this._level;
        },
        set: function (value) {
            this._level = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogMessageInternalImpl.prototype, "isMessageLogData", {
        get: function () {
            return typeof (this._message) !== "string";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogMessageInternalImpl.prototype, "ready", {
        get: function () {
            return this._ready;
        },
        set: function (value) {
            this._ready = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogMessageInternalImpl.prototype, "messageAsString", {
        get: function () {
            if (typeof (this._message) === "string") {
                return this._message;
            }
            return this._message.msg;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogMessageInternalImpl.prototype, "logData", {
        get: function () {
            var result = null;
            if (typeof (this._message) !== "string") {
                result = this.message;
            }
            return result;
        },
        enumerable: false,
        configurable: true
    });
    return LogMessageInternalImpl;
}());
/**
 * Abstract base logger, extend to easily implement a custom logger that
 * logs wherever you want. You only need to implement doLog(msg: LogMessage) and
 * log that somewhere (it will contain format and everything else).
 */
var AbstractLogger = /** @class */ (function () {
    function AbstractLogger(name, logGroupRuntimeSettings) {
        this._allMessages = new DataStructures_1.LinkedList();
        this._open = true;
        this._name = name;
        this._logGroupRuntimeSettings = logGroupRuntimeSettings;
    }
    Object.defineProperty(AbstractLogger.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: false,
        configurable: true
    });
    AbstractLogger.prototype.trace = function (msg, error) {
        if (error === void 0) { error = null; }
        this._log(LoggerOptions_1.LogLevel.Trace, msg, error);
    };
    AbstractLogger.prototype.debug = function (msg, error) {
        if (error === void 0) { error = null; }
        this._log(LoggerOptions_1.LogLevel.Debug, msg, error);
    };
    AbstractLogger.prototype.info = function (msg, error) {
        if (error === void 0) { error = null; }
        this._log(LoggerOptions_1.LogLevel.Info, msg, error);
    };
    AbstractLogger.prototype.warn = function (msg, error) {
        if (error === void 0) { error = null; }
        this._log(LoggerOptions_1.LogLevel.Warn, msg, error);
    };
    AbstractLogger.prototype.error = function (msg, error) {
        if (error === void 0) { error = null; }
        this._log(LoggerOptions_1.LogLevel.Error, msg, error);
    };
    AbstractLogger.prototype.fatal = function (msg, error) {
        if (error === void 0) { error = null; }
        this._log(LoggerOptions_1.LogLevel.Fatal, msg, error);
    };
    AbstractLogger.prototype.isTraceEnabled = function () {
        return this._logGroupRuntimeSettings.level === LoggerOptions_1.LogLevel.Trace;
    };
    AbstractLogger.prototype.isDebugEnabled = function () {
        return this._logGroupRuntimeSettings.level <= LoggerOptions_1.LogLevel.Debug;
    };
    AbstractLogger.prototype.isInfoEnabled = function () {
        return this._logGroupRuntimeSettings.level <= LoggerOptions_1.LogLevel.Info;
    };
    AbstractLogger.prototype.isWarnEnabled = function () {
        return this._logGroupRuntimeSettings.level <= LoggerOptions_1.LogLevel.Warn;
    };
    AbstractLogger.prototype.isErrorEnabled = function () {
        return this._logGroupRuntimeSettings.level <= LoggerOptions_1.LogLevel.Error;
    };
    AbstractLogger.prototype.isFatalEnabled = function () {
        return this._logGroupRuntimeSettings.level <= LoggerOptions_1.LogLevel.Fatal;
    };
    AbstractLogger.prototype.getLogLevel = function () {
        return this._logGroupRuntimeSettings.level;
    };
    AbstractLogger.prototype.isOpen = function () {
        return this._open;
    };
    AbstractLogger.prototype.close = function () {
        this._open = false;
        this._allMessages.clear();
    };
    AbstractLogger.prototype.createDefaultLogMessage = function (msg) {
        return MessageUtils_1.MessageFormatUtils.renderDefaultLog4jMessage(msg, true);
    };
    /**
     * Return optional message formatter. All LoggerTypes (except custom) will see if
     * they have this, and if so use it to log.
     * @returns {((message:LogMessage)=>string)|null}
     */
    AbstractLogger.prototype._getMessageFormatter = function () {
        return this._logGroupRuntimeSettings.formatterLogMessage;
    };
    AbstractLogger.prototype._log = function (level, msg, error) {
        if (error === void 0) { error = null; }
        if (this._open && this._logGroupRuntimeSettings.level <= level) {
            var functionMessage = function () {
                if (typeof msg === "function") {
                    return msg();
                }
                return msg;
            };
            var functionError = function () {
                if (typeof error === "function") {
                    return error();
                }
                return error;
            };
            this._allMessages.addTail(this.createMessage(level, functionMessage, functionError, new Date()));
            this.processMessages();
        }
    };
    AbstractLogger.prototype.createMessage = function (level, msg, error, date) {
        var _this = this;
        var errorResult = error();
        if (errorResult !== null) {
            var message_1 = new LogMessageInternalImpl(this._name, msg(), null, errorResult, this._logGroupRuntimeSettings.logGroupRule, date, level, false);
            MessageUtils_1.MessageFormatUtils.renderError(errorResult).then(function (stack) {
                message_1.errorAsStack = stack;
                message_1.ready = true;
                _this.processMessages();
            }).catch(function () {
                message_1.errorAsStack = "<UNKNOWN> unable to get stack.";
                message_1.ready = true;
                _this.processMessages();
            });
            return message_1;
        }
        return new LogMessageInternalImpl(this._name, msg(), null, errorResult, this._logGroupRuntimeSettings.logGroupRule, date, level, true);
    };
    AbstractLogger.prototype.processMessages = function () {
        // Basically we wait until errors are resolved (those messages
        // may not be ready).
        var msgs = this._allMessages;
        if (msgs.getSize() > 0) {
            do {
                var msg = msgs.getHead();
                if (msg != null) {
                    if (!msg.ready) {
                        break;
                    }
                    msgs.removeHead();
                    // This can never be null normally, but strict null checking ...
                    if (msg.message !== null) {
                        this.doLog(msg);
                    }
                }
            } while (msgs.getSize() > 0);
        }
    };
    return AbstractLogger;
}());
exports.AbstractLogger = AbstractLogger;
//# sourceMappingURL=AbstractLogger.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/standard/ConsoleLoggerImpl.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/standard/ConsoleLoggerImpl.js ***!
  \*****************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConsoleLoggerImpl = void 0;
var AbstractLogger_1 = __webpack_require__(/*! ./AbstractLogger */ "./node_modules/typescript-logging/dist/commonjs/log/standard/AbstractLogger.js");
var LoggerOptions_1 = __webpack_require__(/*! ../LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
/**
 * Simple logger, that logs to the console. If the console is unavailable will throw exception.
 */
var ConsoleLoggerImpl = /** @class */ (function (_super) {
    __extends(ConsoleLoggerImpl, _super);
    function ConsoleLoggerImpl(name, logGroupRuntimeSettings) {
        return _super.call(this, name, logGroupRuntimeSettings) || this;
    }
    ConsoleLoggerImpl.prototype.doLog = function (message) {
        if (console !== undefined) {
            var logged = false;
            var logLevel = message.level;
            var messageFormatter = this._getMessageFormatter();
            var msg = void 0;
            if (messageFormatter === null) {
                msg = this.createDefaultLogMessage(message);
            }
            else {
                msg = messageFormatter(message);
            }
            /* tslint:disable:no-console */
            switch (logLevel) {
                case LoggerOptions_1.LogLevel.Trace:
                    // Do not try trace we don't want a stack
                    break;
                case LoggerOptions_1.LogLevel.Debug:
                    // Don't try, too much differences of consoles.
                    break;
                case LoggerOptions_1.LogLevel.Info:
                    if (console.info) {
                        console.info(msg);
                        logged = true;
                    }
                    break;
                case LoggerOptions_1.LogLevel.Warn:
                    if (console.warn) {
                        console.warn(msg);
                        logged = true;
                    }
                    break;
                case LoggerOptions_1.LogLevel.Error:
                case LoggerOptions_1.LogLevel.Fatal:
                    if (console.error) {
                        console.error(msg);
                        logged = true;
                    }
                    break;
                default:
                    throw new Error("Log level not supported: " + logLevel);
            }
            if (!logged) {
                console.log(msg);
            }
            /* tslint:enable:no-console */
        }
        else {
            throw new Error("Console is not defined, cannot log msg: " + message.message);
        }
    };
    return ConsoleLoggerImpl;
}(AbstractLogger_1.AbstractLogger));
exports.ConsoleLoggerImpl = ConsoleLoggerImpl;
//# sourceMappingURL=ConsoleLoggerImpl.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/standard/LFService.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/standard/LFService.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LFService = void 0;
var DataStructures_1 = __webpack_require__(/*! ../../utils/DataStructures */ "./node_modules/typescript-logging/dist/commonjs/utils/DataStructures.js");
var LoggerOptions_1 = __webpack_require__(/*! ../LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
var LoggerFactoryImpl_1 = __webpack_require__(/*! ./LoggerFactoryImpl */ "./node_modules/typescript-logging/dist/commonjs/log/standard/LoggerFactoryImpl.js");
var ExtensionHelper_1 = __webpack_require__(/*! ../../extension/ExtensionHelper */ "./node_modules/typescript-logging/dist/commonjs/extension/ExtensionHelper.js");
var LogGroupRule_1 = __webpack_require__(/*! ./LogGroupRule */ "./node_modules/typescript-logging/dist/commonjs/log/standard/LogGroupRule.js");
var LoggerFactoryOptions_1 = __webpack_require__(/*! ./LoggerFactoryOptions */ "./node_modules/typescript-logging/dist/commonjs/log/standard/LoggerFactoryOptions.js");
var LFServiceImpl = /** @class */ (function () {
    function LFServiceImpl() {
        // Private constructor.
        this._nameCounter = 1;
        this._mapFactories = new DataStructures_1.SimpleMap();
        ExtensionHelper_1.ExtensionHelper.register();
    }
    LFServiceImpl.getInstance = function () {
        // Loaded on demand. Do NOT change as webpack may pack things in wrong order otherwise.
        if (LFServiceImpl._INSTANCE === null) {
            LFServiceImpl._INSTANCE = new LFServiceImpl();
        }
        return LFServiceImpl._INSTANCE;
    };
    /**
     * Create a new LoggerFactory with given options (if any). If no options
     * are specified, the LoggerFactory, will accept any named logger and will
     * log on info level by default for, to the console.
     * @param options Options, optional.
     * @returns {LoggerFactory}
     */
    LFServiceImpl.prototype.createLoggerFactory = function (options) {
        if (options === void 0) { options = null; }
        var name = "LoggerFactory" + this._nameCounter++;
        return this.createNamedLoggerFactory(name, options);
    };
    /**
     * Create a new LoggerFactory using given name (used for console api/extension).
     * @param name Name Pick something short but distinguishable.
     * @param options Options, optional
     * @return {LoggerFactory}
     */
    LFServiceImpl.prototype.createNamedLoggerFactory = function (name, options) {
        if (options === void 0) { options = null; }
        if (this._mapFactories.exists(name)) {
            throw new Error("LoggerFactory with name " + name + " already exists.");
        }
        var factory;
        if (options !== null) {
            factory = new LoggerFactoryImpl_1.LoggerFactoryImpl(name, options);
        }
        else {
            factory = new LoggerFactoryImpl_1.LoggerFactoryImpl(name, LFServiceImpl.createDefaultOptions());
        }
        this._mapFactories.put(name, factory);
        return factory;
    };
    /**
     * Closes all Loggers for LoggerFactories that were created.
     * After this call, all previously fetched Loggers (from their
     * factories) are unusable. The factories remain as they were.
     */
    LFServiceImpl.prototype.closeLoggers = function () {
        this._mapFactories.values().forEach(function (factory) {
            factory.closeLoggers();
        });
        this._mapFactories.clear();
        this._nameCounter = 1;
    };
    LFServiceImpl.prototype.getRuntimeSettingsForLoggerFactories = function () {
        var result = [];
        this._mapFactories.forEachValue(function (factory) { return result.push(factory); });
        return result;
    };
    LFServiceImpl.prototype.getLogGroupSettings = function (nameLoggerFactory, idLogGroupRule) {
        var factory = this._mapFactories.get(nameLoggerFactory);
        if (typeof factory === "undefined") {
            return null;
        }
        return factory.getLogGroupRuntimeSettingsByIndex(idLogGroupRule);
    };
    LFServiceImpl.prototype.getLoggerFactoryRuntimeSettingsByName = function (nameLoggerFactory) {
        var result = this._mapFactories.get(nameLoggerFactory);
        if (typeof result === "undefined") {
            return null;
        }
        return result;
    };
    LFServiceImpl.createDefaultOptions = function () {
        return new LoggerFactoryOptions_1.LoggerFactoryOptions().addLogGroupRule(new LogGroupRule_1.LogGroupRule(new RegExp(".+"), LoggerOptions_1.LogLevel.Info));
    };
    // Loaded on demand. Do NOT change as webpack may pack things in wrong order otherwise.
    LFServiceImpl._INSTANCE = null;
    return LFServiceImpl;
}());
/**
 * Create and configure your LoggerFactory from here.
 */
var LFService = /** @class */ (function () {
    function LFService() {
    }
    /**
     * Create a new LoggerFactory with given options (if any). If no options
     * are specified, the LoggerFactory, will accept any named logger and will
     * log on info level by default for, to the console.
     * @param options Options, optional.
     * @returns {LoggerFactory}
     */
    LFService.createLoggerFactory = function (options) {
        if (options === void 0) { options = null; }
        return LFService.INSTANCE_SERVICE.createLoggerFactory(options);
    };
    /**
     * Create a new LoggerFactory using given name (used for console api/extension).
     * @param name Name Pick something short but distinguishable. The word "DEFAULT" is reserved and cannot be taken, it is used
     * for the default LoggerFactory.
     * @param options Options, optional
     * @return {LoggerFactory}
     */
    LFService.createNamedLoggerFactory = function (name, options) {
        if (options === void 0) { options = null; }
        if (name === LFService.DEFAULT_LOGGER_FACTORY_NAME) {
            throw new Error("LoggerFactory name: " + LFService.DEFAULT_LOGGER_FACTORY_NAME + " is reserved and cannot be used.");
        }
        return LFService.INSTANCE_SERVICE.createNamedLoggerFactory(name, options);
    };
    /**
     * Closes all Loggers for LoggerFactories that were created.
     * After this call, all previously fetched Loggers (from their
     * factories) are unusable. The factories remain as they were.
     */
    LFService.closeLoggers = function () {
        return LFService.INSTANCE_SERVICE.closeLoggers();
    };
    /**
     * Return LFServiceRuntimeSettings to retrieve information loggerfactories
     * and their runtime settings.
     * @returns {LFServiceRuntimeSettings}
     */
    LFService.getRuntimeSettings = function () {
        return LFService.INSTANCE_SERVICE;
    };
    Object.defineProperty(LFService, "DEFAULT", {
        /**
         * This property returns the default LoggerFactory (if not yet initialized it is initialized).
         * This LoggerFactory can be used to share among multiple
         * applications/libraries - that way you can enable/change logging over everything from
         * your own application when required.
         * It is recommended to be used by library developers to make logging easily available for the
         * consumers of their libraries.
         * It is highly recommended to use Loggers from the LoggerFactory with unique grouping/names to prevent
         * clashes of Loggers between multiple projects.
         * @returns {LoggerFactory} Returns the default LoggerFactory
         */
        get: function () {
            return LFService.getDefault();
        },
        enumerable: false,
        configurable: true
    });
    LFService.getDefault = function () {
        if (LFService.DEFAULT_LOGGER_FACTORY === null) {
            LFService.DEFAULT_LOGGER_FACTORY = LFService.DEFAULT_LOGGER_FACTORY = LFService.INSTANCE_SERVICE.createNamedLoggerFactory(LFService.DEFAULT_LOGGER_FACTORY_NAME, new LoggerFactoryOptions_1.LoggerFactoryOptions().addLogGroupRule(new LogGroupRule_1.LogGroupRule(new RegExp(".+"), LoggerOptions_1.LogLevel.Error)));
        }
        return LFService.DEFAULT_LOGGER_FACTORY;
    };
    LFService.DEFAULT_LOGGER_FACTORY_NAME = "DEFAULT";
    LFService.INSTANCE_SERVICE = LFServiceImpl.getInstance();
    LFService.DEFAULT_LOGGER_FACTORY = null;
    return LFService;
}());
exports.LFService = LFService;
//# sourceMappingURL=LFService.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/standard/LogGroupRule.js":
/*!************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/standard/LogGroupRule.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogGroupRule = void 0;
var LoggerOptions_1 = __webpack_require__(/*! ../LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
/**
 * Defines a LogGroupRule, this allows you to either have everything configured the same way
 * or for example loggers that start with name model. It allows you to group loggers together
 * to have a certain loglevel and other settings. You can configure this when creating the
 * LoggerFactory (which accepts multiple LogGroupRules).
 */
var LogGroupRule = /** @class */ (function () {
    /**
     * Create a LogGroupRule. Basically you define what logger name(s) match for this group, what level should be used what logger type (where to log)
     * and what format to write in. If the loggerType is custom, then the callBackLogger must be supplied as callback function to return a custom logger.
     * @param regExp Regular expression, what matches for your logger names for this group
     * @param level LogLevel
     * @param logFormat LogFormat
     * @param loggerType Type of logger, if Custom, make sure to implement callBackLogger and pass in, this will be called so you can return your own logger.
     * @param callBackLogger Callback function to return a new clean custom logger (yours!)
     */
    function LogGroupRule(regExp, level, logFormat, loggerType, callBackLogger) {
        if (logFormat === void 0) { logFormat = new LoggerOptions_1.LogFormat(); }
        if (loggerType === void 0) { loggerType = LoggerOptions_1.LoggerType.Console; }
        if (callBackLogger === void 0) { callBackLogger = null; }
        this._formatterLogMessage = null;
        this._regExp = regExp;
        this._level = level;
        this._logFormat = logFormat;
        this._loggerType = loggerType;
        this._callBackLogger = callBackLogger;
    }
    Object.defineProperty(LogGroupRule.prototype, "regExp", {
        get: function () {
            return this._regExp;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogGroupRule.prototype, "level", {
        get: function () {
            return this._level;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogGroupRule.prototype, "loggerType", {
        get: function () {
            return this._loggerType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogGroupRule.prototype, "logFormat", {
        get: function () {
            return this._logFormat;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogGroupRule.prototype, "callBackLogger", {
        get: function () {
            return this._callBackLogger;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogGroupRule.prototype, "formatterLogMessage", {
        /**
         * Get the formatterLogMessage function, see comment on the setter.
         * @returns {((message:LogMessage)=>string)|null}
         */
        get: function () {
            return this._formatterLogMessage;
        },
        /**
         * Set the default formatterLogMessage function, if set it is applied to all type of loggers except for a custom logger.
         * By default this is null (not set). You can assign a function to allow custom formatting of a log message.
         * Each log message will call this function then and expects your function to format the message and return a string.
         * Will throw an error if you attempt to set a formatterLogMessage if the LoggerType is custom.
         * @param value The formatter function, or null to reset it.
         */
        set: function (value) {
            if (value !== null && this._loggerType === LoggerOptions_1.LoggerType.Custom) {
                throw new Error("You cannot specify a formatter for log messages if your loggerType is Custom");
            }
            this._formatterLogMessage = value;
        },
        enumerable: false,
        configurable: true
    });
    return LogGroupRule;
}());
exports.LogGroupRule = LogGroupRule;
//# sourceMappingURL=LogGroupRule.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/standard/LogGroupRuntimeSettings.js":
/*!***********************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/standard/LogGroupRuntimeSettings.js ***!
  \***********************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogGroupRuntimeSettings = void 0;
var LoggerOptions_1 = __webpack_require__(/*! ../LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
/**
 * Represents the runtime settings for a LogGroup (LogGroupRule).
 */
var LogGroupRuntimeSettings = /** @class */ (function () {
    function LogGroupRuntimeSettings(logGroupRule) {
        this._formatterLogMessage = null;
        this._logGroupRule = logGroupRule;
        this._level = logGroupRule.level;
        this._loggerType = logGroupRule.loggerType;
        this._logFormat = new LoggerOptions_1.LogFormat(new LoggerOptions_1.DateFormat(logGroupRule.logFormat.dateFormat.formatEnum, logGroupRule.logFormat.dateFormat.dateSeparator), logGroupRule.logFormat.showTimeStamp, logGroupRule.logFormat.showLoggerName);
        this._callBackLogger = logGroupRule.callBackLogger;
        this._formatterLogMessage = logGroupRule.formatterLogMessage;
    }
    Object.defineProperty(LogGroupRuntimeSettings.prototype, "logGroupRule", {
        /**
         * Returns original LogGroupRule (so not runtime settings!)
         * @return {LogGroupRule}
         */
        get: function () {
            return this._logGroupRule;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogGroupRuntimeSettings.prototype, "level", {
        get: function () {
            return this._level;
        },
        set: function (value) {
            this._level = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogGroupRuntimeSettings.prototype, "loggerType", {
        get: function () {
            return this._loggerType;
        },
        set: function (value) {
            this._loggerType = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogGroupRuntimeSettings.prototype, "logFormat", {
        get: function () {
            return this._logFormat;
        },
        set: function (value) {
            this._logFormat = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogGroupRuntimeSettings.prototype, "callBackLogger", {
        get: function () {
            return this._callBackLogger;
        },
        set: function (value) {
            this._callBackLogger = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LogGroupRuntimeSettings.prototype, "formatterLogMessage", {
        get: function () {
            return this._formatterLogMessage;
        },
        set: function (value) {
            this._formatterLogMessage = value;
        },
        enumerable: false,
        configurable: true
    });
    return LogGroupRuntimeSettings;
}());
exports.LogGroupRuntimeSettings = LogGroupRuntimeSettings;
//# sourceMappingURL=LogGroupRuntimeSettings.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/standard/LoggerFactoryImpl.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/standard/LoggerFactoryImpl.js ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggerFactoryImpl = void 0;
var DataStructures_1 = __webpack_require__(/*! ../../utils/DataStructures */ "./node_modules/typescript-logging/dist/commonjs/utils/DataStructures.js");
var LoggerOptions_1 = __webpack_require__(/*! ../LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
var ConsoleLoggerImpl_1 = __webpack_require__(/*! ./ConsoleLoggerImpl */ "./node_modules/typescript-logging/dist/commonjs/log/standard/ConsoleLoggerImpl.js");
var MessageBufferLoggerImpl_1 = __webpack_require__(/*! ./MessageBufferLoggerImpl */ "./node_modules/typescript-logging/dist/commonjs/log/standard/MessageBufferLoggerImpl.js");
var AbstractLogger_1 = __webpack_require__(/*! ./AbstractLogger */ "./node_modules/typescript-logging/dist/commonjs/log/standard/AbstractLogger.js");
var LogGroupRuntimeSettings_1 = __webpack_require__(/*! ./LogGroupRuntimeSettings */ "./node_modules/typescript-logging/dist/commonjs/log/standard/LogGroupRuntimeSettings.js");
var LoggerFactoryImpl = /** @class */ (function () {
    function LoggerFactoryImpl(name, options) {
        this._loggers = new DataStructures_1.SimpleMap();
        this._logGroupRuntimeSettingsIndexed = [];
        this._loggerToLogGroupSettings = new DataStructures_1.SimpleMap();
        this._name = name;
        this.configure(options);
    }
    LoggerFactoryImpl.prototype.configure = function (options) {
        this._options = options;
        // Close any current open loggers.
        this.closeLoggers();
        this._loggerToLogGroupSettings.clear();
        this._logGroupRuntimeSettingsIndexed = [];
        var logGroupRules = this._options.logGroupRules;
        /* tslint:disable:prefer-for-of */
        for (var i = 0; i < logGroupRules.length; i++) {
            this._logGroupRuntimeSettingsIndexed.push(new LogGroupRuntimeSettings_1.LogGroupRuntimeSettings(logGroupRules[i]));
        }
        /* tslint:enable:prefer-for-of */
    };
    LoggerFactoryImpl.prototype.getLogger = function (named) {
        if (!this._options.enabled) {
            throw new Error("LoggerFactory is not enabled, please check your options passed in");
        }
        var logger = this._loggers.get(named);
        if (typeof logger !== "undefined") {
            return logger;
        }
        // Initialize logger with appropriate level
        logger = this.loadLogger(named);
        this._loggers.put(named, logger);
        return logger;
    };
    LoggerFactoryImpl.prototype.isEnabled = function () {
        return this._options.enabled;
    };
    LoggerFactoryImpl.prototype.closeLoggers = function () {
        this._loggers.forEachValue(function (logger) {
            // We can only close if AbstractLogger is used (our loggers, but user loggers may not extend it, even though unlikely).
            if (logger instanceof AbstractLogger_1.AbstractLogger) {
                logger.close();
            }
        });
        this._loggers.clear();
    };
    LoggerFactoryImpl.prototype.getName = function () {
        return this._name;
    };
    LoggerFactoryImpl.prototype.getLogGroupRuntimeSettingsByIndex = function (idx) {
        if (idx >= 0 && idx < this._logGroupRuntimeSettingsIndexed.length) {
            return this._logGroupRuntimeSettingsIndexed[idx];
        }
        return null;
    };
    LoggerFactoryImpl.prototype.getLogGroupRuntimeSettingsByLoggerName = function (nameLogger) {
        var result = this._loggerToLogGroupSettings.get(nameLogger);
        if (typeof result === "undefined") {
            return null;
        }
        return result;
    };
    LoggerFactoryImpl.prototype.getLogGroupRuntimeSettings = function () {
        return this._logGroupRuntimeSettingsIndexed.slice(0);
    };
    LoggerFactoryImpl.prototype.loadLogger = function (named) {
        var logGroupRules = this._options.logGroupRules;
        for (var i = 0; i < logGroupRules.length; i++) {
            var logGroupRule = logGroupRules[i];
            if (logGroupRule.regExp.test(named)) {
                var logGroupRuntimeSettings = this._logGroupRuntimeSettingsIndexed[i];
                var logger = void 0;
                switch (logGroupRule.loggerType) {
                    case LoggerOptions_1.LoggerType.Console:
                        logger = new ConsoleLoggerImpl_1.ConsoleLoggerImpl(named, logGroupRuntimeSettings);
                        break;
                    case LoggerOptions_1.LoggerType.MessageBuffer:
                        logger = new MessageBufferLoggerImpl_1.MessageBufferLoggerImpl(named, logGroupRuntimeSettings);
                        break;
                    case LoggerOptions_1.LoggerType.Custom:
                        if (logGroupRule.callBackLogger != null) {
                            logger = logGroupRule.callBackLogger(named, logGroupRuntimeSettings);
                        }
                        else {
                            throw new Error("Cannot create a custom logger, custom callback is null");
                        }
                        break;
                    default:
                        throw new Error("Cannot create a Logger for LoggerType: " + logGroupRule.loggerType);
                }
                // For a new logger map it by its name
                this._loggerToLogGroupSettings.put(named, logGroupRuntimeSettings);
                return logger;
            }
        }
        throw new Error("Failed to find a match to create a Logger for: " + named);
    };
    return LoggerFactoryImpl;
}());
exports.LoggerFactoryImpl = LoggerFactoryImpl;
//# sourceMappingURL=LoggerFactoryImpl.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/standard/LoggerFactoryOptions.js":
/*!********************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/standard/LoggerFactoryOptions.js ***!
  \********************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggerFactoryOptions = void 0;
/**
 * Options object you can use to configure the LoggerFactory you create at LFService.
 */
var LoggerFactoryOptions = /** @class */ (function () {
    function LoggerFactoryOptions() {
        this._logGroupRules = [];
        this._enabled = true;
    }
    /**
     * Add LogGroupRule, see {LogGroupRule) for details
     * @param rule Rule to add
     * @returns {LoggerFactoryOptions} returns itself
     */
    LoggerFactoryOptions.prototype.addLogGroupRule = function (rule) {
        this._logGroupRules.push(rule);
        return this;
    };
    /**
     * Enable or disable logging completely for the LoggerFactory.
     * @param enabled True for enabled (default)
     * @returns {LoggerFactoryOptions} returns itself
     */
    LoggerFactoryOptions.prototype.setEnabled = function (enabled) {
        this._enabled = enabled;
        return this;
    };
    Object.defineProperty(LoggerFactoryOptions.prototype, "logGroupRules", {
        get: function () {
            return this._logGroupRules;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LoggerFactoryOptions.prototype, "enabled", {
        get: function () {
            return this._enabled;
        },
        enumerable: false,
        configurable: true
    });
    return LoggerFactoryOptions;
}());
exports.LoggerFactoryOptions = LoggerFactoryOptions;
//# sourceMappingURL=LoggerFactoryOptions.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/log/standard/MessageBufferLoggerImpl.js":
/*!***********************************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/log/standard/MessageBufferLoggerImpl.js ***!
  \***********************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessageBufferLoggerImpl = void 0;
var AbstractLogger_1 = __webpack_require__(/*! ./AbstractLogger */ "./node_modules/typescript-logging/dist/commonjs/log/standard/AbstractLogger.js");
/**
 * Logger which buffers all messages, use with care due to possible high memory footprint.
 * Can be convenient in some cases. Call toString() for full output, or cast to this class
 * and call getMessages() to do something with it yourself.
 */
var MessageBufferLoggerImpl = /** @class */ (function (_super) {
    __extends(MessageBufferLoggerImpl, _super);
    function MessageBufferLoggerImpl(name, logGroupRuntimeSettings) {
        var _this = _super.call(this, name, logGroupRuntimeSettings) || this;
        _this.messages = [];
        return _this;
    }
    MessageBufferLoggerImpl.prototype.close = function () {
        this.messages = [];
        _super.prototype.close.call(this);
    };
    MessageBufferLoggerImpl.prototype.getMessages = function () {
        return this.messages;
    };
    MessageBufferLoggerImpl.prototype.toString = function () {
        return this.messages.map(function (msg) {
            return msg;
        }).join("\n");
    };
    MessageBufferLoggerImpl.prototype.doLog = function (message) {
        var messageFormatter = this._getMessageFormatter();
        var fullMsg;
        if (messageFormatter === null) {
            fullMsg = this.createDefaultLogMessage(message);
        }
        else {
            fullMsg = messageFormatter(message);
        }
        this.messages.push(fullMsg);
    };
    return MessageBufferLoggerImpl;
}(AbstractLogger_1.AbstractLogger));
exports.MessageBufferLoggerImpl = MessageBufferLoggerImpl;
//# sourceMappingURL=MessageBufferLoggerImpl.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/typescript-logging.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/typescript-logging.js ***!
  \*****************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getCategoryControl = exports.getLogControl = exports.help = exports.MessageFormatUtils = exports.LinkedList = exports.SimpleMap = exports.LogLevel = exports.LoggerType = exports.LogFormat = exports.DateFormatEnum = exports.DateFormat = exports.CategoryLogFormat = exports.MessageBufferLoggerImpl = exports.ConsoleLoggerImpl = exports.AbstractLogger = exports.LFService = exports.LogGroupRule = exports.LoggerFactoryOptions = exports.CategoryServiceFactory = exports.CategoryMessageBufferLoggerImpl = exports.CategoryConfiguration = exports.CategoryRuntimeSettings = exports.Category = exports.CategoryDelegateLoggerImpl = exports.CategoryConsoleLoggerImpl = exports.AbstractCategoryLogger = exports.ExtensionHelper = void 0;
var LogGroupControl_1 = __webpack_require__(/*! ./control/LogGroupControl */ "./node_modules/typescript-logging/dist/commonjs/control/LogGroupControl.js");
var CategoryServiceControl_1 = __webpack_require__(/*! ./control/CategoryServiceControl */ "./node_modules/typescript-logging/dist/commonjs/control/CategoryServiceControl.js");
// Public stuff we export for extension
__exportStar(__webpack_require__(/*! ./extension/MessagesToExtensionJSON */ "./node_modules/typescript-logging/dist/commonjs/extension/MessagesToExtensionJSON.js"), exports);
__exportStar(__webpack_require__(/*! ./extension/MessagesFromExtensionJSON */ "./node_modules/typescript-logging/dist/commonjs/extension/MessagesFromExtensionJSON.js"), exports);
__exportStar(__webpack_require__(/*! ./extension/ExtensionMessageJSON */ "./node_modules/typescript-logging/dist/commonjs/extension/ExtensionMessageJSON.js"), exports);
var ExtensionHelper_1 = __webpack_require__(/*! ./extension/ExtensionHelper */ "./node_modules/typescript-logging/dist/commonjs/extension/ExtensionHelper.js");
Object.defineProperty(exports, "ExtensionHelper", ({ enumerable: true, get: function () { return ExtensionHelper_1.ExtensionHelper; } }));
// Category related
var AbstractCategoryLogger_1 = __webpack_require__(/*! ./log/category/AbstractCategoryLogger */ "./node_modules/typescript-logging/dist/commonjs/log/category/AbstractCategoryLogger.js");
Object.defineProperty(exports, "AbstractCategoryLogger", ({ enumerable: true, get: function () { return AbstractCategoryLogger_1.AbstractCategoryLogger; } }));
var CategoryConsoleLoggerImpl_1 = __webpack_require__(/*! ./log/category/CategoryConsoleLoggerImpl */ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryConsoleLoggerImpl.js");
Object.defineProperty(exports, "CategoryConsoleLoggerImpl", ({ enumerable: true, get: function () { return CategoryConsoleLoggerImpl_1.CategoryConsoleLoggerImpl; } }));
var CategoryDelegateLoggerImpl_1 = __webpack_require__(/*! ./log/category/CategoryDelegateLoggerImpl */ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryDelegateLoggerImpl.js");
Object.defineProperty(exports, "CategoryDelegateLoggerImpl", ({ enumerable: true, get: function () { return CategoryDelegateLoggerImpl_1.CategoryDelegateLoggerImpl; } }));
var Category_1 = __webpack_require__(/*! ./log/category/Category */ "./node_modules/typescript-logging/dist/commonjs/log/category/Category.js");
Object.defineProperty(exports, "Category", ({ enumerable: true, get: function () { return Category_1.Category; } }));
var CategoryRuntimeSettings_1 = __webpack_require__(/*! ./log/category/CategoryRuntimeSettings */ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryRuntimeSettings.js");
Object.defineProperty(exports, "CategoryRuntimeSettings", ({ enumerable: true, get: function () { return CategoryRuntimeSettings_1.CategoryRuntimeSettings; } }));
var CategoryConfiguration_1 = __webpack_require__(/*! ./log/category/CategoryConfiguration */ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryConfiguration.js");
Object.defineProperty(exports, "CategoryConfiguration", ({ enumerable: true, get: function () { return CategoryConfiguration_1.CategoryConfiguration; } }));
var CategoryMessageBufferImpl_1 = __webpack_require__(/*! ./log/category/CategoryMessageBufferImpl */ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryMessageBufferImpl.js");
Object.defineProperty(exports, "CategoryMessageBufferLoggerImpl", ({ enumerable: true, get: function () { return CategoryMessageBufferImpl_1.CategoryMessageBufferLoggerImpl; } }));
var CategoryServiceFactory_1 = __webpack_require__(/*! ./log/category/CategoryServiceFactory */ "./node_modules/typescript-logging/dist/commonjs/log/category/CategoryServiceFactory.js");
Object.defineProperty(exports, "CategoryServiceFactory", ({ enumerable: true, get: function () { return CategoryServiceFactory_1.CategoryServiceFactory; } }));
var LoggerFactoryOptions_1 = __webpack_require__(/*! ./log/standard/LoggerFactoryOptions */ "./node_modules/typescript-logging/dist/commonjs/log/standard/LoggerFactoryOptions.js");
Object.defineProperty(exports, "LoggerFactoryOptions", ({ enumerable: true, get: function () { return LoggerFactoryOptions_1.LoggerFactoryOptions; } }));
var LogGroupRule_1 = __webpack_require__(/*! ./log/standard/LogGroupRule */ "./node_modules/typescript-logging/dist/commonjs/log/standard/LogGroupRule.js");
Object.defineProperty(exports, "LogGroupRule", ({ enumerable: true, get: function () { return LogGroupRule_1.LogGroupRule; } }));
var LFService_1 = __webpack_require__(/*! ./log/standard/LFService */ "./node_modules/typescript-logging/dist/commonjs/log/standard/LFService.js");
Object.defineProperty(exports, "LFService", ({ enumerable: true, get: function () { return LFService_1.LFService; } }));
var AbstractLogger_1 = __webpack_require__(/*! ./log/standard/AbstractLogger */ "./node_modules/typescript-logging/dist/commonjs/log/standard/AbstractLogger.js");
Object.defineProperty(exports, "AbstractLogger", ({ enumerable: true, get: function () { return AbstractLogger_1.AbstractLogger; } }));
var ConsoleLoggerImpl_1 = __webpack_require__(/*! ./log/standard/ConsoleLoggerImpl */ "./node_modules/typescript-logging/dist/commonjs/log/standard/ConsoleLoggerImpl.js");
Object.defineProperty(exports, "ConsoleLoggerImpl", ({ enumerable: true, get: function () { return ConsoleLoggerImpl_1.ConsoleLoggerImpl; } }));
var MessageBufferLoggerImpl_1 = __webpack_require__(/*! ./log/standard/MessageBufferLoggerImpl */ "./node_modules/typescript-logging/dist/commonjs/log/standard/MessageBufferLoggerImpl.js");
Object.defineProperty(exports, "MessageBufferLoggerImpl", ({ enumerable: true, get: function () { return MessageBufferLoggerImpl_1.MessageBufferLoggerImpl; } }));
var LoggerOptions_1 = __webpack_require__(/*! ./log/LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
Object.defineProperty(exports, "CategoryLogFormat", ({ enumerable: true, get: function () { return LoggerOptions_1.CategoryLogFormat; } }));
Object.defineProperty(exports, "DateFormat", ({ enumerable: true, get: function () { return LoggerOptions_1.DateFormat; } }));
Object.defineProperty(exports, "DateFormatEnum", ({ enumerable: true, get: function () { return LoggerOptions_1.DateFormatEnum; } }));
Object.defineProperty(exports, "LogFormat", ({ enumerable: true, get: function () { return LoggerOptions_1.LogFormat; } }));
Object.defineProperty(exports, "LoggerType", ({ enumerable: true, get: function () { return LoggerOptions_1.LoggerType; } }));
Object.defineProperty(exports, "LogLevel", ({ enumerable: true, get: function () { return LoggerOptions_1.LogLevel; } }));
// Utilities
var DataStructures_1 = __webpack_require__(/*! ./utils/DataStructures */ "./node_modules/typescript-logging/dist/commonjs/utils/DataStructures.js");
Object.defineProperty(exports, "SimpleMap", ({ enumerable: true, get: function () { return DataStructures_1.SimpleMap; } }));
Object.defineProperty(exports, "LinkedList", ({ enumerable: true, get: function () { return DataStructures_1.LinkedList; } }));
__exportStar(__webpack_require__(/*! ./utils/JSONHelper */ "./node_modules/typescript-logging/dist/commonjs/utils/JSONHelper.js"), exports);
var MessageUtils_1 = __webpack_require__(/*! ./utils/MessageUtils */ "./node_modules/typescript-logging/dist/commonjs/utils/MessageUtils.js");
Object.defineProperty(exports, "MessageFormatUtils", ({ enumerable: true, get: function () { return MessageUtils_1.MessageFormatUtils; } }));
/*
 Functions to export on TSL libarary var.
*/
// Export help function
function help() {
    /* tslint:disable:no-console */
    console.log("help()\n   ** Shows this help\n\n getLogControl(): LoggerControl\n   ** Returns LoggerControl Object, use to dynamically change loglevels for log4j logging.\n   ** Call .help() on LoggerControl object for available options.\n\n getCategoryControl(): CategoryServiceControl\n   ** Returns CategoryServiceControl Object, use to dynamically change loglevels for category logging.\n   ** Call .help() on CategoryServiceControl object for available options.\n");
    /* tslint:enable:no-console */
}
exports.help = help;
// Export LogControl function (log4j)
function getLogControl() {
    return new LogGroupControl_1.LoggerControlImpl();
}
exports.getLogControl = getLogControl;
// Export CategoryControl function
function getCategoryControl() {
    return new CategoryServiceControl_1.CategoryServiceControlImpl();
}
exports.getCategoryControl = getCategoryControl;
//# sourceMappingURL=typescript-logging.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/utils/DataStructures.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/utils/DataStructures.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StringBuilder = exports.TuplePair = exports.SimpleMap = exports.LinkedList = void 0;
var LinkedNode = /** @class */ (function () {
    function LinkedNode(value) {
        this._previous = null;
        this._next = null;
        this._value = value;
    }
    Object.defineProperty(LinkedNode.prototype, "previous", {
        get: function () {
            return this._previous;
        },
        set: function (value) {
            this._previous = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LinkedNode.prototype, "next", {
        get: function () {
            return this._next;
        },
        set: function (value) {
            this._next = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LinkedNode.prototype, "value", {
        get: function () {
            return this._value;
        },
        enumerable: false,
        configurable: true
    });
    return LinkedNode;
}());
/**
 * Double linkedlist implementation.
 */
var LinkedList = /** @class */ (function () {
    function LinkedList() {
        this.head = null;
        this.size = 0;
    }
    LinkedList.prototype.addHead = function (value) {
        if (!this.createHeadIfNeeded(value)) {
            if (this.head != null) {
                var nextNode = this.head.next;
                var newHeadNode = new LinkedNode(value);
                if (nextNode != null) {
                    nextNode.previous = newHeadNode;
                    newHeadNode.next = nextNode;
                }
                this.head = newHeadNode;
            }
            else {
                throw new Error("This should never happen, list implementation broken");
            }
        }
        this.size++;
    };
    LinkedList.prototype.addTail = function (value) {
        if (!this.createHeadIfNeeded(value)) {
            var oldTailNode = this.getTailNode();
            if (oldTailNode != null) {
                var newTailNode = new LinkedNode(value);
                oldTailNode.next = newTailNode;
                newTailNode.previous = oldTailNode;
            }
            else {
                throw new Error("List implementation broken");
            }
        }
        this.size++;
    };
    LinkedList.prototype.clear = function () {
        this.head = null;
        this.size = 0;
    };
    LinkedList.prototype.getHead = function () {
        if (this.head != null) {
            return this.head.value;
        }
        return null;
    };
    LinkedList.prototype.removeHead = function () {
        if (this.head != null) {
            var oldHead = this.head;
            var value = oldHead.value;
            this.head = oldHead.next;
            this.size--;
            return value;
        }
        return null;
    };
    LinkedList.prototype.getTail = function () {
        var node = this.getTailNode();
        if (node != null) {
            return node.value;
        }
        return null;
    };
    LinkedList.prototype.removeTail = function () {
        var node = this.getTailNode();
        if (node != null) {
            if (node === this.head) {
                this.head = null;
            }
            else {
                var previousNode = node.previous;
                if (previousNode != null) {
                    previousNode.next = null;
                }
                else {
                    throw new Error("List implementation is broken");
                }
            }
            this.size--;
            return node.value;
        }
        return null;
    };
    LinkedList.prototype.getSize = function () {
        return this.size;
    };
    LinkedList.prototype.filter = function (f) {
        var recurse = function (fn, node, values) {
            if (fn(node.value)) {
                values.push(node.value);
            }
            var nextNode = node.next;
            if (nextNode != null) {
                recurse(fn, nextNode, values);
            }
        };
        var result = [];
        var currentNode = this.head;
        if (currentNode != null) {
            recurse(f, currentNode, result);
        }
        return result;
    };
    LinkedList.prototype.createHeadIfNeeded = function (value) {
        if (this.head == null) {
            this.head = new LinkedNode(value);
            return true;
        }
        return false;
    };
    LinkedList.prototype.getTailNode = function () {
        if (this.head == null) {
            return null;
        }
        var node = this.head;
        while (node.next != null) {
            node = node.next;
        }
        return node;
    };
    return LinkedList;
}());
exports.LinkedList = LinkedList;
/**
 * Map implementation keyed by string (always).
 */
var SimpleMap = /** @class */ (function () {
    function SimpleMap() {
        this.array = {};
    }
    SimpleMap.prototype.put = function (key, value) {
        this.array[key] = value;
    };
    SimpleMap.prototype.get = function (key) {
        return this.array[key];
    };
    SimpleMap.prototype.exists = function (key) {
        var value = this.array[key];
        return (typeof value !== "undefined");
    };
    SimpleMap.prototype.remove = function (key) {
        var value = this.array[key];
        if (typeof value !== "undefined") {
            delete this.array[key];
        }
        return value;
    };
    SimpleMap.prototype.keys = function () {
        var keys = [];
        for (var key in this.array) {
            // To prevent random stuff to appear
            if (this.array.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    };
    SimpleMap.prototype.values = function () {
        var values = [];
        for (var key in this.array) {
            // To prevent random stuff to appear
            if (this.array.hasOwnProperty(key)) {
                values.push(this.get(key));
            }
        }
        return values;
    };
    SimpleMap.prototype.size = function () {
        return this.keys().length;
    };
    SimpleMap.prototype.isEmpty = function () {
        return this.size() === 0;
    };
    SimpleMap.prototype.clear = function () {
        this.array = {};
    };
    SimpleMap.prototype.forEach = function (cbFunction) {
        var count = 0;
        for (var key in this.array) {
            // To prevent random stuff to appear
            if (this.array.hasOwnProperty(key)) {
                var value = this.array[key];
                cbFunction(key, value, count);
                count++;
            }
        }
    };
    SimpleMap.prototype.forEachValue = function (cbFunction) {
        var count = 0;
        for (var key in this.array) {
            // To prevent random stuff to appear
            if (this.array.hasOwnProperty(key)) {
                var value = this.array[key];
                cbFunction(value, count);
                count++;
            }
        }
    };
    return SimpleMap;
}());
exports.SimpleMap = SimpleMap;
/**
 * Tuple to hold two values.
 */
var TuplePair = /** @class */ (function () {
    function TuplePair(x, y) {
        this._x = x;
        this._y = y;
    }
    Object.defineProperty(TuplePair.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (value) {
            this._x = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TuplePair.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (value) {
            this._y = value;
        },
        enumerable: false,
        configurable: true
    });
    return TuplePair;
}());
exports.TuplePair = TuplePair;
/**
 * Utility class to build up a string.
 */
var StringBuilder = /** @class */ (function () {
    function StringBuilder() {
        this.data = [];
    }
    StringBuilder.prototype.append = function (line) {
        if (line === undefined || line == null) {
            throw new Error("String must be set, cannot append null or undefined");
        }
        this.data.push(line);
        return this;
    };
    StringBuilder.prototype.appendLine = function (line) {
        this.data.push(line + "\n");
        return this;
    };
    StringBuilder.prototype.isEmpty = function () {
        return this.data.length === 0;
    };
    StringBuilder.prototype.clear = function () {
        this.data = [];
    };
    StringBuilder.prototype.toString = function (separator) {
        if (separator === void 0) { separator = ""; }
        return this.data.join(separator);
    };
    return StringBuilder;
}());
exports.StringBuilder = StringBuilder;
//# sourceMappingURL=DataStructures.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/utils/JSONHelper.js":
/*!***************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/utils/JSONHelper.js ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JSONHelper = exports.JSONArray = exports.JSONObject = void 0;
/**
 * Module containing bunch of JSON related stuff.
 */
var LoggerOptions_1 = __webpack_require__(/*! ../log/LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
var DataStructures_1 = __webpack_require__(/*! ./DataStructures */ "./node_modules/typescript-logging/dist/commonjs/utils/DataStructures.js");
var JSONTypeImpl = /** @class */ (function () {
    function JSONTypeImpl(value) {
        this._value = value;
    }
    JSONTypeImpl.prototype.getValue = function () {
        return this._value;
    };
    return JSONTypeImpl;
}());
var JSONBooleanType = /** @class */ (function (_super) {
    __extends(JSONBooleanType, _super);
    function JSONBooleanType(value) {
        return _super.call(this, value) || this;
    }
    return JSONBooleanType;
}(JSONTypeImpl));
var JSONNumberType = /** @class */ (function (_super) {
    __extends(JSONNumberType, _super);
    function JSONNumberType(value) {
        return _super.call(this, value) || this;
    }
    return JSONNumberType;
}(JSONTypeImpl));
var JSONStringType = /** @class */ (function (_super) {
    __extends(JSONStringType, _super);
    function JSONStringType(value) {
        return _super.call(this, value) || this;
    }
    JSONStringType.prototype.toString = function () {
        var value = this.getValue();
        if (value != null) {
            return JSON.stringify(value.toString());
        }
        return "null";
    };
    return JSONStringType;
}(JSONTypeImpl));
var JSONObjectType = /** @class */ (function (_super) {
    __extends(JSONObjectType, _super);
    function JSONObjectType(value) {
        return _super.call(this, value) || this;
    }
    return JSONObjectType;
}(JSONTypeImpl));
var JSONArrayType = /** @class */ (function (_super) {
    __extends(JSONArrayType, _super);
    function JSONArrayType(value) {
        return _super.call(this, value) || this;
    }
    JSONArrayType.prototype.toString = function () {
        var value = this.getValue();
        if (value != null) {
            return value.toString();
        }
        return "null";
    };
    return JSONArrayType;
}(JSONTypeImpl));
var JSONNullType = /** @class */ (function (_super) {
    __extends(JSONNullType, _super);
    function JSONNullType() {
        return _super.call(this, null) || this;
    }
    JSONNullType.prototype.toString = function () {
        return "null";
    };
    return JSONNullType;
}(JSONTypeImpl));
var JSONTypeConverter = /** @class */ (function () {
    function JSONTypeConverter() {
    }
    JSONTypeConverter.toJSONType = function (value) {
        if (value === null) {
            return new JSONNullType();
        }
        if (typeof value === "string") {
            return new JSONStringType(value);
        }
        if (typeof value === "number") {
            return new JSONNumberType(value);
        }
        if (typeof value === "boolean") {
            return new JSONBooleanType(value);
        }
        if (value instanceof JSONObject) {
            return new JSONObjectType(value);
        }
        throw new Error("Type not supported for value: " + value);
    };
    return JSONTypeConverter;
}());
var JSONObject = /** @class */ (function () {
    function JSONObject() {
        this.values = new DataStructures_1.SimpleMap();
    }
    JSONObject.prototype.addBoolean = function (name, value) {
        this.checkName(name);
        JSONObject.checkValue(value);
        this.values.put(name, new JSONBooleanType(value));
        return this;
    };
    JSONObject.prototype.addNumber = function (name, value) {
        this.checkName(name);
        JSONObject.checkValue(value);
        this.values.put(name, new JSONNumberType(value));
        return this;
    };
    JSONObject.prototype.addString = function (name, value) {
        this.checkName(name);
        JSONObject.checkValue(value);
        this.values.put(name, new JSONStringType(value));
        return this;
    };
    JSONObject.prototype.addNull = function (name) {
        this.checkName(name);
        this.values.put(name, new JSONNullType());
        return this;
    };
    JSONObject.prototype.addArray = function (name, array) {
        this.checkName(name);
        JSONObject.checkValue(array);
        if (array == null) {
            throw new Error("Cannot add array as null");
        }
        this.values.put(name, new JSONArrayType(array));
        return this;
    };
    JSONObject.prototype.addObject = function (name, object) {
        this.checkName(name);
        JSONObject.checkValue(object);
        if (object == null) {
            throw new Error("Cannot add object as null");
        }
        this.values.put(name, new JSONObjectType(object));
        return this;
    };
    JSONObject.prototype.toString = function (pretty) {
        var _this = this;
        if (pretty === void 0) { pretty = false; }
        var comma = false;
        var buffer = new DataStructures_1.StringBuilder();
        buffer.append("{");
        this.values.keys().forEach(function (key) {
            var value = _this.values.get(key);
            if (value != null) {
                if (comma) {
                    buffer.append(",");
                }
                buffer.append('"').append(key).append('":').append(value.toString());
                comma = true;
            }
        });
        buffer.append("}");
        return buffer.toString();
    };
    JSONObject.prototype.checkName = function (name) {
        if (name == null || name === undefined) {
            throw new Error("Name is null or undefined");
        }
        if (this.values.exists(name)) {
            throw new Error("Name " + name + " is already present for this object");
        }
    };
    JSONObject.checkValue = function (value) {
        if (value === undefined) {
            throw new Error("Value is undefined");
        }
    };
    return JSONObject;
}());
exports.JSONObject = JSONObject;
var JSONArray = /** @class */ (function () {
    function JSONArray() {
        this.objects = [];
    }
    JSONArray.prototype.add = function (object) {
        if (object === undefined) {
            throw new Error("Object is not allowed to be undefined");
        }
        this.objects.push(JSONTypeConverter.toJSONType(object));
        return this;
    };
    JSONArray.prototype.toString = function (pretty) {
        if (pretty === void 0) { pretty = false; }
        var buffer = new DataStructures_1.StringBuilder();
        buffer.append("[");
        this.objects.forEach(function (value, index) {
            if (index > 0) {
                buffer.append(",");
            }
            buffer.append(value.toString());
        });
        buffer.append("]");
        return buffer.toString();
    };
    return JSONArray;
}());
exports.JSONArray = JSONArray;
/**
 * Utility class that helps us convert things to and from json (not for normal usage).
 */
var JSONHelper = /** @class */ (function () {
    function JSONHelper() {
    }
    JSONHelper.categoryToJSON = function (cat, recursive) {
        /*
         {
         "categories":
         [
         { id=1,
         name: "x",
         parent: null,
         logLevel: "Error"
         },
         { id=2,
         name: "y",
         parent: 1,
         logLevel: "Error"
         }
         ]
         }
         */
        var arr = new JSONArray();
        JSONHelper._categoryToJSON(cat, arr, recursive);
        var object = new JSONObject();
        object.addArray("categories", arr);
        return object;
    };
    JSONHelper._categoryToJSON = function (cat, arr, recursive) {
        var object = new JSONObject();
        object.addNumber("id", cat.id);
        object.addString("name", cat.name);
        object.addString("logLevel", LoggerOptions_1.LogLevel[cat.logLevel].toString());
        if (cat.parent != null) {
            object.addNumber("parent", cat.parent.id);
        }
        else {
            object.addNull("parent");
        }
        arr.add(object);
        if (recursive) {
            cat.children.forEach(function (child) {
                JSONHelper._categoryToJSON(child, arr, recursive);
            });
        }
    };
    return JSONHelper;
}());
exports.JSONHelper = JSONHelper;
//# sourceMappingURL=JSONHelper.js.map

/***/ }),

/***/ "./node_modules/typescript-logging/dist/commonjs/utils/MessageUtils.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/typescript-logging/dist/commonjs/utils/MessageUtils.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessageFormatUtils = void 0;
var ST = __webpack_require__(/*! stacktrace-js */ "./node_modules/stacktrace-js/stacktrace.js");
var LoggerOptions_1 = __webpack_require__(/*! ../log/LoggerOptions */ "./node_modules/typescript-logging/dist/commonjs/log/LoggerOptions.js");
/**
 * Some utilities to format messages.
 */
var MessageFormatUtils = /** @class */ (function () {
    function MessageFormatUtils() {
    }
    /**
     * Render given date in given DateFormat and return as String.
     * @param date Date
     * @param dateFormat Format
     * @returns {string} Formatted date
     */
    MessageFormatUtils.renderDate = function (date, dateFormat) {
        var lpad = function (value, chars, padWith) {
            var howMany = chars - value.length;
            if (howMany > 0) {
                var res = "";
                for (var i = 0; i < howMany; i++) {
                    res += padWith;
                }
                res += value;
                return res;
            }
            return value;
        };
        var fullYear = function (d) {
            return lpad(d.getFullYear().toString(), 4, "0");
        };
        var month = function (d) {
            return lpad((d.getMonth() + 1).toString(), 2, "0");
        };
        var day = function (d) {
            return lpad(d.getDate().toString(), 2, "0");
        };
        var hours = function (d) {
            return lpad(d.getHours().toString(), 2, "0");
        };
        var minutes = function (d) {
            return lpad(d.getMinutes().toString(), 2, "0");
        };
        var seconds = function (d) {
            return lpad(d.getSeconds().toString(), 2, "0");
        };
        var millis = function (d) {
            return lpad(d.getMilliseconds().toString(), 3, "0");
        };
        var dateSeparator = dateFormat.dateSeparator;
        var ds = "";
        switch (dateFormat.formatEnum) {
            case LoggerOptions_1.DateFormatEnum.Default:
                // yyyy-mm-dd hh:mm:ss,m
                ds = fullYear(date) + dateSeparator + month(date) + dateSeparator + day(date) + " " +
                    hours(date) + ":" + minutes(date) + ":" + seconds(date) + "," + millis(date);
                break;
            case LoggerOptions_1.DateFormatEnum.YearMonthDayTime:
                ds = fullYear(date) + dateSeparator + month(date) + dateSeparator + day(date) + " " +
                    hours(date) + ":" + minutes(date) + ":" + seconds(date);
                break;
            case LoggerOptions_1.DateFormatEnum.YearDayMonthWithFullTime:
                ds = fullYear(date) + dateSeparator + day(date) + dateSeparator + month(date) + " " +
                    hours(date) + ":" + minutes(date) + ":" + seconds(date) + "," + millis(date);
                break;
            case LoggerOptions_1.DateFormatEnum.YearDayMonthTime:
                ds = fullYear(date) + dateSeparator + day(date) + dateSeparator + month(date) + " " +
                    hours(date) + ":" + minutes(date) + ":" + seconds(date);
                break;
            default:
                throw new Error("Unsupported date format enum: " + dateFormat.formatEnum);
        }
        return ds;
    };
    /**
     * Renders given category log message in default format.
     * @param msg Message to format
     * @param addStack If true adds the stack to the output, otherwise skips it
     * @returns {string} Formatted message
     */
    MessageFormatUtils.renderDefaultMessage = function (msg, addStack) {
        var result = "";
        var logFormat = msg.logFormat;
        if (logFormat.showTimeStamp) {
            result += MessageFormatUtils.renderDate(msg.date, logFormat.dateFormat) + " ";
        }
        result += LoggerOptions_1.LogLevel[msg.level].toUpperCase();
        if (msg.isResolvedErrorMessage) {
            result += " (resolved)";
        }
        result += " ";
        if (logFormat.showCategoryName) {
            result += "[";
            msg.categories.forEach(function (value, idx) {
                if (idx > 0) {
                    result += ", ";
                }
                result += value.name;
            });
            result += "]";
        }
        // Get the normal string message first
        var actualStringMsg = "";
        var dataString = "";
        var messageOrLogData = msg.message;
        if (typeof messageOrLogData === "string") {
            actualStringMsg = messageOrLogData;
        }
        else {
            var logData = messageOrLogData;
            actualStringMsg = logData.msg;
            // We do have data?
            if (logData.data) {
                dataString = " [data]: " + (logData.ds ? logData.ds(logData.data) : JSON.stringify(logData.data));
            }
        }
        result += " " + actualStringMsg + "" + dataString;
        if (addStack && msg.errorAsStack !== null) {
            result += "\n" + msg.errorAsStack;
        }
        return result;
    };
    /**
     * Renders given log4j log message in default format.
     * @param msg Message to format
     * @param addStack If true adds the stack to the output, otherwise skips it
     * @returns {string} Formatted message
     */
    MessageFormatUtils.renderDefaultLog4jMessage = function (msg, addStack) {
        var format = msg.logGroupRule.logFormat;
        var result = "";
        if (format.showTimeStamp) {
            result += MessageFormatUtils.renderDate(msg.date, format.dateFormat) + " ";
        }
        result += LoggerOptions_1.LogLevel[msg.level].toUpperCase() + " ";
        if (format.showLoggerName) {
            result += "[" + msg.loggerName + "]";
        }
        // Get the normal string message first
        var actualStringMsg = "";
        var dataString = "";
        if (typeof msg.message === "string") {
            actualStringMsg = msg.message;
        }
        else {
            var logData = msg.message;
            actualStringMsg = logData.msg;
            // We do have data?
            if (logData.data) {
                dataString = " [data]: " + (logData.ds ? logData.ds(logData.data) : JSON.stringify(logData.data));
            }
        }
        result += " " + actualStringMsg + "" + dataString;
        if (addStack && msg.errorAsStack !== null) {
            result += "\n" + msg.errorAsStack;
        }
        return result;
    };
    /**
     * Render error as stack
     * @param error Return error as Promise
     * @returns {Promise<string>|Promise} Promise for stack
     */
    MessageFormatUtils.renderError = function (error) {
        var result = error.name + ": " + error.message + "\n@";
        return new Promise(function (resolve) {
            // This one has a promise too
            ST.fromError(error, { offline: true }).then(function (frames) {
                var stackStr = (frames.map(function (frame) {
                    return frame.toString();
                })).join("\n  ");
                result += "\n" + stackStr;
                // This resolves our returned promise
                resolve(result);
            }).catch(function () {
                result = "Unexpected error object was passed in. ";
                try {
                    result += "Could not resolve it, stringified object: " + JSON.stringify(error);
                }
                catch (e) {
                    // Cannot stringify can only tell something was wrong.
                    result += "Could not resolve it or stringify it.";
                }
                resolve(result);
            });
        });
    };
    return MessageFormatUtils;
}());
exports.MessageFormatUtils = MessageFormatUtils;
//# sourceMappingURL=MessageUtils.js.map

/***/ }),

/***/ "./node_modules/css-selector-generator/build/index.js":
/*!************************************************************!*\
  !*** ./node_modules/css-selector-generator/build/index.js ***!
  \************************************************************/
/***/ ((module) => {

!function(t,e){ true?module.exports=e():0}(self,(()=>(()=>{"use strict";var t,e,n={d:(t,e)=>{for(var o in e)n.o(e,o)&&!n.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:e[o]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},o={};function r(t){return t&&t instanceof Element}function i(t="unknown problem",...e){console.warn(`CssSelectorGenerator: ${t}`,...e)}n.r(o),n.d(o,{default:()=>z,getCssSelector:()=>U}),function(t){t.NONE="none",t.DESCENDANT="descendant",t.CHILD="child"}(t||(t={})),function(t){t.id="id",t.class="class",t.tag="tag",t.attribute="attribute",t.nthchild="nthchild",t.nthoftype="nthoftype"}(e||(e={}));const c={selectors:[e.id,e.class,e.tag,e.attribute],includeTag:!1,whitelist:[],blacklist:[],combineWithinSelector:!0,combineBetweenSelectors:!0,root:null,maxCombinations:Number.POSITIVE_INFINITY,maxCandidates:Number.POSITIVE_INFINITY};function u(t){return t instanceof RegExp}function s(t){return["string","function"].includes(typeof t)||u(t)}function l(t){return Array.isArray(t)?t.filter(s):[]}function a(t){const e=[Node.DOCUMENT_NODE,Node.DOCUMENT_FRAGMENT_NODE,Node.ELEMENT_NODE];return function(t){return t instanceof Node}(t)&&e.includes(t.nodeType)}function f(t,e){if(a(t))return t.contains(e)||i("element root mismatch","Provided root does not contain the element. This will most likely result in producing a fallback selector using element's real root node. If you plan to use the selector using provided root (e.g. `root.querySelector`), it will nto work as intended."),t;const n=e.getRootNode({composed:!1});return a(n)?(n!==document&&i("shadow root inferred","You did not provide a root and the element is a child of Shadow DOM. This will produce a selector using ShadowRoot as a root. If you plan to use the selector using document as a root (e.g. `document.querySelector`), it will not work as intended."),n):e.ownerDocument.querySelector(":root")}function d(t){return"number"==typeof t?t:Number.POSITIVE_INFINITY}function m(t=[]){const[e=[],...n]=t;return 0===n.length?e:n.reduce(((t,e)=>t.filter((t=>e.includes(t)))),e)}function p(t){return[].concat(...t)}function h(t){const e=t.map((t=>{if(u(t))return e=>t.test(e);if("function"==typeof t)return e=>{const n=t(e);return"boolean"!=typeof n?(i("pattern matcher function invalid","Provided pattern matching function does not return boolean. It's result will be ignored.",t),!1):n};if("string"==typeof t){const e=new RegExp("^"+t.replace(/[|\\{}()[\]^$+?.]/g,"\\$&").replace(/\*/g,".+")+"$");return t=>e.test(t)}return i("pattern matcher invalid","Pattern matching only accepts strings, regular expressions and/or functions. This item is invalid and will be ignored.",t),()=>!1}));return t=>e.some((e=>e(t)))}function g(t,e,n){const o=Array.from(f(n,t[0]).querySelectorAll(e));return o.length===t.length&&t.every((t=>o.includes(t)))}function y(t,e){e=null!=e?e:function(t){return t.ownerDocument.querySelector(":root")}(t);const n=[];let o=t;for(;r(o)&&o!==e;)n.push(o),o=o.parentElement;return n}function b(t,e){return m(t.map((t=>y(t,e))))}const N={[t.NONE]:{type:t.NONE,value:""},[t.DESCENDANT]:{type:t.DESCENDANT,value:" > "},[t.CHILD]:{type:t.CHILD,value:" "}},S=new RegExp(["^$","\\s"].join("|")),E=new RegExp(["^$"].join("|")),w=[e.nthoftype,e.tag,e.id,e.class,e.attribute,e.nthchild],v=h(["class","id","ng-*"]);function C({nodeName:t}){return`[${t}]`}function O({nodeName:t,nodeValue:e}){return`[${t}='${L(e)}']`}function T(t){const e=Array.from(t.attributes).filter((e=>function({nodeName:t},e){const n=e.tagName.toLowerCase();return!(["input","option"].includes(n)&&"value"===t||v(t))}(e,t)));return[...e.map(C),...e.map(O)]}function I(t){return(t.getAttribute("class")||"").trim().split(/\s+/).filter((t=>!E.test(t))).map((t=>`.${L(t)}`))}function x(t){const e=t.getAttribute("id")||"",n=`#${L(e)}`,o=t.getRootNode({composed:!1});return!S.test(e)&&g([t],n,o)?[n]:[]}function j(t){const e=t.parentNode;if(e){const n=Array.from(e.childNodes).filter(r).indexOf(t);if(n>-1)return[`:nth-child(${n+1})`]}return[]}function A(t){return[L(t.tagName.toLowerCase())]}function D(t){const e=[...new Set(p(t.map(A)))];return 0===e.length||e.length>1?[]:[e[0]]}function $(t){const e=D([t])[0],n=t.parentElement;if(n){const o=Array.from(n.children).filter((t=>t.tagName.toLowerCase()===e)),r=o.indexOf(t);if(r>-1)return[`${e}:nth-of-type(${r+1})`]}return[]}function R(t=[],{maxResults:e=Number.POSITIVE_INFINITY}={}){const n=[];let o=0,r=k(1);for(;r.length<=t.length&&o<e;)o+=1,n.push(r.map((e=>t[e]))),r=P(r,t.length-1);return n}function P(t=[],e=0){const n=t.length;if(0===n)return[];const o=[...t];o[n-1]+=1;for(let t=n-1;t>=0;t--)if(o[t]>e){if(0===t)return k(n+1);o[t-1]++,o[t]=o[t-1]+1}return o[n-1]>e?k(n+1):o}function k(t=1){return Array.from(Array(t).keys())}const _=":".charCodeAt(0).toString(16).toUpperCase(),M=/[ !"#$%&'()\[\]{|}<>*+,./;=?@^`~\\]/;function L(t=""){var e,n;return null!==(n=null===(e=null===CSS||void 0===CSS?void 0:CSS.escape)||void 0===e?void 0:e.call(CSS,t))&&void 0!==n?n:function(t=""){return t.split("").map((t=>":"===t?`\\${_} `:M.test(t)?`\\${t}`:escape(t).replace(/%/g,"\\"))).join("")}(t)}const q={tag:D,id:function(t){return 0===t.length||t.length>1?[]:x(t[0])},class:function(t){return m(t.map(I))},attribute:function(t){return m(t.map(T))},nthchild:function(t){return m(t.map(j))},nthoftype:function(t){return m(t.map($))}},F={tag:A,id:x,class:I,attribute:T,nthchild:j,nthoftype:$};function V(t){return t.includes(e.tag)||t.includes(e.nthoftype)?[...t]:[...t,e.tag]}function Y(t={}){const n=[...w];return t[e.tag]&&t[e.nthoftype]&&n.splice(n.indexOf(e.tag),1),n.map((e=>{return(o=t)[n=e]?o[n].join(""):"";var n,o})).join("")}function B(t,e,n="",o){const r=function(t,e){return""===e?t:function(t,e){return[...t.map((t=>e+" "+t)),...t.map((t=>e+" > "+t))]}(t,e)}(function(t,e,n){const o=function(t,e){const{blacklist:n,whitelist:o,combineWithinSelector:r,maxCombinations:i}=e,c=h(n),u=h(o);return function(t){const{selectors:e,includeTag:n}=t,o=[].concat(e);return n&&!o.includes("tag")&&o.push("tag"),o}(e).reduce(((e,n)=>{const o=function(t,e){var n;return(null!==(n=q[e])&&void 0!==n?n:()=>[])(t)}(t,n),s=function(t=[],e,n){return t.filter((t=>n(t)||!e(t)))}(o,c,u),l=function(t=[],e){return t.sort(((t,n)=>{const o=e(t),r=e(n);return o&&!r?-1:!o&&r?1:0}))}(s,u);return e[n]=r?R(l,{maxResults:i}):l.map((t=>[t])),e}),{})}(t,n),r=function(t,e){return function(t){const{selectors:e,combineBetweenSelectors:n,includeTag:o,maxCandidates:r}=t,i=n?R(e,{maxResults:r}):e.map((t=>[t]));return o?i.map(V):i}(e).map((e=>function(t,e){const n={};return t.forEach((t=>{const o=e[t];o.length>0&&(n[t]=o)})),function(t={}){let e=[];return Object.entries(t).forEach((([t,n])=>{e=n.flatMap((n=>0===e.length?[{[t]:n}]:e.map((e=>Object.assign(Object.assign({},e),{[t]:n})))))})),e}(n).map(Y)}(e,t))).filter((t=>t.length>0))}(o,n),i=p(r);return[...new Set(i)]}(t,o.root,o),n);for(const e of r)if(g(t,e,o.root))return e;return null}function G(t){return{value:t,include:!1}}function W({selectors:t,operator:n}){let o=[...w];t[e.tag]&&t[e.nthoftype]&&(o=o.filter((t=>t!==e.tag)));let r="";return o.forEach((e=>{(t[e]||[]).forEach((({value:t,include:e})=>{e&&(r+=t)}))})),n.value+r}function H(n){return[":root",...y(n).reverse().map((n=>{const o=function(e,n,o=t.NONE){const r={};return n.forEach((t=>{Reflect.set(r,t,function(t,e){return F[e](t)}(e,t).map(G))})),{element:e,operator:N[o],selectors:r}}(n,[e.nthchild],t.DESCENDANT);return o.selectors.nthchild.forEach((t=>{t.include=!0})),o})).map(W)].join("")}function U(t,n={}){const o=function(t){const e=(Array.isArray(t)?t:[t]).filter(r);return[...new Set(e)]}(t),i=function(t,n={}){const o=Object.assign(Object.assign({},c),n);return{selectors:(r=o.selectors,Array.isArray(r)?r.filter((t=>{return n=e,o=t,Object.values(n).includes(o);var n,o})):[]),whitelist:l(o.whitelist),blacklist:l(o.blacklist),root:f(o.root,t),combineWithinSelector:!!o.combineWithinSelector,combineBetweenSelectors:!!o.combineBetweenSelectors,includeTag:!!o.includeTag,maxCombinations:d(o.maxCombinations),maxCandidates:d(o.maxCandidates)};var r}(o[0],n);let u="",s=i.root;function a(){return function(t,e,n="",o){if(0===t.length)return null;const r=[t.length>1?t:[],...b(t,e).map((t=>[t]))];for(const t of r){const e=B(t,0,n,o);if(e)return{foundElements:t,selector:e}}return null}(o,s,u,i)}let m=a();for(;m;){const{foundElements:t,selector:e}=m;if(g(o,e,i.root))return e;s=t[0],u=e,m=a()}return o.length>1?o.map((t=>U(t,i))).join(", "):function(t){return t.map(H).join(", ")}(o)}const z=U;return o})()));

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVzs7QUFFWDtBQUNBO0FBQ0EsUUFBUTtBQUNSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXOztBQUVYO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEseUJBQXlCOztBQUV6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQixNQUFNO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0RBQXNEO0FBQ3REOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSx1REFBdUQsWUFBWTtBQUNuRTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1DQUFtQztBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLGNBQWM7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix3Q0FBd0M7QUFDaEU7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRCxvQkFBb0I7QUFDcEU7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw4QkFBOEI7O0FBRTlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsb0JBQW9CO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsTUFBTTtBQUNuQztBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNEQUFzRDtBQUN0RDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsMkJBQTJCO0FBQy9DLHNCQUFzQiwrQ0FBK0M7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQiwyQkFBMkI7QUFDL0M7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLDJCQUEyQjtBQUMvQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsMkJBQTJCO0FBQy9DO0FBQ0E7QUFDQSxzQkFBc0IsNEJBQTRCO0FBQ2xEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxnQ0FBZ0M7Ozs7Ozs7Ozs7O0FDempDaEMsaUJBQWlCLG9CQUFvQjtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGdCQUFnQixtQkFBTyxDQUFDLGlFQUFjO0FBQ3RDLFdBQVcsbUJBQU8sQ0FBQyxxREFBUTtBQUMzQixlQUFlLCtGQUErQjtBQUM5QyxrQkFBa0Isd0dBQXFDOztBQUV2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMkNBQTJDLFNBQVM7QUFDcEQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDBCQUEwQjs7Ozs7Ozs7Ozs7QUNuWjFCLGlCQUFpQixvQkFBb0I7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx5QkFBeUIsK0hBQW9EO0FBQzdFLFdBQVcsbUJBQU8sQ0FBQyxxREFBUTs7QUFFM0I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQyxRQUFRO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4QyxTQUFTO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0Esc0NBQXNDO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixXQUFXO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0QsU0FBUztBQUN6RDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDBDQUEwQyxTQUFTO0FBQ25EO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsY0FBYztBQUMzRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLFdBQVc7QUFDWDtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7O0FBRUgsV0FBVztBQUNYOztBQUVBLGtCQUFrQjs7Ozs7Ozs7Ozs7QUN0WmxCLGlCQUFpQixvQkFBb0I7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxjQUFjOztBQUVkO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7O0FBRWhCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7O0FBRW5CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLCtDQUErQyxRQUFRO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7O0FBRWpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZOztBQUVaLGtCQUFrQjtBQUNsQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCOztBQUVoQjtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUJBQW1COztBQUVuQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EscUJBQXFCOztBQUVyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw0QkFBNEIsUUFBUTtBQUNwQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxrQ0FBa0M7O0FBRWxDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDJDQUEyQzs7QUFFM0M7QUFDQTtBQUNBO0FBQ0E7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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5Qix1QkFBdUI7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLHVCQUF1QjtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIsdUJBQXVCO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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UztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsZ0NBQWdDO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQztBQUNoQztBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQztBQUNoQztBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FB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a0JBQWtCO0FBQ2xGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixRQUFRO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixRQUFRO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLHlCQUF5QjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLGVBQWU7QUFDakQ7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0EsQ0FBQztBQUNELDBCQUEwQjtBQUMx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ZUFBZSxjQUFjLElBQUkscUNBQXFDLDhCQUE4Qix5Q0FBeUMsYUFBYSxLQUFLLG9CQUFvQixpQkFBaUIsRUFBRSxvQkFBb0IsMkNBQTJDLHNCQUFzQixxQkFBcUIsRUFBRSxzQ0FBc0MsT0FBTyxPQUFPLHdEQUF3RCw0Q0FBNEMsUUFBUSwrUUFBK1EsTUFBTSxTQUFTLGtCQUFrQixhQUFhLDRCQUE0Qiw0QkFBNEIsa0RBQWtELGtCQUFrQixtQkFBbUIsWUFBWSw0QkFBNEIsWUFBWSxVQUFVLFVBQVUsS0FBSyxFQUFFLEVBQUUsTUFBTSwyQkFBMkIsR0FBRywwQkFBMEIsaUJBQWlCLDREQUE0RCwyQkFBMkIsSUFBSSxVQUFVLFNBQVM7Ozs7OztVQ0FuclI7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vbm9kZV9tb2R1bGVzL2Vycm9yLXN0YWNrLXBhcnNlci9lcnJvci1zdGFjay1wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9ub2RlX21vZHVsZXMvc291cmNlLW1hcC9saWIvYXJyYXktc2V0LmpzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vbm9kZV9tb2R1bGVzL3NvdXJjZS1tYXAvbGliL2Jhc2U2NC12bHEuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9ub2RlX21vZHVsZXMvc291cmNlLW1hcC9saWIvYmFzZTY0LmpzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vbm9kZV9tb2R1bGVzL3NvdXJjZS1tYXAvbGliL2JpbmFyeS1zZWFyY2guanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9ub2RlX21vZHVsZXMvc291cmNlLW1hcC9saWIvbWFwcGluZy1saXN0LmpzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vbm9kZV9tb2R1bGVzL3NvdXJjZS1tYXAvbGliL3F1aWNrLXNvcnQuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9ub2RlX21vZHVsZXMvc291cmNlLW1hcC9saWIvc291cmNlLW1hcC1jb25zdW1lci5qcyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL25vZGVfbW9kdWxlcy9zb3VyY2UtbWFwL2xpYi9zb3VyY2UtbWFwLWdlbmVyYXRvci5qcyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL25vZGVfbW9kdWxlcy9zb3VyY2UtbWFwL2xpYi9zb3VyY2Utbm9kZS5qcyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL25vZGVfbW9kdWxlcy9zb3VyY2UtbWFwL2xpYi91dGlsLmpzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vbm9kZV9tb2R1bGVzL3NvdXJjZS1tYXAvc291cmNlLW1hcC5qcyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL25vZGVfbW9kdWxlcy9zdGFjay1nZW5lcmF0b3Ivbm9kZV9tb2R1bGVzL3N0YWNrZnJhbWUvc3RhY2tmcmFtZS5qcyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL25vZGVfbW9kdWxlcy9zdGFjay1nZW5lcmF0b3Ivc3RhY2stZ2VuZXJhdG9yLmpzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vbm9kZV9tb2R1bGVzL3N0YWNrZnJhbWUvc3RhY2tmcmFtZS5qcyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL25vZGVfbW9kdWxlcy9zdGFja3RyYWNlLWdwcy9zdGFja3RyYWNlLWdwcy5qcyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL25vZGVfbW9kdWxlcy9zdGFja3RyYWNlLWpzL3N0YWNrdHJhY2UuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9zcmMvX2luZnJhL0FpZmV4U2VydmljZUhUVFAudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9zcmMvX2luZnJhL0Jyb3dzZXJTZXJ2aWNlU2Vzc2lvblN0b3JhZ2UudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9zcmMvZG9tYWluL0FjdGlvbi50cyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL3NyYy9kb21haW4vRXZlbnRMaXN0ZW5lci50cyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL3NyYy9kb21haW4vU2Vzc2lvbi50cyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL3NyYy9mcmFtZXdvcmsvTG9nZ2VyLnRzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQtbG9nZ2luZy9kaXN0L2NvbW1vbmpzL2NvbnRyb2wvQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbC5qcyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0LWxvZ2dpbmcvZGlzdC9jb21tb25qcy9jb250cm9sL0xvZ0dyb3VwQ29udHJvbC5qcyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0LWxvZ2dpbmcvZGlzdC9jb21tb25qcy9leHRlbnNpb24vRXh0ZW5zaW9uSGVscGVyLmpzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQtbG9nZ2luZy9kaXN0L2NvbW1vbmpzL2V4dGVuc2lvbi9FeHRlbnNpb25NZXNzYWdlSlNPTi5qcyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0LWxvZ2dpbmcvZGlzdC9jb21tb25qcy9leHRlbnNpb24vTWVzc2FnZXNGcm9tRXh0ZW5zaW9uSlNPTi5qcyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0LWxvZ2dpbmcvZGlzdC9jb21tb25qcy9leHRlbnNpb24vTWVzc2FnZXNUb0V4dGVuc2lvbkpTT04uanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC1sb2dnaW5nL2Rpc3QvY29tbW9uanMvbG9nL0xvZ2dlck9wdGlvbnMuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC1sb2dnaW5nL2Rpc3QvY29tbW9uanMvbG9nL2NhdGVnb3J5L0Fic3RyYWN0Q2F0ZWdvcnlMb2dnZXIuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC1sb2dnaW5nL2Rpc3QvY29tbW9uanMvbG9nL2NhdGVnb3J5L0NhdGVnb3J5LmpzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQtbG9nZ2luZy9kaXN0L2NvbW1vbmpzL2xvZy9jYXRlZ29yeS9DYXRlZ29yeUNvbmZpZ3VyYXRpb24uanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC1sb2dnaW5nL2Rpc3QvY29tbW9uanMvbG9nL2NhdGVnb3J5L0NhdGVnb3J5Q29uc29sZUxvZ2dlckltcGwuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC1sb2dnaW5nL2Rpc3QvY29tbW9uanMvbG9nL2NhdGVnb3J5L0NhdGVnb3J5RGVsZWdhdGVMb2dnZXJJbXBsLmpzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQtbG9nZ2luZy9kaXN0L2NvbW1vbmpzL2xvZy9jYXRlZ29yeS9DYXRlZ29yeUV4dGVuc2lvbkxvZ2dlckltcGwuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC1sb2dnaW5nL2Rpc3QvY29tbW9uanMvbG9nL2NhdGVnb3J5L0NhdGVnb3J5TWVzc2FnZUJ1ZmZlckltcGwuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC1sb2dnaW5nL2Rpc3QvY29tbW9uanMvbG9nL2NhdGVnb3J5L0NhdGVnb3J5UnVudGltZVNldHRpbmdzLmpzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQtbG9nZ2luZy9kaXN0L2NvbW1vbmpzL2xvZy9jYXRlZ29yeS9DYXRlZ29yeVNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC1sb2dnaW5nL2Rpc3QvY29tbW9uanMvbG9nL2NhdGVnb3J5L0NhdGVnb3J5U2VydmljZUZhY3RvcnkuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC1sb2dnaW5nL2Rpc3QvY29tbW9uanMvbG9nL3N0YW5kYXJkL0Fic3RyYWN0TG9nZ2VyLmpzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQtbG9nZ2luZy9kaXN0L2NvbW1vbmpzL2xvZy9zdGFuZGFyZC9Db25zb2xlTG9nZ2VySW1wbC5qcyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0LWxvZ2dpbmcvZGlzdC9jb21tb25qcy9sb2cvc3RhbmRhcmQvTEZTZXJ2aWNlLmpzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQtbG9nZ2luZy9kaXN0L2NvbW1vbmpzL2xvZy9zdGFuZGFyZC9Mb2dHcm91cFJ1bGUuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC1sb2dnaW5nL2Rpc3QvY29tbW9uanMvbG9nL3N0YW5kYXJkL0xvZ0dyb3VwUnVudGltZVNldHRpbmdzLmpzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQtbG9nZ2luZy9kaXN0L2NvbW1vbmpzL2xvZy9zdGFuZGFyZC9Mb2dnZXJGYWN0b3J5SW1wbC5qcyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0LWxvZ2dpbmcvZGlzdC9jb21tb25qcy9sb2cvc3RhbmRhcmQvTG9nZ2VyRmFjdG9yeU9wdGlvbnMuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC1sb2dnaW5nL2Rpc3QvY29tbW9uanMvbG9nL3N0YW5kYXJkL01lc3NhZ2VCdWZmZXJMb2dnZXJJbXBsLmpzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQtbG9nZ2luZy9kaXN0L2NvbW1vbmpzL3R5cGVzY3JpcHQtbG9nZ2luZy5qcyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0LWxvZ2dpbmcvZGlzdC9jb21tb25qcy91dGlscy9EYXRhU3RydWN0dXJlcy5qcyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0LWxvZ2dpbmcvZGlzdC9jb21tb25qcy91dGlscy9KU09OSGVscGVyLmpzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0Ly4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQtbG9nZ2luZy9kaXN0L2NvbW1vbmpzL3V0aWxzL01lc3NhZ2VVdGlscy5qcyIsIndlYnBhY2s6Ly9icm93c2VyLXNjcmlwdC8uL25vZGVfbW9kdWxlcy9jc3Mtc2VsZWN0b3ItZ2VuZXJhdG9yL2J1aWxkL2luZGV4LmpzIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0L3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1zY3JpcHQvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2Jyb3dzZXItc2NyaXB0L3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICAvLyBVbml2ZXJzYWwgTW9kdWxlIERlZmluaXRpb24gKFVNRCkgdG8gc3VwcG9ydCBBTUQsIENvbW1vbkpTL05vZGUuanMsIFJoaW5vLCBhbmQgYnJvd3NlcnMuXG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKCdlcnJvci1zdGFjay1wYXJzZXInLCBbJ3N0YWNrZnJhbWUnXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ3N0YWNrZnJhbWUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5FcnJvclN0YWNrUGFyc2VyID0gZmFjdG9yeShyb290LlN0YWNrRnJhbWUpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gRXJyb3JTdGFja1BhcnNlcihTdGFja0ZyYW1lKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEZJUkVGT1hfU0FGQVJJX1NUQUNLX1JFR0VYUCA9IC8oXnxAKVxcUytcXDpcXGQrLztcbiAgICB2YXIgQ0hST01FX0lFX1NUQUNLX1JFR0VYUCA9IC9eXFxzKmF0IC4qKFxcUytcXDpcXGQrfFxcKG5hdGl2ZVxcKSkvbTtcbiAgICB2YXIgU0FGQVJJX05BVElWRV9DT0RFX1JFR0VYUCA9IC9eKGV2YWxAKT8oXFxbbmF0aXZlIGNvZGVcXF0pPyQvO1xuXG4gICAgZnVuY3Rpb24gX21hcChhcnJheSwgZm4sIHRoaXNBcmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBBcnJheS5wcm90b3R5cGUubWFwID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gYXJyYXkubWFwKGZuLCB0aGlzQXJnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSBuZXcgQXJyYXkoYXJyYXkubGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBvdXRwdXRbaV0gPSBmbi5jYWxsKHRoaXNBcmcsIGFycmF5W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZmlsdGVyKGFycmF5LCBmbiwgdGhpc0FyZykge1xuICAgICAgICBpZiAodHlwZW9mIEFycmF5LnByb3RvdHlwZS5maWx0ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBhcnJheS5maWx0ZXIoZm4sIHRoaXNBcmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChmbi5jYWxsKHRoaXNBcmcsIGFycmF5W2ldKSkge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChhcnJheVtpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9pbmRleE9mKGFycmF5LCB0YXJnZXQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5LmluZGV4T2YodGFyZ2V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJyYXlbaV0gPT09IHRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogR2l2ZW4gYW4gRXJyb3Igb2JqZWN0LCBleHRyYWN0IHRoZSBtb3N0IGluZm9ybWF0aW9uIGZyb20gaXQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIG9iamVjdFxuICAgICAgICAgKiBAcmV0dXJuIHtBcnJheX0gb2YgU3RhY2tGcmFtZXNcbiAgICAgICAgICovXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiBFcnJvclN0YWNrUGFyc2VyJCRwYXJzZShlcnJvcikge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlcnJvci5zdGFja3RyYWNlICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgZXJyb3JbJ29wZXJhI3NvdXJjZWxvYyddICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlT3BlcmEoZXJyb3IpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5zdGFjayAmJiBlcnJvci5zdGFjay5tYXRjaChDSFJPTUVfSUVfU1RBQ0tfUkVHRVhQKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlVjhPcklFKGVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhY2spIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUZGT3JTYWZhcmkoZXJyb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBwYXJzZSBnaXZlbiBFcnJvciBvYmplY3QnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBTZXBhcmF0ZSBsaW5lIGFuZCBjb2x1bW4gbnVtYmVycyBmcm9tIGEgc3RyaW5nIG9mIHRoZSBmb3JtOiAoVVJJOkxpbmU6Q29sdW1uKVxuICAgICAgICBleHRyYWN0TG9jYXRpb246IGZ1bmN0aW9uIEVycm9yU3RhY2tQYXJzZXIkJGV4dHJhY3RMb2NhdGlvbih1cmxMaWtlKSB7XG4gICAgICAgICAgICAvLyBGYWlsLWZhc3QgYnV0IHJldHVybiBsb2NhdGlvbnMgbGlrZSBcIihuYXRpdmUpXCJcbiAgICAgICAgICAgIGlmICh1cmxMaWtlLmluZGV4T2YoJzonKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW3VybExpa2VdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcmVnRXhwID0gLyguKz8pKD86XFw6KFxcZCspKT8oPzpcXDooXFxkKykpPyQvO1xuICAgICAgICAgICAgdmFyIHBhcnRzID0gcmVnRXhwLmV4ZWModXJsTGlrZS5yZXBsYWNlKC9bXFwoXFwpXS9nLCAnJykpO1xuICAgICAgICAgICAgcmV0dXJuIFtwYXJ0c1sxXSwgcGFydHNbMl0gfHwgdW5kZWZpbmVkLCBwYXJ0c1szXSB8fCB1bmRlZmluZWRdO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlVjhPcklFOiBmdW5jdGlvbiBFcnJvclN0YWNrUGFyc2VyJCRwYXJzZVY4T3JJRShlcnJvcikge1xuICAgICAgICAgICAgdmFyIGZpbHRlcmVkID0gX2ZpbHRlcihlcnJvci5zdGFjay5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gISFsaW5lLm1hdGNoKENIUk9NRV9JRV9TVEFDS19SRUdFWFApO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBfbWFwKGZpbHRlcmVkLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmUuaW5kZXhPZignKGV2YWwgJykgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaHJvdyBhd2F5IGV2YWwgaW5mb3JtYXRpb24gdW50aWwgd2UgaW1wbGVtZW50IHN0YWNrdHJhY2UuanMvc3RhY2tmcmFtZSM4XG4gICAgICAgICAgICAgICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UoL2V2YWwgY29kZS9nLCAnZXZhbCcpLnJlcGxhY2UoLyhcXChldmFsIGF0IFteXFwoKV0qKXwoXFwpXFwsLiokKS9nLCAnJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciB0b2tlbnMgPSBsaW5lLnJlcGxhY2UoL15cXHMrLywgJycpLnJlcGxhY2UoL1xcKGV2YWwgY29kZS9nLCAnKCcpLnNwbGl0KC9cXHMrLykuc2xpY2UoMSk7XG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uUGFydHMgPSB0aGlzLmV4dHJhY3RMb2NhdGlvbih0b2tlbnMucG9wKCkpO1xuICAgICAgICAgICAgICAgIHZhciBmdW5jdGlvbk5hbWUgPSB0b2tlbnMuam9pbignICcpIHx8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB2YXIgZmlsZU5hbWUgPSBfaW5kZXhPZihbJ2V2YWwnLCAnPGFub255bW91cz4nXSwgbG9jYXRpb25QYXJ0c1swXSkgPiAtMSA/IHVuZGVmaW5lZCA6IGxvY2F0aW9uUGFydHNbMF07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFN0YWNrRnJhbWUoZnVuY3Rpb25OYW1lLCB1bmRlZmluZWQsIGZpbGVOYW1lLCBsb2NhdGlvblBhcnRzWzFdLCBsb2NhdGlvblBhcnRzWzJdLCBsaW5lKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlRkZPclNhZmFyaTogZnVuY3Rpb24gRXJyb3JTdGFja1BhcnNlciQkcGFyc2VGRk9yU2FmYXJpKGVycm9yKSB7XG4gICAgICAgICAgICB2YXIgZmlsdGVyZWQgPSBfZmlsdGVyKGVycm9yLnN0YWNrLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAhbGluZS5tYXRjaChTQUZBUklfTkFUSVZFX0NPREVfUkVHRVhQKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gX21hcChmaWx0ZXJlZCwgZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgICAgIC8vIFRocm93IGF3YXkgZXZhbCBpbmZvcm1hdGlvbiB1bnRpbCB3ZSBpbXBsZW1lbnQgc3RhY2t0cmFjZS5qcy9zdGFja2ZyYW1lIzhcbiAgICAgICAgICAgICAgICBpZiAobGluZS5pbmRleE9mKCcgPiBldmFsJykgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlKC8gbGluZSAoXFxkKykoPzogPiBldmFsIGxpbmUgXFxkKykqID4gZXZhbFxcOlxcZCtcXDpcXGQrL2csICc6JDEnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGluZS5pbmRleE9mKCdAJykgPT09IC0xICYmIGxpbmUuaW5kZXhPZignOicpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZXZhbCBmcmFtZXMgb25seSBoYXZlIGZ1bmN0aW9uIG5hbWVzIGFuZCBub3RoaW5nIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTdGFja0ZyYW1lKGxpbmUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0b2tlbnMgPSBsaW5lLnNwbGl0KCdAJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvblBhcnRzID0gdGhpcy5leHRyYWN0TG9jYXRpb24odG9rZW5zLnBvcCgpKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZ1bmN0aW9uTmFtZSA9IHRva2Vucy5qb2luKCdAJykgfHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFN0YWNrRnJhbWUoZnVuY3Rpb25OYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25QYXJ0c1swXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUGFydHNbMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvblBhcnRzWzJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcGFyc2VPcGVyYTogZnVuY3Rpb24gRXJyb3JTdGFja1BhcnNlciQkcGFyc2VPcGVyYShlKSB7XG4gICAgICAgICAgICBpZiAoIWUuc3RhY2t0cmFjZSB8fCAoZS5tZXNzYWdlLmluZGV4T2YoJ1xcbicpID4gLTEgJiZcbiAgICAgICAgICAgICAgICBlLm1lc3NhZ2Uuc3BsaXQoJ1xcbicpLmxlbmd0aCA+IGUuc3RhY2t0cmFjZS5zcGxpdCgnXFxuJykubGVuZ3RoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlT3BlcmE5KGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghZS5zdGFjaykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlT3BlcmExMChlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VPcGVyYTExKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlT3BlcmE5OiBmdW5jdGlvbiBFcnJvclN0YWNrUGFyc2VyJCRwYXJzZU9wZXJhOShlKSB7XG4gICAgICAgICAgICB2YXIgbGluZVJFID0gL0xpbmUgKFxcZCspLipzY3JpcHQgKD86aW4gKT8oXFxTKykvaTtcbiAgICAgICAgICAgIHZhciBsaW5lcyA9IGUubWVzc2FnZS5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAyLCBsZW4gPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMikge1xuICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9IGxpbmVSRS5leGVjKGxpbmVzW2ldKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobmV3IFN0YWNrRnJhbWUodW5kZWZpbmVkLCB1bmRlZmluZWQsIG1hdGNoWzJdLCBtYXRjaFsxXSwgdW5kZWZpbmVkLCBsaW5lc1tpXSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICBwYXJzZU9wZXJhMTA6IGZ1bmN0aW9uIEVycm9yU3RhY2tQYXJzZXIkJHBhcnNlT3BlcmExMChlKSB7XG4gICAgICAgICAgICB2YXIgbGluZVJFID0gL0xpbmUgKFxcZCspLipzY3JpcHQgKD86aW4gKT8oXFxTKykoPzo6IEluIGZ1bmN0aW9uIChcXFMrKSk/JC9pO1xuICAgICAgICAgICAgdmFyIGxpbmVzID0gZS5zdGFja3RyYWNlLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAyKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gbGluZVJFLmV4ZWMobGluZXNbaV0pO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBTdGFja0ZyYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoWzNdIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hbMl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hbMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVzW2ldXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIE9wZXJhIDEwLjY1KyBFcnJvci5zdGFjayB2ZXJ5IHNpbWlsYXIgdG8gRkYvU2FmYXJpXG4gICAgICAgIHBhcnNlT3BlcmExMTogZnVuY3Rpb24gRXJyb3JTdGFja1BhcnNlciQkcGFyc2VPcGVyYTExKGVycm9yKSB7XG4gICAgICAgICAgICB2YXIgZmlsdGVyZWQgPSBfZmlsdGVyKGVycm9yLnN0YWNrLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAhIWxpbmUubWF0Y2goRklSRUZPWF9TQUZBUklfU1RBQ0tfUkVHRVhQKSAmJiAhbGluZS5tYXRjaCgvXkVycm9yIGNyZWF0ZWQgYXQvKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gX21hcChmaWx0ZXJlZCwgZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgICAgIHZhciB0b2tlbnMgPSBsaW5lLnNwbGl0KCdAJyk7XG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uUGFydHMgPSB0aGlzLmV4dHJhY3RMb2NhdGlvbih0b2tlbnMucG9wKCkpO1xuICAgICAgICAgICAgICAgIHZhciBmdW5jdGlvbkNhbGwgPSAodG9rZW5zLnNoaWZ0KCkgfHwgJycpO1xuICAgICAgICAgICAgICAgIHZhciBmdW5jdGlvbk5hbWUgPSBmdW5jdGlvbkNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88YW5vbnltb3VzIGZ1bmN0aW9uKDogKFxcdyspKT8+LywgJyQyJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXChbXlxcKV0qXFwpL2csICcnKSB8fCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3NSYXc7XG4gICAgICAgICAgICAgICAgaWYgKGZ1bmN0aW9uQ2FsbC5tYXRjaCgvXFwoKFteXFwpXSopXFwpLykpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJnc1JhdyA9IGZ1bmN0aW9uQ2FsbC5yZXBsYWNlKC9eW15cXChdK1xcKChbXlxcKV0qKVxcKSQvLCAnJDEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSAoYXJnc1JhdyA9PT0gdW5kZWZpbmVkIHx8IGFyZ3NSYXcgPT09ICdbYXJndW1lbnRzIG5vdCBhdmFpbGFibGVdJykgP1xuICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQgOiBhcmdzUmF3LnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTdGFja0ZyYW1lKFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGFyZ3MsXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUGFydHNbMF0sXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUGFydHNbMV0sXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUGFydHNbMl0sXG4gICAgICAgICAgICAgICAgICAgIGxpbmUpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9O1xufSkpO1xuXG4iLCIvKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTEgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBBIGRhdGEgc3RydWN0dXJlIHdoaWNoIGlzIGEgY29tYmluYXRpb24gb2YgYW4gYXJyYXkgYW5kIGEgc2V0LiBBZGRpbmcgYSBuZXdcbiAqIG1lbWJlciBpcyBPKDEpLCB0ZXN0aW5nIGZvciBtZW1iZXJzaGlwIGlzIE8oMSksIGFuZCBmaW5kaW5nIHRoZSBpbmRleCBvZiBhblxuICogZWxlbWVudCBpcyBPKDEpLiBSZW1vdmluZyBlbGVtZW50cyBmcm9tIHRoZSBzZXQgaXMgbm90IHN1cHBvcnRlZC4gT25seVxuICogc3RyaW5ncyBhcmUgc3VwcG9ydGVkIGZvciBtZW1iZXJzaGlwLlxuICovXG5mdW5jdGlvbiBBcnJheVNldCgpIHtcbiAgdGhpcy5fYXJyYXkgPSBbXTtcbiAgdGhpcy5fc2V0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbn1cblxuLyoqXG4gKiBTdGF0aWMgbWV0aG9kIGZvciBjcmVhdGluZyBBcnJheVNldCBpbnN0YW5jZXMgZnJvbSBhbiBleGlzdGluZyBhcnJheS5cbiAqL1xuQXJyYXlTZXQuZnJvbUFycmF5ID0gZnVuY3Rpb24gQXJyYXlTZXRfZnJvbUFycmF5KGFBcnJheSwgYUFsbG93RHVwbGljYXRlcykge1xuICB2YXIgc2V0ID0gbmV3IEFycmF5U2V0KCk7XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhQXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBzZXQuYWRkKGFBcnJheVtpXSwgYUFsbG93RHVwbGljYXRlcyk7XG4gIH1cbiAgcmV0dXJuIHNldDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGhvdyBtYW55IHVuaXF1ZSBpdGVtcyBhcmUgaW4gdGhpcyBBcnJheVNldC4gSWYgZHVwbGljYXRlcyBoYXZlIGJlZW5cbiAqIGFkZGVkLCB0aGFuIHRob3NlIGRvIG5vdCBjb3VudCB0b3dhcmRzIHRoZSBzaXplLlxuICpcbiAqIEByZXR1cm5zIE51bWJlclxuICovXG5BcnJheVNldC5wcm90b3R5cGUuc2l6ZSA9IGZ1bmN0aW9uIEFycmF5U2V0X3NpemUoKSB7XG4gIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzLl9zZXQpLmxlbmd0aDtcbn07XG5cbi8qKlxuICogQWRkIHRoZSBnaXZlbiBzdHJpbmcgdG8gdGhpcyBzZXQuXG4gKlxuICogQHBhcmFtIFN0cmluZyBhU3RyXG4gKi9cbkFycmF5U2V0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBBcnJheVNldF9hZGQoYVN0ciwgYUFsbG93RHVwbGljYXRlcykge1xuICB2YXIgc1N0ciA9IHV0aWwudG9TZXRTdHJpbmcoYVN0cik7XG4gIHZhciBpc0R1cGxpY2F0ZSA9IGhhcy5jYWxsKHRoaXMuX3NldCwgc1N0cik7XG4gIHZhciBpZHggPSB0aGlzLl9hcnJheS5sZW5ndGg7XG4gIGlmICghaXNEdXBsaWNhdGUgfHwgYUFsbG93RHVwbGljYXRlcykge1xuICAgIHRoaXMuX2FycmF5LnB1c2goYVN0cik7XG4gIH1cbiAgaWYgKCFpc0R1cGxpY2F0ZSkge1xuICAgIHRoaXMuX3NldFtzU3RyXSA9IGlkeDtcbiAgfVxufTtcblxuLyoqXG4gKiBJcyB0aGUgZ2l2ZW4gc3RyaW5nIGEgbWVtYmVyIG9mIHRoaXMgc2V0P1xuICpcbiAqIEBwYXJhbSBTdHJpbmcgYVN0clxuICovXG5BcnJheVNldC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gQXJyYXlTZXRfaGFzKGFTdHIpIHtcbiAgdmFyIHNTdHIgPSB1dGlsLnRvU2V0U3RyaW5nKGFTdHIpO1xuICByZXR1cm4gaGFzLmNhbGwodGhpcy5fc2V0LCBzU3RyKTtcbn07XG5cbi8qKlxuICogV2hhdCBpcyB0aGUgaW5kZXggb2YgdGhlIGdpdmVuIHN0cmluZyBpbiB0aGUgYXJyYXk/XG4gKlxuICogQHBhcmFtIFN0cmluZyBhU3RyXG4gKi9cbkFycmF5U2V0LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gQXJyYXlTZXRfaW5kZXhPZihhU3RyKSB7XG4gIHZhciBzU3RyID0gdXRpbC50b1NldFN0cmluZyhhU3RyKTtcbiAgaWYgKGhhcy5jYWxsKHRoaXMuX3NldCwgc1N0cikpIHtcbiAgICByZXR1cm4gdGhpcy5fc2V0W3NTdHJdO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcignXCInICsgYVN0ciArICdcIiBpcyBub3QgaW4gdGhlIHNldC4nKTtcbn07XG5cbi8qKlxuICogV2hhdCBpcyB0aGUgZWxlbWVudCBhdCB0aGUgZ2l2ZW4gaW5kZXg/XG4gKlxuICogQHBhcmFtIE51bWJlciBhSWR4XG4gKi9cbkFycmF5U2V0LnByb3RvdHlwZS5hdCA9IGZ1bmN0aW9uIEFycmF5U2V0X2F0KGFJZHgpIHtcbiAgaWYgKGFJZHggPj0gMCAmJiBhSWR4IDwgdGhpcy5fYXJyYXkubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FycmF5W2FJZHhdO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcignTm8gZWxlbWVudCBpbmRleGVkIGJ5ICcgKyBhSWR4KTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYXJyYXkgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBzZXQgKHdoaWNoIGhhcyB0aGUgcHJvcGVyIGluZGljZXNcbiAqIGluZGljYXRlZCBieSBpbmRleE9mKS4gTm90ZSB0aGF0IHRoaXMgaXMgYSBjb3B5IG9mIHRoZSBpbnRlcm5hbCBhcnJheSB1c2VkXG4gKiBmb3Igc3RvcmluZyB0aGUgbWVtYmVycyBzbyB0aGF0IG5vIG9uZSBjYW4gbWVzcyB3aXRoIGludGVybmFsIHN0YXRlLlxuICovXG5BcnJheVNldC5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uIEFycmF5U2V0X3RvQXJyYXkoKSB7XG4gIHJldHVybiB0aGlzLl9hcnJheS5zbGljZSgpO1xufTtcblxuZXhwb3J0cy5BcnJheVNldCA9IEFycmF5U2V0O1xuIiwiLyogLSotIE1vZGU6IGpzOyBqcy1pbmRlbnQtbGV2ZWw6IDI7IC0qLSAqL1xuLypcbiAqIENvcHlyaWdodCAyMDExIE1vemlsbGEgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBsaWNlbnNlLiBTZWUgTElDRU5TRSBvcjpcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2VcbiAqXG4gKiBCYXNlZCBvbiB0aGUgQmFzZSA2NCBWTFEgaW1wbGVtZW50YXRpb24gaW4gQ2xvc3VyZSBDb21waWxlcjpcbiAqIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2xvc3VyZS1jb21waWxlci9zb3VyY2UvYnJvd3NlL3RydW5rL3NyYy9jb20vZ29vZ2xlL2RlYnVnZ2luZy9zb3VyY2VtYXAvQmFzZTY0VkxRLmphdmFcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMSBUaGUgQ2xvc3VyZSBDb21waWxlciBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlXG4gKiBtZXQ6XG4gKlxuICogICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmVcbiAqICAgIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nXG4gKiAgICBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWRcbiAqICAgIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgR29vZ2xlIEluYy4gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICAgIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZFxuICogICAgZnJvbSB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlNcbiAqIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUlxuICogQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFRcbiAqIE9XTkVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLFxuICogU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsXG4gKiBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTllcbiAqIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAqIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuICogT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnLi9iYXNlNjQnKTtcblxuLy8gQSBzaW5nbGUgYmFzZSA2NCBkaWdpdCBjYW4gY29udGFpbiA2IGJpdHMgb2YgZGF0YS4gRm9yIHRoZSBiYXNlIDY0IHZhcmlhYmxlXG4vLyBsZW5ndGggcXVhbnRpdGllcyB3ZSB1c2UgaW4gdGhlIHNvdXJjZSBtYXAgc3BlYywgdGhlIGZpcnN0IGJpdCBpcyB0aGUgc2lnbixcbi8vIHRoZSBuZXh0IGZvdXIgYml0cyBhcmUgdGhlIGFjdHVhbCB2YWx1ZSwgYW5kIHRoZSA2dGggYml0IGlzIHRoZVxuLy8gY29udGludWF0aW9uIGJpdC4gVGhlIGNvbnRpbnVhdGlvbiBiaXQgdGVsbHMgdXMgd2hldGhlciB0aGVyZSBhcmUgbW9yZVxuLy8gZGlnaXRzIGluIHRoaXMgdmFsdWUgZm9sbG93aW5nIHRoaXMgZGlnaXQuXG4vL1xuLy8gICBDb250aW51YXRpb25cbi8vICAgfCAgICBTaWduXG4vLyAgIHwgICAgfFxuLy8gICBWICAgIFZcbi8vICAgMTAxMDExXG5cbnZhciBWTFFfQkFTRV9TSElGVCA9IDU7XG5cbi8vIGJpbmFyeTogMTAwMDAwXG52YXIgVkxRX0JBU0UgPSAxIDw8IFZMUV9CQVNFX1NISUZUO1xuXG4vLyBiaW5hcnk6IDAxMTExMVxudmFyIFZMUV9CQVNFX01BU0sgPSBWTFFfQkFTRSAtIDE7XG5cbi8vIGJpbmFyeTogMTAwMDAwXG52YXIgVkxRX0NPTlRJTlVBVElPTl9CSVQgPSBWTFFfQkFTRTtcblxuLyoqXG4gKiBDb252ZXJ0cyBmcm9tIGEgdHdvLWNvbXBsZW1lbnQgdmFsdWUgdG8gYSB2YWx1ZSB3aGVyZSB0aGUgc2lnbiBiaXQgaXNcbiAqIHBsYWNlZCBpbiB0aGUgbGVhc3Qgc2lnbmlmaWNhbnQgYml0LiAgRm9yIGV4YW1wbGUsIGFzIGRlY2ltYWxzOlxuICogICAxIGJlY29tZXMgMiAoMTAgYmluYXJ5KSwgLTEgYmVjb21lcyAzICgxMSBiaW5hcnkpXG4gKiAgIDIgYmVjb21lcyA0ICgxMDAgYmluYXJ5KSwgLTIgYmVjb21lcyA1ICgxMDEgYmluYXJ5KVxuICovXG5mdW5jdGlvbiB0b1ZMUVNpZ25lZChhVmFsdWUpIHtcbiAgcmV0dXJuIGFWYWx1ZSA8IDBcbiAgICA/ICgoLWFWYWx1ZSkgPDwgMSkgKyAxXG4gICAgOiAoYVZhbHVlIDw8IDEpICsgMDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyB0byBhIHR3by1jb21wbGVtZW50IHZhbHVlIGZyb20gYSB2YWx1ZSB3aGVyZSB0aGUgc2lnbiBiaXQgaXNcbiAqIHBsYWNlZCBpbiB0aGUgbGVhc3Qgc2lnbmlmaWNhbnQgYml0LiAgRm9yIGV4YW1wbGUsIGFzIGRlY2ltYWxzOlxuICogICAyICgxMCBiaW5hcnkpIGJlY29tZXMgMSwgMyAoMTEgYmluYXJ5KSBiZWNvbWVzIC0xXG4gKiAgIDQgKDEwMCBiaW5hcnkpIGJlY29tZXMgMiwgNSAoMTAxIGJpbmFyeSkgYmVjb21lcyAtMlxuICovXG5mdW5jdGlvbiBmcm9tVkxRU2lnbmVkKGFWYWx1ZSkge1xuICB2YXIgaXNOZWdhdGl2ZSA9IChhVmFsdWUgJiAxKSA9PT0gMTtcbiAgdmFyIHNoaWZ0ZWQgPSBhVmFsdWUgPj4gMTtcbiAgcmV0dXJuIGlzTmVnYXRpdmVcbiAgICA/IC1zaGlmdGVkXG4gICAgOiBzaGlmdGVkO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGJhc2UgNjQgVkxRIGVuY29kZWQgdmFsdWUuXG4gKi9cbmV4cG9ydHMuZW5jb2RlID0gZnVuY3Rpb24gYmFzZTY0VkxRX2VuY29kZShhVmFsdWUpIHtcbiAgdmFyIGVuY29kZWQgPSBcIlwiO1xuICB2YXIgZGlnaXQ7XG5cbiAgdmFyIHZscSA9IHRvVkxRU2lnbmVkKGFWYWx1ZSk7XG5cbiAgZG8ge1xuICAgIGRpZ2l0ID0gdmxxICYgVkxRX0JBU0VfTUFTSztcbiAgICB2bHEgPj4+PSBWTFFfQkFTRV9TSElGVDtcbiAgICBpZiAodmxxID4gMCkge1xuICAgICAgLy8gVGhlcmUgYXJlIHN0aWxsIG1vcmUgZGlnaXRzIGluIHRoaXMgdmFsdWUsIHNvIHdlIG11c3QgbWFrZSBzdXJlIHRoZVxuICAgICAgLy8gY29udGludWF0aW9uIGJpdCBpcyBtYXJrZWQuXG4gICAgICBkaWdpdCB8PSBWTFFfQ09OVElOVUFUSU9OX0JJVDtcbiAgICB9XG4gICAgZW5jb2RlZCArPSBiYXNlNjQuZW5jb2RlKGRpZ2l0KTtcbiAgfSB3aGlsZSAodmxxID4gMCk7XG5cbiAgcmV0dXJuIGVuY29kZWQ7XG59O1xuXG4vKipcbiAqIERlY29kZXMgdGhlIG5leHQgYmFzZSA2NCBWTFEgdmFsdWUgZnJvbSB0aGUgZ2l2ZW4gc3RyaW5nIGFuZCByZXR1cm5zIHRoZVxuICogdmFsdWUgYW5kIHRoZSByZXN0IG9mIHRoZSBzdHJpbmcgdmlhIHRoZSBvdXQgcGFyYW1ldGVyLlxuICovXG5leHBvcnRzLmRlY29kZSA9IGZ1bmN0aW9uIGJhc2U2NFZMUV9kZWNvZGUoYVN0ciwgYUluZGV4LCBhT3V0UGFyYW0pIHtcbiAgdmFyIHN0ckxlbiA9IGFTdHIubGVuZ3RoO1xuICB2YXIgcmVzdWx0ID0gMDtcbiAgdmFyIHNoaWZ0ID0gMDtcbiAgdmFyIGNvbnRpbnVhdGlvbiwgZGlnaXQ7XG5cbiAgZG8ge1xuICAgIGlmIChhSW5kZXggPj0gc3RyTGVuKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBtb3JlIGRpZ2l0cyBpbiBiYXNlIDY0IFZMUSB2YWx1ZS5cIik7XG4gICAgfVxuXG4gICAgZGlnaXQgPSBiYXNlNjQuZGVjb2RlKGFTdHIuY2hhckNvZGVBdChhSW5kZXgrKykpO1xuICAgIGlmIChkaWdpdCA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgYmFzZTY0IGRpZ2l0OiBcIiArIGFTdHIuY2hhckF0KGFJbmRleCAtIDEpKTtcbiAgICB9XG5cbiAgICBjb250aW51YXRpb24gPSAhIShkaWdpdCAmIFZMUV9DT05USU5VQVRJT05fQklUKTtcbiAgICBkaWdpdCAmPSBWTFFfQkFTRV9NQVNLO1xuICAgIHJlc3VsdCA9IHJlc3VsdCArIChkaWdpdCA8PCBzaGlmdCk7XG4gICAgc2hpZnQgKz0gVkxRX0JBU0VfU0hJRlQ7XG4gIH0gd2hpbGUgKGNvbnRpbnVhdGlvbik7XG5cbiAgYU91dFBhcmFtLnZhbHVlID0gZnJvbVZMUVNpZ25lZChyZXN1bHQpO1xuICBhT3V0UGFyYW0ucmVzdCA9IGFJbmRleDtcbn07XG4iLCIvKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTEgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5cbnZhciBpbnRUb0NoYXJNYXAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLycuc3BsaXQoJycpO1xuXG4vKipcbiAqIEVuY29kZSBhbiBpbnRlZ2VyIGluIHRoZSByYW5nZSBvZiAwIHRvIDYzIHRvIGEgc2luZ2xlIGJhc2UgNjQgZGlnaXQuXG4gKi9cbmV4cG9ydHMuZW5jb2RlID0gZnVuY3Rpb24gKG51bWJlcikge1xuICBpZiAoMCA8PSBudW1iZXIgJiYgbnVtYmVyIDwgaW50VG9DaGFyTWFwLmxlbmd0aCkge1xuICAgIHJldHVybiBpbnRUb0NoYXJNYXBbbnVtYmVyXTtcbiAgfVxuICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiTXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDYzOiBcIiArIG51bWJlcik7XG59O1xuXG4vKipcbiAqIERlY29kZSBhIHNpbmdsZSBiYXNlIDY0IGNoYXJhY3RlciBjb2RlIGRpZ2l0IHRvIGFuIGludGVnZXIuIFJldHVybnMgLTEgb25cbiAqIGZhaWx1cmUuXG4gKi9cbmV4cG9ydHMuZGVjb2RlID0gZnVuY3Rpb24gKGNoYXJDb2RlKSB7XG4gIHZhciBiaWdBID0gNjU7ICAgICAvLyAnQSdcbiAgdmFyIGJpZ1ogPSA5MDsgICAgIC8vICdaJ1xuXG4gIHZhciBsaXR0bGVBID0gOTc7ICAvLyAnYSdcbiAgdmFyIGxpdHRsZVogPSAxMjI7IC8vICd6J1xuXG4gIHZhciB6ZXJvID0gNDg7ICAgICAvLyAnMCdcbiAgdmFyIG5pbmUgPSA1NzsgICAgIC8vICc5J1xuXG4gIHZhciBwbHVzID0gNDM7ICAgICAvLyAnKydcbiAgdmFyIHNsYXNoID0gNDc7ICAgIC8vICcvJ1xuXG4gIHZhciBsaXR0bGVPZmZzZXQgPSAyNjtcbiAgdmFyIG51bWJlck9mZnNldCA9IDUyO1xuXG4gIC8vIDAgLSAyNTogQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpcbiAgaWYgKGJpZ0EgPD0gY2hhckNvZGUgJiYgY2hhckNvZGUgPD0gYmlnWikge1xuICAgIHJldHVybiAoY2hhckNvZGUgLSBiaWdBKTtcbiAgfVxuXG4gIC8vIDI2IC0gNTE6IGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XG4gIGlmIChsaXR0bGVBIDw9IGNoYXJDb2RlICYmIGNoYXJDb2RlIDw9IGxpdHRsZVopIHtcbiAgICByZXR1cm4gKGNoYXJDb2RlIC0gbGl0dGxlQSArIGxpdHRsZU9mZnNldCk7XG4gIH1cblxuICAvLyA1MiAtIDYxOiAwMTIzNDU2Nzg5XG4gIGlmICh6ZXJvIDw9IGNoYXJDb2RlICYmIGNoYXJDb2RlIDw9IG5pbmUpIHtcbiAgICByZXR1cm4gKGNoYXJDb2RlIC0gemVybyArIG51bWJlck9mZnNldCk7XG4gIH1cblxuICAvLyA2MjogK1xuICBpZiAoY2hhckNvZGUgPT0gcGx1cykge1xuICAgIHJldHVybiA2MjtcbiAgfVxuXG4gIC8vIDYzOiAvXG4gIGlmIChjaGFyQ29kZSA9PSBzbGFzaCkge1xuICAgIHJldHVybiA2MztcbiAgfVxuXG4gIC8vIEludmFsaWQgYmFzZTY0IGRpZ2l0LlxuICByZXR1cm4gLTE7XG59O1xuIiwiLyogLSotIE1vZGU6IGpzOyBqcy1pbmRlbnQtbGV2ZWw6IDI7IC0qLSAqL1xuLypcbiAqIENvcHlyaWdodCAyMDExIE1vemlsbGEgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBsaWNlbnNlLiBTZWUgTElDRU5TRSBvcjpcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2VcbiAqL1xuXG5leHBvcnRzLkdSRUFURVNUX0xPV0VSX0JPVU5EID0gMTtcbmV4cG9ydHMuTEVBU1RfVVBQRVJfQk9VTkQgPSAyO1xuXG4vKipcbiAqIFJlY3Vyc2l2ZSBpbXBsZW1lbnRhdGlvbiBvZiBiaW5hcnkgc2VhcmNoLlxuICpcbiAqIEBwYXJhbSBhTG93IEluZGljZXMgaGVyZSBhbmQgbG93ZXIgZG8gbm90IGNvbnRhaW4gdGhlIG5lZWRsZS5cbiAqIEBwYXJhbSBhSGlnaCBJbmRpY2VzIGhlcmUgYW5kIGhpZ2hlciBkbyBub3QgY29udGFpbiB0aGUgbmVlZGxlLlxuICogQHBhcmFtIGFOZWVkbGUgVGhlIGVsZW1lbnQgYmVpbmcgc2VhcmNoZWQgZm9yLlxuICogQHBhcmFtIGFIYXlzdGFjayBUaGUgbm9uLWVtcHR5IGFycmF5IGJlaW5nIHNlYXJjaGVkLlxuICogQHBhcmFtIGFDb21wYXJlIEZ1bmN0aW9uIHdoaWNoIHRha2VzIHR3byBlbGVtZW50cyBhbmQgcmV0dXJucyAtMSwgMCwgb3IgMS5cbiAqIEBwYXJhbSBhQmlhcyBFaXRoZXIgJ2JpbmFyeVNlYXJjaC5HUkVBVEVTVF9MT1dFUl9CT1VORCcgb3JcbiAqICAgICAnYmluYXJ5U2VhcmNoLkxFQVNUX1VQUEVSX0JPVU5EJy4gU3BlY2lmaWVzIHdoZXRoZXIgdG8gcmV0dXJuIHRoZVxuICogICAgIGNsb3Nlc3QgZWxlbWVudCB0aGF0IGlzIHNtYWxsZXIgdGhhbiBvciBncmVhdGVyIHRoYW4gdGhlIG9uZSB3ZSBhcmVcbiAqICAgICBzZWFyY2hpbmcgZm9yLCByZXNwZWN0aXZlbHksIGlmIHRoZSBleGFjdCBlbGVtZW50IGNhbm5vdCBiZSBmb3VuZC5cbiAqL1xuZnVuY3Rpb24gcmVjdXJzaXZlU2VhcmNoKGFMb3csIGFIaWdoLCBhTmVlZGxlLCBhSGF5c3RhY2ssIGFDb21wYXJlLCBhQmlhcykge1xuICAvLyBUaGlzIGZ1bmN0aW9uIHRlcm1pbmF0ZXMgd2hlbiBvbmUgb2YgdGhlIGZvbGxvd2luZyBpcyB0cnVlOlxuICAvL1xuICAvLyAgIDEuIFdlIGZpbmQgdGhlIGV4YWN0IGVsZW1lbnQgd2UgYXJlIGxvb2tpbmcgZm9yLlxuICAvL1xuICAvLyAgIDIuIFdlIGRpZCBub3QgZmluZCB0aGUgZXhhY3QgZWxlbWVudCwgYnV0IHdlIGNhbiByZXR1cm4gdGhlIGluZGV4IG9mXG4gIC8vICAgICAgdGhlIG5leHQtY2xvc2VzdCBlbGVtZW50LlxuICAvL1xuICAvLyAgIDMuIFdlIGRpZCBub3QgZmluZCB0aGUgZXhhY3QgZWxlbWVudCwgYW5kIHRoZXJlIGlzIG5vIG5leHQtY2xvc2VzdFxuICAvLyAgICAgIGVsZW1lbnQgdGhhbiB0aGUgb25lIHdlIGFyZSBzZWFyY2hpbmcgZm9yLCBzbyB3ZSByZXR1cm4gLTEuXG4gIHZhciBtaWQgPSBNYXRoLmZsb29yKChhSGlnaCAtIGFMb3cpIC8gMikgKyBhTG93O1xuICB2YXIgY21wID0gYUNvbXBhcmUoYU5lZWRsZSwgYUhheXN0YWNrW21pZF0sIHRydWUpO1xuICBpZiAoY21wID09PSAwKSB7XG4gICAgLy8gRm91bmQgdGhlIGVsZW1lbnQgd2UgYXJlIGxvb2tpbmcgZm9yLlxuICAgIHJldHVybiBtaWQ7XG4gIH1cbiAgZWxzZSBpZiAoY21wID4gMCkge1xuICAgIC8vIE91ciBuZWVkbGUgaXMgZ3JlYXRlciB0aGFuIGFIYXlzdGFja1ttaWRdLlxuICAgIGlmIChhSGlnaCAtIG1pZCA+IDEpIHtcbiAgICAgIC8vIFRoZSBlbGVtZW50IGlzIGluIHRoZSB1cHBlciBoYWxmLlxuICAgICAgcmV0dXJuIHJlY3Vyc2l2ZVNlYXJjaChtaWQsIGFIaWdoLCBhTmVlZGxlLCBhSGF5c3RhY2ssIGFDb21wYXJlLCBhQmlhcyk7XG4gICAgfVxuXG4gICAgLy8gVGhlIGV4YWN0IG5lZWRsZSBlbGVtZW50IHdhcyBub3QgZm91bmQgaW4gdGhpcyBoYXlzdGFjay4gRGV0ZXJtaW5lIGlmXG4gICAgLy8gd2UgYXJlIGluIHRlcm1pbmF0aW9uIGNhc2UgKDMpIG9yICgyKSBhbmQgcmV0dXJuIHRoZSBhcHByb3ByaWF0ZSB0aGluZy5cbiAgICBpZiAoYUJpYXMgPT0gZXhwb3J0cy5MRUFTVF9VUFBFUl9CT1VORCkge1xuICAgICAgcmV0dXJuIGFIaWdoIDwgYUhheXN0YWNrLmxlbmd0aCA/IGFIaWdoIDogLTE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBtaWQ7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIC8vIE91ciBuZWVkbGUgaXMgbGVzcyB0aGFuIGFIYXlzdGFja1ttaWRdLlxuICAgIGlmIChtaWQgLSBhTG93ID4gMSkge1xuICAgICAgLy8gVGhlIGVsZW1lbnQgaXMgaW4gdGhlIGxvd2VyIGhhbGYuXG4gICAgICByZXR1cm4gcmVjdXJzaXZlU2VhcmNoKGFMb3csIG1pZCwgYU5lZWRsZSwgYUhheXN0YWNrLCBhQ29tcGFyZSwgYUJpYXMpO1xuICAgIH1cblxuICAgIC8vIHdlIGFyZSBpbiB0ZXJtaW5hdGlvbiBjYXNlICgzKSBvciAoMikgYW5kIHJldHVybiB0aGUgYXBwcm9wcmlhdGUgdGhpbmcuXG4gICAgaWYgKGFCaWFzID09IGV4cG9ydHMuTEVBU1RfVVBQRVJfQk9VTkQpIHtcbiAgICAgIHJldHVybiBtaWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhTG93IDwgMCA/IC0xIDogYUxvdztcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBUaGlzIGlzIGFuIGltcGxlbWVudGF0aW9uIG9mIGJpbmFyeSBzZWFyY2ggd2hpY2ggd2lsbCBhbHdheXMgdHJ5IGFuZCByZXR1cm5cbiAqIHRoZSBpbmRleCBvZiB0aGUgY2xvc2VzdCBlbGVtZW50IGlmIHRoZXJlIGlzIG5vIGV4YWN0IGhpdC4gVGhpcyBpcyBiZWNhdXNlXG4gKiBtYXBwaW5ncyBiZXR3ZWVuIG9yaWdpbmFsIGFuZCBnZW5lcmF0ZWQgbGluZS9jb2wgcGFpcnMgYXJlIHNpbmdsZSBwb2ludHMsXG4gKiBhbmQgdGhlcmUgaXMgYW4gaW1wbGljaXQgcmVnaW9uIGJldHdlZW4gZWFjaCBvZiB0aGVtLCBzbyBhIG1pc3MganVzdCBtZWFuc1xuICogdGhhdCB5b3UgYXJlbid0IG9uIHRoZSB2ZXJ5IHN0YXJ0IG9mIGEgcmVnaW9uLlxuICpcbiAqIEBwYXJhbSBhTmVlZGxlIFRoZSBlbGVtZW50IHlvdSBhcmUgbG9va2luZyBmb3IuXG4gKiBAcGFyYW0gYUhheXN0YWNrIFRoZSBhcnJheSB0aGF0IGlzIGJlaW5nIHNlYXJjaGVkLlxuICogQHBhcmFtIGFDb21wYXJlIEEgZnVuY3Rpb24gd2hpY2ggdGFrZXMgdGhlIG5lZWRsZSBhbmQgYW4gZWxlbWVudCBpbiB0aGVcbiAqICAgICBhcnJheSBhbmQgcmV0dXJucyAtMSwgMCwgb3IgMSBkZXBlbmRpbmcgb24gd2hldGhlciB0aGUgbmVlZGxlIGlzIGxlc3NcbiAqICAgICB0aGFuLCBlcXVhbCB0bywgb3IgZ3JlYXRlciB0aGFuIHRoZSBlbGVtZW50LCByZXNwZWN0aXZlbHkuXG4gKiBAcGFyYW0gYUJpYXMgRWl0aGVyICdiaW5hcnlTZWFyY2guR1JFQVRFU1RfTE9XRVJfQk9VTkQnIG9yXG4gKiAgICAgJ2JpbmFyeVNlYXJjaC5MRUFTVF9VUFBFUl9CT1VORCcuIFNwZWNpZmllcyB3aGV0aGVyIHRvIHJldHVybiB0aGVcbiAqICAgICBjbG9zZXN0IGVsZW1lbnQgdGhhdCBpcyBzbWFsbGVyIHRoYW4gb3IgZ3JlYXRlciB0aGFuIHRoZSBvbmUgd2UgYXJlXG4gKiAgICAgc2VhcmNoaW5nIGZvciwgcmVzcGVjdGl2ZWx5LCBpZiB0aGUgZXhhY3QgZWxlbWVudCBjYW5ub3QgYmUgZm91bmQuXG4gKiAgICAgRGVmYXVsdHMgdG8gJ2JpbmFyeVNlYXJjaC5HUkVBVEVTVF9MT1dFUl9CT1VORCcuXG4gKi9cbmV4cG9ydHMuc2VhcmNoID0gZnVuY3Rpb24gc2VhcmNoKGFOZWVkbGUsIGFIYXlzdGFjaywgYUNvbXBhcmUsIGFCaWFzKSB7XG4gIGlmIChhSGF5c3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgdmFyIGluZGV4ID0gcmVjdXJzaXZlU2VhcmNoKC0xLCBhSGF5c3RhY2subGVuZ3RoLCBhTmVlZGxlLCBhSGF5c3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhQ29tcGFyZSwgYUJpYXMgfHwgZXhwb3J0cy5HUkVBVEVTVF9MT1dFUl9CT1VORCk7XG4gIGlmIChpbmRleCA8IDApIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICAvLyBXZSBoYXZlIGZvdW5kIGVpdGhlciB0aGUgZXhhY3QgZWxlbWVudCwgb3IgdGhlIG5leHQtY2xvc2VzdCBlbGVtZW50IHRoYW5cbiAgLy8gdGhlIG9uZSB3ZSBhcmUgc2VhcmNoaW5nIGZvci4gSG93ZXZlciwgdGhlcmUgbWF5IGJlIG1vcmUgdGhhbiBvbmUgc3VjaFxuICAvLyBlbGVtZW50LiBNYWtlIHN1cmUgd2UgYWx3YXlzIHJldHVybiB0aGUgc21hbGxlc3Qgb2YgdGhlc2UuXG4gIHdoaWxlIChpbmRleCAtIDEgPj0gMCkge1xuICAgIGlmIChhQ29tcGFyZShhSGF5c3RhY2tbaW5kZXhdLCBhSGF5c3RhY2tbaW5kZXggLSAxXSwgdHJ1ZSkgIT09IDApIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAtLWluZGV4O1xuICB9XG5cbiAgcmV0dXJuIGluZGV4O1xufTtcbiIsIi8qIC0qLSBNb2RlOiBqczsganMtaW5kZW50LWxldmVsOiAyOyAtKi0gKi9cbi8qXG4gKiBDb3B5cmlnaHQgMjAxNCBNb3ppbGxhIEZvdW5kYXRpb24gYW5kIGNvbnRyaWJ1dG9yc1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgbGljZW5zZS4gU2VlIExJQ0VOU0Ugb3I6XG4gKiBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvQlNELTMtQ2xhdXNlXG4gKi9cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hldGhlciBtYXBwaW5nQiBpcyBhZnRlciBtYXBwaW5nQSB3aXRoIHJlc3BlY3QgdG8gZ2VuZXJhdGVkXG4gKiBwb3NpdGlvbi5cbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVkUG9zaXRpb25BZnRlcihtYXBwaW5nQSwgbWFwcGluZ0IpIHtcbiAgLy8gT3B0aW1pemVkIGZvciBtb3N0IGNvbW1vbiBjYXNlXG4gIHZhciBsaW5lQSA9IG1hcHBpbmdBLmdlbmVyYXRlZExpbmU7XG4gIHZhciBsaW5lQiA9IG1hcHBpbmdCLmdlbmVyYXRlZExpbmU7XG4gIHZhciBjb2x1bW5BID0gbWFwcGluZ0EuZ2VuZXJhdGVkQ29sdW1uO1xuICB2YXIgY29sdW1uQiA9IG1hcHBpbmdCLmdlbmVyYXRlZENvbHVtbjtcbiAgcmV0dXJuIGxpbmVCID4gbGluZUEgfHwgbGluZUIgPT0gbGluZUEgJiYgY29sdW1uQiA+PSBjb2x1bW5BIHx8XG4gICAgICAgICB1dGlsLmNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0luZmxhdGVkKG1hcHBpbmdBLCBtYXBwaW5nQikgPD0gMDtcbn1cblxuLyoqXG4gKiBBIGRhdGEgc3RydWN0dXJlIHRvIHByb3ZpZGUgYSBzb3J0ZWQgdmlldyBvZiBhY2N1bXVsYXRlZCBtYXBwaW5ncyBpbiBhXG4gKiBwZXJmb3JtYW5jZSBjb25zY2lvdXMgbWFubmVyLiBJdCB0cmFkZXMgYSBuZWdsaWJhYmxlIG92ZXJoZWFkIGluIGdlbmVyYWxcbiAqIGNhc2UgZm9yIGEgbGFyZ2Ugc3BlZWR1cCBpbiBjYXNlIG9mIG1hcHBpbmdzIGJlaW5nIGFkZGVkIGluIG9yZGVyLlxuICovXG5mdW5jdGlvbiBNYXBwaW5nTGlzdCgpIHtcbiAgdGhpcy5fYXJyYXkgPSBbXTtcbiAgdGhpcy5fc29ydGVkID0gdHJ1ZTtcbiAgLy8gU2VydmVzIGFzIGluZmltdW1cbiAgdGhpcy5fbGFzdCA9IHtnZW5lcmF0ZWRMaW5lOiAtMSwgZ2VuZXJhdGVkQ29sdW1uOiAwfTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIHRocm91Z2ggaW50ZXJuYWwgaXRlbXMuIFRoaXMgbWV0aG9kIHRha2VzIHRoZSBzYW1lIGFyZ3VtZW50cyB0aGF0XG4gKiBgQXJyYXkucHJvdG90eXBlLmZvckVhY2hgIHRha2VzLlxuICpcbiAqIE5PVEU6IFRoZSBvcmRlciBvZiB0aGUgbWFwcGluZ3MgaXMgTk9UIGd1YXJhbnRlZWQuXG4gKi9cbk1hcHBpbmdMaXN0LnByb3RvdHlwZS51bnNvcnRlZEZvckVhY2ggPVxuICBmdW5jdGlvbiBNYXBwaW5nTGlzdF9mb3JFYWNoKGFDYWxsYmFjaywgYVRoaXNBcmcpIHtcbiAgICB0aGlzLl9hcnJheS5mb3JFYWNoKGFDYWxsYmFjaywgYVRoaXNBcmcpO1xuICB9O1xuXG4vKipcbiAqIEFkZCB0aGUgZ2l2ZW4gc291cmNlIG1hcHBpbmcuXG4gKlxuICogQHBhcmFtIE9iamVjdCBhTWFwcGluZ1xuICovXG5NYXBwaW5nTGlzdC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gTWFwcGluZ0xpc3RfYWRkKGFNYXBwaW5nKSB7XG4gIGlmIChnZW5lcmF0ZWRQb3NpdGlvbkFmdGVyKHRoaXMuX2xhc3QsIGFNYXBwaW5nKSkge1xuICAgIHRoaXMuX2xhc3QgPSBhTWFwcGluZztcbiAgICB0aGlzLl9hcnJheS5wdXNoKGFNYXBwaW5nKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9zb3J0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9hcnJheS5wdXNoKGFNYXBwaW5nKTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBmbGF0LCBzb3J0ZWQgYXJyYXkgb2YgbWFwcGluZ3MuIFRoZSBtYXBwaW5ncyBhcmUgc29ydGVkIGJ5XG4gKiBnZW5lcmF0ZWQgcG9zaXRpb24uXG4gKlxuICogV0FSTklORzogVGhpcyBtZXRob2QgcmV0dXJucyBpbnRlcm5hbCBkYXRhIHdpdGhvdXQgY29weWluZywgZm9yXG4gKiBwZXJmb3JtYW5jZS4gVGhlIHJldHVybiB2YWx1ZSBtdXN0IE5PVCBiZSBtdXRhdGVkLCBhbmQgc2hvdWxkIGJlIHRyZWF0ZWQgYXNcbiAqIGFuIGltbXV0YWJsZSBib3Jyb3cuIElmIHlvdSB3YW50IHRvIHRha2Ugb3duZXJzaGlwLCB5b3UgbXVzdCBtYWtlIHlvdXIgb3duXG4gKiBjb3B5LlxuICovXG5NYXBwaW5nTGlzdC5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uIE1hcHBpbmdMaXN0X3RvQXJyYXkoKSB7XG4gIGlmICghdGhpcy5fc29ydGVkKSB7XG4gICAgdGhpcy5fYXJyYXkuc29ydCh1dGlsLmNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0luZmxhdGVkKTtcbiAgICB0aGlzLl9zb3J0ZWQgPSB0cnVlO1xuICB9XG4gIHJldHVybiB0aGlzLl9hcnJheTtcbn07XG5cbmV4cG9ydHMuTWFwcGluZ0xpc3QgPSBNYXBwaW5nTGlzdDtcbiIsIi8qIC0qLSBNb2RlOiBqczsganMtaW5kZW50LWxldmVsOiAyOyAtKi0gKi9cbi8qXG4gKiBDb3B5cmlnaHQgMjAxMSBNb3ppbGxhIEZvdW5kYXRpb24gYW5kIGNvbnRyaWJ1dG9yc1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgbGljZW5zZS4gU2VlIExJQ0VOU0Ugb3I6XG4gKiBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvQlNELTMtQ2xhdXNlXG4gKi9cblxuLy8gSXQgdHVybnMgb3V0IHRoYXQgc29tZSAobW9zdD8pIEphdmFTY3JpcHQgZW5naW5lcyBkb24ndCBzZWxmLWhvc3Rcbi8vIGBBcnJheS5wcm90b3R5cGUuc29ydGAuIFRoaXMgbWFrZXMgc2Vuc2UgYmVjYXVzZSBDKysgd2lsbCBsaWtlbHkgcmVtYWluXG4vLyBmYXN0ZXIgdGhhbiBKUyB3aGVuIGRvaW5nIHJhdyBDUFUtaW50ZW5zaXZlIHNvcnRpbmcuIEhvd2V2ZXIsIHdoZW4gdXNpbmcgYVxuLy8gY3VzdG9tIGNvbXBhcmF0b3IgZnVuY3Rpb24sIGNhbGxpbmcgYmFjayBhbmQgZm9ydGggYmV0d2VlbiB0aGUgVk0ncyBDKysgYW5kXG4vLyBKSVQnZCBKUyBpcyByYXRoZXIgc2xvdyAqYW5kKiBsb3NlcyBKSVQgdHlwZSBpbmZvcm1hdGlvbiwgcmVzdWx0aW5nIGluXG4vLyB3b3JzZSBnZW5lcmF0ZWQgY29kZSBmb3IgdGhlIGNvbXBhcmF0b3IgZnVuY3Rpb24gdGhhbiB3b3VsZCBiZSBvcHRpbWFsLiBJblxuLy8gZmFjdCwgd2hlbiBzb3J0aW5nIHdpdGggYSBjb21wYXJhdG9yLCB0aGVzZSBjb3N0cyBvdXR3ZWlnaCB0aGUgYmVuZWZpdHMgb2Zcbi8vIHNvcnRpbmcgaW4gQysrLiBCeSB1c2luZyBvdXIgb3duIEpTLWltcGxlbWVudGVkIFF1aWNrIFNvcnQgKGJlbG93KSwgd2UgZ2V0XG4vLyBhIH4zNTAwbXMgbWVhbiBzcGVlZC11cCBpbiBgYmVuY2gvYmVuY2guaHRtbGAuXG5cbi8qKlxuICogU3dhcCB0aGUgZWxlbWVudHMgaW5kZXhlZCBieSBgeGAgYW5kIGB5YCBpbiB0aGUgYXJyYXkgYGFyeWAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJ5XG4gKiAgICAgICAgVGhlIGFycmF5LlxuICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAqICAgICAgICBUaGUgaW5kZXggb2YgdGhlIGZpcnN0IGl0ZW0uXG4gKiBAcGFyYW0ge051bWJlcn0geVxuICogICAgICAgIFRoZSBpbmRleCBvZiB0aGUgc2Vjb25kIGl0ZW0uXG4gKi9cbmZ1bmN0aW9uIHN3YXAoYXJ5LCB4LCB5KSB7XG4gIHZhciB0ZW1wID0gYXJ5W3hdO1xuICBhcnlbeF0gPSBhcnlbeV07XG4gIGFyeVt5XSA9IHRlbXA7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHJhbmRvbSBpbnRlZ2VyIHdpdGhpbiB0aGUgcmFuZ2UgYGxvdyAuLiBoaWdoYCBpbmNsdXNpdmUuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGxvd1xuICogICAgICAgIFRoZSBsb3dlciBib3VuZCBvbiB0aGUgcmFuZ2UuXG4gKiBAcGFyYW0ge051bWJlcn0gaGlnaFxuICogICAgICAgIFRoZSB1cHBlciBib3VuZCBvbiB0aGUgcmFuZ2UuXG4gKi9cbmZ1bmN0aW9uIHJhbmRvbUludEluUmFuZ2UobG93LCBoaWdoKSB7XG4gIHJldHVybiBNYXRoLnJvdW5kKGxvdyArIChNYXRoLnJhbmRvbSgpICogKGhpZ2ggLSBsb3cpKSk7XG59XG5cbi8qKlxuICogVGhlIFF1aWNrIFNvcnQgYWxnb3JpdGhtLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyeVxuICogICAgICAgIEFuIGFycmF5IHRvIHNvcnQuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb21wYXJhdG9yXG4gKiAgICAgICAgRnVuY3Rpb24gdG8gdXNlIHRvIGNvbXBhcmUgdHdvIGl0ZW1zLlxuICogQHBhcmFtIHtOdW1iZXJ9IHBcbiAqICAgICAgICBTdGFydCBpbmRleCBvZiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7TnVtYmVyfSByXG4gKiAgICAgICAgRW5kIGluZGV4IG9mIHRoZSBhcnJheVxuICovXG5mdW5jdGlvbiBkb1F1aWNrU29ydChhcnksIGNvbXBhcmF0b3IsIHAsIHIpIHtcbiAgLy8gSWYgb3VyIGxvd2VyIGJvdW5kIGlzIGxlc3MgdGhhbiBvdXIgdXBwZXIgYm91bmQsIHdlICgxKSBwYXJ0aXRpb24gdGhlXG4gIC8vIGFycmF5IGludG8gdHdvIHBpZWNlcyBhbmQgKDIpIHJlY3Vyc2Ugb24gZWFjaCBoYWxmLiBJZiBpdCBpcyBub3QsIHRoaXMgaXNcbiAgLy8gdGhlIGVtcHR5IGFycmF5IGFuZCBvdXIgYmFzZSBjYXNlLlxuXG4gIGlmIChwIDwgcikge1xuICAgIC8vICgxKSBQYXJ0aXRpb25pbmcuXG4gICAgLy9cbiAgICAvLyBUaGUgcGFydGl0aW9uaW5nIGNob29zZXMgYSBwaXZvdCBiZXR3ZWVuIGBwYCBhbmQgYHJgIGFuZCBtb3ZlcyBhbGxcbiAgICAvLyBlbGVtZW50cyB0aGF0IGFyZSBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHBpdm90IHRvIHRoZSBiZWZvcmUgaXQsIGFuZFxuICAgIC8vIGFsbCB0aGUgZWxlbWVudHMgdGhhdCBhcmUgZ3JlYXRlciB0aGFuIGl0IGFmdGVyIGl0LiBUaGUgZWZmZWN0IGlzIHRoYXRcbiAgICAvLyBvbmNlIHBhcnRpdGlvbiBpcyBkb25lLCB0aGUgcGl2b3QgaXMgaW4gdGhlIGV4YWN0IHBsYWNlIGl0IHdpbGwgYmUgd2hlblxuICAgIC8vIHRoZSBhcnJheSBpcyBwdXQgaW4gc29ydGVkIG9yZGVyLCBhbmQgaXQgd2lsbCBub3QgbmVlZCB0byBiZSBtb3ZlZFxuICAgIC8vIGFnYWluLiBUaGlzIHJ1bnMgaW4gTyhuKSB0aW1lLlxuXG4gICAgLy8gQWx3YXlzIGNob29zZSBhIHJhbmRvbSBwaXZvdCBzbyB0aGF0IGFuIGlucHV0IGFycmF5IHdoaWNoIGlzIHJldmVyc2VcbiAgICAvLyBzb3J0ZWQgZG9lcyBub3QgY2F1c2UgTyhuXjIpIHJ1bm5pbmcgdGltZS5cbiAgICB2YXIgcGl2b3RJbmRleCA9IHJhbmRvbUludEluUmFuZ2UocCwgcik7XG4gICAgdmFyIGkgPSBwIC0gMTtcblxuICAgIHN3YXAoYXJ5LCBwaXZvdEluZGV4LCByKTtcbiAgICB2YXIgcGl2b3QgPSBhcnlbcl07XG5cbiAgICAvLyBJbW1lZGlhdGVseSBhZnRlciBgamAgaXMgaW5jcmVtZW50ZWQgaW4gdGhpcyBsb29wLCB0aGUgZm9sbG93aW5nIGhvbGRcbiAgICAvLyB0cnVlOlxuICAgIC8vXG4gICAgLy8gICAqIEV2ZXJ5IGVsZW1lbnQgaW4gYGFyeVtwIC4uIGldYCBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHBpdm90LlxuICAgIC8vXG4gICAgLy8gICAqIEV2ZXJ5IGVsZW1lbnQgaW4gYGFyeVtpKzEgLi4gai0xXWAgaXMgZ3JlYXRlciB0aGFuIHRoZSBwaXZvdC5cbiAgICBmb3IgKHZhciBqID0gcDsgaiA8IHI7IGorKykge1xuICAgICAgaWYgKGNvbXBhcmF0b3IoYXJ5W2pdLCBwaXZvdCkgPD0gMCkge1xuICAgICAgICBpICs9IDE7XG4gICAgICAgIHN3YXAoYXJ5LCBpLCBqKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzd2FwKGFyeSwgaSArIDEsIGopO1xuICAgIHZhciBxID0gaSArIDE7XG5cbiAgICAvLyAoMikgUmVjdXJzZSBvbiBlYWNoIGhhbGYuXG5cbiAgICBkb1F1aWNrU29ydChhcnksIGNvbXBhcmF0b3IsIHAsIHEgLSAxKTtcbiAgICBkb1F1aWNrU29ydChhcnksIGNvbXBhcmF0b3IsIHEgKyAxLCByKTtcbiAgfVxufVxuXG4vKipcbiAqIFNvcnQgdGhlIGdpdmVuIGFycmF5IGluLXBsYWNlIHdpdGggdGhlIGdpdmVuIGNvbXBhcmF0b3IgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJ5XG4gKiAgICAgICAgQW4gYXJyYXkgdG8gc29ydC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbXBhcmF0b3JcbiAqICAgICAgICBGdW5jdGlvbiB0byB1c2UgdG8gY29tcGFyZSB0d28gaXRlbXMuXG4gKi9cbmV4cG9ydHMucXVpY2tTb3J0ID0gZnVuY3Rpb24gKGFyeSwgY29tcGFyYXRvcikge1xuICBkb1F1aWNrU29ydChhcnksIGNvbXBhcmF0b3IsIDAsIGFyeS5sZW5ndGggLSAxKTtcbn07XG4iLCIvKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTEgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgYmluYXJ5U2VhcmNoID0gcmVxdWlyZSgnLi9iaW5hcnktc2VhcmNoJyk7XG52YXIgQXJyYXlTZXQgPSByZXF1aXJlKCcuL2FycmF5LXNldCcpLkFycmF5U2V0O1xudmFyIGJhc2U2NFZMUSA9IHJlcXVpcmUoJy4vYmFzZTY0LXZscScpO1xudmFyIHF1aWNrU29ydCA9IHJlcXVpcmUoJy4vcXVpY2stc29ydCcpLnF1aWNrU29ydDtcblxuZnVuY3Rpb24gU291cmNlTWFwQ29uc3VtZXIoYVNvdXJjZU1hcCkge1xuICB2YXIgc291cmNlTWFwID0gYVNvdXJjZU1hcDtcbiAgaWYgKHR5cGVvZiBhU291cmNlTWFwID09PSAnc3RyaW5nJykge1xuICAgIHNvdXJjZU1hcCA9IEpTT04ucGFyc2UoYVNvdXJjZU1hcC5yZXBsYWNlKC9eXFwpXFxdXFx9Jy8sICcnKSk7XG4gIH1cblxuICByZXR1cm4gc291cmNlTWFwLnNlY3Rpb25zICE9IG51bGxcbiAgICA/IG5ldyBJbmRleGVkU291cmNlTWFwQ29uc3VtZXIoc291cmNlTWFwKVxuICAgIDogbmV3IEJhc2ljU291cmNlTWFwQ29uc3VtZXIoc291cmNlTWFwKTtcbn1cblxuU291cmNlTWFwQ29uc3VtZXIuZnJvbVNvdXJjZU1hcCA9IGZ1bmN0aW9uKGFTb3VyY2VNYXApIHtcbiAgcmV0dXJuIEJhc2ljU291cmNlTWFwQ29uc3VtZXIuZnJvbVNvdXJjZU1hcChhU291cmNlTWFwKTtcbn1cblxuLyoqXG4gKiBUaGUgdmVyc2lvbiBvZiB0aGUgc291cmNlIG1hcHBpbmcgc3BlYyB0aGF0IHdlIGFyZSBjb25zdW1pbmcuXG4gKi9cblNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5fdmVyc2lvbiA9IDM7XG5cbi8vIGBfX2dlbmVyYXRlZE1hcHBpbmdzYCBhbmQgYF9fb3JpZ2luYWxNYXBwaW5nc2AgYXJlIGFycmF5cyB0aGF0IGhvbGQgdGhlXG4vLyBwYXJzZWQgbWFwcGluZyBjb29yZGluYXRlcyBmcm9tIHRoZSBzb3VyY2UgbWFwJ3MgXCJtYXBwaW5nc1wiIGF0dHJpYnV0ZS4gVGhleVxuLy8gYXJlIGxhemlseSBpbnN0YW50aWF0ZWQsIGFjY2Vzc2VkIHZpYSB0aGUgYF9nZW5lcmF0ZWRNYXBwaW5nc2AgYW5kXG4vLyBgX29yaWdpbmFsTWFwcGluZ3NgIGdldHRlcnMgcmVzcGVjdGl2ZWx5LCBhbmQgd2Ugb25seSBwYXJzZSB0aGUgbWFwcGluZ3Ncbi8vIGFuZCBjcmVhdGUgdGhlc2UgYXJyYXlzIG9uY2UgcXVlcmllZCBmb3IgYSBzb3VyY2UgbG9jYXRpb24uIFdlIGp1bXAgdGhyb3VnaFxuLy8gdGhlc2UgaG9vcHMgYmVjYXVzZSB0aGVyZSBjYW4gYmUgbWFueSB0aG91c2FuZHMgb2YgbWFwcGluZ3MsIGFuZCBwYXJzaW5nXG4vLyB0aGVtIGlzIGV4cGVuc2l2ZSwgc28gd2Ugb25seSB3YW50IHRvIGRvIGl0IGlmIHdlIG11c3QuXG4vL1xuLy8gRWFjaCBvYmplY3QgaW4gdGhlIGFycmF5cyBpcyBvZiB0aGUgZm9ybTpcbi8vXG4vLyAgICAge1xuLy8gICAgICAgZ2VuZXJhdGVkTGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBnZW5lcmF0ZWQgY29kZSxcbi8vICAgICAgIGdlbmVyYXRlZENvbHVtbjogVGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBjb2RlLFxuLy8gICAgICAgc291cmNlOiBUaGUgcGF0aCB0byB0aGUgb3JpZ2luYWwgc291cmNlIGZpbGUgdGhhdCBnZW5lcmF0ZWQgdGhpc1xuLy8gICAgICAgICAgICAgICBjaHVuayBvZiBjb2RlLFxuLy8gICAgICAgb3JpZ2luYWxMaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZSB0aGF0XG4vLyAgICAgICAgICAgICAgICAgICAgIGNvcnJlc3BvbmRzIHRvIHRoaXMgY2h1bmsgb2YgZ2VuZXJhdGVkIGNvZGUsXG4vLyAgICAgICBvcmlnaW5hbENvbHVtbjogVGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZSB0aGF0XG4vLyAgICAgICAgICAgICAgICAgICAgICAgY29ycmVzcG9uZHMgdG8gdGhpcyBjaHVuayBvZiBnZW5lcmF0ZWQgY29kZSxcbi8vICAgICAgIG5hbWU6IFRoZSBuYW1lIG9mIHRoZSBvcmlnaW5hbCBzeW1ib2wgd2hpY2ggZ2VuZXJhdGVkIHRoaXMgY2h1bmsgb2Zcbi8vICAgICAgICAgICAgIGNvZGUuXG4vLyAgICAgfVxuLy9cbi8vIEFsbCBwcm9wZXJ0aWVzIGV4Y2VwdCBmb3IgYGdlbmVyYXRlZExpbmVgIGFuZCBgZ2VuZXJhdGVkQ29sdW1uYCBjYW4gYmVcbi8vIGBudWxsYC5cbi8vXG4vLyBgX2dlbmVyYXRlZE1hcHBpbmdzYCBpcyBvcmRlcmVkIGJ5IHRoZSBnZW5lcmF0ZWQgcG9zaXRpb25zLlxuLy9cbi8vIGBfb3JpZ2luYWxNYXBwaW5nc2AgaXMgb3JkZXJlZCBieSB0aGUgb3JpZ2luYWwgcG9zaXRpb25zLlxuXG5Tb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuX19nZW5lcmF0ZWRNYXBwaW5ncyA9IG51bGw7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLCAnX2dlbmVyYXRlZE1hcHBpbmdzJywge1xuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX19nZW5lcmF0ZWRNYXBwaW5ncykge1xuICAgICAgdGhpcy5fcGFyc2VNYXBwaW5ncyh0aGlzLl9tYXBwaW5ncywgdGhpcy5zb3VyY2VSb290KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fX2dlbmVyYXRlZE1hcHBpbmdzO1xuICB9XG59KTtcblxuU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLl9fb3JpZ2luYWxNYXBwaW5ncyA9IG51bGw7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLCAnX29yaWdpbmFsTWFwcGluZ3MnLCB7XG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5fX29yaWdpbmFsTWFwcGluZ3MpIHtcbiAgICAgIHRoaXMuX3BhcnNlTWFwcGluZ3ModGhpcy5fbWFwcGluZ3MsIHRoaXMuc291cmNlUm9vdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX19vcmlnaW5hbE1hcHBpbmdzO1xuICB9XG59KTtcblxuU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLl9jaGFySXNNYXBwaW5nU2VwYXJhdG9yID1cbiAgZnVuY3Rpb24gU291cmNlTWFwQ29uc3VtZXJfY2hhcklzTWFwcGluZ1NlcGFyYXRvcihhU3RyLCBpbmRleCkge1xuICAgIHZhciBjID0gYVN0ci5jaGFyQXQoaW5kZXgpO1xuICAgIHJldHVybiBjID09PSBcIjtcIiB8fCBjID09PSBcIixcIjtcbiAgfTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgbWFwcGluZ3MgaW4gYSBzdHJpbmcgaW4gdG8gYSBkYXRhIHN0cnVjdHVyZSB3aGljaCB3ZSBjYW4gZWFzaWx5XG4gKiBxdWVyeSAodGhlIG9yZGVyZWQgYXJyYXlzIGluIHRoZSBgdGhpcy5fX2dlbmVyYXRlZE1hcHBpbmdzYCBhbmRcbiAqIGB0aGlzLl9fb3JpZ2luYWxNYXBwaW5nc2AgcHJvcGVydGllcykuXG4gKi9cblNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5fcGFyc2VNYXBwaW5ncyA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcENvbnN1bWVyX3BhcnNlTWFwcGluZ3MoYVN0ciwgYVNvdXJjZVJvb3QpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdWJjbGFzc2VzIG11c3QgaW1wbGVtZW50IF9wYXJzZU1hcHBpbmdzXCIpO1xuICB9O1xuXG5Tb3VyY2VNYXBDb25zdW1lci5HRU5FUkFURURfT1JERVIgPSAxO1xuU291cmNlTWFwQ29uc3VtZXIuT1JJR0lOQUxfT1JERVIgPSAyO1xuXG5Tb3VyY2VNYXBDb25zdW1lci5HUkVBVEVTVF9MT1dFUl9CT1VORCA9IDE7XG5Tb3VyY2VNYXBDb25zdW1lci5MRUFTVF9VUFBFUl9CT1VORCA9IDI7XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGVhY2ggbWFwcGluZyBiZXR3ZWVuIGFuIG9yaWdpbmFsIHNvdXJjZS9saW5lL2NvbHVtbiBhbmQgYVxuICogZ2VuZXJhdGVkIGxpbmUvY29sdW1uIGluIHRoaXMgc291cmNlIG1hcC5cbiAqXG4gKiBAcGFyYW0gRnVuY3Rpb24gYUNhbGxiYWNrXG4gKiAgICAgICAgVGhlIGZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdpdGggZWFjaCBtYXBwaW5nLlxuICogQHBhcmFtIE9iamVjdCBhQ29udGV4dFxuICogICAgICAgIE9wdGlvbmFsLiBJZiBzcGVjaWZpZWQsIHRoaXMgb2JqZWN0IHdpbGwgYmUgdGhlIHZhbHVlIG9mIGB0aGlzYCBldmVyeVxuICogICAgICAgIHRpbWUgdGhhdCBgYUNhbGxiYWNrYCBpcyBjYWxsZWQuXG4gKiBAcGFyYW0gYU9yZGVyXG4gKiAgICAgICAgRWl0aGVyIGBTb3VyY2VNYXBDb25zdW1lci5HRU5FUkFURURfT1JERVJgIG9yXG4gKiAgICAgICAgYFNvdXJjZU1hcENvbnN1bWVyLk9SSUdJTkFMX09SREVSYC4gU3BlY2lmaWVzIHdoZXRoZXIgeW91IHdhbnQgdG9cbiAqICAgICAgICBpdGVyYXRlIG92ZXIgdGhlIG1hcHBpbmdzIHNvcnRlZCBieSB0aGUgZ2VuZXJhdGVkIGZpbGUncyBsaW5lL2NvbHVtblxuICogICAgICAgIG9yZGVyIG9yIHRoZSBvcmlnaW5hbCdzIHNvdXJjZS9saW5lL2NvbHVtbiBvcmRlciwgcmVzcGVjdGl2ZWx5LiBEZWZhdWx0cyB0b1xuICogICAgICAgIGBTb3VyY2VNYXBDb25zdW1lci5HRU5FUkFURURfT1JERVJgLlxuICovXG5Tb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuZWFjaE1hcHBpbmcgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBDb25zdW1lcl9lYWNoTWFwcGluZyhhQ2FsbGJhY2ssIGFDb250ZXh0LCBhT3JkZXIpIHtcbiAgICB2YXIgY29udGV4dCA9IGFDb250ZXh0IHx8IG51bGw7XG4gICAgdmFyIG9yZGVyID0gYU9yZGVyIHx8IFNvdXJjZU1hcENvbnN1bWVyLkdFTkVSQVRFRF9PUkRFUjtcblxuICAgIHZhciBtYXBwaW5ncztcbiAgICBzd2l0Y2ggKG9yZGVyKSB7XG4gICAgY2FzZSBTb3VyY2VNYXBDb25zdW1lci5HRU5FUkFURURfT1JERVI6XG4gICAgICBtYXBwaW5ncyA9IHRoaXMuX2dlbmVyYXRlZE1hcHBpbmdzO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBTb3VyY2VNYXBDb25zdW1lci5PUklHSU5BTF9PUkRFUjpcbiAgICAgIG1hcHBpbmdzID0gdGhpcy5fb3JpZ2luYWxNYXBwaW5ncztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIG9yZGVyIG9mIGl0ZXJhdGlvbi5cIik7XG4gICAgfVxuXG4gICAgdmFyIHNvdXJjZVJvb3QgPSB0aGlzLnNvdXJjZVJvb3Q7XG4gICAgbWFwcGluZ3MubWFwKGZ1bmN0aW9uIChtYXBwaW5nKSB7XG4gICAgICB2YXIgc291cmNlID0gbWFwcGluZy5zb3VyY2UgPT09IG51bGwgPyBudWxsIDogdGhpcy5fc291cmNlcy5hdChtYXBwaW5nLnNvdXJjZSk7XG4gICAgICBpZiAoc291cmNlICE9IG51bGwgJiYgc291cmNlUm9vdCAhPSBudWxsKSB7XG4gICAgICAgIHNvdXJjZSA9IHV0aWwuam9pbihzb3VyY2VSb290LCBzb3VyY2UpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICAgIGdlbmVyYXRlZExpbmU6IG1hcHBpbmcuZ2VuZXJhdGVkTGluZSxcbiAgICAgICAgZ2VuZXJhdGVkQ29sdW1uOiBtYXBwaW5nLmdlbmVyYXRlZENvbHVtbixcbiAgICAgICAgb3JpZ2luYWxMaW5lOiBtYXBwaW5nLm9yaWdpbmFsTGluZSxcbiAgICAgICAgb3JpZ2luYWxDb2x1bW46IG1hcHBpbmcub3JpZ2luYWxDb2x1bW4sXG4gICAgICAgIG5hbWU6IG1hcHBpbmcubmFtZSA9PT0gbnVsbCA/IG51bGwgOiB0aGlzLl9uYW1lcy5hdChtYXBwaW5nLm5hbWUpXG4gICAgICB9O1xuICAgIH0sIHRoaXMpLmZvckVhY2goYUNhbGxiYWNrLCBjb250ZXh0KTtcbiAgfTtcblxuLyoqXG4gKiBSZXR1cm5zIGFsbCBnZW5lcmF0ZWQgbGluZSBhbmQgY29sdW1uIGluZm9ybWF0aW9uIGZvciB0aGUgb3JpZ2luYWwgc291cmNlLFxuICogbGluZSwgYW5kIGNvbHVtbiBwcm92aWRlZC4gSWYgbm8gY29sdW1uIGlzIHByb3ZpZGVkLCByZXR1cm5zIGFsbCBtYXBwaW5nc1xuICogY29ycmVzcG9uZGluZyB0byBhIGVpdGhlciB0aGUgbGluZSB3ZSBhcmUgc2VhcmNoaW5nIGZvciBvciB0aGUgbmV4dFxuICogY2xvc2VzdCBsaW5lIHRoYXQgaGFzIGFueSBtYXBwaW5ncy4gT3RoZXJ3aXNlLCByZXR1cm5zIGFsbCBtYXBwaW5nc1xuICogY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4gbGluZSBhbmQgZWl0aGVyIHRoZSBjb2x1bW4gd2UgYXJlIHNlYXJjaGluZyBmb3JcbiAqIG9yIHRoZSBuZXh0IGNsb3Nlc3QgY29sdW1uIHRoYXQgaGFzIGFueSBvZmZzZXRzLlxuICpcbiAqIFRoZSBvbmx5IGFyZ3VtZW50IGlzIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gc291cmNlOiBUaGUgZmlsZW5hbWUgb2YgdGhlIG9yaWdpbmFsIHNvdXJjZS5cbiAqICAgLSBsaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZS5cbiAqICAgLSBjb2x1bW46IE9wdGlvbmFsLiB0aGUgY29sdW1uIG51bWJlciBpbiB0aGUgb3JpZ2luYWwgc291cmNlLlxuICpcbiAqIGFuZCBhbiBhcnJheSBvZiBvYmplY3RzIGlzIHJldHVybmVkLCBlYWNoIHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBsaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UsIG9yIG51bGwuXG4gKiAgIC0gY29sdW1uOiBUaGUgY29sdW1uIG51bWJlciBpbiB0aGUgZ2VuZXJhdGVkIHNvdXJjZSwgb3IgbnVsbC5cbiAqL1xuU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLmFsbEdlbmVyYXRlZFBvc2l0aW9uc0ZvciA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcENvbnN1bWVyX2FsbEdlbmVyYXRlZFBvc2l0aW9uc0ZvcihhQXJncykge1xuICAgIHZhciBsaW5lID0gdXRpbC5nZXRBcmcoYUFyZ3MsICdsaW5lJyk7XG5cbiAgICAvLyBXaGVuIHRoZXJlIGlzIG5vIGV4YWN0IG1hdGNoLCBCYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5fZmluZE1hcHBpbmdcbiAgICAvLyByZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgY2xvc2VzdCBtYXBwaW5nIGxlc3MgdGhhbiB0aGUgbmVlZGxlLiBCeVxuICAgIC8vIHNldHRpbmcgbmVlZGxlLm9yaWdpbmFsQ29sdW1uIHRvIDAsIHdlIHRodXMgZmluZCB0aGUgbGFzdCBtYXBwaW5nIGZvclxuICAgIC8vIHRoZSBnaXZlbiBsaW5lLCBwcm92aWRlZCBzdWNoIGEgbWFwcGluZyBleGlzdHMuXG4gICAgdmFyIG5lZWRsZSA9IHtcbiAgICAgIHNvdXJjZTogdXRpbC5nZXRBcmcoYUFyZ3MsICdzb3VyY2UnKSxcbiAgICAgIG9yaWdpbmFsTGluZTogbGluZSxcbiAgICAgIG9yaWdpbmFsQ29sdW1uOiB1dGlsLmdldEFyZyhhQXJncywgJ2NvbHVtbicsIDApXG4gICAgfTtcblxuICAgIGlmICh0aGlzLnNvdXJjZVJvb3QgIT0gbnVsbCkge1xuICAgICAgbmVlZGxlLnNvdXJjZSA9IHV0aWwucmVsYXRpdmUodGhpcy5zb3VyY2VSb290LCBuZWVkbGUuc291cmNlKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9zb3VyY2VzLmhhcyhuZWVkbGUuc291cmNlKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBuZWVkbGUuc291cmNlID0gdGhpcy5fc291cmNlcy5pbmRleE9mKG5lZWRsZS5zb3VyY2UpO1xuXG4gICAgdmFyIG1hcHBpbmdzID0gW107XG5cbiAgICB2YXIgaW5kZXggPSB0aGlzLl9maW5kTWFwcGluZyhuZWVkbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb3JpZ2luYWxNYXBwaW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm9yaWdpbmFsTGluZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwib3JpZ2luYWxDb2x1bW5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlsLmNvbXBhcmVCeU9yaWdpbmFsUG9zaXRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmFyeVNlYXJjaC5MRUFTVF9VUFBFUl9CT1VORCk7XG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIHZhciBtYXBwaW5nID0gdGhpcy5fb3JpZ2luYWxNYXBwaW5nc1tpbmRleF07XG5cbiAgICAgIGlmIChhQXJncy5jb2x1bW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgb3JpZ2luYWxMaW5lID0gbWFwcGluZy5vcmlnaW5hbExpbmU7XG5cbiAgICAgICAgLy8gSXRlcmF0ZSB1bnRpbCBlaXRoZXIgd2UgcnVuIG91dCBvZiBtYXBwaW5ncywgb3Igd2UgcnVuIGludG9cbiAgICAgICAgLy8gYSBtYXBwaW5nIGZvciBhIGRpZmZlcmVudCBsaW5lIHRoYW4gdGhlIG9uZSB3ZSBmb3VuZC4gU2luY2VcbiAgICAgICAgLy8gbWFwcGluZ3MgYXJlIHNvcnRlZCwgdGhpcyBpcyBndWFyYW50ZWVkIHRvIGZpbmQgYWxsIG1hcHBpbmdzIGZvclxuICAgICAgICAvLyB0aGUgbGluZSB3ZSBmb3VuZC5cbiAgICAgICAgd2hpbGUgKG1hcHBpbmcgJiYgbWFwcGluZy5vcmlnaW5hbExpbmUgPT09IG9yaWdpbmFsTGluZSkge1xuICAgICAgICAgIG1hcHBpbmdzLnB1c2goe1xuICAgICAgICAgICAgbGluZTogdXRpbC5nZXRBcmcobWFwcGluZywgJ2dlbmVyYXRlZExpbmUnLCBudWxsKSxcbiAgICAgICAgICAgIGNvbHVtbjogdXRpbC5nZXRBcmcobWFwcGluZywgJ2dlbmVyYXRlZENvbHVtbicsIG51bGwpLFxuICAgICAgICAgICAgbGFzdENvbHVtbjogdXRpbC5nZXRBcmcobWFwcGluZywgJ2xhc3RHZW5lcmF0ZWRDb2x1bW4nLCBudWxsKVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgbWFwcGluZyA9IHRoaXMuX29yaWdpbmFsTWFwcGluZ3NbKytpbmRleF07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBvcmlnaW5hbENvbHVtbiA9IG1hcHBpbmcub3JpZ2luYWxDb2x1bW47XG5cbiAgICAgICAgLy8gSXRlcmF0ZSB1bnRpbCBlaXRoZXIgd2UgcnVuIG91dCBvZiBtYXBwaW5ncywgb3Igd2UgcnVuIGludG9cbiAgICAgICAgLy8gYSBtYXBwaW5nIGZvciBhIGRpZmZlcmVudCBsaW5lIHRoYW4gdGhlIG9uZSB3ZSB3ZXJlIHNlYXJjaGluZyBmb3IuXG4gICAgICAgIC8vIFNpbmNlIG1hcHBpbmdzIGFyZSBzb3J0ZWQsIHRoaXMgaXMgZ3VhcmFudGVlZCB0byBmaW5kIGFsbCBtYXBwaW5ncyBmb3JcbiAgICAgICAgLy8gdGhlIGxpbmUgd2UgYXJlIHNlYXJjaGluZyBmb3IuXG4gICAgICAgIHdoaWxlIChtYXBwaW5nICYmXG4gICAgICAgICAgICAgICBtYXBwaW5nLm9yaWdpbmFsTGluZSA9PT0gbGluZSAmJlxuICAgICAgICAgICAgICAgbWFwcGluZy5vcmlnaW5hbENvbHVtbiA9PSBvcmlnaW5hbENvbHVtbikge1xuICAgICAgICAgIG1hcHBpbmdzLnB1c2goe1xuICAgICAgICAgICAgbGluZTogdXRpbC5nZXRBcmcobWFwcGluZywgJ2dlbmVyYXRlZExpbmUnLCBudWxsKSxcbiAgICAgICAgICAgIGNvbHVtbjogdXRpbC5nZXRBcmcobWFwcGluZywgJ2dlbmVyYXRlZENvbHVtbicsIG51bGwpLFxuICAgICAgICAgICAgbGFzdENvbHVtbjogdXRpbC5nZXRBcmcobWFwcGluZywgJ2xhc3RHZW5lcmF0ZWRDb2x1bW4nLCBudWxsKVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgbWFwcGluZyA9IHRoaXMuX29yaWdpbmFsTWFwcGluZ3NbKytpbmRleF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWFwcGluZ3M7XG4gIH07XG5cbmV4cG9ydHMuU291cmNlTWFwQ29uc3VtZXIgPSBTb3VyY2VNYXBDb25zdW1lcjtcblxuLyoqXG4gKiBBIEJhc2ljU291cmNlTWFwQ29uc3VtZXIgaW5zdGFuY2UgcmVwcmVzZW50cyBhIHBhcnNlZCBzb3VyY2UgbWFwIHdoaWNoIHdlIGNhblxuICogcXVlcnkgZm9yIGluZm9ybWF0aW9uIGFib3V0IHRoZSBvcmlnaW5hbCBmaWxlIHBvc2l0aW9ucyBieSBnaXZpbmcgaXQgYSBmaWxlXG4gKiBwb3NpdGlvbiBpbiB0aGUgZ2VuZXJhdGVkIHNvdXJjZS5cbiAqXG4gKiBUaGUgb25seSBwYXJhbWV0ZXIgaXMgdGhlIHJhdyBzb3VyY2UgbWFwIChlaXRoZXIgYXMgYSBKU09OIHN0cmluZywgb3JcbiAqIGFscmVhZHkgcGFyc2VkIHRvIGFuIG9iamVjdCkuIEFjY29yZGluZyB0byB0aGUgc3BlYywgc291cmNlIG1hcHMgaGF2ZSB0aGVcbiAqIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuICpcbiAqICAgLSB2ZXJzaW9uOiBXaGljaCB2ZXJzaW9uIG9mIHRoZSBzb3VyY2UgbWFwIHNwZWMgdGhpcyBtYXAgaXMgZm9sbG93aW5nLlxuICogICAtIHNvdXJjZXM6IEFuIGFycmF5IG9mIFVSTHMgdG8gdGhlIG9yaWdpbmFsIHNvdXJjZSBmaWxlcy5cbiAqICAgLSBuYW1lczogQW4gYXJyYXkgb2YgaWRlbnRpZmllcnMgd2hpY2ggY2FuIGJlIHJlZmVycmVuY2VkIGJ5IGluZGl2aWR1YWwgbWFwcGluZ3MuXG4gKiAgIC0gc291cmNlUm9vdDogT3B0aW9uYWwuIFRoZSBVUkwgcm9vdCBmcm9tIHdoaWNoIGFsbCBzb3VyY2VzIGFyZSByZWxhdGl2ZS5cbiAqICAgLSBzb3VyY2VzQ29udGVudDogT3B0aW9uYWwuIEFuIGFycmF5IG9mIGNvbnRlbnRzIG9mIHRoZSBvcmlnaW5hbCBzb3VyY2UgZmlsZXMuXG4gKiAgIC0gbWFwcGluZ3M6IEEgc3RyaW5nIG9mIGJhc2U2NCBWTFFzIHdoaWNoIGNvbnRhaW4gdGhlIGFjdHVhbCBtYXBwaW5ncy5cbiAqICAgLSBmaWxlOiBPcHRpb25hbC4gVGhlIGdlbmVyYXRlZCBmaWxlIHRoaXMgc291cmNlIG1hcCBpcyBhc3NvY2lhdGVkIHdpdGguXG4gKlxuICogSGVyZSBpcyBhbiBleGFtcGxlIHNvdXJjZSBtYXAsIHRha2VuIGZyb20gdGhlIHNvdXJjZSBtYXAgc3BlY1swXTpcbiAqXG4gKiAgICAge1xuICogICAgICAgdmVyc2lvbiA6IDMsXG4gKiAgICAgICBmaWxlOiBcIm91dC5qc1wiLFxuICogICAgICAgc291cmNlUm9vdCA6IFwiXCIsXG4gKiAgICAgICBzb3VyY2VzOiBbXCJmb28uanNcIiwgXCJiYXIuanNcIl0sXG4gKiAgICAgICBuYW1lczogW1wic3JjXCIsIFwibWFwc1wiLCBcImFyZVwiLCBcImZ1blwiXSxcbiAqICAgICAgIG1hcHBpbmdzOiBcIkFBLEFCOztBQkNERTtcIlxuICogICAgIH1cbiAqXG4gKiBbMF06IGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL2RvY3VtZW50L2QvMVUxUkdBZWhRd1J5cFVUb3ZGMUtSbHBpT0Z6ZTBiLV8yZ2M2ZkFIMEtZMGsvZWRpdD9wbGk9MSNcbiAqL1xuZnVuY3Rpb24gQmFzaWNTb3VyY2VNYXBDb25zdW1lcihhU291cmNlTWFwKSB7XG4gIHZhciBzb3VyY2VNYXAgPSBhU291cmNlTWFwO1xuICBpZiAodHlwZW9mIGFTb3VyY2VNYXAgPT09ICdzdHJpbmcnKSB7XG4gICAgc291cmNlTWFwID0gSlNPTi5wYXJzZShhU291cmNlTWFwLnJlcGxhY2UoL15cXClcXF1cXH0nLywgJycpKTtcbiAgfVxuXG4gIHZhciB2ZXJzaW9uID0gdXRpbC5nZXRBcmcoc291cmNlTWFwLCAndmVyc2lvbicpO1xuICB2YXIgc291cmNlcyA9IHV0aWwuZ2V0QXJnKHNvdXJjZU1hcCwgJ3NvdXJjZXMnKTtcbiAgLy8gU2FzcyAzLjMgbGVhdmVzIG91dCB0aGUgJ25hbWVzJyBhcnJheSwgc28gd2UgZGV2aWF0ZSBmcm9tIHRoZSBzcGVjICh3aGljaFxuICAvLyByZXF1aXJlcyB0aGUgYXJyYXkpIHRvIHBsYXkgbmljZSBoZXJlLlxuICB2YXIgbmFtZXMgPSB1dGlsLmdldEFyZyhzb3VyY2VNYXAsICduYW1lcycsIFtdKTtcbiAgdmFyIHNvdXJjZVJvb3QgPSB1dGlsLmdldEFyZyhzb3VyY2VNYXAsICdzb3VyY2VSb290JywgbnVsbCk7XG4gIHZhciBzb3VyY2VzQ29udGVudCA9IHV0aWwuZ2V0QXJnKHNvdXJjZU1hcCwgJ3NvdXJjZXNDb250ZW50JywgbnVsbCk7XG4gIHZhciBtYXBwaW5ncyA9IHV0aWwuZ2V0QXJnKHNvdXJjZU1hcCwgJ21hcHBpbmdzJyk7XG4gIHZhciBmaWxlID0gdXRpbC5nZXRBcmcoc291cmNlTWFwLCAnZmlsZScsIG51bGwpO1xuXG4gIC8vIE9uY2UgYWdhaW4sIFNhc3MgZGV2aWF0ZXMgZnJvbSB0aGUgc3BlYyBhbmQgc3VwcGxpZXMgdGhlIHZlcnNpb24gYXMgYVxuICAvLyBzdHJpbmcgcmF0aGVyIHRoYW4gYSBudW1iZXIsIHNvIHdlIHVzZSBsb29zZSBlcXVhbGl0eSBjaGVja2luZyBoZXJlLlxuICBpZiAodmVyc2lvbiAhPSB0aGlzLl92ZXJzaW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCB2ZXJzaW9uOiAnICsgdmVyc2lvbik7XG4gIH1cblxuICBzb3VyY2VzID0gc291cmNlc1xuICAgIC5tYXAoU3RyaW5nKVxuICAgIC8vIFNvbWUgc291cmNlIG1hcHMgcHJvZHVjZSByZWxhdGl2ZSBzb3VyY2UgcGF0aHMgbGlrZSBcIi4vZm9vLmpzXCIgaW5zdGVhZCBvZlxuICAgIC8vIFwiZm9vLmpzXCIuICBOb3JtYWxpemUgdGhlc2UgZmlyc3Qgc28gdGhhdCBmdXR1cmUgY29tcGFyaXNvbnMgd2lsbCBzdWNjZWVkLlxuICAgIC8vIFNlZSBidWd6aWwubGEvMTA5MDc2OC5cbiAgICAubWFwKHV0aWwubm9ybWFsaXplKVxuICAgIC8vIEFsd2F5cyBlbnN1cmUgdGhhdCBhYnNvbHV0ZSBzb3VyY2VzIGFyZSBpbnRlcm5hbGx5IHN0b3JlZCByZWxhdGl2ZSB0b1xuICAgIC8vIHRoZSBzb3VyY2Ugcm9vdCwgaWYgdGhlIHNvdXJjZSByb290IGlzIGFic29sdXRlLiBOb3QgZG9pbmcgdGhpcyB3b3VsZFxuICAgIC8vIGJlIHBhcnRpY3VsYXJseSBwcm9ibGVtYXRpYyB3aGVuIHRoZSBzb3VyY2Ugcm9vdCBpcyBhIHByZWZpeCBvZiB0aGVcbiAgICAvLyBzb3VyY2UgKHZhbGlkLCBidXQgd2h5Pz8pLiBTZWUgZ2l0aHViIGlzc3VlICMxOTkgYW5kIGJ1Z3ppbC5sYS8xMTg4OTgyLlxuICAgIC5tYXAoZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgICAgcmV0dXJuIHNvdXJjZVJvb3QgJiYgdXRpbC5pc0Fic29sdXRlKHNvdXJjZVJvb3QpICYmIHV0aWwuaXNBYnNvbHV0ZShzb3VyY2UpXG4gICAgICAgID8gdXRpbC5yZWxhdGl2ZShzb3VyY2VSb290LCBzb3VyY2UpXG4gICAgICAgIDogc291cmNlO1xuICAgIH0pO1xuXG4gIC8vIFBhc3MgYHRydWVgIGJlbG93IHRvIGFsbG93IGR1cGxpY2F0ZSBuYW1lcyBhbmQgc291cmNlcy4gV2hpbGUgc291cmNlIG1hcHNcbiAgLy8gYXJlIGludGVuZGVkIHRvIGJlIGNvbXByZXNzZWQgYW5kIGRlZHVwbGljYXRlZCwgdGhlIFR5cGVTY3JpcHQgY29tcGlsZXJcbiAgLy8gc29tZXRpbWVzIGdlbmVyYXRlcyBzb3VyY2UgbWFwcyB3aXRoIGR1cGxpY2F0ZXMgaW4gdGhlbS4gU2VlIEdpdGh1YiBpc3N1ZVxuICAvLyAjNzIgYW5kIGJ1Z3ppbC5sYS84ODk0OTIuXG4gIHRoaXMuX25hbWVzID0gQXJyYXlTZXQuZnJvbUFycmF5KG5hbWVzLm1hcChTdHJpbmcpLCB0cnVlKTtcbiAgdGhpcy5fc291cmNlcyA9IEFycmF5U2V0LmZyb21BcnJheShzb3VyY2VzLCB0cnVlKTtcblxuICB0aGlzLnNvdXJjZVJvb3QgPSBzb3VyY2VSb290O1xuICB0aGlzLnNvdXJjZXNDb250ZW50ID0gc291cmNlc0NvbnRlbnQ7XG4gIHRoaXMuX21hcHBpbmdzID0gbWFwcGluZ3M7XG4gIHRoaXMuZmlsZSA9IGZpbGU7XG59XG5cbkJhc2ljU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUpO1xuQmFzaWNTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuY29uc3VtZXIgPSBTb3VyY2VNYXBDb25zdW1lcjtcblxuLyoqXG4gKiBDcmVhdGUgYSBCYXNpY1NvdXJjZU1hcENvbnN1bWVyIGZyb20gYSBTb3VyY2VNYXBHZW5lcmF0b3IuXG4gKlxuICogQHBhcmFtIFNvdXJjZU1hcEdlbmVyYXRvciBhU291cmNlTWFwXG4gKiAgICAgICAgVGhlIHNvdXJjZSBtYXAgdGhhdCB3aWxsIGJlIGNvbnN1bWVkLlxuICogQHJldHVybnMgQmFzaWNTb3VyY2VNYXBDb25zdW1lclxuICovXG5CYXNpY1NvdXJjZU1hcENvbnN1bWVyLmZyb21Tb3VyY2VNYXAgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBDb25zdW1lcl9mcm9tU291cmNlTWFwKGFTb3VyY2VNYXApIHtcbiAgICB2YXIgc21jID0gT2JqZWN0LmNyZWF0ZShCYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZSk7XG5cbiAgICB2YXIgbmFtZXMgPSBzbWMuX25hbWVzID0gQXJyYXlTZXQuZnJvbUFycmF5KGFTb3VyY2VNYXAuX25hbWVzLnRvQXJyYXkoKSwgdHJ1ZSk7XG4gICAgdmFyIHNvdXJjZXMgPSBzbWMuX3NvdXJjZXMgPSBBcnJheVNldC5mcm9tQXJyYXkoYVNvdXJjZU1hcC5fc291cmNlcy50b0FycmF5KCksIHRydWUpO1xuICAgIHNtYy5zb3VyY2VSb290ID0gYVNvdXJjZU1hcC5fc291cmNlUm9vdDtcbiAgICBzbWMuc291cmNlc0NvbnRlbnQgPSBhU291cmNlTWFwLl9nZW5lcmF0ZVNvdXJjZXNDb250ZW50KHNtYy5fc291cmNlcy50b0FycmF5KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbWMuc291cmNlUm9vdCk7XG4gICAgc21jLmZpbGUgPSBhU291cmNlTWFwLl9maWxlO1xuXG4gICAgLy8gQmVjYXVzZSB3ZSBhcmUgbW9kaWZ5aW5nIHRoZSBlbnRyaWVzIChieSBjb252ZXJ0aW5nIHN0cmluZyBzb3VyY2VzIGFuZFxuICAgIC8vIG5hbWVzIHRvIGluZGljZXMgaW50byB0aGUgc291cmNlcyBhbmQgbmFtZXMgQXJyYXlTZXRzKSwgd2UgaGF2ZSB0byBtYWtlXG4gICAgLy8gYSBjb3B5IG9mIHRoZSBlbnRyeSBvciBlbHNlIGJhZCB0aGluZ3MgaGFwcGVuLiBTaGFyZWQgbXV0YWJsZSBzdGF0ZVxuICAgIC8vIHN0cmlrZXMgYWdhaW4hIFNlZSBnaXRodWIgaXNzdWUgIzE5MS5cblxuICAgIHZhciBnZW5lcmF0ZWRNYXBwaW5ncyA9IGFTb3VyY2VNYXAuX21hcHBpbmdzLnRvQXJyYXkoKS5zbGljZSgpO1xuICAgIHZhciBkZXN0R2VuZXJhdGVkTWFwcGluZ3MgPSBzbWMuX19nZW5lcmF0ZWRNYXBwaW5ncyA9IFtdO1xuICAgIHZhciBkZXN0T3JpZ2luYWxNYXBwaW5ncyA9IHNtYy5fX29yaWdpbmFsTWFwcGluZ3MgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZW5lcmF0ZWRNYXBwaW5ncy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNyY01hcHBpbmcgPSBnZW5lcmF0ZWRNYXBwaW5nc1tpXTtcbiAgICAgIHZhciBkZXN0TWFwcGluZyA9IG5ldyBNYXBwaW5nO1xuICAgICAgZGVzdE1hcHBpbmcuZ2VuZXJhdGVkTGluZSA9IHNyY01hcHBpbmcuZ2VuZXJhdGVkTGluZTtcbiAgICAgIGRlc3RNYXBwaW5nLmdlbmVyYXRlZENvbHVtbiA9IHNyY01hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uO1xuXG4gICAgICBpZiAoc3JjTWFwcGluZy5zb3VyY2UpIHtcbiAgICAgICAgZGVzdE1hcHBpbmcuc291cmNlID0gc291cmNlcy5pbmRleE9mKHNyY01hcHBpbmcuc291cmNlKTtcbiAgICAgICAgZGVzdE1hcHBpbmcub3JpZ2luYWxMaW5lID0gc3JjTWFwcGluZy5vcmlnaW5hbExpbmU7XG4gICAgICAgIGRlc3RNYXBwaW5nLm9yaWdpbmFsQ29sdW1uID0gc3JjTWFwcGluZy5vcmlnaW5hbENvbHVtbjtcblxuICAgICAgICBpZiAoc3JjTWFwcGluZy5uYW1lKSB7XG4gICAgICAgICAgZGVzdE1hcHBpbmcubmFtZSA9IG5hbWVzLmluZGV4T2Yoc3JjTWFwcGluZy5uYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlc3RPcmlnaW5hbE1hcHBpbmdzLnB1c2goZGVzdE1hcHBpbmcpO1xuICAgICAgfVxuXG4gICAgICBkZXN0R2VuZXJhdGVkTWFwcGluZ3MucHVzaChkZXN0TWFwcGluZyk7XG4gICAgfVxuXG4gICAgcXVpY2tTb3J0KHNtYy5fX29yaWdpbmFsTWFwcGluZ3MsIHV0aWwuY29tcGFyZUJ5T3JpZ2luYWxQb3NpdGlvbnMpO1xuXG4gICAgcmV0dXJuIHNtYztcbiAgfTtcblxuLyoqXG4gKiBUaGUgdmVyc2lvbiBvZiB0aGUgc291cmNlIG1hcHBpbmcgc3BlYyB0aGF0IHdlIGFyZSBjb25zdW1pbmcuXG4gKi9cbkJhc2ljU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLl92ZXJzaW9uID0gMztcblxuLyoqXG4gKiBUaGUgbGlzdCBvZiBvcmlnaW5hbCBzb3VyY2VzLlxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQmFzaWNTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUsICdzb3VyY2VzJywge1xuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fc291cmNlcy50b0FycmF5KCkubWFwKGZ1bmN0aW9uIChzKSB7XG4gICAgICByZXR1cm4gdGhpcy5zb3VyY2VSb290ICE9IG51bGwgPyB1dGlsLmpvaW4odGhpcy5zb3VyY2VSb290LCBzKSA6IHM7XG4gICAgfSwgdGhpcyk7XG4gIH1cbn0pO1xuXG4vKipcbiAqIFByb3ZpZGUgdGhlIEpJVCB3aXRoIGEgbmljZSBzaGFwZSAvIGhpZGRlbiBjbGFzcy5cbiAqL1xuZnVuY3Rpb24gTWFwcGluZygpIHtcbiAgdGhpcy5nZW5lcmF0ZWRMaW5lID0gMDtcbiAgdGhpcy5nZW5lcmF0ZWRDb2x1bW4gPSAwO1xuICB0aGlzLnNvdXJjZSA9IG51bGw7XG4gIHRoaXMub3JpZ2luYWxMaW5lID0gbnVsbDtcbiAgdGhpcy5vcmlnaW5hbENvbHVtbiA9IG51bGw7XG4gIHRoaXMubmFtZSA9IG51bGw7XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIG1hcHBpbmdzIGluIGEgc3RyaW5nIGluIHRvIGEgZGF0YSBzdHJ1Y3R1cmUgd2hpY2ggd2UgY2FuIGVhc2lseVxuICogcXVlcnkgKHRoZSBvcmRlcmVkIGFycmF5cyBpbiB0aGUgYHRoaXMuX19nZW5lcmF0ZWRNYXBwaW5nc2AgYW5kXG4gKiBgdGhpcy5fX29yaWdpbmFsTWFwcGluZ3NgIHByb3BlcnRpZXMpLlxuICovXG5CYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5fcGFyc2VNYXBwaW5ncyA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcENvbnN1bWVyX3BhcnNlTWFwcGluZ3MoYVN0ciwgYVNvdXJjZVJvb3QpIHtcbiAgICB2YXIgZ2VuZXJhdGVkTGluZSA9IDE7XG4gICAgdmFyIHByZXZpb3VzR2VuZXJhdGVkQ29sdW1uID0gMDtcbiAgICB2YXIgcHJldmlvdXNPcmlnaW5hbExpbmUgPSAwO1xuICAgIHZhciBwcmV2aW91c09yaWdpbmFsQ29sdW1uID0gMDtcbiAgICB2YXIgcHJldmlvdXNTb3VyY2UgPSAwO1xuICAgIHZhciBwcmV2aW91c05hbWUgPSAwO1xuICAgIHZhciBsZW5ndGggPSBhU3RyLmxlbmd0aDtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBjYWNoZWRTZWdtZW50cyA9IHt9O1xuICAgIHZhciB0ZW1wID0ge307XG4gICAgdmFyIG9yaWdpbmFsTWFwcGluZ3MgPSBbXTtcbiAgICB2YXIgZ2VuZXJhdGVkTWFwcGluZ3MgPSBbXTtcbiAgICB2YXIgbWFwcGluZywgc3RyLCBzZWdtZW50LCBlbmQsIHZhbHVlO1xuXG4gICAgd2hpbGUgKGluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBpZiAoYVN0ci5jaGFyQXQoaW5kZXgpID09PSAnOycpIHtcbiAgICAgICAgZ2VuZXJhdGVkTGluZSsrO1xuICAgICAgICBpbmRleCsrO1xuICAgICAgICBwcmV2aW91c0dlbmVyYXRlZENvbHVtbiA9IDA7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChhU3RyLmNoYXJBdChpbmRleCkgPT09ICcsJykge1xuICAgICAgICBpbmRleCsrO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIG1hcHBpbmcgPSBuZXcgTWFwcGluZygpO1xuICAgICAgICBtYXBwaW5nLmdlbmVyYXRlZExpbmUgPSBnZW5lcmF0ZWRMaW5lO1xuXG4gICAgICAgIC8vIEJlY2F1c2UgZWFjaCBvZmZzZXQgaXMgZW5jb2RlZCByZWxhdGl2ZSB0byB0aGUgcHJldmlvdXMgb25lLFxuICAgICAgICAvLyBtYW55IHNlZ21lbnRzIG9mdGVuIGhhdmUgdGhlIHNhbWUgZW5jb2RpbmcuIFdlIGNhbiBleHBsb2l0IHRoaXNcbiAgICAgICAgLy8gZmFjdCBieSBjYWNoaW5nIHRoZSBwYXJzZWQgdmFyaWFibGUgbGVuZ3RoIGZpZWxkcyBvZiBlYWNoIHNlZ21lbnQsXG4gICAgICAgIC8vIGFsbG93aW5nIHVzIHRvIGF2b2lkIGEgc2Vjb25kIHBhcnNlIGlmIHdlIGVuY291bnRlciB0aGUgc2FtZVxuICAgICAgICAvLyBzZWdtZW50IGFnYWluLlxuICAgICAgICBmb3IgKGVuZCA9IGluZGV4OyBlbmQgPCBsZW5ndGg7IGVuZCsrKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX2NoYXJJc01hcHBpbmdTZXBhcmF0b3IoYVN0ciwgZW5kKSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0ciA9IGFTdHIuc2xpY2UoaW5kZXgsIGVuZCk7XG5cbiAgICAgICAgc2VnbWVudCA9IGNhY2hlZFNlZ21lbnRzW3N0cl07XG4gICAgICAgIGlmIChzZWdtZW50KSB7XG4gICAgICAgICAgaW5kZXggKz0gc3RyLmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWdtZW50ID0gW107XG4gICAgICAgICAgd2hpbGUgKGluZGV4IDwgZW5kKSB7XG4gICAgICAgICAgICBiYXNlNjRWTFEuZGVjb2RlKGFTdHIsIGluZGV4LCB0ZW1wKTtcbiAgICAgICAgICAgIHZhbHVlID0gdGVtcC52YWx1ZTtcbiAgICAgICAgICAgIGluZGV4ID0gdGVtcC5yZXN0O1xuICAgICAgICAgICAgc2VnbWVudC5wdXNoKHZhbHVlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VnbWVudC5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRm91bmQgYSBzb3VyY2UsIGJ1dCBubyBsaW5lIGFuZCBjb2x1bW4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VnbWVudC5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRm91bmQgYSBzb3VyY2UgYW5kIGxpbmUsIGJ1dCBubyBjb2x1bW4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjYWNoZWRTZWdtZW50c1tzdHJdID0gc2VnbWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdlbmVyYXRlZCBjb2x1bW4uXG4gICAgICAgIG1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uID0gcHJldmlvdXNHZW5lcmF0ZWRDb2x1bW4gKyBzZWdtZW50WzBdO1xuICAgICAgICBwcmV2aW91c0dlbmVyYXRlZENvbHVtbiA9IG1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uO1xuXG4gICAgICAgIGlmIChzZWdtZW50Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAvLyBPcmlnaW5hbCBzb3VyY2UuXG4gICAgICAgICAgbWFwcGluZy5zb3VyY2UgPSBwcmV2aW91c1NvdXJjZSArIHNlZ21lbnRbMV07XG4gICAgICAgICAgcHJldmlvdXNTb3VyY2UgKz0gc2VnbWVudFsxXTtcblxuICAgICAgICAgIC8vIE9yaWdpbmFsIGxpbmUuXG4gICAgICAgICAgbWFwcGluZy5vcmlnaW5hbExpbmUgPSBwcmV2aW91c09yaWdpbmFsTGluZSArIHNlZ21lbnRbMl07XG4gICAgICAgICAgcHJldmlvdXNPcmlnaW5hbExpbmUgPSBtYXBwaW5nLm9yaWdpbmFsTGluZTtcbiAgICAgICAgICAvLyBMaW5lcyBhcmUgc3RvcmVkIDAtYmFzZWRcbiAgICAgICAgICBtYXBwaW5nLm9yaWdpbmFsTGluZSArPSAxO1xuXG4gICAgICAgICAgLy8gT3JpZ2luYWwgY29sdW1uLlxuICAgICAgICAgIG1hcHBpbmcub3JpZ2luYWxDb2x1bW4gPSBwcmV2aW91c09yaWdpbmFsQ29sdW1uICsgc2VnbWVudFszXTtcbiAgICAgICAgICBwcmV2aW91c09yaWdpbmFsQ29sdW1uID0gbWFwcGluZy5vcmlnaW5hbENvbHVtbjtcblxuICAgICAgICAgIGlmIChzZWdtZW50Lmxlbmd0aCA+IDQpIHtcbiAgICAgICAgICAgIC8vIE9yaWdpbmFsIG5hbWUuXG4gICAgICAgICAgICBtYXBwaW5nLm5hbWUgPSBwcmV2aW91c05hbWUgKyBzZWdtZW50WzRdO1xuICAgICAgICAgICAgcHJldmlvdXNOYW1lICs9IHNlZ21lbnRbNF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZ2VuZXJhdGVkTWFwcGluZ3MucHVzaChtYXBwaW5nKTtcbiAgICAgICAgaWYgKHR5cGVvZiBtYXBwaW5nLm9yaWdpbmFsTGluZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBvcmlnaW5hbE1hcHBpbmdzLnB1c2gobWFwcGluZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBxdWlja1NvcnQoZ2VuZXJhdGVkTWFwcGluZ3MsIHV0aWwuY29tcGFyZUJ5R2VuZXJhdGVkUG9zaXRpb25zRGVmbGF0ZWQpO1xuICAgIHRoaXMuX19nZW5lcmF0ZWRNYXBwaW5ncyA9IGdlbmVyYXRlZE1hcHBpbmdzO1xuXG4gICAgcXVpY2tTb3J0KG9yaWdpbmFsTWFwcGluZ3MsIHV0aWwuY29tcGFyZUJ5T3JpZ2luYWxQb3NpdGlvbnMpO1xuICAgIHRoaXMuX19vcmlnaW5hbE1hcHBpbmdzID0gb3JpZ2luYWxNYXBwaW5ncztcbiAgfTtcblxuLyoqXG4gKiBGaW5kIHRoZSBtYXBwaW5nIHRoYXQgYmVzdCBtYXRjaGVzIHRoZSBoeXBvdGhldGljYWwgXCJuZWVkbGVcIiBtYXBwaW5nIHRoYXRcbiAqIHdlIGFyZSBzZWFyY2hpbmcgZm9yIGluIHRoZSBnaXZlbiBcImhheXN0YWNrXCIgb2YgbWFwcGluZ3MuXG4gKi9cbkJhc2ljU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLl9maW5kTWFwcGluZyA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcENvbnN1bWVyX2ZpbmRNYXBwaW5nKGFOZWVkbGUsIGFNYXBwaW5ncywgYUxpbmVOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhQ29sdW1uTmFtZSwgYUNvbXBhcmF0b3IsIGFCaWFzKSB7XG4gICAgLy8gVG8gcmV0dXJuIHRoZSBwb3NpdGlvbiB3ZSBhcmUgc2VhcmNoaW5nIGZvciwgd2UgbXVzdCBmaXJzdCBmaW5kIHRoZVxuICAgIC8vIG1hcHBpbmcgZm9yIHRoZSBnaXZlbiBwb3NpdGlvbiBhbmQgdGhlbiByZXR1cm4gdGhlIG9wcG9zaXRlIHBvc2l0aW9uIGl0XG4gICAgLy8gcG9pbnRzIHRvLiBCZWNhdXNlIHRoZSBtYXBwaW5ncyBhcmUgc29ydGVkLCB3ZSBjYW4gdXNlIGJpbmFyeSBzZWFyY2ggdG9cbiAgICAvLyBmaW5kIHRoZSBiZXN0IG1hcHBpbmcuXG5cbiAgICBpZiAoYU5lZWRsZVthTGluZU5hbWVdIDw9IDApIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0xpbmUgbXVzdCBiZSBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gMSwgZ290ICdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKyBhTmVlZGxlW2FMaW5lTmFtZV0pO1xuICAgIH1cbiAgICBpZiAoYU5lZWRsZVthQ29sdW1uTmFtZV0gPCAwKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDb2x1bW4gbXVzdCBiZSBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gMCwgZ290ICdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKyBhTmVlZGxlW2FDb2x1bW5OYW1lXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJpbmFyeVNlYXJjaC5zZWFyY2goYU5lZWRsZSwgYU1hcHBpbmdzLCBhQ29tcGFyYXRvciwgYUJpYXMpO1xuICB9O1xuXG4vKipcbiAqIENvbXB1dGUgdGhlIGxhc3QgY29sdW1uIGZvciBlYWNoIGdlbmVyYXRlZCBtYXBwaW5nLiBUaGUgbGFzdCBjb2x1bW4gaXNcbiAqIGluY2x1c2l2ZS5cbiAqL1xuQmFzaWNTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuY29tcHV0ZUNvbHVtblNwYW5zID1cbiAgZnVuY3Rpb24gU291cmNlTWFwQ29uc3VtZXJfY29tcHV0ZUNvbHVtblNwYW5zKCkge1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLl9nZW5lcmF0ZWRNYXBwaW5ncy5sZW5ndGg7ICsraW5kZXgpIHtcbiAgICAgIHZhciBtYXBwaW5nID0gdGhpcy5fZ2VuZXJhdGVkTWFwcGluZ3NbaW5kZXhdO1xuXG4gICAgICAvLyBNYXBwaW5ncyBkbyBub3QgY29udGFpbiBhIGZpZWxkIGZvciB0aGUgbGFzdCBnZW5lcmF0ZWQgY29sdW1udC4gV2VcbiAgICAgIC8vIGNhbiBjb21lIHVwIHdpdGggYW4gb3B0aW1pc3RpYyBlc3RpbWF0ZSwgaG93ZXZlciwgYnkgYXNzdW1pbmcgdGhhdFxuICAgICAgLy8gbWFwcGluZ3MgYXJlIGNvbnRpZ3VvdXMgKGkuZS4gZ2l2ZW4gdHdvIGNvbnNlY3V0aXZlIG1hcHBpbmdzLCB0aGVcbiAgICAgIC8vIGZpcnN0IG1hcHBpbmcgZW5kcyB3aGVyZSB0aGUgc2Vjb25kIG9uZSBzdGFydHMpLlxuICAgICAgaWYgKGluZGV4ICsgMSA8IHRoaXMuX2dlbmVyYXRlZE1hcHBpbmdzLmxlbmd0aCkge1xuICAgICAgICB2YXIgbmV4dE1hcHBpbmcgPSB0aGlzLl9nZW5lcmF0ZWRNYXBwaW5nc1tpbmRleCArIDFdO1xuXG4gICAgICAgIGlmIChtYXBwaW5nLmdlbmVyYXRlZExpbmUgPT09IG5leHRNYXBwaW5nLmdlbmVyYXRlZExpbmUpIHtcbiAgICAgICAgICBtYXBwaW5nLmxhc3RHZW5lcmF0ZWRDb2x1bW4gPSBuZXh0TWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4gLSAxO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSBsYXN0IG1hcHBpbmcgZm9yIGVhY2ggbGluZSBzcGFucyB0aGUgZW50aXJlIGxpbmUuXG4gICAgICBtYXBwaW5nLmxhc3RHZW5lcmF0ZWRDb2x1bW4gPSBJbmZpbml0eTtcbiAgICB9XG4gIH07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgb3JpZ2luYWwgc291cmNlLCBsaW5lLCBhbmQgY29sdW1uIGluZm9ybWF0aW9uIGZvciB0aGUgZ2VuZXJhdGVkXG4gKiBzb3VyY2UncyBsaW5lIGFuZCBjb2x1bW4gcG9zaXRpb25zIHByb3ZpZGVkLiBUaGUgb25seSBhcmd1bWVudCBpcyBhbiBvYmplY3RcbiAqIHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBsaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UuXG4gKiAgIC0gY29sdW1uOiBUaGUgY29sdW1uIG51bWJlciBpbiB0aGUgZ2VuZXJhdGVkIHNvdXJjZS5cbiAqICAgLSBiaWFzOiBFaXRoZXIgJ1NvdXJjZU1hcENvbnN1bWVyLkdSRUFURVNUX0xPV0VSX0JPVU5EJyBvclxuICogICAgICdTb3VyY2VNYXBDb25zdW1lci5MRUFTVF9VUFBFUl9CT1VORCcuIFNwZWNpZmllcyB3aGV0aGVyIHRvIHJldHVybiB0aGVcbiAqICAgICBjbG9zZXN0IGVsZW1lbnQgdGhhdCBpcyBzbWFsbGVyIHRoYW4gb3IgZ3JlYXRlciB0aGFuIHRoZSBvbmUgd2UgYXJlXG4gKiAgICAgc2VhcmNoaW5nIGZvciwgcmVzcGVjdGl2ZWx5LCBpZiB0aGUgZXhhY3QgZWxlbWVudCBjYW5ub3QgYmUgZm91bmQuXG4gKiAgICAgRGVmYXVsdHMgdG8gJ1NvdXJjZU1hcENvbnN1bWVyLkdSRUFURVNUX0xPV0VSX0JPVU5EJy5cbiAqXG4gKiBhbmQgYW4gb2JqZWN0IGlzIHJldHVybmVkIHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBzb3VyY2U6IFRoZSBvcmlnaW5hbCBzb3VyY2UgZmlsZSwgb3IgbnVsbC5cbiAqICAgLSBsaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZSwgb3IgbnVsbC5cbiAqICAgLSBjb2x1bW46IFRoZSBjb2x1bW4gbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UsIG9yIG51bGwuXG4gKiAgIC0gbmFtZTogVGhlIG9yaWdpbmFsIGlkZW50aWZpZXIsIG9yIG51bGwuXG4gKi9cbkJhc2ljU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLm9yaWdpbmFsUG9zaXRpb25Gb3IgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBDb25zdW1lcl9vcmlnaW5hbFBvc2l0aW9uRm9yKGFBcmdzKSB7XG4gICAgdmFyIG5lZWRsZSA9IHtcbiAgICAgIGdlbmVyYXRlZExpbmU6IHV0aWwuZ2V0QXJnKGFBcmdzLCAnbGluZScpLFxuICAgICAgZ2VuZXJhdGVkQ29sdW1uOiB1dGlsLmdldEFyZyhhQXJncywgJ2NvbHVtbicpXG4gICAgfTtcblxuICAgIHZhciBpbmRleCA9IHRoaXMuX2ZpbmRNYXBwaW5nKFxuICAgICAgbmVlZGxlLFxuICAgICAgdGhpcy5fZ2VuZXJhdGVkTWFwcGluZ3MsXG4gICAgICBcImdlbmVyYXRlZExpbmVcIixcbiAgICAgIFwiZ2VuZXJhdGVkQ29sdW1uXCIsXG4gICAgICB1dGlsLmNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0RlZmxhdGVkLFxuICAgICAgdXRpbC5nZXRBcmcoYUFyZ3MsICdiaWFzJywgU291cmNlTWFwQ29uc3VtZXIuR1JFQVRFU1RfTE9XRVJfQk9VTkQpXG4gICAgKTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB2YXIgbWFwcGluZyA9IHRoaXMuX2dlbmVyYXRlZE1hcHBpbmdzW2luZGV4XTtcblxuICAgICAgaWYgKG1hcHBpbmcuZ2VuZXJhdGVkTGluZSA9PT0gbmVlZGxlLmdlbmVyYXRlZExpbmUpIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICdzb3VyY2UnLCBudWxsKTtcbiAgICAgICAgaWYgKHNvdXJjZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHNvdXJjZSA9IHRoaXMuX3NvdXJjZXMuYXQoc291cmNlKTtcbiAgICAgICAgICBpZiAodGhpcy5zb3VyY2VSb290ICE9IG51bGwpIHtcbiAgICAgICAgICAgIHNvdXJjZSA9IHV0aWwuam9pbih0aGlzLnNvdXJjZVJvb3QsIHNvdXJjZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBuYW1lID0gdXRpbC5nZXRBcmcobWFwcGluZywgJ25hbWUnLCBudWxsKTtcbiAgICAgICAgaWYgKG5hbWUgIT09IG51bGwpIHtcbiAgICAgICAgICBuYW1lID0gdGhpcy5fbmFtZXMuYXQobmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzb3VyY2U6IHNvdXJjZSxcbiAgICAgICAgICBsaW5lOiB1dGlsLmdldEFyZyhtYXBwaW5nLCAnb3JpZ2luYWxMaW5lJywgbnVsbCksXG4gICAgICAgICAgY29sdW1uOiB1dGlsLmdldEFyZyhtYXBwaW5nLCAnb3JpZ2luYWxDb2x1bW4nLCBudWxsKSxcbiAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHNvdXJjZTogbnVsbCxcbiAgICAgIGxpbmU6IG51bGwsXG4gICAgICBjb2x1bW46IG51bGwsXG4gICAgICBuYW1lOiBudWxsXG4gICAgfTtcbiAgfTtcblxuLyoqXG4gKiBSZXR1cm4gdHJ1ZSBpZiB3ZSBoYXZlIHRoZSBzb3VyY2UgY29udGVudCBmb3IgZXZlcnkgc291cmNlIGluIHRoZSBzb3VyY2VcbiAqIG1hcCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5CYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5oYXNDb250ZW50c09mQWxsU291cmNlcyA9XG4gIGZ1bmN0aW9uIEJhc2ljU291cmNlTWFwQ29uc3VtZXJfaGFzQ29udGVudHNPZkFsbFNvdXJjZXMoKSB7XG4gICAgaWYgKCF0aGlzLnNvdXJjZXNDb250ZW50KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNvdXJjZXNDb250ZW50Lmxlbmd0aCA+PSB0aGlzLl9zb3VyY2VzLnNpemUoKSAmJlxuICAgICAgIXRoaXMuc291cmNlc0NvbnRlbnQuc29tZShmdW5jdGlvbiAoc2MpIHsgcmV0dXJuIHNjID09IG51bGw7IH0pO1xuICB9O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG9yaWdpbmFsIHNvdXJjZSBjb250ZW50LiBUaGUgb25seSBhcmd1bWVudCBpcyB0aGUgdXJsIG9mIHRoZVxuICogb3JpZ2luYWwgc291cmNlIGZpbGUuIFJldHVybnMgbnVsbCBpZiBubyBvcmlnaW5hbCBzb3VyY2UgY29udGVudCBpc1xuICogYXZhaWxhYmxlLlxuICovXG5CYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5zb3VyY2VDb250ZW50Rm9yID1cbiAgZnVuY3Rpb24gU291cmNlTWFwQ29uc3VtZXJfc291cmNlQ29udGVudEZvcihhU291cmNlLCBudWxsT25NaXNzaW5nKSB7XG4gICAgaWYgKCF0aGlzLnNvdXJjZXNDb250ZW50KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zb3VyY2VSb290ICE9IG51bGwpIHtcbiAgICAgIGFTb3VyY2UgPSB1dGlsLnJlbGF0aXZlKHRoaXMuc291cmNlUm9vdCwgYVNvdXJjZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3NvdXJjZXMuaGFzKGFTb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zb3VyY2VzQ29udGVudFt0aGlzLl9zb3VyY2VzLmluZGV4T2YoYVNvdXJjZSldO1xuICAgIH1cblxuICAgIHZhciB1cmw7XG4gICAgaWYgKHRoaXMuc291cmNlUm9vdCAhPSBudWxsXG4gICAgICAgICYmICh1cmwgPSB1dGlsLnVybFBhcnNlKHRoaXMuc291cmNlUm9vdCkpKSB7XG4gICAgICAvLyBYWFg6IGZpbGU6Ly8gVVJJcyBhbmQgYWJzb2x1dGUgcGF0aHMgbGVhZCB0byB1bmV4cGVjdGVkIGJlaGF2aW9yIGZvclxuICAgICAgLy8gbWFueSB1c2Vycy4gV2UgY2FuIGhlbHAgdGhlbSBvdXQgd2hlbiB0aGV5IGV4cGVjdCBmaWxlOi8vIFVSSXMgdG9cbiAgICAgIC8vIGJlaGF2ZSBsaWtlIGl0IHdvdWxkIGlmIHRoZXkgd2VyZSBydW5uaW5nIGEgbG9jYWwgSFRUUCBzZXJ2ZXIuIFNlZVxuICAgICAgLy8gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9ODg1NTk3LlxuICAgICAgdmFyIGZpbGVVcmlBYnNQYXRoID0gYVNvdXJjZS5yZXBsYWNlKC9eZmlsZTpcXC9cXC8vLCBcIlwiKTtcbiAgICAgIGlmICh1cmwuc2NoZW1lID09IFwiZmlsZVwiXG4gICAgICAgICAgJiYgdGhpcy5fc291cmNlcy5oYXMoZmlsZVVyaUFic1BhdGgpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNvdXJjZXNDb250ZW50W3RoaXMuX3NvdXJjZXMuaW5kZXhPZihmaWxlVXJpQWJzUGF0aCldXG4gICAgICB9XG5cbiAgICAgIGlmICgoIXVybC5wYXRoIHx8IHVybC5wYXRoID09IFwiL1wiKVxuICAgICAgICAgICYmIHRoaXMuX3NvdXJjZXMuaGFzKFwiL1wiICsgYVNvdXJjZSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc291cmNlc0NvbnRlbnRbdGhpcy5fc291cmNlcy5pbmRleE9mKFwiL1wiICsgYVNvdXJjZSldO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCByZWN1cnNpdmVseSBmcm9tXG4gICAgLy8gSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5zb3VyY2VDb250ZW50Rm9yLiBJbiB0aGF0IGNhc2UsIHdlXG4gICAgLy8gZG9uJ3Qgd2FudCB0byB0aHJvdyBpZiB3ZSBjYW4ndCBmaW5kIHRoZSBzb3VyY2UgLSB3ZSBqdXN0IHdhbnQgdG9cbiAgICAvLyByZXR1cm4gbnVsbCwgc28gd2UgcHJvdmlkZSBhIGZsYWcgdG8gZXhpdCBncmFjZWZ1bGx5LlxuICAgIGlmIChudWxsT25NaXNzaW5nKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wiJyArIGFTb3VyY2UgKyAnXCIgaXMgbm90IGluIHRoZSBTb3VyY2VNYXAuJyk7XG4gICAgfVxuICB9O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGdlbmVyYXRlZCBsaW5lIGFuZCBjb2x1bW4gaW5mb3JtYXRpb24gZm9yIHRoZSBvcmlnaW5hbCBzb3VyY2UsXG4gKiBsaW5lLCBhbmQgY29sdW1uIHBvc2l0aW9ucyBwcm92aWRlZC4gVGhlIG9ubHkgYXJndW1lbnQgaXMgYW4gb2JqZWN0IHdpdGhcbiAqIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gc291cmNlOiBUaGUgZmlsZW5hbWUgb2YgdGhlIG9yaWdpbmFsIHNvdXJjZS5cbiAqICAgLSBsaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZS5cbiAqICAgLSBjb2x1bW46IFRoZSBjb2x1bW4gbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UuXG4gKiAgIC0gYmlhczogRWl0aGVyICdTb3VyY2VNYXBDb25zdW1lci5HUkVBVEVTVF9MT1dFUl9CT1VORCcgb3JcbiAqICAgICAnU291cmNlTWFwQ29uc3VtZXIuTEVBU1RfVVBQRVJfQk9VTkQnLiBTcGVjaWZpZXMgd2hldGhlciB0byByZXR1cm4gdGhlXG4gKiAgICAgY2xvc2VzdCBlbGVtZW50IHRoYXQgaXMgc21hbGxlciB0aGFuIG9yIGdyZWF0ZXIgdGhhbiB0aGUgb25lIHdlIGFyZVxuICogICAgIHNlYXJjaGluZyBmb3IsIHJlc3BlY3RpdmVseSwgaWYgdGhlIGV4YWN0IGVsZW1lbnQgY2Fubm90IGJlIGZvdW5kLlxuICogICAgIERlZmF1bHRzIHRvICdTb3VyY2VNYXBDb25zdW1lci5HUkVBVEVTVF9MT1dFUl9CT1VORCcuXG4gKlxuICogYW5kIGFuIG9iamVjdCBpcyByZXR1cm5lZCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gbGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBnZW5lcmF0ZWQgc291cmNlLCBvciBudWxsLlxuICogICAtIGNvbHVtbjogVGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UsIG9yIG51bGwuXG4gKi9cbkJhc2ljU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLmdlbmVyYXRlZFBvc2l0aW9uRm9yID1cbiAgZnVuY3Rpb24gU291cmNlTWFwQ29uc3VtZXJfZ2VuZXJhdGVkUG9zaXRpb25Gb3IoYUFyZ3MpIHtcbiAgICB2YXIgc291cmNlID0gdXRpbC5nZXRBcmcoYUFyZ3MsICdzb3VyY2UnKTtcbiAgICBpZiAodGhpcy5zb3VyY2VSb290ICE9IG51bGwpIHtcbiAgICAgIHNvdXJjZSA9IHV0aWwucmVsYXRpdmUodGhpcy5zb3VyY2VSb290LCBzb3VyY2UpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuX3NvdXJjZXMuaGFzKHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxpbmU6IG51bGwsXG4gICAgICAgIGNvbHVtbjogbnVsbCxcbiAgICAgICAgbGFzdENvbHVtbjogbnVsbFxuICAgICAgfTtcbiAgICB9XG4gICAgc291cmNlID0gdGhpcy5fc291cmNlcy5pbmRleE9mKHNvdXJjZSk7XG5cbiAgICB2YXIgbmVlZGxlID0ge1xuICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICBvcmlnaW5hbExpbmU6IHV0aWwuZ2V0QXJnKGFBcmdzLCAnbGluZScpLFxuICAgICAgb3JpZ2luYWxDb2x1bW46IHV0aWwuZ2V0QXJnKGFBcmdzLCAnY29sdW1uJylcbiAgICB9O1xuXG4gICAgdmFyIGluZGV4ID0gdGhpcy5fZmluZE1hcHBpbmcoXG4gICAgICBuZWVkbGUsXG4gICAgICB0aGlzLl9vcmlnaW5hbE1hcHBpbmdzLFxuICAgICAgXCJvcmlnaW5hbExpbmVcIixcbiAgICAgIFwib3JpZ2luYWxDb2x1bW5cIixcbiAgICAgIHV0aWwuY29tcGFyZUJ5T3JpZ2luYWxQb3NpdGlvbnMsXG4gICAgICB1dGlsLmdldEFyZyhhQXJncywgJ2JpYXMnLCBTb3VyY2VNYXBDb25zdW1lci5HUkVBVEVTVF9MT1dFUl9CT1VORClcbiAgICApO1xuXG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIHZhciBtYXBwaW5nID0gdGhpcy5fb3JpZ2luYWxNYXBwaW5nc1tpbmRleF07XG5cbiAgICAgIGlmIChtYXBwaW5nLnNvdXJjZSA9PT0gbmVlZGxlLnNvdXJjZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxpbmU6IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICdnZW5lcmF0ZWRMaW5lJywgbnVsbCksXG4gICAgICAgICAgY29sdW1uOiB1dGlsLmdldEFyZyhtYXBwaW5nLCAnZ2VuZXJhdGVkQ29sdW1uJywgbnVsbCksXG4gICAgICAgICAgbGFzdENvbHVtbjogdXRpbC5nZXRBcmcobWFwcGluZywgJ2xhc3RHZW5lcmF0ZWRDb2x1bW4nLCBudWxsKVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBsaW5lOiBudWxsLFxuICAgICAgY29sdW1uOiBudWxsLFxuICAgICAgbGFzdENvbHVtbjogbnVsbFxuICAgIH07XG4gIH07XG5cbmV4cG9ydHMuQmFzaWNTb3VyY2VNYXBDb25zdW1lciA9IEJhc2ljU291cmNlTWFwQ29uc3VtZXI7XG5cbi8qKlxuICogQW4gSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyIGluc3RhbmNlIHJlcHJlc2VudHMgYSBwYXJzZWQgc291cmNlIG1hcCB3aGljaFxuICogd2UgY2FuIHF1ZXJ5IGZvciBpbmZvcm1hdGlvbi4gSXQgZGlmZmVycyBmcm9tIEJhc2ljU291cmNlTWFwQ29uc3VtZXIgaW5cbiAqIHRoYXQgaXQgdGFrZXMgXCJpbmRleGVkXCIgc291cmNlIG1hcHMgKGkuZS4gb25lcyB3aXRoIGEgXCJzZWN0aW9uc1wiIGZpZWxkKSBhc1xuICogaW5wdXQuXG4gKlxuICogVGhlIG9ubHkgcGFyYW1ldGVyIGlzIGEgcmF3IHNvdXJjZSBtYXAgKGVpdGhlciBhcyBhIEpTT04gc3RyaW5nLCBvciBhbHJlYWR5XG4gKiBwYXJzZWQgdG8gYW4gb2JqZWN0KS4gQWNjb3JkaW5nIHRvIHRoZSBzcGVjIGZvciBpbmRleGVkIHNvdXJjZSBtYXBzLCB0aGV5XG4gKiBoYXZlIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcbiAqXG4gKiAgIC0gdmVyc2lvbjogV2hpY2ggdmVyc2lvbiBvZiB0aGUgc291cmNlIG1hcCBzcGVjIHRoaXMgbWFwIGlzIGZvbGxvd2luZy5cbiAqICAgLSBmaWxlOiBPcHRpb25hbC4gVGhlIGdlbmVyYXRlZCBmaWxlIHRoaXMgc291cmNlIG1hcCBpcyBhc3NvY2lhdGVkIHdpdGguXG4gKiAgIC0gc2VjdGlvbnM6IEEgbGlzdCBvZiBzZWN0aW9uIGRlZmluaXRpb25zLlxuICpcbiAqIEVhY2ggdmFsdWUgdW5kZXIgdGhlIFwic2VjdGlvbnNcIiBmaWVsZCBoYXMgdHdvIGZpZWxkczpcbiAqICAgLSBvZmZzZXQ6IFRoZSBvZmZzZXQgaW50byB0aGUgb3JpZ2luYWwgc3BlY2lmaWVkIGF0IHdoaWNoIHRoaXMgc2VjdGlvblxuICogICAgICAgYmVnaW5zIHRvIGFwcGx5LCBkZWZpbmVkIGFzIGFuIG9iamVjdCB3aXRoIGEgXCJsaW5lXCIgYW5kIFwiY29sdW1uXCJcbiAqICAgICAgIGZpZWxkLlxuICogICAtIG1hcDogQSBzb3VyY2UgbWFwIGRlZmluaXRpb24uIFRoaXMgc291cmNlIG1hcCBjb3VsZCBhbHNvIGJlIGluZGV4ZWQsXG4gKiAgICAgICBidXQgZG9lc24ndCBoYXZlIHRvIGJlLlxuICpcbiAqIEluc3RlYWQgb2YgdGhlIFwibWFwXCIgZmllbGQsIGl0J3MgYWxzbyBwb3NzaWJsZSB0byBoYXZlIGEgXCJ1cmxcIiBmaWVsZFxuICogc3BlY2lmeWluZyBhIFVSTCB0byByZXRyaWV2ZSBhIHNvdXJjZSBtYXAgZnJvbSwgYnV0IHRoYXQncyBjdXJyZW50bHlcbiAqIHVuc3VwcG9ydGVkLlxuICpcbiAqIEhlcmUncyBhbiBleGFtcGxlIHNvdXJjZSBtYXAsIHRha2VuIGZyb20gdGhlIHNvdXJjZSBtYXAgc3BlY1swXSwgYnV0XG4gKiBtb2RpZmllZCB0byBvbWl0IGEgc2VjdGlvbiB3aGljaCB1c2VzIHRoZSBcInVybFwiIGZpZWxkLlxuICpcbiAqICB7XG4gKiAgICB2ZXJzaW9uIDogMyxcbiAqICAgIGZpbGU6IFwiYXBwLmpzXCIsXG4gKiAgICBzZWN0aW9uczogW3tcbiAqICAgICAgb2Zmc2V0OiB7bGluZToxMDAsIGNvbHVtbjoxMH0sXG4gKiAgICAgIG1hcDoge1xuICogICAgICAgIHZlcnNpb24gOiAzLFxuICogICAgICAgIGZpbGU6IFwic2VjdGlvbi5qc1wiLFxuICogICAgICAgIHNvdXJjZXM6IFtcImZvby5qc1wiLCBcImJhci5qc1wiXSxcbiAqICAgICAgICBuYW1lczogW1wic3JjXCIsIFwibWFwc1wiLCBcImFyZVwiLCBcImZ1blwiXSxcbiAqICAgICAgICBtYXBwaW5nczogXCJBQUFBLEU7O0FCQ0RFO1wiXG4gKiAgICAgIH1cbiAqICAgIH1dLFxuICogIH1cbiAqXG4gKiBbMF06IGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL2RvY3VtZW50L2QvMVUxUkdBZWhRd1J5cFVUb3ZGMUtSbHBpT0Z6ZTBiLV8yZ2M2ZkFIMEtZMGsvZWRpdCNoZWFkaW5nPWguNTM1ZXMzeGVwcmd0XG4gKi9cbmZ1bmN0aW9uIEluZGV4ZWRTb3VyY2VNYXBDb25zdW1lcihhU291cmNlTWFwKSB7XG4gIHZhciBzb3VyY2VNYXAgPSBhU291cmNlTWFwO1xuICBpZiAodHlwZW9mIGFTb3VyY2VNYXAgPT09ICdzdHJpbmcnKSB7XG4gICAgc291cmNlTWFwID0gSlNPTi5wYXJzZShhU291cmNlTWFwLnJlcGxhY2UoL15cXClcXF1cXH0nLywgJycpKTtcbiAgfVxuXG4gIHZhciB2ZXJzaW9uID0gdXRpbC5nZXRBcmcoc291cmNlTWFwLCAndmVyc2lvbicpO1xuICB2YXIgc2VjdGlvbnMgPSB1dGlsLmdldEFyZyhzb3VyY2VNYXAsICdzZWN0aW9ucycpO1xuXG4gIGlmICh2ZXJzaW9uICE9IHRoaXMuX3ZlcnNpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIHZlcnNpb246ICcgKyB2ZXJzaW9uKTtcbiAgfVxuXG4gIHRoaXMuX3NvdXJjZXMgPSBuZXcgQXJyYXlTZXQoKTtcbiAgdGhpcy5fbmFtZXMgPSBuZXcgQXJyYXlTZXQoKTtcblxuICB2YXIgbGFzdE9mZnNldCA9IHtcbiAgICBsaW5lOiAtMSxcbiAgICBjb2x1bW46IDBcbiAgfTtcbiAgdGhpcy5fc2VjdGlvbnMgPSBzZWN0aW9ucy5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICBpZiAocy51cmwpIHtcbiAgICAgIC8vIFRoZSB1cmwgZmllbGQgd2lsbCByZXF1aXJlIHN1cHBvcnQgZm9yIGFzeW5jaHJvbmljaXR5LlxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL3NvdXJjZS1tYXAvaXNzdWVzLzE2XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N1cHBvcnQgZm9yIHVybCBmaWVsZCBpbiBzZWN0aW9ucyBub3QgaW1wbGVtZW50ZWQuJyk7XG4gICAgfVxuICAgIHZhciBvZmZzZXQgPSB1dGlsLmdldEFyZyhzLCAnb2Zmc2V0Jyk7XG4gICAgdmFyIG9mZnNldExpbmUgPSB1dGlsLmdldEFyZyhvZmZzZXQsICdsaW5lJyk7XG4gICAgdmFyIG9mZnNldENvbHVtbiA9IHV0aWwuZ2V0QXJnKG9mZnNldCwgJ2NvbHVtbicpO1xuXG4gICAgaWYgKG9mZnNldExpbmUgPCBsYXN0T2Zmc2V0LmxpbmUgfHxcbiAgICAgICAgKG9mZnNldExpbmUgPT09IGxhc3RPZmZzZXQubGluZSAmJiBvZmZzZXRDb2x1bW4gPCBsYXN0T2Zmc2V0LmNvbHVtbikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VjdGlvbiBvZmZzZXRzIG11c3QgYmUgb3JkZXJlZCBhbmQgbm9uLW92ZXJsYXBwaW5nLicpO1xuICAgIH1cbiAgICBsYXN0T2Zmc2V0ID0gb2Zmc2V0O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGdlbmVyYXRlZE9mZnNldDoge1xuICAgICAgICAvLyBUaGUgb2Zmc2V0IGZpZWxkcyBhcmUgMC1iYXNlZCwgYnV0IHdlIHVzZSAxLWJhc2VkIGluZGljZXMgd2hlblxuICAgICAgICAvLyBlbmNvZGluZy9kZWNvZGluZyBmcm9tIFZMUS5cbiAgICAgICAgZ2VuZXJhdGVkTGluZTogb2Zmc2V0TGluZSArIDEsXG4gICAgICAgIGdlbmVyYXRlZENvbHVtbjogb2Zmc2V0Q29sdW1uICsgMVxuICAgICAgfSxcbiAgICAgIGNvbnN1bWVyOiBuZXcgU291cmNlTWFwQ29uc3VtZXIodXRpbC5nZXRBcmcocywgJ21hcCcpKVxuICAgIH1cbiAgfSk7XG59XG5cbkluZGV4ZWRTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZSk7XG5JbmRleGVkU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU291cmNlTWFwQ29uc3VtZXI7XG5cbi8qKlxuICogVGhlIHZlcnNpb24gb2YgdGhlIHNvdXJjZSBtYXBwaW5nIHNwZWMgdGhhdCB3ZSBhcmUgY29uc3VtaW5nLlxuICovXG5JbmRleGVkU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLl92ZXJzaW9uID0gMztcblxuLyoqXG4gKiBUaGUgbGlzdCBvZiBvcmlnaW5hbCBzb3VyY2VzLlxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZSwgJ3NvdXJjZXMnLCB7XG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzb3VyY2VzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9zZWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLl9zZWN0aW9uc1tpXS5jb25zdW1lci5zb3VyY2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHNvdXJjZXMucHVzaCh0aGlzLl9zZWN0aW9uc1tpXS5jb25zdW1lci5zb3VyY2VzW2pdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZXM7XG4gIH1cbn0pO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG9yaWdpbmFsIHNvdXJjZSwgbGluZSwgYW5kIGNvbHVtbiBpbmZvcm1hdGlvbiBmb3IgdGhlIGdlbmVyYXRlZFxuICogc291cmNlJ3MgbGluZSBhbmQgY29sdW1uIHBvc2l0aW9ucyBwcm92aWRlZC4gVGhlIG9ubHkgYXJndW1lbnQgaXMgYW4gb2JqZWN0XG4gKiB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gbGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBnZW5lcmF0ZWQgc291cmNlLlxuICogICAtIGNvbHVtbjogVGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UuXG4gKlxuICogYW5kIGFuIG9iamVjdCBpcyByZXR1cm5lZCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gc291cmNlOiBUaGUgb3JpZ2luYWwgc291cmNlIGZpbGUsIG9yIG51bGwuXG4gKiAgIC0gbGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UsIG9yIG51bGwuXG4gKiAgIC0gY29sdW1uOiBUaGUgY29sdW1uIG51bWJlciBpbiB0aGUgb3JpZ2luYWwgc291cmNlLCBvciBudWxsLlxuICogICAtIG5hbWU6IFRoZSBvcmlnaW5hbCBpZGVudGlmaWVyLCBvciBudWxsLlxuICovXG5JbmRleGVkU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLm9yaWdpbmFsUG9zaXRpb25Gb3IgPVxuICBmdW5jdGlvbiBJbmRleGVkU291cmNlTWFwQ29uc3VtZXJfb3JpZ2luYWxQb3NpdGlvbkZvcihhQXJncykge1xuICAgIHZhciBuZWVkbGUgPSB7XG4gICAgICBnZW5lcmF0ZWRMaW5lOiB1dGlsLmdldEFyZyhhQXJncywgJ2xpbmUnKSxcbiAgICAgIGdlbmVyYXRlZENvbHVtbjogdXRpbC5nZXRBcmcoYUFyZ3MsICdjb2x1bW4nKVxuICAgIH07XG5cbiAgICAvLyBGaW5kIHRoZSBzZWN0aW9uIGNvbnRhaW5pbmcgdGhlIGdlbmVyYXRlZCBwb3NpdGlvbiB3ZSdyZSB0cnlpbmcgdG8gbWFwXG4gICAgLy8gdG8gYW4gb3JpZ2luYWwgcG9zaXRpb24uXG4gICAgdmFyIHNlY3Rpb25JbmRleCA9IGJpbmFyeVNlYXJjaC5zZWFyY2gobmVlZGxlLCB0aGlzLl9zZWN0aW9ucyxcbiAgICAgIGZ1bmN0aW9uKG5lZWRsZSwgc2VjdGlvbikge1xuICAgICAgICB2YXIgY21wID0gbmVlZGxlLmdlbmVyYXRlZExpbmUgLSBzZWN0aW9uLmdlbmVyYXRlZE9mZnNldC5nZW5lcmF0ZWRMaW5lO1xuICAgICAgICBpZiAoY21wKSB7XG4gICAgICAgICAgcmV0dXJuIGNtcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAobmVlZGxlLmdlbmVyYXRlZENvbHVtbiAtXG4gICAgICAgICAgICAgICAgc2VjdGlvbi5nZW5lcmF0ZWRPZmZzZXQuZ2VuZXJhdGVkQ29sdW1uKTtcbiAgICAgIH0pO1xuICAgIHZhciBzZWN0aW9uID0gdGhpcy5fc2VjdGlvbnNbc2VjdGlvbkluZGV4XTtcblxuICAgIGlmICghc2VjdGlvbikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc291cmNlOiBudWxsLFxuICAgICAgICBsaW5lOiBudWxsLFxuICAgICAgICBjb2x1bW46IG51bGwsXG4gICAgICAgIG5hbWU6IG51bGxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlY3Rpb24uY29uc3VtZXIub3JpZ2luYWxQb3NpdGlvbkZvcih7XG4gICAgICBsaW5lOiBuZWVkbGUuZ2VuZXJhdGVkTGluZSAtXG4gICAgICAgIChzZWN0aW9uLmdlbmVyYXRlZE9mZnNldC5nZW5lcmF0ZWRMaW5lIC0gMSksXG4gICAgICBjb2x1bW46IG5lZWRsZS5nZW5lcmF0ZWRDb2x1bW4gLVxuICAgICAgICAoc2VjdGlvbi5nZW5lcmF0ZWRPZmZzZXQuZ2VuZXJhdGVkTGluZSA9PT0gbmVlZGxlLmdlbmVyYXRlZExpbmVcbiAgICAgICAgID8gc2VjdGlvbi5nZW5lcmF0ZWRPZmZzZXQuZ2VuZXJhdGVkQ29sdW1uIC0gMVxuICAgICAgICAgOiAwKSxcbiAgICAgIGJpYXM6IGFBcmdzLmJpYXNcbiAgICB9KTtcbiAgfTtcblxuLyoqXG4gKiBSZXR1cm4gdHJ1ZSBpZiB3ZSBoYXZlIHRoZSBzb3VyY2UgY29udGVudCBmb3IgZXZlcnkgc291cmNlIGluIHRoZSBzb3VyY2VcbiAqIG1hcCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5JbmRleGVkU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLmhhc0NvbnRlbnRzT2ZBbGxTb3VyY2VzID1cbiAgZnVuY3Rpb24gSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyX2hhc0NvbnRlbnRzT2ZBbGxTb3VyY2VzKCkge1xuICAgIHJldHVybiB0aGlzLl9zZWN0aW9ucy5ldmVyeShmdW5jdGlvbiAocykge1xuICAgICAgcmV0dXJuIHMuY29uc3VtZXIuaGFzQ29udGVudHNPZkFsbFNvdXJjZXMoKTtcbiAgICB9KTtcbiAgfTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBvcmlnaW5hbCBzb3VyY2UgY29udGVudC4gVGhlIG9ubHkgYXJndW1lbnQgaXMgdGhlIHVybCBvZiB0aGVcbiAqIG9yaWdpbmFsIHNvdXJjZSBmaWxlLiBSZXR1cm5zIG51bGwgaWYgbm8gb3JpZ2luYWwgc291cmNlIGNvbnRlbnQgaXNcbiAqIGF2YWlsYWJsZS5cbiAqL1xuSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5zb3VyY2VDb250ZW50Rm9yID1cbiAgZnVuY3Rpb24gSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyX3NvdXJjZUNvbnRlbnRGb3IoYVNvdXJjZSwgbnVsbE9uTWlzc2luZykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fc2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzZWN0aW9uID0gdGhpcy5fc2VjdGlvbnNbaV07XG5cbiAgICAgIHZhciBjb250ZW50ID0gc2VjdGlvbi5jb25zdW1lci5zb3VyY2VDb250ZW50Rm9yKGFTb3VyY2UsIHRydWUpO1xuICAgICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChudWxsT25NaXNzaW5nKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wiJyArIGFTb3VyY2UgKyAnXCIgaXMgbm90IGluIHRoZSBTb3VyY2VNYXAuJyk7XG4gICAgfVxuICB9O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGdlbmVyYXRlZCBsaW5lIGFuZCBjb2x1bW4gaW5mb3JtYXRpb24gZm9yIHRoZSBvcmlnaW5hbCBzb3VyY2UsXG4gKiBsaW5lLCBhbmQgY29sdW1uIHBvc2l0aW9ucyBwcm92aWRlZC4gVGhlIG9ubHkgYXJndW1lbnQgaXMgYW4gb2JqZWN0IHdpdGhcbiAqIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gc291cmNlOiBUaGUgZmlsZW5hbWUgb2YgdGhlIG9yaWdpbmFsIHNvdXJjZS5cbiAqICAgLSBsaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZS5cbiAqICAgLSBjb2x1bW46IFRoZSBjb2x1bW4gbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UuXG4gKlxuICogYW5kIGFuIG9iamVjdCBpcyByZXR1cm5lZCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gbGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBnZW5lcmF0ZWQgc291cmNlLCBvciBudWxsLlxuICogICAtIGNvbHVtbjogVGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UsIG9yIG51bGwuXG4gKi9cbkluZGV4ZWRTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuZ2VuZXJhdGVkUG9zaXRpb25Gb3IgPVxuICBmdW5jdGlvbiBJbmRleGVkU291cmNlTWFwQ29uc3VtZXJfZ2VuZXJhdGVkUG9zaXRpb25Gb3IoYUFyZ3MpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3NlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc2VjdGlvbiA9IHRoaXMuX3NlY3Rpb25zW2ldO1xuXG4gICAgICAvLyBPbmx5IGNvbnNpZGVyIHRoaXMgc2VjdGlvbiBpZiB0aGUgcmVxdWVzdGVkIHNvdXJjZSBpcyBpbiB0aGUgbGlzdCBvZlxuICAgICAgLy8gc291cmNlcyBvZiB0aGUgY29uc3VtZXIuXG4gICAgICBpZiAoc2VjdGlvbi5jb25zdW1lci5zb3VyY2VzLmluZGV4T2YodXRpbC5nZXRBcmcoYUFyZ3MsICdzb3VyY2UnKSkgPT09IC0xKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdmFyIGdlbmVyYXRlZFBvc2l0aW9uID0gc2VjdGlvbi5jb25zdW1lci5nZW5lcmF0ZWRQb3NpdGlvbkZvcihhQXJncyk7XG4gICAgICBpZiAoZ2VuZXJhdGVkUG9zaXRpb24pIHtcbiAgICAgICAgdmFyIHJldCA9IHtcbiAgICAgICAgICBsaW5lOiBnZW5lcmF0ZWRQb3NpdGlvbi5saW5lICtcbiAgICAgICAgICAgIChzZWN0aW9uLmdlbmVyYXRlZE9mZnNldC5nZW5lcmF0ZWRMaW5lIC0gMSksXG4gICAgICAgICAgY29sdW1uOiBnZW5lcmF0ZWRQb3NpdGlvbi5jb2x1bW4gK1xuICAgICAgICAgICAgKHNlY3Rpb24uZ2VuZXJhdGVkT2Zmc2V0LmdlbmVyYXRlZExpbmUgPT09IGdlbmVyYXRlZFBvc2l0aW9uLmxpbmVcbiAgICAgICAgICAgICA/IHNlY3Rpb24uZ2VuZXJhdGVkT2Zmc2V0LmdlbmVyYXRlZENvbHVtbiAtIDFcbiAgICAgICAgICAgICA6IDApXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxpbmU6IG51bGwsXG4gICAgICBjb2x1bW46IG51bGxcbiAgICB9O1xuICB9O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBtYXBwaW5ncyBpbiBhIHN0cmluZyBpbiB0byBhIGRhdGEgc3RydWN0dXJlIHdoaWNoIHdlIGNhbiBlYXNpbHlcbiAqIHF1ZXJ5ICh0aGUgb3JkZXJlZCBhcnJheXMgaW4gdGhlIGB0aGlzLl9fZ2VuZXJhdGVkTWFwcGluZ3NgIGFuZFxuICogYHRoaXMuX19vcmlnaW5hbE1hcHBpbmdzYCBwcm9wZXJ0aWVzKS5cbiAqL1xuSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5fcGFyc2VNYXBwaW5ncyA9XG4gIGZ1bmN0aW9uIEluZGV4ZWRTb3VyY2VNYXBDb25zdW1lcl9wYXJzZU1hcHBpbmdzKGFTdHIsIGFTb3VyY2VSb290KSB7XG4gICAgdGhpcy5fX2dlbmVyYXRlZE1hcHBpbmdzID0gW107XG4gICAgdGhpcy5fX29yaWdpbmFsTWFwcGluZ3MgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3NlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc2VjdGlvbiA9IHRoaXMuX3NlY3Rpb25zW2ldO1xuICAgICAgdmFyIHNlY3Rpb25NYXBwaW5ncyA9IHNlY3Rpb24uY29uc3VtZXIuX2dlbmVyYXRlZE1hcHBpbmdzO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzZWN0aW9uTWFwcGluZ3MubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIG1hcHBpbmcgPSBzZWN0aW9uTWFwcGluZ3Nbal07XG5cbiAgICAgICAgdmFyIHNvdXJjZSA9IHNlY3Rpb24uY29uc3VtZXIuX3NvdXJjZXMuYXQobWFwcGluZy5zb3VyY2UpO1xuICAgICAgICBpZiAoc2VjdGlvbi5jb25zdW1lci5zb3VyY2VSb290ICE9PSBudWxsKSB7XG4gICAgICAgICAgc291cmNlID0gdXRpbC5qb2luKHNlY3Rpb24uY29uc3VtZXIuc291cmNlUm9vdCwgc291cmNlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zb3VyY2VzLmFkZChzb3VyY2UpO1xuICAgICAgICBzb3VyY2UgPSB0aGlzLl9zb3VyY2VzLmluZGV4T2Yoc291cmNlKTtcblxuICAgICAgICB2YXIgbmFtZSA9IHNlY3Rpb24uY29uc3VtZXIuX25hbWVzLmF0KG1hcHBpbmcubmFtZSk7XG4gICAgICAgIHRoaXMuX25hbWVzLmFkZChuYW1lKTtcbiAgICAgICAgbmFtZSA9IHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSk7XG5cbiAgICAgICAgLy8gVGhlIG1hcHBpbmdzIGNvbWluZyBmcm9tIHRoZSBjb25zdW1lciBmb3IgdGhlIHNlY3Rpb24gaGF2ZVxuICAgICAgICAvLyBnZW5lcmF0ZWQgcG9zaXRpb25zIHJlbGF0aXZlIHRvIHRoZSBzdGFydCBvZiB0aGUgc2VjdGlvbiwgc28gd2VcbiAgICAgICAgLy8gbmVlZCB0byBvZmZzZXQgdGhlbSB0byBiZSByZWxhdGl2ZSB0byB0aGUgc3RhcnQgb2YgdGhlIGNvbmNhdGVuYXRlZFxuICAgICAgICAvLyBnZW5lcmF0ZWQgZmlsZS5cbiAgICAgICAgdmFyIGFkanVzdGVkTWFwcGluZyA9IHtcbiAgICAgICAgICBzb3VyY2U6IHNvdXJjZSxcbiAgICAgICAgICBnZW5lcmF0ZWRMaW5lOiBtYXBwaW5nLmdlbmVyYXRlZExpbmUgK1xuICAgICAgICAgICAgKHNlY3Rpb24uZ2VuZXJhdGVkT2Zmc2V0LmdlbmVyYXRlZExpbmUgLSAxKSxcbiAgICAgICAgICBnZW5lcmF0ZWRDb2x1bW46IG1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uICtcbiAgICAgICAgICAgIChzZWN0aW9uLmdlbmVyYXRlZE9mZnNldC5nZW5lcmF0ZWRMaW5lID09PSBtYXBwaW5nLmdlbmVyYXRlZExpbmVcbiAgICAgICAgICAgID8gc2VjdGlvbi5nZW5lcmF0ZWRPZmZzZXQuZ2VuZXJhdGVkQ29sdW1uIC0gMVxuICAgICAgICAgICAgOiAwKSxcbiAgICAgICAgICBvcmlnaW5hbExpbmU6IG1hcHBpbmcub3JpZ2luYWxMaW5lLFxuICAgICAgICAgIG9yaWdpbmFsQ29sdW1uOiBtYXBwaW5nLm9yaWdpbmFsQ29sdW1uLFxuICAgICAgICAgIG5hbWU6IG5hbWVcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9fZ2VuZXJhdGVkTWFwcGluZ3MucHVzaChhZGp1c3RlZE1hcHBpbmcpO1xuICAgICAgICBpZiAodHlwZW9mIGFkanVzdGVkTWFwcGluZy5vcmlnaW5hbExpbmUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgdGhpcy5fX29yaWdpbmFsTWFwcGluZ3MucHVzaChhZGp1c3RlZE1hcHBpbmcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcXVpY2tTb3J0KHRoaXMuX19nZW5lcmF0ZWRNYXBwaW5ncywgdXRpbC5jb21wYXJlQnlHZW5lcmF0ZWRQb3NpdGlvbnNEZWZsYXRlZCk7XG4gICAgcXVpY2tTb3J0KHRoaXMuX19vcmlnaW5hbE1hcHBpbmdzLCB1dGlsLmNvbXBhcmVCeU9yaWdpbmFsUG9zaXRpb25zKTtcbiAgfTtcblxuZXhwb3J0cy5JbmRleGVkU291cmNlTWFwQ29uc3VtZXIgPSBJbmRleGVkU291cmNlTWFwQ29uc3VtZXI7XG4iLCIvKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTEgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5cbnZhciBiYXNlNjRWTFEgPSByZXF1aXJlKCcuL2Jhc2U2NC12bHEnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgQXJyYXlTZXQgPSByZXF1aXJlKCcuL2FycmF5LXNldCcpLkFycmF5U2V0O1xudmFyIE1hcHBpbmdMaXN0ID0gcmVxdWlyZSgnLi9tYXBwaW5nLWxpc3QnKS5NYXBwaW5nTGlzdDtcblxuLyoqXG4gKiBBbiBpbnN0YW5jZSBvZiB0aGUgU291cmNlTWFwR2VuZXJhdG9yIHJlcHJlc2VudHMgYSBzb3VyY2UgbWFwIHdoaWNoIGlzXG4gKiBiZWluZyBidWlsdCBpbmNyZW1lbnRhbGx5LiBZb3UgbWF5IHBhc3MgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZ1xuICogcHJvcGVydGllczpcbiAqXG4gKiAgIC0gZmlsZTogVGhlIGZpbGVuYW1lIG9mIHRoZSBnZW5lcmF0ZWQgc291cmNlLlxuICogICAtIHNvdXJjZVJvb3Q6IEEgcm9vdCBmb3IgYWxsIHJlbGF0aXZlIFVSTHMgaW4gdGhpcyBzb3VyY2UgbWFwLlxuICovXG5mdW5jdGlvbiBTb3VyY2VNYXBHZW5lcmF0b3IoYUFyZ3MpIHtcbiAgaWYgKCFhQXJncykge1xuICAgIGFBcmdzID0ge307XG4gIH1cbiAgdGhpcy5fZmlsZSA9IHV0aWwuZ2V0QXJnKGFBcmdzLCAnZmlsZScsIG51bGwpO1xuICB0aGlzLl9zb3VyY2VSb290ID0gdXRpbC5nZXRBcmcoYUFyZ3MsICdzb3VyY2VSb290JywgbnVsbCk7XG4gIHRoaXMuX3NraXBWYWxpZGF0aW9uID0gdXRpbC5nZXRBcmcoYUFyZ3MsICdza2lwVmFsaWRhdGlvbicsIGZhbHNlKTtcbiAgdGhpcy5fc291cmNlcyA9IG5ldyBBcnJheVNldCgpO1xuICB0aGlzLl9uYW1lcyA9IG5ldyBBcnJheVNldCgpO1xuICB0aGlzLl9tYXBwaW5ncyA9IG5ldyBNYXBwaW5nTGlzdCgpO1xuICB0aGlzLl9zb3VyY2VzQ29udGVudHMgPSBudWxsO1xufVxuXG5Tb3VyY2VNYXBHZW5lcmF0b3IucHJvdG90eXBlLl92ZXJzaW9uID0gMztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFNvdXJjZU1hcEdlbmVyYXRvciBiYXNlZCBvbiBhIFNvdXJjZU1hcENvbnN1bWVyXG4gKlxuICogQHBhcmFtIGFTb3VyY2VNYXBDb25zdW1lciBUaGUgU291cmNlTWFwLlxuICovXG5Tb3VyY2VNYXBHZW5lcmF0b3IuZnJvbVNvdXJjZU1hcCA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcEdlbmVyYXRvcl9mcm9tU291cmNlTWFwKGFTb3VyY2VNYXBDb25zdW1lcikge1xuICAgIHZhciBzb3VyY2VSb290ID0gYVNvdXJjZU1hcENvbnN1bWVyLnNvdXJjZVJvb3Q7XG4gICAgdmFyIGdlbmVyYXRvciA9IG5ldyBTb3VyY2VNYXBHZW5lcmF0b3Ioe1xuICAgICAgZmlsZTogYVNvdXJjZU1hcENvbnN1bWVyLmZpbGUsXG4gICAgICBzb3VyY2VSb290OiBzb3VyY2VSb290XG4gICAgfSk7XG4gICAgYVNvdXJjZU1hcENvbnN1bWVyLmVhY2hNYXBwaW5nKGZ1bmN0aW9uIChtYXBwaW5nKSB7XG4gICAgICB2YXIgbmV3TWFwcGluZyA9IHtcbiAgICAgICAgZ2VuZXJhdGVkOiB7XG4gICAgICAgICAgbGluZTogbWFwcGluZy5nZW5lcmF0ZWRMaW5lLFxuICAgICAgICAgIGNvbHVtbjogbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW5cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgaWYgKG1hcHBpbmcuc291cmNlICE9IG51bGwpIHtcbiAgICAgICAgbmV3TWFwcGluZy5zb3VyY2UgPSBtYXBwaW5nLnNvdXJjZTtcbiAgICAgICAgaWYgKHNvdXJjZVJvb3QgIT0gbnVsbCkge1xuICAgICAgICAgIG5ld01hcHBpbmcuc291cmNlID0gdXRpbC5yZWxhdGl2ZShzb3VyY2VSb290LCBuZXdNYXBwaW5nLnNvdXJjZSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZXdNYXBwaW5nLm9yaWdpbmFsID0ge1xuICAgICAgICAgIGxpbmU6IG1hcHBpbmcub3JpZ2luYWxMaW5lLFxuICAgICAgICAgIGNvbHVtbjogbWFwcGluZy5vcmlnaW5hbENvbHVtblxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChtYXBwaW5nLm5hbWUgIT0gbnVsbCkge1xuICAgICAgICAgIG5ld01hcHBpbmcubmFtZSA9IG1hcHBpbmcubmFtZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBnZW5lcmF0b3IuYWRkTWFwcGluZyhuZXdNYXBwaW5nKTtcbiAgICB9KTtcbiAgICBhU291cmNlTWFwQ29uc3VtZXIuc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uIChzb3VyY2VGaWxlKSB7XG4gICAgICB2YXIgY29udGVudCA9IGFTb3VyY2VNYXBDb25zdW1lci5zb3VyY2VDb250ZW50Rm9yKHNvdXJjZUZpbGUpO1xuICAgICAgaWYgKGNvbnRlbnQgIT0gbnVsbCkge1xuICAgICAgICBnZW5lcmF0b3Iuc2V0U291cmNlQ29udGVudChzb3VyY2VGaWxlLCBjb250ZW50KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9O1xuXG4vKipcbiAqIEFkZCBhIHNpbmdsZSBtYXBwaW5nIGZyb20gb3JpZ2luYWwgc291cmNlIGxpbmUgYW5kIGNvbHVtbiB0byB0aGUgZ2VuZXJhdGVkXG4gKiBzb3VyY2UncyBsaW5lIGFuZCBjb2x1bW4gZm9yIHRoaXMgc291cmNlIG1hcCBiZWluZyBjcmVhdGVkLiBUaGUgbWFwcGluZ1xuICogb2JqZWN0IHNob3VsZCBoYXZlIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gZ2VuZXJhdGVkOiBBbiBvYmplY3Qgd2l0aCB0aGUgZ2VuZXJhdGVkIGxpbmUgYW5kIGNvbHVtbiBwb3NpdGlvbnMuXG4gKiAgIC0gb3JpZ2luYWw6IEFuIG9iamVjdCB3aXRoIHRoZSBvcmlnaW5hbCBsaW5lIGFuZCBjb2x1bW4gcG9zaXRpb25zLlxuICogICAtIHNvdXJjZTogVGhlIG9yaWdpbmFsIHNvdXJjZSBmaWxlIChyZWxhdGl2ZSB0byB0aGUgc291cmNlUm9vdCkuXG4gKiAgIC0gbmFtZTogQW4gb3B0aW9uYWwgb3JpZ2luYWwgdG9rZW4gbmFtZSBmb3IgdGhpcyBtYXBwaW5nLlxuICovXG5Tb3VyY2VNYXBHZW5lcmF0b3IucHJvdG90eXBlLmFkZE1hcHBpbmcgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBHZW5lcmF0b3JfYWRkTWFwcGluZyhhQXJncykge1xuICAgIHZhciBnZW5lcmF0ZWQgPSB1dGlsLmdldEFyZyhhQXJncywgJ2dlbmVyYXRlZCcpO1xuICAgIHZhciBvcmlnaW5hbCA9IHV0aWwuZ2V0QXJnKGFBcmdzLCAnb3JpZ2luYWwnLCBudWxsKTtcbiAgICB2YXIgc291cmNlID0gdXRpbC5nZXRBcmcoYUFyZ3MsICdzb3VyY2UnLCBudWxsKTtcbiAgICB2YXIgbmFtZSA9IHV0aWwuZ2V0QXJnKGFBcmdzLCAnbmFtZScsIG51bGwpO1xuXG4gICAgaWYgKCF0aGlzLl9za2lwVmFsaWRhdGlvbikge1xuICAgICAgdGhpcy5fdmFsaWRhdGVNYXBwaW5nKGdlbmVyYXRlZCwgb3JpZ2luYWwsIHNvdXJjZSwgbmFtZSk7XG4gICAgfVxuXG4gICAgaWYgKHNvdXJjZSAhPSBudWxsKSB7XG4gICAgICBzb3VyY2UgPSBTdHJpbmcoc291cmNlKTtcbiAgICAgIGlmICghdGhpcy5fc291cmNlcy5oYXMoc291cmNlKSkge1xuICAgICAgICB0aGlzLl9zb3VyY2VzLmFkZChzb3VyY2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChuYW1lICE9IG51bGwpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcobmFtZSk7XG4gICAgICBpZiAoIXRoaXMuX25hbWVzLmhhcyhuYW1lKSkge1xuICAgICAgICB0aGlzLl9uYW1lcy5hZGQobmFtZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fbWFwcGluZ3MuYWRkKHtcbiAgICAgIGdlbmVyYXRlZExpbmU6IGdlbmVyYXRlZC5saW5lLFxuICAgICAgZ2VuZXJhdGVkQ29sdW1uOiBnZW5lcmF0ZWQuY29sdW1uLFxuICAgICAgb3JpZ2luYWxMaW5lOiBvcmlnaW5hbCAhPSBudWxsICYmIG9yaWdpbmFsLmxpbmUsXG4gICAgICBvcmlnaW5hbENvbHVtbjogb3JpZ2luYWwgIT0gbnVsbCAmJiBvcmlnaW5hbC5jb2x1bW4sXG4gICAgICBzb3VyY2U6IHNvdXJjZSxcbiAgICAgIG5hbWU6IG5hbWVcbiAgICB9KTtcbiAgfTtcblxuLyoqXG4gKiBTZXQgdGhlIHNvdXJjZSBjb250ZW50IGZvciBhIHNvdXJjZSBmaWxlLlxuICovXG5Tb3VyY2VNYXBHZW5lcmF0b3IucHJvdG90eXBlLnNldFNvdXJjZUNvbnRlbnQgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBHZW5lcmF0b3Jfc2V0U291cmNlQ29udGVudChhU291cmNlRmlsZSwgYVNvdXJjZUNvbnRlbnQpIHtcbiAgICB2YXIgc291cmNlID0gYVNvdXJjZUZpbGU7XG4gICAgaWYgKHRoaXMuX3NvdXJjZVJvb3QgIT0gbnVsbCkge1xuICAgICAgc291cmNlID0gdXRpbC5yZWxhdGl2ZSh0aGlzLl9zb3VyY2VSb290LCBzb3VyY2UpO1xuICAgIH1cblxuICAgIGlmIChhU291cmNlQ29udGVudCAhPSBudWxsKSB7XG4gICAgICAvLyBBZGQgdGhlIHNvdXJjZSBjb250ZW50IHRvIHRoZSBfc291cmNlc0NvbnRlbnRzIG1hcC5cbiAgICAgIC8vIENyZWF0ZSBhIG5ldyBfc291cmNlc0NvbnRlbnRzIG1hcCBpZiB0aGUgcHJvcGVydHkgaXMgbnVsbC5cbiAgICAgIGlmICghdGhpcy5fc291cmNlc0NvbnRlbnRzKSB7XG4gICAgICAgIHRoaXMuX3NvdXJjZXNDb250ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9zb3VyY2VzQ29udGVudHNbdXRpbC50b1NldFN0cmluZyhzb3VyY2UpXSA9IGFTb3VyY2VDb250ZW50O1xuICAgIH0gZWxzZSBpZiAodGhpcy5fc291cmNlc0NvbnRlbnRzKSB7XG4gICAgICAvLyBSZW1vdmUgdGhlIHNvdXJjZSBmaWxlIGZyb20gdGhlIF9zb3VyY2VzQ29udGVudHMgbWFwLlxuICAgICAgLy8gSWYgdGhlIF9zb3VyY2VzQ29udGVudHMgbWFwIGlzIGVtcHR5LCBzZXQgdGhlIHByb3BlcnR5IHRvIG51bGwuXG4gICAgICBkZWxldGUgdGhpcy5fc291cmNlc0NvbnRlbnRzW3V0aWwudG9TZXRTdHJpbmcoc291cmNlKV07XG4gICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5fc291cmNlc0NvbnRlbnRzKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5fc291cmNlc0NvbnRlbnRzID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbi8qKlxuICogQXBwbGllcyB0aGUgbWFwcGluZ3Mgb2YgYSBzdWItc291cmNlLW1hcCBmb3IgYSBzcGVjaWZpYyBzb3VyY2UgZmlsZSB0byB0aGVcbiAqIHNvdXJjZSBtYXAgYmVpbmcgZ2VuZXJhdGVkLiBFYWNoIG1hcHBpbmcgdG8gdGhlIHN1cHBsaWVkIHNvdXJjZSBmaWxlIGlzXG4gKiByZXdyaXR0ZW4gdXNpbmcgdGhlIHN1cHBsaWVkIHNvdXJjZSBtYXAuIE5vdGU6IFRoZSByZXNvbHV0aW9uIGZvciB0aGVcbiAqIHJlc3VsdGluZyBtYXBwaW5ncyBpcyB0aGUgbWluaW1pdW0gb2YgdGhpcyBtYXAgYW5kIHRoZSBzdXBwbGllZCBtYXAuXG4gKlxuICogQHBhcmFtIGFTb3VyY2VNYXBDb25zdW1lciBUaGUgc291cmNlIG1hcCB0byBiZSBhcHBsaWVkLlxuICogQHBhcmFtIGFTb3VyY2VGaWxlIE9wdGlvbmFsLiBUaGUgZmlsZW5hbWUgb2YgdGhlIHNvdXJjZSBmaWxlLlxuICogICAgICAgIElmIG9taXR0ZWQsIFNvdXJjZU1hcENvbnN1bWVyJ3MgZmlsZSBwcm9wZXJ0eSB3aWxsIGJlIHVzZWQuXG4gKiBAcGFyYW0gYVNvdXJjZU1hcFBhdGggT3B0aW9uYWwuIFRoZSBkaXJuYW1lIG9mIHRoZSBwYXRoIHRvIHRoZSBzb3VyY2UgbWFwXG4gKiAgICAgICAgdG8gYmUgYXBwbGllZC4gSWYgcmVsYXRpdmUsIGl0IGlzIHJlbGF0aXZlIHRvIHRoZSBTb3VyY2VNYXBDb25zdW1lci5cbiAqICAgICAgICBUaGlzIHBhcmFtZXRlciBpcyBuZWVkZWQgd2hlbiB0aGUgdHdvIHNvdXJjZSBtYXBzIGFyZW4ndCBpbiB0aGUgc2FtZVxuICogICAgICAgIGRpcmVjdG9yeSwgYW5kIHRoZSBzb3VyY2UgbWFwIHRvIGJlIGFwcGxpZWQgY29udGFpbnMgcmVsYXRpdmUgc291cmNlXG4gKiAgICAgICAgcGF0aHMuIElmIHNvLCB0aG9zZSByZWxhdGl2ZSBzb3VyY2UgcGF0aHMgbmVlZCB0byBiZSByZXdyaXR0ZW5cbiAqICAgICAgICByZWxhdGl2ZSB0byB0aGUgU291cmNlTWFwR2VuZXJhdG9yLlxuICovXG5Tb3VyY2VNYXBHZW5lcmF0b3IucHJvdG90eXBlLmFwcGx5U291cmNlTWFwID1cbiAgZnVuY3Rpb24gU291cmNlTWFwR2VuZXJhdG9yX2FwcGx5U291cmNlTWFwKGFTb3VyY2VNYXBDb25zdW1lciwgYVNvdXJjZUZpbGUsIGFTb3VyY2VNYXBQYXRoKSB7XG4gICAgdmFyIHNvdXJjZUZpbGUgPSBhU291cmNlRmlsZTtcbiAgICAvLyBJZiBhU291cmNlRmlsZSBpcyBvbWl0dGVkLCB3ZSB3aWxsIHVzZSB0aGUgZmlsZSBwcm9wZXJ0eSBvZiB0aGUgU291cmNlTWFwXG4gICAgaWYgKGFTb3VyY2VGaWxlID09IG51bGwpIHtcbiAgICAgIGlmIChhU291cmNlTWFwQ29uc3VtZXIuZmlsZSA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnU291cmNlTWFwR2VuZXJhdG9yLnByb3RvdHlwZS5hcHBseVNvdXJjZU1hcCByZXF1aXJlcyBlaXRoZXIgYW4gZXhwbGljaXQgc291cmNlIGZpbGUsICcgK1xuICAgICAgICAgICdvciB0aGUgc291cmNlIG1hcFxcJ3MgXCJmaWxlXCIgcHJvcGVydHkuIEJvdGggd2VyZSBvbWl0dGVkLidcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHNvdXJjZUZpbGUgPSBhU291cmNlTWFwQ29uc3VtZXIuZmlsZTtcbiAgICB9XG4gICAgdmFyIHNvdXJjZVJvb3QgPSB0aGlzLl9zb3VyY2VSb290O1xuICAgIC8vIE1ha2UgXCJzb3VyY2VGaWxlXCIgcmVsYXRpdmUgaWYgYW4gYWJzb2x1dGUgVXJsIGlzIHBhc3NlZC5cbiAgICBpZiAoc291cmNlUm9vdCAhPSBudWxsKSB7XG4gICAgICBzb3VyY2VGaWxlID0gdXRpbC5yZWxhdGl2ZShzb3VyY2VSb290LCBzb3VyY2VGaWxlKTtcbiAgICB9XG4gICAgLy8gQXBwbHlpbmcgdGhlIFNvdXJjZU1hcCBjYW4gYWRkIGFuZCByZW1vdmUgaXRlbXMgZnJvbSB0aGUgc291cmNlcyBhbmRcbiAgICAvLyB0aGUgbmFtZXMgYXJyYXkuXG4gICAgdmFyIG5ld1NvdXJjZXMgPSBuZXcgQXJyYXlTZXQoKTtcbiAgICB2YXIgbmV3TmFtZXMgPSBuZXcgQXJyYXlTZXQoKTtcblxuICAgIC8vIEZpbmQgbWFwcGluZ3MgZm9yIHRoZSBcInNvdXJjZUZpbGVcIlxuICAgIHRoaXMuX21hcHBpbmdzLnVuc29ydGVkRm9yRWFjaChmdW5jdGlvbiAobWFwcGluZykge1xuICAgICAgaWYgKG1hcHBpbmcuc291cmNlID09PSBzb3VyY2VGaWxlICYmIG1hcHBpbmcub3JpZ2luYWxMaW5lICE9IG51bGwpIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQgY2FuIGJlIG1hcHBlZCBieSB0aGUgc291cmNlIG1hcCwgdGhlbiB1cGRhdGUgdGhlIG1hcHBpbmcuXG4gICAgICAgIHZhciBvcmlnaW5hbCA9IGFTb3VyY2VNYXBDb25zdW1lci5vcmlnaW5hbFBvc2l0aW9uRm9yKHtcbiAgICAgICAgICBsaW5lOiBtYXBwaW5nLm9yaWdpbmFsTGluZSxcbiAgICAgICAgICBjb2x1bW46IG1hcHBpbmcub3JpZ2luYWxDb2x1bW5cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChvcmlnaW5hbC5zb3VyY2UgIT0gbnVsbCkge1xuICAgICAgICAgIC8vIENvcHkgbWFwcGluZ1xuICAgICAgICAgIG1hcHBpbmcuc291cmNlID0gb3JpZ2luYWwuc291cmNlO1xuICAgICAgICAgIGlmIChhU291cmNlTWFwUGF0aCAhPSBudWxsKSB7XG4gICAgICAgICAgICBtYXBwaW5nLnNvdXJjZSA9IHV0aWwuam9pbihhU291cmNlTWFwUGF0aCwgbWFwcGluZy5zb3VyY2UpXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzb3VyY2VSb290ICE9IG51bGwpIHtcbiAgICAgICAgICAgIG1hcHBpbmcuc291cmNlID0gdXRpbC5yZWxhdGl2ZShzb3VyY2VSb290LCBtYXBwaW5nLnNvdXJjZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG1hcHBpbmcub3JpZ2luYWxMaW5lID0gb3JpZ2luYWwubGluZTtcbiAgICAgICAgICBtYXBwaW5nLm9yaWdpbmFsQ29sdW1uID0gb3JpZ2luYWwuY29sdW1uO1xuICAgICAgICAgIGlmIChvcmlnaW5hbC5uYW1lICE9IG51bGwpIHtcbiAgICAgICAgICAgIG1hcHBpbmcubmFtZSA9IG9yaWdpbmFsLm5hbWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBzb3VyY2UgPSBtYXBwaW5nLnNvdXJjZTtcbiAgICAgIGlmIChzb3VyY2UgIT0gbnVsbCAmJiAhbmV3U291cmNlcy5oYXMoc291cmNlKSkge1xuICAgICAgICBuZXdTb3VyY2VzLmFkZChzb3VyY2UpO1xuICAgICAgfVxuXG4gICAgICB2YXIgbmFtZSA9IG1hcHBpbmcubmFtZTtcbiAgICAgIGlmIChuYW1lICE9IG51bGwgJiYgIW5ld05hbWVzLmhhcyhuYW1lKSkge1xuICAgICAgICBuZXdOYW1lcy5hZGQobmFtZSk7XG4gICAgICB9XG5cbiAgICB9LCB0aGlzKTtcbiAgICB0aGlzLl9zb3VyY2VzID0gbmV3U291cmNlcztcbiAgICB0aGlzLl9uYW1lcyA9IG5ld05hbWVzO1xuXG4gICAgLy8gQ29weSBzb3VyY2VzQ29udGVudHMgb2YgYXBwbGllZCBtYXAuXG4gICAgYVNvdXJjZU1hcENvbnN1bWVyLnNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbiAoc291cmNlRmlsZSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBhU291cmNlTWFwQ29uc3VtZXIuc291cmNlQ29udGVudEZvcihzb3VyY2VGaWxlKTtcbiAgICAgIGlmIChjb250ZW50ICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGFTb3VyY2VNYXBQYXRoICE9IG51bGwpIHtcbiAgICAgICAgICBzb3VyY2VGaWxlID0gdXRpbC5qb2luKGFTb3VyY2VNYXBQYXRoLCBzb3VyY2VGaWxlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc291cmNlUm9vdCAhPSBudWxsKSB7XG4gICAgICAgICAgc291cmNlRmlsZSA9IHV0aWwucmVsYXRpdmUoc291cmNlUm9vdCwgc291cmNlRmlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTb3VyY2VDb250ZW50KHNvdXJjZUZpbGUsIGNvbnRlbnQpO1xuICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICB9O1xuXG4vKipcbiAqIEEgbWFwcGluZyBjYW4gaGF2ZSBvbmUgb2YgdGhlIHRocmVlIGxldmVscyBvZiBkYXRhOlxuICpcbiAqICAgMS4gSnVzdCB0aGUgZ2VuZXJhdGVkIHBvc2l0aW9uLlxuICogICAyLiBUaGUgR2VuZXJhdGVkIHBvc2l0aW9uLCBvcmlnaW5hbCBwb3NpdGlvbiwgYW5kIG9yaWdpbmFsIHNvdXJjZS5cbiAqICAgMy4gR2VuZXJhdGVkIGFuZCBvcmlnaW5hbCBwb3NpdGlvbiwgb3JpZ2luYWwgc291cmNlLCBhcyB3ZWxsIGFzIGEgbmFtZVxuICogICAgICB0b2tlbi5cbiAqXG4gKiBUbyBtYWludGFpbiBjb25zaXN0ZW5jeSwgd2UgdmFsaWRhdGUgdGhhdCBhbnkgbmV3IG1hcHBpbmcgYmVpbmcgYWRkZWQgZmFsbHNcbiAqIGluIHRvIG9uZSBvZiB0aGVzZSBjYXRlZ29yaWVzLlxuICovXG5Tb3VyY2VNYXBHZW5lcmF0b3IucHJvdG90eXBlLl92YWxpZGF0ZU1hcHBpbmcgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBHZW5lcmF0b3JfdmFsaWRhdGVNYXBwaW5nKGFHZW5lcmF0ZWQsIGFPcmlnaW5hbCwgYVNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhTmFtZSkge1xuICAgIGlmIChhR2VuZXJhdGVkICYmICdsaW5lJyBpbiBhR2VuZXJhdGVkICYmICdjb2x1bW4nIGluIGFHZW5lcmF0ZWRcbiAgICAgICAgJiYgYUdlbmVyYXRlZC5saW5lID4gMCAmJiBhR2VuZXJhdGVkLmNvbHVtbiA+PSAwXG4gICAgICAgICYmICFhT3JpZ2luYWwgJiYgIWFTb3VyY2UgJiYgIWFOYW1lKSB7XG4gICAgICAvLyBDYXNlIDEuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2UgaWYgKGFHZW5lcmF0ZWQgJiYgJ2xpbmUnIGluIGFHZW5lcmF0ZWQgJiYgJ2NvbHVtbicgaW4gYUdlbmVyYXRlZFxuICAgICAgICAgICAgICYmIGFPcmlnaW5hbCAmJiAnbGluZScgaW4gYU9yaWdpbmFsICYmICdjb2x1bW4nIGluIGFPcmlnaW5hbFxuICAgICAgICAgICAgICYmIGFHZW5lcmF0ZWQubGluZSA+IDAgJiYgYUdlbmVyYXRlZC5jb2x1bW4gPj0gMFxuICAgICAgICAgICAgICYmIGFPcmlnaW5hbC5saW5lID4gMCAmJiBhT3JpZ2luYWwuY29sdW1uID49IDBcbiAgICAgICAgICAgICAmJiBhU291cmNlKSB7XG4gICAgICAvLyBDYXNlcyAyIGFuZCAzLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBtYXBwaW5nOiAnICsgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBnZW5lcmF0ZWQ6IGFHZW5lcmF0ZWQsXG4gICAgICAgIHNvdXJjZTogYVNvdXJjZSxcbiAgICAgICAgb3JpZ2luYWw6IGFPcmlnaW5hbCxcbiAgICAgICAgbmFtZTogYU5hbWVcbiAgICAgIH0pKTtcbiAgICB9XG4gIH07XG5cbi8qKlxuICogU2VyaWFsaXplIHRoZSBhY2N1bXVsYXRlZCBtYXBwaW5ncyBpbiB0byB0aGUgc3RyZWFtIG9mIGJhc2UgNjQgVkxRc1xuICogc3BlY2lmaWVkIGJ5IHRoZSBzb3VyY2UgbWFwIGZvcm1hdC5cbiAqL1xuU291cmNlTWFwR2VuZXJhdG9yLnByb3RvdHlwZS5fc2VyaWFsaXplTWFwcGluZ3MgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBHZW5lcmF0b3Jfc2VyaWFsaXplTWFwcGluZ3MoKSB7XG4gICAgdmFyIHByZXZpb3VzR2VuZXJhdGVkQ29sdW1uID0gMDtcbiAgICB2YXIgcHJldmlvdXNHZW5lcmF0ZWRMaW5lID0gMTtcbiAgICB2YXIgcHJldmlvdXNPcmlnaW5hbENvbHVtbiA9IDA7XG4gICAgdmFyIHByZXZpb3VzT3JpZ2luYWxMaW5lID0gMDtcbiAgICB2YXIgcHJldmlvdXNOYW1lID0gMDtcbiAgICB2YXIgcHJldmlvdXNTb3VyY2UgPSAwO1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgICB2YXIgbmV4dDtcbiAgICB2YXIgbWFwcGluZztcbiAgICB2YXIgbmFtZUlkeDtcbiAgICB2YXIgc291cmNlSWR4O1xuXG4gICAgdmFyIG1hcHBpbmdzID0gdGhpcy5fbWFwcGluZ3MudG9BcnJheSgpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBtYXBwaW5ncy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgbWFwcGluZyA9IG1hcHBpbmdzW2ldO1xuICAgICAgbmV4dCA9ICcnXG5cbiAgICAgIGlmIChtYXBwaW5nLmdlbmVyYXRlZExpbmUgIT09IHByZXZpb3VzR2VuZXJhdGVkTGluZSkge1xuICAgICAgICBwcmV2aW91c0dlbmVyYXRlZENvbHVtbiA9IDA7XG4gICAgICAgIHdoaWxlIChtYXBwaW5nLmdlbmVyYXRlZExpbmUgIT09IHByZXZpb3VzR2VuZXJhdGVkTGluZSkge1xuICAgICAgICAgIG5leHQgKz0gJzsnO1xuICAgICAgICAgIHByZXZpb3VzR2VuZXJhdGVkTGluZSsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgaWYgKCF1dGlsLmNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0luZmxhdGVkKG1hcHBpbmcsIG1hcHBpbmdzW2kgLSAxXSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBuZXh0ICs9ICcsJztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBuZXh0ICs9IGJhc2U2NFZMUS5lbmNvZGUobWFwcGluZy5nZW5lcmF0ZWRDb2x1bW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gcHJldmlvdXNHZW5lcmF0ZWRDb2x1bW4pO1xuICAgICAgcHJldmlvdXNHZW5lcmF0ZWRDb2x1bW4gPSBtYXBwaW5nLmdlbmVyYXRlZENvbHVtbjtcblxuICAgICAgaWYgKG1hcHBpbmcuc291cmNlICE9IG51bGwpIHtcbiAgICAgICAgc291cmNlSWR4ID0gdGhpcy5fc291cmNlcy5pbmRleE9mKG1hcHBpbmcuc291cmNlKTtcbiAgICAgICAgbmV4dCArPSBiYXNlNjRWTFEuZW5jb2RlKHNvdXJjZUlkeCAtIHByZXZpb3VzU291cmNlKTtcbiAgICAgICAgcHJldmlvdXNTb3VyY2UgPSBzb3VyY2VJZHg7XG5cbiAgICAgICAgLy8gbGluZXMgYXJlIHN0b3JlZCAwLWJhc2VkIGluIFNvdXJjZU1hcCBzcGVjIHZlcnNpb24gM1xuICAgICAgICBuZXh0ICs9IGJhc2U2NFZMUS5lbmNvZGUobWFwcGluZy5vcmlnaW5hbExpbmUgLSAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gcHJldmlvdXNPcmlnaW5hbExpbmUpO1xuICAgICAgICBwcmV2aW91c09yaWdpbmFsTGluZSA9IG1hcHBpbmcub3JpZ2luYWxMaW5lIC0gMTtcblxuICAgICAgICBuZXh0ICs9IGJhc2U2NFZMUS5lbmNvZGUobWFwcGluZy5vcmlnaW5hbENvbHVtblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIHByZXZpb3VzT3JpZ2luYWxDb2x1bW4pO1xuICAgICAgICBwcmV2aW91c09yaWdpbmFsQ29sdW1uID0gbWFwcGluZy5vcmlnaW5hbENvbHVtbjtcblxuICAgICAgICBpZiAobWFwcGluZy5uYW1lICE9IG51bGwpIHtcbiAgICAgICAgICBuYW1lSWR4ID0gdGhpcy5fbmFtZXMuaW5kZXhPZihtYXBwaW5nLm5hbWUpO1xuICAgICAgICAgIG5leHQgKz0gYmFzZTY0VkxRLmVuY29kZShuYW1lSWR4IC0gcHJldmlvdXNOYW1lKTtcbiAgICAgICAgICBwcmV2aW91c05hbWUgPSBuYW1lSWR4O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJlc3VsdCArPSBuZXh0O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cblNvdXJjZU1hcEdlbmVyYXRvci5wcm90b3R5cGUuX2dlbmVyYXRlU291cmNlc0NvbnRlbnQgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBHZW5lcmF0b3JfZ2VuZXJhdGVTb3VyY2VzQ29udGVudChhU291cmNlcywgYVNvdXJjZVJvb3QpIHtcbiAgICByZXR1cm4gYVNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgIGlmICghdGhpcy5fc291cmNlc0NvbnRlbnRzKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKGFTb3VyY2VSb290ICE9IG51bGwpIHtcbiAgICAgICAgc291cmNlID0gdXRpbC5yZWxhdGl2ZShhU291cmNlUm9vdCwgc291cmNlKTtcbiAgICAgIH1cbiAgICAgIHZhciBrZXkgPSB1dGlsLnRvU2V0U3RyaW5nKHNvdXJjZSk7XG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuX3NvdXJjZXNDb250ZW50cywga2V5KVxuICAgICAgICA/IHRoaXMuX3NvdXJjZXNDb250ZW50c1trZXldXG4gICAgICAgIDogbnVsbDtcbiAgICB9LCB0aGlzKTtcbiAgfTtcblxuLyoqXG4gKiBFeHRlcm5hbGl6ZSB0aGUgc291cmNlIG1hcC5cbiAqL1xuU291cmNlTWFwR2VuZXJhdG9yLnByb3RvdHlwZS50b0pTT04gPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBHZW5lcmF0b3JfdG9KU09OKCkge1xuICAgIHZhciBtYXAgPSB7XG4gICAgICB2ZXJzaW9uOiB0aGlzLl92ZXJzaW9uLFxuICAgICAgc291cmNlczogdGhpcy5fc291cmNlcy50b0FycmF5KCksXG4gICAgICBuYW1lczogdGhpcy5fbmFtZXMudG9BcnJheSgpLFxuICAgICAgbWFwcGluZ3M6IHRoaXMuX3NlcmlhbGl6ZU1hcHBpbmdzKClcbiAgICB9O1xuICAgIGlmICh0aGlzLl9maWxlICE9IG51bGwpIHtcbiAgICAgIG1hcC5maWxlID0gdGhpcy5fZmlsZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3NvdXJjZVJvb3QgIT0gbnVsbCkge1xuICAgICAgbWFwLnNvdXJjZVJvb3QgPSB0aGlzLl9zb3VyY2VSb290O1xuICAgIH1cbiAgICBpZiAodGhpcy5fc291cmNlc0NvbnRlbnRzKSB7XG4gICAgICBtYXAuc291cmNlc0NvbnRlbnQgPSB0aGlzLl9nZW5lcmF0ZVNvdXJjZXNDb250ZW50KG1hcC5zb3VyY2VzLCBtYXAuc291cmNlUm9vdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcDtcbiAgfTtcblxuLyoqXG4gKiBSZW5kZXIgdGhlIHNvdXJjZSBtYXAgYmVpbmcgZ2VuZXJhdGVkIHRvIGEgc3RyaW5nLlxuICovXG5Tb3VyY2VNYXBHZW5lcmF0b3IucHJvdG90eXBlLnRvU3RyaW5nID1cbiAgZnVuY3Rpb24gU291cmNlTWFwR2VuZXJhdG9yX3RvU3RyaW5nKCkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLnRvSlNPTigpKTtcbiAgfTtcblxuZXhwb3J0cy5Tb3VyY2VNYXBHZW5lcmF0b3IgPSBTb3VyY2VNYXBHZW5lcmF0b3I7XG4iLCIvKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTEgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5cbnZhciBTb3VyY2VNYXBHZW5lcmF0b3IgPSByZXF1aXJlKCcuL3NvdXJjZS1tYXAtZ2VuZXJhdG9yJykuU291cmNlTWFwR2VuZXJhdG9yO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuLy8gTWF0Y2hlcyBhIFdpbmRvd3Mtc3R5bGUgYFxcclxcbmAgbmV3bGluZSBvciBhIGBcXG5gIG5ld2xpbmUgdXNlZCBieSBhbGwgb3RoZXJcbi8vIG9wZXJhdGluZyBzeXN0ZW1zIHRoZXNlIGRheXMgKGNhcHR1cmluZyB0aGUgcmVzdWx0KS5cbnZhciBSRUdFWF9ORVdMSU5FID0gLyhcXHI/XFxuKS87XG5cbi8vIE5ld2xpbmUgY2hhcmFjdGVyIGNvZGUgZm9yIGNoYXJDb2RlQXQoKSBjb21wYXJpc29uc1xudmFyIE5FV0xJTkVfQ09ERSA9IDEwO1xuXG4vLyBQcml2YXRlIHN5bWJvbCBmb3IgaWRlbnRpZnlpbmcgYFNvdXJjZU5vZGVgcyB3aGVuIG11bHRpcGxlIHZlcnNpb25zIG9mXG4vLyB0aGUgc291cmNlLW1hcCBsaWJyYXJ5IGFyZSBsb2FkZWQuIFRoaXMgTVVTVCBOT1QgQ0hBTkdFIGFjcm9zc1xuLy8gdmVyc2lvbnMhXG52YXIgaXNTb3VyY2VOb2RlID0gXCIkJCRpc1NvdXJjZU5vZGUkJCRcIjtcblxuLyoqXG4gKiBTb3VyY2VOb2RlcyBwcm92aWRlIGEgd2F5IHRvIGFic3RyYWN0IG92ZXIgaW50ZXJwb2xhdGluZy9jb25jYXRlbmF0aW5nXG4gKiBzbmlwcGV0cyBvZiBnZW5lcmF0ZWQgSmF2YVNjcmlwdCBzb3VyY2UgY29kZSB3aGlsZSBtYWludGFpbmluZyB0aGUgbGluZSBhbmRcbiAqIGNvbHVtbiBpbmZvcm1hdGlvbiBhc3NvY2lhdGVkIHdpdGggdGhlIG9yaWdpbmFsIHNvdXJjZSBjb2RlLlxuICpcbiAqIEBwYXJhbSBhTGluZSBUaGUgb3JpZ2luYWwgbGluZSBudW1iZXIuXG4gKiBAcGFyYW0gYUNvbHVtbiBUaGUgb3JpZ2luYWwgY29sdW1uIG51bWJlci5cbiAqIEBwYXJhbSBhU291cmNlIFRoZSBvcmlnaW5hbCBzb3VyY2UncyBmaWxlbmFtZS5cbiAqIEBwYXJhbSBhQ2h1bmtzIE9wdGlvbmFsLiBBbiBhcnJheSBvZiBzdHJpbmdzIHdoaWNoIGFyZSBzbmlwcGV0cyBvZlxuICogICAgICAgIGdlbmVyYXRlZCBKUywgb3Igb3RoZXIgU291cmNlTm9kZXMuXG4gKiBAcGFyYW0gYU5hbWUgVGhlIG9yaWdpbmFsIGlkZW50aWZpZXIuXG4gKi9cbmZ1bmN0aW9uIFNvdXJjZU5vZGUoYUxpbmUsIGFDb2x1bW4sIGFTb3VyY2UsIGFDaHVua3MsIGFOYW1lKSB7XG4gIHRoaXMuY2hpbGRyZW4gPSBbXTtcbiAgdGhpcy5zb3VyY2VDb250ZW50cyA9IHt9O1xuICB0aGlzLmxpbmUgPSBhTGluZSA9PSBudWxsID8gbnVsbCA6IGFMaW5lO1xuICB0aGlzLmNvbHVtbiA9IGFDb2x1bW4gPT0gbnVsbCA/IG51bGwgOiBhQ29sdW1uO1xuICB0aGlzLnNvdXJjZSA9IGFTb3VyY2UgPT0gbnVsbCA/IG51bGwgOiBhU291cmNlO1xuICB0aGlzLm5hbWUgPSBhTmFtZSA9PSBudWxsID8gbnVsbCA6IGFOYW1lO1xuICB0aGlzW2lzU291cmNlTm9kZV0gPSB0cnVlO1xuICBpZiAoYUNodW5rcyAhPSBudWxsKSB0aGlzLmFkZChhQ2h1bmtzKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgU291cmNlTm9kZSBmcm9tIGdlbmVyYXRlZCBjb2RlIGFuZCBhIFNvdXJjZU1hcENvbnN1bWVyLlxuICpcbiAqIEBwYXJhbSBhR2VuZXJhdGVkQ29kZSBUaGUgZ2VuZXJhdGVkIGNvZGVcbiAqIEBwYXJhbSBhU291cmNlTWFwQ29uc3VtZXIgVGhlIFNvdXJjZU1hcCBmb3IgdGhlIGdlbmVyYXRlZCBjb2RlXG4gKiBAcGFyYW0gYVJlbGF0aXZlUGF0aCBPcHRpb25hbC4gVGhlIHBhdGggdGhhdCByZWxhdGl2ZSBzb3VyY2VzIGluIHRoZVxuICogICAgICAgIFNvdXJjZU1hcENvbnN1bWVyIHNob3VsZCBiZSByZWxhdGl2ZSB0by5cbiAqL1xuU291cmNlTm9kZS5mcm9tU3RyaW5nV2l0aFNvdXJjZU1hcCA9XG4gIGZ1bmN0aW9uIFNvdXJjZU5vZGVfZnJvbVN0cmluZ1dpdGhTb3VyY2VNYXAoYUdlbmVyYXRlZENvZGUsIGFTb3VyY2VNYXBDb25zdW1lciwgYVJlbGF0aXZlUGF0aCkge1xuICAgIC8vIFRoZSBTb3VyY2VOb2RlIHdlIHdhbnQgdG8gZmlsbCB3aXRoIHRoZSBnZW5lcmF0ZWQgY29kZVxuICAgIC8vIGFuZCB0aGUgU291cmNlTWFwXG4gICAgdmFyIG5vZGUgPSBuZXcgU291cmNlTm9kZSgpO1xuXG4gICAgLy8gQWxsIGV2ZW4gaW5kaWNlcyBvZiB0aGlzIGFycmF5IGFyZSBvbmUgbGluZSBvZiB0aGUgZ2VuZXJhdGVkIGNvZGUsXG4gICAgLy8gd2hpbGUgYWxsIG9kZCBpbmRpY2VzIGFyZSB0aGUgbmV3bGluZXMgYmV0d2VlbiB0d28gYWRqYWNlbnQgbGluZXNcbiAgICAvLyAoc2luY2UgYFJFR0VYX05FV0xJTkVgIGNhcHR1cmVzIGl0cyBtYXRjaCkuXG4gICAgLy8gUHJvY2Vzc2VkIGZyYWdtZW50cyBhcmUgcmVtb3ZlZCBmcm9tIHRoaXMgYXJyYXksIGJ5IGNhbGxpbmcgYHNoaWZ0TmV4dExpbmVgLlxuICAgIHZhciByZW1haW5pbmdMaW5lcyA9IGFHZW5lcmF0ZWRDb2RlLnNwbGl0KFJFR0VYX05FV0xJTkUpO1xuICAgIHZhciBzaGlmdE5leHRMaW5lID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGluZUNvbnRlbnRzID0gcmVtYWluaW5nTGluZXMuc2hpZnQoKTtcbiAgICAgIC8vIFRoZSBsYXN0IGxpbmUgb2YgYSBmaWxlIG1pZ2h0IG5vdCBoYXZlIGEgbmV3bGluZS5cbiAgICAgIHZhciBuZXdMaW5lID0gcmVtYWluaW5nTGluZXMuc2hpZnQoKSB8fCBcIlwiO1xuICAgICAgcmV0dXJuIGxpbmVDb250ZW50cyArIG5ld0xpbmU7XG4gICAgfTtcblxuICAgIC8vIFdlIG5lZWQgdG8gcmVtZW1iZXIgdGhlIHBvc2l0aW9uIG9mIFwicmVtYWluaW5nTGluZXNcIlxuICAgIHZhciBsYXN0R2VuZXJhdGVkTGluZSA9IDEsIGxhc3RHZW5lcmF0ZWRDb2x1bW4gPSAwO1xuXG4gICAgLy8gVGhlIGdlbmVyYXRlIFNvdXJjZU5vZGVzIHdlIG5lZWQgYSBjb2RlIHJhbmdlLlxuICAgIC8vIFRvIGV4dHJhY3QgaXQgY3VycmVudCBhbmQgbGFzdCBtYXBwaW5nIGlzIHVzZWQuXG4gICAgLy8gSGVyZSB3ZSBzdG9yZSB0aGUgbGFzdCBtYXBwaW5nLlxuICAgIHZhciBsYXN0TWFwcGluZyA9IG51bGw7XG5cbiAgICBhU291cmNlTWFwQ29uc3VtZXIuZWFjaE1hcHBpbmcoZnVuY3Rpb24gKG1hcHBpbmcpIHtcbiAgICAgIGlmIChsYXN0TWFwcGluZyAhPT0gbnVsbCkge1xuICAgICAgICAvLyBXZSBhZGQgdGhlIGNvZGUgZnJvbSBcImxhc3RNYXBwaW5nXCIgdG8gXCJtYXBwaW5nXCI6XG4gICAgICAgIC8vIEZpcnN0IGNoZWNrIGlmIHRoZXJlIGlzIGEgbmV3IGxpbmUgaW4gYmV0d2Vlbi5cbiAgICAgICAgaWYgKGxhc3RHZW5lcmF0ZWRMaW5lIDwgbWFwcGluZy5nZW5lcmF0ZWRMaW5lKSB7XG4gICAgICAgICAgLy8gQXNzb2NpYXRlIGZpcnN0IGxpbmUgd2l0aCBcImxhc3RNYXBwaW5nXCJcbiAgICAgICAgICBhZGRNYXBwaW5nV2l0aENvZGUobGFzdE1hcHBpbmcsIHNoaWZ0TmV4dExpbmUoKSk7XG4gICAgICAgICAgbGFzdEdlbmVyYXRlZExpbmUrKztcbiAgICAgICAgICBsYXN0R2VuZXJhdGVkQ29sdW1uID0gMDtcbiAgICAgICAgICAvLyBUaGUgcmVtYWluaW5nIGNvZGUgaXMgYWRkZWQgd2l0aG91dCBtYXBwaW5nXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVGhlcmUgaXMgbm8gbmV3IGxpbmUgaW4gYmV0d2Vlbi5cbiAgICAgICAgICAvLyBBc3NvY2lhdGUgdGhlIGNvZGUgYmV0d2VlbiBcImxhc3RHZW5lcmF0ZWRDb2x1bW5cIiBhbmRcbiAgICAgICAgICAvLyBcIm1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uXCIgd2l0aCBcImxhc3RNYXBwaW5nXCJcbiAgICAgICAgICB2YXIgbmV4dExpbmUgPSByZW1haW5pbmdMaW5lc1swXTtcbiAgICAgICAgICB2YXIgY29kZSA9IG5leHRMaW5lLnN1YnN0cigwLCBtYXBwaW5nLmdlbmVyYXRlZENvbHVtbiAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEdlbmVyYXRlZENvbHVtbik7XG4gICAgICAgICAgcmVtYWluaW5nTGluZXNbMF0gPSBuZXh0TGluZS5zdWJzdHIobWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4gLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RHZW5lcmF0ZWRDb2x1bW4pO1xuICAgICAgICAgIGxhc3RHZW5lcmF0ZWRDb2x1bW4gPSBtYXBwaW5nLmdlbmVyYXRlZENvbHVtbjtcbiAgICAgICAgICBhZGRNYXBwaW5nV2l0aENvZGUobGFzdE1hcHBpbmcsIGNvZGUpO1xuICAgICAgICAgIC8vIE5vIG1vcmUgcmVtYWluaW5nIGNvZGUsIGNvbnRpbnVlXG4gICAgICAgICAgbGFzdE1hcHBpbmcgPSBtYXBwaW5nO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gV2UgYWRkIHRoZSBnZW5lcmF0ZWQgY29kZSB1bnRpbCB0aGUgZmlyc3QgbWFwcGluZ1xuICAgICAgLy8gdG8gdGhlIFNvdXJjZU5vZGUgd2l0aG91dCBhbnkgbWFwcGluZy5cbiAgICAgIC8vIEVhY2ggbGluZSBpcyBhZGRlZCBhcyBzZXBhcmF0ZSBzdHJpbmcuXG4gICAgICB3aGlsZSAobGFzdEdlbmVyYXRlZExpbmUgPCBtYXBwaW5nLmdlbmVyYXRlZExpbmUpIHtcbiAgICAgICAgbm9kZS5hZGQoc2hpZnROZXh0TGluZSgpKTtcbiAgICAgICAgbGFzdEdlbmVyYXRlZExpbmUrKztcbiAgICAgIH1cbiAgICAgIGlmIChsYXN0R2VuZXJhdGVkQ29sdW1uIDwgbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4pIHtcbiAgICAgICAgdmFyIG5leHRMaW5lID0gcmVtYWluaW5nTGluZXNbMF07XG4gICAgICAgIG5vZGUuYWRkKG5leHRMaW5lLnN1YnN0cigwLCBtYXBwaW5nLmdlbmVyYXRlZENvbHVtbikpO1xuICAgICAgICByZW1haW5pbmdMaW5lc1swXSA9IG5leHRMaW5lLnN1YnN0cihtYXBwaW5nLmdlbmVyYXRlZENvbHVtbik7XG4gICAgICAgIGxhc3RHZW5lcmF0ZWRDb2x1bW4gPSBtYXBwaW5nLmdlbmVyYXRlZENvbHVtbjtcbiAgICAgIH1cbiAgICAgIGxhc3RNYXBwaW5nID0gbWFwcGluZztcbiAgICB9LCB0aGlzKTtcbiAgICAvLyBXZSBoYXZlIHByb2Nlc3NlZCBhbGwgbWFwcGluZ3MuXG4gICAgaWYgKHJlbWFpbmluZ0xpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChsYXN0TWFwcGluZykge1xuICAgICAgICAvLyBBc3NvY2lhdGUgdGhlIHJlbWFpbmluZyBjb2RlIGluIHRoZSBjdXJyZW50IGxpbmUgd2l0aCBcImxhc3RNYXBwaW5nXCJcbiAgICAgICAgYWRkTWFwcGluZ1dpdGhDb2RlKGxhc3RNYXBwaW5nLCBzaGlmdE5leHRMaW5lKCkpO1xuICAgICAgfVxuICAgICAgLy8gYW5kIGFkZCB0aGUgcmVtYWluaW5nIGxpbmVzIHdpdGhvdXQgYW55IG1hcHBpbmdcbiAgICAgIG5vZGUuYWRkKHJlbWFpbmluZ0xpbmVzLmpvaW4oXCJcIikpO1xuICAgIH1cblxuICAgIC8vIENvcHkgc291cmNlc0NvbnRlbnQgaW50byBTb3VyY2VOb2RlXG4gICAgYVNvdXJjZU1hcENvbnN1bWVyLnNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbiAoc291cmNlRmlsZSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBhU291cmNlTWFwQ29uc3VtZXIuc291cmNlQ29udGVudEZvcihzb3VyY2VGaWxlKTtcbiAgICAgIGlmIChjb250ZW50ICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGFSZWxhdGl2ZVBhdGggIT0gbnVsbCkge1xuICAgICAgICAgIHNvdXJjZUZpbGUgPSB1dGlsLmpvaW4oYVJlbGF0aXZlUGF0aCwgc291cmNlRmlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZS5zZXRTb3VyY2VDb250ZW50KHNvdXJjZUZpbGUsIGNvbnRlbnQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5vZGU7XG5cbiAgICBmdW5jdGlvbiBhZGRNYXBwaW5nV2l0aENvZGUobWFwcGluZywgY29kZSkge1xuICAgICAgaWYgKG1hcHBpbmcgPT09IG51bGwgfHwgbWFwcGluZy5zb3VyY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBub2RlLmFkZChjb2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhUmVsYXRpdmVQYXRoXG4gICAgICAgICAgPyB1dGlsLmpvaW4oYVJlbGF0aXZlUGF0aCwgbWFwcGluZy5zb3VyY2UpXG4gICAgICAgICAgOiBtYXBwaW5nLnNvdXJjZTtcbiAgICAgICAgbm9kZS5hZGQobmV3IFNvdXJjZU5vZGUobWFwcGluZy5vcmlnaW5hbExpbmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcHBpbmcub3JpZ2luYWxDb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwcGluZy5uYW1lKSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4vKipcbiAqIEFkZCBhIGNodW5rIG9mIGdlbmVyYXRlZCBKUyB0byB0aGlzIHNvdXJjZSBub2RlLlxuICpcbiAqIEBwYXJhbSBhQ2h1bmsgQSBzdHJpbmcgc25pcHBldCBvZiBnZW5lcmF0ZWQgSlMgY29kZSwgYW5vdGhlciBpbnN0YW5jZSBvZlxuICogICAgICAgIFNvdXJjZU5vZGUsIG9yIGFuIGFycmF5IHdoZXJlIGVhY2ggbWVtYmVyIGlzIG9uZSBvZiB0aG9zZSB0aGluZ3MuXG4gKi9cblNvdXJjZU5vZGUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIFNvdXJjZU5vZGVfYWRkKGFDaHVuaykge1xuICBpZiAoQXJyYXkuaXNBcnJheShhQ2h1bmspKSB7XG4gICAgYUNodW5rLmZvckVhY2goZnVuY3Rpb24gKGNodW5rKSB7XG4gICAgICB0aGlzLmFkZChjaHVuayk7XG4gICAgfSwgdGhpcyk7XG4gIH1cbiAgZWxzZSBpZiAoYUNodW5rW2lzU291cmNlTm9kZV0gfHwgdHlwZW9mIGFDaHVuayA9PT0gXCJzdHJpbmdcIikge1xuICAgIGlmIChhQ2h1bmspIHtcbiAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChhQ2h1bmspO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgXCJFeHBlY3RlZCBhIFNvdXJjZU5vZGUsIHN0cmluZywgb3IgYW4gYXJyYXkgb2YgU291cmNlTm9kZXMgYW5kIHN0cmluZ3MuIEdvdCBcIiArIGFDaHVua1xuICAgICk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhIGNodW5rIG9mIGdlbmVyYXRlZCBKUyB0byB0aGUgYmVnaW5uaW5nIG9mIHRoaXMgc291cmNlIG5vZGUuXG4gKlxuICogQHBhcmFtIGFDaHVuayBBIHN0cmluZyBzbmlwcGV0IG9mIGdlbmVyYXRlZCBKUyBjb2RlLCBhbm90aGVyIGluc3RhbmNlIG9mXG4gKiAgICAgICAgU291cmNlTm9kZSwgb3IgYW4gYXJyYXkgd2hlcmUgZWFjaCBtZW1iZXIgaXMgb25lIG9mIHRob3NlIHRoaW5ncy5cbiAqL1xuU291cmNlTm9kZS5wcm90b3R5cGUucHJlcGVuZCA9IGZ1bmN0aW9uIFNvdXJjZU5vZGVfcHJlcGVuZChhQ2h1bmspIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYUNodW5rKSkge1xuICAgIGZvciAodmFyIGkgPSBhQ2h1bmsubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB0aGlzLnByZXBlbmQoYUNodW5rW2ldKTtcbiAgICB9XG4gIH1cbiAgZWxzZSBpZiAoYUNodW5rW2lzU291cmNlTm9kZV0gfHwgdHlwZW9mIGFDaHVuayA9PT0gXCJzdHJpbmdcIikge1xuICAgIHRoaXMuY2hpbGRyZW4udW5zaGlmdChhQ2h1bmspO1xuICB9XG4gIGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICBcIkV4cGVjdGVkIGEgU291cmNlTm9kZSwgc3RyaW5nLCBvciBhbiBhcnJheSBvZiBTb3VyY2VOb2RlcyBhbmQgc3RyaW5ncy4gR290IFwiICsgYUNodW5rXG4gICAgKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogV2FsayBvdmVyIHRoZSB0cmVlIG9mIEpTIHNuaXBwZXRzIGluIHRoaXMgbm9kZSBhbmQgaXRzIGNoaWxkcmVuLiBUaGVcbiAqIHdhbGtpbmcgZnVuY3Rpb24gaXMgY2FsbGVkIG9uY2UgZm9yIGVhY2ggc25pcHBldCBvZiBKUyBhbmQgaXMgcGFzc2VkIHRoYXRcbiAqIHNuaXBwZXQgYW5kIHRoZSBpdHMgb3JpZ2luYWwgYXNzb2NpYXRlZCBzb3VyY2UncyBsaW5lL2NvbHVtbiBsb2NhdGlvbi5cbiAqXG4gKiBAcGFyYW0gYUZuIFRoZSB0cmF2ZXJzYWwgZnVuY3Rpb24uXG4gKi9cblNvdXJjZU5vZGUucHJvdG90eXBlLndhbGsgPSBmdW5jdGlvbiBTb3VyY2VOb2RlX3dhbGsoYUZuKSB7XG4gIHZhciBjaHVuaztcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBjaHVuayA9IHRoaXMuY2hpbGRyZW5baV07XG4gICAgaWYgKGNodW5rW2lzU291cmNlTm9kZV0pIHtcbiAgICAgIGNodW5rLndhbGsoYUZuKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBpZiAoY2h1bmsgIT09ICcnKSB7XG4gICAgICAgIGFGbihjaHVuaywgeyBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgICAgICAgICAgbGluZTogdGhpcy5saW5lLFxuICAgICAgICAgICAgICAgICAgICAgY29sdW1uOiB0aGlzLmNvbHVtbixcbiAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogTGlrZSBgU3RyaW5nLnByb3RvdHlwZS5qb2luYCBleGNlcHQgZm9yIFNvdXJjZU5vZGVzLiBJbnNlcnRzIGBhU3RyYCBiZXR3ZWVuXG4gKiBlYWNoIG9mIGB0aGlzLmNoaWxkcmVuYC5cbiAqXG4gKiBAcGFyYW0gYVNlcCBUaGUgc2VwYXJhdG9yLlxuICovXG5Tb3VyY2VOb2RlLnByb3RvdHlwZS5qb2luID0gZnVuY3Rpb24gU291cmNlTm9kZV9qb2luKGFTZXApIHtcbiAgdmFyIG5ld0NoaWxkcmVuO1xuICB2YXIgaTtcbiAgdmFyIGxlbiA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xuICBpZiAobGVuID4gMCkge1xuICAgIG5ld0NoaWxkcmVuID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbi0xOyBpKyspIHtcbiAgICAgIG5ld0NoaWxkcmVuLnB1c2godGhpcy5jaGlsZHJlbltpXSk7XG4gICAgICBuZXdDaGlsZHJlbi5wdXNoKGFTZXApO1xuICAgIH1cbiAgICBuZXdDaGlsZHJlbi5wdXNoKHRoaXMuY2hpbGRyZW5baV0pO1xuICAgIHRoaXMuY2hpbGRyZW4gPSBuZXdDaGlsZHJlbjtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ2FsbCBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2Ugb24gdGhlIHZlcnkgcmlnaHQtbW9zdCBzb3VyY2Ugc25pcHBldC4gVXNlZnVsXG4gKiBmb3IgdHJpbW1pbmcgd2hpdGVzcGFjZSBmcm9tIHRoZSBlbmQgb2YgYSBzb3VyY2Ugbm9kZSwgZXRjLlxuICpcbiAqIEBwYXJhbSBhUGF0dGVybiBUaGUgcGF0dGVybiB0byByZXBsYWNlLlxuICogQHBhcmFtIGFSZXBsYWNlbWVudCBUaGUgdGhpbmcgdG8gcmVwbGFjZSB0aGUgcGF0dGVybiB3aXRoLlxuICovXG5Tb3VyY2VOb2RlLnByb3RvdHlwZS5yZXBsYWNlUmlnaHQgPSBmdW5jdGlvbiBTb3VyY2VOb2RlX3JlcGxhY2VSaWdodChhUGF0dGVybiwgYVJlcGxhY2VtZW50KSB7XG4gIHZhciBsYXN0Q2hpbGQgPSB0aGlzLmNoaWxkcmVuW3RoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMV07XG4gIGlmIChsYXN0Q2hpbGRbaXNTb3VyY2VOb2RlXSkge1xuICAgIGxhc3RDaGlsZC5yZXBsYWNlUmlnaHQoYVBhdHRlcm4sIGFSZXBsYWNlbWVudCk7XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIGxhc3RDaGlsZCA9PT0gJ3N0cmluZycpIHtcbiAgICB0aGlzLmNoaWxkcmVuW3RoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMV0gPSBsYXN0Q2hpbGQucmVwbGFjZShhUGF0dGVybiwgYVJlcGxhY2VtZW50KTtcbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLmNoaWxkcmVuLnB1c2goJycucmVwbGFjZShhUGF0dGVybiwgYVJlcGxhY2VtZW50KSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgc291cmNlIGNvbnRlbnQgZm9yIGEgc291cmNlIGZpbGUuIFRoaXMgd2lsbCBiZSBhZGRlZCB0byB0aGUgU291cmNlTWFwR2VuZXJhdG9yXG4gKiBpbiB0aGUgc291cmNlc0NvbnRlbnQgZmllbGQuXG4gKlxuICogQHBhcmFtIGFTb3VyY2VGaWxlIFRoZSBmaWxlbmFtZSBvZiB0aGUgc291cmNlIGZpbGVcbiAqIEBwYXJhbSBhU291cmNlQ29udGVudCBUaGUgY29udGVudCBvZiB0aGUgc291cmNlIGZpbGVcbiAqL1xuU291cmNlTm9kZS5wcm90b3R5cGUuc2V0U291cmNlQ29udGVudCA9XG4gIGZ1bmN0aW9uIFNvdXJjZU5vZGVfc2V0U291cmNlQ29udGVudChhU291cmNlRmlsZSwgYVNvdXJjZUNvbnRlbnQpIHtcbiAgICB0aGlzLnNvdXJjZUNvbnRlbnRzW3V0aWwudG9TZXRTdHJpbmcoYVNvdXJjZUZpbGUpXSA9IGFTb3VyY2VDb250ZW50O1xuICB9O1xuXG4vKipcbiAqIFdhbGsgb3ZlciB0aGUgdHJlZSBvZiBTb3VyY2VOb2Rlcy4gVGhlIHdhbGtpbmcgZnVuY3Rpb24gaXMgY2FsbGVkIGZvciBlYWNoXG4gKiBzb3VyY2UgZmlsZSBjb250ZW50IGFuZCBpcyBwYXNzZWQgdGhlIGZpbGVuYW1lIGFuZCBzb3VyY2UgY29udGVudC5cbiAqXG4gKiBAcGFyYW0gYUZuIFRoZSB0cmF2ZXJzYWwgZnVuY3Rpb24uXG4gKi9cblNvdXJjZU5vZGUucHJvdG90eXBlLndhbGtTb3VyY2VDb250ZW50cyA9XG4gIGZ1bmN0aW9uIFNvdXJjZU5vZGVfd2Fsa1NvdXJjZUNvbnRlbnRzKGFGbikge1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5jaGlsZHJlbltpXVtpc1NvdXJjZU5vZGVdKSB7XG4gICAgICAgIHRoaXMuY2hpbGRyZW5baV0ud2Fsa1NvdXJjZUNvbnRlbnRzKGFGbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHNvdXJjZXMgPSBPYmplY3Qua2V5cyh0aGlzLnNvdXJjZUNvbnRlbnRzKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gc291cmNlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgYUZuKHV0aWwuZnJvbVNldFN0cmluZyhzb3VyY2VzW2ldKSwgdGhpcy5zb3VyY2VDb250ZW50c1tzb3VyY2VzW2ldXSk7XG4gICAgfVxuICB9O1xuXG4vKipcbiAqIFJldHVybiB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgc291cmNlIG5vZGUuIFdhbGtzIG92ZXIgdGhlIHRyZWVcbiAqIGFuZCBjb25jYXRlbmF0ZXMgYWxsIHRoZSB2YXJpb3VzIHNuaXBwZXRzIHRvZ2V0aGVyIHRvIG9uZSBzdHJpbmcuXG4gKi9cblNvdXJjZU5vZGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gU291cmNlTm9kZV90b1N0cmluZygpIHtcbiAgdmFyIHN0ciA9IFwiXCI7XG4gIHRoaXMud2FsayhmdW5jdGlvbiAoY2h1bmspIHtcbiAgICBzdHIgKz0gY2h1bms7XG4gIH0pO1xuICByZXR1cm4gc3RyO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBzb3VyY2Ugbm9kZSBhbG9uZyB3aXRoIGEgc291cmNlXG4gKiBtYXAuXG4gKi9cblNvdXJjZU5vZGUucHJvdG90eXBlLnRvU3RyaW5nV2l0aFNvdXJjZU1hcCA9IGZ1bmN0aW9uIFNvdXJjZU5vZGVfdG9TdHJpbmdXaXRoU291cmNlTWFwKGFBcmdzKSB7XG4gIHZhciBnZW5lcmF0ZWQgPSB7XG4gICAgY29kZTogXCJcIixcbiAgICBsaW5lOiAxLFxuICAgIGNvbHVtbjogMFxuICB9O1xuICB2YXIgbWFwID0gbmV3IFNvdXJjZU1hcEdlbmVyYXRvcihhQXJncyk7XG4gIHZhciBzb3VyY2VNYXBwaW5nQWN0aXZlID0gZmFsc2U7XG4gIHZhciBsYXN0T3JpZ2luYWxTb3VyY2UgPSBudWxsO1xuICB2YXIgbGFzdE9yaWdpbmFsTGluZSA9IG51bGw7XG4gIHZhciBsYXN0T3JpZ2luYWxDb2x1bW4gPSBudWxsO1xuICB2YXIgbGFzdE9yaWdpbmFsTmFtZSA9IG51bGw7XG4gIHRoaXMud2FsayhmdW5jdGlvbiAoY2h1bmssIG9yaWdpbmFsKSB7XG4gICAgZ2VuZXJhdGVkLmNvZGUgKz0gY2h1bms7XG4gICAgaWYgKG9yaWdpbmFsLnNvdXJjZSAhPT0gbnVsbFxuICAgICAgICAmJiBvcmlnaW5hbC5saW5lICE9PSBudWxsXG4gICAgICAgICYmIG9yaWdpbmFsLmNvbHVtbiAhPT0gbnVsbCkge1xuICAgICAgaWYobGFzdE9yaWdpbmFsU291cmNlICE9PSBvcmlnaW5hbC5zb3VyY2VcbiAgICAgICAgIHx8IGxhc3RPcmlnaW5hbExpbmUgIT09IG9yaWdpbmFsLmxpbmVcbiAgICAgICAgIHx8IGxhc3RPcmlnaW5hbENvbHVtbiAhPT0gb3JpZ2luYWwuY29sdW1uXG4gICAgICAgICB8fCBsYXN0T3JpZ2luYWxOYW1lICE9PSBvcmlnaW5hbC5uYW1lKSB7XG4gICAgICAgIG1hcC5hZGRNYXBwaW5nKHtcbiAgICAgICAgICBzb3VyY2U6IG9yaWdpbmFsLnNvdXJjZSxcbiAgICAgICAgICBvcmlnaW5hbDoge1xuICAgICAgICAgICAgbGluZTogb3JpZ2luYWwubGluZSxcbiAgICAgICAgICAgIGNvbHVtbjogb3JpZ2luYWwuY29sdW1uXG4gICAgICAgICAgfSxcbiAgICAgICAgICBnZW5lcmF0ZWQ6IHtcbiAgICAgICAgICAgIGxpbmU6IGdlbmVyYXRlZC5saW5lLFxuICAgICAgICAgICAgY29sdW1uOiBnZW5lcmF0ZWQuY29sdW1uXG4gICAgICAgICAgfSxcbiAgICAgICAgICBuYW1lOiBvcmlnaW5hbC5uYW1lXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgbGFzdE9yaWdpbmFsU291cmNlID0gb3JpZ2luYWwuc291cmNlO1xuICAgICAgbGFzdE9yaWdpbmFsTGluZSA9IG9yaWdpbmFsLmxpbmU7XG4gICAgICBsYXN0T3JpZ2luYWxDb2x1bW4gPSBvcmlnaW5hbC5jb2x1bW47XG4gICAgICBsYXN0T3JpZ2luYWxOYW1lID0gb3JpZ2luYWwubmFtZTtcbiAgICAgIHNvdXJjZU1hcHBpbmdBY3RpdmUgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoc291cmNlTWFwcGluZ0FjdGl2ZSkge1xuICAgICAgbWFwLmFkZE1hcHBpbmcoe1xuICAgICAgICBnZW5lcmF0ZWQ6IHtcbiAgICAgICAgICBsaW5lOiBnZW5lcmF0ZWQubGluZSxcbiAgICAgICAgICBjb2x1bW46IGdlbmVyYXRlZC5jb2x1bW5cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBsYXN0T3JpZ2luYWxTb3VyY2UgPSBudWxsO1xuICAgICAgc291cmNlTWFwcGluZ0FjdGl2ZSA9IGZhbHNlO1xuICAgIH1cbiAgICBmb3IgKHZhciBpZHggPSAwLCBsZW5ndGggPSBjaHVuay5sZW5ndGg7IGlkeCA8IGxlbmd0aDsgaWR4KyspIHtcbiAgICAgIGlmIChjaHVuay5jaGFyQ29kZUF0KGlkeCkgPT09IE5FV0xJTkVfQ09ERSkge1xuICAgICAgICBnZW5lcmF0ZWQubGluZSsrO1xuICAgICAgICBnZW5lcmF0ZWQuY29sdW1uID0gMDtcbiAgICAgICAgLy8gTWFwcGluZ3MgZW5kIGF0IGVvbFxuICAgICAgICBpZiAoaWR4ICsgMSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgbGFzdE9yaWdpbmFsU291cmNlID0gbnVsbDtcbiAgICAgICAgICBzb3VyY2VNYXBwaW5nQWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoc291cmNlTWFwcGluZ0FjdGl2ZSkge1xuICAgICAgICAgIG1hcC5hZGRNYXBwaW5nKHtcbiAgICAgICAgICAgIHNvdXJjZTogb3JpZ2luYWwuc291cmNlLFxuICAgICAgICAgICAgb3JpZ2luYWw6IHtcbiAgICAgICAgICAgICAgbGluZTogb3JpZ2luYWwubGluZSxcbiAgICAgICAgICAgICAgY29sdW1uOiBvcmlnaW5hbC5jb2x1bW5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZW5lcmF0ZWQ6IHtcbiAgICAgICAgICAgICAgbGluZTogZ2VuZXJhdGVkLmxpbmUsXG4gICAgICAgICAgICAgIGNvbHVtbjogZ2VuZXJhdGVkLmNvbHVtblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5hbWU6IG9yaWdpbmFsLm5hbWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2VuZXJhdGVkLmNvbHVtbisrO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHRoaXMud2Fsa1NvdXJjZUNvbnRlbnRzKGZ1bmN0aW9uIChzb3VyY2VGaWxlLCBzb3VyY2VDb250ZW50KSB7XG4gICAgbWFwLnNldFNvdXJjZUNvbnRlbnQoc291cmNlRmlsZSwgc291cmNlQ29udGVudCk7XG4gIH0pO1xuXG4gIHJldHVybiB7IGNvZGU6IGdlbmVyYXRlZC5jb2RlLCBtYXA6IG1hcCB9O1xufTtcblxuZXhwb3J0cy5Tb3VyY2VOb2RlID0gU291cmNlTm9kZTtcbiIsIi8qIC0qLSBNb2RlOiBqczsganMtaW5kZW50LWxldmVsOiAyOyAtKi0gKi9cbi8qXG4gKiBDb3B5cmlnaHQgMjAxMSBNb3ppbGxhIEZvdW5kYXRpb24gYW5kIGNvbnRyaWJ1dG9yc1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgbGljZW5zZS4gU2VlIExJQ0VOU0Ugb3I6XG4gKiBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvQlNELTMtQ2xhdXNlXG4gKi9cblxuLyoqXG4gKiBUaGlzIGlzIGEgaGVscGVyIGZ1bmN0aW9uIGZvciBnZXR0aW5nIHZhbHVlcyBmcm9tIHBhcmFtZXRlci9vcHRpb25zXG4gKiBvYmplY3RzLlxuICpcbiAqIEBwYXJhbSBhcmdzIFRoZSBvYmplY3Qgd2UgYXJlIGV4dHJhY3RpbmcgdmFsdWVzIGZyb21cbiAqIEBwYXJhbSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB3ZSBhcmUgZ2V0dGluZy5cbiAqIEBwYXJhbSBkZWZhdWx0VmFsdWUgQW4gb3B0aW9uYWwgdmFsdWUgdG8gcmV0dXJuIGlmIHRoZSBwcm9wZXJ0eSBpcyBtaXNzaW5nXG4gKiBmcm9tIHRoZSBvYmplY3QuIElmIHRoaXMgaXMgbm90IHNwZWNpZmllZCBhbmQgdGhlIHByb3BlcnR5IGlzIG1pc3NpbmcsIGFuXG4gKiBlcnJvciB3aWxsIGJlIHRocm93bi5cbiAqL1xuZnVuY3Rpb24gZ2V0QXJnKGFBcmdzLCBhTmFtZSwgYURlZmF1bHRWYWx1ZSkge1xuICBpZiAoYU5hbWUgaW4gYUFyZ3MpIHtcbiAgICByZXR1cm4gYUFyZ3NbYU5hbWVdO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICByZXR1cm4gYURlZmF1bHRWYWx1ZTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1wiJyArIGFOYW1lICsgJ1wiIGlzIGEgcmVxdWlyZWQgYXJndW1lbnQuJyk7XG4gIH1cbn1cbmV4cG9ydHMuZ2V0QXJnID0gZ2V0QXJnO1xuXG52YXIgdXJsUmVnZXhwID0gL14oPzooW1xcdytcXC0uXSspOik/XFwvXFwvKD86KFxcdys6XFx3KylAKT8oW1xcdy5dKikoPzo6KFxcZCspKT8oXFxTKikkLztcbnZhciBkYXRhVXJsUmVnZXhwID0gL15kYXRhOi4rXFwsLiskLztcblxuZnVuY3Rpb24gdXJsUGFyc2UoYVVybCkge1xuICB2YXIgbWF0Y2ggPSBhVXJsLm1hdGNoKHVybFJlZ2V4cCk7XG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4ge1xuICAgIHNjaGVtZTogbWF0Y2hbMV0sXG4gICAgYXV0aDogbWF0Y2hbMl0sXG4gICAgaG9zdDogbWF0Y2hbM10sXG4gICAgcG9ydDogbWF0Y2hbNF0sXG4gICAgcGF0aDogbWF0Y2hbNV1cbiAgfTtcbn1cbmV4cG9ydHMudXJsUGFyc2UgPSB1cmxQYXJzZTtcblxuZnVuY3Rpb24gdXJsR2VuZXJhdGUoYVBhcnNlZFVybCkge1xuICB2YXIgdXJsID0gJyc7XG4gIGlmIChhUGFyc2VkVXJsLnNjaGVtZSkge1xuICAgIHVybCArPSBhUGFyc2VkVXJsLnNjaGVtZSArICc6JztcbiAgfVxuICB1cmwgKz0gJy8vJztcbiAgaWYgKGFQYXJzZWRVcmwuYXV0aCkge1xuICAgIHVybCArPSBhUGFyc2VkVXJsLmF1dGggKyAnQCc7XG4gIH1cbiAgaWYgKGFQYXJzZWRVcmwuaG9zdCkge1xuICAgIHVybCArPSBhUGFyc2VkVXJsLmhvc3Q7XG4gIH1cbiAgaWYgKGFQYXJzZWRVcmwucG9ydCkge1xuICAgIHVybCArPSBcIjpcIiArIGFQYXJzZWRVcmwucG9ydFxuICB9XG4gIGlmIChhUGFyc2VkVXJsLnBhdGgpIHtcbiAgICB1cmwgKz0gYVBhcnNlZFVybC5wYXRoO1xuICB9XG4gIHJldHVybiB1cmw7XG59XG5leHBvcnRzLnVybEdlbmVyYXRlID0gdXJsR2VuZXJhdGU7XG5cbi8qKlxuICogTm9ybWFsaXplcyBhIHBhdGgsIG9yIHRoZSBwYXRoIHBvcnRpb24gb2YgYSBVUkw6XG4gKlxuICogLSBSZXBsYWNlcyBjb25zZWN1dGl2ZSBzbGFzaGVzIHdpdGggb25lIHNsYXNoLlxuICogLSBSZW1vdmVzIHVubmVjZXNzYXJ5ICcuJyBwYXJ0cy5cbiAqIC0gUmVtb3ZlcyB1bm5lY2Vzc2FyeSAnPGRpcj4vLi4nIHBhcnRzLlxuICpcbiAqIEJhc2VkIG9uIGNvZGUgaW4gdGhlIE5vZGUuanMgJ3BhdGgnIGNvcmUgbW9kdWxlLlxuICpcbiAqIEBwYXJhbSBhUGF0aCBUaGUgcGF0aCBvciB1cmwgdG8gbm9ybWFsaXplLlxuICovXG5mdW5jdGlvbiBub3JtYWxpemUoYVBhdGgpIHtcbiAgdmFyIHBhdGggPSBhUGF0aDtcbiAgdmFyIHVybCA9IHVybFBhcnNlKGFQYXRoKTtcbiAgaWYgKHVybCkge1xuICAgIGlmICghdXJsLnBhdGgpIHtcbiAgICAgIHJldHVybiBhUGF0aDtcbiAgICB9XG4gICAgcGF0aCA9IHVybC5wYXRoO1xuICB9XG4gIHZhciBpc0Fic29sdXRlID0gZXhwb3J0cy5pc0Fic29sdXRlKHBhdGgpO1xuXG4gIHZhciBwYXJ0cyA9IHBhdGguc3BsaXQoL1xcLysvKTtcbiAgZm9yICh2YXIgcGFydCwgdXAgPSAwLCBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBwYXJ0ID0gcGFydHNbaV07XG4gICAgaWYgKHBhcnQgPT09ICcuJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAocGFydCA9PT0gJy4uJykge1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwID4gMCkge1xuICAgICAgaWYgKHBhcnQgPT09ICcnKSB7XG4gICAgICAgIC8vIFRoZSBmaXJzdCBwYXJ0IGlzIGJsYW5rIGlmIHRoZSBwYXRoIGlzIGFic29sdXRlLiBUcnlpbmcgdG8gZ29cbiAgICAgICAgLy8gYWJvdmUgdGhlIHJvb3QgaXMgYSBuby1vcC4gVGhlcmVmb3JlIHdlIGNhbiByZW1vdmUgYWxsICcuLicgcGFydHNcbiAgICAgICAgLy8gZGlyZWN0bHkgYWZ0ZXIgdGhlIHJvb3QuXG4gICAgICAgIHBhcnRzLnNwbGljZShpICsgMSwgdXApO1xuICAgICAgICB1cCA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJ0cy5zcGxpY2UoaSwgMik7XG4gICAgICAgIHVwLS07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHBhdGggPSBwYXJ0cy5qb2luKCcvJyk7XG5cbiAgaWYgKHBhdGggPT09ICcnKSB7XG4gICAgcGF0aCA9IGlzQWJzb2x1dGUgPyAnLycgOiAnLic7XG4gIH1cblxuICBpZiAodXJsKSB7XG4gICAgdXJsLnBhdGggPSBwYXRoO1xuICAgIHJldHVybiB1cmxHZW5lcmF0ZSh1cmwpO1xuICB9XG4gIHJldHVybiBwYXRoO1xufVxuZXhwb3J0cy5ub3JtYWxpemUgPSBub3JtYWxpemU7XG5cbi8qKlxuICogSm9pbnMgdHdvIHBhdGhzL1VSTHMuXG4gKlxuICogQHBhcmFtIGFSb290IFRoZSByb290IHBhdGggb3IgVVJMLlxuICogQHBhcmFtIGFQYXRoIFRoZSBwYXRoIG9yIFVSTCB0byBiZSBqb2luZWQgd2l0aCB0aGUgcm9vdC5cbiAqXG4gKiAtIElmIGFQYXRoIGlzIGEgVVJMIG9yIGEgZGF0YSBVUkksIGFQYXRoIGlzIHJldHVybmVkLCB1bmxlc3MgYVBhdGggaXMgYVxuICogICBzY2hlbWUtcmVsYXRpdmUgVVJMOiBUaGVuIHRoZSBzY2hlbWUgb2YgYVJvb3QsIGlmIGFueSwgaXMgcHJlcGVuZGVkXG4gKiAgIGZpcnN0LlxuICogLSBPdGhlcndpc2UgYVBhdGggaXMgYSBwYXRoLiBJZiBhUm9vdCBpcyBhIFVSTCwgdGhlbiBpdHMgcGF0aCBwb3J0aW9uXG4gKiAgIGlzIHVwZGF0ZWQgd2l0aCB0aGUgcmVzdWx0IGFuZCBhUm9vdCBpcyByZXR1cm5lZC4gT3RoZXJ3aXNlIHRoZSByZXN1bHRcbiAqICAgaXMgcmV0dXJuZWQuXG4gKiAgIC0gSWYgYVBhdGggaXMgYWJzb2x1dGUsIHRoZSByZXN1bHQgaXMgYVBhdGguXG4gKiAgIC0gT3RoZXJ3aXNlIHRoZSB0d28gcGF0aHMgYXJlIGpvaW5lZCB3aXRoIGEgc2xhc2guXG4gKiAtIEpvaW5pbmcgZm9yIGV4YW1wbGUgJ2h0dHA6Ly8nIGFuZCAnd3d3LmV4YW1wbGUuY29tJyBpcyBhbHNvIHN1cHBvcnRlZC5cbiAqL1xuZnVuY3Rpb24gam9pbihhUm9vdCwgYVBhdGgpIHtcbiAgaWYgKGFSb290ID09PSBcIlwiKSB7XG4gICAgYVJvb3QgPSBcIi5cIjtcbiAgfVxuICBpZiAoYVBhdGggPT09IFwiXCIpIHtcbiAgICBhUGF0aCA9IFwiLlwiO1xuICB9XG4gIHZhciBhUGF0aFVybCA9IHVybFBhcnNlKGFQYXRoKTtcbiAgdmFyIGFSb290VXJsID0gdXJsUGFyc2UoYVJvb3QpO1xuICBpZiAoYVJvb3RVcmwpIHtcbiAgICBhUm9vdCA9IGFSb290VXJsLnBhdGggfHwgJy8nO1xuICB9XG5cbiAgLy8gYGpvaW4oZm9vLCAnLy93d3cuZXhhbXBsZS5vcmcnKWBcbiAgaWYgKGFQYXRoVXJsICYmICFhUGF0aFVybC5zY2hlbWUpIHtcbiAgICBpZiAoYVJvb3RVcmwpIHtcbiAgICAgIGFQYXRoVXJsLnNjaGVtZSA9IGFSb290VXJsLnNjaGVtZTtcbiAgICB9XG4gICAgcmV0dXJuIHVybEdlbmVyYXRlKGFQYXRoVXJsKTtcbiAgfVxuXG4gIGlmIChhUGF0aFVybCB8fCBhUGF0aC5tYXRjaChkYXRhVXJsUmVnZXhwKSkge1xuICAgIHJldHVybiBhUGF0aDtcbiAgfVxuXG4gIC8vIGBqb2luKCdodHRwOi8vJywgJ3d3dy5leGFtcGxlLmNvbScpYFxuICBpZiAoYVJvb3RVcmwgJiYgIWFSb290VXJsLmhvc3QgJiYgIWFSb290VXJsLnBhdGgpIHtcbiAgICBhUm9vdFVybC5ob3N0ID0gYVBhdGg7XG4gICAgcmV0dXJuIHVybEdlbmVyYXRlKGFSb290VXJsKTtcbiAgfVxuXG4gIHZhciBqb2luZWQgPSBhUGF0aC5jaGFyQXQoMCkgPT09ICcvJ1xuICAgID8gYVBhdGhcbiAgICA6IG5vcm1hbGl6ZShhUm9vdC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIGFQYXRoKTtcblxuICBpZiAoYVJvb3RVcmwpIHtcbiAgICBhUm9vdFVybC5wYXRoID0gam9pbmVkO1xuICAgIHJldHVybiB1cmxHZW5lcmF0ZShhUm9vdFVybCk7XG4gIH1cbiAgcmV0dXJuIGpvaW5lZDtcbn1cbmV4cG9ydHMuam9pbiA9IGpvaW47XG5cbmV4cG9ydHMuaXNBYnNvbHV0ZSA9IGZ1bmN0aW9uIChhUGF0aCkge1xuICByZXR1cm4gYVBhdGguY2hhckF0KDApID09PSAnLycgfHwgISFhUGF0aC5tYXRjaCh1cmxSZWdleHApO1xufTtcblxuLyoqXG4gKiBNYWtlIGEgcGF0aCByZWxhdGl2ZSB0byBhIFVSTCBvciBhbm90aGVyIHBhdGguXG4gKlxuICogQHBhcmFtIGFSb290IFRoZSByb290IHBhdGggb3IgVVJMLlxuICogQHBhcmFtIGFQYXRoIFRoZSBwYXRoIG9yIFVSTCB0byBiZSBtYWRlIHJlbGF0aXZlIHRvIGFSb290LlxuICovXG5mdW5jdGlvbiByZWxhdGl2ZShhUm9vdCwgYVBhdGgpIHtcbiAgaWYgKGFSb290ID09PSBcIlwiKSB7XG4gICAgYVJvb3QgPSBcIi5cIjtcbiAgfVxuXG4gIGFSb290ID0gYVJvb3QucmVwbGFjZSgvXFwvJC8sICcnKTtcblxuICAvLyBJdCBpcyBwb3NzaWJsZSBmb3IgdGhlIHBhdGggdG8gYmUgYWJvdmUgdGhlIHJvb3QuIEluIHRoaXMgY2FzZSwgc2ltcGx5XG4gIC8vIGNoZWNraW5nIHdoZXRoZXIgdGhlIHJvb3QgaXMgYSBwcmVmaXggb2YgdGhlIHBhdGggd29uJ3Qgd29yay4gSW5zdGVhZCwgd2VcbiAgLy8gbmVlZCB0byByZW1vdmUgY29tcG9uZW50cyBmcm9tIHRoZSByb290IG9uZSBieSBvbmUsIHVudGlsIGVpdGhlciB3ZSBmaW5kXG4gIC8vIGEgcHJlZml4IHRoYXQgZml0cywgb3Igd2UgcnVuIG91dCBvZiBjb21wb25lbnRzIHRvIHJlbW92ZS5cbiAgdmFyIGxldmVsID0gMDtcbiAgd2hpbGUgKGFQYXRoLmluZGV4T2YoYVJvb3QgKyAnLycpICE9PSAwKSB7XG4gICAgdmFyIGluZGV4ID0gYVJvb3QubGFzdEluZGV4T2YoXCIvXCIpO1xuICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgIHJldHVybiBhUGF0aDtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgb25seSBwYXJ0IG9mIHRoZSByb290IHRoYXQgaXMgbGVmdCBpcyB0aGUgc2NoZW1lIChpLmUuIGh0dHA6Ly8sXG4gICAgLy8gZmlsZTovLy8sIGV0Yy4pLCBvbmUgb3IgbW9yZSBzbGFzaGVzICgvKSwgb3Igc2ltcGx5IG5vdGhpbmcgYXQgYWxsLCB3ZVxuICAgIC8vIGhhdmUgZXhoYXVzdGVkIGFsbCBjb21wb25lbnRzLCBzbyB0aGUgcGF0aCBpcyBub3QgcmVsYXRpdmUgdG8gdGhlIHJvb3QuXG4gICAgYVJvb3QgPSBhUm9vdC5zbGljZSgwLCBpbmRleCk7XG4gICAgaWYgKGFSb290Lm1hdGNoKC9eKFteXFwvXSs6XFwvKT9cXC8qJC8pKSB7XG4gICAgICByZXR1cm4gYVBhdGg7XG4gICAgfVxuXG4gICAgKytsZXZlbDtcbiAgfVxuXG4gIC8vIE1ha2Ugc3VyZSB3ZSBhZGQgYSBcIi4uL1wiIGZvciBlYWNoIGNvbXBvbmVudCB3ZSByZW1vdmVkIGZyb20gdGhlIHJvb3QuXG4gIHJldHVybiBBcnJheShsZXZlbCArIDEpLmpvaW4oXCIuLi9cIikgKyBhUGF0aC5zdWJzdHIoYVJvb3QubGVuZ3RoICsgMSk7XG59XG5leHBvcnRzLnJlbGF0aXZlID0gcmVsYXRpdmU7XG5cbnZhciBzdXBwb3J0c051bGxQcm90byA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBvYmogPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICByZXR1cm4gISgnX19wcm90b19fJyBpbiBvYmopO1xufSgpKTtcblxuZnVuY3Rpb24gaWRlbnRpdHkgKHMpIHtcbiAgcmV0dXJuIHM7XG59XG5cbi8qKlxuICogQmVjYXVzZSBiZWhhdmlvciBnb2VzIHdhY2t5IHdoZW4geW91IHNldCBgX19wcm90b19fYCBvbiBvYmplY3RzLCB3ZVxuICogaGF2ZSB0byBwcmVmaXggYWxsIHRoZSBzdHJpbmdzIGluIG91ciBzZXQgd2l0aCBhbiBhcmJpdHJhcnkgY2hhcmFjdGVyLlxuICpcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9zb3VyY2UtbWFwL3B1bGwvMzEgYW5kXG4gKiBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9zb3VyY2UtbWFwL2lzc3Vlcy8zMFxuICpcbiAqIEBwYXJhbSBTdHJpbmcgYVN0clxuICovXG5mdW5jdGlvbiB0b1NldFN0cmluZyhhU3RyKSB7XG4gIGlmIChpc1Byb3RvU3RyaW5nKGFTdHIpKSB7XG4gICAgcmV0dXJuICckJyArIGFTdHI7XG4gIH1cblxuICByZXR1cm4gYVN0cjtcbn1cbmV4cG9ydHMudG9TZXRTdHJpbmcgPSBzdXBwb3J0c051bGxQcm90byA/IGlkZW50aXR5IDogdG9TZXRTdHJpbmc7XG5cbmZ1bmN0aW9uIGZyb21TZXRTdHJpbmcoYVN0cikge1xuICBpZiAoaXNQcm90b1N0cmluZyhhU3RyKSkge1xuICAgIHJldHVybiBhU3RyLnNsaWNlKDEpO1xuICB9XG5cbiAgcmV0dXJuIGFTdHI7XG59XG5leHBvcnRzLmZyb21TZXRTdHJpbmcgPSBzdXBwb3J0c051bGxQcm90byA/IGlkZW50aXR5IDogZnJvbVNldFN0cmluZztcblxuZnVuY3Rpb24gaXNQcm90b1N0cmluZyhzKSB7XG4gIGlmICghcykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBsZW5ndGggPSBzLmxlbmd0aDtcblxuICBpZiAobGVuZ3RoIDwgOSAvKiBcIl9fcHJvdG9fX1wiLmxlbmd0aCAqLykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChzLmNoYXJDb2RlQXQobGVuZ3RoIC0gMSkgIT09IDk1ICAvKiAnXycgKi8gfHxcbiAgICAgIHMuY2hhckNvZGVBdChsZW5ndGggLSAyKSAhPT0gOTUgIC8qICdfJyAqLyB8fFxuICAgICAgcy5jaGFyQ29kZUF0KGxlbmd0aCAtIDMpICE9PSAxMTEgLyogJ28nICovIHx8XG4gICAgICBzLmNoYXJDb2RlQXQobGVuZ3RoIC0gNCkgIT09IDExNiAvKiAndCcgKi8gfHxcbiAgICAgIHMuY2hhckNvZGVBdChsZW5ndGggLSA1KSAhPT0gMTExIC8qICdvJyAqLyB8fFxuICAgICAgcy5jaGFyQ29kZUF0KGxlbmd0aCAtIDYpICE9PSAxMTQgLyogJ3InICovIHx8XG4gICAgICBzLmNoYXJDb2RlQXQobGVuZ3RoIC0gNykgIT09IDExMiAvKiAncCcgKi8gfHxcbiAgICAgIHMuY2hhckNvZGVBdChsZW5ndGggLSA4KSAhPT0gOTUgIC8qICdfJyAqLyB8fFxuICAgICAgcy5jaGFyQ29kZUF0KGxlbmd0aCAtIDkpICE9PSA5NSAgLyogJ18nICovKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IGxlbmd0aCAtIDEwOyBpID49IDA7IGktLSkge1xuICAgIGlmIChzLmNoYXJDb2RlQXQoaSkgIT09IDM2IC8qICckJyAqLykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIENvbXBhcmF0b3IgYmV0d2VlbiB0d28gbWFwcGluZ3Mgd2hlcmUgdGhlIG9yaWdpbmFsIHBvc2l0aW9ucyBhcmUgY29tcGFyZWQuXG4gKlxuICogT3B0aW9uYWxseSBwYXNzIGluIGB0cnVlYCBhcyBgb25seUNvbXBhcmVHZW5lcmF0ZWRgIHRvIGNvbnNpZGVyIHR3b1xuICogbWFwcGluZ3Mgd2l0aCB0aGUgc2FtZSBvcmlnaW5hbCBzb3VyY2UvbGluZS9jb2x1bW4sIGJ1dCBkaWZmZXJlbnQgZ2VuZXJhdGVkXG4gKiBsaW5lIGFuZCBjb2x1bW4gdGhlIHNhbWUuIFVzZWZ1bCB3aGVuIHNlYXJjaGluZyBmb3IgYSBtYXBwaW5nIHdpdGggYVxuICogc3R1YmJlZCBvdXQgbWFwcGluZy5cbiAqL1xuZnVuY3Rpb24gY29tcGFyZUJ5T3JpZ2luYWxQb3NpdGlvbnMobWFwcGluZ0EsIG1hcHBpbmdCLCBvbmx5Q29tcGFyZU9yaWdpbmFsKSB7XG4gIHZhciBjbXAgPSBtYXBwaW5nQS5zb3VyY2UgLSBtYXBwaW5nQi5zb3VyY2U7XG4gIGlmIChjbXAgIT09IDApIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG5cbiAgY21wID0gbWFwcGluZ0Eub3JpZ2luYWxMaW5lIC0gbWFwcGluZ0Iub3JpZ2luYWxMaW5lO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLm9yaWdpbmFsQ29sdW1uIC0gbWFwcGluZ0Iub3JpZ2luYWxDb2x1bW47XG4gIGlmIChjbXAgIT09IDAgfHwgb25seUNvbXBhcmVPcmlnaW5hbCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBtYXBwaW5nQS5nZW5lcmF0ZWRDb2x1bW4gLSBtYXBwaW5nQi5nZW5lcmF0ZWRDb2x1bW47XG4gIGlmIChjbXAgIT09IDApIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG5cbiAgY21wID0gbWFwcGluZ0EuZ2VuZXJhdGVkTGluZSAtIG1hcHBpbmdCLmdlbmVyYXRlZExpbmU7XG4gIGlmIChjbXAgIT09IDApIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG5cbiAgcmV0dXJuIG1hcHBpbmdBLm5hbWUgLSBtYXBwaW5nQi5uYW1lO1xufVxuZXhwb3J0cy5jb21wYXJlQnlPcmlnaW5hbFBvc2l0aW9ucyA9IGNvbXBhcmVCeU9yaWdpbmFsUG9zaXRpb25zO1xuXG4vKipcbiAqIENvbXBhcmF0b3IgYmV0d2VlbiB0d28gbWFwcGluZ3Mgd2l0aCBkZWZsYXRlZCBzb3VyY2UgYW5kIG5hbWUgaW5kaWNlcyB3aGVyZVxuICogdGhlIGdlbmVyYXRlZCBwb3NpdGlvbnMgYXJlIGNvbXBhcmVkLlxuICpcbiAqIE9wdGlvbmFsbHkgcGFzcyBpbiBgdHJ1ZWAgYXMgYG9ubHlDb21wYXJlR2VuZXJhdGVkYCB0byBjb25zaWRlciB0d29cbiAqIG1hcHBpbmdzIHdpdGggdGhlIHNhbWUgZ2VuZXJhdGVkIGxpbmUgYW5kIGNvbHVtbiwgYnV0IGRpZmZlcmVudFxuICogc291cmNlL25hbWUvb3JpZ2luYWwgbGluZSBhbmQgY29sdW1uIHRoZSBzYW1lLiBVc2VmdWwgd2hlbiBzZWFyY2hpbmcgZm9yIGFcbiAqIG1hcHBpbmcgd2l0aCBhIHN0dWJiZWQgb3V0IG1hcHBpbmcuXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0RlZmxhdGVkKG1hcHBpbmdBLCBtYXBwaW5nQiwgb25seUNvbXBhcmVHZW5lcmF0ZWQpIHtcbiAgdmFyIGNtcCA9IG1hcHBpbmdBLmdlbmVyYXRlZExpbmUgLSBtYXBwaW5nQi5nZW5lcmF0ZWRMaW5lO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLmdlbmVyYXRlZENvbHVtbiAtIG1hcHBpbmdCLmdlbmVyYXRlZENvbHVtbjtcbiAgaWYgKGNtcCAhPT0gMCB8fCBvbmx5Q29tcGFyZUdlbmVyYXRlZCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBtYXBwaW5nQS5zb3VyY2UgLSBtYXBwaW5nQi5zb3VyY2U7XG4gIGlmIChjbXAgIT09IDApIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG5cbiAgY21wID0gbWFwcGluZ0Eub3JpZ2luYWxMaW5lIC0gbWFwcGluZ0Iub3JpZ2luYWxMaW5lO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLm9yaWdpbmFsQ29sdW1uIC0gbWFwcGluZ0Iub3JpZ2luYWxDb2x1bW47XG4gIGlmIChjbXAgIT09IDApIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG5cbiAgcmV0dXJuIG1hcHBpbmdBLm5hbWUgLSBtYXBwaW5nQi5uYW1lO1xufVxuZXhwb3J0cy5jb21wYXJlQnlHZW5lcmF0ZWRQb3NpdGlvbnNEZWZsYXRlZCA9IGNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0RlZmxhdGVkO1xuXG5mdW5jdGlvbiBzdHJjbXAoYVN0cjEsIGFTdHIyKSB7XG4gIGlmIChhU3RyMSA9PT0gYVN0cjIpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGlmIChhU3RyMSA+IGFTdHIyKSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogQ29tcGFyYXRvciBiZXR3ZWVuIHR3byBtYXBwaW5ncyB3aXRoIGluZmxhdGVkIHNvdXJjZSBhbmQgbmFtZSBzdHJpbmdzIHdoZXJlXG4gKiB0aGUgZ2VuZXJhdGVkIHBvc2l0aW9ucyBhcmUgY29tcGFyZWQuXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0luZmxhdGVkKG1hcHBpbmdBLCBtYXBwaW5nQikge1xuICB2YXIgY21wID0gbWFwcGluZ0EuZ2VuZXJhdGVkTGluZSAtIG1hcHBpbmdCLmdlbmVyYXRlZExpbmU7XG4gIGlmIChjbXAgIT09IDApIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG5cbiAgY21wID0gbWFwcGluZ0EuZ2VuZXJhdGVkQ29sdW1uIC0gbWFwcGluZ0IuZ2VuZXJhdGVkQ29sdW1uO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IHN0cmNtcChtYXBwaW5nQS5zb3VyY2UsIG1hcHBpbmdCLnNvdXJjZSk7XG4gIGlmIChjbXAgIT09IDApIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG5cbiAgY21wID0gbWFwcGluZ0Eub3JpZ2luYWxMaW5lIC0gbWFwcGluZ0Iub3JpZ2luYWxMaW5lO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLm9yaWdpbmFsQ29sdW1uIC0gbWFwcGluZ0Iub3JpZ2luYWxDb2x1bW47XG4gIGlmIChjbXAgIT09IDApIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG5cbiAgcmV0dXJuIHN0cmNtcChtYXBwaW5nQS5uYW1lLCBtYXBwaW5nQi5uYW1lKTtcbn1cbmV4cG9ydHMuY29tcGFyZUJ5R2VuZXJhdGVkUG9zaXRpb25zSW5mbGF0ZWQgPSBjb21wYXJlQnlHZW5lcmF0ZWRQb3NpdGlvbnNJbmZsYXRlZDtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwOS0yMDExIE1vemlsbGEgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBsaWNlbnNlLiBTZWUgTElDRU5TRS50eHQgb3I6XG4gKiBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvQlNELTMtQ2xhdXNlXG4gKi9cbmV4cG9ydHMuU291cmNlTWFwR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9saWIvc291cmNlLW1hcC1nZW5lcmF0b3InKS5Tb3VyY2VNYXBHZW5lcmF0b3I7XG5leHBvcnRzLlNvdXJjZU1hcENvbnN1bWVyID0gcmVxdWlyZSgnLi9saWIvc291cmNlLW1hcC1jb25zdW1lcicpLlNvdXJjZU1hcENvbnN1bWVyO1xuZXhwb3J0cy5Tb3VyY2VOb2RlID0gcmVxdWlyZSgnLi9saWIvc291cmNlLW5vZGUnKS5Tb3VyY2VOb2RlO1xuIiwiKGZ1bmN0aW9uKHJvb3QsIGZhY3RvcnkpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgLy8gVW5pdmVyc2FsIE1vZHVsZSBEZWZpbml0aW9uIChVTUQpIHRvIHN1cHBvcnQgQU1ELCBDb21tb25KUy9Ob2RlLmpzLCBSaGlubywgYW5kIGJyb3dzZXJzLlxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZSgnc3RhY2tmcmFtZScsIFtdLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlN0YWNrRnJhbWUgPSBmYWN0b3J5KCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgZnVuY3Rpb24gX2lzTnVtYmVyKG4pIHtcbiAgICAgICAgcmV0dXJuICFpc05hTihwYXJzZUZsb2F0KG4pKSAmJiBpc0Zpbml0ZShuKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfY2FwaXRhbGl6ZShzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zdWJzdHJpbmcoMSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2dldHRlcihwKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzW3BdO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHZhciBib29sZWFuUHJvcHMgPSBbJ2lzQ29uc3RydWN0b3InLCAnaXNFdmFsJywgJ2lzTmF0aXZlJywgJ2lzVG9wbGV2ZWwnXTtcbiAgICB2YXIgbnVtZXJpY1Byb3BzID0gWydjb2x1bW5OdW1iZXInLCAnbGluZU51bWJlciddO1xuICAgIHZhciBzdHJpbmdQcm9wcyA9IFsnZmlsZU5hbWUnLCAnZnVuY3Rpb25OYW1lJywgJ3NvdXJjZSddO1xuICAgIHZhciBhcnJheVByb3BzID0gWydhcmdzJ107XG4gICAgdmFyIG9iamVjdFByb3BzID0gWydldmFsT3JpZ2luJ107XG5cbiAgICB2YXIgcHJvcHMgPSBib29sZWFuUHJvcHMuY29uY2F0KG51bWVyaWNQcm9wcywgc3RyaW5nUHJvcHMsIGFycmF5UHJvcHMsIG9iamVjdFByb3BzKTtcblxuICAgIGZ1bmN0aW9uIFN0YWNrRnJhbWUob2JqKSB7XG4gICAgICAgIGlmICghb2JqKSByZXR1cm47XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChvYmpbcHJvcHNbaV1dICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzWydzZXQnICsgX2NhcGl0YWxpemUocHJvcHNbaV0pXShvYmpbcHJvcHNbaV1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIFN0YWNrRnJhbWUucHJvdG90eXBlID0ge1xuICAgICAgICBnZXRBcmdzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFyZ3M7XG4gICAgICAgIH0sXG4gICAgICAgIHNldEFyZ3M6IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodikgIT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmdzIG11c3QgYmUgYW4gQXJyYXknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYXJncyA9IHY7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RXZhbE9yaWdpbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ldmFsT3JpZ2luO1xuICAgICAgICB9LFxuICAgICAgICBzZXRFdmFsT3JpZ2luOiBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICBpZiAodiBpbnN0YW5jZW9mIFN0YWNrRnJhbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV2YWxPcmlnaW4gPSB2O1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2IGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ldmFsT3JpZ2luID0gbmV3IFN0YWNrRnJhbWUodik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V2YWwgT3JpZ2luIG11c3QgYmUgYW4gT2JqZWN0IG9yIFN0YWNrRnJhbWUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZmlsZU5hbWUgPSB0aGlzLmdldEZpbGVOYW1lKCkgfHwgJyc7XG4gICAgICAgICAgICB2YXIgbGluZU51bWJlciA9IHRoaXMuZ2V0TGluZU51bWJlcigpIHx8ICcnO1xuICAgICAgICAgICAgdmFyIGNvbHVtbk51bWJlciA9IHRoaXMuZ2V0Q29sdW1uTnVtYmVyKCkgfHwgJyc7XG4gICAgICAgICAgICB2YXIgZnVuY3Rpb25OYW1lID0gdGhpcy5nZXRGdW5jdGlvbk5hbWUoKSB8fCAnJztcbiAgICAgICAgICAgIGlmICh0aGlzLmdldElzRXZhbCgpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnW2V2YWxdICgnICsgZmlsZU5hbWUgKyAnOicgKyBsaW5lTnVtYmVyICsgJzonICsgY29sdW1uTnVtYmVyICsgJyknO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gJ1tldmFsXTonICsgbGluZU51bWJlciArICc6JyArIGNvbHVtbk51bWJlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmdW5jdGlvbk5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb25OYW1lICsgJyAoJyArIGZpbGVOYW1lICsgJzonICsgbGluZU51bWJlciArICc6JyArIGNvbHVtbk51bWJlciArICcpJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmaWxlTmFtZSArICc6JyArIGxpbmVOdW1iZXIgKyAnOicgKyBjb2x1bW5OdW1iZXI7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgU3RhY2tGcmFtZS5mcm9tU3RyaW5nID0gZnVuY3Rpb24gU3RhY2tGcmFtZSQkZnJvbVN0cmluZyhzdHIpIHtcbiAgICAgICAgdmFyIGFyZ3NTdGFydEluZGV4ID0gc3RyLmluZGV4T2YoJygnKTtcbiAgICAgICAgdmFyIGFyZ3NFbmRJbmRleCA9IHN0ci5sYXN0SW5kZXhPZignKScpO1xuXG4gICAgICAgIHZhciBmdW5jdGlvbk5hbWUgPSBzdHIuc3Vic3RyaW5nKDAsIGFyZ3NTdGFydEluZGV4KTtcbiAgICAgICAgdmFyIGFyZ3MgPSBzdHIuc3Vic3RyaW5nKGFyZ3NTdGFydEluZGV4ICsgMSwgYXJnc0VuZEluZGV4KS5zcGxpdCgnLCcpO1xuICAgICAgICB2YXIgbG9jYXRpb25TdHJpbmcgPSBzdHIuc3Vic3RyaW5nKGFyZ3NFbmRJbmRleCArIDEpO1xuXG4gICAgICAgIGlmIChsb2NhdGlvblN0cmluZy5pbmRleE9mKCdAJykgPT09IDApIHtcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IC9AKC4rPykoPzo6KFxcZCspKT8oPzo6KFxcZCspKT8kLy5leGVjKGxvY2F0aW9uU3RyaW5nLCAnJyk7XG4gICAgICAgICAgICB2YXIgZmlsZU5hbWUgPSBwYXJ0c1sxXTtcbiAgICAgICAgICAgIHZhciBsaW5lTnVtYmVyID0gcGFydHNbMl07XG4gICAgICAgICAgICB2YXIgY29sdW1uTnVtYmVyID0gcGFydHNbM107XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFN0YWNrRnJhbWUoe1xuICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiBmdW5jdGlvbk5hbWUsXG4gICAgICAgICAgICBhcmdzOiBhcmdzIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGZpbGVOYW1lOiBmaWxlTmFtZSxcbiAgICAgICAgICAgIGxpbmVOdW1iZXI6IGxpbmVOdW1iZXIgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgY29sdW1uTnVtYmVyOiBjb2x1bW5OdW1iZXIgfHwgdW5kZWZpbmVkXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJvb2xlYW5Qcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBTdGFja0ZyYW1lLnByb3RvdHlwZVsnZ2V0JyArIF9jYXBpdGFsaXplKGJvb2xlYW5Qcm9wc1tpXSldID0gX2dldHRlcihib29sZWFuUHJvcHNbaV0pO1xuICAgICAgICBTdGFja0ZyYW1lLnByb3RvdHlwZVsnc2V0JyArIF9jYXBpdGFsaXplKGJvb2xlYW5Qcm9wc1tpXSldID0gKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgdGhpc1twXSA9IEJvb2xlYW4odik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KShib29sZWFuUHJvcHNbaV0pO1xuICAgIH1cblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgbnVtZXJpY1Byb3BzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIFN0YWNrRnJhbWUucHJvdG90eXBlWydnZXQnICsgX2NhcGl0YWxpemUobnVtZXJpY1Byb3BzW2pdKV0gPSBfZ2V0dGVyKG51bWVyaWNQcm9wc1tqXSk7XG4gICAgICAgIFN0YWNrRnJhbWUucHJvdG90eXBlWydzZXQnICsgX2NhcGl0YWxpemUobnVtZXJpY1Byb3BzW2pdKV0gPSAoZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgICAgICBpZiAoIV9pc051bWJlcih2KSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHAgKyAnIG11c3QgYmUgYSBOdW1iZXInKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpc1twXSA9IE51bWJlcih2KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pKG51bWVyaWNQcm9wc1tqXSk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBzdHJpbmdQcm9wcy5sZW5ndGg7IGsrKykge1xuICAgICAgICBTdGFja0ZyYW1lLnByb3RvdHlwZVsnZ2V0JyArIF9jYXBpdGFsaXplKHN0cmluZ1Byb3BzW2tdKV0gPSBfZ2V0dGVyKHN0cmluZ1Byb3BzW2tdKTtcbiAgICAgICAgU3RhY2tGcmFtZS5wcm90b3R5cGVbJ3NldCcgKyBfY2FwaXRhbGl6ZShzdHJpbmdQcm9wc1trXSldID0gKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgdGhpc1twXSA9IFN0cmluZyh2KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pKHN0cmluZ1Byb3BzW2tdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gU3RhY2tGcmFtZTtcbn0pKTtcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICAvLyBVbml2ZXJzYWwgTW9kdWxlIERlZmluaXRpb24gKFVNRCkgdG8gc3VwcG9ydCBBTUQsIENvbW1vbkpTL05vZGUuanMsIFJoaW5vLCBhbmQgYnJvd3NlcnMuXG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKCdzdGFjay1nZW5lcmF0b3InLCBbJ3N0YWNrZnJhbWUnXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ3N0YWNrZnJhbWUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5TdGFja0dlbmVyYXRvciA9IGZhY3Rvcnkocm9vdC5TdGFja0ZyYW1lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIChTdGFja0ZyYW1lKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYmFja3RyYWNlOiBmdW5jdGlvbiBTdGFja0dlbmVyYXRvciQkYmFja3RyYWNlKG9wdHMpIHtcbiAgICAgICAgICAgIHZhciBzdGFjayA9IFtdO1xuICAgICAgICAgICAgdmFyIG1heFN0YWNrU2l6ZSA9IDEwO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBvcHRzLm1heFN0YWNrU2l6ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBtYXhTdGFja1NpemUgPSBvcHRzLm1heFN0YWNrU2l6ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGN1cnIgPSBhcmd1bWVudHMuY2FsbGVlO1xuICAgICAgICAgICAgd2hpbGUgKGN1cnIgJiYgc3RhY2subGVuZ3RoIDwgbWF4U3RhY2tTaXplKSB7XG4gICAgICAgICAgICAgICAgLy8gQWxsb3cgVjggb3B0aW1pemF0aW9uc1xuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGN1cnJbJ2FyZ3VtZW50cyddLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJnc1tpXSA9IGN1cnJbJ2FyZ3VtZW50cyddW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoL2Z1bmN0aW9uKD86XFxzKyhbXFx3JF0rKSkrXFxzKlxcKC8udGVzdChjdXJyLnRvU3RyaW5nKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnB1c2gobmV3IFN0YWNrRnJhbWUoe2Z1bmN0aW9uTmFtZTogUmVnRXhwLiQxIHx8IHVuZGVmaW5lZCwgYXJnczogYXJnc30pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKG5ldyBTdGFja0ZyYW1lKHthcmdzOiBhcmdzfSkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnIgPSBjdXJyLmNhbGxlcjtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdGFjaztcbiAgICAgICAgfVxuICAgIH07XG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgLy8gVW5pdmVyc2FsIE1vZHVsZSBEZWZpbml0aW9uIChVTUQpIHRvIHN1cHBvcnQgQU1ELCBDb21tb25KUy9Ob2RlLmpzLCBSaGlubywgYW5kIGJyb3dzZXJzLlxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZSgnc3RhY2tmcmFtZScsIFtdLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LlN0YWNrRnJhbWUgPSBmYWN0b3J5KCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGZ1bmN0aW9uIF9pc051bWJlcihuKSB7XG4gICAgICAgIHJldHVybiAhaXNOYU4ocGFyc2VGbG9hdChuKSkgJiYgaXNGaW5pdGUobik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gU3RhY2tGcmFtZShmdW5jdGlvbk5hbWUsIGFyZ3MsIGZpbGVOYW1lLCBsaW5lTnVtYmVyLCBjb2x1bW5OdW1iZXIsIHNvdXJjZSkge1xuICAgICAgICBpZiAoZnVuY3Rpb25OYW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RnVuY3Rpb25OYW1lKGZ1bmN0aW9uTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFyZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRBcmdzKGFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWxlTmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnNldEZpbGVOYW1lKGZpbGVOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGluZU51bWJlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnNldExpbmVOdW1iZXIobGluZU51bWJlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbHVtbk51bWJlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnNldENvbHVtbk51bWJlcihjb2x1bW5OdW1iZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzb3VyY2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTb3VyY2Uoc291cmNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFN0YWNrRnJhbWUucHJvdG90eXBlID0ge1xuICAgICAgICBnZXRGdW5jdGlvbk5hbWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZ1bmN0aW9uTmFtZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0RnVuY3Rpb25OYW1lOiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgdGhpcy5mdW5jdGlvbk5hbWUgPSBTdHJpbmcodik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0QXJnczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXJncztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0QXJnczogZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodikgIT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmdzIG11c3QgYmUgYW4gQXJyYXknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYXJncyA9IHY7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gTk9URTogUHJvcGVydHkgbmFtZSBtYXkgYmUgbWlzbGVhZGluZyBhcyBpdCBpbmNsdWRlcyB0aGUgcGF0aCxcbiAgICAgICAgLy8gYnV0IGl0IHNvbWV3aGF0IG1pcnJvcnMgVjgncyBKYXZhU2NyaXB0U3RhY2tUcmFjZUFwaVxuICAgICAgICAvLyBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L3dpa2kvSmF2YVNjcmlwdFN0YWNrVHJhY2VBcGkgYW5kIEdlY2tvJ3NcbiAgICAgICAgLy8gaHR0cDovL214ci5tb3ppbGxhLm9yZy9tb3ppbGxhLWNlbnRyYWwvc291cmNlL3hwY29tL2Jhc2UvbnNJRXhjZXB0aW9uLmlkbCMxNFxuICAgICAgICBnZXRGaWxlTmFtZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsZU5hbWU7XG4gICAgICAgIH0sXG4gICAgICAgIHNldEZpbGVOYW1lOiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgdGhpcy5maWxlTmFtZSA9IFN0cmluZyh2KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMaW5lTnVtYmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saW5lTnVtYmVyO1xuICAgICAgICB9LFxuICAgICAgICBzZXRMaW5lTnVtYmVyOiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgaWYgKCFfaXNOdW1iZXIodikpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdMaW5lIE51bWJlciBtdXN0IGJlIGEgTnVtYmVyJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmxpbmVOdW1iZXIgPSBOdW1iZXIodik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29sdW1uTnVtYmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2x1bW5OdW1iZXI7XG4gICAgICAgIH0sXG4gICAgICAgIHNldENvbHVtbk51bWJlcjogZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIGlmICghX2lzTnVtYmVyKHYpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ29sdW1uIE51bWJlciBtdXN0IGJlIGEgTnVtYmVyJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNvbHVtbk51bWJlciA9IE51bWJlcih2KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTb3VyY2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0U291cmNlOiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgdGhpcy5zb3VyY2UgPSBTdHJpbmcodik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGZ1bmN0aW9uTmFtZSA9IHRoaXMuZ2V0RnVuY3Rpb25OYW1lKCkgfHwgJ3thbm9ueW1vdXN9JztcbiAgICAgICAgICAgIHZhciBhcmdzID0gJygnICsgKHRoaXMuZ2V0QXJncygpIHx8IFtdKS5qb2luKCcsJykgKyAnKSc7XG4gICAgICAgICAgICB2YXIgZmlsZU5hbWUgPSB0aGlzLmdldEZpbGVOYW1lKCkgPyAoJ0AnICsgdGhpcy5nZXRGaWxlTmFtZSgpKSA6ICcnO1xuICAgICAgICAgICAgdmFyIGxpbmVOdW1iZXIgPSBfaXNOdW1iZXIodGhpcy5nZXRMaW5lTnVtYmVyKCkpID8gKCc6JyArIHRoaXMuZ2V0TGluZU51bWJlcigpKSA6ICcnO1xuICAgICAgICAgICAgdmFyIGNvbHVtbk51bWJlciA9IF9pc051bWJlcih0aGlzLmdldENvbHVtbk51bWJlcigpKSA/ICgnOicgKyB0aGlzLmdldENvbHVtbk51bWJlcigpKSA6ICcnO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uTmFtZSArIGFyZ3MgKyBmaWxlTmFtZSArIGxpbmVOdW1iZXIgKyBjb2x1bW5OdW1iZXI7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIFN0YWNrRnJhbWU7XG59KSk7XG4iLCIoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICAvLyBVbml2ZXJzYWwgTW9kdWxlIERlZmluaXRpb24gKFVNRCkgdG8gc3VwcG9ydCBBTUQsIENvbW1vbkpTL05vZGUuanMsIFJoaW5vLCBhbmQgYnJvd3NlcnMuXG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKCdzdGFja3RyYWNlLWdwcycsIFsnc291cmNlLW1hcCcsICdzdGFja2ZyYW1lJ10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdzb3VyY2UtbWFwL2xpYi9zb3VyY2UtbWFwLWNvbnN1bWVyJyksIHJlcXVpcmUoJ3N0YWNrZnJhbWUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5TdGFja1RyYWNlR1BTID0gZmFjdG9yeShyb290LlNvdXJjZU1hcCB8fCByb290LnNvdXJjZU1hcCwgcm9vdC5TdGFja0ZyYW1lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uKFNvdXJjZU1hcCwgU3RhY2tGcmFtZSkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKlxuICAgICAqIE1ha2UgYSBYLURvbWFpbiByZXF1ZXN0IHRvIHVybCBhbmQgY2FsbGJhY2suXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gICAgICogQHJldHVybnMge1Byb21pc2V9IHdpdGggcmVzcG9uc2UgdGV4dCBpZiBmdWxmaWxsZWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBfeGRyKHVybCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICByZXEub3BlbignZ2V0JywgdXJsKTtcbiAgICAgICAgICAgIHJlcS5vbmVycm9yID0gcmVqZWN0O1xuICAgICAgICAgICAgcmVxLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIG9ucmVhZHlzdGF0ZWNoYW5nZSgpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVxLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcS5zdGF0dXMgPj0gMjAwICYmIHJlcS5zdGF0dXMgPCAzMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdIVFRQIHN0YXR1czogJyArIHJlcS5zdGF0dXMgKyAnIHJldHJpZXZpbmcgJyArIHVybCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlcS5zZW5kKCk7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydCBhIEJhc2U2NC1lbmNvZGVkIHN0cmluZyBpbnRvIGl0cyBvcmlnaW5hbCByZXByZXNlbnRhdGlvbi5cbiAgICAgKiBVc2VkIGZvciBpbmxpbmUgc291cmNlbWFwcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBiNjRzdHIgQmFzZS02NCBlbmNvZGVkIHN0cmluZ1xuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IG9yaWdpbmFsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBiYXNlNjQtZW5jb2RlZCBzdHJpbmcuXG4gICAgICovXG4gICAgZnVuY3Rpb24gX2F0b2IoYjY0c3RyKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuYXRvYikge1xuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5hdG9iKGI2NHN0cik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBtdXN0IHN1cHBseSBhIHBvbHlmaWxsIGZvciB3aW5kb3cuYXRvYiBpbiB0aGlzIGVudmlyb25tZW50Jyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcGFyc2VKc29uKHN0cmluZykge1xuICAgICAgICBpZiAodHlwZW9mIEpTT04gIT09ICd1bmRlZmluZWQnICYmIEpTT04ucGFyc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHN0cmluZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBtdXN0IHN1cHBseSBhIHBvbHlmaWxsIGZvciBKU09OLnBhcnNlIGluIHRoaXMgZW52aXJvbm1lbnQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9maW5kRnVuY3Rpb25OYW1lKHNvdXJjZSwgbGluZU51bWJlci8qLCBjb2x1bW5OdW1iZXIqLykge1xuICAgICAgICAvLyBmdW5jdGlvbiB7bmFtZX0oe2FyZ3N9KSBtWzFdPW5hbWUgbVsyXT1hcmdzXG4gICAgICAgIHZhciByZUZ1bmN0aW9uRGVjbGFyYXRpb24gPSAvZnVuY3Rpb25cXHMrKFteKF0qPylcXHMqXFwoKFteKV0qKVxcKS87XG4gICAgICAgIC8vIHtuYW1lfSA9IGZ1bmN0aW9uICh7YXJnc30pIFRPRE8gYXJncyBjYXB0dXJlXG4gICAgICAgIHZhciByZUZ1bmN0aW9uRXhwcmVzc2lvbiA9IC9bJ1wiXT8oWyRfQS1aYS16XVskX0EtWmEtejAtOV0qKVsnXCJdP1xccypbOj1dXFxzKmZ1bmN0aW9uXFxiLztcbiAgICAgICAgLy8ge25hbWV9ID0gZXZhbCgpXG4gICAgICAgIHZhciByZUZ1bmN0aW9uRXZhbHVhdGlvbiA9IC9bJ1wiXT8oWyRfQS1aYS16XVskX0EtWmEtejAtOV0qKVsnXCJdP1xccypbOj1dXFxzKig/OmV2YWx8bmV3IEZ1bmN0aW9uKVxcYi87XG4gICAgICAgIHZhciBsaW5lcyA9IHNvdXJjZS5zcGxpdCgnXFxuJyk7XG5cbiAgICAgICAgLy8gV2FsayBiYWNrd2FyZHMgaW4gdGhlIHNvdXJjZSBsaW5lcyB1bnRpbCB3ZSBmaW5kIHRoZSBsaW5lIHdoaWNoIG1hdGNoZXMgb25lIG9mIHRoZSBwYXR0ZXJucyBhYm92ZVxuICAgICAgICB2YXIgY29kZSA9ICcnO1xuICAgICAgICB2YXIgbWF4TGluZXMgPSBNYXRoLm1pbihsaW5lTnVtYmVyLCAyMCk7XG4gICAgICAgIHZhciBtO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1heExpbmVzOyArK2kpIHtcbiAgICAgICAgICAgIC8vIGxpbmVObyBpcyAxLWJhc2VkLCBzb3VyY2VbXSBpcyAwLWJhc2VkXG4gICAgICAgICAgICB2YXIgbGluZSA9IGxpbmVzW2xpbmVOdW1iZXIgLSBpIC0gMV07XG4gICAgICAgICAgICB2YXIgY29tbWVudFBvcyA9IGxpbmUuaW5kZXhPZignLy8nKTtcbiAgICAgICAgICAgIGlmIChjb21tZW50UG9zID49IDApIHtcbiAgICAgICAgICAgICAgICBsaW5lID0gbGluZS5zdWJzdHIoMCwgY29tbWVudFBvcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsaW5lKSB7XG4gICAgICAgICAgICAgICAgY29kZSA9IGxpbmUgKyBjb2RlO1xuICAgICAgICAgICAgICAgIG0gPSByZUZ1bmN0aW9uRXhwcmVzc2lvbi5leGVjKGNvZGUpO1xuICAgICAgICAgICAgICAgIGlmIChtICYmIG1bMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1bMV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG0gPSByZUZ1bmN0aW9uRGVjbGFyYXRpb24uZXhlYyhjb2RlKTtcbiAgICAgICAgICAgICAgICBpZiAobSAmJiBtWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtWzFdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtID0gcmVGdW5jdGlvbkV2YWx1YXRpb24uZXhlYyhjb2RlKTtcbiAgICAgICAgICAgICAgICBpZiAobSAmJiBtWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtWzFdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9lbnN1cmVTdXBwb3J0ZWRFbnZpcm9ubWVudCgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBPYmplY3QuZGVmaW5lUHJvcGVydHkgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIE9iamVjdC5jcmVhdGUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGNvbnN1bWUgc291cmNlIG1hcHMgaW4gb2xkZXIgYnJvd3NlcnMnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9lbnN1cmVTdGFja0ZyYW1lSXNMZWdpdChzdGFja2ZyYW1lKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc3RhY2tmcmFtZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dpdmVuIFN0YWNrRnJhbWUgaXMgbm90IGFuIG9iamVjdCcpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzdGFja2ZyYW1lLmZpbGVOYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR2l2ZW4gZmlsZSBuYW1lIGlzIG5vdCBhIFN0cmluZycpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzdGFja2ZyYW1lLmxpbmVOdW1iZXIgIT09ICdudW1iZXInIHx8XG4gICAgICAgICAgICBzdGFja2ZyYW1lLmxpbmVOdW1iZXIgJSAxICE9PSAwIHx8XG4gICAgICAgICAgICBzdGFja2ZyYW1lLmxpbmVOdW1iZXIgPCAxKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHaXZlbiBsaW5lIG51bWJlciBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlcicpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzdGFja2ZyYW1lLmNvbHVtbk51bWJlciAhPT0gJ251bWJlcicgfHxcbiAgICAgICAgICAgIHN0YWNrZnJhbWUuY29sdW1uTnVtYmVyICUgMSAhPT0gMCB8fFxuICAgICAgICAgICAgc3RhY2tmcmFtZS5jb2x1bW5OdW1iZXIgPCAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHaXZlbiBjb2x1bW4gbnVtYmVyIG11c3QgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9maW5kU291cmNlTWFwcGluZ1VSTChzb3VyY2UpIHtcbiAgICAgICAgdmFyIG0gPSAvXFwvXFwvWyNAXSA/c291cmNlTWFwcGluZ1VSTD0oW15cXHMnXCJdKylcXHMqJC8uZXhlYyhzb3VyY2UpO1xuICAgICAgICBpZiAobSAmJiBtWzFdKSB7XG4gICAgICAgICAgICByZXR1cm4gbVsxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc291cmNlTWFwcGluZ1VSTCBub3QgZm91bmQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9leHRyYWN0TG9jYXRpb25JbmZvRnJvbVNvdXJjZU1hcChzdGFja2ZyYW1lLCByYXdTb3VyY2VNYXAsIHNvdXJjZUNhY2hlKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHZhciBtYXBDb25zdW1lciA9IG5ldyBTb3VyY2VNYXAuU291cmNlTWFwQ29uc3VtZXIocmF3U291cmNlTWFwKTtcblxuICAgICAgICAgICAgdmFyIGxvYyA9IG1hcENvbnN1bWVyLm9yaWdpbmFsUG9zaXRpb25Gb3Ioe1xuICAgICAgICAgICAgICAgIGxpbmU6IHN0YWNrZnJhbWUubGluZU51bWJlcixcbiAgICAgICAgICAgICAgICBjb2x1bW46IHN0YWNrZnJhbWUuY29sdW1uTnVtYmVyXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGxvYy5zb3VyY2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWFwcGVkU291cmNlID0gbWFwQ29uc3VtZXIuc291cmNlQ29udGVudEZvcihsb2Muc291cmNlKTtcbiAgICAgICAgICAgICAgICBpZiAobWFwcGVkU291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZUNhY2hlW2xvYy5zb3VyY2VdID0gbWFwcGVkU291cmNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICBuZXcgU3RhY2tGcmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYy5uYW1lIHx8IHN0YWNrZnJhbWUuZnVuY3Rpb25OYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2tmcmFtZS5hcmdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jLnNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYy5saW5lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jLmNvbHVtbikpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdDb3VsZCBub3QgZ2V0IG9yaWdpbmFsIHNvdXJjZSBmb3IgZ2l2ZW4gc3RhY2tmcmFtZSBhbmQgc291cmNlIG1hcCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdHNcbiAgICAgKiAgICAgIG9wdHMuc291cmNlQ2FjaGUgPSB7dXJsOiBcIlNvdXJjZSBTdHJpbmdcIn0gPT4gcHJlbG9hZCBzb3VyY2UgY2FjaGVcbiAgICAgKiAgICAgIG9wdHMub2ZmbGluZSA9IFRydWUgdG8gcHJldmVudCBuZXR3b3JrIHJlcXVlc3RzLlxuICAgICAqICAgICAgICAgICAgICBCZXN0IGVmZm9ydCB3aXRob3V0IHNvdXJjZXMgb3Igc291cmNlIG1hcHMuXG4gICAgICogICAgICBvcHRzLmFqYXggPSBQcm9taXNlIHJldHVybmluZyBmdW5jdGlvbiB0byBtYWtlIFgtRG9tYWluIHJlcXVlc3RzXG4gICAgICovXG4gICAgcmV0dXJuIGZ1bmN0aW9uIFN0YWNrVHJhY2VHUFMob3B0cykge1xuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU3RhY2tUcmFjZUdQUykpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgU3RhY2tUcmFjZUdQUyhvcHRzKTtcbiAgICAgICAgfVxuICAgICAgICBvcHRzID0gb3B0cyB8fCB7fTtcblxuICAgICAgICB0aGlzLnNvdXJjZUNhY2hlID0gb3B0cy5zb3VyY2VDYWNoZSB8fCB7fTtcblxuICAgICAgICB0aGlzLmFqYXggPSBvcHRzLmFqYXggfHwgX3hkcjtcblxuICAgICAgICB0aGlzLl9hdG9iID0gb3B0cy5hdG9iIHx8IF9hdG9iO1xuXG4gICAgICAgIHRoaXMuX2dldCA9IGZ1bmN0aW9uIF9nZXQobG9jYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICB2YXIgaXNEYXRhVXJsID0gbG9jYXRpb24uc3Vic3RyKDAsIDUpID09PSAnZGF0YTonO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNvdXJjZUNhY2hlW2xvY2F0aW9uXSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMuc291cmNlQ2FjaGVbbG9jYXRpb25dKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdHMub2ZmbGluZSAmJiAhaXNEYXRhVXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0Nhbm5vdCBtYWtlIG5ldHdvcmsgcmVxdWVzdHMgaW4gb2ZmbGluZSBtb2RlJykpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RhdGFVcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRhdGEgVVJMcyBjYW4gaGF2ZSBwYXJhbWV0ZXJzLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VlIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzIzOTdcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdXBwb3J0ZWRFbmNvZGluZ1JlZ2V4cCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgL15kYXRhOmFwcGxpY2F0aW9uXFwvanNvbjsoW1xcdz06XCItXSs7KSpiYXNlNjQsLztcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9IGxvY2F0aW9uLm1hdGNoKHN1cHBvcnRlZEVuY29kaW5nUmVnZXhwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzb3VyY2VNYXBTdGFydCA9IG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZW5jb2RlZFNvdXJjZSA9IGxvY2F0aW9uLnN1YnN0cihzb3VyY2VNYXBTdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNvdXJjZSA9IHRoaXMuX2F0b2IoZW5jb2RlZFNvdXJjZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zb3VyY2VDYWNoZVtsb2NhdGlvbl0gPSBzb3VyY2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzb3VyY2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdUaGUgZW5jb2Rpbmcgb2YgdGhlIGlubGluZSBzb3VyY2VtYXAgaXMgbm90IHN1cHBvcnRlZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB4aHJQcm9taXNlID0gdGhpcy5hamF4KGxvY2F0aW9uLCB7bWV0aG9kOiAnZ2V0J30pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2FjaGUgdGhlIFByb21pc2UgdG8gcHJldmVudCBkdXBsaWNhdGUgaW4tZmxpZ2h0IHJlcXVlc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNvdXJjZUNhY2hlW2xvY2F0aW9uXSA9IHhoclByb21pc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB4aHJQcm9taXNlLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdpdmVuIGEgU3RhY2tGcmFtZSwgZW5oYW5jZSBmdW5jdGlvbiBuYW1lIGFuZCB1c2Ugc291cmNlIG1hcHMgZm9yIGFcbiAgICAgICAgICogYmV0dGVyIFN0YWNrRnJhbWUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7U3RhY2tGcmFtZX0gc3RhY2tmcmFtZSBvYmplY3RcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IHRoYXQgcmVzb2x2ZXMgd2l0aCB3aXRoIHNvdXJjZS1tYXBwZWQgU3RhY2tGcmFtZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5waW5wb2ludCA9IGZ1bmN0aW9uIFN0YWNrVHJhY2VHUFMkJHBpbnBvaW50KHN0YWNrZnJhbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldE1hcHBlZExvY2F0aW9uKHN0YWNrZnJhbWUpLnRoZW4oZnVuY3Rpb24obWFwcGVkU3RhY2tGcmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiByZXNvbHZlTWFwcGVkU3RhY2tGcmFtZSgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobWFwcGVkU3RhY2tGcmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbmRGdW5jdGlvbk5hbWUobWFwcGVkU3RhY2tGcmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc29sdmUsIHJlc29sdmVNYXBwZWRTdGFja0ZyYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgWydjYXRjaCddKHJlc29sdmVNYXBwZWRTdGFja0ZyYW1lKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIHJlamVjdCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHaXZlbiBhIFN0YWNrRnJhbWUsIGd1ZXNzIGZ1bmN0aW9uIG5hbWUgZnJvbSBsb2NhdGlvbiBpbmZvcm1hdGlvbi5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtTdGFja0ZyYW1lfSBzdGFja2ZyYW1lXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSB0aGF0IHJlc29sdmVzIHdpdGggZW5oYW5jZWQgU3RhY2tGcmFtZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmluZEZ1bmN0aW9uTmFtZSA9IGZ1bmN0aW9uIFN0YWNrVHJhY2VHUFMkJGZpbmRGdW5jdGlvbk5hbWUoc3RhY2tmcmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIF9lbnN1cmVTdGFja0ZyYW1lSXNMZWdpdChzdGFja2ZyYW1lKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9nZXQoc3RhY2tmcmFtZS5maWxlTmFtZSkudGhlbihmdW5jdGlvbiBnZXRTb3VyY2VDYWxsYmFjayhzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpbmVOdW1iZXIgPSBzdGFja2ZyYW1lLmxpbmVOdW1iZXI7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb2x1bW5OdW1iZXIgPSBzdGFja2ZyYW1lLmNvbHVtbk51bWJlcjtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGd1ZXNzZWRGdW5jdGlvbk5hbWUgPSBfZmluZEZ1bmN0aW9uTmFtZShzb3VyY2UsIGxpbmVOdW1iZXIsIGNvbHVtbk51bWJlcik7XG4gICAgICAgICAgICAgICAgICAgIC8vIE9ubHkgcmVwbGFjZSBmdW5jdGlvbk5hbWUgaWYgd2UgZm91bmQgc29tZXRoaW5nXG4gICAgICAgICAgICAgICAgICAgIGlmIChndWVzc2VkRnVuY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBTdGFja0ZyYW1lKGd1ZXNzZWRGdW5jdGlvbk5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2tmcmFtZS5hcmdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrZnJhbWUuZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZU51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5OdW1iZXIpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc3RhY2tmcmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCByZWplY3QpWydjYXRjaCddKHJlamVjdCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHaXZlbiBhIFN0YWNrRnJhbWUsIHNlZWsgc291cmNlLW1hcHBlZCBsb2NhdGlvbiBhbmQgcmV0dXJuIG5ldyBlbmhhbmNlZCBTdGFja0ZyYW1lLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge1N0YWNrRnJhbWV9IHN0YWNrZnJhbWVcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IHRoYXQgcmVzb2x2ZXMgd2l0aCBlbmhhbmNlZCBTdGFja0ZyYW1lLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRNYXBwZWRMb2NhdGlvbiA9IGZ1bmN0aW9uIFN0YWNrVHJhY2VHUFMkJGdldE1hcHBlZExvY2F0aW9uKHN0YWNrZnJhbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICBfZW5zdXJlU3VwcG9ydGVkRW52aXJvbm1lbnQoKTtcbiAgICAgICAgICAgICAgICBfZW5zdXJlU3RhY2tGcmFtZUlzTGVnaXQoc3RhY2tmcmFtZSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgc291cmNlQ2FjaGUgPSB0aGlzLnNvdXJjZUNhY2hlO1xuICAgICAgICAgICAgICAgIHZhciBmaWxlTmFtZSA9IHN0YWNrZnJhbWUuZmlsZU5hbWU7XG4gICAgICAgICAgICAgICAgdGhpcy5fZ2V0KGZpbGVOYW1lKS50aGVuKGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291cmNlTWFwcGluZ1VSTCA9IF9maW5kU291cmNlTWFwcGluZ1VSTChzb3VyY2UpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXNEYXRhVXJsID0gc291cmNlTWFwcGluZ1VSTC5zdWJzdHIoMCwgNSkgPT09ICdkYXRhOic7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYXNlID0gZmlsZU5hbWUuc3Vic3RyaW5nKDAsIGZpbGVOYW1lLmxhc3RJbmRleE9mKCcvJykgKyAxKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc291cmNlTWFwcGluZ1VSTFswXSAhPT0gJy8nICYmICFpc0RhdGFVcmwgJiYgISgvXmh0dHBzPzpcXC9cXC98XlxcL1xcLy9pKS50ZXN0KHNvdXJjZU1hcHBpbmdVUkwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VNYXBwaW5nVVJMID0gYmFzZSArIHNvdXJjZU1hcHBpbmdVUkw7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9nZXQoc291cmNlTWFwcGluZ1VSTCkudGhlbihmdW5jdGlvbihzb3VyY2VNYXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc291cmNlTWFwID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZU1hcCA9IF9wYXJzZUpzb24oc291cmNlTWFwLnJlcGxhY2UoL15cXClcXF1cXH0nLywgJycpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc291cmNlTWFwLnNvdXJjZVJvb3QgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlTWFwLnNvdXJjZVJvb3QgPSBiYXNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBfZXh0cmFjdExvY2F0aW9uSW5mb0Zyb21Tb3VyY2VNYXAoc3RhY2tmcmFtZSwgc291cmNlTWFwLCBzb3VyY2VDYWNoZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihyZXNvbHZlKVsnY2F0Y2gnXShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHN0YWNrZnJhbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHJlamVjdClbJ2NhdGNoJ10ocmVqZWN0KTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIHJlamVjdClbJ2NhdGNoJ10ocmVqZWN0KTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH07XG4gICAgfTtcbn0pKTtcbiIsIihmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIC8vIFVuaXZlcnNhbCBNb2R1bGUgRGVmaW5pdGlvbiAoVU1EKSB0byBzdXBwb3J0IEFNRCwgQ29tbW9uSlMvTm9kZS5qcywgUmhpbm8sIGFuZCBicm93c2Vycy5cblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoJ3N0YWNrdHJhY2UnLCBbJ2Vycm9yLXN0YWNrLXBhcnNlcicsICdzdGFjay1nZW5lcmF0b3InLCAnc3RhY2t0cmFjZS1ncHMnXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ2Vycm9yLXN0YWNrLXBhcnNlcicpLCByZXF1aXJlKCdzdGFjay1nZW5lcmF0b3InKSwgcmVxdWlyZSgnc3RhY2t0cmFjZS1ncHMnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5TdGFja1RyYWNlID0gZmFjdG9yeShyb290LkVycm9yU3RhY2tQYXJzZXIsIHJvb3QuU3RhY2tHZW5lcmF0b3IsIHJvb3QuU3RhY2tUcmFjZUdQUyk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiBTdGFja1RyYWNlKEVycm9yU3RhY2tQYXJzZXIsIFN0YWNrR2VuZXJhdG9yLCBTdGFja1RyYWNlR1BTKSB7XG4gICAgdmFyIF9vcHRpb25zID0ge1xuICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uKHN0YWNrZnJhbWUpIHtcbiAgICAgICAgICAgIC8vIEZpbHRlciBvdXQgc3RhY2tmcmFtZXMgZm9yIHRoaXMgbGlicmFyeSBieSBkZWZhdWx0XG4gICAgICAgICAgICByZXR1cm4gKHN0YWNrZnJhbWUuZnVuY3Rpb25OYW1lIHx8ICcnKS5pbmRleE9mKCdTdGFja1RyYWNlJCQnKSA9PT0gLTEgJiZcbiAgICAgICAgICAgICAgICAoc3RhY2tmcmFtZS5mdW5jdGlvbk5hbWUgfHwgJycpLmluZGV4T2YoJ0Vycm9yU3RhY2tQYXJzZXIkJCcpID09PSAtMSAmJlxuICAgICAgICAgICAgICAgIChzdGFja2ZyYW1lLmZ1bmN0aW9uTmFtZSB8fCAnJykuaW5kZXhPZignU3RhY2tUcmFjZUdQUyQkJykgPT09IC0xICYmXG4gICAgICAgICAgICAgICAgKHN0YWNrZnJhbWUuZnVuY3Rpb25OYW1lIHx8ICcnKS5pbmRleE9mKCdTdGFja0dlbmVyYXRvciQkJykgPT09IC0xO1xuICAgICAgICB9LFxuICAgICAgICBzb3VyY2VDYWNoZToge31cbiAgICB9O1xuXG4gICAgdmFyIF9nZW5lcmF0ZUVycm9yID0gZnVuY3Rpb24gU3RhY2tUcmFjZSQkR2VuZXJhdGVFcnJvcigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9yIG11c3QgYmUgdGhyb3duIHRvIGdldCBzdGFjayBpbiBJRVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGVycjtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBNZXJnZSAyIGdpdmVuIE9iamVjdHMuIElmIGEgY29uZmxpY3Qgb2NjdXJzIHRoZSBzZWNvbmQgb2JqZWN0IHdpbnMuXG4gICAgICogRG9lcyBub3QgZG8gZGVlcCBtZXJnZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZmlyc3QgYmFzZSBvYmplY3RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc2Vjb25kIG92ZXJyaWRlc1xuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IG1lcmdlZCBmaXJzdCBhbmQgc2Vjb25kXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBfbWVyZ2UoZmlyc3QsIHNlY29uZCkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0ge307XG5cbiAgICAgICAgW2ZpcnN0LCBzZWNvbmRdLmZvckVhY2goZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIG9iaikge1xuICAgICAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gb2JqW3Byb3BdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2lzU2hhcGVkTGlrZVBhcnNhYmxlRXJyb3IoZXJyKSB7XG4gICAgICAgIHJldHVybiBlcnIuc3RhY2sgfHwgZXJyWydvcGVyYSNzb3VyY2Vsb2MnXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZmlsdGVyZWQoc3RhY2tmcmFtZXMsIGZpbHRlcikge1xuICAgICAgICBpZiAodHlwZW9mIGZpbHRlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIHN0YWNrZnJhbWVzLmZpbHRlcihmaWx0ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdGFja2ZyYW1lcztcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGEgYmFja3RyYWNlIGZyb20gaW52b2NhdGlvbiBwb2ludC5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IG9wdHNcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fSBvZiBTdGFja0ZyYW1lXG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uIFN0YWNrVHJhY2UkJGdldChvcHRzKSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gX2dlbmVyYXRlRXJyb3IoKTtcbiAgICAgICAgICAgIHJldHVybiBfaXNTaGFwZWRMaWtlUGFyc2FibGVFcnJvcihlcnIpID8gdGhpcy5mcm9tRXJyb3IoZXJyLCBvcHRzKSA6IHRoaXMuZ2VuZXJhdGVBcnRpZmljaWFsbHkob3B0cyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBhIGJhY2t0cmFjZSBmcm9tIGludm9jYXRpb24gcG9pbnQuXG4gICAgICAgICAqIElNUE9SVEFOVDogRG9lcyBub3QgaGFuZGxlIHNvdXJjZSBtYXBzIG9yIGd1ZXNzIGZ1bmN0aW9uIG5hbWVzIVxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0c1xuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9IG9mIFN0YWNrRnJhbWVcbiAgICAgICAgICovXG4gICAgICAgIGdldFN5bmM6IGZ1bmN0aW9uIFN0YWNrVHJhY2UkJGdldFN5bmMob3B0cykge1xuICAgICAgICAgICAgb3B0cyA9IF9tZXJnZShfb3B0aW9ucywgb3B0cyk7XG4gICAgICAgICAgICB2YXIgZXJyID0gX2dlbmVyYXRlRXJyb3IoKTtcbiAgICAgICAgICAgIHZhciBzdGFjayA9IF9pc1NoYXBlZExpa2VQYXJzYWJsZUVycm9yKGVycikgPyBFcnJvclN0YWNrUGFyc2VyLnBhcnNlKGVycikgOiBTdGFja0dlbmVyYXRvci5iYWNrdHJhY2Uob3B0cyk7XG4gICAgICAgICAgICByZXR1cm4gX2ZpbHRlcmVkKHN0YWNrLCBvcHRzLmZpbHRlcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdpdmVuIGFuIGVycm9yIG9iamVjdCwgcGFyc2UgaXQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIG9iamVjdFxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0c1xuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gZm9yIEFycmF5W1N0YWNrRnJhbWV9XG4gICAgICAgICAqL1xuICAgICAgICBmcm9tRXJyb3I6IGZ1bmN0aW9uIFN0YWNrVHJhY2UkJGZyb21FcnJvcihlcnJvciwgb3B0cykge1xuICAgICAgICAgICAgb3B0cyA9IF9tZXJnZShfb3B0aW9ucywgb3B0cyk7XG4gICAgICAgICAgICB2YXIgZ3BzID0gbmV3IFN0YWNrVHJhY2VHUFMob3B0cyk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGFja2ZyYW1lcyA9IF9maWx0ZXJlZChFcnJvclN0YWNrUGFyc2VyLnBhcnNlKGVycm9yKSwgb3B0cy5maWx0ZXIpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoUHJvbWlzZS5hbGwoc3RhY2tmcmFtZXMubWFwKGZ1bmN0aW9uKHNmKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiByZXNvbHZlT3JpZ2luYWwoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzZik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGdwcy5waW5wb2ludChzZikudGhlbihyZXNvbHZlLCByZXNvbHZlT3JpZ2luYWwpWydjYXRjaCddKHJlc29sdmVPcmlnaW5hbCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pKSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVc2UgU3RhY2tHZW5lcmF0b3IgdG8gZ2VuZXJhdGUgYSBiYWNrdHJhY2UuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSBvZiBBcnJheVtTdGFja0ZyYW1lXVxuICAgICAgICAgKi9cbiAgICAgICAgZ2VuZXJhdGVBcnRpZmljaWFsbHk6IGZ1bmN0aW9uIFN0YWNrVHJhY2UkJGdlbmVyYXRlQXJ0aWZpY2lhbGx5KG9wdHMpIHtcbiAgICAgICAgICAgIG9wdHMgPSBfbWVyZ2UoX29wdGlvbnMsIG9wdHMpO1xuICAgICAgICAgICAgdmFyIHN0YWNrRnJhbWVzID0gU3RhY2tHZW5lcmF0b3IuYmFja3RyYWNlKG9wdHMpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRzLmZpbHRlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHN0YWNrRnJhbWVzID0gc3RhY2tGcmFtZXMuZmlsdGVyKG9wdHMuZmlsdGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoc3RhY2tGcmFtZXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHaXZlbiBhIGZ1bmN0aW9uLCB3cmFwIGl0IHN1Y2ggdGhhdCBpbnZvY2F0aW9ucyB0cmlnZ2VyIGEgY2FsbGJhY2sgdGhhdFxuICAgICAgICAgKiBpcyBjYWxsZWQgd2l0aCBhIHN0YWNrIHRyYWNlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiB0byBiZSBpbnN0cnVtZW50ZWRcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gY2FsbCB3aXRoIGEgc3RhY2sgdHJhY2Ugb24gaW52b2NhdGlvblxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcnJiYWNrIG9wdGlvbmFsIGZ1bmN0aW9uIHRvIGNhbGwgd2l0aCBlcnJvciBpZiB1bmFibGUgdG8gZ2V0IHN0YWNrIHRyYWNlLlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBvcHRpb25hbCBjb250ZXh0IG9iamVjdCAoZS5nLiB3aW5kb3cpXG4gICAgICAgICAqL1xuICAgICAgICBpbnN0cnVtZW50OiBmdW5jdGlvbiBTdGFja1RyYWNlJCRpbnN0cnVtZW50KGZuLCBjYWxsYmFjaywgZXJyYmFjaywgdGhpc0FyZykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGluc3RydW1lbnQgbm9uLWZ1bmN0aW9uIG9iamVjdCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZm4uX19zdGFja3RyYWNlT3JpZ2luYWxGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIC8vIEFscmVhZHkgaW5zdHJ1bWVudGVkLCByZXR1cm4gZ2l2ZW4gRnVuY3Rpb25cbiAgICAgICAgICAgICAgICByZXR1cm4gZm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBpbnN0cnVtZW50ZWQgPSBmdW5jdGlvbiBTdGFja1RyYWNlJCRpbnN0cnVtZW50ZWQoKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXQoKS50aGVuKGNhbGxiYWNrLCBlcnJiYWNrKVsnY2F0Y2gnXShlcnJiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcgfHwgdGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfaXNTaGFwZWRMaWtlUGFyc2FibGVFcnJvcihlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mcm9tRXJyb3IoZSkudGhlbihjYWxsYmFjaywgZXJyYmFjaylbJ2NhdGNoJ10oZXJyYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XG4gICAgICAgICAgICBpbnN0cnVtZW50ZWQuX19zdGFja3RyYWNlT3JpZ2luYWxGbiA9IGZuO1xuXG4gICAgICAgICAgICByZXR1cm4gaW5zdHJ1bWVudGVkO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHaXZlbiBhIGZ1bmN0aW9uIHRoYXQgaGFzIGJlZW4gaW5zdHJ1bWVudGVkLFxuICAgICAgICAgKiByZXZlcnQgdGhlIGZ1bmN0aW9uIHRvIGl0J3Mgb3JpZ2luYWwgKG5vbi1pbnN0cnVtZW50ZWQpIHN0YXRlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiB0byBkZS1pbnN0cnVtZW50XG4gICAgICAgICAqL1xuICAgICAgICBkZWluc3RydW1lbnQ6IGZ1bmN0aW9uIFN0YWNrVHJhY2UkJGRlaW5zdHJ1bWVudChmbikge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGRlLWluc3RydW1lbnQgbm9uLWZ1bmN0aW9uIG9iamVjdCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZm4uX19zdGFja3RyYWNlT3JpZ2luYWxGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBmbi5fX3N0YWNrdHJhY2VPcmlnaW5hbEZuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBGdW5jdGlvbiBub3QgaW5zdHJ1bWVudGVkLCByZXR1cm4gb3JpZ2luYWxcbiAgICAgICAgICAgICAgICByZXR1cm4gZm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdpdmVuIGFuIGVycm9yIG1lc3NhZ2UgYW5kIEFycmF5IG9mIFN0YWNrRnJhbWVzLCBzZXJpYWxpemUgYW5kIFBPU1QgdG8gZ2l2ZW4gVVJMLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBzdGFja2ZyYW1lc1xuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBlcnJvck1zZ1xuICAgICAgICAgKi9cbiAgICAgICAgcmVwb3J0OiBmdW5jdGlvbiBTdGFja1RyYWNlJCRyZXBvcnQoc3RhY2tmcmFtZXMsIHVybCwgZXJyb3JNc2cpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSByZWplY3Q7XG4gICAgICAgICAgICAgICAgcmVxLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIG9ucmVhZHlzdGF0ZWNoYW5nZSgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcS5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVxLnN0YXR1cyA+PSAyMDAgJiYgcmVxLnN0YXR1cyA8IDQwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1BPU1QgdG8gJyArIHVybCArICcgZmFpbGVkIHdpdGggc3RhdHVzOiAnICsgcmVxLnN0YXR1cykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXEub3BlbigncG9zdCcsIHVybCk7XG4gICAgICAgICAgICAgICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVwb3J0UGF5bG9hZCA9IHtzdGFjazogc3RhY2tmcmFtZXN9O1xuICAgICAgICAgICAgICAgIGlmIChlcnJvck1zZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcG9ydFBheWxvYWQubWVzc2FnZSA9IGVycm9yTXNnO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlcS5zZW5kKEpTT04uc3RyaW5naWZ5KHJlcG9ydFBheWxvYWQpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pKTtcbiIsImltcG9ydCBBY3Rpb24gZnJvbSBcIi4uL2RvbWFpbi9BY3Rpb25cIjtcbmltcG9ydCBBaWZleFNlcnZpY2UgZnJvbSBcIi4uL2RvbWFpbi9BaWZleFNlcnZpY2VcIjtcbmltcG9ydCBTZXNzaW9uIGZyb20gXCIuLi9kb21haW4vU2Vzc2lvblwiO1xuXG5cbmNvbnN0IE9LX1NUQVRVUyA9IDIwMDtcbmNvbnN0IElOVkFMSURfUEFSQU1FVEVSU19TVEFUVVMgPSA0MDA7XG5jb25zdCBGT1JCSURERU5fU1RBVFVTID0gNDAzO1xuY29uc3QgTk9UX0ZPVU5EX1NUQVRVUyA9IDQwNDtcbmNvbnN0IElOVEVSTkFMX1NFUlZFUl9FUlJPUl9TVEFUVVMgPSA1MDA7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBaWZleFNlcnZpY2VIVFRQIGltcGxlbWVudHMgQWlmZXhTZXJ2aWNlIHtcblxuXHRwaW5nKHNlcnZlclVSTDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIGZldGNoKGAke3NlcnZlclVSTH0vYXBpL3BpbmdgLCB7XG5cdFx0XHRtZXRob2Q6IFwiR0VUXCIsXG5cdFx0XHRoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG5cdFx0fSlcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHtcblx0XHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UpO1xuXHRcdFx0XHRpZiAocmVzcG9uc2Uub2spIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygnb2snKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ2Vycm9yJyk7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHR9XG5cblx0Z2V0U2Vzc2lvbihzZXJ2ZXJVUkw6IHN0cmluZywgc2Vzc2lvbklkOiBzdHJpbmcpOiBQcm9taXNlPFNlc3Npb24gfCB1bmRlZmluZWQgfCBcIlVuYXV0aG9yaXplZFwiPiB7XG5cdFx0Y29uc3QgU0VTU0lPTl9VUkwgPSBzZXJ2ZXJVUkwgKyAnL2FwaS9zZXNzaW9ucy8nICsgc2Vzc2lvbklkO1xuXHRcdHJldHVybiBmZXRjaChTRVNTSU9OX1VSTCwge1xuXHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ30sXG5cdFx0fSlcblx0XHRcdC50aGVuKChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRpZiAocmVzcG9uc2Uuc3RhdHVzID09PSBPS19TVEFUVVMpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2Vcblx0XHRcdFx0XHRcdC5qc29uKClcblx0XHRcdFx0XHRcdC50aGVuKChzZXNzaW9uOiB7XG5cdFx0XHRcdFx0XHRcdGlkOiBzdHJpbmcsXG5cdFx0XHRcdFx0XHRcdHdlYlNpdGU6IHsgaWQ6IHN0cmluZyB9LFxuXHRcdFx0XHRcdFx0XHRiYXNlVVJMOiBzdHJpbmcsXG5cdFx0XHRcdFx0XHRcdG5hbWU6IHN0cmluZyxcblx0XHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IHN0cmluZyxcblx0XHRcdFx0XHRcdFx0b3ZlcmxheVR5cGU6IFwicmFpbmJvd1wiIHwgXCJibHVlc2t5XCIgfCBcInNoYWRvd1wiLFxuXHRcdFx0XHRcdFx0XHRyZWNvcmRpbmdNb2RlOiBcImJ5ZXhwbG9yYXRpb25cIiB8IFwiYnlpbnRlcmFjdGlvblwiXG5cblx0XHRcdFx0XHRcdH0pID0+IHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBTZXNzaW9uKHNlc3Npb24uaWQsIHNlc3Npb24ud2ViU2l0ZS5pZCwgc2Vzc2lvbi5iYXNlVVJMLCBzZXNzaW9uLm5hbWUsIHNlc3Npb24uZGVzY3JpcHRpb24sIHNlc3Npb24ub3ZlcmxheVR5cGUsIHNlc3Npb24ucmVjb3JkaW5nTW9kZSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocmVzcG9uc2Uuc3RhdHVzID09PSBJTlZBTElEX1BBUkFNRVRFUlNfU1RBVFVTKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocmVzcG9uc2Uuc3RhdHVzID09PSBOT1RfRk9VTkRfU1RBVFVTKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocmVzcG9uc2Uuc3RhdHVzID09PSBGT1JCSURERU5fU1RBVFVTKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFwiVW5hdXRob3JpemVkXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gSU5URVJOQUxfU0VSVkVSX0VSUk9SX1NUQVRVUykge1xuXHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChgc2VydmVyIGVycm9yYCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdH1cblxuXHRjcmVhdGVFbXB0eUV4cGxvcmF0aW9uKHRlc3Rlck5hbWU6IHN0cmluZywgc2VydmVyVVJMOiBzdHJpbmcsIHNlc3Npb25JZDogc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+IHtcblx0XHRjb25zdCBib2R5ID0ge1xuXHRcdFx0dGVzdGVyTmFtZSxcblx0XHRcdGludGVyYWN0aW9uTGlzdDogW10sXG5cdFx0fTtcblx0XHRjb25zdCBvcHRpb24gPSB7XG5cdFx0XHRtZXRob2Q6IFwiUE9TVFwiLFxuXHRcdFx0Ym9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG5cdFx0XHRoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG5cdFx0fTtcblx0XHRyZXR1cm4gZmV0Y2goXG5cdFx0XHRgJHtzZXJ2ZXJVUkx9L2FwaS9zZXNzaW9ucy8ke3Nlc3Npb25JZH0vZXhwbG9yYXRpb25zYCxcblx0XHRcdG9wdGlvblxuXHRcdClcblx0XHRcdC50aGVuKChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRpZiAocmVzcG9uc2Uuc3RhdHVzID09PSBPS19TVEFUVVMpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuanNvbigpLnRoZW4oZGF0YSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZGF0YS5leHBsb3JhdGlvbk51bWJlclxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gTk9UX0ZPVU5EX1NUQVRVUykge1xuXHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoYG5vIHNlc3Npb24gbm90IGZvdW5kIGZvciBJZGApKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocmVzcG9uc2Uuc3RhdHVzID09PSBJTlZBTElEX1BBUkFNRVRFUlNfU1RBVFVTKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihgc2Vzc2lvbklkIGFuZC9vciBleHBsb3JhdGlvbiBpcyBtYWxmb3JtZWRgKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gSU5URVJOQUxfU0VSVkVSX0VSUk9SX1NUQVRVUykge1xuXHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoYHNlcnZlciBlcnJvcmApKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblxuXHR9XG5cblx0c2VuZEFjdGlvbihleHBsb3JhdGlvbk51bWJlcjogbnVtYmVyLCBhY3Rpb246IEFjdGlvbiwgc2VydmVyVVJMOiBzdHJpbmcsIHNlc3Npb25JZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG5cblx0XHRjb25zdCBib2R5ID0ge1xuXHRcdFx0aW50ZXJhY3Rpb25MaXN0OiBbe1xuXHRcdFx0XHRjb25jcmV0ZVR5cGU6IFwiQWN0aW9uXCIsXG5cdFx0XHRcdGtpbmQ6IGFjdGlvbi5wcmVmaXgsXG5cdFx0XHRcdHZhbHVlOiBhY3Rpb24uc3VmZml4LFxuXHRcdFx0XHRkYXRlOiBuZXcgRGF0ZSgpXG5cdFx0XHR9XVxuXHRcdH1cblx0XHRjb25zdCBvcHRpb24gPSB7XG5cdFx0XHRtZXRob2Q6IFwiUE9TVFwiLFxuXHRcdFx0Ym9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG5cdFx0XHRoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG5cdFx0fTtcblx0XHRyZXR1cm4gZmV0Y2goXG5cdFx0XHRgJHtzZXJ2ZXJVUkx9L2FwaS9zZXNzaW9ucy8ke3Nlc3Npb25JZH0vZXhwbG9yYXRpb25zLyR7ZXhwbG9yYXRpb25OdW1iZXJ9L2ludGVyYWN0aW9uc2AsXG5cdFx0XHRvcHRpb24pXG5cdFx0XHQudGhlbigocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0aWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gT0tfU1RBVFVTKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChyZXNwb25zZS5zdGF0dXMgPT09IE5PVF9GT1VORF9TVEFUVVMpIHtcblx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGBzZXNzaW9uSWQgbm90IGZvdW5kYCkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChyZXNwb25zZS5zdGF0dXMgPT09IElOVkFMSURfUEFSQU1FVEVSU19TVEFUVVMpIHtcblx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGBzZXNzaW9uSWQgYW5kL29yIGV4cGxvcmF0aW9uIGlzIG1hbGZvcm1lZGApKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocmVzcG9uc2Uuc3RhdHVzID09PSBJTlRFUk5BTF9TRVJWRVJfRVJST1JfU1RBVFVTKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihgc2VydmVyIGVycm9yYCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KS5jYXRjaChlcnJvciA9PiB7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTZXJ2aWNlIEZhaWxlZCB0byBwdXNoIG5ldyBhY3Rpb25cIik7XG5cdFx0XHR9KVxuXG5cdH1cbn0iLCJpbXBvcnQgQnJvd3NlclNlcnZpY2UgZnJvbSBcIi4uL2RvbWFpbi9Ccm93c2VyU2VydmljZVwiO1xyXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwiLi4vZnJhbWV3b3JrL0xvZ2dlclwiO1xyXG5cclxuY29uc3QgRVhQTE9SQVRJT05fTlVNQkVSX0tFWSA9ICdFWFBMT1JBVElPTl9OVU1CRVJfS0VZJztcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnJvd3NlclNlcnZpY2VTZXNzaW9uU3RvcmFnZSBpbXBsZW1lbnRzIEJyb3dzZXJTZXJ2aWNlIHtcclxuXHRnZXRFeHBsb3JhdGlvbk51bWJlcigpOiBudW1iZXIgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhcIkJyb3dzZXJTZXJ2aWNlU2Vzc2lvblN0b3JhZ2UuZ2V0RXhwbG9yYXRpb25OdW1iZXJcIik7XHJcbiAgICAgICAgY29uc3QgZXhwbG9yYXRpb25OdW1iZXJJdGVtID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShFWFBMT1JBVElPTl9OVU1CRVJfS0VZKTtcclxuICAgICAgICBpZiAoZXhwbG9yYXRpb25OdW1iZXJJdGVtKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZE51bWJlciA9IHBhcnNlSW50KGV4cGxvcmF0aW9uTnVtYmVySXRlbSk7XHJcbiAgICAgICAgICAgIGlmIChpc05hTihwYXJzZWROdW1iZXIpKSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoXCJCcm93c2VyU2VydmljZVNlc3Npb25TdG9yYWdlLmdldEV4cGxvcmF0aW9uTnVtYmVyOiBOYU5cIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKFwiQnJvd3NlclNlcnZpY2VTZXNzaW9uU3RvcmFnZS5nZXRFeHBsb3JhdGlvbk51bWJlcjogXCIgKyBwYXJzZWROdW1iZXIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlZE51bWJlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsb2dnZXIuZGVidWcoXCJCcm93c2VyU2VydmljZVNlc3Npb25TdG9yYWdlLmdldEV4cGxvcmF0aW9uTnVtYmVyOiB1bmRlZmluZWRcIik7XHJcbiAgICB9XHJcblxyXG5cdHNhdmVFeHBsb3JhdGlvbk51bWJlcihleHBsb3JhdGlvbk51bWJlcjogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgbG9nZ2VyLmRlYnVnKFwiQnJvd3NlclNlcnZpY2VTZXNzaW9uU3RvcmFnZS5zYXZlRXhwbG9yYXRpb25OdW1iZXI6IFwiICsgZXhwbG9yYXRpb25OdW1iZXIpO1xyXG4gICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oRVhQTE9SQVRJT05fTlVNQkVSX0tFWSwgZXhwbG9yYXRpb25OdW1iZXIudG9TdHJpbmcoKSk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBBY3Rpb24ge1xuXG4gICAgcHVibGljIHByZWZpeDogc3RyaW5nO1xuICAgIHB1YmxpYyBzdWZmaXg6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0cnVjdG9yKHByZWZpeDogc3RyaW5nLCBzdWZmaXg/OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5wcmVmaXggPSBwcmVmaXg7XG4gICAgICAgIHRoaXMuc3VmZml4ID0gc3VmZml4O1xuICAgIH1cblxuICAgIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICBpZiAodGhpcy5zdWZmaXgpIHtcbiAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLnByZWZpeH0kJHt0aGlzLnN1ZmZpeH1gO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJlZml4O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGVxdWFscyhhY3Rpb246IEFjdGlvbik6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gKCh0aGlzLnByZWZpeCA9PT0gYWN0aW9uLnByZWZpeCkgJiYgKHRoaXMuc3VmZml4ID09PSBhY3Rpb24uc3VmZml4KSlcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VBY3Rpb24oYWN0aW9uVGV4dDogc3RyaW5nKTogQWN0aW9uIHtcbiAgICAgICAgY29uc3QgcGFydHMgPSBhY3Rpb25UZXh0LnNwbGl0KFwiJFwiKTtcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBBY3Rpb24ocGFydHNbMF0pXG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1tYWdpYy1udW1iZXJzXG4gICAgICAgIH0gZWxzZSBpZiAocGFydHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEFjdGlvbihwYXJ0c1swXSwgcGFydHNbMV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIHBhcnNlIGFjdGlvbiA6IFwiICsgYWN0aW9uVGV4dCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufSIsImltcG9ydCBBaWZleFNlcnZpY2UgZnJvbSBcIi4vQWlmZXhTZXJ2aWNlXCJcbmltcG9ydCBBY3Rpb24gZnJvbSBcIi4vQWN0aW9uXCI7XG5pbXBvcnQgZ2V0Q3NzU2VsZWN0b3IgZnJvbSAnY3NzLXNlbGVjdG9yLWdlbmVyYXRvcic7XG5pbXBvcnQgQnJvd3NlclNlcnZpY2UgZnJvbSBcIi4vQnJvd3NlclNlcnZpY2VcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCIuLi9mcmFtZXdvcmsvTG9nZ2VyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50TGlzdGVuZXIge1xuICAgIHByaXZhdGUgX3NlcnZlclVSTDogc3RyaW5nO1xuXHRwcml2YXRlIF9zZXNzaW9uSWQ6IHN0cmluZztcbiAgICBwcml2YXRlIF9leHBsb3JhdGlvbk51bWJlcjogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgX2FpZmV4U2VydmljZTogQWlmZXhTZXJ2aWNlO1xuICAgIHByaXZhdGUgX2Jyb3dzZXJTZXJ2aWNlIDogQnJvd3NlclNlcnZpY2U7XG4gICAgcHJpdmF0ZSBfbGFzdEFjdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgY29uc3RydWN0b3Ioc2VydmVyVVJMOiBzdHJpbmcsIHNlc3Npb25JZDogc3RyaW5nLCBhaWZleFNlcnZpY2U6IEFpZmV4U2VydmljZSwgYnJvd3NlclNlcnZpY2U6IEJyb3dzZXJTZXJ2aWNlKSB7XG4gICAgICAgIHRoaXMuX3NlcnZlclVSTCA9IHNlcnZlclVSTDtcbiAgICAgICAgdGhpcy5fc2Vzc2lvbklkID0gc2Vzc2lvbklkO1xuICAgICAgICB0aGlzLl9haWZleFNlcnZpY2UgPSBhaWZleFNlcnZpY2U7XG4gICAgICAgIHRoaXMuX2Jyb3dzZXJTZXJ2aWNlID0gYnJvd3NlclNlcnZpY2U7XG4gICAgICAgIFxuXG4gICAgICAgIGxldCBleHBsb3JhdGlvbk51bWJlciA9IHRoaXMuX2Jyb3dzZXJTZXJ2aWNlLmdldEV4cGxvcmF0aW9uTnVtYmVyKCk7ICAgIFxuICAgICAgICBpZiAoZXhwbG9yYXRpb25OdW1iZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5fYWlmZXhTZXJ2aWNlLmNyZWF0ZUVtcHR5RXhwbG9yYXRpb24oXCJicm93c2VyLXNjcmlwdFwiLCB0aGlzLl9zZXJ2ZXJVUkwsIHRoaXMuX3Nlc3Npb25JZClcbiAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9icm93c2VyU2VydmljZS5zYXZlRXhwbG9yYXRpb25OdW1iZXIocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9leHBsb3JhdGlvbk51bWJlciA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3RlbigpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2V4cGxvcmF0aW9uTnVtYmVyID0gZXhwbG9yYXRpb25OdW1iZXI7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbigpO1xuICAgICAgICB9ICAgICAgICBcbiAgICAgICAgICAgIFxuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBsaXN0ZW4oKTogdm9pZCB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhgbGlzdGVuaW5nIHRvIGV2ZW50c2ApO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLmxpc3RlblRvTW91c2VEb3duLmJpbmQodGhpcyksIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5saXN0ZW5Ub0tleURvd24uYmluZCh0aGlzKSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsaXN0ZW5Ub01vdXNlRG93bihldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgbGV0IHVuc2FmZUV2ZW50OiBhbnkgPSBldmVudDtcbiAgICAgICAgaWYgKCF1bnNhZmVFdmVudC5leHBsb3JlZCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCkge1xuICAgICAgICAgICAgICAgIGxldCBwcmVmaXggPSAnQ2xpY2snO1xuICAgICAgICAgICAgICAgIGxldCBzdWZmaXggPSB0aGlzLm1ha2VTdWZmaXgoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGxldCBhY3Rpb24gPSBuZXcgQWN0aW9uKHByZWZpeCwgc3VmZml4KTtcblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9sYXN0QWN0aW9uICE9PSBhY3Rpb24udG9TdHJpbmcoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sYXN0QWN0aW9uID0gYWN0aW9uLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9leHBsb3JhdGlvbk51bWJlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoYGFjdGlvbiA6ICR7YWN0aW9uLnRvU3RyaW5nKCl9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9haWZleFNlcnZpY2Uuc2VuZEFjdGlvbih0aGlzLl9leHBsb3JhdGlvbk51bWJlciwgYWN0aW9uLCB0aGlzLl9zZXJ2ZXJVUkwsIHRoaXMuX3Nlc3Npb25JZCkudGhlbigoKT0+e30pLmNhdGNoKCgpPT57fSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1bnNhZmVFdmVudC5leHBsb3JlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIHByaXZhdGUgbGlzdGVuVG9LZXlEb3duKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgICAgICBsZXQgdW5zYWZlRXZlbnQ6IGFueSA9IGV2ZW50O1xuICAgICAgICBpZiAoIXVuc2FmZUV2ZW50LmV4cGxvcmVkKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQgaW5zdGFuY2VvZiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgbGV0IHByZWZpeCA9ICdFZGl0JztcbiAgICAgICAgICAgICAgICBsZXQgaXNFZGl0YWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50ICYmICFldmVudC50YXJnZXQuZGlzYWJsZWQgJiYgIWV2ZW50LnRhcmdldC5yZWFkT25seSkge1xuICAgICAgICAgICAgICAgICAgICBpc0VkaXRhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnVGFiJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5zaGlmdEtleSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZml4ID0gJ1NoaWZ0VGFiJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZml4ID0gJ1RhYic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnRW50ZXInOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRWRpdGFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmaXggPSAnRWRpdCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWZpeCA9ICdFbnRlcic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnU3BhY2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRWRpdGFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmaXggPSAnRWRpdCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWZpeCA9ICdTcGFjZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93RG93bic6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93TGVmdCc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZml4ID0gZXZlbnQuY29kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdFc2NhcGUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZml4ID0gJ0VzY2FwZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZpeCA9ICdFZGl0JztcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBzdWZmaXggPSB0aGlzLm1ha2VTdWZmaXgoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGxldCBhY3Rpb24gPSBuZXcgQWN0aW9uKHByZWZpeCwgc3VmZml4KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fbGFzdEFjdGlvbiAhPT0gYWN0aW9uLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbGFzdEFjdGlvbiA9IGFjdGlvbi50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fZXhwbG9yYXRpb25OdW1iZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWlmZXhTZXJ2aWNlLnNlbmRBY3Rpb24odGhpcy5fZXhwbG9yYXRpb25OdW1iZXIsIGFjdGlvbiwgdGhpcy5fc2VydmVyVVJMLCB0aGlzLl9zZXNzaW9uSWQpLnRoZW4oKCk9Pnt9KS5jYXRjaCgoKT0+e30pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdW5zYWZlRXZlbnQuZXhwbG9yZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBtYWtlU3VmZml4KGV2ZW50IDogRXZlbnQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgfHwgZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgU1ZHRWxlbWVudCkgeyBcbiAgICAgICAgICAgICAgICBsZXQgc3VmZml4O1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHN1ZmZpeCA9IGdldENzc1NlbGVjdG9yKGV2ZW50LnRhcmdldCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3JzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpZFwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidGFnXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXR0cmlidXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgYmxhY2tsaXN0OiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy4qZGF0YS4qL2ksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8uKmFpZmV4LiovaSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy4qb3Zlci4qL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy4qYXV0by4qL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy4qdmFsdWUuKi9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8uKmNoZWNrZWQuKi9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdbcGxhY2Vob2xkZXJdJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLipocmVmLiovaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLipzcmMuKi9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8uKm9uY2xpY2suKi9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8uKm9ubG9hZC4qL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy4qb25rZXl1cC4qL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy4qd2lkdGguKi9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8uKmhlaWdodC4qL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy4qc3R5bGUuKi9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8uKnNpemUuKi9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8uKm1heGxlbmd0aC4qL2lcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21iaW5lQmV0d2VlblNlbGVjdG9yczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heENhbmRpZGF0ZXM6IDgwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4Q29tYmluYXRpb25zOiA4MFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1ZmZpeCA9IFwiZXJyb3JcIjtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGBbVGFiU2NyaXB0XSBleGNlcHRpb24gd2hpbGUgZ2VuZXJhdGluZyBzdWZmaXggOiAke2V9YCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3VmZml4ICs9IGA/aHJlZj0ke3dpbmRvdy5sb2NhdGlvbi5ocmVmfWA7XG5cbiAgICAgICAgICAgICAgICBjb25zdCByZWN0ID0gZXZlbnQudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIGlmIChyZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHN1ZmZpeCArPWAmbGVmdD0ke3JlY3QubGVmdH0mdG9wPSR7cmVjdC50b3B9JnJpZ2h0PSR7cmVjdC5yaWdodH0mYm90dG9tPSR7cmVjdC5ib3R0b219JndpZHRoPSR7cmVjdC53aWR0aH0maGVpZ2h0PSR7cmVjdC5oZWlnaHR9JnNjcmVlbndpZHRoPSR7d2luZG93LmlubmVyV2lkdGh9JnNjcmVlbmhlaWdodD0ke3dpbmRvdy5pbm5lckhlaWdodH1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gc3VmZml4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59XG4iLCJcbmV4cG9ydCB0eXBlIE92ZXJsYXlUeXBlID0gXCJyYWluYm93XCIgfCBcImJsdWVza3lcIiB8IFwic2hhZG93XCI7XG5leHBvcnQgdHlwZSBSZWNvcmRpbmdNb2RlID0gXCJieWV4cGxvcmF0aW9uXCIgfCBcImJ5aW50ZXJhY3Rpb25cIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlc3Npb24ge1xuICAgIHJlYWRvbmx5IGlkIDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IHdlYlNpdGVJZCA6IHN0cmluZztcbiAgICByZWFkb25seSBiYXNlVVJMOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgcmVhZG9ubHkgbmFtZSA6IHN0cmluZztcbiAgICByZWFkb25seSBkZXNjcmlwdGlvbiA6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICByZWFkb25seSBvdmVybGF5VHlwZTogT3ZlcmxheVR5cGU7XG4gICAgcmVhZG9ubHkgcmVjb3JkaW5nTW9kZTogUmVjb3JkaW5nTW9kZTtcblxuICAgIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcsIHdlYlNpdGVJZDogc3RyaW5nLCBiYXNlVVJMOnN0cmluZyB8IHVuZGVmaW5lZCwgbmFtZSA6IHN0cmluZywgZGVzY3JpcHRpb24gOiBzdHJpbmcsIG92ZXJsYXlUeXBlOiBPdmVybGF5VHlwZSwgcmVjb3JkaW5nTW9kZTogUmVjb3JkaW5nTW9kZSkge1xuICAgICAgICBpZiAoaWQgPT09IG51bGwgfHwgaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjYW5ub3QgY3JlYXRlIFNlc3Npb24gd2l0aG91dCBpZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh3ZWJTaXRlSWQgPT09IG51bGwgfHwgd2ViU2l0ZUlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY2Fubm90IGNyZWF0ZSBTZXNzaW9uIHdpdGhvdXQgd2ViU2l0ZUlkJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLndlYlNpdGVJZCA9IHdlYlNpdGVJZDtcbiAgICAgICAgdGhpcy5iYXNlVVJMID0gYmFzZVVSTDtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uO1xuICAgICAgICB0aGlzLm92ZXJsYXlUeXBlID0gb3ZlcmxheVR5cGU7ICAgICAgICBcbiAgICAgICAgdGhpcy5yZWNvcmRpbmdNb2RlID0gcmVjb3JkaW5nTW9kZTtcbiAgICB9XG5cbn0iLCJpbXBvcnQge0NhdGVnb3J5LENhdGVnb3J5TG9nZ2VyLENhdGVnb3J5U2VydmljZUZhY3RvcnksQ2F0ZWdvcnlDb25maWd1cmF0aW9uLExvZ0xldmVsfSBmcm9tIFwidHlwZXNjcmlwdC1sb2dnaW5nXCI7XG4gXG4vLyBPcHRpb25hbGx5IGNoYW5nZSBkZWZhdWx0IHNldHRpbmdzLCBpbiB0aGlzIGV4YW1wbGUgc2V0IGRlZmF1bHQgbG9nZ2luZyB0byBJbmZvLlxuLy8gV2l0aG91dCBjaGFuZ2luZyBjb25maWd1cmF0aW9uLCBjYXRlZ29yaWVzIHdpbGwgbG9nIHRvIEVycm9yLlxuXG5sZXQgbG9nTGV2ZWw7XG5cbnN3aXRjaChwcm9jZXNzLmVudi5OT0RFX0VOVikge1xuICAgIGNhc2UgJ3Byb2R1Y3Rpb24nOlxuICAgICAgICBsb2dMZXZlbCA9IExvZ0xldmVsLkVycm9yO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlICdkZXZlbG9wbWVudCc6IFxuICAgICAgICBsb2dMZXZlbCA9IExvZ0xldmVsLkRlYnVnO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlICdnaXRodWInOlxuICAgICAgICBsb2dMZXZlbCA9IExvZ0xldmVsLkVycm9yO1xuICAgICAgICBicmVhaztcbiAgICBkZWZhdWx0OiBcbiAgICAgICAgbG9nTGV2ZWwgPSBMb2dMZXZlbC5FcnJvclxufVxuXG5DYXRlZ29yeVNlcnZpY2VGYWN0b3J5LnNldERlZmF1bHRDb25maWd1cmF0aW9uKG5ldyBDYXRlZ29yeUNvbmZpZ3VyYXRpb24obG9nTGV2ZWwpKTtcbiBcbi8vIENyZWF0ZSBjYXRlZ29yaWVzLCB0aGV5IHdpbGwgYXV0b3JlZ2lzdGVyIHRoZW1zZWx2ZXMsIG9uZSBjYXRlZ29yeSB3aXRob3V0IHBhcmVudCAocm9vdCkgYW5kIGEgY2hpbGQgY2F0ZWdvcnkuXG5leHBvcnQgY29uc3QgbG9nZ2VyID0gbmV3IENhdGVnb3J5KFwiVGFiU2NyaXB0XCIpO1xuIiwiaW1wb3J0IEV2ZW50TGlzdGVuZXIgZnJvbSBcIi4vZG9tYWluL0V2ZW50TGlzdGVuZXJcIjtcclxuaW1wb3J0IHtsb2dnZXJ9IGZyb20gXCIuL2ZyYW1ld29yay9Mb2dnZXJcIjtcclxuaW1wb3J0IEFpZmV4U2VydmljZUhUVFAgZnJvbSBcIi4vX2luZnJhL0FpZmV4U2VydmljZUhUVFBcIjtcclxuaW1wb3J0IEJyb3dzZXJTZXJ2aWNlTG9jYWxTdG9yYWdlIGZyb20gXCIuL19pbmZyYS9Ccm93c2VyU2VydmljZUxvY2FsU3RvcmFnZVwiO1xyXG5pbXBvcnQgQnJvd3NlclNlcnZpY2VTZXNzaW9uU3RvcmFnZSBmcm9tIFwiLi9faW5mcmEvQnJvd3NlclNlcnZpY2VTZXNzaW9uU3RvcmFnZVwiO1xyXG5cclxubG9nZ2VyLmluZm8oXCJBSUZFWCBzY3JpcHQgaXMgcnVubmluZy5cIik7XHJcblxyXG5jb25zdCBBSUZFWF9TQ1JJUFQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIkFJRkVYXCIpO1xyXG5pZiAoQUlGRVhfU0NSSVBUKSB7XHJcbiAgICBsb2dnZXIuaW5mbyhcIkFJRkVYIFNDUklQVCBFbGVtZW50IGlzIGZvdW5kLlwiKTtcclxuICAgIGNvbnN0IENPTk5FWElPTl9VUkwgPSBBSUZFWF9TQ1JJUFQuZ2V0QXR0cmlidXRlKFwiY29ubmV4aW9uLXVybFwiKTtcclxuICAgIGlmIChDT05ORVhJT05fVVJMKSB7XHJcbiAgICAgICAgbG9nZ2VyLmluZm8oXCJBSUZFWCBjb25uZXhpb24tdXJsIEVsZW1lbnQgaXMgZm91bmQuXCIpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IEFJRkVYX1VSTCA9IG5ldyBVUkwoQ09OTkVYSU9OX1VSTCk7XHJcblx0XHRcdGxldCBzZXNzaW9uSWQgPSBBSUZFWF9VUkwuc2VhcmNoUGFyYW1zLmdldCgnc2Vzc2lvbklkJyk7XHJcblx0XHRcdGlmIChzZXNzaW9uSWQpIHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKFwiQUlGRVggc2Vzc2lvbklkIGlzIGZvdW5kLlwiKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IEFJRkVYX1NFUlZJQ0UgPSBuZXcgQWlmZXhTZXJ2aWNlSFRUUCgpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgQlJPV1NFUl9TRVJWSUNFID0gbmV3IEJyb3dzZXJTZXJ2aWNlU2Vzc2lvblN0b3JhZ2UoKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IEVWRU5UX0xJU1RFTkVSID0gbmV3IEV2ZW50TGlzdGVuZXIoQUlGRVhfVVJMLm9yaWdpbiwgc2Vzc2lvbklkLCBBSUZFWF9TRVJWSUNFLCBCUk9XU0VSX1NFUlZJQ0UpO1xyXG4gICAgICAgICAgICAgICAgXHJcblx0XHRcdH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkludmFsaWQgY29ubmV4aW9uIFVSTFwiLCBuZXcgRXJyb3IoXCJJbnZhbGlkIGNvbm5leGlvbiBVUkxcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSBlbHNlIHtcclxuICAgIGxvZ2dlci5lcnJvcihcIkFJRkVYIFNDUklQVCBFbGVtZW50IGlzIG5vdCBmb3VuZC5cIiwgbmV3IEVycm9yKFwiQUlGRVggU0NSSVBUIEVsZW1lbnQgaXMgbm90IGZvdW5kLlwiKSk7XHJcbn1cclxuXHJcbi8vIDxzY3JpcHQgaWQ9XCJBSUZFWFwiIGNvbm5leGlvbi11cmw9XCJodHRwczovL2FpZmV4LmNvbS9haWZleC9jb25uZXhpb24/c2Vzc2lvbklkPWExYjJjM2Q0ZTVmNmc3aDhpOWowXCIgc3JjPVwiaHR0cHM6Ly9haWZleC5jb20vYWlmZXgvc2NyaXB0L2FpZmV4LmpzXCI+PC9zY3JpcHQ+IiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNhdGVnb3J5U2VydmljZUNvbnRyb2xJbXBsID0gdm9pZCAwO1xudmFyIENhdGVnb3J5U2VydmljZV8xID0gcmVxdWlyZShcIi4uL2xvZy9jYXRlZ29yeS9DYXRlZ29yeVNlcnZpY2VcIik7XG52YXIgTG9nZ2VyT3B0aW9uc18xID0gcmVxdWlyZShcIi4uL2xvZy9Mb2dnZXJPcHRpb25zXCIpO1xudmFyIERhdGFTdHJ1Y3R1cmVzXzEgPSByZXF1aXJlKFwiLi4vdXRpbHMvRGF0YVN0cnVjdHVyZXNcIik7XG4vKipcbiAqIEltcGxlbWVudGF0aW9uIGNsYXNzIGZvciBDYXRlZ29yeVNlcnZpY2VDb250cm9sLlxuICovXG52YXIgQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbEltcGwgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbEltcGwoKSB7XG4gICAgfVxuICAgIENhdGVnb3J5U2VydmljZUNvbnRyb2xJbXBsLnByb3RvdHlwZS5oZWxwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZTpuby1jb25zb2xlICovXG4gICAgICAgIGNvbnNvbGUubG9nKENhdGVnb3J5U2VydmljZUNvbnRyb2xJbXBsLl9oZWxwKTtcbiAgICAgICAgLyogdHNsaW50OmVuYWJsZTpuby1jb25zb2xlICovXG4gICAgfTtcbiAgICBDYXRlZ29yeVNlcnZpY2VDb250cm9sSW1wbC5wcm90b3R5cGUuZXhhbXBsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLyogdHNsaW50OmRpc2FibGU6bm8tY29uc29sZSAqL1xuICAgICAgICBjb25zb2xlLmxvZyhDYXRlZ29yeVNlcnZpY2VDb250cm9sSW1wbC5fZXhhbXBsZSk7XG4gICAgICAgIC8qIHRzbGludDplbmFibGU6bm8tY29uc29sZSAqL1xuICAgIH07XG4gICAgQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbEltcGwucHJvdG90eXBlLnNob3dTZXR0aW5ncyA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICBpZiAoaWQgPT09IHZvaWQgMCkgeyBpZCA9IFwiYWxsXCI7IH1cbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBEYXRhU3RydWN0dXJlc18xLlN0cmluZ0J1aWxkZXIoKTtcbiAgICAgICAgdmFyIHNlcnZpY2UgPSBDYXRlZ29yeVNlcnZpY2VDb250cm9sSW1wbC5fZ2V0Q2F0ZWdvcnlTZXJ2aWNlKCk7XG4gICAgICAgIHZhciBjYXRlZ29yaWVzID0gQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbEltcGwuX2dldENhdGVnb3JpZXMoaWQpO1xuICAgICAgICBjYXRlZ29yaWVzLmZvckVhY2goZnVuY3Rpb24gKGNhdGVnb3J5KSB7XG4gICAgICAgICAgICBDYXRlZ29yeVNlcnZpY2VDb250cm9sSW1wbC5fcHJvY2Vzc0NhdGVnb3J5KHNlcnZpY2UsIGNhdGVnb3J5LCByZXN1bHQsIDApO1xuICAgICAgICB9KTtcbiAgICAgICAgLyogdHNsaW50OmRpc2FibGU6bm8tY29uc29sZSAqL1xuICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQudG9TdHJpbmcoKSk7XG4gICAgICAgIC8qIHRzbGludDplbmFibGU6bm8tY29uc29sZSAqL1xuICAgIH07XG4gICAgQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbEltcGwucHJvdG90eXBlLmNoYW5nZSA9IGZ1bmN0aW9uIChzZXR0aW5ncykge1xuICAgICAgICB2YXIgc2VydmljZSA9IENhdGVnb3J5U2VydmljZUNvbnRyb2xJbXBsLl9nZXRDYXRlZ29yeVNlcnZpY2UoKTtcbiAgICAgICAgdmFyIGNhdGVnb3JpZXMgPSBDYXRlZ29yeVNlcnZpY2VDb250cm9sSW1wbC5fZ2V0Q2F0ZWdvcmllcyhzZXR0aW5ncy5jYXRlZ29yeSk7XG4gICAgICAgIHZhciBsb2dMZXZlbCA9IG51bGw7XG4gICAgICAgIHZhciBmb3JtYXRFbnVtID0gbnVsbDtcbiAgICAgICAgdmFyIHNob3dDYXRlZ29yeU5hbWUgPSBudWxsO1xuICAgICAgICB2YXIgc2hvd1RpbWVzdGFtcCA9IG51bGw7XG4gICAgICAgIHZhciByZXN1bHQgPSBudWxsO1xuICAgICAgICB2YXIgYWRkUmVzdWx0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiLCBcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdCArPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgYWRkUmVzdWx0KFwicmVjdXJzaXZlPVwiICsgc2V0dGluZ3MucmVjdXJzaXZlKTtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5sb2dMZXZlbCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgbG9nTGV2ZWwgPSBMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWwuZnJvbVN0cmluZyhzZXR0aW5ncy5sb2dMZXZlbCk7XG4gICAgICAgICAgICBhZGRSZXN1bHQoXCJsb2dMZXZlbD1cIiArIHNldHRpbmdzLmxvZ0xldmVsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHNldHRpbmdzLmxvZ0Zvcm1hdCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgZm9ybWF0RW51bSA9IExvZ2dlck9wdGlvbnNfMS5EYXRlRm9ybWF0RW51bS5mcm9tU3RyaW5nKHNldHRpbmdzLmxvZ0Zvcm1hdCk7XG4gICAgICAgICAgICBhZGRSZXN1bHQoXCJsb2dGb3JtYXQ9XCIgKyBzZXR0aW5ncy5sb2dGb3JtYXQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3Muc2hvd0NhdGVnb3J5TmFtZSA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICAgIHNob3dDYXRlZ29yeU5hbWUgPSBzZXR0aW5ncy5zaG93Q2F0ZWdvcnlOYW1lO1xuICAgICAgICAgICAgYWRkUmVzdWx0KFwic2hvd0NhdGVnb3J5TmFtZT1cIiArIHNldHRpbmdzLnNob3dDYXRlZ29yeU5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3Muc2hvd1RpbWVzdGFtcCA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICAgIHNob3dUaW1lc3RhbXAgPSBzZXR0aW5ncy5zaG93VGltZXN0YW1wO1xuICAgICAgICAgICAgYWRkUmVzdWx0KFwic2hvd1RpbWVzdGFtcD1cIiArIHNldHRpbmdzLnNob3dUaW1lc3RhbXApO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhcHBseUNoYW5nZXMgPSBmdW5jdGlvbiAoY2F0KSB7XG4gICAgICAgICAgICB2YXIgY2F0ZWdvcnlTZXR0aW5ncyA9IHNlcnZpY2UuZ2V0Q2F0ZWdvcnlTZXR0aW5ncyhjYXQpO1xuICAgICAgICAgICAgLy8gU2hvdWxkIG5vdCBoYXBwZW4gYnV0IG1ha2UgdHNsaW50IGhhcHB5XG4gICAgICAgICAgICBpZiAoY2F0ZWdvcnlTZXR0aW5ncyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChsb2dMZXZlbCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeVNldHRpbmdzLmxvZ0xldmVsID0gbG9nTGV2ZWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChmb3JtYXRFbnVtICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5U2V0dGluZ3MubG9nRm9ybWF0LmRhdGVGb3JtYXQuZm9ybWF0RW51bSA9IGZvcm1hdEVudW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzaG93VGltZXN0YW1wICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5U2V0dGluZ3MubG9nRm9ybWF0LnNob3dUaW1lU3RhbXAgPSBzaG93VGltZXN0YW1wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc2hvd0NhdGVnb3J5TmFtZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeVNldHRpbmdzLmxvZ0Zvcm1hdC5zaG93Q2F0ZWdvcnlOYW1lID0gc2hvd0NhdGVnb3J5TmFtZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNhdGVnb3JpZXMuZm9yRWFjaChmdW5jdGlvbiAoY2F0KSB7IHJldHVybiBDYXRlZ29yeVNlcnZpY2VDb250cm9sSW1wbC5fYXBwbHlUb0NhdGVnb3J5KGNhdCwgc2V0dGluZ3MucmVjdXJzaXZlLCBhcHBseUNoYW5nZXMpOyB9KTtcbiAgICAgICAgLyogdHNsaW50OmRpc2FibGU6bm8tY29uc29sZSAqL1xuICAgICAgICBjb25zb2xlLmxvZyhcIkFwcGxpZWQgY2hhbmdlczogXCIgKyByZXN1bHQgKyBcIiB0byBjYXRlZ29yaWVzICdcIiArIHNldHRpbmdzLmNhdGVnb3J5ICsgXCInLlwiKTtcbiAgICAgICAgLyogdHNsaW50OmVuYWJsZTpuby1jb25zb2xlICovXG4gICAgfTtcbiAgICBDYXRlZ29yeVNlcnZpY2VDb250cm9sSW1wbC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgaWYgKGlkID09PSB2b2lkIDApIHsgaWQgPSBcImFsbFwiOyB9XG4gICAgICAgIHZhciBzZXJ2aWNlID0gQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbEltcGwuX2dldENhdGVnb3J5U2VydmljZSgpO1xuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IENhdGVnb3J5U2VydmljZUNvbnRyb2xJbXBsLl9nZXRDYXRlZ29yaWVzKGlkKTtcbiAgICAgICAgdmFyIGFwcGx5Q2hhbmdlcyA9IGZ1bmN0aW9uIChjYXQpIHtcbiAgICAgICAgICAgIHZhciBjYXRlZ29yeVNldHRpbmdzID0gc2VydmljZS5nZXRDYXRlZ29yeVNldHRpbmdzKGNhdCk7XG4gICAgICAgICAgICB2YXIgb3JpZ2luYWwgPSBzZXJ2aWNlLmdldE9yaWdpbmFsQ2F0ZWdvcnlTZXR0aW5ncyhjYXQpO1xuICAgICAgICAgICAgLy8gU2hvdWxkIG5vdCBoYXBwZW4gYnV0IG1ha2UgdHNsaW50IGhhcHB5XG4gICAgICAgICAgICBpZiAoY2F0ZWdvcnlTZXR0aW5ncyAhPT0gbnVsbCAmJiBvcmlnaW5hbCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5U2V0dGluZ3MubG9nTGV2ZWwgPSBvcmlnaW5hbC5sb2dMZXZlbDtcbiAgICAgICAgICAgICAgICBjYXRlZ29yeVNldHRpbmdzLmxvZ0Zvcm1hdC5kYXRlRm9ybWF0LmZvcm1hdEVudW0gPSBvcmlnaW5hbC5sb2dGb3JtYXQuZGF0ZUZvcm1hdC5mb3JtYXRFbnVtO1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5U2V0dGluZ3MubG9nRm9ybWF0LnNob3dUaW1lU3RhbXAgPSBvcmlnaW5hbC5sb2dGb3JtYXQuc2hvd1RpbWVTdGFtcDtcbiAgICAgICAgICAgICAgICBjYXRlZ29yeVNldHRpbmdzLmxvZ0Zvcm1hdC5zaG93Q2F0ZWdvcnlOYW1lID0gb3JpZ2luYWwubG9nRm9ybWF0LnNob3dDYXRlZ29yeU5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNhdGVnb3JpZXMuZm9yRWFjaChmdW5jdGlvbiAoY2F0KSB7IHJldHVybiBDYXRlZ29yeVNlcnZpY2VDb250cm9sSW1wbC5fYXBwbHlUb0NhdGVnb3J5KGNhdCwgdHJ1ZSwgYXBwbHlDaGFuZ2VzKTsgfSk7XG4gICAgICAgIC8qIHRzbGludDpkaXNhYmxlOm5vLWNvbnNvbGUgKi9cbiAgICAgICAgY29uc29sZS5sb2coXCJBcHBsaWVkIHJlc2V0IHRvIGNhdGVnb3J5OiBcIiArIGlkICsgXCIuXCIpO1xuICAgICAgICAvKiB0c2xpbnQ6ZW5hYmxlOm5vLWNvbnNvbGUgKi9cbiAgICB9O1xuICAgIENhdGVnb3J5U2VydmljZUNvbnRyb2xJbXBsLl9wcm9jZXNzQ2F0ZWdvcnkgPSBmdW5jdGlvbiAoc2VydmljZSwgY2F0ZWdvcnksIHJlc3VsdCwgaW5kZW50KSB7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IHNlcnZpY2UuZ2V0Q2F0ZWdvcnlTZXR0aW5ncyhjYXRlZ29yeSk7XG4gICAgICAgIGlmIChzZXR0aW5ncyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0LmFwcGVuZChcIiAgXCIgKyBjYXRlZ29yeS5pZCArIFwiOiBcIik7XG4gICAgICAgICAgICBpZiAoaW5kZW50ID4gMCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5kZW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmFwcGVuZChcIiAgXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5hcHBlbmQoY2F0ZWdvcnkubmFtZSArIFwiIChcIiArIExvZ2dlck9wdGlvbnNfMS5Mb2dMZXZlbFtzZXR0aW5ncy5sb2dMZXZlbF0udG9TdHJpbmcoKSArIFwiQFwiICsgTG9nZ2VyT3B0aW9uc18xLkxvZ2dlclR5cGVbc2V0dGluZ3MubG9nZ2VyVHlwZV0udG9TdHJpbmcoKSArIFwiKVxcblwiKTtcbiAgICAgICAgICAgIGlmIChjYXRlZ29yeS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcnkuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbEltcGwuX3Byb2Nlc3NDYXRlZ29yeShzZXJ2aWNlLCBjaGlsZCwgcmVzdWx0LCBpbmRlbnQgKyAxKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbEltcGwuX2FwcGx5VG9DYXRlZ29yeSA9IGZ1bmN0aW9uIChjYXRlZ29yeSwgcmVjdXJzaXZlLCBhcHBseSkge1xuICAgICAgICBhcHBseShjYXRlZ29yeSk7XG4gICAgICAgIGlmIChyZWN1cnNpdmUpIHtcbiAgICAgICAgICAgIGNhdGVnb3J5LmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgICAgICAgICAgQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbEltcGwuX2FwcGx5VG9DYXRlZ29yeShjaGlsZCwgcmVjdXJzaXZlLCBhcHBseSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbEltcGwuX2dldENhdGVnb3J5U2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIENhdGVnb3J5U2VydmljZV8xLkNhdGVnb3J5U2VydmljZUltcGwuZ2V0SW5zdGFuY2UoKTtcbiAgICB9O1xuICAgIENhdGVnb3J5U2VydmljZUNvbnRyb2xJbXBsLl9nZXRDYXRlZ29yaWVzID0gZnVuY3Rpb24gKGlkQ2F0ZWdvcnkpIHtcbiAgICAgICAgdmFyIHNlcnZpY2UgPSBDYXRlZ29yeVNlcnZpY2VDb250cm9sSW1wbC5fZ2V0Q2F0ZWdvcnlTZXJ2aWNlKCk7XG4gICAgICAgIHZhciBjYXRlZ29yaWVzID0gW107XG4gICAgICAgIGlmIChpZENhdGVnb3J5ID09PSBcImFsbFwiKSB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzID0gc2VydmljZS5nZXRSb290Q2F0ZWdvcmllcygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGNhdGVnb3J5ID0gc2VydmljZS5nZXRDYXRlZ29yeUJ5SWQoaWRDYXRlZ29yeSk7XG4gICAgICAgICAgICBpZiAoY2F0ZWdvcnkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZmluZCBjYXRlZ29yeSB3aXRoIGlkIFwiICsgaWRDYXRlZ29yeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRlZ29yaWVzLnB1c2goY2F0ZWdvcnkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYXRlZ29yaWVzO1xuICAgIH07XG4gICAgQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbEltcGwuX2hlbHAgPSBcIlxcbiAgaGVscCgpOiB2b2lkXFxuICAgICoqIFNob3dzIHRoaXMgaGVscC5cXG5cXG4gIGV4YW1wbGUoKTogdm9pZFxcbiAgICAqKiBTaG93cyBhbiBleGFtcGxlIG9uIGhvdyB0byB1c2UgdGhpcy5cXG5cXG4gIHNob3dTZXR0aW5ncyhpZDogbnVtYmVyIHwgXFxcImFsbFxcXCIgPSBcXFwiYWxsXFxcIik6IHZvaWRcXG4gICAgKiogU2hvd3Mgc2V0dGluZ3MgZm9yIGEgc3BlY2lmaWMgY2F0ZWdvcnksIG9yIGZvciBhbGwuIFRoZSBpZCBvZiBjYXRlZ29yaWVzIGNhbiBiZSBmb3VuZCBieSBjYWxsaW5nIHRoaXMgbWV0aG9kIHdpdGhvdXQgcGFyYW1ldGVyLlxcblxcbiAgY2hhbmdlKHNldHRpbmdzOiBDYXRlZ29yeVNlcnZpY2VDb250cm9sU2V0dGluZ3MpOiB2b2lkXFxuICAgICoqIENoYW5nZXMgdGhlIGN1cnJlbnQgc2V0dGluZ3MgZm9yIG9uZSBvciBhbGwgY2F0ZWdvcmllcy5cXG4gICAgKipcXG4gICAgICAgQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbFNldHRpbmdzLCBwcm9wZXJ0aWVzIG9mIG9iamVjdDpcXG4gICAgICAgICBjYXRlZ29yeTogbnVtYmVyIHwgXFxcImFsbFxcXCJcXG4gICAgICAgICAgICoqIEFwcGx5IHRvIHNwZWNpZmljIGNhdGVnb3J5LCBvciBcXFwiYWxsXFxcIi5cXG4gICAgICAgICAgICoqIFJlcXVpcmVkXFxuXFxuICAgICAgICAgcmVjdXJzaXZlOiBib29sZWFuXFxuICAgICAgICAgICAqKiBBcHBseSB0byBjaGlsZCBjYXRlZ29yaWVzICh0cnVlKSBvciBub3QuXFxuICAgICAgICAgICAqKiBSZXF1aXJlZFxcblxcbiAgICAgICAgIGxvZ0xldmVsOiBcXFwiRmF0YWxcXFwiIHwgXFxcIkVycm9yXFxcIiB8IFxcXCJXYXJuXFxcIiB8IFxcXCJJbmZvXFxcIiB8IFxcXCJEZWJ1Z1xcXCIgfCBcXFwiVHJhY2VcXFwiIHwgdW5kZWZpbmVkXFxuICAgICAgICAgICAqKiBTZXQgbG9nIGxldmVsLCB1bmRlZmluZWQgd2lsbCBub3QgY2hhbmdlIHRoZSBzZXR0aW5nLlxcbiAgICAgICAgICAgKiogT3B0aW9uYWxcXG5cXG4gICAgICAgICBsb2dGb3JtYXQ6IFxcXCJEZWZhdWx0XFxcIiB8IFxcXCJZZWFyTW9udGhEYXlUaW1lXFxcIiB8IFxcXCJZZWFyRGF5TW9udGhXaXRoRnVsbFRpbWVcXFwiIHwgXFxcIlllYXJEYXlNb250aFRpbWVcXFwiIHwgdW5kZWZpbmVkXFxuICAgICAgICAgICAqKiBTZXQgdGhlIGxvZyBmb3JtYXQsIHVuZGVmaW5lZCB3aWxsIG5vdCBjaGFuZ2UgdGhlIHNldHRpbmcuXFxuICAgICAgICAgICAqKiBPcHRpb25hbFxcblxcbiAgICAgICAgIHNob3dUaW1lc3RhbXA6IGJvb2xlYW4gfCB1bmRlZmluZWRcXG4gICAgICAgICAgICoqIFdoZXRoZXIgdG8gc2hvdyB0aW1lc3RhbXAsIHVuZGVmaW5lZCB3aWxsIG5vdCBjaGFuZ2UgdGhlIHNldHRpbmcuXFxuICAgICAgICAgICAqKiBPcHRpb25hbFxcblxcbiAgICAgICAgIHNob3dDYXRlZ29yeU5hbWU6IGJvb2xlYW4gfCB1bmRlZmluZWRcXG4gICAgICAgICAgICoqIFdoZXRoZXIgdG8gc2hvdyB0aGUgY2F0ZWdvcnkgbmFtZSwgdW5kZWZpbmVkIHdpbGwgbm90IGNoYW5nZSB0aGUgc2V0dGluZy5cXG4gICAgICAgICAgICoqIE9wdGlvbmFsXFxuXFxuICAgcmVzZXQoaWQ6IG51bWJlciB8IFxcXCJhbGxcXFwiKTogdm9pZFxcbiAgICAgKiogUmVzZXRzIGV2ZXJ5dGhpbmcgdG8gb3JpZ2luYWwgdmFsdWVzLCBmb3Igb25lIHNwZWNpZmljIG9yIGZvciBhbGwgY2F0ZWdvcmllcy5cXG5cIjtcbiAgICBDYXRlZ29yeVNlcnZpY2VDb250cm9sSW1wbC5fZXhhbXBsZSA9IFwiXFxuICBFeGFtcGxlczpcXG4gICAgY2hhbmdlKHtjYXRlZ29yeTogXFxcImFsbFxcXCIsIHJlY3Vyc2l2ZTp0cnVlLCBsb2dMZXZlbDogXFxcIkluZm9cXFwifSlcXG4gICAgICAqKiBDaGFuZ2UgbG9nbGV2ZWwgdG8gSW5mbyBmb3IgYWxsIGNhdGVnb3JpZXMsIGFwcGx5IHRvIGNoaWxkIGNhdGVnb3JpZXMgYXMgd2VsbC5cXG5cXG4gICAgY2hhbmdlKHtjYXRlZ29yeTogMSwgcmVjdXJzaXZlOmZhbHNlLCBsb2dMZXZlbDogXFxcIldhcm5cXFwifSlcXG4gICAgICAqKiBDaGFuZ2UgbG9nTGV2ZWwgZm9yIGNhdGVnb3J5IDEsIGRvIG5vdCByZWN1cnNlLlxcblxcbiAgICBjaGFuZ2Uoe2NhdGVnb3J5OiBcXFwiYWxsXFxcIiwgcmVjdXJzaXZlOnRydWUsIGxvZ0xldmVsOiBcXFwiRGVidWdcXFwiLCBsb2dGb3JtYXQ6IFxcXCJZZWFyRGF5TW9udGhUaW1lXFxcIiwgc2hvd1RpbWVzdGFtcDpmYWxzZSwgc2hvd0NhdGVnb3J5TmFtZTpmYWxzZX0pXFxuICAgICAgKiogQ2hhbmdlIGxvZ2xldmVsIHRvIERlYnVnIGZvciBhbGwgY2F0ZWdvcmllcywgYXBwbHkgZm9ybWF0LCBkbyBub3Qgc2hvdyB0aW1lc3RhbXAgYW5kIGNhdGVnb3J5IG5hbWVzIC0gcmVjdXJzaXZlbHkgdG8gY2hpbGQgY2F0ZWdvcmllcy5cXG5cXG5cIjtcbiAgICByZXR1cm4gQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbEltcGw7XG59KCkpO1xuZXhwb3J0cy5DYXRlZ29yeVNlcnZpY2VDb250cm9sSW1wbCA9IENhdGVnb3J5U2VydmljZUNvbnRyb2xJbXBsO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Q2F0ZWdvcnlTZXJ2aWNlQ29udHJvbC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuTG9nZ2VyQ29udHJvbEltcGwgPSB2b2lkIDA7XG52YXIgTG9nZ2VyT3B0aW9uc18xID0gcmVxdWlyZShcIi4uL2xvZy9Mb2dnZXJPcHRpb25zXCIpO1xudmFyIExGU2VydmljZV8xID0gcmVxdWlyZShcIi4uL2xvZy9zdGFuZGFyZC9MRlNlcnZpY2VcIik7XG52YXIgRGF0YVN0cnVjdHVyZXNfMSA9IHJlcXVpcmUoXCIuLi91dGlscy9EYXRhU3RydWN0dXJlc1wiKTtcbnZhciBMb2dnZXJDb250cm9sSW1wbCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBMb2dnZXJDb250cm9sSW1wbCgpIHtcbiAgICB9XG4gICAgTG9nZ2VyQ29udHJvbEltcGwucHJvdG90eXBlLmhlbHAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8qIHRzbGludDpkaXNhYmxlOm5vLWNvbnNvbGUgKi9cbiAgICAgICAgY29uc29sZS5sb2coTG9nZ2VyQ29udHJvbEltcGwuX2hlbHApO1xuICAgICAgICAvKiB0c2xpbnQ6ZW5hYmxlOm5vLWNvbnNvbGUgKi9cbiAgICB9O1xuICAgIExvZ2dlckNvbnRyb2xJbXBsLnByb3RvdHlwZS5saXN0RmFjdG9yaWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcnRTZXR0aW5nc0ZhY3RvcmllcyA9IExvZ2dlckNvbnRyb2xJbXBsLl9nZXRSdW50aW1lU2V0dGluZ3NMb2dnZXJGYWN0b3JpZXMoKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBEYXRhU3RydWN0dXJlc18xLlN0cmluZ0J1aWxkZXIoKTtcbiAgICAgICAgcmVzdWx0LmFwcGVuZExpbmUoXCJSZWdpc3RlcmVkIExvZ2dlckZhY3RvcmllcyAoaW5kZXggLyBuYW1lKVwiKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydFNldHRpbmdzRmFjdG9yaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcnRTZXR0aW5nc0ZhY3RvcnkgPSBydFNldHRpbmdzRmFjdG9yaWVzW2ldO1xuICAgICAgICAgICAgcmVzdWx0LmFwcGVuZChcIiAgXCIgKyBpKS5hcHBlbmQoXCI6IFwiICsgcnRTZXR0aW5nc0ZhY3RvcnkuZ2V0TmFtZSgpICsgXCJcXG5cIik7XG4gICAgICAgIH1cbiAgICAgICAgLyogdHNsaW50OmRpc2FibGU6bm8tY29uc29sZSAqL1xuICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQudG9TdHJpbmcoKSk7XG4gICAgICAgIC8qIHRzbGludDplbmFibGU6bm8tY29uc29sZSAqL1xuICAgIH07XG4gICAgTG9nZ2VyQ29udHJvbEltcGwucHJvdG90eXBlLnNob3dTZXR0aW5ncyA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICBpZiAoaWQgPT09IHZvaWQgMCkgeyBpZCA9IFwiYWxsXCI7IH1cbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBpZiAoaWQgPT09IFwiYWxsXCIpIHtcbiAgICAgICAgICAgIHZhciBpZHhfMSA9IDA7XG4gICAgICAgICAgICBMb2dnZXJDb250cm9sSW1wbC5fZ2V0UnVudGltZVNldHRpbmdzTG9nZ2VyRmFjdG9yaWVzKCkuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBEYXRhU3RydWN0dXJlc18xLlR1cGxlUGFpcihpZHhfMSsrLCBpdGVtKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBzZXR0aW5ncyA9IExvZ2dlckNvbnRyb2xJbXBsLl9nZXRSdW50aW1lU2V0dGluZ3NMb2dnZXJGYWN0b3JpZXMoKTtcbiAgICAgICAgICAgIGlmIChpZCA+PSAwICYmIGlkIDwgc2V0dGluZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobmV3IERhdGFTdHJ1Y3R1cmVzXzEuVHVwbGVQYWlyKGlkLCBzZXR0aW5nc1tpZF0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJlcXVlc3RlZCBudW1iZXI6IFwiICsgaWQgKyBcIiB3YXMgbm90IGZvdW5kLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHJlc3VsdF8xID0gcmVzdWx0OyBfaSA8IHJlc3VsdF8xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIHNldHRpbmcgPSByZXN1bHRfMVtfaV07XG4gICAgICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZTpuby1jb25zb2xlICovXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIiAgTG9nZ2VyRmFjdG9yeTogXCIgKyBzZXR0aW5nLnkuZ2V0TmFtZSgpICsgXCIgKGlkPVwiICsgc2V0dGluZy54ICsgXCIpXCIpO1xuICAgICAgICAgICAgdmFyIGxvZ0dyb3VwUnVudGltZVNldHRpbmdzID0gc2V0dGluZy55LmdldExvZ0dyb3VwUnVudGltZVNldHRpbmdzKCk7XG4gICAgICAgICAgICBmb3IgKHZhciBnID0gMDsgZyA8IGxvZ0dyb3VwUnVudGltZVNldHRpbmdzLmxlbmd0aDsgZysrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGdyb3VwU2V0dGluZyA9IGxvZ0dyb3VwUnVudGltZVNldHRpbmdzW2ddO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiICAgICBMb2dHcm91cDogKGlkPVwiICsgZyArIFwiKVwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIiAgICAgICBSZWdFeHA6IFwiICsgZ3JvdXBTZXR0aW5nLmxvZ0dyb3VwUnVsZS5yZWdFeHAuc291cmNlKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIiAgICAgICBMZXZlbDogXCIgKyBMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWxbZ3JvdXBTZXR0aW5nLmxldmVsXS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIiAgICAgICBMb2dnZXJUeXBlOiBcIiArIExvZ2dlck9wdGlvbnNfMS5Mb2dnZXJUeXBlW2dyb3VwU2V0dGluZy5sb2dnZXJUeXBlXS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIHRzbGludDplbmFibGU6bm8tY29uc29sZSAqL1xuICAgICAgICB9XG4gICAgfTtcbiAgICBMb2dnZXJDb250cm9sSW1wbC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoaWRGYWN0b3J5KSB7XG4gICAgICAgIGlmIChpZEZhY3RvcnkgPT09IHZvaWQgMCkgeyBpZEZhY3RvcnkgPSBcImFsbFwiOyB9XG4gICAgICAgIHZhciBsb2dnZXJGYWN0b3JpZXNTZXR0aW5ncyA9IExvZ2dlckNvbnRyb2xJbXBsLl9nZXRSdW50aW1lU2V0dGluZ3NMb2dnZXJGYWN0b3JpZXMoKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBpZiAoaWRGYWN0b3J5ID09PSBcImFsbFwiKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBsb2dnZXJGYWN0b3JpZXNTZXR0aW5ncztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpZEZhY3RvcnkgPj0gMCAmJiBpZEZhY3RvcnkgPCBsb2dnZXJGYWN0b3JpZXNTZXR0aW5ncy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChsb2dnZXJGYWN0b3JpZXNTZXR0aW5nc1tpZEZhY3RvcnldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXN1bHQuZm9yRWFjaChmdW5jdGlvbiAoc2V0dGluZykge1xuICAgICAgICAgICAgLyogdHNsaW50OmRpc2FibGU6bm8tY29uc29sZSAqL1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZXNldCBhbGwgc2V0dGluZ3MgZm9yIGZhY3RvcnkgXCIgKyBpZEZhY3RvcnkpO1xuICAgICAgICAgICAgLyogdHNsaW50OmVuYWJsZTpuby1jb25zb2xlICovXG4gICAgICAgICAgICB2YXIgY29udHJvbCA9IG5ldyBMb2dnZXJGYWN0b3J5Q29udHJvbEltcGwoc2V0dGluZyk7XG4gICAgICAgICAgICBjb250cm9sLnJlc2V0KCk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgTG9nZ2VyQ29udHJvbEltcGwucHJvdG90eXBlLmdldExvZ2dlckZhY3RvcnlDb250cm9sID0gZnVuY3Rpb24gKGlkRmFjdG9yeSkge1xuICAgICAgICB2YXIgbG9nZ2VyRmFjdG9yaWVzU2V0dGluZ3MgPSBMb2dnZXJDb250cm9sSW1wbC5fZ2V0UnVudGltZVNldHRpbmdzTG9nZ2VyRmFjdG9yaWVzKCk7XG4gICAgICAgIGlmIChpZEZhY3RvcnkgPj0gMCAmJiBpZEZhY3RvcnkgPCBsb2dnZXJGYWN0b3JpZXNTZXR0aW5ncy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTG9nZ2VyRmFjdG9yeUNvbnRyb2xJbXBsKGxvZ2dlckZhY3Rvcmllc1NldHRpbmdzW2lkRmFjdG9yeV0pO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImlkRmFjdG9yeSBpcyBpbnZhbGlkIChsZXNzIHRoYW4gMCkgb3Igbm9uIGV4aXN0aW5nIGlkLlwiKTtcbiAgICB9O1xuICAgIExvZ2dlckNvbnRyb2xJbXBsLl9nZXRSdW50aW1lU2V0dGluZ3NMb2dnZXJGYWN0b3JpZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBMb2dnZXJDb250cm9sSW1wbC5fZ2V0U2V0dGluZ3MoKS5nZXRSdW50aW1lU2V0dGluZ3NGb3JMb2dnZXJGYWN0b3JpZXMoKTtcbiAgICB9O1xuICAgIExvZ2dlckNvbnRyb2xJbXBsLl9nZXRTZXR0aW5ncyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIExGU2VydmljZV8xLkxGU2VydmljZS5nZXRSdW50aW1lU2V0dGluZ3MoKTtcbiAgICB9O1xuICAgIExvZ2dlckNvbnRyb2xJbXBsLl9oZWxwID0gXCJcXG4gIGhlbHAoKTogdm9pZFxcbiAgICAqKiBTaG93cyB0aGlzIGhlbHAuXFxuXFxuICBsaXN0RmFjdG9yaWVzKCk6IHZvaWRcXG4gICAgKiogTGlzdCBhbGwgcmVnaXN0ZXJlZCBMb2dnZXJGYWN0b3JpZXMgd2l0aCBhc3NvY2lhdGVkIGxvZyBncm91cHMgd2l0aCByZXNwZWN0aXZlIGlkcyAoaWRzIGNhbiBiZSB1c2VkIHRvIHRhcmdldCBhIGZhY3RvcnkgYW5kL29yIGdyb3VwKS5cXG5cXG4gIHNob3dTZXR0aW5ncyhpZEZhY3Rvcnk6IG51bWJlciB8IFxcXCJhbGxcXFwiKTogdm9pZFxcbiAgICAqKiBTaG93IGxvZyBncm91cCBzZXR0aW5ncyBmb3IgaWRGYWN0b3J5ICh1c2UgbGlzdEZhY3RvcmllcyB0byBmaW5kIGlkIGZvciBhIExvZ2dlckZhY3RvcnkpLiBJZiBpZEZhY3RvcnkgaXMgXFxcImFsbFxcXCIgc2hvd3MgYWxsIGZhY3Rvcmllcy5cXG5cXG4gIGdldExvZ2dlckZhY3RvcnlDb250cm9sKGlkRmFjdG9yeTogbnVtYmVyKTogTG9nZ2VyRmFjdG9yeUNvbnRyb2xcXG4gICAgKiogUmV0dXJuIExvZ2dlckZhY3RvcnlDb250cm9sIHdoZW4gZm91bmQgZm9yIGdpdmVuIGlkRmFjdG9yeSBvciB0aHJvd3MgRXJyb3IgaWYgaW52YWxpZCBvciBudWxsLCBnZXQgdGhlIGlkIGJ5IHVzaW5nIGxpc3RGYWN0b3JpZXMoKVxcblxcbiAgcmVzZXQoaWRGYWN0b3J5OiBudW1iZXIgfCBcXFwiYWxsXFxcIik6IHZvaWRcXG4gICAgKiogUmVzZXRzIGdpdmVuIGZhY3Rvcnkgb3IgYWxsIGZhY3RvcmllcyBiYWNrIHRvIG9yaWdpbmFsIHZhbHVlcy5cXG5cIjtcbiAgICByZXR1cm4gTG9nZ2VyQ29udHJvbEltcGw7XG59KCkpO1xuZXhwb3J0cy5Mb2dnZXJDb250cm9sSW1wbCA9IExvZ2dlckNvbnRyb2xJbXBsO1xudmFyIExvZ2dlckZhY3RvcnlDb250cm9sSW1wbCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBMb2dnZXJGYWN0b3J5Q29udHJvbEltcGwoc2V0dGluZ3MpIHtcbiAgICAgICAgdGhpcy5fc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB9XG4gICAgTG9nZ2VyRmFjdG9yeUNvbnRyb2xJbXBsLnByb3RvdHlwZS5oZWxwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZTpuby1jb25zb2xlICovXG4gICAgICAgIGNvbnNvbGUubG9nKExvZ2dlckZhY3RvcnlDb250cm9sSW1wbC5faGVscCk7XG4gICAgICAgIC8qIHRzbGludDplbmFibGU6bm8tY29uc29sZSAqL1xuICAgIH07XG4gICAgTG9nZ2VyRmFjdG9yeUNvbnRyb2xJbXBsLnByb3RvdHlwZS5leGFtcGxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZTpuby1jb25zb2xlICovXG4gICAgICAgIGNvbnNvbGUubG9nKExvZ2dlckZhY3RvcnlDb250cm9sSW1wbC5fZXhhbXBsZSk7XG4gICAgICAgIC8qIHRzbGludDplbmFibGU6bm8tY29uc29sZSAqL1xuICAgIH07XG4gICAgTG9nZ2VyRmFjdG9yeUNvbnRyb2xJbXBsLnByb3RvdHlwZS5zaG93U2V0dGluZ3MgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgaWYgKGlkID09PSB2b2lkIDApIHsgaWQgPSBcImFsbFwiOyB9XG4gICAgICAgIHZhciByZXN1bHQgPSBuZXcgRGF0YVN0cnVjdHVyZXNfMS5TdHJpbmdCdWlsZGVyKCk7XG4gICAgICAgIHZhciBsb2dHcm91cFJ1bnRpbWVTZXR0aW5ncyA9IHRoaXMuX3NldHRpbmdzLmdldExvZ0dyb3VwUnVudGltZVNldHRpbmdzKCk7XG4gICAgICAgIHJlc3VsdC5hcHBlbmRMaW5lKFwiUmVnaXN0ZXJlZCBMb2dHcm91cHMgKGluZGV4IC8gZXhwcmVzc2lvbilcIik7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9nR3JvdXBSdW50aW1lU2V0dGluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBsb2dHcm91cFJ1bnRpbWVTZXR0aW5nID0gbG9nR3JvdXBSdW50aW1lU2V0dGluZ3NbaV07XG4gICAgICAgICAgICByZXN1bHQuYXBwZW5kTGluZShcIiAgXCIgKyBpICsgXCI6IFwiICsgbG9nR3JvdXBSdW50aW1lU2V0dGluZy5sb2dHcm91cFJ1bGUucmVnRXhwLnNvdXJjZSArIFwiLCBsb2dMZXZlbD1cIiArXG4gICAgICAgICAgICAgICAgTG9nZ2VyT3B0aW9uc18xLkxvZ0xldmVsW2xvZ0dyb3VwUnVudGltZVNldHRpbmcubGV2ZWxdLnRvU3RyaW5nKCkgKyBcIiwgc2hvd1RpbWVzdGFtcD1cIiArIGxvZ0dyb3VwUnVudGltZVNldHRpbmcubG9nRm9ybWF0LnNob3dUaW1lU3RhbXAgK1xuICAgICAgICAgICAgICAgIFwiLCBzaG93TG9nZ2VyTmFtZT1cIiArIGxvZ0dyb3VwUnVudGltZVNldHRpbmcubG9nRm9ybWF0LnNob3dMb2dnZXJOYW1lICtcbiAgICAgICAgICAgICAgICBcIiwgZm9ybWF0PVwiICsgTG9nZ2VyT3B0aW9uc18xLkRhdGVGb3JtYXRFbnVtW2xvZ0dyb3VwUnVudGltZVNldHRpbmcubG9nRm9ybWF0LmRhdGVGb3JtYXQuZm9ybWF0RW51bV0udG9TdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICAgICAgLyogdHNsaW50OmRpc2FibGU6bm8tY29uc29sZSAqL1xuICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQudG9TdHJpbmcoKSk7XG4gICAgICAgIC8qIHRzbGludDplbmFibGU6bm8tY29uc29sZSAqL1xuICAgIH07XG4gICAgTG9nZ2VyRmFjdG9yeUNvbnRyb2xJbXBsLnByb3RvdHlwZS5jaGFuZ2UgPSBmdW5jdGlvbiAoc2V0dGluZ3MpIHtcbiAgICAgICAgdmFyIGxvZ0dyb3VwUnVudGltZVNldHRpbmdzID0gdGhpcy5fZ2V0TG9nR3JvdXBSdW5UaW1lU2V0dGluZ3NGb3Ioc2V0dGluZ3MuZ3JvdXApO1xuICAgICAgICB2YXIgbG9nTGV2ZWwgPSBudWxsO1xuICAgICAgICB2YXIgZm9ybWF0RW51bSA9IG51bGw7XG4gICAgICAgIHZhciBzaG93TG9nZ2VyTmFtZSA9IG51bGw7XG4gICAgICAgIHZhciBzaG93VGltZXN0YW1wID0gbnVsbDtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG51bGw7XG4gICAgICAgIHZhciBhZGRSZXN1bHQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCIsIFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZW9mIHNldHRpbmdzLmxvZ0xldmVsID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBsb2dMZXZlbCA9IExvZ2dlck9wdGlvbnNfMS5Mb2dMZXZlbC5mcm9tU3RyaW5nKHNldHRpbmdzLmxvZ0xldmVsKTtcbiAgICAgICAgICAgIGFkZFJlc3VsdChcImxvZ0xldmVsPVwiICsgc2V0dGluZ3MubG9nTGV2ZWwpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MubG9nRm9ybWF0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBmb3JtYXRFbnVtID0gTG9nZ2VyT3B0aW9uc18xLkRhdGVGb3JtYXRFbnVtLmZyb21TdHJpbmcoc2V0dGluZ3MubG9nRm9ybWF0KTtcbiAgICAgICAgICAgIGFkZFJlc3VsdChcImxvZ0Zvcm1hdD1cIiArIHNldHRpbmdzLmxvZ0Zvcm1hdCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5zaG93TG9nZ2VyTmFtZSA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICAgIHNob3dMb2dnZXJOYW1lID0gc2V0dGluZ3Muc2hvd0xvZ2dlck5hbWU7XG4gICAgICAgICAgICBhZGRSZXN1bHQoXCJzaG93TG9nZ2VyTmFtZT1cIiArIHNldHRpbmdzLnNob3dMb2dnZXJOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHNldHRpbmdzLnNob3dUaW1lc3RhbXAgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgICAgICBzaG93VGltZXN0YW1wID0gc2V0dGluZ3Muc2hvd1RpbWVzdGFtcDtcbiAgICAgICAgICAgIGFkZFJlc3VsdChcInNob3dUaW1lc3RhbXA9XCIgKyBzZXR0aW5ncy5zaG93VGltZXN0YW1wKTtcbiAgICAgICAgfVxuICAgICAgICBsb2dHcm91cFJ1bnRpbWVTZXR0aW5ncy5mb3JFYWNoKGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICBpZiAobG9nTGV2ZWwgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzLmxldmVsID0gbG9nTGV2ZWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZm9ybWF0RW51bSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHMubG9nRm9ybWF0LmRhdGVGb3JtYXQuZm9ybWF0RW51bSA9IGZvcm1hdEVudW07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2hvd1RpbWVzdGFtcCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHMubG9nRm9ybWF0LnNob3dUaW1lU3RhbXAgPSBzaG93VGltZXN0YW1wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNob3dMb2dnZXJOYW1lICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcy5sb2dGb3JtYXQuc2hvd0xvZ2dlck5hbWUgPSBzaG93TG9nZ2VyTmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8qIHRzbGludDpkaXNhYmxlOm5vLWNvbnNvbGUgKi9cbiAgICAgICAgY29uc29sZS5sb2coXCJBcHBsaWVkIGNoYW5nZXM6IFwiICsgcmVzdWx0ICsgXCIgdG8gbG9nIGdyb3VwcyAnXCIgKyBzZXR0aW5ncy5ncm91cCArIFwiJy5cIik7XG4gICAgICAgIC8qIHRzbGludDplbmFibGU6bm8tY29uc29sZSAqL1xuICAgIH07XG4gICAgTG9nZ2VyRmFjdG9yeUNvbnRyb2xJbXBsLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIChpZEdyb3VwKSB7XG4gICAgICAgIGlmIChpZEdyb3VwID09PSB2b2lkIDApIHsgaWRHcm91cCA9IFwiYWxsXCI7IH1cbiAgICAgICAgdmFyIHNldHRpbmdzID0gdGhpcy5fZ2V0TG9nR3JvdXBSdW5UaW1lU2V0dGluZ3NGb3IoaWRHcm91cCk7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgc2V0dGluZ3NfMSA9IHNldHRpbmdzOyBfaSA8IHNldHRpbmdzXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgc2V0dGluZyA9IHNldHRpbmdzXzFbX2ldO1xuICAgICAgICAgICAgc2V0dGluZy5sZXZlbCA9IHNldHRpbmcubG9nR3JvdXBSdWxlLmxldmVsO1xuICAgICAgICAgICAgc2V0dGluZy5sb2dGb3JtYXQuc2hvd1RpbWVTdGFtcCA9IHNldHRpbmcubG9nR3JvdXBSdWxlLmxvZ0Zvcm1hdC5zaG93VGltZVN0YW1wO1xuICAgICAgICAgICAgc2V0dGluZy5sb2dGb3JtYXQuc2hvd0xvZ2dlck5hbWUgPSBzZXR0aW5nLmxvZ0dyb3VwUnVsZS5sb2dGb3JtYXQuc2hvd0xvZ2dlck5hbWU7XG4gICAgICAgICAgICBzZXR0aW5nLmxvZ0Zvcm1hdC5kYXRlRm9ybWF0LmZvcm1hdEVudW0gPSBzZXR0aW5nLmxvZ0dyb3VwUnVsZS5sb2dGb3JtYXQuZGF0ZUZvcm1hdC5mb3JtYXRFbnVtO1xuICAgICAgICB9XG4gICAgICAgIC8qIHRzbGludDpkaXNhYmxlOm5vLWNvbnNvbGUgKi9cbiAgICAgICAgY29uc29sZS5sb2coXCJSZXNldCBhbGwgc2V0dGluZ3MgZm9yIGdyb3VwIFwiICsgaWRHcm91cCk7XG4gICAgICAgIC8qIHRzbGludDplbmFibGU6bm8tY29uc29sZSAqL1xuICAgIH07XG4gICAgTG9nZ2VyRmFjdG9yeUNvbnRyb2xJbXBsLnByb3RvdHlwZS5fZ2V0TG9nR3JvdXBSdW5UaW1lU2V0dGluZ3NGb3IgPSBmdW5jdGlvbiAoaWRHcm91cCkge1xuICAgICAgICB2YXIgc2V0dGluZ3MgPSBbXTtcbiAgICAgICAgaWYgKGlkR3JvdXAgPT09IFwiYWxsXCIpIHtcbiAgICAgICAgICAgIHNldHRpbmdzID0gdGhpcy5fc2V0dGluZ3MuZ2V0TG9nR3JvdXBSdW50aW1lU2V0dGluZ3MoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2NoZWNrSW5kZXgoaWRHcm91cCk7XG4gICAgICAgICAgICBzZXR0aW5ncy5wdXNoKHRoaXMuX3NldHRpbmdzLmdldExvZ0dyb3VwUnVudGltZVNldHRpbmdzKClbaWRHcm91cF0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXR0aW5ncztcbiAgICB9O1xuICAgIExvZ2dlckZhY3RvcnlDb250cm9sSW1wbC5wcm90b3R5cGUuX2NoZWNrSW5kZXggPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLl9zZXR0aW5ncy5nZXRMb2dHcm91cFJ1bnRpbWVTZXR0aW5ncygpLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbmRleCwgdXNlIGxpc3RMb2dHcm91cHMgdG8gZmluZCBvdXQgYSB2YWxpZCBvbmUuXCIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBMb2dnZXJGYWN0b3J5Q29udHJvbEltcGwuX2hlbHAgPSBcIlxcbiAgaGVscCgpOiB2b2lkXFxuICAgICoqIFNob3dzIHRoaXMgaGVscC5cXG5cXG4gIGV4YW1wbGUoKTogdm9pZFxcbiAgICAqKiBTaG93cyBhbiBleGFtcGxlIG9mIHVzYWdlLlxcblxcbiAgc2hvd1NldHRpbmdzKGlkOiBudW1iZXIgfCBcXFwiYWxsXFxcIik6IHZvaWRcXG4gICAgKiogUHJpbnRzIHNldHRpbmdzIGZvciBnaXZlbiBncm91cCBpZCwgXFxcImFsbFxcXCIgZm9yIGFsbCBncm91cC5cXG5cXG4gIGNoYW5nZShzZXR0aW5nczogTG9nR3JvdXBDb250cm9sU2V0dGluZ3MpOiB2b2lkXFxuICAgICoqIENoYW5nZXMgdGhlIGN1cnJlbnQgc2V0dGluZ3MgZm9yIG9uZSBvciBhbGwgbG9nIGdyb3Vwcy5cXG4gICAgKipcXG4gICAgICAgTG9nR3JvdXBDb250cm9sU2V0dGluZ3MsIHByb3BlcnRpZXMgb2Ygb2JqZWN0OlxcbiAgICAgICAgIGdyb3VwOiBudW1iZXIgfCBcXFwiYWxsXFxcIlxcbiAgICAgICAgICAgKiogQXBwbHkgdG8gc3BlY2lmaWMgZ3JvdXAsIG9yIFxcXCJhbGxcXFwiLlxcbiAgICAgICAgICAgKiogUmVxdWlyZWRcXG5cXG4gICAgICAgICBsb2dMZXZlbDogXFxcIkZhdGFsXFxcIiB8IFxcXCJFcnJvclxcXCIgfCBcXFwiV2FyblxcXCIgfCBcXFwiSW5mb1xcXCIgfCBcXFwiRGVidWdcXFwiIHwgXFxcIlRyYWNlXFxcIiB8IHVuZGVmaW5lZFxcbiAgICAgICAgICAgKiogU2V0IGxvZyBsZXZlbCwgdW5kZWZpbmVkIHdpbGwgbm90IGNoYW5nZSB0aGUgc2V0dGluZy5cXG4gICAgICAgICAgICoqIE9wdGlvbmFsXFxuXFxuICAgICAgICAgbG9nRm9ybWF0OiBcXFwiRGVmYXVsdFxcXCIgfCBcXFwiWWVhck1vbnRoRGF5VGltZVxcXCIgfCBcXFwiWWVhckRheU1vbnRoV2l0aEZ1bGxUaW1lXFxcIiB8IFxcXCJZZWFyRGF5TW9udGhUaW1lXFxcIiB8IHVuZGVmaW5lZFxcbiAgICAgICAgICAgKiogU2V0IHRoZSBsb2cgZm9ybWF0LCB1bmRlZmluZWQgd2lsbCBub3QgY2hhbmdlIHRoZSBzZXR0aW5nLlxcbiAgICAgICAgICAgKiogT3B0aW9uYWxcXG5cXG4gICAgICAgICBzaG93VGltZXN0YW1wOiBib29sZWFuIHwgdW5kZWZpbmVkXFxuICAgICAgICAgICAqKiBXaGV0aGVyIHRvIHNob3cgdGltZXN0YW1wLCB1bmRlZmluZWQgd2lsbCBub3QgY2hhbmdlIHRoZSBzZXR0aW5nLlxcbiAgICAgICAgICAgKiogT3B0aW9uYWxcXG5cXG4gICAgICAgICBzaG93TG9nZ2VyTmFtZTogYm9vbGVhbiB8IHVuZGVmaW5lZFxcbiAgICAgICAgICAgKiogV2hldGhlciB0byBzaG93IHRoZSBsb2dnZXIgbmFtZSwgdW5kZWZpbmVkIHdpbGwgbm90IGNoYW5nZSB0aGUgc2V0dGluZy5cXG4gICAgICAgICAgICoqIE9wdGlvbmFsXFxuXFxuICByZXNldChpZDogbnVtYmVyIHwgXFxcImFsbFxcXCIpOiB2b2lkXFxuICAgICoqIFJlc2V0cyBldmVyeXRoaW5nIHRvIG9yaWdpbmFsIHZhbHVlcywgZm9yIG9uZSBzcGVjaWZpYyBvciBmb3IgYWxsIGdyb3Vwcy5cXG5cXG4gIGhlbHAoKTpcXG4gICAgKiogU2hvd3MgdGhpcyBoZWxwLlxcblwiO1xuICAgIExvZ2dlckZhY3RvcnlDb250cm9sSW1wbC5fZXhhbXBsZSA9IFwiXFxuICBFeGFtcGxlczpcXG4gICAgY2hhbmdlKHtncm91cDogXFxcImFsbFxcXCIsIGxvZ0xldmVsOiBcXFwiSW5mb1xcXCJ9KVxcbiAgICAgICoqIENoYW5nZSBsb2dsZXZlbCB0byBJbmZvIGZvciBhbGwgZ3JvdXBzLlxcblxcbiAgICBjaGFuZ2Uoe2dyb3VwOiAxLCByZWN1cnNpdmU6ZmFsc2UsIGxvZ0xldmVsOiBcXFwiV2FyblxcXCJ9KVxcbiAgICAgICoqIENoYW5nZSBsb2dMZXZlbCBmb3IgZ3JvdXAgMSB0byBXYXJuLlxcblxcbiAgICBjaGFuZ2Uoe2dyb3VwOiBcXFwiYWxsXFxcIiwgbG9nTGV2ZWw6IFxcXCJEZWJ1Z1xcXCIsIGxvZ0Zvcm1hdDogXFxcIlllYXJEYXlNb250aFRpbWVcXFwiLCBzaG93VGltZXN0YW1wOmZhbHNlLCBzaG93TG9nZ2VyTmFtZTpmYWxzZX0pXFxuICAgICAgKiogQ2hhbmdlIGxvZ2xldmVsIHRvIERlYnVnIGZvciBhbGwgZ3JvdXBzLCBhcHBseSBmb3JtYXQsIGRvIG5vdCBzaG93IHRpbWVzdGFtcCBhbmQgbG9nZ2VyIG5hbWVzLlxcblwiO1xuICAgIHJldHVybiBMb2dnZXJGYWN0b3J5Q29udHJvbEltcGw7XG59KCkpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9TG9nR3JvdXBDb250cm9sLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5FeHRlbnNpb25IZWxwZXIgPSB2b2lkIDA7XG52YXIgQ2F0ZWdvcnlTZXJ2aWNlXzEgPSByZXF1aXJlKFwiLi4vbG9nL2NhdGVnb3J5L0NhdGVnb3J5U2VydmljZVwiKTtcbnZhciBMb2dnZXJPcHRpb25zXzEgPSByZXF1aXJlKFwiLi4vbG9nL0xvZ2dlck9wdGlvbnNcIik7XG52YXIgTWVzc2FnZVV0aWxzXzEgPSByZXF1aXJlKFwiLi4vdXRpbHMvTWVzc2FnZVV0aWxzXCIpO1xudmFyIEV4dGVuc2lvbkhlbHBlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBFeHRlbnNpb25IZWxwZXIoKSB7XG4gICAgICAgIC8vIFByaXZhdGUgY29uc3RydWN0b3JcbiAgICB9XG4gICAgLyoqXG4gICAgICogRW5hYmxlcyB0aGUgd2luZG93IGV2ZW50IGxpc3RlbmVyIHRvIGxpc3RlbiB0byBtZXNzYWdlcyAoZnJvbSBleHRlbnNpb25zKS5cbiAgICAgKiBDYW4gYmUgcmVnaXN0ZXJlZC9lbmFibGVkIG9ubHkgb25jZS5cbiAgICAgKi9cbiAgICBFeHRlbnNpb25IZWxwZXIucmVnaXN0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghRXh0ZW5zaW9uSGVscGVyLnJlZ2lzdGVyZWQpIHtcbiAgICAgICAgICAgIHZhciBsaXN0ZW5lciA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbXNnID0gZXZ0LmRhdGE7XG4gICAgICAgICAgICAgICAgaWYgKG1zZyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBFeHRlbnNpb25IZWxwZXIucHJvY2Vzc01lc3NhZ2VGcm9tRXh0ZW5zaW9uKG1zZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2Ygd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgbGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgRXh0ZW5zaW9uSGVscGVyLnJlZ2lzdGVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBFeHRlbnNpb25IZWxwZXIucHJvY2Vzc01lc3NhZ2VGcm9tRXh0ZW5zaW9uID0gZnVuY3Rpb24gKG1zZykge1xuICAgICAgICBpZiAoIUV4dGVuc2lvbkhlbHBlci5yZWdpc3RlcmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLyogdHNsaW50OmRpc2FibGU6bm8tY29uc29sZSAqL1xuICAgICAgICBpZiAobXNnLmZyb20gPT09IFwidHNsLWV4dGVuc2lvblwiKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IG1zZy5kYXRhO1xuICAgICAgICAgICAgc3dpdGNoIChkYXRhLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwicmVnaXN0ZXJcIjpcbiAgICAgICAgICAgICAgICAgICAgRXh0ZW5zaW9uSGVscGVyLmVuYWJsZUV4dGVuc2lvbkludGVncmF0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJyZXF1ZXN0LWNoYW5nZS1sb2dsZXZlbFwiOlxuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWVSZXF1ZXN0ID0gZGF0YS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNhdHNBcHBsaWVkID0gRXh0ZW5zaW9uSGVscGVyLmFwcGx5TG9nTGV2ZWwodmFsdWVSZXF1ZXN0LmNhdGVnb3J5SWQsIHZhbHVlUmVxdWVzdC5sb2dMZXZlbCwgdmFsdWVSZXF1ZXN0LnJlY3Vyc2l2ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjYXRzQXBwbGllZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTZW5kIGNoYW5nZXMgYmFja1xuICAgICAgICAgICAgICAgICAgICAgICAgRXh0ZW5zaW9uSGVscGVyLnNlbmRDYXRlZ29yaWVzUnVudGltZVVwZGF0ZU1lc3NhZ2UoY2F0c0FwcGxpZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5rbm93biBjb21tYW5kIHRvIHByb2Nlc3MgbWVzc2FnZSBmcm9tIGV4dGVuc2lvbiwgY29tbWFuZCB3YXM6IFwiICsgZGF0YS50eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLyogdHNsaW50OmVuYWJsZTpuby1jb25zb2xlICovXG4gICAgfTtcbiAgICBFeHRlbnNpb25IZWxwZXIuc2VuZENhdGVnb3J5TG9nTWVzc2FnZSA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgaWYgKCFFeHRlbnNpb25IZWxwZXIucmVnaXN0ZXJlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjYXRlZ29yeUlkcyA9IG1zZy5jYXRlZ29yaWVzLm1hcChmdW5jdGlvbiAoY2F0KSB7XG4gICAgICAgICAgICByZXR1cm4gY2F0LmlkO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGNvbnRlbnQgPSB7XG4gICAgICAgICAgICB0eXBlOiBcImxvZy1tZXNzYWdlXCIsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICAgIGNhdGVnb3JpZXM6IGNhdGVnb3J5SWRzLFxuICAgICAgICAgICAgICAgIGVycm9yQXNTdGFjazogbXNnLmVycm9yQXNTdGFjayxcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRNZXNzYWdlOiBNZXNzYWdlVXRpbHNfMS5NZXNzYWdlRm9ybWF0VXRpbHMucmVuZGVyRGVmYXVsdE1lc3NhZ2UobXNnLCBmYWxzZSksXG4gICAgICAgICAgICAgICAgbG9nTGV2ZWw6IExvZ2dlck9wdGlvbnNfMS5Mb2dMZXZlbFttc2cubGV2ZWxdLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogbXNnLm1lc3NhZ2VBc1N0cmluZyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZEVycm9yTWVzc2FnZTogbXNnLmlzUmVzb2x2ZWRFcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSB7XG4gICAgICAgICAgICBkYXRhOiBjb250ZW50LFxuICAgICAgICAgICAgZnJvbTogXCJ0c2wtbG9nZ2luZ1wiLFxuICAgICAgICB9O1xuICAgICAgICBFeHRlbnNpb25IZWxwZXIuc2VuZE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgfTtcbiAgICBFeHRlbnNpb25IZWxwZXIuc2VuZENhdGVnb3JpZXNSdW50aW1lVXBkYXRlTWVzc2FnZSA9IGZ1bmN0aW9uIChjYXRlZ29yaWVzKSB7XG4gICAgICAgIGlmICghRXh0ZW5zaW9uSGVscGVyLnJlZ2lzdGVyZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc2VydmljZSA9IENhdGVnb3J5U2VydmljZV8xLkNhdGVnb3J5U2VydmljZUltcGwuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgdmFyIGNhdExldmVscyA9IHsgY2F0ZWdvcmllczogQXJyYXkoKSB9O1xuICAgICAgICBjYXRlZ29yaWVzLmZvckVhY2goZnVuY3Rpb24gKGNhdCkge1xuICAgICAgICAgICAgdmFyIGNhdFNldHRpbmdzID0gc2VydmljZS5nZXRDYXRlZ29yeVNldHRpbmdzKGNhdCk7XG4gICAgICAgICAgICBpZiAoY2F0U2V0dGluZ3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNhdExldmVscy5jYXRlZ29yaWVzLnB1c2goeyBpZDogY2F0LmlkLCBsb2dMZXZlbDogTG9nZ2VyT3B0aW9uc18xLkxvZ0xldmVsW2NhdFNldHRpbmdzLmxvZ0xldmVsXS50b1N0cmluZygpIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGNvbnRlbnQgPSB7XG4gICAgICAgICAgICB0eXBlOiBcImNhdGVnb3JpZXMtcnQtdXBkYXRlXCIsXG4gICAgICAgICAgICB2YWx1ZTogY2F0TGV2ZWxzLFxuICAgICAgICB9O1xuICAgICAgICB2YXIgbWVzc2FnZSA9IHtcbiAgICAgICAgICAgIGRhdGE6IGNvbnRlbnQsXG4gICAgICAgICAgICBmcm9tOiBcInRzbC1sb2dnaW5nXCJcbiAgICAgICAgfTtcbiAgICAgICAgRXh0ZW5zaW9uSGVscGVyLnNlbmRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH07XG4gICAgRXh0ZW5zaW9uSGVscGVyLnNlbmRSb290Q2F0ZWdvcmllc1RvRXh0ZW5zaW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIUV4dGVuc2lvbkhlbHBlci5yZWdpc3RlcmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNhdGVnb3JpZXMgPSBDYXRlZ29yeVNlcnZpY2VfMS5DYXRlZ29yeVNlcnZpY2VJbXBsLmdldEluc3RhbmNlKCkuZ2V0Um9vdENhdGVnb3JpZXMoKS5tYXAoZnVuY3Rpb24gKGNhdCkge1xuICAgICAgICAgICAgcmV0dXJuIEV4dGVuc2lvbkhlbHBlci5nZXRDYXRlZ29yeUFzSlNPTihjYXQpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGNvbnRlbnQgPSB7XG4gICAgICAgICAgICB0eXBlOiBcInJvb3QtY2F0ZWdvcmllcy10cmVlXCIsXG4gICAgICAgICAgICB2YWx1ZTogY2F0ZWdvcmllc1xuICAgICAgICB9O1xuICAgICAgICB2YXIgbWVzc2FnZSA9IHtcbiAgICAgICAgICAgIGRhdGE6IGNvbnRlbnQsXG4gICAgICAgICAgICBmcm9tOiBcInRzbC1sb2dnaW5nXCJcbiAgICAgICAgfTtcbiAgICAgICAgRXh0ZW5zaW9uSGVscGVyLnNlbmRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogSWYgZXh0ZW5zaW9uIGludGVncmF0aW9uIGlzIGVuYWJsZWQsIHdpbGwgc2VuZCB0aGUgcm9vdCBjYXRlZ29yaWVzIG92ZXIgdG8gdGhlIGV4dGVuc2lvbi5cbiAgICAgKiBPdGhlcndpc2UgZG9lcyBub3RoaW5nLlxuICAgICAqL1xuICAgIEV4dGVuc2lvbkhlbHBlci5nZXRDYXRlZ29yeUFzSlNPTiA9IGZ1bmN0aW9uIChjYXQpIHtcbiAgICAgICAgdmFyIGNoaWxkQ2F0ZWdvcmllcyA9IGNhdC5jaGlsZHJlbi5tYXAoZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gRXh0ZW5zaW9uSGVscGVyLmdldENhdGVnb3J5QXNKU09OKGNoaWxkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjaGlsZHJlbjogY2hpbGRDYXRlZ29yaWVzLFxuICAgICAgICAgICAgaWQ6IGNhdC5pZCxcbiAgICAgICAgICAgIGxvZ0xldmVsOiBMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWxbY2F0LmxvZ0xldmVsXS50b1N0cmluZygpLFxuICAgICAgICAgICAgbmFtZTogY2F0Lm5hbWUsXG4gICAgICAgICAgICBwYXJlbnRJZDogKGNhdC5wYXJlbnQgIT0gbnVsbCA/IGNhdC5wYXJlbnQuaWQgOiBudWxsKSxcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIEV4dGVuc2lvbkhlbHBlci5hcHBseUxvZ0xldmVsID0gZnVuY3Rpb24gKGNhdGVnb3J5SWQsIGxvZ0xldmVsLCByZWN1cnNpdmUpIHtcbiAgICAgICAgdmFyIGNhdHMgPSBbXTtcbiAgICAgICAgdmFyIGNhdGVnb3J5ID0gQ2F0ZWdvcnlTZXJ2aWNlXzEuQ2F0ZWdvcnlTZXJ2aWNlSW1wbC5nZXRJbnN0YW5jZSgpLmdldENhdGVnb3J5QnlJZChjYXRlZ29yeUlkKTtcbiAgICAgICAgaWYgKGNhdGVnb3J5ICE9IG51bGwpIHtcbiAgICAgICAgICAgIEV4dGVuc2lvbkhlbHBlci5fYXBwbHlMb2dMZXZlbFJlY3Vyc2l2ZShjYXRlZ29yeSwgTG9nZ2VyT3B0aW9uc18xLkxvZ0xldmVsLmZyb21TdHJpbmcobG9nTGV2ZWwpLCByZWN1cnNpdmUsIGNhdHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLyogdHNsaW50OmRpc2FibGU6bm8tY29uc29sZSAqL1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDb3VsZCBub3QgY2hhbmdlIGxvZyBsZXZlbCwgZmFpbGVkIHRvIGZpbmQgY2F0ZWdvcnkgd2l0aCBpZDogXCIgKyBjYXRlZ29yeUlkKTtcbiAgICAgICAgICAgIC8qIHRzbGludDplbmFibGU6bm8tY29uc29sZSAqL1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYXRzO1xuICAgIH07XG4gICAgRXh0ZW5zaW9uSGVscGVyLl9hcHBseUxvZ0xldmVsUmVjdXJzaXZlID0gZnVuY3Rpb24gKGNhdGVnb3J5LCBsb2dMZXZlbCwgcmVjdXJzaXZlLCBjYXRzKSB7XG4gICAgICAgIHZhciBjYXRlZ29yeVNldHRpbmdzID0gQ2F0ZWdvcnlTZXJ2aWNlXzEuQ2F0ZWdvcnlTZXJ2aWNlSW1wbC5nZXRJbnN0YW5jZSgpLmdldENhdGVnb3J5U2V0dGluZ3MoY2F0ZWdvcnkpO1xuICAgICAgICBpZiAoY2F0ZWdvcnlTZXR0aW5ncyAhPSBudWxsKSB7XG4gICAgICAgICAgICBjYXRlZ29yeVNldHRpbmdzLmxvZ0xldmVsID0gbG9nTGV2ZWw7XG4gICAgICAgICAgICBjYXRzLnB1c2goY2F0ZWdvcnkpO1xuICAgICAgICAgICAgaWYgKHJlY3Vyc2l2ZSkge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5LmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIEV4dGVuc2lvbkhlbHBlci5fYXBwbHlMb2dMZXZlbFJlY3Vyc2l2ZShjaGlsZCwgbG9nTGV2ZWwsIHJlY3Vyc2l2ZSwgY2F0cyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIEV4dGVuc2lvbkhlbHBlci5nZXRBbGxDYXRlZ29yaWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY2F0cyA9IFtdO1xuICAgICAgICB2YXIgYWRkQ2F0cyA9IGZ1bmN0aW9uIChjYXQsIGFsbENhdHMpIHtcbiAgICAgICAgICAgIGFsbENhdHMucHVzaChjYXQpO1xuICAgICAgICAgICAgY2F0LmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGNhdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgYWRkQ2F0cyhjYXRDaGlsZCwgYWxsQ2F0cyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgQ2F0ZWdvcnlTZXJ2aWNlXzEuQ2F0ZWdvcnlTZXJ2aWNlSW1wbC5nZXRJbnN0YW5jZSgpLmdldFJvb3RDYXRlZ29yaWVzKCkuZm9yRWFjaChmdW5jdGlvbiAoY2F0KSB7XG4gICAgICAgICAgICBhZGRDYXRzKGNhdCwgY2F0cyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY2F0cztcbiAgICB9O1xuICAgIEV4dGVuc2lvbkhlbHBlci5zZW5kTWVzc2FnZSA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgaWYgKCFFeHRlbnNpb25IZWxwZXIucmVnaXN0ZXJlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB3aW5kb3cucG9zdE1lc3NhZ2UgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZShtc2csIFwiKlwiKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogIEV4dGVuc2lvbiBmcmFtZXdvcmsgd2lsbCBjYWxsIHRoaXMgdG8gZW5hYmxlIHRoZSBpbnRlZ3JhdGlvbiBiZXR3ZWVuIHR3byxcbiAgICAgKiAgYWZ0ZXIgdGhpcyBjYWxsIHRoZSBmcmFtZXdvcmsgd2lsbCByZXNwb25kIHdpdGggcG9zdE1lc3NhZ2UoKSBtZXNzYWdlcy5cbiAgICAgKi9cbiAgICBFeHRlbnNpb25IZWxwZXIuZW5hYmxlRXh0ZW5zaW9uSW50ZWdyYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghRXh0ZW5zaW9uSGVscGVyLnJlZ2lzdGVyZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaW5zdGFuY2UgPSBDYXRlZ29yeVNlcnZpY2VfMS5DYXRlZ29yeVNlcnZpY2VJbXBsLmdldEluc3RhbmNlKCk7XG4gICAgICAgIGluc3RhbmNlLmVuYWJsZUV4dGVuc2lvbkludGVncmF0aW9uKCk7XG4gICAgICAgIC8vIFNlbmQgb3ZlciBhbGwgY2F0ZWdvcmllc1xuICAgICAgICBFeHRlbnNpb25IZWxwZXIuc2VuZFJvb3RDYXRlZ29yaWVzVG9FeHRlbnNpb24oKTtcbiAgICAgICAgLy8gU2VuZCBvdmVyIHRoZSBjdXJyZW50IHJ1bnRpbWUgbGV2ZWxzXG4gICAgICAgIHZhciBjYXRzID0gRXh0ZW5zaW9uSGVscGVyLmdldEFsbENhdGVnb3JpZXMoKTtcbiAgICAgICAgRXh0ZW5zaW9uSGVscGVyLnNlbmRDYXRlZ29yaWVzUnVudGltZVVwZGF0ZU1lc3NhZ2UoY2F0cyk7XG4gICAgfTtcbiAgICBFeHRlbnNpb25IZWxwZXIucmVnaXN0ZXJlZCA9IGZhbHNlO1xuICAgIHJldHVybiBFeHRlbnNpb25IZWxwZXI7XG59KCkpO1xuZXhwb3J0cy5FeHRlbnNpb25IZWxwZXIgPSBFeHRlbnNpb25IZWxwZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1FeHRlbnNpb25IZWxwZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1FeHRlbnNpb25NZXNzYWdlSlNPTi5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU1lc3NhZ2VzRnJvbUV4dGVuc2lvbkpTT04uanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1NZXNzYWdlc1RvRXh0ZW5zaW9uSlNPTi5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2F0ZWdvcnlMb2dGb3JtYXQgPSBleHBvcnRzLkxvZ0Zvcm1hdCA9IGV4cG9ydHMuRGF0ZUZvcm1hdCA9IGV4cG9ydHMuRGF0ZUZvcm1hdEVudW0gPSBleHBvcnRzLkxvZ2dlclR5cGUgPSBleHBvcnRzLkxvZ0xldmVsID0gdm9pZCAwO1xuLyoqXG4gKiBMb2cgbGV2ZWwgZm9yIGEgbG9nZ2VyLlxuICovXG52YXIgTG9nTGV2ZWw7XG4oZnVuY3Rpb24gKExvZ0xldmVsKSB7XG4gICAgTG9nTGV2ZWxbTG9nTGV2ZWxbXCJUcmFjZVwiXSA9IDBdID0gXCJUcmFjZVwiO1xuICAgIExvZ0xldmVsW0xvZ0xldmVsW1wiRGVidWdcIl0gPSAxXSA9IFwiRGVidWdcIjtcbiAgICBMb2dMZXZlbFtMb2dMZXZlbFtcIkluZm9cIl0gPSAyXSA9IFwiSW5mb1wiO1xuICAgIExvZ0xldmVsW0xvZ0xldmVsW1wiV2FyblwiXSA9IDNdID0gXCJXYXJuXCI7XG4gICAgTG9nTGV2ZWxbTG9nTGV2ZWxbXCJFcnJvclwiXSA9IDRdID0gXCJFcnJvclwiO1xuICAgIExvZ0xldmVsW0xvZ0xldmVsW1wiRmF0YWxcIl0gPSA1XSA9IFwiRmF0YWxcIjtcbn0pKExvZ0xldmVsID0gZXhwb3J0cy5Mb2dMZXZlbCB8fCAoZXhwb3J0cy5Mb2dMZXZlbCA9IHt9KSk7XG4vKiB0c2xpbnQ6ZGlzYWJsZTpuby1uYW1lc3BhY2UgKi9cbihmdW5jdGlvbiAoTG9nTGV2ZWwpIHtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIExvZ0xldmVsIGJhc2VkIG9uIHN0cmluZyByZXByZXNlbnRhdGlvblxuICAgICAqIEBwYXJhbSB2YWwgVmFsdWVcbiAgICAgKiBAcmV0dXJucyB7TG9nTGV2ZWx9LCBFcnJvciBpcyB0aHJvd24gaWYgaW52YWxpZC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmcm9tU3RyaW5nKHZhbCkge1xuICAgICAgICBpZiAodmFsID09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFyZ3VtZW50IG11c3QgYmUgc2V0XCIpO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAodmFsLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgIGNhc2UgXCJ0cmFjZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBMb2dMZXZlbC5UcmFjZTtcbiAgICAgICAgICAgIGNhc2UgXCJkZWJ1Z1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiBMb2dMZXZlbC5EZWJ1ZztcbiAgICAgICAgICAgIGNhc2UgXCJpbmZvXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIExvZ0xldmVsLkluZm87XG4gICAgICAgICAgICBjYXNlIFwid2FyblwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBMb2dMZXZlbC5XYXJuO1xuICAgICAgICAgICAgY2FzZSBcImVycm9yXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIExvZ0xldmVsLkVycm9yO1xuICAgICAgICAgICAgY2FzZSBcImZhdGFsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIExvZ0xldmVsLkZhdGFsO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZCB2YWx1ZSBmb3IgY29udmVyc2lvbjogXCIgKyB2YWwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIExvZ0xldmVsLmZyb21TdHJpbmcgPSBmcm9tU3RyaW5nO1xufSkoTG9nTGV2ZWwgPSBleHBvcnRzLkxvZ0xldmVsIHx8IChleHBvcnRzLkxvZ0xldmVsID0ge30pKTtcbi8qIHRzbGludDpkaXNhYmxlOmVuYWJsZS1uYW1lc3BhY2UgKi9cbi8qKlxuICogV2hlcmUgdG8gbG9nIHRvPyBQaWNrIG9uZSBvZiB0aGUgY29uc3RhbnRzLiBDdXN0b20gcmVxdWlyZXMgYSBjYWxsYmFjayB0byBiZSBwcmVzZW50LCBzZWUgTEZTZXJ2aWNlLmNyZWF0ZUxvZ2dlckZhY3RvcnkoLi4uKVxuICogd2hlcmUgdGhpcyBjb21lcyBpbnRvIHBsYXkuXG4gKi9cbnZhciBMb2dnZXJUeXBlO1xuKGZ1bmN0aW9uIChMb2dnZXJUeXBlKSB7XG4gICAgTG9nZ2VyVHlwZVtMb2dnZXJUeXBlW1wiQ29uc29sZVwiXSA9IDBdID0gXCJDb25zb2xlXCI7XG4gICAgTG9nZ2VyVHlwZVtMb2dnZXJUeXBlW1wiTWVzc2FnZUJ1ZmZlclwiXSA9IDFdID0gXCJNZXNzYWdlQnVmZmVyXCI7XG4gICAgTG9nZ2VyVHlwZVtMb2dnZXJUeXBlW1wiQ3VzdG9tXCJdID0gMl0gPSBcIkN1c3RvbVwiO1xufSkoTG9nZ2VyVHlwZSA9IGV4cG9ydHMuTG9nZ2VyVHlwZSB8fCAoZXhwb3J0cy5Mb2dnZXJUeXBlID0ge30pKTtcbi8qKlxuICogRGVmaW5lcyBzZXZlcmFsIGRhdGUgZW51bXMgdXNlZCBmb3IgZm9ybWF0dGluZyBhIGRhdGUuXG4gKi9cbnZhciBEYXRlRm9ybWF0RW51bTtcbihmdW5jdGlvbiAoRGF0ZUZvcm1hdEVudW0pIHtcbiAgICAvKipcbiAgICAgKiBEaXNwbGF5cyBhczogeWVhci1tb250aC1kYXkgaG91cjptaW51dGU6c2Vjb25kLG1pbGxpcyAtPiAxOTk5LTAyLTEyIDIzOjU5OjU5LDEyM1xuICAgICAqIE5vdGUgdGhlIGRhdGUgc2VwYXJhdG9yIGNhbiBiZSBzZXQgc2VwYXJhdGVseS5cbiAgICAgKi9cbiAgICBEYXRlRm9ybWF0RW51bVtEYXRlRm9ybWF0RW51bVtcIkRlZmF1bHRcIl0gPSAwXSA9IFwiRGVmYXVsdFwiO1xuICAgIC8qKlxuICAgICAqIERpc3BsYXlzIGFzOiB5ZWFyLW1vbnRoLWRheSBob3VyOm1pbnV0ZTpzZWNvbmQgLT4gMTk5OS0wMi0xMiAyMzo1OTo1OVxuICAgICAqIE5vdGUgdGhlIGRhdGUgc2VwYXJhdG9yIGNhbiBiZSBzZXQgc2VwYXJhdGVseS5cbiAgICAgKi9cbiAgICBEYXRlRm9ybWF0RW51bVtEYXRlRm9ybWF0RW51bVtcIlllYXJNb250aERheVRpbWVcIl0gPSAxXSA9IFwiWWVhck1vbnRoRGF5VGltZVwiO1xuICAgIC8qKlxuICAgICAqIERpc3BsYXlzIGFzOiB5ZWFyLWRheS1tb250aCBob3VyOm1pbnV0ZTpzZWNvbmQsbWlsbGlzIC0+IDE5OTktMTItMDIgMjM6NTk6NTksMTIzXG4gICAgICogTm90ZSB0aGUgZGF0ZSBzZXBhcmF0b3IgY2FuIGJlIHNldCBzZXBhcmF0ZWx5LlxuICAgICAqL1xuICAgIERhdGVGb3JtYXRFbnVtW0RhdGVGb3JtYXRFbnVtW1wiWWVhckRheU1vbnRoV2l0aEZ1bGxUaW1lXCJdID0gMl0gPSBcIlllYXJEYXlNb250aFdpdGhGdWxsVGltZVwiO1xuICAgIC8qKlxuICAgICAqIERpc3BsYXlzIGFzOiB5ZWFyLWRheS1tb250aCBob3VyOm1pbnV0ZTpzZWNvbmQgLT4gMTk5OS0xMi0wMiAyMzo1OTo1OVxuICAgICAqIE5vdGUgdGhlIGRhdGUgc2VwYXJhdG9yIGNhbiBiZSBzZXQgc2VwYXJhdGVseS5cbiAgICAgKi9cbiAgICBEYXRlRm9ybWF0RW51bVtEYXRlRm9ybWF0RW51bVtcIlllYXJEYXlNb250aFRpbWVcIl0gPSAzXSA9IFwiWWVhckRheU1vbnRoVGltZVwiO1xufSkoRGF0ZUZvcm1hdEVudW0gPSBleHBvcnRzLkRhdGVGb3JtYXRFbnVtIHx8IChleHBvcnRzLkRhdGVGb3JtYXRFbnVtID0ge30pKTtcbi8qIHRzbGludDpkaXNhYmxlOm5vLW5hbWVzcGFjZSAqL1xuKGZ1bmN0aW9uIChEYXRlRm9ybWF0RW51bSkge1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgTG9nTGV2ZWwgYmFzZWQgb24gc3RyaW5nIHJlcHJlc2VudGF0aW9uXG4gICAgICogQHBhcmFtIHZhbCBWYWx1ZVxuICAgICAqIEByZXR1cm5zIHtMb2dMZXZlbH0sIEVycm9yIGlzIHRocm93biBpZiBpbnZhbGlkLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZyb21TdHJpbmcodmFsKSB7XG4gICAgICAgIGlmICh2YWwgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXJndW1lbnQgbXVzdCBiZSBzZXRcIik7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoICh2YWwudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgY2FzZSBcImRlZmF1bHRcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gRGF0ZUZvcm1hdEVudW0uRGVmYXVsdDtcbiAgICAgICAgICAgIGNhc2UgXCJ5ZWFybW9udGhkYXlUaW1lXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIERhdGVGb3JtYXRFbnVtLlllYXJNb250aERheVRpbWU7XG4gICAgICAgICAgICBjYXNlIFwieWVhcmRheW1vbnRod2l0aGZ1bGx0aW1lXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIERhdGVGb3JtYXRFbnVtLlllYXJEYXlNb250aFdpdGhGdWxsVGltZTtcbiAgICAgICAgICAgIGNhc2UgXCJ5ZWFyZGF5bW9udGh0aW1lXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIERhdGVGb3JtYXRFbnVtLlllYXJEYXlNb250aFRpbWU7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuc3VwcG9ydGVkIHZhbHVlIGZvciBjb252ZXJzaW9uOiBcIiArIHZhbCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgRGF0ZUZvcm1hdEVudW0uZnJvbVN0cmluZyA9IGZyb21TdHJpbmc7XG59KShEYXRlRm9ybWF0RW51bSA9IGV4cG9ydHMuRGF0ZUZvcm1hdEVudW0gfHwgKGV4cG9ydHMuRGF0ZUZvcm1hdEVudW0gPSB7fSkpO1xuLyogdHNsaW50OmRpc2FibGU6ZW5hYmxlLW5hbWVzcGFjZSAqL1xuLyoqXG4gKiBEYXRlRm9ybWF0IGNsYXNzLCBzdG9yZXMgZGF0YSBvbiBob3cgdG8gZm9ybWF0IGEgZGF0ZS5cbiAqL1xudmFyIERhdGVGb3JtYXQgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgdG8gZGVmaW5lIHRoZSBkYXRlZm9ybWF0IHVzZWQgZm9yIGxvZ2dpbmcsIGNhbiBiZSBjYWxsZWQgZW1wdHkgYXMgaXQgdXNlcyBkZWZhdWx0cy5cbiAgICAgKiBAcGFyYW0gZm9ybWF0RW51bSBEYXRlRm9ybWF0RW51bSwgdXNlIG9uZSBvZiB0aGUgY29uc3RhbnRzIGZyb20gdGhlIGVudW0uIERlZmF1bHRzIHRvIERhdGVGb3JtYXRFbnVtLkRlZmF1bHRcbiAgICAgKiBAcGFyYW0gZGF0ZVNlcGFyYXRvciBTZXBhcmF0b3IgdXNlZCBiZXR3ZWVuIGRhdGVzLCBkZWZhdWx0cyB0byAtXG4gICAgICovXG4gICAgZnVuY3Rpb24gRGF0ZUZvcm1hdChmb3JtYXRFbnVtLCBkYXRlU2VwYXJhdG9yKSB7XG4gICAgICAgIGlmIChmb3JtYXRFbnVtID09PSB2b2lkIDApIHsgZm9ybWF0RW51bSA9IERhdGVGb3JtYXRFbnVtLkRlZmF1bHQ7IH1cbiAgICAgICAgaWYgKGRhdGVTZXBhcmF0b3IgPT09IHZvaWQgMCkgeyBkYXRlU2VwYXJhdG9yID0gXCItXCI7IH1cbiAgICAgICAgdGhpcy5fZm9ybWF0RW51bSA9IGZvcm1hdEVudW07XG4gICAgICAgIHRoaXMuX2RhdGVTZXBhcmF0b3IgPSBkYXRlU2VwYXJhdG9yO1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0ZUZvcm1hdC5wcm90b3R5cGUsIFwiZm9ybWF0RW51bVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Zvcm1hdEVudW07XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9mb3JtYXRFbnVtID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGF0ZUZvcm1hdC5wcm90b3R5cGUsIFwiZGF0ZVNlcGFyYXRvclwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGVTZXBhcmF0b3I7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRlU2VwYXJhdG9yID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBEYXRlRm9ybWF0LnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGVGb3JtYXQodGhpcy5fZm9ybWF0RW51bSwgdGhpcy5fZGF0ZVNlcGFyYXRvcik7XG4gICAgfTtcbiAgICByZXR1cm4gRGF0ZUZvcm1hdDtcbn0oKSk7XG5leHBvcnRzLkRhdGVGb3JtYXQgPSBEYXRlRm9ybWF0O1xuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCB0aGUgbG9nIGZvcm1hdCwgd2hhdCB3aWxsIGEgbG9nIGxpbmUgbG9vayBsaWtlP1xuICovXG52YXIgTG9nRm9ybWF0ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIHRvIGNyZWF0ZSBhIExvZ0Zvcm1hdC4gQ2FuIGJlIGNyZWF0ZWQgd2l0aG91dCBwYXJhbWV0ZXJzIHdoZXJlIGl0IHdpbGwgdXNlIHNhbmUgZGVmYXVsdHMuXG4gICAgICogQHBhcmFtIGRhdGVGb3JtYXQgRGF0ZUZvcm1hdCAod2hhdCBuZWVkcyB0aGUgZGF0ZSBsb29rIGxpa2UgaW4gdGhlIGxvZyBsaW5lKVxuICAgICAqIEBwYXJhbSBzaG93VGltZVN0YW1wIFNob3cgZGF0ZSB0aW1lc3RhbXAgYXQgYWxsP1xuICAgICAqIEBwYXJhbSBzaG93TG9nZ2VyTmFtZSBTaG93IHRoZSBsb2dnZXIgbmFtZT9cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBMb2dGb3JtYXQoZGF0ZUZvcm1hdCwgc2hvd1RpbWVTdGFtcCwgc2hvd0xvZ2dlck5hbWUpIHtcbiAgICAgICAgaWYgKGRhdGVGb3JtYXQgPT09IHZvaWQgMCkgeyBkYXRlRm9ybWF0ID0gbmV3IERhdGVGb3JtYXQoKTsgfVxuICAgICAgICBpZiAoc2hvd1RpbWVTdGFtcCA9PT0gdm9pZCAwKSB7IHNob3dUaW1lU3RhbXAgPSB0cnVlOyB9XG4gICAgICAgIGlmIChzaG93TG9nZ2VyTmFtZSA9PT0gdm9pZCAwKSB7IHNob3dMb2dnZXJOYW1lID0gdHJ1ZTsgfVxuICAgICAgICB0aGlzLl9zaG93VGltZVN0YW1wID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fc2hvd0xvZ2dlck5hbWUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9kYXRlRm9ybWF0ID0gZGF0ZUZvcm1hdDtcbiAgICAgICAgdGhpcy5fc2hvd1RpbWVTdGFtcCA9IHNob3dUaW1lU3RhbXA7XG4gICAgICAgIHRoaXMuX3Nob3dMb2dnZXJOYW1lID0gc2hvd0xvZ2dlck5hbWU7XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShMb2dGb3JtYXQucHJvdG90eXBlLCBcImRhdGVGb3JtYXRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kYXRlRm9ybWF0O1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KExvZ0Zvcm1hdC5wcm90b3R5cGUsIFwic2hvd1RpbWVTdGFtcFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Nob3dUaW1lU3RhbXA7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93VGltZVN0YW1wID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTG9nRm9ybWF0LnByb3RvdHlwZSwgXCJzaG93TG9nZ2VyTmFtZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Nob3dMb2dnZXJOYW1lO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fc2hvd0xvZ2dlck5hbWUgPSB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIHJldHVybiBMb2dGb3JtYXQ7XG59KCkpO1xuZXhwb3J0cy5Mb2dGb3JtYXQgPSBMb2dGb3JtYXQ7XG4vKipcbiAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSBsb2cgZm9ybWF0LCB3aGF0IHdpbGwgYSBsb2cgbGluZSBsb29rIGxpa2U/XG4gKi9cbnZhciBDYXRlZ29yeUxvZ0Zvcm1hdCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYW4gaW5zdGFuY2UgZGVmaW5pbmcgdGhlIGNhdGVnb3J5IGxvZyBmb3JtYXQgdXNlZC5cbiAgICAgKiBAcGFyYW0gZGF0ZUZvcm1hdCBEYXRlIGZvcm1hdCAodXNlcyBkZWZhdWx0KSwgZm9yIGRldGFpbHMgc2VlIERhdGVGb3JtYXQgY2xhc3MuXG4gICAgICogQHBhcmFtIHNob3dUaW1lU3RhbXAgVHJ1ZSB0byBzaG93IHRpbWVzdGFtcCBpbiB0aGUgbG9nZ2luZywgZGVmYXVsdHMgdG8gdHJ1ZS5cbiAgICAgKiBAcGFyYW0gc2hvd0NhdGVnb3J5TmFtZSBUcnVlIHRvIHNob3cgY2F0ZWdvcnkgbmFtZSBpbiB0aGUgbG9nZ2luZywgZGVmYXVsdHMgdG8gdHJ1ZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBDYXRlZ29yeUxvZ0Zvcm1hdChkYXRlRm9ybWF0LCBzaG93VGltZVN0YW1wLCBzaG93Q2F0ZWdvcnlOYW1lKSB7XG4gICAgICAgIGlmIChkYXRlRm9ybWF0ID09PSB2b2lkIDApIHsgZGF0ZUZvcm1hdCA9IG5ldyBEYXRlRm9ybWF0KCk7IH1cbiAgICAgICAgaWYgKHNob3dUaW1lU3RhbXAgPT09IHZvaWQgMCkgeyBzaG93VGltZVN0YW1wID0gdHJ1ZTsgfVxuICAgICAgICBpZiAoc2hvd0NhdGVnb3J5TmFtZSA9PT0gdm9pZCAwKSB7IHNob3dDYXRlZ29yeU5hbWUgPSB0cnVlOyB9XG4gICAgICAgIHRoaXMuX2RhdGVGb3JtYXQgPSBkYXRlRm9ybWF0O1xuICAgICAgICB0aGlzLl9zaG93VGltZVN0YW1wID0gc2hvd1RpbWVTdGFtcDtcbiAgICAgICAgdGhpcy5fc2hvd0NhdGVnb3J5TmFtZSA9IHNob3dDYXRlZ29yeU5hbWU7XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYXRlZ29yeUxvZ0Zvcm1hdC5wcm90b3R5cGUsIFwiZGF0ZUZvcm1hdFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGVGb3JtYXQ7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRlRm9ybWF0ID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ2F0ZWdvcnlMb2dGb3JtYXQucHJvdG90eXBlLCBcInNob3dUaW1lU3RhbXBcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zaG93VGltZVN0YW1wO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fc2hvd1RpbWVTdGFtcCA9IHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENhdGVnb3J5TG9nRm9ybWF0LnByb3RvdHlwZSwgXCJzaG93Q2F0ZWdvcnlOYW1lXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2hvd0NhdGVnb3J5TmFtZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dDYXRlZ29yeU5hbWUgPSB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIENhdGVnb3J5TG9nRm9ybWF0LnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IENhdGVnb3J5TG9nRm9ybWF0KHRoaXMuX2RhdGVGb3JtYXQuY29weSgpLCB0aGlzLl9zaG93VGltZVN0YW1wLCB0aGlzLl9zaG93Q2F0ZWdvcnlOYW1lKTtcbiAgICB9O1xuICAgIHJldHVybiBDYXRlZ29yeUxvZ0Zvcm1hdDtcbn0oKSk7XG5leHBvcnRzLkNhdGVnb3J5TG9nRm9ybWF0ID0gQ2F0ZWdvcnlMb2dGb3JtYXQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Mb2dnZXJPcHRpb25zLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fc3ByZWFkQXJyYXkgPSAodGhpcyAmJiB0aGlzLl9fc3ByZWFkQXJyYXkpIHx8IGZ1bmN0aW9uICh0bywgZnJvbSwgcGFjaykge1xuICAgIGlmIChwYWNrIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIGZvciAodmFyIGkgPSAwLCBsID0gZnJvbS5sZW5ndGgsIGFyOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChhciB8fCAhKGkgaW4gZnJvbSkpIHtcbiAgICAgICAgICAgIGlmICghYXIpIGFyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSwgMCwgaSk7XG4gICAgICAgICAgICBhcltpXSA9IGZyb21baV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRvLmNvbmNhdChhciB8fCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tKSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5BYnN0cmFjdENhdGVnb3J5TG9nZ2VyID0gdm9pZCAwO1xudmFyIERhdGFTdHJ1Y3R1cmVzXzEgPSByZXF1aXJlKFwiLi4vLi4vdXRpbHMvRGF0YVN0cnVjdHVyZXNcIik7XG52YXIgTWVzc2FnZVV0aWxzXzEgPSByZXF1aXJlKFwiLi4vLi4vdXRpbHMvTWVzc2FnZVV0aWxzXCIpO1xudmFyIExvZ2dlck9wdGlvbnNfMSA9IHJlcXVpcmUoXCIuLi9Mb2dnZXJPcHRpb25zXCIpO1xudmFyIENhdGVnb3J5TG9nTWVzc2FnZUltcGwgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2F0ZWdvcnlMb2dNZXNzYWdlSW1wbChtZXNzYWdlLCBlcnJvciwgY2F0ZWdvcmllcywgZGF0ZSwgbGV2ZWwsIGxvZ0Zvcm1hdCwgcmVhZHkpIHtcbiAgICAgICAgdGhpcy5fcmVzb2x2ZWRFcnJvck1lc3NhZ2UgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZXJyb3JBc1N0YWNrID0gbnVsbDtcbiAgICAgICAgdGhpcy5fbWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgIHRoaXMuX2Vycm9yID0gZXJyb3I7XG4gICAgICAgIHRoaXMuX2NhdGVnb3JpZXMgPSBjYXRlZ29yaWVzO1xuICAgICAgICB0aGlzLl9kYXRlID0gZGF0ZTtcbiAgICAgICAgdGhpcy5fbGV2ZWwgPSBsZXZlbDtcbiAgICAgICAgdGhpcy5fbG9nRm9ybWF0ID0gbG9nRm9ybWF0O1xuICAgICAgICB0aGlzLl9yZWFkeSA9IHJlYWR5O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ2F0ZWdvcnlMb2dNZXNzYWdlSW1wbC5wcm90b3R5cGUsIFwibWVzc2FnZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2U7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ2F0ZWdvcnlMb2dNZXNzYWdlSW1wbC5wcm90b3R5cGUsIFwiZXJyb3JcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9lcnJvcjtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYXRlZ29yeUxvZ01lc3NhZ2VJbXBsLnByb3RvdHlwZSwgXCJjYXRlZ29yaWVzXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2F0ZWdvcmllcztcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYXRlZ29yeUxvZ01lc3NhZ2VJbXBsLnByb3RvdHlwZSwgXCJkYXRlXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYXRlZ29yeUxvZ01lc3NhZ2VJbXBsLnByb3RvdHlwZSwgXCJsZXZlbFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xldmVsO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENhdGVnb3J5TG9nTWVzc2FnZUltcGwucHJvdG90eXBlLCBcImxvZ0Zvcm1hdFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xvZ0Zvcm1hdDtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYXRlZ29yeUxvZ01lc3NhZ2VJbXBsLnByb3RvdHlwZSwgXCJpc01lc3NhZ2VMb2dEYXRhXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mICh0aGlzLl9tZXNzYWdlKSAhPT0gXCJzdHJpbmdcIjtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYXRlZ29yeUxvZ01lc3NhZ2VJbXBsLnByb3RvdHlwZSwgXCJtZXNzYWdlQXNTdHJpbmdcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgKHRoaXMuX21lc3NhZ2UpID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWVzc2FnZS5tc2c7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ2F0ZWdvcnlMb2dNZXNzYWdlSW1wbC5wcm90b3R5cGUsIFwibG9nRGF0YVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG51bGw7XG4gICAgICAgICAgICBpZiAodHlwZW9mICh0aGlzLl9tZXNzYWdlKSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMubWVzc2FnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ2F0ZWdvcnlMb2dNZXNzYWdlSW1wbC5wcm90b3R5cGUsIFwiaXNSZXNvbHZlZEVycm9yTWVzc2FnZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Jlc29sdmVkRXJyb3JNZXNzYWdlO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENhdGVnb3J5TG9nTWVzc2FnZUltcGwucHJvdG90eXBlLCBcImVycm9yQXNTdGFja1wiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Vycm9yQXNTdGFjaztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAoc3RhY2spIHtcbiAgICAgICAgICAgIHRoaXMuX2Vycm9yQXNTdGFjayA9IHN0YWNrO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgQ2F0ZWdvcnlMb2dNZXNzYWdlSW1wbC5wcm90b3R5cGUuaXNSZWFkeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlYWR5O1xuICAgIH07XG4gICAgQ2F0ZWdvcnlMb2dNZXNzYWdlSW1wbC5wcm90b3R5cGUuc2V0UmVhZHkgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fcmVhZHkgPSB2YWx1ZTtcbiAgICB9O1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYXRlZ29yeUxvZ01lc3NhZ2VJbXBsLnByb3RvdHlwZSwgXCJyZXNvbHZlZEVycm9yTWVzc2FnZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Jlc29sdmVkRXJyb3JNZXNzYWdlO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fcmVzb2x2ZWRFcnJvck1lc3NhZ2UgPSB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIHJldHVybiBDYXRlZ29yeUxvZ01lc3NhZ2VJbXBsO1xufSgpKTtcbi8qKlxuICogQWJzdHJhY3QgY2F0ZWdvcnkgbG9nZ2VyLCB1c2UgYXMgeW91ciBiYXNlIGNsYXNzIGZvciBuZXcgdHlwZSBvZiBsb2dnZXJzIChpdFxuICogc2F2ZXMgeW91IGEgbG90IG9mIHdvcmspIGFuZCBvdmVycmlkZSBkb0xvZyhDYXRlZ29yeUxvZ01lc3NhZ2UpLiBUaGUgbWVzc2FnZSBhcmd1bWVudFxuICogcHJvdmlkZXMgZnVsbCBhY2Nlc3MgdG8gYW55dGhpbmcgcmVsYXRlZCB0byB0aGUgbG9nZ2luZyBldmVudC5cbiAqIElmIHlvdSBqdXN0IHdhbnQgdGhlIHN0YW5kYXJkIGxpbmUgb2YgbG9nZ2luZywgY2FsbDogdGhpcy5jcmVhdGVEZWZhdWx0TG9nTWVzc2FnZShtc2cpIG9uXG4gKiB0aGlzIGNsYXNzIHdoaWNoIHdpbGwgcmV0dXJuIHlvdSB0aGUgZm9ybWF0dGVkIGxvZyBtZXNzYWdlIGFzIHN0cmluZyAoZS5nLiB0aGVcbiAqIGRlZmF1bHQgbG9nZ2VycyBhbGwgdXNlIHRoaXMpLlxuICovXG52YXIgQWJzdHJhY3RDYXRlZ29yeUxvZ2dlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBYnN0cmFjdENhdGVnb3J5TG9nZ2VyKHJvb3RDYXRlZ29yeSwgcnVudGltZVNldHRpbmdzKSB7XG4gICAgICAgIHRoaXMuYWxsTWVzc2FnZXMgPSBuZXcgRGF0YVN0cnVjdHVyZXNfMS5MaW5rZWRMaXN0KCk7XG4gICAgICAgIHRoaXMucm9vdENhdGVnb3J5ID0gcm9vdENhdGVnb3J5O1xuICAgICAgICB0aGlzLnJ1bnRpbWVTZXR0aW5ncyA9IHJ1bnRpbWVTZXR0aW5ncztcbiAgICB9XG4gICAgQWJzdHJhY3RDYXRlZ29yeUxvZ2dlci5wcm90b3R5cGUudHJhY2UgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgIHZhciBjYXRlZ29yaWVzID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMTsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xvZy5hcHBseSh0aGlzLCBfX3NwcmVhZEFycmF5KFtMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWwuVHJhY2UsIG1zZywgbnVsbCwgZmFsc2VdLCBjYXRlZ29yaWVzLCBmYWxzZSkpO1xuICAgIH07XG4gICAgQWJzdHJhY3RDYXRlZ29yeUxvZ2dlci5wcm90b3R5cGUuZGVidWcgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgIHZhciBjYXRlZ29yaWVzID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMTsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xvZy5hcHBseSh0aGlzLCBfX3NwcmVhZEFycmF5KFtMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWwuRGVidWcsIG1zZywgbnVsbCwgZmFsc2VdLCBjYXRlZ29yaWVzLCBmYWxzZSkpO1xuICAgIH07XG4gICAgQWJzdHJhY3RDYXRlZ29yeUxvZ2dlci5wcm90b3R5cGUuaW5mbyA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgdmFyIGNhdGVnb3JpZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAxOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXNbX2kgLSAxXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbG9nLmFwcGx5KHRoaXMsIF9fc3ByZWFkQXJyYXkoW0xvZ2dlck9wdGlvbnNfMS5Mb2dMZXZlbC5JbmZvLCBtc2csIG51bGwsIGZhbHNlXSwgY2F0ZWdvcmllcywgZmFsc2UpKTtcbiAgICB9O1xuICAgIEFic3RyYWN0Q2F0ZWdvcnlMb2dnZXIucHJvdG90eXBlLndhcm4gPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgIHZhciBjYXRlZ29yaWVzID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMTsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xvZy5hcHBseSh0aGlzLCBfX3NwcmVhZEFycmF5KFtMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWwuV2FybiwgbXNnLCBudWxsLCBmYWxzZV0sIGNhdGVnb3JpZXMsIGZhbHNlKSk7XG4gICAgfTtcbiAgICBBYnN0cmFjdENhdGVnb3J5TG9nZ2VyLnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uIChtc2csIGVycm9yKSB7XG4gICAgICAgIHZhciBjYXRlZ29yaWVzID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMjsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzW19pIC0gMl0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xvZy5hcHBseSh0aGlzLCBfX3NwcmVhZEFycmF5KFtMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWwuRXJyb3IsIG1zZywgZXJyb3IsIGZhbHNlXSwgY2F0ZWdvcmllcywgZmFsc2UpKTtcbiAgICB9O1xuICAgIEFic3RyYWN0Q2F0ZWdvcnlMb2dnZXIucHJvdG90eXBlLmZhdGFsID0gZnVuY3Rpb24gKG1zZywgZXJyb3IpIHtcbiAgICAgICAgdmFyIGNhdGVnb3JpZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAyOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXNbX2kgLSAyXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbG9nLmFwcGx5KHRoaXMsIF9fc3ByZWFkQXJyYXkoW0xvZ2dlck9wdGlvbnNfMS5Mb2dMZXZlbC5GYXRhbCwgbXNnLCBlcnJvciwgZmFsc2VdLCBjYXRlZ29yaWVzLCBmYWxzZSkpO1xuICAgIH07XG4gICAgQWJzdHJhY3RDYXRlZ29yeUxvZ2dlci5wcm90b3R5cGUucmVzb2x2ZWQgPSBmdW5jdGlvbiAobXNnLCBlcnJvcikge1xuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDI7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgY2F0ZWdvcmllc1tfaSAtIDJdID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9sb2cuYXBwbHkodGhpcywgX19zcHJlYWRBcnJheShbTG9nZ2VyT3B0aW9uc18xLkxvZ0xldmVsLkVycm9yLCBtc2csIGVycm9yLCB0cnVlXSwgY2F0ZWdvcmllcywgZmFsc2UpKTtcbiAgICB9O1xuICAgIEFic3RyYWN0Q2F0ZWdvcnlMb2dnZXIucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uIChsZXZlbCwgbXNnLCBlcnJvcikge1xuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDM7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgY2F0ZWdvcmllc1tfaSAtIDNdID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9sb2cuYXBwbHkodGhpcywgX19zcHJlYWRBcnJheShbbGV2ZWwsIG1zZywgZXJyb3IsIGZhbHNlXSwgY2F0ZWdvcmllcywgZmFsc2UpKTtcbiAgICB9O1xuICAgIEFic3RyYWN0Q2F0ZWdvcnlMb2dnZXIucHJvdG90eXBlLmdldFJvb3RDYXRlZ29yeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vdENhdGVnb3J5O1xuICAgIH07XG4gICAgQWJzdHJhY3RDYXRlZ29yeUxvZ2dlci5wcm90b3R5cGUuY3JlYXRlRGVmYXVsdExvZ01lc3NhZ2UgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgIHJldHVybiBNZXNzYWdlVXRpbHNfMS5NZXNzYWdlRm9ybWF0VXRpbHMucmVuZGVyRGVmYXVsdE1lc3NhZ2UobXNnLCB0cnVlKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybiBvcHRpb25hbCBtZXNzYWdlIGZvcm1hdHRlci4gQWxsIExvZ2dlclR5cGVzIChleGNlcHQgY3VzdG9tKSB3aWxsIHNlZSBpZlxuICAgICAqIHRoZXkgaGF2ZSB0aGlzLCBhbmQgaWYgc28gdXNlIGl0IHRvIGxvZy5cbiAgICAgKiBAcmV0dXJucyB7KChtZXNzYWdlOkNhdGVnb3J5TG9nTWVzc2FnZSk9PnN0cmluZyl8bnVsbH1cbiAgICAgKi9cbiAgICBBYnN0cmFjdENhdGVnb3J5TG9nZ2VyLnByb3RvdHlwZS5fZ2V0TWVzc2FnZUZvcm1hdHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNhdGVnb3J5U2V0dGluZ3MgPSB0aGlzLnJ1bnRpbWVTZXR0aW5ncy5nZXRDYXRlZ29yeVNldHRpbmdzKHRoaXMucm9vdENhdGVnb3J5KTtcbiAgICAgICAgLy8gU2hvdWxkIG5vdCBoYXBwZW4gYnV0IG1ha2UgdHMgaGFwcHlcbiAgICAgICAgaWYgKGNhdGVnb3J5U2V0dGluZ3MgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkRpZCBub3QgZmluZCBDYXRlZ29yeVNldHRpbmdzIGZvciByb290Q2F0ZWdvcnk6IFwiICsgdGhpcy5yb290Q2F0ZWdvcnkubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhdGVnb3J5U2V0dGluZ3MuZm9ybWF0dGVyTG9nTWVzc2FnZTtcbiAgICB9O1xuICAgIEFic3RyYWN0Q2F0ZWdvcnlMb2dnZXIucHJvdG90eXBlLl9sb2cgPSBmdW5jdGlvbiAobGV2ZWwsIG1zZywgZXJyb3IsIHJlc29sdmVkKSB7XG4gICAgICAgIGlmIChlcnJvciA9PT0gdm9pZCAwKSB7IGVycm9yID0gbnVsbDsgfVxuICAgICAgICBpZiAocmVzb2x2ZWQgPT09IHZvaWQgMCkgeyByZXNvbHZlZCA9IGZhbHNlOyB9XG4gICAgICAgIHZhciBjYXRlZ29yaWVzID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gNDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzW19pIC0gNF0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIC8vIHRoaXMuX2xvZ0ludGVybmFsKGxldmVsLCAoKSA9PiBtc2csICgpID0+IGVycm9yLCByZXNvbHZlZCwgLi4uY2F0ZWdvcmllcyk7XG4gICAgICAgIHZhciBmdW5jdGlvbk1lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG1zZyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1zZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1zZztcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGZ1bmN0aW9uRXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fbG9nSW50ZXJuYWwuYXBwbHkodGhpcywgX19zcHJlYWRBcnJheShbbGV2ZWwsIGZ1bmN0aW9uTWVzc2FnZSwgZnVuY3Rpb25FcnJvciwgcmVzb2x2ZWRdLCBjYXRlZ29yaWVzLCBmYWxzZSkpO1xuICAgIH07XG4gICAgQWJzdHJhY3RDYXRlZ29yeUxvZ2dlci5wcm90b3R5cGUuX2xvZ0ludGVybmFsID0gZnVuY3Rpb24gKGxldmVsLCBtc2csIGVycm9yLCByZXNvbHZlZCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDQ7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgY2F0ZWdvcmllc1tfaSAtIDRdID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbG9nQ2F0ZWdvcmllcyA9IFt0aGlzLnJvb3RDYXRlZ29yeV07XG4gICAgICAgIC8vIExvZyByb290IGNhdGVnb3J5IGJ5IGRlZmF1bHQgaWYgbm9uZSBwcmVzZW50XG4gICAgICAgIGlmICh0eXBlb2YgY2F0ZWdvcmllcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBjYXRlZ29yaWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxvZ0NhdGVnb3JpZXMgPSBsb2dDYXRlZ29yaWVzLmNvbmNhdChjYXRlZ29yaWVzLmZpbHRlcihmdW5jdGlvbiAoYykgeyByZXR1cm4gYyAhPT0gX3RoaXMucm9vdENhdGVnb3J5OyB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgdmFyIGNhdGVnb3J5ID0gbG9nQ2F0ZWdvcmllc1tpXTtcbiAgICAgICAgICAgIGlmIChjYXRlZ29yeSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBoYXZlIGEgbnVsbCBlbGVtZW50IHdpdGhpbiBjYXRlZ29yaWVzLCBhdCBpbmRleD1cIiArIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHNldHRpbmdzID0gdGhpc18xLnJ1bnRpbWVTZXR0aW5ncy5nZXRDYXRlZ29yeVNldHRpbmdzKGNhdGVnb3J5KTtcbiAgICAgICAgICAgIGlmIChzZXR0aW5ncyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhdGVnb3J5IHdpdGggcGF0aDogXCIgKyBjYXRlZ29yeS5nZXRDYXRlZ29yeVBhdGgoKSArIFwiIGlzIG5vdCByZWdpc3RlcmVkIHdpdGggdGhpcyBsb2dnZXIsIG1heWJlIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJ5b3UgcmVnaXN0ZXJlZCBpdCB3aXRoIGEgZGlmZmVyZW50IHJvb3QgbG9nZ2VyP1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5sb2dMZXZlbCA8PSBsZXZlbCkge1xuICAgICAgICAgICAgICAgIHZhciBhY3R1YWxFcnJvciA9IGVycm9yICE9PSBudWxsID8gZXJyb3IoKSA6IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKGFjdHVhbEVycm9yID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsb2dNZXNzYWdlID0gbmV3IENhdGVnb3J5TG9nTWVzc2FnZUltcGwobXNnKCksIGFjdHVhbEVycm9yLCBsb2dDYXRlZ29yaWVzLCBuZXcgRGF0ZSgpLCBsZXZlbCwgc2V0dGluZ3MubG9nRm9ybWF0LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nTWVzc2FnZS5yZXNvbHZlZEVycm9yTWVzc2FnZSA9IHJlc29sdmVkO1xuICAgICAgICAgICAgICAgICAgICB0aGlzXzEuYWxsTWVzc2FnZXMuYWRkVGFpbChsb2dNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpc18xLnByb2Nlc3NNZXNzYWdlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxvZ01lc3NhZ2VfMSA9IG5ldyBDYXRlZ29yeUxvZ01lc3NhZ2VJbXBsKG1zZygpLCBhY3R1YWxFcnJvciwgbG9nQ2F0ZWdvcmllcywgbmV3IERhdGUoKSwgbGV2ZWwsIHNldHRpbmdzLmxvZ0Zvcm1hdCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBsb2dNZXNzYWdlXzEucmVzb2x2ZWRFcnJvck1lc3NhZ2UgPSByZXNvbHZlZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpc18xLmFsbE1lc3NhZ2VzLmFkZFRhaWwobG9nTWVzc2FnZV8xKTtcbiAgICAgICAgICAgICAgICAgICAgTWVzc2FnZVV0aWxzXzEuTWVzc2FnZUZvcm1hdFV0aWxzLnJlbmRlckVycm9yKGFjdHVhbEVycm9yKS50aGVuKGZ1bmN0aW9uIChzdGFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nTWVzc2FnZV8xLmVycm9yQXNTdGFjayA9IHN0YWNrO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nTWVzc2FnZV8xLnNldFJlYWR5KHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMucHJvY2Vzc01lc3NhZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ01lc3NhZ2VfMS5lcnJvckFzU3RhY2sgPSBcIjxVTktOT1dOPiB1bmFibGUgdG8gZ2V0IHN0YWNrLlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nTWVzc2FnZV8xLnNldFJlYWR5KHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMucHJvY2Vzc01lc3NhZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gXCJicmVha1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2YXIgdGhpc18xID0gdGhpcztcbiAgICAgICAgLy8gR2V0IHRoZSBydW50aW1lIGxldmVscyBmb3IgZ2l2ZW4gY2F0ZWdvcmllcy4gSWYgdGhlaXIgbGV2ZWwgaXMgbG93ZXIgdGhhbiBnaXZlbiBsZXZlbCwgd2UgbG9nLlxuICAgICAgICAvLyBJbiBhZGRpdGlvbiB3ZSBwYXNzIGFsb25nIHdoaWNoIGNhdGVnb3J5L2NhdGVnb3JpZXMgd2UgbG9nIHRoaXMgc3RhdGVtZW50IGZvci5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2dDYXRlZ29yaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgc3RhdGVfMSA9IF9sb29wXzEoaSk7XG4gICAgICAgICAgICBpZiAoc3RhdGVfMSA9PT0gXCJicmVha1wiKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBBYnN0cmFjdENhdGVnb3J5TG9nZ2VyLnByb3RvdHlwZS5wcm9jZXNzTWVzc2FnZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIEJhc2ljYWxseSB3ZSB3YWl0IHVudGlsIGVycm9ycyBhcmUgcmVzb2x2ZWQgKHRob3NlIG1lc3NhZ2VzXG4gICAgICAgIC8vIG1heSBub3QgYmUgcmVhZHkpLlxuICAgICAgICB2YXIgbXNncyA9IHRoaXMuYWxsTWVzc2FnZXM7XG4gICAgICAgIGlmIChtc2dzLmdldFNpemUoKSA+IDApIHtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICB2YXIgbXNnID0gbXNncy5nZXRIZWFkKCk7XG4gICAgICAgICAgICAgICAgaWYgKG1zZyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbXNnLmlzUmVhZHkoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbXNncy5yZW1vdmVIZWFkKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG9Mb2cobXNnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IHdoaWxlIChtc2dzLmdldFNpemUoKSA+IDApO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gQWJzdHJhY3RDYXRlZ29yeUxvZ2dlcjtcbn0oKSk7XG5leHBvcnRzLkFic3RyYWN0Q2F0ZWdvcnlMb2dnZXIgPSBBYnN0cmFjdENhdGVnb3J5TG9nZ2VyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9QWJzdHJhY3RDYXRlZ29yeUxvZ2dlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX3NwcmVhZEFycmF5ID0gKHRoaXMgJiYgdGhpcy5fX3NwcmVhZEFycmF5KSB8fCBmdW5jdGlvbiAodG8sIGZyb20sIHBhY2spIHtcbiAgICBpZiAocGFjayB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAyKSBmb3IgKHZhciBpID0gMCwgbCA9IGZyb20ubGVuZ3RoLCBhcjsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoYXIgfHwgIShpIGluIGZyb20pKSB7XG4gICAgICAgICAgICBpZiAoIWFyKSBhciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20sIDAsIGkpO1xuICAgICAgICAgICAgYXJbaV0gPSBmcm9tW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0by5jb25jYXQoYXIgfHwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSkpO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2F0ZWdvcnkgPSB2b2lkIDA7XG52YXIgTG9nZ2VyT3B0aW9uc18xID0gcmVxdWlyZShcIi4uL0xvZ2dlck9wdGlvbnNcIik7XG52YXIgQ2F0ZWdvcnlTZXJ2aWNlXzEgPSByZXF1aXJlKFwiLi9DYXRlZ29yeVNlcnZpY2VcIik7XG4vKipcbiAqIENhdGVnb3J5IGZvciB1c2Ugd2l0aCBjYXRlZ29yaXplZCBsb2dnaW5nLlxuICogQXQgbWluaW11bSB5b3UgbmVlZCBvbmUgY2F0ZWdvcnksIHdoaWNoIHdpbGwgc2VydmUgYXMgdGhlIHJvb3QgY2F0ZWdvcnkuXG4gKiBZb3UgY2FuIGNyZWF0ZSBjaGlsZCBjYXRlZ29yaWVzIChsaWtlIGEgdHJlZSkuIFlvdSBjYW4gaGF2ZSBtdWx0aXBsZSByb290XG4gKiBjYXRlZ29yaWVzLlxuICovXG52YXIgQ2F0ZWdvcnkgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2F0ZWdvcnkobmFtZSwgcGFyZW50KSB7XG4gICAgICAgIGlmIChwYXJlbnQgPT09IHZvaWQgMCkgeyBwYXJlbnQgPSBudWxsOyB9XG4gICAgICAgIHRoaXMuX2NoaWxkcmVuID0gW107XG4gICAgICAgIHRoaXMuX2xvZ0xldmVsID0gTG9nZ2VyT3B0aW9uc18xLkxvZ0xldmVsLkVycm9yO1xuICAgICAgICBpZiAobmFtZS5pbmRleE9mKFwiI1wiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCB1c2UgIyBpbiBhIG5hbWUgb2YgYSBDYXRlZ29yeVwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pZCA9IENhdGVnb3J5Lm5leHRJZCgpO1xuICAgICAgICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICAgICAgICBpZiAodGhpcy5fcGFyZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQuX2NoaWxkcmVuLnB1c2godGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgQ2F0ZWdvcnlTZXJ2aWNlXzEuQ2F0ZWdvcnlTZXJ2aWNlSW1wbC5nZXRJbnN0YW5jZSgpLnJlZ2lzdGVyQ2F0ZWdvcnkodGhpcyk7XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYXRlZ29yeS5wcm90b3R5cGUsIFwibmFtZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ2F0ZWdvcnkucHJvdG90eXBlLCBcInBhcmVudFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhcmVudDtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYXRlZ29yeS5wcm90b3R5cGUsIFwiY2hpbGRyZW5cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jaGlsZHJlbjtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYXRlZ29yeS5wcm90b3R5cGUsIFwibG9nTGV2ZWxcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sb2dMZXZlbDtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIENhdGVnb3J5LnByb3RvdHlwZS50cmFjZSA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgY2F0ZWdvcmllc1tfaSAtIDFdID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxvYWRDYXRlZ29yeUxvZ2dlcigpO1xuICAgICAgICAoX2EgPSB0aGlzLl9sb2dnZXIpLnRyYWNlLmFwcGx5KF9hLCBfX3NwcmVhZEFycmF5KFttc2ddLCBjYXRlZ29yaWVzLCBmYWxzZSkpO1xuICAgIH07XG4gICAgQ2F0ZWdvcnkucHJvdG90eXBlLmRlYnVnID0gZnVuY3Rpb24gKG1zZykge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIHZhciBjYXRlZ29yaWVzID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMTsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubG9hZENhdGVnb3J5TG9nZ2VyKCk7XG4gICAgICAgIChfYSA9IHRoaXMuX2xvZ2dlcikuZGVidWcuYXBwbHkoX2EsIF9fc3ByZWFkQXJyYXkoW21zZ10sIGNhdGVnb3JpZXMsIGZhbHNlKSk7XG4gICAgfTtcbiAgICBDYXRlZ29yeS5wcm90b3R5cGUuaW5mbyA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgY2F0ZWdvcmllc1tfaSAtIDFdID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxvYWRDYXRlZ29yeUxvZ2dlcigpO1xuICAgICAgICAoX2EgPSB0aGlzLl9sb2dnZXIpLmluZm8uYXBwbHkoX2EsIF9fc3ByZWFkQXJyYXkoW21zZ10sIGNhdGVnb3JpZXMsIGZhbHNlKSk7XG4gICAgfTtcbiAgICBDYXRlZ29yeS5wcm90b3R5cGUud2FybiA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgY2F0ZWdvcmllc1tfaSAtIDFdID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxvYWRDYXRlZ29yeUxvZ2dlcigpO1xuICAgICAgICAoX2EgPSB0aGlzLl9sb2dnZXIpLndhcm4uYXBwbHkoX2EsIF9fc3ByZWFkQXJyYXkoW21zZ10sIGNhdGVnb3JpZXMsIGZhbHNlKSk7XG4gICAgfTtcbiAgICBDYXRlZ29yeS5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbiAobXNnLCBlcnJvcikge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIHZhciBjYXRlZ29yaWVzID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMjsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzW19pIC0gMl0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubG9hZENhdGVnb3J5TG9nZ2VyKCk7XG4gICAgICAgIChfYSA9IHRoaXMuX2xvZ2dlcikuZXJyb3IuYXBwbHkoX2EsIF9fc3ByZWFkQXJyYXkoW21zZywgZXJyb3JdLCBjYXRlZ29yaWVzLCBmYWxzZSkpO1xuICAgIH07XG4gICAgQ2F0ZWdvcnkucHJvdG90eXBlLmZhdGFsID0gZnVuY3Rpb24gKG1zZywgZXJyb3IpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDI7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgY2F0ZWdvcmllc1tfaSAtIDJdID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxvYWRDYXRlZ29yeUxvZ2dlcigpO1xuICAgICAgICAoX2EgPSB0aGlzLl9sb2dnZXIpLmZhdGFsLmFwcGx5KF9hLCBfX3NwcmVhZEFycmF5KFttc2csIGVycm9yXSwgY2F0ZWdvcmllcywgZmFsc2UpKTtcbiAgICB9O1xuICAgIENhdGVnb3J5LnByb3RvdHlwZS5yZXNvbHZlZCA9IGZ1bmN0aW9uIChtc2csIGVycm9yKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdmFyIGNhdGVnb3JpZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAyOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXNbX2kgLSAyXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sb2FkQ2F0ZWdvcnlMb2dnZXIoKTtcbiAgICAgICAgKF9hID0gdGhpcy5fbG9nZ2VyKS5yZXNvbHZlZC5hcHBseShfYSwgX19zcHJlYWRBcnJheShbbXNnLCBlcnJvcl0sIGNhdGVnb3JpZXMsIGZhbHNlKSk7XG4gICAgfTtcbiAgICBDYXRlZ29yeS5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24gKGxldmVsLCBtc2csIGVycm9yKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdmFyIGNhdGVnb3JpZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAzOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXNbX2kgLSAzXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sb2FkQ2F0ZWdvcnlMb2dnZXIoKTtcbiAgICAgICAgKF9hID0gdGhpcy5fbG9nZ2VyKS5sb2cuYXBwbHkoX2EsIF9fc3ByZWFkQXJyYXkoW2xldmVsLCBtc2csIGVycm9yXSwgY2F0ZWdvcmllcywgZmFsc2UpKTtcbiAgICB9O1xuICAgIENhdGVnb3J5LnByb3RvdHlwZS5nZXRDYXRlZ29yeVBhdGggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLm5hbWU7XG4gICAgICAgIHZhciBjYXQgPSB0aGlzLnBhcmVudDtcbiAgICAgICAgd2hpbGUgKGNhdCAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBjYXQubmFtZSArIFwiI1wiICsgcmVzdWx0O1xuICAgICAgICAgICAgY2F0ID0gY2F0LnBhcmVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENhdGVnb3J5LnByb3RvdHlwZSwgXCJpZFwiLCB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBpZCBmb3IgdGhpcyBjYXRlZ29yeSAodGhpc1xuICAgICAgICAgKiBpcyBmb3IgaW50ZXJuYWwgcHVycG9zZXMgb25seSkuXG4gICAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IElkXG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pZDtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIENhdGVnb3J5LnByb3RvdHlwZS5sb2FkQ2F0ZWdvcnlMb2dnZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdGhpcy5fbG9nZ2VyKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dnZXIgPSBDYXRlZ29yeVNlcnZpY2VfMS5DYXRlZ29yeVNlcnZpY2VJbXBsLmdldEluc3RhbmNlKCkuZ2V0TG9nZ2VyKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5fbG9nZ2VyID09PSBcInVuZGVmaW5lZFwiIHx8IHRoaXMuX2xvZ2dlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGxvYWQgYSBsb2dnZXIgZm9yIGNhdGVnb3J5IChzaG91bGQgbm90IGhhcHBlbik6IFwiICsgdGhpcy5uYW1lKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQ2F0ZWdvcnkubmV4dElkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gQ2F0ZWdvcnkuY3VycmVudElkKys7XG4gICAgfTtcbiAgICBDYXRlZ29yeS5jdXJyZW50SWQgPSAxO1xuICAgIHJldHVybiBDYXRlZ29yeTtcbn0oKSk7XG5leHBvcnRzLkNhdGVnb3J5ID0gQ2F0ZWdvcnk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1DYXRlZ29yeS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2F0ZWdvcnlDb25maWd1cmF0aW9uID0gdm9pZCAwO1xudmFyIExvZ2dlck9wdGlvbnNfMSA9IHJlcXVpcmUoXCIuLi9Mb2dnZXJPcHRpb25zXCIpO1xuLyoqXG4gKiBEZWZhdWx0IGNvbmZpZ3VyYXRpb24sIGNhbiBiZSB1c2VkIHRvIGluaXRpYWxseSBzZXQgYSBkaWZmZXJlbnQgZGVmYXVsdCBjb25maWd1cmF0aW9uXG4gKiBvbiB0aGUgQ2F0ZWdvcnlTZXJ2aWNlRmFjdG9yeS4gVGhpcyB3aWxsIGJlIGFwcGxpZWQgdG8gYWxsIGNhdGVnb3JpZXMgYWxyZWFkeSByZWdpc3RlcmVkIChvclxuICogcmVnaXN0ZXJlZCBpbiB0aGUgZnV0dXJlKS4gQ2FuIGFsc28gYmUgYXBwbGllZCB0byBvbmUgQ2F0ZWdvcnkgKGFuZCBjaGlsZHMpLlxuICovXG52YXIgQ2F0ZWdvcnlDb25maWd1cmF0aW9uID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSBsb2dMZXZlbCBMb2cgbGV2ZWwgZm9yIGFsbCBsb2dnZXJzLCBkZWZhdWx0IGlzIExvZ0xldmVsLkVycm9yXG4gICAgICogQHBhcmFtIGxvZ2dlclR5cGUgV2hlcmUgdG8gbG9nLCBkZWZhdWx0IGlzIExvZ2dlclR5cGUuQ29uc29sZVxuICAgICAqIEBwYXJhbSBsb2dGb3JtYXQgV2hhdCBsb2dnaW5nIGZvcm1hdCB0byB1c2UsIHVzZSBkZWZhdWx0IGluc3RhbmNlLCBmb3IgZGVmYXVsdCB2YWx1ZXMgc2VlIENhdGVnb3J5TG9nRm9ybWF0LlxuICAgICAqIEBwYXJhbSBjYWxsQmFja0xvZ2dlciBPcHRpb25hbCBjYWxsYmFjaywgaWYgTG9nZ2VyVHlwZS5DdXN0b20gaXMgdXNlZCBhcyBsb2dnZXJUeXBlLiBJbiB0aGF0IGNhc2UgbXVzdCByZXR1cm4gYSBuZXcgTG9nZ2VyIGluc3RhbmNlLlxuICAgICAqICAgICAgICAgICAgSXQgaXMgcmVjb21tZW5kZWQgdG8gZXh0ZW5kIEFic3RyYWN0Q2F0ZWdvcnlMb2dnZXIgdG8gbWFrZSB5b3VyIGN1c3RvbSBsb2dnZXIuXG4gICAgICovXG4gICAgZnVuY3Rpb24gQ2F0ZWdvcnlDb25maWd1cmF0aW9uKGxvZ0xldmVsLCBsb2dnZXJUeXBlLCBsb2dGb3JtYXQsIGNhbGxCYWNrTG9nZ2VyKSB7XG4gICAgICAgIGlmIChsb2dMZXZlbCA9PT0gdm9pZCAwKSB7IGxvZ0xldmVsID0gTG9nZ2VyT3B0aW9uc18xLkxvZ0xldmVsLkVycm9yOyB9XG4gICAgICAgIGlmIChsb2dnZXJUeXBlID09PSB2b2lkIDApIHsgbG9nZ2VyVHlwZSA9IExvZ2dlck9wdGlvbnNfMS5Mb2dnZXJUeXBlLkNvbnNvbGU7IH1cbiAgICAgICAgaWYgKGxvZ0Zvcm1hdCA9PT0gdm9pZCAwKSB7IGxvZ0Zvcm1hdCA9IG5ldyBMb2dnZXJPcHRpb25zXzEuQ2F0ZWdvcnlMb2dGb3JtYXQoKTsgfVxuICAgICAgICBpZiAoY2FsbEJhY2tMb2dnZXIgPT09IHZvaWQgMCkgeyBjYWxsQmFja0xvZ2dlciA9IG51bGw7IH1cbiAgICAgICAgdGhpcy5fZm9ybWF0dGVyTG9nTWVzc2FnZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2xvZ0xldmVsID0gbG9nTGV2ZWw7XG4gICAgICAgIHRoaXMuX2xvZ2dlclR5cGUgPSBsb2dnZXJUeXBlO1xuICAgICAgICB0aGlzLl9sb2dGb3JtYXQgPSBsb2dGb3JtYXQ7XG4gICAgICAgIHRoaXMuX2NhbGxCYWNrTG9nZ2VyID0gY2FsbEJhY2tMb2dnZXI7XG4gICAgICAgIGlmICh0aGlzLl9sb2dnZXJUeXBlID09PSBMb2dnZXJPcHRpb25zXzEuTG9nZ2VyVHlwZS5DdXN0b20gJiYgdGhpcy5jYWxsQmFja0xvZ2dlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSWYgeW91IHNwZWNpZnkgbG9nZ2VyVHlwZSB0byBiZSBDdXN0b20sIHlvdSBtdXN0IHByb3ZpZGUgdGhlIGNhbGxCYWNrTG9nZ2VyIGFyZ3VtZW50XCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYXRlZ29yeUNvbmZpZ3VyYXRpb24ucHJvdG90eXBlLCBcImxvZ0xldmVsXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9nTGV2ZWw7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ2F0ZWdvcnlDb25maWd1cmF0aW9uLnByb3RvdHlwZSwgXCJsb2dnZXJUeXBlXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9nZ2VyVHlwZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYXRlZ29yeUNvbmZpZ3VyYXRpb24ucHJvdG90eXBlLCBcImxvZ0Zvcm1hdFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xvZ0Zvcm1hdDtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYXRlZ29yeUNvbmZpZ3VyYXRpb24ucHJvdG90eXBlLCBcImNhbGxCYWNrTG9nZ2VyXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2FsbEJhY2tMb2dnZXI7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ2F0ZWdvcnlDb25maWd1cmF0aW9uLnByb3RvdHlwZSwgXCJmb3JtYXR0ZXJMb2dNZXNzYWdlXCIsIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCB0aGUgZm9ybWF0dGVyTG9nTWVzc2FnZSBmdW5jdGlvbiwgc2VlIGNvbW1lbnQgb24gdGhlIHNldHRlci5cbiAgICAgICAgICogQHJldHVybnMgeygobWVzc2FnZTpDYXRlZ29yeUxvZ01lc3NhZ2UpPT5zdHJpbmcpfG51bGx9XG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9mb3JtYXR0ZXJMb2dNZXNzYWdlO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogU2V0IHRoZSBkZWZhdWx0IGZvcm1hdHRlckxvZ01lc3NhZ2UgZnVuY3Rpb24sIGlmIHNldCBpdCBpcyBhcHBsaWVkIHRvIGFsbCB0eXBlIG9mIGxvZ2dlcnMgZXhjZXB0IGZvciBhIGN1c3RvbSBsb2dnZXIuXG4gICAgICAgICAqIEJ5IGRlZmF1bHQgdGhpcyBpcyBudWxsIChub3Qgc2V0KS4gWW91IGNhbiBhc3NpZ24gYSBmdW5jdGlvbiB0byBhbGxvdyBjdXN0b20gZm9ybWF0dGluZyBvZiBhIGxvZyBtZXNzYWdlLlxuICAgICAgICAgKiBFYWNoIGxvZyBtZXNzYWdlIHdpbGwgY2FsbCB0aGlzIGZ1bmN0aW9uIHRoZW4gYW5kIGV4cGVjdHMgeW91ciBmdW5jdGlvbiB0byBmb3JtYXQgdGhlIG1lc3NhZ2UgYW5kIHJldHVybiBhIHN0cmluZy5cbiAgICAgICAgICogV2lsbCB0aHJvdyBhbiBlcnJvciBpZiB5b3UgYXR0ZW1wdCB0byBzZXQgYSBmb3JtYXR0ZXJMb2dNZXNzYWdlIGlmIHRoZSBMb2dnZXJUeXBlIGlzIGN1c3RvbS5cbiAgICAgICAgICogQHBhcmFtIHZhbHVlIFRoZSBmb3JtYXR0ZXIgZnVuY3Rpb24sIG9yIG51bGwgdG8gcmVzZXQgaXQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHRoaXMuX2xvZ2dlclR5cGUgPT09IExvZ2dlck9wdGlvbnNfMS5Mb2dnZXJUeXBlLkN1c3RvbSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBjYW5ub3Qgc3BlY2lmeSBhIGZvcm1hdHRlciBmb3IgbG9nIG1lc3NhZ2VzIGlmIHlvdXIgbG9nZ2VyVHlwZSBpcyBDdXN0b21cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9mb3JtYXR0ZXJMb2dNZXNzYWdlID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBDYXRlZ29yeUNvbmZpZ3VyYXRpb24ucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjb25maWcgPSBuZXcgQ2F0ZWdvcnlDb25maWd1cmF0aW9uKHRoaXMubG9nTGV2ZWwsIHRoaXMubG9nZ2VyVHlwZSwgdGhpcy5sb2dGb3JtYXQuY29weSgpLCB0aGlzLmNhbGxCYWNrTG9nZ2VyKTtcbiAgICAgICAgY29uZmlnLmZvcm1hdHRlckxvZ01lc3NhZ2UgPSB0aGlzLmZvcm1hdHRlckxvZ01lc3NhZ2U7XG4gICAgICAgIHJldHVybiBjb25maWc7XG4gICAgfTtcbiAgICByZXR1cm4gQ2F0ZWdvcnlDb25maWd1cmF0aW9uO1xufSgpKTtcbmV4cG9ydHMuQ2F0ZWdvcnlDb25maWd1cmF0aW9uID0gQ2F0ZWdvcnlDb25maWd1cmF0aW9uO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Q2F0ZWdvcnlDb25maWd1cmF0aW9uLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBiICE9PSBcImZ1bmN0aW9uXCIgJiYgYiAhPT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2F0ZWdvcnlDb25zb2xlTG9nZ2VySW1wbCA9IHZvaWQgMDtcbnZhciBMb2dnZXJPcHRpb25zXzEgPSByZXF1aXJlKFwiLi4vTG9nZ2VyT3B0aW9uc1wiKTtcbnZhciBBYnN0cmFjdENhdGVnb3J5TG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9BYnN0cmFjdENhdGVnb3J5TG9nZ2VyXCIpO1xuLyoqXG4gKiBTaW1wbGUgbG9nZ2VyLCB0aGF0IGxvZ3MgdG8gdGhlIGNvbnNvbGUuIElmIHRoZSBjb25zb2xlIGlzIHVuYXZhaWxhYmxlIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uLlxuICovXG52YXIgQ2F0ZWdvcnlDb25zb2xlTG9nZ2VySW1wbCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoQ2F0ZWdvcnlDb25zb2xlTG9nZ2VySW1wbCwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBDYXRlZ29yeUNvbnNvbGVMb2dnZXJJbXBsKHJvb3RDYXRlZ29yeSwgcnVudGltZVNldHRpbmdzKSB7XG4gICAgICAgIHJldHVybiBfc3VwZXIuY2FsbCh0aGlzLCByb290Q2F0ZWdvcnksIHJ1bnRpbWVTZXR0aW5ncykgfHwgdGhpcztcbiAgICB9XG4gICAgQ2F0ZWdvcnlDb25zb2xlTG9nZ2VySW1wbC5wcm90b3R5cGUuZG9Mb2cgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgIGlmIChjb25zb2xlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlRm9ybWF0dGVyID0gdGhpcy5fZ2V0TWVzc2FnZUZvcm1hdHRlcigpO1xuICAgICAgICAgICAgdmFyIGZ1bGxNc2cgPSB2b2lkIDA7XG4gICAgICAgICAgICBpZiAobWVzc2FnZUZvcm1hdHRlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGZ1bGxNc2cgPSB0aGlzLmNyZWF0ZURlZmF1bHRMb2dNZXNzYWdlKG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBmdWxsTXNnID0gbWVzc2FnZUZvcm1hdHRlcihtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGxvZ2dlZCA9IGZhbHNlO1xuICAgICAgICAgICAgLyogdHNsaW50OmRpc2FibGU6bm8tY29uc29sZSAqL1xuICAgICAgICAgICAgc3dpdGNoIChtc2cubGV2ZWwpIHtcbiAgICAgICAgICAgICAgICBjYXNlIExvZ2dlck9wdGlvbnNfMS5Mb2dMZXZlbC5UcmFjZTpcbiAgICAgICAgICAgICAgICAgICAgLy8gRG9uJ3QgdHJ5IHRyYWNlIHdlIGRvbid0IHdhbnQgc3RhY2tzXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTG9nZ2VyT3B0aW9uc18xLkxvZ0xldmVsLkRlYnVnOlxuICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCB0cnksIHRvbyBtdWNoIGRpZmZlcmVuY2VzIG9mIGNvbnNvbGVzLlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIExvZ2dlck9wdGlvbnNfMS5Mb2dMZXZlbC5JbmZvOlxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uc29sZS5pbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oZnVsbE1zZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTG9nZ2VyT3B0aW9uc18xLkxvZ0xldmVsLldhcm46XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25zb2xlLndhcm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihmdWxsTXNnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWwuRXJyb3I6XG4gICAgICAgICAgICAgICAgY2FzZSBMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWwuRmF0YWw6XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGZ1bGxNc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZCBsZXZlbDogXCIgKyBtc2cubGV2ZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFsb2dnZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhmdWxsTXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIHRzbGludDplbmFibGU6bm8tY29uc29sZSAqL1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29uc29sZSBpcyBub3QgZGVmaW5lZCwgY2Fubm90IGxvZyBtc2c6IFwiICsgbXNnLm1lc3NhZ2VBc1N0cmluZyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBDYXRlZ29yeUNvbnNvbGVMb2dnZXJJbXBsO1xufShBYnN0cmFjdENhdGVnb3J5TG9nZ2VyXzEuQWJzdHJhY3RDYXRlZ29yeUxvZ2dlcikpO1xuZXhwb3J0cy5DYXRlZ29yeUNvbnNvbGVMb2dnZXJJbXBsID0gQ2F0ZWdvcnlDb25zb2xlTG9nZ2VySW1wbDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUNhdGVnb3J5Q29uc29sZUxvZ2dlckltcGwuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19zcHJlYWRBcnJheSA9ICh0aGlzICYmIHRoaXMuX19zcHJlYWRBcnJheSkgfHwgZnVuY3Rpb24gKHRvLCBmcm9tLCBwYWNrKSB7XG4gICAgaWYgKHBhY2sgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMikgZm9yICh2YXIgaSA9IDAsIGwgPSBmcm9tLmxlbmd0aCwgYXI7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGFyIHx8ICEoaSBpbiBmcm9tKSkge1xuICAgICAgICAgICAgaWYgKCFhcikgYXIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tLCAwLCBpKTtcbiAgICAgICAgICAgIGFyW2ldID0gZnJvbVtpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG8uY29uY2F0KGFyIHx8IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20pKTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNhdGVnb3J5RGVsZWdhdGVMb2dnZXJJbXBsID0gdm9pZCAwO1xuLyoqXG4gKiBEZWxlZ2F0ZSBsb2dnZXIsIGRlbGVnYXRlcyBsb2dnaW5nIHRvIGdpdmVuIGxvZ2dlciAoY29uc3RydWN0b3IpLlxuICovXG52YXIgQ2F0ZWdvcnlEZWxlZ2F0ZUxvZ2dlckltcGwgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2F0ZWdvcnlEZWxlZ2F0ZUxvZ2dlckltcGwoZGVsZWdhdGUpIHtcbiAgICAgICAgdGhpcy5fZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENhdGVnb3J5RGVsZWdhdGVMb2dnZXJJbXBsLnByb3RvdHlwZSwgXCJkZWxlZ2F0ZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlbGVnYXRlO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fZGVsZWdhdGUgPSB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIENhdGVnb3J5RGVsZWdhdGVMb2dnZXJJbXBsLnByb3RvdHlwZS50cmFjZSA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgY2F0ZWdvcmllc1tfaSAtIDFdID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICAoX2EgPSB0aGlzLl9kZWxlZ2F0ZSkudHJhY2UuYXBwbHkoX2EsIF9fc3ByZWFkQXJyYXkoW21zZ10sIGNhdGVnb3JpZXMsIGZhbHNlKSk7XG4gICAgfTtcbiAgICBDYXRlZ29yeURlbGVnYXRlTG9nZ2VySW1wbC5wcm90b3R5cGUuZGVidWcgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdmFyIGNhdGVnb3JpZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAxOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXNbX2kgLSAxXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgKF9hID0gdGhpcy5fZGVsZWdhdGUpLmRlYnVnLmFwcGx5KF9hLCBfX3NwcmVhZEFycmF5KFttc2ddLCBjYXRlZ29yaWVzLCBmYWxzZSkpO1xuICAgIH07XG4gICAgQ2F0ZWdvcnlEZWxlZ2F0ZUxvZ2dlckltcGwucHJvdG90eXBlLmluZm8gPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdmFyIGNhdGVnb3JpZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAxOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXNbX2kgLSAxXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgKF9hID0gdGhpcy5fZGVsZWdhdGUpLmluZm8uYXBwbHkoX2EsIF9fc3ByZWFkQXJyYXkoW21zZ10sIGNhdGVnb3JpZXMsIGZhbHNlKSk7XG4gICAgfTtcbiAgICBDYXRlZ29yeURlbGVnYXRlTG9nZ2VySW1wbC5wcm90b3R5cGUud2FybiA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgY2F0ZWdvcmllc1tfaSAtIDFdID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICAoX2EgPSB0aGlzLl9kZWxlZ2F0ZSkud2Fybi5hcHBseShfYSwgX19zcHJlYWRBcnJheShbbXNnXSwgY2F0ZWdvcmllcywgZmFsc2UpKTtcbiAgICB9O1xuICAgIENhdGVnb3J5RGVsZWdhdGVMb2dnZXJJbXBsLnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uIChtc2csIGVycm9yKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdmFyIGNhdGVnb3JpZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAyOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXNbX2kgLSAyXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgKF9hID0gdGhpcy5fZGVsZWdhdGUpLmVycm9yLmFwcGx5KF9hLCBfX3NwcmVhZEFycmF5KFttc2csIGVycm9yXSwgY2F0ZWdvcmllcywgZmFsc2UpKTtcbiAgICB9O1xuICAgIENhdGVnb3J5RGVsZWdhdGVMb2dnZXJJbXBsLnByb3RvdHlwZS5mYXRhbCA9IGZ1bmN0aW9uIChtc2csIGVycm9yKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdmFyIGNhdGVnb3JpZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAyOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXNbX2kgLSAyXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgKF9hID0gdGhpcy5fZGVsZWdhdGUpLmZhdGFsLmFwcGx5KF9hLCBfX3NwcmVhZEFycmF5KFttc2csIGVycm9yXSwgY2F0ZWdvcmllcywgZmFsc2UpKTtcbiAgICB9O1xuICAgIENhdGVnb3J5RGVsZWdhdGVMb2dnZXJJbXBsLnByb3RvdHlwZS5yZXNvbHZlZCA9IGZ1bmN0aW9uIChtc2csIGVycm9yKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdmFyIGNhdGVnb3JpZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAyOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXNbX2kgLSAyXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgKF9hID0gdGhpcy5fZGVsZWdhdGUpLnJlc29sdmVkLmFwcGx5KF9hLCBfX3NwcmVhZEFycmF5KFttc2csIGVycm9yXSwgY2F0ZWdvcmllcywgZmFsc2UpKTtcbiAgICB9O1xuICAgIENhdGVnb3J5RGVsZWdhdGVMb2dnZXJJbXBsLnByb3RvdHlwZS5sb2cgPSBmdW5jdGlvbiAobGV2ZWwsIG1zZywgZXJyb3IpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDM7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgY2F0ZWdvcmllc1tfaSAtIDNdID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICAoX2EgPSB0aGlzLl9kZWxlZ2F0ZSkubG9nLmFwcGx5KF9hLCBfX3NwcmVhZEFycmF5KFtsZXZlbCwgbXNnLCBlcnJvcl0sIGNhdGVnb3JpZXMsIGZhbHNlKSk7XG4gICAgfTtcbiAgICByZXR1cm4gQ2F0ZWdvcnlEZWxlZ2F0ZUxvZ2dlckltcGw7XG59KCkpO1xuZXhwb3J0cy5DYXRlZ29yeURlbGVnYXRlTG9nZ2VySW1wbCA9IENhdGVnb3J5RGVsZWdhdGVMb2dnZXJJbXBsO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Q2F0ZWdvcnlEZWxlZ2F0ZUxvZ2dlckltcGwuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5DYXRlZ29yeUV4dGVuc2lvbkxvZ2dlckltcGwgPSB2b2lkIDA7XG52YXIgRXh0ZW5zaW9uSGVscGVyXzEgPSByZXF1aXJlKFwiLi4vLi4vZXh0ZW5zaW9uL0V4dGVuc2lvbkhlbHBlclwiKTtcbnZhciBBYnN0cmFjdENhdGVnb3J5TG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9BYnN0cmFjdENhdGVnb3J5TG9nZ2VyXCIpO1xuLyoqXG4gKiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgdXNlZCBkaXJlY3RseSwgaXQgaXMgdXNlZCBmb3IgY29tbXVuaWNhdGlvbiB3aXRoIHRoZSBleHRlbnNpb24gb25seS5cbiAqL1xudmFyIENhdGVnb3J5RXh0ZW5zaW9uTG9nZ2VySW1wbCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoQ2F0ZWdvcnlFeHRlbnNpb25Mb2dnZXJJbXBsLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIENhdGVnb3J5RXh0ZW5zaW9uTG9nZ2VySW1wbChyb290Q2F0ZWdvcnksIHJ1bnRpbWVTZXR0aW5ncykge1xuICAgICAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcywgcm9vdENhdGVnb3J5LCBydW50aW1lU2V0dGluZ3MpIHx8IHRoaXM7XG4gICAgfVxuICAgIENhdGVnb3J5RXh0ZW5zaW9uTG9nZ2VySW1wbC5wcm90b3R5cGUuZG9Mb2cgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBFeHRlbnNpb25IZWxwZXJfMS5FeHRlbnNpb25IZWxwZXIuc2VuZENhdGVnb3J5TG9nTWVzc2FnZShtc2cpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLyogdHNsaW50OmRpc2FibGU6bm8tY29uc29sZSAqL1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ3aW5kb3cgaXMgbm90IGF2YWlsYWJsZSwgeW91IG11c3QgYmUgcnVubmluZyBpbiBhIGJyb3dzZXIgZm9yIHRoaXMuIERyb3BwZWQgbWVzc2FnZS5cIik7XG4gICAgICAgICAgICAvKiB0c2xpbnQ6ZW5hYmxlOm5vLWNvbnNvbGUgKi9cbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIENhdGVnb3J5RXh0ZW5zaW9uTG9nZ2VySW1wbDtcbn0oQWJzdHJhY3RDYXRlZ29yeUxvZ2dlcl8xLkFic3RyYWN0Q2F0ZWdvcnlMb2dnZXIpKTtcbmV4cG9ydHMuQ2F0ZWdvcnlFeHRlbnNpb25Mb2dnZXJJbXBsID0gQ2F0ZWdvcnlFeHRlbnNpb25Mb2dnZXJJbXBsO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Q2F0ZWdvcnlFeHRlbnNpb25Mb2dnZXJJbXBsLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBiICE9PSBcImZ1bmN0aW9uXCIgJiYgYiAhPT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2F0ZWdvcnlNZXNzYWdlQnVmZmVyTG9nZ2VySW1wbCA9IHZvaWQgMDtcbnZhciBBYnN0cmFjdENhdGVnb3J5TG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9BYnN0cmFjdENhdGVnb3J5TG9nZ2VyXCIpO1xuLyoqXG4gKiBMb2dnZXIgd2hpY2ggYnVmZmVycyBhbGwgbWVzc2FnZXMsIHVzZSB3aXRoIGNhcmUgZHVlIHRvIHBvc3NpYmxlIGhpZ2ggbWVtb3J5IGZvb3RwcmludC5cbiAqIENhbiBiZSBjb252ZW5pZW50IGluIHNvbWUgY2FzZXMuIENhbGwgdG9TdHJpbmcoKSBmb3IgZnVsbCBvdXRwdXQsIG9yIGNhc3QgdG8gdGhpcyBjbGFzc1xuICogYW5kIGNhbGwgZ2V0TWVzc2FnZXMoKSB0byBkbyBzb21ldGhpbmcgd2l0aCBpdCB5b3Vyc2VsZi5cbiAqL1xudmFyIENhdGVnb3J5TWVzc2FnZUJ1ZmZlckxvZ2dlckltcGwgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKENhdGVnb3J5TWVzc2FnZUJ1ZmZlckxvZ2dlckltcGwsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gQ2F0ZWdvcnlNZXNzYWdlQnVmZmVyTG9nZ2VySW1wbCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLm1lc3NhZ2VzID0gW107XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgQ2F0ZWdvcnlNZXNzYWdlQnVmZmVyTG9nZ2VySW1wbC5wcm90b3R5cGUuZ2V0TWVzc2FnZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lc3NhZ2VzO1xuICAgIH07XG4gICAgQ2F0ZWdvcnlNZXNzYWdlQnVmZmVyTG9nZ2VySW1wbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lc3NhZ2VzLm1hcChmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgICAgICByZXR1cm4gbXNnO1xuICAgICAgICB9KS5qb2luKFwiXFxuXCIpO1xuICAgIH07XG4gICAgQ2F0ZWdvcnlNZXNzYWdlQnVmZmVyTG9nZ2VySW1wbC5wcm90b3R5cGUuZG9Mb2cgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgIHZhciBtZXNzYWdlRm9ybWF0dGVyID0gdGhpcy5fZ2V0TWVzc2FnZUZvcm1hdHRlcigpO1xuICAgICAgICB2YXIgZnVsbE1zZztcbiAgICAgICAgaWYgKG1lc3NhZ2VGb3JtYXR0ZXIgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGZ1bGxNc2cgPSB0aGlzLmNyZWF0ZURlZmF1bHRMb2dNZXNzYWdlKG1zZyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmdWxsTXNnID0gbWVzc2FnZUZvcm1hdHRlcihtc2cpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWVzc2FnZXMucHVzaChmdWxsTXNnKTtcbiAgICB9O1xuICAgIHJldHVybiBDYXRlZ29yeU1lc3NhZ2VCdWZmZXJMb2dnZXJJbXBsO1xufShBYnN0cmFjdENhdGVnb3J5TG9nZ2VyXzEuQWJzdHJhY3RDYXRlZ29yeUxvZ2dlcikpO1xuZXhwb3J0cy5DYXRlZ29yeU1lc3NhZ2VCdWZmZXJMb2dnZXJJbXBsID0gQ2F0ZWdvcnlNZXNzYWdlQnVmZmVyTG9nZ2VySW1wbDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUNhdGVnb3J5TWVzc2FnZUJ1ZmZlckltcGwuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNhdGVnb3J5UnVudGltZVNldHRpbmdzID0gdm9pZCAwO1xudmFyIExvZ2dlck9wdGlvbnNfMSA9IHJlcXVpcmUoXCIuLi9Mb2dnZXJPcHRpb25zXCIpO1xuLyoqXG4gKiBSdW50aW1lU2V0dGluZ3MgZm9yIGEgY2F0ZWdvcnksIGF0IHJ1bnRpbWUgdGhlc2UgYXJlIGFzc29jaWF0ZWQgdG8gYSBjYXRlZ29yeS5cbiAqL1xudmFyIENhdGVnb3J5UnVudGltZVNldHRpbmdzID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhdGVnb3J5UnVudGltZVNldHRpbmdzKGNhdGVnb3J5LCBsb2dMZXZlbCwgbG9nZ2VyVHlwZSwgbG9nRm9ybWF0LCBjYWxsQmFja0xvZ2dlciwgZm9ybWF0dGVyTG9nTWVzc2FnZSkge1xuICAgICAgICBpZiAobG9nTGV2ZWwgPT09IHZvaWQgMCkgeyBsb2dMZXZlbCA9IExvZ2dlck9wdGlvbnNfMS5Mb2dMZXZlbC5FcnJvcjsgfVxuICAgICAgICBpZiAobG9nZ2VyVHlwZSA9PT0gdm9pZCAwKSB7IGxvZ2dlclR5cGUgPSBMb2dnZXJPcHRpb25zXzEuTG9nZ2VyVHlwZS5Db25zb2xlOyB9XG4gICAgICAgIGlmIChsb2dGb3JtYXQgPT09IHZvaWQgMCkgeyBsb2dGb3JtYXQgPSBuZXcgTG9nZ2VyT3B0aW9uc18xLkNhdGVnb3J5TG9nRm9ybWF0KCk7IH1cbiAgICAgICAgaWYgKGNhbGxCYWNrTG9nZ2VyID09PSB2b2lkIDApIHsgY2FsbEJhY2tMb2dnZXIgPSBudWxsOyB9XG4gICAgICAgIGlmIChmb3JtYXR0ZXJMb2dNZXNzYWdlID09PSB2b2lkIDApIHsgZm9ybWF0dGVyTG9nTWVzc2FnZSA9IG51bGw7IH1cbiAgICAgICAgdGhpcy5fZm9ybWF0dGVyTG9nTWVzc2FnZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2NhdGVnb3J5ID0gY2F0ZWdvcnk7XG4gICAgICAgIHRoaXMuX2xvZ0xldmVsID0gbG9nTGV2ZWw7XG4gICAgICAgIHRoaXMuX2xvZ2dlclR5cGUgPSBsb2dnZXJUeXBlO1xuICAgICAgICB0aGlzLl9sb2dGb3JtYXQgPSBsb2dGb3JtYXQ7XG4gICAgICAgIHRoaXMuX2NhbGxCYWNrTG9nZ2VyID0gY2FsbEJhY2tMb2dnZXI7XG4gICAgICAgIHRoaXMuX2Zvcm1hdHRlckxvZ01lc3NhZ2UgPSBmb3JtYXR0ZXJMb2dNZXNzYWdlO1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ2F0ZWdvcnlSdW50aW1lU2V0dGluZ3MucHJvdG90eXBlLCBcImNhdGVnb3J5XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2F0ZWdvcnk7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ2F0ZWdvcnlSdW50aW1lU2V0dGluZ3MucHJvdG90eXBlLCBcImxvZ0xldmVsXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9nTGV2ZWw7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dMZXZlbCA9IHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENhdGVnb3J5UnVudGltZVNldHRpbmdzLnByb3RvdHlwZSwgXCJsb2dnZXJUeXBlXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9nZ2VyVHlwZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ2dlclR5cGUgPSB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYXRlZ29yeVJ1bnRpbWVTZXR0aW5ncy5wcm90b3R5cGUsIFwibG9nRm9ybWF0XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9nRm9ybWF0O1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fbG9nRm9ybWF0ID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ2F0ZWdvcnlSdW50aW1lU2V0dGluZ3MucHJvdG90eXBlLCBcImNhbGxCYWNrTG9nZ2VyXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2FsbEJhY2tMb2dnZXI7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWxsQmFja0xvZ2dlciA9IHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENhdGVnb3J5UnVudGltZVNldHRpbmdzLnByb3RvdHlwZSwgXCJmb3JtYXR0ZXJMb2dNZXNzYWdlXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZm9ybWF0dGVyTG9nTWVzc2FnZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX2Zvcm1hdHRlckxvZ01lc3NhZ2UgPSB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIHJldHVybiBDYXRlZ29yeVJ1bnRpbWVTZXR0aW5ncztcbn0oKSk7XG5leHBvcnRzLkNhdGVnb3J5UnVudGltZVNldHRpbmdzID0gQ2F0ZWdvcnlSdW50aW1lU2V0dGluZ3M7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1DYXRlZ29yeVJ1bnRpbWVTZXR0aW5ncy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2F0ZWdvcnlTZXJ2aWNlSW1wbCA9IHZvaWQgMDtcbnZhciBEYXRhU3RydWN0dXJlc18xID0gcmVxdWlyZShcIi4uLy4uL3V0aWxzL0RhdGFTdHJ1Y3R1cmVzXCIpO1xudmFyIExvZ2dlck9wdGlvbnNfMSA9IHJlcXVpcmUoXCIuLi9Mb2dnZXJPcHRpb25zXCIpO1xudmFyIENhdGVnb3J5Q29uc29sZUxvZ2dlckltcGxfMSA9IHJlcXVpcmUoXCIuL0NhdGVnb3J5Q29uc29sZUxvZ2dlckltcGxcIik7XG52YXIgQ2F0ZWdvcnlEZWxlZ2F0ZUxvZ2dlckltcGxfMSA9IHJlcXVpcmUoXCIuL0NhdGVnb3J5RGVsZWdhdGVMb2dnZXJJbXBsXCIpO1xudmFyIENhdGVnb3J5RXh0ZW5zaW9uTG9nZ2VySW1wbF8xID0gcmVxdWlyZShcIi4vQ2F0ZWdvcnlFeHRlbnNpb25Mb2dnZXJJbXBsXCIpO1xudmFyIENhdGVnb3J5TWVzc2FnZUJ1ZmZlckltcGxfMSA9IHJlcXVpcmUoXCIuL0NhdGVnb3J5TWVzc2FnZUJ1ZmZlckltcGxcIik7XG52YXIgRXh0ZW5zaW9uSGVscGVyXzEgPSByZXF1aXJlKFwiLi4vLi4vZXh0ZW5zaW9uL0V4dGVuc2lvbkhlbHBlclwiKTtcbnZhciBDYXRlZ29yeVJ1bnRpbWVTZXR0aW5nc18xID0gcmVxdWlyZShcIi4vQ2F0ZWdvcnlSdW50aW1lU2V0dGluZ3NcIik7XG52YXIgQ2F0ZWdvcnlDb25maWd1cmF0aW9uXzEgPSByZXF1aXJlKFwiLi9DYXRlZ29yeUNvbmZpZ3VyYXRpb25cIik7XG4vKipcbiAqIFRoZSBzZXJ2aWNlIChvbmx5IGF2YWlsYWJsZSBhcyBzaW5nbGV0b24pIGZvciBhbGwgY2F0ZWdvcnkgcmVsYXRlZCBzdHVmZiBhc1xuICogcmV0cmlldmluZywgcmVnaXN0ZXJpbmcgYSBsb2dnZXIuIFlvdSBzaG91bGQgbm9ybWFsbHkgTk9UIHVzZSB0aGlzLFxuICogaW5zdGVhZCB1c2UgQ2F0ZWdvcnlTZXJ2aWNlRmFjdG9yeSB3aGljaCBpcyBtZWFudCBmb3IgZW5kIHVzZXJzLlxuICovXG52YXIgQ2F0ZWdvcnlTZXJ2aWNlSW1wbCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYXRlZ29yeVNlcnZpY2VJbXBsKCkge1xuICAgICAgICB0aGlzLl9kZWZhdWx0Q29uZmlnID0gbmV3IENhdGVnb3J5Q29uZmlndXJhdGlvbl8xLkNhdGVnb3J5Q29uZmlndXJhdGlvbigpO1xuICAgICAgICB0aGlzLl9tYXBTdGF0ZSA9IG5ldyBEYXRhU3RydWN0dXJlc18xLlNpbXBsZU1hcCgpO1xuICAgICAgICAvLyBQcml2YXRlIGNvbnN0cnVjdG9yXG4gICAgICAgIEV4dGVuc2lvbkhlbHBlcl8xLkV4dGVuc2lvbkhlbHBlci5yZWdpc3RlcigpO1xuICAgIH1cbiAgICBDYXRlZ29yeVNlcnZpY2VJbXBsLmdldEluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBMb2FkIG9uLWRlbWFuZCwgdG8gYXNzdXJlIHdlYnBhY2sgb3JkZXJpbmcgb2YgbW9kdWxlIHVzYWdlIGRvZXNuJ3Qgc2NyZXcgdGhpbmdzIG92ZXJcbiAgICAgICAgLy8gZm9yIHVzIHdoZW4gd2UgYWNjaWRlbnRhbGx5IGNoYW5nZSB0aGUgb3JkZXIuXG4gICAgICAgIGlmIChDYXRlZ29yeVNlcnZpY2VJbXBsLl9JTlNUQU5DRSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgQ2F0ZWdvcnlTZXJ2aWNlSW1wbC5fSU5TVEFOQ0UgPSBuZXcgQ2F0ZWdvcnlTZXJ2aWNlSW1wbCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBDYXRlZ29yeVNlcnZpY2VJbXBsLl9JTlNUQU5DRTtcbiAgICB9O1xuICAgIENhdGVnb3J5U2VydmljZUltcGwucHJvdG90eXBlLmdldExvZ2dlciA9IGZ1bmN0aW9uIChjYXRlZ29yeSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVPckdldENhdGVnb3J5U3RhdGUoY2F0ZWdvcnkpLmxvZ2dlcjtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENsZWFycyBldmVyeXRoaW5nLCBpbmNsdWRpbmcgYSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24geW91IG1heSBoYXZlIHNldC5cbiAgICAgKiBBZnRlciB0aGlzIHlvdSBuZWVkIHRvIHJlLXJlZ2lzdGVyIHlvdXIgY2F0ZWdvcmllcyBldGMuXG4gICAgICovXG4gICAgQ2F0ZWdvcnlTZXJ2aWNlSW1wbC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX21hcFN0YXRlLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuc2V0RGVmYXVsdENvbmZpZ3VyYXRpb24obmV3IENhdGVnb3J5Q29uZmlndXJhdGlvbl8xLkNhdGVnb3J5Q29uZmlndXJhdGlvbigpKTtcbiAgICB9O1xuICAgIENhdGVnb3J5U2VydmljZUltcGwucHJvdG90eXBlLmdldENhdGVnb3J5U2V0dGluZ3MgPSBmdW5jdGlvbiAoY2F0ZWdvcnkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlT3JHZXRDYXRlZ29yeVN0YXRlKGNhdGVnb3J5KS5jdXJyZW50UnVudGltZVNldHRpbmdzO1xuICAgIH07XG4gICAgQ2F0ZWdvcnlTZXJ2aWNlSW1wbC5wcm90b3R5cGUuZ2V0T3JpZ2luYWxDYXRlZ29yeVNldHRpbmdzID0gZnVuY3Rpb24gKGNhdGVnb3J5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU9yR2V0Q2F0ZWdvcnlTdGF0ZShjYXRlZ29yeSkub3JpZ2luYWxSdW50aW1lU2V0dGluZ3M7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbi4gTmV3IHJvb3QgbG9nZ2VycyBjcmVhdGVkIGdldCB0aGlzXG4gICAgICogYXBwbGllZC4gSWYgeW91IHdhbnQgdG8gcmVzZXQgYWxsIGN1cnJlbnQgbG9nZ2VycyB0byBoYXZlIHRoaXNcbiAgICAgKiBhcHBsaWVkIGFzIHdlbGwsIHBhc3MgaW4gcmVzZXQ9dHJ1ZSAodGhlIGRlZmF1bHQgaXMgZmFsc2UpLiBBbGxcbiAgICAgKiBjYXRlZ29yaWVzIHdpbGwgYmUgcmVzZXQgdGhlbiBhcyB3ZWxsLlxuICAgICAqIEBwYXJhbSBjb25maWcgTmV3IGNvbmZpZ1xuICAgICAqIEBwYXJhbSByZXNldCBEZWZhdWx0cyB0byB0cnVlLiBTZXQgdG8gdHJ1ZSB0byByZXNldCBhbGwgbG9nZ2VycyBhbmQgY3VycmVudCBydW50aW1lc2V0dGluZ3MuXG4gICAgICovXG4gICAgQ2F0ZWdvcnlTZXJ2aWNlSW1wbC5wcm90b3R5cGUuc2V0RGVmYXVsdENvbmZpZ3VyYXRpb24gPSBmdW5jdGlvbiAoY29uZmlnLCByZXNldCkge1xuICAgICAgICBpZiAocmVzZXQgPT09IHZvaWQgMCkgeyByZXNldCA9IHRydWU7IH1cbiAgICAgICAgdGhpcy5fZGVmYXVsdENvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgaWYgKHJlc2V0KSB7XG4gICAgICAgICAgICB0aGlzLl9tYXBTdGF0ZS5mb3JFYWNoVmFsdWUoZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgICAgICAgICAgc3RhdGUudXBkYXRlU2V0dGluZ3MoY29uZmlnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTZXQgbmV3IGNvbmZpZ3VyYXRpb24gc2V0dGluZ3MgZm9yIGEgY2F0ZWdvcnkgKGFuZCBwb3NzaWJseSBpdHMgY2hpbGQgY2F0ZWdvcmllcylcbiAgICAgKiBAcGFyYW0gY29uZmlnIENvbmZpZ1xuICAgICAqIEBwYXJhbSBjYXRlZ29yeSBDYXRlZ29yeVxuICAgICAqIEBwYXJhbSBhcHBseUNoaWxkcmVuIFRydWUgdG8gYXBwbHkgdG8gY2hpbGQgY2F0ZWdvcmllcywgZGVmYXVsdHMgdG8gZmFsc2UuXG4gICAgICovXG4gICAgQ2F0ZWdvcnlTZXJ2aWNlSW1wbC5wcm90b3R5cGUuc2V0Q29uZmlndXJhdGlvbkNhdGVnb3J5ID0gZnVuY3Rpb24gKGNvbmZpZywgY2F0ZWdvcnksIGFwcGx5Q2hpbGRyZW4pIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKGFwcGx5Q2hpbGRyZW4gPT09IHZvaWQgMCkgeyBhcHBseUNoaWxkcmVuID0gZmFsc2U7IH1cbiAgICAgICAgdGhpcy5jcmVhdGVPckdldENhdGVnb3J5U3RhdGUoY2F0ZWdvcnkpLnVwZGF0ZVNldHRpbmdzKGNvbmZpZyk7XG4gICAgICAgIC8vIEFwcGx5IHRoZSBzZXR0aW5ncyB0byBjaGlsZHJlbiByZWN1cnNpdmUgaWYgcmVxdWVzdGVkXG4gICAgICAgIGlmIChhcHBseUNoaWxkcmVuKSB7XG4gICAgICAgICAgICBjYXRlZ29yeS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgICAgICAgICAgIC8vIEZhbHNlIGZsYWcsIGEgY2hpbGQgY2Fubm90IHJlc2V0IGEgcm9vdGxvZ2dlclxuICAgICAgICAgICAgICAgIF90aGlzLnNldENvbmZpZ3VyYXRpb25DYXRlZ29yeShjb25maWcsIGNoaWxkLCBhcHBseUNoaWxkcmVuKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBDYXRlZ29yeVNlcnZpY2VJbXBsLnByb3RvdHlwZS5yZWdpc3RlckNhdGVnb3J5ID0gZnVuY3Rpb24gKGNhdGVnb3J5KSB7XG4gICAgICAgIGlmIChjYXRlZ29yeSA9PT0gbnVsbCB8fCB0eXBlb2YgY2F0ZWdvcnkgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhdGVnb3J5IENBTk5PVCBiZSBudWxsL3VuZGVmaW5lZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fbWFwU3RhdGUuZXhpc3RzKENhdGVnb3J5U2VydmljZUltcGwuZ2V0Q2F0ZWdvcnlLZXkoY2F0ZWdvcnkpKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGFkZCB0aGlzIHJvb3QgY2F0ZWdvcnkgd2l0aCBuYW1lOiBcIiArIGNhdGVnb3J5Lm5hbWUgKyBcIiwgaXQgYWxyZWFkeSBleGlzdHMgKHNhbWUgbmFtZSBpbiBoaWVyYXJjaHkpLlwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNyZWF0ZU9yR2V0Q2F0ZWdvcnlTdGF0ZShjYXRlZ29yeSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBVc2VkIHRvIGVuYWJsZSBpbnRlZ3JhdGlvbiB3aXRoIGNocm9tZSBleHRlbnNpb24uIERvIG5vdCB1c2UgbWFudWFsbHksIHRoZVxuICAgICAqIGV4dGVuc2lvbiBhbmQgdGhlIGxvZ2dlciBmcmFtZXdvcmsgZGVhbCB3aXRoIHRoaXMuXG4gICAgICovXG4gICAgQ2F0ZWdvcnlTZXJ2aWNlSW1wbC5wcm90b3R5cGUuZW5hYmxlRXh0ZW5zaW9uSW50ZWdyYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuX21hcFN0YXRlLmZvckVhY2hWYWx1ZShmdW5jdGlvbiAoc3RhdGUpIHsgcmV0dXJuIHN0YXRlLmVuYWJsZUZvckV4dGVuc2lvbihfdGhpcyk7IH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJuIGFsbCByb290IGNhdGVnb3JpZXMgY3VycmVudGx5IHJlZ2lzdGVyZWQuXG4gICAgICovXG4gICAgQ2F0ZWdvcnlTZXJ2aWNlSW1wbC5wcm90b3R5cGUuZ2V0Um9vdENhdGVnb3JpZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXBTdGF0ZS52YWx1ZXMoKS5maWx0ZXIoZnVuY3Rpb24gKHN0YXRlKSB7IHJldHVybiBzdGF0ZS5jYXRlZ29yeS5wYXJlbnQgPT0gbnVsbDsgfSkubWFwKGZ1bmN0aW9uIChzdGF0ZSkgeyByZXR1cm4gc3RhdGUuY2F0ZWdvcnk7IH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJuIENhdGVnb3J5IGJ5IGlkXG4gICAgICogQHBhcmFtIGlkIFRoZSBpZCBvZiB0aGUgY2F0ZWdvcnkgdG8gZmluZFxuICAgICAqIEByZXR1cm5zIHtDYXRlZ29yeX0gb3IgbnVsbCBpZiBub3QgZm91bmRcbiAgICAgKi9cbiAgICBDYXRlZ29yeVNlcnZpY2VJbXBsLnByb3RvdHlwZS5nZXRDYXRlZ29yeUJ5SWQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX21hcFN0YXRlLnZhbHVlcygpLmZpbHRlcihmdW5jdGlvbiAoc3RhdGUpIHsgcmV0dXJuIHN0YXRlLmNhdGVnb3J5LmlkID09PSBpZDsgfSkubWFwKGZ1bmN0aW9uIChzdGF0ZSkgeyByZXR1cm4gc3RhdGUuY2F0ZWdvcnk7IH0pO1xuICAgICAgICBpZiAocmVzdWx0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFswXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuICAgIENhdGVnb3J5U2VydmljZUltcGwucHJvdG90eXBlLmNyZWF0ZU9yR2V0Q2F0ZWdvcnlTdGF0ZSA9IGZ1bmN0aW9uIChjYXRlZ29yeSkge1xuICAgICAgICB2YXIga2V5ID0gQ2F0ZWdvcnlTZXJ2aWNlSW1wbC5nZXRDYXRlZ29yeUtleShjYXRlZ29yeSk7XG4gICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuX21hcFN0YXRlLmdldChrZXkpO1xuICAgICAgICBpZiAodHlwZW9mIHN0YXRlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5ld1N0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZShjYXRlZ29yeSk7XG4gICAgICAgIHRoaXMuX21hcFN0YXRlLnB1dChrZXksIG5ld1N0YXRlKTtcbiAgICAgICAgcmV0dXJuIG5ld1N0YXRlO1xuICAgIH07XG4gICAgQ2F0ZWdvcnlTZXJ2aWNlSW1wbC5wcm90b3R5cGUuY3JlYXRlU3RhdGUgPSBmdW5jdGlvbiAoY2F0ZWdvcnkpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgcmV0dXJuIG5ldyBDYXRlZ29yeVN0YXRlKGNhdGVnb3J5LCBmdW5jdGlvbiAoKSB7IHJldHVybiBfdGhpcy5fZGVmYXVsdENvbmZpZzsgfSwgZnVuY3Rpb24gKGNvbmZpZywgY2F0KSB7IHJldHVybiBfdGhpcy5jcmVhdGVMb2dnZXIoY29uZmlnLCBjYXQpOyB9KTtcbiAgICB9O1xuICAgIENhdGVnb3J5U2VydmljZUltcGwucHJvdG90eXBlLmNyZWF0ZUxvZ2dlciA9IGZ1bmN0aW9uIChjb25maWcsIGNhdGVnb3J5KSB7XG4gICAgICAgIC8vIERlZmF1bHQgaXMgYWx3YXlzIGEgY29uc29sZSBsb2dnZXJcbiAgICAgICAgc3dpdGNoIChjb25maWcubG9nZ2VyVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBMb2dnZXJPcHRpb25zXzEuTG9nZ2VyVHlwZS5Db25zb2xlOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ2F0ZWdvcnlDb25zb2xlTG9nZ2VySW1wbF8xLkNhdGVnb3J5Q29uc29sZUxvZ2dlckltcGwoY2F0ZWdvcnksIHRoaXMpO1xuICAgICAgICAgICAgY2FzZSBMb2dnZXJPcHRpb25zXzEuTG9nZ2VyVHlwZS5NZXNzYWdlQnVmZmVyOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ2F0ZWdvcnlNZXNzYWdlQnVmZmVySW1wbF8xLkNhdGVnb3J5TWVzc2FnZUJ1ZmZlckxvZ2dlckltcGwoY2F0ZWdvcnksIHRoaXMpO1xuICAgICAgICAgICAgY2FzZSBMb2dnZXJPcHRpb25zXzEuTG9nZ2VyVHlwZS5DdXN0b206XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5jYWxsQmFja0xvZ2dlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY3JlYXRlIGN1c3RvbSBsb2dnZXIsIGN1c3RvbSBjYWxsYmFjayBpcyBudWxsXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5jYWxsQmFja0xvZ2dlcihjYXRlZ29yeSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY3JlYXRlIGEgTG9nZ2VyIGZvciBMb2dnZXJUeXBlOiBcIiArIGNvbmZpZy5sb2dnZXJUeXBlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQ2F0ZWdvcnlTZXJ2aWNlSW1wbC5nZXRDYXRlZ29yeUtleSA9IGZ1bmN0aW9uIChjYXRlZ29yeSkge1xuICAgICAgICByZXR1cm4gY2F0ZWdvcnkuZ2V0Q2F0ZWdvcnlQYXRoKCk7XG4gICAgfTtcbiAgICAvLyBTaW5nbGV0b24gY2F0ZWdvcnkgc2VydmljZSwgdXNlZCBieSBDYXRlZ29yeVNlcnZpY2VGYWN0b3J5IGFzIHdlbGwgYXMgQ2F0ZWdvcmllcy5cbiAgICAvLyBMb2FkZWQgb24gZGVtYW5kLiBEbyBOT1QgY2hhbmdlIGFzIHdlYnBhY2sgbWF5IHBhY2sgdGhpbmdzIGluIHdyb25nIG9yZGVyIG90aGVyd2lzZS5cbiAgICBDYXRlZ29yeVNlcnZpY2VJbXBsLl9JTlNUQU5DRSA9IG51bGw7XG4gICAgcmV0dXJuIENhdGVnb3J5U2VydmljZUltcGw7XG59KCkpO1xuZXhwb3J0cy5DYXRlZ29yeVNlcnZpY2VJbXBsID0gQ2F0ZWdvcnlTZXJ2aWNlSW1wbDtcbnZhciBDYXRlZ29yeVN0YXRlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhdGVnb3J5U3RhdGUoY2F0ZWdvcnksIGRlZmF1bHRDb25maWcsIGNyZWF0ZUxvZ2dlcikge1xuICAgICAgICB0aGlzLl9jYXRlZ29yeSA9IGNhdGVnb3J5O1xuICAgICAgICB0aGlzLl9sYXp5U3RhdGUgPSBuZXcgTGF6eVN0YXRlKGNhdGVnb3J5LCBkZWZhdWx0Q29uZmlnLCBjcmVhdGVMb2dnZXIpO1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ2F0ZWdvcnlTdGF0ZS5wcm90b3R5cGUsIFwiY2F0ZWdvcnlcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jYXRlZ29yeTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYXRlZ29yeVN0YXRlLnByb3RvdHlwZSwgXCJsb2dnZXJcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sYXp5U3RhdGUuZ2V0TG9nZ2VyKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ2F0ZWdvcnlTdGF0ZS5wcm90b3R5cGUsIFwib3JpZ2luYWxSdW50aW1lU2V0dGluZ3NcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sYXp5U3RhdGUuZ2V0T3JpZ2luYWxSdW50aW1lU2V0dGluZ3MoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYXRlZ29yeVN0YXRlLnByb3RvdHlwZSwgXCJjdXJyZW50UnVudGltZVNldHRpbmdzXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbGF6eVN0YXRlLmdldEN1cnJlbnRSdW50aW1lU2V0dGluZ3MoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIENhdGVnb3J5U3RhdGUucHJvdG90eXBlLmVuYWJsZUZvckV4dGVuc2lvbiA9IGZ1bmN0aW9uIChydW50aW1lU2V0dGluZ3MpIHtcbiAgICAgICAgdGhpcy5fbGF6eVN0YXRlLmVuYWJsZUZvckV4dGVuc2lvbihydW50aW1lU2V0dGluZ3MpO1xuICAgIH07XG4gICAgQ2F0ZWdvcnlTdGF0ZS5wcm90b3R5cGUudXBkYXRlU2V0dGluZ3MgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgIHRoaXMuX2xhenlTdGF0ZS51cGRhdGVTZXR0aW5ncyhjb25maWcpO1xuICAgIH07XG4gICAgcmV0dXJuIENhdGVnb3J5U3RhdGU7XG59KCkpO1xudmFyIExhenlTdGF0ZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBMYXp5U3RhdGUoY2F0ZWdvcnksIGRlZmF1bHRDb25maWcsIGNyZWF0ZUxvZ2dlcikge1xuICAgICAgICB0aGlzLl9jYXRlZ29yeSA9IGNhdGVnb3J5O1xuICAgICAgICB0aGlzLl9kZWZhdWx0Q29uZmlnID0gZGVmYXVsdENvbmZpZztcbiAgICAgICAgdGhpcy5fY3JlYXRlTG9nZ2VyID0gY3JlYXRlTG9nZ2VyO1xuICAgIH1cbiAgICBMYXp5U3RhdGUucHJvdG90eXBlLmlzTG9hZGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gKHR5cGVvZiB0aGlzLl9sb2dnZXIgIT09IFwidW5kZWZpbmVkXCIpO1xuICAgIH07XG4gICAgTGF6eVN0YXRlLnByb3RvdHlwZS5nZXRMb2dnZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubG9hZExvZ2dlck9uRGVtYW5kKCk7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWxlZ2F0ZUxvZ2dlcjtcbiAgICB9O1xuICAgIExhenlTdGF0ZS5wcm90b3R5cGUuZ2V0T3JpZ2luYWxSdW50aW1lU2V0dGluZ3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubG9hZExvZ2dlck9uRGVtYW5kKCk7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcmlnaW5hbFJ1bnRpbWVTZXR0aW5ncztcbiAgICB9O1xuICAgIExhenlTdGF0ZS5wcm90b3R5cGUuZ2V0Q3VycmVudFJ1bnRpbWVTZXR0aW5ncyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5sb2FkTG9nZ2VyT25EZW1hbmQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRSdW50aW1lU2V0dGluZ3M7XG4gICAgfTtcbiAgICBMYXp5U3RhdGUucHJvdG90eXBlLmVuYWJsZUZvckV4dGVuc2lvbiA9IGZ1bmN0aW9uIChydW50aW1lU2V0dGluZ3MpIHtcbiAgICAgICAgdGhpcy5sb2FkTG9nZ2VyT25EZW1hbmQoKTtcbiAgICAgICAgaWYgKCEodGhpcy5fd3JhcHBlZExvZ2dlciBpbnN0YW5jZW9mIENhdGVnb3J5RXh0ZW5zaW9uTG9nZ2VySW1wbF8xLkNhdGVnb3J5RXh0ZW5zaW9uTG9nZ2VySW1wbCkpIHtcbiAgICAgICAgICAgIC8qIHRzbGludDpkaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVjb25maWd1cmluZyBsb2dnZXIgZm9yIGV4dGVuc2lvbiBmb3IgY2F0ZWdvcnk6IFwiICsgdGhpcy5fY2F0ZWdvcnkubmFtZSk7XG4gICAgICAgICAgICAvKiB0c2xpbnQ6ZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgICAgICAgICAgIHRoaXMuX3dyYXBwZWRMb2dnZXIgPSBuZXcgQ2F0ZWdvcnlFeHRlbnNpb25Mb2dnZXJJbXBsXzEuQ2F0ZWdvcnlFeHRlbnNpb25Mb2dnZXJJbXBsKHRoaXMuX2NhdGVnb3J5LCBydW50aW1lU2V0dGluZ3MpO1xuICAgICAgICAgICAgdGhpcy5fZGVsZWdhdGVMb2dnZXIuZGVsZWdhdGUgPSB0aGlzLl93cmFwcGVkTG9nZ2VyO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBMYXp5U3RhdGUucHJvdG90eXBlLnVwZGF0ZVNldHRpbmdzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICBpZiAodGhpcy5pc0xvYWRlZCgpKSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50UnVudGltZVNldHRpbmdzLmxvZ0xldmVsID0gY29uZmlnLmxvZ0xldmVsO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFJ1bnRpbWVTZXR0aW5ncy5sb2dnZXJUeXBlID0gY29uZmlnLmxvZ2dlclR5cGU7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50UnVudGltZVNldHRpbmdzLmxvZ0Zvcm1hdCA9IGNvbmZpZy5sb2dGb3JtYXQ7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50UnVudGltZVNldHRpbmdzLmNhbGxCYWNrTG9nZ2VyID0gY29uZmlnLmNhbGxCYWNrTG9nZ2VyO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFJ1bnRpbWVTZXR0aW5ncy5mb3JtYXR0ZXJMb2dNZXNzYWdlID0gY29uZmlnLmZvcm1hdHRlckxvZ01lc3NhZ2U7XG4gICAgICAgICAgICAvLyBSZXBsYWNlIHRoZSByZWFsIGxvZ2dlciwgaXQgbWF5IGhhdmUgY2hhbmdlZC5cbiAgICAgICAgICAgIHRoaXMuX2xvZ2dlciA9IHRoaXMuX2NyZWF0ZUxvZ2dlcihjb25maWcsIHRoaXMuX2NhdGVnb3J5KTtcbiAgICAgICAgICAgIGlmICghKHRoaXMuX3dyYXBwZWRMb2dnZXIgaW5zdGFuY2VvZiBDYXRlZ29yeUV4dGVuc2lvbkxvZ2dlckltcGxfMS5DYXRlZ29yeUV4dGVuc2lvbkxvZ2dlckltcGwpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fd3JhcHBlZExvZ2dlciA9IHRoaXMuX2xvZ2dlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2RlbGVnYXRlTG9nZ2VyLmRlbGVnYXRlID0gdGhpcy5fd3JhcHBlZExvZ2dlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFNldCB0aGlzIGNvbmZpZywgaXQgbWF5IGJlIGZvciB0aGUgY2F0ZWdvcnkgc3BlY2lmaWMsIHRoZSBkZWZhdWx0IGlzIHRoZXJlZm9yZSBub3QgZ29vZCBlbm91Z2guXG4gICAgICAgICAgICB0aGlzLl9kZWZhdWx0Q29uZmlnID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gY29uZmlnOyB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICBMYXp5U3RhdGUucHJvdG90eXBlLmxvYWRMb2dnZXJPbkRlbWFuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzTG9hZGVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ2dlciA9IHRoaXMuX2NyZWF0ZUxvZ2dlcih0aGlzLl9kZWZhdWx0Q29uZmlnKCksIHRoaXMuX2NhdGVnb3J5KTtcbiAgICAgICAgICAgIHRoaXMuX3dyYXBwZWRMb2dnZXIgPSB0aGlzLl9sb2dnZXI7XG4gICAgICAgICAgICB0aGlzLl9kZWxlZ2F0ZUxvZ2dlciA9IG5ldyBDYXRlZ29yeURlbGVnYXRlTG9nZ2VySW1wbF8xLkNhdGVnb3J5RGVsZWdhdGVMb2dnZXJJbXBsKHRoaXMuX3dyYXBwZWRMb2dnZXIpO1xuICAgICAgICAgICAgdGhpcy5fb3JpZ2luYWxSdW50aW1lU2V0dGluZ3MgPSB0aGlzLmluaXROZXdTZXR0aW5ncygpO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFJ1bnRpbWVTZXR0aW5ncyA9IHRoaXMuaW5pdE5ld1NldHRpbmdzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIExhenlTdGF0ZS5wcm90b3R5cGUuaW5pdE5ld1NldHRpbmdzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZGVmU2V0dGluZ3MgPSB0aGlzLl9kZWZhdWx0Q29uZmlnKCkuY29weSgpO1xuICAgICAgICByZXR1cm4gbmV3IENhdGVnb3J5UnVudGltZVNldHRpbmdzXzEuQ2F0ZWdvcnlSdW50aW1lU2V0dGluZ3ModGhpcy5fY2F0ZWdvcnksIGRlZlNldHRpbmdzLmxvZ0xldmVsLCBkZWZTZXR0aW5ncy5sb2dnZXJUeXBlLCBkZWZTZXR0aW5ncy5sb2dGb3JtYXQsIGRlZlNldHRpbmdzLmNhbGxCYWNrTG9nZ2VyLCBkZWZTZXR0aW5ncy5mb3JtYXR0ZXJMb2dNZXNzYWdlKTtcbiAgICB9O1xuICAgIHJldHVybiBMYXp5U3RhdGU7XG59KCkpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Q2F0ZWdvcnlTZXJ2aWNlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5DYXRlZ29yeVNlcnZpY2VGYWN0b3J5ID0gdm9pZCAwO1xudmFyIENhdGVnb3J5U2VydmljZV8xID0gcmVxdWlyZShcIi4vQ2F0ZWdvcnlTZXJ2aWNlXCIpO1xuLyoqXG4gKiBDYXRlZ29yaXplZCBzZXJ2aWNlIGZvciBsb2dnaW5nLCB3aGVyZSBsb2dnaW5nIGlzIGJvdW5kIHRvIGNhdGVnb3JpZXMgd2hpY2hcbiAqIGNhbiBsb2cgaG9yaXpvbnRhbGx5IHRocm91Z2ggc3BlY2lmaWMgYXBwbGljYXRpb24gbG9naWMgKHNlcnZpY2VzLCBncm91cChzKSBvZiBjb21wb25lbnRzIGV0YykuXG4gKiBGb3IgdGhlIHN0YW5kYXJkIHdheSBvZiBsb2dnaW5nIGxpa2UgbW9zdCBmcmFtZXdvcmtzIGRvIHRoZXNlIGRheXMsIHVzZSBMRlNlcnZpY2UgaW5zdGVhZC5cbiAqIElmIHlvdSB3YW50IGZpbmUgZ3JhaW5lZCBjb250cm9sIHRvIGRpdmlkZSBzZWN0aW9ucyBvZiB5b3VyIGFwcGxpY2F0aW9uIGluXG4gKiBsb2dpY2FsIHVuaXRzIHRvIGVuYWJsZS9kaXNhYmxlIGxvZ2dpbmcgZm9yLCB0aGlzIGlzIHRoZSBzZXJ2aWNlIHlvdSB3YW50IHRvIHVzZSBpbnN0ZWFkLlxuICogQWxzbyBmb3IgdGhpcyB0eXBlIGEgYnJvd3NlciBwbHVnaW4gd2lsbCBiZSBhdmFpbGFibGUuXG4gKi9cbnZhciBDYXRlZ29yeVNlcnZpY2VGYWN0b3J5ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhdGVnb3J5U2VydmljZUZhY3RvcnkoKSB7XG4gICAgICAgIC8vIFByaXZhdGUgY29uc3RydWN0b3IuXG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybiBhIENhdGVnb3J5TG9nZ2VyIGZvciBnaXZlbiBST09UIGNhdGVnb3J5ICh0aHVzIGhhcyBubyBwYXJlbnQpLlxuICAgICAqIFlvdSBjYW4gb25seSByZXRyaWV2ZSBsb2dnZXJzIGZvciB0aGVpciByb290LCB3aGVuIGxvZ2dpbmdcbiAgICAgKiB5b3Ugc3BlY2lmeSB0byBsb2cgZm9yIHdoYXQgKGNoaWxkKWNhdGVnb3JpZXMuXG4gICAgICogQHBhcmFtIHJvb3QgQ2F0ZWdvcnkgcm9vdCAoaGFzIG5vIHBhcmVudClcbiAgICAgKiBAcmV0dXJucyB7Q2F0ZWdvcnlMb2dnZXJ9XG4gICAgICovXG4gICAgQ2F0ZWdvcnlTZXJ2aWNlRmFjdG9yeS5nZXRMb2dnZXIgPSBmdW5jdGlvbiAocm9vdCkge1xuICAgICAgICByZXR1cm4gQ2F0ZWdvcnlTZXJ2aWNlXzEuQ2F0ZWdvcnlTZXJ2aWNlSW1wbC5nZXRJbnN0YW5jZSgpLmdldExvZ2dlcihyb290KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENsZWFycyBldmVyeXRoaW5nLCBhbnkgcmVnaXN0ZXJlZCAocm9vdCljYXRlZ29yaWVzIGFuZCBsb2dnZXJzXG4gICAgICogYXJlIGRpc2NhcmRlZC4gUmVzZXRzIHRvIGRlZmF1bHQgY29uZmlndXJhdGlvbi5cbiAgICAgKi9cbiAgICBDYXRlZ29yeVNlcnZpY2VGYWN0b3J5LmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gQ2F0ZWdvcnlTZXJ2aWNlXzEuQ2F0ZWdvcnlTZXJ2aWNlSW1wbC5nZXRJbnN0YW5jZSgpLmNsZWFyKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbi4gTmV3IHJvb3QgbG9nZ2VycyBjcmVhdGVkIGdldCB0aGlzXG4gICAgICogYXBwbGllZC4gSWYgeW91IHdhbnQgdG8gcmVzZXQgYWxsIGN1cnJlbnQgbG9nZ2VycyB0byBoYXZlIHRoaXNcbiAgICAgKiBhcHBsaWVkIGFzIHdlbGwsIHBhc3MgaW4gcmVzZXQ9dHJ1ZSAodGhlIGRlZmF1bHQgaXMgZmFsc2UpLiBBbGxcbiAgICAgKiBjYXRlZ29yaWVzIHJ1bnRpbWVzZXR0aW5ncyB3aWxsIGJlIHJlc2V0IHRoZW4gYXMgd2VsbC5cbiAgICAgKiBAcGFyYW0gY29uZmlnIFRoZSBuZXcgZGVmYXVsdCBjb25maWd1cmF0aW9uXG4gICAgICogQHBhcmFtIHJlc2V0IElmIHRydWUsIHdpbGwgcmVzZXQgKmFsbCogcnVudGltZXNldHRpbmdzIGZvciBhbGwgbG9nZ2Vycy9jYXRlZ29yaWVzIHRvIHRoZXNlLiBEZWZhdWx0IGlzIHRydWUuXG4gICAgICovXG4gICAgQ2F0ZWdvcnlTZXJ2aWNlRmFjdG9yeS5zZXREZWZhdWx0Q29uZmlndXJhdGlvbiA9IGZ1bmN0aW9uIChjb25maWcsIHJlc2V0KSB7XG4gICAgICAgIGlmIChyZXNldCA9PT0gdm9pZCAwKSB7IHJlc2V0ID0gdHJ1ZTsgfVxuICAgICAgICBDYXRlZ29yeVNlcnZpY2VfMS5DYXRlZ29yeVNlcnZpY2VJbXBsLmdldEluc3RhbmNlKCkuc2V0RGVmYXVsdENvbmZpZ3VyYXRpb24oY29uZmlnLCByZXNldCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTZXQgbmV3IGNvbmZpZ3VyYXRpb24gc2V0dGluZ3MgZm9yIGEgY2F0ZWdvcnkgKGFuZCBwb3NzaWJseSBpdHMgY2hpbGQgY2F0ZWdvcmllcylcbiAgICAgKiBAcGFyYW0gY29uZmlnIENvbmZpZ1xuICAgICAqIEBwYXJhbSBjYXRlZ29yeSBDYXRlZ29yeVxuICAgICAqIEBwYXJhbSBhcHBseUNoaWxkcmVuIFRydWUgdG8gYXBwbHkgdG8gY2hpbGQgY2F0ZWdvcmllcywgZGVmYXVsdHMgdG8gZmFsc2UuXG4gICAgICovXG4gICAgQ2F0ZWdvcnlTZXJ2aWNlRmFjdG9yeS5zZXRDb25maWd1cmF0aW9uQ2F0ZWdvcnkgPSBmdW5jdGlvbiAoY29uZmlnLCBjYXRlZ29yeSwgYXBwbHlDaGlsZHJlbikge1xuICAgICAgICBpZiAoYXBwbHlDaGlsZHJlbiA9PT0gdm9pZCAwKSB7IGFwcGx5Q2hpbGRyZW4gPSBmYWxzZTsgfVxuICAgICAgICBDYXRlZ29yeVNlcnZpY2VfMS5DYXRlZ29yeVNlcnZpY2VJbXBsLmdldEluc3RhbmNlKCkuc2V0Q29uZmlndXJhdGlvbkNhdGVnb3J5KGNvbmZpZywgY2F0ZWdvcnksIGFwcGx5Q2hpbGRyZW4pO1xuICAgIH07XG4gICAgcmV0dXJuIENhdGVnb3J5U2VydmljZUZhY3Rvcnk7XG59KCkpO1xuZXhwb3J0cy5DYXRlZ29yeVNlcnZpY2VGYWN0b3J5ID0gQ2F0ZWdvcnlTZXJ2aWNlRmFjdG9yeTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUNhdGVnb3J5U2VydmljZUZhY3RvcnkuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkFic3RyYWN0TG9nZ2VyID0gdm9pZCAwO1xudmFyIExvZ2dlck9wdGlvbnNfMSA9IHJlcXVpcmUoXCIuLi9Mb2dnZXJPcHRpb25zXCIpO1xudmFyIERhdGFTdHJ1Y3R1cmVzXzEgPSByZXF1aXJlKFwiLi4vLi4vdXRpbHMvRGF0YVN0cnVjdHVyZXNcIik7XG52YXIgTWVzc2FnZVV0aWxzXzEgPSByZXF1aXJlKFwiLi4vLi4vdXRpbHMvTWVzc2FnZVV0aWxzXCIpO1xudmFyIExvZ01lc3NhZ2VJbnRlcm5hbEltcGwgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTG9nTWVzc2FnZUludGVybmFsSW1wbChsb2dnZXJOYW1lLCBtZXNzYWdlLCBlcnJvckFzU3RhY2ssIGVycm9yLCBsb2dHcm91cFJ1bGUsIGRhdGUsIGxldmVsLCByZWFkeSkge1xuICAgICAgICB0aGlzLl9lcnJvckFzU3RhY2sgPSBudWxsO1xuICAgICAgICB0aGlzLl9lcnJvciA9IG51bGw7XG4gICAgICAgIHRoaXMuX2xvZ2dlck5hbWUgPSBsb2dnZXJOYW1lO1xuICAgICAgICB0aGlzLl9tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgdGhpcy5fZXJyb3JBc1N0YWNrID0gZXJyb3JBc1N0YWNrO1xuICAgICAgICB0aGlzLl9lcnJvciA9IGVycm9yO1xuICAgICAgICB0aGlzLl9sb2dHcm91cFJ1bGUgPSBsb2dHcm91cFJ1bGU7XG4gICAgICAgIHRoaXMuX2RhdGUgPSBkYXRlO1xuICAgICAgICB0aGlzLl9sZXZlbCA9IGxldmVsO1xuICAgICAgICB0aGlzLl9yZWFkeSA9IHJlYWR5O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTG9nTWVzc2FnZUludGVybmFsSW1wbC5wcm90b3R5cGUsIFwibG9nZ2VyTmFtZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xvZ2dlck5hbWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTG9nTWVzc2FnZUludGVybmFsSW1wbC5wcm90b3R5cGUsIFwibWVzc2FnZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2U7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTG9nTWVzc2FnZUludGVybmFsSW1wbC5wcm90b3R5cGUsIFwiZXJyb3JBc1N0YWNrXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZXJyb3JBc1N0YWNrO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fZXJyb3JBc1N0YWNrID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTG9nTWVzc2FnZUludGVybmFsSW1wbC5wcm90b3R5cGUsIFwiZXJyb3JcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9lcnJvcjtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX2Vycm9yID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTG9nTWVzc2FnZUludGVybmFsSW1wbC5wcm90b3R5cGUsIFwibG9nR3JvdXBSdWxlXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9nR3JvdXBSdWxlO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fbG9nR3JvdXBSdWxlID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTG9nTWVzc2FnZUludGVybmFsSW1wbC5wcm90b3R5cGUsIFwiZGF0ZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGU7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRlID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTG9nTWVzc2FnZUludGVybmFsSW1wbC5wcm90b3R5cGUsIFwibGV2ZWxcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sZXZlbDtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX2xldmVsID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTG9nTWVzc2FnZUludGVybmFsSW1wbC5wcm90b3R5cGUsIFwiaXNNZXNzYWdlTG9nRGF0YVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiAodGhpcy5fbWVzc2FnZSkgIT09IFwic3RyaW5nXCI7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTG9nTWVzc2FnZUludGVybmFsSW1wbC5wcm90b3R5cGUsIFwicmVhZHlcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZWFkeTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlYWR5ID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTG9nTWVzc2FnZUludGVybmFsSW1wbC5wcm90b3R5cGUsIFwibWVzc2FnZUFzU3RyaW5nXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mICh0aGlzLl9tZXNzYWdlKSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9tZXNzYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2UubXNnO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KExvZ01lc3NhZ2VJbnRlcm5hbEltcGwucHJvdG90eXBlLCBcImxvZ0RhdGFcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiAodGhpcy5fbWVzc2FnZSkgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLm1lc3NhZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIExvZ01lc3NhZ2VJbnRlcm5hbEltcGw7XG59KCkpO1xuLyoqXG4gKiBBYnN0cmFjdCBiYXNlIGxvZ2dlciwgZXh0ZW5kIHRvIGVhc2lseSBpbXBsZW1lbnQgYSBjdXN0b20gbG9nZ2VyIHRoYXRcbiAqIGxvZ3Mgd2hlcmV2ZXIgeW91IHdhbnQuIFlvdSBvbmx5IG5lZWQgdG8gaW1wbGVtZW50IGRvTG9nKG1zZzogTG9nTWVzc2FnZSkgYW5kXG4gKiBsb2cgdGhhdCBzb21ld2hlcmUgKGl0IHdpbGwgY29udGFpbiBmb3JtYXQgYW5kIGV2ZXJ5dGhpbmcgZWxzZSkuXG4gKi9cbnZhciBBYnN0cmFjdExvZ2dlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBYnN0cmFjdExvZ2dlcihuYW1lLCBsb2dHcm91cFJ1bnRpbWVTZXR0aW5ncykge1xuICAgICAgICB0aGlzLl9hbGxNZXNzYWdlcyA9IG5ldyBEYXRhU3RydWN0dXJlc18xLkxpbmtlZExpc3QoKTtcbiAgICAgICAgdGhpcy5fb3BlbiA9IHRydWU7XG4gICAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLl9sb2dHcm91cFJ1bnRpbWVTZXR0aW5ncyA9IGxvZ0dyb3VwUnVudGltZVNldHRpbmdzO1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQWJzdHJhY3RMb2dnZXIucHJvdG90eXBlLCBcIm5hbWVcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgQWJzdHJhY3RMb2dnZXIucHJvdG90eXBlLnRyYWNlID0gZnVuY3Rpb24gKG1zZywgZXJyb3IpIHtcbiAgICAgICAgaWYgKGVycm9yID09PSB2b2lkIDApIHsgZXJyb3IgPSBudWxsOyB9XG4gICAgICAgIHRoaXMuX2xvZyhMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWwuVHJhY2UsIG1zZywgZXJyb3IpO1xuICAgIH07XG4gICAgQWJzdHJhY3RMb2dnZXIucHJvdG90eXBlLmRlYnVnID0gZnVuY3Rpb24gKG1zZywgZXJyb3IpIHtcbiAgICAgICAgaWYgKGVycm9yID09PSB2b2lkIDApIHsgZXJyb3IgPSBudWxsOyB9XG4gICAgICAgIHRoaXMuX2xvZyhMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWwuRGVidWcsIG1zZywgZXJyb3IpO1xuICAgIH07XG4gICAgQWJzdHJhY3RMb2dnZXIucHJvdG90eXBlLmluZm8gPSBmdW5jdGlvbiAobXNnLCBlcnJvcikge1xuICAgICAgICBpZiAoZXJyb3IgPT09IHZvaWQgMCkgeyBlcnJvciA9IG51bGw7IH1cbiAgICAgICAgdGhpcy5fbG9nKExvZ2dlck9wdGlvbnNfMS5Mb2dMZXZlbC5JbmZvLCBtc2csIGVycm9yKTtcbiAgICB9O1xuICAgIEFic3RyYWN0TG9nZ2VyLnByb3RvdHlwZS53YXJuID0gZnVuY3Rpb24gKG1zZywgZXJyb3IpIHtcbiAgICAgICAgaWYgKGVycm9yID09PSB2b2lkIDApIHsgZXJyb3IgPSBudWxsOyB9XG4gICAgICAgIHRoaXMuX2xvZyhMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWwuV2FybiwgbXNnLCBlcnJvcik7XG4gICAgfTtcbiAgICBBYnN0cmFjdExvZ2dlci5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbiAobXNnLCBlcnJvcikge1xuICAgICAgICBpZiAoZXJyb3IgPT09IHZvaWQgMCkgeyBlcnJvciA9IG51bGw7IH1cbiAgICAgICAgdGhpcy5fbG9nKExvZ2dlck9wdGlvbnNfMS5Mb2dMZXZlbC5FcnJvciwgbXNnLCBlcnJvcik7XG4gICAgfTtcbiAgICBBYnN0cmFjdExvZ2dlci5wcm90b3R5cGUuZmF0YWwgPSBmdW5jdGlvbiAobXNnLCBlcnJvcikge1xuICAgICAgICBpZiAoZXJyb3IgPT09IHZvaWQgMCkgeyBlcnJvciA9IG51bGw7IH1cbiAgICAgICAgdGhpcy5fbG9nKExvZ2dlck9wdGlvbnNfMS5Mb2dMZXZlbC5GYXRhbCwgbXNnLCBlcnJvcik7XG4gICAgfTtcbiAgICBBYnN0cmFjdExvZ2dlci5wcm90b3R5cGUuaXNUcmFjZUVuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2dHcm91cFJ1bnRpbWVTZXR0aW5ncy5sZXZlbCA9PT0gTG9nZ2VyT3B0aW9uc18xLkxvZ0xldmVsLlRyYWNlO1xuICAgIH07XG4gICAgQWJzdHJhY3RMb2dnZXIucHJvdG90eXBlLmlzRGVidWdFbmFibGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbG9nR3JvdXBSdW50aW1lU2V0dGluZ3MubGV2ZWwgPD0gTG9nZ2VyT3B0aW9uc18xLkxvZ0xldmVsLkRlYnVnO1xuICAgIH07XG4gICAgQWJzdHJhY3RMb2dnZXIucHJvdG90eXBlLmlzSW5mb0VuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2dHcm91cFJ1bnRpbWVTZXR0aW5ncy5sZXZlbCA8PSBMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWwuSW5mbztcbiAgICB9O1xuICAgIEFic3RyYWN0TG9nZ2VyLnByb3RvdHlwZS5pc1dhcm5FbmFibGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbG9nR3JvdXBSdW50aW1lU2V0dGluZ3MubGV2ZWwgPD0gTG9nZ2VyT3B0aW9uc18xLkxvZ0xldmVsLldhcm47XG4gICAgfTtcbiAgICBBYnN0cmFjdExvZ2dlci5wcm90b3R5cGUuaXNFcnJvckVuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2dHcm91cFJ1bnRpbWVTZXR0aW5ncy5sZXZlbCA8PSBMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWwuRXJyb3I7XG4gICAgfTtcbiAgICBBYnN0cmFjdExvZ2dlci5wcm90b3R5cGUuaXNGYXRhbEVuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2dHcm91cFJ1bnRpbWVTZXR0aW5ncy5sZXZlbCA8PSBMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWwuRmF0YWw7XG4gICAgfTtcbiAgICBBYnN0cmFjdExvZ2dlci5wcm90b3R5cGUuZ2V0TG9nTGV2ZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2dHcm91cFJ1bnRpbWVTZXR0aW5ncy5sZXZlbDtcbiAgICB9O1xuICAgIEFic3RyYWN0TG9nZ2VyLnByb3RvdHlwZS5pc09wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcGVuO1xuICAgIH07XG4gICAgQWJzdHJhY3RMb2dnZXIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9vcGVuID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2FsbE1lc3NhZ2VzLmNsZWFyKCk7XG4gICAgfTtcbiAgICBBYnN0cmFjdExvZ2dlci5wcm90b3R5cGUuY3JlYXRlRGVmYXVsdExvZ01lc3NhZ2UgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgIHJldHVybiBNZXNzYWdlVXRpbHNfMS5NZXNzYWdlRm9ybWF0VXRpbHMucmVuZGVyRGVmYXVsdExvZzRqTWVzc2FnZShtc2csIHRydWUpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJuIG9wdGlvbmFsIG1lc3NhZ2UgZm9ybWF0dGVyLiBBbGwgTG9nZ2VyVHlwZXMgKGV4Y2VwdCBjdXN0b20pIHdpbGwgc2VlIGlmXG4gICAgICogdGhleSBoYXZlIHRoaXMsIGFuZCBpZiBzbyB1c2UgaXQgdG8gbG9nLlxuICAgICAqIEByZXR1cm5zIHsoKG1lc3NhZ2U6TG9nTWVzc2FnZSk9PnN0cmluZyl8bnVsbH1cbiAgICAgKi9cbiAgICBBYnN0cmFjdExvZ2dlci5wcm90b3R5cGUuX2dldE1lc3NhZ2VGb3JtYXR0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2dHcm91cFJ1bnRpbWVTZXR0aW5ncy5mb3JtYXR0ZXJMb2dNZXNzYWdlO1xuICAgIH07XG4gICAgQWJzdHJhY3RMb2dnZXIucHJvdG90eXBlLl9sb2cgPSBmdW5jdGlvbiAobGV2ZWwsIG1zZywgZXJyb3IpIHtcbiAgICAgICAgaWYgKGVycm9yID09PSB2b2lkIDApIHsgZXJyb3IgPSBudWxsOyB9XG4gICAgICAgIGlmICh0aGlzLl9vcGVuICYmIHRoaXMuX2xvZ0dyb3VwUnVudGltZVNldHRpbmdzLmxldmVsIDw9IGxldmVsKSB7XG4gICAgICAgICAgICB2YXIgZnVuY3Rpb25NZXNzYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbXNnID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1zZygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbXNnO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBmdW5jdGlvbkVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuX2FsbE1lc3NhZ2VzLmFkZFRhaWwodGhpcy5jcmVhdGVNZXNzYWdlKGxldmVsLCBmdW5jdGlvbk1lc3NhZ2UsIGZ1bmN0aW9uRXJyb3IsIG5ldyBEYXRlKCkpKTtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc01lc3NhZ2VzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIEFic3RyYWN0TG9nZ2VyLnByb3RvdHlwZS5jcmVhdGVNZXNzYWdlID0gZnVuY3Rpb24gKGxldmVsLCBtc2csIGVycm9yLCBkYXRlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBlcnJvclJlc3VsdCA9IGVycm9yKCk7XG4gICAgICAgIGlmIChlcnJvclJlc3VsdCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2VfMSA9IG5ldyBMb2dNZXNzYWdlSW50ZXJuYWxJbXBsKHRoaXMuX25hbWUsIG1zZygpLCBudWxsLCBlcnJvclJlc3VsdCwgdGhpcy5fbG9nR3JvdXBSdW50aW1lU2V0dGluZ3MubG9nR3JvdXBSdWxlLCBkYXRlLCBsZXZlbCwgZmFsc2UpO1xuICAgICAgICAgICAgTWVzc2FnZVV0aWxzXzEuTWVzc2FnZUZvcm1hdFV0aWxzLnJlbmRlckVycm9yKGVycm9yUmVzdWx0KS50aGVuKGZ1bmN0aW9uIChzdGFjaykge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VfMS5lcnJvckFzU3RhY2sgPSBzdGFjaztcbiAgICAgICAgICAgICAgICBtZXNzYWdlXzEucmVhZHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIF90aGlzLnByb2Nlc3NNZXNzYWdlcygpO1xuICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VfMS5lcnJvckFzU3RhY2sgPSBcIjxVTktOT1dOPiB1bmFibGUgdG8gZ2V0IHN0YWNrLlwiO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VfMS5yZWFkeSA9IHRydWU7XG4gICAgICAgICAgICAgICAgX3RoaXMucHJvY2Vzc01lc3NhZ2VzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBtZXNzYWdlXzE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBMb2dNZXNzYWdlSW50ZXJuYWxJbXBsKHRoaXMuX25hbWUsIG1zZygpLCBudWxsLCBlcnJvclJlc3VsdCwgdGhpcy5fbG9nR3JvdXBSdW50aW1lU2V0dGluZ3MubG9nR3JvdXBSdWxlLCBkYXRlLCBsZXZlbCwgdHJ1ZSk7XG4gICAgfTtcbiAgICBBYnN0cmFjdExvZ2dlci5wcm90b3R5cGUucHJvY2Vzc01lc3NhZ2VzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBCYXNpY2FsbHkgd2Ugd2FpdCB1bnRpbCBlcnJvcnMgYXJlIHJlc29sdmVkICh0aG9zZSBtZXNzYWdlc1xuICAgICAgICAvLyBtYXkgbm90IGJlIHJlYWR5KS5cbiAgICAgICAgdmFyIG1zZ3MgPSB0aGlzLl9hbGxNZXNzYWdlcztcbiAgICAgICAgaWYgKG1zZ3MuZ2V0U2l6ZSgpID4gMCkge1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIHZhciBtc2cgPSBtc2dzLmdldEhlYWQoKTtcbiAgICAgICAgICAgICAgICBpZiAobXNnICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtc2cucmVhZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1zZ3MucmVtb3ZlSGVhZCgpO1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGNhbiBuZXZlciBiZSBudWxsIG5vcm1hbGx5LCBidXQgc3RyaWN0IG51bGwgY2hlY2tpbmcgLi4uXG4gICAgICAgICAgICAgICAgICAgIGlmIChtc2cubWVzc2FnZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kb0xvZyhtc2cpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSB3aGlsZSAobXNncy5nZXRTaXplKCkgPiAwKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIEFic3RyYWN0TG9nZ2VyO1xufSgpKTtcbmV4cG9ydHMuQWJzdHJhY3RMb2dnZXIgPSBBYnN0cmFjdExvZ2dlcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUFic3RyYWN0TG9nZ2VyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBiICE9PSBcImZ1bmN0aW9uXCIgJiYgYiAhPT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ29uc29sZUxvZ2dlckltcGwgPSB2b2lkIDA7XG52YXIgQWJzdHJhY3RMb2dnZXJfMSA9IHJlcXVpcmUoXCIuL0Fic3RyYWN0TG9nZ2VyXCIpO1xudmFyIExvZ2dlck9wdGlvbnNfMSA9IHJlcXVpcmUoXCIuLi9Mb2dnZXJPcHRpb25zXCIpO1xuLyoqXG4gKiBTaW1wbGUgbG9nZ2VyLCB0aGF0IGxvZ3MgdG8gdGhlIGNvbnNvbGUuIElmIHRoZSBjb25zb2xlIGlzIHVuYXZhaWxhYmxlIHdpbGwgdGhyb3cgZXhjZXB0aW9uLlxuICovXG52YXIgQ29uc29sZUxvZ2dlckltcGwgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKENvbnNvbGVMb2dnZXJJbXBsLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIENvbnNvbGVMb2dnZXJJbXBsKG5hbWUsIGxvZ0dyb3VwUnVudGltZVNldHRpbmdzKSB7XG4gICAgICAgIHJldHVybiBfc3VwZXIuY2FsbCh0aGlzLCBuYW1lLCBsb2dHcm91cFJ1bnRpbWVTZXR0aW5ncykgfHwgdGhpcztcbiAgICB9XG4gICAgQ29uc29sZUxvZ2dlckltcGwucHJvdG90eXBlLmRvTG9nID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKGNvbnNvbGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFyIGxvZ2dlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIGxvZ0xldmVsID0gbWVzc2FnZS5sZXZlbDtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlRm9ybWF0dGVyID0gdGhpcy5fZ2V0TWVzc2FnZUZvcm1hdHRlcigpO1xuICAgICAgICAgICAgdmFyIG1zZyA9IHZvaWQgMDtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlRm9ybWF0dGVyID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbXNnID0gdGhpcy5jcmVhdGVEZWZhdWx0TG9nTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1zZyA9IG1lc3NhZ2VGb3JtYXR0ZXIobWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiB0c2xpbnQ6ZGlzYWJsZTpuby1jb25zb2xlICovXG4gICAgICAgICAgICBzd2l0Y2ggKGxvZ0xldmVsKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWwuVHJhY2U6XG4gICAgICAgICAgICAgICAgICAgIC8vIERvIG5vdCB0cnkgdHJhY2Ugd2UgZG9uJ3Qgd2FudCBhIHN0YWNrXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTG9nZ2VyT3B0aW9uc18xLkxvZ0xldmVsLkRlYnVnOlxuICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCB0cnksIHRvbyBtdWNoIGRpZmZlcmVuY2VzIG9mIGNvbnNvbGVzLlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIExvZ2dlck9wdGlvbnNfMS5Mb2dMZXZlbC5JbmZvOlxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uc29sZS5pbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8obXNnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWwuV2FybjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnNvbGUud2Fybikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTG9nZ2VyT3B0aW9uc18xLkxvZ0xldmVsLkVycm9yOlxuICAgICAgICAgICAgICAgIGNhc2UgTG9nZ2VyT3B0aW9uc18xLkxvZ0xldmVsLkZhdGFsOlxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2cgbGV2ZWwgbm90IHN1cHBvcnRlZDogXCIgKyBsb2dMZXZlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWxvZ2dlZCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiB0c2xpbnQ6ZW5hYmxlOm5vLWNvbnNvbGUgKi9cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbnNvbGUgaXMgbm90IGRlZmluZWQsIGNhbm5vdCBsb2cgbXNnOiBcIiArIG1lc3NhZ2UubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBDb25zb2xlTG9nZ2VySW1wbDtcbn0oQWJzdHJhY3RMb2dnZXJfMS5BYnN0cmFjdExvZ2dlcikpO1xuZXhwb3J0cy5Db25zb2xlTG9nZ2VySW1wbCA9IENvbnNvbGVMb2dnZXJJbXBsO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Q29uc29sZUxvZ2dlckltcGwuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkxGU2VydmljZSA9IHZvaWQgMDtcbnZhciBEYXRhU3RydWN0dXJlc18xID0gcmVxdWlyZShcIi4uLy4uL3V0aWxzL0RhdGFTdHJ1Y3R1cmVzXCIpO1xudmFyIExvZ2dlck9wdGlvbnNfMSA9IHJlcXVpcmUoXCIuLi9Mb2dnZXJPcHRpb25zXCIpO1xudmFyIExvZ2dlckZhY3RvcnlJbXBsXzEgPSByZXF1aXJlKFwiLi9Mb2dnZXJGYWN0b3J5SW1wbFwiKTtcbnZhciBFeHRlbnNpb25IZWxwZXJfMSA9IHJlcXVpcmUoXCIuLi8uLi9leHRlbnNpb24vRXh0ZW5zaW9uSGVscGVyXCIpO1xudmFyIExvZ0dyb3VwUnVsZV8xID0gcmVxdWlyZShcIi4vTG9nR3JvdXBSdWxlXCIpO1xudmFyIExvZ2dlckZhY3RvcnlPcHRpb25zXzEgPSByZXF1aXJlKFwiLi9Mb2dnZXJGYWN0b3J5T3B0aW9uc1wiKTtcbnZhciBMRlNlcnZpY2VJbXBsID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIExGU2VydmljZUltcGwoKSB7XG4gICAgICAgIC8vIFByaXZhdGUgY29uc3RydWN0b3IuXG4gICAgICAgIHRoaXMuX25hbWVDb3VudGVyID0gMTtcbiAgICAgICAgdGhpcy5fbWFwRmFjdG9yaWVzID0gbmV3IERhdGFTdHJ1Y3R1cmVzXzEuU2ltcGxlTWFwKCk7XG4gICAgICAgIEV4dGVuc2lvbkhlbHBlcl8xLkV4dGVuc2lvbkhlbHBlci5yZWdpc3RlcigpO1xuICAgIH1cbiAgICBMRlNlcnZpY2VJbXBsLmdldEluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBMb2FkZWQgb24gZGVtYW5kLiBEbyBOT1QgY2hhbmdlIGFzIHdlYnBhY2sgbWF5IHBhY2sgdGhpbmdzIGluIHdyb25nIG9yZGVyIG90aGVyd2lzZS5cbiAgICAgICAgaWYgKExGU2VydmljZUltcGwuX0lOU1RBTkNFID09PSBudWxsKSB7XG4gICAgICAgICAgICBMRlNlcnZpY2VJbXBsLl9JTlNUQU5DRSA9IG5ldyBMRlNlcnZpY2VJbXBsKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIExGU2VydmljZUltcGwuX0lOU1RBTkNFO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IExvZ2dlckZhY3Rvcnkgd2l0aCBnaXZlbiBvcHRpb25zIChpZiBhbnkpLiBJZiBubyBvcHRpb25zXG4gICAgICogYXJlIHNwZWNpZmllZCwgdGhlIExvZ2dlckZhY3RvcnksIHdpbGwgYWNjZXB0IGFueSBuYW1lZCBsb2dnZXIgYW5kIHdpbGxcbiAgICAgKiBsb2cgb24gaW5mbyBsZXZlbCBieSBkZWZhdWx0IGZvciwgdG8gdGhlIGNvbnNvbGUuXG4gICAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucywgb3B0aW9uYWwuXG4gICAgICogQHJldHVybnMge0xvZ2dlckZhY3Rvcnl9XG4gICAgICovXG4gICAgTEZTZXJ2aWNlSW1wbC5wcm90b3R5cGUuY3JlYXRlTG9nZ2VyRmFjdG9yeSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IG51bGw7IH1cbiAgICAgICAgdmFyIG5hbWUgPSBcIkxvZ2dlckZhY3RvcnlcIiArIHRoaXMuX25hbWVDb3VudGVyKys7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU5hbWVkTG9nZ2VyRmFjdG9yeShuYW1lLCBvcHRpb25zKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBMb2dnZXJGYWN0b3J5IHVzaW5nIGdpdmVuIG5hbWUgKHVzZWQgZm9yIGNvbnNvbGUgYXBpL2V4dGVuc2lvbikuXG4gICAgICogQHBhcmFtIG5hbWUgTmFtZSBQaWNrIHNvbWV0aGluZyBzaG9ydCBidXQgZGlzdGluZ3Vpc2hhYmxlLlxuICAgICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMsIG9wdGlvbmFsXG4gICAgICogQHJldHVybiB7TG9nZ2VyRmFjdG9yeX1cbiAgICAgKi9cbiAgICBMRlNlcnZpY2VJbXBsLnByb3RvdHlwZS5jcmVhdGVOYW1lZExvZ2dlckZhY3RvcnkgPSBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucykge1xuICAgICAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSBudWxsOyB9XG4gICAgICAgIGlmICh0aGlzLl9tYXBGYWN0b3JpZXMuZXhpc3RzKG5hbWUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2dnZXJGYWN0b3J5IHdpdGggbmFtZSBcIiArIG5hbWUgKyBcIiBhbHJlYWR5IGV4aXN0cy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZhY3Rvcnk7XG4gICAgICAgIGlmIChvcHRpb25zICE9PSBudWxsKSB7XG4gICAgICAgICAgICBmYWN0b3J5ID0gbmV3IExvZ2dlckZhY3RvcnlJbXBsXzEuTG9nZ2VyRmFjdG9yeUltcGwobmFtZSwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmYWN0b3J5ID0gbmV3IExvZ2dlckZhY3RvcnlJbXBsXzEuTG9nZ2VyRmFjdG9yeUltcGwobmFtZSwgTEZTZXJ2aWNlSW1wbC5jcmVhdGVEZWZhdWx0T3B0aW9ucygpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9tYXBGYWN0b3JpZXMucHV0KG5hbWUsIGZhY3RvcnkpO1xuICAgICAgICByZXR1cm4gZmFjdG9yeTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENsb3NlcyBhbGwgTG9nZ2VycyBmb3IgTG9nZ2VyRmFjdG9yaWVzIHRoYXQgd2VyZSBjcmVhdGVkLlxuICAgICAqIEFmdGVyIHRoaXMgY2FsbCwgYWxsIHByZXZpb3VzbHkgZmV0Y2hlZCBMb2dnZXJzIChmcm9tIHRoZWlyXG4gICAgICogZmFjdG9yaWVzKSBhcmUgdW51c2FibGUuIFRoZSBmYWN0b3JpZXMgcmVtYWluIGFzIHRoZXkgd2VyZS5cbiAgICAgKi9cbiAgICBMRlNlcnZpY2VJbXBsLnByb3RvdHlwZS5jbG9zZUxvZ2dlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX21hcEZhY3Rvcmllcy52YWx1ZXMoKS5mb3JFYWNoKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgICAgICAgICBmYWN0b3J5LmNsb3NlTG9nZ2VycygpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fbWFwRmFjdG9yaWVzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuX25hbWVDb3VudGVyID0gMTtcbiAgICB9O1xuICAgIExGU2VydmljZUltcGwucHJvdG90eXBlLmdldFJ1bnRpbWVTZXR0aW5nc0ZvckxvZ2dlckZhY3RvcmllcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICB0aGlzLl9tYXBGYWN0b3JpZXMuZm9yRWFjaFZhbHVlKGZ1bmN0aW9uIChmYWN0b3J5KSB7IHJldHVybiByZXN1bHQucHVzaChmYWN0b3J5KTsgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICBMRlNlcnZpY2VJbXBsLnByb3RvdHlwZS5nZXRMb2dHcm91cFNldHRpbmdzID0gZnVuY3Rpb24gKG5hbWVMb2dnZXJGYWN0b3J5LCBpZExvZ0dyb3VwUnVsZSkge1xuICAgICAgICB2YXIgZmFjdG9yeSA9IHRoaXMuX21hcEZhY3Rvcmllcy5nZXQobmFtZUxvZ2dlckZhY3RvcnkpO1xuICAgICAgICBpZiAodHlwZW9mIGZhY3RvcnkgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWN0b3J5LmdldExvZ0dyb3VwUnVudGltZVNldHRpbmdzQnlJbmRleChpZExvZ0dyb3VwUnVsZSk7XG4gICAgfTtcbiAgICBMRlNlcnZpY2VJbXBsLnByb3RvdHlwZS5nZXRMb2dnZXJGYWN0b3J5UnVudGltZVNldHRpbmdzQnlOYW1lID0gZnVuY3Rpb24gKG5hbWVMb2dnZXJGYWN0b3J5KSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9tYXBGYWN0b3JpZXMuZ2V0KG5hbWVMb2dnZXJGYWN0b3J5KTtcbiAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICBMRlNlcnZpY2VJbXBsLmNyZWF0ZURlZmF1bHRPcHRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IExvZ2dlckZhY3RvcnlPcHRpb25zXzEuTG9nZ2VyRmFjdG9yeU9wdGlvbnMoKS5hZGRMb2dHcm91cFJ1bGUobmV3IExvZ0dyb3VwUnVsZV8xLkxvZ0dyb3VwUnVsZShuZXcgUmVnRXhwKFwiLitcIiksIExvZ2dlck9wdGlvbnNfMS5Mb2dMZXZlbC5JbmZvKSk7XG4gICAgfTtcbiAgICAvLyBMb2FkZWQgb24gZGVtYW5kLiBEbyBOT1QgY2hhbmdlIGFzIHdlYnBhY2sgbWF5IHBhY2sgdGhpbmdzIGluIHdyb25nIG9yZGVyIG90aGVyd2lzZS5cbiAgICBMRlNlcnZpY2VJbXBsLl9JTlNUQU5DRSA9IG51bGw7XG4gICAgcmV0dXJuIExGU2VydmljZUltcGw7XG59KCkpO1xuLyoqXG4gKiBDcmVhdGUgYW5kIGNvbmZpZ3VyZSB5b3VyIExvZ2dlckZhY3RvcnkgZnJvbSBoZXJlLlxuICovXG52YXIgTEZTZXJ2aWNlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIExGU2VydmljZSgpIHtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IExvZ2dlckZhY3Rvcnkgd2l0aCBnaXZlbiBvcHRpb25zIChpZiBhbnkpLiBJZiBubyBvcHRpb25zXG4gICAgICogYXJlIHNwZWNpZmllZCwgdGhlIExvZ2dlckZhY3RvcnksIHdpbGwgYWNjZXB0IGFueSBuYW1lZCBsb2dnZXIgYW5kIHdpbGxcbiAgICAgKiBsb2cgb24gaW5mbyBsZXZlbCBieSBkZWZhdWx0IGZvciwgdG8gdGhlIGNvbnNvbGUuXG4gICAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucywgb3B0aW9uYWwuXG4gICAgICogQHJldHVybnMge0xvZ2dlckZhY3Rvcnl9XG4gICAgICovXG4gICAgTEZTZXJ2aWNlLmNyZWF0ZUxvZ2dlckZhY3RvcnkgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSBudWxsOyB9XG4gICAgICAgIHJldHVybiBMRlNlcnZpY2UuSU5TVEFOQ0VfU0VSVklDRS5jcmVhdGVMb2dnZXJGYWN0b3J5KG9wdGlvbnMpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IExvZ2dlckZhY3RvcnkgdXNpbmcgZ2l2ZW4gbmFtZSAodXNlZCBmb3IgY29uc29sZSBhcGkvZXh0ZW5zaW9uKS5cbiAgICAgKiBAcGFyYW0gbmFtZSBOYW1lIFBpY2sgc29tZXRoaW5nIHNob3J0IGJ1dCBkaXN0aW5ndWlzaGFibGUuIFRoZSB3b3JkIFwiREVGQVVMVFwiIGlzIHJlc2VydmVkIGFuZCBjYW5ub3QgYmUgdGFrZW4sIGl0IGlzIHVzZWRcbiAgICAgKiBmb3IgdGhlIGRlZmF1bHQgTG9nZ2VyRmFjdG9yeS5cbiAgICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zLCBvcHRpb25hbFxuICAgICAqIEByZXR1cm4ge0xvZ2dlckZhY3Rvcnl9XG4gICAgICovXG4gICAgTEZTZXJ2aWNlLmNyZWF0ZU5hbWVkTG9nZ2VyRmFjdG9yeSA9IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IG51bGw7IH1cbiAgICAgICAgaWYgKG5hbWUgPT09IExGU2VydmljZS5ERUZBVUxUX0xPR0dFUl9GQUNUT1JZX05BTUUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvZ2dlckZhY3RvcnkgbmFtZTogXCIgKyBMRlNlcnZpY2UuREVGQVVMVF9MT0dHRVJfRkFDVE9SWV9OQU1FICsgXCIgaXMgcmVzZXJ2ZWQgYW5kIGNhbm5vdCBiZSB1c2VkLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTEZTZXJ2aWNlLklOU1RBTkNFX1NFUlZJQ0UuY3JlYXRlTmFtZWRMb2dnZXJGYWN0b3J5KG5hbWUsIG9wdGlvbnMpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ2xvc2VzIGFsbCBMb2dnZXJzIGZvciBMb2dnZXJGYWN0b3JpZXMgdGhhdCB3ZXJlIGNyZWF0ZWQuXG4gICAgICogQWZ0ZXIgdGhpcyBjYWxsLCBhbGwgcHJldmlvdXNseSBmZXRjaGVkIExvZ2dlcnMgKGZyb20gdGhlaXJcbiAgICAgKiBmYWN0b3JpZXMpIGFyZSB1bnVzYWJsZS4gVGhlIGZhY3RvcmllcyByZW1haW4gYXMgdGhleSB3ZXJlLlxuICAgICAqL1xuICAgIExGU2VydmljZS5jbG9zZUxvZ2dlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBMRlNlcnZpY2UuSU5TVEFOQ0VfU0VSVklDRS5jbG9zZUxvZ2dlcnMoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybiBMRlNlcnZpY2VSdW50aW1lU2V0dGluZ3MgdG8gcmV0cmlldmUgaW5mb3JtYXRpb24gbG9nZ2VyZmFjdG9yaWVzXG4gICAgICogYW5kIHRoZWlyIHJ1bnRpbWUgc2V0dGluZ3MuXG4gICAgICogQHJldHVybnMge0xGU2VydmljZVJ1bnRpbWVTZXR0aW5nc31cbiAgICAgKi9cbiAgICBMRlNlcnZpY2UuZ2V0UnVudGltZVNldHRpbmdzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gTEZTZXJ2aWNlLklOU1RBTkNFX1NFUlZJQ0U7XG4gICAgfTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTEZTZXJ2aWNlLCBcIkRFRkFVTFRcIiwge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBwcm9wZXJ0eSByZXR1cm5zIHRoZSBkZWZhdWx0IExvZ2dlckZhY3RvcnkgKGlmIG5vdCB5ZXQgaW5pdGlhbGl6ZWQgaXQgaXMgaW5pdGlhbGl6ZWQpLlxuICAgICAgICAgKiBUaGlzIExvZ2dlckZhY3RvcnkgY2FuIGJlIHVzZWQgdG8gc2hhcmUgYW1vbmcgbXVsdGlwbGVcbiAgICAgICAgICogYXBwbGljYXRpb25zL2xpYnJhcmllcyAtIHRoYXQgd2F5IHlvdSBjYW4gZW5hYmxlL2NoYW5nZSBsb2dnaW5nIG92ZXIgZXZlcnl0aGluZyBmcm9tXG4gICAgICAgICAqIHlvdXIgb3duIGFwcGxpY2F0aW9uIHdoZW4gcmVxdWlyZWQuXG4gICAgICAgICAqIEl0IGlzIHJlY29tbWVuZGVkIHRvIGJlIHVzZWQgYnkgbGlicmFyeSBkZXZlbG9wZXJzIHRvIG1ha2UgbG9nZ2luZyBlYXNpbHkgYXZhaWxhYmxlIGZvciB0aGVcbiAgICAgICAgICogY29uc3VtZXJzIG9mIHRoZWlyIGxpYnJhcmllcy5cbiAgICAgICAgICogSXQgaXMgaGlnaGx5IHJlY29tbWVuZGVkIHRvIHVzZSBMb2dnZXJzIGZyb20gdGhlIExvZ2dlckZhY3Rvcnkgd2l0aCB1bmlxdWUgZ3JvdXBpbmcvbmFtZXMgdG8gcHJldmVudFxuICAgICAgICAgKiBjbGFzaGVzIG9mIExvZ2dlcnMgYmV0d2VlbiBtdWx0aXBsZSBwcm9qZWN0cy5cbiAgICAgICAgICogQHJldHVybnMge0xvZ2dlckZhY3Rvcnl9IFJldHVybnMgdGhlIGRlZmF1bHQgTG9nZ2VyRmFjdG9yeVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gTEZTZXJ2aWNlLmdldERlZmF1bHQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIExGU2VydmljZS5nZXREZWZhdWx0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoTEZTZXJ2aWNlLkRFRkFVTFRfTE9HR0VSX0ZBQ1RPUlkgPT09IG51bGwpIHtcbiAgICAgICAgICAgIExGU2VydmljZS5ERUZBVUxUX0xPR0dFUl9GQUNUT1JZID0gTEZTZXJ2aWNlLkRFRkFVTFRfTE9HR0VSX0ZBQ1RPUlkgPSBMRlNlcnZpY2UuSU5TVEFOQ0VfU0VSVklDRS5jcmVhdGVOYW1lZExvZ2dlckZhY3RvcnkoTEZTZXJ2aWNlLkRFRkFVTFRfTE9HR0VSX0ZBQ1RPUllfTkFNRSwgbmV3IExvZ2dlckZhY3RvcnlPcHRpb25zXzEuTG9nZ2VyRmFjdG9yeU9wdGlvbnMoKS5hZGRMb2dHcm91cFJ1bGUobmV3IExvZ0dyb3VwUnVsZV8xLkxvZ0dyb3VwUnVsZShuZXcgUmVnRXhwKFwiLitcIiksIExvZ2dlck9wdGlvbnNfMS5Mb2dMZXZlbC5FcnJvcikpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTEZTZXJ2aWNlLkRFRkFVTFRfTE9HR0VSX0ZBQ1RPUlk7XG4gICAgfTtcbiAgICBMRlNlcnZpY2UuREVGQVVMVF9MT0dHRVJfRkFDVE9SWV9OQU1FID0gXCJERUZBVUxUXCI7XG4gICAgTEZTZXJ2aWNlLklOU1RBTkNFX1NFUlZJQ0UgPSBMRlNlcnZpY2VJbXBsLmdldEluc3RhbmNlKCk7XG4gICAgTEZTZXJ2aWNlLkRFRkFVTFRfTE9HR0VSX0ZBQ1RPUlkgPSBudWxsO1xuICAgIHJldHVybiBMRlNlcnZpY2U7XG59KCkpO1xuZXhwb3J0cy5MRlNlcnZpY2UgPSBMRlNlcnZpY2U7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1MRlNlcnZpY2UuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkxvZ0dyb3VwUnVsZSA9IHZvaWQgMDtcbnZhciBMb2dnZXJPcHRpb25zXzEgPSByZXF1aXJlKFwiLi4vTG9nZ2VyT3B0aW9uc1wiKTtcbi8qKlxuICogRGVmaW5lcyBhIExvZ0dyb3VwUnVsZSwgdGhpcyBhbGxvd3MgeW91IHRvIGVpdGhlciBoYXZlIGV2ZXJ5dGhpbmcgY29uZmlndXJlZCB0aGUgc2FtZSB3YXlcbiAqIG9yIGZvciBleGFtcGxlIGxvZ2dlcnMgdGhhdCBzdGFydCB3aXRoIG5hbWUgbW9kZWwuIEl0IGFsbG93cyB5b3UgdG8gZ3JvdXAgbG9nZ2VycyB0b2dldGhlclxuICogdG8gaGF2ZSBhIGNlcnRhaW4gbG9nbGV2ZWwgYW5kIG90aGVyIHNldHRpbmdzLiBZb3UgY2FuIGNvbmZpZ3VyZSB0aGlzIHdoZW4gY3JlYXRpbmcgdGhlXG4gKiBMb2dnZXJGYWN0b3J5ICh3aGljaCBhY2NlcHRzIG11bHRpcGxlIExvZ0dyb3VwUnVsZXMpLlxuICovXG52YXIgTG9nR3JvdXBSdWxlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIExvZ0dyb3VwUnVsZS4gQmFzaWNhbGx5IHlvdSBkZWZpbmUgd2hhdCBsb2dnZXIgbmFtZShzKSBtYXRjaCBmb3IgdGhpcyBncm91cCwgd2hhdCBsZXZlbCBzaG91bGQgYmUgdXNlZCB3aGF0IGxvZ2dlciB0eXBlICh3aGVyZSB0byBsb2cpXG4gICAgICogYW5kIHdoYXQgZm9ybWF0IHRvIHdyaXRlIGluLiBJZiB0aGUgbG9nZ2VyVHlwZSBpcyBjdXN0b20sIHRoZW4gdGhlIGNhbGxCYWNrTG9nZ2VyIG11c3QgYmUgc3VwcGxpZWQgYXMgY2FsbGJhY2sgZnVuY3Rpb24gdG8gcmV0dXJuIGEgY3VzdG9tIGxvZ2dlci5cbiAgICAgKiBAcGFyYW0gcmVnRXhwIFJlZ3VsYXIgZXhwcmVzc2lvbiwgd2hhdCBtYXRjaGVzIGZvciB5b3VyIGxvZ2dlciBuYW1lcyBmb3IgdGhpcyBncm91cFxuICAgICAqIEBwYXJhbSBsZXZlbCBMb2dMZXZlbFxuICAgICAqIEBwYXJhbSBsb2dGb3JtYXQgTG9nRm9ybWF0XG4gICAgICogQHBhcmFtIGxvZ2dlclR5cGUgVHlwZSBvZiBsb2dnZXIsIGlmIEN1c3RvbSwgbWFrZSBzdXJlIHRvIGltcGxlbWVudCBjYWxsQmFja0xvZ2dlciBhbmQgcGFzcyBpbiwgdGhpcyB3aWxsIGJlIGNhbGxlZCBzbyB5b3UgY2FuIHJldHVybiB5b3VyIG93biBsb2dnZXIuXG4gICAgICogQHBhcmFtIGNhbGxCYWNrTG9nZ2VyIENhbGxiYWNrIGZ1bmN0aW9uIHRvIHJldHVybiBhIG5ldyBjbGVhbiBjdXN0b20gbG9nZ2VyICh5b3VycyEpXG4gICAgICovXG4gICAgZnVuY3Rpb24gTG9nR3JvdXBSdWxlKHJlZ0V4cCwgbGV2ZWwsIGxvZ0Zvcm1hdCwgbG9nZ2VyVHlwZSwgY2FsbEJhY2tMb2dnZXIpIHtcbiAgICAgICAgaWYgKGxvZ0Zvcm1hdCA9PT0gdm9pZCAwKSB7IGxvZ0Zvcm1hdCA9IG5ldyBMb2dnZXJPcHRpb25zXzEuTG9nRm9ybWF0KCk7IH1cbiAgICAgICAgaWYgKGxvZ2dlclR5cGUgPT09IHZvaWQgMCkgeyBsb2dnZXJUeXBlID0gTG9nZ2VyT3B0aW9uc18xLkxvZ2dlclR5cGUuQ29uc29sZTsgfVxuICAgICAgICBpZiAoY2FsbEJhY2tMb2dnZXIgPT09IHZvaWQgMCkgeyBjYWxsQmFja0xvZ2dlciA9IG51bGw7IH1cbiAgICAgICAgdGhpcy5fZm9ybWF0dGVyTG9nTWVzc2FnZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3JlZ0V4cCA9IHJlZ0V4cDtcbiAgICAgICAgdGhpcy5fbGV2ZWwgPSBsZXZlbDtcbiAgICAgICAgdGhpcy5fbG9nRm9ybWF0ID0gbG9nRm9ybWF0O1xuICAgICAgICB0aGlzLl9sb2dnZXJUeXBlID0gbG9nZ2VyVHlwZTtcbiAgICAgICAgdGhpcy5fY2FsbEJhY2tMb2dnZXIgPSBjYWxsQmFja0xvZ2dlcjtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KExvZ0dyb3VwUnVsZS5wcm90b3R5cGUsIFwicmVnRXhwXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVnRXhwO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KExvZ0dyb3VwUnVsZS5wcm90b3R5cGUsIFwibGV2ZWxcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sZXZlbDtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShMb2dHcm91cFJ1bGUucHJvdG90eXBlLCBcImxvZ2dlclR5cGVcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sb2dnZXJUeXBlO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KExvZ0dyb3VwUnVsZS5wcm90b3R5cGUsIFwibG9nRm9ybWF0XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9nRm9ybWF0O1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KExvZ0dyb3VwUnVsZS5wcm90b3R5cGUsIFwiY2FsbEJhY2tMb2dnZXJcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jYWxsQmFja0xvZ2dlcjtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShMb2dHcm91cFJ1bGUucHJvdG90eXBlLCBcImZvcm1hdHRlckxvZ01lc3NhZ2VcIiwge1xuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IHRoZSBmb3JtYXR0ZXJMb2dNZXNzYWdlIGZ1bmN0aW9uLCBzZWUgY29tbWVudCBvbiB0aGUgc2V0dGVyLlxuICAgICAgICAgKiBAcmV0dXJucyB7KChtZXNzYWdlOkxvZ01lc3NhZ2UpPT5zdHJpbmcpfG51bGx9XG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9mb3JtYXR0ZXJMb2dNZXNzYWdlO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogU2V0IHRoZSBkZWZhdWx0IGZvcm1hdHRlckxvZ01lc3NhZ2UgZnVuY3Rpb24sIGlmIHNldCBpdCBpcyBhcHBsaWVkIHRvIGFsbCB0eXBlIG9mIGxvZ2dlcnMgZXhjZXB0IGZvciBhIGN1c3RvbSBsb2dnZXIuXG4gICAgICAgICAqIEJ5IGRlZmF1bHQgdGhpcyBpcyBudWxsIChub3Qgc2V0KS4gWW91IGNhbiBhc3NpZ24gYSBmdW5jdGlvbiB0byBhbGxvdyBjdXN0b20gZm9ybWF0dGluZyBvZiBhIGxvZyBtZXNzYWdlLlxuICAgICAgICAgKiBFYWNoIGxvZyBtZXNzYWdlIHdpbGwgY2FsbCB0aGlzIGZ1bmN0aW9uIHRoZW4gYW5kIGV4cGVjdHMgeW91ciBmdW5jdGlvbiB0byBmb3JtYXQgdGhlIG1lc3NhZ2UgYW5kIHJldHVybiBhIHN0cmluZy5cbiAgICAgICAgICogV2lsbCB0aHJvdyBhbiBlcnJvciBpZiB5b3UgYXR0ZW1wdCB0byBzZXQgYSBmb3JtYXR0ZXJMb2dNZXNzYWdlIGlmIHRoZSBMb2dnZXJUeXBlIGlzIGN1c3RvbS5cbiAgICAgICAgICogQHBhcmFtIHZhbHVlIFRoZSBmb3JtYXR0ZXIgZnVuY3Rpb24sIG9yIG51bGwgdG8gcmVzZXQgaXQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHRoaXMuX2xvZ2dlclR5cGUgPT09IExvZ2dlck9wdGlvbnNfMS5Mb2dnZXJUeXBlLkN1c3RvbSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBjYW5ub3Qgc3BlY2lmeSBhIGZvcm1hdHRlciBmb3IgbG9nIG1lc3NhZ2VzIGlmIHlvdXIgbG9nZ2VyVHlwZSBpcyBDdXN0b21cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9mb3JtYXR0ZXJMb2dNZXNzYWdlID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gTG9nR3JvdXBSdWxlO1xufSgpKTtcbmV4cG9ydHMuTG9nR3JvdXBSdWxlID0gTG9nR3JvdXBSdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9TG9nR3JvdXBSdWxlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Mb2dHcm91cFJ1bnRpbWVTZXR0aW5ncyA9IHZvaWQgMDtcbnZhciBMb2dnZXJPcHRpb25zXzEgPSByZXF1aXJlKFwiLi4vTG9nZ2VyT3B0aW9uc1wiKTtcbi8qKlxuICogUmVwcmVzZW50cyB0aGUgcnVudGltZSBzZXR0aW5ncyBmb3IgYSBMb2dHcm91cCAoTG9nR3JvdXBSdWxlKS5cbiAqL1xudmFyIExvZ0dyb3VwUnVudGltZVNldHRpbmdzID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIExvZ0dyb3VwUnVudGltZVNldHRpbmdzKGxvZ0dyb3VwUnVsZSkge1xuICAgICAgICB0aGlzLl9mb3JtYXR0ZXJMb2dNZXNzYWdlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fbG9nR3JvdXBSdWxlID0gbG9nR3JvdXBSdWxlO1xuICAgICAgICB0aGlzLl9sZXZlbCA9IGxvZ0dyb3VwUnVsZS5sZXZlbDtcbiAgICAgICAgdGhpcy5fbG9nZ2VyVHlwZSA9IGxvZ0dyb3VwUnVsZS5sb2dnZXJUeXBlO1xuICAgICAgICB0aGlzLl9sb2dGb3JtYXQgPSBuZXcgTG9nZ2VyT3B0aW9uc18xLkxvZ0Zvcm1hdChuZXcgTG9nZ2VyT3B0aW9uc18xLkRhdGVGb3JtYXQobG9nR3JvdXBSdWxlLmxvZ0Zvcm1hdC5kYXRlRm9ybWF0LmZvcm1hdEVudW0sIGxvZ0dyb3VwUnVsZS5sb2dGb3JtYXQuZGF0ZUZvcm1hdC5kYXRlU2VwYXJhdG9yKSwgbG9nR3JvdXBSdWxlLmxvZ0Zvcm1hdC5zaG93VGltZVN0YW1wLCBsb2dHcm91cFJ1bGUubG9nRm9ybWF0LnNob3dMb2dnZXJOYW1lKTtcbiAgICAgICAgdGhpcy5fY2FsbEJhY2tMb2dnZXIgPSBsb2dHcm91cFJ1bGUuY2FsbEJhY2tMb2dnZXI7XG4gICAgICAgIHRoaXMuX2Zvcm1hdHRlckxvZ01lc3NhZ2UgPSBsb2dHcm91cFJ1bGUuZm9ybWF0dGVyTG9nTWVzc2FnZTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KExvZ0dyb3VwUnVudGltZVNldHRpbmdzLnByb3RvdHlwZSwgXCJsb2dHcm91cFJ1bGVcIiwge1xuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyBvcmlnaW5hbCBMb2dHcm91cFJ1bGUgKHNvIG5vdCBydW50aW1lIHNldHRpbmdzISlcbiAgICAgICAgICogQHJldHVybiB7TG9nR3JvdXBSdWxlfVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9nR3JvdXBSdWxlO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KExvZ0dyb3VwUnVudGltZVNldHRpbmdzLnByb3RvdHlwZSwgXCJsZXZlbFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xldmVsO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fbGV2ZWwgPSB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShMb2dHcm91cFJ1bnRpbWVTZXR0aW5ncy5wcm90b3R5cGUsIFwibG9nZ2VyVHlwZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xvZ2dlclR5cGU7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dnZXJUeXBlID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTG9nR3JvdXBSdW50aW1lU2V0dGluZ3MucHJvdG90eXBlLCBcImxvZ0Zvcm1hdFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xvZ0Zvcm1hdDtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ0Zvcm1hdCA9IHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KExvZ0dyb3VwUnVudGltZVNldHRpbmdzLnByb3RvdHlwZSwgXCJjYWxsQmFja0xvZ2dlclwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NhbGxCYWNrTG9nZ2VyO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fY2FsbEJhY2tMb2dnZXIgPSB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShMb2dHcm91cFJ1bnRpbWVTZXR0aW5ncy5wcm90b3R5cGUsIFwiZm9ybWF0dGVyTG9nTWVzc2FnZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Zvcm1hdHRlckxvZ01lc3NhZ2U7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9mb3JtYXR0ZXJMb2dNZXNzYWdlID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gTG9nR3JvdXBSdW50aW1lU2V0dGluZ3M7XG59KCkpO1xuZXhwb3J0cy5Mb2dHcm91cFJ1bnRpbWVTZXR0aW5ncyA9IExvZ0dyb3VwUnVudGltZVNldHRpbmdzO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9TG9nR3JvdXBSdW50aW1lU2V0dGluZ3MuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkxvZ2dlckZhY3RvcnlJbXBsID0gdm9pZCAwO1xudmFyIERhdGFTdHJ1Y3R1cmVzXzEgPSByZXF1aXJlKFwiLi4vLi4vdXRpbHMvRGF0YVN0cnVjdHVyZXNcIik7XG52YXIgTG9nZ2VyT3B0aW9uc18xID0gcmVxdWlyZShcIi4uL0xvZ2dlck9wdGlvbnNcIik7XG52YXIgQ29uc29sZUxvZ2dlckltcGxfMSA9IHJlcXVpcmUoXCIuL0NvbnNvbGVMb2dnZXJJbXBsXCIpO1xudmFyIE1lc3NhZ2VCdWZmZXJMb2dnZXJJbXBsXzEgPSByZXF1aXJlKFwiLi9NZXNzYWdlQnVmZmVyTG9nZ2VySW1wbFwiKTtcbnZhciBBYnN0cmFjdExvZ2dlcl8xID0gcmVxdWlyZShcIi4vQWJzdHJhY3RMb2dnZXJcIik7XG52YXIgTG9nR3JvdXBSdW50aW1lU2V0dGluZ3NfMSA9IHJlcXVpcmUoXCIuL0xvZ0dyb3VwUnVudGltZVNldHRpbmdzXCIpO1xudmFyIExvZ2dlckZhY3RvcnlJbXBsID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIExvZ2dlckZhY3RvcnlJbXBsKG5hbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5fbG9nZ2VycyA9IG5ldyBEYXRhU3RydWN0dXJlc18xLlNpbXBsZU1hcCgpO1xuICAgICAgICB0aGlzLl9sb2dHcm91cFJ1bnRpbWVTZXR0aW5nc0luZGV4ZWQgPSBbXTtcbiAgICAgICAgdGhpcy5fbG9nZ2VyVG9Mb2dHcm91cFNldHRpbmdzID0gbmV3IERhdGFTdHJ1Y3R1cmVzXzEuU2ltcGxlTWFwKCk7XG4gICAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyZShvcHRpb25zKTtcbiAgICB9XG4gICAgTG9nZ2VyRmFjdG9yeUltcGwucHJvdG90eXBlLmNvbmZpZ3VyZSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICAvLyBDbG9zZSBhbnkgY3VycmVudCBvcGVuIGxvZ2dlcnMuXG4gICAgICAgIHRoaXMuY2xvc2VMb2dnZXJzKCk7XG4gICAgICAgIHRoaXMuX2xvZ2dlclRvTG9nR3JvdXBTZXR0aW5ncy5jbGVhcigpO1xuICAgICAgICB0aGlzLl9sb2dHcm91cFJ1bnRpbWVTZXR0aW5nc0luZGV4ZWQgPSBbXTtcbiAgICAgICAgdmFyIGxvZ0dyb3VwUnVsZXMgPSB0aGlzLl9vcHRpb25zLmxvZ0dyb3VwUnVsZXM7XG4gICAgICAgIC8qIHRzbGludDpkaXNhYmxlOnByZWZlci1mb3Itb2YgKi9cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2dHcm91cFJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dHcm91cFJ1bnRpbWVTZXR0aW5nc0luZGV4ZWQucHVzaChuZXcgTG9nR3JvdXBSdW50aW1lU2V0dGluZ3NfMS5Mb2dHcm91cFJ1bnRpbWVTZXR0aW5ncyhsb2dHcm91cFJ1bGVzW2ldKSk7XG4gICAgICAgIH1cbiAgICAgICAgLyogdHNsaW50OmVuYWJsZTpwcmVmZXItZm9yLW9mICovXG4gICAgfTtcbiAgICBMb2dnZXJGYWN0b3J5SW1wbC5wcm90b3R5cGUuZ2V0TG9nZ2VyID0gZnVuY3Rpb24gKG5hbWVkKSB7XG4gICAgICAgIGlmICghdGhpcy5fb3B0aW9ucy5lbmFibGVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2dnZXJGYWN0b3J5IGlzIG5vdCBlbmFibGVkLCBwbGVhc2UgY2hlY2sgeW91ciBvcHRpb25zIHBhc3NlZCBpblwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbG9nZ2VyID0gdGhpcy5fbG9nZ2Vycy5nZXQobmFtZWQpO1xuICAgICAgICBpZiAodHlwZW9mIGxvZ2dlciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIGxvZ2dlcjtcbiAgICAgICAgfVxuICAgICAgICAvLyBJbml0aWFsaXplIGxvZ2dlciB3aXRoIGFwcHJvcHJpYXRlIGxldmVsXG4gICAgICAgIGxvZ2dlciA9IHRoaXMubG9hZExvZ2dlcihuYW1lZCk7XG4gICAgICAgIHRoaXMuX2xvZ2dlcnMucHV0KG5hbWVkLCBsb2dnZXIpO1xuICAgICAgICByZXR1cm4gbG9nZ2VyO1xuICAgIH07XG4gICAgTG9nZ2VyRmFjdG9yeUltcGwucHJvdG90eXBlLmlzRW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnMuZW5hYmxlZDtcbiAgICB9O1xuICAgIExvZ2dlckZhY3RvcnlJbXBsLnByb3RvdHlwZS5jbG9zZUxvZ2dlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2xvZ2dlcnMuZm9yRWFjaFZhbHVlKGZ1bmN0aW9uIChsb2dnZXIpIHtcbiAgICAgICAgICAgIC8vIFdlIGNhbiBvbmx5IGNsb3NlIGlmIEFic3RyYWN0TG9nZ2VyIGlzIHVzZWQgKG91ciBsb2dnZXJzLCBidXQgdXNlciBsb2dnZXJzIG1heSBub3QgZXh0ZW5kIGl0LCBldmVuIHRob3VnaCB1bmxpa2VseSkuXG4gICAgICAgICAgICBpZiAobG9nZ2VyIGluc3RhbmNlb2YgQWJzdHJhY3RMb2dnZXJfMS5BYnN0cmFjdExvZ2dlcikge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5jbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fbG9nZ2Vycy5jbGVhcigpO1xuICAgIH07XG4gICAgTG9nZ2VyRmFjdG9yeUltcGwucHJvdG90eXBlLmdldE5hbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICAgIH07XG4gICAgTG9nZ2VyRmFjdG9yeUltcGwucHJvdG90eXBlLmdldExvZ0dyb3VwUnVudGltZVNldHRpbmdzQnlJbmRleCA9IGZ1bmN0aW9uIChpZHgpIHtcbiAgICAgICAgaWYgKGlkeCA+PSAwICYmIGlkeCA8IHRoaXMuX2xvZ0dyb3VwUnVudGltZVNldHRpbmdzSW5kZXhlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sb2dHcm91cFJ1bnRpbWVTZXR0aW5nc0luZGV4ZWRbaWR4XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuICAgIExvZ2dlckZhY3RvcnlJbXBsLnByb3RvdHlwZS5nZXRMb2dHcm91cFJ1bnRpbWVTZXR0aW5nc0J5TG9nZ2VyTmFtZSA9IGZ1bmN0aW9uIChuYW1lTG9nZ2VyKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9sb2dnZXJUb0xvZ0dyb3VwU2V0dGluZ3MuZ2V0KG5hbWVMb2dnZXIpO1xuICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIExvZ2dlckZhY3RvcnlJbXBsLnByb3RvdHlwZS5nZXRMb2dHcm91cFJ1bnRpbWVTZXR0aW5ncyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvZ0dyb3VwUnVudGltZVNldHRpbmdzSW5kZXhlZC5zbGljZSgwKTtcbiAgICB9O1xuICAgIExvZ2dlckZhY3RvcnlJbXBsLnByb3RvdHlwZS5sb2FkTG9nZ2VyID0gZnVuY3Rpb24gKG5hbWVkKSB7XG4gICAgICAgIHZhciBsb2dHcm91cFJ1bGVzID0gdGhpcy5fb3B0aW9ucy5sb2dHcm91cFJ1bGVzO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvZ0dyb3VwUnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBsb2dHcm91cFJ1bGUgPSBsb2dHcm91cFJ1bGVzW2ldO1xuICAgICAgICAgICAgaWYgKGxvZ0dyb3VwUnVsZS5yZWdFeHAudGVzdChuYW1lZCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgbG9nR3JvdXBSdW50aW1lU2V0dGluZ3MgPSB0aGlzLl9sb2dHcm91cFJ1bnRpbWVTZXR0aW5nc0luZGV4ZWRbaV07XG4gICAgICAgICAgICAgICAgdmFyIGxvZ2dlciA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGxvZ0dyb3VwUnVsZS5sb2dnZXJUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgTG9nZ2VyT3B0aW9uc18xLkxvZ2dlclR5cGUuQ29uc29sZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlciA9IG5ldyBDb25zb2xlTG9nZ2VySW1wbF8xLkNvbnNvbGVMb2dnZXJJbXBsKG5hbWVkLCBsb2dHcm91cFJ1bnRpbWVTZXR0aW5ncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBMb2dnZXJPcHRpb25zXzEuTG9nZ2VyVHlwZS5NZXNzYWdlQnVmZmVyOlxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyID0gbmV3IE1lc3NhZ2VCdWZmZXJMb2dnZXJJbXBsXzEuTWVzc2FnZUJ1ZmZlckxvZ2dlckltcGwobmFtZWQsIGxvZ0dyb3VwUnVudGltZVNldHRpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIExvZ2dlck9wdGlvbnNfMS5Mb2dnZXJUeXBlLkN1c3RvbTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2dHcm91cFJ1bGUuY2FsbEJhY2tMb2dnZXIgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlciA9IGxvZ0dyb3VwUnVsZS5jYWxsQmFja0xvZ2dlcihuYW1lZCwgbG9nR3JvdXBSdW50aW1lU2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGNyZWF0ZSBhIGN1c3RvbSBsb2dnZXIsIGN1c3RvbSBjYWxsYmFjayBpcyBudWxsXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY3JlYXRlIGEgTG9nZ2VyIGZvciBMb2dnZXJUeXBlOiBcIiArIGxvZ0dyb3VwUnVsZS5sb2dnZXJUeXBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gRm9yIGEgbmV3IGxvZ2dlciBtYXAgaXQgYnkgaXRzIG5hbWVcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2dnZXJUb0xvZ0dyb3VwU2V0dGluZ3MucHV0KG5hbWVkLCBsb2dHcm91cFJ1bnRpbWVTZXR0aW5ncyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxvZ2dlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZmluZCBhIG1hdGNoIHRvIGNyZWF0ZSBhIExvZ2dlciBmb3I6IFwiICsgbmFtZWQpO1xuICAgIH07XG4gICAgcmV0dXJuIExvZ2dlckZhY3RvcnlJbXBsO1xufSgpKTtcbmV4cG9ydHMuTG9nZ2VyRmFjdG9yeUltcGwgPSBMb2dnZXJGYWN0b3J5SW1wbDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUxvZ2dlckZhY3RvcnlJbXBsLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Mb2dnZXJGYWN0b3J5T3B0aW9ucyA9IHZvaWQgMDtcbi8qKlxuICogT3B0aW9ucyBvYmplY3QgeW91IGNhbiB1c2UgdG8gY29uZmlndXJlIHRoZSBMb2dnZXJGYWN0b3J5IHlvdSBjcmVhdGUgYXQgTEZTZXJ2aWNlLlxuICovXG52YXIgTG9nZ2VyRmFjdG9yeU9wdGlvbnMgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTG9nZ2VyRmFjdG9yeU9wdGlvbnMoKSB7XG4gICAgICAgIHRoaXMuX2xvZ0dyb3VwUnVsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5fZW5hYmxlZCA9IHRydWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZCBMb2dHcm91cFJ1bGUsIHNlZSB7TG9nR3JvdXBSdWxlKSBmb3IgZGV0YWlsc1xuICAgICAqIEBwYXJhbSBydWxlIFJ1bGUgdG8gYWRkXG4gICAgICogQHJldHVybnMge0xvZ2dlckZhY3RvcnlPcHRpb25zfSByZXR1cm5zIGl0c2VsZlxuICAgICAqL1xuICAgIExvZ2dlckZhY3RvcnlPcHRpb25zLnByb3RvdHlwZS5hZGRMb2dHcm91cFJ1bGUgPSBmdW5jdGlvbiAocnVsZSkge1xuICAgICAgICB0aGlzLl9sb2dHcm91cFJ1bGVzLnB1c2gocnVsZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRW5hYmxlIG9yIGRpc2FibGUgbG9nZ2luZyBjb21wbGV0ZWx5IGZvciB0aGUgTG9nZ2VyRmFjdG9yeS5cbiAgICAgKiBAcGFyYW0gZW5hYmxlZCBUcnVlIGZvciBlbmFibGVkIChkZWZhdWx0KVxuICAgICAqIEByZXR1cm5zIHtMb2dnZXJGYWN0b3J5T3B0aW9uc30gcmV0dXJucyBpdHNlbGZcbiAgICAgKi9cbiAgICBMb2dnZXJGYWN0b3J5T3B0aW9ucy5wcm90b3R5cGUuc2V0RW5hYmxlZCA9IGZ1bmN0aW9uIChlbmFibGVkKSB7XG4gICAgICAgIHRoaXMuX2VuYWJsZWQgPSBlbmFibGVkO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShMb2dnZXJGYWN0b3J5T3B0aW9ucy5wcm90b3R5cGUsIFwibG9nR3JvdXBSdWxlc1wiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xvZ0dyb3VwUnVsZXM7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTG9nZ2VyRmFjdG9yeU9wdGlvbnMucHJvdG90eXBlLCBcImVuYWJsZWRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9lbmFibGVkO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIExvZ2dlckZhY3RvcnlPcHRpb25zO1xufSgpKTtcbmV4cG9ydHMuTG9nZ2VyRmFjdG9yeU9wdGlvbnMgPSBMb2dnZXJGYWN0b3J5T3B0aW9ucztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUxvZ2dlckZhY3RvcnlPcHRpb25zLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBiICE9PSBcImZ1bmN0aW9uXCIgJiYgYiAhPT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuTWVzc2FnZUJ1ZmZlckxvZ2dlckltcGwgPSB2b2lkIDA7XG52YXIgQWJzdHJhY3RMb2dnZXJfMSA9IHJlcXVpcmUoXCIuL0Fic3RyYWN0TG9nZ2VyXCIpO1xuLyoqXG4gKiBMb2dnZXIgd2hpY2ggYnVmZmVycyBhbGwgbWVzc2FnZXMsIHVzZSB3aXRoIGNhcmUgZHVlIHRvIHBvc3NpYmxlIGhpZ2ggbWVtb3J5IGZvb3RwcmludC5cbiAqIENhbiBiZSBjb252ZW5pZW50IGluIHNvbWUgY2FzZXMuIENhbGwgdG9TdHJpbmcoKSBmb3IgZnVsbCBvdXRwdXQsIG9yIGNhc3QgdG8gdGhpcyBjbGFzc1xuICogYW5kIGNhbGwgZ2V0TWVzc2FnZXMoKSB0byBkbyBzb21ldGhpbmcgd2l0aCBpdCB5b3Vyc2VsZi5cbiAqL1xudmFyIE1lc3NhZ2VCdWZmZXJMb2dnZXJJbXBsID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhNZXNzYWdlQnVmZmVyTG9nZ2VySW1wbCwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBNZXNzYWdlQnVmZmVyTG9nZ2VySW1wbChuYW1lLCBsb2dHcm91cFJ1bnRpbWVTZXR0aW5ncykge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBuYW1lLCBsb2dHcm91cFJ1bnRpbWVTZXR0aW5ncykgfHwgdGhpcztcbiAgICAgICAgX3RoaXMubWVzc2FnZXMgPSBbXTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBNZXNzYWdlQnVmZmVyTG9nZ2VySW1wbC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcbiAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5jbG9zZS5jYWxsKHRoaXMpO1xuICAgIH07XG4gICAgTWVzc2FnZUJ1ZmZlckxvZ2dlckltcGwucHJvdG90eXBlLmdldE1lc3NhZ2VzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tZXNzYWdlcztcbiAgICB9O1xuICAgIE1lc3NhZ2VCdWZmZXJMb2dnZXJJbXBsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZXMubWFwKGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgICAgIHJldHVybiBtc2c7XG4gICAgICAgIH0pLmpvaW4oXCJcXG5cIik7XG4gICAgfTtcbiAgICBNZXNzYWdlQnVmZmVyTG9nZ2VySW1wbC5wcm90b3R5cGUuZG9Mb2cgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICB2YXIgbWVzc2FnZUZvcm1hdHRlciA9IHRoaXMuX2dldE1lc3NhZ2VGb3JtYXR0ZXIoKTtcbiAgICAgICAgdmFyIGZ1bGxNc2c7XG4gICAgICAgIGlmIChtZXNzYWdlRm9ybWF0dGVyID09PSBudWxsKSB7XG4gICAgICAgICAgICBmdWxsTXNnID0gdGhpcy5jcmVhdGVEZWZhdWx0TG9nTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZ1bGxNc2cgPSBtZXNzYWdlRm9ybWF0dGVyKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWVzc2FnZXMucHVzaChmdWxsTXNnKTtcbiAgICB9O1xuICAgIHJldHVybiBNZXNzYWdlQnVmZmVyTG9nZ2VySW1wbDtcbn0oQWJzdHJhY3RMb2dnZXJfMS5BYnN0cmFjdExvZ2dlcikpO1xuZXhwb3J0cy5NZXNzYWdlQnVmZmVyTG9nZ2VySW1wbCA9IE1lc3NhZ2VCdWZmZXJMb2dnZXJJbXBsO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9TWVzc2FnZUJ1ZmZlckxvZ2dlckltcGwuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fZXhwb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19leHBvcnRTdGFyKSB8fCBmdW5jdGlvbihtLCBleHBvcnRzKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHBvcnRzLCBwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZ2V0Q2F0ZWdvcnlDb250cm9sID0gZXhwb3J0cy5nZXRMb2dDb250cm9sID0gZXhwb3J0cy5oZWxwID0gZXhwb3J0cy5NZXNzYWdlRm9ybWF0VXRpbHMgPSBleHBvcnRzLkxpbmtlZExpc3QgPSBleHBvcnRzLlNpbXBsZU1hcCA9IGV4cG9ydHMuTG9nTGV2ZWwgPSBleHBvcnRzLkxvZ2dlclR5cGUgPSBleHBvcnRzLkxvZ0Zvcm1hdCA9IGV4cG9ydHMuRGF0ZUZvcm1hdEVudW0gPSBleHBvcnRzLkRhdGVGb3JtYXQgPSBleHBvcnRzLkNhdGVnb3J5TG9nRm9ybWF0ID0gZXhwb3J0cy5NZXNzYWdlQnVmZmVyTG9nZ2VySW1wbCA9IGV4cG9ydHMuQ29uc29sZUxvZ2dlckltcGwgPSBleHBvcnRzLkFic3RyYWN0TG9nZ2VyID0gZXhwb3J0cy5MRlNlcnZpY2UgPSBleHBvcnRzLkxvZ0dyb3VwUnVsZSA9IGV4cG9ydHMuTG9nZ2VyRmFjdG9yeU9wdGlvbnMgPSBleHBvcnRzLkNhdGVnb3J5U2VydmljZUZhY3RvcnkgPSBleHBvcnRzLkNhdGVnb3J5TWVzc2FnZUJ1ZmZlckxvZ2dlckltcGwgPSBleHBvcnRzLkNhdGVnb3J5Q29uZmlndXJhdGlvbiA9IGV4cG9ydHMuQ2F0ZWdvcnlSdW50aW1lU2V0dGluZ3MgPSBleHBvcnRzLkNhdGVnb3J5ID0gZXhwb3J0cy5DYXRlZ29yeURlbGVnYXRlTG9nZ2VySW1wbCA9IGV4cG9ydHMuQ2F0ZWdvcnlDb25zb2xlTG9nZ2VySW1wbCA9IGV4cG9ydHMuQWJzdHJhY3RDYXRlZ29yeUxvZ2dlciA9IGV4cG9ydHMuRXh0ZW5zaW9uSGVscGVyID0gdm9pZCAwO1xudmFyIExvZ0dyb3VwQ29udHJvbF8xID0gcmVxdWlyZShcIi4vY29udHJvbC9Mb2dHcm91cENvbnRyb2xcIik7XG52YXIgQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbF8xID0gcmVxdWlyZShcIi4vY29udHJvbC9DYXRlZ29yeVNlcnZpY2VDb250cm9sXCIpO1xuLy8gUHVibGljIHN0dWZmIHdlIGV4cG9ydCBmb3IgZXh0ZW5zaW9uXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vZXh0ZW5zaW9uL01lc3NhZ2VzVG9FeHRlbnNpb25KU09OXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9leHRlbnNpb24vTWVzc2FnZXNGcm9tRXh0ZW5zaW9uSlNPTlwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vZXh0ZW5zaW9uL0V4dGVuc2lvbk1lc3NhZ2VKU09OXCIpLCBleHBvcnRzKTtcbnZhciBFeHRlbnNpb25IZWxwZXJfMSA9IHJlcXVpcmUoXCIuL2V4dGVuc2lvbi9FeHRlbnNpb25IZWxwZXJcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJFeHRlbnNpb25IZWxwZXJcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIEV4dGVuc2lvbkhlbHBlcl8xLkV4dGVuc2lvbkhlbHBlcjsgfSB9KTtcbi8vIENhdGVnb3J5IHJlbGF0ZWRcbnZhciBBYnN0cmFjdENhdGVnb3J5TG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9sb2cvY2F0ZWdvcnkvQWJzdHJhY3RDYXRlZ29yeUxvZ2dlclwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkFic3RyYWN0Q2F0ZWdvcnlMb2dnZXJcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIEFic3RyYWN0Q2F0ZWdvcnlMb2dnZXJfMS5BYnN0cmFjdENhdGVnb3J5TG9nZ2VyOyB9IH0pO1xudmFyIENhdGVnb3J5Q29uc29sZUxvZ2dlckltcGxfMSA9IHJlcXVpcmUoXCIuL2xvZy9jYXRlZ29yeS9DYXRlZ29yeUNvbnNvbGVMb2dnZXJJbXBsXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiQ2F0ZWdvcnlDb25zb2xlTG9nZ2VySW1wbFwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gQ2F0ZWdvcnlDb25zb2xlTG9nZ2VySW1wbF8xLkNhdGVnb3J5Q29uc29sZUxvZ2dlckltcGw7IH0gfSk7XG52YXIgQ2F0ZWdvcnlEZWxlZ2F0ZUxvZ2dlckltcGxfMSA9IHJlcXVpcmUoXCIuL2xvZy9jYXRlZ29yeS9DYXRlZ29yeURlbGVnYXRlTG9nZ2VySW1wbFwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkNhdGVnb3J5RGVsZWdhdGVMb2dnZXJJbXBsXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBDYXRlZ29yeURlbGVnYXRlTG9nZ2VySW1wbF8xLkNhdGVnb3J5RGVsZWdhdGVMb2dnZXJJbXBsOyB9IH0pO1xudmFyIENhdGVnb3J5XzEgPSByZXF1aXJlKFwiLi9sb2cvY2F0ZWdvcnkvQ2F0ZWdvcnlcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJDYXRlZ29yeVwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gQ2F0ZWdvcnlfMS5DYXRlZ29yeTsgfSB9KTtcbnZhciBDYXRlZ29yeVJ1bnRpbWVTZXR0aW5nc18xID0gcmVxdWlyZShcIi4vbG9nL2NhdGVnb3J5L0NhdGVnb3J5UnVudGltZVNldHRpbmdzXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiQ2F0ZWdvcnlSdW50aW1lU2V0dGluZ3NcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIENhdGVnb3J5UnVudGltZVNldHRpbmdzXzEuQ2F0ZWdvcnlSdW50aW1lU2V0dGluZ3M7IH0gfSk7XG52YXIgQ2F0ZWdvcnlDb25maWd1cmF0aW9uXzEgPSByZXF1aXJlKFwiLi9sb2cvY2F0ZWdvcnkvQ2F0ZWdvcnlDb25maWd1cmF0aW9uXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiQ2F0ZWdvcnlDb25maWd1cmF0aW9uXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBDYXRlZ29yeUNvbmZpZ3VyYXRpb25fMS5DYXRlZ29yeUNvbmZpZ3VyYXRpb247IH0gfSk7XG52YXIgQ2F0ZWdvcnlNZXNzYWdlQnVmZmVySW1wbF8xID0gcmVxdWlyZShcIi4vbG9nL2NhdGVnb3J5L0NhdGVnb3J5TWVzc2FnZUJ1ZmZlckltcGxcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJDYXRlZ29yeU1lc3NhZ2VCdWZmZXJMb2dnZXJJbXBsXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBDYXRlZ29yeU1lc3NhZ2VCdWZmZXJJbXBsXzEuQ2F0ZWdvcnlNZXNzYWdlQnVmZmVyTG9nZ2VySW1wbDsgfSB9KTtcbnZhciBDYXRlZ29yeVNlcnZpY2VGYWN0b3J5XzEgPSByZXF1aXJlKFwiLi9sb2cvY2F0ZWdvcnkvQ2F0ZWdvcnlTZXJ2aWNlRmFjdG9yeVwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkNhdGVnb3J5U2VydmljZUZhY3RvcnlcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIENhdGVnb3J5U2VydmljZUZhY3RvcnlfMS5DYXRlZ29yeVNlcnZpY2VGYWN0b3J5OyB9IH0pO1xudmFyIExvZ2dlckZhY3RvcnlPcHRpb25zXzEgPSByZXF1aXJlKFwiLi9sb2cvc3RhbmRhcmQvTG9nZ2VyRmFjdG9yeU9wdGlvbnNcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJMb2dnZXJGYWN0b3J5T3B0aW9uc1wiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gTG9nZ2VyRmFjdG9yeU9wdGlvbnNfMS5Mb2dnZXJGYWN0b3J5T3B0aW9uczsgfSB9KTtcbnZhciBMb2dHcm91cFJ1bGVfMSA9IHJlcXVpcmUoXCIuL2xvZy9zdGFuZGFyZC9Mb2dHcm91cFJ1bGVcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJMb2dHcm91cFJ1bGVcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIExvZ0dyb3VwUnVsZV8xLkxvZ0dyb3VwUnVsZTsgfSB9KTtcbnZhciBMRlNlcnZpY2VfMSA9IHJlcXVpcmUoXCIuL2xvZy9zdGFuZGFyZC9MRlNlcnZpY2VcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJMRlNlcnZpY2VcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIExGU2VydmljZV8xLkxGU2VydmljZTsgfSB9KTtcbnZhciBBYnN0cmFjdExvZ2dlcl8xID0gcmVxdWlyZShcIi4vbG9nL3N0YW5kYXJkL0Fic3RyYWN0TG9nZ2VyXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiQWJzdHJhY3RMb2dnZXJcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIEFic3RyYWN0TG9nZ2VyXzEuQWJzdHJhY3RMb2dnZXI7IH0gfSk7XG52YXIgQ29uc29sZUxvZ2dlckltcGxfMSA9IHJlcXVpcmUoXCIuL2xvZy9zdGFuZGFyZC9Db25zb2xlTG9nZ2VySW1wbFwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkNvbnNvbGVMb2dnZXJJbXBsXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBDb25zb2xlTG9nZ2VySW1wbF8xLkNvbnNvbGVMb2dnZXJJbXBsOyB9IH0pO1xudmFyIE1lc3NhZ2VCdWZmZXJMb2dnZXJJbXBsXzEgPSByZXF1aXJlKFwiLi9sb2cvc3RhbmRhcmQvTWVzc2FnZUJ1ZmZlckxvZ2dlckltcGxcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJNZXNzYWdlQnVmZmVyTG9nZ2VySW1wbFwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gTWVzc2FnZUJ1ZmZlckxvZ2dlckltcGxfMS5NZXNzYWdlQnVmZmVyTG9nZ2VySW1wbDsgfSB9KTtcbnZhciBMb2dnZXJPcHRpb25zXzEgPSByZXF1aXJlKFwiLi9sb2cvTG9nZ2VyT3B0aW9uc1wiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkNhdGVnb3J5TG9nRm9ybWF0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBMb2dnZXJPcHRpb25zXzEuQ2F0ZWdvcnlMb2dGb3JtYXQ7IH0gfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJEYXRlRm9ybWF0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBMb2dnZXJPcHRpb25zXzEuRGF0ZUZvcm1hdDsgfSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkRhdGVGb3JtYXRFbnVtXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBMb2dnZXJPcHRpb25zXzEuRGF0ZUZvcm1hdEVudW07IH0gfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJMb2dGb3JtYXRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIExvZ2dlck9wdGlvbnNfMS5Mb2dGb3JtYXQ7IH0gfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJMb2dnZXJUeXBlXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBMb2dnZXJPcHRpb25zXzEuTG9nZ2VyVHlwZTsgfSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkxvZ0xldmVsXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWw7IH0gfSk7XG4vLyBVdGlsaXRpZXNcbnZhciBEYXRhU3RydWN0dXJlc18xID0gcmVxdWlyZShcIi4vdXRpbHMvRGF0YVN0cnVjdHVyZXNcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJTaW1wbGVNYXBcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIERhdGFTdHJ1Y3R1cmVzXzEuU2ltcGxlTWFwOyB9IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiTGlua2VkTGlzdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gRGF0YVN0cnVjdHVyZXNfMS5MaW5rZWRMaXN0OyB9IH0pO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL3V0aWxzL0pTT05IZWxwZXJcIiksIGV4cG9ydHMpO1xudmFyIE1lc3NhZ2VVdGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHMvTWVzc2FnZVV0aWxzXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiTWVzc2FnZUZvcm1hdFV0aWxzXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBNZXNzYWdlVXRpbHNfMS5NZXNzYWdlRm9ybWF0VXRpbHM7IH0gfSk7XG4vKlxuIEZ1bmN0aW9ucyB0byBleHBvcnQgb24gVFNMIGxpYmFyYXJ5IHZhci5cbiovXG4vLyBFeHBvcnQgaGVscCBmdW5jdGlvblxuZnVuY3Rpb24gaGVscCgpIHtcbiAgICAvKiB0c2xpbnQ6ZGlzYWJsZTpuby1jb25zb2xlICovXG4gICAgY29uc29sZS5sb2coXCJoZWxwKClcXG4gICAqKiBTaG93cyB0aGlzIGhlbHBcXG5cXG4gZ2V0TG9nQ29udHJvbCgpOiBMb2dnZXJDb250cm9sXFxuICAgKiogUmV0dXJucyBMb2dnZXJDb250cm9sIE9iamVjdCwgdXNlIHRvIGR5bmFtaWNhbGx5IGNoYW5nZSBsb2dsZXZlbHMgZm9yIGxvZzRqIGxvZ2dpbmcuXFxuICAgKiogQ2FsbCAuaGVscCgpIG9uIExvZ2dlckNvbnRyb2wgb2JqZWN0IGZvciBhdmFpbGFibGUgb3B0aW9ucy5cXG5cXG4gZ2V0Q2F0ZWdvcnlDb250cm9sKCk6IENhdGVnb3J5U2VydmljZUNvbnRyb2xcXG4gICAqKiBSZXR1cm5zIENhdGVnb3J5U2VydmljZUNvbnRyb2wgT2JqZWN0LCB1c2UgdG8gZHluYW1pY2FsbHkgY2hhbmdlIGxvZ2xldmVscyBmb3IgY2F0ZWdvcnkgbG9nZ2luZy5cXG4gICAqKiBDYWxsIC5oZWxwKCkgb24gQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbCBvYmplY3QgZm9yIGF2YWlsYWJsZSBvcHRpb25zLlxcblwiKTtcbiAgICAvKiB0c2xpbnQ6ZW5hYmxlOm5vLWNvbnNvbGUgKi9cbn1cbmV4cG9ydHMuaGVscCA9IGhlbHA7XG4vLyBFeHBvcnQgTG9nQ29udHJvbCBmdW5jdGlvbiAobG9nNGopXG5mdW5jdGlvbiBnZXRMb2dDb250cm9sKCkge1xuICAgIHJldHVybiBuZXcgTG9nR3JvdXBDb250cm9sXzEuTG9nZ2VyQ29udHJvbEltcGwoKTtcbn1cbmV4cG9ydHMuZ2V0TG9nQ29udHJvbCA9IGdldExvZ0NvbnRyb2w7XG4vLyBFeHBvcnQgQ2F0ZWdvcnlDb250cm9sIGZ1bmN0aW9uXG5mdW5jdGlvbiBnZXRDYXRlZ29yeUNvbnRyb2woKSB7XG4gICAgcmV0dXJuIG5ldyBDYXRlZ29yeVNlcnZpY2VDb250cm9sXzEuQ2F0ZWdvcnlTZXJ2aWNlQ29udHJvbEltcGwoKTtcbn1cbmV4cG9ydHMuZ2V0Q2F0ZWdvcnlDb250cm9sID0gZ2V0Q2F0ZWdvcnlDb250cm9sO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dHlwZXNjcmlwdC1sb2dnaW5nLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5TdHJpbmdCdWlsZGVyID0gZXhwb3J0cy5UdXBsZVBhaXIgPSBleHBvcnRzLlNpbXBsZU1hcCA9IGV4cG9ydHMuTGlua2VkTGlzdCA9IHZvaWQgMDtcbnZhciBMaW5rZWROb2RlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIExpbmtlZE5vZGUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fcHJldmlvdXMgPSBudWxsO1xuICAgICAgICB0aGlzLl9uZXh0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KExpbmtlZE5vZGUucHJvdG90eXBlLCBcInByZXZpb3VzXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcHJldmlvdXM7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9wcmV2aW91cyA9IHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KExpbmtlZE5vZGUucHJvdG90eXBlLCBcIm5leHRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9uZXh0O1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fbmV4dCA9IHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KExpbmtlZE5vZGUucHJvdG90eXBlLCBcInZhbHVlXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gTGlua2VkTm9kZTtcbn0oKSk7XG4vKipcbiAqIERvdWJsZSBsaW5rZWRsaXN0IGltcGxlbWVudGF0aW9uLlxuICovXG52YXIgTGlua2VkTGlzdCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBMaW5rZWRMaXN0KCkge1xuICAgICAgICB0aGlzLmhlYWQgPSBudWxsO1xuICAgICAgICB0aGlzLnNpemUgPSAwO1xuICAgIH1cbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS5hZGRIZWFkID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmICghdGhpcy5jcmVhdGVIZWFkSWZOZWVkZWQodmFsdWUpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oZWFkICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dE5vZGUgPSB0aGlzLmhlYWQubmV4dDtcbiAgICAgICAgICAgICAgICB2YXIgbmV3SGVhZE5vZGUgPSBuZXcgTGlua2VkTm9kZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKG5leHROb2RlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dE5vZGUucHJldmlvdXMgPSBuZXdIZWFkTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgbmV3SGVhZE5vZGUubmV4dCA9IG5leHROb2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmhlYWQgPSBuZXdIZWFkTm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbiwgbGlzdCBpbXBsZW1lbnRhdGlvbiBicm9rZW5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zaXplKys7XG4gICAgfTtcbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS5hZGRUYWlsID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmICghdGhpcy5jcmVhdGVIZWFkSWZOZWVkZWQodmFsdWUpKSB7XG4gICAgICAgICAgICB2YXIgb2xkVGFpbE5vZGUgPSB0aGlzLmdldFRhaWxOb2RlKCk7XG4gICAgICAgICAgICBpZiAob2xkVGFpbE5vZGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHZhciBuZXdUYWlsTm9kZSA9IG5ldyBMaW5rZWROb2RlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBvbGRUYWlsTm9kZS5uZXh0ID0gbmV3VGFpbE5vZGU7XG4gICAgICAgICAgICAgICAgbmV3VGFpbE5vZGUucHJldmlvdXMgPSBvbGRUYWlsTm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxpc3QgaW1wbGVtZW50YXRpb24gYnJva2VuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2l6ZSsrO1xuICAgIH07XG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaGVhZCA9IG51bGw7XG4gICAgICAgIHRoaXMuc2l6ZSA9IDA7XG4gICAgfTtcbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS5nZXRIZWFkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5oZWFkICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhlYWQudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS5yZW1vdmVIZWFkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5oZWFkICE9IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBvbGRIZWFkID0gdGhpcy5oZWFkO1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gb2xkSGVhZC52YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuaGVhZCA9IG9sZEhlYWQubmV4dDtcbiAgICAgICAgICAgIHRoaXMuc2l6ZS0tO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUuZ2V0VGFpbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLmdldFRhaWxOb2RlKCk7XG4gICAgICAgIGlmIChub2RlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUucmVtb3ZlVGFpbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLmdldFRhaWxOb2RlKCk7XG4gICAgICAgIGlmIChub2RlICE9IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChub2RlID09PSB0aGlzLmhlYWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhlYWQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHByZXZpb3VzTm9kZSA9IG5vZGUucHJldmlvdXM7XG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzTm9kZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzTm9kZS5uZXh0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxpc3QgaW1wbGVtZW50YXRpb24gaXMgYnJva2VuXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2l6ZS0tO1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS5nZXRTaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaXplO1xuICAgIH07XG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUuZmlsdGVyID0gZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgdmFyIHJlY3Vyc2UgPSBmdW5jdGlvbiAoZm4sIG5vZGUsIHZhbHVlcykge1xuICAgICAgICAgICAgaWYgKGZuKG5vZGUudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzLnB1c2gobm9kZS52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbmV4dE5vZGUgPSBub2RlLm5leHQ7XG4gICAgICAgICAgICBpZiAobmV4dE5vZGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJlY3Vyc2UoZm4sIG5leHROb2RlLCB2YWx1ZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIHZhciBjdXJyZW50Tm9kZSA9IHRoaXMuaGVhZDtcbiAgICAgICAgaWYgKGN1cnJlbnROb2RlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJlY3Vyc2UoZiwgY3VycmVudE5vZGUsIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIExpbmtlZExpc3QucHJvdG90eXBlLmNyZWF0ZUhlYWRJZk5lZWRlZCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5oZWFkID09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuaGVhZCA9IG5ldyBMaW5rZWROb2RlKHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIExpbmtlZExpc3QucHJvdG90eXBlLmdldFRhaWxOb2RlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5oZWFkID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5oZWFkO1xuICAgICAgICB3aGlsZSAobm9kZS5uZXh0ICE9IG51bGwpIHtcbiAgICAgICAgICAgIG5vZGUgPSBub2RlLm5leHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfTtcbiAgICByZXR1cm4gTGlua2VkTGlzdDtcbn0oKSk7XG5leHBvcnRzLkxpbmtlZExpc3QgPSBMaW5rZWRMaXN0O1xuLyoqXG4gKiBNYXAgaW1wbGVtZW50YXRpb24ga2V5ZWQgYnkgc3RyaW5nIChhbHdheXMpLlxuICovXG52YXIgU2ltcGxlTWFwID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNpbXBsZU1hcCgpIHtcbiAgICAgICAgdGhpcy5hcnJheSA9IHt9O1xuICAgIH1cbiAgICBTaW1wbGVNYXAucHJvdG90eXBlLnB1dCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMuYXJyYXlba2V5XSA9IHZhbHVlO1xuICAgIH07XG4gICAgU2ltcGxlTWFwLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFycmF5W2tleV07XG4gICAgfTtcbiAgICBTaW1wbGVNYXAucHJvdG90eXBlLmV4aXN0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5hcnJheVtrZXldO1xuICAgICAgICByZXR1cm4gKHR5cGVvZiB2YWx1ZSAhPT0gXCJ1bmRlZmluZWRcIik7XG4gICAgfTtcbiAgICBTaW1wbGVNYXAucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5hcnJheVtrZXldO1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5hcnJheVtrZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICAgIFNpbXBsZU1hcC5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGtleXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuYXJyYXkpIHtcbiAgICAgICAgICAgIC8vIFRvIHByZXZlbnQgcmFuZG9tIHN0dWZmIHRvIGFwcGVhclxuICAgICAgICAgICAgaWYgKHRoaXMuYXJyYXkuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIGtleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXlzO1xuICAgIH07XG4gICAgU2ltcGxlTWFwLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuYXJyYXkpIHtcbiAgICAgICAgICAgIC8vIFRvIHByZXZlbnQgcmFuZG9tIHN0dWZmIHRvIGFwcGVhclxuICAgICAgICAgICAgaWYgKHRoaXMuYXJyYXkuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKHRoaXMuZ2V0KGtleSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgfTtcbiAgICBTaW1wbGVNYXAucHJvdG90eXBlLnNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmtleXMoKS5sZW5ndGg7XG4gICAgfTtcbiAgICBTaW1wbGVNYXAucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNpemUoKSA9PT0gMDtcbiAgICB9O1xuICAgIFNpbXBsZU1hcC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYXJyYXkgPSB7fTtcbiAgICB9O1xuICAgIFNpbXBsZU1hcC5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYkZ1bmN0aW9uKSB7XG4gICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmFycmF5KSB7XG4gICAgICAgICAgICAvLyBUbyBwcmV2ZW50IHJhbmRvbSBzdHVmZiB0byBhcHBlYXJcbiAgICAgICAgICAgIGlmICh0aGlzLmFycmF5Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLmFycmF5W2tleV07XG4gICAgICAgICAgICAgICAgY2JGdW5jdGlvbihrZXksIHZhbHVlLCBjb3VudCk7XG4gICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgU2ltcGxlTWFwLnByb3RvdHlwZS5mb3JFYWNoVmFsdWUgPSBmdW5jdGlvbiAoY2JGdW5jdGlvbikge1xuICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5hcnJheSkge1xuICAgICAgICAgICAgLy8gVG8gcHJldmVudCByYW5kb20gc3R1ZmYgdG8gYXBwZWFyXG4gICAgICAgICAgICBpZiAodGhpcy5hcnJheS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5hcnJheVtrZXldO1xuICAgICAgICAgICAgICAgIGNiRnVuY3Rpb24odmFsdWUsIGNvdW50KTtcbiAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gU2ltcGxlTWFwO1xufSgpKTtcbmV4cG9ydHMuU2ltcGxlTWFwID0gU2ltcGxlTWFwO1xuLyoqXG4gKiBUdXBsZSB0byBob2xkIHR3byB2YWx1ZXMuXG4gKi9cbnZhciBUdXBsZVBhaXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gVHVwbGVQYWlyKHgsIHkpIHtcbiAgICAgICAgdGhpcy5feCA9IHg7XG4gICAgICAgIHRoaXMuX3kgPSB5O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVHVwbGVQYWlyLnByb3RvdHlwZSwgXCJ4XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5feDtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3ggPSB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUdXBsZVBhaXIucHJvdG90eXBlLCBcInlcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl95O1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5feSA9IHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIFR1cGxlUGFpcjtcbn0oKSk7XG5leHBvcnRzLlR1cGxlUGFpciA9IFR1cGxlUGFpcjtcbi8qKlxuICogVXRpbGl0eSBjbGFzcyB0byBidWlsZCB1cCBhIHN0cmluZy5cbiAqL1xudmFyIFN0cmluZ0J1aWxkZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU3RyaW5nQnVpbGRlcigpIHtcbiAgICAgICAgdGhpcy5kYXRhID0gW107XG4gICAgfVxuICAgIFN0cmluZ0J1aWxkZXIucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICAgIGlmIChsaW5lID09PSB1bmRlZmluZWQgfHwgbGluZSA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdHJpbmcgbXVzdCBiZSBzZXQsIGNhbm5vdCBhcHBlbmQgbnVsbCBvciB1bmRlZmluZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kYXRhLnB1c2gobGluZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgU3RyaW5nQnVpbGRlci5wcm90b3R5cGUuYXBwZW5kTGluZSA9IGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICAgIHRoaXMuZGF0YS5wdXNoKGxpbmUgKyBcIlxcblwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBTdHJpbmdCdWlsZGVyLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aCA9PT0gMDtcbiAgICB9O1xuICAgIFN0cmluZ0J1aWxkZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmRhdGEgPSBbXTtcbiAgICB9O1xuICAgIFN0cmluZ0J1aWxkZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKHNlcGFyYXRvcikge1xuICAgICAgICBpZiAoc2VwYXJhdG9yID09PSB2b2lkIDApIHsgc2VwYXJhdG9yID0gXCJcIjsgfVxuICAgICAgICByZXR1cm4gdGhpcy5kYXRhLmpvaW4oc2VwYXJhdG9yKTtcbiAgICB9O1xuICAgIHJldHVybiBTdHJpbmdCdWlsZGVyO1xufSgpKTtcbmV4cG9ydHMuU3RyaW5nQnVpbGRlciA9IFN0cmluZ0J1aWxkZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1EYXRhU3RydWN0dXJlcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2xhc3MgZXh0ZW5kcyB2YWx1ZSBcIiArIFN0cmluZyhiKSArIFwiIGlzIG5vdCBhIGNvbnN0cnVjdG9yIG9yIG51bGxcIik7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkpTT05IZWxwZXIgPSBleHBvcnRzLkpTT05BcnJheSA9IGV4cG9ydHMuSlNPTk9iamVjdCA9IHZvaWQgMDtcbi8qKlxuICogTW9kdWxlIGNvbnRhaW5pbmcgYnVuY2ggb2YgSlNPTiByZWxhdGVkIHN0dWZmLlxuICovXG52YXIgTG9nZ2VyT3B0aW9uc18xID0gcmVxdWlyZShcIi4uL2xvZy9Mb2dnZXJPcHRpb25zXCIpO1xudmFyIERhdGFTdHJ1Y3R1cmVzXzEgPSByZXF1aXJlKFwiLi9EYXRhU3RydWN0dXJlc1wiKTtcbnZhciBKU09OVHlwZUltcGwgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSlNPTlR5cGVJbXBsKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIEpTT05UeXBlSW1wbC5wcm90b3R5cGUuZ2V0VmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgICB9O1xuICAgIHJldHVybiBKU09OVHlwZUltcGw7XG59KCkpO1xudmFyIEpTT05Cb29sZWFuVHlwZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoSlNPTkJvb2xlYW5UeXBlLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIEpTT05Cb29sZWFuVHlwZSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcywgdmFsdWUpIHx8IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBKU09OQm9vbGVhblR5cGU7XG59KEpTT05UeXBlSW1wbCkpO1xudmFyIEpTT05OdW1iZXJUeXBlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhKU09OTnVtYmVyVHlwZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBKU09OTnVtYmVyVHlwZSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcywgdmFsdWUpIHx8IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBKU09OTnVtYmVyVHlwZTtcbn0oSlNPTlR5cGVJbXBsKSk7XG52YXIgSlNPTlN0cmluZ1R5cGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKEpTT05TdHJpbmdUeXBlLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIEpTT05TdHJpbmdUeXBlKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBfc3VwZXIuY2FsbCh0aGlzLCB2YWx1ZSkgfHwgdGhpcztcbiAgICB9XG4gICAgSlNPTlN0cmluZ1R5cGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG4gICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUudG9TdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFwibnVsbFwiO1xuICAgIH07XG4gICAgcmV0dXJuIEpTT05TdHJpbmdUeXBlO1xufShKU09OVHlwZUltcGwpKTtcbnZhciBKU09OT2JqZWN0VHlwZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoSlNPTk9iamVjdFR5cGUsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gSlNPTk9iamVjdFR5cGUodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIF9zdXBlci5jYWxsKHRoaXMsIHZhbHVlKSB8fCB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gSlNPTk9iamVjdFR5cGU7XG59KEpTT05UeXBlSW1wbCkpO1xudmFyIEpTT05BcnJheVR5cGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKEpTT05BcnJheVR5cGUsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gSlNPTkFycmF5VHlwZSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcywgdmFsdWUpIHx8IHRoaXM7XG4gICAgfVxuICAgIEpTT05BcnJheVR5cGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG4gICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCJudWxsXCI7XG4gICAgfTtcbiAgICByZXR1cm4gSlNPTkFycmF5VHlwZTtcbn0oSlNPTlR5cGVJbXBsKSk7XG52YXIgSlNPTk51bGxUeXBlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhKU09OTnVsbFR5cGUsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gSlNPTk51bGxUeXBlKCkge1xuICAgICAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcywgbnVsbCkgfHwgdGhpcztcbiAgICB9XG4gICAgSlNPTk51bGxUeXBlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFwibnVsbFwiO1xuICAgIH07XG4gICAgcmV0dXJuIEpTT05OdWxsVHlwZTtcbn0oSlNPTlR5cGVJbXBsKSk7XG52YXIgSlNPTlR5cGVDb252ZXJ0ZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSlNPTlR5cGVDb252ZXJ0ZXIoKSB7XG4gICAgfVxuICAgIEpTT05UeXBlQ29udmVydGVyLnRvSlNPTlR5cGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEpTT05OdWxsVHlwZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgSlNPTlN0cmluZ1R5cGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgSlNPTk51bWJlclR5cGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEpTT05Cb29sZWFuVHlwZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSlNPTk9iamVjdCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBKU09OT2JqZWN0VHlwZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVHlwZSBub3Qgc3VwcG9ydGVkIGZvciB2YWx1ZTogXCIgKyB2YWx1ZSk7XG4gICAgfTtcbiAgICByZXR1cm4gSlNPTlR5cGVDb252ZXJ0ZXI7XG59KCkpO1xudmFyIEpTT05PYmplY3QgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSlNPTk9iamVjdCgpIHtcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBuZXcgRGF0YVN0cnVjdHVyZXNfMS5TaW1wbGVNYXAoKTtcbiAgICB9XG4gICAgSlNPTk9iamVjdC5wcm90b3R5cGUuYWRkQm9vbGVhbiA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLmNoZWNrTmFtZShuYW1lKTtcbiAgICAgICAgSlNPTk9iamVjdC5jaGVja1ZhbHVlKHZhbHVlKTtcbiAgICAgICAgdGhpcy52YWx1ZXMucHV0KG5hbWUsIG5ldyBKU09OQm9vbGVhblR5cGUodmFsdWUpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBKU09OT2JqZWN0LnByb3RvdHlwZS5hZGROdW1iZXIgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5jaGVja05hbWUobmFtZSk7XG4gICAgICAgIEpTT05PYmplY3QuY2hlY2tWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIHRoaXMudmFsdWVzLnB1dChuYW1lLCBuZXcgSlNPTk51bWJlclR5cGUodmFsdWUpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBKU09OT2JqZWN0LnByb3RvdHlwZS5hZGRTdHJpbmcgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5jaGVja05hbWUobmFtZSk7XG4gICAgICAgIEpTT05PYmplY3QuY2hlY2tWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIHRoaXMudmFsdWVzLnB1dChuYW1lLCBuZXcgSlNPTlN0cmluZ1R5cGUodmFsdWUpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBKU09OT2JqZWN0LnByb3RvdHlwZS5hZGROdWxsID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgdGhpcy5jaGVja05hbWUobmFtZSk7XG4gICAgICAgIHRoaXMudmFsdWVzLnB1dChuYW1lLCBuZXcgSlNPTk51bGxUeXBlKCkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIEpTT05PYmplY3QucHJvdG90eXBlLmFkZEFycmF5ID0gZnVuY3Rpb24gKG5hbWUsIGFycmF5KSB7XG4gICAgICAgIHRoaXMuY2hlY2tOYW1lKG5hbWUpO1xuICAgICAgICBKU09OT2JqZWN0LmNoZWNrVmFsdWUoYXJyYXkpO1xuICAgICAgICBpZiAoYXJyYXkgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGFkZCBhcnJheSBhcyBudWxsXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmFsdWVzLnB1dChuYW1lLCBuZXcgSlNPTkFycmF5VHlwZShhcnJheSkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIEpTT05PYmplY3QucHJvdG90eXBlLmFkZE9iamVjdCA9IGZ1bmN0aW9uIChuYW1lLCBvYmplY3QpIHtcbiAgICAgICAgdGhpcy5jaGVja05hbWUobmFtZSk7XG4gICAgICAgIEpTT05PYmplY3QuY2hlY2tWYWx1ZShvYmplY3QpO1xuICAgICAgICBpZiAob2JqZWN0ID09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBhZGQgb2JqZWN0IGFzIG51bGxcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52YWx1ZXMucHV0KG5hbWUsIG5ldyBKU09OT2JqZWN0VHlwZShvYmplY3QpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBKU09OT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChwcmV0dHkpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKHByZXR0eSA9PT0gdm9pZCAwKSB7IHByZXR0eSA9IGZhbHNlOyB9XG4gICAgICAgIHZhciBjb21tYSA9IGZhbHNlO1xuICAgICAgICB2YXIgYnVmZmVyID0gbmV3IERhdGFTdHJ1Y3R1cmVzXzEuU3RyaW5nQnVpbGRlcigpO1xuICAgICAgICBidWZmZXIuYXBwZW5kKFwie1wiKTtcbiAgICAgICAgdGhpcy52YWx1ZXMua2V5cygpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gX3RoaXMudmFsdWVzLmdldChrZXkpO1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29tbWEpIHtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyLmFwcGVuZChcIixcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJ1ZmZlci5hcHBlbmQoJ1wiJykuYXBwZW5kKGtleSkuYXBwZW5kKCdcIjonKS5hcHBlbmQodmFsdWUudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgY29tbWEgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYnVmZmVyLmFwcGVuZChcIn1cIik7XG4gICAgICAgIHJldHVybiBidWZmZXIudG9TdHJpbmcoKTtcbiAgICB9O1xuICAgIEpTT05PYmplY3QucHJvdG90eXBlLmNoZWNrTmFtZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIGlmIChuYW1lID09IG51bGwgfHwgbmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOYW1lIGlzIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnZhbHVlcy5leGlzdHMobmFtZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5hbWUgXCIgKyBuYW1lICsgXCIgaXMgYWxyZWFkeSBwcmVzZW50IGZvciB0aGlzIG9iamVjdFwiKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgSlNPTk9iamVjdC5jaGVja1ZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWYWx1ZSBpcyB1bmRlZmluZWRcIik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBKU09OT2JqZWN0O1xufSgpKTtcbmV4cG9ydHMuSlNPTk9iamVjdCA9IEpTT05PYmplY3Q7XG52YXIgSlNPTkFycmF5ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEpTT05BcnJheSgpIHtcbiAgICAgICAgdGhpcy5vYmplY3RzID0gW107XG4gICAgfVxuICAgIEpTT05BcnJheS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9iamVjdCBpcyBub3QgYWxsb3dlZCB0byBiZSB1bmRlZmluZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vYmplY3RzLnB1c2goSlNPTlR5cGVDb252ZXJ0ZXIudG9KU09OVHlwZShvYmplY3QpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBKU09OQXJyYXkucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKHByZXR0eSkge1xuICAgICAgICBpZiAocHJldHR5ID09PSB2b2lkIDApIHsgcHJldHR5ID0gZmFsc2U7IH1cbiAgICAgICAgdmFyIGJ1ZmZlciA9IG5ldyBEYXRhU3RydWN0dXJlc18xLlN0cmluZ0J1aWxkZXIoKTtcbiAgICAgICAgYnVmZmVyLmFwcGVuZChcIltcIik7XG4gICAgICAgIHRoaXMub2JqZWN0cy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICBidWZmZXIuYXBwZW5kKFwiLFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ1ZmZlci5hcHBlbmQodmFsdWUudG9TdHJpbmcoKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBidWZmZXIuYXBwZW5kKFwiXVwiKTtcbiAgICAgICAgcmV0dXJuIGJ1ZmZlci50b1N0cmluZygpO1xuICAgIH07XG4gICAgcmV0dXJuIEpTT05BcnJheTtcbn0oKSk7XG5leHBvcnRzLkpTT05BcnJheSA9IEpTT05BcnJheTtcbi8qKlxuICogVXRpbGl0eSBjbGFzcyB0aGF0IGhlbHBzIHVzIGNvbnZlcnQgdGhpbmdzIHRvIGFuZCBmcm9tIGpzb24gKG5vdCBmb3Igbm9ybWFsIHVzYWdlKS5cbiAqL1xudmFyIEpTT05IZWxwZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSlNPTkhlbHBlcigpIHtcbiAgICB9XG4gICAgSlNPTkhlbHBlci5jYXRlZ29yeVRvSlNPTiA9IGZ1bmN0aW9uIChjYXQsIHJlY3Vyc2l2ZSkge1xuICAgICAgICAvKlxuICAgICAgICAge1xuICAgICAgICAgXCJjYXRlZ29yaWVzXCI6XG4gICAgICAgICBbXG4gICAgICAgICB7IGlkPTEsXG4gICAgICAgICBuYW1lOiBcInhcIixcbiAgICAgICAgIHBhcmVudDogbnVsbCxcbiAgICAgICAgIGxvZ0xldmVsOiBcIkVycm9yXCJcbiAgICAgICAgIH0sXG4gICAgICAgICB7IGlkPTIsXG4gICAgICAgICBuYW1lOiBcInlcIixcbiAgICAgICAgIHBhcmVudDogMSxcbiAgICAgICAgIGxvZ0xldmVsOiBcIkVycm9yXCJcbiAgICAgICAgIH1cbiAgICAgICAgIF1cbiAgICAgICAgIH1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBhcnIgPSBuZXcgSlNPTkFycmF5KCk7XG4gICAgICAgIEpTT05IZWxwZXIuX2NhdGVnb3J5VG9KU09OKGNhdCwgYXJyLCByZWN1cnNpdmUpO1xuICAgICAgICB2YXIgb2JqZWN0ID0gbmV3IEpTT05PYmplY3QoKTtcbiAgICAgICAgb2JqZWN0LmFkZEFycmF5KFwiY2F0ZWdvcmllc1wiLCBhcnIpO1xuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH07XG4gICAgSlNPTkhlbHBlci5fY2F0ZWdvcnlUb0pTT04gPSBmdW5jdGlvbiAoY2F0LCBhcnIsIHJlY3Vyc2l2ZSkge1xuICAgICAgICB2YXIgb2JqZWN0ID0gbmV3IEpTT05PYmplY3QoKTtcbiAgICAgICAgb2JqZWN0LmFkZE51bWJlcihcImlkXCIsIGNhdC5pZCk7XG4gICAgICAgIG9iamVjdC5hZGRTdHJpbmcoXCJuYW1lXCIsIGNhdC5uYW1lKTtcbiAgICAgICAgb2JqZWN0LmFkZFN0cmluZyhcImxvZ0xldmVsXCIsIExvZ2dlck9wdGlvbnNfMS5Mb2dMZXZlbFtjYXQubG9nTGV2ZWxdLnRvU3RyaW5nKCkpO1xuICAgICAgICBpZiAoY2F0LnBhcmVudCAhPSBudWxsKSB7XG4gICAgICAgICAgICBvYmplY3QuYWRkTnVtYmVyKFwicGFyZW50XCIsIGNhdC5wYXJlbnQuaWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgb2JqZWN0LmFkZE51bGwoXCJwYXJlbnRcIik7XG4gICAgICAgIH1cbiAgICAgICAgYXJyLmFkZChvYmplY3QpO1xuICAgICAgICBpZiAocmVjdXJzaXZlKSB7XG4gICAgICAgICAgICBjYXQuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgICAgICAgICAgICBKU09OSGVscGVyLl9jYXRlZ29yeVRvSlNPTihjaGlsZCwgYXJyLCByZWN1cnNpdmUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBKU09OSGVscGVyO1xufSgpKTtcbmV4cG9ydHMuSlNPTkhlbHBlciA9IEpTT05IZWxwZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1KU09OSGVscGVyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5NZXNzYWdlRm9ybWF0VXRpbHMgPSB2b2lkIDA7XG52YXIgU1QgPSByZXF1aXJlKFwic3RhY2t0cmFjZS1qc1wiKTtcbnZhciBMb2dnZXJPcHRpb25zXzEgPSByZXF1aXJlKFwiLi4vbG9nL0xvZ2dlck9wdGlvbnNcIik7XG4vKipcbiAqIFNvbWUgdXRpbGl0aWVzIHRvIGZvcm1hdCBtZXNzYWdlcy5cbiAqL1xudmFyIE1lc3NhZ2VGb3JtYXRVdGlscyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBNZXNzYWdlRm9ybWF0VXRpbHMoKSB7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbmRlciBnaXZlbiBkYXRlIGluIGdpdmVuIERhdGVGb3JtYXQgYW5kIHJldHVybiBhcyBTdHJpbmcuXG4gICAgICogQHBhcmFtIGRhdGUgRGF0ZVxuICAgICAqIEBwYXJhbSBkYXRlRm9ybWF0IEZvcm1hdFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IEZvcm1hdHRlZCBkYXRlXG4gICAgICovXG4gICAgTWVzc2FnZUZvcm1hdFV0aWxzLnJlbmRlckRhdGUgPSBmdW5jdGlvbiAoZGF0ZSwgZGF0ZUZvcm1hdCkge1xuICAgICAgICB2YXIgbHBhZCA9IGZ1bmN0aW9uICh2YWx1ZSwgY2hhcnMsIHBhZFdpdGgpIHtcbiAgICAgICAgICAgIHZhciBob3dNYW55ID0gY2hhcnMgLSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgICBpZiAoaG93TWFueSA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzID0gXCJcIjtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvd01hbnk7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICByZXMgKz0gcGFkV2l0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzICs9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBmdWxsWWVhciA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICByZXR1cm4gbHBhZChkLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKSwgNCwgXCIwXCIpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgbW9udGggPSBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgcmV0dXJuIGxwYWQoKGQuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGRheSA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICByZXR1cm4gbHBhZChkLmdldERhdGUoKS50b1N0cmluZygpLCAyLCBcIjBcIik7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBob3VycyA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICByZXR1cm4gbHBhZChkLmdldEhvdXJzKCkudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgbWludXRlcyA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICByZXR1cm4gbHBhZChkLmdldE1pbnV0ZXMoKS50b1N0cmluZygpLCAyLCBcIjBcIik7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBzZWNvbmRzID0gZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgIHJldHVybiBscGFkKGQuZ2V0U2Vjb25kcygpLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG1pbGxpcyA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICByZXR1cm4gbHBhZChkLmdldE1pbGxpc2Vjb25kcygpLnRvU3RyaW5nKCksIDMsIFwiMFwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGRhdGVTZXBhcmF0b3IgPSBkYXRlRm9ybWF0LmRhdGVTZXBhcmF0b3I7XG4gICAgICAgIHZhciBkcyA9IFwiXCI7XG4gICAgICAgIHN3aXRjaCAoZGF0ZUZvcm1hdC5mb3JtYXRFbnVtKSB7XG4gICAgICAgICAgICBjYXNlIExvZ2dlck9wdGlvbnNfMS5EYXRlRm9ybWF0RW51bS5EZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIHl5eXktbW0tZGQgaGg6bW06c3MsbVxuICAgICAgICAgICAgICAgIGRzID0gZnVsbFllYXIoZGF0ZSkgKyBkYXRlU2VwYXJhdG9yICsgbW9udGgoZGF0ZSkgKyBkYXRlU2VwYXJhdG9yICsgZGF5KGRhdGUpICsgXCIgXCIgK1xuICAgICAgICAgICAgICAgICAgICBob3VycyhkYXRlKSArIFwiOlwiICsgbWludXRlcyhkYXRlKSArIFwiOlwiICsgc2Vjb25kcyhkYXRlKSArIFwiLFwiICsgbWlsbGlzKGRhdGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBMb2dnZXJPcHRpb25zXzEuRGF0ZUZvcm1hdEVudW0uWWVhck1vbnRoRGF5VGltZTpcbiAgICAgICAgICAgICAgICBkcyA9IGZ1bGxZZWFyKGRhdGUpICsgZGF0ZVNlcGFyYXRvciArIG1vbnRoKGRhdGUpICsgZGF0ZVNlcGFyYXRvciArIGRheShkYXRlKSArIFwiIFwiICtcbiAgICAgICAgICAgICAgICAgICAgaG91cnMoZGF0ZSkgKyBcIjpcIiArIG1pbnV0ZXMoZGF0ZSkgKyBcIjpcIiArIHNlY29uZHMoZGF0ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIExvZ2dlck9wdGlvbnNfMS5EYXRlRm9ybWF0RW51bS5ZZWFyRGF5TW9udGhXaXRoRnVsbFRpbWU6XG4gICAgICAgICAgICAgICAgZHMgPSBmdWxsWWVhcihkYXRlKSArIGRhdGVTZXBhcmF0b3IgKyBkYXkoZGF0ZSkgKyBkYXRlU2VwYXJhdG9yICsgbW9udGgoZGF0ZSkgKyBcIiBcIiArXG4gICAgICAgICAgICAgICAgICAgIGhvdXJzKGRhdGUpICsgXCI6XCIgKyBtaW51dGVzKGRhdGUpICsgXCI6XCIgKyBzZWNvbmRzKGRhdGUpICsgXCIsXCIgKyBtaWxsaXMoZGF0ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIExvZ2dlck9wdGlvbnNfMS5EYXRlRm9ybWF0RW51bS5ZZWFyRGF5TW9udGhUaW1lOlxuICAgICAgICAgICAgICAgIGRzID0gZnVsbFllYXIoZGF0ZSkgKyBkYXRlU2VwYXJhdG9yICsgZGF5KGRhdGUpICsgZGF0ZVNlcGFyYXRvciArIG1vbnRoKGRhdGUpICsgXCIgXCIgK1xuICAgICAgICAgICAgICAgICAgICBob3VycyhkYXRlKSArIFwiOlwiICsgbWludXRlcyhkYXRlKSArIFwiOlwiICsgc2Vjb25kcyhkYXRlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5zdXBwb3J0ZWQgZGF0ZSBmb3JtYXQgZW51bTogXCIgKyBkYXRlRm9ybWF0LmZvcm1hdEVudW0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkcztcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlbmRlcnMgZ2l2ZW4gY2F0ZWdvcnkgbG9nIG1lc3NhZ2UgaW4gZGVmYXVsdCBmb3JtYXQuXG4gICAgICogQHBhcmFtIG1zZyBNZXNzYWdlIHRvIGZvcm1hdFxuICAgICAqIEBwYXJhbSBhZGRTdGFjayBJZiB0cnVlIGFkZHMgdGhlIHN0YWNrIHRvIHRoZSBvdXRwdXQsIG90aGVyd2lzZSBza2lwcyBpdFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IEZvcm1hdHRlZCBtZXNzYWdlXG4gICAgICovXG4gICAgTWVzc2FnZUZvcm1hdFV0aWxzLnJlbmRlckRlZmF1bHRNZXNzYWdlID0gZnVuY3Rpb24gKG1zZywgYWRkU3RhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFwiXCI7XG4gICAgICAgIHZhciBsb2dGb3JtYXQgPSBtc2cubG9nRm9ybWF0O1xuICAgICAgICBpZiAobG9nRm9ybWF0LnNob3dUaW1lU3RhbXApIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBNZXNzYWdlRm9ybWF0VXRpbHMucmVuZGVyRGF0ZShtc2cuZGF0ZSwgbG9nRm9ybWF0LmRhdGVGb3JtYXQpICsgXCIgXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ICs9IExvZ2dlck9wdGlvbnNfMS5Mb2dMZXZlbFttc2cubGV2ZWxdLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIGlmIChtc2cuaXNSZXNvbHZlZEVycm9yTWVzc2FnZSkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IFwiIChyZXNvbHZlZClcIjtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gXCIgXCI7XG4gICAgICAgIGlmIChsb2dGb3JtYXQuc2hvd0NhdGVnb3J5TmFtZSkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IFwiW1wiO1xuICAgICAgICAgICAgbXNnLmNhdGVnb3JpZXMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGlkeCkge1xuICAgICAgICAgICAgICAgIGlmIChpZHggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBcIiwgXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSB2YWx1ZS5uYW1lO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXN1bHQgKz0gXCJdXCI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gR2V0IHRoZSBub3JtYWwgc3RyaW5nIG1lc3NhZ2UgZmlyc3RcbiAgICAgICAgdmFyIGFjdHVhbFN0cmluZ01zZyA9IFwiXCI7XG4gICAgICAgIHZhciBkYXRhU3RyaW5nID0gXCJcIjtcbiAgICAgICAgdmFyIG1lc3NhZ2VPckxvZ0RhdGEgPSBtc2cubWVzc2FnZTtcbiAgICAgICAgaWYgKHR5cGVvZiBtZXNzYWdlT3JMb2dEYXRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBhY3R1YWxTdHJpbmdNc2cgPSBtZXNzYWdlT3JMb2dEYXRhO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGxvZ0RhdGEgPSBtZXNzYWdlT3JMb2dEYXRhO1xuICAgICAgICAgICAgYWN0dWFsU3RyaW5nTXNnID0gbG9nRGF0YS5tc2c7XG4gICAgICAgICAgICAvLyBXZSBkbyBoYXZlIGRhdGE/XG4gICAgICAgICAgICBpZiAobG9nRGF0YS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgZGF0YVN0cmluZyA9IFwiIFtkYXRhXTogXCIgKyAobG9nRGF0YS5kcyA/IGxvZ0RhdGEuZHMobG9nRGF0YS5kYXRhKSA6IEpTT04uc3RyaW5naWZ5KGxvZ0RhdGEuZGF0YSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSBcIiBcIiArIGFjdHVhbFN0cmluZ01zZyArIFwiXCIgKyBkYXRhU3RyaW5nO1xuICAgICAgICBpZiAoYWRkU3RhY2sgJiYgbXNnLmVycm9yQXNTdGFjayAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IFwiXFxuXCIgKyBtc2cuZXJyb3JBc1N0YWNrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW5kZXJzIGdpdmVuIGxvZzRqIGxvZyBtZXNzYWdlIGluIGRlZmF1bHQgZm9ybWF0LlxuICAgICAqIEBwYXJhbSBtc2cgTWVzc2FnZSB0byBmb3JtYXRcbiAgICAgKiBAcGFyYW0gYWRkU3RhY2sgSWYgdHJ1ZSBhZGRzIHRoZSBzdGFjayB0byB0aGUgb3V0cHV0LCBvdGhlcndpc2Ugc2tpcHMgaXRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBGb3JtYXR0ZWQgbWVzc2FnZVxuICAgICAqL1xuICAgIE1lc3NhZ2VGb3JtYXRVdGlscy5yZW5kZXJEZWZhdWx0TG9nNGpNZXNzYWdlID0gZnVuY3Rpb24gKG1zZywgYWRkU3RhY2spIHtcbiAgICAgICAgdmFyIGZvcm1hdCA9IG1zZy5sb2dHcm91cFJ1bGUubG9nRm9ybWF0O1xuICAgICAgICB2YXIgcmVzdWx0ID0gXCJcIjtcbiAgICAgICAgaWYgKGZvcm1hdC5zaG93VGltZVN0YW1wKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gTWVzc2FnZUZvcm1hdFV0aWxzLnJlbmRlckRhdGUobXNnLmRhdGUsIGZvcm1hdC5kYXRlRm9ybWF0KSArIFwiIFwiO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSBMb2dnZXJPcHRpb25zXzEuTG9nTGV2ZWxbbXNnLmxldmVsXS50b1VwcGVyQ2FzZSgpICsgXCIgXCI7XG4gICAgICAgIGlmIChmb3JtYXQuc2hvd0xvZ2dlck5hbWUpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBcIltcIiArIG1zZy5sb2dnZXJOYW1lICsgXCJdXCI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gR2V0IHRoZSBub3JtYWwgc3RyaW5nIG1lc3NhZ2UgZmlyc3RcbiAgICAgICAgdmFyIGFjdHVhbFN0cmluZ01zZyA9IFwiXCI7XG4gICAgICAgIHZhciBkYXRhU3RyaW5nID0gXCJcIjtcbiAgICAgICAgaWYgKHR5cGVvZiBtc2cubWVzc2FnZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgYWN0dWFsU3RyaW5nTXNnID0gbXNnLm1lc3NhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgbG9nRGF0YSA9IG1zZy5tZXNzYWdlO1xuICAgICAgICAgICAgYWN0dWFsU3RyaW5nTXNnID0gbG9nRGF0YS5tc2c7XG4gICAgICAgICAgICAvLyBXZSBkbyBoYXZlIGRhdGE/XG4gICAgICAgICAgICBpZiAobG9nRGF0YS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgZGF0YVN0cmluZyA9IFwiIFtkYXRhXTogXCIgKyAobG9nRGF0YS5kcyA/IGxvZ0RhdGEuZHMobG9nRGF0YS5kYXRhKSA6IEpTT04uc3RyaW5naWZ5KGxvZ0RhdGEuZGF0YSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSBcIiBcIiArIGFjdHVhbFN0cmluZ01zZyArIFwiXCIgKyBkYXRhU3RyaW5nO1xuICAgICAgICBpZiAoYWRkU3RhY2sgJiYgbXNnLmVycm9yQXNTdGFjayAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IFwiXFxuXCIgKyBtc2cuZXJyb3JBc1N0YWNrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZXJyb3IgYXMgc3RhY2tcbiAgICAgKiBAcGFyYW0gZXJyb3IgUmV0dXJuIGVycm9yIGFzIFByb21pc2VcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fFByb21pc2V9IFByb21pc2UgZm9yIHN0YWNrXG4gICAgICovXG4gICAgTWVzc2FnZUZvcm1hdFV0aWxzLnJlbmRlckVycm9yID0gZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBlcnJvci5uYW1lICsgXCI6IFwiICsgZXJyb3IubWVzc2FnZSArIFwiXFxuQFwiO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgb25lIGhhcyBhIHByb21pc2UgdG9vXG4gICAgICAgICAgICBTVC5mcm9tRXJyb3IoZXJyb3IsIHsgb2ZmbGluZTogdHJ1ZSB9KS50aGVuKGZ1bmN0aW9uIChmcmFtZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhY2tTdHIgPSAoZnJhbWVzLm1hcChmdW5jdGlvbiAoZnJhbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZyYW1lLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfSkpLmpvaW4oXCJcXG4gIFwiKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCJcXG5cIiArIHN0YWNrU3RyO1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgcmVzb2x2ZXMgb3VyIHJldHVybmVkIHByb21pc2VcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gXCJVbmV4cGVjdGVkIGVycm9yIG9iamVjdCB3YXMgcGFzc2VkIGluLiBcIjtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCJDb3VsZCBub3QgcmVzb2x2ZSBpdCwgc3RyaW5naWZpZWQgb2JqZWN0OiBcIiArIEpTT04uc3RyaW5naWZ5KGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2Fubm90IHN0cmluZ2lmeSBjYW4gb25seSB0ZWxsIHNvbWV0aGluZyB3YXMgd3JvbmcuXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBcIkNvdWxkIG5vdCByZXNvbHZlIGl0IG9yIHN0cmluZ2lmeSBpdC5cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIE1lc3NhZ2VGb3JtYXRVdGlscztcbn0oKSk7XG5leHBvcnRzLk1lc3NhZ2VGb3JtYXRVdGlscyA9IE1lc3NhZ2VGb3JtYXRVdGlscztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU1lc3NhZ2VVdGlscy5qcy5tYXAiLCIhZnVuY3Rpb24odCxlKXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZT9tb2R1bGUuZXhwb3J0cz1lKCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXSxlKTpcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9leHBvcnRzLkNzc1NlbGVjdG9yR2VuZXJhdG9yPWUoKTp0LkNzc1NlbGVjdG9yR2VuZXJhdG9yPWUoKX0oc2VsZiwoKCk9PigoKT0+e1widXNlIHN0cmljdFwiO3ZhciB0LGUsbj17ZDoodCxlKT0+e2Zvcih2YXIgbyBpbiBlKW4ubyhlLG8pJiYhbi5vKHQsbykmJk9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LG8se2VudW1lcmFibGU6ITAsZ2V0OmVbb119KX0sbzoodCxlKT0+T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsZSkscjp0PT57XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmU3ltYm9sLnRvU3RyaW5nVGFnJiZPYmplY3QuZGVmaW5lUHJvcGVydHkodCxTeW1ib2wudG9TdHJpbmdUYWcse3ZhbHVlOlwiTW9kdWxlXCJ9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KX19LG89e307ZnVuY3Rpb24gcih0KXtyZXR1cm4gdCYmdCBpbnN0YW5jZW9mIEVsZW1lbnR9ZnVuY3Rpb24gaSh0PVwidW5rbm93biBwcm9ibGVtXCIsLi4uZSl7Y29uc29sZS53YXJuKGBDc3NTZWxlY3RvckdlbmVyYXRvcjogJHt0fWAsLi4uZSl9bi5yKG8pLG4uZChvLHtkZWZhdWx0OigpPT56LGdldENzc1NlbGVjdG9yOigpPT5VfSksZnVuY3Rpb24odCl7dC5OT05FPVwibm9uZVwiLHQuREVTQ0VOREFOVD1cImRlc2NlbmRhbnRcIix0LkNISUxEPVwiY2hpbGRcIn0odHx8KHQ9e30pKSxmdW5jdGlvbih0KXt0LmlkPVwiaWRcIix0LmNsYXNzPVwiY2xhc3NcIix0LnRhZz1cInRhZ1wiLHQuYXR0cmlidXRlPVwiYXR0cmlidXRlXCIsdC5udGhjaGlsZD1cIm50aGNoaWxkXCIsdC5udGhvZnR5cGU9XCJudGhvZnR5cGVcIn0oZXx8KGU9e30pKTtjb25zdCBjPXtzZWxlY3RvcnM6W2UuaWQsZS5jbGFzcyxlLnRhZyxlLmF0dHJpYnV0ZV0saW5jbHVkZVRhZzohMSx3aGl0ZWxpc3Q6W10sYmxhY2tsaXN0OltdLGNvbWJpbmVXaXRoaW5TZWxlY3RvcjohMCxjb21iaW5lQmV0d2VlblNlbGVjdG9yczohMCxyb290Om51bGwsbWF4Q29tYmluYXRpb25zOk51bWJlci5QT1NJVElWRV9JTkZJTklUWSxtYXhDYW5kaWRhdGVzOk51bWJlci5QT1NJVElWRV9JTkZJTklUWX07ZnVuY3Rpb24gdSh0KXtyZXR1cm4gdCBpbnN0YW5jZW9mIFJlZ0V4cH1mdW5jdGlvbiBzKHQpe3JldHVybltcInN0cmluZ1wiLFwiZnVuY3Rpb25cIl0uaW5jbHVkZXModHlwZW9mIHQpfHx1KHQpfWZ1bmN0aW9uIGwodCl7cmV0dXJuIEFycmF5LmlzQXJyYXkodCk/dC5maWx0ZXIocyk6W119ZnVuY3Rpb24gYSh0KXtjb25zdCBlPVtOb2RlLkRPQ1VNRU5UX05PREUsTm9kZS5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFLE5vZGUuRUxFTUVOVF9OT0RFXTtyZXR1cm4gZnVuY3Rpb24odCl7cmV0dXJuIHQgaW5zdGFuY2VvZiBOb2RlfSh0KSYmZS5pbmNsdWRlcyh0Lm5vZGVUeXBlKX1mdW5jdGlvbiBmKHQsZSl7aWYoYSh0KSlyZXR1cm4gdC5jb250YWlucyhlKXx8aShcImVsZW1lbnQgcm9vdCBtaXNtYXRjaFwiLFwiUHJvdmlkZWQgcm9vdCBkb2VzIG5vdCBjb250YWluIHRoZSBlbGVtZW50LiBUaGlzIHdpbGwgbW9zdCBsaWtlbHkgcmVzdWx0IGluIHByb2R1Y2luZyBhIGZhbGxiYWNrIHNlbGVjdG9yIHVzaW5nIGVsZW1lbnQncyByZWFsIHJvb3Qgbm9kZS4gSWYgeW91IHBsYW4gdG8gdXNlIHRoZSBzZWxlY3RvciB1c2luZyBwcm92aWRlZCByb290IChlLmcuIGByb290LnF1ZXJ5U2VsZWN0b3JgKSwgaXQgd2lsbCBudG8gd29yayBhcyBpbnRlbmRlZC5cIiksdDtjb25zdCBuPWUuZ2V0Um9vdE5vZGUoe2NvbXBvc2VkOiExfSk7cmV0dXJuIGEobik/KG4hPT1kb2N1bWVudCYmaShcInNoYWRvdyByb290IGluZmVycmVkXCIsXCJZb3UgZGlkIG5vdCBwcm92aWRlIGEgcm9vdCBhbmQgdGhlIGVsZW1lbnQgaXMgYSBjaGlsZCBvZiBTaGFkb3cgRE9NLiBUaGlzIHdpbGwgcHJvZHVjZSBhIHNlbGVjdG9yIHVzaW5nIFNoYWRvd1Jvb3QgYXMgYSByb290LiBJZiB5b3UgcGxhbiB0byB1c2UgdGhlIHNlbGVjdG9yIHVzaW5nIGRvY3VtZW50IGFzIGEgcm9vdCAoZS5nLiBgZG9jdW1lbnQucXVlcnlTZWxlY3RvcmApLCBpdCB3aWxsIG5vdCB3b3JrIGFzIGludGVuZGVkLlwiKSxuKTplLm93bmVyRG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIjpyb290XCIpfWZ1bmN0aW9uIGQodCl7cmV0dXJuXCJudW1iZXJcIj09dHlwZW9mIHQ/dDpOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFl9ZnVuY3Rpb24gbSh0PVtdKXtjb25zdFtlPVtdLC4uLm5dPXQ7cmV0dXJuIDA9PT1uLmxlbmd0aD9lOm4ucmVkdWNlKCgodCxlKT0+dC5maWx0ZXIoKHQ9PmUuaW5jbHVkZXModCkpKSksZSl9ZnVuY3Rpb24gcCh0KXtyZXR1cm5bXS5jb25jYXQoLi4udCl9ZnVuY3Rpb24gaCh0KXtjb25zdCBlPXQubWFwKCh0PT57aWYodSh0KSlyZXR1cm4gZT0+dC50ZXN0KGUpO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIHQpcmV0dXJuIGU9Pntjb25zdCBuPXQoZSk7cmV0dXJuXCJib29sZWFuXCIhPXR5cGVvZiBuPyhpKFwicGF0dGVybiBtYXRjaGVyIGZ1bmN0aW9uIGludmFsaWRcIixcIlByb3ZpZGVkIHBhdHRlcm4gbWF0Y2hpbmcgZnVuY3Rpb24gZG9lcyBub3QgcmV0dXJuIGJvb2xlYW4uIEl0J3MgcmVzdWx0IHdpbGwgYmUgaWdub3JlZC5cIix0KSwhMSk6bn07aWYoXCJzdHJpbmdcIj09dHlwZW9mIHQpe2NvbnN0IGU9bmV3IFJlZ0V4cChcIl5cIit0LnJlcGxhY2UoL1t8XFxcXHt9KClbXFxdXiQrPy5dL2csXCJcXFxcJCZcIikucmVwbGFjZSgvXFwqL2csXCIuK1wiKStcIiRcIik7cmV0dXJuIHQ9PmUudGVzdCh0KX1yZXR1cm4gaShcInBhdHRlcm4gbWF0Y2hlciBpbnZhbGlkXCIsXCJQYXR0ZXJuIG1hdGNoaW5nIG9ubHkgYWNjZXB0cyBzdHJpbmdzLCByZWd1bGFyIGV4cHJlc3Npb25zIGFuZC9vciBmdW5jdGlvbnMuIFRoaXMgaXRlbSBpcyBpbnZhbGlkIGFuZCB3aWxsIGJlIGlnbm9yZWQuXCIsdCksKCk9PiExfSkpO3JldHVybiB0PT5lLnNvbWUoKGU9PmUodCkpKX1mdW5jdGlvbiBnKHQsZSxuKXtjb25zdCBvPUFycmF5LmZyb20oZihuLHRbMF0pLnF1ZXJ5U2VsZWN0b3JBbGwoZSkpO3JldHVybiBvLmxlbmd0aD09PXQubGVuZ3RoJiZ0LmV2ZXJ5KCh0PT5vLmluY2x1ZGVzKHQpKSl9ZnVuY3Rpb24geSh0LGUpe2U9bnVsbCE9ZT9lOmZ1bmN0aW9uKHQpe3JldHVybiB0Lm93bmVyRG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIjpyb290XCIpfSh0KTtjb25zdCBuPVtdO2xldCBvPXQ7Zm9yKDtyKG8pJiZvIT09ZTspbi5wdXNoKG8pLG89by5wYXJlbnRFbGVtZW50O3JldHVybiBufWZ1bmN0aW9uIGIodCxlKXtyZXR1cm4gbSh0Lm1hcCgodD0+eSh0LGUpKSkpfWNvbnN0IE49e1t0Lk5PTkVdOnt0eXBlOnQuTk9ORSx2YWx1ZTpcIlwifSxbdC5ERVNDRU5EQU5UXTp7dHlwZTp0LkRFU0NFTkRBTlQsdmFsdWU6XCIgPiBcIn0sW3QuQ0hJTERdOnt0eXBlOnQuQ0hJTEQsdmFsdWU6XCIgXCJ9fSxTPW5ldyBSZWdFeHAoW1wiXiRcIixcIlxcXFxzXCJdLmpvaW4oXCJ8XCIpKSxFPW5ldyBSZWdFeHAoW1wiXiRcIl0uam9pbihcInxcIikpLHc9W2UubnRob2Z0eXBlLGUudGFnLGUuaWQsZS5jbGFzcyxlLmF0dHJpYnV0ZSxlLm50aGNoaWxkXSx2PWgoW1wiY2xhc3NcIixcImlkXCIsXCJuZy0qXCJdKTtmdW5jdGlvbiBDKHtub2RlTmFtZTp0fSl7cmV0dXJuYFske3R9XWB9ZnVuY3Rpb24gTyh7bm9kZU5hbWU6dCxub2RlVmFsdWU6ZX0pe3JldHVybmBbJHt0fT0nJHtMKGUpfSddYH1mdW5jdGlvbiBUKHQpe2NvbnN0IGU9QXJyYXkuZnJvbSh0LmF0dHJpYnV0ZXMpLmZpbHRlcigoZT0+ZnVuY3Rpb24oe25vZGVOYW1lOnR9LGUpe2NvbnN0IG49ZS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7cmV0dXJuIShbXCJpbnB1dFwiLFwib3B0aW9uXCJdLmluY2x1ZGVzKG4pJiZcInZhbHVlXCI9PT10fHx2KHQpKX0oZSx0KSkpO3JldHVyblsuLi5lLm1hcChDKSwuLi5lLm1hcChPKV19ZnVuY3Rpb24gSSh0KXtyZXR1cm4odC5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKXx8XCJcIikudHJpbSgpLnNwbGl0KC9cXHMrLykuZmlsdGVyKCh0PT4hRS50ZXN0KHQpKSkubWFwKCh0PT5gLiR7TCh0KX1gKSl9ZnVuY3Rpb24geCh0KXtjb25zdCBlPXQuZ2V0QXR0cmlidXRlKFwiaWRcIil8fFwiXCIsbj1gIyR7TChlKX1gLG89dC5nZXRSb290Tm9kZSh7Y29tcG9zZWQ6ITF9KTtyZXR1cm4hUy50ZXN0KGUpJiZnKFt0XSxuLG8pP1tuXTpbXX1mdW5jdGlvbiBqKHQpe2NvbnN0IGU9dC5wYXJlbnROb2RlO2lmKGUpe2NvbnN0IG49QXJyYXkuZnJvbShlLmNoaWxkTm9kZXMpLmZpbHRlcihyKS5pbmRleE9mKHQpO2lmKG4+LTEpcmV0dXJuW2A6bnRoLWNoaWxkKCR7bisxfSlgXX1yZXR1cm5bXX1mdW5jdGlvbiBBKHQpe3JldHVybltMKHQudGFnTmFtZS50b0xvd2VyQ2FzZSgpKV19ZnVuY3Rpb24gRCh0KXtjb25zdCBlPVsuLi5uZXcgU2V0KHAodC5tYXAoQSkpKV07cmV0dXJuIDA9PT1lLmxlbmd0aHx8ZS5sZW5ndGg+MT9bXTpbZVswXV19ZnVuY3Rpb24gJCh0KXtjb25zdCBlPUQoW3RdKVswXSxuPXQucGFyZW50RWxlbWVudDtpZihuKXtjb25zdCBvPUFycmF5LmZyb20obi5jaGlsZHJlbikuZmlsdGVyKCh0PT50LnRhZ05hbWUudG9Mb3dlckNhc2UoKT09PWUpKSxyPW8uaW5kZXhPZih0KTtpZihyPi0xKXJldHVybltgJHtlfTpudGgtb2YtdHlwZSgke3IrMX0pYF19cmV0dXJuW119ZnVuY3Rpb24gUih0PVtdLHttYXhSZXN1bHRzOmU9TnVtYmVyLlBPU0lUSVZFX0lORklOSVRZfT17fSl7Y29uc3Qgbj1bXTtsZXQgbz0wLHI9aygxKTtmb3IoO3IubGVuZ3RoPD10Lmxlbmd0aCYmbzxlOylvKz0xLG4ucHVzaChyLm1hcCgoZT0+dFtlXSkpKSxyPVAocix0Lmxlbmd0aC0xKTtyZXR1cm4gbn1mdW5jdGlvbiBQKHQ9W10sZT0wKXtjb25zdCBuPXQubGVuZ3RoO2lmKDA9PT1uKXJldHVybltdO2NvbnN0IG89Wy4uLnRdO29bbi0xXSs9MTtmb3IobGV0IHQ9bi0xO3Q+PTA7dC0tKWlmKG9bdF0+ZSl7aWYoMD09PXQpcmV0dXJuIGsobisxKTtvW3QtMV0rKyxvW3RdPW9bdC0xXSsxfXJldHVybiBvW24tMV0+ZT9rKG4rMSk6b31mdW5jdGlvbiBrKHQ9MSl7cmV0dXJuIEFycmF5LmZyb20oQXJyYXkodCkua2V5cygpKX1jb25zdCBfPVwiOlwiLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCksTT0vWyAhXCIjJCUmJygpXFxbXFxde3x9PD4qKywuLzs9P0BeYH5cXFxcXS87ZnVuY3Rpb24gTCh0PVwiXCIpe3ZhciBlLG47cmV0dXJuIG51bGwhPT0obj1udWxsPT09KGU9bnVsbD09PUNTU3x8dm9pZCAwPT09Q1NTP3ZvaWQgMDpDU1MuZXNjYXBlKXx8dm9pZCAwPT09ZT92b2lkIDA6ZS5jYWxsKENTUyx0KSkmJnZvaWQgMCE9PW4/bjpmdW5jdGlvbih0PVwiXCIpe3JldHVybiB0LnNwbGl0KFwiXCIpLm1hcCgodD0+XCI6XCI9PT10P2BcXFxcJHtffSBgOk0udGVzdCh0KT9gXFxcXCR7dH1gOmVzY2FwZSh0KS5yZXBsYWNlKC8lL2csXCJcXFxcXCIpKSkuam9pbihcIlwiKX0odCl9Y29uc3QgcT17dGFnOkQsaWQ6ZnVuY3Rpb24odCl7cmV0dXJuIDA9PT10Lmxlbmd0aHx8dC5sZW5ndGg+MT9bXTp4KHRbMF0pfSxjbGFzczpmdW5jdGlvbih0KXtyZXR1cm4gbSh0Lm1hcChJKSl9LGF0dHJpYnV0ZTpmdW5jdGlvbih0KXtyZXR1cm4gbSh0Lm1hcChUKSl9LG50aGNoaWxkOmZ1bmN0aW9uKHQpe3JldHVybiBtKHQubWFwKGopKX0sbnRob2Z0eXBlOmZ1bmN0aW9uKHQpe3JldHVybiBtKHQubWFwKCQpKX19LEY9e3RhZzpBLGlkOngsY2xhc3M6SSxhdHRyaWJ1dGU6VCxudGhjaGlsZDpqLG50aG9mdHlwZTokfTtmdW5jdGlvbiBWKHQpe3JldHVybiB0LmluY2x1ZGVzKGUudGFnKXx8dC5pbmNsdWRlcyhlLm50aG9mdHlwZSk/Wy4uLnRdOlsuLi50LGUudGFnXX1mdW5jdGlvbiBZKHQ9e30pe2NvbnN0IG49Wy4uLnddO3JldHVybiB0W2UudGFnXSYmdFtlLm50aG9mdHlwZV0mJm4uc3BsaWNlKG4uaW5kZXhPZihlLnRhZyksMSksbi5tYXAoKGU9PntyZXR1cm4obz10KVtuPWVdP29bbl0uam9pbihcIlwiKTpcIlwiO3ZhciBuLG99KSkuam9pbihcIlwiKX1mdW5jdGlvbiBCKHQsZSxuPVwiXCIsbyl7Y29uc3Qgcj1mdW5jdGlvbih0LGUpe3JldHVyblwiXCI9PT1lP3Q6ZnVuY3Rpb24odCxlKXtyZXR1cm5bLi4udC5tYXAoKHQ9PmUrXCIgXCIrdCkpLC4uLnQubWFwKCh0PT5lK1wiID4gXCIrdCkpXX0odCxlKX0oZnVuY3Rpb24odCxlLG4pe2NvbnN0IG89ZnVuY3Rpb24odCxlKXtjb25zdHtibGFja2xpc3Q6bix3aGl0ZWxpc3Q6byxjb21iaW5lV2l0aGluU2VsZWN0b3I6cixtYXhDb21iaW5hdGlvbnM6aX09ZSxjPWgobiksdT1oKG8pO3JldHVybiBmdW5jdGlvbih0KXtjb25zdHtzZWxlY3RvcnM6ZSxpbmNsdWRlVGFnOm59PXQsbz1bXS5jb25jYXQoZSk7cmV0dXJuIG4mJiFvLmluY2x1ZGVzKFwidGFnXCIpJiZvLnB1c2goXCJ0YWdcIiksb30oZSkucmVkdWNlKCgoZSxuKT0+e2NvbnN0IG89ZnVuY3Rpb24odCxlKXt2YXIgbjtyZXR1cm4obnVsbCE9PShuPXFbZV0pJiZ2b2lkIDAhPT1uP246KCk9PltdKSh0KX0odCxuKSxzPWZ1bmN0aW9uKHQ9W10sZSxuKXtyZXR1cm4gdC5maWx0ZXIoKHQ9Pm4odCl8fCFlKHQpKSl9KG8sYyx1KSxsPWZ1bmN0aW9uKHQ9W10sZSl7cmV0dXJuIHQuc29ydCgoKHQsbik9Pntjb25zdCBvPWUodCkscj1lKG4pO3JldHVybiBvJiYhcj8tMTohbyYmcj8xOjB9KSl9KHMsdSk7cmV0dXJuIGVbbl09cj9SKGwse21heFJlc3VsdHM6aX0pOmwubWFwKCh0PT5bdF0pKSxlfSkse30pfSh0LG4pLHI9ZnVuY3Rpb24odCxlKXtyZXR1cm4gZnVuY3Rpb24odCl7Y29uc3R7c2VsZWN0b3JzOmUsY29tYmluZUJldHdlZW5TZWxlY3RvcnM6bixpbmNsdWRlVGFnOm8sbWF4Q2FuZGlkYXRlczpyfT10LGk9bj9SKGUse21heFJlc3VsdHM6cn0pOmUubWFwKCh0PT5bdF0pKTtyZXR1cm4gbz9pLm1hcChWKTppfShlKS5tYXAoKGU9PmZ1bmN0aW9uKHQsZSl7Y29uc3Qgbj17fTtyZXR1cm4gdC5mb3JFYWNoKCh0PT57Y29uc3Qgbz1lW3RdO28ubGVuZ3RoPjAmJihuW3RdPW8pfSkpLGZ1bmN0aW9uKHQ9e30pe2xldCBlPVtdO3JldHVybiBPYmplY3QuZW50cmllcyh0KS5mb3JFYWNoKCgoW3Qsbl0pPT57ZT1uLmZsYXRNYXAoKG49PjA9PT1lLmxlbmd0aD9be1t0XTpufV06ZS5tYXAoKGU9Pk9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSxlKSx7W3RdOm59KSkpKSl9KSksZX0obikubWFwKFkpfShlLHQpKSkuZmlsdGVyKCh0PT50Lmxlbmd0aD4wKSl9KG8sbiksaT1wKHIpO3JldHVyblsuLi5uZXcgU2V0KGkpXX0odCxvLnJvb3Qsbyksbik7Zm9yKGNvbnN0IGUgb2YgcilpZihnKHQsZSxvLnJvb3QpKXJldHVybiBlO3JldHVybiBudWxsfWZ1bmN0aW9uIEcodCl7cmV0dXJue3ZhbHVlOnQsaW5jbHVkZTohMX19ZnVuY3Rpb24gVyh7c2VsZWN0b3JzOnQsb3BlcmF0b3I6bn0pe2xldCBvPVsuLi53XTt0W2UudGFnXSYmdFtlLm50aG9mdHlwZV0mJihvPW8uZmlsdGVyKCh0PT50IT09ZS50YWcpKSk7bGV0IHI9XCJcIjtyZXR1cm4gby5mb3JFYWNoKChlPT57KHRbZV18fFtdKS5mb3JFYWNoKCgoe3ZhbHVlOnQsaW5jbHVkZTplfSk9PntlJiYocis9dCl9KSl9KSksbi52YWx1ZStyfWZ1bmN0aW9uIEgobil7cmV0dXJuW1wiOnJvb3RcIiwuLi55KG4pLnJldmVyc2UoKS5tYXAoKG49Pntjb25zdCBvPWZ1bmN0aW9uKGUsbixvPXQuTk9ORSl7Y29uc3Qgcj17fTtyZXR1cm4gbi5mb3JFYWNoKCh0PT57UmVmbGVjdC5zZXQocix0LGZ1bmN0aW9uKHQsZSl7cmV0dXJuIEZbZV0odCl9KGUsdCkubWFwKEcpKX0pKSx7ZWxlbWVudDplLG9wZXJhdG9yOk5bb10sc2VsZWN0b3JzOnJ9fShuLFtlLm50aGNoaWxkXSx0LkRFU0NFTkRBTlQpO3JldHVybiBvLnNlbGVjdG9ycy5udGhjaGlsZC5mb3JFYWNoKCh0PT57dC5pbmNsdWRlPSEwfSkpLG99KSkubWFwKFcpXS5qb2luKFwiXCIpfWZ1bmN0aW9uIFUodCxuPXt9KXtjb25zdCBvPWZ1bmN0aW9uKHQpe2NvbnN0IGU9KEFycmF5LmlzQXJyYXkodCk/dDpbdF0pLmZpbHRlcihyKTtyZXR1cm5bLi4ubmV3IFNldChlKV19KHQpLGk9ZnVuY3Rpb24odCxuPXt9KXtjb25zdCBvPU9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSxjKSxuKTtyZXR1cm57c2VsZWN0b3JzOihyPW8uc2VsZWN0b3JzLEFycmF5LmlzQXJyYXkocik/ci5maWx0ZXIoKHQ9PntyZXR1cm4gbj1lLG89dCxPYmplY3QudmFsdWVzKG4pLmluY2x1ZGVzKG8pO3ZhciBuLG99KSk6W10pLHdoaXRlbGlzdDpsKG8ud2hpdGVsaXN0KSxibGFja2xpc3Q6bChvLmJsYWNrbGlzdCkscm9vdDpmKG8ucm9vdCx0KSxjb21iaW5lV2l0aGluU2VsZWN0b3I6ISFvLmNvbWJpbmVXaXRoaW5TZWxlY3Rvcixjb21iaW5lQmV0d2VlblNlbGVjdG9yczohIW8uY29tYmluZUJldHdlZW5TZWxlY3RvcnMsaW5jbHVkZVRhZzohIW8uaW5jbHVkZVRhZyxtYXhDb21iaW5hdGlvbnM6ZChvLm1heENvbWJpbmF0aW9ucyksbWF4Q2FuZGlkYXRlczpkKG8ubWF4Q2FuZGlkYXRlcyl9O3ZhciByfShvWzBdLG4pO2xldCB1PVwiXCIscz1pLnJvb3Q7ZnVuY3Rpb24gYSgpe3JldHVybiBmdW5jdGlvbih0LGUsbj1cIlwiLG8pe2lmKDA9PT10Lmxlbmd0aClyZXR1cm4gbnVsbDtjb25zdCByPVt0Lmxlbmd0aD4xP3Q6W10sLi4uYih0LGUpLm1hcCgodD0+W3RdKSldO2Zvcihjb25zdCB0IG9mIHIpe2NvbnN0IGU9Qih0LDAsbixvKTtpZihlKXJldHVybntmb3VuZEVsZW1lbnRzOnQsc2VsZWN0b3I6ZX19cmV0dXJuIG51bGx9KG8scyx1LGkpfWxldCBtPWEoKTtmb3IoO207KXtjb25zdHtmb3VuZEVsZW1lbnRzOnQsc2VsZWN0b3I6ZX09bTtpZihnKG8sZSxpLnJvb3QpKXJldHVybiBlO3M9dFswXSx1PWUsbT1hKCl9cmV0dXJuIG8ubGVuZ3RoPjE/by5tYXAoKHQ9PlUodCxpKSkpLmpvaW4oXCIsIFwiKTpmdW5jdGlvbih0KXtyZXR1cm4gdC5tYXAoSCkuam9pbihcIiwgXCIpfShvKX1jb25zdCB6PVU7cmV0dXJuIG99KSgpKSk7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2luZGV4LnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9